import { useEffect, useState } from 'react'
import type { FitxaJoc, IntencioJoc } from '@/lib/database.types'
import { intentionOptions, toggleGameIntention } from '@/lib/game-labels'
export function GameLabelFields({ game, onChange }: {
  game: Pick<FitxaJoc, 'no_jugat' | 'intencio_joc'>
  onChange?: (value: { no_jugat: boolean; intencio_joc: IntencioJoc }) => void
}) {
  const [localIntention, setLocalIntention] = useState(game.intencio_joc ?? null)
  useEffect(() => { setLocalIntention(game.intencio_joc ?? null) }, [game.intencio_joc])
  const intention = onChange ? game.intencio_joc ?? null : localIntention
  return <div role="group" aria-label="Etiquetes de la fitxa de videojoc" className="flex flex-wrap items-center gap-x-5 gap-y-2">
    <label className="flex min-h-10 items-center gap-2 text-sm"><input type="checkbox" name="no_jugat"
      {...(onChange ? { checked: game.no_jugat === true, onChange: (event: React.ChangeEvent<HTMLInputElement>) => onChange({ no_jugat: event.target.checked, intencio_joc: intention }) } : { defaultChecked: game.no_jugat === true })} />No jugat</label>
    {intentionOptions.map(option => <label key={option.value} className="flex min-h-10 items-center gap-2 text-sm"><input type="checkbox" checked={intention === option.value} onChange={() => {
      const next = toggleGameIntention(intention, option.value)
      if (onChange) onChange({ no_jugat: game.no_jugat === true, intencio_joc: next })
      else setLocalIntention(next)
    }} />{option.label}</label>)}
    <input type="hidden" name="intencio_joc" value={intention ?? ''} />
  </div>
}
