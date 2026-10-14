import {deletionIO} from '@/lib/record-deletion-api'
import {useEffect,useId,useRef,useState} from 'react'
import {Button} from '@/components/ui/button'
import {useAccess} from '@/lib/access'
import {useAuth} from '@/lib/auth'
import {deletionDescription,DeletionUncertain,runDeletion,type DeleteTarget} from '@/lib/record-deletion'
export function DeleteRecord({target,title,platform,beforeOpen,onDeleted,onBusy}: {
 target: DeleteTarget; title: string; platform: string; beforeOpen?:(action:()=>void)=>void; onDeleted:()=>Promise<void>; onBusy?:(busy:boolean)=>void
}) {
 const {canEdit}=useAccess()
 const {session}=useAuth()
 const [open,setOpen]=useState(false)
 const [busy,setBusy]=useState(false)
 const [uncertain,setUncertain]=useState(false)
 const [deleted,setDeleted]=useState(false)
 const [error,setError]=useState('')
 const running=useRef(false)
 const dialog=useRef<HTMLDialogElement>(null)
 const cancel=useRef<HTMLButtonElement>(null)
 const snapshot=useRef(target)
 const id=useId()
 useEffect(()=>{if(open){dialog.current?.showModal();cancel.current?.focus()}},[open])
 async function finish() {
  try {await onDeleted()} catch {setError('L’eliminació està confirmada, però no s’ha pogut actualitzar la llista. Torna a actualitzar-la; no s’enviarà cap altra eliminació.')}
 }
 async function execute() {
  if(running.current || !canEdit || session?.user.id!==snapshot.current.ownerId)return
  running.current=true;setBusy(true);onBusy?.(true);setError('')
  try {
   if(deleted){await finish();return}
   const result=await runDeletion(deletionIO(snapshot.current.ownerId),snapshot.current,uncertain)
   if(result==='present'){setUncertain(false);setError('El registre encara existeix. No s’ha repetit l’eliminació. Pots cancel·lar i revisar-lo abans de tornar a confirmar.');return}
   setDeleted(true);setUncertain(false);await finish()
  } catch(caught) {
   if(caught instanceof DeletionUncertain)setUncertain(true)
   setError(caught instanceof Error ? caught.message : 'No s’ha pogut eliminar el registre.')
  } finally {running.current=false;setBusy(false);onBusy?.(false)}
 }
 if(!canEdit || session?.user.id!==target.ownerId)return null
 const label=target.kind==='joc' ? 'Elimina el joc definitivament' : 'Elimina el registre'
 return <><Button type="button" variant="outline" className="mr-auto text-red-700" onClick={()=>{
  const action=()=>{snapshot.current=target;setOpen(true)}
  if(beforeOpen)beforeOpen(action);else action()
 }}>{label}</Button>
 {open && <dialog ref={dialog} onCancel={event=>{event.preventDefault();if(!running.current)setOpen(false)}} aria-labelledby={id} className="m-auto max-h-[90dvh] w-[min(94vw,560px)] overflow-y-auto rounded-xl border bg-card p-6 text-foreground backdrop:bg-black/40">
  <h2 id={id} className="text-lg font-semibold">{target.kind==='joc' ? 'Elimina el joc definitivament' : target.kind==='exemplar' ? 'Elimina aquest exemplar' : 'Elimina aquesta entrada de log'}</h2>
  <p className="mt-3 font-medium [overflow-wrap:anywhere]">{title} · {platform}</p>
  <p className="mt-3 text-sm">{deletionDescription(target.kind)}</p>
  <p className="mt-2 text-xs text-muted-foreground">ID: {snapshot.current.id}</p>
  {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
  <div className="mt-5 flex flex-wrap justify-end gap-2"><Button ref={cancel} type="button" variant="outline" disabled={busy} onClick={()=>setOpen(false)}>Cancel·la</Button><Button type="button" disabled={busy} className="bg-red-700 text-white hover:bg-red-800" onClick={()=>void execute()}>{busy ? 'Comprovant…' : deleted ? 'Actualitza la llista' : uncertain ? 'Comprova l’estat' : 'Confirma l’eliminació'}</Button></div>
 </dialog>}
 </>
}
