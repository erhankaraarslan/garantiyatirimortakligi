/**
 * Denetimde bulunan içerik hatalarını mevcut Payload kayıtlarına uygular.
 * Tam seed'i tekrar çalıştırmaz.
 *
 * Kullanım: pnpm exec tsx --env-file=.env scripts/legacy/qa-fix.ts
 */
import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'
import { getPayload, type Payload } from 'payload'

import config from '../../src/payload.config'
import { mapNavigationToEnglish } from './translations'

function pageHref(
  page: { slug: string; template?: string | null; parent?: unknown },
  locale: 'tr' | 'en',
): string {
  if (page.template === 'landing') return `/${locale}`
  const parts: string[] = [page.slug]
  let parent = page.parent as { slug?: string; parent?: unknown } | number | null | undefined
  while (parent && typeof parent === 'object' && parent.slug) {
    parts.unshift(parent.slug)
    parent = parent.parent as typeof parent
  }
  return `/${locale}/${parts.join('/')}`
}

const ROLE_EN: Record<string, string> = {
  'Yönetim Kurulu Başkanı': 'Chairman of the Board',
  'Yönetim Kurulu Başkan Vekili': 'Vice Chairman of the Board',
  'Bağımsız Yönetim Kurulu Üyesi': 'Independent Board Member',
  'Yönetim Kurulu Üyesi': 'Board Member',
  'Genel Müdür': 'General Manager',
}

const MONTH_EN: Record<string, string> = {
  Ocak: 'January',
  Şubat: 'February',
  Mart: 'March',
  Nisan: 'April',
  Mayıs: 'May',
  Haziran: 'June',
  Temmuz: 'July',
  Ağustos: 'August',
  Eylül: 'September',
  Ekim: 'October',
  Kasım: 'November',
  Aralık: 'December',
}

const METRIC_EN: Record<string, string> = {
  'Hisse Senedi Alım Satım:': 'Equity trading:',
  'Tahvil / Bono Alım Satım:': 'Bond trading:',
  'Ters Repo (O/N):': 'Reverse repo (O/N):',
  'Ters Repo (Vadeli):': 'Reverse repo (term):',
  'VOB - Endeks Sözleşmesi:': 'Futures — index contract:',
  'Kıymetli Maden': 'Precious metals',
  'Yabancı Menkul Kıymet': 'Foreign securities',
  'BPP (Günlük):': 'Money market (daily):',
  'Hizmeti Veren Kurum:': 'Service provider:',
  'Hisse Senedi İçin Ödenen Komisyon Tutarı (TL):': 'Commission paid on equities (TRY):',
  'Hisse Senetleri İçin Ödenen Komisyon Tutarı (TL)': 'Commission paid on equities (TRY)',
  'Hisse Senedi İçin Ödenen Komisyon Tutarının Ortalama Net Aktif Değere Oranı (%):':
    'Equity commission / average net asset value (%):',
  'SGMK (Tahvil, Bono, Ters Repo(O/N)) İçin ödenen Komisyon Tutarı (TL):':
    'Commission paid on fixed-income (TRY):',
  'SGMK (Tahvil, Bono, Ters Repo(O/N)) İçin ödenen Komisyon Tutarının Ortalama Net Aktif Değere Oranı (%):':
    'Fixed-income commission / average net asset value (%):',
  'VOB - Endeks sözleşmesi İçin ödenen Komisyon Tutarı (TL):':
    'Commission paid on index futures (TRY):',
  'VOB - Endeks sözleşmesi İçin ödenen Komisyon Tutarının Ortalama Net Aktif Değere Oranı (%):':
    'Index futures commission / average net asset value (%):',
  'Kıymetli Madenler İçin ödenen Komisyon Tutarı(TL):': 'Commission paid on precious metals (TRY):',
  'Kıymetli Madenler İçin ödenen Komisyon Tutarının Ortalama Net Aktif Değere Oranı (%):':
    'Precious metals commission / average net asset value (%):',
  'Ödenen Komisyon Tutarı (TL):': 'Commission paid (TRY):',
  'Komisyon Tutarının Ortalama Net Aktif Değere Oranı (%):':
    'Commission / average net asset value (%):',
  'Ortalama Net Aktif Değer': 'Average net asset value',
  'Ortalama Net Aktif Değer (TL)': 'Average net asset value (TRY)',
  'Portföy Yönetim Ücreti Tutarı (TL)': 'Portfolio management fee (TRY)',
  'Portföy Yönetim Ücreti Tutarının Ort. Net Aktif Değere Oranı (%)':
    'Portfolio management fee / average NAV (%)',
  'Kamu Borçlanma Senedi İşlemleri İçin Ödenen (TL)Komisyon Tutarı':
    'Commission paid on government securities (TRY)',
  'Diğer İşlemler için Ödenen Komisyon Tutarı (TL)': 'Commission paid on other transactions (TRY)',
  'Ödenen Toplam Komisyon Tutarı (TL)': 'Total commission paid (TRY)',
  'Toplam Komisyon Tutarının Ortalama Net Aktif Değere Oranı(%)':
    'Total commission / average net asset value (%)',
}

