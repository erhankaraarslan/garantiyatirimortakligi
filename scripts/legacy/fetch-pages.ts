/**
 * Eski siteden 106 sayfanın HTML anlık görüntüsünü indirir.
 *
 * Sayfa listesi /tr/site-haritasi.aspx üzerinden çıkarılıyor: eski site
 * sitemap.xml sunmuyor (404) ve menü JavaScript'siz gezilemiyor, ancak site
 * haritası sayfası TR + EN tüm hiyerarşiyi tek sayfada listeliyor.
 *
 * Kullanım: pnpm migrate:fetch
 */
import fs from 'fs/promises'
import path from 'path'
import pLimit from 'p-limit'

import { LEGACY_BASE_URL, PAGES_DIR, USER_AGENT, absoluteUrl } from './config'

const SITEMAP_PATH = '/tr/site-haritasi.aspx'

export function pathToFilename(legacyPath: string): string {
  return `${legacyPath.replace(/^\//, '').replace(/\//g, '__')}.html`
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!response.ok) throw new Error(`HTTP ${response.status} — ${url}`)
  return response.text()
}

export function extractPagePaths(sitemapHtml: string): string[] {
  /*
   * __VIEWSTATE base64'ü de .aspx dizeleri içeriyor; hidden input'ları atmadan
   * href taraması yanlış sonuç veriyor.
   */
  const withoutViewState = sitemapHtml.replace(/<input[^>]*__VIEWSTATE[^>]*>/gis, '')
  const matches = withoutViewState.matchAll(/href="(\/(?:tr|en)[^"]*\.aspx)"/gi)

  const unique = new Set<string>()
  for (const match of matches) {
    unique.add(decodeHtmlEntities(match[1]))
  }
  return [...unique].sort()
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
}

async function main() {
  await fs.mkdir(PAGES_DIR, { recursive: true })

  console.log(`Site haritası okunuyor: ${LEGACY_BASE_URL}${SITEMAP_PATH}`)
  const sitemapHtml = await fetchText(absoluteUrl(SITEMAP_PATH))
  const paths = extractPagePaths(sitemapHtml)

  const trCount = paths.filter((p) => p.startsWith('/tr')).length
  console.log(`${paths.length} sayfa bulundu (TR: ${trCount}, EN: ${paths.length - trCount})`)

  const limit = pLimit(8)
  const failures: { path: string; reason: string }[] = []

  await Promise.all(
    paths.map((legacyPath) =>
      limit(async () => {
        try {
          const html = await fetchText(absoluteUrl(legacyPath))
          await fs.writeFile(path.join(PAGES_DIR, pathToFilename(legacyPath)), html, 'utf8')
        } catch (error) {
          failures.push({ path: legacyPath, reason: (error as Error).message })
        }
      }),
    ),
  )

  await fs.writeFile(
    path.join(PAGES_DIR, '_index.json'),
    JSON.stringify({ fetchedAt: new Date().toISOString(), paths }, null, 2),
    'utf8',
  )

  console.log(`İndirilen: ${paths.length - failures.length}/${paths.length}`)
  if (failures.length > 0) {
    console.error('Başarısız sayfalar:')
    for (const failure of failures) console.error(`  ${failure.path} — ${failure.reason}`)
    process.exitCode = 1
  }
}

// Bu dosya parse-pages tarafından pathToFilename için import ediliyor;
// yalnızca doğrudan çalıştırıldığında indirme yapmalı.
if (process.argv[1]?.includes('fetch-pages')) {
  main().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
