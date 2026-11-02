/* scenes/varrow.js - PAINT.varrow: the Quiet Year memorial garden in Varrow (a fictional harbor city near Boston), warm dusk.
   Same contract as paint_boston.js:
     window.PAINT.varrow = { paint(ctx, w, h), overlay(ctx, w, h, t), focus }
   - paint() draws the static painting once (the game caches it); overlay() draws calm motion every frame (t in seconds, may be 0).
   - w, h are canvas pixels; pass an untransformed ctx. Everything is seeded, so it paints identically every time.
   Layout (fractions): calm sky to ~0.1; harbor horizon 0.392; low curved stone wall ~0.49-0.54; reflecting pool with the
   memorial stone at (0.5, 0.6); open low-contrast lawn at (0.18,0.70) (0.82,0.66) (0.30,0.78) (0.70,0.79) (0.50,0.72);
   darker foreground below ~0.84. One paper lantern for each family that helped: strings, stands, wall tops, and the pool.
   Utilities are copied from paint_boston.js (they are private there). */
(function () {
  'use strict';
  var PAINT = (window.PAINT = window.PAINT || {});
  var PI = Math.PI, TAU = PI * 2;

  /* ============================== utilities (from paint_boston.js) ============================== */
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
  function vnoise(x, s) {
    var i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
    return hash(i, s) * (1 - u) + hash(i + 1, s) * u;
  }
  function fbm(x, s, oct) {
    var v = 0, a = 0.5, fr = 1, n = 0, o;
    for (o = 0; o < (oct || 5); o++) { v += a * vnoise(x * fr, s + o * 131); n += a; a *= 0.5; fr *= 2.07; }
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
  function wisp(ctx, x, y, len, th, col, al, r) {
    for (var i = 0; i < 6; i++) {
      var cx = x + (r() - 0.5) * len, cy = y + (r() - 0.5) * th * 2;
      ctx.save(); ctx.translate(cx, cy); ctx.scale(1, th / len * 3);
      ctx.fillStyle = rg(ctx, 0, 0, 0, len * 0.4, [[0, rgba(col, al)], [1, rgba(col, 0)]]);
      ctx.fillRect(-len * 0.4, -len * 0.4, len * 0.8, len * 0.8); ctx.restore();
    }
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
  function reflect(ctx, w, axis, y1, al, amp, freq, seed, squash) {
    try {
      var cv = ctx.canvas; if (!cv || !cv.width) return; var k = cv.width / w, y, sq = squash || 1;
      var st = Math.max(2, Math.round(1.5 * k)) / k, srcH = Math.min(axis, (y1 - axis) * sq + 2 * st);
      var sw = cv.width, sh = Math.ceil(srcH * k);
      var scratch = mk(sw, sh); if (!scratch) return;
      var g = scratch.getContext('2d');
      g.drawImage(cv, 0, Math.round((axis - srcH) * k), sw, sh, 0, 0, sw, sh);
      ctx.save(); ctx.beginPath(); ctx.rect(0, axis, w, y1 - axis); ctx.clip();
      for (y = axis; y < y1; y += st) {
        var d = (y - axis), src = srcH - d * sq - st, p = d / Math.max(1, y1 - axis);
        if (src < 0) break;
        var dx = (Math.sin(y * freq + seed) * 0.6 + Math.sin(y * freq * 2.7 + seed * 3) * 0.4) * amp * (0.3 + p);
        ctx.globalAlpha = al * (1 - p * 0.35);
        ctx.drawImage(scratch, 0, Math.round(src * k), sw, Math.max(1, Math.round(st * k)), dx, y, w, st + 0.5 / k);
      }
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
  function bez(p0, p1, p2, t) { var m = 1 - t; return m * m * p0 + 2 * m * t * p1 + t * t * p2; }
  function cub(p0, p1, p2, p3, t) { var m = 1 - t; return m * m * m * p0 + 3 * m * m * t * p1 + 3 * m * t * t * p2 + t * t * t * p3; }
  function boxBlur(src, rad, passes) {
    var a = src, b = mk(src.width, src.height); if (!b) return src;
    var offs = [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1], [-1, 1], [1, -1]];
    for (var p = 0; p < passes; p++) {
      var g = b.getContext('2d'); g.clearRect(0, 0, b.width, b.height);
      for (var k = 0; k < offs.length; k++) { g.globalAlpha = 1 / (k + 1); g.drawImage(a, offs[k][0] * rad, offs[k][1] * rad); }
      g.globalAlpha = 1; var tmp = a; a = b; b = (tmp === src) ? mk(src.width, src.height) : tmp;
    }
    return a;
  }
  /* sunset stratocumulus: horizontal brush dabs, shade body, sun-lit undersides, bright rims (dir +1 = lit from below) */
  function streakCloud(ctx, cx, cy, W, H, r, o) {
    var n = o.n || 46, D = [], i, q = 0.5, pad = H * 1.2, bw = W * 1.2 + pad * 2, bh = H * 2 + pad * 2, ox = bw / 2, oy = bh / 2;
    for (i = 0; i < n; i++) {
      var u = (r() * 2 - 1), env = Math.pow(Math.max(0, 1 - u * u), 0.6) * (0.75 + 0.25 * fbm(u * 3 + cx * 0.01, 77, 3));
      var rx = W * (0.07 + r() * 0.13) * (0.5 + env * 0.6), ry = H * (0.16 + r() * 0.22) * (0.35 + env * 0.75);
      var dy = (r() - 0.5) * H * env * 0.9 - env * H * 0.15;
      D.push([u * W * 0.5, dy, rx, ry, (dy / (H * 0.5 * Math.max(0.2, env)) + 1) / 2]);
    }
    D.sort(function (A, B) { return A[1] - B[1]; });
    var cv = mk(bw * q, bh * q); if (!cv) return;
    var g = cv.getContext('2d'), dir = o.dir == null ? 1 : o.dir;
    g.scale(q, q); g.translate(ox, oy);
    function layer(col, al, f) { g.fillStyle = col; g.globalAlpha = al; g.beginPath(); for (var j = 0; j < D.length; j++) { var e = f(D[j], j); if (e) qell(g, e[0], e[1], e[2], e[3], 0); } g.fill(); }
    layer(o.mid, 0.16, function (d) { return [d[0], d[1], d[2] * 1.25, d[3] * 1.5]; });
    layer(o.shade, 0.9, function (d) { return [d[0], d[1], d[2], d[3]]; });
    layer(o.mid, 0.75, function (d) { return d[4] < 0.75 ? [d[0] - d[2] * 0.05, d[1] - dir * d[3] * 0.2, d[2] * 0.85, d[3] * 0.55] : null; });
    layer(o.lit, 0.9, function (d) { return d[4] > 0.35 ? [d[0] + d[2] * 0.06, d[1] + dir * d[3] * 0.48, d[2] * 0.75, d[3] * 0.38] : null; });
    layer(o.rim || o.lit, 0.85, function (d, j) { return d[4] > 0.6 && j % 2 === 0 ? [d[0] + d[2] * 0.1, d[1] + dir * d[3] * 0.75, d[2] * 0.5, d[3] * 0.14] : null; });
    var bl = boxBlur(cv, 1, 1);
    ctx.save(); ctx.globalAlpha = o.al == null ? 1 : o.al; ctx.imageSmoothingEnabled = true; ctx.drawImage(bl, cx - ox, cy - oy, bw, bh); ctx.restore();
  }
  function gradAt(st, t) {
    if (t <= st[0][0]) return st[0][1];
    for (var i = 1; i < st.length; i++) if (t <= st[i][0]) return mix(st[i - 1][1], st[i][1], (t - st[i - 1][0]) / (st[i][0] - st[i - 1][0]));
    return st[st.length - 1][1];
  }
  function skyStrokes(ctx, x0, x1, y0, y1, st, n, r, s, al, warm, cool) {
    var NB = 10, B = {}, i, keys = [];
    for (i = 0; i < n; i++) {
      var y = lerp(y0, y1, r()), x = lerp(x0, x1, r()), tq = Math.round(clamp((y - y0) / (y1 - y0) + (r() - 0.5) * 0.08, 0, 1) * NB), k = (r() * 3) | 0, key = tq * 3 + k;
      if (!B[key]) { var c = gradAt(st, tq / NB); B[key] = { c: k === 0 ? mix(c, warm, 0.25) : k === 1 ? mix(c, cool, 0.2) : c, q: [] }; keys.push(key); }
      B[key].q.push([x, y, (14 + r() * 40) * s, (1.5 + r() * 3) * s, (r() - 0.5) * 0.08]);
    }
    ctx.save(); ctx.globalAlpha = al;
    for (i = 0; i < keys.length; i++) { var b = B[keys[i]]; ctx.fillStyle = b.c; ctx.beginPath(); for (var j = 0; j < b.q.length; j++) { var q = b.q[j]; qell(ctx, q[0], q[1], q[2], q[3], q[4]); } ctx.fill(); }
    ctx.restore();
  }
  function lens(ctx, x, y, L, Wd, a) {
    var c = Math.cos(a), sn = Math.sin(a), tx = x + c * L, ty = y + sn * L, mx = x + c * L * 0.5, my = y + sn * L * 0.5, nx = -sn * Wd, ny = c * Wd;
    ctx.moveTo(x, y); ctx.quadraticCurveTo(mx + nx, my + ny, tx, ty); ctx.quadraticCurveTo(mx - nx, my - ny, x, y);
  }
  function leafPath(ctx, x, y, L, Wd, a, heart) {
    var c = Math.cos(a), sn = Math.sin(a), nx = -sn, ny = c;
    var tx = x + c * L, ty = y + sn * L;
    var b = heart ? 0.15 : 0.35;
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x + c * L * b + nx * Wd * 1.3, y + sn * L * b + ny * Wd * 1.3, x + c * L * 0.75 + nx * Wd * 0.8, y + sn * L * 0.75 + ny * Wd * 0.8, tx, ty);
    ctx.bezierCurveTo(x + c * L * 0.75 - nx * Wd * 0.8, y + sn * L * 0.75 - ny * Wd * 0.8, x + c * L * b - nx * Wd * 1.3, y + sn * L * b - ny * Wd * 1.3, x, y);
  }
  function trunkPath(ctx, x0, y0, x1, y1, w0, w1, bend, add) {
    var mx = (x0 + x1) / 2 + bend, my = (y0 + y1) / 2, N = 12, Lp = [], Rp = [], j;
    for (j = 0; j <= N; j++) {
      var t = j / N, px = bez(x0, mx, x1, t), py = bez(y0, my, y1, t);
      var dx = bez(x0, mx, x1, Math.min(1, t + 0.02)) - bez(x0, mx, x1, Math.max(0, t - 0.02)), dy = bez(y0, my, y1, Math.min(1, t + 0.02)) - bez(y0, my, y1, Math.max(0, t - 0.02));
      var l = Math.sqrt(dx * dx + dy * dy) || 1, wd = lerp(w0, w1, Math.pow(t, 0.8)) * 0.5 + (t < 0.08 ? w0 * (0.08 - t) * 5 : 0);
      Lp.push([px - dy / l * wd, py + dx / l * wd]); Rp.push([px + dy / l * wd, py - dx / l * wd]);
    }
    if (!add) ctx.beginPath();
    ctx.moveTo(Lp[0][0], Lp[0][1]);
    for (j = 1; j <= N; j++) ctx.lineTo(Lp[j][0], Lp[j][1]);
    for (j = N; j >= 0; j--) ctx.lineTo(Rp[j][0], Rp[j][1]);
    ctx.closePath();
  }

  /* ============================== new helpers for this scene ============================== */
  /* irregular rounded blob (noise-modulated polar points joined by quadratic curves), appended to the path */
  function blob(ctx, cx, cy, rx, ry, seed, amp, n) {
    n = n || 9; var P = [], i;
    for (i = 0; i < n; i++) { var a = i / n * TAU + hash(i, seed + 7) * 0.4, k = 1 + (hash(i, seed) - 0.5) * 2 * (amp == null ? 0.25 : amp); P.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); }
    var mx = (P[n - 1][0] + P[0][0]) / 2, my = (P[n - 1][1] + P[0][1]) / 2;
    ctx.moveTo(mx, my);
    for (i = 0; i < n; i++) { var A = P[i], B = P[(i + 1) % n]; ctx.quadraticCurveTo(A[0], A[1], (A[0] + B[0]) / 2, (A[1] + B[1]) / 2); }
    ctx.closePath();
  }
  /* irregular pillow stone: edge midpoints on the curve, jittered corners as control points */
  function flag(ctx, cx, cy, rx, ry, seed, jit) {
    var C = [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]], P = [], i, J = jit == null ? 0.22 : jit;
    for (i = 0; i < 8; i++) P.push([cx + rx * (C[i][0] + (hash(i, seed) - 0.5) * J), cy + ry * (C[i][1] + (hash(i + 8, seed) - 0.5) * J * 1.4)]);
    ctx.moveTo(P[1][0], P[1][1]);
    ctx.quadraticCurveTo(P[2][0], P[2][1], P[3][0], P[3][1]); ctx.quadraticCurveTo(P[4][0], P[4][1], P[5][0], P[5][1]);
    ctx.quadraticCurveTo(P[6][0], P[6][1], P[7][0], P[7][1]); ctx.quadraticCurveTo(P[0][0], P[0][1], P[1][0], P[1][1]);
    ctx.closePath();
  }
  /* foliage clump: irregular dark core + leaf dabs in 5 light buckets. pal [deep, shadow, mid, lit, rim] */
  function bush(ctx, cx, cy, R, pal, r, lx, ly, dens, flat) {
    var fy = flat || 0.8, seed = (r() * 1e6) | 0;
    ctx.fillStyle = pal[0]; ctx.beginPath(); blob(ctx, cx, cy, R * 0.82, R * 0.82 * fy, seed, 0.22, 8); ctx.fill();
    var n = Math.min(240, Math.round((26 + R * R * 0.3) * (dens || 1))), B = [[], [], [], [], []], i, k;
    for (i = 0; i < n; i++) {
      var a = r() * TAU, rr = R * Math.sqrt(r()) * (0.82 + 0.2 * Math.sin(a * 3 + seed)), px = cx + Math.cos(a) * rr, py = cy + Math.sin(a) * rr * fy;
      var nx = (px - cx) / R, ny = (py - cy) / R;
      var v = (nx * lx + ny * ly) * 0.55 - ny * 0.2 + (r() - 0.5) * 0.4 + 0.45;
      var b = v < 0.24 ? 0 : v < 0.44 ? 1 : v < 0.64 ? 2 : v < 0.88 ? 3 : 4;
      if (b === 4 && rr < R * 0.7) b = 3;
      var L = R * (0.14 + r() * 0.12) * (b === 4 ? 0.7 : 1);
      B[b].push([px, py, L, L * (0.3 + r() * 0.12), a + PI * 0.5 + (r() - 0.5) * 1.6]);
    }
    for (k = 0; k < 5; k++) {
      if (!B[k].length) continue;
      ctx.fillStyle = pal[k]; ctx.beginPath();
      for (i = 0; i < B[k].length; i++) { var q = B[k][i]; lens(ctx, q[0] - Math.cos(q[4]) * q[2] * 0.5, q[1] - Math.sin(q[4]) * q[2] * 0.5, q[2], q[3], q[4]); }
      ctx.fill();
    }
  }
  /* blossom masses: clusters [x,y,R] painted as many petal dabs (no solid discs). pal [deep, shadow, mid, lit, hi] */
  function blossom(ctx, C, pal, r, s, lx, ly, dens, coreA) {
    var B = [[], [], [], [], []], i, k, c;
    ctx.save(); ctx.globalAlpha = coreA == null ? 0.85 : coreA; ctx.fillStyle = pal[0]; ctx.beginPath();
    for (i = 0; i < C.length; i++) { c = C[i]; blob(ctx, c[0], c[1] + c[2] * 0.08, c[2] * 0.7, c[2] * 0.52, (c[0] * 13 + c[1] * 7) | 0, 0.3, 9); }
    ctx.fill(); ctx.restore();
    for (i = 0; i < C.length; i++) {
      c = C[i]; var ph = r() * TAU, ph2 = r() * TAU, n = Math.min(320, Math.round((22 + c[2] * c[2] / (s * s) * 1.1) * (dens || 1))), sz = Math.pow(c[2] / (26 * s), 0.35);
      for (var j = 0; j < n; j++) {
        var a = r() * TAU, kk = 0.74 + 0.2 * Math.sin(a * 3 + ph) + 0.12 * Math.sin(a * 5 + ph2), d = Math.sqrt(r()) * c[2] * kk;
        var px = c[0] + Math.cos(a) * d, py = c[1] + Math.sin(a) * d * 0.74, nx = Math.cos(a) * d / c[2], ny = Math.sin(a) * d * 0.74 / c[2];
        var v = (nx * lx + ny * ly) * 0.6 - ny * 0.3 + (r() - 0.5) * 0.5 + 0.42;
        var b = v < 0.16 ? 0 : v < 0.38 ? 1 : v < 0.64 ? 2 : v < 0.9 ? 3 : 4;
        if (b === 4 && d < c[2] * kk * 0.7) b = 3;
        var L = (2 + r() * 2.6) * s * sz;
        B[b].push([px, py, L, L * (0.5 + r() * 0.3), r() * TAU, r() < 0.5]);
      }
    }
    for (k = 0; k < 5; k++) {
      if (!B[k].length) continue;
      ctx.fillStyle = pal[k]; ctx.beginPath();
      for (i = 0; i < B[k].length; i++) { var q = B[k][i]; if (q[5]) lens(ctx, q[0], q[1], q[2] * 1.3, q[3] * 0.7, q[4]); else qell(ctx, q[0], q[1], q[2] * 0.62, q[3] * 0.62, q[4]); }
      ctx.fill();
    }
  }
  function drawBranches(ctx, segs, bark, lx, minDepth, maxDepth) {
    // bark: [lit, mid, dark]; one fill per tone (dark body, then a lit edge stroke)
    ctx.fillStyle = bark[2]; ctx.beginPath();
    for (var i = 0; i < segs.length; i++) { var g = segs[i]; if (g[7] < minDepth || g[7] > maxDepth) continue; trunkPath(ctx, g[0], g[1], g[2], g[3], g[4], g[5], g[6], true); }
    ctx.fill();
    ctx.fillStyle = bark[1]; ctx.beginPath();
    for (i = 0; i < segs.length; i++) { g = segs[i]; if (g[7] < minDepth || g[7] > maxDepth || g[4] < 2) continue; var o = g[4] * 0.22 * lx; trunkPath(ctx, g[0] + o, g[1], g[2] + o * 0.6, g[3], g[4] * 0.5, g[5] * 0.5, g[6], true); }
    ctx.fill();
    ctx.fillStyle = bark[0]; ctx.beginPath();
    for (i = 0; i < segs.length; i++) { g = segs[i]; if (g[7] < minDepth || g[7] > maxDepth || g[4] < 2.5) continue; var o2 = g[4] * 0.38 * lx; trunkPath(ctx, g[0] + o2, g[1], g[2] + o2 * 0.6, g[3], g[4] * 0.18, g[5] * 0.18, g[6], true); }
    ctx.fill();
  }

  /* ---------------- paper lanterns (cached sprites) ---------------- */
  var LCOL = { amber: '#ffb24a', cream: '#ffe2a8', rose: '#ff9fb0', peach: '#ffc08a', teal: '#86e4d4' };
  var GCOL = {}; function gcol(k) { return GCOL[k] || (GCOL[k] = mix(LCOL[k], '#ff9440', 0.3)); }
  var LKEYS = ['amber', 'amber', 'amber', 'cream', 'rose', 'rose', 'peach', 'teal', 'amber', 'rose', 'cream', 'peach', 'teal', 'amber'];
  /* sprite geometry: kind 'round' (56x72), 'tall' (44x76), 'float' (64x56); hang point at top centre, base at bottom centre */
  var LDIM = { round: [56, 72], tall: [44, 76], float: [64, 56] };
  function lanternSpr(key, kind) {
    var id = 'lan' + key + kind;
    if (SPR[id] !== undefined) return SPR[id];
    var D = LDIM[kind], c = mk(D[0] * 2, D[1] * 2);
    if (c) {
      var g = c.getContext('2d'), col = LCOL[key], deep = mix(col, '#7a2a20', key === 'teal' ? 0.45 : 0.4), cap = '#3a2228', W = D[0], H = D[1], cx = W / 2, i;
      g.scale(2, 2);
      if (kind === 'float') {
        // tooro: a little paper box on a wooden float, seen from slightly above
        var bx0 = cx - 18, bx1 = cx + 18, top = 10, bot = 40;
        g.fillStyle = '#4a2a26'; g.beginPath(); g.moveTo(cx - 26, bot); g.quadraticCurveTo(cx, bot - 4, cx + 26, bot); g.lineTo(cx + 22, bot + 8); g.quadraticCurveTo(cx, bot + 11, cx - 22, bot + 8); g.closePath(); g.fill();
        g.fillStyle = '#7a4a3a'; g.beginPath(); g.moveTo(cx - 26, bot); g.quadraticCurveTo(cx, bot - 4, cx + 26, bot); g.quadraticCurveTo(cx, bot + 3, cx - 26, bot); g.fill();
        g.fillStyle = rg(g, cx, (top + bot) / 2 + 3, 1, 26, [[0, '#fffcee'], [0.4, mix(col, '#fff8e8', 0.5)], [0.85, col], [1, deep]]);
        g.beginPath(); g.moveTo(bx0, bot); g.lineTo(bx0 + 1, top + 4); g.quadraticCurveTo(cx, top - 2, bx1 - 1, top + 4); g.lineTo(bx1, bot); g.quadraticCurveTo(cx, bot + 2, bx0, bot); g.fill();
        g.fillStyle = rgba('#ffffff', 0.35); g.beginPath(); g.moveTo(bx0 + 1, top + 4); g.quadraticCurveTo(cx, top - 2, bx1 - 1, top + 4); g.quadraticCurveTo(cx, top + 6, bx0 + 1, top + 4); g.fill();
        g.strokeStyle = rgba('#4a2a26', 0.75); g.lineWidth = 1.6; g.beginPath(); g.moveTo(cx, top + 2); g.lineTo(cx, bot + 1); g.moveTo(bx0 + 0.5, top + 4); g.lineTo(bx0, bot); g.moveTo(bx1 - 0.5, top + 4); g.lineTo(bx1, bot); g.stroke();
        g.strokeStyle = rgba(deep, 0.35); g.lineWidth = 1; g.beginPath(); g.moveTo(bx0 + 2, top + 16); g.quadraticCurveTo(cx, top + 18, bx1 - 2, top + 16); g.stroke();
      } else {
        var hw = kind === 'round' ? 22 : 15, bulge = kind === 'round' ? 1 : 0.45, t0 = 9, b0 = H - 8, nw = kind === 'round' ? 9 : 10;
        // body: bulging paper with bezier sides
        g.beginPath(); g.moveTo(cx - nw, t0);
        g.bezierCurveTo(cx - nw - hw * bulge, t0 + 4, cx - hw - 2, t0 + (b0 - t0) * 0.3, cx - hw, (t0 + b0) / 2);
        g.bezierCurveTo(cx - hw + 1, b0 - (b0 - t0) * 0.15, cx - nw - hw * bulge * 0.7, b0 - 2, cx - nw, b0);
        g.lineTo(cx + nw, b0);
        g.bezierCurveTo(cx + nw + hw * bulge * 0.7, b0 - 2, cx + hw - 1, b0 - (b0 - t0) * 0.15, cx + hw, (t0 + b0) / 2);
        g.bezierCurveTo(cx + hw + 2, t0 + (b0 - t0) * 0.3, cx + nw + hw * bulge, t0 + 4, cx + nw, t0);
        g.closePath();
        g.fillStyle = rg(g, cx - 2, (t0 + b0) / 2 + 3, 1, hw * 1.25, [[0, '#fffdf0'], [0.3, mix(col, '#fff8e4', 0.55)], [0.75, col], [1, deep]]); g.fill();
        g.save(); g.clip();
        // ribs (gently curved bamboo hoops)
        g.strokeStyle = rgba(deep, 0.32); g.lineWidth = 1.1; g.beginPath();
        var nr = kind === 'round' ? 7 : 6;
        for (i = 1; i < nr; i++) { var yy = t0 + (b0 - t0) * i / nr; g.moveTo(cx - hw - 3, yy - 1); g.quadraticCurveTo(cx, yy + 3, cx + hw + 3, yy - 1); }
        g.stroke();
        // a soft side shade and a painted brush accent
        g.fillStyle = lg(g, cx - hw, 0, cx + hw, 0, [[0, rgba(deep, 0.35)], [0.35, rgba(deep, 0)], [0.7, rgba(deep, 0)], [1, rgba(deep, 0.45)]]); g.fillRect(0, 0, W, H);
        g.fillStyle = rgba(mix(col, '#c0303a', 0.55), 0.22); g.beginPath(); lens(g, cx - 5, (t0 + b0) / 2 + 6, 12, 2.6, -1.2); g.fill();
        g.restore();
        // caps
        g.fillStyle = cap; g.beginPath(); g.moveTo(cx - nw - 2, t0 + 1); g.quadraticCurveTo(cx, t0 - 5, cx + nw + 2, t0 + 1); g.lineTo(cx + nw + 1, t0 + 3); g.quadraticCurveTo(cx, t0 - 1, cx - nw - 1, t0 + 3); g.closePath(); g.fill();
        g.fillRect(cx - nw - 1, t0 - 1, nw * 2 + 2, 3);
        g.beginPath(); g.moveTo(cx - nw - 2, b0 - 1); g.quadraticCurveTo(cx, b0 + 3, cx + nw + 2, b0 - 1); g.lineTo(cx + nw + 1, b0 + 3); g.quadraticCurveTo(cx, b0 + 6, cx - nw - 1, b0 + 3); g.closePath(); g.fill();
        g.strokeStyle = cap; g.lineWidth = 1.4; g.beginPath(); g.moveTo(cx, t0 - 1); g.lineTo(cx, 1); g.stroke();
        // warm rim where the light leaks around the top cap
        g.strokeStyle = rgba('#ffe6b0', 0.5); g.lineWidth = 0.8; g.beginPath(); g.moveTo(cx - nw - 1, t0 + 3.5); g.quadraticCurveTo(cx, t0, cx + nw + 1, t0 + 3.5); g.stroke();
      }
    }
    SPR[id] = c; return c;
  }
  /* draw a lantern whose hang point (top centre) is at (x, y), sized by height hh */
  function drawLantern(ctx, x, y, hh, key, kind) {
    var sp = lanternSpr(key, kind); if (!sp) return;
    var D = LDIM[kind], k = hh / D[1];
    ctx.drawImage(sp, x - D[0] * k / 2, y, D[0] * k, hh);
  }

  /* ============================== layout ============================== */
  var EXCL = [[0.18, 0.70], [0.82, 0.66], [0.30, 0.78], [0.70, 0.79], [0.50, 0.72]];
  function inExcl(fx, fy, mx, my) { for (var i = 0; i < EXCL.length; i++) { var dx = (fx - EXCL[i][0]) / (mx || 0.1), dy = (fy - EXCL[i][1]) / (my || 0.05); if (dx * dx + dy * dy < 1) return true; } return false; }
  var VL = memo(function (w, h) {
    var s = S(w, h), L = { s: s, hz: h * 0.392, bank: h * 0.452 }, r = rng(41011), i, k, x;
    L.sun = [w * 0.62, L.hz - h * 0.03];
    L.sunR = Math.min(w * 0.05, h * 0.026);
    L.lamp = [w * 0.345, L.hz - h * 0.077 - 3 * s]; // lighthouse lamp (matches the painted tower)
    L.wallY = function (x) { var u = (x / w - 0.5) / 0.5; return h * (0.492 + 0.042 * u * u); };
    L.wallH = function (x) { var u = (x / w - 0.5) / 0.5; return h * (0.024 + 0.016 * u * u); };
    L.gate = [w * 0.455, w * 0.545];
    var prx = Math.min(w * 0.2, h * 0.11);
    L.pool = { x: w * 0.5, y: h * 0.612, rx: prx, ry: prx * 0.4 };
    L.stone = { x: w * 0.5, y: L.pool.y + L.pool.ry * 0.1, W: prx * 0.19, H: prx * 0.7 };
    // winding path: cubic from the bottom up to the front of the pool
    var P0 = [w * 0.58, h * 1.03], P1 = [w * 0.28, h * 0.92], P2 = [w * 0.64, h * 0.775], P3 = [w * 0.5, L.pool.y + L.pool.ry * 0.9];
    L.pathAt = function (t) { return [cub(P0[0], P1[0], P2[0], P3[0], t), cub(P0[1], P1[1], P2[1], P3[1], t)]; };
    L.pathHW = function (y) { var p = clamp((y - h * 0.64) / (h * 0.39), 0, 1); return w * lerp(0.045, 0.16, Math.pow(p, 1.1)); };
    L.step = function (x) { return h * (0.842 + 0.01 * Math.sin(x / w * 5.2 + 0.7)); };
    // lantern strings
    L.strings = [
      { a: [w * 0.2, h * 0.452], b: [w * 0.8, h * 0.456], sag: h * 0.052, n: 11, hh: 15 * s },
      { a: [w * 0.215, h * 0.398], b: [w * 0.79, h * 0.404], sag: h * 0.03, n: 10, hh: 11 * s }
    ];
    L.strAt = function (S0, u) { return [lerp(S0.a[0], S0.b[0], u), lerp(S0.a[1], S0.b[1], u) + S0.sag * 4 * u * (1 - u)]; };
    var lan = []; // [x, yTop, height, colKey, kind, type(0 hang,1 stand,2 sit), postBaseY]
    function key() { return LKEYS[(r() * LKEYS.length) | 0]; }
    L.strings.forEach(function (S0, si) {
      for (k = 0; k < S0.n; k++) {
        var u = (k + 0.5) / S0.n, p = L.strAt(S0, u), drop = (2 + r() * 3) * s;
        lan.push([p[0], p[1] + drop, S0.hh * (0.85 + r() * 0.3), key(), r() < 0.6 ? 'round' : 'tall', 0, p[1], si]);
      }
    });
    // on the wall coping
    for (x = w * 0.03; x < w; x += w * (0.065 + r() * 0.03)) {
      if (x > L.gate[0] - w * 0.03 && x < L.gate[1] + w * 0.03) continue;
      var hh0 = (8.5 + 3 * Math.abs(x / w - 0.5)) * s;
      lan.push([x, L.wallY(x) - hh0 - 0.5 * s, hh0, key(), 'tall', 2, L.wallY(x)]);
    }
    // gate pillar lanterns
    [L.gate[0] - w * 0.012, L.gate[1] + w * 0.012].forEach(function (gx) { lan.push([gx, L.wallY(gx) - h * 0.012 - 13 * s, 13 * s, 'cream', 'tall', 2, L.wallY(gx) - h * 0.012]); });
    // family lanterns on short stands: clusters on the upper lawn either side of the pool
    var tries = 0, nStand = 0;
    while (nStand < 34 && tries < 600) {
      tries++;
      var fx = r(), fy = 0.535 + r() * 0.1, xx = fx * w, yy = fy * h;
      if (yy < L.wallY(xx) + L.wallH(xx) + h * 0.012) continue;
      var dxp = (xx - L.pool.x) / (L.pool.rx * 1.35), dyp = (yy - L.pool.y) / (L.pool.ry * 1.6 + h * 0.03);
      if (dxp * dxp + dyp * dyp < 1) continue;
      if (Math.abs(xx - w * 0.5) < w * 0.07 && yy < L.pool.y) continue; // the back path to the gate
      if (inExcl(fx, fy, 0.12, 0.06)) continue;
      if ((fx < 0.1 && fy > 0.6) || (fx > 0.88 && fy > 0.58)) continue; // tree trunks
      var hh = lerp(9, 13, (fy - 0.535) / 0.1) * s * (0.85 + r() * 0.3), post = (6 + r() * 6) * s * (hh / (11 * s));
      lan.push([xx, yy - post - hh, hh, key(), r() < 0.5 ? 'round' : 'tall', 1, yy]); nStand++;
    }
    // around the pool rim (leave the front open where the path arrives)
    for (k = 0; k < 9; k++) {
      var a = -PI * 0.92 + k / 8 * PI * 1.84 + (r() - 0.5) * 0.08;
      var aa = a;
      var px = L.pool.x + Math.cos(aa) * L.pool.rx * 1.12, py = L.pool.y + Math.sin(aa) * L.pool.ry * 1.12;
      if (Math.abs(Math.cos(aa)) < 0.3 && Math.sin(aa) < 0) continue; // behind the stone
      var hh2 = (10 + Math.sin(aa) * 1.5) * s;
      lan.push([px, py - hh2 - 3 * s, hh2, key(), k % 2 ? 'round' : 'tall', 1, py]);
    }
    for (k = 0; k < 4; k++) { var a3 = PI * 0.12 + k / 3 * PI * 0.76; if (Math.abs(a3 - PI / 2) < 0.3) continue; var px3 = L.pool.x + Math.cos(a3) * L.pool.rx * 1.14, py3 = L.pool.y + Math.sin(a3) * L.pool.ry * 1.18, hh3 = 11.5 * s; lan.push([px3, py3 - hh3 - 3 * s, hh3, key(), 'round', 1, py3]); }
    // along the winding path edges
    for (k = 0; k < 16; k++) {
      var tt = 0.06 + k / 15 * 0.86, pp = L.pathAt(tt), side = k % 2 ? 1 : -1, hw = L.pathHW(pp[1]);
      var ex2 = pp[0] + side * (hw + 6 * s), ey2 = pp[1];
      if (inExcl(ex2 / w, ey2 / h, 0.075, 0.04) || ey2 > h * 0.97) continue;
      var dep = clamp((ey2 - h * 0.64) / (h * 0.35), 0, 1), hh4 = lerp(12, 24, dep) * s, post4 = lerp(8, 20, dep) * s;
      lan.push([ex2, ey2 - post4 - hh4, hh4, key(), r() < 0.5 ? 'round' : 'tall', 1, ey2]);
    }
    // a few more on the open lawn's outer edges (well clear of the tap spots)
    [[0.05, 0.62], [0.07, 0.8], [0.95, 0.74], [0.93, 0.8], [0.42, 0.655], [0.58, 0.66], [0.04, 0.72], [0.96, 0.6]].forEach(function (Q) {
      if (inExcl(Q[0], Q[1], 0.09, 0.045)) return;
      var dep = clamp((Q[1] - 0.6) / 0.3, 0, 1), hh5 = lerp(12, 20, dep) * s, post5 = lerp(9, 16, dep) * s;
      lan.push([Q[0] * w, Q[1] * h - post5 - hh5, hh5, key(), r() < 0.5 ? 'round' : 'tall', 1, Q[1] * h]);
    });
    // big ones in the foreground flower beds
    [[0.1, 0.93, 34], [0.9, 0.915, 30], [0.24, 0.975, 26]].forEach(function (Q) { lan.push([Q[0] * w, Q[1] * h - Q[2] * s * 1.9, Q[2] * s, key(), 'round', 1, Q[1] * h]); });
    lan.sort(function (A, B) { return (A[6] + (A[5] === 0 ? -h : 0)) - (B[6] + (B[5] === 0 ? -h : 0)); });
    L.lan = lan;
    // floating lanterns on the pool (drawn by overlay so they can bob)
    L.floats = [];
    var fa = [-2.75, -2.2, -0.95, -0.4, 0.15, 0.62, 1.1, 2.0, 2.5, 2.95, 0.38, 2.27, -2.48, -0.68];
    for (k = 0; k < fa.length; k++) L.floats.push([fa[k] + (r() - 0.5) * 0.12, 0.55 + r() * 0.3, LKEYS[(r() * LKEYS.length) | 0], (10.5 + r() * 2.5) * s, r() * TAU]);
    // trees
    L.treeL = { x: w * 0.06, yb: h * 0.65 };
    L.treeR = { x: w * 0.95, yb: h * 0.635 };
    return L;
  });

  /* glow layers for the overlay's breathing lanterns: half-resolution canvases covering the garden band, cached per size */
  var GLC = { key: null, val: null };
  function glowLayers(w, h, L) {
    var key = w + 'x' + h; if (GLC.key === key) return GLC.val;
    var q = 0.5, y0 = Math.floor(h * 0.36), hh = h - y0, C = [], i;
    for (i = 0; i < 4; i++) { var c = mk(w * q, hh * q); if (!c) { GLC.key = key; GLC.val = null; return null; } C.push(c); }
    for (i = 0; i < L.lan.length; i++) {
      var Lt = L.lan[i], g = C[(hash(i, 51) * 4) | 0].getContext('2d'), sp = glowSpr(gcol(Lt[3])); if (!sp) continue;
      var gz = Lt[2] * 1.5 * q; g.globalAlpha = 0.16;
      g.drawImage(sp, Lt[0] * q - gz, (Lt[1] + Lt[2] * 0.52 - y0) * q - gz, gz * 2, gz * 2);
    }
    GLC.key = key; GLC.val = { c: C, y0: y0, h: hh }; return GLC.val;
  }

  /* ============================== VARROW: Quiet Year memorial garden at dusk ============================== */
  PAINT.varrow = {
    focus: { x: 0.5, y: 0.585 },
    track: 'night',
    // memorial stone (0.5, 0.585); sun low on the harbor (0.62, 0.362); keep-clear lawn spots listed in the header
    anchors: { stone: { x: 0.5, y: 0.585 }, sun: { x: 0.62, y: 0.362 }, pool: { x: 0.5, y: 0.612 } },
    paint: function (ctx, w, h) {
      try {
        var L = VL(w, h), r = rng(41101), s = L.s, i, k, x, y, hz = L.hz, bank = L.bank, sun = L.sun;
        mark('start', ctx);
        /* ---------- dusk sky ---------- */
        var SKY = [[0, '#2a2458'], [0.16, '#3e3472'], [0.36, '#6c4e8c'], [0.56, '#b0709a'], [0.74, '#e8928e'], [0.88, '#ffb98a'], [1, '#ffd89c']];
        ctx.fillStyle = lg(ctx, 0, 0, 0, hz, SKY); ctx.fillRect(0, 0, w, hz + 2);
        skyStrokes(ctx, -20 * s, w + 20 * s, h * 0.08, hz, SKY, 300, r, s, 0.14, '#ffb090', '#5a4a90');
        // the sun's wide warm bloom
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        ctx.save(); ctx.translate(sun[0], sun[1]); ctx.scale(1.6, 1); softGlow(ctx, 0, 0, w * 0.5, '#ff9a60', 0.28); ctx.restore();
        softGlow(ctx, sun[0], sun[1], w * 0.2, '#ffd890', 0.45);
        ctx.restore();
        // early stars, only high up
        dots(ctx, 150, [['#ffffff', 0.85], ['#fff0d8', 0.6], ['#d8d0ff', 0.5]], function () { var yy = Math.pow(r(), 1.5) * h * 0.24; if (r() > 1 - yy / (h * 0.26)) return null; return [r() * w, yy, (0.3 + Math.pow(r(), 6) * 1.1) * s, (r() * 3) | 0]; });
        var sp = glowSpr('#fff4e0', true);
        if (sp) { var st = [[0.16, 0.06], [0.42, 0.115], [0.8, 0.075], [0.66, 0.165], [0.28, 0.19]]; for (i = 0; i < st.length; i++) { var gs = (5 + (i % 3) * 2) * s; ctx.globalAlpha = 0.75 - i * 0.08; ctx.drawImage(sp, st[i][0] * w - gs, st[i][1] * h - gs, gs * 2, gs * 2); } ctx.globalAlpha = 1; }
        // sunset clouds lit from below
        [[0.3, 0.215, 0.62, 0.03, 0.75], [0.8, 0.26, 0.5, 0.024, 0.8], [0.12, 0.3, 0.4, 0.02, 0.7], [0.58, 0.318, 0.46, 0.016, 0.75], [0.5, 0.15, 0.4, 0.018, 0.45]].forEach(function (Q, j) {
          streakCloud(ctx, w * Q[0], h * Q[1], w * Q[2], h * Q[3], r, { shade: j === 4 ? '#6a5a96' : '#a06e9e', mid: '#d08aa2', lit: '#ffbe94', rim: '#ffe6b8', al: Q[4] * 0.7, n: 54 });
        });
        // the sun itself, softly sinking
        ctx.fillStyle = rg(ctx, sun[0], sun[1], 0, L.sunR * 1.25, [[0, '#fffbe8'], [0.6, '#fff2c8'], [0.78, 'rgba(255,226,160,0.9)'], [1, 'rgba(255,210,140,0)']]);
        ctx.fillRect(sun[0] - L.sunR * 1.3, sun[1] - L.sunR * 1.3, L.sunR * 2.6, L.sunR * 2.6);
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, sun[0], sun[1], L.sunR * 3.2, '#ffe0a0', 0.5); ctx.restore();
        band(ctx, 0, w, hz - h * 0.05, hz + h * 0.008, '#ffc890', 0.4);
        mark('sky', ctx);
        /* ---------- the far shore: headland + lighthouse (left), a low harbor town (right) ---------- */
        var farC = '#9a6e96', farD = '#7a5888';
        // offshore wind turbines, tiny, far left
        ctx.strokeStyle = rgba('#d8a8b4', 0.7); ctx.lineWidth = Math.max(0.6, 0.45 * s); ctx.beginPath();
        for (i = 0; i < 4; i++) { var tx = w * (0.035 + i * 0.04), th = h * (0.016 - i * 0.0015), ta = 0.4 + i * 1.3; ctx.moveTo(tx, hz); ctx.lineTo(tx, hz - th); for (var bl = 0; bl < 3; bl++) { var ba = ta + bl * TAU / 3; ctx.moveTo(tx, hz - th); ctx.lineTo(tx + Math.cos(ba) * th * 0.45, hz - th + Math.sin(ba) * th * 0.45); } }
        ctx.stroke();
        // headland (soft hill with a bezier silhouette)
        ctx.fillStyle = lg(ctx, 0, hz - h * 0.03, 0, hz, [[0, '#8e6890'], [1, '#a87a94']]);
        ctx.beginPath(); ctx.moveTo(w * 0.17, hz + 1);
        ctx.bezierCurveTo(w * 0.22, hz - h * 0.012, w * 0.25, hz - h * 0.026, w * 0.31, hz - h * 0.027);
        ctx.bezierCurveTo(w * 0.36, hz - h * 0.028, w * 0.4, hz - h * 0.014, w * 0.47, hz + 1); ctx.closePath(); ctx.fill();
        // tiny dark pines on the headland
        ctx.fillStyle = '#6e5280'; ctx.beginPath();
        for (i = 0; i < 9; i++) { var px = w * (0.215 + i * 0.012 + r() * 0.006), pb = hz - h * (0.009 + 0.015 * Math.sin((px / w - 0.17) / 0.3 * PI * 0.9)), ph = (4 + r() * 4) * s; ctx.moveTo(px - ph * 0.3, pb + 1); ctx.quadraticCurveTo(px - ph * 0.08, pb - ph * 0.5, px, pb - ph); ctx.quadraticCurveTo(px + ph * 0.08, pb - ph * 0.5, px + ph * 0.3, pb + 1); }
        ctx.fill();
        // lighthouse
        var lhx = w * 0.345, lhb = hz - h * 0.025, lhH = h * 0.052, lw0 = 4.6 * s, lw1 = 3 * s;
        ctx.fillStyle = lg(ctx, lhx - lw0, 0, lhx + lw0, 0, [[0, '#c8a8b8'], [0.55, '#f2d8d0'], [1, '#ffe8d0']]);
        ctx.beginPath(); ctx.moveTo(lhx - lw0, lhb); ctx.quadraticCurveTo(lhx - lw0 * 0.86, lhb - lhH * 0.5, lhx - lw1, lhb - lhH); ctx.lineTo(lhx + lw1, lhb - lhH); ctx.quadraticCurveTo(lhx + lw0 * 0.86, lhb - lhH * 0.5, lhx + lw0, lhb); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#c86a7a'; ctx.beginPath(); ctx.moveTo(lhx - lw0 * 0.93, lhb - lhH * 0.36); ctx.lineTo(lhx + lw0 * 0.93, lhb - lhH * 0.36); ctx.lineTo(lhx + lw0 * 0.88, lhb - lhH * 0.5); ctx.lineTo(lhx - lw0 * 0.88, lhb - lhH * 0.5); ctx.fill();
        ctx.fillStyle = '#5a3a5a'; ctx.fillRect(lhx - lw1 * 1.35, lhb - lhH - 1 * s, lw1 * 2.7, 1.2 * s);
        ctx.fillStyle = '#fff2c0'; ctx.fillRect(lhx - lw1 * 0.8, lhb - lhH - 5 * s, lw1 * 1.6, 4 * s);
        ctx.fillStyle = '#5a3a5a'; ctx.beginPath(); ctx.moveTo(lhx - lw1 * 1.1, lhb - lhH - 5 * s); ctx.quadraticCurveTo(lhx, lhb - lhH - 10 * s, lhx + lw1 * 1.1, lhb - lhH - 5 * s); ctx.fill();
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, lhx, lhb - lhH - 3 * s, 16 * s, '#ffe0a0', 0.7); ctx.restore();
        // harbor town: gentle low buildings with pitched roofs, a steeple and a crane
        var tr = rng(41201), town = [];
        for (x = w * 0.5; x < w * 1.03;) { var bw = (7 + tr() * 11) * s, bh = h * (0.007 + tr() * 0.014) * (1 - Math.abs(x / w - 0.62) * 0.4); town.push([x, bw, bh, tr() < 0.6, tr()]); x += bw * (0.85 + tr() * 0.3); }
        ctx.fillStyle = mix(farC, '#ffb898', 0.15); ctx.beginPath();
        // hill behind the town
        ctx.moveTo(w * 0.47, hz + 1); ctx.bezierCurveTo(w * 0.62, hz - h * 0.016, w * 0.8, hz - h * 0.03, w * 1.02, hz - h * 0.026); ctx.lineTo(w * 1.02, hz + 1); ctx.fill();
        ctx.fillStyle = farD; ctx.beginPath();
        town.forEach(function (T) { var bx = T[0], bt = hz - T[2]; ctx.moveTo(bx, hz + 1); ctx.lineTo(bx, bt); if (T[3]) { ctx.lineTo(bx + T[1] / 2, bt - T[1] * 0.35); } ctx.lineTo(bx + T[1], bt); ctx.lineTo(bx + T[1], hz + 1); });
        ctx.fill();
        // steeple
        var sx0 = w * 0.7, sb = hz - h * 0.016; ctx.beginPath(); ctx.moveTo(sx0 - 2.2 * s, hz); ctx.lineTo(sx0 - 2.2 * s, sb); ctx.lineTo(sx0, sb - h * 0.022); ctx.lineTo(sx0 + 2.2 * s, sb); ctx.lineTo(sx0 + 2.2 * s, hz); ctx.fill();
        // a gentle port crane
        ctx.strokeStyle = farD; ctx.lineWidth = 1.1 * s; ctx.beginPath(); var crx = w * 0.88; ctx.moveTo(crx, hz); ctx.lineTo(crx, hz - h * 0.035); ctx.lineTo(crx - w * 0.06, hz - h * 0.03); ctx.moveTo(crx, hz - h * 0.035); ctx.lineTo(crx + w * 0.015, hz - h * 0.032); ctx.moveTo(crx - w * 0.05, hz - h * 0.031); ctx.lineTo(crx - w * 0.05, hz - h * 0.02); ctx.stroke();
        // warm windows in the town
        dots(ctx, 70, [['#ffd890', 0.9], ['#ffb870', 0.8]], function () { var T = town[(r() * town.length) | 0]; return [T[0] + T[1] * (0.2 + r() * 0.6), hz - T[2] * (0.25 + r() * 0.55), 0.55 * s, r() < 0.6 ? 0 : 1]; });
        // sunset rim along the roofs
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; band(ctx, w * 0.45, w, hz - h * 0.03, hz + h * 0.004, '#ff9a70', 0.18); ctx.restore();
        band(ctx, 0, w, hz - h * 0.02, hz + h * 0.004, '#ffc4a0', 0.35);
        mark('shore', ctx);
        /* ---------- harbor water ---------- */
        var wy1 = bank + h * 0.02;
        ctx.fillStyle = lg(ctx, 0, hz, 0, wy1, [[0, '#f0a890'], [0.35, '#b07898'], [1, '#6a5288']]); ctx.fillRect(0, hz, w, wy1 - hz);
        reflect(ctx, w, hz, wy1, 0.5, 2 * s, 1.2 / s, 3, 1.7);
        // sun path: a column of glitter widening toward us
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = lg(ctx, sun[0] - w * 0.12, 0, sun[0] + w * 0.12, 0, [[0, 'rgba(255,190,120,0)'], [0.5, 'rgba(255,200,130,0.3)'], [1, 'rgba(255,190,120,0)']]); ctx.fillRect(sun[0] - w * 0.12, hz, w * 0.24, wy1 - hz);
        ctx.restore();
        batch(ctx, 320, [['#fff4d0', 0.9 * s, 0.8], ['#ffc890', 1 * s, 0.6], ['#8a6aa0', 0.8 * s, 0.35]], function () {
          var p = Math.pow(r(), 0.9), yy = hz + 1.5 * s + p * (wy1 - hz), spread = w * (0.015 + p * 0.1), xx = sun[0] + (r() + r() - 1) * spread, l = (2 + p * 10) * s * (0.5 + r());
          var b = Math.abs(xx - sun[0]) < spread * 0.5 ? (r() < 0.6 ? 0 : 1) : (r() < 0.5 ? 1 : 2);
          return [xx - l / 2, yy, xx + l / 2, yy, b];
        });
        batch(ctx, 260, [['#5a4680', 0.8 * s, 0.3], ['#ffd0b0', 0.6 * s, 0.25]], function () { var p = r(), yy = hz + p * (wy1 - hz), xx = r() * w, l = (3 + p * 16) * s; return [xx, yy, xx + l, yy, r() < 0.6 ? 0 : 1]; });
        // sailboats
        function sailboat(bx, by, sz, lit) {
          ctx.fillStyle = '#4a3456'; ctx.beginPath(); ctx.moveTo(bx - sz * 0.7, by - sz * 0.16); ctx.quadraticCurveTo(bx, by - sz * 0.1, bx + sz * 0.8, by - sz * 0.2); ctx.quadraticCurveTo(bx + sz * 0.5, by + sz * 0.05, bx - sz * 0.5, by + sz * 0.02); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = '#4a3456'; ctx.lineWidth = Math.max(0.6, sz * 0.05); ctx.beginPath(); ctx.moveTo(bx, by - sz * 0.15); ctx.lineTo(bx, by - sz * 1.9); ctx.stroke();
          ctx.fillStyle = lit; ctx.beginPath(); ctx.moveTo(bx + sz * 0.05, by - sz * 1.85); ctx.quadraticCurveTo(bx + sz * 0.62, by - sz * 1.0, bx + sz * 0.72, by - sz * 0.32); ctx.lineTo(bx + sz * 0.05, by - sz * 0.3); ctx.closePath(); ctx.fill();
          ctx.fillStyle = mix(lit, '#8a5a8a', 0.4); ctx.beginPath(); ctx.moveTo(bx - sz * 0.05, by - sz * 1.5); ctx.quadraticCurveTo(bx - sz * 0.42, by - sz * 0.9, bx - sz * 0.5, by - sz * 0.32); ctx.lineTo(bx - sz * 0.05, by - sz * 0.3); ctx.closePath(); ctx.fill();
          ctx.globalAlpha = 0.25; ctx.fillStyle = lit; ctx.beginPath(); ctx.moveTo(bx + sz * 0.05, by + sz * 0.1); ctx.quadraticCurveTo(bx + sz * 0.5, by + sz * 0.5, bx + sz * 0.5, by + sz * 0.8); ctx.lineTo(bx + sz * 0.05, by + sz * 0.8); ctx.fill(); ctx.globalAlpha = 1;
        }
        sailboat(w * 0.44, hz + h * 0.012, 7 * s, '#ffe0c8');
        sailboat(w * 0.71, hz + h * 0.022, 9 * s, '#ffd6b8');
        for (i = 0; i < 5; i++) wisp(ctx, w * r(), hz + h * (0.006 + r() * 0.03), w * 0.45, h * 0.005, '#ffd0c0', 0.1, r);
        mark('water', ctx);
        /* ---------- the near bank behind the wall ---------- */
        var bankY = function (xx) { return bank - h * 0.006 * fbm(xx / w * 5, 41301, 3) + h * 0.004 * Math.sin(xx / w * 3); };
        ctx.fillStyle = lg(ctx, 0, bank - h * 0.01, 0, h * 0.54, [[0, '#6e7a5e'], [0.4, '#4e5e50'], [1, '#3a4a46']]);
        ctx.beginPath(); ctx.moveTo(0, h * 0.56); for (x = 0; x <= w + 4 * s; x += 4 * s) ctx.lineTo(x, bankY(x)); ctx.lineTo(w, h * 0.56); ctx.closePath(); ctx.fill();
        // sun rim on the bank lip and little rocks at the waterline
        ctx.strokeStyle = rgba('#ffc890', 0.6); ctx.lineWidth = 1.2 * s; ctx.beginPath(); for (x = 0; x <= w + 4 * s; x += 4 * s) { if (!x) ctx.moveTo(x, bankY(x)); else ctx.lineTo(x, bankY(x)); } ctx.stroke();
        dabs(ctx, 40, [['#8a7a8a', 0.8], ['#e8b8a0', 0.6]], function () { var xx = r() * w; return [xx, bankY(xx) + 1 * s, (2 + r() * 4) * s, (1 + r() * 1.5) * s, r() < 0.6 ? 0 : 1, (r() - 0.5) * 0.3]; });
        // small far cherries and shrubs on the bank
        var spal = ['#2e3a3a', '#3e4e44', '#5a6a52', '#8a8a62', '#e8b880'];
        for (x = -w * 0.02; x < w * 1.02; x += w * (0.05 + r() * 0.05)) { if (Math.abs(x - w * 0.5) < w * 0.06) continue; bush(ctx, x, bankY(x) + h * 0.012, (6 + r() * 6) * s, spal, r, 0.3, -0.9, 0.7, 0.6); }
        [[0.3, 0.432, 0.06], [0.73, 0.436, 0.052], [0.62, 0.448, 0.035]].forEach(function (Q, j) {
          var tx2 = w * Q[0], ty2 = h * Q[1], R2 = w * Q[2];
          ctx.fillStyle = '#3a2a36'; ctx.beginPath(); trunkPath(ctx, tx2, h * (Q[1] + 0.03), tx2 + R2 * 0.1, ty2, 3 * s, 1.5 * s, R2 * 0.1, true); ctx.fill();
          var cl = []; for (k = 0; k < 6; k++) cl.push([tx2 + (r() - 0.5) * R2 * 1.4, ty2 - R2 * 0.15 + (r() - 0.5) * R2 * 0.6, R2 * (0.35 + r() * 0.2)]);
          blossom(ctx, cl, ['#8a5a7a', '#b8789a', '#e2a0b4', '#ffc8c0', '#fff0e0'], r, s, 0.6, -0.6, 0.8);
        });
        mark('bank', ctx);
        /* ---------- lawn (upper terrace) ---------- */
        var wallBot = function (xx) { return L.wallY(xx) + L.wallH(xx); };
        ctx.fillStyle = lg(ctx, 0, h * 0.5, 0, h, [[0, '#8a8a66'], [0.25, '#6c7458'], [0.55, '#545e4e'], [1, '#33383a']]);
        ctx.beginPath(); ctx.moveTo(0, h); for (x = 0; x <= w + 4 * s; x += 4 * s) ctx.lineTo(x, wallBot(x) - 1 * s); ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
        // soft painterly variation (big, low-contrast dabs)
        dabs(ctx, 260, [['#9a9470', 0.12], ['#4a5448', 0.12], ['#b0907a', 0.08]], function () { var yy = lerp(h * 0.52, h, r()), xx = r() * w, p = (yy - h * 0.5) / (h * 0.5); return [xx, yy, (14 + r() * 30) * s * (0.6 + p), (3 + r() * 6) * s * (0.6 + p), (r() * 3) | 0, (r() - 0.5) * 0.15]; });
        // warm light from the low sun spilling through the gate down the back path, and skylight on the lawn crest
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = lg(ctx, 0, h * 0.5, 0, h * 0.64, [[0, 'rgba(255,190,130,0.16)'], [1, 'rgba(255,190,130,0)']]); ctx.fillRect(0, h * 0.5, w, h * 0.14);
        ctx.restore();
        // long soft tree shadows reaching toward us (sun is behind)
        ctx.save(); ctx.globalAlpha = 0.25;
        haze(ctx, L.treeL.x - w * 0.12, L.treeL.yb - h * 0.012, L.treeL.x + w * 0.16, L.treeL.yb + h * 0.06, '#24302e', 0.8);
        haze(ctx, L.treeR.x - w * 0.18, L.treeR.yb - h * 0.012, L.treeR.x + w * 0.1, L.treeR.yb + h * 0.06, '#24302e', 0.8);
        ctx.restore();
        // fine grass texture: short brushed blades, very low contrast so taps stay readable
        batch(ctx, 2600, [['#a8a47c', 0.6 * s, 0.26], ['#3e4a40', 0.7 * s, 0.25], ['#d0b08a', 0.5 * s, 0.16]], function () {
          var yy = lerp(h * 0.51, h * 0.86, Math.pow(r(), 0.9)), xx = r() * w; if (yy < wallBot(xx)) return null;
          var p = (yy - h * 0.5) / (h * 0.36), l = (1.5 + p * 4 + r() * 2) * s, lx = (r() - 0.5) * l * 0.6;
          return [xx, yy, xx + lx, yy - l, r() < 0.45 ? 0 : r() < 0.75 ? 1 : 2, xx + lx * 0.2, yy - l * 0.6];
        });
        // fallen petals scattered on the grass near the trees
        dots(ctx, 260, [['#ffc0cc', 0.55], ['#fff0f0', 0.45]], function () { var left = r() < 0.55, xx = left ? Math.pow(r(), 1.4) * w * 0.45 : w - Math.pow(r(), 1.4) * w * 0.4, yy = lerp(h * 0.53, h * 0.84, r()); if (inExcl(xx / w, yy / h, 0.08, 0.035)) return null; return [xx, yy, (0.5 + r() * 0.8) * s, r() < 0.7 ? 0 : 1]; });
        mark('lawn', ctx);
        /* ---------- the low curved stone wall with ivy ---------- */
        var wr = rng(41401);
        // wall face (shadowed: the sun is behind it) - built from rows of irregular stones
        ctx.fillStyle = '#5a4e66'; ctx.beginPath();
        ctx.moveTo(0, L.wallY(0)); for (x = 0; x <= w + 4 * s; x += 4 * s) ctx.lineTo(x, L.wallY(x)); for (x = w + 4 * s; x >= 0; x -= 4 * s) ctx.lineTo(x, wallBot(x)); ctx.closePath(); ctx.fill();
        var stoneCols = ['#7a6e84', '#8a7c8c', '#6c6278', '#948494', '#7e7088'], SB = [[], [], [], [], []];
        for (var row = 0; row < 3; row++) {
          for (x = -wr() * 10 * s; x < w + 10 * s;) {
            var y0 = L.wallY(x) + L.wallH(x) * (0.08 + row * 0.31), sh = L.wallH(x) * 0.28, swd = (8 + wr() * 9) * s * (0.8 + Math.abs(x / w - 0.5));
            if (x > L.gate[0] && x < L.gate[1]) { x += swd; continue; }
            SB[(wr() * 5) | 0].push([x + swd / 2, y0 + sh / 2 + (wr() - 0.5) * 0.6 * s, swd * 0.46, sh * 0.5, (wr() - 0.5) * 0.08, (wr() * 999) | 0]);
            x += swd + 0.8 * s;
          }
        }
        for (k = 0; k < 5; k++) { ctx.fillStyle = stoneCols[k]; ctx.beginPath(); SB[k].forEach(function (Q) { flag(ctx, Q[0], Q[1], Q[2], Q[3], Q[5], 0.25); }); ctx.fill(); }
        // a warm skylight on the upper face of each stone
        ctx.fillStyle = rgba('#e8b8a8', 0.28); ctx.beginPath(); SB.forEach(function (B) { B.forEach(function (Q) { lens(ctx, Q[0] - Q[2] * 0.8, Q[1] - Q[3] * 0.45, Q[2] * 1.6, Q[3] * 0.3, 0); }); }); ctx.fill();
        // coping stones along the top, rim-lit by the sunset
        ctx.fillStyle = '#9a8a98'; ctx.beginPath();
        for (x = 0; x <= w + 4 * s; x += 4 * s) { var yt = L.wallY(x) - 2.2 * s; if (!x) ctx.moveTo(x, yt); else ctx.lineTo(x, yt); }
        for (x = w + 4 * s; x >= 0; x -= 4 * s) ctx.lineTo(x, L.wallY(x) + 2.2 * s);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = rgba('#ffd2a8', 0.85); ctx.lineWidth = 1.2 * s; ctx.beginPath();
        for (x = 0; x <= w + 4 * s; x += 4 * s) { var yt2 = L.wallY(x) - 2.2 * s; if (!x) ctx.moveTo(x, yt2); else ctx.lineTo(x, yt2); }
        ctx.stroke();
        ctx.strokeStyle = rgba('#3a3040', 0.5); ctx.lineWidth = 0.8 * s; ctx.beginPath();
        for (x = wr() * 20 * s; x < w; x += (14 + wr() * 16) * s) { ctx.moveTo(x, L.wallY(x) - 2 * s); ctx.lineTo(x + 0.5 * s, L.wallY(x) + 2 * s); }
        ctx.stroke();
        // shadow line where the wall meets the lawn
        ctx.fillStyle = rgba('#1e2228', 0.35); ctx.beginPath(); for (x = 0; x <= w + 4 * s; x += 4 * s) ctx.lineTo(x, wallBot(x) - 0.5 * s); for (x = w + 4 * s; x >= 0; x -= 4 * s) ctx.lineTo(x, wallBot(x) + 3 * s); ctx.fill();
        // the gate: two short pillars, the back path between them
        [L.gate[0] - w * 0.012, L.gate[1] + w * 0.012].forEach(function (gx, j) {
          var gy = L.wallY(gx), pw = 5.5 * s, top = gy - h * 0.012, bot = wallBot(gx) + 1 * s;
          ctx.fillStyle = lg(ctx, gx - pw, 0, gx + pw, 0, [[0, '#6a5e74'], [0.6, '#8a7c8c'], [1, '#c8a0a0']]);
          ctx.beginPath(); ctx.moveTo(gx - pw, bot); ctx.lineTo(gx - pw * 0.92, top); ctx.lineTo(gx + pw * 0.92, top); ctx.lineTo(gx + pw, bot); ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#a89aa4'; ctx.beginPath(); ctx.moveTo(gx - pw * 1.25, top + 1.5 * s); ctx.quadraticCurveTo(gx, top - 2.5 * s, gx + pw * 1.25, top + 1.5 * s); ctx.lineTo(gx + pw * 1.2, top + 3 * s); ctx.lineTo(gx - pw * 1.2, top + 3 * s); ctx.fill();
          ctx.strokeStyle = rgba('#ffd2a8', 0.8); ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.moveTo(gx - pw * 1.2, top + 1 * s); ctx.quadraticCurveTo(gx, top - 2.5 * s, gx + pw * 1.2, top + 1 * s); ctx.stroke();
        });
        // ivy: trailing strands and leafy mats along the top
        var ivy = ['#203028', '#2e4632', '#466a3e', '#6e8e4e', '#c8c078'], IB = [[], [], [], [], []], vines = [];
        for (k = 0; k < 26; k++) {
          var vx = wr() * w; if (vx > L.gate[0] - w * 0.03 && vx < L.gate[1] + w * 0.03) continue;
          var vy = L.wallY(vx) - 1 * s, vl = L.wallH(vx) * (0.4 + wr() * 0.9), vdx = (wr() - 0.5) * 8 * s;
          vines.push([vx, vy, vx + vdx * 0.5, vy + vl * 0.5, vx + vdx, vy + vl]);
          var nlv = 4 + ((vl / (3 * s)) | 0);
          for (var q = 0; q < nlv; q++) { var tq = q / nlv, lxq = bez(vx, vx + vdx * 0.5, vx + vdx, tq) + (q % 2 ? 1 : -1) * 1.4 * s, lyq = bez(vy, vy + vl * 0.5, vy + vl, tq), sz = (2.4 + wr() * 1.6) * s * (1 - tq * 0.4); IB[q < 2 ? 3 : (wr() < 0.5 ? 1 : 2)].push([lxq, lyq, sz, sz * 0.5, PI / 2 + (q % 2 ? -1 : 1) * (0.6 + wr() * 0.6)]); }
          // mat along the coping
          for (q = 0; q < 10; q++) { var mx2 = vx + (wr() - 0.5) * 18 * s, my2 = L.wallY(mx2) - (wr() * 3 - 0.5) * s, ms = (2.2 + wr() * 1.8) * s; var mb = my2 < L.wallY(mx2) - 1.2 * s ? (wr() < 0.4 ? 4 : 3) : (wr() < 0.5 ? 2 : 0); IB[mb].push([mx2, my2, ms, ms * 0.5, wr() * TAU]); }
        }
        ctx.strokeStyle = '#2a3a2c'; ctx.lineWidth = 0.6 * s; ctx.beginPath(); vines.forEach(function (V) { ctx.moveTo(V[0], V[1]); ctx.quadraticCurveTo(V[2], V[3], V[4], V[5]); }); ctx.stroke();
        for (k = 0; k < 5; k++) { ctx.fillStyle = ivy[k]; ctx.beginPath(); IB[k].forEach(function (Q) { leafPath(ctx, Q[0], Q[1], Q[2], Q[3], Q[4], true); }); ctx.fill(); }
        mark('wall', ctx);
        /* ---------- paths: the back path (pool to gate) and the winding path (bottom to pool) ---------- */
        var PALE = ['#dccab8', '#d4c0ae', '#e2d0bc', '#ccb6a4'];
        ctx.fillStyle = lg(ctx, 0, h * 0.5, 0, L.pool.y, [[0, '#c8b4a4'], [1, '#d8c4b0']]);
        ctx.beginPath(); ctx.moveTo(w * 0.47, wallBot(w * 0.47)); ctx.quadraticCurveTo(w * 0.465, h * 0.55, w * 0.455, L.pool.y - L.pool.ry); ctx.lineTo(w * 0.545, L.pool.y - L.pool.ry); ctx.quadraticCurveTo(w * 0.535, h * 0.55, w * 0.53, wallBot(w * 0.53)); ctx.closePath(); ctx.fill();
        // gravel between the pillars (bridging under the gate)
        ctx.fillRect(w * 0.47, L.wallY(w * 0.5) - 0.5 * s, w * 0.06, L.wallH(w * 0.5) + 2 * s);
        ctx.fillStyle = rgba('#ffd8a8', 0.35); ctx.fillRect(w * 0.475, L.wallY(w * 0.5) - 0.5 * s, w * 0.05, 1.2 * s);
        // the main winding path
        var N = 48, LP = [], RP = [];
        for (i = 0; i <= N; i++) {
          var tp = i / N, pp = L.pathAt(tp), hw = L.pathHW(pp[1]) * (1 + 0.06 * (fbm(tp * 6, 41501, 3) - 0.5));
          LP.push([pp[0] - hw, pp[1]]); RP.push([pp[0] + hw * (1 + 0.05 * (fbm(tp * 6, 41502, 3) - 0.5)), pp[1]]);
        }
        function pathShape() { ctx.beginPath(); ctx.moveTo(LP[0][0], LP[0][1]); for (var j = 1; j <= N; j++) ctx.lineTo(LP[j][0], LP[j][1]); for (j = N; j >= 0; j--) ctx.lineTo(RP[j][0], RP[j][1]); ctx.closePath(); }
        pathShape(); ctx.fillStyle = lg(ctx, 0, L.pool.y, 0, h, [[0, '#dccab6'], [0.4, '#d2bea8'], [1, '#a8927e']]); ctx.fill();
        ctx.save(); pathShape(); ctx.clip();
        // flagstones: irregular, low contrast
        var FB = [[], [], [], []], fr = rng(41601);
        for (y = L.pool.y + L.pool.ry * 0.6; y < h * 1.03;) {
          var pr = clamp((y - h * 0.64) / (h * 0.39), 0, 1), fsz = lerp(5, 22, pr) * s, ty3 = 0;
          // find t for this y (monotone along the path)
          var tlo = 0, thi = 1; for (k = 0; k < 18; k++) { var tm = (tlo + thi) / 2; if (L.pathAt(tm)[1] > y) tlo = tm; else thi = tm; } ty3 = L.pathAt(tlo);
          var hwy = L.pathHW(y);
          for (x = ty3[0] - hwy - fr() * fsz; x < ty3[0] + hwy + fsz;) { var fwd = fsz * (0.9 + fr() * 0.7); FB[(fr() * 4) | 0].push([x + fwd / 2, y + (fr() - 0.5) * fsz * 0.12, fwd * 0.44, fsz * 0.2, (fr() * 999) | 0]); x += fwd; }
          y += fsz * 0.48;
        }
        for (k = 0; k < 4; k++) { ctx.fillStyle = PALE[k]; ctx.beginPath(); FB[k].forEach(function (Q) { flag(ctx, Q[0], Q[1], Q[2], Q[3], Q[4], 0.3); }); ctx.fill(); }
        ctx.fillStyle = rgba('#fff4e0', 0.12); ctx.beginPath(); FB.forEach(function (B) { B.forEach(function (Q) { lens(ctx, Q[0] - Q[2] * 0.7, Q[1] - Q[3] * 0.35, Q[2] * 1.3, Q[3] * 0.3, 0); }); }); ctx.fill();
        ctx.restore();
        // grass tufts nibbling the path edges so it sits in the lawn
        batch(ctx, 700, [['#5e7452', 0.8 * s, 0.6], ['#8a9a6a', 0.6 * s, 0.5]], function () {
          var tp = r(), j = Math.round(tp * N), side = r() < 0.5, E = side ? LP[j] : RP[j], p = clamp((E[1] - h * 0.64) / (h * 0.39), 0, 1), l = (2 + p * 6) * s * (0.6 + r() * 0.6);
          var ex = E[0] + (side ? 1 : -1) * r() * l * 0.5, lx = (side ? 1 : -1) * l * 0.3 * r();
          return [ex, E[1] + r() * 2 * s, ex + lx, E[1] - l, r() < 0.6 ? 0 : 1, ex + lx * 0.3, E[1] - l * 0.6];
        });
        mark('path', ctx);
        /* ---------- the reflecting pool and the memorial stone ---------- */
        var PL = L.pool, pr2 = rng(41701), ringO = 1.2, ringH = 3.4 * s;
        // outer vertical face of the ring (front half visible)
        ctx.fillStyle = lg(ctx, 0, PL.y, 0, PL.y + PL.ry * ringO + ringH, [[0, '#5a4c64'], [1, '#463a52']]);
        ctx.beginPath(); qell(ctx, PL.x, PL.y + ringH, PL.rx * ringO, PL.ry * ringO, 0); ctx.fill();
        // rim stones (top surfaces): irregular segments around the ellipse
        var RS = [[], [], [], []], nseg = 26;
        for (k = 0; k < nseg; k++) {
          var a0 = k / nseg * TAU + pr2() * 0.02, a1 = (k + 1) / nseg * TAU - 0.012 - pr2() * 0.01, ri = 1.0, ro = ringO - pr2() * 0.02;
          RS[(pr2() * 4) | 0].push([a0, a1, ri, ro]);
        }
        var rimCols = ['#b8a2a8', '#c8b0b0', '#a8949e', '#d4bab4'];
        for (k = 0; k < 4; k++) {
          ctx.fillStyle = rimCols[k]; ctx.beginPath();
          RS[k].forEach(function (Q) {
            var am = (Q[0] + Q[1]) / 2;
            ctx.moveTo(PL.x + Math.cos(Q[0]) * PL.rx * Q[2], PL.y + Math.sin(Q[0]) * PL.ry * Q[2]);
            ctx.quadraticCurveTo(PL.x + Math.cos(am) * PL.rx * Q[2] * 1.01, PL.y + Math.sin(am) * PL.ry * Q[2] * 1.01, PL.x + Math.cos(Q[1]) * PL.rx * Q[2], PL.y + Math.sin(Q[1]) * PL.ry * Q[2]);
            ctx.lineTo(PL.x + Math.cos(Q[1]) * PL.rx * Q[3], PL.y + Math.sin(Q[1]) * PL.ry * Q[3]);
            ctx.quadraticCurveTo(PL.x + Math.cos(am) * PL.rx * Q[3] * 1.01, PL.y + Math.sin(am) * PL.ry * Q[3] * 1.01, PL.x + Math.cos(Q[0]) * PL.rx * Q[3], PL.y + Math.sin(Q[0]) * PL.ry * Q[3]);
            ctx.closePath();
          });
          ctx.fill();
        }
        // sunset light on the far rim, shade on the near rim
        ctx.save(); ctx.beginPath(); qell(ctx, PL.x, PL.y, PL.rx * ringO, PL.ry * ringO, 0); ctx.clip();
        ctx.fillStyle = lg(ctx, 0, PL.y - PL.ry * ringO, 0, PL.y + PL.ry * ringO, [[0, 'rgba(255,200,150,0.35)'], [0.5, 'rgba(255,200,150,0)'], [1, 'rgba(60,40,80,0.25)']]); ctx.fillRect(PL.x - PL.rx * 1.3, PL.y - PL.ry * 1.3, PL.rx * 2.6, PL.ry * 2.6);
        ctx.restore();
        // water
        ctx.save(); ctx.beginPath(); qell(ctx, PL.x, PL.y + 0.8 * s, PL.rx * 0.985, PL.ry * 0.96, 0); ctx.clip();
        ctx.fillStyle = lg(ctx, 0, PL.y - PL.ry, 0, PL.y + PL.ry, [[0, '#f2b896'], [0.35, '#c88aa0'], [0.7, '#6e5890'], [1, '#463c72']]); ctx.fillRect(PL.x - PL.rx, PL.y - PL.ry, PL.rx * 2, PL.ry * 2 + 2 * s);
        // inner shadow under the far rim
        ctx.fillStyle = lg(ctx, 0, PL.y - PL.ry, 0, PL.y - PL.ry * 0.6, [[0, 'rgba(50,30,60,0.55)'], [1, 'rgba(50,30,60,0)']]); ctx.fillRect(PL.x - PL.rx, PL.y - PL.ry, PL.rx * 2, PL.ry * 0.5);
        // sky ripples
        batch(ctx, 120, [['#ffd8c0', 0.7 * s, 0.35], ['#3a3266', 0.8 * s, 0.3]], function () { var a = pr2() * TAU, d = Math.sqrt(pr2()), xx = PL.x + Math.cos(a) * PL.rx * d, yy = PL.y + Math.sin(a) * PL.ry * d, l = (3 + pr2() * 8) * s; return [xx - l / 2, yy, xx + l / 2, yy, yy < PL.y ? 0 : (pr2() < 0.5 ? 0 : 1)]; });
        // lily pads with tiny blooms near the edge
        for (k = 0; k < 6; k++) {
          var la = [2.4, 2.9, 0.4, 0.8, 3.5, -0.3][k], lr0 = 0.72 + pr2() * 0.18, lpx = PL.x + Math.cos(la) * PL.rx * lr0, lpy = PL.y + Math.sin(la) * PL.ry * lr0, lsz = (5 + pr2() * 3) * s;
          ctx.fillStyle = '#3e6248'; ctx.beginPath(); var nt = pr2() * TAU; ctx.moveTo(lpx, lpy); ctx.ellipse(lpx, lpy, lsz, lsz * 0.38, 0, nt + 0.35, nt + TAU - 0.05); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = rgba('#a8c890', 0.5); ctx.lineWidth = 0.7 * s; ctx.beginPath(); ctx.ellipse(lpx, lpy, lsz, lsz * 0.38, 0, PI * 1.1, PI * 1.9); ctx.stroke();
          if (k % 2 === 0) { ctx.fillStyle = '#ffd8e4'; ctx.beginPath(); for (var pt = 0; pt < 5; pt++) lens(ctx, lpx + 1.5 * s, lpy - 0.5 * s, 3 * s, 1 * s, -PI / 2 + (pt - 2) * 0.45); ctx.fill(); }
        }
        // the stone's reflection
        var SN = L.stone, sx = SN.x, sy = SN.y, sW = SN.W, sH = SN.H;
        ctx.globalAlpha = 0.22; ctx.fillStyle = '#3a2e50'; ctx.beginPath(); ctx.moveTo(sx - sW, sy); ctx.bezierCurveTo(sx - sW * 1.05, sy + sH * 0.14, sx - sW * 0.6, sy + sH * 0.26, sx, sy + sH * 0.28); ctx.bezierCurveTo(sx + sW * 0.7, sy + sH * 0.26, sx + sW * 1.05, sy + sH * 0.12, sx + sW, sy); ctx.fill(); ctx.globalAlpha = 1;
        ctx.restore();
        // little island of rounded stones and moss under the memorial
        var isl = [[0, 0.02, 0.32, '#7a6a7e'], [-0.2, 0.01, 0.18, '#8a7888'], [0.22, 0.015, 0.2, '#6e6074'], [-0.08, 0.035, 0.22, '#5e526a'], [0.1, 0.04, 0.2, '#6a5e72']];
        isl.forEach(function (I, j) { ctx.fillStyle = I[3]; ctx.beginPath(); blob(ctx, sx + PL.rx * I[0], sy + PL.ry * I[1] * 6, PL.rx * I[2] * 0.5, PL.ry * I[2] * 0.62, 41750 + j, 0.18, 8); ctx.fill(); });
        dabs(ctx, 40, [['#5a7a48', 0.85], ['#8aa060', 0.75]], function () { return [sx + (pr2() - 0.5) * PL.rx * 0.45, sy + PL.ry * (0.02 + pr2() * 0.14), (1.2 + pr2() * 2) * s, (0.8 + pr2()) * s, pr2() < 0.6 ? 0 : 1, pr2()]; });
        // the memorial stone: a soft-shouldered upright stone, rim-lit by the sunset, warmed from below by lanterns
        function stonePath() {
          ctx.beginPath(); ctx.moveTo(sx - sW, sy);
          ctx.bezierCurveTo(sx - sW * 1.1, sy - sH * 0.45, sx - sW * 1.02, sy - sH * 0.88, sx - sW * 0.42, sy - sH * 0.99);
          ctx.bezierCurveTo(sx + sW * 0.15, sy - sH * 1.08, sx + sW * 0.86, sy - sH * 0.97, sx + sW * 0.98, sy - sH * 0.72);
          ctx.bezierCurveTo(sx + sW * 1.08, sy - sH * 0.42, sx + sW * 1.04, sy - sH * 0.16, sx + sW * 0.96, sy);
          ctx.quadraticCurveTo(sx, sy + sH * 0.05, sx - sW, sy); ctx.closePath();
        }
        stonePath(); ctx.fillStyle = lg(ctx, sx - sW, 0, sx + sW, 0, [[0, '#5e526e'], [0.45, '#7e7088'], [0.85, '#a08a98'], [1, '#e8b89c']]); ctx.fill();
        ctx.save(); stonePath(); ctx.clip();
        ctx.fillStyle = lg(ctx, 0, sy - sH, 0, sy, [[0, 'rgba(255,210,170,0.25)'], [0.5, 'rgba(255,210,170,0)'], [1, 'rgba(40,30,50,0.2)']]); ctx.fillRect(sx - sW * 1.2, sy - sH * 1.1, sW * 2.4, sH * 1.2);
        dabs(ctx, 70, [['#9a8ca0', 0.35], ['#4e445e', 0.3], ['#d0b0a8', 0.25]], function () { return [sx + (pr2() - 0.5) * sW * 2, sy - pr2() * sH, (1 + pr2() * 3) * s, (0.6 + pr2() * 1.2) * s, (pr2() * 3) | 0, pr2() * PI]; });
        ctx.globalCompositeOperation = 'lighter'; glow(ctx, sx, sy + 2 * s, sH * 0.8, '#ffa860', 0.42); ctx.globalCompositeOperation = 'source-over';
        ctx.restore();
        ctx.strokeStyle = rgba('#ffd8b0', 0.8); ctx.lineWidth = 1.1 * s; ctx.beginPath(); ctx.moveTo(sx + sW * 0.05, sy - sH * 1.035); ctx.bezierCurveTo(sx + sW * 0.6, sy - sH * 1.02, sx + sW * 0.95, sy - sH * 0.9, sx + sW * 1.0, sy - sH * 0.6); ctx.stroke();
        // carving: a sprout inside a ring of leaves, and three lines of names
        function carve(fn, lw) { ctx.save(); ctx.translate(0.55 * s, 0.6 * s); ctx.strokeStyle = rgba('#e8c8c0', 0.45); ctx.lineWidth = lw; ctx.beginPath(); fn(); ctx.stroke(); ctx.restore(); ctx.strokeStyle = rgba('#2e2440', 0.75); ctx.lineWidth = lw; ctx.beginPath(); fn(); ctx.stroke(); }
        var ex0 = sx - sW * 0.04, ey0 = sy - sH * 0.66, er = sW * 0.5;
        ctx.lineCap = 'round';
        carve(function () { ctx.moveTo(ex0 - er, ey0 + er * 0.2); ctx.bezierCurveTo(ex0 - er * 1.05, ey0 - er * 0.9, ex0 - er * 0.2, ey0 - er * 1.2, ex0 + er * 0.1, ey0 - er * 1.1); ctx.moveTo(ex0 + er, ey0 + er * 0.2); ctx.bezierCurveTo(ex0 + er * 1.05, ey0 - er * 0.9, ex0 + er * 0.4, ey0 - er * 1.15, ex0 + er * 0.2, ey0 - er * 1.12); ctx.moveTo(ex0 - er * 0.8, ey0 + er * 0.6); ctx.quadraticCurveTo(ex0, ey0 + er, ex0 + er * 0.8, ey0 + er * 0.6); }, 0.9 * s);
        carve(function () { ctx.moveTo(ex0, ey0 + er * 0.55); ctx.quadraticCurveTo(ex0 + er * 0.1, ey0, ex0, ey0 - er * 0.5); }, 1.1 * s);
        ctx.fillStyle = rgba('#2e2440', 0.7); ctx.beginPath(); leafPath(ctx, ex0, ey0 - er * 0.15, er * 0.62, er * 0.22, -PI * 0.82, false); leafPath(ctx, ex0 + er * 0.05, ey0 - er * 0.35, er * 0.6, er * 0.2, -PI * 0.2, false); ctx.fill();
        carve(function () { [[0.36, 0.62], [0.27, 0.5], [0.19, 0.56]].forEach(function (Q) { var yy = sy - sH * Q[0]; ctx.moveTo(sx - sW * Q[1], yy); ctx.lineTo(sx + sW * Q[1] * 0.92, yy); }); }, 0.7 * s);
        ctx.lineCap = 'butt';
        // tributes at the base: tiny flowers
        dots(ctx, 40, [['#ffffff', 0.9], ['#ffb0c4', 0.9], ['#ffe08a', 0.9], ['#c8b0ff', 0.85]], function () { return [sx + (pr2() - 0.5) * sW * 3.2, sy + (pr2() * 0.5 - 0.1) * PL.ry * 0.3 + 1 * s, (0.8 + pr2() * 0.9) * s, (pr2() * 4) | 0]; });
        mark('pool', ctx);
        /* ---------- blossoming trees (kept to the edges so the middle stays open) ---------- */
        var CH = ['#7a4870', '#b06890', '#e898b2', '#ffc6c6', '#fff2e6'], BARK = ['#c88a78', '#5a3a48', '#2e1e2a'];
        function limbs(base, fork, targets, tw, r0, segs, tips, nTw) {
          var tb = (r0() - 0.5) * tw * 2;
          segs.push([base[0], base[1], fork[0], fork[1], tw, tw * 0.5, tb, 5]);
          targets.forEach(function (T, ti) {
            var u = 0.5 + 0.5 * ((ti * 0.37 + r0() * 0.3) % 1), f0 = [bez(base[0], (base[0] + fork[0]) / 2 + tb, fork[0], u), bez(base[1], (base[1] + fork[1]) / 2, fork[1], u)];
            var tx5 = T[0] * w, ty5 = T[1] * h, wd = tw * lerp(0.5, 0.32, u) * (0.9 + r0() * 0.2), a = Math.atan2(ty5 - f0[1], tx5 - f0[0]), len5 = Math.hypot(tx5 - f0[0], ty5 - f0[1]);
            var sg = Math.abs(tx5 - f0[0]) < 4 * s ? (r0() < 0.5 ? -1 : 1) : (tx5 > f0[0] ? 1 : -1);
            segs.push([f0[0], f0[1], tx5, ty5, wd, wd * 0.3, sg * len5 * (0.1 + r0() * 0.14), 3]);
            tips.push([lerp(f0[0], tx5, 0.62), lerp(f0[1], ty5, 0.62), 1, a]);
            for (var k2 = 0; k2 < (nTw || 3); k2++) {
              var na = a + (k2 - ((nTw || 3) - 1) / 2) * (0.5 + r0() * 0.3), ln = h * (0.016 + r0() * 0.016);
              var ex = tx5 + Math.cos(na) * ln, ey = ty5 + Math.sin(na) * ln;
              segs.push([tx5, ty5, ex, ey, wd * 0.32, wd * 0.1, (r0() - 0.5) * ln * 0.4, 1]);
              tips.push([ex, ey, -1, na]);
            }
            tips.push([tx5, ty5, 0, a]);
          });
        }
        // left: a broad cherry
        var tL = L.treeL, segL = [], tipL = [], tr1 = rng(41801);
        limbs([tL.x, tL.yb], [tL.x + w * 0.018, h * 0.53], [[0.0, 0.375], [0.085, 0.335], [0.175, 0.35], [0.245, 0.415], [-0.05, 0.44], [0.14, 0.44]], 16 * s, tr1, segL, tipL);
        var CL = [], CB = [];
        tipL.forEach(function (T) { var R = (T[2] < 0 ? 17 : 22) * s * (0.8 + tr1() * 0.4); (T[2] === 1 || tr1() < 0.3 ? CB : CL).push([T[0] + (tr1() - 0.5) * 6 * s, T[1] - 3 * s, R]); });
        for (k = 0; k < 16; k++) { var ca = tr1() * TAU, cd = Math.sqrt(tr1()); (k % 3 ? CB : CL).push([w * 0.1 + Math.cos(ca) * w * 0.14 * cd, h * 0.388 + Math.sin(ca) * h * 0.055 * cd, 22 * s * (0.8 + tr1() * 0.4)]); }
        drawBranches(ctx, segL, BARK, 1, 4, 5);
        blossom(ctx, CB, ['#5e3a62', '#8a5482', '#c47c9c', '#e8a4b0', '#ffd8d0'], tr1, s, 0.85, -0.4, 0.9);
        drawBranches(ctx, segL, BARK, 1, 0, 3);
        blossom(ctx, CL, CH, tr1, s, 0.85, -0.4, 1);
        // right: a magnolia with cup-shaped blooms on open branches
        var tRr = L.treeR, segR = [], tipR = [], tr2 = rng(41901);
        limbs([tRr.x, tRr.yb], [tRr.x - w * 0.025, h * 0.525], [[0.985, 0.335], [0.885, 0.33], [0.8, 0.37], [0.765, 0.43], [1.04, 0.42], [0.86, 0.405], [0.935, 0.38]], 14 * s, tr2, segR, tipR, 4);
        var MG = ['#6a4870', '#a46a92', '#e0a6c4', '#ffd6e0', '#fff6f0'], MB = [];
        tipR.forEach(function (T) { if (tr2() < 0.2) return; MB.push([T[0], T[1] - 2 * s, 14 * s * (0.8 + tr2() * 0.5)]); });
        blossom(ctx, MB, MG, tr2, s, -0.85, -0.4, 0.55, 0.5);
        drawBranches(ctx, segR, ['#b88a88', '#4e3446', '#2a1c28'], -1, 0, 5);
        // young leaves
        var LV = [[], []];
        tipR.forEach(function (T) { for (k = 0; k < 2; k++) LV[k].push([T[0] + (tr2() - 0.5) * 6 * s, T[1] + (tr2() - 0.2) * 4 * s, (4 + tr2() * 3) * s, (1.4 + tr2() * 0.6) * s, T[3] + (tr2() - 0.5) * 2]); });
        ['#3e5a40', '#7a9a5a'].forEach(function (c, j) { ctx.fillStyle = c; ctx.beginPath(); LV[j].forEach(function (Q) { lens(ctx, Q[0], Q[1], Q[2], Q[3], Q[4]); }); ctx.fill(); });
        // cup blooms: outer pink petals, inner white petal
        var FLR = [];
        tipR.forEach(function (T) {
          var nf = T[2] < 0 ? 3 : T[2] === 0 ? 3 : 2;
          for (k = 0; k < nf; k++) FLR.push([T[0] + (tr2() - 0.5) * 12 * s, T[1] + (tr2() - 0.5) * 9 * s, (6 + tr2() * 3.5) * s, (tr2() - 0.5) * 0.6]);
        });
        FLR.sort(function (A, B) { return A[1] - B[1]; });
        FLR.forEach(function (F) {
          var x0 = F[0], y0b = F[1], z = F[2], t0 = F[3];
          ctx.fillStyle = '#c87aa2'; ctx.beginPath(); lens(ctx, x0, y0b, z, z * 0.36, -PI / 2 + t0 - 0.42); lens(ctx, x0, y0b, z, z * 0.36, -PI / 2 + t0 + 0.42); ctx.fill();
          ctx.fillStyle = '#f2c2d6'; ctx.beginPath(); lens(ctx, x0, y0b, z * 1.05, z * 0.34, -PI / 2 + t0 - 0.15); lens(ctx, x0, y0b, z * 1.0, z * 0.3, -PI / 2 + t0 + 0.2); ctx.fill();
          ctx.fillStyle = '#fff6f2'; ctx.beginPath(); lens(ctx, x0 - z * 0.06, y0b - z * 0.1, z * 0.8, z * 0.18, -PI / 2 + t0 - 0.12); ctx.fill();
          ctx.fillStyle = '#3a2a2e'; ctx.beginPath(); qell(ctx, x0, y0b + z * 0.04, z * 0.14, z * 0.1, 0); ctx.fill();
        });
        mark('trees', ctx);
        /* ---------- lantern strings, stands and their light ---------- */
        // cords
        ctx.strokeStyle = rgba('#3a2a30', 0.85); ctx.lineWidth = 0.9 * s; ctx.beginPath();
        L.strings.forEach(function (S0) { ctx.moveTo(S0.a[0], S0.a[1]); ctx.quadraticCurveTo((S0.a[0] + S0.b[0]) / 2, (S0.a[1] + S0.b[1]) / 2 + S0.sag * 2, S0.b[0], S0.b[1]); });
        L.lan.forEach(function (Lt) { if (Lt[5] === 0) { ctx.moveTo(Lt[0], Lt[6]); ctx.lineTo(Lt[0], Lt[1] + 1 * s); } });
        ctx.stroke();
        // ground light pools (under stand lanterns)
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        L.lan.forEach(function (Lt) { if (Lt[5] !== 1) return; var rr = Lt[2] * 2.2; haze(ctx, Lt[0] - rr, Lt[6] - rr * 0.3, Lt[0] + rr, Lt[6] + rr * 0.3, mix(LCOL[Lt[3]], '#ff9a50', 0.5), 0.13); });
        ctx.restore();
        // posts, then lanterns (back to front)
        L.lan.forEach(function (Lt) {
          if (Lt[5] === 1) {
            var pb = Lt[6], pt2 = Lt[1] + Lt[2];
            ctx.strokeStyle = '#2e2228'; ctx.lineWidth = Math.max(0.8, Lt[2] * 0.08); ctx.beginPath(); ctx.moveTo(Lt[0], pb); ctx.lineTo(Lt[0], pt2 - Lt[2] * 0.02); ctx.stroke();
            ctx.fillStyle = rgba('#1a1420', 0.35); ctx.beginPath(); qell(ctx, Lt[0], pb, Lt[2] * 0.3, Lt[2] * 0.08, 0); ctx.fill();
          }
          drawLantern(ctx, Lt[0], Lt[1], Lt[2], Lt[3], Lt[4]);
        });
        // glow halos
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        L.lan.forEach(function (Lt) { var cy = Lt[1] + Lt[2] * 0.52; glow(ctx, Lt[0], cy, Lt[2] * 1.9, gcol(Lt[3]), 0.2); });
        ctx.restore();
        mark('lanterns', ctx);
        /* ---------- foreground: lower terrace step, flower beds, dark grass ---------- */
        var stepY = L.step;
        ctx.fillStyle = lg(ctx, 0, h * 0.83, 0, h, [[0, '#33423c'], [0.5, '#26302e'], [1, '#1a1c24']]);
        ctx.save(); pathShape(); ctx.rect(0, 0, w, h); ctx.clip('evenodd'); // everything except the path
        ctx.beginPath(); ctx.moveTo(0, h); for (x = 0; x <= w + 4 * s; x += 4 * s) ctx.lineTo(x, stepY(x)); ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = rgba('#c8b890', 0.35); ctx.lineWidth = 1.2 * s; ctx.beginPath(); for (x = 0; x <= w + 4 * s; x += 4 * s) { if (!x) ctx.moveTo(x, stepY(x)); else ctx.lineTo(x, stepY(x)); } ctx.stroke();
        ctx.restore();
        // the path continues down as two broad steps
        ctx.save(); pathShape(); ctx.clip();
        ctx.fillStyle = lg(ctx, 0, h * 0.84, 0, h, [[0, 'rgba(60,40,56,0.12)'], [1, 'rgba(40,28,44,0.5)']]); ctx.fillRect(0, h * 0.838, w, h * 0.17);
        [0.842, 0.905].forEach(function (yy) { ctx.fillStyle = rgba('#3a2e34', 0.55); ctx.fillRect(0, h * yy + 1.5 * s, w, 3 * s); ctx.fillStyle = rgba('#f0dcc4', 0.5); ctx.fillRect(0, h * yy, w, 1.4 * s); });
        ctx.restore();
        // flower beds in both corners (painted blooms + leaves), leaving the path clear
        var fbr = rng(42001), FLB = [[], [], [], [], [], []], fcol = ['#ff9ab4', '#fff4ea', '#ffc86a', '#c8a2ff', '#ff7a8a', '#ffd8e4'];
        batch(ctx, 1800, [['#1e2a26', 1.1 * s, 0.85], ['#3e5a44', 0.9 * s, 0.7], ['#6a8a58', 0.7 * s, 0.55]], function () {
          var yy = lerp(h * 0.84, h * 1.01, Math.pow(fbr(), 0.7)), xx = fbr() * w, pp = L.pathAt(clamp((h * 1.03 - yy) / (h * 0.4), 0, 1) * 0.35);
          if (Math.abs(xx - pp[0]) < L.pathHW(yy) + 4 * s) return null;
          var p = (yy - h * 0.84) / (h * 0.16), l = (5 + p * 18 + fbr() * 8) * s, lx = (fbr() - 0.5) * l * 0.7;
          return [xx, yy, xx + lx, yy - l, fbr() < 0.4 ? 0 : fbr() < 0.7 ? 1 : 2, xx + lx * 0.15, yy - l * 0.6];
        });
        for (i = 0; i < 260; i++) {
          var fy3 = lerp(h * 0.845, h * 0.99, Math.pow(fbr(), 0.8)), fx3 = fbr() * w, pp3 = L.pathAt(clamp((h * 1.03 - fy3) / (h * 0.4), 0, 1) * 0.35);
          if (Math.abs(fx3 - pp3[0]) < L.pathHW(fy3) + 6 * s) continue;
          var p3 = (fy3 - h * 0.84) / (h * 0.16), fz3 = (1.8 + p3 * 3 + fbr() * 1.5) * s;
          FLB[(fbr() * 6) | 0].push([fx3, fy3 - (3 + p3 * 14 + fbr() * 6) * s, fz3, fbr() * TAU]);
        }
        for (k = 0; k < 6; k++) {
          ctx.fillStyle = fcol[k]; ctx.beginPath();
          FLB[k].forEach(function (F) { for (var pt3 = 0; pt3 < 5; pt3++) { var pa = F[3] + pt3 / 5 * TAU; lens(ctx, F[0], F[1], F[2], F[2] * 0.42, pa); } });
          ctx.fill();
        }
        ctx.fillStyle = '#ffe08a'; ctx.beginPath(); FLB.forEach(function (B) { B.forEach(function (F) { qcirc(ctx, F[0], F[1], F[2] * 0.22); }); }); ctx.fill();
        // tulips: cupped bezier heads on slim stems
        for (i = 0; i < 26; i++) {
          var tx4 = (i < 13 ? fbr() * 0.3 : 0.7 + fbr() * 0.3) * w, ty4 = lerp(h * 0.86, h * 0.98, fbr()), tz = (3.5 + (ty4 / h - 0.86) * 40 + fbr() * 2) * s, tc = ['#ff7a8a', '#ffb0c0', '#ffd27a', '#fff0e8'][(fbr() * 4) | 0];
          ctx.strokeStyle = '#3e5a3e'; ctx.lineWidth = 0.8 * s; ctx.beginPath(); ctx.moveTo(tx4, ty4); ctx.quadraticCurveTo(tx4 + 2 * s, ty4 - tz * 1.5, tx4 + 1 * s, ty4 - tz * 2.6); ctx.stroke();
          var hx = tx4 + 1 * s, hy = ty4 - tz * 2.6;
          ctx.fillStyle = tc; ctx.beginPath(); ctx.moveTo(hx - tz * 0.5, hy - tz * 0.9); ctx.bezierCurveTo(hx - tz * 0.6, hy - tz * 0.1, hx - tz * 0.3, hy + tz * 0.2, hx, hy + tz * 0.2); ctx.bezierCurveTo(hx + tz * 0.3, hy + tz * 0.2, hx + tz * 0.6, hy - tz * 0.1, hx + tz * 0.5, hy - tz * 0.9); ctx.quadraticCurveTo(hx + tz * 0.25, hy - tz * 0.5, hx, hy - tz * 0.95); ctx.quadraticCurveTo(hx - tz * 0.25, hy - tz * 0.5, hx - tz * 0.5, hy - tz * 0.9); ctx.fill();
          ctx.fillStyle = rgba('#ffffff', 0.3); ctx.beginPath(); lens(ctx, hx - tz * 0.2, hy + tz * 0.1, tz * 0.8, tz * 0.12, -PI / 2 - 0.1); ctx.fill();
        }
        // foreground lanterns' light on the beds
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        L.lan.forEach(function (Lt) { if (Lt[6] < h * 0.86) return; glow(ctx, Lt[0], Lt[1] + Lt[2] * 0.5, Lt[2] * 3, '#ffa860', 0.22); });
        ctx.restore();
        // foreground lanterns sit in front of the beds
        L.lan.forEach(function (Lt) {
          if (Lt[6] < h * 0.86) return;
          ctx.strokeStyle = '#1e1618'; ctx.lineWidth = Math.max(1, Lt[2] * 0.07); ctx.beginPath(); ctx.moveTo(Lt[0], Lt[6]); ctx.lineTo(Lt[0], Lt[1] + Lt[2]); ctx.stroke();
          drawLantern(ctx, Lt[0], Lt[1], Lt[2], Lt[3], Lt[4]);
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, Lt[0], Lt[1] + Lt[2] * 0.52, Lt[2] * 1.5, gcol(Lt[3]), 0.25); ctx.restore();
        });
        mark('foreground', ctx);
        // calm dark base for the caption card, then grade, vignette and grain
        ctx.fillStyle = lg(ctx, 0, h * 0.8, 0, h, [[0, 'rgba(24,18,36,0)'], [1, 'rgba(24,18,36,0.45)']]); ctx.fillRect(0, h * 0.8, w, h * 0.2);
        finish(ctx, w, h, '#ff9a70', 0.08, 0.32, 0.035, '#1a1028', 0.45);
        mark('finish', ctx);
      } catch (e) { PAINT._err = 'varrow: ' + String(e && e.stack || e); }
    },
    overlay: function (ctx, w, h, t) {
      try {
        var L = VL(w, h), s = L.s, i, PL = L.pool, hz = L.hz;
        t = t || 0;
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        // a few stars twinkle
        var sp = glowSpr('#fff4e0', true);
        if (sp) for (i = 0; i < 12; i++) {
          var tw = Math.pow(Math.max(0, Math.sin(t * (0.6 + hash(i, 13) * 1.2) + i * 2.1)), 3); if (tw < 0.05) continue;
          var ss = (2.5 + hash(i, 14) * 4) * s * tw; ctx.globalAlpha = tw * 0.9; ctx.drawImage(sp, hash(i, 11) * w - ss, Math.pow(hash(i, 12), 1.4) * h * 0.22 - ss, ss * 2, ss * 2);
        }
        // the lighthouse lamp breathes
        if (L.lamp) { var sl = glowSpr('#ffe0a0'); if (sl) { var lb = 0.5 + 0.5 * Math.sin(t * 1.1); ctx.globalAlpha = 0.25 + lb * 0.45; var lz = (8 + lb * 8) * s; ctx.drawImage(sl, L.lamp[0] - lz, L.lamp[1] - lz, lz * 2, lz * 2); } }
        // harbor glitter in the sun path
        ctx.strokeStyle = '#fff2c8'; ctx.lineWidth = 1 * s; ctx.lineCap = 'round';
        var wy1 = L.bank;
        for (i = 0; i < 22; i++) {
          var p = hash(i, 31), a = Math.max(0, Math.sin(t * (1 + hash(i, 33) * 2) + i * 2.7)); if (a < 0.15) continue;
          var yy = hz + 2 * s + p * (wy1 - hz - 3 * s), spread = w * (0.015 + p * 0.1), xx = L.sun[0] + (hash(i, 32) * 2 - 1) * spread, l = (2 + p * 8) * s;
          ctx.globalAlpha = a * 0.7; ctx.beginPath(); ctx.moveTo(xx - l / 2, yy); ctx.lineTo(xx + l / 2, yy); ctx.stroke();
        }
        // lanterns breathe: four pre-rendered glow layers (lanterns dealt into them at random), each on its own rhythm
        var GLs = glowLayers(w, h, L);
        if (GLs) for (i = 0; i < GLs.c.length; i++) {
          var f = 0.55 + 0.28 * Math.sin(t * (1.05 + i * 0.23) + i * 1.9) + 0.17 * Math.sin(t * (3.3 + i * 0.7) + i * 2.6);
          ctx.globalAlpha = 0.25 + f * 0.6; ctx.drawImage(GLs.c[i], 0, GLs.y0, GLs.c[i].width, GLs.c[i].height, 0, GLs.y0, w, GLs.h);
        }
        // pool shimmer
        ctx.strokeStyle = '#ffe2c8'; ctx.lineWidth = 0.8 * s;
        for (i = 0; i < 10; i++) {
          var a2 = Math.max(0, Math.sin(t * (0.8 + hash(i, 61) * 1.4) + i * 2.3)); if (a2 < 0.2) continue;
          var an = hash(i, 62) * TAU, d = 0.3 + hash(i, 63) * 0.6, px = PL.x + Math.cos(an) * PL.rx * d, py = PL.y + Math.sin(an) * PL.ry * d, l2 = (4 + hash(i, 64) * 6) * s;
          if (Math.abs(px - L.stone.x) < L.stone.W * 1.4 && py < L.stone.y + 2 * s) continue;
          ctx.globalAlpha = a2 * 0.45; ctx.beginPath(); ctx.moveTo(px - l2 / 2, py); ctx.lineTo(px + l2 / 2, py); ctx.stroke();
        }
        ctx.restore();
        // floating lanterns on the pool: reflection, glow, ripple, lantern (sorted back to front)
        ctx.save();
        var FS = [];
        for (i = 0; i < L.floats.length; i++) {
          var F = L.floats[i], ang = F[0] + Math.sin(t * 0.05 + F[4]) * 0.18, fr = F[1];
          var fx = PL.x + Math.cos(ang) * PL.rx * fr, fy = PL.y + Math.sin(ang) * PL.ry * fr + Math.sin(t * 0.9 + F[4]) * 0.6 * s;
          var dxs = Math.abs(fx - L.stone.x), behind = fy < L.stone.y && dxs < L.stone.W * 1.6;
          var al = behind ? clamp((dxs - L.stone.W) / (L.stone.W * 0.6), 0, 1) : 1;
          FS.push([fx, fy, F[3] * (0.9 + 0.2 * (fy - PL.y + PL.ry) / (PL.ry * 2)), F[2], al, F[4]]);
        }
        FS.sort(function (A, B) { return A[1] - B[1]; });
        var gl0 = glowSpr('#ffb060');
        ctx.globalCompositeOperation = 'lighter';
        if (gl0) for (i = 0; i < FS.length; i++) { var Q0 = FS[i]; if (Q0[4] <= 0) continue; ctx.globalAlpha = Q0[4] * (0.3 + 0.08 * Math.sin(t * 2.3 + Q0[5] * 3)); ctx.drawImage(gl0, Q0[0] - Q0[2] * 1.5, Q0[1] - Q0[2] * 0.9, Q0[2] * 3, Q0[2] * 1.8); }
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = '#ffe0c0'; ctx.lineWidth = 0.6 * s; ctx.globalAlpha = 0.28; ctx.beginPath();
        for (i = 0; i < FS.length; i++) { var Q1 = FS[i], rp = 1 + ((t * 0.4 + Q1[5]) % 1) * 0.5, rw = Q1[2] * 0.6 * rp; if (Q1[4] < 0.5) continue; ctx.moveTo(Q1[0] - rw, Q1[1]); ctx.quadraticCurveTo(Q1[0], Q1[1] + Q1[2] * 0.3 * rp, Q1[0] + rw, Q1[1]); }
        ctx.stroke();
        for (i = 0; i < FS.length; i++) {
          var Q = FS[i], spr = lanternSpr(Q[3], 'float'); if (!spr || Q[4] <= 0) continue;
          var hh = Q[2], ww = hh * 64 / 56;
          // reflection: the lower part of the sprite, flipped and squashed, drawn faintly under the float
          ctx.globalAlpha = Q[4] * 0.3; ctx.setTransform(1, 0, 0, -0.45, 0, 1.45 * Q[1]);
          ctx.drawImage(spr, Q[0] - ww / 2, Q[1] - hh * 0.78, ww, hh);
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.globalAlpha = Q[4]; ctx.drawImage(spr, Q[0] - ww / 2, Q[1] - hh * 0.78, ww, hh);
        }
        ctx.restore();
        // fireflies drift over the garden; petals fall from the two trees
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        var ff = glowSpr('#e8ffa0', true);
        if (ff) for (i = 0; i < 22; i++) {
          var bx = hash(i, 71) * w, by = h * (0.47 + hash(i, 72) * 0.36);
          var fxp = bx + Math.sin(t * (0.21 + hash(i, 73) * 0.2) + i) * 26 * s + Math.sin(t * 0.7 + i * 3) * 5 * s;
          var fyp = by + Math.sin(t * (0.17 + hash(i, 74) * 0.2) + i * 1.3) * 16 * s;
          var on = 0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(t * (0.9 + hash(i, 75)) + i * 2.2), 2), fz = (3 + hash(i, 76) * 3) * s;
          ctx.globalAlpha = on * 0.9; ctx.drawImage(ff, fxp - fz, fyp - fz, fz * 2, fz * 2);
        }
        ctx.restore();
        ctx.save();
        var pc = ['#ffc6d0', '#fff0ee', '#f2a0b8'];
        for (var b = 0; b < 3; b++) {
          ctx.fillStyle = pc[b]; ctx.globalAlpha = 0.85; ctx.beginPath();
          for (i = b; i < 18; i += 3) {
            var left = i % 2 === 0, per = 9 + hash(i, 81) * 7, q = ((t + hash(i, 82) * per) % per) / per;
            var x0 = left ? w * (0.02 + hash(i, 83) * 0.3) : w * (0.72 + hash(i, 83) * 0.27), y0 = h * (0.32 + hash(i, 84) * 0.1);
            var ppx = x0 + q * w * (left ? 0.12 : -0.1) + Math.sin(t * 1.3 + i) * 7 * s, ppy = y0 + q * h * 0.32, pz = (2.2 + hash(i, 85) * 1.6) * s, rot = t * (1 + hash(i, 86)) + i;
            if (q > 0.92) continue;
            lens(ctx, ppx, ppy, pz, pz * 0.45 * (0.4 + 0.6 * Math.abs(Math.sin(rot))), rot);
          }
          ctx.fill();
        }
        ctx.restore();
      } catch (e) { PAINT._err = 'varrow overlay: ' + String(e && e.stack || e); }
    }
  };

  /* every entry point leaves the caller's canvas state untouched */
  (function () {
    var S0 = PAINT.varrow, p0 = S0.paint, o0 = S0.overlay;
    S0.paint = function (ctx, w, h) { ctx.save(); try { p0(ctx, w, h); } finally { ctx.restore(); } };
    S0.overlay = function (ctx, w, h, t) { ctx.save(); try { o0(ctx, w, h, t); } finally { ctx.restore(); } };
  })();
})();
