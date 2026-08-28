import path from 'path'

export const LEGACY_BASE_URL = process.env.LEGACY_BASE_URL ?? 'http://www.gyo.com.tr'

export const MIGRATION_DIR = path.resolve(process.cwd(), '.migration')
export const PAGES_DIR = path.join(MIGRATION_DIR, 'pages')
export const DOCUMENTS_DIR = path.join(MIGRATION_DIR, 'documents')
export const PARSED_FILE = path.join(MIGRATION_DIR, 'parsed.json')
export const DOCUMENT_INDEX_FILE = path.join(MIGRATION_DIR, 'documents.json')
export const REPORT_DIR = path.join(MIGRATION_DIR, 'reports')

export const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'

/** Eski sitede aynı içeriği veren yinelenen girişler. */
export const DUPLICATE_PATHS = new Set(['/tr.aspx', '/en.aspx', '/default.aspx'])

/**
 * Eski sitede 404 dönen dokümanlar. Kaynaktan yeniden temin edilmeleri gerekiyor;
 * script'ler bunları hata değil "bilinen eksik" olarak raporluyor.
 */
export const KNOWN_MISSING_DOCUMENTS = [
  '/gyo_files/201862116382639_gündem-transl (002).pdf',
  '/gyo_files/2019114115646437_30.09.2019finansalrapor.pdf',
  '/gyo_files/2019729145757687_FinansalRapor30.06.2019GYO.pdf',
  '/gyo_files/201972915341250_FinansalRapor30.06.2019GYO-sayfalar-2-3.pdf',
  '/gyo_files/20198229502718_05082013ttsg.pdf',
  'http://www.gyo.com.tr/gyo_files/20132793635747_BİLGİLENDİRME%20POLITIKA.pdf',
]

/** Eski .aspx yolunu yeni temiz yola çevirir: /tr/kurumsal/oduller.aspx -> /tr/kurumsal/oduller */
export function toCleanPath(legacyPath: string): string {
  return legacyPath.replace(/\.aspx$/i, '')
}

export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  return `${LEGACY_BASE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`
}

/** Türkçe karakter ve boşluk içeren yolları güvenli şekilde encode eder. */
export function encodeUrl(rawUrl: string): string {
  const url = new URL(absoluteUrl(rawUrl))
  url.pathname = url.pathname
    .split('/')
    .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
    .join('/')
  return url.toString()
}
