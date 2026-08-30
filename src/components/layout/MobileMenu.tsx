'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { isExternal } from './resolveLink'
import type { MegaMenuItem } from './MegaMenu'

/**
 * Mobil menü. Referans sitede hamburger yok (tek seviye menüsü var), ancak
 * GYO'nun 4 seviyeli yapısında mobilde açılır menü olmadan gezinme imkânsız.
 */
export function MobileMenu({
  items,
  utilityLinks,
  labels,
}: {
  items: MegaMenuItem[]
  utilityLinks: { label: string; href: string }[]
  labels: { open: string; close: string; menu: string }
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const pathname = usePathname()

  useEffect(() => setIsOpen(false), [pathname])

  // Menü açıkken arkadaki sayfanın kaydırılmasını engelle
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        aria-label={isOpen ? labels.close : labels.open}
        className="flex h-11 w-11 items-center justify-center text-ink"
      >
        <span aria-hidden="true" className="relative block h-4 w-6">
          <span
            className={`absolute left-0 h-0.5 w-6 bg-current transition-transform ${
              isOpen ? 'top-1/2 rotate-45' : 'top-0'
            }`}
          />
          <span
            className={`absolute left-0 top-1/2 h-0.5 w-6 -translate-y-1/2 bg-current transition-opacity ${
              isOpen ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <span
            className={`absolute left-0 h-0.5 w-6 bg-current transition-transform ${
              isOpen ? 'top-1/2 -rotate-45' : 'bottom-0'
            }`}
          />
        </span>
      </button>

      {isOpen && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 bottom-0 top-[var(--stack-offset)] z-50 overflow-y-auto border-t border-bar-border bg-surface"
        >
          <nav aria-label={labels.menu} className="px-4 py-4">
            <ul className="divide-y divide-bar-border">
              {items.map((item) => {
                const hasChildren = item.columns.length > 0
                const isExpanded = expanded === item.href

                return (
                  <li key={item.href} className="py-1">
                    <div className="flex items-center justify-between">
                      <Link
                        href={item.href}
                        className="flex-1 py-3 font-medium text-ink"
                      >
                        {item.label}
                      </Link>
                      {hasChildren && (
                        <button
                          type="button"
                          onClick={() => setExpanded(isExpanded ? null : item.href)}
                          aria-expanded={isExpanded}
                          aria-label={`${item.label} alt menüsü`}
                          className="flex h-11 w-11 items-center justify-center text-brand-blue"
                        >
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 20 20"
                            className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M5 7l5 5 5-5" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {hasChildren && isExpanded && (
                      <div className="pb-3 pl-3">
                        {item.columns.map((column, columnIndex) => (
                          <div key={column.heading ?? columnIndex} className="mb-3">
                            {column.heading && (
                              <p className="mb-1 text-nav font-medium text-heading">
                                {column.heading}
                              </p>
                            )}
                            <ul className="space-y-1">
                              {column.links.map((link) => (
                                <li key={link.href}>
                                  <Link href={link.href} className="block py-2 text-body">
                                    {link.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>

            {utilityLinks.length > 0 && (
              <ul className="mt-4 space-y-1 border-t border-bar-border pt-4">
                {utilityLinks.map((link) => (
                  <li key={link.href}>
                    {isExternal(link.href) ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block py-2 text-body"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className="block py-2 text-body">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </nav>
        </div>
      )}
    </div>
  )
}
