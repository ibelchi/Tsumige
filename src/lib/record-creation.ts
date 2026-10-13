import type { Catalog } from './catalog'
import type { FitxaJoc, Json } from './database.types'
import { platformName } from './platform.ts'

export type CreationKind = 'exemplar' | 'experiencia'
export type CreationResult = { id: string; joc_id: string; existent: boolean }
export function creationSuggestions(catalog: Catalog, title: string): FitxaJoc[] {
  const search = title.trim().toLocaleLowerCase()
  return search ? catalog.jocs.filter(game => `${game.nom} ${platformName(game.plataforma)}`.toLocaleLowerCase().includes(search))
    .sort((a, b) => a.nom.localeCompare(b.nom, 'ca') || a.plataforma.localeCompare(b.plataforma, 'ca') || a.id.localeCompare(b.id)) : []
}
export function sameGamePlatform(catalog: Catalog, title: string, platform: string): FitxaJoc[] {
  return catalog.jocs.filter(game => game.nom.trim().toLocaleLowerCase() === title.trim().toLocaleLowerCase()
    && platformName(game.plataforma).toLocaleLowerCase() === platformName(platform).toLocaleLowerCase())
}
export function existingAnnualEntries(catalog: Catalog, gameId: string, year: number) {
  return catalog.experiencies.filter(entry => entry.joc_id === gameId && entry.any_jugat === year)
}
export function creationResult(value: Json): CreationResult {
  if (!value || typeof value !== 'object' || Array.isArray(value) || typeof value.id !== 'string' || typeof value.joc_id !== 'string' || typeof value.existent !== 'boolean') {
    throw new Error('No s’ha pogut confirmar el resultat. Torna-ho a provar sense tancar el formulari.')
  }
  return { id: value.id, joc_id: value.joc_id, existent: value.existent }
}
export function creationError(message: string): string {
  const known: Record<string, string> = {
    ALTA_JOC_EXISTENT: 'Aquest joc ja existeix amb aquesta plataforma. Selecciona’l explícitament als suggeriments.',
    ALTA_MULTIPLES: 'Hi ha diversos registres relacionats. Obre’n un explícitament; no s’han fusionat ni modificat dades.',
    ALTA_CONFLICTE: 'Cal confirmar la conservació del digital com a històric abans d’afegir el físic. Revisa les compres i els comentaris.',
    ALTA_CANVI: 'Les dades del joc o de l’exemplar han canviat. Torna a seleccionar el joc per revisar-les; es conserva l’esborrany.',
    ALTA_DADES: 'Revisa els camps: hi ha un valor no vàlid. Els valors es conserven.',
    ALTA_ANY: 'Indica un any de joc vàlid.',
    ALTA_EMULADOR: 'Emulador només es pot afegir al log.',
    ALTA_PERMIS: 'No tens permís per afegir registres.',
    ALTA_PENDENT: 'Cal resoldre la plataforma d’aquest joc abans d’afegir-hi registres.',
  }
  return Object.entries(known).find(([key]) => message.includes(key))?.[1]
    ?? 'No s’ha pogut confirmar l’alta. Els valors es conserven; torna-ho a provar sense tancar el formulari.'
}

export class CreationFailure extends Error {
  constructor(message: string, public readonly definitive: boolean) { super(message); this.name = "CreationFailure" }
}
