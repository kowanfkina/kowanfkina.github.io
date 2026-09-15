# Domino Image Viewer website

Static, four-language product website for https://kowanfkina.github.io/.

## Local preview

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open `http://127.0.0.1:8765/?lang=zh` or `?lang=en`. Serve through HTTP for the on-demand ES module; direct `file://` viewing keeps feature-detail fallbacks but cannot load the module in some browsers.

## Structure

- `index.html`: semantic four-language content, contact and privacy links, no-JavaScript details.
- `styles.css`: responsive layout, progressive visual treatments, reduced-motion overrides.
- `app.js`: locale, tab/story selection, visibility, playback and dialog state. RequestAnimationFrame runs only on scroll/geometry events, not continuously while idle.
- `feature-content.js`: feature copy loaded only when a detail is opened.
- `assets/product/`: 640/1280/1920 WebP screenshots, app icon, two 720p original-music films and two 5-second muted 540p loops. No remote asset/CDN dependencies.
- Existing `assets/en`, `assets/zh`, and `assets/common` remain intact to avoid breaking old external asset links.
- `scripts/content.json`: editable four-language feature data.
- `scripts/build_page.py`: rebuild static page and feature module. Python standard library only.
- `scripts/prepare_media.py`: one-time source-media export, requires the original local marketing files, Pillow and FFmpeg. Deployment does not need this script.
- `scripts/verify_site.cjs`: browser regression and local frame-timing checks. Requires Playwright with Chromium.

## Verify

With the preview server running and Playwright installed:

```sh
node --check app.js
node scripts/verify_site.cjs
```

In the original Codex environment, the bundled dependency can be used:

```sh
NODE_PATH=/Users/domino/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules node scripts/verify_site.cjs
```

Checks cover desktop/tablet/mobile widths, bilingual persistence, no horizontal overflow, absent video requests before user intent, keyboard tabs, detail modal Escape/focus restoration, video and loop playback, all image decoding, three scroll phases, reduced-motion preference changes, blocked storage, missing IntersectionObserver, and no-JavaScript support/content.

## Motion and performance

Only transform/opacity animate. There is no scroll interception, artificial scroll speed, third-party animation framework, WebGL canvas, or permanent requestAnimationFrame loop. Geometry is cached on resize/layout changes and visible elements are tracked with IntersectionObserver. Hidden tabs and offscreen videos pause; the explicit play preference controls resuming a loop. Reduced motion disables reveal/parallax/sticky storytelling and stops loops when the preference changes; explicit playback is still available. Narrow devices use ordinary flow with manual comparison tabs.

Screenshots use native responsive image selection and lazy loading. Comparison images warm up as their section approaches. Films load only after a click. Font rendering uses the platform system font. Fixed image dimensions reserve space. The website does not install a service worker, avoiding stale-marketing-content cache behavior on GitHub Pages.

Native modal dialogs provide keyboard containment, Escape closing and focus restoration. Unsupported dialogs fall back to anchor links and details; failed dynamic imports reveal the static detail copy. Without JS, primary product content, App Store link, privacy and support remain usable.

Local Chromium timing in the verified environment: median 16.7 ms, p95 17.7 ms, zero frames above 33.4 ms in a short automated scroll sample. This is not a universal 60fps guarantee; production network, device refresh rate, browser and low-power mode vary. No Safari/iOS hardware claim is made.

## Deploy

This is the existing GitHub Pages repository, not a Sites-hosted project. Publish these static files through this repository's existing Pages source branch. No build service, environment variable, secret, or API backend is required.

The prepared branch is `codex/product-story-2026`. Current local Git credentials identify `Domino2015`; `git push --dry-run origin HEAD:main` was denied with HTTP 403 by the `kowanfkina/kowanfkina.github.io` repository. Nothing has been pushed or deployed. Use a GitHub identity with write permission to this repository before publishing.

## Media provenance

All product images derive from the user's approved September 2026 screenshots. Films derive from the two user-supplied demos with the original synthetic “Clear Motion” cue produced earlier in the same task. No Apple photos, icons, videos, music or website code are reused. Visual direction follows the requested restrained product-story style and retains the previous site's blue/white identity. HDR imagery on the page is an SDR capture and is labeled accordingly.

## September 16: hero and localization update

The opening is now an interactive dark product stage: a six-image comparison, layered browsing window, three selectable previews (comparison / browser / pixel grid), concise benefits, and a clear App Store action. Images stay real and are never AI-generated approximations of the interface.

Languages: English, Simplified Chinese, Japanese, Spanish. The latter two include all feature-card and detail-modal copy. Their genuine screenshots and films use the English interface, labeled as such. No Japanese/Spanish interface footage was invented.

Automatic selection uses URL `lang` > saved manual preference > the ordered `navigator.languages` list > English. Regional variants map to supported base languages (`ja-JP`, `es-MX`, `zh-TW`, etc.; Chinese currently displays Simplified Chinese). `?lang=auto` or selecting Auto restores browser-language matching and the page responds to browser language changes. No third-party IP geolocation, location prompt, or IP transmission is needed. `language.js` selects the text locale before paint. If JS is disabled, readable English content is the fallback.

`locale-data.js` provides the runtime dictionary; `scripts/translations.json` provides static page translations. `scripts/add_locales.py` records the full authored Japanese/Spanish copy. Run `python3 scripts/build_page.py` after edits. `scripts/verify_v2.cjs` checks detection priority, regional language tags, ordered browser preferences, blocked storage, 16 viewport/language combinations, hero choices and localized feature details.
