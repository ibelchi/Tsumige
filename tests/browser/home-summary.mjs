/* global document, innerWidth */
import assert from 'node:assert/strict'
import process from 'node:process'
import console from 'node:console'
import {URL,URLSearchParams} from 'node:url'
const {chromium}=await import(process.env.TSUMIGE_PLAYWRIGHT_MODULE??'/tmp/tsumige-edit-browser/node_modules/playwright/index.mjs')
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH??'/home/belchi/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell',args:['--no-sandbox']})
const base=process.env.TEST_BASE_URL??'http://127.0.0.1:5194/Tsumige/'
const labels=['Jocs físics','Jocs digitals','Vull jugar','Jocs top','Jocs MEH'],counts=[3,3,3,3,1]
try {
 for(const width of [390,768,1024,1440])for(const theme of ['light','dark']){
  const context=await browser.newContext({viewport:{width,height:1000},hasTouch:width<768,isMobile:width<768})
  const page=await context.newPage(),errors=[],external=[]
  page.on('pageerror',e=>errors.push(e.message))
  await context.route('**/*',route=>{if(new URL(route.request().url()).hostname==='127.0.0.1')return route.continue();external.push(new URL(route.request().url()).hostname);return route.abort()})
  const url=`${base}tests/fixtures/home-summary.html?theme=${theme}&vista=inici&cerca=residual&plataforma=Residual&format=&valoracio=D&favorits=1&pagina=99`
  await page.goto(url)
  const cards=page.getByRole('group',{name:'Recomptes de la col·lecció'}),links=cards.getByRole('link')
  await cards.waitFor();assert.equal(await links.count(),5)
  assert.deepEqual(await links.locator('span').filter({hasText:/^Jocs|^Vull jugar$/}).allTextContents(),labels)
  assert.equal(await links.nth(3).innerText().then(t=>t.includes('50,0 %')),true)
  assert.equal(await links.nth(4).innerText().then(t=>t.includes('16,7 %')),true)
  const boxes=await links.evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {top:r.top,bottom:r.bottom}}))
  if(width>=1024)assert(boxes.every(b=>b.top===boxes[0].top))
  const input=page.getByRole('combobox',{name:'Cerca un joc',exact:true})
  assert((await input.boundingBox()).y>=Math.max(...boxes.map(b=>b.bottom)))
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false)
  await page.screenshot({path:`/tmp/tsumige-summary-${width}-${theme}.png`,fullPage:true})
  for(let i=0;i<labels.length;i++){
   const card=cards.getByRole('link',{name:new RegExp(labels[i])})
   assert.equal(await card.locator('[data-summary-count]').textContent(),String(counts[i]))
   const href=await card.getAttribute('href'),params=new URLSearchParams(href.slice(2))
   for(const key of ['cerca','plataforma','genere','favorits','no_jugat','pagina'])assert.equal(params.has(key),false)
   if(i===0){await card.focus();await page.keyboard.press('Enter')}else await card.click()
   await page.getByRole('heading',{name:'Col·lecció',exact:true}).waitFor()
   await page.getByRole('status').filter({hasText:new RegExp(`^${counts[i]} exemplars$`)}).waitFor()
   assert.equal(await page.getByRole('region',{name:'Jocs de la col·lecció'}).getByRole('button').count(),counts[i])
   if(i===3){assert.deepEqual(new URL(page.url()).searchParams.getAll('valoracio'),['A+','A++']);assert.equal(await page.getByRole('combobox',{name:'Filtra per valoració'}).inputValue(),'__top__')}
   await page.goBack();await cards.waitFor()
  }
  // Els dos títols iguals es distingeixen per plataforma. Clic/tap i Retorn obren l’ID correcte.
  await input.fill('Títol')
  const option=page.getByRole('option').filter({hasText:'Nintendo Switch'})
  await option.waitFor();if(width<768)await option.tap();else await option.click()
  const detail=page.getByRole('dialog');await detail.waitFor();assert((await detail.innerText()).includes('Nintendo Switch'))
  await detail.getByRole('button',{name:'Tanca',exact:true}).click()
  await input.fill('Només log');await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter')
  await detail.waitFor();assert((await detail.innerText()).includes('Només log'));assert((await detail.innerText()).includes('Emulador'))
  await detail.getByRole('button',{name:'Tanca',exact:true}).click()
  await input.fill('absent');await page.getByText('Cap joc trobat.',{exact:true}).waitFor();await page.keyboard.press('Escape')
  assert.equal(await input.getAttribute('aria-expanded'),'false')
  await page.goto(`${base}tests/fixtures/home-summary.html?empty=1&theme=${theme}`)
  await cards.waitFor();assert.deepEqual(await links.locator('[data-summary-count]').allTextContents(),['0','0','0','0','0'])
  assert((await links.nth(3).innerText()).includes('0,0 %'));assert((await links.nth(4).innerText()).includes('0,0 %'))
  assert.deepEqual(errors,[]);assert.deepEqual(external,[])
  await context.close()
 }
 console.log('PASS Home: 390/768/1024/1440 Clar/Fosc, cinc targetes i filtres/recomptes coincidents, Top OR, denominador complet, buits, cercador clic/tap/teclat i sense desbordament ni peticions externes.')
}finally{await browser.close()}
