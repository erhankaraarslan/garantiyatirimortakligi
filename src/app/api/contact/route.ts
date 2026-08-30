import { NextResponse, type NextRequest } from 'next/server'

import { getPayloadClient } from '../../../lib/data'

/**
 * İletişim formu gönderimi. Kayıt Payload'a yazılıyor; SMTP yapılandırılmışsa
 * Payload'ın e-posta adaptörü üzerinden bildirim gönderiliyor.
 *
 * Not: reCAPTCHA anahtarı tanımlıysa doğrulanıyor, tanımsızsa (geliştirme)
 * atlanıyor — böylece yerelde anahtar zorunluluğu olmuyor.
 */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek gövdesi' }, { status: 400 })
  }

  const firstName = str(body.firstName)
  const lastName = str(body.lastName)
  const email = str(body.email)
  const message = str(body.message)
  const consent = body.consent === true
  const locale = str(body.locale) === 'en' ? 'en' : 'tr'

  const errors: string[] = []
  if (!firstName) errors.push('firstName')
  if (!lastName) errors.push('lastName')
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.push('email')
  if (!message) errors.push('message')
  // KVKK: açık rıza olmadan kayıt oluşturmuyoruz
  if (!consent) errors.push('consent')

  if (errors.length > 0) {
    return NextResponse.json({ error: 'Doğrulama hatası', fields: errors }, { status: 422 })
  }

  if (process.env.RECAPTCHA_SECRET_KEY) {
    const token = str(body.recaptchaToken)
    if (!(await verifyRecaptcha(token))) {
      return NextResponse.json({ error: 'Doğrulama başarısız' }, { status: 400 })
    }
  }

  const payload = await getPayloadClient()

  await payload.create({
    collection: 'contact-messages',
    data: { firstName, lastName, email, message, consent, locale },
  })

  const contact = await payload.findGlobal({ slug: 'contact-info', depth: 0 })
  const recipients = `${contact.formRecipients ?? ''},${process.env.CONTACT_FORM_TO ?? ''}`
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  const uniqueRecipients = [...new Set(recipients)]

  if (uniqueRecipients.length > 0) {
    try {
      await payload.sendEmail({
        to: uniqueRecipients,
        replyTo: email,
        subject: `Web sitesi iletişim formu — ${firstName} ${lastName}`,
        text: [
          `Ad Soyad: ${firstName} ${lastName}`,
          `E-Posta: ${email}`,
          `Dil: ${locale}`,
          '',
          message,
        ].join('\n'),
      })
    } catch (error) {
      // E-posta gönderimi başarısız olsa da kayıt panelde duruyor; isteği düşürmüyoruz
      console.error('[contact] Bildirim e-postası gönderilemedi:', error)
    }
  }

  return NextResponse.json({ ok: true })
}

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

async function verifyRecaptcha(token: string): Promise<boolean> {
  if (!token) return false
  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: process.env.RECAPTCHA_SECRET_KEY ?? '',
        response: token,
      }),
    })
    const result = (await response.json()) as { success?: boolean; score?: number }
    return Boolean(result.success) && (result.score ?? 1) >= 0.5
  } catch {
    return false
  }
}
