import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { downloadBlob, downloadFile, getBackup } from '@/lib/backup'
import { buildBackupArchive, type CoverEntry } from '@/lib/backup-archive'
import { buildCsv, type CsvKind } from '@/lib/csv'
import { BackupRestore } from '@/components/backup-restore'
import { coverUrl } from '@/lib/cover-storage'

export function SettingsPage() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [progress, setProgress] = useState<string | null>(null)
  const [failedCovers, setFailedCovers] = useState<CoverEntry[]>([])
  const [includeRetired, setIncludeRetired] = useState(false)
  const [csvError, setCsvError] = useState<string | null>(null)
  const [csvMessage, setCsvMessage] = useState<string | null>(null)
  async function exportBackup() {
    setBusy(true); setError(null); setMessage(null); setFailedCovers([]); setProgress('Preparant les dades…')
    try {
      const backup = await getBackup()
      const archive = await buildBackupArchive(backup, ({ completed, total }) => setProgress(completed === total ? 'Preparant el ZIP…' : `Descarregant portades: ${completed} de ${total}…`), fetch, coverUrl)
      downloadBlob(archive.blob, `tsumige-${backup.exported_at.replace(/[:.]/g, '-')}.zip`)
      setFailedCovers(archive.failed)
      setMessage(`Còpia preparada: ${backup.fitxes_joc.length} jocs, ${backup.exemplars.length} exemplars, ${backup.experiencies.length} experiències, ${backup.proposits.length} propòsits i portades de ${archive.downloaded} jocs. Comprova la carpeta de descàrregues.`)
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'No s’ha pogut preparar la còpia.') }
    finally { setBusy(false); setProgress(null) }
  }
  async function exportCsv(kind: CsvKind) {
    setBusy(true); setCsvError(null); setCsvMessage(null)
    try {
      const backup = await getBackup()
      const result = buildCsv(backup, kind, includeRetired)
      downloadFile(result.content, `tsumige-${kind}${kind === 'colleccio' && includeRetired ? '-amb-retirats' : ''}-${backup.exported_at.replace(/[:.]/g, '-')}.csv`, 'text/csv;charset=utf-8')
      setCsvMessage(`Exportació preparada: ${result.count} ${kind === 'colleccio' ? 'exemplars' : 'experiències'}. Comprova la carpeta de descàrregues.`)
    } catch (caught) { setCsvError(caught instanceof Error ? caught.message : 'No s’ha pogut preparar l’exportació.') }
    finally { setBusy(false) }
  }
  return <div className="page-container"><h1 className="page-title">Configuració</h1>
    <Button asChild variant="outline" className="mt-5"><Link to="/?vista=contrasenya">Canvia la contrasenya</Link></Button>
    <section className="mt-8 rounded-xl border bg-card p-6 sm:p-8" aria-labelledby="backup-title">
      <h2 id="backup-title" className="text-lg font-semibold">Còpia de seguretat</h2>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Descarrega totes les dades i els fitxers de les portades en un ZIP. Inclou jocs, exemplars actius i retirats, comentaris, experiències, valoracions i propòsits de tots els anys. Les imatges desades es conserven encara que el proveïdor deixi de funcionar.</p>
      <Button className="mt-5" disabled={busy} onClick={() => void exportBackup()}>Descarrega còpia de seguretat</Button>
      {progress && <p role="status" aria-live="polite" className="mt-4 text-sm">{progress}</p>}
      {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="mt-4 text-sm">{message}</p>}
      {failedCovers.length > 0 && <div role="alert" className="mt-4 rounded-lg border border-orange-300 bg-orange-50 p-4 text-sm text-orange-950"><p>No s’han pogut desar {failedCovers.length} portades. Les dades dels jocs sí que s’han inclòs; els errors també consten dins del ZIP.</p><details className="mt-2"><summary className="cursor-pointer">Veure les portades pendents</summary><ul className="mt-2 space-y-1">{failedCovers.map(cover => <li key={cover.joc_id}><strong>{cover.nom}</strong>: {cover.error}</li>)}</ul></details></div>}
      <p className="mt-4 text-xs text-muted-foreground">El ZIP inclou dades.json, la carpeta de portades i l’informe portades.json. Els jocs sense portada assignada també consten a l’informe.</p>
    </section>
    <BackupRestore />
    <section className="mt-6 rounded-xl border bg-card p-6 sm:p-8" aria-labelledby="csv-title"><h2 id="csv-title" className="text-lg font-semibold">Exporta per consultar amb Excel</h2>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">La col·lecció inclou una fila per exemplar. El registre de jocs jugats inclou una fila per experiència, també dels jocs que no tens a la col·lecció.</p>
      <label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" disabled={busy} checked={includeRetired} onChange={event => setIncludeRetired(event.target.checked)} />Inclou els exemplars retirats a l’exportació de la col·lecció</label>
      <div className="mt-5 flex flex-wrap gap-3"><Button variant="outline" disabled={busy} onClick={() => void exportCsv('colleccio')}>Descarrega col·lecció CSV</Button><Button variant="outline" disabled={busy} onClick={() => void exportCsv('historial')}>Descarrega jocs jugats CSV</Button></div>
      {csvError && <p role="alert" className="mt-4 text-sm text-red-700">{csvError}</p>}{csvMessage && <p role="status" className="mt-4 text-sm">{csvMessage}</p>}
      <p className="mt-4 text-xs text-muted-foreground">Els canvis que facis al CSV no s’apliquen a l’aplicació. Per conservar totes les dades i relacions, descarrega també la còpia ZIP.</p>
    </section>
    <section className="mt-6 rounded-xl border bg-card p-6 sm:p-8"><h2 className="text-lg font-semibold">Jocs retirats</h2><p className="mt-3 text-sm text-muted-foreground">Consulta els exemplars que has retirat i torna’ls a la col·lecció quan calgui.</p><Button asChild variant="outline" className="mt-5"><Link to="/?vista=retirats">Veure els jocs retirats</Link></Button></section>
  </div>
}
