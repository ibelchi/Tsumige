// Proves completes en PostgreSQL local; només metadades reals i registres sintètics.
import {readFile} from 'node:fs/promises'
import process from 'node:process'
import console from 'node:console'
import assert from 'node:assert/strict'
import {createFixture} from './transaction-fixture.mjs'
process.on('uncaughtException',error=>{console.error(error.message,error.detail??'',error.where??'');process.exit(1)})
const {PGlite}=await import(process.env.TSUMIGE_PGLITE_MODULE??'/tmp/tsumige-pg-tests/node_modules/@electric-sql/pglite/dist/index.js')
let input=(await readFile(process.argv[2],'utf8')).replace(/^\uFEFF/,'').trim()
if(!input.startsWith('{')){input=input.slice(input.indexOf('\n')+1).trim().slice(1,-1).replaceAll('""','"')}
const schemaReport=JSON.parse(input)
const [migration,readTemplate,postTemplate]=await Promise.all(['supabase/migrations/202610090001_plataforma.sql','supabase/inspection/PLATAFORMA-DADES-LECTURA.sql','supabase/inspection/PLATAFORMA-DESPRES-LECTURA.sql'].map(f=>readFile(f,'utf8')))
const guest='22222222-2222-4222-8222-222222222222',other='33333333-3333-4333-8333-333333333333'
const quote=x=>"'"+String(x).replaceAll("'","''")+"'"
const snapshotSql=`select md5(jsonb_build_array(
 (select jsonb_agg(to_jsonb(j) order by id) from public.fitxes_joc j),
 (select jsonb_agg(to_jsonb(e) order by id) from public.exemplars e),
 (select jsonb_agg(to_jsonb(b) order by id) from public.experiencies b),
 (select jsonb_agg(to_jsonb(p) order by id) from public.proposits p))::text) as hash`
async function setup(){return createFixture(PGlite,schemaReport,migration,readTemplate,postTemplate)}
async function rejection(name,change,pattern,mutateScript=x=>x){
 const {db,plan,sql}=await setup()
 try{
  if(change)await change(db,plan)
  const role=(await db.query('select current_user as role')).rows[0].role
  await db.exec('reset role')
  const before=(await db.query(snapshotSql)).rows[0].hash
  if(role!=='postgres')await db.exec('set role '+role)
  await assert.rejects(db.exec(mutateScript(sql)),pattern)
  // PostgreSQL deixa la transacció avortada; ROLLBACK també recupera DDL.
  await db.exec('rollback; reset role;')
  assert.equal((await db.query(snapshotSql)).rows[0].hash,before)
  assert.equal((await db.query("select count(*)::int n from information_schema.columns where table_schema='public' and table_name='fitxes_joc' and column_name='plataforma_resolta'")).rows[0].n,0)
  assert.equal((await db.query("select to_regprocedure('public.convertir_plataformes(uuid[],text)') is null as absent")).rows[0].absent,true)
  console.log('PASS rollback íntegre: '+name)
 }finally{await db.close()}
}
await rejection('comentari desactualitzat',db=>db.exec("update public.fitxes_joc set comentaris='Canvi posterior' where nom='Sintètic 5'"),/Dades desactualitzades/)
await rejection('compra física desactualitzada',async(db,p)=>db.exec('update public.exemplars set preu=99 where id='+quote(p.casos[0].fisic_id)),/Dades desactualitzades/)
await rejection('exemplar amb ID nou',db=>db.exec("update public.exemplars set id=gen_random_uuid() where joc_id=(select id from public.fitxes_joc where nom='Sintètic 8')"),/Dades desactualitzades/)
await rejection('RPC modificada',db=>db.exec("create or replace function public.pot_editar() returns boolean language sql stable as $$ select true $$"),/RPC\/funció diferent/)
await rejection('RLS modificades',db=>db.exec('alter table public.exemplars disable row level security'),/Esquema\/RLS diferents/)
await rejection('propòsit desactualitzat',db=>db.exec("update public.proposits set text='Canvi posterior' where text='Propòsit sintètic 1'"),/Dades desactualitzades/)
await rejection('convidat',db=>db.exec(`select set_config('request.jwt.claim.sub','${guest}',false);set role authenticated;`),/Cal el rol administratiu|permission denied/)
await rejection('anònim',db=>db.exec('set role anon'),/Cal el rol administratiu|permission denied/)
await rejection('fallada després de la conversió',null,/Resultat fora del pla/,sql=>sql.replace('do $after$',"update public.fitxes_joc set comentaris='Error sintètic després de conversió' where nom='Sintètic 5';\ndo $after$"))
const {db,plan,sql}=await setup()
try{
 await db.exec(sql)
 const post=postTemplate.replace("'{}'::jsonb as pla -- PLA_PRIVAT",quote(JSON.stringify(plan))+'::jsonb as pla -- PLA_PRIVAT')
 const report=JSON.parse((await db.query(post)).rows[0].informe_verificacio)
 assert.equal(report.coincideix,true);assert.deepEqual(report.actuals,plan.despres_previst)
 assert.equal((await db.query("select count(*)::int n from public.fitxes_joc where updated_at='2020-01-02'")).rows[0].n,0)
 await db.exec(`begin; select set_config('request.jwt.claim.sub','${guest}',true);set local role authenticated;`)
 assert.equal((await db.query('select count(*)::int n from public.exemplars')).rows[0].n,440)
 assert.equal((await db.query('update public.exemplars set favorit=true returning id')).rows.length,0)
 await assert.rejects(db.exec("select public.convertir_plataformes('{}',public.estat_restauracio())"),/Sense permís/);await db.exec('rollback')
 await db.exec(`begin; select set_config('request.jwt.claim.sub','${other}',true);set local role authenticated;`)
 assert.equal((await db.query('select count(*)::int n from public.exemplars')).rows[0].n,0);await db.exec('rollback')
 await db.exec('begin;set local role anon;');await assert.rejects(db.exec("select public.convertir_plataformes('{}','')"),/permission denied/);await db.exec('rollback')
 // Una segona execució falla abans de modificar dades.
 const before=(await db.query(snapshotSql)).rows[0].hash
 await assert.rejects(db.exec(sql),/Migració ja present/);await db.exec('rollback')
 assert.equal((await db.query(snapshotSql)).rows[0].hash,before)
 console.log('PASS script complet: 453 fitxes, 440 exemplars, 437 actius (218/219), 3 històrics, 201 entrades, 4 propòsits, 0 pendents; hashes i permisos conservats; reexecució rebutjada.')
}finally{await db.close()}
