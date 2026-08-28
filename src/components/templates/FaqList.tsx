'use client'

import { useMemo, useState } from 'react'

import { Accordion, type AccordionItem } from '../ui/Accordion'
import { RichText } from '../ui/RichText'
import type { Locale } from '../../lib/i18n'
import type { Faq } from '../../payload-types'

const strings = {
  tr: {
    search: 'Sorularda ara',
    placeholder: 'Aramak istediğiniz kelimeyi yazın',
    empty: 'Aramanızla eşleşen soru bulunamadı.',
    count: (n: number) => `${n} soru`,
  },
  en: {
    search: 'Search questions',
    placeholder: 'Type a keyword to search',
    empty: 'No questions matched your search.',
    count: (n: number) => `${n} question${n === 1 ? '' : 's'}`,
  },
}

/** Eski sitede 15 soruluk düz metin listesiydi; arama + accordion ekliyoruz. */
export function FaqList({ faqs, locale }: { faqs: Faq[]; locale: Locale }) {
  const [query, setQuery] = useState('')
  const t = strings[locale]

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase(locale)
    if (!needle) return faqs
    return faqs.filter((faq) => faq.question.toLocaleLowerCase(locale).includes(needle))
  }, [faqs, query, locale])

  const items: AccordionItem[] = filtered.map((faq) => ({
    id: String(faq.id),
    title: faq.question,
    content: <RichText data={faq.answer} />,
  }))

  return (
    <div>
      <div className="mb-6 max-w-md">
        <label htmlFor="faq-search" className="mb-1 block text-sm font-medium text-ink">
          {t.search}
        </label>
        <input
          id="faq-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t.placeholder}
          className="w-full border border-divider bg-surface px-3 py-2.5 text-base outline-none focus:border-brand-blue"
        />
        <p className="mt-1 text-xs text-muted" aria-live="polite">
          {t.count(filtered.length)}
        </p>
      </div>

      {items.length > 0 ? <Accordion items={items} allowMultiple /> : <p className="text-body">{t.empty}</p>}
    </div>
  )
}
