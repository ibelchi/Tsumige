import { useState } from 'react'
import { BrandLogo } from '@/components/brand-logo'

// IGDB cover_big: 264 × 374 (also used at 2x). The frame never changes with the source.
export function DetailCover({src,title,onError}: {src?: string | null; title: string; onError?:()=>void}) {
  const [failed,setFailed]=useState<string | null>(null)
  return <div className="detail-cover relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
    {src && failed!==src ? <img src={src} alt={`Portada de ${title}`} className="absolute inset-0 h-full w-full object-cover object-center" onError={()=>{setFailed(src);onError?.()}}/> : <BrandLogo className="w-16"/>}
  </div>
}
