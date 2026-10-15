import type { RefObject } from 'react'
import { Button } from '@/components/ui/button'
import { deletionDescription, type DeleteKind } from '@/lib/record-deletion'

export function DeletionConfirmation({kind,title,platform,recordId,id,busy,error,actionLabel,dialogRef,cancelRef,onCancel,onConfirm}: {
 kind: DeleteKind; title: string; platform: string; recordId: string; id: string; busy: boolean; error: string; actionLabel: string
 dialogRef: RefObject<HTMLDialogElement | null>; cancelRef: RefObject<HTMLButtonElement | null>; onCancel:()=>void; onConfirm:()=>void
}) {
 return <dialog ref={dialogRef} onCancel={event=>{event.preventDefault();onCancel()}} onClose={onCancel}
  onKeyDown={event=>{if(event.key==='Enter' && (event.repeat || event.target===event.currentTarget))event.preventDefault()}}
  aria-labelledby={id} aria-describedby={`${id}-warning`} className="m-auto max-h-[90dvh] w-[min(94vw,560px)] overflow-y-auto rounded-xl border bg-card p-6 text-foreground backdrop:bg-black/40">
  <h2 id={id} className="text-lg font-semibold">{kind==='joc' ? 'Elimina el joc definitivament' : kind==='exemplar' ? 'Elimina aquest exemplar' : 'Elimina aquesta entrada de log'}</h2>
  <p id={`${id}-warning`} className="mt-3 text-sm">Segur que vols eliminar aquest registre? Aquesta acció no es pot desfer.</p>
  <p className="mt-3 font-medium [overflow-wrap:anywhere]">{title} · {platform}</p>
  <p className="mt-3 text-sm">{deletionDescription(kind)}</p>
  <p className="mt-2 text-xs text-muted-foreground">ID: {recordId}</p>
  {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
  <div className="mt-5 flex flex-wrap justify-end gap-2">
   <Button ref={cancelRef} autoFocus type="button" variant="outline" disabled={busy} onClick={onCancel}>Cancel·la</Button>
   <Button type="button" disabled={busy} className="bg-red-700 text-white hover:bg-red-800" onClick={onConfirm}>{actionLabel}</Button>
  </div>
 </dialog>
}
