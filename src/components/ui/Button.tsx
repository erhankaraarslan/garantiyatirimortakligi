import type { ButtonHTMLAttributes } from 'react'

import { cn } from '../../lib/utils'

/**
 * Garanti BBVA buton tipleri (www.garantibbva.com.tr):
 * - primary  → .button.primary (#004481, 48px) — Giriş Yap
 * - accent   → .button.btn-medium (#02A5A5, 56px) — Detaylı Bilgi
 * - secondary → beyaz zemin, 1px #E1E1E1, metin #1973B8
 * - ghost    → dolgusuz, 48px
 */
export const buttonVariants = {
  primary:
    'inline-flex h-12 shrink-0 items-center justify-center rounded-btn bg-brand-navy px-4 text-[15px] font-medium leading-[22px] text-white transition-colors hover:bg-brand-navy-mid disabled:opacity-60',
  accent:
    'inline-flex h-14 shrink-0 items-center justify-center rounded-btn bg-teal px-6 text-[15px] font-medium leading-8 text-white transition-colors hover:bg-teal-dark disabled:opacity-60',
  secondary:
    'inline-flex h-12 shrink-0 items-center justify-center rounded-btn border border-control bg-surface px-4 text-[15px] font-medium leading-[22px] text-brand-blue-light transition-colors hover:bg-surface-alt disabled:opacity-60',
  ghost:
    'inline-flex h-12 shrink-0 items-center justify-center px-[11px] text-[15px] font-medium leading-[22px] text-brand-navy transition-colors hover:underline',
} as const

export type ButtonVariant = keyof typeof buttonVariants

export function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button className={cn(buttonVariants[variant], className)} {...props} />
}
