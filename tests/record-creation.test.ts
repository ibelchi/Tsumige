import test from 'node:test'
import assert from 'node:assert/strict'
import { creationSuggestions, existingAnnualEntries, sameGamePlatform, creationResult, creationError } from '../src/lib/record-creation.ts'
import type { Catalog } from '../src/lib/catalog.ts'
const catalog = { jocs: [{ id: 'steam', nom: 'Prova', plataforma: 'Steam' }, { id: 'epic', nom: 'Prova', plataforma: 'Epic Games' }], exemplars: [], experiencies: [{ id: 'old', joc_id: 'steam', any_jugat: null }, { id: 'annual', joc_id: 'steam', any_jugat: 2026 }, { id: 'other', joc_id: 'epic', any_jugat: 2026 }] } as unknown as Catalog
test('suggestions distinguish platform and preserve explicit IDs', () => {
  assert.deepEqual(creationSuggestions(catalog, ' prova ').map(game => game.id), ['epic', 'steam'])
  assert.deepEqual(sameGamePlatform(catalog, ' PROVA ', 'Epic Games Store').map(game => game.id), ['epic'])
  assert.deepEqual(sameGamePlatform(catalog, 'Prova', 'Switch'), [])
})
test('annual duplicates use game ID and year; historical null year is preserved', () => {
  assert.deepEqual(existingAnnualEntries(catalog, 'steam', 2026).map(entry => entry.id), ['annual'])
  assert.deepEqual(existingAnnualEntries(catalog, 'steam', 2027), [])
  assert.equal(catalog.experiencies[0].any_jugat, null)
})
test('unconfirmed results reject and validation errors preserve a readable explanation', () => {
  assert.throws(() => creationResult(null), /confirmar/)
  assert.deepEqual(creationResult({ id: 'record', joc_id: 'game', existent: true }), { id: 'record', joc_id: 'game', existent: true })
  assert.match(creationError('ALTA_DADES'), /valors es conserven/)
  assert.match(creationError('ALTA_CONFLICTE'), /històric/)
})
