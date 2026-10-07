-- Synthetic records only; the entire verification is rolled back.
begin;
do $$ begin
 perform set_config('request.jwt.claim.sub',(select propietari_id::text from public.accessos_convidats limit 1),true);
 if auth.uid() is null then raise exception 'Cal un propietari de prova'; end if;
end $$;
set local role authenticated;
do $$
declare g uuid:=gen_random_uuid(); e uuid:=gen_random_uuid(); other uuid:=gen_random_uuid(); payload jsonb; game jsonb; experience jsonb; stamp text:=now()::text; rejected boolean;
begin
 game:=jsonb_build_object('id',g,'user_id',auth.uid(),'nom','__prova_restauracio_'||g,'plataforma','Prova',
  'generos_secundaris','[]'::jsonb,'per_jugar_aviat',false,'per_infants',false,'valoracio','A+','comentaris','Original','created_at',stamp,'updated_at',stamp);
 payload:=jsonb_build_object('app','tsumige','format_version',1,'user_id',auth.uid(),'fitxes_joc',jsonb_build_array(game),'exemplars','[]'::jsonb,'experiencies','[]'::jsonb,'proposits','[]'::jsonb);
 perform public.restaurar_copia(payload,false,public.estat_restauracio());
 if not exists(select 1 from public.fitxes_joc where id=g and valoracio='A+') then raise exception 'Alta fallida'; end if;
 update public.fitxes_joc set valoracio='B' where id=g;
 experience:=jsonb_build_object('id',e,'user_id',auth.uid(),'joc_id',g,'valoracio','A+','jugant',false,'revisat',false,'created_at',stamp,'updated_at',stamp);
 payload:=jsonb_set(payload,'{experiencies}',jsonb_build_array(experience));
 perform public.restaurar_copia(payload,false,public.estat_restauracio());
 if not exists(select 1 from public.fitxes_joc where id=g and valoracio='B' and comentaris='Original') then raise exception 'Merge ha modificat una fitxa existent'; end if;
 if not exists(select 1 from public.experiencies where id=e and valoracio='B') then raise exception 'Merge no conserva la valoració canònica'; end if;
 game:=game||jsonb_build_object('comentaris','Restaurat'); payload:=jsonb_set(payload,'{fitxes_joc}',jsonb_build_array(game));
 perform public.restaurar_copia(payload,true,public.estat_restauracio());
 if not exists(select 1 from public.fitxes_joc where id=g and valoracio='A+' and comentaris='Restaurat') then raise exception 'Actualització fallida'; end if;
 rejected:=false;
 begin perform public.restaurar_copia(payload,true,'estat-caducat'); exception when raise_exception then rejected:=true; end;
 if not rejected then raise exception 'No detecta canvis després de la revisió'; end if;
 -- A later constraint error must also undo the earlier inserted game.
 game:=game||jsonb_build_object('id',other,'nom','__prova_restauracio_'||other);
 payload:=jsonb_set(payload,'{fitxes_joc}',jsonb_build_array(game)); payload:=jsonb_set(payload,'{experiencies}','[]');
 payload:=jsonb_set(payload,'{proposits}',jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'user_id',auth.uid(),'text','Prova','any',2026,'estat','INVALID','created_at',stamp,'updated_at',stamp)));
 rejected:=false;
 begin perform public.restaurar_copia(payload,true,public.estat_restauracio()); exception when check_violation then rejected:=true; end;
 if not rejected or exists(select 1 from public.fitxes_joc where id=other) then raise exception 'Restauració no atòmica'; end if;
end $$;
reset role;
set local role authenticated;
insert into storage.objects(bucket_id,name) values ('tsumige-portades',auth.uid()::text||'/__prova_restauracio/portada.jpg');
do $$ begin
 if not exists(select 1 from storage.objects where bucket_id='tsumige-portades' and name=auth.uid()::text||'/__prova_restauracio/portada.jpg') then raise exception 'El propietari no pot llegir la portada'; end if;
end $$;
reset role;
do $$ begin perform set_config('request.jwt.claim.sub',(select convidat_id::text from public.accessos_convidats limit 1),true); end $$;
set local role authenticated;
do $$ declare rejected boolean:=false; begin
 begin perform public.restaurar_copia('{}',false,public.estat_restauracio()); exception when raise_exception then rejected:=true; end;
 if not rejected or public.pot_editar() then raise exception 'Un convidat pot restaurar'; end if;
 if not exists(select 1 from storage.objects where bucket_id='tsumige-portades' and name=public.propietari_consulta()::text||'/__prova_restauracio/portada.jpg') then raise exception 'El convidat no pot llegir la portada'; end if;
 rejected:=false;
 begin insert into storage.objects(bucket_id,name) values ('tsumige-portades',auth.uid()::text||'/__prova_restauracio/convidat.jpg'); exception when insufficient_privilege then rejected:=true; end;
 if not rejected then raise exception 'El convidat pot pujar portades'; end if;
end $$;
reset role;
select set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
set local role authenticated;
do $$ begin
 if exists(select 1 from storage.objects where bucket_id='tsumige-portades' and name like '%/__prova_restauracio/portada.jpg') then raise exception 'Un altre compte pot llegir la portada'; end if;
end $$;
reset role;
rollback;
select 'Correcte: alta, merge, valoració única, actualització, concurrència, transacció, convidats i portades privades. Proves revertides.' as resultat;
