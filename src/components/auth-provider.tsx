import { useEffect, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { AuthContext, type AuthState } from '@/lib/auth'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { getInitialRecovery, clearInitialRecovery } from '@/lib/recovery'

// One promise prevents StrictMode from consuming a one-use recovery code twice.
let recoveryAttempt: Promise<boolean> | undefined

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
      const recovery = getInitialRecovery()
      if (recovery) {
        recoveryAttempt ??= (async () => {
          if (recovery.error) return false
          const result = recovery.accessToken && recovery.refreshToken
            ? await supabase.auth.setSession({ access_token: recovery.accessToken, refresh_token: recovery.refreshToken })
            : recovery.code ? await supabase.auth.exchangeCodeForSession(recovery.code)
            : recovery.tokenHash ? await supabase.auth.verifyOtp({ token_hash: recovery.tokenHash, type: 'recovery' }) : null
          return Boolean(result?.data.session && !result.error)
        })().catch(() => false)
      }
      let checkingRecovery = Boolean(recoveryAttempt)
      let failedRecovery = false
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!active) return
        if (checkingRecovery || failedRecovery && _event === 'INITIAL_SESSION') return
        authEventReceived = true
        if (userId !== session?.user.id) queryClient.clear()
        userId = session?.user.id
        setState({ session, loading: false, error: null })
      })
      void (async () => {
        if (recoveryAttempt) {
          const attempt = recoveryAttempt
          const valid = await attempt
          if (!active) return
          if (recoveryAttempt === attempt) recoveryAttempt = undefined
          clearInitialRecovery()
          checkingRecovery = false
          failedRecovery = !valid
          if (!valid) {
            setState({ session: null, loading: false, error: 'L’enllaç ha caducat o no és vàlid. Demana’n un de nou.' })
            return
          }
        }
        const { data: { session }, error } = await supabase.auth.getSession()
        if (!active || authEventReceived) return
        userId = session?.user.id
        setState({ session: error ? null : session, loading: false, error: error ? 'No s’ha pogut recuperar la sessió. Torna a iniciar sessió.' : null })
      })().catch(() => {
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
