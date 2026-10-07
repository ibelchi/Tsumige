import type { Experiencia, FitxaJoc, Valoracio } from '@/lib/database.types'
export function ratingColor(rating: Valoracio | null) {
  return rating === 'A+' || rating === 'A++' ? 'text-[#e02424]' : 'text-foreground'
}
export function gameRating(game: FitxaJoc, experiences: Experiencia[]): Valoracio | null {
  if (game.valoracio !== undefined) return game.valoracio
  const values = [...new Set(experiences.filter(e => e.joc_id === game.id && e.valoracio !== null).map(e => e.valoracio!))]
  return values.length === 1 ? values[0] : null
}
