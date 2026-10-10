-- PREPARADA, NO EXECUTADA. Requereix revisar inspection/plataforma.sql.
-- Cap conversió, fusió, retirada ni reassignació de dades existents.
begin;
do $$ begin
 if to_regprocedure('public.crear_registre(text,uuid,jsonb,jsonb)') is null
 or to_regprocedure('public.desar_registre(text,uuid,jsonb,jsonb)') is null
 or to_regprocedure('public.restaurar_copia(jsonb,boolean,text)') is null then
   raise exception 'Cal contrastar les signatures reals dels RPC abans d''aplicar aquesta migració';
 end if;
end $$;
alter table public.fitxes_joc add column plataforma_resolta boolean not null default false;
-- Els registres antics continuen pendents; els nous tenen plataforma única.
alter table public.fitxes_joc alter column plataforma_resolta set default true;
create function public.normalitza_plataforma(p_text text) returns text
language sql immutable set search_path='' as $$
 select case lower(btrim(p_text)) when 'epic' then 'Epic Games' when 'epic games' then 'Epic Games'
 when 'epic games store' then 'Epic Games' when 'steam' then 'Steam' when 'itch.io' then 'itch.io'
 when 'pc' then 'PC' when 'emulador' then 'Emulador' else btrim(p_text) end
$$;
create function public.versio_plataforma() returns integer
language sql stable security invoker set search_path='' as $$ select 2 $$;
create function public.comprova_fitxa_plataforma() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
 if tg_op='UPDATE' and old.plataforma_resolta and not new.plataforma_resolta then
   raise exception 'No es pot substituir una plataforma resolta per una conversió antiga pendent';
 end if;
 if new.plataforma_resolta then
   new.plataforma:=public.normalitza_plataforma(new.plataforma);
   if new.plataforma is null or new.plataforma='' then raise exception 'Plataforma buida'; end if;
   if tg_op='UPDATE' and public.normalitza_plataforma(old.plataforma) is distinct from new.plataforma
    and (exists(select 1 from public.exemplars where joc_id=old.id) or exists(select 1 from public.experiencies where joc_id=old.id)) then
     raise exception 'Una plataforma diferent requereix revisar els registres i preservar Bitàcora';
   end if;
   if new.plataforma='Emulador' and exists(select 1 from public.exemplars where joc_id=new.id) then
     raise exception 'Emulador no pot tenir exemplars; cal revisar les dades històriques';
   end if;
   if new.plataforma='PC' and exists(select 1 from public.exemplars where joc_id=new.id and a_la_colleccio and format='digital' and public.normalitza_plataforma(botiga_servei) in ('Steam','Epic Games','itch.io')) then
     raise exception 'Un digital de botiga no pot quedar resolt com a PC';
   end if;
   if new.plataforma<>'PC'
    and exists(select 1 from public.exemplars where joc_id=new.id and a_la_colleccio and format='fisic')
    and exists(select 1 from public.exemplars where joc_id=new.id and a_la_colleccio and format='digital') then
     raise exception 'Cal revisar compres i conservar només el físic abans de confirmar la plataforma';
   end if;
 end if;
 return new;
end $$;
create trigger fitxa_plataforma before insert or update on public.fitxes_joc
for each row execute function public.comprova_fitxa_plataforma();
create function public.comprova_exemplar_plataforma() returns trigger
language plpgsql security invoker set search_path='' as $$
declare joc public.fitxes_joc;
begin
 -- Serialitza altes de formats diferents per al mateix joc.
 select * into joc from public.fitxes_joc where id=new.joc_id for update;
 if joc.plataforma_resolta then
   if joc.plataforma='Emulador' then raise exception 'Emulador només admet Bitàcora'; end if;
   if new.a_la_colleccio and joc.plataforma='PC' and new.format='digital' and public.normalitza_plataforma(new.botiga_servei) in ('Steam','Epic Games','itch.io') then
     raise exception 'Aquest digital requereix un registre a la plataforma de botiga';
   end if;
   if new.a_la_colleccio and joc.plataforma<>'PC' and exists(
     select 1 from public.exemplars e where e.joc_id=new.joc_id and e.id<>new.id
      and e.a_la_colleccio and e.format<>new.format) then
     raise exception 'Cal revisar les discrepàncies abans de consolidar físic i digital';
   end if;
 end if;
 return new;
end $$;
create trigger exemplar_plataforma before insert or update on public.exemplars
for each row execute function public.comprova_exemplar_plataforma();
create function public.desar_registre_plataforma(p_tipus text,p_id uuid,p_fitxa jsonb,p_dades jsonb) returns void
language plpgsql security invoker set search_path='' as $$
declare joc_id uuid; joc public.fitxes_joc;
begin
 if auth.uid() is null or not public.pot_editar() then raise exception 'Sense permís'; end if;
 if p_tipus='exemplar' then select e.joc_id into joc_id from public.exemplars e where e.id=p_id and e.user_id=auth.uid() for update;
 elsif p_tipus='experiencia' then select e.joc_id into joc_id from public.experiencies e where e.id=p_id and e.user_id=auth.uid() for update;
 else raise exception 'Tipus de registre desconegut'; end if;
 select * into joc from public.fitxes_joc j where j.id=joc_id and j.user_id=auth.uid() for update;
 if not found or not joc.plataforma_resolta then raise exception 'Conversió de plataforma pendent'; end if;
 if public.normalitza_plataforma(p_fitxa->>'plataforma') is distinct from joc.plataforma then
   raise exception 'Crear un altre joc per a una altra plataforma; no reassignar Bitàcora';
 end if;
 perform public.desar_registre(p_tipus,p_id,p_fitxa||jsonb_build_object('plataforma',joc.plataforma),p_dades);
