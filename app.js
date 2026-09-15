/* Progressive enhancement. No framework, external runtime, or permanent animation loop. */
(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const wide = matchMedia('(min-width: 901px)');
  const state = { lang: 'en', scene: 0, modal: null, loopWanted: false, loopVisible: false };
  const scenes = [
    { en: ['Six images. One clear comparison.', 'Compare two to six images with synchronized zoom and pan. Keep every version focused on the same detail.'], zh: ['六张同屏。差别，一眼见。', '从两图到六图，同步缩放与平移。让每一个版本，都聚焦在同一处细节。'] },
    { en: ['Small changes. Clearly visible.', 'Keep both originals beside the difference map. Adjust tolerance in the app to focus on the changes that matter.'], zh: ['细微差异，清晰呈现。', '两张原图与差异图并排呈现。在应用中调整容差阈值，聚焦值得关注的变化。'] },
    { en: ['Every pixel. In clear detail.', 'Inspect pixel grids, values and regional statistics together. Turn a closer look into a more precise comparison.'], zh: ['放大到像素，细节有数。', '结合像素网格、数值和区域统计，将每一次放大，变成更精确的观察。'] }
  ];
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const localized = (en, zh) => state.lang === 'zh' ? zh : (window.DOMINO_TRANSLATIONS?.[en]?.[state.lang] || en);
  const mediaLanguage = () => state.lang === 'zh' ? 'zh' : 'en';
  const imageURL = (id, width) => `assets/product/${id}-${mediaLanguage()}-${width}.webp`;
  const tabs = $$('[data-scene]');
  const panels = $$('.screen');
  const comparison = $('.comparison');
  const hero = $('.hero-stage');
  const hdr = $('.hdr-frame');
  const loop = $('#compare-loop');
  const loopButton = $('#loop-toggle');
  const film = $('#film');
  let featureData;
  let activeFeature = null;
  let opener = null;
  let sceneOverrideY = null;
  let pendingFrame = 0;
  let geometry = null;
  const visible = new Set();
  const progressBar = $('.reading-progress');
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  function updateScene(next) {
    state.scene = next;
    $('#scene-title').textContent = localized(scenes[next].en[0], scenes[next].zh[0]);
    $('#scene-copy').textContent = localized(scenes[next].en[1], scenes[next].zh[1]);
    tabs.forEach((tab, index) => {
      tab.setAttribute('aria-selected', String(index === next));
      tab.tabIndex = index === next ? 0 : -1;
      panels[index].hidden = index !== next;
    });
  }
  function updateImages(scope = document) {
    scope.querySelectorAll('img[data-image]').forEach(img => {
      const id = img.dataset.image;
      img.srcset = [640, 1280, 1920].map(w => `${imageURL(id, w)} ${w}w`).join(', ');
      img.src = imageURL(id, 1280);
    });
  }
  function setLanguage(lang, persist = false) {
    state.lang = lang;
    root.lang = lang === 'zh' ? 'zh-CN' : lang;
    $('#language').value = preference;
    document.title = localized('Domino Image Viewer — Every detail matters.', 'Domino Image Viewer — 每一处细节，都重要。');
    $('meta[name="description"]').content = localized('Browse, compare and create with Domino Image Viewer for Mac. HDR, six-image comparison, pixel inspection and professional reviews.', 'Mac 专业图像工作空间：浏览、评级、六图对比、HDR、像素检查、评审与拼图创作。');
    $$('img[alt], [aria-label]').forEach(el => {
      const attr = el.hasAttribute('alt') ? 'alt' : 'aria-label';
      if (el.id === 'language') return;
      el.dataset.originalLabel ??= el.getAttribute(attr);
      const key = el.dataset.originalLabel;
      el.setAttribute(attr, window.DOMINO_TRANSLATIONS?.[key]?.[state.lang] || key);
    });
    updateImages();
    updateScene(state.scene);
    $$('[data-film]').forEach(a => a.href = `assets/product/film-${mediaLanguage()}.mp4`);
    loop.poster = imageURL(1, 640);
    if (loop.hasAttribute('src')) { loop.pause(); loop.removeAttribute('src'); loop.load(); syncLoop(); }
    if (activeFeature) renderFeature(activeFeature);
    $$('.close').forEach(b => b.setAttribute('aria-label', localized('Close', '关闭')));
    if (persist) {
      try { localStorage.setItem('domino-support-lang', preference); } catch { /* Storage may be unavailable in private contexts. */ }
      const url = new URL(location.href); url.searchParams.set('lang', preference); history.replaceState(null, '', url);
    }
    syncLoop();
    refreshGeometry();
  }
  let preference = window.DominoLocale.initial.preference;
  const initial = window.DominoLocale.initial.language;
  $('#language').addEventListener('change', event => {
    preference = event.target.value;
    const language = preference === 'auto' ? window.DominoLocale.browserLanguage() : preference;
    const apply = () => setLanguage(language, true);
    if (document.startViewTransition && !reduced.matches) document.startViewTransition(apply);
    else apply();
  });
  addEventListener('languagechange', () => {
    if (preference === 'auto') setLanguage(window.DominoLocale.browserLanguage());
  });
  $$('[data-hero-view]').forEach(button => button.addEventListener('click', async () => {
    const image = $('.hero-window img');
    const id = button.dataset.heroView;
    image.dataset.image = id;
    updateImages($('.hero-window'));
    image.alt = localized({1:'Multi-image comparison workspace',4:'Domino image browser, ratings and file tray',9:'High-zoom pixel grid comparison'}[id], {1:'多图对比工作空间',4:'图片浏览、评级与文件中转站',9:'高倍率像素网格对比'}[id]);
    $$('[data-hero-view]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    $('.hero-stage').dataset.view = id;
    if (!reduced.matches) image.animate([{opacity:.45},{opacity:1}],{duration:350,easing:'ease-out'});
    try { await image.decode(); } catch { /* Browser can retry the image normally. */ }
  }));

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => { sceneOverrideY = scrollY; updateScene(index); });
    tab.addEventListener('keydown', e => {
      let next;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (index + 1) % tabs.length;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (index + tabs.length - 1) % tabs.length;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { e.preventDefault(); tabs[next].focus(); tabs[next].click(); }
    });
  });

  function refreshGeometry() {
    const box = element => { const r = element.getBoundingClientRect(); return { top: r.top + scrollY, height: r.height }; };
    geometry = { hero: box(hero), hdr: box($('.hdr')), story: box(comparison), total: Math.max(1, root.scrollHeight - innerHeight) };
    schedule();
  }
  function schedule() {
    if (!pendingFrame && !document.hidden) pendingFrame = requestAnimationFrame(paint);
  }
  function paint() {
    pendingFrame = 0;
    if (!geometry) return;
    const y = scrollY;
    progressBar.style.transform = `scaleX(${clamp(y / geometry.total, 0, 1)})`;
    if (reduced.matches) return;
    if (visible.has(hero)) {
      const p = clamp((y + innerHeight * .2 - geometry.hero.top) / innerHeight, -.8, 1.2);
      hero.style.setProperty('--hero-y', `${p * -24}px`);
      hero.style.setProperty('--hero-scale', `${1 + p * .025}`);
      hero.style.setProperty('--aura-y', `${p * 45}px`);
      hero.style.setProperty('--tag-y', `${p * -55}px`);
    }
    if (visible.has(hdr)) {
      const p = clamp((y + innerHeight - geometry.hdr.top) / (geometry.hdr.height + innerHeight), 0, 1);
      hdr.style.setProperty('--hdr-y', `${(p - .5) * -45}px`);
    }
    if (wide.matches && visible.has(comparison)) {
      const p = clamp((y - geometry.story.top + 70) / Math.max(1, geometry.story.height - innerHeight), 0, .999);
      if (sceneOverrideY !== null && Math.abs(y - sceneOverrideY) > 100) sceneOverrideY = null;
      const next = Math.floor(p * 3);
      if (sceneOverrideY === null && next !== state.scene) {
        const image = panels[next].querySelector('img');
        if (image.complete && image.naturalWidth) updateScene(next);
      }
    }
  }
  function configureMotion() {
    comparison.classList.toggle('scroll-story', wide.matches && !reduced.matches && typeof IntersectionObserver === 'function');
    if (reduced.matches) {
      root.classList.remove('motion-enabled');
      $$('[data-reveal]').forEach(el => el.classList.add('revealed'));
      state.loopWanted = false; syncLoop();
    }
    refreshGeometry();
  }
  if (typeof IntersectionObserver === 'function') {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(({target, isIntersecting}) => { if (isIntersecting) visible.add(target); else visible.delete(target); });
      schedule();
    }, {rootMargin:'120px'});
    [hero, hdr, comparison].forEach(el => observer.observe(el));
    const warmScenes = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) {
        panels.forEach(panel => { const image = panel.querySelector('img'); image.loading = 'eager'; image.decode().then(schedule).catch(() => {}); });
        warmScenes.disconnect();
      }
    }, {rootMargin:'800px'});
    warmScenes.observe(comparison);
    const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('revealed'); reveal.unobserve(entry.target); }
    }), { threshold:.06 });
    $$('[data-reveal]').forEach(el => reveal.observe(el));
    if (!reduced.matches) root.classList.add('motion-enabled');
    new IntersectionObserver(entries => { state.loopVisible = entries[0].isIntersecting; syncLoop(); }, {threshold:.2}).observe(loop);
  } else state.loopVisible = true;
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', refreshGeometry, {passive:true});
  if ('ResizeObserver' in window) new ResizeObserver(refreshGeometry).observe(document.body);
  reduced.addEventListener('change', configureMotion);
  wide.addEventListener('change', configureMotion);
  document.addEventListener('visibilitychange', () => {
    syncLoop();
    if (document.hidden) { film.pause(); if (pendingFrame) cancelAnimationFrame(pendingFrame); pendingFrame = 0; }
    else schedule();
  });

  function syncLoop() {
    loopButton.setAttribute('aria-pressed', String(state.loopWanted));
    loopButton.textContent = state.loopWanted ? localized('Pause demonstration Ⅱ', '暂停操作演示 Ⅱ') : localized('Play demonstration ▶', '播放操作演示 ▶');
    if (state.loopWanted && state.loopVisible && !document.hidden && !state.modal) {
      if (!loop.hasAttribute('src')) loop.src = `assets/product/compare-${mediaLanguage()}.mp4`;
      loop.play().catch(() => { state.loopWanted = false; syncLoop(); });
    } else loop.pause();
  }
  loopButton.addEventListener('click', () => { state.loopWanted = !state.loopWanted; syncLoop(); });
  loop.addEventListener('error', () => { state.loopWanted = false; syncLoop(); loopButton.textContent = localized('Video unavailable. Try again.', '视频暂不可用，请重试。'); loop.removeAttribute('src'); loop.load(); });

  function openDialog(dialog, trigger) {
    opener = trigger;
    dialog.showModal();
    state.modal = dialog.id;
    document.body.classList.add('modal-open');
    syncLoop();
    dialog.querySelector('.close').focus();
  }
  $$('dialog').forEach(dialog => {
    dialog.querySelector('.close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });
    dialog.addEventListener('close', () => {
      film.pause(); state.modal = null; activeFeature = null; document.body.classList.remove('modal-open');
      opener?.focus(); syncLoop();
    });
  });
  const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function renderFeature(item) {
    const copy = item[{zh:'zh-Hans',en:'en-US',ja:'ja',es:'es'}[state.lang]];
    $('.dialog-content').innerHTML = `<p class="eyebrow">${escape(copy.label)}</p><h2 id="detail-title">${copy.title.map(escape).join(' ')}</h2><p>${escape(copy.description)}</p><img src="${imageURL(item.id,1280)}" alt="${escape(copy.screenLabel)}" width="1280" height="${[4,5,6].includes(item.id)?828:804}"><div class="detail-list">${copy.features.map(([title,body])=>`<div><h3>${escape(title)}</h3><p>${escape(body)}</p></div>`).join('')}</div>`;
  }
  if (typeof $('#feature-dialog').showModal === 'function') {
    root.classList.add('enhanced');
    $$('[data-detail]').forEach(link => link.addEventListener('click', async e => {
      e.preventDefault();
      if (link.getAttribute('aria-busy') === 'true') return;
      link.setAttribute('aria-busy','true');
      try {
        featureData ??= (await import('./feature-content.js')).default;
        activeFeature = featureData.find(d => d.id === Number(link.dataset.detail));
        renderFeature(activeFeature); openDialog($('#feature-dialog'), link);
      } catch {
        root.classList.remove('enhanced');
        const detail = $(link.getAttribute('href')); detail.open = true; detail.scrollIntoView({behavior:'auto'});
      } finally { link.removeAttribute('aria-busy'); }
    }));
    $$('[data-film]').forEach(link => link.addEventListener('click', e => {
      e.preventDefault(); film.src = `assets/product/film-${mediaLanguage()}.mp4`;
      openDialog($('#film-dialog'),link); film.play().catch(() => { /* Native controls remain available. */ });
    }));
  }
  setLanguage(initial);
  syncLoop();
  configureMotion();
})();
