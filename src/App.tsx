import { Link, Navigate, Route, Routes, useSearchParams } from 'react-router-dom'
import { ProtectedLayout } from '@/components/protected-layout'
import { Button } from '@/components/ui/button'
import { LibraryPage } from '@/pages/library-page'
import { StatisticsPage } from '@/pages/statistics-page'
import { AuthPage } from '@/pages/auth-page'
import { useAuth } from '@/lib/auth'
import { PropositsPage } from '@/pages/proposits-page'
import { CatalogPage } from '@/pages/catalog-page'
import { DashboardPage } from '@/pages/dashboard-page'
import { SettingsPage } from '@/pages/settings-page'
import { RatingsPage } from '@/pages/ratings-page'
import { useAccess } from '@/lib/access'
import { PasswordPage } from '@/pages/password-page'

function HomePage() {
  const { canEdit } = useAccess()
  const [params] = useSearchParams()
  const section = params.get('vista')
  if (section === 'contrasenya') return <PasswordPage />
  if (section === 'proposits') return <PropositsPage />
  if (section === 'jugats') return <CatalogPage key={`historial-${params.get('any') ?? 'all'}`} history />
  if (section === 'valoracions') return <RatingsPage />
  if (section === 'retirats') return <CatalogPage key="retirats" retired />
  if (section === 'colleccio' || params.has('joc')) return <LibraryPage />
  if (section === 'seguiment') return <Navigate to="/?vista=colleccio" replace />
  if (section === 'configuracio') return canEdit ? <SettingsPage /> : <Navigate to="/" replace />
  return section === 'estadistiques'
    ? <StatisticsPage />
    : <DashboardPage />
}

export function App() {
  const { loading } = useAuth()
  if (loading) return <main className="flex min-h-dvh items-center justify-center p-5"><p role="status" className="text-sm text-muted-foreground">Comprovant sessió…</p></main>
  return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<div className="page-container"><h1 className="page-title">Pàgina no trobada</h1><p className="my-5 text-muted-foreground">Aquest enllaç no correspon a cap pàgina de 積みゲー.</p><Button asChild><Link to="/">Torna a la col·lecció</Link></Button></div>} />
        </Route>
      </Routes>
  )
}
