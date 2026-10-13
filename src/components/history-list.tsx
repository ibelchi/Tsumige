import { collectionCopy, isEmulator } from '@/lib/platform'
import type { Exemplar, Experiencia, FitxaJoc } from '@/lib/database.types'
import { gameRating } from '@/lib/game-rating'
import { GameCard } from '@/components/collection-card'
export function HistoryList({ rows, games, experiences, year, onOpen, copies, onOpenCollection, onAddCollection }: { rows: Experiencia[]; games: Map<string, FitxaJoc>; experiences: Experiencia[]; year: string; onOpen: (id: string) => void; copies: Exemplar[]; onOpenCollection: (id: string) => void; onAddCollection?: (gameId: string) => void }) {
  const currentYear = new Date().getFullYear()
  const years = [...new Set([...(year === 'all' ? [currentYear] : []), ...rows.flatMap(row => row.any_jugat === null ? [] : [row.any_jugat])])].sort((a, b) => b - a)
  const groups = years.map(value => ({ label: String(value), records: rows.filter(row => row.any_jugat === value) }))
  return <div className="mt-7 space-y-9">{groups.map(group => <section key={group.label} aria-label={`Jocs de ${group.label}`}>
    <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">{group.label}</h2>
    {group.records.length ? <div className="collection-gallery grid gap-4">{group.records.map(record => {
      const game = games.get(record.joc_id)!
      const rating = gameRating(game, experiences)
      const owned = copies.some(copy => copy.joc_id === game.id && collectionCopy(copy, game))
      const completed = record.completat === 'si' ? 'Completat' : record.completat === 'no' ? 'No completat' : record.completat === 'no_aplicable' ? 'Completat: no aplicable' : null
      return <GameCard key={record.id} game={game} rating={rating} entry onOpen={() => onOpen(record.id)}
        footer={owned ? <button type="button" onClick={() => onOpenCollection(record.id)} className="min-h-11 text-sm underline focus-visible:outline-2 focus-visible:outline-ring">Col·lecció<span className="sr-only"> · {game.nom}</span></button> : onAddCollection && !isEmulator(game.plataforma) ? <button type="button" onClick={() => onAddCollection(game.id)} className="min-h-11 text-left text-sm text-primary underline focus-visible:outline-2 focus-visible:outline-ring">Afegeix a la col·lecció<span className="sr-only"> · {game.nom}</span></button> : undefined}>
        {completed && <p className="mt-1 text-sm text-muted-foreground">{completed}</p>}
      </GameCard>
    })}</div> : <p className="text-sm text-muted-foreground">Cap joc registrat per a aquest any amb aquests filtres.</p>}
  </section>)}</div>
}
