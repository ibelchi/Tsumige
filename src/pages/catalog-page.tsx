import { collectionQuickFilter, toggleCollectionQuickFilter } from '@/lib/collection-quick-filter'
import { Star, Baby } from 'lucide-react'
import { initialCollectionView, rememberCollectionView, type CollectionView } from '@/lib/collection-view'
import { collectionCopy, platformName } from '@/lib/platform'
import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { HistoryList } from '@/components/history-list'
import { gameRating } from '@/lib/game-rating'
import { RecordEditor } from '@/components/record-editor'
import { RecordCreator } from '@/components/record-creator'
import { CollectionCard, CollectionListRow } from '@/components/collection-card'
import { getCatalog, type Catalog } from '@/lib/catalog'
import { useAuth } from '@/lib/auth'
import { useAccess } from '@/lib/access'

export function CatalogPage({ history = false }: { history?: boolean }) {
  const { session } = useAuth()
  const { canEdit } = useAccess()
  const client = useQueryClient()
  const [params, setParams] = useSearchParams()
  const gameFilter = params.get('joc')
  const platformMenu = useRef<HTMLDetailsElement>(null)
  useEffect(() => {
    function closeOutside(event: PointerEvent) {
      if (event.target instanceof Node && !platformMenu.current?.contains(event.target)) {
        if (platformMenu.current) platformMenu.current.open = false
      }
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && platformMenu.current?.open) {
        platformMenu.current.open = false
        platformMenu.current.querySelector('summary')?.focus()
      }
    }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])
  const [search, setSearch] = useState('')
  const platforms = [...new Set(params.getAll('plataforma').map(platformName))]
  const formats = params.has('format') ? params.getAll('format') : ['fisic', 'digital']
  const genre = params.get('genere') ?? ''
  function changeFilter(name: string, values: string[]) {
    setParams(previous => {
      const next = new URLSearchParams(previous)
      next.delete(name)
      values.forEach(value => next.append(name, value))
      return next
    })
  }
  function toggleFilter(name: string, values: string[], value: string, checked: boolean) {
    const next = checked ? [...values, value] : values.filter(item => item !== value)
    changeFilter(name, name === 'format' && !next.length ? [''] : next)
  }
  const explicitView = params.get('presentacio')
  const [view, setView] = useState<CollectionView>(() => initialCollectionView(explicitView))
  useEffect(() => {
    if (explicitView === 'list' || explicitView === 'cards') setView(explicitView)
  }, [explicitView])
  function chooseView(next: CollectionView) {
    setView(next)
    rememberCollectionView(next)
    changeFilter('presentacio', [next])
  }
  const quickFilter = history ? null : collectionQuickFilter(params)
  const onlyChildren = quickFilter === 'infants'
  const onlyFavorites = quickFilter === 'favorits'
  useEffect(() => {
    if (!history && params.get('favorits') === '1' && params.has('infants')) {
      setParams(previous => { const next = new URLSearchParams(previous); next.delete('infants'); return next }, { replace: true })
    }
  }, [history, params, setParams])
  const [order, setOrder] = useState('az')
  const [year, setYear] = useState(() => /^\d{1,4}$/.test(params.get('any') ?? '') ? params.get('any')! : 'all')
  const fromHome = params.get('origen') === 'inici'
  useEffect(() => { if (fromHome) setSearch('') }, [fromHome])
  const [navigationIds, setNavigationIds] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [initialCollectionId, setInitialCollectionId] = useState<string | null>(null)
  const [addingCollectionGame, setAddingCollectionGame] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const { data, error, isPending } = useQuery({ queryKey: ['catalog', session?.user.id], queryFn: getCatalog, enabled: Boolean(session) })
  const games = new Map(data?.jocs.map(j => [j.id, j]) ?? [])
  const active = data?.exemplars.filter(e => collectionCopy(e, games.get(e.joc_id))) ?? []
  const records = history ? (data?.experiencies ?? []).filter(e => e.any_jugat !== null) : active
  const rows = records.filter(r => {
    const j = games.get(r.joc_id)
    return j && (!onlyChildren || j.per_infants === true) && (!onlyFavorites || ('favorit' in r && r.favorit === true)) && (!gameFilter || j.id === gameFilter) && j.nom.toLocaleLowerCase().includes(search.toLocaleLowerCase()) && (!platforms.length || platforms.includes(platformName(j.plataforma) || 'Sense plataforma')) && (!genre || (j.genere_principal?.trim() || 'Sense gènere') === genre) && (history || ('format' in r && formats.includes(r.format))) && (!history || year === 'all' || ('any_jugat' in r && r.any_jugat === Number(year)))
  }).sort((a, b) => {
    if (order === 'year' && 'any_jugat' in a && 'any_jugat' in b) return (b.any_jugat ?? 0) - (a.any_jugat ?? 0)
    const result = (games.get(a.joc_id)?.nom ?? '').localeCompare(games.get(b.joc_id)?.nom ?? '', 'ca')
    return order === 'za' ? -result : result
  })
  const chosen = (history ? data?.experiencies : data?.exemplars)?.find(r => r.id === selected)
  const chosenGame = chosen ? games.get(chosen.joc_id) : undefined
  const navigationRows = history ? [...rows].sort((a, b) => ('any_jugat' in b ? b.any_jugat ?? 0 : 0) - ('any_jugat' in a ? a.any_jugat ?? 0 : 0)) : rows
  function openRecord(id: string, collection = false) {
    setInitialCollectionId(collection ? id : null)
    setNavigationIds(navigationRows.map(row => row.id))
    setSelected(id)
  }
  const currentIndex = navigationIds.indexOf(selected ?? '')
  const navigation = currentIndex < 0 ? undefined : {
    position: currentIndex + 1, total: navigationIds.length,
    previous: currentIndex > 0 ? () => { setInitialCollectionId(null); setSelected(navigationIds[currentIndex - 1]) } : undefined,
    next: currentIndex < navigationIds.length - 1 ? () => { setInitialCollectionId(null); setSelected(navigationIds[currentIndex + 1]) } : undefined,
  }
  async function refresh() {
    await Promise.all([client.invalidateQueries({ queryKey: ['catalog'] }, { throwOnError: true }), client.invalidateQueries({ queryKey: ['jocs'] })])
    return client.getQueryData<Catalog>(['catalog', session?.user.id])
  }
  return <div className="page-container collection-layout">
    <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="page-title">{history ? 'log' : 'Col·lecció'}</h1><div className="flex flex-wrap gap-2">{canEdit && <Button disabled={!data} onClick={() => setCreating(true)}>{history ? 'Afegeix una entrada' : 'Afegeix un joc'}</Button>}</div></div>
    {((history && params.has('any')) || params.has('plataforma') || params.has('genere')) && <Link to="/?vista=estadistiques" className="mt-4 inline-block text-sm underline">Torna a Estadístiques</Link>}
    <div className="mt-8 flex flex-wrap items-center gap-3 border-b pb-5">
      {history && <label className="text-sm">Any <select aria-label="Filtra per any de joc" value={year} onChange={e => setYear(e.target.value)} className="ml-2 h-10 rounded-lg border bg-card px-3"><option value="all">Tots els anys</option>{[...new Set([new Date().getFullYear(), ...(data?.experiencies.flatMap(e => e.any_jugat === null ? [] : [e.any_jugat]) ?? [])])].sort((a, b) => b - a).map(value => <option key={value} value={value}>{value}</option>)}</select></label>}
      <div className="min-w-0 grow basis-64"><label className="block text-sm"><span className="sr-only">Cerca per nom</span><input type="search" placeholder="Cerca jocs…" value={search} onChange={e => setSearch(e.target.value)} className="h-10 w-full rounded-lg border bg-card px-3" /></label>
        {!history && <div role="group" aria-label="Filtres ràpids de Col·lecció" className="mt-2 flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" aria-pressed={onlyFavorites} onClick={() => setParams(previous => toggleCollectionQuickFilter(previous, 'favorits'))} className={`min-h-10 ${onlyFavorites ? 'border-primary/40 bg-primary/10 text-primary hover:bg-primary/15' : ''}`}><Star aria-hidden="true" className="size-4 shrink-0 fill-current text-[#996515]"/>Favorits</Button>
          <Button type="button" variant="outline" size="sm" aria-pressed={onlyChildren} onClick={() => setParams(previous => toggleCollectionQuickFilter(previous, 'infants'))} className={`min-h-10 ${onlyChildren ? 'border-primary/40 bg-primary/10 text-primary hover:bg-primary/15' : ''}`}><Baby aria-hidden="true" className="size-4 shrink-0"/>Amb infants</Button>
        </div>}
      </div>
      {!history && <fieldset className="flex items-center gap-3 text-sm"><legend className="sr-only">Format de la col·lecció</legend>{[{value: 'fisic', label: 'Físics'}, {value: 'digital', label: 'Digitals'}].map(f => <label key={f.value} className="flex min-h-10 items-center gap-2"><input type="checkbox" checked={formats.includes(f.value)} onChange={e => toggleFilter('format', formats, f.value, e.target.checked)} />{f.label}</label>)}</fieldset>}
      <details ref={platformMenu} className="relative text-sm"><summary className="cursor-pointer rounded-lg border bg-card px-3 py-2.5">Plataformes · {platforms.length ? `${platforms.length} seleccionades` : 'Totes'}</summary><fieldset className="absolute left-0 z-10 mt-2 max-h-80 w-64 overflow-auto rounded-lg border bg-card p-3 shadow-lg"><legend className="sr-only">Filtra per plataformes</legend><Button type="button" variant="outline" size="sm" className="mb-2 w-full" onClick={() => changeFilter('plataforma', [])}>Totes les plataformes</Button>{[...new Set(records.map(r => platformName(games.get(r.joc_id)?.plataforma ?? '') || 'Sense plataforma'))].sort().map(p => <label key={p} className="flex min-h-10 items-center gap-2"><input type="checkbox" checked={platforms.includes(p)} onChange={e => toggleFilter('plataforma', platforms, p, e.target.checked)} />{p}</label>)}</fieldset></details>
      {!history && <select aria-label="Filtra per gènere" value={genre} onChange={e => changeFilter('genere', e.target.value ? [e.target.value] : [])} className="h-10 max-w-full rounded-lg border bg-card px-3 text-sm"><option value="">Tots els gèneres</option>{[...new Set(records.map(r => games.get(r.joc_id)?.genere_principal?.trim() || 'Sense gènere'))].sort((a, b) => a === 'Sense gènere' ? 1 : b === 'Sense gènere' ? -1 : a.localeCompare(b, 'ca')).map(value => <option key={value} value={value}>{value}</option>)}</select>}
      {!history && <select aria-label="Ordena els registres" value={order} onChange={e => setOrder(e.target.value)} className="h-10 rounded-lg border bg-card px-3 text-sm"><option value="az">Nom A–Z</option><option value="za">Nom Z–A</option></select>}
      {!history && <div role="group" aria-label="Vista de la col·lecció" className="flex gap-1"><Button size="sm" variant={view === 'list' ? 'default' : 'outline'} aria-pressed={view === 'list'} onClick={() => chooseView('list')}>Llista</Button><Button size="sm" variant={view === 'cards' ? 'default' : 'outline'} aria-pressed={view === 'cards'} onClick={() => chooseView('cards')}>Galeria</Button></div>}
    </div>
    {gameFilter && <p className="mt-4 text-sm">Mostrant {games.get(gameFilter)?.nom ?? 'un joc'}. <Link className="underline" to={history ? '/?vista=jugats' : '/?vista=colleccio'}>Mostra tots els registres</Link></p>}
    {(!history || isPending) && <p role="status" className="mt-4 text-sm text-muted-foreground">{isPending ? 'Carregant…' : `${rows.length} exemplars`}</p>}
    {error && <p role="alert" className="mt-4 text-sm text-red-700">{error.message}</p>}
    {history && data ? <HistoryList rows={rows.filter((r): r is import('@/lib/database.types').Experiencia => 'any_jugat' in r)} games={games} experiences={data.experiencies} year={year} onOpen={openRecord} copies={data.exemplars} onOpenCollection={id => openRecord(id, true)} onAddCollection={canEdit ? setAddingCollectionGame : undefined} /> : <section aria-label={history ? 'Llista d’entrades de log' : 'Jocs de la col·lecció'} className={history ? 'mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3' : view === 'cards' ? 'collection-gallery mt-5 grid gap-4' : 'mt-5 overflow-hidden rounded-xl border bg-card divide-y'}>
      {rows.map(r => {
        const j = games.get(r.joc_id)!

        const c = 'format' in r ? r : null
        if (!history && view === 'list' && c) return <CollectionListRow key={r.id} game={j} copy={c} rating={gameRating(j, data?.experiencies ?? [])} onOpen={() => openRecord(r.id)} />
        if (c) return <CollectionCard key={r.id} game={j} copy={c} rating={gameRating(j, data?.experiencies ?? [])} onOpen={() => openRecord(r.id)} />
        return null
      })}
    </section>}
    {(['igdb', 'rawg'] as const).map(provider => rows.some(r => games.get(r.joc_id)?.portada_font_url?.startsWith(provider === 'igdb' ? 'https://www.igdb.com/' : 'https://rawg.io/')) && <p key={provider} className="mt-3 text-xs text-muted-foreground">Algunes imatges provenen d’<a href={provider === 'igdb' ? 'https://www.igdb.com' : 'https://rawg.io'} target="_blank" rel="noreferrer" className="underline">{provider.toUpperCase()}</a>.</p>)}
    {!isPending && !error && rows.length === 0 && <p className="mt-8 text-sm text-muted-foreground">No hi ha registres amb aquests filtres.</p>}
    {chosen && chosenGame && data && <RecordEditor key={chosen.id} kind={history ? 'experiencia' : 'exemplar'} record={chosen} game={chosenGame} catalog={data} navigation={navigation} initialCollection={initialCollectionId === chosen.id} onClose={() => setSelected(null)} onSaved={refresh} />}
    {canEdit && addingCollectionGame && data && <RecordCreator kind="exemplar" catalog={data} initialGameId={addingCollectionGame} collectionOnly onClose={() => setAddingCollectionGame(null)} onSaved={refresh} />}
    {canEdit && creating && data && <RecordCreator kind={history ? 'experiencia' : 'exemplar'} catalog={data} initialGameId={gameFilter ?? undefined} onClose={() => setCreating(false)} onSaved={refresh} />}
  </div>
}

