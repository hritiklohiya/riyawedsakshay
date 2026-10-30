/* ============================================================
   content.js: ALL text and data for the Riya & Akshay invitation.
   Plain script (no modules). Exposes one global: window.SITE
   Search for "TODO" to find items still waiting for confirmation.
   Image file names here match the real files in assets/ (double extensions included).
   ============================================================ */
(function () {
  'use strict';

  var A = 'assets/'; // asset root

  window.SITE = {

    // ---------- site info ----------
    site: {
      title: 'Riya & Akshay | Wedding Invitation',
      couple: 'Riya & Akshay',
      bride: 'Riya',
      groom: 'Akshay',
      hashtag: '#RIYaLLy made For Akshay',
      blessing: 'Shri Ganeshaya Namah',
      dates: '20 \u2013 21 November 2026',
      city: 'Jodhpur',
      timezone: 'Asia/Kolkata',
      utcOffset: '+05:30',
      language: 'en'
    },

    // ---------- design tokens (mirrored in CSS) ----------
    colors: {
      maroon: '#7a1236',
      gold: '#c8962a',
      cream: '#fbefd9',
      saffron: '#f4a623'
    },
    fonts: {
      body: 'Cormorant Garamond',
      label: 'Cinzel',
      names: 'Great Vibes'
    },

    // ---------- gate ----------
    gate: {
      button: 'Tap to enter',
      openDegrees: 80,
      openSeconds: 3,
      // TODO: tune by eye (% of the gate frame image)
      doorway: { left: 32.6, right: 68.4, top: 52.7, bottom: 89.7, pointedArch: true },
      images: {
        frame:  A + '01_gate/01_gate_frame.webp',
        closed: A + '01_gate/01_gate_closed.webp',
        left:   A + '01_gate/01_door_left.webp',
        right:  A + '01_gate/01_door_right.webp',
        light:  A + '01_gate/01_light_beyond.webp'
      }
    },

    // ---------- cover ----------
    cover: {
      background: A + '02_courtyard/02_cover_jodhpur.jpg.png',
      frame: A + '02_courtyard/02_arch_frame.webp',
      monogram: A + '12_brand/12_monogram.png.png',
      blessing: 'Shri Ganeshaya Namah',
      names: 'Riya & Akshay',
      hashtag: '#RIYaLLy made For Akshay',
      venueLine: 'Maheshwari Bhawan, Ratanada, Jodhpur',
      scratch: {
        date: '20 \u2013 21 November 2026',
        hint: 'Scratch to reveal the date',
        hintDelayMs: 4000,
        revealAtPercent: 55,
        foil: A + '11_textures/11_gold_foil.jpg.png'
      }
    },

    // ---------- invitation message ----------
    invitation: {
      blessings: ['Shri Pitridev Namah', 'Shri Kuldevi Namah'],
      intro: 'By the boundless grace of the Almighty,',
      hosts: 'Smt. Basanti Devi and the late Shri Badridas ji Lohiya',
      invite: 'warmly invite you to the wedding celebrations of their beloved granddaughter',
      bride: 'Riya',
      brideParents: '(daughter of Smt. Rekha & Shri Ramesh Lohiya)',
      connector: 'with',
      groom: 'Akshay',
      groomParents: '(son of Smt. Prem ji & Shri Ramesh Chandra ji Laddha)',
      // TODO: confirm. You said this line is the groom's grandparents, so the wording may need "grandson of"
      groomExtra: '[son of Smt. Lali Devi ji & Shri Ram Kumar ji Laddha]',
      closing: 'Your gracious presence and loving blessings will be our good fortune.'
    },

    // ---------- home page section texts ----------
    home: {
      tabsHeading: 'The Celebrations',   // TODO: confirm heading text
      locationHeading: 'Venue',          // TODO: confirm heading text
      countdownHeading: 'Counting Down', // TODO: confirm heading text
      countdownLabels: { days: 'Days', hours: 'Hours', minutes: 'Minutes', seconds: 'Seconds' }
    },

    // ---------- location ----------
    location: {
      name: 'Maheshwari Bhawan',
      address: 'Maheshwari Bhawan, Ratanada, Jodhpur',
      // TODO: replace with the exact Google Maps link when it arrives
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Maheshwari+Bhawan+Ratanada+Jodhpur',
      // TODO: same venue assumed for all four functions (confirm)
      sameVenueForAll: true
    },

    // ---------- the four functions ----------
    // "sheet" = the one image that holds all the foreground pieces (to be cut into pieces later)
    // "pieces" stays empty until the sheets are cut, so no layers are drawn yet
    functions: [
      {
        id: 'haldi',
        label: 'HALDI',
        tab: 'Haldi',
        heading: 'Haldi Ke Rang, Bhajanon Ke Sang',
        date: 'Friday, 20 November 2026',
        time: 'From 11:00 AM',
        start: '2026-11-20T11:00:00+05:30',
        scene: A + '03_haldi/03_haldi_scene.jpg.png',
        sheet: A + '03_haldi/03_haldi_foreground.png.png',
        pieces: [],
        effects: ['sway-garlands', 'falling-marigold-petals', 'warm-sun-glow'],
        textZone: { topPct: 8, bottomPct: 35, align: 'center', color: '#7a1236', color2: '#7a1236' }
      },
      {
        id: 'sangeet',
        label: 'SANGEET',
        tab: 'Sangeet',
        heading: 'Naacho Gaao, Dhoom Machaao',
        date: 'Friday, 20 November 2026',
        time: 'From 7:00 PM',
        start: '2026-11-20T19:00:00+05:30',
        scene: A + '04_sangeet/04_sangeet_scene.jpg.png',
        sheet: A + '04_sangeet/04_sangeet_foreground.png.png',
        pieces: [],
        effects: ['twinkling-stars', 'moving-light-beams'],
        textZone: { topPct: 30, bottomPct: 58, align: 'center', color: '#e6c15a', color2: '#ffffff' }
      },
      {
        id: 'mayra',
        label: 'MAYRA',
        tab: 'Mayra',
        // TODO: confirm Mayra / Nanihal naming
        heading: 'Nanihal Ka Sneh',
        date: 'Saturday, 21 November 2026',
        time: 'From 11:00 AM',
        start: '2026-11-21T11:00:00+05:30',
        scene: A + '05_nanihal/05_nanihal_scene.png.png',
        sheet: A + '05_nanihal/05_nanihal_foreground.png.png',
        pieces: [],
        effects: ['swinging-bells', 'swaying-puppets'],
        textZone: { topPct: 20, bottomPct: 45, align: 'left', color: '#7a1236', color2: '#7a1236' }
      },
      {
        id: 'reception',
        label: 'RECEPTION',
        tab: 'Reception',
        heading: 'Saat Vachan, Saat Janam, Swagat Hai Har Kadam',
        date: 'Saturday, 21 November 2026',
        time: 'From 7:00 PM',
        start: '2026-11-21T19:00:00+05:30',
        scene: A + '06_baraat/06_baraat_scene.jpg.png',
        procession: A + '06_baraat/06_baraat_procession.png.png',
        pieces: [],
        effects: ['procession-walk', 'flickering-lamps'],
        textZone: { topPct: 22, bottomPct: 50, align: 'center', color: '#5a0f23', color2: '#5a0f23' }
      }
    ],

    // ---------- countdown & couple journey ----------
    countdown: {
      // TODO: confirm target (brief says first function, 20 Nov 11:00 AM)
      target: '2026-11-20T11:00:00+05:30',
      // TODO: confirm start of the journey
      start: '2026-10-01T00:00:00+05:30',
      scene: A + '08_countdown/08_countdown_scene.jpg.png',
      bride: A + '07_couple/07_bride.png.png',
      groom: A + '07_couple/07_groom.png.png',
      together: A + '07_couple/07_couple_together.jpg.png',
      wedding: A + '07_couple/07_couple_wedding.png.png'
      // TODO: unitedText: 'add the words to show when the target time is reached'
    },

    // ---------- calendar ----------
    calendar: {
      timezone: 'Asia/Kolkata',
      // TODO: duration is a default, to be confirmed
      durationHours: 3,
      titlePrefix: 'Riya & Akshay: ',
      location: 'Maheshwari Bhawan, Ratanada, Jodhpur',
      icsFileName: 'riya-akshay-wedding.ics'
    },

    // ---------- closing ----------
    closing: {
      line1: 'With warm regards,',
      line2: 'The Lohiya Family'
    },

    // ---------- share ----------
    share: {
      title: 'Riya & Akshay | Wedding Invitation',
      // TODO: confirm this share message (not given in brief)
      text: 'You are warmly invited to the wedding of Riya & Akshay, 20\u201321 November 2026, Maheshwari Bhawan, Ratanada, Jodhpur.'
    },

    // ---------- buttons / UI labels ----------
    ui: {
      openMaps: 'Open in Google Maps',
      getDirections: 'Get directions',
      addToCalendar: 'Add to calendar',
      shareInvitation: 'Share this invitation',
      backToAll: 'Back to all functions',
      previous: 'Previous',
      next: 'Next',
      linkCopied: 'Link copied',
      copyFailed: 'Could not copy the link',
      googleCalendar: 'Google Calendar',
      downloadIcs: 'Download .ics file',
      allInOne: 'All four events in one file',
      close: 'Close'
    },

    // ---------- routing (hash) ----------
    routes: {
      home: '#/',
      haldi: '#/haldi',
      sangeet: '#/sangeet',
      mayra: '#/mayra',
      reception: '#/reception'
    },

    // ---------- layout ----------
    layout: {
      maxWidthPx: 480,
      desktopBackdrop: A + '02_courtyard/02_cover_jodhpur.jpg.png'
    },

    // ---------- shared asset paths ----------
    assets: {
      textures: {
        goldFoil: A + '11_textures/11_gold_foil.jpg.png',
        paper: A + '11_textures/11_paper.jpg.png',
        stone: A + '11_textures/11_stone.jpg.png',
        teak: A + '11_textures/11_teak.jpg.png'
      },
      // single sheets for now (to be cut into pieces later)
      ornaments: {
        animalsSheet: A + '09_ornaments/09_animals.png.png',
        bordersSheet: A + '09_ornaments/09_borders.png.png',
        objectsSheet: A + '09_ornaments/09_objects.png.png'
      },
      jodhpur: {
        landmarksSheet: A + '10_jodhpur/10_landmarks.png.png',
        map: A + '10_jodhpur/10_map.png.png',
        nightFort: A + '10_jodhpur/10_night_fort.png.png'
      }
    },

    // ---------- music: hidden, unused slot (no music yet) ----------
    music: { enabled: false, src: '' }
  };
})();