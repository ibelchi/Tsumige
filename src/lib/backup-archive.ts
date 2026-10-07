import { strToU8, zip, type Zippable } from 'fflate'
import type { Backup } from './backup'

export type CoverEntry = { joc_id: string; nom: string; url: string; fitxer: string | null; error: string | null }
export type ArchiveProgress = { completed: number; total: number }
const MAX_IMAGE_BYTES = 20 * 1024 * 1024
const MAX_TOTAL_BYTES = 200 * 1024 * 1024
const extensions: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif', 'image/svg+xml': 'svg' }

async function readImage(url: string, request: typeof fetch) {
  const parsed = new URL(url)
  if (!['https:', 'http:'].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error('URL de portada no vàlid.')
  const response = await request(url, { credentials: 'omit', referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(30000) })
  if (!response.ok) throw new Error(`El proveïdor ha retornat l’error ${response.status}.`)
  const extension = extensions[(response.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase()]
  if (!extension || !response.body) { await response.body?.cancel(); throw new Error('La resposta no és una imatge compatible.') }
  if (Number(response.headers.get('content-length')) > MAX_IMAGE_BYTES) { await response.body.cancel(); throw new Error('La imatge supera els 20 MB.') }
  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    for (;;) {
      const { value, done } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > MAX_IMAGE_BYTES) throw new Error('La imatge supera els 20 MB.')
      chunks.push(value)
    }
  } finally { await reader.cancel().catch(() => undefined); reader.releaseLock() }
  if (!size) throw new Error('La imatge és buida.')
  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength }
  return { bytes, extension }
}

export async function buildBackupArchive(backup: Backup, onProgress?: (progress: ArchiveProgress) => void, request: typeof fetch = fetch) {
  const entries: CoverEntry[] = backup.fitxes_joc.filter(game => Boolean(game.portada_url)).map(game => ({ joc_id: game.id, nom: game.nom, url: game.portada_url!, fitxer: null, error: null }))
  const urls = [...new Set(entries.map(entry => entry.url))]
  const results = new Map<string, { fitxer: string | null; error: string | null }>()
  const files: Zippable = { 'dades.json': [strToU8(JSON.stringify(backup, null, 2)), { level: 6 }] }
  let cursor = 0, completed = 0, totalBytes = 0
  onProgress?.({ completed, total: urls.length })
  async function worker() {
    while (cursor < urls.length) {
      const index = cursor++
      const url = urls[index]
      try {
        const { bytes, extension } = await readImage(url, request)
        if (totalBytes + bytes.byteLength > MAX_TOTAL_BYTES) throw new Error('S’ha arribat al límit de 200 MB de portades per còpia.')
        totalBytes += bytes.byteLength
        const fitxer = `portades/${String(index + 1).padStart(5, '0')}.${extension}`
        files[fitxer] = [bytes, { level: 0 }]
        results.set(url, { fitxer, error: null })
      } catch (caught) {
        const error = caught instanceof TypeError ? 'No s’ha pogut descarregar: problema de connexió o el proveïdor no permet la descàrrega des del navegador.' : caught instanceof Error ? caught.name === 'TimeoutError' ? 'El proveïdor ha trigat massa a respondre.' : caught.message : 'No s’ha pogut descarregar la portada.'
        results.set(url, { fitxer: null, error })
      }
      onProgress?.({ completed: ++completed, total: urls.length })
    }
  }
  await Promise.all(Array.from({ length: Math.min(3, urls.length) }, worker))
  for (const entry of entries) Object.assign(entry, results.get(entry.url))
  const failed = entries.filter(entry => entry.error)
  const manifest = { format_version: 1, exported_at: backup.exported_at, portades: entries, jocs_sense_portada: backup.fitxes_joc.filter(game => !game.portada_url).map(game => ({ joc_id: game.id, nom: game.nom })) }
  files['portades.json'] = [strToU8(JSON.stringify(manifest, null, 2)), { level: 6 }]
  files['LLEGEIX-ME.txt'] = strToU8(`Còpia de seguretat de 積みゲー\n\nDades completes: dades.json.\nPortades: carpeta portades.\nRelació entre cada joc, URL original i fitxer: portades.json.\n\n${entries.length - failed.length} jocs amb portada desada; ${failed.length} portades no descarregades; ${manifest.jocs_sense_portada.length} jocs sense portada assignada.\n${failed.length ? 'ATENCIÓ: aquesta còpia no conté totes les portades. Consulteu els errors a portades.json.\n' : ''}\nEls fitxers desats es poden consultar sense el proveïdor original. Els URL i les atribucions originals es conserven a les dades. Les portades continuen subjectes als drets dels seus titulars.\nLa restauració automàtica des de l’aplicació encara està pendent.\n`)
  const bytes = await new Promise<Uint8Array>((resolve, reject) => zip(files, { level: 0 }, (error, data) => error ? reject(error) : resolve(data)))
  return { blob: new Blob([new Uint8Array(bytes).buffer], { type: 'application/zip' }), entries, failed, downloaded: entries.length - failed.length }
}
