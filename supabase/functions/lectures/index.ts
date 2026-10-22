// Preparació local: no desplegada. No necessita taules, SQL ni claus d’IGDB.
declare const Deno: { env: { get(name: string): string | undefined }; serve(handler: (request: Request) => Promise<Response>): void }
import { createFeedLoader } from '../_shared/readings.ts'
const load = createFeedLoader()
Deno.serve(async (request: Request) => {
  const origin = request.headers.get('origin') ?? ''
  const allowed = ['https://ibelchi.github.io', ...(Deno.env.get('LECTURES_ALLOWED_ORIGINS') ?? '').split(',').filter(Boolean)]
  const headers = { 'Content-Type': 'application/json', 'Vary': 'Origin', 'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : 'https://ibelchi.github.io', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Cache-Control': 'no-store' }
  if (request.method === 'OPTIONS') return new Response(null, { headers })
  if (request.method !== 'POST') return new Response('{}', { status: 405, headers })
  const authorization = request.headers.get('authorization')
  if (!authorization) return new Response('{}', { status: 401, headers })
  try {
    const user = await fetch(`${Deno.env.get('SUPABASE_URL')}/auth/v1/user`, { headers: { Authorization: authorization, apikey: Deno.env.get('SUPABASE_ANON_KEY') ?? '' }, signal: AbortSignal.timeout(8000) })
    if (!user.ok) return new Response('{}', { status: 401, headers })
    return new Response(JSON.stringify(await load()), { headers })
  } catch { return new Response(JSON.stringify({ error: 'Lectures no disponibles' }), { status: 502, headers }) }
})
