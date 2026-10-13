import type { ReactNode } from 'react'
import { platformName } from '@/lib/platform'
import { BrandLogo } from '@/components/brand-logo'
import { GameRating } from '@/components/game-rating'
import type { Exemplar, FitxaJoc, Valoracio } from '@/lib/database.types'

export function CollectionCard({ game, copy, rating = null, onOpen }: { game: FitxaJoc; copy: Exemplar; rating?: Valoracio | null; onOpen: () => void }) {
  return <GameCard game={game} rating={rating} onOpen={onOpen}><p className="mt-1 text-sm text-muted-foreground">{copy.format === 'fisic' ? 'Físic' : 'Digital'}</p></GameCard>
}

export function GameCard({ game, rating = null, onOpen, children, footer, entry = false }: {
  game: FitxaJoc; rating?: Valoracio | null; onOpen: () => void; children?: ReactNode; footer?: ReactNode; entry?: boolean
}) {
  const Heading = entry ? 'h3' : 'h2'
  return <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-xl border bg-card">
    <button type="button" onClick={onOpen} className="grid min-h-48 w-full flex-1 grid-cols-[40%_minmax(0,1fr)] gap-4 p-4 text-left transition-colors hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-ring sm:gap-5 sm:p-5">
      <div className="flex min-w-0 items-center justify-center">
        {(game.portada_visual_url ?? game.portada_url) ? <img src={game.portada_visual_url ?? game.portada_url!} alt="" loading="lazy" className="max-h-52 w-full object-contain" /> : <BrandLogo className="w-12" />}
      </div>
      <div className="flex min-w-0 flex-col justify-center py-1">
        <Heading className="text-base font-semibold leading-snug tracking-tight [overflow-wrap:anywhere]">{game.nom}</Heading>
        <p className="mt-2 text-sm leading-5 text-muted-foreground [overflow-wrap:anywhere]">{platformName(game.plataforma)}</p>
        {children}
        {rating && <div className="mt-5"><GameRating rating={rating} className="text-4xl leading-none" /></div>}
        {entry && <span className="mt-3 text-xs underline">Entrada de log</span>}
      </div>
    </button>
    {footer && <div className="border-t px-4 py-2 sm:px-5">{footer}</div>}
  </article>
}
