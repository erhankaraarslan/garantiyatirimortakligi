import Image from 'next/image'

import type { Locale } from '../../lib/i18n'
import type { Award } from '../../payload-types'
import { RichText } from '../ui/RichText'

/** Ödüller sayfası. Eski sitede 4 görsel yan yana dizilmiş düz bir <p> idi. */
export function AwardsGallery({ awards, locale }: { awards: Award[]; locale: Locale }) {
  if (awards.length === 0) return null

  return (
    <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {awards.map((award) => {
        const image = typeof award.image === 'object' ? award.image : null

        return (
          <li key={award.id} className="flex flex-col border border-divider bg-surface p-5">
            {image?.url && (
              <div className="mb-4 flex h-28 items-center justify-start">
                <Image
                  src={image.url}
                  alt={image.alt ?? award.title}
                  width={image.width ?? 160}
                  height={image.height ?? 112}
                  className="h-full w-auto object-contain"
                />
              </div>
            )}
            <p className="text-h3 font-medium text-ink">{award.title}</p>
            {award.issuer && <p className="mt-1 text-sm text-body">{award.issuer}</p>}
            {award.year && (
              <p className="mt-0.5 text-xs text-muted">
                {locale === 'tr' ? `${award.year} yılı` : award.year}
              </p>
            )}
            {award.description && <RichText data={award.description} className="mt-3 text-sm" />}
          </li>
        )
      })}
    </ul>
  )
}
