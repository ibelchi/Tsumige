import { collectionCopy, platformName, isEmulator } from './platform.ts'
import type { Catalog } from './catalog'
import type { Exemplar, Experiencia, FitxaJoc } from './database.types'

export type ReviewScope = 'joc' | 'colleccio' | 'bitacora'
export const reviewFields = {
  joc: [{ id: 'plataforma', label: 'Plataforma' }, { id: 'portada', label: 'Portada' }, { id: 'genere_principal', label: 'Gènere principal' }, { id: 'valoracio', label: 'Valoració' }, { id: 'comentaris', label: 'Comentaris' }],
  colleccio: [{ id: 'any_compra', label: 'Any de compra' }, { id: 'preu', label: 'Preu de compra' }],
  bitacora: [{ id: 'completat', label: 'Completat' }],
} as const
export type ReviewFilters = { scope: ReviewScope; field: string; search: string; format: string; includeRetired: boolean; includeTracking: boolean }
export type ReviewTarget = { kind: 'exemplar'; record: Exemplar } | { kind: 'experiencia'; record: Experiencia }
export type ReviewRow = { id: string; game: FitxaJoc; targets: ReviewTarget[] }
// undefined means the client cannot confirm that the column was loaded.
export function isReviewEmpty(value: unknown): boolean {
  return value === null || (typeof value === 'string' && value.trim() === '')
}
function gameEmpty(game: FitxaJoc, catalog: Catalog, field: string): boolean {
  if (field === 'plataforma') return isReviewEmpty(game.plataforma)
  if (field === 'portada') return isReviewEmpty(game.portada_url) && (game.portada_fitxer === undefined || isReviewEmpty(game.portada_fitxer))
  if (field === 'genere_principal') return isReviewEmpty(game.genere_principal)
  if (field === 'valoracio') return game.valoracio === null
  if (field === 'comentaris') {
    // Legacy notes need reconciliation, even if the shared comment is explicitly blank.
    const legacy = [...catalog.exemplars, ...catalog.experiencies].some(r => r.joc_id === game.id && typeof r.notes === 'string' && r.notes.trim() !== '')
    return isReviewEmpty(game.comentaris) && !legacy
  }
  return false
}
export function gameReviewTargets(catalog: Catalog, gameId: string): ReviewTarget[] {
  const active = catalog.exemplars.filter(r => r.joc_id === gameId && collectionCopy(r, catalog.jocs.find(game => game.id === gameId)))
  if (active.length) return active.map(record => ({ kind: 'exemplar', record }))
  const entries = catalog.experiencies.filter(r => r.joc_id === gameId)
  if (entries.length) return entries.map(record => ({ kind: 'experiencia', record }))
  return catalog.exemplars.filter(r => r.joc_id === gameId).map(record => ({ kind: 'exemplar', record }))
}
export function reviewRows(catalog: Catalog, filters: ReviewFilters): ReviewRow[] {
  if (!reviewFields[filters.scope].some(f => f.id === filters.field)) return []
  const games = new Map(catalog.jocs.map(game => [game.id, game]))
  let rows: ReviewRow[]
  if (filters.scope === 'joc') {
    rows = catalog.jocs.filter(game => gameEmpty(game, catalog, filters.field)).map(game => ({ id: `joc:${game.id}`, game, targets: gameReviewTargets(catalog, game.id) }))
  } else if (filters.scope === 'colleccio') {
    rows = catalog.exemplars.filter(record => (!isEmulator(games.get(record.joc_id)?.plataforma ?? '') && (record.a_la_colleccio || filters.includeRetired)) && (!filters.format || record.format === filters.format)
      && (filters.field === 'preu' ? record.preu === null : record.any_compra === null))
      .flatMap(record => { const game = games.get(record.joc_id); return game ? [{ id: `exemplar:${record.id}`, game, targets: [{ kind: 'exemplar' as const, record }] }] : [] })
  } else {
    rows = catalog.experiencies.filter(record => (record.any_jugat !== null || filters.includeTracking) && record.completat === null)
      .flatMap(record => { const game = games.get(record.joc_id); return game ? [{ id: `experiencia:${record.id}`, game, targets: [{ kind: 'experiencia' as const, record }] }] : [] })
  }
  return rows.filter(row => row.game.nom.toLocaleLowerCase().includes(filters.search.trim().toLocaleLowerCase()))
    .sort((a, b) => a.game.nom.localeCompare(b.game.nom, 'ca') || a.id.localeCompare(b.id))
}
export function reviewNavigation(snapshot: string[], rows: ReviewRow[], current: string): string[] {
  const available = new Set(rows.filter(row => row.targets.length).map(row => row.id))
  return snapshot.filter(id => id === current || available.has(id))
}
export function reviewTargetLabel(target: ReviewTarget): string {
  const r = target.record
  return target.kind === 'exemplar' && 'format' in r
    ? [r.format === 'fisic' ? 'Físic' : 'Digital', r.a_la_colleccio ? null : 'Retirat', r.regio, r.botiga_servei && !r.botiga_servei.trim() ? null : r.botiga_servei && platformName(r.botiga_servei),
      r.any_compra === null ? null : `Compra ${r.any_compra}`, r.preu === null ? null : `${r.preu} €`, `ID: ${r.id}`].filter(Boolean).join(' · ')
    : [`Bitàcora: ${'any_jugat' in r ? r.any_jugat ?? 'seguiment sense any' : ''}`, `ID: ${r.id}`].join(' · ')
}
