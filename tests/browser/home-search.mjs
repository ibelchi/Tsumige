/* global document */
// Optional real-browser regression: Playwright is installed outside the project.
// node tests/browser/home-search.mjs
import assert from 'node:assert/strict'
import process from 'node:process'
import console from 'node:console'
import {createServer} from 'vite'
import {URL} from 'node:url'
const {chromium}=await import(process.env.TSUMIGE_PLAYWRIGHT_MODULE??'/tmp/tsumige-browser-tests/node_modules/playwright/index.mjs')
const server=await createServer({server:{host:'127.0.0.1',port:5188,strictPort:true}})
let browser
try {
 await server.listen();browser=await chromium.launch({headless:true})
 for(const mobile of [false,true]) {
  const context=await browser.newContext(mobile?{viewport:{width:390,height:844},isMobile:true,hasTouch:true}:{viewport:{width:1280,height:800}})
  const external=[]
  await context.route('**/*',route=>{const url=new URL(route.request().url());if(url.hostname==='127.0.0.1')return route.continue();external.push(url.hostname);return route.abort()})
  const page=await context.newPage(),errors=[]
  page.on('pageerror',error=>errors.push(error.message))
  await page.goto('http://127.0.0.1:5188/Tsumige/tests/fixtures/home-search.html')
  const input=page.getByRole('combobox'),options=page.getByRole('option'),dialog=page.getByRole('dialog')
  async function search(text="Assassin's") {await input.fill('');await input.fill(text);await options.first().waitFor()}
  async function checkDetail(platform,field) {
   await dialog.waitFor();assert.equal(await dialog.count(),1)
   assert((await dialog.innerText()).includes(platform));assert((await dialog.innerText()).includes(field))
   assert.equal(await input.getAttribute('aria-expanded'),'false')
   await dialog.getByRole('button',{name:'Tanca',exact:true}).click()
   await input.waitFor();assert(await input.evaluate(node=>node===document.activeElement))
  }
  await search()
  const pc=options.filter({hasText:'PC'})
  if(mobile)await pc.tap()
  else {
   const box=await pc.boundingBox();await page.mouse.move(box.x+15,box.y+15);await page.mouse.down()
   assert(await input.evaluate(node=>node===document.activeElement),'input retains focus between pointerdown and click')
   assert.equal(await options.count(),2)
   await page.mouse.up()
  }
  await checkDetail('PC','Format:')
  await search()
  if(mobile)await options.filter({hasText:'PlayStation 4'}).tap()
  else await options.filter({hasText:'PlayStation 4'}).click()
  await checkDetail('PlayStation 4','Any de joc:')
  await search();await input.press('ArrowDown');await input.press('Enter')
  await checkDetail('PlayStation 4','Any de joc:')
  await search();await input.press('Escape');assert.equal(await input.getAttribute('aria-expanded'),'false')
  assert(await input.evaluate(node=>node===document.activeElement))
  await input.press('ArrowUp');assert.equal(await input.getAttribute('aria-expanded'),'true')
  await page.getByRole('button',{name:'Fora del cercador'}).click();assert.equal(await input.getAttribute('aria-expanded'),'false')
  await input.focus();await options.first().waitFor();await input.press('Tab');assert.equal(await input.getAttribute('aria-expanded'),'false')
  await search('Joc sense');await options.first().click();await checkDetail('PC','Comentaris')
  await search('Diversos');await options.first().click();await dialog.waitFor()
  assert((await dialog.innerText()).includes('Tria el registre'));assert.equal(await dialog.count(),1)
  await dialog.getByRole('button',{name:/Físic/}).click();await checkDetail('PC','Format:')
  assert.deepEqual(errors,[]);assert.deepEqual(external,[],'no remote requests or Supabase access')
  console.log(`PASS ${mobile?'mobile touch':'desktop mouse'}: selected ID/platform, keyboard, focus, Escape, outside click, Tab, orphan and explicit copy choice; no remote requests`)
  await context.close()
 }
} finally {await browser?.close();await server.close()}
