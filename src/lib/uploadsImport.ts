import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import type { Payload } from 'payload'

import { readMounts, uploadsDir, uploadsRoot } from './uploadsRoot'

const run = promisify(execFile)
const TAR_OUTPUT_LIMIT = 64 * 1024 * 1024
const ALLOWED_TOP_LEVEL = new Set(['media', 'documents'])

export type ImportJob = {
  state: 'idle' | 'running' | 'done' | 'error'
  step?: string
  message?: string
  sha256?: string
  entries?: number
  startedAt?: string
  finishedAt?: string
}

const jobHolder = globalThis as typeof globalThis & { __gyoUploadsImportJob?: ImportJob }

function getJob(): ImportJob {
  return jobHolder.__gyoUploadsImportJob ?? { state: 'idle' }
}

function setJob(job: ImportJob) {
  jobHolder.__gyoUploadsImportJob = job
}

export function partialArchivePath(): string {
  return path.join(uploadsRoot, '.uploads-import.tgz.part')
}

async function fileSize(file: string): Promise<number | null> {
  try {
    return (await fsp.stat(file)).size
  } catch {
    return null
  }
}

/**
 * Arşivde yalnızca media/ ve documents/ altındaki düz dosya ve klasörlere izin
 * veriyoruz; link ya da kök dışına çıkan yol, açma sırasında NFS'te başka
 * yerlere yazılmasına yol açar.
 */
