import { describe, expect, it } from 'vitest'

import { inferPublishedAt } from './dates'

const NOW = new Date('2026-08-28T00:00:00Z')

describe('inferPublishedAt', () => {
  it('ay 1 hane, gün 2 hane', () => {
    expect(inferPublishedAt('/gyo_files/2026430104741386_faaliyet rap.pdf', NOW)).toBe(
      '2026-04-30T00:00:00.000Z',
    )
  })

  it('ay 1 hane, gün 1 hane', () => {
    expect(inferPublishedAt('/gyo_files/20268316375310_denetim.pdf', NOW)).toBe(
      '2026-08-03T00:00:00.000Z',
    )
  })

  it('ay 2 hane, gün 2 hane', () => {
    expect(inferPublishedAt('/gyo_files/20131030141012171_Faaliyet.pdf', NOW)).toBe(
      '2013-10-30T00:00:00.000Z',
    )
  })

  it('gelecek tarih üretmez', () => {
    const result = inferPublishedAt('/gyo_files/2026430104741386_x.pdf', NOW)
    expect(new Date(result!).getTime()).toBeLessThanOrEqual(NOW.getTime())
  })

  it('timestamp öneki olmayan dosyada undefined döner', () => {
    expect(inferPublishedAt('/gyo_files/rapor.pdf', NOW)).toBeUndefined()
  })

  it('1996 öncesi yılları reddeder', () => {
    expect(inferPublishedAt('/gyo_files/19901030141012_x.pdf', NOW)).toBeUndefined()
  })
})
