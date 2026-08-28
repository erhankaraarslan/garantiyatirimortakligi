'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { cn } from '../../lib/utils'

export type MegaMenuColumn = {
  heading?: string | null
  links: { label: string; href: string }[]
}

export type MegaMenuItem = {
  label: string
  href: string
  columns: MegaMenuColumn[]
}

/**
 * Masaüstü ana menü. Referans sitede tek seviye menü olduğu için mega menü yok;
 * GYO'da 4 seviye derinlik ve 64 sayfa olduğundan alt sayfaları kolonlara
 * açan bir mega menü ekliyoruz.
 */
export function MegaMenu({ items }: { items: MegaMenuItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const pathname = usePathname()
  const containerRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sayfa değişince açık menüyü kapat
  useEffect(() => setOpenIndex(null), [pathname])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpenIndex(null)
    }
    function onClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpenIndex(null)
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onClickOutside)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onClickOutside)
    }
  }, [])

  // Menü ile panel arasındaki boşluktan geçerken kapanmaması için gecikme
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpenIndex(null), 120)
  }
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }

  return (
    /*
     * Masaüstü menü xl'den itibaren açılıyor: dört Türkçe menü etiketi
     * ("Sürekli Bilgilendirme Formu" gibi) 1024px'te tek satıra sığmıyor.
     */
    <div ref={containerRef} className="hidden xl:block" onMouseLeave={scheduleClose}>
      <ul className="flex items-stretch">
        {items.map((item, index) => {
          const hasPanel = item.columns.length > 0
          const isOpen = openIndex === index
          const isCurrent = pathname.startsWith(item.href)

          return (
            <li key={`${item.href}-${index}`} className="flex items-stretch">
              <Link
                href={item.href}
                aria-expanded={hasPanel ? isOpen : undefined}
                aria-current={isCurrent ? 'page' : undefined}
                onMouseEnter={() => {
                  cancelClose()
                  setOpenIndex(hasPanel ? index : null)
                }}
                onFocus={() => setOpenIndex(hasPanel ? index : null)}
                className={cn(
                  'flex items-center whitespace-nowrap px-3.5 text-nav font-medium uppercase tracking-wide transition-colors',
                  isCurrent || isOpen
                    ? 'text-brand-blue shadow-[inset_0_-3px_0_0_var(--color-brand-blue)]'
                    : 'text-ink hover:text-brand-blue',
                )}
              >
                {item.label}
              </Link>

              {hasPanel && isOpen && (
                <div
                  onMouseEnter={cancelClose}
                  className="absolute left-0 right-0 top-full z-40 border-t border-bar-border bg-surface shadow-[0_1px_1px_rgba(0,0,0,0.2)]"
                >
                  <div className="container-page grid gap-8 py-8 md:grid-cols-3">
                    {item.columns.map((column, columnIndex) => (
                      <div key={column.heading ?? columnIndex}>
                        {column.heading && (
                          <p className="mb-3 text-nav font-bold uppercase tracking-wide text-brand-blue-dark">
                            {column.heading}
                          </p>
                        )}
                        <ul className="space-y-2">
                          {column.links.map((link) => (
                            <li key={link.href}>
                              <Link
                                href={link.href}
                                className="text-body hover:text-brand-blue hover:underline"
                              >
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
