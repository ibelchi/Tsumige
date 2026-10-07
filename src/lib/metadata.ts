import { getSupabase } from '@/lib/supabase'
export type MetadataProvider = 'igdb' | 'rawg'
export type GameMetadata = { id: number; title: string; year: number | null; image: string | null; developers: string[]; genres: string[]; description: string | null; platforms: string[]; source: MetadataProvider; sourceUrl: string }
export function metadataError(provider: MetadataProvider, status?: number, payload?: unknown): string {
  const name = provider.toUpperCase()
  const info = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {}
  // Do not display arbitrary upstream text, which could contain credentials.
  if (status === 401) return `La consulta de ${name} no ha pogut validar la sessió (401).`
  if (status === 403) return `El servidor no permet consultar ${name} des d’aquesta adreça (403).`
  if (status === 404) return info.error === 'Joc no disponible' ? `${name} ja no té disponible aquest joc (404).` : `No s’ha trobat la funció de consulta de ${name} a Supabase (404). Comprova el nom del desplegament.`
  if (status === 503 && info.error === `Falta configurar ${name} a Supabase`) return `La funció de ${name} no troba les credencials a Supabase (503). Comprova els noms dels secrets.`
  if (status === 400) return `${name} no ha acceptat aquesta consulta (400). Prova un altre nom.`
  if (status === 429) return `S’han fet massa consultes a ${name} (429). Espera una mica i torna-ho a provar.`
  if (status === 502) return `La funció de ${name} ha rebut la consulta, però no ha pogut completar la connexió amb el proveïdor (502).`
  if (status) return `La consulta de ${name} ha fallat al servidor (${status}).`
  return `No s’ha pogut contactar amb la consulta de ${name}. Pot ser un problema de connexió o del desplegament.`
}
async function request(provider: MetadataProvider, body: { action: 'search'; query: string } | { action: 'detail'; id: number }) {
  const { data, error, response } = await getSupabase().functions.invoke(provider === 'igdb' ? 'bright-worker' : 'game-metadata', { body })
  if (error || data?.error) {
    let payload: unknown = data
    if (response) { try { payload = await response.clone().json() } catch { /* Response may not be JSON. */ } }
    throw new Error(metadataError(provider, response?.status, payload))
  }
  return data as { results?: GameMetadata[]; game?: GameMetadata }
}
export async function searchMetadata(provider: MetadataProvider, query: string) { return (await request(provider, { action: 'search', query })).results ?? [] }
export async function getMetadata(provider: MetadataProvider, id: number) { const game = (await request(provider, { action: 'detail', id })).game; if (!game) throw new Error('No s’han pogut obtenir les dades del joc.'); return game }
