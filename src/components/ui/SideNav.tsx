'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { cn } from '../../lib/utils'

export type SideNavItem = {
  label: string
  href: string
  children?: SideNavItem[]
}

/**
 * Bölüm içi yan menü. Banka sitesindeki lacivert blok menü yerine
 * açık zemin + aktif öğede 3px lacivert çizgi (BBVA nav alt çizgisi).
 */
export function SideNav({
  title,
  items,
  labels,
}: {
  title: string
  items: SideNavItem[]
  labels: { toggle: string }
}) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  if (items.length === 0) return null

  const renderItems = (list: SideNavItem[], depth = 0) => (
    <ul className={cn(depth > 0 && 'ml-3 border-l border-divider')}>
      {list.map((item) => {
        const isActive = pathname === item.href
        const isAncestor = !isActive && pathname.startsWith(`${item.href}/`)

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'block border-b border-divider px-4 py-2.5 text-sm transition-colors',
                depth > 0 && 'pl-5',
                isActive
                  ? 'bg-surface font-medium text-brand-navy shadow-[inset_3px_0_0_0_var(--color-brand-navy)]'
                  : isAncestor
                    ? 'font-medium text-brand-blue-mid'
                    : 'text-ink hover:text-brand-blue-mid',
              )}
            >
              {item.label}
            </Link>
            {item.children && item.children.length > 0 && renderItems(item.children, depth + 1)}
          </li>
        )
      })}
    </ul>
  )

  return (
    <nav aria-label={title} className="mb-6 border border-divider bg-surface lg:mb-0">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
        aria-controls="side-nav-list"
        className="flex w-full items-center justify-between bg-navy px-4 py-3 text-left text-sm font-medium text-white lg:hidden"
      >
        {labels.toggle}
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M5 7l5 5 5-5" />
        </svg>
      </button>

      <div className="hidden bg-navy px-4 py-3 text-sm font-medium text-white lg:block">{title}</div>

      <div id="side-nav-list" className={cn(!isOpen && 'hidden lg:block')}>
        {renderItems(items)}
      </div>
    </nav>
  )
}
