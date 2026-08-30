/**
 * Üst marka barını Garanti BBVA ailesiyle eşitler (Bonus, Yatırım, Emeklilik, Tami, Kripto).
 *
 * Kullanım: pnpm exec tsx --env-file=.env scripts/legacy/update-affiliate-bar.ts
 */
import { getPayload } from 'payload'

import config from '../../src/payload.config'
import { mapNavigationToEnglish } from './translations'

const AFFILIATE_URLS = [
  { label: 'Garanti BBVA', url: 'https://www.garantibbva.com.tr/' },
  { label: 'Bonus', url: 'https://www.bonus.com.tr/' },
  { label: 'Yatırım', url: 'https://www.garantibbvayatirim.com.tr/' },
  { label: 'Emeklilik', url: 'https://www.garantibbvaemeklilik.com.tr/' },
  { label: 'Tami', url: 'https://www.tami.com.tr/' },
  { label: 'Kripto', url: 'https://www.garantibbvakripto.com.tr/' },
] as const

async function main() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'pages',
    locale: 'tr',
    depth: 0,
    limit: 1,
    where: { template: { equals: 'landing' } },
  })
  const homeId = docs[0]?.id
  if (!homeId) throw new Error('Landing sayfası bulunamadı')

  const affiliateBar = [
    ...AFFILIATE_URLS.map((item) => ({
      label: item.label,
      type: 'external' as const,
      url: item.url,
      isActive: false,
    })),
    {
      label: 'Yatırım Ortaklığı',
      type: 'page' as const,
      page: homeId,
      isActive: true,
    },
  ]

  await payload.updateGlobal({
    slug: 'navigation',
    locale: 'tr',
    data: { affiliateBar },
  })

  const navTr = await payload.findGlobal({ slug: 'navigation', locale: 'tr', depth: 0 })
  await payload.updateGlobal({
    slug: 'navigation',
    locale: 'en',
    data: { affiliateBar: mapNavigationToEnglish(navTr).affiliateBar },
  })

  console.log(
    'affiliateBar:',
    affiliateBar.map((item) => item.label).join(' · '),
  )
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
