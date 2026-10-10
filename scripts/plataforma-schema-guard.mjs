// Contrast previ de metadades públiques; no inclou registres personals.
import assert from 'node:assert/strict'
export function schemaGuard(report) {
 assert.equal(report.format,'tsumige-esquema-plataforma-v1')
 const metadata={}
 for(const key of ['taules','columnes','restriccions','triggers','politiques_rls','permisos_efectius_taules'])metadata[key]=report[key].filter(x=>x.esquema==='public')
 metadata.funcions=report.funcions.filter(x=>x.esquema==='public'||(!x.signatura.startsWith('auth.')&&!x.signatura.startsWith('storage.'))).map(({signatura,signatura_qualificada,definicio})=>({signatura:signatura_qualificada??(signatura.startsWith('public.')?signatura:'public.'+signatura),definicio}))
 assert(metadata.funcions.length>0,'No s’han identificat les RPC públiques')
 metadata.taules=metadata.taules.map(({nom,rls,force_rls})=>({nom,rls,force_rls}))
 metadata.restriccions=metadata.restriccions.map(({taula,definicio,validada,diferible,inicialment_diferida})=>({taula,definicio,validada,diferible,inicialment_diferida}))
 assert(!JSON.stringify(metadata).includes('OMES'),'Metadades públiques necessàries redactades')
 const literal="'"+JSON.stringify(metadata).replaceAll("'","''")+"'"
 return `do $schema$ declare m jsonb:=${literal}::jsonb; x jsonb; n integer; begin
 for x in select value from jsonb_array_elements(m->'taules') loop
  if not exists(select 1 from pg_class c join pg_namespace ns on ns.oid=c.relnamespace where ns.nspname='public' and c.relname=x->>'nom'
   and c.relrowsecurity=(x->>'rls')::boolean and c.relforcerowsecurity=(x->>'force_rls')::boolean) then raise exception 'Esquema/RLS diferents del contrastat'; end if;
 end loop;
 for x in select value from jsonb_array_elements(m->'columnes') loop
  if not exists(select 1 from pg_attribute a left join pg_attrdef d on d.adrelid=a.attrelid and d.adnum=a.attnum
   where a.attrelid=to_regclass('public.'||(x->>'taula')) and a.attname=x->>'nom' and not a.attisdropped
   and format_type(a.atttypid,a.atttypmod)=x->>'tipus' and a.attnotnull=(x->>'no_nul')::boolean
   and a.attidentity=x->>'identitat' and a.attgenerated=x->>'generada'
   and pg_get_expr(d.adbin,d.adrelid) is not distinct from x->>'valor_per_defecte') then raise exception 'Columna/default diferents del contrastat'; end if;
 end loop;
 select count(*) into n from pg_attribute a where a.attnum>0 and not a.attisdropped and a.attrelid in (select to_regclass('public.'||(value->>'nom')) from jsonb_array_elements(m->'taules'));
 if n<>jsonb_array_length(m->'columnes') then raise exception 'Columnes noves o absents'; end if;
 for x in select value from jsonb_array_elements(m->'funcions') loop
  if to_regprocedure(x->>'signatura') is null or btrim(pg_get_functiondef(to_regprocedure(x->>'signatura'))) is distinct from btrim(x->>'definicio') then
   raise exception 'RPC/funció diferent del contrastat: %',x->>'signatura'; end if;
 end loop;
 for x in select value from jsonb_array_elements(m->'restriccions') loop
  if not exists(select 1 from pg_constraint c where c.conrelid=to_regclass('public.'||(x->>'taula')) and pg_get_constraintdef(c.oid,true)=x->>'definicio'
   and c.convalidated=(x->>'validada')::boolean and c.condeferrable=(x->>'diferible')::boolean and c.condeferred=(x->>'inicialment_diferida')::boolean) then
   raise exception 'Restricció diferent del contrastat'; end if;
 end loop;
 for x in select value from jsonb_array_elements(m->'triggers') loop
  if not exists(select 1 from pg_trigger t where t.tgrelid=to_regclass('public.'||(x->>'taula')) and t.tgname=x->>'nom' and t.tgenabled=x->>'estat' and pg_get_triggerdef(t.oid,true)=x->>'definicio') then raise exception 'Trigger diferent del contrastat'; end if;
 end loop;
 select count(*) into n from pg_trigger t where not t.tgisinternal and t.tgrelid in (select to_regclass('public.'||(value->>'nom')) from jsonb_array_elements(m->'taules'));
 if n<>jsonb_array_length(m->'triggers') then raise exception 'Triggers nous o absents'; end if;
 for x in select value from jsonb_array_elements(m->'politiques_rls') loop
  if not exists(select 1 from pg_policies p where p.schemaname='public' and p.tablename=x->>'taula' and p.policyname=x->>'nom'
   and p.permissive=x->>'permissiva' and p.cmd=x->>'operacio' and p.qual is not distinct from x->>'using' and p.with_check is not distinct from x->>'with_check'
   and array(select r::text from unnest(p.roles) r order by r::text)=array(select r from jsonb_array_elements_text(x->'rols') r order by r)) then raise exception 'Política RLS diferent del contrastat'; end if;
 end loop;
 select count(*) into n from pg_policies p where p.schemaname='public' and p.tablename in (select value->>'nom' from jsonb_array_elements(m->'taules'));
 if n<>jsonb_array_length(m->'politiques_rls') then raise exception 'Polítiques RLS noves o absents'; end if;
 for x in select value from jsonb_array_elements(m->'permisos_efectius_taules') loop
  if has_table_privilege(x->>'rol','public.'||(x->>'taula'),'SELECT')<>(x->>'select')::boolean
   or has_table_privilege(x->>'rol','public.'||(x->>'taula'),'INSERT')<>(x->>'insert')::boolean
   or has_table_privilege(x->>'rol','public.'||(x->>'taula'),'UPDATE')<>(x->>'update')::boolean
   or has_table_privilege(x->>'rol','public.'||(x->>'taula'),'DELETE')<>(x->>'delete')::boolean then raise exception 'Permisos de taula diferents del contrastat'; end if;
 end loop;
end $schema$;`
}
