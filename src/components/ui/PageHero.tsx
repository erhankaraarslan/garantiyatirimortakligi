/**
 * İç sayfa kahramanı. Banka içerik sayfalarındaki ~240px lacivert şerit:
 * Benton Bold 48px başlık, sola hizalı.
 */
export function PageHero({ title, subtitle }: { title: string; subtitle?: string | null }) {
  return (
    <div className="relative overflow-hidden bg-navy">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          background:
            'radial-gradient(circle at 82% 0%, #02a5a5 0%, transparent 38%), linear-gradient(115deg, transparent 58%, rgba(255,255,255,0.12) 59%, transparent 62%)',
        }}
      />
      <div className="container-page relative flex min-h-[var(--hero-inner-height)] flex-col justify-center py-12">
        <h1 className="max-w-4xl text-h1 text-white">{title}</h1>
        {subtitle && (
          <p className="mt-3 max-w-2xl text-[17px] font-medium leading-7 text-white/75">{subtitle}</p>
        )}
      </div>
    </div>
  )
}
