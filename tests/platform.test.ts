import test from 'node:test'
import assert from 'node:assert/strict'
import { collectionCopy, platformCoverage, platformIssues, platformName, platformOptions, resolvedPlatformError } from '../src/lib/platform.ts'
import { statistics } from '../src/lib/statistics.ts'
import { buildCsv } from '../src/lib/csv.ts'
import { buildBackupArchive } from '../src/lib/backup-archive.ts'
import { readRestoreArchive, validateBackup } from '../src/lib/restore-archive.ts'
import { reviewRows } from '../src/lib/data-review.ts'
import type { Catalog } from '../src/lib/catalog.ts'
import type { Backup } from '../src/lib/backup.ts'
import type { Exemplar, Experiencia, FitxaJoc } from '../src/lib/database.types.ts'
const owner='11111111-1111-4111-8111-111111111111'
const g='22222222-2222-4222-8222-222222222222'
const c='33333333-3333-4333-8333-333333333333'
const e='44444444-4444-4444-8444-444444444444'
const g2='55555555-5555-4555-8555-555555555555'
const c2='66666666-6666-4666-8666-666666666666'
const stamp={user_id:owner,created_at:'2026-10-09T10:00:00Z',updated_at:'2026-10-09T10:00:00Z'}
function fixture(): Catalog {
 const game:FitxaJoc={...stamp,id:g,nom:'Joc sintètic',plataforma:'Steam',plataforma_resolta:true,valoracio:'B',comentaris:'Comentari propi',per_infants:false,desenvolupadora:null,genere_principal:null,generos_secundaris:[],any_llancament:null,sinopsi:null,portada_url:null,portada_font_url:null,per_jugar_aviat:false}
 const copy:Exemplar={...stamp,id:c,joc_id:g,format:'digital',regio:null,estat_conservacio:null,notes:null,any_compra:2020,preu:0,botiga_servei:null,favorit:false,canvi:false,reproduccio:false,no_localitzat:null,a_la_colleccio:true,revisat:false,origen:null}
 const entry:Experiencia={...stamp,id:e,joc_id:g,any_jugat:2020,completat:'si',valoracio:'B',notes:null,jugant:false,revisat:false,origen:null}
 return {jocs:[game],exemplars:[copy],experiencies:[entry],plataformaModel:2}
}
function backup(catalog=fixture(),version:1|2=2):Backup {return {app:'tsumige',format_version:version,exported_at:stamp.created_at,user_id:owner,fitxes_joc:catalog.jocs,exemplars:catalog.exemplars,experiencies:catalog.experiencies,proposits:[]}}
test('Epic aliases canonical; new platform requires no type or code changes',()=>{
 for(const value of ['Epic','epic games',' Epic Games Store '])assert.equal(platformName(value),'Epic Games')
 const catalog=fixture();catalog.jocs.push({...catalog.jocs[0],id:g2,plataforma:'Una consola nova'})
 assert(platformOptions(catalog).includes('Una consola nova'))
 assert.equal(platformName(' Una botiga nova '),'Una botiga nova')
})
test('same title on Steam and Epic remains different games, ratings, comments and annual entries',()=>{
 const catalog=fixture();catalog.jocs.push({...catalog.jocs[0],id:g2,plataforma:'Epic Games',valoracio:'A+',comentaris:'Un altre comentari'})
 catalog.exemplars.push({...catalog.exemplars[0],id:c2,joc_id:g2})
 catalog.experiencies.push({...catalog.experiencies[0],id:c2,joc_id:g2,any_jugat:2021,valoracio:'A+'})
 const before=structuredClone(catalog);const stats=statistics(catalog)
 assert.deepEqual(stats.platforms.map(row=>row.label).sort(),['Epic Games','Steam'])
 assert(!platformIssues(catalog).some(issue=>issue.group==='coincidencies'))
 assert.deepEqual(catalog,before)
 const restored=validateBackup(backup(catalog),owner)
 assert.equal(restored.fitxes_joc[1].comentaris,'Un altre comentari');assert.equal(restored.experiencies[1].joc_id,g2)
})
test('PC stores and historical Bitàcora produce discrepancies, never inferred reassignment',()=>{
 const catalog=fixture();catalog.jocs[0].plataforma='PC';catalog.jocs[0].plataforma_resolta=false
 catalog.exemplars[0].botiga_servei='Steam';catalog.exemplars.push({...catalog.exemplars[0],id:c2,botiga_servei:'Epic'})
 const before=structuredClone(catalog);const issues=platformIssues(catalog)
 assert(issues.some(issue=>issue.group==='botigues'));assert(issues.some(issue=>issue.group==='bitacora'&&issue.recordIds.includes(e)))
 assert.deepEqual(catalog,before);assert.equal(catalog.experiencies[0].joc_id,g)
 assert.equal(statistics(catalog).platforms[0].label,'PC')
})
test('Switch physical/digital requires review; digital can cease counting without deleting history or purchase data',()=>{
 const catalog=fixture();catalog.jocs[0].plataforma='Nintendo Switch';catalog.jocs[0].plataforma_resolta=false
 catalog.exemplars.push({...catalog.exemplars[0],id:c2,format:'fisic',preu:35,any_compra:2022})
 assert(platformIssues(catalog).some(issue=>issue.group==='formats'))
 assert(resolvedPlatformError(catalog,g,'Nintendo Switch','digital',c))
 const originalEntry=structuredClone(catalog.experiencies[0])
 // Synthetic, explicitly reviewed retirement only, never an automatic conversion.
 catalog.exemplars[0].a_la_colleccio=false;catalog.jocs[0].plataforma_resolta=true
 assert.equal(statistics(catalog).platforms[0].value,1)
 assert.equal(statistics(catalog).totalSpending,35)
 assert.equal(catalog.exemplars[0].preu,0);assert.deepEqual(catalog.experiencies[0],originalEntry)
 assert.equal(validateBackup(backup(catalog),owner).exemplars.length,2)
})
test('Emulador supports multiple annual entries without copies; old copies are reported and excluded from collection counts',()=>{
 const catalog=fixture();catalog.jocs[0].plataforma='Emulador'
 assert(resolvedPlatformError(catalog,g,'Emulador','digital'))
 assert.equal(collectionCopy(catalog.exemplars[0],catalog.jocs[0]),false)
 assert.equal(statistics(catalog).platforms.length,0)
 assert(platformIssues(catalog).some(issue=>issue.group==='emulador'))
 assert.throws(()=>validateBackup(backup(catalog),owner),/Emulador/)
 catalog.exemplars=[];catalog.experiencies.push({...catalog.experiencies[0],id:c2,any_jugat:2023})
 assert.equal(validateBackup(backup(catalog),owner).experiencies.length,2)
})
test('backup v1 remains readable with original store and IDs; v2 preserves resolved flag and rejects malformed/consolidation states',()=>{
 const old=backup(fixture(),1);old.fitxes_joc[0].plataforma='PC';old.exemplars[0].botiga_servei='Steam'
 const validated=validateBackup(old,owner);assert.equal(validated.fitxes_joc[0].plataforma_resolta,undefined)
 assert.equal(validated.exemplars[0].botiga_servei,'Steam');assert.equal(validated.experiencies[0].joc_id,g)
 const modern=backup();assert.equal(validateBackup(modern,owner).fitxes_joc[0].plataforma_resolta,true)
 const invalid=backup();delete invalid.fitxes_joc[0].plataforma_resolta;assert.throws(()=>validateBackup(invalid,owner))
 const alias=backup();alias.fitxes_joc[0].plataforma='Epic';assert.throws(()=>validateBackup(alias,owner),/canònic/)
 const mixed=backup();mixed.fitxes_joc[0].plataforma='PS4';mixed.exemplars.push({...mixed.exemplars[0],id:c2,format:'fisic'});assert.throws(()=>validateBackup(mixed,owner),/consolidar/)
})
test('CSV has one platform for resolved model and preserves legacy store column when conversion pending; review respects applicability',()=>{
 const b=backup();let csv=buildCsv(b,'colleccio');assert(csv.content.includes('"Plataforma"'));assert(!csv.content.includes('Botiga original'))
 b.fitxes_joc[0].plataforma_resolta=false;b.exemplars[0].botiga_servei='Steam';csv=buildCsv(b,'colleccio');assert(csv.content.includes('Botiga original'))
 const catalog=fixture();catalog.jocs[0].plataforma='Emulador';catalog.exemplars[0].preu=null
 assert.equal(reviewRows(catalog,{scope:'colleccio',field:'preu',search:'',format:'',includeRetired:true,includeTracking:false}).length,0)
 assert.equal(reviewRows(catalog,{scope:'bitacora',field:'completat',search:'',format:'',includeRetired:false,includeTracking:false}).length,0)
})

