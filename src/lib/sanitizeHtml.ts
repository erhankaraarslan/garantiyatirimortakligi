/**
 * Göçten gelen HTML'i render etmeden önce tehlikeli etiket ve öznitelikleri
 * ayıklar. İçerik CMS'ten gelse de textarea alanı serbest metin.
 */
const BLOCKED_TAGS = /^(script|style|iframe|object|embed|link|meta|form|input|button|textarea)$/i

export function sanitizeLegacyHtml(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (match, tag: string) => {
      if (BLOCKED_TAGS.test(tag)) return ''
      if (match.startsWith('</')) return `</${tag.toLowerCase()}>`
      const attrs: string[] = []
      const href = match.match(/\bhref\s*=\s*("([^"]*)"|'([^']*)')/i)
      const src = match.match(/\bsrc\s*=\s*("([^"]*)"|'([^']*)')/i)
      const alt = match.match(/\balt\s*=\s*("([^"]*)"|'([^']*)')/i)
      const colspan = match.match(/\bcolspan\s*=\s*("([^"]*)"|'([^']*)'|(\d+))/i)
      const rowspan = match.match(/\browspan\s*=\s*("([^"]*)"|'([^']*)'|(\d+))/i)
      const scope = match.match(/\bscope\s*=\s*("([^"]*)"|'([^']*)')/i)
      const target = match.match(/\btarget\s*=\s*("([^"]*)"|'([^']*)')/i)

      const hrefValue = href?.[2] ?? href?.[3]
      if (hrefValue && !/^\s*javascript:/i.test(hrefValue)) {
        attrs.push(`href="${escapeAttr(hrefValue)}"`)
      }
      const srcValue = src?.[2] ?? src?.[3]
      if (srcValue && !/^\s*javascript:/i.test(srcValue)) {
        attrs.push(`src="${escapeAttr(srcValue)}"`)
      }
      const altValue = alt?.[2] ?? alt?.[3]
      if (altValue) attrs.push(`alt="${escapeAttr(altValue)}"`)
      const colspanValue = colspan?.[2] ?? colspan?.[3] ?? colspan?.[4]
      if (colspanValue) attrs.push(`colspan="${escapeAttr(colspanValue)}"`)
      const rowspanValue = rowspan?.[2] ?? rowspan?.[3] ?? rowspan?.[4]
      if (rowspanValue) attrs.push(`rowspan="${escapeAttr(rowspanValue)}"`)
      const scopeValue = scope?.[2] ?? scope?.[3]
      if (scopeValue) attrs.push(`scope="${escapeAttr(scopeValue)}"`)
      const targetValue = target?.[2] ?? target?.[3]
      if (targetValue === '_blank') {
        attrs.push('target="_blank"', 'rel="noopener noreferrer"')
      }

      return `<${tag.toLowerCase()}${attrs.length ? ` ${attrs.join(' ')}` : ''}>`
    })
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}
