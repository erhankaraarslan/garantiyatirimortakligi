import type { MetadataRoute } from 'next'

import { getPayloadClient, pageHref } from '../lib/data'
import { locales } from '../lib/i18n'
import type { Page } from '../payload-types'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

/**
 * sitemap.xml. Eski sitede hiç yoktu (/sitemap.xml 404 dönüyordu).
 * Her sayfa için hreflang alternatifleri de veriliyor.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayloadClient()
  const entries: MetadataRoute.Sitemap = []

  const pagesByLocale = new Map<string, Map<number, Page>>()

  for (const locale of locales) {
    const { docs } = await payload.find({
      collection: 'pages',
      locale,
      depth: 3,
      limit: 500,
      pagination: false,
      where: {
        _status: { equals: 'published' },
        translationStatus: { not_equals: 'missing' },
      },
    })
    pagesByLocale.set(locale, new Map(docs.map((page) => [page.id as number, page])))
  }

  for (const locale of locales) {
    for (const page of pagesByLocale.get(locale)?.values() ?? []) {
      const path = page.template === 'landing' ? `/${locale}` : pageHref(page, locale)

      // Yalnızca her iki dilde de yayında olan sayfalar için alternatif ver
      const languages: Record<string, string> = {}
      for (const other of locales) {
        const counterpart = pagesByLocale.get(other)?.get(page.id as number)
        if (!counterpart) continue
        languages[other] =
          `${SITE_URL}${counterpart.template === 'landing' ? `/${other}` : pageHref(counterpart, other)}`
      }

      entries.push({
        url: `${SITE_URL}${path}`,
        lastModified: page.updatedAt ? new Date(page.updatedAt) : undefined,
        changeFrequency: page.template === 'documentArchive' ? 'monthly' : 'yearly',
        priority: page.template === 'landing' ? 1 : path.split('/').length <= 3 ? 0.8 : 0.6,
        alternates: Object.keys(languages).length > 1 ? { languages } : undefined,
      })
    }
  }

  return entries
}
