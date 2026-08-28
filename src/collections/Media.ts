import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: { tr: 'Görsel', en: 'Image' },
    plural: { tr: 'Görseller', en: 'Images' },
  },
  admin: {
    group: { tr: 'Medya', en: 'Media' },
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
      label: { tr: 'Alternatif Metin', en: 'Alt Text' },
      admin: { description: 'Ekran okuyucular için görsel açıklaması. Erişilebilirlik zorunluluğu.' },
    },
    {
      name: 'originalPath',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Eski sitedeki yol. 301 yönlendirme için korunuyor.',
      },
    },
  ],
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/*'],
    imageSizes: [
      { name: 'thumbnail', width: 400, height: undefined, position: 'centre' },
      { name: 'card', width: 768, height: undefined, position: 'centre' },
      { name: 'hero', width: 1600, height: undefined, position: 'centre' },
    ],
    formatOptions: {
      format: 'webp',
      options: { quality: 82 },
    },
  },
}
