import Image from 'next/image'
import Link from 'next/link'

import { mediaSrc } from '../../lib/media'
import type { Media } from '../../payload-types'

export type MosaicTile = {
  title: string
  href: string
  image: Pick<Media, 'url' | 'alt' | 'width' | 'height' | 'sizes'>
}

/**
 * Banka ana sayfasındaki kampanya kartları: görsel, 18px başlık, petrol
 * “Detaylı Bilgi” bağı. Köşe yuvarlatılmaz; gölge yalnızca hover’da.
 */
export function HomeMosaic({
  tiles,
  actionLabel,
}: {
  tiles: MosaicTile[]
  actionLabel: string
}) {
  if (tiles.length === 0) return null

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {tiles.map((tile, index) => (
        <li key={`${tile.href}-${index}`}>
          <Link
            href={tile.href}
            className="group flex h-full flex-col bg-surface transition-shadow duration-300 hover:shadow-[0_8px_24px_rgba(6,33,70,0.08)]"
          >
            <span className="relative block aspect-[16/10] overflow-hidden bg-hero">
              {mediaSrc(tile.image, 'card') && (
                <Image
                  src={mediaSrc(tile.image, 'card')!}
                  alt={tile.image.alt || tile.title}
                  fill
                  quality={90}
                  sizes="(max-width: 1024px) 50vw, 400px"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  priority={index < 3}
                />
              )}
            </span>
            <span className="flex flex-1 flex-col px-5 pb-6 pt-5">
              <span className="text-[18px] font-medium leading-snug tracking-[-0.4px] text-heading">
                {tile.title}
              </span>
              <span className="mt-4 inline-flex items-center gap-1.5 text-[15px] font-medium text-teal">
                {actionLabel}
                <Chevron />
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

function Chevron() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path d="M5.5 3.5 11 8l-5.5 4.5" />
    </svg>
  )
}
