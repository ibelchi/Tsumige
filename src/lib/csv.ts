import { collectionCopy, platformName } from './platform.ts'
import type { Backup } from '@/lib/backup'
type Cell = string | number | null | undefined
export type CsvKind = 'colleccio' | 'historial'
function yesNo(value: boolean | null): string | null { return value === null ? null : value ? 'Sí' : 'No' }
function cell(value: Cell): string {
  let text = value == null ? '' : String(value)
  // Quoting alone does not prevent spreadsheet formula execution.
  if (typeof value === 'string' && (/^[\s\uFEFF]*[=+\-@]/.test(text) || /^[\t\r\n]/.test(text))) text = `'${text}`
  return `"${text.replaceAll('"', '""')}"`
}
export function buildCsv(backup: Backup, kind: CsvKind, includeRetired = false): { content: string; count: number } {
  const games = new Map(backup.fitxes_joc.map(game => [game.id, game]))
  function game(id: string) {
    const found = games.get(id)
    if (!found) throw new Error('Falta la fitxa d’un joc. Torna a preparar l’exportació.')
    return found
  }
  let headers: string[]
  let rows: Cell[][]
  if (kind === 'colleccio') {
    headers = ['Joc', 'Plataforma', 'Format', 'A la col·lecció', 'Regió', 'Conservació', 'Any de compra', 'Preu (€)', 'Botiga original (pendent de conversió)', 'Favorit', 'Possible venda o intercanvi', 'Reproducció', 'No localitzat', 'Comentaris', 'Desenvolupadora', 'Gènere', 'Gèneres secundaris', 'Any de llançament', 'Sinopsi', 'URL de la imatge', 'Procedència de la imatge', 'Per jugar aviat', 'Revisat', 'Per jugar amb infants', 'Valoració']
    rows = backup.exemplars.filter(copy => includeRetired || collectionCopy(copy, games.get(copy.joc_id))).map(copy => {
      const j = game(copy.joc_id)
      return [j.nom, platformName(j.plataforma), copy.format === 'fisic' ? 'Físic' : 'Digital', yesNo(copy.a_la_colleccio), copy.regio, copy.estat_conservacio, copy.any_compra, copy.preu == null ? null : String(copy.preu).replace('.', ','), copy.botiga_servei, yesNo(copy.favorit), yesNo(copy.canvi), yesNo(copy.reproduccio), yesNo(copy.no_localitzat), j.comentaris !== undefined ? j.comentaris : copy.notes, j.desenvolupadora, j.genere_principal, j.generos_secundaris.join(' | '), j.any_llancament, j.sinopsi, j.portada_url, j.portada_font_url, yesNo(j.per_jugar_aviat), yesNo(copy.revisat), j.per_infants === undefined ? null : yesNo(j.per_infants), j.valoracio]
    })
  } else {
    headers = ['Joc', 'Plataforma', 'Any de joc', 'Completat', 'Valoració', 'Comentaris', 'Hi estic jugant', 'Per jugar aviat', 'A la col·lecció', 'Desenvolupadora', 'Gènere', 'Any de llançament', 'URL de la imatge', 'Revisat', 'Per jugar amb infants']
    const owned = new Set(backup.exemplars.filter(copy => collectionCopy(copy, games.get(copy.joc_id))).map(copy => copy.joc_id))
    rows = backup.experiencies.map(experience => {
      const j = game(experience.joc_id)
      return [j.nom, platformName(j.plataforma), experience.any_jugat, experience.completat === null ? null : experience.completat === 'no_aplicable' ? 'No aplicable' : experience.completat === 'si' ? 'Sí' : 'No', j.valoracio !== undefined ? j.valoracio : experience.valoracio, j.comentaris !== undefined ? j.comentaris : experience.notes, yesNo(experience.jugant), yesNo(j.per_jugar_aviat), yesNo(owned.has(j.id)), j.desenvolupadora, j.genere_principal, j.any_llancament, j.portada_url, yesNo(experience.revisat), j.per_infants === undefined ? null : yesNo(j.per_infants)]
    })
  }
  if (kind === 'colleccio' && backup.fitxes_joc.every(game => game.plataforma_resolta === true)) {
    headers.splice(8, 1)
    rows.forEach(row => row.splice(8, 1))
  }
  // UTF-8 BOM preserves Japanese text and Catalan accents in Excel.
  return { content: '\uFEFF' + [headers, ...rows].map(row => row.map(cell).join(';')).join('\r\n') + '\r\n', count: rows.length }
}
