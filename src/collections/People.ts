import type { CollectionConfig } from 'payload'

/**
 * Yönetim Kurulu ve Üst Yönetim biyografileri. Eski sitede jQuery UI accordion
 * içinde tutuluyordu; tek koleksiyonda `group` ayrımıyla topluyoruz.
 */
export const People: CollectionConfig = {
  slug: 'people',
  labels: {
    singular: { tr: 'Yönetici', en: 'Person' },
    plural: { tr: 'Yönetim', en: 'People' },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'group', 'order'],
    group: { tr: 'İçerik', en: 'Content' },
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: { tr: 'Ad Soyad', en: 'Name' },
    },
    {
      name: 'role',
      type: 'text',
      required: true,
      localized: true,
      label: { tr: 'Ünvan', en: 'Role' },
      admin: { description: 'Ör. "Yönetim Kurulu Başkanı", "Bağımsız Yönetim Kurulu Üyesi".' },
    },
    {
      name: 'group',
      type: 'select',
      required: true,
      options: [
        { value: 'board', label: { tr: 'Yönetim Kurulu', en: 'Board of Directors' } },
        { value: 'executives', label: { tr: 'Üst Yönetim', en: 'Top Management' } },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'bio',
      type: 'richText',
      localized: true,
      label: { tr: 'Biyografi', en: 'Biography' },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: { tr: 'Fotoğraf', en: 'Photo' },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
  ],
}
