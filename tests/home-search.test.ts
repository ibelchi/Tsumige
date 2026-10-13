import test from 'node:test'
import assert from 'node:assert/strict'
import type {Catalog} from '../src/lib/catalog'
import {homeSearchGames} from '../src/lib/home-search'
import {gameReviewTargets} from '../src/lib/data-review'
const c={jocs:[{id:'a',nom:'Pokémon Émeraude',plataforma:'Game Boy Advance'},{id:'b',nom:'Pokémon Émeraude',plataforma:'Emulador'},{id:'c',nom:'Sense vincles',plataforma:'PC'},{id:'d',nom:'Històric',plataforma:'Steam'}],exemplars:[{id:'copy',joc_id:'a',a_la_colleccio:true},{id:'copy2',joc_id:'a',a_la_colleccio:true},{id:'retired',joc_id:'d',a_la_colleccio:false}],experiencies:[{id:'log',joc_id:'b',any_jugat:2026},{id:'log2',joc_id:'b',any_jugat:2025}]} as unknown as Catalog
test('title search ignores case and accents, preserves platform-separated IDs and searches beyond collection',()=>{
 assert.deepEqual(new Set(homeSearchGames(c,' POKEMON emeraude ').map(g=>g.id)),new Set(['a','b']))
 assert.equal(homeSearchGames(c,'sense')[0].id,'c')
 assert.deepEqual(homeSearchGames(c,' '),[]);assert.deepEqual(homeSearchGames(c,'absent'),[])
 assert.deepEqual(homeSearchGames(c,'Emulador'),[])
})
test('targets follow IDs: active collection, logs, historical copies and no fabricated link',()=>{
 assert.deepEqual(gameReviewTargets(c,'a').map(t=>t.record.id),['copy','copy2'])
 assert.deepEqual(gameReviewTargets(c,'b').map(t=>t.record.id),['log','log2'])
 assert.deepEqual(gameReviewTargets(c,'c'),[])
 assert.equal(gameReviewTargets(c,'d')[0].record.id,'retired')
})
