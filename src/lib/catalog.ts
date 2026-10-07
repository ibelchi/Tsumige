import { getSupabase } from '@/lib/supabase'
import type { Exemplar, Experiencia, FitxaJoc, Json } from '@/lib/database.types'

export type Catalog = { jocs: FitxaJoc[]; exemplars: Exemplar[]; experiencies: Experiencia[] }
export async function getCatalog(): Promise<Catalog> {
  const db = getSupabase()
  const [jocs, exemplars, experiencies] = await Promise.all([
    db.from('fitxes_joc').select('*').order('nom'),
    db.from('exemplars').select('*').order('created_at').order('id'),
    db.from('experiencies').select('*').order('any_jugat', { ascending: false, nullsFirst: false }).order('id'),
  ])
  if (jocs.error || exemplars.error || experiencies.error) throw new Error('No s’han pogut carregar els jocs. Torna-ho a provar.')
  return { jocs: jocs.data, exemplars: exemplars.data, experiencies: experiencies.data }
}
export async function saveRecord(kind: 'exemplar' | 'experiencia', id: string, game: Json, record: Json) {
  const { error } = await getSupabase().rpc('desar_registre', { p_tipus: kind, p_id: id, p_fitxa: game, p_dades: record })
  if (error) throw new Error('No s’han pogut desar els canvis. Comprova els camps i torna-ho a provar.')
}
export async function createRecord(kind: 'exemplar' | 'experiencia', gameId: string | null, game: Json, record: Json) {
  const { data, error } = await getSupabase().rpc('crear_registre', { p_tipus: kind, p_joc: gameId, p_fitxa: game, p_dades: record })
  if (error) throw new Error(error.message.includes('ja existeix') ? 'Aquest joc ja existeix amb aquesta plataforma. Torna enrere i selecciona’l a la llista de jocs existents.' : 'No s’ha pogut afegir el registre. Comprova els camps i torna-ho a provar.')
  if (!data) throw new Error('No s’ha pogut confirmar el registre creat.')
  return data
}

export async function setGamePlayingFromRecord(recordId: string, value: boolean, rating: Experiencia['valoracio'], kind: 'exemplar' | 'experiencia') {
  const db = getSupabase()
  const { data: auth } = await db.auth.getSession()
  const owner = auth.session?.user.id
  if (!owner) throw new Error('Cal iniciar sessió per actualitzar el seguiment.')
  const { data: copy, error: copyError } = await db.from(kind === 'exemplar' ? 'exemplars' : 'experiencies').select('*').eq('id', recordId).eq('user_id', owner).single()
  if (copyError || !copy) throw new Error('No s’ha pogut consultar el joc del registre.')
  if (!value) {
    const { error } = await db.from('experiencies').update({ jugant: false }).eq('joc_id', copy.joc_id).eq('user_id', owner).eq('jugant', true)
    if (error) throw new Error('Les dades s’han desat, però no s’ha pogut actualitzar «Hi estic jugant». Torna-ho a provar.')
    return
  }
  const { data: playing, error: readError } = await db.from('experiencies').select('id').eq('joc_id', copy.joc_id).eq('user_id', owner).eq('jugant', true)
  if (readError) throw new Error('No s’ha pogut comprovar «Hi estic jugant».')
  if (playing?.length) return
  // A current-playing marker never invents an annual history entry or edits past notes.
  const { error } = await db.from('experiencies').insert({ joc_id: copy.joc_id, user_id: owner, jugant: true, any_jugat: null, completat: null, valoracio: rating, notes: null })
  if (error) throw new Error('Les dades s’han desat, però no s’ha pogut marcar «Hi estic jugant». Torna-ho a provar.')
}
export async function removeFromCollection(id: string) {
  const { error } = await getSupabase().from('exemplars').update({ a_la_colleccio: false }).eq('id', id).eq('a_la_colleccio', true).select('id').single()
  if (error) throw new Error('No s’ha pogut retirar l’exemplar de la col·lecció.')
}
export async function restoreToCollection(id: string) {
  const { error } = await getSupabase().from('exemplars').update({ a_la_colleccio: true }).eq('id', id).eq('a_la_colleccio', false).select('id').single()
  if (error) throw new Error('No s’ha pogut recuperar l’exemplar. Actualitza la llista i torna-ho a provar.')
}

export async function setUpcoming(id: string, value: boolean) {
  const { error } = await getSupabase().from('fitxes_joc').update({ per_jugar_aviat: value }).eq('id', id)
  if (error) throw new Error('No s’ha pogut actualitzar Per jugar aviat.')
}
export async function setPlaying(id: string, value: boolean) {
  const { error } = await getSupabase().from('experiencies').update({ jugant: value }).eq('id', id)
  if (error) throw new Error('No s’ha pogut actualitzar Jugant.')
}
