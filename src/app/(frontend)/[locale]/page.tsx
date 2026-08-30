import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { HomeFaqs } from '../../../components/ui/HomeFaqs'
import { HomeMosaic, type MosaicTile } from '../../../components/ui/HomeMosaic'
import { buttonVariants } from '../../../components/ui/Button'
import {
  findPageByPath,
  getPayloadClient,
  pageHref,
} from '../../../lib/data'
import { decorateHomeDocuments, pickLatestActivityReport } from '../../../lib/documents'
import { firstLexicalParagraph } from '../../../lib/lexical'
import { mediaSrc } from '../../../lib/media'
import { cn, formatBytes } from '../../../lib/utils'
import { isLocale, type Locale } from '../../../lib/i18n'
import type { Document, DocumentArchiveItem, Faq, Page } from '../../../payload-types'

const strings = {
  tr: {
    shortcuts: 'Hızlı Erişim',
    latest: 'Son yayımlanan dokümanlar',
    latestAll: 'Tümünü gör',
    about: 'Hakkımızda',
    aboutMore: 'Kurumsal’a git',
    faq: 'Sıkça sorulan sorular',
    faqAll: 'Tümünü gör',
    discover: 'Kurumsal bağlantılar',
    openPdf: 'PDF’i aç',
    latestReport: 'Son faaliyet raporu',
  },
  en: {
    shortcuts: 'Quick access',
    latest: 'Recently published documents',
    latestAll: 'See all',
    about: 'About us',
    aboutMore: 'Go to Corporate',
    faq: 'Frequently asked questions',
    faqAll: 'See all',
    discover: 'Corporate pages',
    openPdf: 'Open PDF',
    latestReport: 'Latest activity report',
  },
}

function skipMosaicHref(href: string) {
  const slug = href.replace(/\/$/, '').split('/').pop() ?? ''
  return [
    'bize-ulasin',
    'contact-us',
    'yatirimci-iliskileri',
    'investor-relations',
    'surekli-bilgilendirme-formu',
    'public-disclosure-form',
    'regular-public-disclosure-form',
    'vizyon',
    'vision',
    'vizyon-ve-misyon',
    'vision-and-mission',
    'our-vision',
  ].includes(slug)
}

