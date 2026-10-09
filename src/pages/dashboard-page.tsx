import { RandomCollectionCovers } from '@/components/random-collection-covers'
import { CollectionSummary } from '@/components/collection-summary'
import { PropositsSummary } from '@/components/proposits-summary'

export function DashboardPage() {
  return <div className="page-container"><h1 className="sr-only">Inici</h1><CollectionSummary /><div className="grid items-start gap-3 md:grid-cols-2"><PropositsSummary currentOnly /><RandomCollectionCovers /></div></div>
}
