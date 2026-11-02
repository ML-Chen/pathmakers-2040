/* scenes/moon.js - painted backgrounds for the Moon's south pole (Moon Market, a game forecast for 2041).
   PAINT.moon: we stand on the broad crest of Shackleton Crater's rim. The Sun skims the horizon on the far left, 1.5
   degrees up and white (no air to redden it), so light rakes sideways across the ground and every hill, boulder, dome
   and solar mast throws a shadow many times its own height to the right. The sky is black, with the Milky Way and Earth
   (real continents, clouds, a sun glint on the ocean and city lights on its night side) over the far massifs. Across the
   21 km bowl only the sunward inner wall is lit; the rest never sees the Sun, and ice-mining robots work down there by
   lamplight. The base sits on the rim plateau: regolith-shelled domes with warm windows, the glass Market Dome, tall
   solar masts that catch the light, a landing pad and a terraced pit. The Copy Works, the self-copying robot factory with
   its treaty copy counter, stands on the far rim at the right, with a rail line running along the rim.
   PAINT.moon_night: the same view after the Sun has slipped behind the hills. Earthlight tints the ground blue-grey,
   the windows glow, the highest peaks still catch the Sun and the whole Milky Way comes out.
   The ground is a heightfield rendered at half resolution with swept shadows (see terrain()); the sky, Earth and the
   Milky Way are painted pixel by pixel at reduced size; the base and props are vector shapes. Utilities are copied
   from the header of src/paint_boston.js (docs/MISSIONS.md), so this file paints on its own. Everything is seeded, so
   a scene paints identically every time. */
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

  /* ============================== fast lattice noise ============================== */
  // a 256x256 table of seeded values, read with smooth bilinear steps (much faster than hashing per sample)
  var NT = null;
  function ntab() { if (!NT) { var r = rng(77177); NT = new Float32Array(65536); for (var i = 0; i < 65536; i++) NT[i] = r(); } return NT; }
  function vt(x, y) {
    var T = NT, ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
    var ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
    var i0 = ix & 255, i1 = (ix + 1) & 255, j0 = (iy & 255) << 8, j1 = ((iy + 1) & 255) << 8;
    var a = T[j0 | i0], b = T[j0 | i1], c = T[j1 | i0], d = T[j1 | i1];
    return a + (b - a) * ux + (c - a + (a - b - c + d) * ux) * uy;
  }
  function ft(x, y, oct) { var v = 0, a = 0.5, n = 0; for (var o = 0; o < oct; o++) { v += a * vt(x, y); n += a; var nx = x * 1.62 - y * 1.18 + 17.3, ny = x * 1.18 + y * 1.62 + 5.9; x = nx; y = ny; a *= 0.5; } return v / n; }
  function ridged(x, y, oct) { var v = 0, a = 0.5, n = 0, w = 1; for (var o = 0; o < oct; o++) { var q = 1 - Math.abs(vt(x, y) * 2 - 1); q *= q; v += a * q * w; w = clamp(q * 1.6, 0, 1); n += a; var nx = x * 1.71 - y * 1.12 + 3.1, ny = x * 1.12 + y * 1.71 + 9.7; x = nx; y = ny; a *= 0.5; } return v / n; }
  // gradient (Perlin) noise on the same kind of table: no blocky lattice in the slopes, which the raking light would show
  var GX = null, GY = null;
  function gtab() { if (!GX) { var r = rng(5511); GX = new Float32Array(65536); GY = new Float32Array(65536); for (var i = 0; i < 65536; i++) { var a = r() * TAU; GX[i] = Math.cos(a); GY[i] = Math.sin(a); } } }
  function pt(x, y) {
    var ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
    var ux = fx * fx * fx * (fx * (fx * 6 - 15) + 10), uy = fy * fy * fy * (fy * (fy * 6 - 15) + 10);
    var i0 = ix & 255, i1 = (ix + 1) & 255, j0 = (iy & 255) << 8, j1 = ((iy + 1) & 255) << 8, k;
    k = j0 | i0; var a = GX[k] * fx + GY[k] * fy; k = j0 | i1; var b = GX[k] * (fx - 1) + GY[k] * fy;
    k = j1 | i0; var c = GX[k] * fx + GY[k] * (fy - 1); k = j1 | i1; var d = GX[k] * (fx - 1) + GY[k] * (fy - 1);
    return 0.5 + 0.75 * (a + (b - a) * ux + (c - a + (a - b - c + d) * ux) * uy);
  }
  function pridged(x, y, oct) { var v = 0, a = 0.5, n = 0, w = 1; for (var o = 0; o < oct; o++) { var q = 1 - Math.abs(pt(x, y) * 2 - 1); q *= q; v += a * q * w; w = clamp(q * 1.8, 0, 1); n += a; var nx = x * 1.71 - y * 1.12 + 3.1, ny = x * 1.12 + y * 1.71 + 9.7; x = nx; y = ny; a *= 0.5; } return v / n; }
  function pf(x, y, oct) { var v = 0, a = 0.5, n = 0; for (var o = 0; o < oct; o++) { v += a * pt(x, y); n += a; var nx = x * 1.62 - y * 1.18 + 17.3, ny = x * 1.18 + y * 1.62 + 5.9; x = nx; y = ny; a *= 0.5; } return v / n; }

  /* ============================== the world ==============================
     World metres: X to the right, Z away from us, Y up. We stand on the broad crest of Shackleton's rim, 150 m above the
     ground, looking across the 21 km crater. The Sun skims the horizon on the left, 1.5 degrees up, so the light rakes
     sideways across everything; Earth hangs over the far massifs on the right. */
  var CR = { x: -1500, z: 11700, r: 10500, d: 3800 };      // Shackleton: centre, radius to the brink, depth
  var CAM = 190;                                          // eye height
  var MINE = { x: 96, z: 700, r: 58, steps: 5, d: 14 };  // the terraced ice-and-metal pit on the rim plateau
  // the far massifs [x, z, radius, height]
  var MASS = [[4600, 34000, 9500, 4400], [-2600, 29500, 6500, 2300], [-9500, 38000, 9000, 3000], [12500, 41000, 10000, 3800], [1500, 47000, 13000, 4200], [-17000, 45000, 11000, 2800], [8200, 26500, 3600, 1100], [-6000, 25500, 3000, 700]];
  var PAD = [{ x: -120, z: 760, r: 200 }, { x: 40, z: 1000, r: 90 }]; // graded ground under the base and the landing pad
  function Hm(X, Z, fp) {
    var h = 12 * pt(X * 0.0009 + 11.3, Z * 0.0009 + 5.1) + 4 * pt(X * 0.0034 + 3.7, Z * 0.0034 + 9.2);
    if (fp < 40) h += 0.8 * pt(X * 0.008 + 1.1, Z * 0.008 + 7.3);
    // small craters on the plateau (one per cell, seeded), only where they are big enough to see
    if (Z < 9000 && Z > 420) {
      var C = 140, ix = Math.floor(X / C), iz = Math.floor(Z / C), a, b;
      for (a = -1; a <= 1; a++) for (b = -1; b <= 1; b++) {
        var cx = ix + a, cz = iz + b, hh = h2(cx, cz, 917); if (hh > 0.42) continue;
        var px = (cx + h2(cx, cz, 918)) * C, pz = (cz + h2(cx, cz, 919)) * C, R = C * (0.1 + 0.22 * Math.pow(h2(cx, cz, 920), 1.5));
        if (R < fp * 1.5) continue;
        var dd = ((X - px) * (X - px) + (Z - pz) * (Z - pz)) / (R * R);
        if (dd < 2.2) { h += dd < 1 ? -R * 0.22 * (1 - dd) : 0; h += R * 0.05 * Math.exp(-(dd - 1) * (dd - 1) * 6); }
      }
    }
    // the graded pads under the base are smoothed flat
    for (var p = 0; p < PAD.length; p++) { var P = PAD[p], q = ((X - P.x) * (X - P.x) + (Z - P.z) * (Z - P.z)) / (P.r * P.r); if (q < 1) h *= 0.25 + 0.75 * smooth(0.3, 1, q); }
    // the terraced pit: benches stepping down, each riser a short steep wall
    var mx = X - MINE.x, mz = (Z - MINE.z) * 1.0, mr = Math.sqrt(mx * mx + mz * mz) / MINE.r;
    if (mr < 1.15) h -= 3 * smooth(1.15, 0.7, mr);   // the ground dips gently toward the pit (the pit itself is drawn in pit())
    // Shackleton: the brink wanders a little, the wall is steep at the top and slumped into terraces lower down
    var dx = X - CR.x, dz = Z - CR.z, ang = Math.atan2(dz, dx), rr = Math.sqrt(dx * dx + dz * dz) / CR.r;
    if (rr > 0.85 && rr < 1.15) rr /= 1 + 0.035 * (pf(ang * 5 + 1.3, 2.2, 3) - 0.5);
    if (rr < 1) {
      var t = clamp((1 - rr) / 0.62, 0, 1), wall = t < 1 ? Math.pow(t, 0.72) * (1.32 - 0.32 * t) : 1;
      h -= CR.d * wall;
      if (t > 0.01 && t < 1) { var sw = Math.sin(t * PI); h += 300 * sw * (pf(ang * 5 + 3, t * 4.5, 3) - 0.5); h += 130 * sw * (pt(ang * 26, t * 2.2) - 0.5) + 50 * sw * (pt(ang * 70 + 4, t * 3) - 0.5);
        var tq = t * 9 + 0.6 * pt(ang * 8, 1.7), tk = Math.floor(tq); h -= 70 * sw * (tk + smooth(0.6, 1, tq - tk)); }
    }
    h += 260 * Math.exp(-(rr - 1) * (rr - 1) / 0.006) * smooth(0.9, 1.25, Z / CR.z);  // raised far rim
    return h - (X * X + Z * Z) / 3474000;   // the Moon is small: the ground falls away over the horizon
  }

  /* ============================== layout ============================== */
  function moonL(w, h) {
    ntab(); gtab();
    var s = S(w, h), r = rng(9001), L = { s: s, w: w, h: h };
    L.f = h * 0.95; L.hz = h * 0.355; L.cx = w / 2;
    L.P = function (X, Y, Z) { return [L.cx + X * L.f / Z, L.hz + (CAM - Y) * L.f / Z]; };
    L.G = function (X, Z) { return Hm(X, Z, 1); };
    L.k = function (Z) { return L.f / Z; }; // pixels per metre at depth Z
    L.sun = [w * 0.07, h * 0.334];
    L.earth = [w * 0.77, h * 0.155, Math.min(w * 0.115, 46 * s)];
    // the Milky Way: a band from the upper left to the lower right, behind Earth
    L.mw = { x0: -0.05 * w, y0: h * 0.015, x1: w * 1.05, y1: h * 0.27 };
    // the base on the rim plateau (world x, z, size in metres)
    L.domes = [[-168, 820, 26, 1], [-118, 900, 19, 2], [-190, 690, 17, 3], [-40, 820, 15, 4]];
    L.market = [-92, 640, 34];
    L.masts = [[-262, 940, 92], [-196, 1130, 118], [-58, 1170, 104], [92, 1110, 96], [-120, 1060, 70]];
    L.lander = [44, 1000];
    // lamps [x, z, height, reach, r, g, b, strength, on by day]: floodlights in the pit, yard lights at the base
    L.lamps = [[60, 704, 16, 40, 255, 190, 120, 0.5, 1], [136, 690, 16, 34, 255, 214, 170, 0.4, 1], [-70, 610, 8, 60, 255, 186, 110, 0.75, 0], [-150, 780, 8, 70, 255, 180, 100, 0.6, 0], [40, 990, 6, 50, 255, 200, 140, 0.55, 0], [-40, 840, 6, 40, 255, 190, 120, 0.5, 0]];
    L.miners = []; for (var i = 0; i < 12; i++) L.miners.push([-3500 + r() * 9000, 16500 + r() * 3500, r()]);
    L.track = [[-50, 640], [10, 600], [70, 520], [96, 400], [80, 280], [30, 200]];   // the road from the market to the pit and toward us
    L.stars = []; for (i = 0; i < 900; i++) L.stars.push([r() * w, Math.pow(r(), 1.15) * h * 0.37, r(), r()]);
    L.rocks = [];
    for (i = 0; i < 22; i++) { var Z = 210 + Math.pow(r(), 1.6) * 900, X = (r() - 0.5) * Z * 0.9 * (w / h) * 2.4; L.rocks.push([X, Z, 0.6 + r() * 2.4 + (Z < 300 ? 1.5 : 0)]); }
    L.rocks.push([-118, 236, 6.5], [92, 262, 4.6], [-60, 330, 2.8]);
    // boulders strewn along the brink of the crater
    for (i = 0; i < 16; i++) { var bx = (r() - 0.5) * 700, bz = CR.z - Math.sqrt(CR.r * CR.r - (bx - CR.x) * (bx - CR.x)) - 30 - r() * 120; L.rocks.push([bx, bz, 2 + r() * 5]); }
    return L;
  }
  var moonLM = memo(moonL);

  /* ============================== the sky ============================== */
  // the Milky Way: dusty starlight in a soft band, the bright warm core, dark rifts, a few pink nebulae
  function milkyWay(ctx, w, h, L, night) {
    var q = 4, W = Math.ceil(w / q), Hh = Math.ceil(h * 0.42 / q), cv = mk(W, Hh); if (!cv) return;
    var g = cv.getContext('2d'), id = g.createImageData(W, Hh), D = id.data, M = L.mw;
    var ax = M.x1 - M.x0, ay = M.y1 - M.y0, len = Math.sqrt(ax * ax + ay * ay), ux = ax / len, uy = ay / len, bw = h * 0.07;
    var core = 0.42, gain = night ? 1.15 : 0.75, x, y;
    for (y = 0; y < Hh; y++) for (x = 0; x < W; x++) {
      var px = x * q, py = y * q, dx = px - M.x0, dy = py - M.y0, along = (dx * ux + dy * uy) / len, across = (-dx * uy + dy * ux) / bw;
      var wob = (ft(along * 3.1 + 2, 7.7, 3) - 0.5) * 1.3, a2 = across - wob;
      var env = Math.exp(-a2 * a2 * 0.9), cg = Math.exp(-Math.pow((along - core) / 0.11, 2)) * Math.exp(-a2 * a2 * 2.6);
      var n1 = ft(px / h * 7, py / h * 7, 4), n2 = ft(px / h * 22 + 9, py / h * 22 + 3, 3), n3 = vt(px / h * 70 + 1, py / h * 70 + 5);
      var dens = env * (0.15 + 1.25 * n1 * n1) * (0.55 + 0.9 * n2 * n2 * 1.6) * (0.75 + 0.5 * n3) + cg * 0.5 * (0.5 + n1);
      // dark dust lanes along the band (the Great Rift), ragged at the edges
      var rift = Math.exp(-Math.pow((a2 + 0.25 - (ft(along * 6, 3.3, 3) - 0.5) * 1.4) / 0.32, 2)) * smooth(0.15, 0.55, along) * (1 - smooth(0.72, 0.95, along));
      dens *= 1 - 0.85 * rift * (0.6 + 0.6 * n2);
      dens = Math.max(0, dens - 0.12) * gain;
      var o = (y * W + x) * 4, warm = clamp(cg * 1.4, 0, 1), pink = Math.max(0, n2 - 0.72) * 3 * env * (1 - rift);
      D[o] = clamp((118 + warm * 120 + pink * 120) * dens, 0, 255);
      D[o + 1] = clamp((128 + warm * 70) * dens, 0, 255);
      D[o + 2] = clamp((210 - warm * 40 + pink * 50) * dens, 0, 255);
      D[o + 3] = 255;
    }
    g.putImageData(id, 0, 0);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(cv, 0, 0, W * q, Hh * q); ctx.restore();
  }
  function sky(ctx, w, h, L, night) {
    var s = L.s;
    ctx.fillStyle = lg(ctx, 0, 0, 0, h * 0.45, [[0, '#010104'], [0.7, '#03040a'], [1, night ? '#070a16' : '#06070c']]); ctx.fillRect(0, 0, w, h * 0.5);
    milkyWay(ctx, w, h, L, night);
    // stars: far more along the band; a few bright ones get a soft halo and a tiny cross (light in the eye, no twinkle)
    var M = L.mw, ax = M.x1 - M.x0, ay = M.y1 - M.y0, len = Math.sqrt(ax * ax + ay * ay), bw = h * 0.09;
    var band = function (x, y) { var dx = x - M.x0, dy = y - M.y0, a = (-dx * ay + dy * ax) / len / bw; return Math.exp(-a * a); };
    var st = L.stars, lim = night ? 1 : 0.5;
    dots(ctx, st.length, [['#ffffff', night ? 0.9 : 0.6], ['#c8d4ff', night ? 0.75 : 0.45], ['#ffe2c4', night ? 0.7 : 0.4], ['#ffffff', night ? 0.35 : 0.2]], function (k) {
      var q2 = st[k], b = band(q2[0], q2[1]); if (q2[2] > lim * (0.3 + 0.7 * b) + (night ? 0.0 : 0.1)) return null;
      var big = q2[3] > 0.985; return [q2[0], q2[1], (big ? 1.0 : 0.3 + q2[3] * 0.45) * s, big ? 0 : (k % 4)];
    });
    var r = rng(4410);
    for (var i = 0; i < (night ? 900 : 380); i++) { // fine dust of faint stars inside the band
      var u = r(), x = lerp(M.x0, M.x1, u), y = lerp(M.y0, M.y1, u), off = (r() + r() + r() - 1.5) * bw * 0.9;
      x += -ay / len * off; y += ax / len * off; if (r() > band(x, y) + 0.15) continue;
      ctx.fillStyle = r() < 0.3 ? 'rgba(255,236,214,0.55)' : 'rgba(220,228,255,0.5)'; ctx.fillRect(x, y, 0.45 * s, 0.45 * s);
    }
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (i = 0; i < st.length; i++) { var q3 = st[i]; if (q3[3] < 0.985 || (!night && q3[2] > 0.6)) continue;
      var col = q3[2] < 0.3 ? '#bcd0ff' : q3[2] < 0.6 ? '#ffffff' : '#ffd8b0';
      glow(ctx, q3[0], q3[1], 5 * s, col, 0.35);
      ctx.strokeStyle = rgba(col, 0.45); ctx.lineWidth = 0.4 * s; ctx.beginPath(); ctx.moveTo(q3[0] - 4 * s, q3[1]); ctx.lineTo(q3[0] + 4 * s, q3[1]); ctx.moveTo(q3[0], q3[1] - 4 * s); ctx.lineTo(q3[0], q3[1] + 4 * s); ctx.stroke(); }
    ctx.restore();
  }
  // the Sun itself, painted before the hills so they cut it off; the bloom goes on after
  function sunDisk(ctx, w, h, L) {
    var s = L.s, x = L.sun[0], y = L.sun[1];
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    // zodiacal light: sunlit dust along the plane of the planets, leaning up and to the right
    ctx.save(); ctx.translate(x, y); ctx.rotate(-0.42); ctx.scale(1, 0.22); glow(ctx, w * 0.22, 0, w * 0.6, '#fff2dc', 0.07); ctx.restore();
    glow(ctx, x, y, 150 * s, '#fff4e4', 0.16); glow(ctx, x, y, 42 * s, '#ffffff', 0.7);
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); qcirc(ctx, x, y, 7 * s); ctx.fill();
    ctx.restore();
  }
  function sunBloom(ctx, w, h, L) {
    var s = L.s, x = L.sun[0], y = L.sun[1] - 1 * s;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    glow(ctx, x, y, 26 * s, '#ffffff', 0.95); glow(ctx, x, y, 60 * s, '#fff6ea', 0.35);
    // a long thin streak along the horizon and a few short spikes
    ctx.save(); ctx.translate(x, y); ctx.scale(1, 0.018); glow(ctx, 0, 0, w * 0.75, '#fff8f0', 0.55); ctx.restore();
    for (var i = 0; i < 8; i++) { var a = i / 8 * TAU + 0.3, l2 = (i % 2 ? 34 : 70) * s;
      ctx.strokeStyle = lg(ctx, x, y, x + Math.cos(a) * l2, y + Math.sin(a) * l2, [[0, 'rgba(255,255,255,0.7)'], [1, 'rgba(255,255,255,0)']]); ctx.lineWidth = 0.9 * s; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * l2, y + Math.sin(a) * l2); ctx.stroke(); }
    ctx.restore();
  }

  /* ============================== Earth ==============================
     Painted pixel by pixel: real continents (coarse outlines in longitude and latitude, projected onto the globe), blue
     oceans with a sun glint, swirling clouds, the night side with city lights, and a thin blue edge of air. */
  var LANDS = [
    // Africa
    [-17, 21, -16, 28, -10, 30, -6, 36, 10, 37, 11, 33, 20, 31, 25, 32, 32, 31, 35, 28, 39, 22, 43, 12, 51, 12, 51, 10, 48, 5, 42, -1, 40, -10, 40, -16, 35, -24, 33, -29, 27, -34, 20, -35, 18, -32, 15, -27, 12, -18, 13, -12, 9, -2, 9, 4, 5, 5, -4, 5, -8, 4, -13, 8, -17, 14],
    // Europe and Asia
    [-9, 37, -9, 43, -1, 44, -4, 48, 1, 50, 5, 53, 9, 54, 9, 57, 11, 59, 6, 62, 13, 68, 20, 70, 30, 70, 42, 67, 55, 68, 66, 71, 80, 73, 100, 77, 130, 72, 160, 70, 180, 68, 180, 62, 160, 60, 140, 55, 135, 45, 128, 38, 122, 40, 121, 31, 117, 24, 109, 20, 106, 10, 100, 13, 99, 7, 95, 16, 92, 22, 88, 22, 80, 15, 77, 8, 72, 20, 67, 25, 60, 25, 57, 26, 52, 25, 48, 30, 44, 37, 36, 36, 35, 32, 30, 31, 28, 37, 23, 37, 21, 39, 18, 40, 16, 38, 12, 44, 8, 44, 3, 43, -5, 36],
    // Arabia
    [35, 28, 34, 30, 36, 33, 44, 32, 48, 30, 52, 25, 56, 26, 59, 22, 55, 17, 45, 13, 43, 13, 39, 21],
    // South America
    [-80, 9, -75, 11, -62, 11, -52, 5, -50, 0, -35, -5, -35, -9, -39, -15, -41, -22, -48, -26, -53, -34, -58, -38, -65, -41, -66, -55, -72, -50, -74, -40, -71, -30, -70, -18, -76, -14, -81, -5, -80, 1, -77, 7],
    // North America
    [-80, 9, -83, 10, -87, 13, -92, 15, -97, 16, -105, 20, -110, 24, -117, 32, -124, 40, -125, 48, -135, 58, -160, 60, -165, 68, -140, 70, -120, 70, -95, 72, -80, 70, -75, 62, -65, 60, -55, 52, -66, 45, -70, 41, -76, 35, -81, 31, -80, 25, -82, 26, -84, 30, -90, 29, -97, 26, -97, 21, -91, 19, -87, 21, -88, 16, -83, 14],
    [-55, 60, -42, 60, -20, 70, -20, 80, -60, 82, -70, 77, -55, 68], // Greenland
    [44, -13, 50, -15, 47, -25, 44, -24],                             // Madagascar
    [-5, 50, 1, 51, 0, 53, -3, 56, -5, 58, -6, 56, -3, 54, -5, 52],   // Britain
    [-24, 64, -14, 64, -14, 66, -22, 66],                             // Iceland
    [95, 5, 105, -6, 115, -8, 120, -9, 110, -2, 104, 2],              // Sumatra and Java
    [113, -22, 114, -26, 115, -34, 123, -34, 132, -32, 138, -35, 147, -38, 150, -37, 153, -27, 145, -15, 142, -11, 136, -12, 131, -12, 126, -14, 122, -18],
    [-180, -68, -120, -72, -60, -64, 0, -70, 60, -67, 120, -66, 180, -68, 180, -90, -180, -90] // Antarctica
  ];
  var LANDMASK = null;
  function landMask() {
    if (LANDMASK) return LANDMASK;
    var c = mk(360, 180); if (!c) return null; var g = c.getContext('2d');
    g.fillStyle = '#000'; g.fillRect(0, 0, 360, 180); g.fillStyle = '#fff';
    LANDS.forEach(function (P) { g.beginPath(); for (var i = 0; i < P.length; i += 2) { var x = P[i] + 180, y = 90 - P[i + 1]; if (!i) g.moveTo(x, y); else g.lineTo(x, y); } g.closePath(); g.fill(); });
    var d = g.getImageData(0, 0, 360, 180).data, m = new Uint8Array(360 * 180); for (var i = 0; i < m.length; i++) m[i] = d[i * 4];
    LANDMASK = m; return m;
  }
  function landAt(lon, lat) { // coastline roughened with noise so the outlines do not look like polygons
    var M = LANDMASK; lon += (vt(lon * 0.25 + 3, lat * 0.25) - 0.5) * 3.2; lat += (vt(lon * 0.25 + 9, lat * 0.25 + 4) - 0.5) * 3.2;
    var x = Math.floor(((lon + 180) % 360 + 360) % 360), y = clamp(Math.floor(90 - lat), 0, 179); return M[y * 360 + x] / 255;
  }
  function earth(ctx, w, h, L, night) {
    var s = L.s, ex = L.earth[0], ey = L.earth[1], R = L.earth[2], m = landMask(); if (!m) return;
    var pad = Math.ceil(R * 0.25), D = Math.ceil(R * 2 + pad * 2), cv = mk(D, D), g = cv.getContext('2d'), id = g.createImageData(D, D), P = id.data;
    var lon0 = 18 * PI / 180, lat0 = 12 * PI / 180, tilt = -0.32, ct = Math.cos(tilt), stl = Math.sin(tilt);
    var Lx = -0.9, Ly = 0.22, Lz = 0.38, ln = Math.sqrt(Lx * Lx + Ly * Ly + Lz * Lz); Lx /= ln; Ly /= ln; Lz /= ln;
    for (var j = 0; j < D; j++) for (var i = 0; i < D; i++) {
      var o = (j * D + i) * 4, px = (i + 0.5 - D / 2) / R, py = -(j + 0.5 - D / 2) / R, rr = px * px + py * py;
      if (rr > 1) { P[o + 3] = 0; continue; }
      var pz = Math.sqrt(1 - rr), edge = clamp((1 - Math.sqrt(rr)) * R, 0, 1);
      // rotate by the tilt of the globe in the sky, then un-project to longitude and latitude
      var qx = px * ct - py * stl, qy = px * stl + py * ct;
      var lat = Math.asin(qy * Math.cos(lat0) + pz * Math.sin(lat0)), lon = lon0 + Math.atan2(qx, pz * Math.cos(lat0) - qy * Math.sin(lat0));
      var LAT = lat * 180 / PI, LON = lon * 180 / PI;
      var land = landAt(LON, LAT), al = Math.abs(LAT);
      var nd = px * Lx + py * Ly + pz * Lz, day = smooth(-0.08, 0.18, nd), lit = Math.max(0, nd);
      // ocean: deep blue, brighter toward the lit limb, with a soft sun glint
      var cr = 18, cg = 58, cb = 140;
      var hx = Lx, hy = Ly, hzv = Lz + 1, hl = Math.sqrt(hx * hx + hy * hy + hzv * hzv), spec = Math.pow(Math.max(0, (px * hx + py * hy + pz * hzv) / hl), 60);
      // land: forest near the equator, deserts in the subtropics, olive farther out, ice at the poles
      var n = vt(LON * 0.12 + 5, LAT * 0.12 + 2), desert = smooth(12, 18, al) * (1 - smooth(30, 36, al)) * (0.6 + 0.6 * n);
      var lr = lerp(58, 196, desert), lg2 = lerp(98, 160, desert), lb = lerp(44, 98, desert);
      if (al > 45) { var tt = smooth(45, 62, al); lr = lerp(lr, 92, tt); lg2 = lerp(lg2, 104, tt); lb = lerp(lb, 70, tt); }
      var ice = smooth(64, 72, al) * (LAT < 0 ? 1 : land); if (LAT < -66) land = 1;
      var r0 = lerp(cr, lr, land), g0 = lerp(cg, lg2, land), b0 = lerp(cb, lb, land);
      r0 = lerp(r0, 235, ice); g0 = lerp(g0, 242, ice); b0 = lerp(b0, 248, ice);
      // clouds: storm bands and swirls, stretched east-west
      var cl = ft(LON * 0.05 + Math.sin(LAT * 0.12) * 1.4, LAT * 0.11, 5), bandc = 0.55 + 0.45 * Math.cos(LAT * PI / 30);
      var cloud = smooth(0.5, 0.72, cl * (0.85 + 0.3 * bandc)) * (1 - 0.6 * desert);
      r0 = lerp(r0, 250, cloud); g0 = lerp(g0, 252, cloud); b0 = lerp(b0, 255, cloud);
      var sh = 0.18 + 0.95 * Math.pow(lit, 0.75);
      var R1 = r0 * sh + spec * 120 * (1 - land) * (1 - cloud), G1 = g0 * sh + spec * 110 * (1 - land) * (1 - cloud), B1 = b0 * sh + spec * 90 * (1 - land) * (1 - cloud);
      // atmosphere: blue haze thickening toward the limb on the day side
      var limb = Math.pow(1 - pz, 2.2); R1 = lerp(R1, 110, limb * 0.6 * day); G1 = lerp(G1, 170, limb * 0.6 * day); B1 = lerp(B1, 255, limb * 0.75 * day);
      // night side: dark, with city lights clustered on the land
      var city = land * (1 - ice) * smooth(0.58, 0.78, ft(LON * 0.9 + 1, LAT * 0.9 + 7, 3)) * (1 - cloud * 0.8) * (al < 62 ? 1 : 0);
      var nr = 4 + city * 255, ng = 6 + city * 190, nb = 18 + city * 90;
      P[o] = clamp(lerp(nr, R1, day), 0, 255); P[o + 1] = clamp(lerp(ng, G1, day), 0, 255); P[o + 2] = clamp(lerp(nb, B1, day), 0, 255); P[o + 3] = 255 * edge;
    }
    g.putImageData(id, 0, 0);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, ex, ey, R * 1.9, '#5a8cff', night ? 0.16 : 0.1); ctx.restore();
    ctx.drawImage(cv, ex - D / 2, ey - D / 2);
    // the thin bright edge of air on the sunlit side
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = 'rgba(130,185,255,0.8)'; ctx.lineWidth = 1.2 * s; ctx.beginPath(); ctx.arc(ex, ey, R + 0.3 * s, PI * 0.62, PI * 1.38); ctx.stroke();
    ctx.strokeStyle = 'rgba(110,160,255,0.22)'; ctx.lineWidth = 4 * s; ctx.beginPath(); ctx.arc(ex, ey, R + 2 * s, PI * 0.66, PI * 1.34); ctx.stroke();
    ctx.restore();
  }

  /* ============================== the ground ==============================
     A heightfield rendered column by column from near to far (like a voxel landscape), at half resolution. Each row of
     ground is swept from the Sun's side to find the shadows that hills cast across it, so the hills, the crater and the
     boulders all throw shadows many times their own height to the right. Light is posterized into soft flat bands,
     which keeps the painted, graphic look of the other scenes. */
  function rampLUT(st) { var t = new Uint8Array(256 * 3); for (var i = 0; i < 256; i++) { var c = hex(gradAt(st, i / 255)); t[i * 3] = c[0]; t[i * 3 + 1] = c[1]; t[i * 3 + 2] = c[2]; } return t; }
  function gradAt(st, t) { if (t <= st[0][0]) return st[0][1]; for (var i = 1; i < st.length; i++) if (t <= st[i][0]) return mix(st[i - 1][1], st[i][1], (t - st[i - 1][0]) / (st[i][0] - st[i - 1][0])); return st[st.length - 1][1]; }
  var RAMP = {
    day: rampLUT([[0, '#040509'], [0.07, '#10121a'], [0.16, '#26272d'], [0.3, '#4c4a48'], [0.48, '#7d7972'], [0.66, '#aba59b'], [0.84, '#d6d0c4'], [1, '#faf6ec']]),
    night: rampLUT([[0, '#020308'], [0.1, '#0b0f1e'], [0.25, '#1c2440'], [0.45, '#34405f'], [0.7, '#56617f'], [1, '#8a94ad']])
  };
  function terrain(ctx, w, h, L, night) {
    var q = 2, W2 = Math.ceil(w / q), H2 = Math.ceil(h / q), cv = mk(W2, H2); if (!cv) return;
    var g = cv.getContext('2d'), id = g.createImageData(W2, H2), D = id.data, LUT = night ? RAMP.night : RAMP.day;
    var f2 = L.f / q, hz2 = L.hz / q, cx2 = L.cx / q, sunx2 = L.sun[0] / q;
    var ybuf = new Float32Array(W2), pc = new Float32Array(W2 * 3), pv = new Uint8Array(W2);
    for (var i = 0; i < W2; i++) ybuf[i] = H2;
    var q0 = 1.0135, skip = new Uint8Array(W2), yr = new Float32Array(W2), MG = 72, NN = MG + W2, Hr = new Float32Array(NN), Hp = new Float32Array(W2), Lt = new Float32Array(NN);
    var tanE = night ? -0.0042 : 0.045, dsx = -0.97, dsy = 0.045, dsz = 0.06, dl = Math.sqrt(dsx * dsx + dsy * dsy + dsz * dsz); dsx /= dl; dsy /= dl; dsz /= dl;
    var ex = night ? 0.3 : 0.35, ey = night ? 0.62 : 0.55, ez = night ? 0.55 : -0.75, el = Math.sqrt(ex * ex + ey * ey + ez * ez); ex /= el; ey /= el; ez /= el;
    var Zn = (CAM - 16) * f2 / (H2 - hz2) * 0.96, Zf = 23500, ratio = 1.009, Z = Zn, Zp = 0, dXp = 0, first = true;
    L.sky = new Float32Array(W2);
    var LA = (L.lamps || []).filter(function (A) { return night || A[8]; }), LZ = 0; LA.forEach(function (A) { LZ = Math.max(LZ, A[1] + A[3]); });
    while (Z < Zf) {
      var dX = Z / f2, span = clamp(Z * 0.9, 120, 15000), dm = span / MG, X0 = (0.5 - cx2) * dX;
      for (var k = 0; k < MG; k++) Hr[k] = Hm(X0 - span + k * dm, Z, dm);
      // columns already covered higher up than any ground at this depth could reach are skipped (their last height stands in for shadows)
      var yMin = hz2 + (CAM - (Z < 20000 ? 420 : 9500)) * f2 / Z;
      for (i = 0; i < W2; i++) { if (ybuf[i] <= yMin && !first) { Hr[MG + i] = Hp[i]; skip[i] = 1; } else { Hr[MG + i] = Hm(X0 + i * dX, Z, dX); skip[i] = 0; } }
      var maxDy = 0;
      // sweep from the Sun's side: m is the height of the shadow line cast by everything to the left
      var mm = -1e9, pen = 3 + Z * 0.0045;
      for (k = 0; k < NN; k++) { var stp = k < MG ? dm : dX; mm = Math.max(mm - stp * tanE, Hr[k]); Lt[k] = 1 - smooth(0, pen, mm - Hr[k]); }
      for (i = 0; i < W2; i++) {
        if (skip[i]) { pv[i] = 0; continue; }
        var H = Hr[MG + i], y = hz2 + (CAM - H) * f2 / Z;
        var dyr = Math.abs(yr[i] - y); yr[i] = y;
        if (y >= ybuf[i]) { pv[i] = 0; Hp[i] = H; continue; }
        if (pv[i]) maxDy = Math.max(maxDy, Math.min(40, dyr));
        var hx = (Hr[MG + Math.min(W2 - 1, i + 1)] - Hr[MG + i - 1]) / (2 * dX);
        var hzz = first ? 0 : (H - Hp[i] - hx * ((i + 0.5 - cx2) * (dX - dXp))) / (Z - Zp);
        var nl = Math.sqrt(hx * hx + hzz * hzz + 1), nd = (-hx * dsx + dsy - hzz * dsz) / nl, ne = (-hx * ex + ey - hzz * ez) / nl;
        var X = X0 + i * dX, alb = 0.8 + 0.34 * vt(X * 0.00021 + 3.3, Z * 0.00021 + 8.1) + 0.08 * vt(X * 0.004, Z * 0.004);
        var v;
        if (!night) {
          v = alb * Lt[MG + i] * (Math.max(0, nd) * 2.5 + 0.2 * smooth(-0.03, 0.05, nd)) + Math.max(0, ne) * 0.14 * alb;
          // sunlit dust and glare near the Sun soften the far hills
          var gl = Math.exp(-Math.pow((i - sunx2) / (W2 * 0.45), 2)) * smooth(3000, 30000, Z); v = v + (0.32 - v) * gl * 0.16;
        } else {
          v = alb * (Math.max(0, ne) * 0.5 + 0.03);
          var pk = Lt[MG + i] * smooth(0.2, 0.6, nd + 0.3); if (pk > 0.01) v = Math.max(v, 0.55 + pk * 0.45);
        }
        // posterize into soft flat bands
        var u = clamp(v, 0, 1) * 7, kk = Math.floor(u), fr = u - kk; v = (kk + smooth(0.22, 0.78, fr)) / 7;
        var li = Math.round(clamp(v, 0, 1) * 255) * 3, R = LUT[li], G = LUT[li + 1], B = LUT[li + 2];
        if (night && pk > 0.01) { R = lerp(R, 255, pk * 0.55); G = lerp(G, 226, pk * 0.5); B = lerp(B, 186, pk * 0.4); }
        // work lamps: warm pools of light on the ground (the pit's floodlights, the base's yard lights)
        if (Z < LZ) for (var li2 = 0; li2 < LA.length; li2++) { var A = LA[li2], ax = X - A[0], az = Z - A[1], d2 = (ax * ax + az * az) / (A[3] * A[3]);
          if (d2 < 1) { var fo = (1 - d2) * (1 - d2) * A[7], ay = A[2] + Hr[MG + i] * 0 , ll = Math.sqrt(ax * ax + az * az + A[2] * A[2]) || 1, ndl = Math.max(0, (hx * ax + A[2] + hzz * az) / (ll * nl));
            fo *= 0.3 + 0.7 * ndl; R += (A[4] - R * 0.35) * fo; G += (A[5] - G * 0.35) * fo; B += (A[6] - B * 0.35) * fo; } }
        var yt = Math.max(0, Math.ceil(y)), yb = Math.min(H2, Math.ceil(ybuf[i])), cont = pv[i];
        var pr = cont ? pc[i * 3] : R, pg = cont ? pc[i * 3 + 1] : G, pb = cont ? pc[i * 3 + 2] : B, span2 = Math.max(1, ybuf[i] - y);
        for (var yy = yt; yy < yb; yy++) { var tt = (yy - y) / span2, o = (yy * W2 + i) * 4; D[o] = R + (pr - R) * tt; D[o + 1] = G + (pg - G) * tt; D[o + 2] = B + (pb - B) * tt; D[o + 3] = 255; }
        // a faint antialiased top pixel
        if (yt > 0 && yt - 1 < yb) { var o2 = ((yt - 1) * W2 + i) * 4, a = (yt - y); if (!D[o2 + 3]) { D[o2] = R; D[o2 + 1] = G; D[o2 + 2] = B; D[o2 + 3] = 255 * clamp(a, 0, 1); } }
        ybuf[i] = y; pc[i * 3] = R; pc[i * 3 + 1] = G; pc[i * 3 + 2] = B; pv[i] = 1; Hp[i] = H;
      }
      first = false; Zp = Z; dXp = dX;
      // adaptive steps: steep walls and mountains get many rows, flat or hidden ground few
      if (Z < 1500) q0 = ratio; else q0 = clamp(1 + (q0 - 1) * 1.3 / Math.max(0.4, maxDy), 1.0012, Z > 20000 ? 1.005 : 1.02); Z *= q0;
    }
    for (i = 0; i < W2; i++) L.sky[i] = ybuf[i] * q;
    g.putImageData(id, 0, 0);
    ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(cv, 0, 0, W2 * q, H2 * q); ctx.restore();
  }
  /* The far massifs, in three layers. Lunar highlands are big rounded mountains (nothing has ever eroded them into sharp
     peaks). Each layer is painted pixel by pixel from its skyline: a pixel below the crest takes the light of the slope a
     little up and to the left of it, so lit faces end in crisp spines leaning down to the right, and shadows cast by
     higher crests to the left are swept along the skyline. Farther layers are a touch paler, which reads as depth. */
  var MLAYERS = [
    { z: 52000, haze: 0.32, pk: [[-21000, 3400, 12000], [-5000, 4700, 15000], [13500, 5300, 12500], [30000, 3200, 11000], [44000, 4000, 12000], [-36000, 3000, 12000]] },
    { z: 36500, haze: 0.16, pk: [[4800, 4700, 7600], [-8200, 2500, 6500], [-16000, 2100, 5200], [14500, 3300, 6000], [24000, 2200, 6000], [-26000, 1800, 6000]] },
    { z: 27500, haze: 0.04, pk: [[-5200, 1150, 3800], [9800, 1500, 3200], [-14500, 900, 3400], [20000, 1000, 3600]] }
  ];
  function massifs(ctx, w, h, L, night) {
    var s = L.s, LUT = night ? RAMP.night : RAMP.day, tanS = night ? -0.035 : 0.05, i, x, y;
    MLAYERS.forEach(function (M, li) {
      var Z = M.z, k = L.f / Z, n = Math.ceil(w), top = new Float32Array(n), base = L.hz + (CAM + (Z * Z) / 3474000) * k + 2 * s, ymin = 1e9;
      for (x = 0; x < n; x++) {
        var X = (x + 0.5 - L.cx) / k, H = 0;
        for (var j = 0; j < M.pk.length; j++) { var P = M.pk[j], d = (X - P[0]) / P[2]; if (d > -1 && d < 1) { var b = 1 - d * d; H += P[1] * b * b; } }
        H = H * (0.9 + 0.2 * pf(X / 4200 + li * 7, li * 3.3, 3)) + 140 * pt(X / 1100 + li * 5, li + 0.5) * smooth(0, 600, H) + 30 * pt(X / 260, li * 2);
        top[x] = L.hz + (CAM - H + (X * X + Z * Z) / 3474000) * k; ymin = Math.min(ymin, top[x]);
      }
      // smoothed slope of the skyline, and the shadow line swept from the Sun's side
      var SL = new Float32Array(n), LT = new Float32Array(n), R = Math.max(2, Math.round(5 * s)), m = -1e9;
      for (x = 0; x < n; x++) { var a0 = top[Math.max(0, x - R)], a1 = top[Math.min(n - 1, x + R)]; SL[x] = (a1 - a0) / (Math.min(n - 1, x + R) - Math.max(0, x - R)); }
      var yl = top[0]; for (x = 0; x < n; x++) { yl = Math.min(yl + tanS, top[x]); LT[x] = 1 - smooth(0.2 * s, 2.5 * s, top[x] - yl); }
      var y0 = Math.max(0, Math.floor(ymin) - 1), y1 = Math.min(Math.ceil(h * 0.6), Math.ceil(base)), Hh = y1 - y0; if (Hh <= 0) return;
      var cv = mk(n, Hh), g = cv.getContext('2d'), id = g.createImageData(n, Hh), D = id.data, KS = 0.85;
      for (x = 0; x < n; x++) {
        var t0 = top[x];
        for (y = Math.max(y0, Math.floor(t0)); y < y1; y++) {
          var dep = y + 0.5 - t0; if (dep < -0.5) continue;
          var xs = x - dep * KS, xi = clamp(Math.round(xs), 0, n - 1), face = -SL[xi], v;
          var lit = smooth(-0.03, 0.08, face) * LT[xi];
          if (!night) v = lit * (0.5 + 0.5 * clamp(face * 2.2, 0, 1)) * (1 - 0.25 * smooth(0, h * 0.08, dep)) + (1 - lit) * 0.05;
          else { var pk2 = LT[xi] * (1 - smooth(1 * s, 9 * s, dep)) * smooth(-0.05, 0.1, face); v = 0.06 + 0.22 * smooth(0.02, -0.1, face) * (1 - smooth(0, h * 0.1, dep)); v = Math.max(v, pk2 * 0.95); }
          v = v + (0.3 - v) * M.haze;
          var u = clamp(v, 0, 1) * 6, kk = Math.floor(u); v = (kk + smooth(0.3, 0.7, u - kk)) / 6;
          var o = ((y - y0) * n + x) * 4, li3 = Math.round(clamp(v, 0, 1) * 255) * 3, al = clamp(dep + 0.5, 0, 1);
          D[o] = LUT[li3]; D[o + 1] = LUT[li3 + 1]; D[o + 2] = LUT[li3 + 2]; D[o + 3] = 255 * al;
          if (night && v > 0.5) { D[o] = lerp(D[o], 255, 0.5); D[o + 1] = lerp(D[o + 1], 228, 0.45); D[o + 2] = lerp(D[o + 2], 190, 0.3); }
        }
      }
      g.putImageData(id, 0, 0); ctx.drawImage(cv, 0, y0);
      // a fine bright line along the sunlit crests
      ctx.save(); ctx.strokeStyle = night ? 'rgba(255,230,190,0.6)' : rgba('#fffaf0', 0.75 - M.haze); ctx.lineWidth = 0.6 * s; ctx.beginPath(); var on = false;
      for (x = 0; x < n; x += 2) { if (LT[x] > 0.5 && -SL[x] > (night ? -0.05 : 0.02) && (!night || LT[x] > 0.9)) { if (!on) ctx.moveTo(x, top[x] + 0.3 * s); else ctx.lineTo(x, top[x] + 0.3 * s); on = true; } else on = false; }
      ctx.stroke(); ctx.restore();
      if (li === 1) L.massTop = top;
    });
  }
  // fine sunlit linework along the crests of the far hills
  function crestLines(ctx, w, h, L, night) {
    var s = L.s, sk = L.sky, n = sk.length, q = w / n; if (!sk) return;
    ctx.save(); ctx.strokeStyle = night ? 'rgba(255,226,186,0.55)' : 'rgba(255,252,240,0.6)'; ctx.lineWidth = 0.7 * s; ctx.beginPath();
    var on = false;
    for (var i = 1; i < n - 1; i++) { var a = sk[i - 1], b = sk[i + 1], up = (b - a) / (2 * q); // a crest rising to the right faces the Sun
      var lit = night ? (sk[i] < L.hz - h * 0.035 && up < 0.3) : up > -0.05;
      if (lit) { if (!on) ctx.moveTo(i * q, sk[i] + 0.4 * s); else ctx.lineTo(i * q, sk[i] + 0.4 * s); on = true; } else on = false; }
    ctx.stroke(); ctx.restore();
  }

  /* ============================== the far rim: the Copy Works ============================== */
  function copyWorks(ctx, w, h, L, P, night) {
    var s = L.s, Zc = 25200, Xc = 4300, r = rng(5150), i;
    var k = L.k(Zc), base = L.P(Xc, Hm(Xc, Zc, 50), Zc);
    L.facLights = [];
    // a city of factory blocks with almost nobody in it, its sunlit left faces bright
    var blocks = [];
    for (i = 0; i < 22; i++) { var bx = Xc - 2600 + r() * 5200, bz = Zc - 600 + r() * 1500, bw = 140 + r() * 420, bh = 80 + r() * 260 * (i % 6 === 2 ? 2.2 : 1); blocks.push([bx, bz, bw, bh]); }
    blocks.sort(function (A, B) { return B[1] - A[1]; });
    blocks.forEach(function (B) {
      var g0 = Hm(B[0], B[1], 80), p = L.P(B[0], g0, B[1]), kk = L.k(B[1]), bw = B[2] * kk, bh = B[3] * kk;
      ctx.fillStyle = rgba('#000000', night ? 0.25 : 0.55); ctx.fillRect(p[0] + bw, p[1] - 0.5 * s, bh * 6, 0.9 * s);
      ctx.fillStyle = night ? '#1e2434' : '#3a3834'; ctx.fillRect(p[0], p[1] - bh, bw, bh);
      ctx.fillStyle = night ? '#323a50' : '#e6dfd0'; ctx.fillRect(p[0], p[1] - bh, Math.max(0.6 * s, bw * 0.3), bh);
      ctx.fillStyle = night ? '#ffb850' : '#ffc870'; for (var j = 0; j < 3; j++) if (r() < (night ? 0.8 : 0.4)) { var lx = p[0] + bw * (0.4 + r() * 0.5), ly = p[1] - bh * (0.2 + r() * 0.6); ctx.fillRect(lx, ly, 0.7 * s, 0.5 * s); if (r() < 0.3) L.facLights.push([lx, ly]); }
    });
    // white domes
    [[-1800, 300, 220], [-1100, 700, 160], [1700, 200, 260]].forEach(function (d) { var X = Xc + d[0], Z = Zc + d[1], p = L.P(X, Hm(X, Z, 80), Z), R = d[2] * L.k(Z);
      ctx.fillStyle = lg(ctx, p[0] - R, 0, p[0] + R, 0, night ? [[0, '#3a4256'], [1, '#141824']] : [[0, '#fbf7ee'], [0.45, '#bdb7ab'], [1, '#3a3834']]); ctx.beginPath(); ctx.ellipse(p[0], p[1], R, R * 0.75, 0, PI, TAU); ctx.fill(); });
    // the tower: a tall tapering shaft that catches the Sun, a ring of lights and the treaty copy counter
    var th = 1250 * k, tx = base[0], ty = base[1];
    ctx.fillStyle = rgba('#000000', night ? 0.3 : 0.6); ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx + th * 4, ty + 1.5 * s); ctx.lineTo(tx + th * 4, ty + 2.3 * s); ctx.lineTo(tx, ty + 1 * s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = night ? '#262c3e' : '#45423c'; ctx.beginPath(); ctx.moveTo(tx - 4.2 * s, ty); ctx.lineTo(tx - 1.4 * s, ty - th); ctx.lineTo(tx + 1.4 * s, ty - th); ctx.lineTo(tx + 4.2 * s, ty); ctx.closePath(); ctx.fill();
    ctx.fillStyle = night ? '#465274' : '#f4eee2'; ctx.beginPath(); ctx.moveTo(tx - 4.2 * s, ty); ctx.lineTo(tx - 1.4 * s, ty - th); ctx.lineTo(tx - 0.2 * s, ty - th); ctx.lineTo(tx - 1.2 * s, ty); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = rgba(night ? '#ffc870' : '#ffffff', 0.6); ctx.lineWidth = 0.4 * s; ctx.beginPath(); for (i = 1; i < 6; i++) { var yy = ty - th * i / 6, hw = lerp(4.2, 1.4, i / 6) * s; ctx.moveTo(tx - hw, yy); ctx.lineTo(tx + hw, yy); } ctx.stroke();
    var cy = ty - th - 5 * s;
    ctx.fillStyle = night ? '#2a3042' : '#5a5650'; ctx.beginPath(); rrect(ctx, tx - 6 * s, cy - 4 * s, 12 * s, 8 * s, 2 * s); ctx.fill();
    ctx.fillStyle = '#06101a'; ctx.beginPath(); rrect(ctx, tx - 5.2 * s, cy - 3.2 * s, 10.4 * s, 6.4 * s, 1.2 * s); ctx.fill();
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, tx, cy, 16 * s, '#7ff7e4', night ? 0.35 : 0.2); ctx.restore();
    ctx.fillStyle = '#9ffbea'; ctx.font = '800 ' + (4.6 * s).toFixed(1) + 'px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('3/4', tx, cy + 0.3 * s); ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic';
    ctx.strokeStyle = night ? '#6a7490' : '#d8d2c6'; ctx.lineWidth = 0.6 * s; ctx.beginPath(); ctx.moveTo(tx, cy - 4 * s); ctx.lineTo(tx, cy - 14 * s); ctx.stroke();
    L.tower = [tx, cy - 14 * s]; L.towerCounter = [tx, cy];
    // the rail line along the rim toward the base (a thin double line with lit sleepers)
    L.rail = [];
    for (i = 0; i <= 40; i++) { var t = i / 40, Z = lerp(Zc - 300, 12000, t), X = lerp(Xc - 2700, -14000, Math.pow(t, 1.4)); var dz = Z - CR.z, dx = X - CR.x, rr = Math.sqrt(dx * dx + dz * dz); if (rr < CR.r * 1.02) { var f = CR.r * 1.03 / rr; X = CR.x + dx * f; Z = CR.z + dz * f; } L.rail.push(L.P(X, Hm(X, Z, 60) + 4, Z)); }
    ctx.strokeStyle = night ? 'rgba(130,140,180,0.45)' : 'rgba(240,232,214,0.55)'; ctx.lineWidth = 0.5 * s; ctx.beginPath(); L.rail.forEach(function (p, j) { if (!j) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); }); ctx.stroke();
  }

  /* ============================== the base ============================== */
  // a long shadow on the ground, running right (and a little toward us), fading with length
  function longShadow(ctx, x, y, len, th, a) {
    ctx.save(); ctx.fillStyle = lg(ctx, x, 0, x + len, 0, [[0, 'rgba(3,4,8,' + a + ')'], [0.7, 'rgba(3,4,8,' + (a * 0.75).toFixed(3) + ')'], [1, 'rgba(3,4,8,0)']]);
    ctx.beginPath(); ctx.moveTo(x, y - th * 0.5); ctx.lineTo(x + len, y + len * 0.04 - th * 0.2); ctx.lineTo(x + len, y + len * 0.04 + th * 0.5); ctx.lineTo(x, y + th * 0.5); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  function mast(ctx, L, M, night) {
    var s = L.s, X = M[0], Z = M[1], Hh = M[2], k = L.k(Z), g0 = Hm(X, Z, 1), b = L.P(X, g0, Z), top = L.P(X, g0 + Hh, Z), H = b[1] - top[1];
    longShadow(ctx, b[0], b[1] + 0.5 * s, Math.min(L.w * 0.5, H * 5), Math.max(1 * s, 2.2 * k), night ? 0.35 : 0.85);
    // the panel's shadow is a wide dark patch near the end of the mast's shadow
    if (!night) longShadow(ctx, b[0] + H * 2.6, b[1] + H * 0.12, H * 1.4, 9 * k + 2 * s, 0.7);
    var mw = Math.max(1.2 * s, 2.4 * k);
    ctx.fillStyle = night ? '#363c50' : '#d8d2c4'; ctx.fillRect(b[0] - mw / 2, top[1], mw, H);
    ctx.fillStyle = night ? '#141824' : '#3a3834'; ctx.fillRect(b[0], top[1], mw / 2, H);
    // guy lines
    ctx.strokeStyle = night ? 'rgba(120,130,160,0.35)' : 'rgba(230,226,214,0.45)'; ctx.lineWidth = 0.4 * s; ctx.beginPath(); ctx.moveTo(b[0], top[1] + H * 0.55); ctx.lineTo(b[0] - H * 0.12, b[1]); ctx.moveTo(b[0], top[1] + H * 0.55); ctx.lineTo(b[0] + H * 0.1, b[1] + 0.5 * s); ctx.stroke();
    // the panel: tall, upright, turned toward the Sun on the horizon, so we see it nearly edge-on with a blazing sunward edge
    var pw = Math.max(5 * s, 22 * k), ph = H * 0.5, px = b[0], py = top[1] + H * 0.04;
    ctx.fillStyle = night ? '#121a36' : '#1a2756'; ctx.beginPath(); ctx.moveTo(px - pw * 0.5, py); ctx.lineTo(px + pw * 0.5, py + pw * 0.16); ctx.lineTo(px + pw * 0.5, py + ph + pw * 0.16); ctx.lineTo(px - pw * 0.5, py + ph); ctx.closePath(); ctx.fill();
    ctx.save(); ctx.clip();
    ctx.fillStyle = lg(ctx, px - pw * 0.5, 0, px + pw * 0.5, 0, night ? [[0, 'rgba(90,110,200,0.35)'], [1, 'rgba(20,30,70,0)']] : [[0, 'rgba(150,180,255,0.55)'], [0.4, 'rgba(60,90,190,0.25)'], [1, 'rgba(10,20,60,0)']]); ctx.fillRect(px - pw, py, pw * 2, ph + pw);
    ctx.strokeStyle = night ? 'rgba(90,110,170,0.4)' : 'rgba(140,170,240,0.5)'; ctx.lineWidth = 0.35 * s; ctx.beginPath();
    for (var j = 1; j < 10; j++) { var yy = py + ph * j / 10; ctx.moveTo(px - pw * 0.5, yy); ctx.lineTo(px + pw * 0.5, yy + pw * 0.16); } ctx.moveTo(px, py); ctx.lineTo(px, py + ph + pw * 0.1); ctx.stroke();
    ctx.restore();
    if (!night) { ctx.fillStyle = 'rgba(255,255,250,0.95)'; ctx.fillRect(px - pw * 0.5 - 0.5 * s, py, 1.1 * s, ph);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, px - pw * 0.5, py + ph * 0.35, 10 * s, '#ffffff', 0.35); ctx.restore(); }
    ctx.fillStyle = night ? '#4a5064' : '#9a948a'; ctx.fillRect(b[0] - mw * 1.6, b[1] - 2 * s, mw * 3.2, 2 * s);
    M.top = [b[0], top[1]];
  }
  // a half-buried habitat: a shell of piled regolith for radiation shielding, round windows glowing from inside
  function habDome(ctx, L, D, night) {
    var s = L.s, X = D[0], Z = D[1], R0 = D[2], k = L.k(Z), b = L.P(X, Hm(X, Z, 1), Z), x = b[0], y = b[1], R = R0 * k, r = rng(700 + D[3]);
    longShadow(ctx, x, y + R * 0.04, Math.min(L.w * 0.6, R * 7), R * 0.32, night ? 0.4 : 0.85);
    ctx.beginPath(); ctx.moveTo(x - R, y); ctx.bezierCurveTo(x - R, y - R * 0.8, x - R * 0.55, y - R * 0.92, x, y - R * 0.92); ctx.bezierCurveTo(x + R * 0.55, y - R * 0.92, x + R, y - R * 0.8, x + R, y); ctx.closePath();
    ctx.fillStyle = lg(ctx, x - R, 0, x + R, 0, night ? [[0, '#3c465e'], [0.6, '#20263a'], [1, '#0e1220']] : [[0, '#f2ece0'], [0.28, '#c6bfb1'], [0.55, '#6d685f'], [0.8, '#2c2b2c'], [1, '#141418']]); ctx.fill();
    ctx.save(); ctx.clip();
    // rows of bagged regolith, lit on their sunward ends
    ctx.strokeStyle = rgba('#000000', 0.2); ctx.lineWidth = 0.5 * s;
    for (var j = 1; j < 7; j++) { var yy = y - R * j * 0.13; ctx.beginPath(); ctx.moveTo(x - R, yy); for (var xx = x - R; xx < x + R; xx += 3.2 * s) ctx.quadraticCurveTo(xx + 1.6 * s, yy + 0.9 * s, xx + 3.2 * s, yy); ctx.stroke(); }
    ctx.fillStyle = rgba('#ffffff', night ? 0.06 : 0.25); ctx.beginPath(); qell(ctx, x - R * 0.45, y - R * 0.62, R * 0.32, R * 0.12, -0.5); ctx.fill();
    ctx.restore();
    // airlock porch
    ctx.fillStyle = night ? '#1a1e2c' : '#55524c'; ctx.beginPath(); rrect(ctx, x + R * 0.45, y - R * 0.36, R * 0.46, R * 0.36, R * 0.08); ctx.fill();
    ctx.fillStyle = night ? '#ffc060' : '#ffcf80'; ctx.fillRect(x + R * 0.58, y - R * 0.27, R * 0.2, R * 0.27);
    var wins = [[-0.42, -0.36], [-0.08, -0.52], [0.26, -0.5]];
    L.windows = L.windows || [];
    wins.forEach(function (q2) { var wx = x + q2[0] * R, wy = y + q2[1] * R, wr = Math.max(1.1 * s, R * 0.085);
      ctx.fillStyle = '#2a1a14'; ctx.beginPath(); qcirc(ctx, wx, wy, wr * 1.35); ctx.fill();
      ctx.fillStyle = rg(ctx, wx, wy, 0, wr, [[0, '#fff2c8'], [0.6, '#ffc870'], [1, '#e8903a']]); ctx.beginPath(); qcirc(ctx, wx, wy, wr); ctx.fill();
      L.windows.push([wx, wy, wr]); });
  }
  // the Market Dome: a glass dome on brass ribs, warm and busy inside
  function marketDome(ctx, L, night) {
    var s = L.s, X = L.market[0], Z = L.market[1], k = L.k(Z), b = L.P(X, Hm(X, Z, 1), Z), x = b[0], y = b[1], R = L.market[2] * k, i;
    longShadow(ctx, x - R * 0.2, y + R * 0.06, Math.min(L.w * 0.7, R * 7), R * 0.3, night ? 0.4 : 0.8);
    // regolith berm
    ctx.fillStyle = lg(ctx, x - R, 0, x + R, 0, night ? [[0, '#3c465e'], [1, '#0e1220']] : [[0, '#ece6da'], [0.45, '#8d867b'], [1, '#1c1c20']]);
    ctx.beginPath(); ctx.moveTo(x - R * 1.16, y + 1); ctx.quadraticCurveTo(x - R * 1.08, y - R * 0.2, x - R * 0.9, y - R * 0.22); ctx.lineTo(x + R * 0.9, y - R * 0.22); ctx.quadraticCurveTo(x + R * 1.08, y - R * 0.2, x + R * 1.16, y + 1); ctx.closePath(); ctx.fill();
    var cy = y - R * 0.2, ry = R * 0.84;
    ctx.save(); ctx.beginPath(); ctx.ellipse(x, cy, R, ry, 0, PI, TAU); ctx.closePath(); ctx.clip();
    ctx.fillStyle = rg(ctx, x, cy, R * 0.05, R * 1.1, [[0, '#ffe6a8'], [0.45, '#f0a85a'], [0.8, '#a8603c'], [1, '#4a2e34']]); ctx.fillRect(x - R, cy - R, R * 2, R);
    // terraced garden at the back, then stalls with awnings and tiny shoppers
    for (i = 0; i < 9; i++) { var px = x - R * 0.82 + i * R * 0.205; ctx.fillStyle = ['#2f7a4a', '#3f8a52', '#4f9a5a'][i % 3]; ctx.beginPath(); qcirc(ctx, px, cy - R * 0.2 - (i % 2) * R * 0.05, R * 0.11); ctx.fill(); }
    ctx.fillStyle = '#e8a050'; for (i = 0; i < 6; i++) { ctx.beginPath(); qcirc(ctx, x - R * 0.7 + i * R * 0.28, cy - R * 0.28, R * 0.022); ctx.fill(); }
    var cols = ['#e0684a', '#4aa8b8', '#e8b84a', '#9a6ad8', '#5ab87a'];
    for (i = 0; i < 5; i++) { var sx = x - R * 0.72 + i * R * 0.36; ctx.fillStyle = '#5a3a2a'; ctx.fillRect(sx - R * 0.13, cy - R * 0.13, R * 0.26, R * 0.12);
      ctx.fillStyle = cols[i]; ctx.beginPath(); ctx.moveTo(sx - R * 0.16, cy - R * 0.12); ctx.lineTo(sx + R * 0.16, cy - R * 0.12); ctx.lineTo(sx + R * 0.12, cy - R * 0.22); ctx.lineTo(sx - R * 0.12, cy - R * 0.22); ctx.closePath(); ctx.fill();
      ctx.fillStyle = rgba('#ffffff', 0.35); for (var j = 0; j < 3; j++) ctx.fillRect(sx - R * 0.14 + j * R * 0.1, cy - R * 0.21, R * 0.04, R * 0.09); }
    var shirts = ['#2a3a6a', '#7a3a5a', '#3a6a5a', '#6a4a2a', '#4a4a7a', '#8a5a3a', '#2a5a7a'];
    for (i = 0; i < 7; i++) { var mx = x - R * 0.66 + i * R * 0.21 + (i % 2) * R * 0.04, my = cy - R * 0.005; ctx.fillStyle = shirts[i]; ctx.beginPath(); rrect(ctx, mx - R * 0.028, my - R * 0.1, R * 0.056, R * 0.1, R * 0.02); ctx.fill();
      ctx.fillStyle = ['#e8c0a0', '#c98e64', '#8a5a3a', '#f1cfb6'][i % 4]; ctx.beginPath(); qcirc(ctx, mx, my - R * 0.13, R * 0.03); ctx.fill(); ctx.fillStyle = '#2a1a14'; ctx.beginPath(); qcirc(ctx, mx, my - R * 0.145, R * 0.026); ctx.fill(); }
    // strings of lights
    ctx.strokeStyle = 'rgba(90,60,40,0.6)'; ctx.lineWidth = 0.4 * s;
    for (var kk = 0; kk < 3; kk++) { ctx.beginPath(); ctx.moveTo(x - R * 0.86, cy - R * (0.42 + kk * 0.13)); ctx.quadraticCurveTo(x, cy - R * (0.2 + kk * 0.13), x + R * 0.86, cy - R * (0.42 + kk * 0.13)); ctx.stroke(); }
    L.bulbs = [];
    for (i = 0; i < 48; i++) { var kq = i % 3, t = (i / 3 | 0) / 15, xx = lerp(x - R * 0.86, x + R * 0.86, t), yq = cy - R * (0.42 + kq * 0.13) + Math.sin(t * PI) * R * 0.22 * (1 - kq * 0.0); L.bulbs.push([xx, yq]); ctx.fillStyle = ['#fff2b0', '#ffd0a0', '#c8f0ff'][i % 3]; ctx.beginPath(); qcirc(ctx, xx, yq, 0.75 * s); ctx.fill(); }
    // the glass: a bright sunward reflection and a cool sheen on the shadow side
    ctx.fillStyle = lg(ctx, x - R, cy - R, x + R, cy, [[0, 'rgba(255,255,255,0.3)'], [0.3, 'rgba(255,255,255,0.04)'], [0.75, 'rgba(110,130,200,0.08)'], [1, 'rgba(60,70,120,0.3)']]); ctx.fillRect(x - R, cy - R, R * 2, R);
    ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, x, cy - R * 0.35, R * (night ? 2.4 : 1.6), '#ffb060', night ? 0.3 : 0.16); ctx.restore();
    ctx.strokeStyle = night ? '#b09058' : '#e0b468'; ctx.lineWidth = 1.2 * s; ctx.beginPath(); ctx.ellipse(x, cy, R, ry, 0, PI, TAU); ctx.stroke();
    ctx.lineWidth = 0.7 * s; for (i = 1; i < 8; i++) { var a = PI + i / 8 * PI; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * R, cy + Math.sin(a) * ry); ctx.quadraticCurveTo(x + Math.cos(a) * R * 0.42, cy - ry, x, cy - ry); ctx.stroke(); }
    ctx.beginPath(); ctx.ellipse(x, cy, R * 0.97, ry * 0.45, 0, PI, TAU); ctx.stroke(); ctx.beginPath(); ctx.ellipse(x, cy, R * 0.78, ry * 0.78, 0, PI * 1.05, PI * 1.95); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.ellipse(x, cy, R * 0.93, ry * 0.92, 0, PI * 1.07, PI * 1.33); ctx.stroke();
    // the sign over the door
    ctx.fillStyle = '#2a1a2e'; ctx.beginPath(); rrect(ctx, x - R * 0.34, cy - R * 0.04, R * 0.68, R * 0.16, 2 * s); ctx.fill();
    ctx.fillStyle = '#f6ca70'; ctx.font = '800 ' + (R * 0.105).toFixed(1) + 'px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('MARKET', x, cy + R * 0.04); ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic';
    L.door = [x + R * 0.55, y];
  }
  function tube(ctx, L, A, B, night) { // a pressurized walkway between two modules
    var s = L.s, a = L.P(A[0], Hm(A[0], A[1], 1), A[1]), b = L.P(B[0], Hm(B[0], B[1], 1), B[1]), r1 = 4 * L.k(A[1]), r2 = 4 * L.k(B[1]);
    ctx.fillStyle = night ? '#262c3e' : '#8d867b'; ctx.beginPath(); ctx.moveTo(a[0], a[1] - r1 * 1.8); ctx.lineTo(b[0], b[1] - r2 * 1.8); ctx.lineTo(b[0], b[1]); ctx.lineTo(a[0], a[1]); ctx.closePath(); ctx.fill();
    ctx.fillStyle = night ? '#3c465e' : '#d8d0c0'; ctx.beginPath(); ctx.moveTo(a[0], a[1] - r1 * 1.8); ctx.lineTo(b[0], b[1] - r2 * 1.8); ctx.lineTo(b[0], b[1] - r2 * 1.3); ctx.lineTo(a[0], a[1] - r1 * 1.3); ctx.closePath(); ctx.fill();
    ctx.fillStyle = night ? '#ffc060' : '#ffd890'; for (var i = 1; i < 6; i++) { var t = i / 6; ctx.fillRect(lerp(a[0], b[0], t) - 0.6 * s, lerp(a[1], b[1], t) - lerp(r1, r2, t) * 1.05, 1.2 * s, 0.8 * s); }
  }
  function lander(ctx, L, night) {
    var s = L.s, X = L.lander[0], Z = L.lander[1], k = L.k(Z), b = L.P(X, Hm(X, Z, 1), Z), x = b[0], y = b[1], u = 6 * k;
    // the landing pad: a sintered ring with lights
    ctx.fillStyle = night ? '#1a1e2c' : '#5a5650'; ctx.beginPath(); qell(ctx, x, y, u * 4.2, u * 0.75, 0); ctx.fill();
    ctx.strokeStyle = night ? 'rgba(255,190,90,0.6)' : 'rgba(255,230,180,0.6)'; ctx.lineWidth = 0.6 * s; ctx.beginPath(); ctx.ellipse(x, y, u * 3.6, u * 0.62, 0, 0, TAU); ctx.stroke();
    longShadow(ctx, x, y - 0.5 * s, Math.min(L.w * 0.5, u * 30), u * 0.8, night ? 0.35 : 0.8);
    ctx.strokeStyle = night ? '#5a6074' : '#d0cabe'; ctx.lineWidth = Math.max(0.8 * s, u * 0.18);
    ctx.beginPath(); ctx.moveTo(x - u * 1.6, y); ctx.lineTo(x - u * 0.6, y - u * 1.6); ctx.moveTo(x + u * 1.6, y); ctx.lineTo(x + u * 0.6, y - u * 1.6); ctx.stroke();
    ctx.fillStyle = lg(ctx, x - u, 0, x + u, 0, night ? [[0, '#6a7088'], [1, '#1a1e2c']] : [[0, '#fbf6ea'], [0.45, '#c8c2b4'], [1, '#2c2a28']]);
    ctx.beginPath(); rrect(ctx, x - u, y - u * 5, u * 2, u * 3.6, u * 0.5); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x - u * 0.8, y - u * 5); ctx.quadraticCurveTo(x, y - u * 6.8, x + u * 0.8, y - u * 5); ctx.fill();
    ctx.fillStyle = '#d4a85a'; ctx.fillRect(x - u, y - u * 2.4, u * 2, u * 0.35);
    ctx.fillStyle = night ? '#ffc060' : '#203048'; ctx.beginPath(); qcirc(ctx, x - u * 0.2, y - u * 4.2, u * 0.32); ctx.fill();
    L.landerTop = [x, y - u * 6.6]; L.landerBase = [x, y]; L.landerU = u;
  }
  function rover(ctx, x, y, u, dir, night, lights) {
    ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
    ctx.fillStyle = night ? '#4c546c' : '#ece6d8'; ctx.beginPath(); rrect(ctx, -1.6 * u, -1.55 * u, 3.2 * u, 1.05 * u, 0.28 * u); ctx.fill();
    ctx.fillStyle = night ? '#262a38' : '#6a665e'; ctx.fillRect(-1.6 * u, -0.78 * u, 3.2 * u, 0.26 * u);
    ctx.fillStyle = '#e0684a'; ctx.fillRect(-1.6 * u, -1.55 * u, 3.2 * u, 0.2 * u);
    ctx.fillStyle = night ? '#3a4054' : '#a8a296'; ctx.beginPath(); ctx.moveTo(-1.3 * u, -1.55 * u); ctx.lineTo(-1 * u, -2.15 * u); ctx.lineTo(0.7 * u, -2.15 * u); ctx.lineTo(1.0 * u, -1.55 * u); ctx.closePath(); ctx.fill();
    ctx.fillStyle = night ? '#1c2a44' : '#2a3a5a'; ctx.beginPath(); rrect(ctx, 0.9 * u, -1.45 * u, 0.62 * u, 0.5 * u, 0.12 * u); ctx.fill();
    ctx.strokeStyle = night ? '#6a7088' : '#d8d2c4'; ctx.lineWidth = 0.18 * u; ctx.beginPath(); ctx.moveTo(-1.2 * u, -1.55 * u); ctx.lineTo(-1.2 * u, -2.7 * u); ctx.stroke(); ctx.fillStyle = '#2a2a30'; ctx.fillRect(-1.45 * u, -3 * u, 0.6 * u, 0.36 * u);
    ctx.fillStyle = '#26241f'; for (var i = -1; i <= 1; i++) { ctx.beginPath(); qcirc(ctx, i * 1.15 * u, -0.32 * u, 0.44 * u); ctx.fill(); }
    ctx.fillStyle = night ? '#5a6074' : '#c8c2b6'; for (i = -1; i <= 1; i++) { ctx.beginPath(); qcirc(ctx, i * 1.15 * u - 0.08 * u, -0.36 * u, 0.15 * u); ctx.fill(); }
    if (lights) { ctx.fillStyle = '#fff6d8'; ctx.fillRect(1.48 * u, -1.25 * u, 0.16 * u, 0.24 * u); }
    ctx.restore();
  }
  function boulder(ctx, L, X, Z, R0, seed, night) {
    var s = L.s, k = L.k(Z), b = L.P(X, Hm(X, Z, 0.5), Z), x = b[0], y = b[1], R = R0 * k, r = rng(seed), n = 11, pts = [], i;
    if (R < 0.8 * s) return;
    for (i = 0; i < n; i++) { var a = PI + i / (n - 1) * PI, rr = R * (0.72 + r() * 0.36); pts.push([x + Math.cos(a) * rr * 1.2, y + Math.sin(a) * rr * (0.7 + r() * 0.25)]); }
    longShadow(ctx, x, y + R * 0.08, Math.min(L.w * 0.7, R * (night ? 3 : 12)), R * 0.42, night ? 0.4 : 0.85);
    ctx.beginPath(); ctx.moveTo(pts[0][0], y + R * 0.1); pts.forEach(function (p) { ctx.lineTo(p[0], p[1]); }); ctx.lineTo(pts[n - 1][0], y + R * 0.1); ctx.closePath();
    ctx.fillStyle = lg(ctx, x - R * 1.2, 0, x + R * 1.2, 0, night ? [[0, '#4a5470'], [0.5, '#262c40'], [1, '#0c0f1a']] : [[0, '#f4eee2'], [0.3, '#b4ad9f'], [0.55, '#4a4743'], [1, '#0c0c10']]); ctx.fill();
    ctx.save(); ctx.clip(); ctx.fillStyle = rgba('#000000', 0.18); for (i = 0; i < 5; i++) { ctx.beginPath(); qcirc(ctx, x + (r() - 0.3) * R, y - r() * R * 0.6, R * (0.08 + r() * 0.12)); ctx.fill(); } ctx.restore();
    if (!night) { ctx.strokeStyle = 'rgba(255,252,240,0.7)'; ctx.lineWidth = 0.8 * s; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (i = 1; i < 5; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.stroke(); }
  }
  // the terraced pit: benches stepping down into a shadowed hole, worked by floodlight (the low Sun never reaches in)
  function pit(ctx, L, night) {
    var s = L.s, k = L.k(MINE.z), c = L.P(MINE.x, Hm(MINE.x, MINE.z, 1), MINE.z), x = c[0], y = c[1], R = MINE.r * k, fs = (L.P(0, 0, MINE.z - 1)[1] - L.P(0, 0, MINE.z + 1)[1]) / 2 / k;
    var n = MINE.steps, dstep = MINE.d / n * k, i;
    L.pitRings = [];
    for (i = 0; i < n; i++) {
      var f = 1 - i / n, rx = R * f, ry = rx * fs, yy = y + dstep * i, f2 = 1 - (i + 1) / n, rx2 = R * f2, ry2 = rx2 * fs, y2 = y + dstep * (i + 1);
      // the bench: a flat ledge; its back half is lit warm by the floodlights, the front half falls in the dark
      ctx.fillStyle = night ? mix('#2a2420', '#0a0a10', i / n) : mix('#3a3630', '#0c0c10', i / n * 0.8);
      ctx.beginPath(); qell(ctx, x, yy, rx, ry, 0); ctx.fill();
      ctx.save(); ctx.beginPath(); qell(ctx, x, yy, rx, ry, 0); ctx.clip();
      ctx.fillStyle = rg(ctx, x - rx * 0.2, yy - ry * 0.6, 0, rx * 1.1, [[0, rgba('#ffc27a', 0.55 - i * 0.05)], [0.6, rgba('#c87a3a', 0.2)], [1, rgba('#c87a3a', 0)]]); ctx.fillRect(x - rx, yy - ry, rx * 2, ry * 2);
      // the riser below the bench edge: the far side faces us and shows as a band
      ctx.fillStyle = night ? mix('#3a3028', '#141418', i / n) : mix('#5a5046', '#18181c', i / n * 0.8);
      ctx.beginPath(); ctx.ellipse(x, y2, rx2, ry2, 0, PI, TAU); ctx.lineTo(x + rx2, y2); ctx.ellipse(x, yy, rx2 * 1.02, ry2 * 1.02, 0, 0, PI, true); ctx.closePath(); ctx.fill();
      ctx.restore();
      ctx.strokeStyle = rgba(night ? '#ffcf90' : '#ffe2b8', 0.5 - i * 0.06); ctx.lineWidth = 0.6 * s; ctx.beginPath(); ctx.ellipse(x, yy, rx, ry, 0, PI * 1.02, PI * 1.98); ctx.stroke();
      L.pitRings.push([x, yy, rx * 0.9, ry * 0.9]);
    }
    // the floor: a dark pool of water ice with a glint
    ctx.fillStyle = '#0a1220'; ctx.beginPath(); qell(ctx, x, y + dstep * n, R / n * 0.9, R / n * 0.9 * fs, 0); ctx.fill();
    ctx.fillStyle = 'rgba(160,210,255,0.5)'; ctx.beginPath(); qell(ctx, x - R / n * 0.2, y + dstep * n - R / n * fs * 0.2, R / n * 0.4, R / n * 0.1 * fs, 0); ctx.fill();
    // the sunlit lip on the far side and the shadowed near lip
    ctx.strokeStyle = night ? 'rgba(140,150,190,0.5)' : 'rgba(250,246,236,0.85)'; ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.ellipse(x, y, R * 1.01, R * fs * 1.01, 0, PI * 1.1, PI * 1.9); ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 1.2 * s; ctx.beginPath(); ctx.ellipse(x, y, R * 1.01, R * fs * 1.01, 0, PI * 0.05, PI * 0.95); ctx.stroke();
    // two floodlight masts on the rim
    L.pitLamps = [];
    [[-0.86, 0], [0.7, -0.5]].forEach(function (q2) { var lx = x + q2[0] * R, ly = y + q2[1] * R * fs, hh = 16 * k;
      ctx.strokeStyle = night ? '#5a6074' : '#c8c2b6'; ctx.lineWidth = Math.max(0.6 * s, 0.5 * k); ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx, ly - hh); ctx.stroke();
      ctx.fillStyle = '#2a2a30'; ctx.fillRect(lx - 1.2 * k, ly - hh - 0.8 * k, 2.4 * k, 1 * k); ctx.fillStyle = '#fff2d0'; ctx.fillRect(lx - 1 * k, ly - hh + 0.1 * k, 2 * k, 0.3 * k); L.pitLamps.push([lx, ly - hh]); });
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; L.pitLamps.forEach(function (p) { glow(ctx, p[0], p[1], 8 * s, '#fff0d0', 0.7); }); ctx.restore();
  }
  function roadTracks(ctx, L, night) {
    var s = L.s, T = L.track.map(function (q2) { return L.P(q2[0], Hm(q2[0], q2[1], 1), q2[1]); });
    L.trackPx = T;
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (var side = -1; side <= 1; side += 2) {
      ctx.strokeStyle = night ? 'rgba(4,5,10,0.4)' : 'rgba(20,18,16,0.35)'; ctx.beginPath();
      for (var i = 0; i < T.length; i++) { var Z = L.track[i][1], off = side * 1.3 * L.k(Z); if (!i) ctx.moveTo(T[i][0] + off, T[i][1]); else ctx.lineTo(T[i][0] + off, T[i][1]); }
      ctx.lineWidth = 1.2 * s; ctx.setLineDash([1.6 * s, 1.1 * s]); ctx.stroke();
    }
    ctx.setLineDash([]); ctx.restore();
  }
  function base(ctx, w, h, L, night) {
    L.windows = [];
    var items = [];
    L.masts.forEach(function (m) { items.push([m[1], function () { mast(ctx, L, m, night); }]); });
    L.domes.forEach(function (d) { items.push([d[1], function () { habDome(ctx, L, d, night); }]); });
    items.push([L.market[1], function () { marketDome(ctx, L, night); }]);
    items.push([L.lander[1], function () { lander(ctx, L, night); }]);
    items.push([840, function () { tube(ctx, L, [-150, 830], [-122, 884], night); tube(ctx, L, [-104, 662], [-160, 802], night); tube(ctx, L, [-78, 664], [-44, 806], night); tube(ctx, L, [-176, 700], [-118, 650], night); }]);
    items.sort(function (A, B) { return B[0] - A[0]; });
    items.forEach(function (it) { it[1](); });
    // a parked rover by the market and a stack of cargo pods
    var pr = L.P(-20, Hm(-20, 900, 1), 900), u = 1.7 * L.k(900);
    longShadow(ctx, pr[0], pr[1], u * 20, u * 0.8, night ? 0.35 : 0.8); rover(ctx, pr[0], pr[1], u, 1, night, night);
    for (var i = 0; i < 4; i++) { var X = 20 + i * 7, Z = 1000, p = L.P(X, Hm(X, Z, 1), Z), kk = L.k(Z) * 5; ctx.fillStyle = night ? '#2a3042' : ['#d8d2c4', '#e0684a', '#c8c2b4', '#4aa8b8'][i]; ctx.fillRect(p[0], p[1] - kk * (1 + (i % 2) * 0.6), kk * 1.1, kk * (1 + (i % 2) * 0.6)); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(p[0] + kk * 0.55, p[1] - kk * (1 + (i % 2) * 0.6), kk * 0.55, kk * (1 + (i % 2) * 0.6)); }
  }
  // fine detail on the plateau: pebbles with long sideways shadows, faint dust speckle, and two long shadows from masts out of view
  function groundDetail(ctx, w, h, L, night) {
    var s = L.s, r = rng(6620), i;
    var sh = [], lit = [], dk = [];
    for (i = 0; i < 700; i++) {
      var Z = 215 + Math.pow(r(), 0.55) * 1000, X = (r() - 0.5) * 2.2 * Z * (L.cx / L.f), sz = (0.05 + Math.pow(r(), 3) * 0.5) * (Z < 400 ? 1.3 : 1), p = L.P(X, Hm(X, Z, 1), Z), k = L.k(Z), R = sz * k;
      if (R < 0.35 * s || p[1] > h || p[0] < -5 || p[0] > w + 5) continue;
      sh.push([p[0] + R * 4, p[1] + R * 0.15, R * 5, R * 0.32, 0, 0.03]); lit.push([p[0] - R * 0.25, p[1] - R * 0.35, R * 0.7, R * 0.5, 0, 0]); dk.push([p[0] + R * 0.3, p[1] - R * 0.25, R * 0.75, R * 0.55, 0, 0]);
    }
    var bat = function (arr, col, al) { ctx.fillStyle = col; ctx.globalAlpha = al; ctx.beginPath(); for (var j = 0; j < arr.length; j++) { var q = arr[j]; qell(ctx, q[0], q[1], q[2], q[3], q[5]); } ctx.fill(); };
    ctx.save();
    bat(sh, '#05060a', night ? 0.35 : 0.6); bat(dk, night ? '#151a2a' : '#3a3834', 1); bat(lit, night ? '#4a5470' : '#e6dfd2', 0.95);
    ctx.globalAlpha = 1; ctx.restore();
    dots(ctx, 1600, [[night ? '#8a94b8' : '#fffaf0', night ? 0.12 : 0.18], ['#000000', 0.16]], function () { var y = lerp(h * 0.5, h, Math.pow(r(), 0.8)), x = r() * w; return [x, y, (0.3 + r() * 0.5) * s * (0.5 + (y - h * 0.5) / h * 2), r() < 0.5 ? 0 : 1]; });
    if (!night) { // long shadows of two tall masts standing out of view to the left
      [[h * 0.66, 0.5], [h * 0.83, 0.42]].forEach(function (q2) { ctx.fillStyle = lg(ctx, 0, 0, w * 0.9, 0, [[0, 'rgba(6,6,10,' + q2[1] + ')'], [0.75, 'rgba(6,6,10,' + (q2[1] * 0.6) + ')'], [1, 'rgba(6,6,10,0)']]);
        ctx.beginPath(); ctx.moveTo(0, q2[0] - 1.2 * s); ctx.lineTo(w * 0.9, q2[0] + h * 0.03); ctx.lineTo(w * 0.9, q2[0] + h * 0.03 + 1.8 * s); ctx.lineTo(0, q2[0] + 1.6 * s); ctx.closePath(); ctx.fill(); });
    }
    ctx.fillStyle = lg(ctx, 0, h * 0.7, 0, h, [[0, 'rgba(4,4,8,0)'], [1, 'rgba(4,4,8,' + (night ? 0.3 : 0.24) + ')']]); ctx.fillRect(0, h * 0.7, w, h * 0.3);
  }
  function foreground(ctx, w, h, L, night) {
    groundDetail(ctx, w, h, L, night);
    roadTracks(ctx, L, night);
    pit(ctx, L, night);
    var R = L.rocks.slice().sort(function (A, B) { return B[1] - A[1]; });
    R.forEach(function (q2, k) { boulder(ctx, L, q2[0], q2[1], q2[2], 5000 + k, night); });
  }
  function paintMoon(variant) {
    return function (ctx, w, h) {
      try {
        var night = variant === 'night', P = PAL[variant], L = moonLM(w, h), T0 = Date.now(), TM = PAINT._moonT = [];
        sky(ctx, w, h, L, night); TM.push('sky ' + (Date.now() - T0));
        if (!night) sunDisk(ctx, w, h, L);
        earth(ctx, w, h, L, night);
        TM.push('earth ' + (Date.now() - T0)); massifs(ctx, w, h, L, night); TM.push('mass ' + (Date.now() - T0)); terrain(ctx, w, h, L, night); TM.push('terrain ' + (Date.now() - T0));
        copyWorks(ctx, w, h, L, P, night);
        foreground(ctx, w, h, L, night);
        base(ctx, w, h, L, night);
        if (!night) sunBloom(ctx, w, h, L);
        else { ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = lg(ctx, w, h * 0.3, 0, h, [[0, 'rgba(140,170,255,0.35)'], [1, 'rgba(20,30,60,0.15)']]); ctx.fillRect(0, h * 0.35, w, h * 0.65); ctx.restore(); }
        TM.push('base ' + (Date.now() - T0)); finish(ctx, w, h, P.grade, P.gradeA, P.vig, 0.03, '#05050a', 0.4);
      } catch (e) { PAINT._err = 'moon_' + variant + ': ' + String(e && e.stack || e); }
    };
  }

  function bez3(P, t) { var u = 1 - t; return u * u * u * P[0] + 3 * u * u * t * P[1] + 3 * u * t * t * P[2] + t * t * t * P[3]; }
  function along(T, p) { // a point and direction along a polyline, p in 0..1
    var n = T.length - 1, f = clamp(p, 0, 0.9999) * n, i = Math.floor(f), t = f - i, a = T[i], b = T[i + 1];
    return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), b[0] - a[0], b[1] - a[1], i, t];
  }
  // a person in a white suit and a gold-visored helmet (nobody goes outside without one)
  function suit(ctx, x, y, z, step, wave, night, col) {
    var lift = Math.abs(Math.sin(step)) * z * 0.5;
    ctx.fillStyle = night ? '#6a7290' : '#f4f0e6';
    ctx.beginPath(); rrect(ctx, x - 1.7 * z, y - 6.4 * z - lift, 3.4 * z, 4.4 * z, 1.3 * z); ctx.fill();         // body and backpack
    ctx.fillRect(x - 1.4 * z, y - 2.2 * z - lift, 1.1 * z, 2.2 * z + lift + Math.sin(step) * 0.6 * z); ctx.fillRect(x + 0.3 * z, y - 2.2 * z - lift, 1.1 * z, 2.2 * z + lift - Math.sin(step) * 0.6 * z);
    ctx.fillStyle = col; ctx.fillRect(x - 1.7 * z, y - 4.6 * z - lift, 3.4 * z, 0.6 * z);
    ctx.fillStyle = night ? '#6a7290' : '#f4f0e6'; ctx.beginPath(); qcirc(ctx, x, y - 7.7 * z - lift, 1.7 * z); ctx.fill();
    ctx.fillStyle = night ? '#e0a040' : '#d8a040'; ctx.beginPath(); qell(ctx, x + 0.45 * z, y - 7.7 * z - lift, 1.05 * z, 0.85 * z, 0); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(x + 0.2 * z, y - 8.2 * z - lift, 0.45 * z, 0.3 * z);
    if (wave > 0) { ctx.strokeStyle = night ? '#6a7290' : '#f4f0e6'; ctx.lineWidth = 0.9 * z; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x + 1.4 * z, y - 5.4 * z - lift); ctx.lineTo(x + 2.6 * z + wave * 0.6 * z, y - 8.4 * z - lift); ctx.stroke(); }
    if (night) { var sp = glowSpr('#fff2c8', true); if (sp) { ctx.globalAlpha = 0.8; ctx.drawImage(sp, x + 0.6 * z - 2 * z, y - 7.8 * z - lift - 2 * z, 4 * z, 4 * z); ctx.globalAlpha = 1; } }
  }
  function overlayMoon(variant) {
    return function (ctx, w, h, t) {
      try {
        var night = variant === 'night', L = moonLM(w, h), s = L.s, i, sp;
        ctx.save();
        // ice-mining robots working in the permanent dark of the crater wall (steady lights: no air, so no twinkle)
        if (!L.minerPx) L.minerPx = L.miners.map(function (m) { var p = L.P(m[0], Hm(m[0], m[1], 60), m[1]); return [p[0], p[1], m[2]]; }).filter(function (p) { return p[1] < L.sky[Math.max(0, Math.min(L.sky.length - 1, Math.round(p[0] / w * L.sky.length)))] + 999 && p[1] < h * 0.47; });
        for (i = 0; i < L.minerPx.length; i++) { var m = L.minerPx[i], mx = m[0] + Math.sin(t * 0.06 + m[2] * 9) * 6 * s, a = 0.5 + 0.5 * Math.sin(t * 0.5 + i * 2.1);
          sp = glowSpr(i % 3 ? '#9fd8ff' : '#ffe2a0', true); if (sp) { ctx.globalAlpha = 0.5 + a * 0.4; var z = (2 + a * 1.2) * s; ctx.drawImage(sp, mx - z, m[1] - z, z * 2, z * 2); } }
        ctx.globalAlpha = 1;
        // a freight train of lit cars running along the rim from the Copy Works
        if (L.rail) { var tp = (t * 0.012) % 1.3; for (i = 0; i < 9; i++) { var u = tp - i * 0.012; if (u < 0 || u > 1) continue; var q = along(L.rail, u); sp = glowSpr(i ? '#ffd890' : '#ffffff', true); if (sp) { ctx.globalAlpha = 0.85; var zz = (i ? 1.6 : 2.4) * s; ctx.drawImage(sp, q[0] - zz, q[1] - zz, zz * 2, zz * 2); } } ctx.globalAlpha = 1; }
        // blinking red beacons on the masts, amber on the Copy Works and its tower
        var sr = glowSpr('#ff4a32', true);
        if (sr) L.masts.forEach(function (q2, k) { if (!q2.top) return; var b2 = Math.pow(Math.max(0, Math.sin(t * 1.9 + k * 0.9)), 12); ctx.globalAlpha = 0.25 + b2 * 0.75; var z2 = (1.6 + b2 * 3) * s; ctx.drawImage(sr, q2.top[0] - z2, q2.top[1] - 1 * s - z2, z2 * 2, z2 * 2); });
        var so = glowSpr('#ffb02e', true); if (so && L.facLights) L.facLights.concat(L.tower ? [L.tower] : []).forEach(function (b, k) { ctx.globalAlpha = 0.3 + 0.7 * Math.pow(Math.max(0, Math.sin(t * 1.4 + k * 2.3)), 6); var z3 = (k === L.facLights.length ? 3 : 1.8) * s; ctx.drawImage(so, b[0] - z3, b[1] - z3, z3 * 2, z3 * 2); });
        ctx.globalAlpha = 1;
        // the market's strings of bulbs shimmer, windows glow a little brighter and dimmer as people move inside
        if (L.bulbs) { var bs = glowSpr('#ffe0a0'); if (bs) for (i = 0; i < L.bulbs.length; i += 2) { var bb = L.bulbs[i]; ctx.globalAlpha = 0.25 + 0.35 * Math.max(0, Math.sin(t * 2.2 + i * 1.7)); ctx.drawImage(bs, bb[0] - 3 * s, bb[1] - 3 * s, 6 * s, 6 * s); } }
        if (L.windows) { var ws = glowSpr('#ffb860'); if (ws) for (i = 0; i < L.windows.length; i++) { var W = L.windows[i]; ctx.globalAlpha = (night ? 0.55 : 0.3) + 0.12 * Math.sin(t * 0.7 + i * 1.3); var z4 = W[2] * (night ? 6 : 4); ctx.drawImage(ws, W[0] - z4, W[1] - z4, z4 * 2, z4 * 2); } }
        ctx.globalAlpha = 1;
        // a rover rolling up the road from the pit, headlights on, wheels flicking dust up in clean arcs that fall straight back
        if (L.trackPx) {
          var T = L.trackPx, pr = 1 - ((t * 0.022) % 1), q3 = along(T, pr), Zr = lerp(L.track[q3[4]][1], L.track[q3[4] + 1][1], q3[5]), uu = 1.7 * L.k(Zr), dir = q3[2] > 0 ? -1 : 1;
          var rx = q3[0], ry = q3[1];
          ctx.fillStyle = night ? 'rgba(4,5,10,0.4)' : 'rgba(4,4,8,0.75)'; ctx.beginPath(); ctx.moveTo(rx - 1.4 * uu, ry - 0.2 * uu); ctx.lineTo(rx + 22 * uu, ry + 0.4 * uu); ctx.lineTo(rx + 22 * uu, ry + 1.1 * uu); ctx.lineTo(rx - 1.4 * uu, ry + 0.4 * uu); ctx.closePath(); ctx.fill();
          ctx.fillStyle = night ? 'rgba(130,140,170,0.65)' : 'rgba(214,206,190,0.9)';
          for (i = 0; i < 16; i++) { var ph = (t * 1.3 + i * 0.0625) % 1, wx = rx - dir * (1.2 * uu + ph * 2.6 * uu) + ((i % 3) - 1) * 1.1 * uu, wy = ry - 0.2 * uu - ph * (1 - ph) * 4 * 1.6 * uu; ctx.globalAlpha = (1 - ph) * 0.9; ctx.beginPath(); qcirc(ctx, wx, wy, 0.16 * uu); ctx.fill(); }
          ctx.globalAlpha = 1;
          rover(ctx, rx, ry, uu, dir, night, true);
          var hl = glowSpr('#fff4d8', true); if (hl) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = night ? 0.9 : 0.6; ctx.drawImage(hl, rx + dir * 1.55 * uu - 1.6 * uu, ry - 1.15 * uu - 1.6 * uu, 3.2 * uu, 3.2 * uu);
            ctx.globalAlpha = night ? 0.35 : 0.15; ctx.fillStyle = lg(ctx, rx + dir * 1.6 * uu, 0, rx + dir * 9 * uu, 0, [[0, 'rgba(255,244,216,0.8)'], [1, 'rgba(255,244,216,0)']]); ctx.beginPath(); ctx.moveTo(rx + dir * 1.6 * uu, ry - 1.2 * uu); ctx.lineTo(rx + dir * 9 * uu, ry - 2.2 * uu); ctx.lineTo(rx + dir * 9 * uu, ry + 0.6 * uu); ctx.closePath(); ctx.fill(); ctx.restore(); }
        }
        // a cargo hopper gliding in from the Copy Works on its engine, then dropping toward the pad
        if (L.landerTop && L.tower) { var hp = (t * 0.03) % 1, ax = L.tower[0], ay = L.tower[1] - 30 * s, bx = L.landerBase[0] + 30 * s, by = L.landerBase[1] - 70 * s;
          if (hp < 0.85) { var e = hp / 0.85, hx2 = lerp(ax, bx, e), hy2 = lerp(ay, by, e) - Math.sin(e * PI) * h * 0.06, zh = lerp(1.2, 3.2, e) * s;
            ctx.fillStyle = night ? '#5a6278' : '#e8e2d4'; ctx.beginPath(); rrect(ctx, hx2 - 2 * zh, hy2 - zh, 4 * zh, 1.6 * zh, 0.6 * zh); ctx.fill(); ctx.fillStyle = '#d4a85a'; ctx.fillRect(hx2 - 2 * zh, hy2 + 0.3 * zh, 4 * zh, 0.3 * zh);
            var fl = glowSpr('#9fd0ff', true); if (fl) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.7 + 0.3 * Math.sin(t * 20); ctx.drawImage(fl, hx2 - 1.6 * zh, hy2 + 0.6 * zh, 3.2 * zh, 3.2 * zh); ctx.restore(); } } }
        // people in suits walking between the market door and the domes; one waves now and then
        if (L.door) { var dz = L.k(L.market[1]) * 0.55;
          for (i = 0; i < 3; i++) { var pp = ((t * 0.035 + i * 0.37) % 1), back = pp > 0.5, e2 = back ? (1 - pp) * 2 : pp * 2, px = L.door[0] + lerp(0, 34, e2) * dz + i * 6 * dz, py = L.door[1] + lerp(0, 6, e2) * dz;
            suit(ctx, px, py, dz, t * 3 + i, i === 1 ? Math.max(0, Math.sin(t * 0.8)) : 0, night, ['#e0684a', '#4aa8b8', '#e8b84a'][i]); } }
        ctx.restore();
      } catch (e) { PAINT._err = 'moon overlay: ' + String(e && e.stack || e); }
    };
  }
  var PAL = { day: { grade: '#ffe8c8', gradeA: 0.06, vig: 0.42 }, night: { grade: '#9fb2ff', gradeA: 0.1, vig: 0.5 } };
  // anchors (fractions of w,h): Earth, the market, the Copy Works and the crater; the middle stays clear for portraits
  PAINT.moon = { focus: { x: 0.77, y: 0.155 }, track: 'morning', anchors: { earth: { x: 0.77, y: 0.155 }, market: { x: 0.26, y: 0.5 }, factory: { x: 0.85, y: 0.33 }, crater: { x: 0.5, y: 0.42 } }, paint: paintMoon('day'), overlay: overlayMoon('day') };
  PAINT.moon_night = { focus: { x: 0.77, y: 0.155 }, track: 'night', anchors: { earth: { x: 0.77, y: 0.155 }, market: { x: 0.26, y: 0.5 } }, paint: paintMoon('night'), overlay: overlayMoon('night') };

  /* ============================== tappable props ============================== */
  if (typeof LATE !== 'undefined') LATE.push(function () {
    if (typeof PROPS === 'undefined' || typeof PROPS_ART === 'undefined') return;
    PROPS_ART.moonrover = function () { return '<svg viewBox="0 0 90 60"><ellipse cx="46" cy="56" rx="34" ry="3.5" fill="rgba(0,0,0,.35)"/><g class="pa-body"><rect x="14" y="22" width="62" height="18" rx="5" fill="#ece6d8" stroke="#5a5650" stroke-width="2"/><rect x="14" y="22" width="62" height="4" fill="#e0684a"/><path d="M20 22 L26 10 L64 10 L70 22Z" fill="#a8a296" stroke="#5a5650" stroke-width="2"/><path d="M70 22 V4" stroke="#5a5650" stroke-width="2.4"/><rect x="66" y="0" width="10" height="6" rx="2" fill="#2a2a30"/><circle cx="73" cy="3" r="1.5" fill="#7ff7e4"/>' + [24, 45, 66].map(function (x) { return '<circle cx="' + x + '" cy="46" r="8" fill="#2c2a28"/><circle cx="' + x + '" cy="46" r="3" fill="#c8c2b6"/>'; }).join('') + '</g></svg>'; };
    PROPS_ART.moonglass = function () { return '<svg viewBox="0 0 60 60"><ellipse cx="30" cy="56" rx="18" ry="3" fill="rgba(0,0,0,.35)"/><g class="pa-body"><circle cx="30" cy="34" r="20" fill="#7a8a9a" stroke="#3a4a5a" stroke-width="2"/><circle cx="30" cy="34" r="20" fill="url(#mgg)"/><defs><radialGradient id="mgg" cx=".35" cy=".3"><stop offset="0" stop-color="#ffffff" stop-opacity=".9"/><stop offset=".3" stop-color="#bfe8ff" stop-opacity=".5"/><stop offset="1" stop-color="#2a3a5a" stop-opacity=".6"/></radialGradient></defs><path d="M18 40 Q30 30 42 42" stroke="#d4a85a" stroke-width="2.4" fill="none" opacity=".8"/><circle cx="23" cy="26" r="4" fill="#fff" opacity=".85"/></g></svg>'; };
    PROPS_ART.moonflag = function () { return '<svg viewBox="0 0 50 110"><ellipse cx="14" cy="106" rx="10" ry="2.5" fill="rgba(0,0,0,.35)"/><g class="pa-body"><path d="M12 106 V8" stroke="#d8d2c4" stroke-width="3"/><path d="M12 10 H46" stroke="#d8d2c4" stroke-width="2"/><g class="pa-leaves"><path d="M12 12 H46 V40 H12Z" fill="#2f6fb8" stroke="#1a3a6a" stroke-width="1.6"/><circle cx="29" cy="26" r="8" fill="none" stroke="#fff" stroke-width="2"/><path d="M21 26 H37 M29 18 V34" stroke="#fff" stroke-width="1.4"/></g></g></svg>'; };
    // a passer-by in a moonsuit: the face shows through the open sun visor, and the suit takes the person's colors
    PROPS_ART.moonsuit = function (o) { o = o || {}; var sk = o.skin || '#e8c0a0', hr = o.hair || '#2a1a14', tr = o.shirt || '#e0684a';
      return '<svg viewBox="0 0 48 92"><ellipse cx="24" cy="89" rx="15" ry="3" fill="rgba(0,0,0,.35)"/><g class="pa-body">' +
        '<rect x="9" y="30" width="30" height="14" rx="4" fill="#cfc8ba" stroke="#5a5650" stroke-width="1.6"/>' +
        '<path d="M13 42 h22 l-1 16 h-20z" fill="#f4f0e6" stroke="#5a5650" stroke-width="1.6"/>' +
        '<path d="M15 58 h8 v26 h-9 q-1 -3 1 -4z M25 58 h8 l1 22 q2 1 1 4 h-10z" fill="#f4f0e6" stroke="#5a5650" stroke-width="1.6"/>' +
        '<path d="M13 84 h10 M25 84 h10" stroke="#5a5650" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M12 36 q-6 8 -4 18 M36 36 q6 8 4 18" stroke="#f4f0e6" stroke-width="6" stroke-linecap="round" fill="none"/><path d="M12 36 q-6 8 -4 18 M36 36 q6 8 4 18" stroke="#5a5650" stroke-width="1" fill="none" opacity=".4"/>' +
        '<rect x="13" y="44" width="22" height="3.5" fill="' + tr + '"/><rect x="19" y="49" width="10" height="6" rx="1.5" fill="#2a3a5a"/><circle cx="21.5" cy="52" r="1.2" fill="#7ff7e4"/><circle cx="26.5" cy="52" r="1.2" fill="#ffb02e"/>' +
        '<circle cx="24" cy="18" r="15" fill="#e8e2d6" stroke="#5a5650" stroke-width="1.8"/>' +
        '<ellipse cx="24" cy="19.5" rx="11" ry="10" fill="#1c2436"/>' +
        '<g clip-path="url(#msv)"><clipPath id="msv"><ellipse cx="24" cy="19.5" rx="11" ry="10"/></clipPath><ellipse cx="24" cy="21" rx="7.4" ry="8.2" fill="' + sk + '"/><path d="M16 17 q2 -8 8 -8 q7 0 8 8 q-3 -3 -8 -3 q-5 0 -8 3z" fill="' + hr + '"/>' +
        '<circle cx="21" cy="21" r="1.2" fill="#2a1a14"/><circle cx="27" cy="21" r="1.2" fill="#2a1a14"/><path d="M22 25 q2 1.6 4 0" stroke="#7a3a2a" stroke-width="1" fill="none" stroke-linecap="round"/><circle cx="19.5" cy="23.5" r="1.4" fill="#ff8a8a" opacity=".4"/><circle cx="28.5" cy="23.5" r="1.4" fill="#ff8a8a" opacity=".4"/></g>' +
        '<path d="M13.5 13 q10.5 -7 21 0 l-1 2.4 q-9.5 -5 -19 0z" fill="#d8a040" stroke="#8a6020" stroke-width="1"/><path d="M16 22 q2 -8 8 -10" stroke="#fff" stroke-width="1.6" fill="none" opacity=".55" stroke-linecap="round"/>' +
        '<rect x="20" y="1" width="2" height="5" fill="#9a948a"/><circle cx="21" cy="1.5" r="1.4" fill="#ff5a3a"/></g></svg>'; };
    PROPS.moon = [
      { id: 'moonrover', x: 80, y: 90, w: 86, sfx: 'beep', fx: 'spin' },
      { id: 'moonglass', x: 22, y: 92, w: 46, sfx: 'chime', fx: 'jiggle', burst: 'sparkles' },
      { id: 'moonflag', x: 9, y: 86, w: 40, sfx: 'rustle', fx: 'wiggle' },
      { id: 'moonsuit', x: 63, y: 87, w: 40, talk: 'moon', look: { skin: '#c98e64', shirt: '#4aa8b8', hair: '#1b1410' } },
      { id: 'moonsuit', x: 38, y: 88, w: 38, talk: 'moon', look: { skin: '#f1cfb6', shirt: '#e0684a', hair: '#b8642e' } }
    ];
    PROPS.moon_night = [{ id: 'star', x: 18, y: 9, w: 26, sfx: 'chime', fx: 'shoot' }, { id: 'star', x: 52, y: 6, w: 20, sfx: 'chime', fx: 'shoot' }, { id: 'moonglass', x: 84, y: 92, w: 44, sfx: 'chime', fx: 'jiggle', burst: 'sparkles' }];
  });
})();
