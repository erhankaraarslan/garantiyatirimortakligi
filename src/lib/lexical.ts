/** Lexical JSON içinden düz metin çıkarır (boş içerik tespiti için). */
export function lexicalPlainText(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  const value = node as Record<string, unknown>
  if (typeof value.text === 'string') return value.text
  if (Array.isArray(value.children)) return value.children.map(lexicalPlainText).join(' ')
  if (value.root) return lexicalPlainText(value.root)
  return ''
}

export function lexicalHasReadableText(data: unknown, minLength = 40): boolean {
  return lexicalPlainText(data).replace(/\s+/g, ' ').trim().length >= minLength
}

const FOUNDING_COPY =
  /tescil edil|9\s*Temmuz\s*1996|tarihinde İstanbul|established in Istanbul|July\s*9,?\s*1996/i

function clipParagraph(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).replace(/\s+\S*$/, '')}…`
}

/** Lexical gövdenin ilk anlamlı paragrafını düz metin olarak döndürür. */
export function firstLexicalParagraph(data: unknown, maxLength = 320): string {
  if (!data || typeof data !== 'object') return ''
  const root = (data as { root?: { children?: unknown[] } }).root
  const paragraphs: string[] = []
  for (const child of root?.children ?? []) {
    const text = lexicalPlainText(child).replace(/\s+/g, ' ').trim()
    if (text.length < 40) continue
    paragraphs.push(text)
  }
  const preferred = paragraphs.find((text) => !FOUNDING_COPY.test(text))
  if (preferred) return clipParagraph(preferred, maxLength)
  return ''
}
