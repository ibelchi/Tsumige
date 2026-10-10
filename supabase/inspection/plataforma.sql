-- Només lectura. Executar separadament abans d'aprovar la migració preparada.
-- Els resultats poden incloure SQL intern: no publicar-los sense revisar.
select table_name, column_name, data_type, is_nullable, column_default
from information_schema.columns where table_schema='public'
and table_name in ('fitxes_joc','exemplars','experiencies') order by table_name,ordinal_position;
select conrelid::regclass as taula, conname, pg_get_constraintdef(oid)
from pg_constraint where conrelid in ('public.fitxes_joc'::regclass,'public.exemplars'::regclass,'public.experiencies'::regclass);
select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_policies where schemaname='public' and tablename in ('fitxes_joc','exemplars','experiencies');
select p.oid::regprocedure as funcio, pg_get_functiondef(p.oid)
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname in ('crear_registre','desar_registre','resum_jocs','restaurar_copia','pot_editar','estat_restauracio');
select tgrelid::regclass as taula, tgname, pg_get_triggerdef(oid)
from pg_trigger where not tgisinternal and tgrelid in ('public.fitxes_joc'::regclass,'public.exemplars'::regclass,'public.experiencies'::regclass);
-- Les combinacions requereixen context autenticat del propietari; auth.uid() nul no significa zero registres.
select auth.uid() as propietari_de_sessio;
-- Combinacions agregades; cap títol, comentari ni dada de compra.
select j.plataforma, e.botiga_servei, e.format, e.a_la_colleccio, count(*) as exemplars
from public.fitxes_joc j join public.exemplars e on e.joc_id=j.id
where j.user_id=auth.uid() and e.user_id=auth.uid()
group by j.plataforma,e.botiga_servei,e.format,e.a_la_colleccio order by 1,2,3,4;
-- Cobertura independent, incloent jocs sense fills, retirats i entrades sense any.
-- Només és significatiu amb auth.uid() del propietari i RLS contrastada.
select 'fitxes_joc' as taula,count(*) as total from public.fitxes_joc where user_id=auth.uid()
union all select 'exemplars',count(*) from public.exemplars where user_id=auth.uid()
union all select 'experiencies',count(*) from public.experiencies where user_id=auth.uid();
select count(*) filter(where a_la_colleccio) as actius,
 count(*) filter(where a_la_colleccio and format='fisic') as fisics,
 count(*) filter(where a_la_colleccio and format='digital') as digitals,
 count(*) filter(where not a_la_colleccio) as retirats from public.exemplars where user_id=auth.uid();
select 'exemplars' as taula,count(*) as vincles_orfes_o_aliens from public.exemplars e
left join public.fitxes_joc j on j.id=e.joc_id and j.user_id=e.user_id where e.user_id=auth.uid() and j.id is null
union all select 'experiencies',count(*) from public.experiencies e
left join public.fitxes_joc j on j.id=e.joc_id and j.user_id=e.user_id where e.user_id=auth.uid() and j.id is null;
select count(*) filter(where coalesce(btrim(plataforma),'')='') as plataformes_buides from public.fitxes_joc where user_id=auth.uid();
select c.relname,c.relrowsecurity,c.relforcerowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relname in ('fitxes_joc','exemplars','experiencies','proposits');
select p.oid::regprocedure,p.prosecdef,p.proconfig,p.proacl from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname in ('pot_editar','propietari_consulta','crear_registre','desar_registre','restaurar_copia','estat_restauracio');
