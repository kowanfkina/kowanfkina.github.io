/* App Store click conversions. Tracking must never prevent the store from opening. */
(() => {
  'use strict';
  const destination = 'AW-18453204567/iCX7CKPd7fgcENeclt9E';
  const navigationTimeout = 1000;

  function trackStoreClick(event) {
    if (event.defaultPrevented) return;
    if (event.type === 'click' ? event.button !== 0 : event.button !== 1) return;
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!link || link.hasAttribute('download')) return;
    const url = new URL(link.href);
    if (url.protocol !== 'https:' || url.hostname !== 'apps.apple.com') return;
    if (typeof window.gtag !== 'function') return;

    const target = link.target || document.querySelector('base[target]')?.target || '_self';
    const sameTab = event.type === 'click' && target.toLowerCase() === '_self'
      && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
    if (!sameTab) {
      // Keep modified clicks, middle-clicks and explicit new tabs native.
      try { window.gtag('event', 'conversion', { send_to: destination }); }
      catch { /* A failed tracker cannot cancel the browser's navigation. */ }
      return;
    }

    event.preventDefault();
    let navigated = false;
    let fallback;
    const navigate = () => {
      if (navigated) return;
      navigated = true;
      clearTimeout(fallback);
      window.location.assign(url.href);
    };
    // Independent of gtag's own timeout, which cannot run if gtag.js is blocked.
    fallback = setTimeout(navigate, navigationTimeout);
    try {
      window.gtag('event', 'conversion', {
        send_to: destination,
        event_callback: navigate,
        event_timeout: navigationTimeout
      });
    } catch { navigate(); }
  }

  // Delegation also covers the carousel's dynamically cloned slide.
  document.addEventListener('click', trackStoreClick);
  document.addEventListener('auxclick', trackStoreClick);
})();
