/**
 * Ana sayfa görselleri, tablo HTML'i ve ödülleri mevcut Payload kayıtlarına yazar.
 * Tam seed'i tekrar çalıştırmaz.
 *
 * Kullanım: pnpm exec tsx --env-file=.env scripts/legacy/visual-fix.ts
 */
import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import * as cheerio from 'cheerio'
import fs from 'fs/promises'
import { JSDOM } from 'jsdom'
import { getPayload, type Payload } from 'payload'

import config from '../../src/payload.config'
import {
  PARSED_FILE,
  USER_AGENT,
  encodeUrl,
} from './config'
import { normalizePath } from './download-documents'
import {
  AWARDS_SEED,
  EXTRA_MEDIA,
  HOME_MOSAIC_TILES,
  LOGO_SRC,
  shouldUseLegacyHtml,
} from './home-assets'
import type { ParsedPage } from './parse-pages'

type Ref = { id: number; url: string }

async function main() {
  const payload = await getPayload({ config })
  const { pages } = JSON.parse(await fs.readFile(PARSED_FILE, 'utf8')) as { pages: ParsedPage[] }
  const byPath = new Map(pages.map((page) => [page.cleanPath, page]))

  console.log('Görseller...')
  const imageMap = await ensureMedia(payload)

  console.log('Bağlantı haritaları...')
  const documentMap = await loadDocumentMap(payload)
  const pageIdByTrPath = await loadPageIdMap(payload)
  const rewrite = createRewriter(documentMap, new Set(pageIdByTrPath.keys()), imageMap)

  console.log('Tablo / görsel HTML...')
  await writeLegacyHtml(payload, pages, rewrite)

  console.log('Ödüller...')
  await writeAwards(payload, imageMap, byPath, rewrite)

  console.log('Ana sayfa mozaiği...')
  await writeHomepage(payload, pageIdByTrPath, imageMap)

  console.log('Logo...')
  const logo = imageMap.get(LOGO_SRC) ?? imageMap.get(normalizePath(LOGO_SRC))
  if (logo) {
    await payload.updateGlobal({
      slug: 'site-settings',
      locale: 'tr',
      data: { logo: logo.id },
    })
  }

  console.log('\nTamamlandı.')
  process.exit(0)
}

async function ensureMedia(payload: Payload): Promise<Map<string, Ref>> {
  const { docs } = await payload.find({
    collection: 'media',
    limit: 500,
    pagination: false,
    depth: 0,
  })

  const map = new Map<string, Ref>()
  for (const item of docs) {
    if (!item.url) continue
    const ref = { id: item.id as number, url: item.url }
    if (item.originalPath) {
      map.set(item.originalPath, ref)
      map.set(normalizePath(item.originalPath), ref)
    }
    if (item.filename) map.set(item.filename, ref)
  }

  for (const extra of EXTRA_MEDIA) {
    if (map.has(extra.src) || map.has(normalizePath(extra.src))) continue
    try {
      const response = await fetch(encodeUrl(extra.src), { headers: { 'User-Agent': USER_AGENT } })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const buffer = Buffer.from(await response.arrayBuffer())
      const name = extra.src.split('/').pop() ?? 'gorsel.jpg'
      const media = await payload.create({
        collection: 'media',
        locale: 'tr',
        data: { alt: extra.alt, originalPath: extra.src },
        file: {
          data: buffer,
          mimetype: response.headers.get('content-type') ?? 'image/jpeg',
          name,
          size: buffer.byteLength,
        },
      })
      if (!media.url) throw new Error('URL yok')
      const ref = { id: media.id as number, url: media.url }
      map.set(extra.src, ref)
      map.set(normalizePath(extra.src), ref)
      console.log(`  yüklendi ${extra.src}`)
    } catch (error) {
      console.warn(`  görsel yüklenemedi ${extra.src}: ${(error as Error).message}`)
    }
  }

  return map
}

async function loadDocumentMap(payload: Payload): Promise<Map<string, Ref>> {
  const { docs } = await payload.find({
    collection: 'documents',
    limit: 1000,
    pagination: false,
    depth: 0,
  })
  const map = new Map<string, Ref>()
  for (const item of docs) {
    if (!item.url) continue
    const ref = { id: item.id as number, url: item.url }
    if (item.originalPath) {
      map.set(item.originalPath, ref)
      map.set(normalizePath(item.originalPath), ref)
    }
  }
  return map
}

async function loadPageIdMap(payload: Payload): Promise<Map<string, number>> {
  const { docs } = await payload.find({
    collection: 'pages',
    locale: 'tr',
    limit: 500,
    pagination: false,
    depth: 0,
  })
  const byId = new Map(docs.map((page) => [page.id as number, page]))

  const map = new Map<string, number>()
  for (const page of docs) {
    map.set(hrefFromIndex(page, byId, 'tr'), page.id as number)
  }
  return map
}

