// Materials de recuperació acotada. Els resultats amb valors/IDs només fora del repositori.
import assert from 'node:assert/strict'
const literal=x=>"'"+String(x).replaceAll("'","''")+"'"
const identifier=x=>'"'+x.replaceAll('"','""')+'"'
const query=x=>x.trim().replace(/;\s*$/,'')
const added=['normalitza_plataforma','versio_plataforma','comprova_fitxa_plataforma','comprova_exemplar_plataforma','desar_registre_plataforma','crear_registre_plataforma','restaurar_copia_plataforma','restaurar_copia_legacy','convertir_plataformes']
export function schemaSnapshot(report){
 const tables=report.taules.filter(x=>x.esquema==='public').map(x=>x.nom)
 const names=[...new Set([...report.funcions.filter(x=>x.esquema==='public'||(!x.signatura.startsWith('auth.')&&!x.signatura.startsWith('storage.'))).map(x=>x.signatura.replace(/^public\./,'').split('(')[0]),...added])]
 const scope=tables.map(literal).join(','),functions=names.map(literal).join(',')
 return `select md5(jsonb_build_object(
 'taules',coalesce((select jsonb_agg(jsonb_build_object('nom',c.relname,'owner',pg_get_userbyid(c.relowner),'acl',coalesce(c.relacl,acldefault('r',c.relowner))::text,'rls',c.relrowsecurity,'force',c.relforcerowsecurity) order by c.relname) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname in (${scope})),'[]'),
 'columnes',coalesce((select jsonb_agg(jsonb_build_object('taula',c.relname,'nom',a.attname,'tipus',format_type(a.atttypid,a.atttypmod),'no_nul',a.attnotnull,'default',pg_get_expr(d.adbin,d.adrelid),'acl',a.attacl::text,'identitat',a.attidentity,'generada',a.attgenerated) order by c.relname,a.attnum) from pg_class c join pg_namespace n on n.oid=c.relnamespace join pg_attribute a on a.attrelid=c.oid and a.attnum>0 and not a.attisdropped left join pg_attrdef d on d.adrelid=a.attrelid and d.adnum=a.attnum where n.nspname='public' and c.relname in (${scope})),'[]'),
 'constraints',coalesce((select jsonb_agg(jsonb_build_object('taula',c.relname,'nom',k.conname,'def',pg_get_constraintdef(k.oid,true),'valid',k.convalidated) order by c.relname,k.conname) from pg_constraint k join pg_class c on c.oid=k.conrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname in (${scope})),'[]'),
 'indexs',coalesce((select jsonb_agg(jsonb_build_object('taula',c.relname,'nom',ic.relname,'def',pg_get_indexdef(i.indexrelid),'valid',i.indisvalid) order by c.relname,ic.relname) from pg_index i join pg_class c on c.oid=i.indrelid join pg_class ic on ic.oid=i.indexrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname in (${scope})),'[]'),
 'triggers',coalesce((select jsonb_agg(jsonb_build_object('taula',c.relname,'nom',t.tgname,'estat',t.tgenabled,'def',pg_get_triggerdef(t.oid,true)) order by c.relname,t.tgname) from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace where not t.tgisinternal and n.nspname='public' and c.relname in (${scope})),'[]'),
 'rls',coalesce((select jsonb_agg(to_jsonb(p) order by p.tablename,p.policyname) from pg_policies p where p.schemaname='public' and p.tablename in (${scope})),'[]'),
 'funcions',coalesce((select jsonb_agg(jsonb_build_object('nom',p.proname,'args',oidvectortypes(p.proargtypes),'def',pg_get_functiondef(p.oid),'owner',pg_get_userbyid(p.proowner),'acl',coalesce(p.proacl,acldefault('f',p.proowner))::text) order by p.proname,oidvectortypes(p.proargtypes)) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in (${functions})),'[]')
 )::text) as schema_md5`
}
export const dataSnapshot=`select md5(jsonb_build_array(
 coalesce((select jsonb_agg(to_jsonb(j) order by id) from public.fitxes_joc j),'[]'),
 coalesce((select jsonb_agg(to_jsonb(e) order by id) from public.exemplars e),'[]'),
 coalesce((select jsonb_agg(to_jsonb(b) order by id) from public.experiencies b),'[]'),
 coalesce((select jsonb_agg(to_jsonb(p) order by id) from public.proposits p),'[]'))::text) as data_md5`
