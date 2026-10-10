import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { RecordEditor } from '@/components/record-editor'
import { useAccess } from '@/lib/access'
import { useAuth } from '@/lib/auth'
import type { Catalog } from '@/lib/catalog'
import { getReviewCatalog } from '@/lib/review-catalog'
import { reviewFields, reviewNavigation, reviewRows, reviewTargetLabel, type ReviewFilters, type ReviewRow, type ReviewTarget, type ReviewScope } from '@/lib/data-review'

const control = 'mt-1 w-full rounded-lg border bg-card p-2 text-sm'
function TargetChooser({ row, onChoose, onClose }: { row: ReviewRow; onChoose: (target: ReviewTarget) => void; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => { dialog.current?.showModal() }, [])
  return <dialog ref={dialog} onCancel={event => { event.preventDefault(); onClose() }} aria-labelledby="review-choice-title" className="m-auto max-h-[90dvh] w-[min(94vw,600px)] overflow-y-auto rounded-xl border bg-card p-6 text-foreground backdrop:bg-black/40">
    <h2 id="review-choice-title" className="text-lg font-semibold [overflow-wrap:anywhere]">{row.game.nom}</h2>
    <p className="mt-2 text-sm">Tria el registre per obrir el detall del joc.</p>
    <div className="mt-4 flex flex-col gap-2">{row.targets.map(target => <Button key={`${target.kind}:${target.record.id}`} variant="outline" className="h-auto justify-start whitespace-normal text-left [overflow-wrap:anywhere]" onClick={() => onChoose(target)}>{reviewTargetLabel(target)}</Button>)}</div>
    <Button variant="outline" className="mt-4" onClick={onClose}>Tanca</Button>
  </dialog>
}
export function DataReview() {
  const { canEdit } = useAccess()
  const { session } = useAuth()
  const client = useQueryClient()
  const queryKey = ['data-review', session?.user.id]
  const { data, error, isPending, isFetching, refetch } = useQuery({ queryKey, queryFn: getReviewCatalog, enabled: canEdit && Boolean(session) })
  const [filters, setFilters] = useState<ReviewFilters>({ scope: 'joc', field: 'portada', search: '', format: '', includeRetired: false, includeTracking: false })
  const [selected, setSelected] = useState<ReviewRow | null>(null)
  const [target, setTarget] = useState<ReviewTarget | null>(null)
  const [snapshot, setSnapshot] = useState<string[]>([])
  if (!canEdit) return null
  const rows = data ? reviewRows(data, filters) : []
  const navigable = rows.filter(row => row.targets.length)
  const unavailable = rows.length - navigable.length
  const navigation = selected ? reviewNavigation(snapshot, rows, selected.id) : []
  const position = selected ? navigation.indexOf(selected.id) : -1
  function open(row: ReviewRow) {
    setSelected(row)
    setTarget(row.targets.length === 1 ? row.targets[0] : null)
  }
  function move(index: number) {
    const row = rows.find(item => item.id === navigation[index])
    if (row) open(row)
  }
  function close() { setSelected(null); setTarget(null); setSnapshot([]) }
  async function refresh(): Promise<Catalog> {
    await client.invalidateQueries({ queryKey, refetchType: 'none' })
    const updated = await client.fetchQuery({ queryKey, queryFn: getReviewCatalog })
    await Promise.all([client.invalidateQueries({ queryKey: ['catalog'] }), client.invalidateQueries({ queryKey: ['jocs'] })])
    return updated
  }
  const currentGame = data?.jocs.find(game => game.id === selected?.game.id) ?? selected?.game
  const currentRecord = target ? (target.kind === 'exemplar' ? data?.exemplars : data?.experiencies)?.find(record => record.id === target.record.id) ?? target.record : null
  const optionalMissing = data && filters.scope === 'joc' && (filters.field === 'valoracio' || filters.field === 'comentaris')
    ? data.jocs.filter(game => game[filters.field as 'valoracio' | 'comentaris'] === undefined).length : 0
  const legacyExcluded = data && filters.scope === 'joc' && filters.field === 'comentaris'
    ? data.jocs.filter(game => (game.comentaris === null || game.comentaris?.trim() === '') && [...data.exemplars, ...data.experiencies].some(record => record.joc_id === game.id && record.notes?.trim())).length : 0
  return <section aria-labelledby="data-review-title" className="mt-8 rounded-xl border bg-card p-6 sm:p-8">
    <h2 id="data-review-title" className="text-lg font-semibold">Revisió de dades</h2>
    <p className="mt-2 text-sm text-muted-foreground">Consulta camps buits. Un valor buit no sempre és un error; no tenir valoració pot ser una decisió expressa.</p>
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <label className="text-sm">Àmbit<select className={control} value={filters.scope} onChange={event => { const scope = event.target.value as ReviewScope; setFilters({ ...filters, scope, field: reviewFields[scope][0].id }) }}><option value="joc">Dades del joc</option><option value="colleccio">Exemplars de Col·lecció</option><option value="bitacora">Entrades de Bitàcora</option></select></label>
      <label className="text-sm">Camp buit<select className={control} value={filters.field} onChange={event => setFilters({ ...filters, field: event.target.value })}>{reviewFields[filters.scope].map(field => <option key={field.id} value={field.id}>{field.label}</option>)}</select></label>
      <label className="text-sm">Cerca per títol<input type="search" className={control} value={filters.search} onChange={event => setFilters({ ...filters, search: event.target.value })} /></label>
      {filters.scope === 'colleccio' && <label className="text-sm">Format<select className={control} value={filters.format} onChange={event => setFilters({ ...filters, format: event.target.value })}><option value="">Físic i digital</option><option value="fisic">Físic</option><option value="digital">Digital</option></select></label>}
    </div>
    {filters.scope === 'colleccio' && <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={filters.includeRetired} onChange={event => setFilters({ ...filters, includeRetired: event.target.checked })} />Inclou exemplars retirats</label>}
    {filters.scope === 'bitacora' && <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={filters.includeTracking} onChange={event => setFilters({ ...filters, includeTracking: event.target.checked })} />Inclou seguiment sense any</label>}
    {filters.scope === 'colleccio' && <p className="mt-3 text-xs text-muted-foreground">Any i preu corresponen a cada exemplar. Zero euros és un valor informat.</p>}
    <Button type="button" variant="outline" className="mt-4" disabled={isFetching} onClick={() => void refetch()}>Actualitza els resultats</Button>
    {isPending && <p role="status" className="mt-4 text-sm">Carregant els registres…</p>}
    {error && <p role="alert" className="mt-4 text-sm text-red-700">{error.message}</p>}
    {!!optionalMissing && <p className="mt-3 text-sm text-muted-foreground">{optionalMissing} jocs exclosos perquè el camp no està disponible en les dades carregades.</p>}
    {!!legacyExcluded && <p className="mt-3 text-sm text-muted-foreground">{legacyExcluded} jocs amb notes antigues exclosos: cal decidir com conciliar-les amb els comentaris compartits.</p>}
    {!!unavailable && <p className="mt-3 text-sm text-muted-foreground">{unavailable} jocs sense exemplar ni entrada vinculats no es poden obrir amb el detall actual.</p>}
    {data && !error && <>
      <p role="status" className="mt-4 text-sm">{navigable.length} resultats consultables</p>
      {!navigable.length && <p className="mt-2 text-sm text-muted-foreground">Cap registre coincideix amb aquesta consulta.</p>}
      <ul className="mt-3 divide-y">{navigable.map(row => <li key={row.id}><button type="button" className="w-full py-3 text-left text-sm hover:bg-muted [overflow-wrap:anywhere]" onClick={() => { setSnapshot(navigable.map(item => item.id)); open(row) }}><span className="font-medium">{row.game.nom || 'Sense títol'}</span><span className="mt-1 block text-xs text-muted-foreground">{row.game.plataforma || 'Sense plataforma'} · {filters.scope === 'joc' ? `${row.targets.length} registres vinculats · ID: ${row.game.id}` : reviewTargetLabel(row.targets[0])}</span></button></li>)}</ul>
    </>}
    {selected && !rows.some(row => row.id === selected.id) && <p role="status" className="mt-3 text-sm">El registre obert ja no té aquest camp buit. Es manté obert fins que naveguis o el tanquis.</p>}
    {selected && !target && <TargetChooser key={selected.id} row={selected} onChoose={setTarget} onClose={close} />}
    {selected && target && currentGame && currentRecord && data && <RecordEditor key={`${target.kind}:${currentRecord.id}`} kind={target.kind} record={currentRecord} game={currentGame} catalog={data} onClose={close} onSaved={refresh}
      navigation={{ position: position + 1, total: navigation.length, previous: position > 0 ? () => move(position - 1) : undefined, next: position >= 0 && position < navigation.length - 1 ? () => move(position + 1) : undefined }} />}
  </section>
}
