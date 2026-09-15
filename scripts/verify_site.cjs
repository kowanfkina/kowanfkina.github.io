const {chromium} = require('playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const BASE = process.env.SITE_URL || 'http://127.0.0.1:8765';
(async()=>{
 const browser=await chromium.launch(); const results=[];
 try {
 for(const [width,height,lang] of [[1440,1000,'en'],[1440,1000,'zh'],[390,844,'zh'],[320,740,'en'],[768,1024,'en']]){
  const p=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
  const errors=[];const requests=[];
  p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});p.on('request',r=>requests.push(r.url()));
  await p.goto(`${BASE}/?lang=${lang}`);await p.locator('.hero-window img').evaluate(i=>i.decode());
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'horizontal overflow');
  assert.equal(requests.some(u=>u.endsWith('.mp4')),false,'video loaded before intent');
  await p.locator('[data-scene="2"]').click();assert.equal(await p.locator('#panel-2').isVisible(),true);
  await p.locator('[data-scene="2"]').press('Home');assert.equal(await p.locator('#tab-0').getAttribute('aria-selected'),'true');
  const expected=lang==='zh'?'en':'zh-CN';await p.locator('#language').selectOption(lang==='zh'?'en':'zh');assert.equal(await p.locator('html').getAttribute('lang'),expected);
  await p.reload();assert.equal(await p.locator('html').getAttribute('lang'),expected);
  await p.locator('[data-detail="8"]').click();await p.locator('#feature-dialog').waitFor({state:'visible'});
  assert.ok((await p.locator('#detail-title').textContent()).length>5);await p.keyboard.press('Escape');assert.equal(await p.locator('#feature-dialog').isVisible(),false);
  assert.equal(await p.locator('[data-detail="8"]').evaluate(e=>e===document.activeElement),true,'focus not restored');
  await p.locator('#loop-toggle').click();await p.waitForFunction(()=>document.querySelector('#compare-loop').currentTime>0);await p.locator('#loop-toggle').click();assert.equal(await p.locator('#compare-loop').evaluate(v=>v.paused),true);
  await p.locator('[data-film]').click();await p.waitForFunction(()=>document.querySelector('#film').currentTime>0);await p.keyboard.press('Escape');await p.waitForFunction(()=>document.querySelector('#film').paused);assert.equal(await p.locator('#film-dialog').isVisible(),false);
  await p.evaluate(async()=>{document.querySelectorAll('img').forEach(i=>i.loading='eager');await Promise.all([...document.images].map(i=>i.decode()));});
  assert.equal(errors.length,0,errors.join('\n'));
  await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:`output/playwright/${width}-${lang}.png`});
  if(width===1440&&lang==='zh'){await p.screenshot({path:'output/playwright/full-page.png',fullPage:true});}
  results.push({width,height,lang,checks:'layout, localization, lazy video, keyboard tabs, modal focus, loop, film, images passed'});await p.close();
 }
 const basic=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});await basic.goto(BASE);
 assert.equal(await basic.locator('h1').isVisible(),true);assert.equal(await basic.locator('#contact a[href^="mailto:"]').isVisible(),true);await basic.locator('[data-detail="5"]').click();assert.equal(await basic.locator('#detail-5').isVisible(),true);results.push({noJavaScript:'content, contact and feature fallbacks passed'});await basic.close();
 const p=await browser.newPage({viewport:{width:1440,height:1000}});await p.goto(`${BASE}/?lang=zh`);
 await p.waitForFunction(()=>document.querySelector('.comparison').classList.contains('scroll-story'));
 const geometry=await p.locator('.comparison').evaluate(e=>({top:e.offsetTop,height:e.offsetHeight}));
 for(let index=0;index<3;index++){
  await p.evaluate(({top,height,index})=>scrollTo({top:top+(height-innerHeight)*((index+.2)/3),behavior:'instant'}),{...geometry,index});
  await p.waitForFunction(i=>document.querySelector(`#tab-${i}`).getAttribute('aria-selected')==='true',index);
  await p.locator(`#panel-${index} img`).evaluate(i=>i.decode());await p.waitForTimeout(550);await p.screenshot({path:`output/playwright/scroll-scene-${index}.png`});
 }
 const metrics=await p.evaluate(async()=>{
  const durations=[];let last;const start=performance.now();
  await new Promise(resolve=>{function tick(t){if(last)durations.push(t-last);last=t;scrollTo({top:geometryTop()+Math.sin((t-start)/1800)*350+400,behavior:'instant'});if(t-start<2500)requestAnimationFrame(tick);else resolve();}function geometryTop(){return document.querySelector('.comparison').offsetTop;}requestAnimationFrame(tick);});
  durations.sort((a,b)=>a-b);return {sampleFrames:durations.length,medianMs:durations[Math.floor(durations.length*.5)],p95Ms:durations[Math.floor(durations.length*.95)],over33ms:durations.filter(d=>d>33.4).length};
 });results.push({desktopScrollStory:'all 3 phases passed',localHeadlessFrameTiming:metrics});
 await p.emulateMedia({reducedMotion:'reduce'});await p.waitForFunction(()=>!document.querySelector('.comparison').classList.contains('scroll-story'));assert.equal(await p.locator('.comparison').evaluate(e=>e.classList.contains('scroll-story')),false);await p.close();
 const blocked=await browser.newPage();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked')}});window.IntersectionObserver=undefined;});await blocked.goto(BASE);assert.equal(await blocked.locator('h1').isVisible(),true);await blocked.locator('#language').selectOption('ja');results.push({blockedStorageAndNoObserver:'passed'});await blocked.close();
 fs.writeFileSync('output/playwright/verification.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
