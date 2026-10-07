import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { findMountPoint, parseMounts, resolveUploadsRoot } from './uploadsRoot'
import { validateArchiveEntries } from './uploadsImport'

const PROC_MOUNTS = `sysfs /sys sysfs rw,nosuid 0 0
/dev/sda1 / ext4 rw,relatime 0 0
gbnasgyosharedarea:/gyosharedarea /mnt/gyo\\040shared nfs4 rw,relatime,vers=4.1 0 0
`

describe('parseMounts / findMountPoint', () => {
  it('NFS kaynağının bağlandığı klasörü kaçışlı boşlukla birlikte bulur', () => {
    const mounts = parseMounts(PROC_MOUNTS)
    expect(findMountPoint('gbnasgyosharedarea:/gyosharedarea', mounts)).toBe('/mnt/gyo shared')
    expect(findMountPoint('gbnasgyosharedarea:/gyosharedarea/', mounts)).toBe('/mnt/gyo shared')
  })

  it('bağlı olmayan kaynak için null döner', () => {
    expect(findMountPoint('baska:/alan', parseMounts(PROC_MOUNTS))).toBeNull()
  })
})

describe('resolveUploadsRoot', () => {
  const mounts = () => parseMounts(PROC_MOUNTS)

  it('UPLOADS_DIR her şeyden önce gelir', () => {
    const env = { UPLOADS_DIR: '/srv/uploads', MEDIA_SHARED_MOUNT: 'gbnasgyosharedarea:/gyosharedarea' }
    expect(resolveUploadsRoot(env, mounts)).toBe('/srv/uploads')
  })

  it('MEDIA_SHARED_MOUNT bağlıysa mount noktasını kullanır', () => {
    expect(resolveUploadsRoot({ MEDIA_SHARED_MOUNT: 'gbnasgyosharedarea:/gyosharedarea' }, mounts)).toBe(
      '/mnt/gyo shared',
    )
  })

  it('hiçbiri yoksa ya da mount bulunamazsa çalışma dizinine düşer', () => {
    expect(resolveUploadsRoot({}, mounts)).toBe(process.cwd())
    expect(resolveUploadsRoot({ MEDIA_SHARED_MOUNT: 'yok:/alan' }, mounts)).toBe(process.cwd())
  })

  it('göreli UPLOADS_DIR mutlak yola çevrilir', () => {
    expect(resolveUploadsRoot({ UPLOADS_DIR: 'uploads' }, mounts)).toBe(path.resolve('uploads'))
  })
})

describe('validateArchiveEntries', () => {
  it('media/ ve documents/ altındaki dosya ve klasörleri kabul eder', () => {
    const names = ['media/', 'media/logo.png', './documents/', 'documents/rapor 2025.pdf']
    expect(validateArchiveEntries(names, ['d', '-', 'd', '-'])).toBeNull()
  })

  it('kök dışına çıkan ya da mutlak yolları reddeder', () => {
    expect(validateArchiveEntries(['media/../../etc/passwd'], ['-'])).toMatch(/Geçersiz yol/)
    expect(validateArchiveEntries(['/etc/passwd'], ['-'])).toMatch(/Geçersiz yol/)
  })

  it('beklenmeyen üst klasörü ve linkleri reddeder', () => {
    expect(validateArchiveEntries(['src/app.ts'], ['-'])).toMatch(/beklenmeyen klasör/)
    expect(validateArchiveEntries(['media/kisayol'], ['l'])).toMatch(/link/)
    expect(validateArchiveEntries(['documents/sert'], ['h'])).toMatch(/link/)
  })

  it('boş arşivi reddeder', () => {
    expect(validateArchiveEntries([], [])).toMatch(/boş/)
  })
})
