// Fixture exclusiva de proves: dades sintètiques i cap petició real de desament.
import {createRoot} from 'react-dom/client'
import {QueryClient,QueryClientProvider} from '@tanstack/react-query'
import {AuthContext} from '../../src/lib/auth'
import {RecordEditor} from '../../src/components/record-editor'
import type {Catalog} from '../../src/lib/catalog'
import type {Session} from '@supabase/supabase-js'
import '../../src/index.css'
const params=new URLSearchParams(location.search)
const owner='11111111-1111-4111-8111-111111111111'
const game={id:'22222222-2222-4222-8222-222222222222',user_id:owner,nom:'Títol sintètic',plataforma:'PC',plataforma_resolta:true,desenvolupadora:'Estudi sintètic',genere_principal:'Aventura gràfica',generos_secundaris:[],any_llancament:2020,portada_url:`${location.origin}/Tsumige/synthetic-portrait.svg`,portada_font_url:'https://www.igdb.com/games/synthetic',comentaris:'Primera línia\nSegona línia',valoracio:'A+',per_infants:false,no_jugat:true,intencio_joc:null,per_jugar_aviat:false,created_at:'2026-01-01',updated_at:'2026-01-01'}
const copy={id:'33333333-3333-4333-8333-333333333333',joc_id:game.id,user_id:owner,format:'fisic',a_la_colleccio:true,favorit:false,canvi:false,reproduccio:false,no_localitzat:null,any_compra:2020,preu:0,regio:'PAL',estat_conservacio:'Molt bona',botiga_servei:null,notes:null,revisat:false,created_at:'2026-01-01',updated_at:'2026-01-01'}
const entry={id:'44444444-4444-4444-8444-444444444444',joc_id:game.id,user_id:owner,any_jugat:2026,completat:null,jugant:false,notes:null,valoracio:'A+',revisat:false,created_at:'2026-01-01',updated_at:'2026-01-01'}
const catalog={jocs:[game,{...game,id:'other',nom:'Altre joc',plataforma:'Nintendo Switch'}],exemplars:[copy],experiencies:[entry],plataformaModel:2} as unknown as Catalog
const fixtureState=document.createElement('script');fixtureState.type='application/json';fixtureState.id='fixture-catalog';fixtureState.textContent=JSON.stringify(catalog);document.body.append(fixtureState)
const session={user:{id:owner}} as Session
// La sessió falsa només viu a l’origen local i totes les peticions s’intercepten.
const encoded=(data:object)=>btoa(JSON.stringify(data)).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')
const project=new URL(import.meta.env.VITE_SUPABASE_URL).hostname.split('.')[0]
localStorage.setItem(`sb-${project}-auth-token`,JSON.stringify({access_token:`${encoded({alg:'HS256',typ:'JWT'})}.${encoded({sub:owner,role:'authenticated',exp:Math.floor(Date.now()/1000)+3600})}.c3ludGhldGlj`,refresh_token:'synthetic-only',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user:session.user}))
const client=new QueryClient({defaultOptions:{queries:{staleTime:Infinity,retry:false}}})
client.setQueryData(['access',owner],!params.has('guest'))
document.documentElement.dataset.theme=params.get('theme')??'light'
const kind=params.get('kind')==='log'?'experiencia':'exemplar'
createRoot(document.getElementById('root')!).render(<AuthContext.Provider value={{session,loading:false,error:null}}><QueryClientProvider client={client}><RecordEditor kind={kind} game={catalog.jocs[0]} record={kind==='exemplar'?catalog.exemplars[0]:catalog.experiencies[0]} catalog={catalog} onClose={()=>{document.getElementById('result')!.textContent='Tancat'}} onSaved={async()=>{
 const response=await fetch('/Tsumige/synthetic-editor-state');return await response.json() as Catalog
}}/></QueryClientProvider></AuthContext.Provider>)
