import type { FitxaJoc, IntencioJoc } from './database.types'
export const intentionOptions = [
  { value: 'vull', label: 'Vull jugar-hi' },
  { value: 'no_vull', label: 'No vull jugar-hi' },
] as const
export function isGameIntention(value: unknown): value is IntencioJoc {
  return value === null || value === 'vull' || value === 'no_vull'
}
export function gameLabels(game: Pick<FitxaJoc, 'no_jugat' | 'intencio_joc'>): string[] {
  return [...(game.no_jugat === true ? ['No jugat'] : []), ...intentionOptions.filter(o => o.value === game.intencio_joc).map(o => o.label)]
}
export function gameLabelFields(form: FormData) {
  const intention = form.get('intencio_joc') || null
  if (!isGameIntention(intention)) throw new Error('La intenció de joc no és vàlida.')
  return { no_jugat: form.has('no_jugat'), intencio_joc: intention }
}
export function matchesGameLabels(game: Pick<FitxaJoc, 'no_jugat' | 'intencio_joc'>, params: URLSearchParams) {
  const intention = params.get('intencio_joc')
  return (params.get('no_jugat') !== '1' || game.no_jugat === true)
    && (!intentionOptions.some(o => o.value === intention) || game.intencio_joc === intention)
}
export function setGameLabelFilter(params: URLSearchParams, key: 'no_jugat' | 'intencio_joc', value: string) {
  const next = new URLSearchParams(params)
  next.delete(key)
  if (key === 'no_jugat' ? value === '1' : value === 'vull' || value === 'no_vull') next.set(key, value)
  return next
}

export function toggleGameIntention(current: IntencioJoc, clicked: Exclude<IntencioJoc, null>): IntencioJoc {
  return current === clicked ? null : clicked
}

export function toggleGameIntentionFilter(params: URLSearchParams, clicked: Exclude<IntencioJoc, null>) {
  const current = params.get('intencio_joc')
  return setGameLabelFilter(params, 'intencio_joc', toggleGameIntention(current === 'vull' || current === 'no_vull' ? current : null, clicked) ?? '')
}
