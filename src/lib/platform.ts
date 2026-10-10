import type { Catalog } from './catalog'
import type { Exemplar, FitxaJoc } from './database.types'

export function platformName(value: string): string {
  const trimmed = value.trim()
  const known: Record<string, string> = { epic: 'Epic Games', 'epic games': 'Epic Games', 'epic games store': 'Epic Games', steam: 'Steam', 'itch.io': 'itch.io', pc: 'PC', emulador: 'Emulador' }
  return known[trimmed.toLocaleLowerCase()] ?? trimmed
}
export function pcStore(value: string): boolean { return ['Steam', 'Epic Games', 'itch.io'].includes(platformName(value)) }
export function isEmulator(value: string): boolean { return platformName(value) === 'Emulador' }
export function collectionCopy(copy: Exemplar, game: FitxaJoc | undefined): boolean {
  return Boolean(copy.a_la_colleccio && game && !isEmulator(game.plataforma))
}
export function platformOptions(catalog: Catalog): string[] {
  return [...new Set(['Steam', 'Epic Games', 'itch.io', 'PC', 'Nintendo Switch', 'PS4', 'Emulador', ...catalog.jocs.map(game => platformName(game.plataforma))])].filter(Boolean).sort((a, b) => a.localeCompare(b, 'ca'))
}
export function platformCoverage(catalog: Catalog): string[] {
  const warnings: string[] = []
  const games = new Map(catalog.jocs.map(game => [game.id, game]))
  for (const [name, records] of [['Jocs', catalog.jocs], ['Exemplars', catalog.exemplars], ['Bitàcora', catalog.experiencies]] as const) {
    if (new Set(records.map(record => record.id)).size !== records.length) warnings.push(`${name}: identificadors duplicats.`)
  }
  for (const record of [...catalog.exemplars, ...catalog.experiencies]) {
    if (!games.has(record.joc_id) || games.get(record.joc_id)?.user_id !== record.user_id) warnings.push(`Vincle absent o d’un altre propietari: ${record.id}.`)
  }
  for (const game of catalog.jocs) {
    if (!game.plataforma.trim()) warnings.push(`Plataforma buida: ${game.id}; es conserva buida, sense inventar-ne cap.`)
    if (game.valoracio === undefined || game.comentaris === undefined) warnings.push(`Camps compartits no disponibles: ${game.id}; no es pot completar el contrast.`)
  }
  return warnings
}
export type PlatformIssue = { group: 'botigues' | 'bitacora' | 'formats' | 'emulador' | 'coincidencies' | 'pendents' | 'valoracions' | 'comentaris' | 'compres'; gameId: string; recordIds: string[]; message: string }
export function platformIssues(catalog: Catalog): PlatformIssue[] {
  const issues: PlatformIssue[] = []
  for (const game of catalog.jocs) {
    const copies = catalog.exemplars.filter(copy => copy.joc_id === game.id)
    const entries = catalog.experiencies.filter(entry => entry.joc_id === game.id)
    const active = copies.filter(copy => copy.a_la_colleccio)
    const platform = platformName(game.plataforma)
    const stores = [...new Set(copies.map(copy => platformName(copy.botiga_servei ?? '')).filter(Boolean))]
    const add = (group: PlatformIssue['group'], recordIds: string[], message: string) => issues.push({ group, gameId: game.id, recordIds, message })
    if (game.plataforma_resolta !== true) add('pendents', copies.map(copy => copy.id), 'Plataforma antiga encara no confirmada; no es converteix automàticament.')
    if (game.plataforma_resolta !== true && stores.some(store => store !== platform)) {
      add('botigues', copies.filter(copy => copy.botiga_servei?.trim()).map(copy => copy.id), `Plataforma i botiga originals diferents (${[platform, ...stores].join(' / ')}). Cal confirmar el destí de cada exemplar; un venedor físic no determina la plataforma.`)
      if (entries.length) add('bitacora', entries.map(entry => entry.id), 'Hi ha entrades vinculades a la plataforma original. No es pot deduir la seva botiga dels exemplars; cal conservar el joc original o indicar explícitament el destí de cada entrada.')
    }
    if (active.some(copy => copy.format === 'fisic') && active.some(copy => copy.format === 'digital')) {
      add('formats', active.map(copy => copy.id), `Exemplars físics i digitals del mateix registre. Revisar compra, preu, notes i estat abans de deixar de comptar el digital.${platform === 'PC' ? ' PC no és una consola: cal aclarir aquest cas.' : ''}`)
    }
    if (entries.some(entry => entry.valoracio !== null && game.valoracio !== undefined && entry.valoracio !== game.valoracio)) {
      add('valoracions', entries.filter(entry => entry.valoracio !== null && entry.valoracio !== game.valoracio).map(entry => entry.id), 'Valoracions antigues diferents de la valoració compartida; revisar abans de consolidar o repartir fitxes.')
    }
    const notes = [...copies, ...entries].filter(record => record.notes?.trim())
    const texts = new Set(notes.map(record => record.notes!.trim()))
    if ((game.comentaris !== undefined && notes.some(record => record.notes!.trim() !== (game.comentaris ?? '').trim())) || texts.size > 1) {
      add('comentaris', notes.map(record => record.id), 'Notes antigues i comentaris compartits amb continguts diferents; conservar-los fins que es decideixi el tractament.')
    }
    if (active.some(copy => copy.format === 'fisic') && active.some(copy => copy.format === 'digital') && new Set(active.map(copy => JSON.stringify([copy.any_compra, copy.preu, copy.botiga_servei, copy.notes]))).size > 1) {
      add('compres', active.map(copy => copy.id), 'Dades de compra o notes diferents entre exemplars de formats diferents. Cap dada es descarta en deixar de comptar el digital.')
    }
    if (isEmulator(platform) && copies.length) add('emulador', copies.map(copy => copy.id), 'Emulador té exemplars històrics; cal acordar-ne la conservació fora de Col·lecció. Les entrades es preserven, sense crear-ne anys ficticis.')
    const matches = catalog.jocs.filter(other => other.id !== game.id && other.nom.trim().toLocaleLowerCase() === game.nom.trim().toLocaleLowerCase() && [platform, ...(game.plataforma_resolta === true ? [] : stores)].some(candidate => platformName(other.plataforma).toLocaleLowerCase() === candidate.toLocaleLowerCase()))
    if (matches.length) add('coincidencies', matches.map(other => other.id), 'Coincidència de nom i plataforma normalitzats: revisar valoracions, comentaris i compres, sense fusionar IDs ni redistribuir Bitàcora automàticament.')
  }
  return issues
}
export function resolvedPlatformError(catalog: Catalog, gameId: string, platform: string, format?: 'fisic' | 'digital', copyId?: string): string | null {
  if (format && isEmulator(platform)) return 'Emulador només admet entrades de Bitàcora, sense exemplars a Col·lecció.'
  if (format && platformName(platform) !== 'PC') {
    const other = catalog.exemplars.find(copy => copy.joc_id === gameId && copy.id !== copyId && copy.a_la_colleccio && copy.format !== format)
    if (other) return 'Aquest joc ja té un exemplar de l’altre format. Cal revisar les dades de compra abans de consolidar-los; no s’ha modificat res.'
  }
  return null
}
