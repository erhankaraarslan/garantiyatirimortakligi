import type { Field } from 'payload'

import { slugify } from '../lib/utils'

/**
 * Slug alanı. Boş bırakılırsa başlıktan üretilir. Localized değil: TR ve EN
 * URL'leri farklı olduğu için her dilde ayrı slug gerekiyor.
 */
export const slugField = (from = 'title'): Field => ({
  name: 'slug',
  type: 'text',
  required: true,
  index: true,
  localized: true,
  admin: {
    position: 'sidebar',
    description: 'URL parçası. Boş bırakılırsa başlıktan üretilir.',
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (typeof value === 'string' && value.length > 0) return slugify(value)
        const source = (data as Record<string, unknown> | undefined)?.[from]
        if (typeof source === 'string' && source.length > 0) return slugify(source)
        return value
      },
    ],
  },
})
