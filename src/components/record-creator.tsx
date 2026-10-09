import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { RecordEditor } from '@/components/record-editor'
import type { Catalog } from '@/lib/catalog'
import type { Exemplar, Experiencia, FitxaJoc } from '@/lib/database.types'

function ChooseGame({ kind, catalog, onClose, onChoose }: { kind: 'exemplar' | 'experiencia'; catalog: Catalog; onClose: () => void; onChoose: (gameId: string) => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [gameId, setGameId] = useState('')
  const [search, setSearch] = useState('')
  const [newGame, setNewGame] = useState(false)
  useEffect(() => { dialog.current?.showModal() }, [])
  const games = catalog.jocs.filter(j => `${j.nom} ${j.plataforma}`.toLocaleLowerCase().includes(search.toLocaleLowerCase()))
  return <dialog ref={dialog} onCancel={onClose} aria-labelledby="alta-titol" className="m-auto max-h-[90dvh] w-[min(94vw,640px)] overflow-auto rounded-xl border bg-card p-6 text-foreground shadow-xl backdrop:bg-black/40">
    <h2 id="alta-titol" className="text-xl font-semibold">{kind === 'exemplar' ? 'Afegeix a la col·lecció' : 'Afegeix una experiència'}</h2>
    <p className="mt-3 text-sm text-muted-foreground">Tria la fitxa del joc. Pots afegir un altre exemplar o una experiència d’un joc existent.</p>
    <div className="mt-5 flex flex-wrap gap-4 text-sm"><label className="flex items-center gap-2"><input type="radio" name="fitxa" checked={!newGame} onChange={() => setNewGame(false)} />Joc existent</label><label className="flex items-center gap-2"><input type="radio" name="fitxa" checked={newGame} onChange={() => setNewGame(true)} />Joc nou</label></div>
    {!newGame && <div className="mt-5 space-y-3"><label className="block text-sm">Cerca un joc<input type="search" value={search} onChange={e => { setSearch(e.target.value); setGameId('') }} className="mt-1 w-full rounded-lg border bg-card p-2" /></label><label className="block text-sm">Joc<select value={gameId} onChange={e => setGameId(e.target.value)} className="mt-1 w-full rounded-lg border bg-card p-2"><option value="">Selecciona un joc…</option>{games.map(j => <option key={j.id} value={j.id}>{j.nom} · {j.plataforma}</option>)}</select></label></div>}
    <div className="mt-6 flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Cancel·la</Button><Button disabled={!newGame && !gameId} onClick={() => onChoose(newGame ? '' : gameId)}>Continua</Button></div>
  </dialog>
}

export function RecordCreator({ kind, catalog, onClose, onSaved, initialGameId }: { kind: 'exemplar' | 'experiencia'; catalog: Catalog; onClose: () => void; onSaved: () => Promise<Catalog | void>; initialGameId?: string }) {
  const [choice, setChoice] = useState<string | null>(initialGameId ?? null)
  if (choice === null) return <ChooseGame kind={kind} catalog={catalog} onClose={onClose} onChoose={setChoice} />
  const game: FitxaJoc = catalog.jocs.find(j => j.id === choice) ?? { id: '', user_id: '', nom: '', plataforma: '', desenvolupadora: null, genere_principal: null, generos_secundaris: [], any_llancament: null, sinopsi: null, portada_url: null, per_jugar_aviat: false, created_at: '', updated_at: '' }
  const common = { id: '', user_id: '', joc_id: game.id, notes: null, revisat: true, origen: null, created_at: '', updated_at: '' }
  const record: Exemplar | Experiencia = kind === 'exemplar' ? { ...common, format: 'fisic', regio: null, estat_conservacio: null, any_compra: null, preu: null, botiga_servei: null, favorit: false, canvi: false, reproduccio: false, no_localitzat: null, a_la_colleccio: true } : { ...common, any_jugat: null, completat: null, valoracio: null, jugant: false }
  return <RecordEditor kind={kind} record={record} game={game} catalog={catalog} creating existingGame={Boolean(choice)} onSaved={onSaved} onClose={onClose} />
}
