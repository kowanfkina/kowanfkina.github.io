const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname,'..');
const STORE = 'https://apps.apple.com/app/id6760245734';
const CONVERSION = 'AW-18453204567/iCX7CKPd7fgcENeclt9E';

module.exports = async function verifyAnalytics(browser,base='http://127.0.0.1:8765',group='all') {
  const results=[];
  async function setup(mode='callback',holdUmami=false) {
    const context=await browser.newContext({viewport:{width:1440,height:960},reducedMotion:'reduce'});
    context.setDefaultTimeout(6000);const page=await context.newPage();
    await page.bringToFront();
    const events=[],requests=[],errors=[];
    let releaseUmami;
    page.on('pageerror',error=>errors.push(error.message));
    await page.exposeFunction('__recordGoogleCommand',event=>events.push(event));
    await page.addInitScript(mode=>{
      const layer=[];
      layer.push=function(...commands){
        const length=Array.prototype.push.apply(layer,commands);
        for(const command of commands){
          const [kind,name,params]=command;
          if(kind==='event'&&name==='conversion'){
            window.__recordGoogleCommand({kind,name,send_to:params.send_to,event_timeout:params.event_timeout,hasCallback:typeof params.event_callback==='function'});
            if(mode==='throw')throw new Error('Simulated tracker failure');
            if(mode==='callback'&&typeof params.event_callback==='function')setTimeout(()=>{params.event_callback();params.event_callback();},50);
          }
        }
        return length;
      };
      window.dataLayer=layer;
    },mode);
    await context.route('**/*',async route=>{
      const url=new URL(route.request().url());
      if(url.origin===new URL(base).origin)return route.continue();
      requests.push(url.href);
      if(url.hostname==='apps.apple.com')return route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><title>Test storefront</title><h1>Test storefront</h1>'});
      if(mode==='blocked')return route.abort();
      if(holdUmami&&url.hostname==='cloud.umami.is')return new Promise(resolve=>{releaseUmami=async()=>{await route.fulfill({contentType:'application/javascript',body:'window.__umamiTestLoaded=true;'});resolve();};});
      // Local substitutes only. No traffic reaches production tracking services.
      return route.fulfill({status:200,contentType:'application/javascript',body:'/* Analytics test substitute. */'});
    });
    return {context,page,events,requests,errors,release:()=>releaseUmami?.()};
  }
  function conversions(session) {return session.events.filter(event=>event.name==='conversion');}
  async function navigate(session,locator,keyboard=false){
    const started=Date.now();
    await Promise.all([session.page.waitForURL(STORE),keyboard?locator.press('Enter'):locator.click()]);
    await session.page.getByRole('heading',{name:'Test storefront'}).waitFor();
    return Date.now()-started;
  }
  if(group==='all'||group==='tags'){
    const installed=await setup();await installed.page.goto(`${base}/?lang=zh`);
    const tags=await installed.page.evaluate(()=>({
      clarity:[...document.head.querySelectorAll('script[src]')].filter(script=>script.src==='https://www.clarity.ms/tag/yw6i3c0ef7').length,
      umami:[...document.head.querySelectorAll('script[src]')].filter(script=>script.src==='https://cloud.umami.is/script.js').map(script=>({id:script.dataset.websiteId,defer:script.defer})),
      google:[...document.head.querySelectorAll('script[src]')].filter(script=>script.src==='https://www.googletagmanager.com/gtag/js?id=AW-18453204567').map(script=>script.async),
      config:window.dataLayer.filter(command=>command[0]==='config').map(command=>command[1]),
      coreReady:document.documentElement.classList.contains('js-enhanced')
    }));
    assert.deepEqual(tags,{clarity:1,umami:[{id:'5f3394fe-7688-4e38-948f-5a4bad1f9cff',defer:true}],google:[true],config:['AW-18453204567'],coreReady:true});
    assert.equal(conversions(installed).length,0);
    await installed.page.locator('.nav a[href="#compare"]').click();
    await installed.page.locator('#language').selectOption('en');
    await installed.page.locator('#tab-2').click();
    await installed.page.locator('a[data-detail="20"]').click();await installed.page.locator('#feature-dialog').waitFor({state:'visible'});await installed.page.keyboard.press('Escape');await installed.page.waitForFunction(()=>!document.body.classList.contains('modal-open'));
    assert.equal(conversions(installed).length,0,'internal actions cannot become store conversions');
    await installed.page.locator('.nav a.button').click({button:'right'});await installed.page.keyboard.press('Escape');
    assert.equal(conversions(installed).length,0,'right-click is not a store visit');
    assert.deepEqual(installed.errors,[]);await installed.context.close();results.push({tags:'all three IDs installed once in head',pageLoadAndOtherActions:'no conversions'});
  
  }
  const entries=[['header','.nav a.button',null],['browser banner','[data-banner="0"] .button',0],['six-image banner','[data-banner="1"] .button',1],['grading banner','[data-banner="2"] .button',2],['trial plan','#trial-download',null],['lifetime plan','#lifetime-download',null],['sidebar download','.rail-download',null],['viewer comparison','#compare-download',null]];
  if(group==='all'||group==='entries'){
    for(const [name,selector,banner] of entries){
      const session=await setup();await session.page.goto(`${base}/?lang=zh`);
      if(banner!==null)await session.page.locator(`[data-banner-to="${banner}"]`).click();
      const elapsed=await navigate(session,session.page.locator(selector));
      assert.deepEqual(conversions(session),[{kind:'event',name:'conversion',send_to:CONVERSION,event_timeout:1000,hasCallback:true}]);
      assert.equal(session.requests.filter(url=>url===STORE).length,1,'duplicate callbacks must not repeat navigation');
      assert.deepEqual(session.errors,[]);await session.context.close();results.push({entry:name,conversionCount:1,navigationMs:elapsed});
    }
  }
  if(group==='all'||group==='failures'){
    for(const mode of ['queue','blocked','throw','missing']){
      const session=await setup(mode);await session.page.goto(`${base}/?lang=zh`);
      if(mode==='missing')await session.page.evaluate(()=>window.gtag=undefined);
      const elapsed=await navigate(session,session.page.locator('.nav a.button'));
      assert.ok(elapsed<2500,`${mode}: navigation blocked too long`);
      if(mode==='queue'||mode==='blocked')assert.ok(elapsed>=900,'queued/blocked tracker needs the timeout fallback');
      assert.equal(conversions(session).length,mode==='missing'?0:1);
      assert.deepEqual(session.errors,[]);await session.context.close();results.push({failure:mode,navigation:'passed',navigationMs:elapsed});
    }
  }
  if(group==='all'||group==='input'){
    const keyboard=await setup();await keyboard.page.goto(`${base}/?lang=zh`);
    await navigate(keyboard,keyboard.page.locator('.nav a.button'),true);
    assert.equal(conversions(keyboard).length,1);await keyboard.context.close();results.push({keyboardEnter:'passed'});
    for(const kind of ['modified','middle','blank']){
      const session=await setup();await session.page.goto(`${base}/?lang=zh`);
      const link=session.page.locator('.nav a.button');
      if(kind==='blank')await link.evaluate(element=>element.target='_blank');
      await session.page.evaluate(()=>{
        document.addEventListener('click',event=>window.__storeClickPrevented=event.defaultPrevented);
        document.addEventListener('auxclick',event=>window.__storeClickPrevented=event.defaultPrevented);
      });
      assert.equal(await link.getAttribute('href'),STORE);
      const popupPromise=session.context.waitForEvent('page');
      const modifier=await session.page.evaluate(()=>navigator.platform.startsWith('Mac')?'Meta':'Control');
      await link.click(kind==='modified'?{modifiers:[modifier]}:kind==='middle'?{button:'middle'}:{});
      // The initial popup request can bypass routing on Chromium/macOS. Verify
      // the native browser action without waiting for Apple's live network.
      const popup=await popupPromise;
      assert.equal(popup.context(),session.context);
      assert.equal(await session.page.evaluate(()=>window.__storeClickPrevented),false);
      assert.ok(session.page.url().startsWith(base));
      assert.deepEqual(conversions(session),[{kind:'event',name:'conversion',send_to:CONVERSION,event_timeout:undefined,hasCallback:false}]);
      assert.deepEqual(session.errors,[]);await session.context.close();results.push({newTab:kind,conversionCount:1,nativeNewTab:'passed',liveStorePage:'outside local test scope'});
    }
  }
  if(group==='all'||group==='slow'){
    const slow=await setup('callback',true);
    const loading=slow.page.goto(`${base}/?lang=zh`,{waitUntil:'domcontentloaded'});
    await slow.page.waitForFunction(()=>document.documentElement.classList.contains('js-enhanced'));
    assert.ok(slow.release(),'Umami request is held while app already initialized');
    await loading;assert.equal(await slow.page.evaluate(()=>window.__umamiTestLoaded),true);
    assert.deepEqual(slow.errors,[]);await slow.context.close();results.push({slowUmami:'core interactions initialized before external tracker completed'});
  
  }
  const validationFiles=['googleec41120a270819eb.html','baidu_verify_codeva-XblQrgUwwO.html'];
  for(const name of validationFiles)assert.ok(!fs.readFileSync(path.join(ROOT,name),'utf8').includes('<script'),'validation files stay unchanged');
  const output=path.join(ROOT,'output/playwright');fs.mkdirSync(output,{recursive:true});
  fs.writeFileSync(path.join(output,`analytics-${group}.json`),JSON.stringify(results,null,2));
  return results;
};
if(require.main===module)(async()=>{const{chromium}=require('playwright');const browser=await chromium.launch();try{console.log(await module.exports(browser));}finally{await browser.close();}})().catch(error=>{console.error(error);process.exitCode=1});
