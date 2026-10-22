import test from 'node:test'
import assert from 'node:assert/strict'
import { renderToStaticMarkup } from 'react-dom/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReadingsPanel } from '../src/components/readings-panel'
import { parseFeed } from '../supabase/functions/_shared/readings'
test('readings render safe accessible external links, full accessible titles, dates and no modes',()=>{
 const client=new QueryClient({defaultOptions:{queries:{retry:false,staleTime:Infinity}}})
 client.setQueryData(['anait-readings'],{entries:parseFeed('<rss><channel><item><title>Lectura sintètica molt llarga</title><link>https://www.anaitgames.com/prova</link><pubDate>Thu, 01 Oct 2026 10:00:00 GMT</pubDate></item></channel></rss>','articles'),partial:false,stale:false})
 const html=renderToStaticMarkup(<QueryClientProvider client={client}><ReadingsPanel/></QueryClientProvider>)
 assert.match(html,/Lectura sintètica/);assert.match(html,/target="_blank" rel="noopener noreferrer"/);assert.doesNotMatch(html,/<select|Equilibrada|Lectures de fons|AnaitGames/);assert.match(html,/title="Lectura sintètica molt llarga"/);assert.match(html,/line-clamp-3/);assert.match(html,/<time dateTime=/)
})

test('disabled feature restores the original Home wrapper without sidebar or RSS request',async()=>{
 const { DashboardPage }=await import('../src/pages/dashboard-page')
 const { AuthContext }=await import('../src/lib/auth')
 const { MemoryRouter }=await import('react-router-dom')
 const client=new QueryClient({defaultOptions:{queries:{retry:false}}})
 const html=renderToStaticMarkup(<AuthContext.Provider value={{session:null,loading:false,error:null}}><QueryClientProvider client={client}><MemoryRouter><DashboardPage/></MemoryRouter></QueryClientProvider></AuthContext.Provider>)
 assert.match(html,/^<div class="page-container">/)
 assert.doesNotMatch(html,/home-readings|readings-title|Modalitat de lectures/)
 assert.equal(client.getQueryCache().find({queryKey:['anait-readings']}),undefined)
})

test('disabled feature removes shared sidebar readings without removing navigation or theme',async()=>{
 const { AppShell }=await import('../src/components/app-shell')
 const { AuthContext }=await import('../src/lib/auth')
 const { MemoryRouter }=await import('react-router-dom')
 const client=new QueryClient({defaultOptions:{queries:{retry:false}}})
 const html=renderToStaticMarkup(<AuthContext.Provider value={{session:null,loading:false,error:null}}><QueryClientProvider client={client}><MemoryRouter><AppShell><p>Contingut</p></AppShell></MemoryRouter></QueryClientProvider></AuthContext.Provider>)
 assert.match(html,/Navegació principal/);assert.match(html,/Tema de l’aplicació/);assert.match(html,/Configuració/)
 assert.doesNotMatch(html,/readings-title|Modalitat de lectures/)
 assert.equal(client.getQueryCache().find({queryKey:['anait-readings']}),undefined)
})