end $$;
create function public.crear_registre_plataforma(p_tipus text,p_joc uuid,p_fitxa jsonb,p_dades jsonb) returns uuid
language plpgsql security invoker set search_path='' as $$
declare v_plataforma text:=public.normalitza_plataforma(p_fitxa->>'plataforma'); joc public.fitxes_joc; resultat uuid;
begin
 if auth.uid() is null or not public.pot_editar() then raise exception 'Sense permís'; end if;
 if p_tipus not in ('exemplar','experiencia') or v_plataforma is null or v_plataforma='' then raise exception 'Dades no vàlides'; end if;
 if p_joc is not null then
   select * into joc from public.fitxes_joc where id=p_joc and user_id=auth.uid() for update;
   if not found or not joc.plataforma_resolta or joc.plataforma is distinct from v_plataforma then raise exception 'Plataforma existent no resolta o diferent'; end if;
 elsif exists(select 1 from public.fitxes_joc where user_id=auth.uid()
   and lower(btrim(nom))=lower(btrim(p_fitxa->>'nom')) and lower(public.normalitza_plataforma(fitxes_joc.plataforma))=lower(v_plataforma)) then
   raise exception 'Aquest joc ja existeix amb aquesta plataforma; selecciona explícitament el registre';
 end if;
 if p_tipus='exemplar' and v_plataforma='Emulador' then raise exception 'Emulador només admet Bitàcora'; end if;
 resultat:=public.crear_registre(p_tipus,p_joc,p_fitxa||jsonb_build_object('plataforma',v_plataforma),p_dades||jsonb_build_object('botiga_servei',null));
 return resultat;
end $$;
-- Conserva el motor transaccional existent i manté també l'entrada RPC antiga.
alter function public.restaurar_copia(jsonb,boolean,text) rename to restaurar_copia_legacy;
create function public.restaurar_copia_plataforma(p_copia jsonb,p_actualitzar boolean,p_estat text) returns void
language plpgsql security invoker set search_path='' as $$
declare versio integer:=(p_copia->>'format_version')::integer; preparat jsonb; antics uuid[]; r jsonb;
begin
 if auth.uid() is null or not public.pot_editar() then raise exception 'Sense permís'; end if;
 if versio is null or versio not in (1,2) then raise exception 'Versió de còpia desconeguda'; end if;
 select coalesce(array_agg(id),'{}') into antics from public.fitxes_joc where user_id=auth.uid();
 for r in select value from jsonb_array_elements(p_copia->'fitxes_joc') loop
   if versio=2 and jsonb_typeof(r->'plataforma_resolta') is distinct from 'boolean' then raise exception 'Estat de plataforma absent'; end if;
   if p_actualitzar and (versio=1 or not (r->>'plataforma_resolta')::boolean)
    and exists(select 1 from public.fitxes_joc where id=(r->>'id')::uuid and user_id=auth.uid() and plataforma_resolta) then
     raise exception 'Una còpia antiga no pot sobreescriure una plataforma resolta sense conciliació explícita';
   end if;
 end loop;
 preparat:=jsonb_set(p_copia,'{format_version}','1');
 preparat:=jsonb_set(preparat,'{fitxes_joc}',coalesce((select jsonb_agg(item.value||jsonb_build_object('plataforma_resolta',case when versio=1 then false else (item.value->>'plataforma_resolta')::boolean end)) from jsonb_array_elements(p_copia->'fitxes_joc') item),'[]'));
 -- Reutilitza els locks, fingerprint, RLS i transacció de la restauració existent.
 perform public.restaurar_copia_legacy(preparat,p_actualitzar,p_estat);
 for r in select value from jsonb_array_elements(preparat->'fitxes_joc') loop
   if p_actualitzar or not ((r->>'id')::uuid=any(antics)) then
     update public.fitxes_joc set plataforma_resolta=(r->>'plataforma_resolta')::boolean
      where id=(r->>'id')::uuid and user_id=auth.uid()
       and plataforma_resolta is distinct from (r->>'plataforma_resolta')::boolean;
   end if;
 end loop;
end $$;
create function public.restaurar_copia(p_copia jsonb,p_actualitzar boolean,p_estat text) returns void
language sql security invoker set search_path='' as $$
 select public.restaurar_copia_plataforma(p_copia,p_actualitzar,p_estat)
