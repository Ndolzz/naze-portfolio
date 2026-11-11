/* ============================================================
   NAZE PORTFOLIO — boot.js
   Staged rendering orchestrator (HTML -> CSS -> JavaScript).

   Phase 1: the raw HTML document is visible immediately. The
   design stylesheets are prefetched with media="print" (they
   download but never render) and boot.css keeps the document
   readable on the paper background.

   Phase 2: after ~850 ms the design stylesheets are applied
   one by one in source order, then the document transitions
   into the NAZE design (opacity, transform, light blur).

   Phase 3: after the transition, GSAP + ScrollTrigger load and
   the site scripts run in order: config, ui, typing, stats,
   animations.

   Guarantees:
   - Single loader: boot.js is the only script tag; nothing is
     loaded twice.
   - CDN failure: if GSAP or ScrollTrigger cannot load within
     4 s, the site scripts still run; js/config.js then toggles
     html.no-gsap and css/motion.css shows all content.
   - prefers-reduced-motion: the staged animation is skipped
     entirely and the design is applied immediately.
   - Repeat visits: sessionStorage marks the boot as done so
     the intro is never waited for twice in a session.
   ============================================================ */
(function () {
  'use strict';

  var PHASE_1_MS = 850;
  var PHASE_2_MS = 900;
  var CDN_TIMEOUT_MS = 4000;
  var SHEET_TIMEOUT_MS = 3000;
  var SEEN_KEY = 'naze-boot-done';

  var GSAP_URL = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';
  var SCROLL_TRIGGER_URL = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js';
  var SITE_SCRIPTS = ['js/config.js', 'js/ui.js', 'js/typing.js', 'js/stats.js', 'js/animations.js'];
  var SHEET_IDS = ['base', 'layout', 'hero', 'sections', 'components', 'motion'];

  var doc = document;
  var root = doc.documentElement;

  var reduceMotion = false;
  try { reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { /* keep false */ }

  var seen = false;
  try { seen = sessionStorage.getItem(SEEN_KEY) === '1'; } catch (e) { /* keep false */ }

  function wait(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function getSheets() {
    return SHEET_IDS
      .map(function (id) { return doc.getElementById('css-' + id); })
      .filter(Boolean);
  }

  /* Apply one stylesheet and resolve once it is really in effect. */
  function applySheet(link) {
    return new Promise(function (resolve) {
      link.media = 'all';
      if (link.sheet) { resolve(); return; }
      var done = false;
      var finish = function () {
        if (done) return;
        done = true;
        resolve();
      };
      link.addEventListener('load', finish);
      link.addEventListener('error', finish);
      setTimeout(finish, SHEET_TIMEOUT_MS);
    });
  }

  function applyAllSheets() {
    var chain = Promise.resolve();
    getSheets().forEach(function (link) {
      chain = chain.then(function () { return applySheet(link); });
    });
    return chain;
  }

  /* Resolve on success, failure, or timeout — never rejects. */
  function loadScript(src, timeoutMs) {
    return new Promise(function (resolve) {
      var el = doc.createElement('script');
      el.src = src;
      el.async = false;
      var done = false;
      var finish = function () {
        if (done) return;
        done = true;
        resolve();
      };
      el.onload = finish;
      el.onerror = finish;
      if (timeoutMs) { setTimeout(finish, timeoutMs); }
      doc.head.appendChild(el);
    });
  }

  function loadLibraries() {
    return Promise.all([
      loadScript(GSAP_URL, CDN_TIMEOUT_MS),
      loadScript(SCROLL_TRIGGER_URL, CDN_TIMEOUT_MS)
    ]);
  }

  function runSiteScripts() {
    var chain = Promise.resolve();
    SITE_SCRIPTS.forEach(function (src) {
      chain = chain.then(function () { return loadScript(src); });
    });
    return chain;
  }

  function markSeen() {
    try { sessionStorage.setItem(SEEN_KEY, '1'); } catch (e) { /* private mode */ }
  }

  function boot() {
    /* Repeat visit or reduced motion: no staged intro. */
    if (seen || reduceMotion) {
      applyAllSheets()
        .then(function () { root.classList.remove('boot-phase1'); })
        .then(loadLibraries)
        .then(runSiteScripts)
        .then(markSeen)
        .catch(markSeen);
      return;
    }

    /* Network fetch for the libraries overlaps phase 2; their
       execution only matters once the site scripts run. */
    var libraries = loadLibraries();

    wait(PHASE_1_MS)
      .then(function () {
        root.classList.remove('boot-phase1');
        root.classList.add('boot-phase2');
        return applyAllSheets();
      })
      .then(function () {
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            root.classList.add('boot-ready');
          });
        });
        return wait(PHASE_2_MS);
      })
      .then(function () {
        root.classList.add('boot-phase3');
        return libraries.then(runSiteScripts);
      })
      .then(markSeen)
      .catch(function () {
        /* Safety net: never leave the page unstyled or dead. */
        applyAllSheets();
        root.classList.remove('boot-phase1');
        root.classList.add('boot-phase2', 'boot-ready');
        runSiteScripts();
        markSeen();
      });
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
