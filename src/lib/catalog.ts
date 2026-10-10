import { getSupabase } from '@/lib/supabase'
import type { Exemplar, Experiencia, FitxaJoc, Json } from '@/lib/database.types'
import { withStoredCovers } from '@/lib/cover-storage'

export type Catalog = { jocs: FitxaJoc[]; exemplars: Exemplar[]; experiencies: Experiencia[]; plataformaModel?: 2 }
export async function getCatalog(): Promise<Catalog> {
  const db = getSupabase()
  async function readAll<T>(table: 'fitxes_joc' | 'exemplars' | 'experiencies'): Promise<T[]> {
    const rows: T[] = []
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await db.from(table).select('*').order('id').range(offset, offset + 499)
      if (error || !data) throw new Error('No s’han pogut carregar tots els jocs. Torna-ho a provar.')
      rows.push(...data as T[])
      if (data.length < 500) return rows
    }
  }
  const [jocs, exemplars, experiencies, version] = await Promise.all([
    readAll<FitxaJoc>('fitxes_joc'), readAll<Exemplar>('exemplars'), readAll<Experiencia>('experiencies'), db.rpc('versio_plataforma'),
  ])
  return { jocs: await withStoredCovers(jocs), exemplars, experiencies, plataformaModel: version.data === 2 ? 2 : undefined }
}
export async function saveRecord(kind: 'exemplar' | 'experiencia', id: string, game: Json, record: Json, resolved = false) {
  const { error } = await getSupabase().rpc(resolved ? 'desar_registre_plataforma' : 'desar_registre', { p_tipus: kind, p_id: id, p_fitxa: game, p_dades: record })
  if (error) throw new Error('No s’han pogut desar els canvis. Comprova els camps i torna-ho a provar.')
}
export async function createRecord(kind: 'exemplar' | 'experiencia', gameId: string | null, game: Json, record: Json, resolved = false) {
  const { data, error } = await getSupabase().rpc(resolved ? 'crear_registre_plataforma' : 'crear_registre', { p_tipus: kind, p_joc: gameId, p_fitxa: game, p_dades: record })
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
  // Ratings belong to the game, even when edited from a collection copy.
  // The database synchronizes existing experiences without inventing a played year.
  const { error: ratingError } = await db.from('fitxes_joc').update({ valoracio: rating }).eq('id', copy.joc_id).eq('user_id', owner).select('id').single()
  if (ratingError) throw new Error('Les dades s’han desat, però no s’ha pogut actualitzar la valoració del joc. Torna-ho a provar.')
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
