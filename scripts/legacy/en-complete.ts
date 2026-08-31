/**
 * CMS İngilizce paritesini tamamlar: doküman başlıkları, arşiv etiketleri,
 * sayfa ekleri ve yönetici biyografileri.
 *
 * Kullanım: pnpm migrate:en-complete
 */
import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'
import pLimit from 'p-limit'
import { getPayload, type Payload } from 'payload'

import { needsEnglishTranslation, toEnglishLabel } from '../../src/lib/enLabel'
import config from '../../src/payload.config'

const BIO_EN: Record<number, string> = {
  1: `<p>A graduate of TED Ankara College, Dündar Dayı earned a bachelor’s degree in Economics from Middle East Technical University and an LL.M. in Economic Law from Istanbul Bilgi University Faculty of Law. He began his capital markets and banking career in 1995 as an inspector on the Board of Inspectors of T. Garanti Bankası A.Ş., carrying out inspection, review and investigation work at many domestic and international branches and affiliates. In 1999 he was appointed Head of Treasury Operations at the same bank, leading operations for all treasury transactions of the bank’s portfolio as well as valuation and custody operations of investment funds. From 2004 he served for 13 years as founding Chairman of the Board and General Manager of Garanti Hizmet Yönetimi A.Ş., a Garanti Bankası affiliate active in portfolio-management valuation and operations, corporate and retail custody operations and risk management in the capital markets. In 2017 he continued as a Board Member of Osmanlı Yatırım A.Ş. and Osmanlı Portföy A.Ş., overseeing finance, information technology, operations, human resources, accounting, the board of inspectors, internal control, construction and document management.</p>`,
  2: `<p>He graduated from Ankara University Faculty of Political Sciences, Department of Public Finance. He started at Türkiye Garanti Bankası A.Ş. in 1988 as Assistant Inspector and later served as Branch Manager and as an executive in Head Office units. On 30 March 2012 he was elected Independent Board Member of Türkiye Vakıflar Bankası T.A.O., serving on the Credit Committee, the Corporate Governance and Appointment Committee and the Audit Committee, and as Chairman of Vakıf Finans Factoring Hizmetleri A.Ş., Vice Chairman of Vakıf Gayrimenkul Değerleme A.Ş., Vakıf Pazarlama ve Ticaret A.Ş. and Vakıf Portföy Yönetimi A.Ş., and Board Member of Halk Hayat ve Emeklilik A.Ş. On 1 April 2014 he was elected Independent Board Member of T. Halk Bankası A.Ş., serving as Chair of the Corporate Governance and Appointment Committee, Vice Chairman of the Board, Chair of the Audit Committee, Chair of the Sustainability Committee and member of the Credit Committee. He was also a Board Member of Halk Hayat ve Emeklilik A.Ş. and Vice Chairman of Halk Sigorta A.Ş.</p>`,
  3: `<p>Born in 1961, Erhan Tunçay graduated from Saint-Joseph French High School and Boğaziçi University Faculty of Business Administration. Between 1988 and 1999 he served at Garanti Bankası Head Office as unit manager in Marketing, Correspondent Relations and Corporate Credits, was a member of the Bank’s Asset-Liability Committee, and served as Garanti Bankası’s Moscow Representative. From 1999 to 2004 he was joint General Manager of Garanti Sigorta and Garanti Hayat/Emeklilik, leading the restructuring of both companies, the redesign of organisation and processes, the development of new products and strategies and of the IT infrastructure, and the introduction of bancassurance with Garanti Bankası. During that period he was a Board Member of the Insurance Association of Türkiye. From 2005 to 2013 he served as Secretary General of the Association, managing the insurance sector’s relations with government, the bureaucracy, public authorities, all sector stakeholders and international counterparts. He was a member of the Executive Committee of Insurance Europe. During his tenure he also served as Vice Chairman of DASK, Vice Chairman of the Turkish Lloyd Foundation, Board Member of TARSİM, Vice Chairman of the Assurance Account, and Board Member of the Insurance Information Centre, the Insurance Training Centre, the Insurance Arbitration Commission, the Turkish Motor Insurers’ Bureau, the Turkish Insurance Institute Foundation and KALDER. Over some 15 years in senior management and nearly 25 years as a professional he trained in effective leadership, sales and marketing techniques, communication, risk analysis, balance-sheet management, presentation skills and performance management. He has spoken at and chaired many conferences, seminars and meetings. In 2018 he published <em>Fark Yaratan Liderlik</em> (“Leadership That Makes a Difference”), drawing on events from his 25-year professional career. He continues to work in leadership, mentoring, management consulting and personal development (liderlikbecerileri.com / erhantuncay.com).</p>`,
  4: `<p>A graduate of Dokuz Eylül University Faculty of Economics and Administrative Sciences, Selami Ekin began his career as an inspector on Garanti Bankası’s Board of Inspectors and later served as Deputy Head of the Board of Inspectors, Head of Corporate Banking Sector Marketing, Corporate Branch Manager, Regional Manager for Commercial Banking, and Head of Corporate and Commercial Credits. He took part in redesigning the Bank’s credit-systems infrastructure. After the 2001 banking crisis he worked on credit restructuring for many corporate clients. Between 2005 and 2016 he served as General Manager of Garanti Bankası’s financial affiliates Garanti Finansal Kiralama A.Ş., Garanti Faktoring A.Ş. and Garanti Filo Yönetimi A.Ş., which he helped establish.</p>`,
  5: `<p>A graduate of Middle East Technical University in Economics, Aşkın Altıncı started at T. Garanti Bankası A.Ş. in 1994 as Assistant Inspector and later served as Inspector, Investigation Inspector, Deputy Head of the Board of Inspectors and Branch Manager. In 1998 he took part in the Bank’s Business Process Reengineering (BPR) project. As Deputy Head of the Board of Inspectors he led the redesign of audit processes. In 2009 he became Head of Internal Audit and Process Development at Derindere Filo Kiralama A.Ş., then until 2018 served as Operations Director responsible for all after-sales services, administrative affairs and non-vehicle procurement. He later served as Deputy General Manager for operations at Auto King and as Leasing Director at Otomol. He has also been Construction Equipment Leasing Director at MST Satış Pazarlama ve Yatırım A.Ş., part of ASKO Holding.</p>`,
  6: `<p>A graduate of TED Ankara College, Dündar Dayı earned a bachelor’s degree in Economics from Middle East Technical University and an LL.M. in Economic Law from Istanbul Bilgi University Faculty of Law. He began his capital markets and banking career in 1995 as an inspector on the Board of Inspectors of T. Garanti Bankası A.Ş., carrying out inspection, review and investigation work at many domestic and international branches and affiliates. In 1999 he was appointed Head of Treasury Operations at the same bank, leading operations for all treasury transactions of the bank’s portfolio as well as valuation and custody operations of investment funds. From 2004 he served for 13 years as founding Chairman of the Board and General Manager of Garanti Hizmet Yönetimi A.Ş., a Garanti Bankası affiliate active in portfolio-management valuation and operations, corporate and retail custody operations and risk management in the capital markets. In 2017 he continued as a Board Member of Osmanlı Yatırım A.Ş. and Osmanlı Portföy A.Ş., overseeing finance, information technology, operations, human resources, accounting, the board of inspectors, internal control, construction and document management.</p>`,
}

