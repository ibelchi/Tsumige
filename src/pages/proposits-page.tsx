import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth'
import { useAccess } from '@/lib/access'
import { getAnyActual, getProposits, saveProposit } from '@/lib/proposits'
import type { EstatProposit, Proposit, PropositInput } from '@/lib/database.types'
import { Button } from '@/components/ui/button'
import { PropositStatus } from '@/components/proposit-status'
import { PropositsSummary } from '@/components/proposits-summary'

const field = 'w-full rounded-lg border bg-card px-3 py-2.5 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60'

export function PropositsPage() {
  const { session } = useAuth()
  const { canEdit } = useAccess()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<string | undefined>()
  const [text, setText] = useState('')
  const [year, setYear] = useState(String(getAnyActual()))
  const [status, setStatus] = useState<EstatProposit>('pendent')
  const [filter, setFilter] = useState('tots')
  const [saved, setSaved] = useState(false)
  const { data, error, isPending, refetch } = useQuery({ queryKey: ['proposits', session?.user.id, 'tots'], queryFn: () => getProposits(), enabled: Boolean(session) })
  const save = useMutation({
    mutationFn: ({ input, id }: { input: PropositInput; id?: string }) => saveProposit(input, id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['proposits', session?.user.id] })
      resetForm()
      setSaved(true)
    },
  })
  function resetForm() { setEditing(undefined); setText(''); setYear(String(getAnyActual())); setStatus('pendent'); setSaved(false); save.reset() }
  function edit(goal: Proposit) {
    setEditing(goal.id); setText(goal.text); setYear(String(goal.any)); setStatus(goal.estat); setSaved(false); save.reset()
    document.getElementById('proposit-text')?.focus()
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (save.isPending) return
    setSaved(false)
    save.mutate({ input: { text, any: Number(year), estat: status }, id: editing })
  }
  const years = [...new Set((data ?? []).map((goal) => goal.any))].sort((a, b) => b - a)
  const goals = (data ?? []).filter((goal) => filter === 'tots' || String(goal.any) === filter)
  return <div className="page-container">
    <h1 className="page-title">Propòsits</h1>
    <PropositsSummary showActions={false} />
    {canEdit && <section aria-labelledby="proposit-form-title" className="mt-6 rounded-xl border bg-card p-5 sm:p-6">
      <h2 id="proposit-form-title" className="text-lg font-semibold">{editing ? 'Edita el propòsit' : 'Nou propòsit'}</h2>
      <form onSubmit={submit} className="mt-5 space-y-4" aria-busy={save.isPending}>
        <div><label htmlFor="proposit-text" className="mb-2 block text-sm font-medium">Propòsit</label><textarea id="proposit-text" required maxLength={500} rows={3} value={text} onChange={(event) => setText(event.target.value)} disabled={save.isPending} className={field} /></div>
        <div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="proposit-year" className="mb-2 block text-sm font-medium">Any</label><input id="proposit-year" type="number" required min={1} max={9999} step={1} value={year} onChange={(event) => setYear(event.target.value)} disabled={save.isPending} className={field} /></div><div><label htmlFor="proposit-status" className="mb-2 block text-sm font-medium">Estat</label><select id="proposit-status" value={status} onChange={(event) => setStatus(event.target.value as EstatProposit)} disabled={save.isPending} className={field}><option value="pendent">Pendent</option><option value="fet">Fet</option><option value="descartat">Descartat</option></select></div></div>
        {save.error && <p role="alert" className="text-sm leading-6">{save.error.message}</p>}
        {saved && <p role="status">Propòsit desat.</p>}
        <div className="flex flex-wrap gap-2"><Button type="submit" disabled={save.isPending}>{save.isPending ? 'Desant…' : editing ? 'Desa els canvis' : 'Afegeix el propòsit'}</Button>{editing && <Button type="button" variant="outline" disabled={save.isPending} onClick={resetForm}>Cancel·la</Button>}</div>
      </form>
    </section>}
    <section aria-label="Tots els propòsits" className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">Els teus propòsits</h2><div className="flex items-center gap-2"><label htmlFor="proposit-filter" className="text-sm">Any</label><select id="proposit-filter" value={filter} onChange={(event) => setFilter(event.target.value)} className={field}><option value="tots">Tots els anys</option>{years.map((value) => <option key={value} value={value}>{value}</option>)}</select></div></div>
      {isPending ? <p role="status" className="mt-5">Carregant propòsits…</p> : error ? <div role="alert" className="mt-5"><p>{error.message}</p><Button onClick={() => void refetch()} variant="outline" className="mt-3">Torna-ho a provar</Button></div> : goals.length ? <ul className="mt-4 space-y-3">{goals.map((goal) => <li key={goal.id} className="flex flex-wrap items-center gap-4 rounded-xl border bg-card p-5"><div className="min-w-0 flex-1 basis-48"><p className="mb-1 text-sm font-medium text-muted-foreground">{goal.any}</p><p className="whitespace-pre-wrap break-words text-base leading-6">{goal.text}</p></div><PropositStatus estat={goal.estat} />{canEdit && <Button variant="outline" disabled={save.isPending} onClick={() => edit(goal)} aria-label={`Edita el propòsit: ${goal.text}`}>Edita</Button>}</li>)}</ul> : <p className="mt-5 text-muted-foreground">Encara no tens propòsits{filter === 'tots' ? '.' : ' per a aquest any.'}</p>}
    </section>
  </div>
}
