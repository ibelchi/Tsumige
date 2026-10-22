// Only synthetic data; all query data are supplied without contacting Supabase.
import {createRoot} from 'react-dom/client'
import {BrowserRouter} from 'react-router-dom'
import {QueryClient,QueryClientProvider} from '@tanstack/react-query'
import {AuthContext} from '../../src/lib/auth'
import {AppShell} from '../../src/components/app-shell'
import {DashboardPage} from '../../src/pages/dashboard-page'
import type {Catalog} from '../../src/lib/catalog'
import type {Session} from '@supabase/supabase-js'
import '../../src/index.css'
const params=new URLSearchParams(location.search),session={user:{id:'synthetic-owner'}} as Session
const stamp={user_id:session.user.id,created_at:'2026-01-01',updated_at:'2026-01-01'}
const game={...stamp,id:'game1',nom:'Prova Vull',plataforma:'Steam',plataforma_resolta:true,desenvolupadora:null,genere_principal:'Acció',generos_secundaris:[],any_llancament:null,sinopsi:null,portada_url:null,comentaris:null,valoracio:null,per_infants:true,no_jugat:true,intencio_joc:'vull',per_jugar_aviat:false}
const games=[game,{...game,id:'game2',nom:'Prova No vull',intencio_joc:'no_vull',per_infants:false},{...game,id:'game3',nom:'Un altre joc',plataforma:'Nintendo Switch',genere_principal:'Puzle',no_jugat:false,intencio_joc:null,per_infants:false}]
const copy={...stamp,format:'digital',a_la_colleccio:true,favorit:true,regio:null,estat_conservacio:null,notes:null,preu:0,any_compra:null,revisat:false,canvi:false,reproduccio:false,no_localitzat:null,botiga_servei:null,origen:null}
const catalog={jocs:games,exemplars:games.map((g,i)=>({...copy,id:'copy'+i,joc_id:g.id,format:i===2?'fisic':'digital'})),experiencies:games.map((g,i)=>({...stamp,id:'entry'+i,joc_id:g.id,any_jugat:i===2?2025:2026,completat:null,valoracio:null,notes:null,jugant:false,revisat:false})),plataformaModel:2} as unknown as Catalog
const client=new QueryClient({defaultOptions:{queries:{staleTime:Infinity,retry:false}}})
client.setQueryData(['catalog',session.user.id],catalog);client.setQueryData(['access',session.user.id],false)
client.setQueryData(['jocs',session.user.id,'resum'],{fisics:1,digitals:2,jugant:games,per_jugar_aviat:games.slice(0,2)})
client.setQueryData(['proposits',session.user.id,'resum',new Date().getFullYear()],[])
document.documentElement.dataset.theme=params.get('theme')??'light'
createRoot(document.getElementById('root')!).render(<AuthContext.Provider value={{session,loading:false,error:null}}><QueryClientProvider client={client}><BrowserRouter><AppShell><DashboardPage/></AppShell></BrowserRouter></QueryClientProvider></AuthContext.Provider>)
