'use client'

import { useId, useState, type ReactNode } from 'react'

import { cn } from '../../lib/utils'

export type AccordionItem = {
  id: string
  title: string
  meta?: string
  content: ReactNode
}

/**
 * Referans sitedeki SSS deseni: başlık solda, chevron sağda, alt kenarlık
 * ayırıcı, keskin köşeler. Kaynak: docs/design-reference/09-faq-section.png
 *
 * defaultOpenId ile ilk grup açık başlatılabiliyor (arşiv sayfalarında en yeni
 * yılın açık gelmesi için).
 */
export function Accordion({
  items,
  defaultOpenId,
  allowMultiple = false,
}: {
  items: AccordionItem[]
  defaultOpenId?: string
  allowMultiple?: boolean
}) {
  const [openIds, setOpenIds] = useState<string[]>(defaultOpenId ? [defaultOpenId] : [])
  const baseId = useId()

  const toggle = (id: string) => {
    setOpenIds((current) => {
      if (current.includes(id)) return current.filter((value) => value !== id)
      return allowMultiple ? [...current, id] : [id]
    })
  }

  return (
    <div className="border-t border-divider">
      {items.map((item) => {
        const isOpen = openIds.includes(item.id)
        const panelId = `${baseId}-${item.id}-panel`
        const buttonId = `${baseId}-${item.id}-button`

        return (
          <div key={item.id} className="border-b border-divider">
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className={cn(
                  'flex w-full items-center justify-between gap-4 px-1 py-4 text-left transition-colors',
                  isOpen ? 'text-heading' : 'text-ink hover:text-brand-blue-mid',
                )}
              >
                <span className="flex flex-col">
                  <span className="text-h3 font-medium">{item.title}</span>
                  {item.meta && <span className="mt-0.5 text-xs text-muted">{item.meta}</span>}
                </span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  className={cn('h-5 w-5 shrink-0 transition-transform', isOpen && 'rotate-180')}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 7l5 5 5-5" />
                </svg>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="pb-5 pt-1"
            >
              {item.content}
            </div>
          </div>
        )
      })}
    </div>
  )
}
