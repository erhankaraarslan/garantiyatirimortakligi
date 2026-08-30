import Link from 'next/link'

import type { Locale } from '../../lib/i18n'

/**
 * Dil değiştirici — Garanti BBVA Kripto header’ı:
 * 24px küre yuvası + hedef dil kodu, #1464A5, hover #062146.
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
  const label = targetLocale === 'en' ? 'English' : 'Türkçe'

  return (
    <Link
      href={href}
      hrefLang={targetLocale}
      lang={targetLocale}
      aria-label={label}
      title={
        hasCounterpart
          ? undefined
          : targetLocale === 'en'
            ? 'This page is not available in English; you will be taken to the English home page.'
            : 'Bu sayfanın Türkçe karşılığı yok; Türkçe ana sayfaya yönlendirileceksiniz.'
      }
      className="inline-flex h-6 items-center text-[15px] font-medium text-brand-blue hover:text-navy"
    >
      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-start" aria-hidden="true">
        <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C6.4319 0 4.96917 0.451165 3.73454 1.23077H3.69231V1.25762C1.47181 2.67925 0 5.16774 0 8C0 12.4183 3.58172 16 8 16ZM3.16415 3.26322C1.96815 4.48407 1.23077 6.15592 1.23077 8C1.23077 11.5311 3.93446 14.4307 7.38462 14.7416V12.3077H6.15385V9.84615L5.02564 8.61539H4.92308V8.5035L2.46154 5.81818L3.16415 3.26322ZM3.3249 3.10448L3.69231 3.02098V2.77805C3.5659 2.88244 3.44335 2.99133 3.3249 3.10448ZM6.15385 4.92308H7.38462V3.69231H9.84615V1.48558C12.6874 2.28918 14.7692 4.90147 14.7692 8C14.7692 11.0985 12.6874 13.7108 9.84615 14.5144V12.3077H11.0769V8.61539H8.61539V6.15385H6.15385V4.92308Z"
          />
        </svg>
      </span>
      {targetLocale.toUpperCase()}
    </Link>
  )
}
