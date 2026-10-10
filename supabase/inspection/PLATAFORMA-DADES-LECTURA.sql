-- NOMÉS LECTURA. Plantilla pública; decisions personals a la còpia PRIVADA.
-- Un SELECT, sense executar RPC ni cap migració. Executar com postgres al SQL Editor.
-- El resultat té IDs/dades de compra privats: no publicar ni afegir al repositori.
with
parametres as (
 select null::uuid as propietari_explicit, '[]'::jsonb as decisions -- DECISIONS_PRIVADES
),
context as (
 select coalesce((select rolsuper or rolbypassrls from pg_roles where rolname=current_user),false)
 or coalesce((select bool_and(c.relowner=(select oid from pg_roles where rolname=current_user) and not c.relforcerowsecurity)
 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname in ('fitxes_joc','exemplars','experiencies','proposits')),false) as lectura_administrativa
),
propietaris as (
 select user_id from public.fitxes_joc union select user_id from public.exemplars
 union select user_id from public.experiencies union select user_id from public.proposits
),
ambit as (
 select case when jsonb_array_length(p.decisions)=3 and c.lectura_administrativa then coalesce(p.propietari_explicit,
 (select user_id from propietaris where (select count(*) from propietaris)=1)) end as propietari,
 p.decisions,c.lectura_administrativa,(select count(*) from propietaris) as nombre_propietaris from parametres p cross join context c
),
aprovats as (
 select x.nom,x.plataforma,x.any_compra,x.preu,x.joc_id from ambit a
 cross join lateral jsonb_to_recordset(a.decisions) as x(nom text,plataforma text,any_compra integer,preu numeric,joc_id uuid)
),
j as materialized (
 select t.*,to_jsonb(t) as fila,
 case lower(btrim(t.plataforma)) when 'epic' then 'Epic Games' when 'epic games' then 'Epic Games' when 'epic games store' then 'Epic Games'
 when 'steam' then 'Steam' when 'itch.io' then 'itch.io' when 'pc' then 'PC' when 'emulador' then 'Emulador' else btrim(t.plataforma) end as canonica
 from public.fitxes_joc t where t.user_id=(select propietari from ambit)
),
e as materialized (select t.*,to_jsonb(t) as fila,
 case lower(btrim(t.botiga_servei)) when 'epic' then 'Epic Games' when 'epic games' then 'Epic Games' when 'epic games store' then 'Epic Games'
 when 'steam' then 'Steam' when 'itch.io' then 'itch.io' when 'pc' then 'PC' when 'emulador' then 'Emulador' else btrim(t.botiga_servei) end as botiga_canonica
 from public.exemplars t where t.user_id=(select propietari from ambit)),
