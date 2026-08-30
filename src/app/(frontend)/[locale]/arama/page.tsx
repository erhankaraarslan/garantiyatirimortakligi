import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { buttonVariants } from '../../../../components/ui/Button'
import { Breadcrumb } from '../../../../components/ui/Breadcrumb'
import { PageHero } from '../../../../components/ui/PageHero'
import { getPayloadClient, pageHref } from '../../../../lib/data'
import { isLocale, searchPath, type Locale } from '../../../../lib/i18n'
import type { Page } from '../../../../payload-types'

const strings = {
  tr: {
    title: 'Arama',
    label: 'Sitede ara',
    placeholder: 'Aramak istediğiniz kelimeyi yazın',
    submit: 'Ara',
    empty: 'Aramanızla eşleşen sayfa bulunamadı.',
    prompt: 'Aramak istediğiniz kelimeyi yukarıya yazın.',
    resultCount: (n: number) => `${n} sonuç bulundu`,
    docsHint: 'PDF dosyalarının içeriği aramaya dahil değildir.',
  },
  en: {
    title: 'Search',
    label: 'Search the site',
    placeholder: 'Type a keyword to search',
    submit: 'Search',
    empty: 'No pages matched your search.',
    prompt: 'Enter a keyword above to search.',
    resultCount: (n: number) => `${n} result${n === 1 ? '' : 's'} found`,
    docsHint: 'The contents of PDF documents are not included in search.',
  },
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return { title: 'Search' }
  return { title: locale === 'tr' ? 'Arama' : 'Search' }
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string }>
}) {
  const { locale: localeParam } = await params
  if (!isLocale(localeParam)) notFound()
  const locale = localeParam as Locale
  const { q } = await searchParams
  const query = (q ?? '').trim()
  const t = strings[locale]

  const results = query ? await search(query, locale) : []

  return (
    <>
      <PageHero title={t.title} />
      <div className="container-page pb-16">
        <Breadcrumb items={[{ label: t.title }]} locale={locale} />

        <form action={searchPath(locale)} method="get" className="max-w-xl">
          <label htmlFor="q" className="mb-1 block text-sm font-medium text-ink">
            {t.label}
          </label>
          <div className="flex">
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={query}
              placeholder={t.placeholder}
              className="field rounded-r-none"
            />
            <button type="submit" className={`${buttonVariants.primary} shrink-0 rounded-l-none`}>
              {t.submit}
            </button>
          </div>
          <p className="mt-1 text-xs text-muted">{t.docsHint}</p>
        </form>

        <div className="mt-8">
          {!query ? (
            <p className="text-body">{t.prompt}</p>
          ) : results.length === 0 ? (
            <p className="text-body">{t.empty}</p>
          ) : (
            <>
              <p className="mb-4 text-sm text-muted" aria-live="polite">
                {t.resultCount(results.length)}
              </p>
              <ul className="divide-y divide-divider border-t border-divider">
                {results.map((page) => (
                  <li key={page.id} className="py-4">
                    <Link
                      href={pageHref(page, locale)}
                      className="text-h3 font-medium text-brand-blue hover:underline"
                    >
                      {page.title}
                    </Link>
                    {page.meta?.description && (
                      <p className="mt-1 text-sm text-body">{page.meta.description}</p>
                    )}
                    <p className="mt-1 text-xs text-muted">{pageHref(page, locale)}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </>
  )
}

/**
 * Sayfa başlığı ve SEO açıklaması üzerinde arama. Zengin metin gövdesi Lexical
 * JSON olarak saklandığı için doğrudan LIKE sorgusuna uygun değil; tam metin
 * arama gerekirse Postgres tsvector ile ayrı bir indeks kurulmalı.
 */
async function search(query: string, locale: Locale): Promise<Page[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'pages',
    locale,
    depth: 3,
    limit: 50,
    where: {
      _status: { equals: 'published' },
      translationStatus: { not_equals: 'missing' },
      or: [{ title: { like: query } }, { 'meta.description': { like: query } }],
    },
  })
  return docs
}
