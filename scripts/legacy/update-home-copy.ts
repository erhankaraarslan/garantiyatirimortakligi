/**
 * Ana sayfa yazım düzeltmeleri: SSS ilk soru, kısayol “döküman”.
 *
 * Kullanım: pnpm exec tsx --env-file=.env scripts/legacy/update-home-copy.ts
 */
import { getPayload } from 'payload'

import config from '../../src/payload.config'

const FAQ_TR = 'Garanti Yatırım Ortaklığı A.Ş. ne zaman kurulmuştur?'
const FAQ_EN = 'When was Garanti Investment Trust Inc. established?'

function looksLikeCombinedFoundingQuestion(question: string, locale: 'tr' | 'en'): boolean {
  const q = question.replace(/\s+/g, ' ').trim()
  if (locale === 'tr') {
    return /ne zaman kurulmuştur/i.test(q) && /ama[cç]ı nedir/i.test(q)
  }
  return /when was/i.test(q) && /purpose/i.test(q)
}

async function main() {
  const payload = await getPayload({ config })

  for (const locale of ['tr', 'en'] as const) {
    const { docs } = await payload.find({
      collection: 'faqs',
      locale,
      depth: 0,
      limit: 50,
      sort: 'order',
    })
    for (const faq of docs) {
      if (!looksLikeCombinedFoundingQuestion(faq.question, locale)) continue
      await payload.update({
        collection: 'faqs',
        id: faq.id,
        locale,
        data: { question: locale === 'tr' ? FAQ_TR : FAQ_EN },
      })
      console.log(`  SSS ${locale} #${faq.id}: ${locale === 'tr' ? FAQ_TR : FAQ_EN}`)
    }
  }

  const { docs: homes } = await payload.find({
    collection: 'pages',
    locale: 'tr',
    depth: 0,
    limit: 1,
    where: { template: { equals: 'landing' } },
  })
  const home = homes[0]
  if (home) {
    const shortcuts = (home.shortcuts ?? []).map((item) => ({
      id: item.id,
      title: item.title,
      description: (item.description ?? '').replaceAll('döküman', 'doküman'),
      page: typeof item.page === 'object' && item.page ? item.page.id : item.page,
    }))
    const changed = shortcuts.some(
      (item, index) => item.description !== (home.shortcuts?.[index]?.description ?? ''),
    )
    if (changed) {
      await payload.update({
        collection: 'pages',
        id: home.id,
        locale: 'tr',
        data: { shortcuts },
      })
      console.log('  Kısayol: döküman → doküman')
    }
  }

  console.log('Ana sayfa yazımı güncellendi')
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
