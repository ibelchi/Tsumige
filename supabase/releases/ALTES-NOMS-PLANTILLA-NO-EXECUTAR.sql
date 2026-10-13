-- PLANTILLA DE REVISIÓ. Per aplicar dades reals cal bundle privat amb empremtes actuals.
begin isolation level serializable;
set local lock_timeout='10s';
set local statement_timeout='120s';
lock table public.fitxes_joc,public.exemplars,public.experiencies,public.proposits,public.accessos_convidats in access exclusive mode;
-- GUARDA_CAPTURA_PRIVADA
do $template$ begin raise exception 'Plantilla no executable: cal captura i bundle privat'; end $template$;
-- PREPARADA. NO APLICAR separadament de la tanda conjunta autoritzada.


do $$ begin
 if public.versio_plataforma() <> 2 then raise exception 'Cal el model Plataforma 2'; end if;
 if exists(select 1 from public.fitxes_joc group by user_id,lower(btrim(nom)),lower(case lower(btrim(plataforma)) when 'gb' then 'Game Boy' when 'game boy' then 'Game Boy' when 'gba' then 'Game Boy Advance' when 'game boy advance' then 'Game Boy Advance' when 'n64' then 'Nintendo 64' when 'nintendo 64' then 'Nintendo 64' when 'nds' then 'Nintendo DS' when 'nintendo ds' then 'Nintendo DS' when 'nes' then 'NES' when 'nintendo entertainment system' then 'NES' when 'snes' then 'Super Nintendo' when 'super nintendo' then 'Super Nintendo' when 'super nintendo entertainment system' then 'Super Nintendo' when 'md' then 'Mega Drive' when 'mega drive' then 'Mega Drive' when 'xbox360' then 'Xbox 360' when 'xbox 360' then 'Xbox 360' when 'ps4' then 'PlayStation 4' when 'playstation 4' then 'PlayStation 4' when 'famicom' then 'Famicom' when 'msx' then 'MSX' when 'xbox' then 'XBOX' when 'epic' then 'Epic Games' when 'epic games' then 'Epic Games' when 'epic games store' then 'Epic Games' when 'steam' then 'Steam' when 'itch.io' then 'itch.io' when 'pc' then 'PC' when 'emulador' then 'Emulador' else btrim(plataforma) end)
 having count(*)>1 and bool_or(plataforma is distinct from case lower(btrim(plataforma)) when 'gb' then 'Game Boy' when 'game boy' then 'Game Boy' when 'gba' then 'Game Boy Advance' when 'game boy advance' then 'Game Boy Advance' when 'n64' then 'Nintendo 64' when 'nintendo 64' then 'Nintendo 64' when 'nds' then 'Nintendo DS' when 'nintendo ds' then 'Nintendo DS' when 'nes' then 'NES' when 'nintendo entertainment system' then 'NES' when 'snes' then 'Super Nintendo' when 'super nintendo' then 'Super Nintendo' when 'super nintendo entertainment system' then 'Super Nintendo' when 'md' then 'Mega Drive' when 'mega drive' then 'Mega Drive' when 'xbox360' then 'Xbox 360' when 'xbox 360' then 'Xbox 360' when 'ps4' then 'PlayStation 4' when 'playstation 4' then 'PlayStation 4' when 'famicom' then 'Famicom' when 'msx' then 'MSX' when 'xbox' then 'XBOX' when 'epic' then 'Epic Games' when 'epic games' then 'Epic Games' when 'epic games store' then 'Epic Games' when 'steam' then 'Steam' when 'itch.io' then 'itch.io' when 'pc' then 'PC' when 'emulador' then 'Emulador' else btrim(plataforma) end))
 then raise exception 'Col·lisions de noms: revisar IDs i dades; no es fusiona'; end if;
end $$;
create or replace function public.normalitza_plataforma(p_text text) returns text
language sql immutable set search_path='' as $$ select case lower(btrim(p_text)) when 'gb' then 'Game Boy' when 'game boy' then 'Game Boy' when 'gba' then 'Game Boy Advance' when 'game boy advance' then 'Game Boy Advance' when 'n64' then 'Nintendo 64' when 'nintendo 64' then 'Nintendo 64' when 'nds' then 'Nintendo DS' when 'nintendo ds' then 'Nintendo DS' when 'nes' then 'NES' when 'nintendo entertainment system' then 'NES' when 'snes' then 'Super Nintendo' when 'super nintendo' then 'Super Nintendo' when 'super nintendo entertainment system' then 'Super Nintendo' when 'md' then 'Mega Drive' when 'mega drive' then 'Mega Drive' when 'xbox360' then 'Xbox 360' when 'xbox 360' then 'Xbox 360' when 'ps4' then 'PlayStation 4' when 'playstation 4' then 'PlayStation 4' when 'famicom' then 'Famicom' when 'msx' then 'MSX' when 'xbox' then 'XBOX' when 'epic' then 'Epic Games' when 'epic games' then 'Epic Games' when 'epic games store' then 'Epic Games' when 'steam' then 'Steam' when 'itch.io' then 'itch.io' when 'pc' then 'PC' when 'emulador' then 'Emulador' else btrim(p_text) end $$;
update public.fitxes_joc set plataforma=public.normalitza_plataforma(plataforma)
 where plataforma is distinct from public.normalitza_plataforma(plataforma);

