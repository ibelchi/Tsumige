-- NOMÉS LOCAL: RPC i RLS de l'informe amb comptes sintètics.
begin;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
set local role authenticated;
do $$ declare v_id uuid; game uuid; entry uuid; rejected boolean; state text;
begin
 v_id:=public.crear_registre_plataforma('exemplar',null,'{"nom":"Alta sintètica","plataforma":"Epic Games Store"}','{"format":"digital","preu":0,"any_compra":null}');
 select joc_id into game from public.exemplars where exemplars.id=v_id;
 if not exists(select 1 from public.fitxes_joc where fitxes_joc.id=game and plataforma='Epic Games' and plataforma_resolta) then raise exception 'Alta no normalitzada'; end if;
 entry:=public.crear_registre_plataforma('experiencia',game,'{"nom":"Alta sintètica","plataforma":"Epic Games"}','{"any_jugat":2024,"valoracio":"B"}');
 perform public.desar_registre_plataforma('exemplar',v_id,'{"nom":"Alta sintètica","plataforma":"Epic Games","comentaris":"Text sintètic","per_infants":true}','{"format":"digital","preu":0,"any_compra":null,"favorit":true}');
 if not exists(select 1 from public.exemplars where exemplars.id=v_id and preu=0 and any_compra is null and favorit) or not exists(select 1 from public.fitxes_joc where fitxes_joc.id=game and comentaris='Text sintètic' and per_infants and valoracio='B') then raise exception 'Desament perd camps'; end if;
 perform public.desar_registre_plataforma('experiencia',entry,'{"nom":"Alta sintètica","plataforma":"Epic Games"}','{"any_jugat":2025,"valoracio":"A+"}');
 if not exists(select 1 from public.fitxes_joc where fitxes_joc.id=game and valoracio='A+') then raise exception 'Trigger de valoració no conservat'; end if;
 state:=public.estat_restauracio();
 if state is null then raise exception 'Empremta absent'; end if;
end $$;
reset role;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
set local role authenticated;
do $$ declare rejected boolean:=false; begin
 if public.pot_editar() or (select count(*) from public.exemplars)<>1 then raise exception 'Permisos convidat incorrectes'; end if;
 update public.exemplars set favorit=false;
 if found then raise exception 'Convidat pot editar'; end if;
 begin perform public.crear_registre_plataforma('experiencia',null,'{"nom":"Prova","plataforma":"PC"}','{}'); exception when raise_exception then rejected:=true; end;
 if not rejected then raise exception 'Convidat pot donar alta'; end if;
end $$;
reset role;
select set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',true);
set local role authenticated;
do $$ begin
 if (select count(*) from public.exemplars)<>0 then raise exception 'Un altre compte llegeix dades alienes'; end if;
end $$;
reset role;
set local role anon;
do $$ declare rejected boolean:=false; begin
 begin perform public.convertir_plataformes('{}',''); exception when insufficient_privilege then rejected:=true; end;
 if not rejected then raise exception 'Anònim pot cridar conversió'; end if;
end $$;
rollback;
