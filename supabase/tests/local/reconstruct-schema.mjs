// Reconstrucció local de metadades contrastades; no connecta a serveis remots.
import assert from 'node:assert/strict'
export function reconstructSchema(report) {
const quote=value=>'"'+value.replaceAll('"','""')+'"'
const literal=value=>"'"+value.replaceAll("'","''")+"'"
const omitted=value=>value.includes('[COS OMES')||value.includes('[LITERAL LLARG OMES]')||value.includes('[UUID OMITES]')||value.includes('[CORREU OMES]')
const sql=[]
for(const role of report.rols) sql.push(`create role ${quote(role.nom)} ${role.bypass_rls?'bypassrls':''};`)
sql.push('create schema auth; create schema storage; create table auth.users(id uuid primary key);')
const functions=report.funcions.filter(f=>!f.signatura.startsWith('storage.')||['storage.foldername(text)','storage.protect_delete()'].includes(f.signatura))
// Context Auth i auxiliar de rutes abans dels defaults/generades.
for(const f of functions.filter(f=>f.signatura.startsWith('auth.')||f.signatura==='storage.foldername(text)')) {
 if(omitted(f.definicio))throw Error('Definició necessària redactada: '+f.signatura)
 sql.push(f.definicio+';')
}
// Storage mínim per executar restauració i les RLS reals; no simula API ni triggers interns.
sql.push('create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]); create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text references storage.buckets(id),name text,owner uuid);')
const tables=report.taules.filter(t=>t.esquema==='public')
for(const table of tables) {
 const columns=report.columnes.filter(c=>c.esquema==='public'&&c.taula===table.nom)
 for(const c of columns){assert(!omitted(JSON.stringify(c)), 'Columna pública redactada: '+c.nom);assert(!c.identitat&&!c.generada,'Cal tractar explícitament una columna generada/identitat')}
 sql.push(`create table public.${quote(table.nom)}(${columns.map(c=>`${quote(c.nom)} ${c.tipus}${c.valor_per_defecte?' default '+c.valor_per_defecte:''}${c.no_nul?' not null':''}`).join(',')});`)
}
const constraints=report.restriccions.filter(c=>c.esquema==='public')
for(const foreign of [false,true])for(const [i,c] of constraints.entries()) {
 if(c.definicio.startsWith('FOREIGN KEY')!==foreign)continue
 assert(!omitted(c.definicio),'Restricció redactada')
 sql.push(`alter table public.${quote(c.taula)} add constraint ${quote(omitted(c.nom)?'local_constraint_'+i:c.nom)} ${c.definicio};`)
}
for(const index of report.indexs.filter(i=>i.esquema==='public')) {
 if(constraints.some(c=>c.taula===index.taula&&c.nom===index.nom))continue
 assert(!omitted(index.definicio));sql.push(index.definicio+';')
}
for(const f of functions.filter(f=>!f.signatura.startsWith('auth.')&&f.signatura!=='storage.foldername(text)')) {
 assert(!omitted(f.definicio),'RPC pública redactada: '+f.signatura);sql.push(f.definicio+';')
}
for(const t of report.triggers.filter(t=>t.esquema==='public'||(t.esquema==='storage'&&t.nom==='protect_objects_delete'))) {assert(!omitted(t.definicio));sql.push(t.definicio+';')}
for(const t of report.taules){if(t.rls)sql.push(`alter table ${quote(t.esquema)}.${quote(t.nom)} enable row level security;`);if(t.force_rls)sql.push(`alter table ${quote(t.esquema)}.${quote(t.nom)} force row level security;`)}
for(const p of report.politiques_rls) {
 assert(!omitted(JSON.stringify(p)))
 sql.push(`create policy ${quote(p.nom)} on ${quote(p.esquema)}.${quote(p.taula)} as ${p.permissiva} for ${p.operacio} to ${p.rols.map(quote).join(',')}${p.using?' using ('+p.using+')':''}${p.with_check?' with check ('+p.with_check+')':''};`)
}
for(const s of report.esquemes) {
 if(s.usage)sql.push(`grant usage on schema ${quote(s.nom)} to ${quote(s.rol)};`)
 if(s.create)sql.push(`grant create on schema ${quote(s.nom)} to ${quote(s.rol)};`)
}
for(const p of report.permisos_efectius_taules) {
 const granted=['select','insert','update','delete'].filter(key=>p[key]);
 if(granted.length)sql.push(`grant ${granted.join(',')} on ${quote(p.esquema)}.${quote(p.taula)} to ${quote(p.rol)};`)
}
for(const f of functions) {
 sql.push(`revoke all on function ${f.signatura} from public;`)
 if(/(?:\{|,)=X\//.test(f.acl))sql.push(`grant execute on function ${f.signatura} to public;`)
 for(const p of report.permisos_efectius_funcions.filter(p=>p.signatura===f.signatura&&p.execute))sql.push(`grant execute on function ${f.signatura} to ${quote(p.rol)};`)
}
for(const b of report.bucket_portades)sql.push(`insert into storage.buckets values(${literal(b.id)},${literal(b.id)},${b.public},${b.file_size_limit},array[${b.allowed_mime_types.map(literal).join(',')}]);`)
sql.push("insert into auth.users values('11111111-1111-4111-8111-111111111111'),('22222222-2222-4222-8222-222222222222'),('33333333-3333-4333-8333-333333333333'); insert into public.accessos_convidats values('22222222-2222-4222-8222-222222222222','11111111-1111-4111-8111-111111111111');")
return sql.join('\n')
}
