import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { BrandLogo } from '@/components/brand-logo'
import { Button } from '@/components/ui/button'
import { PasswordPage } from '@/pages/password-page'
import { useAuth } from '@/lib/auth'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { recoveryRedirect } from '@/lib/recovery'

export function RecoveryPage() {
  const { session, error: sessionError } = useAuth()
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    const email = String(new FormData(event.currentTarget).get('email') ?? '').trim()
    setBusy(true); setError(null)
    try {
      const { error: sendError } = await getSupabase().auth.resetPasswordForEmail(email, { redirectTo: recoveryRedirect(window.location.origin, import.meta.env.BASE_URL) })
      if (sendError) setError(sendError.status === 429 ? 'Espera uns minuts abans de demanar un altre enllaç.' : 'No s’ha pogut enviar l’enllaç. Comprova la connexió i torna-ho a provar.')
      else setSent(true)
    } catch { setError('No s’ha pogut contactar amb el servei. Torna-ho a provar.') }
    finally { setBusy(false) }
  }
  return <main className="flex min-h-dvh items-center justify-center px-5 py-10"><section className="w-full max-w-lg rounded-2xl border bg-card p-7">
    {session && !sessionError ? <PasswordPage /> : <>
      <BrandLogo className="mx-auto mb-6 w-16" />
      <h1 className="text-xl font-semibold">Recupera la contrasenya</h1>
      {sessionError && <p role="alert" className="mt-4 text-sm text-red-700">{sessionError}</p>}
      <form onSubmit={submit} className="mt-5 space-y-4" aria-busy={busy}>
        <label className="block text-sm">Correu del compte<input name="email" type="email" autoComplete="username" required disabled={busy || !isSupabaseConfigured} className="mt-2 w-full rounded-lg border bg-background px-3 py-2.5" /></label>
        <Button disabled={busy || !isSupabaseConfigured}>{busy ? 'Enviant…' : 'Envia l’enllaç'}</Button>
      </form>
      {sent && <p role="status" className="mt-4 text-sm">Si el correu correspon a un compte, rebràs un enllaç per canviar la contrasenya. Revisa també el correu brossa.</p>}
      {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
      <Link to="/auth" className="mt-5 inline-block text-sm underline">Torna a l’accés</Link>
    </>}
  </section></main>
}
