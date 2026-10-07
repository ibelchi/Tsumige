import { getSupabase } from '@/lib/supabase'
import type { Database, Exemplar, Experiencia, FitxaJoc, Proposit } from '@/lib/database.types'

export type Backup = { app: 'tsumige'; format_version: 1; exported_at: string; user_id: string; fitxes_joc: FitxaJoc[]; exemplars: Exemplar[]; experiencies: Experiencia[]; proposits: Proposit[] }
export async function getBackup(): Promise<Backup> {
  const db = getSupabase()
  const { data: { session } } = await db.auth.getSession()
  if (!session) throw new Error('Cal iniciar sessió per descarregar la còpia.')
  const owner = session.user.id
  async function readAll<T>(table: keyof Pick<Database['public']['Tables'], 'fitxes_joc' | 'exemplars' | 'experiencies' | 'proposits'>): Promise<T[]> {
    const rows: T[] = []
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await db.from(table).select('*').eq('user_id', owner).order('id').range(offset, offset + 499)
      if (error || !data) throw new Error('No s’ha pogut preparar la còpia completa. Torna-ho a provar.')
      rows.push(...data as T[])
      if (data.length < 500) return rows
    }
  }
  const [fitxes_joc, exemplars, experiencies, proposits] = await Promise.all([readAll<FitxaJoc>('fitxes_joc'), readAll<Exemplar>('exemplars'), readAll<Experiencia>('experiencies'), readAll<Proposit>('proposits')])
  const { data: current } = await db.auth.getSession()
  if (current.session?.user.id !== owner) throw new Error('La sessió ha canviat. Torna a preparar la còpia.')
  return { app: 'tsumige', format_version: 1, exported_at: new Date().toISOString(), user_id: owner, fitxes_joc, exemplars, experiencies, proposits }
}
// Kept for the archived one-off import tools; Settings exports the ZIP instead.
export function downloadBackup(backup: Backup) {
  downloadFile(JSON.stringify(backup, null, 2), `tsumige-${backup.exported_at.replace(/[:.]/g, '-')}.json`, 'application/json;charset=utf-8')
}
export function downloadFile(content: string, filename: string, mime: string) {
  downloadBlob(new Blob([content], { type: mime }), filename)
}
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  // Give the browser time to begin the download before releasing the blob.
  window.setTimeout(() => URL.revokeObjectURL(url), 60000)
}
