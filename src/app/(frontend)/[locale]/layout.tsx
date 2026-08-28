import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import { CookieBanner } from '../../../components/layout/CookieBanner'
import { Footer } from '../../../components/layout/Footer'
import { Header } from '../../../components/layout/Header'
import { JsonLd } from '../../../components/layout/JsonLd'
import { getContactInfo, getSiteSettings } from '../../../lib/data'
import { sans } from '../../../lib/fonts'
import { htmlLang, isLocale, locales } from '../../../lib/i18n'
import '../../../styles/globals.css'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
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
      <body className="flex min-h-screen flex-col">
        <JsonLd locale={locale} settings={settings} contact={contact} />
        <Header locale={locale} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer locale={locale} />
        <CookieBanner ga4Id={settings.analytics?.ga4Id} labels={cookieStrings[locale]} />
      </body>
    </html>
  )
}
