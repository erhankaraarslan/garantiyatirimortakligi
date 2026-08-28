/**
 * Eksik TR/EN çevirilerini mevcut Payload kayıtlarına uygular.
 * Tam seed'i tekrar çalıştırmadan pariteyi tamamlar.
 *
 * Kullanım: pnpm migrate:parity
 */
import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'
import { getPayload, type Payload } from 'payload'

import config from '../../src/payload.config'
import {
  EN_PAGE_TRANSLATIONS,
  FAQ_EN,
  mapNavigationToEnglish,
  PRESIDENT_MESSAGE_TR,
} from './translations'

let editorConfigPromise: ReturnType<typeof editorConfigFactory.default> | null = null

async function getEditorConfig() {
  if (!editorConfigPromise) {
    editorConfigPromise = editorConfigFactory.default({ config: await config })
  }
  return editorConfigPromise
}

async function toLexical(html: string | null | undefined) {
  if (!html || html.trim() === '') return undefined
  return convertHTMLToLexical({
    editorConfig: await getEditorConfig(),
    html,
    JSDOM,
  })
}

async function toLexicalRequired(html: string | null | undefined) {
  return (await toLexical(html)) ?? (await toLexical('<p></p>'))!
}

async function main() {
  const payload = await getPayload({ config })

  const pagesUpdated = await translateMissingEnglishPages(payload)
  const presidentUpdated = await translatePresidentMessage(payload)
  const faqsUpdated = await translateFaqs(payload)
  await translateNavigation(payload)
  await translateSiteGlobals(payload)

  console.log(`Sayfa EN çevirisi: ${pagesUpdated}`)
  console.log(`Başkanın Mesajı TR çevirisi: ${presidentUpdated ? 'tamam' : 'atlanadı'}`)
  console.log(`SSS EN çevirisi: ${faqsUpdated}`)
  console.log('\nTamamlandı. Kayıtlar translationStatus=review olarak işaretlendi.')
  process.exit(0)
}

async function translateMissingEnglishPages(payload: Payload): Promise<number> {
  const { docs } = await payload.find({
    collection: 'pages',
    locale: 'en',
    limit: 500,
    pagination: false,
    depth: 0,
    where: { translationStatus: { equals: 'missing' } },
  })

  let updated = 0
  for (const page of docs) {
    const translation = page.slug ? EN_PAGE_TRANSLATIONS[page.slug] : undefined
    if (!translation) {
      console.warn(`  Eşleşme yok, atlandı: ${page.slug} (#${page.id})`)
      continue
    }

    await payload.update({
      collection: 'pages',
      id: page.id,
      locale: 'en',
      data: {
        title: translation.title,
        slug: translation.slug,
        content: translation.contentHtml ? await toLexical(translation.contentHtml) : undefined,
        translationStatus: 'review',
      },
    })
    updated += 1
    console.log(`  EN ${page.slug} -> ${translation.slug}`)
  }
  return updated
}

async function translatePresidentMessage(payload: Payload): Promise<boolean> {
  const { docs } = await payload.find({
    collection: 'pages',
    locale: 'tr',
    limit: 1,
    where: { slug: { equals: PRESIDENT_MESSAGE_TR.slug } },
  })
  const page = docs[0]
  if (!page) return false

  await payload.update({
    collection: 'pages',
    id: page.id,
    locale: 'tr',
    data: {
      title: PRESIDENT_MESSAGE_TR.title,
      slug: PRESIDENT_MESSAGE_TR.slug,
      content: await toLexical(PRESIDENT_MESSAGE_TR.contentHtml),
      translationStatus: 'review',
    },
  })
  return true
}

async function translateFaqs(payload: Payload): Promise<number> {
  const { docs } = await payload.find({
    collection: 'faqs',
    locale: 'tr',
    limit: 200,
    sort: 'order',
  })

  let updated = 0
  for (const [index, faq] of docs.entries()) {
    const translation = FAQ_EN[index]
    if (!translation) continue
    await payload.update({
      collection: 'faqs',
      id: faq.id,
      locale: 'en',
      data: {
        question: translation.question,
        answer: await toLexicalRequired(translation.answerHtml),
      },
    })
    updated += 1
  }
  return updated
}

async function translateNavigation(payload: Payload) {
  const nav = await payload.findGlobal({ slug: 'navigation', locale: 'tr', depth: 0 })
  await payload.updateGlobal({
    slug: 'navigation',
    locale: 'en',
    data: mapNavigationToEnglish(nav),
  })
  console.log('  EN menü etiketleri yazıldı')
}

async function translateSiteGlobals(payload: Payload) {
  const settings = await payload.findGlobal({ slug: 'site-settings', locale: 'tr', depth: 0 })
  await payload.updateGlobal({
    slug: 'site-settings',
    locale: 'en',
    data: {
      siteName: settings.siteName || 'Garanti Yatırım Ortaklığı A.Ş.',
      defaultSeo: {
        title: settings.defaultSeo?.title || 'Garanti Yatırım Ortaklığı A.Ş.',
        description:
          'Garanti Yatırım Ortaklığı A.Ş., established in 1996 — investor relations, financial reports and corporate governance.',
      },
    },
  })

  const contact = await payload.findGlobal({ slug: 'contact-info', locale: 'tr', depth: 0 })
  await payload.updateGlobal({
    slug: 'contact-info',
    locale: 'en',
    data: {
      companyName: contact.companyName || 'Garanti Yatırım Ortaklığı A.Ş.',
      address: contact.address,
    },
  })
  console.log('  EN site ayarları yazıldı')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
