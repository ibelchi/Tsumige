import assert from 'node:assert/strict'
import {reconstructSchema} from './reconstruct-schema.mjs'
import {buildPlan} from '../../../scripts/plataforma-pla-privat.mjs'
import {buildTransaction} from '../../../scripts/plataforma-transaccio.mjs'
export async function createFixture(PGlite,schemaReport,migration,readTemplate,postTemplate){
 const schema=reconstructSchema(schemaReport),owner='11111111-1111-4111-8111-111111111111'
 const quote=x=>"'"+String(x).replaceAll("'","''")+"'"
 const decisions=[1,2,3].map(i=>({nom:'Sintètic '+i,plataforma:'Nintendo Switch',any_compra:2020,preu:i-1}))
 const read=readTemplate.replace("'[]'::jsonb as decisions -- DECISIONS_PRIVADES",quote(JSON.stringify(decisions))+'::jsonb as decisions -- DECISIONS_PRIVADES')
 const db=new PGlite();await db.exec(schema)
 await db.exec(`insert into public.fitxes_joc(user_id,nom,plataforma,created_at,updated_at) select '${owner}','Sintètic '||i,case when i<=3 then 'Nintendo Switch' when i=453 then 'Emulador' when i%4=0 then 'Epic Games Store' else 'PC' end,'2020-01-01','2020-01-02' from generate_series(1,453) i;
 insert into public.exemplars(user_id,joc_id,format,any_compra,preu,created_at,updated_at) select user_id,id,f,case when f='fisic' then 2020 else null end,case when f='fisic' then right(nom,1)::int-1 else null end,'2020-01-01','2020-01-02' from public.fitxes_joc cross join (values('fisic'),('digital')) x(f) where nom in ('Sintètic 1','Sintètic 2','Sintètic 3');
 insert into public.exemplars(user_id,joc_id,format,preu,created_at,updated_at) select user_id,id,'fisic',case when i%2=0 then 0 else null end,'2020-01-01','2020-01-02' from generate_series(4,218) i join public.fitxes_joc j on j.nom='Sintètic '||i;
 insert into public.exemplars(user_id,joc_id,format,created_at,updated_at) select user_id,id,'digital','2020-01-01','2020-01-02' from generate_series(219,437) i join public.fitxes_joc j on j.nom='Sintètic '||i;
 insert into public.experiencies(user_id,joc_id,any_jugat,created_at,updated_at) select user_id,id,case when i<=121 then null else 2024 end,'2020-01-01','2020-01-02' from generate_series(1,201) i join public.fitxes_joc j on j.nom='Sintètic '||i;
 insert into public.proposits(user_id,text,"any",created_at,updated_at) select '${owner}','Propòsit sintètic '||i,2025,'2020-01-01','2020-01-02' from generate_series(1,4) i;
 update public.fitxes_joc set comentaris=case when nom='Sintètic 5' then 'Text sintètic' else '   ' end where nom in ('Sintètic 5','Sintètic 6');
 update public.experiencies set valoracio='A++' where joc_id=(select id from public.fitxes_joc where nom='Sintètic 7');`)
 const plan=buildPlan(JSON.parse((await db.query(read)).rows[0].informe_dades));assert.equal(plan.estat,'preparat_per_revisar')
 assert.deepEqual(plan.abans,{fitxes:453,pendents:453,exemplars:440,fisics_actius:218,digitals_actius:222,exemplars_actius:440,exemplars_retirats:0,bitacora:201,proposits:4})
 return {db,plan,sql:buildTransaction(plan,migration,readTemplate,postTemplate,schemaReport)}
}
