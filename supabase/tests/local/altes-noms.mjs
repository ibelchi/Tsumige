import process from 'node:process'
import console from 'node:console'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {reconstructSchema} from './reconstruct-schema.mjs'
import {guardedJoint,groupedJoint,recoverySql,canonical} from '../../../scripts/altes-noms.mjs'
import {compactJoint} from '../../../scripts/altes-noms-compact.mjs'
const {PGlite}=await import(process.env.TSUMIGE_PGLITE_MODULE??'/tmp/tsumige-pg-tests/node_modules/@electric-sql/pglite/dist/index.js')
const db=new PGlite()
try {
 let input=(await readFile(process.argv[2],'utf8')).replace(/^\uFEFF/,'').trim()
 if(!input.startsWith('{'))input=input.slice(input.indexOf('\n')+1).trim().slice(1,-1).replaceAll('""','"')
 const imported=JSON.parse(input), report=imported.esquema??imported
 await db.exec(reconstructSchema(report))
 if(!report.columnes.some(c=>c.esquema==='public'&&c.taula==='fitxes_joc'&&c.nom==='plataforma_resolta'))await db.exec(await readFile('supabase/migrations/202610090001_plataforma.sql','utf8'))
 const owner='11111111-1111-4111-8111-111111111111'
 for(const [i,p] of ['GB','GBA','N64','NDS','NES','SNES','MD','XBOX360','PS4','Famicom','MSX','XBOX','Xbox One'].entries()) {
  const id=`aaaaaaaa-aaaa-4aaa-8aaa-${String(i+1).padStart(12,'0')}`
  await db.query("insert into public.fitxes_joc(id,user_id,nom,plataforma,plataforma_resolta,valoracio,comentaris) values($1,$2,$3,$4,true,'A+','Preservat')",[id,owner,`Prova ${i}`,p])
  await db.query("insert into public.exemplars(user_id,joc_id,format,preu,origen) values($1,$2,'fisic',0,'{\"prova\":true}')",[owner,id])
  await db.query('insert into public.experiencies(user_id,joc_id,any_jugat) values($1,$2,null)',[owner,id])
 }
 const capture=async()=>{
  await db.exec('begin read only')
  const result=JSON.parse((await db.query(await readFile('supabase/inspection/ALTES-NOMS-CAPTURA-LECTURA.sql','utf8'))).rows[0].captura_altes_noms)
  await db.exec('rollback');return result
 }
 // Simular defaults globals insegurs: el rebut els ha d’eliminar explícitament.
 await db.exec('alter default privileges grant all on tables to public,anon,authenticated,service_role')
 const before=await capture();assert.equal(before.colisions.length,0)
 const sql=await guardedJoint(before)
 await db.exec("update public.fitxes_joc set comentaris='Canvi $guard$' where nom='Prova 0'")
 await assert.rejects(()=>db.exec(sql),/Dades canviades/);await db.exec('rollback')
 // Captura nova explícita només en aquesta prova sintètica; mai regenerar plans reals automàticament.
 const fresh=await capture()
 const executable=process.env.TSUMIGE_TEST_COMPACT==='1' ? (await compactJoint(fresh)).sql : await groupedJoint(fresh)
 if(process.env.TSUMIGE_TEST_COMPACT==='1') {
  for(const grant of ['grant select on pg_temp.tsumige_altes_noms_source to anon;',
   'grant select(payload) on pg_temp.tsumige_altes_noms_source to authenticated;']) {
   await assert.rejects(()=>db.exec(executable.replace('do $source_acl$',()=>grant+'\ndo $source_acl$')),/Captura amb permisos de tercers/)
   await db.exec('rollback')
   assert.deepEqual((await capture()).dades,fresh.dades)
  }
 }
 await assert.rejects(()=>db.exec(executable.replace(/\ncommit;\nselect jsonb_pretty/,()=>"do $$ begin raise exception 'Fallada sintètica després de DDL/dades'; end $$; commit; select jsonb_pretty")),/Fallada sintètica/);await db.exec('rollback')
 assert.deepEqual((await capture()).dades,fresh.dades)
 // Una concessió inesperada, també de columna, avorta abans del COMMIT.
 for(const grant of ['grant select on pg_temp.tsumige_altes_noms_receipt to anon;',
  'grant select(bundle) on pg_temp.tsumige_altes_noms_receipt to anon;']) {
  await assert.rejects(()=>db.exec(executable.replace('do $receipt_acl$',()=>grant+'\ndo $receipt_acl$')),/permisos concedits a tercers/)
  await db.exec('rollback')
  assert.deepEqual((await capture()).dades,fresh.dades)
 }
 await db.exec(executable)
 const after=await capture()
 assert.deepEqual(after.dades.exemplars,fresh.dades.exemplars);assert.deepEqual(after.dades.experiencies,fresh.dades.experiencies)
 for(const game of after.dades.fitxes_joc)assert.equal(game.plataforma,canonical(fresh.dades.fitxes_joc.find(g=>g.id===game.id).plataforma))
 const receipt=(await db.query('select bundle from pg_temp.tsumige_altes_noms_receipt')).rows[0].bundle
 assert.equal(receipt.verificat,true)
 if(process.env.TSUMIGE_TEST_COMPACT==='1')assert.equal((await db.query("select to_regclass('pg_temp.tsumige_altes_noms_source') p")).rows[0].p,null)
 assert.equal(receipt.seguretat_rebut.temporal,true)
 assert.equal(receipt.seguretat_rebut.rls,false)
 assert.match(receipt.seguretat_rebut.esquema,/^pg_temp_/)
 for(const flag of ['public_sense_permisos','anon_sense_permisos','authenticated_sense_permisos','service_role_sense_permisos'])assert.equal(receipt.seguretat_rebut[flag],true)
 assert.equal((await db.query("select to_regclass('public.tsumige_altes_noms_receipt') p")).rows[0].p,null)
 // Intentar llegir-lo en la mateixa sessió privilegiada sota els rols API:
 // fins i tot aquí els permisos ho impedeixen.
 for(const role of ['anon','authenticated','service_role']) {
  await db.exec('set role '+role)
  await assert.rejects(()=>db.query('select bundle from pg_temp.tsumige_altes_noms_receipt'),/permission denied/)
  await db.exec('reset role')
 }
 await db.exec('create role receipt_public_probe; set role receipt_public_probe')
 await assert.rejects(()=>db.query('select bundle from pg_temp.tsumige_altes_noms_receipt'),/permission denied/)
 await db.exec('reset role')
 assert.equal(receipt.totals.fitxes_joc,13)
 assert.equal(receipt.totals.exemplars,13)
 assert.equal(receipt.totals.experiencies,13)
 assert.deepEqual(receipt.despres.dades,after.dades)
 assert.deepEqual(receipt.despres.esquema,after.esquema)
 recoverySql(fresh,receipt.despres) // Validació independent del generador anterior.
 const rollback=receipt.reversio_sql
 // Còpies antigues amb tots els àlies aprovats, en una transacció de prova.
 await db.exec('begin')
 await db.query("select set_config('request.jwt.claim.sub',$1,true)",[owner])
 await db.exec('set local role authenticated')
 const payload={app:'tsumige',format_version:2,user_id:owner,fitxes_joc:fresh.dades.fitxes_joc,
  exemplars:fresh.dades.exemplars,experiencies:fresh.dades.experiencies,proposits:fresh.dades.proposits}
 await db.query('select public.restaurar_copia_plataforma($1,true,public.estat_restauracio())',[payload])
 const restored=(await db.query('select id,plataforma from public.fitxes_joc order by id')).rows
 for(const game of restored)assert.equal(game.plataforma,canonical(fresh.dades.fitxes_joc.find(g=>g.id===game.id).plataforma))
 const v1=globalThis.structuredClone(payload);v1.format_version=1
 for(const game of v1.fitxes_joc)delete game.plataforma_resolta
 await db.query('select public.restaurar_copia_plataforma($1,false,public.estat_restauracio())',[v1])
 assert.equal((await db.query('select count(*)::int n from public.fitxes_joc')).rows[0].n,13)
 await db.exec('rollback')
 await db.exec('begin')
 await db.exec("update public.fitxes_joc set comentaris='Edició posterior' where nom='Prova 0'")
 await assert.rejects(()=>db.exec(rollback.replace('begin isolation level serializable;','')),/Dades canviades després de COMMIT/)
 await db.exec('rollback')
 await db.exec('grant execute on function public.versio_altes() to anon')
 await assert.rejects(()=>db.exec(rollback),/Esquema\/permisos posteriors canviats/);await db.exec('rollback')
 await db.exec('revoke execute on function public.versio_altes() from anon')
 await db.exec(rollback)
 assert.deepEqual((await capture()).dades,fresh.dades)
 assert.equal((await db.query("select to_regprocedure('public.versio_altes()') p")).rows[0].p,null)
 // Un destí repetit fa fallar tota la tanda, també la creació de RPC.
 await db.query("insert into public.fitxes_joc(user_id,nom,plataforma,plataforma_resolta) values($1,'Prova 0','Game Boy',true)",[owner])
 const conflict=await capture();assert.equal(conflict.colisions.length,1)
 await assert.rejects(async()=>db.exec(await guardedJoint(conflict)),/Col·lisions/);await db.exec('rollback')
 console.log('PASS tanda conjunta amb resultat post-COMMIT i reversió sense segona consulta manual: captura READ ONLY, noms exactes, preservació/recuperació completa, dades desactualitzades i col·lisions rebutjades sense canvis parcials.')
}catch(error){console.error(error.message,error.where??'');process.exitCode=1}finally{await db.close()}
