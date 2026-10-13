import test from 'node:test'
import assert from 'node:assert/strict'
import { reconcileRandomGames, renewRandomGames, eligibleRandomGames, randomVisit } from '../src/lib/random-collection.ts'
import type { Catalog } from '../src/lib/catalog.ts'
test('selection survives remounts and unchanged or expanded catalog; replaces only ineligible slot',()=>{
 randomVisit.set('owner-a',['a','b','c'])
 assert.deepEqual(randomVisit.get('owner-a'),['a','b','c'])
 assert.deepEqual(randomVisit.get('owner-b'),[])
 assert.deepEqual(reconcileRandomGames(randomVisit.get('owner-a'),['a','b','c','d']),['a','b','c'])
 assert.deepEqual(reconcileRandomGames(['a','b','c'],['a','c','d'],()=>0),['a','d','c'])
 assert.deepEqual(reconcileRandomGames(['a','b','c'],['c']),['c'])
})
test('renew guarantees another set whenever alternatives exist; fewer than three and duplicate IDs',()=>{
 for(const random of [()=>0,()=>0.999]) {
  const result=renewRandomGames(['a','b','c'],['a','b','c','d'],random)
  assert.equal(result.length,3);assert.ok(result.includes('d'));assert.equal(new Set(result).size,3)
 }
 assert.deepEqual(renewRandomGames([],['a','a'],()=>0),['a'])
 assert.deepEqual(reconcileRandomGames([],['a','b'],()=>0).sort(),['a','b'])
})
test('eligibility includes active collection covers, excludes retired/no-cover/Emulator and duplicate copies',()=>{
 const catalog={jocs:[{id:'a',plataforma:'GB',portada_url:'cover'},{id:'b',plataforma:'Steam',portada_url:null},{id:'c',plataforma:'Emulador',portada_url:'cover'},{id:'d',plataforma:'PC',portada_url:'cover'}],exemplars:[{joc_id:'a',a_la_colleccio:true},{joc_id:'a',a_la_colleccio:true},{joc_id:'b',a_la_colleccio:true},{joc_id:'c',a_la_colleccio:true},{joc_id:'d',a_la_colleccio:false}],experiencies:[]} as unknown as Catalog
 assert.deepEqual(eligibleRandomGames(catalog),['a'])
})
