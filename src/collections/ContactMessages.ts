import type { CollectionConfig } from 'payload'

/**
 * İletişim formu gönderimleri.
 *
 * Payload'ın form-builder eklentisi yerine amaca özel bir koleksiyon
 * kullanıyoruz: sitede tek ve sabit alanlı bir form var, eklentinin dinamik
 * form kurgusu bu ihtiyaç için gereksiz karmaşıklık getiriyordu.
 */
export const ContactMessages: CollectionConfig = {
  slug: 'contact-messages',
  labels: {
    singular: { tr: 'İletişim Mesajı', en: 'Contact Message' },
    plural: { tr: 'İletişim Mesajları', en: 'Contact Messages' },
  },
  admin: {
    useAsTitle: 'subjectLine',
    defaultColumns: ['subjectLine', 'email', 'createdAt'],
    group: { tr: 'Formlar', en: 'Forms' },
  },
  access: {
    // Gönderimler yalnızca panelden okunur; herkese açık okuma yok
    read: ({ req }) => Boolean(req.user),
    create: () => true,
    update: () => false,
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'subjectLine',
      type: 'text',
      admin: { readOnly: true, hidden: true },
      hooks: {
        beforeChange: [
          ({ data }) => {
            const name = [data?.firstName, data?.lastName].filter(Boolean).join(' ')
            return name || data?.email || 'İsimsiz'
          },
        ],
      },
    },
    { name: 'firstName', type: 'text', required: true, label: { tr: 'Ad', en: 'First Name' } },
    { name: 'lastName', type: 'text', required: true, label: { tr: 'Soyad', en: 'Last Name' } },
    { name: 'email', type: 'email', required: true, label: { tr: 'E-Posta', en: 'Email' } },
    { name: 'message', type: 'textarea', required: true, label: { tr: 'Mesaj', en: 'Message' } },
    {
      name: 'consent',
      type: 'checkbox',
      required: true,
      label: { tr: 'KVKK Onayı', en: 'Privacy Consent' },
    },
    {
      name: 'locale',
      type: 'text',
      admin: { readOnly: true, description: 'Formun gönderildiği dil.' },
    },
  ],
  timestamps: true,
}
