import { platformName } from '@/lib/platform'
import type { Experiencia, FitxaJoc } from '@/lib/database.types'
import { gameRating } from '@/lib/game-rating'
import { GameRating } from '@/components/game-rating'
export function HistoryList({ rows, games, experiences, year, onOpen }: { rows: Experiencia[]; games: Map<string, FitxaJoc>; experiences: Experiencia[]; year: string; onOpen: (id: string) => void }) {
  const currentYear = new Date().getFullYear()
  const years = [...new Set([...(year === 'all' ? [currentYear] : []), ...rows.flatMap(row => row.any_jugat === null ? [] : [row.any_jugat])])].sort((a, b) => b - a)
  const groups = years.map(value => ({ label: String(value), records: rows.filter(row => row.any_jugat === value) }))
  return <div className="mt-7 space-y-9">{groups.map(group => <section key={group.label} aria-label={`Jocs de ${group.label}`}>
    <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">{group.label}</h2>
    {group.records.length ? <div className="divide-y overflow-hidden rounded-xl border bg-card">{group.records.map(record => {
      const game = games.get(record.joc_id)!
      const rating = gameRating(game, experiences)
      return <button key={record.id} onClick={() => onOpen(record.id)} className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring sm:px-5">
        <div className="min-w-0"><h3 className="break-words text-sm font-medium sm:text-base">{game.nom}</h3><p className="mt-1 text-xs text-muted-foreground">{platformName(game.plataforma)}</p></div>
        <GameRating rating={rating} className="shrink-0 text-2xl" />
      </button>
    })}</div> : <p className="text-sm text-muted-foreground">Cap joc registrat per a aquest any amb aquests filtres.</p>}
  </section>)}</div>
}
