import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { getMetadata, searchMetadata, type GameMetadata, type MetadataProvider } from '@/lib/metadata'
export function MetadataSearch({ name, onImage }: { name: string; onImage: (image: string, sourceUrl: string) => void }) {
  return <div className="space-y-3"><ProviderSearch provider="igdb" name={name} onImage={onImage} /><ProviderSearch provider="rawg" name={name} onImage={onImage} /></div>
}
function ProviderSearch({ provider, name, onImage }: { provider: MetadataProvider; name: string; onImage: (image: string, sourceUrl: string) => void }) {
  const label = provider === 'igdb' ? 'IGDB' : 'RAWG'
  const [query, setQuery] = useState(name)
  const [results, setResults] = useState<GameMetadata[] | null>(null)
  const [chosen, setChosen] = useState<GameMetadata | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function search() {
    setBusy(true); setError(null); setChosen(null); setResults(null)
    try { setResults(await searchMetadata(provider, query)) } catch (caught) { setError((caught as Error).message) }
    finally { setBusy(false) }
  }
  async function choose(id: number) {
    setBusy(true); setError(null)
    try { setChosen(await getMetadata(provider, id)) } catch (caught) { setError((caught as Error).message) }
    finally { setBusy(false) }
  }
  return <details className="rounded-lg border p-4"><summary className="cursor-pointer text-sm font-medium">{provider === 'igdb' ? 'Busca una portada a IGDB' : 'Busca una imatge a RAWG'}</summary>
    <p className="mt-3 text-xs text-muted-foreground">{provider === 'igdb' ? 'Portades. Comprova que corresponen al teu joc i edició.' : 'Imatges promocionals. Pots comparar-les amb les portades d’IGDB.'}</p>
    <div className="mt-3 flex gap-2"><label className="grow"><span className="sr-only">Nom per cercar a {label}</span><input value={query} maxLength={120} onChange={e => setQuery(e.target.value)} className="w-full rounded-lg border bg-card p-2 text-sm" /></label><Button type="button" variant="outline" disabled={busy || query.trim().length < 2} onClick={() => void search()}>Cerca a {label}</Button></div>
    {busy && <p role="status" className="mt-3 text-sm">Consultant…</p>}{error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
    {results && !chosen && <div className="mt-3 space-y-2">{results.length ? results.map(game => <button key={game.id} type="button" disabled={busy} onClick={() => void choose(game.id)} className="w-full rounded-lg border p-3 text-left text-sm hover:bg-muted"><span className="font-medium">{game.title}</span><span className="mt-1 block text-xs text-muted-foreground">{game.year ?? 'Any no indicat'} · {game.platforms.join(', ')}</span></button>) : <p className="text-sm">Cap coincidència. Prova un altre nom.</p>}</div>}
    {chosen && <div className="mt-4 space-y-3"><p className="text-sm font-medium">{chosen.title}</p>{chosen.image && <img src={chosen.image} alt={`Imatge de ${chosen.title}`} className="max-h-48 w-full rounded-lg object-contain" />}<p className="text-xs text-muted-foreground">{chosen.year ?? 'Any no indicat'} · {chosen.developers.join(', ')}</p><p className="text-xs text-muted-foreground">{chosen.genres.join(', ')}</p>{chosen.description && <p className="max-h-32 overflow-auto text-sm">{chosen.description}</p>}<p className="text-xs">S’aplicarà només la imatge. Les altres dades es mostren per consultar-les.</p><Button type="button" disabled={!chosen.image || busy} onClick={() => { if (chosen.image) onImage(chosen.image, chosen.sourceUrl) }}>Utilitza aquesta imatge</Button></div>}
    <a href={provider === 'igdb' ? 'https://www.igdb.com' : 'https://rawg.io/apidocs'} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs underline">Dades i imatges d’{label}</a>
  </details>
}
