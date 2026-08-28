'use client'

import { useState } from 'react'

import type { Locale } from '../../lib/i18n'

const strings = {
  tr: {
    firstName: 'Ad',
    lastName: 'Soyad',
    email: 'E-Posta',
    message: 'Mesajınız',
    consent: 'Kişisel verilerimin işlenmesine ilişkin aydınlatma metnini okudum ve onaylıyorum.',
    consentLink: 'Aydınlatma metnini görüntüle',
    consentHref: '/tr/kisisel-verilerin-korunmasi-hakkinda-bilgilendirme',
    submit: 'Gönder',
    sending: 'Gönderiliyor…',
    success: 'Mesajınız iletildi. En kısa sürede dönüş yapacağız.',
    error: 'Mesaj gönderilemedi. Lütfen daha sonra tekrar deneyin.',
    required: 'Bu alan zorunludur.',
    invalidEmail: 'Geçerli bir e-posta adresi girin.',
  },
  en: {
    firstName: 'First name',
    lastName: 'Last name',
    email: 'Email',
    message: 'Your message',
    consent: 'I have read and accept the personal data protection notice.',
    consentLink: 'View the notice',
    consentHref: '/en/personal-data-protection-notice',
    submit: 'Send',
    sending: 'Sending…',
    success: 'Your message has been sent. We will get back to you shortly.',
    error: 'The message could not be sent. Please try again later.',
    required: 'This field is required.',
    invalidEmail: 'Please enter a valid email address.',
  },
}

type Status = 'idle' | 'sending' | 'success' | 'error'

export function ContactForm({ locale }: { locale: Locale }) {
  const t = strings[locale]
  const [status, setStatus] = useState<Status>('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>

    // İstemci tarafı doğrulama; sunucu tarafında da aynısı tekrar kontrol ediliyor
    const nextErrors: Record<string, string> = {}
    for (const field of ['firstName', 'lastName', 'message'] as const) {
      if (!data[field]?.trim()) nextErrors[field] = t.required
    }
    if (!data.email?.trim()) nextErrors.email = t.required
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) nextErrors.email = t.invalidEmail
    if (!data.consent) nextErrors.consent = t.required

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setStatus('sending')
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, consent: true, locale }),
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      setStatus('success')
      form.reset()
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <p role="status" className="border-l-4 border-green bg-surface-alt p-5 text-ink">
        {t.success}
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-xl">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="firstName" label={t.firstName} error={errors.firstName} />
        <Field id="lastName" label={t.lastName} error={errors.lastName} />
      </div>
      <Field id="email" label={t.email} type="email" error={errors.email} className="mt-4" />

      <div className="mt-4">
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-ink">
          {t.message}
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? 'message-error' : undefined}
          className="w-full border border-divider bg-surface px-3 py-2.5 outline-none focus:border-brand-blue"
        />
        {errors.message && (
          <p id="message-error" className="mt-1 text-xs text-[#c0392b]">
            {errors.message}
          </p>
        )}
      </div>

      <div className="mt-4">
        <label className="flex items-start gap-2 text-sm text-body">
          <input
            type="checkbox"
            name="consent"
            value="1"
            aria-invalid={Boolean(errors.consent)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[--color-brand-blue]"
          />
          <span>
            {t.consent}{' '}
            <a href={t.consentHref} className="text-brand-blue underline">
              {t.consentLink}
            </a>
          </span>
        </label>
        {errors.consent && <p className="mt-1 text-xs text-[#c0392b]">{errors.consent}</p>}
      </div>

      {status === 'error' && (
        <p role="alert" className="mt-4 border-l-4 border-[#c0392b] bg-surface-alt p-4 text-sm">
          {t.error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="mt-6 bg-brand-blue px-7 py-3.5 text-btn font-medium text-white transition-colors hover:bg-brand-blue-mid disabled:opacity-60"
      >
        {status === 'sending' ? t.sending : t.submit}
      </button>
    </form>
  )
}

function Field({
  id,
  label,
  error,
  type = 'text',
  className,
}: {
  id: string
  label: string
  error?: string
  type?: string
  className?: string
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="w-full border border-divider bg-surface px-3 py-2.5 outline-none focus:border-brand-blue"
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-[#c0392b]">
          {error}
        </p>
      )}
    </div>
  )
}
