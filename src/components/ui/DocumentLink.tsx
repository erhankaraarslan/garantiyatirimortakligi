import { formatBytes } from '../../lib/utils'
import type { Document } from '../../payload-types'

/**
 * PDF bağlantısı. Boyut ve dosya tipi etiketi gösteriyoruz; eski sitede
 * kullanıcı neye tıkladığını bilmiyordu (268 MB'lık arşivde bazı dosyalar
 * 15 MB'a kadar çıkıyor, mobilde uyarı olmadan indirmek kötü deneyim).
 */
export function DocumentLink({
  document,
  label,
  locale,
}: {
  document: Document | number
  label?: string | null
  locale: 'tr' | 'en'
}) {
  if (typeof document !== 'object' || !document.url) return null

  const size = formatBytes(document.filesize)
  const extension = document.filename?.split('.').pop()?.toUpperCase() ?? 'PDF'
  const text = label || document.title || document.filename || extension
  const newTabLabel = locale === 'tr' ? 'yeni sekmede açılır' : 'opens in a new tab'

  return (
    <a
      href={document.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-3 border-b border-divider/60 py-2.5 last:border-b-0"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="mt-0.5 h-5 w-5 shrink-0 text-brand-blue"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M14 2.5H7A1.5 1.5 0 005.5 4v16A1.5 1.5 0 007 21.5h10a1.5 1.5 0 001.5-1.5V7z" />
        <path d="M14 2.5V7h4.5" />
      </svg>
      <span className="flex-1">
        <span className="text-base text-brand-blue underline-offset-2 group-hover:underline">
          {text}
        </span>
        <span className="ml-2 whitespace-nowrap text-xs text-muted">
          {extension}
          {size && ` · ${size}`}
        </span>
        <span className="sr-only"> ({newTabLabel})</span>
      </span>
    </a>
  )
}
