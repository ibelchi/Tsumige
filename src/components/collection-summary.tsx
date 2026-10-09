import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
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

function GameList({ title, games, isLoading }: { title: string; games: JocLlista[] | undefined; isLoading: boolean }) {
  return (
    <section aria-label={title} className="@container min-w-0 rounded-xl border bg-card px-5 py-4">
      <h2 className="text-sm font-medium">{title}</h2>
      {games === undefined ? (
        <p className="mt-4 text-sm text-muted-foreground">{isLoading ? 'Carregant jocs…' : 'Dades pendents de connectar.'}</p>
      ) : games.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Cap joc marcat.</p>
      ) : (
        <ul className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-6">
          {games.map((game) => <li key={game.id} className="min-w-0 shrink-0 grow-0 basis-full @min-[22rem]:basis-[calc((100%_-_1rem)/2)] @min-[32rem]:basis-[calc((100%_-_2rem)/3)]"><Link to={`/?vista=detall&joc=${game.id}`} aria-label={`Obre el detall de ${game.nom}`} className="block rounded-lg text-center hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"><SummaryCover key={`${game.id}-${game.portada_url}`} game={game} /><div className="mt-3 min-w-0"><p className="break-words text-sm font-medium leading-snug">{game.nom}</p><p className="mt-1 break-words text-xs text-muted-foreground">{game.plataforma}</p></div></Link></li>)}
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
  const counters = [
    { label: 'Jocs físics', value: data?.fisics },
    { label: 'Jocs digitals', value: data?.digitals },
  ]

  return (
    <section aria-label="Resum de la col·lecció" aria-busy={isFetching} className="mt-8">
      <div className="grid grid-cols-2 gap-3">
        {counters.map(({ label, value }) => (
          <div key={label} className="rounded-xl border bg-card px-5 py-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 font-mono text-2xl font-medium">{value ?? '—'}</p></div>
        ))}
      </div>
      <div className="mt-3 grid items-start gap-3 sm:grid-cols-2">
        <GameList title="Jugant" games={data?.jugant} isLoading={isFetching} />
        <GameList title="Per jugar aviat" games={data?.per_jugar_aviat} isLoading={isFetching} />
      </div>
      {!isSupabaseConfigured && <p className="mt-3 text-xs text-muted-foreground">Connecta Supabase per consultar les dades de la col·lecció.</p>}
      {error && <p role="alert" className="mt-3 text-sm text-muted-foreground">{error.message}</p>}
    </section>
  )
}
