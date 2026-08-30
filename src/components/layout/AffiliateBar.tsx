import Link from 'next/link'

import type { Locale } from '../../lib/i18n'
import { cn } from '../../lib/utils'
import { isExternal, resolveLink, type NavLink } from './resolveLink'

/**
 * Garanti BBVA iştirak barı. Ölçüm: bbva-affiliate-bar-cf.css
 * 44px, #EBEFF8, aktif #009242, 3px alt çizgi.
 */
export function AffiliateBar({ items, locale }: { items: NavLink[]; locale: Locale }) {
  if (items.length === 0) return null

  return (
    <div className="h-11 border-y border-bar-border bg-bar">
      <nav
        aria-label={locale === 'tr' ? 'Garanti BBVA markaları' : 'Garanti BBVA brands'}
        className="mx-auto flex h-full max-w-bar items-stretch overflow-x-auto px-3 [scrollbar-width:none] md:justify-center md:px-4 [&::-webkit-scrollbar]:hidden"
      >
        <ul className="flex items-stretch">
          {items.map((item, index) => {
            const href = resolveLink(item, locale)
            const className = cn(
              'relative flex items-center whitespace-nowrap px-3 text-[14px] font-medium leading-[1.15] transition-colors md:px-5',
              item.isActive
                ? 'text-green after:absolute after:inset-x-4 after:bottom-[-1px] after:h-[3px] after:rounded-t-[3px] after:bg-green md:after:inset-x-6'
                : 'text-ink hover:text-green',
            )
            return (
              <li key={`${item.label}-${index}`} className="relative flex items-stretch">
                {isExternal(href) ? (
                  <a href={href} className={className}>
                    {item.label}
                  </a>
                ) : (
                  <Link href={href} aria-current={item.isActive ? 'page' : undefined} className={className}>
                    {item.label}
                  </Link>
                )}
                {index < items.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-0 top-1/2 h-[18px] w-px -translate-y-1/2 bg-divider"
                  />
                )}
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
