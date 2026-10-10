// Eina local de lectura. No connecta a Supabase ni executa conversions.
import { readFile, mkdir, writeFile, realpath } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import console from 'node:console'
import { pathToFileURL, URL } from 'node:url'
import assert from 'node:assert/strict'

export function readReport(input) {
 let text=input.replace(/^\uFEFF/,'').trim()
 if(!text.startsWith('{')) {
  const split=text.indexOf('\n');assert.equal(text.slice(0,split).trim().replaceAll('"',''),'informe_dades')
  text=text.slice(split+1).trim();assert(text.startsWith('"')&&text.endsWith('"'));text=text.slice(1,-1).replaceAll('""','"')
 }
 const report=JSON.parse(text);assert.equal(report.format,'tsumige-plataforma-dades-v1');return report
}
export function buildPlan(report, previous) {
 const errors=[...report.bloquejos]
 const cases=[]
 for(const record of report.casos) {
  const game=record.jocs.length===1 ? record.jocs[0] : undefined
  const physical=game?.exemplars.filter(e=>e.actiu&&e.format==='fisic')??[]
  const digital=game?.exemplars.filter(e=>e.actiu&&e.format==='digital')??[]
  if(record.jocs_candidats!==1||physical.length!==1||digital.length!==1||!record.compra_fisica_coincideix||!record.identitat_coincideix) {errors.push('Cas no resolt: '+record.nom);continue}
  if(physical[0].any_compra!==record.any_compra||physical[0].preu!==record.preu) {errors.push('Compra física canviada: '+record.nom);continue}
  cases.push({nom:record.nom,joc_id:game.joc_id,fisic_id:physical[0].id,digital_id:digital[0].id,any_compra:record.any_compra,preu:record.preu})
 }
 if(cases.length!==3||new Set(cases.map(c=>c.joc_id)).size!==3||new Set(cases.map(c=>c.digital_id)).size!==3)errors.push('Calen tres jocs i tres digitals diferents.')
 for(const [name,count] of [['jocs','fitxes'],['exemplars','exemplars'],['bitacora','bitacora'],['proposits','proposits']]) {
  const rows=report.files[name]
  if(rows.length!==report.abans[count]||new Set(rows.map(r=>r.id)).size!==rows.length)errors.push('Cobertura incompleta: '+name)
 }
 if(!report.lectura_administrativa||!/^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i.test(report.propietari_id??''))errors.push('Àmbit no verificat.')
 const retire=cases.map(c=>c.digital_id).sort()
 if(JSON.stringify(retire)!==JSON.stringify([...report.digitals_a_retirar].sort()))errors.push('IDs digitals inconsistents.')
 const differences=[]
 if(previous?.informe) {
  const old=previous.informe
  if(old.propietari_id!==report.propietari_id)differences.push({camp:'propietari_id',abans:old.propietari_id,ara:report.propietari_id})
  for(const field of ['fitxes_globals','exemplars_globals','bitacora_globals'])if(old.cobertura[field]!==report.cobertura[field])differences.push({camp:'cobertura.'+field,abans:old.cobertura[field],ara:report.cobertura[field]})
  for(const [key,now] of Object.entries(report.abans))if(old.abans[key]!==now)differences.push({camp:'recompte.'+key,abans:old.abans[key],ara:now})
  for(const [table,rows] of Object.entries(report.files)) {
   const before=new Map(old.files[table].map(row=>[row.id,row]))
   for(const row of rows) {
    const prior=before.get(row.id)
    if(!prior)differences.push({taula:table,id:row.id,canvi:'afegit'})
    else if(prior.abans_md5!==row.abans_md5)differences.push({taula:table,id:row.id,canvi:'modificat'})
    before.delete(row.id)
   }
   for(const id of before.keys())differences.push({taula:table,id,canvi:'absent'})
  }
  for(const now of report.casos) {
   const oldCase=old.casos.find(c=>c.nom===now.nom)
   for(const game of now.jocs) {
    const oldGame=oldCase?.jocs.find(g=>g.joc_id===game.joc_id)
    if(oldGame)for(const [field,hash] of Object.entries(game.camps_md5))if(oldGame.camps_md5[field]!==hash)differences.push({joc_id:game.joc_id,camp:field,canvi:'valor canviat',...(['nom','plataforma','valoracio'].includes(field)?{abans:oldGame[field],ara:game[field]}:{})})
    for(const copy of game.exemplars) {
     const oldCopy=oldGame?.exemplars.find(e=>e.id===copy.id)
     if(oldCopy)for(const [field,hash] of Object.entries(copy.camps_md5))if(oldCopy.camps_md5[field]!==hash)differences.push({exemplar_id:copy.id,camp:field,canvi:'valor canviat',...(field==='preu'||field==='any_compra'||field==='actiu'?{abans:oldCopy[field],ara:copy[field]}:{})})
    }
   }
  }
  if(old.empremta_dades!==report.empremta_dades&&!differences.length)differences.push({canvi:'empremta diferent; cal contrastar'})
 }
 return {format:'tsumige-pla-privat-v1',estat:errors.length?'bloquejat':differences.length?'dades_canviades_revisar':'preparat_per_revisar',
  autoritza_execucio:false,comparacio_anterior:previous?.informe?'efectuada':'sense_empremta_antiga_disponible',
  casos:cases,digitals_a_retirar:retire,abans:report.abans,despres_previst:errors.length?null:report.despres_previst,
  errors,diferencies:differences,informe:report}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href) {
 const [, , source, destination, baseline]=process.argv
 if(!source||!destination)throw Error('Ús: node scripts/plataforma-pla-privat.mjs informe.csv /tmp/pla-nou.json [pla-anterior.json]')
 const target=path.resolve(destination);const root=process.cwd()
 if(target===root||target.startsWith(root+path.sep))throw Error('El pla privat ha de quedar fora del repositori.')
 const report=readReport(await readFile(source,'utf8'))
 const previous=baseline?JSON.parse(await readFile(baseline,'utf8')):undefined
 const plan=buildPlan(report,previous)
 await mkdir(path.dirname(target),{recursive:true,mode:0o700})
 const actualParent=await realpath(path.dirname(target));const actualRoot=await realpath(root)
 if(actualParent===actualRoot||actualParent.startsWith(actualRoot+path.sep))throw Error('La ruta privada apunta dins del repositori.')
 // Mai sobreescriure una base antiga, ni tan sols si el nou resultat és diferent.
 await writeFile(target,JSON.stringify(plan,null,2)+'\n',{flag:'wx',mode:0o600})
 if(plan.estat==='preparat_per_revisar') {
  const template=await readFile(new URL('../supabase/inspection/PLATAFORMA-DESPRES-LECTURA.sql',import.meta.url),'utf8')
  const post=template.replace("'{}'::jsonb as pla -- PLA_PRIVAT", "'"+JSON.stringify(plan).replaceAll("'","''")+"'::jsonb as pla -- PLA_PRIVAT")
  await writeFile(target+'.verificacio.sql',post,{flag:'wx',mode:0o600})
  const readTemplate=await readFile(new URL('../supabase/inspection/PLATAFORMA-DADES-LECTURA.sql',import.meta.url),'utf8')
  const decisions=plan.casos.map(c=>({...c,plataforma:'Nintendo Switch'}))
  const replay=readTemplate.replace("null::uuid as propietari_explicit, '[]'::jsonb as decisions -- DECISIONS_PRIVADES","'"+report.propietari_id.replaceAll("'","''")+"'::uuid as propietari_explicit, '"+JSON.stringify(decisions).replaceAll("'","''")+"'::jsonb as decisions -- DECISIONS_PRIVADES")
  await writeFile(target+'.recomprovacio.sql',replay,{flag:'wx',mode:0o600})
 }
 console.log(JSON.stringify({estat:plan.estat,errors:plan.errors,diferencies:plan.diferencies,abans:plan.abans,despres_previst:plan.despres_previst},null,2))
}
