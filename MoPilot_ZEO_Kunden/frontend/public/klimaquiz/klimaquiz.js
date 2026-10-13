// Klimaquiz „Teste dein Wissen“ (portabel; Fassung für ZEO, vianova.coop, MoPilot) – drei Runden (Duell, Schätzen, Reihenfolge),
// ein Punktestand, Auflösung mit allen 19 Maßnahmen und eine Ergebniskarte.
// Datengrundlage: Wynes & Nicholas (2017), Environmental Research Letters.
// „So haben andere getippt“: K.statistik (z. B. quiz-statistik.php) zählt nur Summen auf dem eigenen Server –
// keine Cookies, keine Personendaten. Bestes Ergebnis merkt sich nur dieser Browser.
(function () {
  'use strict';
  var STANDARD = {
    name: 'Klimaquiz',          // erscheint beim Teilen
    statistik: null,            // URL für „So haben andere getippt“ (GET/POST), null = aus
    speicher: 'klimaquiz-bestes', // localStorage-Schlüssel für das beste Ergebnis
    knopf: 'q-btn',             // CSS-Klassen der Knöpfe (z. B. die der eigenen Seite)
    knopfRand: 'q-btn q-btn--rand',
    markeKurz: '',              // kurzes Etikett in der Auflösung, z. B. „ZEO“
    hinweise: {},               // { autofrei: 'Text', eauto: 'Text' } – hebt Maßnahmen hervor
    band: null,                 // Abschlussband: { titel, text (HTML), bild, knoepfe: [{ text, href }] }
    anker: ''                   // Sprungmarke für den geteilten Link (sonst id des Elements)
  };

  function starten(wurzel, konfig) {
  if (!wurzel || wurzel.getAttribute('data-klimaquiz-laeuft')) { return; }
  wurzel.setAttribute('data-klimaquiz-laeuft', '1');
  var K = {}, k;
  for (k in STANDARD) { K[k] = STANDARD[k]; }
  for (k in (konfig || {})) { K[k] = konfig[k]; }

  var KAT = {
    mob: { name: 'Mobilität', farbe: 'var(--q-mob)' },
    ene: { name: 'Energie & Wohnen', farbe: 'var(--q-ene)' },
    ern: { name: 'Ernährung', farbe: 'var(--q-ern)' },
    kon: { name: 'Konsum & Alltag', farbe: 'var(--q-kon)' }
  };
  // kg CO₂-Äquivalent, die eine Person in einem Industrieland pro Jahr einspart
  var M = {
    autofrei: { t: 'Autofrei leben', w: 2400, k: 'mob', e: '🚶' },
    flug: { t: 'Einen Transatlantikflug vermeiden', w: 1600, k: 'mob', e: '✈️' },
    oeko: { t: 'Ökostrom beziehen', w: 1300, k: 'ene', e: '⚡' },
    eauto: { t: 'Auf ein E-Auto umsteigen', w: 1200, k: 'mob', e: '🔌' },
    effizient: { t: 'Ein effizienteres Auto kaufen', w: 1200, k: 'mob', e: '🚗' },
    vegan: { t: 'Pflanzliche Ernährung', w: 800, k: 'ern', e: '🥗' },
    hybrid: { t: 'Auf ein Hybrid-Auto umsteigen', w: 400, k: 'mob', e: '🚙' },
    abfall: { t: 'Lebensmittelabfälle vermeiden', w: 370, k: 'ern', e: '🍽️' },
    kalt: { t: 'Wäsche kalt waschen', w: 240, k: 'ene', e: '🧺' },
    fleisch: { t: 'Weniger Fleisch essen', w: 230, k: 'ern', e: '🥩' },
    sparen: { t: 'Energie sparen im Haushalt', w: 210, k: 'ene', e: '🔋' },
    recyceln: { t: 'Konsequent recyceln', w: 210, k: 'kon', e: '♻️' },
    luft: { t: 'Wäsche an der Luft trocknen', w: 210, k: 'ene', e: '👕' },
    heizen: { t: 'Heiz- und Kühleffizienz', w: 180, k: 'ene', e: '🏠' },
    regional: { t: 'Regional essen', w: 180, k: 'ern', e: '🥕' },
    thermostat: { t: 'Smart-Thermostat einbauen', w: 180, k: 'ene', e: '🎛️' },
    led: { t: 'Glühbirnen gegen LEDs tauschen', w: 100, k: 'ene', e: '💡' },
    baum: { t: 'Einen Baum pflanzen', w: 30, k: 'kon', e: '🌳' },
    tasche: { t: 'Einkaufstasche wiederverwenden', w: 5, k: 'kon', e: '🛍️' }
  };
  var ALLE = Object.keys(M).map(function (id) { var m = M[id]; m.id = id; return m; })
    .sort(function (a, b) { return b.w - a.w; });
  Object.keys(K.hinweise || {}).forEach(function (id) { if (M[id]) { M[id].zeo = K.hinweise[id]; } });

  // Feste Fragen, damit „So haben andere getippt“ vergleichbar bleibt
  var DUELLE = [['led', 'oeko'], ['baum', 'abfall'], ['recyceln', 'vegan'], ['hybrid', 'eauto'], ['flug', 'autofrei']];
  var SCHAETZEN = [
    { id: 'autofrei', frage: 'Wie viel CO₂ spart ein Jahr ganz ohne eigenes Auto?' },
    { id: 'led', frage: 'Und wie viel spart es, alle Glühbirnen gegen LEDs zu tauschen?' }
  ];
  var REIHE = ['autofrei', 'oeko', 'vegan', 'kalt', 'baum'];
  var MAX = DUELLE.length + SCHAETZEN.length * 3 + REIHE.length;
  var MIN_STAT = 20;   // erst ab so vielen Spielen zeigen wir „So haben andere getippt“

  var ruhig = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var stat = null;
  var spiel;

  function zahl(n) { return Math.round(n).toLocaleString('de-DE'); }
  function prozent(a, b) { return Math.round(100 * a / b); }
  function sicher(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function mischen(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function el(html) { var d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }
  function hochzaehlen(e, ziel, dauer) {
    if (ruhig) { e.textContent = zahl(ziel); return; }
    var start = null; dauer = dauer || 900;
    function schritt(t) {
      if (!start) { start = t; }
      var f = Math.min(1, (t - start) / dauer);
      e.textContent = zahl(ziel * (1 - Math.pow(1 - f, 3)));
      if (f < 1) { requestAnimationFrame(schritt); }
    }
    requestAnimationFrame(schritt);
  }
  // Auflösung ins Bild holen (vor allem am Handy, wo sie unter den Karten liegt)
  function zeigenLassen(e) {
    setTimeout(function () { var r = e.getBoundingClientRect(); if (r.bottom > window.innerHeight - 70) { e.scrollIntoView({ behavior: ruhig ? 'auto' : 'smooth', block: 'end' }); } }, 120);
  }
  function ansagen(text) { var a = wurzel.querySelector('.q-ansage'); if (a) { a.textContent = text; } }

  // ---- Statistik (nur Summen) ----
  function statLaden() {
    if (!window.fetch || !K.statistik) { return; }
    fetch(K.statistik, { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { if (d && typeof d.n === 'number') { stat = d; } }).catch(function () {});
  }
  function statSenden() {
    if (!window.fetch || !K.statistik) { return; }
    var daten = { d: spiel.duell, s: spiel.schaetz, r: spiel.reihe };
    fetch(K.statistik, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(daten) })
      .catch(function () {});
  }
  function statDa() { return stat && stat.n >= MIN_STAT; }

  // ---- Grundgerüst ----
  var SCHRITTE = ['Duell', 'Schätzen', 'Reihenfolge', 'Ergebnis'];
  function geruest(schritt) {
    var s = SCHRITTE.map(function (n, i) {
      return '<li class="' + (i < schritt ? 'fertig' : i === schritt ? 'jetzt' : '') + '"' + (i === schritt ? ' aria-current="step"' : '') + '><span>' + (i + 1) + '</span>' + n + '</li>';
    }).join('');
    wurzel.innerHTML = '<div class="q-karte">'
      + '<div class="q-kopf"><ol class="q-schritte" aria-label="Fortschritt">' + s + '</ol>'
      + '<p class="q-punkte" aria-live="off"><span class="q-punkte-zahl">' + spiel.punkte + '</span> / ' + MAX + ' Punkte</p></div>'
      + '<div class="q-buehne"></div><p class="q-ansage" aria-live="polite"></p></div>';
    return wurzel.querySelector('.q-buehne');
  }
  function punkteDazu(n) {
    spiel.punkte += n;
    var e = wurzel.querySelector('.q-punkte-zahl');
    if (e) {
      e.textContent = spiel.punkte;
      if (n > 0 && !ruhig) { e.parentNode.classList.remove('q-plopp'); void e.offsetWidth; e.parentNode.classList.add('q-plopp'); }
    }
  }
  function nachOben() {
    var r = wurzel.getBoundingClientRect();
    if (r.top < 0 || r.top > window.innerHeight * 0.4) { wurzel.scrollIntoView({ behavior: ruhig ? 'auto' : 'smooth', block: 'start' }); }
  }

  // ---- Start ----
  function start() {
    var bestes = null;
    try { bestes = localStorage.getItem(K.speicher); } catch (e) { /* ohne Speicher */ }
    wurzel.innerHTML = '<div class="q-karte q-start">'
      + '<div class="q-start-bild" aria-hidden="true"><span>🚶</span><span>⚡</span><span>🥗</span><span>💡</span><span>🌳</span></div>'
      + '<h3>Was spart wirklich CO₂?</h3>'
      + '<p>Drei kurze Runden: zwei Maßnahmen im Duell, zwei Mal schätzen und fünf Maßnahmen in die richtige Reihenfolge bringen. Dauer: etwa drei Minuten.</p>'
      + (bestes ? '<p class="q-bestes">Ihr bestes Ergebnis bisher: <strong>' + sicher(bestes) + ' von ' + MAX + ' Punkten</strong></p>' : '')
      + '<p><button type="button" class="' + K.knopf + ' q-los">Los geht’s</button></p></div>';
    wurzel.querySelector('.q-los').addEventListener('click', function () {
      spiel = { punkte: 0, duell: [], schaetz: [], reihe: [] };
      duell(0);
      nachOben();
    });
  }

  // ---- Runde 1: Duell ----
  function karte(m, seite) {
    return '<button type="button" class="q-kandidat" data-seite="' + seite + '">'
      + '<span class="q-emo" aria-hidden="true">' + m.e + '</span>'
      + '<span class="q-name">' + sicher(m.t) + '</span>'
      + '<span class="q-bereich"><i style="background:' + KAT[m.k].farbe + '"></i>' + KAT[m.k].name + '</span>'
      + '<span class="q-wert"><strong data-ziel="' + m.w + '">0</strong> kg CO₂ im Jahr'
      + '<span class="q-gleis"><span class="q-balken" style="background:' + KAT[m.k].farbe + '"></span></span></span>'
      + '</button>';
  }
  function duell(i) {
    var b = geruest(0);
    var paar = DUELLE[i], ab = Math.random() < 0.5 ? paar : [paar[1], paar[0]];
    var A = M[ab[0]], B = M[ab[1]];
    b.innerHTML = '<p class="q-runde">Runde 1 · Duell ' + (i + 1) + ' von ' + DUELLE.length + '</p>'
      + '<h3 class="q-frage">Was spart mehr CO₂?</h3>'
      + '<div class="q-duell">' + karte(A, 0) + '<span class="q-vs" aria-hidden="true">oder</span>' + karte(B, 1) + '</div>'
      + '<div class="q-aufloesung" hidden></div>';
    var knoepfe = b.querySelectorAll('.q-kandidat');
    Array.prototype.forEach.call(knoepfe, function (k) {
      k.addEventListener('click', function () {
        if (b.dataset.fertig) { return; }
        b.dataset.fertig = '1';
        var wahl = +k.dataset.seite === 0 ? A : B, andere = wahl === A ? B : A;
        var richtig = wahl.w > andere.w;
        spiel.duell.push(richtig ? 1 : 0);
        var max = Math.max(A.w, B.w);
        Array.prototype.forEach.call(knoepfe, function (kk) {
          var m = +kk.dataset.seite === 0 ? A : B;
          kk.disabled = true;
          kk.classList.add('offen', m.w === max ? 'gewinner' : 'verlierer');
          if (kk === k) { kk.classList.add('gewaehlt'); }
          hochzaehlen(kk.querySelector('[data-ziel]'), m.w);
          var bal = kk.querySelector('.q-balken');
          requestAnimationFrame(function () { bal.style.width = Math.max(2, 100 * m.w / max) + '%'; });
        });
        var g = Math.max(A.w, B.w), kl = Math.min(A.w, B.w), f = g / kl;
        var fakt = f < 1.8 ? 'etwa das ' + f.toFixed(1).replace('.', ',') + '-Fache' : 'rund das ' + Math.round(f) + '-Fache';
        var sieger = A.w > B.w ? A : B;
        var andereTxt = '';
        if (statDa() && stat.duell && stat.duell[i]) {
          var s = stat.duell[i];
          if (s[1] > 0) { andereTxt = '<p class="q-andere">' + prozent(s[0], s[1]) + ' % der Besucher lagen hier richtig.</p>'; }
        }
        var a = b.querySelector('.q-aufloesung');
        a.hidden = false;
        a.innerHTML = '<p class="q-urteil ' + (richtig ? 'q-gut' : 'q-schlecht') + '">' + (richtig ? '✓ Richtig!' : '✗ Knapp daneben.') + '</p>'
          + '<p>„' + sicher(sieger.t) + '“ spart ' + fakt + '.' + (sieger.zeo ? ' <span class="q-hinweis">' + sicher(sieger.zeo) + '</span>' : '') + '</p>'
          + andereTxt
          + '<p><button type="button" class="' + K.knopf + ' q-weiter">' + (i + 1 < DUELLE.length ? 'Nächstes Duell' : 'Weiter zu Runde 2') + '</button></p>';
        if (richtig) { punkteDazu(1); }
        ansagen((richtig ? 'Richtig. ' : 'Falsch. ') + sieger.t + ' spart ' + zahl(sieger.w) + ' Kilogramm.');
        a.querySelector('.q-weiter').addEventListener('click', function () {
          if (i + 1 < DUELLE.length) { duell(i + 1); } else { schaetzen(0); }
          nachOben();
        });
        a.querySelector('.q-weiter').focus({ preventScroll: true });
        zeigenLassen(a);
      });
    });
  }

  // ---- Runde 2: Schätzen (logarithmischer Regler 5 … 4.000 kg) ----
  var LOG_MIN = Math.log(5), LOG_MAX = Math.log(4000);
  function reglerZuKg(v) {
    var kg = Math.exp(LOG_MIN + (LOG_MAX - LOG_MIN) * v / 1000);
    var stufe = kg < 50 ? 5 : kg < 500 ? 10 : 50;
    return Math.max(5, Math.round(kg / stufe) * stufe);
  }
  function kgZuProzent(kg) { return 100 * (Math.log(Math.max(5, kg)) - LOG_MIN) / (LOG_MAX - LOG_MIN); }
  function schaetzen(i) {
    var b = geruest(1);
    var aufgabe = SCHAETZEN[i], m = M[aufgabe.id];
    b.innerHTML = '<p class="q-runde">Runde 2 · Schätzfrage ' + (i + 1) + ' von ' + SCHAETZEN.length + '</p>'
      + '<h3 class="q-frage">' + sicher(aufgabe.frage) + '</h3>'
      + '<div class="q-schaetz"><span class="q-emo gross" aria-hidden="true">' + m.e + '</span>'
      + '<p class="q-tipp"><output><strong>300</strong> kg CO₂ im Jahr</output></p>'
      + '<input type="range" min="0" max="1000" value="500" class="q-regler" aria-label="Ihre Schätzung in Kilogramm CO₂ pro Jahr">'
      + '<div class="q-skala" aria-hidden="true"><span>5 kg</span><span>50 kg</span><span>500 kg</span><span>4.000 kg</span></div>'
      + '<div class="q-zielspur" aria-hidden="true"><span class="q-marke q-marke-tipp"></span><span class="q-marke q-marke-echt"></span></div>'
      + '<p><button type="button" class="' + K.knopf + ' q-pruefen">Schätzung prüfen</button></p></div>'
      + '<div class="q-aufloesung" hidden></div>';
    var regler = b.querySelector('.q-regler'), aus = b.querySelector('.q-tipp strong');
    function zeigen() { aus.textContent = zahl(reglerZuKg(+regler.value)); }
    regler.addEventListener('input', zeigen);
    zeigen();
    b.querySelector('.q-pruefen').addEventListener('click', function () {
      var tipp = reglerZuKg(+regler.value);
      regler.disabled = true;
      this.remove();
      var r = Math.max(tipp, m.w) / Math.min(tipp, m.w);
      var p = r <= 1.25 ? 3 : r <= 1.6 ? 2 : r <= 2.5 ? 1 : 0;
      spiel.schaetz.push(tipp);
      var spur = b.querySelector('.q-zielspur');
      spur.classList.add('offen');
      spur.querySelector('.q-marke-tipp').style.left = kgZuProzent(tipp) + '%';
      var echt = spur.querySelector('.q-marke-echt');
      echt.style.left = kgZuProzent(tipp) + '%';
      requestAnimationFrame(function () { requestAnimationFrame(function () { echt.style.left = kgZuProzent(m.w) + '%'; }); });
      var urteil = ['Weit daneben – das überrascht die meisten.', 'Grob in der Nähe.', 'Gut geschätzt!', 'Volltreffer!'][p];
      var andereTxt = '';
      if (statDa() && stat.schaetz && stat.schaetz[i] && stat.schaetz[i].n > 0) {
        andereTxt = '<p class="q-andere">Im Schnitt tippen Besucher rund ' + zahl(Math.exp(stat.schaetz[i].log / stat.schaetz[i].n)) + ' kg.</p>';
      }
      var a = b.querySelector('.q-aufloesung');
      a.hidden = false;
      a.innerHTML = '<p class="q-urteil ' + (p >= 2 ? 'q-gut' : p === 1 ? 'q-mittel' : 'q-schlecht') + '">' + urteil + (p ? ' +' + p + (p === 1 ? ' Punkt' : ' Punkte') : '') + '</p>'
        + '<p>Ihr Tipp: ' + zahl(tipp) + ' kg · Richtig: <strong class="q-echt-zahl">0</strong> kg CO₂ im Jahr.'
        + (m.zeo ? ' <span class="q-hinweis">' + sicher(m.zeo) + '</span>' : '') + '</p>'
        + andereTxt
        + '<p><button type="button" class="' + K.knopf + ' q-weiter">' + (i + 1 < SCHAETZEN.length ? 'Nächste Schätzfrage' : 'Weiter zu Runde 3') + '</button></p>';
      hochzaehlen(a.querySelector('.q-echt-zahl'), m.w);
      punkteDazu(p);
      ansagen(urteil + ' Richtig sind ' + zahl(m.w) + ' Kilogramm.');
      a.querySelector('.q-weiter').addEventListener('click', function () {
        if (i + 1 < SCHAETZEN.length) { schaetzen(i + 1); } else { reihe(); }
        nachOben();
      });
      a.querySelector('.q-weiter').focus({ preventScroll: true });
        zeigenLassen(a);
    });
  }

  // ---- Runde 3: Reihenfolge ----
  function reihe() {
    var b = geruest(2);
    var liste = mischen(REIHE);
    while (liste.join() === REIHE.join()) { liste = mischen(REIHE); }
    b.innerHTML = '<p class="q-runde">Runde 3 · Reihenfolge</p>'
      + '<h3 class="q-frage">Ordnen Sie: Was spart am meisten – was am wenigsten?</h3>'
      + '<p class="klein">Mit den Pfeilen nach oben oder unten schieben. Oben steht die wirksamste Maßnahme.</p>'
      + '<ol class="q-reihe"></ol>'
      + '<p><button type="button" class="' + K.knopf + ' q-pruefen">Reihenfolge prüfen</button></p>'
      + '<div class="q-aufloesung" hidden></div>';
    var ol = b.querySelector('.q-reihe');
    function zeichnen(fokus) {
      ol.innerHTML = liste.map(function (id, i) {
        var m = M[id];
        return '<li data-id="' + id + '"><span class="q-platz">' + (i + 1) + '</span><span class="q-emo" aria-hidden="true">' + m.e + '</span>'
          + '<span class="q-name">' + sicher(m.t) + '</span><span class="q-wert-klein" hidden></span>'
          + '<span class="q-pfeile"><button type="button" data-r="-1" aria-label="' + sicher(m.t) + ' nach oben"' + (i === 0 ? ' disabled' : '') + '>▲</button>'
          + '<button type="button" data-r="1" aria-label="' + sicher(m.t) + ' nach unten"' + (i === liste.length - 1 ? ' disabled' : '') + '>▼</button></span></li>';
      }).join('');
      if (fokus) { var f = ol.querySelector('li[data-id="' + fokus[0] + '"] button[data-r="' + fokus[1] + '"]'); if (f && !f.disabled) { f.focus(); } else if (f) { ol.querySelector('li[data-id="' + fokus[0] + '"] button:not([disabled])').focus(); } }
    }
    ol.addEventListener('click', function (e) {
      var k = e.target.closest('button[data-r]');
      if (!k || b.dataset.fertig) { return; }
      var id = k.closest('li').dataset.id, i = liste.indexOf(id), j = i + (+k.dataset.r);
      if (j < 0 || j >= liste.length) { return; }
      liste[i] = liste[j]; liste[j] = id;
      zeichnen([id, k.dataset.r]);
      ansagen(M[id].t + ' jetzt auf Platz ' + (j + 1));
    });
    zeichnen();
    b.querySelector('.q-pruefen').addEventListener('click', function () {
      b.dataset.fertig = '1';
      this.remove();
      var treffer = 0;
      spiel.reihe = liste.map(function (id, i) { var ok = REIHE[i] === id; if (ok) { treffer++; } return ok ? 1 : 0; });
      Array.prototype.forEach.call(ol.querySelectorAll('li'), function (li, i) {
        var id = li.dataset.id, ok = REIHE[i] === id;
        li.classList.add(ok ? 'q-ok' : 'q-falsch');
        li.querySelector('.q-pfeile').remove();
        var w = li.querySelector('.q-wert-klein');
        w.hidden = false;
        w.innerHTML = zahl(M[id].w) + ' kg' + (ok ? '' : ' · richtig: Platz ' + (REIHE.indexOf(id) + 1));
      });
      var andereTxt = '';
      if (statDa() && stat.reihe && stat.n > 0) {
        andereTxt = '<p class="q-andere">Platz 1 hatten ' + prozent(stat.reihe[0], stat.n) + ' % der Besucher richtig.</p>';
      }
      var a = b.querySelector('.q-aufloesung');
      a.hidden = false;
      a.innerHTML = '<p class="q-urteil ' + (treffer >= 4 ? 'q-gut' : treffer >= 2 ? 'q-mittel' : 'q-schlecht') + '">' + treffer + ' von ' + REIHE.length + ' Plätzen richtig' + (treffer ? ' · +' + treffer + (treffer === 1 ? ' Punkt' : ' Punkte') : '') + '</p>'
        + '<p>Richtig ist: ' + REIHE.map(function (id) { return sicher(M[id].t); }).join(' › ') + '.</p>'
        + andereTxt
        + '<p><button type="button" class="' + K.knopf + ' q-weiter">Zum Ergebnis</button></p>';
      punkteDazu(treffer);
      ansagen(treffer + ' von 5 Plätzen richtig.');
      a.querySelector('.q-weiter').addEventListener('click', function () { ergebnis(); nachOben(); });
      a.querySelector('.q-weiter').focus({ preventScroll: true });
        zeigenLassen(a);
    });
  }

  // ---- Ergebnis und Auflösung ----
  function band() {
    var B = K.band;
    if (!B) { return ''; }
    var kn = (B.knoepfe || []).map(function (x, i) {
      return '<a class="' + K.knopf + ' ' + (i === 0 ? 'q-btn-hell' : 'q-btn-rand-hell') + '" href="' + sicher(x.href) + '">' + sicher(x.text) + '</a>';
    }).join('');
    return '<div class="q-band' + (B.bild ? '' : ' q-band--ohne-bild') + '">'
      + (B.bild ? '<img src="' + sicher(B.bild) + '" alt="" loading="lazy" onerror="this.remove()">' : '')
      + '<div><h3>' + sicher(B.titel || '') + '</h3><p>' + (B.text || '') + '</p>'
      + (kn ? '<p class="q-knoepfe">' + kn + '</p>' : '') + '</div></div>';
  }
  function ergebnis() {
    var b = geruest(3);
    statSenden();
    var p = spiel.punkte, anteil = p / MAX;
    var titel = anteil >= 0.8 ? 'Klima-Profi!' : anteil >= 0.5 ? 'Gut geschätzt!' : 'Überrascht? Den meisten geht es so.';
    var bestes = 0;
    try { bestes = +(localStorage.getItem(K.speicher) || 0); if (p > bestes) { localStorage.setItem(K.speicher, String(p)); } } catch (e) { /* ohne Speicher */ }
    var umfang = 2 * Math.PI * 52;
    var zeilen = ALLE.map(function (m) {
      return '<li class="' + (m.zeo ? 'q-hervor' : '') + '"><span class="q-l-name"><span aria-hidden="true">' + m.e + '</span> ' + sicher(m.t)
        + (m.zeo && K.markeKurz ? ' <em>' + sicher(K.markeKurz) + '</em>' : '') + '</span>'
        + '<span class="q-l-gleis"><span class="q-l-balken" style="background:' + KAT[m.k].farbe + '" data-breite="' + Math.max(0.6, 100 * m.w / 2400) + '"></span></span>'
        + '<span class="q-l-wert">' + zahl(m.w) + ' kg</span></li>';
    }).join('');
    var legende = Object.keys(KAT).map(function (k) { return '<span><i style="background:' + KAT[k].farbe + '"></i>' + KAT[k].name + '</span>'; }).join('');
    b.innerHTML = '<div class="q-ergebnis">'
      + '<div class="q-ring"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52" class="q-ring-grund"/>'
      + '<circle cx="60" cy="60" r="52" class="q-ring-wert" stroke-dasharray="' + umfang.toFixed(1) + '" stroke-dashoffset="' + umfang.toFixed(1) + '"/></svg>'
      + '<p><strong class="q-end-zahl">0</strong><span>von ' + MAX + '</span></p></div>'
      + '<div><h3>' + titel + '</h3>'
      + '<p>Die großen Hebel sind das Auto, das Fliegen, der Strom und der Teller. <strong>Autofrei leben spart rund 2,4 Tonnen CO₂ im Jahr</strong> – so viel wie fast alle kleinen Maßnahmen zusammen.</p>'
      + (bestes && bestes >= p ? '<p class="klein">Ihr bestes Ergebnis: ' + bestes + ' Punkte.</p>' : (bestes ? '<p class="klein">Neuer Rekord! Vorher: ' + bestes + ' Punkte.</p>' : ''))
      + '<p class="q-knoepfe"><button type="button" class="' + K.knopfRand + ' q-teilen">Ergebnis teilen</button><button type="button" class="' + K.knopfRand + ' q-neu">Noch einmal spielen</button></p></div></div>'
      + band()
      + '<h3 class="q-liste-titel">Alle 19 Maßnahmen im Vergleich</h3><p class="klein">kg CO₂-Äquivalent, die eine Person in einem Industrieland pro Jahr einspart.</p>'
      + '<p class="q-legende">' + legende + '</p><ol class="q-liste">' + zeilen + '</ol>'
      + '<details class="q-quelle"><summary>Zur Datengrundlage</summary><ul>'
      + '<li>Quelle: Seth Wynes &amp; Kimberly A. Nicholas, <em>The climate mitigation gap</em>, Environmental Research Letters 12 (2017) 074024. Die Werte sind Mittelwerte für Industrieländer – im Einzelfall können sie deutlich abweichen.</li>'
      + '<li>Für Ökostrom nennt die Studie eine große Spanne: von unter 0,1 bis 2,5 Tonnen pro Jahr.</li>'
      + '<li>Der größte Wert der Studie – „ein Kind weniger“ – ist bewusst nicht enthalten; die Rechenmethode ist umstritten.</li>'
      + '<li>Der deutsche Strommix ist seit 2017 deutlich sauberer geworden. Das senkt den Wert für Ökostrom und vergrößert tendenziell den Vorteil des E-Autos.</li>'
      + '</ul></details>';
    hochzaehlen(b.querySelector('.q-end-zahl'), p, 1100);
    var ring = b.querySelector('.q-ring-wert');
    requestAnimationFrame(function () { requestAnimationFrame(function () { ring.style.strokeDashoffset = (umfang * (1 - anteil)).toFixed(1); }); });
    var balken = b.querySelectorAll('.q-l-balken');
    function fuellen() { Array.prototype.forEach.call(balken, function (x, i) { setTimeout(function () { x.style.width = x.dataset.breite + '%'; }, ruhig ? 0 : i * 45); }); }
    if ('IntersectionObserver' in window && !ruhig) {
      var io = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { fuellen(); io.disconnect(); } }, { threshold: 0 });
      io.observe(b.querySelector('.q-liste'));
    } else { fuellen(); }
    ansagen('Ergebnis: ' + p + ' von ' + MAX + ' Punkten. ' + titel);
    b.querySelector('.q-neu').addEventListener('click', function () { start(); nachOben(); });
    b.querySelector('.q-teilen').addEventListener('click', function () {
      var text = 'Ich habe beim ' + K.name + ' ' + p + ' von ' + MAX + ' Punkten geholt. Was spart wirklich CO₂? Testen Sie Ihr Wissen:';
      var anker = K.anker || wurzel.id;
      var url = location.href.split('#')[0] + (anker ? '#' + anker : '');
      var knopf = this;
      if (navigator.share) {
        navigator.share({ title: K.name, text: text, url: url }).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(text + ' ' + url).then(function () { knopf.textContent = 'Text kopiert ✓'; }, function () {});
      }
    });
  }

  statLaden();
  start();
  }

  window.Klimaquiz = { starten: starten };
  function automatisch() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-klimaquiz]'), function (e) { starten(e, window.KLIMAQUIZ_KONFIG); });
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', automatisch); } else { automatisch(); }
})();