function hrefFromIndex(
  page: { id: number; slug: string; template?: string | null; parent?: unknown },
  byId: Map<number, { slug: string; parent?: unknown; template?: string | null }>,
  locale: 'tr' | 'en',
): string {
  if (page.template === 'landing') return `/${locale}`
  const parts: string[] = [page.slug]
  let parentId =
    typeof page.parent === 'number'
      ? page.parent
      : page.parent && typeof page.parent === 'object' && 'id' in page.parent
        ? Number((page.parent as { id: number }).id)
        : null
  const seen = new Set<number>()
  while (parentId && !seen.has(parentId)) {
    seen.add(parentId)
    const parent = byId.get(parentId)
    if (!parent) break
    parts.unshift(parent.slug)
    parentId =
      typeof parent.parent === 'number'
        ? parent.parent
        : parent.parent && typeof parent.parent === 'object' && 'id' in parent.parent
          ? Number((parent.parent as { id: number }).id)
          : null
  }
  return `/${locale}/${parts.join('/')}`
}

function createRewriter(
  documentMap: Map<string, Ref>,
  pagePaths: Set<string>,
  imageMap: Map<string, Ref>,
) {
  function resolve(rawHref: string): string | null {
    const normalized = normalizePath(rawHref)
    const document = documentMap.get(normalized) ?? documentMap.get(rawHref)
    if (document) return document.url

    const clean = normalized.replace(/\.aspx$/i, '')
    if (pagePaths.has(clean) || pagePaths.has(clean.replace(/^\/en\//, '/tr/'))) {
      return clean.startsWith('/en/') ? clean : clean.replace(/^\/tr\//, '/tr/')
    }
    if (pagePaths.has(`/tr${clean}`) || pagePaths.has(clean)) return clean
    return null
  }

  return function rewrite(html: string): string {
    const $ = cheerio.load(`<div id="root">${html}</div>`, null, false)

    $('a[href]').each((_, element) => {
      const anchor = $(element)
      const href = anchor.attr('href')
      if (!href) return
      const resolved = resolve(href)
      if (resolved) {
        anchor.attr('href', resolved)
        return
      }
      try {
        const url = new URL(href, 'http://www.gyo.com.tr')
        if (url.hostname.replace(/^www\./, '') === 'gyo.com.tr') {
          const next = resolve(`${url.pathname}${url.search}`)
          if (next) anchor.attr('href', next)
        }
      } catch {
        /* bırak */
      }
    })

    $('img[src]').each((_, element) => {
      const image = $(element)
      const src = image.attr('src') ?? ''
      const media = imageMap.get(src) ?? imageMap.get(normalizePath(src))
      if (media) image.attr('src', media.url)
    })

    return $('#root').html() ?? ''
  }
}

async function writeLegacyHtml(
  payload: Payload,
  pages: ParsedPage[],
  rewrite: (html: string) => string,
) {
  let count = 0
  for (const page of pages) {
    if (!shouldUseLegacyHtml(page) || !page.contentHtml) continue

    const { docs } = await payload.find({
      collection: 'pages',
      locale: page.locale,
      limit: 1,
      depth: 0,
      where: { 'legacyPaths.path': { equals: page.legacyPath } },
    })
    const doc = docs[0]
    if (!doc) {
      console.warn(`  sayfa bulunamadı ${page.legacyPath}`)
      continue
    }

    await payload.update({
      collection: 'pages',
      id: doc.id,
      locale: page.locale,
      data: { legacyHtml: rewrite(page.contentHtml) },
    })
    count += 1
  }
  console.log(`  ${count} sayfaya HTML yazıldı`)
}

async function writeAwards(
  payload: Payload,
  imageMap: Map<string, Ref>,
  byPath: Map<string, ParsedPage>,
  rewrite: (html: string) => string,
) {
  const { totalDocs } = await payload.count({ collection: 'awards' })
  if (totalDocs === 0) {
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
        data: { title: award.titleEn, issuer: award.issuerEn },
      })
    }
    console.log(`  ${AWARDS_SEED.length} ödül oluşturuldu`)
  } else {
    console.log(`  ödüller zaten var (${totalDocs})`)
  }

  const tr = byPath.get('/tr/kurumsal/oduller')
  const en = byPath.get('/en/corporate/awards')
  const { docs } = await payload.find({
    collection: 'pages',
    locale: 'tr',
    limit: 1,
    where: { 'legacyPaths.path': { equals: '/tr/kurumsal/oduller.aspx' } },
  })
  const page = docs[0]
  if (!page) return

  const strip = (html: string) => rewrite(html.replace(/<img\b[^>]*>/gi, ''))
  if (tr?.contentHtml) {
    await payload.update({
      collection: 'pages',
      id: page.id,
      locale: 'tr',
      data: { content: await toLexical(strip(tr.contentHtml)), legacyHtml: null },
    })
  }
  if (en?.contentHtml) {
    await payload.update({
      collection: 'pages',
      id: page.id,
      locale: 'en',
      data: { content: await toLexical(strip(en.contentHtml)), legacyHtml: null },
    })
  }
}

