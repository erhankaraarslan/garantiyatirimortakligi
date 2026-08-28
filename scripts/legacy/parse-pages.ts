/**
 * Eski sitenin HTML anlık görüntüsünü yapılandırılmış JSON'a çevirir.
 *
 * Eski site ASP.NET Web Forms (2013) ile üretilmiş; içerik `<font>`, `<o:p>`,
 * Word'den yapıştırılmış inline style ve iç içe tablo katmanlarıyla sarılı.
 * Burada bunları soyup şablon tipine göre ayrıştırıyoruz.
 *
 * Kullanım: pnpm migrate:parse
 */
import * as cheerio from 'cheerio'
import fs from 'fs/promises'
import path from 'path'

import { DUPLICATE_PATHS, PAGES_DIR, PARSED_FILE, toCleanPath } from './config'
import { pathToFilename } from './fetch-pages'

const CONTENT_SELECTOR = '#ContentPlaceHolder1_pnlCenter'

export type PageTemplate =
  | 'content'
  | 'documentArchive'
  | 'bioAccordion'
  | 'dataTable'
  | 'faq'
  | 'contact'
  | 'gallery'
  | 'sitemap'
  | 'landing'

export type ParsedDocument = { href: string; label: string }

export type ParsedArchiveGroup = {
  heading: string
  year: number | null
  documents: ParsedDocument[]
}

export type ParsedPerson = { name: string; role: string; bioHtml: string }

export type ParsedCommissionYear = {
  year: number
  heading: string | null
  intermediary: string | null
  periods: string[]
  rows: { metric: string; values: string[] }[]
}

export type ParsedPage = {
  legacyPath: string
  cleanPath: string
  locale: 'tr' | 'en'
  segments: string[]
  title: string
  breadcrumb: string[]
  template: PageTemplate
  commissionScope: 'none' | 'all' | 'single'
  commissionYear: number | null
  contentHtml: string | null
  archiveGroups: ParsedArchiveGroup[]
  people: ParsedPerson[]
  commissionYears: ParsedCommissionYear[]
  faqs: { question: string; answer: string }[]
  documents: ParsedDocument[]
  images: string[]
  isEmpty: boolean
}

/** Yola göre şablon zorlamaları; sezgisel tespitin yetmediği sayfalar. */
const TEMPLATE_BY_LEAF: Record<string, PageTemplate> = {
  'ana-sayfa': 'landing',
  home: 'landing',
  'site-haritasi': 'sitemap',
  'sikca-sorulan-sorular': 'faq',
  'bize-ulasin': 'contact',
  'contact-us': 'contact',
  oduller: 'gallery',
  awards: 'gallery',
  'surekli-bilgilendirme-formu': 'dataTable',
  'regular-public-disclosure-form': 'dataTable',
  'yonetim-kurulu-uyeleri': 'bioAccordion',
  'members-of-the-board': 'bioAccordion',
  'ust-yonetim': 'bioAccordion',
  'top-management': 'bioAccordion',
}

