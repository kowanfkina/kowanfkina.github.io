/* Reuse the homepage's language preference without initializing its product animations. */
(() => {
  'use strict';
  const locale = window.DominoLocale;
  const select = document.querySelector('#language');
  let preference = locale.initial.preference;
  function apply(language, persist = false) {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : language;
    select.value = preference;
    const key = document.querySelector('meta[name="page-title-key"]').content;
    document.title = window.DOMINO_TRANSLATIONS?.[key]?.[language] || key;
    document.querySelectorAll('[data-locale-link]').forEach(link => {
      const url = new URL(link.href);
      url.searchParams.set('lang', preference);
      link.href = url.href;
    });
    if (persist) {
      try { localStorage.setItem('domino-support-lang', preference); } catch { /* Optional storage. */ }
      const url = new URL(location.href);
      url.searchParams.set('lang', preference);
      history.replaceState(null, '', url);
    }
  }
  select.addEventListener('change', event => {
    preference = event.target.value;
    apply(preference === 'auto' ? locale.browserLanguage() : preference, true);
  });
  addEventListener('languagechange', () => {
    if (preference === 'auto') apply(locale.browserLanguage());
  });
  apply(locale.initial.language);
})();
