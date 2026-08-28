import {
  RichText as LexicalRichText,
  TableJSXConverter,
} from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'

import { cn } from '../../lib/utils'

const converters: JSXConvertersFunction = ({ defaultConverters: defaults }) => ({
  ...defaults,
  ...TableJSXConverter,
  table: (args) => (
    <div className="mb-6 max-w-full overflow-x-auto">
      {TableJSXConverter.table(args)}
    </div>
  ),
})

/**
 * Lexical içeriğini render eder. Tipografi kuralları `prose` sınıfında değil
 * doğrudan burada tanımlı; Tailwind typography eklentisi kullanmıyoruz çünkü
 * BBVA ölçeği (H2 light, 15px gövde) varsayılanlardan belirgin şekilde farklı.
 */
export function RichText({
  data,
  className,
}: {
  data?: SerializedEditorState | null
  className?: string
}) {
  if (!data) return null

  return (
    <div
      className={cn(
        'text-base leading-relaxed text-body',
        '[&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-h2 [&_h2]:text-ink',
        '[&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-h3 [&_h3]:font-medium [&_h3]:text-ink',
        '[&_h4]:mb-2 [&_h4]:mt-5 [&_h4]:font-medium [&_h4]:text-ink',
        '[&_p]:mb-4',
        '[&_strong]:font-medium [&_strong]:text-ink',
        '[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5',
        '[&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5',
        '[&_li]:mb-1',
        '[&_a]:text-brand-blue [&_a]:underline [&_a:hover]:text-brand-blue-mid',
        '[&_table]:mb-6 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm',
        '[&_th]:border [&_th]:border-divider [&_th]:bg-surface-alt [&_th]:p-2 [&_th]:text-left [&_th]:font-medium [&_th]:text-ink',
        '[&_td]:border [&_td]:border-divider [&_td]:p-2 [&_td]:align-top',
        '[&_hr]:my-8 [&_hr]:border-divider',
        '[&_.lexical-table-container]:max-w-full [&_.lexical-table-container]:overflow-x-auto',
        className,
      )}
    >
      <LexicalRichText data={data} converters={converters} />
    </div>
  )
}
