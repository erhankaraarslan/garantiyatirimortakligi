import Link from 'next/link'

import type { Locale } from '../../lib/i18n'

export type SectionIndexItem = {
  title: string
  href: string
}

/**
 * Hub sayfalarında (Yatırımcı İlişkileri, Genel Kurul vb.) gövde çoğu zaman
 * yalnızca bir stok görsel. Yan menüye ek olarak ana alanda alt sayfa listesi
 * gösteriyoruz; aksi halde sayfa boş duruyor.
 */
export function SectionIndex({
  items,
  locale,
}: {
  items: SectionIndexItem[]
  locale: Locale
}) {
  if (items.length === 0) return null

  return (
    <nav aria-label={locale === 'tr' ? 'Alt sayfalar' : 'Subpages'} className="mt-4">
      <ul className="divide-y divide-divider border-y border-divider">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="flex items-center justify-between gap-4 py-3 text-brand-blue hover:underline"
            >
              <span>{item.title}</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
