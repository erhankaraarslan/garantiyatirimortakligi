/**
 * Ayrıştırılmış eski site içeriğini Payload'a yükler.
 *
 * Sıra önemli:
 *   1. Dokümanlar (link yeniden yazımı için ID/URL haritası gerekiyor)
 *   2. Sayfalar (hiyerarşi: üst sayfa alt sayfadan önce)
 *   3. Sayfaya bağlı koleksiyonlar (arşiv, biyografi, SSS, komisyon, ödüller)
 *   4. Menü/ayar globalleri
 *
 * Kullanım: pnpm migrate:seed
 */
import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import * as cheerio from 'cheerio'
import fs from 'fs/promises'
import { JSDOM } from 'jsdom'
import path from 'path'
import { getPayload, type Payload } from 'payload'

import config from '../../src/payload.config'
import { slugify } from '../../src/lib/utils'
import {
  DOCUMENTS_DIR,
  DOCUMENT_INDEX_FILE,
  PARSED_FILE,
  REPORT_DIR,
  USER_AGENT,
  encodeUrl,
} from './config'
import { inferPublishedAt } from './dates'
import { normalizePath } from './download-documents'
import { mapNavigationToEnglish } from './translations'
import type { ParsedPage } from './parse-pages'
import { ARCHIVE_CATEGORIES, EN_ONLY, TR_TO_EN, archiveCategoryFor } from './page-pairs'
import {
  AWARDS_SEED,
  EXTRA_MEDIA,
  HOME_MOSAIC_TILES,
  LOGO_SRC,
  shouldUseLegacyHtml,
} from './home-assets'
import type { DocumentIndex } from './download-documents'

type DocumentRef = { id: number; url: string }

async function main() {
  const payload = await getPayload({ config })

  const { pages } = JSON.parse(await fs.readFile(PARSED_FILE, 'utf8')) as { pages: ParsedPage[] }
  const documentIndex = JSON.parse(await fs.readFile(DOCUMENT_INDEX_FILE, 'utf8')) as DocumentIndex

  await fs.mkdir(REPORT_DIR, { recursive: true })

  const byPath = new Map(pages.map((page) => [page.cleanPath, page]))

  console.log('1/6 Dokümanlar yükleniyor...')
  const documentMap = await seedDocuments(payload, documentIndex, pages)

  console.log('2/6 Görseller yükleniyor...')
  const imageMap = await seedImages(payload, pages)

  console.log('3/6 Sayfalar oluşturuluyor...')
  const rewrite = createLinkRewriter(documentMap, byPath, imageMap)
  const pageMap = await seedPages(payload, pages, byPath, rewrite)

  console.log('4/6 Sayfa içi koleksiyonlar...')
  await seedArchiveItems(payload, pages, documentMap)
  await seedPeople(payload, pages, rewrite)
  await seedFaqs(payload, pages, rewrite)
  await seedCommissionYears(payload, pages)
  await seedAwards(payload, pages, imageMap)

  console.log('5/6 Sayfa ekleri...')
  await attachDocuments(payload, pages, pageMap, documentMap)

  console.log('6/6 Ana sayfa, menüler ve ayarlar...')
  await seedHomepage(payload, pageMap, byPath, rewrite, imageMap)
  await seedGlobals(payload, pageMap, imageMap)

  console.log('\nTamamlandı.')
  process.exit(0)
}

/* ------------------------------------------------------------------ */
/* Dokümanlar                                                          */
/* ------------------------------------------------------------------ */

async function seedDocuments(
  payload: Payload,
  index: DocumentIndex,
  pages: ParsedPage[],
): Promise<Map<string, DocumentRef>> {
  const map = new Map<string, DocumentRef>()

  // Doküman başlığı için sayfalardaki en açıklayıcı etiketi seç
  const labelByPath = new Map<string, string>()
  for (const page of pages) {
    for (const document of page.documents) {
      const key = normalizePath(document.href)
      const existing = labelByPath.get(key)
      if (document.label && (!existing || document.label.length > existing.length)) {
        labelByPath.set(key, document.label)
      }
    }
  }

  let created = 0
  for (const entry of index.entries) {
    const title =
      labelByPath.get(entry.originalPath) ||
      decodeURIComponent(entry.originalPath.split('/').pop() ?? '').replace(/^\d{8,}_?/, '')

    const doc = await payload.create({
      collection: 'documents',
      locale: 'tr',
      data: {
        title,
        originalPath: entry.originalPath,
        publishedAt: inferPublishedAt(entry.originalPath),
      },
      filePath: path.join(DOCUMENTS_DIR, entry.filename),
    })

    map.set(entry.originalPath, { id: doc.id as number, url: doc.url ?? '' })
    created += 1
    if (created % 100 === 0) console.log(`  ${created}/${index.entries.length}`)
  }

  console.log(`  ${created} doküman yüklendi`)
  return map
}

/* ------------------------------------------------------------------ */
/* Link yeniden yazımı                                                 */
/* ------------------------------------------------------------------ */

/**
 * İçerikteki eski bağlantıları yeni hedeflere çevirir:
 *   - /tr/...aspx (ve mutlak URL'leri) -> /tr/...
 *   - /gyo_files/x.pdf -> yeni doküman URL'i
 * SSS cevaplarında ve içerik metinlerinde onlarca eski bağlantı var; bunlar
 * dönüştürülmezse yayın sonrası hepsi 404 verirdi.
 */
/* ------------------------------------------------------------------ */
/* Görseller                                                           */
/* ------------------------------------------------------------------ */

/**
 * İçerikte gömülü görselleri Media koleksiyonuna yükler.
 *
 * Payload, HTML->Lexical dönüşümünde <img> etiketlerini kendiliğinden
 * yüklemiyor; upload node'unun geçerli olması için önce görselin yüklenip
 * data-lexical-upload-id özniteliğinin verilmesi gerekiyor.
 */
