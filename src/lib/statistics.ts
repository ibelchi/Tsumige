import type { Catalog } from '@/lib/catalog'
import type { Valoracio } from '@/lib/database.types'
import { gameRating } from '@/lib/game-rating'

export type StatisticRow = { label: string; value: number }
function counts(values: string[]): StatisticRow[] {
  const result = new Map<string, number>()
  for (const value of values) result.set(value, (result.get(value) ?? 0) + 1)
  return [...result].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, 'ca'))
}
export function statistics(catalog: Catalog, filters: { platformFormats?: string[]; purchaseYears?: string[] | null } = {}) {
  const games = new Map(catalog.jocs.map(game => [game.id, game]))
  const active = catalog.exemplars.filter(copy => copy.a_la_colleccio)
  const platforms = counts(active.filter(copy => !filters.platformFormats || filters.platformFormats.includes(copy.format)).map(copy => games.get(copy.joc_id)?.plataforma || 'Sense plataforma'))
  const genres = counts(active.map(copy => games.get(copy.joc_id)?.genere_principal?.trim() || 'Sense gènere')).sort((a, b) => a.label === 'Sense gènere' ? 1 : b.label === 'Sense gènere' ? -1 : b.value - a.value || a.label.localeCompare(b.label, 'ca'))
  const expenses = new Map<string, number>()
  let totalCents = 0, missingPrice = 0, missingPurchaseYear = 0
  // Purchases remain purchases after a copy is retired; zero is a known price.
  for (const copy of catalog.exemplars) {
    const year = copy.any_compra === null ? 'Sense any' : String(copy.any_compra)
    if (filters.purchaseYears && !filters.purchaseYears.includes(year)) continue
    if (copy.any_compra === null) missingPurchaseYear++
    if (copy.preu === null) { missingPrice++; continue }
    const cents = Math.round(copy.preu * 100)
    totalCents += cents
    expenses.set(year, (expenses.get(year) ?? 0) + cents)
  }
  const spending = [...expenses].map(([label, value]) => ({ label, value: value / 100 }))
    .sort((a, b) => (Number(b.label) || 0) - (Number(a.label) || 0))
  const played = new Map<number, Set<string>>()
  let missingPlayedYear = 0
  for (const experience of catalog.experiencies) {
    if (experience.any_jugat === null) { missingPlayedYear++; continue }
    if (!played.has(experience.any_jugat)) played.set(experience.any_jugat, new Set())
    played.get(experience.any_jugat)!.add(experience.joc_id)
  }
  const playedByYear = [...played].sort(([a], [b]) => b - a).map(([year, ids]) => ({ label: String(year), value: ids.size }))
  const grades: Valoracio[] = ['A++', 'A+', 'A', 'B', 'C', 'D']
  const ratings = catalog.jocs.map(game => gameRating(game, catalog.experiencies))
  return {
    platforms, genres, spending, playedByYear,
    ratings: grades.map(label => ({ label, value: ratings.filter(rating => rating === label).length })),
    unrated: ratings.filter(rating => rating === null).length,
    totalSpending: totalCents / 100, missingPrice, missingPurchaseYear, missingPlayedYear,
  }
}