async function writeHomepage(
  payload: Payload,
  pageIdByTrPath: Map<string, number>,
  imageMap: Map<string, Ref>,
) {
  const homeId = pageIdByTrPath.get('/tr') ?? pageIdByTrPath.get('/tr/ana-sayfa')
  if (!homeId) {
    const { docs } = await payload.find({
      collection: 'pages',
      locale: 'tr',
      limit: 1,
      where: { template: { equals: 'landing' } },
    })
    if (!docs[0]) {
      console.warn('  ana sayfa bulunamadı')
      return
    }
    await applyHomepage(payload, docs[0].id as number, pageIdByTrPath, imageMap)
    return
  }
  await applyHomepage(payload, homeId, pageIdByTrPath, imageMap)
}

async function applyHomepage(
  payload: Payload,
  homeId: number,
  pageIdByTrPath: Map<string, number>,
  imageMap: Map<string, Ref>,
) {
  const mosaicFor = (locale: 'tr' | 'en') =>
    HOME_MOSAIC_TILES.flatMap((tile) => {
      const page = pageIdByTrPath.get(tile.trPath)
      const image = imageMap.get(tile.src) ?? imageMap.get(normalizePath(tile.src))
      if (!page || !image) {
        console.warn(`  mozaik atlandı ${tile.trPath} page=${page} image=${Boolean(image)}`)
        return []
      }
      return [{ title: locale === 'tr' ? tile.tr : tile.en, image: image.id, page }]
    })

  const heroImage =
    imageMap.get('/images/home/yatirimciiliskileri.jpg') ??
    imageMap.get(normalizePath('/images/home/yatirimciiliskileri.jpg'))

  const currentTr = await payload.findByID({
    collection: 'pages',
    id: homeId,
    locale: 'tr',
    depth: 0,
  })
  const currentEn = await payload.findByID({
    collection: 'pages',
    id: homeId,
    locale: 'en',
    depth: 0,
  })

  const mosaicTr = mosaicFor('tr')
  const mosaicEn = mosaicFor('en')

  await payload.update({
    collection: 'pages',
    id: homeId,
    locale: 'tr',
    data: {
      mosaic: mosaicTr,
      hero: mergeHero(currentTr.hero, heroImage?.id ?? null),
    },
  })

  await payload.update({
    collection: 'pages',
    id: homeId,
    locale: 'en',
    data: {
      mosaic: mosaicEn,
      hero: mergeHero(currentEn.hero, heroImage?.id ?? null),
    },
  })

  console.log(`  mozaik TR ${mosaicTr.length} kare / EN ${mosaicEn.length} kare`)
}

function mergeHero(
  hero: {
    headline?: string | null
    subline?: string | null
    ctaLabel?: string | null
    ctaPage?: number | { id?: number } | null
    image?: number | { id?: number } | null
    badges?: unknown
  } | null
  | undefined,
  imageId: number | null,
) {
  const cta =
    typeof hero?.ctaPage === 'number'
      ? hero.ctaPage
      : hero?.ctaPage && typeof hero.ctaPage === 'object'
        ? hero.ctaPage.id
        : null
  const existingImage =
    typeof hero?.image === 'number'
      ? hero.image
      : hero?.image && typeof hero.image === 'object'
        ? hero.image.id
        : null

  return {
    headline: hero?.headline ?? null,
    subline: hero?.subline ?? null,
    ctaLabel: hero?.ctaLabel ?? null,
    ctaPage: cta ?? null,
    image: imageId ?? existingImage ?? null,
    badges: hero?.badges ?? [],
  }
}

let editorConfigPromise: ReturnType<typeof editorConfigFactory.default> | null = null

async function toLexical(html: string | null | undefined) {
  if (!html || html.trim() === '') return undefined
  if (!editorConfigPromise) {
    editorConfigPromise = editorConfigFactory.default({ config: await config })
  }
  return convertHTMLToLexical({
    editorConfig: await editorConfigPromise,
    html,
    JSDOM,
  })
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
