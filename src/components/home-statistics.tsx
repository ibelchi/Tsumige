import {useState} from 'react'
import {useQuery} from '@tanstack/react-query'
import {CalendarDays, Medal, ChartColumn} from 'lucide-react'
import {useAuth} from '@/lib/auth'
import {getCatalog} from '@/lib/catalog'
import {Button} from '@/components/ui/button'
import {BarChart} from '@/components/bar-chart'
import {homeStatisticViews,homeStatisticTitles,savedHomeStatistic,homeStatisticRows,homeStatisticLink, type HomeStatisticView} from '@/lib/home-statistics'
export function HomeStatistics() {
  const {session}=useAuth()
  const [view,setView]=useState(savedHomeStatistic)
  const {data,error,isPending}=useQuery({queryKey:['catalog',session?.user.id],queryFn:getCatalog,enabled:Boolean(session)})
  const icons = {played: CalendarDays, ratings: Medal, platforms: ChartColumn}
  const rows=data ? homeStatisticRows(data,view) : []
  function changeView(next: HomeStatisticView) {
    setView(next)
    try {window.localStorage.setItem('tsumige.home.statistic',next)} catch { /* Continua funcionant sense Storage. */ }
  }
  return <BarChart compact title={homeStatisticTitles[view]} rows={rows} grades={view==='ratings'} link={row=>homeStatisticLink(view,row.label)}
    emptyMessage={error ? 'No s’han pogut carregar les estadístiques.' : isPending ? 'Carregant estadístiques…' : undefined}
    note={error ? `No s’han pogut carregar les estadístiques: ${error.message}` : isPending ? undefined : rows.length && rows.every(row=>row.value===0) ? 'Encara no hi ha dades per mostrar en aquesta visualització.' : undefined}
    controls={<div role="group" aria-label="Visualització de les estadístiques" className="flex shrink-0 gap-1">{homeStatisticViews.map(option => {
      const Icon = icons[option]
      return <Button key={option} type="button" variant="ghost" size="icon" className={`size-11 shrink-0 ${view === option ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}`} aria-pressed={view === option} aria-label={homeStatisticTitles[option]} title={homeStatisticTitles[option]} onClick={() => changeView(option)}><Icon aria-hidden="true" /></Button>
    })}</div>}
    />
}
