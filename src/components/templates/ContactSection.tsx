import type { Locale } from '../../lib/i18n'
import type { ContactInfo } from '../../payload-types'
import { ContactForm } from './ContactForm'

const strings = {
  tr: {
    address: 'Adres',
    phone: 'Telefon',
    fax: 'Faks',
    email: 'E-Posta',
    kep: 'KEP Adresi',
    map: 'Harita',
    directions: 'Yol tarifi al',
    formTitle: 'İletişim Formu',
    mapLabel: 'Ofis konumu haritası',
  },
  en: {
    address: 'Address',
    phone: 'Phone',
    fax: 'Fax',
    email: 'Email',
    kep: 'Registered e-mail (KEP)',
    map: 'Map',
    directions: 'Get directions',
    formTitle: 'Contact Form',
    mapLabel: 'Office location map',
  },
}

export function ContactSection({
  contact,
  locale,
}: {
  contact: ContactInfo
  locale: Locale
}) {
  const t = strings[locale]
  const lat = contact.coordinates?.lat ?? 41.113105
  const lng = contact.coordinates?.lng ?? 29.020057

  /*
   * Harita için Google Maps yerine OpenStreetMap gömme kullanıyoruz: eski
   * sitedeki Google Maps API anahtarı kaynak kodda açıkta duruyordu ve
   * kısıtlaması yoktu. OSM gömmesi anahtar gerektirmiyor ve ek JavaScript
   * yüklemiyor.
   */
  const delta = 0.006
  const bbox = [lng - delta, lat - delta / 2, lng + delta, lat + delta / 2].join('%2C')
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        <dl className="space-y-4 text-base">
          {contact.address && (
            <Row label={t.address}>
              <span className="whitespace-pre-line">{contact.address}</span>
            </Row>
          )}
          {contact.phone && (
            <Row label={t.phone}>
              <a href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`} className="hover:underline">
                {contact.phone}
              </a>
            </Row>
          )}
          {contact.fax && <Row label={t.fax}>{contact.fax}</Row>}
          {contact.email && (
            <Row label={t.email}>
              <a href={`mailto:${contact.email}`} className="text-brand-blue hover:underline">
                {contact.email}
              </a>
            </Row>
          )}
          {contact.kepAddress && <Row label={t.kep}>{contact.kepAddress}</Row>}
        </dl>

        <div className="mt-8">
          <h2 className="text-h3 font-medium text-ink">{t.map}</h2>
          <div className="mt-3 border border-divider">
            <iframe
              title={t.mapLabel}
              src={embedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[320px] w-full"
            />
          </div>
          <a
            href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm text-brand-blue hover:underline"
          >
            {t.directions}
          </a>
        </div>
      </div>

      <div>
        <h2 className="text-h2 text-ink">{t.formTitle}</h2>
        <div className="mt-6">
          <ContactForm locale={locale} />
        </div>
      </div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 text-ink">{children}</dd>
    </div>
  )
}
