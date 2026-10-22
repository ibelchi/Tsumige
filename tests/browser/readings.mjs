/* global document, innerWidth, getComputedStyle */
import process from 'node:process'
import console from 'node:console'
import assert from 'node:assert/strict'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? '/tmp/tsumige-readings-browser/node_modules/playwright/index.mjs')
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/home/belchi/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell', headless: true, args: ['--no-sandbox'] })
const base = process.env.TEST_BASE_URL ?? 'http://127.0.0.1:5192/Tsumige/'
const entries = ['general','articles','analyses','general'].map((source,i)=>({title:`Lectura ${i}: ${'un títol molt llarg que ha de continuar sent accessible sense desbordar el quadre '.repeat(3)}`,url:`https://www.anaitgames.com/prova-${i}`,date:`2026-10-${20-i}T10:00:00.000Z`,categories:source==='general'?['Noticias']:[],sources:[source]}))
try {
 for (const width of [390,768,1440,1920]) for (const theme of ['light','dark']) for(const height of [540,1000]) {
  const page=await browser.newPage({viewport:{width,height}})
  let requests=0
  const errors=[];page.on('pageerror',e=>errors.push(e.message))
  await page.route('**/*',async route=>{
   const url=route.request().url()
   if(url.includes('/api/readings')){requests++;return route.fulfill({json:{entries:[...entries,entries[0]],partial:false,stale:false}})}
   if(!url.startsWith(base)&&!url.startsWith('data:'))return route.abort()
   return route.continue()
  })
  await page.goto(`${base}tests/fixtures/readings.html?theme=${theme}`)
  if(width<1024){await page.getByRole('button',{name:'Obre el menú'}).click()}
  const panel=page.getByRole('region',{name:'Lectures',exact:true})
  await panel.getByRole('link').first().waitFor()
  assert.equal(await panel.getByRole('link').count(),3)
  assert.equal(await panel.locator('select').count(),0)
  assert.equal(await page.locator('#navegacio').getByRole('region',{name:'Lectures'}).count(),1)
  assert.equal(await page.locator('main').getByRole('region',{name:'Lectures'}).count(),0)
  const links=await panel.getByRole('link').all()
  for(const [i,link] of links.entries()){
   assert.equal(await link.getAttribute('target'),'_blank');assert.equal(await link.getAttribute('rel'),'noopener noreferrer')
   assert.equal(await link.getAttribute('title'),entries[i].title)
   assert.equal(await link.getAttribute('href'),entries[i].url)
   assert.equal(await link.locator('.line-clamp-3').evaluate(e=>getComputedStyle(e).webkitLineClamp),'3')
  }
  await links[0].focus();assert.equal(await links[0].evaluate(e=>e===document.activeElement),true)
  await page.getByRole('button',{name:'Fosc',exact:true}).focus()
  const dimensions=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,width:document.querySelector('.page-container').getBoundingClientRect().width,old:document.querySelector('.home-readings-layout'),sidebar:document.getElementById('navegacio').getBoundingClientRect().width}))
  assert.equal(dimensions.overflow,false);assert.ok(dimensions.width<=1280);assert.equal(dimensions.old,null)
  if(width>=1024)assert.equal(dimensions.sidebar,248)
  for(const name of ['Col·lecció','log','Propòsits','Estadístiques','Configuració','Inici']){
   await page.getByRole('navigation',{name:'Navegació principal'}).getByRole('link',{name,exact:true}).click()
   if(width<1024){assert.equal(await panel.isVisible(),false);await page.getByRole('button',{name:'Obre el menú'}).click()}
   await panel.getByRole('link').first().waitFor()
  }
  assert.equal(requests,1);assert.deepEqual(errors,[])
  if((width===1440||width===390)&&height===1000)await page.screenshot({path:`/tmp/tsumige-sidebar-readings-${width}-${theme}.png`,fullPage:true})
  await page.close()
 }
 for(const state of ['empty','failure','partial']){
  const page=await browser.newPage({viewport:{width:1440,height:900}})
  await page.route('**/api/readings',r=>state==='failure'?r.fulfill({status:502,json:{error:'Unavailable'}}):r.fulfill({json:{entries:state==='empty'?[]:entries,partial:state==='partial',stale:false}}))
  await page.goto(`${base}tests/fixtures/readings.html`)
  const panel=page.getByRole('region',{name:'Lectures',exact:true})
  await panel.getByText(state==='failure'?'Ara no es poden carregar les lectures.':state==='empty'?'No hi ha lectures disponibles.':'Algunes fonts no estan disponibles.',{exact:state!=='failure'}).waitFor()
  await page.getByRole('heading',{name:'Jugant',exact:true}).waitFor()
  await page.close()
 }
 console.log('Lectures: 16 combinacions amplada/alçada/tema, navegació de la barra sense peticions duplicades, títols, focus, enllaços i errors correctes.')
} finally {await browser.close()}
