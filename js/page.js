/* ============================================================
   page.js: shared function-page template (Haldi, Sangeet, Mayra, Reception)
   Called by app.js:  Page.render(root, fn, index)   Page.destroy()
   Uses: window.SITE, window.App (el, img, clamp, prevId, nextId, reducedMotion)
   Optional: window.Actions.addToCalendar(fn)  (to be written in actions.js)
   Pieces: reads OPTIONAL fn.layers in content.js (fill after the pieces preview):
     layers: [ { n: 3, left: 5, top: 0, width: 40, depth: .8, anim: 'sway', delay: 0 } ]
       n     = piece number in fn.pieces (1-based), or use src: 'assets/....webp'
       left/top/width = % of the screen, depth = parallax strength (.2 far to 1.4 near)
       anim  = sway | swing | puppet | float | flicker | bob (optional)
   ============================================================ */
(function () {
  'use strict';

  var S = window.SITE;
  var state = { raf: 0, handlers: [], timers: [] };

  /* ---------- small helpers ---------- */
  function rand(a, b) { return a + Math.random() * (b - a); }
  function on(target, type, fn, opt) {
    target.addEventListener(type, fn, opt);
    state.handlers.push([target, type, fn, opt]);
  }
  function pct(v) { return (typeof v === 'number') ? v + '%' : v; }

  /* ---------- effects layer, built from fn.effects names ---------- */
  function buildEffects(fn) {
    var fx = App.el('div', { class: 'fpage__fx', 'aria-hidden': 'true' });
    var fxs = fn.effects || [];
    var small = window.innerWidth < 420;
    var i, n, d;

    if (fxs.indexOf('warm-sun-glow') > -1) fx.appendChild(App.el('div', { class: 'fx-glow' }));

    if (fxs.indexOf('falling-marigold-petals') > -1) {
      n = small ? 10 : 16;
      for (i = 0; i < n; i++) {
        d = App.el('i', { class: 'fx-petal' });
        d.style.left = rand(0, 96) + '%';
        d.style.setProperty('--s', rand(9, 17) + 'px');
        d.style.setProperty('--d', rand(8, 14) + 's');
        d.style.setProperty('--delay', (-rand(0, 14)) + 's');
        d.style.setProperty('--sway', rand(16, 40) + 'px');
        fx.appendChild(d);
      }
    }

    if (fxs.indexOf('twinkling-stars') > -1) {
      n = small ? 26 : 40;
      for (i = 0; i < n; i++) {
        d = App.el('i', { class: 'fx-star' });
        d.style.left = rand(1, 99) + '%';
        d.style.top = rand(1, 62) + '%';
        d.style.setProperty('--s', rand(2, 4.5) + 'px');
        d.style.setProperty('--d', rand(2, 5) + 's');
        d.style.setProperty('--delay', (-rand(0, 5)) + 's');
        fx.appendChild(d);
      }
    }

    if (fxs.indexOf('moving-light-beams') > -1) {
      fx.appendChild(App.el('div', { class: 'fx-beam fx-beam--a' }));
      fx.appendChild(App.el('div', { class: 'fx-beam fx-beam--b' }));
    }

    if (fxs.indexOf('flickering-lamps') > -1) {
      n = small ? 7 : 10;
      for (i = 0; i < n; i++) {
        d = App.el('i', { class: 'fx-lamp' });
        d.style.left = rand(4, 94) + '%';
        d.style.top = rand(54, 90) + '%';
        d.style.setProperty('--s', rand(20, 42) + 'px');
        d.style.setProperty('--d', rand(1.6, 3.2) + 's');
        d.style.setProperty('--delay', (-rand(0, 3)) + 's');
        fx.appendChild(d);
      }
    }
    return fx;
  }

  /* ---------- parallax pieces from fn.layers ---------- */
  function buildLayers(fn) {
    var wrap = App.el('div', { class: 'fpage__layers', 'aria-hidden': 'true' });
    (fn.layers || []).forEach(function (L) {
      var src = L.src || (L.n && fn.pieces && fn.pieces[L.n - 1]);
      if (!src) return;                                   // nothing to show, skip quietly
      var piece = App.el('div', { class: 'piece' });
      piece.style.left = pct(L.left || 0);
      piece.style.top = pct(L.top || 0);
      piece.style.width = pct(L.width || 30);
      piece.style.setProperty('--depth', L.depth != null ? L.depth : .6);
      if (L.z) piece.style.zIndex = L.z;
      var img = App.img(src, '', 'piece__img' + (L.anim ? ' anim-' + L.anim : ''), true);
      if (L.delay) img.style.animationDelay = L.delay + 's';
      if (L.origin) img.style.transformOrigin = L.origin;
      piece.appendChild(img);
      wrap.appendChild(piece);
    });
    return wrap;
  }

  /* ---------- parallax: pointer on desktop, tilt on phones ---------- */
  function startParallax(page) {
    if (App.reducedMotion()) return;
    var tx = 0, ty = 0;
    function apply() {
      state.raf = 0;
      page.style.setProperty('--px', tx.toFixed(3));
      page.style.setProperty('--py', ty.toFixed(3));
    }
    function set(x, y) {
      tx = App.clamp(x, -1, 1); ty = App.clamp(y, -1, 1);
      if (!state.raf) state.raf = requestAnimationFrame(apply);
    }
    on(page, 'pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      set((e.clientX / window.innerWidth - .5) * 2, (e.clientY / window.innerHeight - .5) * 2);
    });
    on(page, 'pointerleave', function () { set(0, 0); });
    // tilt only where no permission prompt is needed (most Android phones)
    if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission !== 'function') {
      on(window, 'deviceorientation', function (e) {
        if (e.gamma == null) return;
        set(e.gamma / 25, ((e.beta || 45) - 45) / 25);
      });
    }
  }

  /* ---------- render ---------- */
  function render(root, fn, index) {
    var z = fn.textZone || {};
    var page = App.el('section', { class: 'fpage' + (z.align === 'left' ? ' fpage--left' : '') + (z.pad ? ' fpage--pad' : '') });
    page.setAttribute('aria-label', fn.tab);

    // text zone settings from content.js
    page.style.setProperty('--zone-top', (z.topPct != null ? z.topPct : 8) + '%');
    page.style.setProperty('--zone-bottom', (z.bottomPct != null ? z.bottomPct : 35) + '%');
    page.style.setProperty('--zone-color', z.color || '#7a1236');
    page.style.setProperty('--zone-color2', z.color2 || z.color || '#7a1236');

    // 1. scene
    page.appendChild(App.img(fn.scene, '', 'fpage__scene', true));

    // 2. effects
    page.appendChild(buildEffects(fn));

    // 3. parallax pieces
    page.appendChild(buildLayers(fn));

    // 4. procession (Reception)
    if (fn.procession) {
      var proc = App.el('div', { class: 'fpage__procession', 'aria-hidden': 'true' });
      proc.appendChild(App.img(fn.procession, '', '', true));
      page.appendChild(proc);
    }

    // 5. text zone
    var text = App.el('div', { class: 'fpage__text' });
    text.appendChild(App.el('div', { class: 'fpage__label', text: fn.label }));
    text.appendChild(App.el('h1', { class: 'fpage__heading', text: fn.heading }));
    text.appendChild(App.el('p', { class: 'fpage__date', text: fn.date }));
    text.appendChild(App.el('p', { class: 'fpage__time', text: fn.time }));
    text.appendChild(App.el('p', { class: 'fpage__venue', text: S.location.address }));

    var actions = App.el('div', { class: 'fpage__actions' });
    actions.appendChild(App.el('a', {
      class: 'btn btn--gold', href: S.location.mapsUrl, target: '_blank', rel: 'noopener', text: S.ui.getDirections
    }));
    var cal = App.el('button', { class: 'btn', type: 'button', text: S.ui.addToCalendar });
    on(cal, 'click', function () {
      if (window.Actions && Actions.addToCalendar) Actions.addToCalendar(fn);
      else console.warn('Actions.addToCalendar is not available yet (actions.js)');
    });
    actions.appendChild(cal);
    text.appendChild(actions);
    page.appendChild(text);

    // 6. bottom navigation: Back to all functions, Previous, Next
    var prev = App.prevId(fn.id), next = App.nextId(fn.id);
    var nav = App.el('nav', { class: 'fpage__nav', 'aria-label': 'Functions' });
    var bPrev = App.el('a', { class: 'btn nav-prev', href: prev ? S.routes[prev] : '#/', text: '\u2039 ' + S.ui.previous });
    var bNext = App.el('a', { class: 'btn nav-next', href: next ? S.routes[next] : '#/', text: S.ui.next + ' \u203A' });
    var bBack = App.el('a', { class: 'btn btn--gold nav-back', href: S.routes.home, text: S.ui.backToAll });
    if (!prev) { bPrev.hidden = true; bPrev.setAttribute('tabindex', '-1'); bPrev.setAttribute('aria-hidden', 'true'); }
    if (!next) { bNext.hidden = true; bNext.setAttribute('tabindex', '-1'); bNext.setAttribute('aria-hidden', 'true'); }
    nav.appendChild(bPrev); nav.appendChild(bNext); nav.appendChild(bBack);
    page.appendChild(nav);

    root.appendChild(page);

    startParallax(page);

    // text entrance (two frames so the transition runs)
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { page.classList.add('is-in'); });
    });
  }

  /* ---------- cleanup when leaving the page ---------- */
  function destroy() {
    if (state.raf) cancelAnimationFrame(state.raf);
    state.handlers.forEach(function (h) { h[0].removeEventListener(h[1], h[2], h[3]); });
    state.timers.forEach(clearTimeout);
    state = { raf: 0, handlers: [], timers: [] };
  }

  window.Page = { render: render, destroy: destroy };
})();