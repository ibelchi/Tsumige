export type Source = 'articles' | 'analyses' | 'general'
export type Reading = { title: string; url: string; date: string; categories: string[]; sources: Source[] }
export const feeds: Record<Source, string> = {
  articles: 'https://www.anaitgames.com/articulos/feed',
  analyses: 'https://www.anaitgames.com/analisis/feed',
  general: 'https://www.anaitgames.com/feed',
}
export const SIX_HOURS = 6 * 60 * 60 * 1000
function decode(value: string): string {
  return value.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (match, entity: string) => {
    const named: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }
    if (!entity.startsWith('#')) return named[entity.toLowerCase()] ?? match
    const code = entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1))
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : ''
  })
}
export function normalizeUrl(raw: string): string {
  const url = new URL(raw)
  if (!['http:', 'https:'].includes(url.protocol) || !['anaitgames.com', 'www.anaitgames.com'].includes(url.hostname) || url.username || url.password) throw new Error('URL no permesa')
  url.protocol = 'https:'; url.hostname = 'www.anaitgames.com'; url.hash = ''; url.port = ''
  for (const key of [...url.searchParams.keys()]) if (/^(utm_|fbclid$|gclid$)/i.test(key)) url.searchParams.delete(key)
  url.searchParams.sort()
  url.pathname = url.pathname.replace(/\/+$/, '') || '/'
  return url.href
}
// Parser limitat a RSS 2.0: no interpreta DTD, entitats externes ni HTML.
export function parseFeed(xml: string, source: Source): Reading[] {
  xml = xml.replace(/<!--[\s\S]*?-->/g, '')
  if (/<!DOCTYPE|<!ENTITY/i.test(xml) || !/<rss\b/i.test(xml) || !/<\/rss>\s*$/i.test(xml)) throw new Error('RSS invàlid')
  const items = [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/g)]
  if ((xml.match(/<item\b/g) ?? []).length !== items.length) throw new Error('RSS incomplet')
  return items.flatMap(([, item]) => {
    const field = (name: string) => [...item.matchAll(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, 'g'))].map((m) => {
      const text = m[1].trim()
      return text.startsWith('<![CDATA[') && text.endsWith(']]>') ? decode(text.slice(9, -3)).trim() : decode(text).trim()
    })
    const title = field('title')[0], link = field('link')[0], date = field('pubDate')[0], categories = field('category')
    if (!title || !link || !date || !Number.isFinite(Date.parse(date))) return []
    try {
      const url = normalizeUrl(link)
      if (categories.some((c) => ['Podcast', 'Recarga Activa', 'Podcast Reload'].includes(c)) || /\/podcast(?:\/|$)/i.test(decodeURIComponent(new URL(url).pathname))) return []
      return [{ title, url, date: new Date(date).toISOString(), categories, sources: [source] }]
    } catch { return [] }
  })
}
export function mergeReadings(entries: Reading[]): Reading[] {
  const map = new Map<string, Reading>()
  for (const entry of entries) {
    const old = map.get(entry.url)
    map.set(entry.url, old ? { ...old, categories: [...new Set([...old.categories, ...entry.categories])], sources: [...new Set([...old.sources, ...entry.sources])] } : entry)
  }
  return [...map.values()].sort((a, b) => Date.parse(b.date) - Date.parse(a.date) || a.url.localeCompare(b.url))
}
export function selectReadings(entries: Reading[]): Reading[] {
  return mergeReadings(entries).slice(0, 3)
}
export function createFeedLoader(fetcher: typeof fetch = fetch, now = Date.now) {
  let cache: { entries: Reading[]; partial: boolean; stale: boolean } | undefined
  let expires = 0
  let failedUntil = 0
  let pending: Promise<NonNullable<typeof cache>> | undefined
  return async () => {
    if (cache && now() < expires) return cache
    if (now() < failedUntil) throw new Error('Lectures no disponibles')
    if (pending) return pending
    pending = (async () => {
      const results = await Promise.allSettled(Object.entries(feeds).map(async ([source, url]) => {
        const response = await fetcher(url, { signal: AbortSignal.timeout(12000), headers: { Accept: 'application/rss+xml, application/xml, text/xml' } })
        if (!response.ok) throw new Error('Font no disponible')
        // Limita també respostes sense Content-Length.
        const reader = response.body?.getReader(); if (!reader) throw new Error('RSS buit')
        const chunks: Uint8Array[] = []; let size = 0
        try { while (true) { const { done, value } = await reader.read(); if (done) break; size += value.length; if (size > 3_000_000) throw new Error('RSS massa gran'); chunks.push(value) } } finally { await reader.cancel() }
        const decoder = new TextDecoder(); const xml = chunks.map((c) => decoder.decode(c, { stream: true })).join('') + decoder.decode()
        const entries = parseFeed(xml, source as Source)
        if (!entries.length) throw new Error('Font sense lectures elegibles')
        return entries
      }))
      const entries = mergeReadings(results.flatMap((r) => r.status === 'fulfilled' ? r.value : []))
      const partial = results.some((r) => r.status === 'rejected')
      if (!entries.length) {
        if (!cache) { failedUntil = now() + 60_000; throw new Error('Lectures no disponibles') }
        cache = { ...cache, stale: true }; expires = now() + 300_000; return cache
      }
      cache = { entries, partial, stale: false }; expires = now() + (partial ? 300_000 : SIX_HOURS); return cache
    })()
    try { return await pending } finally { pending = undefined }
  }
}
