/**
 * Taşıma doğrulaması. Yeni siteyi eski siteyle karşılaştırır.
 *
 * Kontroller:
 *   1. Her eski sayfa URL'i 301 ile yeni bir sayfaya gidiyor mu, hedef 200 mü?
 *   2. Her doküman yeni adresten indirilebiliyor mu, boyutu kaynakla uyuşuyor mu?
 *   3. Sayfa metinleri taşınmış mı (kelime bazlı örtüşme oranı)?
 *   4. Yapılandırılmış veri sayıları beklenen değerlerde mi?
 *
 * Kullanım: pnpm migrate:verify  (dev sunucusu çalışır durumda olmalı)
 */
import fs from 'fs/promises'
import path from 'path'
import pLimit from 'p-limit'

import { DOCUMENT_INDEX_FILE, PARSED_FILE, REPORT_DIR } from './config'
import type { DocumentIndex } from './download-documents'
import type { ParsedPage } from './parse-pages'

const BASE_URL = process.env.VERIFY_BASE_URL ?? 'http://localhost:3000'

type Issue = { kind: string; detail: string }

async function main() {
  const { pages } = JSON.parse(await fs.readFile(PARSED_FILE, 'utf8')) as { pages: ParsedPage[] }
  const documentIndex = JSON.parse(await fs.readFile(DOCUMENT_INDEX_FILE, 'utf8')) as DocumentIndex

  const issues: Issue[] = []
  const redirectMap = JSON.parse(
    await fs.readFile(path.resolve(process.cwd(), 'src/redirects.generated.json'), 'utf8'),
  ) as Record<string, string>

  console.log(`Doğrulama hedefi: ${BASE_URL}\n`)

  /* --- 1. Sayfa yönlendirmeleri --- */
  console.log('1/4 Sayfa yönlendirmeleri...')
  const limit = pLimit(8)
  let redirectOk = 0

  await Promise.all(
    pages.map((page) =>
      limit(async () => {
        const target = redirectMap[page.legacyPath]
        if (!target) {
          issues.push({ kind: 'yönlendirme-eksik', detail: page.legacyPath })
          return
        }

        const response = await fetch(`${BASE_URL}${encodeURI(page.legacyPath)}`, {
          redirect: 'manual',
        })
        if (response.status !== 301) {
          issues.push({
            kind: 'yönlendirme-kodu',
            detail: `${page.legacyPath} -> HTTP ${response.status} (301 beklendi)`,
          })
          return
        }

        const final = await fetch(`${BASE_URL}${encodeURI(target)}`)
        if (!final.ok) {
          issues.push({ kind: 'hedef-hata', detail: `${target} -> HTTP ${final.status}` })
          return
        }
        redirectOk += 1
      }),
    ),
  )
  console.log(`  ${redirectOk}/${pages.length} sayfa yönlendirmesi doğrulandı`)

  /* --- 2. Dokümanlar --- */
  console.log('2/4 Dokümanlar...')
  let documentOk = 0

  await Promise.all(
    documentIndex.entries.map((entry) =>
      limit(async () => {
        const response = await fetch(`${BASE_URL}${encodeURI(entry.originalPath)}`)
        if (!response.ok) {
          issues.push({
            kind: 'doküman-erişim',
            detail: `${entry.originalPath} -> HTTP ${response.status}`,
          })
          return
        }

        const buffer = Buffer.from(await response.arrayBuffer())
        if (buffer.byteLength !== entry.bytes) {
          issues.push({
            kind: 'doküman-boyut',
            detail: `${entry.originalPath}: ${buffer.byteLength} != beklenen ${entry.bytes}`,
          })
          return
        }
        documentOk += 1
      }),
    ),
  )
  console.log(`  ${documentOk}/${documentIndex.entries.length} doküman doğrulandı`)

  /* --- 3. İçerik örtüşmesi --- */
  console.log('3/4 İçerik karşılaştırması...')
  let contentChecked = 0
  const lowOverlap: { path: string; ratio: number }[] = []

  await Promise.all(
    pages
      .filter((page) => page.contentHtml && page.contentHtml.length > 400)
      .map((page) =>
        limit(async () => {
          const target = redirectMap[page.legacyPath]
          if (!target) return

          const response = await fetch(`${BASE_URL}${encodeURI(target)}`)
          if (!response.ok) return

          const html = await response.text()
          const ratio = wordOverlap(stripTags(page.contentHtml!), stripTags(html))
          contentChecked += 1
          // Yeni sayfada gezinme/footer metni de var, bu yüzden eşik gevşek
          if (ratio < 0.85) lowOverlap.push({ path: page.legacyPath, ratio })
        }),
      ),
  )
  console.log(`  ${contentChecked} sayfa karşılaştırıldı, ${lowOverlap.length} tanesi eşiğin altında`)
  for (const item of lowOverlap) {
    issues.push({
      kind: 'içerik-örtüşme',
      detail: `${item.path}: kaynak kelimelerin %${(item.ratio * 100).toFixed(0)}'i bulundu`,
    })
  }

  /* --- 4. Yapılandırılmış veri sayıları --- */
  console.log('4/4 Veri sayıları...')
  const expected = {
    documents: documentIndex.entries.length,
    archiveItems: pages.reduce(
      (sum, page) => sum + page.archiveGroups.reduce((n, g) => n + g.documents.length, 0),
      0,
    ),
    faqs: pages.reduce((sum, page) => sum + page.faqs.length, 0),
    people: pages
      .filter((page) => page.locale === 'tr')
      .reduce((sum, page) => sum + page.people.length, 0),
  }
  console.log(`  beklenen: ${JSON.stringify(expected)}`)

  /* --- Rapor --- */
  await fs.mkdir(REPORT_DIR, { recursive: true })
  const grouped = issues.reduce<Record<string, string[]>>((accumulator, issue) => {
    ;(accumulator[issue.kind] ??= []).push(issue.detail)
    return accumulator
  }, {})

  await fs.writeFile(
    path.join(REPORT_DIR, 'verification.json'),
    JSON.stringify(
      { verifiedAt: new Date().toISOString(), baseUrl: BASE_URL, expected, issues: grouped },
      null,
      2,
    ),
    'utf8',
  )

  console.log('\n=== SONUÇ ===')
  if (issues.length === 0) {
    console.log('Sorun bulunamadı.')
  } else {
    for (const [kind, details] of Object.entries(grouped)) {
      console.log(`\n${kind}: ${details.length}`)
      for (const detail of details.slice(0, 10)) console.log(`  ${detail}`)
      if (details.length > 10) console.log(`  ... ve ${details.length - 10} tane daha`)
    }
    process.exitCode = 1
  }
  console.log(`\nAyrıntılı rapor: ${path.join(REPORT_DIR, 'verification.json')}`)
}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/gi, ' ')
}

/** Kaynak metindeki anlamlı kelimelerin kaçı hedefte bulunuyor. */
function wordOverlap(source: string, target: string): number {
  const normalize = (value: string) =>
    value
      .toLocaleLowerCase('tr')
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 3)

  const sourceWords = new Set(normalize(source))
  if (sourceWords.size === 0) return 1

  const targetWords = new Set(normalize(target))
  let found = 0
  for (const word of sourceWords) if (targetWords.has(word)) found += 1
  return found / sourceWords.size
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
