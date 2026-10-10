-- COMPLEMENT PRIVAT DE RECUPERACIÓ. NOMÉS LECTURA: un WITH/SELECT.
-- Executar tot al SQL Editor, com postgres; no executar migrations/tests.
-- Noms tècnics, definicions i ACL íntegres, sense redacció global de literals llargs.
-- No consulta dades personals ni secrets; els cossos amb indicis de secrets s'ometen.
-- Custodiar el resultat fora del repositori. No és un dump de recuperació complet.
with recursive
objectes as (
 select c.oid,n.nspname as esquema,c.relname as nom,c.relkind,c.relrowsecurity,c.relforcerowsecurity,c.relacl,c.relowner
 from pg_class c join pg_namespace n on n.oid=c.relnamespace
 where (n.nspname='public' and c.relname in ('fitxes_joc','exemplars','experiencies','proposits','accessos_convidats'))
 or (n.nspname='storage' and c.relname in ('objects','buckets'))
),
noms_rpc(nom) as (values
 ('crear_registre'),('desar_registre'),('restaurar_copia'),('estat_restauracio'),('pot_editar'),('propietari_consulta'),('resum_jocs'),
 ('normalitza_plataforma'),('versio_plataforma'),('crear_registre_plataforma'),('desar_registre_plataforma'),
 ('restaurar_copia_plataforma'),('restaurar_copia_legacy'),('convertir_plataformes'),
 ('comprova_fitxa_plataforma'),('comprova_exemplar_plataforma')),
