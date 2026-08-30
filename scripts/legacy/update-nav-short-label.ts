/**
 * Ana menüde uzun “Sürekli Bilgilendirme Formu” etiketini kısaltır.
 *
 * Kullanım: pnpm exec tsx --env-file=.env scripts/legacy/update-nav-short-label.ts
 */
import { getPayload } from 'payload'

import config from '../../src/payload.config'

async function main() {
  const payload = await getPayload({ config })

  const navTr = await payload.findGlobal({ slug: 'navigation', locale: 'tr', depth: 0 })
  await payload.updateGlobal({
    slug: 'navigation',
    locale: 'tr',
    data: {
      mainMenu: (navTr.mainMenu ?? []).map((item) =>
        item.label === 'Sürekli Bilgilendirme Formu' || item.label === 'Bilgilendirme'
          ? { ...item, label: 'Bilgilendirme' }
          : item,
      ),
    },
  })

  const navEn = await payload.findGlobal({ slug: 'navigation', locale: 'en', depth: 0 })
  await payload.updateGlobal({
    slug: 'navigation',
    locale: 'en',
    data: {
      mainMenu: (navEn.mainMenu ?? []).map((item) =>
        item.label === 'Public Disclosure Form' || item.label === 'Disclosure'
          ? { ...item, label: 'Disclosure' }
          : item,
      ),
    },
  })

  console.log('Ana menü etiketi: Bilgilendirme / Disclosure')
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
