import type { Document, DocumentArchiveItem } from '../payload-types'
import type { Locale } from './i18n'

const CATEGORY_LABEL: Record<string, Record<Locale, string>> = {
  'faaliyet-raporlari': { tr: 'Faaliyet raporu', en: 'Activity report' },
  'finansal-tablolar': { tr: 'Finansal tablolar', en: 'Financial statements' },
  'bagimsiz-denetim-raporlari': { tr: 'Bağımsız denetim raporu', en: 'Independent audit report' },
  'performans-sunus-raporlari': { tr: 'Performans sunuş raporu', en: 'Performance presentation' },
  'yonetim-kurulu-ic-yonerge': { tr: 'Yönetim kurulu iç yönerge', en: 'Board internal directive' },
}

const MONTHS_TR = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
]

export type HomeDocument = {
  id: number
  title: string
  category: string | null
  href: string
  publishedAt: string | null
  filesize: number | null
}

function archiveDocumentId(item: DocumentArchiveItem): number | null {
  if (typeof item.document === 'number') return item.document
  if (item.document && typeof item.document === 'object') return item.document.id
  return null
}

function formatPeriod(period: string, locale: Locale): string {
  const mmyy = period.match(/^(\d{2})\s*-\s*(\d{2})$/)
  if (mmyy) {
    const month = Number(mmyy[1])
    const year = 2000 + Number(mmyy[2])
    if (month >= 1 && month <= 12) {
      return locale === 'tr'
        ? `${MONTHS_TR[month - 1]} ${year}`
        : new Date(year, month - 1, 1).toLocaleDateString('en-GB', {
            month: 'long',
            year: 'numeric',
          })
    }
  }

  const dottedDates = period.match(/\d{1,2}\.\d{1,2}\.\d{4}/g)
  if (dottedDates && dottedDates.length > 0) {
    const last = dottedDates[dottedDates.length - 1]
    const [day, month, year] = last.split('.')
    return `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year}`
  }

  const compact = period.replace(/\s+-\s+/g, ' · ').trim()
  if (compact.length > 48) {
    const iso = compact.match(/\d{4}-\d{2}-\d{2}/)
    if (iso) return iso[0]
  }
  return compact
}

function displayTitle(
  document: Document,
  item: DocumentArchiveItem | undefined,
  locale: Locale,
): string {
  if (item?.category) {
    const category = CATEGORY_LABEL[item.category]?.[locale]
    const period = item.period?.trim() ? formatPeriod(item.period.trim(), locale) : ''
    if (category && period && category.toLocaleLowerCase(locale) !== period.toLocaleLowerCase(locale)) {
      return `${category} · ${period}`
    }
    if (category) return category
    if (period) return period
    if (item.label?.trim()) return item.label.trim()
  }

  const raw = (document.title || document.filename || '').trim()
  return raw.replace(/\s+-\s+/g, ' · ')
}

export function decorateHomeDocuments(
  documents: Document[],
  archiveItems: DocumentArchiveItem[],
  locale: Locale,
): HomeDocument[] {
  const byDocument = new Map<number, DocumentArchiveItem>()
  for (const item of archiveItems) {
    const id = archiveDocumentId(item)
    if (id != null && !byDocument.has(id)) byDocument.set(id, item)
  }

  return documents.flatMap((document) => {
    if (!document.url) return []
    return [
      {
        id: document.id,
        title: displayTitle(document, byDocument.get(document.id), locale),
        category: byDocument.get(document.id)?.category ?? null,
        href: document.url,
        publishedAt: document.publishedAt ?? null,
        filesize: document.filesize ?? null,
      },
    ]
  })
}

export function pickLatestActivityReport(documents: HomeDocument[]): HomeDocument | null {
  return documents.find((document) => document.category === 'faaliyet-raporlari') ?? documents[0] ?? null
}
