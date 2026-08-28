import Link from 'next/link'

import type { Locale } from '../../lib/i18n'
import { cn } from '../../lib/utils'
import { resolveLink, type NavLink } from './resolveLink'

/**
 * Garanti BBVA kardeş-marka barı. Referans sitede 44px yükseklikte, #EBEFF8
 * zeminde, aktif marka yeşil ve altı çizili. Mobilde yatay kaydırılıyor.
 */
export function AffiliateBar({ items, locale }: { items: NavLink[]; locale: Locale }) {
  if (items.length === 0) return null

  return (
    <div className="h-[--bar-height] border-b border-bar-border bg-bar">
      <nav
        aria-label={locale === 'tr' ? 'Garanti BBVA markaları' : 'Garanti BBVA brands'}
        className="mx-auto flex h-full max-w-bar items-stretch overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <ul className="flex items-stretch">
          {items.map((item, index) => (
            <li key={`${item.label}-${index}`} className="flex items-stretch">
              {index > 0 && <span aria-hidden="true" className="my-3 w-px shrink-0 bg-divider" />}
              <Link
                href={resolveLink(item, locale)}
                aria-current={item.isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center whitespace-nowrap px-4 text-[13px] font-medium transition-colors',
                  item.isActive
                    ? 'text-green shadow-[inset_0_-2px_0_0_var(--color-green)]'
                    : 'text-ink hover:text-brand-blue',
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
