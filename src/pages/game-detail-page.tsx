import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { RecordEditor } from '@/components/record-editor'
import { getCatalog, type Catalog } from '@/lib/catalog'
import { useAuth } from '@/lib/auth'

export function GameDetailPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { session } = useAuth()
  const client = useQueryClient()
  const { data, error, isPending } = useQuery({ queryKey: ['catalog', session?.user.id], queryFn: getCatalog, enabled: Boolean(session) })
  const game = data?.jocs.find(item => item.id === params.get('joc'))
  const copy = data?.exemplars.find(item => item.joc_id === game?.id && item.a_la_colleccio)
  const experience = data?.experiencies.find(item => item.joc_id === game?.id)
  const retired = data?.exemplars.find(item => item.joc_id === game?.id)
  const record = copy ?? experience ?? retired
  async function refresh() {
    await Promise.all([client.invalidateQueries({ queryKey: ['catalog'] }, { throwOnError: true }), client.invalidateQueries({ queryKey: ['jocs'] })])
    return client.getQueryData<Catalog>(['catalog', session?.user.id])
  }
  return <div className="page-container">
    <h1 className="page-title">{game?.nom ?? 'Detall del joc'}</h1>
    <Link to="/" className="mt-4 inline-block text-sm underline">Torna a l’inici</Link>
    {isPending && <p role="status" className="mt-4 text-sm">Carregant…</p>}
    {error && <p role="alert" className="mt-4 text-sm text-red-700">{error.message}</p>}
    {!isPending && !error && !record && <p className="mt-4 text-sm">Aquest joc no té cap exemplar ni registre de joc per obrir.</p>}
    {game && record && data && <RecordEditor key={record.id} kind={copy || !experience ? 'exemplar' : 'experiencia'} record={record} game={game} catalog={data} onClose={() => navigate('/')} onSaved={refresh} />}
  </div>
}
