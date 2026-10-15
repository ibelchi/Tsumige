// Isolated browser fixture: synthetic data, no Supabase session or requests.
import {createRoot} from 'react-dom/client'
import {QueryClient,QueryClientProvider} from '@tanstack/react-query'
import {AuthContext} from '../../src/lib/auth'
import {HomeGameSearch} from '../../src/components/home-game-search'
import type {Catalog} from '../../src/lib/catalog'
import type {Session} from '@supabase/supabase-js'
import '../../src/index.css'
const session={user:{id:'synthetic-owner'}} as Session
const game={user_id:session.user.id,nom:"Assassin's Creed",plataforma:'PC',desenvolupadora:null,genere_principal:null,generos_secundaris:[],any_llancament:null,sinopsi:null,portada_url:null,per_jugar_aviat:false,created_at:'2026-01-01',updated_at:'2026-01-01',comentaris:'Comentari sintètic',valoracio:'A+' as const,plataforma_resolta:true}
const catalog={jocs:[{...game,id:'pc'},{...game,id:'console',plataforma:'PlayStation 4'},{...game,id:'orphan',nom:'Joc sense vincles'},{...game,id:'multi',nom:'Diversos exemplars'}],exemplars:[{id:'copy',joc_id:'pc',user_id:session.user.id,format:'fisic',a_la_colleccio:true,preu:0,any_compra:2020},{id:'copy-a',joc_id:'multi',user_id:session.user.id,format:'fisic',a_la_colleccio:true},{id:'copy-b',joc_id:'multi',user_id:session.user.id,format:'digital',a_la_colleccio:true}],experiencies:[{id:'log',joc_id:'console',user_id:session.user.id,any_jugat:2025,completat:'si'}]} as unknown as Catalog
const client=new QueryClient({defaultOptions:{queries:{staleTime:Infinity,retry:false}}})
client.setQueryData(['catalog',session.user.id],catalog)
client.setQueryData(['access',session.user.id],false)
createRoot(document.getElementById('root')!).render(<AuthContext.Provider value={{session,loading:false,error:null}}><QueryClientProvider client={client}><main tabIndex={-1} className="p-5"><HomeGameSearch/><button type="button" className="mt-48">Fora del cercador</button></main></QueryClientProvider></AuthContext.Provider>)
