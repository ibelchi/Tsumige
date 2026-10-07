import { Check, Clock, X } from 'lucide-react'
import type { EstatProposit } from '@/lib/database.types'

const statuses = {
  fet: { label: 'Fet', icon: Check, className: 'bg-[#ecfdf5] text-[#166534]' },
  pendent: { label: 'Pendent', icon: Clock, className: 'bg-[#fff7ed] text-[#9a3412]' },
  descartat: { label: 'Descartat', icon: X, className: 'bg-[#fef2f2] text-[#991b1b]' },
} as const

export function PropositStatus({ estat }: { estat: EstatProposit }) {
  const { label, icon: Icon, className } = statuses[estat]
  return <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${className}`}><Icon aria-hidden="true" className="size-3.5" />{label}</span>
}
