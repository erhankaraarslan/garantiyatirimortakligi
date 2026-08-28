import { Public_Sans } from 'next/font/google'

/*
 * Referans site tescilli Benton Sans BBVA kullanıyor (Light 300 / Book 400 /
 * Medium 500 / Bold 700). Lisans temin edilirse burası next/font/local ile
 * değiştirilecek; --font-sans değişkeni sayesinde başka hiçbir yer etkilenmez.
 */
export const sans = Public_Sans({
  subsets: ['latin-ext'], // Türkçe ı, ğ, ş, ç, ö, ü için gerekli
  weight: ['300', '400', '500', '700'],
  display: 'swap',
  variable: '--font-public-sans',
})
