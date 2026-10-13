import test from 'node:test'
import assert from 'node:assert/strict'
import { reconcileRandomGames, renewRandomGames, eligibleRandomGames, randomVisit, savedRandomFilter, renewFilterSelection } from '../src/lib/random-collection.ts'
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

test('Top grades restrict active covered games without changing favorites, including multiple copies',()=>{
 const catalog={jocs:[
  {id:'a',plataforma:'Steam',portada_url:'cover',valoracio:'A+'},
  {id:'b',plataforma:'PC',portada_url:'wide',valoracio:null},
  {id:'c',plataforma:'XBOX',portada_url:'cover',valoracio:'A++'},
  {id:'d',plataforma:'PC',portada_url:null,valoracio:'A++'},
  {id:'e',plataforma:'PC',portada_url:'cover',valoracio:'A++'},
  {id:'f',plataforma:'Emulador',portada_url:'cover',valoracio:'A++'},
 ],exemplars:[
  {joc_id:'a',a_la_colleccio:true,favorit:false},
  {joc_id:'b',a_la_colleccio:true,favorit:true},{joc_id:'b',a_la_colleccio:true,favorit:true},
  {joc_id:'c',a_la_colleccio:true,favorit:true},{joc_id:'d',a_la_colleccio:true,favorit:true},
  {joc_id:'e',a_la_colleccio:false,favorit:true},{joc_id:'f',a_la_colleccio:true,favorit:true},
 ],experiencies:[]} as unknown as Catalog
 assert.deepEqual(eligibleRandomGames(catalog,'all'),['a','b','c'])
 assert.deepEqual(eligibleRandomGames(catalog,'best'),['a','c'])
 const changed=structuredClone(catalog);changed.jocs[0].valoracio='B'
 assert.deepEqual(reconcileRandomGames(['a','c'],eligibleRandomGames(changed,'best')),['c'])
 changed.exemplars=changed.exemplars.map(copy=>({...copy,favorit:false}))
 assert.deepEqual(eligibleRandomGames(changed,'best'),['c'])
})
test('each owner and filter keeps an independent selection; renew and eligibility repairs affect only that filter',()=>{
 randomVisit.set('filter-owner',['a','b','c'],'all')
 randomVisit.set('filter-owner',['a','d'],'best')
 randomVisit.set('filter-owner',renewRandomGames(randomVisit.get('filter-owner','best'),['a','d','e'],()=>0),'best')
 assert.deepEqual(randomVisit.get('filter-owner','all'),['a','b','c'])
 assert.deepEqual(randomVisit.get('other-owner','best'),[])
 const replaced=reconcileRandomGames(['a','b','c'],['a','c','d'],()=>0)
 assert.deepEqual(replaced,['a','d','c'])
 randomVisit.set('filter-owner',replaced,'all')
 assert.deepEqual(randomVisit.get('filter-owner','all'),['a','d','c'])
})

test('every filter click renews including active clicks, without altering the other filter',()=>{
 const catalog={jocs:['a','b','c','d','e'].map(id=>({id,plataforma:'PC',portada_url:'cover',valoracio:'A+'})),exemplars:['a','b','c','d','e'].map(joc_id=>({joc_id,a_la_colleccio:true})),experiencies:[]} as unknown as Catalog
 randomVisit.set('click-owner',['a','b','c'],'best')
 randomVisit.set('click-owner',['a','b','c'],'all')
 for(let i=0;i<3;i++) {
  const previous=randomVisit.get('click-owner','best')
  renewFilterSelection('click-owner','best',catalog,()=>0)
  const next=randomVisit.get('click-owner','best')
  assert.equal(next.length,3);assert.equal(next.every(id=>previous.includes(id)),false)
  assert.deepEqual(randomVisit.get('click-owner','all'),['a','b','c'])
 }
})
test('legacy Favorites preference becomes All and unknown values default to All',()=>{
 const previous=Object.getOwnPropertyDescriptor(globalThis,'window')
 try {
  let value='favorites'
  Object.defineProperty(globalThis,'window',{configurable:true,value:{localStorage:{getItem:()=>value,setItem:(_key:string,next:string)=>{value=next}}}})
  assert.equal(savedRandomFilter(),'all');assert.equal(value,'all')
  value='best';assert.equal(savedRandomFilter(),'best')
  value='invalid';assert.equal(savedRandomFilter(),'all')
 } finally {if(previous)Object.defineProperty(globalThis,'window',previous);else Reflect.deleteProperty(globalThis,'window')}
})
