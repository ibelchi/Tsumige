// Comparacions completes, amb una sola còpia de les captures al batch enviat.
import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { groupedJoint, canonical, expression } from './altes-noms.mjs'
import { schemaGuard } from './plataforma-schema-guard.mjs'

const quote = value => "'" + value.replaceAll("'", "''") + "'"
const source = '(select payload from pg_temp.tsumige_altes_noms_source)'
const before = `(${source}->'before')`
const filtered = key => `(select coalesce(jsonb_agg(payload_item order by ord),'[]'::jsonb) from jsonb_array_elements(${before}->'esquema'->'${key}') with ordinality a(payload_item,ord) where payload_item->>'esquema'='public')`

function setup(payloadLiteral) {
 return `create temporary table tsumige_altes_noms_source(payload jsonb) on commit drop;
revoke all privileges on table pg_temp.tsumige_altes_noms_source from public,anon,authenticated,service_role;
do $source_acl$ declare t record; r text; begin
 select c.*,pg_get_userbyid(c.relowner) owner_name into t from pg_class c where c.oid='pg_temp.tsumige_altes_noms_source'::regclass;
 if t.relpersistence<>'t' or t.relnamespace<>pg_my_temp_schema() or t.owner_name<>current_user then raise exception 'Captura temporal no privada'; end if;
 if exists(select 1 from aclexplode(coalesce(t.relacl,acldefault('r',t.relowner))) a where a.grantee<>t.relowner)
 or exists(select 1 from pg_attribute c cross join lateral aclexplode(c.attacl) a where c.attrelid=t.oid and a.grantee<>t.relowner) then raise exception 'Captura amb permisos de tercers'; end if;
 foreach r in array array['anon','authenticated','service_role'] loop
 if has_table_privilege(r,t.oid,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN') or has_any_column_privilege(r,t.oid,'SELECT,INSERT,UPDATE,REFERENCES') then raise exception 'Accés efectiu a la captura: %',r; end if;
 end loop;
end $source_acl$;
insert into pg_temp.tsumige_altes_noms_source values (${payloadLiteral}::jsonb);
`
}

export async function compactJoint(capture) {
 const original = await groupedJoint(capture)
 const metadataLiteral = schemaGuard(capture.esquema).match(/m jsonb:=('(?:[^']|'')*')::jsonb;/)[1]
 const metadata = JSON.parse(metadataLiteral.slice(1,-1).replaceAll("''", "'"))
 const payload = { before: capture, metadata }
 const expectedAfter = JSON.parse(JSON.stringify(capture.dades))
 for (const game of expectedAfter.fitxes_joc) game.plataforma = canonical(game.plataforma)
 const replacements = new Map([
  [JSON.stringify(capture.esquema), `${before}->'esquema'`],
  [JSON.stringify(capture.dades), `${before}->'dades'`],
  [JSON.stringify(capture.dades.fitxes_joc), `${before}->'dades'->'fitxes_joc'`],
  [JSON.stringify(metadata), `${source}->'metadata'`],
  [JSON.stringify(capture.esquema.funcions.filter(x=>x.esquema==='public')), filtered('funcions')],
  [JSON.stringify(capture.esquema.taules.filter(x=>x.esquema==='public')), filtered('taules')],
 ])
 if (JSON.stringify(expectedAfter)!==JSON.stringify(capture.dades)) replacements.set(JSON.stringify(expectedAfter),
  `(${before}->'dades')||jsonb_build_object('fitxes_joc',(select jsonb_agg(payload_item||jsonb_build_object('plataforma',${expression("payload_item->>'plataforma'")}) order by ord) from jsonb_array_elements(${before}->'dades'->'fitxes_joc') with ordinality a(payload_item,ord)))`)
 let sourceToken='__TSUMIGE_COMPACT_SOURCE_LITERAL__'
 while(JSON.stringify(payload).includes(sourceToken))sourceToken+='_'
 let recoveryCount=0, replacementsCount=0
 // Only replace SQL single-quoted JSON literals. Function/dollar bodies are
 // retained verbatim except these exact literals; no guard is removed.
 const compact = (sql, nested=false) => transformLiterals(sql, literal => {
  const value=literal.slice(1,-1).replaceAll("''", "'")
  const expression=replacements.get(value)
  if(expression) { replacementsCount++; return `(${expression})` }
  if(!nested && value.startsWith('-- PRIVAT. Reversió només')) {
   recoveryCount++
   const recovery=compact(value,true).replace("set local statement_timeout='120s';",()=>"set local statement_timeout='120s';\n"+setup(sourceToken))
   return `replace(${quote(recovery)},${quote(sourceToken)},quote_literal(${source}::text))`
  }
  return literal
 })
 const sql=compact(original).replace("set local statement_timeout='120s';",()=>"set local statement_timeout='120s';\n"+setup(quote(JSON.stringify(payload))))
 assert.equal(recoveryCount,1,'Cal conservar exactament una reversió')
 assert(replacementsCount>=10,'No s’han identificat les còpies redundants')
 return {sql,originalBytes:Buffer.byteLength(original),compactBytes:Buffer.byteLength(sql),replacementsCount}
}

function transformLiterals(sql, transform) {
 let out='',i=0;
 while(i<sql.length) {
  const rest=sql.slice(i);
  if(rest.startsWith('--')) {let end=sql.indexOf('\n',i);if(end<0)end=sql.length;out+=sql.slice(i,end);i=end;continue}
  if(rest.startsWith('/*')) {let end=sql.indexOf('*/',i+2);assert(end>=0);end+=2;out+=sql.slice(i,end);i=end;continue}
  if(sql[i]==="'") {const start=i++;while(i<sql.length) {if(sql[i++]==="'") {if(sql[i]==="'")i++;else break}}out+=transform(sql.slice(start,i));continue}
  if(sql[i]==='"') {const start=i++;while(i<sql.length) {if(sql[i++]==='"') {if(sql[i]==='"')i++;else break}}out+=sql.slice(start,i);continue}
  const tag=rest.match(/^\$(?:[A-Za-z_][A-Za-z_0-9]*)?\$/)?.[0];
  if(tag) {const start=i+tag.length,end=sql.indexOf(tag,start);assert(end>=0);out+=tag+transformLiterals(sql.slice(start,end),transform)+tag;i=end+tag.length;continue}
  out+=sql[i++];
 }
 return out;
}
