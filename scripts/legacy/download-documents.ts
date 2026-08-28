/**
 * Eski sitedeki 432 dokümanı (~268 MB) yerel diske indirir ve bir indeks üretir.
 *
 * Dosya adları eski sistemde timestamp + Türkçe karakter içeriyor
 * (ör. "20268316375310_denetim görüşü.pdf"). İçerik hash'i ile tekilleştirip
 * URL-güvenli yeni adlar üretiyoruz; eski yol `originalPath` olarak korunuyor
 * ki 301 yönlendirmeleri kurulabilsin.
 *
 * Kullanım: pnpm migrate:docs
 */
import crypto from 'crypto'
import fs from 'fs/promises'
import path from 'path'
import pLimit from 'p-limit'

import {
  DOCUMENTS_DIR,
  DOCUMENT_INDEX_FILE,
  KNOWN_MISSING_DOCUMENTS,
  PARSED_FILE,
  USER_AGENT,
  encodeUrl,
} from './config'
import type { ParsedPage } from './parse-pages'
import { slugify } from '../../src/lib/utils'

export type DocumentIndexEntry = {
  originalPath: string
  filename: string
  bytes: number
  sha256: string
  labels: string[]
}

export type DocumentIndex = {
  downloadedAt: string
  entries: DocumentIndexEntry[]
  missing: { originalPath: string; reason: string }[]
  /** Java serileştirme sarmalından çıkarılan dosyalar. */
  unwrapped: string[]
  /** Uzantısına uygun imzaya sahip olmayan, taşınmayan dosyalar. */
  corrupt: { originalPath: string; reason: string }[]
}

const JAVA_STREAM_MAGIC = Buffer.from([0xac, 0xed, 0x00, 0x05])

/**
 * Eski sitedeki 23 doküman, ham dosya yerine Java serileştirilmiş bir `byte[]`
 * olarak sunuluyor: 0xACED0005 başlığı + sınıf tanımı + 4 baytlık uzunluk +
 * gerçek dosya. Bunlar arasında 2025-2026 faaliyet raporları ve finansal
 * tablolar da var, yani canlı sitede şu anda bozuk indiriliyorlar.
 *
 * Sarmalı burada açıyoruz. Beyan edilen uzunluk kalan bayt sayısıyla
 * uyuşmazsa dokunmuyoruz; sessizce yanlış veri üretmek istemiyoruz.
 */
export function unwrapJavaSerializedBytes(buffer: Buffer): { data: Buffer; unwrapped: boolean } {
  if (!buffer.subarray(0, 4).equals(JAVA_STREAM_MAGIC)) return { data: buffer, unwrapped: false }

  // Sınıf tanımının sonu: TC_ENDBLOCKDATA (0x78) + TC_NULL (0x70), ardından uzunluk
  const terminator = buffer.indexOf(Buffer.from([0x78, 0x70]), 4)
  if (terminator === -1) return { data: buffer, unwrapped: false }

  const lengthOffset = terminator + 2
  if (lengthOffset + 4 > buffer.length) return { data: buffer, unwrapped: false }

  const declaredLength = buffer.readUInt32BE(lengthOffset)
  const payload = buffer.subarray(lengthOffset + 4)

  if (declaredLength !== payload.length) return { data: buffer, unwrapped: false }
  return { data: payload, unwrapped: true }
}

const SIGNATURES: Record<string, Buffer[]> = {
  pdf: [Buffer.from('%PDF')],
  zip: [Buffer.from('PK')],
  docx: [Buffer.from('PK')],
  xlsx: [Buffer.from('PK')],
  doc: [Buffer.from([0xd0, 0xcf, 0x11, 0xe0])],
}

/** Dosyanın uzantısına uygun imzayla başlayıp başlamadığını doğrular. */
export function hasValidSignature(buffer: Buffer, extension: string): boolean {
  const expected = SIGNATURES[extension.toLowerCase()]
  if (!expected) return true
  return expected.some((signature) => buffer.subarray(0, signature.length).equals(signature))
}

/** "/gyo_files/2026430104741386_faaliyet rap.pdf" -> "2026-faaliyet-rap.pdf" */
function buildFilename(originalPath: string, hash: string): string {
  const base = decodeURIComponent(originalPath.split('/').pop() ?? 'dokuman.pdf')
  const extension = path.extname(base).toLowerCase() || '.pdf'
  const stem = base.slice(0, base.length - path.extname(base).length)

  // Baştaki timestamp'i at, kalan anlamlı adı slug'a çevir
  const withoutTimestamp = stem.replace(/^\d{8,}_?/, '')
  const slug = slugify(withoutTimestamp) || 'dokuman'

  // Aynı ada sahip farklı dosyalar için hash öneki
  return `${slug}-${hash.slice(0, 8)}${extension}`
}

