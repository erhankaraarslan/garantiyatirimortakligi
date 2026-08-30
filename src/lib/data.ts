import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import config from '../payload.config'
import type { ContactInfo, Navigation, Page, SiteSetting } from '../payload-types'
import type { Locale } from './i18n'

export async function getPayloadClient() {
  return getPayload({ config })
}

/**
 * Globaller her sayfada okunuyor; içerik değişene kadar cache'te tutuyoruz.
 * Payload afterChange hook'ları yerine tag tabanlı invalidation kullanıyoruz.
 */
export const getNavigation = (locale: Locale) =>
  unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      return payload.findGlobal({ slug: 'navigation', locale, depth: 4 }) as Promise<Navigation>
    },
    ['navigation', locale, 'v12'],
    { tags: ['navigation'] },
  )()

export const getSiteSettings = (locale: Locale) =>
  unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      return payload.findGlobal({ slug: 'site-settings', locale, depth: 1 }) as Promise<SiteSetting>
    },
    ['site-settings', locale, 'v7'],
    { tags: ['site-settings'] },
  )()

export const getContactInfo = (locale: Locale) =>
  unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      return payload.findGlobal({ slug: 'contact-info', locale, depth: 1 }) as Promise<ContactInfo>
    },
    ['contact-info', locale, 'v3'],
    { tags: ['contact-info'] },
  )()

/**
 * Slug segmentlerinden sayfayı bulur. Segmentler hiyerarşiyi temsil ettiği için
 * son segmentle arama yapıp, bulunan adayların parent zincirini doğruluyoruz.
 * Böylece /tr/kurumsal/oduller ile /tr/yatirimci-iliskileri/oduller ayrışır.
 */
export async function findPageByPath(segments: string[], locale: Locale): Promise<Page | null> {
  if (segments.length === 0) return null
  const payload = await getPayloadClient()
  const leaf = segments[segments.length - 1]

  const { docs } = await payload.find({
    collection: 'pages',
    locale,
    depth: 3,
    limit: 10,
    where: {
      slug: { equals: leaf },
      // Çevirisi tamamlanmamış sayfalar taslak durumda; herkese açık olmamalı
      _status: { equals: 'published' },
    },
  })

  for (const doc of docs) {
    if (await matchesAncestry(doc, segments, locale)) return doc
  }
  return null
}

async function matchesAncestry(page: Page, segments: string[], locale: Locale): Promise<boolean> {
  const payload = await getPayloadClient()
  let current: Page | null = page

  for (let i = segments.length - 1; i >= 0; i--) {
    if (!current || current.slug !== segments[i]) return false
    if (i === 0) return !current.parent // kök segmentin üstünde başka sayfa olmamalı

    const parent: Page['parent'] = current.parent
    if (!parent) return false
    current =
      typeof parent === 'object'
        ? parent
        : ((await payload.findByID({
            collection: 'pages',
            id: parent,
            locale,
            depth: 1,
          })) as Page)
  }
  return false
}

/** Kök sayfadan itibaren breadcrumb zinciri (mevcut sayfa dahil). */
export async function getAncestors(page: Page, locale: Locale): Promise<Page[]> {
  const payload = await getPayloadClient()
  const chain: Page[] = [page]
  let parent = page.parent

  while (parent) {
    const doc: Page =
      typeof parent === 'object'
        ? parent
        : ((await payload.findByID({
            collection: 'pages',
            id: parent,
            locale,
            depth: 1,
          })) as Page)
    chain.unshift(doc)
    parent = doc.parent
  }
  return chain
}

export type SectionNavItem = {
  label: string
  href: string
  children?: SectionNavItem[]
}

/**
 * Tüm sayfa ağacını (kök seviyeden itibaren) döndürür. Site haritası sayfası ve
 * sitemap.xml bunu kullanıyor. Çevirisi olmayan ve taslak sayfalar dışlanıyor.
 */
