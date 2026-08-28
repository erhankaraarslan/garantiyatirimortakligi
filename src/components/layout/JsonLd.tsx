import type { ContactInfo, SiteSetting } from '../../payload-types'
import { searchPath, type Locale } from '../../lib/i18n'

/**
 * Organization + WebSite JSON-LD. Arama motorlarının şirket kimliğini
 * (adres, telefon, alternatif dil) tanıması için layout'a gömülüyor.
 */
export function JsonLd({
  locale,
  settings,
  contact,
}: {
  locale: Locale
  settings: SiteSetting
  contact: ContactInfo
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: settings.siteName ?? contact.companyName ?? 'Garanti Yatırım Ortaklığı A.Ş.',
        url: `${siteUrl}/${locale}`,
        email: contact.email,
        telephone: contact.phone,
        faxNumber: contact.fax,
        address: contact.address
          ? {
              '@type': 'PostalAddress',
              streetAddress: contact.address,
              addressLocality: 'İstanbul',
              addressCountry: 'TR',
            }
          : undefined,
      },
      {
        '@type': 'WebSite',
        name: settings.siteName,
        url: `${siteUrl}/${locale}`,
        inLanguage: locale === 'tr' ? 'tr-TR' : 'en',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${siteUrl}${searchPath(locale)}?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
