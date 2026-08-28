import { cn } from '../../lib/utils'
import { sanitizeLegacyHtml } from '../../lib/sanitizeHtml'

/**
 * Lexical'in bozduğu iç içe tabloları, eski siteden temizlenmiş HTML olarak
 * çizer. Yatay kaydırma mobilde 890px'lik form tablolarını okunur tutar.
 */
export function HtmlContent({ html, className }: { html: string; className?: string }) {
  const safe = sanitizeLegacyHtml(html)
  if (!safe.trim()) return null

  return (
    <div
      className={cn(
        'legacy-html overflow-x-auto text-base leading-relaxed text-body',
        '[&>table]:min-w-[52rem]',
        '[&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-h2 [&_h2]:text-ink',
        '[&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-h3 [&_h3]:font-medium [&_h3]:text-ink',
        '[&_p]:mb-3',
        '[&_strong]:font-medium [&_strong]:text-ink',
        '[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5',
        '[&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5',
        '[&_li]:mb-1',
        '[&_a]:text-brand-blue [&_a]:underline [&_a:hover]:text-brand-blue-mid',
        '[&_img]:my-4 [&_img]:h-auto [&_img]:max-w-full',
        '[&_table]:mb-4 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm',
        '[&_table_table]:mb-2 [&_table_table]:min-w-0 [&_table_table]:text-xs',
        '[&_th]:border [&_th]:border-divider [&_th]:bg-surface-alt [&_th]:p-2 [&_th]:text-left [&_th]:font-medium [&_th]:text-ink',
        '[&_td]:border [&_td]:border-divider [&_td]:p-2 [&_td]:align-top',
        '[&_td>p]:mb-2 last:[&_td>p]:mb-0',
        className,
      )}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  )
}
