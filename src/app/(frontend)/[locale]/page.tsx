import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { HomeMosaic, type MosaicTile } from '../../../components/ui/HomeMosaic'
import { RichText } from '../../../components/ui/RichText'
import { buttonVariants } from '../../../components/ui/Button'
import { getPayloadClient, pageHref } from '../../../lib/data'
import { mediaSrc } from '../../../lib/media'
import { formatBytes } from '../../../lib/utils'
import { isLocale, type Locale } from '../../../lib/i18n'
import type { Document, Faq, Page } from '../../../payload-types'

const strings = {
  tr: {
    shortcuts: 'Hızlı Erişim',
    latest: 'Son yayımlanan dokümanlar',
    latestAll: 'Tümünü gör',
    about: 'Kurumsal',
    faq: 'Sıkça sorulan sorular',
    faqAll: 'Tümünü gör',
    discover: 'Keşfet',
    inspect: 'Detaylı Bilgi',
    openPdf: 'PDF’i aç',
  },
  en: {
    shortcuts: 'Quick access',
    latest: 'Recently published documents',
    latestAll: 'See all',
    about: 'Corporate',
    faq: 'Frequently asked questions',
    faqAll: 'See all',
    discover: 'Explore',
    inspect: 'Learn more',
    openPdf: 'Open PDF',
  },
}

