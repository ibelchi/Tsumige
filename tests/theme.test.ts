import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import vm from 'node:vm'
import {themePreference, readTheme, saveTheme, initializeTheme} from '../src/lib/theme'

test('two themes persist; legacy system is frozen once; new browsers start light',()=>{
 let stored:string|null=null, dark=true
 const listeners=new Map<string,(event:never)=>void>()
 const root={dataset:{} as Record<string,string>,style:{} as Record<string,string>}
 const original={window:globalThis.window,document:globalThis.document,localStorage:globalThis.localStorage}
 Object.assign(globalThis,{localStorage:{getItem:()=>stored,setItem:(_:string,value:string)=>{stored=value}},document:{documentElement:root,querySelector:()=>null},window:{matchMedia:()=>({matches:dark}),addEventListener:(key:string,fn:(event:never)=>void)=>listeners.set(key,fn),removeEventListener:(key:string)=>listeners.delete(key)}})
 try {
  assert.equal(readTheme(),'light')
  stored='system';assert.equal(readTheme(),'dark');assert.equal(stored,'dark')
  dark=false;assert.equal(readTheme(),'dark')
  const stop=initializeTheme();assert.equal(root.dataset.theme,'dark')
  assert.equal(listeners.has('media'),false)
  saveTheme('light');assert.equal(stored,'light');assert.equal(root.dataset.theme,'light')
  stored='dark';listeners.get('storage')!({key:'tsumige-theme'} as never);assert.equal(root.dataset.theme,'dark')
  Object.assign(globalThis,{localStorage:{getItem:()=>{throw Error('blocked')},setItem:()=>{throw Error('blocked')}}})
  assert.doesNotThrow(()=>saveTheme('light'));assert.equal(root.dataset.theme,'light')
  stop();assert.equal(listeners.size,0)
 } finally {Object.assign(globalThis,original)}
 assert.equal(themePreference('invalid'),'light')
})
test('pre-React bootstrap migrates system and agrees with client preference',()=>{
 const script=readFileSync('index.html','utf8').match(/<script>([\s\S]*?)<\/script>/)![1]
 for(const preference of [null,'light','dark','system','invalid'])for(const dark of [true,false]) {
  const root={dataset:{} as Record<string,string>,style:{}}
  let stored=preference
  vm.runInNewContext(script,{localStorage:{getItem:()=>stored,setItem:(_:string,value:string)=>{stored=value}},matchMedia:()=>({matches:dark}),document:{documentElement:root,querySelector:()=>({content:''})}})
  assert.equal(root.dataset.theme,themePreference(preference,dark))
  if(preference==='system')assert.equal(stored,dark?'dark':'light')
 }
})
