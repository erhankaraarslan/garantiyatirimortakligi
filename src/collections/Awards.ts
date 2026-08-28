import type { CollectionConfig } from 'payload'

export const Awards: CollectionConfig = {
  slug: 'awards',
  labels: {
    singular: { tr: 'Ödül', en: 'Award' },
    plural: { tr: 'Ödüller', en: 'Awards' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'issuer', 'year'],
    group: { tr: 'İçerik', en: 'Content' },
  },
  access: {
    read: () => true,
  },
  defaultSort: '-year',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: { tr: 'Ödül Adı', en: 'Award Title' },
    },
    {
      name: 'issuer',
      type: 'text',
      localized: true,
      label: { tr: 'Veren Kurum', en: 'Issuer' },
    },
    {
      name: 'year',
      type: 'number',
      label: { tr: 'Yıl', en: 'Year' },
    },
    {
      name: 'awardedAt',
      type: 'date',
      label: { tr: 'Ödül Tarihi', en: 'Awarded At' },
    },
    {
      name: 'description',
      type: 'richText',
      localized: true,
      label: { tr: 'Açıklama', en: 'Description' },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: { tr: 'Ödül Görseli', en: 'Award Image' },
    },
  ],
}
