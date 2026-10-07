import { createContext, useContext } from 'react'
import type { Session } from '@supabase/supabase-js'

export type AuthState = {
  session: Session | null
  loading: boolean
  error: string | null
}

export const AuthContext = createContext<AuthState | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('L’autenticació requereix AuthProvider.')
  return context
}
