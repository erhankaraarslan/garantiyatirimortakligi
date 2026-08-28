/**
 * Orijinal GYO sitesi ile yerel kopyayı Playwright ile karşılaştırır.
 * Kullanım: pnpm exec tsx scripts/legacy/visual-audit.ts
 */
import { chromium, type Page } from '@playwright/test'
import fs from 'fs/promises'
import path from 'path'

import { LEGACY_BASE_URL, REPORT_DIR } from './config'

const LOCAL = process.env.LOCAL_BASE_URL ?? 'http://localhost:3000'

const PAIRS: { name: string; original: string; local: string }[] = [
  { name: 'home', original: `${LEGACY_BASE_URL}/tr/ana-sayfa.aspx`, local: `${LOCAL}/tr` },
  {
    name: 'disclosure',
    original: `${LEGACY_BASE_URL}/tr/surekli-bilgilendirme-formu.aspx`,
    local: `${LOCAL}/tr/surekli-bilgilendirme-formu`,
  },
  {
    name: 'capital',
    original: `${LEGACY_BASE_URL}/tr/yatirimci-iliskileri/kurumsal-yonetim/sermaye-ve-ortaklik-yapisi.aspx`,
    local: `${LOCAL}/tr/yatirimci-iliskileri/kurumsal-yonetim/sermaye-ve-ortaklik-yapisi`,
  },
  {
    name: 'awards',
    original: `${LEGACY_BASE_URL}/tr/kurumsal/oduller.aspx`,
    local: `${LOCAL}/tr/kurumsal/oduller`,
  },
  {
    name: 'ir',
    original: `${LEGACY_BASE_URL}/tr/yatirimci-iliskileri.aspx`,
    local: `${LOCAL}/tr/yatirimci-iliskileri`,
  },
  {
    name: 'org',
    original: `${LEGACY_BASE_URL}/tr/kurumsal/organizasyon-semasi.aspx`,
    local: `${LOCAL}/tr/kurumsal/organizasyon-semasi`,
  },
  {
    name: 'insiders',
    original: `${LEGACY_BASE_URL}/tr/yatirimci-iliskileri/kurumsal-yonetim/iceriden-ogrenenler-listesi.aspx`,
    local: `${LOCAL}/tr/yatirimci-iliskileri/kurumsal-yonetim/iceriden-ogrenenler-listesi`,
  },
]

type Snapshot = {
  url: string
  title: string
  imgCount: number
  contentImgs: { src: string; w: number; h: number; alt: string }[]
  tableCount: number
  nestedTables: number
  tableSummary: { cols: number; rows: number; text: string }[]
}

async function snapshot(page: Page, url: string): Promise<Snapshot> {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 })
  await page.waitForTimeout(800)

  return page.evaluate(() => {
    const content =
      document.querySelector('main') ||
      document.querySelector('#ContentPlaceHolder1_pnlCenter') ||
      document.querySelector('#home_main') ||
      document.body

    const imgs = [...content.querySelectorAll('img')].filter((img) => {
      const rect = img.getBoundingClientRect()
      return rect.width > 8 && rect.height > 8 && !/webresource/i.test(img.src)
    })

    const tables = [...content.querySelectorAll('table')]
    const nested = tables.filter((table) => table.querySelector('table')).length

    return {
      url: location.href,
      title: document.title,
      imgCount: imgs.length,
      contentImgs: imgs.slice(0, 12).map((img) => ({
        src: img.getAttribute('src') ?? img.src,
        w: Math.round(img.getBoundingClientRect().width),
        h: Math.round(img.getBoundingClientRect().height),
        alt: img.alt,
      })),
      tableCount: tables.length,
      nestedTables: nested,
      tableSummary: tables.slice(0, 8).map((table) => {
        const rows = table.querySelectorAll(':scope > tbody > tr, :scope > tr')
        const firstRow = rows[0]
        const cols = firstRow ? firstRow.querySelectorAll(':scope > td, :scope > th').length : 0
        return {
          cols,
          rows: rows.length,
          text: (table.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 180),
        }
      }),
    }
  })
}

async function main() {
  const outDir = path.join(REPORT_DIR, 'visual')
  await fs.mkdir(outDir, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  page.setDefaultTimeout(45_000)

  const report: Record<string, { original: Snapshot; local: Snapshot }> = {}

  for (const pair of PAIRS) {
    console.log(`\n== ${pair.name} ==`)
    let original: Snapshot
    try {
      original = await snapshot(page, pair.original)
      await page.screenshot({
        path: path.join(outDir, `${pair.name}-original.png`),
        fullPage: true,
      })
      console.log(
        `  original imgs=${original.imgCount} tables=${original.tableCount} nested=${original.nestedTables}`,
      )
    } catch (error) {
      console.warn(`  original FAILED: ${(error as Error).message}`)
      original = {
        url: pair.original,
        title: '',
        imgCount: 0,
        contentImgs: [],
        tableCount: 0,
        nestedTables: 0,
        tableSummary: [],
      }
    }

    const local = await snapshot(page, pair.local)
    await page.screenshot({ path: path.join(outDir, `${pair.name}-local.png`), fullPage: true })
    console.log(`  local    imgs=${local.imgCount} tables=${local.tableCount} nested=${local.nestedTables}`)

    report[pair.name] = { original, local }
  }

  await fs.writeFile(path.join(outDir, 'compare.json'), JSON.stringify(report, null, 2))
  await browser.close()
  console.log(`\nRapor: ${path.join(outDir, 'compare.json')}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
