-- Esquema SINTÈTIC de contracte. No és una exportació de Supabase real.
create role authenticated;
create role anon;
create schema auth;
create schema storage;
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
create table public.accessos_convidats(propietari_id uuid,convidat_id uuid);
insert into public.accessos_convidats values('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222');
create function public.pot_editar() returns boolean language sql stable as $$ select exists(select 1 from public.accessos_convidats where propietari_id=auth.uid()) $$;
create function public.propietari_consulta() returns uuid language sql stable as $$ select propietari_id from public.accessos_convidats where auth.uid() in (propietari_id,convidat_id) limit 1 $$;
create table public.fitxes_joc(id uuid primary key,user_id uuid not null,nom text,plataforma text,desenvolupadora text,genere_principal text,generos_secundaris text[],any_llancament int,sinopsi text,portada_url text,portada_font_url text,per_jugar_aviat boolean,per_infants boolean,valoracio text,comentaris text,created_at timestamptz default now(),updated_at timestamptz default now());
create table public.exemplars(id uuid primary key,user_id uuid not null,joc_id uuid references public.fitxes_joc(id),format text,regio text,estat_conservacio text,notes text,any_compra int,preu numeric,botiga_servei text,favorit boolean,canvi boolean,reproduccio boolean,no_localitzat boolean,a_la_colleccio boolean,revisat boolean,origen jsonb,created_at timestamptz default now(),updated_at timestamptz default now());
create table public.experiencies(id uuid primary key,user_id uuid not null,joc_id uuid references public.fitxes_joc(id),any_jugat int,completat text,valoracio text,notes text,jugant boolean,revisat boolean,origen jsonb,created_at timestamptz default now(),updated_at timestamptz default now());
create table public.proposits(id uuid primary key,user_id uuid not null,"any" int,text text,estat text,created_at timestamptz default now(),updated_at timestamptz default now());
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id uuid,name text,bucket_id text);
create function storage.foldername(text) returns text[] language sql as $$ select string_to_array($1,'/') $$;
-- Els RPC originals d'alta/desament no estan al repositori: placeholders que NO proven el seu comportament.
create function public.crear_registre(text,uuid,jsonb,jsonb) returns uuid language plpgsql as $$ begin raise exception 'RPC original no disponible en aquesta fixture'; end $$;
create function public.desar_registre(text,uuid,jsonb,jsonb) returns void language plpgsql as $$ begin raise exception 'RPC original no disponible en aquesta fixture'; end $$;
do $$ declare t text; begin foreach t in array array['fitxes_joc','exemplars','experiencies','proposits'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('create policy consulta on public.%I for select to authenticated using(user_id=public.propietari_consulta())',t);
 execute format('create policy propietari on public.%I for all to authenticated using(user_id=auth.uid() and public.pot_editar()) with check(user_id=auth.uid() and public.pot_editar())',t);
 end loop; end $$;
grant usage on schema auth,storage,public to authenticated,anon;
grant select on public.accessos_convidats to authenticated;
grant select,insert,update,delete on public.fitxes_joc,public.exemplars,public.experiencies,public.proposits,storage.objects to authenticated;