function relId(value: unknown): number | null {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id: unknown }).id
    if (typeof id === 'number') return id
  }
  return null
}

function pickEnglish(existingEn: string | null | undefined, sourceTr: string | null | undefined): string {
  const tr = (sourceTr ?? '').trim()
  const en = (existingEn ?? '').trim()
  if (en && !needsEnglishTranslation(en) && en !== tr) return en
  return toEnglishLabel(tr) || en || tr
}

async function main() {
  const payload = await getPayload({ config })
  const editorConfig = await editorConfigFactory.default({ config: await config })
  const toLexical = (html: string) => convertHTMLToLexical({ editorConfig, html, JSDOM })
  const limit = pLimit(8)

  const docsUpdated = await translateDocuments(payload, limit)
  const archiveUpdated = await translateArchiveItems(payload, limit)
  const attachUpdated = await translateAttachments(payload)
  const peopleUpdated = await translatePeople(payload, toLexical)

  console.log(`Doküman EN başlık: ${docsUpdated}`)
  console.log(`Arşiv EN etiket: ${archiveUpdated}`)
  console.log(`Sayfa ek EN etiket: ${attachUpdated}`)
  console.log(`Yönetici EN biyografi: ${peopleUpdated}`)
  process.exit(0)
}

async function translateDocuments(payload: Payload, limit: ReturnType<typeof pLimit>): Promise<number> {
  const tr = await payload.find({
    collection: 'documents',
    locale: 'tr',
    depth: 0,
    limit: 2000,
    pagination: false,
  })
  const en = await payload.find({
    collection: 'documents',
    locale: 'en',
    depth: 0,
    limit: 2000,
    pagination: false,
    fallbackLocale: false,
  })
  const enById = new Map(en.docs.map((doc) => [doc.id, doc]))
  let updated = 0

  await Promise.all(
    tr.docs.map((doc) =>
      limit(async () => {
        const title = pickEnglish(enById.get(doc.id)?.title, doc.title)
        if (!title) return
        if (title === enById.get(doc.id)?.title) return
        await payload.update({
          collection: 'documents',
          id: doc.id,
          locale: 'en',
          data: { title },
        })
        updated += 1
      }),
    ),
  )
  return updated
}

