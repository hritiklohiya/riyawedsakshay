/* final.js: corrected invitation wording, "Lohiya Family", and the scroll hint on the cover.
   Loads after updates.js and extras.js, before app.js, so these lines win over earlier ones. */
(function () {
  'use strict';
  var S = window.SITE, I = S.invitation;

  /* ----- invitation text (exactly as supplied) ----- */
  I.blessings = ['Shri Pitradev Namah', 'Shri Kuldevi Namah'];
  I.intro = 'By the boundless grace of the Almighty,';
  I.hosts = 'Smt. Basanti Devi Ji and Late Shri Badridas Ji Lohiya';
  I.invite = 'warmly invite you to the wedding celebrations of their beloved granddaughter';
  I.bride = 'Riya';
  I.brideParents = '(Daughter of Smt. Rekha & Shri Ramesh Lohiya)';
  I.connector = 'With';                      // shown spaced out in capitals by the style sheet
  I.groom = 'Akshay';
  I.groomParents = '(Son of Smt. Prem ji & Shri Ramesh Chandra ji Laddha)';
  I.groomExtra = '(Grandson of Smt. Lali Devi ji & Shri Ram Kumar ji Laddha)';
  I.closing = 'Your gracious presence and kind blessings will bring joy and grace to our special day.';
  S.closing.line2 = 'Lohiya Family';

  /* ----- home page: blessing on two lines, scroll hint on the cover ----- */
  var homeRender = window.Home.render;
  window.Home.render = function (root) {
    homeRender(root);

    var b = root.querySelector('.invite__blessings');
    if (b) {
      b.innerHTML = '';
      I.blessings.forEach(function (t, n) {
        if (n) b.appendChild(document.createElement('br'));
        b.appendChild(document.createTextNode(t));
      });
    }

    var cover = root.querySelector('.cover');
    if (cover) {
      var hint = document.createElement('div');
      hint.className = 'cover__hint'; hint.setAttribute('aria-hidden', 'true');
      hint.innerHTML = '<span>Scroll</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8l6 6 6-6"/><path d="M6 14l6 6 6-6"/></svg>';
      cover.appendChild(hint);
      var onScroll = function () {
        if (!hint.isConnected) { window.removeEventListener('scroll', onScroll); return; }
        hint.classList.toggle('is-hidden', (window.scrollY || 0) > 40);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
    }
  };
})();
