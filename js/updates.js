/* updates.js: small changes on top of content.js and the pages. Loads just before app.js.
   Edit the texts here if you want to change them. */
(function () {
  'use strict';
  var S = window.SITE;
  function abs(p) { try { return new URL(p, document.baseURI).href; } catch (e) { return p; } }
  function fn(id) { return S.functions.filter(function (f) { return f.id === id; })[0]; }

  /* ----- music: one track per page (put the files in assets/14_music/, or change the names here) -----
     entrance = gate + home page.  Sangeet is empty for now, so it keeps the entrance music. */
  S.music = {
    enabled: true,
    volume: 0.6,                                   // 0 to 1
    tracks: {
      home:      'assets/14_music/entrance.mp3',
      haldi:     'assets/14_music/haldi.mp3',
      sangeet:   'assets/14_music/my-sangeet-song.mp3',                               // TODO: add the sangeet song later
      mayra:     'assets/14_music/nanihal.mp3',
      reception: 'assets/14_music/baraat.mp3'
    }
  };

  /* ----- gate: shehnai players on both sides of the Tap to enter button (save the pictures in assets/13_new/) ----- */
  S.gate.shehnai = { left: 'assets/13_new/shehnai-left.png', right: 'assets/13_new/shehnai-right.png' };

  /* ----- text ----- */
  S.invitation.groomExtra = '(Grandson of Smt. Lali Devi ji & Shri Ram Kumar ji Laddha)';
  S.closing.credit = 'Created by Hritik Lohiya';
  S.ui.backShort = 'All';

  /* ----- optional: cover picture without the hanging garlands -----
     save it as assets/02_courtyard/02_cover_clean.png and it is used automatically */
  var CLEAN = 'assets/02_courtyard/02_cover_clean.png', probe = new Image();
  probe.onload = function () {
    S.cover.background = CLEAN; S.layout.desktopBackdrop = CLEAN;
    document.documentElement.style.setProperty('--backdrop-image', 'url("' + abs(CLEAN) + '")');
  };
  probe.src = CLEAN;

  /* ----- function pages: text zones (top % and bottom % of the screen), colours, sizes -----
     glow = soft light or shadow behind the letters, veil = gentle band behind the text so it never fights the picture */
  fn('haldi').textZone = { topPct: 3, bottomPct: 25, align: 'center', color: '#7a1236', color2: '#5a0f23', glow: 'rgba(255,248,230,.95)', hSize: '1.6rem', dSize: '.98rem', veil: 'rgba(255,248,230,.7)' };
  fn('sangeet').textZone = { topPct: 30.5, bottomPct: 48, align: 'center', color: '#f2d27a', color2: '#ffffff', glow: 'rgba(4,8,34,.95)', hSize: '1.7rem', dSize: '.95rem', veil: 'rgba(6,10,40,.6)' };
  fn('mayra').textZone = { topPct: 2.5, bottomPct: 24, align: 'left', color: '#7a1236', color2: '#5a0f23', glow: 'rgba(255,238,238,.9)', hSize: '1.75rem', dSize: '.95rem', veil: 'rgba(250,215,215,.55)' };
  var rec = fn('reception');                       // evening courtyard scene, no procession
  rec.scene = S.countdown.scene;
  delete rec.procession;
  rec.effects = [];
  rec.textZone = { topPct: 3, bottomPct: 25, align: 'center', color: '#f8e7b8', color2: '#ffffff', glow: 'rgba(14,5,24,.95)', hSize: '1.7rem', dSize: '.95rem', veil: 'rgba(18,6,30,.62)' };

  /* ----- function pages: no venue, no directions, no calendar; small Back button ----- */
  var pageRender = window.Page.render;
  window.Page.render = function (root, f, i) {
    pageRender(root, f, i);
    var pg = root.querySelector('.fpage'); if (!pg) return;
    var zz = f.textZone || {};
    if (zz.glow) pg.style.setProperty('--glow', zz.glow);
    if (zz.hSize) pg.style.setProperty('--h-size', zz.hSize);
    if (zz.dSize) pg.style.setProperty('--d-size', zz.dSize);
    if (zz.veil) { var vl = document.createElement('div'); vl.className = 'fpage__veil'; vl.style.setProperty('--veil-c', zz.veil); pg.insertBefore(vl, pg.querySelector('.fpage__text')); }
    // heading comes in word by word, with a thin gold line under it
    var h = pg.querySelector('.fpage__heading');
    if (h) {
      var words = h.textContent.trim().split(/\s+/);
      h.textContent = '';
      words.forEach(function (w, n) {
        var s = document.createElement('span');
        s.className = 'w'; s.style.setProperty('--i', n); s.textContent = w;
        h.appendChild(s);
        if (n < words.length - 1) h.appendChild(document.createTextNode(' '));
      });
      var rule = document.createElement('div');
      rule.className = 'fpage__rule';
      h.insertAdjacentElement('afterend', rule);
    }
    ['.fpage__venue', '.fpage__actions'].forEach(function (q) { var n = pg.querySelector(q); if (n) n.remove(); });
    var b = pg.querySelector('.nav-back');
    if (b) { b.textContent = '\u2630 ' + S.ui.backShort; b.setAttribute('aria-label', S.ui.backToAll); }
  };

  /* ----- home: names up in the sky, no Share button, credit line ----- */
  var homeRender = window.Home.render;
  window.Home.render = function (root) {
    homeRender(root);
    var top = root.querySelector('.cover__top'), names = root.querySelector('.cover__names'), tag = root.querySelector('.cover__hashtag');
    if (top && names) top.appendChild(names);
    if (top && tag) top.appendChild(tag);
    var cl = root.querySelector('.closing');
    if (cl) {
      var a = cl.querySelector('.closing__actions'); if (a) a.remove();
      var c = document.createElement('div');
      c.className = 'closing__credit'; c.textContent = S.closing.credit;
      cl.appendChild(c);
    }
  };

  /* desktop side backdrop: the picture path must be relative to the page, not to the css folder */
  window.addEventListener('load', function () {
    document.documentElement.style.setProperty('--backdrop-image', 'url("' + abs(S.layout.desktopBackdrop) + '")');
  });

  /* load music.js even if index.html does not have its script line */
  if (!window.__musicScript) { var ms = document.createElement('script'); ms.src = 'js/music.js'; document.head.appendChild(ms); }

  /* ================= extra sections on the home page ================= */
  S.video = null;       // Sweet Request removed (no video)
  S.contacts = [];     // TODO: add people to call on the day, like { name: 'Name', phone: '+91 98765 43210' }
  S.travel = [];        // Getting to Jodhpur card removed
  function el(tag, cls, txt) { var n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; }

  // Sweet Request video window
  var vm = null;
  function videoWindow() {
    if (vm) return vm;
    vm = el('div', 'vmodal'); vm.setAttribute('role', 'dialog'); vm.setAttribute('aria-modal', 'true'); vm.setAttribute('aria-label', S.video.label);
    var box = el('div'); box.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:12px;max-width:100%';
    var close = el('button', 'btn btn--gold', 'Close'); close.type = 'button';
    vm._box = box; vm._close = close; vm.appendChild(box); vm.appendChild(close);
    close.addEventListener('click', closeVideo);
    vm.addEventListener('click', function (e) { if (e.target === vm) closeVideo(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && vm.classList.contains('is-open')) closeVideo(); });
    document.body.appendChild(vm);
    return vm;
  }
  function openVideo() {
    var w = videoWindow(); w._box.innerHTML = '';
    var v = document.createElement('video');
    v.controls = true; v.playsInline = true; v.preload = 'metadata'; v.poster = S.video.poster;
    v.onerror = function () { w._box.innerHTML = ''; w._box.appendChild(el('div', 'vmodal__msg', 'This video will be available soon.')); };
    v.src = S.video.src; w._box.appendChild(v);
    w.classList.add('is-open');
    if (window.MusicCtl) MusicCtl.hold();
    var p = v.play(); if (p && p.catch) p.catch(function () {});
    w._close.focus();
  }
  function closeVideo() {
    if (!vm) return;
    var v = vm._box.querySelector('video'); if (v) { v.pause(); v.removeAttribute('src'); v.load(); }
    vm.classList.remove('is-open'); vm._box.innerHTML = '';
    if (window.MusicCtl) MusicCtl.release();
  }

  var homeRender2 = window.Home.render;
  window.Home.render = function (root) {
    homeRender2(root);
    function rev(n) { n.classList.add('reveal'); return n; }
    // schedule card on top of the four tabs
    var tabs = root.querySelector('.tabs');
    if (tabs) {
      var card = rev(el('div', 'sched'));
      S.functions.forEach(function (f) {
        var m = /^(\w+),\s*(\d+)\s+(\w+)/.exec(f.date);
        var a = el('a', 'sched__row'); a.href = S.routes[f.id];
        a.appendChild(el('span', 'sched__name', f.tab));
        a.appendChild(el('span', 'sched__when', (m ? m[1] + ', ' + m[2] + ' ' + m[3].slice(0, 3) : f.date) + ' \u00B7 ' + f.time.replace(/^From\s+/i, '')));
        card.appendChild(a);
      });
      tabs.insertBefore(card, tabs.querySelector('.tabs__grid'));
    }
    // getting there, and contact (contact only shows when you have added numbers)
    var anchor = root.querySelector('.venue');
    if (anchor && S.travel.length) {
      var t = el('section', 'travel'); t.appendChild(rev(el('h2', 'section-title', 'Getting to Jodhpur')));
      var c1 = rev(el('div', 'info-card'));
      S.travel.forEach(function (r) { var d = el('div', 'info-row'); d.appendChild(el('b', '', r.label)); d.appendChild(document.createTextNode(r.text)); c1.appendChild(d); });
      t.appendChild(c1); anchor.after(t); anchor = t;
    }
    if (anchor && S.contacts.length) {
      var s = el('section', 'contact'); s.appendChild(rev(el('h2', 'section-title', 'Need help? Call')));
      var c2 = rev(el('div', 'info-card'));
      S.contacts.forEach(function (r) { var d = el('div', 'info-row'); d.appendChild(el('b', '', r.name)); var a2 = el('a', '', r.phone); a2.href = 'tel:' + r.phone.replace(/[^\d+]/g, ''); d.appendChild(a2); c2.appendChild(d); });
      s.appendChild(c2); anchor.after(s);
    }
    // Sweet Request button before the closing
    var closing = root.querySelector('.closing');
    if (closing && S.video) {
      var sec = el('section', 'sweet'); var b = el('button', 'sweet__btn', S.video.label); b.type = 'button';
      b.addEventListener('click', openVideo); sec.appendChild(rev(b)); closing.before(sec);
    }
  };

  /* paper picture for css (works with png or webp) */
  document.documentElement.style.setProperty('--paper', 'url("' + abs(S.assets.textures.paper) + '")');

  /* ================= after you convert the pictures to .webp (tools/convert-images.html) set this to true ================= */
  var USE_WEBP = false;
  if (USE_WEBP) {
    (function walk(o) {
      Object.keys(o).forEach(function (k) {
        var v = o[k];
        if (typeof v === 'string') {
          if (/^assets\//.test(v) && /\.(png|jpe?g)$/i.test(v) && !/14_music|15_sweet_request/.test(v)) o[k] = v.replace(/(\.(png|jpe?g))+$/i, '.webp');
        } else if (v && typeof v === 'object') walk(v);
      });
    })(S);
    document.documentElement.style.setProperty('--paper', 'url("' + abs(S.assets.textures.paper) + '")');
  }

  /* ================= safety net: if a picture is not found as .webp, try the old png/jpg names (and the other way round) ================= */
  function alternates(src) {
    if (/\.webp$/i.test(src)) { var b = src.replace(/\.webp$/i, ''); return [b + '.jpg.png', b + '.png.png', b + '.png', b + '.jpg']; }
    if (/\.(png|jpe?g)$/i.test(src)) return [src.replace(/(\.(png|jpe?g))+$/i, '.webp')];
    return [];
  }
  document.addEventListener('DOMContentLoaded', function () {
    if (!window.App || !App.img) return;
    var orig = App.img;
    App.img = function (src, alt, cls, eager) {
      var i = orig(src, alt, cls, eager), alts = alternates(src), tries = 0, prev = i.onerror;
      i.onerror = function () {
        if (tries < alts.length) { i.style.visibility = ''; i.src = alts[tries++]; }
        else if (prev) prev.call(i);
      };
      return i;
    };
  });
})();
