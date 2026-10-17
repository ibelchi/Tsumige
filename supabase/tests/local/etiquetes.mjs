// Només PGlite en memòria i dades sintètiques. Cap connexió remota.
// node supabase/tests/local/etiquetes.mjs /ruta/privada/esquema.json
import assert from 'node:assert/strict'
import process from 'node:process'
import console from 'node:console'
import { URL } from 'node:url'
import { readFile } from 'node:fs/promises'
import { reconstructSchema } from './reconstruct-schema.mjs'
const { PGlite } = await import(process.env.TSUMIGE_PGLITE_MODULE ?? '/tmp/tsumige-etiquetes-test/node_modules/@electric-sql/pglite/dist/index.js')
const db = new PGlite()
const root = new URL('../../../', import.meta.url)
const read = file => readFile(new URL(file, root), 'utf8')
const owner = '11111111-1111-4111-8111-111111111111'
const guest = '22222222-2222-4222-8222-222222222222'
const gid = 'aaaaaaaa-aaaa-4aaa-8aaa-000000000001'
const eid = 'aaaaaaaa-aaaa-4aaa-8aaa-000000000002'
let sequence = 20
const id = () => `aaaaaaaa-aaaa-4aaa-8aaa-${String(sequence++).padStart(12, '0')}`
const signatures = [
 'public.desar_registre(text,uuid,jsonb,jsonb)',
 'public.alta_registre(text,uuid,uuid,jsonb,jsonb,boolean,timestamp with time zone,jsonb)',
 'public.restaurar_copia_legacy(jsonb,boolean,text)',
]
const metadata = async () => (await db.query(`select oid,proowner,proacl,prorettype,proargtypes::text,proargnames,prosecdef,proconfig,pg_get_functiondef(oid) definition from pg_proc where oid=any($1::regprocedure[]) order by oid`, [signatures])).rows
const data = async () => (await db.query(`select
 (select jsonb_agg(to_jsonb(j) order by id) from public.fitxes_joc j) games,
 (select jsonb_agg(to_jsonb(e) order by id) from public.exemplars e) copies,
 (select jsonb_agg(to_jsonb(e) order by id) from public.experiencies e) logs,
 (select jsonb_agg(to_jsonb(p) order by id) from public.proposits p) goals`)).rows
const tags = async (game = gid) => (await db.query('select no_jugat,intencio_joc from public.fitxes_joc where id=$1', [game])).rows[0]
const setTags = (played, intention) => db.query('update public.fitxes_joc set no_jugat=$1,intencio_joc=$2 where id=$3', [played, intention, gid])
const save = async payload => {
 const game = (await db.query('select to_jsonb(j) j from public.fitxes_joc j where id=$1', [gid])).rows[0].j
 delete game.no_jugat; delete game.intencio_joc
 return db.query('select public.desar_registre_plataforma($1,$2,$3,$4)', ['experiencia', eid, { ...game, ...payload }, { any_jugat: 2026, completat: 'si', valoracio: game.valoracio, jugant: true }])
}
const backup = async () => (await db.query(`select jsonb_build_object('app','tsumige','format_version',2,'user_id',$1::text,
 'fitxes_joc',coalesce((select jsonb_agg(to_jsonb(j)) from public.fitxes_joc j),'[]'),
 'exemplars',coalesce((select jsonb_agg(to_jsonb(e)) from public.exemplars e),'[]'),
 'experiencies',coalesce((select jsonb_agg(to_jsonb(e)) from public.experiencies e),'[]'),
 'proposits',coalesce((select jsonb_agg(to_jsonb(p)) from public.proposits p),'[]')) b`, [owner])).rows[0].b
