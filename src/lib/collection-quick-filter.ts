export type CollectionQuickFilter = 'favorits' | 'infants' | null
export function collectionQuickFilter(params: URLSearchParams): CollectionQuickFilter {
  return params.get('favorits') === '1' ? 'favorits' : params.get('infants') === '1' ? 'infants' : null
}
export function toggleCollectionQuickFilter(params: URLSearchParams, clicked: Exclude<CollectionQuickFilter, null>) {
  const active = collectionQuickFilter(params)
  const next = new URLSearchParams(params)
  next.delete('favorits'); next.delete('infants')
  if (active !== clicked) next.set(clicked, '1')
  return next
}
