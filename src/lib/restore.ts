import { getSupabase } from '@/lib/supabase'
import { getBackup, type Backup } from '@/lib/backup'
import { COVER_BUCKET } from '@/lib/cover-storage'
import type { Json } from '@/lib/database.types'
import type { RestoreArchive } from '@/lib/restore-archive'
export const restoreTables = ['fitxes_joc', 'exemplars', 'experiencies', 'proposits'] as const
export type RestorePreview = { current: Backup; state: string; rows: { table: string; added: number; existing: number }[] }
async function state() {
  const { data, error } = await getSupabase().rpc('estat_restauracio')
  if (error || !data) throw new Error('La restauració encara no està configurada al servidor, o no s’hi pot contactar.')
  return data
}
export async function previewRestore(archive: RestoreArchive): Promise<RestorePreview> {
  const before = await state()
  const current = await getBackup()
  if (archive.backup.user_id !== current.user_id) throw new Error('La sessió ha canviat. Torna a obrir la còpia.')
  const after = await state()
  if (before !== after) throw new Error('Les dades han canviat mentre es preparava la revisió. Torna-ho a provar.')
  for (const game of archive.backup.fitxes_joc) {
    if (current.fitxes_joc.some(existing => existing.id !== game.id && existing.nom.toLocaleLowerCase() === game.nom.toLocaleLowerCase() && existing.plataforma.toLocaleLowerCase() === game.plataforma.toLocaleLowerCase())) {
      throw new Error(`«${game.nom}» ja existeix amb un altre identificador. Cal revisar aquesta coincidència abans de restaurar.`)
    }
  }
  return {current, state: after, rows: restoreTables.map(table => {
    const ids = new Set(current[table].map(row => row.id))
    return {table, added: archive.backup[table].filter(row => !ids.has(row.id)).length, existing: archive.backup[table].filter(row => ids.has(row.id)).length}
  })}
}
export async function restoreArchive(archive: RestoreArchive, preview: RestorePreview, overwrite: boolean, onProgress: (text: string) => void) {
  const db = getSupabase()
  const { data: { session } } = await db.auth.getSession()
  if (session?.user.id !== archive.backup.user_id) throw new Error('La sessió ha canviat. Torna a preparar la restauració.')
  const { data: editable } = await db.rpc('pot_editar')
  if (!editable) throw new Error('Els convidats no poden restaurar còpies.')
  if (await state() !== preview.state) throw new Error('Les dades han canviat. Torna a revisar la còpia abans de restaurar.')
  const payload = structuredClone(archive.backup)
  const existing = new Set(preview.current.fitxes_joc.map(game => game.id))
  const covers = archive.covers.filter(cover => overwrite || !existing.has(cover.gameId))
  const run = crypto.randomUUID()
  const uploaded = new Map<string, string>()
  for (let index = 0; index < covers.length; index++) {
    const cover = covers[index]
    onProgress(`Recuperant portades: ${index + 1} de ${covers.length}…`)
    let path = uploaded.get(cover.file)
    if (!path) {
      path = `${session.user.id}/${run}/${cover.file.split('/').pop()}`
      const { error } = await db.storage.from(COVER_BUCKET).upload(path, new Blob([new Uint8Array(cover.bytes).buffer], { type: cover.mime }), {contentType: cover.mime, upsert: false})
      if (error) throw new Error('No s’ha pogut guardar una portada. Les dades no s’han restaurat; torna-ho a provar.')
      uploaded.set(cover.file, path)
    }
    payload.fitxes_joc.find(game => game.id === cover.gameId)!.portada_fitxer = path
  }
  onProgress('Restaurant les dades…')
  const { error } = await db.rpc('restaurar_copia', {p_copia: payload as unknown as Json, p_actualitzar: overwrite, p_estat: preview.state})
  if (error) throw new Error('No s’ha pogut confirmar la restauració. Actualitza la pàgina i comprova les dades abans de tornar-ho a provar. Si han canviat des de la revisió, prepara-la de nou.')
  return covers.length
}
