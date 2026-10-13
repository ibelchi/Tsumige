import test from 'node:test'
import assert from 'node:assert/strict'
import { renderToStaticMarkup } from 'react-dom/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthContext } from '../src/lib/auth'
import { RecordCreator } from '../src/components/record-creator'
import type { Session } from '@supabase/supabase-js'
import type { Catalog } from '../src/lib/catalog'
const catalog = { jocs: [{ id: 'game', nom: 'Prova llarga '.repeat(15), plataforma: 'Steam', generos_secundaris: [], valoracio: 'A+', comentaris: 'Comentari compartit', per_jugar_aviat: false }], exemplars: [], experiencies: [] } as unknown as Catalog
function render(kind: 'exemplar' | 'experiencia', existing=false, owner=true) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const session = { user: { id: 'synthetic-owner' } } as Session
  client.setQueryData(['access', session.user.id], owner)
  client.setQueryData(['creation-version', session.user.id], true)
  return renderToStaticMarkup(<AuthContext.Provider value={{session,loading:false,error:null}}><QueryClientProvider client={client}><RecordCreator kind={kind} catalog={catalog} initialGameId={existing ? 'game' : undefined} onClose={()=>{}} onSaved={async()=>catalog} /></QueryClientProvider></AuthContext.Provider>)
}
test('collection opens applicable fields directly, without annual entry or initial modes',()=>{
  const html=render('exemplar')
  assert.match(html,/Afegeix un joc/);assert.match(html,/Preu/)
  assert.doesNotMatch(html,/Any de joc|Joc existent|type="radio"|> Jugant/)
})
test('log has mandatory current year; shared comments initially readonly with explicit edit',()=>{
  const html=render('experiencia',true)
  assert.match(html,new RegExp(`required="" type="number" min="1" max="9999"[^>]*value="${new Date().getFullYear()}"`))
  assert.match(html,/Comentari compartit/);assert.match(html,/Edita les dades del joc/)
  assert.doesNotMatch(html,/<textarea|Dades de Col·lecció|type="radio"/)
})
test('guests cannot render creation form',()=>assert.equal(render('experiencia',true,false),''))

test('gallery defaults, explicit list, canonical GB filter and clean physical/digital summary links', async()=>{
 const { MemoryRouter }=await import('react-router-dom')
 const { CatalogPage }=await import('../src/pages/catalog-page')
 const { CollectionSummary }=await import('../src/components/collection-summary')
 const { rememberCollectionView, initialCollectionView }=await import('../src/lib/collection-view')
 const c={...catalog,jocs:[{...catalog.jocs[0],nom:'Físic sintètic',plataforma:'GB'},{...catalog.jocs[0],id:'digital-game',nom:'Digital sintètic',plataforma:'Steam'}],exemplars:[{id:'physical',joc_id:'game',format:'fisic',a_la_colleccio:true},{id:'digital',joc_id:'digital-game',format:'digital',a_la_colleccio:true}]} as unknown as Catalog
 function markup(url:string, summary=false) {
  const client=new QueryClient({defaultOptions:{queries:{retry:false}}})
  const session={user:{id:'synthetic-owner'}} as Session
  client.setQueryData(['access',session.user.id],false)
  client.setQueryData(['catalog',session.user.id],c)
  return renderToStaticMarkup(<AuthContext.Provider value={{session,loading:false,error:null}}><QueryClientProvider client={client}><MemoryRouter initialEntries={[url]}>{summary ? <CollectionSummary/> : <CatalogPage/>}</MemoryRouter></QueryClientProvider></AuthContext.Provider>)
 }
 assert.match(markup('/?vista=colleccio'),/aria-pressed="true"[^>]*>Galeria/)
 assert.match(markup('/?vista=colleccio&presentacio=list'),/aria-pressed="true"[^>]*>Llista/)
 const physical=markup('/?vista=colleccio&format=fisic&plataforma=Game+Boy')
 assert.match(physical,/Físic sintètic/);assert.doesNotMatch(physical,/Digital sintètic/)
 const summary=markup('/?vista=inici&plataforma=Steam&genere=Residual',true)
 assert.match(summary,/href="\/\?vista=colleccio&amp;format=fisic&amp;origen=inici"/)
 assert.match(summary,/href="\/\?vista=colleccio&amp;format=digital&amp;origen=inici"/)
 assert.doesNotMatch(summary,/genere=Residual|plataforma=Steam/)
 rememberCollectionView('list');assert.equal(initialCollectionView(null),'list')
 assert.equal(initialCollectionView('cards'),'cards');rememberCollectionView('cards')
})

