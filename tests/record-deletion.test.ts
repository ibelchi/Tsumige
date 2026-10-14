import test from 'node:test'
import assert from 'node:assert/strict'
import {runDeletion,deletionTable,deletionDescription,DeletionUncertain,type DeleteTarget,type DeletionIO} from '../src/lib/record-deletion'
const target:DeleteTarget={kind:'exemplar',id:'copy1',gameId:'game1',ownerId:'owner',updatedAt:'timestamp'}
test('deletes exactly the selected type/ID and preserves other records; authorization runs first',async()=>{
 for(const kind of ['exemplar','experiencia','joc'] as const) {
  const records=new Map([['selected',true],['other',true]])
  const calls:string[]=[]
  const io:DeletionIO={authorize:async()=>{calls.push('authorize')},remove:async item=>{assert.equal(item.kind,kind);assert.equal(item.id,'selected');calls.push('delete');records.delete(item.id)},exists:async item=>records.has(item.id)}
  assert.equal(await runDeletion(io,{...target,kind,id:'selected'}),'deleted')
  assert.equal(records.has('other'),true);assert.deepEqual(calls,['authorize','delete'])
 }
 assert.equal(deletionTable.experiencia,'experiencies')
 let calls=0
 const forbidden:DeletionIO={authorize:async()=>{throw Error('Sense permís')},remove:async()=>{calls++},exists:async()=>false}
 await assert.rejects(()=>runDeletion(forbidden,target),/Sense permís/);assert.equal(calls,0)
})
test('lost DELETE response is reconciled by read, never automatically retried',async()=>{
 let calls=0,present=true,readable=false
 const io:DeletionIO={authorize:async()=>{},remove:async()=>{calls++;present=false;throw Error('Network')},exists:async()=>{if(!readable)throw Error('Offline');return present}}
 await assert.rejects(()=>runDeletion(io,target),DeletionUncertain)
 assert.equal(calls,1)
 readable=true
 assert.equal(await runDeletion(io,target,true),'deleted');assert.equal(calls,1)
 present=true
 assert.equal(await runDeletion(io,target,true),'present');assert.equal(calls,1)
})
test('dependencies or changed timestamps leave the detail target present and report an error',async()=>{
 const io:DeletionIO={authorize:async()=>{},remove:async()=>{throw {code:'23503'}},exists:async()=>true}
 await assert.rejects(()=>runDeletion(io,{...target,kind:'joc'}),/històrics/)
 io.remove=async()=>{}
 await assert.rejects(()=>runDeletion(io,target),/continua existint/)
})

test('confirmations distinguish deletion scopes and explicitly preserve cover and shared data',()=>{
 for(const kind of ['exemplar','experiencia'] as const) {
  const description=deletionDescription(kind)
  assert.match(description,/Es conserven el joc amb la portada, la valoració i els comentaris/)
  assert.match(description,/entrades de log/)
  assert.match(description,/exemplars/)
 }
 assert.match(deletionDescription('joc'),/tampoc històric/)
 assert.match(deletionDescription('joc'),/No s’eliminaran fitxers de portada/)
})
