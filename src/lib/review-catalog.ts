import { getSupabase } from '@/lib/supabase'
import { withStoredCovers } from '@/lib/cover-storage'
import type { Catalog } from '@/lib/catalog'
import type { Exemplar, Experiencia, FitxaJoc } from '@/lib/database.types'

export async function getReviewCatalog(): Promise<Catalog> {
  const db = getSupabase()
  const { data: { session } } = await db.auth.getSession()
  if (!session) throw new Error('Cal iniciar sessió per consultar els camps buits.')
  const owner = session.user.id
  const { data: canEdit, error: accessError } = await db.rpc('pot_editar')
  if (accessError || canEdit !== true) throw new Error('Aquesta consulta està reservada al propietari.')
  const { data: before, error: snapshotError } = await db.rpc('estat_restauracio')
  if (snapshotError || typeof before !== 'string') throw new Error('No s’ha pogut comprovar l’estat de les dades per fer una lectura completa.')
  async function readAll<T>(table: 'fitxes_joc' | 'exemplars' | 'experiencies'): Promise<T[]> {
    const rows: T[] = []
    let expected: number | undefined
    for (;;) {
      const { data, error, count } = await db.from(table).select('*', { count: 'exact' }).eq('user_id', owner).order('id').range(rows.length, rows.length + 499)
      if (error || !data || count === null || (expected !== undefined && count !== expected)) throw new Error('No s’han pogut comprovar tots els registres. Torna-ho a provar.')
      expected = count
      rows.push(...data as T[])
      if (rows.length === expected) return rows
      if (!data.length || rows.length > expected) throw new Error('La lectura és incompleta. Torna a carregar la consulta.')
    }
  }
  const [jocs, exemplars, experiencies] = await Promise.all([readAll<FitxaJoc>('fitxes_joc'), readAll<Exemplar>('exemplars'), readAll<Experiencia>('experiencies')])
  const { data: after, error: changedError } = await db.rpc('estat_restauracio')
  if (changedError || before !== after) throw new Error('Les dades han canviat durant la lectura. Torna a carregar la consulta.')
  const { data: current } = await db.auth.getSession()
  if (current.session?.user.id !== owner) throw new Error('La sessió ha canviat. Torna a carregar la consulta.')
  const { data: version } = await db.rpc('versio_plataforma')
  return { jocs: await withStoredCovers(jocs), exemplars, experiencies, plataformaModel: version === 2 ? 2 : undefined }
}
