/* global document, innerWidth */
import assert from 'node:assert/strict'
import process from 'node:process'
import console from 'node:console'
import {URL} from 'node:url'
const{chromium}=await import(process.env.TSUMIGE_PLAYWRIGHT_MODULE??'/tmp/tsumige-browser-tests/node_modules/playwright/index.mjs')
const browser=await chromium.launch({headless:true})
async function pressed(button,value){await button.locator(`xpath=self::*[@aria-pressed="${value}"]`).waitFor()}
try{
 for(const width of [390,768,1440])for(const theme of ['light','dark'])for(const history of [false,true]){
  const context=await browser.newContext({viewport:{width,height:1000}}),external=[],errors=[]
  await context.route('**/*',route=>{const u=new URL(route.request().url());if(u.hostname==='127.0.0.1')return route.continue();external.push(u.hostname);return route.abort()})
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message))
  await page.goto(`http://127.0.0.1:5173/Tsumige/tests/fixtures/catalog-filters.html?vista=${history?'jugats':'colleccio'}&theme=${theme}`)
  const controls=page.getByRole('region',{name:'Filtres del catàleg'}),tags=controls.getByRole('group',{name:'Filtres d’etiquetes',exact:true})
  await controls.waitFor()
  assert.equal(await tags.getByRole('button').count(),history?4:5)
  assert.equal(await tags.locator('input,select').count(),0)
  const no=tags.getByRole('button',{name:'No jugat',exact:true}),want=tags.getByRole('button',{name:'Vull jugar-hi',exact:true}),avoid=tags.getByRole('button',{name:'No vull jugar-hi',exact:true})
  await no.click();await pressed(no,'true');assert.equal(new URL(page.url()).searchParams.get('no_jugat'),'1')
  await want.click();await pressed(want,'true')
  await avoid.click();await pressed(want,'false');assert.equal(new URL(page.url()).searchParams.get('intencio_joc'),'no_vull')
  await avoid.click();await pressed(avoid,'false');assert.equal(new URL(page.url()).searchParams.has('intencio_joc'),false)
  await want.focus();await page.keyboard.press('Space');await pressed(want,'true')
  await controls.getByRole('searchbox',{name:'Cerca per nom'}).fill('Prova');await page.waitForURL(u=>u.searchParams.get('cerca')==='Prova')
  assert.equal(new URL(page.url()).searchParams.get('cerca'),'Prova')
  await tags.getByRole('button',{name:'Amb infants',exact:true}).click();await pressed(tags.getByRole('button',{name:'Amb infants',exact:true}),'true')
  if(!history){await tags.getByRole('button',{name:'Favorits',exact:true}).click();await pressed(tags.getByRole('button',{name:'Amb infants',exact:true}),'false')}
  await controls.locator('summary').click();await controls.getByLabel('Steam',{exact:true}).click();await page.waitForURL(u=>u.searchParams.getAll('plataforma').includes('Steam'));await page.keyboard.press('Escape')
  if(!history){await controls.getByLabel('Físics',{exact:true}).click();await page.waitForURL(u=>u.searchParams.getAll('format').join(',')==='digital');await controls.getByRole('combobox',{name:'Filtra per gènere'}).selectOption('Acció');await page.waitForURL(u=>u.searchParams.get('genere')==='Acció');await controls.getByRole('button',{name:'Llista',exact:true}).click()}
  else {await controls.getByRole('combobox',{name:'Filtra per any de joc'}).selectOption('2026');await page.waitForURL(u=>u.searchParams.get('any')==='2026')}
  const url=page.url()
  const record=page.getByRole('button',{name:/Prova Vull/})
  await record.first().click();await page.getByRole('dialog').waitFor();await page.getByRole('button',{name:'Tanca',exact:true}).click()
  assert.equal(page.url(),url)
  await page.reload();await controls.waitFor();await pressed(no,'true');await pressed(want,'true')
  assert.equal(await controls.getByRole('searchbox',{name:'Cerca per nom'}).inputValue(),'Prova')
  for(const button of await tags.getByRole('button').all()){assert(await button.isVisible());assert((await button.boundingBox()).height>=44)}
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1))
  await page.screenshot({path:`/tmp/tsumige-filters-${width}-${theme}-${history?'log':'collection'}.png`,fullPage:true})
  assert.deepEqual(external,[]);assert.deepEqual(errors,[])
  await context.close()
 }
 console.log('PASS Chromium: Collection/log 390/768/1440px light/dark, tag buttons, mutual exclusion, keyboard, URL, general combinations, list view, details return, reload, guests and overflow; no external requests.')
}finally{await browser.close()}
