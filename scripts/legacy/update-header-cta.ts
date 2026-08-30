/**
 * Header CTA: Yatırımcı İlişkileri yerine KAP şirket özeti.
 *
 * Kullanım: pnpm exec tsx --env-file=.env scripts/legacy/update-header-cta.ts
 */
import { getPayload } from 'payload'

import config from '../../src/payload.config'

const KAP_URL = 'https://kap.org.tr/tr/sirket-bilgileri/ozet/961-garanti-yatirim-ortakligi-a-s'

async function main() {
  const payload = await getPayload({ config })
  const headerCta = {
    label: 'KAP',
    type: 'external' as const,
    url: KAP_URL,
    page: null,
  }

  await payload.updateGlobal({
    slug: 'navigation',
    locale: 'tr',
    data: { headerCta },
  })
  await payload.updateGlobal({
    slug: 'navigation',
    locale: 'en',
    data: { headerCta: { ...headerCta, label: 'KAP' } },
  })

  console.log('headerCta:', headerCta.label, headerCta.url)
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
