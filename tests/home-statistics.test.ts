import test from 'node:test'
import assert from 'node:assert/strict'
import {statistics} from '../src/lib/statistics'
import type {Catalog} from '../src/lib/catalog'
import {homeStatisticRows,homeStatisticLink,savedHomeStatistic} from '../src/lib/home-statistics'
const catalog={jocs:Array.from({length:7},(_,i)=>({id:String(i),plataforma:`Consola ${i}`,valoracio:i<2 ? 'A+' : null})),exemplars:Array.from({length:7},(_,i)=>({id:`c${i}`,joc_id:String(i),a_la_colleccio:i!==6,format:i%2?'digital':'fisic',preu:null,any_compra:null})),experiencies:[{joc_id:'0',any_jugat:2026},{joc_id:'0',any_jugat:2026},{joc_id:'0',any_jugat:2025},{joc_id:'1',any_jugat:null},{joc_id:'1',any_jugat:2021},{joc_id:'2',any_jugat:2027}]} as unknown as Catalog
// Càlculs públics amb dades sintètiques: cap connexió remota.
test('home years show at most five indicated years descending, non-consecutive and unique per game/year',()=>{
 assert.deepEqual(homeStatisticRows(catalog,'played'),[{label:'2027',value:1},{label:'2026',value:1},{label:'2025',value:1},{label:'2021',value:1}])
 for(const years of [[],[2001,1998],[2026,2020,2005,2000,1991],[2026,2020,2005,2000,1991,1985,1980]]) {
  const data={...catalog,experiencies:years.flatMap(year=>[{joc_id:'0',any_jugat:year},{joc_id:'0',any_jugat:year}])} as unknown as Catalog
  assert.equal(statistics(data).playedByYear.length,years.length)
  assert.deepEqual(homeStatisticRows(data,'played'),years.slice(0,5).map(year=>({label:String(year),value:1})))
 }
})
test('unique ratings and top five active platforms, deterministic ties across both formats',()=>{
 assert.equal(homeStatisticRows(catalog,'ratings').find(r=>r.label==='A+')?.value,2)
 assert.deepEqual(homeStatisticRows(catalog,'platforms').map(r=>r.label),['Consola 0','Consola 1','Consola 2','Consola 3','Consola 4'])
 assert.deepEqual(homeStatisticRows({jocs:[],exemplars:[],experiencies:[]},'platforms'),[])
})
test('links encode grades/platforms and default preference survives missing Storage',()=>{
 assert.equal(savedHomeStatistic(),'played')
 for(const [view,label,key] of [['played','2026','any'],['ratings','A++','valoracio'],['platforms','Epic Games','plataforma']] as const) {
  const query=new URL(homeStatisticLink(view,label),'https://example.invalid').searchParams
  assert.equal(query.get(key),label)
  assert.equal(query.has('joc'),false)
 }
})