function pickBleedVisual(
  images: Array<{ url?: string | null; width?: number | null; height?: number | null } | null | undefined>,
) {
  const usable = images.filter((image): image is NonNullable<(typeof images)[number]> & { url: string } =>
    Boolean(image?.url),
  )
  if (usable.length === 0) return null
  const landscape = usable.filter((image) => (image.width ?? 1) >= (image.height ?? 1))
  const pool = landscape.length > 0 ? landscape : usable
  return [...pool].sort((a, b) => {
    const ratioA = (a.width ?? 1) / Math.max(a.height ?? 1, 1)
    const ratioB = (b.width ?? 1) / Math.max(b.height ?? 1, 1)
    return ratioB - ratioA
  })[0]
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
  const visual = pickBleedVisual([heroImage, ...mosaicTiles.map((tile) => tile.image)])
  const visualAlt = visual && 'alt' in visual ? (visual.alt ?? '') : ''

  return (
    <>
      <section className="relative bg-hero">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden overflow-hidden bg-navy lg:block lg:w-1/2">
          {mediaSrc(visual, 'hero') ? (
            <Image
              src={mediaSrc(visual, 'hero')!}
              alt=""
              fill
              priority
              quality={90}
              sizes="50vw"
              className="object-cover object-center"
            />
          ) : null}
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-hero to-transparent"
          />
        </div>

        <div className="container-page relative">
          <div className="flex flex-col justify-center py-14 lg:min-h-[560px] lg:max-w-[642px] lg:py-16 lg:pr-10">
            <h1 className="text-h1 text-heading">
              {hero?.headline ?? page?.title ?? 'Garanti Yatırım Ortaklığı A.Ş.'}
            </h1>
            {hero?.subline && (
              <p className="mt-5 max-w-[34rem] text-[18px] font-medium leading-7 text-heading">
                {hero.subline}
              </p>
            )}
            {hero?.ctaLabel && ctaPage && (
              <Link href={pageHref(ctaPage, locale)} className={`${buttonVariants.accent} mt-8 w-fit`}>
                {hero.ctaLabel}
              </Link>
            )}
            {(hero?.badges ?? []).length > 0 && (
              <ul className="mt-12 flex flex-wrap gap-x-12 gap-y-6">
                {(hero?.badges ?? []).map((badge, index) => (
                  <li key={badge.id ?? index} className="border-l-[3px] border-teal pl-4">
                    <p className="text-[28px] font-bold leading-none tracking-tight text-heading">
                      {badge.value}
                    </p>
                    <p className="mt-1.5 text-[13px] leading-5 text-muted">{badge.label}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="relative aspect-[16/10] w-full lg:hidden">
          {mediaSrc(visual, 'hero') ? (
            <Image
              src={mediaSrc(visual, 'hero')!}
              alt={visualAlt}
              fill
              priority
              quality={90}
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-navy" />
          )}
        </div>
      </section>

      {mosaicTiles.length > 0 && (
        <section className="bg-surface">
          <div className="container-page py-16 lg:py-[72px]">
            <h2 className="mb-10 text-h2 text-ink">{t.discover}</h2>
            <HomeMosaic tiles={mosaicTiles} actionLabel={t.inspect} />
          </div>
        </section>
      )}

      {(page?.shortcuts ?? []).length > 0 && (
        <section className="bg-surface-alt">
          <div className="container-page py-16 lg:py-[72px]">
            <h2 className="mb-10 text-h2 text-ink">{t.shortcuts}</h2>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {(page?.shortcuts ?? []).map((shortcut, index) => {
                const target = typeof shortcut.page === 'object' ? shortcut.page : null
                if (!target) return null
                return (
                  <li key={shortcut.id ?? index}>
                    <Link
                      href={pageHref(target, locale)}
                      className="group flex h-full flex-col bg-surface px-6 py-7 transition-shadow duration-300 hover:shadow-[0_8px_24px_rgba(6,33,70,0.08)]"
                    >
                      <span className="h-[3px] w-10 bg-teal" />
                      <span className="mt-5 text-[18px] font-medium tracking-[-0.4px] text-heading">
                        {shortcut.title}
                      </span>
                      {shortcut.description && (
                        <span className="mt-2 text-sm leading-6 text-body">{shortcut.description}</span>
                      )}
                      <span className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-medium text-teal">
                        {t.inspect}
                        <ArrowIcon />
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      )}

      {latestDocuments.length > 0 && (
        <section className="bg-surface">
          <div className="container-page py-16 lg:py-[72px]">
            <SectionHeading
              title={t.latest}
              href={ctaPage ? pageHref(ctaPage, locale) : undefined}
              action={t.latestAll}
            />
            <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {(latestDocuments as Document[]).map((document) => (
                <li key={document.id}>
                  <a
                    href={document.url ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex h-full min-h-[188px] flex-col border-t-[3px] border-teal bg-surface-alt px-6 py-6 transition-shadow duration-300 hover:shadow-[0_8px_24px_rgba(6,33,70,0.08)]"
                  >
                    {document.publishedAt && (
                      <p className="text-[13px] text-muted" suppressHydrationWarning>
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
                    <p className="mt-3 text-[18px] font-medium leading-snug tracking-[-0.4px] text-heading group-hover:text-brand-navy">
                      {document.title || document.filename}
                    </p>
                    <p className="mt-auto inline-flex items-center gap-1.5 pt-6 text-[15px] font-medium text-teal">
                      {t.openPdf}
                      {document.filesize ? ` · ${formatBytes(document.filesize)}` : ''}
                      <ArrowIcon />
                    </p>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {page?.content && (
        <section className="bg-surface-alt">
          <div className="container-page py-16 lg:py-[72px]">
            <h2 className="text-h2 text-ink">{t.about}</h2>
            <RichText data={page.content} className="mt-8 max-w-3xl" />
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="bg-surface">
          <div className="container-page py-16 lg:py-[72px]">
            <SectionHeading
              title={t.faq}
              href={faqPages[0] ? pageHref(faqPages[0], locale) : undefined}
              action={t.faqAll}
            />
            <dl className="divide-y divide-divider border-y border-divider">
              {(faqs as Faq[]).map((faq) => (
                <div key={faq.id} className="py-6">
                  <dt className="text-[18px] font-medium tracking-[-0.4px] text-heading">{faq.question}</dt>
                  <dd className="mt-2 line-clamp-3 max-w-3xl text-[15px] leading-6 text-body">
                    <RichText data={faq.answer} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

    </>
  )
}

function SectionHeading({
  title,
  href,
  action,
}: {
  title: string
  href?: string
  action?: string
}) {
  return (
    <div className="mb-10 flex items-end justify-between gap-4">
      <h2 className="text-h2 text-ink">{title}</h2>
      {href && action && (
        <Link
          href={href}
          className="mb-1 hidden shrink-0 items-center gap-1.5 text-[15px] font-medium text-teal hover:underline sm:inline-flex"
        >
          {action}
          <ArrowIcon />
        </Link>
      )}
    </div>
  )
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path d="M5.5 3.5 11 8l-5.5 4.5" />
    </svg>
  )
}