async function seedImages(
  payload: Payload,
  pages: ParsedPage[],
): Promise<Map<string, DocumentRef>> {
  const sources = new Map<string, string>() // src -> alt

  for (const page of pages) {
    for (const html of [page.contentHtml, ...page.people.map((person) => person.bioHtml)]) {
      if (!html) continue
      const $ = cheerio.load(`<div id="root">${html}</div>`, null, false)
      $('img[src]').each((_, element) => {
        const src = $(element).attr('src')
        if (!src) return
        const key = normalizePath(src)
        if (!sources.has(key)) sources.set(key, $(element).attr('alt') ?? '')
      })
    }
  }

  for (const extra of EXTRA_MEDIA) {
    const key = normalizePath(extra.src)
    if (!sources.has(extra.src) && !sources.has(key)) {
      sources.set(extra.src, extra.alt)
    }
  }

  const map = new Map<string, DocumentRef>()

  for (const [src, alt] of sources) {
    try {
      const response = await fetch(encodeUrl(src), { headers: { 'User-Agent': USER_AGENT } })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const buffer = Buffer.from(await response.arrayBuffer())
      const name = decodeURIComponent(src.split('/').pop() ?? 'gorsel.png').replace(/^\d{8,}_?/, '')

      const media = await payload.create({
        collection: 'media',
        locale: 'tr',
        data: {
          alt: alt || name.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' '),
          originalPath: src,
        },
        file: {
          data: buffer,
          mimetype: response.headers.get('content-type') ?? 'image/png',
          name,
          size: buffer.byteLength,
        },
      })

      if (!media.url) throw new Error('Yükleme URL üretmedi')
      map.set(src, { id: media.id as number, url: media.url })
    } catch (error) {
      console.warn(`  Görsel yüklenemedi: ${src} — ${(error as Error).message}`)
    }
  }

  console.log(`  ${map.size}/${sources.size} görsel yüklendi`)
  if (process.env.DEBUG_MIGRATION) {
    for (const [src, ref] of map) console.log(`    ${src} -> id=${ref.id} url=${ref.url}`)
  }
  return map
}

/**
 * Kodlanmamış URL'leri geçerli hale getirir. Eski içerikte dış bağlantılar
 * boşluk ve Türkçe karakter içeriyor (ör. KAP sorgu dizesindeki
 * "&secimler= GARANTİ YATIRIM ORTAKLIĞI A.Ş. [ GRNYO ]"); bu URL'ler Payload'ın
 * link doğrulamasından geçmiyor. URL yapıcısı gerekli yerleri yüzde-kodlarken
 * hâlihazırda kodlanmış kısımları ikinci kez kodlamıyor.
 */
