import Link from 'next/link'

import type { Locale } from '../../lib/i18n'

/**
 * Dil değiştirici. Banka sitesinde “EN” düz metin bağıdır (15px, #225A8F).
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
      className="inline-flex h-10 items-center text-[15px] font-medium text-brand-blue-mid hover:underline"
    >
      {targetLocale.toUpperCase()}
    </Link>
  )
}
