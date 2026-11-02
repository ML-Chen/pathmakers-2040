/* scenes/mars.js - painted backgrounds for Jezero Crater, Mars (Discovery Base, a game forecast for 2041).
   PAINT.mars: late afternoon at the Jezero outpost. The sky is butterscotch, because fine red dust hangs in the thin air.
   The small Sun (Mars is half again as far from it as Earth) has a pale glow close around it. Pressurized greenhouses
   glow pink under red and blue grow lights, with the first tomatoes inside. Beyond them, the layered buttes of the old
   river delta, and on the eastern horizon a regional dust storm walls up the sky. A dust devil wanders the plain.
   PAINT.mars_storm: the same view at night inside the storm, dust streaming past the lit windows.
   PAINT.mars_dusk: the clear evening after. Mars sunsets are blue: fine dust scatters blue light forward, so the sky
   glows blue right around the setting Sun, and Earth shines as the evening star above it.
   Utilities are copied from the header of src/paint_boston.js (docs/MISSIONS.md), so this file paints on its own.
   Everything is seeded, so a scene paints identically every time. Style: flat, graphic poster shapes and fine linework. */
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
  // day: late afternoon, butterscotch sky, a dust storm walling up the east. storm: night inside the storm.
  // dusk: the evening after, clear, with Mars's blue sunset glow around the small Sun and Earth as the evening star.
  var PAL = {
    day: { sky: [[0, '#9a6a4c'], [0.45, '#c8946a'], [0.85, '#e4bc8c'], [1, '#ecca9a']], far: '#c89a7c', far2: '#b8866a', butte: ['#d4a07a', '#a8684a', '#7a4430'], ground: ['#c8784a', '#b0603a', '#8a4428', '#6a321e'], rock: ['#5a2e22', '#3a1c16'], sh: '#5a2a1c', grade: '#ffd8a8', gradeA: 0.1, vig: 0.35, vigCol: '#2a1008' },
    storm: { sky: [[0, '#1a0c08'], [0.5, '#3a1c10'], [0.9, '#6a3418'], [1, '#7a3e1c']], far: '#5a3020', far2: '#4a2818', butte: ['#5a3020', '#4a2618', '#3a1c12'], ground: ['#5a2c18', '#4a2414', '#381a0e', '#2a120a'], rock: ['#2a120a', '#1a0a06'], sh: '#1a0a06', grade: '#ff9a5a', gradeA: 0.12, vig: 0.55, vigCol: '#0a0402' },
    dusk: { sky: [[0, '#1e1a2a'], [0.4, '#3e3038'], [0.75, '#7a5a50'], [1, '#a07a62']], far: '#6a5250', far2: '#5a4244', butte: ['#8a6252', '#5a3a34', '#3a2424'], ground: ['#7a4a34', '#643a28', '#4a2a1e', '#341c14'], rock: ['#2a1612', '#1a0c0a'], sh: '#1e100c', grade: '#b8c8ff', gradeA: 0.08, vig: 0.45, vigCol: '#0a0610' }
  };
  /* ============================== layout ============================== */
  function marsL(w, h) {
    var s = S(w, h), r = rng(7701), i, L = { s: s };
    L.hz = h * 0.405;
    L.sun = { day: [w * 0.2, h * 0.16], dusk: [w * 0.47, h * 0.388] };
    L.rim = function (x) { var u = x / w; return L.hz - h * 0.012 - h * 0.018 * fbm(u * 4, 11, 4) - h * 0.008 * Math.sin(u * 9); };
    // the old river delta: flat-topped buttes with layered sides, on the left
    L.buttes = [[0.02, 0.2, 0.062], [0.25, 0.38, 0.04], [0.86, 0.98, 0.03]];
    L.gh = [[0.02, 0.492, 66], [0.16, 0.512, 76], [0.33, 0.5, 56]];        // greenhouses [x, ground y, length]
    L.hab = [w * 0.7, h * 0.49];
    L.panels = [0.42, 0.58, h * 0.47];
    L.rover = [w * 0.78, h * 0.575, 1];
    L.rocks = []; for (i = 0; i < 40; i++) { var p = Math.pow(r(), 1.1); L.rocks.push([r() * w, lerp(h * 0.43, h * 0.98, p), (1.5 + r() * 3 + p * 14) * s]); }
    L.rocks.push([w * 0.1, h * 0.86, 40 * s], [w * 0.92, h * 0.8, 30 * s]);
    L.ripples = []; for (i = 0; i < 90; i++) { var q = Math.pow(r(), 1.3); L.ripples.push([r() * w, lerp(h * 0.43, h * 0.99, q), (8 + r() * 30) * s * (0.4 + q * 1.8), r()]); }
    L.stars = []; for (i = 0; i < 200; i++) L.stars.push([r() * w, Math.pow(r(), 1.2) * h * 0.34, r()]);
    L.storm = []; for (i = 0; i < 150; i++) { var u = Math.pow(r(), 0.8), top = h * 0.2 * Math.pow(u, 0.9) * (0.85 + 0.15 * fbm(u * 7, 41, 3)); L.storm.push([lerp(w * 0.4, w * 1.1, u), L.hz - r() * top, (8 + r() * 16 + u * 18) * s, r(), top]); } L.storm.sort(function (a, b) { return a[1] - b[1]; });
    L.devil = [w * 0.48, L.hz + h * 0.01];
    return L;
  }
  var marsLM = memo(marsL);
  /* ============================== painting ============================== */
  function sky(ctx, w, h, L, P, v) {
    ctx.fillStyle = lg(ctx, 0, 0, 0, L.hz, P.sky); ctx.fillRect(0, 0, w, L.hz + 2);
    var s = L.s;
    if (v === 'day') { // the small Sun (Mars is farther out) with a pale, bluish-white glow close around it
      var S0 = L.sun.day; glow(ctx, S0[0], S0[1], 120 * s, '#fff4dc', 0.35); glow(ctx, S0[0], S0[1], 30 * s, '#e8f0ff', 0.7);
      ctx.fillStyle = '#fffaf0'; ctx.beginPath(); qcirc(ctx, S0[0], S0[1], 7 * s); ctx.fill();
      // thin dust bands high in the sky
      ctx.save(); ctx.globalAlpha = 0.07; ctx.strokeStyle = '#f4d4a8'; ctx.lineWidth = 0.7 * s; ctx.beginPath(); for (var i = 0; i < 9; i++) { var y = h * (0.06 + i * 0.028); ctx.moveTo(0, y); ctx.bezierCurveTo(w * 0.3, y - 6 * s, w * 0.6, y + 6 * s, w, y - 2 * s); } ctx.stroke(); ctx.restore();
    }
    if (v === 'dusk') {
      dots(ctx, L.stars.length, [['#ffffff', 0.75], ['#ffe8d8', 0.5]], function (k) { var q = L.stars[k]; if (q[1] > h * (0.22 + q[2] * 0.08)) return null; return [q[0], q[1], (0.4 + q[2] * 0.6) * s, q[2] < 0.7 ? 0 : 1]; });
      var D = L.sun.dusk;
      // the blue sunset: fine dust scatters blue light forward, so the sky glows blue right around the Sun
      ctx.save(); ctx.translate(D[0], D[1]); ctx.scale(1.5, 1);
      ctx.fillStyle = rg(ctx, 0, 0, 0, 90 * s, [[0, 'rgba(220,240,255,1)'], [0.16, 'rgba(150,200,245,0.85)'], [0.5, 'rgba(90,140,210,0.4)'], [1, 'rgba(90,140,210,0)']]); ctx.fillRect(-90 * s, -90 * s, 180 * s, 180 * s); ctx.restore(); glow(ctx, D[0], D[1], 30 * s, '#e8f6ff', 0.6);
      ctx.fillStyle = '#f4faff'; ctx.beginPath(); qcirc(ctx, D[0], D[1], 5 * s); ctx.fill();
      // Earth: the bright blue-white evening star above the sunset
      var ex = D[0] + 34 * s, ey = D[1] - 70 * s; glow(ctx, ex, ey, 10 * s, '#bfe0ff', 0.8); ctx.fillStyle = '#eaf6ff'; ctx.beginPath(); qcirc(ctx, ex, ey, 1.8 * s); ctx.fill();
      L.earthStar = [ex, ey];
    }
    if (v === 'storm') { // no sky to speak of: the storm hides everything, lit faintly from below by the base
      for (var k = 0; k < 30; k++) { var rr = rng(900 + k); haze(ctx, rr() * w - 60 * s, rr() * L.hz - 20 * s, rr() * w + 120 * s, rr() * L.hz + 30 * s, '#7a3c1c', 0.12); }
    }
  }
  function stormWall(ctx, w, h, L, P) {
    var s = L.s;
    // a wall of dust rising on the eastern horizon: flat stacked billows, lit on the left by the Sun, dark at the base
    ctx.save();
    var base = lg(ctx, 0, L.hz - h * 0.22, 0, L.hz, [[0, 'rgba(200,130,80,0)'], [0.3, 'rgba(176,104,62,0.75)'], [1, 'rgba(120,62,36,0.95)']]);
    ctx.fillStyle = base; ctx.beginPath(); ctx.moveTo(w * 0.4, L.hz); for (var x = w * 0.4; x <= w + 2; x += 4) { var u = (x - w * 0.4) / (w * 0.6); ctx.lineTo(x, L.hz - h * 0.19 * Math.pow(u, 0.9) * (0.8 + 0.2 * fbm(u * 6, 41, 3))); } ctx.lineTo(w + 2, L.hz); ctx.closePath(); ctx.fill();
    L.storm.forEach(function (b) { var f = clamp((L.hz - b[1]) / Math.max(1, b[4]), 0, 1);
      ctx.fillStyle = mix('#8a4a2c', '#c88a5e', 0.3 + f * 0.6 + b[3] * 0.1); ctx.beginPath(); qcirc(ctx, b[0], b[1], b[2]); ctx.fill();
      if (f > 0.55) { ctx.fillStyle = rgba('#f2c08e', 0.35 * f); ctx.beginPath(); qell(ctx, b[0] - b[2] * 0.25, b[1] - b[2] * 0.3, b[2] * 0.6, b[2] * 0.45, -0.3); ctx.fill(); } });
    // streamers along its foot
    ctx.strokeStyle = 'rgba(240,190,140,0.35)'; ctx.lineWidth = 0.6 * s; ctx.beginPath();
    for (var i = 0; i < 18; i++) { var y = L.hz - i * 1.6 * s, x0 = w * (0.5 + i * 0.02); ctx.moveTo(x0, y); ctx.bezierCurveTo(x0 + 40 * s, y - 2 * s, x0 + 80 * s, y + 1 * s, w, y - 3 * s); } ctx.stroke();
    ctx.restore();
  }
  function farLand(ctx, w, h, L, P, v) {
    var s = L.s, x;
    if (v === 'storm') { haze(ctx, -w * 0.2, L.hz - h * 0.05, w * 1.2, L.hz + h * 0.04, '#6a3418', 0.6); return; }
    // the far crater rim, pale with dust in the air (Mars has enough air for distance haze)
    ctx.fillStyle = P.far; ctx.beginPath(); ctx.moveTo(-1, L.hz + 2); for (x = -1; x <= w + 1; x += 3) ctx.lineTo(x, L.rim(x)); ctx.lineTo(w + 1, L.hz + 2); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = rgba('#000000', 0.12); ctx.lineWidth = 0.6 * s; ctx.beginPath(); for (x = 0; x <= w; x += 3) { if (!x) ctx.moveTo(x, L.rim(x)); else ctx.lineTo(x, L.rim(x)); } ctx.stroke();
    // delta buttes: flat tops, layered sides lit from the left
    L.buttes.forEach(function (B, k) {
      var x0 = B[0] * w, x1 = B[1] * w, top = L.hz - h * B[2], r = rng(310 + k), slope = (x1 - x0) * 0.12;
      var pts = [[x0, L.hz + 3 * s], [x0 + slope * 0.6, top + h * 0.012], [x0 + slope, top], [x1 - slope * 1.3, top + 1 * s], [x1 - slope * 0.4, top + h * 0.016], [x1, L.hz + 3 * s]];
      ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath();
      ctx.fillStyle = lg(ctx, x0, 0, x1, 0, [[0, P.butte[0]], [0.55, P.butte[1]], [1, P.butte[2]]]); ctx.fill();
      ctx.save(); ctx.clip();
      // sediment layers: fine horizontal lines, the record of an ancient lake
      ctx.strokeStyle = rgba(v === 'dusk' ? '#2a1818' : '#6a3420', 0.45); ctx.lineWidth = 0.55 * s; ctx.beginPath();
      for (var j = 0; j < 14; j++) { var y = top + (j + 0.5) * (L.hz - top) / 14 + (r() - 0.5) * 0.8 * s; ctx.moveTo(x0, y); ctx.lineTo(x1, y + (r() - 0.5) * 1.2 * s); } ctx.stroke();
      ctx.fillStyle = rgba('#fff0d8', v === 'dusk' ? 0.08 : 0.25); ctx.fillRect(x0, top, slope * 1.4, L.hz - top);
      ctx.restore();
      ctx.fillStyle = rgba(P.sh, 0.25); ctx.fillRect(x1 - 1, L.hz - 1 * s, (x1 - x0) * 0.5, 2 * s);
    });
    // a light haze where the far land meets the sky
    haze(ctx, -w * 0.1, L.hz - h * 0.03, w * 1.1, L.hz + h * 0.012, v === 'dusk' ? '#7a5a52' : '#e8c094', 0.35);
  }
  function ground(ctx, w, h, L, P, v) {
    var s = L.s, r = rng(4402);
    ctx.fillStyle = lg(ctx, 0, L.hz, 0, h, [[0, P.ground[0]], [0.25, P.ground[1]], [0.6, P.ground[2]], [1, P.ground[3]]]);
    ctx.beginPath(); ctx.moveTo(-1, h); for (var x = -1; x <= w + 1; x += 3) ctx.lineTo(x, L.hz + h * 0.004 - h * 0.006 * fbm(x / w * 3, 61, 3)); ctx.lineTo(w + 1, h); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = rgba(v === 'day' ? '#f4c494' : '#a07060', 0.5); ctx.lineWidth = 0.7 * s; ctx.beginPath(); for (x = 0; x <= w; x += 3) { var yy0 = L.hz + h * 0.004 - h * 0.006 * fbm(x / w * 3, 61, 3); if (!x) ctx.moveTo(x, yy0); else ctx.lineTo(x, yy0); } ctx.stroke();
    // soft patches of darker sand and pale dust
    dabs(ctx, 220, [[P.ground[2], 0.18], [P.ground[0], 0.14], ['#e8a878', v === 'day' ? 0.08 : 0.03]], function () { var p = r(), y = lerp(L.hz, h, p), x = r() * w; return [x, y, (20 + r() * 70) * s * (0.4 + p), (2 + r() * 6) * s * (0.4 + p), (r() * 3) | 0, 0]; });
    // sand ripples: fine graphic linework
    ctx.save(); ctx.lineWidth = 0.7 * s;
    L.ripples.forEach(function (q) { ctx.strokeStyle = rgba(v === 'day' ? '#f0b080' : '#c08060', v === 'day' ? 0.35 : 0.18); ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.quadraticCurveTo(q[0] + q[2] * 0.5, q[1] - q[2] * 0.06, q[0] + q[2], q[1]); ctx.stroke();
      ctx.strokeStyle = rgba(P.sh, 0.3); ctx.beginPath(); ctx.moveTo(q[0] + q[2] * 0.1, q[1] + 1 * s); ctx.quadraticCurveTo(q[0] + q[2] * 0.5, q[1] - q[2] * 0.06 + 1 * s, q[0] + q[2] * 0.9, q[1] + 1 * s); ctx.stroke(); });
    ctx.restore();
    dots(ctx, 1800, [['#000000', 0.12], ['#ffd8b0', 0.08]], function () { var p = r(); return [r() * w, lerp(L.hz, h, p), (0.4 + r() * 0.8) * s * (0.6 + p), r() < 0.6 ? 0 : 1]; });
  }
  function rock(ctx, x, y, R, P, s, seed, v) {
    var r = rng(seed), n = 8, i, pts = [];
    for (i = 0; i < n; i++) { var a = PI + i / (n - 1) * PI; pts.push([x + Math.cos(a) * R * (0.8 + r() * 0.3) * 1.2, y + Math.sin(a) * R * (0.6 + r() * 0.35)]); }
    ctx.fillStyle = rgba(P.sh, v === 'storm' ? 0.25 : 0.5); ctx.beginPath(); qell(ctx, x + R * 1.2, y + R * 0.1, R * 1.7, R * 0.25, 0); ctx.fill();
    ctx.beginPath(); ctx.moveTo(pts[0][0], y + R * 0.1); pts.forEach(function (p) { ctx.lineTo(p[0], p[1]); }); ctx.lineTo(pts[n - 1][0], y + R * 0.1); ctx.closePath();
    ctx.fillStyle = lg(ctx, x - R, 0, x + R, 0, [[0, mix(P.rock[0], '#c89070', v === 'day' ? 0.35 : 0.12)], [0.55, P.rock[0]], [1, P.rock[1]]]); ctx.fill();
    ctx.strokeStyle = rgba('#000000', 0.25); ctx.lineWidth = 0.5 * s; ctx.stroke();
  }
  // a pressurized greenhouse: a clear half-tube glowing pink under red and blue grow lights, rows of tomato plants
  function greenhouse(ctx, x, y, len, P, s, v, k) {
    var R = 15 * s, Lh = len * s, x1 = x + Lh, glowA = v === 'storm' ? 0.5 : v === 'dusk' ? 0.8 : 0.45;
    ctx.fillStyle = rgba(P.sh, 0.45); ctx.beginPath(); qell(ctx, x + Lh * 0.6, y + 1 * s, Lh * 0.7, 3 * s, 0); ctx.fill();
    glow(ctx, x + Lh / 2, y - R * 0.5, Lh * 0.9, '#ff6ad0', glowA * 0.45);
    ctx.save(); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - R * 0.6); ctx.quadraticCurveTo(x, y - R * 1.2, x + R * 0.6, y - R * 1.2); ctx.lineTo(x1 - R * 0.6, y - R * 1.2); ctx.quadraticCurveTo(x1, y - R * 1.2, x1, y - R * 0.6); ctx.lineTo(x1, y); ctx.closePath();
    ctx.fillStyle = lg(ctx, 0, y - R * 1.2, 0, y, [[0, v === 'day' ? '#f4b8e0' : '#ff9ae0'], [0.5, '#e070c0'], [1, '#a04090']]); ctx.fill(); ctx.clip();
    // plants: green rows with red tomatoes
    for (var i = 0; i < Lh / (5 * s); i++) { var px = x + 3 * s + i * 5 * s, ph = (5 + (i % 3)) * s; ctx.fillStyle = i % 2 ? '#2f8a4a' : '#3fa05a'; ctx.beginPath(); qell(ctx, px, y - ph * 0.6, 2.6 * s, ph * 0.6, 0); ctx.fill();
      if ((i + k) % 2 === 0) { ctx.fillStyle = '#e8302a'; ctx.beginPath(); qcirc(ctx, px + 1 * s, y - ph * 0.5, 1.1 * s); ctx.fill(); } }
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(x + R * 0.4, y - R * 1.12, Lh - R * 0.8, 1.4 * s);
    ctx.restore();
    ctx.strokeStyle = v === 'day' ? '#e8e2da' : '#b8a8b0'; ctx.lineWidth = 0.7 * s;
    for (i = 0; i <= 6; i++) { var rx = x + Lh * i / 6; ctx.beginPath(); ctx.moveTo(rx, y); ctx.lineTo(rx, y - R * 1.2); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - R * 0.6); ctx.quadraticCurveTo(x, y - R * 1.2, x + R * 0.6, y - R * 1.2); ctx.lineTo(x1 - R * 0.6, y - R * 1.2); ctx.quadraticCurveTo(x1, y - R * 1.2, x1, y - R * 0.6); ctx.lineTo(x1, y); ctx.stroke();
    // an airlock cap
    ctx.fillStyle = v === 'day' ? '#f2ece4' : '#8a7a7a'; ctx.beginPath(); rrect(ctx, x1 - 1 * s, y - R * 0.9, 5 * s, R * 0.9, 1.5 * s); ctx.fill();
  }
  function habitat(ctx, w, h, L, P, v) {
    var s = L.s, x = L.hab[0], y = L.hab[1], lit = v === 'day';
    ctx.fillStyle = rgba(P.sh, 0.5); ctx.beginPath(); qell(ctx, x + 50 * s, y + 1 * s, 70 * s, 4 * s, 0); ctx.fill();
    // two lander-style cylinders under sandbag shielding, joined by a tunnel
    [[x - 22 * s, 26 * s, 22 * s], [x + 30 * s, 22 * s, 18 * s]].forEach(function (M, k) {
      var mx = M[0], R = M[1], H = M[2];
      ctx.fillStyle = lg(ctx, mx - R, 0, mx + R, 0, lit ? [[0, '#fbf6ee'], [0.5, '#dcd2c6'], [1, '#9a8a80']] : [[0, '#a89a98'], [1, '#4a3a3a']]); ctx.beginPath(); rrect(ctx, mx - R, y - H, R * 2, H, 4 * s); ctx.fill();
      ctx.fillStyle = lg(ctx, mx - R, 0, mx + R, 0, [[0, P.ground[0]], [1, P.ground[2]]]); ctx.beginPath(); ctx.moveTo(mx - R * 1.15, y); ctx.quadraticCurveTo(mx - R, y - H * 1.25, mx, y - H * 1.3); ctx.quadraticCurveTo(mx + R, y - H * 1.25, mx + R * 1.15, y); ctx.closePath(); ctx.globalAlpha = 0.0; ctx.fill(); ctx.globalAlpha = 1;
      // a dome cap of sandbags
      ctx.fillStyle = lg(ctx, mx - R, 0, mx + R, 0, [[0, mix(P.ground[0], '#ffffff', lit ? 0.25 : 0.05)], [1, P.ground[2]]]); ctx.beginPath(); ctx.ellipse(mx, y - H, R * 1.02, R * 0.55, 0, PI, TAU); ctx.fill();
      ctx.strokeStyle = rgba('#000000', 0.18); ctx.lineWidth = 0.5 * s; for (var j = 1; j < 4; j++) { ctx.beginPath(); ctx.ellipse(mx, y - H, R * (1 - j * 0.22), R * 0.55 * (1 - j * 0.22), 0, PI, TAU); ctx.stroke(); }
      ctx.fillStyle = '#ffc261'; for (j = 0; j < 3; j++) { var wx = mx - R * 0.55 + j * R * 0.55, wy = y - H * 0.55; ctx.beginPath(); qcirc(ctx, wx, wy, 2.6 * s); ctx.fill(); glow(ctx, wx, wy, 9 * s, '#ffc261', lit ? 0.15 : 0.45); }
      ctx.fillStyle = '#e0684a'; ctx.fillRect(mx - R, y - H * 0.2, R * 2, 2 * s);
    });
    ctx.fillStyle = lit ? '#d8cec2' : '#6a5a5a'; ctx.fillRect(x + 2 * s, y - 9 * s, 12 * s, 7 * s);
    // comms dish and mast
    ctx.strokeStyle = lit ? '#e8e0d4' : '#8a7a7a'; ctx.lineWidth = 0.9 * s; ctx.beginPath(); ctx.moveTo(x + 30 * s, y - 32 * s); ctx.lineTo(x + 30 * s, y - 48 * s); ctx.stroke();
    ctx.fillStyle = lit ? '#f4eee6' : '#9a8a8a'; ctx.beginPath(); ctx.ellipse(x + 30 * s, y - 50 * s, 9 * s, 4 * s, -0.5, 0, PI); ctx.fill();
    L.beacon = [x + 30 * s, y - 49 * s];
    // a solar field: rows of flat, tilted panels
    var P0 = L.panels; for (var rr = 0; rr < 3; rr++) for (var c = 0; c < 9; c++) { var px = lerp(P0[0] * w, P0[1] * w, c / 8) + rr * 4 * s, py = P0[2] + rr * 6 * s, pw = 11 * s, phh = 3.4 * s;
      ctx.fillStyle = rgba(P.sh, 0.4); ctx.fillRect(px, py + 1 * s, pw * 1.3, 1.2 * s);
      ctx.fillStyle = v === 'storm' ? '#1a1a2a' : '#26306a'; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + pw, py); ctx.lineTo(px + pw + 2 * s, py - phh); ctx.lineTo(px + 2 * s, py - phh); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = v === 'day' ? 'rgba(200,160,120,0.6)' : 'rgba(120,90,80,0.5)'; ctx.lineWidth = 0.4 * s; ctx.stroke();
      if (v === 'day') { ctx.fillStyle = 'rgba(232,188,140,0.45)'; ctx.fillRect(px + 2 * s, py - phh, pw, 0.9 * s); } }
  }
  function rover(ctx, w, h, L, P, v) {
    var s = L.s, x = L.rover[0], y = L.rover[1], u = 8 * s, lit = v === 'day';
    ctx.fillStyle = rgba(P.sh, 0.5); ctx.beginPath(); qell(ctx, x + 6 * u, y + 0.3 * u, 7 * u, 0.6 * u, 0); ctx.fill();
    // a pressurized rover: a rounded cabin with big windows on six mesh wheels
    ctx.fillStyle = lg(ctx, x - 4 * u, 0, x + 4 * u, 0, lit ? [[0, '#fbf6ee'], [0.6, '#d8cec2'], [1, '#9a8a80']] : [[0, '#9a8a8a'], [1, '#3a2e2e']]);
    ctx.beginPath(); ctx.moveTo(x - 4 * u, y - 1.2 * u); ctx.lineTo(x - 4 * u, y - 3 * u); ctx.quadraticCurveTo(x - 4 * u, y - 4.2 * u, x - 2.6 * u, y - 4.2 * u); ctx.lineTo(x + 2.4 * u, y - 4.2 * u); ctx.quadraticCurveTo(x + 4.2 * u, y - 4 * u, x + 4.4 * u, y - 2.4 * u); ctx.lineTo(x + 4.4 * u, y - 1.2 * u); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = rgba('#000000', 0.3); ctx.lineWidth = 0.7 * s; ctx.stroke();
    ctx.fillStyle = v === 'storm' ? '#ffc261' : '#2a3a5a'; ctx.beginPath(); rrect(ctx, x + 1.2 * u, y - 3.8 * u, 2.8 * u, 1.4 * u, 0.5 * u); ctx.fill();
    ctx.fillStyle = lit ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)'; ctx.fillRect(x + 1.5 * u, y - 3.6 * u, 1 * u, 0.3 * u);
    ctx.fillStyle = '#e0684a'; ctx.fillRect(x - 4 * u, y - 2.3 * u, 8.4 * u, 0.35 * u);
    ctx.fillStyle = '#2a2020'; ctx.fillRect(x - 3.4 * u, y - 1.3 * u, 7.4 * u, 0.5 * u);
    for (var i = 0; i < 3; i++) { var wx = x - 2.8 * u + i * 2.9 * u; ctx.fillStyle = '#2a2020'; ctx.beginPath(); qcirc(ctx, wx, y - 0.4 * u, 0.95 * u); ctx.fill(); ctx.strokeStyle = lit ? '#b8aca0' : '#6a5a5a'; ctx.lineWidth = 0.4 * s; ctx.beginPath(); for (var k = 0; k < 6; k++) { var a = k / 6 * PI; ctx.moveTo(wx + Math.cos(a) * 0.9 * u, y - 0.4 * u + Math.sin(a) * 0.9 * u); ctx.lineTo(wx - Math.cos(a) * 0.9 * u, y - 0.4 * u - Math.sin(a) * 0.9 * u); } ctx.stroke(); }
    ctx.strokeStyle = lit ? '#e8e0d4' : '#7a6a6a'; ctx.lineWidth = 0.8 * s; ctx.beginPath(); ctx.moveTo(x - 3 * u, y - 4.2 * u); ctx.lineTo(x - 3 * u, y - 5.6 * u); ctx.stroke();
    L.roverLight = [x + 4.4 * u, y - 2 * u]; L.roverTop = [x - 3 * u, y - 5.8 * u];
  }
  function paintMars(v) {
    return function (ctx, w, h) {
      try {
        var P = PAL[v], L = marsLM(w, h), s = L.s;
        sky(ctx, w, h, L, P, v);
        if (v === 'day') stormWall(ctx, w, h, L, P);
        farLand(ctx, w, h, L, P, v);
        ground(ctx, w, h, L, P, v);
        L.rocks.forEach(function (q, k) { if (q[1] > L.hz + 4 * s) rock(ctx, q[0], q[1], q[2], P, s, 800 + k, v); });
        L.gh.forEach(function (g, k) { greenhouse(ctx, w * g[0], h * g[1], g[2], P, s, v, k); });
        habitat(ctx, w, h, L, P, v); rover(ctx, w, h, L, P, v);
        if (v === 'storm') { // dust hangs over everything, lit warm from below by the windows
          ctx.save(); ctx.fillStyle = 'rgba(90,40,20,0.35)'; ctx.fillRect(0, 0, w, h); ctx.restore();
          glow(ctx, w * 0.2, h * 0.49, w * 0.35, '#ff7ad0', 0.12); glow(ctx, L.hab[0], L.hab[1] - 12 * s, w * 0.3, '#ffb860', 0.18);
        }
        if (v === 'dusk') { ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = lg(ctx, L.sun.dusk[0], 0, w, 0, [[0, 'rgba(140,180,255,0.35)'], [1, 'rgba(40,30,60,0.3)']]); ctx.fillRect(0, L.hz, w, h - L.hz); ctx.restore(); }
        finish(ctx, w, h, P.grade, P.gradeA, P.vig, 0.04, P.vigCol, 0.42);
      } catch (e) { PAINT._err = 'mars_' + v + ': ' + String(e && e.stack || e); }
    };
  }
  function overlayMars(v) {
    return function (ctx, w, h, t) {
      try {
        var L = marsLM(w, h), s = L.s, i;
        ctx.save();
        // grow lights pulsing softly in the greenhouses
        var gp = 0.5 + 0.5 * Math.sin(t * 0.8); L.gh.forEach(function (g, k) { glow(ctx, w * g[0] + g[2] * s / 2, h * g[1] - 8 * s, g[2] * s * 0.7, '#ff7ad0', (v === 'storm' ? 0.1 : 0.06) * (0.6 + 0.4 * Math.sin(t * 0.8 + k))); });
        // the habitat beacon and the rover's lights
        var sp = glowSpr('#ff5a3a', true), bl = Math.pow(Math.max(0, Math.sin(t * 2)), 10);
        if (sp && L.beacon) { ctx.globalAlpha = 0.3 + bl * 0.7; var z = (2 + bl * 3) * s; ctx.drawImage(sp, L.beacon[0] - z, L.beacon[1] - z, z * 2, z * 2); }
        if (sp && L.roverTop) { ctx.globalAlpha = 0.3 + 0.7 * Math.pow(Math.max(0, Math.sin(t * 2 + 1.5)), 10); ctx.drawImage(sp, L.roverTop[0] - 3 * s, L.roverTop[1] - 3 * s, 6 * s, 6 * s); }
        ctx.globalAlpha = 1;
        if (v === 'day') {
          // a dust devil wandering across the plain, and wisps of dust blowing low over the ground
          var dx = L.devil[0] + Math.sin(t * 0.05) * w * 0.12, dy = L.devil[1], H = 46 * s;
          for (i = 0; i < 14; i++) { var f = i / 13, ww = (2 + f * 10) * s, wob = Math.sin(t * 3 + i * 0.7) * 2 * s * f; ctx.fillStyle = rgba('#e0a070', 0.16 + 0.1 * (1 - f)); ctx.beginPath(); qell(ctx, dx + wob + f * 8 * s, dy - f * H, ww, 2 * s + f * 1.5 * s, 0); ctx.fill(); }
          for (i = 0; i < 10; i++) { var ph = (t * 0.06 + hash(i, 9)) % 1, yy = L.hz + (0.02 + hash(i, 8) * 0.25) * h, xx = w * (1.1 - ph * 1.3), ln = (30 + hash(i, 7) * 60) * s; ctx.strokeStyle = rgba('#f0c090', 0.18 * Math.sin(ph * PI)); ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.moveTo(xx, yy); ctx.quadraticCurveTo(xx + ln * 0.5, yy - 3 * s, xx + ln, yy); ctx.stroke(); }
          // the storm wall's billows churn slowly
          L.storm.forEach(function (b, k) { if (k % 3) return; ctx.fillStyle = rgba('#f0b884', 0.12 + 0.08 * Math.sin(t * 0.4 + k)); ctx.beginPath(); qcirc(ctx, b[0] + Math.sin(t * 0.2 + k) * 3 * s, b[1] - 2 * s, b[2] * 0.5); ctx.fill(); });
        } else if (v === 'storm') {
          // dust streaming sideways through the dark
          ctx.lineCap = 'round';
          for (i = 0; i < 90; i++) { var p2 = (t * (0.25 + hash(i, 3) * 0.4) + hash(i, 4)) % 1, y2 = hash(i, 5) * h, x2 = w * (1.2 - p2 * 1.5), l2 = (20 + hash(i, 6) * 60) * s; ctx.strokeStyle = rgba(i % 3 ? '#c87a4a' : '#e8a070', 0.12 + 0.12 * hash(i, 2)); ctx.lineWidth = (0.6 + hash(i, 1) * 1.6) * s; ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 + l2, y2 - l2 * 0.06); ctx.stroke(); }
          for (i = 0; i < 6; i++) { var hp = (t * 0.03 + i / 6) % 1; haze(ctx, w * (1.2 - hp * 1.6) - 120 * s, h * (0.2 + i * 0.12), w * (1.2 - hp * 1.6) + 120 * s, h * (0.26 + i * 0.12), '#8a4a24', 0.18); }
          if (L.roverLight) { var hl = glowSpr('#fff2c8', true); if (hl) { ctx.globalAlpha = 0.8; ctx.drawImage(hl, L.roverLight[0] - 8 * s, L.roverLight[1] - 8 * s, 16 * s, 16 * s); } }
        } else {
          // the evening star twinkles faintly (Mars has a thin atmosphere) and a few stars brighten
          if (L.earthStar) { var tw = 0.75 + 0.25 * Math.sin(t * 3.1); var es = glowSpr('#cfe6ff', true); if (es) { ctx.globalAlpha = tw; ctx.drawImage(es, L.earthStar[0] - 6 * s, L.earthStar[1] - 6 * s, 12 * s, 12 * s); } }
        }
        ctx.restore();
      } catch (e) { PAINT._err = 'mars overlay: ' + String(e && e.stack || e); }
    };
  }
  // anchors (fractions of w,h): the storm, the greenhouses, the habitat, the Sun; the middle stays clear for portraits
  PAINT.mars = { focus: { x: 0.2, y: 0.16 }, track: 'morning', anchors: { storm: { x: 0.85, y: 0.3 }, greenhouse: { x: 0.17, y: 0.49 }, hab: { x: 0.7, y: 0.47 } }, paint: paintMars('day'), overlay: overlayMars('day') };
  PAINT.mars_storm = { focus: { x: 0.7, y: 0.47 }, track: 'night', anchors: { greenhouse: { x: 0.17, y: 0.49 }, hab: { x: 0.7, y: 0.47 } }, paint: paintMars('storm'), overlay: overlayMars('storm') };
  PAINT.mars_dusk = { focus: { x: 0.3, y: 0.39 }, track: 'night', anchors: { sun: { x: 0.3, y: 0.39 }, greenhouse: { x: 0.17, y: 0.49 } }, paint: paintMars('dusk'), overlay: overlayMars('dusk') };

  /* ============================== tappable props ============================== */
  if (typeof LATE !== 'undefined') LATE.push(function () {
    if (typeof PROPS === 'undefined' || typeof PROPS_ART === 'undefined') return;
    PROPS_ART.marstomato = function () { return '<svg viewBox="0 0 60 70"><ellipse cx="30" cy="66" rx="18" ry="3" fill="rgba(0,0,0,.3)"/><g class="pa-body"><path d="M14 44 h32 l-4 22 h-24z" fill="#c8643a" stroke="#5a2a1a" stroke-width="2"/><g class="pa-leaves"><path d="M30 44 V18" stroke="#2f8a4a" stroke-width="3"/><path d="M30 30 C20 26 16 18 20 12 C26 18 30 22 30 30Z M30 26 C40 22 44 14 40 8 C34 14 30 18 30 26Z" fill="#3fa05a" stroke="#1a4a2a" stroke-width="1.4"/><circle cx="22" cy="34" r="6" fill="#e8302a" stroke="#7a1a14" stroke-width="1.4"/><circle cx="38" cy="30" r="5" fill="#ff8a3a" stroke="#7a3a14" stroke-width="1.4"/><circle cx="20" cy="32" r="1.8" fill="#fff" opacity=".7"/></g></g></svg>'; };
    PROPS_ART.marsrock = function () { return '<svg viewBox="0 0 70 50"><ellipse cx="40" cy="46" rx="28" ry="3" fill="rgba(0,0,0,.3)"/><g class="pa-body"><path d="M8 44 C6 30 16 14 32 12 C48 10 62 24 62 44Z" fill="#7a3a26" stroke="#3a1a10" stroke-width="2"/><path d="M14 36 h40 M12 28 h36 M18 20 h24" stroke="#c8784a" stroke-width="1.4" opacity=".7"/><path d="M14 30 C16 20 24 16 32 15" stroke="#e8a070" stroke-width="2.4" fill="none" opacity=".6"/></g></svg>'; };
    PROPS_ART.marsdrone = function () { return '<svg viewBox="0 0 70 50"><ellipse cx="35" cy="47" rx="16" ry="2.4" fill="rgba(0,0,0,.25)"/><g class="pa-body"><path d="M6 14 h20 M44 14 h20" stroke="#5a4a4a" stroke-width="3" stroke-linecap="round"/><path d="M16 14 V22 M54 14 V22" stroke="#5a4a4a" stroke-width="2.4"/><rect x="14" y="20" width="42" height="14" rx="7" fill="#f2ece4" stroke="#5a4a4a" stroke-width="2"/><rect x="28" y="24" width="14" height="6" rx="3" fill="#1a1420"/><circle cx="35" cy="27" r="2" fill="#ffb070"/><path d="M14 27 h42" stroke="#e07a48" stroke-width="2"/></g></svg>'; };
    PROPS.mars = [
      { id: 'marstomato', x: 14, y: 92, w: 48, sfx: 'rustle', fx: 'wiggle', burst: 'leaves' },
      { id: 'marsrock', x: 86, y: 92, w: 56, sfx: 'click', fx: 'jiggle' },
      { id: 'marsdrone', x: 60, y: 30, w: 52, sfx: 'beep', fx: 'spin' },
      { id: 'person', x: 36, y: 88, w: 48, talk: 'mars', look: { skin: '#d8a888', shirt: '#e07a48', hair: '#2a1a14' } }
    ];
    PROPS.mars_dusk = [{ id: 'marstomato', x: 84, y: 92, w: 48, sfx: 'rustle', fx: 'wiggle', burst: 'hearts' }, { id: 'star', x: 70, y: 12, w: 22, sfx: 'chime', fx: 'shoot' }];
    PROPS.mars_storm = [{ id: 'marsdrone', x: 80, y: 86, w: 52, sfx: 'beep', fx: 'spin' }];
  });
})();
