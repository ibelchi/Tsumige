import { DeletionConfirmation } from '@/components/deletion-confirmation'
import {deletionIO} from '@/lib/record-deletion-api'
import {useEffect,useId,useRef,useState,type Ref} from 'react'
import {Button} from '@/components/ui/button'
import {useAccess} from '@/lib/access'
import {useAuth} from '@/lib/auth'
import {DeletionUncertain,runDeletion,type DeleteTarget} from '@/lib/record-deletion'
export function DeleteRecord({target,title,platform,beforeOpen,onDeleted,onBusy,buttonRef,disabled=false}: {
 target: DeleteTarget; title: string; platform: string; beforeOpen?:(action:()=>void)=>void; onDeleted:()=>Promise<void>; onBusy?:(busy:boolean)=>void; buttonRef?:Ref<HTMLButtonElement>; disabled?:boolean
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
  if(!open || running.current || !canEdit || session?.user.id!==snapshot.current.ownerId)return
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
 return <><Button ref={buttonRef} type="button" variant="outline" disabled={disabled || busy} className="max-w-full whitespace-normal text-red-700" onClick={()=>{
  const action=()=>{snapshot.current=target;setOpen(true)}
  if(beforeOpen)beforeOpen(action);else action()
 }}>{label}</Button>
 {open && <DeletionConfirmation kind={snapshot.current.kind} title={title} platform={platform} recordId={snapshot.current.id} id={id} busy={busy} error={error}
  dialogRef={dialog} cancelRef={cancel} onCancel={()=>{if(!running.current)setOpen(false)}} onConfirm={()=>void execute()}
  actionLabel={busy ? 'Comprovant…' : deleted ? 'Actualitza la llista' : uncertain ? 'Comprova l’estat' : label} />}
 </>
}