const REGISTRY_EN_HTML = `<p>
<strong>Ministry of Industry and Trade Permit Date</strong>: 02.07.1996<br>
<strong>Registration Date of the Articles of Association</strong>: 09.07.1996<br>
<strong>Trade Registry Gazette Date and Issue</strong>: 15/07/1996/4080<br>
<strong>Duration</strong>: Indefinite<br>
<strong>Trade Registry Office</strong>: Istanbul Trade Registry Office<br>
<strong>Trade Registry No</strong>: 349050/260 631
</p>`

const KAP_TR_HTML = `<p>Şirketin özel durum açıklamaları Kamuyu Aydınlatma Platformu (KAP) üzerinden yayımlanmaktadır. Bu sayfada ayrıca bir arşiv tutulmamaktadır.</p>
<p><a href="https://www.kap.org.tr/tr/sirket-bilgileri/ozet/1094-garanti-yatirim-ortakligi-a-s">KAP — Garanti Yatırım Ortaklığı A.Ş. özel durum açıklamaları</a></p>`

const KAP_EN_HTML = `<p>The Company’s material event disclosures are published on the Public Disclosure Platform (KAP). This page does not keep a separate archive.</p>
<p><a href="https://www.kap.org.tr/en/sirket-bilgileri/ozet/1094-garanti-yatirim-ortakligi-a-s">KAP — Garanti Yatırım Ortaklığı A.Ş. material disclosures</a></p>`

let editorConfigPromise: ReturnType<typeof editorConfigFactory.default> | null = null

async function getEditorConfig() {
  if (!editorConfigPromise) {
    editorConfigPromise = editorConfigFactory.default({ config: await config })
  }
  return editorConfigPromise
}

async function toLexical(html: string) {
  return convertHTMLToLexical({
    editorConfig: await getEditorConfig(),
    html,
    JSDOM,
  })
}

function translatePeriod(label: string): string {
  return label.replace(
    /Ocak|Şubat|Mart|Nisan|Mayıs|Haziran|Temmuz|Ağustos|Eylül|Ekim|Kasım|Aralık/g,
    (month) => MONTH_EN[month] ?? month,
  )
}

function looksLikeRawUrl(text: string): boolean {
  return /^(https?:\/\/|www\.|\/(?:tr|en)\/)/i.test(text.trim())
}

function walkLexical(node: unknown, visit: (node: Record<string, unknown>) => void) {
  if (!node || typeof node !== 'object') return
  const value = node as Record<string, unknown>
  visit(value)
  if (Array.isArray(value.children)) {
    for (const child of value.children) walkLexical(child, visit)
  }
  if (value.root) walkLexical(value.root, visit)
}

function fixRawUrlLinks(
  data: unknown,
  titleByPath: Map<string, string>,
): { changed: boolean; data: unknown } {
  if (!data || typeof data !== 'object') return { changed: false, data }
  const clone = JSON.parse(JSON.stringify(data)) as Record<string, unknown>
  let changed = false

  walkLexical(clone, (node) => {
    if (node.type !== 'link' && node.type !== 'autolink') return
    const children = node.children
    if (!Array.isArray(children) || children.length === 0) return
    const textNode = children[0] as Record<string, unknown>
    if (typeof textNode.text !== 'string' || !looksLikeRawUrl(textNode.text)) return

    const fields = (node.fields ?? {}) as Record<string, unknown>
    const url = String(fields.url ?? fields.linkType ?? '')
    const path = url.replace(/^https?:\/\/[^/]+/i, '').replace(/\.aspx$/i, '')
    const title = titleByPath.get(path) ?? titleByPath.get(url)
    if (!title) return
    textNode.text = title
    changed = true
  })

  return { changed, data: clone }
}

async function main() {
  const payload = await getPayload({ config })

  const titleByPath = new Map<string, string>()
  for (const locale of ['tr', 'en'] as const) {
    const { docs } = await payload.find({
      collection: 'pages',
      locale,
      depth: 3,
      limit: 500,
      pagination: false,
    })
    for (const page of docs) {
      titleByPath.set(pageHref(page, locale), page.title)
    }
  }

  await fixPeople(payload)
  await fixCommission(payload)
  await fixFaqs(payload, titleByPath)
  await fixPages(payload)
  await shortenNavLabel(payload)

  console.log('qa-fix tamamlandı')
}

async function fixPeople(payload: Payload) {
  const { docs: trPeople } = await payload.find({
    collection: 'people',
    locale: 'tr',
    depth: 0,
    limit: 100,
    pagination: false,
  })

  let updated = 0
  for (const person of trPeople) {
    const en = await payload.findByID({ collection: 'people', id: person.id, locale: 'en', depth: 0 })
    const role = ROLE_EN[person.role] ?? person.role
    const bioEmpty = !lexicalText(en.bio)
    await payload.update({
      collection: 'people',
      id: person.id,
      locale: 'en',
      data: {
        role,
        bio: bioEmpty ? person.bio : en.bio,
      },
    })
    updated += 1
  }
  console.log(`  EN yönetici ünvan/biyografi: ${updated}`)
}

