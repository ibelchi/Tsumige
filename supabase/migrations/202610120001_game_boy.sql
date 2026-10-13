-- PREPARADA, NO APLICADA. Diagnosticar coincidències GB/Game Boy abans d'autoritzar.
-- IDs i vincles es conserven. Cap fusió; només nom canònic i timestamps dels jocs afectats.
begin;
lock table public.fitxes_joc in share row exclusive mode;
do $$ begin
 if public.versio_plataforma() <> 2 then raise exception 'Cal el model Plataforma 2'; end if;
 if exists(select 1 from public.fitxes_joc where lower(btrim(plataforma)) in ('gb','game boy')
  group by user_id,lower(btrim(nom)) having count(*)>1 and bool_or(lower(btrim(plataforma))='gb'))
 then raise exception 'Coincidències GB/Game Boy: revisar IDs i dades abans de convertir; no es fusiona'; end if;
end $$;
create or replace function public.normalitza_plataforma(p_text text) returns text
language sql immutable set search_path='' as $$
 select case lower(btrim(p_text)) when 'gb' then 'Game Boy' when 'game boy' then 'Game Boy'
 when 'epic' then 'Epic Games' when 'epic games' then 'Epic Games' when 'epic games store' then 'Epic Games'
 when 'steam' then 'Steam' when 'itch.io' then 'itch.io' when 'pc' then 'PC' when 'emulador' then 'Emulador' else btrim(p_text) end
$$;
update public.fitxes_joc set plataforma='Game Boy' where lower(btrim(plataforma))='gb';
commit;
