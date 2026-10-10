import { build } from 'esbuild'
import console from 'node:console'
import process from 'node:process'
import assert from 'node:assert/strict'
const plugin={name:'synthetic-reader',setup(b){
 b.onResolve({filter:/^@\/lib\/(supabase|cover-storage)$/},a=>({path:a.path,namespace:'mock'}))
 b.onLoad({filter:/.*/,namespace:'mock'},a=>({contents:a.path.endsWith('cover-storage')?'export async function withStoredCovers(rows){return rows}':'export function getSupabase(){return globalThis.reviewDb}',loader:'js'}))
}}
await build({entryPoints:[process.cwd()+'/src/lib/review-catalog.ts'],bundle:true,platform:'node',format:'esm',alias:{'@':process.cwd()+'/src'},plugins:[plugin],outfile:'/tmp/tsumige-review-loader-bundle.mjs'})
const {getReviewCatalog}=await import('file:///tmp/tsumige-review-loader-bundle.mjs')
let count=0,allowed=true,fail=false,changed=false,cap=500,incomplete=false,stateChanged=false,snapshotCalls=0
const calls=[]
globalThis.reviewDb={auth:{getSession:async()=>({data:{session:{user:{id:changed&&++count>1?'different':'synthetic-owner'}}}})},rpc:async(name)=>({data:name==='estat_restauracio'?(stateChanged&&++snapshotCalls>1?'changed-snapshot':'synthetic-snapshot'):allowed,error:null}),from(table){const chain={select(){return chain},eq(field,value){assert.equal(field,'user_id');assert.equal(value,'synthetic-owner');return chain},order(field){assert.equal(field,'id');return chain},async range(first,last){calls.push([table,first,last]);return {data:Array.from({length:Math.min(cap,Math.max((incomplete ? 400 : 1001)-first,0))},(_,i)=>({id:String(first+i)})),count:1001,error:fail?new Error('synthetic'):null}}};return chain}}
let result=await getReviewCatalog();assert.equal(result.jocs.length,1001);assert.equal(result.exemplars.length,1001);assert.equal(result.experiencies.length,1001);assert.equal(calls.length,9)
cap=200;result=await getReviewCatalog();assert.equal(result.jocs.length,1001);assert(calls.some(call=>call[1]===200));incomplete=true;await assert.rejects(getReviewCatalog(),/incompleta/);incomplete=false;
allowed=false;const old=calls.length;await assert.rejects(getReviewCatalog(),/propietari/);assert.equal(calls.length,old)
allowed=true;fail=true;await assert.rejects(getReviewCatalog(),/tots els registres/)
fail=false;changed=true;count=0;await assert.rejects(getReviewCatalog(),/sessió ha canviat/)
changed=false;stateChanged=true;snapshotCalls=0;await assert.rejects(getReviewCatalog(),/dades han canviat/);
console.log('Lectura sintètica: 1001 registres per taula, paginació, filtre propietari, convidat bloquejat, error i canvi de sessió: correcte.')
