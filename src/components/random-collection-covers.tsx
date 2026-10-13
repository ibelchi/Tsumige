import { platformName } from '@/lib/platform'
import { useEffect, useSyncExternalStore } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { eligibleRandomGames, reconcileRandomGames, renewRandomGames, randomVisit } from '@/lib/random-collection'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getCatalog, type Catalog } from '@/lib/catalog'
import { useAuth } from '@/lib/auth'

function CoverSelection({ catalog, owner }: { catalog: Catalog; owner: string }) {
  const ids = useSyncExternalStore(randomVisit.subscribe, () => randomVisit.get(owner), () => randomVisit.get(owner))
  useEffect(() => { randomVisit.set(owner, reconcileRandomGames(randomVisit.get(owner), eligibleRandomGames(catalog))) }, [catalog, owner])
  const eligible = eligibleRandomGames(catalog)
  const games = ids.flatMap(id => {
    const game = catalog.jocs.find(item => item.id === id)
    return game && eligible.includes(id) ? [game] : []
  })
  const covers = games.length ? <ul className="mt-4 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,8rem),1fr))]">
    {games.map(game => <li key={game.id} className="min-w-0"><Link to={`/?vista=detall&joc=${game.id}`} aria-label={`Obre el detall de ${game.nom}`} className="block rounded-lg hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring">
      <div className="flex h-56 items-center justify-center sm:h-64"><img src={game.portada_visual_url || game.portada_url!} alt="" loading="lazy" className="h-full w-full object-contain" /></div>
      <p className="mt-3 text-center break-words text-sm font-medium leading-snug">{game.nom}</p><p className="mt-1 text-center break-words text-xs text-muted-foreground">{platformName(game.plataforma)}</p>
    </Link></li>)}
  </ul> : <p className="mt-4 text-sm text-muted-foreground">No hi ha jocs actius amb portada a la col·lecció.</p>
  return <><header className="flex items-center gap-2"><h2 className="font-semibold">Jocs a l’atzar</h2><Button type="button" variant="ghost" size="icon" className="size-11 text-green-700" aria-label="Renova els jocs a l’atzar" onClick={() => randomVisit.set(owner, renewRandomGames(ids, eligible))} disabled={!eligible.length}><RefreshCw aria-hidden="true" /></Button></header>{covers}</>
}

export function RandomCollectionCovers() {
  const { session } = useAuth()
  const { data, error, isPending } = useQuery({ queryKey: ['catalog', session?.user.id], queryFn: getCatalog, enabled: Boolean(session) })
  return <section aria-label="Jocs a l’atzar" className="mt-3 rounded-xl border bg-card p-5">
    {error ? <p role="alert" className="mt-4 text-sm">{error.message}</p> : isPending ? <p role="status" className="mt-4 text-sm text-muted-foreground">Carregant portades…</p> : <CoverSelection owner={session?.user.id ?? ""} catalog={data} />}
  </section>
}
