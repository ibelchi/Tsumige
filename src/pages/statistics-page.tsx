import { useQuery } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { getCatalog } from '@/lib/catalog'
import { useAuth } from '@/lib/auth'
import { statistics, type StatisticRow } from '@/lib/statistics'
import { ratingColor } from '@/lib/game-rating'
import type { Valoracio } from '@/lib/database.types'

const euros = new Intl.NumberFormat('ca-ES', { style: 'currency', currency: 'EUR' })
function FormatFilter({ label, selected, onChange }: { label: string; selected: string[]; onChange: (values: string[]) => void }) {
  return <fieldset className="flex flex-wrap gap-4 text-sm"><legend className="sr-only">{label}</legend>{[{ value: 'fisic', label: 'Físics' }, { value: 'digital', label: 'Digitals' }].map(format => <label key={format.value} className="flex min-h-10 items-center gap-2"><input type="checkbox" checked={selected.includes(format.value)} onChange={e => onChange(e.target.checked ? [...selected, format.value] : selected.filter(value => value !== format.value))} />{format.label}</label>)}</fieldset>
}
function BarChart({ title, rows, note, money = false, grades = false, controls, link }: { title: string; rows: StatisticRow[]; note: string; money?: boolean; grades?: boolean; controls?: ReactNode; link?: (row: StatisticRow) => string }) {
  const max = Math.max(...rows.map(row => row.value), 1)
  return <section className="min-w-0 rounded-xl border bg-card p-5 sm:p-6" aria-label={title}>
    <h3 className="text-base font-semibold">{title}</h3>
    <p className="mt-2 text-xs leading-5 text-muted-foreground">{note}</p>
    {controls && <div className="mt-3">{controls}</div>}
    {rows.length ? <table className="mt-5 w-full table-fixed text-sm"><caption className="sr-only">{title}: {money ? 'imports en euros' : 'nombre de jocs'}</caption>
      <thead className="sr-only"><tr><th scope="col">Categoria</th><th scope="col">{money ? 'Despesa' : 'Jocs'}</th></tr></thead>
      <tbody>{rows.map(row => <tr key={row.label}>
        <th scope="row" className={`w-[42%] break-words py-2 pr-3 text-left font-normal ${grades ? ratingColor(row.label as Valoracio) : ''}`}>{link ? <Link className="inline-block rounded-sm underline decoration-current/40 underline-offset-4 hover:decoration-current focus-visible:outline-2 focus-visible:outline-ring" aria-label={`Veure els jocs: ${row.label}`} to={link(row)}>{row.label}</Link> : row.label}</th>
        <td className="py-2"><div className="flex items-center gap-3">
          <div aria-hidden="true" className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary/70" style={{ width: `${row.value / max * 100}%` }} /></div>
          <span className={`${money ? 'w-28' : 'w-8'} shrink-0 text-right tabular-nums ${grades ? ratingColor(row.label as Valoracio) : ''}`}>{money ? euros.format(row.value) : row.value}</span>
        </div></td>
      </tr>)}</tbody>
    </table> : <p className="mt-5 text-sm text-muted-foreground">Encara no hi ha dades per mostrar.</p>}
  </section>
}
export function StatisticsPage() {
  const { session } = useAuth()
  const [platformFormats, setPlatformFormats] = useState(['fisic', 'digital'])
  const [genreFormats, setGenreFormats] = useState(['fisic', 'digital'])
  const [purchaseYears, setPurchaseYears] = useState<string[] | null>(null)
  const { data, error, isPending } = useQuery({ queryKey: ['catalog', session?.user.id], queryFn: getCatalog, enabled: Boolean(session) })
  const stats = data ? statistics(data, { platformFormats, genreFormats, purchaseYears }) : null
  const availableYears = [...new Set(data?.exemplars.map(copy => copy.any_compra === null ? 'Sense any' : String(copy.any_compra)) ?? [])].sort((a, b) => (Number(b) || 0) - (Number(a) || 0))
  return <div className="page-container">
    <h1 className="page-title">Estadístiques</h1>
    {isPending && <p role="status" className="mt-6 text-sm text-muted-foreground">Carregant estadístiques…</p>}
    {error && <p role="alert" className="mt-6 text-sm text-red-700">{error.message}</p>}
    {stats && <div className="mt-8 space-y-9">
      <section aria-labelledby="stats-colleccio"><h2 id="stats-colleccio" className="mb-4 text-xl font-semibold">Col·lecció</h2>
        <div className="grid items-start gap-4 lg:grid-cols-2">
          <BarChart title="Jocs per plataforma" rows={stats.platforms} link={row => { const query = new URLSearchParams({ vista: 'colleccio', plataforma: row.label }); platformFormats.forEach(format => query.append('format', format)); return `/?${query}` }} note="Exemplars que tens a la col·lecció. Cada exemplar compta." controls={<fieldset className="flex flex-wrap gap-4 text-sm"><legend className="sr-only">Formats de jocs per plataforma</legend>{[{ value: 'fisic', label: 'Físics' }, { value: 'digital', label: 'Digitals' }].map(format => <label key={format.value} className="flex min-h-10 items-center gap-2"><input type="checkbox" checked={platformFormats.includes(format.value)} onChange={e => setPlatformFormats(previous => e.target.checked ? [...previous, format.value] : previous.filter(value => value !== format.value))} />{format.label}</label>)}</fieldset>} />
          <BarChart title="Jocs per gènere" rows={stats.genres} link={row => { const query = new URLSearchParams({ vista: 'colleccio', genere: row.label }); genreFormats.forEach(format => query.append('format', format)); return `/?${query}` }} note="Gènere principal dels exemplars de la col·lecció. Els buits apareixen com a Sense gènere." controls={<FormatFilter label="Formats de jocs per gènere" selected={genreFormats} onChange={setGenreFormats} />} />
        </div>
      </section>
      <section aria-labelledby="stats-compres"><h2 id="stats-compres" className="mb-4 text-xl font-semibold">Compres</h2>
        <details className="mb-4 max-w-sm rounded-lg border bg-card p-3"><summary className="cursor-pointer text-sm">Anys de compra · {purchaseYears === null ? 'Tots' : `${purchaseYears.filter(value => value !== 'Sense any').length} seleccionats${purchaseYears.includes('Sense any') ? ' i sense any' : ''}`}</summary>
          <fieldset className="mt-3 max-h-64 overflow-y-auto text-sm"><legend className="sr-only">Selecciona anys de compra</legend><div className="mb-2 flex gap-2"><Button type="button" size="sm" variant="outline" onClick={() => setPurchaseYears(null)}>Tots</Button><Button type="button" size="sm" variant="outline" onClick={() => setPurchaseYears([])}>Cap</Button></div>
            {availableYears.map(year => <label key={year} className="flex min-h-10 items-center gap-2"><input type="checkbox" checked={purchaseYears === null || purchaseYears.includes(year)} onChange={e => setPurchaseYears(previous => { const selected = previous ?? availableYears; return e.target.checked ? [...selected, year] : selected.filter(value => value !== year) })} />{year}</label>)}
          </fieldset>
        </details>
        <BarChart title="Despesa per any" rows={stats.spending} money note="Inclou les compres d’exemplars retirats. Els zeros es compten; els preus desconeguts no s’estimen. Els imports sense any es mostren a part." />
      </section>
      <section aria-labelledby="stats-bitacora"><h2 id="stats-bitacora" className="mb-4 text-xl font-semibold">Bitàcora i valoracions</h2>
        <div className="grid items-start gap-4 lg:grid-cols-2">
          <BarChart title="Jocs jugats per any" rows={stats.playedByYear} link={row => `/?vista=jugats&any=${row.label}`} note={`Cada joc compta una vegada per any, encara que tingui diverses entrades. ${stats.missingPlayedYear} entrades sense any queden fora del gràfic.`} />
          <BarChart title="Valoracions dels jocs" rows={stats.ratings} grades link={row => `/?vista=valoracions&valoracio=${encodeURIComponent(row.label)}`} note={`Cada joc compta una vegada, encara que no sigui a la col·lecció. ${stats.unrated} jocs sense valoració.`} />
        </div>
      </section>
    </div>}
  </div>
}
