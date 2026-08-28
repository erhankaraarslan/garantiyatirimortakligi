import Image from 'next/image'
import Link from 'next/link'
import { headers } from 'next/headers'

import { locales, type Locale } from '../../lib/i18n'
import { getNavigation, getSiteSettings, resolveAlternatePath } from '../../lib/data'
import { AffiliateBar } from './AffiliateBar'
import { LanguageSwitcher } from './LanguageSwitcher'
import { MegaMenu, type MegaMenuItem } from './MegaMenu'
import { MobileMenu } from './MobileMenu'
import { resolveLink } from './resolveLink'

const strings = {
  tr: {
    skip: 'İçeriğe geç',
    home: 'Ana sayfa',
    open: 'Menüyü aç',
    close: 'Menüyü kapat',
    menu: 'Ana menü',
  },
  en: {
    skip: 'Skip to content',
    home: 'Home page',
    open: 'Open menu',
    close: 'Close menu',
    menu: 'Main menu',
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
    ? { label: nav.headerCta.label, href: resolveLink(nav.headerCta, locale) }
    : null

  const logo = typeof settings.logo === 'object' ? settings.logo : null

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
          <div className="container-page flex h-[--header-height] items-stretch justify-between gap-4">
            <div className="flex min-w-0 items-stretch gap-6">
              <Link
                href={`/${locale}`}
                aria-label={t.home}
                className="flex shrink-0 items-center py-3"
              >
                {logo?.url ? (
                  <Image
                    src={logo.url}
                    alt={logo.alt ?? settings.siteName ?? ''}
                    width={logo.width ?? 200}
                    height={logo.height ?? 44}
                    priority
                    className="h-auto w-[168px] object-contain"
                  />
                ) : (
                  /*
                   * Logo görseli yüklenene kadar metin lockup. Tek satırda menüyü
                   * sıkıştırdığı için iki satıra bölüyoruz.
                   */
                  <span className="flex flex-col leading-tight">
                    <span className="text-base font-bold tracking-tight text-brand-blue-dark">
                      Garanti Yatırım
                    </span>
                    <span className="text-xs font-medium uppercase tracking-widest text-brand-blue">
                      Ortaklığı A.Ş.
                    </span>
                  </span>
                )}
              </Link>

              <nav aria-label={t.menu} className="flex items-stretch">
                <MegaMenu items={menuItems} />
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden items-center gap-4 md:flex">
                <LanguageSwitcher
                  targetLocale={targetLocale}
                  href={alternate.href}
                  hasCounterpart={alternate.hasCounterpart}
                />
                {utilityLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="whitespace-nowrap text-nav font-medium text-brand-blue hover:underline"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {cta && (
                <Link
                  href={cta.href}
                  className="hidden items-center whitespace-nowrap bg-brand-blue px-5 text-nav font-medium text-white transition-colors hover:bg-brand-blue-mid sm:flex"
                >
                  {cta.label}
                </Link>
              )}

              <MobileMenu
                items={menuItems}
                utilityLinks={[
                  ...utilityLinks,
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
