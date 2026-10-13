// Generador genèric. Els bundles amb captures reals s'han de desar fora del repositori.
import { URL } from 'node:url'
import { readFile } from 'node:fs/promises'
import { schemaGuard } from './plataforma-schema-guard.mjs'
const names=JSON.parse(await readFile(new URL('../src/lib/platform-names.json',import.meta.url),'utf8'))
const literal=value=>"'"+String(value).replaceAll("'","''")+"'"
export const canonical=value=>names[value.trim().toLowerCase()]??value.trim()
export const expression=(column)=>`case lower(btrim(${column})) ${Object.entries(names).map(([alias,name])=>`when ${literal(alias)} then ${literal(name)}`).join(' ')} else btrim(${column}) end`
export function normalizationSql() {
 return `-- PREPARADA. NO APLICAR separadament de la tanda conjunta autoritzada.
begin;
lock table public.fitxes_joc in share row exclusive mode;
do $$ begin
 if public.versio_plataforma() <> 2 then raise exception 'Cal el model Plataforma 2'; end if;
 if exists(select 1 from public.fitxes_joc group by user_id,lower(btrim(nom)),lower(${expression('plataforma')})
 having count(*)>1 and bool_or(plataforma is distinct from ${expression('plataforma')}))
 then raise exception 'Col·lisions de noms: revisar IDs i dades; no es fusiona'; end if;
end $$;
create or replace function public.normalitza_plataforma(p_text text) returns text
language sql immutable set search_path='' as $$ select ${expression('p_text')} $$;
update public.fitxes_joc set plataforma=public.normalitza_plataforma(plataforma)
 where plataforma is distinct from public.normalitza_plataforma(plataforma);
commit;`
}
const strip=sql=>sql.replace(/^begin;\s*$/m,'').replace(/^commit;\s*$/m,'')
export const templateStop="do $template$ begin raise exception 'Plantilla no executable: cal captura i bundle privat'; end $template$;"
export async function jointSql() {
 const rpc=await readFile(new URL('../supabase/migrations/202610110001_altes_atomiques.sql',import.meta.url),'utf8')
 return `-- PLANTILLA DE REVISIÓ. Per aplicar dades reals cal bundle privat amb empremtes actuals.
begin isolation level serializable;
set local lock_timeout='10s';
set local statement_timeout='120s';
lock table public.fitxes_joc,public.exemplars,public.experiencies,public.proposits,public.accessos_convidats in access exclusive mode;
-- GUARDA_CAPTURA_PRIVADA
${templateStop}
${strip(normalizationSql()).replace('lock table public.fitxes_joc in share row exclusive mode;','')}
${strip(rpc)}
-- GUARDA_POSTERIOR_PRIVADA
commit;`
}
export const dataQuery=`select jsonb_build_object('fitxes_joc',coalesce((select jsonb_agg(t order by id) from public.fitxes_joc t),'[]'::jsonb),'exemplars',coalesce((select jsonb_agg(t order by id) from public.exemplars t),'[]'::jsonb),'experiencies',coalesce((select jsonb_agg(t order by id) from public.experiencies t),'[]'::jsonb),'proposits',coalesce((select jsonb_agg(t order by id) from public.proposits t),'[]'::jsonb),'accessos_convidats',coalesce((select jsonb_agg(t order by convidat_id) from public.accessos_convidats t),'[]'::jsonb)) dades`
export function dataGuard(data, label) {
 let tag='$guard$'
 while(JSON.stringify(data).includes(tag))tag=tag.replace('guard','guard_')
 return `do ${tag} declare observed jsonb; expected jsonb:=${literal(JSON.stringify(data))}::jsonb; begin select dades into observed from (${dataQuery}) q; if observed is distinct from expected then raise exception '${label}'; end if; end ${tag};`
}
export async function guardedJoint(capture) {
 if(capture.format!=='tsumige-altes-noms-v1')throw Error('Format incorrecte')
 const before=capture.dades
 const after=JSON.parse(JSON.stringify(before))
 for(const game of after.fitxes_joc)game.plataforma=canonical(game.plataforma)
 // No predir timestamps: guardar tota la resta i comprovació posterior amb timestamps exclosos només a fitxes afectades.
 const changed=before.fitxes_joc.filter(game=>game.plataforma!==canonical(game.plataforma)).map(game=>game.id)
 let sql=await jointSql()
 sql=sql.replace('-- GUARDA_CAPTURA_PRIVADA\n'+templateStop,()=>schemaGuard(capture.esquema)+'\n'+permissionsGuard(capture.esquema)+'\n'+dataGuard(before,'Dades canviades: renovar captura i pla'))
 // Fixar timestamps originals només per a la comparació, sense modificar dades.
 const postQuery=dataQuery.replace("jsonb_agg(t order by id) from public.fitxes_joc t",`jsonb_agg(case when t.id=any(array[${changed.map(id=>literal(id)+'::uuid').join(',')}]::uuid[]) then to_jsonb(t)||jsonb_build_object('updated_at',(select x->'updated_at' from jsonb_array_elements(${literal(JSON.stringify(before.fitxes_joc))}::jsonb) x where x->>'id'=t.id::text)) else to_jsonb(t) end order by id) from public.fitxes_joc t`)
 const post=dataGuard(after,'Dades posteriors diferents de les previstes').replace(dataQuery,()=>postQuery)
 return sql.replace('-- GUARDA_POSTERIOR_PRIVADA',()=>post+'\n'+permissionsGuard(capture.esquema)+`\ndo $$ begin if not has_function_privilege('authenticated','public.alta_registre(text,uuid,uuid,jsonb,jsonb,boolean,timestamptz,jsonb)','EXECUTE') or has_function_privilege('anon','public.alta_registre(text,uuid,uuid,jsonb,jsonb,boolean,timestamptz,jsonb)','EXECUTE') then raise exception 'Permisos de la nova RPC incorrectes'; end if; end $$;`)
}
export function recoverySql(before,after) {
 if(before.format!=='tsumige-altes-noms-v1'||after.format!==before.format)throw Error('Captures no compatibles')
 if(before.colisions.length)throw Error('Col·lisions pendents')
 const normalized=JSON.parse(JSON.stringify(before.dades))
 for(const game of normalized.fitxes_joc)game.plataforma=canonical(game.plataforma)
 const comparable=JSON.parse(JSON.stringify(after.dades))
 for(const game of comparable.fitxes_joc) {
  const original=before.dades.fitxes_joc.find(item=>item.id===game.id)
  if(original && original.plataforma!==canonical(original.plataforma))game.updated_at=original.updated_at
 }
 if(JSON.stringify(comparable)!==JSON.stringify(normalized))throw Error('Dades posteriors diferents del pla: no generar reversió')
 const signature='public.normalitza_plataforma(text)'
 const previous=before.esquema.funcions.find(f=>(f.signatura_qualificada??f.signatura).replace(/^public\./,'')==='normalitza_plataforma(text)')
 if(!previous || previous.definicio.includes('OMES'))throw Error('Definició original absent')
 const triggers=before.esquema.triggers.filter(t=>t.esquema==='public'&&t.taula==='fitxes_joc'&&(/actualitzar_updated_at|comprova_fitxa_plataforma/.test(t.definicio)))
 if(triggers.length!==2 || triggers.some(t=>!['O','A','R','D'].includes(t.estat)))throw Error('Cal contrastar els dos triggers de reversió')
 const quote=v=>'"'+v.replaceAll('"','""')+'"'
 const changed=before.dades.fitxes_joc.filter(game=>game.plataforma!==canonical(game.plataforma))
 const restore=changed.map(game=>`update public.fitxes_joc set plataforma=${literal(game.plataforma)},updated_at=${literal(game.updated_at)}::timestamptz where id=${literal(game.id)}::uuid;`).join('\n')
 const functionsGuard=before.esquema.funcions.some(f=>/\b(alta_registre|versio_altes)\(/.test(f.signatura))
 if(functionsGuard)throw Error('Les RPC ja existien a la captura inicial: cal revisar')
 return `-- PRIVAT. Reversió només després d'autorització; rebutja qualsevol edició posterior.
begin isolation level serializable;
set local lock_timeout='10s';
set local statement_timeout='120s';
lock table public.fitxes_joc,public.exemplars,public.experiencies,public.proposits,public.accessos_convidats in access exclusive mode;
${schemaGuard(after.esquema)}
${permissionsGuard(after.esquema)}
${dataGuard(after.dades,'Dades canviades després de COMMIT: no revertir')}
drop function public.alta_registre(text,uuid,uuid,jsonb,jsonb,boolean,timestamptz,jsonb) restrict;
drop function public.versio_altes() restrict;
${previous.definicio.replace(/^CREATE FUNCTION/i,'CREATE OR REPLACE FUNCTION')};
${triggers.map(t=>`alter table public.fitxes_joc disable trigger ${quote(t.nom)};`).join('\n')}
${restore}
${triggers.map(t=>`alter table public.fitxes_joc ${t.estat==='D'?'disable':t.estat==='A'?'enable always':t.estat==='R'?'enable replica':'enable'} trigger ${quote(t.nom)};`).join('\n')}
${schemaGuard(before.esquema)}
${permissionsGuard(before.esquema)}
${dataGuard(before.dades,'Reversió no coincideix amb originals')}
-- La funció original conserva OID, propietari i ACL mitjançant CREATE OR REPLACE.
select to_regprocedure(${literal(signature)});
commit;`
}
export function permissionsGuard(report) {
 const functions=report.funcions.filter(f=>f.esquema==='public')
 const tables=report.taules.filter(t=>t.esquema==='public')
 return `do $permissions$ declare x jsonb; begin
 for x in select value from jsonb_array_elements(${literal(JSON.stringify(functions))}::jsonb) loop
  if not exists(select 1 from pg_proc p where p.oid=to_regprocedure(case when x->>'signatura' like 'public.%' then x->>'signatura' else 'public.'||(x->>'signatura') end)
    and pg_get_userbyid(p.proowner)=x->>'propietari' and coalesce(p.proacl,acldefault('f',p.proowner))::text=x->>'acl') then raise exception 'ACL/propietari RPC diferents'; end if;
 end loop;
 for x in select value from jsonb_array_elements(${literal(JSON.stringify(tables))}::jsonb) loop
  if not exists(select 1 from pg_class c where c.oid=to_regclass('public.'||(x->>'nom')) and pg_get_userbyid(c.relowner)=x->>'propietari' and coalesce(c.relacl,acldefault('r',c.relowner))::text=x->>'acl') then raise exception 'ACL/propietari taules diferents'; end if;
 end loop;
end $permissions$;`
}

// Un únic resultat inicial. El mateix batch retorna, després del COMMIT,
// la captura posterior i la reversió exacta; no cal una altra consulta manual.
export async function groupedJoint(before) {
 const captureQuery=(await readFile(new URL('../supabase/inspection/ALTES-NOMS-CAPTURA-LECTURA.sql',import.meta.url),'utf8')).trim().replace(/;$/,'')
 const predicted=JSON.parse(JSON.stringify(before))
 for(const game of predicted.dades.fitxes_joc)game.plataforma=canonical(game.plataforma)
 const oldGuards=[schemaGuard(predicted.esquema),permissionsGuard(predicted.esquema),dataGuard(predicted.dades,'Dades canviades després de COMMIT: no revertir')].join('\n')
 let token='__TSUMIGE_POST_COMMIT_LITERAL__'
 while(JSON.stringify(before).includes(token))token+='_'
 let tag='$receipt_guard$'
 while(JSON.stringify(before).includes(tag))tag=tag.replace('guard','guard_')
 const exactGuard=`do ${tag} declare observed jsonb; expected jsonb:=${token}::jsonb; begin
 select captura_altes_noms::jsonb into observed from (${captureQuery}) q;
 if observed->'esquema' is distinct from expected->'esquema' then raise exception 'Esquema/permisos posteriors canviats: no revertir'; end if;
 if observed->'dades' is distinct from expected->'dades' then raise exception 'Dades canviades després de COMMIT: no revertir'; end if;
 end ${tag};`
 const recovery=recoverySql(before,predicted).replace(oldGuards,()=>exactGuard)
 if(recovery===recoverySql(before,predicted))throw Error('No s’ha substituït la guarda posterior')
 let executable=await guardedJoint(before)
 const currentSchema=`do ${tag} declare observed jsonb; begin
 if not has_database_privilege(current_user,current_database(),'TEMP') then raise exception 'Cal permís TEMP per retornar el bundle'; end if;
 select captura_altes_noms::jsonb into observed from (${captureQuery}) q;
 if observed->'esquema' is distinct from ${literal(JSON.stringify(before.esquema))}::jsonb then raise exception 'Esquema/permisos inicials canviats'; end if;
 end ${tag};`
 executable=executable.replace('do $schema$',()=>currentSchema+'\ndo $schema$')
 // ON COMMIT PRESERVE ROWS manté el resultat en aquesta sessió, sense
 // afegir objectes persistents a public. Es retorna només després del COMMIT.
 const receipt=`create temporary table tsumige_altes_noms_receipt on commit preserve rows as
 select jsonb_build_object('format','tsumige-altes-noms-bundle-v1','verificat',true,
 'despres',captura_altes_noms::jsonb,
 'totals',(select jsonb_object_agg(key,jsonb_array_length(value)) from jsonb_each(captura_altes_noms::jsonb->'dades')),
 'reversio_sql',replace(${literal(recovery)},${literal(token)},quote_literal(captura_altes_noms))) bundle
 from (${captureQuery}) q;
-- Només l'autor de la sessió SQL pot llegir el rebut, encara que hi hagi
-- privilegis globals per defecte. No s'alteren permisos de public/Auth/Storage.
revoke all privileges on table pg_temp.tsumige_altes_noms_receipt from public,anon,authenticated,service_role;
do $receipt_acl$ declare t record; r text; begin
 select c.*,pg_get_userbyid(c.relowner) owner_name into t from pg_class c
 where c.oid='pg_temp.tsumige_altes_noms_receipt'::regclass;
 if t.relpersistence<>'t' or t.relnamespace<>pg_my_temp_schema() or t.owner_name<>current_user then
  raise exception 'El rebut ha de ser temporal i privat de la sessió actual'; end if;
 if exists(select 1 from aclexplode(coalesce(t.relacl,acldefault('r',t.relowner))) a where a.grantee<>t.relowner)
 or exists(select 1 from pg_attribute c cross join lateral aclexplode(c.attacl) a
   where c.attrelid=t.oid and a.grantee<>t.relowner) then
  raise exception 'El rebut té permisos concedits a tercers o PUBLIC'; end if;
 foreach r in array array['anon','authenticated','service_role'] loop
  if has_table_privilege(r,t.oid,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN')
   or has_any_column_privilege(r,t.oid,'SELECT,INSERT,UPDATE,REFERENCES') then
   raise exception 'El rol % té accés efectiu al rebut',r; end if;
 end loop;
end $receipt_acl$;
update pg_temp.tsumige_altes_noms_receipt set bundle=bundle||jsonb_build_object('seguretat_rebut',
 (select jsonb_build_object('temporal',c.relpersistence='t','esquema',n.nspname,
 'propietari',pg_get_userbyid(c.relowner),'rls',c.relrowsecurity,
 'acl',c.relacl::text,'public_sense_permisos',not exists(select 1 from aclexplode(c.relacl) a where a.grantee=0),
 'anon_sense_permisos',not has_table_privilege('anon',c.oid,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN'),
 'authenticated_sense_permisos',not has_table_privilege('authenticated',c.oid,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN'),
 'service_role_sense_permisos',not has_table_privilege('service_role',c.oid,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN'))
 from pg_class c join pg_namespace n on n.oid=c.relnamespace where c.oid='pg_temp.tsumige_altes_noms_receipt'::regclass))
 where bundle is not null;`
 return executable.replace(/commit;\s*$/,()=>`${receipt}\ncommit;\nselect jsonb_pretty(bundle) bundle_altes_noms from pg_temp.tsumige_altes_noms_receipt;`)
}
