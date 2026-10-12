/* Progressive enhancement; native scrolling, local media, no animation framework. */
(() => {
  'use strict';
  const root = document.documentElement;
  root.classList.add('js-enhanced');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const wide = matchMedia('(min-width: 901px)');
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const state = { lang:'en', scene:0, banner:0, bannerPaused:false, bannerHovered:false, bannerVisible:true, modal:null, loopWanted:false, loopVisible:false, loopFailed:false };
  const localized = (en, zh) => state.lang === 'zh' ? zh : (window.DOMINO_TRANSLATIONS?.[en]?.[state.lang] || en);
  const mediaLanguage = () => state.lang === 'zh' ? 'zh' : 'en';
  const imageURL = (id, width) => `assets/product/v173/${id}-${mediaLanguage()}-${width}.webp`;
  const scenes = [
    ['Six images. One clear comparison.','六张同屏。差别，一眼见。','Compare two to six images with synchronized zoom and pan. Keep every version focused on the same detail.','从两图到六图，同步缩放与平移。让每一个版本，都聚焦在同一处细节。'],
    ['Small changes. Clearly visible.','细微差异，清晰呈现。','Keep both originals beside the difference map. Adjust tolerance in the app to focus on the changes that matter.','两张原图与差异图并排呈现。在应用中调整容差阈值，聚焦值得关注的变化。'],
    ['Every pixel. In clear detail.','放大到像素，细节有数。','Inspect pixel grids, values and regional statistics together. Turn a closer look into a more precise comparison.','结合像素网格、数值和区域统计，将每一次放大，变成更精确的观察。']
  ];
  const tabs = $$('[data-scene]');
  const frames = $$('[data-story-frame]');
  const comparison = $('#compare');
  const hero = $('#overview');
  const track = $('#hero-track');
  const banners = $$('[data-banner]');
  const bannerButtons = $$('[data-banner-to]');
  const pauseButton = $('#banner-pause');
  const loop = $('#compare-loop');
  const loopButton = $('#loop-toggle');
  const film = $('#film');
  const gradingPreview = $('#grading-preview');
  const gradingButton = $('#grading-toggle');
  const previewState = { visible:false, preference:'auto', failed:false, pending:false, revision:0 };
  const progressBar = $('.reading-progress');
  const bannerDuration = 4500;
  const introDuration = 900;
  let introSteps = 2;
  let preference = window.DominoLocale.initial.preference;
  let featureData, activeFeature, opener, geometry, captionAnimation;
  let bannerTimer = 0, wrapTimer = 0, pendingFrame = 0;
  let bannerRemaining = introDuration, bannerStarted = 0;
  let touchStart = null;
  const visible = new Set();
  // One inert clone lets the last slide move forward into the first without reversing.
  const firstClone = banners[0].cloneNode(true);
  firstClone.removeAttribute('data-banner');
  firstClone.classList.remove('is-active');
  firstClone.classList.add('banner-clone');
  firstClone.setAttribute('aria-hidden','true');
  firstClone.inert = true;
  track.append(firstClone);

  function updateImages(scope = document) {
    scope.querySelectorAll('img[data-image]').forEach(img => {
      const id = img.dataset.image;
      const srcset = [640,1280,1920].map(width => `${imageURL(id,width)} ${width}w`).join(', ');
      const src = imageURL(id,1280);
      if(img.getAttribute('srcset') !== srcset)img.srcset = srcset;
      if(img.getAttribute('src') !== src)img.src = src;
      const size = window.DOMINO_MEDIA?.[id]?.[mediaLanguage()];
      if (size) { img.width = size.width; img.height = size.height; img.style.aspectRatio = `${size.width} / ${size.height}`; }
    });
  }
  function updateScene(next, animate = false) {
    captionAnimation?.cancel();
    state.scene = next;
    const copy = scenes[next];
    $('#scene-title').textContent = localized(copy[0],copy[1]);
    $('#scene-copy').textContent = localized(copy[2],copy[3]);
    $('#story-step').textContent = `0${next+1} / 03`;
    tabs.forEach((tab,index) => { tab.setAttribute('aria-selected',String(index === next)); tab.tabIndex = index === next ? 0 : -1; });
    frames.forEach((frame,index) => frame.setAttribute('aria-hidden',String(comparison.classList.contains('scroll-story') && index !== next)));
    if (animate && !reduced.matches) captionAnimation=$('.compare-caption').animate([{opacity:.6,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:350,easing:'cubic-bezier(.22,1,.36,1)'});
  }
  function stopBannerTimer() {
    if (bannerTimer) { clearTimeout(bannerTimer); bannerRemaining = Math.max(0,bannerRemaining-(Date.now()-bannerStarted)); bannerTimer = 0; }
  }
  function endBannerIntro() {
    if (!introSteps) return;
    stopBannerTimer(); introSteps = 0; bannerRemaining = bannerDuration;
    restartBannerProgress();
  }
  function restartBannerProgress() {
    hero.classList.toggle('banner-intro',introSteps > 0);
    hero.style.setProperty('--banner-duration',`${introSteps > 0 ? introDuration : bannerDuration}ms`);
    const progress = bannerButtons[state.banner].querySelector('.banner-progress');
    progress.style.display = 'none'; void progress.offsetWidth; progress.style.display = '';
  }
  function syncBanner() {
    stopBannerTimer();
    const running = !state.bannerPaused && (!state.bannerHovered || introSteps>0) && !reduced.matches && state.bannerVisible && !document.hidden && !state.modal;
    hero.classList.toggle('banner-running',running);
    pauseButton.setAttribute('aria-pressed',String(state.bannerPaused || reduced.matches));
    pauseButton.setAttribute('aria-label',state.bannerPaused || reduced.matches ? localized('Resume automatic slides','继续自动轮播') : localized('Pause automatic slides','暂停自动轮播'));
    pauseButton.textContent = state.bannerPaused || reduced.matches ? '▶' : 'Ⅱ';
    pauseButton.disabled = reduced.matches;
    if (running) { bannerStarted = Date.now(); bannerTimer = setTimeout(() => selectBanner((state.banner+1)%banners.length,true),bannerRemaining); }
  }
  function selectBanner(next, automatic = false) {
    stopBannerTimer();
    if (automatic && introSteps) introSteps--;
    else if (!automatic) introSteps = 0;
    bannerRemaining = introSteps ? introDuration : bannerDuration;
    if (wrapTimer) { clearTimeout(wrapTimer); wrapTimer = 0; track.style.transition = 'none'; track.style.transform = `translateX(-${state.banner*100}%)`; void track.offsetWidth; track.style.transition = ''; }
    const wrap = automatic && state.banner === banners.length-1 && next === 0 && !reduced.matches;
    state.banner = next;
    banners.forEach((slide,index) => { slide.classList.toggle('is-active',index === next); slide.setAttribute('aria-hidden',String(index !== next)); slide.inert = index !== next; });
    firstClone.classList.toggle('is-active',wrap);
    bannerButtons.forEach((button,index) => button.setAttribute('aria-pressed',String(index === next)));
    restartBannerProgress();
    track.style.transform = `translateX(-${(wrap ? banners.length : next)*100}%)`;
    if (wrap) wrapTimer = setTimeout(() => {
      track.style.transition = 'none'; track.style.transform = 'translateX(0)'; void track.offsetWidth;
      track.style.transition = ''; firstClone.classList.remove('is-active'); wrapTimer = 0;
    },600);
    syncBanner();
  }
  bannerButtons.forEach((button,index) => {
    button.addEventListener('click',() => selectBanner(index));
    button.addEventListener('keydown',event => {
      let next;
      if(event.key==='ArrowRight') next=(index+1)%banners.length;
      if(event.key==='ArrowLeft') next=(index+banners.length-1)%banners.length;
      if(event.key==='Home') next=0;
      if(event.key==='End') next=banners.length-1;
      if(next===undefined)return;
      event.preventDefault();state.bannerPaused=true;selectBanner(next);bannerButtons[next].focus();
    });
  });
  pauseButton.addEventListener('click',() => { endBannerIntro(); state.bannerPaused = !state.bannerPaused; syncBanner(); });
  hero.addEventListener('pointerenter',event => {if(event.pointerType==='mouse'){state.bannerHovered=true;syncBanner();}});
  hero.addEventListener('pointerleave',event => {if(event.pointerType==='mouse'){state.bannerHovered=false;syncBanner();}});
  // A keyboard user keeps the focused control; automatic advancement cannot hide it.
  hero.addEventListener('focusin',event => { if (event.target.closest('.hero-slide')) { endBannerIntro(); state.bannerPaused = true; syncBanner(); } });
  hero.addEventListener('touchstart',event => { const touch=event.touches[0]; touchStart={x:touch.clientX,y:touch.clientY}; },{passive:true});
  hero.addEventListener('touchend',event => {
    if (!touchStart) return;
    const touch=event.changedTouches[0], dx=touch.clientX-touchStart.x, dy=touch.clientY-touchStart.y;
    if (Math.abs(dx)>60 && Math.abs(dx)>Math.abs(dy)*1.5) selectBanner((state.banner+(dx<0?1:2))%3);
    touchStart=null;
  },{passive:true});

  function setLanguage(lang, persist = false) {
    state.lang=lang; root.lang=lang==='zh'?'zh-CN':lang; $('#language').value=preference;
    document.title=localized('Domino Image Viewer — Compare with clarity. Create with color.','Domino Image Viewer — 看得专业，调得出色。');
    $('meta[name="description"]').content=localized('Professional viewing and comparison for up to six images. Color grading, reviews and image tools in one Mac workspace.','最多六图专业查看与对比，调色、评审及图像工具，一站完成。');
    $$('img[alt], [aria-label]').forEach(element => {
      const attr=element.hasAttribute('alt')?'alt':'aria-label';
      if (element.id==='language' || element.id==='banner-pause') return;
      element.dataset.originalLabel ??= element.getAttribute(attr);
      const key=element.dataset.originalLabel;
      element.setAttribute(attr,window.DOMINO_TRANSLATIONS?.[key]?.[lang] || key);
    });
    updateImages(); updateScene(state.scene);
    $$('[data-policy-link]').forEach(link => {
      const url = new URL(link.href); url.searchParams.set('lang',preference); link.href = url.href;
    });
    loop.poster=imageURL(1,640);
    if (loop.hasAttribute('src')) { loop.pause(); loop.removeAttribute('src'); loop.load(); }
    if (activeFeature) renderFeature(activeFeature);
    $$('.close').forEach(button => button.setAttribute('aria-label',localized('Close','关闭')));
    if (persist) {
      try { localStorage.setItem('domino-support-lang',preference); } catch { /* Storage is optional. */ }
      const url=new URL(location.href); url.searchParams.set('lang',preference); history.replaceState(null,'',url);
    }
    syncLoop(); syncPreview(); syncBanner(); refreshGeometry();
  }
  $('#language').addEventListener('change',event => {
    preference=event.target.value;
    const language=preference==='auto'?window.DominoLocale.browserLanguage():preference;
    setLanguage(language,true);
  });
  addEventListener('languagechange',() => { if (preference==='auto') setLanguage(window.DominoLocale.browserLanguage()); });

  function refreshGeometry() {
    const rect=comparison.getBoundingClientRect();
    const navHeight=$('.nav').offsetHeight;
    geometry={top:rect.top+scrollY-navHeight,travel:Math.max(1,rect.height-innerHeight+navHeight),total:Math.max(1,root.scrollHeight-innerHeight)};
    schedule();
  }
  function schedule() { if (!pendingFrame && !document.hidden) pendingFrame=requestAnimationFrame(paint); }
  function paint() {
    pendingFrame=0;
    if (!geometry) return;
    progressBar.style.transform=`scaleX(${clamp(scrollY/geometry.total,0,1)})`;
    if (!comparison.classList.contains('scroll-story') || !visible.has(comparison)) return;
    const progress=clamp((scrollY-geometry.top)/geometry.travel,0,1);
    // Each chapter holds, then hands the whole screenshot to the following chapter.
    const stage=progress*3, index=Math.min(2,Math.floor(stage));
    const handoff=clamp((stage-index-.62)/.38,0,1);
    const position=Math.min(2,index+handoff*handoff*(3-2*handoff));
    frames.forEach((frame,i) => {
      const distance=i-position, visibility=clamp(1-Math.abs(distance),0,1);
      frame.style.opacity=String(visibility);
      frame.style.transform=`translate3d(0,${distance*100}px,0) scale(${1-Math.min(1,Math.abs(distance))*.08})`;
      frame.style.visibility=visibility>0?'visible':'hidden';
    });
    const next=Math.round(position);
    if (next!==state.scene) updateScene(next,true);
    comparison.style.setProperty('--story-progress',String(progress));
  }
  function configureMotion() {
    const pinned=wide.matches && !reduced.matches && typeof IntersectionObserver==='function';
    comparison.classList.toggle('scroll-story',pinned);
    root.classList.toggle('motion-enabled',!reduced.matches && typeof IntersectionObserver==='function');
    if (!pinned) frames.forEach(frame => { frame.style.opacity=''; frame.style.transform=''; frame.style.visibility=''; });
    if (reduced.matches) { endBannerIntro(); $$('[data-reveal]').forEach(element => element.classList.add('revealed')); state.loopWanted=false; }
    updateScene(state.scene); syncLoop(); syncPreview(); syncBanner(); refreshGeometry();
  }
  function goToScene(index) {
    updateScene(index);
    if (comparison.classList.contains('scroll-story')) {
      refreshGeometry();
      scrollTo({top:geometry.top+geometry.travel*(index/3+.08),behavior:reduced.matches?'instant':'smooth'});
    } else frames[index].scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});
  }
  tabs.forEach((tab,index) => {
    tab.addEventListener('click',() => goToScene(index));
    tab.addEventListener('keydown',event => {
      let next;
      if (event.key==='ArrowRight'||event.key==='ArrowDown') next=(index+1)%tabs.length;
      if (event.key==='ArrowLeft'||event.key==='ArrowUp') next=(index+tabs.length-1)%tabs.length;
      if (event.key==='Home') next=0;
      if (event.key==='End') next=tabs.length-1;
      if (next!==undefined) { event.preventDefault(); tabs[next].focus(); goToScene(next); }
    });
  });
  if (typeof IntersectionObserver==='function') {
    const observer=new IntersectionObserver(entries => {
      entries.forEach(({target,isIntersecting}) => { if(isIntersecting) visible.add(target); else visible.delete(target); });
      schedule();
    },{rootMargin:'120px'});
    observer.observe(comparison);
    new IntersectionObserver(entries => { state.bannerVisible=entries[0].isIntersecting; syncBanner(); },{threshold:.15}).observe(hero);
    const warm=new IntersectionObserver(entries => {
      if (entries.some(entry=>entry.isIntersecting)) {
        frames.forEach(frame => { const image=frame.querySelector('img'); image.loading='eager'; image.decode().then(schedule).catch(()=>{}); });
        warm.disconnect();
      }
    },{rootMargin:'800px'});
    warm.observe(comparison);
    const reveal=new IntersectionObserver(entries => entries.forEach(entry => { if(entry.isIntersecting){entry.target.classList.add('revealed');reveal.unobserve(entry.target);} }),{threshold:.06});
    $$('[data-reveal]').forEach(element => reveal.observe(element));
    new IntersectionObserver(entries => {state.loopVisible=entries[0].isIntersecting;syncLoop();},{threshold:.2}).observe(loop);
    new IntersectionObserver(entries => {
      previewState.visible=entries[0].isIntersecting && entries[0].intersectionRatio>=.2;
      syncPreview();
    },{threshold:[0,.2]}).observe(gradingPreview);
  } else {
    state.loopVisible=true;
    // Older browsers still gate playback by visibility, without eager video downloads.
    const updatePreviewVisibility=() => {
      const rect=gradingPreview.getBoundingClientRect();
      previewState.visible=Math.max(0,Math.min(rect.bottom,innerHeight)-Math.max(rect.top,0))>=rect.height*.2;
      syncPreview();
    };
    addEventListener('scroll',updatePreviewVisibility,{passive:true});
    addEventListener('resize',updatePreviewVisibility,{passive:true});
    updatePreviewVisibility();
  }
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',refreshGeometry,{passive:true});
  if ('ResizeObserver' in window) new ResizeObserver(refreshGeometry).observe(document.body);
  reduced.addEventListener('change',configureMotion); wide.addEventListener('change',configureMotion);
  document.addEventListener('visibilitychange',() => {
    syncLoop(); syncPreview(); syncBanner();
    if(document.hidden){film.pause();if(pendingFrame)cancelAnimationFrame(pendingFrame);pendingFrame=0;}else schedule();
  });

  function syncLoop() {
    loopButton.setAttribute('aria-pressed',String(state.loopWanted));
    loopButton.textContent=state.loopFailed?localized('Video unavailable. Try again.','视频暂不可用，请重试。'):(state.loopWanted?localized('Pause demonstration Ⅱ','暂停操作演示 Ⅱ'):localized('Play demonstration ▶','播放操作演示 ▶'));
    if(state.loopWanted && state.loopVisible && !document.hidden && !state.modal){
      if(!loop.hasAttribute('src'))loop.src=`assets/product/compare-${mediaLanguage()}.mp4`;
      loop.play().catch(error=>{
        if(error.name==='AbortError' && (!state.loopWanted || !state.loopVisible || document.hidden || state.modal))return;
        state.loopWanted=false;state.loopFailed=true;syncLoop();
      });
    }else loop.pause();
  }
  loopButton.addEventListener('click',()=>{state.loopFailed=false;state.loopWanted=!state.loopWanted;syncLoop();});
  loop.addEventListener('error',()=>{state.loopWanted=false;state.loopFailed=true;syncLoop();loop.removeAttribute('src');loop.load();});
  function previewWanted() {
    return previewState.visible && !document.hidden && !state.modal && !previewState.failed &&
      (previewState.preference==='play' || (previewState.preference==='auto' && !reduced.matches));
  }
  function updatePreviewControl() {
    const playing=!gradingPreview.paused;
    gradingButton.setAttribute('aria-pressed',String(playing));
    gradingButton.textContent=previewState.failed ? localized('Video unavailable. Try again.','视频暂不可用，请重试。') :
      (playing ? localized('Pause demonstration Ⅱ','暂停操作演示 Ⅱ') : localized('Play demonstration ▶','播放操作演示 ▶'));
  }
  function syncPreview() {
    const revision=++previewState.revision;
    if (!previewWanted()) gradingPreview.pause();
    else if (gradingPreview.paused && !previewState.pending) {
      gradingPreview.muted=true;
      if (!gradingPreview.hasAttribute('src')) gradingPreview.src='assets/product/v173/grading-demo.mp4';
      previewState.pending=true;
      gradingPreview.play().catch(error => {
        // A scroll, dialog or manual pause can cancel an in-flight play request.
        if (error.name==='AbortError') return;
        previewState.failed=true;
      }).finally(() => {
        previewState.pending=false;
        updatePreviewControl();
        if (revision!==previewState.revision && previewWanted() && gradingPreview.paused) syncPreview();
      });
    }
    updatePreviewControl();
  }
  gradingButton.hidden=false;
  gradingButton.addEventListener('click',() => {
    const pause=previewWanted();
    previewState.preference=pause?'pause':'play';
    previewState.failed=false;
    syncPreview();
  });
  gradingPreview.addEventListener('playing',updatePreviewControl);
  gradingPreview.addEventListener('pause',updatePreviewControl);
  gradingPreview.addEventListener('error',() => {
    previewState.failed=true;
    syncPreview();
    gradingPreview.removeAttribute('src');
    gradingPreview.load();
  });
  function openDialog(dialog,trigger) {
    opener=trigger;dialog.showModal();state.modal=dialog.id;document.body.classList.add('modal-open');
    syncLoop();syncPreview();syncBanner();dialog.querySelector('.close').focus();
  }
  $$('dialog').forEach(dialog => {
    dialog.querySelector('.close').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}});
    dialog.addEventListener('close',()=>{film.pause();state.modal=null;activeFeature=null;document.body.classList.remove('modal-open');opener?.focus();syncLoop();syncPreview();syncBanner();});
  });
  const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  function renderFeature(item) {
    const copy=item[{zh:'zh-Hans',en:'en-US',ja:'ja',es:'es'}[state.lang]],size=window.DOMINO_MEDIA[item.id][mediaLanguage()];
    const screenshot=`<img class="detail-screen" src="${imageURL(item.id,1920)}" alt="${escape(copy.screenLabel)}" width="${size.width}" height="${size.height}">`;
    const visual=item.id===3?`<div class="hdr-app-composite">${screenshot}<div class="native-photo sdr-native"><img src="assets/product/v173/_DSC0828-1-sdr.avif" width="1000" height="667" alt="${escape(localized('Original SDR AVIF photograph','原始 SDR AVIF 图像'))}"></div><div class="native-photo hdr-native"><img src="assets/product/v173/_DSC0828-1.avif" width="1000" height="667" alt="${escape(localized('Original HDR AVIF photograph','原始 HDR AVIF 图像'))}"></div></div>`:screenshot;
    $('.dialog-content').innerHTML=`<p class="eyebrow">${escape(localized('Image workspace','图像工作空间'))}</p><h2 id="detail-title">${copy.title.map(escape).join(' ')}</h2><p>${escape(copy.description)}</p>${visual}${state.lang==='ja'||state.lang==='es'?`<p class="interface-note">${escape(localized('English interface demonstration','英文界面演示'))}</p>`:''}`;
  }
  if(typeof $('#feature-dialog').showModal==='function'){
    root.classList.add('enhanced');
    $$('[data-detail]').forEach(link=>link.addEventListener('click',async event=>{
      event.preventDefault();if(link.getAttribute('aria-busy')==='true')return;link.setAttribute('aria-busy','true');
      try{featureData??=(await import('./feature-content.js?v='+window.DOMINO_CONTENT_VERSION)).default;activeFeature=featureData.find(item=>item.id===Number(link.dataset.detail));renderFeature(activeFeature);openDialog($('#feature-dialog'),link);}
      catch{root.classList.remove('enhanced');const detail=$(link.getAttribute('href'));detail.open=true;detail.scrollIntoView({behavior:'instant'});}
      finally{link.removeAttribute('aria-busy');}
    }));
    $$('[data-film]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();film.src='assets/product/v173/grading-demo.mp4';openDialog($('#film-dialog'),link);film.play().catch(()=>{});}));
  }
  restartBannerProgress();setLanguage(window.DominoLocale.initial.language);configureMotion();
})();
