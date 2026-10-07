import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getSupabase } from '@/lib/supabase'

export function LogoutButton() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function logout() {
    if (pending) return
    setPending(true)
    setError(null)
    try {
      const { error: logoutError } = await getSupabase().auth.signOut({ scope: 'local' })
      if (logoutError) throw logoutError
    } catch {
      setError('No s’ha pogut tancar la sessió. Torna-ho a provar.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button variant="ghost" onClick={() => { void logout() }} disabled={pending}><LogOut />{pending ? 'Sortint…' : 'Tanca sessió'}</Button>
      {error && <p role="alert" className="max-w-xs text-right text-xs text-muted-foreground">{error}</p>}
    </div>
  )
}
