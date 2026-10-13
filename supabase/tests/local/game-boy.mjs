// Només metadades contrastades i PostgreSQL local amb dades sintètiques.
import process from 'node:process'
import console from 'node:console'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { reconstructSchema } from './reconstruct-schema.mjs'
const { PGlite } = await import(process.env.TSUMIGE_PGLITE_MODULE ?? '/tmp/tsumige-pg-tests/node_modules/@electric-sql/pglite/dist/index.js')
const db = new PGlite()
const owner='11111111-1111-4111-8111-111111111111'
const game='aaaaaaaa-aaaa-4aaa-8aaa-000000000001', duplicate='aaaaaaaa-aaaa-4aaa-8aaa-000000000002'
try {
 const report=JSON.parse(await readFile(process.argv[2],'utf8'))
 await db.exec(reconstructSchema(report))
 if(!report.columnes.some(c=>c.esquema==='public'&&c.taula==='fitxes_joc'&&c.nom==='plataforma_resolta'))await db.exec(await readFile('supabase/migrations/202610090001_plataforma.sql','utf8'))
 await db.query("insert into public.fitxes_joc(id,user_id,nom,plataforma,plataforma_resolta,valoracio,comentaris) values($1,$2,'Prova','GB',true,'A+','Preservat')",[game,owner])
 await db.query("insert into public.exemplars(user_id,joc_id,format,preu,any_compra) values($1,$2,'fisic',0,null)",[owner,game])
 await db.query("insert into public.experiencies(user_id,joc_id,any_jugat) values($1,$2,null)",[owner,game])
 await db.query("insert into public.fitxes_joc(id,user_id,nom,plataforma,plataforma_resolta) values($1,$2,'Prova','Game Boy',true)",[duplicate,owner])
 const migration=await readFile('supabase/migrations/202610120001_game_boy.sql','utf8')
 await assert.rejects(()=>db.exec(migration),/Coincidències/);await db.exec('rollback')
 assert.equal((await db.query("select public.normalitza_plataforma('GB') p")).rows[0].p,'GB')
 await db.query('delete from public.fitxes_joc where id=$1',[duplicate])
 const read=async()=> (await db.query('select to_jsonb(j)-\'plataforma\'-\'updated_at\' game,(select jsonb_agg(e) from public.exemplars e) copies,(select jsonb_agg(e) from public.experiencies e) entries from public.fitxes_joc j where id=$1',[game])).rows
 const before=await read()
 const oldGame=(await db.query('select * from public.fitxes_joc where id=$1',[game])).rows[0]
 const copies=(await db.query('select * from public.exemplars')).rows
 const entries=(await db.query('select * from public.experiencies')).rows
 const acl=(await db.query("select proacl::text acl from pg_proc where oid='public.normalitza_plataforma(text)'::regprocedure")).rows
 await db.exec(migration);assert.deepEqual(await read(),before)
 assert.deepEqual((await db.query("select proacl::text acl from pg_proc where oid='public.normalitza_plataforma(text)'::regprocedure")).rows,acl)
 assert.equal((await db.query('select plataforma from public.fitxes_joc where id=$1',[game])).rows[0].plataforma,'Game Boy')
 assert.equal((await db.query("select public.normalitza_plataforma(' gb ') p")).rows[0].p,'Game Boy')
 await db.exec(await readFile('supabase/migrations/202610110001_altes_atomiques.sql','utf8'))
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[owner]);await db.exec('set role authenticated')
 const payload={app:'tsumige',format_version:2,user_id:owner,fitxes_joc:[oldGame],exemplars:copies,experiencies:entries,proposits:[]}
 const restore=async(value,update)=>db.query('select public.restaurar_copia_plataforma($1,$2,public.estat_restauracio())',[value,update])
 await restore(payload,true)
 assert.equal((await db.query('select plataforma from public.fitxes_joc where id=$1',[game])).rows[0].plataforma,'Game Boy')
 const withoutUpdate=rows=>rows.map(({updated_at: _timestamp,...row})=>{ void _timestamp; return row })
 assert.deepEqual(withoutUpdate((await read())[0].copies),withoutUpdate(before[0].copies));assert.deepEqual(withoutUpdate((await read())[0].entries),withoutUpdate(before[0].entries))
 const v1=globalThis.structuredClone(payload);v1.format_version=1;delete v1.fitxes_joc[0].plataforma_resolta
 await restore(v1,false)
 assert.equal((await db.query('select plataforma_resolta from public.fitxes_joc where id=$1',[game])).rows[0].plataforma_resolta,true)
 await assert.rejects(()=>restore(v1,true),/còpia antiga/)
 await assert.rejects(()=>db.query("select public.alta_registre('exemplar','aaaaaaaa-aaaa-4aaa-8aaa-000000000003',null,$1,$2,false,null,null)",[{nom:'Prova',plataforma:'GB',generos_secundaris:[]},{format:'fisic'}]),/ALTA_JOC_EXISTENT/)
 console.log('PASS Game Boy: conversió sense canviar IDs/vincles/dades relacionades, col·lisions bloquejades amb rollback, normalització, ACL preservades, restauració v1/v2 i prevenció de duplicats a la RPC.')
} catch(error) { console.error(error.message,error.where??'');process.exitCode=1 } finally { await db.close() }
