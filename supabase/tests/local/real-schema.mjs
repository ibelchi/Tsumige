// Ús: node supabase/tests/local/real-schema.mjs /ruta/privada/informe.json-o.csv
// Només PostgreSQL en memòria; l'informe i el SQL reconstruït no es publiquen.
import process from 'node:process'
import console from 'node:console'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
const { PGlite } = await import(process.env.TSUMIGE_PGLITE_MODULE ?? '/tmp/tsumige-pg-tests/node_modules/@electric-sql/pglite/dist/index.js')
if (!process.argv[2]) throw Error('Indica la ruta privada de l’informe JSON/CSV.')
let input=(await readFile(process.argv[2],'utf8')).replace(/^\uFEFF/,'').trim()
if (!input.startsWith('{')) {
 const newline=input.indexOf('\n');assert.equal(input.slice(0,newline).trim().replaceAll('"',''),'informe_esquema')
 input=input.slice(newline+1).trim();assert(input.startsWith('"')&&input.endsWith('"'));input=input.slice(1,-1).replaceAll('""','"')
}
const report=JSON.parse(input)
assert.equal(report.format,'tsumige-esquema-plataforma-v1')
const {reconstructSchema}=await import('./reconstruct-schema.mjs')
const schema=reconstructSchema(report)
const db=new PGlite()
try {
 await db.exec(schema);console.log('PASS esquema públic, RPC, triggers i RLS reconstruïts de l’informe; Auth/Storage mínims locals.')
 const {testFinalRead}=await import('./final-read-check.mjs');await testFinalRead(db)
 for(const file of ['supabase/migrations/202610090001_plataforma.sql','supabase/tests/plataforma.sql','supabase/tests/local/conversion.sql','supabase/tests/local/rpc-permissions.sql','supabase/tests/local/timestamps.sql','supabase/tests/local/storage-permissions.sql']) {
  await db.exec(await readFile(file,'utf8'));console.log('PASS '+file)
 }
}catch(error){console.error(error.message,error.detail??'',error.where??'');process.exitCode=1}finally{await db.close()}
