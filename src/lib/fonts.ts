import { Public_Sans } from 'next/font/google'

/*
 * www.garantibbva.com.tr BentonSansBBVA (Light / Book / Medium / Bold) yükler.
 * Bu kesim tescilli; lisans olmadan gömülemez. Public Sans aynı ağırlıkları
 * (300/400/500/700) ve Latin-ext kapsamını verir. Lisans gelince
 * next/font/local + BentonSansBBVA-* ile değiştirilir; --font-sans tek kapı.
 */
export const sans = Public_Sans({
  subsets: ['latin-ext'], // Türkçe ı, ğ, ş, ç, ö, ü için gerekli
  weight: ['300', '400', '500', '700'],
  display: 'swap',
  variable: '--font-public-sans',
})
