import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { saveRecord, createRecord, setGamePlayingFromRecord, removeFromCollection, restoreToCollection, type Catalog } from '@/lib/catalog'
import type { Exemplar, Experiencia, FitxaJoc, Json, Valoracio } from '@/lib/database.types'
import { RecordDetails } from '@/components/record-details'
import { MetadataSearch } from '@/components/metadata-search'
import { gameRating, ratingColor } from '@/lib/game-rating'
import { BrandLogo } from '@/components/brand-logo'
import { GameRating } from '@/components/game-rating'
import { gameComments } from '@/lib/game-comments'
import { collectionCopy, platformName, platformOptions, resolvedPlatformError } from '@/lib/platform'
import { storeName } from '@/lib/store-name'
import { useAccess } from '@/lib/access'

const control = 'mt-1 w-full rounded-lg border bg-card p-2 text-sm focus-visible:outline-2 focus-visible:outline-ring'
function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block text-sm">{label}{children}</label> }
function Check({ label, name, checked }: { label: string; name: string; checked: boolean }) { return <label className="flex min-h-10 items-center gap-2 text-sm"><input type="checkbox" name={name} defaultChecked={checked} />{label}</label> }
function text(form: FormData, key: string): string | null { const result = String(form.get(key) ?? ''); return result === '' ? null : result }
function number(form: FormData, key: string): number | null { const result = text(form, key); return result === null ? null : Number(result) }

