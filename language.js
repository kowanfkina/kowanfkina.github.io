/* Runs before paint: URL > saved choice > ordered browser languages > English. No IP request. */
(() => {
  const supported = ['en', 'zh', 'ja', 'es'];
  const normalize = value => typeof value === 'string' ? value.toLowerCase().replace('_', '-').split('-')[0] : null;
  const valid = value => supported.includes(normalize(value)) ? normalize(value) : null;
  function browserLanguage() {
    for (const language of navigator.languages || [navigator.language]) {
      const match = valid(language); if (match) return match;
    }
    return 'en';
  }
  function resolve() {
    const query = new URLSearchParams(location.search).get('lang');
    if (query === 'auto') return { language: browserLanguage(), preference: 'auto' };
    if (valid(query)) return { language: valid(query), preference: valid(query) };
    let saved;
    try { saved = localStorage.getItem('domino-support-lang'); } catch { /* Private/blocked storage. */ }
    if (valid(saved)) return { language: valid(saved), preference: valid(saved) };
    return { language: browserLanguage(), preference: 'auto' };
  }
  const initial = resolve();
  document.documentElement.lang = initial.language === 'zh' ? 'zh-CN' : initial.language;
  window.DominoLocale = Object.freeze({supported, normalize, valid, browserLanguage, resolve, initial});
})();
