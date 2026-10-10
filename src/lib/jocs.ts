import { getSupabase } from '@/lib/supabase'
import type { ResumJocs } from '@/lib/database.types'
import { getCatalog } from '@/lib/catalog'
import { collectionCopy, platformName } from '@/lib/platform'

export async function getResumJocs(): Promise<ResumJocs> {
  const supabase = getSupabase()
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw new Error('No s’ha pogut comprovar la sessió.')
  if (!session) throw new Error('Inicia sessió per consultar el resum de la col·lecció.')
  const { data, error } = await supabase.rpc('resum_jocs').single()
  if (error) throw new Error('No s’ha pogut carregar el resum. Comprova la connexió i les migracions de Supabase.')
  const catalog = await getCatalog()
  const games = new Map(catalog.jocs.map(game => [game.id, game]))
  const active = catalog.exemplars.filter(copy => collectionCopy(copy, games.get(copy.joc_id)))
  const withCover = (game: ResumJocs['jugant'][number]) => ({ ...game, plataforma: platformName(game.plataforma), portada_url: games.get(game.id)?.portada_visual_url ?? games.get(game.id)?.portada_url ?? null })
  return { ...data, fisics: active.filter(copy => copy.format === 'fisic').length, digitals: active.filter(copy => copy.format === 'digital').length,
    jugant: data.jugant.map(withCover), per_jugar_aviat: data.per_jugar_aviat.map(withCover) }
}
