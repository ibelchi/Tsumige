import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { getSupabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

export function PasswordPage() {
  const { session } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    const form = event.currentTarget
    const values = new FormData(form)
    const password = String(values.get('password') ?? '')
    if (password !== values.get('confirm')) { setError('Les dues contrasenyes han de coincidir.'); return }
    setBusy(true); setError(null); setSaved(false)
    try {
      const { error: updateError } = await getSupabase().auth.updateUser({ password })
      if (updateError) {
        setError(updateError.code === 'same_password' ? 'Tria una contrasenya diferent de l’actual.' : updateError.code === 'weak_password' ? 'Tria una contrasenya més llarga i difícil d’endevinar.' : 'No s’ha pogut canviar la contrasenya. Pot caldre tornar a acreditar-te; conserva aquesta sessió oberta i indica’m el problema.')
      } else { form.reset(); setSaved(true) }
    } catch { setError('No s’ha pogut contactar amb el servei. Comprova la connexió i torna-ho a provar.') }
    finally { setBusy(false) }
  }
  const field = 'mt-2 w-full rounded-lg border bg-background px-3 py-2.5 text-base'
  return <div className="page-container">
    <h1 className="page-title">Canvia la contrasenya</h1>
    <p className="mt-4 text-sm text-muted-foreground">Compte: {session?.user.email}. Es conservaran les dades i els permisos.</p>
    <form onSubmit={submit} className="mt-6 max-w-md space-y-5" aria-busy={busy}>
      <fieldset disabled={busy} className="space-y-5">
        <label className="block text-sm">Contrasenya nova<input className={field} type="password" name="password" autoComplete="new-password" minLength={8} required /></label>
        <label className="block text-sm">Repeteix la contrasenya nova<input className={field} type="password" name="confirm" autoComplete="new-password" minLength={8} required /></label>
        <Button type="submit">{busy ? 'Desant…' : 'Desa la contrasenya'}</Button>
      </fieldset>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {saved && <p role="status" className="text-sm">Contrasenya actualitzada. Ja pots utilitzar-la per entrar a l’aplicació.</p>}
    </form>
    <Link className="mt-6 inline-block text-sm underline" to="/">Torna a Inici</Link>
  </div>
}
