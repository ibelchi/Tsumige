import { useQuery } from '@tanstack/react-query'
import { BookOpen, ExternalLink } from 'lucide-react'
import { getReadings, selectReadings } from '@/lib/readings'

export function ReadingsPanel() {
  const query = useQuery({ queryKey: ['anait-readings'], queryFn: getReadings, staleTime: (query) => query.state.data?.partial || query.state.data?.stale ? 300_000 : 6 * 60 * 60 * 1000, gcTime: 6 * 60 * 60 * 1000, retry: 1, refetchOnWindowFocus: false })
  const entries = selectReadings(query.data?.entries ?? [])
  return <section aria-labelledby="readings-title" className="min-w-0 border-t px-4 py-4">
    <h2 id="readings-title" className="flex items-center gap-2 text-sm font-semibold"><BookOpen size={16} aria-hidden="true" />Lectures</h2>
    {query.isPending ? <p role="status" className="mt-4 text-sm text-muted-foreground">Carregant lectures…</p> : query.isError ? <div role="status" className="mt-4 text-sm text-muted-foreground">Ara no es poden carregar les lectures. <button onClick={() => void query.refetch()} className="min-h-11 underline">Torna-ho a provar</button></div> : entries.length === 0 ? <p role="status" className="mt-4 text-sm text-muted-foreground">No hi ha lectures disponibles.</p> : <ul className="mt-3 space-y-3">{entries.map((entry) => <li key={entry.url}>
      <a href={entry.url} target="_blank" rel="noopener noreferrer" title={entry.title} className="relative block rounded-sm pr-4 text-sm font-medium leading-snug [overflow-wrap:anywhere] hover:underline"><span className="line-clamp-3">{entry.title}</span><ExternalLink size={11} className="absolute right-0 top-1" aria-hidden="true" /><span className="sr-only"> (s’obre en una pestanya nova)</span></a>
      <p className="mt-1 text-xs text-muted-foreground"><time dateTime={entry.date}>{new Intl.DateTimeFormat('ca', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(entry.date))}</time></p>
    </li>)}</ul>}
    {(query.data?.partial || query.data?.stale) && <p role="status" className="mt-4 text-xs text-muted-foreground">{query.data.stale ? 'Mostrem les darreres lectures disponibles.' : 'Algunes fonts no estan disponibles.'}</p>}
  </section>
}