test('random refresh is icon-only and accessible; Settings retains permanent tools without conversion audit',async()=>{
 const { MemoryRouter }=await import('react-router-dom')
 const { RandomCollectionCovers }=await import('../src/components/random-collection-covers')
 const { randomVisit }=await import('../src/lib/random-collection')
 const { SettingsPage }=await import('../src/pages/settings-page')
 const client=new QueryClient({defaultOptions:{queries:{retry:false}}})
 const session={user:{id:'synthetic-owner'}} as Session
 const c={...catalog,jocs:[{...catalog.jocs[0],portada_url:'https://example.invalid/cover.jpg'}],exemplars:[{id:'physical',joc_id:'game',format:'fisic',a_la_colleccio:true}]} as unknown as Catalog
 client.setQueryData(['access',session.user.id],true)
 client.setQueryData(['catalog',session.user.id],c)
 randomVisit.set(session.user.id,['game'])
 const renderPart=(settings:boolean)=>renderToStaticMarkup(<AuthContext.Provider value={{session,loading:false,error:null}}><QueryClientProvider client={client}><MemoryRouter>{settings ? <SettingsPage/> : <RandomCollectionCovers/>}</MemoryRouter></QueryClientProvider></AuthContext.Provider>)
 const covers=renderPart(false)
 assert.match(covers,/aria-label="Renova els jocs a l’atzar"/)
 assert.match(covers,/size-11 text-green-700/);assert.match(covers,/focus-visible:ring-2/)
 assert.doesNotMatch(covers,/>Renova els jocs a l’atzar</)
 assert.match(covers,/object-contain/)
 const settings=renderPart(true)
 for(const title of ['Còpia de seguretat','Recupera una còpia','Exporta per consultar amb Excel','Revisió de dades'])assert.ok(settings.includes(title),title)
 assert.doesNotMatch(settings,/Conversió de Plataforma|discrepàncies/)
})

test('Excel origin is absent from editing UI while the record keeps its internal data',async()=>{
 const {RecordEditor}=await import('../src/components/record-editor')
 const client=new QueryClient({defaultOptions:{queries:{retry:false}}})
 const session={user:{id:'synthetic-owner'}} as Session
 client.setQueryData(['access',session.user.id],true)
 const game={...catalog.jocs[0],plataforma:'Game Boy',plataforma_resolta:true,per_infants:false}
 const copy={id:'physical',user_id:session.user.id,joc_id:'game',format:'fisic',a_la_colleccio:true,origen:{marcador:'SINTETIC_EXCEL_ORIGIN'},notes:null,any_compra:null,preu:0,botiga_servei:null,revisat:false}
 const c={jocs:[game],exemplars:[copy],experiencies:[],plataformaModel:2} as unknown as Catalog
 const html=renderToStaticMarkup(<AuthContext.Provider value={{session,loading:false,error:null}}><QueryClientProvider client={client}><RecordEditor kind="exemplar" game={game} record={c.exemplars[0]} catalog={c} creating onClose={()=>{}} onSaved={async()=>c}/></QueryClientProvider></AuthContext.Provider>)
 assert.doesNotMatch(html,/Dades originals de l’Excel|SINTETIC_EXCEL_ORIGIN/)
 assert.deepEqual(copy.origen,{marcador:'SINTETIC_EXCEL_ORIGIN'})
})

