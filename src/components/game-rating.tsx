import type { Valoracio } from '@/lib/database.types'
import { cn } from '@/lib/utils'
import { ratingColor } from '@/lib/game-rating'

export function GameRating({ rating, className }: { rating: Valoracio | null; className?: string }) {
  if (!rating) return null
  return <span aria-label={`Valoració ${rating}`} className={cn('font-bold tracking-tight', ratingColor(rating), className)}>{rating}</span>
}
