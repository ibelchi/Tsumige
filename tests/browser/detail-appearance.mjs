/* global document, getComputedStyle */
import assert from 'node:assert/strict'
import process from 'node:process'
import console from 'node:console'
import {URL,URLSearchParams} from 'node:url'
import {createServer} from 'vite'
const {chromium}=await import(process.env.TSUMIGE_PLAYWRIGHT_MODULE??'/tmp/tsumige-browser-tests/node_modules/playwright/index.mjs')
const server=await createServer({server:{host:'127.0.0.1',port:5189,strictPort:true}})
let browser
try {
 await server.listen();browser=await chromium.launch({headless:true})
 for(const mobile of [false,true])for(const theme of ['light','dark']) {
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:900}})
  const external=[],errors=[]
  await context.route('**/*',route=>{
   const url=new URL(route.request().url())
   if(url.pathname.includes('synthetic-broken'))return route.fulfill({status:404,body:''})
   if(url.pathname.includes('synthetic-')) {
    const landscape=url.pathname.includes('landscape'),w=landscape?640:264,h=landscape?360:374
    return route.fulfill({contentType:'image/svg+xml',body:`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="#306a58"/><rect x="${w*.35}" width="${w*.3}" height="${h}" fill="#ddb66a"/><text x="${w/2}" y="${h/2}" text-anchor="middle" font-size="22">SINTÈTICA</text></svg>`})
   }
   if(url.hostname==='127.0.0.1')return route.continue()
   external.push(url.hostname);return route.abort()
  })
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message))
  for(const [title,image,rating] of [['Sekiro','portrait','A++'],['Super Mario Land 2','portrait','B'],["Assassin's Creed",'landscape','A+'],['Sense portada','none','none'],['Error de portada','broken','C'],['Títol llarg '.repeat(18),'landscape','D']]) {
   const params=new URLSearchParams({title,image,rating,theme});if(title.startsWith('Títol'))params.set('long','1')
   await page.goto(`http://127.0.0.1:5189/Tsumige/tests/fixtures/detail-appearance.html?${params}`)
   const dialog=page.getByRole('dialog');await dialog.waitFor()
   if(image==='broken')await page.locator('.detail-cover img').waitFor({state:'detached'})
   const box=await page.locator('.detail-cover').boundingBox()
   assert(Math.abs(box.width/box.height-132/187)<.005)
   assert(box.height<=384.5)
   if(image!=='none'&&image!=='broken')assert.equal(await page.locator('.detail-cover img').evaluate(node=>getComputedStyle(node).objectFit),'cover')
   assert.equal(await dialog.locator('[aria-label^="Valoració "]').count(),rating==='none'?0:1)
   if(rating!=='none')assert.equal(await dialog.locator('header [aria-label^="Valoració "]').count(),1)
   assert(await dialog.evaluate(node=>node.scrollWidth<=node.clientWidth+1),'no horizontal overflow')
   assert.equal(await dialog.getByRole('button',{name:'Tanca',exact:true}).count(),1)
   if(image==='landscape'&&title.startsWith('Assassin'))await page.screenshot({path:`/tmp/tsumige-detail-${mobile?'mobile':'desktop'}-${theme}.png`})
  }
  await page.goto(`http://127.0.0.1:5189/Tsumige/tests/fixtures/detail-appearance.html?view=review&theme=${theme}`)
  const fields=page.getByLabel('Camp buit'),scope=page.getByLabel('Àmbit')
  await fields.waitFor()
  assert.deepEqual(await fields.locator('option').allTextContents(),['Plataforma','Portada','Gènere principal','Valoració','Comentaris'])
  await fields.selectOption('portada');await page.getByRole('status').filter({hasText:'1 resultats'}).waitFor()
  await page.getByLabel('Cerca per títol').fill('Un altre');assert((await page.getByRole('status').innerText()).includes('1 resultats'))
  await page.getByLabel('Cerca per títol').fill('Sekiro');await page.getByText('Cap registre coincideix').waitFor()
  await page.getByLabel('Cerca per títol').fill('');await scope.selectOption('colleccio')
  assert.deepEqual(await fields.locator('option').allTextContents(),['Any de compra','Preu de compra'])
  await fields.selectOption('preu');await page.getByText('Cap registre coincideix').waitFor()
  await scope.selectOption('bitacora');assert.deepEqual(await fields.locator('option').allTextContents(),['Completat'])
  assert(await page.locator('body').evaluate(node=>node.scrollWidth<=document.documentElement.clientWidth+1))
  assert.deepEqual(errors,[]);assert.deepEqual(external,[])
  console.log(`PASS ${mobile?'mobile':'desktop'} ${theme}: synthetic IGDB/RAWG frame, missing/error fallback, header ratings, long content, no overflow; review fields/cover+search/zero price`)
  await context.close()
 }
} finally {await browser?.close();await server.close()}
