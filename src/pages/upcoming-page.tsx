import { BarChart3, Settings2 } from 'lucide-react'

export function UpcomingPage({ section }: { section: 'estadistiques' | 'configuracio' }) {
  const stats = section === 'estadistiques'
  const Icon = stats ? BarChart3 : Settings2
  return (
    <div className="page-container">
      <header><p className="eyebrow">EL TEU ESPAI</p><h1 className="page-title">{stats ? 'Estadístiques' : 'Configuració'}</h1></header>
      <section className="mt-8 rounded-xl border bg-card p-6 sm:p-8">
        <Icon aria-hidden="true" className="mb-5 size-7 text-primary" strokeWidth={1.5} />
        <h2 className="text-lg font-semibold">{stats ? 'Una altra mirada a la teva col·lecció' : '積みゲー, al teu gust'}</h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{stats ? 'Aquí podràs consultar el teu historial de joc, les valoracions, el backlog i la despesa de la col·lecció.' : 'Aquí podràs canviar el tema i gestionar les còpies de seguretat de 積みゲー.'}</p>
        <p className="mt-5 text-sm text-muted-foreground">Aquesta secció s’activarà en la seva fase de construcció.</p>
      </section>
    </div>
  )
}
