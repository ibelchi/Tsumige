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
 assert.match(covers,/aria-label="Renova els jocs a l’atzar: Tots"/)
 assert.match(covers,/aria-label="Renova els jocs a l’atzar: Top"/);assert.doesNotMatch(covers,/lucide-refresh-cw|>Favorits</);assert.match(covers,/focus-visible:ring-2/)
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
 assert.equal((guest.match(/>Anterior</g)??[]).length,1)
 assert.equal((guest.match(/>Següent</g)??[]).length,1)
 assert(guest.indexOf('Etiquetes del joc')<guest.indexOf('<img'))
 assert.equal((guest.match(/>Tanca<\/button>/g)??[]).length,1)
 assert(guest.indexOf('>Tanca</button>')<guest.indexOf('Etiquetes del joc'))
 assert.match(guest,/h-full w-full object-cover object-center/)
 assert.match(guest,/<dt class="inline[^"]*">Desenvolupadora: <\/dt><dd class="inline/)
 assert(guest.indexOf('aria-label="Valoració A+"')<guest.indexOf('</header>'))
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
 assert(html.indexOf('Cerca per nom')<html.indexOf('Filtra per any de joc'))
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
 assert.match(render(1),/>Format: </);assert.doesNotMatch(render(1),/Tria un exemplar/)
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

test('random covers show accessible active filters and only eligible saved selections, including empty results',async()=>{
 const {CoverSelection}=await import('../src/components/random-collection-covers')
 const {randomVisit}=await import('../src/lib/random-collection')
 const {MemoryRouter}=await import('react-router-dom')
 const previous=Object.getOwnPropertyDescriptor(globalThis,'window')
 const games=[{...catalog.jocs[0],id:'best',nom:'Millor sintètic',valoracio:'A+',portada_url:'https://example.invalid/cover.jpg'}, {...catalog.jocs[0],id:'favorite',nom:'Favorit sense valoració',valoracio:null,portada_url:'https://example.invalid/wide.jpg'}]
 const data={jocs:games,exemplars:[{joc_id:'best',a_la_colleccio:true,favorit:false},{joc_id:'favorite',a_la_colleccio:true,favorit:true}],experiencies:[]} as unknown as Catalog
 try {
  for(const [filter,ids,label,excluded] of [['all',['best','favorite'],'Tots',''],['best',['best'],'Top','Favorit sense valoració']] as const) {
   Object.defineProperty(globalThis,'window',{configurable:true,value:{localStorage:{getItem:()=>filter}}})
   randomVisit.set('random-synthetic',ids,filter)
   const html=renderToStaticMarkup(<MemoryRouter><CoverSelection owner="random-synthetic" catalog={data}/></MemoryRouter>)
   assert.equal((html.match(/aria-pressed="true"/g)??[]).length,1)
   assert.match(html,new RegExp(`aria-pressed="true"[^>]*>${label}`))
   assert.equal((html.match(/<li /g)??[]).length,ids.length)
   if(excluded)assert(!html.includes(excluded))
   assert.match(html,/Renova els jocs a l’atzar/);assert.doesNotMatch(html,/Els millors|>Favorits<|lucide-refresh-cw/);assert.match(html,/flex flex-wrap items-center justify-between/);assert.match(html,/object-contain/);assert.match(html,/focus-visible/)
  }
  randomVisit.set('random-empty',[],'best')
  const html=renderToStaticMarkup(<MemoryRouter><CoverSelection owner="random-empty" catalog={{...data,exemplars:[]}}/></MemoryRouter>)
  assert.match(html,/No hi ha jocs amb portada per a aquest filtre/);assert.doesNotMatch(html,/<li /)
 } finally {if(previous)Object.defineProperty(globalThis,'window',previous);else Reflect.deleteProperty(globalThis,'window')}
})

