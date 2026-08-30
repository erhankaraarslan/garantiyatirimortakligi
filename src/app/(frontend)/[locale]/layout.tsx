import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import { CookieBanner } from '../../../components/layout/CookieBanner'
import { Footer } from '../../../components/layout/Footer'
import { Header } from '../../../components/layout/Header'
import { JsonLd } from '../../../components/layout/JsonLd'
import { getContactInfo, getSiteSettings } from '../../../lib/data'
import { sans } from '../../../lib/fonts'
import { htmlLang, isLocale, locales, type Locale } from '../../../lib/i18n'
import { lexicalPlainText } from '../../../lib/lexical'
import { mediaSrc } from '../../../lib/media'
import type { SiteSetting } from '../../../payload-types'
import '../../../styles/globals.css'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return { metadataBase: new URL(SITE_URL) }

  const settings = await getSiteSettings(locale)
  const seo = settings.defaultSeo
  const image = seo?.image && typeof seo.image === 'object' ? seo.image : null
  const ogUrl = mediaSrc(image, 'hero')

  return {
    metadataBase: new URL(SITE_URL),
    title: seo?.title || settings.siteName,
    description: seo?.description ?? undefined,
    openGraph: ogUrl ? { images: [{ url: ogUrl }] } : undefined,
  }
}

const cookieStrings = {
  tr: {
    title: 'Çerez tercihlerinizi yönetin',
    body: 'Sitemizin çalışması için zorunlu çerezleri kullanıyoruz. İstatistik amaçlı çerezler yalnızca onayınızla yüklenir.',
    accept: 'Kabul Et',
    reject: 'Reddet',
    policyLabel: 'Kişisel Verilerin Korunması Hakkında Bilgilendirme',
    policyHref: '/tr/kisisel-verilerin-korunmasi-hakkinda-bilgilendirme',
  },
  en: {
    title: 'Manage your cookie preferences',
    body: 'We use strictly necessary cookies to run this site. Analytics cookies are loaded only with your consent.',
    accept: 'Accept',
    reject: 'Reject',
    policyLabel: 'Personal Data Protection Notice',
    policyHref: '/en/personal-data-protection-notice',
  },
}

function cookieLabels(locale: Locale, settings: SiteSetting) {
  const base = cookieStrings[locale]
  const fromCms = lexicalPlainText(settings.cookieNotice?.text).replace(/\s+/g, ' ').trim()
  return { ...base, body: fromCms || base.body }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const [settings, contact] = await Promise.all([
    getSiteSettings(locale),
    getContactInfo(locale),
  ])

  return (
    <html lang={htmlLang[locale]} className={sans.variable}>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <JsonLd locale={locale} settings={settings} contact={contact} />
        <Header locale={locale} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer locale={locale} />
        <CookieBanner ga4Id={settings.analytics?.ga4Id} labels={cookieLabels(locale, settings)} />
      </body>
    </html>
  )
}

