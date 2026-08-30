import { getPayload } from 'payload'

import config from '@payload-config'

export const dynamic = 'force-dynamic'

function serializeError(error: unknown) {
  if (error instanceof Error) {
    const extra = error as Error & { code?: string; detail?: string }
    return {
      name: error.name,
      message: error.message,
      code: extra.code,
      detail: extra.detail,
    }
  }
  return { message: String(error) }
}

export async function GET() {
  const checks: Record<string, unknown> = {}

  try {
    const payload = await getPayload({ config })
    checks.init = 'ok'

    for (const slug of ['users', 'pages', 'faqs', 'media', 'documents'] as const) {
      try {
        const result = await payload.find({
          collection: slug,
          locale: 'tr',
          depth: 0,
          limit: 1,
          overrideAccess: true,
        })
        checks[slug] = { ok: true, total: result.totalDocs }
      } catch (error) {
        checks[slug] = { ok: false, error: serializeError(error) }
      }
    }

    try {
      await payload.findGlobal({ slug: 'site-settings', locale: 'tr', depth: 0 })
      checks['site-settings'] = { ok: true }
    } catch (error) {
      checks['site-settings'] = { ok: false, error: serializeError(error) }
    }

    return Response.json({ ok: true, checks })
  } catch (error) {
    return Response.json({ ok: false, error: serializeError(error) }, { status: 500 })
  }
}
