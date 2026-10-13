import { Star } from 'lucide-react'

export function FavoriteIndicator() {
  return <span role="img" aria-label="Joc favorit" className="mt-[0.1em] inline-flex size-5 shrink-0 text-[#996515]"><Star aria-hidden="true" className="size-full fill-current" strokeWidth={1.5} /></span>
}
