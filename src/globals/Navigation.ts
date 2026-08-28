import type { Field, GlobalConfig } from 'payload'

/**
 * Menü bağlantısı: ya bir sayfaya referans, ya serbest URL.
 * Eski sitede "Bilgi Toplumu Hizmetleri" MKK e-şirket portalına gidiyor,
 * bu yüzden dış link desteği gerekli.
 */
const linkFields: Field[] = [
  {
    name: 'label',
    type: 'text',
    required: true,
    localized: true,
    label: { tr: 'Etiket', en: 'Label' },
  },
  {
    name: 'type',
    type: 'radio',
    defaultValue: 'page',
    options: [
      { value: 'page', label: { tr: 'Sayfa', en: 'Page' } },
      { value: 'external', label: { tr: 'Dış Bağlantı', en: 'External' } },
    ],
    admin: { layout: 'horizontal' },
  },
  {
    name: 'page',
    type: 'relationship',
    relationTo: 'pages',
    admin: { condition: (_, siblingData) => siblingData?.type === 'page' },
  },
  {
    name: 'url',
    type: 'text',
    admin: { condition: (_, siblingData) => siblingData?.type === 'external' },
  },
]

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: { tr: 'Menüler', en: 'Navigation' },
  admin: {
    group: { tr: 'Ayarlar', en: 'Settings' },
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'affiliateBar',
      type: 'array',
      label: { tr: 'Üst Marka Barı', en: 'Affiliate Bar' },
      admin: {
        description:
          'Garanti BBVA kardeş markaları. Aktif olan (bu site) isActive ile işaretlenir.',
      },
      fields: [
        ...linkFields,
        {
          name: 'isActive',
          type: 'checkbox',
          defaultValue: false,
          label: { tr: 'Bu Site', en: 'This Site' },
        },
      ],
    },
    {
      name: 'mainMenu',
      type: 'array',
      label: { tr: 'Ana Menü', en: 'Main Menu' },
      admin: { description: 'Her kalem mega menüde bir kolon grubu açar.' },
      fields: [
        ...linkFields,
        {
          name: 'columns',
          type: 'array',
          label: { tr: 'Mega Menü Kolonları', en: 'Mega Menu Columns' },
          fields: [
            {
              name: 'heading',
              type: 'text',
              localized: true,
              label: { tr: 'Kolon Başlığı', en: 'Column Heading' },
            },
            {
              name: 'links',
              type: 'array',
              label: { tr: 'Bağlantılar', en: 'Links' },
              fields: linkFields,
            },
          ],
        },
      ],
    },
    {
      name: 'headerUtility',
      type: 'array',
      label: { tr: 'Header Yardımcı Bağlantılar', en: 'Header Utility Links' },
      admin: { description: 'Dil değiştiricinin yanındaki bağlantılar (ör. Bize Ulaşın).' },
      fields: linkFields,
    },
    {
      name: 'headerCta',
      type: 'group',
      label: { tr: 'Header CTA Butonu', en: 'Header CTA Button' },
      fields: linkFields,
    },
    {
      name: 'footerColumns',
      type: 'array',
      label: { tr: 'Footer Kolonları', en: 'Footer Columns' },
      fields: [
        {
          name: 'heading',
          type: 'text',
          localized: true,
          label: { tr: 'Kolon Başlığı', en: 'Column Heading' },
        },
        {
          name: 'links',
          type: 'array',
          label: { tr: 'Bağlantılar', en: 'Links' },
          fields: linkFields,
        },
      ],
    },
    {
      name: 'legalLinks',
      type: 'array',
      label: { tr: 'Yasal Bağlantılar', en: 'Legal Links' },
      admin: { description: 'Footer alt satırı: Gizlilik Politikası, KVKK vb.' },
      fields: linkFields,
    },
    {
      name: 'socialLinks',
      type: 'array',
      label: { tr: 'Sosyal Medya', en: 'Social Media' },
      fields: [
        {
          name: 'platform',
          type: 'select',
          required: true,
          options: [
            { value: 'linkedin', label: 'LinkedIn' },
            { value: 'x', label: 'X' },
            { value: 'instagram', label: 'Instagram' },
            { value: 'facebook', label: 'Facebook' },
            { value: 'youtube', label: 'YouTube' },
          ],
        },
        { name: 'url', type: 'text', required: true },
      ],
    },
  ],
}
