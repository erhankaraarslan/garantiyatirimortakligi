/**
 * Uygulama analisti denetimi: tüm yayınlı sayfaları HTTP + içerik olarak tarar.
 * Kullanım: tsx --env-file=.env scripts/legacy/qa-audit.ts
 */
import fs from 'fs/promises'
import path from 'path'
import pLimit from 'p-limit'
import { getPayload } from 'payload'

import config from '../../src/payload.config'
import { pageHref } from '../../src/lib/data'
import type { Locale } from '../../src/lib/i18n'
import type { Page } from '../../src/payload-types'
import { REPORT_DIR } from './config'

const BASE = process.env.VERIFY_BASE_URL ?? 'http://localhost:3000'

type Finding = {
  severity: 'blocker' | 'major' | 'minor'
  area: string
  path: string
  detail: string
}

function lexicalText(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  const value = node as Record<string, unknown>
  if (typeof value.text === 'string') return value.text
  if (Array.isArray(value.children)) return value.children.map(lexicalText).join(' ')
  if (value.root) return lexicalText(value.root)
  return ''
}

function lexicalHasText(data: unknown): boolean {
  return lexicalText(data).replace(/\s+/g, ' ').trim().length > 20
}

async function main() {
  const payload = await getPayload({ config })
  const findings: Finding[] = []
  const add = (severity: Finding['severity'], area: string, pagePath: string, detail: string) =>
    findings.push({ severity, area, path: pagePath, detail })

  const pagesByLocale = new Map<Locale, Page[]>()
  for (const locale of ['tr', 'en'] as const) {
    const { docs } = await payload.find({
      collection: 'pages',
      locale,
      depth: 3,
      limit: 500,
      pagination: false,
      where: { _status: { equals: 'published' } },
    })
    pagesByLocale.set(locale, docs)
  }

  /* --- Payload veri kalitesi --- */
  for (const locale of ['tr', 'en'] as const) {
    for (const page of pagesByLocale.get(locale) ?? []) {
      const href = page.template === 'landing' ? `/${locale}` : pageHref(page, locale)
      if (!page.title?.trim()) add('blocker', 'title', href, 'Boş sayfa başlığı')
      if (page.translationStatus === 'missing' && locale === 'tr') {
        add('major', 'translation', href, 'TR sayfa translationStatus=missing')
      }
      if (page.template === 'documentArchive' && !page.archiveCategory) {
        add('blocker', 'archive', href, 'documentArchive şablonunda archiveCategory yok')
      }
      if (page.template === 'bioAccordion' && !page.bioGroup) {
        add('blocker', 'bio', href, 'bioAccordion şablonunda bioGroup yok')
      }
      if (
        page.template === 'content' &&
        page.translationStatus !== 'missing' &&
        !lexicalHasText(page.content) &&
        (page.attachments ?? []).length === 0
      ) {
        add('major', 'empty-content', href, 'İçerik şablonu neredeyse boş')
      }
    }
  }

  const { docs: people } = await payload.find({
    collection: 'people',
    locale: 'en',
    depth: 0,
    limit: 200,
    pagination: false,
  })
  for (const person of people) {
    if (!person.role?.trim()) {
      add('major', 'people-en', `/people/${person.id}`, `${person.name}: EN ünvan boş`)
    }
    if (!lexicalHasText(person.bio)) {
      add('minor', 'people-en', `/people/${person.id}`, `${person.name}: EN biyografi kısa/boş`)
    }
  }

  const { docs: faqsEn } = await payload.find({
    collection: 'faqs',
    locale: 'en',
    depth: 0,
    limit: 200,
    pagination: false,
  })
  for (const faq of faqsEn) {
    if (!faq.question?.trim()) add('major', 'faq-en', `/faqs/${faq.id}`, 'EN soru boş')
    if (!lexicalHasText(faq.answer)) add('major', 'faq-en', `/faqs/${faq.id}`, `${faq.question}: EN cevap boş`)
  }

  const { docs: awardsEn } = await payload.find({
    collection: 'awards',
    locale: 'en',
    depth: 1,
    limit: 100,
    pagination: false,
  })
  for (const award of awardsEn) {
    if (!award.title?.trim()) add('major', 'awards-en', `/awards/${award.id}`, 'EN ödül başlığı boş')
  }

  const { docs: commissionEn } = await payload.find({
    collection: 'commission-years',
    locale: 'en',
    depth: 0,
    limit: 100,
    pagination: false,
  })
  for (const year of commissionEn) {
    const emptyMetrics = (year.rows ?? []).filter((row) => !row.metric?.trim())
    if (emptyMetrics.length) {
      add('major', 'commission-en', `/commission/${year.year}`, `${emptyMetrics.length} EN metrik satırı boş`)
    }
  }

  /* --- HTTP tarama --- */
  const limit = pLimit(6)
  const urls: { href: string; template?: string; title?: string; locale: Locale }[] = [
    { href: '/tr', template: 'landing', locale: 'tr' },
    { href: '/en', template: 'landing', locale: 'en' },
    { href: '/tr/arama', template: 'search', locale: 'tr' },
    { href: '/en/arama', template: 'search', locale: 'en' },
    { href: '/tr/olmayan-sayfa-xyz', template: '404', locale: 'tr' },
    { href: '/en/missing-page-xyz', template: '404', locale: 'en' },
    { href: '/sitemap.xml', template: 'sitemap-xml', locale: 'tr' },
    { href: '/robots.txt', template: 'robots', locale: 'tr' },
  ]

  for (const locale of ['tr', 'en'] as const) {
    for (const page of pagesByLocale.get(locale) ?? []) {
      if (page.template === 'landing') continue
      if (page.externalUrl) continue
      urls.push({
        href: pageHref(page, locale),
        template: page.template ?? undefined,
        title: page.title,
        locale,
      })
    }
  }

  const htmlByUrl = new Map<string, { status: number; html: string }>()

  await Promise.all(
    urls.map((entry) =>
      limit(async () => {
        const response = await fetch(`${BASE}${encodeURI(entry.href)}`, {
          redirect: 'manual',
        })
        const html = response.status === 200 ? await response.text() : ''
        htmlByUrl.set(entry.href, { status: response.status, html })

        const expected404 = entry.template === '404'
        if (expected404) {
          if (response.status !== 404) {
            add('major', 'http', entry.href, `404 beklenirken HTTP ${response.status}`)
          }
          return
        }

        if (response.status !== 200) {
          add('blocker', 'http', entry.href, `HTTP ${response.status}`)
          return
        }

        if (html.includes('documentLabel is not defined') || html.includes('Application error')) {
          add('blocker', 'runtime', entry.href, 'Sayfa runtime hatası döndü')
        }
        if (html.includes('This page could not be found') && entry.template !== '404') {
          add('blocker', 'http', entry.href, '200 yerine Next.js 404 gövdesi')
        }

        const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
        const main = mainMatch?.[1] ?? ''
        const mainText = main
          .replace(/<script[\s\S]*?<\/script>/gi, ' ')
          .replace(/<style[\s\S]*?<\/style>/gi, ' ')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()

        if (mainText.length < 40 && entry.template !== 'search') {
          add('major', 'empty-html', entry.href, `Ana içerik çok kısa (${mainText.length} karakter)`)
        }

        if (
          html.includes('Not available in English yet') ||
          html.includes('Bu sayfa Türkçe olarak hazırlanıyor')
        ) {
          add('major', 'missing-notice', entry.href, 'Çeviri yok uyarısı gösteriliyor')
        }

        if (
          html.includes('Bu bölümde henüz yayımlanmış doküman bulunmuyor') ||
          html.includes('No documents have been published in this section yet')
        ) {
          add('major', 'empty-archive', entry.href, 'Doküman arşivi boş')
        }

        if (html.includes('Kayıt bulunamadı') || html.includes('No records found.')) {
          add('major', 'empty-bio', entry.href, 'Biyografi listesi boş')
        }

        // Boş menü bağlantısı: href var, metin yok
        const emptyLinks = [...html.matchAll(/<a[^>]*href="[^"]+"[^>]*>\s*<\/a>/g)]
        if (emptyLinks.length >= 3 && entry.href === `/${entry.locale}`) {
          add('blocker', 'empty-nav', entry.href, `${emptyLinks.length} boş <a> (muhtemel EN menü)`)
        }

        // FAQ/içerikte ham URL görünen linkler
        if (/<a[^>]*>\s*\/(?:tr|en)\/[^<]+<\/a>/.test(main)) {
          add('major', 'raw-url-link', entry.href, 'Bağlantı metni ham URL olarak görünüyor')
        }

        if (entry.title && !html.includes(entry.title.split(' ')[0]!)) {
          add('minor', 'title-mismatch', entry.href, `HTML'de başlık parçası bulunamadı: ${entry.title}`)
        }
      }),
    ),
  )

  // İç bağlantı örneklemesi: ana sayfa + site haritası içinden /tr ve /en linkleri
  const sampleHtml = [htmlByUrl.get('/tr')?.html, htmlByUrl.get('/en')?.html, htmlByUrl.get('/tr/site-haritasi')?.html]
    .filter(Boolean)
    .join('\n')
  const internal = [
    ...new Set(
      [...sampleHtml.matchAll(/href="(\/(?:tr|en)\/[^"#?]+)"/g)].map((match) => match[1]),
    ),
  ].slice(0, 80)

  await Promise.all(
    internal.map((href) =>
      limit(async () => {
        if (htmlByUrl.has(href)) return
        const response = await fetch(`${BASE}${encodeURI(href)}`, { redirect: 'manual' })
        if (response.status !== 200 && response.status !== 301) {
          add('major', 'broken-internal', href, `İç bağlantı HTTP ${response.status}`)
        }
      }),
    ),
  )

  const sitemap = await fetch(`${BASE}/sitemap.xml`).then((r) => r.text())
  const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  if (sitemapUrls.length < 80) {
    add('major', 'sitemap', '/sitemap.xml', `Beklenenden az URL: ${sitemapUrls.length}`)
  }

  await fs.mkdir(REPORT_DIR, { recursive: true })
  const reportPath = path.join(REPORT_DIR, 'qa-audit.json')
  await fs.writeFile(
    reportPath,
    JSON.stringify(
      {
        auditedAt: new Date().toISOString(),
        pageCounts: {
          tr: pagesByLocale.get('tr')?.length,
          en: pagesByLocale.get('en')?.length,
        },
        urlsChecked: urls.length,
        findings,
      },
      null,
      2,
    ),
    'utf8',
  )

  const blockers = findings.filter((f) => f.severity === 'blocker')
  const majors = findings.filter((f) => f.severity === 'major')
  const minors = findings.filter((f) => f.severity === 'minor')

  console.log(`Sayfa: TR ${pagesByLocale.get('tr')?.length} / EN ${pagesByLocale.get('en')?.length}`)
  console.log(`URL tarandı: ${urls.length}`)
  console.log(`Bulgular: ${blockers.length} blocker, ${majors.length} major, ${minors.length} minor\n`)

  const grouped = new Map<string, Finding[]>()
  for (const finding of findings) {
    const key = `${finding.severity} | ${finding.area}`
    const list = grouped.get(key) ?? []
    list.push(finding)
    grouped.set(key, list)
  }
  for (const [key, list] of grouped) {
    console.log(`\n=== ${key} (${list.length}) ===`)
    for (const item of list.slice(0, 25)) {
      console.log(`  ${item.path}: ${item.detail}`)
    }
    if (list.length > 25) console.log(`  ... +${list.length - 25}`)
  }

  console.log(`\nRapor: ${reportPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
