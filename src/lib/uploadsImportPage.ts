/**
 * /api/uploads-import sayfası. Admin panelinin importMap'ine bağımlı olmamak
 * için React yerine düz HTML + tarayıcı JS'i kullanıyor.
 *
 * Arşiv parça parça gönderiliyor: proxy.ts istek gövdesini 10 MB'a kadar
 * tamponluyor, önde nginx varsa varsayılan sınır 1 MB. 413 ya da ağ hatasında
 * parça boyutu yarıya iniyor.
 */
export function renderImportPage(): string {
  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Görsel ve Doküman İçe Aktarma</title>
<style>
  body { font: 15px/1.5 system-ui, sans-serif; max-width: 820px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; }
  h1 { font-size: 22px; } h2 { font-size: 17px; margin-top: 32px; }
  table { border-collapse: collapse; width: 100%; } td, th { border: 1px solid #ddd; padding: 6px 10px; text-align: left; }
  .ok { color: #137333; } .bad { color: #b3261e; font-weight: 600; }
  progress { width: 100%; height: 18px; }
  button { font: inherit; padding: 8px 16px; cursor: pointer; }
  code, pre { background: #f4f4f4; padding: 2px 5px; border-radius: 3px; }
  pre { padding: 10px; white-space: pre-wrap; word-break: break-all; }
  #log { font-size: 13px; color: #555; }
</style>
</head>
<body>
<h1>Görsel ve Doküman İçe Aktarma</h1>
<p>Railway yedeğindeki <code>gyo_uploads.tgz</code> dosyasını seçin. Dosya parça parça yüklenir, ardından sunucuda
<code>media/</code> ve <code>documents/</code> klasörlerine açılır. Aynı isimli dosyaların üzerine yazılır, diğer dosyalara dokunulmaz.</p>

<h2>Durum</h2>
<div id="status">Yükleniyor…</div>

<h2>Arşivi yükle</h2>
<p><input type="file" id="file" accept=".tgz,.tar.gz,application/gzip"> <button id="start">Yükle ve aç</button></p>
<progress id="progress" value="0" max="1" hidden></progress>
<p id="message"></p>
<pre id="log" hidden></pre>

<script>
const endpoint = location.pathname
const $ = (id) => document.getElementById(id)
const headers = { 'x-gyo-import': '1' }

function el(tag, text, cls) {
  const node = document.createElement(tag)
  if (text !== undefined) node.textContent = text
  if (cls) node.className = cls
  return node
}

function row(table, label, value, cls) {
  const tr = el('tr')
  tr.append(el('th', label), el('td', value, cls))
  table.append(tr)
}

function mb(bytes) { return (bytes / 1048576).toFixed(1) + ' MB' }

async function loadStatus() {
  const res = await fetch(endpoint + '?format=json', { headers, cache: 'no-store' })
  if (!res.ok) { $('status').textContent = 'Durum okunamadı (' + res.status + ')'; return null }
  const s = await res.json()
  const table = el('table')
  row(table, 'Yükleme klasörü', s.uploadsRoot + '  (' + s.rootSource + ')')
  row(table, 'Yazılabilir', s.writable ? 'Evet' : 'Hayır – uygulama kullanıcısının yazma izni yok', s.writable ? 'ok' : 'bad')
  if (s.s3Enabled) row(table, 'Uyarı', 'S3_BUCKET tanımlı; dosyalar diskten değil S3’ten sunuluyor', 'bad')
  for (const [key, label] of [['media', 'Görseller'], ['documents', 'Dokümanlar']]) {
    const f = s.files[key]
    const text = 'Diskte ' + f.onDisk + ' dosya, veritabanının beklediği ' + f.referenced + ', eksik ' + f.missing
      + (f.missingSample.length ? '  (ör. ' + f.missingSample.slice(0, 3).join(', ') + ')' : '')
    row(table, label, text, f.missing === 0 ? 'ok' : 'bad')
  }
  if (s.nfsMounts.length) row(table, 'NFS bağlantıları', s.nfsMounts.map((m) => m.source + ' → ' + m.mountPoint).join('\\n'))
  if (s.partialSize) row(table, 'Yarım kalan yükleme', mb(s.partialSize))
  if (s.job.state !== 'idle') {
    row(table, 'Son işlem', s.job.step + (s.job.message ? ': ' + s.job.message : ''), s.job.state === 'error' ? 'bad' : s.job.state === 'done' ? 'ok' : '')
    if (s.job.sha256) row(table, 'Arşiv SHA-256', s.job.sha256)
  }
  $('status').replaceChildren(table)
  return s
}

function log(line) { $('log').hidden = false; $('log').textContent += line + '\\n' }

async function sendChunk(blob, offset) {
  const res = await fetch(endpoint + '?op=chunk&offset=' + offset, { method: 'POST', headers, body: blob })
  const body = await res.json().catch(() => ({}))
  return { res, body }
}

async function upload(file) {
  let chunkSize = 8 * 1048576
  const minChunk = 256 * 1024
  let offset = 0
  $('progress').hidden = false
  $('progress').max = file.size

  while (offset < file.size) {
    const blob = file.slice(offset, offset + chunkSize)
    let result
    try { result = await sendChunk(blob, offset) } catch (e) { result = { res: null, body: { error: String(e) } } }

    if (result.res && result.res.ok) {
      offset = result.body.size
      $('progress').value = offset
      $('message').textContent = 'Yükleniyor: ' + mb(offset) + ' / ' + mb(file.size)
      continue
    }
    if (result.res && result.res.status === 409 && typeof result.body.size === 'number') {
      log('Sunucudaki boyuta göre devam ediliyor: ' + mb(result.body.size))
      offset = result.body.size
      continue
    }
    if (chunkSize > minChunk && (!result.res || result.res.status === 413 || result.res.status >= 500)) {
      chunkSize = Math.max(minChunk, Math.floor(chunkSize / 2))
      log('Parça reddedildi (' + (result.res ? result.res.status : 'ağ hatası') + '), parça boyutu ' + mb(chunkSize) + ' yapıldı')
      continue
    }
    throw new Error(result.body.error || ('Yükleme hatası: ' + (result.res ? result.res.status : 'ağ hatası')))
  }
}

async function extract(size) {
  const res = await fetch(endpoint + '?op=extract&size=' + size, { method: 'POST', headers })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || ('Açma başlatılamadı: ' + res.status))

  for (;;) {
    await new Promise((r) => setTimeout(r, 2000))
    const s = await loadStatus()
    if (!s) continue
    $('message').textContent = s.job.step || ''
    if (s.job.state === 'done') return s
    if (s.job.state === 'error') throw new Error(s.job.message || 'Açma sırasında hata')
  }
}

$('start').addEventListener('click', async () => {
  const file = $('file').files[0]
  if (!file) { $('message').textContent = 'Önce bir dosya seçin.'; return }
  $('start').disabled = true
  $('message').className = ''
  try {
    await upload(file)
    $('message').textContent = 'Yükleme bitti, sunucuda açılıyor…'
    const s = await extract(file.size)
    const missing = s.files.media.missing + s.files.documents.missing
    $('message').textContent = missing === 0
      ? 'Tamamlandı. Veritabanının beklediği tüm dosyalar diskte.'
      : 'Arşiv açıldı ama ' + missing + ' dosya hâlâ eksik; yukarıdaki tabloya bakın.'
    $('message').className = missing === 0 ? 'ok' : 'bad'
  } catch (e) {
    $('message').textContent = e.message
    $('message').className = 'bad'
    loadStatus()
  } finally {
    $('start').disabled = false
  }
})

loadStatus()
</script>
</body>
</html>`
}
