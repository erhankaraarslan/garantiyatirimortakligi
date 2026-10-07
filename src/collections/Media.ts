import type { CollectionConfig } from 'payload'

import { uploadsDir } from '../lib/uploadsRoot'

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
    staticDir: uploadsDir('media'),
    mimeTypes: ['image/*'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: undefined,
        position: 'centre',
        formatOptions: { format: 'webp', options: { quality: 85 } },
      },
      {
        name: 'card',
        width: 960,
        height: undefined,
        position: 'centre',
        formatOptions: { format: 'webp', options: { quality: 90 } },
      },
      {
        name: 'hero',
        width: 1920,
        height: undefined,
        position: 'centre',
        formatOptions: { format: 'webp', options: { quality: 90 } },
      },
    ],
    formatOptions: {
      format: 'webp',
      options: { quality: 90 },
    },
  },
}
