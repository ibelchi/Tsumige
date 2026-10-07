import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { BrandLogo } from '@/components/brand-logo'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'

export function AuthPage() {
  const { session, error: sessionError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (session) return <Navigate to="/" replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting || !isSupabaseConfigured) return
    setError(null)
    setSubmitting(true)
    try {
      const { error: loginError } = await getSupabase().auth.signInWithPassword({ email: email.trim(), password })
      if (loginError) {
        setError(loginError.code === 'invalid_credentials'
          ? 'El correu o la contrasenya no són correctes.'
          : loginError.code === 'email_not_confirmed'
            ? 'Cal confirmar el correu del compte a Supabase.'
            : 'No s’ha pogut iniciar sessió. Comprova la connexió i torna-ho a provar.')
      } else {
        setPassword('')
      }
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'No s’ha pogut iniciar sessió.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-10">
      <section aria-labelledby="login-title" className="w-full max-w-sm rounded-2xl border bg-card p-7 sm:p-8">
        <BrandLogo className="mx-auto mb-8 w-20" />
        <h1 id="login-title" className="text-xl font-semibold tracking-tight">Inicia sessió</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-5" aria-busy={submitting}>
          <div className="space-y-2"><label htmlFor="email" className="text-sm font-medium">Correu electrònic</label><input id="email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} disabled={submitting || !isSupabaseConfigured} className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50" /></div>
          <div className="space-y-2"><label htmlFor="password" className="text-sm font-medium">Contrasenya</label><input id="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} disabled={submitting || !isSupabaseConfigured} className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50" /></div>
          {!isSupabaseConfigured && <p role="status" className="text-sm leading-6 text-muted-foreground">La connexió a Supabase està pendent de configurar.</p>}
          {(error || sessionError) && <p role="alert" className="text-sm leading-6 text-muted-foreground">{error || sessionError}</p>}
          <Button type="submit" disabled={submitting || !isSupabaseConfigured} className="w-full">{submitting ? 'Entrant…' : 'Entra'}</Button>
        </form>
      </section>
    </main>
  )
}
