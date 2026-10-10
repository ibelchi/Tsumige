begin;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
set local role authenticated;
do $$
declare g uuid; f uuid; d uuid; ids uuid[]:='{}'; before_games jsonb; before_copies jsonb; before_entries jsonb; after_copies jsonb; result jsonb; payload jsonb; rejected boolean; i integer;
begin
 for i in 1..453 loop
  g:=gen_random_uuid();
  insert into public.fitxes_joc(id,user_id,nom,plataforma,plataforma_resolta,valoracio,comentaris,generos_secundaris,per_infants,per_jugar_aviat)
  values(g,auth.uid(),'Sintètic '||i,case when i<=3 then 'Nintendo Switch' else 'PC' end,false,null,null,'{}',false,false);
  if i<=3 then
   f:=gen_random_uuid();d:=gen_random_uuid();ids:=array_append(ids,d);
   insert into public.exemplars(id,user_id,joc_id,format,a_la_colleccio,any_compra,preu,notes,botiga_servei,favorit,canvi,reproduccio,revisat)
   values(f,auth.uid(),g,'fisic',true,null,case when i=1 then 0 else null end,null,null,false,false,false,false),
   (d,auth.uid(),g,'digital',true,2021,7,null,null,false,false,false,false);
   insert into public.experiencies(id,user_id,joc_id,any_jugat,valoracio,notes,jugant,revisat)
   values(gen_random_uuid(),auth.uid(),g,null,null,null,false,false),(gen_random_uuid(),auth.uid(),g,2023,null,null,false,false);
  end if;
 end loop;
 select jsonb_agg(to_jsonb(j) order by id) into before_games from public.fitxes_joc j;
 select jsonb_agg(to_jsonb(e) order by id) into before_copies from public.exemplars e;
 select jsonb_agg(to_jsonb(e) order by id) into before_entries from public.experiencies e;
 payload:=jsonb_build_object('app','tsumige','format_version',1,'user_id',auth.uid(),'fitxes_joc',(select jsonb_agg(x-'plataforma_resolta' order by x->>'id') from jsonb_array_elements(before_games) x),'exemplars',before_copies,'experiencies',before_entries,'proposits','[]'::jsonb);
 delete from public.experiencies; delete from public.exemplars; delete from public.fitxes_joc;
 perform public.restaurar_copia(payload,false,public.estat_restauracio());
 if (select jsonb_agg(to_jsonb(j) order by id) from public.fitxes_joc j) is distinct from before_games or (select jsonb_agg(to_jsonb(e) order by id) from public.exemplars e) is distinct from before_copies or (select jsonb_agg(to_jsonb(e) order by id) from public.experiencies e) is distinct from before_entries then raise exception 'Restauració v1 en base buida perd dades'; end if;
 rejected:=false;
 begin perform public.convertir_plataformes(ids,'empremta errònia'); exception when raise_exception then rejected:=true; end;
 if not rejected then raise exception 'Admet empremta antiga'; end if;
 rejected:=false;
 begin perform public.convertir_plataformes(ids[1:2],public.estat_restauracio()); exception when raise_exception then rejected:=true; end;
 if not rejected or (select jsonb_agg(to_jsonb(e) order by id) from public.exemplars e) is distinct from before_copies or (select jsonb_agg(to_jsonb(j) order by id) from public.fitxes_joc j) is distinct from before_games then raise exception 'Pla incomplet no fa rollback íntegre'; end if;
 result:=public.convertir_plataformes(ids,public.estat_restauracio());
 if result#>>'{abans,pendents}'<>'453' or result#>>'{despres,pendents}'<>'0' or result->>'digitals_retirats'<>'3' then raise exception 'Recomptes incorrectes: %',result; end if;
 if (select jsonb_agg(to_jsonb(j)-'plataforma_resolta' order by id) from public.fitxes_joc j) is distinct from (select jsonb_agg(x-'plataforma_resolta' order by x->>'id') from jsonb_array_elements(before_games) x) then raise exception 'Fitxes modificades fora del marcador'; end if;
 select jsonb_agg(to_jsonb(e) order by id) into after_copies from public.exemplars e;
 if after_copies is distinct from (select jsonb_agg(case when (x->>'id')::uuid=any(ids) then jsonb_set(x,'{a_la_colleccio}','false') else x end order by x->>'id') from jsonb_array_elements(before_copies) x) then raise exception 'Dades d’exemplars perdudes'; end if;
 if before_entries is distinct from (select jsonb_agg(to_jsonb(e) order by id) from public.experiencies e) then raise exception 'Bitàcora modificada'; end if;
 payload:=jsonb_build_object('app','tsumige','format_version',2,'user_id',auth.uid(),'fitxes_joc',(select jsonb_agg(to_jsonb(j) order by id) from public.fitxes_joc j),'exemplars',after_copies,'experiencies',before_entries,'proposits','[]'::jsonb);
 perform public.restaurar_copia_plataforma(payload,true,public.estat_restauracio());
 if (select jsonb_agg(to_jsonb(j) order by id) from public.fitxes_joc j) is distinct from payload->'fitxes_joc' or (select jsonb_agg(to_jsonb(e) order by id) from public.exemplars e) is distinct from after_copies or (select jsonb_agg(to_jsonb(e) order by id) from public.experiencies e) is distinct from before_entries then raise exception 'Restauració v2 no preserva dades'; end if;
 delete from public.experiencies; delete from public.exemplars; delete from public.fitxes_joc;
 perform public.restaurar_copia_plataforma(payload,false,public.estat_restauracio());
 if (select jsonb_agg(to_jsonb(j) order by id) from public.fitxes_joc j) is distinct from payload->'fitxes_joc' or (select jsonb_agg(to_jsonb(e) order by id) from public.exemplars e) is distinct from after_copies or (select jsonb_agg(to_jsonb(e) order by id) from public.experiencies e) is distinct from before_entries then raise exception 'Restauració v2 en base buida perd dades'; end if;
 raise notice '453 fitxes → 453; pendents 453 → 0; exemplars 6 → 6; actius 6 → 3; físics 3 → 3; digitals actius 3 → 0; Bitàcora 6 → 6';
end $$;
reset role;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
set local role authenticated;
do $$ declare rejected boolean:=false; begin
 if (select count(*) from public.fitxes_joc)<>453 then raise exception 'Convidat no pot consultar'; end if;
 update public.exemplars set a_la_colleccio=true;
 if found then raise exception 'Convidat pot editar via RLS'; end if;
 begin perform public.convertir_plataformes('{}',public.estat_restauracio()); exception when raise_exception then rejected:=true; end;
 if not rejected then raise exception 'Convidat pot convertir'; end if;
 rejected:=false;
 begin perform public.restaurar_copia_plataforma('{}',true,''); exception when raise_exception then rejected:=true; end;
 if not rejected then raise exception 'Convidat pot restaurar'; end if;
end $$;
rollback;