-- PREPARADA LOCALMENT. No aplicar sense revisar diagnòstic i autorització.
-- Només RPC; cap conversió ni restricció global sobre registres antics.

create function public.versio_altes() returns integer
language sql stable security invoker set search_path='' as $$ select 1 $$;
create function public.alta_registre(p_tipus text,p_id uuid,p_joc uuid,p_fitxa jsonb,p_dades jsonb,
 p_edita boolean,p_updated_at timestamptz,p_retira jsonb) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare propietari uuid:=auth.uid(); joc public.fitxes_joc; nou uuid; anterior public.exemplars;
 existent uuid; n integer; v_plataforma text; nom_joc text; any_joc integer; v_any_compra integer;
 v_preu numeric; v_format text; v_jugant boolean; v_valoracio text;
begin
 if propietari is null or not public.pot_editar() then raise exception 'ALTA_PERMIS'; end if;
 if p_tipus is null or p_tipus not in ('exemplar','experiencia') or p_id is null or p_edita is null then raise exception 'ALTA_DADES'; end if;
 -- Les altes d'un mateix propietari es serialitzen, també entre plataformes i anys.
 perform pg_advisory_xact_lock(hashtextextended(propietari::text,0));
 -- Reintent de la mateixa petició després d'una resposta perduda: no duplica ni torna a editar.
 if p_tipus='exemplar' then select id,joc_id into existent,nou from public.exemplars where id=p_id and user_id=propietari;
 else select id,joc_id into existent,nou from public.experiencies where id=p_id and user_id=propietari; end if;
 if existent is not null then return jsonb_build_object('id',existent,'joc_id',nou,'existent',false); end if;
 if p_tipus='experiencia' then
  any_joc:=(p_dades->>'any_jugat')::integer;
  if any_joc is null or any_joc<1 or any_joc>9999 then raise exception 'ALTA_ANY'; end if;
 else
  v_format:=p_dades->>'format';
  if v_format is null or v_format not in ('fisic','digital') then raise exception 'ALTA_DADES'; end if;
  v_any_compra:=(p_dades->>'any_compra')::integer; v_preu:=(p_dades->>'preu')::numeric;
  if v_any_compra<1 or v_any_compra>9999 or v_preu<0 or v_preu>9999999999.99 then raise exception 'ALTA_DADES'; end if;
 end if;
 if p_joc is not null then
  select * into joc from public.fitxes_joc where id=p_joc and user_id=propietari for update;
  if not found then raise exception 'ALTA_PERMIS'; end if;
  if not joc.plataforma_resolta then raise exception 'ALTA_PENDENT'; end if;
  nou:=joc.id; v_plataforma:=joc.plataforma; nom_joc:=joc.nom;
  if p_edita and joc.updated_at is distinct from p_updated_at then raise exception 'ALTA_CANVI'; end if;
 else
  v_plataforma:=public.normalitza_plataforma(p_fitxa->>'plataforma');nom_joc:=btrim(p_fitxa->>'nom');
  if v_plataforma is null or v_plataforma='' or nom_joc is null or nom_joc='' then raise exception 'ALTA_DADES'; end if;
  if exists(select 1 from public.fitxes_joc where user_id=propietari and lower(btrim(nom))=lower(nom_joc)
   and lower(public.normalitza_plataforma(fitxes_joc.plataforma))=lower(v_plataforma)) then raise exception 'ALTA_JOC_EXISTENT'; end if;
 end if;
 if p_tipus='exemplar' and v_plataforma='Emulador' then raise exception 'ALTA_EMULADOR'; end if;
 -- Comprovar abans d'editar dades compartides o retirar exemplars.
 if p_joc is not null and p_tipus='experiencia' then
  perform 1 from public.experiencies where joc_id=nou and user_id=propietari order by id for update;
  select count(*),min(id::text)::uuid into n,existent from public.experiencies where joc_id=nou and user_id=propietari and any_jugat=any_joc;
  if n>1 then raise exception 'ALTA_MULTIPLES'; end if;
  if n=1 then return jsonb_build_object('id',existent,'joc_id',nou,'existent',true); end if;
 elsif p_joc is not null then
  perform 1 from public.exemplars where joc_id=nou and user_id=propietari order by id for update;
  select count(*) into n from public.exemplars where joc_id=nou and user_id=propietari and a_la_colleccio;
  if n>1 then raise exception 'ALTA_MULTIPLES'; end if;
  if n=1 then
   select * into anterior from public.exemplars where joc_id=nou and user_id=propietari and a_la_colleccio;
   if anterior.format=v_format or anterior.format='fisic' then
    return jsonb_build_object('id',anterior.id,'joc_id',nou,'existent',true);
   end if;
   -- Únic digital -> físic: confirmació de l'ID i timestamp observats, sense esborrar dades.
   if p_retira is null or (p_retira->>'id')::uuid is distinct from anterior.id then raise exception 'ALTA_CONFLICTE'; end if;
   if (p_retira->>'updated_at')::timestamptz is distinct from anterior.updated_at then raise exception 'ALTA_CANVI'; end if;
  end if;
 end if;
 if p_joc is null or p_edita then
  if jsonb_typeof(p_fitxa->'generos_secundaris') is distinct from 'array' then raise exception 'ALTA_DADES'; end if;
  if exists(select 1 from jsonb_array_elements(p_fitxa->'generos_secundaris') v where jsonb_typeof(v)<>'string') then raise exception 'ALTA_DADES'; end if;
  v_valoracio:=p_fitxa->>'valoracio';
  if v_valoracio is not null and v_valoracio not in ('A++','A+','A','B','C','D') then raise exception 'ALTA_DADES'; end if;
  if (p_fitxa->>'any_llancament')::integer<1 or (p_fitxa->>'any_llancament')::integer>9999 then raise exception 'ALTA_DADES'; end if;
  if p_joc is null then
   insert into public.fitxes_joc(user_id,nom,plataforma,plataforma_resolta) values(propietari,nom_joc,v_plataforma,true) returning id into nou;
  end if;
  update public.fitxes_joc set desenvolupadora=p_fitxa->>'desenvolupadora',genere_principal=p_fitxa->>'genere_principal',
   generos_secundaris=array(select jsonb_array_elements_text(p_fitxa->'generos_secundaris')),sinopsi=p_fitxa->>'sinopsi',
   any_llancament=(p_fitxa->>'any_llancament')::integer,portada_url=p_fitxa->>'portada_url',portada_font_url=p_fitxa->>'portada_font_url',
   per_infants=coalesce((p_fitxa->>'per_infants')::boolean,false),per_jugar_aviat=coalesce((p_fitxa->>'per_jugar_aviat')::boolean,false),
   valoracio=v_valoracio,comentaris=p_fitxa->>'comentaris' where id=nou and user_id=propietari;
 end if;
 if p_tipus='exemplar' then
  if anterior.id is not null then update public.exemplars set a_la_colleccio=false where id=anterior.id and user_id=propietari; end if;
  insert into public.exemplars(id,user_id,joc_id,format,regio,estat_conservacio,any_compra,preu,favorit,canvi,reproduccio,no_localitzat,a_la_colleccio)
   values(p_id,propietari,nou,v_format,p_dades->>'regio',p_dades->>'estat_conservacio',v_any_compra,v_preu,
    coalesce((p_dades->>'favorit')::boolean,false),coalesce((p_dades->>'canvi')::boolean,false),
    coalesce((p_dades->>'reproduccio')::boolean,false),(p_dades->>'no_localitzat')::boolean,true);
 else
  v_jugant:=coalesce((p_dades->>'jugant')::boolean,false);
  insert into public.experiencies(id,user_id,joc_id,any_jugat,completat,valoracio,jugant)
   select p_id,propietari,nou,any_joc,p_dades->>'completat',j.valoracio,v_jugant from public.fitxes_joc j where j.id=nou;
  if not v_jugant then update public.experiencies set jugant=false where joc_id=nou and user_id=propietari and experiencies.jugant; end if;
 end if;
 return jsonb_build_object('id',p_id,'joc_id',nou,'existent',false);
end $$;
revoke all on function public.versio_altes(),public.alta_registre(text,uuid,uuid,jsonb,jsonb,boolean,timestamptz,jsonb) from public,anon;
grant execute on function public.versio_altes(),public.alta_registre(text,uuid,uuid,jsonb,jsonb,boolean,timestamptz,jsonb) to authenticated;

-- GUARDA_POSTERIOR_PRIVADA
commit;