export function validateArchiveEntries(names: string[], types: string[]): string | null {
  if (names.length === 0) return 'Arşiv boş.'
  if (names.length !== types.length) return 'Arşiv listesi okunamadı.'

  for (let i = 0; i < names.length; i++) {
    const name = names[i].replace(/^\.\//, '')
    const segments = name.split('/').filter(Boolean)

    if (name.startsWith('/') || segments.includes('..')) return `Geçersiz yol: ${names[i]}`
    if (segments.length === 0) continue
    if (!ALLOWED_TOP_LEVEL.has(segments[0])) {
      return `Arşivde beklenmeyen klasör var: ${names[i]} (yalnızca media/ ve documents/ kabul ediliyor)`
    }
    if (types[i] !== '-' && types[i] !== 'd') return `Arşivde link ya da özel dosya var: ${names[i]}`
  }

  return null
}

export type ChunkResult = { ok: true; size: number } | { ok: false; status: number; error: string; size?: number }

export async function appendChunk(offset: number, data: Buffer): Promise<ChunkResult> {
  if (getJob().state === 'running') return { ok: false, status: 409, error: 'Arşiv şu anda açılıyor.' }

  const file = partialArchivePath()
  await fsp.mkdir(uploadsRoot, { recursive: true })

  if (offset === 0) {
    await fsp.writeFile(file, data)
    return { ok: true, size: data.length }
  }

  const size = (await fileSize(file)) ?? 0
  if (size !== offset) {
    return { ok: false, status: 409, error: 'Parça sırası uyuşmuyor.', size }
  }

  await fsp.appendFile(file, data)
  return { ok: true, size: size + data.length }
}

export async function discardPartial(): Promise<void> {
  if (getJob().state === 'running') return
  await fsp.rm(partialArchivePath(), { force: true })
  setJob({ state: 'idle' })
}

async function sha256(file: string): Promise<string> {
  const hash = createHash('sha256')
  for await (const chunk of fs.createReadStream(file)) hash.update(chunk as Buffer)
  return hash.digest('hex')
}

function lines(output: string): string[] {
  return output.split('\n').filter((line) => line.length > 0)
}

async function extractArchive(file: string) {
  const startedAt = new Date().toISOString()
  const update = (patch: Partial<ImportJob>) => setJob({ ...getJob(), ...patch })

  setJob({ state: 'running', step: 'SHA-256 hesaplanıyor', startedAt })
  try {
    const digest = await sha256(file)
    update({ sha256: digest, step: 'Arşiv içeriği doğrulanıyor' })

    const [{ stdout: names }, { stdout: verbose }] = await Promise.all([
      run('tar', ['-tzf', file], { maxBuffer: TAR_OUTPUT_LIMIT }),
      run('tar', ['-tvzf', file], { maxBuffer: TAR_OUTPUT_LIMIT }),
    ])
    const entryNames = lines(names)
    const problem = validateArchiveEntries(
      entryNames,
      lines(verbose).map((line) => line[0]),
    )
    if (problem) throw new Error(problem)

    update({ step: `${entryNames.length} girdi açılıyor`, entries: entryNames.length })
    await run('tar', ['-xzf', file, '-C', uploadsRoot], { maxBuffer: TAR_OUTPUT_LIMIT })

    await fsp.rm(file, { force: true })
    update({ state: 'done', step: 'Tamamlandı', finishedAt: new Date().toISOString() })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    update({ state: 'error', step: 'Hata', message, finishedAt: new Date().toISOString() })
  }
}

export async function startExtract(expectedSize: number): Promise<ChunkResult> {
  if (getJob().state === 'running') return { ok: false, status: 409, error: 'Arşiv zaten açılıyor.' }

  const file = partialArchivePath()
  const size = await fileSize(file)
  if (size === null) return { ok: false, status: 400, error: 'Yüklenmiş arşiv bulunamadı.' }
  if (size !== expectedSize) {
    return { ok: false, status: 400, error: `Arşiv eksik yüklenmiş (${size} / ${expectedSize} bayt).`, size }
  }

  void extractArchive(file)
  return { ok: true, size }
}

async function listFiles(dir: string): Promise<Set<string>> {
  try {
    const entries = await fsp.readdir(dir, { withFileTypes: true })
    return new Set(entries.filter((entry) => entry.isFile()).map((entry) => entry.name))
  } catch {
    return new Set()
  }
}

type SizeMap = Record<string, { filename?: string | null } | undefined>

async function compareWithDatabase(payload: Payload) {
  const [mediaDocs, documentDocs, mediaFiles, documentFiles] = await Promise.all([
    payload.find({ collection: 'media', pagination: false, depth: 0, overrideAccess: true }),
    payload.find({ collection: 'documents', pagination: false, depth: 0, overrideAccess: true }),
    listFiles(uploadsDir('media')),
    listFiles(uploadsDir('documents')),
  ])

  const expectedMedia = mediaDocs.docs.flatMap((doc) => [
    doc.filename,
    ...Object.values((doc.sizes ?? {}) as SizeMap).map((size) => size?.filename),
  ])
  const expectedDocuments = documentDocs.docs.map((doc) => doc.filename)

  const summarize = (expected: (string | null | undefined)[], present: Set<string>) => {
    const names = expected.filter((name): name is string => Boolean(name))
    const missing = names.filter((name) => !present.has(name))
    return { onDisk: present.size, referenced: names.length, missing: missing.length, missingSample: missing.slice(0, 10) }
  }

  return {
    media: summarize(expectedMedia, mediaFiles),
    documents: summarize(expectedDocuments, documentFiles),
  }
}

export async function importStatus(payload: Payload) {
  const writable = await fsp.access(uploadsRoot, fs.constants.W_OK).then(
    () => true,
    () => false,
  )

  return {
    uploadsRoot,
    rootSource: process.env.UPLOADS_DIR
      ? 'UPLOADS_DIR'
      : process.env.MEDIA_SHARED_MOUNT && uploadsRoot !== process.cwd()
        ? `MEDIA_SHARED_MOUNT (${process.env.MEDIA_SHARED_MOUNT})`
        : 'çalışma dizini',
    writable,
    s3Enabled: Boolean(process.env.S3_BUCKET),
    nfsMounts: readMounts()
      .filter((entry) => entry.type.startsWith('nfs'))
      .map(({ source, mountPoint }) => ({ source, mountPoint })),
    partialSize: await fileSize(partialArchivePath()),
    job: getJob(),
    files: await compareWithDatabase(payload),
  }
}
