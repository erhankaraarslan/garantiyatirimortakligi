'use client'

import type { Faq } from '../../payload-types'
import { Accordion } from './Accordion'
import { RichText } from './RichText'

export function HomeFaqs({
  items,
}: {
  items: { id: string; question: string; answer: Faq['answer'] }[]
}) {
  if (items.length === 0) return null

  return (
    <Accordion
      defaultOpenId={items[0]?.id}
      items={items.map((item) => ({
        id: item.id,
        title: item.question,
        content: <RichText data={item.answer} />,
      }))}
    />
  )
}
