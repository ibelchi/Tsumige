import { CollectionSummary } from '@/components/collection-summary'
import { PropositsSummary } from '@/components/proposits-summary'

export function DashboardPage() {
  return <div className="page-container"><h1 className="sr-only">Inici</h1><CollectionSummary /><PropositsSummary /></div>
}
