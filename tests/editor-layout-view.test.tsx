import test from 'node:test'
import assert from 'node:assert/strict'
import {renderToStaticMarkup} from 'react-dom/server'
import {QueryClient,QueryClientProvider} from '@tanstack/react-query'
import {AuthContext} from '../src/lib/auth'
import {RecordEditor} from '../src/components/record-editor'
import type {Catalog} from '../src/lib/catalog'
import type {Session} from '@supabase/supabase-js'
test('both form variants group every mark once, compact header and top/bottom non-submit close controls',()=>{
 for(const kind of ['exemplar','experiencia'] as const){
  const client=new QueryClient();const session={user:{id:'synthetic-owner'}} as Session
  client.setQueryData(['access',session.user.id],true)
  const game={id:'game',nom:'Nom',plataforma:'PC',user_id:session.user.id,per_infants:false,no_jugat:false,intencio_joc:null,plataforma_resolta:true,valoracio:'B',comentaris:null}
  const record={id:'record',user_id:session.user.id,joc_id:'game',a_la_colleccio:true,format:'fisic',jugant:false}
  const catalog={jocs:[game],exemplars:kind==='exemplar'?[record]:[],experiencies:kind==='experiencia'?[record]:[]} as unknown as Catalog
  const html=renderToStaticMarkup(<AuthContext.Provider value={{session,loading:false,error:null}}><QueryClientProvider client={client}><RecordEditor kind={kind} record={record as never} game={game as never} catalog={catalog} creating onClose={()=>{}} onSaved={async()=>catalog}/></QueryClientProvider></AuthContext.Provider>)
  assert.equal((html.match(/name="nom"/g)??[]).length,1)
  assert.equal((html.match(/<select name="valoracio"/g)??[]).length,1)
  for(const field of ['jugant','per_jugar_aviat','per_infants','no_jugat','intencio_joc'])assert.equal((html.match(new RegExp(`name="${field}"`,'g'))??[]).length,1)
  for(const label of ['Seguiment i preferències de joc'])assert.match(html,new RegExp(`<legend class="sr-only">${label}`))
  assert.doesNotMatch(html,/>Etiquetes del videojoc</)
  assert.equal((html.match(/type="button"[^>]*>Tanca</g)??[]).length,2)
  assert.equal((html.match(/type="submit"/g)??[]).length,2)
  assert(html.indexOf('name="no_jugat"')<html.indexOf('<summary'))
 }
})
