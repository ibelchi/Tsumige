import { getSupabase } from '@/lib/supabase'
export { selectReadings } from '../../supabase/functions/_shared/readings'
export type { Reading } from '../../supabase/functions/_shared/readings'
import type { Reading } from '../../supabase/functions/_shared/readings'
export const readingsEnabled = import.meta.env.VITE_ENABLE_READINGS === 'true' || (import.meta.env.DEV && import.meta.env.VITE_ENABLE_READINGS !== 'false')
export async function getReadings(): Promise<{ entries: Reading[]; partial: boolean; stale: boolean }> {
  if (import.meta.env.DEV) {
    const response = await fetch(`${import.meta.env.BASE_URL}api/readings`)
    if (!response.ok) throw new Error('Lectures no disponibles')
    return response.json()
  }
  const { data, error } = await getSupabase().functions.invoke('lectures')
  if (error || !data || !Array.isArray(data.entries)) throw new Error('Lectures no disponibles')
  return data
}
