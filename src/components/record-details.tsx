import { collectionCopy } from '@/lib/platform'
import type { ReactNode } from 'react'
import type { Catalog } from '@/lib/catalog'
import type { Exemplar, Experiencia, FitxaJoc } from '@/lib/database.types'
import { gameComments } from '@/lib/game-comments'
import { gameRating } from '@/lib/game-rating'
import { storeName } from '@/lib/store-name'
import { BrandLogo } from '@/components/brand-logo'
import { GameRating } from '@/components/game-rating'
import { useState } from 'react'

function Detail({ label, value }: { label: string; value: ReactNode }) {
  return <div className="min-w-0"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm">{value === null || value === undefined || value === '' ? '—' : value}</dd></div>
}

function imageProvider(source: string | null | undefined) {
  if (!source) return null
  try {
    const host = new URL(source).hostname
    if (host === 'igdb.com' || host.endsWith('.igdb.com')) return 'IGDB'
    if (host === 'rawg.io' || host.endsWith('.rawg.io')) return 'RAWG'
  } catch { /* Keep unknown or invalid URLs from being labelled as a provider. */ }
  return null
}

export function RecordDetails({ kind, record, game, catalog, onViewCollection }: {
  kind: 'exemplar' | 'experiencia'; record: Exemplar | Experiencia; game: FitxaJoc; catalog: Catalog; onViewCollection: () => void
}) {
  const [failedImage, setFailedImage] = useState<string | null>(null)
  const image = game.portada_visual_url ?? game.portada_url
  const copy = kind === 'exemplar' ? record as Exemplar : null
  const experience = kind === 'experiencia' ? record as Experiencia : null
  const comments = gameComments(game, catalog)
  const history = catalog.experiencies.filter(item => item.joc_id === game.id)
  const owned = catalog.exemplars.filter(item => item.joc_id === game.id && collectionCopy(item, game))
  const legacyComments = comments.conflict ? [...new Set([...catalog.exemplars, ...history].filter(item => item.joc_id === game.id).map(item => item.notes).filter((value): value is string => Boolean(value?.trim())))] : []
  const rating = gameRating(game, catalog.experiencies)
  const provider = imageProvider(game.portada_font_url)
  const tags = [
    { label: 'Jugant', active: Boolean(experience?.jugant || history.some(item => item.jugant)) },
    { label: 'Per jugar aviat', active: game.per_jugar_aviat },
    { label: 'Per jugar amb infants', active: game.per_infants },
    { label: 'Possiblement d’intercanvi', active: copy?.canvi },
    { label: 'Reproducció', active: copy?.reproduccio },
    { label: 'No localitzat', active: copy?.no_localitzat },
  ].filter(tag => tag.active === true)
  return <div className="mt-6 space-y-6">
    <div className="grid items-start gap-5 sm:grid-cols-[190px_minmax(0,1fr)] sm:gap-6">
      <div className="flex min-w-0 flex-col items-center gap-3">
        {image && failedImage !== image ? <img src={image} alt={`Portada de ${game.nom}`} onError={() => setFailedImage(image)} className="max-h-72 w-full rounded-lg object-contain" /> : <div className="flex min-h-40 w-full items-center justify-center rounded-lg bg-muted"><BrandLogo className="w-12" /></div>}
        {rating && <GameRating rating={rating} className="text-center text-5xl leading-none" />}
        {provider && game.portada_font_url && <a href={game.portada_font_url} target="_blank" rel="noreferrer" className="text-xs underline">{provider}</a>}
      </div>
      <div className="min-w-0 space-y-5">
        <dl className="grid grid-cols-1 gap-4 min-[380px]:grid-cols-2">
          <Detail label="Desenvolupadora" value={game.desenvolupadora} />
          <Detail label="Gènere" value={game.genere_principal} />
          <Detail label="Any de llançament" value={game.any_llancament} />
          {copy && <>
            <Detail label="Format" value={copy.format === 'fisic' ? 'Físic' : 'Digital'} />
            <Detail label="Regió" value={copy.regio} />
            <Detail label="Conservació" value={copy.estat_conservacio} />
            <Detail label="Any de compra" value={copy.any_compra} />
            <Detail label="Preu" value={copy.preu === null || copy.preu === undefined ? null : new Intl.NumberFormat('ca-ES', { style: 'currency', currency: 'EUR' }).format(copy.preu)} />
            {game.plataforma_resolta !== true && <Detail label="Botiga o servei" value={storeName(copy.botiga_servei ?? '')} />}
          </>}
          {experience && <>
            <Detail label="Any de joc" value={experience.any_jugat} />
            <Detail label="Completat" value={experience.completat === 'si' ? 'Sí' : experience.completat === 'no' ? 'No' : experience.completat === 'no_aplicable' ? 'No aplicable' : null} />
          </>}
        </dl>
      </div>
    </div>
    {tags.length > 0 && <div aria-label="Etiquetes del joc" className="flex flex-wrap gap-2">
      {tags.map(tag => <span key={tag.label} className="rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-xs text-primary">{tag.label}</span>)}
    </div>}
    <section><h3 className="text-sm font-medium">Comentaris</h3>{comments.conflict ? <ul className="mt-2 space-y-3">{legacyComments.map(value => <li key={value} className="whitespace-pre-wrap break-words text-sm">{value}</li>)}</ul> : <p className="mt-2 whitespace-pre-wrap break-words text-sm">{comments.value || '—'}</p>}</section>
    {experience && <section className="border-t pt-4"><h3 className="text-sm font-medium">A la col·lecció</h3>{owned.length ? <button type="button" onClick={onViewCollection} className="mt-2 text-sm underline">Veure el joc a la col·lecció ({owned.length})</button> : <p className="mt-2 text-sm text-muted-foreground">Aquest joc no és a la col·lecció.</p>}</section>}
  </div>
}
