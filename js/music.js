/* music.js: background music, one track per page, soft cross-fade.
   - Starts only after the first tap (the "Tap to enter" button), never before.
   - Entrance track plays on the gate and the home page; each function page has its own track.
   - A page with an empty track (Sangeet for now) keeps the entrance track playing.
   - Round music button (top right) turns the music off and on; the choice is kept for this visit.
   Track files and volume are set in js/updates.js (SITE.music). */
(function () {
  'use strict';
  if (window.__musicScript) return;               // already loaded once
  window.__musicScript = true;

  // the round music button brings its own style, so it shows even if updates.css is old
  var st = document.createElement('style');
  st.textContent = '.music-btn{position:fixed;top:calc(10px + env(safe-area-inset-top,0px));right:max(10px,calc((100vw - 480px)/2 + 10px));z-index:120;width:42px;height:42px;border-radius:50%;border:1.5px solid #c8962a;background:rgba(90,15,35,.84);color:#f3d58a;display:grid;place-items:center;padding:0;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.4)}' +
    '.music-btn svg{width:22px;height:22px}.music-btn.is-on::after{content:"";position:absolute;inset:-5px;border-radius:50%;border:1px solid rgba(230,193,90,.65);animation:musicPulse 2.2s ease-out infinite;pointer-events:none}' +
    '@keyframes musicPulse{from{transform:scale(.9);opacity:.9}to{transform:scale(1.45);opacity:0}}';
  document.head.appendChild(st);
  var DEBUG = /[?&]debug/.test(location.search), box = null;
  function log(msg) {
    console.info('[music] ' + msg);
    if (!DEBUG) return;
    if (!box) { box = document.createElement('div'); box.style.cssText = 'position:fixed;left:6px;bottom:6px;right:6px;z-index:999;background:#000c;color:#9f9;font:12px monospace;padding:6px;max-height:30vh;overflow:auto'; document.body.appendChild(box); }
    box.textContent += msg + '\n';
  }
  var M = (window.SITE || {}).music;
  if (!M || !M.enabled) { log('music is OFF or SITE.music is missing: check js/updates.js and that it loads before music.js'); return; }
  log('music.js loaded');

  var VOL = M.volume != null ? M.volume : 0.6, FADE = 1400;
  var a = [new Audio(), new Audio()], cur = 0, curSrc = '', started = false, muted = false, btn = null;
  a.forEach(function (x) { x.loop = true; x.preload = 'none'; x.volume = 0; });
  try { muted = sessionStorage.getItem('muted') === '1'; } catch (e) {}

  function routeKey() { var h = (location.hash || '').replace(/^#\/?/, '').replace(/\/$/, ''); return h || 'home'; }
  function trackFor(k) { return M.tracks[k] || M.tracks.home || ''; }   // empty track -> entrance track

  function ramp(el, to, ms, end) {
    var from = el.volume, t0 = Date.now();
    (function step() {
      var p = Math.min(1, (Date.now() - t0) / ms);
      try { el.volume = Math.max(0, Math.min(1, from + (to - from) * p)); } catch (e) {}
      if (p < 1) setTimeout(step, 40); else if (end) end();
    })();
  }

  function setUi(on) {
    if (!btn) return;
    btn.className = 'music-btn ' + (on ? 'is-on' : 'is-off');
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.setAttribute('aria-label', on ? 'Turn music off' : 'Turn music on');
    btn.innerHTML = on
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>';
  }

  function play(src) {
    if (!started || muted || held) return;
    if (src === curSrc && !a[cur].paused) return;
    var old = a[cur], nu = a[1 - cur];
    if (!src) { ramp(old, 0, FADE, function () { old.pause(); }); curSrc = ''; return; }
    curSrc = src; cur = 1 - cur; log('playing ' + src);
    nu.src = src; try { nu.currentTime = 0; } catch (e) {}
    nu.volume = 0;
    // if the file is not found, try the same name with a second .mp3 (Windows sometimes saves it that way)
    var tried = 0;
    nu.onerror = function () {
      if (tried === 0) { tried = 1; nu.src = src + '.mp3'; var q = nu.play(); if (q && q.catch) q.catch(function () {}); }
      else { console.warn('Music file not found: ' + src + ' (check the name in assets/14_music and in js/updates.js)'); setUi(false); }
    };
    var p = nu.play();
    if (p && p.catch) p.catch(function (e) { log('play() refused: ' + (e && e.name)); setUi(false); });          // browser said no: button shows "off"
    ramp(nu, VOL, FADE);
    ramp(old, 0, FADE, function () { old.pause(); });
    setUi(true);
  }

  function onRoute() { play(trackFor(routeKey())); }

  function start() {
    if (started) return;
    started = true; log('first tap received, route = ' + routeKey());
    btn = document.createElement('button');
    btn.type = 'button';
    btn.addEventListener('click', toggle);
    document.body.appendChild(btn);
    setUi(!muted);
    if (!muted) onRoute();
  }

  function toggle() {
    muted = !muted;
    try { sessionStorage.setItem('muted', muted ? '1' : '0'); } catch (e) {}
    if (muted) {
      ramp(a[cur], 0, 500, function () { a[0].pause(); a[1].pause(); });
      curSrc = ''; setUi(false);
    } else { curSrc = ''; onRoute(); }
  }

  // the Sweet Request video pauses the music, and gives it back afterwards
  var held = false;
  window.MusicCtl = {
    hold: function () { if (!started || muted || held) return; held = true; ramp(a[cur], 0, 400, function () { a[0].pause(); a[1].pause(); }); curSrc = ''; },
    release: function () { if (!held) return; held = false; if (started && !muted) { curSrc = ''; onRoute(); } }
  };

  // first tap anywhere (the gate button) starts the music
  document.addEventListener('click', start, { once: true, capture: true });
  window.addEventListener('hashchange', onRoute);
  document.addEventListener('click', function () { if (started && !muted) setTimeout(onRoute, 60); }, true);
  document.addEventListener('visibilitychange', function () {
    if (!started) return;
    if (document.hidden) { a[0].pause(); a[1].pause(); }
    else if (!muted && curSrc) { var p = a[cur].play(); if (p && p.catch) p.catch(function () { setUi(false); }); }
  });
})();
