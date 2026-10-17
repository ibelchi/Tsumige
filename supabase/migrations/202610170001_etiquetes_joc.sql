-- PREPARACIÓ: ASSAJADA EN PGLITE LOCAL, NO APLICADA A SUPABASE.
-- Revisar docs/PLA-ETIQUETES.md abans d'autoritzar-ne l'execució.
-- Una transacció; cap DROP, conversió d'historial ni canvi de permisos.
begin;
set local lock_timeout = '5s';
lock table public.fitxes_joc in access exclusive mode;
do $guard$
begin
 if not (select relrowsecurity from pg_class where oid='public.fitxes_joc'::regclass) then
  raise exception 'RLS de fitxes_joc no activa: aturar i contrastar esquema';
 end if;
 if exists(select 1 from pg_attribute where attrelid='public.fitxes_joc'::regclass
  and attname in ('no_jugat','intencio_joc') and not attisdropped) then
  raise exception 'Camps ja presents: no repetir ni adaptar automàticament';
 end if;
 if to_regprocedure('public.desar_registre_plataforma(text,uuid,jsonb,jsonb)') is null
 or to_regprocedure('public.crear_registre_plataforma(text,uuid,jsonb,jsonb)') is null
 or to_regprocedure('public.restaurar_copia_plataforma(jsonb,boolean,text)') is null
 or to_regprocedure('public.estat_restauracio()') is null then
  raise exception 'Dependències Plataforma/restauració absents';
 end if;
end $guard$;
alter table public.fitxes_joc
 add column no_jugat boolean not null default false,
 add column intencio_joc text default null,
 add constraint fitxes_joc_intencio_joc_check check (intencio_joc in ('vull','no_vull'));

-- Pedaços acotats sobre la definició real: CREATE OR REPLACE conserva OID,
-- signatura, resultat, propietari i ACL. Un ancoratge absent/repetit avorta.
do $patch$
declare sig text; old_sql text; new_sql text; needle text; replacement text;
 f record; i integer;
begin
 for i in 1..3 loop
  sig:=case i
   when 1 then 'public.desar_registre(text,uuid,jsonb,jsonb)'
   when 2 then 'public.alta_registre(text,uuid,uuid,jsonb,jsonb,boolean,timestamp with time zone,jsonb)'
   when 3 then 'public.restaurar_copia_legacy(jsonb,boolean,text)' end;
  select p.oid,p.prosecdef,p.prorettype,p.proowner,p.proacl,l.lanname
   into f from pg_proc p join pg_language l on l.oid=p.prolang where p.oid=to_regprocedure(sig);
  if not found or f.prosecdef or f.lanname<>'plpgsql'
   or f.prorettype <> (case when i=2 then 'jsonb'::regtype else 'void'::regtype end) then
   raise exception 'RPC absent o contracte inesperat: %',sig;
  end if;
  old_sql:=pg_get_functiondef(f.oid);
  if position('no_jugat' in old_sql)>0 or position('intencio_joc' in old_sql)>0 then
   raise exception 'RPC ja adaptada o desconeguda: %',sig;
  end if;
  if i in (1,2) then
   needle:=case when i=1 then 'update public.fitxes_joc set' else 'update public.fitxes_joc set desenvolupadora=' end;
   replacement:=case when i=1 then 'update public.fitxes_joc set' else 'update public.fitxes_joc set' end || $assign$
    no_jugat=case when p_fitxa ? 'no_jugat' then
      case when jsonb_typeof(p_fitxa->'no_jugat')='boolean' then (p_fitxa->>'no_jugat')::boolean else null end
      else no_jugat end,
    intencio_joc=case when p_fitxa ? 'intencio_joc' then p_fitxa->>'intencio_joc' else intencio_joc end,
$assign$ || case when i=2 then 'desenvolupadora=' else '' end;
  else
   needle:='insert into public.fitxes_joc select * from jsonb_populate_recordset';
   replacement:=$restore$
 -- Els locks i l'empremta del motor original ja s'han comprovat aquí.
 for row_data in select value from jsonb_array_elements(p_copia->'fitxes_joc') loop
  if (row_data ? 'no_jugat' and jsonb_typeof(row_data->'no_jugat') is distinct from 'boolean')
   or (row_data ? 'intencio_joc' and row_data->'intencio_joc' <> 'null'::jsonb
       and (jsonb_typeof(row_data->'intencio_joc') is distinct from 'string'
            or row_data->>'intencio_joc' not in ('vull','no_vull'))) then
   raise exception 'Etiquetes de còpia no vàlides';
  end if;
 end loop;
 p_copia:=jsonb_set(p_copia,'{fitxes_joc}',coalesce((
  select jsonb_agg(jsonb_build_object(
   'no_jugat',coalesce(j.no_jugat,false),'intencio_joc',j.intencio_joc)||r.value)
  from jsonb_array_elements(p_copia->'fitxes_joc') r
  left join public.fitxes_joc j on j.id=(r.value->>'id')::uuid and j.user_id=owner
 ),'[]'::jsonb));
 insert into public.fitxes_joc select * from jsonb_populate_recordset$restore$;
  end if;
  if (length(old_sql)-length(replace(old_sql,needle,'')))/length(needle) <> 1 then
   raise exception 'Ancoratge no únic: %; contrastar definició real',sig;
  end if;
  new_sql:=replace(old_sql,needle,replacement);
  if i=3 then
   needle:='per_jugar_aviat=excluded.per_jugar_aviat';
   if (length(new_sql)-length(replace(new_sql,needle,'')))/length(needle) <> 1 then
    raise exception 'Restauració desconeguda: no modificar';
   end if;
   new_sql:=replace(new_sql,needle,'no_jugat=excluded.no_jugat,intencio_joc=excluded.intencio_joc,'||needle);
  end if;
  execute new_sql;
  if not exists(select 1 from pg_proc p where p.oid=f.oid and p.proowner=f.proowner
   and p.proacl is not distinct from f.proacl and p.prosecdef=false and p.prorettype=f.prorettype) then
   raise exception 'Contracte/ACL alterat: %',sig;
  end if;
 end loop;
end $patch$;
commit;
-- Recarregar la memòria d'esquema PostgREST només quan s'autoritzi l'aplicació.
-- NOTIFY pgrst, 'reload schema';
