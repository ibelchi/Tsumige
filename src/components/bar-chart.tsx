import type {ReactNode} from 'react'
import {Link} from 'react-router-dom'
import {ratingColor} from '@/lib/game-rating'
import type {Valoracio} from '@/lib/database.types'
import type {StatisticRow} from '@/lib/statistics'
const euros = new Intl.NumberFormat('ca-ES', { style: 'currency', currency: 'EUR' })
function ChartBar({row,max,money,grades,href}: {row: StatisticRow; max: number; money: boolean; grades: boolean; href?: string}) {
 const content=<><div aria-hidden="true" className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary/70" style={{width:`${row.value/max*100}%`}} /></div><span className={`${money ? 'w-28' : 'min-w-8'} shrink-0 text-right tabular-nums ${grades ? ratingColor(row.label as Valoracio) : ''}`}>{money ? euros.format(row.value) : row.value}</span></>
 return href ? <Link to={href} aria-label={`Veure els jocs: ${row.label} · ${row.value}`} className="flex min-h-8 items-center gap-3 rounded-sm hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-ring">{content}</Link> : <div className="flex items-center gap-3">{content}</div>
}
export function BarChart({ title, rows, note, compact = false, money = false, grades = false, controls, link, emptyMessage }: { title: string; rows: StatisticRow[]; note?: string; compact?: boolean; money?: boolean; grades?: boolean; controls?: ReactNode; link?: (row: StatisticRow) => string; emptyMessage?: string }) {
  const max = Math.max(...rows.map(row => row.value), 1)
  return <section className="min-w-0 rounded-xl border bg-card p-5 sm:p-6" aria-label={title}>
    <header className="flex items-center justify-between gap-3"><h3 className="min-w-0 text-base font-semibold">{title}</h3>{compact && controls}</header>
    {note && <p className="mt-2 text-xs leading-5 text-muted-foreground">{note}</p>}
    {!compact && controls && <div className="mt-3">{controls}</div>}
    {rows.length ? <table className={`${compact ? "mt-2" : "mt-5"} w-full table-fixed text-sm`}><caption className="sr-only">{title}: {money ? 'imports en euros' : 'nombre de jocs'}</caption>
      <thead className="sr-only"><tr><th scope="col">Categoria</th><th scope="col">{money ? 'Despesa' : 'Jocs'}</th></tr></thead>
      <tbody>{rows.map(row => <tr key={row.label}>
        <th scope="row" className={`w-[42%] break-words py-2 pr-3 text-left font-normal ${grades ? ratingColor(row.label as Valoracio) : ''}`}>{link && !compact ? <Link className="inline-block rounded-sm underline decoration-current/40 underline-offset-4 hover:decoration-current focus-visible:outline-2 focus-visible:outline-ring" aria-label={`Veure els jocs: ${row.label}`} to={link(row)}>{row.label}</Link> : row.label}</th>
        <td className="py-2"><ChartBar row={row} max={max} money={money} grades={grades} href={compact && link ? link(row) : undefined} /></td>
      </tr>)}</tbody>
    </table> : <p className="mt-5 text-sm text-muted-foreground">{emptyMessage ?? 'Encara no hi ha dades per mostrar.'}</p>}
  </section>
}
