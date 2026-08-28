import type { CollectionConfig } from 'payload'

export const Faqs: CollectionConfig = {
  slug: 'faqs',
  labels: {
    singular: { tr: 'Soru', en: 'Question' },
    plural: { tr: 'Sıkça Sorulan Sorular', en: 'FAQs' },
  },
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['question', 'order'],
    group: { tr: 'İçerik', en: 'Content' },
  },
  access: {
    read: () => true,
  },
  defaultSort: 'order',
  fields: [
    {
      name: 'question',
      type: 'text',
      required: true,
      localized: true,
      label: { tr: 'Soru', en: 'Question' },
    },
    {
      name: 'answer',
      type: 'richText',
      required: true,
      localized: true,
      label: { tr: 'Cevap', en: 'Answer' },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
  ],
}
