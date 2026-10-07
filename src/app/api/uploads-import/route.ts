import { NextResponse, type NextRequest } from 'next/server'

import { getPayloadClient } from '../../../lib/data'
import { appendChunk, discardPartial, importStatus, startExtract, type ChunkResult } from '../../../lib/uploadsImport'
import { renderImportPage } from '../../../lib/uploadsImportPage'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const PAGE_PATH = '/api/uploads-import'

async function authenticate(request: NextRequest) {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: request.headers })
  return { payload, user }
}

function chunkResponse(result: ChunkResult, okStatus = 200) {
  if (result.ok) return NextResponse.json({ size: result.size }, { status: okStatus })
  return NextResponse.json({ error: result.error, size: result.size }, { status: result.status })
}

function parseNonNegativeInt(value: string | null): number | null {
  if (value === null || !/^\d+$/.test(value)) return null
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) ? parsed : null
}

export async function GET(request: NextRequest) {
  const { payload, user } = await authenticate(request)

  if (request.nextUrl.searchParams.get('format') === 'json') {
    if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })
    return NextResponse.json(await importStatus(payload), { headers: { 'Cache-Control': 'no-store' } })
  }

  if (!user) {
    const login = new URL('/admin/login', request.nextUrl.origin)
    login.searchParams.set('redirect', PAGE_PATH)
    return NextResponse.redirect(login)
  }

  return new NextResponse(renderImportPage(), {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}

export async function POST(request: NextRequest) {
  const { user } = await authenticate(request)
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  /*
   * Özel başlık, başka bir siteden admin çerezini kullanarak istek atılmasını
   * engelliyor: tarayıcı bu başlıkla çapraz kaynak isteğine önce preflight yapar.
   */
  if (request.headers.get('x-gyo-import') !== '1') {
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 403 })
  }

  const params = request.nextUrl.searchParams
  switch (params.get('op')) {
    case 'chunk': {
      const offset = parseNonNegativeInt(params.get('offset'))
      if (offset === null) return NextResponse.json({ error: 'offset geçersiz' }, { status: 400 })
      const data = Buffer.from(await request.arrayBuffer())
      if (data.length === 0) return NextResponse.json({ error: 'Boş parça' }, { status: 400 })
      return chunkResponse(await appendChunk(offset, data))
    }
    case 'extract': {
      const size = parseNonNegativeInt(params.get('size'))
      if (size === null) return NextResponse.json({ error: 'size geçersiz' }, { status: 400 })
      return chunkResponse(await startExtract(size), 202)
    }
    case 'discard':
      await discardPartial()
      return NextResponse.json({ ok: true })
    default:
      return NextResponse.json({ error: 'Bilinmeyen işlem' }, { status: 400 })
  }
}
