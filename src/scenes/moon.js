/* scenes/moon.js - painted backgrounds for the Moon's south pole (Moon Market, a game forecast for 2041).
   PAINT.moon: the rim of Shackleton Crater in the long, low sunlight of the lunar south pole. The Sun skims the
   horizon on the left (white, with no air to redden it), so every hill, dome and solar mast throws a shadow many
   times its own height to the right. The sky is black, because the Moon has no air to scatter light. Earth hangs low
   over the mountains on the right, lit from the same side as everything else. Below the rim, the crater floor never
   sees the Sun; the lights down there are ice-mining robots. The market dome and the habitats sit on the left; the
   Copy Works, the self-copying robot factory with its treaty copy counter, stands on the far rim at the right.
   PAINT.moon_night: the same view after the Sun has slipped behind the hills. Earthlight tints the ground blue-grey,
   the windows glow, the highest peaks still catch the Sun, and the stars come out.
   Utilities are copied from the header of src/paint_boston.js (docs/MISSIONS.md), so this file paints on its own.
   Everything is seeded, so a scene paints identically every time. */
(function () {
  'use strict';
  var PAINT = (window.PAINT = window.PAINT || {});
  var PI = Math.PI, TAU = PI * 2;
  /* ============================== utilities ============================== */
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hash(i, s) {
    var x = Math.imul((i | 0) ^ Math.imul(s | 0, 0x9E3779B1), 0x27d4eb2d);
    x ^= x >>> 15; x = Math.imul(x, 0x85ebca6b); x ^= x >>> 13; x = Math.imul(x, 0xc2b2ae35); x ^= x >>> 16;
    return (x >>> 0) / 4294967296;
  }
  function vnoise(x, s) { var i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return hash(i, s) * (1 - u) + hash(i + 1, s) * u; }
  function fbm(x, s, oct) { var v = 0, a = 0.5, fr = 1, n = 0, o; for (o = 0; o < (oct || 5); o++) { v += a * vnoise(x * fr, s + o * 131); n += a; a *= 0.5; fr *= 2.07; } return v / n; }
  function h2(ix, iy, s) { return hash(Math.imul(ix | 0, 0x1B873593) ^ Math.imul(iy | 0, 0x5BD1E995), s); }
  function vn2(x, y, s) {
    var ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
    var a = h2(ix, iy, s), b = h2(ix + 1, iy, s), c = h2(ix, iy + 1, s), d = h2(ix + 1, iy + 1, s);
    return (a + (b - a) * ux) * (1 - uy) + (c + (d - c) * ux) * uy;
  }
  function fbm2(x, y, s, oct) { var v = 0, a = 0.5, fr = 1, n = 0, o; for (o = 0; o < (oct || 4); o++) { v += a * vn2(x * fr, y * fr, s + o * 71); n += a; a *= 0.5; fr *= 2.03; } return v / n; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  var HX = {};
  function hex(c) { var v = HX[c]; if (v) return v; var d = c.replace('#', ''); v = [parseInt(d.substr(0, 2), 16), parseInt(d.substr(2, 2), 16), parseInt(d.substr(4, 2), 16)]; HX[c] = v; return v; }
  function h2s(v) { v = clamp(Math.round(v), 0, 255); return (v < 16 ? '0' : '') + v.toString(16); }
  function mix(c1, c2, t) { var a = hex(c1), b = hex(c2); return '#' + h2s(lerp(a[0], b[0], t)) + h2s(lerp(a[1], b[1], t)) + h2s(lerp(a[2], b[2], t)); }
  function rgba(c, al) { var a = hex(c); return 'rgba(' + a[0] + ',' + a[1] + ',' + a[2] + ',' + (+al).toFixed(3) + ')'; }
  function lg(ctx, x0, y0, x1, y1, st) { var g = ctx.createLinearGradient(x0, y0, x1, y1); for (var i = 0; i < st.length; i++) g.addColorStop(st[i][0], st[i][1]); return g; }
  function rg(ctx, x, y, r0, r1, st) { var g = ctx.createRadialGradient(x, y, r0, x, y, Math.max(r0 + 0.1, r1)); for (var i = 0; i < st.length; i++) g.addColorStop(st[i][0], st[i][1]); return g; }
  function mk(cw, ch) { if (typeof document === 'undefined') return null; var c = document.createElement('canvas'); c.width = Math.max(1, cw | 0); c.height = Math.max(1, ch | 0); return c; }
  function S(w, h) { return Math.max(0.5, Math.min(w / 390, h / 640)); }
  function memo(fn) { var key = null, val = null; return function (w, h) { var k = w + 'x' + h; if (k !== key) { key = k; val = fn(w, h); } return val; }; }
  function rrect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  }
  function glow(ctx, x, y, r, col, a) { ctx.fillStyle = rg(ctx, x, y, 0, r, [[0, rgba(col, a)], [0.35, rgba(col, a * 0.35)], [1, rgba(col, 0)]]); ctx.fillRect(x - r, y - r, r * 2, r * 2); }
  function haze(ctx, x0, y0, x1, y1, col, a) {
    var cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, rx = (x1 - x0) / 2, ry = Math.max(1, (y1 - y0) / 2);
    ctx.save(); ctx.translate(cx, cy); ctx.scale(1, ry / rx);
    ctx.fillStyle = rg(ctx, 0, 0, 0, rx, [[0, rgba(col, a)], [0.6, rgba(col, a * 0.75)], [1, rgba(col, 0)]]);
    ctx.fillRect(-rx, -rx, rx * 2, rx * 2); ctx.restore();
  }
  var QK = 0.914;
  function qcirc(ctx, x, y, r) {
    if (r < 1.1) { ctx.rect(x - r, y - r, r * 2, r * 2); return; }
    var c = r * QK;
    ctx.moveTo(x + r, y); ctx.quadraticCurveTo(x + c, y + c, x, y + r); ctx.quadraticCurveTo(x - c, y + c, x - r, y);
    ctx.quadraticCurveTo(x - c, y - c, x, y - r); ctx.quadraticCurveTo(x + c, y - c, x + r, y);
  }
  function qell(ctx, x, y, rx, ry, a) {
    var ca = Math.cos(a || 0), sa = Math.sin(a || 0), k = QK;
    function X(u, v) { return x + u * ca - v * sa; } function Y(u, v) { return y + u * sa + v * ca; }
    ctx.moveTo(X(rx, 0), Y(rx, 0));
    ctx.quadraticCurveTo(X(rx * k, ry * k), Y(rx * k, ry * k), X(0, ry), Y(0, ry));
    ctx.quadraticCurveTo(X(-rx * k, ry * k), Y(-rx * k, ry * k), X(-rx, 0), Y(-rx, 0));
    ctx.quadraticCurveTo(X(-rx * k, -ry * k), Y(-rx * k, -ry * k), X(0, -ry), Y(0, -ry));
    ctx.quadraticCurveTo(X(rx * k, -ry * k), Y(rx * k, -ry * k), X(rx, 0), Y(rx, 0));
  }
  function dots(ctx, n, cols, gen) {
    var i, k, b = []; for (k = 0; k < cols.length; k++) b.push([]);
    for (i = 0; i < n; i++) { var d = gen(i); if (d) b[d[3]].push(d); }
    ctx.save();
    for (k = 0; k < cols.length; k++) { if (!b[k].length) continue; ctx.fillStyle = cols[k][0]; ctx.globalAlpha = cols[k][1]; ctx.beginPath(); for (i = 0; i < b[k].length; i++) { var q = b[k][i]; qcirc(ctx, q[0], q[1], q[2]); } ctx.fill(); }
    ctx.restore();
  }
  function dabs(ctx, n, cols, gen) {
    var i, k, b = []; for (k = 0; k < cols.length; k++) b.push([]);
    for (i = 0; i < n; i++) { var d = gen(i); if (d) b[d[4]].push(d); }
    ctx.save();
    for (k = 0; k < cols.length; k++) { if (!b[k].length) continue; ctx.fillStyle = cols[k][0]; ctx.globalAlpha = cols[k][1]; ctx.beginPath(); for (i = 0; i < b[k].length; i++) { var q = b[k][i]; qell(ctx, q[0], q[1], q[2], q[3], q[5] || 0); } ctx.fill(); }
    ctx.restore();
  }
  var grainCv = null;
  function finish(ctx, w, h, gradeCol, gradeA, vig, grainA, vigCol, vy) {
    try {
      ctx.save();
      if (gradeCol) { ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = gradeA; ctx.fillStyle = gradeCol; ctx.fillRect(0, 0, w, h); }
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      var R = Math.max(w, h) * 0.75, vc = vigCol || '#07060d';
      if (vig > 0) { ctx.fillStyle = rg(ctx, w / 2, h * (vy || 0.42), R * 0.35, R, [[0, rgba(vc, 0)], [1, rgba(vc, vig)]]); ctx.fillRect(0, 0, w, h); }
      if (!grainCv && typeof document !== 'undefined') {
        grainCv = document.createElement('canvas'); grainCv.width = grainCv.height = 128;
        var g = grainCv.getContext('2d'), id = g.createImageData(128, 128), r = rng(4242), i, v;
        for (i = 0; i < 128 * 128; i++) { v = (r() * 255) | 0; id.data[i * 4] = v; id.data[i * 4 + 1] = v; id.data[i * 4 + 2] = v; id.data[i * 4 + 3] = 255; }
        g.putImageData(id, 0, 0);
      }
      if (grainCv && grainA > 0) { ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = grainA; ctx.fillStyle = ctx.createPattern(grainCv, 'repeat'); ctx.fillRect(0, 0, w, h); }
      ctx.restore();
    } catch (e) { try { ctx.restore(); } catch (e2) {} }
  }
  var SPR = {};
  function glowSpr(col, hard) {
    var key = col + (hard ? 'h' : '');
    if (SPR[key] !== undefined) return SPR[key];
    var c = mk(64, 64); if (c) { var g = c.getContext('2d'); g.fillStyle = rg(g, 32, 32, 0, 32, hard ? [[0, rgba('#ffffff', 1)], [0.12, rgba(col, 1)], [0.3, rgba(col, 0.35)], [1, rgba(col, 0)]] : [[0, rgba(col, 1)], [0.25, rgba(col, 0.55)], [1, rgba(col, 0)]]); g.fillRect(0, 0, 64, 64); }
    SPR[key] = c; return c;
  }

  /* ============================== palettes ============================== */
  // day: the Sun is up (white light, grazing from the left). night: earthlight only, plus the windows.
  var PAL = {
    day: { sky0: '#030308', sky1: '#08070f', lit: '#d9d3c6', lit2: '#a8a294', mid: '#6f6a61', dark: '#2c2a29', sh: '#0b0b10', fill: '#141824', far: ['#bdb8ad', '#8f8a80', '#55524d'], win: '#ffc261', grade: '#ffe8c8', gradeA: 0.08, vig: 0.45 },
    night: { sky0: '#020207', sky1: '#060812', lit: '#4a5266', lit2: '#384054', mid: '#262c3c', dark: '#171b27', sh: '#08090f', fill: '#0e1220', far: ['#5d6478', '#3e4458', '#262b3a'], win: '#ffb84a', grade: '#9fb2ff', gradeA: 0.1, vig: 0.5 }
  };

  /* ============================== layout ============================== */
  function moonL(w, h) {
    var s = S(w, h), r = rng(9001);
    var L = { s: s, w: w, h: h };
    L.sun = [w * 0.085, h * 0.292];                       // just over the left hills, at the edge of the frame
    L.earth = [w * 0.8, h * 0.245, 30 * s];                // low over the mountains on the right
    var PK = L.PK = [[0.0, 0.045, 0.12], [0.17, 0.03, 0.12], [0.36, 0.024, 0.1], [0.53, 0.045, 0.14], [0.69, 0.07, 0.15], [0.9, 0.05, 0.13], [1.06, 0.06, 0.12]];
    L.far = function (x) { var u = x / w, m = 0; for (var k = 0; k < PK.length; k++) { var d = Math.abs(u - PK[k][0]) / PK[k][2]; if (d < 1) m = Math.max(m, PK[k][1] * Math.pow(1 - d, 1.4)); }
      return h * 0.338 - h * m - h * 0.012 * fbm(u * 8, 73, 4) - h * 0.004 * fbm(u * 40, 74, 2); };
    L.crater = { cx: w * 0.53, cy: h * 0.428, rx: w * 0.5, ry: h * 0.034 };  // the bowl that never sees the Sun
    L.rimY = function (x) { var u = x / w; return h * (0.45 + 0.01 * Math.sin(u * 3.3 + 1.2)) + h * 0.006 * fbm(u * 14, 91, 4); }; // our near rim
    L.sez = { hz: h * 0.345, solar: [0.02, 0.5], mineX: 0.48, mineY: h * 0.374, mineRx: 0.22, mineRy: h * 0.022, fac: [0.86, 0.372, 0.24], tower: [0.665, 0.062] };
    L.domes = [[0.05, 0.472, 30], [0.17, 0.466, 22], [0.115, 0.494, 15]];
    L.market = [w * 0.28, h * 0.488, 46 * s];               // the Market Dome (x, ground y, radius)
    L.masts = [[0.03, 0.456, 0.62], [0.11, 0.452, 0.54], [0.2, 0.456, 0.5], [0.42, 0.478, 0.66]];
    L.lander = [w * 0.8, h * 0.492];
    L.rovers = [[0.64, 0.52, 0.9, -1]];
    L.track = [[w * -0.05, h * 0.62], [w * 0.3, h * 0.545], [w * 0.62, h * 0.535], [w * 1.05, h * 0.5]];
    // boulders on the near plateau [x, y, size]
    L.rocks = [];
    for (var i = 0; i < 16; i++) { var p = Math.pow(r(), 1.2); L.rocks.push([r() * w, lerp(h * 0.5, h * 0.98, p), (2 + r() * 5 + p * 16) * s]); }
    L.rocks.push([w * 0.08, h * 0.83, 46 * s], [w * 0.94, h * 0.76, 34 * s], [w * 0.74, h * 0.93, 26 * s]);
    // small craters on the plateau [x, y, rx]
    L.pits = [];
    for (i = 0; i < 20; i++) { var q = Math.pow(r(), 1.3); L.pits.push([r() * w, lerp(h * 0.49, h * 0.99, q), (3 + r() * 8 + q * 30) * s]); }
    L.pits.push([w * 0.6, h * 0.68, 54 * s]);
    // crater-floor work lights (ice miners) and the lift line down the wall
    L.miners = []; for (i = 0; i < 9; i++) L.miners.push([w * (0.3 + r() * 0.5), h * (0.432 + r() * 0.014), r()]);
    L.lift = [[w * 0.47, h * 0.443], [w * 0.44, h * 0.448], [w * 0.4, h * 0.455]];
    L.stars = []; for (i = 0; i < 420; i++) L.stars.push([r() * w, Math.pow(r(), 1.3) * h * 0.33, r(), r()]);
    return L;
  }
  var moonLM = memo(moonL);

  /* ============================== painting ============================== */
  function sky(ctx, w, h, L, P, night) {
    ctx.fillStyle = lg(ctx, 0, 0, 0, h * 0.42, [[0, P.sky0], [1, P.sky1]]); ctx.fillRect(0, 0, w, h * 0.45);
    var s = L.s, st = L.stars, i;
    // stars: in sunlight only the brightest show; at night the whole sky fills in (they never twinkle: no air)
    var n = night ? st.length : 70;
    dots(ctx, n, [['#ffffff', night ? 0.85 : 0.5], ['#cfd8ff', night ? 0.6 : 0.3], ['#ffe6c8', night ? 0.55 : 0.25]], function (k) {
      var q = st[k]; if (!night && q[2] < 0.35) return null; var big = q[2] > 0.96; return [q[0], q[1], (big ? 1.1 : 0.45 + q[2] * 0.4) * s, (q[3] * 3) | 0];
    });
    if (night) { // a faint band of the Milky Way
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      var rr = rng(77);
      for (i = 0; i < 140; i++) { var u = rr(), x = lerp(-w * 0.1, w * 1.1, u), y = lerp(h * 0.02, h * 0.26, u) + (rr() - 0.5) * h * 0.07 * (0.4 + fbm(u * 6, 78, 3)), R = (14 + rr() * 40) * s; haze(ctx, x - R, y - R * 0.5, x + R, y + R * 0.5, rr() < 0.3 ? '#c8b8e8' : '#8a9ad0', 0.022); }
      dots(ctx, 500, [['#ffffff', 0.5]], function () { var u = rr(); return [lerp(-w * 0.1, w * 1.1, u) + (rr() - 0.5) * 30 * s, lerp(h * 0.02, h * 0.26, u) + (rr() - 0.5) * h * 0.06, 0.35 * s, 0]; });
      ctx.restore();
    }
  }
  function sunGlare(ctx, w, h, L) {
    var s = L.s, x = L.sun[0], y = L.sun[1];
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    // the zodiacal light: a faint, soft lean of sunlit dust that an airless sky lets you see
    ctx.save(); ctx.translate(x, y); ctx.rotate(-0.55); ctx.scale(1, 0.32); glow(ctx, w * 0.25, 0, w * 0.45, '#fff0dc', 0.06); ctx.restore();
    glow(ctx, x, y, 120 * s, '#fff6e8', 0.22); glow(ctx, x, y, 40 * s, '#ffffff', 0.9); glow(ctx, x, y, 14 * s, '#ffffff', 1);
    // short, thin glare spikes (light in the eye or the lens, not in the sky)
    for (var i = 0; i < 6; i++) { var a = i / 6 * PI - PI / 2 + 0.2, L2 = (i % 2 ? 40 : 80) * s; ctx.strokeStyle = lg(ctx, x, y, x + Math.cos(a) * L2, y + Math.sin(a) * L2, [[0, 'rgba(255,255,255,0.5)'], [1, 'rgba(255,255,255,0)']]); ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * L2, y + Math.sin(a) * L2); ctx.stroke(); }
    ctx.restore();
  }
  function earth(ctx, w, h, L, night) {
    var s = L.s, x = L.earth[0], y = L.earth[1], R = L.earth[2], r = rng(3301), i;
    ctx.save();
    glow(ctx, x, y, R * 2.4, '#7fb0ff', night ? 0.16 : 0.1);
    ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.clip();
    ctx.fillStyle = rg(ctx, x - R * 0.35, y - R * 0.2, R * 0.1, R * 1.2, [[0, '#3f8fe0'], [0.6, '#1f5fb0'], [1, '#0d2c63']]); ctx.fillRect(x - R, y - R, R * 2, R * 2);
    // land: Africa and Europe roll into view on the sunlit side (simple blobs, seeded)
    var land = [[-0.25, -0.35, 0.34, 0.2], [-0.05, 0.05, 0.3, 0.42], [-0.35, 0.2, 0.18, 0.25], [0.3, -0.45, 0.4, 0.18], [0.25, 0.4, 0.2, 0.14]];
    land.forEach(function (Q, k) {
      ctx.fillStyle = k === 1 ? '#c8a25a' : k === 3 ? '#8aa05a' : '#7f9a4e';
      ctx.beginPath();
      for (var a = 0; a <= 24; a++) { var t = a / 24 * TAU, rr = 1 + 0.35 * (fbm(t * 1.3 + k * 5, 3310 + k, 3) - 0.5); var px = x + (Q[0] + Math.cos(t) * Q[2] * rr) * R, py = y + (Q[1] + Math.sin(t) * Q[3] * rr) * R; if (!a) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
      ctx.closePath(); ctx.fill();
    });
    ctx.fillStyle = 'rgba(120,150,70,0.5)'; ctx.beginPath(); qell(ctx, x - R * 0.05, y + R * 0.12, R * 0.12, R * 0.08, 0.4); ctx.fill();
    // cloud swirls and the white polar cap
    ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineCap = 'round';
    for (i = 0; i < 16; i++) { var cy = y + (r() * 2 - 1) * R * 0.9, cx = x + (r() * 2 - 1) * R * 0.9, ln = (4 + r() * 10) * s; ctx.lineWidth = (0.8 + r() * 1.6) * s; ctx.beginPath(); ctx.moveTo(cx - ln, cy); ctx.quadraticCurveTo(cx, cy - ln * 0.35 * (r() - 0.5), cx + ln, cy + (r() - 0.5) * 3 * s); ctx.stroke(); }
    ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.beginPath(); qell(ctx, x, y + R * 0.98, R * 0.55, R * 0.2, 0); ctx.fill();
    // night side: the Sun is far to the left, so the right part of Earth is in darkness, with city lights
    var tx = x + R * 0.18;
    ctx.fillStyle = lg(ctx, tx - R * 0.22, 0, tx + R * 0.25, 0, [[0, 'rgba(2,4,14,0)'], [0.5, 'rgba(2,4,14,0.78)'], [1, 'rgba(2,4,14,0.93)']]);
    ctx.fillRect(tx - R * 0.22, y - R, x + R - (tx - R * 0.22), R * 2);
    dots(ctx, 50, [['#ffd27a', 0.9], ['#ffe9b8', 0.7]], function () { var a = r() * TAU, d = Math.sqrt(r()) * R * 0.9, px = x + Math.cos(a) * d, py = y + Math.sin(a) * d; if (px < tx + R * 0.12) return null; return [px, py, (0.3 + r() * 0.5) * s, r() < 0.6 ? 0 : 1]; });
    // the thin blue line of air on the sunlit edge
    ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = 'rgba(140,190,255,0.75)'; ctx.lineWidth = 1.6 * s; ctx.beginPath(); ctx.arc(x, y, R - 0.5 * s, PI * 0.55, PI * 1.45); ctx.stroke();
    ctx.strokeStyle = 'rgba(140,190,255,0.25)'; ctx.lineWidth = 4 * s; ctx.beginPath(); ctx.arc(x, y, R + 1.2 * s, PI * 0.6, PI * 1.4); ctx.stroke();
    ctx.restore();
  }
  /* A range of hills under a Sun that skims the horizon from the left. Flat ground gets almost no light, slopes that
     rise to the right face the Sun and blaze, slopes that fall away are black, and high points throw shadows far to the
     right. The lit faces are drawn as smooth bands under the crest (flat, graphic shapes with a fine sunlit crest line). */
  function rangeLayer(ctx, w, h, L, top, yb, o) {
    var s = L.s, n = Math.ceil(w) + 2, i, Y = new Float32Array(n), I = new Float32Array(n), J = new Float32Array(n);
    var tanE = o.tanE || 0.05, sh = -1e9;
    for (i = 0; i < n; i++) Y[i] = top(i - 1);
    for (i = 0; i < n; i++) { var sl = (Y[Math.min(n - 1, i + 2)] - Y[Math.max(0, i - 2)]) / 4; sh = Math.max(sh - tanE, -Y[i]); var cast = -Y[i] < sh - 0.5 * s; I[i] = cast ? 0 : smooth(0.02, 0.35, -sl); }
    var R = Math.max(2, Math.round(3 * s)); // soften the light along x so faces read as shapes, not stripes
    for (i = 0; i < n; i++) { var a = 0, c = 0; for (var k = -R; k <= R; k++) { var j = i + k; if (j >= 0 && j < n) { a += I[j]; c++; } } J[i] = a / c; }
    // body
    ctx.beginPath(); ctx.moveTo(-1, yb); for (i = 0; i < n; i++) ctx.lineTo(i - 1, Y[i]); ctx.lineTo(w + 1, yb); ctx.closePath();
    ctx.fillStyle = lg(ctx, 0, o.yTop || yb - h * 0.08, 0, yb, [[0, o.body0], [1, o.body1]]); ctx.fill();
    // lit faces: flat sunlit shapes from the crest down a depth that wanders slowly (two tones, crisp edges)
    if (o.depth) { ctx.save(); ctx.clip();
    var D = function (i) { return o.depth * s * (0.5 + 0.9 * fbm((i - 1) / w * 2.6 + o.seed, o.seed, 2)) * Math.min(1, J[i] * 1.6); };
    [[o.lit2, 1], [o.lit, 0.55]].forEach(function (T) {
      ctx.fillStyle = T[0]; ctx.beginPath(); var open = false, last = 0;
      for (var i = 0; i < n; i++) { var on = J[i] > 0.12; if (on && !open) { ctx.moveTo(i - 1, Y[i]); open = true; last = i; }
        if (on) { ctx.lineTo(i - 1, Y[i]); last = i; }
        if (open && (!on || i === n - 1)) { for (var j = last; j >= 0 && J[j] > 0.12; j--) ctx.lineTo(j - 1, Y[j] + D(j) * T[1]); ctx.closePath(); open = false; } }
      ctx.fill(); });
    ctx.restore(); }
    if (o.crest) { ctx.save(); ctx.strokeStyle = o.crest; ctx.lineWidth = 0.8 * s; ctx.beginPath(); var on = false;
      for (i = 0; i < n; i += 2) { if (J[i] > 0.35) { if (!on) ctx.moveTo(i - 1, Y[i]); else ctx.lineTo(i - 1, Y[i]); on = true; } else on = false; } ctx.stroke(); ctx.restore(); }
    if (o.ink) { ctx.save(); ctx.strokeStyle = o.ink; ctx.lineWidth = 0.6 * s; ctx.beginPath(); for (i = 0; i < n; i += 2) { if (!i) ctx.moveTo(-1, Y[0]); else ctx.lineTo(i - 1, Y[i]); } ctx.stroke(); ctx.restore(); }
    return J;
  }
  // two-tone mountains in the flat poster style: each peak's sunward (left) face is a pale shape bounded by a spine
  // that runs from the summit down and to the right; everything else stays dark. Peaks of eternal light at night.
  function peakFaces(ctx, w, h, L, top, yb, lit, lit2, seed, night) {
    var s = L.s, r = rng(seed);
    ctx.save(); ctx.beginPath(); ctx.moveTo(-1, yb); for (var x = -1; x <= w + 1; x += 2) ctx.lineTo(x, top(x)); ctx.lineTo(w + 1, yb); ctx.closePath(); ctx.clip();
    L.PK.forEach(function (K, k) {
      var cx = K[0] * w, x0 = cx - K[2] * w * 1.05; var px = cx, py = top(cx);
      for (var x = cx - K[2] * w * 0.3; x <= cx + K[2] * w * 0.3; x += 2) { var y = top(x); if (y < py) { py = y; px = x; } }
      var spine = function (t) { return [px + t * K[2] * w * (0.22 + 0.1 * r()), py + t * (yb - py)]; };
      if (night) { ctx.fillStyle = rgba('#ffeccc', py < h * 0.3 ? 0.8 : 0); ctx.beginPath(); ctx.moveTo(px - 6 * s, top(px - 6 * s)); for (x = px - 6 * s; x <= px; x += 1) ctx.lineTo(x, top(x)); ctx.lineTo(px + 1.5 * s, py + 5 * s); ctx.closePath(); ctx.fill(); return; }
      ctx.fillStyle = lit2; ctx.beginPath(); ctx.moveTo(x0, yb); for (x = x0; x <= px; x += 2) ctx.lineTo(x, top(x));
      for (var i = 0; i <= 8; i++) { var q = spine(i / 8); ctx.lineTo(q[0] + Math.sin(i * 1.7 + k) * 2 * s, q[1]); } ctx.closePath(); ctx.fill();
      ctx.fillStyle = lit; ctx.beginPath(); var xa = px - (px - x0) * 0.55; ctx.moveTo(xa, top(xa)); for (x = xa; x <= px; x += 2) ctx.lineTo(x, top(x)); var q2 = spine(0.45); ctx.lineTo(q2[0], q2[1]); ctx.quadraticCurveTo(px - (px - x0) * 0.2, py + (yb - py) * 0.5, xa, top(xa)); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = rgba('#000000', 0.22); ctx.lineWidth = 0.6 * s; ctx.beginPath();
      for (i = 1; i < 5; i++) { var gx = lerp(x0 + (px - x0) * 0.3, px, i / 5), gy = top(gx); ctx.moveTo(gx, gy + 2 * s); ctx.quadraticCurveTo(gx + 4 * s, gy + (yb - gy) * 0.4, gx + 2 * s, yb); } ctx.stroke();
    });
    ctx.restore();
  }
  function farHills(ctx, w, h, L, P, night) {
    var day = !night;
    var lower = function (x) { return L.far(x) + h * (0.02 + 0.012 * fbm(x / w * 5, 402, 3)) + h * 0.012; };
    rangeLayer(ctx, w, h, L, L.far, h * 0.4, { body0: day ? '#34322f' : '#1c2130', body1: day ? '#141417' : P.sh, lit: P.far[0], lit2: P.far[1], depth: 0, tanE: 0.03, seed: 11, crest: day ? 'rgba(255,255,255,0.75)' : null, ink: rgba(day ? '#000000' : '#8090c0', day ? 0.2 : 0.14), yTop: h * 0.25 });
    peakFaces(ctx, w, h, L, L.far, h * 0.4, day ? '#cfc9bc' : '#000', day ? '#8f8a80' : '#000', 61, night);
    rangeLayer(ctx, w, h, L, lower, h * 0.4, { body0: day ? '#26252a' : '#161a26', body1: day ? '#121215' : P.sh, lit: P.far[1], lit2: P.far[2], depth: 0, tanE: 0.03, seed: 12, crest: day ? 'rgba(255,255,255,0.45)' : null, ink: rgba('#000000', 0.15), yTop: h * 0.3 });
  }
  // the lunar Special Economic Zone on the far plain: solar masts in rows to the horizon, a terraced strip mine as big
  // as a canyon, the city-sized Copy Works with its tall tower and copy counter, domes, and a rail line to the rim
  function sez(ctx, w, h, L, P, night) {
    var s = L.s, i, k, Z = L.sez, hz = Z.hz;
    // flat far plain (barely lit by the grazing Sun)
    ctx.fillStyle = lg(ctx, 0, hz, 0, h * 0.42, [[0, night ? '#1a1e2a' : '#4a4740'], [1, night ? '#10131c' : '#2e2c29']]); ctx.fillRect(0, hz, w, h * 0.42 - hz);
    ctx.strokeStyle = rgba('#000000', 0.2); ctx.lineWidth = 0.5 * s; ctx.beginPath(); ctx.moveTo(0, hz); ctx.lineTo(w, hz); ctx.stroke();
    // rows of solar masts receding to the horizon (fine vertical linework, panels catching the Sun)
    for (k = 0; k < 6; k++) { var yy = lerp(hz + 0.6 * s, Z.mineY - Z.mineRy * 0.3, k / 6), ht = lerp(3, 10, k / 5) * s, gap = lerp(4, 11, k / 5) * s;
      for (var x = Z.solar[0] * w + (k % 2) * gap * 0.5; x < Z.solar[1] * w; x += gap) {
        ctx.strokeStyle = night ? 'rgba(90,100,130,0.6)' : 'rgba(200,195,185,0.7)'; ctx.lineWidth = 0.45 * s; ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x, yy - ht); ctx.stroke();
        ctx.fillStyle = night ? '#1a2244' : '#24306a'; ctx.fillRect(x - ht * 0.18, yy - ht, ht * 0.36, ht * 0.55);
        if (!night) { ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(x - ht * 0.18, yy - ht, 0.5 * s, ht * 0.55); }
        ctx.fillStyle = rgba('#000000', night ? 0.25 : 0.5); ctx.fillRect(x, yy - 0.3 * s, ht * 4, 0.6 * s); } }
    // the strip mine: concentric stepped terraces cut into the plain, a man-made canyon
    var mx = Z.mineX * w, my = Z.mineY, rx = Z.mineRx * w, ry = Z.mineRy;
    for (k = 0; k < 6; k++) { var f = 1 - k / 6.5, cx = mx + k * 0.8 * s, cy = my + k * ry * 0.14, ex = rx * f, ey = ry * f;
      ctx.fillStyle = night ? mix('#2a3040', '#0a0c14', k / 6) : mix('#6a665e', '#121216', k / 6); ctx.beginPath(); qell(ctx, cx, cy, ex, ey, 0); ctx.fill();
      // each bench: a lit riser on the far side (facing the Sun from the left? the far-right riser faces left and catches it)
      if (!night) { ctx.save(); ctx.beginPath(); qell(ctx, cx, cy, ex, ey, 0); ctx.clip(); ctx.fillStyle = rgba('#e8e2d2', 0.6 * (1 - k / 8)); ctx.beginPath(); ctx.ellipse(cx + ex * 0.08, cy - ey * 0.08, ex * 0.98, ey * 0.86, 0, PI * 1.55, PI * 2.25); ctx.lineTo(cx + ex, cy); ctx.fill(); ctx.restore(); }
      ctx.strokeStyle = rgba(night ? '#8090c0' : '#000000', night ? 0.18 : 0.3); ctx.lineWidth = 0.5 * s; ctx.beginPath(); qell(ctx, cx, cy, ex, ey, 0); ctx.stroke(); }
    // haul roads spiralling down the terraces, and tiny haulers
    ctx.strokeStyle = night ? 'rgba(150,160,200,0.3)' : 'rgba(255,250,235,0.55)'; ctx.lineWidth = 0.5 * s; ctx.beginPath();
    for (i = 0; i <= 60; i++) { var t = i / 60, a = PI * 0.9 + t * PI * 1.6, ff = 1 - t * 0.85; var px = mx + Math.cos(a) * rx * ff, py = my + t * ry * 0.7 + Math.sin(a) * ry * ff; if (!i) ctx.moveTo(px, py); else ctx.lineTo(px, py); } ctx.stroke();
    // the Copy Works: a city of factory blocks with almost nobody in it
    var fx = Z.fac[0] * w, fy = Z.fac[1] * h, r = rng(5150);
    L.facLights = [];
    for (i = 0; i < 16; i++) { var bw = (5 + r() * 12) * s, bh = (3 + r() * 9) * s * (i % 5 === 2 ? 1.8 : 1), bx = fx - Z.fac[2] * w * 0.5 + r() * Z.fac[2] * w, by = fy + r() * 2 * s;
      ctx.fillStyle = night ? '#262c3c' : '#3c3a36'; ctx.fillRect(bx, by - bh, bw, bh);
      ctx.fillStyle = night ? '#3a4256' : '#d8d2c4'; ctx.fillRect(bx, by - bh, bw * 0.38, bh);                      // sunlit left faces
      ctx.fillStyle = night ? '#1a1e2a' : '#5a5650'; ctx.fillRect(bx, by - bh - 1 * s, bw, 1 * s);
      ctx.strokeStyle = rgba('#000000', 0.35); ctx.lineWidth = 0.4 * s; ctx.strokeRect(bx, by - bh, bw, bh);
      ctx.fillStyle = rgba('#000000', night ? 0.3 : 0.6); ctx.fillRect(bx + bw, by - 0.4 * s, bh * 3, 0.8 * s);
      if (r() < 0.6) L.facLights.push([bx + bw * 0.7, by - bh * 0.6]); }
    // domes in the zone
    [[-0.06, 5], [0.05, 7], [0.11, 4]].forEach(function (d) { var x = fx + d[0] * w, R = d[1] * s; ctx.fillStyle = lg(ctx, x - R, 0, x + R, 0, night ? [[0, '#3a4256'], [1, '#141824']] : [[0, '#e8e2d4'], [0.5, '#9a948a'], [1, '#2a2826']]); ctx.beginPath(); ctx.ellipse(x, fy + 1 * s, R, R * 0.7, 0, PI, TAU); ctx.fill(); });
    // the tall tower of the Copy Works, with the treaty copy counter near the top
    var tx = Z.tower[0] * w, ty = fy + 1 * s, th = Z.tower[1] * h;
    ctx.fillStyle = rgba('#000000', night ? 0.3 : 0.6); ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx + th * 3.2, ty + 2 * s); ctx.lineTo(tx + th * 3.2, ty + 3 * s); ctx.lineTo(tx, ty + 1 * s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = night ? '#2a3042' : '#4a4740'; ctx.beginPath(); ctx.moveTo(tx - 4 * s, ty); ctx.lineTo(tx - 1.6 * s, ty - th); ctx.lineTo(tx + 1.6 * s, ty - th); ctx.lineTo(tx + 4 * s, ty); ctx.closePath(); ctx.fill();
    ctx.fillStyle = night ? '#4a5470' : '#e8e2d4'; ctx.beginPath(); ctx.moveTo(tx - 4 * s, ty); ctx.lineTo(tx - 1.6 * s, ty - th); ctx.lineTo(tx - 0.4 * s, ty - th); ctx.lineTo(tx - 1.6 * s, ty); ctx.closePath(); ctx.fill();
    ctx.fillStyle = night ? '#2a3042' : '#5a5650'; ctx.beginPath(); rrect(ctx, tx - 5 * s, ty - th - 7 * s, 10 * s, 7 * s, 2 * s); ctx.fill();
    ctx.fillStyle = '#0c1020'; ctx.beginPath(); rrect(ctx, tx - 4.2 * s, ty - th - 6.2 * s, 8.4 * s, 5.4 * s, 1 * s); ctx.fill();
    ctx.fillStyle = '#7ff7e4'; ctx.font = '800 ' + (3.8 * s).toFixed(1) + 'px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('3/4', tx, ty - th - 3.4 * s); ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic';
    glow(ctx, tx, ty - th - 3.5 * s, 12 * s, '#7ff7e4', night ? 0.3 : 0.15);
    ctx.strokeStyle = night ? '#6a7490' : '#c8c2b6'; ctx.lineWidth = 0.5 * s; ctx.beginPath(); ctx.moveTo(tx, ty - th - 7 * s); ctx.lineTo(tx, ty - th - 14 * s); ctx.stroke();
    L.tower = [tx, ty - th - 14 * s];
    // the rail line from the zone across the plain, curving toward our rim
    ctx.strokeStyle = night ? 'rgba(120,130,170,0.55)' : 'rgba(230,224,210,0.75)'; ctx.lineWidth = 0.7 * s;
    for (k = -1; k <= 1; k += 2) { ctx.beginPath(); ctx.moveTo(fx - Z.fac[2] * w * 0.55, fy + 2 * s + k * 0.6 * s); ctx.bezierCurveTo(w * 0.55, hz + 6 * s + k * 0.8 * s, w * 0.36, hz + 9 * s + k * 1 * s, w * 0.1, hz + 12 * s + k * 1.2 * s); ctx.stroke(); }
    L.rail = [[fx - Z.fac[2] * w * 0.55, fy + 2 * s], [w * 0.55, hz + 6 * s], [w * 0.36, hz + 9 * s], [w * 0.1, hz + 12 * s]];
  }
  function craterBowl(ctx, w, h, L, P, night) {
    var C = L.crater, s = L.s, i, r = rng(808);
    // the far inner wall of the crater: a band below the far rim, lit on the right where it faces the Sun
    var top = function (x) { var u = (x - (C.cx - C.rx)) / (2 * C.rx); return C.cy - C.ry * Math.sqrt(Math.max(0, 1 - Math.pow(2 * u - 1, 2))) * 0.9 - h * 0.003 * fbm(x / w * 20, 811, 3); };
    ctx.save();
    ctx.beginPath(); for (var x = C.cx - C.rx; x <= C.cx + C.rx; x += 2) { var y = top(x); if (x === C.cx - C.rx) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
    ctx.lineTo(C.cx + C.rx, C.cy + C.ry * 2); ctx.lineTo(C.cx - C.rx, C.cy + C.ry * 2); ctx.closePath(); ctx.clip();
    ctx.fillStyle = lg(ctx, C.cx - C.rx, 0, C.cx + C.rx, 0, night ? [[0, '#06070c'], [0.7, '#10141f'], [1, '#1c2232']] : [[0, '#0a0a0e'], [0.5, '#1c1b1a'], [0.72, '#7a756b'], [1, '#c8c2b4']]);
    ctx.fillRect(C.cx - C.rx, C.cy - C.ry * 2, C.rx * 2, C.ry * 4);
    // downslope streaks on the wall (fine linework)
    ctx.strokeStyle = night ? 'rgba(120,140,190,0.12)' : 'rgba(255,250,235,0.18)'; ctx.lineWidth = 0.5 * s; ctx.beginPath();
    for (i = 0; i < 90; i++) { var sx = C.cx - C.rx * 0.2 + r() * C.rx * 1.2, sy = top(sx); ctx.moveTo(sx, sy + 1 * s); ctx.lineTo(sx + (sx - C.cx) * -0.03, sy + (4 + r() * 10) * s); } ctx.stroke();
    // the shadow of the left rim slants across the wall
    if (!night) { ctx.fillStyle = 'rgba(8,8,12,0.88)'; ctx.beginPath(); ctx.moveTo(C.cx - C.rx, C.cy - C.ry * 2); ctx.lineTo(C.cx + C.rx * 0.2, C.cy - C.ry * 2); ctx.bezierCurveTo(C.cx + C.rx * 0.3, C.cy - C.ry * 0.7, C.cx + C.rx * 0.5, C.cy, C.cx + C.rx * 0.62, C.cy + C.ry * 0.4); ctx.lineTo(C.cx - C.rx, C.cy + C.ry * 2); ctx.closePath(); ctx.fill(); }
    // the floor: never touched by sunlight
    ctx.fillStyle = '#040407'; ctx.beginPath(); qell(ctx, C.cx + C.rx * 0.04, C.cy + C.ry * 0.62, C.rx * 0.97, C.ry * 0.75, 0); ctx.fill();
    ctx.restore();
    // the far rim lip, lit where the Sun grazes it
    ctx.save(); ctx.lineWidth = 0.9 * s; ctx.strokeStyle = night ? 'rgba(110,125,160,0.4)' : 'rgba(255,250,235,0.85)'; ctx.beginPath();
    for (x = C.cx - C.rx * 0.1; x <= C.cx + C.rx * 0.98; x += 2) { var yy = top(x); if (x === C.cx - C.rx * 0.1) ctx.moveTo(x, yy); else ctx.lineTo(x, yy); } ctx.stroke(); ctx.restore();
    // the crater lift: a thin cable running down into the dark
    ctx.save(); ctx.strokeStyle = night ? 'rgba(150,170,220,0.35)' : 'rgba(180,180,190,0.35)'; ctx.lineWidth = 0.6 * s; ctx.beginPath(); ctx.moveTo(L.lift[0][0], L.lift[0][1]); ctx.lineTo(L.lift[2][0], L.lift[2][1]); ctx.stroke(); ctx.restore();
  }
  function plateau(ctx, w, h, L, P, night) {
    var s = L.s, r = rng(night ? 6612 : 6611), x;
    // our side of the rim: level ground, so the grazing Sun lights it only dimly; bumps and rocks catch it hard
    ctx.beginPath(); ctx.moveTo(-1, h); for (x = -1; x <= w + 1; x += 2) ctx.lineTo(x, L.rimY(x)); ctx.lineTo(w + 1, h); ctx.closePath();
    ctx.fillStyle = lg(ctx, 0, h * 0.44, 0, h, [[0, P.lit2], [0.05, P.mid], [0.3, mix(P.mid, P.dark, 0.45)], [1, P.dark]]); ctx.fill();
    // big soft patches of darker and lighter regolith
    dabs(ctx, 260, [[P.lit2, 0.1], [P.dark, 0.16], [P.sh, 0.1]], function () { var p = r(), y2 = lerp(h * 0.47, h, p), x2 = r() * w; if (y2 < L.rimY(x2) + 4 * s) return null; return [x2, y2, (20 + r() * 60) * s * (0.5 + p), (3 + r() * 6) * s * (0.5 + p), (r() * 3) | 0, 0]; });
    // fine grain
    dots(ctx, 2400, [['#ffffff', 0.06], ['#000000', 0.12]], function () { var p = r(), y2 = lerp(h * 0.47, h, p), x2 = r() * w; if (y2 < L.rimY(x2) + 1) return null; return [x2, y2, (0.4 + r() * 0.9) * s * (0.6 + p), r() < 0.5 ? 0 : 1]; });
    // tiny ripples of sunlit ground toward the rim (grazing light picks out every bump)
    ctx.save(); ctx.strokeStyle = night ? 'rgba(120,135,170,0.15)' : 'rgba(255,248,230,0.3)'; ctx.lineWidth = 0.6 * s; ctx.beginPath();
    for (var i = 0; i < 160; i++) { var p2 = Math.pow(r(), 1.6), yy = lerp(h * 0.46, h * 0.7, p2), xx = r() * w, ln = (3 + r() * 10) * s * (0.6 + p2 * 2); if (yy < L.rimY(xx) + 2 * s) continue; ctx.moveTo(xx, yy); ctx.quadraticCurveTo(xx + ln * 0.5, yy - 0.8 * s, xx + ln, yy); } ctx.stroke(); ctx.restore();
    // the near rim lip against the black bowl
    ctx.save(); ctx.strokeStyle = night ? 'rgba(120,135,170,0.5)' : 'rgba(255,250,235,0.8)'; ctx.lineWidth = 1 * s; ctx.beginPath();
    for (x = 0; x <= w; x += 2) { var y3 = L.rimY(x); if (!x) ctx.moveTo(x, y3); else ctx.lineTo(x, y3); } ctx.stroke(); ctx.restore();
  }
  function pit(ctx, x, y, R, P, s, night) {
    var ry = R * 0.32;
    // shadow fills the near-left inside; the far right inner wall catches the Sun; the left outer rim is lit
    ctx.fillStyle = rgba(P.sh, night ? 0.4 : 0.6); ctx.beginPath(); qell(ctx, x, y, R, ry, 0); ctx.fill();
    if (!night) { ctx.fillStyle = rgba(P.lit2, 0.85); ctx.beginPath(); ctx.moveTo(x + R * 0.98, y); ctx.bezierCurveTo(x + R * 0.9, y + ry * 0.9, x + R * 0.2, y + ry * 1.05, x - R * 0.2, y + ry * 0.92); ctx.bezierCurveTo(x + R * 0.2, y + ry * 0.55, x + R * 0.65, y + ry * 0.2, x + R * 0.98, y); ctx.fill(); }
    ctx.strokeStyle = rgba(night ? P.lit2 : P.lit, night ? 0.4 : 0.75); ctx.lineWidth = Math.max(0.6, R * 0.06); ctx.beginPath(); ctx.ellipse(x, y, R * 1.03, ry * 1.08, 0, PI * 0.95, PI * 1.6); ctx.stroke();
    ctx.strokeStyle = rgba(P.sh, 0.35); ctx.lineWidth = Math.max(0.6, R * 0.05); ctx.beginPath(); ctx.ellipse(x, y, R * 1.05, ry * 1.12, 0, PI * 1.7, PI * 2.3); ctx.stroke();
  }
  // a boulder: rounded, lit on the left, dark on the right, with a long shadow running to the right
  function boulder(ctx, x, y, R, P, s, seed, night) {
    var r = rng(seed), n = 9, pts = [], i;
    for (i = 0; i < n; i++) { var a = PI + i / (n - 1) * PI, rr = R * (0.75 + r() * 0.35); pts.push([x + Math.cos(a) * rr * 1.15, y + Math.sin(a) * rr * 0.85]); }
    var len = R * (night ? 3 : 9);
    ctx.fillStyle = rgba(P.sh, night ? 0.45 : 0.85); ctx.beginPath(); ctx.moveTo(x - R * 0.6, y); ctx.quadraticCurveTo(x + len * 0.5, y - R * 0.15, x + len, y + R * 0.12); ctx.quadraticCurveTo(x + len * 0.5, y + R * 0.45, x - R * 0.3, y + R * 0.3); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(pts[0][0], y + R * 0.08); pts.forEach(function (p) { ctx.lineTo(p[0], p[1]); }); ctx.lineTo(pts[n - 1][0], y + R * 0.08); ctx.closePath();
    ctx.fillStyle = lg(ctx, x - R, 0, x + R, 0, night ? [[0, P.lit2], [0.6, P.mid], [1, P.dark]] : [[0, P.lit], [0.35, P.lit2], [0.62, P.dark], [1, P.sh]]); ctx.fill();
    ctx.strokeStyle = rgba('#000000', 0.25); ctx.lineWidth = 0.6 * s; ctx.stroke();
    if (!night) { ctx.strokeStyle = 'rgba(255,252,240,0.6)'; ctx.lineWidth = 0.9 * s; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (i = 1; i < 4; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.stroke(); }
  }
  function tracks(ctx, w, h, L, P, night) {
    var s = L.s, T = L.track;
    ctx.save(); ctx.lineCap = 'round';
    for (var k = -1; k <= 1; k += 2) {
      ctx.strokeStyle = rgba(night ? '#05060a' : '#2a2724', 0.4); ctx.lineWidth = 2.6 * s; ctx.setLineDash([2 * s, 1.6 * s]);
      ctx.beginPath(); ctx.moveTo(T[0][0], T[0][1] + k * 6 * s); ctx.bezierCurveTo(T[1][0], T[1][1] + k * 4.5 * s, T[2][0], T[2][1] + k * 3 * s, T[3][0], T[3][1] + k * 2 * s); ctx.stroke();
    }
    ctx.setLineDash([]); ctx.restore();
  }
  // half-buried habitat domes: regolith shells (for radiation shielding) with round windows
  function habDome(ctx, x, y, R, P, s, night, seed) {
    var r = rng(seed);
    ctx.fillStyle = rgba(P.sh, night ? 0.5 : 0.85); ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + R * 3, y - R * 0.05, x + R * 5.5, y + R * 0.16); ctx.lineTo(x, y + R * 0.2); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x - R, y); ctx.bezierCurveTo(x - R, y - R * 0.85, x - R * 0.55, y - R * 0.98, x, y - R * 0.98); ctx.bezierCurveTo(x + R * 0.55, y - R * 0.98, x + R, y - R * 0.85, x + R, y); ctx.closePath();
    ctx.fillStyle = lg(ctx, x - R, 0, x + R, 0, night ? [[0, P.lit2], [1, P.dark]] : [[0, P.lit], [0.4, P.lit2], [0.7, P.mid], [1, P.dark]]); ctx.fill();
    ctx.save(); ctx.clip();
    // sandbag rows
    ctx.strokeStyle = rgba('#000000', 0.18); ctx.lineWidth = 0.7 * s;
    for (var k = 1; k < 5; k++) { var yy = y - R * k * 0.2; ctx.beginPath(); ctx.moveTo(x - R, yy); for (var xx = x - R; xx < x + R; xx += 4 * s) ctx.quadraticCurveTo(xx + 2 * s, yy + 1.2 * s, xx + 4 * s, yy); ctx.stroke(); }
    ctx.restore();
    // airlock and a window or two
    ctx.fillStyle = mix(P.dark, '#000000', 0.3); ctx.beginPath(); rrect(ctx, x + R * 0.5, y - R * 0.34, R * 0.42, R * 0.34, R * 0.08); ctx.fill();
    var wins = [[-0.35, -0.42], [0.05, -0.52]];
    wins.forEach(function (q) { var wx = x + q[0] * R, wy = y + q[1] * R, wr = R * 0.12; ctx.fillStyle = P.win; ctx.beginPath(); qcirc(ctx, wx, wy, wr); ctx.fill(); glow(ctx, wx, wy, wr * (night ? 5 : 3), P.win, night ? 0.35 : 0.18); });
  }
  // the Market Dome: a glass dome on brass ribs, warm inside, with little stalls and strings of lights
  function marketDome(ctx, w, h, L, P, night) {
    var s = L.s, x = L.market[0], y = L.market[1], R = L.market[2], i;
    ctx.fillStyle = rgba(P.sh, night ? 0.5 : 0.85); ctx.beginPath(); ctx.moveTo(x - R * 0.2, y); ctx.quadraticCurveTo(x + R * 2.5, y - R * 0.02, x + R * 4.4, y + R * 0.2); ctx.lineTo(x - R * 0.2, y + R * 0.16); ctx.closePath(); ctx.fill();
    // a regolith berm around the base
    ctx.fillStyle = lg(ctx, x - R, 0, x + R, 0, night ? [[0, P.lit2], [1, P.dark]] : [[0, P.lit], [0.5, P.lit2], [1, P.dark]]);
    ctx.beginPath(); ctx.moveTo(x - R * 1.18, y + 1); ctx.quadraticCurveTo(x - R * 1.1, y - R * 0.22, x - R * 0.9, y - R * 0.24); ctx.lineTo(x + R * 0.9, y - R * 0.24); ctx.quadraticCurveTo(x + R * 1.1, y - R * 0.22, x + R * 1.18, y + 1); ctx.closePath(); ctx.fill();
    var cy = y - R * 0.22;
    ctx.save(); ctx.beginPath(); ctx.ellipse(x, cy, R, R * 0.82, 0, PI, TAU); ctx.closePath(); ctx.clip();
    // warm interior
    ctx.fillStyle = rg(ctx, x, cy, R * 0.1, R * 1.1, [[0, night ? '#ffd890' : '#ffcf86'], [0.5, night ? '#d98c48' : '#c8864a'], [1, night ? '#5a3a40' : '#6a4a3c']]); ctx.fillRect(x - R, cy - R, R * 2, R);
    // back wall plants and stalls
    for (i = 0; i < 7; i++) { var px = x - R * 0.75 + i * R * 0.25; ctx.fillStyle = i % 2 ? '#3f8a52' : '#2f7a4a'; ctx.beginPath(); qcirc(ctx, px, cy - R * 0.12, R * 0.12); ctx.fill(); }
    var cols = ['#e0684a', '#4aa8b8', '#e8b84a', '#9a6ad8'];
    for (i = 0; i < 4; i++) { var sx = x - R * 0.7 + i * R * 0.38; ctx.fillStyle = cols[i]; ctx.beginPath(); ctx.moveTo(sx - R * 0.15, cy - R * 0.12); ctx.lineTo(sx + R * 0.15, cy - R * 0.12); ctx.lineTo(sx + R * 0.12, cy - R * 0.2); ctx.lineTo(sx - R * 0.12, cy - R * 0.2); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#5a3a2a'; ctx.fillRect(sx - R * 0.13, cy - R * 0.12, R * 0.26, R * 0.1); }
    // tiny shoppers
    for (i = 0; i < 6; i++) { var mx = x - R * 0.6 + i * R * 0.24, my = cy - R * 0.02; ctx.fillStyle = ['#2a3a6a', '#7a3a5a', '#3a6a5a', '#6a4a2a', '#4a4a7a', '#8a5a3a'][i]; ctx.fillRect(mx - R * 0.025, my - R * 0.1, R * 0.05, R * 0.1); ctx.fillStyle = '#e8c0a0'; ctx.beginPath(); qcirc(ctx, mx, my - R * 0.13, R * 0.028); ctx.fill(); }
    // strings of lights
    ctx.strokeStyle = 'rgba(90,60,40,0.6)'; ctx.lineWidth = 0.5 * s;
    for (var k = 0; k < 2; k++) { ctx.beginPath(); ctx.moveTo(x - R * 0.8, cy - R * (0.45 + k * 0.15)); ctx.quadraticCurveTo(x, cy - R * (0.25 + k * 0.15), x + R * 0.8, cy - R * (0.45 + k * 0.15)); ctx.stroke(); }
    dots(ctx, 30, [['#fff2b0', 1]], function (j) { var k = j % 2, t = (j >> 1) / 14, xx = lerp(x - R * 0.8, x + R * 0.8, t), yy = cy - R * (0.45 + k * 0.15) + Math.sin(t * PI) * R * 0.2; return [xx, yy, 0.8 * s, 0]; });
    // the glass: reflections from the sunlit left and a cool sheen
    ctx.fillStyle = lg(ctx, x - R, cy - R, x + R, cy, [[0, 'rgba(255,255,255,0.32)'], [0.35, 'rgba(255,255,255,0.05)'], [1, 'rgba(120,140,200,0.12)']]); ctx.fillRect(x - R, cy - R, R * 2, R);
    ctx.restore();
    // brass ribs
    ctx.strokeStyle = night ? '#a88850' : '#d4a85a'; ctx.lineWidth = 1.3 * s;
    ctx.beginPath(); ctx.ellipse(x, cy, R, R * 0.82, 0, PI, TAU); ctx.stroke();
    ctx.lineWidth = 0.8 * s; for (i = 1; i < 6; i++) { var a = PI + i / 6 * PI; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * R, cy + Math.sin(a) * R * 0.82); ctx.quadraticCurveTo(x + Math.cos(a) * R * 0.4, cy - R * 0.82, x, cy - R * 0.82); ctx.stroke(); }
    ctx.beginPath(); ctx.ellipse(x, cy, R * 0.98, R * 0.4, 0, PI, TAU); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.ellipse(x, cy, R * 0.93, R * 0.76, 0, PI * 1.08, PI * 1.32); ctx.stroke();
    glow(ctx, x, cy - R * 0.3, R * (night ? 2.2 : 1.4), '#ffb860', night ? 0.28 : 0.12);
    // the sign over the door
    ctx.fillStyle = '#2a1a2e'; ctx.beginPath(); rrect(ctx, x - R * 0.36, cy - R * 0.05, R * 0.72, R * 0.17, 2 * s); ctx.fill();
    ctx.fillStyle = '#f2c46a'; ctx.font = '800 ' + (R * 0.11).toFixed(1) + 'px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('MARKET', x, cy + R * 0.035); ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic';
  }
  // tall solar masts: at the pole the Sun circles the horizon, so the panels stand upright and turn to follow it
  function mast(ctx, x, y, k, P, s, w, night) {
    var H = 120 * s * k, pw = 16 * s * k, ph = 46 * s * k;
    // the shadow: a long thin stripe running right and a little toward us
    ctx.fillStyle = rgba(P.sh, night ? 0.35 : 0.8); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + H * 6, y + H * 0.42); ctx.lineTo(x + H * 6, y + H * 0.42 + 2 * s); ctx.lineTo(x, y + 1.6 * s); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = night ? 0.3 : 0.7; ctx.beginPath(); ctx.moveTo(x + H * 4.2, y + H * 0.29); ctx.lineTo(x + H * 6.2, y + H * 0.44); ctx.lineTo(x + H * 6.2, y + H * 0.44 + pw * 0.5); ctx.lineTo(x + H * 4.2, y + H * 0.29 + pw * 0.4); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
    ctx.fillStyle = night ? '#4a5064' : '#b8b2a6'; ctx.fillRect(x - 0.9 * s * k, y - H, 1.8 * s * k, H);
    ctx.fillStyle = night ? '#20242e' : '#3a3834'; ctx.fillRect(x + 0.2 * s * k, y - H, 0.9 * s * k, H);
    // the panel, seen almost edge-on: deep blue cells, a hot glint along the sunward edge
    var py = y - H + 4 * s * k;
    ctx.fillStyle = night ? '#141a34' : '#1e2a5a'; ctx.beginPath(); ctx.moveTo(x - pw * 0.5, py); ctx.lineTo(x + pw * 0.5, py + 3 * s * k); ctx.lineTo(x + pw * 0.5, py + ph); ctx.lineTo(x - pw * 0.5, py + ph - 3 * s * k); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = night ? 'rgba(90,110,170,0.35)' : 'rgba(120,150,230,0.45)'; ctx.lineWidth = 0.5 * s;
    for (var j = 1; j < 6; j++) { ctx.beginPath(); ctx.moveTo(x - pw * 0.5, py + ph * j / 6 - 0.5 * s); ctx.lineTo(x + pw * 0.5, py + ph * j / 6 + 2.5 * s * k - 0.5 * s); ctx.stroke(); }
    if (!night) { ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillRect(x - pw * 0.5 - 0.6 * s, py, 1.2 * s, ph - 3 * s * k); glow(ctx, x - pw * 0.5, py + ph * 0.3, 7 * s * k, '#ffffff', 0.5); }
  }
  function lander(ctx, w, h, L, P, night) {
    var s = L.s, x = L.lander[0], y = L.lander[1], k = 0.9;
    ctx.fillStyle = rgba(P.sh, night ? 0.4 : 0.8); ctx.fillRect(x, y - 0.5 * s, 60 * s, 2 * s);
    ctx.strokeStyle = night ? '#5a6074' : '#c8c2b6'; ctx.lineWidth = 1 * s * k;
    ctx.beginPath(); ctx.moveTo(x - 7 * s, y); ctx.lineTo(x - 3 * s, y - 7 * s); ctx.moveTo(x + 7 * s, y); ctx.lineTo(x + 3 * s, y - 7 * s); ctx.stroke();
    ctx.fillStyle = lg(ctx, x - 5 * s, 0, x + 5 * s, 0, night ? [[0, '#6a7088'], [1, '#2a2e3c']] : [[0, '#f4efe4'], [0.5, '#c8c2b4'], [1, '#4a4844']]);
    ctx.beginPath(); rrect(ctx, x - 4.5 * s, y - 22 * s, 9 * s, 16 * s, 2.5 * s); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x - 3 * s, y - 22 * s); ctx.quadraticCurveTo(x, y - 29 * s, x + 3 * s, y - 22 * s); ctx.fill();
    ctx.fillStyle = '#d4a85a'; ctx.fillRect(x - 4.5 * s, y - 10 * s, 9 * s, 2 * s);
    ctx.fillStyle = night ? '#141824' : '#2a2a30'; ctx.beginPath(); qell(ctx, x, y + 0.6 * s, 14 * s, 1.6 * s, 0); ctx.fill();
  }
  // the Copy Works: a robot factory that can build robots, including copies of its own robots, up to a treaty limit
  function factory(ctx, w, h, L, P, night) {
    var s = L.s, x = L.factory[0], y = L.factory[1];
    ctx.fillStyle = rgba(P.sh, night ? 0.4 : 0.85); ctx.beginPath(); ctx.moveTo(x - 20 * s, y); ctx.lineTo(x + 80 * s, y + 4 * s); ctx.lineTo(x + 80 * s, y + 7 * s); ctx.lineTo(x - 20 * s, y + 2 * s); ctx.closePath(); ctx.fill();
    var g = night ? [[0, '#4c5266'], [1, '#1e2230']] : [[0, '#e2dccf'], [0.45, '#a8a296'], [1, '#3a3834']];
    ctx.fillStyle = lg(ctx, x - 22 * s, 0, x + 22 * s, 0, g); ctx.fillRect(x - 22 * s, y - 13 * s, 44 * s, 13 * s);
    ctx.fillStyle = lg(ctx, x - 12 * s, 0, x + 12 * s, 0, g); ctx.beginPath(); ctx.moveTo(x - 14 * s, y - 13 * s); ctx.lineTo(x - 10 * s, y - 20 * s); ctx.lineTo(x + 10 * s, y - 20 * s); ctx.lineTo(x + 14 * s, y - 13 * s); ctx.closePath(); ctx.fill();
    // stacks of fresh robot parts and a crane
    ctx.strokeStyle = night ? '#6a7088' : '#d8d2c4'; ctx.lineWidth = 0.9 * s; ctx.beginPath(); ctx.moveTo(x + 16 * s, y - 13 * s); ctx.lineTo(x + 16 * s, y - 30 * s); ctx.lineTo(x - 6 * s, y - 26 * s); ctx.moveTo(x - 4 * s, y - 26.4 * s); ctx.lineTo(x - 4 * s, y - 18 * s); ctx.stroke();
    ctx.fillStyle = night ? '#3a3f52' : '#8a8478'; for (var i = 0; i < 3; i++) ctx.fillRect(x - 30 * s + i * 4 * s, y - 4 * s - (i % 2) * 2 * s, 3.4 * s, 4 * s + (i % 2) * 2 * s);
    // the copy counter: a lit panel the treaty monitor reads each week
    ctx.fillStyle = '#0c1020'; ctx.beginPath(); rrect(ctx, x - 10 * s, y - 11 * s, 20 * s, 8 * s, 1.5 * s); ctx.fill();
    ctx.fillStyle = '#7ff7e4'; ctx.font = '800 ' + (5.4 * s).toFixed(1) + 'px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('3 / 4', x, y - 6.8 * s); ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic';
    glow(ctx, x, y - 7 * s, 16 * s, '#7ff7e4', night ? 0.25 : 0.12);
    // treaty beacons at the corners
    [[x - 22 * s, y - 13 * s], [x + 22 * s, y - 13 * s]].forEach(function (b) { ctx.fillStyle = '#ffb02e'; ctx.beginPath(); qcirc(ctx, b[0], b[1] - 1.5 * s, 1 * s); ctx.fill(); });
    L.beacons = [[x - 22 * s, y - 14.5 * s], [x + 22 * s, y - 14.5 * s], [x + 16 * s, y - 31 * s]];
  }
  function rover(ctx, x, y, k, dir, P, s, night) {
    var u = 9 * s * k;
    ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
    ctx.fillStyle = rgba(P.sh, night ? 0.4 : 0.8); ctx.beginPath(); ctx.moveTo(-1.4 * u * dir, 0.2 * u); ctx.lineTo(9 * u * (dir > 0 ? 1 : -0.2), 0.5 * u); ctx.lineTo(9 * u * (dir > 0 ? 1 : -0.2), 1 * u); ctx.lineTo(-1.4 * u * dir, 0.8 * u); ctx.closePath(); ctx.fill();
    ctx.fillStyle = night ? '#4a5064' : '#e8e2d4'; ctx.beginPath(); rrect(ctx, -1.5 * u, -1.5 * u, 3 * u, 1 * u, 0.25 * u); ctx.fill();
    ctx.fillStyle = night ? '#262a38' : '#6a665e'; ctx.fillRect(-1.5 * u, -0.75 * u, 3 * u, 0.25 * u);
    ctx.fillStyle = '#e0684a'; ctx.fillRect(-1.5 * u, -1.5 * u, 3 * u, 0.18 * u);
    // a bin of regolith on top, and a little mast with a camera
    ctx.fillStyle = night ? '#383e50' : '#9a948a'; ctx.beginPath(); ctx.moveTo(-1.2 * u, -1.5 * u); ctx.lineTo(-0.9 * u, -2.1 * u); ctx.lineTo(0.9 * u, -2.1 * u); ctx.lineTo(1.2 * u, -1.5 * u); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = night ? '#6a7088' : '#d8d2c4'; ctx.lineWidth = 0.25 * u; ctx.beginPath(); ctx.moveTo(1.2 * u, -1.5 * u); ctx.lineTo(1.2 * u, -2.7 * u); ctx.stroke(); ctx.fillStyle = '#2a2a30'; ctx.fillRect(1 * u, -3 * u, 0.6 * u, 0.4 * u);
    ctx.fillStyle = night ? '#1a1e28' : '#2c2a28';
    for (var i = -1; i <= 1; i++) { ctx.beginPath(); qcirc(ctx, i * 1.1 * u, -0.3 * u, 0.42 * u); ctx.fill(); }
    ctx.fillStyle = night ? '#5a6074' : '#c8c2b6'; for (i = -1; i <= 1; i++) { ctx.beginPath(); qcirc(ctx, i * 1.1 * u - 0.08 * u, -0.34 * u, 0.15 * u); ctx.fill(); }
    ctx.restore();
  }
  function base(ctx, w, h, L, P, night) {
    var s = L.s, i;
    L.masts.forEach(function (m) { mast(ctx, w * m[0], h * m[1], m[2], P, s, w, night); });
    L.domes.forEach(function (d, k) { habDome(ctx, w * d[0], h * d[1], d[2] * s, P, s, night, 700 + k); });
    // a pressurized walkway linking the domes to the market
    ctx.fillStyle = night ? '#2a3040' : '#8a847a'; ctx.beginPath(); rrect(ctx, w * 0.07, h * 0.472 - 4 * s, w * 0.19, 5 * s, 2.5 * s); ctx.fill();
    ctx.fillStyle = P.win; for (i = 0; i < 7; i++) ctx.fillRect(w * 0.085 + i * w * 0.024, h * 0.472 - 2.6 * s, 2 * s, 1.6 * s);
    marketDome(ctx, w, h, L, P, night);
    lander(ctx, w, h, L, P, night);
    L.rovers.forEach(function (q) { rover(ctx, w * q[0], h * q[1], q[2], q[3], P, s, night); });
  }
  function foreground(ctx, w, h, L, P, night) {
    var s = L.s;
    L.pits.forEach(function (q) { if (q[1] > L.rimY(q[0]) + q[2] * 0.4) pit(ctx, q[0], q[1], q[2], P, s, night); });
    tracks(ctx, w, h, L, P, night);
    // footprints near the market door
    ctx.fillStyle = rgba(P.sh, 0.35); for (var i = 0; i < 16; i++) { var t = i / 15, x = lerp(w * 0.3, w * 0.5, t) + (i % 2) * 3 * s, y = lerp(h * 0.49, h * 0.6, t); ctx.beginPath(); qell(ctx, x, y, 1.6 * s * (1 + t), 0.7 * s * (1 + t), 0.3); ctx.fill(); }
    L.rocks.forEach(function (q, k) { if (q[1] > L.rimY(q[0]) + 3 * s) boulder(ctx, q[0], q[1], q[2], P, s, 5000 + k, night); });
  }
  function paintMoon(variant) {
    return function (ctx, w, h) {
      try {
        var night = variant === 'night', P = PAL[variant], L = moonLM(w, h);
        sky(ctx, w, h, L, P, night);
        if (!night) sunGlare(ctx, w, h, L);
        earth(ctx, w, h, L, night);
        farHills(ctx, w, h, L, P, night);
        sez(ctx, w, h, L, P, night);
        craterBowl(ctx, w, h, L, P, night);
        plateau(ctx, w, h, L, P, night);
        base(ctx, w, h, L, P, night);
        foreground(ctx, w, h, L, P, night);
        if (night) { // earthlight: a soft blue wash from the right, where Earth hangs
          ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = lg(ctx, w, h * 0.3, 0, h, [[0, 'rgba(140,170,255,0.4)'], [1, 'rgba(20,30,60,0.2)']]); ctx.fillRect(0, h * 0.35, w, h * 0.65); ctx.restore();
        } else { // the faint glow of the Sun over the left hills spills onto the near ground
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, 0, h * 0.36, w * 0.5, '#fff4e0', 0.08); ctx.restore();
        }
        finish(ctx, w, h, P.grade, P.gradeA, P.vig, 0.035, '#05050a', 0.42);
      } catch (e) { PAINT._err = 'moon_' + variant + ': ' + String(e && e.stack || e); }
    };
  }
  function overlayMoon(variant) {
    return function (ctx, w, h, t) {
      try {
        var night = variant === 'night', L = moonLM(w, h), s = L.s, i;
        ctx.save();
        // ice-mining robots crawling on the dark crater floor (steady lights: no air, so no twinkle)
        for (i = 0; i < L.miners.length; i++) { var m = L.miners[i], mx = m[0] + Math.sin(t * 0.05 + m[2] * 9) * 10 * s, a = 0.5 + 0.5 * Math.sin(t * 0.7 + i * 2.1);
          var sp = glowSpr(i % 3 ? '#9fd8ff' : '#ffe2a0', true); if (sp) { ctx.globalAlpha = 0.55 + a * 0.35; var z = (2.4 + a * 1.4) * s; ctx.drawImage(sp, mx - z, m[1] - z, z * 2, z * 2); } }
        // a lift car sliding down the cable into the crater
        var lp = (t * 0.04) % 1, A = L.lift[2], B = L.lift[0], lx = lerp(A[0], B[0], lp), ly = lerp(A[1], B[1], lp), sp2 = glowSpr('#ffe2a0', true);
        if (sp2) { ctx.globalAlpha = 0.9; ctx.drawImage(sp2, lx - 4 * s, ly - 4 * s, 8 * s, 8 * s); }
        ctx.globalAlpha = 1;
        // blinking beacons on the masts and the Copy Works
        var bl = Math.pow(Math.max(0, Math.sin(t * 2.2)), 10), sr = glowSpr('#ff5a3a', true);
        if (sr) { L.masts.forEach(function (q, k) { var x = w * q[0], y = h * q[1] - 120 * s * q[2] + 2 * s; var b2 = Math.pow(Math.max(0, Math.sin(t * 2.2 + k * 0.8)), 10); ctx.globalAlpha = 0.3 + b2 * 0.7; var z = (2 + b2 * 3) * s; ctx.drawImage(sr, x - z, y - 2 * s - z, z * 2, z * 2); }); }
        var so = glowSpr('#ffb02e', true); if (so && L.facLights) L.facLights.concat(L.tower ? [L.tower] : []).forEach(function (b, k) { ctx.globalAlpha = 0.35 + 0.65 * Math.pow(Math.max(0, Math.sin(t * 1.6 + k * 2)), 6); var z = 2.4 * s; ctx.drawImage(so, b[0] - z, b[1] - z, z * 2, z * 2); });
        ctx.globalAlpha = 1;
        // a rover crawling along the track, its wheels flicking dust up in clean arcs (dust falls straight back down)
        var T = L.track, u = (t * 0.018) % 1, bx = function (p0, p1, p2, p3, q) { var m1 = 1 - q; return m1 * m1 * m1 * p0 + 3 * m1 * m1 * q * p1 + 3 * m1 * q * q * p2 + q * q * q * p3; };
        var rx = bx(T[0][0], T[1][0], T[2][0], T[3][0], u), ry = bx(T[0][1], T[1][1], T[2][1], T[3][1], u), k2 = 0.7 + (1 - (ry - h * 0.5) / (h * 0.12)) * -0.2 + 0.5;
        ctx.save(); ctx.translate(rx, ry);
        var uu = 9 * s * k2 * 0.8;
        ctx.fillStyle = night ? 'rgba(5,6,10,0.4)' : 'rgba(8,8,12,0.75)'; ctx.beginPath(); ctx.moveTo(-1.2 * uu, 0.1 * uu); ctx.lineTo(7 * uu, 0.6 * uu); ctx.lineTo(7 * uu, 1 * uu); ctx.lineTo(-1.2 * uu, 0.6 * uu); ctx.closePath(); ctx.fill();
        ctx.fillStyle = night ? '#525a70' : '#ece6d8'; ctx.beginPath(); rrect(ctx, -1.5 * uu, -1.5 * uu, 3 * uu, 1 * uu, 0.25 * uu); ctx.fill();
        ctx.fillStyle = '#e0684a'; ctx.fillRect(-1.5 * uu, -1.5 * uu, 3 * uu, 0.18 * uu);
        ctx.fillStyle = night ? '#3a4054' : '#a8a296'; ctx.beginPath(); ctx.moveTo(-1.2 * uu, -1.5 * uu); ctx.lineTo(-0.9 * uu, -2.05 * uu); ctx.lineTo(0.9 * uu, -2.05 * uu); ctx.lineTo(1.2 * uu, -1.5 * uu); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#2c2a28'; for (i = -1; i <= 1; i++) { ctx.beginPath(); qcirc(ctx, i * 1.1 * uu, -0.3 * uu, 0.42 * uu); ctx.fill(); }
        if (night) { var hl = glowSpr('#fff2c8', true); if (hl) ctx.drawImage(hl, 1.2 * uu, -1.4 * uu, 3 * uu, 3 * uu); }
        ctx.fillStyle = night ? 'rgba(120,130,160,0.6)' : 'rgba(200,192,178,0.85)';
        for (i = 0; i < 10; i++) { var ph = ((t * 1.4 + i * 0.1) % 1), wx = -1.2 * uu - ph * 2.2 * uu, wy = -0.1 * uu - (ph * (1 - ph)) * 4 * 1.4 * uu; ctx.globalAlpha = 1 - ph; ctx.beginPath(); qcirc(ctx, wx, wy, 0.18 * uu); ctx.fill(); }
        ctx.restore(); ctx.globalAlpha = 1;
        // two people in suits by the market door, one waving now and then
        var px = w * 0.335, py = h * 0.482, ps = 1.6 * s;
        for (i = 0; i < 2; i++) { var qx = px + i * 7 * s, wave = i === 1 ? Math.max(0, Math.sin(t * 0.6)) : 0;
          ctx.fillStyle = night ? '#6a7088' : '#f2eee4'; ctx.beginPath(); rrect(ctx, qx - 1.6 * ps, py - 6 * ps, 3.2 * ps, 4.4 * ps, 1.2 * ps); ctx.fill(); ctx.fillRect(qx - 1.3 * ps, py - 2 * ps, 1 * ps, 2 * ps); ctx.fillRect(qx + 0.3 * ps, py - 2 * ps, 1 * ps, 2 * ps);
          ctx.beginPath(); qcirc(ctx, qx, py - 7.4 * ps, 1.5 * ps); ctx.fill(); ctx.fillStyle = '#d4a85a'; ctx.beginPath(); qcirc(ctx, qx + 0.4 * ps, py - 7.4 * ps, 0.9 * ps); ctx.fill();
          if (wave) { ctx.strokeStyle = night ? '#6a7088' : '#f2eee4'; ctx.lineWidth = 0.9 * ps; ctx.beginPath(); ctx.moveTo(qx + 1.4 * ps, py - 5 * ps); ctx.lineTo(qx + 2.6 * ps + wave * 0.6 * ps, py - 8 * ps); ctx.stroke(); } }
        ctx.restore();
      } catch (e) { PAINT._err = 'moon overlay: ' + String(e && e.stack || e); }
    };
  }
  // anchors (fractions of w,h): Earth, the market, the Copy Works and the crater; the middle stays clear for portraits
  PAINT.moon = { focus: { x: 0.79, y: 0.296 }, track: 'morning', anchors: { earth: { x: 0.79, y: 0.296 }, market: { x: 0.26, y: 0.46 }, factory: { x: 0.905, y: 0.38 }, crater: { x: 0.57, y: 0.436 } }, paint: paintMoon('day'), overlay: overlayMoon('day') };
  PAINT.moon_night = { focus: { x: 0.79, y: 0.296 }, track: 'night', anchors: { earth: { x: 0.79, y: 0.296 }, market: { x: 0.26, y: 0.46 } }, paint: paintMoon('night'), overlay: overlayMoon('night') };

  /* ============================== tappable props ============================== */
  if (typeof LATE !== 'undefined') LATE.push(function () {
    if (typeof PROPS === 'undefined' || typeof PROPS_ART === 'undefined') return;
    PROPS_ART.moonrover = function () { return '<svg viewBox="0 0 90 60"><ellipse cx="46" cy="56" rx="34" ry="3.5" fill="rgba(0,0,0,.35)"/><g class="pa-body"><rect x="14" y="22" width="62" height="18" rx="5" fill="#ece6d8" stroke="#5a5650" stroke-width="2"/><rect x="14" y="22" width="62" height="4" fill="#e0684a"/><path d="M20 22 L26 10 L64 10 L70 22Z" fill="#a8a296" stroke="#5a5650" stroke-width="2"/><path d="M70 22 V4" stroke="#5a5650" stroke-width="2.4"/><rect x="66" y="0" width="10" height="6" rx="2" fill="#2a2a30"/><circle cx="73" cy="3" r="1.5" fill="#7ff7e4"/>' + [24, 45, 66].map(function (x) { return '<circle cx="' + x + '" cy="46" r="8" fill="#2c2a28"/><circle cx="' + x + '" cy="46" r="3" fill="#c8c2b6"/>'; }).join('') + '</g></svg>'; };
    PROPS_ART.moonglass = function () { return '<svg viewBox="0 0 60 60"><ellipse cx="30" cy="56" rx="18" ry="3" fill="rgba(0,0,0,.35)"/><g class="pa-body"><circle cx="30" cy="34" r="20" fill="#7a8a9a" stroke="#3a4a5a" stroke-width="2"/><circle cx="30" cy="34" r="20" fill="url(#mgg)"/><defs><radialGradient id="mgg" cx=".35" cy=".3"><stop offset="0" stop-color="#ffffff" stop-opacity=".9"/><stop offset=".3" stop-color="#bfe8ff" stop-opacity=".5"/><stop offset="1" stop-color="#2a3a5a" stop-opacity=".6"/></radialGradient></defs><path d="M18 40 Q30 30 42 42" stroke="#d4a85a" stroke-width="2.4" fill="none" opacity=".8"/><circle cx="23" cy="26" r="4" fill="#fff" opacity=".85"/></g></svg>'; };
    PROPS_ART.moonflag = function () { return '<svg viewBox="0 0 50 110"><ellipse cx="14" cy="106" rx="10" ry="2.5" fill="rgba(0,0,0,.35)"/><g class="pa-body"><path d="M12 106 V8" stroke="#d8d2c4" stroke-width="3"/><path d="M12 10 H46" stroke="#d8d2c4" stroke-width="2"/><g class="pa-leaves"><path d="M12 12 H46 V40 H12Z" fill="#2f6fb8" stroke="#1a3a6a" stroke-width="1.6"/><circle cx="29" cy="26" r="8" fill="none" stroke="#fff" stroke-width="2"/><path d="M21 26 H37 M29 18 V34" stroke="#fff" stroke-width="1.4"/></g></g></svg>'; };
    PROPS.moon = [
      { id: 'moonrover', x: 80, y: 90, w: 86, sfx: 'beep', fx: 'spin' },
      { id: 'moonglass', x: 22, y: 92, w: 46, sfx: 'chime', fx: 'jiggle', burst: 'sparkles' },
      { id: 'moonflag', x: 9, y: 86, w: 40, sfx: 'rustle', fx: 'wiggle' },
      { id: 'person', x: 63, y: 87, w: 50, talk: 'moon', look: { skin: '#c98e64', shirt: '#e8e2d4', hair: '#1b1410' } },
      { id: 'person', x: 38, y: 88, w: 48, talk: 'moon', look: { skin: '#f1cfb6', shirt: '#d4a85a', hair: '#b8642e' } }
    ];
    PROPS.moon_night = [{ id: 'star', x: 18, y: 9, w: 26, sfx: 'chime', fx: 'shoot' }, { id: 'star', x: 90, y: 13, w: 20, sfx: 'chime', fx: 'shoot' }, { id: 'moonglass', x: 90, y: 40, w: 44, sfx: 'chime', fx: 'jiggle', burst: 'sparkles' }];
  });
})();
