export const locales = ['tr', 'en'] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'tr'

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

/** <html lang> ve hreflang için tam dil etiketi. */
export const htmlLang: Record<Locale, string> = {
  tr: 'tr-TR',
  en: 'en',
}

export const localeLabels: Record<Locale, string> = {
  tr: 'Türkçe',
  en: 'English',
}

/** Dil içi arama yolu. İngilizce sitede Türkçe "arama" slug'ı kullanılmaz. */
export function searchPath(locale: Locale): string {
  return locale === 'en' ? '/en/search' : '/tr/arama'
}
