/* townhall.js - painted canvas background for Pathmakers 2040: a Boston city council chamber.
   Plain browser script, no modules, no external assets. Defines
     window.PAINT.townhall = { paint(ctx, w, h), overlay(ctx, w, h, t), focus }
   following the contract documented at the top of paint_boston.js.
   Warm and welcoming rather than grand: a curved wooden dais, two rows of seats with a few
   people suggested softly behind it, three tall arched windows with afternoon light slanting in,
   a high coffered ceiling, plants, and a city flag that is only colour and shape.
   Nothing here is a real seal, a real insignia or a real person, and the painting carries no text.
   The painting utilities below are copies of the private ones in paint_boston.js (that file's
   IIFE does not export them), so this scene is self-contained. */
(function () {
  'use strict';
  var PAINT = (window.PAINT = window.PAINT || {});
  var PI = Math.PI, TAU = PI * 2;

  /* ============================== utilities (copied) ============================== */
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
  function h2(ix, iy, s) { return hash(Math.imul(ix | 0, 0x1B873593) ^ Math.imul(iy | 0, 0x5BD1E995), s); }
  function vn2(x, y, s) {
    var ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
    var ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
    var a = h2(ix, iy, s), b = h2(ix + 1, iy, s), c = h2(ix, iy + 1, s), d = h2(ix + 1, iy + 1, s);
    return (a + (b - a) * ux) * (1 - uy) + (c + (d - c) * ux) * uy;
  }
  function fbm2(x, y, s, oct) {
    var v = 0, a = 0.5, fr = 1, n = 0, o;
    for (o = 0; o < (oct || 4); o++) { v += a * vn2(x * fr, y * fr, s + o * 71); n += a; a *= 0.5; fr *= 2.03; }
    return v / n;
  }
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
  function mark(l, ctx) { var P = PAINT._prof; if (P) { if (ctx) ctx.getImageData(0, 0, 1, 1); P.push([l, (typeof performance !== 'undefined' ? performance.now() : Date.now())]); } }
  function poly(ctx, pts) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); }
  function rrect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  }
  function glow(ctx, x, y, r, col, a) {
    ctx.fillStyle = rg(ctx, x, y, 0, r, [[0, rgba(col, a)], [0.35, rgba(col, a * 0.35)], [1, rgba(col, 0)]]);
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  function softGlow(ctx, x, y, r, col, a) {
    ctx.fillStyle = rg(ctx, x, y, 0, r, [[0, rgba(col, a)], [0.5, rgba(col, a * 0.5)], [1, rgba(col, 0)]]);
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  function haze(ctx, x0, y0, x1, y1, col, a) {
    var cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, rx = (x1 - x0) / 2, ry = Math.max(1, (y1 - y0) / 2);
    ctx.save(); ctx.translate(cx, cy); ctx.scale(1, ry / rx);
    ctx.fillStyle = rg(ctx, 0, 0, 0, rx, [[0, rgba(col, a)], [0.6, rgba(col, a * 0.75)], [1, rgba(col, 0)]]);
    ctx.fillRect(-rx, -rx, rx * 2, rx * 2); ctx.restore();
  }
  function band(ctx, x0, x1, y0, y1, col, a) {
    ctx.fillStyle = lg(ctx, 0, y0, 0, y1, [[0, rgba(col, 0)], [0.5, rgba(col, a)], [1, rgba(col, 0)]]);
    ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  }
  var grainCv = null;
  function finish(ctx, w, h, gradeCol, gradeA, vig, grainA, vigCol, vy) {
    try {
      ctx.save();
      if (gradeCol) { ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = gradeA; ctx.fillStyle = gradeCol; ctx.fillRect(0, 0, w, h); }
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      var R = Math.max(w, h) * 0.75, vc = vigCol || '#14101e';
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
  function shafts(ctx, x, y, w, h, col, al, n, r, spread, dir, wmin, wmax) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < n; i++) {
      var a = dir + (r() - 0.5) * spread, wd = (wmin || 0.02) + r() * ((wmax || 0.07) - (wmin || 0.02)), L = Math.max(w, h) * 1.2;
      ctx.fillStyle = lg(ctx, x, y, x + Math.cos(a) * L, y + Math.sin(a) * L, [[0, rgba(col, al * (0.5 + r()))], [0.6, rgba(col, al * 0.25)], [1, rgba(col, 0)]]);
      ctx.beginPath(); ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a - wd) * L, y + Math.sin(a - wd) * L);
      ctx.lineTo(x + Math.cos(a + wd) * L, y + Math.sin(a + wd) * L); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
  /* batched short strokes: gen(i) -> [x0,y0,x1,y1,bucket(,cx,cy)] ; cols = [[style,width,alpha],...] */
  function batch(ctx, n, cols, gen) {
    var paths = [], i, k;
    for (k = 0; k < cols.length; k++) paths.push([]);
    for (i = 0; i < n; i++) { var s = gen(i); if (s) paths[s[4]].push(s); }
    ctx.save(); ctx.lineCap = 'round';
    for (k = 0; k < cols.length; k++) {
      var p = paths[k]; if (!p.length) continue;
      ctx.beginPath();
      for (i = 0; i < p.length; i++) {
        ctx.moveTo(p[i][0], p[i][1]);
        if (p[i].length > 5) ctx.quadraticCurveTo(p[i][5], p[i][6], p[i][2], p[i][3]); else ctx.lineTo(p[i][2], p[i][3]);
      }
      ctx.strokeStyle = cols[k][0]; ctx.lineWidth = cols[k][1]; ctx.globalAlpha = cols[k][2]; ctx.stroke();
    }
    ctx.restore();
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
  /* batched discs: gen(i) -> [x,y,r,bucket] ; cols = [[style,alpha],...] */
  function dots(ctx, n, cols, gen) {
    var i, k, b = []; for (k = 0; k < cols.length; k++) b.push([]);
    for (i = 0; i < n; i++) { var d = gen(i); if (d) b[d[3]].push(d); }
    ctx.save();
    for (k = 0; k < cols.length; k++) {
      if (!b[k].length) continue;
      ctx.fillStyle = cols[k][0]; ctx.globalAlpha = cols[k][1]; ctx.beginPath();
      for (i = 0; i < b[k].length; i++) { var q = b[k][i]; qcirc(ctx, q[0], q[1], q[2]); }
      ctx.fill();
    }
    ctx.restore();
  }
  /* batched flattened ellipses: gen -> [x,y,rx,ry,bucket(,rot)] */
  function dabs(ctx, n, cols, gen) {
    var i, k, b = []; for (k = 0; k < cols.length; k++) b.push([]);
    for (i = 0; i < n; i++) { var d = gen(i); if (d) b[d[4]].push(d); }
    ctx.save();
    for (k = 0; k < cols.length; k++) {
      if (!b[k].length) continue;
      ctx.fillStyle = cols[k][0]; ctx.globalAlpha = cols[k][1]; ctx.beginPath();
      for (i = 0; i < b[k].length; i++) { var q = b[k][i]; qell(ctx, q[0], q[1], q[2], q[3], q[5] || 0); }
      ctx.fill();
    }
    ctx.restore();
  }
  /* leaf-shaped lens (two quadratic curves) appended to the current path */
  function lens(ctx, x, y, L, Wd, a) {
    var c = Math.cos(a), sn = Math.sin(a), tx = x + c * L, ty = y + sn * L, mx = x + c * L * 0.5, my = y + sn * L * 0.5, nx = -sn * Wd, ny = c * Wd;
    ctx.moveTo(x, y); ctx.quadraticCurveTo(mx + nx, my + ny, tx, ty); ctx.quadraticCurveTo(mx - nx, my - ny, x, y);
  }
  /* volumetric foliage clump of leaf dabs: pal [deep, shadow, mid, lit, rim] */
  function clump(ctx, cx, cy, R, pal, r, lx, ly, back, dens) {
    var cv = ctx.canvas;
    if (cv && (cx + R * 1.1 < 0 || cy + R * 1.1 < 0 || cx - R * 1.1 > cv.width || cy - R * 1.1 > cv.height)) { r(); return; }
    ctx.fillStyle = rg(ctx, cx + lx * R * 0.3, cy + ly * R * 0.3, 0, R * 0.95, [[0, pal[1]], [0.6, pal[0]], [1, pal[0]]]);
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.8, 0, TAU); ctx.fill();
    var n = Math.min(200, Math.round((30 + R * R * 0.32) * (dens || 1))), B = [[], [], [], [], []], i, k;
    for (i = 0; i < n; i++) {
      var a = r() * TAU, rr = R * Math.sqrt(r()) * 0.98, px = cx + Math.cos(a) * rr, py = cy + Math.sin(a) * rr * 0.92;
      var nx = (px - cx) / R, ny = (py - cy) / R;
      var v = (nx * lx + ny * ly) * 0.55 - ny * 0.18 + (1 - rr / R) * 0.06 + (r() - 0.5) * 0.4 + (back ? 0.4 : 0.52);
      var b = v < 0.24 ? 0 : v < 0.44 ? 1 : v < 0.64 ? 2 : v < 0.88 ? 3 : 4;
      if (b === 4 && rr < R * 0.72) b = 3;
      var L = R * (0.12 + r() * 0.11) * (b === 4 ? 0.7 : 1) * (n >= 200 ? 1.1 : 1);
      B[b].push([px, py, L, L * (0.28 + r() * 0.12), a + PI * 0.5 + (r() - 0.5) * 1.6]);
    }
    for (k = 0; k < 5; k++) {
      if (!B[k].length) continue;
      ctx.fillStyle = pal[k]; ctx.beginPath();
      for (i = 0; i < B[k].length; i++) { var q = B[k][i]; lens(ctx, q[0] - Math.cos(q[4]) * q[2] * 0.5, q[1] - Math.sin(q[4]) * q[2] * 0.5, q[2], q[3], q[4]); }
      ctx.fill();
    }
  }
  function leafPath(ctx, x, y, L, Wd, a, heart) {
    var c = Math.cos(a), sn = Math.sin(a), nx = -sn, ny = c;
    var tx = x + c * L, ty = y + sn * L;
    var b = heart ? 0.15 : 0.35;
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x + c * L * b + nx * Wd * 1.3, y + sn * L * b + ny * Wd * 1.3, x + c * L * 0.75 + nx * Wd * 0.8, y + sn * L * 0.75 + ny * Wd * 0.8, tx, ty);
    ctx.bezierCurveTo(x + c * L * 0.75 - nx * Wd * 0.8, y + sn * L * 0.75 - ny * Wd * 0.8, x + c * L * b - nx * Wd * 1.3, y + sn * L * b - ny * Wd * 1.3, x, y);
  }
  var SPR = {};
  function glowSpr(col, hard) {
    var key = col + (hard ? 'h' : '');
    if (SPR[key] !== undefined) return SPR[key];
    var c = mk(64, 64); if (c) { var g = c.getContext('2d'); g.fillStyle = rg(g, 32, 32, 0, 32, hard ? [[0, rgba('#ffffff', 1)], [0.12, rgba(col, 1)], [0.3, rgba(col, 0.35)], [1, rgba(col, 0)]] : [[0, rgba(col, 1)], [0.25, rgba(col, 0.55)], [1, rgba(col, 0)]]); g.fillRect(0, 0, 64, 64); }
    SPR[key] = c; return c;
  }

  /* ============================== palette ============================== */
  var PLASTER_LIT = '#f6ead6', PLASTER = '#ead9c0', PLASTER_SH = '#d3bda0';
  var OAK_LIT = '#e0b47e', OAK = '#c2884f', OAK_MID = '#a86f3d', OAK_DK = '#7c4e2a';
  var SEAT = '#2f7f82', SEAT_LIT = '#49a3a2', SEAT_DK = '#1e5a60';
  var SUN = '#fff1cf', SUNW = '#ffe2a6';
  var GREEN = ['#1e4430', '#2c683c', '#4a9a48', '#8acb5a', '#e0f6a8'];
  var SKIN = ['#8c93ad', '#9b8ba2', '#a68d7f', '#85998f', '#9a90b0', '#ab8e92'];

  /* ============================== layout ============================== */
  var thL = memo(function (w, h) {
    var s = S(w, h), L = {
      s: s, vpx: w * 0.5, vpy: h * 0.47,
      ceil: h * 0.098,          // underside of the ceiling plane at the back wall
      corn: h * 0.132,          // bottom of the cornice band
      spring: h * 0.218,        // springline of the window arches
      sill: h * 0.455,
      base: h * 0.558,          // where the back wall meets the floor (hidden behind the dais)
      winC: [0.185, 0.5, 0.815],
      daisY: h * 0.5, daisC: h * 0.042, daisH: h * 0.1, daisE: h * 0.024
    };
    L.winR = w * 0.098;
    L.winTop = L.spring - L.winR;
    L.flag = { x0: w * 0.611, x1: w * 0.706, y0: h * 0.168, y1: h * 0.318 };
    return L;
  });
  function capTop(L, w, x) { var u = (x / w - 0.5) * 2; return L.daisY + L.daisC * u * u; }
  function capBot(L, w, x) { var u = (x / w - 0.5) * 2; return L.daisY + L.daisC * u * u + L.daisH + L.daisE * u * u; }
  /* the curved front of the dais, as a closed path (top edge, then down and back along the bottom) */
  function daisPath(ctx, L, w, h, dy) {
    var x; ctx.beginPath(); ctx.moveTo(0, capTop(L, w, 0) + (dy || 0));
    for (x = 0; x <= w + 1; x += w / 24) ctx.lineTo(Math.min(x, w), capTop(L, w, Math.min(x, w)) + (dy || 0));
    for (x = w; x >= -1; x -= w / 24) ctx.lineTo(Math.max(x, 0), capBot(L, w, Math.max(x, 0)) + (dy || 0));
    ctx.closePath();
  }
  /* one tall arched window, appended to the current path */
  function winPath(ctx, cx, r, spring, bot) {
    ctx.moveTo(cx - r, bot); ctx.lineTo(cx - r, spring);
    ctx.arc(cx, spring, r, PI, 0); ctx.lineTo(cx + r, bot); ctx.closePath();
  }
  /* a person suggested softly: shoulders and a head, no face */
  function figure(ctx, x, yb, hw, col, rimCol, rimA) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(x - hw, yb);
    ctx.quadraticCurveTo(x - hw * 0.98, yb - hw * 1.1, x - hw * 0.38, yb - hw * 1.44);
    ctx.quadraticCurveTo(x, yb - hw * 1.58, x + hw * 0.38, yb - hw * 1.44);
    ctx.quadraticCurveTo(x + hw * 0.98, yb - hw * 1.1, x + hw, yb);
    ctx.closePath(); ctx.fill();
    ctx.beginPath(); qell(ctx, x, yb - hw * 2.0, hw * 0.5, hw * 0.58, 0); ctx.fill();
    // warm rim on the lit (right) side
    ctx.save(); ctx.globalAlpha = rimA; ctx.strokeStyle = rimCol; ctx.lineWidth = hw * 0.17; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(x, yb - hw * 2.0, hw * 0.52, -PI * 0.55, PI * 0.25);
    ctx.moveTo(x + hw * 0.5, yb - hw * 1.33); ctx.quadraticCurveTo(x + hw * 0.97, yb - hw * 1.0, x + hw * 0.99, yb - hw * 0.1);
    ctx.stroke(); ctx.restore();
  }
  /* a chair back: rounded upholstery panel in a slim wood frame */
  function chair(ctx, x, yb, hw, hh, pal) {
    ctx.fillStyle = pal[2]; ctx.beginPath(); rrect(ctx, x - hw, yb - hh, hw * 2, hh * 1.2, hw * 0.42); ctx.fill();
    ctx.fillStyle = pal[0]; ctx.beginPath(); rrect(ctx, x - hw * 0.82, yb - hh * 0.9, hw * 1.64, hh * 1.1, hw * 0.3); ctx.fill();
    ctx.fillStyle = pal[1]; ctx.beginPath(); rrect(ctx, x - hw * 0.72, yb - hh * 0.84, hw * 1.44, hh * 0.42, hw * 0.26); ctx.fill();
  }
  /* a leafy pot plant */
  function potPlant(ctx, x, yb, R, pal, seed, s, lx) {
    var r = rng(seed), i;
    // shadow on the floor
    ctx.fillStyle = 'rgba(96,70,48,0.2)'; ctx.beginPath(); qell(ctx, x + R * 0.1, yb + R * 0.05, R * 0.82, R * 0.2, 0); ctx.fill();
    // a few arching leaves behind the mass
    ctx.fillStyle = pal[1]; ctx.beginPath();
    for (i = 0; i < 9; i++) { var a = -PI * 0.5 + (r() - 0.5) * 2.5, Ln = R * (0.85 + r() * 0.6); leafPath(ctx, x + (r() - 0.5) * R * 0.3, yb - R * 0.75, Ln, Ln * 0.2, a, true); }
    ctx.fill();
    var cl = [[0, -1.2, 0.62], [-0.72, -0.86, 0.52], [0.74, -0.9, 0.5], [-0.42, -1.62, 0.44], [0.46, -1.6, 0.46], [0, -1.95, 0.38], [-0.86, -1.35, 0.34], [0.88, -1.38, 0.33]];
    for (i = 0; i < cl.length; i++) clump(ctx, x + cl[i][0] * R, yb + cl[i][1] * R, R * cl[i][2], pal, r, lx, -0.8, cl[i][1] < -1.5, 0.75);
    // planter
    var pw = R * 0.72, ph = R * 0.62;
    ctx.fillStyle = lg(ctx, x - pw, 0, x + pw, 0, [[0, '#cbbda8'], [0.4, '#f2ebdf'], [1, '#b9a892']]);
    ctx.beginPath(); ctx.moveTo(x - pw, yb - ph); ctx.lineTo(x + pw, yb - ph); ctx.lineTo(x + pw * 0.82, yb); ctx.quadraticCurveTo(x, yb + ph * 0.18, x - pw * 0.82, yb); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(120,98,76,0.3)'; ctx.fillRect(x - pw, yb - ph, pw * 2, 1.6 * s);
    ctx.fillStyle = SEAT; ctx.globalAlpha = 0.75; ctx.fillRect(x - pw * 0.97, yb - ph * 0.78, pw * 1.94, 2 * s); ctx.globalAlpha = 1;
    ctx.fillStyle = '#5a4634'; ctx.beginPath(); qell(ctx, x, yb - ph, pw * 0.96, ph * 0.17, 0); ctx.fill();
  }

  PAINT.townhall = {
    focus: { x: 0.5, y: 0.3 },
    track: 'win',
    // the dais top edge runs at y 0.50 (centre) to 0.54 (edges); the windows fill y 0.17-0.46
    anchors: { dais: { y: 0.5 }, windows: { y: 0.3 }, floor: { y: 0.62 } },
    paint: function (ctx, w, h) {
      try {
        var L = thL(w, h), r = rng(50101), s = L.s, i, x, y, k;
        var vpx = L.vpx, vpy = L.vpy, R = L.winR;
        mark('start', ctx);

        /* ---------- back wall: warm plaster, brighter toward the right-hand light ---------- */
        ctx.fillStyle = lg(ctx, 0, 0, w, 0, [[0, mix(PLASTER, PLASTER_SH, 0.45)], [0.45, PLASTER], [0.82, PLASTER_LIT], [1, mix(PLASTER_LIT, '#ffffff', 0.25)]]);
        ctx.fillRect(0, 0, w, L.base + 2);
        // gentle vertical fall-off and a soft mottle so the plaster is not flat
        ctx.fillStyle = lg(ctx, 0, L.corn, 0, L.base, [[0, 'rgba(255,240,214,0.35)'], [0.55, 'rgba(255,240,214,0)'], [1, 'rgba(146,112,80,0.22)']]);
        ctx.fillRect(0, L.corn, w, L.base - L.corn);
        dabs(ctx, 180, [[PLASTER_LIT, 0.16], [PLASTER_SH, 0.1]], function () {
          var xx = r() * w, yy = L.corn + r() * (L.base - L.corn);
          return [xx, yy, (14 + r() * 40) * s, (6 + r() * 16) * s, fbm2(xx / w * 5, yy / h * 7, 510, 2) > 0.5 ? 0 : 1, (r() - 0.5) * 0.5];
        });
        mark('wall', ctx);

        /* ---------- the view through the glass, then the arches ---------- */
        ctx.save();
        ctx.beginPath();
        for (i = 0; i < 3; i++) winPath(ctx, w * L.winC[i], R, L.spring, L.sill);
        ctx.clip();
        // warm afternoon sky
        ctx.fillStyle = lg(ctx, 0, L.winTop, 0, L.sill, [[0, '#a9cbe8'], [0.4, '#cfe0ec'], [0.72, '#f3e2c6'], [1, '#f8e8ca']]);
        ctx.fillRect(0, L.winTop - 4 * s, w, L.sill - L.winTop + 8 * s);
        // the afternoon sun, off to the right and above
        softGlow(ctx, w * 0.95, L.winTop + h * 0.03, w * 0.5, '#fff6df', 0.75);
        softGlow(ctx, w * 0.92, L.winTop + h * 0.05, w * 0.26, '#ffffff', 0.55);
        for (i = 0; i < 4; i++) haze(ctx, w * (0.02 + r() * 0.7), h * (0.2 + r() * 0.1), w * (0.4 + r() * 0.5), h * (0.23 + r() * 0.1), '#ffffff', 0.3);
        // a hazy far city: slim towers, then low brick rooftops, then a tree line
        var far = rng(50111), hz = h * 0.375;
        for (x = -w * 0.02; x < w * 1.02;) {
          var bw = (7 + far() * 13) * s, bh = h * (0.012 + far() * 0.05);
          ctx.fillStyle = mix(far() < 0.45 ? '#b6c6d8' : '#c6c2cc', '#eadfcd', 0.35 + far() * 0.3);
          ctx.fillRect(x, hz - bh, bw, bh);
          if (far() < 0.4) { ctx.fillStyle = 'rgba(255,245,220,0.5)'; ctx.fillRect(x + bw * 0.62, hz - bh, bw * 0.38, bh); }
          x += bw * (0.75 + far() * 0.6);
        }
        ctx.fillStyle = 'rgba(246,230,204,0.45)'; ctx.fillRect(0, hz - h * 0.06, w, h * 0.06);
        for (x = -w * 0.02; x < w * 1.02;) {
          var rw = (10 + far() * 16) * s, rh = h * (0.012 + far() * 0.016);
          ctx.fillStyle = mix('#d6a894', '#f0dfc6', 0.3 + far() * 0.35);
          ctx.fillRect(x, hz + h * 0.012 - rh, rw, rh + h * 0.02);
          ctx.fillStyle = 'rgba(120,96,96,0.12)'; ctx.fillRect(x, hz + h * 0.012 - rh, rw, 1.4 * s);
          x += rw * (0.95 + far() * 0.25);
        }
        var tpal = ['#7d9a7a', '#8fae84', '#a7c494', '#c2d9a4', '#e0eec0'];
        for (x = -w * 0.02; x < w * 1.04; x += (9 + far() * 8) * s) clump(ctx, x, hz + h * 0.045 - far() * h * 0.012, (6 + far() * 5) * s, tpal, far, 0.7, -0.7, false, 0.5);
        ctx.fillStyle = lg(ctx, 0, hz, 0, L.sill, [[0, 'rgba(250,238,216,0.25)'], [1, 'rgba(250,236,210,0.75)']]);
        ctx.fillRect(0, hz, w, L.sill - hz);
        // glass: cool tint at the top, warm sheen low, two diagonal reflections per window
        ctx.fillStyle = lg(ctx, 0, L.winTop, 0, L.sill, [[0, 'rgba(188,214,232,0.3)'], [0.5, 'rgba(230,236,238,0.1)'], [1, 'rgba(255,240,208,0.18)']]);
        ctx.fillRect(0, L.winTop - 4 * s, w, L.sill - L.winTop + 8 * s);
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (i = 0; i < 3; i++) for (k = 0; k < 2; k++) {
          var sx = w * L.winC[i] - R * (0.55 - k * 0.95);
          ctx.fillStyle = 'rgba(255,250,232,' + (0.09 - k * 0.035).toFixed(3) + ')';
          ctx.beginPath(); ctx.moveTo(sx, L.winTop); ctx.lineTo(sx + R * 0.5, L.winTop); ctx.lineTo(sx - R * 0.45, L.sill); ctx.lineTo(sx - R * 0.95, L.sill); ctx.fill();
        }
        ctx.restore();
        ctx.restore();
        mark('view', ctx);

        // glazing bars, arch mouldings and sills
        for (i = 0; i < 3; i++) {
          var cx = w * L.winC[i];
          ctx.save();
          ctx.beginPath(); winPath(ctx, cx, R, L.spring, L.sill); ctx.clip();
          ctx.fillStyle = 'rgba(252,246,236,0.95)';
          ctx.fillRect(cx - 1.4 * s, L.winTop, 2.8 * s, L.sill - L.winTop);
          [0.3, 0.52, 0.74].forEach(function (f) { ctx.fillRect(cx - R, lerp(L.spring, L.sill, f) - 1.2 * s, R * 2, 2.4 * s); });
          ctx.strokeStyle = 'rgba(252,246,236,0.95)'; ctx.lineWidth = 2.4 * s; ctx.beginPath();
          for (k = 1; k < 4; k++) { var aa = PI + k * PI / 4; ctx.moveTo(cx, L.spring); ctx.lineTo(cx + Math.cos(aa) * R, L.spring + Math.sin(aa) * R); }
          ctx.moveTo(cx - R * 0.62, L.spring - R * 0.62); ctx.arc(cx, L.spring, R * 0.56, PI, 0);
          ctx.stroke();
          ctx.restore();
          // reveal shadow inside the opening, then the moulding
          ctx.save(); ctx.beginPath(); winPath(ctx, cx, R, L.spring, L.sill); ctx.clip();
          ctx.strokeStyle = 'rgba(120,92,62,0.3)'; ctx.lineWidth = 5 * s;
          ctx.beginPath(); winPath(ctx, cx, R, L.spring, L.sill); ctx.stroke();
          ctx.restore();
          ctx.strokeStyle = '#fbf3e6'; ctx.lineWidth = 7 * s;
          ctx.beginPath(); winPath(ctx, cx, R, L.spring, L.sill); ctx.stroke();
          ctx.strokeStyle = 'rgba(176,142,104,0.4)'; ctx.lineWidth = 1.4 * s;
          ctx.beginPath(); ctx.arc(cx, L.spring, R + 5 * s, PI, 0); ctx.stroke();
          // keystone and sill
          ctx.fillStyle = '#f7eddc'; ctx.beginPath(); rrect(ctx, cx - 4.5 * s, L.winTop - 8 * s, 9 * s, 10 * s, 1.6 * s); ctx.fill();
          ctx.fillStyle = lg(ctx, 0, L.sill, 0, L.sill + 7 * s, [[0, '#fbf3e6'], [1, '#d9c5a8']]);
          ctx.fillRect(cx - R - 7 * s, L.sill - 1 * s, R * 2 + 14 * s, 6 * s);
          ctx.fillStyle = 'rgba(126,98,68,0.22)'; ctx.fillRect(cx - R - 5 * s, L.sill + 5 * s, R * 2 + 10 * s, 3 * s);
        }
        mark('windows', ctx);

        /* ---------- high ceiling: coffer ribs running back to the cornice ---------- */
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, L.ceil); ctx.clip();
        ctx.fillStyle = lg(ctx, 0, 0, 0, L.ceil, [[0, '#e2cfb2'], [0.6, '#f0dfc4'], [1, '#f8ecd8']]); ctx.fillRect(0, 0, w, L.ceil);
        ctx.fillStyle = lg(ctx, 0, 0, w, 0, [[0, 'rgba(142,108,74,0.22)'], [0.7, 'rgba(255,238,206,0)'], [1, 'rgba(255,244,214,0.35)']]); ctx.fillRect(0, 0, w, L.ceil);
        function ribX(xc, yy) { return vpx + (xc - vpx) * (yy - vpy) / (L.ceil - vpy); }
        ctx.strokeStyle = 'rgba(150,112,74,0.5)'; ctx.lineWidth = 3.4 * s; ctx.beginPath();
        for (i = -5; i <= 5; i++) { var xc = vpx + i * w * 0.118; ctx.moveTo(xc, L.ceil); ctx.lineTo(ribX(xc, -h * 0.02), -h * 0.02); }
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,245,222,0.6)'; ctx.lineWidth = 1.2 * s; ctx.beginPath();
        for (i = -5; i <= 5; i++) { var xc2 = vpx + i * w * 0.118 + 2 * s; ctx.moveTo(xc2, L.ceil); ctx.lineTo(ribX(xc2, -h * 0.02), -h * 0.02); }
        ctx.stroke();
        var cy2 = L.ceil, cd = h * 0.028;
        ctx.strokeStyle = 'rgba(150,112,74,0.42)';
        while (cy2 > -h * 0.01) {
          ctx.lineWidth = Math.max(1, 2.6 * s * (1 + (L.ceil - cy2) / L.ceil));
          ctx.beginPath(); ctx.moveTo(0, cy2); ctx.lineTo(w, cy2); ctx.stroke();
          cy2 -= cd; cd *= 1.5;
        }
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        softGlow(ctx, w * 0.86, L.ceil, w * 0.5, SUN, 0.26);
        ctx.restore();
        ctx.restore();
        // cornice band under the ceiling
        ctx.fillStyle = lg(ctx, 0, L.ceil, 0, L.corn, [[0, '#f8eeda'], [0.45, '#fbf4e6'], [0.75, '#e4d2b4'], [1, '#cdb492']]);
        ctx.fillRect(0, L.ceil, w, L.corn - L.ceil);
        ctx.fillStyle = 'rgba(132,100,68,0.3)'; ctx.fillRect(0, L.ceil, w, 1.6 * s);
        ctx.fillStyle = 'rgba(255,248,230,0.75)'; ctx.fillRect(0, L.ceil + (L.corn - L.ceil) * 0.42, w, 1.6 * s);
        // dentil rhythm, light and small
        ctx.fillStyle = 'rgba(146,112,78,0.26)';
        for (x = w * 0.012; x < w; x += w * 0.034) ctx.fillRect(x, L.corn - (L.corn - L.ceil) * 0.3, w * 0.016, (L.corn - L.ceil) * 0.26);
        ctx.fillStyle = 'rgba(126,96,66,0.22)'; ctx.fillRect(0, L.corn, w, 2.4 * s);
        mark('ceiling', ctx);

        /* ---------- piers between the windows: slim wood panels ---------- */
        [[0.283, 0.402], [0.598, 0.717], [0, 0.087], [0.913, 1]].forEach(function (P2, pi) {
          var x0 = w * P2[0] + (pi > 1 ? 0 : 4 * s), x1 = w * P2[1] - (pi > 1 ? 0 : 4 * s), mx = (x0 + x1) / 2;
          var py0 = L.winTop + h * 0.015, py1 = L.sill + h * 0.02, pw2 = Math.min((x1 - x0) * 0.34, w * 0.03);
          ctx.fillStyle = lg(ctx, x0, 0, x1, 0, [[0, 'rgba(158,122,84,0.16)'], [0.5, 'rgba(255,246,226,0.3)'], [1, 'rgba(158,122,84,0.1)']]);
          ctx.fillRect(x0, L.corn, x1 - x0, L.base - L.corn);
          ctx.strokeStyle = 'rgba(150,114,78,0.32)'; ctx.lineWidth = 1.4 * s;
          ctx.beginPath(); rrect(ctx, mx - pw2, py0, pw2 * 2, py1 - py0, pw2 * 0.45); ctx.stroke();
          ctx.strokeStyle = 'rgba(255,248,230,0.55)'; ctx.lineWidth = 1 * s;
          ctx.beginPath(); rrect(ctx, mx - pw2 + 1.4 * s, py0 + 1.4 * s, pw2 * 2, py1 - py0, pw2 * 0.45); ctx.stroke();
        });

        /* ---------- the city flag: colour and shape only ---------- */
        var F = L.flag, fw = F.x1 - F.x0, fh = F.y1 - F.y0;
        ctx.fillStyle = 'rgba(110,84,58,0.2)';
        ctx.beginPath(); rrect(ctx, F.x0 + 3.5 * s, F.y0 + 3.5 * s, fw, fh, 2 * s); ctx.fill();
        ctx.fillStyle = lg(ctx, 0, F.y0, 0, F.y1, [[0, '#3a5fa0'], [0.48, '#2f4f8e'], [0.5, '#f0cf86'], [0.62, '#e8c070'], [0.64, '#2f8f8a'], [1, '#246f72']]);
        ctx.beginPath();
        ctx.moveTo(F.x0, F.y0); ctx.lineTo(F.x1, F.y0); ctx.lineTo(F.x1, F.y1);
        ctx.quadraticCurveTo((F.x0 + F.x1) / 2, F.y1 - fh * 0.1, F.x0, F.y1); ctx.closePath(); ctx.fill();
        // a simple light shape on the field: a soft circle, no emblem
        ctx.fillStyle = 'rgba(245,238,220,0.3)'; ctx.beginPath(); qcirc(ctx, (F.x0 + F.x1) / 2, F.y0 + fh * 0.26, fw * 0.24); ctx.fill();
        // static folds + the lit edge toward the windows
        ctx.save(); ctx.beginPath();
        ctx.moveTo(F.x0, F.y0); ctx.lineTo(F.x1, F.y0); ctx.lineTo(F.x1, F.y1);
        ctx.quadraticCurveTo((F.x0 + F.x1) / 2, F.y1 - fh * 0.1, F.x0, F.y1); ctx.closePath(); ctx.clip();
        ctx.fillStyle = lg(ctx, F.x0, 0, F.x1, 0, [[0, 'rgba(14,20,40,0.3)'], [0.35, 'rgba(255,255,255,0.1)'], [0.72, 'rgba(255,245,220,0.22)'], [1, 'rgba(14,20,40,0.2)']]);
        ctx.fillRect(F.x0, F.y0, fw, fh);
        ctx.restore();
        // hanging rod
        ctx.fillStyle = lg(ctx, 0, F.y0 - 4 * s, 0, F.y0 + 1 * s, [[0, '#e8c48a'], [1, '#a87c46']]);
        ctx.beginPath(); rrect(ctx, F.x0 - 6 * s, F.y0 - 4 * s, fw + 12 * s, 4.6 * s, 2.2 * s); ctx.fill();
        ctx.fillStyle = '#d9b078';
        [F.x0 - 6 * s, F.x1 + 6 * s].forEach(function (fx) { ctx.beginPath(); qcirc(ctx, fx, F.y0 - 1.7 * s, 3 * s); ctx.fill(); });
        mark('flag', ctx);

        /* ---------- two rows of seats, a few people suggested softly ---------- */
        var backRow = [0.21, 0.33, 0.67, 0.79], frontRow = [0.105, 0.245, 0.385, 0.5, 0.615, 0.755, 0.895];
        var bpal = [mix(SEAT, PLASTER, 0.3), mix(SEAT_LIT, PLASTER, 0.35), mix(OAK_MID, PLASTER, 0.4)];
        for (i = 0; i < backRow.length; i++) {
          var bx = w * backRow[i], byb = capTop(L, w, bx) - h * 0.03;
          chair(ctx, bx, byb, w * 0.03, h * 0.046, bpal);
        }
        [0.33, 0.79].forEach(function (fx, fi) {
          var px2 = w * fx, pyb = capTop(L, w, px2) - h * 0.038;
          ctx.globalAlpha = 0.62;
          figure(ctx, px2, pyb, w * 0.026, mix(SKIN[fi * 2 + 1], PLASTER, 0.3), SUNW, 0.5);
          ctx.globalAlpha = 1;
        });
        var fpal = [SEAT, SEAT_LIT, OAK_MID];
        for (i = 0; i < frontRow.length; i++) {
          var fx2 = w * frontRow[i], fyb = capTop(L, w, fx2) + h * 0.004;
          chair(ctx, fx2, fyb, w * 0.036, h * 0.055, fpal);
        }
        [0.105, 0.245, 0.5, 0.615, 0.895].forEach(function (fx, fi) {
          var px3 = w * fx, pyb2 = capTop(L, w, px3) - h * 0.002;
          ctx.globalAlpha = 0.86;
          figure(ctx, px3, pyb2, w * 0.031, SKIN[fi], SUNW, 0.55);
          ctx.globalAlpha = 1;
        });
        // the whole seating band sits a touch back in the air
        ctx.fillStyle = 'rgba(243,228,204,0.16)'; ctx.fillRect(0, L.sill - h * 0.03, w, L.base - L.sill + h * 0.03);
        mark('seats', ctx);

        /* ---------- floor: warm stone, joints running back to the vanishing point ---------- */
        ctx.save(); ctx.beginPath(); ctx.rect(0, L.base - h * 0.004, w, h - L.base + h * 0.004); ctx.clip();
        ctx.fillStyle = lg(ctx, 0, L.base, 0, h, [[0, '#d8c4a6'], [0.3, '#e6d5b8'], [0.75, '#dcc8a8'], [1, '#c8b091']]);
        ctx.fillRect(0, L.base - h * 0.01, w, h - L.base + h * 0.01);
        ctx.fillStyle = lg(ctx, 0, 0, w, 0, [[0, 'rgba(130,98,70,0.2)'], [0.75, 'rgba(255,244,216,0.18)'], [1, 'rgba(255,240,206,0.3)']]);
        ctx.fillRect(0, L.base - h * 0.01, w, h - L.base + h * 0.01);
        // soft warm pools where the window light reaches the floor
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (i = 0; i < 3; i++) {
          var wx = w * L.winC[i];
          ctx.fillStyle = lg(ctx, 0, L.base, 0, h, [[0, 'rgba(255,240,206,0.2)'], [1, 'rgba(255,234,194,0.02)']]);
          ctx.beginPath();
          ctx.moveTo(wx - R, L.base); ctx.lineTo(wx + R, L.base);
          ctx.lineTo(wx + R - w * 0.3 + (wx - vpx) * 0.5, h); ctx.lineTo(wx - R - w * 0.42 + (wx - vpx) * 0.5, h); ctx.fill();
        }
        ctx.restore();
        ctx.strokeStyle = 'rgba(150,120,90,0.22)'; ctx.lineWidth = 1 * s; ctx.beginPath();
        for (i = -14; i <= 14; i++) { var bx2 = vpx + i * w * 0.14; ctx.moveTo(lerp(vpx, bx2, (L.base - vpy) / (h - vpy)), L.base); ctx.lineTo(bx2, h); }
        var ty = L.base + h * 0.006, td = h * 0.012;
        while (ty < h) { ctx.moveTo(0, ty); ctx.lineTo(w, ty); ty += td; td *= 1.3; }
        ctx.stroke();
        batch(ctx, 150, [['#bba58a', 0.9 * s, 0.22], ['#fff4e0', 0.7 * s, 0.26]], function () {
          var yy = lerp(L.base + h * 0.02, h, Math.pow(r(), 0.75)), xx = r() * w, l = (18 + r() * 60) * s * (yy - L.base) / (h - L.base);
          return [xx, yy, xx + l, yy + (r() - 0.5) * l * 0.18, r() < 0.5 ? 0 : 1, xx + l * 0.5, yy + (r() - 0.5) * l * 0.3];
        });
        // a quiet oval inlay where the speaker stands
        [[0.4, '#c2ab8c', 0], [0.36, '#ebdcc0', 0], [0.26, SEAT, 1], [0.12, '#dfd0b4', 0]].forEach(function (M2) {
          ctx.globalAlpha = 0.55;
          if (M2[2]) { ctx.strokeStyle = M2[1]; ctx.lineWidth = 1.8 * s; ctx.beginPath(); qell(ctx, vpx, h * 0.84, w * M2[0], w * M2[0] * 0.17, 0); ctx.stroke(); }
          else { ctx.fillStyle = M2[1]; ctx.beginPath(); qell(ctx, vpx, h * 0.84, w * M2[0], w * M2[0] * 0.17, 0); ctx.fill(); }
        });
        ctx.globalAlpha = 1;
        ctx.restore();
        mark('floor', ctx);

        /* ---------- the curved wooden dais ---------- */
        // shadow it casts forward on the floor
        ctx.save(); daisPath(ctx, L, w, h, h * 0.016); ctx.clip();
        ctx.fillStyle = 'rgba(112,82,56,0.22)'; ctx.fillRect(0, 0, w, h); ctx.restore();
        // front face
        ctx.save(); daisPath(ctx, L, w, h); ctx.clip();
        ctx.fillStyle = lg(ctx, 0, L.daisY, 0, L.daisY + L.daisH + L.daisE, [[0, OAK_LIT], [0.22, OAK], [0.7, OAK_MID], [1, OAK_DK]]);
        ctx.fillRect(0, L.daisY - h * 0.02, w, L.daisH + L.daisE + h * 0.08);
        ctx.fillStyle = lg(ctx, 0, 0, w, 0, [[0, 'rgba(72,44,24,0.35)'], [0.4, 'rgba(72,44,24,0.06)'], [0.78, 'rgba(255,236,196,0.22)'], [1, 'rgba(255,228,180,0.12)']]);
        ctx.fillRect(0, L.daisY - h * 0.02, w, L.daisH + L.daisE + h * 0.08);
        // grain
        batch(ctx, 320, [[OAK_LIT, 0.8 * s, 0.2], [OAK_DK, 0.9 * s, 0.18]], function () {
          var xx = r() * w, yy = capTop(L, w, xx) + r() * (L.daisH + L.daisE), l = (20 + r() * 70) * s;
          return [xx, yy, xx + l, yy + (r() - 0.5) * 2 * s, r() < 0.5 ? 0 : 1, xx + l * 0.5, yy + (r() - 0.5) * 5 * s];
        });
        // panel rhythm along the curve
        for (i = 0; i < 9; i++) {
          var pxc = w * (0.055 + i * 0.111), ut = (pxc / w - 0.5) * 2, pt = capTop(L, w, pxc) + L.daisH * 0.3, pb = capBot(L, w, pxc) - L.daisH * 0.12;
          var phw = w * 0.04 * (1 + 0.1 * Math.abs(ut));
          ctx.strokeStyle = 'rgba(72,44,24,0.3)'; ctx.lineWidth = 1.6 * s;
          ctx.beginPath(); rrect(ctx, pxc - phw, pt, phw * 2, pb - pt, phw * 0.3); ctx.stroke();
          ctx.strokeStyle = 'rgba(255,230,186,0.26)'; ctx.lineWidth = 1.2 * s;
          ctx.beginPath(); rrect(ctx, pxc - phw + 1.6 * s, pt + 1.6 * s, phw * 2, pb - pt, phw * 0.3); ctx.stroke();
        }
        ctx.restore();
        // the counter cap and a slim teal line beneath it
        ctx.beginPath(); ctx.moveTo(0, capTop(L, w, 0));
        for (x = 0; x <= w + 1; x += w / 24) ctx.lineTo(Math.min(x, w), capTop(L, w, Math.min(x, w)));
        for (x = w; x >= -1; x -= w / 24) { var xx2 = Math.max(x, 0), u2 = (xx2 / w - 0.5) * 2; ctx.lineTo(xx2, capTop(L, w, xx2) - h * (0.009 + 0.005 * u2 * u2)); }
        ctx.closePath();
        ctx.fillStyle = lg(ctx, 0, L.daisY - h * 0.014, 0, L.daisY + h * 0.004, [[0, '#f3d1a0'], [0.55, '#e2b47e'], [1, '#a9743f']]);
        ctx.fill();
        ctx.save(); ctx.beginPath(); ctx.moveTo(0, capTop(L, w, 0));
        for (x = 0; x <= w + 1; x += w / 24) ctx.lineTo(Math.min(x, w), capTop(L, w, Math.min(x, w)) + h * 0.006);
        for (x = w; x >= -1; x -= w / 24) ctx.lineTo(Math.max(x, 0), capTop(L, w, Math.max(x, 0)) + h * 0.009);
        ctx.closePath(); ctx.fillStyle = rgba(SEAT, 0.5); ctx.fill(); ctx.restore();
        // plinth
        ctx.beginPath(); ctx.moveTo(0, capBot(L, w, 0));
        for (x = 0; x <= w + 1; x += w / 24) ctx.lineTo(Math.min(x, w), capBot(L, w, Math.min(x, w)));
        for (x = w; x >= -1; x -= w / 24) ctx.lineTo(Math.max(x, 0), capBot(L, w, Math.max(x, 0)) + h * 0.018);
        ctx.closePath();
        ctx.fillStyle = lg(ctx, 0, L.daisY + L.daisH, 0, L.daisY + L.daisH + h * 0.02, [[0, '#8e5c33'], [1, '#6a4323']]); ctx.fill();
        mark('dais', ctx);

        /* ---------- plants ---------- */
        potPlant(ctx, w * 0.085, h * 0.845, w * 0.115, GREEN, 50301, s, 0.7);
        potPlant(ctx, w * 0.93, h * 0.8, w * 0.1, GREEN, 50302, s, -0.5);
        // a small trailing plant on the dais, left of centre
        potPlant(ctx, w * 0.2, capTop(L, w, w * 0.2) - h * 0.002, w * 0.028, GREEN, 50303, s, 0.6);
        mark('plants', ctx);

        /* ---------- light ---------- */
        // two warm pendants, small and welcoming
        [[0.235, 0.148, 1], [0.765, 0.148, 1]].forEach(function (Q) {
          var gx = w * Q[0], gy = h * Q[1], gr = 6.5 * s * Q[2];
          ctx.strokeStyle = 'rgba(96,78,58,0.5)'; ctx.lineWidth = 0.9 * s;
          ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, gy - gr); ctx.stroke();
          ctx.fillStyle = '#c8a070'; ctx.fillRect(gx - gr * 0.3, gy - gr * 1.2, gr * 0.6, gr * 0.35);
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, gx, gy, gr * 5.5, '#ffdca8', 0.3); ctx.restore();
          ctx.fillStyle = rg(ctx, gx - gr * 0.3, gy - gr * 0.3, 0, gr, [[0, '#fffaf0'], [0.6, '#ffe8c0'], [1, '#f2c890']]);
          ctx.beginPath(); qcirc(ctx, gx, gy, gr); ctx.fill();
        });
        shafts(ctx, w * 1.02, h * 0.04, w, h, SUN, 0.07, 7, r, 0.42, PI * 0.72, 0.02, 0.055);
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        band(ctx, 0, w, L.daisY - h * 0.01, L.daisY + h * 0.05, SUNW, 0.1);
        ctx.restore();
        // keep the lower third calm for the game's panels
        ctx.fillStyle = lg(ctx, 0, h * 0.74, 0, h, [[0, 'rgba(92,62,38,0)'], [1, 'rgba(92,62,38,0.2)']]);
        ctx.fillRect(0, h * 0.74, w, h * 0.26);
        finish(ctx, w, h, '#ffe9c4', 0.12, 0.2, 0.035, '#43291a', 0.4);
        mark('finish', ctx);
      } catch (e) { PAINT._err = 'townhall: ' + String(e && e.stack || e); }
    },
    overlay: function (ctx, w, h, t) {
      try {
        var L = thL(w, h), s = L.s, i, F = L.flag, fw = F.x1 - F.x0, fh = F.y1 - F.y0;
        var sp = glowSpr('#fff2d2'), spH = glowSpr('#fff8e4', true);

        /* the shafts breathe */
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (i = 0; i < 3; i++) {
          var a = PI * (0.68 + i * 0.045), br = 0.03 + 0.022 * Math.sin(t * 0.24 + i * 2.1), Lx = h * 1.3, wd = 0.028, ox = w * 1.02, oy = h * 0.04;
          ctx.fillStyle = lg(ctx, ox, oy, ox + Math.cos(a) * Lx, oy + Math.sin(a) * Lx, [[0, 'rgba(255,242,210,0)'], [0.3, 'rgba(255,242,210,' + br.toFixed(3) + ')'], [1, 'rgba(255,242,210,0)']]);
          ctx.beginPath(); ctx.moveTo(ox, oy);
          ctx.lineTo(ox + Math.cos(a - wd) * Lx, oy + Math.sin(a - wd) * Lx);
          ctx.lineTo(ox + Math.cos(a + wd) * Lx, oy + Math.sin(a + wd) * Lx); ctx.fill();
        }
        /* light drifting slowly across the wood of the dais */
        var dx = w * (0.5 + 0.42 * Math.sin(t * 0.055));
        ctx.fillStyle = rg(ctx, dx, L.daisY + h * 0.05, 0, w * 0.34, [[0, 'rgba(255,238,198,0.07)'], [0.55, 'rgba(255,236,194,0.035)'], [1, 'rgba(255,236,194,0)']]);
        ctx.fillRect(dx - w * 0.34, L.daisY - h * 0.03, w * 0.68, h * 0.2);
        /* dust turning over in the light */
        if (sp) for (i = 0; i < 30; i++) {
          var a2 = hash(i, 21), b2 = hash(i, 22), c2 = hash(i, 23), per = 22 + c2 * 20, q = ((t + a2 * per) % per) / per;
          var u = a2 * 1.35 - 0.1, dist = (0.08 + q * 1.05) * h * 1.25;
          var ang = PI * 0.72 + (b2 - 0.5) * 0.34;
          var mx = w * 1.02 + Math.cos(ang) * dist + Math.sin(t * 0.22 + i) * 7 * s;
          var my = h * 0.04 + Math.sin(ang) * dist * (0.55 + u * 0.3) + Math.cos(t * 0.17 + i * 1.7) * 6 * s;
          if (my > h * 0.74) continue;
          var ms = (1.1 + b2 * 2.4) * s;
          ctx.globalAlpha = Math.sin(q * PI) * (0.3 + c2 * 0.4);
          ctx.drawImage(sp, mx - ms * 2.4, my - ms * 2.4, ms * 4.8, ms * 4.8);
        }
        /* a few slow motes in the room's warm air */
        if (spH) for (i = 0; i < 10; i++) {
          var a3 = hash(i, 41), b3 = hash(i, 42), per2 = 26 + hash(i, 43) * 16, q2 = ((t + a3 * per2) % per2) / per2;
          var px = a3 * w + Math.sin(t * 0.16 + i * 2) * 16 * s, py = h * (0.68 - q2 * 0.42) + b3 * h * 0.04, ps = (0.9 + b3 * 1.3) * s;
          ctx.globalAlpha = Math.sin(q2 * PI) * 0.3;
          ctx.drawImage(spH, px - ps * 2, py - ps * 2, ps * 4, ps * 4);
        }
        ctx.restore();

        /* the flag stirs: folds travel slowly across the cloth */
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(F.x0, F.y0); ctx.lineTo(F.x1, F.y0); ctx.lineTo(F.x1, F.y1);
        ctx.quadraticCurveTo((F.x0 + F.x1) / 2, F.y1 - fh * 0.1, F.x0, F.y1); ctx.closePath(); ctx.clip();
        for (i = 0; i < 3; i++) {
          var ph = ((t * 0.045 + i / 3) % 1), fx = F.x0 - fw * 0.3 + ph * fw * 1.6, fwd = fw * 0.3;
          var amp = 0.1 + 0.05 * Math.sin(t * 0.5 + i * 2.3);
          ctx.fillStyle = lg(ctx, fx - fwd, 0, fx + fwd, 0, [[0, 'rgba(10,16,34,0)'], [0.45, 'rgba(10,16,34,' + amp.toFixed(3) + ')'], [0.55, 'rgba(255,246,222,' + (amp * 1.1).toFixed(3) + ')'], [1, 'rgba(255,246,222,0)']]);
          ctx.fillRect(fx - fwd, F.y0, fwd * 2, fh);
        }
        ctx.restore();
      } catch (e) { PAINT._err = 'townhall overlay: ' + String(e && e.stack || e); }
    }
  };

  /* leave the caller's canvas state untouched, exactly as paint_boston.js does */
  (function (k) {
    var S0 = PAINT[k], p0 = S0.paint, o0 = S0.overlay;
    S0.paint = function (ctx, w, h) { ctx.save(); try { p0(ctx, w, h); } finally { ctx.restore(); } };
    S0.overlay = function (ctx, w, h, t) { ctx.save(); try { o0(ctx, w, h, t); } finally { ctx.restore(); } };
  })('townhall');

  /* tappable things in the council chamber */
  LATE.push(function () {
    if (typeof PROPS === 'undefined') return;
    PROPS.townhall = [
      { id: 'plant', x: 8, y: 86, w: 58, sfx: 'rustle', fx: 'wiggle', burst: 'leaves' },
      { id: 'plant', x: 92, y: 86, w: 58, sfx: 'rustle', fx: 'wiggle', burst: 'leaves' },
      { id: 'person', x: 26, y: 84, w: 52, talk: 'townhall', look: { skin: '#7a4a2c', shirt: '#16b3a6', hair: '#1b1410' } },
      { id: 'person', x: 74, y: 83, w: 50, talk: 'townhall', look: { skin: '#f6d2bd', shirt: '#ff7a6b', hair: '#c9772d' } }
    ];
  });
})();
