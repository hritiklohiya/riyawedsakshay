/* gate.js (v2): doors swing open INSIDE the doorway, then the camera pushes in.
   Called by app.js: Gate.init({ root, onOpen })  Gate.destroy() */
(function () {
  'use strict';
  var S = window.SITE;
  var st = { timers: [], onResize: null };

  function init(opts) {
    var G = S.gate, d = G.doorway, root = opts.root, opened = false;
    root.hidden = false; root.innerHTML = '';

    var gate = App.el('div', { class: 'gate' });
    gate.style.setProperty('--gate-time', G.openSeconds + 's');
    gate.style.setProperty('--gate-angle', G.openDegrees);
    if (!(window.CSS && CSS.supports && CSS.supports('transform-style', 'preserve-3d'))) gate.classList.add('is-simple');

    var stage = App.el('div', { class: 'gate__stage' });
    var frame = new Image();
    frame.className = 'gate__frame'; frame.alt = ''; frame.decoding = 'async';

    var doorway = App.el('div', { class: 'gate__doorway' });
    // a url inside a css variable is read relative to the css folder, so give it the full address
    var lightUrl; try { lightUrl = new URL(G.images.light, document.baseURI).href; } catch (e) { lightUrl = G.images.light; }
    doorway.style.setProperty('--light', 'url("' + lightUrl + '")');
    var left = App.el('div', { class: 'gate__door gate__door--left' });
    var right = App.el('div', { class: 'gate__door gate__door--right' });
    left.style.backgroundImage = 'url("' + G.images.left + '")';
    right.style.backgroundImage = 'url("' + G.images.right + '")';
    doorway.appendChild(left); doorway.appendChild(right);

    stage.appendChild(frame); stage.appendChild(doorway);
    gate.appendChild(stage);

    var btn = App.el('button', { class: 'btn btn--gold gate__btn', type: 'button', text: G.button });
    var sh = G.shehnai || {}, kids = [];
    if (sh.left) kids.push(App.img(sh.left, '', 'gate__shehnai gate__shehnai--l', true));
    kids.push(btn);
    if (sh.right) kids.push(App.img(sh.right, '', 'gate__shehnai gate__shehnai--r', true));
    gate.appendChild(App.el('div', { class: 'gate__ui' }, kids));
    var loading = App.el('div', { class: 'gate__loading', text: S.site.couple });
    gate.appendChild(loading);
    root.appendChild(gate);

    // place the doorway exactly on the picture (picture is shown with object-fit: cover)
    function layout() {
      var W = stage.clientWidth, H = stage.clientHeight, ox = 0, oy = 0, dw = W, dh = H;
      if (frame.naturalWidth) {
        var s = Math.max(W / frame.naturalWidth, H / frame.naturalHeight);
        dw = frame.naturalWidth * s; dh = frame.naturalHeight * s; ox = (W - dw) / 2; oy = (H - dh) / 2;
      }
      var L = ox + dw * d.left / 100, T = oy + dh * d.top / 100, Wd = dw * (d.right - d.left) / 100, Hd = dh * (d.bottom - d.top) / 100;
      doorway.style.setProperty('--dw-left', L + 'px'); doorway.style.setProperty('--dw-top', T + 'px');
      doorway.style.setProperty('--dw-width', Wd + 'px'); doorway.style.setProperty('--dw-height', Hd + 'px');
      stage.style.transformOrigin = (L + Wd / 2) + 'px ' + (T + Hd * 0.55) + 'px';   // zoom into the doorway
    }
    function hideLoading() { loading.classList.add('is-done'); }
    frame.onload = function () { layout(); hideLoading(); };
    frame.onerror = function () { console.warn('Missing gate image:', G.images.frame); hideLoading(); };
    frame.src = G.images.frame;
    layout();
    st.onResize = layout; window.addEventListener('resize', st.onResize);
    st.timers.push(setTimeout(hideLoading, 3000));

    // warm up the cover picture while the gate is on screen
    var pre = new Image(); pre.src = S.cover.background;

    // move the gate out of the page and fade it away ON TOP of the cover, so no blank space ever shows
    function finish() {
      var html = document.documentElement;
      gate.style.cssText = 'position:fixed;top:0;height:100vh;height:100dvh;left:max(0px,calc((100vw - ' + S.layout.maxWidthPx + 'px) / 2));width:min(100vw,' + S.layout.maxWidthPx + 'px);z-index:150';
      document.body.appendChild(gate);
      html.classList.add('gate-wait');                    // cover text waits until the gate is fading
      if (opts.onOpen) opts.onOpen();                     // the cover is drawn underneath the gate now
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        gate.classList.add('is-leaving');
        setTimeout(function () { html.classList.remove('gate-wait'); }, 450);     // cover text starts to appear
        setTimeout(function () { if (gate.parentNode) gate.parentNode.removeChild(gate); }, 1300);
      }); });
    }
    function open(fast) {
      if (opened) return; opened = true;
      if (fast === true) { finish(); return; }
      gate.classList.add('is-open');
      var wait = App.reducedMotion() ? 700 : (G.openSeconds + 1.6) * 1000;
      setTimeout(finish, wait);
    }
    btn.addEventListener('click', function (e) { e.stopPropagation(); open(); });
    gate.addEventListener('click', function () { open(); });
  }

  function destroy() {
    st.timers.forEach(clearTimeout); st.timers = [];
    if (st.onResize) window.removeEventListener('resize', st.onResize);
    st.onResize = null;
  }
  window.Gate = { init: init, destroy: destroy };
})();