function pickHeroVisual(
  heroImage: { url?: string | null; width?: number | null; height?: number | null } | null,
  mosaicImages: Array<{ url?: string | null; width?: number | null; height?: number | null } | null | undefined>,
) {
  if (heroImage?.url) return heroImage
  const usable = mosaicImages.filter(
    (image): image is NonNullable<(typeof mosaicImages)[number]> & { url: string } => Boolean(image?.url),
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
  try {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'pages',
      locale,
      depth: 3,
      limit: 1,
      where: { template: { equals: 'landing' }, _status: { equals: 'published' } },
    })
    return docs[0] as Page | undefined
  } catch (error) {
    console.error('[home] landing page query failed', error)
    return undefined
  }
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

  const empty = { docs: [] as never[] }
  const [
    { docs: latestDocuments },
    { docs: faqs },
    { docs: faqPages },
    { docs: reportPages },
    aboutPage,
  ] = await Promise.all([
    payload
      .find({
        collection: 'documents',
        locale,
        depth: 0,
        limit: 6,
        sort: '-publishedAt',
      })
      .catch((error) => {
        console.error('[home] documents query failed', error)
        return empty
      }),
    payload
      .find({
        collection: 'faqs',
        locale,
        depth: 0,
        limit: 3,
        sort: 'order',
      })
      .catch((error) => {
        console.error('[home] faqs query failed', error)
        return empty
      }),
    payload
      .find({
        collection: 'pages',
        locale,
        depth: 2,
        limit: 1,
        where: { template: { equals: 'faq' }, _status: { equals: 'published' } },
      })
      .catch((error) => {
        console.error('[home] faq pages query failed', error)
        return empty
      }),
    payload
      .find({
        collection: 'pages',
        locale,
        depth: 3,
        limit: 1,
        where: { archiveCategory: { equals: 'faaliyet-raporlari' }, _status: { equals: 'published' } },
      })
      .catch((error) => {
        console.error('[home] report pages query failed', error)
        return empty
      }),
    findPageByPath(locale === 'tr' ? ['kurumsal'] : ['corporate'], locale).catch((error) => {
      console.error('[home] about page query failed', error)
      return null
    }),
  ])

  const documentIds = (latestDocuments as Document[]).map((document) => document.id)
  let archiveItems: DocumentArchiveItem[] = []
  if (documentIds.length > 0) {
    const localized = await payload.find({
      collection: 'document-archive-items',
      locale,
      depth: 0,
      limit: 50,
      where: {
        document: { in: documentIds },
        language: { equals: locale },
      },
    })
    archiveItems = localized.docs as DocumentArchiveItem[]
    if (archiveItems.length === 0) {
      const anyLanguage = await payload.find({
        collection: 'document-archive-items',
        locale,
        depth: 0,
        limit: 50,
        where: { document: { in: documentIds } },
      })
      archiveItems = anyLanguage.docs as DocumentArchiveItem[]
    }
  }

  const decoratedDocuments = decorateHomeDocuments(
    latestDocuments as Document[],
    archiveItems as DocumentArchiveItem[],
    locale,
  )
  const latestReport = pickLatestActivityReport(decoratedDocuments)
  const homeDocuments = (() => {
    if (!latestReport) return decoratedDocuments.slice(0, 3)
    return [latestReport, ...decoratedDocuments.filter((document) => document.id !== latestReport.id)].slice(0, 3)
  })()

  const hero = page?.hero
  const heroImage = typeof hero?.image === 'object' ? hero.image : null
  const mosaicTiles: MosaicTile[] = (page?.mosaic ?? []).flatMap((tile) => {
    const target = typeof tile.page === 'object' ? tile.page : null
    const image = typeof tile.image === 'object' ? tile.image : null
    if (!target || !image?.url) return []
    const href = pageHref(target, locale)
    if (skipMosaicHref(href)) return []
    return [{ title: tile.title, href, image }]
  }).slice(0, 3)

  const visual = pickHeroVisual(
    heroImage,
    (page?.mosaic ?? []).map((tile) => (typeof tile.image === 'object' ? tile.image : null)),
  )
  const aboutHref = aboutPage ? pageHref(aboutPage, locale) : `/${locale}/${locale === 'tr' ? 'kurumsal' : 'corporate'}`
  const aboutExcerpt = firstLexicalParagraph(page?.content)
  const reportsHref = reportPages[0] ? pageHref(reportPages[0], locale) : aboutHref

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
          <div className="flex flex-col justify-center py-10 lg:min-h-[520px] lg:max-w-[642px] lg:py-16 lg:pr-10">
            <h1 className="text-h1 text-heading">
              {hero?.headline ?? page?.title ?? 'Garanti Yatırım Ortaklığı A.Ş.'}
            </h1>
            {hero?.subline && (
              <p className="mt-5 max-w-[34rem] text-[18px] leading-7 text-body">{hero.subline}</p>
            )}
            {(hero?.badges ?? []).length > 0 && (
              <ul className="mt-10 flex flex-wrap gap-x-12 gap-y-6">
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
            <div className="mt-10 flex flex-wrap items-center gap-3">
              {latestReport && (
                <a
                  href={latestReport.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants.primary, 'h-10')}
                  title={latestReport.title}
                >
                  {t.latestReport}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {mosaicTiles.length > 0 && (
        <section className="bg-surface">
          <div className="container-page py-10 lg:py-14">
            <h2 className="mb-6 text-h3 text-ink">{t.discover}</h2>
            <HomeMosaic tiles={mosaicTiles} />
          </div>
        </section>
      )}

      {(page?.shortcuts ?? []).length > 0 && (
        <section className="bg-surface-alt">
          <div className="container-page py-12 lg:py-16">
            <h2 className="mb-8 text-h2 text-ink">{t.shortcuts}</h2>
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
                      <span className="mt-auto inline-flex items-center pt-6 text-brand-navy" aria-hidden="true">
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

      {homeDocuments.length > 0 && (
        <section className="bg-surface">
          <div className="container-page py-12 lg:py-16">
            <SectionHeading title={t.latest} href={reportsHref} action={t.latestAll} />
            <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {homeDocuments.map((document) => (
                <li key={document.id}>
                  <a
                    href={document.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex h-full min-h-[168px] flex-col border-t-[3px] border-teal bg-surface-alt px-6 py-6 transition-shadow duration-300 hover:shadow-[0_8px_24px_rgba(6,33,70,0.08)]"
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
                      {document.title}
                    </p>
                    <p className="mt-auto inline-flex items-center gap-1.5 pt-6 text-[15px] font-medium text-brand-navy">
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

      {aboutExcerpt && (
        <section className="bg-surface-alt">
          <div className="container-page py-12 lg:py-16">
            <h2 className="text-h2 text-ink">{t.about}</h2>
            <p className="mt-6 max-w-3xl text-base leading-relaxed text-body">{aboutExcerpt}</p>
            <Link
              href={aboutHref}
              className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-medium text-brand-navy hover:underline"
            >
              {t.aboutMore}
              <ArrowIcon />
            </Link>
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="bg-surface">
          <div className="container-page py-12 lg:py-16">
            <SectionHeading
              title={t.faq}
              href={faqPages[0] ? pageHref(faqPages[0], locale) : undefined}
              action={t.faqAll}
            />
            <HomeFaqs
              items={(faqs as Faq[]).map((faq) => ({
                id: String(faq.id),
                question: faq.question,
                answer: faq.answer,
              }))}
            />
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
    <div className="mb-8 flex items-end justify-between gap-4">
      <h2 className="text-h2 text-ink">{title}</h2>
      {href && action && (
        <Link
          href={href}
          className="mb-1 inline-flex shrink-0 items-center gap-1.5 text-[15px] font-medium text-brand-navy hover:underline"
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
