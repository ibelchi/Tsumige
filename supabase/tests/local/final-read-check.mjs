import {readFile,writeFile,mkdtemp} from 'node:fs/promises'
import {execFileSync} from 'node:child_process'
import process from 'node:process'
import assert from 'node:assert/strict'
import console from 'node:console'
import {buildPlan} from '../../../scripts/plataforma-pla-privat.mjs'
export async function testFinalRead(db) {
 const decisions=[1,2,3].map(i=>({nom:'Sintètic '+i,plataforma:'Nintendo Switch',any_compra:2020,preu:i-1}))
 const template=await readFile('supabase/inspection/PLATAFORMA-DADES-LECTURA.sql','utf8')
 const sql=template.replace("'[]'::jsonb as decisions -- DECISIONS_PRIVADES", "'"+JSON.stringify(decisions).replaceAll("'","''")+"'::jsonb as decisions -- DECISIONS_PRIVADES")
 await db.exec(`insert into public.fitxes_joc(user_id,nom,plataforma) select '11111111-1111-4111-8111-111111111111','Sintètic '||i,case when i<=3 then 'Nintendo Switch' else 'PC' end from generate_series(1,453) i;
 insert into public.exemplars(user_id,joc_id,format,any_compra,preu) select j.user_id,j.id,f,2020,case when f='fisic' then right(j.nom,1)::int-1 else 7 end from public.fitxes_joc j cross join (values('fisic'),('digital')) x(f) where j.nom in ('Sintètic 1','Sintètic 2','Sintètic 3');
 insert into public.exemplars(user_id,joc_id,format,a_la_colleccio) select user_id,id,'digital',false from public.fitxes_joc where nom='Sintètic 4';
 insert into public.experiencies(user_id,joc_id,any_jugat) select j.user_id,j.id,year from public.fitxes_joc j cross join (values(null::smallint),(2023::smallint)) x(year) where j.nom in ('Sintètic 1','Sintètic 2','Sintètic 3');`)
 async function read(){await db.exec('begin read only');try{return JSON.parse((await db.query(sql)).rows[0].informe_dades)}finally{await db.exec('rollback')}}
 const report=await read();assert.deepEqual(report.bloquejos,[]);assert.equal(report.abans.fitxes,453);assert.equal(report.abans.exemplars,7);assert.equal(report.abans.bitacora,6);assert.equal(report.cobertura.entrades_sense_any,3);assert.equal(report.despres_previst.exemplars_actius,3)
 const plan=buildPlan(report);assert.equal(plan.estat,'preparat_per_revisar');assert.equal(plan.casos[0].preu,0);assert.equal(report.cobertura.fitxes_sense_fills,449)
 assert.equal(buildPlan(await read(),plan).diferencies.length,0)
 await db.exec("update public.exemplars set preu=null where format='fisic' and joc_id=(select id from public.fitxes_joc where nom='Sintètic 1')")
 const changed=buildPlan(await read(),plan);assert.equal(changed.estat,'bloquejat');assert(changed.diferencies.some(d=>d.camp==='preu'));assert.equal(changed.despres_previst,null)
 await db.exec("update public.exemplars set preu=0 where format='fisic' and joc_id=(select id from public.fitxes_joc where nom='Sintètic 1')")
 const changedBack=buildPlan(await read(),plan);assert.equal(changedBack.estat,'dades_canviades_revisar')
 await db.exec("insert into public.exemplars(user_id,joc_id,format) select user_id,id,'digital' from public.fitxes_joc where nom='Sintètic 1'")
 assert((await read()).bloquejos.some(msg=>msg.includes('Cas canviat')))
 await db.exec("delete from public.exemplars where id=(select id from public.exemplars where format='digital' and joc_id=(select id from public.fitxes_joc where nom='Sintètic 1') order by id desc limit 1)")
 await db.exec("insert into public.fitxes_joc(user_id,nom,plataforma) values('33333333-3333-4333-8333-333333333333','Un altre compte','PC')")
 assert((await read()).bloquejos.some(msg=>msg.includes('Propietari no identificat')))
 await db.exec("delete from public.fitxes_joc where user_id='33333333-3333-4333-8333-333333333333'")
 const fresh=buildPlan(await read());assert.equal(fresh.estat,'preparat_per_revisar')
 const temporary=await mkdtemp('/tmp/tsumige-plan-test-')
 await writeFile(temporary+'/informe.json',JSON.stringify(fresh.informe),{mode:0o600})
 execFileSync(process.execPath,['scripts/plataforma-pla-privat.mjs',temporary+'/informe.json',temporary+'/pla.json'])
 const replay=await readFile(temporary+'/pla.json.recomprovacio.sql','utf8')
 assert.equal(JSON.parse((await db.query(replay)).rows[0].informe_dades).bloquejos.length,0)
 const id=fresh.casos[0].joc_id
 await db.exec("update public.fitxes_joc set nom='Nom canviat' where id='"+id+"'")
 const renamed=buildPlan(JSON.parse((await db.query(replay)).rows[0].informe_dades),fresh)
 assert.equal(renamed.estat,'bloquejat');assert(renamed.diferencies.some(d=>d.camp==='nom'))
 await db.exec("update public.fitxes_joc set nom='Sintètic 1' where id='"+id+"'")
 const post=(await readFile('supabase/inspection/PLATAFORMA-DESPRES-LECTURA.sql','utf8')).replace("'{}'::jsonb as pla -- PLA_PRIVAT", "'"+JSON.stringify(fresh).replaceAll("'","''")+"'::jsonb as pla -- PLA_PRIVAT")
 assert.equal(JSON.parse((await db.query(post)).rows[0].informe_verificacio).coincideix,false)
 await db.exec('begin')
 try {
  const migration=(await readFile('supabase/migrations/202610090001_plataforma.sql','utf8')).replace('\nbegin;\n','\n').replace(/\ncommit;\s*$/,'\n')
  await db.exec(migration)
  await db.exec("select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true); set local role authenticated;")
  await db.exec("select public.convertir_plataformes(array["+fresh.digitals_a_retirar.map(id=>"'"+id+"'::uuid").join(',')+"],public.estat_restauracio())")
  assert.equal(JSON.parse((await db.query(post)).rows[0].informe_verificacio).coincideix,true)
  await db.exec("update public.fitxes_joc set comentaris='Canvi no previst' where nom='Sintètic 4'")
  assert.equal(JSON.parse((await db.query(post)).rows[0].informe_verificacio).coincideix,false)
 }finally{await db.exec('rollback')}
 await db.exec("delete from public.experiencies;delete from public.exemplars;delete from public.fitxes_joc;")
 console.log('PASS comprovació final READ ONLY: cobertura, 3 casos, zero, null canviat, empremtes i pla privat bloquejat davant canvis.')
}
