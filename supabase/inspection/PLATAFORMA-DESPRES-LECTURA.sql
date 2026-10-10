-- NOMÉS LECTURA. Verificació posterior a partir del pla PRIVAT contrastat.
-- També identifica la fase si no s'ha aplicat la migració. No modifica res.
with
parametres as (select '{}'::jsonb as pla -- PLA_PRIVAT
),
a as (select pla->'informe' as informe,pla->'digitals_a_retirar' as digitals,pla->'despres_previst' as previst from parametres),
j as materialized (select t.id,to_jsonb(t) as fila from public.fitxes_joc t where user_id=(select (informe->>'propietari_id')::uuid from a)),
e as materialized (select t.id,t.format,t.a_la_colleccio,to_jsonb(t) as fila from public.exemplars t where user_id=(select (informe->>'propietari_id')::uuid from a)),
b as materialized (select t.id,to_jsonb(t) as fila from public.experiencies t where user_id=(select (informe->>'propietari_id')::uuid from a)),
p as materialized (select t.id,to_jsonb(t) as fila from public.proposits t where user_id=(select (informe->>'propietari_id')::uuid from a)),
totals as (
 select jsonb_build_object('fitxes',(select count(*) from j),'pendents',(select count(*) from j where (fila->>'plataforma_resolta') is distinct from 'true'),
 'exemplars',(select count(*) from e),'fisics_actius',(select count(*) from e where a_la_colleccio and format='fisic'),
 'digitals_actius',(select count(*) from e where a_la_colleccio and format='digital'),'exemplars_actius',(select count(*) from e where a_la_colleccio),
 'exemplars_retirats',(select count(*) from e where not a_la_colleccio),'bitacora',(select count(*) from b),'proposits',(select count(*) from p)) as actuals
),
esperats as (
 select 'jocs'::text as taula,x from a cross join lateral jsonb_array_elements(coalesce(informe#>'{files,jocs}','[]')) x
 union all select 'exemplars',x from a cross join lateral jsonb_array_elements(coalesce(informe#>'{files,exemplars}','[]')) x
 union all select 'bitacora',x from a cross join lateral jsonb_array_elements(coalesce(informe#>'{files,bitacora}','[]')) x
 union all select 'proposits',x from a cross join lateral jsonb_array_elements(coalesce(informe#>'{files,proposits}','[]')) x
),
actuals as (select 'jocs'::text as taula,id,fila from j union all select 'exemplars',id,fila from e union all select 'bitacora',id,fila from b union all select 'proposits',id,fila from p),
diferencies as (
 select coalesce(t.taula,s.taula) as taula,coalesce(t.id::text,s.x->>'id') as id,
 case when t.id is null then 'registre absent' when s.x is null then 'registre nou'
 else 'dades diferents del pla (fora dels canvis autoritzats)' end as canvi
 from actuals t full join esperats s on s.taula=t.taula and s.x->>'id'=t.id::text
 where t.id is null or s.x is null or
 case when t.taula='jocs' or (t.taula='exemplars' and exists(select 1 from a cross join lateral jsonb_array_elements_text(a.digitals) d where d=t.id::text))
 then md5((t.fila-'updated_at')::text) is distinct from s.x->>'despres_semantic_md5'
 else md5(t.fila::text) is distinct from s.x->>'abans_md5' end
)
select jsonb_pretty(jsonb_build_object(
 'format','tsumige-plataforma-post-v1','observat_a',statement_timestamp(),
 'fase',case when not exists(select 1 from j where fila ? 'plataforma_resolta') then 'abans_de_migrar'
 when not exists(select 1 from j where fila->>'plataforma_resolta'='true') then 'estructura_pendent_de_conversio'
 when not exists(select 1 from j where (fila->>'plataforma_resolta') is distinct from 'true') then 'fitxes_resoltes' else 'estat_mixt_revisar' end,
 'actuals',(select actuals from totals),'previstos',(select previst from a),
 'diferencies',coalesce((select jsonb_agg(to_jsonb(diferencies) order by taula,id) from diferencies),'[]'::jsonb),
 'coincideix',coalesce((select actuals from totals)=(select previst from a),false) and not exists(select 1 from diferencies)
 and (select pla->>'estat' from parametres)='preparat_per_revisar'
)) as informe_verificacio;
