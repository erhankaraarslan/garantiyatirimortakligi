import { describe, expect, it } from 'vitest'

import { needsEnglishTranslation, toEnglishLabel } from '../../src/lib/enLabel'

describe('toEnglishLabel', () => {
  it('çeyrek, TTSG ve faaliyet raporu kalıpları', () => {
    expect(toEnglishLabel('2008-1.Çeyrek')).toBe('2008-Q1')
    expect(toEnglishLabel('2013- 4. Çeyrek')).toBe('2013-Q4')
    expect(toEnglishLabel('TTSG 19-06-2026 Sayı 11605')).toBe('TTSG 19-06-2026 Issue 11605')
    expect(toEnglishLabel('2024 Yılı Faaliyet Raporu')).toBe('2024 Annual Report')
    expect(toEnglishLabel('İlişkili Taraf Açıklamaları 2012')).toBe('Related-Party Disclosures 2012')
  })

  it('genel kurul tarihli belgeler', () => {
    expect(toEnglishLabel('06 Mayıs 2025 Tarihli 2024 yılına ait Genel Kurul Tutanağı')).toBe(
      'Minutes of the General Assembly for 2024, dated 6 May 2025',
    )
    expect(toEnglishLabel('03.09.2018 Tarihli Olağanüstü Genel Kurul Hazirun Cetveli')).toBe(
      'Attendance list of the Extraordinary General Assembly, dated 3 September 2018',
    )
    expect(toEnglishLabel('2017 Yılına ait Genel Kurul Bilgilendirme Dökümanı')).toBe(
      'General Assembly information document for 2017',
    )
  })

  it('özel adlar ve URL etiketleri', () => {
    expect(toEnglishLabel('Esas Sözleşme')).toBe('Articles of Association')
    expect(toEnglishLabel('Vekaleten Oy Kullanma Formu')).toBe('Form of Voting by Proxy')
    expect(toEnglishLabel('http://www.gyo.com.tr/gyo_files/20132514121821_Izahname1996.pdf')).toBe(
      'Prospectus 1996',
    )
  })

  it('zaten İngilizce metni bozmaz', () => {
    expect(toEnglishLabel('Audit Committee Principles')).toBe('Audit Committee Principles')
    expect(needsEnglishTranslation('Audit Committee Principles')).toBe(false)
    expect(needsEnglishTranslation('Esas Sözleşme')).toBe(true)
  })
})
