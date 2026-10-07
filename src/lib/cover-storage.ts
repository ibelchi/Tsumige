import { getSupabase } from '@/lib/supabase'
import type { FitxaJoc } from '@/lib/database.types'
export const COVER_BUCKET = 'tsumige-portades'
export async function coverUrl(game: FitxaJoc) {
  if (!game.portada_fitxer) return game.portada_url ?? ''
  const { data, error } = await getSupabase().storage.from(COVER_BUCKET).createSignedUrl(game.portada_fitxer, 3600)
  if (error) throw new Error('No s’ha pogut carregar una portada recuperada. Torna a iniciar sessió o actualitza la pàgina.')
  return data.signedUrl
}
export async function withStoredCovers(games: FitxaJoc[]) {
  const paths = [...new Set(games.flatMap(game => game.portada_fitxer ? [game.portada_fitxer] : []))]
  if (!paths.length) return games
  const { data, error } = await getSupabase().storage.from(COVER_BUCKET).createSignedUrls(paths, 3600)
  if (error || data?.some(row => row.error)) throw new Error('No s’han pogut carregar les portades recuperades. Actualitza la pàgina.')
  const urls = new Map(data?.map(row => [row.path, row.signedUrl]))
  return games.map(game => ({ ...game, portada_visual_url: game.portada_fitxer ? urls.get(game.portada_fitxer) ?? undefined : undefined }))
}
