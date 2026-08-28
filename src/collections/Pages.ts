import type { CollectionConfig } from 'payload'

import { slugField } from '../fields/slug'

/**
 * Şablon tipleri, eski sitede tespit edilen içerik desenlerine birebir karşılık
 * geliyor. Frontend her tip için ayrı bir render bileşeni kullanıyor.
 */
export const pageTemplates = [
  'content', // düz metin / zengin içerik
  'documentArchive', // yıl bazlı accordion + PDF listesi
  'bioAccordion', // yönetim kurulu / üst yönetim biyografileri
  'dataTable', // komisyon tabloları
  'faq', // sıkça sorulan sorular
  'contact', // harita + iletişim formu
  'gallery', // ödüller
  'sitemap', // otomatik site haritası
  'landing', // ana sayfa
] as const

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: { tr: 'Sayfa', en: 'Page' },
    plural: { tr: 'Sayfalar', en: 'Pages' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'template', 'parent', 'updatedAt'],
    group: { tr: 'İçerik', en: 'Content' },
  },
  access: {
    read: () => true,
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: { tr: 'Başlık', en: 'Title' },
    },
    slugField(),
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'pages',
      label: { tr: 'Üst Sayfa', en: 'Parent Page' },
      admin: {
        position: 'sidebar',
        description: 'Breadcrumb ve yan menü bu zincirden otomatik üretilir.',
      },
      filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
    },
    {
      name: 'template',
      type: 'select',
      required: true,
      defaultValue: 'content',
      options: pageTemplates.map((value) => ({ value, label: value })),
      label: { tr: 'Şablon', en: 'Template' },
      admin: { position: 'sidebar' },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      label: { tr: 'Sıra', en: 'Order' },
      admin: {
        position: 'sidebar',
        description: 'Yan menü ve site haritasındaki sıralama.',
      },
    },
    {
      name: 'archiveCategory',
      type: 'text',
      label: { tr: 'Arşiv Kategorisi', en: 'Archive Category' },
      admin: {
        condition: (_, siblingData) => siblingData?.template === 'documentArchive',
        description: 'Bu sayfada listelenecek doküman grubunun anahtarı.',
      },
    },
    {
      /*
       * Komisyon tablolarının kapsamı dile göre farklı: TR ana sayfası
       * 2009-2026 accordion'unu gösteriyor, EN karşılığında hiç accordion yok,
       * yıl alt sayfaları ise tek bir yıl gösteriyor. Aynı Payload dokümanı iki
       * dilde farklı davrandığı için bu alan localized.
       */
      name: 'commissionScope',
      type: 'select',
      localized: true,
      defaultValue: 'none',
      options: [
        { value: 'none', label: { tr: 'Tablo yok', en: 'No table' } },
        { value: 'all', label: { tr: 'Tüm yıllar (accordion)', en: 'All years (accordion)' } },
        { value: 'single', label: { tr: 'Tek yıl', en: 'Single year' } },
      ],
      admin: {
        condition: (_, siblingData) => siblingData?.template === 'dataTable',
      },
    },
    {
      name: 'commissionYear',
      type: 'number',
      localized: true,
      label: { tr: 'Gösterilecek Yıl', en: 'Year to display' },
      admin: {
        condition: (_, siblingData) =>
          siblingData?.template === 'dataTable' && siblingData?.commissionScope === 'single',
      },
    },
    {
      name: 'bioGroup',
      type: 'select',
      options: [
        { value: 'board', label: { tr: 'Yönetim Kurulu', en: 'Board of Directors' } },
        { value: 'executives', label: { tr: 'Üst Yönetim', en: 'Top Management' } },
      ],
      admin: {
        condition: (_, siblingData) => siblingData?.template === 'bioAccordion',
      },
    },
    {
      /*
       * Ana sayfaya özel alanlar. Eski sitede ana sayfa boştu (yalnızca zorunlu
       * bir modal popup vardı), bu yüzden içerik sıfırdan kuruluyor.
       */
      name: 'hero',
      type: 'group',
      label: { tr: 'Ana Sayfa Hero', en: 'Home Hero' },
      admin: { condition: (_, siblingData) => siblingData?.template === 'landing' },
      fields: [
        { name: 'headline', type: 'text', localized: true, label: { tr: 'Başlık', en: 'Headline' } },
        {
          name: 'subline',
          type: 'textarea',
          localized: true,
          label: { tr: 'Alt Metin', en: 'Subline' },
        },
        {
          name: 'ctaLabel',
          type: 'text',
          localized: true,
          label: { tr: 'Buton Metni', en: 'CTA Label' },
        },
        {
          name: 'ctaPage',
          type: 'relationship',
          relationTo: 'pages',
          label: { tr: 'Buton Hedefi', en: 'CTA Target' },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: { tr: 'Hero Görseli', en: 'Hero Image' },
        },
        {
          name: 'badges',
          type: 'array',
          // Dizi alanlarında localized'ı dizi seviyesinde vermek gerekiyor;
          // yalnızca içindeki alanları işaretlemek diğer dilin değerini eziyor.
          localized: true,
          maxRows: 3,
          label: { tr: 'Dairesel Rakamlar', en: 'Circular Stats' },
          admin: { description: 'Referans sitedeki hero üzerindeki dairesel rozetler.' },
          fields: [
            { name: 'value', type: 'text', required: true },
            { name: 'label', type: 'text', localized: true, required: true },
          ],
        },
      ],
    },
    {
      name: 'shortcuts',
      type: 'array',
      localized: true,
      label: { tr: 'Kısayol Kartları', en: 'Shortcut Cards' },
      admin: { condition: (_, siblingData) => siblingData?.template === 'landing' },
      fields: [
        { name: 'title', type: 'text', localized: true, required: true },
        { name: 'description', type: 'textarea', localized: true },
        { name: 'page', type: 'relationship', relationTo: 'pages', required: true },
      ],
    },
    {
      /*
       * Eski ana sayfa 7 fotoğraflık bir mozaikti (#home_main). Yeni sitede
       * BBVA 60/40 hero'nun sağında aynı kareler duruyor.
       */
      name: 'mosaic',
      type: 'array',
      localized: true,
      maxRows: 7,
      label: { tr: 'Ana Sayfa Mozaiği', en: 'Home Mosaic' },
      admin: { condition: (_, siblingData) => siblingData?.template === 'landing' },
      fields: [
        { name: 'title', type: 'text', localized: true, required: true },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'page',
          type: 'relationship',
          relationTo: 'pages',
          required: true,
        },
      ],
    },
    {
      name: 'content',
      type: 'richText',
      localized: true,
      label: { tr: 'İçerik', en: 'Content' },
      admin: {
        description:
          'Şablona özel bölümlerin üstünde gösterilir. Ör. Sürekli Bilgilendirme Formu sayfasında komisyon accordion’unun üstündeki form içeriği burada durur.',
      },
    },
    {
      /*
       * Lexical iç içe tablo + rowspan/colspan düzenini bozuyor. Eski siteden
       * gelen tablo ağırlıklı sayfalar (sürekli bilgilendirme formu, ortaklık
       * yapısı vb.) temizlenmiş HTML olarak burada tutuluyor ve RichText yerine
       * bu alan render ediliyor.
       */
      name: 'legacyHtml',
      type: 'textarea',
      localized: true,
      label: { tr: 'Tablo HTML', en: 'Table HTML' },
      admin: {
        description:
          'Doluysa içerik bu HTML’den çizilir (Lexical tabloları ezmez). Yalnızca göç script’i yazar.',
      },
    },
    {
      /*
       * Eski sitede tek bir PDF'e link veren sayfalar var (Esas Sözleşme,
       * Organizasyon Şeması, Etik İlkeler vb.). Bunlar için ayrı şablon açmak
       * yerine içerik sayfasına iliştirilebilir doküman listesi veriyoruz.
       */
      name: 'attachments',
      type: 'array',
      label: { tr: 'Ekli Dokümanlar', en: 'Attached Documents' },
      fields: [
        {
          name: 'label',
          type: 'text',
          localized: true,
          label: { tr: 'Etiket', en: 'Label' },
        },
        {
          name: 'document',
          type: 'relationship',
          relationTo: 'documents',
          required: true,
        },
      ],
    },
    {
      name: 'externalUrl',
      type: 'text',
      label: { tr: 'Dış Bağlantı', en: 'External URL' },
      admin: {
        position: 'sidebar',
        description: 'Doldurulursa menüde bu sayfa dış linke yönlendirir (ör. KAP, MKK).',
      },
    },
    {
      name: 'legacyPaths',
      type: 'array',
      label: { tr: 'Eski URL\u2019ler', en: 'Legacy URLs' },
      admin: {
        position: 'sidebar',
        readOnly: true,
        description:
          'Eski sitedeki TR ve EN .aspx yolları. 301 yönlendirmeleri buradan üretilir. Bilinçli olarak localized değil: her iki dilin yolu da aynı dokümana yönlenmeli.',
      },
      fields: [{ name: 'path', type: 'text', required: true }],
    },
    {
      /*
       * Dile özel çeviri durumu. Payload'ın `_status` alanı doküman genelinde
       * olduğu için TR yayında kalırken EN'i taslak yapmak mümkün değil; bu
       * yüzden eksik çevirileri localized bir alanla işaretliyoruz.
       * 'missing' olan diller menüde listelenmiyor ve sayfa bilgilendirme
       * notu gösteriyor.
       */
      name: 'translationStatus',
      type: 'select',
      localized: true,
      defaultValue: 'complete',
      options: [
        { value: 'complete', label: { tr: 'Tamam', en: 'Complete' } },
        { value: 'missing', label: { tr: 'Çeviri Yok', en: 'Not translated' } },
        { value: 'review', label: { tr: 'Kontrol Bekliyor', en: 'Needs review' } },
      ],
      admin: {
        position: 'sidebar',
        description: 'Bu dildeki içeriğin durumu.',
      },
    },
  ],
}
