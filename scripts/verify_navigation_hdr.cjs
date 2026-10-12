const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const OUTPUT = path.resolve(__dirname, '../output/playwright');

async function setup(browser, options = {}) {
  const page = await browser.newPage({viewport:{width:1440,height:960},reducedMotion:'reduce',...options});
  page.setDefaultTimeout(10000);
  await page.route(/^https:\/\/(?:www\.clarity\.ms|cloud\.umami\.is|www\.googletagmanager\.com)\//,
    route => route.fulfill({contentType:'application/javascript',body:'/* Local QA */'}));
  return page;
}

async function native(browser, base) {
  const page = await setup(browser);
  await page.route('**/*.avif*', route => route.fulfill({contentType:'image/avif',body:'undecodable AVIF'}));
  await page.goto(`${base}/?lang=zh`);
  await page.locator('.hdr-app-composite').scrollIntoViewIfNeeded();
  // WebKit can replace an in-flight responsive source after scrolling into view.
  await page.waitForFunction(()=>{const img=document.querySelector('.hdr-app-composite > img');return img.complete&&img.naturalWidth>0;});
  await page.waitForFunction(() => [...document.querySelectorAll('.native-photo img')].every(img => img.complete));
  const hidden = await page.locator('.native-photo img').evaluateAll(imgs => imgs.every(img => getComputedStyle(img).visibility === 'hidden'));
  assert.equal(hidden, true, 'AVIF failure must hide the broken image and expose the aligned screenshot');
  await page.locator('#hdr .native-retry').waitFor({state:'visible'});
  await page.screenshot({path:path.join(OUTPUT,'hdr-safe-fallback.png'),scale:'css'});
  await page.unroute('**/*.avif*');
  await page.locator('#hdr .native-retry').click();
  await page.waitForFunction(() => [...document.querySelectorAll('#hdr .native-photo img')].every(img => img.naturalWidth === 1000 && img.classList.contains('is-ready')));
  assert.equal(await page.locator('#hdr .native-status').isVisible(),false);
  await page.locator('[data-detail="3"]').first().click();
  await page.waitForFunction(() => [...document.querySelectorAll('#feature-dialog .native-photo img')].length === 2 && [...document.querySelectorAll('#feature-dialog .native-photo img')].every(img => img.naturalWidth === 1000 && img.classList.contains('is-ready')));
  await page.keyboard.press('Escape');
  await page.close();
  return {failureHidden:true,retryDecoded:true,detailDecoded:true};
}

async function navigation(browser,base) {
  const results=[];
  for(const width of [320,390,768,1024,1440,1920]) for(const lang of ['zh','en','ja','es']) {
    const page=await setup(browser,{viewport:{width,height:width>900?960:844}});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`${base}/?lang=${lang}`);
    assert.equal(await page.locator('.page-link').count(),9);
    assert.equal(await page.locator('.page-link[aria-current="location"]').getAttribute('href'),'#overview');
    assert.equal(await page.locator('.rail-download').getAttribute('href'),'https://apps.apple.com/app/id6760245734');
    const rail=await page.locator('.page-rail').boundingBox();
    assert.ok(rail.x>=0 && rail.x+rail.width<=width && rail.y>=0 && rail.y+rail.height<=(width>900?960:844));
    if(width<=900)await page.locator('#rail-toggle').click();
    await page.locator('.page-link[href="#hdr"]').click();
    await page.waitForFunction(()=>document.querySelector('.page-link[href="#hdr"]').getAttribute('aria-current')==='location');
    if(width<=900)assert.equal(await page.locator('#rail-toggle').getAttribute('aria-expanded'),'false');
    if([390,1440].includes(width)&&['zh','en'].includes(lang))await page.screenshot({path:path.join(OUTPUT,`rail-hdr-${width}-${lang}.png`),scale:'css'});
    await page.locator('#plans').scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>document.querySelector('.page-link[href="#plans"]').getAttribute('aria-current')==='location');
    if(width<=900)await page.locator('#rail-toggle').click();
    await page.locator('.page-link[href="#contact"]').press('Enter');
    await page.waitForFunction(()=>document.querySelector('.page-link[href="#contact"]').getAttribute('aria-current')==='location');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    assert.deepEqual(errors,[]);
    await page.close();results.push({width,lang,activeNavigation:true,viewportFit:true});
  }
  return results;
}

async function timing(browser,base) {
  const page=await setup(browser,{reducedMotion:'no-preference'});
  await page.goto(`${base}/?lang=zh`);await page.mouse.move(5,5);
  const samples=[];
  for(const index of [1,2,0]) {
    await page.waitForFunction(index=>document.querySelector(`[data-banner-to="${index}"]`).getAttribute('aria-pressed')==='true',index,{timeout:8500});
    samples.push(await page.evaluate(()=>performance.now()));
  }
  assert.ok(samples[0]>=6300 && samples[0]<8500,JSON.stringify(samples));
  for(let i=1;i<samples.length;i++)assert.ok(samples[i]-samples[i-1]>=6300&&samples[i]-samples[i-1]<8500);
  await page.locator('#banner-pause').click();await page.mouse.move(5,5);await page.waitForTimeout(6800);
  assert.equal(await page.locator('[data-banner-to="0"]').getAttribute('aria-pressed'),'true');
  await page.close();return {samples,pause:true};
}

module.exports=async(browser,base='http://127.0.0.1:8765',group='native')=>{
  fs.mkdirSync(OUTPUT,{recursive:true});
  const result=await ({native,navigation,timing}[group])(browser,base);
  fs.writeFileSync(path.join(OUTPUT,`navigation-hdr-${group}.json`),JSON.stringify(result,null,2));
  return result;
};
