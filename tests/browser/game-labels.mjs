import assert from 'node:assert/strict'
import process from 'node:process'
import console from 'node:console'
import {URL} from 'node:url'
const {chromium}=await import(process.env.TSUMIGE_PLAYWRIGHT_MODULE??'/tmp/tsumige-browser-tests/node_modules/playwright/index.mjs')
const browser=await chromium.launch({headless:true})
try {
 for(const width of [1440,390])for(const theme of ['light','dark'])for(const kind of ['collection','log']) {
  const context=await browser.newContext({viewport:{width,height:900}})
  const errors=[],external=[]
  await context.route('**/*',route=>{const url=new URL(route.request().url());if(url.hostname==='127.0.0.1')return route.continue();external.push(url.hostname);return route.abort()})
  const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message))
  await page.goto(`http://127.0.0.1:5173/Tsumige/tests/fixtures/detail-appearance.html?image=none&kind=${kind}&theme=${theme}`)
  await page.getByRole('button',{name:'Edita',exact:true}).click()
  const group=page.getByRole('group',{name:'Etiquetes de la fitxa de videojoc',exact:true})
  await group.scrollIntoViewIfNeeded();assert.equal(await group.getByRole('checkbox').count(),3)
  const no=group.getByRole('checkbox',{name:'No jugat',exact:true}),want=group.getByRole('checkbox',{name:'Vull jugar-hi',exact:true}),avoid=group.getByRole('checkbox',{name:'No vull jugar-hi',exact:true})
  for(const control of [no,want,avoid])assert(await control.isVisible())
  assert(await no.isChecked());await want.check();assert(!(await avoid.isChecked()))
  await avoid.check();assert(!(await want.isChecked()));assert(await no.isChecked())
  await avoid.uncheck();assert(!(await want.isChecked()));assert(await no.isChecked())
  await want.focus();await page.keyboard.press('Space');assert(await want.isChecked())
  await page.keyboard.press('Space');assert(!(await want.isChecked()))
  assert.equal(await page.locator('input[type=hidden][name=intencio_joc]').inputValue(),'')
  assert.equal(await page.locator('select[name=intencio_joc]').count(),0)
  assert.equal(await page.locator('details:has(summary:text-is("Configuració"))').getAttribute('open'),null)
  assert(await page.getByRole('dialog').evaluate(node=>node.scrollWidth<=node.clientWidth+1))
  if(kind==='collection')await page.screenshot({path:`/tmp/tsumige-labels-${width}-${theme}.png`})
  await page.goto(`http://127.0.0.1:5173/Tsumige/tests/fixtures/detail-appearance.html?image=none&kind=${kind}&theme=${theme}&guest=1`)
  await page.getByRole('dialog').waitFor();assert.equal(await page.getByRole('button',{name:'Edita',exact:true}).count(),0)
  await page.goto(`http://127.0.0.1:5173/Tsumige/tests/fixtures/detail-appearance.html?image=none&kind=${kind}&theme=${theme}&view=create`)
  await page.getByRole('group',{name:'Etiquetes de la fitxa de videojoc',exact:true}).waitFor()
  assert.equal(await page.getByRole('group',{name:'Etiquetes de la fitxa de videojoc',exact:true}).getByRole('checkbox').count(),3)
  assert.deepEqual(errors,[]);assert.deepEqual(external,[])
  await context.close()
 }
 console.log('PASS Chromium: edit/create Collection/log, three visible checkboxes, exclusivity, none, independent No jugat, keyboard, guests, 1440/390px, light/dark, no horizontal overflow; no external requests or saves.')
}finally{await browser.close()}
