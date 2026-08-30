import Link from 'next/link'

import type { SectionNavItem } from '../../lib/data'
import type { Locale } from '../../lib/i18n'

/**
 * Site haritası. Eski sitede elle bakımı yapılan statik bir listeydi;
 * artık sayfa ağacından otomatik üretiliyor.
 */
export function SitemapTree({ sections, locale }: { sections: SectionNavItem[]; locale: Locale }) {
  return (
    <nav aria-label={locale === 'tr' ? 'Site haritası' : 'Sitemap'}>
      <ul className="grid gap-8 sm:grid-cols-2">
        {sections.map((section) => (
          <li key={section.href}>
            <Link
              href={section.href}
              className="text-h3 font-medium text-heading hover:underline"
            >
              {section.label}
            </Link>
            {section.children && section.children.length > 0 && (
              <ul className="mt-2 space-y-1 border-l border-divider pl-4">
                {section.children.map((child) => (
                  <li key={child.href}>
                    <Link href={child.href} className="text-body hover:text-brand-blue hover:underline">
                      {child.label}
                    </Link>
                    {child.children && child.children.length > 0 && (
                      <ul className="mt-1 space-y-1 border-l border-divider pl-4">
                        {child.children.map((grandChild) => (
                          <li key={grandChild.href}>
                            <Link
                              href={grandChild.href}
                              className="text-sm text-muted hover:text-brand-blue hover:underline"
                            >
                              {grandChild.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}
