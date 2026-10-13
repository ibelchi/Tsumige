export type CollectionView = 'list' | 'cards'
let visitView: CollectionView = 'cards'
export function initialCollectionView(explicit: string | null): CollectionView {
  if (explicit === 'list' || explicit === 'cards') return explicit
  try {
    const stored = window.sessionStorage.getItem('tsumige.collection.view')
    if (stored === 'list' || stored === 'cards') return stored
  } catch { /* En absència de Storage, la preferència dura fins a recarregar la pàgina. */ }
  return visitView
}
export function rememberCollectionView(view: CollectionView) {
  visitView = view
  try { window.sessionStorage.setItem('tsumige.collection.view', view) } catch { /* Preferència de la visita en memòria. */ }
}
