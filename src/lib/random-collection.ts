import type { Catalog } from './catalog'
import { gameRating } from './game-rating.ts'
import { collectionCopy } from './platform.ts'
export const randomFilters = ['all', 'best'] as const
export type RandomFilter = typeof randomFilters[number]
export const randomFilterLabels = {all: 'Tots', best: 'Top'}
export function savedRandomFilter(): RandomFilter {
  try {const value = window.localStorage.getItem('tsumige.random.filter'); if(value === 'favorites') { window.localStorage.setItem('tsumige.random.filter','all'); return 'all' } if (randomFilters.includes(value as RandomFilter)) return value as RandomFilter} catch { /* Preferència opcional. */ }
  return 'all'
}
export function eligibleRandomGames(catalog: Catalog, filter: RandomFilter = 'all'): string[] {
  const games = new Map(catalog.jocs.map(game => [game.id, game]))
  const active = new Set(catalog.exemplars.filter(copy => collectionCopy(copy, games.get(copy.joc_id))).map(copy => copy.joc_id))
  return [...new Set(catalog.jocs.filter(game => active.has(game.id) && (game.portada_visual_url || game.portada_url)
    && (filter === 'all' || ['A+', 'A++'].includes(gameRating(game, catalog.experiencies) ?? ''))).map(game => game.id))]
}
function shuffled(ids: string[], random: () => number) {
  const result = [...ids]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
export function reconcileRandomGames(previous: readonly string[], candidates: string[], random = Math.random): string[] {
  const pool = [...new Set(candidates)]
  const kept = new Set(previous.filter(id => pool.includes(id)))
  const replacements = shuffled(pool.filter(id => !kept.has(id)), random)
  const result = previous.slice(0, 3).flatMap(id => kept.has(id) ? [id] : replacements.length ? [replacements.shift()!] : [])
  while (result.length < Math.min(3, pool.length) && replacements.length) result.push(replacements.shift()!)
  return result
}
export function renewRandomGames(previous: readonly string[], candidates: string[], random = Math.random): string[] {
  const pool = [...new Set(candidates)]
  const result = shuffled(pool, random).slice(0, 3)
  if (pool.length > result.length && result.length === previous.length && result.every(id => previous.includes(id))) {
    result[result.length - 1] = pool.find(id => !previous.includes(id))!
  }
  return result
}
const empty: readonly string[] = []
const visits = new Map<string, readonly string[]>()
const listeners = new Set<() => void>()
export const randomVisit = {
  get: (owner: string, filter: RandomFilter = 'all') => visits.get(JSON.stringify([owner, filter])) ?? empty,
  subscribe: (listener: () => void) => { listeners.add(listener); return () => listeners.delete(listener) },
  set(owner: string, ids: readonly string[], filter: RandomFilter = 'all') {
    const key = JSON.stringify([owner, filter])
    const previous = visits.get(key) ?? empty
    if (previous.length === ids.length && previous.every((id, index) => id === ids[index])) return
    visits.set(key, ids)
    listeners.forEach(listener => listener())
  },
}

export function renewFilterSelection(owner: string, filter: RandomFilter, catalog: Catalog, random = Math.random) {
  randomVisit.set(owner, renewRandomGames(randomVisit.get(owner, filter), eligibleRandomGames(catalog, filter), random), filter)
}
