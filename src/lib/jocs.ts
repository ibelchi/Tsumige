import { getSupabase } from '@/lib/supabase'
import type { ResumJocs } from '@/lib/database.types'

export async function getResumJocs(): Promise<ResumJocs> {
  const supabase = getSupabase()
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw new Error('No s’ha pogut comprovar la sessió.')
  if (!session) throw new Error('Inicia sessió per consultar el resum de la col·lecció.')
  const { data, error } = await supabase.rpc('resum_jocs').single()
  if (error) throw new Error('No s’ha pogut carregar el resum. Comprova la connexió i les migracions de Supabase.')
  const ids = [...new Set([...data.jugant, ...data.per_jugar_aviat].map(game => game.id))]
  if (!ids.length) return data
  const { data: covers, error: coverError } = await supabase.from('fitxes_joc').select('id,portada_url').in('id', ids)
  if (coverError) throw new Error('No s’han pogut carregar les portades del resum. Torna-ho a provar.')
  const images = new Map(covers.map(game => [game.id, game.portada_url]))
  const withCover = (game: ResumJocs['jugant'][number]) => ({ ...game, portada_url: images.get(game.id) ?? null })
  return { ...data, jugant: data.jugant.map(withCover), per_jugar_aviat: data.per_jugar_aviat.map(withCover) }
}
