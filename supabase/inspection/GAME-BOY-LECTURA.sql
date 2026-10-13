-- NOMÉS LECTURA. Recomptes sense títols, comptes ni dades de compra.
select jsonb_build_object(
 'fitxes_gb',(select count(*) from public.fitxes_joc where lower(btrim(plataforma))='gb'),
 'fitxes_game_boy',(select count(*) from public.fitxes_joc where lower(btrim(plataforma))='game boy'),
 'grups_que_requereixen_decisio',(select count(*) from (select user_id,lower(btrim(nom)) from public.fitxes_joc
 where lower(btrim(plataforma)) in ('gb','game boy') group by 1,2 having count(*)>1 and bool_or(lower(btrim(plataforma))='gb')) d)
) as diagnostic_game_boy;
-- Inventari de noms de plataformes, sense fitxes ni dades personals.
select plataforma,count(*) as fitxes from public.fitxes_joc group by plataforma order by plataforma;