test('collection gallery and list share a filled, named favorite star before long titles, omitted when inactive',async()=>{
 const {CollectionCard,CollectionListRow}=await import('../src/components/collection-card')
 const game={...catalog.jocs[0],nom:'Nom molt llarg '.repeat(20)}
 for(const favorite of [false,true]) {
  const copy={joc_id:game.id,format:'fisic',favorit:favorite} as Catalog['exemplars'][number]
  for(const Component of [CollectionCard,CollectionListRow]) {
   const html=renderToStaticMarkup(<Component game={game} copy={copy} rating="A+" onOpen={()=>{}}/>)
   assert.equal((html.match(/aria-label="Joc favorit"/g)??[]).length,favorite ? 1 : 0)
   if(favorite) {
    assert(html.indexOf('aria-label="Joc favorit"')<html.indexOf(game.nom))
    assert.match(html,/fill-current/);assert.match(html,/shrink-0/);assert.match(html,/text-\[#996515\]/)
   }
   assert.match(html,/items-start/);assert.match(html,/text-\[#e02424\]/)
  }
 }
})

test('home search is one accessible field for guests and owners, while standalone game details need no fabricated record',async()=>{
 const {HomeGameSearch}=await import('../src/components/home-game-search')
 const {RecordDetails}=await import('../src/components/record-details')
 const {MemoryRouter}=await import('react-router-dom')
 for(const owner of [true,false]) {
  const client=new QueryClient({defaultOptions:{queries:{retry:false}}});const session={user:{id:'search-synthetic'}} as Session
  client.setQueryData(['access',session.user.id],owner);client.setQueryData(['catalog',session.user.id],catalog)
  const html=renderToStaticMarkup(<AuthContext.Provider value={{session,loading:false,error:null}}><QueryClientProvider client={client}><MemoryRouter><HomeGameSearch/></MemoryRouter></QueryClientProvider></AuthContext.Provider>)
  assert.match(html,/role="combobox"/);assert.match(html,/aria-label="Cerca un joc"/);assert.match(html,/aria-autocomplete="list"/)
  assert.doesNotMatch(html,/<select|<form|<li /)
 }
 const html=renderToStaticMarkup(<RecordDetails kind="joc" record={null} game={catalog.jocs[0]} catalog={catalog} onViewCollection={()=>{}}/>)
 assert.match(html,/Comentari compartit/);assert.doesNotMatch(html,/aria-label="Valoració |<input|<textarea/)
})

test('collection quick filters prioritize favorites on legacy URLs and combine with platforms/format in both views, including guests and empty results',async()=>{
 const {CatalogPage}=await import('../src/pages/catalog-page')
 const {MemoryRouter}=await import('react-router-dom')
 const c={...catalog,jocs:[{...catalog.jocs[0],id:'both',nom:'Coincideix',plataforma:'Steam',per_infants:true},{...catalog.jocs[0],id:'favorite',nom:'Només favorit',plataforma:'PC',per_infants:false},{...catalog.jocs[0],id:'child',nom:'Només infants',plataforma:'Steam',per_infants:true}],exemplars:[{id:'one',joc_id:'both',format:'digital',a_la_colleccio:true,favorit:true},{id:'two',joc_id:'favorite',format:'fisic',a_la_colleccio:true,favorit:true},{id:'three',joc_id:'child',format:'fisic',a_la_colleccio:true,favorit:false}]} as unknown as Catalog
 const render=(query:string,owner=false)=>{
  const client=new QueryClient({defaultOptions:{queries:{retry:false}}});const session={user:{id:'quick-filters-owner'}} as Session
  client.setQueryData(['access',session.user.id],owner);client.setQueryData(['catalog',session.user.id],c)
  return renderToStaticMarkup(<AuthContext.Provider value={{session,loading:false,error:null}}><QueryClientProvider client={client}><MemoryRouter initialEntries={[`/?vista=colleccio&${query}`]}><CatalogPage/></MemoryRouter></QueryClientProvider></AuthContext.Provider>)
 }
 for(const view of ['cards','list']) {
  for(const owner of [false,true]) {
   const html=render(`presentacio=${view}&favorits=1&infants=1&format=digital&plataforma=Steam`,owner)
   assert.match(html,/Coincideix/);assert.doesNotMatch(html,/Només favorit|Només infants/)
   assert.equal((html.match(/>Amb infants</g)??[]).length,1)
   assert.match(html,/aria-pressed="true"[^>]*><svg[^>]*[\s\S]*?Favorits/)
   assert.match(html,/bg-primary\/10/)
  }
 }
 const all=render('');assert.match(all,/Coincideix/);assert.match(all,/Només favorit/);assert.match(all,/Només infants/)
 const favorites=render('favorits=1');assert.match(favorites,/Només favorit/);assert.doesNotMatch(favorites,/Només infants/)
 const children=render('infants=1');assert.match(children,/Només infants/);assert.doesNotMatch(children,/Només favorit/)
 assert.match(render('favorits=1&infants=1&format=fisic'),/Només favorit/)
 assert.match(render('favorits=1&format=fisic&plataforma=Steam'),/No hi ha registres amb aquests filtres/)
})

test('genre dropdown preserves current value, has blank option and owner-only add, and replaces primary text inputs in both creators',async()=>{
 const {GenreSelect}=await import('../src/components/genre-select')
 const options=['Acció','accio','Rol']
 for(const owner of [true,false]) {
  const html=renderToStaticMarkup(<GenreSelect genres={options} defaultValue="accio" canAdd={owner}/>)
  assert.match(html,/<select[^>]*name="genere_principal"/)
  assert.match(html,/<option value="">Sense gènere/)
  assert.match(html,/<option value="accio" selected="">accio/)
  assert.doesNotMatch(html,/<option value="Acció"/)
  assert.equal(html.includes('Afegeix un gènere…'),owner)
  assert.doesNotMatch(html,/<input/)
 }
 for(const kind of ['exemplar','experiencia'] as const) {
  const html=render(kind)
  assert.match(html,/<select[^>]*name="genere_principal"/)
  assert.doesNotMatch(html,/<input[^>]*name="genere_principal"/)
 }
})

test('both existing editor form variants use the genre dropdown and retain the stored genre spelling',async()=>{
 const {RecordEditor}=await import('../src/components/record-editor')
 for(const kind of ['exemplar','experiencia'] as const) {
  const client=new QueryClient({defaultOptions:{queries:{retry:false}}});const session={user:{id:'genre-editor-synthetic'}} as Session
  client.setQueryData(['access',session.user.id],true)
  const game={...catalog.jocs[0],genere_principal:' Acció ',plataforma_resolta:true}
  const record={id:'record',joc_id:game.id,format:'fisic',a_la_colleccio:true,any_jugat:2026,completat:null,notes:null} as unknown as Catalog['exemplars'][number] & Catalog['experiencies'][number]
  const data={...catalog,jocs:[game],exemplars:kind==='exemplar' ? [record] : [],experiencies:kind==='experiencia' ? [record] : []}
  const html=renderToStaticMarkup(<AuthContext.Provider value={{session,loading:false,error:null}}><QueryClientProvider client={client}><RecordEditor kind={kind} record={record} game={game} catalog={data} creating onClose={()=>{}} onSaved={async()=>data}/></QueryClientProvider></AuthContext.Provider>)
  assert.match(html,/<select[^>]*name="genere_principal"/)
  assert.match(html,/<option value=" Acció " selected="">Acció/)
  assert.doesNotMatch(html,/<input[^>]*name="genere_principal"/)
 }
})

test('collection genre filters keep existing trim semantics after introducing genre dropdown',async()=>{
 const {CatalogPage}=await import('../src/pages/catalog-page')
 const {MemoryRouter}=await import('react-router-dom')
 const client=new QueryClient({defaultOptions:{queries:{retry:false}}});const session={user:{id:'genre-filter-synthetic'}} as Session
 client.setQueryData(['access',session.user.id],false)
 client.setQueryData(['catalog',session.user.id],{...catalog,jocs:[{...catalog.jocs[0],id:'action',nom:'Acció visible',genere_principal:' Acció '},{...catalog.jocs[0],id:'role',nom:'Rol exclòs',genere_principal:'Rol'}],exemplars:[{id:'one',joc_id:'action',format:'fisic',a_la_colleccio:true},{id:'two',joc_id:'role',format:'fisic',a_la_colleccio:true}]})
 const html=renderToStaticMarkup(<AuthContext.Provider value={{session,loading:false,error:null}}><QueryClientProvider client={client}><MemoryRouter initialEntries={['/?vista=colleccio&genere=Acci%C3%B3']}><CatalogPage/></MemoryRouter></QueryClientProvider></AuthContext.Provider>)
 assert.match(html,/Acció visible/);assert.doesNotMatch(html,/Rol exclòs/)
})

test('delete controls respect owner permissions and distinguish game/record while upper navigation stays absent',async()=>{
 const {DeleteRecord}=await import('../src/components/delete-record')
 for(const owner of [true,false]) {
  const client=new QueryClient({defaultOptions:{queries:{retry:false}}});const session={user:{id:'delete-synthetic'}} as Session
  client.setQueryData(['access',session.user.id],owner)
  for(const kind of ['joc','exemplar','experiencia'] as const) {
   const html=renderToStaticMarkup(<AuthContext.Provider value={{session,loading:false,error:null}}><QueryClientProvider client={client}><DeleteRecord target={{kind,id:'selected',ownerId:session.user.id,gameId:'game',updatedAt:'stamp'}} title="Prova" platform="Steam" onDeleted={async()=>{}}/></QueryClientProvider></AuthContext.Provider>)
   if(owner)assert.match(html,kind==='joc' ? /Elimina el joc definitivament/ : /Elimina el registre/)
   else assert.equal(html,'')
   assert.doesNotMatch(html,/Retira de la col·lecció|Torna a la col·lecció/)
  }
 }
})

test('permanent game deletion is offered only for an owner game with no copies, including historical, and no log entries',async()=>{
 const {GameOnlyDetail}=await import('../src/components/home-game-search')
 const game={...catalog.jocs[0],user_id:'orphan-owner',updated_at:'stamp'}
 for(const [copies,entries,allowed] of [[[],[],true],[[{joc_id:game.id,a_la_colleccio:false}],[],false],[[],[{joc_id:game.id}],false]] as const) {
  const client=new QueryClient({defaultOptions:{queries:{retry:false}}});const session={user:{id:'orphan-owner'}} as Session
  client.setQueryData(['access',session.user.id],true)
  const data={...catalog,jocs:[game],exemplars:copies,experiencies:entries} as unknown as Catalog
  const html=renderToStaticMarkup(<AuthContext.Provider value={{session,loading:false,error:null}}><QueryClientProvider client={client}><GameOnlyDetail row={{id:game.id,game,targets:[]}} catalog={data} onClose={()=>{}} onSaved={async()=>data}/></QueryClientProvider></AuthContext.Provider>)
  assert.equal(html.includes('Elimina el joc definitivament'),allowed)
  assert(html.includes('w-[min(94vw,1000px)]'))
 }
})

test('creation no longer offers retirement and scopes duplicate checks to collection versus log',()=>{
 for(const kind of ['exemplar','experiencia'] as const) {
  const client=new QueryClient({defaultOptions:{queries:{retry:false}}});const session={user:{id:'creation-delete-synthetic'}} as Session
  client.setQueryData(['access',session.user.id],true);client.setQueryData(['creation-version',session.user.id],true)
  const data={...catalog,exemplars:[{id:'copy',joc_id:'game',format:'digital',a_la_colleccio:true}]} as unknown as Catalog
  const html=renderToStaticMarkup(<AuthContext.Provider value={{session,loading:false,error:null}}><QueryClientProvider client={client}><RecordCreator kind={kind} catalog={data} initialGameId="game" onClose={()=>{}} onSaved={async()=>data}/></QueryClientProvider></AuthContext.Provider>)
  assert.doesNotMatch(html,/Confirmo conservar el digital|deixar[àa] de comptar com a actiu/)
  const submit=html.match(/<button[^>]*type="submit"[^>]*>/)?.[0]??''
  assert.equal(submit.includes('disabled=""'),kind==='exemplar')
 }
})

test('sidebar offers one direct icon theme selector after Settings to guests and owners',async()=>{
 const {MemoryRouter}=await import('react-router-dom')
 const {SettingsPage}=await import('../src/pages/settings-page')
 const {AppShell}=await import('../src/components/app-shell')
 const session={user:{id:'synthetic-owner'}} as Session
 for(const owner of [false,true]) {
  const client=new QueryClient({defaultOptions:{queries:{retry:false}}})
  client.setQueryData(['access',session.user.id],owner)
  const html=renderToStaticMarkup(<AuthContext.Provider value={{session,loading:false,error:null}}><QueryClientProvider client={client}><MemoryRouter><AppShell><SettingsPage/></AppShell></MemoryRouter></QueryClientProvider></AuthContext.Provider>)
  assert.equal((html.match(/aria-label="Tema de l’aplicació"/g)??[]).length,1)
  assert(html.indexOf('Tema de l’aplicació')>html.indexOf('>Configuració</a>'))
  assert.match(html,/lucide-sun/);assert.match(html,/lucide-moon/);assert.doesNotMatch(html,/lucide-monitor/)
  const settingsOnly=renderToStaticMarkup(<AuthContext.Provider value={{session,loading:false,error:null}}><QueryClientProvider client={client}><MemoryRouter><SettingsPage/></MemoryRouter></QueryClientProvider></AuthContext.Provider>)
  assert.doesNotMatch(settingsOnly,/Tema de l’aplicació/)
  assert.match(html,/aria-label="Clar" title="Clar"/)
  for(const label of ['Clar','Fosc'])assert.match(html,new RegExp(`aria-label="${label}" title="${label}"`))
  assert.match(html,/aria-label="Clar" title="Clar" aria-pressed="true"/)
  assert.match(html,/href="\/\?vista=configuracio"/)
  if(owner)assert.match(html,/Descarrega còpia de seguretat/)
  else assert.doesNotMatch(html,/Descarrega còpia de seguretat|Recupera una còpia|Exporta per consultar|Revisió de dades|Canvia la contrasenya/)
 }
})

test('deletion confirmation starts safely and only its explicit destructive button confirms',async()=>{
 const {DeletionConfirmation}=await import('../src/components/deletion-confirmation')
 const {Children,isValidElement}=await import('react')
 type Props={children?:import('react').ReactNode;onClick?:()=>void;autoFocus?:boolean;type?:string}
 for(const kind of ['exemplar','experiencia','joc'] as const) {
  let confirmed=0,cancelled=0
  const dialog=DeletionConfirmation({kind,title:'Joc sintètic',platform:'Steam',recordId:'synthetic',id:'confirmation',busy:false,error:'',actionLabel:kind==='joc'?'Elimina el joc definitivament':'Elimina el registre',dialogRef:{current:null},cancelRef:{current:null},onCancel:()=>{cancelled++},onConfirm:()=>{confirmed++}})
  const html=renderToStaticMarkup(dialog)
  assert.match(html,/Segur que vols eliminar aquest registre\? Aquesta acció no es pot desfer\./)
  assert.match(html,/Es conserven|Només es permet si/)
  assert.equal(confirmed,0)
  const controls:Props[]=[]
  function walk(node:import('react').ReactNode) {
   Children.forEach(node,child=>{if(isValidElement<Props>(child)){if(child.props.onClick)controls.push(child.props);walk(child.props.children)}})
  }
  walk(dialog)
  assert.equal(controls.length,2)
  assert.equal(controls[0].children,'Cancel·la');assert.equal(controls[0].autoFocus,true)
  controls[0].onClick!();assert.equal(cancelled,1);assert.equal(confirmed,0)
  let propagationStopped=false
  dialog.props.onCancel({preventDefault:()=>{},stopPropagation:()=>{propagationStopped=true}});dialog.props.onClose()
  assert.equal(propagationStopped,true)
  assert.equal(cancelled,3);assert.equal(confirmed,0)
  for(const repeat of [false,true]) {
   let prevented=false
   const target={}
   dialog.props.onKeyDown({key:'Enter',repeat,target,currentTarget:target,preventDefault:()=>{prevented=true}})
   assert.equal(prevented,true);assert.equal(confirmed,0)
  }
  controls[1].onClick!();assert.equal(confirmed,1)
 }
})

test('detail header orders owner actions, keeps one close and preserves the full-sized cover and growing comments',async()=>{
 const {RecordEditor}=await import('../src/components/record-editor')
 for(const owner of [true,false])for(const comments of ['', 'Primera línia\n'+'Comentaris llargs '.repeat(200)]) {
  const session={user:{id:'layout-owner'}} as Session
  const client=new QueryClient({defaultOptions:{queries:{retry:false}}})
  client.setQueryData(['access',session.user.id],owner)
  const game={...catalog.jocs[0],user_id:session.user.id,comentaris:comments,portada_url:'https://example.invalid/cover.jpg'}
  const copy={id:'layout-copy',joc_id:game.id,user_id:session.user.id,updated_at:'stamp',format:'fisic',a_la_colleccio:true,preu:0}
  const c={...catalog,jocs:[game],exemplars:[copy]} as unknown as Catalog
  const html=renderToStaticMarkup(<AuthContext.Provider value={{session,loading:false,error:null}}><QueryClientProvider client={client}><RecordEditor kind="exemplar" record={c.exemplars[0]} game={c.jocs[0]} catalog={c} onClose={()=>{}} onSaved={async()=>c}/></QueryClientProvider></AuthContext.Provider>)
  assert(html.includes('w-[min(94vw,1000px)]'))
  assert(html.includes('md:grid-cols-[clamp(16rem,28vw,20rem)_minmax(0,1fr)]'))
  assert(html.includes('max-w-80'))
  const header=html.slice(0,html.indexOf('</header>'))
  assert.equal((html.match(/>Tanca<\/button>/g)??[]).length,1)
  assert.match(header,/>Tanca<\/button>/)
  if(owner) {
   assert(header.indexOf('>Edita<')<header.indexOf('>Elimina el registre<'))
   assert(header.indexOf('>Elimina el registre<')<header.indexOf('>Tanca<'))
  } else assert.doesNotMatch(header,/>Edita<|>Elimina el registre</)
  assert.match(html,/h-full w-full object-cover object-center/)
  assert.match(html,/min-h-12 rounded-md border bg-background p-3/)
  assert.doesNotMatch(html,/<section class="border-t pt-4"><h3 class="text-sm font-semibold">Comentaris/)
  if(comments)assert(html.includes(comments))
 }
})

test('MobyGames is a safely encoded search link for collection, log and standalone games',async()=>{
 const {RecordDetails}=await import('../src/components/record-details')
 const title='Ōkami & Pokémon: "Prova" / #1?'
 const game={...catalog.jocs[0],nom:title}
 for(const kind of ['exemplar','experiencia','joc'] as const) {
  const record=kind==='joc'?null:{id:'synthetic',joc_id:game.id,format:'fisic',any_jugat:2026,preu:null}
  const html=renderToStaticMarkup(<RecordDetails kind={kind} record={record as Catalog['exemplars'][number]|Catalog['experiencies'][number]|null} game={game} catalog={{...catalog,jocs:[game]}} onViewCollection={()=>{}}/>)
  const link=html.match(/<a[^>]*aria-label="Cerca el joc a MobyGames"[^>]*>/)?.[0]
  assert(link)
  assert(link.includes(`href="https://www.mobygames.com/search/?q=${encodeURIComponent(title)}"`))
  assert.match(link,/target="_blank"/);assert.match(link,/rel="noopener noreferrer"/)
  assert.equal((html.match(/aria-label="Cerca el joc a MobyGames"/g)??[]).length,1)
  assert.doesNotMatch(html,/api\.mobygames|<iframe/)
 }
})

test('external search icons keep YouTube first, safe URLs, accessible labels and touch targets',async()=>{
 const {ExternalGameLinks}=await import('../src/components/external-game-links')
 const title='Ōkami & Pokémon / #1?'
 for(const platform of ['Nintendo Switch','Steam','Epic Games','itch.io','Emulador','']) {
  const html=renderToStaticMarkup(<ExternalGameLinks title={title} platform={platform}/>)
  const useful=platform==='Nintendo Switch'?platform:''
  const query=[title,useful,'trailer'].filter(Boolean).join(' ')
  assert(html.includes(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`))
  assert(html.includes(`https://www.mobygames.com/search/?q=${encodeURIComponent(title)}`))
  assert(html.indexOf('youtube.com/results')<html.indexOf('mobygames.com/search'))
  for(const label of ['Cerca el tràiler a YouTube','Cerca el joc a MobyGames']) {
   assert(html.includes(`aria-label="${label}" title="${label}"`))
  }
  assert.equal((html.match(/target="_blank" rel="noopener noreferrer"/g)??[]).length,2)
  assert.equal((html.match(/size-11/g)??[]).length,2)
  assert.equal((html.match(/focus-visible:outline-ring/g)??[]).length,2)
  assert.equal((html.match(/alt="" aria-hidden="true"/g)??[]).length,2)
  assert.doesNotMatch(html,/>Cerca|<iframe|api\.youtube|api\.mobygames/)
 }
})

test('all detail ratings are unique header badges and absent ratings leave no badge',async()=>{
 const {GameOnlyDetail}=await import('../src/components/home-game-search')
 const {RecordEditor}=await import('../src/components/record-editor')
 for(const rating of ['A++','A+','A','B','C','D',null] as const)for(const standalone of [false,true]) {
  const session={user:{id:'rating-owner'}} as Session,client=new QueryClient({defaultOptions:{queries:{retry:false}}})
  client.setQueryData(['access',session.user.id],false)
  const game={...catalog.jocs[0],valoracio:rating,user_id:session.user.id}
  const copy={id:'rating-copy',joc_id:game.id,user_id:session.user.id,format:'fisic',a_la_colleccio:true}
  const c={...catalog,jocs:[game],exemplars:standalone?[]:[copy]} as unknown as Catalog
  const detail=standalone?<GameOnlyDetail row={{id:game.id,game,targets:[]}} catalog={c} onClose={()=>{}} onSaved={async()=>c}/>:<RecordEditor kind="exemplar" record={c.exemplars[0]} game={game} catalog={c} onClose={()=>{}} onSaved={async()=>c}/>
  const html=renderToStaticMarkup(<AuthContext.Provider value={{session,loading:false,error:null}}><QueryClientProvider client={client}>{detail}</QueryClientProvider></AuthContext.Provider>)
  assert.equal((html.match(/aria-label="Valoració /g)??[]).length,rating?1:0)
  if(rating)assert(html.indexOf(`aria-label="Valoració ${rating}"`)<html.indexOf('</header>'))
  assert.doesNotMatch(html,/text-5xl/)
 }
})

test('game marks: creation controls, shared detail labels, collection/log filters and guest permissions',async()=>{
 const {MemoryRouter}=await import('react-router-dom')
 const {CatalogPage}=await import('../src/pages/catalog-page')
 const {RecordDetails}=await import('../src/components/record-details')
 const {RecordEditor}=await import('../src/components/record-editor')
 const {GameLabelFields}=await import('../src/components/game-label-fields')
 for(const kind of ['exemplar','experiencia'] as const){
  const html=render(kind)
  assert.match(html,/name="no_jugat"/);assert.match(html,/name="intencio_joc"/);assert.match(html,/>Vull jugar-hi</);assert.match(html,/>No vull jugar-hi</)
  assert.doesNotMatch(html,/<select name="intencio_joc"/)
 }
 const fields=renderToStaticMarkup(<GameLabelFields game={{no_jugat:true,intencio_joc:'no_vull'}}/>)
 assert.match(fields,/name="no_jugat"[^>]*checked=""/)
 assert.match(fields,/type="checkbox" checked=""\/>No vull jugar-hi/)
 assert.equal((fields.match(/type="checkbox"/g)??[]).length,3)
 assert.doesNotMatch(fields,/<select|Intenció de joc/)
 const marked={...catalog.jocs[0],nom:'Marcat',no_jugat:true,intencio_joc:'vull',per_infants:true} as Catalog['jocs'][number]
 const other={...marked,id:'other',nom:'Sense marques',no_jugat:false,intencio_joc:null}
 const copy={id:'copy',joc_id:marked.id,format:'digital',a_la_colleccio:true,favorit:true}
 const entry={id:'entry',joc_id:marked.id,any_jugat:2026,completat:null,jugant:true}
 const c={...catalog,jocs:[marked,other],exemplars:[copy,{...copy,id:'copy2',joc_id:'other'}],experiencies:[entry,{...entry,id:'entry2',joc_id:'other'}]} as unknown as Catalog
 const session={user:{id:'synthetic-owner'}} as Session
 function wrapper(node:React.ReactNode,url='/?vista=colleccio',owner=false){
  const client=new QueryClient({defaultOptions:{queries:{retry:false}}})
  client.setQueryData(['access',session.user.id],owner);client.setQueryData(['catalog',session.user.id],c)
  return renderToStaticMarkup(<AuthContext.Provider value={{session,loading:false,error:null}}><QueryClientProvider client={client}><MemoryRouter initialEntries={[url]}>{node}</MemoryRouter></QueryClientProvider></AuthContext.Provider>)
 }
 for(const kind of ['exemplar','experiencia'] as const){
  const record=kind==='exemplar'?c.exemplars[0]:c.experiencies[0]
  const detail=wrapper(<RecordDetails kind={kind} record={record} game={marked} catalog={c} onViewCollection={()=>{}}/>)
  assert.match(detail,/>No jugat</);assert.match(detail,/>Vull jugar-hi</);assert.doesNotMatch(detail,/>No vull jugar-hi</)
  const guest=wrapper(<RecordEditor kind={kind} record={record} game={marked} catalog={c} onClose={()=>{}} onSaved={async()=>c}/> )
  assert.doesNotMatch(guest,/<form|name="no_jugat"|>Edita</)
  const editing=wrapper(<RecordEditor kind={kind} record={record} game={marked} catalog={c} creating onClose={()=>{}} onSaved={async()=>c}/>,undefined,true)
  assert.match(editing,/name="no_jugat"[^>]*checked=""/)
  assert.match(editing,/>No jugat</);assert.match(editing,/>Vull jugar-hi</);assert.match(editing,/>No vull jugar-hi</)
  assert.doesNotMatch(editing,/<select name="intencio_joc"/)
  assert(editing.indexOf('Etiquetes de la fitxa de videojoc') < editing.indexOf('<summary'))
  assert.match(editing,/type="checkbox" checked=""\/>Vull jugar-hi/)
 }
 for(const history of [false,true]){
  const filtered=wrapper(<CatalogPage history={history}/>,`/?vista=${history?'jugats':'colleccio'}&no_jugat=1&intencio_joc=vull&plataforma=Steam&format=digital`)
  assert.match(filtered,/Marcat/);assert.doesNotMatch(filtered,/Sense marques/)
  assert.match(filtered,/aria-pressed="true"[^>]*>Vull jugar-hi</);assert.doesNotMatch(filtered,/Filtra per intenció de joc/)
  assert.doesNotMatch(filtered,/>Afegeix (?:un joc|una entrada)</)
 }
})
