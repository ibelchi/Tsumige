import test from 'node:test'
import assert from 'node:assert/strict'
import { zipSync, strToU8 } from 'fflate'
import { readRestoreArchive, validateBackup } from '../src/lib/restore-archive.ts'
import { recoveryLink, recoveryRedirect } from '../src/lib/recovery.ts'
import { buildBackupArchive } from '../src/lib/backup-archive.ts'
import type { Backup } from '../src/lib/backup.ts'
const owner = '11111111-1111-4111-8111-111111111111'
const id = '22222222-2222-4222-8222-222222222222'
function fixture(): Backup {
  const stamp = {created_at: '2026-10-07T10:00:00Z', updated_at: '2026-10-07T10:00:00Z'}
  return {app: 'tsumige', format_version: 1, exported_at: stamp.created_at, user_id: owner, fitxes_joc: [{...stamp, id, user_id: owner, nom: 'Prova', plataforma: 'Steam', desenvolupadora: null, genere_principal: null, generos_secundaris: [], any_llancament: null, sinopsi: null, portada_url: 'https://example.test/image', per_jugar_aviat: false, valoracio: null, comentaris: null}], exemplars: [], experiencies: [], proposits: []}
}
const jpeg = new Uint8Array([255,216,255,224,0,1,2])
test('round trip: covers are restored even if the original provider is unavailable', async () => {
  const result = await buildBackupArchive(fixture(), undefined, (async () => new Response(jpeg, {headers: {'content-type': 'image/jpeg'}})) as typeof fetch)
  const restored = await readRestoreArchive(new Uint8Array(await result.blob.arrayBuffer()), owner)
  assert.deepEqual(restored.covers[0].bytes, jpeg)
  assert.equal(restored.covers[0].mime, 'image/jpeg')
  assert.equal(restored.backup.fitxes_joc[0].portada_url, 'https://example.test/image')
})
test('reject another account, duplicate IDs, invalid ratings, orphan records and executable cover URLs', () => {
  assert.throws(() => validateBackup(fixture(), '33333333-3333-4333-8333-333333333333'))
  const duplicate = fixture(); duplicate.fitxes_joc.push({...duplicate.fitxes_joc[0]})
  assert.throws(() => validateBackup(duplicate, owner))
  const rating = fixture(); (rating.fitxes_joc[0] as unknown as {valoracio: string}).valoracio = '99'
  assert.throws(() => validateBackup(rating, owner))
  const orphan = fixture(); orphan.experiencies.push({id: '44444444-4444-4444-8444-444444444444', user_id: owner, joc_id: '55555555-5555-4555-8555-555555555555', created_at: orphan.exported_at, updated_at: orphan.exported_at, any_jugat: 2026, completat: null, valoracio: null, notes: null, jugant: false, revisat: false, origen: null})
  assert.throws(() => validateBackup(orphan, owner))
  const url = fixture(); url.fitxes_joc[0].portada_url = 'javascript:alert(1)'
  assert.throws(() => validateBackup(url, owner))
})
test('reject path traversal and missing cover files', async () => {
  const base = {'dades.json': strToU8(JSON.stringify(fixture())), 'portades.json': strToU8(JSON.stringify({format_version: 1, portades: [{joc_id: id, url: 'https://example.test/image', fitxer: 'portades/00001.jpg'}]}))}
  await assert.rejects(readRestoreArchive(zipSync(base), owner))
  await assert.rejects(readRestoreArchive(zipSync({...base, '../escape': jpeg}), owner))
})
test('restored Storage images are backed up again without replacing original attribution URLs', async () => {
  const backup = fixture(); backup.fitxes_joc[0].portada_fitxer = `${owner}/restore/00001.jpg`
  let requested = ''
  const result = await buildBackupArchive(backup, undefined, (async (url) => {requested = String(url); return new Response(jpeg, {headers: {'content-type': 'image/jpeg'}})}) as typeof fetch, async () => 'https://storage.example.test/signed')
  assert.equal(requested, 'https://storage.example.test/signed')
  const restored = await readRestoreArchive(new Uint8Array(await result.blob.arrayBuffer()), owner)
  assert.equal(restored.backup.fitxes_joc[0].portada_fitxer, null)
  assert.equal(restored.backup.fitxes_joc[0].portada_url, 'https://example.test/image')
})
test('password recovery routes, fragments and expired links', () => {
  assert.equal(recoveryRedirect('https://ibelchi.github.io', '/Tsumige/'), 'https://ibelchi.github.io/Tsumige/?recuperacio=1')
  assert.equal(recoveryLink('https://example.test/#/?vista=colleccio'), null)
  assert.equal(recoveryLink('https://example.test/?recuperacio=1#access_token=test&refresh_token=test-refresh&type=recovery')?.accessToken, 'test')
  assert.equal(recoveryLink('https://example.test/?recuperacio=1#error=access_denied')?.error, 'access_denied')
})
