import { getSupabase } from '@/lib/supabase'
import type { Proposit, PropositInput } from '@/lib/database.types'

export function getAnyActual() {
  return Number(new Intl.DateTimeFormat('en', { year: 'numeric', timeZone: 'Europe/Madrid' }).format(new Date()))
}

export async function getProposits(years?: number[]): Promise<Proposit[]> {
  let query = getSupabase().from('proposits').select('*').order('any', { ascending: false }).order('created_at').order('id')
  if (years) query = query.in('any', years)
  const { data, error } = await query
  if (error) throw new Error('No s’han pogut carregar els propòsits. Torna-ho a provar.')
  return data
}

export async function saveProposit(input: PropositInput, id?: string) {
  const clean = { ...input, text: input.text.trim() }
  if (!clean.text || clean.text.length > 500 || !Number.isInteger(clean.any) || clean.any < 1 || clean.any > 9999) {
    throw new Error('Escriu el propòsit (màxim 500 caràcters) i un any vàlid.')
  }
  const client = getSupabase()
  const { error } = id
    ? await client.from('proposits').update(clean).eq('id', id).select('id').single()
    : await client.from('proposits').insert(clean).select('id').single()
  if (error) throw new Error('No s’ha pogut desar el propòsit. Les dades del formulari es conserven; torna-ho a provar.')
}