test('game detail preserves full comments, active tags, cover/rating/source order and guest navigation',async()=>{
 const { RecordEditor }=await import('../src/components/record-editor')
 const longComment='Comentari sintètic sense retall. '.repeat(120)
 const game={...catalog.jocs[0],comentaris:longComment,portada_url:'https://example.invalid/panoramica.jpg',portada_font_url:'https://www.igdb.com/games/synthetic',per_infants:true,per_jugar_aviat:false,plataforma_resolta:true}
 const copy={id:'synthetic-copy',joc_id:game.id,format:'fisic',a_la_colleccio:true,favorit:true,canvi:false,reproduccio:false,no_localitzat:false,preu:0,any_compra:2020}
 const c={...catalog,jocs:[game],exemplars:[copy]} as unknown as Catalog
 function renderDetail(owner:boolean, rated=true) {
  const client=new QueryClient({defaultOptions:{queries:{retry:false}}})
  const session={user:{id:'synthetic-owner'}} as Session
  client.setQueryData(['access',session.user.id],owner)
  const g={...game,valoracio:rated ? 'A+' : null} as Catalog['jocs'][number]
  return renderToStaticMarkup(<AuthContext.Provider value={{session,loading:false,error:null}}><QueryClientProvider client={client}><RecordEditor kind="exemplar" record={c.exemplars[0]} game={g} catalog={{...c,jocs:[g]}} onClose={()=>{}} onSaved={async()=>c} navigation={{position:1,total:2,next:()=>{}}} /></QueryClientProvider></AuthContext.Provider>)
 }
 const guest=renderDetail(false)
 assert(guest.includes(longComment))
 assert.match(guest,/Joc favorit/)
 assert.match(guest,/Per jugar amb infants/)
 assert.doesNotMatch(guest,/Possiblement d’intercanvi|No localitzat|<form|<textarea|>Edita</)
 assert.equal((guest.match(/>Anterior</g)??[]).length,2)
 assert.equal((guest.match(/>Següent</g)??[]).length,2)
 assert(guest.indexOf('<img')<guest.indexOf('A+'))
 assert(guest.indexOf('A+')<guest.indexOf('>IGDB<'))
 assert.match(renderDetail(true),/>Edita</)
 assert.doesNotMatch(renderDetail(false,false),/>A\+</)
})

