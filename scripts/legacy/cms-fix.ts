/**
 * CMS denetiminde kalan içerik açıklarını kapatır (yeniden seed etmeden).
 *
 * Kullanım: pnpm exec tsx --env-file=.env scripts/legacy/cms-fix.ts
 */
import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'
import { getPayload } from 'payload'

import config from '../../src/payload.config'

const EN_SITE_NAME = 'Garanti Investment Trust Inc.'
const FORM_RECIPIENTS = 'yo@gyo.com.tr'

const COOKIE_HTML = {
  tr: '<p>Sitemizin çalışması için zorunlu çerezleri kullanıyoruz. İstatistik amaçlı çerezler yalnızca onayınızla yüklenir.</p>',
  en: '<p>We use strictly necessary cookies to run this site. Analytics cookies are loaded only with your consent.</p>',
}

const MEDIA_ALT: Record<string, { tr: string; en: string }> = {
  'logo-official.webp': {
    tr: 'Garanti Yatırım Ortaklığı A.Ş.',
    en: 'Garanti Investment Trust Inc.',
  },
  'home-ulasin.webp': { tr: 'Bize Ulaşın', en: 'Contact Us' },
  'home-vizyon.webp': { tr: 'Vizyon', en: 'Vision' },
  'home-ik.webp': { tr: 'İnsan Kaynakları', en: 'Human Resources' },
  'home-baskan.webp': { tr: 'Başkanın Mesajı', en: "Chairman's Message" },
  'home-yatirimci.webp': { tr: 'Yatırımcı İlişkileri', en: 'Investor Relations' },
  'home-surekli.webp': { tr: 'Sürekli Bilgilendirme Formu', en: 'Public Disclosure Form' },
  'home-kurumsal.webp': { tr: 'Kurumsal', en: 'Corporate' },
  'gyo4odul02-11.webp': {
    tr: 'Kurumsal Yönetim Endeksi’nde notunu en çok artıran kuruluş ödülü, 2014',
    en: 'Highest increase in Corporate Governance Index score, 2014',
  },
  'VMWare-2366.webp': {
    tr: 'ESQR Quality Achievements Award 2013 — Gold Category',
    en: 'ESQR Quality Achievements Award 2013 — Gold Category',
  },
  'odul02a-11.webp': {
    tr: 'International Platinum Star for Quality Award, 2012',
    en: 'International Platinum Star for Quality Award, 2012',
  },
  'odul01a-11.webp': {
    tr: 'Gold Award for Excellence and Business Prestige, 2011',
    en: 'Gold Award for Excellence and Business Prestige, 2011',
  },
  'gyo_orgen-11.webp': { tr: 'Organizasyon şeması', en: 'Organization chart' },
  'iStock_000006372410_Small-11.webp': { tr: 'Kurumsal görsel', en: 'Corporate imagery' },
  'iStock_000020724134_Small-11.webp': { tr: 'Kurumsal görsel', en: 'Corporate imagery' },
  'iStock_000019297203_Small-11.webp': { tr: 'Kurumsal görsel', en: 'Corporate imagery' },
}

function relId(value: unknown): number | null {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id: unknown }).id
    if (typeof id === 'number') return id
  }
  return null
}

async function main() {
  const payload = await getPayload({ config })
  const editorConfig = await editorConfigFactory.default({ config: await config })
  const toLexical = (html: string) =>
    convertHTMLToLexical({ editorConfig, html, JSDOM })

  const landingTr = await payload.find({
    collection: 'pages',
    locale: 'tr',
    depth: 0,
    limit: 1,
    where: { template: { equals: 'landing' } },
  })
  const landingEn = await payload.find({
    collection: 'pages',
    locale: 'en',
    depth: 0,
    limit: 1,
    where: { template: { equals: 'landing' } },
  })
  const homeTr = landingTr.docs[0]
  const homeEn = landingEn.docs[0]
  if (!homeTr || !homeEn) throw new Error('Landing sayfası bulunamadı')

  const trShortcuts = homeTr.shortcuts ?? []
  const annualReportsPage = relId(trShortcuts[0]?.page)
  if (!annualReportsPage) throw new Error('TR Faaliyet Raporları kısayol sayfası yok')

  const enByPage = new Map(
    (homeEn.shortcuts ?? []).map((item) => [relId(item.page), item] as const),
  )

  const shortcutsEn = [
    {
      title: 'Annual Reports',
      description: 'Quarterly and annual activity reports in full.',
      page: annualReportsPage,
    },
    ...trShortcuts.slice(1).flatMap((item) => {
      const page = relId(item.page)
      if (!page) return []
      const existing = enByPage.get(page)
      return [
        {
          title: existing?.title || item.title,
          description: existing?.description || item.description || undefined,
          page,
        },
      ]
    }),
  ]

  await payload.update({
    collection: 'pages',
    id: homeTr.id,
    locale: 'en',
    data: { shortcuts: shortcutsEn },
  })
  console.log(
    'EN kısayollar:',
    shortcutsEn.map((item) => item.title).join(' · '),
  )

  const review = await payload.find({
    collection: 'pages',
    locale: 'en',
    depth: 0,
    limit: 500,
    pagination: false,
    where: { translationStatus: { equals: 'review' } },
  })
  for (const page of review.docs) {
    await payload.update({
      collection: 'pages',
      id: page.id,
      locale: 'en',
      data: { translationStatus: 'complete' },
    })
  }
  console.log(`EN translationStatus complete: ${review.docs.length} sayfa`)

  const media = await payload.find({
    collection: 'media',
    depth: 0,
    limit: 100,
    pagination: false,
  })
  let mediaUpdated = 0
  for (const doc of media.docs) {
    const alts = doc.filename ? MEDIA_ALT[doc.filename] : undefined
    if (!alts) continue
    await payload.update({
      collection: 'media',
      id: doc.id,
      locale: 'tr',
      data: { alt: alts.tr },
    })
    await payload.update({
      collection: 'media',
      id: doc.id,
      locale: 'en',
      data: { alt: alts.en },
    })
    mediaUpdated += 1
  }
  console.log(`Medya alt TR+EN: ${mediaUpdated}`)

  const heroImage =
    media.docs.find((doc) => doc.filename === 'home-yatirimci.webp')?.id ?? null

  await payload.updateGlobal({
    slug: 'site-settings',
    locale: 'tr',
    data: {
      cookieNotice: { text: toLexical(COOKIE_HTML.tr) },
      defaultSeo: {
        title: 'Garanti Yatırım Ortaklığı A.Ş.',
        description:
          '1996 yılında kurulan Garanti Yatırım Ortaklığı A.Ş. yatırımcı ilişkileri, finansal raporlar ve kurumsal yönetim bilgileri.',
        image: heroImage,
      },
    },
  })

  await payload.updateGlobal({
    slug: 'site-settings',
    locale: 'en',
    data: {
      siteName: EN_SITE_NAME,
      cookieNotice: { text: toLexical(COOKIE_HTML.en) },
      defaultSeo: {
        title: EN_SITE_NAME,
        description:
          'Garanti Investment Trust Inc., established in 1996 — investor relations, financial reports and corporate governance.',
        image: heroImage,
      },
    },
  })
  console.log('Site Settings TR çerez + EN unvan/SEO')

  await payload.updateGlobal({
    slug: 'contact-info',
    locale: 'tr',
    data: { formRecipients: FORM_RECIPIENTS },
  })
  await payload.updateGlobal({
    slug: 'contact-info',
    locale: 'en',
    data: { companyName: EN_SITE_NAME },
  })
  console.log('İletişim: formRecipients + EN companyName')

  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
