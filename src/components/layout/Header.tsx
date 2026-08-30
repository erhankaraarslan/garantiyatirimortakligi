import Image from 'next/image'
import Link from 'next/link'
import { headers } from 'next/headers'

import { locales, type Locale } from '../../lib/i18n'
import { getNavigation, getSiteSettings, resolveAlternatePath } from '../../lib/data'
import { AffiliateBar } from './AffiliateBar'
import { LanguageSwitcher } from './LanguageSwitcher'
import { MegaMenu, type MegaMenuItem } from './MegaMenu'
import { MobileMenu } from './MobileMenu'
import { isExternal, resolveLink, withKapLocale } from './resolveLink'

const strings = {
  tr: {
    skip: 'İçeriğe geç',
    home: 'Ana sayfa',
    open: 'Menüyü aç',
    close: 'Menüyü kapat',
    menu: 'Ana menü',
    search: 'Arama',
    searchHref: '/tr/arama',
  },
  en: {
    skip: 'Skip to content',
    home: 'Home page',
    open: 'Open menu',
    close: 'Close menu',
    menu: 'Main menu',
    search: 'Search',
    searchHref: '/en/search',
  },
} satisfies Record<Locale, Record<string, string>>

export async function Header({ locale }: { locale: Locale }) {
  const [nav, settings, headerList] = await Promise.all([
    getNavigation(locale),
    getSiteSettings(locale),
    headers(),
  ])

  const pathname = headerList.get('x-pathname') ?? `/${locale}`
  const targetLocale = locales.find((code) => code !== locale) as Locale
  const alternate = await resolveAlternatePath(pathname, targetLocale)

  const t = strings[locale]

  const menuItems: MegaMenuItem[] = (nav.mainMenu ?? []).map((item) => ({
    label: item.label ?? '',
    href: resolveLink(item, locale),
    columns: (item.columns ?? []).map((column) => ({
      heading: column.heading,
      links: (column.links ?? []).map((link) => ({
        label: link.label ?? '',
        href: resolveLink(link, locale),
      })),
    })),
  }))

  const utilityLinks = (nav.headerUtility ?? []).map((link) => ({
    label: link.label ?? '',
    href: resolveLink(link, locale),
  }))

  const cta = nav.headerCta?.label
    ? {
        label: nav.headerCta.label,
        href: withKapLocale(resolveLink(nav.headerCta, locale), locale),
        external: nav.headerCta.type === 'external',
      }
    : null

  const logo = typeof settings.logo === 'object' ? settings.logo : null
  const kapClass =
    'hidden h-10 shrink-0 items-center justify-center rounded-btn border border-brand-navy bg-surface px-3 text-[15px] font-medium text-brand-navy transition-colors hover:bg-surface-alt sm:inline-flex'

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:bg-surface focus:px-4 focus:py-2 focus:text-brand-blue"
      >
        {t.skip}
      </a>

      <div className="sticky top-0 z-50">
        <AffiliateBar items={nav.affiliateBar ?? []} locale={locale} />

        <header className="relative border-b border-bar-border bg-surface">
          <div className="container-page flex h-[var(--header-logo-row)] items-center gap-6 lg:gap-8">
            <Link href={`/${locale}`} aria-label={t.home} className="flex shrink-0 items-center">
              {logo?.url ? (
                <Image
                  src={logo.url}
                  alt={logo.alt ?? settings.siteName ?? ''}
                  width={logo.width ?? 240}
                  height={logo.height ?? 88}
                  priority
                  unoptimized
                  className="h-[var(--header-logo-size)] w-auto object-contain object-left"
                />
              ) : (
                <span className="flex flex-col leading-tight">
                  <span className="text-[22px] font-bold tracking-tight text-heading">
                    Garanti Yatırım
                  </span>
                  <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-brand-blue-mid">
                    Ortaklığı A.Ş.
                  </span>
                </span>
              )}
            </Link>

            <nav aria-label={t.menu} className="hidden h-full min-w-0 flex-1 lg:flex lg:items-stretch">
              <MegaMenu items={menuItems} />
            </nav>

            <div className="ml-auto flex shrink-0 items-center gap-4 lg:gap-5">
              <div className="hidden items-center lg:flex">
                <div className="mr-6 flex items-center border-r border-[#bdbdbd] pr-6">
                  <LanguageSwitcher
                    targetLocale={targetLocale}
                    href={alternate.href}
                    hasCounterpart={alternate.hasCounterpart}
                  />
                </div>
                {utilityLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex items-center whitespace-nowrap text-[15px] font-medium leading-6 text-brand-blue hover:text-navy"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <Link
                href={t.searchHref}
                aria-label={t.search}
                className="flex h-10 w-10 items-center justify-center text-brand-blue-mid hover:text-brand-navy"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                  <circle cx="11" cy="11" r="6.25" stroke="currentColor" strokeWidth="1.75" />
                  <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                </svg>
              </Link>

              {cta &&
                (cta.external || isExternal(cta.href) ? (
                  <a
                    href={cta.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={kapClass}
                  >
                    {cta.label}
                  </a>
                ) : (
                  <Link href={cta.href} className={kapClass}>
                    {cta.label}
                  </Link>
                ))}

              <MobileMenu
                items={menuItems}
                utilityLinks={[
                  ...utilityLinks,
                  ...(cta ? [{ label: cta.label, href: cta.href }] : []),
                  { label: targetLocale.toUpperCase(), href: alternate.href },
                ]}
                labels={{ open: t.open, close: t.close, menu: t.menu }}
              />
            </div>
          </div>
        </header>
      </div>
    </>
  )
}
