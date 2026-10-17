import { gameLabels } from '@/lib/game-labels'
import { DetailCover } from '@/components/detail-cover'
import { ExternalGameLinks } from '@/components/external-game-links'
import { collectionCopy } from '@/lib/platform'
import type { ReactNode } from 'react'
import type { Catalog } from '@/lib/catalog'
import type { Exemplar, Experiencia, FitxaJoc } from '@/lib/database.types'
import { gameComments } from '@/lib/game-comments'
import { storeName } from '@/lib/store-name'

function Detail({ label, value }: { label: string; value: ReactNode }) {
  return <div className="min-w-0 text-sm leading-6"><dt className="inline font-medium text-muted-foreground">{label}: </dt><dd className="inline whitespace-pre-wrap [overflow-wrap:anywhere]">{value === null || value === undefined || value === '' ? '—' : value}</dd></div>
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
  kind: 'exemplar' | 'experiencia' | 'joc'; record: Exemplar | Experiencia | null; game: FitxaJoc; catalog: Catalog; onViewCollection: () => void
}) {
  const image = game.portada_visual_url ?? game.portada_url
  const copy = kind === 'exemplar' ? record as Exemplar : null
  const experience = kind === 'experiencia' ? record as Experiencia : null
  const comments = gameComments(game, catalog)
  const history = catalog.experiencies.filter(item => item.joc_id === game.id)
  const owned = catalog.exemplars.filter(item => item.joc_id === game.id && collectionCopy(item, game))
  const legacyComments = comments.conflict ? [...new Set([...catalog.exemplars, ...history].filter(item => item.joc_id === game.id).map(item => item.notes).filter((value): value is string => Boolean(value?.trim())))] : []
  const provider = imageProvider(game.portada_font_url)
  const tags = [
    ...gameLabels(game).map(label => ({ label, active: true })),
    { label: 'Jugant', active: Boolean(experience?.jugant || history.some(item => item.jugant)) },
    { label: 'Per jugar aviat', active: game.per_jugar_aviat },
    { label: 'Per jugar amb infants', active: game.per_infants },
    { label: 'Possiblement d’intercanvi', active: copy?.canvi },
    { label: 'Reproducció', active: copy?.reproduccio },
    { label: 'No localitzat', active: copy?.no_localitzat },
  ].filter(tag => tag.active === true)
  return <div className="mt-3 space-y-3">
    {tags.length > 0 && <div aria-label="Etiquetes del joc" className="flex flex-wrap gap-2">
      {tags.map(tag => <span key={tag.label} className="rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-xs text-primary">{tag.label}</span>)}
    </div>}
    <div className="grid items-start gap-4 md:grid-cols-[clamp(16rem,28vw,20rem)_minmax(0,1fr)] md:gap-6">
      <div className="mx-auto flex w-full max-w-80 min-w-0 flex-col items-center gap-2">
        <DetailCover src={image} title={game.nom}/>
        <ExternalGameLinks title={game.nom} platform={game.plataforma} />
        {provider && game.portada_font_url && <a href={game.portada_font_url} target="_blank" rel="noreferrer" className="text-xs underline">{provider}</a>}
      </div>
      <div className="min-w-0 space-y-3">
        <dl className="space-y-1">
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
        <section><h3 className="text-sm font-semibold">Comentaris</h3><div className="mt-2 min-h-12 rounded-md border bg-background p-3">{comments.conflict ? <ul className="space-y-3">{legacyComments.map(value => <li key={value} className="whitespace-pre-wrap text-sm [overflow-wrap:anywhere]">{value}</li>)}</ul> : <p className="whitespace-pre-wrap text-sm [overflow-wrap:anywhere]">{comments.value || '—'}</p>}</div></section>
        {experience && <section className="border-t pt-4"><h3 className="text-sm font-medium">A la col·lecció</h3>{owned.length ? <button type="button" onClick={onViewCollection} className="mt-2 text-sm underline">Veure el joc a la col·lecció ({owned.length})</button> : <p className="mt-2 text-sm text-muted-foreground">Aquest joc no és a la col·lecció.</p>}</section>}
      </div>
    </div>
  </div>
}
