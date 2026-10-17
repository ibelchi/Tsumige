import { GameLabelFields } from '@/components/game-label-fields'
import { gameLabels } from '@/lib/game-labels'
import { GenreSelect } from '@/components/genre-select'
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { RecordEditor } from '@/components/record-editor'
import { MetadataSearch } from '@/components/metadata-search'
import { GameRating } from '@/components/game-rating'
import { useAccess } from '@/lib/access'
import { useAuth } from '@/lib/auth'
import { createRecordAtomic, creationVersion, getCatalog, type Catalog } from '@/lib/catalog'
import { CreationFailure, creationSuggestions, existingAnnualEntries, sameGamePlatform, type CreationKind } from '@/lib/record-creation'
import { isEmulator, platformName, platformOptions } from '@/lib/platform'
import type { Exemplar, Experiencia, FitxaJoc, Json, Valoracio } from '@/lib/database.types'

const control = 'mt-1 w-full rounded-lg border bg-card p-2 text-sm'
function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block min-w-0 text-sm">{label}{children}</label> }
function initialDraft(game?: FitxaJoc) {
  return { nom: game?.nom ?? '', plataforma: platformName(game?.plataforma ?? ''), desenvolupadora: game?.desenvolupadora ?? '', genere_principal: game?.genere_principal ?? '',
    generos_secundaris: game?.generos_secundaris.join('\n') ?? '', sinopsi: game?.sinopsi ?? '', any_llancament: String(game?.any_llancament ?? ''),
    portada_url: game?.portada_url ?? '', portada_font_url: game?.portada_font_url ?? null, valoracio: game?.valoracio ?? null as Valoracio | null,
    no_jugat: game?.no_jugat === true, intencio_joc: game?.intencio_joc ?? null,
    comentaris: game?.comentaris ?? '', per_infants: game?.per_infants === true, per_jugar_aviat: game?.per_jugar_aviat ?? false }
}
function optionalNumber(value: string) { return value.trim() === '' ? null : Number(value) }
export function RecordCreator({ kind, catalog: initialCatalog, onClose, onSaved, initialGameId, collectionOnly = false }: {
  kind: CreationKind; catalog: Catalog; onClose: () => void; onSaved: () => Promise<Catalog | void>; initialGameId?: string; collectionOnly?: boolean
}) {
  const { canEdit } = useAccess()
  const { session } = useAuth()
  const [catalog, setCatalog] = useState(initialCatalog)
  const initialGame = catalog.jocs.find(game => game.id === initialGameId)
  const [gameId, setGameId] = useState<string | null>(initialGame?.id ?? null)
  const [draft, setDraft] = useState(() => initialDraft(initialGame))
  const [editGame, setEditGame] = useState(false)
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [completed, setCompleted] = useState('')
  const [playing, setPlaying] = useState(() => catalog.experiencies.some(entry => entry.joc_id === initialGameId && entry.jugant))
  const [format, setFormat] = useState<'fisic' | 'digital'>('fisic')
  const [purchaseYear, setPurchaseYear] = useState('')
  const [price, setPrice] = useState('')
  const [region, setRegion] = useState('')
  const [condition, setCondition] = useState('')
  const [flags, setFlags] = useState({ favorit: false, canvi: false, reproduccio: false, no_localitzat: false })
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [discardAction, setDiscardAction] = useState<(() => void) | null>(null)
  const [opened, setOpened] = useState<{ kind: CreationKind; id: string; catalog: Catalog } | null>(null)
  const submitting = useRef(false)
  const request = useRef(crypto.randomUUID())
  const committed = useRef<{ id: string; joc_id: string } | null>(null)
  const retryPayload = useRef<Parameters<typeof createRecordAtomic>[0] | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const form = useRef<HTMLFormElement>(null)
  const access = useQuery({ queryKey: ['creation-version', session?.user.id], queryFn: creationVersion, enabled: canEdit && Boolean(session) })
  useEffect(() => { if (canEdit && !opened) dialog.current?.showModal() }, [canEdit, opened])
  useEffect(() => {
    if (!dirty || !canEdit) return
    const protect = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', protect)
    return () => window.removeEventListener('beforeunload', protect)
  }, [dirty, canEdit])
  const selected = catalog.jocs.find(game => game.id === gameId)
  const activeCopies = selected ? catalog.exemplars.filter(copy => copy.joc_id === selected.id && copy.a_la_colleccio) : []
  const annual = selected ? existingAnnualEntries(catalog, selected.id, Number(year)) : []
  const samePlatform = !selected && draft.nom.trim() && draft.plataforma.trim() ? sameGamePlatform(catalog, draft.nom, draft.plataforma) : []
  const suggestions = !selected ? creationSuggestions(catalog, draft.nom).filter(game => kind !== 'exemplar' || !isEmulator(game.plataforma)) : []
  const sharedEditable = !collectionOnly && (!selected || editGame)
  const historicalCopies = selected ? catalog.exemplars.filter(copy => copy.joc_id === selected.id && !copy.a_la_colleccio) : []
  function guard(action: () => void) { if (!busy) { if (dirty) setDiscardAction(() => action); else action() } }
  function changeDraft<K extends keyof typeof draft>(key: K, value: typeof draft[K]) { setDraft(previous => ({ ...previous, [key]: value })); setDirty(true) }
  function selectGame(game: FitxaJoc) {
    setGameId(game.id); setDraft(initialDraft(game)); setEditGame(false)
    setPlaying(catalog.experiencies.some(entry => entry.joc_id === game.id && entry.jugant)); setDirty(true); setError('')
  }
  async function refresh(): Promise<Catalog> {
    const next = await onSaved() ?? await getCatalog()
    setCatalog(next)
    return next
  }
  async function openExisting(recordKind: CreationKind, id: string) {
    setBusy(true); setError('')
    try { const next = await refresh(); setDirty(false); setOpened({ kind: recordKind, id, catalog: next }) }
    catch { setError('No s’ha pogut carregar el detall. Els valors es conserven.') }
    finally { setBusy(false) }
  }
  async function reloadSelected() {
    setBusy(true)
    try {
      const next = await refresh()
      const game = next.jocs.find(item => item.id === gameId)
      if (!game) throw new Error('No s’ha pogut recuperar el joc seleccionat.')
      setDraft(initialDraft(game)); setEditGame(false); setError(''); setDirty(true)
    } catch { setError('No s’han pogut recuperar les dades desades. Els valors es conserven.') }
    finally { setBusy(false) }
  }
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!canEdit || busy || submitting.current || access.data !== true) return
    if (collectionOnly && (!selected || isEmulator(selected.plataforma))) { setError('Aquest joc no es pot incorporar a Col·lecció.'); return }
    if (!committed.current && !retryPayload.current) {
      if (samePlatform.length) { setError('Aquest joc ja existeix amb aquesta plataforma. Selecciona’l explícitament als suggeriments.'); return }
      if (kind === 'exemplar' && isEmulator(draft.plataforma)) { setError('Emulador només es pot afegir al log.'); return }
      if (kind === 'experiencia' && (!Number.isInteger(Number(year)) || Number(year) < 1 || Number(year) > 9999)) { setError('Indica un any de joc vàlid.'); return }
      const game: Json = { ...draft, nom: draft.nom.trim(), plataforma: platformName(draft.plataforma), desenvolupadora: draft.desenvolupadora || null,
        genere_principal: draft.genere_principal || null, generos_secundaris: draft.generos_secundaris.split('\n').map(value => value.trim()).filter(Boolean),
        sinopsi: draft.sinopsi || null, any_llancament: optionalNumber(draft.any_llancament), portada_url: draft.portada_url || null, comentaris: draft.comentaris || null }
      const record: Json = kind === 'exemplar' ? { format, regio: region || null, estat_conservacio: condition || null, any_compra: optionalNumber(purchaseYear), preu: optionalNumber(price), ...flags }
        : { any_jugat: Number(year), completat: completed || null, jugant: playing }
      retryPayload.current = { kind, id: request.current, gameId, game, record, editGame, updatedAt: selected?.updated_at ?? null,
        retire: null }
    }
    submitting.current = true
    setBusy(true); setError('')
    try {
      if (collectionOnly && !committed.current && !retryPayload.current) throw new Error('No s’ha pogut preparar l’exemplar.')
      if (collectionOnly && !committed.current) {
        const latest = await getCatalog()
        setCatalog(latest)
        if (latest.exemplars.some(copy => copy.joc_id === gameId && copy.a_la_colleccio)) {
          retryPayload.current = null
          throw new Error('Aquest joc ja té un exemplar actiu. Obre’l; els valors del formulari es conserven.')
        }
      }
      if (!committed.current) {
        const result = await createRecordAtomic(retryPayload.current!)
        committed.current = result
        if (result.existent) setNotice('Aquest registre ja existeix. S’obre el detall sense modificar-lo.')
      }
      const next = await refresh()
      const records = kind === 'exemplar' ? next.exemplars : next.experiencies
      if (!records.some(record => record.id === committed.current!.id)) throw new Error('L’alta s’ha desat, però no s’ha pogut carregar el detall. Torna-ho a provar; no es duplicarà.')
      setDirty(false); setDiscardAction(null); setOpened({ kind, id: committed.current.id, catalog: next })
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'No s’ha pogut confirmar l’alta.'
      setError(message)
      // Només errors de negoci inequívocs permeten ajustar l'esborrany; errors de transport repeteixen la mateixa petició.
      if (!committed.current && caught instanceof CreationFailure && caught.definitive) retryPayload.current = null
    } finally { submitting.current = false; setBusy(false) }
  }
  if (!canEdit) return null
  if (opened) {
    const current = catalog
    const record: Exemplar | Experiencia | undefined = (opened.kind === 'exemplar' ? current.exemplars : current.experiencies).find(item => item.id === opened.id)
    const game = current.jocs.find(item => item.id === record?.joc_id)
    return record && game ? <RecordEditor key={`${opened.kind}:${opened.id}`} kind={opened.kind} record={record} game={game} catalog={current} onClose={onClose} onSaved={refresh} /> : <p role="alert">No s’ha pogut carregar el registre.</p>
  }
  return <dialog ref={dialog} onCancel={event => { event.preventDefault(); guard(onClose) }} aria-labelledby="alta-titol" className="m-auto max-h-[90dvh] w-[min(94vw,760px)] overflow-y-auto rounded-xl border bg-card p-6 text-foreground shadow-xl backdrop:bg-black/40">
    <header className="flex flex-wrap items-start justify-between gap-3"><h2 id="alta-titol" className="text-xl font-semibold">{collectionOnly ? 'Afegeix a la col·lecció' : kind === 'exemplar' ? 'Afegeix un joc' : 'Afegeix una entrada'}</h2><Button type="button" variant="ghost" disabled={busy} onClick={() => guard(onClose)}>Tanca</Button></header>
    {access.isPending ? <p role="status" className="mt-3 text-sm">Comprovant la disponibilitat de l’alta…</p> : access.data !== true && <p role="alert" className="mt-3 text-sm">L’alta encara no està disponible al servidor. Pots consultar els registres existents.</p>}
    {notice && <p role="status" className="mt-3 text-sm">{notice}</p>}
    <form ref={form} onSubmit={submit} onChange={() => setDirty(true)} className="mt-5 space-y-5">
      <fieldset disabled={busy || Boolean(retryPayload.current) || Boolean(committed.current)} className="space-y-5">
        <Field label="Nom"><input required value={draft.nom} readOnly={Boolean(selected)} onChange={event => changeDraft('nom', event.target.value)} className={control} autoComplete="off" aria-controls="alta-suggeriments" /></Field>
        {selected && !collectionOnly && <div className="flex flex-wrap items-center gap-2 text-sm"><span>{selected.nom} · {platformName(selected.plataforma)}</span><Button type="button" variant="outline" size="sm" onClick={() => guard(() => { setGameId(null); setDraft(initialDraft()); setEditGame(false); setDirty(true) })}>Canvia de joc</Button></div>}
        {!selected && suggestions.length > 0 && <ul id="alta-suggeriments" aria-label="Jocs existents" className="max-h-48 overflow-y-auto rounded-lg border">{suggestions.map(game => <li key={game.id}><button type="button" onClick={() => { if (sharedEditable && Object.entries(draft).some(([key, value]) => key !== 'nom' && value !== initialDraft()[key as keyof typeof draft])) guard(() => selectGame(game)); else selectGame(game) }} className="w-full px-3 py-2 text-left text-sm hover:bg-muted [overflow-wrap:anywhere]">{game.nom} · {platformName(game.plataforma)} <span className="text-xs text-muted-foreground">· ID: {game.id}</span></button></li>)}</ul>}
        <Field label="Plataforma"><input required readOnly={Boolean(selected)} list="alta-plataformes" value={draft.plataforma} onChange={event => { changeDraft('plataforma', event.target.value) }} className={control} /><datalist id="alta-plataformes">{platformOptions(catalog).filter(option => kind !== 'exemplar' || !isEmulator(option)).map(option => <option key={option} value={option} />)}</datalist></Field>
        {samePlatform.length > 0 && <p role="status" className="text-sm">Ja hi ha un joc amb aquest títol i plataforma. Selecciona’l als suggeriments; no es crearà un duplicat.</p>}
        {selected && !editGame && <section className="space-y-3 rounded-lg border p-4" aria-label="Dades del joc">
          {(selected.portada_visual_url || draft.portada_url) && <img src={selected.portada_visual_url || draft.portada_url} alt={`Portada de ${draft.nom}`} className="mx-auto max-h-56 max-w-full object-contain" />}
          <GameRating rating={draft.valoracio} className="text-center text-4xl" />
          <dl className="grid gap-3 text-sm sm:grid-cols-2">{[['Desenvolupadora', draft.desenvolupadora], ['Gènere', draft.genere_principal], ['Any de llançament', draft.any_llancament], ['Gèneres secundaris', draft.generos_secundaris], ['Sinopsi', draft.sinopsi], ['Comentaris', draft.comentaris]].map(([label, value]) => <div key={label}><dt className="text-muted-foreground">{label}</dt><dd className="whitespace-pre-wrap break-words">{value || '—'}</dd></div>)}</dl>
          <div className="flex flex-wrap gap-2 text-sm">{gameLabels(draft).map(label => <span key={label}>{label}</span>)}{draft.per_infants && <span>Per jugar amb infants</span>}{draft.per_jugar_aviat && <span>Per jugar aviat</span>}</div>
          {!collectionOnly && <Button type="button" variant="outline" onClick={() => { setEditGame(true); setDirty(true) }}>Edita les dades del joc</Button>}
        </section>}
        {selected && editGame && <p className="text-sm text-muted-foreground">Aquests canvis afecten el joc i totes les seves entrades, inclosos la valoració i els comentaris.</p>}
        {sharedEditable && <>
          {draft.portada_url && <img src={draft.portada_url} alt={`Portada de ${draft.nom}`} className="mx-auto max-h-56 max-w-full object-contain" />}
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Desenvolupadora"><input value={draft.desenvolupadora} onChange={e => changeDraft('desenvolupadora', e.target.value)} className={control} /></Field><GenreSelect key={gameId ?? 'new-genre'} genres={catalog.jocs.map(game => game.genere_principal)} value={draft.genere_principal} onChange={value => changeDraft('genere_principal', value)} canAdd={canEdit} /><Field label="Any de llançament"><input type="number" min="1" max="9999" value={draft.any_llancament} onChange={e => changeDraft('any_llancament', e.target.value)} className={control} /></Field></div>
          <Field label="Valoració del joc"><select value={draft.valoracio ?? ''} onChange={e => changeDraft('valoracio', (e.target.value || null) as Valoracio | null)} className={control}><option value="">En blanc</option>{['A++', 'A+', 'A', 'B', 'C', 'D'].map(value => <option key={value}>{value}</option>)}</select></Field>
          <Field label="Comentaris del joc"><textarea rows={3} value={draft.comentaris} onChange={e => changeDraft('comentaris', e.target.value)} className={control} /></Field>
          <GameLabelFields game={draft} onChange={value => { setDraft(previous => ({ ...previous, ...value })); setDirty(true) }} />
          <div className="flex flex-wrap gap-4"><label className="text-sm"><input type="checkbox" checked={draft.per_infants} onChange={e => changeDraft('per_infants', e.target.checked)} /> Per jugar amb infants</label><label className="text-sm"><input type="checkbox" checked={draft.per_jugar_aviat} onChange={e => changeDraft('per_jugar_aviat', e.target.checked)} /> Per jugar aviat</label></div>
          <details className="rounded-lg border p-4"><summary className="cursor-pointer text-sm">Altres dades i portada</summary><div className="mt-3 space-y-4"><Field label="Sinopsi"><textarea value={draft.sinopsi} onChange={e => changeDraft('sinopsi', e.target.value)} className={control} /></Field><Field label="Gèneres secundaris (un per línia)"><textarea value={draft.generos_secundaris} onChange={e => changeDraft('generos_secundaris', e.target.value)} className={control} /></Field><Field label="URL de la imatge"><input type="url" pattern="https?://.*" value={draft.portada_url} onChange={e => { changeDraft('portada_url', e.target.value); changeDraft('portada_font_url', null) }} className={control} /></Field><MetadataSearch key={gameId ?? 'nou'} name={draft.nom} onImage={(url, source) => { changeDraft('portada_url', url); changeDraft('portada_font_url', source) }} /></div></details>
        </>}
        {kind === 'experiencia' ? <section className="space-y-4 border-t pt-4"><h3 className="font-medium">Entrada de log</h3><div className="grid gap-4 sm:grid-cols-2"><Field label="Any de joc"><input required type="number" min="1" max="9999" value={year} onChange={e => setYear(e.target.value)} className={control} /></Field><Field label="Completat"><select value={completed} onChange={e => setCompleted(e.target.value)} className={control}><option value="">En blanc</option><option value="si">Sí</option><option value="no">No</option><option value="no_aplicable">No aplicable</option></select></Field></div><label className="text-sm"><input type="checkbox" checked={playing} onChange={e => setPlaying(e.target.checked)} /> Jugant</label><p className="text-xs text-muted-foreground">Jugant afecta el joc en conjunt i el quadre d’Inici.</p>
          {annual.length > 0 && <div role="status" className="space-y-2 text-sm"><p>Ja hi ha {annual.length === 1 ? 'una entrada' : 'diverses entrades antigues'} d’aquest joc i any. No se’n crearà cap altra.</p>{annual.map(entry => <Button key={entry.id} type="button" variant="outline" onClick={() => guard(() => void openExisting('experiencia', entry.id))}>Obre l’entrada · {entry.completat ?? 'En blanc'} · {entry.id}</Button>)}</div>}
        </section> : <section className="space-y-4 border-t pt-4"><h3 className="font-medium">Dades de Col·lecció</h3><div className="grid gap-4 sm:grid-cols-2"><Field label="Format"><select value={format} onChange={e => { setFormat(e.target.value as 'fisic' | 'digital') }} className={control}><option value="fisic">Físic</option><option value="digital">Digital</option></select></Field><Field label="Regió"><input value={region} onChange={e => setRegion(e.target.value)} className={control} /></Field><Field label="Conservació"><input value={condition} onChange={e => setCondition(e.target.value)} className={control} /></Field><Field label="Any de compra"><input type="number" min="1" max="9999" value={purchaseYear} onChange={e => setPurchaseYear(e.target.value)} className={control} /></Field><Field label="Preu (€)"><input type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className={control} /></Field></div><div className="flex flex-wrap gap-4">{([['favorit', 'Favorit'], ['canvi', 'Possible intercanvi'], ['reproduccio', 'Reproducció'], ['no_localitzat', 'No localitzat']] as const).map(([key, label]) => <label key={key} className="text-sm"><input type="checkbox" checked={flags[key]} onChange={e => setFlags(value => ({ ...value, [key]: e.target.checked }))} /> {label}</label>)}</div>
          {collectionOnly && historicalCopies.length > 0 && <p role="status" className="text-sm text-muted-foreground">Hi ha {historicalCopies.length} exemplars històrics. S’afegirà un exemplar nou: no es reactivaran ni se sobreescriuran les seves dades de compra.</p>}
          {activeCopies.length > 0 && <div role="status" className="space-y-2 text-sm"><p>Aquest joc ja té un exemplar actiu a Col·lecció. Obre’l per consultar-lo.</p>{activeCopies.map(copy => <Button key={copy.id} type="button" variant="outline" className="h-auto whitespace-normal" onClick={() => guard(() => void openExisting('exemplar', copy.id))}>Obre l’exemplar · {copy.format === 'fisic' ? 'Físic' : 'Digital'} · {copy.regio || 'Sense regió'} · {copy.id}</Button>)}</div>}
        </section>}
      </fieldset>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {error.includes("han canviat") && <Button type="button" variant="outline" disabled={busy} onClick={() => guard(() => void reloadSelected())}>Recarrega el joc desat</Button>}
      {Boolean(retryPayload.current) && !committed.current && !busy && <p className="text-sm">Cal confirmar el resultat de la mateixa petició abans d’editar els valors.</p>}
      <div className="flex flex-wrap justify-end gap-2"><Button type="button" variant="outline" disabled={busy} onClick={() => guard(onClose)}>Tanca</Button><Button type="submit" disabled={busy || access.data !== true || (!committed.current && !retryPayload.current && ((kind === 'experiencia' && annual.length > 0) || (kind === 'exemplar' && activeCopies.length > 0)))}>{busy ? 'Desant…' : committed.current ? 'Obre el detall desat' : retryPayload.current ? 'Confirma l’alta' : kind === 'exemplar' ? 'Afegeix el joc' : 'Afegeix l’entrada'}</Button></div>
    </form>
    {discardAction && <section role="alert" className="mt-4 space-y-3 rounded-lg border p-4"><p className="text-sm">Tens canvis sense desar.</p><div className="flex flex-wrap gap-2"><Button disabled={busy || access.data !== true} onClick={() => form.current?.requestSubmit()}>Desa</Button><Button variant="outline" disabled={busy} onClick={() => { const action = discardAction; setDiscardAction(null); setDirty(false); action() }}>Descarta i continua</Button><Button variant="outline" onClick={() => setDiscardAction(null)}>Continua editant</Button></div></section>}
  </dialog>
}
