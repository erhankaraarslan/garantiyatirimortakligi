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
 * Ana sayfa kurumsal kartları: görsel + başlık + ok. Köşe yuvarlatılmaz;
 * gölge yalnızca hover’da. Kartın tamamı bağdır.
 */
export function HomeMosaic({ tiles }: { tiles: MosaicTile[] }) {
  if (tiles.length === 0) return null

  return (
    <ul className="grid gap-4 sm:grid-cols-3 sm:gap-6">
      {tiles.map((tile, index) => (
        <li key={`${tile.href}-${index}`}>
          <Link
            href={tile.href}
            className="group flex h-full flex-col bg-surface transition-shadow duration-300 hover:shadow-[0_8px_24px_rgba(6,33,70,0.08)]"
          >
            <span className="relative block aspect-[2/1] overflow-hidden bg-hero sm:aspect-[16/10]">
              {mediaSrc(tile.image, 'card') && (
                <Image
                  src={mediaSrc(tile.image, 'card')!}
                  alt={tile.image.alt || tile.title}
                  fill
                  quality={90}
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  priority={index < 3}
                />
              )}
            </span>
            <span className="flex items-center justify-between gap-3 px-4 py-4 sm:px-5">
              <span className="text-[17px] font-medium leading-snug tracking-[-0.4px] text-heading sm:text-[18px]">
                {tile.title}
              </span>
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                className="h-3.5 w-3.5 shrink-0 text-brand-navy transition-transform group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
              >
                <path d="M5.5 3.5 11 8l-5.5 4.5" />
              </svg>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