async function translateArchiveItems(payload: Payload, limit: ReturnType<typeof pLimit>): Promise<number> {
  const tr = await payload.find({
    collection: 'document-archive-items',
    locale: 'tr',
    depth: 0,
    limit: 2000,
    pagination: false,
  })
  const en = await payload.find({
    collection: 'document-archive-items',
    locale: 'en',
    depth: 0,
    limit: 2000,
    pagination: false,
    fallbackLocale: false,
  })
  const enById = new Map(en.docs.map((item) => [item.id, item]))
  let updated = 0

  await Promise.all(
    tr.docs.map((item) =>
      limit(async () => {
        const current = enById.get(item.id)
        const label = pickEnglish(current?.label, item.label)
        const groupLabel = item.groupLabel
          ? pickEnglish(current?.groupLabel, item.groupLabel)
          : current?.groupLabel
        const labelChanged = label && label !== (current?.label ?? '')
        const groupChanged = Boolean(groupLabel) && groupLabel !== (current?.groupLabel ?? '')
        if (!labelChanged && !groupChanged) return
        await payload.update({
          collection: 'document-archive-items',
          id: item.id,
          locale: 'en',
          data: {
            ...(labelChanged ? { label } : {}),
            ...(groupChanged ? { groupLabel } : {}),
          },
        })
        updated += 1
      }),
    ),
  )
  return updated
}

async function translateAttachments(payload: Payload): Promise<number> {
  const pagesTr = await payload.find({
    collection: 'pages',
    locale: 'tr',
    depth: 0,
    limit: 500,
    pagination: false,
  })
  const pagesEn = await payload.find({
    collection: 'pages',
    locale: 'en',
    depth: 0,
    limit: 500,
    pagination: false,
    fallbackLocale: false,
  })
  const enById = new Map(pagesEn.docs.map((page) => [page.id, page]))
  let updated = 0

  for (const page of pagesTr.docs) {
    const attachments = page.attachments ?? []
    if (attachments.length === 0) continue
    const enPage = enById.get(page.id)
    const enAttachments = enPage?.attachments ?? []
    const next = attachments.map((attachment, index) => {
      const document = relId(attachment.document)
      const enLabel = enAttachments[index]?.label
      return {
        id: attachment.id,
        label: pickEnglish(enLabel, attachment.label),
        document,
      }
    })
    const changed = next.some((item, index) => (item.label ?? '') !== (enAttachments[index]?.label ?? ''))
    if (!changed) continue
    await payload.update({
      collection: 'pages',
      id: page.id,
      locale: 'en',
      data: { attachments: next },
    })
    updated += next.length
  }
  return updated
}

async function translatePeople(
  payload: Payload,
  toLexical: (html: string) => ReturnType<typeof convertHTMLToLexical>,
): Promise<number> {
  const people = await payload.find({
    collection: 'people',
    locale: 'tr',
    depth: 0,
    limit: 50,
    pagination: false,
  })
  let updated = 0
  for (const person of people.docs) {
    const html = BIO_EN[person.id]
    if (!html) {
      console.warn(`  EN biyografi yok: #${person.id} ${person.name}`)
      continue
    }
    await payload.update({
      collection: 'people',
      id: person.id,
      locale: 'en',
      data: { bio: toLexical(html) },
    })
    updated += 1
  }
  return updated
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
