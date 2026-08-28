import type { GlobalConfig } from 'payload'

export const ContactInfo: GlobalConfig = {
  slug: 'contact-info',
  label: { tr: 'İletişim Bilgileri', en: 'Contact Information' },
  admin: {
    group: { tr: 'Ayarlar', en: 'Settings' },
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'companyName',
      type: 'text',
      defaultValue: 'Garanti Yatırım Ortaklığı A.Ş.',
      localized: true,
    },
    {
      name: 'address',
      type: 'textarea',
      localized: true,
      defaultValue:
        'Maslak Mah. Atatürk Oto Sanayi, 55. Sokak, 42 Maslak No:2 A Blok D:270 (A12/7) 34485 Sarıyer - İstanbul',
      label: { tr: 'Adres', en: 'Address' },
    },
    {
      name: 'phone',
      type: 'text',
      defaultValue: '0212 335 30 95 - 97',
      label: { tr: 'Telefon', en: 'Phone' },
    },
    {
      name: 'fax',
      type: 'text',
      defaultValue: '+90 212 335 32 30',
      label: { tr: 'Faks', en: 'Fax' },
    },
    {
      name: 'email',
      type: 'email',
      defaultValue: 'yo@gyo.com.tr',
      label: { tr: 'E-Posta', en: 'Email' },
    },
    {
      name: 'kepAddress',
      type: 'text',
      defaultValue: 'garantiyatirimas@hs01.kep.tr',
      label: { tr: 'KEP Adresi', en: 'KEP Address' },
    },
    {
      name: 'coordinates',
      type: 'group',
      label: { tr: 'Harita Koordinatları', en: 'Map Coordinates' },
      fields: [
        { name: 'lat', type: 'number', defaultValue: 41.113105 },
        { name: 'lng', type: 'number', defaultValue: 29.020057 },
        { name: 'zoom', type: 'number', defaultValue: 15 },
      ],
    },
    {
      name: 'formRecipients',
      type: 'text',
      label: { tr: 'Form Alıcıları', en: 'Form Recipients' },
      admin: {
        description: 'İletişim formu gönderimlerinin iletileceği e-posta adresleri (virgülle ayrılmış).',
      },
    },
  ],
}
