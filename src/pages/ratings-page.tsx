import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { getCatalog } from '@/lib/catalog'
import { useAuth } from '@/lib/auth'
import { gameRating } from '@/lib/game-rating'
import { GameRating } from '@/components/game-rating'
import { RecordEditor } from '@/components/record-editor'

export function RatingsPage() {
  const [params] = useSearchParams()
  const rating = params.get('valoracio')
  const [selected, setSelected] = useState<string | null>(null)
  const { session } = useAuth()
  const client = useQueryClient()
  const { data, error, isPending } = useQuery({ queryKey: ['catalog', session?.user.id], queryFn: getCatalog, enabled: Boolean(session) })
  const games = data?.jocs.filter(game => gameRating(game, data.experiencies) === rating) ?? []
  const game = games.find(item => item.id === selected)
  const experience = data?.experiencies.find(item => item.joc_id === selected)
  const copy = data?.exemplars.find(item => item.joc_id === selected && item.a_la_colleccio) ?? data?.exemplars.find(item => item.joc_id === selected)
  const record = experience ?? copy
  const index = games.findIndex(item => item.id === selected)
  async function refresh() { await Promise.all([client.invalidateQueries({ queryKey: ['catalog'] }), client.invalidateQueries({ queryKey: ['jocs'] })]) }
  return <div className="page-container">
    <h1 className="page-title">Jocs amb valoració <span className={rating === 'A+' || rating === 'A++' ? 'text-[#e02424]' : undefined}>{rating}</span></h1>
    <Link className="mt-4 inline-block text-sm underline" to="/?vista=estadistiques">Torna a Estadístiques</Link>
    <p role="status" className="mt-6 text-sm text-muted-foreground">{isPending ? 'Carregant…' : `${games.length} jocs`}</p>
    {error && <p role="alert" className="mt-4 text-sm text-red-700">{error.message}</p>}
    <section aria-label="Jocs amb aquesta valoració" className="mt-5 divide-y overflow-hidden rounded-xl border bg-card">
      {games.map(item => <button key={item.id} onClick={() => setSelected(item.id)} className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring">
        <span><span className="block text-sm font-medium">{item.nom}</span><span className="mt-1 block text-xs text-muted-foreground">{item.plataforma}</span></span>
        <GameRating rating={gameRating(item, data!.experiencies)} className="text-2xl" />
      </button>)}
    </section>
    {!isPending && !error && !games.length && <p className="mt-5 text-sm text-muted-foreground">No hi ha jocs amb aquesta valoració.</p>}
    {selected && game && !record && <p className="mt-4 text-sm text-muted-foreground">Aquest joc no té cap exemplar ni experiència per obrir.</p>}
    {game && record && data && <RecordEditor key={record.id} kind={experience ? 'experiencia' : 'exemplar'} record={record} game={game} catalog={data} onClose={() => setSelected(null)} onSaved={refresh} navigation={{ position: index + 1, total: games.length, previous: index > 0 ? () => setSelected(games[index - 1].id) : undefined, next: index < games.length - 1 ? () => setSelected(games[index + 1].id) : undefined }} />}
  </div>
}
