import { Package, Download, Gamepad2, Trophy, Meh } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCatalog } from '@/lib/catalog'
import { useAuth } from '@/lib/auth'
import { collectionSummaryCards, summaryCards, summaryCardLink } from '@/lib/collection-filters'

const icons = { physical: Package, digital: Download, wanted: Gamepad2, top: Trophy, meh: Meh }
export function HomeSummaryCards() {
  const { session } = useAuth()
  const { data, error, isPending } = useQuery({ queryKey: ['catalog', session?.user.id], queryFn: getCatalog, enabled: Boolean(session) })
  const cards = data ? collectionSummaryCards(data) : summaryCards.map(card => ({ ...card, href: summaryCardLink(card.key), count: undefined, percentage: undefined }))
  return <div>
    <div aria-label="Recomptes de la col·lecció" role="group" aria-busy={isPending} className="mx-auto grid w-full max-w-[22rem] grid-cols-2 gap-3 sm:max-w-[34rem] sm:grid-cols-3 lg:max-w-[56rem] lg:grid-cols-5 lg:gap-3.5">
      {cards.map(card => {
        const Icon = icons[card.key]
        return <Link key={card.key} to={card.href} data-summary-kind={card.key} className="home-summary-card flex min-w-0 flex-col items-center rounded-xl border px-2 py-3 text-center focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring xl:px-3">
          <div className="flex min-h-10 min-w-0 items-center justify-center gap-1.5 xl:gap-2">
            <span className="home-summary-icon flex size-10 shrink-0 items-center justify-center rounded-xl"><Icon aria-hidden="true" className="size-[26px]"/></span>
            <span data-summary-count className="text-[1.75rem] leading-10 font-semibold tabular-nums xl:text-[2rem]">{card.count ?? '—'}</span>
          </div>
          <span data-summary-percentage aria-hidden={card.percentage ? undefined : true} className="relative left-[23px] mt-1 min-h-6 text-base leading-6 font-medium tabular-nums text-muted-foreground xl:left-6">{card.percentage}</span>
          <span data-summary-label className="mt-1 text-sm leading-5 font-medium">{card.label}</span>
        </Link>
      })}
    </div>
    {error && <p role="alert" className="mt-2 text-sm text-muted-foreground">No s’han pogut carregar els recomptes de la col·lecció.</p>}
  </div>
}
