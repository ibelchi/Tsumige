import { cn } from '@/lib/utils'

export function BrandLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 406 552" role="img" aria-label="積みゲー (tsumigē)" className={cn('block shrink-0', className)}>
      <svg x="0" y="0" width="406" height="399" viewBox="424 342 406 399">
        <image href={import.meta.env.BASE_URL + 'save-logo.png'} width="1254" height="1254" />
      </svg>
      <svg x="0" y="434" width="406" height="105" viewBox="382 773 488 126">
        <image href={import.meta.env.BASE_URL + 'tsumige-wordmark-source.png'} width="1254" height="1254" />
      </svg>
    </svg>
  )
}