function safeUrl(href: string): string {
  if (/^(mailto:|tel:|#)/i.test(href)) return href

  try {
    const isAbsolute = /^[a-z][a-z0-9+.-]*:\/\//i.test(href)
    const url = new URL(href, 'http://legacy.invalid')
    return isAbsolute ? url.href : `${url.pathname}${url.search}${url.hash}`
  } catch {
    return encodeURI(href)
  }
}

function looksLikeRawUrl(text: string): boolean {
  return /^(https?:\/\/|www\.|\/(?:tr|en)\/)/i.test(text.trim())
}

function createLinkRewriter(
  documentMap: Map<string, DocumentRef>,
  pageMap: Map<string, ParsedPage>,
  imageMap: Map<string, DocumentRef>,
) {
  /** Tek bir eski hedefi yeni hedefe çevirir; çeviremezse null döner. */
  function resolve(rawHref: string): string | null {
    const normalized = normalizePath(rawHref)

    const document = documentMap.get(normalized)
    if (document) return document.url

    const cleanPath = normalized.replace(/\.aspx$/i, '')
    if (pageMap.has(cleanPath)) return cleanPath

    return null
  }

  return function rewrite(html: string): string {
    const $ = cheerio.load(`<div id="root">${html}</div>`, null, false)

    /*
     * href'leri regex ile değil öznitelik üzerinden çeviriyoruz: eski dosya
     * adlarında boşluk var (ör. "GYO_KVKK_md. 11_Başvuru_Yöntemleri.docx") ve
     * regex sınırları bu URL'leri ortadan kesiyor. Boşluklu URL'ler ayrıca
     * Payload'ın link doğrulamasını da bozuyor.
     */
    $('a[href]').each((_, element) => {
      const anchor = $(element)
      const href = anchor.attr('href')
      if (!href) return

      const resolved = resolve(href)
      const nextHref = resolved ?? safeUrl(href)
      anchor.attr('href', nextHref)

      const text = anchor.text().trim()
      if (looksLikeRawUrl(text) && resolved) {
        const page = pageMap.get(resolved.replace(/\.aspx$/i, ''))
        if (page?.title) anchor.text(page.title)
      }
    })

    /*
     * Lexical upload node'u için gerekli öznitelikler. Yüklenemeyen görselleri
     * kaldırıyoruz; aksi halde tüm sayfanın doğrulaması başarısız oluyor.
     */
    $('img[src]').each((_, element) => {
      const image = $(element)
      const media = imageMap.get(normalizePath(image.attr('src') ?? ''))

      if (!media) {
        image.remove()
        return
      }

      image.attr('src', media.url)
      image.attr('data-lexical-upload-id', String(media.id))
      image.attr('data-lexical-upload-relation-to', 'media')
    })

    let output = $('#root').html() ?? ''

    /*
     * SSS cevaplarında ve bazı içeriklerde bağlantılar düz metin olarak
     * yazılmış (ör. "http://www.gyo.com.tr/tr/...aspx adresinden
     * ulaşabilirsiniz"). Bunları da yeni hedeflere çeviriyoruz.
     */
    output = output.replace(
      /https?:\/\/(?:www\.)?gyo\.com\.tr(\/[^\s"'<>)]+?\.(?:aspx|pdf|docx?|xlsx?|zip|pptx?))/gi,
      (match, rawPath: string) => resolve(rawPath) ?? match,
    )

    return output
  }
}

/* ------------------------------------------------------------------ */
/* HTML -> Lexical                                                     */
/* ------------------------------------------------------------------ */

let editorConfigPromise: ReturnType<typeof editorConfigFactory.default> | null = null

async function getEditorConfig() {
  // payload.config varsayılan ihracı bir Promise; factory çözümlenmiş config bekliyor
  if (!editorConfigPromise) {
    editorConfigPromise = editorConfigFactory.default({ config: await config })
  }
  return editorConfigPromise
}

async function toLexical(html: string | null | undefined) {
  if (!html || html.trim() === '') return undefined

  const state = convertHTMLToLexical({
    editorConfig: await getEditorConfig(),
    html,
    JSDOM,
  })

  return coerceUploadIds(state)
}

/**
 * `data-lexical-upload-id` bir HTML özniteliği olduğu için dönüştürücü upload
 * node'una ID'yi metin olarak yazıyor ("value": "6"). Postgres adaptöründe
 * ilişki ID'leri sayısal olduğundan Payload bunu geçersiz sayıyor.
 * Sayıya çevrilebilen değerleri düzeltiyoruz.
 */
function coerceUploadIds<T>(node: T): T {
  if (Array.isArray(node)) {
    node.forEach(coerceUploadIds)
    return node
  }

  if (node && typeof node === 'object') {
    const record = node as Record<string, unknown>

    if (record.type === 'upload' && typeof record.value === 'string' && /^\d+$/.test(record.value)) {
      record.value = Number(record.value)
    }

    for (const value of Object.values(record)) coerceUploadIds(value)
  }

  return node
}

/** Zorunlu zengin metin alanları için: boş içerikte geçerli ama boş bir durum döndürür. */
async function toLexicalRequired(html: string | null | undefined) {
  return (await toLexical(html)) ?? (await toLexical('<p></p>'))!
}

/* ------------------------------------------------------------------ */
/* Sayfalar                                                            */
/* ------------------------------------------------------------------ */

async function seedPages(
  payload: Payload,
  pages: ParsedPage[],
  byPath: Map<string, ParsedPage>,
  rewrite: (html: string) => string,
) {
  const enToTr = new Map<string, string>()
  for (const [tr, en] of Object.entries(TR_TO_EN)) if (en) enToTr.set(en, tr)

  // Yıl bazlı komisyon sayfalarını da eşleştir
  for (const page of pages) {
    if (page.locale !== 'en') continue
    const match = page.cleanPath.match(/the-commission-information-of-the-year-(\d{4})$/)
    if (match) {
      enToTr.set(page.cleanPath, `/tr/surekli-bilgilendirme-formu/${match[1]}-yili-komisyon-bilgileri`)
    }
  }

  const trPages = pages.filter((page) => page.locale === 'tr')
  // Üst sayfalar alt sayfalardan önce oluşturulmalı
  trPages.sort((a, b) => a.segments.length - b.segments.length || a.cleanPath.localeCompare(b.cleanPath))

  const pageMap = new Map<string, number>() // TR clean path -> Payload id
  const untranslated: string[] = []

  for (const page of trPages) {
    const parentPath =
      page.segments.length > 1 ? `/tr/${page.segments.slice(0, -1).join('/')}` : undefined
    const parentId = parentPath ? pageMap.get(parentPath) : undefined

    const enPath = TR_TO_EN[page.cleanPath] ?? commissionEnPath(page.cleanPath)
    const enPage = enPath ? byPath.get(enPath) : undefined

    const created = await withPageContext(page.cleanPath, async () =>
      payload.create({
        collection: 'pages',
        locale: 'tr',
        data: {
          title: page.title || titleFromSlug(page.segments.at(-1) ?? ''),
          slug: page.segments.at(-1) ?? 'ana-sayfa',
          parent: parentId ?? null,
          template: page.template,
          order: 0,
          archiveCategory: ARCHIVE_CATEGORIES[page.cleanPath] ?? null,
          bioGroup: bioGroupFor(page.cleanPath),
          commissionScope: page.commissionScope,
          commissionYear: page.commissionYear,
          content: await toLexical(page.contentHtml ? rewrite(page.contentHtml) : null),
          legacyHtml: shouldUseLegacyHtml(page) && page.contentHtml ? rewrite(page.contentHtml) : null,
          legacyPaths: [
            { path: page.legacyPath },
            ...(enPage ? [{ path: enPage.legacyPath }] : []),
          ],
          translationStatus: 'complete',
          _status: 'published',
        },
      }),
    )

    const id = created.id as number
    pageMap.set(page.cleanPath, id)

    if (enPage) {
      await payload.update({
        collection: 'pages',
        id,
        locale: 'en',
        data: {
          title: enPage.title || titleFromSlug(enPage.segments.at(-1) ?? ''),
          slug: enPage.segments.at(-1) ?? 'home',
          commissionScope: enPage.commissionScope,
          commissionYear: enPage.commissionYear,
          content: await toLexical(enPage.contentHtml ? rewrite(enPage.contentHtml) : null),
          legacyHtml:
            shouldUseLegacyHtml(enPage) && enPage.contentHtml ? rewrite(enPage.contentHtml) : null,
          translationStatus: 'complete',
        },
      })
    } else {
      /*
       * Çevirisi olmayan 18 sayfa. EN slug'ını TR slug'ından türetip iskeleti
       * kuruyoruz; içerik boş kalıyor ve translationStatus='missing' ile işaretleniyor, böylece
       * editör panelde eksikleri filtreleyebiliyor.
       */
      untranslated.push(page.cleanPath)
      await payload.update({
        collection: 'pages',
        id,
        locale: 'en',
        data: {
          title: page.title || titleFromSlug(page.segments.at(-1) ?? ''),
          slug: page.segments.at(-1) ?? 'page',
          commissionScope: page.commissionScope,
          commissionYear: page.commissionYear,
          translationStatus: 'missing',
        },
      })
    }
  }

  // Yalnızca EN'de bulunan sayfalar (Başkanın Mesajı)
  for (const [enPath, trInfo] of Object.entries(EN_ONLY)) {
    const enPage = byPath.get(enPath)
    if (!enPage) continue

    const created = await payload.create({
      collection: 'pages',
      locale: 'en',
      data: {
        title: enPage.title,
        slug: enPage.segments.at(-1) ?? 'message',
        parent: pageMap.get('/tr/kurumsal') ?? null,
        template: enPage.template,
        content: await toLexical(enPage.contentHtml ? rewrite(enPage.contentHtml) : null),
        legacyPaths: [{ path: enPage.legacyPath }],
        _status: 'published',
      },
    })

    await payload.update({
      collection: 'pages',
      id: created.id as number,
      locale: 'tr',
      data: {
        title: trInfo.trTitle,
        slug: trInfo.trSlug,
        translationStatus: 'missing',
      },
    })
    pageMap.set(`/tr/kurumsal/${trInfo.trSlug}`, created.id as number)
  }

  await fs.writeFile(
    path.join(REPORT_DIR, 'untranslated-pages.json'),
    JSON.stringify({ count: untranslated.length, pages: untranslated }, null, 2),
    'utf8',
  )

  console.log(`  ${pageMap.size} sayfa oluşturuldu`)
  console.log(`  ${untranslated.length} sayfanın EN çevirisi eksik (translationStatus=missing)`)
  return pageMap
}

/**
 * Payload'ın doğrulama hataları hangi dokümanda oluştuğunu söylemiyor;
 * 104 sayfalık bir seed'de bu hatayı bulmayı imkânsız kılıyor. Bağlamı ekliyoruz.
 */
async function withPageContext<T>(cleanPath: string, operation: () => Promise<T>): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    const details = (error as { data?: { errors?: unknown[] } })?.data?.errors
    console.error(`\nSayfa yazılamadı: ${cleanPath}`)
    if (details) console.error(JSON.stringify(details, null, 2))
    throw error
  }
}

function commissionEnPath(trPath: string): string | null {
  const match = trPath.match(/\/(\d{4})-yili-komisyon-bilgileri$/)
  if (!match) return null
  const year = Number(match[1])
  return year >= 2008 && year <= 2012
    ? `/en/regular-public-disclosure-form/the-commission-information-of-the-year-${year}`
    : null
}

function bioGroupFor(cleanPath: string): 'board' | 'executives' | null {
  if (cleanPath.endsWith('yonetim-kurulu-uyeleri')) return 'board'
  if (cleanPath.endsWith('ust-yonetim')) return 'executives'
  return null
}

function titleFromSlug(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/^\w/, (char) => char.toUpperCase())
}

/* ------------------------------------------------------------------ */
/* Arşiv kayıtları                                                     */
/* ------------------------------------------------------------------ */

async function seedArchiveItems(
  payload: Payload,
  pages: ParsedPage[],
  documentMap: Map<string, DocumentRef>,
) {
  const counts = { tr: 0, en: 0 }
  const orphans: string[] = []

  for (const page of pages) {
    const category = archiveCategoryFor(page.cleanPath)
    if (!category || page.archiveGroups.length === 0) continue

    for (const group of page.archiveGroups) {
      let order = 0
      for (const document of group.documents) {
        const ref = documentMap.get(normalizePath(document.href))
        if (!ref) {
          orphans.push(`${page.cleanPath} -> ${document.href}`)
          continue
        }

        const label = document.label || ref.url.split('/').pop() || 'Doküman'

        const created = await payload.create({
          collection: 'document-archive-items',
          locale: page.locale,
          data: {
            category,
            language: page.locale,
            // Grup başlığında yıl yoksa (ör. tek gruplu politika sayfaları) 0 kullan
            year: group.year ?? 0,
            groupLabel: group.heading,
            period: document.label || null,
            label,
            document: ref.id,
            order: order++,
          },
        })
        counts[page.locale] += 1

        /*
         * Etiketleri diğer dilde de yazıyoruz: localization fallback kapalı
         * olduğundan yalnızca tek dilde yazılan etiket öbür dilde boş görünür.
         * Doküman adları tarih/dönem bilgisi taşıdığı için dilden bağımsız
         * okunabiliyor, bu yüzden aynı değeri kullanmak kabul edilebilir.
         */
        const otherLocale = page.locale === 'tr' ? 'en' : 'tr'
        await payload.update({
          collection: 'document-archive-items',
          id: created.id as number,
          locale: otherLocale,
          data: { label, groupLabel: group.heading },
        })
      }
    }
  }

  const count = counts.tr + counts.en
  console.log(`  ${count} arşiv kaydı (TR: ${counts.tr}, EN: ${counts.en})`)
  if (orphans.length > 0) {
    await fs.writeFile(
      path.join(REPORT_DIR, 'orphan-archive-links.json'),
      JSON.stringify(orphans, null, 2),
      'utf8',
    )
    console.log(`  ${orphans.length} arşiv bağlantısı dokümana eşlenemedi (rapora yazıldı)`)
  }
}

/* ------------------------------------------------------------------ */
/* Biyografiler, SSS, komisyon, ödüller                                */
/* ------------------------------------------------------------------ */

async function seedPeople(
  payload: Payload,
  pages: ParsedPage[],
  rewrite: (html: string) => string,
) {
  const trBoard = pages.find((page) => page.cleanPath === '/tr/kurumsal/yonetim-kurulu-uyeleri')
  const trExec = pages.find((page) => page.cleanPath === '/tr/kurumsal/ust-yonetim')
  const enBoard = pages.find((page) => page.cleanPath === '/en/corporate/members-of-the-board')
  const enExec = pages.find((page) => page.cleanPath === '/en/corporate/top-management')

  let count = 0
  let matched = 0
  const staleEnglish: { group: string; name: string; role: string }[] = []

  for (const [trPage, enPage, group] of [
    [trBoard, enBoard, 'board'],
    [trExec, enExec, 'executives'],
  ] as const) {
    if (!trPage) continue

    const matchedEnglishNames = new Set<string>()

    for (const [index, person] of trPage.people.entries()) {
      const created = await payload.create({
        collection: 'people',
        locale: 'tr',
        data: {
          name: person.name,
          // Ünvan çıkarılamadıysa grup adını yedek olarak kullan
          role: person.role || (group === 'board' ? 'Yönetim Kurulu Üyesi' : 'Üst Yönetim'),
          group,
          bio: await toLexical(rewrite(person.bioHtml)),
          order: index,
        },
      })

      // EN biyografisini adla eşleştir; sıralama iki dilde aynı olmayabilir
      const enPerson = enPage?.people.find(
        (candidate) => normalizeName(candidate.name) === normalizeName(person.name),
      )
      if (enPerson) {
        matchedEnglishNames.add(normalizeName(enPerson.name))
        matched += 1
        await payload.update({
          collection: 'people',
          id: created.id as number,
          locale: 'en',
          data: {
            role: enPerson.role || person.role,
            bio: await toLexical(rewrite(enPerson.bioHtml)),
          },
        })
      }
      count += 1
    }

    /*
     * TR'de bulunmayan EN kayıtları: İngilizce sayfa güncellenmemiş ve artık
     * görevde olmayan kişileri listeliyor. Taşımıyoruz, ama rapora yazıyoruz.
     */
    for (const enPerson of enPage?.people ?? []) {
      if (!matchedEnglishNames.has(normalizeName(enPerson.name))) {
        staleEnglish.push({ group, name: enPerson.name, role: enPerson.role })
      }
    }
  }

  console.log(`  ${count} yönetici biyografisi (${matched} tanesinin EN çevirisi var)`)

  if (staleEnglish.length > 0) {
    await fs.writeFile(
      path.join(REPORT_DIR, 'stale-english-people.json'),
      JSON.stringify(
        {
          note: 'Eski sitedeki İngilizce yönetim sayfalarında listelenen, Türkçe sayfada bulunmayan kişiler. İngilizce içerik güncellenmemiş; bu kayıtlar taşınmadı.',
          people: staleEnglish,
        },
        null,
        2,
      ),
      'utf8',
    )
    console.log(
      `  ${staleEnglish.length} EN kaydı TR'de yok (İngilizce sayfa güncel değil, rapora yazıldı)`,
    )
  }
}

function normalizeName(name: string): string {
  return slugify(name)
}

async function seedFaqs(payload: Payload, pages: ParsedPage[], rewrite: (html: string) => string) {
  const trFaqPage = pages.find((page) => page.cleanPath === '/tr/sikca-sorulan-sorular')
  if (!trFaqPage) return

  for (const [index, faq] of trFaqPage.faqs.entries()) {
    await payload.create({
      collection: 'faqs',
      locale: 'tr',
      data: {
        question: faq.question,
        answer: await toLexicalRequired(rewrite(faq.answer)),
        order: index,
      },
    })
  }
  console.log(`  ${trFaqPage.faqs.length} SSS kaydı (EN çevirisi bekliyor)`)
}

async function seedCommissionYears(payload: Payload, pages: ParsedPage[]) {
  // Aynı yıl hem accordion'da hem alt sayfada geçebiliyor; yıl bazında tekilleştir
  const trByYear = new Map<number, ParsedPage['commissionYears'][number]>()
  const enByYear = new Map<number, ParsedPage['commissionYears'][number]>()

  for (const page of pages) {
    const target = page.locale === 'tr' ? trByYear : enByYear
    for (const entry of page.commissionYears) {
      // Accordion verisi alt sayfadan daha güncel olabilir; satır sayısı fazla olanı seç
      const existing = target.get(entry.year)
      if (!existing || entry.rows.length > existing.rows.length) target.set(entry.year, entry)
    }
  }

  for (const [year, entry] of [...trByYear.entries()].sort((a, b) => b[0] - a[0])) {
    const created = await payload.create({
      collection: 'commission-years',
      locale: 'tr',
      data: {
        year,
        heading: entry.heading,
        intermediary: entry.intermediary,
        periods: entry.periods.map((label) => ({ label })),
        rows: entry.rows.map((row) => ({
          metric: row.metric,
          values: row.values.map((value) => ({ value })),
        })),
      },
    })

    const enEntry = enByYear.get(year)
    if (enEntry) {
      await payload.update({
        collection: 'commission-years',
        id: created.id as number,
        locale: 'en',
        data: {
          heading: enEntry.heading,
          intermediary: enEntry.intermediary,
          periods: enEntry.periods.map((label) => ({ label })),
          rows: enEntry.rows.map((row) => ({
            metric: row.metric,
            values: row.values.map((value) => ({ value })),
          })),
        },
      })
    }
  }

  console.log(`  ${trByYear.size} komisyon yılı (EN: ${enByYear.size})`)
}

/**
 * Ödüller eski sitede düz metin paragrafları + 4 görselden oluşuyordu.
 * Metinden yapılandırılmış kayıt çıkarmak güvenilir olmadığı için ödül
 * metnini sayfa içeriğinde bırakıyoruz; görseller elle eklenecek.
 */
async function seedAwards(
  payload: Payload,
  _pages: ParsedPage[],
  imageMap: Map<string, DocumentRef>,
) {
  const { totalDocs } = await payload.count({ collection: 'awards' })
  if (totalDocs > 0) {
    console.log(`  Ödüller zaten var (${totalDocs}), atlanıyor`)
    return
  }

  for (const award of AWARDS_SEED) {
    const image = imageMap.get(award.image) ?? imageMap.get(normalizePath(award.image))
    const created = await payload.create({
      collection: 'awards',
      locale: 'tr',
      data: {
        title: award.titleTr,
        issuer: award.issuerTr,
        year: award.year,
        image: image?.id ?? null,
      },
    })
    await payload.update({
      collection: 'awards',
      id: created.id,
      locale: 'en',
      data: {
        title: award.titleEn,
        issuer: award.issuerEn,
      },
    })
  }

  console.log(`  ${AWARDS_SEED.length} ödül yazıldı`)
}

/* ------------------------------------------------------------------ */
/* Sayfa ekleri                                                        */
/* ------------------------------------------------------------------ */

/**
 * Arşiv şablonu kullanmayan ama PDF'e link veren sayfalar (Esas Sözleşme,
 * Organizasyon Şeması, Etik İlkeler vb.) için ek listesi kurar.
 */
async function attachDocuments(
  payload: Payload,
  pages: ParsedPage[],
  pageMap: Map<string, number>,
  documentMap: Map<string, DocumentRef>,
) {
  let count = 0

  for (const page of pages) {
    if (page.locale !== 'tr') continue
    if (ARCHIVE_CATEGORIES[page.cleanPath]) continue
    if (page.documents.length === 0) continue

    const id = pageMap.get(page.cleanPath)
    if (!id) continue

    const attachments = page.documents
      .map((document) => {
        const ref = documentMap.get(normalizePath(document.href))
        return ref ? { label: document.label || null, document: ref.id } : null
      })
      .filter((value): value is { label: string | null; document: number } => value !== null)

    if (attachments.length === 0) continue

    await payload.update({
      collection: 'pages',
      id,
      locale: 'tr',
      data: { attachments },
    })
    count += attachments.length
  }

  console.log(`  ${count} sayfa eki bağlandı`)
}

/* ------------------------------------------------------------------ */
/* Globaller                                                           */
/* ------------------------------------------------------------------ */

/**
 * Ana sayfa içeriği.
 *
 * Eski ana sayfa boş değildi: #home_main içinde 7 fotoğraflık bir mozaik vardı.
 * (İçerik placeholder'ı boş olduğu için parse bunu kaçırıyordu.) Hero metni
 * BBVA dilinde; sağ kolon orijinal mozaik fotoğraflarını kullanır.
 */
async function seedHomepage(
  payload: Payload,
  pageMap: Map<string, number>,
  byPath: Map<string, ParsedPage>,
  rewrite: (html: string) => string,
  imageMap: Map<string, DocumentRef>,
) {
  const homeId = pageMap.get('/tr/ana-sayfa')
  if (!homeId) {
    console.warn('  Ana sayfa bulunamadı, atlanıyor')
    return
  }

  const corporate = byPath.get('/tr/kurumsal')
  const corporateEn = byPath.get('/en/corporate')

  const shortcut = (trPath: string, title: string, description: string) => {
    const page = pageMap.get(trPath)
    return page ? [{ title, description, page }] : []
  }

  const mosaicFor = (locale: 'tr' | 'en') =>
    HOME_MOSAIC_TILES.flatMap((tile) => {
      const page = pageMap.get(tile.trPath)
      const image = imageMap.get(tile.src) ?? imageMap.get(normalizePath(tile.src))
      if (!page || !image) return []
      return [{ title: locale === 'tr' ? tile.tr : tile.en, image: image.id, page }]
    })

  const heroImage =
    imageMap.get('/images/home/yatirimciiliskileri.jpg') ??
    imageMap.get(normalizePath('/images/home/yatirimciiliskileri.jpg'))

  await payload.update({
    collection: 'pages',
    id: homeId,
    locale: 'tr',
    data: {
      title: 'Garanti Yatırım Ortaklığı A.Ş.',
      hero: {
        headline: 'Yatırımcılarımız için şeffaf ve istikrarlı portföy yönetimi',
        subline:
          '1996’dan bu yana sermaye piyasalarında faaliyet gösteren bir menkul kıymet yatırım ortaklığı olarak, finansal raporlarımızı ve kurumsal yönetim bilgilerimizi eksiksiz paylaşıyoruz.',
        ctaLabel: 'Yatırımcı İlişkileri',
        ctaPage: pageMap.get('/tr/yatirimci-iliskileri') ?? null,
        image: heroImage?.id ?? null,
        badges: [
          { value: '1996', label: 'Kuruluş yılı' },
          { value: 'GRNYO', label: 'BIST işlem kodu' },
          { value: '99,7%', label: 'Halka açıklık oranı' },
        ],
      },
      mosaic: mosaicFor('tr'),
      shortcuts: [
        ...shortcut(
          '/tr/yatirimci-iliskileri/operasyonel-finansal-veriler/faaliyet-raporlari',
          'Faaliyet Raporları',
          'Çeyreklik ve yıllık faaliyet raporlarının tamamı.',
        ),
        ...shortcut(
          '/tr/yatirimci-iliskileri/operasyonel-finansal-veriler/finansal-tablolar-ve-dipnotlar',
          'Finansal Tablolar',
          'Finansal tablolar ve dipnotlar, dönem bazında arşiv.',
        ),
        ...shortcut(
          '/tr/yatirimci-iliskileri/kurumsal-yonetim/genel-kurul',
          'Genel Kurul',
          'Gündemler, tutanaklar, hazirunlar ve bilgilendirme dokümanları.',
        ),
        ...shortcut(
          '/tr/yatirimci-iliskileri/kurumsal-yonetim',
          'Kurumsal Yönetim',
          'Politikalar, esas sözleşme, komiteler ve uyum raporları.',
        ),
      ],
      content: await toLexical(corporate?.contentHtml ? rewrite(corporate.contentHtml) : null),
    },
  })

  await payload.update({
    collection: 'pages',
    id: homeId,
    locale: 'en',
    data: {
      title: 'Garanti Investment Trust Inc.',
      hero: {
        headline: 'Transparent and stable portfolio management for our investors',
        subline:
          'As a securities investment trust operating in the capital markets since 1996, we publish our financial reports and corporate governance information in full.',
        ctaLabel: 'Investor Relations',
        ctaPage: pageMap.get('/tr/yatirimci-iliskileri') ?? null,
        image: heroImage?.id ?? null,
        badges: [
          { value: '1996', label: 'Founded' },
          { value: 'GRNYO', label: 'BIST ticker' },
          { value: '99.7%', label: 'Free float' },
        ],
      },
      mosaic: mosaicFor('en'),
      shortcuts: [
        ...shortcut(
          '/tr/yatirimci-iliskileri/operasyonel-finansal-veriler/faaliyet-raporlari',
          'Annual Reports',
          'Quarterly and annual activity reports in full.',
        ),
        ...shortcut(
          '/tr/yatirimci-iliskileri/operasyonel-finansal-veriler/finansal-tablolar-ve-dipnotlar',
          'Financial Statements',
          'Financial statements and footnotes, archived by period.',
        ),
        ...shortcut(
          '/tr/yatirimci-iliskileri/kurumsal-yonetim/genel-kurul',
          'General Assembly',
          'Agendas, minutes, attendance lists and information documents.',
        ),
        ...shortcut(
          '/tr/yatirimci-iliskileri/kurumsal-yonetim',
          'Corporate Governance',
          'Policies, articles of association, committees and compliance reports.',
        ),
      ],
      content: await toLexical(corporateEn?.contentHtml ? rewrite(corporateEn.contentHtml) : null),
      translationStatus: 'complete',
    },
  })

  console.log('  Ana sayfa içeriği yazıldı (TR + EN)')
}

async function seedGlobals(
  payload: Payload,
  pageMap: Map<string, number>,
  imageMap: Map<string, DocumentRef>,
) {
  const id = (trPath: string) => pageMap.get(trPath) ?? null

  const pageLink = (trPath: string, label: string) => ({
    label,
    type: 'page' as const,
    page: id(trPath),
  })

  await payload.updateGlobal({
    slug: 'navigation',
    locale: 'tr',
    data: {
      affiliateBar: [
        { label: 'Garanti BBVA', type: 'external', url: 'https://www.garantibbva.com.tr/', isActive: false },
        { label: 'Bonus', type: 'external', url: 'https://www.bonus.com.tr/', isActive: false },
        { label: 'Yatırım', type: 'external', url: 'https://www.garantibbvayatirim.com.tr/', isActive: false },
        { label: 'Emeklilik', type: 'external', url: 'https://www.garantibbvaemeklilik.com.tr/', isActive: false },
        { label: 'Tami', type: 'external', url: 'https://www.tami.com.tr/', isActive: false },
        { label: 'Kripto', type: 'external', url: 'https://www.garantibbvakripto.com.tr/', isActive: false },
        { label: 'Yatırım Ortaklığı', type: 'page', page: id('/tr/ana-sayfa'), isActive: true },
      ],
      mainMenu: [
        {
          ...pageLink('/tr/kurumsal', 'Kurumsal'),
          columns: [
            {
              heading: 'Şirket',
              links: [
                pageLink('/tr/kurumsal', 'Hakkımızda'),
                pageLink('/tr/vizyon', 'Vizyon ve Misyon'),
                pageLink('/tr/insan-kaynaklari', 'İnsan Kaynakları'),
                pageLink('/tr/kurumsal/organizasyon-semasi', 'Organizasyon Şeması'),
                pageLink('/tr/kurumsal/oduller', 'Ödüller'),
              ],
            },
            {
              heading: 'Yönetim',
              links: [
                pageLink('/tr/kurumsal/yonetim-kurulu-uyeleri', 'Yönetim Kurulu Üyeleri'),
                pageLink('/tr/kurumsal/ust-yonetim', 'Üst Yönetim'),
              ],
            },
            {
              heading: 'Akademik Görüşler',
              links: [
                pageLink('/tr/kurumsal/akademik-gorusler', 'Akademik Görüşler'),
                pageLink('/tr/kurumsal/akademik-gorusler/yararlanma-kosullari', 'Yararlanma Koşulları'),
                pageLink('/tr/kurumsal/akademik-gorusler/yazilar', 'Yazılar'),
              ],
            },
          ],
        },
        {
          ...pageLink('/tr/yatirimci-iliskileri', 'Yatırımcı İlişkileri'),
          columns: [
            {
              heading: 'Kurumsal Yönetim',
              links: [
                pageLink('/tr/yatirimci-iliskileri/kurumsal-yonetim', 'Kurumsal Yönetim'),
                pageLink('/tr/yatirimci-iliskileri/kurumsal-yonetim/genel-kurul', 'Genel Kurul'),
                pageLink('/tr/yatirimci-iliskileri/kurumsal-yonetim/politikalar', 'Politikalar'),
                pageLink('/tr/yatirimci-iliskileri/kurumsal-yonetim/sermaye-ve-ortaklik-yapisi', 'Sermaye ve Ortaklık Yapısı'),
                pageLink('/tr/yatirimci-iliskileri/kurumsal-yonetim/sirket-esas-sozlesmesi', 'Şirket Esas Sözleşmesi'),
              ],
            },
            {
              heading: 'Finansal Veriler',
              links: [
                pageLink('/tr/yatirimci-iliskileri/operasyonel-finansal-veriler/faaliyet-raporlari', 'Faaliyet Raporları'),
                pageLink('/tr/yatirimci-iliskileri/operasyonel-finansal-veriler/finansal-tablolar-ve-dipnotlar', 'Finansal Tablolar ve Dipnotlar'),
                pageLink('/tr/yatirimci-iliskileri/operasyonel-finansal-veriler/bagimsiz-denetim-raporlari', 'Bağımsız Denetim Raporları'),
                pageLink('/tr/yatirimci-iliskileri/operasyonel-finansal-veriler/performans-sunus-raporlari', 'Performans Sunuş Raporları'),
                pageLink('/tr/yatirimci-iliskileri/operasyonel-finansal-veriler/sermaye-artirimlari', 'Sermaye Artırımları'),
              ],
            },
            {
              heading: 'İletişim',
              links: [
                pageLink('/tr/yatirimci-iliskileri/yatirimci-iliskileri-bolumu-iletisim', 'Yatırımcı İlişkileri Bölümü'),
                pageLink('/tr/yatirimci-iliskileri/kurumsal-yonetim/ozel-durum-aciklamalari', 'Özel Durum Açıklamaları'),
              ],
            },
          ],
        },
        { ...pageLink('/tr/surekli-bilgilendirme-formu', 'Bilgilendirme'), columns: [] },
      ],
      headerUtility: [pageLink('/tr/bize-ulasin', 'Bize Ulaşın')],
      headerCta: {
        label: 'KAP',
        type: 'external' as const,
        url: 'https://kap.org.tr/tr/sirket-bilgileri/ozet/961-garanti-yatirim-ortakligi-a-s',
      },
      footerColumns: [
        {
          heading: 'Kurumsal',
          links: [
            pageLink('/tr/kurumsal', 'Hakkımızda'),
            pageLink('/tr/vizyon', 'Vizyon ve Misyon'),
            pageLink('/tr/kurumsal/yonetim-kurulu-uyeleri', 'Yönetim Kurulu'),
            pageLink('/tr/insan-kaynaklari', 'İnsan Kaynakları'),
          ],
        },
        {
          heading: 'Yatırımcı İlişkileri',
          links: [
            pageLink('/tr/yatirimci-iliskileri/operasyonel-finansal-veriler/faaliyet-raporlari', 'Faaliyet Raporları'),
            pageLink('/tr/yatirimci-iliskileri/kurumsal-yonetim/genel-kurul', 'Genel Kurul'),
            pageLink('/tr/surekli-bilgilendirme-formu', 'Sürekli Bilgilendirme Formu'),
          ],
        },
        {
          heading: 'Yardım',
          links: [
            pageLink('/tr/sikca-sorulan-sorular', 'Sıkça Sorulan Sorular'),
            pageLink('/tr/site-haritasi', 'Site Haritası'),
            pageLink('/tr/bize-ulasin', 'Bize Ulaşın'),
            {
              label: 'Bilgi Toplumu Hizmetleri',
              type: 'external',
              url: 'https://e-sirket.mkk.com.tr/esir/Dashboard.jsp#/sirketbilgileri/10455',
            },
          ],
        },
      ],
      legalLinks: [
        pageLink('/tr/kullanim-ve-gizlilik-politikasi', 'Kullanım ve Gizlilik Politikası'),
        pageLink('/tr/kisisel-verilerin-korunmasi-hakkinda-bilgilendirme', 'Kişisel Verilerin Korunması'),
      ],
      socialLinks: [],
    },
  })

  await payload.updateGlobal({
    slug: 'site-settings',
    locale: 'tr',
    data: {
      siteName: 'Garanti Yatırım Ortaklığı A.Ş.',
      logo: imageMap.get(LOGO_SRC)?.id ?? imageMap.get(normalizePath(LOGO_SRC))?.id ?? null,
      defaultSeo: {
        title: 'Garanti Yatırım Ortaklığı A.Ş.',
        description:
          '1996 yılında kurulan Garanti Yatırım Ortaklığı A.Ş. yatırımcı ilişkileri, finansal raporlar ve kurumsal yönetim bilgileri.',
        image:
          imageMap.get('/images/home/yatirimciiliskileri.jpg')?.id ??
          imageMap.get(normalizePath('/images/home/yatirimciiliskileri.jpg'))?.id ??
          null,
      },
      cookieNotice: {
        text: await toLexical(
          '<p>Sitemizin çalışması için zorunlu çerezleri kullanıyoruz. İstatistik amaçlı çerezler yalnızca onayınızla yüklenir.</p>',
        ),
      },
    },
  })

  await payload.updateGlobal({
    slug: 'contact-info',
    locale: 'tr',
    data: { formRecipients: 'yo@gyo.com.tr' },
  })

  const navTr = await payload.findGlobal({ slug: 'navigation', locale: 'tr', depth: 0 })
  await payload.updateGlobal({
    slug: 'navigation',
    locale: 'en',
    data: mapNavigationToEnglish(navTr),
  })

  await payload.updateGlobal({
    slug: 'site-settings',
    locale: 'en',
    data: {
      siteName: 'Garanti Investment Trust Inc.',
      defaultSeo: {
        title: 'Garanti Investment Trust Inc.',
        description:
          'Garanti Investment Trust Inc., established in 1996 — investor relations, financial reports and corporate governance.',
      },
      cookieNotice: {
        text: await toLexical(
          '<p>We use strictly necessary cookies to run this site. Analytics cookies are loaded only with your consent.</p>',
        ),
      },
    },
  })

  const contactTr = await payload.findGlobal({ slug: 'contact-info', locale: 'tr', depth: 0 })
  await payload.updateGlobal({
    slug: 'contact-info',
    locale: 'en',
    data: {
      companyName: 'Garanti Investment Trust Inc.',
      address: contactTr.address,
    },
  })

  console.log('  Menüler ve ayarlar yazıldı (TR + EN)')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
