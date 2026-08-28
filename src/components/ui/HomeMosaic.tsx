import Image from 'next/image'
import Link from 'next/link'

import type { Media } from '../../payload-types'

export type MosaicTile = {
  title: string
  href: string
  image: Pick<Media, 'url' | 'alt' | 'width' | 'height'>
}

const AREAS = ['kurumsal', 'sbf', 'ir', 'baskan', 'ik', 'vizyon', 'ulasin'] as const

/**
 * Eski ana sayfadaki 7 karelik fotoğraf mozaiği. Oranlar orijinal
 * #home_main (890×360) yerleşimine yakın.
 */
export function HomeMosaic({ tiles }: { tiles: MosaicTile[] }) {
  if (tiles.length === 0) return null

  return (
    <ul
      className="home-mosaic grid w-full gap-1.5 overflow-hidden min-h-[220px] sm:min-h-[360px] lg:min-h-[420px]"
      style={{
        gridTemplateColumns: '250fr 250fr 250fr 145fr',
        gridTemplateRows: 'minmax(90px, 1.2fr) minmax(56px, 0.75fr) minmax(110px, 1.65fr)',
        gridTemplateAreas: `
          "kurumsal ir baskan vizyon"
          "sbf ir baskan vizyon"
          "sbf ir ik ulasin"
        `,
      }}
    >
      {tiles.map((tile, index) => (
        <li
          key={`${tile.href}-${index}`}
          className="relative overflow-hidden"
          style={{ gridArea: AREAS[index] ?? 'auto' }}
        >
          <Link href={tile.href} className="group absolute inset-0 block">
            {tile.image.url && (
              <Image
                src={tile.image.url}
                alt={tile.image.alt || tile.title}
                fill
                sizes="(max-width: 1024px) 50vw, 400px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority={index < 3}
              />
            )}
            <span className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/15 to-transparent" />
            <span className="absolute inset-x-0 bottom-0 p-2.5 text-[11px] font-medium uppercase tracking-wide text-white sm:p-3 sm:text-sm">
              {tile.title}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
