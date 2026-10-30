/* ============================================================
   home.js (v2): cover, invitation card, four tabs WITH TEXT, venue,
   countdown, closing (Share only, no calendar).
   Called by app.js:  Home.render(root)   Home.destroy()
   ============================================================ */
(function () {
  'use strict';

  var S = window.SITE;
  var card = null;

  function div(cls, kids) { return App.el('div', { class: cls }, kids || []); }
  function text(tag, cls, str) { return App.el(tag, { class: cls, text: str }); }
  function reveal(node, delay) {
    node.classList.add('reveal');
    if (delay) node.style.setProperty('--delay', delay + 's');
    return node;
  }
  function divider() { return App.el('div', { class: 'divider', 'aria-hidden': 'true' }); }

  // "Friday, 20 November 2026" + "From 11:00 AM"  ->  "Fri, 20 Nov \u00B7 11:00 AM"
  function shortWhen(fn) {
    var m = /^(\w+),\s*(\d+)\s+(\w+)/.exec(fn.date);
    var day = m ? m[1].slice(0, 3) + ', ' + m[2] + ' ' + m[3].slice(0, 3) : fn.date;
    return day + ' \u00B7 ' + fn.time.replace(/^From\s+/i, '');
  }

  /* ---------- cover ---------- */
  function buildCover() {
    var C = S.cover;
    var sec = App.el('section', { class: 'cover', 'aria-label': S.site.couple });
    sec.appendChild(App.img(C.background, '', 'cover__bg', true));
    var scratchBox = div('cover__scratch');
    sec.appendChild(div('cover__content', [
      div('cover__top', [App.img(C.monogram, '', 'cover__monogram', true), text('div', 'cover__blessing', C.blessing)]),
      div('cover__bottom', [
        text('h1', 'cover__names names', C.names),
        text('div', 'cover__hashtag', C.hashtag),
        scratchBox,
        text('div', 'cover__venue', C.venueLine)
      ])
    ]));
    sec._scratchBox = scratchBox;
    return sec;
  }

  /* ---------- invitation (one bordered card, like the PDF) ---------- */
  function buildInvite() {
    var I = S.invitation;
    var sec = App.el('section', { class: 'invite', 'aria-label': 'Invitation' });
    var c = div('invite__card');
    c.appendChild(reveal(text('div', 'invite__blessings', I.blessings.join('  \u00B7  '))));
    c.appendChild(reveal(text('p', 'invite__text', I.intro), .1));
    c.appendChild(reveal(text('p', 'invite__hosts', I.hosts), .15));
    c.appendChild(reveal(text('p', 'invite__text', I.invite), .2));
    c.appendChild(reveal(text('h2', 'invite__name names', I.bride), .1));
    c.appendChild(reveal(text('p', 'invite__parents', I.brideParents), .15));
    c.appendChild(reveal(text('div', 'invite__connector', I.connector), .1));
    c.appendChild(reveal(text('h2', 'invite__name names', I.groom), .1));
    c.appendChild(reveal(text('p', 'invite__parents', I.groomParents), .15));
    c.appendChild(reveal(text('p', 'invite__parents', I.groomExtra), .2));
    c.appendChild(reveal(divider(), .1));
    c.appendChild(reveal(text('p', 'invite__closing', I.closing), .15));
    sec.appendChild(c);
    return sec;
  }

  /* ---------- four tabs: ribbon name, title line, day and time ---------- */
  function buildTabs() {
    var sec = App.el('section', { class: 'tabs', 'aria-label': S.home.tabsHeading });
    sec.appendChild(reveal(text('h2', 'section-title', S.home.tabsHeading)));
    var grid = div('tabs__grid');
    S.functions.forEach(function (fn, i) {
      var a = App.el('a', { class: 'tab', href: S.routes[fn.id], 'aria-label': fn.tab + ': ' + fn.heading + ', ' + fn.date + ', ' + fn.time });
      a.appendChild(App.img(fn.scene, '', 'tab__img', false));
      a.appendChild(div('tab__shade'));
      a.appendChild(div('tab__text', [
        text('span', 'tab__name', fn.tab),
        text('span', 'tab__title', fn.heading),
        text('span', 'tab__when', shortWhen(fn))
      ]));
      reveal(a, i * .1);
      grid.appendChild(a);
    });
    sec.appendChild(grid);
    return sec;
  }

  /* ---------- venue ---------- */
  function buildVenue() {
    var L = S.location;
    var sec = App.el('section', { class: 'venue', 'aria-label': S.home.locationHeading });
    sec.appendChild(reveal(text('h2', 'section-title', S.home.locationHeading)));
    sec.appendChild(reveal(div('venue__card', [
      text('h3', 'venue__name', L.name),
      text('p', 'venue__address', L.address),
      App.el('a', { class: 'btn btn--gold', href: L.mapsUrl, target: '_blank', rel: 'noopener', text: S.ui.openMaps })
    ]), .1));
    return sec;
  }

  /* ---------- closing: warm regards + Share (no calendar) ---------- */
  function buildClosing() {
    var sec = App.el('section', { class: 'closing', 'aria-label': S.closing.line1 });
    sec.appendChild(reveal(text('div', 'closing__line1', S.closing.line1)));
    sec.appendChild(reveal(text('div', 'closing__line2 names', S.closing.line2), .1));
    var share = App.el('button', { class: 'btn btn--gold', type: 'button', text: S.ui.shareInvitation });
    share.addEventListener('click', function () { if (window.Actions) Actions.share(); });
    sec.appendChild(reveal(div('closing__actions', [share]), .2));
    return sec;
  }

  /* ---------- render ---------- */
  function render(root) {
    root.innerHTML = '';
    var home = div('home');
    root.appendChild(home);

    var cover = buildCover();
    home.appendChild(cover);
    try { card = Scratch.create(cover._scratchBox, {}); }
    catch (e) { console.warn('Scratch card failed:', e); cover._scratchBox.appendChild(text('div', 'scratch__date', S.cover.scratch.date)); }

    home.appendChild(buildInvite());
    home.appendChild(buildTabs());
    home.appendChild(buildVenue());
    try { Countdown.render(home); } catch (e) { console.warn('Countdown failed:', e); }
    home.appendChild(buildClosing());
  }

  function destroy() {
    try { if (card) card.destroy(); } catch (e) {}
    card = null;
    try { if (window.Countdown) Countdown.destroy(); } catch (e) {}
  }

  window.Home = { render: render, destroy: destroy };
})();
