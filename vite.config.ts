import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { createFeedLoader } from './supabase/functions/_shared/readings'

const loadReadings = createFeedLoader()

export default defineConfig({
  base: '/Tsumige/',
  plugins: [react(), tailwindcss(), {
    name: 'local-readings',
    configureServer(server) {
      server.middlewares.use('/Tsumige/api/readings', async (request, response) => {
        response.setHeader('Content-Type', 'application/json')
        response.setHeader('Cache-Control', 'no-store')
        if (request.method !== 'GET') { response.statusCode = 405; response.end('{}'); return }
        try { response.end(JSON.stringify(await loadReadings())) }
        catch { response.statusCode = 502; response.end(JSON.stringify({ error: 'Lectures no disponibles' })) }
      })
    },
  }],
  resolve: {
    preserveSymlinks: true,
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
