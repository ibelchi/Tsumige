import console from 'node:console'
import process from 'node:process'
const {PGlite}=await import(process.env.TSUMIGE_PGLITE_MODULE ?? '/tmp/tsumige-pg-tests/node_modules/@electric-sql/pglite/dist/index.js')
import {readFile} from 'node:fs/promises'
const db=new PGlite()
try {
 await db.exec(await readFile('supabase/tests/local/schema.sql','utf8'))
 await db.exec(await readFile('supabase/migrations/202610070006_restauracio.sql','utf8'))
 await db.exec("alter table public.fitxes_joc alter column comentaris set default 'sintetic@example.invalid'; create or replace function public.desar_registre(text,uuid,jsonb,jsonb) returns void language plpgsql as $$ begin raise exception 'api_key: secret_sintetic'; end $$;")
 const sql=await readFile('supabase/inspection/PLATAFORMA-ESQUEMA-LECTURA.sql','utf8')
 await db.exec('BEGIN READ ONLY')
 const result=await db.query(sql)
 await db.exec('ROLLBACK')
 if(result.rows[0].informe_esquema.includes('secret_sintetic') || result.rows[0].informe_esquema.includes('sintetic@example.invalid')) throw Error('Redacció fallida')
 const report=JSON.parse(result.rows[0].informe_esquema)
 if(report.funcions.length<7 || report.columnes.length<50 || !report.bucket_portades.length) throw Error('Informe incomplet')
 console.log('PASS consulta en transacció READ ONLY: '+report.columnes.length+' columnes, '+report.funcions.length+' funcions, '+report.politiques_rls.length+' polítiques; bucket privat='+!report.bucket_portades[0].public)
} catch(e) {console.error(e.message);process.exitCode=1} finally{await db.close()}
