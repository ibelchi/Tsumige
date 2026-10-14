import {getSupabase} from '@/lib/supabase'
import {deletionTable,type DeletionIO} from './record-deletion'
export function deletionIO(ownerId: string): DeletionIO {
 const db=getSupabase()
 return {
  async authorize() {
   const {data,error}=await db.auth.getUser()
   if(error || data.user?.id!==ownerId)throw new Error('No s’ha pogut confirmar la sessió del propietari. No continuïs fins a recuperar-la.')
   const permission=await db.rpc('pot_editar')
   if(permission.error || permission.data!==true)throw new Error('No tens permís per eliminar registres.')
  },
  async remove(target) {
   const query=target.kind==='joc' ? db.from('fitxes_joc').delete() : target.kind==='exemplar' ? db.from('exemplars').delete().eq('joc_id',target.gameId) : db.from('experiencies').delete().eq('joc_id',target.gameId)
   const {error}=await query.eq('id',target.id).eq('user_id',ownerId).eq('updated_at',target.updatedAt)
   if(error)throw error
  },
  async exists(target) {
   // Revalidate identity before interpreting absence under RLS as a completed deletion.
   await this.authorize()
   const {data,error}=await db.from(deletionTable[target.kind]).select('id').eq('id',target.id).eq('user_id',ownerId).maybeSingle()
   if(error)throw error
   return data!==null
  },
 }
}
