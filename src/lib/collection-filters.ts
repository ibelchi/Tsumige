import type { Catalog } from './catalog'
import { collectionCopy, platformName } from './platform'
import { collectionQuickFilter } from './collection-quick-filter'
import { matchesGameLabels } from './game-labels'
import { gameRating } from './game-rating'

// Una fila de Col·lecció és un exemplar actiu: les targetes i el catàleg
// comparteixen exactament aquesta unitat i els mateixos filtres.
export function collectionRecords(catalog: Catalog, params: URLSearchParams) {
  const games = new Map(catalog.jocs.map(game => [game.id, game]))
  const formats = params.has('format') ? params.getAll('format') : ['fisic', 'digital']
  const platforms = params.getAll('plataforma').map(platformName)
  const ratings = params.getAll('valoracio')
  const quick = collectionQuickFilter(params)
  const search = (params.get('cerca') ?? '').toLocaleLowerCase()
  const genre = params.get('genere') ?? ''
  return catalog.exemplars.filter(copy => {
    const game = games.get(copy.joc_id)
    return game && collectionCopy(copy, game) && matchesGameLabels(game, params)
      && (quick !== 'infants' || game.per_infants === true)
      && (quick !== 'favorits' || copy.favorit === true)
      && (!params.get('joc') || game.id === params.get('joc'))
      && game.nom.toLocaleLowerCase().includes(search)
      && (!platforms.length || platforms.includes(platformName(game.plataforma) || 'Sense plataforma'))
      && (!genre || (game.genere_principal?.trim() || 'Sense gènere') === genre)
      && formats.includes(copy.format)
      && (!ratings.length || ratings.includes(gameRating(game, catalog.experiencies) ?? 'Sense valoració'))
  })
}
export const summaryCards = [
  { key: 'physical', label: 'Jocs físics' },
  { key: 'digital', label: 'Jocs digitals' },
  { key: 'wanted', label: 'Vull jugar' },
  { key: 'top', label: 'Jocs top' },
  { key: 'meh', label: 'Jocs MEH' },
] as const
export type SummaryCard = typeof summaryCards[number]['key']
export function summaryCardLink(key: SummaryCard): string {
  const params = new URLSearchParams({ vista: 'colleccio' })
  if (key === 'physical' || key === 'digital') params.set('format', key === 'physical' ? 'fisic' : 'digital')
  if (key === 'wanted') params.set('intencio_joc', 'vull')
  if (key === 'top') { params.append('valoracio', 'A+'); params.append('valoracio', 'A++') }
  if (key === 'meh') params.set('valoracio', 'D')
  params.set('origen', 'inici')
  return `/?${params}`
}
export function collectionSummaryCards(catalog: Catalog) {
  const total = collectionRecords(catalog, new URLSearchParams()).length
  return summaryCards.map(card => {
    const href = summaryCardLink(card.key)
    const count = collectionRecords(catalog, new URLSearchParams(href.slice(2))).length
    const percentage = card.key === 'top' || card.key === 'meh'
      ? `${new Intl.NumberFormat('ca', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(total ? count / total * 100 : 0)} %` : undefined
    return { ...card, href, count, percentage }
  })
}
