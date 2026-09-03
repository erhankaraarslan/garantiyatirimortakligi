import { describe, expect, it } from 'vitest'

import {
  lookupAlternate,
  normalizePathname,
  staticAlternateEntries,
  withSearchString,
} from './alternatePath'

describe('lookupAlternate', () => {
  const map = {
    ...staticAlternateEntries(),
    '/tr/kurumsal': { href: '/en/corporate', hasCounterpart: true },
    '/en/corporate': { href: '/tr/kurumsal', hasCounterpart: true },
    '/tr/yalniz-turkce': { href: '/en', hasCounterpart: false },
  }

  it('ana sayfa ve arama yollarını eşler', () => {
    expect(lookupAlternate('/tr', 'en', map)).toEqual({ href: '/en', hasCounterpart: true })
    expect(lookupAlternate('/tr/arama', 'en', map)).toEqual({
      href: '/en/search',
      hasCounterpart: true,
    })
    expect(lookupAlternate('/en/search', 'tr', map)).toEqual({
      href: '/tr/arama',
      hasCounterpart: true,
    })
  })

  it('CMS sayfasının karşı slug’ını döner', () => {
    expect(lookupAlternate('/tr/kurumsal', 'en', map)).toEqual({
      href: '/en/corporate',
      hasCounterpart: true,
    })
    expect(lookupAlternate('/tr/kurumsal/', 'en', map)).toEqual({
      href: '/en/corporate',
      hasCounterpart: true,
    })
  })

  it('haritada yoksa hedef dilin ana sayfasına düşer', () => {
    expect(lookupAlternate('/tr/bilinmeyen', 'en', map)).toEqual({
      href: '/en',
      hasCounterpart: false,
    })
  })

  it('karşılığı olmayan sayfada fallback’i korur', () => {
    expect(lookupAlternate('/tr/yalniz-turkce', 'en', map)).toEqual({
      href: '/en',
      hasCounterpart: false,
    })
  })
})

describe('normalizePathname / withSearchString', () => {
  it('sondaki slash’ı kırpar', () => {
    expect(normalizePathname('/tr/kurumsal/')).toBe('/tr/kurumsal')
    expect(normalizePathname('/')).toBe('/')
  })

  it('arama query’sini korur', () => {
    expect(withSearchString('/en/search', 'q=portfoy')).toBe('/en/search?q=portfoy')
    expect(withSearchString('/en/search', '?q=portfoy')).toBe('/en/search?q=portfoy')
    expect(withSearchString('/en/corporate', '')).toBe('/en/corporate')
  })
})
