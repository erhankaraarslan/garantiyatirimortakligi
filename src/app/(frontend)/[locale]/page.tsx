import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { DocumentLink } from '../../../components/ui/DocumentLink'
import { HomeMosaic, type MosaicTile } from '../../../components/ui/HomeMosaic'
import { RichText } from '../../../components/ui/RichText'
import { getPayloadClient, pageHref } from '../../../lib/data'
import { isLocale, type Locale } from '../../../lib/i18n'
import type { Faq, Page } from '../../../payload-types'

const strings = {
  tr: {
    shortcuts: 'Hızlı Erişim',
    latest: 'Son Yayımlanan Dokümanlar',
    latestAll: 'Tüm finansal raporlara git',
    about: 'Kurumsal',
    faq: 'Sıkça Sorulan Sorular',
    faqAll: 'Tüm sorulara git',
  },
  en: {
    shortcuts: 'Quick Access',
    latest: 'Recently Published Documents',
    latestAll: 'Go to all financial reports',
    about: 'Corporate',
    faq: 'Frequently Asked Questions',
    faqAll: 'See all questions',
  },
}

async function loadHome(locale: Locale) {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'pages',
    locale,
    depth: 3,
    limit: 1,
    where: { template: { equals: 'landing' }, _status: { equals: 'published' } },
  })
  return docs[0] as Page | undefined
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const page = await loadHome(locale)
  const fallbackTitle =
    locale === 'tr' ? 'Garanti Yatırım Ortaklığı A.Ş.' : 'Garanti Investment Trust Inc.'
  return {
    title: page?.meta?.title || page?.title || fallbackTitle,
    description: page?.meta?.description ?? undefined,
    alternates: {
      canonical: `/${locale}`,
      languages: { tr: '/tr', en: '/en' },
    },
  }
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params
  if (!isLocale(localeParam)) notFound()
  const locale = localeParam as Locale
  const t = strings[locale]

  const [page, payload] = await Promise.all([loadHome(locale), getPayloadClient()])

  const [{ docs: latestDocuments }, { docs: faqs }, { docs: faqPages }] = await Promise.all([
    payload.find({
      collection: 'documents',
      locale,
      depth: 0,
      limit: 6,
      sort: '-publishedAt',
    }),
    payload.find({
      collection: 'faqs',
      locale,
      depth: 0,
      limit: 4,
      sort: 'order',
    }),
    payload.find({
      collection: 'pages',
      locale,
      depth: 2,
      limit: 1,
      where: { template: { equals: 'faq' }, _status: { equals: 'published' } },
    }),
  ])

  const hero = page?.hero
  const heroImage = typeof hero?.image === 'object' ? hero.image : null
  const ctaPage = typeof hero?.ctaPage === 'object' ? hero.ctaPage : null
  const mosaicTiles: MosaicTile[] = (page?.mosaic ?? []).flatMap((tile) => {
    const target = typeof tile.page === 'object' ? tile.page : null
    const image = typeof tile.image === 'object' ? tile.image : null
    if (!target || !image?.url) return []
    return [
      {
        title: tile.title,
        href: pageHref(target, locale),
        image,
      },
    ]
  })
  const showMosaic = mosaicTiles.length > 0

  return (
    <>
      {/* Hero metni + altta eski sitenin tam genişlik fotoğraf mozaiği */}
      <section className="bg-surface-alt">
        <div className="container-page py-12 lg:py-16">
          <div className="max-w-3xl">
            <h1 className="text-h2 text-brand-blue-dark md:text-h1">
              {hero?.headline ?? page?.title ?? 'Garanti Yatırım Ortaklığı A.Ş.'}
            </h1>
            {hero?.subline && (
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-body">{hero.subline}</p>
            )}
            {hero?.ctaLabel && ctaPage && (
              <Link
                href={pageHref(ctaPage, locale)}
                className="mt-7 inline-flex bg-brand-blue px-7 py-3.5 text-btn font-medium text-white transition-colors hover:bg-brand-blue-mid"
              >
                {hero.ctaLabel}
              </Link>
            )}
            {(hero?.badges ?? []).length > 0 && (
              <ul className="mt-8 flex flex-wrap gap-4">
                {(hero?.badges ?? []).map((badge, index) => (
                  <li
                    key={badge.id ?? index}
                    className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-brand-blue-light/20 p-2 text-center"
                  >
                    <span className="text-lg font-bold text-brand-blue-dark">{badge.value}</span>
                    <span className="mt-0.5 text-[11px] leading-tight text-brand-blue-dark">
                      {badge.label}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {showMosaic ? (
            <div className="mt-10">
              <HomeMosaic tiles={mosaicTiles} />
            </div>
          ) : (
            heroImage?.url && (
              <div className="relative mt-10">
                <Image
                  src={heroImage.url}
                  alt={heroImage.alt ?? ''}
                  width={heroImage.width ?? 640}
                  height={heroImage.height ?? 480}
                  priority
                  className="w-full object-cover"
                />
              </div>
            )
          )}
        </div>
      </section>

      {/* Kısayol kartları: 3 kolonlu grid deseni */}
      {(page?.shortcuts ?? []).length > 0 && (
        <section className="bg-surface">
          <div className="container-page py-14 lg:py-20">
            <h2 className="text-h2 text-ink">{t.shortcuts}</h2>
            <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {(page?.shortcuts ?? []).map((shortcut, index) => {
                const target = typeof shortcut.page === 'object' ? shortcut.page : null
                if (!target) return null

                return (
                  <li key={shortcut.id ?? index}>
                    <Link
                      href={pageHref(target, locale)}
                      className="group flex h-full flex-col border border-divider bg-surface p-6 transition-colors hover:border-brand-blue"
                    >
                      <span className="text-h3 font-medium text-brand-blue-dark group-hover:text-brand-blue">
                        {shortcut.title}
                      </span>
                      {shortcut.description && (
                        <span className="mt-2 text-sm text-body">{shortcut.description}</span>
                      )}
                      <span
                        aria-hidden="true"
                        className="mt-4 text-brand-blue transition-transform group-hover:translate-x-1"
                      >
                        &rarr;
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      )}

      {/* Son yayımlanan dokümanlar: referanstaki duyuru kartı deseni */}
      {latestDocuments.length > 0 && (
        <section className="bg-surface-alt">
          <div className="container-page py-14 lg:py-20">
            <h2 className="text-h2 text-ink">{t.latest}</h2>
            <ul className="mt-8 grid gap-x-8 md:grid-cols-2 lg:grid-cols-3">
              {latestDocuments.map((document) => (
                <li key={document.id} className="bg-surface p-5">
                  {document.publishedAt && (
                    <p className="mb-1 text-xs text-muted" suppressHydrationWarning>
                      {new Date(document.publishedAt).toLocaleDateString(
                        locale === 'tr' ? 'tr-TR' : 'en-GB',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          timeZone: 'Europe/Istanbul',
                        },
                      )}
                    </p>
                  )}
                  <DocumentLink document={document} locale={locale} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Kurumsal özet */}
      {page?.content && (
        <section className="bg-surface">
          <div className="container-page py-14 lg:py-20">
            <h2 className="text-h2 text-ink">{t.about}</h2>
            <RichText data={page.content} className="mt-6 max-w-3xl" />
          </div>
        </section>
      )}

      {/* SSS özeti: referanstaki accordion + "tüm sorulara git" deseni */}
      {faqs.length > 0 && (
        <section className="bg-surface-alt">
          <div className="container-page py-14 lg:py-20">
            <h2 className="text-h2 text-ink">{t.faq}</h2>
            <dl className="mt-8 divide-y divide-divider border-y border-divider">
              {(faqs as Faq[]).map((faq) => (
                <div key={faq.id} className="py-5">
                  <dt className="text-h3 font-medium text-ink">{faq.question}</dt>
                  <dd className="mt-2 line-clamp-3 text-sm text-body">
                    <RichText data={faq.answer} />
                  </dd>
                </div>
              ))}
            </dl>
            {faqPages[0] && (
              <Link
                href={pageHref(faqPages[0], locale)}
                className="mt-6 inline-flex text-nav font-medium text-brand-blue hover:underline"
              >
                {t.faqAll} →
              </Link>
            )}
          </div>
        </section>
      )}
    </>
  )
}
