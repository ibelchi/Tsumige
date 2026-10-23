// Catàleg exclusivament sintètic; cap consulta ni escriptura real.
import {createRoot} from 'react-dom/client'
import {QueryClient,QueryClientProvider} from '@tanstack/react-query'
import {BrowserRouter,useSearchParams} from 'react-router-dom'
import {AuthContext} from '../../src/lib/auth'
import {AppShell} from '../../src/components/app-shell'
import {DashboardPage} from '../../src/pages/dashboard-page'
import {CatalogPage} from '../../src/pages/catalog-page'
import {homeSummaryFixture} from './home-summary-data'
import type {Session} from '@supabase/supabase-js'
import '../../src/index.css'
const params=new URLSearchParams(location.search),session={user:{id:'synthetic-owner'}} as Session
const catalog=homeSummaryFixture()
if(params.has('large'))catalog.exemplars=Array.from({length:1234},(_,i)=>({...catalog.exemplars[0],id:`large-copy-${i}`}))
if(params.has('empty')){catalog.jocs=[];catalog.exemplars=[];catalog.experiencies=[]}
const client=new QueryClient({defaultOptions:{queries:{staleTime:Infinity,retry:false}}})
client.setQueryData(['catalog',session.user.id],catalog);client.setQueryData(['access',session.user.id],false)
client.setQueryData(['jocs',session.user.id,'resum'],{fisics:3,digitals:3,jugant:catalog.jocs.slice(0,3),per_jugar_aviat:catalog.jocs.slice(0,2)})
client.setQueryData(['proposits',session.user.id,'resum',new Date().getFullYear()],[])
client.setQueryData(['anait-readings'],{entries:[],partial:false,stale:false})
document.documentElement.dataset.theme=params.get('theme')??'light'
export function HomeSummaryContent(){const[p]=useSearchParams();return p.get('vista')==='colleccio'?<CatalogPage/>:<DashboardPage/>}
createRoot(document.getElementById('root')!).render(<AuthContext.Provider value={{session,loading:false,error:null}}><QueryClientProvider client={client}><BrowserRouter><AppShell><HomeSummaryContent/></AppShell></BrowserRouter></QueryClientProvider></AuthContext.Provider>)
