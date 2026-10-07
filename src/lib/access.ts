import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth'
import { getSupabase } from '@/lib/supabase'

export function useAccess() {
  const { session } = useAuth()
  const query = useQuery({
    queryKey: ['access', session?.user.id], enabled: Boolean(session), retry: false,
    queryFn: async () => {
      const { data, error } = await getSupabase().rpc('pot_editar')
      if (error) throw new Error('No s’han pogut comprovar els permisos. Torna a iniciar sessió.')
      return data
    },
  })
  return { canEdit: query.data === true, loading: query.isPending, error: query.error }
}