$$;
revoke all on function public.restaurar_copia(jsonb,boolean,text) from public;
grant execute on function public.restaurar_copia(jsonb,boolean,text) to authenticated;
revoke all on function public.versio_plataforma() from public;
revoke all on function public.desar_registre_plataforma(text,uuid,jsonb,jsonb) from public;
revoke all on function public.crear_registre_plataforma(text,uuid,jsonb,jsonb) from public;
revoke all on function public.restaurar_copia_plataforma(jsonb,boolean,text) from public;
grant execute on function public.versio_plataforma(), public.desar_registre_plataforma(text,uuid,jsonb,jsonb),
 public.crear_registre_plataforma(text,uuid,jsonb,jsonb), public.restaurar_copia_plataforma(jsonb,boolean,text) to authenticated;
-- Executor explícit: només IDs revisats i fingerprint privat. No es crida automàticament.
create function public.convertir_plataformes(p_retirar uuid[], p_estat text) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare abans jsonb; despres jsonb; n integer;
begin
 if auth.uid() is null or not public.pot_editar() then raise exception 'Sense permís'; end if;
 perform 1 from public.fitxes_joc where user_id=auth.uid() order by id for update;
 perform 1 from public.exemplars where user_id=auth.uid() order by id for update;
 perform 1 from public.experiencies where user_id=auth.uid() order by id for update;
 if p_estat is distinct from public.estat_restauracio() then raise exception 'Les dades han canviat: revisar de nou el pla'; end if;
 if p_retirar is null or cardinality(p_retirar)<>(select count(distinct x) from unnest(p_retirar) x) then raise exception 'Pla absent o amb IDs duplicats'; end if;
 if exists(select 1 from unnest(p_retirar) x where not exists(
   select 1 from public.exemplars e join public.fitxes_joc j on j.id=e.joc_id
   where e.id=x and e.user_id=auth.uid() and j.user_id=auth.uid() and e.a_la_colleccio and e.format='digital'
    and public.normalitza_plataforma(j.plataforma)='Nintendo Switch'
    and (select count(*) from public.exemplars f where f.joc_id=j.id and f.user_id=auth.uid() and f.a_la_colleccio and f.format='fisic')=1)) then
   raise exception 'Cada retirada ha de correspondre a un digital actiu amb un únic físic Switch revisat';
 end if;
 if exists(select 1 from public.exemplars e left join public.fitxes_joc j on j.id=e.joc_id where e.user_id=auth.uid() and (j.id is null or j.user_id<>e.user_id))
 or exists(select 1 from public.experiencies e left join public.fitxes_joc j on j.id=e.joc_id where e.user_id=auth.uid() and (j.id is null or j.user_id<>e.user_id)) then raise exception 'Vincles no coberts pel diagnòstic'; end if;
 if exists(select 1 from public.fitxes_joc j where j.user_id=auth.uid() and (
   coalesce(btrim(j.plataforma),'')='' or
   exists(select 1 from public.exemplars e where e.joc_id=j.id and coalesce(btrim(e.botiga_servei),'')<>'' and public.normalitza_plataforma(e.botiga_servei)<>public.normalitza_plataforma(j.plataforma)) or
   exists(select 1 from public.experiencies e where e.joc_id=j.id and e.valoracio is not null and e.valoracio is distinct from j.valoracio) or
   exists(select 1 from public.exemplars e where e.joc_id=j.id and coalesce(btrim(e.notes),'')<>'' and btrim(e.notes)<>coalesce(btrim(j.comentaris),'')) or
   exists(select 1 from public.experiencies e where e.joc_id=j.id and coalesce(btrim(e.notes),'')<>'' and btrim(e.notes)<>coalesce(btrim(j.comentaris),'')) or
   exists(select 1 from public.fitxes_joc o where o.user_id=j.user_id and o.id<>j.id and lower(btrim(o.nom))=lower(btrim(j.nom)) and lower(public.normalitza_plataforma(o.plataforma))=lower(public.normalitza_plataforma(j.plataforma)))
 )) then raise exception 'Discrepància no resolta; cap conversió aplicada'; end if;
 select jsonb_build_object('jocs',count(*),'pendents',count(*) filter(where not plataforma_resolta)) into abans from public.fitxes_joc where user_id=auth.uid();
 update public.exemplars set a_la_colleccio=false where user_id=auth.uid() and id=any(p_retirar);
 get diagnostics n=row_count;
 -- Els triggers rebutgen Emulador amb exemplars i qualsevol barreja de formats restant.
 -- Només alias canònics; no s'infereix cap botiga ni es modifica cap vincle.
 update public.fitxes_joc set plataforma=public.normalitza_plataforma(plataforma),plataforma_resolta=true
  where user_id=auth.uid() and (not plataforma_resolta or plataforma is distinct from public.normalitza_plataforma(plataforma));
 select jsonb_build_object('jocs',count(*),'pendents',count(*) filter(where not plataforma_resolta)) into despres from public.fitxes_joc where user_id=auth.uid();
 return jsonb_build_object('abans',abans,'despres',despres,'digitals_retirats',n);
end $$;
revoke all on function public.convertir_plataformes(uuid[],text) from public,anon;
grant execute on function public.convertir_plataformes(uuid[],text) to authenticated;
commit;
