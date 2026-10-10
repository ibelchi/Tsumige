// Comprovació només local de la consulta complementària: no llegeix dades reals.
import {readFile} from 'node:fs/promises'
import process from 'node:process'
import console from 'node:console'
import assert from 'node:assert/strict'
import {reconstructSchema} from './reconstruct-schema.mjs'
const {PGlite}=await import(process.env.TSUMIGE_PGLITE_MODULE??'/tmp/tsumige-pg-tests/node_modules/@electric-sql/pglite/dist/index.js')
let input=(await readFile(process.argv[2],'utf8')).replace(/^\uFEFF/,'').trim()
if(!input.startsWith('{'))input=input.slice(input.indexOf('\n')+1).trim().slice(1,-1).replaceAll('""','"')
const db=new PGlite()
try{
 await db.exec(reconstructSchema(JSON.parse(input)))
 const technical='restriccio_tecnica_llarga_que_cal_conservar_sense_redactar'
 await db.exec(`alter table public.proposits add constraint ${technical} check ("any">0);
 create or replace function public.desar_registre(p_tipus text,p_id uuid,p_fitxa jsonb,p_dades jsonb) returns void language plpgsql as $$ begin raise exception 'api_key: secret_sintetic'; end $$;`)
 await db.exec('begin read only')
 const result=(await db.query(await readFile('supabase/inspection/PLATAFORMA-RECUPERACIO-ESQUEMA-LECTURA.sql','utf8'))).rows[0].informe_esquema
 await db.exec('rollback')
 assert(result.includes(technical));assert(!result.includes('secret_sintetic'))
 const report=JSON.parse(result)
 assert(report.cossos_omesos.some(x=>x.includes('desar_registre')))
 assert(report.funcions.some(x=>x.signatura_qualificada==='public.crear_registre(text, uuid, jsonb, jsonb)'||x.signatura_qualificada==='public.crear_registre(text,uuid,jsonb,jsonb)'))
 assert.equal(report.objectes_absents.length,0)
 console.log('PASS consulta complementària en READ ONLY: noms tècnics íntegres, RPC qualificades, ACL, cossos sospitosos omesos i absència d’escriptures.')
}catch(e){console.error(e.message);process.exitCode=1}finally{await db.close()}
