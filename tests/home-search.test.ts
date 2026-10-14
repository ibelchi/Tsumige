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

test('after deletion, the other domain and finally the orphan game remain reachable by ID',()=>{
 const game={id:'linked',nom:'Joc conservat',plataforma:'Steam',valoracio:'A+',comentaris:'Comentaris',portada_url:'https://example.invalid/cover.jpg'}
 const catalog={jocs:[game],exemplars:[{id:'copy',joc_id:game.id,a_la_colleccio:true}],experiencies:[{id:'entry',joc_id:game.id,any_jugat:2026}]} as unknown as Catalog
 assert.equal(gameReviewTargets(catalog,game.id)[0].record.id,'copy')
 const withoutCopy={...catalog,exemplars:[]}
 assert.equal(gameReviewTargets(withoutCopy,game.id)[0].record.id,'entry')
 assert.deepEqual(homeSearchGames(withoutCopy,'conservat'),[game])
 const withoutEntry={...catalog,experiencies:[]}
 assert.equal(gameReviewTargets(withoutEntry,game.id)[0].record.id,'copy')
 assert.deepEqual(homeSearchGames(withoutEntry,'conservat'),[game])
 const orphan={...withoutCopy,experiencies:[]}
 assert.deepEqual(gameReviewTargets(orphan,game.id),[])
 assert.deepEqual(homeSearchGames(orphan,'conservat'),[game])
})
