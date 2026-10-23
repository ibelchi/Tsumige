import { Search } from 'lucide-react'
import { HomeSummaryCards } from '@/components/home-summary-cards'
import { HomeGameSearch } from '@/components/home-game-search'
import { Button } from '@/components/ui/button'
import { summaryExpansion } from '@/lib/summary-expansion'
import { platformName } from '@/lib/platform'
import { useQuery } from '@tanstack/react-query'
import { useId, useState, useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import { BrandLogo } from '@/components/brand-logo'
import { isSupabaseConfigured } from '@/lib/supabase'
import { getResumJocs } from '@/lib/jocs'
import type { JocLlista } from '@/lib/database.types'
import { useAuth } from '@/lib/auth'

function SummaryCover({ game }: { game: JocLlista }) {
  const [failed, setFailed] = useState(false)
  return <div className="flex h-56 w-full min-w-0 items-center justify-center @min-[22rem]:h-64">
    {game.portada_url && !failed ? <img src={game.portada_url} alt="" loading="lazy" onError={() => setFailed(true)} className="h-full w-full rounded object-contain" /> : <BrandLogo className="w-16" />}
  </div>
}

export function GameList({ title, games, isLoading, owner = "" }: { title: string; games: JocLlista[] | undefined; isLoading: boolean; owner?: string }) {
  const key = `${owner}:${title}`
  const expanded = useSyncExternalStore(summaryExpansion.subscribe, () => summaryExpansion.get(key), () => summaryExpansion.get(key))
  const listId = useId()
  const visible = expanded ? games : games?.slice(0, 3)
  const hidden = Math.max(0, (games?.length ?? 0) - 3)
  return (
    <section aria-label={title} className={`@container min-w-0 rounded-xl border bg-card px-5 py-4 ${games?.length ? "md:min-h-[26rem]" : ""}`}>
      <header className="flex items-center justify-between gap-3"><h2 className="text-sm font-medium">{title}</h2>{hidden > 0 && <Button type="button" variant="ghost" size="sm" className="min-h-10" aria-expanded={expanded} aria-controls={listId} aria-label={expanded ? `Mostra només els tres primers jocs de ${title}` : `Mostra els ${hidden} jocs amagats de ${title}`} title={expanded ? "Mostra’n tres" : "Mostra tots els jocs"} onClick={() => summaryExpansion.set(key, !expanded)}>{expanded ? "−" : `+${hidden}`}</Button>}</header>
      {games === undefined ? (
        <p className="mt-4 text-sm text-muted-foreground">{isLoading ? 'Carregant jocs…' : 'Dades pendents de connectar.'}</p>
      ) : games.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Cap joc marcat.</p>
      ) : (
        <ul id={listId} className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-6">
          {visible!.map((game) => <li key={game.id} className="min-w-0 shrink-0 grow-0 basis-full @min-[22rem]:basis-[calc((100%_-_1rem)/2)] @min-[32rem]:basis-[calc((100%_-_2rem)/3)]"><Link to={`/?vista=detall&joc=${game.id}`} aria-label={`Obre el detall de ${game.nom}`} className="block rounded-lg text-center hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"><SummaryCover key={`${game.id}-${game.portada_url}`} game={game} /><div className="mt-3 min-w-0"><p className="break-words text-sm font-medium leading-snug">{game.nom}</p><p className="mt-1 break-words text-xs text-muted-foreground">{platformName(game.plataforma)}</p></div></Link></li>)}
        </ul>
      )}
    </section>
  )
}

export function CollectionSummary() {
  const { session } = useAuth()
  const { data, isFetching, error } = useQuery({
    queryKey: ['jocs', session?.user.id, 'resum'],
    queryFn: getResumJocs,
    enabled: isSupabaseConfigured && Boolean(session),
    retry: false,
  })

  return (
    <section aria-label="Resum de la col·lecció" aria-busy={isFetching} className="mt-8">
      <HomeSummaryCards />
      <section aria-labelledby="home-search-title" className="mt-4 space-y-2">
        <h2 id="home-search-title" className="flex items-center gap-2 text-sm font-medium"><Search aria-hidden="true" className="size-4"/>Cerca un joc</h2>
        <HomeGameSearch />
      </section>
      <div className="mt-3 grid items-start gap-3 md:grid-cols-2">
        <GameList title="Jugant" games={data?.jugant} isLoading={isFetching} owner={session?.user.id} />
        <GameList title="Per jugar aviat" games={data?.per_jugar_aviat} isLoading={isFetching} owner={session?.user.id} />
      </div>
      {!isSupabaseConfigured && <p className="mt-3 text-xs text-muted-foreground">Connecta Supabase per consultar les dades de la col·lecció.</p>}
      {error && <p role="alert" className="mt-3 text-sm text-muted-foreground">{error.message}</p>}
    </section>
  )
}
