-- NOMÉS LOCAL: metadades de fitxer fictici; cap fitxer real ni crida API.
begin;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
set local role authenticated;
insert into storage.objects(bucket_id,name) values('tsumige-portades','11111111-1111-4111-8111-111111111111/prova.png');
do $$ declare copy jsonb; g uuid; rejected boolean:=false; begin
 if (select count(*) from storage.objects)<>1 then raise exception 'Propietari no consulta portada'; end if;
 insert into public.fitxes_joc(nom,plataforma) values('Portada sintètica','Steam') returning id into g;
 select to_jsonb(j)||jsonb_build_object('id',gen_random_uuid(),'nom','Restauració amb portada','portada_fitxer','11111111-1111-4111-8111-111111111111/prova.png') into copy from public.fitxes_joc j where id=g;
 perform public.restaurar_copia_plataforma(jsonb_build_object('app','tsumige','user_id',auth.uid(),'format_version',2,'fitxes_joc',jsonb_build_array(copy),'exemplars','[]'::jsonb,'experiencies','[]'::jsonb,'proposits','[]'::jsonb),false,public.estat_restauracio());
 if not exists(select 1 from public.fitxes_joc where id=(copy->>'id')::uuid and portada_fitxer=copy->>'portada_fitxer') then raise exception 'Referència de portada perduda'; end if;
 begin delete from storage.objects; exception when insufficient_privilege then rejected:=true; end;
 if not rejected then raise exception 'No respecta protecció de DELETE directe de Storage'; end if;
end $$;
reset role;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
set local role authenticated;
do $$ declare rejected boolean:=false; begin
 if (select count(*) from storage.objects)<>1 then raise exception 'Convidat no consulta portada del propietari'; end if;
 begin insert into storage.objects(bucket_id,name) values('tsumige-portades','22222222-2222-4222-8222-222222222222/no.png'); exception when insufficient_privilege then rejected:=true; end;
 if not rejected then raise exception 'Convidat pot pujar portada'; end if;
 perform set_config('storage.allow_delete_query','true',true);
 delete from storage.objects;
 if found then raise exception 'Convidat pot eliminar portada'; end if;
end $$;
reset role;
select set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',true);
set local role authenticated;
do $$ declare rejected boolean:=false; begin
 if (select count(*) from storage.objects)<>0 then raise exception 'Altre compte veu portada aliena'; end if;
 begin insert into storage.objects(bucket_id,name) values('tsumige-portades','11111111-1111-4111-8111-111111111111/no.png'); exception when insufficient_privilege then rejected:=true; end;
 if not rejected then raise exception 'Es pot escriure fora de carpeta pròpia'; end if;
end $$;
reset role;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
set local role authenticated;
delete from storage.objects;
do $$ begin if exists(select 1 from storage.objects) then raise exception 'Propietari no pot eliminar amb context API sintètic'; end if; end $$;
rollback;
