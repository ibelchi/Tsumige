import test from 'node:test'
import assert from 'node:assert/strict'
import { unzipSync, strFromU8 } from 'fflate'
import { buildBackupArchive } from '../src/lib/backup-archive.ts'
import type { Backup } from '../src/lib/backup.ts'

const fixture = (urls: (string | null)[]): Backup => ({ app: 'tsumige', format_version: 1, exported_at: '2026-10-07T10:00:00Z', user_id: 'test', fitxes_joc: urls.map((url, index) => ({ id: String(index), nom: `Joc ${index}`, portada_url: url, valoracio: null, comentaris: 'Notes de prova' })), exemplars: [{ id: 'copy', preu: 0, any_compra: null, a_la_colleccio: false }], experiencies: [], proposits: [] } as unknown as Backup)

test('ZIP portable: exact data, binary cover, duplicate links and missing covers', async () => {
  const backup = fixture(['https://example.test/a', 'https://example.test/a', null])
  const image = new Uint8Array([255, 216, 255, 224, 0, 1, 2, 3])
  let calls = 0
  const progress: number[] = []
  const archive = await buildBackupArchive(backup, p => progress.push(p.completed), (async (_url, options) => {
    calls++
    assert.equal(options?.credentials, 'omit')
    assert.equal(options?.referrerPolicy, 'no-referrer')
    return new Response(image, { headers: { 'Content-Type': 'image/jpeg' } })
  }) as typeof fetch)
  const files = unzipSync(new Uint8Array(await archive.blob.arrayBuffer()))
  assert.deepEqual(JSON.parse(strFromU8(files['dades.json'])), backup)
  assert.deepEqual(files['portades/00001.jpg'], image)
  assert.equal(calls, 1)
  assert.equal(archive.downloaded, 2)
  assert.deepEqual(progress, [0, 1])
  const manifest = JSON.parse(strFromU8(files['portades.json']))
  assert.equal(manifest.portades[0].fitxer, manifest.portades[1].fitxer)
  assert.equal(manifest.jocs_sense_portada.length, 1)
})

test('partial failure retains all data, good covers and an explicit report', async () => {
  const backup = fixture(['https://example.test/good', 'https://example.test/missing', 'https://example.test/cors'])
  const archive = await buildBackupArchive(backup, undefined, (async url => {
    if (String(url).endsWith('cors')) throw new TypeError('fetch failed')
    if (String(url).endsWith('missing')) return new Response('missing', { status: 404 })
    return new Response(new Uint8Array([1, 2]), { headers: { 'Content-Type': 'image/png' } })
  }) as typeof fetch)
  assert.equal(archive.downloaded, 1)
  assert.equal(archive.failed.length, 2)
  const files = unzipSync(new Uint8Array(await archive.blob.arrayBuffer()))
  assert.deepEqual(JSON.parse(strFromU8(files['dades.json'])), backup)
  assert.match(strFromU8(files['LLEGEIX-ME.txt']), /ATENCIÓ/)
  assert.equal(archive.failed[0].fitxer, null)
})

test('empty library produces a usable ZIP', async () => {
  const archive = await buildBackupArchive(fixture([]), undefined, (async () => { throw new Error('must not fetch') }) as typeof fetch)
  assert.equal(archive.failed.length, 0)
  const files = unzipSync(new Uint8Array(await archive.blob.arrayBuffer()))
  assert.ok(files['dades.json'])
  assert.ok(files['portades.json'])
})

test('rejects non-images, empty files, unsafe URLs and oversized images', async () => {
  const archive = await buildBackupArchive(fixture(['https://example.test/html', 'https://example.test/empty', 'javascript:alert(1)', 'https://example.test/large']), undefined, (async url => {
    if (String(url).endsWith('html')) return new Response('<html>error</html>', { headers: { 'Content-Type': 'text/html' } })
    return new Response(new Uint8Array(0), { headers: { 'Content-Type': 'image/png', ...(String(url).endsWith('large') ? { 'Content-Length': '30000000' } : {}) } })
  }) as typeof fetch)
  assert.equal(archive.failed.length, 4)
  assert.equal(archive.downloaded, 0)
})
