import { Navigate, Outlet } from 'react-router-dom'
import { AppShell } from '@/components/app-shell'
import { useAuth } from '@/lib/auth'
import { useAccess } from '@/lib/access'

export function ProtectedLayout() {
  const { session } = useAuth()
  const { loading, error } = useAccess()
  if (session && loading) return <p role="status" className="p-6">Comprovant permisos…</p>
  if (session && error) return <p role="alert" className="p-6">{error.message}</p>
  return session ? <AppShell><Outlet /></AppShell> : <Navigate to="/auth" replace />
}
