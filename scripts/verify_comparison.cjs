const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const OUTPUT = path.resolve(__dirname,'../output/playwright');
const vendors = ['xnview','pixea','edgeview','faststone'];
async function setup(browser, options={}) {
  const page=await browser.newPage({viewport:{width:1440,height:960},reducedMotion:'reduce',...options});
  page.setDefaultTimeout(6000);
  await page.route(/^https:\/\/(?:www\.clarity\.ms|cloud\.umami\.is|www\.googletagmanager\.com)\//,
    route=>route.fulfill({contentType:'application/javascript',body:'/* Local QA only. */'}));
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  return {page,errors};
}
const visibleCount=locator=>locator.evaluateAll(nodes=>nodes.filter(x=>getComputedStyle(x).display!=='none').length);
async function layouts(browser,base) {
  const results=[];
  for(const width of [320,390,768,1024,1440,1920])for(const lang of ['zh','en','ja','es']) {
    const {page,errors}=await setup(browser,{viewport:{width,height:width>900?960:844}});
    await page.goto(`${base}/?lang=${lang}#software-comparison`);
    assert.equal(await page.locator('[data-peer]:visible').getAttribute('data-peer'),'faststone');
    assert.equal(await page.locator('.domino-viewer h3').innerText(),'Domino Image Viewer');
    assert.equal(await page.locator('#compare-download').getAttribute('href'),'https://apps.apple.com/app/id6760245734');
    assert.equal(await page.locator('#capability-matrix').getAttribute('open'),null);
    await page.locator('.comparison-jump').click();
    assert.equal(await page.locator('[data-capability]:visible').count(),12);
    assert.equal(await visibleCount(page.locator('.capability-table thead th')),width>900?6:3);
    for(const key of vendors) {
      if(width<=900)await page.locator('#matrix-viewer').selectOption(key);
      else await page.locator(`[data-vendor-to="${key}"]`).click();
      assert.equal(await page.locator('[data-peer]:visible').getAttribute('data-peer'),key);
      assert.equal(await page.locator('[data-vendor-to][aria-pressed=true]').getAttribute('data-vendor-to'),key);
      assert.equal(await page.locator('#matrix-viewer').inputValue(),key);
      assert.equal(await page.locator('.capability-table thead th.is-selected').getAttribute('data-vendor'),key);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${width}/${lang}/${key} page overflow`);
    }
    for(const selector of ['.software-heading','.viewer-switch','.viewer-card:visible','.comparison-jump','.matrix-toolbar-actions','.matrix-scroll'])for(const element of await page.locator(selector).all()) {
      const box=await element.boundingBox();assert.ok(box.x>=-1&&box.x+box.width<=width+1,`${width}/${lang}: ${selector}`);
    }
    await page.locator('#capability-focus').click();assert.equal(await page.locator('[data-capability]:visible').count(),8);
    await page.locator('#capability-focus').click();assert.equal(await page.locator('[data-capability]:visible').count(),12);
    assert.equal(await page.evaluate(()=>window.dataLayer.filter(x=>x[0]==='event').length),0,'comparison controls must not report conversions');
    await page.locator('.matrix-details > summary').press('Enter');assert.equal(await page.locator('[data-capability]:visible').count(),0);
    await page.locator('.matrix-details > summary').press('Enter');assert.equal(await page.locator('[data-capability]:visible').count(),12);
    if([320,390,1440].includes(width)&&['zh','en'].includes(lang)) {
      await page.locator('.software-heading').scrollIntoViewIfNeeded();
      await page.screenshot({path:path.join(OUTPUT,`software-heading-${width}-${lang}.png`),scale:'css'});
      await page.locator('.comparison-jump').click();
      await page.screenshot({path:path.join(OUTPUT,`software-matrix-${width}-${lang}.png`),scale:'css'});
    }
    assert.deepEqual(errors,[]);await page.close();results.push({width,lang,allFourViewers:true,capabilities:12,focusedCapabilities:8,viewportFit:true});
  }
  return results;
}
async function interaction(browser,base) {
  const results=[];
  for(const width of [390,1440]) {
    const {page,errors}=await setup(browser,{viewport:{width,height:960}});
    await page.goto(`${base}/?lang=zh#software-comparison`);
    await page.locator('[data-vendor-to=faststone]').press('Home');assert.equal(await page.locator('[data-peer]:visible').getAttribute('data-peer'),'xnview');
    await page.keyboard.press('ArrowRight');assert.equal(await page.locator('[data-peer]:visible').getAttribute('data-peer'),'pixea');
    await page.keyboard.press('End');assert.equal(await page.locator('[data-peer]:visible').getAttribute('data-peer'),'faststone');
    await page.keyboard.press('ArrowRight');assert.equal(await page.locator('[data-peer]:visible').getAttribute('data-peer'),'xnview');
    await page.keyboard.press('ArrowLeft');assert.equal(await page.locator('[data-peer]:visible').getAttribute('data-peer'),'faststone');
    await page.locator('.comparison-jump').click();
    if(width<=900)await page.locator('#matrix-viewer').selectOption('pixea');
    else await page.locator('[data-vendor-to=pixea]').click();
    await page.locator('#language').selectOption('en');
    assert.equal(await page.locator('[data-peer]:visible').getAttribute('data-peer'),'pixea');
    const overlay=page.locator('[data-capability=overlay] [data-vendor=pixea]');
    assert.ok((await overlay.innerText()).includes('Plus'));
    await page.locator('.viewer-trial').click();await page.waitForURL(url=>url.hash==='#plans');
    assert.equal(await page.locator('.purchase-card').count(),2);
    await page.goBack();assert.equal(new URL(page.url()).hash,'#capability-matrix');
    await page.goto(`${base}/?lang=zh#layouts`);
    const status=page.locator('.gallery-status'),previous=page.locator('[data-gallery-prev]'),next=page.locator('[data-gallery-next]');
    assert.equal(await previous.isDisabled(),true);
    const pages=width>900?2:3;assert.equal((await status.innerText()).trim(),`01 / 0${pages}`);
    for(let i=2;i<=pages;i++) {
      await next.click();await page.waitForFunction(text=>document.querySelector('.gallery-status').textContent===text,`0${i} / 0${pages}`);
    }
    await page.waitForFunction(()=>document.querySelector('[data-gallery-next]').disabled);
    const third=await page.locator('[data-feature-carousel] .feature-card').last().boundingBox();
    const grid=await page.locator('[data-feature-carousel] .feature-grid').boundingBox();
    assert.ok(third.x>=grid.x-1&&third.x+third.width<=grid.x+grid.width+1,'last image must be fully in view');
    for(let i=pages-1;i>=1;i--){await previous.click();await page.waitForFunction(text=>document.querySelector('.gallery-status').textContent===text,`0${i} / 0${pages}`);}
    await page.waitForFunction(()=>document.querySelector('[data-gallery-prev]').disabled);
    await page.locator('[data-feature-carousel] .feature-grid').press('ArrowRight');
    await page.waitForFunction(()=>document.querySelector('.gallery-status').textContent.startsWith('02'));
    await page.locator('[data-feature-carousel] .feature-card [data-detail]').last().click();
    await page.locator('#feature-dialog').waitFor({state:'visible'});assert.ok((await page.locator('#detail-title').innerText()).length>4);
    await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.body.classList.contains('modal-open'));
    assert.deepEqual(errors,[]);await page.close();results.push({width,keyboard:true,languageSelectionPreserved:true,trialReturn:true,galleryPages:pages,galleryRoundTrip:true,detailModal:true});
  }
  return results;
}
async function motion(browser,base) {
  const {page,errors}=await setup(browser,{reducedMotion:'no-preference'});
  await page.goto(`${base}/?lang=zh`);await page.mouse.move(5,5);
  const heading=page.locator('.software-heading');
  const target=await heading.evaluate(e=>e.getBoundingClientRect().top+scrollY-innerHeight*.6);
  await page.mouse.wheel(0,target);await page.waitForFunction(()=>document.querySelector('.software-heading').classList.contains('revealed'));
  await page.waitForTimeout(100);
  const entering=await heading.locator('.zh .reveal-line').evaluateAll(nodes=>nodes.map(e=>Number(getComputedStyle(e).opacity)));
  assert.ok(entering[0]>entering[1],'title lines must enter in reading order');
  await page.screenshot({path:path.join(OUTPUT,'software-title-entering.png'),scale:'css'});
  await page.waitForFunction(()=>[...document.querySelectorAll('.software-heading .zh .reveal-line')].every(e=>Number(getComputedStyle(e).opacity)===1));
  for(const key of [...vendors,...vendors])await page.locator(`[data-vendor-to=${key}]`).click();
  const selected=page.locator('[data-peer]:visible');
  assert.ok(await selected.evaluate(e=>e.getAnimations().filter(a=>a.playState==='running').length)<=1,'rapid switches must cancel old animation');
  await page.screenshot({path:path.join(OUTPUT,'software-peer-entering.png'),scale:'css'});
  await page.waitForTimeout(400);assert.equal(await selected.evaluate(e=>getComputedStyle(e).opacity),'1');
  const copyTop=await page.locator('[data-progress-copy]').evaluate(e=>e.getBoundingClientRect().top+scrollY);
  await page.mouse.wheel(0,copyTop-700-await page.evaluate(()=>scrollY));await page.waitForTimeout(200);
  const early=await page.locator('[data-progress-copy]>.zh .scroll-phrase').evaluateAll(items=>items.map(x=>Number(getComputedStyle(x).opacity)));
  await page.mouse.wheel(0,300);await page.waitForTimeout(250);
  const later=await page.locator('[data-progress-copy]>.zh .scroll-phrase').evaluateAll(items=>items.map(x=>Number(getComputedStyle(x).opacity)));
  assert.ok(later.some((value,index)=>value>early[index]),'scroll must reveal emphasized phrases');
  await page.screenshot({path:path.join(OUTPUT,'workflow-copy-scroll.png'),scale:'css'});
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>!document.documentElement.classList.contains('motion-enabled'));
  assert.equal(await page.locator('[data-progress-copy]>.zh .scroll-phrase').evaluateAll(items=>items.every(x=>getComputedStyle(x).opacity==='1')),true);
  const visibleLines=await page.locator('.software-heading .zh .reveal-line').evaluateAll(items=>items.every(x=>getComputedStyle(x).opacity==='1'));assert.equal(visibleLines,true);
  assert.deepEqual(errors,[]);await page.close();return [{titleLineOrder:true,entering,laterCopy:later,rapidSwitches:true,dynamicReducedMotion:true}];
}
async function fallbacks(browser,base) {
  const basic=await setup(browser,{javaScriptEnabled:false,viewport:{width:390,height:844}});
  await basic.page.goto(base);await basic.page.locator('#software-comparison').scrollIntoViewIfNeeded();
  assert.equal(await basic.page.locator('[data-capability]:visible').count(),12);
  assert.equal(await visibleCount(basic.page.locator('.capability-table thead th')),6);
  assert.equal(await basic.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.equal(await basic.page.locator('#capability-focus').isVisible(),false);
  assert.equal(await basic.page.locator('.viewer-switch').isVisible(),false);
  await basic.page.locator('.matrix-scroll').screenshot({path:path.join(OUTPUT,'software-no-script-table.png'),scale:'css'});
  await basic.page.close();
  const noObserver=await setup(browser,{reducedMotion:'no-preference'});
  await noObserver.page.addInitScript(()=>window.IntersectionObserver=undefined);
  await noObserver.page.goto(`${base}/?lang=zh#capability-matrix`);
  assert.equal(await noObserver.page.locator('[data-capability]:visible').count(),12);
  assert.equal(await noObserver.page.locator('.software-heading .zh .reveal-line').evaluateAll(items=>items.every(x=>getComputedStyle(x).opacity==='1')),true);
  assert.equal(await noObserver.page.locator('[data-progress-copy]>.zh .scroll-phrase').evaluateAll(items=>items.every(x=>getComputedStyle(x).opacity==='1')),true);
  await noObserver.page.locator('[data-vendor-to=pixea]').click();assert.equal(await noObserver.page.locator('[data-peer]:visible').getAttribute('data-peer'),'pixea');
  assert.deepEqual(noObserver.errors,[]);await noObserver.page.close();return [{noScriptFullTable:true,noObserverStaticContent:true,deepLink:true}];
}
module.exports=async (browser,base='http://127.0.0.1:8765',group='layouts')=>{
  fs.mkdirSync(OUTPUT,{recursive:true});
  const result=await ({layouts,interaction,motion,fallbacks}[group])(browser,base);
  fs.writeFileSync(path.join(OUTPUT,`comparison-${browser.browserType().name()}-${group}.json`),JSON.stringify(result,null,2));
  return result;
};

if(require.main===module)(async()=>{
  const {chromium}=require('playwright');
  const browser=await chromium.launch();
  try {for(const group of ['layouts','interaction','motion','fallbacks'])console.log(group,await module.exports(browser,undefined,group));}
  finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
