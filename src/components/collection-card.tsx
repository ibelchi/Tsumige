import { BrandLogo } from '@/components/brand-logo'
import { GameRating } from '@/components/game-rating'
import type { Exemplar, FitxaJoc, Valoracio } from '@/lib/database.types'

export function CollectionCard({ game, copy, rating = null, onOpen }: { game: FitxaJoc; copy: Exemplar; rating?: Valoracio | null; onOpen: () => void }) {
  return <article className="h-full overflow-hidden rounded-xl border bg-card">
    <button onClick={onOpen} className="grid h-full min-h-48 w-full grid-cols-[40%_minmax(0,1fr)] gap-4 p-4 text-left transition-colors hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-ring sm:gap-5 sm:p-5">
      <div className="flex min-w-0 items-center justify-center">
        {game.portada_url ? <img src={game.portada_url} alt="" loading="lazy" className="max-h-52 w-full object-contain" /> : <BrandLogo className="w-12" />}
      </div>
      <div className="flex min-w-0 flex-col justify-center py-1">
        <h2 className="break-words text-base font-semibold leading-snug tracking-tight">{game.nom}</h2>
        <p className="mt-2 break-words text-sm leading-5 text-muted-foreground">{game.plataforma}</p>
        <p className="mt-1 text-sm text-muted-foreground">{copy.format === 'fisic' ? 'Físic' : 'Digital'}</p>
        {rating && <div className="mt-5"><GameRating rating={rating} className="text-4xl leading-none" /></div>}
      </div>
    </button>
  </article>
}
