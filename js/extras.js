/* extras.js: (1) extra animations for the Mayra and Reception pages
              (2) the four invitation versions:  ?invite=all | evening | 21st | reception
   Loads after updates.js and music.js, before app.js. */
(function () {
  'use strict';
  var S = window.SITE;

  /* ================= extra animations ================= */
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function addFx(pg, id) {
    if (id !== 'mayra' && id !== 'reception') return;
    var fx = document.createElement('div'); fx.className = 'fpage__fx'; fx.setAttribute('aria-hidden', 'true');
    var small = window.innerWidth < 420, i, d;
    function mk(cls) { var n = document.createElement('i'); n.className = cls; fx.appendChild(n); return n; }
    function twinkle(n, x0, x1, y0, y1, color, s0, s1) {
      n.style.left = rnd(x0, x1) + '%'; n.style.top = rnd(y0, y1) + '%'; n.style.background = color;
      n.style.setProperty('--s', rnd(s0, s1) + 'px'); n.style.setProperty('--d', rnd(1.6, 4.4) + 's'); n.style.setProperty('--delay', (-rnd(0, 5)) + 's');
    }
    if (id === 'mayra') {                                   // flower petals falling, gold sparkles, soft pink light
      var cols = ['radial-gradient(circle at 30% 30%,#ffd0e3,#ea5f9a 70%,#b8326e)', 'radial-gradient(circle at 30% 30%,#ff9bd0,#d6277f 70%,#9d1360)',
                  'radial-gradient(circle at 30% 30%,#ffd88a,#f4a623 70%,#d97a0b)', 'radial-gradient(circle at 30% 30%,#ffffff,#ffd9e6 70%,#f0a8c4)'];
      for (i = 0; i < (small ? 12 : 18); i++) {
        d = mk('fx-petal'); d.style.left = rnd(0, 96) + '%'; d.style.background = cols[i % cols.length];
        d.style.setProperty('--s', rnd(9, 16) + 'px'); d.style.setProperty('--d', rnd(9, 15) + 's');
        d.style.setProperty('--delay', (-rnd(0, 15)) + 's'); d.style.setProperty('--sway', rnd(18, 46) + 'px');
      }
      for (i = 0; i < (small ? 14 : 22); i++) twinkle(mk('fx-star'), 2, 98, 4, 82, '#fff0c0', 2, 4);
      d = mk('fx-glow'); d.style.background = 'radial-gradient(ellipse at 50% 30%, rgba(255,214,230,.6), rgba(255,190,215,0) 65%)';
    } else {                                                // reception: lantern glow, fountain sparkles, rising golden embers
      [[9,40,46],[89,40,46],[14,18,28],[27,24,22],[73,24,22],[86,18,28],[50,13,24],[38,31,18],[62,31,18]].forEach(function (L) {
        var n = mk('fx-lamp'), sz = L[2] * 1.6;
        n.style.left = L[0] + '%'; n.style.top = L[1] + '%'; n.style.marginLeft = (-sz / 2) + 'px'; n.style.marginTop = (-sz / 2) + 'px';
        n.style.setProperty('--s', sz + 'px'); n.style.setProperty('--d', rnd(1.8, 3.4) + 's'); n.style.setProperty('--delay', (-rnd(0, 3)) + 's');
      });
      for (i = 0; i < (small ? 10 : 15); i++) twinkle(mk('fx-star'), 40, 60, 51, 61, '#e4f5ff', 2, 3.6);
      for (i = 0; i < (small ? 10 : 16); i++) {
        d = mk('fxr-ember'); d.style.left = rnd(4, 96) + '%'; d.style.bottom = rnd(-4, 12) + '%';
        d.style.setProperty('--s', rnd(3, 6) + 'px'); d.style.setProperty('--d', rnd(8, 14) + 's');
        d.style.setProperty('--delay', (-rnd(0, 14)) + 's'); d.style.setProperty('--sway', rnd(-30, 30) + 'px');
      }
    }
    pg.insertBefore(fx, pg.querySelector('.fpage__layers') || pg.querySelector('.fpage__text'));
  }
  var pageRender = window.Page.render;
  window.Page.render = function (root, f, i) {
    pageRender(root, f, i);
    var pg = root.querySelector('.fpage'); if (pg) addFx(pg, f.id);
  };

  /* ================= four invitation versions =================
     all = every function | evening = functions starting at 5 PM or later | 21st = functions on 21 Nov | reception = Reception only.
     No parameter, or an unknown one, shows everything. Capital letters do not matter. */
  function inviteMode() {
    try {
      var m = (new URLSearchParams(location.search).get('invite') || '').trim().toLowerCase();
      return ['all', 'evening', '21st', 'reception'].indexOf(m) > -1 ? m : 'all';
    } catch (e) { return 'all'; }
  }
  function filterFunctions(list, mode) {
    function hour(f) { var m = /T(\d{2}):/.exec(f.start); return m ? +m[1] : 0; }
    function day(f) { return f.start.slice(0, 10); }
    if (mode === 'evening') return list.filter(function (f) { return hour(f) >= 17; });
    if (mode === '21st') return list.filter(function (f) { return day(f) === '2026-11-21'; });
    if (mode === 'reception') return list.filter(function (f) { return f.id === 'reception'; });
    return list;
  }
  function dateLabel(list) {
    var MN = ['January','February','March','April','May','June','July','August','September','October','November','December'], days = [];
    list.forEach(function (f) { var d = f.start.slice(0, 10); if (days.indexOf(d) < 0) days.push(d); });
    var a = days[0].split('-'), b = days[days.length - 1].split('-');
    if (days.length === 1) return +a[2] + ' ' + MN[+a[1] - 1] + ' ' + a[0];
    if (a[1] === b[1] && a[0] === b[0]) return +a[2] + ' \u2013 ' + +b[2] + ' ' + MN[+a[1] - 1] + ' ' + a[0];
    return +a[2] + ' ' + MN[+a[1] - 1] + ' \u2013 ' + +b[2] + ' ' + MN[+b[1] - 1] + ' ' + b[0];
  }
  var MODE = inviteMode(), shown = filterFunctions(S.functions, MODE);
  if (!shown.length) { MODE = 'all'; shown = S.functions; }
  S.inviteMode = MODE;
  S.functions = shown;                                       // tabs, schedule, Previous/Next and routes all use this list
  S.countdown.target = S.functions[0].start;                 // count down to the first function of this version
  S.cover.scratch.date = S.site.dates = dateLabel(S.functions);
  var homeRender = window.Home.render;
  window.Home.render = function (root) {
    homeRender(root);
    var g = root.querySelector('.tabs__grid'); if (g) g.classList.add('tabs__grid--n' + S.functions.length);
  };
})();
