// Validació de la captura privada; imprimeix només recomptes. Cap connexió remota.
import process from 'node:process'
import console from 'node:console'
import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { canonical, groupedJoint } from './altes-noms.mjs'
const [file, oldPlanFile, output]=process.argv.slice(2)
const raw=await readFile(file,'utf8')
let value=raw.replace(/^\uFEFF/,'').trim()
if(!value.startsWith('{'))value=value.slice(value.indexOf('\n')+1).trim().slice(1,-1).replaceAll('""','"')
const c=JSON.parse(value),d=c.dades,s=c.esquema
assert.equal(c.format,'tsumige-altes-noms-v1')
assert.equal(s.format,'tsumige-esquema-plataforma-v1')
const tables=['fitxes_joc','exemplars','experiencies','proposits','accessos_convidats']
assert.deepEqual(Object.keys(d).sort(),[...tables].sort())
const errors=[]
for(const table of tables) {
 assert(Array.isArray(d[table]))
 const key=table==='accessos_convidats'?'convidat_id':'id'
 if(new Set(d[table].map(r=>r[key])).size!==d[table].length)errors.push('Identificadors repetits: '+table)
}
const games=new Map(d.fitxes_joc.map(g=>[g.id,g]))
for(const table of ['exemplars','experiencies'])for(const row of d[table]) {
 if(!games.has(row.joc_id))errors.push('Vincle orfe: '+table+' '+row.id)
 else if(row.user_id!==games.get(row.joc_id).user_id)errors.push('Propietari inconsistent: '+table+' '+row.id)
}
if(d.fitxes_joc.some(g=>g.plataforma_resolta!==true||typeof g.plataforma!=='string'||!g.plataforma.trim()))errors.push('Plataforma absent o pendent')
if(d.exemplars.some(e=>games.get(e.joc_id)?.plataforma==='Emulador'))errors.push('Emulador amb exemplar')
if(s.objectes_absents.length||s.cossos_omesos.length)errors.push('Esquema incomplet o definicions omeses')
if(s.funcions.some(f=>/^(public\.)?(alta_registre|versio_altes)\(/.test(f.signatura)))errors.push('RPC d’altes ja presents')
const groups=new Map()
for(const g of d.fitxes_joc) {
 const key=JSON.stringify([g.user_id,g.nom.trim().toLowerCase(),canonical(g.plataforma)])
 if(!groups.has(key))groups.set(key,[])
 groups.get(key).push(g)
}
const collisions=[...groups.values()].filter(g=>g.length>1&&g.some(x=>x.plataforma!==canonical(x.plataforma)))
assert.equal(collisions.length,c.colisions.length,'Diagnòstic SQL/client divergent')
if(collisions.length)errors.push('Col·lisions pendents')
const annual=new Map(),active=new Map()
for(const e of d.experiencies)if(e.any_jugat!==null) {
 const key=JSON.stringify([e.user_id,e.joc_id,e.any_jugat]);annual.set(key,(annual.get(key)??0)+1)
}
for(const e of d.exemplars)if(e.a_la_colleccio) {
 if(!active.has(e.joc_id))active.set(e.joc_id,[])
 active.get(e.joc_id).push(e)
}
const diagnostic={fitxes_pendents:d.fitxes_joc.filter(g=>!g.plataforma_resolta).length,
 entrades_sense_any:d.experiencies.filter(e=>e.any_jugat===null).length,
 jocs_amb_varis_actius:[...active.values()].filter(g=>g.length>1).length,
 grups_joc_any_repetits:[...annual.values()].filter(n=>n>1).length}
assert.deepEqual(diagnostic,c.diagnostic_altes,'Cobertura del diagnòstic divergent')
const approved=[]
if(oldPlanFile) {
 const old=JSON.parse(await readFile(oldPlanFile,'utf8'))
 for(const x of old.casos) {
  const game=games.get(x.joc_id),physical=d.exemplars.find(e=>e.id===x.fisic_id),digital=d.exemplars.find(e=>e.id===x.digital_id)
  const valid=game?.plataforma==='Nintendo Switch'&&physical?.joc_id===x.joc_id&&digital?.joc_id===x.joc_id
    &&physical.format==='fisic'&&physical.a_la_colleccio===true&&physical.any_compra===x.any_compra&&Number(physical.preu)===x.preu
    &&digital.format==='digital'&&digital.a_la_colleccio===false
  approved.push({nom:x.nom,joc_id:x.joc_id,fisic_id:x.fisic_id,digital_id:x.digital_id,coincideix:valid})
  if(!valid)errors.push('Cas del pla 002 canviat: '+x.nom)
 }
}
const changes=d.fitxes_joc.filter(g=>g.plataforma!==canonical(g.plataforma))
const renamed={}
for(const g of changes){const key=g.plataforma+' → '+canonical(g.plataforma);renamed[key]=(renamed[key]??0)+1}
const counts=Object.fromEntries(tables.map(t=>[t,d[t].length]))
const report={format:'tsumige-altes-noms-validacio-v1',valid:errors.length===0,
 captura_sha256:createHash('sha256').update(raw).digest('hex'),observat_a:c.observat_a,
 totals_abans:counts,totals_despres_previstos:counts,
 actius:d.exemplars.filter(e=>e.a_la_colleccio).length,
 fisics_actius:d.exemplars.filter(e=>e.a_la_colleccio&&e.format==='fisic').length,
 digitals_actius:d.exemplars.filter(e=>e.a_la_colleccio&&e.format==='digital').length,
 historics:d.exemplars.filter(e=>!e.a_la_colleccio).length,
 fitxes_a_normalitzar:changes.length,canvis_agrupats:renamed,diagnostic,casos_pla002:approved,
 colisions:collisions,errors,
 exemplars_multiples:[...active].filter(([,rows])=>rows.length>1).map(([id,rows])=>({joc_id:id,nom:games.get(id).nom,plataforma:games.get(id).plataforma,exemplars:rows})),
 limitacions:['Captura de lectura: no verifica serveis Auth/Storage ni navegador','El ZIP definitiu encara no s’ha rebut','No s’ha aplicat ni publicat']}
if(output)await writeFile(output,JSON.stringify(report,null,2),{mode:0o600,flag:'wx'})
console.log(JSON.stringify({valid:report.valid,errors,totals:counts,diagnostic,fitxes_a_normalitzar:changes.length,canvis_agrupats:renamed,casos_pla002:approved.map(x=>({nom:x.nom,coincideix:x.coincideix}))},null,2))
assert.equal(errors.length,0,'No preparar aplicació amb errors')
await groupedJoint(c) // Verifica també que es pot construir la recuperació amb aquestes definicions.
