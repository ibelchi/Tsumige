import test from 'node:test'
import assert from 'node:assert/strict'
import {collectionQuickFilter,toggleCollectionQuickFilter} from '../src/lib/collection-quick-filter'
test('none -> favorites -> children -> none, preserving navigation filters',()=>{
 let params=new URLSearchParams('vista=colleccio&plataforma=Steam&format=digital&presentacio=list&cerca=prova')
 const original=params.toString()
 assert.equal(collectionQuickFilter(params),null)
 params=toggleCollectionQuickFilter(params,'favorits');assert.equal(collectionQuickFilter(params),'favorits');assert.equal(params.has('infants'),false)
 params=toggleCollectionQuickFilter(params,'infants');assert.equal(collectionQuickFilter(params),'infants');assert.equal(params.has('favorits'),false)
 params=toggleCollectionQuickFilter(params,'infants');assert.equal(collectionQuickFilter(params),null);assert.equal(params.toString(),original)
 params=toggleCollectionQuickFilter(params,'favorits');params=toggleCollectionQuickFilter(params,'favorits');assert.equal(params.toString(),original)
})
test('legacy both filters means favorites; selecting children clears favorites',()=>{
 const params=new URLSearchParams('favorits=1&infants=1&format=fisic')
 assert.equal(collectionQuickFilter(params),'favorits')
 const next=toggleCollectionQuickFilter(params,'infants')
 assert.equal(collectionQuickFilter(next),'infants');assert.equal(next.has('favorits'),false);assert.equal(next.get('format'),'fisic')
})