export function RecordEditor({ kind, record: initialRecord, game: initialGame, catalog: initialCatalog, onClose, onSaved, creating = false, existingGame = false, navigation }: {
  kind: 'exemplar' | 'experiencia'; record: Exemplar | Experiencia; game: FitxaJoc
  catalog: Catalog; onClose: () => void; onSaved: () => Promise<Catalog | void>
  creating?: boolean; existingGame?: boolean
  navigation?: { position: number; total: number; previous?: () => void; next?: () => void }
}) {
  const { canEdit } = useAccess()
  const [savedCatalog, setSavedCatalog] = useState<Catalog | null>(null)
  const catalog = savedCatalog ?? initialCatalog
  const game = catalog.jocs.find(item => item.id === initialGame.id) ?? initialGame
  const record = (kind === 'exemplar' ? catalog.exemplars : catalog.experiencies).find(item => item.id === initialRecord.id) ?? initialRecord
  const [formVersion, setFormVersion] = useState(0)
  const [saved, setSaved] = useState(false)
  const [editing, setEditing] = useState(creating)
  const isEditing = editing && canEdit
  const platformResolved = game.plataforma_resolta === true || (creating && !existingGame && catalog.plataformaModel === 2)
  const dialog = useRef<HTMLDialogElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const confirmation = useRef<HTMLElement>(null)
  const pendingNavigation = useRef<(() => void) | null>(null)
  const [dirty, setDirty] = useState(false)
  const [confirmNavigation, setConfirmNavigation] = useState(false)
  function moveTo(action?: () => void) {
    if (!action || busy || confirmNavigation) return
    if (!dirty || !canEdit) { action(); return }
    pendingNavigation.current = action
    setConfirmNavigation(true)
  }
  const createdRecord = useRef<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [image, setImage] = useState(game.portada_url ?? '')
  const displayImage = image === game.portada_url ? game.portada_visual_url ?? image : image
  const [imageSource, setImageSource] = useState(game.portada_font_url ?? null)
  const [imageError, setImageError] = useState(false)
  const [rating, setRating] = useState<Valoracio | null>(() => gameRating(game, catalog.experiencies))
  const copy = kind === 'exemplar' ? record as Exemplar : null
  const experience = kind === 'experiencia' ? record as Experiencia : null
  const [format, setFormat] = useState(copy?.format ?? 'digital')
  const [service, setService] = useState(storeName(copy?.botiga_servei ?? ''))
  const [extraServices, setExtraServices] = useState<string[]>([])
  const [addingService, setAddingService] = useState(false)
  const [newService, setNewService] = useState('')
  const [notFound, setNotFound] = useState(copy?.no_localitzat === true)
  const services = [...new Set(['Steam', 'Epic Games', 'itch.io', ...catalog.exemplars.map(e => e.botiga_servei).filter((value): value is string => Boolean(value)), ...extraServices, ...(service ? [service] : [])].map(storeName))]
  const comments = gameComments(game, catalog)
  const commentsReady = game.comentaris !== undefined || (creating && catalog.jocs.some(j => j.comentaris !== undefined))
  function resetDraft(source: Catalog) {
    const savedGame = source.jocs.find(item => item.id === game.id) ?? game
    const savedCopy = source.exemplars.find(item => item.id === record.id)
    setSavedCatalog(source)
    setImage(savedGame.portada_url ?? '')
    setImageSource(savedGame.portada_font_url ?? null)
    setImageError(false)
    setRating(gameRating(savedGame, source.experiencies))
    setFormat(savedCopy?.format ?? 'digital')
    setService(storeName(savedCopy?.botiga_servei ?? ''))
    setNotFound(savedCopy?.no_localitzat === true)
    setExtraServices([]); setAddingService(false); setNewService('')
    setFormVersion(value => value + 1)
    setDirty(false); setConfirmNavigation(false); pendingNavigation.current = null
    setError(null); setSaved(false); setEditing(false)
  }
  function undoChanges() {
    if (busy || !canEdit) return
    resetDraft(savedCatalog ?? initialCatalog)
  }
  function addService() {
    const value = storeName(newService.trim())
    if (!value) return
    const existing = services.find(s => s.toLocaleLowerCase() === value.toLocaleLowerCase())
    setService(existing ?? value)
    if (!existing) setExtraServices(previous => [...previous, value])
    setNewService(''); setAddingService(false); setDirty(true); setSaved(false)
  }
  const retired = Boolean(copy && !copy.a_la_colleccio && !creating)
  const ownedCopies = catalog.exemplars.filter(e => e.joc_id === game.id && collectionCopy(e, game))
  const history = catalog.experiencies.filter(e => e.joc_id === game.id)
  const [relatedCopyId, setRelatedCopyId] = useState<string | null>(null)
  const [choosingCopy, setChoosingCopy] = useState(false)
  const copyChooser = useRef<HTMLElement>(null)
  useEffect(() => {
    if (choosingCopy) {
      copyChooser.current?.scrollIntoView({ block: 'nearest' })
      copyChooser.current?.querySelector('button')?.focus()
    }
  }, [choosingCopy])
  const relatedCopy = ownedCopies.find(item => item.id === relatedCopyId)
  function openCollection() {
    if (ownedCopies.length === 1) setRelatedCopyId(ownedCopies[0].id)
    else if (ownedCopies.length > 1) setChoosingCopy(true)
  }
  useEffect(() => { if (!relatedCopy) dialog.current?.showModal() }, [relatedCopy])
  useEffect(() => {
    if (!dirty || !canEdit) return
    function protectLeave(event: BeforeUnloadEvent) { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', protectLeave)
    return () => window.removeEventListener('beforeunload', protectLeave)
  }, [dirty, canEdit])
  useEffect(() => {
    if (!confirmNavigation) return
    confirmation.current?.scrollIntoView({ block: 'nearest' })
    confirmation.current?.querySelector('button')?.focus()
  }, [confirmNavigation])
  async function retire() {
    if (busy || !canEdit || !copy || !window.confirm(`Retirar «${game.nom}» (${copy.regio ?? game.plataforma}) de la col·lecció? Es conservaran les experiències, valoracions i notes de joc.`)) return
    setBusy(true); setError(null)
    try { await removeFromCollection(copy.id); await onSaved(); onClose() }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'No s’ha pogut retirar.'); setBusy(false) }
  }
  async function restore() {
    if (busy || !canEdit || !copy) return
    setBusy(true); setError(null)
    try { await restoreToCollection(copy.id); await onSaved(); onClose() }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'No s’ha pogut recuperar.'); setBusy(false) }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || retired || !canEdit || !isEditing) return
    const form = new FormData(event.currentTarget)
    const infantsReady = game.per_infants !== undefined || (creating && catalog.jocs.some(j => j.per_infants !== undefined))
    if (!infantsReady && form.has('per_infants')) {
      setError('Cal aplicar la migració «Per jugar amb infants» a Supabase abans de desar aquesta marca.')
      return
    }
    if (!commentsReady && (text(form, 'comentaris') ?? '') !== comments.value) {
      setError('Cal aplicar la migració de comentaris del joc abans de desar aquest camp. Els comentaris existents es conserven.')
      return
    }
    const nextPlatform = platformName(text(form, 'plataforma') ?? '')
    if (!nextPlatform) { setError('Indica una plataforma.'); return }
    if ((!creating || existingGame) && nextPlatform !== platformName(game.plataforma)) {
      setError('Una plataforma diferent necessita un registre de joc diferent. No es reassignen les entrades de Bitàcora des d’aquest formulari.')
      return
    }
    if (creating && existingGame && kind === 'exemplar' && catalog.plataformaModel === 2 && !platformResolved) {
      setError('Cal resoldre la conversió de plataforma d’aquest joc abans d’afegir-hi registres. Les dades antigues es conserven.')
      return
    }
    const platformError = resolvedPlatformError(catalog, game.id, nextPlatform, copy ? format : undefined, copy?.id)
    if (platformError && (platformResolved || nextPlatform === 'Emulador')) { setError(platformError); return }
    const fields: Json = {
      nom: text(form, 'nom'), plataforma: nextPlatform, desenvolupadora: text(form, 'desenvolupadora'),
      genere_principal: text(form, 'genere_principal'), any_llancament: number(form, 'any_llancament'), per_jugar_aviat: form.has('per_jugar_aviat'),
      portada_url: image || null, portada_font_url: imageSource,
      ...(commentsReady ? { comentaris: text(form, 'comentaris') } : {}),
      ...(infantsReady ? { per_infants: form.has('per_infants') } : {}),
    }
    const details: Json = copy ? {
      format: text(form, 'format'), regio: text(form, 'regio'), estat_conservacio: text(form, 'estat_conservacio'),
      any_compra: number(form, 'any_compra'), preu: number(form, 'preu'), botiga_servei: platformResolved ? copy.botiga_servei : service || null,
      notes: record.notes, favorit: form.has('favorit'), canvi: form.has('canvi'), reproduccio: form.has('reproduccio'),
      no_localitzat: notFound ? true : copy.no_localitzat === null ? null : false, revisat: record.revisat,
    } : {
      any_jugat: number(form, 'any_jugat'), completat: text(form, 'completat'), valoracio: text(form, 'valoracio'),
      notes: record.notes, jugant: form.has('jugant'), revisat: record.revisat,
    }
    setBusy(true); setError(null)
    try {
      let recordId = record.id
      if (creating && !createdRecord.current) {
        recordId = await createRecord(kind, existingGame ? game.id : null, fields, details, platformResolved)
        createdRecord.current = recordId
      } else {
        recordId = createdRecord.current ?? record.id
        await saveRecord(kind, recordId, fields, details, platformResolved)
      }
      await setGamePlayingFromRecord(recordId, form.has('jugant'), rating, kind)
      const updated = await onSaved()
      const action = pendingNavigation.current
      if (creating) { if (action) action(); else onClose(); return }
      if (!updated) throw new Error('Les dades s’han desat, però no s’han pogut tornar a carregar. Torna-ho a provar.')
      resetDraft(updated)
      setBusy(false)
      setSaved(true)
      action?.()
    }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'No s’han pogut desar els canvis.'); setBusy(false) }
  }
  if (relatedCopy) return <RecordEditor key={relatedCopy.id} kind="exemplar" record={relatedCopy} game={game} catalog={catalog}
    onClose={() => setRelatedCopyId(null)} onSaved={async () => {
      const updated = await onSaved()
      if (updated) resetDraft(updated)
      return updated
    }} />
  return <dialog ref={dialog} onCancel={event => { event.preventDefault(); moveTo(onClose) }} aria-labelledby="detall-titol" className="m-auto max-h-[90dvh] w-[min(94vw,760px)] overflow-y-auto rounded-xl border bg-card p-6 text-foreground shadow-xl backdrop:bg-black/40">
    {choosingCopy && <section ref={copyChooser} aria-label="Tria un exemplar de la col·lecció" className="mb-4 rounded-lg border p-4">
      <h3 className="font-semibold">Tria un exemplar</h3>
      <div className="mt-3 flex flex-col gap-2">
        {ownedCopies.map(item => <Button key={item.id} type="button" variant="outline" className="h-auto justify-start whitespace-normal text-left [overflow-wrap:anywhere]" disabled={busy || confirmNavigation} onClick={() => moveTo(() => { setChoosingCopy(false); setRelatedCopyId(item.id) })}>
          {[item.format === 'fisic' ? 'Físic' : 'Digital', item.regio, item.botiga_servei, item.estat_conservacio,
            item.any_compra !== null ? `Compra: ${item.any_compra}` : null,
            item.preu !== null ? `${item.preu} €` : null, `ID: ${item.id}`].filter(Boolean).join(' · ')}
        </Button>)}
      </div>
      <Button type="button" variant="outline" className="mt-3" onClick={() => setChoosingCopy(false)}>Cancel·la</Button>
    </section>}
    <header className="grid items-start gap-4 sm:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="min-w-0">
        <h2 id="detall-titol" className="min-w-0 text-xl font-semibold [overflow-wrap:anywhere]">
          {creating ? (copy ? 'Afegeix un exemplar' : 'Nova experiència de joc') : game.nom}
          {copy?.favorit && <span role="img" aria-label="Joc favorit" className="ml-2 inline-block align-middle text-sm font-normal text-muted-foreground"><span aria-hidden="true">★</span></span>}
        </h2>
        {!isEditing && !creating && <p className="mt-2 break-words text-base font-medium">{platformName(game.plataforma)}</p>}
      </div>
      <div className="flex min-w-0 flex-col items-end gap-2">
        {navigation && <nav aria-label="Recorre els registres des de la capçalera" className="flex max-w-full flex-wrap items-center justify-end gap-2">
          <Button type="button" variant="outline" disabled={busy || !navigation.previous || confirmNavigation} onClick={() => moveTo(navigation.previous)}>Anterior</Button>
          <span className="text-sm text-muted-foreground">{navigation.position} de {navigation.total}</span>
          <Button type="button" variant="outline" disabled={busy || !navigation.next || confirmNavigation} onClick={() => moveTo(navigation.next)}>Següent</Button>
        </nav>}
        <div className="flex max-w-full flex-wrap justify-end gap-2">
          {canEdit && !retired && !isEditing && !creating && <Button type="button" disabled={busy} onClick={() => { resetDraft(savedCatalog ?? initialCatalog); setEditing(true) }}>Edita</Button>}
          {isEditing && !retired && <>
            {!creating && <Button type="button" variant="outline" disabled={busy || confirmNavigation} onClick={undoChanges}>Desfés els canvis</Button>}
            <Button type="submit" form="detall-formulari" disabled={busy}>{busy ? 'Desant…' : creating ? 'Afegeix' : 'Desa els canvis'}</Button>
          </>}
          <Button type="button" variant="ghost" disabled={busy || confirmNavigation} onClick={() => moveTo(onClose)}>Tanca</Button>
        </div>
      </div>
    </header>
    {retired && <p className="mt-3 text-sm">Aquest exemplar està retirat. Pots consultar-ne les dades i recuperar-lo abans d’editar-lo.</p>}
    {isEditing ? <form id="detall-formulari" key={formVersion} ref={formRef} onSubmit={submit} onChange={() => { if (canEdit) { setDirty(true); setSaved(false) } }} className="mt-6 space-y-6">
      <fieldset disabled={busy || retired || !canEdit} className="space-y-6">
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-b pb-4">
        <Check name="jugant" label="Hi estic jugant" checked={Boolean(experience?.jugant || history.some(e => e.jugant))} />
        <Check name="per_jugar_aviat" label="Per jugar aviat" checked={game.per_jugar_aviat} />
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)] items-start gap-4 sm:grid-cols-[190px_minmax(0,1fr)] sm:gap-6">
        <div className="flex min-w-0 flex-col items-center gap-3">
          {displayImage && !imageError ? <img src={displayImage} alt={`Portada de ${game.nom || 'nou joc'}`} onError={() => setImageError(true)} className="max-h-72 w-full rounded-lg object-contain" /> : <div className="flex min-h-40 w-full items-center justify-center rounded-lg bg-muted"><BrandLogo className="w-12" /></div>}
          {imageError && <p className="text-xs text-muted-foreground">No s’ha pogut carregar la portada.</p>}
          {imageSource && <a className="text-xs underline" href={imageSource} target="_blank" rel="noreferrer">Imatge d’{imageSource.startsWith('https://www.igdb.com/') ? 'IGDB' : 'RAWG'}</a>}
          <GameRating rating={rating} className="mt-2 text-5xl leading-none" />
        </div>
        <div className="grid min-w-0 gap-3">
          <Field label="Nom"><input name="nom" required defaultValue={game.nom} className={control} /></Field>
          <Field label="Plataforma"><input name="plataforma" list="plataforma-opcions" required defaultValue={platformName(game.plataforma)} className={control} /><datalist id="plataforma-opcions">{platformOptions(catalog).map(option => <option key={option} value={option} />)}</datalist></Field>
          <Field label="Desenvolupadora"><input name="desenvolupadora" defaultValue={game.desenvolupadora ?? ''} className={control} /></Field>
          <Field label="Gènere"><input name="genere_principal" defaultValue={game.genere_principal ?? ''} className={control} /></Field>
          <Field label="Any de llançament"><input name="any_llancament" type="number" min="1" max="9999" defaultValue={game.any_llancament ?? ''} className={control} /></Field>
        </div>
      </div>
      {copy && <><div className="grid gap-4 sm:grid-cols-2">
        <Field label="Format"><select name="format" value={format} onChange={e => { setFormat(e.target.value as 'fisic' | 'digital'); setAddingService(false) }} className={control}><option value="fisic">Físic</option><option value="digital">Digital</option></select></Field>
        <Field label="Regió"><input name="regio" defaultValue={copy.regio ?? ''} className={control} /></Field>
        <Field label="Conservació"><input name="estat_conservacio" defaultValue={copy.estat_conservacio ?? ''} className={control} /></Field>
        <Field label="Any de compra"><input name="any_compra" type="number" min="1" max="9999" defaultValue={copy.any_compra ?? ''} className={control} /></Field>
        <Field label="Preu (€)"><input name="preu" type="number" min="0" step="0.01" defaultValue={copy.preu ?? ''} className={control} /></Field>
        {!platformResolved && <div><Field label="Botiga o servei"><select name="botiga_servei" value={addingService ? '__add__' : service} disabled={format === 'fisic'} onChange={e => { if (e.target.value === '__add__') setAddingService(true); else { setService(e.target.value); setAddingService(false) } }} className={`${control} disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground`}><option value="">En blanc</option>{services.map(s => <option key={s} value={s}>{s}</option>)}<option value="__add__">Afegeix una botiga o servei…</option></select></Field>
          {addingService && format === 'digital' && <div className="mt-2 flex items-end gap-2"><Field label="Nova botiga o servei"><input value={newService} onChange={e => setNewService(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addService() } }} className={control} /></Field><Button type="button" variant="outline" disabled={!newService.trim()} onClick={addService}>Afegeix</Button></div>}
        </div>}
      </div><div className="flex flex-wrap gap-4"><Check name="favorit" label="Favorit" checked={copy.favorit} /><Check name="per_infants" label="Per jugar amb infants" checked={Boolean(game.per_infants)} /><Check name="canvi" label="Possible venda o intercanvi" checked={copy.canvi} /><Check name="reproduccio" label="Reproducció" checked={copy.reproduccio} /><label className="flex min-h-10 items-center gap-2 text-sm"><input type="checkbox" name="no_localitzat" checked={notFound} onChange={e => setNotFound(e.target.checked)} />No localitzat</label></div></>}
      {experience && <><Check name="per_infants" label="Per jugar amb infants" checked={Boolean(game.per_infants)} /><div className="grid gap-4 sm:grid-cols-3">
        <Field label="Any de joc"><input name="any_jugat" type="number" min="1" max="9999" defaultValue={experience.any_jugat ?? ''} className={control} /></Field>
        <Field label="Completat"><select name="completat" defaultValue={experience.completat ?? ''} className={control}><option value="">En blanc</option><option value="si">Sí</option><option value="no">No</option><option value="no_aplicable">No aplicable</option></select></Field>
      </div></>}
      <Field label="Valoració del joc"><select name="valoracio" value={rating ?? ''} onChange={e => setRating((e.target.value || null) as Valoracio | null)} className={`${control} ${ratingColor(rating)}`}><option value="" className="text-foreground">En blanc</option>{(['A++', 'A+', 'A', 'B', 'C', 'D'] as const).map(value => <option key={value} className={ratingColor(value)}>{value}</option>)}</select></Field>
      <Field label="Comentaris"><textarea name="comentaris" rows={4} defaultValue={comments.value} disabled={comments.conflict} className={control} /></Field>
      {comments.conflict && <p role="status" className="text-sm text-amber-800">Hi ha comentaris diferents en els registres d’aquest joc. Cal revisar-los abans d’unificar-los; es conserven tots.</p>}
      {record.origen && <details className="text-xs"><summary className="cursor-pointer">Dades originals de l’Excel</summary><pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap rounded-lg bg-muted p-3">{JSON.stringify(record.origen, null, 2)}</pre></details>}
    </fieldset>{experience && <section className="mt-7 border-t pt-5"><h3 className="font-medium">A la col·lecció</h3>
      {ownedCopies.length ? <><p className="mt-2 text-sm">{ownedCopies.length} {ownedCopies.length === 1 ? 'exemplar' : 'exemplars'}</p><button type="button" disabled={busy || confirmNavigation} onClick={() => moveTo(openCollection)} className="mt-3 inline-block text-sm underline">Veure el joc a la col·lecció</button></> : <p className="mt-2 text-sm text-muted-foreground">Aquest joc no és a la col·lecció.</p>}
    </section>}
      <fieldset disabled={busy || retired || !canEdit}><details className="rounded-lg border p-4">
        <summary className="cursor-pointer font-medium">Configuració</summary>
        <section aria-label="Configuració de la portada" className="mt-4 space-y-4">
          <Field label="URL de la imatge"><input type="url" name="portada_url" pattern="https?://.*" value={image} onChange={e => { setImage(e.target.value); setImageSource(null); setImageError(false) }} className={control} placeholder="https://…" /></Field>
          <MetadataSearch name={game.nom} onImage={(url, source) => { setImage(url); setImageSource(source); setImageError(false); setDirty(true); setSaved(false) }} />
        </section>
      </details>
    </fieldset><div className="flex flex-wrap justify-end gap-2">
      <Button type="button" variant="outline" disabled={busy || confirmNavigation} onClick={() => moveTo(onClose)}>Tanca</Button>
        {canEdit && !retired && !creating && <Button type="button" variant="outline" disabled={busy || confirmNavigation} onClick={undoChanges}>Desfés els canvis</Button>}{canEdit && !retired && <Button disabled={busy}>{busy ? 'Desant…' : creating ? 'Afegeix' : 'Desa els canvis'}</Button>}</div>
    </form> : <RecordDetails kind={kind} record={record} game={game} catalog={catalog} onViewCollection={() => moveTo(openCollection)} />}
    {saved && <p role="status" className="mt-4 text-sm">Canvis desats.</p>}
    {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
    <div className="mt-6 flex flex-wrap justify-end gap-2">
      {canEdit && copy && !creating && <Button type="button" variant="outline" disabled={busy || confirmNavigation} onClick={() => moveTo(() => void (retired ? restore() : retire()))} className={retired ? 'mr-auto' : 'mr-auto text-red-700'}>{busy ? 'Actualitzant…' : retired ? 'Torna a la col·lecció' : 'Retira de la col·lecció'}</Button>}
      {!isEditing && <Button type="button" variant="outline" disabled={busy || confirmNavigation} onClick={() => moveTo(onClose)}>Tanca</Button>}
    </div>
      {navigation && <nav aria-label="Recorre els registres" className="flex items-center justify-between gap-3 border-t pt-4">
        <Button type="button" variant="outline" disabled={busy || !navigation.previous || confirmNavigation} onClick={() => moveTo(navigation.previous)}>Anterior</Button>
        <p className="text-sm text-muted-foreground">{navigation.position} de {navigation.total}</p>
        <Button type="button" variant="outline" disabled={busy || !navigation.next || confirmNavigation} onClick={() => moveTo(navigation.next)}>Següent</Button>
      </nav>}
      {confirmNavigation && <section ref={confirmation} role="alert" className="rounded-lg border p-4">
        <p className="text-sm">Tens canvis sense desar. Què vols fer abans de continuar?</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" disabled={busy} onClick={() => formRef.current?.requestSubmit()}>Desa i continua</Button>
          <Button type="button" variant="outline" disabled={busy} onClick={() => { const action = pendingNavigation.current; resetDraft(savedCatalog ?? initialCatalog); action?.() }}>Descarta i continua</Button>
          <Button type="button" variant="outline" disabled={busy} onClick={() => { pendingNavigation.current = null; setConfirmNavigation(false) }}>Continua editant</Button>
        </div>
      </section>}
  </dialog>
}



