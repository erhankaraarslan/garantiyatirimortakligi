import { headers } from 'next/headers'
import Link from 'next/link'

import { isLocale, type Locale } from '../../../lib/i18n'

const copy = {
  tr: {
    title: 'Aradığınız sayfa bulunamadı',
    body: 'Sayfa taşınmış veya adresi değişmiş olabilir. Ana sayfadan ilerleyebilir ya da site haritasını kullanabilirsiniz.',
    home: 'Ana Sayfa',
    other: 'English Home',
    otherHref: '/en',
  },
  en: {
    title: 'Page not found',
    body: 'The page you are looking for may have been moved or renamed. You can continue from the home page or use the site map.',
    home: 'Home',
    other: 'Türkçe Ana Sayfa',
    otherHref: '/tr',
  },
} satisfies Record<Locale, Record<string, string>>

export default async function NotFound() {
  const pathname = (await headers()).get('x-pathname') ?? '/tr'
  const candidate = pathname.split('/').filter(Boolean)[0] ?? 'tr'
  const locale: Locale = isLocale(candidate) ? candidate : 'tr'
  const t = copy[locale]

  return (
    <div className="container-page flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-h1 font-bold text-brand-blue-light">404</p>
      <h1 className="mt-2 text-h2 text-ink">{t.title}</h1>
      <p className="mt-3 max-w-lg text-body">{t.body}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href={`/${locale}`}
          className="bg-brand-blue px-6 py-3 text-nav font-medium text-white transition-colors hover:bg-brand-blue-mid"
        >
          {t.home}
        </Link>
        <Link
          href={t.otherHref}
          className="border border-brand-blue px-6 py-3 text-nav font-medium text-brand-blue transition-colors hover:bg-surface-alt"
        >
          {t.other}
        </Link>
      </div>
    </div>
  )
}
