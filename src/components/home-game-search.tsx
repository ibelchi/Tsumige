import {useEffect, useId, useMemo, useRef, useState} from 'react'
import {useQuery, useQueryClient} from '@tanstack/react-query'
import {useAuth} from '@/lib/auth'
import {getCatalog, type Catalog} from '@/lib/catalog'
import {homeSearchGames} from '@/lib/home-search'
import {platformName} from '@/lib/platform'
import {gameReviewTargets, type ReviewRow, type ReviewTarget} from '@/lib/data-review'
import {TargetChooser} from '@/components/data-review'
import {RecordEditor} from '@/components/record-editor'
import {RecordDetails} from '@/components/record-details'
import {Button} from '@/components/ui/button'

function GameOnlyDetail({row,catalog,onClose}: {row: ReviewRow; catalog: Catalog; onClose: () => void}) {
  const dialog=useRef<HTMLDialogElement>(null)
  useEffect(()=>{dialog.current?.showModal()},[])
  return <dialog ref={dialog} onCancel={event=>{event.preventDefault();onClose()}} aria-labelledby="search-game-title" className="m-auto max-h-[94dvh] w-[min(94vw,1160px)] max-w-none overflow-y-auto rounded-xl border bg-card p-6 text-foreground backdrop:bg-black/40">
    <header className="flex items-start justify-between gap-4"><div className="min-w-0"><h2 id="search-game-title" className="text-xl font-semibold [overflow-wrap:anywhere]">{row.game.nom}</h2><p className="mt-2 [overflow-wrap:anywhere]">{platformName(row.game.plataforma)}</p></div><Button variant="outline" onClick={onClose}>Tanca</Button></header>
    <RecordDetails kind="joc" record={null} game={row.game} catalog={catalog} onViewCollection={()=>{}}/>
  </dialog>
}
export function HomeGameSearch() {
  const {session}=useAuth()
  const client=useQueryClient()
  const {data,error,isPending,refetch}=useQuery({queryKey:['catalog',session?.user.id],queryFn:getCatalog,enabled:Boolean(session)})
  const [search,setSearch]=useState('')
  const [open,setOpen]=useState(false)
  const [active,setActive]=useState(0)
  const [selected,setSelected]=useState<ReviewRow | null>(null)
  const [target,setTarget]=useState<ReviewTarget | null>(null)
  const root=useRef<HTMLDivElement>(null)
  const input=useRef<HTMLInputElement>(null)
  const listId=useId()
  const results=useMemo(()=>data ? homeSearchGames(data,search) : [],[data,search])
  const visible=open && Boolean(search.trim())
  const index=Math.min(active,Math.max(0,results.length-1))
  useEffect(()=>{
    if(!visible)return
    function outside(event: PointerEvent) {if(!root.current?.contains(event.target as Node))setOpen(false)}
    document.addEventListener('pointerdown',outside)
    return ()=>document.removeEventListener('pointerdown',outside)
  },[visible])
  useEffect(()=>{if(visible)root.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({block:'nearest'})},[index,visible,search])
  function choose(id: string) {
    if(!data)return
    const game=data.jocs.find(item=>item.id===id)
    if(!game)return
    const row={id:game.id,game,targets:gameReviewTargets(data,id)}
    setSelected(row);setTarget(row.targets.length===1 ? row.targets[0] : null);setOpen(false)
  }
  function close() {setSelected(null);setTarget(null);input.current?.focus()}
  async function refresh(): Promise<Catalog> {
    await Promise.all([client.invalidateQueries({queryKey:['catalog']},{throwOnError:true}),client.invalidateQueries({queryKey:['jocs']})])
    return client.getQueryData<Catalog>(['catalog',session?.user.id]) ?? await getCatalog()
  }
  const currentGame=data?.jocs.find(game=>game.id===selected?.game.id)
  const currentRecord=target && (target.kind==='exemplar' ? data?.exemplars : data?.experiencies)?.find(record=>record.id===target.record.id)
  return <div ref={root} onBlur={event=>{if(event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node))setOpen(false)}} className="relative min-w-0 flex-1 basis-64 self-center">
    <input ref={input} type="search" role="combobox" aria-label="Cerca un joc" placeholder="Cerca un joc" autoComplete="off" aria-autocomplete="list" aria-expanded={visible} aria-controls={listId} aria-activedescendant={visible && !error && results.length ? `${listId}-${index}` : undefined} value={search} onFocus={()=>setOpen(true)} onChange={event=>{setSearch(event.target.value);setActive(0);setOpen(true)}} onKeyDown={event=>{
      if(event.key==='Escape'){event.preventDefault();event.stopPropagation();setOpen(false)}
      else if(event.key==='ArrowDown' || event.key==='ArrowUp') {event.preventDefault();setOpen(true);setActive(previous=>results.length ? (previous+(event.key==='ArrowDown'?1:-1)+results.length)%results.length : 0)}
      else if(event.key==='Enter' && visible && !error && results[index]){event.preventDefault();choose(results[index].id)}
    }} className="h-11 w-full rounded-lg border bg-card px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring"/>
    {visible && <div className="absolute top-full z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-lg border bg-card p-1 shadow-lg">
      {isPending ? <p role="status" className="p-3 text-sm">Carregant jocs…</p> : error ? <div role="alert" className="p-3 text-sm"><p>No s’han pogut carregar els jocs.</p><Button type="button" variant="outline" size="sm" className="mt-2" onClick={()=>void refetch()}>Torna-ho a provar</Button></div> : !results.length ? <p role="status" className="p-3 text-sm">Cap joc trobat.</p> : null}
      <ul id={listId} role="listbox" aria-label="Jocs trobats">{!error && results.map((game,i)=><li key={game.id} role="option" id={`${listId}-${i}`} aria-selected={i===index} onPointerMove={()=>setActive(i)} onClick={()=>choose(game.id)} className={`cursor-pointer rounded-md px-3 py-2 text-sm ${i===index ? 'bg-primary/10' : ''}`}><span className="block font-medium [overflow-wrap:anywhere]">{game.nom}</span><span className="text-xs text-muted-foreground [overflow-wrap:anywhere]">{platformName(game.plataforma)}</span></li>)}</ul>
    </div>}
    {selected && !target && selected.targets.length>1 && <TargetChooser row={selected} onChoose={setTarget} onClose={close}/>}
    {selected && currentGame && data && selected.targets.length===0 && <GameOnlyDetail row={{...selected,game:currentGame}} catalog={data} onClose={close}/>}
    {selected && target && currentGame && currentRecord && data && <RecordEditor key={`${target.kind}:${currentRecord.id}`} kind={target.kind} record={currentRecord} game={currentGame} catalog={data} onClose={close} onSaved={refresh}/>}
  </div>
}
