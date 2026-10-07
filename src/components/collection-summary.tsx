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
  return <div className="flex h-24 w-16 shrink-0 items-center justify-center">
    {game.portada_url && !failed ? <img src={game.portada_url} alt="" loading="lazy" onError={() => setFailed(true)} className="h-full w-full rounded object-contain" /> : <BrandLogo className="w-9" />}
  </div>
}

function GameList({ title, games, isLoading }: { title: string; games: JocLlista[] | undefined; isLoading: boolean }) {
  return (
    <section aria-label={title} className="rounded-xl border bg-card px-5 py-4">
      <h2 className="text-sm font-medium">{title}</h2>
      {games === undefined ? (
        <p className="mt-4 text-sm text-muted-foreground">{isLoading ? 'Carregant jocs…' : 'Dades pendents de connectar.'}</p>
      ) : games.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Cap joc marcat.</p>
      ) : (
        <ul className="mt-4 grid grid-cols-1 gap-x-4 gap-y-5 lg:grid-cols-2">
          {games.map((game) => <li key={game.id} className="min-w-0"><Link to={`/?vista=detall&joc=${game.id}`} aria-label={`Obre el detall de ${game.nom}`} className="flex items-center gap-3 rounded-lg hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"><SummaryCover key={`${game.id}-${game.portada_url}`} game={game} /><div className="min-w-0"><p className="break-words text-sm font-medium leading-snug">{game.nom}</p><p className="mt-1 break-words text-xs text-muted-foreground">{game.plataforma}</p></div></Link></li>)}
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
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <GameList title="Jugant" games={data?.jugant} isLoading={isFetching} />
        <GameList title="Per jugar aviat" games={data?.per_jugar_aviat} isLoading={isFetching} />
      </div>
      {!isSupabaseConfigured && <p className="mt-3 text-xs text-muted-foreground">Connecta Supabase per consultar les dades de la col·lecció.</p>}
      {error && <p role="alert" className="mt-3 text-sm text-muted-foreground">{error.message}</p>}
    </section>
  )
}
