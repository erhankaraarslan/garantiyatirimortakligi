import type { CollectionConfig } from 'payload'

/**
 * Sürekli Bilgilendirme Formu'ndaki komisyon tabloları (2009-2026).
 * SPK'nın 13.04.2006 tarih ve 18/452 sayılı kararı uyarınca yayımlanıyor.
 *
 * Eski sitede her yıl 7 dönem kolonu (3 çeyrek + kümülatifler) × 7 metrik satırı
 * içeren statik bir HTML tablosuydu. Dönem kolonlarını sabit alan yapmak yerine
 * array olarak modelliyoruz; bazı yıllarda kolon sayısı farklı.
 */
export const CommissionYears: CollectionConfig = {
  slug: 'commission-years',
  labels: {
    singular: { tr: 'Komisyon Yılı', en: 'Commission Year' },
    plural: { tr: 'Komisyon Bilgileri', en: 'Commission Information' },
  },
  admin: {
    useAsTitle: 'year',
    defaultColumns: ['year', 'intermediary'],
    group: { tr: 'İçerik', en: 'Content' },
  },
  access: {
    read: () => true,
  },
  defaultSort: '-year',
  fields: [
    {
      name: 'year',
      type: 'number',
      required: true,
      unique: true,
      index: true,
      label: { tr: 'Yıl', en: 'Year' },
    },
    {
      name: 'heading',
      type: 'text',
      localized: true,
      label: { tr: 'Tablo Başlığı', en: 'Table Heading' },
      defaultValue:
        'Sermaye Piyasası Kurulu’nun 13.04.2006 tarih ve 18/452 sayılı kararı uyarınca yapılan bilgilendirme',
    },
    {
      name: 'intermediary',
      type: 'text',
      localized: true,
      label: { tr: 'İşlemlere Aracılık Yapan Kurum', en: 'Intermediary Institution' },
    },
    {
      name: 'periods',
      type: 'array',
      required: true,
      label: { tr: 'Dönem Kolonları', en: 'Period Columns' },
      labels: {
        singular: { tr: 'Dönem', en: 'Period' },
        plural: { tr: 'Dönemler', en: 'Periods' },
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          localized: true,
          admin: { description: 'Ör. "Ocak - Mart 2026".' },
        },
      ],
    },
    {
      name: 'rows',
      type: 'array',
      required: true,
      label: { tr: 'Satırlar', en: 'Rows' },
      fields: [
        {
          name: 'metric',
          type: 'text',
          required: true,
          localized: true,
          label: { tr: 'Metrik', en: 'Metric' },
        },
        {
          /*
           * Değerler metin olarak tutuluyor: kaynak veride Türkçe binlik/ondalık
           * ayracı ("91.263.261", "0,119") ve boş hücreler var. Sayıya çevirmek
           * biçimlendirme kaybına yol açardı.
           */
          name: 'values',
          type: 'array',
          label: { tr: 'Değerler', en: 'Values' },
          admin: { description: 'Dönem kolonlarıyla aynı sırada. Boş hücreler boş bırakılır.' },
          fields: [{ name: 'value', type: 'text' }],
        },
      ],
    },
    {
      name: 'notes',
      type: 'richText',
      localized: true,
      label: { tr: 'Notlar', en: 'Notes' },
    },
  ],
}
