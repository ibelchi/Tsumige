import { unzip, strFromU8 } from 'fflate'
import type { Backup } from './backup'
import type { CoverEntry } from './backup-archive'
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const GRADES = ['A++', 'A+', 'A', 'B', 'C', 'D']
export type RestoreArchive = { backup: Backup; covers: { gameId: string; file: string; bytes: Uint8Array; mime: string }[]; missingCovers: number }
function fail(): never { throw new Error('La còpia conté dades incompatibles o incompletes. No s’ha modificat res.') }
function object(value: unknown): Record<string, unknown> { if (!value || typeof value !== 'object' || Array.isArray(value)) fail(); return value as Record<string, unknown> }
function string(value: unknown, nullable = false) { if (!(typeof value === 'string' || nullable && value === null)) fail() }
function bool(value: unknown, nullable = false) { if (!(typeof value === 'boolean' || nullable && value === null)) fail() }
function year(value: unknown, nullable = true) { if (!(nullable && value === null) && !(typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 9999)) fail() }
function member(value: unknown, allowed: string[], nullable = false) { if (!(nullable && value === null) && !allowed.includes(value as string)) fail() }
function uuid(value: unknown) { if (typeof value !== 'string' || !UUID.test(value)) fail() }
function url(value: unknown) { if (value === null) return; string(value); try { const parsed = new URL(value as string); if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) fail() } catch { fail() } }
function timestamp(value: unknown) { if (typeof value !== 'string' || !Number.isFinite(Date.parse(value))) fail() }
export function validateBackup(value: unknown, owner: string): Backup {
  const root = object(value)
  if (root.app !== 'tsumige' || root.format_version !== 1) throw new Error('Format de còpia no compatible.')
  if (root.user_id !== owner) throw new Error('La còpia pertany a un altre compte. No es pot restaurar aquí.')
  uuid(owner); timestamp(root.exported_at)
  const tables = ['fitxes_joc', 'exemplars', 'experiencies', 'proposits'] as const
  for (const table of tables) {
    if (!Array.isArray(root[table]) || root[table].length > 100000) fail()
    const ids = new Set<string>()
    for (const value of root[table]) {
      const row = object(value)
      uuid(row.id); if (row.user_id !== owner || ids.has(row.id as string)) fail(); ids.add(row.id as string)
      timestamp(row.created_at); timestamp(row.updated_at)
      if (table === 'fitxes_joc') {
        for (const key of ['nom', 'plataforma']) { string(row[key]); if (!(row[key] as string).trim()) fail() }
        for (const key of ['desenvolupadora', 'genere_principal', 'sinopsi']) string(row[key], true)
        if (!Array.isArray(row.generos_secundaris) || row.generos_secundaris.some(v => typeof v !== 'string')) fail()
        year(row.any_llancament); url(row.portada_url); url(row.portada_font_url ?? null); bool(row.per_jugar_aviat)
        row.portada_font_url ??= null; row.per_infants ??= false; bool(row.per_infants)
        row.comentaris ??= null; string(row.comentaris, true)
        // File paths from an older Storage instance are never trusted: new
        // uploaded paths are assigned only from this ZIP's validated manifest.
        row.portada_fitxer = null
        delete row.portada_visual_url
        if (row.valoracio !== undefined) member(row.valoracio, GRADES, true)
      } else if (table === 'proposits') {
        year(row.any, false); string(row.text); if (!(row.text as string).trim() || (row.text as string).length > 500) fail()
        member(row.estat, ['pendent', 'fet', 'descartat'])
      } else {
        uuid(row.joc_id); string(row.notes, true); bool(row.revisat)
        if (table === 'exemplars') {
          member(row.format, ['fisic', 'digital']); year(row.any_compra)
          if (row.preu !== null && !(typeof row.preu === 'number' && Number.isFinite(row.preu) && row.preu >= 0 && row.preu <= 9999999999.99)) fail()
          for (const key of ['regio', 'estat_conservacio', 'botiga_servei']) string(row[key], true)
          for (const key of ['favorit', 'canvi', 'reproduccio', 'a_la_colleccio']) bool(row[key])
          bool(row.no_localitzat, true)
        } else { year(row.any_jugat); member(row.completat, ['si', 'no', 'no_aplicable'], true); member(row.valoracio, GRADES, true); bool(row.jugant) }
      }
    }
  }
  const backup = root as unknown as Backup
  const games = new Map(backup.fitxes_joc.map(game => [game.id, game]))
  for (const row of [...backup.exemplars, ...backup.experiencies]) if (!games.has(row.joc_id)) fail()
  for (const game of backup.fitxes_joc) {
    const ratings = [...new Set(backup.experiencies.filter(e => e.joc_id === game.id).map(e => e.valoracio))]
    if (game.valoracio === undefined) {
      const known = ratings.filter(value => value !== null)
      if (known.length > 1) throw new Error(`Valoracions contradictòries a «${game.nom}». Cal revisar la còpia.`)
      game.valoracio = known[0] ?? null
      backup.experiencies.filter(e => e.joc_id === game.id).forEach(e => { e.valoracio = game.valoracio! })
    } else if (ratings.some(rating => rating !== game.valoracio)) throw new Error(`Valoracions contradictòries a «${game.nom}». Cal revisar la còpia.`)
  }
  return backup
}
export function imageMime(bytes: Uint8Array) {
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'image/jpeg'
  if (bytes[0] === 137 && strFromU8(bytes.slice(1, 4)) === 'PNG' && bytes[4] === 13 && bytes[5] === 10 && bytes[6] === 26 && bytes[7] === 10) return 'image/png'
  if (strFromU8(bytes.slice(0, 6)) === 'GIF87a' || strFromU8(bytes.slice(0, 6)) === 'GIF89a') return 'image/gif'
  if (strFromU8(bytes.slice(0, 4)) === 'RIFF' && strFromU8(bytes.slice(8, 12)) === 'WEBP') return 'image/webp'
  if (strFromU8(bytes.slice(4, 8)) === 'ftyp' && ['avif', 'avis'].includes(strFromU8(bytes.slice(8, 12)))) return 'image/avif'
  throw new Error('Una portada no és JPEG, PNG, WebP, GIF o AVIF. No es restauren SVG ni fitxers executables.')
}
export async function readRestoreArchive(bytes: Uint8Array, owner: string): Promise<RestoreArchive> {
  if (bytes.byteLength > 230 * 1024 * 1024) throw new Error('El ZIP supera 230 MB.')
  let total = 0, invalid = false
  const files = await new Promise<Record<string, Uint8Array>>((resolve, reject) => unzip(bytes, { filter(file) {
    if (file.name.includes('..') || file.name.startsWith('/') || file.name.includes('\\')) { invalid = true; return false }
    const keep = ['dades.json', 'portades.json'].includes(file.name) || /^portades\/\d+\.(jpg|jpeg|png|webp|gif|avif|svg)$/.test(file.name)
    if (keep) { total += file.originalSize; if (file.originalSize > 20 * 1024 * 1024 || total > 230 * 1024 * 1024) { invalid = true; return false } }
    return keep
  } }, (error, result) => error ? reject(new Error('El ZIP no és vàlid o està malmès.')) : resolve(result)))
  if (invalid || !files['dades.json'] || !files['portades.json']) throw new Error('El ZIP és incompatible, incomplet o supera els límits de mida.')
  const backup = validateBackup(JSON.parse(strFromU8(files['dades.json'])), owner)
  const manifest = object(JSON.parse(strFromU8(files['portades.json'])))
  if (manifest.format_version !== 1 || !Array.isArray(manifest.portades)) fail()
  const games = new Map(backup.fitxes_joc.map(game => [game.id, game]))
  const seen = new Set<string>(), covers: RestoreArchive['covers'] = []
  for (const value of manifest.portades) {
    const entry = object(value) as unknown as CoverEntry
    const game = games.get(entry.joc_id)
    if (!game || seen.has(entry.joc_id) || game.portada_url !== entry.url) fail()
    seen.add(entry.joc_id)
    if (entry.fitxer === null) continue
    if (typeof entry.fitxer !== 'string' || !/^portades\/\d+\.(jpg|jpeg|png|webp|gif|avif|svg)$/.test(entry.fitxer) || !files[entry.fitxer]) fail()
    covers.push({gameId: entry.joc_id, file: entry.fitxer, bytes: files[entry.fitxer], mime: imageMime(files[entry.fitxer])})
  }
  return {backup, covers, missingCovers: backup.fitxes_joc.filter(game => game.portada_url && !covers.some(cover => cover.gameId === game.id)).length}
}
