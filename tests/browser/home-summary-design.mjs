/* global document, innerWidth, getComputedStyle */
import assert from 'node:assert/strict'
import process from 'node:process'
import console from 'node:console'
import {URL} from 'node:url'
const {chromium}=await import(process.env.TSUMIGE_PLAYWRIGHT_MODULE??'/tmp/tsumige-edit-browser/node_modules/playwright/index.mjs')
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH??'/home/belchi/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell',args:['--no-sandbox']})
const base=process.env.TEST_BASE_URL??'http://127.0.0.1:5194/Tsumige/'
try{
 for(const width of [320,390,768,1024,1440,1920])for(const theme of ['light','dark'])for(const reducedMotion of ['no-preference','reduce']){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion})
  const page=await context.newPage(),external=[],errors=[]
  page.on('pageerror',e=>errors.push(e.message))
  await context.route('**/*',r=>{if(new URL(r.request().url()).hostname==='127.0.0.1')return r.continue();external.push(r.request().url());return r.abort()})
  await page.goto(`${base}tests/fixtures/home-summary.html?theme=${theme}&large=1`)
  const group=page.getByRole('group',{name:'Recomptes de la col·lecció'}),cards=group.getByRole('link')
  await cards.first().waitFor();assert.equal(await cards.count(),5)
  assert.equal(await cards.first().locator('[data-summary-count]').textContent(),'1234')
  assert.equal(await cards.nth(3).locator('[data-summary-percentage]').textContent(),'100,0 %')
  const geometry=await group.evaluate(node=>{
   const outer=node.parentElement.getBoundingClientRect(),frame=node.getBoundingClientRect()
   return {center:frame.x+frame.width/2,outerCenter:outer.x+outer.width/2,width:frame.width,overflow:document.documentElement.scrollWidth>innerWidth,cards:[...node.querySelectorAll('a')].map(card=>{
    const r=card.getBoundingClientRect(),label=card.querySelector('[data-summary-label]').getBoundingClientRect(),count=card.querySelector('[data-summary-count]').getBoundingClientRect(),pct=card.querySelector('[data-summary-percentage]').getBoundingClientRect(),icon=card.querySelector('svg').getBoundingClientRect()
    return {x:r.x,y:r.y,width:r.width,height:r.height,labelY:label.y-r.y,countCenter:count.x+count.width/2,pctCenter:pct.x+pct.width/2,pctText:card.querySelector('[data-summary-percentage]').textContent,icon:icon.width,overflow:card.scrollWidth>card.clientWidth,pctFits:pct.x>=r.x&&pct.right<=r.right}
   })}
  })
  assert.equal(geometry.overflow,false);assert(Math.abs(geometry.center-geometry.outerCenter)<1)
  for(const card of geometry.cards){
   assert.equal(card.overflow,false,`${width} ${theme} ${JSON.stringify(card)}`)
   assert.equal(card.pctFits,true);assert.equal(card.icon,26)
   assert(Math.abs(card.height-geometry.cards[0].height)<1);assert(Math.abs(card.labelY-geometry.cards[0].labelY)<1)
   if(card.pctText)assert(Math.abs(card.countCenter-card.pctCenter)<1)
  }
  if(width>=1024)assert(geometry.cards.every(c=>c.y===geometry.cards[0].y))
  if(width>=1440){assert(geometry.width<=900);assert(geometry.cards.every(c=>c.width>=160&&c.width<=180))}
  const input=page.getByRole('combobox',{name:'Cerca un joc',exact:true})
  if(width>=1440)assert((await input.boundingBox()).width>geometry.width+100)
  // Contrast real de CSS color-mix: textos normals >=4,5:1, icones >=3:1.
  const contrast=await group.evaluate(node=>{
   const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');canvas.width=canvas.height=1
   function rgb(color){ctx.clearRect(0,0,1,1);ctx.fillStyle=color;ctx.fillRect(0,0,1,1);return [...ctx.getImageData(0,0,1,1).data].slice(0,3).map(c=>c/255)}
   function light(color){const c=rgb(color).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722}
   function ratio(a,b){const x=light(a),y=light(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
   return [...node.querySelectorAll('a')].map(card=>{
    const bg=getComputedStyle(card).backgroundColor,chip=card.querySelector('.home-summary-icon')
    return{label:ratio(getComputedStyle(card.querySelector('[data-summary-label]')).color,bg),count:ratio(getComputedStyle(card.querySelector('[data-summary-count]')).color,bg),pct:ratio(getComputedStyle(card.querySelector('[data-summary-percentage]')).color,bg),icon:ratio(getComputedStyle(chip).color,getComputedStyle(chip).backgroundColor)}
   })
  })
  for(const c of contrast){assert(c.label>=4.5);assert(c.count>=4.5);assert(c.pct>=4.5);assert(c.icon>=3)}
  const first=cards.first();await first.focus()
  assert.equal(await first.evaluate(e=>e===document.activeElement),true)
  assert(await first.evaluate(e=>parseFloat(getComputedStyle(e).outlineWidth)>=2&&getComputedStyle(e).outlineStyle!=='none'))
  const before=await first.boundingBox();await first.hover()
  if(reducedMotion==='reduce')assert.equal(await first.evaluate(e=>getComputedStyle(e).transform),'none')
  else{
   await page.waitForFunction(()=>getComputedStyle(document.querySelector('.home-summary-card')).transform!=='none')
   const after=await first.boundingBox();assert(before.y-after.y>=0&&before.y-after.y<=2)
  }
  if(reducedMotion==='no-preference'&&(width===390||width===1440))await page.screenshot({path:`/tmp/tsumige-summary-design-${width}-${theme}.png`,fullPage:true})
  assert.deepEqual(external,[]);assert.deepEqual(errors,[])
  await context.close()
 }
 console.log('PASS disseny: 24 combinacions amplada/tema/moviment, centrat, cinc columnes, 1234 i 100,0 %, alineacions, contrast, focus i moviment reduït; sense consultes externes.')
}finally{await browser.close()}
