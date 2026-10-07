import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'
import { useAccess } from '@/lib/access'
import { readRestoreArchive, type RestoreArchive } from '@/lib/restore-archive'
import { previewRestore, restoreArchive, type RestorePreview } from '@/lib/restore'
import { buildBackupArchive } from '@/lib/backup-archive'
import { downloadBlob, getBackup } from '@/lib/backup'
import { coverUrl } from '@/lib/cover-storage'
const labels: Record<string, string> = {fitxes_joc: 'Jocs', exemplars: 'Exemplars', experiencies: 'Entrades de Bitàcora', proposits: 'Propòsits'}
export function BackupRestore() {
  const { session } = useAuth()
  const { canEdit } = useAccess()
  const client = useQueryClient()
  const [archive, setArchive] = useState<RestoreArchive | null>(null)
  const [preview, setPreview] = useState<RestorePreview | null>(null)
  const [overwrite, setOverwrite] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  async function read(file?: File) {
    if (!file || !session) return
    setArchive(null); setPreview(null); setError(''); setMessage(''); setConfirmed(false); setOverwrite(false); setBusy(true)
    try {
      if (file.size > 230 * 1024 * 1024) throw new Error('El ZIP supera 230 MB.')
      setProgress('Comprovant la còpia…')
      const next = await readRestoreArchive(new Uint8Array(await file.arrayBuffer()), session.user.id)
      const plan = await previewRestore(next)
      setArchive(next); setPreview(plan)
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'No s’ha pogut llegir la còpia.') }
    finally { setBusy(false); setProgress('') }
  }
  async function restore() {
    if (!archive || !preview || busy || !confirmed || !canEdit) return
    setBusy(true); setError(''); setMessage('')
    try {
      if (overwrite) {
        setProgress('Preparant una còpia de les dades actuals…')
        const current = await getBackup()
        const saved = await buildBackupArchive(current, undefined, fetch, coverUrl)
        if (saved.failed.length) throw new Error('No s’ha pogut preparar una còpia completa de les portades actuals. No s’ha aplicat la restauració; torna-ho a intentar o conserva els registres existents.')
        // The download is a safeguard, not a guarantee that the browser saved it.
        downloadBlob(saved.blob, `tsumige-abans-restauracio-${Date.now()}.zip`)
      }
      const restored = await restoreArchive(archive, preview, overwrite, setProgress)
      await client.invalidateQueries()
      setMessage(`Restauració completada. ${restored} jocs amb portada recuperada. Els registres que no eren a la còpia s’han conservat.`)
      setArchive(null); setPreview(null); setConfirmed(false)
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'No s’ha pogut restaurar la còpia.') }
    finally { setBusy(false); setProgress('') }
  }
  if (!canEdit) return null
  return <section className="mt-6 rounded-xl border bg-card p-6 sm:p-8" aria-labelledby="restore-title">
    <h2 id="restore-title" className="text-lg font-semibold">Recupera una còpia</h2>
    <p className="mt-3 text-sm text-muted-foreground">Selecciona un ZIP descarregat des d’aquesta aplicació. Primer en revisarem el contingut; no s’aplica res en obrir-lo.</p>
    <label className="mt-4 block text-sm">Còpia ZIP<input type="file" accept=".zip,application/zip" disabled={busy} onChange={event => void read(event.target.files?.[0])} className="mt-2 block w-full text-sm" /></label>
    {archive && preview && <div className="mt-5 space-y-4">
      <p className="text-sm">Còpia del {new Date(archive.backup.exported_at).toLocaleString('ca-ES')}. Portades incloses: {archive.covers.length} jocs.</p>
      <table className="w-full text-sm"><thead><tr><th className="py-2 text-left">Dades</th><th>Nous</th><th>Ja existents</th></tr></thead><tbody>{preview.rows.map(row => <tr key={row.table}><th className="py-2 text-left font-normal">{labels[row.table]}</th><td className="text-center">{row.added}</td><td className="text-center">{row.existing}</td></tr>)}</tbody></table>
      {archive.missingCovers > 0 && <p className="text-sm text-amber-800">{archive.missingCovers} portades no són dins del ZIP; es conservaran les seves URL originals.</p>}
      <fieldset disabled={busy} className="space-y-3 text-sm">
        <label className="flex gap-2"><input type="checkbox" checked={overwrite} onChange={e => {setOverwrite(e.target.checked); setConfirmed(false)}} />Actualitza també els registres existents amb les dades de la còpia.</label>
        <p className="text-xs text-muted-foreground">{overwrite ? 'Això pot substituir comentaris, valoracions i altres canvis posteriors. Abans es prepararà una còpia de les dades actuals: comprova que es descarregui.' : 'S’afegiran només els registres que faltin. Els ja existents es conservaran.'} No s’elimina cap registre.</p>
        <label className="flex gap-2"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />He revisat el contingut i confirmo aquesta restauració.</label>
        <Button disabled={!confirmed} onClick={() => void restore()}>Restaura la còpia</Button>
      </fieldset>
    </div>}
    {progress && <p role="status" className="mt-4 text-sm">{progress}</p>}
    {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
    {message && <p role="status" className="mt-4 text-sm">{message}</p>}
  </section>
}
