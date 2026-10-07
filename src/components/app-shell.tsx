import { useState, type ReactNode } from 'react'
import { BarChart3, House, History, Library, Menu, Settings2, Target, X } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { BrandLogo } from '@/components/brand-logo'
import { LogoutButton } from '@/components/logout-button'
import { SiteFooter } from '@/components/site-footer'
import { useAccess } from '@/lib/access'

const navigation = [
  { view: 'inici', label: 'Inici', icon: House, to: '/' },
  { view: 'colleccio', label: 'Col·lecció', icon: Library, to: '/?vista=colleccio' },
  { view: 'jugats', label: 'Bitàcora', icon: History, to: '/?vista=jugats' },
  { view: 'proposits', label: 'Propòsits', icon: Target, to: '/?vista=proposits' },
  { view: 'estadistiques', label: 'Estadístiques', icon: BarChart3, to: '/?vista=estadistiques' },
  { view: 'configuracio', label: 'Configuració', icon: Settings2, to: '/?vista=configuracio' },
] as const

export function AppShell({ children }: { children: ReactNode }) {
  const { canEdit } = useAccess()
  const [menuOpen, setMenuOpen] = useState(false)
  const [params] = useSearchParams()
  const section = params.get('vista') ?? (params.has('joc') ? 'colleccio' : 'inici')
  const view = section === 'retirats' ? 'colleccio' : section === 'valoracions' ? 'estadistiques' : section

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[248px_1fr]">
      <a href="#contingut" className="skip-link" onClick={event => { event.preventDefault(); document.getElementById('contingut')?.focus() }}>Salta al contingut</a>
      <header className="flex h-22 items-center justify-between border-b bg-sidebar px-5 lg:hidden">
        <Link to="/" aria-label="積みゲー — Inici"><BrandLogo className="w-14" /></Link>
        <Button variant="ghost" size="icon" aria-label={menuOpen ? 'Tanca el menú' : 'Obre el menú'} aria-expanded={menuOpen} aria-controls="navegacio" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X /> : <Menu />}
        </Button>
      </header>
      <aside id="navegacio" className={cn('border-b border-border bg-sidebar lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:border-r lg:border-b-0', menuOpen ? 'block' : 'hidden lg:flex')}>
        <Link to="/" aria-label="積みゲー — Inici" className="hidden justify-center px-6 py-6 lg:flex">
          <BrandLogo className="w-24" />
        </Link>
        <nav aria-label="Navegació principal" className="space-y-1 px-3 pt-4 pb-5 lg:pt-0">
          {navigation.filter(item => canEdit || item.view !== 'configuracio').map(({ view: itemView, label, icon: Icon, to }) => (
            <Link key={itemView} to={to} onClick={() => setMenuOpen(false)} aria-current={view === itemView ? 'page' : undefined} className={cn('flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring', view === itemView ? 'bg-primary/8 font-medium text-primary' : 'text-muted-foreground')}>
              <Icon aria-hidden="true" className="size-4" />{label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-col">
        <div className="flex items-center justify-end gap-4 border-b px-5 py-3 sm:px-8 lg:px-10">{!canEdit && <span className="text-sm text-muted-foreground">Convidat · Només consulta</span>}<LogoutButton /></div>
        <main id="contingut" tabIndex={-1} className="flex-1 outline-none">{children}</main>
        <SiteFooter />
      </div>
    </div>
  )
}
