import { platformName } from '@/lib/platform'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getCatalog, setPlaying, setUpcoming } from '@/lib/catalog'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { RecordCreator } from '@/components/record-creator'

export function TrackingPage() {
  const { session } = useAuth()
  const client = useQueryClient()
  const [search, setSearch] = useState('')
  const [onlyMarked, setOnlyMarked] = useState(false)
  const [busy, setBusy] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [creatingFor, setCreatingFor] = useState<string | null>(null)
  const { data, error, isPending } = useQuery({ queryKey: ['catalog', session?.user.id], queryFn: getCatalog, enabled: Boolean(session) })
  async function update(kind: 'playing' | 'upcoming', id: string, value: boolean) {
    setBusy(true); setSaveError(null)
    try {
      await (kind === 'playing' ? setPlaying(id, value) : setUpcoming(id, value))
      await Promise.all([client.invalidateQueries({ queryKey: ['catalog'] }), client.invalidateQueries({ queryKey: ['jocs'] })])
    } catch (caught) { setSaveError(caught instanceof Error ? caught.message : 'No s’ha pogut desar.') }
    finally { setBusy(false) }
  }
  const games = data?.jocs.filter(game => game.nom.toLocaleLowerCase().includes(search.toLocaleLowerCase()) && (!onlyMarked || game.per_jugar_aviat || data.experiencies.some(e => e.joc_id === game.id && e.jugant))) ?? []
  return <div className="page-container">
    <h1 className="page-title">Seguiment</h1>
    <p className="mt-3 text-sm text-muted-foreground">Tria els jocs que vols jugar aviat i marca les experiències que estàs jugant. Els canvis es desen automàticament.</p>
    <div className="mt-6 flex flex-wrap items-center gap-4"><label className="grow"><span className="sr-only">Cerca per nom</span><input type="search" placeholder="Cerca jocs…" value={search} onChange={e => setSearch(e.target.value)} className="h-10 w-full rounded-lg border bg-card px-3 text-sm" /></label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={onlyMarked} onChange={e => setOnlyMarked(e.target.checked)} />Només marcats</label></div>
    {(error || saveError) && <p role="alert" className="mt-4 text-sm text-red-700">{error?.message ?? saveError}</p>}
    {isPending ? <p role="status" className="mt-5">Carregant…</p> : <p role="status" className="mt-4 text-sm text-muted-foreground">{games.length} {games.length === 1 ? 'joc' : 'jocs'}</p>}
    <div className="mt-5 grid items-start gap-3 md:grid-cols-2">{games.map(game => {
      const experiences = data!.experiencies.filter(e => e.joc_id === game.id)
      return <section key={game.id} aria-label={`${game.nom} · ${platformName(game.plataforma)}`} className="rounded-xl border bg-card p-5">
        <h2 className="font-medium">{game.nom}</h2><p className="mt-1 text-sm text-muted-foreground">{platformName(game.plataforma)}</p>
        <label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={game.per_jugar_aviat} disabled={busy} onChange={e => void update('upcoming', game.id, e.target.checked)} />Per jugar aviat</label>
        {experiences.length > 0 && <div className="mt-4 border-t pt-3"><h3 className="text-sm font-medium">Jugant</h3>{experiences.map((e, index) => <label key={e.id} className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={e.jugant} disabled={busy} onChange={event => void update('playing', e.id, event.target.checked)} /><span>Experiència {index + 1} · {e.any_jugat ?? 'Any no indicat'}</span></label>)}<Link className="mt-3 inline-block text-sm underline" to={`/?vista=jugats&joc=${game.id}`}>Veure les experiències</Link></div>}
        <Button variant="outline" size="sm" className="mt-4" onClick={() => setCreatingFor(game.id)}>Nova experiència</Button>
      </section>
    })}</div>
    {creatingFor && data && <RecordCreator kind="experiencia" catalog={data} initialGameId={creatingFor} onClose={() => setCreatingFor(null)} onSaved={async () => { await Promise.all([client.invalidateQueries({ queryKey: ['catalog'] }), client.invalidateQueries({ queryKey: ['jocs'] })]) }} />}
  </div>
}
