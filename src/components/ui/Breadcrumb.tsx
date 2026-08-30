import Link from 'next/link'

import type { Locale } from '../../lib/i18n'

export type Crumb = { label: string; href?: string }

/**
 * Referans sitede breadcrumb yok, ancak GYO'da 4 seviyeye kadar inen 64 sayfa
 * bulunduğu için konum göstergesi olmadan gezinme kayboluyor.
 */
export function Breadcrumb({ items, locale }: { items: Crumb[]; locale: Locale }) {
  if (items.length === 0) return null

  return (
    <nav aria-label={locale === 'tr' ? 'Konumunuz' : 'Breadcrumb'} className="py-4">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
        <li>
          <Link href={`/${locale}`} className="hover:text-brand-blue-mid hover:underline">
            {locale === 'tr' ? 'Ana Sayfa' : 'Home'}
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-x-2">
              <span aria-hidden="true">/</span>
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:text-brand-blue-mid hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" className="font-medium text-ink">
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
