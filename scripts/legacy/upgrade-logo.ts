/**
 * Logo dosyasını yüksek çözünürlüklü PNG ile değiştirir (Media ID aynı kalır).
 *
 * Kullanım: pnpm exec tsx --env-file=.env scripts/legacy/upgrade-logo.ts
 */
import { getPayload } from 'payload'

import config from '../../src/payload.config'

const FILE =
  '/Users/kontrolAdmin/.cursor/projects/Users-kontrolAdmin-gyo/assets/logo-official.png'

async function main() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'media',
    limit: 1,
    depth: 0,
    where: {
      or: [
        { originalPath: { equals: '/images/logo.jpg' } },
        { filename: { equals: 'logo.webp' } },
        { filename: { equals: 'logo.jpg' } },
      ],
    },
  })
  const doc = docs[0]
  if (!doc) throw new Error('Logo Media kaydı bulunamadı')

  const updated = await payload.update({
    collection: 'media',
    id: doc.id,
    data: {},
    filePath: FILE,
    overwriteExistingFiles: true,
  })

  console.log(`logo → ${updated.filename} ${updated.width}×${updated.height}`)
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
