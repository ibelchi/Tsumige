-- Només local. Comprova timestamps històrics amb els triggers de l'informe.
begin;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
set local role authenticated;
do $$ declare g uuid:=gen_random_uuid(); f uuid:=gen_random_uuid(); d uuid:=gen_random_uuid(); e uuid:=gen_random_uuid(); gj jsonb; fj jsonb; dj jsonb; ej jsonb; result jsonb;
begin
 insert into public.fitxes_joc(id,nom,plataforma,plataforma_resolta,valoracio,created_at,updated_at)
 values(g,'Història sintètica','Nintendo Switch',false,'B','2020-01-01','2020-01-02');
 insert into public.exemplars(id,joc_id,format,preu,created_at,updated_at)
 values(f,g,'fisic',0,'2020-01-01','2020-01-02'),(d,g,'digital',null,'2020-01-01','2020-01-02');
 insert into public.experiencies(id,joc_id,any_jugat,created_at,updated_at) values(e,g,null,'2020-01-01','2020-01-02');
 select to_jsonb(j) into gj from public.fitxes_joc j where id=g;
 select to_jsonb(j) into fj from public.exemplars j where id=f;
 select to_jsonb(j) into dj from public.exemplars j where id=d;
 select to_jsonb(j) into ej from public.experiencies j where id=e;
 result:=public.convertir_plataformes(array[d],public.estat_restauracio());
 if (select to_jsonb(j)-'updated_at'-'plataforma_resolta' from public.fitxes_joc j where id=g) is distinct from gj-'updated_at'-'plataforma_resolta'
 or (select to_jsonb(j) from public.exemplars j where id=f) is distinct from fj
 or (select to_jsonb(j)-'updated_at' from public.exemplars j where id=d) is distinct from jsonb_set(dj-'updated_at','{a_la_colleccio}','false')
 or (select to_jsonb(j) from public.experiencies j where id=e) is distinct from ej then raise exception 'Pèrdua de dades històriques'; end if;
 if (select updated_at from public.fitxes_joc where id=g)<='2020-01-02' or (select updated_at from public.exemplars where id=d)<='2020-01-02' then raise exception 'No s’ha respectat el trigger d’actualització'; end if;
end $$;
rollback;
