-- NOMÉS per a una instància LOCAL de proves amb la migració preparada aplicada.
-- No executar sobre Supabase real en aquesta tanda. Fixtures amb rollback.
begin;
do $$ begin
 perform set_config('request.jwt.claim.sub',(select propietari_id::text from public.accessos_convidats limit 1),true);
 if auth.uid() is null then raise exception 'Cal un propietari sintètic a la base local de proves'; end if;
end $$;
set local role authenticated;
do $$
declare steam uuid:=gen_random_uuid(); epic uuid:=gen_random_uuid(); emulator uuid:=gen_random_uuid(); sw uuid:=gen_random_uuid(); legacy uuid:=gen_random_uuid();
 copy_id uuid:=gen_random_uuid(); entry_id uuid:=gen_random_uuid(); rejected boolean; payload jsonb; original jsonb;
begin
 insert into public.fitxes_joc(id,user_id,nom,plataforma,generos_secundaris,per_jugar_aviat,per_infants,valoracio,comentaris)
 values(steam,auth.uid(),'__prova_'||steam,'Steam','{}',false,false,'B','Steam'),
 (epic,auth.uid(),'__prova_'||steam,'Epic Games Store','{}',false,false,'A+','Epic'),
 (emulator,auth.uid(),'__prova_'||emulator,'Emulador','{}',false,false,null,null),
 (sw,auth.uid(),'__prova_'||sw,'Nintendo Switch','{}',false,false,'A','Switch');
 if not exists(select 1 from public.fitxes_joc where id=epic and plataforma='Epic Games') then raise exception 'Alias incorrecte'; end if;
 insert into public.experiencies(id,user_id,joc_id,any_jugat,completat,valoracio,jugant,revisat)
 values(entry_id,auth.uid(),steam,2020,'si','B',false,false),
 (gen_random_uuid(),auth.uid(),steam,2022,'si','B',false,false),
 (gen_random_uuid(),auth.uid(),emulator,2023,'si',null,false,false);
 insert into public.exemplars(id,user_id,joc_id,format,a_la_colleccio,revisat,favorit,canvi,reproduccio,preu)
 values(copy_id,auth.uid(),sw,'fisic',true,false,false,false,false,0);
 rejected:=false;
 begin insert into public.exemplars(id,user_id,joc_id,format,a_la_colleccio,revisat,favorit,canvi,reproduccio)
 values(gen_random_uuid(),auth.uid(),sw,'digital',true,false,false,false,false);
 exception when raise_exception then rejected:=true; end;
 if not rejected then raise exception 'No protegeix físic/digital'; end if;
 rejected:=false;
 begin insert into public.exemplars(id,user_id,joc_id,format,a_la_colleccio,revisat,favorit,canvi,reproduccio)
 values(gen_random_uuid(),auth.uid(),emulator,'digital',true,false,false,false,false);
 exception when raise_exception then rejected:=true; end;
 if not rejected then raise exception 'Emulador admet exemplars'; end if;
 rejected:=false;
 begin update public.fitxes_joc set plataforma='Epic Games' where id=steam;
 exception when raise_exception then rejected:=true; end;
 if not rejected or not exists(select 1 from public.experiencies where id=entry_id and joc_id=steam) then raise exception 'Ha reassignat Bitàcora'; end if;
 select to_jsonb(j) into original from public.fitxes_joc j where id=steam;
 payload:=jsonb_build_object('app','tsumige','format_version',1,'user_id',auth.uid(),
  'fitxes_joc',jsonb_build_array((original-'plataforma_resolta')||jsonb_build_object('id',legacy,'nom','__prova_'||legacy,'plataforma','PC')),
  'exemplars','[]'::jsonb,'experiencies','[]'::jsonb,'proposits','[]'::jsonb);
 perform public.restaurar_copia(payload,false,public.estat_restauracio());
 if not exists(select 1 from public.fitxes_joc where id=legacy and plataforma='PC' and not plataforma_resolta) then raise exception 'Còpia v1 no conservada'; end if;
 payload:=jsonb_set(payload,'{fitxes_joc}',jsonb_build_array(original-'plataforma_resolta'));
 rejected:=false;
 begin perform public.restaurar_copia(payload,true,public.estat_restauracio()); exception when raise_exception then rejected:=true; end;
 if not rejected then raise exception 'Una v1 sobreescriu una plataforma resolta'; end if;
 if (select count(*) from public.experiencies where joc_id=steam)<>2 then raise exception 'S''han perdut entrades anuals'; end if;
end $$;
reset role;
do $$ begin perform set_config('request.jwt.claim.sub',(select convidat_id::text from public.accessos_convidats limit 1),true); end $$;
set local role authenticated;
do $$ declare rejected boolean:=false; begin
 begin perform public.crear_registre_plataforma('experiencia',null,'{}','{}'); exception when raise_exception then rejected:=true; end;
 if not rejected then raise exception 'Un convidat pot escriure'; end if;
end $$;
rollback;
