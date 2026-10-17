import test from 'node:test'
import assert from 'node:assert/strict'
import { toggleGameIntentionFilter, toggleGameIntention, gameLabels, gameLabelFields, isGameIntention, matchesGameLabels, setGameLabelFilter } from '../src/lib/game-labels'
import { validateBackup, readRestoreArchive } from '../src/lib/restore-archive'
import { buildCsv } from '../src/lib/csv'
import { buildBackupArchive } from '../src/lib/backup-archive'
import type { Backup } from '../src/lib/backup'
const owner='11111111-1111-4111-8111-111111111111'
const gameId='22222222-2222-4222-8222-222222222222'
function fixture(): Backup {
 const stamp={created_at:'2026-10-17T10:00:00Z',updated_at:'2026-10-17T10:00:00Z'}
 return {app:'tsumige',format_version:2,exported_at:stamp.created_at,user_id:owner,
 fitxes_joc:[{...stamp,id:gameId,user_id:owner,nom:'Joc sintètic',plataforma:'Steam',plataforma_resolta:true,desenvolupadora:null,genere_principal:null,generos_secundaris:[],any_llancament:null,sinopsi:null,portada_url:null,per_jugar_aviat:true,per_infants:true,valoracio:null,comentaris:null}],
 exemplars:[{...stamp,id:'33333333-3333-4333-8333-333333333333',user_id:owner,joc_id:gameId,format:'digital',regio:null,estat_conservacio:null,notes:null,any_compra:null,preu:0,botiga_servei:null,favorit:true,canvi:false,reproduccio:false,no_localitzat:null,a_la_colleccio:true,revisat:false,origen:null}],
 experiencies:[{...stamp,id:'44444444-4444-4444-8444-444444444444',user_id:owner,joc_id:gameId,any_jugat:2026,completat:null,valoracio:null,notes:null,jugant:true,revisat:false}],proposits:[]}
}
test('six combinations: one independent flag and at most one intention; fields belong only to game',()=>{
 for(const no_jugat of [false,true])for(const intencio_joc of [null,'vull','no_vull'] as const){
  const form=new FormData();if(no_jugat)form.set('no_jugat','on');form.set('intencio_joc',intencio_joc??'')
  assert.deepEqual(gameLabelFields(form),{no_jugat,intencio_joc})
  const labels=gameLabels({no_jugat,intencio_joc})
  assert.equal(labels.includes('No jugat'),no_jugat)
  assert.equal(labels.includes('Vull jugar-hi'),intencio_joc==='vull')
  assert.equal(labels.includes('No vull jugar-hi'),intencio_joc==='no_vull')
  const backup=fixture();Object.assign(backup.fitxes_joc[0],gameLabelFields(form))
  validateBackup(backup,owner)
  assert.equal(backup.fitxes_joc[0].per_jugar_aviat,true);assert.equal(backup.experiencies[0].jugant,true)
  assert.equal(backup.exemplars[0].favorit,true);assert.equal(backup.fitxes_joc[0].per_infants,true)
 }
 assert.deepEqual(gameLabels({}),[]) // no log inference
 assert.equal(isGameIntention('both'),false)
 const invalid=new FormData();invalid.set('intencio_joc','both');assert.throws(()=>gameLabelFields(invalid))
})
test('filters combine independently and preserve all unrelated URL state',()=>{
 let params=new URLSearchParams('cerca=Prova&plataforma=Steam&format=digital&favorits=1&presentacio=list&any=2026')
 const before=params.toString()
 params=setGameLabelFilter(params,'no_jugat','1');params=setGameLabelFilter(params,'intencio_joc','vull')
 assert(matchesGameLabels({no_jugat:true,intencio_joc:'vull'},params))
 assert(!matchesGameLabels({no_jugat:false,intencio_joc:'vull'},params))
 assert(!matchesGameLabels({no_jugat:true,intencio_joc:'no_vull'},params))
 params=setGameLabelFilter(params,'intencio_joc','no_vull')
 assert.equal(params.getAll('intencio_joc').length,1)
 assert(matchesGameLabels({no_jugat:true,intencio_joc:'no_vull'},new URLSearchParams(params.toString())))
 params=setGameLabelFilter(params,'no_jugat','');params=setGameLabelFilter(params,'intencio_joc','')
 assert.equal(params.toString(),before)
 assert(matchesGameLabels({},params))
 assert(matchesGameLabels({},new URLSearchParams('intencio_joc=invalid')))
})
test('old backups keep missing keys missing; explicit false/null survive; malformed values rejected',()=>{
 for(const version of [1,2] as const){
  const b=fixture();b.format_version=version
  const validated=validateBackup(b,owner)
  assert(!Object.hasOwn(validated.fitxes_joc[0],'no_jugat'))
  assert(!Object.hasOwn(validated.fitxes_joc[0],'intencio_joc'))
 }
 for(const values of [{no_jugat:false,intencio_joc:null},{no_jugat:true},{intencio_joc:'vull'}]){
  const b=fixture();Object.assign(b.fitxes_joc[0],values)
  const validated=validateBackup(b,owner)
  for(const [key,value] of Object.entries(values))assert.equal((validated.fitxes_joc[0] as unknown as Record<string,unknown>)[key],value)
  if(!Object.hasOwn(values,'no_jugat'))assert(!Object.hasOwn(validated.fitxes_joc[0],'no_jugat'))
  if(!Object.hasOwn(values,'intencio_joc'))assert(!Object.hasOwn(validated.fitxes_joc[0],'intencio_joc'))
 }
 for(const values of [{no_jugat:null},{no_jugat:'true'},{no_jugat:1},{intencio_joc:'both'},{intencio_joc:false}]){
  const b=fixture();Object.assign(b.fitxes_joc[0],values);assert.throws(()=>validateBackup(b,owner))
 }
})
test('CSV and ZIP round-trip share game marks in collection and log without changing records',async()=>{
 const b=fixture();b.fitxes_joc[0].no_jugat=true;b.fitxes_joc[0].intencio_joc='no_vull'
 for(const kind of ['colleccio','historial'] as const){
  const csv=buildCsv(b,kind).content
  assert.match(csv,/"No jugat";"Intenció de joc"/)
  assert.match(csv,/;"Sí";"No vull jugar-hi"\r\n$/)
 }
 const archive=await buildBackupArchive(b,undefined,(async()=>{throw Error('No network expected')}) as typeof fetch)
 const restored=await readRestoreArchive(new Uint8Array(await archive.blob.arrayBuffer()),owner)
 assert.deepEqual(gameLabels(restored.backup.fitxes_joc[0]),['No jugat','No vull jugar-hi'])
 assert(!Object.hasOwn(restored.backup.exemplars[0],'no_jugat'))
 assert(!Object.hasOwn(restored.backup.experiencies[0],'intencio_joc'))
})

test('intention checkboxes: none → want → do not want → none, keeping No jugat independent',()=>{
 let intention=toggleGameIntention(null,'vull')
 assert.equal(intention,'vull')
 intention=toggleGameIntention(intention,'no_vull');assert.equal(intention,'no_vull')
 intention=toggleGameIntention(intention,'no_vull');assert.equal(intention,null)
 assert.equal(toggleGameIntention('vull','vull'),null)
 assert.deepEqual(gameLabels({no_jugat:true,intencio_joc:intention}),['No jugat'])
})

test('intention filter buttons switch, turn off and preserve independent and general URL filters',()=>{
 const initial=new URLSearchParams('vista=colleccio&no_jugat=1&infants=1&plataforma=Steam&format=digital&genere=Acció&cerca=Prova')
 let params=toggleGameIntentionFilter(initial,'vull');assert.equal(params.get('intencio_joc'),'vull')
 params=toggleGameIntentionFilter(params,'no_vull');assert.equal(params.get('intencio_joc'),'no_vull')
 assert.deepEqual(params.getAll('intencio_joc'),['no_vull'])
 params=toggleGameIntentionFilter(params,'no_vull');assert.equal(params.toString(),initial.toString())
})
