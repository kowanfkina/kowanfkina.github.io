const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const OUTPUT = path.resolve(__dirname,'../output/playwright');

async function pageFor(browser, options = {}) {
  const page = await browser.newPage(options);
  page.setDefaultTimeout(10000);
  await page.route(/^https:\/\/(?:www\.clarity\.ms|cloud\.umami\.is|www\.googletagmanager\.com)\//,
    route => route.fulfill({contentType:'application/javascript',body:'/* Local QA only. */'}));
  await page.bringToFront();
  return page;
}

async function layouts(browser, base) {
  const results=[];
  for(const width of [320,390,768,1024,1440]) for(const lang of ['zh','en','ja','es']) {
    const page=await pageFor(browser,{viewport:{width,height:width>900?960:844},reducedMotion:'reduce'});
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto(`${base}/?lang=${lang}`);
    await page.locator('[data-banner="0"] .hero-offer').click();
    await page.waitForURL(url=>url.hash==='#plans');
    assert.equal(await page.locator('.purchase-card').count(),2);
    assert.equal(await page.locator('.purchase-faq details').count(),4);
    assert.ok((await page.locator('#purchase-conditions').innerText()).includes('Apple'));
    for(const id of ['trial-download','lifetime-download']) {
      assert.equal(await page.locator(`#${id}`).getAttribute('href'),'https://apps.apple.com/app/id6760245734');
    }
    for(const selector of ['.purchase-heading','.purchase-card','#purchase-conditions','.purchase-faq']) {
      for(const element of await page.locator(selector).all()) {
        const box=await element.boundingBox();
        assert.ok(box.x>=0&&box.x+box.width<=width+1,`${width}/${lang}: ${selector} overflow`);
      }
    }
    const first=page.locator('.purchase-faq details').first();
    await first.locator('summary').press('Enter');assert.equal(await first.getAttribute('open'),'');
    await first.locator('summary').press('Enter');assert.equal(await first.getAttribute('open'),null);
    for(const item of await page.locator('.purchase-faq details').all()) {
      await item.locator('summary').click();assert.equal(await item.getAttribute('open'),'');
      assert.ok((await item.locator('p').innerText()).length>40);
    }
    assert.equal(await page.evaluate(()=>window.dataLayer.filter(command=>command[0]==='event').length),0,'internal navigation and FAQ are not conversions');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    if([390,1440].includes(width)&&['zh','en'].includes(lang)) {
      await page.locator('.purchase-heading').scrollIntoViewIfNeeded();
      await page.screenshot({path:path.join(OUTPUT,`purchase-heading-${width}-${lang}.png`),scale:'css'});
      await page.locator('.purchase-grid').screenshot({path:path.join(OUTPUT,`purchase-cards-${width}-${lang}.png`),scale:'css'});
      await page.locator('.purchase-faq').screenshot({path:path.join(OUTPUT,`purchase-faq-${width}-${lang}.png`),scale:'css'});
    }
    assert.deepEqual(errors,[]);await page.close();results.push({width,lang,plansAndFAQ:'passed',internalConversionCount:0});
  }
  const basic=await pageFor(browser,{javaScriptEnabled:false,viewport:{width:390,height:844}});
  await basic.goto(base);await basic.locator('[data-banner="0"] .hero-offer').click();
  await basic.locator('.purchase-faq summary').first().click();
  assert.equal(await basic.locator('.purchase-faq details').first().getAttribute('open'),'');
  assert.equal(await basic.locator('#trial-download').getAttribute('href'),'https://apps.apple.com/app/id6760245734');
  await basic.close();results.push({noScriptPlansAndFAQ:'passed'});
  return results;
}

async function interaction(browser,base) {
  const page=await pageFor(browser,{viewport:{width:1440,height:960}});
  await page.goto(`${base}/?lang=zh`);
  await page.mouse.move(950,350);
  await page.waitForFunction(()=>document.querySelector('[data-banner-to="2"]').getAttribute('aria-pressed')==='true');
  await page.waitForTimeout(600);
  assert.equal(await page.locator('#overview').evaluate(e=>e.classList.contains('banner-running')),false,'intro completes before hover pauses the reading cycle');
  await page.waitForTimeout(4700);
  assert.equal(await page.locator('[data-banner-to="2"]').getAttribute('aria-pressed'),'true');
  await page.mouse.move(5,5);
  await page.waitForFunction(()=>document.querySelector('[data-banner-to="0"]').getAttribute('aria-pressed')==='true',null,{timeout:6500});
  await page.mouse.move(950,350);await page.locator('#banner-pause').click();await page.mouse.move(5,5);
  assert.equal(await page.locator('#overview').evaluate(e=>e.classList.contains('banner-running')),false,'leaving hover cannot override a manual pause');
  await page.locator('[data-banner-to="0"]').press('End');
  assert.equal(await page.locator('[data-banner-to="2"]').getAttribute('aria-pressed'),'true');
  await page.locator('[data-banner-to="2"]').press('ArrowLeft');
  assert.equal(await page.locator('[data-banner-to="1"]').getAttribute('aria-pressed'),'true');
  await page.locator('[data-banner-to="1"]').press('Home');
  assert.equal(await page.locator('[data-banner-to="0"]').getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('#banner-pause').getAttribute('aria-pressed'),'true');
  await page.locator('#banner-pause').click();await page.mouse.move(5,5);
  assert.equal(await page.locator('#overview').evaluate(e=>e.classList.contains('banner-running')),true);
  const story=await page.locator('#compare').evaluate(e=>({top:e.getBoundingClientRect().top+scrollY-70,travel:e.offsetHeight-innerHeight+70}));
  for(const [fraction,index] of [[.12,0],[.48,1],[.79,2],[.16,0],[.52,1],[.81,2]]) {
    const target=story.top+story.travel*fraction;
    await page.mouse.wheel(0,target-await page.evaluate(()=>scrollY));
    await page.waitForFunction(target=>Math.abs(scrollY-target)<2,target);
    await page.waitForFunction(index=>document.querySelector(`#tab-${index}`).getAttribute('aria-selected')==='true',index);
    assert.ok(await page.locator('.compare-caption').evaluate(e=>e.getAnimations().filter(a=>a.playState==='running').length)<=1);
  }
  assert.ok(await page.locator('.compare-caption').evaluate(e=>e.getAnimations().filter(a=>a.playState==='running').length)<=1,'rapid scroll does not stack caption animations');
  await page.close();
  return [{hoverAndManualPause:'passed',firstTourWhileHovered:'passed',keyboardCarousel:'passed',rapidCaptionChanges:'passed'}];
}

module.exports=async (browser,base='http://127.0.0.1:8765',group='all') => {
  fs.mkdirSync(OUTPUT,{recursive:true});const results=[];
  for(const [name,run] of Object.entries({layouts,interaction})) if(group==='all'||group===name) results.push(...await run(browser,base));
  fs.writeFileSync(path.join(OUTPUT,`marketing-${group}.json`),JSON.stringify(results,null,2));
  return results;
};
