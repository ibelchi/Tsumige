import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAccess } from '@/lib/access'
import { useAuth } from '@/lib/auth'
import { getReviewCatalog } from '@/lib/review-catalog'
import { platformCoverage, platformIssues } from '@/lib/platform'

const labels = { pendents: 'Conversió pendent', botigues: 'Plataforma i botiga', bitacora: 'Destí de Bitàcora', formats: 'Físic i digital', emulador: 'Emulador amb exemplars', coincidencies: 'Coincidències de registres', valoracions: 'Valoracions diferents', comentaris: 'Comentaris i notes diferents', compres: 'Dades de compra diferents' }
export function PlatformAudit() {
  const { canEdit } = useAccess()
  const { session } = useAuth()
  const [opened, setOpened] = useState(false)
  const { data, error, isPending } = useQuery({ queryKey: ['data-review', session?.user.id], queryFn: getReviewCatalog, enabled: opened && canEdit && Boolean(session) })
  if (!canEdit) return null
  const issues = data ? platformIssues(data) : []
  return <details onToggle={event => setOpened(event.currentTarget.open)} className="mt-6 rounded-xl border bg-card p-6 sm:p-8">
    <summary className="cursor-pointer font-semibold">Conversió de Plataforma: discrepàncies</summary>
    <p className="mt-3 text-sm text-muted-foreground">Consulta prèvia, sense aplicar conversions. Cal decidir el destí de les entrades i revisar valoracions, comentaris i compres abans de separar o consolidar registres.</p>
    {opened && isPending && <p role="status" className="mt-3 text-sm">Carregant els registres…</p>}
    {error && <p role="alert" className="mt-3 text-sm text-red-700">{error.message}</p>}
    {data && <div className="mt-3 text-sm"><p>Lectura completa contrastada amb el recompte del servidor: {data.jocs.length} jocs, {data.exemplars.length} exemplars (actius i retirats) i {data.experiencies.length} entrades (amb any o sense).</p><p>Conversió pendent compta jocs sense plataforma confirmada, també sense exemplars; no és un recompte d’errors.</p>{platformCoverage(data).length ? <ul role="alert">{platformCoverage(data).map(warning => <li key={warning}>{warning}</li>)}</ul> : <p>Sense vincles orfes, identificadors duplicats, plataformes buides ni camps compartits absents en la lectura.</p>}</div>}
    {data && Object.entries(labels).map(([group, label]) => {
      const found = issues.filter(issue => issue.group === group)
      return <details key={group} className="mt-4 border-t pt-3"><summary className="cursor-pointer text-sm font-medium">{label}: {found.length}</summary><ul className="mt-3 space-y-4">{found.map((issue, index) => {
        const game = data.jocs.find(item => item.id === issue.gameId)!
        const copies = data.exemplars.filter(copy => copy.joc_id === game.id)
        const entries = data.experiencies.filter(entry => entry.joc_id === game.id)
        return <li key={`${issue.gameId}:${index}`} className="text-sm [overflow-wrap:anywhere]"><p className="font-medium">{game.nom} · {game.plataforma}</p><p>{issue.message}</p><details className="mt-2"><summary className="cursor-pointer">Dades per contrastar</summary><p>ID del joc: {game.id}</p><p>Valoració del joc: {game.valoracio ?? 'Sense valoració compartida'}</p><p className="whitespace-pre-wrap">Comentaris del joc: {game.comentaris ?? 'Sense comentari compartit'}</p><ul className="mt-2 space-y-2">{copies.map(copy => <li key={copy.id}>Exemplar {copy.id}: {copy.format} · {copy.a_la_colleccio ? 'Actiu' : 'Retirat'} · Botiga original: {copy.botiga_servei || '—'} · Compra: {copy.any_compra ?? '—'} · Preu: {copy.preu === null ? '—' : `${copy.preu} €`} · Notes: {copy.notes || '—'}</li>)}</ul><ul className="mt-2 space-y-2">{entries.map(entry => <li key={entry.id}>Entrada {entry.id}: {entry.any_jugat ?? 'Sense any'} · Valoració antiga: {entry.valoracio ?? '—'} · Notes antigues: {entry.notes || '—'}</li>)}</ul></details></li>
      })}</ul></details>
    })}
  </details>
}
