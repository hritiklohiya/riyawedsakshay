/* ============================================================
   effects.js: piece layers (parallax + loop animation) per function.
   Loads after content.js and before page.js. It fills SITE.functions[].layers,
   which page.js already knows how to draw. Transform and opacity only (see page.css).

   HOW TO USE: for each row, put the piece number in  n: 
   (from the pieces preview). Rows with n: null are skipped.
   TODO: every n below is empty (no numbers supplied yet).
   Position values (left, top, width, in % of the screen) are starting guesses: tune by eye.
   anim: sway | swing | puppet | float | flicker | bob     depth: .2 (far) to 1.4 (near)
   ============================================================ */
(function () {
  'use strict';

  var LAYERS = {

    haldi: [
      // garlands hanging from the top corners
      { n: null, left: -4,  top: -2, width: 34, depth: .9, anim: 'sway', origin: '50% 0' },  // TODO garland, left
      { n: null, left: 70,  top: -2, width: 34, depth: .9, anim: 'sway', origin: '50% 0', delay: -2 },  // TODO garland, right
      { n: null, left: 36,  top: 0,  width: 28, depth: .7, anim: 'sway', origin: '50% 0', delay: -1 },  // TODO centre toran, optional
      // objects near the bottom
      { n: null, left: 6,   top: 70, width: 26, depth: 1.1, anim: 'float' },                  // TODO brass bowl or flowers
      { n: null, left: 66,  top: 72, width: 26, depth: 1.1, anim: 'float', delay: -2 }       // TODO brass bowl or flowers
    ],

    sangeet: [
      { n: null, left: 38, top: 0,  width: 24, depth: .5, anim: 'swing', origin: '50% 0' },  // TODO chandelier or hanging light
      { n: null, left: 2,  top: 60, width: 26, depth: 1.0, anim: 'bob' },                     // TODO instrument or figure
      { n: null, left: 72, top: 60, width: 26, depth: 1.0, anim: 'bob', delay: -1.2 }         // TODO instrument or figure
    ],

    mayra: [
      // swinging bells across the top
      { n: null, left: 4,  top: 0,  width: 16, depth: .8, anim: 'swing', origin: '50% 0' },  // TODO bell strand
      { n: null, left: 26, top: 0,  width: 16, depth: .8, anim: 'swing', origin: '50% 0', delay: -1.4 },  // TODO bell strand
      { n: null, left: 48, top: 0,  width: 16, depth: .8, anim: 'swing', origin: '50% 0', delay: -2.8 },  // TODO bell strand
      // puppets (the right side, beside the text)
      { n: null, left: 66, top: 22, width: 28, depth: 1.0, anim: 'puppet', origin: '50% 0' }, // TODO puppet pair
      { n: null, left: 76, top: 74, width: 20, depth: 1.2, anim: 'bob' }                       // TODO camel or pot, optional
    ],

    reception: [
      // the procession image and lamps come from page.js; pieces here are optional
      { n: null, left: 2,  top: 0,  width: 30, depth: .8, anim: 'sway', origin: '50% 0' },   // TODO hanging decor, left
      { n: null, left: 68, top: 0,  width: 30, depth: .8, anim: 'sway', origin: '50% 0', delay: -2 }  // TODO hanging decor, right
    ]
  };

  /* ---------- attach the filled rows to the functions in content.js ---------- */
  function attach() {
    var S = window.SITE;
    if (!S || !S.functions) { console.warn('effects.js: content.js not loaded'); return; }

    S.functions.forEach(function (fn) {
      var rows = LAYERS[fn.id] || [];
      var total = fn.pieces ? fn.pieces.length : 0;

      fn.layers = rows.filter(function (L) {
        if (L.n == null) return false;                       // not filled in yet: skip
        if (L.n < 1 || L.n > total) {                        // number out of range: skip, warn
          console.warn('effects.js: ' + fn.id + ' piece ' + L.n + ' does not exist (1 to ' + total + ')');
          return false;
        }
        return true;
      });
    });
  }

  // small public helper (e.g. to check how many layers are active)
  window.Effects = {
    layers: LAYERS,
    active: function (id) {
      var f = window.SITE.functions.filter(function (x) { return x.id === id; })[0];
      return f && f.layers ? f.layers.length : 0;
    }
  };

  attach();
})();