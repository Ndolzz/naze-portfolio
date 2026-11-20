/* ============================================================
   NAZE PORTFOLIO — sound.js
   - Backsound "bye" (loop) menyala otomatis saat website dibuka.
     Browser memblokir suara otomatis tanpa interaksi, jadi bila
     diblokir, musik dimulai di interaksi pertama (klik/ketuk/tombol).
   - Suara klik saat menekan tombol / tautan.
   - Suara swoosh saat pindah section (klik menu atau scroll).
   - Tombol mute di pojok kanan bawah (pilihan disimpan).
   ============================================================ */
(function () {
  'use strict';

  var MUTE_KEY = 'naze-sound-muted';
  var BGM_VOLUME = 0.35;
  var SFX_VOLUME = 0.6;

  var muted = false;
  try { muted = localStorage.getItem(MUTE_KEY) === '1'; } catch (e) { /* abaikan */ }

  var bgm = new Audio('audio/bye.mp3');
  bgm.loop = true;
  bgm.volume = BGM_VOLUME;
  bgm.preload = 'auto';

  var clickSrc = new Audio('audio/click.mp3');
  var swooshSrc = new Audio('audio/swoosh.mp3');
  clickSrc.preload = swooshSrc.preload = 'auto';

  function playSfx(src, volume) {
    if (muted) return;
    var a = src.cloneNode();           /* klik cepat tetap terdengar semua */
    a.volume = volume;
    a.play().catch(function () {});
  }

  /* ---------- Backsound ---------- */
  var bgmStarted = false;
  var gestureEvents = ['pointerup', 'click', 'keydown', 'touchend'];

  function removeGestureListeners() {
    gestureEvents.forEach(function (ev) { window.removeEventListener(ev, onFirstGesture, true); });
  }

  function startBgm() {
    if (muted || bgmStarted) return Promise.resolve();
    return bgm.play().then(function () {
      bgmStarted = true;
      removeGestureListeners();
    });
  }

  function onFirstGesture() {
    startBgm().catch(function () { /* coba lagi di interaksi berikutnya */ });
  }

  /* 1) coba langsung nyala saat halaman dibuka */
  startBgm().catch(function () {
    /* 2) diblokir browser -> nyalakan di interaksi pertama */
    gestureEvents.forEach(function (ev) { window.addEventListener(ev, onFirstGesture, true); });
  });

  /* jeda saat tab disembunyikan, lanjut saat kembali */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { bgm.pause(); }
    else if (!muted && bgmStarted) { bgm.play().catch(function () {}); }
  });

  /* ---------- Tombol mute ---------- */
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'sound-toggle mono';

  function renderToggle() {
    btn.setAttribute('aria-pressed', muted ? 'true' : 'false');
    btn.setAttribute('aria-label', muted ? 'nyalakan suara' : 'matikan suara');
    btn.textContent = muted ? 'SUARA OFF' : 'SUARA ON';
    btn.classList.toggle('is-off', muted);
  }

  btn.addEventListener('click', function (e) {
    e.stopPropagation();               /* jangan ikut memicu suara klik umum */
    muted = !muted;
    try { localStorage.setItem(MUTE_KEY, muted ? '1' : '0'); } catch (err) { /* abaikan */ }
    if (muted) { bgm.pause(); }
    else { bgmStarted = false; bgm.play().then(function () { bgmStarted = true; }).catch(function () {}); playSfx(clickSrc, SFX_VOLUME); }
    renderToggle();
  });
  renderToggle();
  document.body.appendChild(btn);

  /* ---------- Swoosh pindah section ---------- */
  var swooshLockUntil = 0;
  function swoosh(lockMs) {
    var now = Date.now();
    if (now < swooshLockUntil) return;
    swooshLockUntil = now + (lockMs || 900);
    playSfx(swooshSrc, SFX_VOLUME);
  }

  /* ---------- Klik tombol / tautan ---------- */
  document.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('a, button, .btn, .magnetic-btn, [role="button"]') : null;
    if (!el || el === btn) return;

    playSfx(clickSrc, SFX_VOLUME);

    var href = el.getAttribute && el.getAttribute('href');
    if (href && href.charAt(0) === '#' && href.length > 1) {
      /* pindah section lewat menu: swoosh + kunci agar scroll halus tidak memicu berulang */
      setTimeout(function () { swoosh(1800); }, 90);
    }
  });

  /* ---------- Swoosh saat scroll ke section baru ---------- */
  if ('IntersectionObserver' in window) {
    var sections = document.querySelectorAll('main > section, section[id]');
    var current = null;
    var ready = false;
    setTimeout(function () { ready = true; }, 2500);   /* abaikan pemicu awal saat load */

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || entry.target === current) return;
        var first = current === null;
        current = entry.target;
        if (ready && !first) swoosh(900);
      });
    }, { threshold: 0.5 });

    sections.forEach(function (s) { io.observe(s); });
  }
})();