function cleanText(value: string | undefined | null): string {
  return (value ?? '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
}

/**
 * Word/FrontPage artıklarını temizler. Bu artıklar HTML->Lexical dönüşümünde
 * anlamsız boş node'lara ve bozuk stil özniteliklerine yol açıyor.
 *
 * `basePath` sayfanın kendi yolu; içerikte birkaç bağlantı site köküne değil
 * sayfanın bulunduğu klasöre göre göreli verilmiş (ör. /en/corporate.aspx
 * içinde "corporate/members-of-the-board.aspx").
 */
function sanitizeHtml(html: string, basePath = '/'): string {
  const $ = cheerio.load(`<div id="root">${html}</div>`, null, false)
  const root = $('#root')

  root.find('script, style, o\\:p, meta, link').remove()

  /*
   * HTML yorumlarını atıyoruz. Eski sitede bazı sayfalarda yorum içine alınmış
   * eski tablolar duruyor (ör. Yatırımcı İlişkileri sayfasındaki güncel olmayan
   * ortaklık yapısı tablosu). Bunlar kasten gizlenmiş içerik; taşımak eski
   * verinin yeniden yayına girmesi anlamına gelirdi.
   */
  root
    .contents()
    .filter((_, node) => node.type === 'comment')
    .remove()
  root.find('*').each((_, element) => {
    $(element)
      .contents()
      .filter((_, node) => node.type === 'comment')
      .remove()
  })

  /*
   * Lexical'in link node'u geçerli bir URL şart koşuyor; href'i olmayan veya
   * boş olan bağlantılar dönüşümü hataya düşürüyor. Bunları düz metne
   * indiriyoruz, göreli olanları ise site köküne göre çözüyoruz.
   */
  const baseDirectory = basePath.slice(0, basePath.lastIndexOf('/') + 1)
  root.find('a').each((_, element) => {
    const anchor = $(element)
    const href = anchor.attr('href')?.trim()

    if (!href || href === '#' || /^javascript:/i.test(href)) {
      anchor.replaceWith($('<span>').html(anchor.html() ?? ''))
      return
    }

    if (!/^(https?:|mailto:|tel:|\/|#)/i.test(href)) {
      anchor.attr('href', `${baseDirectory}${href}`)
    }
  })

  root.find('*').each((_, element) => {
    const node = $(element)
    // Word'den gelen sahte öznitelikler (mso-*, arial="", nova="" gibi)
    const attributes = { ...(element as unknown as { attribs: Record<string, string> }).attribs }
    for (const name of Object.keys(attributes)) {
      if (name === 'href' || name === 'src' || name === 'alt' || name === 'colspan' || name === 'rowspan') continue
      node.removeAttr(name)
    }
  })

  // <font> etiketlerini içeriğiyle değiştir
  root.find('font').each((_, element) => {
    $(element).replaceWith($(element).html() ?? '')
  })

  // Yalnızca boşluk içeren paragrafları at
  root.find('p, div, span').each((_, element) => {
    const node = $(element)
    if (node.children().length === 0 && cleanText(node.text()) === '') node.remove()
  })

  return (root.html() ?? '').trim()
}

function parseLocaleAndSegments(legacyPath: string) {
  const parts = toCleanPath(legacyPath).split('/').filter(Boolean)
  const locale = parts[0] === 'en' ? ('en' as const) : ('tr' as const)
  return { locale, segments: parts.slice(1) }
}

function extractYear(heading: string): number | null {
  const match = heading.match(/(19|20)\d{2}/)
  return match ? Number(match[0]) : null
}

/** #accordion içindeki <h3> başlık + takip eden <div> gövde çiftlerini ayırır. */
function parseAccordion($: cheerio.CheerioAPI, container: cheerio.Cheerio<never>) {
  const groups: { heading: string; bodyHtml: string }[] = []

  container.find('> h3').each((_, headingElement) => {
    const heading = cleanText($(headingElement).text())
    const body = $(headingElement).next('div')
    groups.push({ heading, bodyHtml: body.html() ?? '' })
  })

  return groups
}

function collectDocuments($: cheerio.CheerioAPI, scope: cheerio.Cheerio<never>): ParsedDocument[] {
  const documents: ParsedDocument[] = []

  scope.find('a[href]').each((_, element) => {
    const href = $(element).attr('href') ?? ''
    if (!/\.(pdf|docx?|xlsx?|zip|pptx?)$/i.test(href)) return
    documents.push({ href, label: cleanText($(element).text()) })
  })

  return documents
}

function parseCommissionTable(
  $: cheerio.CheerioAPI,
  bodyHtml: string,
  year: number,
): ParsedCommissionYear | null {
  const body = cheerio.load(`<div id="b">${bodyHtml}</div>`, null, false)
  const table = body('table.datatable').first()
  if (table.length === 0) return null

  const heading = cleanText(body('strong.icerikbaslik').first().text()) || null
  let intermediary: string | null = null
  const periods: string[] = []
  const rows: { metric: string; values: string[] }[] = []

  table.find('tr').each((_, rowElement) => {
    const cells = body(rowElement).children('td, th')
    if (cells.length === 0) return

    const first = cleanText(cells.eq(0).text())

    // "İşlemlere Aracılık Yapan Kurum:" satırı colspan'li tek hücre taşıyor
    if (/aracılık yapan kurum/i.test(first) || /intermediary/i.test(first)) {
      intermediary = cleanText(cells.eq(1).text())
      return
    }

    // Dönem başlığı satırı
    if (/^(dönem|period)/i.test(first)) {
      cells.slice(1).each((_, cell) => {
        const label = cleanText(body(cell).text())
        if (label) periods.push(label)
      })
      return
    }

    if (!first) return

    const values: string[] = []
    cells.slice(1).each((_, cell) => {
      values.push(cleanText(body(cell).text()))
    })

    // Tamamen boş satırları atla (eski tabloların sonundaki dolgu satırları)
    if (values.every((value) => value === '')) return
    rows.push({ metric: first, values })
  })

  if (periods.length === 0 && rows.length === 0) return null
  return { year, heading, intermediary, periods, rows }
}

/**
 * SSS sayfası numaralı soru-cevap listesi olarak düz <p> blokları halinde
 * tutuluyor. Soruları numara sırasını takip ederek tanıyoruz; içerik
 * tutarsızlıkları buna zorluyor:
 *   - 1. soru aynı paragrafta tire dizisiyle başlıyor
 *   - 8. soru "?" yerine "." ile bitiyor
 * Bu yüzden "soru işaretiyle bitiyor mu" gibi bir kural güvenilir değil.
 */
function parseFaqs(contentHtml: string) {
  const $ = cheerio.load(`<div id="root">${contentHtml}</div>`, null, false)

  const blocks: string[] = []
  $('#root')
    .children()
    .each((_, element) => {
      blocks.push($(element).html() ?? '')
    })

  const faqs: { question: string; answer: string }[] = []
  let current: { question: string; answer: string[] } | null = null
  let expectedNumber = 1

  for (const block of blocks) {
    const html = block.trim()
    const text = cleanText(cheerio.load(`<div>${html}</div>`, null, false)('div').text())
    if (!text || /^[-–—\s]+$/.test(text)) continue

    // Baştaki ayırıcı tireleri at, ardından "N." önekini ara
    const stripped = text.replace(/^[-–—\s]+/, '')
    const match = stripped.match(/^(\d{1,2})[.)]\s+(.+)$/)

    if (match && Number(match[1]) === expectedNumber) {
      if (current) faqs.push({ question: current.question, answer: current.answer.join('\n') })
      current = { question: cleanText(match[2]), answer: [] }
      expectedNumber += 1
      continue
    }

    if (current) current.answer.push(`<p>${html}</p>`)
  }

  if (current) faqs.push({ question: current.question, answer: current.answer.join('\n') })
  return faqs
}

/**
 * Biyografi accordion başlığından ad ve ünvanı ayırır. Eski sitede iki farklı
 * biçim kullanılmış:
 *   Yönetim Kurulu: "Dündar Dayı (Yönetim Kurulu Başkanı)"
 *   Üst Yönetim:    "Dündar Dayı-Genel Müdür"
 */
function splitNameAndRole(heading: string): { name: string; role: string } {
  const parenthesised = heading.match(/^(.*?)\s*\((.+)\)\s*$/)
  if (parenthesised) {
    return { name: cleanText(parenthesised[1]), role: cleanText(parenthesised[2]) }
  }

  const dashed = heading.match(/^(.+?)\s*-\s*(.+)$/)
  if (dashed) return { name: cleanText(dashed[1]), role: cleanText(dashed[2]) }

  return { name: cleanText(heading), role: '' }
}

export function parsePage(legacyPath: string, html: string): ParsedPage {
  const $ = cheerio.load(html)
  const { locale, segments } = parseLocaleAndSegments(legacyPath)

  const container = $(CONTENT_SELECTOR) as unknown as cheerio.Cheerio<never>
  const title = cleanText($('h2').first().text())
  const breadcrumb: string[] = []
  $('#BreadcrumbMenu a, #BreadcrumbMenu span').each((_, element) => {
    const text = cleanText($(element).text())
    if (text && text !== '>' && !breadcrumb.includes(text)) breadcrumb.push(text)
  })

  const leaf = segments[segments.length - 1] ?? ''

  /*
   * Komisyon tablolarını yalnızca TR tarafında yapılandırılmış veriye
   * çeviriyoruz. İngilizce sayfalar farklı bir tablo şemasına sahip: iki ayrı
   * dönem bloğu (aracı kurum komisyonları + portföy yönetim ücretleri), ayrı
   * bir "Komisyon Oranları" alt bölümü ve "Term:" / "Stock Broker:" etiketleri
   * içeriyor. Bunları TR şemasına sıkıştırmak veri kaybına yol açardı; İngilizce
   * tabloları oldukları gibi sayfa içeriğinde bırakıyoruz.
   */
  const parseCommissions = locale === 'tr'

  const accordion = $('#accordion') as unknown as cheerio.Cheerio<never>
  const hasAccordion = accordion.length > 0
  const allDocuments = container.length > 0 ? collectDocuments($, container) : []

  let template: PageTemplate = TEMPLATE_BY_LEAF[leaf] ?? 'content'
  if (!TEMPLATE_BY_LEAF[leaf]) {
    if (hasAccordion && allDocuments.length > 0) template = 'documentArchive'
    else if (allDocuments.length > 0) template = 'content'
  }

  const archiveGroups: ParsedArchiveGroup[] = []
  const people: ParsedPerson[] = []
  const commissionYears: ParsedCommissionYear[] = []

  if (hasAccordion) {
    const groups = parseAccordion($, accordion)

    for (const group of groups) {
      if (template === 'bioAccordion') {
        const { name, role } = splitNameAndRole(group.heading)
        people.push({ name, role, bioHtml: sanitizeHtml(group.bodyHtml, legacyPath) })
        continue
      }

      if (template === 'dataTable') {
        const year = extractYear(group.heading)
        if (year && parseCommissions) {
          const parsed = parseCommissionTable($, group.bodyHtml, year)
          if (parsed) commissionYears.push(parsed)
        }
        continue
      }

      const scoped = cheerio.load(`<div id="g">${group.bodyHtml}</div>`, null, false)
      const documents = collectDocuments(
        scoped as unknown as cheerio.CheerioAPI,
        scoped('#g') as unknown as cheerio.Cheerio<never>,
      )
      archiveGroups.push({
        heading: group.heading,
        year: extractYear(group.heading),
        documents,
      })
    }
  }

  // Yıl bazlı alt sayfalar (2008-2017 komisyon bilgileri) accordion kullanmıyor
  if (parseCommissions && template === 'content' && /^(\d{4})-yili-komisyon-bilgileri$/.test(leaf)) {
    const year = Number(leaf.slice(0, 4))
    const parsed = parseCommissionTable($, container.html() ?? '', year)
    if (parsed) {
      template = 'dataTable'
      commissionYears.push(parsed)
    }
  }

  const rawContentHtml = container.length > 0 ? (container.html() ?? '') : ''

  /*
   * Accordion'u çıkarıp kalan içeriği koruyoruz. Sürekli Bilgilendirme Formu
   * sayfasında accordion'un üstünde ~5.000 karakterlik asıl form içeriği
   * (temel bilgiler, portföy bilgileri, ortaklık yapısı) bulunuyor; bunu atmak
   * gerçek bir içerik kaybı olurdu.
   */
  let contentHtml: string | null = null
  if (container.length > 0) {
    const withoutAccordion = cheerio.load(`<div id="root">${rawContentHtml}</div>`, null, false)
    withoutAccordion('#accordion').remove()

    /*
     * Yıl bazlı komisyon alt sayfalarında tablo accordion içinde değil, doğrudan
     * içerikte duruyor. Veriye çevrildiği için HTML kopyasını çıkarıyoruz,
     * aksi halde aynı tablo iki kez render edilirdi.
     */
    if (commissionYears.length > 0 && accordion.length === 0) {
      withoutAccordion('table.datatable').remove()
      withoutAccordion('strong.icerikbaslik').closest('table').remove()
    }

    const remaining = withoutAccordion('#root').html() ?? ''
    contentHtml = sanitizeHtml(remaining, legacyPath) || null

    /*
     * "Boş" sayılmak için metin olmaması yetmez: bazı sayfaların tek içeriği bir
     * görsel (ör. Organizasyon Şeması) veya tablo. Sadece metne bakmak bu
     * içerikleri sessizce siliyordu.
     */
    if (contentHtml) {
      const check = cheerio.load(`<div id="c">${contentHtml}</div>`, null, false)
      const hasText = cleanText(check('#c').text()).length > 0
      const hasMedia = check('#c').find('img, table, iframe').length > 0
      if (!hasText && !hasMedia) contentHtml = null
    }
  }

  const faqs = template === 'faq' ? parseFaqs(rawContentHtml) : []
  if (template === 'faq') contentHtml = null // sorular ayrı koleksiyona taşınıyor

  const images: string[] = []
  if (container.length > 0) {
    container.find('img[src]').each((_, element) => {
      const src = $(element).attr('src')
      if (src) images.push(src)
    })
  }

  /*
   * Komisyon tablosu kapsamı: TR ana sayfası accordion'da 2009-2026'yı
   * listeliyor, EN karşılığında hiç accordion yok, yıl alt sayfaları ise tek
   * yıl gösteriyor.
   */
  let commissionScope: 'none' | 'all' | 'single' = 'none'
  if (template === 'dataTable') {
    if (commissionYears.length > 1) commissionScope = 'all'
    else if (commissionYears.length === 1 && segments.length > 1) commissionScope = 'single'
  }

  return {
    legacyPath,
    cleanPath: toCleanPath(legacyPath),
    locale,
    segments,
    title,
    breadcrumb,
    template,
    commissionScope,
    commissionYear: commissionScope === 'single' ? commissionYears[0].year : null,
    contentHtml: contentHtml || null,
    archiveGroups,
    people,
    commissionYears,
    faqs,
    documents: allDocuments,
    images,
    isEmpty: cleanText(cheerio.load(`<div>${rawContentHtml}</div>`)('div').text()).length === 0,
  }
}

async function main() {
  const indexRaw = await fs.readFile(path.join(PAGES_DIR, '_index.json'), 'utf8')
  const { paths } = JSON.parse(indexRaw) as { paths: string[] }

  const pages: ParsedPage[] = []
  const emptyPages: string[] = []

  for (const legacyPath of paths) {
    if (DUPLICATE_PATHS.has(legacyPath)) continue
    const html = await fs.readFile(path.join(PAGES_DIR, pathToFilename(legacyPath)), 'utf8')
    const parsed = parsePage(legacyPath, html)
    pages.push(parsed)
    if (parsed.isEmpty && parsed.template !== 'landing') emptyPages.push(legacyPath)
  }

  await fs.writeFile(PARSED_FILE, JSON.stringify({ parsedAt: new Date().toISOString(), pages }, null, 2), 'utf8')

  const byTemplate = pages.reduce<Record<string, number>>((accumulator, page) => {
    accumulator[page.template] = (accumulator[page.template] ?? 0) + 1
    return accumulator
  }, {})

  const documentCount = new Set(pages.flatMap((page) => page.documents.map((d) => d.href))).size

  console.log(`Ayrıştırılan sayfa: ${pages.length}`)
  console.log('Şablon dağılımı:', byTemplate)
  console.log(`Tekil doküman bağlantısı: ${documentCount}`)
  console.log(`Biyografi: ${pages.reduce((n, p) => n + p.people.length, 0)}`)
  console.log(`Komisyon yılı: ${pages.reduce((n, p) => n + p.commissionYears.length, 0)}`)
  console.log(`SSS: ${pages.reduce((n, p) => n + p.faqs.length, 0)}`)
  if (emptyPages.length > 0) {
    console.warn(`İçeriği boş sayfalar (${emptyPages.length}):`)
    for (const page of emptyPages) console.warn(`  ${page}`)
  }
}

if (process.argv[1]?.includes('parse-pages')) {
  main().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
