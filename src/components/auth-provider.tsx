import { useEffect, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { AuthContext, type AuthState } from '@/lib/auth'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [state, setState] = useState<AuthState>({ session: null, loading: isSupabaseConfigured, error: null })

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let active = true
    let authEventReceived = false
    let userId: string | undefined
    try {
      const supabase = getSupabase()
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!active) return
        authEventReceived = true
        if (userId !== session?.user.id) queryClient.clear()
        userId = session?.user.id
        setState({ session, loading: false, error: null })
      })
      void supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (!active || authEventReceived) return
        userId = session?.user.id
        setState({ session: error ? null : session, loading: false, error: error ? 'No s’ha pogut recuperar la sessió. Torna a iniciar sessió.' : null })
      }).catch(() => {
        if (active && !authEventReceived) setState({ session: null, loading: false, error: 'No s’ha pogut recuperar la sessió. Comprova la connexió.' })
      })
      return () => { active = false; subscription.unsubscribe() }
    } catch (error) {
      setState({ session: null, loading: false, error: error instanceof Error ? error.message : 'No s’ha pogut configurar Supabase.' })
    }
    return () => { active = false }
  }, [queryClient])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}
