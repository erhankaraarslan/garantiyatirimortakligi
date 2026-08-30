import type { Media } from '../payload-types'

type MediaLike = Pick<Media, 'url' | 'sizes'> | null | undefined

/** Kartlar için card (960), kahraman için hero (1920); yoksa orijinal dosya. */
export function mediaSrc(image: MediaLike, size: 'card' | 'hero' = 'card'): string | null {
  if (!image) return null
  return image.sizes?.[size]?.url || image.url || null
}
