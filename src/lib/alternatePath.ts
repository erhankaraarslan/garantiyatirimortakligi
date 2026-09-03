import type { Locale } from './i18n'
import { searchPath } from './i18n'

export type AlternateTarget = {
  href: string
  hasCounterpart: boolean
}

/** CMS dışı sabit yollar: arama ve dil kökleri. */
export function staticAlternateEntries(): Record<string, AlternateTarget> {
  return {
    '/tr': { href: '/en', hasCounterpart: true },
    '/en': { href: '/tr', hasCounterpart: true },
    [searchPath('tr')]: { href: searchPath('en'), hasCounterpart: true },
    [searchPath('en')]: { href: searchPath('tr'), hasCounterpart: true },
    '/tr/search': { href: searchPath('en'), hasCounterpart: true },
    '/en/arama': { href: searchPath('tr'), hasCounterpart: true },
  }
}

export function normalizePathname(pathname: string): string {
  if (!pathname) return '/'
  const trimmed = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
  return trimmed || '/'
}

export function lookupAlternate(
  pathname: string,
  targetLocale: Locale,
  map: Record<string, AlternateTarget>,
): AlternateTarget {
  const path = normalizePathname(pathname)
  return map[path] ?? { href: `/${targetLocale}`, hasCounterpart: false }
}

export function withSearchString(href: string, search: string): string {
  if (!search) return href
  const query = search.startsWith('?') ? search.slice(1) : search
  return query ? `${href}?${query}` : href
}
