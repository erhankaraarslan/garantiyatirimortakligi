import fs from 'node:fs'
import path from 'node:path'

export type MountEntry = { source: string; mountPoint: string; type: string }

/** /proc/mounts boşluk gibi karakterleri sekizlik kaçış (\040) olarak yazıyor. */
function unescapeMountField(value: string): string {
  return value.replace(/\\([0-7]{3})/g, (_, octal: string) => String.fromCharCode(parseInt(octal, 8)))
}

export function parseMounts(text: string): MountEntry[] {
  return text
    .split('\n')
    .map((line) => line.trim().split(/\s+/))
    .filter((fields) => fields.length >= 3)
    .map(([source, mountPoint, type]) => ({
      source: unescapeMountField(source),
      mountPoint: unescapeMountField(mountPoint),
      type,
    }))
}

function trimSlash(value: string): string {
  return value.length > 1 ? value.replace(/\/+$/, '') : value
}

export function findMountPoint(source: string, mounts: MountEntry[]): string | null {
  const wanted = trimSlash(source)
  return mounts.find((entry) => trimSlash(entry.source) === wanted)?.mountPoint ?? null
}

export function readMounts(): MountEntry[] {
  try {
    return parseMounts(fs.readFileSync('/proc/mounts', 'utf8'))
  } catch {
    return []
  }
}

/**
 * media/ ve documents/ klasörlerinin bulunduğu kök. Öncelik sırası:
 * UPLOADS_DIR; MEDIA_SHARED_MOUNT (ör. "nas:/export") bağlıysa bağlandığı
 * klasör; ikisi de yoksa çalışma dizini.
 */
export function resolveUploadsRoot(
  env: Record<string, string | undefined> = process.env,
  mounts: () => MountEntry[] = readMounts,
): string {
  if (env.UPLOADS_DIR) return path.resolve(env.UPLOADS_DIR)

  if (env.MEDIA_SHARED_MOUNT) {
    const mountPoint = findMountPoint(env.MEDIA_SHARED_MOUNT, mounts())
    if (mountPoint) return mountPoint
    console.warn(
      `[uploads] MEDIA_SHARED_MOUNT=${env.MEDIA_SHARED_MOUNT} bağlı değil; yüklemeler çalışma dizinine yazılacak.`,
    )
  }

  return process.cwd()
}

export const uploadsRoot = resolveUploadsRoot()

export function uploadsDir(name: 'media' | 'documents'): string {
  return path.join(uploadsRoot, name)
}
