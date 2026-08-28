import type { CollectionConfig } from 'payload'

/**
 * Eski sitedeki 432 PDF'in yeni evi. originalPath alanı, /gyo_files/... eski
 * yollarından 301 yönlendirme tablosunu üretmek için kullanılıyor.
 */
export const Documents: CollectionConfig = {
  slug: 'documents',
  labels: {
    singular: { tr: 'Doküman', en: 'Document' },
    plural: { tr: 'Dokümanlar', en: 'Documents' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'filename', 'publishedAt'],
    group: { tr: 'Medya', en: 'Media' },
  },
  access: {
    read: () => true,
  },
  upload: {
    staticDir: 'documents',
    // Arşivde 428 PDF'in yanında 1 docx ve 3 zip bulunuyor
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip',
      'application/x-zip-compressed',
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
      label: { tr: 'Başlık', en: 'Title' },
    },
    {
      name: 'originalPath',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Eski sitedeki yol. 301 yönlendirme için korunuyor, elle değiştirilmemeli.',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: { tr: 'Yayım Tarihi', en: 'Published At' },
      admin: { position: 'sidebar' },
    },
  ],
}
