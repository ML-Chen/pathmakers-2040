/* scenes/eastie_kitchen.js — Rosa's kitchen on the top floor of a triple-decker in East Boston, a spring afternoon.
   Through the big window: the inner harbor, an electric ferry heading to Long Wharf, and downtown Boston's skyline
   (a "preserve" city that looks much as it does today). Inside: a retired ferry captain's kitchen with a ship's-wheel
   clock, an old ferry photo, tea tins on the shelf, Sunny's pill dispenser and home hub on the counter, her armchair
   with the stand-up alarm, a small table set for tea, a delivery box and Sunny's faceless robot helper.
   PAINT.eastie_kitchen = {paint, overlay, focus, anchors, track}. anchors are the spots the home visit refers to (fractions of w, h).
   Utilities are copied from paint_boston.js (seeded, so it paints the same every time). */
(function () {
  'use strict';
  var PAINT = (window.PAINT = window.PAINT || {});
  var PI = Math.PI, TAU = PI * 2;
  function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function hash(i, s) { var x = Math.imul((i | 0) ^ Math.imul(s | 0, 0x9E3779B1), 0x27d4eb2d); x ^= x >>> 15; x = Math.imul(x, 0x85ebca6b); x ^= x >>> 13; x = Math.imul(x, 0xc2b2ae35); x ^= x >>> 16; return (x >>> 0) / 4294967296; }
  function vnoise(x, s) { var i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return hash(i, s) * (1 - u) + hash(i + 1, s) * u; }
  function fbm(x, s, oct) { var v = 0, a = 0.5, fr = 1, n = 0, o; for (o = 0; o < (oct || 4); o++) { v += a * vnoise(x * fr, s + o * 131); n += a; a *= 0.5; fr *= 2.07; } return v / n; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
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
  function poly(ctx, pts) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); }
  function rrect(ctx, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath(); }
  function glow(ctx, x, y, r, col, a) { ctx.fillStyle = rg(ctx, x, y, 0, r, [[0, rgba(col, a)], [0.35, rgba(col, a * 0.35)], [1, rgba(col, 0)]]); ctx.fillRect(x - r, y - r, r * 2, r * 2); }
  function haze(ctx, x0, y0, x1, y1, col, a) { var cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, rx = (x1 - x0) / 2, ry = Math.max(1, (y1 - y0) / 2); ctx.save(); ctx.translate(cx, cy); ctx.scale(1, ry / rx); ctx.fillStyle = rg(ctx, 0, 0, 0, rx, [[0, rgba(col, a)], [0.6, rgba(col, a * 0.75)], [1, rgba(col, 0)]]); ctx.fillRect(-rx, -rx, rx * 2, rx * 2); ctx.restore(); }
  var QK = 0.914;
  function qell(ctx, x, y, rx, ry, a) { var ca = Math.cos(a || 0), sa = Math.sin(a || 0), k = QK; function X(u, v) { return x + u * ca - v * sa; } function Y(u, v) { return y + u * sa + v * ca; } ctx.moveTo(X(rx, 0), Y(rx, 0)); ctx.quadraticCurveTo(X(rx * k, ry * k), Y(rx * k, ry * k), X(0, ry), Y(0, ry)); ctx.quadraticCurveTo(X(-rx * k, ry * k), Y(-rx * k, ry * k), X(-rx, 0), Y(-rx, 0)); ctx.quadraticCurveTo(X(-rx * k, -ry * k), Y(-rx * k, -ry * k), X(0, -ry), Y(0, -ry)); ctx.quadraticCurveTo(X(rx * k, -ry * k), Y(rx * k, -ry * k), X(rx, 0), Y(rx, 0)); }
  function dabs(ctx, n, cols, gen) { var i, k, b = []; for (k = 0; k < cols.length; k++) b.push([]); for (i = 0; i < n; i++) { var d = gen(i); if (d) b[d[4]].push(d); } ctx.save(); for (k = 0; k < cols.length; k++) { if (!b[k].length) continue; ctx.fillStyle = cols[k][0]; ctx.globalAlpha = cols[k][1]; ctx.beginPath(); for (i = 0; i < b[k].length; i++) { var q = b[k][i]; qell(ctx, q[0], q[1], q[2], q[3], q[5] || 0); } ctx.fill(); } ctx.restore(); }
  function batch(ctx, n, cols, gen) { var paths = [], i, k; for (k = 0; k < cols.length; k++) paths.push([]); for (i = 0; i < n; i++) { var s = gen(i); if (s) paths[s[4]].push(s); } ctx.save(); ctx.lineCap = 'round'; for (k = 0; k < cols.length; k++) { var p = paths[k]; if (!p.length) continue; ctx.beginPath(); for (i = 0; i < p.length; i++) { ctx.moveTo(p[i][0], p[i][1]); ctx.lineTo(p[i][2], p[i][3]); } ctx.strokeStyle = cols[k][0]; ctx.lineWidth = cols[k][1]; ctx.globalAlpha = cols[k][2]; ctx.stroke(); } ctx.restore(); }
  function rects(ctx, n, cols, gen) { var i, k, b = []; for (k = 0; k < cols.length; k++) b.push([]); for (i = 0; i < n; i++) { var d = gen(i); if (d) b[d[4]].push(d); } ctx.save(); for (k = 0; k < cols.length; k++) { if (!b[k].length) continue; ctx.fillStyle = cols[k][0]; ctx.globalAlpha = cols[k][1]; ctx.beginPath(); for (i = 0; i < b[k].length; i++) { var q = b[k][i]; ctx.rect(q[0], q[1], q[2], q[3]); } ctx.fill(); } ctx.restore(); }
  var grainCv = null;
  function finish(ctx, w, h, gradeCol, gradeA, vig, grainA, vigCol, vy) {
    try {
      ctx.save();
      if (gradeCol) { ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = gradeA; ctx.fillStyle = gradeCol; ctx.fillRect(0, 0, w, h); }
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      var R = Math.max(w, h) * 0.75, vc = vigCol || '#14101e';
      if (vig > 0) { ctx.fillStyle = rg(ctx, w / 2, h * (vy || 0.42), R * 0.35, R, [[0, rgba(vc, 0)], [1, rgba(vc, vig)]]); ctx.fillRect(0, 0, w, h); }
      if (!grainCv && typeof document !== 'undefined') { grainCv = document.createElement('canvas'); grainCv.width = grainCv.height = 128; var g = grainCv.getContext('2d'), id = g.createImageData(128, 128), r = rng(4242), i, v; for (i = 0; i < 128 * 128; i++) { v = (r() * 255) | 0; id.data[i * 4] = v; id.data[i * 4 + 1] = v; id.data[i * 4 + 2] = v; id.data[i * 4 + 3] = 255; } g.putImageData(id, 0, 0); }
      if (grainCv && grainA > 0) { ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = grainA; ctx.fillStyle = ctx.createPattern(grainCv, 'repeat'); ctx.fillRect(0, 0, w, h); }
      ctx.restore();
    } catch (e) { try { ctx.restore(); } catch (e2) {} }
  }
  function reflect(ctx, w, axis, y1, al, amp, freq, seed) {
    try {
      var cv = ctx.canvas; if (!cv || !cv.width) return; var k = cv.width / w, y;
      var st = Math.max(2, Math.round(1.5 * k)) / k, srcH = Math.min(axis, (y1 - axis) + 2 * st), sw = cv.width, sh = Math.ceil(srcH * k);
      var scratch = mk(sw, sh); if (!scratch) return; var g = scratch.getContext('2d');
      g.drawImage(cv, 0, Math.round((axis - srcH) * k), sw, sh, 0, 0, sw, sh);
      ctx.save(); ctx.beginPath(); ctx.rect(0, axis, w, y1 - axis); ctx.clip();
      for (y = axis; y < y1; y += st) { var d = y - axis, src = srcH - d - st, p = d / Math.max(1, y1 - axis); if (src < 0) break;
        var dx = (Math.sin(y * freq + seed) * 0.6 + Math.sin(y * freq * 2.7 + seed * 3) * 0.4) * amp * (0.3 + p);
        ctx.globalAlpha = al * (1 - p * 0.4); ctx.drawImage(scratch, 0, Math.round(src * k), sw, Math.max(1, Math.round(st * k)), dx, y, w, st + 0.5 / k); }
      ctx.restore();
    } catch (e) { try { ctx.restore(); } catch (e2) {} }
  }
  var SPR = {};
  function glowSpr(col) { if (SPR[col] !== undefined) return SPR[col]; var c = mk(64, 64); if (c) { var g = c.getContext('2d'); g.fillStyle = rg(g, 32, 32, 0, 32, [[0, rgba(col, 1)], [0.25, rgba(col, 0.55)], [1, rgba(col, 0)]]); g.fillRect(0, 0, 64, 64); } SPR[col] = c; return c; }
  /* soft sunlit cumulus made of overlapping puffs, lit from the upper right */
  function puffCloud(ctx, cx, cy, W, H, r, lit, shade) {
    var n = 9 + ((r() * 5) | 0), i, P = [];
    for (i = 0; i < n; i++) { var u = (i / (n - 1)) * 2 - 1, hp = Math.sqrt(Math.max(0, 1 - u * u)); P.push([cx + u * W * 0.45, cy - hp * H * 0.35 + r() * H * 0.1, H * (0.3 + 0.35 * hp) * (0.8 + r() * 0.4)]); }
    ctx.save(); ctx.fillStyle = shade; ctx.globalAlpha = 0.9; ctx.beginPath(); P.forEach(function (p) { ctx.moveTo(p[0] + p[2], p[1]); ctx.arc(p[0], p[1], p[2], 0, TAU); }); ctx.fill();
    ctx.fillStyle = lit; ctx.globalAlpha = 0.95; ctx.beginPath(); P.forEach(function (p) { ctx.moveTo(p[0] + p[2] * 0.85 + p[2] * 0.12, p[1] - p[2] * 0.18); ctx.arc(p[0] + p[2] * 0.12, p[1] - p[2] * 0.18, p[2] * 0.85, 0, TAU); }); ctx.fill();
    ctx.globalAlpha = 1; ctx.fillStyle = lg(ctx, 0, cy - H * 0.2, 0, cy + H * 0.5, [[0, 'rgba(255,255,255,0)'], [1, rgba(shade, 0.7)]]); ctx.fillRect(cx - W, cy, W * 2, H * 0.5); ctx.restore();
  }
  function drawBird(ctx, x, y, sz, flap) { var f = Math.sin(flap) * sz * 0.6; ctx.beginPath(); ctx.moveTo(x - sz, y - f); ctx.quadraticCurveTo(x - sz * 0.4, y - sz * 0.35, x, y); ctx.quadraticCurveTo(x + sz * 0.4, y - sz * 0.35, x + sz, y - f); ctx.stroke(); }
  /* the electric harbor ferry, side view, pointing right; (x,y) = waterline centre */
  function ferry(ctx, x, y, L, s) {
    var hh = L * 0.13;
    ctx.fillStyle = 'rgba(30,50,80,0.25)'; ctx.beginPath(); qell(ctx, x, y + hh * 0.25, L * 0.55, hh * 0.25, 0); ctx.fill();
    ctx.fillStyle = '#f7f8fb'; ctx.beginPath(); ctx.moveTo(x - L * 0.5, y - hh); ctx.lineTo(x + L * 0.42, y - hh); ctx.quadraticCurveTo(x + L * 0.56, y - hh * 0.9, x + L * 0.5, y); ctx.lineTo(x - L * 0.46, y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#1f6f8b'; ctx.fillRect(x - L * 0.47, y - hh * 0.38, L * 0.95, hh * 0.22);
    ctx.fillStyle = '#e9edf5'; ctx.beginPath(); rrect(ctx, x - L * 0.36, y - hh * 2.05, L * 0.62, hh * 1.1, hh * 0.25); ctx.fill();
    ctx.fillStyle = '#7fc6e8'; for (var i = 0; i < 7; i++) ctx.fillRect(x - L * 0.33 + i * L * 0.083, y - hh * 1.8, L * 0.06, hh * 0.5);
    ctx.fillStyle = '#16b3a6'; ctx.beginPath(); rrect(ctx, x - L * 0.1, y - hh * 2.75, L * 0.22, hh * 0.75, hh * 0.2); ctx.fill();
    ctx.fillStyle = '#bfe8ff'; ctx.fillRect(x - L * 0.06, y - hh * 2.6, L * 0.14, hh * 0.32);
    ctx.fillStyle = '#2a3a5a'; ctx.fillRect(x - L * 0.36, y - hh * 0.96, L * 0.62, hh * 0.06);
  }

  /* ---------------- layout ---------------- */
  var KL = memo(function (w, h) {
    var s = S(w, h), L = { s: s };
    L.wx0 = w * 0.2; L.wx1 = w * 0.8; L.wy0 = h * 0.065; L.wy1 = h * 0.4;  // window opening
    L.hz = L.wy0 + (L.wy1 - L.wy0) * 0.56;   // horizon (far shore) seen through the window
    L.ceil = h * 0.035;
    L.counterY = h * 0.475; L.counterF = h * 0.5; L.cabY = h * 0.6; // counter top back edge, front edge, base cabinets bottom
    L.floorY = h * 0.6;
    return L;
  });
  var ANCH = { photo: { x: 0.9, y: 0.2 }, shelf: { x: 0.09, y: 0.23 }, dispenser: { x: 0.12, y: 0.45 }, hub: { x: 0.25, y: 0.44 }, tin: { x: 0.47, y: 0.45 }, alarm: { x: 0.79, y: 0.56 }, robot: { x: 0.585, y: 0.6 }, box: { x: 0.25, y: 0.64 } };

  function paintOutside(ctx, w, h, L, r) {
    var s = L.s, x0 = L.wx0 - 6 * s, x1 = L.wx1 + 6 * s, y0 = L.wy0 - 6 * s, hz = L.hz, i, x;
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, L.wy1 - y0 + 6 * s); ctx.clip();
    // spring afternoon sky
    ctx.fillStyle = lg(ctx, 0, y0, 0, hz, [[0, '#7fb6ea'], [0.55, '#b9d9f4'], [1, '#f6e4cc']]); ctx.fillRect(x0, y0, x1 - x0, hz - y0 + 2);
    glow(ctx, w * 0.7, L.wy0 + (hz - L.wy0) * 0.2, w * 0.5, '#fff1c8', 0.55);
    puffCloud(ctx, w * 0.36, L.wy0 + (hz - L.wy0) * 0.32, w * 0.3, h * 0.03, r, '#ffffff', '#c8d6ee');
    puffCloud(ctx, w * 0.66, L.wy0 + (hz - L.wy0) * 0.18, w * 0.22, h * 0.022, r, '#fffaf2', '#cfd9ee');
    // downtown across the harbor: a preserved skyline of granite and glass towers, hazy with distance
    var base = hz, bx = x0, far = rng(7311);
    for (x = x0 - 4 * s; x < x1;) { var bw = (7 + far() * 10) * s, bh = (8 + far() * 22) * s; ctx.fillStyle = mix('#a9bcd8', '#d8dfec', far() * 0.5); ctx.fillRect(x, base - bh, bw + 0.6, bh); x += bw * (0.8 + far() * 0.5); }
    var T = [[0.30, 0.032, 0.62, 'g'], [0.355, 0.026, 0.42, 's'], [0.4, 0.04, 0.9, 'g'], [0.448, 0.022, 0.55, 'c'], [0.48, 0.034, 0.74, 's'], [0.53, 0.03, 1, 'g'], [0.565, 0.026, 0.6, 's'], [0.6, 0.036, 0.82, 'p'], [0.645, 0.024, 0.5, 's'], [0.68, 0.03, 0.66, 'g'], [0.72, 0.022, 0.44, 's']];
    var Hmax = (hz - L.wy0) * 0.62;
    T.forEach(function (t, k) {
      var tx = w * t[0], tw = w * t[1], th = Hmax * t[2], top = base - th, kind = t[3];
      var face = kind === 'g' ? lg(ctx, tx, 0, tx + tw, 0, [[0, '#9fb6d6'], [0.55, '#c8d8ee'], [1, '#8ea6c8']]) : lg(ctx, tx, 0, tx + tw, 0, [[0, '#b7aea6'], [0.6, '#d9d0c4'], [1, '#a59c95']]);
      ctx.fillStyle = face; ctx.fillRect(tx, top, tw, th);
      if (kind === 'p') { ctx.beginPath(); ctx.moveTo(tx - 0.5 * s, top); ctx.lineTo(tx + tw / 2, top - tw * 0.9); ctx.lineTo(tx + tw + 0.5 * s, top); ctx.fill(); }
      if (kind === 'c') { ctx.fillRect(tx + tw * 0.2, top - th * 0.12, tw * 0.6, th * 0.12); ctx.beginPath(); ctx.moveTo(tx + tw * 0.2, top - th * 0.12); ctx.lineTo(tx + tw / 2, top - th * 0.24); ctx.lineTo(tx + tw * 0.8, top - th * 0.12); ctx.fill(); ctx.fillStyle = '#f4efe2'; ctx.beginPath(); ctx.arc(tx + tw / 2, top - th * 0.06, tw * 0.17, 0, TAU); ctx.fill(); }
      rects(ctx, 160, [[kind === 'g' ? '#7e98bf' : '#8f857e', 0.35], ['#ffffff', 0.25]], function (i2) { var cols = Math.max(2, Math.floor(tw / (2.2 * s))), rr = (i2 / cols) | 0, cc = i2 % cols, yy = top + 2 * s + rr * 2.6 * s; if (yy > base - 2 * s) return null; return [tx + 0.8 * s + cc * (tw - 1.6 * s) / cols, yy, Math.max(0.6, (tw - 1.6 * s) / cols - 0.7 * s), 1.1 * s, (rr + cc + k) % 7 === 0 ? 1 : 0]; });
      ctx.fillStyle = 'rgba(255,240,215,0.5)'; ctx.fillRect(tx + tw - 1 * s, top, 1 * s, th);
    });
    haze(ctx, x0, base - Hmax * 0.6, x1, base + 2 * s, '#e9eef6', 0.35);
    // the far waterfront: wharves and low brick buildings with trees
    ctx.fillStyle = '#9a8f8c'; ctx.fillRect(x0, base - 3 * s, x1 - x0, 3.4 * s);
    rects(ctx, 30, [['#b07a62', 0.9], ['#8d6f6a', 0.9]], function (i2) { var xx = x0 + i2 * (x1 - x0) / 30; return [xx, base - (4 + hash(i2, 3) * 4) * s, (x1 - x0) / 30 * 0.8, 6 * s, i2 % 2]; });
    // harbor water
    var wy1 = L.wy1 + 6 * s;
    ctx.fillStyle = lg(ctx, 0, base, 0, wy1, [[0, '#8fb4d8'], [0.4, '#6f9cc8'], [1, '#4d7fb2']]); ctx.fillRect(x0, base, x1 - x0, wy1 - base);
    reflect(ctx, w, base + 0.5 * s, wy1, 0.35, 1.6 * s, 0.9 / s, 2);
    batch(ctx, 420, [['#e6f2ff', 0.7 * s, 0.5], ['#3e6a9a', 0.8 * s, 0.35]], function () { var p = Math.pow(r(), 1.2), yy = base + 2 * s + p * (wy1 - base), xx = x0 + r() * (x1 - x0), l = (2 + p * 9) * s; return [xx, yy, xx + l, yy, r() < 0.6 ? 0 : 1]; });
    // glitter under the sun
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = lg(ctx, w * 0.6, 0, w * 0.8, 0, [[0, 'rgba(255,240,200,0)'], [0.5, 'rgba(255,240,200,0.28)'], [1, 'rgba(255,240,200,0)']]); ctx.fillRect(w * 0.6, base, w * 0.2, wy1 - base); ctx.restore();
    // a moored sailboat and the near pier (Piers Park) at the bottom left of the view
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(w * 0.31, base + (wy1 - base) * 0.32); ctx.lineTo(w * 0.31, base - 10 * s); ctx.lineTo(w * 0.345, base + (wy1 - base) * 0.3); ctx.fill();
    ctx.fillStyle = '#c0504d'; ctx.fillRect(w * 0.295, base + (wy1 - base) * 0.32, 18 * s, 2.4 * s);
    ctx.fillStyle = lg(ctx, 0, wy1 - 10 * s, 0, wy1, [[0, '#7c6a58'], [1, '#5a4a3c']]); ctx.beginPath(); ctx.moveTo(x0, wy1 - 6 * s); ctx.lineTo(w * 0.45, wy1 - 3 * s); ctx.lineTo(w * 0.45, wy1 + 2 * s); ctx.lineTo(x0, wy1 + 2 * s); ctx.fill();
    for (i = 0; i < 8; i++) { var px = x0 + i * (w * 0.45 - x0) / 8; ctx.fillStyle = '#4a3c30'; ctx.fillRect(px, wy1 - 5 * s + i * 0.35 * s, 1.6 * s, 7 * s); }
    ctx.restore();
  }

  function paintRoom(ctx, w, h, L, r) {
    var s = L.s, i, k;
    // walls: warm butter-yellow plaster with the window cut out
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, L.floorY + 2 * s); ctx.rect(L.wx0, L.wy0, L.wx1 - L.wx0, L.wy1 - L.wy0);
    ctx.fillStyle = lg(ctx, 0, 0, 0, L.floorY, [[0, '#f3d79c'], [0.5, '#f7e1ad'], [1, '#e9c88c']]); ctx.fill('evenodd'); ctx.clip('evenodd');
    dabs(ctx, 320, [['#fff0c8', 0.16], ['#d9b276', 0.12]], function () { return [r() * w, r() * L.floorY, (6 + r() * 18) * s, (3 + r() * 8) * s, r() < 0.5 ? 0 : 1, r() * PI]; });
    // sunlight from the window falls on the right wall
    ctx.globalCompositeOperation = 'lighter'; glow(ctx, w * 0.5, L.wy0 + (L.wy1 - L.wy0) * 0.5, w * 0.62, '#ffb878', 0.14); ctx.restore();
    // ceiling and crown molding
    ctx.fillStyle = lg(ctx, 0, 0, 0, L.ceil, [[0, '#e7c58c'], [1, '#f5dca8']]); ctx.fillRect(0, 0, w, L.ceil);
    ctx.fillStyle = '#fff6e2'; ctx.fillRect(0, L.ceil - 3 * s, w, 5 * s); ctx.fillStyle = 'rgba(120,80,40,0.25)'; ctx.fillRect(0, L.ceil + 2 * s, w, 1.6 * s);
    // window: white painted wood, two double-hung sashes, a wide sill
    var fx0 = L.wx0, fx1 = L.wx1, fy0 = L.wy0, fy1 = L.wy1, fw = 9 * s, mx = (fx0 + fx1) / 2;
    ctx.fillStyle = '#fbf8f1'; ctx.beginPath(); ctx.rect(fx0 - fw, fy0 - fw, fx1 - fx0 + fw * 2, fy1 - fy0 + fw * 2); ctx.rect(fx0, fy0, fx1 - fx0, fy1 - fy0); ctx.fill('evenodd');
    ctx.strokeStyle = 'rgba(150,120,90,0.45)'; ctx.lineWidth = 1 * s; ctx.strokeRect(fx0 - fw, fy0 - fw, fx1 - fx0 + fw * 2, fy1 - fy0 + fw * 2); ctx.strokeRect(fx0, fy0, fx1 - fx0, fy1 - fy0);
    ctx.fillStyle = '#fbf8f1'; ctx.fillRect(mx - 3.5 * s, fy0, 7 * s, fy1 - fy0);
    var meet = fy0 + (fy1 - fy0) * 0.48; ctx.fillRect(fx0, meet - 3 * s, fx1 - fx0, 6 * s);
    ctx.strokeStyle = '#efe8da'; ctx.lineWidth = 1.6 * s; ctx.beginPath();
    [[fx0, mx - 3.5 * s], [mx + 3.5 * s, fx1]].forEach(function (P) { var third = (P[1] - P[0]) / 2; ctx.moveTo(P[0] + third, fy0); ctx.lineTo(P[0] + third, meet - 3 * s); ctx.moveTo(P[0], fy0 + (meet - fy0) / 2); ctx.lineTo(P[1], fy0 + (meet - fy0) / 2); }); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.moveTo(fx0 + 14 * s, fy0); ctx.lineTo(fx0 + 44 * s, fy0); ctx.lineTo(fx0 + 10 * s, fy1); ctx.lineTo(fx0 - 4 * s, fy1); ctx.fill();
    // sill with a red geranium and a little brass lighthouse
    ctx.fillStyle = '#f6f1e6'; ctx.fillRect(fx0 - fw * 1.6, fy1 + fw * 0.6, fx1 - fx0 + fw * 3.2, 6 * s); ctx.fillStyle = 'rgba(120,90,60,0.3)'; ctx.fillRect(fx0 - fw * 1.6, fy1 + fw * 0.6 + 6 * s, fx1 - fx0 + fw * 3.2, 2 * s);
    var gx = fx0 + 22 * s, gy = fy1 + fw * 0.6;
    ctx.fillStyle = '#c8673f'; ctx.beginPath(); ctx.moveTo(gx - 9 * s, gy - 12 * s); ctx.lineTo(gx + 9 * s, gy - 12 * s); ctx.lineTo(gx + 7 * s, gy); ctx.lineTo(gx - 7 * s, gy); ctx.fill();
    for (k = 0; k < 9; k++) { ctx.fillStyle = k % 2 ? '#3f7a3a' : '#579b45'; ctx.beginPath(); qell(ctx, gx + (hash(k, 5) - 0.5) * 22 * s, gy - 15 * s - hash(k, 6) * 8 * s, 4.4 * s, 3.4 * s, 0); ctx.fill(); }
    for (k = 0; k < 6; k++) { ctx.fillStyle = k % 2 ? '#e8384a' : '#ff5d6c'; ctx.beginPath(); ctx.arc(gx + (hash(k, 8) - 0.5) * 16 * s, gy - 22 * s - hash(k, 9) * 7 * s, 2.6 * s, 0, TAU); ctx.fill(); }
    var lx = fx1 - 24 * s; ctx.fillStyle = '#d4a23a'; ctx.beginPath(); ctx.moveTo(lx - 4 * s, gy); ctx.lineTo(lx - 2.4 * s, gy - 16 * s); ctx.lineTo(lx + 2.4 * s, gy - 16 * s); ctx.lineTo(lx + 4 * s, gy); ctx.fill();
    ctx.fillStyle = '#f2f0ea'; ctx.fillRect(lx - 2.6 * s, gy - 11 * s, 5.2 * s, 2.4 * s); ctx.fillStyle = '#fff3a8'; ctx.fillRect(lx - 2 * s, gy - 20 * s, 4 * s, 4 * s); ctx.fillStyle = '#8a5a2a'; ctx.beginPath(); ctx.moveTo(lx - 3 * s, gy - 20 * s); ctx.lineTo(lx, gy - 23 * s); ctx.lineTo(lx + 3 * s, gy - 20 * s); ctx.fill();
    // gingham cafe curtains on a brass rod, gathered at the sides
    ctx.fillStyle = '#c99a3a'; ctx.fillRect(fx0 - fw * 2.2, fy0 - fw * 1.6, fx1 - fx0 + fw * 4.4, 2.4 * s);
    [[fx0 - fw * 2, fx0 + 16 * s], [fx1 - 16 * s, fx1 + fw * 2]].forEach(function (C) {
      var cx0 = C[0], cx1 = C[1], top = fy0 - fw * 1.4, bot = fy1 + fw * 0.4;
      ctx.save(); ctx.beginPath(); ctx.moveTo(cx0, top); ctx.lineTo(cx1, top); ctx.quadraticCurveTo((cx0 + cx1) / 2 + (cx1 - cx0) * 0.1, (top + bot) / 2, cx1 - (cx1 - cx0) * 0.2, bot); ctx.lineTo(cx0 + (cx1 - cx0) * 0.2, bot); ctx.quadraticCurveTo((cx0 + cx1) / 2 - (cx1 - cx0) * 0.1, (top + bot) / 2, cx0, top); ctx.closePath();
      ctx.fillStyle = '#fbfbf7'; ctx.fill(); ctx.clip();
      ctx.fillStyle = 'rgba(64,126,196,0.35)'; for (var gy2 = top; gy2 < bot; gy2 += 6 * s) ctx.fillRect(cx0, gy2, cx1 - cx0, 3 * s); for (var gx2 = cx0; gx2 < cx1; gx2 += 6 * s) ctx.fillRect(gx2, top, 3 * s, bot - top);
      ctx.fillStyle = lg(ctx, cx0, 0, cx1, 0, [[0, 'rgba(60,40,20,0.18)'], [0.5, 'rgba(255,255,255,0)'], [1, 'rgba(60,40,20,0.18)']]); ctx.fillRect(cx0, top, cx1 - cx0, bot - top); ctx.restore();
    });
    // left wall: open shelf with tea tins and jars, the ship's-wheel clock below
    var shx0 = w * 0.015, shx1 = w * 0.175, shy = h * 0.25;
    ctx.fillStyle = '#9a6a42'; ctx.fillRect(shx0, shy, shx1 - shx0, 4 * s); ctx.fillStyle = 'rgba(80,50,30,0.3)'; ctx.fillRect(shx0, shy + 4 * s, shx1 - shx0, 3 * s);
    var items = [[0.035, 9, 15, '#3f7fbf', 'jar'], [0.065, 9, 20, '#8b2f3c', 'tin'], [0.1, 10, 22, '#8b2f3c', 'tin'], [0.135, 8, 13, '#e8b04a', 'jar'], [0.16, 7, 17, '#5aa36b', 'tin']];
    items.forEach(function (it) { var ix = w * it[0], iw = it[1] * s, ih = it[2] * s; ctx.fillStyle = it[3]; ctx.beginPath(); rrect(ctx, ix - iw / 2, shy - ih, iw, ih, 1.6 * s); ctx.fill();
      if (it[4] === 'tin') { ctx.fillStyle = '#f6e3b4'; ctx.fillRect(ix - iw / 2, shy - ih * 0.62, iw, ih * 0.3); ctx.fillStyle = mix(it[3], '#ffffff', 0.25); ctx.fillRect(ix - iw / 2, shy - ih - 1.4 * s, iw, 2 * s); }
      else { ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(ix - iw / 2 + 1 * s, shy - ih + 1.5 * s, 1.6 * s, ih - 3 * s); ctx.fillStyle = '#d8c7a6'; ctx.fillRect(ix - iw / 2 - 0.5 * s, shy - ih - 2 * s, iw + 1 * s, 2.4 * s); } });
    var shy2 = h * 0.145; ctx.fillStyle = '#9a6a42'; ctx.fillRect(shx0, shy2, shx1 - shx0, 4 * s);
    [[0.04, '#f2efe6'], [0.075, '#4a8fc6'], [0.11, '#f2efe6'], [0.145, '#e86a5a']].forEach(function (c, j) { var cx = w * c[0]; ctx.fillStyle = c[1]; ctx.beginPath(); ctx.moveTo(cx - 5 * s, shy2 - 9 * s); ctx.lineTo(cx + 5 * s, shy2 - 9 * s); ctx.lineTo(cx + 4 * s, shy2); ctx.lineTo(cx - 4 * s, shy2); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 0.8 * s; ctx.stroke(); });
    // ship's-wheel clock (spokes, rim, brass hub, clock face)
    var cwx = w * 0.095, cwy = h * 0.345, R = 17 * s;
    ctx.strokeStyle = '#7a4a24'; ctx.lineCap = 'round'; ctx.lineWidth = 3.4 * s; ctx.beginPath(); for (k = 0; k < 8; k++) { var a = k * PI / 4; ctx.moveTo(cwx + Math.cos(a) * R * 0.4, cwy + Math.sin(a) * R * 0.4); ctx.lineTo(cwx + Math.cos(a) * R * 1.32, cwy + Math.sin(a) * R * 1.32); } ctx.stroke();
    ctx.lineWidth = 4.4 * s; ctx.beginPath(); ctx.arc(cwx, cwy, R, 0, TAU); ctx.strokeStyle = '#9a6234'; ctx.stroke(); ctx.lineWidth = 1.2 * s; ctx.strokeStyle = '#c98a4a'; ctx.beginPath(); ctx.arc(cwx, cwy, R - 1.2 * s, PI * 1.1, PI * 1.6); ctx.stroke();
    for (k = 0; k < 8; k++) { var a2 = k * PI / 4; ctx.fillStyle = '#8a5530'; ctx.beginPath(); ctx.arc(cwx + Math.cos(a2) * R * 1.36, cwy + Math.sin(a2) * R * 1.36, 2.4 * s, 0, TAU); ctx.fill(); }
    ctx.fillStyle = '#fbf6e8'; ctx.beginPath(); ctx.arc(cwx, cwy, R * 0.72, 0, TAU); ctx.fill(); ctx.strokeStyle = '#c99a3a'; ctx.lineWidth = 2 * s; ctx.stroke();
    ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 1.6 * s; ctx.beginPath(); ctx.moveTo(cwx, cwy); ctx.lineTo(cwx + R * 0.38, cwy - R * 0.2); ctx.moveTo(cwx, cwy); ctx.lineTo(cwx - R * 0.08, cwy - R * 0.55); ctx.stroke();
    // right wall: the ferry photo in a wood frame, a barometer
    var phx = w * 0.9, phy = h * 0.2, pw = 40 * s, ph = 32 * s;
    ctx.fillStyle = 'rgba(80,50,30,0.25)'; ctx.fillRect(phx - pw / 2 + 2 * s, phy - ph / 2 + 3 * s, pw, ph);
    ctx.fillStyle = '#8a5a30'; ctx.fillRect(phx - pw / 2, phy - ph / 2, pw, ph); ctx.fillStyle = '#efe2c4'; ctx.fillRect(phx - pw / 2 + 4 * s, phy - ph / 2 + 4 * s, pw - 8 * s, ph - 8 * s);
    ctx.fillStyle = '#d9c398'; ctx.fillRect(phx - pw / 2 + 6 * s, phy - ph / 2 + 6 * s, pw - 12 * s, ph - 12 * s);
    ctx.fillStyle = '#b89a6a'; ctx.fillRect(phx - pw / 2 + 6 * s, phy + 2 * s, pw - 12 * s, ph / 2 - 8 * s);
    ferry(ctx, phx + 2 * s, phy + 3 * s, 26 * s, s);
    ctx.fillStyle = '#6a4a2a'; ctx.beginPath(); ctx.arc(phx - 10 * s, phy - 3 * s, 2.2 * s, 0, TAU); ctx.fill();
    var lrx = w * 0.7, lry = h * 0.5, LR = 19 * s;
    ctx.fillStyle = 'rgba(80,50,30,0.25)'; ctx.beginPath(); ctx.arc(lrx + 2 * s, lry + 3 * s, LR, 0, TAU); ctx.arc(lrx + 2 * s, lry + 3 * s, LR * 0.55, 0, TAU, true); ctx.fill();
    for (var q = 0; q < 8; q++) { ctx.fillStyle = q % 2 ? '#ffffff' : '#ef5a3c'; ctx.beginPath(); ctx.arc(lrx, lry, LR, q * PI / 4, (q + 1) * PI / 4); ctx.arc(lrx, lry, LR * 0.55, (q + 1) * PI / 4, q * PI / 4, true); ctx.closePath(); ctx.fill(); }
    ctx.strokeStyle = '#d8c7a6'; ctx.lineWidth = 1.6 * s; ctx.beginPath(); ctx.arc(lrx, lry, LR * 0.78, 0, TAU); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.arc(lrx - 5 * s, lry - 6 * s, LR * 0.9, PI * 1.05, PI * 1.45); ctx.arc(lrx - 5 * s, lry - 6 * s, LR * 0.7, PI * 1.45, PI * 1.05, true); ctx.fill();
    ctx.fillStyle = '#9a6a42'; ctx.beginPath(); ctx.arc(lrx, lry - LR - 2 * s, 2 * s, 0, TAU); ctx.fill();
    var bax = w * 0.9, bay = h * 0.3; ctx.fillStyle = '#c99a3a'; ctx.beginPath(); ctx.arc(bax, bay, 11 * s, 0, TAU); ctx.fill(); ctx.fillStyle = '#fbf6e8'; ctx.beginPath(); ctx.arc(bax, bay, 8 * s, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#2a3a5a'; ctx.lineWidth = 1.2 * s; ctx.beginPath(); ctx.moveTo(bax, bay); ctx.lineTo(bax + 5 * s, bay - 4 * s); ctx.stroke(); ctx.fillStyle = '#7a4a24'; ctx.fillRect(bax - 1 * s, bay + 11 * s, 2 * s, 6 * s);
  }

  function paintKitchen(ctx, w, h, L, r) {
    var s = L.s, i, k, cy = L.counterY, cf = L.counterF, cb = L.cabY;
    // backsplash: white subway tile along the counter run (left half)
    var bx0 = 0, bx1 = w * 0.6, by0 = cy - h * 0.06;
    ctx.fillStyle = '#f6f3ec'; ctx.fillRect(bx0, by0, bx1 - bx0, cy - by0);
    ctx.strokeStyle = 'rgba(160,150,135,0.45)'; ctx.lineWidth = 0.7 * s; ctx.beginPath();
    for (var ty = by0, row = 0; ty < cy; ty += 5 * s, row++) { ctx.moveTo(bx0, ty); ctx.lineTo(bx1, ty); for (var tx = bx0 + (row % 2) * 6 * s; tx < bx1; tx += 12 * s) { ctx.moveTo(tx, ty); ctx.lineTo(tx, Math.min(cy, ty + 5 * s)); } } ctx.stroke();
    // base cabinets: sea-glass green with brass pulls
    ctx.fillStyle = lg(ctx, 0, cf, 0, cb, [[0, '#7fbfa8'], [1, '#5f9f8a']]); ctx.fillRect(0, cf, w * 0.6, cb - cf); ctx.fillStyle = '#3f6f62'; ctx.fillRect(0, cb - 6 * s, w * 0.6, 6 * s);
    for (k = 0; k < 4; k++) { var dx = w * (0.015 + k * 0.148), dw = w * 0.135; ctx.strokeStyle = 'rgba(30,70,60,0.45)'; ctx.lineWidth = 1.2 * s; ctx.strokeRect(dx, cf + 6 * s, dw, cb - cf - 18 * s); ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(dx + 2 * s, cf + 8 * s, 2 * s, cb - cf - 22 * s); ctx.fillStyle = '#d9a64a'; ctx.beginPath(); ctx.arc(dx + dw - 6 * s, cf + 14 * s, 1.8 * s, 0, TAU); ctx.fill(); }
    // butcher-block counter top
    ctx.fillStyle = lg(ctx, 0, cy, 0, cf, [[0, '#c98e5a'], [1, '#b0753e']]); ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w * 0.6, cy); ctx.lineTo(w * 0.6 + 4 * s, cf); ctx.lineTo(0, cf); ctx.fill();
    batch(ctx, 40, [['#8a5530', 0.7 * s, 0.4]], function () { var yy = lerp(cy, cf, r()), xx = r() * w * 0.58; return [xx, yy, xx + (10 + r() * 30) * s, yy, 0]; });
    ctx.fillStyle = '#8a5530'; ctx.fillRect(0, cf, w * 0.6 + 4 * s, 3 * s);
    // the pill dispenser (soft white, yellow stripe, little screen) at the left of the counter
    var dpx = w * 0.12, dpy = cy + 2 * s;
    ctx.fillStyle = 'rgba(60,40,20,0.25)'; ctx.beginPath(); qell(ctx, dpx, dpy, 18 * s, 3 * s, 0); ctx.fill();
    ctx.fillStyle = lg(ctx, dpx - 16 * s, 0, dpx + 16 * s, 0, [[0, '#dfe4f0'], [0.4, '#ffffff'], [1, '#c9d0e2']]); ctx.beginPath(); rrect(ctx, dpx - 16 * s, dpy - 22 * s, 32 * s, 22 * s, 6 * s); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); qell(ctx, dpx, dpy - 22 * s, 16 * s, 5 * s, 0); ctx.fill(); ctx.strokeStyle = '#c9d0e2'; ctx.lineWidth = 0.8 * s; ctx.stroke();
    ctx.fillStyle = '#ffc531'; ctx.fillRect(dpx - 16 * s, dpy - 7 * s, 32 * s, 2.6 * s);
    ctx.fillStyle = '#24305e'; ctx.beginPath(); rrect(ctx, dpx - 8 * s, dpy - 17 * s, 16 * s, 8 * s, 2 * s); ctx.fill();
    // kettle on a trivet
    var kx = w * 0.37, ky = cy + 3 * s;
    ctx.fillStyle = 'rgba(60,40,20,0.25)'; ctx.beginPath(); qell(ctx, kx, ky, 16 * s, 3 * s, 0); ctx.fill();
    ctx.fillStyle = lg(ctx, kx - 14 * s, 0, kx + 14 * s, 0, [[0, '#c0393f'], [0.45, '#ef5b5f'], [1, '#a92e35']]); ctx.beginPath(); ctx.moveTo(kx - 14 * s, ky); ctx.bezierCurveTo(kx - 16 * s, ky - 18 * s, kx + 16 * s, ky - 18 * s, kx + 14 * s, ky); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#2a2a3a'; ctx.lineWidth = 2.2 * s; ctx.beginPath(); ctx.moveTo(kx - 8 * s, ky - 13 * s); ctx.quadraticCurveTo(kx, ky - 24 * s, kx + 8 * s, ky - 13 * s); ctx.stroke();
    ctx.fillStyle = '#c0393f'; ctx.beginPath(); ctx.moveTo(kx + 12 * s, ky - 6 * s); ctx.lineTo(kx + 22 * s, ky - 13 * s); ctx.lineTo(kx + 21 * s, ky - 10 * s); ctx.lineTo(kx + 12 * s, ky - 2 * s); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); qell(ctx, kx - 6 * s, ky - 9 * s, 3 * s, 5 * s, -0.4); ctx.fill();
    // Sunny's home hub: a little round display with its sun avatar
    var hx = w * 0.25, hy = cy - 1 * s;
    ctx.fillStyle = 'rgba(60,40,20,0.25)'; ctx.beginPath(); qell(ctx, hx, hy + 2 * s, 10 * s, 2.4 * s, 0); ctx.fill();
    ctx.fillStyle = '#e9ecf5'; ctx.beginPath(); ctx.moveTo(hx - 7 * s, hy + 2 * s); ctx.lineTo(hx - 3 * s, hy - 8 * s); ctx.lineTo(hx + 3 * s, hy - 8 * s); ctx.lineTo(hx + 7 * s, hy + 2 * s); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(hx, hy - 18 * s, 13 * s, 0, TAU); ctx.fill(); ctx.strokeStyle = '#b8c0d8'; ctx.lineWidth = 1 * s; ctx.stroke();
    ctx.fillStyle = '#2d2550'; ctx.beginPath(); ctx.arc(hx, hy - 18 * s, 10.4 * s, 0, TAU); ctx.fill();
    ctx.fillStyle = rg(ctx, hx - 2 * s, hy - 20 * s, 0, 10 * s, [[0, '#fff3c8'], [1, '#ffcf8a']]); ctx.beginPath(); ctx.arc(hx, hy - 18 * s, 9.2 * s, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ffc531'; ctx.beginPath(); ctx.arc(hx, hy - 18 * s, 5 * s, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#ffb21e'; ctx.lineWidth = 1.2 * s; ctx.beginPath(); for (k = 0; k < 8; k++) { var a = k * PI / 4; ctx.moveTo(hx + Math.cos(a) * 6.2 * s, hy - 18 * s + Math.sin(a) * 6.2 * s); ctx.lineTo(hx + Math.cos(a) * 8 * s, hy - 18 * s + Math.sin(a) * 8 * s); } ctx.stroke();
    ctx.strokeStyle = '#6b3a1e'; ctx.lineWidth = 0.8 * s; ctx.beginPath(); ctx.arc(hx - 1.8 * s, hy - 18.5 * s, 1 * s, PI, TAU); ctx.moveTo(hx + 2.8 * s, hy - 18.5 * s); ctx.arc(hx + 1.8 * s, hy - 18.5 * s, 1 * s, PI, TAU); ctx.moveTo(hx - 1.6 * s, hy - 16.6 * s); ctx.quadraticCurveTo(hx, hy - 14.8 * s, hx + 1.6 * s, hy - 16.6 * s); ctx.stroke();
    // the tea tin on the counter by the kettle (the clue, matching the shelf)
    var tnx = w * 0.47, tny = cy + 2 * s; ctx.fillStyle = 'rgba(60,40,20,0.25)'; ctx.beginPath(); qell(ctx, tnx, tny, 9 * s, 2 * s, 0); ctx.fill();
    ctx.fillStyle = '#8b2f3c'; ctx.beginPath(); rrect(ctx, tnx - 7 * s, tny - 19 * s, 14 * s, 19 * s, 1.6 * s); ctx.fill(); ctx.fillStyle = '#f6e3b4'; ctx.fillRect(tnx - 7 * s, tny - 13 * s, 14 * s, 6 * s); ctx.fillStyle = '#b23a4a'; ctx.fillRect(tnx - 7 * s, tny - 20.4 * s, 14 * s, 2.4 * s);
    ctx.fillStyle = '#6e3f17'; ctx.fillRect(tnx - 4 * s, tny - 11.4 * s, 8 * s, 1 * s); ctx.fillRect(tnx - 4 * s, tny - 9.4 * s, 6 * s, 1 * s);
  }

  function paintFloor(ctx, w, h, L, r) {
    var s = L.s, fy = L.floorY, i, j, vpx = w * 0.5, vpy = h * 0.2;
    // classic checkerboard linoleum in perspective
    ctx.fillStyle = '#e9e1d2'; ctx.fillRect(0, fy, w, h - fy);
    ctx.save(); ctx.beginPath(); ctx.rect(0, fy, w, h - fy); ctx.clip();
    var rowsY = []; for (var t = 0; t < 14; t++) rowsY.push(fy + (h - fy) * Math.pow(t / 13, 1.6));
    for (i = 0; i < rowsY.length - 1; i++) for (j = -14; j < 14; j++) {
      if ((i + j) % 2 === 0) continue;
      var y0 = rowsY[i], y1 = rowsY[i + 1], k0 = (y0 - vpy) / (h - vpy), k1 = (y1 - vpy) / (h - vpy), cw = w * 0.12;
      ctx.fillStyle = '#5f7d8f'; ctx.beginPath(); ctx.moveTo(vpx + j * cw * k0, y0); ctx.lineTo(vpx + (j + 1) * cw * k0, y0); ctx.lineTo(vpx + (j + 1) * cw * k1, y1); ctx.lineTo(vpx + j * cw * k1, y1); ctx.fill();
    }
    ctx.fillStyle = lg(ctx, 0, fy, 0, fy + h * 0.06, [[0, 'rgba(60,40,20,0.35)'], [1, 'rgba(60,40,20,0)']]); ctx.fillRect(0, fy, w, h * 0.06);
    // sunlight patch from the window
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,214,150,0.14)'; ctx.beginPath(); ctx.moveTo(w * 0.36, fy + h * 0.02); ctx.lineTo(w * 0.74, fy + h * 0.02); ctx.lineTo(w * 0.92, h * 0.86); ctx.lineTo(w * 0.42, h * 0.86); ctx.fill();
    ctx.restore();
  }

  function paintFurniture(ctx, w, h, L, r) {
    var s = L.s, i, k;
    // Rosa's armchair by the window (right), with a crocheted throw
    var ax = w * 0.87, ay = h * 0.64;
    ctx.save(); ctx.translate(ax, ay); ctx.scale(1.45, 1.45); ctx.translate(-ax, -ay);
    ctx.fillStyle = 'rgba(40,30,20,0.3)'; ctx.beginPath(); qell(ctx, ax, ay + 4 * s, 46 * s, 6 * s, 0); ctx.fill();
    ctx.fillStyle = lg(ctx, ax - 40 * s, 0, ax + 40 * s, 0, [[0, '#2c4f86'], [0.5, '#3d66a6'], [1, '#22406e']]);
    ctx.beginPath(); ctx.moveTo(ax - 36 * s, ay); ctx.lineTo(ax - 38 * s, ay - 62 * s); ctx.quadraticCurveTo(ax, ay - 80 * s, ax + 38 * s, ay - 62 * s); ctx.lineTo(ax + 36 * s, ay); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#4a74b6'; ctx.beginPath(); rrect(ctx, ax - 44 * s, ay - 34 * s, 16 * s, 34 * s, 7 * s); ctx.fill(); ctx.beginPath(); rrect(ctx, ax + 28 * s, ay - 34 * s, 16 * s, 34 * s, 7 * s); ctx.fill();
    ctx.fillStyle = '#5a84c4'; ctx.beginPath(); rrect(ctx, ax - 30 * s, ay - 26 * s, 60 * s, 14 * s, 6 * s); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.18)'; for (i = 0; i < 6; i++) for (k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(ax - 26 * s + i * 10 * s, ay - 64 * s + k * 9 * s, 1.4 * s, 0, TAU); ctx.fill(); }
    // throw over the back: cream crochet with red stripes
    ctx.fillStyle = '#f4ead4'; ctx.beginPath(); ctx.moveTo(ax - 30 * s, ay - 70 * s); ctx.quadraticCurveTo(ax, ay - 78 * s, ax + 30 * s, ay - 70 * s); ctx.lineTo(ax + 26 * s, ay - 44 * s); ctx.lineTo(ax - 22 * s, ay - 46 * s); ctx.fill();
    ctx.strokeStyle = '#c0504d'; ctx.lineWidth = 2 * s; ctx.beginPath(); ctx.moveTo(ax - 27 * s, ay - 62 * s); ctx.quadraticCurveTo(ax, ay - 68 * s, ax + 28 * s, ay - 62 * s); ctx.moveTo(ax - 24 * s, ay - 53 * s); ctx.quadraticCurveTo(ax, ay - 58 * s, ax + 26 * s, ay - 53 * s); ctx.stroke();
    for (i = 0; i < 9; i++) { ctx.strokeStyle = '#e8dcc0'; ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.moveTo(ax - 22 * s + i * 6 * s, ay - 45 * s); ctx.lineTo(ax - 22 * s + i * 6 * s, ay - 40 * s); ctx.stroke(); }
    ctx.fillStyle = '#5a3a24'; ctx.fillRect(ax - 34 * s, ay - 2 * s, 3 * s, 6 * s); ctx.fillRect(ax + 31 * s, ay - 2 * s, 3 * s, 6 * s);
    // the stand-up alarm: a soft white puck clipped to the front of the left armrest, its light ring dimmed
    var alx = ax - 36 * s, aly = ay - 20 * s;
    ctx.fillStyle = '#f4f6fb'; ctx.beginPath(); rrect(ctx, alx - 7 * s, aly - 7 * s, 14 * s, 12 * s, 3.6 * s); ctx.fill(); ctx.strokeStyle = '#b8c0d8'; ctx.lineWidth = 0.8 * s; ctx.stroke();
    ctx.strokeStyle = '#c9d0e2'; ctx.lineWidth = 1.6 * s; ctx.beginPath(); ctx.arc(alx, aly - 1 * s, 3.4 * s, 0, TAU); ctx.stroke(); ctx.fillStyle = '#ffc531'; ctx.beginPath(); ctx.arc(alx + 4.6 * s, aly + 3 * s, 0.9 * s, 0, TAU); ctx.fill();
    ctx.restore();
    // the delivery box by the door, flaps open, tins peeking out
    var bxx = w * 0.25, byy = h * 0.675;
    ctx.save(); ctx.translate(bxx, byy); ctx.scale(1.35, 1.35); ctx.translate(-bxx, -byy);
    ctx.fillStyle = 'rgba(40,30,20,0.3)'; ctx.beginPath(); qell(ctx, bxx, byy + 1 * s, 26 * s, 4 * s, 0); ctx.fill();
    ctx.fillStyle = '#d99e5a'; ctx.beginPath(); ctx.moveTo(bxx - 22 * s, byy); ctx.lineTo(bxx - 20 * s, byy - 24 * s); ctx.lineTo(bxx + 20 * s, byy - 24 * s); ctx.lineTo(bxx + 22 * s, byy); ctx.fill();
    ctx.fillStyle = '#8b2f3c'; ctx.fillRect(bxx - 14 * s, byy - 31 * s, 9 * s, 9 * s); ctx.fillRect(bxx - 3 * s, byy - 33 * s, 9 * s, 11 * s); ctx.fillStyle = '#f6e3b4'; ctx.fillRect(bxx - 14 * s, byy - 28 * s, 9 * s, 3 * s); ctx.fillRect(bxx - 3 * s, byy - 29 * s, 9 * s, 3 * s);
    ctx.fillStyle = '#fff'; ctx.fillRect(bxx + 8 * s, byy - 30 * s, 8 * s, 8 * s); ctx.fillStyle = '#ff9ab8'; ctx.fillRect(bxx + 8 * s, byy - 31 * s, 8 * s, 2.4 * s);
    ctx.fillStyle = '#e8b06a'; ctx.beginPath(); ctx.moveTo(bxx - 20 * s, byy - 24 * s); ctx.lineTo(bxx - 30 * s, byy - 34 * s); ctx.lineTo(bxx - 12 * s, byy - 34 * s); ctx.lineTo(bxx - 4 * s, byy - 24 * s); ctx.fill();
    ctx.beginPath(); ctx.moveTo(bxx + 20 * s, byy - 24 * s); ctx.lineTo(bxx + 30 * s, byy - 32 * s); ctx.lineTo(bxx + 14 * s, byy - 32 * s); ctx.lineTo(bxx + 6 * s, byy - 24 * s); ctx.fill();
    ctx.fillStyle = '#b97a3a'; ctx.fillRect(bxx - 22 * s, byy - 12 * s, 44 * s, 3 * s); ctx.fillStyle = '#fff8b8'; ctx.fillRect(bxx + 4 * s, byy - 20 * s, 12 * s, 7 * s);
    ctx.restore();
    // Sunny's robot helper: soft white, faceless, one yellow stripe, folding a towel
    var rbx = w * 0.585, rby = h * 0.675;
    ctx.save(); ctx.translate(rbx, rby); ctx.scale(1.4, 1.4); ctx.translate(-rbx, -rby);
    ctx.fillStyle = 'rgba(40,30,20,0.3)'; ctx.beginPath(); qell(ctx, rbx, rby + 1 * s, 22 * s, 4 * s, 0); ctx.fill();
    ctx.fillStyle = lg(ctx, rbx - 18 * s, 0, rbx + 18 * s, 0, [[0, '#d6dceb'], [0.4, '#ffffff'], [1, '#bfc7dc']]);
    ctx.beginPath(); rrect(ctx, rbx - 16 * s, rby - 34 * s, 32 * s, 30 * s, 11 * s); ctx.fill();
    ctx.fillStyle = '#ffc531'; ctx.fillRect(rbx - 16 * s, rby - 22 * s, 32 * s, 4 * s);
    ctx.fillStyle = '#9aa3c0'; ctx.fillRect(rbx - 2 * s, rby - 42 * s, 4 * s, 9 * s);
    ctx.fillStyle = lg(ctx, rbx - 12 * s, 0, rbx + 12 * s, 0, [[0, '#d6dceb'], [0.4, '#ffffff'], [1, '#bfc7dc']]); ctx.beginPath(); rrect(ctx, rbx - 12 * s, rby - 58 * s, 24 * s, 17 * s, 8 * s); ctx.fill();
    ctx.fillStyle = '#24305e'; ctx.beginPath(); rrect(ctx, rbx - 8 * s, rby - 53 * s, 16 * s, 6 * s, 3 * s); ctx.fill();
    ctx.strokeStyle = '#c9d0e2'; ctx.lineWidth = 4 * s; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(rbx - 14 * s, rby - 28 * s); ctx.quadraticCurveTo(rbx - 26 * s, rby - 26 * s, rbx - 24 * s, rby - 16 * s); ctx.moveTo(rbx + 14 * s, rby - 28 * s); ctx.quadraticCurveTo(rbx + 26 * s, rby - 26 * s, rbx + 24 * s, rby - 16 * s); ctx.stroke();
    ctx.fillStyle = '#ff9a86'; ctx.beginPath(); rrect(ctx, rbx - 26 * s, rby - 18 * s, 52 * s, 6 * s, 2 * s); ctx.fill(); ctx.fillStyle = '#ffb8a8'; ctx.fillRect(rbx - 26 * s, rby - 18 * s, 52 * s, 1.6 * s);
    ctx.fillStyle = '#5a6380'; ctx.beginPath(); qell(ctx, rbx - 9 * s, rby - 2 * s, 5 * s, 3 * s, 0); ctx.fill(); ctx.beginPath(); qell(ctx, rbx + 9 * s, rby - 2 * s, 5 * s, 3 * s, 0); ctx.fill();
    ctx.restore();
    // a hanging pothos from the ceiling at the left
    var px = w * 0.13, py = h * 0.06; ctx.strokeStyle = '#d8c7a6'; ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.moveTo(px, L.ceil); ctx.lineTo(px - 9 * s, py - 4 * s); ctx.moveTo(px, L.ceil); ctx.lineTo(px + 9 * s, py - 4 * s); ctx.stroke();
    ctx.fillStyle = '#e8946a'; ctx.beginPath(); ctx.moveTo(px - 10 * s, py - 5 * s); ctx.lineTo(px + 10 * s, py - 5 * s); ctx.quadraticCurveTo(px + 9 * s, py + 6 * s, px, py + 7 * s); ctx.quadraticCurveTo(px - 9 * s, py + 6 * s, px - 10 * s, py - 5 * s); ctx.fill();
    var lr = rng(9911); for (i = 0; i < 26; i++) { var t = lr(), vx = px + (lr() - 0.5) * 30 * s, vy = py + t * h * 0.11; ctx.fillStyle = lr() < 0.5 ? '#3f7a3a' : '#69a84e'; ctx.beginPath(); qell(ctx, vx, vy, 4.2 * s, 3 * s, lr() * PI); ctx.fill(); }
  }

  function paintTable(ctx, w, h, L, r) {
    var s = L.s, cx = w * 0.5, ty = h * 0.905, rx = w * 0.74, ry = h * 0.09, i;
    ctx.fillStyle = 'rgba(40,24,16,0.35)'; ctx.beginPath(); qell(ctx, cx, ty + ry * 0.7, rx * 1.02, ry * 1.1, 0); ctx.fill();
    ctx.fillStyle = '#6e4326'; ctx.beginPath(); ctx.moveTo(cx - rx, ty); ctx.lineTo(cx - rx, ty + 12 * s); ctx.bezierCurveTo(cx - rx, ty + ry + 12 * s, cx + rx, ty + ry + 12 * s, cx + rx, ty + 12 * s); ctx.lineTo(cx + rx, ty); ctx.fill();
    ctx.fillStyle = lg(ctx, 0, ty - ry, 0, ty + ry, [[0, '#c98e5a'], [1, '#a9713f']]); ctx.beginPath(); qell(ctx, cx, ty, rx, ry, 0); ctx.fill();
    ctx.save(); ctx.beginPath(); qell(ctx, cx, ty, rx, ry, 0); ctx.clip();
    batch(ctx, 60, [['#8a5530', 0.8 * s, 0.35], ['#e8b07a', 0.6 * s, 0.3]], function () { var yy = ty - ry + r() * ry * 2, xx = cx - rx + r() * rx * 2; return [xx, yy, xx + (20 + r() * 50) * s, yy + (r() - 0.5) * 2 * s, r() < 0.6 ? 0 : 1]; });
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = lg(ctx, cx - rx * 0.3, 0, cx + rx * 0.5, 0, [[0, 'rgba(255,210,150,0)'], [0.5, 'rgba(255,210,150,0.25)'], [1, 'rgba(255,210,150,0)']]); ctx.fillRect(cx - rx, ty - ry, rx * 2, ry * 2);
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,226,180,0.7)'; ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.ellipse(cx, ty, rx, ry, 0, PI * 1.05, PI * 1.95); ctx.stroke();
    // lace runner
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); qell(ctx, cx, ty - 2 * s, rx * 0.5, ry * 0.5, 0); ctx.fill();
    ctx.strokeStyle = 'rgba(205,195,175,0.95)'; ctx.lineWidth = 0.8 * s; for (i = 0; i < 22; i++) { var a = i / 22 * TAU; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * rx * 0.48, ty - 2 * s + Math.sin(a) * ry * 0.48, 2.6 * s, 0, TAU); ctx.stroke(); }
    // blue-and-white teapot, two cups of tea, the licorice tin and a sugar bowl (drawn larger: they are close to us)
    ctx.save(); ctx.translate(cx, ty); ctx.scale(1.6, 1.6); ctx.translate(-cx, -ty);
    var tpx = cx - 4 * s, tpy = ty - 4 * s;
    ctx.fillStyle = 'rgba(40,24,16,0.25)'; ctx.beginPath(); qell(ctx, tpx, tpy + 1 * s, 22 * s, 4 * s, 0); ctx.fill();
    ctx.fillStyle = lg(ctx, tpx - 20 * s, 0, tpx + 20 * s, 0, [[0, '#dfe8f5'], [0.4, '#ffffff'], [1, '#c7d3e8']]); ctx.beginPath(); ctx.moveTo(tpx - 18 * s, tpy); ctx.bezierCurveTo(tpx - 22 * s, tpy - 26 * s, tpx + 22 * s, tpy - 26 * s, tpx + 18 * s, tpy); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#3b6fb0'; ctx.lineWidth = 1.6 * s; ctx.beginPath(); ctx.moveTo(tpx - 15 * s, tpy - 9 * s); ctx.quadraticCurveTo(tpx, tpy - 3 * s, tpx + 15 * s, tpy - 9 * s); ctx.stroke();
    for (i = 0; i < 5; i++) { ctx.fillStyle = '#3b6fb0'; ctx.beginPath(); ctx.arc(tpx - 10 * s + i * 5 * s, tpy - 14 * s + (i % 2) * 2 * s, 1.3 * s, 0, TAU); ctx.fill(); }
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(tpx + 15 * s, tpy - 8 * s); ctx.quadraticCurveTo(tpx + 26 * s, tpy - 11 * s, tpx + 30 * s, tpy - 22 * s); ctx.lineTo(tpx + 26 * s, tpy - 22 * s); ctx.quadraticCurveTo(tpx + 23 * s, tpy - 13 * s, tpx + 14 * s, tpy - 4 * s); ctx.fill();
    ctx.strokeStyle = '#c7d3e8'; ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.arc(tpx - 20 * s, tpy - 10 * s, 7 * s, PI * 0.5, PI * 1.5); ctx.stroke();
    ctx.fillStyle = '#eef2fa'; ctx.beginPath(); qell(ctx, tpx, tpy - 20 * s, 10 * s, 2.6 * s, 0); ctx.fill(); ctx.fillStyle = '#3b6fb0'; ctx.beginPath(); ctx.arc(tpx, tpy - 23 * s, 3 * s, 0, TAU); ctx.fill();
    [[cx + 44 * s, ty + 6 * s], [cx - 48 * s, ty + 8 * s]].forEach(function (C) {
      ctx.fillStyle = 'rgba(40,24,16,0.2)'; ctx.beginPath(); qell(ctx, C[0], C[1] + 2 * s, 14 * s, 3.4 * s, 0); ctx.fill();
      ctx.fillStyle = '#eef2fa'; ctx.beginPath(); qell(ctx, C[0], C[1] + 1 * s, 13 * s, 3.2 * s, 0); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(C[0] - 9 * s, C[1] - 9 * s); ctx.lineTo(C[0] + 9 * s, C[1] - 9 * s); ctx.quadraticCurveTo(C[0] + 9 * s, C[1], C[0], C[1]); ctx.quadraticCurveTo(C[0] - 9 * s, C[1], C[0] - 9 * s, C[1] - 9 * s); ctx.fill();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.2 * s; ctx.beginPath(); ctx.arc(C[0] + 10 * s, C[1] - 5 * s, 3.6 * s, -PI * 0.5, PI * 0.5); ctx.stroke();
      ctx.fillStyle = '#9a5a26'; ctx.beginPath(); qell(ctx, C[0], C[1] - 9 * s, 9 * s, 2.2 * s, 0); ctx.fill();
      ctx.strokeStyle = '#3b6fb0'; ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.moveTo(C[0] - 7 * s, C[1] - 5 * s); ctx.lineTo(C[0] + 7 * s, C[1] - 5 * s); ctx.stroke();
    });
    var tnx = cx + 84 * s, tny = ty - 2 * s; ctx.fillStyle = 'rgba(40,24,16,0.25)'; ctx.beginPath(); qell(ctx, tnx, tny + 1 * s, 12 * s, 2.6 * s, 0); ctx.fill();
    ctx.fillStyle = '#8b2f3c'; ctx.beginPath(); rrect(ctx, tnx - 10 * s, tny - 28 * s, 20 * s, 28 * s, 2 * s); ctx.fill(); ctx.fillStyle = '#f6e3b4'; ctx.fillRect(tnx - 10 * s, tny - 19 * s, 20 * s, 9 * s); ctx.fillStyle = '#b23a4a'; ctx.beginPath(); qell(ctx, tnx, tny - 28 * s, 10 * s, 2.6 * s, 0); ctx.fill();
    ctx.fillStyle = '#6e3f17'; ctx.fillRect(tnx - 6 * s, tny - 16.6 * s, 12 * s, 1.4 * s); ctx.fillRect(tnx - 6 * s, tny - 13.6 * s, 8 * s, 1.4 * s);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2 * s; ctx.beginPath(); ctx.moveTo(tnx - 6 * s, tny - 25 * s); ctx.lineTo(tnx - 6 * s, tny - 3 * s); ctx.stroke();
    var sbx = cx - 88 * s, sby = ty; ctx.fillStyle = '#f2ede2'; ctx.beginPath(); ctx.moveTo(sbx - 10 * s, sby - 12 * s); ctx.lineTo(sbx + 10 * s, sby - 12 * s); ctx.quadraticCurveTo(sbx + 10 * s, sby, sbx, sby); ctx.quadraticCurveTo(sbx - 10 * s, sby, sbx - 10 * s, sby - 12 * s); ctx.fill();
    ctx.fillStyle = '#c0504d'; ctx.fillRect(sbx - 9 * s, sby - 9 * s, 18 * s, 2 * s); ctx.fillStyle = '#fbfaf6'; ctx.beginPath(); qell(ctx, sbx, sby - 12 * s, 10 * s, 2.6 * s, 0); ctx.fill();
    ctx.restore();
  }

  PAINT.eastie_kitchen = {
    focus: { x: 0.5, y: 0.22 },
    track: 'morning',
    anchors: ANCH,
    paint: function (ctx, w, h) {
      try {
        var L = KL(w, h), r = rng(52021);
        paintOutside(ctx, w, h, L, r);
        paintRoom(ctx, w, h, L, r);
        paintKitchen(ctx, w, h, L, r);
        paintFloor(ctx, w, h, L, r);
        paintFurniture(ctx, w, h, L, r);
        paintTable(ctx, w, h, L, r);
        // warm afternoon light pouring in from the window
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        var sx = (L.wx0 + L.wx1) / 2, sy = L.wy0;
        for (var i = 0; i < 5; i++) { var a = PI * (0.42 + i * 0.05), Lx = h * 0.8; ctx.fillStyle = lg(ctx, sx, sy, sx + Math.cos(a) * Lx, sy + Math.sin(a) * Lx, [[0, 'rgba(255,220,160,0)'], [0.35, 'rgba(255,220,160,0.05)'], [1, 'rgba(255,220,160,0)']]); ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + Math.cos(a - 0.05) * Lx, sy + Math.sin(a - 0.05) * Lx); ctx.lineTo(sx + Math.cos(a + 0.05) * Lx, sy + Math.sin(a + 0.05) * Lx); ctx.fill(); }
        ctx.restore();
        ctx.fillStyle = lg(ctx, 0, h * 0.72, 0, h, [[0, 'rgba(40,24,20,0)'], [1, 'rgba(40,24,20,0.28)']]); ctx.fillRect(0, h * 0.72, w, h * 0.28);
        finish(ctx, w, h, '#ffb070', 0.12, 0.28, 0.04, '#2a1416', 0.4);
      } catch (e) { PAINT._err = 'eastie_kitchen: ' + String(e && e.stack || e); }
    },
    overlay: function (ctx, w, h, t) {
      try {
        var L = KL(w, h), s = L.s, i;
        // inside the window: the ferry crossing, gulls, a plane gliding down toward the airport
        ctx.save(); ctx.beginPath(); ctx.rect(L.wx0, L.wy0, L.wx1 - L.wx0, L.wy1 - L.wy0); ctx.clip();
        var span = L.wx1 - L.wx0 + 80 * s, fx = L.wx0 - 40 * s + ((t * 6 * s) % span), fy = L.hz + (L.wy1 - L.hz) * 0.42;
        ferry(ctx, fx, fy, 34 * s, s);
        ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.moveTo(fx - 18 * s, fy + 1 * s); ctx.lineTo(fx - 44 * s, fy + 2 * s); ctx.stroke();
        var px = L.wx1 + 20 * s - ((t * 9 * s) % (span + 60 * s)), py = L.wy0 + (L.hz - L.wy0) * 0.25 + ((t * 9 * s) % (span + 60 * s)) * 0.08;
        ctx.fillStyle = '#f4f6fb'; ctx.beginPath(); qell(ctx, px, py, 8 * s, 1.4 * s, 0.08); ctx.fill(); ctx.beginPath(); ctx.moveTo(px - 2 * s, py); ctx.lineTo(px + 3 * s, py + 4 * s); ctx.lineTo(px + 5 * s, py + 4 * s); ctx.lineTo(px + 2 * s, py); ctx.fill(); ctx.beginPath(); ctx.moveTo(px + 6 * s, py); ctx.lineTo(px + 9 * s, py - 3 * s); ctx.lineTo(px + 8 * s, py); ctx.fill();
        ctx.strokeStyle = 'rgba(70,80,100,0.85)'; ctx.lineWidth = 1 * s; ctx.lineCap = 'round';
        for (i = 0; i < 3; i++) { var ang = t * 0.2 + i * 1.7; drawBird(ctx, (L.wx0 + L.wx1) / 2 + Math.cos(ang) * w * 0.16, L.wy0 + (L.hz - L.wy0) * (0.45 + i * 0.1) + Math.sin(ang * 1.4) * 6 * s, (3.4 - i * 0.5) * s, t * 6 + i); }
        // glints on the water
        ctx.fillStyle = '#ffffff';
        for (i = 0; i < 10; i++) { var gx = L.wx0 + hash(i, 31) * (L.wx1 - L.wx0), gy = L.hz + 4 * s + hash(i, 32) * (L.wy1 - L.hz - 6 * s), tw = Math.pow(Math.max(0, Math.sin(t * (1.6 + hash(i, 33) * 2) + i * 4)), 6); if (tw < 0.05) continue; ctx.globalAlpha = tw; ctx.fillRect(gx - 3 * s, gy, 6 * s, 0.7 * s); }
        ctx.globalAlpha = 1; ctx.restore();
        // steam from the kettle and the teacups, Sunny's hub glowing softly
        var sp = glowSpr('#ffffff');
        if (sp) {
          [[w * 0.37 + 22 * s, L.counterY - 12 * s], [w * 0.5 + 52 * s, h * 0.875 - 6 * s], [w * 0.5 - 58 * s, h * 0.875 - 4 * s]].forEach(function (P, j) {
            for (var k = 0; k < 4; k++) { var ph = (t * 0.35 + k / 4 + j * 0.3) % 1, sz = (4 + ph * 9) * s; ctx.globalAlpha = 0.35 * (1 - ph); ctx.drawImage(sp, P[0] + Math.sin(t * 1.3 + k * 2) * 3 * s - sz, P[1] - ph * 26 * s - sz, sz * 2, sz * 2); }
          });
        }
        var hg = glowSpr('#ffd36a'); if (hg) { ctx.globalAlpha = 0.35 + 0.2 * Math.sin(t * 1.6); var hx = w * 0.25, hy = L.counterY - 19 * s; ctx.drawImage(hg, hx - 22 * s, hy - 22 * s, 44 * s, 44 * s); }
        var rg2 = glowSpr('#7ff7e4'); if (rg2) { ctx.globalAlpha = Math.sin(t * 2.2) > 0.4 ? 0.8 : 0.2; ctx.drawImage(rg2, w * 0.585 - 4 * 1.4 * s, h * 0.675 - 56 * 1.4 * s, 8 * 1.4 * s, 8 * 1.4 * s); }
        ctx.globalAlpha = 1;
        // dust motes in the sunbeam
        var dm = glowSpr('#ffe8c0');
        if (dm) for (i = 0; i < 16; i++) { var a1 = hash(i, 51), b1 = hash(i, 52), c1 = hash(i, 53); var mx = w * (0.3 + a1 * 0.45) + Math.sin(t * (0.2 + c1 * 0.2) + i) * 12 * s, my = h * (0.38 + b1 * 0.3) + Math.sin(t * (0.25 + a1 * 0.3) + i * 2) * 10 * s; var sz2 = (1.6 + c1 * 2.6) * s; ctx.globalAlpha = 0.2 + 0.3 * (0.5 + 0.5 * Math.sin(t * (0.8 + c1) + i * 3)); ctx.drawImage(dm, mx - sz2, my - sz2, sz2 * 2, sz2 * 2); }
        ctx.globalAlpha = 1;
      } catch (e) { PAINT._err = 'eastie_kitchen overlay: ' + String(e && e.stack || e); }
    }
  };
  // Tappable props for the talk scenes in the kitchen (the look-around uses its own spots instead).
  if (typeof LATE !== 'undefined') LATE.push(function () {
    if (typeof PROPS === 'undefined') return;
    PROPS.eastie_kitchen = [{ id: 'mug', x: 13, y: 93, w: 46, sfx: 'clink', fx: 'jiggle', burst: 'steam' }, { id: 'plant', x: 90, y: 92, w: 50, sfx: 'rustle', fx: 'wiggle', burst: 'leaves' }];
  });
})();
