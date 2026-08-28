/**
 * Eski URL'lerden yeni URL'lere 301 yönlendirme tablosunu üretir.
 *
 * Kaynaklar:
 *   - pages.legacyPaths  -> 106 adet *.aspx sayfa yolu
 *   - documents.originalPath / media.originalPath -> /gyo_files/... dosya yolları
 *   - elle tanımlı özel durumlar (default.aspx, arama.aspx, kök)
 *
 * Çıktı: src/redirects.generated.json (next.config.ts tarafından okunuyor)
 *
 * Kullanım: pnpm migrate:redirects
 */
import fs from 'fs/promises'
import path from 'path'
import { getPayload } from 'payload'

import config from '../../src/payload.config'
import { locales } from '../../src/lib/i18n'
import { REPORT_DIR } from './config'

/**
 * Kaynak yol -> hedef yol eşlemesi. Tam eşleşmeli bir harita olarak üretiyoruz;
 * next.config'in redirects() mekanizması path-to-regexp kullandığı için eski
 * dosya adlarındaki boşluk, parantez ve Türkçe karakterlerle baş edemiyor
 * (ör. "Faaliyet Raporu (2).pdf"). Yönlendirmeler proxy.ts içinde bu haritadan
 * O(1) sözlük aramasıyla yapılıyor.
 */
export type RedirectMap = Record<string, string>

const OUTPUT_FILE = path.resolve(process.cwd(), 'src/redirects.generated.json')

async function main() {
  const payload = await getPayload({ config })
  const map: RedirectMap = {}

  const add = (source: string, destination: string) => {
    if (!source || !destination || source === destination) return
    if (map[source]) return
    map[source] = destination
  }

  /* --- Sayfalar --- */
  const destinationsByLocale = new Map<string, Map<number, string>>()

  for (const locale of locales) {
    const { docs } = await payload.find({
      collection: 'pages',
      locale,
      depth: 3,
      limit: 500,
      pagination: false,
    })

    const byId = new Map<number, string>()
    for (const page of docs) {
      /*
       * Ana sayfanın kanonik adresi /tr ve /en. Slug'lı biçimler
       * (/tr/ana-sayfa, /en/home) aynı içeriği ikinci bir URL'den sunardı;
       * bunları kanonik adrese yönlendiriyoruz.
       */
      if (page.template === 'landing') {
        byId.set(page.id as number, `/${locale}`)
        add(buildPath(page, locale), `/${locale}`)
        continue
      }
      byId.set(page.id as number, buildPath(page, locale))
    }
    destinationsByLocale.set(locale, byId)
  }

  const { docs: allPages } = await payload.find({
    collection: 'pages',
    locale: 'tr',
    depth: 3,
    limit: 500,
    pagination: false,
  })

  for (const page of allPages) {
    for (const entry of page.legacyPaths ?? []) {
      if (!entry.path) continue

      /*
       * Eski yolun dil öneki hedefi belirliyor: /en/... yolları İngilizce
       * sürüme, /tr/... yolları Türkçe sürüme gitmeli. legacyPaths alanı
       * localized olmadığı için her iki dilin yolu aynı dokümanda duruyor.
       */
      const sourceLocale = entry.path.startsWith('/en/') ? 'en' : 'tr'
      const destination = destinationsByLocale.get(sourceLocale)?.get(page.id as number)
      if (!destination) continue

      add(entry.path, destination)
      add(entry.path.replace(/\.aspx$/i, ''), destination)
    }
  }

  /* --- Dokümanlar ve görseller --- */
  for (const collection of ['documents', 'media'] as const) {
    const { docs } = await payload.find({
      collection,
      limit: 1000,
      pagination: false,
      depth: 0,
    })

    for (const item of docs) {
      const original = (item as { originalPath?: string | null }).originalPath
      const url = (item as { url?: string | null }).url
      if (original && url) add(original, url)
    }
  }

  /* --- Özel durumlar --- */
  add('/default.aspx', '/tr')
  add('/tr.aspx', '/tr')
  add('/en.aspx', '/en')
  add('/arama.aspx', '/tr/arama')

  const sources = Object.keys(map)
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(map, null, 2), 'utf8')

  const aspxCount = sources.filter((source) => source.endsWith('.aspx')).length
  const fileCount = sources.filter((source) => source.startsWith('/gyo_files/')).length

  await fs.mkdir(REPORT_DIR, { recursive: true })
  await fs.writeFile(
    path.join(REPORT_DIR, 'redirects-summary.json'),
    JSON.stringify({ total: sources.length, pages: aspxCount, files: fileCount }, null, 2),
    'utf8',
  )

  console.log(`${sources.length} yönlendirme yazıldı -> ${OUTPUT_FILE}`)
  console.log(`  .aspx sayfa: ${aspxCount}`)
  console.log(`  /gyo_files dosya: ${fileCount}`)
  console.log(
    `  EN hedefli: ${Object.entries(map).filter(([s, d]) => s.startsWith('/en/') && d.startsWith('/en/')).length}`,
  )
  process.exit(0)
}

function buildPath(
  page: { slug: string; parent?: unknown },
  locale: string,
): string {
  const parts: string[] = [page.slug]
  let parent = page.parent
  while (parent && typeof parent === 'object') {
    const record = parent as { slug: string; parent?: unknown }
    parts.unshift(record.slug)
    parent = record.parent
  }
  return `/${locale}/${parts.join('/')}`
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
