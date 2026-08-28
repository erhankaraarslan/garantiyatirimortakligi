import type { ParsedPage } from './parse-pages'

/** Eski ana sayfadaki #home_main kareleri — parse içerik placeholder'ında yok. */
export const HOME_MOSAIC_TILES = [
  {
    src: '/images/home/kurumsal.jpg',
    trPath: '/tr/kurumsal',
    tr: 'Kurumsal',
    en: 'Corporate',
  },
  {
    src: '/images/home/sureklibilgilendirmeformu.jpg',
    trPath: '/tr/surekli-bilgilendirme-formu',
    tr: 'Sürekli Bilgilendirme Formu',
    en: 'Disclosure Form',
  },
  {
    src: '/images/home/yatirimciiliskileri.jpg',
    trPath: '/tr/yatirimci-iliskileri',
    tr: 'Yatırımcı İlişkileri',
    en: 'Investor Relations',
  },
  {
    src: '/images/home/baskaninsunumu.jpg',
    trPath: '/tr/kurumsal/baskanin-mesaji',
    tr: 'Başkanın Mesajı',
    en: "President's Message",
  },
  {
    src: '/images/home/insankaynaklari.jpg',
    trPath: '/tr/insan-kaynaklari',
    tr: 'İnsan Kaynakları',
    en: 'Human Resources',
  },
  {
    src: '/images/home/vizyon.jpg',
    trPath: '/tr/vizyon',
    tr: 'Vizyon',
    en: 'Vision',
  },
  {
    src: '/images/home/bizeulasin.jpg',
    trPath: '/tr/bize-ulasin',
    tr: 'Bize Ulaşın',
    en: 'Contact Us',
  },
] as const

export const LOGO_SRC = '/images/logo.jpg'

export const EXTRA_MEDIA: { src: string; alt: string }[] = [
  ...HOME_MOSAIC_TILES.map((tile) => ({ src: tile.src, alt: tile.tr })),
  { src: LOGO_SRC, alt: 'Garanti Yatırım Ortaklığı A.Ş.' },
]

export const AWARDS_SEED = [
  {
    image: '/gyo_files/2013318151655783_odul01a.png',
    year: 2011,
    issuerTr: 'B.I.D. Business Initiative Directions',
    issuerEn: 'B.I.D. Business Initiative Directions',
    titleTr: 'Gold Award for Excellence and Business Prestige',
    titleEn: 'Gold Award for Excellence and Business Prestige',
  },
  {
    image: '/gyo_files/201331815170924_odul02a.png',
    year: 2012,
    issuerTr: 'B.I.D. Business Initiative Directions',
    issuerEn: 'B.I.D. Business Initiative Directions',
    titleTr: 'International Platinum Star for Quality Award',
    titleEn: 'International Platinum Star for Quality Award',
  },
  {
    image: 'http://www.gyo.com.tr/gyo_files/2013722163041312_VMWare-2355.png',
    year: 2013,
    issuerTr: 'ESQR — The European Society for Quality Research',
    issuerEn: 'ESQR — The European Society for Quality Research',
    titleTr: "ESQR Quality Achievements Award 2013 — Gold Category",
    titleEn: "ESQR Quality Achievements Award 2013 — Gold Category",
  },
  {
    image: 'http://www.gyo.com.tr/gyo_files/201423104322564_gyo4odul02.png',
    year: 2014,
    issuerTr: 'TKYD — Türkiye Kurumsal Yönetim Derneği',
    issuerEn: 'Corporate Governance Association of Turkey (TKYD)',
    titleTr: 'Kurumsal Yönetim Endeksi’nde Notunu En Çok Artıran Kuruluş',
    titleEn: 'Highest increase in Corporate Governance Index score',
  },
] as const

/**
 * Lexical iç içe tablo ve görselleri bozuyor. Bu sayfalarda temiz HTML tutulur.
 */
export function shouldUseLegacyHtml(page: Pick<ParsedPage, 'template' | 'contentHtml'>): boolean {
  if (!page.contentHtml) return false
  if (['contact', 'faq', 'landing', 'gallery', 'sitemap'].includes(page.template)) return false
  return /<table|<img/i.test(page.contentHtml)
}
