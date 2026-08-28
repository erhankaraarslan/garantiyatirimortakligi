import { NextResponse, type NextRequest } from 'next/server'

import { defaultLocale, locales } from './lib/i18n'
import legacyRedirects from './redirects.generated.json'

const redirectMap = legacyRedirects as Record<string, string>

const STATIC_ASSET = /\.(?:png|jpg|jpeg|gif|svg|webp|avif|ico|css|js|woff2?|map)$/i

/**
 * Dil öneki almaması gereken kök seviye rotalar. Bunlar olmadan
 * /sitemap.xml gibi yollar /tr/sitemap.xml'e yönlenip 404 veriyor.
 */
const ROOT_ROUTES = new Set([
  '/sitemap.xml',
  '/robots.txt',
  '/favicon.ico',
  '/manifest.webmanifest',
])

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  /*
   * Eski gyo.com.tr URL'lerinin 301'i. next.config'in redirects() mekanizması
   * yerine burada tam eşleşmeli sözlük aramasıyla yapıyoruz: eski dosya
   * adlarında boşluk, parantez ve Türkçe karakter var ve path-to-regexp bu
   * desenlerle çalışmıyor. Ayrıca Next varsayılan olarak 308 döndürüyor;
   * arama motorlarının alışık olduğu 301'i açıkça veriyoruz.
   */
  const decodedPath = safeDecode(pathname)
  const target = redirectMap[decodedPath] ?? redirectMap[pathname]
  if (target) {
    const url = request.nextUrl.clone()
    url.pathname = target
    url.search = ''
    return NextResponse.redirect(url, 301)
  }

  if (pathname.startsWith('/admin') || STATIC_ASSET.test(pathname) || ROOT_ROUTES.has(pathname)) {
    return NextResponse.next()
  }

  const [, first] = pathname.split('/')
  if (!locales.includes(first as (typeof locales)[number])) {
    const url = request.nextUrl.clone()
    url.pathname = `/${defaultLocale}${pathname === '/' ? '' : pathname}`
    return NextResponse.redirect(url)
  }

  /*
   * Header'daki dil değiştiricisi, karşı dildeki sayfanın slug'ını bulmak için
   * mevcut yolu bilmek zorunda. Layout'lar kendi segmentlerinin dışındaki
   * parametrelere erişemediği için yolu istek header'ına yazıyoruz.
   */
  const headers = new Headers(request.headers)
  headers.set('x-pathname', pathname)
  return NextResponse.next({ request: { headers } })
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