async function main() {
  const parsedRaw = await fs.readFile(PARSED_FILE, 'utf8')
  const { pages } = JSON.parse(parsedRaw) as { pages: ParsedPage[] }

  // Aynı doküman birden fazla sayfada geçebiliyor; etiketleri birleştiriyoruz
  const labelsByPath = new Map<string, Set<string>>()
  for (const page of pages) {
    for (const document of page.documents) {
      const key = normalizePath(document.href)
      const labels = labelsByPath.get(key) ?? new Set<string>()
      if (document.label) labels.add(document.label)
      labelsByPath.set(key, labels)
    }
  }

  const originalPaths = [...labelsByPath.keys()].sort()
  console.log(`${originalPaths.length} tekil doküman indirilecek`)

  await fs.mkdir(DOCUMENTS_DIR, { recursive: true })

  const limit = pLimit(6)
  const entries: DocumentIndexEntry[] = []
  const missing: { originalPath: string; reason: string }[] = []
  const corrupt: { originalPath: string; reason: string }[] = []
  const unwrappedPaths: string[] = []
  let completed = 0

  await Promise.all(
    originalPaths.map((originalPath) =>
      limit(async () => {
        try {
          const response = await fetch(encodeUrl(originalPath), {
            headers: { 'User-Agent': USER_AGENT },
          })
          if (!response.ok) throw new Error(`HTTP ${response.status}`)

          const raw = Buffer.from(await response.arrayBuffer())
          const { data: buffer, unwrapped } = unwrapJavaSerializedBytes(raw)
          if (unwrapped) unwrappedPaths.push(originalPath)

          const extension = (originalPath.split('.').pop() ?? 'pdf').toLowerCase()
          if (!hasValidSignature(buffer, extension)) {
            corrupt.push({ originalPath, reason: `Geçersiz ${extension} imzası` })
            return
          }

          const sha256 = crypto.createHash('sha256').update(buffer).digest('hex')
          const filename = buildFilename(originalPath, sha256)

          await fs.writeFile(path.join(DOCUMENTS_DIR, filename), buffer)
          entries.push({
            originalPath,
            filename,
            bytes: buffer.byteLength,
            sha256,
            labels: [...(labelsByPath.get(originalPath) ?? [])],
          })
        } catch (error) {
          missing.push({ originalPath, reason: (error as Error).message })
        } finally {
          completed += 1
          if (completed % 50 === 0) console.log(`  ${completed}/${originalPaths.length}`)
        }
      }),
    ),
  )

  entries.sort((a, b) => a.originalPath.localeCompare(b.originalPath))
  const index: DocumentIndex = {
    downloadedAt: new Date().toISOString(),
    entries,
    missing,
    unwrapped: unwrappedPaths.sort(),
    corrupt,
  }
  await fs.writeFile(DOCUMENT_INDEX_FILE, JSON.stringify(index, null, 2), 'utf8')

  const totalBytes = entries.reduce((sum, entry) => sum + entry.bytes, 0)
  const uniqueHashes = new Set(entries.map((entry) => entry.sha256)).size

  console.log(`\nİndirilen: ${entries.length}/${originalPaths.length}`)
  console.log(`Toplam boyut: ${(totalBytes / 1024 / 1024).toFixed(1)} MB`)
  console.log(`Tekil içerik (sha256): ${uniqueHashes} — ${entries.length - uniqueHashes} kopya`)

  if (unwrappedPaths.length > 0) {
    console.log(
      `\nJava serileştirme sarmalı açılan: ${unwrappedPaths.length} dosya (canlı sitede bozuk indiriliyorlar)`,
    )
    for (const item of unwrappedPaths.slice(0, 5)) console.log(`  ${item}`)
    if (unwrappedPaths.length > 5) console.log(`  ... ve ${unwrappedPaths.length - 5} tane daha`)
  }

  if (corrupt.length > 0) {
    console.error(`\nBozuk dosya (imza doğrulaması başarısız): ${corrupt.length}`)
    for (const item of corrupt) console.error(`  ${item.originalPath} — ${item.reason}`)
    process.exitCode = 1
  }

  if (missing.length > 0) {
    const known = missing.filter((item) =>
      KNOWN_MISSING_DOCUMENTS.some((candidate) => normalizePath(candidate) === item.originalPath),
    )
    const unexpected = missing.filter((item) => !known.includes(item))

    console.log(`\nErişilemeyen: ${missing.length} (bilinen: ${known.length})`)
    for (const item of known) console.log(`  [bilinen 404] ${item.originalPath}`)
    for (const item of unexpected) console.error(`  [YENİ HATA] ${item.originalPath} — ${item.reason}`)
    if (unexpected.length > 0) process.exitCode = 1
  }
}

/**
 * Mutlak URL'leri site-göreli yola indirger; aynı dosya hem mutlak hem göreli
 * biçimde linklenmiş. Ayrıca Unicode NFC'ye normalize ediyoruz: eski sitede
 * Türkçe karakterler yerine göre NFC/NFD ayrışıyor ve "gündem" iki farklı bayt
 * dizisiyle geliyor, bu da yol karşılaştırmalarını sessizce bozuyor.
 */
export function normalizePath(href: string): string {
  try {
    const url = new URL(href, 'http://www.gyo.com.tr')
    return decodeURIComponent(url.pathname).normalize('NFC')
  } catch {
    return href.normalize('NFC')
  }
}

if (process.argv[1]?.includes('download-documents')) {
  main().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
