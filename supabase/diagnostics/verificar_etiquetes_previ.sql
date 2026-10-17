-- Només metadades: una SELECT, sense executar RPC d'aplicació ni llegir registres.
-- El resultat és privat. Revisar-lo localment abans de compartir-lo: les
-- definicions SQL poden contenir literals sensibles. El filtre següent omet
-- cossos amb indicis de credencials/UUID/correus; no és un detector infal·lible.
with
wanted(name) as (values
 ('desar_registre'),('alta_registre'),('restaurar_copia_legacy'),
 ('desar_registre_plataforma'),('crear_registre'),('crear_registre_plataforma'),
 ('restaurar_copia'),('restaurar_copia_plataforma'),('estat_restauracio'),
 ('pot_editar'),('propietari_consulta'),('versio_altes'),('versio_plataforma'),
 ('normalitza_plataforma')),
tables as (
 select c.*,n.nspname from pg_catalog.pg_class c
 join pg_catalog.pg_namespace n on n.oid=c.relnamespace
 where n.nspname='public' and c.relname in
 ('fitxes_joc','exemplars','experiencies','proposits','accessos_convidats') and c.relkind in ('r','p')
),
functions as (
 select p.*,n.nspname,l.lanname from pg_catalog.pg_proc p
 join pg_catalog.pg_namespace n on n.oid=p.pronamespace
 join pg_catalog.pg_language l on l.oid=p.prolang
 where n.nspname='public' and p.prokind='f' and
 (p.proname in (select name from wanted) or p.oid in (
 select t.tgfoid from pg_catalog.pg_trigger t where t.tgrelid in (select oid from tables) and not t.tgisinternal))
),
definitions as (
 select f.*,pg_catalog.pg_get_functiondef(f.oid) as definition from functions f
),
api_roles as (select oid,rolname from pg_catalog.pg_roles where rolname in ('anon','authenticated','service_role'))
select jsonb_build_object(
 'format','tsumige-etiquetes-esquema-v1',
 'servidor',jsonb_build_object('version',current_setting('server_version')),
 'existencia',jsonb_build_object(
   'fitxes_joc',to_regclass('public.fitxes_joc') is not null,
   'no_jugat',exists(select 1 from pg_attribute where attrelid=to_regclass('public.fitxes_joc') and attname='no_jugat' and not attisdropped),
   'intencio_joc',exists(select 1 from pg_attribute where attrelid=to_regclass('public.fitxes_joc') and attname='intencio_joc' and not attisdropped),
   'possible_equivalent',exists(select 1 from pg_attribute where attrelid=to_regclass('public.fitxes_joc') and not attisdropped and attname ~* '(jugat|intencio|want|unplayed)'),
   'nota','No es llegeix historial de migracions: possibles equivalents es contrasten per columnes, restriccions i RPC'),
 'rpc_absents',coalesce((select jsonb_agg(w.name order by w.name) from wanted w where not exists(select 1 from functions f where f.proname=w.name)),'[]'),
 'taules',coalesce((select jsonb_agg(jsonb_build_object('nom',relname,'propietari',pg_get_userbyid(relowner),'rls',relrowsecurity,'force_rls',relforcerowsecurity,'acl',relacl) order by relname) from tables),'[]'),
 'columnes',coalesce((select jsonb_agg(jsonb_build_object('taula',t.relname,'nom',a.attname,'tipus',format_type(a.atttypid,a.atttypmod),'no_nul',a.attnotnull,'default',pg_get_expr(d.adbin,d.adrelid),'acl',a.attacl) order by t.relname,a.attnum)
 from tables t join pg_attribute a on a.attrelid=t.oid and a.attnum>0 and not a.attisdropped
 left join pg_attrdef d on d.adrelid=a.attrelid and d.adnum=a.attnum),'[]'),
 'restriccions',coalesce((select jsonb_agg(jsonb_build_object('taula',t.relname,'nom',c.conname,'definicio',pg_get_constraintdef(c.oid,true),'validada',c.convalidated) order by t.relname,c.conname) from tables t join pg_constraint c on c.conrelid=t.oid),'[]'),
 'funcions',coalesce((select jsonb_agg(jsonb_build_object(
 'oid',oid,'signatura',oid::regprocedure::text,'arguments',pg_get_function_arguments(oid),'resultat',pg_get_function_result(oid),
 'propietari',pg_get_userbyid(proowner),'acl',proacl,'llenguatge',lanname,
 'seguretat',case when prosecdef then 'DEFINER' else 'INVOKER' end,'config',proconfig,
 'definicio_omesa',definition ~* '([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|eyJ[a-zA-Z0-9_-]{15,}|(password|secret|api_key|service_role_key)[[:space:]]*[:=])',
 'definicio',case when definition ~* '([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|eyJ[a-zA-Z0-9_-]{15,}|(password|secret|api_key|service_role_key)[[:space:]]*[:=])' then null else definition end
 ) order by nspname,proname,oid) from definitions),'[]'),
 'politiques',coalesce((select jsonb_agg(jsonb_build_object('taula',t.relname,'nom',p.polname,'cmd',p.polcmd,'permissiva',p.polpermissive,
 'rols',(select jsonb_agg(case when r=0 then 'PUBLIC' else pg_get_userbyid(r) end) from unnest(p.polroles) r),
 'using',pg_get_expr(p.polqual,p.polrelid),'with_check',pg_get_expr(p.polwithcheck,p.polrelid)) order by t.relname,p.polname) from tables t join pg_policy p on p.polrelid=t.oid),'[]'),
 'triggers',coalesce((select jsonb_agg(jsonb_build_object('taula',t.relname,'nom',g.tgname,'actiu',g.tgenabled,'definicio',pg_get_triggerdef(g.oid,true)) order by t.relname,g.tgname) from tables t join pg_trigger g on g.tgrelid=t.oid where not g.tgisinternal),'[]'),
 'rols_api',coalesce((select jsonb_agg(jsonb_build_object('rol',r.rolname,'inherit',r.rolinherit,'bypass_rls',r.rolbypassrls,'superuser',r.rolsuper) order by r.rolname) from pg_roles r where r.rolname in ('anon','authenticated','service_role')),'[]'),
 'permisos_taules',coalesce((select jsonb_agg(jsonb_build_object('taula',t.relname,'rol',r.rolname,'select',has_table_privilege(r.oid,t.oid,'SELECT'),'insert',has_table_privilege(r.oid,t.oid,'INSERT'),'update',has_table_privilege(r.oid,t.oid,'UPDATE'),'delete',has_table_privilege(r.oid,t.oid,'DELETE')) order by t.relname,r.rolname) from tables t cross join api_roles r),'[]'),
 'permisos_columnes',coalesce((select jsonb_agg(jsonb_build_object('taula',t.relname,'columna',a.attname,'rol',r.rolname,'select',has_column_privilege(r.oid,t.oid,a.attnum,'SELECT'),'insert',has_column_privilege(r.oid,t.oid,a.attnum,'INSERT'),'update',has_column_privilege(r.oid,t.oid,a.attnum,'UPDATE')) order by t.relname,a.attnum,r.rolname) from tables t join pg_attribute a on a.attrelid=t.oid and a.attnum>0 and not a.attisdropped cross join api_roles r),'[]'),
 'permisos_rpc',coalesce((select jsonb_agg(jsonb_build_object('signatura',f.oid::regprocedure::text,'rol',r.rolname,'execute',has_function_privilege(r.oid,f.oid,'EXECUTE')) order by f.proname,f.oid,r.rolname) from functions f cross join api_roles r),'[]'),
 'dependencies',coalesce((select jsonb_agg(jsonb_build_object('objecte',pg_describe_object(d.classid,d.objid,d.objsubid),'referencia',pg_describe_object(d.refclassid,d.refobjid,d.refobjsubid),'tipus',d.deptype) order by d.classid,d.objid,d.refclassid,d.refobjid)
 from pg_depend d where (d.classid='pg_proc'::regclass and d.objid in(select oid from functions)) or (d.refclassid='pg_proc'::regclass and d.refobjid in(select oid from functions)) or (d.refclassid='pg_class'::regclass and d.refobjid in(select oid from tables))),'[]'),
 'limits','Només catàlegs. pg_depend no identifica totes les referències dins PL/pgSQL/SQL dinàmic: revisar també els cossos. No es consulta Auth, Storage ni cap registre d’aplicació.'
) as informe_etiquetes;
