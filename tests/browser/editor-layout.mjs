/* global document, structuredClone */
import { URL } from 'node:url'
import { setTimeout } from 'node:timers'
import assert from 'node:assert/strict'
import process from 'node:process'
import console from 'node:console'
const {chromium}=await import(process.env.TSUMIGE_PLAYWRIGHT_MODULE??'/tmp/tsumige-edit-browser/node_modules/playwright/index.mjs')
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH??'/home/belchi/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell',args:['--no-sandbox']})
const base=process.env.TEST_BASE_URL??'http://127.0.0.1:5194/Tsumige/'
try {
 for(const width of [390,768,1440])for(const theme of ['light','dark'])for(const kind of ['collection','log']){
  const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage()
  let state,fail=false,saveCount=0,deleteCount=0,delay=0
  const errors=[],unexpected=[]
  page.on('pageerror',e=>errors.push(e.message))
  await context.route('**/*',async route=>{
   const request=route.request(),url=new URL(request.url()),path=url.pathname,method=request.method()
   if(url.hostname==='127.0.0.1'){
    if(path.endsWith('/synthetic-editor-state'))return route.fulfill({json:state})
    if(path.includes('/synthetic-portrait.svg'))return route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="264" height="374"><rect width="264" height="374" fill="#458660"/></svg>'})
    return route.continue()
   }
   // Totes les peticions de Supabase s’intercepten. Cap byte de prova surt al servei real.
   if(path.endsWith('/rpc/desar_registre_plataforma')){
    saveCount++;const input=request.postDataJSON()
    if(delay)await new Promise(resolve=>setTimeout(resolve,delay))
    if(fail)return route.fulfill({status:400,json:{message:'synthetic failure',code:'P0001'}})
    assert.equal(input.p_id,kind==='log'?state.experiencies[0].id:state.exemplars[0].id)
    const originalId=state.jocs[0].id
    Object.assign(state.jocs[0],input.p_fitxa)
    Object.assign(kind==='log'?state.experiencies[0]:state.exemplars[0],input.p_dades)
    assert.equal(state.jocs[0].id,originalId)
    return route.fulfill({json:null})
   }
   if(path.endsWith('/fitxes_joc')&&method==='PATCH'){Object.assign(state.jocs[0],request.postDataJSON());return route.fulfill({json:{id:state.jocs[0].id}})}
   if(path.endsWith('/experiencies')&&method==='PATCH'){Object.assign(state.experiencies[0],request.postDataJSON());return route.fulfill({json:null})}
   if((path.endsWith('/exemplars')||path.endsWith('/experiencies'))&&method==='GET')return route.fulfill({json:path.endsWith('/exemplars')?state.exemplars[0]:state.experiencies[0]})
   if(method==='DELETE'){deleteCount++;return route.fulfill({status:400,json:{message:'No real deletions'}})}
   unexpected.push(`${method} ${path}`);return route.abort()
  })
  await page.goto(`${base}tests/fixtures/editor-layout.html?kind=${kind}&theme=${theme}`)
  state=JSON.parse(await page.locator('#fixture-catalog').textContent())
  const original=structuredClone(state),originalOther=structuredClone(state.jocs[1])
  await page.getByRole('button',{name:'Edita',exact:true}).click()
  const form=page.locator('#detall-formulari'),top=page.getByRole('group',{name:'Accions superiors del detall'}),bottom=page.getByRole('group',{name:'Accions inferiors del detall'})
  assert.deepEqual(await top.getByRole('button').allTextContents(),await bottom.getByRole('button').allTextContents())
  for(const group of [top,bottom]){
   for(const label of ['Desfés els canvis','Elimina el registre','Tanca'])assert.equal(await group.getByRole('button',{name:label,exact:true}).getAttribute('type'),'button')
   assert.equal(await group.getByRole('button',{name:'Desa els canvis',exact:true}).getAttribute('type'),'submit')
  }
  const tracking=form.getByRole('group',{name:'Seguiment i preferències de joc',exact:true})
  assert.deepEqual(await tracking.getByRole('checkbox').evaluateAll(nodes=>nodes.map(n=>n.closest('label').textContent)),['No jugat','Hi estic jugant','Per jugar aviat','Vull jugar-hi','No vull jugar-hi','Per jugar amb infants'])
  if(kind==='collection'&&width>=768){
   const first=await tracking.boundingBox(),second=await form.getByRole('group',{name:'Col·lecció',exact:true}).boundingBox()
   assert(Math.abs(first.y-second.y)<1);assert(Math.abs(first.height-second.height)<1)
  }
  if(width>=768){
   const name=await form.getByRole('textbox',{name:'Nom',exact:true}).boundingBox(),platform=await form.getByRole('combobox',{name:'Plataforma',exact:true}).boundingBox(),rating=await form.getByRole('combobox',{name:'Valoració',exact:true}).boundingBox()
   assert(Math.abs(name.y-platform.y)<1);assert(Math.abs(name.y-rating.y)<1);assert(name.x<platform.x&&platform.x<rating.x)
   if(width===1440)assert(name.width<500)
  }
  if(width===1440){
   const genre=await form.getByRole('combobox',{name:'Gènere',exact:true}).boundingBox(),year=await form.getByRole('spinbutton',{name:'Any de llançament',exact:true}).boundingBox()
   assert(Math.abs(genre.y-year.y)<1);assert(Math.abs(genre.height-year.height)<1)
  }
  if(kind==='collection'){
   const price=form.getByRole('spinbutton',{name:'Preu (€)',exact:true})
   await price.fill('999.99');assert.equal(await price.inputValue(),'999.99');assert((await price.boundingBox()).width>=120)
  }
  assert.equal(await form.getByRole('combobox',{name:'Plataforma',exact:true}).isDisabled(),true)
  assert.equal(await form.getByRole('combobox',{name:'Plataforma',exact:true}).inputValue(),'PC')
  assert.equal(await form.getByRole('combobox',{name:'Valoració',exact:true}).evaluate(e=>e.getBoundingClientRect().width)<100,true)
  for(const mark of ['No jugat','Per jugar amb infants','Hi estic jugant','Per jugar aviat'])assert.equal(await form.getByRole('checkbox',{name:mark,exact:true}).count(),1)
  const want=form.getByRole('checkbox',{name:'Vull jugar-hi',exact:true}),avoid=form.getByRole('checkbox',{name:'No vull jugar-hi',exact:true})
  await want.check();await avoid.check();assert.equal(await want.isChecked(),false)
  await avoid.uncheck();assert.equal(await want.isChecked(),false)
  await want.focus();await page.keyboard.press('Space');assert.equal(await want.isChecked(),true)
  // Cada grup desfà el nom, intenció i valoració sense desar ni tancar el detall.
  for(const group of [top,bottom]){
   await form.getByRole('textbox',{name:'Nom',exact:true}).fill('Nom per desfer')
   await form.getByRole('combobox',{name:'Valoració',exact:true}).selectOption('D')
   await group.getByRole('button',{name:'Desfés els canvis',exact:true}).click()
   await page.getByRole('button',{name:'Edita',exact:true}).click()
   assert.equal(await form.getByRole('textbox',{name:'Nom',exact:true}).inputValue(),original.jocs[0].nom)
   assert.equal(await form.getByRole('combobox',{name:'Valoració',exact:true}).inputValue(),original.jocs[0].valoracio)
  }
  assert.equal(saveCount,0)
  // Els dos botons Tanca protegeixen els canvis.
  for(const group of [top,bottom]){
   await form.getByRole('textbox',{name:'Nom',exact:true}).fill('Canvi pendent')
   await group.getByRole('button',{name:'Tanca',exact:true}).click()
   await page.getByText('Tens canvis sense desar. Què vols fer abans de continuar?',{exact:true}).waitFor()
   await page.getByRole('button',{name:'Continua editant',exact:true}).click()
  }
  await top.getByRole('button',{name:'Desfés els canvis',exact:true}).click();await page.getByRole('button',{name:'Edita',exact:true}).click()
  // Cap eliminació amb el clic inicial; Escape cancel·la i manté l’edició.
  for(const group of [top,bottom]){
   await group.getByRole('button',{name:'Elimina el registre',exact:true}).click()
   await page.getByText('Segur que vols eliminar aquest registre? Aquesta acció no es pot desfer.',{exact:true}).waitFor()
   assert.equal(await page.getByRole('button',{name:'Cancel·la',exact:true}).evaluate(e=>e===document.activeElement),true)
   await page.keyboard.press('Escape');assert.equal(deleteCount,0)
   assert.equal(await page.locator('#result').textContent(),'','Cancel·lar l’eliminació no ha de tancar el detall')
   assert.equal(await form.isVisible(),true)
  }
  // L’eliminació inferior amb canvis pendents reutilitza el controlador superior
  // encara que descartar retiri el formulari d’edició.
  await form.getByRole('textbox',{name:'Nom',exact:true}).fill('Nom per descartar')
  await bottom.getByRole('button',{name:'Elimina el registre',exact:true}).click()
  await page.getByRole('button',{name:'Descarta i continua',exact:true}).click()
  await page.getByText('Segur que vols eliminar aquest registre? Aquesta acció no es pot desfer.',{exact:true}).waitFor()
  await page.keyboard.press('Escape');assert.equal(deleteCount,0)
  await page.getByRole('button',{name:'Edita',exact:true}).click()
  assert.equal(await form.getByRole('textbox',{name:'Nom',exact:true}).inputValue(),original.jocs[0].nom)
  // Error: conserva text i permet reintentar. Desament correcte des dels dos extrems.
  await form.getByRole('textbox',{name:'Nom',exact:true}).fill('Nom conservat després d’error')
  fail=true;await bottom.getByRole('button',{name:'Desa els canvis',exact:true}).click()
  await page.getByRole('alert').waitFor();assert.equal(await form.getByRole('textbox',{name:'Nom',exact:true}).inputValue(),'Nom conservat després d’error')
  fail=false
  for(const [index,group] of [top,bottom].entries()){
   const title=`Nom desat ${index} ${'llarg '.repeat(12)}`
   await form.getByRole('textbox',{name:'Nom',exact:true}).fill(title)
   await form.getByRole('combobox',{name:'Valoració',exact:true}).selectOption(index?'B':'A++')
   await form.getByRole('checkbox',{name:'Per jugar amb infants',exact:true}).check()
   await form.getByRole('checkbox',{name:'No jugat',exact:true}).check();await want.check()
   if(kind==='collection')await form.getByRole('spinbutton',{name:'Preu (€)',exact:true}).fill(index?'999.99':'0')
   delay=200
   await group.getByRole('button',{name:'Desa els canvis',exact:true}).click()
   await top.getByRole('button',{name:'Desant…',exact:true}).waitFor();assert.equal(await bottom.getByRole('button',{name:'Desant…',exact:true}).isDisabled(),true)
   await page.getByText('Canvis desats.',{exact:true}).waitFor()
   if(kind==='collection')assert.equal(state.exemplars[0].preu,index?999.99:0)
   assert.equal(state.jocs[0].nom,title);assert.equal(state.jocs[0].no_jugat,true);assert.equal(state.jocs[0].intencio_joc,'vull');assert.equal(state.jocs[0].per_infants,true)
   assert.equal(state.jocs[0].portada_url,original.jocs[0].portada_url);assert.equal(state.jocs[0].portada_font_url,original.jocs[0].portada_font_url)
   assert.deepEqual(state.jocs[1],originalOther);assert.equal(state.jocs[0].id,original.jocs[0].id)
   assert.equal(state.exemplars[0].joc_id,original.exemplars[0].joc_id);assert.equal(state.experiencies[0].joc_id,original.experiencies[0].joc_id)
   await page.getByRole('button',{name:'Edita',exact:true}).click()
   assert.equal(await form.getByRole('textbox',{name:'Nom',exact:true}).inputValue(),title)
  }
  assert.equal(saveCount,3);assert.equal(deleteCount,0)
  assert.equal(await page.getByRole('dialog').first().evaluate(e=>e.scrollWidth<=e.clientWidth+1),true)
  if(kind==='collection'&&(width===390||width===1440)){
   await page.screenshot({path:`/tmp/tsumige-editor-${width}-${theme}.png`,fullPage:true})
   await bottom.scrollIntoViewIfNeeded();await page.screenshot({path:`/tmp/tsumige-editor-bottom-${width}-${theme}.png`,fullPage:true})
  }
  assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[])
  await page.goto(`${base}tests/fixtures/editor-layout.html?kind=${kind}&theme=${theme}&guest=1`)
  await page.getByRole('dialog').waitFor();assert.equal(await page.getByRole('button',{name:'Edita',exact:true}).count(),0)
  assert.equal(await page.getByRole('button',{name:'Elimina el registre',exact:true}).count(),0)
  await context.close()
 }
 console.log('PASS editor: 12 combinacions amplada/tema/àmbit, accions equivalents, desament/error/desfer, noms i marques, vincles i portada, plataforma protegida, eliminació confirmada, convidats; cap petició real.')
} finally {await browser.close()}
