'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'gyo-cookie-consent'

type Consent = 'accepted' | 'rejected'

/**
 * KVKK gereği analitik çerezler onay alınmadan yüklenmiyor: GA4 script'i
 * yalnızca kullanıcı kabul ettikten sonra render ediliyor.
 */
export function CookieBanner({
  ga4Id,
  labels,
}: {
  ga4Id?: string | null
  labels: {
    title: string
    body: string
    accept: string
    reject: string
    policyLabel: string
    policyHref: string
  }
}) {
  const [consent, setConsent] = useState<Consent | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'accepted' || stored === 'rejected') setConsent(stored)
    setIsReady(true)
  }, [])

  const decide = (value: Consent) => {
    window.localStorage.setItem(STORAGE_KEY, value)
    setConsent(value)
  }

  return (
    <>
      {consent === 'accepted' && ga4Id && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4Id}');`}
          </Script>
        </>
      )}

      {isReady && consent === null && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label={labels.title}
          className="fixed inset-x-0 bottom-0 z-[55] border-t border-bar-border bg-surface shadow-[0_-1px_1px_rgba(0,0,0,0.2)]"
        >
          <div className="container-page flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-h3 font-medium text-ink">{labels.title}</p>
              <p className="mt-1 text-sm text-body">
                {labels.body}{' '}
                <a href={labels.policyHref} className="text-brand-blue underline">
                  {labels.policyLabel}
                </a>
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <button
                type="button"
                onClick={() => decide('rejected')}
                className="bg-surface-inactive px-6 py-3 text-nav font-medium text-ink transition-colors hover:bg-divider"
              >
                {labels.reject}
              </button>
              <button
                type="button"
                onClick={() => decide('accepted')}
                className="bg-teal px-6 py-3 text-nav font-medium text-white transition-colors hover:bg-brand-blue"
              >
                {labels.accept}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
