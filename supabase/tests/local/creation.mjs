// PostgreSQL aïllat: només metadades privades i registres sintètics; cap connexió remota.
import process from 'node:process'
import console from 'node:console'
import { jointSql, templateStop } from '../../../scripts/altes-noms.mjs'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { reconstructSchema } from './reconstruct-schema.mjs'
const { PGlite } = await import(process.env.TSUMIGE_PGLITE_MODULE ?? '/tmp/tsumige-pg-tests/node_modules/@electric-sql/pglite/dist/index.js')
const db = new PGlite()
const owner='11111111-1111-4111-8111-111111111111', guest='22222222-2222-4222-8222-222222222222'
let sequence=10
const id=()=>`aaaaaaaa-aaaa-4aaa-8aaa-${String(sequence++).padStart(12,'0')}`
const game=(name='Prova',platform='Steam')=>({nom:name,plataforma:platform,generos_secundaris:[],valoracio:'A+',comentaris:'Compartit',per_infants:true})
const call=async(kind,gid,fitxa,data,extra={})=>(await db.query('select public.alta_registre($1,$2,$3,$4,$5,$6,$7,$8) result',[kind,extra.id??id(),gid,fitxa,data,extra.edit??false,extra.timestamp??null,extra.retire??null])).rows[0].result
const snapshot=async()=>JSON.stringify((await db.query("select (select jsonb_agg(t order by id) from public.fitxes_joc t) games,(select jsonb_agg(t order by id) from public.exemplars t) copies,(select jsonb_agg(t order by id) from public.experiencies t) entries")).rows)
const fails=async(action,pattern)=>{const before=await snapshot();await assert.rejects(action,pattern);assert.equal(await snapshot(),before)}
try {
 const report=JSON.parse(await readFile(process.argv[2],'utf8'))
 await db.exec(reconstructSchema(report))
 if(!report.columnes.some(c=>c.esquema==='public'&&c.taula==='fitxes_joc'&&c.nom==='plataforma_resolta'))await db.exec(await readFile('supabase/migrations/202610090001_plataforma.sql','utf8'))
 await db.exec((await jointSql()).replace(templateStop,''))
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[owner]);await db.exec('set role authenticated')
 const request=id(), copy=await call('exemplar',null,game(),{format:'digital',preu:0,any_compra:null},{id:request})
 assert.equal((await db.query('select preu from public.exemplars where id=$1',[copy.id])).rows[0].preu,'0.00')
 assert.equal((await db.query('select count(*)::int n from public.experiencies')).rows[0].n,0)
 const beforeRetry=await snapshot();assert.deepEqual(await call('exemplar',null,game(),{format:'digital',preu:0},{id:request}),copy);assert.equal(await snapshot(),beforeRetry)
 await fails(()=>call('exemplar',null,game(),{format:'fisic'}),/ALTA_JOC_EXISTENT/)
 const epic=await call('exemplar',null,game('Prova','Epic Games Store'),{format:'digital'})
 assert.notEqual(epic.joc_id,copy.joc_id)
 await call('exemplar',null,game('Nova','Consola nova'),{format:'fisic'})
 await fails(()=>call('exemplar',null,game('Emulat','Emulador'),{format:'digital'}),/ALTA_EMULADOR/)
 await fails(()=>call('experiencia',null,game('Rollback nou'),{any_jugat:2026,completat:'invalid'}),/constraint/)
 const emulated=await call('experiencia',null,game('Emulat','Emulador'),{any_jugat:2026,jugant:true})
 assert.equal((await db.query('select count(*)::int n from public.exemplars where joc_id=$1',[emulated.joc_id])).rows[0].n,0)
 await fails(()=>call('experiencia',copy.joc_id,{},{}),/ALTA_ANY/)
 const entry=await call('experiencia',copy.joc_id,game('Ignorat','PC'),{any_jugat:2026,jugant:true})
 const duplicate=await call('experiencia',copy.joc_id,{comentaris:'No aplicar'},{any_jugat:2026,jugant:false})
 assert.equal(duplicate.id,entry.id);assert.equal(duplicate.existent,true)
 assert.equal((await db.query('select comentaris from public.fitxes_joc where id=$1',[copy.joc_id])).rows[0].comentaris,'Compartit')
 await db.query('insert into public.experiencies(user_id,joc_id,any_jugat,jugant) values($1,$2,null,true)',[owner,copy.joc_id])
 await call('experiencia',copy.joc_id,{}, {any_jugat:2027,jugant:false})
 assert.equal((await db.query('select count(*)::int n from public.experiencies where joc_id=$1 and jugant',[copy.joc_id])).rows[0].n,0)
 assert.equal((await db.query('select count(*)::int n from public.experiencies where joc_id=$1 and any_jugat is null',[copy.joc_id])).rows[0].n,1)
 const timestamp=(await db.query('select updated_at from public.fitxes_joc where id=$1',[copy.joc_id])).rows[0].updated_at
 await fails(()=>call('experiencia',copy.joc_id,game(),{any_jugat:2028},{edit:true,timestamp:'2000-01-01'}),/ALTA_CANVI/)
 await fails(()=>call('experiencia',copy.joc_id,{...game(),valoracio:'D',comentaris:'Rollback'}, {any_jugat:2028,completat:'invalid'},{edit:true,timestamp}),/constraint/)
 await call('experiencia',copy.joc_id,{...game(),valoracio:'B',comentaris:'Actualitzat'}, {any_jugat:2028,jugant:true},{edit:true,timestamp})
 assert.equal((await db.query("select count(*)::int n from public.experiencies where joc_id=$1 and valoracio <> 'B'",[copy.joc_id])).rows[0].n,0)
 await fails(()=>call('exemplar',copy.joc_id,{}, {format:'fisic',preu:30}),/ALTA_CONFLICTE/)
 const old=(await db.query('select * from public.exemplars where id=$1',[copy.id])).rows[0]
 await fails(()=>call('exemplar',copy.joc_id,{}, {format:'fisic'}, {retire:{id:copy.id,updated_at:'2000-01-01'}}),/ALTA_CANVI/)
 // Error posterior a retirar el digital: valor booleà invàlid prova rollback complet.
 await fails(()=>call('exemplar',copy.joc_id,{}, {format:'fisic',no_localitzat:'invalid'}, {retire:{id:copy.id,updated_at:old.updated_at}}),/invalid input syntax/)
 const physical=await call('exemplar',copy.joc_id,{}, {format:'fisic',preu:30,any_compra:2026},{retire:{id:copy.id,updated_at:old.updated_at}})
 const historical=(await db.query('select * from public.exemplars where id=$1',[copy.id])).rows[0]
 assert.equal(historical.a_la_colleccio,false);assert.equal(historical.preu,old.preu);assert.equal(historical.any_compra,old.any_compra)
 assert.equal((await call('exemplar',copy.joc_id,{}, {format:'digital'})).id,physical.id)
 await db.query('insert into public.experiencies(user_id,joc_id,any_jugat) values($1,$2,2026)',[owner,copy.joc_id])
 await fails(()=>call('experiencia',copy.joc_id,{}, {any_jugat:2026}),/ALTA_MULTIPLES/)
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[guest])
 await fails(()=>call('experiencia',copy.joc_id,{}, {any_jugat:2029}),/ALTA_PERMIS/)
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",['33333333-3333-4333-8333-333333333333'])
 await fails(()=>call('experiencia',copy.joc_id,{}, {any_jugat:2029}),/ALTA_PERMIS/)
 await db.exec('reset role; set role anon')
 await assert.rejects(()=>call('experiencia',null,game(),{any_jugat:2026}),/permission denied/)
 console.log('PASS altes atòmiques: plataformes, 0/buit, duplicats, anys antics, Jugant global, valoració compartida, històric, reintent, rollback i permisos propietari/convidat/anon.')
} catch(error) { console.error(error.message, error.where ?? ''); process.exitCode=1 } finally { await db.close() }
