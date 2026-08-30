/**
 * Ana menüden üst seviye “İnsan Kaynakları” kalemini kaldırır;
 * Kurumsal mega menüye taşır (ana sayfa kartı ve footer durur).
 *
 * Kullanım: pnpm exec tsx --env-file=.env scripts/legacy/update-nav-drop-hr.ts
 */
import { getPayload } from 'payload'

import config from '../../src/payload.config'

function isHrLabel(label: string | null | undefined) {
  const value = (label ?? '').trim()
  return value === 'İnsan Kaynakları' || value === 'Human Resources'
}

function isCorporateLabel(label: string | null | undefined) {
  const value = (label ?? '').trim()
  return value === 'Kurumsal' || value === 'Corporate'
}

function pageId(page: unknown): number | null {
  if (typeof page === 'number') return page
  if (page && typeof page === 'object' && 'id' in page && typeof page.id === 'number') return page.id
  return null
}

async function main() {
  const payload = await getPayload({ config })

  const navTr = await payload.findGlobal({ slug: 'navigation', locale: 'tr', depth: 0 })
  const hrPage =
    pageId((navTr.mainMenu ?? []).find((item) => isHrLabel(item.label))?.page) ??
    (navTr.mainMenu ?? [])
      .flatMap((item) => item.columns ?? [])
      .flatMap((column) => column.links ?? [])
      .map((link) => (isHrLabel(link.label) ? pageId(link.page) : null))
      .find((id) => id != null) ??
    null

  for (const locale of ['tr', 'en'] as const) {
    const nav = await payload.findGlobal({ slug: 'navigation', locale, depth: 0 })
    const hrLabel = locale === 'tr' ? 'İnsan Kaynakları' : 'Human Resources'

    const mainMenu = (nav.mainMenu ?? [])
      .filter((item) => !isHrLabel(item.label))
      .map((item) => {
        if (!isCorporateLabel(item.label) || hrPage == null) return item

        const hasHr = (item.columns ?? []).some((column) =>
          (column.links ?? []).some((link) => pageId(link.page) === hrPage || isHrLabel(link.label)),
        )

        const columns = (item.columns ?? []).map((column, index) => {
          const links = (column.links ?? []).map((link) =>
            pageId(link.page) === hrPage ? { ...link, label: hrLabel } : link,
          )
          if (hasHr || index !== 0) return { ...column, links }

          const after = links.findIndex(
            (link) =>
              link.label === 'Vizyon ve Misyon' || link.label === 'Vision and Mission',
          )
          const hrLink = { label: hrLabel, type: 'page' as const, page: hrPage }
          const nextLinks =
            after >= 0
              ? [...links.slice(0, after + 1), hrLink, ...links.slice(after + 1)]
              : [...links, hrLink]
          return { ...column, links: nextLinks }
        })

        return { ...item, columns }
      })

    await payload.updateGlobal({
      slug: 'navigation',
      locale,
      data: { mainMenu },
    })
    console.log(`  ${locale}: İK üst menüde yok, Kurumsal altında “${hrLabel}”`)
  }

  console.log('Ana menü: İnsan Kaynakları üst seviyeden çıktı')
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
