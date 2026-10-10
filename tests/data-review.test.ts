import test from 'node:test'
import assert from 'node:assert/strict'
import { gameReviewTargets, isReviewEmpty, reviewNavigation, reviewRows, type ReviewFilters } from '../src/lib/data-review.ts'
import type { Catalog } from '../src/lib/catalog.ts'
import type { Exemplar, Experiencia, FitxaJoc } from '../src/lib/database.types.ts'

const stamp = { user_id: 'synthetic-owner', created_at: '2026-10-09', updated_at: '2026-10-09' }
function fixture(): Catalog {
  const game: FitxaJoc = { ...stamp, id: 'game', nom: 'Joc sintètic', plataforma: 'Prova', desenvolupadora: null, genere_principal: null, generos_secundaris: [], any_llancament: null, sinopsi: null, portada_url: null, valoracio: null, comentaris: null, per_jugar_aviat: false }
  const copy: Exemplar = { ...stamp, id: 'copy', joc_id: 'game', format: 'fisic', regio: null, estat_conservacio: null, notes: null, any_compra: null, preu: null, botiga_servei: null, favorit: false, canvi: false, reproduccio: false, no_localitzat: false, a_la_colleccio: true, revisat: false, origen: null }
  const entry: Experiencia = { ...stamp, id: 'entry', joc_id: 'game', any_jugat: 2026, completat: null, valoracio: null, notes: null, jugant: false, revisat: false, origen: null }
  return { jocs: [game], exemplars: [copy], experiencies: [entry] }
}
function filters(scope: ReviewFilters['scope'], field: string, extra: Partial<ReviewFilters> = {}): ReviewFilters {
  return { scope, field, search: '', format: '', includeRetired: false, includeTracking: false, ...extra }
}
test('empty text includes whitespace; zero, false and unavailable fields are not empty', () => {
  for (const value of [null, '', ' \t\n ']) assert.equal(isReviewEmpty(value), true)
  for (const value of [0, false, true, undefined, '0', ' A ']) assert.equal(isReviewEmpty(value), false)
})
test('scope prevents inapplicable purchase fields on games and Bitàcora; zero price remains informed', () => {
  const c = fixture()
  assert.equal(reviewRows(c, filters('joc', 'preu')).length, 0)
  assert.equal(reviewRows(c, filters('bitacora', 'any_compra')).length, 0)
  assert.equal(reviewRows(c, filters('colleccio', 'preu')).length, 1)
  c.exemplars[0].preu = 0
  assert.equal(reviewRows(c, filters('colleccio', 'preu')).length, 0)
  assert.equal(reviewRows(c, filters('colleccio', 'any_compra')).length, 1)
  c.exemplars[0].any_compra = 2020
  assert.equal(reviewRows(c, filters('colleccio', 'any_compra')).length, 0)
})
test('covers use permanent file references, genres trim whitespace, optional ratings must be loaded', () => {
  const c = fixture()
  c.jocs[0].genere_principal = ' \n '
  assert.equal(reviewRows(c, filters('joc', 'genere_principal')).length, 1)
  c.jocs[0].portada_url = ' '
  assert.equal(reviewRows(c, filters('joc', 'portada')).length, 1)
  c.jocs[0].portada_fitxer = 'stored/cover.jpg'
  assert.equal(reviewRows(c, filters('joc', 'portada')).length, 0)
  assert.equal(reviewRows(c, filters('joc', 'valoracio')).length, 1)
  c.jocs[0].valoracio = undefined
  c.experiencies[0].valoracio = 'A'
  assert.equal(reviewRows(c, filters('joc', 'valoracio')).length, 0)
})
test('legacy comments and unloaded columns excluded rather than merged or called empty', () => {
  const c = fixture()
  c.jocs[0].comentaris = '  '
  assert.equal(reviewRows(c, filters('joc', 'comentaris')).length, 1)
  c.exemplars[0].notes = 'Nota antiga'
  assert.equal(reviewRows(c, filters('joc', 'comentaris')).length, 0)
  c.experiencies[0].notes = 'Nota contradictòria'
  assert.equal(reviewRows(c, filters('joc', 'comentaris')).length, 0)
  c.jocs[0].comentaris = undefined
  c.exemplars[0].notes = null; c.experiencies[0].notes = null
  assert.equal(reviewRows(c, filters('joc', 'comentaris')).length, 0)
})
test('copies stay distinct; retired, format and tracking filters have explicit scope', () => {
  const c = fixture()
  c.exemplars.push({ ...c.exemplars[0], id: 'digital-copy', format: 'digital' }, { ...c.exemplars[0], id: 'retired', a_la_colleccio: false })
  assert.equal(reviewRows(c, filters('joc', 'portada')).length, 1)
  assert.equal(gameReviewTargets(c, 'game').length, 2)
  assert.equal(reviewRows(c, filters('colleccio', 'preu')).length, 2)
  assert.equal(reviewRows(c, filters('colleccio', 'preu', { includeRetired: true })).length, 3)
  assert.equal(reviewRows(c, filters('colleccio', 'preu', { format: 'digital' })).length, 1)
  c.experiencies[0].any_jugat = null
  assert.equal(reviewRows(c, filters('bitacora', 'completat')).length, 0)
  assert.equal(reviewRows(c, filters('bitacora', 'completat', { includeTracking: true })).length, 1)
  c.experiencies[0].completat = 'no_aplicable'
  assert.equal(reviewRows(c, filters('bitacora', 'completat', { includeTracking: true })).length, 0)
  c.experiencies[0].completat = 'no'
  assert.equal(reviewRows(c, filters('bitacora', 'completat', { includeTracking: true })).length, 0)
})
test('identifier relations exclude same-title unrelated copies; orphan games have no fabricated detail', () => {
  const c = fixture()
  c.jocs.push({ ...c.jocs[0], id: 'same-title-other-id' })
  assert.equal(gameReviewTargets(c, 'same-title-other-id').length, 0)
  assert.equal(reviewRows(c, filters('joc', 'portada'))[1].targets.length, 0)
  c.exemplars = []
  assert.equal(gameReviewTargets(c, 'game')[0].kind, 'experiencia')
})
test('save updates results while keeping current anchor and original order; no arbitrary jump or new insertion', () => {
  const c = fixture()
  c.jocs.push({ ...c.jocs[0], id: 'next', nom: 'Següent' })
  c.exemplars.push({ ...c.exemplars[0], id: 'next-copy', joc_id: 'next' })
  const before = reviewRows(c, filters('joc', 'portada'))
  const snapshot = before.map(row => row.id)
  c.jocs[0].portada_url = 'https://example.invalid/cover.jpg'
  const after = reviewRows(c, filters('joc', 'portada'))
  assert.deepEqual(after.map(row => row.id), ['joc:next'])
  assert.deepEqual(reviewNavigation(snapshot, after, 'joc:game'), ['joc:game', 'joc:next'])
  assert.deepEqual(reviewNavigation(snapshot, after, 'joc:next'), ['joc:next'])
  assert.deepEqual(reviewNavigation(snapshot, [], 'joc:game'), ['joc:game'])
  assert.deepEqual(reviewNavigation(snapshot, [...after, { ...after[0], id: 'new' }], 'joc:game'), ['joc:game', 'joc:next'])
})
