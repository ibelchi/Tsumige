// Esquema contrastat i dades sintètiques; cap connexió remota.
import process from 'node:process'
import console from 'node:console'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {reconstructSchema} from './reconstruct-schema.mjs'
const {PGlite}=await import(process.env.TSUMIGE_PGLITE_MODULE??'/tmp/tsumige-pg-tests/node_modules/@electric-sql/pglite/dist/index.js')
const db=new PGlite()
const owner='11111111-1111-4111-8111-111111111111',guest='22222222-2222-4222-8222-222222222222'
const game='aaaaaaaa-aaaa-4aaa-8aaa-000000000001',orphan='aaaaaaaa-aaaa-4aaa-8aaa-000000000002'
const historicalGame='aaaaaaaa-aaaa-4aaa-8aaa-000000000003'
const c3='bbbbbbbb-bbbb-4bbb-8bbb-000000000003'
const c1='bbbbbbbb-bbbb-4bbb-8bbb-000000000001',c2='bbbbbbbb-bbbb-4bbb-8bbb-000000000002'
const e1='cccccccc-cccc-4ccc-8ccc-000000000001',e2='cccccccc-cccc-4ccc-8ccc-000000000002'
try {
 await db.exec(reconstructSchema(JSON.parse(await readFile(process.argv[2],'utf8'))))
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[owner]);await db.exec('set role authenticated')
 for(const id of [game,orphan,historicalGame])await db.query("insert into public.fitxes_joc(id,user_id,nom,plataforma,plataforma_resolta,valoracio,comentaris,portada_url) values($1,$2,'Joc sintètic','Steam',true,'A+','Comentaris preservats','https://example.invalid/cover.jpg')",[id,owner])
 await db.query("insert into public.exemplars(id,user_id,joc_id,format,any_compra,preu,a_la_colleccio) values($1,$3,$4,'fisic',2020,13,true),($2,$3,$4,'digital',2019,0,false)",[c1,c2,owner,game])
 await db.query("insert into public.experiencies(id,user_id,joc_id,any_jugat,completat) values($1,$3,$4,2026,'si'),($2,$3,$4,2025,null)",[e1,e2,owner,game])
 await db.query("insert into public.exemplars(id,user_id,joc_id,format,a_la_colleccio) values($1,$2,$3,'fisic',false)",[c3,owner,historicalGame])
 await assert.rejects(()=>db.query('delete from public.fitxes_joc where id=$1',[historicalGame]),/foreign key/)
 const snapshot=async()=> (await db.query('select to_jsonb(j) game from public.fitxes_joc j where id=$1',[game])).rows
 const before=await snapshot()
 const historic=(await db.query('select to_jsonb(e) copy from public.exemplars e where id=$1',[c2])).rows
 await assert.rejects(()=>db.query('delete from public.fitxes_joc where id=$1',[game]),/foreign key/)
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[guest])
 await db.query('delete from public.exemplars where id=$1',[c1]);await db.query('delete from public.experiencies where id=$1',[e1]);await db.query('delete from public.fitxes_joc where id=$1',[orphan])
 assert.equal((await db.query('select count(*)::int n from public.exemplars where id=$1',[c1])).rows[0].n,1)
 assert.equal((await db.query('select count(*)::int n from public.experiencies where id=$1',[e1])).rows[0].n,1)
 assert.equal((await db.query('select count(*)::int n from public.fitxes_joc where id=$1',[orphan])).rows[0].n,1)
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[owner])
 const counts=async()=> (await db.query(`select (select count(*)::int from public.exemplars where a_la_colleccio) active, (select count(*)::int from public.experiencies) logs`)).rows[0]
 assert.deepEqual(await counts(),{active:1,logs:2})
 await db.query('delete from public.exemplars where id=$1 and user_id=$2',[c1,owner])
 assert.deepEqual(await counts(),{active:0,logs:2})
 assert.equal((await db.query('select count(*)::int n from public.exemplars where id=$1',[c1])).rows[0].n,0)
 assert.deepEqual(await snapshot(),before)
 assert.deepEqual((await db.query('select to_jsonb(e) copy from public.exemplars e where id=$1',[c2])).rows,historic)
 await db.query('delete from public.experiencies where id=$1 and user_id=$2',[e1,owner])
 assert.deepEqual(await snapshot(),before)
 assert.equal((await db.query('select count(*)::int n from public.experiencies where id=$1',[e2])).rows[0].n,1)
 assert.deepEqual(await counts(),{active:0,logs:1})
 assert.equal((await db.query('select count(*)::int n from public.experiencies where id=$1',[e1])).rows[0].n,0)
 await assert.rejects(()=>db.query('delete from public.fitxes_joc where id=$1',[game]),/foreign key/)
 // The initially orphaned game gains links, then becomes orphaned again: no cascade.
 await db.query("insert into public.exemplars(user_id,joc_id,format,a_la_colleccio) values($1,$2,'digital',true)",[owner,orphan])
 await db.query('insert into public.experiencies(user_id,joc_id,any_jugat) values($1,$2,2026)',[owner,orphan])
 const orphanBefore=(await db.query('select to_jsonb(j) game from public.fitxes_joc j where id=$1',[orphan])).rows
 await db.query('delete from public.experiencies where joc_id=$1',[orphan])
 assert.equal((await db.query('select count(*)::int n from public.exemplars where joc_id=$1',[orphan])).rows[0].n,1)
 assert.deepEqual((await db.query('select to_jsonb(j) game from public.fitxes_joc j where id=$1',[orphan])).rows,orphanBefore)
 await db.query('delete from public.exemplars where joc_id=$1',[orphan])
 assert.deepEqual((await db.query('select to_jsonb(j) game from public.fitxes_joc j where id=$1',[orphan])).rows,orphanBefore)
 await db.query('delete from public.fitxes_joc where id=$1 and user_id=$2',[orphan,owner])
 assert.equal((await db.query('select count(*)::int n from public.fitxes_joc where id=$1',[orphan])).rows[0].n,0)
 assert.deepEqual(await snapshot(),before)
 console.log('PASS eliminació local: ID exacte, RLS de convidats, FK RESTRICT incloent històrics, joc/valoració/comentaris/altres registres preservats i joc sense vincles eliminable.')
} finally {await db.close()}
