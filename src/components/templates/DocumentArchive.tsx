import { Accordion, type AccordionItem } from '../ui/Accordion'
import { DocumentLink } from '../ui/DocumentLink'
import type { Locale } from '../../lib/i18n'
import type { DocumentArchiveItem } from '../../payload-types'

/**
 * Eski sitedeki en yaygın desen: yıl bazlı accordion + PDF listesi.
 * Faaliyet Raporları 19 grup/74 PDF, Finansal Tablolar 29 grup/45 PDF gibi.
 * En yeni yıl varsayılan olarak açık geliyor.
 */
export function DocumentArchive({
  items,
  locale,
}: {
  items: DocumentArchiveItem[]
  locale: Locale
}) {
  if (items.length === 0) {
    return (
      <p className="py-8 text-body">
        {locale === 'tr'
          ? 'Bu bölümde henüz yayımlanmış doküman bulunmuyor.'
          : 'No documents have been published in this section yet.'}
      </p>
    )
  }

  // Yıla göre grupla, yıllar azalan sırada
  const byYear = new Map<number, DocumentArchiveItem[]>()
  for (const item of items) {
    const list = byYear.get(item.year) ?? []
    list.push(item)
    byYear.set(item.year, list)
  }

  const years = [...byYear.keys()].sort((a, b) => b - a)

  const accordionItems: AccordionItem[] = years.map((year) => {
    const group = (byYear.get(year) ?? []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    const documentCount = group.length

    return {
      id: String(year),
      // Eski sitede bazı gruplar "2026 Yılı Faaliyet Raporu" gibi özel başlık taşıyor
      title: localizeGroupLabel(group[0]?.groupLabel, year, locale),
      meta:
        locale === 'tr'
          ? `${documentCount} doküman`
          : `${documentCount} document${documentCount === 1 ? '' : 's'}`,
      content: (
        <ul>
          {group.map((item) => (
            <li key={item.id}>
              <DocumentLink
                document={item.document}
                label={documentLabel(item)}
                locale={locale}
              />
            </li>
          ))}
        </ul>
      ),
    }
  })

  return <Accordion items={accordionItems} defaultOpenId={String(years[0])} allowMultiple />
}

/** TR kaynaklı grup başlıklarını EN sayfada okunaklı hale getirir. */
function localizeGroupLabel(label: string | null | undefined, year: number, locale: Locale): string {
  const fallback = year > 0 ? String(year) : (label ?? '')
  if (locale !== 'en' || !label) return label || fallback

  return label
    .replace(/\s*Yılı Faaliyet Raporu/gi, ' Annual Report')
    .replace(/\s*Yılı Komisyon Bilgileri/gi, ' Commission Information')
    .replace(/\s*Yılı\s*/gi, ' ')
    .replace(/Faaliyet Raporu/gi, 'Annual Report')
    .replace(/Komisyon Bilgileri/gi, 'Commission Information')
    .trim() || fallback
}

function documentLabel(item: DocumentArchiveItem): string {
  const period = item.period?.trim()
  const label = item.label?.trim()
  if (period && label && period !== label) return `${period} — ${label}`
  return period || label || ''
}