b as materialized (select t.*,to_jsonb(t) as fila from public.experiencies t where t.user_id=(select propietari from ambit)),
p as materialized (select t.*,to_jsonb(t) as fila from public.proposits t where t.user_id=(select propietari from ambit)),
candidats as (
 -- El nom només localitza candidats; no crea vincles ni tria entre duplicats.
 select a.nom as aprovat_nom,a.any_compra as aprovat_any,a.preu as aprovat_preu,j.id
 from aprovats a join j on (a.joc_id is not null and j.id=a.joc_id) or (a.joc_id is null and
 lower(btrim(replace(j.nom,'’',chr(39))))=lower(btrim(replace(a.nom,'’',chr(39)))) and lower(j.canonica)=lower(btrim(a.plataforma)))
),
casos as (
 select a.nom,a.plataforma,a.any_compra,a.preu,
 exists(select 1 from candidats c join j on j.id=c.id where c.aprovat_nom=a.nom and lower(j.canonica)=lower(btrim(a.plataforma))
 and lower(btrim(replace(j.nom,'’',chr(39))))=lower(btrim(replace(a.nom,'’',chr(39))))) as identitat_coincideix,
 (select count(*) from candidats c where c.aprovat_nom=a.nom) as jocs_candidats,
 coalesce((select jsonb_agg(jsonb_build_object('joc_id',j.id,'nom',j.nom,'plataforma',j.plataforma,'valoracio',j.valoracio,
 'comentaris_md5',md5(coalesce(to_jsonb(j.comentaris)::text,'null')),
 'camps_md5',(select jsonb_object_agg(k,md5(v::text)) from jsonb_each(j.fila) z(k,v)),
 'exemplars',coalesce((select jsonb_agg(jsonb_build_object('id',e.id,'joc_id',e.joc_id,'format',e.format,'actiu',e.a_la_colleccio,
 'any_compra',e.any_compra,'preu',e.preu,'botiga_servei',e.botiga_servei,
 'camps_md5',(select jsonb_object_agg(k,md5(v::text)) from jsonb_each(e.fila) z(k,v))) order by e.id) from e where e.joc_id=j.id),'[]'::jsonb),
 'entrades_ids',coalesce((select jsonb_agg(b.id order by b.id) from b where b.joc_id=j.id),'[]'::jsonb)) order by j.id)
 from candidats c join j on j.id=c.id where c.aprovat_nom=a.nom),'[]'::jsonb) as jocs,
 (select count(*) from e join candidats c on c.id=e.joc_id where c.aprovat_nom=a.nom and e.a_la_colleccio and e.format='fisic') as fisics_actius,
 (select count(*) from e join candidats c on c.id=e.joc_id where c.aprovat_nom=a.nom and e.a_la_colleccio and e.format='digital') as digitals_actius,
 exists(select 1 from e join candidats c on c.id=e.joc_id where c.aprovat_nom=a.nom and e.a_la_colleccio and e.format='fisic'
 and e.any_compra is not distinct from a.any_compra and e.preu is not distinct from a.preu) as compra_fisica_coincideix
 from aprovats a
),
retirades as (
 select e.id from e join candidats c on c.id=e.joc_id
 where e.a_la_colleccio and e.format='digital'
 and (select count(*) from casos)=3
 and not exists(select 1 from casos where jocs_candidats<>1 or fisics_actius<>1 or digitals_actius<>1 or not compra_fisica_coincideix or not identitat_coincideix)
),
diagnostic as (
 select 'plataforma_buida' as grup,j.id as joc_id from j where coalesce(btrim(plataforma),'')=''
 union all select 'plataforma_botiga',j.id from j where exists(select 1 from e where e.joc_id=j.id and coalesce(btrim(e.botiga_servei),'')<>'' and e.botiga_canonica<>j.canonica)
 union all select 'valoracions',j.id from j where exists(select 1 from b where b.joc_id=j.id and b.valoracio is not null and b.valoracio is distinct from j.valoracio)
 union all select 'comentaris',j.id from j where exists(select 1 from (select joc_id,notes from e union all select joc_id,notes from b) t
 where t.joc_id=j.id and coalesce(btrim(t.notes),'')<>'' and btrim(t.notes)<>coalesce(btrim(j.comentaris),''))
 union all select 'emulador_exemplars',j.id from j where j.canonica='Emulador' and exists(select 1 from e where e.joc_id=j.id)
 union all select 'coincidencies',j.id from j where exists(select 1 from j altre where altre.id<>j.id and lower(btrim(altre.nom))=lower(btrim(j.nom)) and lower(altre.canonica)=lower(j.canonica))
 union all select 'formats_no_aprovats',j.id from j where exists(select 1 from e where e.joc_id=j.id and e.a_la_colleccio and e.format='fisic')
 and exists(select 1 from e where e.joc_id=j.id and e.a_la_colleccio and e.format='digital') and not exists(select 1 from candidats c where c.id=j.id)
),
totals as (
 select jsonb_build_object('fitxes',(select count(*) from j),'pendents',(select count(*) from j where (fila->>'plataforma_resolta') is distinct from 'true'),
 'exemplars',(select count(*) from e),'fisics_actius',(select count(*) from e where a_la_colleccio and format='fisic'),
 'digitals_actius',(select count(*) from e where a_la_colleccio and format='digital'),'exemplars_actius',(select count(*) from e where a_la_colleccio),
 'exemplars_retirats',(select count(*) from e where not a_la_colleccio),'bitacora',(select count(*) from b),'proposits',(select count(*) from p)) as abans
),
bloquejos as (
 select coalesce(jsonb_agg(missatge),'[]'::jsonb) as errors from (
 select 'Cal executar amb lectura administrativa completa.' as missatge where not (select lectura_administrativa from ambit)
 union all select 'Cal informar tres decisions privades diferents.' where (select count(*) from aprovats)<>3 or (select count(distinct nom) from aprovats)<>3
 union all select 'Propietari no identificat inequívocament; indicar UUID privat si hi ha diversos comptes.' where (select propietari from ambit) is null
 union all select 'El recompte ja no és 453 fitxes pendents: contrastar el canvi.' where (select count(*) from j)<>453 or (select count(*) from j where (fila->>'plataforma_resolta') is distinct from 'true')<>453
 union all select 'La columna de Plataforma ja existeix; cal revisar la fase i no aplicar la migració de nou.' where exists(select 1 from j where fila ? 'plataforma_resolta')
 union all select 'Cas canviat: '||nom||' (candidats/físics/digitals/compra diferents dels aprovats).' from casos where jocs_candidats<>1 or fisics_actius<>1 or digitals_actius<>1 or not compra_fisica_coincideix or not identitat_coincideix
 union all select 'Discrepàncies addicionals: '||grup||'.' from diagnostic group by grup
 union all select 'Vincles orfes o d’un altre propietari.' where exists(select 1 from e left join j on j.id=e.joc_id and j.user_id=e.user_id where j.id is null)
 or exists(select 1 from b left join j on j.id=b.joc_id and j.user_id=b.user_id where j.id is null)
 union all select 'El pla no identifica exactament tres digitals diferents.' where (select count(distinct id) from retirades)<>3
 ) errors
)
select jsonb_pretty(jsonb_build_object(
 'format','tsumige-plataforma-dades-v1','observat_a',statement_timestamp(),'propietari_id',(select propietari from ambit),
 'lectura_administrativa',(select lectura_administrativa from ambit),'propietaris_detectats',(select nombre_propietaris from ambit),
 'bloquejos',(select errors from bloquejos),'casos',coalesce((select jsonb_agg(to_jsonb(casos) order by nom) from casos),'[]'::jsonb),
 'diagnostic',coalesce((select jsonb_agg(to_jsonb(diagnostic) order by grup,joc_id) from diagnostic),'[]'::jsonb),
 'cobertura',jsonb_build_object('fitxes_sense_fills',(select count(*) from j where not exists(select 1 from e where e.joc_id=j.id) and not exists(select 1 from b where b.joc_id=j.id)),
 'entrades_sense_any',(select count(*) from b where any_jugat is null),
 'fitxes_globals',(select count(*) from public.fitxes_joc),'exemplars_globals',(select count(*) from public.exemplars),'bitacora_globals',(select count(*) from public.experiencies),
 'jocs_ids',coalesce((select jsonb_agg(id order by id) from j),'[]'::jsonb),
 'exemplars_ids',coalesce((select jsonb_agg(id order by id) from e),'[]'::jsonb),
 'entrades_ids',coalesce((select jsonb_agg(id order by id) from b),'[]'::jsonb)),
 'abans',(select abans from totals),
 'despres_previst',case when (select errors from bloquejos)='[]'::jsonb then (select abans from totals)||jsonb_build_object('pendents',0,
 'digitals_actius',(select count(*)-3 from e where a_la_colleccio and format='digital'),
 'exemplars_actius',(select count(*)-3 from e where a_la_colleccio),'exemplars_retirats',(select count(*)+3 from e where not a_la_colleccio)) end,
 'digitals_a_retirar',coalesce((select jsonb_agg(id order by id) from retirades),'[]'::jsonb),
 'empremta_dades',md5(jsonb_build_array(
 coalesce((select jsonb_agg(fila order by id) from j),'[]'::jsonb),coalesce((select jsonb_agg(fila order by id) from e),'[]'::jsonb),
 coalesce((select jsonb_agg(fila order by id) from b),'[]'::jsonb),coalesce((select jsonb_agg(fila order by id) from p),'[]'::jsonb))::text),
 'files',jsonb_build_object(
 'jocs',coalesce((select jsonb_agg(jsonb_build_object('id',id,'abans_md5',md5(fila::text),'sense_marcador_md5',md5((fila-'plataforma_resolta')::text),
 'despres_semantic_md5',md5(((fila||jsonb_build_object('plataforma',canonica,'plataforma_resolta',true))-'updated_at')::text)) order by id) from j),'[]'::jsonb),
 'exemplars',coalesce((select jsonb_agg(jsonb_build_object('id',id,'joc_id',joc_id,'abans_md5',md5(fila::text),
 'despres_semantic_md5',md5(((fila||jsonb_build_object('a_la_colleccio',case when id in (select id from retirades) then false else a_la_colleccio end))-'updated_at')::text)) order by id) from e),'[]'::jsonb),
 'bitacora',coalesce((select jsonb_agg(jsonb_build_object('id',id,'joc_id',joc_id,'abans_md5',md5(fila::text)) order by id) from b),'[]'::jsonb),
 'proposits',coalesce((select jsonb_agg(jsonb_build_object('id',id,'abans_md5',md5(fila::text)) order by id) from p),'[]'::jsonb))
)) as informe_dades;
