import { Accordion, type AccordionItem } from '../ui/Accordion'
import { RichText } from '../ui/RichText'
import type { Locale } from '../../lib/i18n'
import type { Person } from '../../payload-types'

/**
 * Yönetim Kurulu / Üst Yönetim biyografileri. Eski sitede jQuery UI accordion
 * ile aynı davranış: başlıkta ad ve ünvan, içeride biyografi.
 */
export function BioAccordion({ people, locale }: { people: Person[]; locale: Locale }) {
  if (people.length === 0) {
    return (
      <p className="py-8 text-body">
        {locale === 'tr' ? 'Kayıt bulunamadı.' : 'No records found.'}
      </p>
    )
  }

  const items: AccordionItem[] = people
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((person) => ({
      id: String(person.id),
      title: person.name,
      meta: person.role,
      content: <RichText data={person.bio} />,
    }))

  return <Accordion items={items} allowMultiple />
}
