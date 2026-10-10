// Generador públic sense dades personals. El SQL resultant s'ha de custodiar privadament.
import assert from 'node:assert/strict'
import {readFile,writeFile,realpath} from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import console from 'node:console'
import {pathToFileURL} from 'node:url'
import {schemaGuard} from './plataforma-schema-guard.mjs'
const literal=value=>"'"+String(value).replaceAll("'","''")+"'"
const asQuery=sql=>sql.trim().replace(/;\s*$/,'')
export function buildTransaction(plan,migration,readTemplate,postTemplate,schemaReport) {
 assert.equal(plan.estat,'preparat_per_revisar');assert.deepEqual(plan.errors,[]);assert.deepEqual(plan.diferencies,[])
 assert.equal(plan.autoritza_execucio,false);assert(!plan.informe.bloquejos.length)
 assert.equal(plan.casos.length,3);assert.equal(new Set(plan.digitals_a_retirar).size,3)
 assert.deepEqual([...plan.digitals_a_retirar].sort(),plan.casos.map(c=>c.digital_id).sort())
 for(const key of ['joc_id','fisic_id','digital_id'])assert.equal(new Set(plan.casos.map(c=>c[key])).size,3)
 for(const c of plan.casos)for(const key of ['joc_id','fisic_id','digital_id'])assert(/^[a-f0-9-]{36}$/i.test(c[key]))
 assert(/^[a-f0-9-]{36}$/i.test(plan.informe.propietari_id));assert(/^[a-f0-9]{32}$/.test(plan.informe.empremta_dades))
 for(const [table,count] of [['jocs','fitxes'],['exemplars','exemplars'],['bitacora','bitacora'],['proposits','proposits']]){
  assert.equal(plan.informe.files[table].length,plan.abans[count]);assert.equal(new Set(plan.informe.files[table].map(r=>r.id)).size,plan.abans[count])
 }
 assert.deepEqual(plan.despres_previst,{...plan.abans,pendents:0,digitals_actius:plan.abans.digitals_actius-3,exemplars_actius:plan.abans.exemplars_actius-3,exemplars_retirats:plan.abans.exemplars_retirats+3})
 const stripped=migration.replace(/^begin;\s*$/m,'').replace(/^commit;\s*$/m,'')
 assert.equal((migration.match(/^begin;\s*$/gm)||[]).length,1);assert.equal((migration.match(/^commit;\s*$/gm)||[]).length,1)
 const readMarker="null::uuid as propietari_explicit, '[]'::jsonb as decisions -- DECISIONS_PRIVADES"
 assert(readTemplate.includes(readMarker));assert(postTemplate.includes("'{}'::jsonb as pla -- PLA_PRIVAT"))
 const query=asQuery(readTemplate.replace(readMarker,literal(plan.informe.propietari_id)+"::uuid as propietari_explicit, "+literal(JSON.stringify(plan.casos.map(c=>({...c,plataforma:'Nintendo Switch'}))))+"::jsonb as decisions -- DECISIONS_PRIVADES"))
 const post=asQuery(postTemplate.replace("'{}'::jsonb as pla -- PLA_PRIVAT","current_setting('tsumige.pla')::jsonb as pla -- PLA_PRIVAT"))
 const ids=plan.digitals_a_retirar.map(id=>literal(id)+'::uuid').join(',')
 return `-- PRIVAT. No executar fins a còpia definitiva, recomprovació i autorització.
-- Un sol script/transacció. Qualsevol excepció avorta DDL i dades; no continuar fragments.
begin isolation level serializable;
set local lock_timeout='10s';
set local statement_timeout='120s';
-- Bloquejar abans del primer SELECT/DO: la instantània serialitzable ha de ser posterior als locks.
lock table public.fitxes_joc,public.exemplars,public.experiencies,public.proposits,public.accessos_convidats in access exclusive mode;
-- Aquesta operació administrativa no és una RPC ni es pot executar com a convidat.
do $guard$ begin
 if current_user <> 'postgres' then raise exception 'Cal el rol administratiu postgres'; end if;
 if exists(select 1 from information_schema.columns where table_schema='public' and table_name='fitxes_joc' and column_name='plataforma_resolta')
 or to_regprocedure('public.convertir_plataformes(uuid[],text)') is not null then raise exception 'Migració ja present: no repetir'; end if;
end $guard$;
${schemaGuard(schemaReport)}
select set_config('tsumige.pla',${literal(JSON.stringify(plan))},true);
do $before$ declare p jsonb:=current_setting('tsumige.pla')::jsonb; r jsonb; c jsonb; begin
 select informe_dades::jsonb into r from (${query}) q;
 if r->'bloquejos'<>'[]'::jsonb or r->'diagnostic'<>'[]'::jsonb
 or r->>'empremta_dades' is distinct from p#>>'{informe,empremta_dades}'
 or r->'files' is distinct from p#>'{informe,files}'
 or r->'abans' is distinct from p->'abans'
 or r->'cobertura' is distinct from p#>'{informe,cobertura}' then
 raise exception 'Dades desactualitzades: cap canvi aplicat; renovar pla i còpia'; end if;
 for c in select value from jsonb_array_elements(p->'casos') loop
  if not exists(select 1 from public.exemplars e join public.fitxes_joc j on j.id=e.joc_id
   where e.id=(c->>'fisic_id')::uuid and j.id=(c->>'joc_id')::uuid and j.user_id=(p#>>'{informe,propietari_id}')::uuid
    and e.user_id=j.user_id and j.plataforma='Nintendo Switch' and e.format='fisic' and e.a_la_colleccio
    and e.any_compra=(c->>'any_compra')::integer and e.preu=(c->>'preu')::numeric)
  or not exists(select 1 from public.exemplars e where e.id=(c->>'digital_id')::uuid and e.joc_id=(c->>'joc_id')::uuid
   and e.user_id=(p#>>'{informe,propietari_id}')::uuid and e.format='digital' and e.a_la_colleccio) then
   raise exception 'Identificadors/compra aprovats no coincideixen'; end if;
 end loop;
end $before$;
-- Context local del propietari: mai es concedeixen permisos per efectuar la conversió.
select set_config('request.jwt.claim.sub',${literal(plan.informe.propietari_id)},true);
select set_config('request.jwt.claims',${literal(JSON.stringify({sub:plan.informe.propietari_id,role:'authenticated'}))},true);
set local role authenticated;
do $owner$ begin
 if auth.uid() is distinct from ${literal(plan.informe.propietari_id)}::uuid or not public.pot_editar()
 or public.estat_restauracio() is distinct from current_setting('tsumige.pla')::jsonb#>>'{informe,empremta_dades}' then
 raise exception 'Context del propietari o cobertura RLS no coincideix'; end if;
end $owner$;
reset role;
${stripped}
-- L'únic canvi estructural a files existents és afegir el marcador false.
do $structure$ declare p jsonb:=current_setting('tsumige.pla')::jsonb; bad integer; begin
 with expected as (
  select 'jocs'::text as t,x from jsonb_array_elements(p#>'{informe,files,jocs}') x
  union all select 'exemplars',x from jsonb_array_elements(p#>'{informe,files,exemplars}') x
  union all select 'bitacora',x from jsonb_array_elements(p#>'{informe,files,bitacora}') x
  union all select 'proposits',x from jsonb_array_elements(p#>'{informe,files,proposits}') x
 ),actual as (
  select 'jocs'::text as t,id,to_jsonb(j) as fila from public.fitxes_joc j
  union all select 'exemplars',id,to_jsonb(e) from public.exemplars e
  union all select 'bitacora',id,to_jsonb(b) from public.experiencies b
  union all select 'proposits',id,to_jsonb(s) from public.proposits s
 ) select count(*) into bad from actual a full join expected e on a.t=e.t and a.id::text=e.x->>'id'
 where a.id is null or e.x is null or
 (case when a.t='jocs' then md5((a.fila-'plataforma_resolta')::text) else md5(a.fila::text) end) is distinct from e.x->>'abans_md5';
 if bad<>0 or exists(select 1 from public.fitxes_joc where plataforma_resolta) then
 raise exception 'La migració estructural ha alterat dades originals'; end if;
end $structure$;
set local role authenticated;
do $convert$ declare result jsonb; state text; begin
 if not public.pot_editar() then raise exception 'Sense permís de conversió'; end if;
 -- Nova empremta només després de comprovar totes les files sense el marcador.
 state:=public.estat_restauracio();
 result:=public.convertir_plataformes(array[${ids}],state);
 if (result->>'digitals_retirats')::integer<>3 then raise exception 'Retirades inesperades'; end if;
end $convert$;
reset role;
do $after$ declare result jsonb; begin
 select informe_verificacio::jsonb into result from (${post}) q;
 if result->>'fase'<>'fitxes_resoltes' or result->>'coincideix' is distinct from 'true'
 or result->'actuals' is distinct from current_setting('tsumige.pla')::jsonb->'despres_previst' then
 raise exception 'Resultat fora del pla: rollback complet'; end if;
end $after$;
commit;
-- NOMÉS si el COMMIT acaba correctament: verificació persistent només de lectura.
-- Si hi ha error o es perd la resposta, no repetir; verificar fase i estat primer.
`
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const [, , input,target,schemaInput]=process.argv;assert(input&&target&&schemaInput,'Ús: pla.json /carpeta/privada/APLICA-PLATAFORMA.sql esquema.json-o.csv')
 const root=await realpath(process.cwd()),parent=await realpath(path.dirname(path.resolve(target)))
 assert(parent!==root&&!parent.startsWith(root+path.sep),'Desar fora del repositori')
 const plan=JSON.parse(await readFile(input,'utf8'))
 let metadata=(await readFile(schemaInput,'utf8')).replace(/^\uFEFF/,'').trim()
 if(!metadata.startsWith('{'))metadata=metadata.slice(metadata.indexOf('\n')+1).trim().slice(1,-1).replaceAll('""','"')
 const sql=buildTransaction(plan,await readFile('supabase/migrations/202610090001_plataforma.sql','utf8'),await readFile('supabase/inspection/PLATAFORMA-DADES-LECTURA.sql','utf8'),await readFile('supabase/inspection/PLATAFORMA-DESPRES-LECTURA.sql','utf8'),JSON.parse(metadata))
 await writeFile(target,sql,{flag:'wx',mode:0o600});console.log('Script privat generat. No executat.')
}
