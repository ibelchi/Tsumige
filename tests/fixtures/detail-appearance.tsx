// All records and images used by this fixture are synthetic.
import {createRoot} from 'react-dom/client'
import {QueryClient,QueryClientProvider} from '@tanstack/react-query'
import {AuthContext} from '../../src/lib/auth'
import {RecordEditor} from '../../src/components/record-editor'
import {DataReview} from '../../src/components/data-review'
import type {Catalog} from '../../src/lib/catalog'
import type {Session} from '@supabase/supabase-js'
import type {Valoracio} from '../../src/lib/database.types'
import '../../src/index.css'
const params=new URLSearchParams(location.search),session={user:{id:'synthetic-owner'}} as Session
const image=params.get('image')??'portrait',rating=params.get('rating')??'A++'
document.documentElement.dataset.theme=params.get('theme')??'light'
const title=params.get('title')??'Sekiro'
const game={id:'synthetic',user_id:session.user.id,nom:title,plataforma:'PC',desenvolupadora:'Prova',genere_principal:null,generos_secundaris:[],any_llancament:2019,sinopsi:null,portada_url:image==='none'?null:`/Tsumige/synthetic-${image}.svg`,per_jugar_aviat:false,created_at:'2026-01-01',updated_at:'2026-01-01',comentaris:params.has('long')?'Comentaris llargs amb salts de línia.\n'.repeat(40):'',valoracio:rating==='none'?null:rating as Valoracio,plataforma_resolta:true}
const copy={id:'copy',joc_id:game.id,user_id:session.user.id,format:'fisic',a_la_colleccio:true,preu:0,any_compra:null}
const catalog={jocs:[game,{...game,id:'other',nom:'Un altre joc',portada_url:null},{...game,id:'stored',nom:'Portada desada',portada_url:null,portada_fitxer:'covers/synthetic.jpg'}],exemplars:[copy,{...copy,id:'other-copy',joc_id:'other'},{...copy,id:'stored-copy',joc_id:'stored'}],experiencies:[]} as unknown as Catalog
const client=new QueryClient({defaultOptions:{queries:{staleTime:Infinity,retry:false}}})
client.setQueryData(['catalog',session.user.id],catalog);client.setQueryData(['data-review',session.user.id],catalog);client.setQueryData(['access',session.user.id],true)
createRoot(document.getElementById('root')!).render(<AuthContext.Provider value={{session,loading:false,error:null}}><QueryClientProvider client={client}>{params.get('view')==='review'?<DataReview/>:<RecordEditor kind="exemplar" record={catalog.exemplars[0]} game={catalog.jocs[0]} catalog={catalog} onClose={()=>{}} onSaved={async()=>catalog}/>}</QueryClientProvider></AuthContext.Provider>)
