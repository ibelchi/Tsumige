// npm install --prefix /tmp/tsumige-pg-tests @electric-sql/pglite@0.5.8
// node supabase/tests/local/run.mjs
import console from 'node:console'
import process from 'node:process'
const { PGlite } = await import(process.env.TSUMIGE_PGLITE_MODULE ?? '/tmp/tsumige-pg-tests/node_modules/@electric-sql/pglite/dist/index.js')
import { readFile } from 'node:fs/promises'
const db = new PGlite()
try {
 for(const file of ['supabase/tests/local/schema.sql','supabase/migrations/202610070006_restauracio.sql','supabase/migrations/202610090001_plataforma.sql','supabase/tests/plataforma.sql','supabase/tests/local/conversion.sql']) {
  await db.exec(await readFile(file,'utf8')); console.log(`PASS ${file}`)
 }
} catch (error) { console.error(error.message, error.detail ?? '', error.where ?? ''); process.exitCode=1 } finally { await db.close() }
