import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: { tr: 'Site Ayarları', en: 'Site Settings' },
  admin: {
    group: { tr: 'Ayarlar', en: 'Settings' },
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      required: true,
      localized: true,
      defaultValue: 'Garanti Yatırım Ortaklığı A.Ş.',
      label: { tr: 'Site Adı', en: 'Site Name' },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: { tr: 'Logo', en: 'Logo' },
    },
    {
      name: 'defaultSeo',
      type: 'group',
      label: { tr: 'Varsayılan SEO', en: 'Default SEO' },
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'description', type: 'textarea', localized: true },
        { name: 'image', type: 'upload', relationTo: 'media' },
      ],
    },
    {
      name: 'analytics',
      type: 'group',
      label: { tr: 'Analitik', en: 'Analytics' },
      fields: [
        {
          name: 'ga4Id',
          type: 'text',
          label: 'GA4 Measurement ID',
          admin: {
            description:
              'Google Analytics 4 Measurement ID (G-…). Eski sitedeki UA-2561843-12 geçersiz; yeni GA4 mülkü oluşturulmadan boş bırakın. Çerez onayı alınmadan yüklenmez.',
          },
        },
      ],
    },
    {
      name: 'cookieNotice',
      type: 'group',
      label: { tr: 'Çerez Bildirimi', en: 'Cookie Notice' },
      fields: [
        {
          name: 'text',
          type: 'richText',
          localized: true,
          label: { tr: 'Metin', en: 'Text' },
        },
      ],
    },
  ],
}