export function captureBefore(plan,report,readTemplate){
 const marker="null::uuid as propietari_explicit, '[]'::jsonb as decisions -- DECISIONS_PRIVADES"
 assert(readTemplate.includes(marker));assert.equal(plan.estat,'preparat_per_revisar')
 const read=query(readTemplate.replace(marker,literal(plan.informe.propietari_id)+"::uuid as propietari_explicit, "+literal(JSON.stringify(plan.casos.map(c=>({...c,plataforma:'Nintendo Switch'}))))+"::jsonb as decisions -- DECISIONS_PRIVADES"))
 return `-- PRIVAT, NOMÉS LECTURA. Exportar la cel·la sencera/CSV; no publicar valors ni IDs.
with informe as (${read}),r as (select informe_dades::jsonb as r from informe),s as (${schemaSnapshot(report)}),d as (${dataSnapshot})
select jsonb_pretty(case when r->'bloquejos'='[]'::jsonb and r->>'empremta_dades'=${literal(plan.informe.empremta_dades)} and d.data_md5=${literal(plan.informe.empremta_dades)} then
 jsonb_build_object('format','tsumige-recovery-before-v1','valid',true,'observat_a',statement_timestamp(),'plan_empremta',r->>'empremta_dades','schema_md5',s.schema_md5,
 'jocs',coalesce((select jsonb_agg(jsonb_build_object('id',id,'plataforma',plataforma,'updated_at',updated_at) order by id) from public.fitxes_joc),'[]'),
 'digitals',coalesce((select jsonb_agg(jsonb_build_object('id',id,'a_la_colleccio',a_la_colleccio,'updated_at',updated_at) order by id) from public.exemplars where id in (${plan.digitals_a_retirar.map(x=>literal(x)+'::uuid').join(',')})),'[]'))
 else jsonb_build_object('format','tsumige-recovery-before-v1','valid',false,'motiu','Estat diferent del pla: renovar pla i captura abans de continuar','bloquejos',r->'bloquejos') end) as recuperacio_abans from r cross join s cross join d;
`
}
export function captureAfter(plan,report,postTemplate){
 const post=query(postTemplate.replace("'{}'::jsonb as pla -- PLA_PRIVAT",literal(JSON.stringify(plan))+'::jsonb as pla -- PLA_PRIVAT'))
 return `-- PRIVAT, NOMÉS LECTURA. Capturar immediatament després del COMMIT, mantenint les edicions pausades.
with q as (${post}),v as (select informe_verificacio::jsonb as v from q),s as (${schemaSnapshot(report)}),d as (${dataSnapshot})
select jsonb_pretty(jsonb_build_object('format','tsumige-recovery-after-v1','valid',v->>'coincideix'='true','observat_a',statement_timestamp(),
 'plan_empremta',${literal(plan.informe.empremta_dades)},'data_md5',d.data_md5,'schema_md5',s.schema_md5,'verificacio',v)) as recuperacio_despres from v cross join s cross join d;
`
}
export function buildRecovery(plan,report,before,after){
 assert.equal(before.format,'tsumige-recovery-before-v1');assert.equal(after.format,'tsumige-recovery-after-v1')
 assert(before.valid&&after.valid);assert.equal(before.plan_empremta,plan.informe.empremta_dades);assert.equal(after.plan_empremta,before.plan_empremta)
 assert.equal(before.jocs.length,plan.abans.fitxes);assert.equal(new Set(before.jocs.map(x=>x.id)).size,before.jocs.length)
 assert.deepEqual(before.jocs.map(x=>x.id).sort(),plan.informe.files.jocs.map(x=>x.id).sort())
 assert.deepEqual(before.digitals.map(x=>x.id).sort(),[...plan.digitals_a_retirar].sort());assert(before.digitals.every(x=>x.a_la_colleccio===true))
 assert.deepEqual(after.verificacio.actuals,plan.despres_previst);assert.equal(after.verificacio.coincideix,true)
 for(const x of [before.plan_empremta,before.schema_md5,after.data_md5,after.schema_md5])assert(/^[a-f0-9]{32}$/.test(x))
 const timestampTriggers=report.triggers.filter(t=>t.esquema==='public'&&['fitxes_joc','exemplars'].includes(t.taula)&&t.funcio.replace(/^public\./,'')==='actualitzar_updated_at()')
 assert.equal(timestampTriggers.length,2)
 const disable=timestampTriggers.map(t=>`alter table public.${identifier(t.taula)} disable trigger ${identifier(t.nom)};`).join('\n')
 const enable=timestampTriggers.map(t=>`alter table public.${identifier(t.taula)} ${t.estat==='D'?'disable':t.estat==='A'?'enable always':t.estat==='R'?'enable replica':'enable'} trigger ${identifier(t.nom)};`).join('\n')
 return `-- PRIVAT: REVERSIÓ ACOTADA, NO AUTORITZADA NI EXECUTADA REMOTAMENT.
-- Només funciona per a l'estat posterior capturat. Una edició posterior obliga revisió; no força ni fusiona.
begin isolation level serializable;
set local lock_timeout='10s';set local statement_timeout='120s';
lock table public.fitxes_joc,public.exemplars,public.experiencies,public.proposits,public.accessos_convidats in access exclusive mode;
do $pre$ declare data_hash text; schema_hash text;begin
 if current_user<>'postgres' then raise exception 'Cal el rol administratiu postgres';end if;
 select data_md5 into data_hash from (${dataSnapshot}) q;
 select schema_md5 into schema_hash from (${schemaSnapshot(report)}) q;
 if data_hash is distinct from ${literal(after.data_md5)} or schema_hash is distinct from ${literal(after.schema_md5)} then raise exception 'Estat posterior modificat: no sobreescriure dades ni estructura'; end if;
end $pre$;
-- RESTRICT: cap CASCADE. Dependències noves fan fallar tota la reversió.
drop trigger fitxa_plataforma on public.fitxes_joc;
drop trigger exemplar_plataforma on public.exemplars;
drop function public.restaurar_copia(jsonb,boolean,text);
alter function public.restaurar_copia_legacy(jsonb,boolean,text) rename to restaurar_copia;
drop function public.restaurar_copia_plataforma(jsonb,boolean,text);
drop function public.desar_registre_plataforma(text,uuid,jsonb,jsonb);
drop function public.crear_registre_plataforma(text,uuid,jsonb,jsonb);
drop function public.convertir_plataformes(uuid[],text);
drop function public.comprova_fitxa_plataforma();
drop function public.comprova_exemplar_plataforma();
drop function public.versio_plataforma();
drop function public.normalitza_plataforma(text);
alter table public.fitxes_joc drop column plataforma_resolta;
-- Restaura timestamps exactes sense desactivar RLS ni triggers de valoració/portada.
${disable}
update public.fitxes_joc j set plataforma=x.plataforma,updated_at=x.updated_at
 from jsonb_to_recordset(${literal(JSON.stringify(before.jocs))}::jsonb) x(id uuid,plataforma text,updated_at timestamptz) where j.id=x.id;
update public.exemplars e set a_la_colleccio=x.a_la_colleccio,updated_at=x.updated_at
 from jsonb_to_recordset(${literal(JSON.stringify(before.digitals))}::jsonb) x(id uuid,a_la_colleccio boolean,updated_at timestamptz) where e.id=x.id;
${enable}
do $post$ declare data_hash text;schema_hash text;begin
 select data_md5 into data_hash from (${dataSnapshot}) q;
 select schema_md5 into schema_hash from (${schemaSnapshot(report)}) q;
 if data_hash is distinct from ${literal(before.plan_empremta)} or schema_hash is distinct from ${literal(before.schema_md5)} then raise exception 'Recuperació incompleta: rollback de la reversió'; end if;
end $post$;
commit;
`
}
