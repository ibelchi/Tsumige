-- NOMÉS LECTURA. Resum sense noms, compres ni comptes personals. SQL Editor postgres.
-- No aplica restriccions, ni elimina/consolida duplicats o entrades sense any.
select jsonb_build_object(
 'grups_joc_plataforma_repetits',(select count(*) from (select user_id,lower(btrim(nom)),lower(public.normalitza_plataforma(plataforma)) from public.fitxes_joc group by 1,2,3 having count(*)>1) d),
 'grups_joc_any_repetits',(select count(*) from (select user_id,joc_id,any_jugat from public.experiencies where any_jugat is not null group by 1,2,3 having count(*)>1) d),
 'entrades_sense_any',(select count(*) from public.experiencies where any_jugat is null),
 'jocs_amb_varis_exemplars_actius',(select count(*) from (select user_id,joc_id from public.exemplars where a_la_colleccio group by 1,2 having count(*)>1) d)
) as diagnostic_altes;
