import { Accordion, type AccordionItem } from '../ui/Accordion'
import { RichText } from '../ui/RichText'
import type { Locale } from '../../lib/i18n'
import type { CommissionYear } from '../../payload-types'

/**
 * Sürekli Bilgilendirme Formu komisyon tabloları (2009-2026).
 * Eski sitede 80 adet iç içe HTML tablosuydu; mobilde tamamen okunamıyordu.
 * Burada yatay kaydırma + sabit ilk kolon ile okunabilir hale getiriyoruz.
 */
export function CommissionTables({
  years,
  locale,
}: {
  years: CommissionYear[]
  locale: Locale
}) {
  if (years.length === 0) return null

  const items: AccordionItem[] = years
    .slice()
    .sort((a, b) => b.year - a.year)
    .map((entry) => ({
      id: String(entry.year),
      title:
        locale === 'tr' ? `${entry.year} Yılı Komisyon Bilgileri` : `${entry.year} Commission Information`,
      content: <CommissionTable entry={entry} locale={locale} />,
    }))

  return <Accordion items={items} defaultOpenId={String(items[0]?.id)} allowMultiple />
}

function CommissionTable({ entry, locale }: { entry: CommissionYear; locale: Locale }) {
  const periods = entry.periods ?? []

  return (
    <div>
      {entry.heading && <p className="mb-4 text-sm font-medium text-ink">{entry.heading}</p>}

      {entry.intermediary && (
        <p className="mb-4 text-sm text-body">
          <span className="font-medium text-ink">
            {locale === 'tr' ? 'İşlemlere Aracılık Yapan Kurum' : 'Intermediary Institution'}:
          </span>{' '}
          {entry.intermediary}
        </p>
      )}

      {/*
       * Mobilde tablo yatay kaydırılıyor; ilk kolon sticky kalarak hangi
       * metriğe bakıldığı kaybolmuyor.
       */}
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <caption className="sr-only">
            {locale === 'tr'
              ? `${entry.year} yılı ödenen komisyon tutarları`
              : `Commissions paid during ${entry.year}`}
          </caption>
          <thead>
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-10 border border-divider bg-surface-alt p-2 text-left font-medium text-ink"
              >
                <span className="sr-only">{locale === 'tr' ? 'Kalem' : 'Item'}</span>
              </th>
              {periods.map((period, index) => (
                <th
                  key={period.id ?? index}
                  scope="col"
                  className="border border-divider bg-surface-alt p-2 text-right font-medium text-ink"
                >
                  {period.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(entry.rows ?? []).map((row, rowIndex) => (
              <tr key={row.id ?? rowIndex} className={rowIndex % 2 === 1 ? 'bg-surface-alt/50' : ''}>
                <th
                  scope="row"
                  className={`sticky left-0 z-10 border border-divider p-2 text-left font-normal text-ink ${
                    rowIndex % 2 === 1 ? 'bg-[#fbfbfc]' : 'bg-surface'
                  }`}
                >
                  {row.metric}
                </th>
                {periods.map((_, columnIndex) => (
                  <td
                    key={columnIndex}
                    className="border border-divider p-2 text-right tabular-nums text-body"
                  >
                    {row.values?.[columnIndex]?.value ?? ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {entry.notes && <RichText data={entry.notes} className="mt-4 text-sm" />}
    </div>
  )
}