export async function getPageTree(locale: Locale): Promise<SectionNavItem[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'pages',
    locale,
    depth: 3,
    limit: 500,
    pagination: false,
    sort: 'order',
    where: {
      _status: { equals: 'published' },
      translationStatus: { not_equals: 'missing' },
    },
  })

  const byParent = new Map<number | null, Page[]>()
  for (const page of docs) {
    const parentId =
      typeof page.parent === 'object' && page.parent
        ? (page.parent.id as number)
        : typeof page.parent === 'number'
          ? page.parent
          : null
    const list = byParent.get(parentId) ?? []
    list.push(page)
    byParent.set(parentId, list)
  }

  const build = (parentId: number | null, depth: number): SectionNavItem[] =>
    (byParent.get(parentId) ?? [])
      .filter((page) => page.template !== 'landing')
      .map((page) => ({
        label: page.title,
        href: pageHref(page, locale),
        children: depth < 3 ? build(page.id as number, depth + 1) : [],
      }))

  return build(null, 1)
}

/**
 * Yan menü verisi: mevcut sayfanın en üst atasının alt ağacını kurar.
 * Eski sitedeki #vmenu ile aynı kapsam (bölüm kökü + iki seviye alt sayfa).
 */
export async function getSectionNav(
  page: Page,
  locale: Locale,
): Promise<{ title: string; items: SectionNavItem[] } | null> {
  const ancestors = await getAncestors(page, locale)
  const sectionRoot = ancestors[0]
  if (!sectionRoot) return null

  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'pages',
    locale,
    depth: 2,
    limit: 200,
    sort: 'order',
    where: {
      parent: { equals: sectionRoot.id },
      _status: { equals: 'published' },
      // Bu dilde çevirisi olmayan sayfaları menüde göstermiyoruz
      translationStatus: { not_equals: 'missing' },
    },
  })

  if (docs.length === 0) return null

  const items: SectionNavItem[] = await Promise.all(
    docs.map(async (child) => {
      const { docs: grandChildren } = await payload.find({
        collection: 'pages',
        locale,
        depth: 2,
        limit: 100,
        sort: 'order',
        where: {
          parent: { equals: child.id },
          _status: { equals: 'published' },
          translationStatus: { not_equals: 'missing' },
        },
      })

      return {
        label: child.title,
        href: pageHref(child, locale),
        children: grandChildren.map((grandChild) => ({
          label: grandChild.title,
          href: pageHref(grandChild, locale),
        })),
      }
    }),
  )

  return { title: sectionRoot.title, items }
}

/**
 * Bir yolun karşı dildeki eşdeğerini bulur. Aynı Payload dokümanı iki dilde
 * farklı slug taşıdığı için, dokümanı bulup karşı dilde yeniden okuyoruz.
 * Karşılığı yoksa (çevirisi olmayan 18 sayfa) o dilin ana sayfasına düşer.
 */
export async function resolveAlternatePath(
  pathname: string,
  targetLocale: Locale,
): Promise<{ href: string; hasCounterpart: boolean }> {
  const segments = pathname.split('/').filter(Boolean).slice(1) // dil kodunu at
  const fallback = { href: `/${targetLocale}`, hasCounterpart: false }
  if (segments.length === 0) return { href: `/${targetLocale}`, hasCounterpart: true }

  const sourceLocale: Locale = targetLocale === 'tr' ? 'en' : 'tr'
  const page = await findPageByPath(segments, sourceLocale)
  if (!page) return fallback

  const payload = await getPayloadClient()
  const translated = (await payload.findByID({
    collection: 'pages',
    id: page.id,
    locale: targetLocale,
    depth: 3,
  })) as Page | null

  if (!translated?.slug) return fallback
  return { href: pageHref(translated, targetLocale), hasCounterpart: true }
}

export function pageHref(
  page: Pick<Page, 'slug'> & { parent?: Page['parent']; template?: Page['template'] },
  locale: Locale,
) {
  // Ana sayfa şablonu /tr/ana-sayfa yerine dil köküne bağlanır
  if (page.template === 'landing') return `/${locale}`

  const parts: string[] = [page.slug]
  let parent = page.parent
  while (parent && typeof parent === 'object') {
    parts.unshift(parent.slug)
    parent = parent.parent
  }
  return `/${locale}/${parts.join('/')}`
}
