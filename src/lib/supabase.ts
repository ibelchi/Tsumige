import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const publicKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()
let client: SupabaseClient<Database> | undefined

export const isSupabaseConfigured = Boolean(url && publicKey)

export function getSupabase(): SupabaseClient<Database> {
  if (!url || !publicKey) {
    throw new Error('Configura la URL i la clau pública de Supabase a .env.local.')
  }
  if (publicKey.startsWith('sb_secret_')) {
    throw new Error('Cal una clau pública de Supabase, mai una clau secreta.')
  }
  if (!publicKey.startsWith('sb_publishable_')) {
    try {
      const payload: unknown = JSON.parse(atob(publicKey.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
      if (!payload || typeof payload !== 'object' || !('role' in payload) || payload.role !== 'anon') throw new Error()
    } catch {
      throw new Error('Cal una clau publishable o anon de Supabase.')
    }
  }
  const projectUrl = new URL(url)
  if (projectUrl.protocol !== 'https:' && !(projectUrl.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(projectUrl.hostname))) {
    throw new Error('La URL de Supabase ha de fer servir HTTPS.')
  }
  client ??= createClient<Database>(url, publicKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
  })
  return client
}
