import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { AwardsGallery } from '../../../../components/templates/AwardsGallery'
import { BioAccordion } from '../../../../components/templates/BioAccordion'
import { CommissionTables } from '../../../../components/templates/CommissionTables'
import { ContactSection } from '../../../../components/templates/ContactSection'
import { DocumentArchive } from '../../../../components/templates/DocumentArchive'
import { FaqList } from '../../../../components/templates/FaqList'
import { SectionIndex } from '../../../../components/templates/SectionIndex'
import { SitemapTree } from '../../../../components/templates/SitemapTree'
import { Breadcrumb, type Crumb } from '../../../../components/ui/Breadcrumb'
import { DocumentLink } from '../../../../components/ui/DocumentLink'
import { HtmlContent } from '../../../../components/ui/HtmlContent'
import { PageHero } from '../../../../components/ui/PageHero'
import { RichText } from '../../../../components/ui/RichText'
import { SideNav } from '../../../../components/ui/SideNav'
import {
  findPageByPath,
  getAncestors,
  getContactInfo,
  getPageTree,
  getPayloadClient,
  getSectionNav,
  pageHref,
  resolveAlternatePath,
} from '../../../../lib/data'
import { isLocale, locales, type Locale } from '../../../../lib/i18n'
import { lexicalHasReadableText } from '../../../../lib/lexical'
import type { Page } from '../../../../payload-types'

type Props = {
  params: Promise<{ locale: string; slug: string[] }>
}

async function loadPage(localeParam: string, slug: string[]) {
  if (!isLocale(localeParam)) notFound()
  const locale = localeParam as Locale
  const page = await findPageByPath(slug, locale)
  return { locale, page }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeParam, slug } = await params
  const { locale, page } = await loadPage(localeParam, slug)
  if (!page) return {}

  const meta = page.meta ?? {}
  const path = pageHref(page, locale)
  const otherLocale = locales.find((code) => code !== locale) as Locale
  const alternate = await resolveAlternatePath(path, otherLocale)

  return {
    title: meta.title || page.title,
    description: meta.description ?? undefined,
    alternates: {
      canonical: path,
      languages: {
        [locale]: path,
        [otherLocale]: alternate.href,
      },
    },
  }
}

export default async function DynamicPage({ params }: Props) {
  const { locale: localeParam, slug } = await params
  const { locale, page } = await loadPage(localeParam, slug)
  if (!page) notFound()

  // Landing şablonu yalnızca /tr ve /en kökünde render edilir
  if (page.template === 'landing') redirect(`/${locale}`)

  // Menüde dış linke işaret eden sayfalar (KAP, MKK e-şirket) doğrudan yönlenir
  if (page.externalUrl) redirect(page.externalUrl)

  const [ancestors, sectionNav] = await Promise.all([
    getAncestors(page, locale),
    getSectionNav(page, locale),
  ])

  const crumbs: Crumb[] = ancestors.map((ancestor) => ({
    label: ancestor.title,
    href: pageHref(ancestor, locale),
  }))

  const body = await renderTemplate(page, locale)
  const hasSidebar = Boolean(sectionNav && sectionNav.items.length > 0)
  const wideLayout = page.template === 'dataTable' || Boolean(page.legacyHtml)

  return (
    <>
      <PageHero title={page.title} />

      <div className="container-page">
        <Breadcrumb items={crumbs} locale={locale} />

        <div
          className={
            hasSidebar
              ? 'grid gap-8 pb-16 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-12'
              : wideLayout
                ? 'pb-16'
                : 'max-w-4xl pb-16'
          }
        >
          <div className="min-w-0">
            {page.translationStatus === 'missing' ? (
              <MissingTranslationNotice locale={locale} pageId={page.id} />
            ) : (
              body
            )}
          </div>

          {hasSidebar && sectionNav && (
            <aside className="lg:order-last">
              <SideNav
                title={sectionNav.title}
                items={sectionNav.items}
                labels={{ toggle: locale === 'tr' ? 'Bu bölümdeki sayfalar' : 'Pages in this section' }}
              />
            </aside>
          )}
        </div>
      </div>
    </>
  )
}

/**
 * Şablona özel gövde. `content` her şablonda üstte render ediliyor: eski sitede
 * bazı sayfalarda (ör. Sürekli Bilgilendirme Formu) accordion'un üstünde ayrı
 * bir içerik bloğu bulunuyor.
 */
