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
