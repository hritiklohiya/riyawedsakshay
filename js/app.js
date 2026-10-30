/* ============================================================
   app.js: hash router, page transition, shared helpers.
   Expected functions in the other files (keep these names):
     Gate.init({ root, onOpen })    gate.js   (call onOpen() when doors open)
     Home.render(root)              home.js
     Page.render(root, fn, index)   page.js   (fn = a SITE.functions item)
     Optional cleanup: Gate.destroy(), Home.destroy(), Page.destroy()
   Routes: #/  #/haldi  #/sangeet  #/mayra  #/reception
   ============================================================ */
(function () {
  'use strict';

  var S = window.SITE;
  var gateDone = false;      // gate shows once per page load
  var current = null;        // route id now on screen ('home' or function id)
  var homeScroll = 0;        // remember home scroll position
  var busy = false;          // a wipe is running
  var pendingHash = null;    // a route asked for during a wipe

  var root = {};             // filled in init()

  /* ---------- shared helpers (window.App) ---------- */
  var App = {
    // build an element: App.el('div', {class:'x', text:'hi'}, [children])
    el: function (tag, attrs, kids) {
      var n = document.createElement(tag);
      attrs = attrs || {};
      Object.keys(attrs).forEach(function (k) {
        if (k === 'class') n.className = attrs[k];
        else if (k === 'text') n.textContent = attrs[k];
        else if (k === 'html') n.innerHTML = attrs[k];
        else if (k === 'style') n.style.cssText = attrs[k];
        else n.setAttribute(k, attrs[k]);
      });
      (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
      return n;
    },
    // image that never shows a broken icon: hides itself if the file is missing
    img: function (src, alt, cls, eager) {
      var i = new Image();
      i.alt = alt || '';
      if (cls) i.className = cls;
      i.decoding = 'async';
      if (!eager) i.loading = 'lazy';
      i.onerror = function () { i.style.visibility = 'hidden'; console.warn('Missing image:', src); };
      i.src = src;
      return i;
    },
    clamp: function (v, a, b) { return Math.min(b, Math.max(a, v)); },
    pad: function (n) { return (n < 10 ? '0' : '') + n; },
    time: function (iso) { return new Date(iso).getTime(); },
    reducedMotion: function () {
      return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },
    // find a function (haldi...) by id, its index, and its neighbours
    fnById: function (id) {
      for (var i = 0; i < S.functions.length; i++) if (S.functions[i].id === id) return S.functions[i];
      return null;
    },
    fnIndex: function (id) {
      for (var i = 0; i < S.functions.length; i++) if (S.functions[i].id === id) return i;
      return -1;
    },
    prevId: function (id) { var i = App.fnIndex(id); return i > 0 ? S.functions[i - 1].id : null; },
    nextId: function (id) { var i = App.fnIndex(id); return (i > -1 && i < S.functions.length - 1) ? S.functions[i + 1].id : null; },
    // go to a route: App.go('home') or App.go('sangeet')
    go: function (id) {
      var h = (id === 'home' || !id) ? S.routes.home : (S.routes[id] || S.routes.home);
      if (location.hash === h) render(); else location.hash = h;
    },
    // fade-up elements with class .reveal when they scroll into view
    observeReveals: function (scope) {
      var items = (scope || document).querySelectorAll('.reveal:not(.is-visible)');
      if (!('IntersectionObserver' in window)) {
        for (var i = 0; i < items.length; i++) items[i].classList.add('is-visible');
        return;
      }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
        });
      }, { threshold: 0.15 });
      for (var j = 0; j < items.length; j++) io.observe(items[j]);
    }
  };
  window.App = App;

  /* ---------- route parsing ---------- */
  function routeFromHash() {
    var h = (location.hash || '').replace(/^#\/?/, '').replace(/\/$/, '');
    if (!h) return 'home';
    return App.fnById(h) ? h : 'home';
  }

  /* ---------- arch wipe transition ---------- */
  // a maroon arch-topped panel rises from the bottom, we swap the page, it sinks away
  function makeWipe() {
    var w = App.el('div', { 'aria-hidden': 'true' });
    w.style.cssText =
      'position:fixed;left:50%;bottom:0;top:0;width:min(100%,' + S.layout.maxWidthPx + 'px);' +
      'margin-left:calc(min(100%,' + S.layout.maxWidthPx + 'px) / -2);z-index:90;pointer-events:none;' +
      'background:radial-gradient(circle at 50% 40%,#9a1a45,#5a0f23 70%);' +
      'border-top:4px solid #c8962a;border-radius:50% 50% 0 0 / 22% 22% 0 0;transform:translateY(105%);';
    return w;
  }

  function transition(swap) {
    var canAnimate = !App.reducedMotion() && document.body.animate;
    var wipe = root.wipe;
    if (!canAnimate || !wipe) { swap(); fadeIn(); return; }
    busy = true;
    var up = wipe.animate(
      [{ transform: 'translateY(105%)' }, { transform: 'translateY(0)' }],
      { duration: 480, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' });
    up.onfinish = function () {
      swap();
      var down = wipe.animate(
        [{ transform: 'translateY(0)' }, { transform: 'translateY(-105%)' }],
        { duration: 520, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' });
      down.onfinish = function () {
        wipe.getAnimations().forEach(function (a) { a.cancel(); });
        busy = false;
        if (pendingHash !== null) { pendingHash = null; render(); }
      };
    };
  }

  function fadeIn() {
    var shown = !root.home.hidden ? root.home : root.page;
    shown.classList.remove('fade-in');
    void shown.offsetWidth;                 // restart the animation
    shown.classList.add('fade-in');
  }

  /* ---------- show a screen ---------- */
  function cleanup(name, node) {
    try { if (window[name] && window[name].destroy) window[name].destroy(); } catch (e) { console.warn(e); }
    node.innerHTML = '';
  }

  function showRoute(id) {
    if (current === 'home') homeScroll = window.scrollY || 0;   // remember place on home

    if (id === 'home') {
      cleanup('Page', root.page); root.page.hidden = true;
      cleanup('Home', root.home); root.home.hidden = false;
      try { Home.render(root.home); } catch (e) { fail(root.home, e); }
      document.title = S.site.title;
      window.scrollTo(0, current && current !== 'home' ? homeScroll : 0);
    } else {
      var fn = App.fnById(id);
      cleanup('Home', root.home); root.home.hidden = true;
      cleanup('Page', root.page); root.page.hidden = false;
      try { Page.render(root.page, fn, App.fnIndex(id)); } catch (e) { fail(root.page, e); }
      document.title = fn.tab + ' | ' + S.site.couple;
      window.scrollTo(0, 0);
    }
    current = id;
    App.observeReveals(id === 'home' ? root.home : root.page);
  }

  // simple readable message if a module is missing or throws
  function fail(node, e) {
    console.error(e);
    node.innerHTML = '';
    node.appendChild(App.el('p', { style: 'padding:2rem;text-align:center', text: 'Something went wrong loading this page. Please refresh.' }));
  }

  /* ---------- router ---------- */
  function render() {
    if (!gateDone) return;                       // gate first
    if (busy) { pendingHash = location.hash; return; }
    var id = routeFromHash();
    if (id === current) return;
    if (current === null) { showRoute(id); fadeIn(); }   // first screen: soft fade only
    else transition(function () { showRoute(id); });
  }

  /* ---------- gate ---------- */
  function openGate() {
    gateDone = true;
    try { if (window.Gate && Gate.destroy) Gate.destroy(); } catch (e) {}
    root.gate.hidden = true;
    root.gate.innerHTML = '';
    render();
  }

  /* ---------- start ---------- */
  function init() {
    root.gate = document.getElementById('gate-root');
    root.home = document.getElementById('home-root');
    root.page = document.getElementById('page-root');

    // desktop backdrop + page title
    document.documentElement.style.setProperty('--backdrop-image', 'url("' + S.layout.desktopBackdrop + '")');
    document.title = S.site.title;

    // wipe panel
    root.wipe = makeWipe();
    document.body.appendChild(root.wipe);

    window.addEventListener('hashchange', render);

    // show the gate; if it is missing or fails, go straight in
    try {
      if (!window.Gate) throw new Error('gate.js not loaded');
      Gate.init({ root: root.gate, onOpen: openGate });
    } catch (e) {
      console.warn('Gate skipped:', e);
      openGate();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();