test('log gallery keeps descending years, known completion states and separate related-copy actions',async()=>{
 const { MemoryRouter }=await import('react-router-dom')
 const { CatalogPage }=await import('../src/pages/catalog-page')
 const games=[
  {...catalog.jocs[0],id:'recent',nom:'Títol recent '.repeat(14),portada_url:'https://example.invalid/portrait.jpg'},
  {...catalog.jocs[0],id:'old',nom:'Antic sintètic',plataforma:'Emulador',valoracio:null,portada_url:'https://example.invalid/landscape.jpg'},
  {...catalog.jocs[0],id:'undated',nom:'Sense any sintètic'},
 ]
 const entries=[{id:'r',joc_id:'recent',any_jugat:2040,completat:'si'},{id:'o',joc_id:'old',any_jugat:2030,completat:null},{id:'u',joc_id:'undated',any_jugat:null,completat:'no'}]
 const c={...catalog,jocs:games,experiencies:entries,exemplars:[{id:'copy',joc_id:'recent',format:'digital',a_la_colleccio:true},{id:'retired',joc_id:'old',format:'fisic',a_la_colleccio:false}]} as unknown as Catalog
 function render(url:string) {
  const client=new QueryClient({defaultOptions:{queries:{retry:false}}});const session={user:{id:'synthetic-owner'}} as Session
  client.setQueryData(['access',session.user.id],false);client.setQueryData(['catalog',session.user.id],c)
  return renderToStaticMarkup(<AuthContext.Provider value={{session,loading:false,error:null}}><QueryClientProvider client={client}><MemoryRouter initialEntries={[url]}><CatalogPage history/></MemoryRouter></QueryClientProvider></AuthContext.Provider>)
 }
 const html=render('/?vista=jugats')
 assert(html.indexOf('Jocs de 2040')<html.indexOf('Jocs de 2030'))
 assert(html.includes(games[0].nom))
 assert.match(html,/collection-gallery/);assert.match(html,/object-contain/);assert.match(html,/text-\[#e02424\]/)
 assert.match(html,/>Completat</);assert.doesNotMatch(html,/No completat|Sense any sintètic|Ordena els registres|exemplars<\/p>|Afegeix una entrada/)
 assert.equal((html.match(/>Entrada de log</g)??[]).length,2)
 assert.equal((html.match(/>Col·lecció<span/g)??[]).length,1)
 assert(html.indexOf('Filtra per any de joc')<html.indexOf('Cerca per nom'))
 assert(html.indexOf('Cerca per nom')<html.indexOf('Plataformes ·'))
 const buttons=html.match(/<button\b[^>]*>[\s\S]*?<\/button>/g)??[]
 assert(buttons.every(b=>(b.match(/<button\b/g)??[]).length===1))
 const filtered=render('/?vista=jugats&any=2030&plataforma=Emulador')
 assert.match(filtered,/Antic sintètic/);assert.doesNotMatch(filtered,/Títol recent/)
})

test('direct Collection action selects one copy by relation or offers multiple copies without title matching',async()=>{
 const { RecordEditor }=await import('../src/components/record-editor')
 const game={...catalog.jocs[0],plataforma_resolta:true}
 const entry={id:'entry',joc_id:game.id,any_jugat:2026,completat:'si'}
 const copies=[{id:'copy1',joc_id:game.id,format:'fisic',a_la_colleccio:true,regio:'PAL'},{id:'copy2',joc_id:game.id,format:'fisic',a_la_colleccio:true,regio:'JPN'}]
 function render(count:number) {
  const client=new QueryClient({defaultOptions:{queries:{retry:false}}});const session={user:{id:'synthetic-owner'}} as Session
  client.setQueryData(['access',session.user.id],false)
  const c={...catalog,jocs:[game],experiencies:[entry],exemplars:copies.slice(0,count)} as unknown as Catalog
  return renderToStaticMarkup(<AuthContext.Provider value={{session,loading:false,error:null}}><QueryClientProvider client={client}><RecordEditor kind="experiencia" initialCollection record={c.experiencies[0]} game={c.jocs[0]} catalog={c} onClose={()=>{}} onSaved={async()=>c}/></QueryClientProvider></AuthContext.Provider>)
 }
 assert.match(render(1),/>Format</);assert.doesNotMatch(render(1),/Tria un exemplar/)
 const several=render(2);assert.match(several,/Tria un exemplar/);assert.match(several,/copy1/);assert.match(several,/copy2/)
 assert.doesNotMatch(render(0),/Veure el joc a la col·lecció|Tria un exemplar/)
})


test('log offers owner-only collection additions by ID, excluding Emulador; historical-only games stay eligible', async()=>{
 const {HistoryList}=await import('../src/components/history-list')
 const games=[{...catalog.jocs[0],id:'missing'}, {...catalog.jocs[0],id:'owned'}, {...catalog.jocs[0],id:'emulated',plataforma:'Emulador'}]
 const rows=games.map((g,i)=>({id:`entry${i}`,joc_id:g.id,any_jugat:2026,completat:null})) as Catalog['experiencies']
 const copies=[{id:'history',joc_id:'missing',a_la_colleccio:false,format:'digital'},{id:'active',joc_id:'owned',a_la_colleccio:true,format:'fisic'}] as Catalog['exemplars']
 const markup=(owner:boolean)=>renderToStaticMarkup(<HistoryList rows={rows} games={new Map(games.map(g=>[g.id,g]))} experiences={rows} copies={copies} year="2026" onOpen={()=>{}} onOpenCollection={()=>{}} onAddCollection={owner ? ()=>{} : undefined}/>)
 const html=markup(true)
 assert.equal((html.match(/>Afegeix a la col·lecció<span/g)??[]).length,1)
 assert.equal((html.match(/>Col·lecció<span/g)??[]).length,1)
 assert.equal((html.match(/min-h-15/g)??[]).length,3)
 assert.doesNotMatch(markup(false),/Afegeix a la col·lecció/)
 assert((html.match(/<button\b[^>]*>[\s\S]*?<\/button>/g)??[]).every(b=>(b.match(/<button\b/g)??[]).length===1))
 const client=new QueryClient({defaultOptions:{queries:{retry:false}}});const session={user:{id:'synthetic-owner'}} as Session
 client.setQueryData(['access',session.user.id],true);client.setQueryData(['creation-version',session.user.id],true)
 const form=renderToStaticMarkup(<AuthContext.Provider value={{session,loading:false,error:null}}><QueryClientProvider client={client}><RecordCreator kind="exemplar" catalog={{...catalog,jocs:games,exemplars:copies}} initialGameId="missing" collectionOnly onClose={()=>{}} onSaved={async()=>catalog}/></QueryClientProvider></AuthContext.Provider>)
 assert.match(form,/Afegeix a la col·lecció/);assert.match(form,/exemplars històrics/)
 assert.doesNotMatch(form,/Canvia de joc|Edita les dades del joc|<textarea|Any de joc/)
 assert.match(form,/readOnly=""/);assert.match(form,/step="0.01"/)
})


test('home chart supports persisted views, guest consultation, accessible switch and encoded bar links',async()=>{
 const {HomeStatistics}=await import('../src/components/home-statistics')
 const {MemoryRouter}=await import('react-router-dom')
 const previous=Object.getOwnPropertyDescriptor(globalThis,'window')
 try {
  for(const [view,title,path] of [['played','Jocs jugats per any','vista=jugats'],['ratings','Valoracions','valoracio=A%2B%2B'],['platforms','Plataformes de la col·lecció','plataforma=Steam']]) {
   Object.defineProperty(globalThis,'window',{configurable:true,value:{localStorage:{getItem:()=>view}}})
   const client=new QueryClient({defaultOptions:{queries:{retry:false}}});const session={user:{id:'synthetic-owner'}} as Session
   client.setQueryData(['access',session.user.id],false)
   client.setQueryData(['catalog',session.user.id],{...catalog,exemplars:[{joc_id:'game',format:'digital',a_la_colleccio:true}],experiencies:[{joc_id:'game',any_jugat:new Date().getFullYear()}]})
   const html=renderToStaticMarkup(<AuthContext.Provider value={{session,loading:false,error:null}}><QueryClientProvider client={client}><MemoryRouter><HomeStatistics/></MemoryRouter></QueryClientProvider></AuthContext.Provider>)
   assert(html.includes(title));assert.equal((html.match(/aria-pressed="true"/g)??[]).length,1);assert.equal((html.match(/aria-pressed="false"/g)??[]).length,2);assert.match(html,/bg-green-100/);assert(html.includes(path));assert.match(html,/focus-visible:outline/)
   assert.doesNotMatch(html,/NaN|Infinity|<input|<form/)
  }
 } finally {if(previous)Object.defineProperty(globalThis,'window',previous);else Reflect.deleteProperty(globalThis,'window')}
})


test('home game lists keep first three in order, handle 0/1/2/3/more and persist independent expansion',async()=>{
 const {GameList}=await import('../src/components/collection-summary')
 const {summaryExpansion}=await import('../src/lib/summary-expansion')
 const {MemoryRouter}=await import('react-router-dom')
 const games=Array.from({length:5},(_,i)=>({id:`synthetic-${i}`,nom:`Joc ${i}`,plataforma:'Game Boy',portada_url:'https://example.invalid/cover.jpg'})) as import('../src/lib/database.types').JocLlista[]
 const render=(count:number,title='Jugant')=>renderToStaticMarkup(<MemoryRouter><GameList owner="test-expansion" title={title} games={games.slice(0,count)} isLoading={false}/></MemoryRouter>)
 try {
  for(const count of [0,1,2,3,5]) {
   const html=render(count)
   assert.equal((html.match(/<li /g)??[]).length,Math.min(count,3))
   assert.equal(html.includes('md:min-h-[26rem]'),count>0)
   if(count>3)assert.match(html,/Mostra els 2 jocs amagats de Jugant/)
   else assert.doesNotMatch(html,/aria-expanded/)
   if(count)assert.match(html,/object-contain|justify-center/)
  }
  summaryExpansion.set('test-expansion:Jugant',true)
  assert.equal((render(5).match(/<li /g)??[]).length,5)
  assert.match(render(5),/Mostra només els tres primers/)
  assert.equal((render(5,'Per jugar aviat').match(/<li /g)??[]).length,3)
  assert.equal((render(5).match(/<li /g)??[]).length,5)
  summaryExpansion.set('test-expansion:Jugant',false)
  assert.equal((render(5).match(/<li /g)??[]).length,3)
  const html=render(5)
  assert(html.indexOf('Joc 0')<html.indexOf('Joc 1'));assert(html.indexOf('Joc 1')<html.indexOf('Joc 2'))
 } finally {summaryExpansion.set('test-expansion:Jugant',false)}
})

test('dashboard puts compact counters first and statistics after goals and random games',async()=>{
 const {DashboardPage}=await import('../src/pages/dashboard-page')
 const {MemoryRouter}=await import('react-router-dom')
 const client=new QueryClient({defaultOptions:{queries:{retry:false}}});const session={user:{id:'dashboard-synthetic'}} as Session
 client.setQueryData(['access',session.user.id],false)
 client.setQueryData(['catalog',session.user.id],catalog)
 client.setQueryData(['jocs',session.user.id,'resum'],{fisics:3,digitals:2,jugant:[],per_jugar_aviat:[]})
 client.setQueryData(['proposits',session.user.id,'resum',new Date().getFullYear()],[])
 const html=renderToStaticMarkup(<AuthContext.Provider value={{session,loading:false,error:null}}><QueryClientProvider client={client}><MemoryRouter><DashboardPage/></MemoryRouter></QueryClientProvider></AuthContext.Provider>)
 assert(html.indexOf('Jocs físics')<html.indexOf('aria-label="Jugant"'))
 assert(html.indexOf('aria-label="Per jugar aviat"')<html.indexOf('Propòsits de l’any actual'))
 assert(html.indexOf('Jocs a l’atzar')<html.indexOf('aria-label="Jocs jugats per any"'))
 assert.match(html,/format=fisic/);assert.match(html,/format=digital/)
 assert.match(html,/Llegenda dels estats/);assert.match(html,/grid items-start gap-3 md:grid-cols-2/)
})

test('home year chart shows only five recent available years with no expansion controls',async()=>{
 const {HomeStatistics}=await import('../src/components/home-statistics')
 const {MemoryRouter}=await import('react-router-dom')
 const years=[2026,2020,2015,2002,1997,1988,1980]
 const markup=(count:number)=>{
  const client=new QueryClient({defaultOptions:{queries:{retry:false}}});const session={user:{id:'years-synthetic'}} as Session
  client.setQueryData(['catalog',session.user.id],{...catalog,experiencies:years.slice(0,count).flatMap(year=>[{joc_id:'game',any_jugat:year},{joc_id:'game',any_jugat:year}])})
  return renderToStaticMarkup(<AuthContext.Provider value={{session,loading:false,error:null}}><QueryClientProvider client={client}><MemoryRouter><HomeStatistics/></MemoryRouter></QueryClientProvider></AuthContext.Provider>)
 }
 for(const count of [0,2,5,7]) {
  const html=markup(count)
  assert.equal((html.match(/<th scope="row"/g)??[]).length,Math.min(count,5))
  assert.doesNotMatch(html,/anys amagats|Mostra’n menys|aria-expanded|NaN|Infinity|any=1980/)
  if(count)assert.match(html,/any=2026/)
 }
})

test('collection list rows keep full thumbnails, long titles, format and red ratings without destructive actions',async()=>{
 const {CollectionListRow}=await import('../src/components/collection-card')
 const copy={id:'copy',joc_id:'game',format:'fisic',regio:'PAL'} as Catalog['exemplars'][number]
 for(const image of [null,'https://example.invalid/portrait.jpg','https://example.invalid/wide.jpg']) {
  const game={...catalog.jocs[0],nom:'Títol llarg '.repeat(30),portada_url:image}
  const html=renderToStaticMarkup(<CollectionListRow game={game} copy={copy} rating="A++" onOpen={()=>{}}/>)
  assert(html.includes(game.nom));assert.match(html,/h-14 w-10/);assert.match(html,/overflow-wrap:anywhere/);assert.match(html,/Físic/);assert.match(html,/text-\[#e02424\]/)
  if(image)assert.match(html,/object-contain/)
  assert.doesNotMatch(html,/Retira|Elimina|object-cover|truncate/)
 }
 const html=renderToStaticMarkup(<CollectionListRow game={catalog.jocs[0]} copy={copy} rating={null} onOpen={()=>{}}/>)
 assert.doesNotMatch(html,/text-2xl/)
})