funcions_inicials as (
 select p.oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where (n.nspname='public' and p.proname in (select nom from noms_rpc))
 or (n.nspname='storage' and p.proname in ('foldername','filename','extension'))
 or (n.nspname='auth' and p.proname in ('uid','role','jwt'))
 union select t.tgfoid from pg_trigger t where not t.tgisinternal and t.tgrelid in (select oid from objectes)
 union select d.refobjid from pg_depend d join pg_policy pol on pol.oid=d.objid
 where d.classid='pg_policy'::regclass and d.refclassid='pg_proc'::regclass and pol.polrelid in (select oid from objectes)
),
funcions(oid) as (
 select oid from funcions_inicials
 union
 select d.refobjid from funcions f join pg_depend d on d.objid=f.oid
 join pg_proc p on p.oid=d.refobjid join pg_namespace n on n.oid=p.pronamespace
 where d.classid='pg_proc'::regclass and d.refclassid='pg_proc'::regclass and n.nspname in ('public','storage')
),
rols as (select oid,rolname from pg_roles where rolname in ('anon','authenticated','service_role','supabase_storage_admin')),
informe as (
 select jsonb_build_object(
  'format','tsumige-esquema-plataforma-v1',
  'postgresql',current_setting('server_version'),
  'abast','Metadades i configuració de portades; sense files personals. No comprova recomptes ni discrepàncies de conversió.',
  'objectes_absents',coalesce((select jsonb_agg(x.nom order by x.nom) from (values
    ('public.fitxes_joc'),('public.exemplars'),('public.experiencies'),('public.proposits'),('public.accessos_convidats'),('storage.objects'),('storage.buckets')) x(nom)
    where to_regclass(x.nom) is null),'[]'::jsonb),
  'rpc_absents',coalesce((select jsonb_agg(x.nom order by x.nom) from noms_rpc x where not exists(
    select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname=x.nom)),'[]'::jsonb),
  'taules',coalesce((select jsonb_agg(jsonb_build_object('esquema',o.esquema,'nom',o.nom,'tipus',o.relkind,
    'rls',o.relrowsecurity,'force_rls',o.relforcerowsecurity,'propietari',pg_get_userbyid(o.relowner),
    'acl',coalesce(o.relacl,acldefault('r',o.relowner))::text) order by o.esquema,o.nom) from objectes o),'[]'::jsonb),
  'columnes',coalesce((select jsonb_agg(jsonb_build_object('esquema',o.esquema,'taula',o.nom,'ordre',a.attnum,'nom',a.attname,
    'tipus',format_type(a.atttypid,a.atttypmod),'no_nul',a.attnotnull,'identitat',a.attidentity,'generada',a.attgenerated,
    'valor_per_defecte',pg_get_expr(ad.adbin,ad.adrelid)) order by o.esquema,o.nom,a.attnum)
    from objectes o join pg_attribute a on a.attrelid=o.oid and a.attnum>0 and not a.attisdropped
    left join pg_attrdef ad on ad.adrelid=a.attrelid and ad.adnum=a.attnum),'[]'::jsonb),
  'tipus_propis',coalesce((select jsonb_agg(jsonb_build_object('esquema',n.nspname,'nom',t.typname,'classe',t.typtype,
    'base_domini',case when t.typtype='d' then format_type(t.typbasetype,t.typtypmod) end,'domini_no_nul',t.typnotnull,
    'domini_default',t.typdefault,'enum',coalesce((select jsonb_agg(e.enumlabel order by e.enumsortorder) from pg_enum e where e.enumtypid=t.oid),'[]'::jsonb),
    'restriccions_domini',coalesce((select jsonb_agg(pg_get_constraintdef(co.oid,true) order by co.conname) from pg_constraint co where co.contypid=t.oid),'[]'::jsonb)) order by n.nspname,t.typname)
    from pg_type t join pg_namespace n on n.oid=t.typnamespace where t.oid in (
      select a.atttypid from pg_attribute a where a.attrelid in (select oid from objectes) and a.attnum>0 and not a.attisdropped
      union select ty.typelem from pg_attribute a join pg_type ty on ty.oid=a.atttypid where a.attrelid in (select oid from objectes) and a.attnum>0 and not a.attisdropped)
    and t.typtype in ('e','d')),'[]'::jsonb),
  'restriccions',coalesce((select jsonb_agg(jsonb_build_object('esquema',o.esquema,'taula',o.nom,'nom',c.conname,
    'definicio',pg_get_constraintdef(c.oid,true),'validada',c.convalidated,'diferible',c.condeferrable,'inicialment_diferida',c.condeferred)
    order by o.esquema,o.nom,c.conname) from objectes o join pg_constraint c on c.conrelid=o.oid),'[]'::jsonb),
  'indexs',coalesce((select jsonb_agg(jsonb_build_object('esquema',o.esquema,'taula',o.nom,'nom',ic.relname,'definicio',pg_get_indexdef(i.indexrelid),
    'valid',i.indisvalid) order by o.esquema,o.nom,ic.relname) from objectes o join pg_index i on i.indrelid=o.oid join pg_class ic on ic.oid=i.indexrelid),'[]'::jsonb),
  'triggers',coalesce((select jsonb_agg(jsonb_build_object('esquema',o.esquema,'taula',o.nom,'nom',t.tgname,'estat',t.tgenabled,
    'definicio',pg_get_triggerdef(t.oid,true),'funcio',t.tgfoid::regprocedure::text) order by o.esquema,o.nom,t.tgname)
    from objectes o join pg_trigger t on t.tgrelid=o.oid where not t.tgisinternal),'[]'::jsonb),
  'politiques_rls',coalesce((select jsonb_agg(jsonb_build_object('esquema',p.schemaname,'taula',p.tablename,'nom',p.policyname,
    'permissiva',p.permissive,'rols',p.roles,'operacio',p.cmd,'using',p.qual,'with_check',p.with_check) order by p.schemaname,p.tablename,p.policyname)
    from pg_policies p where exists(select 1 from objectes o where o.esquema=p.schemaname and o.nom=p.tablename)),'[]'::jsonb),
  'funcions',coalesce((select jsonb_agg(jsonb_build_object('signatura',p.oid::regprocedure::text,'esquema',n.nspname,'signatura_qualificada',format('%I.%I(%s)',n.nspname,p.proname,oidvectortypes(p.proargtypes)),'llenguatge',l.lanname,
    'retorn',pg_get_function_result(p.oid),'security_definer',p.prosecdef,'volatilitat',p.provolatile,'configuracio',array(select setting from unnest(p.proconfig) setting where setting like 'search_path=%' or setting like 'row_security=%'),
    'propietari',pg_get_userbyid(p.proowner),'acl',coalesce(p.proacl,acldefault('f',p.proowner))::text,
    'definicio',case when p.prosrc ~* '(password|passwd|api[_-]?key|authorization|bearer|sb_secret_|eyJ[A-Za-z0-9_-]{10})' then '[COS OMES: possible literal sensible; cal aportar una definicio anonimitzada]' else pg_get_functiondef(p.oid) end) order by n.nspname,p.proname,p.oid::regprocedure::text)
    from funcions f join pg_proc p on p.oid=f.oid join pg_namespace n on n.oid=p.pronamespace join pg_language l on l.oid=p.prolang where p.prokind='f'),'[]'::jsonb),
  'permisos_efectius_taules',coalesce((select jsonb_agg(jsonb_build_object('rol',r.rolname,'esquema',o.esquema,'taula',o.nom,
    'select',has_table_privilege(r.oid,o.oid,'SELECT'),'insert',has_table_privilege(r.oid,o.oid,'INSERT'),
    'update',has_table_privilege(r.oid,o.oid,'UPDATE'),'delete',has_table_privilege(r.oid,o.oid,'DELETE')) order by r.rolname,o.esquema,o.nom)
    from rols r cross join objectes o),'[]'::jsonb),
  'permisos_columnes',coalesce((select jsonb_agg(jsonb_build_object('esquema',o.esquema,'taula',o.nom,'columna',a.attname,'acl',a.attacl::text)
    order by o.esquema,o.nom,a.attnum) from objectes o join pg_attribute a on a.attrelid=o.oid where a.attnum>0 and not a.attisdropped and a.attacl is not null),'[]'::jsonb),
  'permisos_efectius_funcions',coalesce((select jsonb_agg(jsonb_build_object('rol',r.rolname,'signatura',p.oid::regprocedure::text,'esquema',n.nspname,'signatura_qualificada',format('%I.%I(%s)',n.nspname,p.proname,oidvectortypes(p.proargtypes)),
    'execute',has_function_privilege(r.oid,p.oid,'EXECUTE')) order by r.rolname,p.oid::regprocedure::text) from rols r cross join funcions f join pg_proc p on p.oid=f.oid join pg_namespace n on n.oid=p.pronamespace),'[]'::jsonb),
  'rols',coalesce((select jsonb_agg(jsonb_build_object('nom',r.rolname,'superusuari',r.rolsuper,'bypass_rls',r.rolbypassrls,'hereta',r.rolinherit) order by r.rolname) from pg_roles r where r.oid in (select oid from rols)),'[]'::jsonb),
  'esquemes',coalesce((select jsonb_agg(jsonb_build_object('nom',n.nspname,'acl',coalesce(n.nspacl,acldefault('n',n.nspowner))::text,
    'rol',r.rolname,'usage',has_schema_privilege(r.oid,n.oid,'USAGE'),'create',has_schema_privilege(r.oid,n.oid,'CREATE')) order by n.nspname,r.rolname)
    from pg_namespace n cross join rols r where n.nspname in ('public','storage','auth')),'[]'::jsonb),
  'privilegis_per_defecte',coalesce((select jsonb_agg(jsonb_build_object('esquema',n.nspname,'tipus',d.defaclobjtype,
    'rol',pg_get_userbyid(d.defaclrole),'acl',d.defaclacl::text) order by n.nspname,d.defaclobjtype,d.defaclrole)
    from pg_default_acl d left join pg_namespace n on n.oid=d.defaclnamespace where n.nspname in ('public','storage') or d.defaclnamespace=0),'[]'::jsonb),
  'bucket_portades',coalesce((select jsonb_agg(jsonb_build_object('id',b.id,'public',b.public,'file_size_limit',b.file_size_limit,
    'allowed_mime_types',b.allowed_mime_types)) from storage.buckets b where b.id='tsumige-portades'),'[]'::jsonb),
  'limits','Les dependències pg_depend no recullen necessàriament les crides internes PL/pgSQL o SQL dinàmic: contrastar els cossos i demanar només els auxiliars absents. No comprova Auth, Storage API, dades ni vincles reals.'
 ) as document
)
select jsonb_pretty(document || jsonb_build_object(
 'finalitat','Complement privat per recuperació: metadades tècniques íntegres; no és un dump executable ni còpia de dades o fitxers.',
 'extensions',coalesce((select jsonb_agg(jsonb_build_object('nom',e.extname,'versio',e.extversion,'esquema',n.nspname) order by e.extname) from pg_extension e join pg_namespace n on n.oid=e.extnamespace),'[]'::jsonb),
 'cossos_omesos',coalesce((select jsonb_agg(f->>'signatura') from jsonb_array_elements(document->'funcions') f where f->>'definicio' like '[COS OMES%'),'[]'::jsonb),
 'avis','Sense redacció global de noms tècnics: resultat privat. Els cossos amb indicis de secrets romanen omesos. No llegim comptes, credencials, accessos de convidats ni registres de fitxers. Recuperació completa també necessita ZIP/dades, portades i procediment assajat.'
)) as informe_esquema from informe;
