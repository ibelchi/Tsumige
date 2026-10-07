import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { useAccess } from '@/lib/access'
import { getAnyActual, getProposits } from '@/lib/proposits'
import { PropositStatus } from '@/components/proposit-status'
import { Button } from '@/components/ui/button'

export function PropositsSummary({ showActions = true }: { showActions?: boolean }) {
  const { session } = useAuth()
  const { canEdit } = useAccess()
  const year = getAnyActual()
  const { data, isPending, error, refetch } = useQuery({ queryKey: ['proposits', session?.user.id, 'resum', year], queryFn: () => getProposits([year, year - 1]), enabled: Boolean(session) })
  return (
    <section aria-label="Propòsits de l’any vigent i anterior" className="mt-3">
      {error ? <div role="alert" className="rounded-xl border bg-card p-5"><p>{error.message}</p><Button variant="outline" onClick={() => void refetch()} className="mt-3">Torna-ho a provar</Button></div> : isPending ? <p role="status" className="text-sm text-muted-foreground">Carregant propòsits…</p> : (
        <div className="grid gap-3 md:grid-cols-2">{[year, year - 1].map((value) => {
          const goals = data.filter((goal) => goal.any === value)
          return <section key={value} aria-label={`Propòsits de ${value}`} className="rounded-xl border bg-card p-5"><h3 className="font-semibold">{value} <span className="ml-1 text-sm font-normal text-muted-foreground">{value === year ? 'Any actual' : 'Any anterior'}</span></h3>{goals.length ? <ul className="mt-3 divide-y">{goals.map((goal) => <li key={goal.id} className="flex flex-wrap items-start justify-between gap-3 py-4"><p className="min-w-0 flex-1 basis-40 whitespace-pre-wrap break-words text-base leading-6">{goal.text}</p><PropositStatus estat={goal.estat} /></li>)}</ul> : <p className="mt-4 text-sm text-muted-foreground">Cap propòsit per a aquest any.</p>}</section>
        })}</div>
      )}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div aria-label="Llegenda dels estats" className="flex flex-wrap items-center gap-2"><span className="mr-1 text-sm text-muted-foreground">Estats:</span><PropositStatus estat="fet" /><PropositStatus estat="pendent" /><PropositStatus estat="descartat" /></div>
        {canEdit && showActions && <div className="flex flex-wrap gap-3"><Button asChild variant="outline" size="sm"><Link to="/?vista=proposits">Gestiona els propòsits</Link></Button></div>}
      </div>
    </section>
  )
}
