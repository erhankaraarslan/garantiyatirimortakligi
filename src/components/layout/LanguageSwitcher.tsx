import Link from 'next/link'

import type { Locale } from '../../lib/i18n'

/**
 * Dil değiştirici. Slug'lar dile göre farklı olduğu için karşı dildeki hedef
 * sunucu tarafında çözülüp `href` olarak veriliyor; karşılığı yoksa o dilin
 * ana sayfasına düşer.
 */
export function LanguageSwitcher({
  targetLocale,
  href,
  hasCounterpart,
}: {
  targetLocale: Locale
  href: string
  hasCounterpart: boolean
}) {
  return (
    <Link
      href={href}
      hrefLang={targetLocale}
      lang={targetLocale}
      title={
        hasCounterpart
          ? undefined
          : targetLocale === 'en'
            ? 'This page is not available in English; you will be taken to the English home page.'
            : 'Bu sayfanın Türkçe karşılığı yok; Türkçe ana sayfaya yönlendirileceksiniz.'
      }
      className="flex items-center gap-1.5 text-nav font-medium text-ink transition-colors hover:text-brand-blue"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="10" cy="10" r="7.5" />
        <path d="M2.5 10h15M10 2.5c2 2.4 2 12.6 0 15M10 2.5c-2 2.4-2 12.6 0 15" />
      </svg>
      {targetLocale.toUpperCase()}
    </Link>
  )
}