async function renderTemplate(page: Page, locale: Locale) {
  const payload = await getPayloadClient()

  const intro = page.legacyHtml ? (
    <HtmlContent html={page.legacyHtml} className="mb-8" />
  ) : (
    <RichText data={page.content} className="mb-8" />
  )
  const children = await getDirectChildren(page, locale)
  const childIndex =
    page.template === 'content' && children.length > 0 && !lexicalHasReadableText(page.content) ? (
      <SectionIndex items={children} locale={locale} />
    ) : null

  switch (page.template) {
    case 'documentArchive': {
      /*
       * Arşiv kayıtları dile göre ayrı: eski sitede İngilizce arşiv sayfaları
       * kendi (daha az sayıda, İngilizce hazırlanmış) doküman setini
       * listeliyordu. language alanı bu ayrımı koruyor.
       */
      const category = page.archiveCategory ?? ''
      const { docs } = await payload.find({
        collection: 'document-archive-items',
        locale,
        depth: 1,
        limit: 500,
        sort: ['-year', 'order'],
        where: {
          category: { equals: category },
          language: { equals: locale },
        },
      })
      /*
       * Eski sitede faaliyet raporları, bağımsız denetim, sermaye artırımı gibi
       * arşivler yalnızca Türkçe sayfada duruyordu. EN karşılığı açıldığında
       * aynı PDF'leri göstermek için TR dilindeki kayıtlara düşüyoruz.
       */
      const archiveItems =
        docs.length > 0 || locale === 'tr'
          ? docs
          : (
              await payload.find({
                collection: 'document-archive-items',
                locale: 'tr',
                depth: 1,
                limit: 500,
                sort: ['-year', 'order'],
                where: { category: { equals: category }, language: { equals: 'tr' } },
              })
            ).docs
      return (
        <>
          {intro}
          <DocumentArchive items={archiveItems} locale={locale} />
        </>
      )
    }

    case 'bioAccordion': {
      const { docs } = await payload.find({
        collection: 'people',
        locale,
        depth: 1,
        limit: 100,
        sort: 'order',
        where: { group: { equals: page.bioGroup ?? 'board' } },
      })
      return (
        <>
          {intro}
          <BioAccordion people={docs} locale={locale} />
        </>
      )
    }

    case 'dataTable': {
      const scope = page.commissionScope ?? 'none'
      if (scope === 'none') return intro

      const { docs } = await payload.find({
        collection: 'commission-years',
        locale,
        depth: 0,
        limit: 100,
        sort: '-year',
        where:
          scope === 'single' && page.commissionYear
            ? { year: { equals: page.commissionYear } }
            : {},
      })
      return (
        <>
          {intro}
          <CommissionTables years={docs} locale={locale} />
        </>
      )
    }

    case 'faq': {
      const { docs } = await payload.find({
        collection: 'faqs',
        locale,
        depth: 0,
        limit: 200,
        sort: 'order',
      })
      return (
        <>
          {intro}
          <FaqList faqs={docs} locale={locale} />
        </>
      )
    }

    case 'gallery': {
      const { docs } = await payload.find({
        collection: 'awards',
        locale,
        depth: 1,
        limit: 100,
        sort: '-year',
      })
      return (
        <>
          {intro}
          <AwardsGallery awards={docs} locale={locale} />
        </>
      )
    }

    case 'contact': {
      const contact = await getContactInfo(locale)
      // Eski sayfanın HTML'i adres + Google Maps + ASP.NET form artığı içeriyor;
      // iletişim bilgileri ContactSection'da globals'tan geliyor, intro'yu basmıyoruz.
      return <ContactSection contact={contact} locale={locale} />
    }

    case 'sitemap': {
      const tree = await getPageTree(locale)
      return (
        <>
          {intro}
          <SitemapTree sections={tree} locale={locale} />
        </>
      )
    }

    default:
      return (
        <>
          {intro}
          {childIndex}
          <Attachments page={page} locale={locale} />
        </>
      )
  }
}

/**
 * Bu dilde çevirisi olmayan sayfalar için bilgilendirme. Eski sitede İngilizce
 * karşılığı olmayan 23 sayfa var; sessiz boş sayfa göstermek yerine kullanıcıyı
 * mevcut dildeki sürüme yönlendiriyoruz.
 */
async function MissingTranslationNotice({ locale, pageId }: { locale: Locale; pageId: number }) {
  const otherLocale: Locale = locale === 'tr' ? 'en' : 'tr'
  const payload = await getPayloadClient()
  const source = (await payload.findByID({
    collection: 'pages',
    id: pageId,
    locale: otherLocale,
    depth: 3,
  })) as Page | null

  const href = source?.slug ? pageHref(source, otherLocale) : `/${otherLocale}`

  return (
    <div className="border-l-4 border-brand-blue-light bg-surface-alt p-6">
      <p className="text-h3 font-medium text-ink">
        {locale === 'en' ? 'Not available in English yet' : 'Bu sayfa Türkçe olarak hazırlanıyor'}
      </p>
      <p className="mt-2 text-body">
        {locale === 'en'
          ? 'This page has not been translated yet. You can view the Turkish version in the meantime.'
          : 'Bu sayfanın Türkçe çevirisi henüz tamamlanmadı. Bu süre zarfında İngilizce sürümünü görüntüleyebilirsiniz.'}
      </p>
      <Link
        href={href}
        className="mt-4 inline-flex bg-brand-blue px-5 py-3 text-nav font-medium text-white transition-colors hover:bg-brand-blue-mid"
      >
        {locale === 'en' ? 'View Turkish version' : 'İngilizce sürümü görüntüle'}
      </Link>
    </div>
  )
}

async function getDirectChildren(page: Page, locale: Locale): Promise<{ title: string; href: string }[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'pages',
    locale,
    depth: 3,
    limit: 100,
    sort: 'order',
    where: {
      parent: { equals: page.id },
      _status: { equals: 'published' },
      translationStatus: { not_equals: 'missing' },
    },
  })

  return docs
    .filter((child) => child.template !== 'landing')
    .map((child) => ({
      title: child.title,
      href: pageHref(child, locale),
    }))
}

function Attachments({ page, locale }: { page: Page; locale: Locale }) {
  const attachments = page.attachments ?? []
  if (attachments.length === 0) return null

  return (
    <ul className="mt-6 border-t border-divider pt-2">
      {attachments.map((attachment, index) => (
        <li key={attachment.id ?? index}>
          <DocumentLink
            document={attachment.document}
            label={attachment.label}
            locale={locale}
          />
        </li>
      ))}
    </ul>
  )
}