function lexicalText(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  const value = node as Record<string, unknown>
  if (typeof value.text === 'string') return value.text
  if (Array.isArray(value.children)) return value.children.map(lexicalText).join('')
  if (value.root) return lexicalText(value.root)
  return ''
}

async function fixCommission(payload: Payload) {
  const { docs: years } = await payload.find({
    collection: 'commission-years',
    locale: 'tr',
    depth: 0,
    limit: 100,
    pagination: false,
  })

  let updated = 0
  for (const year of years) {
    await payload.update({
      collection: 'commission-years',
      id: year.id,
      locale: 'en',
      data: {
        heading:
          'Disclosure pursuant to Capital Markets Board decision dated 13.04.2006 and numbered 18/452',
        intermediary: year.intermediary,
        periods: (year.periods ?? []).map((period) => ({
          ...period,
          label: translatePeriod(period.label ?? ''),
        })),
        rows: (year.rows ?? []).map((row) => ({
          ...row,
          metric: METRIC_EN[row.metric] ?? row.metric,
        })),
      },
    })
    updated += 1
  }
  console.log(`  EN komisyon tabloları: ${updated}`)
}

async function fixFaqs(payload: Payload, titleByPath: Map<string, string>) {
  let updated = 0
  for (const locale of ['tr', 'en'] as const) {
    const { docs } = await payload.find({
      collection: 'faqs',
      locale,
      depth: 0,
      limit: 200,
      pagination: false,
    })
    for (const faq of docs) {
      const { changed, data } = fixRawUrlLinks(faq.answer, titleByPath)
      if (!changed) continue
      await payload.update({
        collection: 'faqs',
        id: faq.id,
        locale,
        data: { answer: data as never },
      })
      updated += 1
    }
  }
  console.log(`  SSS ham URL linkleri: ${updated}`)
}

async function fixPages(payload: Payload) {
  const { docs: enPages } = await payload.find({
    collection: 'pages',
    locale: 'en',
    depth: 3,
    limit: 500,
    pagination: false,
  })

  for (const page of enPages) {
    const href = pageHref(page, 'en')
    if (page.template === 'landing' && !page.title?.trim()) {
      await payload.update({
        collection: 'pages',
        id: page.id,
        locale: 'en',
        data: { title: 'Home' },
      })
      console.log('  EN ana sayfa başlığı yazıldı')
    }

    if (href.endsWith('/special-case-comments')) {
      await payload.update({
        collection: 'pages',
        id: page.id,
        locale: 'en',
        data: {
          title: 'Material Event Disclosures',
          content: await toLexical(KAP_EN_HTML),
        },
      })
      console.log('  EN özel durum açıklamaları dolduruldu')
    }

    if (href.endsWith('/regular-public-disclosure-form') && page.template === 'dataTable') {
      await payload.update({
        collection: 'pages',
        id: page.id,
        locale: 'en',
        data: { commissionScope: 'all' },
      })
      console.log('  EN sürekli bilgilendirme formuna komisyon tabloları bağlandı')
    }

    if (
      href.includes('/the-commission-information-of-the-year-') &&
      page.template === 'dataTable' &&
      page.commissionScope !== 'single'
    ) {
      const year = Number(href.match(/year-(\d{4})/)?.[1])
      await payload.update({
        collection: 'pages',
        id: page.id,
        locale: 'en',
        data: {
          commissionScope: 'single',
          commissionYear: Number.isFinite(year) ? year : page.commissionYear,
        },
      })
    }

    if (href.endsWith('/commercial-registry-information') && lexicalText(page.content).length < 40) {
      await payload.update({
        collection: 'pages',
        id: page.id,
        locale: 'en',
        data: { content: await toLexical(REGISTRY_EN_HTML) },
      })
      console.log('  EN ticaret sicil bilgileri dolduruldu')
    }
  }

  const { docs: trPages } = await payload.find({
    collection: 'pages',
    locale: 'tr',
    depth: 3,
    limit: 500,
    pagination: false,
  })
  for (const page of trPages) {
    const href = pageHref(page, 'tr')
    if (href.endsWith('/ozel-durum-aciklamalari') && lexicalText(page.content).length < 40) {
      await payload.update({
        collection: 'pages',
        id: page.id,
        locale: 'tr',
        data: { content: await toLexical(KAP_TR_HTML) },
      })
      console.log('  TR özel durum açıklamaları dolduruldu')
    }
  }
}

async function shortenNavLabel(payload: Payload) {
  const nav = await payload.findGlobal({ slug: 'navigation', locale: 'tr', depth: 0 })
  await payload.updateGlobal({
    slug: 'navigation',
    locale: 'en',
    data: mapNavigationToEnglish(nav),
  })
  console.log('  EN menü etiketleri yenilendi')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
