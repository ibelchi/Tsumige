// Captures i SQL amb valors reals: sempre fora del repositori, amb permisos 0600.
import process from 'node:process'
import console from 'node:console'
import path from 'node:path'
import {URL,fileURLToPath} from 'node:url'
import {readFile,writeFile,realpath,stat} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {groupedJoint,recoverySql,canonical} from './altes-noms.mjs'
const [mode,beforeFile,directory,afterFile]=process.argv.slice(2)
if(!['prepara','reverteix'].includes(mode)||!directory)throw Error('Ús: prepara|reverteix captura-abans.json-o.csv carpeta-privada [captura-despres.json-o.csv]')
const root=await realpath(fileURLToPath(new URL('..',import.meta.url))),dest=await realpath(directory)
if(dest===root||dest.startsWith(root+path.sep))throw Error('Desar fora del repositori')
if(((await stat(dest)).mode & 0o077)!==0)throw Error('La carpeta privada requereix permisos 0700')
const read=async file=>{
 let value=(await readFile(file,'utf8')).replace(/^\uFEFF/,'').trim()
 if(!value.startsWith('{'))value=value.slice(value.indexOf('\n')+1).trim().slice(1,-1).replaceAll('""','"')
 return JSON.parse(value)
}
const before=await read(beforeFile)
if(before.colisions.length)throw Error('Col·lisions pendents: revisar captura; no preparar aplicació')
if(before.esquema.cossos_omesos?.some(s=>!s.startsWith('storage.')&&!s.startsWith('auth.')))throw Error('Definicions públiques omeses')
const save=(name,value)=>writeFile(path.join(dest,name),value,{mode:0o600,flag:'wx'})
if(mode==='prepara') {
 const changed=before.dades.fitxes_joc.filter(g=>g.plataforma!==canonical(g.plataforma))
 const sql=(await groupedJoint(before)).replace('-- PLANTILLA DE REVISIÓ. Per aplicar dades reals cal bundle privat amb empremtes actuals.','-- PRIVAT. Aplicació preparada amb guardes exactes de captura. No executar sense autorització i ZIP definitiu verificat.')
 const totals=Object.fromEntries(Object.entries(before.dades).map(([key,rows])=>[key,rows.length]))
 await save('PLA-ALTES-NOMS.json',JSON.stringify({format:'tsumige-altes-noms-pla-v1',autoritzat:false,abans:before,diagnostic_altes:before.diagnostic_altes,canvis:changed.map(g=>({id:g.id,abans:g.plataforma,despres:canonical(g.plataforma)})),totals,totals_despres_previstos:totals,fitxes_a_normalitzar:changed.length,script_sha256:createHash('sha256').update(sql).digest('hex')},null,2))
 await save('APLICA-ALTES-NOMS.sql',sql)
 console.log('Pla privat i aplicació protegida preparats; no executar sense ZIP verificat, edicions pausades i autorització.')
}else{
 if(!afterFile)throw Error('Cal captura posterior al COMMIT')
 const result=await read(afterFile)
 const after=result.format==='tsumige-altes-noms-bundle-v1'?result.despres:result
 const validated=recoverySql(before,after)
 await save('REVERTEIX-ALTES-NOMS.sql',validated)
 console.log('Reversió privada preparada. No executar sense autorització.')
}
