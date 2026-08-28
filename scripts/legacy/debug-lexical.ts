/**
 * Tek bir sayfanın HTML->Lexical dönüşümünü inceler.
 * Kullanım: tsx --env-file=.env scripts/legacy/debug-lexical.ts <cleanPath>
 */
import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import * as cheerio from 'cheerio'
import fs from 'fs/promises'
import { JSDOM } from 'jsdom'
import { getPayload } from 'payload'

import config from '../../src/payload.config'
import { PARSED_FILE } from './config'
import { normalizePath } from './download-documents'
import type { ParsedPage } from './parse-pages'

async function main() {
  const target = process.argv[2] ?? '/tr/yatirimci-iliskileri'
  const payload = await getPayload({ config })

  const { pages } = JSON.parse(await fs.readFile(PARSED_FILE, 'utf8')) as { pages: ParsedPage[] }
  const page = pages.find((candidate) => candidate.cleanPath === target)
  if (!page?.contentHtml) {
    console.log('İçerik yok:', target)
    process.exit(0)
  }

  const { docs: media } = await payload.find({ collection: 'media', limit: 200 })
  const imageMap = new Map(
    media.map((item) => [item.originalPath ?? '', { id: item.id, url: item.url ?? '' }]),
  )

  const $ = cheerio.load(`<div id="root">${page.contentHtml}</div>`, null, false)
  console.log(`img etiketi sayısı: ${$('img[src]').length}`)

  $('img[src]').each((index, element) => {
    const src = $(element).attr('src') ?? ''
    const key = normalizePath(src)
    console.log(`  [${index}] src=${JSON.stringify(src)}`)
    console.log(`       normalized=${JSON.stringify(key)}`)
    console.log(`       haritada var mı=${imageMap.has(key)}`)
  })

  console.log('\nHaritadaki anahtarlar:')
  for (const key of imageMap.keys()) console.log(`  ${JSON.stringify(key)}`)

  // Öznitelikleri uygula ve dönüştür
  $('img[src]').each((_, element) => {
    const image = $(element)
    const found = imageMap.get(normalizePath(image.attr('src') ?? ''))
    if (!found) return
    image.attr('src', found.url)
    image.attr('data-lexical-upload-id', String(found.id))
    image.attr('data-lexical-upload-relation-to', 'media')
  })

  const rewritten = $('#root').html() ?? ''
  console.log('\nYeniden yazılmış HTML:')
  console.log(rewritten.slice(0, 800))

  const state = convertHTMLToLexical({
    editorConfig: await editorConfigFactory.default({ config: await config }),
    html: rewritten,
    JSDOM,
  })

  const uploads = JSON.stringify(state).match(/"type":"upload"[^}]*}/g)
  console.log('\nUpload node özeti:', uploads?.slice(0, 3) ?? 'yok')
  console.log('\nTam Lexical:')
  console.log(JSON.stringify(state, null, 2).slice(0, 2000))
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
