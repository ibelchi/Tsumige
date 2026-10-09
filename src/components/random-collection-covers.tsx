import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getCatalog, type Catalog } from '@/lib/catalog'
import { useAuth } from '@/lib/auth'

function CoverSelection({ catalog }: { catalog: Catalog }) {
  const [ids] = useState(() => {
    const active = new Set(catalog.exemplars.filter(copy => copy.a_la_colleccio).map(copy => copy.joc_id))
    const candidates = catalog.jocs.filter(game => active.has(game.id) && (game.portada_visual_url || game.portada_url)).map(game => game.id)
    // Shuffle once on entry, independently of subsequent query refreshes.
    for (let index = candidates.length - 1; index > 0; index--) {
      const other = Math.floor(Math.random() * (index + 1))
      ;[candidates[index], candidates[other]] = [candidates[other], candidates[index]]
    }
    return candidates.slice(0, 3)
  })
  const games = ids.flatMap(id => {
    const game = catalog.jocs.find(item => item.id === id)
    return game && (game.portada_visual_url || game.portada_url) && catalog.exemplars.some(copy => copy.joc_id === id && copy.a_la_colleccio) ? [game] : []
  })
  return games.length ? <ul className="mt-4 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,8rem),1fr))]">
    {games.map(game => <li key={game.id} className="min-w-0"><Link to={`/?vista=detall&joc=${game.id}`} aria-label={`Obre el detall de ${game.nom}`} className="block rounded-lg hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring">
      <div className="flex h-56 items-center justify-center sm:h-64"><img src={game.portada_visual_url || game.portada_url!} alt="" loading="lazy" className="h-full w-full object-contain" /></div>
      <p className="mt-3 text-center break-words text-sm font-medium leading-snug">{game.nom}</p><p className="mt-1 text-center break-words text-xs text-muted-foreground">{game.plataforma}</p>
    </Link></li>)}
  </ul> : <p className="mt-4 text-sm text-muted-foreground">No hi ha jocs actius amb portada a la col·lecció.</p>
}

export function RandomCollectionCovers() {
  const { session } = useAuth()
  const { data, error, isPending } = useQuery({ queryKey: ['catalog', session?.user.id], queryFn: getCatalog, enabled: Boolean(session) })
  return <section aria-label="Jocs a l’atzar" className="mt-3 rounded-xl border bg-card p-5">
    <h2 className="font-semibold">Jocs a l’atzar</h2>
    {error ? <p role="alert" className="mt-4 text-sm">{error.message}</p> : isPending ? <p role="status" className="mt-4 text-sm text-muted-foreground">Carregant portades…</p> : <CoverSelection key={session?.user.id} catalog={data} />}
  </section>
}
