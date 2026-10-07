import type { Catalog } from '@/lib/catalog'
import type { FitxaJoc } from '@/lib/database.types'

export function gameComments(game: FitxaJoc, catalog: Catalog) {
  if (game.comentaris !== undefined) return { value: game.comentaris ?? '', conflict: false }
  const values = [...new Set([...catalog.exemplars, ...catalog.experiencies]
    .filter(record => record.joc_id === game.id)
    .map(record => record.notes).filter((value): value is string => Boolean(value?.trim())))]
  return { value: values.length === 1 ? values[0] : '', conflict: values.length > 1 }
}
