import type { CollectionConfig } from 'payload'

/**
 * Eski sitedeki yıl bazlı accordion + PDF listelerinin veri karşılığı.
 * Örnek: Faaliyet Raporları sayfasında 19 yıl grubu, 74 PDF.
 * Frontend bu kayıtları archiveCategory + year ile gruplayarak render ediyor.
 */
export const DocumentArchiveItems: CollectionConfig = {
  slug: 'document-archive-items',
  labels: {
    singular: { tr: 'Arşiv Kaydı', en: 'Archive Item' },
    plural: { tr: 'Doküman Arşivi', en: 'Document Archive' },
  },
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'category', 'year', 'period'],
    group: { tr: 'İçerik', en: 'Content' },
    listSearchableFields: ['label', 'category'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'category',
      type: 'text',
      required: true,
      index: true,
      label: { tr: 'Kategori', en: 'Category' },
      admin: {
        description: 'Sayfanın archiveCategory değeriyle eşleşir (ör. faaliyet-raporlari).',
      },
    },
    {
      /*
       * Hangi dilin arşivine ait olduğu. Eski sitede TR ve EN arşiv sayfaları
       * FARKLI doküman setleri listeliyor: İngilizce sayfalar İngilizce
       * hazırlanmış ve genellikle daha az sayıda dosyaya link veriyor
       * (ör. Genel Kurul İlanları TR'de 19, EN'de 6 dosya). Aynı listeyi iki
       * dilde göstermek kaynağa aykırı olurdu.
       */
      name: 'language',
      type: 'select',
      required: true,
      index: true,
      defaultValue: 'tr',
      options: [
        { value: 'tr', label: { tr: 'Türkçe arşiv', en: 'Turkish archive' } },
        { value: 'en', label: { tr: 'İngilizce arşiv', en: 'English archive' } },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'year',
      type: 'number',
      required: true,
      index: true,
      label: { tr: 'Yıl', en: 'Year' },
    },
    {
      name: 'groupLabel',
      type: 'text',
      localized: true,
      label: { tr: 'Grup Başlığı', en: 'Group Heading' },
      admin: {
        description:
          'Accordion başlığı. Boşsa yıl kullanılır (eski sitede "2026 Yılı Faaliyet Raporu" gibi başlıklar var).',
      },
    },
    {
      name: 'period',
      type: 'text',
      label: { tr: 'Dönem', en: 'Period' },
      admin: { description: 'Ör. "1. Çeyrek", "06 - 25", "Yıllık".' },
    },
    {
      name: 'label',
      type: 'text',
      required: true,
      localized: true,
      label: { tr: 'Bağlantı Metni', en: 'Link Label' },
    },
    {
      name: 'document',
      type: 'relationship',
      relationTo: 'documents',
      required: true,
      label: { tr: 'Doküman', en: 'Document' },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
  ],
}
