import type { Locale } from '../../lib/i18n'
import type { Page } from '../../payload-types'

export type NavLink = {
  label?: string | null
  type?: ('page' | 'external') | null
  // Postgres adapter'ı sayısal ID üretiyor
  page?: (number | null) | Page
  url?: string | null
  isActive?: boolean | null
}

/**
 * Menü kaydını gezilebilir bir href'e çevirir. Sayfa referansı verilmişse
 * parent zincirinden tam yolu kurar (depth>=2 ile çekilmiş olması gerekir).
 */
export function resolveLink(link: NavLink | null | undefined, locale: Locale): string {
  if (!link) return `/${locale}`

  if (link.type === 'external') return link.url ?? '#'

  const page = link.page
  if (!page || typeof page !== 'object') return link.url ?? `/${locale}`
  if (page.template === 'landing') return `/${locale}`

  const parts: string[] = [page.slug]
  let parent = page.parent
  while (parent && typeof parent === 'object') {
    parts.unshift(parent.slug)
    parent = parent.parent
  }
  return `/${locale}/${parts.join('/')}`
}

export function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href)
}
