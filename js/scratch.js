/* ============================================================
   scratch.js: scratch-card date (gold foil canvas)
   Use:   var card = Scratch.create(containerEl, { onReveal: fn });
          card.reveal();   card.destroy();
   Reads text/settings from SITE.cover.scratch (date, hint, hintDelayMs,
   revealAtPercent, foil). Style the look with these classes in home.css:
   .scratch  .scratch__date  .scratch__canvas  .scratch__hint
   ============================================================ */
(function () {
  'use strict';

  var BRUSH = 38;                 // scratch width in px
  var MASK_W = 48;                // tiny mask used to measure % scratched
  var injected = false;

  // small stylesheet for the hint animation (added once)
  function injectStyle() {
    if (injected) return;
    injected = true;
    var s = document.createElement('style');
    s.textContent =
      '.scratch__hint{transition:opacity .5s ease,transform .5s ease}' +
      '.scratch__hint.is-on{opacity:1!important;animation:scratchHint 1.8s ease-in-out infinite}' +
      '@keyframes scratchHint{0%,100%{transform:translate(-50%,0)}50%{transform:translate(-50%,-6px)}}' +
      '.scratch__canvas{transition:opacity .9s ease}';
    document.head.appendChild(s);
  }

  function create(root, opts) {
    opts = opts || {};
    injectStyle();
    var cfg = window.SITE.cover.scratch;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var revealed = false, touched = false, drawing = false;
    var last = null, hintTimer = null, checkTimer = 0, alive = true;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    /* ----- DOM ----- */
    var box = document.createElement('div');
    box.className = 'scratch';
    box.style.cssText = 'position:relative;overflow:hidden;user-select:none;-webkit-user-select:none';
    box.setAttribute('role', 'button');
    box.setAttribute('tabindex', '0');
    box.setAttribute('aria-label', cfg.hint);

    var date = document.createElement('div');
    date.className = 'scratch__date';
    date.textContent = cfg.date;                  // text sits UNDER the foil
    box.appendChild(date);

    var cv = document.createElement('canvas');
    cv.className = 'scratch__canvas';
    cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;touch-action:none;cursor:pointer';
    box.appendChild(cv);

    var hint = document.createElement('div');
    hint.className = 'scratch__hint';
    hint.textContent = cfg.hint;
    hint.setAttribute('aria-hidden', 'true');
    hint.style.cssText = 'position:absolute;left:50%;bottom:8px;transform:translateX(-50%);opacity:0;pointer-events:none;white-space:nowrap';
    box.appendChild(hint);

    root.appendChild(box);

    // reduced motion: no scratching, date is shown at once
    if (reduce) { finish(true); return api(); }

    var ctx = cv.getContext('2d');
    var mask = document.createElement('canvas');
    var mctx = mask.getContext('2d');
    var foil = new Image();
    var foilReady = false;

    /* ----- size + paint the foil ----- */
    function size() {
      var r = box.getBoundingClientRect();
      var w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      mask.width = MASK_W;
      mask.height = Math.max(8, Math.round(MASK_W * h / w));
      paintFoil();
    }

    function paintFoil() {
      ctx.globalCompositeOperation = 'source-over';
      if (foilReady) {
        ctx.drawImage(foil, 0, 0, cv.width, cv.height);
      } else {                                       // plain gold if the image is missing
        var g = ctx.createLinearGradient(0, 0, cv.width, cv.height);
        g.addColorStop(0, '#e6c15a'); g.addColorStop(.5, '#c8962a'); g.addColorStop(1, '#e6c15a');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, cv.width, cv.height);
      }
      mctx.clearRect(0, 0, mask.width, mask.height);   // fresh coverage
    }

    foil.onload = function () { foilReady = true; if (!touched && alive) paintFoil(); };
    foil.onerror = function () { console.warn('Missing foil image:', cfg.foil); };
    foil.src = cfg.foil;
    size();

    /* ----- drawing ----- */
    function pos(e) {
      var r = cv.getBoundingClientRect();
      return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
    }

    function stroke(a, b) {
      // real canvas (destination-out erases the foil)
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineCap = ctx.lineJoin = 'round';
      ctx.lineWidth = BRUSH * dpr;
      ctx.beginPath();
      ctx.moveTo(a.x * cv.width, a.y * cv.height);
      ctx.lineTo(b.x * cv.width, b.y * cv.height);
      ctx.stroke();
      // tiny mask copy, used only to count how much is scratched
      mctx.strokeStyle = '#fff';
      mctx.lineCap = mctx.lineJoin = 'round';
      mctx.lineWidth = Math.max(2, BRUSH / box.clientWidth * MASK_W);
      mctx.beginPath();
      mctx.moveTo(a.x * mask.width, a.y * mask.height);
      mctx.lineTo(b.x * mask.width, b.y * mask.height);
      mctx.stroke();
    }

    function percent() {
      var d = mctx.getImageData(0, 0, mask.width, mask.height).data, n = 0;
      for (var i = 3; i < d.length; i += 4) if (d[i] > 90) n++;
      return n / (mask.width * mask.height) * 100;
    }

    function check() {
      if (!revealed && percent() >= cfg.revealAtPercent) finish(false);
    }

    function down(e) {
      if (revealed) return;
      e.preventDefault();
      touched = true; drawing = true;
      hideHint();
      try { cv.setPointerCapture(e.pointerId); } catch (x) {}
      last = pos(e);
      stroke(last, last);                              // a tap also scratches a dot
    }
    function move(e) {
      if (!drawing || revealed) return;
      e.preventDefault();
      var p = pos(e);
      stroke(last, p);
      last = p;
      var now = Date.now();                            // check about 5 times a second
      if (now - checkTimer > 200) { checkTimer = now; check(); }
    }
    function up() {
      if (!drawing) return;
      drawing = false; last = null;
      check();
    }

    cv.addEventListener('pointerdown', down);
    cv.addEventListener('pointermove', move);
    cv.addEventListener('pointerup', up);
    cv.addEventListener('pointercancel', up);

    // keyboard: Enter or Space reveals the date
    box.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); finish(false); }
    });

    /* ----- hint after 4 s without a touch ----- */
    hintTimer = setTimeout(function () {
      if (!touched && !revealed && alive) hint.classList.add('is-on');
    }, cfg.hintDelayMs);
    function hideHint() {
      clearTimeout(hintTimer);
      hint.classList.remove('is-on');
      hint.style.opacity = '0';
    }

    /* ----- keep sharp if the screen size changes (only before scratching) ----- */
    var ro = null;
    if (window.ResizeObserver) {
      ro = new ResizeObserver(function () { if (!touched && !revealed && alive) size(); });
      ro.observe(box);
    }

    /* ----- finish: fade the foil away, show the date ----- */
    function finish(instant) {
      if (revealed) return;
      revealed = true;
      hideHint();
      box.classList.add('is-revealed');
      box.removeAttribute('role');
      box.removeAttribute('tabindex');
      if (instant) {
        cv.style.display = 'none';
      } else {
        cv.style.opacity = '0';
        cv.style.pointerEvents = 'none';
        setTimeout(function () { cv.style.display = 'none'; }, 950);
      }
      try { if (opts.onReveal) opts.onReveal(box); } catch (e) { console.warn(e); }
    }

    return api();

    /* ----- public controller ----- */
    function api() {
      return {
        el: box,
        reveal: function () { finish(false); },
        isRevealed: function () { return revealed; },
        destroy: function () {
          alive = false;
          clearTimeout(hintTimer);
          if (ro) ro.disconnect();
          if (box.parentNode) box.parentNode.removeChild(box);
        }
      };
    }
  }

  window.Scratch = { create: create };
})();