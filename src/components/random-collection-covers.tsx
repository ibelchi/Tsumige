import { platformName } from '@/lib/platform'
import { useEffect, useState, useSyncExternalStore } from 'react'
import { Button } from '@/components/ui/button'
import { eligibleRandomGames, reconcileRandomGames, renewFilterSelection, randomVisit, randomFilters, randomFilterLabels, savedRandomFilter, type RandomFilter } from '@/lib/random-collection'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getCatalog, type Catalog } from '@/lib/catalog'
import { useAuth } from '@/lib/auth'

export function CoverSelection({ catalog, owner }: { catalog: Catalog; owner: string }) {
  const [filter, setFilter] = useState<RandomFilter>(savedRandomFilter)
  const ids = useSyncExternalStore(randomVisit.subscribe, () => randomVisit.get(owner, filter), () => randomVisit.get(owner, filter))
  useEffect(() => { randomVisit.set(owner, reconcileRandomGames(randomVisit.get(owner, filter), eligibleRandomGames(catalog, filter)), filter) }, [catalog, owner, filter])
  const eligible = eligibleRandomGames(catalog, filter)
  const games = ids.flatMap(id => {
    const game = catalog.jocs.find(item => item.id === id)
    return game && eligible.includes(id) ? [game] : []
  })
  const covers = games.length ? <ul className="mt-4 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,8rem),1fr))]">
    {games.map(game => <li key={game.id} className="min-w-0"><Link to={`/?vista=detall&joc=${game.id}`} aria-label={`Obre el detall de ${game.nom}`} className="block rounded-lg hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring">
      <div className="flex h-56 items-center justify-center sm:h-64"><img src={game.portada_visual_url || game.portada_url!} alt="" loading="lazy" className="h-full w-full object-contain" /></div>
      <p className="mt-3 text-center break-words text-sm font-medium leading-snug">{game.nom}</p><p className="mt-1 text-center break-words text-xs text-muted-foreground">{platformName(game.plataforma)}</p>
    </Link></li>)}
  </ul> : <p className="mt-4 text-sm text-muted-foreground">No hi ha jocs amb portada per a aquest filtre.</p>
  return <><header className="flex flex-wrap items-center justify-between gap-2"><h2 className="min-w-0 font-semibold [overflow-wrap:anywhere]">Jocs a l’atzar</h2><div role="group" aria-label="Filtra i renova els jocs a l’atzar" className="ml-auto flex gap-2">{randomFilters.map(option => <Button key={option} type="button" size="sm" variant="outline" aria-label={`Renova els jocs a l’atzar: ${randomFilterLabels[option]}`} title={`Nova selecció: ${randomFilterLabels[option]}`} aria-pressed={filter === option} className={`min-h-10 ${filter === option ? 'border-primary/40 bg-primary/10 text-primary hover:bg-primary/15' : ''}`} onClick={() => {
    renewFilterSelection(owner, option, catalog)
    setFilter(option)
    try {window.localStorage.setItem('tsumige.random.filter', option)} catch { /* Funciona sense Storage. */ }
  }}>{randomFilterLabels[option]}</Button>)}</div></header>{covers}</>
}

export function RandomCollectionCovers() {
  const { session } = useAuth()
  const { data, error, isPending } = useQuery({ queryKey: ['catalog', session?.user.id], queryFn: getCatalog, enabled: Boolean(session) })
  return <section aria-label="Jocs a l’atzar" className="mt-3 rounded-xl border bg-card p-5">
    {error ? <p role="alert" className="mt-4 text-sm">{error.message}</p> : isPending ? <p role="status" className="mt-4 text-sm text-muted-foreground">Carregant portades…</p> : <CoverSelection owner={session?.user.id ?? ""} catalog={data} />}
  </section>
}
