import {readFile} from 'node:fs/promises'
import process from 'node:process'
import console from 'node:console'
import assert from 'node:assert/strict'
import {createFixture} from './transaction-fixture.mjs'
import {captureBefore,captureAfter,buildRecovery,dataSnapshot,schemaSnapshot} from '../../../scripts/plataforma-recovery.mjs'
const {PGlite}=await import(process.env.TSUMIGE_PGLITE_MODULE??'/tmp/tsumige-pg-tests/node_modules/@electric-sql/pglite/dist/index.js')
process.on('uncaughtException',e=>{console.error(e.message,e.detail??'',e.where??'');process.exit(1)})
const schema=JSON.parse(await readFile(process.argv[2],'utf8'))
const [migration,read,post]=await Promise.all(['supabase/migrations/202610090001_plataforma.sql','supabase/inspection/PLATAFORMA-DADES-LECTURA.sql','supabase/inspection/PLATAFORMA-DESPRES-LECTURA.sql'].map(f=>readFile(f,'utf8')))
const unaffected=`select md5(jsonb_build_array((select jsonb_agg(to_jsonb(a) order by id) from auth.users a),(select jsonb_agg(to_jsonb(a) order by convidat_id) from public.accessos_convidats a),(select jsonb_agg(to_jsonb(a) order by id) from storage.buckets a),(select jsonb_agg(to_jsonb(a) order by id) from storage.objects a))::text) as hash`
const restored=await createFixture(PGlite,schema,migration,read,post),{db,plan,sql}=restored
try{
 await db.exec("insert into storage.objects(bucket_id,name,owner) values('tsumige-portades','11111111-1111-4111-8111-111111111111/prova.png','11111111-1111-4111-8111-111111111111')")
 const untouched=(await db.query(unaffected)).rows[0].hash
 const oid=(await db.query("select to_regprocedure('public.restaurar_copia(jsonb,boolean,text)')::oid as id")).rows[0].id
 await db.exec('begin read only')
 const before=JSON.parse((await db.query(captureBefore(plan,schema,read))).rows[0].recuperacio_abans);assert(before.valid)
 await db.exec('rollback')
 await db.exec(sql)
 const after=JSON.parse((await db.query(captureAfter(plan,schema,post))).rows[0].recuperacio_despres);assert(after.valid)
 assert.equal((await db.query(unaffected)).rows[0].hash,untouched)
 assert.equal((await db.query("select to_regprocedure('public.restaurar_copia_legacy(jsonb,boolean,text)')::oid as id")).rows[0].id,oid)
 const undo=buildRecovery(plan,schema,before,after)
 // No accepta dades anteriors falsificades ni revertir sobre una edició posterior.
 const bad=JSON.parse(JSON.stringify(before));bad.jocs[0].plataforma='Plataforma incorrecta'
 await assert.rejects(db.exec(buildRecovery(plan,schema,bad,after)),/Recuperació incompleta/);await db.exec('rollback')
 assert.equal((await db.query(dataSnapshot)).rows[0].data_md5,after.data_md5)
 assert.equal((await db.query(schemaSnapshot(schema))).rows[0].schema_md5,after.schema_md5)
 console.log('PASS rollback de reversió incorrecta: dades i DDL posteriors intactes.')
 await db.exec("update public.fitxes_joc set comentaris='Edició posterior a conservar' where nom='Sintètic 5'")
 const edited=(await db.query(dataSnapshot)).rows[0].data_md5
 await assert.rejects(db.exec(undo),/Estat posterior modificat/);await db.exec('rollback')
 assert.equal((await db.query(dataSnapshot)).rows[0].data_md5,edited)
 console.log('PASS refusada reversió sobre edició posterior; no es perd feina nova.')
}finally{await db.close()}
const fresh=await createFixture(PGlite,schema,migration,read,post)
try{
 const {db,plan,sql}=fresh
 await db.exec("insert into storage.objects(bucket_id,name,owner) values('tsumige-portades','11111111-1111-4111-8111-111111111111/prova.png','11111111-1111-4111-8111-111111111111')")
 const untouched=(await db.query(unaffected)).rows[0].hash
 const oid=(await db.query("select to_regprocedure('public.restaurar_copia(jsonb,boolean,text)')::oid as id")).rows[0].id
 await db.exec('begin read only')
 const before=JSON.parse((await db.query(captureBefore(plan,schema,read))).rows[0].recuperacio_abans);assert(before.valid)
 await db.exec('rollback')
 await db.exec(sql)
 assert.equal((await db.query(unaffected)).rows[0].hash,untouched)
 const after=JSON.parse((await db.query(captureAfter(plan,schema,post))).rows[0].recuperacio_despres)
 const undo=buildRecovery(plan,schema,before,after)
 await db.exec('set role anon;');await assert.rejects(db.exec(undo),/permission denied|Cal el rol administratiu/);await db.exec('rollback;reset role;')
 await db.exec(undo)
 assert.equal((await db.query(dataSnapshot)).rows[0].data_md5,before.plan_empremta)
 assert.equal((await db.query(schemaSnapshot(schema))).rows[0].schema_md5,before.schema_md5)
 assert.equal((await db.query(unaffected)).rows[0].hash,untouched)
 assert.equal((await db.query("select to_regprocedure('public.restaurar_copia(jsonb,boolean,text)')::oid as id")).rows[0].id,oid)
 console.log('PASS recuperació completa del pla: hashes de dades, timestamps, esquema/ACL/RLS i OID original exactes; Auth/convidats/Storage ficticis intactes, Bitàcora/propòsits preservats.')
}catch(e){console.error(e.message,e.detail??'',e.where??'');process.exitCode=1}finally{await fresh.db.close()}
