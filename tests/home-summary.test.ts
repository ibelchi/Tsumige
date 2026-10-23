import test from 'node:test'
import assert from 'node:assert/strict'
import { collectionRecords, collectionSummaryCards, summaryCardLink } from '../src/lib/collection-filters'
import { homeSummaryFixture } from './fixtures/home-summary-data'
const catalog=homeSummaryFixture()
test('five summaries count active collection rows, preserve copies and titles, percentages include unrated',()=>{
 const cards=collectionSummaryCards(catalog)
 assert.deepEqual(cards.map(c=>c.label),['Jocs físics','Jocs digitals','Vull jugar','Jocs top','Jocs MEH'])
 assert.deepEqual(cards.map(c=>c.count),[3,3,3,3,1])
 assert.equal(cards[3].percentage,'50,0 %');assert.equal(cards[4].percentage,'16,7 %')
 assert.equal(collectionRecords(catalog,new URLSearchParams()).length,6)
 for(const card of cards)assert.equal(collectionRecords(catalog,new URLSearchParams(card.href.slice(2))).length,card.count)
})
test('clean links, top is OR, and all existing filters combine with ratings',()=>{
 const top=new URLSearchParams(summaryCardLink('top').slice(2))
 assert.deepEqual(top.getAll('valoracio'),['A+','A++'])
 assert.deepEqual(collectionRecords(catalog,top).map(c=>c.id),['a-physical','a-digital','b-physical'])
 for(const key of ['physical','digital','wanted','top','meh'] as const){
  const params=new URLSearchParams(summaryCardLink(key).slice(2))
  for(const old of ['cerca','plataforma','genere','pagina','favorits','infants','no_jugat','joc'])assert.equal(params.has(old),false)
 }
 top.set('format','fisic');top.set('cerca','TÍTOL');top.set('plataforma','PC');top.set('genere','Acció');top.set('intencio_joc','vull');top.set('no_jugat','1');top.set('favorits','1')
 assert.deepEqual(collectionRecords(catalog,top).map(c=>c.id),['a-physical'])
 top.set('valoracio','D');assert.equal(collectionRecords(catalog,top).length,0)
 assert.equal(collectionRecords(catalog,new URLSearchParams('valoracio=Sense+valoració')).length,1)
})
test('empty collection, zero percentages, and a catalogue larger than one fetched page',()=>{
 const empty=collectionSummaryCards({...catalog,exemplars:[]})
 assert(empty.every(c=>c.count===0));assert.equal(empty[3].percentage,'0,0 %');assert.equal(empty[4].percentage,'0,0 %')
 const large={...catalog,exemplars:Array.from({length:701},(_,i)=>({...catalog.exemplars[0],id:`copy-${i}`}))}
 const cards=collectionSummaryCards(large)
 assert.deepEqual(cards.map(c=>c.count),[701,0,701,701,0]);assert.equal(cards[3].percentage,'100,0 %')
})