const restore = async (b, update = true) => {
 const state = (await db.query('select public.estat_restauracio() s')).rows[0].s
 return db.query('select public.restaurar_copia($1,$2,$3)', [b, update, state])
}
const rejectUnchanged = async (action, pattern) => {
 const before = await data()
 await assert.rejects(action, pattern)
 assert.deepEqual(await data(), before)
}
try {
 if (!process.argv[2]) throw Error('Cal indicar una captura privada de metadades, sense registres reals.')
 const report = JSON.parse(await readFile(process.argv[2], 'utf8'))
 await db.exec(reconstructSchema(report))
 if (!report.funcions.some(f => f.signatura.replace(/^public\./, '').startsWith('alta_registre('))) {
  await db.exec(await read('supabase/migrations/202610110001_altes_atomiques.sql'))
 }
 await db.query("select set_config('request.jwt.claim.sub',$1,false)", [owner])
 await db.query(`insert into public.fitxes_joc(id,user_id,nom,plataforma,plataforma_resolta,per_infants,per_jugar_aviat,valoracio,comentaris) values($1,$2,'Sintètic','Steam',true,true,true,'A+','Comentari sintètic')`, [gid, owner])
 await db.query(`insert into public.experiencies(id,user_id,joc_id,any_jugat,valoracio,jugant) values($1,$2,$3,2026,'A+',true)`, [eid, owner, gid])
 const original = await data(), functions = await metadata()
 const migration = await read('supabase/migrations/202610170001_etiquetes_joc.sql')
 await db.exec(migration)
 assert.deepEqual(await tags(), { no_jugat: false, intencio_joc: null })
 const migrated = await data()
 for (const game of migrated[0].games) { delete game.no_jugat; delete game.intencio_joc }
 assert.deepEqual(migrated, original)
 const contract = f => { const copy = { ...f }; delete copy.definition; return copy }
 assert.deepEqual((await metadata()).map(contract), functions.map(contract))
 console.log('PASS migració, defaults, dades prèvies/timestamps, OID/signatures/propietari/ACL/config')
 await db.exec('set role authenticated')
 for (const played of [false, true]) for (const intention of [null, 'vull', 'no_vull']) {
  await save({ no_jugat: played, intencio_joc: intention })
  assert.deepEqual(await tags(), { no_jugat: played, intencio_joc: intention })
 }
 await setTags(true, 'vull')
 await save({ comentaris: 'Canvi client antic' })
 assert.deepEqual(await tags(), { no_jugat: true, intencio_joc: 'vull' })
 for (const payload of [{ no_jugat: null }, { no_jugat: 'false' }, { no_jugat: 1 }, { intencio_joc: 'invalid' }, { intencio_joc: false }]) {
  await rejectUnchanged(() => save(payload), /constraint|null value/)
 }
 console.log('PASS sis combinacions, clients antics, canvis independents, invàlids i rollback RPC')
 const old = await backup()
 for (const game of old.fitxes_joc) { delete game.no_jugat; delete game.intencio_joc }
 await restore(old)
 assert.deepEqual(await tags(), { no_jugat: true, intencio_joc: 'vull' })
 const fresh = globalThis.structuredClone(old.fitxes_joc[0]); fresh.id = id(); fresh.nom = 'Nou de còpia antiga'
 old.fitxes_joc.push(fresh)
 await restore(old)
 assert.deepEqual(await tags(fresh.id), { no_jugat: false, intencio_joc: null })
 const newer = await backup()
 newer.fitxes_joc[0].no_jugat = false; newer.fitxes_joc[0].intencio_joc = null
 await restore(newer)
 assert.deepEqual(await tags(), { no_jugat: false, intencio_joc: null })
 await setTags(true, 'no_vull')
 await restore(newer, false)
 assert.deepEqual(await tags(), { no_jugat: true, intencio_joc: 'no_vull' })
 const invalid = await backup(); invalid.fitxes_joc[0].no_jugat = 'true'
 await rejectUnchanged(() => restore(invalid), /Etiquetes/)
 const v1 = await backup(); v1.format_version = 1
 // v1 només pot inserir un ID nou; no sobreescriure plataformes ja resoltes.
 const v1game = globalThis.structuredClone(v1.fitxes_joc[0]); v1game.id = id(); v1game.nom = 'Còpia v1 sintètica'
 delete v1game.no_jugat; delete v1game.intencio_joc; delete v1game.plataforma_resolta
 v1.fitxes_joc = [v1game]; v1.experiencies = []; v1.exemplars = []; v1.proposits = []
 await restore(v1, false)
 assert.deepEqual(await tags(v1game.id), { no_jugat: false, intencio_joc: null })
 console.log('PASS restauració v1/v2, còpies antigues/noves, inserir/actualitzar/només afegir, invàlids')
 const newId = id()
 const result = (await db.query('select public.alta_registre($1,$2,$3,$4,$5,$6,$7,$8) r', ['experiencia', newId, null,
 { nom: 'Alta sintètica', plataforma: 'Steam', generos_secundaris: [], no_jugat: true, intencio_joc: 'vull' },
 { any_jugat: 2026 }, false, null, null])).rows[0].r
 assert.deepEqual(await tags(result.joc_id), { no_jugat: true, intencio_joc: 'vull' })
 await db.query("select set_config('request.jwt.claim.sub',$1,false)", [guest])
 await rejectUnchanged(() => save({ no_jugat: false }), /Registre no disponible|Sense permís/)
 assert.equal((await db.query('update public.fitxes_joc set no_jugat=false where id=$1 returning id', [gid])).rows.length, 0)
 await db.exec('reset role; set role anon')
 await assert.rejects(() => db.query('select no_jugat from public.fitxes_joc'), /permission denied/)
 await db.exec('reset role')
 console.log('PASS alta amb marques, convidat sense escriptura i anònim sense accés')
 await assert.rejects(() => db.exec(migration), /Camps ja presents/)
 await db.exec('rollback')
 // Reversió exclusivament local: originals capturats en memòria; cap script remot.
 await db.exec('begin')
 for (const f of functions) await db.exec(f.definition)
 await db.exec('alter table public.fitxes_joc drop constraint fitxes_joc_intencio_joc_check; alter table public.fitxes_joc drop column no_jugat, drop column intencio_joc; commit;')
 assert.deepEqual(await metadata(), functions)
 assert.equal((await db.query("select count(*)::int n from pg_attribute where attrelid='public.fitxes_joc'::regclass and attname in ('no_jugat','intencio_joc') and not attisdropped")).rows[0].n, 0)
 console.log('PASS reexecució bloquejada i reversió local de funcions/OID/ACL/columnes')
 // Error després del primer pedaç: tota la migració ha de revertir.
 const altaDefinition = functions.find(f => f.definition.includes('FUNCTION public.alta_registre')).definition
 await db.exec(altaDefinition.replace('update public.fitxes_joc set desenvolupadora=', 'update public.fitxes_joc set\n desenvolupadora='))
 await assert.rejects(() => db.exec(migration), /Ancoratge no únic/)
 await db.exec('rollback')
 assert.equal((await db.query("select count(*)::int n from pg_attribute where attrelid='public.fitxes_joc'::regclass and attname='no_jugat' and not attisdropped")).rows[0].n, 0)
 assert.equal((await metadata()).find(f => f.definition.includes('FUNCTION public.desar_registre(')).definition, functions.find(f => f.definition.includes('FUNCTION public.desar_registre(')).definition)
 console.log('PASS error d’ancoratge després de modificar una RPC: rollback DDL i funcions')
 const diagnostic = await read('supabase/diagnostics/verificar_etiquetes_previ.sql')
 await db.exec('begin read only')
 const rows = await db.query(diagnostic)
 await db.exec('rollback')
 assert.equal(rows.rows[0].informe_etiquetes.format, 'tsumige-etiquetes-esquema-v1')
 console.log('PASS consulta diagnòstica en PostgreSQL local, només metadades')
} catch (error) { console.error('FAIL', error.message, error.detail ?? '', error.where ?? '', 'position', error.position); process.exitCode = 1 } finally { await db.close() }
