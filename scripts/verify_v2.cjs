const { chromium }=require('playwright');const assert=require('node:assert/strict');const fs=require('node:fs');
(async()=>{const b=await chromium.launch();const results=[];try{
for(const [locale,lang] of [['ja-JP','ja'],['es-MX','es'],['zh-TW','zh-CN'],['en-GB','en'],['fr-FR','en']]){
 const p=await b.newPage({locale,viewport:{width:1440,height:940},reducedMotion:'reduce'});const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(r.url())});
 await p.goto('http://127.0.0.1:8765/');assert.equal(await p.locator('html').getAttribute('lang'),lang);await p.locator('.hero-window img').evaluate(i=>i.decode());
 assert.equal(await p.locator('#language').inputValue(),'auto');
 for(const id of ['4','9','1']){await p.locator(`[data-hero-view="${id}"]`).click();assert.equal(await p.locator('.hero-window img').getAttribute('data-image'),id);await p.locator('.hero-window img').evaluate(i=>i.decode());}
 for(const id of ['4','8','6']){await p.locator(`[data-detail="${id}"]`).click();await p.locator('#feature-dialog').waitFor({state:'visible'});assert.ok((await p.locator('#detail-title').textContent()).length>3);await p.keyboard.press('Escape');await p.waitForFunction(()=>!document.body.classList.contains('modal-open'));}
 await p.locator('#language').selectOption('es');await p.waitForFunction(()=>document.documentElement.lang==='es');await p.goto('http://127.0.0.1:8765/');assert.equal(await p.locator('html').getAttribute('lang'),'es');
 await p.goto('http://127.0.0.1:8765/?lang=ja');assert.equal(await p.locator('html').getAttribute('lang'),'ja');
 await p.locator('#language').selectOption('auto');await p.waitForFunction(l=>document.documentElement.lang===l,lang);
 assert.deepEqual(errors,[]);results.push({locale,resolved:lang,persistence:'passed',heroViews:'passed',details:'passed'});await p.close();
}
for(const width of [320,390,768,1440])for(const lang of ['zh','en','ja','es']){
 const p=await b.newPage({viewport:{width,height:width>900?940:844},reducedMotion:'reduce'});await p.goto(`http://127.0.0.1:8765/?lang=${lang}`);await p.locator('.hero-window img').evaluate(i=>i.decode());await p.locator('.hero-mini img').evaluate(i=>i.decode());
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${width}/${lang} overflow`);
 await p.screenshot({path:`output/playwright/v2-${width}-${lang}.png`});await p.close();
}
const p=await b.newPage();await p.addInitScript(()=>{Object.defineProperty(navigator,'languages',{get:()=>['fr-FR','es-ES','en-US']});Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked')}})});await p.goto('http://127.0.0.1:8765/');assert.equal(await p.locator('html').getAttribute('lang'),'es');results.push({orderedBrowserListAndBlockedStorage:'passed'});await p.close();
const basic=await b.newPage({javaScriptEnabled:false});await basic.goto('http://127.0.0.1:8765/');assert.equal(await basic.locator('h1').innerText(),'See more.\nCreate better.');await basic.close();results.push({noJS:'English fallback passed',responsive:'16 viewport/locale combinations passed'});
fs.writeFileSync('output/playwright/v2-verification.json',JSON.stringify(results,null,2));console.log(results);
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
