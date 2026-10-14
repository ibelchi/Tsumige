export type DeleteKind = 'exemplar' | 'experiencia' | 'joc'
export type DeleteTarget = {kind: DeleteKind; id: string; gameId: string; ownerId: string; updatedAt: string}
export const deletionTable = {exemplar:'exemplars',experiencia:'experiencies',joc:'fitxes_joc'} as const
export class DeletionUncertain extends Error {}
export function deletionDescription(kind: DeleteKind) {
 return kind==='exemplar' ? 'S’eliminarà definitivament només aquest exemplar, incloses les seves dades de compra. Es conserven el joc amb la portada, la valoració i els comentaris, els altres exemplars i totes les entrades de log.'
  : kind==='experiencia' ? 'S’eliminarà definitivament només aquesta entrada de log. Es conserven el joc amb la portada, la valoració i els comentaris, les altres entrades de log i tots els exemplars.'
  : 'S’eliminarà definitivament la fitxa del joc, amb la seva valoració i comentaris. Només es permet si no té cap exemplar, tampoc històric, ni cap entrada de log. No s’eliminaran fitxers de portada.'
}
export type DeletionIO = {authorize:()=>Promise<void>; remove:(target:DeleteTarget)=>Promise<void>; exists:(target:DeleteTarget)=>Promise<boolean>}
// A failed/lost response is reconciled by reading; never send another DELETE automatically.
export async function runDeletion(io: DeletionIO,target: DeleteTarget,checkOnly=false): Promise<'deleted' | 'present'> {
 await io.authorize()
 let failure: unknown
 if(!checkOnly) {try {await io.remove(target)} catch(error) {failure=error}}
 let present: boolean
 try {present=await io.exists(target)} catch {throw new DeletionUncertain('No s’ha pogut confirmar el resultat. Comprova l’estat abans de tornar a eliminar; no es repetirà automàticament.')}
 if(!present)return 'deleted'
 if(checkOnly)return 'present'
 if(failure && typeof failure==='object' && 'code' in failure && failure.code==='23503')throw new Error('El joc encara té registres relacionats, inclosos possibles exemplars històrics. No s’ha eliminat.')
 throw new Error('El registre continua existint: pot haver canviat o faltar permisos. No s’ha eliminat; revisa les dades abans de confirmar de nou.')
}
