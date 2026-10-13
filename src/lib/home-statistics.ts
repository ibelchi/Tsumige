import type { Catalog } from './catalog'
import { statistics } from './statistics'
export const homeStatisticViews = ['played', 'ratings', 'platforms'] as const
export type HomeStatisticView = typeof homeStatisticViews[number]
export const homeStatisticTitles = {played: 'Jocs jugats per any', ratings: 'Valoracions', platforms: 'Plataformes de la col·lecció'}
export function savedHomeStatistic(): HomeStatisticView {
  try { const value = window.localStorage.getItem('tsumige.home.statistic'); if (homeStatisticViews.includes(value as HomeStatisticView)) return value as HomeStatisticView } catch { /* Preferència opcional. */ }
  return 'played'
}
export function homeStatisticRows(catalog: Catalog, view: HomeStatisticView) {
  const stats = statistics(catalog)
  if (view === 'played') return stats.playedByYear.slice(0,5)
  return view === 'ratings' ? stats.ratings : stats.platforms.slice(0,5)
}
export function homeStatisticLink(view: HomeStatisticView, label: string) {
  const query = new URLSearchParams(view === 'played' ? {vista:'jugats',any:label} : view === 'ratings' ? {vista:'valoracions',valoracio:label} : {vista:'colleccio',plataforma:label,origen:'inici'})
  return `/?${query}`
}
