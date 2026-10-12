const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname,'..');
const OUTPUT = path.join(ROOT,'output/playwright');
const testPage = async (browser,options) => {
  const page=await browser.newPage(options);
  await page.route(/^https:\/\/(?:www\.clarity\.ms|cloud\.umami\.is|www\.googletagmanager\.com)\//,route=>route.fulfill({status:200,contentType:'application/javascript',body:'/* Local QA analytics substitute. */'}));
  await page.bringToFront();
  return page;
};
const monitor = page => {
  page.setDefaultTimeout(10000);
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('response',response=>{if(response.status()>=400)errors.push(`${response.status()} ${response.url()}`);});
  return errors;
};
const decode = locator => locator.evaluate(async element=>{
  const images=element.matches('img')?[element]:[...element.querySelectorAll('img')];
  images.forEach(image=>image.loading='eager');
  await Promise.all(images.map(image=>image.decode()));
});
const boundsFit = async (page,locator,label) => {
  const rect=await locator.boundingBox(),viewport=page.viewportSize();
  assert.ok(rect && rect.x>=-1 && rect.y>=-1 && rect.x+rect.width<=viewport.width+1 && rect.y+rect.height<=viewport.height+1,`${label}: ${JSON.stringify(rect)}`);
};
async function responsive(browser,base,output) {
  const results=[];
  for(const width of [320,390,600,768,900,1024,1440,1920])for(const lang of ['zh','en','ja','es']){
    const page=await testPage(browser,{viewport:{width,height:width>900?960:844},reducedMotion:'reduce'});
    const errors=monitor(page),requests=[];page.on('request',request=>requests.push(request.url()));
    await page.goto(`${base}/?lang=${lang}`);
    assert.equal(await page.locator('.brand').innerText(),'Domino Image Viewer');
    assert.equal(await page.locator('.brand b').isVisible(),true);
    await boundsFit(page,page.locator('.brand'),`${width}/${lang} full brand`);
    await boundsFit(page,page.locator('.hero-scroll-cue'),`${width}/${lang} scroll cue`);
    for(let index=0;index<3;index++){
      await page.locator(`[data-banner-to="${index}"]`).click();
      const slide=page.locator(`[data-banner="${index}"]`);
      await decode(slide);
      assert.equal(await slide.getAttribute('aria-hidden'),'false');
      await boundsFit(page,slide.locator('.button'),`${width}/${lang}/${index} action`);
      await boundsFit(page,slide.locator('img'),`${width}/${lang}/${index} screenshot`);
      await boundsFit(page,page.locator('.hero-controls'),`${width}/${lang}/${index} controls`);
      await boundsFit(page,slide.locator('.hero-offer'),`${width}/${lang}/${index} trial offer`);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${width}/${lang}: horizontal overflow`);
      if([390,1440].includes(width)&&['zh','en'].includes(lang))await page.screenshot({path:path.join(output,`banner-${index}-${width}-${lang}.png`),scale:'css'});
    }
    await page.locator('#regional-statistics').scrollIntoViewIfNeeded();await decode(page.locator('#regional-statistics'));
    assert.ok((await page.locator('[data-image="24"]').getAttribute('src')).includes(`-${lang==='zh'?'zh':'en'}-`));
    assert.equal(await page.locator('.roi-facts>div').count(),3);
    assert.equal(requests.some(url=>/\.mp4(?:\?|$)/.test(url)),false,'reduced motion does not request automatic video');
    await page.locator('.grading-stage').scrollIntoViewIfNeeded();await decode(page.locator('.grading-stage'));
    assert.ok((await page.locator('.grading-stage img').getAttribute('src')).includes(`25-${lang==='zh'?'zh':'en'}-`));
    if([390,1440].includes(width)&&['zh','en'].includes(lang))await page.locator('.grading-stage').screenshot({path:path.join(output,`grading-stage-${width}-${lang}.png`),scale:'css'});
    assert.equal(await page.locator('#banner-pause').isDisabled(),true,'reduced motion disables autoplay');
    for(let index=0;index<3;index++){
      await page.locator(`#panel-${index}`).scrollIntoViewIfNeeded();
      await decode(page.locator(`#panel-${index}`));
      assert.equal(await page.locator(`#panel-${index}`).getAttribute('aria-hidden'),'false');
    }
    await page.locator('.hdr-app-composite').scrollIntoViewIfNeeded();await decode(page.locator('.hdr-app-composite'));
    const alignment=await page.locator('.hdr-app-composite').evaluate(element=>{
      const base=element.querySelector('[data-image]').getBoundingClientRect();
      return [...element.querySelectorAll('.native-photo')].map((photo,index)=>{
        const rect=photo.getBoundingClientRect();
        return {x:rect.x-(base.x+base.width*index/2),y:rect.y-(base.y+base.height*600/2260),width:rect.width-base.width/2,height:rect.height-base.width/2*667/1000};
      });
    });
    for(const rect of alignment)for(const error of Object.values(rect))assert.ok(Math.abs(error)<.05,'HDR photo coordinate alignment');
    if([390,1440].includes(width)&&['zh','en'].includes(lang))await page.locator('.hdr-app-composite').screenshot({path:path.join(output,`hdr-${width}-${lang}.png`),scale:'css'});
    assert.deepEqual(errors,[]);results.push({width,lang,banners:3,firstViewport:'passed',naturalStoryOrder:'passed',hdrAlignment:'within 0.05 CSS px'});
    await page.close();
  }
  return results;
}
async function compact(browser,base,output){
  const results=[];
  for(const [width,height] of [[375,667],[390,600],[768,768],[1280,720],[1440,800]])for(const lang of ['zh','en','ja','es']){
    const page=await testPage(browser,{viewport:{width,height},reducedMotion:'reduce'}),errors=monitor(page);
    await page.goto(`${base}/?lang=${lang}`);
    await boundsFit(page,page.locator('.hero-scroll-cue'),`${width}x${height}/${lang} scroll cue`);
    for(let index=0;index<3;index++){
      await page.locator(`[data-banner-to="${index}"]`).click();
      const slide=page.locator(`[data-banner="${index}"]`);await decode(slide);
      for(const selector of ['.button','img','.hero-title','.hero-offer'])await boundsFit(page,slide.locator(selector),`${width}x${height}/${lang}/${index} ${selector}`);
      await boundsFit(page,page.locator('.hero-controls'),`${width}x${height}/${lang}/${index} controls`);
    }
    assert.deepEqual(errors,[]);results.push({width,height,lang,banners:3,compactViewport:'passed'});
    if(width===375&&lang==='en')await page.screenshot({path:path.join(output,'compact-375-en.png'),scale:'css'});
    await page.close();
  }
  return results;
}
async function interactions(browser,base,output){
  const results=[];
  for(const lang of ['zh','en','ja','es']){
    const page=await testPage(browser,{viewport:{width:1440,height:960},reducedMotion:'reduce',locale:'en-US'}),errors=monitor(page);
    await page.goto(`${base}/?lang=${lang}`);await decode(page.locator('main'));
    const ids=await page.locator('[data-detail]').evaluateAll(links=>[...new Set(links.map(link=>link.dataset.detail))]);assert.equal(ids.length,22);
    for(const id of ids){
      const trigger=page.locator(`[data-detail="${id}"]`).first();await trigger.click();await page.locator('#feature-dialog').waitFor({state:'visible'});
      assert.ok((await page.locator('#detail-title').innerText()).trim().length>3);
      await decode(page.locator('.dialog-content'));
      if(id==='3')assert.equal(await page.locator('.dialog-content .native-photo img').count(),2);
      assert.ok((await page.locator('.dialog-content .detail-screen').getAttribute('src')).includes(`-${lang==='zh'?'zh':'en'}-`));
      await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.body.classList.contains('modal-open'));
      assert.equal(await trigger.evaluate(element=>element===document.activeElement),true);
    }
    await page.locator('#tab-2').click();await page.locator('#tab-2').press('Home');assert.equal(await page.locator('#tab-0').getAttribute('aria-selected'),'true');
    await page.locator('#tab-0').press('ArrowRight');assert.equal(await page.locator('#tab-1').getAttribute('aria-selected'),'true');
    await page.locator('#language').selectOption('zh');await page.reload();assert.equal(await page.locator('html').getAttribute('lang'),'zh-CN');
    await page.locator('#language').selectOption('auto');assert.notEqual(await page.locator('html').getAttribute('lang'),'zh-CN');
    await page.locator('[data-film]').first().click();await page.waitForFunction(()=>document.querySelector('#film').currentTime>0);
    const duration=await page.locator('#film').evaluate(video=>video.duration);assert.ok(duration>=20&&duration<21);
    await page.locator('#film-dialog .close').click();await page.waitForFunction(()=>!document.body.classList.contains('modal-open') && document.querySelector('#film').paused);
    await page.locator('#loop-toggle').click();await page.waitForFunction(()=>document.querySelector('#compare-loop').currentTime>0);
    await page.locator('#loop-toggle').click();assert.equal(await page.locator('#compare-loop').evaluate(video=>video.paused),true);
    assert.deepEqual(errors,[]);results.push({lang,featureDialogs:ids.length,languageRoundTrip:'passed',filmDuration:duration,keyboardAndVideo:'passed'});await page.close();
  }
  return results;
}
async function motion(browser,base,output){
  const page=await testPage(browser,{viewport:{width:1440,height:960}}),errors=monitor(page);
  await page.goto(`${base}/?lang=zh`);
  await page.mouse.move(5,5);
  // Wait for real timers, without calling implementation methods or faking the clock.
  const firstTour=[];
  for(const index of [1,2,0]){
    await page.waitForFunction(index=>document.querySelector(`[data-banner-to="${index}"]`).getAttribute('aria-pressed')==='true',index,{timeout:8500});
    await page.waitForFunction(index=>Math.abs(document.querySelector('#hero-track').getBoundingClientRect().x+index*innerWidth)<1,index);
    const elapsed=await page.evaluate(()=>performance.now());
    if(index!==0)firstTour.push({index,visibleMs:elapsed});
    if(index===2){
      assert.ok(elapsed>=12500&&elapsed<15500,`third core feature follows two readable slide intervals: ${elapsed}ms`);
      assert.equal(await page.locator('[data-banner="2"] img').evaluate(image=>image.complete&&image.naturalWidth>0),true);
    }
    await page.screenshot({path:path.join(output,`automatic-banner-${index}.png`),scale:'css'});
  }
  await page.locator('#banner-pause').click();await page.waitForTimeout(6800);
  assert.equal(await page.locator('[data-banner-to="0"]').getAttribute('aria-pressed'),'true','paused for longer than a slide interval');
  await page.locator('#banner-pause').click();await page.mouse.move(5,5);await page.waitForFunction(()=>document.querySelector('[data-banner-to="1"]').getAttribute('aria-pressed')==='true',null,{timeout:8500});
  await decode(page.locator('#compare'));
  const box=await page.locator('#compare').evaluate(element=>({top:element.getBoundingClientRect().top+scrollY-71,travel:element.offsetHeight-innerHeight+71}));
  for(let index=0;index<3;index++){
    const target=box.top+box.travel*(index/3+.08),current=await page.evaluate(()=>scrollY);
    await page.mouse.wheel(0,target-current);
    await page.waitForFunction(index=>document.querySelector(`#tab-${index}`).getAttribute('aria-selected')==='true',index);
    await page.waitForFunction(index=>document.querySelector(`#panel-${index}`).style.opacity==='1',index);
    await page.waitForFunction(()=>!document.querySelector('.compare-caption').getAnimations().some(animation=>animation.playState==='running'));
    await boundsFit(page,page.locator(`#panel-${index} img`),`scroll phase ${index} whole screenshot`);
    await page.screenshot({path:path.join(output,`scroll-phase-${index}.png`),scale:'css'});
  }
  const fadeTarget=box.top+box.travel*(.91/3),current=await page.evaluate(()=>scrollY);
  await page.mouse.wheel(0,fadeTarget-current);
  await page.waitForFunction(()=>{const opacity=Number(document.querySelector('#panel-1').style.opacity);return opacity>.1&&opacity<.9});
  await page.screenshot({path:path.join(output,'scroll-transition.png'),scale:'css'});
  await page.locator('#tab-2').click();await page.locator('#tab-2').press('Home');await page.waitForFunction(()=>document.querySelector('#panel-0').style.opacity==='1');
  await page.locator('#loop-toggle').click();await page.waitForFunction(()=>document.querySelector('#compare-loop').currentTime>0);
  await page.locator('.hero').scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('#compare-loop').paused);
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>!document.querySelector('#compare').classList.contains('scroll-story'));
  for(let index=0;index<3;index++)assert.equal(await page.locator(`#panel-${index}`).getAttribute('aria-hidden'),'false');
  assert.deepEqual(errors,[]);await page.close();
  return [{automaticBannerOrder:[0,1,2,0],firstTour,pauseResume:'passed',wheelStory:[0,1,2],continuousCrossfade:'passed',wholeScreenshotFit:'passed',offscreenVideo:'paused',reducedMotionChange:'passed'}];
}
async function autoplay(browser,base,output){
  const results=[];
  const center=async(page,selector)=>{
    const distance=await page.locator(selector).evaluate(element=>{const rect=element.getBoundingClientRect();return rect.top+rect.height/2-innerHeight/2;});
    await page.mouse.wheel(0,distance);
  };
  for(const lang of ['zh','en','ja','es']){
    const page=await testPage(browser,{viewport:{width:1440,height:960}}),errors=monitor(page),requests=[];
    page.on('request',request=>requests.push(request.url()));await page.goto(`${base}/?lang=${lang}`);
    assert.equal(requests.some(url=>url.includes('grading-demo.mp4')),false,'no video download at the hero');
    await center(page,'#grading-preview');
    await page.waitForFunction(()=>{const v=document.querySelector('#grading-preview');return !v.paused&&v.currentTime>.15;});
    assert.deepEqual(await page.locator('#grading-preview').evaluate(v=>({muted:v.muted,inline:v.playsInline,loop:v.loop})),{muted:true,inline:true,loop:true});
    assert.equal(await page.locator('#grading-toggle').getAttribute('aria-pressed'),'true');
    if(['zh','en'].includes(lang))await page.screenshot({path:path.join(output,`grading-autoplay-${lang}.png`),scale:'css'});
    await center(page,'#overview');await page.waitForFunction(()=>document.querySelector('#grading-preview').paused);
    const offscreenTime=await page.locator('#grading-preview').evaluate(v=>v.currentTime);await page.waitForTimeout(250);
    assert.equal(await page.locator('#grading-preview').evaluate(v=>v.currentTime),offscreenTime);
    await center(page,'#grading-preview');await page.waitForFunction(()=>!document.querySelector('#grading-preview').paused);
    await page.locator('#grading-toggle').click();await page.waitForFunction(()=>document.querySelector('#grading-preview').paused);
    await center(page,'#overview');await center(page,'#grading-preview');await page.waitForTimeout(250);
    assert.equal(await page.locator('#grading-preview').evaluate(v=>v.paused),true,'manual pause persists on return');
    if(lang==='zh')await page.screenshot({path:path.join(output,'grading-manual-paused.png'),scale:'css'});
    await page.locator('#grading-toggle').click();await page.waitForFunction(()=>!document.querySelector('#grading-preview').paused);
    await page.locator('.film-controls [data-film]').click();await page.waitForFunction(()=>document.querySelector('#film').currentTime>0);
    assert.equal(await page.locator('#grading-preview').evaluate(v=>v.paused),true);
    await page.locator('#film-dialog .close').click();await page.waitForFunction(()=>!document.querySelector('#grading-preview').paused);
    assert.deepEqual(errors,[]);await page.close();results.push({lang,mutedAutoplay:'passed',viewportPauseResume:'passed',manualPausePersistence:'passed',dialogPauseResume:'passed'});
  }
  const reducedPage=await testPage(browser,{viewport:{width:390,height:844},reducedMotion:'reduce'}),reducedErrors=monitor(reducedPage);
  await reducedPage.goto(`${base}/?lang=zh`);await center(reducedPage,'#grading-preview');await reducedPage.waitForTimeout(250);
  assert.equal(await reducedPage.locator('#grading-preview').getAttribute('src'),null);
  await reducedPage.locator('#grading-toggle').click();await reducedPage.waitForFunction(()=>document.querySelector('#grading-preview').currentTime>0);
  assert.equal(await reducedPage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await reducedPage.screenshot({path:path.join(output,'grading-video-mobile.png'),scale:'css'});
  assert.deepEqual(reducedErrors,[]);await reducedPage.close();results.push({reducedMotion:'no automatic loading',explicitPlay:'passed',mobileControls:'passed'});
  const rejected=await testPage(browser,{viewport:{width:1440,height:960}}),rejectedErrors=monitor(rejected);
  await rejected.addInitScript(()=>{
    const nativePlay=HTMLMediaElement.prototype.play;let rejectOnce=true;
    HTMLMediaElement.prototype.play=function(){if(this.id==='grading-preview'&&rejectOnce){rejectOnce=false;return Promise.reject(new DOMException('Autoplay blocked','NotAllowedError'));}return nativePlay.call(this);};
  });
  await rejected.goto(`${base}/?lang=en`);await center(rejected,'#grading-preview');
  await rejected.waitForFunction(()=>document.querySelector('#grading-toggle').textContent.includes('unavailable'));
  await rejected.screenshot({path:path.join(output,'grading-autoplay-blocked.png'),scale:'css'});
  await rejected.locator('#grading-toggle').click();await rejected.waitForFunction(()=>document.querySelector('#grading-preview').currentTime>0);
  assert.deepEqual(rejectedErrors,[]);await rejected.close();results.push({blockedAutoplayManualRetry:'passed'});
  const failure=await testPage(browser,{viewport:{width:1440,height:960}}),failureErrors=monitor(failure);
  await failure.route('**/grading-demo.mp4',route=>route.abort());await failure.goto(`${base}/?lang=en`);await center(failure,'#grading-preview');
  await failure.waitForFunction(()=>document.querySelector('#grading-toggle').textContent.includes('unavailable'));
  await failure.unroute('**/grading-demo.mp4');await failure.locator('#grading-toggle').click();
  await failure.waitForFunction(()=>document.querySelector('#grading-preview').currentTime>0);
  assert.deepEqual(failureErrors,[]);await failure.close();results.push({failedVideoManualRetry:'passed'});
  return results;
}
async function legal(browser,base,output){
  const results=[],policy='/Domino-Image-Viewer-Privacy-Policy/';
  for(const width of [320,390,768,1440])for(const lang of ['zh','en','ja','es']){
    const page=await testPage(browser,{viewport:{width,height:844},reducedMotion:'reduce'}),errors=monitor(page);
    await page.goto(`${base}/?lang=${lang}`);
    await page.locator('.support [data-policy-link]').first().click();await page.waitForURL(`**${policy}?lang=${lang}`);
    assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':lang);
    assert.equal(await page.locator('.policy-content section').count(),7);
    assert.equal(await page.locator('.policy-providers>div').count(),3);
    assert.equal(await page.locator('.brand').innerText(),'Domino Image Viewer');
    await boundsFit(page,page.locator('.nav-inner'),`${width}/${lang} policy nav`);
    await boundsFit(page,page.locator('.brand'),`${width}/${lang} policy brand`);
    assert.equal(await page.locator('.brand b').isVisible(),true);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    assert.equal(await page.evaluate(()=>window.dataLayer.filter(x=>x[0]==='event').length),0);
    assert.equal(await page.locator('head script[src*="googletagmanager.com"]').count(),1);
    assert.equal(await page.locator('head script[src*="cloud.umami.is"]').count(),1);
    await page.locator('.policy-toc a[href="#website"]').click();assert.ok(await page.locator('#website').isVisible());
    if([390,1440].includes(width)&&['zh','en'].includes(lang)){
      await page.locator('.brand').scrollIntoViewIfNeeded();
      await page.screenshot({path:path.join(output,`privacy-${width}-${lang}.png`),scale:'css'});
      await page.locator('.policy-content').screenshot({path:path.join(output,`privacy-content-${width}-${lang}.png`),scale:'css'});
    }
    await page.locator('.policy-crosslink').click();await page.waitForURL(`**${policy}terms/?lang=${lang}`);
    assert.equal(await page.locator('.policy-content section').count(),4);
    assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':lang);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    assert.equal(await page.locator('.policy-content a[href*="stdeula"]').count(),4);
    if(width===1440&&lang==='zh')await page.screenshot({path:path.join(output,'terms-1440-zh.png'),scale:'css'});
    await page.locator('.policy-footer-link').first().click();await page.waitForURL(`**/?lang=${lang}`);
    assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':lang);
    assert.deepEqual(errors,[]);await page.close();results.push({width,lang,privacyAndTerms:'passed',fullName:'visible',languageRoundTrip:'passed'});
  }
  const basic=await testPage(browser,{javaScriptEnabled:false,viewport:{width:390,height:844}});await basic.goto(`${base}${policy}`);
  assert.ok(await basic.getByRole('heading',{name:'Privacy policy',exact:true}).isVisible());
  await basic.locator('.policy-crosslink').click();assert.ok(await basic.getByRole('heading',{name:'Terms of use',exact:true}).isVisible());await basic.close();
  const blocked=await testPage(browser,{viewport:{width:390,height:844}});await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked');}}));
  const blockedErrors=monitor(blocked);await blocked.goto(`${base}${policy}?lang=en`);await blocked.locator('#language').selectOption('zh');await blocked.reload();
  assert.equal(await blocked.locator('html').getAttribute('lang'),'zh-CN');await blocked.locator('.policy-crosslink').click();assert.equal(await blocked.locator('html').getAttribute('lang'),'zh-CN');
  assert.deepEqual(blockedErrors,[]);await blocked.close();results.push({policyNoScriptAndBlockedStorage:'passed'});
  return results;
}
async function fallbacks(browser,base){
  const basic=await testPage(browser,{javaScriptEnabled:false,viewport:{width:390,height:844}});basic.setDefaultTimeout(10000);await basic.goto(base);
  assert.ok(await basic.locator('h1').first().isVisible());assert.equal(await basic.locator('.native-photo img').count(),2);
  assert.equal(await basic.locator('.scene-frame').count(),3);
  await basic.locator('[data-detail="20"]').click();await basic.locator('#detail-20 summary').click();assert.ok(await basic.locator('#detail-20 p').isVisible());await basic.close();
  const blocked=await testPage(browser,);await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked')}});window.IntersectionObserver=undefined;});
  const blockedErrors=monitor(blocked);await blocked.goto(base);await blocked.locator('#language').selectOption('ja');assert.equal(await blocked.locator('html').getAttribute('lang'),'ja');assert.equal(await blocked.locator('#compare').getAttribute('class'),'comparison cinematic-story');assert.deepEqual(blockedErrors,[]);await blocked.close();
  const fallback=await testPage(browser,);fallback.setDefaultTimeout(10000);await fallback.route('**/feature-content.js*',route=>route.abort());await fallback.goto(base);await fallback.locator('[data-detail="20"]').click();await fallback.waitForFunction(()=>document.querySelector('#detail-20').open);await fallback.close();
  const videoFailure=await testPage(browser,);videoFailure.setDefaultTimeout(10000);await videoFailure.route('**/compare-en.mp4',route=>route.abort());await videoFailure.goto(`${base}/?lang=en`);await videoFailure.locator('#loop-toggle').click();await videoFailure.waitForFunction(()=>document.querySelector('#loop-toggle').textContent.includes('unavailable'));await videoFailure.unroute('**/compare-en.mp4');await videoFailure.locator('#loop-toggle').click();await videoFailure.waitForFunction(()=>document.querySelector('#compare-loop').currentTime>0);await videoFailure.close();
  for(const name of ['_DSC0828-1.avif','_DSC0828-1-sdr.avif'])assert.ok(fs.readFileSync(path.join(ROOT,'assets/product/v173',name)).equals(fs.readFileSync(path.join('/Users/domino/Desktop/tmp/看图软件的相关材料',name))));
  const manifest=JSON.parse(fs.readFileSync(path.join(ROOT,'scripts/media-v173.json')));
  const sources=Object.entries(manifest).filter(([id])=>Number(id)<=21).flatMap(([,locales])=>Object.values(locales).map(value=>value.source));assert.equal(new Set(sources).size,42);
  assert.equal(Object.keys(manifest).length,25);assert.equal(Object.keys(manifest['24']).length,2);assert.equal(Object.keys(manifest['25']).length,2);
  for(const id of ['24','25'])for(const media of Object.values(manifest[id]))assert.ok(fs.existsSync(path.join(ROOT,media.source)));
  return [{noJavaScript:'passed',blockedStorageAndNoObserver:'passed',moduleFailureFallback:'passed',videoFailureRetry:'passed',hdrOriginalBytes:'identical',screenshotCoverage:46}];
}
module.exports=async function verify(browser,base='http://127.0.0.1:8765',group='all',output=OUTPUT){
  fs.mkdirSync(output,{recursive:true});const results=[];
  for(const [name,run] of Object.entries({responsive,compact,interactions,motion,autoplay,legal,fallbacks}))if(group==='all'||group===name){
    results.push(...await run(browser,base,output));
    fs.writeFileSync(path.join(output,`v173-${name}.json`),JSON.stringify(results,null,2));
  }
  return results;
};
if(require.main===module)(async()=>{const{chromium}=require('playwright');const browser=await chromium.launch();try{console.log(await module.exports(browser));}finally{await browser.close()}})().catch(error=>{console.error(error);process.exitCode=1});