test('ratings, comments and purchase discrepancies are grouped before any conversion',()=>{
 const catalog=fixture();catalog.experiencies[0].valoracio='A';catalog.experiencies[0].notes='Nota antiga';catalog.exemplars[0].notes='Una altra nota'
 catalog.jocs[0].plataforma='PS4';catalog.exemplars.push({...catalog.exemplars[0],id:c2,format:'fisic',preu:40})
 const snapshot=structuredClone(catalog);const groups=platformIssues(catalog).map(issue=>issue.group)
 for(const group of ['valoracions','comentaris','compres','formats'])assert(groups.includes(group))
 assert.deepEqual(catalog,snapshot)
 const pc=backup();pc.fitxes_joc[0].plataforma='PC';pc.exemplars[0].botiga_servei='Steam';assert.throws(()=>validateBackup(pc,owner),/botiga/)
})

test('new ZIP round trip retains v2 state, original fields, copy IDs and annual links',async()=>{
 const source=backup();const archive=await buildBackupArchive(source)
 const result=await readRestoreArchive(new Uint8Array(await archive.blob.arrayBuffer()),owner)
 assert.equal(result.backup.format_version,2);assert.equal(result.backup.fitxes_joc[0].plataforma_resolta,true)
 assert.equal(result.backup.exemplars[0].id,c);assert.equal(result.backup.experiencies[0].joc_id,g)
 const legacy=backup();legacy.fitxes_joc[0].plataforma_resolta=false;legacy.fitxes_joc[0].plataforma='PC';legacy.exemplars[0].botiga_servei='Steam'
 const oldArchive=await buildBackupArchive(legacy);const oldResult=await readRestoreArchive(new Uint8Array(await oldArchive.blob.arrayBuffer()),owner)
 assert.equal(oldResult.backup.fitxes_joc[0].plataforma,'PC');assert.equal(oldResult.backup.exemplars[0].botiga_servei,'Steam')
 assert.equal(oldResult.backup.experiencies[0].joc_id,g)
})

test('coverage includes retired copies, undated entries, childless games and reports orphans or absent shared fields',()=>{
 const catalog=fixture(); catalog.jocs[0].plataforma_resolta=false
 catalog.exemplars[0].a_la_colleccio=false; catalog.experiencies[0].any_jugat=null
 catalog.jocs.push({...catalog.jocs[0],id:g2})
 assert.equal(platformIssues(catalog).filter(issue=>issue.group==='pendents').length,2)
 assert.deepEqual(platformCoverage(catalog),[])
 catalog.exemplars.push({...catalog.exemplars[0],id:c2,joc_id:'missing'})
 assert(platformCoverage(catalog).some(w=>w.includes(c2)))
 catalog.jocs[1].plataforma='  ';delete catalog.jocs[1].comentaris
 assert(platformCoverage(catalog).some(w=>w.includes('Plataforma buida')))
 assert(platformCoverage(catalog).some(w=>w.includes('Camps compartits')))
})
