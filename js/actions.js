/* ============================================================
   actions.js: Share, Add to Google Calendar, downloadable .ics
   Public API (window.Actions):
     Actions.share()                 native share, or copy link as fallback
     Actions.copyLink()              copy the invitation link
     Actions.addToCalendar(fn)       opens a small choice sheet for ONE function
     Actions.addToCalendar()         (no argument) sheet listing all four functions + "all in one file"
     Actions.googleUrl(fn)           Google Calendar link for a function
     Actions.downloadIcs(fnOrList)   download .ics (one function, or an array)
   Any button with data-action="share" or data-action="calendar" also works.
   Times are IST (+05:30), duration = SITE.calendar.durationHours (3).
   TODO: add these to content.js SITE.ui (defaults below are used until you do):
     linkCopied, copyFailed, shared, googleCalendar, downloadIcs, allInOne, close
   ============================================================ */
(function () {
  'use strict';

  var S = window.SITE;
  var toastEl = null, toastTimer = 0, sheetEl = null, lastFocus = null;

  /* ---------- text (content.js first, then default) ---------- */
  function T(key, fallback) { return (S.ui && S.ui[key]) || fallback; }

  /* ---------- date helpers (kept in IST on purpose) ---------- */
  function two(n) { return n < 10 ? '0' + n : '' + n; }
  // "2026-11-20T11:00:00+05:30" -> "20261120T110000" (IST wall clock, no timezone shifting)
  function istStamp(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(iso);
    return m[1] + m[2] + m[3] + 'T' + m[4] + m[5] + '00';
  }
  // start + hours, still as an IST wall-clock stamp
  function istEnd(iso, hours) {
    var t = new Date(iso).getTime() + hours * 3600000 + 19800000;   // shift +5:30 then read UTC fields
    var d = new Date(t);
    return d.getUTCFullYear() + two(d.getUTCMonth() + 1) + two(d.getUTCDate()) +
           'T' + two(d.getUTCHours()) + two(d.getUTCMinutes()) + '00';
  }
  function utcNow() {
    var d = new Date();
    return d.getUTCFullYear() + two(d.getUTCMonth() + 1) + two(d.getUTCDate()) +
           'T' + two(d.getUTCHours()) + two(d.getUTCMinutes()) + two(d.getUTCSeconds()) + 'Z';
  }

  /* ---------- the invitation link ---------- */
  function pageUrl() { return location.href.split('#')[0]; }

  /* ---------- small toast message ---------- */
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      toastEl.style.cssText =
        'position:fixed;left:50%;bottom:calc(24px + env(safe-area-inset-bottom,0px));' +
        'transform:translate(-50%,20px);opacity:0;z-index:200;max-width:86%;' +
        'padding:.7em 1.4em;border-radius:999px;background:#5a0f23;color:#fbefd9;' +
        'border:1.5px solid #c8962a;font-family:var(--font-body,serif);font-size:1.05rem;' +
        'box-shadow:0 8px 24px rgba(0,0,0,.45);transition:opacity .3s,transform .3s;pointer-events:none;text-align:center';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.style.opacity = '1';
    toastEl.style.transform = 'translate(-50%,0)';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.style.opacity = '0';
      toastEl.style.transform = 'translate(-50%,20px)';
    }, 2400);
  }

  /* ============================================================
     SHARE
     ============================================================ */
  function copyText(text) {
    // returns a Promise: resolves true only if the copy really worked
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return legacyCopy(text); });
    }
    return Promise.resolve(legacyCopy(text));
  }
  function legacyCopy(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px';   // 16px stops iOS zoom
      document.body.appendChild(ta);
      ta.focus(); ta.select(); ta.setSelectionRange(0, text.length);
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (e) { return false; }
  }

  function copyLink() {
    return copyText(pageUrl()).then(function (ok) {
      toast(ok ? T('linkCopied', 'Link copied') : T('copyFailed', 'Could not copy the link'));
      return ok;
    });
  }

  function share() {
    var data = { title: S.share.title, text: S.share.text, url: pageUrl() };
    if (navigator.share) {
      return navigator.share(data).then(function () {
        return true;                                           // the share sheet handled it
      }, function (err) {
        if (err && err.name === 'AbortError') return false;    // visitor closed the sheet: do nothing
        return copyMessage();                                  // real failure: fall back to copying
      });
    }
    return copyMessage();                                      // no Web Share (most desktops)
  }
  function copyMessage() {
    return copyText(S.share.text + ' ' + pageUrl()).then(function (ok) {
      toast(ok ? T('linkCopied', 'Link copied') : T('copyFailed', 'Could not copy the link'));
      return ok;
    });
  }

  /* ============================================================
     CALENDAR
     ============================================================ */
  function title(fn) { return S.calendar.titlePrefix + fn.heading; }
  function details(fn) { return fn.date + ', ' + fn.time + '. ' + S.site.hashtag; }

  function googleUrl(fn) {
    var c = S.calendar;
    return 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
      '&text=' + encodeURIComponent(title(fn)) +
      '&dates=' + istStamp(fn.start) + '/' + istEnd(fn.start, c.durationHours) +
      '&ctz=' + encodeURIComponent(c.timezone) +
      '&details=' + encodeURIComponent(details(fn)) +
      '&location=' + encodeURIComponent(c.location);
  }

  /* ----- .ics text ----- */
  function esc(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n'); }
  function fold(line) {                          // lines must be 75 characters or fewer
    var out = '';
    while (line.length > 74) { out += line.slice(0, 74) + '\r\n '; line = line.slice(74); }
    return out + line;
  }

  function icsText(list) {
    var c = S.calendar, stamp = utcNow();
    var L = [
      'BEGIN:VCALENDAR', 'VERSION:2.0',
      'PRODID:-//Riya and Akshay Wedding//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'X-WR-CALNAME:' + esc(S.site.couple + ' Wedding'),
      // IST has no daylight saving: one fixed definition
      'BEGIN:VTIMEZONE', 'TZID:' + c.timezone,
      'BEGIN:STANDARD', 'DTSTART:19700101T000000', 'TZOFFSETFROM:+0530', 'TZOFFSETTO:+0530', 'TZNAME:IST', 'END:STANDARD',
      'END:VTIMEZONE'
    ];
    list.forEach(function (fn) {
      L.push('BEGIN:VEVENT',
        'UID:' + fn.id + '-' + istStamp(fn.start) + '@riya-akshay-wedding',
        'DTSTAMP:' + stamp,
        'DTSTART;TZID=' + c.timezone + ':' + istStamp(fn.start),
        'DTEND;TZID=' + c.timezone + ':' + istEnd(fn.start, c.durationHours),
        'SUMMARY:' + esc(title(fn)),
        'LOCATION:' + esc(c.location),
        'DESCRIPTION:' + esc(details(fn)),
        'STATUS:CONFIRMED',
        'BEGIN:VALARM', 'TRIGGER:-PT2H', 'ACTION:DISPLAY', 'DESCRIPTION:' + esc(title(fn)), 'END:VALARM',
        'END:VEVENT');
    });
    L.push('END:VCALENDAR');
    return L.map(fold).join('\r\n') + '\r\n';
  }

  function downloadIcs(what) {
    var list = Array.isArray(what) ? what : [what];
    var name = Array.isArray(what) ? S.calendar.icsFileName : 'riya-akshay-' + what.id + '.ics';
    var text = icsText(list);
    try {
      var blob = new Blob([text], { type: 'text/calendar;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = name;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    } catch (e) {                                              // very old browsers
      window.open('data:text/calendar;charset=utf-8,' + encodeURIComponent(text), '_blank');
    }
  }

  /* ----- the choice sheet ----- */
  function closeSheet() {
    if (!sheetEl) return;
    document.removeEventListener('keydown', onKey);
    sheetEl.parentNode && sheetEl.parentNode.removeChild(sheetEl);
    sheetEl = null;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function onKey(e) { if (e.key === 'Escape') closeSheet(); }

  function sheetButton(label, onClick, href) {
    var el = document.createElement(href ? 'a' : 'button');
    el.className = 'btn' + (href ? '' : '');
    el.textContent = label;
    el.style.cssText = 'width:100%;margin:6px 0;text-decoration:none';
    if (href) { el.href = href; el.target = '_blank'; el.rel = 'noopener'; }
    else el.type = 'button';
    el.addEventListener('click', function () { if (onClick) onClick(); closeSheet(); });
    return el;
  }

  function addToCalendar(fn) {
    closeSheet();
    lastFocus = document.activeElement;
    var list = fn ? [fn] : S.functions;

    sheetEl = document.createElement('div');
    sheetEl.setAttribute('role', 'dialog');
    sheetEl.setAttribute('aria-modal', 'true');
    sheetEl.setAttribute('aria-label', S.ui.addToCalendar);
    sheetEl.style.cssText = 'position:fixed;inset:0;z-index:150;display:flex;align-items:flex-end;justify-content:center;background:rgba(20,3,8,.6)';
    sheetEl.addEventListener('click', function (e) { if (e.target === sheetEl) closeSheet(); });

    var card = document.createElement('div');
    card.style.cssText =
      'width:100%;max-width:' + S.layout.maxWidthPx + 'px;max-height:82vh;overflow:auto;' +
      'background:#fbefd9;border-radius:20px 20px 0 0;border-top:3px solid #c8962a;' +
      'padding:1.2rem 1.2rem calc(1.2rem + env(safe-area-inset-bottom,0px));text-align:center;color:#7a1236';

    var h = document.createElement('div');
    h.textContent = S.ui.addToCalendar;
    h.style.cssText = 'font-family:var(--font-label,serif);font-size:.85rem;letter-spacing:.24em;text-transform:uppercase;color:#a87a1b;margin-bottom:.6rem';
    card.appendChild(h);

    list.forEach(function (f) {
      if (list.length > 1) {
        var n = document.createElement('div');
        n.textContent = f.tab + ' \u00B7 ' + f.date + ', ' + f.time;
        n.style.cssText = 'font-weight:700;margin-top:.9rem;font-size:1.1rem';
        card.appendChild(n);
      }
      card.appendChild(sheetButton(T('googleCalendar', 'Google Calendar'), null, googleUrl(f)));
      card.appendChild(sheetButton(T('downloadIcs', 'Download .ics file'), function () { downloadIcs(f); }));
    });

    if (list.length > 1) {
      var sep = document.createElement('div');
      sep.style.cssText = 'height:1px;background:#c8962a;opacity:.5;margin:1rem 0 .4rem';
      card.appendChild(sep);
      card.appendChild(sheetButton(T('allInOne', 'All four events in one file'), function () { downloadIcs(S.functions); }));
    }
    var close = sheetButton(T('close', 'Close'));
    close.className = 'btn btn--ghost';
    close.style.cssText += ';margin-top:.8rem';
    card.appendChild(close);

    sheetEl.appendChild(card);
    document.body.appendChild(sheetEl);
    document.addEventListener('keydown', onKey);
    var first = card.querySelector('a,button');
    if (first) first.focus();
  }

  /* ---------- buttons that only need an attribute: data-action="share" | "calendar" ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-action]');
    if (!b) return;
    var a = b.getAttribute('data-action');
    if (a === 'share') { e.preventDefault(); share(); }
    else if (a === 'calendar') {
      e.preventDefault();
      var id = b.getAttribute('data-fn');
      addToCalendar(id ? window.App.fnById(id) : null);
    } else if (a === 'copy') { e.preventDefault(); copyLink(); }
  });

  window.Actions = {
    share: share, copyLink: copyLink, addToCalendar: addToCalendar,
    googleUrl: googleUrl, downloadIcs: downloadIcs, icsText: icsText
  };
})();