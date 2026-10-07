begin;
alter table public.fitxes_joc add column if not exists portada_fitxer text;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('tsumige-portades','tsumige-portades',false,20971520,array['image/jpeg','image/png','image/webp','image/gif','image/avif'])
on conflict(id) do nothing;
create policy portades_consulta on storage.objects for select to authenticated
using(bucket_id='tsumige-portades' and (storage.foldername(name))[1]=(select public.propietari_consulta())::text);
create policy portades_alta on storage.objects for insert to authenticated
with check(bucket_id='tsumige-portades' and (select public.pot_editar()) and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy portades_elimina on storage.objects for delete to authenticated
using(bucket_id='tsumige-portades' and (select public.pot_editar()) and (storage.foldername(name))[1]=(select auth.uid())::text);

create function public.estat_restauracio() returns text
language sql stable security invoker set search_path='' as $$
 select md5(jsonb_build_array(
   (select coalesce(jsonb_agg(to_jsonb(t) order by id),'[]') from public.fitxes_joc t where user_id=auth.uid()),
   (select coalesce(jsonb_agg(to_jsonb(t) order by id),'[]') from public.exemplars t where user_id=auth.uid()),
   (select coalesce(jsonb_agg(to_jsonb(t) order by id),'[]') from public.experiencies t where user_id=auth.uid()),
   (select coalesce(jsonb_agg(to_jsonb(t) order by id),'[]') from public.proposits t where user_id=auth.uid())
 )::text)
$$;

create function public.restaurar_copia(p_copia jsonb,p_actualitzar boolean,p_estat text) returns void
language plpgsql security invoker set search_path='' as $$
declare t text; row_data jsonb; owner uuid:=auth.uid();
begin
 if owner is null or not public.pot_editar() then raise exception 'Sense permís de restauració'; end if;
 if p_copia->>'app' is distinct from 'tsumige' or (p_copia->>'format_version')::int is distinct from 1 or (p_copia->>'user_id')::uuid is distinct from owner then raise exception 'Còpia incompatible amb el compte'; end if;
 if length(p_copia::text)>20971520 then raise exception 'Les dades superen 20 MB'; end if;
 -- Lock existing rows before checking the preview fingerprint. Ordinary edits
 -- cannot change those rows between this check and the transactional restore.
 perform 1 from public.fitxes_joc where user_id=owner order by id for update;
 perform 1 from public.exemplars where user_id=owner order by id for update;
 perform 1 from public.experiencies where user_id=owner order by id for update;
 perform 1 from public.proposits where user_id=owner order by id for update;
 if p_estat is distinct from public.estat_restauracio() then raise exception 'Les dades han canviat. Torna a revisar la còpia.'; end if;
 foreach t in array array['fitxes_joc','exemplars','experiencies','proposits'] loop
   if jsonb_typeof(p_copia->t) is distinct from 'array' or jsonb_array_length(p_copia->t)>100000 then raise exception 'Taula no vàlida'; end if;
   for row_data in select value from jsonb_array_elements(p_copia->t) loop
     if (row_data->>'user_id')::uuid is distinct from owner or row_data->>'id' is null then raise exception 'Registre aliè o sense identificador'; end if;
   end loop;
 end loop;
 if exists(select 1 from jsonb_array_elements(p_copia->'fitxes_joc') r
   where r->>'portada_fitxer' is not null and (r->>'portada_fitxer' not like owner::text||'/%' or not exists(select 1 from storage.objects where bucket_id='tsumige-portades' and name=r->>'portada_fitxer'))) then raise exception 'Portada no disponible'; end if;
 if exists(select 1 from jsonb_array_elements(p_copia->'experiencies') e join jsonb_array_elements(p_copia->'fitxes_joc') j on e->>'joc_id'=j->>'id'
   where (e->>'valoracio') is distinct from (j->>'valoracio')) then raise exception 'Valoracions contradictòries a la còpia'; end if;

 insert into public.fitxes_joc select * from jsonb_populate_recordset(null::public.fitxes_joc,p_copia->'fitxes_joc')
 on conflict(id) do update set
  nom=excluded.nom,plataforma=excluded.plataforma,desenvolupadora=excluded.desenvolupadora,
  genere_principal=excluded.genere_principal,generos_secundaris=excluded.generos_secundaris,any_llancament=excluded.any_llancament,
  sinopsi=excluded.sinopsi,portada_url=excluded.portada_url,portada_font_url=excluded.portada_font_url,portada_fitxer=excluded.portada_fitxer,
  per_jugar_aviat=excluded.per_jugar_aviat,per_infants=excluded.per_infants,comentaris=excluded.comentaris,valoracio=excluded.valoracio
 where p_actualitzar and fitxes_joc.user_id=owner;
 insert into public.exemplars select * from jsonb_populate_recordset(null::public.exemplars,p_copia->'exemplars')
 on conflict(id) do update set
  joc_id=excluded.joc_id,format=excluded.format,regio=excluded.regio,estat_conservacio=excluded.estat_conservacio,
  notes=excluded.notes,any_compra=excluded.any_compra,preu=excluded.preu,botiga_servei=excluded.botiga_servei,
  favorit=excluded.favorit,canvi=excluded.canvi,reproduccio=excluded.reproduccio,no_localitzat=excluded.no_localitzat,
  a_la_colleccio=excluded.a_la_colleccio,revisat=excluded.revisat,origen=excluded.origen
 where p_actualitzar and exemplars.user_id=owner;
 -- Merge must not change existing game ratings through compatibility triggers.
 p_copia:=jsonb_set(p_copia,'{experiencies}',coalesce((select jsonb_agg(e||jsonb_build_object('valoracio',j.valoracio))
   from jsonb_array_elements(p_copia->'experiencies') e join public.fitxes_joc j on j.id=(e->>'joc_id')::uuid and j.user_id=owner),'[]'));
 insert into public.experiencies select * from jsonb_populate_recordset(null::public.experiencies,p_copia->'experiencies')
 on conflict(id) do update set
  joc_id=excluded.joc_id,any_jugat=excluded.any_jugat,completat=excluded.completat,
  valoracio=excluded.valoracio,notes=excluded.notes,jugant=excluded.jugant,revisat=excluded.revisat,origen=excluded.origen
 where p_actualitzar and experiencies.user_id=owner;
 insert into public.proposits select * from jsonb_populate_recordset(null::public.proposits,p_copia->'proposits')
 on conflict(id) do update set "any"=excluded."any",text=excluded.text,estat=excluded.estat
 where p_actualitzar and proposits.user_id=owner;
end;
$$;
revoke all on function public.estat_restauracio(),public.restaurar_copia(jsonb,boolean,text) from public,anon;
grant execute on function public.estat_restauracio(),public.restaurar_copia(jsonb,boolean,text) to authenticated;

-- An explicitly changed cover discards the restored file reference. Keeping
-- the original URL leaves its private stored cover intact.
create function public.portada_canviada() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if new.portada_url is distinct from old.portada_url and new.portada_fitxer is not distinct from old.portada_fitxer then new.portada_fitxer:=null; end if;
 return new;
end;
$$;
create trigger portada_canviada before update of portada_url on public.fitxes_joc for each row execute function public.portada_canviada();
commit;
