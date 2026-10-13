import type { Catalog } from './catalog'
import { platformName } from './platform'
export function searchTitle(value: string) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim() }
export function homeSearchGames(catalog: Catalog, text: string) {
  const query = searchTitle(text)
  return query ? catalog.jocs.filter(game => searchTitle(game.nom).includes(query)).sort((a,b) => a.nom.localeCompare(b.nom,'ca') || platformName(a.plataforma).localeCompare(platformName(b.plataforma),'ca') || a.id.localeCompare(b.id)) : []
}
