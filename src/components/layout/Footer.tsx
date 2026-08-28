import Link from 'next/link'

import { getContactInfo, getNavigation, getSiteSettings } from '../../lib/data'
import type { Locale } from '../../lib/i18n'
import { resolveLink } from './resolveLink'

const socialLabels: Record<string, string> = {
  linkedin: 'LinkedIn',
  x: 'X',
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
}

const socialPaths: Record<string, string> = {
  linkedin:
    'M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9h4v12H3zM10 9h3.8v1.7h.05A4.2 4.2 0 0117.6 8.7c3 0 3.4 1.9 3.4 4.5V21h-4v-6.3c0-1.5-.3-2.6-1.7-2.6s-2 .9-2 2.5V21h-3.3z',
  x: 'M17.5 3h3.2l-7 8 7.3 10h-5.6l-4.4-6-5 6H2.8l7.3-8.6L3 3h5.7l4 5.6zm-1 16h1.7L7.6 4.8H5.8z',
  instagram:
    'M12 2.2c3.2 0 3.6 0 4.9.07 1.2.06 2 .25 2.5.45.6.24 1 .55 1.5 1 .45.46.76.9 1 1.5.2.5.4 1.3.45 2.5.06 1.3.07 1.7.07 4.9s0 3.6-.07 4.9c-.06 1.2-.25 2-.45 2.5a4 4 0 01-1 1.5c-.46.45-.9.76-1.5 1-.5.2-1.3.4-2.5.45-1.3.06-1.7.07-4.9.07s-3.6 0-4.9-.07c-1.2-.06-2-.25-2.5-.45a4 4 0 01-1.5-1 4 4 0 01-1-1.5c-.2-.5-.4-1.3-.45-2.5C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.9c.06-1.2.25-2 .45-2.5a4 4 0 011-1.5 4 4 0 011.5-1c.5-.2 1.3-.4 2.5-.45C8.4 2.2 8.8 2.2 12 2.2zm0 3.4a6.4 6.4 0 100 12.8 6.4 6.4 0 000-12.8zm0 10.5a4.1 4.1 0 110-8.2 4.1 4.1 0 010 8.2zm6.6-10.8a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z',
  facebook:
    'M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0022 12z',
  youtube:
    'M21.6 7.2a2.5 2.5 0 00-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 002.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 001.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 001.8-1.8C22 15.2 22 12 22 12s0-3.2-.4-4.8zM10 15.5v-7l6 3.5z',
}

export async function Footer({ locale }: { locale: Locale }) {
  const [nav, settings, contact] = await Promise.all([
    getNavigation(locale),
    getSiteSettings(locale),
    getContactInfo(locale),
  ])

  const year = new Date().getFullYear()

  return (
    <footer className="bg-navy text-white">
      <div className="container-page py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-h3 font-bold">{settings.siteName}</p>
            {contact.address && (
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/75">
                {contact.address}
              </p>
            )}
            <dl className="mt-3 space-y-1 text-sm text-white/75">
              {contact.phone && (
                <div className="flex gap-2">
                  <dt>{locale === 'tr' ? 'Tel' : 'Phone'}:</dt>
                  <dd>
                    <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="hover:underline">
                      {contact.phone}
                    </a>
                  </dd>
                </div>
              )}
              {contact.fax && (
                <div className="flex gap-2">
                  <dt>{locale === 'tr' ? 'Faks' : 'Fax'}:</dt>
                  <dd>{contact.fax}</dd>
                </div>
              )}
              {contact.email && (
                <div className="flex gap-2">
                  <dt>{locale === 'tr' ? 'E-Posta' : 'Email'}:</dt>
                  <dd>
                    <a href={`mailto:${contact.email}`} className="hover:underline">
                      {contact.email}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {(nav.footerColumns ?? []).map((column, index) => (
            <nav key={column.heading ?? index} aria-label={column.heading ?? undefined}>
              {column.heading && (
                <p className="text-nav font-bold uppercase tracking-wide text-white">
                  {column.heading}
                </p>
              )}
              <ul className="mt-3 space-y-2">
                {(column.links ?? []).map((link, linkIndex) => (
                  <li key={`${link.label}-${linkIndex}`}>
                    <Link
                      href={resolveLink(link, locale)}
                      className="text-sm text-white/75 transition-colors hover:text-white hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {(nav.socialLinks ?? []).length > 0 && (
          <ul className="mt-10 flex gap-3">
            {(nav.socialLinks ?? []).map((social) => (
              <li key={social.platform}>
                <a
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={socialLabels[social.platform] ?? social.platform}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 transition-colors hover:border-white hover:bg-white/10"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                    <path d={socialPaths[social.platform] ?? ''} />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-white/15">
        <div className="container-page flex flex-col gap-3 py-5 text-xs text-white/60 md:flex-row md:items-center md:justify-between">
          <p>
            Copyright © {year}, {settings.siteName}
          </p>
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {(nav.legalLinks ?? []).map((link, index) => (
              <li key={`${link.label}-${index}`}>
                <Link href={resolveLink(link, locale)} className="hover:text-white hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
