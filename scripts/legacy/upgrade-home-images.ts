/**
 * Ana sayfa mozaiği eski sitede 145–250px. Bu script mevcut Media kayıtlarının
 * dosyasını yüksek çözünürlüklü 16:9 görsellerle değiştirir (ID’ler aynı kalır).
 *
 * Kullanım: pnpm exec tsx --env-file=.env scripts/legacy/upgrade-home-images.ts
 */
import path from 'path'

import { getPayload } from 'payload'

import config from '../../src/payload.config'

const ASSETS = '/Users/kontrolAdmin/.cursor/projects/Users-kontrolAdmin-gyo/assets'

const REPLACEMENTS: { originalPath: string; filename: string; file: string }[] = [
  { originalPath: '/images/home/kurumsal.jpg', filename: 'kurumsal.webp', file: path.join(ASSETS, 'home-kurumsal.png') },
  {
    originalPath: '/images/home/sureklibilgilendirmeformu.jpg',
    filename: 'sureklibilgilendirmeformu.webp',
    file: path.join(ASSETS, 'home-surekli.png'),
  },
  {
    originalPath: '/images/home/yatirimciiliskileri.jpg',
    filename: 'yatirimciiliskileri.webp',
    file: path.join(ASSETS, 'home-yatirimci.png'),
  },
  {
    originalPath: '/images/home/baskaninsunumu.jpg',
    filename: 'baskaninsunumu.webp',
    file: path.join(ASSETS, 'home-baskan.png'),
  },
  {
    originalPath: '/images/home/insankaynaklari.jpg',
    filename: 'insankaynaklari.webp',
    file: path.join(ASSETS, 'home-ik.png'),
  },
  { originalPath: '/images/home/vizyon.jpg', filename: 'vizyon.webp', file: path.join(ASSETS, 'home-vizyon.png') },
  { originalPath: '/images/home/bizeulasin.jpg', filename: 'bizeulasin.webp', file: path.join(ASSETS, 'home-ulasin.png') },
]

async function main() {
  const payload = await getPayload({ config })

  for (const item of REPLACEMENTS) {
    const { docs } = await payload.find({
      collection: 'media',
      limit: 1,
      depth: 0,
      where: {
        or: [
          { originalPath: { equals: item.originalPath } },
          { filename: { equals: item.filename } },
          { filename: { equals: path.basename(item.file).replace(/\.png$/, '.webp') } },
        ],
      },
    })
    const doc = docs[0]
    if (!doc) {
      console.warn(`  bulunamadı: ${item.originalPath}`)
      continue
    }

    const updated = await payload.update({
      collection: 'media',
      id: doc.id,
      data: {},
      filePath: item.file,
      overwriteExistingFiles: true,
    })

    console.log(
      `  ${item.filename} → ${updated.width}×${updated.height} (${Math.round((updated.filesize ?? 0) / 1024)} KB)`,
    )
  }

  console.log('Tamamlandı.')
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
