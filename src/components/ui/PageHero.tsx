/**
 * İç sayfa hero'su. Referans sitedeki desen: tam genişlik koyu lacivert zemin,
 * ortalanmış beyaz başlık, ~220px yükseklik, hafif geometrik desen.
 * Kaynak: docs/design-reference/13-about-page.png
 */
export function PageHero({ title, subtitle }: { title: string; subtitle?: string | null }) {
  return (
    <div className="relative overflow-hidden bg-navy">
      {/* Referanstaki soluk diyagonal desen */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.07]"
        style={{
          background:
            'radial-gradient(circle at 70% 20%, #49a5e6 0%, transparent 45%), linear-gradient(115deg, transparent 45%, #ffffff 46%, transparent 47%)',
        }}
      />
      <div className="container-page relative flex min-h-[--hero-inner-height] flex-col items-center justify-center py-12 text-center">
        <h1 className="text-h2 font-bold text-white md:text-h1">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-white/75">{subtitle}</p>}
      </div>
    </div>
  )
}
