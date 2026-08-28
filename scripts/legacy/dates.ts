/**
 * Eski dosya adlarındaki timestamp önekinden yükleme tarihini çıkarır.
 *
 * Biçim YYYY + ay + gün + saat/dakika/saniye şeklinde ama ay ve gün SIFIRLA
 * DOLDURULMAMIŞ, bu yüzden belirsiz:
 *   "2026430104741386_"  -> 2026-04-30  (ay 1 hane, gün 2 hane)
 *   "20268316375310_"    -> 2026-08-03  (ay 1 hane, gün 1 hane)
 *   "20131030141012171_" -> 2013-10-30  (ay 2 hane, gün 2 hane)
 *
 * Tüm ay/gün hane kombinasyonlarını deneyip geçerli ve gelecekte olmayan ilk
 * tarihi seçiyoruz. Sabit uzunluk varsaymak ay 83 gibi değerler üretip
 * tarihlerin 2032'ye taşmasına yol açıyordu.
 */
export function inferPublishedAt(originalPath: string, now = new Date()): string | undefined {
  const filename = originalPath.split('/').pop() ?? ''
  const match = filename.match(/^(\d{8,})_/)
  if (!match) return undefined

  const digits = match[1]
  const year = Number(digits.slice(0, 4))
  if (year < 1996 || year > now.getFullYear()) return undefined

  for (const monthLength of [2, 1]) {
    for (const dayLength of [2, 1]) {
      const month = Number(digits.slice(4, 4 + monthLength))
      const day = Number(digits.slice(4 + monthLength, 4 + monthLength + dayLength))
      if (month < 1 || month > 12 || day < 1 || day > 31) continue

      const candidate = new Date(Date.UTC(year, month - 1, day))
      // Ay/gün taşması olmadığını doğrula (ör. 31 Şubat -> 3 Mart)
      if (candidate.getUTCMonth() !== month - 1 || candidate.getUTCDate() !== day) continue
      if (candidate.getTime() > now.getTime()) continue

      return candidate.toISOString()
    }
  }

  return undefined
}
