/* ============================================================
   countdown.js: countdown scene, bride and groom move closer, united at the target.
   Use:  Countdown.render(parentEl)   Countdown.destroy()
   Reads SITE.countdown (scene, bride, groom, together, wedding, start, target)
   and SITE.home (countdownHeading, countdownLabels).
   OPTIONAL in content.js: SITE.countdown.unitedText = '...'
   TODO: wording for the united state is not in the brief, so nothing is shown until you add it.
   Preview other dates: add ?now=2026-11-19T12:00:00+05:30 to the address.
   Moves with transform and opacity only.
   ============================================================ */
(function () {
  'use strict';

  var S = window.SITE;
  var timer = 0, onResize = null, root = null, els = {};
  var injected = false;

  /* ---------- styles (added once) ---------- */
  function css() {
    if (injected) return;
    injected = true;
    var s = document.createElement('style');
    s.textContent =
      '.cd{position:relative;min-height:560px;overflow:hidden;color:#fbefd9;text-align:center;background:#5a0f23}' +
      '.cd__bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}' +
      '.cd__shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(40,6,16,.72) 0%,rgba(40,6,16,.1) 38%,rgba(40,6,16,.1) 62%,rgba(40,6,16,.7) 100%)}' +
      '.cd__top{position:relative;z-index:3;padding:3.2rem 6% 0}' +
      '.cd__title{font-family:var(--font-label,serif);font-size:.82rem;font-weight:600;letter-spacing:.3em;text-transform:uppercase;color:#e6c15a;margin:0 0 1rem}' +
      '.cd__timer{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;max-width:360px;margin:0 auto}' +
      '.cd__box{background:rgba(90,15,35,.78);border:1.5px solid #c8962a;border-radius:12px;padding:.55rem .2rem}' +
      '.cd__num{display:block;font-family:var(--font-label,serif);font-weight:600;font-size:1.7rem;line-height:1.1;color:#fff}' +
      '.cd__lab{display:block;font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:#e6c15a;margin-top:.15rem}' +
      '.cd__stage{position:relative;z-index:2;height:60vh;min-height:340px;max-height:560px}' +
      '.cd__fig{position:absolute;bottom:0;width:32%;height:auto;will-change:transform;transition:transform 1s linear,opacity 1s ease;filter:drop-shadow(0 6px 10px rgba(0,0,0,.5))}' +
      '.cd__fig--bride{left:3%}.cd__fig--groom{right:3%}' +
      '.cd__together{position:absolute;left:50%;bottom:0;width:70%;height:auto;opacity:0;transform:translateX(-50%) scale(.94);transition:opacity 1.6s ease,transform 1.6s ease;pointer-events:none;filter:drop-shadow(0 6px 12px rgba(0,0,0,.5))}' +
      '.cd.is-united .cd__together{opacity:1;transform:translateX(-50%) scale(1)}' +
      '.cd.is-united .cd__fig{opacity:0}' +
      '.cd__glow{position:absolute;left:50%;bottom:6%;width:60%;aspect-ratio:1;border-radius:50%;transform:translateX(-50%);background:radial-gradient(circle,rgba(255,214,120,.65),rgba(255,214,120,0) 65%);opacity:0;transition:opacity 1.6s ease}' +
      '.cd.is-united .cd__glow{opacity:1}' +
      '.cd__line{position:absolute;left:18%;right:18%;bottom:4%;height:2px;background:linear-gradient(90deg,transparent,#e6c15a,transparent);transform-origin:50% 50%;opacity:.8;transition:transform 1s linear}' +
      '.cd__msg{position:relative;z-index:3;padding:0 8% 2.4rem;font-size:1.3rem;font-style:italic;color:#fff;min-height:1.4em}' +
      '@media (prefers-reduced-motion:reduce){.cd__fig,.cd__together,.cd__glow,.cd__line{transition:none}}';
    document.head.appendChild(s);
  }

  /* ---------- time ---------- */
  function now() {                                   // supports ?now= for testing
    var m = /[?&]now=([^&]+)/.exec(location.search);
    if (m) { var t = new Date(decodeURIComponent(m[1])).getTime(); if (!isNaN(t)) return t; }
    return Date.now();
  }

  /* ---------- update everything once per second ---------- */
  function tick() {
    var C = S.countdown;
    var start = new Date(C.start).getTime(), target = new Date(C.target).getTime();
    var t = now(), left = target - t;
    var p = Math.min(1, Math.max(0, (t - start) / (target - start)));   // real elapsed time
    var united = left <= 0;

    // timer
    var d = 0, h = 0, m = 0, s = 0;
    if (!united) {
      var sec = Math.floor(left / 1000);
      d = Math.floor(sec / 86400); h = Math.floor(sec % 86400 / 3600);
      m = Math.floor(sec % 3600 / 60); s = sec % 60;
    }
    els.d.textContent = d; els.h.textContent = pad(h); els.m.textContent = pad(m); els.s.textContent = pad(s);

    // figures walk toward each other: 0 = apart, 1 = meeting in the middle
    var W = root.clientWidth || 360;
    var dist = W * 0.19 * p;                         // distance each one has walked
    els.bride.style.transform = 'translate3d(' + dist.toFixed(1) + 'px,0,0)';
    els.groom.style.transform = 'translate3d(' + (-dist).toFixed(1) + 'px,0,0)';
    els.line.style.transform = 'scaleX(' + (1 - p * 0.85).toFixed(3) + ')';

    root.classList.toggle('is-united', united);
    els.msg.textContent = united ? (C.unitedText || '') : '';
  }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  /* ---------- build ---------- */
  function box(label) {
    var num = App.el('span', { class: 'cd__num', text: '0' });
    var b = App.el('div', { class: 'cd__box' }, [num, App.el('span', { class: 'cd__lab', text: label })]);
    return { box: b, num: num };
  }

  function render(parent) {
    css();
    var C = S.countdown, L = S.home.countdownLabels;

    root = App.el('section', { class: 'cd home__countdown', 'aria-label': S.home.countdownHeading });
    root.appendChild(App.img(C.scene, '', 'cd__bg', false));
    root.appendChild(App.el('div', { class: 'cd__shade' }));

    // heading + live timer
    var D = box(L.days), H = box(L.hours), M = box(L.minutes), Sx = box(L.seconds);
    els.d = D.num; els.h = H.num; els.m = M.num; els.s = Sx.num;
    var timerEl = App.el('div', { class: 'cd__timer', role: 'timer' }, [D.box, H.box, M.box, Sx.box]);
    root.appendChild(App.el('div', { class: 'cd__top' }, [
      App.el('h2', { class: 'cd__title', text: S.home.countdownHeading }), timerEl
    ]));

    // stage: the couple
    els.bride = App.img(C.bride, S.site.bride, 'cd__fig cd__fig--bride', false);
    els.groom = App.img(C.groom, S.site.groom, 'cd__fig cd__fig--groom', false);
    els.together = App.img(C.together, S.site.couple, 'cd__together', false);
    els.line = App.el('div', { class: 'cd__line', 'aria-hidden': 'true' });
    root.appendChild(App.el('div', { class: 'cd__stage' }, [
      App.el('div', { class: 'cd__glow', 'aria-hidden': 'true' }),
      els.line, els.bride, els.groom, els.together
    ]));

    els.msg = App.el('p', { class: 'cd__msg', 'aria-live': 'polite' });
    root.appendChild(els.msg);

    parent.appendChild(root);

    tick();
    timer = setInterval(tick, 1000);
    onResize = tick;                                  // recompute walking distance
    window.addEventListener('resize', onResize);
  }

  function destroy() {
    clearInterval(timer); timer = 0;
    if (onResize) window.removeEventListener('resize', onResize);
    onResize = null; root = null; els = {};
  }

  window.Countdown = { render: render, destroy: destroy };
})();