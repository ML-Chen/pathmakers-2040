/* paint_boston.js - painted canvas backgrounds for Pathmakers 2040 (a hopeful 2040 Boston).
   Plain browser script, no modules, no external assets. Defines
     window.PAINT[key] = { paint(ctx, w, h), overlay(ctx, w, h, t), focus }
   for key in: home, street, hospital, night, table, workbench.
   - paint() draws the static painting once (the game caches it).
   - overlay() draws calm ambient motion on top of the cached painting every frame (t in seconds).
   - w, h are the canvas size in pixels (CSS size x devicePixelRatio); pass an untransformed ctx.
   - focus: {x, y} fractions of the scene's main landmark (sun, orb, moon...).
   Everything is seeded, so a scene paints identically every time.
   Painting utilities (rng/hash/fbm, ridge, glow, cloud, wisp, haze, shafts, batch, dots, dabs,
   clump/broadleaf foliage, finish) are adapted from Couchcatch's scenery_home.js / scenery_ca.js. */
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
  function vnoise(x, s) {
    var i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
    return hash(i, s) * (1 - u) + hash(i + 1, s) * u;
  }
  function fbm(x, s, oct) {
    var v = 0, a = 0.5, fr = 1, n = 0, o;
    for (o = 0; o < (oct || 5); o++) { v += a * vnoise(x * fr, s + o * 131); n += a; a *= 0.5; fr *= 2.07; }
    return v / n;
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
  /* unit size: 1 CSS px of the 390-wide phone column */
  function S(w, h) { return Math.max(0.5, Math.min(w / 390, h / 640)); }
  function memo(fn) { var key = null, val = null; return function (w, h) { var k = w + 'x' + h; if (k !== key) { key = k; val = fn(w, h); } return val; }; }
  function pick(arr, r) { return arr[(r() * arr.length) | 0]; }
  /* optional profiling: set PAINT._prof = [] before paint() to collect [label, ms] marks */
  function mark(l, ctx) { var P = PAINT._prof; if (P) { if (ctx) ctx.getImageData(0, 0, 1, 1); P.push([l, (typeof performance !== 'undefined' ? performance.now() : Date.now())]); } }

  function ridge(ctx, x0, x1, step, fy, yb, fill) {
    ctx.beginPath(); ctx.moveTo(x0, yb);
    for (var x = x0; x <= x1 + step; x += step) ctx.lineTo(Math.min(x, x1), fy(Math.min(x, x1)));
    ctx.lineTo(x1, yb); ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  }
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
  function puff(ctx, x, y, R, col, a) {
    ctx.fillStyle = rg(ctx, x, y, 0, R, [[0, rgba(col, a)], [0.5, rgba(col, a * 0.85)], [0.8, rgba(col, a * 0.35)], [1, rgba(col, 0)]]);
    ctx.fillRect(x - R, y - R, R * 2, R * 2);
  }
  function wisp(ctx, x, y, len, th, col, al, r) {
    for (var i = 0; i < 6; i++) {
      var cx = x + (r() - 0.5) * len, cy = y + (r() - 0.5) * th * 2;
      ctx.save(); ctx.translate(cx, cy); ctx.scale(1, th / len * 3);
      ctx.fillStyle = rg(ctx, 0, 0, 0, len * 0.4, [[0, rgba(col, al)], [1, rgba(col, 0)]]);
      ctx.fillRect(-len * 0.4, -len * 0.4, len * 0.8, len * 0.8); ctx.restore();
    }
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
  /* fast path shapes: quadratic-curve circle / rotated ellipse (much cheaper than arc/ellipse in big batches) */
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
  /* batched rectangles: gen -> [x,y,w,h,bucket] */
  function rects(ctx, n, cols, gen) {
    var i, k, b = []; for (k = 0; k < cols.length; k++) b.push([]);
    for (i = 0; i < n; i++) { var d = gen(i); if (d) b[d[4]].push(d); }
    ctx.save();
    for (k = 0; k < cols.length; k++) {
      if (!b[k].length) continue;
      ctx.fillStyle = cols[k][0]; ctx.globalAlpha = cols[k][1]; ctx.beginPath();
      for (i = 0; i < b[k].length; i++) { var q = b[k][i]; ctx.rect(q[0], q[1], q[2], q[3]); }
      ctx.fill();
    }
    ctx.restore();
  }
  function grassField(ctx, w, y0, y1, n, cols, r, s, lean, xf) {
    batch(ctx, n, cols, function () {
      var y = y0 + Math.pow(r(), 0.8) * (y1 - y0), p = (y - y0) / (y1 - y0);
      var x = xf ? xf(r()) : r() * w, L = (1.5 + p * 7 + r() * 3) * s, b = Math.floor(r() * cols.length);
      var lx = (lean || 0) * L + (r() - 0.5) * L * 0.6;
      return [x, y, x + lx, y - L, b, x + lx * 0.2, y - L * 0.6];
    });
  }
  /* water reflection: copy the band above `axis` into [axis, y1] flipped, in thin wobbling strips */
  function reflect(ctx, w, axis, y1, al, amp, freq, seed, squash) {
    try {
      var cv = ctx.canvas; if (!cv || !cv.width) return; var k = cv.width / w, y, sq = squash || 1;
      var st = Math.max(2, Math.round(1.5 * k)) / k, srcH = Math.min(axis, (y1 - axis) * sq + 2 * st);
      var sw = cv.width, sh = Math.ceil(srcH * k);
      // exact-size scratch every call: strip sampling then never depends on what an earlier paint left behind
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
  function wispSpr(col) {
    var key = 'wisp' + col;
    if (SPR[key] !== undefined) return SPR[key];
    var c = mk(256, 72); if (c) {
      var g = c.getContext('2d'), r = rng(77);
      for (var i = 0; i < 18; i++) {
        var x = 40 + r() * 176, y = 30 + r() * 14, rr = 14 + r() * 22;
        g.save(); g.translate(x, y); g.scale(1.8, 0.55);
        g.fillStyle = rg(g, 0, 0, 0, rr, [[0, rgba(col, 0.32)], [1, rgba(col, 0)]]); g.fillRect(-rr, -rr, rr * 2, rr * 2); g.restore();
      }
    }
    SPR[key] = c; return c;
  }
  function bez(p0, p1, p2, t) { var m = 1 - t; return m * m * p0 + 2 * m * t * p1 + t * t * p2; }
  /* cheap blur of a small canvas: progressive-alpha offset copies (equal weights), `passes` times */
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
  /* upscale a small canvas onto ctx in 2x steps (smooth, painterly soft focus) */
  function upscale(ctx, src, w, h) {
    var cur = src;
    while (cur.width * 2 < w) {
      var nx = mk(cur.width * 2, cur.height * 2), g = nx.getContext('2d');
      g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(cur, 0, 0, nx.width, nx.height); cur = nx;
    }
    ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(cur, 0, 0, w, h); ctx.restore();
  }

  /* ---------------- clouds ---------------- */
  /* painterly cumulus: shade body, mid body and lit crowns offset toward the light (lx,ly). */
  function cumulus(ctx, cx, cy, W, H, r, o) {
    var n = 9 + ((r() * 5) | 0), P = [], i, p;
    for (i = 0; i < n; i++) {
      var u = (i / (n - 1)) * 2 - 1 + (r() - 0.5) * 0.15, hp = Math.pow(Math.max(0, 1 - u * u), 0.7);
      var rad = H * (0.2 + 0.32 * hp) * (0.75 + r() * 0.5);
      P.push([cx + u * W * 0.5, cy - r() * H * hp * 0.55 + rad * 0.15, rad]);
    }
    for (i = 0; i < (o.crowns || 5); i++) {
      var u2 = (r() - 0.5) * 1.1, hp2 = Math.pow(Math.max(0, 1 - u2 * u2), 0.8);
      P.push([cx + u2 * W * 0.45, cy - H * hp2 * (0.55 + r() * 0.35), H * (0.14 + r() * 0.14)]);
    }
    var al = o.al == null ? 1 : o.al, lx = o.lx || 0, ly = o.ly == null ? -1 : o.ly;
    ctx.save();
    if (o.clipBase) { ctx.beginPath(); ctx.rect(cx - W, cy - H * 2, W * 2, H * 2 + H * o.clipBase); ctx.clip(); }
    for (i = 0; i < P.length; i++) { p = P[i]; puff(ctx, p[0] - lx * p[2] * 0.1, p[1] - ly * p[2] * 0.1 + p[2] * 0.1, p[2] * 1.15, o.shade, al * 0.85); }
    for (i = 0; i < P.length; i++) { p = P[i]; puff(ctx, p[0] + lx * p[2] * 0.14, p[1] + ly * p[2] * 0.14, p[2] * 0.92, o.mid, al * 0.75); }
    for (i = 0; i < P.length; i++) { p = P[i]; puff(ctx, p[0] + lx * p[2] * 0.36, p[1] + ly * p[2] * 0.36, p[2] * 0.6, o.lit, al * 0.85); }
    if (o.rim) {
      // painterly rim dabs on the light-facing edges
      dabs(ctx, P.length * 6, [[o.rim, 0.5 * al], [o.lit, 0.55 * al]], function () {
        var q = P[(r() * P.length) | 0], a = Math.atan2(ly, lx) + (r() - 0.5) * 1.8, d = q[2] * (0.62 + r() * 0.22);
        return [q[0] + Math.cos(a) * d, q[1] + Math.sin(a) * d, q[2] * (0.08 + r() * 0.1), q[2] * (0.04 + r() * 0.05), r() < 0.5 ? 0 : 1, a + PI / 2];
      });
    }
    ctx.restore();
  }

  /* sculpted cumulus: crisp bumpy silhouette (union of puffs) painted on a half-res sprite, then
     shaded inside with source-atop gradients toward the light (lx,ly) and brushed with dabs.
     o: {lit, mid, shade, top (skylight colour on the upper side), al, lx, ly, base (0..1 flatness), q} */
  function cloudForm(ctx, cx, cy, W, H, r, o) {
    var q = o.q || 0.5, pad = H * 0.5, bw = W * 1.15 + pad * 2, bh = H * 1.9 + pad, ox = bw / 2, oy = bh * 0.72;
    var cv = mk(bw * q, bh * q); if (!cv) return;
    var g = cv.getContext('2d'), i, p, lx = o.lx || 0, ly = o.ly == null ? -1 : o.ly;
    g.scale(q, q); g.translate(ox - cx, oy - cy);
    var n = Math.max(4, Math.round(W / (H * 0.42))), P = [], tries;
    for (i = 0; i < n; i++) {
      var u = (i / (n - 1)) * 2 - 1 + (r() - 0.5) * 0.15, hp = Math.pow(Math.max(0, 1 - u * u), 0.5);
      var rad = H * (0.2 + 0.26 * hp) * (0.85 + r() * 0.3);
      P.push([cx + u * (W * 0.5 - rad * 0.6), cy - H * 0.15 * hp + rad * 0.3, rad]);
    }
    // billows bud off the upper contour of existing puffs (cauliflower top)
    var nb = o.billows || n * 3;
    for (tries = 0; tries < nb * 3 && P.length < n + nb; tries++) {
      var pa = P[(r() * P.length) | 0]; if (pa[2] < H * 0.07) continue;
      var a = -PI * (0.12 + r() * 0.76), d = pa[2] * (0.62 + r() * 0.3), nr = pa[2] * (0.38 + r() * 0.3);
      var nx = pa[0] + Math.cos(a) * d, ny = pa[1] + Math.sin(a) * d;
      if (ny - nr < cy - H * 1.05 || Math.abs(nx - cx) + nr > W * 0.56) continue;
      P.push([nx, ny, nr]);
    }
    var ext = Math.max(W, H * 2);
    var form = lg(g, cx - lx * ext * 0.5, cy - ly * ext * 0.35, cx + lx * ext * 0.5, cy + ly * ext * 0.35, [[0, o.shade], [0.42, o.mid], [0.78, o.lit], [1, o.lit]]);
    // soft halo, then the crisp union
    g.globalAlpha = o.halo == null ? 0.35 : o.halo; g.fillStyle = form; g.beginPath();
    for (i = 0; i < P.length; i++) { p = P[i]; g.moveTo(p[0] + p[2] * 1.12, p[1]); g.arc(p[0], p[1], p[2] * 1.12, 0, TAU); }
    g.fill(); g.globalAlpha = 1; g.beginPath();
    for (i = 0; i < P.length; i++) { p = P[i]; g.moveTo(p[0] + p[2], p[1]); g.arc(p[0], p[1], p[2], 0, TAU); }
    g.fill();
    g.globalCompositeOperation = 'source-atop';
    // faint billow cues: shadowed undersides, skylit tops, sun-side glow
    P.sort(function (A, B) { return A[1] - B[1]; });
    for (i = 0; i < P.length; i++) {
      p = P[i];
      if (i % 2 === 0) puff(g, p[0] - lx * p[2] * 0.3, p[1] - ly * p[2] * 0.3 + p[2] * 0.35, p[2] * 0.9, o.shade, o.seam == null ? 0.16 : o.seam);
      puff(g, p[0] + lx * p[2] * 0.55, p[1] + ly * p[2] * 0.55, p[2] * 0.6, o.lit, 0.32);
    }
    g.globalCompositeOperation = 'source-atop';
    if (o.top) { g.fillStyle = lg(g, 0, cy - H, 0, cy + H * 0.3, [[0, rgba(o.top, 0.5)], [1, rgba(o.top, 0)]]); g.fillRect(cx - bw, cy - bh, bw * 2, bh * 2); }
    // brush texture
    dabs(g, Math.round(P.length * 6), [[o.lit, 0.14], [o.top || o.mid, 0.12], [o.shade, 0.1]], function () {
      var q2 = P[(r() * P.length) | 0], a = r() * TAU, d = q2[2] * Math.sqrt(r()) * 0.9;
      var px = q2[0] + Math.cos(a) * d, py = q2[1] + Math.sin(a) * d, f = (Math.cos(a) * lx + Math.sin(a) * ly) * d / q2[2];
      return [px, py, q2[2] * (0.12 + r() * 0.16), q2[2] * (0.04 + r() * 0.04), f > 0.3 ? 0 : (Math.sin(a) < -0.3 ? 1 : 2), (r() - 0.5) * 0.5];
    });
    // soften / flatten the base
    g.globalCompositeOperation = 'destination-out';
    var by = cy + H * (0.12 + (1 - (o.base == null ? 0.6 : o.base)) * 0.3);
    g.fillStyle = lg(g, 0, by, 0, by + H * 0.2, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,1)']]); g.fillRect(cx - bw, by, bw * 2, bh);
    ctx.save(); ctx.globalAlpha = o.al == null ? 1 : o.al; ctx.imageSmoothingEnabled = true;
    ctx.drawImage(cv, cx - ox, cy - oy, bw, bh);
    ctx.restore();
  }
  /* sample a gradient stop list at t */
  function gradAt(st, t) {
    if (t <= st[0][0]) return st[0][1];
    for (var i = 1; i < st.length; i++) if (t <= st[i][0]) return mix(st[i - 1][1], st[i][1], (t - st[i - 1][0]) / (st[i][0] - st[i - 1][0]));
    return st[st.length - 1][1];
  }
  /* painterly brush strokes over a vertical gradient region (keeps the sky from looking airbrushed) */
  function skyStrokes(ctx, x0, x1, y0, y1, st, n, r, s, al, warm, cool) {
    // colours quantised into a few bands so the strokes batch into ~30 fills
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

  /* ---------------- foliage ---------------- */
  /* leaf-shaped lens (two quadratic curves) appended to the current path */
  function lens(ctx, x, y, L, Wd, a) {
    var c = Math.cos(a), sn = Math.sin(a), tx = x + c * L, ty = y + sn * L, mx = x + c * L * 0.5, my = y + sn * L * 0.5, nx = -sn * Wd, ny = c * Wd;
    ctx.moveTo(x, y); ctx.quadraticCurveTo(mx + nx, my + ny, tx, ty); ctx.quadraticCurveTo(mx - nx, my - ny, x, y);
  }
  /* volumetric foliage clump of leaf dabs: pal [deep, shadow, mid, lit, rim]; (lx,ly) unit vector toward light */
  function clump(ctx, cx, cy, R, pal, r, lx, ly, back, dens) {
    var cv = ctx.canvas;
    if (cv && (cx + R * 1.1 < 0 || cy + R * 1.1 < 0 || cx - R * 1.1 > cv.width || cy - R * 1.1 > cv.height)) { r(); return; } // off-canvas: skip (one draw keeps the sequence stable enough)
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
  function trunkPath(ctx, x0, y0, x1, y1, w0, w1, bend, add) {
    var mx = (x0 + x1) / 2 + bend, my = (y0 + y1) / 2, N = 14, Lp = [], Rp = [], j;
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
  /* broadleaf tree: o {x,yb,cx,cy,rx,ry,tw,s,lx,ly,pal,bark:[lit,mid,dark],hole,n,edge,limbs,bend,dens} */
  function broadleaf(ctx, o, seed) {
    var r = rng(seed), k, s = o.s;
    var bx = o.x, by = o.yb, tx = o.cx + (o.lean || 0), ty = o.cy + o.ry * 0.35, tw = o.tw;
    ctx.save();
    trunkPath(ctx, bx, by, tx, ty, tw, tw * 0.45, (o.bend || 0));
    ctx.fillStyle = lg(ctx, bx - tw, 0, bx + tw, 0, o.lx > 0 ? [[0, o.bark[2]], [0.5, o.bark[1]], [1, o.bark[0]]] : [[0, o.bark[0]], [0.5, o.bark[1]], [1, o.bark[2]]]);
    ctx.fill();
    ctx.save(); ctx.clip();
    batch(ctx, Math.round(Math.max(10, by - ty) * 0.8), [[o.bark[0], 0.7 * s, 0.45], ['#000000', 0.8 * s, 0.25]], function () {
      var yy = lerp(ty, by, r()), xx = lerp(tx, bx, (yy - ty) / (by - ty)) + (r() - 0.5) * tw * 1.2, l = (3 + r() * 8) * s;
      return [xx, yy, xx + (r() - 0.5) * s, yy + l, r() < 0.5 ? 0 : 1];
    });
    ctx.restore();
    var nb = o.limbs || 5;
    for (k = 0; k < nb; k++) {
      var t0 = 0.15 + r() * 0.5, sx = lerp(tx, bx, t0 * 0.4), sy = lerp(ty, by, t0 * 0.4);
      var ex = o.cx + (r() - 0.5) * o.rx * 1.5, ey = o.cy + (r() - 0.6) * o.ry * 1.1;
      trunkPath(ctx, sx, sy, ex, ey, tw * (0.35 + r() * 0.2), tw * 0.08, (r() - 0.5) * o.rx * 0.3);
      ctx.fillStyle = o.bark[2]; ctx.fill();
    }
    var cl = [], nc = o.n || 16;
    for (k = 0; k < nc; k++) {
      var a = r() * TAU, rr = Math.sqrt(r()) * 0.82;
      cl.push([o.cx + Math.cos(a) * o.rx * rr, o.cy + Math.sin(a) * o.ry * rr, Math.min(o.rx, o.ry) * (0.3 + r() * 0.22), r()]);
    }
    for (k = 0; k < (o.edge || 8); k++) {
      var a2 = (k / (o.edge || 8)) * TAU + r() * 0.4;
      cl.push([o.cx + Math.cos(a2) * o.rx * 0.88, o.cy + Math.sin(a2) * o.ry * 0.85, Math.min(o.rx, o.ry) * (0.2 + r() * 0.14), r()]);
    }
    cl.sort(function (A, B) { return (A[1] + A[3] * o.ry * 0.5) - (B[1] + B[3] * o.ry * 0.5); });
    for (k = 0; k < cl.length; k++) clump(ctx, cl[k][0], cl[k][1], cl[k][2], o.pal, r, o.lx, o.ly, cl[k][1] < o.cy - o.ry * 0.3, o.dens);
    if (o.hole) dots(ctx, Math.round(nc * 2.2), [[o.hole, 0.8]], function () {
      var a3 = r() * TAU, rr3 = Math.sqrt(r()) * 0.8;
      return [o.cx + Math.cos(a3) * o.rx * rr3, o.cy + Math.sin(a3) * o.ry * rr3, (0.6 + r() * 1.6) * s, 0];
    });
    ctx.restore();
  }
  /* leaf shape appended to the current path: base (x,y), length L, half-width Wd, angle a */
  function leafPath(ctx, x, y, L, Wd, a, heart) {
    var c = Math.cos(a), sn = Math.sin(a), nx = -sn, ny = c;
    var tx = x + c * L, ty = y + sn * L;
    var b = heart ? 0.15 : 0.35;
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x + c * L * b + nx * Wd * 1.3, y + sn * L * b + ny * Wd * 1.3, x + c * L * 0.75 + nx * Wd * 0.8, y + sn * L * 0.75 + ny * Wd * 0.8, tx, ty);
    ctx.bezierCurveTo(x + c * L * 0.75 - nx * Wd * 0.8, y + sn * L * 0.75 - ny * Wd * 0.8, x + c * L * b - nx * Wd * 1.3, y + sn * L * b - ny * Wd * 1.3, x, y);
  }

  /* ---------------- city pieces ---------------- */
  /* one tower. b: {x,w,top,base,kind,k(haze 0..1),seed,col,slant,turb,vawt,roofTrees,solar,mast,lit}
     E: {s,W,vpX,sunX,haze,face,lit,shade,rim,glass:[top,mid,bot],win,winLit,green:[5],night,litP} */
  function tower(ctx, b, E) {
    var r = rng(b.seed || 7), s = E.s, x = b.x, w = b.w, top = b.top, base = b.base, H = base - top, k = b.k || 0, kind = b.kind || 'stone';
    function T(c, extra) { return mix(c, E.haze, clamp(k + (extra || 0), 0, 1)); }
    var cx = x + w / 2, sd = cx < E.vpX ? 1 : -1;
    var sw = w * (0.1 + 0.22 * clamp(Math.abs(cx - E.vpX) / (E.W * 0.5), 0, 1));
    var sunSide = E.sunX > cx ? 1 : -1, sideLit = sd === sunSide;
    var f0 = sd > 0 ? x : x + sw, f1 = sd > 0 ? x + w - sw : x + w;
    var s0 = sd > 0 ? f1 : x, s1 = sd > 0 ? x + w : f0;
    var glass = kind === 'glass' || kind === 'twist' || b.glass;
    var slant = b.slant || 0, yL = top + Math.max(0, -slant), yR = top + Math.max(0, slant);
    function roofAt(xx) { return lerp(yL, yR, (xx - x) / w); }
    var faceCol = b.col || (kind === 'garden' ? E.pale || E.face : E.face);
    // ---- side face
    poly(ctx, [[s0, base], [s0, roofAt(s0) + (sd > 0 ? 0 : 0)], [s1, roofAt(s1)], [s1, base]]);
    var sc0 = sideLit ? E.lit : E.shade;
    ctx.fillStyle = lg(ctx, 0, top, 0, base, [[0, T(sc0)], [1, T(sc0, 0.12)]]); ctx.fill();
    // ---- front face
    poly(ctx, [[f0, base], [f0, roofAt(f0)], [f1, roofAt(f1)], [f1, base]]);
    if (glass) ctx.fillStyle = lg(ctx, 0, top, 0, base, [[0, T(E.glass[0])], [0.5, T(E.glass[1])], [1, T(E.glass[2])]]);
    else ctx.fillStyle = lg(ctx, 0, top, 0, base, [[0, T(faceCol)], [1, T(faceCol, 0.14)]]);
    ctx.fill();
    // ---- facade detail
    var fh = Math.max(1.6, 2.6 * s * (b.fs || 1)), fw = f1 - f0, j, yy;
    if (glass) {
      // sheen band
      ctx.save(); poly(ctx, [[f0, base], [f0, roofAt(f0)], [f1, roofAt(f1)], [f1, base]]); ctx.clip();
      var sx = f0 + fw * (0.2 + r() * 0.5);
      ctx.fillStyle = rgba(E.sheen || '#ffffff', (E.night ? 0.06 : 0.22) * (1 - k * 0.6));
      ctx.beginPath(); ctx.moveTo(sx, top); ctx.lineTo(sx + fw * 0.35, top); ctx.lineTo(sx - fw * 0.5, base); ctx.lineTo(sx - fw * 0.85, base); ctx.fill();
      // mullions + floor lines
      rects(ctx, 400, [[T(E.mull || '#3a3a5a'), (E.night ? 0.35 : 0.16) * (1 - k * 0.5)], [T('#ffffff'), E.night ? 0.03 : 0.12]], function (i) {
        var nx = Math.ceil(fw / (2.4 * s)); if (i < nx) return [f0 + i * fw / nx, top, Math.max(0.6, 0.35 * s), H, 0];
        var ny = Math.ceil(H / fh), q = i - nx; if (q < ny) return [f0, top + q * fh, fw, Math.max(0.5, 0.3 * s), 1];
        return null;
      });
      if (kind === 'twist') {
        // offset floor bands that read as a slow twist
        rects(ctx, 80, [[T(E.shade), 0.22], [T(E.lit), 0.25]], function (i) {
          var yb = top + i * fh * 3; if (yb > base) return null; var ph = Math.sin(i * 0.5) * 0.5 + 0.5;
          return [f0 + fw * ph * 0.6, yb, fw * 0.4, fh * 1.5, i % 2];
        });
      }
      ctx.restore();
    } else {
      // punched windows
      var cw = Math.max(2, (b.wsp || 2.6) * s), nxw = Math.max(1, Math.floor(fw / cw)), ox = f0 + (fw - nxw * cw) / 2;
      var ny2 = Math.max(1, Math.floor((H - fh) / fh));
      rects(ctx, nxw * ny2, [[T(E.win), 0.85 - k * 0.3], [E.winLit || '#ffd99a', (E.night ? 0.95 : 0.7) * (1 - k * 0.5)]], function (i) {
        var cxi = i % nxw, cyi = (i / nxw) | 0, wy = roofAt(f0) + fh * 0.8 + cyi * fh;
        if (wy > base - fh * 0.6) return null;
        var lit = r() < (E.litP == null ? 0.06 : E.litP) * (b.litMul || 1);
        return [ox + cxi * cw + cw * 0.22, wy, cw * 0.56, fh * 0.55, lit ? 1 : 0];
      });
    }
    // side-face floor lines
    rects(ctx, 200, [[T(sideLit ? '#ffffff' : '#20203a'), 0.12]], function (i) {
      var y = top + fh * (i + 1); if (y > base) return null; return [Math.min(s0, s1), y, Math.abs(s1 - s0), Math.max(0.5, 0.35 * s), 0];
    });
    // ---- green features
    var G = E.green;
    if (kind === 'garden' || b.balc) {
      // planted balcony bands every few floors, spilling over at the corners (a vertical forest)
      var every = fh * 3, rowY, nb2 = 0, GP = [[], [], [], []];
      for (rowY = roofAt(f0) + every; rowY < base - every * 0.5; rowY += every) {
        var amt = fbm(rowY / H * 4 + (b.seed || 7) * 0.13, (b.seed || 7) + 5, 3);
        var n3 = Math.round(fw / (1.1 * s) * (0.5 + amt));
        for (j = 0; j < n3; j++) {
          var gx = f0 + r() * fw, edge = Math.min(gx - f0, f1 - gx) / fw;
          if (edge > 0.12 && amt < 0.5 && r() < 0.6) continue;
          var gr = (0.55 + r() * (edge < 0.12 ? 1.3 : 0.7)) * s, gy = rowY - r() * gr * (edge < 0.12 ? 2.2 : 1.2);
          var lv2 = (gx - cx) / (w * 0.5) * sunSide * 0.5 + (r() - 0.5) * 0.9 - (gy - rowY) / gr * 0.15;
          GP[lv2 < -0.35 ? 0 : lv2 < 0.05 ? 1 : lv2 < 0.4 ? 2 : 3].push([gx, gy, gr]); nb2++;
        }
        // balcony slab line under the plants
        ctx.fillStyle = T(E.lit, 0.1); ctx.globalAlpha = 0.5; ctx.fillRect(f0, rowY, fw, Math.max(0.6, 0.5 * s)); ctx.globalAlpha = 1;
      }
      for (j = 0; j < 4; j++) { ctx.fillStyle = mix(G[j], E.haze, k * 0.6); ctx.beginPath(); GP[j].forEach(function (Q) { qcirc(ctx, Q[0], Q[1], Q[2]); }); ctx.fill(); }
    }
    if (b.vgarden) {
      // a living green stripe down one face
      var gx0 = b.vgarden > 0 ? s0 : f0 + fw * 0.15, gx1 = b.vgarden > 0 ? s1 : f0 + fw * 0.4;
      dots(ctx, Math.round((gx1 - gx0) * H / (1.2 * s * s)), [[T(G[0]), 1], [T(G[1]), 1], [T(G[2]), 1], [T(G[3]), 0.9]], function () {
        var py = top + fh + r() * (H - fh), px = lerp(gx0, gx1, r()), n2 = fbm(py / (40 * s), 33, 3);
        if (n2 < 0.4 && r() < 0.8) return null;
        var v = (px - gx0) / (gx1 - gx0) * sunSide * 0.4 + (r() - 0.5) * 0.8 + (n2 - 0.5) * 0.8;
        return [px, py, (0.45 + r() * 0.7) * s, v < -0.25 ? 0 : v < 0.1 ? 1 : v < 0.45 ? 2 : 3];
      });
    }
    // ---- rim light on the sun-facing edge and roofline
    var rimA = (E.rimA == null ? 0.7 : E.rimA) * (1 - k * 0.55);
    if (rimA > 0.02) {
      ctx.fillStyle = rgba(E.rim, rimA);
      var ex = sideLit ? (sd > 0 ? s1 : s0) : (sunSide > 0 ? f1 : f0);
      ctx.fillRect(ex - (sunSide > 0 ? 0.9 * s : 0), Math.min(roofAt(ex), top), 0.9 * s, H * (sideLit ? 0.9 : 0.55));
      ctx.beginPath(); ctx.moveTo(x, roofAt(x)); ctx.lineTo(x + w, roofAt(x + w)); ctx.strokeStyle = rgba(E.rim, rimA * 0.8); ctx.lineWidth = 0.8 * s; ctx.stroke();
    }
    // ---- crowns
    var cxT = (f0 + f1) / 2, roofY = Math.min(yL, yR);
    if (b.mast) {
      ctx.fillStyle = T(E.shade); ctx.fillRect(cxT - fw * 0.22, roofY - H * 0.03, fw * 0.44, H * 0.03);
      ctx.fillRect(cxT - 0.5 * s, roofY - H * b.mast, 1 * s, H * b.mast);
      ctx.fillRect(cxT - 1.6 * s, roofY - H * b.mast * 0.6, 3.2 * s, 0.7 * s);
      if (E.night) glow(ctx, cxT, roofY - H * b.mast, 4 * s, '#ff5a4a', 0.9);
    }
    if (kind === 'spire') {
      var sh = b.spire || w * 3;
      ctx.fillStyle = lg(ctx, x, 0, x + w, 0, [[0, T(E.shade)], [sunSide > 0 ? 0.65 : 0.35, T(b.spireCol || '#7a8a9a')], [1, T(sunSide > 0 ? E.lit : E.shade)]]);
      ctx.beginPath(); ctx.moveTo(x - w * 0.08, roofY); ctx.lineTo(cx, roofY - sh); ctx.lineTo(x + w * 1.08, roofY); ctx.closePath(); ctx.fill();
      ctx.fillStyle = T(E.face); ctx.fillRect(x - w * 0.12, roofY - 0.8 * s, w * 1.24, 1.6 * s);
      ctx.strokeStyle = rgba(E.rim, rimA * 0.8); ctx.lineWidth = 0.6 * s; ctx.beginPath(); ctx.moveTo(cx, roofY - sh); ctx.lineTo(sunSide > 0 ? x + w * 1.08 : x - w * 0.08, roofY); ctx.stroke();
    }
    if (kind === 'dome') {
      var dr = w * 0.3, dy = roofY - dr * 0.15;
      ctx.fillStyle = T(E.face); ctx.fillRect(cx - dr * 1.1, dy - dr * 0.25, dr * 2.2, dr * 0.4);
      ctx.fillStyle = lg(ctx, cx - dr, 0, cx + dr, 0, [[0, T('#a8782a')], [sunSide > 0 ? 0.7 : 0.3, T('#ffd76a')], [1, T('#c8902a')]]);
      ctx.beginPath(); ctx.ellipse(cx, dy - dr * 0.25, dr, dr * 0.9, 0, PI, TAU); ctx.fill();
      ctx.fillStyle = T('#e8c060'); ctx.fillRect(cx - dr * 0.12, dy - dr * 1.4, dr * 0.24, dr * 0.3);
      glow(ctx, cx + sunSide * dr * 0.3, dy - dr * 0.6, dr * 1.2, '#ffe9a0', E.night ? 0.15 : 0.45 * (1 - k));
    }
    if (b.roofTrees) {
      for (j = 0; j < b.roofTrees; j++) clump(ctx, lerp(x + w * 0.15, x + w * 0.85, (j + 0.5) / b.roofTrees) + (r() - 0.5) * 2 * s, roofAt(cx) - (1.5 + r() * 2) * s, (2 + r() * 2.5) * s, [T(G[0]), T(G[1]), T(G[2]), T(G[3]), T(G[4])], r, sunSide * 0.7, -0.7, false, 0.6);
    }
    if (b.solar) {
      ctx.fillStyle = T('#2c3a6a'); ctx.beginPath();
      for (j = 0; j < 4; j++) { var px0 = x + w * (0.1 + j * 0.21); ctx.moveTo(px0, roofY); ctx.lineTo(px0 + w * 0.16, roofY); ctx.lineTo(px0 + w * 0.12, roofY - 2.2 * s); ctx.lineTo(px0 - w * 0.02, roofY - 2.2 * s); ctx.closePath(); }
      ctx.fill();
    }
    if (b.vawt) {
      for (j = 0; j < b.vawt; j++) {
        var vx = lerp(x + w * 0.2, x + w * 0.8, b.vawt > 1 ? j / (b.vawt - 1) : 0.5), vh = Math.min(w * 0.4, 9 * s), vw = vh * 0.38;
        ctx.strokeStyle = T(E.night ? '#8a90b8' : '#f4f2f0'); ctx.lineWidth = Math.max(0.6, 0.55 * s);
        ctx.beginPath(); ctx.moveTo(vx, roofY); ctx.lineTo(vx, roofY - vh * 1.25); ctx.stroke();
        ctx.beginPath();
        for (var hh = 0; hh < 3; hh++) { var ph = hh / 3 * TAU; ctx.moveTo(vx + Math.sin(ph) * vw, roofY - vh * 0.25); for (var q = 1; q <= 8; q++) { var tq = q / 8; ctx.lineTo(vx + Math.sin(ph + tq * PI) * vw, roofY - vh * (0.25 + tq)); } }
        ctx.stroke();
      }
    }
    if (b.turb) {
      for (j = 0; j < b.turb; j++) {
        var tx2 = lerp(x + w * 0.25, x + w * 0.75, b.turb > 1 ? j / (b.turb - 1) : 0.5), mh = Math.max(6 * s, w * 0.45), bl = Math.max(4 * s, w * 0.3);
        ctx.strokeStyle = T(E.night ? '#9aa0c8' : '#f6f4f2'); ctx.lineWidth = Math.max(0.7, 0.7 * s); ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(tx2, roofY); ctx.lineTo(tx2, roofY - mh); ctx.stroke();
        if (!b.animTurb) {
          ctx.beginPath(); var a0 = r() * TAU;
          for (var bb = 0; bb < 3; bb++) { var aa = a0 + bb * TAU / 3; ctx.moveTo(tx2, roofY - mh); ctx.lineTo(tx2 + Math.cos(aa) * bl, roofY - mh + Math.sin(aa) * bl); }
          ctx.lineWidth = Math.max(0.6, 0.6 * s); ctx.stroke();
        }
        ctx.fillStyle = T('#ffffff'); ctx.beginPath(); ctx.arc(tx2, roofY - mh, Math.max(0.8, 0.9 * s), 0, TAU); ctx.fill();
        if (E.night) glow(ctx, tx2, roofY - mh - 1.5 * s, 3.5 * s, '#ff5a4a', 0.8);
      }
    }
    return { x: x, w: w, top: roofY, base: base, cx: cxT };
  }
  function stepped(ctx, b, E, steps) {
    var H = b.base - b.top, cur = { x: b.x, w: b.w }, j, parts = [];
    for (j = 0; j < steps.length; j++) parts.push(steps[j]);
    // steps: [[heightFrac of this tier top, widthFrac], ...] from bottom tier upward
    var prevTop = b.base;
    for (j = 0; j < parts.length; j++) {
      var tierTop = b.base - H * parts[j][0], tw = b.w * parts[j][1], tx = b.x + (b.w - tw) / 2;
      var bb = {}; for (var kk in b) bb[kk] = b[kk];
      bb.x = tx; bb.w = tw; bb.top = tierTop; bb.base = prevTop + (j ? 2 * E.s : 0); bb.seed = (b.seed || 1) + j * 17;
      if (j < parts.length - 1) { bb.mast = 0; bb.turb = 0; bb.vawt = 0; bb.roofTrees = b.terrace ? Math.max(1, Math.round(tw / (6 * E.s))) : 0; }
      tower(ctx, bb, E);
      prevTop = tierTop;
    }
  }
  /* inverted-Y cable-stayed bridge (Zakim-like silhouette, original drawing) */
  function stayBridge(ctx, o) {
    var s = o.s, dk = o.deck, th = o.thick, i, j;
    ctx.save(); ctx.lineCap = 'round';
    // cables
    ctx.strokeStyle = o.cable; ctx.lineWidth = Math.max(0.5, 0.45 * s); ctx.globalAlpha = o.cableA || 0.85; ctx.beginPath();
    for (i = 0; i < o.towers.length; i++) {
      var T = o.towers[i], tx = T[0], ty = T[1], hgt = dk - ty, span = T[2];
      for (j = 0; j < 9; j++) {
        var ay = ty + hgt * (0.06 + j * 0.035), reach = span * (1 - j * 0.1);
        ctx.moveTo(tx, ay); ctx.lineTo(tx - reach, dk);
        ctx.moveTo(tx, ay); ctx.lineTo(tx + reach, dk);
      }
    }
    ctx.stroke(); ctx.globalAlpha = 1;
    // towers
    for (i = 0; i < o.towers.length; i++) {
      var U = o.towers[i], ux = U[0], uy = U[1], hg = dk - uy, joint = dk - hg * 0.22, leg = hg * 0.16, pw = Math.max(1, hg * 0.035);
      ctx.fillStyle = lg(ctx, ux - leg, 0, ux + leg, 0, [[0, o.shade], [o.litSide > 0 ? 0.3 : 0.7, o.col], [1, o.litSide > 0 ? o.lit : o.shade]]);
      ctx.beginPath();
      ctx.moveTo(ux - leg, o.water); ctx.lineTo(ux - pw, joint); ctx.lineTo(ux - pw * 0.55, uy + pw * 2); ctx.lineTo(ux, uy - pw * 1.5);
      ctx.lineTo(ux + pw * 0.55, uy + pw * 2); ctx.lineTo(ux + pw, joint); ctx.lineTo(ux + leg, o.water);
      ctx.lineTo(ux + leg - pw * 1.1, o.water); ctx.lineTo(ux, joint + pw * 3); ctx.lineTo(ux - leg + pw * 1.1, o.water); ctx.closePath(); ctx.fill();
      if (o.glowTop) glow(ctx, ux, uy - pw, 5 * s, o.glowTop, 0.8);
    }
    // deck
    ctx.fillStyle = o.col; ctx.fillRect(o.x0, dk - th * 0.5, o.x1 - o.x0, th);
    ctx.fillStyle = o.shade; ctx.fillRect(o.x0, dk + th * 0.15, o.x1 - o.x0, th * 0.4);
    ctx.fillStyle = o.lit; ctx.fillRect(o.x0, dk - th * 0.5, o.x1 - o.x0, Math.max(0.5, th * 0.25));
    ctx.restore();
  }
  /* distant row of brick rowhouses with mansards, sitting on `base` */
  function rowhouses(ctx, x0, x1, base, sz, pal, r, E) {
    var x = x0;
    while (x < x1) {
      var hw = (5 + r() * 3.5) * sz, hh = (10 + r() * 6) * sz, col = pick(pal.bricks, r), mh = hh * 0.22;
      ctx.fillStyle = lg(ctx, 0, base - hh, 0, base, [[0, mix(col, pal.lit, 0.25)], [1, mix(col, pal.haze, 0.25)]]);
      ctx.fillRect(x, base - hh, hw + 0.5, hh);
      // bay window lit strip
      ctx.fillStyle = rgba(pal.lit, 0.35); ctx.fillRect(x + hw * 0.1, base - hh * 0.85, hw * 0.35, hh * 0.75);
      // mansard
      ctx.fillStyle = pal.roof; ctx.beginPath(); ctx.moveTo(x - 0.3, base - hh); ctx.lineTo(x + hw * 0.08, base - hh - mh); ctx.lineTo(x + hw * 0.92, base - hh - mh); ctx.lineTo(x + hw + 0.3, base - hh); ctx.fill();
      ctx.fillStyle = pal.trim; ctx.fillRect(x, base - hh - 0.6 * sz, hw, 0.7 * sz);
      // windows
      rects(ctx, 8, [[pal.win, 0.85], [pal.winLit, 0.9]], function (i) {
        var cxi = i % 2, cyi = (i / 2) | 0; if (cyi > 2) return null;
        return [x + hw * (0.15 + cxi * 0.45), base - hh * (0.8 - cyi * 0.25), hw * 0.22, hh * 0.13, r() < (pal.litP || 0.1) ? 1 : 0];
      });
      if (r() < 0.5) { ctx.fillStyle = pal.roof; ctx.fillRect(x + hw * 0.7, base - hh - mh - 2 * sz, 1.2 * sz, 2.2 * sz); }
      x += hw;
    }
  }
  /* a line of tree crowns between x0..x1 along y(x) */
  function treeRow(ctx, x0, x1, yf, Rmin, Rmax, pal, r, lx, ly, gap) {
    for (var x = x0; x < x1; x += (Rmin + Rmax) * (gap || 0.7) * (0.6 + r() * 0.6)) {
      var R = lerp(Rmin, Rmax, r());
      clump(ctx, x, yf(x) - R * 0.6, R, pal, r, lx, ly, true, 0.8);
    }
  }
  function boat(ctx, x, y, sz, sail, hull, shade) {
    ctx.fillStyle = sail; ctx.beginPath(); ctx.moveTo(x, y - sz * 1.7); ctx.lineTo(x + sz * 0.75, y - sz * 0.2); ctx.lineTo(x, y - sz * 0.2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = shade || sail; ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.moveTo(x - sz * 0.08, y - sz * 1.25); ctx.lineTo(x - sz * 0.5, y - sz * 0.25); ctx.lineTo(x - sz * 0.08, y - sz * 0.25); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
    ctx.fillStyle = hull; ctx.beginPath(); ctx.moveTo(x - sz * 0.6, y - sz * 0.2); ctx.lineTo(x + sz * 0.85, y - sz * 0.2); ctx.lineTo(x + sz * 0.6, y); ctx.lineTo(x - sz * 0.45, y); ctx.closePath(); ctx.fill();
  }
  function drawDrone(ctx, x, y, sz, body, blink, blinkCol) {
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.ellipse(x, y, sz, sz * 0.32, 0, 0, TAU); ctx.fill();
    ctx.fillRect(x - sz * 1.4, y - sz * 0.5, sz * 2.8, sz * 0.18);
    ctx.globalAlpha = 0.55; ctx.beginPath(); ctx.ellipse(x - sz * 1.4, y - sz * 0.55, sz * 0.7, sz * 0.12, 0, 0, TAU); ctx.ellipse(x + sz * 1.4, y - sz * 0.55, sz * 0.7, sz * 0.12, 0, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
    ctx.fillStyle = '#f5b82e'; ctx.fillRect(x - sz * 0.35, y + sz * 0.25, sz * 0.7, sz * 0.55);
    if (blink > 0) { var sp = glowSpr(blinkCol || '#ff5a4a', true); if (sp) { ctx.globalAlpha = blink; ctx.drawImage(sp, x - sz * 1.6, y - sz * 1.6, sz * 3.2, sz * 3.2); ctx.globalAlpha = 1; } }
  }
  function drawCabin(ctx, x, y, sz, body, glassCol, hanger, lit) {
    ctx.strokeStyle = hanger; ctx.lineWidth = Math.max(0.6, sz * 0.12);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + sz * 0.9); ctx.stroke();
    ctx.fillStyle = hanger; ctx.fillRect(x - sz * 0.35, y - sz * 0.12, sz * 0.7, sz * 0.24);
    ctx.fillStyle = body; ctx.beginPath(); rrect(ctx, x - sz * 0.9, y + sz * 0.85, sz * 1.8, sz * 1.25, sz * 0.45); ctx.fill();
    ctx.fillStyle = glassCol; ctx.beginPath(); rrect(ctx, x - sz * 0.72, y + sz * 1.05, sz * 1.44, sz * 0.48, sz * 0.18); ctx.fill();
    if (lit) { var sp = glowSpr(lit); if (sp) { ctx.globalAlpha = 0.6; ctx.drawImage(sp, x - sz * 2.2, y - sz * 0.6, sz * 4.4, sz * 4.4); ctx.globalAlpha = 1; } }
  }
  function drawBird(ctx, x, y, sz, flap) {
    var f = Math.sin(flap) * sz * 0.6;
    ctx.beginPath(); ctx.moveTo(x - sz, y - f); ctx.quadraticCurveTo(x - sz * 0.4, y - sz * 0.35, x, y); ctx.quadraticCurveTo(x + sz * 0.4, y - sz * 0.35, x + sz, y - f); ctx.stroke();
  }

  /* ============================== HOME: dawn through a Back Bay bay window ============================== */
  var homeL = memo(function (w, h) {
    var s = S(w, h), L = {
      s: s, hz: h * 0.392, near: h * 0.505, sunX: w * 0.635, sunY: h * 0.33,
      ceil: h * 0.032, wy0: h * 0.062, wy1: h * 0.556,
      cx0: w * 0.235, cx1: w * 0.765, px: w * 0.045,
      seat: h * 0.612, apron: h * 0.705
    };
    L.panes = [
      [[w * 0.03, h * 0.044], [L.cx0 - L.px, L.wy0], [L.cx0 - L.px, L.wy1], [w * 0.03, h * 0.582]],
      [[L.cx0, L.wy0], [L.cx1, L.wy0], [L.cx1, L.wy1], [L.cx0, L.wy1]],
      [[L.cx1 + L.px, L.wy0], [w * 0.97, h * 0.044], [w * 0.97, h * 0.582], [L.cx1 + L.px, L.wy1]]
    ];
    // gondola cable: from the near bank (left, low) over a far-bank pylon (right)
    var A = [-w * 0.06, h * 0.468], C = [w * 0.86, h * 0.338], B = [w * 1.08, h * 0.318];
    L.gond = { A: A, C: C, B: B, sag1: h * 0.022, sag2: h * 0.004 };
    L.cable = function (u) { // u 0..1 along x from A to B
      var x = lerp(A[0], B[0], u), t;
      if (x <= C[0]) { t = (x - A[0]) / (C[0] - A[0]); return [x, lerp(A[1], C[1], t) + L.gond.sag1 * 4 * t * (1 - t)]; }
      t = (x - C[0]) / (B[0] - C[0]); return [x, lerp(C[1], B[1], t) + L.gond.sag2 * 4 * t * (1 - t)];
    };
    L.tableTop = h * 0.84; L.tableFront = h * 0.872; L.tableX0 = w * 0.2; L.tableX1 = w * 0.8;
    return L;
  });
  function panesPath(ctx, panes) { ctx.beginPath(); for (var i = 0; i < panes.length; i++) { var p = panes[i]; ctx.moveTo(p[0][0], p[0][1]); for (var j = 1; j < p.length; j++) ctx.lineTo(p[j][0], p[j][1]); ctx.closePath(); } }

  PAINT.home = {
    focus: { x: 0.635, y: 0.33 },
    paint: function (ctx, w, h) {
      try {
        var L = homeL(w, h), r = rng(40101), s = L.s, hz = L.hz, sx = L.sunX, sy = L.sunY, i, x, y;
        mark('start', ctx);
        /* ---------- outside: dawn sky ---------- */
        var SKY = [[0, '#4f5aa4'], [0.14, '#6f72bc'], [0.34, '#a690cc'], [0.54, '#e0a8c0'], [0.72, '#f7bea6'], [0.88, '#ffd6a2'], [1, '#ffe6bc']];
        ctx.fillStyle = lg(ctx, 0, 0, 0, hz, SKY);
        ctx.fillRect(0, 0, w, hz + 2);
        mark('skygrad', ctx);
        skyStrokes(ctx, -20 * s, w + 20 * s, 0, hz, SKY, 420, r, s, 0.16, '#ffd8b0', '#8a80c8');
        mark('strokes', ctx);
        glow(ctx, sx, sy, Math.max(w, h) * 0.7, '#ffc490', 0.5);
        glow(ctx, sx, sy, w * 0.55, '#ffd9a8', 0.5);
        // high cirrus, pink-gold
        for (i = 0; i < 8; i++) wisp(ctx, w * (0.05 + r() * 0.9), h * (0.06 + r() * 0.16), w * (0.3 + r() * 0.3), h * 0.007, i % 2 ? '#ffd8c0' : '#f7b8c8', 0.22, r);
        mark('glowwisp', ctx);
        // cumulus lit from below-right by the low sun
        var cl = [[0.36, 0.17, 0.62, 0.075, 1], [0.86, 0.105, 0.44, 0.06, 0.95], [0.08, 0.27, 0.3, 0.035, 0.9], [0.93, 0.255, 0.26, 0.03, 0.85]];
        for (i = 0; i < cl.length; i++) {
          var ccx = w * cl[i][0], ccy = h * cl[i][1], vx = sx - ccx, vy = (sy - ccy) * 1.6, vl = Math.sqrt(vx * vx + vy * vy) || 1;
          cloudForm(ctx, ccx, ccy, w * cl[i][2], h * cl[i][3], r, { lit: '#ffdcaa', mid: '#d792ae', shade: '#6e62a6', top: '#9a8fd0', al: cl[i][4], lx: vx / vl, ly: vy / vl, base: 0.55, halo: 0.15, seam: 0.22 });
        }
        // long gold-lit stratus streaks just above the skyline
        for (i = 0; i < 3; i++) cloudForm(ctx, w * (0.2 + i * 0.32), h * (0.225 + i * 0.012), w * 0.5, h * 0.016, r, { lit: '#ffe6b8', mid: '#f0a8a8', shade: '#9a7cb0', al: 0.8, lx: 0.2, ly: 0.98, base: 0.8, halo: 0.2, billows: 6 });
        // low glowing haze bands near the horizon
        for (i = 0; i < 4; i++) wisp(ctx, w * (0.1 + r() * 0.8), hz - h * (0.02 + r() * 0.05), w * 0.4, h * 0.006, '#ffe0b8', 0.25, r);
        mark('sky', ctx);
        /* ---------- city across the Charles ---------- */
        var E = { s: s, W: w, vpX: w * 0.5, sunX: sx, haze: '#f2c2b4', face: '#8d86b6', pale: '#c9bfd8', lit: '#f6b991', shade: '#6c679a', rim: '#ffdcae', rimA: 0.75,
          glass: ['#a9a4d8', '#d3abc6', '#f4c2a8'], win: '#5c5a8a', winLit: '#ffd690', litP: 0.05, mull: '#4a4878', sheen: '#fff0e0',
          green: ['#26323a', '#34463e', '#4a6040', '#7a8a4c', '#ffd690'] };
        // far layer: hazy towers
        var far = rng(40111);
        for (x = -w * 0.02; x < w * 1.02;) {
          var bw = (10 + far() * 18) * s, cdist = Math.abs(x / w - 0.45), bh = h * (0.025 + far() * 0.05 + (cdist < 0.3 ? 0.06 * (1 - cdist / 0.3) : 0));
          if (Math.abs(x + bw / 2 - sx) < w * 0.08) bh = Math.min(bh, hz - sy - h * 0.02);
          tower(ctx, { x: x, w: bw, top: hz - bh, base: hz, kind: far() < 0.4 ? 'glass' : 'stone', k: 0.72, seed: (x * 7) | 0, slant: far() < 0.2 ? bw * 0.4 : 0, turb: far() < 0.15 ? 1 : 0 }, E);
          x += bw * (0.7 + far() * 0.6);
        }
        // the sun just clearing the far skyline, blooming into it
        glow(ctx, sx, sy, w * 0.26, '#fff0c8', 0.85);
        ctx.fillStyle = '#fffaf0'; ctx.beginPath(); ctx.arc(sx, sy, w * 0.03, 0, TAU); ctx.fill();
        glow(ctx, sx, sy, w * 0.06, '#ffffff', 0.9);
        mark('far', ctx);
        // the white cable-stayed bridge downstream (left)
        stayBridge(ctx, { s: s, deck: hz - h * 0.016, water: hz, thick: 2.2 * s, x0: -w * 0.05, x1: w * 0.4, towers: [[w * 0.09, hz - h * 0.085, w * 0.11], [w * 0.29, hz - h * 0.078, w * 0.1]],
          col: '#eee4ec', shade: '#b4a8c8', lit: '#fff3e2', cable: '#fff0ea', cableA: 0.7, litSide: 1 });
        haze(ctx, -w * 0.1, hz - h * 0.12, w * 0.55, hz + h * 0.01, '#f2c2b4', 0.25);
        mark('bridge', ctx);
        // mid layer: Back Bay & downtown towers, old and new
        var M = [
          { x: 0.0, w: 0.07, t: 0.352, kind: 'stone', roofTrees: 2 },
          { x: 0.15, w: 0.08, t: 0.356, kind: 'dome' },
          { x: 0.33, w: 0.065, t: 0.262, kind: 'garden', turb: 1, roofTrees: 2 },
          { x: 0.4, w: 0.05, t: 0.3, kind: 'stone', solar: 1 },
          { x: 0.445, w: 0.055, t: 0.205, kind: 'glass', slant: -0.02 },
          { x: 0.505, w: 0.06, t: 0.222, kind: 'stone', mast: 0.22, wsp: 2.2 },
          { x: 0.565, w: 0.03, t: 0.31, kind: 'spire', spire: 0.06 },
          { x: 0.6, w: 0.07, t: 0.352, kind: 'stone', roofTrees: 3 },
          { x: 0.68, w: 0.06, t: 0.335, kind: 'stone', vawt: 3 },
          { x: 0.74, w: 0.07, t: 0.232, kind: 'twist', turb: 2, animTurb: 1, vgarden: 1 },
          { x: 0.82, w: 0.055, t: 0.268, kind: 'glass', slant: 0.015 },
          { x: 0.875, w: 0.07, t: 0.246, kind: 'garden', vawt: 2 },
          { x: 0.945, w: 0.07, t: 0.29, kind: 'stone', roofTrees: 2 }
        ];
        for (i = 0; i < M.length; i++) {
          var m = M[i], mb = { x: w * m.x, w: w * m.w, top: h * m.t, base: hz, kind: m.kind, k: 0.22 + (i % 3) * 0.05, seed: 40200 + i * 13, slant: (m.slant || 0) * h, mast: m.mast, turb: m.turb, animTurb: m.animTurb, vawt: m.vawt, roofTrees: m.roofTrees, solar: m.solar, vgarden: m.vgarden, spire: (m.spire || 0) * h, wsp: m.wsp };
          if (m.kind === 'garden' && i === 2) stepped(ctx, mb, E, [[0.62, 1], [0.86, 0.8], [1, 0.58]]); else tower(ctx, mb, E);
        }
        // sun bloom over the skyline (backlight eats the edges)
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, sx, sy + h * 0.02, w * 0.3, '#ff9a60', 0.22); ctx.restore();
        band(ctx, 0, w, hz - h * 0.06, hz + h * 0.01, '#f6c8b0', 0.5);
        mark('mid', ctx);
        // Back Bay rowhouses + Esplanade trees on the far bank
        rowhouses(ctx, -2 * s, w + 4 * s, hz - h * 0.002, s * 1.05, { bricks: ['#b0705e', '#a5645a', '#c08470', '#9a6a66', '#c49a86'], lit: '#ffd2a8', haze: '#f2c2b4', roof: '#5e5878', trim: '#f4dcc8', win: '#4e4a72', winLit: '#ffd690', litP: 0.12 }, r, E);
        var tpal = ['#3e4652', '#4e5c56', '#6a7a5e', '#b0a070', '#ffd49a'];
        treeRow(ctx, -4 * s, w + 6 * s, function () { return hz + h * 0.004; }, 3.5 * s, 7 * s, tpal, r, 0.6, -0.8, 0.55);
        ctx.fillStyle = '#7a6a88'; ctx.fillRect(0, hz + h * 0.001, w, h * 0.004);
        ctx.fillStyle = 'rgba(255,220,180,0.5)'; ctx.fillRect(0, hz + h * 0.001, w, 0.8 * s);
        mark('rowtrees', ctx);
        /* ---------- the Charles ---------- */
        var wy0 = hz + h * 0.005, wy1 = L.near + h * 0.03;
        ctx.fillStyle = lg(ctx, 0, wy0, 0, wy1, [[0, '#f4c6aa'], [0.3, '#d6aec0'], [0.7, '#9e94c4'], [1, '#7d7cb4']]);
        ctx.fillRect(0, wy0, w, wy1 - wy0);
        mark('watergrad', ctx);
        reflect(ctx, w, wy0, wy1, 0.55, 2.2 * s, 0.9 / s, 3, 1.05);
        ctx.fillStyle = lg(ctx, 0, wy0, 0, wy1, [[0, 'rgba(248,200,170,0.25)'], [0.5, 'rgba(170,150,200,0.25)'], [1, 'rgba(110,108,170,0.45)']]); ctx.fillRect(0, wy0, w, wy1 - wy0);
        mark('reflect', ctx);
        // glitter path under the sun
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = lg(ctx, sx - w * 0.12, 0, sx + w * 0.12, 0, [[0, 'rgba(255,200,140,0)'], [0.5, 'rgba(255,214,160,0.35)'], [1, 'rgba(255,200,140,0)']]); ctx.fillRect(sx - w * 0.12, wy0, w * 0.24, wy1 - wy0);
        ctx.restore();
        batch(ctx, 1500, [['#fff1dc', 0.6 * s, 0.45], ['#6a6aa4', 0.7 * s, 0.35], ['#ffd2b0', 0.6 * s, 0.4]], function () {
          var p = Math.pow(r(), 1.1), yy = wy0 + p * (wy1 - wy0), xx = r() * w, l = (1 + p * 9 + r() * 4) * s, b = (r() * 3) | 0;
          if (b === 0 && Math.abs(xx - sx) > w * (0.08 + p * 0.15) && r() < 0.7) b = 2;
          return [xx, yy, xx + l, yy, b];
        });
        dots(ctx, 380, [['#ffffff', 0.9], ['#fff0c8', 0.7]], function () {
          var p = r(), yy = wy0 + p * (wy1 - wy0) * 0.9, xx = sx + (r() - 0.5) * w * (0.04 + p * 0.2) * (0.4 + r());
          return [xx, yy, (0.35 + r() * 0.6 * (0.3 + p)) * s, r() < 0.5 ? 0 : 1];
        });
        mark('ripples', ctx);
        // moored sailboats
        var bts = [[0.16, 0.415, 4.2], [0.3, 0.432, 5], [0.86, 0.425, 4.6], [0.05, 0.45, 5.5]];
        for (i = 0; i < bts.length; i++) {
          var bx = w * bts[i][0], by = h * bts[i][1], bs = bts[i][2] * s;
          ctx.globalAlpha = 0.3; boat(ctx, bx, by + bs * 1.7, -bs * 0.9, '#ffffff', '#4a4a7a'); ctx.globalAlpha = 1;
          ctx.save(); ctx.translate(bx, by); ctx.scale(1, -0.8); ctx.globalAlpha = 0.25; boat(ctx, 0, 0, bs, '#fff4ea', '#3e3e6a'); ctx.restore();
          boat(ctx, bx, by, bs, '#fff7ee', '#3e3e6a', '#f2c8c0');
        }
        mark('boats', ctx);
        // near bank: Memorial Drive trees, backlit
        var npal = ['#1a2226', '#26342e', '#3c5034', '#7e8e48', '#ffcf86'];
        ctx.fillStyle = lg(ctx, 0, L.near, 0, L.wy1, [[0, '#24302c'], [1, '#18201e']]);
        ridge(ctx, 0, w, 4, function (xx) { return L.near + h * 0.016 - h * 0.016 * fbm(xx / w * 4, 4301, 3); }, h * 0.6, null); ctx.fill();
        // back row of crowns, then a bigger front row reaching the sill
        for (x = -10 * s; x < w + 10 * s; x += (12 + r() * 10) * s) {
          var ty = L.near + h * 0.01 - h * 0.018 * fbm(x / w * 4, 4301, 3) - r() * h * 0.01, R = (9 + r() * 8) * s;
          clump(ctx, x, ty + R * 0.3, R, npal, r, (sx - x) / w > 0 ? 0.6 : -0.6, -0.8, true, 0.75);
        }
        for (x = -10 * s; x < w + 10 * s; x += (18 + r() * 14) * s) {
          var ty2 = L.near + h * 0.035 + r() * h * 0.012, R2 = (14 + r() * 10) * s;
          clump(ctx, x, ty2 + R2 * 0.3, R2, npal, r, (sx - x) / w > 0 ? 0.5 : -0.5, -0.85, false, 0.7);
        }
        // a lamp-lit path glimpse between the trees
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, sx, L.near + h * 0.01, w * 0.3, '#ffb070', 0.18); ctx.restore();
        mark('neartrees', ctx);
        // gondola: far-bank pylon + cable
        var G = L.gond;
        ctx.fillStyle = lg(ctx, G.C[0] - 3 * s, 0, G.C[0] + 3 * s, 0, [[0, '#8a84aa'], [0.5, '#e8dcea'], [1, '#6e6890']]);
        ctx.beginPath(); ctx.moveTo(G.C[0] - 3 * s, hz + h * 0.004); ctx.lineTo(G.C[0] - 0.8 * s, G.C[1]); ctx.lineTo(G.C[0] + 0.8 * s, G.C[1]); ctx.lineTo(G.C[0] + 3 * s, hz + h * 0.004); ctx.fill();
        ctx.fillStyle = '#e8dcea'; ctx.fillRect(G.C[0] - 6 * s, G.C[1] - 0.6 * s, 12 * s, 1.6 * s);
        ctx.strokeStyle = '#4a4466'; ctx.lineWidth = Math.max(0.8, 0.8 * s); ctx.beginPath();
        for (i = 0; i <= 60; i++) { var cp = L.cable(i / 60); if (!i) ctx.moveTo(cp[0], cp[1]); else ctx.lineTo(cp[0], cp[1]); }
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,220,180,0.6)'; ctx.lineWidth = Math.max(0.5, 0.35 * s); ctx.stroke();
        // atmosphere + sun bloom over everything outside
        ctx.save(); ctx.globalCompositeOperation = 'screen';
        glow(ctx, sx, sy, w * 0.45, '#ffb070', 0.3);
        ctx.restore();
        mark('gondola', ctx);
        /* ---------- the room ---------- */
        // wall with the bay window cut out
        ctx.save();
        ctx.beginPath(); ctx.rect(0, 0, w, h);
        for (i = 0; i < L.panes.length; i++) { var pn = L.panes[i]; ctx.moveTo(pn[0][0], pn[0][1]); for (var q = 1; q < 4; q++) ctx.lineTo(pn[q][0], pn[q][1]); ctx.closePath(); }
        ctx.fillStyle = lg(ctx, 0, 0, 0, h, [[0, '#a8756a'], [0.3, '#c48c78'], [0.6, '#b37c6c'], [1, '#6e4a44']]);
        ctx.fill('evenodd');
        ctx.restore();
        // warm bounce light around the window
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        glow(ctx, w * 0.5, h * 0.33, w * 0.75, '#ff9a60', 0.12);
        ctx.restore();
        // ceiling beam / crown molding
        ctx.fillStyle = lg(ctx, 0, 0, 0, L.ceil + 6 * s, [[0, '#5a3a30'], [0.7, '#8a5a44'], [1, '#c08a62']]); ctx.fillRect(0, 0, w, L.ceil);
        ctx.fillStyle = 'rgba(255,214,170,0.35)'; ctx.fillRect(0, L.ceil - 1.2 * s, w, 1.2 * s);
        // window casings (honey wood)
        var wood = ['#7a4a2e', '#b87a4c', '#e2a46a', '#ffd8a0'];
        function casing(pn, lw) {
          ctx.save(); ctx.lineJoin = 'round';
          poly(ctx, pn); ctx.strokeStyle = wood[0]; ctx.lineWidth = lw * 1.25; ctx.stroke();
          poly(ctx, pn); ctx.strokeStyle = wood[1]; ctx.lineWidth = lw; ctx.stroke();
          poly(ctx, pn); ctx.strokeStyle = wood[2]; ctx.lineWidth = lw * 0.3; ctx.stroke();
          ctx.restore();
        }
        for (i = 0; i < L.panes.length; i++) casing(L.panes[i], 7 * s);
        // posts between the panes
        [[L.cx0 - L.px, L.cx0], [L.cx1, L.cx1 + L.px]].forEach(function (P, k) {
          ctx.fillStyle = lg(ctx, P[0], 0, P[1], 0, k ? [[0, wood[3]], [0.25, wood[2]], [0.7, wood[1]], [1, wood[0]]] : [[0, wood[0]], [0.3, wood[1]], [0.75, wood[2]], [1, wood[3]]]);
          ctx.fillRect(P[0] - 2 * s, L.wy0 - 4 * s, P[1] - P[0] + 4 * s, L.wy1 - L.wy0 + 8 * s);
          batch(ctx, 40, [['#6a3a22', 0.5 * s, 0.35], ['#ffd8a0', 0.4 * s, 0.25]], function () { var xx = lerp(P[0], P[1], r()), yy = lerp(L.wy0, L.wy1, r()); return [xx, yy, xx + (r() - 0.5) * s, yy + (8 + r() * 20) * s, r() < 0.6 ? 0 : 1]; });
        });
        // side panes are double-hung: meeting rails
        [0, 2].forEach(function (k) {
          var pn = L.panes[k], ry0 = lerp(pn[0][1], pn[3][1], 0.4), ry1 = lerp(pn[1][1], pn[2][1], 0.4);
          ctx.strokeStyle = wood[1]; ctx.lineWidth = 5 * s; ctx.beginPath(); ctx.moveTo(pn[0][0], ry0 + (k ? ry1 - ry0 : 0)); ctx.lineTo(pn[1][0], k ? ry0 : ry1); ctx.stroke();
          ctx.strokeStyle = wood[2]; ctx.lineWidth = 1.2 * s; ctx.stroke();
        });
        mark('wall', ctx);
        /* window seat */
        var sb = L.wy1 + 3 * s;
        ctx.beginPath(); ctx.moveTo(0, h * 0.592); ctx.lineTo(w * 0.03, h * 0.586); ctx.lineTo(L.cx0 - L.px, sb); ctx.lineTo(L.cx1 + L.px, sb); ctx.lineTo(w * 0.97, h * 0.586); ctx.lineTo(w, h * 0.592); ctx.lineTo(w, L.seat); ctx.lineTo(0, L.seat); ctx.closePath();
        ctx.fillStyle = lg(ctx, 0, sb, 0, L.seat, [[0, '#4fb3a6'], [0.5, '#2f8e86'], [1, '#226e6a']]); ctx.fill();
        // sunlight on the cushion
        ctx.save(); ctx.clip(); ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = lg(ctx, sx - w * 0.35, 0, sx + w * 0.25, 0, [[0, 'rgba(255,190,120,0)'], [0.5, 'rgba(255,200,130,0.35)'], [1, 'rgba(255,190,120,0)']]); ctx.fillRect(0, sb, w, L.seat - sb);
        ctx.restore();
        ctx.fillStyle = '#1c5652'; ctx.fillRect(0, L.seat - 2 * s, w, 3 * s);
        // pillows
        function pillow(px, py, pw, ph, c1, c2, rot) {
          ctx.save(); ctx.translate(px, py); ctx.rotate(rot);
          ctx.fillStyle = 'rgba(20,30,40,0.3)'; ctx.beginPath(); ctx.ellipse(pw * 0.1, ph * 0.5, pw * 0.55, ph * 0.18, 0, 0, TAU); ctx.fill();
          ctx.fillStyle = lg(ctx, 0, -ph / 2, 0, ph / 2, [[0, c1], [1, c2]]);
          ctx.beginPath(); ctx.moveTo(-pw / 2, -ph / 2); ctx.quadraticCurveTo(0, -ph * 0.35, pw / 2, -ph / 2); ctx.quadraticCurveTo(pw * 0.4, 0, pw / 2, ph / 2); ctx.quadraticCurveTo(0, ph * 0.35, -pw / 2, ph / 2); ctx.quadraticCurveTo(-pw * 0.4, 0, -pw / 2, -ph / 2); ctx.fill();
          ctx.fillStyle = 'rgba(255,240,220,0.35)'; ctx.beginPath(); ctx.ellipse(pw * 0.1, -ph * 0.15, pw * 0.25, ph * 0.12, -0.3, 0, TAU); ctx.fill();
          ctx.restore();
        }
        pillow(w * 0.12, h * 0.585, 46 * s, 34 * s, '#ff9a86', '#d8604f', -0.25);
        pillow(w * 0.205, h * 0.592, 36 * s, 28 * s, '#ffd36a', '#d89a2e', 0.15);
        pillow(w * 0.88, h * 0.588, 44 * s, 32 * s, '#a99af0', '#6c5ce7', 0.2);
        // seat apron with panels
        ctx.fillStyle = lg(ctx, 0, L.seat, 0, L.apron, [[0, '#8a5638'], [1, '#5e3a28']]); ctx.fillRect(0, L.seat + s, w, L.apron - L.seat);
        for (i = 0; i < 4; i++) {
          var ax = w * (0.04 + i * 0.24), aw = w * 0.2;
          ctx.fillStyle = 'rgba(40,20,12,0.35)'; ctx.fillRect(ax, L.seat + h * 0.018, aw, L.apron - L.seat - h * 0.036);
          ctx.fillStyle = 'rgba(255,200,150,0.25)'; ctx.fillRect(ax, L.apron - h * 0.018, aw, 1.2 * s); ctx.fillRect(ax + aw - 1.2 * s, L.seat + h * 0.018, 1.2 * s, L.apron - L.seat - h * 0.036);
        }
        ctx.fillStyle = '#4a2c1e'; ctx.fillRect(0, L.apron - 2 * s, w, 4 * s);
        /* warm wood floor in perspective, a soft round rug */
        var fy0 = L.apron + 2 * s, vpx = w * 0.5, vpy = h * 0.36;
        ctx.fillStyle = lg(ctx, 0, fy0, 0, h, [[0, '#6a3e28'], [0.25, '#8a5434'], [1, '#a86a40']]); ctx.fillRect(0, fy0, w, h - fy0);
        ctx.save(); ctx.beginPath(); ctx.rect(0, fy0, w, h - fy0); ctx.clip();
        ctx.strokeStyle = 'rgba(50,25,14,0.45)'; ctx.lineWidth = 1 * s; ctx.beginPath();
        for (i = -14; i <= 14; i++) { var bxp = vpx + i * w * 0.11; ctx.moveTo(lerp(vpx, bxp, (fy0 - vpy) / (h - vpy)), fy0); ctx.lineTo(bxp, h); }
        ctx.stroke();
        batch(ctx, 260, [['#4a2414', 0.7 * s, 0.3], ['#e8a870', 0.5 * s, 0.25]], function () {
          var yy = lerp(fy0, h, Math.pow(r(), 0.8)), xx = r() * w, k2 = (yy - vpy) / (h - vpy), l = (10 + r() * 30) * s * k2;
          var dx = (xx - vpx) / (yy - vpy);
          return [xx, yy, xx + dx * l, yy + l, r() < 0.6 ? 0 : 1];
        });
        ctx.fillStyle = lg(ctx, 0, fy0, 0, fy0 + h * 0.05, [[0, 'rgba(30,14,8,0.55)'], [1, 'rgba(30,14,8,0)']]); ctx.fillRect(0, fy0, w, h * 0.05);
        ctx.restore();
        // rug
        var rcx = w * 0.5, rcy = h * 0.875, rrx = w * 0.46, rry = h * 0.085;
        ctx.fillStyle = 'rgba(40,18,10,0.3)'; ctx.beginPath(); ctx.ellipse(rcx, rcy + 3 * s, rrx * 1.02, rry * 1.04, 0, 0, TAU); ctx.fill();
        [[1, '#2f8e86'], [0.92, '#f2e2c8'], [0.86, '#ff8a76'], [0.8, '#f2e2c8'], [0.66, '#4fb3a6'], [0.6, '#f6e8d2'], [0.3, '#ffd36a']].forEach(function (R) {
          ctx.fillStyle = R[1]; ctx.beginPath(); ctx.ellipse(rcx, rcy, rrx * R[0], rry * R[0], 0, 0, TAU); ctx.fill();
        });
        dots(ctx, 900, [['#ffffff', 0.12], ['#3a2418', 0.1]], function () { var a = r() * TAU, d = Math.sqrt(r()); return [rcx + Math.cos(a) * rrx * d, rcy + Math.sin(a) * rry * d, (0.5 + r() * 0.8) * s, r() < 0.5 ? 0 : 1]; });
        ctx.fillStyle = lg(ctx, 0, rcy - rry, 0, rcy + rry, [[0, 'rgba(40,20,10,0.25)'], [0.5, 'rgba(40,20,10,0)'], [1, 'rgba(40,20,10,0.15)']]);
        ctx.beginPath(); ctx.ellipse(rcx, rcy, rrx, rry, 0, 0, TAU); ctx.fill();
        // sun patches on the floor through the three panes
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        [[0.08, 0.2, -0.16], [0.3, 0.7, 0], [0.8, 0.92, 0.16]].forEach(function (P) {
          ctx.fillStyle = lg(ctx, 0, fy0, 0, h, [[0, 'rgba(255,190,120,0.05)'], [0.4, 'rgba(255,200,130,0.2)'], [1, 'rgba(255,190,120,0.05)']]);
          ctx.beginPath(); ctx.moveTo(w * P[0], fy0 + h * 0.02); ctx.lineTo(w * P[1], fy0 + h * 0.02); ctx.lineTo(w * (P[1] + P[2] + 0.06), h); ctx.lineTo(w * (P[0] + P[2] - 0.02), h); ctx.fill();
        });
        ctx.restore();
        mark('seat', ctx);
        /* potted plant on the seat (left) and books (right) */
        var ppx = w * 0.055, ppy = h * 0.598;
        ctx.fillStyle = lg(ctx, ppx - 12 * s, 0, ppx + 12 * s, 0, [[0, '#c86a4a'], [0.6, '#e8946a'], [1, '#9a4a34']]);
        ctx.beginPath(); ctx.moveTo(ppx - 13 * s, ppy - 22 * s); ctx.lineTo(ppx + 13 * s, ppy - 22 * s); ctx.lineTo(ppx + 10 * s, ppy); ctx.lineTo(ppx - 10 * s, ppy); ctx.fill();
        ctx.fillStyle = '#7a3a2a'; ctx.fillRect(ppx - 14 * s, ppy - 24 * s, 28 * s, 4 * s);
        var lpal = ['#1f3a26', '#2f5a34', '#4f8a3e', '#9cc85a'];
        for (i = 0; i < 9; i++) {
          var la = -PI / 2 + (i - 4) * 0.28 + (r() - 0.5) * 0.2, ll = (34 + r() * 26) * s, lw = ll * 0.32;
          var lb = [ppx + Math.cos(la) * 6 * s, ppy - 24 * s + Math.sin(la) * 4 * s], lt = [lb[0] + Math.cos(la) * ll * 0.5, lb[1] + Math.sin(la) * ll * 0.5];
          ctx.strokeStyle = '#2f5a34'; ctx.lineWidth = 1.2 * s; ctx.beginPath(); ctx.moveTo(lb[0], lb[1]); ctx.lineTo(lt[0], lt[1]); ctx.stroke();
          ctx.beginPath(); leafPath(ctx, lt[0], lt[1], ll * 0.55, lw * 0.5, la + (r() - 0.5) * 0.4, true);
          ctx.fillStyle = lg(ctx, lt[0], lt[1], lt[0] + Math.cos(la) * ll * 0.5, lt[1] + Math.sin(la) * ll * 0.5, [[0, lpal[1]], [1, lpal[2 + (i % 2)]]]); ctx.fill();
          ctx.strokeStyle = 'rgba(220,255,160,0.35)'; ctx.lineWidth = 0.6 * s; ctx.stroke();
        }
        var bkx = w * 0.79, bky = h * 0.6;
        [['#6c5ce7', 30, 5], ['#16b3a6', 27, 4.5], ['#ff7a6b', 32, 5.5], ['#f5b82e', 25, 4]].forEach(function (B, k) {
          var bh2 = B[2] * s, bw2 = B[1] * s; bky -= bh2;
          ctx.fillStyle = B[0]; ctx.fillRect(bkx - bw2 / 2 + (k % 2 ? 2 : -2) * s, bky, bw2, bh2);
          ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.fillRect(bkx - bw2 / 2 + (k % 2 ? 2 : -2) * s + bw2 - 2 * s, bky + 0.8 * s, 1.5 * s, bh2 - 1.6 * s);
        });
        mark('plant', ctx);
        /* hanging pothos at the two posts */
        function hanger(px, py, seed, side) {
          var rr = rng(seed), v, k;
          ctx.strokeStyle = '#e8d4b4'; ctx.lineWidth = 1 * s; ctx.beginPath();
          ctx.moveTo(px, L.ceil); ctx.lineTo(px - 14 * s, py - 5 * s); ctx.moveTo(px, L.ceil); ctx.lineTo(px + 14 * s, py - 5 * s); ctx.moveTo(px, L.ceil); ctx.lineTo(px + 3 * s, py - 5 * s); ctx.stroke();
          ctx.fillStyle = '#c8a878'; ctx.beginPath(); ctx.arc(px, L.ceil + 2 * s, 2.2 * s, 0, TAU); ctx.fill();
          var vines = [];
          for (v = 0; v < 13; v++) {
            var u = v / 12 - 0.5, len = h * (0.06 + rr() * 0.13) * (1 - Math.abs(u) * 0.5), vx0 = px + u * 30 * s, vy0 = py;
            var vx1 = vx0 + u * w * 0.09 + side * (rr() - 0.3) * w * 0.03, vy1 = vy0 + len;
            vines.push([vx0, vy0, vx0 + u * w * 0.1, vy0 + len * 0.3, vx1, vy1]);
          }
          ctx.strokeStyle = '#2e4a24'; ctx.lineWidth = 1.1 * s; ctx.beginPath();
          vines.forEach(function (V) { ctx.moveTo(V[0], V[1]); ctx.quadraticCurveTo(V[2], V[3], V[4], V[5]); }); ctx.stroke();
          var buckets = [[], [], [], [], []];
          vines.forEach(function (V, vi) {
            var n = 9 + ((rr() * 5) | 0);
            for (k = 0; k < n; k++) {
              var t2 = (k + 0.4) / n, lx = bez(V[0], V[2], V[4], t2), ly = bez(V[1], V[3], V[5], t2), sz = (11 - t2 * 4.5) * s * (0.75 + rr() * 0.45);
              var a = PI / 2 + (k % 2 ? 1 : -1) * (0.7 + rr() * 0.7) + (rr() - 0.5) * 0.3;
              // light comes from the window behind: leaves on the outer, window side glow
              var lit = clamp(0.5 + (lx - px) / (40 * s) * -side * 0.5 + (rr() - 0.5) * 0.9 - (vi % 3 === 0 ? 0.4 : 0), 0, 1);
              buckets[Math.min(4, (lit * 5) | 0)].push([lx, ly, sz, sz * 0.66, a]);
            }
          });
          var bc = ['#173020', '#24482a', '#3f7434', '#6aa444', '#b6dc6e'];
          for (var b2 = 0; b2 < 5; b2++) { ctx.beginPath(); buckets[b2].forEach(function (Q) { leafPath(ctx, Q[0], Q[1], Q[2], Q[3], Q[4], true); }); ctx.fillStyle = bc[b2]; ctx.fill(); }
          ctx.beginPath(); buckets[3].concat(buckets[4]).forEach(function (Q) { ctx.moveTo(Q[0], Q[1]); ctx.lineTo(Q[0] + Math.cos(Q[4]) * Q[2] * 0.85, Q[1] + Math.sin(Q[4]) * Q[2] * 0.85); });
          ctx.strokeStyle = 'rgba(240,255,190,0.5)'; ctx.lineWidth = 0.55 * s; ctx.stroke();
          // pot (glazed ceramic) + leaves spilling over the rim
          ctx.fillStyle = lg(ctx, px - 17 * s, 0, px + 17 * s, 0, [[0, '#a8b8c4'], [0.35, '#f4f8fa'], [0.6, '#dfe8ec'], [1, '#8a98a6']]);
          ctx.beginPath(); ctx.moveTo(px - 18 * s, py - 8 * s); ctx.lineTo(px + 18 * s, py - 8 * s); ctx.quadraticCurveTo(px + 17 * s, py + 12 * s, px, py + 14 * s); ctx.quadraticCurveTo(px - 17 * s, py + 12 * s, px - 18 * s, py - 8 * s); ctx.fill();
          ctx.fillStyle = side < 0 ? '#ff7a6b' : '#16b3a6'; ctx.fillRect(px - 17.5 * s, py - 3 * s, 35 * s, 3 * s);
          ctx.beginPath();
          for (k = 0; k < 14; k++) { var a2 = -PI / 2 + (k - 6.5) * 0.24 + (rr() - 0.5) * 0.2; leafPath(ctx, px + (k - 6.5) * 2.8 * s, py - 7 * s, (9 + rr() * 6) * s, 5.5 * s, a2, true); }
          ctx.fillStyle = '#3a7032'; ctx.fill();
          ctx.beginPath();
          for (k = 0; k < 8; k++) { var a3 = -PI / 2 + (k - 3.5) * 0.3; leafPath(ctx, px + (k - 3.5) * 3.5 * s, py - 6 * s, (7 + rr() * 5) * s, 4.5 * s, a3, true); }
          ctx.fillStyle = '#6aa444'; ctx.fill();
          // a few trailing leaves in front of the pot
          ctx.beginPath();
          for (k = 0; k < 7; k++) leafPath(ctx, px + (rr() - 0.5) * 30 * s, py + (rr() * 10) * s, (8 + rr() * 4) * s, 5 * s, PI / 2 + (rr() - 0.5) * 1.6, true);
          ctx.fillStyle = '#2f5a2c'; ctx.fill();
        }
        hanger(L.cx0 - L.px * 0.5, h * 0.11, 4401, -1);
        hanger(L.cx1 + L.px * 0.5, h * 0.125, 4402, 1);
        mark('hangers', ctx);
        /* volumetric light from the low sun into the room */
        shafts(ctx, sx, sy, w, h, '#ffcf98', 0.05, 9, r, 1.5, PI * 0.55, 0.03, 0.08);
        mark('shafts', ctx);
        /* free-standing wooden table, top kept clear for the game's props:
           top surface y 0.84h (back edge) .. 0.872h (front edge), x 0.20..0.80w at the back */
        var T0 = L.tableTop, T1 = L.tableFront, tx0 = L.tableX0, tx1 = L.tableX1, fx0 = w * 0.175, fx1 = w * 0.825, eh = h * 0.014;
        // shadow on the rug
        ctx.fillStyle = 'rgba(30,14,8,0.35)'; ctx.beginPath(); ctx.ellipse(w * 0.52, h * 0.975, w * 0.36, h * 0.03, 0, 0, TAU); ctx.fill();
        function leg(lx0, ly0, ly1, lw) {
          ctx.fillStyle = lg(ctx, lx0 - lw / 2, 0, lx0 + lw / 2, 0, [[0, '#5a3220'], [0.4, '#9a5e38'], [1, '#4a2818']]);
          ctx.beginPath(); ctx.moveTo(lx0 - lw / 2, ly0); ctx.lineTo(lx0 + lw / 2, ly0); ctx.lineTo(lx0 + lw * 0.32, ly1); ctx.lineTo(lx0 - lw * 0.32, ly1); ctx.fill();
        }
        leg(w * 0.235, T1, h * 0.955, 9 * s); leg(w * 0.765, T1, h * 0.955, 9 * s);
        ctx.fillStyle = '#5a3420'; ctx.fillRect(w * 0.2, T1 + eh, w * 0.6, h * 0.02);
        leg(w * 0.2, T1 + eh, h * 0.995, 12 * s); leg(w * 0.8, T1 + eh, h * 0.995, 12 * s);
        // top surface
        ctx.beginPath(); ctx.moveTo(tx0, T0); ctx.lineTo(tx1, T0); ctx.lineTo(fx1, T1); ctx.lineTo(fx0, T1); ctx.closePath();
        ctx.fillStyle = lg(ctx, 0, T0, 0, T1, [[0, '#b8784a'], [1, '#d08e58']]); ctx.fill();
        ctx.save(); ctx.clip();
        batch(ctx, 90, [['#7a4628', 0.7 * s, 0.45], ['#f0b880', 0.5 * s, 0.4]], function () {
          var yy = lerp(T0, T1, r()), xx = lerp(fx0, fx1, r()), l = (20 + r() * 50) * s;
          return [xx, yy, xx + l, yy + (r() - 0.5) * 0.6 * s, r() < 0.6 ? 0 : 1];
        });
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = lg(ctx, w * 0.3, 0, w * 0.75, 0, [[0, 'rgba(255,200,130,0)'], [0.5, 'rgba(255,210,150,0.3)'], [1, 'rgba(255,200,130,0)']]); ctx.fillRect(fx0, T0, fx1 - fx0, T1 - T0);
        ctx.restore();
        ctx.strokeStyle = 'rgba(255,226,180,0.8)'; ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.moveTo(tx0, T0); ctx.lineTo(tx1, T0); ctx.stroke();
        // front edge
        ctx.fillStyle = lg(ctx, 0, T1, 0, T1 + eh, [[0, '#8a4e2e'], [1, '#5a3220']]); ctx.fillRect(fx0, T1, fx1 - fx0, eh);
        ctx.fillStyle = 'rgba(255,214,160,0.55)'; ctx.fillRect(fx0, T1, fx1 - fx0, 0.9 * s);
        ctx.beginPath(); ctx.moveTo(fx0, T1); ctx.lineTo(tx0, T0); ctx.lineTo(tx0, T0 + 1 * s); ctx.lineTo(fx0, T1 + eh); ctx.closePath(); ctx.fillStyle = '#6a3a22'; ctx.fill();
        ctx.beginPath(); ctx.moveTo(fx1, T1); ctx.lineTo(tx1, T0); ctx.lineTo(tx1, T0 + 1 * s); ctx.lineTo(fx1, T1 + eh); ctx.closePath(); ctx.fillStyle = '#4a2818'; ctx.fill();
        mark('table', ctx);
        // dim the very bottom slightly (cards sit here)
        ctx.fillStyle = lg(ctx, 0, h * 0.7, 0, h, [[0, 'rgba(40,20,20,0)'], [1, 'rgba(40,20,20,0.3)']]); ctx.fillRect(0, h * 0.7, w, h * 0.3);
        mark('dim', ctx);
        finish(ctx, w, h, '#ffb070', 0.16, 0.32, 0.045, '#2a1416', 0.35);
        mark('finish', ctx);
      } catch (e) { PAINT._err = 'home: ' + String(e && e.stack || e); }
    },
    overlay: function (ctx, w, h, t) {
      try {
        var L = homeL(w, h), s = L.s, i, sp;
        ctx.save();
        panesPath(ctx, L.panes); ctx.clip();
        // slow wisps in the upper sky (centre pane only, clear of the plants)
        var ws = wispSpr('#fff0e0');
        if (ws) for (i = 0; i < 2; i++) {
          var ww = w * (0.5 + i * 0.2), wx = ((t * (3 + i * 2) * s + i * w * 0.6) % (w * 1.6)) - ww * 0.8 + w * 0.1, wyy = h * (0.15 + i * 0.07);
          ctx.globalAlpha = 0.35; ctx.drawImage(ws, wx, wyy - ww * 0.14, ww, ww * 0.28);
        }
        ctx.globalAlpha = 1;
        // gondola cabins gliding over the river
        for (i = 0; i < 3; i++) {
          var u = ((t * 0.011 + i / 3) % 1), P = L.cable(u), sz = (3 + u * -0.8) * s * 1.4;
          drawCabin(ctx, P[0], P[1], sz, i === 1 ? '#ffd45c' : '#ff7a6b', '#fff3e8', '#4a4466');
        }
        // sailboat drifting
        for (i = 0; i < 2; i++) {
          var bx = ((t * (2 + i) * s + w * (0.35 + i * 0.4)) % (w * 1.2)) - w * 0.1, by = h * (0.44 + i * 0.03), bs = (4.5 + i) * s;
          ctx.globalAlpha = 0.3; ctx.save(); ctx.translate(bx, by); ctx.scale(1, -0.8); boat(ctx, 0, 0, bs, '#fff4ea', '#3e3e6a'); ctx.restore(); ctx.globalAlpha = 1;
          boat(ctx, bx, by, bs, '#ffffff', '#ff7a6b', '#ffd6c8');
        }
        // glitter twinkles under the sun
        ctx.fillStyle = '#ffffff';
        for (i = 0; i < 14; i++) {
          var p2 = hash(i, 71), gy = L.hz + h * 0.008 + p2 * h * 0.1, gx = L.sunX + (hash(i, 72) - 0.5) * w * (0.05 + p2 * 0.22);
          var tw = Math.pow(Math.max(0, Math.sin(t * (2 + hash(i, 73) * 3) + i * 5)), 6); if (tw < 0.05) continue;
          var z = (0.8 + p2 * 1.6) * s * tw; ctx.globalAlpha = tw;
          ctx.fillRect(gx - z * 2, gy - 0.3 * s, z * 4, 0.6 * s); ctx.fillRect(gx - 0.3 * s, gy - z, 0.6 * s, z * 2);
        }
        ctx.globalAlpha = 1;
        ctx.restore();
        // birds and drones stay in the clear middle of the window
        ctx.save(); ctx.beginPath(); ctx.rect(L.cx0 + w * 0.05, L.wy0, L.cx1 - L.cx0 - w * 0.1, L.wy1 - L.wy0); ctx.clip();
        ctx.strokeStyle = 'rgba(70,50,80,0.8)'; ctx.lineWidth = 1.1 * s; ctx.lineCap = 'round';
        for (i = 0; i < 4; i++) {
          var ang = t * 0.12 + i * 0.5, bx2 = w * 0.5 + Math.cos(ang) * w * 0.17 + i * 6 * s, by2 = h * 0.2 + Math.sin(ang * 1.3) * h * 0.035 + i * 4 * s;
          drawBird(ctx, bx2, by2, (4 - i * 0.4) * s, t * 7 + i * 1.7);
        }
        for (i = 0; i < 2; i++) {
          var dph = t * (0.05 + i * 0.03) + i * 2, dx = w * 0.5 + Math.sin(dph) * w * 0.18, dy = h * (0.27 + i * 0.06) + Math.sin(dph * 2.3) * h * 0.01;
          var blink = (Math.sin(t * 5 + i * 2) > 0.6) ? 0.9 : 0.15;
          drawDrone(ctx, dx, dy, (3.2 - i * 0.8) * s, '#f2eef8', blink, i ? '#7ff7e4' : '#ff5a4a');
        }
        ctx.restore();
        // breathing light shafts + dust motes in the room
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (i = 0; i < 3; i++) {
          var a = PI * (0.42 + i * 0.12), br = 0.03 + 0.025 * Math.sin(t * 0.35 + i * 2.1), Lx = h * 0.9, wd = 0.035 + i * 0.01;
          ctx.fillStyle = lg(ctx, L.sunX, L.sunY, L.sunX + Math.cos(a) * Lx, L.sunY + Math.sin(a) * Lx, [[0, 'rgba(255,214,160,0)'], [0.25, 'rgba(255,214,160,' + br.toFixed(3) + ')'], [1, 'rgba(255,214,160,0)']]);
          ctx.beginPath(); ctx.moveTo(L.sunX, L.sunY); ctx.lineTo(L.sunX + Math.cos(a - wd) * Lx, L.sunY + Math.sin(a - wd) * Lx); ctx.lineTo(L.sunX + Math.cos(a + wd) * Lx, L.sunY + Math.sin(a + wd) * Lx); ctx.fill();
        }
        sp = glowSpr('#ffe2b0');
        if (sp) for (i = 0; i < 22; i++) {
          var a1 = hash(i, 51), b1 = hash(i, 52), c1 = hash(i, 53);
          var mxp = (a1 * w + Math.sin(t * (0.15 + c1 * 0.2) + i) * 20 * s + t * 2 * s) % w, myp = h * (0.45 + b1 * 0.35) + Math.sin(t * (0.2 + a1 * 0.3) + i * 2) * 14 * s - (t * 3 * s * (0.3 + c1)) % (h * 0.2);
          var tw2 = 0.5 + 0.5 * Math.sin(t * (0.8 + c1 * 1.5) + i * 3), msz = (2 + c1 * 3.5) * s;
          ctx.globalAlpha = 0.15 + 0.35 * tw2; ctx.drawImage(sp, mxp - msz, myp - msz, msz * 2, msz * 2);
        }
        ctx.restore();
      } catch (e) { PAINT._err = 'home overlay: ' + String(e && e.stack || e); }
    }
  };

  /* ============================== STREET: Commonwealth Avenue mall, morning ============================== */
  var BS = {
    brick: { wall: ['#c9674a', '#b0533a', '#8e3f2c'], mortar: '#e8c8b0', tones: ['#c25e44', '#a84c36', '#d27a5a', '#983f2e'], trim: '#efe2cc', stone: '#d8c0a0' },
    brick2: { wall: ['#bd6a52', '#a4563f', '#82402f'], mortar: '#e2c6b2', tones: ['#b8604a', '#9c4e3a', '#c8785c', '#8a4434'], trim: '#f2e6d4', stone: '#cdb498' },
    brown: { wall: ['#9a6450', '#7e4c3a', '#5e3628'], mortar: '#b08a74', tones: ['#8c5a46', '#74463a', '#a06c56', '#6a4032'], trim: '#e6d2b8', stone: '#a8846a', smooth: 1 },
    lime: { wall: ['#e2cba6', '#c9ae88', '#a68c6a'], mortar: '#f4e6cc', tones: ['#d8c098', '#c4a882', '#e8d4b0', '#b89c78'], trim: '#fbf3e4', stone: '#efe0c4', smooth: 1 }
  };
  /* sash window with lintel, sill, muntins and sky reflection; style: 0 glass, 1 warm interior, 2 curtains, 3 flower box */
  function sash(ctx, x, y, w, h, s, P, style, r, arch) {
    var fr = Math.max(1, 1.3 * s);
    ctx.fillStyle = 'rgba(40,20,14,0.35)'; ctx.fillRect(x - fr * 0.6, y - fr * 0.4, w + fr * 1.6, h + fr * 1.6);
    ctx.fillStyle = P.trim; ctx.beginPath();
    if (arch) { ctx.moveTo(x - fr, y + h + fr); ctx.lineTo(x - fr, y + w * 0.5); ctx.arc(x + w / 2, y + w * 0.5, w / 2 + fr, PI, TAU); ctx.lineTo(x + w + fr, y + h + fr); ctx.closePath(); }
    else ctx.rect(x - fr, y - fr, w + fr * 2, h + fr * 2);
    ctx.fill();
    ctx.beginPath();
    if (arch) { ctx.moveTo(x, y + h); ctx.lineTo(x, y + w * 0.5); ctx.arc(x + w / 2, y + w * 0.5, w / 2, PI, TAU); ctx.lineTo(x + w, y + h); ctx.closePath(); }
    else ctx.rect(x, y, w, h);
    if (style === 1) ctx.fillStyle = lg(ctx, 0, y, 0, y + h, [[0, '#ffe2a8'], [1, '#d88a5a']]);
    else ctx.fillStyle = lg(ctx, x, y, x + w, y + h, [[0, '#d8ecf8'], [0.45, '#8fb4d4'], [1, '#3e5a7a']]);
    ctx.fill();
    ctx.save(); ctx.clip();
    if (style === 1) { ctx.fillStyle = 'rgba(120,60,40,0.5)'; ctx.fillRect(x + w * 0.55, y + h * 0.4, w * 0.3, h * 0.6); glow(ctx, x + w * 0.3, y + h * 0.3, w * 0.6, '#fff2c0', 0.6); }
    if (style === 2) { ctx.fillStyle = r() < 0.5 ? '#f4eadc' : '#e8d0e0'; ctx.fillRect(x, y, w * 0.28, h); ctx.fillRect(x + w * 0.72, y, w * 0.28, h); ctx.fillStyle = 'rgba(0,0,0,0.1)'; ctx.fillRect(x + w * 0.22, y, w * 0.06, h); }
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.moveTo(x + w * 0.1, y + h); ctx.lineTo(x + w * 0.45, y); ctx.lineTo(x + w * 0.62, y); ctx.lineTo(x + w * 0.27, y + h); ctx.fill();
    ctx.restore();
    // muntins: two-over-two
    ctx.fillStyle = P.trim; ctx.fillRect(x, y + h * 0.5 - fr * 0.5, w, fr); ctx.fillRect(x + w / 2 - fr * 0.35, y, fr * 0.7, h);
    // lintel + sill
    ctx.fillStyle = P.stone; ctx.fillRect(x - fr * 2.2, y - fr * 3.6, w + fr * 4.4, fr * 2.6);
    ctx.fillStyle = 'rgba(255,250,235,0.6)'; ctx.fillRect(x - fr * 2.2, y - fr * 3.6, w + fr * 4.4, fr * 0.6);
    ctx.fillStyle = 'rgba(40,20,14,0.3)'; ctx.fillRect(x - fr * 2.2, y - fr * 1.0, w + fr * 4.4, fr * 0.7);
    ctx.fillStyle = P.stone; ctx.fillRect(x - fr * 1.6, y + h + fr, w + fr * 3.2, fr * 1.5);
    ctx.fillStyle = 'rgba(40,20,14,0.35)'; ctx.fillRect(x - fr * 1.6, y + h + fr * 2.5, w + fr * 3.2, fr * 1.4);
    if (style === 3) {
      var by = y + h + fr * 2.4;
      ctx.fillStyle = '#5a3a2a'; ctx.fillRect(x - fr, by, w + fr * 2, h * 0.14);
      dots(ctx, 26, [['#2f6a34', 1], ['#4f9a44', 1], ['#ff5a6a', 1], ['#ffb0c8', 1], ['#ffffff', 0.9]], function (i) {
        return [x + r() * w, by - r() * h * 0.08 + (i < 10 ? h * 0.02 : 0), (0.9 + r() * 1.2) * s, i < 6 ? 0 : i < 10 ? 1 : 2 + ((r() * 3) | 0)];
      });
    }
  }
  /* frontal brownstone / brick rowhouse. o: {x,w,base,h,kind,bay:'L'|'R'|'',seed,s,mansard,shadowR} */
  function brownstone(ctx, o) {
    var r = rng(o.seed), s = o.s, x = o.x, W = o.w, B = o.base, Hc = o.h, top = B - Hc, P = BS[o.kind], i, j;
    var gH = Hc * 0.14, pH = Hc * 0.25, cH = Hc * 0.05, uH = (Hc - gH - pH - cH) / 3;
    var lv = [B - gH, B - gH - pH, B - gH - pH - uH, B - gH - pH - uH * 2, top + cH]; // tops: garden, parlor, 2nd, 3rd, 4th
    // mansard + dormers + chimney (behind the cornice)
    if (o.mansard !== false) {
      var mH = Hc * 0.13, mI = W * 0.04;
      if (r() < 0.6) { ctx.fillStyle = '#7a4a3a'; ctx.fillRect(x + W * (0.15 + r() * 0.6), top - mH * 1.55, W * 0.1, mH * 0.7); ctx.fillStyle = '#5a3428'; ctx.fillRect(x + W * 0.1, top - mH * 1.6, 0, 0); }
      ctx.fillStyle = lg(ctx, x, top - mH, x + W, top, [[0, '#8a809e'], [0.5, '#6a6080'], [1, '#4a4260']]);
      ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x + mI, top - mH); ctx.lineTo(x + W - mI, top - mH); ctx.lineTo(x + W, top); ctx.closePath(); ctx.fill();
      ctx.save(); ctx.clip();
      // fish-scale slate
      ctx.strokeStyle = 'rgba(30,24,44,0.45)'; ctx.lineWidth = 0.6 * s; ctx.beginPath();
      var sp = 3.2 * s;
      for (var yy = top - mH + sp * 0.6; yy < top; yy += sp * 0.75) for (var xx = x + ((yy / sp) % 2) * sp * 0.5; xx < x + W; xx += sp) { ctx.moveTo(xx - sp * 0.5, yy); ctx.arc(xx, yy, sp * 0.5, PI, 0, true); }
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(x, top - mH, W * 0.4, mH);
      ctx.restore();
      ctx.fillStyle = '#6fae9a'; ctx.fillRect(x + mI - s, top - mH - 1.6 * s, W - mI * 2 + 2 * s, 2 * s);
      var nd = W > 80 * s ? 2 : 1;
      for (j = 0; j < nd; j++) {
        var dx = x + W * (nd === 1 ? 0.5 : 0.3 + j * 0.4), dw = W * 0.16, dh = mH * 0.78, dy = top - mH * 0.85;
        ctx.fillStyle = P.trim; ctx.beginPath(); ctx.moveTo(dx - dw * 0.7, dy); ctx.lineTo(dx, dy - dh * 0.45); ctx.lineTo(dx + dw * 0.7, dy); ctx.closePath(); ctx.fill();
        ctx.fillRect(dx - dw * 0.6, dy, dw * 1.2, dh);
        ctx.fillStyle = lg(ctx, 0, dy, 0, dy + dh, [[0, '#cfe4f4'], [1, '#4a6684']]); ctx.fillRect(dx - dw * 0.42, dy + dh * 0.12, dw * 0.84, dh * 0.8);
        ctx.fillStyle = P.trim; ctx.fillRect(dx - 0.5 * s, dy + dh * 0.12, 1 * s, dh * 0.8);
      }
    }
    // facade body, lit from the upper left
    ctx.fillStyle = lg(ctx, x, top, x + W * 0.6, B, [[0, P.wall[0]], [0.55, P.wall[1]], [1, P.wall[2]]]);
    ctx.fillRect(x, top, W, Hc);
    ctx.save(); ctx.beginPath(); ctx.rect(x, top, W, Hc); ctx.clip();
    if (!P.smooth) {
      var bh = 2.4 * s, bw = 6.4 * s;
      rects(ctx, Math.ceil(Hc / bh) * Math.ceil(W / bw), [[P.tones[0], 0.5], [P.tones[1], 0.5], [P.tones[2], 0.45], [P.tones[3], 0.45]], function (k) {
        var row = (k / Math.ceil(W / bw)) | 0, col = k % Math.ceil(W / bw); if (r() < 0.35) return null;
        return [x + col * bw + (row % 2) * bw * 0.5, top + row * bh, bw - 0.6 * s, bh - 0.6 * s, (r() * 4) | 0];
      });
      rects(ctx, Math.ceil(Hc / bh), [[P.mortar, 0.22]], function (k) { return [x, top + k * bh - 0.3 * s, W, 0.5 * s, 0]; });
    } else {
      dabs(ctx, Math.round(W * Hc / (34 * s * s)), [[P.tones[0], 0.25], [P.tones[1], 0.25], [P.tones[2], 0.2]], function () {
        return [x + r() * W, top + r() * Hc, (3 + r() * 6) * s, (0.8 + r() * 1.4) * s, (r() * 3) | 0];
      });
      // rusticated ashlar joints on the garden level
      rects(ctx, 12, [['rgba(40,20,10,0.35)', 1]], function (k) { var yy2 = B - gH + k * gH / 4; return yy2 < B ? [x, yy2, W, 0.7 * s, 0] : null; });
    }
    ctx.restore();
    // ---- bay window (three facets) ----
    var bayW = W * 0.5, bx0 = o.bay === 'R' ? x + W - bayW - W * 0.05 : x + W * 0.05, bx1 = bx0 + bayW;
    var bayTop = o.bayTop === 'low' ? lv[3] - uH * 0.08 : top + cH;
    var fL = bx0 + bayW * 0.2, fR = bx1 - bayW * 0.2;
    if (o.bay) {
      // cast shadow to the right (sun upper-left)
      ctx.fillStyle = 'rgba(40,16,10,0.28)'; ctx.fillRect(bx1, bayTop + 4 * s, bayW * 0.12, B - bayTop - 4 * s);
      var facets = [[bx0, fL, 0.18], [fL, fR, 0], [fR, bx1, -0.22]];
      for (j = 0; j < 3; j++) {
        var F = facets[j];
        ctx.fillStyle = lg(ctx, 0, bayTop, 0, B, [[0, mix(P.wall[0], F[2] > 0 ? '#ffe8d0' : '#3a1a14', Math.abs(F[2]))], [1, mix(P.wall[1], F[2] > 0 ? '#ffe8d0' : '#2a1410', Math.abs(F[2]) + 0.1)]]);
        ctx.fillRect(F[0], bayTop, F[1] - F[0], B - bayTop);
      }
      ctx.fillStyle = 'rgba(255,240,220,0.35)'; ctx.fillRect(bx0, bayTop, 0.8 * s, B - bayTop);
      ctx.fillStyle = 'rgba(30,10,6,0.35)'; ctx.fillRect(fR, bayTop, 0.8 * s, B - bayTop);
      if (!P.smooth) {
        ctx.save(); ctx.beginPath(); ctx.rect(bx0, bayTop, bayW, B - bayTop); ctx.clip();
        rects(ctx, Math.ceil((B - bayTop) / (2.4 * s)), [[P.mortar, 0.18]], function (k) { return [bx0, bayTop + k * 2.4 * s, bayW, 0.5 * s, 0]; });
        ctx.restore();
      }
      // bay windows per floor
      for (i = 0; i < 5; i++) {
        var fy0 = i === 0 ? B - gH : lv[i], fy1 = i === 0 ? B : lv[i - 1];
        if (fy0 < bayTop + 2 * s) continue;
        var fh2 = fy1 - fy0, wy = fy0 + fh2 * (i === 0 ? 0.25 : i === 1 ? 0.16 : 0.2), wh = fh2 * (i === 0 ? 0.5 : i === 1 ? 0.68 : 0.58);
        var st = i === 0 ? 0 : (r() < 0.2 ? 2 : r() < 0.25 ? 1 : 0);
        sash(ctx, fL + (fR - fL) * 0.18, wy, (fR - fL) * 0.64, wh, s, P, st, r, false);
        sash(ctx, bx0 + (fL - bx0) * 0.28, wy, (fL - bx0) * 0.5, wh, s, P, 0, r, false);
        sash(ctx, fR + (bx1 - fR) * 0.22, wy, (bx1 - fR) * 0.5, wh, s, P, 0, r, false);
        if (i >= 1) { ctx.fillStyle = P.stone; ctx.fillRect(bx0, fy1 - 1.2 * s, bayW, 1.6 * s); }
      }
      // bay cornice / balustrade
      ctx.fillStyle = P.trim; ctx.fillRect(bx0 - 2 * s, bayTop - 2.4 * s, bayW + 4 * s, 3.4 * s);
      ctx.fillStyle = 'rgba(40,16,10,0.35)'; ctx.fillRect(bx0 - 2 * s, bayTop + 1 * s, bayW + 4 * s, 1.6 * s);
      if (o.bayTop === 'low') {
        ctx.fillStyle = P.trim; ctx.beginPath();
        for (var bb = bx0; bb < bx1; bb += 3 * s) { ctx.rect(bb, bayTop - 7 * s, 1.2 * s, 5 * s); }
        ctx.rect(bx0 - 2 * s, bayTop - 8.4 * s, bayW + 4 * s, 1.6 * s); ctx.fill();
      }
    }
    // ---- entrance side: door on the parlor floor + single windows above ----
    var ex0 = o.bay === 'R' ? x + W * 0.06 : bx1 + W * 0.06, ex1 = o.bay === 'R' ? bx0 - W * 0.05 : x + W * 0.95;
    if (!o.bay) { ex0 = x + W * 0.06; ex1 = x + W * 0.94; }
    var ecx = (ex0 + ex1) / 2, ew = Math.min(ex1 - ex0, W * 0.3);
    for (i = 2; i < 5; i++) {
      var uy0 = lv[i], uh = (i === 4 ? lv[3] - lv[4] : lv[i - 1] - lv[i]);
      if (!o.bay) { for (j = 0; j < 3; j++) sash(ctx, x + W * (0.12 + j * 0.28), uy0 + uh * 0.2, W * 0.16, uh * 0.58, s, P, r() < 0.15 ? 1 : r() < 0.2 ? 2 : 0, r, false); }
      else sash(ctx, ecx - ew * 0.32, uy0 + uh * 0.2, ew * 0.64, uh * 0.58, s, P, r() < 0.15 ? 1 : r() < 0.25 ? 3 : 0, r, false);
    }
    // parlor: door with arched transom and stone surround (+ tall window when no bay)
    var dW = ew * 0.62, dH = pH * 0.78, dX = o.bay ? ecx - dW / 2 : x + W * 0.66, dY = lv[1] + pH - dH;
    if (!o.bay) for (j = 0; j < 2; j++) sash(ctx, x + W * (0.1 + j * 0.24), lv[1] + pH * 0.14, W * 0.15, pH * 0.72, s, P, j ? 3 : 0, r, true);
    ctx.fillStyle = P.stone; ctx.beginPath(); ctx.moveTo(dX - dW * 0.28, dY + dH); ctx.lineTo(dX - dW * 0.28, dY + dW * 0.3); ctx.arc(dX + dW / 2, dY + dW * 0.3, dW * 0.78, PI, TAU); ctx.lineTo(dX + dW * 1.28, dY + dH); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,250,235,0.5)'; ctx.fillRect(dX - dW * 0.28, dY + dW * 0.3, 1 * s, dH - dW * 0.3);
    ctx.fillStyle = lg(ctx, 0, dY - dW * 0.2, 0, dY + dW * 0.3, [[0, '#ffe6a8'], [1, '#e0a060']]); ctx.beginPath(); ctx.arc(dX + dW / 2, dY + dW * 0.3, dW * 0.5, PI, TAU); ctx.fill();
    ctx.strokeStyle = P.trim; ctx.lineWidth = 0.7 * s; ctx.beginPath(); for (j = 1; j < 5; j++) { var aa = PI + j * PI / 5; ctx.moveTo(dX + dW / 2, dY + dW * 0.3); ctx.lineTo(dX + dW / 2 + Math.cos(aa) * dW * 0.5, dY + dW * 0.3 + Math.sin(aa) * dW * 0.5); } ctx.stroke();
    var doorCol = o.door || pick(['#1f3a5a', '#2a4a3a', '#5a1f2a', '#1c1c2a', '#16736a'], r);
    ctx.fillStyle = lg(ctx, dX, 0, dX + dW, 0, [[0, mix(doorCol, '#ffffff', 0.2)], [1, mix(doorCol, '#000000', 0.25)]]); ctx.fillRect(dX, dY + dW * 0.32, dW, dH - dW * 0.32);
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 0.7 * s; ctx.strokeRect(dX + dW * 0.15, dY + dW * 0.45, dW * 0.3, dH * 0.3); ctx.strokeRect(dX + dW * 0.55, dY + dW * 0.45, dW * 0.3, dH * 0.3);
    ctx.fillStyle = '#e8c060'; ctx.beginPath(); ctx.arc(dX + dW * 0.85, dY + dH * 0.62, 0.9 * s, 0, TAU); ctx.fill();
    // main cornice with dentils and brackets
    ctx.fillStyle = 'rgba(40,16,10,0.35)'; ctx.fillRect(x, top + cH, W, cH * 0.5);
    ctx.fillStyle = P.trim; ctx.fillRect(x - 1.5 * s, top, W + 3 * s, cH);
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(x - 1.5 * s, top, W + 3 * s, cH * 0.22);
    ctx.fillStyle = 'rgba(60,40,30,0.3)'; ctx.beginPath(); for (var dd = x; dd < x + W; dd += 2.2 * s) ctx.rect(dd, top + cH * 0.55, 1.1 * s, cH * 0.3); ctx.fill();
    ctx.fillStyle = P.trim; ctx.beginPath(); for (j = 0; j < 4; j++) { var kx = x + W * (0.04 + j * 0.3); ctx.rect(kx, top + cH, 2.4 * s, cH * 0.9); } ctx.fill();
    // party-wall edge shading
    ctx.fillStyle = lg(ctx, x + W - 3 * s, 0, x + W, 0, [[0, 'rgba(30,10,6,0)'], [1, 'rgba(30,10,6,0.35)']]); ctx.fillRect(x + W - 3 * s, top, 3 * s, Hc);
    // ---- stoop up to the door ----
    var stX0 = dX - dW * 0.45, stX1 = dX + dW * 1.45, nSt = 6;
    ctx.fillStyle = 'rgba(30,14,8,0.35)'; ctx.fillRect(stX1, B - gH, (stX1 - stX0) * 0.15, gH);
    for (j = 0; j < nSt; j++) {
      var sy0 = lerp(B - gH, B, j / nSt), sy1 = lerp(B - gH, B, (j + 1) / nSt), grow = j * 1.2 * s;
      ctx.fillStyle = P.stone; ctx.fillRect(stX0 - grow, sy0, stX1 - stX0 + grow * 2, (sy1 - sy0) * 0.35);
      ctx.fillStyle = mix(P.stone, '#3a2014', 0.35); ctx.fillRect(stX0 - grow, sy0 + (sy1 - sy0) * 0.35, stX1 - stX0 + grow * 2, (sy1 - sy0) * 0.65);
    }
    // wrought-iron railings
    ctx.strokeStyle = '#1e1a1e'; ctx.lineWidth = 1 * s; ctx.lineCap = 'round';
    [stX0 - nSt * 1.2 * s, stX1 + nSt * 1.2 * s].forEach(function (rx, k) {
      var tx = k ? stX1 : stX0;
      ctx.beginPath(); ctx.moveTo(tx, B - gH - 7 * s); ctx.lineTo(rx, B - 8 * s); ctx.stroke();
      ctx.beginPath(); for (var q = 0; q <= 6; q++) { var px = lerp(tx, rx, q / 6), py = lerp(B - gH - 7 * s, B - 8 * s, q / 6); ctx.moveTo(px, py); ctx.lineTo(px, py + 7 * s); } ctx.stroke();
      ctx.beginPath(); ctx.arc(rx + (k ? -2 : 2) * s, B - 6 * s, 2.2 * s, 0, TAU * 0.8); ctx.stroke();
    });
    // front garden + low iron fence
    var gx0 = o.bay === 'R' ? bx0 - W * 0.04 : x, gx1 = o.bay === 'R' ? x + W : bx1 + W * 0.04;
    if (o.bay) {
      for (j = 0; j < 4; j++) clump(ctx, lerp(gx0, gx1, (j + 0.5) / 4), B - 5 * s, (5 + r() * 3) * s, ['#1e3a24', '#2e5a32', '#4a8a3e', '#86b85a', '#d8f0a0'], r, -0.7, -0.7, false, 0.8);
      dots(ctx, 30, [['#ff6a8a', 1], ['#ffd35a', 1], ['#ffffff', 1], ['#b07ae8', 1]], function () { return [lerp(gx0, gx1, r()), B - (3 + r() * 9) * s, (0.9 + r()) * s, (r() * 4) | 0]; });
      ctx.strokeStyle = '#1e1a1e'; ctx.lineWidth = 0.8 * s; ctx.beginPath(); ctx.moveTo(gx0, B - 7 * s); ctx.lineTo(gx1, B - 7 * s);
      for (var fx = gx0; fx < gx1; fx += 2.4 * s) { ctx.moveTo(fx, B - 8.5 * s); ctx.lineTo(fx, B); } ctx.stroke();
    }
    return { door: [dX, dY, dW, dH] };
  }
  /* solar street lamp */
  function solarLamp(ctx, x, yb, H, s, lit) {
    ctx.fillStyle = lg(ctx, x - 1.6 * s, 0, x + 1.6 * s, 0, [[0, '#5a6478'], [0.4, '#9aa6bc'], [1, '#2e3446']]);
    ctx.fillRect(x - 1.4 * s, yb - H, 2.8 * s, H);
    ctx.fillStyle = '#2e3446'; ctx.fillRect(x - 3 * s, yb - 3 * s, 6 * s, 3 * s);
    // arm + lamp head
    ctx.strokeStyle = '#3e4658'; ctx.lineWidth = 1.6 * s; ctx.beginPath(); ctx.moveTo(x, yb - H * 0.92); ctx.quadraticCurveTo(x + 4 * s, yb - H * 1.0, x + 11 * s, yb - H * 0.98); ctx.stroke();
    ctx.fillStyle = '#2e3446'; ctx.beginPath(); rrect(ctx, x + 6 * s, yb - H * 0.98 - 1.5 * s, 12 * s, 4 * s, 2 * s); ctx.fill();
    ctx.fillStyle = lit ? '#fff4d0' : '#bfe8f0'; ctx.fillRect(x + 8 * s, yb - H * 0.98 + 2 * s, 8 * s, 1.2 * s);
    // tilted solar panel on top
    ctx.fillStyle = '#26346a'; ctx.beginPath(); ctx.moveTo(x - 9 * s, yb - H - 2 * s); ctx.lineTo(x + 7 * s, yb - H - 6 * s); ctx.lineTo(x + 8 * s, yb - H - 3 * s); ctx.lineTo(x - 8 * s, yb - H + 1 * s); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(160,200,255,0.6)'; ctx.lineWidth = 0.5 * s; ctx.stroke();
    ctx.fillStyle = '#7ff7e4'; ctx.fillRect(x - 1.4 * s, yb - H * 0.55, 2.8 * s, 1.2 * s);
    if (lit) glow(ctx, x + 12 * s, yb - H * 0.96, 14 * s, '#ffd890', 0.6);
  }
  var streetL = memo(function (w, h) {
    var s = S(w, h), L = { s: s, roofBase: h * 0.6, walk0: h * 0.6, road0: h * 0.622, road1: h * 0.684, verge: h * 0.69, mall: h * 0.728, sunX: -w * 0.05, sunY: h * 0.0 };
    L.treeL = { x: w * 0.035, yb: h * 0.73, cx: w * 0.06, cy: h * 0.12, rx: w * 0.3, ry: h * 0.15 };
    L.treeR = { x: w * 0.965, yb: h * 0.725, cx: w * 0.95, cy: h * 0.15, rx: w * 0.28, ry: h * 0.15 };
    var A = [-w * 0.05, h * 0.2], C = [w * 0.66, h * 0.172], B = [w * 1.05, h * 0.168];
    L.cable = function (u) { var x = lerp(A[0], B[0], u), t; if (x <= C[0]) { t = (x - A[0]) / (C[0] - A[0]); return [x, lerp(A[1], C[1], t) + h * 0.018 * 4 * t * (1 - t)]; } t = (x - C[0]) / (B[0] - C[0]); return [x, lerp(C[1], B[1], t) + h * 0.004 * 4 * t * (1 - t)]; };
    L.station = C;
    return L;
  });
  PAINT.street = {
    focus: { x: 0.5, y: 0.35 },
    paint: function (ctx, w, h) {
      try {
        var L = streetL(w, h), r = rng(50101), s = L.s, i, x;
        mark('start', ctx);
        /* ---------- sky ---------- */
        var SKY = [[0, '#3f86d6'], [0.3, '#6aa8e4'], [0.6, '#a6cdee'], [0.85, '#dceaf2'], [1, '#f6efe0']];
        ctx.fillStyle = lg(ctx, 0, 0, 0, h * 0.62, SKY); ctx.fillRect(0, 0, w, h * 0.62);
        skyStrokes(ctx, -20 * s, w + 20 * s, 0, h * 0.5, SKY, 300, r, s, 0.12, '#ffffff', '#5a8ad0');
        glow(ctx, L.sunX, L.sunY, Math.max(w, h) * 0.6, '#fff4d8', 0.55);
        for (i = 0; i < 5; i++) wisp(ctx, w * (0.1 + r() * 0.8), h * (0.04 + r() * 0.1), w * 0.4, h * 0.006, '#ffffff', 0.25, r);
        var cls = [[0.62, 0.075, 0.5, 0.06], [0.3, 0.2, 0.42, 0.05], [0.85, 0.24, 0.32, 0.04], [0.12, 0.33, 0.3, 0.035]];
        for (i = 0; i < cls.length; i++) cloudForm(ctx, w * cls[i][0], h * cls[i][1], w * cls[i][2], h * cls[i][3], r, { lit: '#ffffff', mid: '#eef3fa', shade: '#a6b8d8', top: '#ffffff', al: 0.95, lx: -0.55, ly: -0.83, base: 0.6, seam: 0.12 });
        mark('sky', ctx);
        /* ---------- skyline peeking over the roofs ---------- */
        var E = { s: s, W: w, vpX: w * 0.5, sunX: L.sunX, haze: '#cfe0ee', face: '#9db2cc', pale: '#eef2f2', lit: '#f6f0e4', shade: '#7c90b2', rim: '#ffffff', rimA: 0.6,
          glass: ['#8ec0ec', '#c4def2', '#e6eef2'], win: '#5c7294', winLit: '#ffe6a8', litP: 0.02, mull: '#4a6088', sheen: '#ffffff',
          green: ['#2c5444', '#3c7450', '#5c9858', '#9cc86a', '#e8f4b0'] };
        var base = L.roofBase - h * 0.3;
        var far = rng(50111);
        for (x = -w * 0.02; x < w;) { var bw = (12 + far() * 16) * s, bh = h * (0.04 + far() * 0.1); tower(ctx, { x: x, w: bw, top: base - bh, base: base + h * 0.05, kind: far() < 0.5 ? 'glass' : 'stone', k: 0.65, seed: (x * 3) | 0 }, E); x += bw * (0.8 + far() * 0.5); }
        var M = [
          { x: 0.2, w: 0.075, t: 0.2, kind: 'garden', roofTrees: 2 }, { x: 0.29, w: 0.06, t: 0.13, kind: 'glass', slant: -0.02 },
          { x: 0.36, w: 0.07, t: 0.165, kind: 'stone', mast: 0.25 }, { x: 0.45, w: 0.08, t: 0.205, kind: 'twist', turb: 2, animTurb: 1, vgarden: 1 },
          { x: 0.55, w: 0.065, t: 0.23, kind: 'stone', solar: 1 }, { x: 0.62, w: 0.09, t: 0.155, kind: 'garden', vawt: 3 },
          { x: 0.73, w: 0.06, t: 0.19, kind: 'glass', slant: 0.015 }
        ];
        for (i = 0; i < M.length; i++) {
          var m = M[i], mb = { x: w * m.x, w: w * m.w, top: h * m.t, base: base + h * 0.06, kind: m.kind, k: 0.25 + (i % 2) * 0.08, seed: 50200 + i * 7, slant: (m.slant || 0) * h, mast: m.mast, turb: m.turb, animTurb: m.animTurb, vawt: m.vawt, roofTrees: m.roofTrees, solar: m.solar, vgarden: m.vgarden };
          if (i === 5) stepped(ctx, mb, E, [[0.6, 1], [0.85, 0.82], [1, 0.62]]); else tower(ctx, mb, E);
        }
        // gondola station on the green tower + cable
        var C = L.station;
        ctx.fillStyle = '#f2f4f6'; ctx.beginPath(); rrect(ctx, C[0] - 9 * s, C[1] - 3 * s, 18 * s, 9 * s, 3 * s); ctx.fill();
        ctx.fillStyle = '#16b3a6'; ctx.fillRect(C[0] - 9 * s, C[1] + 2 * s, 18 * s, 1.6 * s);
        ctx.strokeStyle = '#4a5878'; ctx.lineWidth = Math.max(0.8, 0.8 * s); ctx.beginPath();
        for (i = 0; i <= 60; i++) { var cp = L.cable(i / 60); if (!i) ctx.moveTo(cp[0], cp[1]); else ctx.lineTo(cp[0], cp[1]); }
        ctx.stroke();
        band(ctx, 0, w, base - h * 0.06, base + h * 0.08, '#e4eef4', 0.55);
        mark('skyline', ctx);
        /* ---------- brownstone row ---------- */
        var kinds = ['brick', 'brown', 'brick2', 'lime', 'brick', 'brown'], bays = ['R', 'L', 'R', '', 'L', 'R'];
        x = -w * 0.12; i = 0;
        var houses = [];
        while (x < w * 1.05) {
          var hw = w * (0.24 + r() * 0.06), hh = h * (0.27 + r() * 0.04);
          houses.push({ x: x, w: hw, base: L.walk0, h: hh, kind: kinds[i % kinds.length], bay: bays[i % bays.length], seed: 50300 + i * 11, s: s, bayTop: i % 3 === 1 ? 'low' : '' });
          x += hw; i++;
        }
        for (i = 0; i < houses.length; i++) brownstone(ctx, houses[i]);
        // morning light raking across the facades + soft tree shade low down
        ctx.save(); ctx.globalCompositeOperation = 'soft-light';
        ctx.fillStyle = lg(ctx, 0, L.walk0 - h * 0.35, w, L.walk0, [[0, 'rgba(255,230,180,0.6)'], [1, 'rgba(60,40,80,0.3)']]); ctx.fillRect(0, L.walk0 - h * 0.45, w, h * 0.45);
        ctx.restore();
        for (i = 0; i < 9; i++) haze(ctx, w * r() - w * 0.1, L.walk0 - h * (0.05 + r() * 0.12), w * r() + w * 0.2, L.walk0, '#2a1a20', 0.12);
        mark('houses', ctx);
        /* ---------- sidewalk, street with green tram track, mall ---------- */
        ctx.fillStyle = lg(ctx, 0, L.walk0, 0, L.road0, [[0, '#d8d2c8'], [1, '#bdb6aa']]); ctx.fillRect(0, L.walk0, w, L.road0 - L.walk0);
        rects(ctx, 60, [['#8a8278', 0.35]], function (k) { return [k * 9 * s, L.walk0, 0.6 * s, L.road0 - L.walk0, 0]; });
        ctx.fillStyle = '#a8a094'; ctx.fillRect(0, L.road0 - 1.6 * s, w, 1.6 * s);
        // far lamps along the sidewalk
        for (x = w * 0.13; x < w; x += w * 0.37) solarLamp(ctx, x, L.walk0 + 2 * s, h * 0.09, s * 0.75, false);
        var rd0 = L.road0, rd1 = L.road1, mid = (rd0 + rd1) / 2;
        ctx.fillStyle = lg(ctx, 0, rd0, 0, rd1, [[0, '#a7a7ae'], [1, '#8f9098']]); ctx.fillRect(0, rd0, w, rd1 - rd0);
        // bike lane + lines
        ctx.fillStyle = '#5fbfb0'; ctx.fillRect(0, rd0 + (rd1 - rd0) * 0.08, w, (rd1 - rd0) * 0.14);
        rects(ctx, 30, [['#ffffff', 0.8]], function (k) { return [k * 30 * s, rd0 + (rd1 - rd0) * 0.27, 14 * s, 0.9 * s, 0]; });
        // grass tram track with rails
        var gt0 = mid - (rd1 - rd0) * 0.1, gt1 = mid + (rd1 - rd0) * 0.24;
        ctx.fillStyle = lg(ctx, 0, gt0, 0, gt1, [[0, '#6a9a4a'], [1, '#4f7e3a']]); ctx.fillRect(0, gt0, w, gt1 - gt0);
        grassField(ctx, w, gt0, gt1, 700, [['#8ab85a', 0.6 * s, 0.6], ['#3e6a2e', 0.6 * s, 0.5]], r, s * 0.4, 0);
        [gt0 + (gt1 - gt0) * 0.2, gt0 + (gt1 - gt0) * 0.75].forEach(function (ry) { ctx.fillStyle = '#5a5a62'; ctx.fillRect(0, ry, w, 1.6 * s); ctx.fillStyle = '#e8e8f0'; ctx.fillRect(0, ry, w, 0.6 * s); });
        ctx.fillStyle = 'rgba(30,30,40,0.25)'; ctx.fillRect(0, rd1 - (rd1 - rd0) * 0.12, w, (rd1 - rd0) * 0.12);
        // near curb + verge
        ctx.fillStyle = '#d6d0c4'; ctx.fillRect(0, rd1, w, L.verge - rd1);
        ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(0, rd1, w, 0.8 * s);
        ctx.fillStyle = lg(ctx, 0, L.verge, 0, L.mall, [[0, '#5d8e3e'], [1, '#4a7a34']]); ctx.fillRect(0, L.verge, w, L.mall - L.verge);
        grassField(ctx, w, L.verge, L.mall, 1500, [['#9ccc5c', 0.7 * s, 0.6], ['#2f5a26', 0.8 * s, 0.55], ['#cfe08a', 0.6 * s, 0.5]], r, s * 0.7, -0.1);
        dots(ctx, 80, [['#ffffff', 0.9], ['#ffd35a', 0.9], ['#ff8aa8', 0.8]], function () { return [r() * w, lerp(L.verge + h * 0.01, L.mall, r()), (0.8 + r() * 0.8) * s, (r() * 3) | 0]; });
        // promenade: warm crushed-stone path with perspective joints
        var m0 = L.mall;
        ctx.fillStyle = lg(ctx, 0, m0, 0, h, [[0, '#d9c6a0'], [0.4, '#cdb68c'], [1, '#b89c74']]); ctx.fillRect(0, m0, w, h - m0);
        ctx.fillStyle = '#b8a27c'; ctx.fillRect(0, m0, w, 2 * s); ctx.fillStyle = 'rgba(255,248,230,0.5)'; ctx.fillRect(0, m0 + 2 * s, w, 0.8 * s);
        // granite edging, then running-bond pavers in perspective
        var pv0 = m0 + h * 0.008, vpx = w * 0.5, vpy = h * 0.45, rows = [], yk = pv0, rh = h * 0.012;
        while (yk < h) { rows.push([yk, rh]); yk += rh; rh *= 1.16; }
        ctx.fillStyle = '#a89c8c'; ctx.fillRect(0, m0 + 2 * s, w, pv0 - m0 - 2 * s);
        rects(ctx, rows.length * 40, [['#e8d6b4', 0.55], ['#b49a74', 0.45], ['#cbb08a', 0.5]], function (k) {
          var R2 = rows[(k / 40) | 0]; if (!R2) return null; var sc2 = (R2[0] - vpy) / (h - vpy), pw = 26 * s * sc2 * 2.2, j2 = k % 40, off = ((k / 40) | 0) % 2 ? pw * 0.5 : 0;
          var px = vpx + (j2 - 20) * pw + off; if (px > w || px + pw < 0 || r() < 0.35) return null;
          return [px + 0.8 * s, R2[0] + 0.8 * s, pw - 1.6 * s, R2[1] - 1.6 * s, (r() * 3) | 0];
        });
        rects(ctx, rows.length, [['#7a6a56', 0.45]], function (k) { return [0, rows[k][0], w, Math.max(0.6, 0.6 * s * (1 + k * 0.1)), 0]; });
        batch(ctx, rows.length * 40, [['#7a6a56', 0.8 * s, 0.4]], function (k) {
          var R2 = rows[(k / 40) | 0]; if (!R2) return null; var sc2 = (R2[0] - vpy) / (h - vpy), pw = 26 * s * sc2 * 2.2, j2 = k % 40, off = ((k / 40) | 0) % 2 ? pw * 0.5 : 0;
          var px = vpx + (j2 - 20) * pw + off; if (px < -2 || px > w + 2) return null;
          var dx = (px - vpx) / (R2[0] - vpy) * R2[1];
          return [px, R2[0], px + dx, R2[0] + R2[1], 0];
        });
        dots(ctx, 1800, [['#f4e8cc', 0.45], ['#7a6448', 0.35]], function () { var yy = lerp(m0, h, Math.pow(r(), 0.85)); return [r() * w, yy, (0.3 + r() * 0.5) * s * (0.6 + (yy - m0) / h * 3), (r() * 2) | 0]; });
        // fallen leaves and petals
        ctx.save();
        var LC = ['#c8a040', '#d8783a', '#8ab04a', '#f2c0c8'];
        for (var lc = 0; lc < 4; lc++) { ctx.fillStyle = LC[lc]; ctx.globalAlpha = 0.85; ctx.beginPath(); for (i = 0; i < 18; i++) { var lxx = r() * w, lyy = lerp(m0 + h * 0.02, h, Math.pow(r(), 0.7)), ls = (2.5 + r() * 3) * s * (0.6 + (lyy - m0) / (h - m0)); lens(ctx, lxx, lyy, ls * 2, ls * 0.6, r() * TAU); } ctx.fill(); }
        ctx.restore();
        // dappled shade from the canopy above + bright sun flecks
        for (i = 0; i < 16; i++) { var px = r() * w, py = lerp(m0 + h * 0.02, h, r()); ctx.save(); ctx.translate(px, py); ctx.scale(1, 0.35); glow(ctx, 0, 0, (26 + r() * 50) * s, '#3a3020', 0.24); ctx.restore(); }
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (i = 0; i < 26; i++) { var fx2 = r() * w, fy2 = lerp(m0 + h * 0.02, h, r()); ctx.save(); ctx.translate(fx2, fy2); ctx.scale(1, 0.4); glow(ctx, 0, 0, (4 + r() * 10) * s, '#ffe6a8', 0.28); ctx.restore(); }
        ctx.restore();
        // flower beds in the bottom corners
        [[-w * 0.05, w * 0.22], [w * 0.78, w * 1.05]].forEach(function (Bd) {
          var by0 = h * 0.93;
          for (var k = 0; k < 7; k++) clump(ctx, lerp(Bd[0], Bd[1], r()), by0 + r() * h * 0.06, (10 + r() * 8) * s, ['#1a3a1e', '#2a5a2a', '#4a8a3a', '#8ac25a', '#e0f4a0'], r, -0.6, -0.8, false, 0.7);
          dots(ctx, 60, [['#ff6a8a', 1], ['#ffd35a', 1], ['#ffffff', 1], ['#a87ae8', 1]], function () { return [lerp(Bd[0], Bd[1], r()), by0 + r() * h * 0.07 - 6 * s, (1.4 + r() * 1.6) * s, (r() * 4) | 0]; });
        });
        mark('ground', ctx);
        /* ---------- mall lamps + the great framing trees ---------- */
        solarLamp(ctx, w * 0.24, L.mall + h * 0.004, h * 0.2, s * 1.1, false);
        solarLamp(ctx, w * 0.78, L.mall + h * 0.004, h * 0.2, s * 1.1, false);
        var pal = ['#1e3424', '#30542e', '#4f863c', '#8cbc50', '#d4ea88'];
        [L.treeL, L.treeR].forEach(function (T, k) {
          ctx.fillStyle = 'rgba(30,30,20,0.35)'; ctx.beginPath(); ctx.ellipse(T.x + 20 * s, T.yb + 2 * s, 34 * s, 6 * s, 0, 0, TAU); ctx.fill();
          broadleaf(ctx, { x: T.x, yb: T.yb, cx: T.cx, cy: T.cy, rx: T.rx, ry: T.ry, tw: 16 * s, s: s, lx: -0.6, ly: -0.8, pal: pal, bark: ['#9a8a7a', '#5a4a3e', '#2e241e'], hole: '#cfe6f6', n: 22, edge: 14, limbs: 6, bend: k ? -w * 0.03 : w * 0.03, dens: 0.55 }, 50401 + k);
        });
        mark('trees', ctx);
        finish(ctx, w, h, '#ffe0b0', 0.12, 0.22, 0.04, '#1a1420', 0.4);
        mark('finish', ctx);
      } catch (e) { PAINT._err = 'street: ' + String(e && e.stack || e); }
    },
    overlay: function (ctx, w, h, t) {
      try {
        var L = streetL(w, h), s = L.s, i;
        // sky things, kept out from behind the two canopies
        ctx.save();
        ctx.beginPath(); ctx.rect(0, 0, w, h);
        [L.treeL, L.treeR].forEach(function (T) { ctx.moveTo(T.cx + T.rx * 1.02, T.cy); ctx.ellipse(T.cx, T.cy, T.rx * 1.02, T.ry * 1.05, 0, 0, TAU); });
        ctx.clip('evenodd');
        for (i = 0; i < 3; i++) { var u = ((t * 0.012 + i / 3) % 1), P = L.cable(u); drawCabin(ctx, P[0], P[1], 3.4 * s, i === 1 ? '#ffd45c' : '#ff7a6b', '#e9f6ff', '#4a5878'); }
        ctx.strokeStyle = 'rgba(40,50,80,0.75)'; ctx.lineWidth = 1.1 * s; ctx.lineCap = 'round';
        for (i = 0; i < 4; i++) { var bx = ((t * (16 + i * 3) * s + i * 140 * s) % (w * 1.4)) - w * 0.2, by = h * (0.08 + i * 0.03) + Math.sin(t * 0.7 + i) * 6 * s; drawBird(ctx, bx, by, (4 - i * 0.4) * s, t * 7 + i * 2); }
        for (i = 0; i < 2; i++) {
          var dph = t * (0.04 + i * 0.025) + i * 3, dx = w * (0.5 + Math.sin(dph) * 0.25), dy = h * (0.27 + i * 0.05) + Math.sin(dph * 2.1) * h * 0.01;
          drawDrone(ctx, dx, dy, (3.4 - i) * s, '#f6f8fc', Math.sin(t * 4.5 + i * 2) > 0.5 ? 0.9 : 0.12, i ? '#7ff7e4' : '#ff5a4a');
        }
        ctx.restore();
        // street-level movers pass behind the two near trunks and the mall lamps
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, h);
        [L.treeL, L.treeR].forEach(function (T, k) { trunkPath(ctx, T.x, T.yb, T.cx, T.cy + T.ry * 0.35, 16 * s, 16 * s * 0.45, k ? -w * 0.03 : w * 0.03, true); });
        [w * 0.24, w * 0.78].forEach(function (lx) { var ls = s * 1.1, H2 = h * 0.2, yb = L.mall + h * 0.004; ctx.rect(lx - 1.6 * ls, yb - H2 - 7 * ls, 3.2 * ls, H2 + 7 * ls); ctx.rect(lx - 10 * ls, yb - H2 - 7 * ls, 30 * ls, 9 * ls); });
        ctx.clip('evenodd');
        // pedestrians on the far sidewalk
        var peds = [['#ff7a6b', '#2a2a3a', 1], ['#6c5ce7', '#3a2a20', -1], ['#16b3a6', '#1a1a1a', 1], ['#f5b82e', '#5a3a2a', -1]];
        for (i = 0; i < peds.length; i++) {
          var Pd = peds[i], sp = (6 + i * 1.3) * s * Pd[2], px = ((i * 113 * s + t * sp) % (w * 1.2) + w * 1.2) % (w * 1.2) - w * 0.1, py = L.walk0 + h * 0.012 + (i % 2) * h * 0.006, ps = (i % 2 ? 1.1 : 1) * s, ph = t * 6 + i;
          ctx.fillStyle = Pd[1]; ctx.fillRect(px - 1.6 * ps + Math.sin(ph) * 1.4 * ps, py - 6 * ps, 1.5 * ps, 6 * ps); ctx.fillRect(px + 0.2 * ps - Math.sin(ph) * 1.4 * ps, py - 6 * ps, 1.5 * ps, 6 * ps);
          ctx.fillStyle = Pd[0]; ctx.beginPath(); rrect(ctx, px - 2.6 * ps, py - 13 * ps, 5.2 * ps, 7.6 * ps, 2 * ps); ctx.fill();
          ctx.fillStyle = ['#f8d6c0', '#c98e64', '#7a4a2c', '#eab38f'][i]; ctx.beginPath(); ctx.arc(px, py - 15.2 * ps, 2.2 * ps, 0, TAU); ctx.fill();
          ctx.fillStyle = Pd[1]; ctx.beginPath(); ctx.arc(px, py - 15.8 * ps, 2.3 * ps, PI, TAU); ctx.fill();
        }
        // delivery robots: one on the far sidewalk (behind the trunks), one on the mall edge (in front)
        for (i = 0; i < 2; i++) {
          if (i === 1) { ctx.restore(); ctx.save(); }
          var dir = i ? -1 : 1, rx = ((t * (9 + i * 4) * s * dir + i * w * 0.6) % (w * 1.3) + w * 1.3) % (w * 1.3) - w * 0.15, ry = i ? L.mall + h * 0.012 : L.walk0 + h * 0.019, rs = (i ? 1.5 : 1) * s;
          ctx.fillStyle = 'rgba(30,30,40,0.25)'; ctx.beginPath(); ctx.ellipse(rx, ry, 9 * rs, 1.6 * rs, 0, 0, TAU); ctx.fill();
          ctx.fillStyle = '#f4f6fb'; ctx.beginPath(); rrect(ctx, rx - 8 * rs, ry - 11 * rs, 16 * rs, 9 * rs, 3 * rs); ctx.fill();
          ctx.fillStyle = i ? '#f5b82e' : '#16b3a6'; ctx.fillRect(rx - 8 * rs, ry - 6 * rs, 16 * rs, 1.6 * rs);
          ctx.fillStyle = '#2a2e40'; for (var wh = -1; wh <= 1; wh++) { ctx.beginPath(); ctx.arc(rx + wh * 5.5 * rs, ry - 1.6 * rs, 1.7 * rs, 0, TAU); ctx.fill(); }
          ctx.strokeStyle = '#c9d3e6'; ctx.lineWidth = 0.7 * rs; ctx.beginPath(); ctx.moveTo(rx + 5 * dir * rs, ry - 11 * rs); ctx.lineTo(rx + 6 * dir * rs, ry - 15 * rs); ctx.stroke();
          ctx.fillStyle = Math.sin(t * 4 + i) > 0 ? '#7ff7e4' : '#2a8a80'; ctx.beginPath(); ctx.arc(rx + 6 * dir * rs, ry - 15.5 * rs, 1 * rs, 0, TAU); ctx.fill();
        }
        ctx.restore();
        // the tram glides past now and then (behind the trunks and lamps)
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, h);
        [L.treeL, L.treeR].forEach(function (T, k) { trunkPath(ctx, T.x, T.yb, T.cx, T.cy + T.ry * 0.35, 16 * s, 16 * s * 0.45, k ? -w * 0.03 : w * 0.03, true); });
        [w * 0.24, w * 0.78].forEach(function (lx) { var ls = s * 1.1, H2 = h * 0.2, yb = L.mall + h * 0.004; ctx.rect(lx - 1.6 * ls, yb - H2 - 7 * ls, 3.2 * ls, H2 + 7 * ls); ctx.rect(lx - 10 * ls, yb - H2 - 7 * ls, 30 * ls, 9 * ls); });
        ctx.clip('evenodd');
        var per = 26, tp = (t % per) / per, tl = w * 0.95, tx = lerp(-tl - w * 0.1, w * 1.1, tp * 1.9);
        if (tx < w * 1.1) {
          var ty = (L.road0 + L.road1) / 2 + (L.road1 - L.road0) * 0.06, th = (L.road1 - L.road0) * 1.1;
          ctx.fillStyle = 'rgba(20,24,40,0.25)'; ctx.fillRect(tx + 4 * s, ty - 1 * s, tl, 3 * s);
          ctx.fillStyle = lg(ctx, 0, ty - th, 0, ty, [[0, '#ffffff'], [0.7, '#e8edf6'], [1, '#c4cbdc']]);
          ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx, ty - th * 0.75); ctx.quadraticCurveTo(tx + 2 * s, ty - th, tx + th * 0.6, ty - th); ctx.lineTo(tx + tl - th * 0.6, ty - th); ctx.quadraticCurveTo(tx + tl - 2 * s, ty - th, tx + tl, ty - th * 0.75); ctx.lineTo(tx + tl, ty); ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#2c3e5c'; ctx.beginPath(); rrect(ctx, tx + th * 0.35, ty - th * 0.82, tl - th * 0.7, th * 0.36, 3 * s); ctx.fill();
          ctx.fillStyle = 'rgba(200,230,255,0.35)'; for (i = 0; i < 6; i++) { var gx = tx + th * 0.5 + i * (tl - th) / 6; ctx.beginPath(); ctx.moveTo(gx, ty - th * 0.46); ctx.lineTo(gx + 8 * s, ty - th * 0.82); ctx.lineTo(gx + 14 * s, ty - th * 0.82); ctx.lineTo(gx + 6 * s, ty - th * 0.46); ctx.fill(); }
          ctx.fillStyle = '#16b3a6'; ctx.fillRect(tx, ty - th * 0.36, tl, th * 0.08);
          ctx.fillStyle = '#6c5ce7'; ctx.fillRect(tx, ty - th * 0.26, tl, th * 0.04);
          ctx.fillStyle = '#9aa4b8'; ctx.fillRect(tx + tl * 0.45, ty - th * 1.12, tl * 0.08, th * 0.12);
          ctx.fillStyle = '#fff6d0'; ctx.beginPath(); ctx.arc(tx + tl - 3 * s, ty - th * 0.2, 1.8 * s, 0, TAU); ctx.fill();
        }
        ctx.restore();
        // a few leaves drifting down from the canopies
        for (i = 0; i < 9; i++) {
          var a = hash(i, 91), b = hash(i, 92), c = hash(i, 93), per2 = 9 + c * 8, ph2 = ((t + a * per2) % per2) / per2;
          var src = i % 2 ? L.treeR : L.treeL, lx2 = src.cx + (a - 0.5) * src.rx * 1.4 + Math.sin(t * 0.8 + i) * 18 * s + ph2 * 40 * s * (i % 2 ? -1 : 1), ly2 = src.cy + ph2 * h * 0.7;
          var rot = t * (1 + c * 2) + i, ls = (3 + b * 2.5) * s;
          ctx.save(); ctx.translate(lx2, ly2); ctx.rotate(rot); ctx.scale(1, Math.abs(Math.sin(t * 2 + i)) * 0.8 + 0.2);
          ctx.globalAlpha = Math.min(1, Math.sin(ph2 * PI) * 2);
          ctx.fillStyle = ['#8ab84c', '#d8c050', '#e08a3a', '#5a9a3a'][i % 4]; ctx.beginPath(); leafPath(ctx, -ls, 0, ls * 2, ls * 0.55, 0, false); ctx.fill();
          ctx.restore();
        }
      } catch (e) { PAINT._err = 'street overlay: ' + String(e && e.stack || e); }
    }
  };

  /* ============================== HOSPITAL: Boston Harbor Hospital atrium ============================== */
  /* the Halo orb: layered holographic sphere (static part) */
  function haloOrb(ctx, x, y, R, s, a) {
    a = a == null ? 1 : a;
    // a soft deep-teal aura first so the orb reads against a bright sky
    softGlow(ctx, x, y, R * 2.6, '#0e6e78', 0.22 * a);
    softGlow(ctx, x, y, R * 1.7, '#16a6a0', 0.3 * a);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    softGlow(ctx, x, y, R * 3.4, '#5ee6d6', 0.16 * a);
    ctx.restore();
    // glassy sphere body
    ctx.fillStyle = rg(ctx, x - R * 0.3, y - R * 0.35, R * 0.05, R * 1.05, [[0, 'rgba(230,255,250,0.95)'], [0.3, 'rgba(90,226,210,0.85)'], [0.75, 'rgba(18,150,156,0.8)'], [1, 'rgba(10,90,120,0.75)']]);
    ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.fill();
    // fresnel rim
    ctx.strokeStyle = 'rgba(220,255,250,0.8)'; ctx.lineWidth = Math.max(1, R * 0.04); ctx.beginPath(); ctx.arc(x, y, R * 0.98, 0, TAU); ctx.stroke();
    ctx.fillStyle = rg(ctx, x, y, R * 0.7, R, [[0, 'rgba(127,247,228,0)'], [1, 'rgba(200,255,248,0.55)']]); ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.fill();
    // inner lattice (latitude/longitude lines)
    ctx.strokeStyle = 'rgba(200,255,250,0.35)'; ctx.lineWidth = Math.max(0.6, R * 0.015); ctx.beginPath();
    for (var i = 1; i < 4; i++) { var ry = R * Math.cos(i * PI / 8 * 1.6); ctx.moveTo(x + R * 0.98, y); ctx.ellipse(x, y, R * 0.98, Math.abs(R * (1 - i * 0.28)), 0, 0, TAU); }
    for (i = 1; i < 4; i++) { ctx.moveTo(x, y - R); ctx.ellipse(x, y, R * (1 - i * 0.3), R * 0.98, 0, -PI / 2, PI * 1.5); }
    ctx.stroke();
    // bright core + specular
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    softGlow(ctx, x, y, R * 0.55, '#ffffff', 0.85 * a);
    ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); qell(ctx, x - R * 0.38, y - R * 0.45, R * 0.22, R * 0.11, -0.6); ctx.fill();
    ctx.globalAlpha = 1;
  }
  var hospL = memo(function (w, h) {
    var s = S(w, h);
    return { s: s, wx0: w * 0.12, wx1: w * 0.88, ceil: h * 0.05, floor: h * 0.6, hz: h * 0.385, vpx: w * 0.5, vpy: h * 0.42, orb: [w * 0.5, h * 0.27], orbR: w * 0.085,
      mull: [0.12, 0.31, 0.5, 0.69, 0.88], trans: [0.2, 0.45] };
  });
  PAINT.hospital = {
    focus: { x: 0.5, y: 0.27 },
    paint: function (ctx, w, h) {
      try {
        var L = hospL(w, h), r = rng(60101), s = L.s, i, x, y, hz = L.hz, fl = L.floor;
        mark('start', ctx);
        /* ---------- the view: sky, skyline across the harbor, water ---------- */
        var SKY = [[0, '#4f98de'], [0.35, '#7cb6ea'], [0.7, '#bcdcf2'], [1, '#e8f4f6']];
        ctx.fillStyle = lg(ctx, 0, 0, 0, hz, SKY); ctx.fillRect(0, 0, w, hz + 2);
        skyStrokes(ctx, 0, w, 0, hz, SKY, 260, r, s, 0.1, '#ffffff', '#4a88d0');
        glow(ctx, w * 0.15, h * 0.02, w * 1.0, '#fff8e8', 0.45);
        for (i = 0; i < 5; i++) wisp(ctx, w * (0.1 + r() * 0.8), h * (0.06 + r() * 0.12), w * 0.4, h * 0.006, '#ffffff', 0.3, r);
        var cls = [[0.3, 0.13, 0.42, 0.05], [0.78, 0.2, 0.36, 0.04], [0.55, 0.075, 0.3, 0.03], [0.12, 0.27, 0.26, 0.03]];
        for (i = 0; i < cls.length; i++) cloudForm(ctx, w * cls[i][0], h * cls[i][1], w * cls[i][2], h * cls[i][3], r, { lit: '#ffffff', mid: '#eef4fa', shade: '#a4bad8', top: '#ffffff', al: 0.95, lx: -0.5, ly: -0.85, base: 0.6, seam: 0.12 });
        mark('sky', ctx);
        var E = { s: s, W: w, vpX: w * 0.5, sunX: w * 0.1, haze: '#d4e6f2', face: '#a6bad2', pale: '#eef2f4', lit: '#f8f4ec', shade: '#8094b8', rim: '#ffffff', rimA: 0.5,
          glass: ['#94c4ec', '#c4e0f2', '#e2eef4'], win: '#6a80a4', winLit: '#ffe6a8', litP: 0.02, mull: '#5a7098', sheen: '#ffffff',
          green: ['#2c5444', '#3c7450', '#5c9858', '#9cc86a', '#e8f4b0'] };
        // offshore wind farm far on the horizon (left)
        ctx.strokeStyle = 'rgba(240,248,252,0.9)'; ctx.lineWidth = Math.max(0.6, 0.5 * s);
        for (i = 0; i < 7; i++) { var tx = w * (0.02 + i * 0.045), th = h * (0.03 - i * 0.002), ta = r() * TAU; ctx.beginPath(); ctx.moveTo(tx, hz); ctx.lineTo(tx, hz - th); for (var bl = 0; bl < 3; bl++) { var aa = ta + bl * TAU / 3; ctx.moveTo(tx, hz - th); ctx.lineTo(tx + Math.cos(aa) * th * 0.4, hz - th + Math.sin(aa) * th * 0.4); } ctx.stroke(); }
        // skyline across the harbor (centre-right), far then mid
        var far = rng(60111);
        for (x = w * 0.3; x < w * 1.02;) { var bw = (8 + far() * 14) * s, bh = h * (0.02 + far() * 0.05 + 0.05 * Math.sin(clamp((x / w - 0.3) / 0.7, 0, 1) * PI)); tower(ctx, { x: x, w: bw, top: hz - bh, base: hz, kind: far() < 0.5 ? 'glass' : 'stone', k: 0.7, seed: (x * 5) | 0 }, E); x += bw * (0.8 + far() * 0.5); }
        var M = [
          { x: 0.36, w: 0.05, t: 0.3, kind: 'stone', roofTrees: 2 }, { x: 0.42, w: 0.055, t: 0.24, kind: 'glass', slant: -0.015 }, { x: 0.48, w: 0.06, t: 0.215, kind: 'garden', turb: 1 },
          { x: 0.55, w: 0.05, t: 0.255, kind: 'stone', mast: 0.18 }, { x: 0.61, w: 0.065, t: 0.235, kind: 'twist', vgarden: 1, vawt: 2 }, { x: 0.69, w: 0.05, t: 0.28, kind: 'glass' },
          { x: 0.75, w: 0.07, t: 0.26, kind: 'garden', roofTrees: 3 }, { x: 0.83, w: 0.05, t: 0.3, kind: 'stone', solar: 1 }, { x: 0.89, w: 0.06, t: 0.245, kind: 'glass', slant: 0.012 }
        ];
        for (i = 0; i < M.length; i++) { var m = M[i]; tower(ctx, { x: w * m.x, w: w * m.w, top: h * m.t, base: hz, kind: m.kind, k: 0.3 + (i % 3) * 0.05, seed: 60200 + i * 7, slant: (m.slant || 0) * h, mast: m.mast, turb: m.turb, vawt: m.vawt, roofTrees: m.roofTrees, solar: m.solar, vgarden: m.vgarden }, E); }
        // low waterfront: brick warehouses + green pier park
        rowhouses(ctx, w * 0.28, w * 1.02, hz, s * 0.8, { bricks: ['#c08a74', '#b07a68', '#d0a08a', '#a88878'], lit: '#fff0e0', haze: '#d4e6f2', roof: '#7a8098', trim: '#f4ece4', win: '#6a7a98', winLit: '#ffe6a8', litP: 0.05 }, r, E);
        treeRow(ctx, w * 0.28, w * 1.02, function () { return hz + h * 0.002; }, 2.5 * s, 4.5 * s, ['#4a6a5c', '#5a7e60', '#7a9a6a', '#a8c080', '#e8f0c0'], r, -0.6, -0.8, 0.6);
        // little lighthouse island (left)
        var ix = w * 0.2, iy = hz + h * 0.004;
        ctx.fillStyle = '#7a8a7a'; ctx.beginPath(); ctx.moveTo(ix - 22 * s, iy); ctx.quadraticCurveTo(ix, iy - 9 * s, ix + 24 * s, iy); ctx.fill();
        clump(ctx, ix - 8 * s, iy - 5 * s, 5 * s, ['#3a5a46', '#4a6e52', '#6a8a62', '#9ab47a', '#d8e8b0'], r, -0.6, -0.8, false, 0.6);
        ctx.fillStyle = '#f6f4ee'; ctx.beginPath(); ctx.moveTo(ix + 4 * s, iy - 5 * s); ctx.lineTo(ix + 5 * s, iy - 22 * s); ctx.lineTo(ix + 9 * s, iy - 22 * s); ctx.lineTo(ix + 10 * s, iy - 5 * s); ctx.fill();
        ctx.fillStyle = '#d0564a'; ctx.fillRect(ix + 4.6 * s, iy - 14 * s, 5 * s, 2.6 * s); ctx.fillRect(ix + 4.2 * s, iy - 25 * s, 5.6 * s, 3 * s);
        band(ctx, 0, w, hz - h * 0.05, hz + h * 0.01, '#e4eef4', 0.6);
        mark('skyline', ctx);
        // harbor water
        var wy1 = fl;
        ctx.fillStyle = lg(ctx, 0, hz, 0, wy1, [[0, '#9ccbe4'], [0.25, '#5fa2cf'], [0.7, '#3a82b8'], [1, '#2f72a8']]); ctx.fillRect(0, hz, w, wy1 - hz);
        reflect(ctx, w, hz, wy1, 0.4, 1.8 * s, 1.1 / s, 2, 1.1);
        ctx.fillStyle = lg(ctx, 0, hz, 0, wy1, [[0, 'rgba(180,220,240,0.3)'], [1, 'rgba(30,100,150,0.35)']]); ctx.fillRect(0, hz, w, wy1 - hz);
        batch(ctx, 1600, [['#ffffff', 0.6 * s, 0.5], ['#1e5a8a', 0.8 * s, 0.35], ['#bfe6f6', 0.6 * s, 0.4]], function () {
          var p = Math.pow(r(), 1.2), yy = hz + 1 + p * (wy1 - hz), xx = r() * w, l = (1 + p * 12 + r() * 5) * s; return [xx, yy, xx + l, yy + (r() - 0.5) * 0.4 * s, (r() * 3) | 0];
        });
        dots(ctx, 300, [['#ffffff', 0.85], ['#fff6d8', 0.7]], function () { var p = r(), yy = hz + p * (wy1 - hz), xx = w * 0.25 + (r() - 0.5) * w * (0.15 + p * 0.5); return [xx, yy, (0.4 + r() * 0.7 * (0.3 + p)) * s, r() < 0.5 ? 0 : 1]; });
        // moored boats + a harbor buoy
        var bts = [[0.42, 0.41, 4], [0.58, 0.425, 5], [0.86, 0.45, 6], [0.3, 0.47, 7]];
        for (i = 0; i < bts.length; i++) { var bx = w * bts[i][0], by = h * bts[i][1], bs = bts[i][2] * s; ctx.save(); ctx.translate(bx, by); ctx.scale(1, -0.7); ctx.globalAlpha = 0.25; boat(ctx, 0, 0, bs, '#ffffff', '#2a4a6a'); ctx.restore(); boat(ctx, bx, by, bs, '#ffffff', i % 2 ? '#16b3a6' : '#2a4a6a', '#e4eef8'); }
        mark('water', ctx);
        /* ---------- the atrium ---------- */
        // ceiling: glazed roof receding toward the view, white ribs
        var c0 = L.ceil;
        ctx.fillStyle = lg(ctx, 0, 0, 0, c0, [[0, '#d8e6ee'], [1, '#f4f8fa']]); ctx.fillRect(0, 0, w, c0);
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, c0); ctx.clip();
        ctx.fillStyle = lg(ctx, 0, 0, 0, c0, [[0, 'rgba(120,180,230,0.55)'], [1, 'rgba(200,230,250,0.3)']]); ctx.fillRect(0, 0, w, c0);
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5 * s; ctx.beginPath();
        for (i = -6; i <= 6; i++) { var gx = L.vpx + i * w * 0.12; ctx.moveTo(lerp(L.vpx, gx, (c0 - L.vpy) / (c0 - L.vpy)), c0); ctx.lineTo(L.vpx + (gx - L.vpx) * ((0 - L.vpy) / (c0 - L.vpy)), 0); }
        ctx.stroke(); ctx.restore();
        // side galleries in perspective (left, right)
        var k0 = (L.vpx - 0) / (L.vpx - L.wx0);
        function P(xb, yb, side) { var ex = side < 0 ? 0 : w; var kk = (L.vpx - ex) / (L.vpx - xb); return [ex, L.vpy + (yb - L.vpy) * kk]; }
        [-1, 1].forEach(function (side) {
          var xb = side < 0 ? L.wx0 : L.wx1, ex = side < 0 ? 0 : w;
          var a0 = P(xb, -h, side), a1 = P(xb, fl, side);
          // wall face
          ctx.fillStyle = lg(ctx, ex, 0, xb, 0, [[0, '#e6e0d8'], [1, '#f6f2ec']]);
          poly(ctx, [[ex, -h], [xb, -h], [xb, fl], [ex, a1[1]]]); ctx.fill();
          // two gallery floors: soffit, slab edge, glass balustrade, trailing plants
          [0.17, 0.36].forEach(function (gyb, gi) {
            var yB = h * gyb, e0 = P(xb, yB, side), e1 = P(xb, yB + h * 0.022, side);
            // interior band (shadowed corridor) above slab
            var up = P(xb, yB - h * 0.1, side);
            ctx.fillStyle = lg(ctx, ex, 0, xb, 0, [[0, '#c8a888'], [1, '#e2cdb4']]); poly(ctx, [[ex, up[1]], [xb, yB - h * 0.1], [xb, yB], [ex, e0[1]]]); ctx.fill();
            ctx.strokeStyle = 'rgba(120,80,50,0.35)'; ctx.lineWidth = 0.8 * s; ctx.beginPath(); for (var sl = 0; sl < 12; sl++) { var fs2 = sl / 12; ctx.moveTo(lerp(ex, xb, fs2), lerp(up[1], yB - h * 0.1, fs2)); ctx.lineTo(lerp(ex, xb, fs2), lerp(e0[1], yB, fs2)); } ctx.stroke();
            // doors / glazing along the gallery
            ctx.fillStyle = 'rgba(120,170,200,0.35)';
            for (var dq = 0; dq < 3; dq++) { var f0 = 0.15 + dq * 0.3, f1 = f0 + 0.15, X0 = lerp(ex, xb, f0), X1 = lerp(ex, xb, f1); var ty0 = lerp(up[1], yB - h * 0.1, f0), ty1 = lerp(up[1], yB - h * 0.1, f1), by0 = lerp(e0[1], yB, f0), by1 = lerp(e0[1], yB, f1); poly(ctx, [[X0, ty0 + (by0 - ty0) * 0.25], [X1, ty1 + (by1 - ty1) * 0.25], [X1, by1], [X0, by0]]); ctx.fill(); }
            // slab edge
            ctx.fillStyle = '#ffffff'; poly(ctx, [[ex, e0[1]], [xb, yB], [xb, yB + h * 0.022], [ex, e1[1]]]); ctx.fill();
            ctx.fillStyle = 'rgba(120,140,160,0.25)'; poly(ctx, [[ex, e1[1] - (e1[1] - e0[1]) * 0.25], [xb, yB + h * 0.016], [xb, yB + h * 0.022], [ex, e1[1]]]); ctx.fill();
            // glass balustrade
            var g0 = P(xb, yB - h * 0.035, side);
            ctx.fillStyle = 'rgba(200,235,245,0.35)'; poly(ctx, [[ex, g0[1]], [xb, yB - h * 0.035], [xb, yB], [ex, e0[1]]]); ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 1.2 * s; ctx.beginPath(); ctx.moveTo(ex, g0[1]); ctx.lineTo(xb, yB - h * 0.035); ctx.stroke();
            // planters spilling greenery over the edge
            var gr = rng(60300 + gi * 7 + (side > 0 ? 3 : 0));
            for (var pq = 0; pq < 7; pq++) {
              var f = (pq + 0.5) / 7, X = lerp(ex, xb, f), Y = lerp(e0[1], yB, f), sc3 = lerp(k0, 1, f);
              clump(ctx, X, Y - 2 * s * sc3, (6 + gr() * 4) * s * sc3, ['#1e4430', '#2e6a3e', '#4a9a4a', '#8acb5a', '#d8f4a0'], gr, -side * 0.4, -0.8, false, 0.7);
            }
            ctx.strokeStyle = '#3a7a3e'; ctx.lineWidth = 1 * s; ctx.beginPath();
            var VB = [];
            for (pq = 0; pq < 9; pq++) { var f2 = gr() * 0.9 + 0.05, X2 = lerp(ex, xb, f2), Y2 = lerp(e1[1], yB + h * 0.022, f2), len = h * (0.03 + gr() * 0.06) * lerp(k0, 1, f2); ctx.moveTo(X2, Y2); ctx.quadraticCurveTo(X2 + side * 4 * s, Y2 + len * 0.5, X2 + (gr() - 0.5) * 6 * s, Y2 + len); VB.push([X2, Y2, len]); }
            ctx.stroke();
            ctx.fillStyle = '#4a9a4a'; ctx.beginPath(); VB.forEach(function (V) { for (var q = 1; q < 6; q++) lens(ctx, V[0] + (q % 2 ? 2 : -2) * s, V[1] + V[2] * q / 6, 4 * s, 1.6 * s, PI / 2 + (q % 2 ? -0.6 : 0.6)); }); ctx.fill();
          });
          // ground floor: a living green wall in perspective
          var gt = P(xb, h * 0.43, side), gb = a1;
          ctx.fillStyle = '#24502e'; poly(ctx, [[ex, gt[1]], [xb, h * 0.43], [xb, fl - 2 * s], [ex, gb[1] - 4 * s]]); ctx.fill();
          var gwr = rng(60500 + (side > 0 ? 1 : 0)), GB = [[], [], [], [], []];
          for (var gq = 0; gq < 900; gq++) {
            var f3 = gwr(), v3 = gwr(), X3 = lerp(ex, xb, f3), yT = lerp(gt[1], h * 0.43, f3), yBt = lerp(gb[1] - 4 * s, fl - 2 * s, f3), Y3 = lerp(yT, yBt, v3), sc4 = lerp(k0, 1, f3);
            var lit3 = clamp(0.55 - v3 * 0.35 + (gwr() - 0.5) * 0.7 + fbm2(f3 * 4, v3 * 6, 61, 2) * 0.4 - 0.2, 0, 0.999);
            GB[(lit3 * 5) | 0].push([X3, Y3, (2.2 + gwr() * 2.4) * s * sc4, gwr() * TAU]);
          }
          var gc = ['#1c4228', '#2c6436', '#4a8c40', '#7cb850', '#c8e88a'];
          for (gq = 0; gq < 5; gq++) { ctx.fillStyle = gc[gq]; ctx.beginPath(); GB[gq].forEach(function (Q) { lens(ctx, Q[0], Q[1], Q[2] * 2, Q[2] * 0.7, Q[3]); }); ctx.fill(); }
          dots(ctx, 60, [['#ffffff', 0.9], ['#ff9ab0', 0.9], ['#ffd35a', 0.9]], function () { var f4 = gwr(), v4 = gwr(); return [lerp(ex, xb, f4), lerp(lerp(gt[1], h * 0.43, f4), lerp(gb[1], fl, f4), v4), (0.8 + gwr()) * s * lerp(k0, 1, f4), (gwr() * 3) | 0]; });
          ctx.fillStyle = lg(ctx, ex, 0, xb, 0, [[0, 'rgba(255,250,230,0.12)'], [1, 'rgba(20,40,30,0.2)']]); poly(ctx, [[ex, gt[1]], [xb, h * 0.43], [xb, fl], [ex, gb[1]]]); ctx.fill();
        });
        // glass wall frame: mullions + transoms, slim and white
        ctx.fillStyle = '#ffffff';
        for (i = 0; i < L.mull.length; i++) { var mx = w * L.mull[i], mw = (i === 0 || i === L.mull.length - 1 ? 5 : 3.2) * s; ctx.fillRect(mx - mw / 2, c0, mw, fl - c0); }
        for (i = 0; i < L.trans.length; i++) { ctx.fillRect(L.wx0, h * L.trans[i] - 1.4 * s, L.wx1 - L.wx0, 2.8 * s); }
        ctx.fillRect(L.wx0, c0 - 2 * s, L.wx1 - L.wx0, 5 * s);
        ctx.fillStyle = 'rgba(90,120,150,0.18)'; for (i = 0; i < L.mull.length; i++) { var mx2 = w * L.mull[i]; ctx.fillRect(mx2 + 1.4 * s, c0, 1 * s, fl - c0); }
        // faint glass reflections (diagonal sheens)
        ctx.save(); ctx.beginPath(); ctx.rect(L.wx0, c0, L.wx1 - L.wx0, fl - c0); ctx.clip(); ctx.globalCompositeOperation = 'lighter';
        for (i = 0; i < 4; i++) { var sx0 = w * (0.1 + i * 0.25); ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.beginPath(); ctx.moveTo(sx0, c0); ctx.lineTo(sx0 + w * 0.08, c0); ctx.lineTo(sx0 - w * 0.12, fl); ctx.lineTo(sx0 - w * 0.2, fl); ctx.fill(); }
        ctx.restore();
        // long low planter along the base of the glass
        ctx.fillStyle = '#f2eee8'; ctx.fillRect(L.wx0, fl - 7 * s, L.wx1 - L.wx0, 9 * s);
        ctx.fillStyle = 'rgba(120,110,100,0.25)'; ctx.fillRect(L.wx0, fl, L.wx1 - L.wx0, 2 * s);
        var ppal = ['#1e4430', '#2c683c', '#4a9a48', '#8acb5a', '#e0f6a8'];
        for (x = L.wx0; x < L.wx1; x += (7 + r() * 6) * s) clump(ctx, x, fl - 9 * s - r() * 3 * s, (6 + r() * 5) * s, ppal, r, -0.6, -0.8, false, 0.7);
        dots(ctx, 70, [['#ffffff', 1], ['#ff8aa8', 1], ['#ffd35a', 1], ['#b89af0', 1]], function () { return [lerp(L.wx0, L.wx1, r()), fl - (8 + r() * 10) * s, (1 + r() * 1.2) * s, (r() * 4) | 0]; });
        mark('atrium', ctx);
        /* ---------- polished floor with reflections ---------- */
        ctx.fillStyle = lg(ctx, 0, fl, 0, h, [[0, '#d8d8d2'], [0.4, '#e8e0d4'], [1, '#dcd0c0']]);
        ctx.beginPath(); ctx.moveTo(0, P(L.wx0, fl, -1)[1]); ctx.lineTo(L.wx0, fl); ctx.lineTo(L.wx1, fl); ctx.lineTo(w, P(L.wx1, fl, 1)[1]); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fill();
        ctx.save(); ctx.clip();
        reflect(ctx, w, fl, h * 0.92, 0.42, 0.5 * s, 0.4 / s, 1, 1.25);
        ctx.fillStyle = lg(ctx, 0, fl, 0, h, [[0, 'rgba(236,230,220,0.15)'], [0.5, 'rgba(236,228,216,0.45)'], [1, 'rgba(226,214,198,0.8)']]); ctx.fillRect(0, fl, w, h - fl);
        // stone veining
        batch(ctx, 140, [['#b8aa98', 0.8 * s, 0.25], ['#ffffff', 0.6 * s, 0.3]], function () { var yy = lerp(fl + h * 0.02, h, Math.pow(r(), 0.8)), xx = r() * w, l = (20 + r() * 60) * s * (yy - fl) / (h - fl); return [xx, yy, xx + l, yy + (r() - 0.5) * l * 0.2, r() < 0.5 ? 0 : 1, xx + l * 0.5, yy + (r() - 0.5) * l * 0.3]; });
        // tile joints converging to the vanishing point
        ctx.strokeStyle = 'rgba(150,150,150,0.3)'; ctx.lineWidth = 0.8 * s; ctx.beginPath();
        for (i = -12; i <= 12; i++) { var bx2 = L.vpx + i * w * 0.16; ctx.moveTo(lerp(L.vpx, bx2, (fl - L.vpy) / (h - L.vpy)), fl); ctx.lineTo(bx2, h); }
        var ty2 = fl, td = h * 0.012; while (ty2 < h) { ctx.moveTo(0, ty2); ctx.lineTo(w, ty2); ty2 += td; td *= 1.28; }
        ctx.stroke();
        // sunlight through the glass wall laid on the floor
        ctx.globalCompositeOperation = 'lighter';
        for (i = 0; i < 4; i++) {
          var p0 = w * (L.mull[i] + 0.012), p1 = w * (L.mull[i + 1] - 0.012), sk = w * 0.18;
          ctx.fillStyle = lg(ctx, 0, fl, 0, h * 0.95, [[0, 'rgba(255,248,225,0.25)'], [1, 'rgba(255,240,210,0.04)']]);
          ctx.beginPath(); ctx.moveTo(p0, fl + 2 * s); ctx.lineTo(p1, fl + 2 * s); ctx.lineTo(p1 + sk + (p1 - L.vpx) * 0.6, h * 0.95); ctx.lineTo(p0 + sk + (p0 - L.vpx) * 0.6, h * 0.95); ctx.fill();
        }
        ctx.restore();
        // inlaid floor medallion beneath Halo
        var mcx = L.orb[0], mcy = fl + h * 0.075;
        [[0.34, '#cfc4b2', 0], [0.3, '#efe8dc', 0], [0.22, '#16b3a6', 1], [0.2, '#e8e0d2', 0], [0.12, '#cfe8e4', 0], [0.05, '#16b3a6', 0]].forEach(function (M2) {
          ctx.globalAlpha = 0.85; if (M2[2]) { ctx.strokeStyle = M2[1]; ctx.lineWidth = 1.6 * s; ctx.beginPath(); ctx.ellipse(mcx, mcy, w * M2[0], w * M2[0] * 0.12, 0, 0, TAU); ctx.stroke(); }
          else { ctx.fillStyle = M2[1]; ctx.beginPath(); ctx.ellipse(mcx, mcy, w * M2[0], w * M2[0] * 0.12, 0, 0, TAU); ctx.fill(); }
        });
        ctx.globalAlpha = 1; ctx.strokeStyle = 'rgba(22,179,166,0.5)'; ctx.lineWidth = 1 * s; ctx.beginPath();
        for (i = 0; i < 16; i++) { var ma = i * TAU / 16; ctx.moveTo(mcx + Math.cos(ma) * w * 0.12, mcy + Math.sin(ma) * w * 0.0144); ctx.lineTo(mcx + Math.cos(ma) * w * 0.2, mcy + Math.sin(ma) * w * 0.024); }
        ctx.stroke();
        // the orb's glow pooling on the floor
        ctx.save(); ctx.translate(L.orb[0], fl + h * 0.06); ctx.scale(1, 0.22); ctx.globalCompositeOperation = 'lighter'; softGlow(ctx, 0, 0, w * 0.4, '#5ee6d6', 0.3); ctx.restore();
        mark('floor', ctx);
        /* ---------- indoor trees in round planters (mid-distance; bottom corners stay open) ---------- */
        var tpal = ['#1c3a28', '#2a5a34', '#47863e', '#86bc56', '#d8f0a0'];
        [[0.15, 0.705, 0.14, 0.47, 0.17, 0.085, 60401], [0.86, 0.71, 0.86, 0.485, 0.16, 0.08, 60402]].forEach(function (T) {
          var px = w * T[0], py = h * T[1], pr = 30 * s;
          ctx.fillStyle = 'rgba(60,70,70,0.22)'; ctx.beginPath(); ctx.ellipse(px, py + 2 * s, pr * 1.25, pr * 0.28, 0, 0, TAU); ctx.fill();
          broadleaf(ctx, { x: px, yb: py - pr * 0.6, cx: w * T[2], cy: h * T[3], rx: w * T[4], ry: h * T[5], tw: 8 * s, s: s, lx: -0.6, ly: -0.8, pal: tpal, bark: ['#c8b49a', '#8a7660', '#4a3a2c'], n: 24, edge: 14, limbs: 5, bend: 0, dens: 0.5 }, T[6]);
          ctx.fillStyle = lg(ctx, px - pr, 0, px + pr, 0, [[0, '#d8dee0'], [0.35, '#ffffff'], [1, '#b8c2c6']]);
          ctx.beginPath(); ctx.moveTo(px - pr, py - pr * 0.75); ctx.lineTo(px + pr, py - pr * 0.75); ctx.lineTo(px + pr * 0.85, py); ctx.quadraticCurveTo(px, py + pr * 0.12, px - pr * 0.85, py); ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#16b3a6'; ctx.fillRect(px - pr, py - pr * 0.62, pr * 2, 2 * s);
          ctx.fillStyle = '#5a4a3a'; ctx.beginPath(); ctx.ellipse(px, py - pr * 0.75, pr * 0.95, pr * 0.16, 0, 0, TAU); ctx.fill();
          clump(ctx, px - pr * 0.5, py - pr * 0.82, pr * 0.32, tpal, r, -0.6, -0.8, false, 0.8); clump(ctx, px + pr * 0.45, py - pr * 0.8, pr * 0.28, tpal, r, -0.6, -0.8, false, 0.8);
        });
        mark('trees', ctx);
        /* ---------- light: shafts through the glass + Halo ---------- */
        shafts(ctx, w * 0.12, -h * 0.05, w, h, '#fff8e0', 0.06, 7, r, 0.5, PI * 0.36, 0.02, 0.05);
        haloOrb(ctx, L.orb[0], L.orb[1], L.orbR, s, 1);
        // soft ring platform hint under the orb (light on the floor)
        ctx.strokeStyle = 'rgba(94,230,214,0.45)'; ctx.lineWidth = 1.5 * s; ctx.beginPath(); ctx.ellipse(L.orb[0], fl + h * 0.06, w * 0.16, h * 0.012, 0, 0, TAU); ctx.stroke();
        ctx.strokeStyle = 'rgba(94,230,214,0.25)'; ctx.beginPath(); ctx.ellipse(L.orb[0], fl + h * 0.06, w * 0.22, h * 0.017, 0, 0, TAU); ctx.stroke();
        mark('halo', ctx);
        finish(ctx, w, h, '#fff4e0', 0.1, 0.16, 0.035, '#20304a', 0.4);
        mark('finish', ctx);
      } catch (e) { PAINT._err = 'hospital: ' + String(e && e.stack || e); }
    },
    overlay: function (ctx, w, h, t) {
      try {
        var L = hospL(w, h), s = L.s, i, hz = L.hz, fl = L.floor;
        // through the glass: ferry, sailboats, gulls, sparkles
        ctx.save(); ctx.beginPath(); ctx.rect(L.wx0, L.ceil, L.wx1 - L.wx0, fl - L.ceil); ctx.clip();
        var fx = ((t * 7 * s) % (w * 1.5)) - w * 0.25, fy = h * 0.5, fs = s * 1.3;
        ctx.globalAlpha = 0.25; ctx.fillStyle = '#ffffff'; ctx.fillRect(fx - 24 * fs, fy + 2 * fs, 48 * fs, 3 * fs); ctx.globalAlpha = 1;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(fx - 26 * fs, fy - 5 * fs); ctx.lineTo(fx + 30 * fs, fy - 5 * fs); ctx.lineTo(fx + 24 * fs, fy + 2 * fs); ctx.lineTo(fx - 22 * fs, fy + 2 * fs); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#16b3a6'; ctx.fillRect(fx - 24 * fs, fy - 2 * fs, 50 * fs, 1.6 * fs);
        ctx.fillStyle = '#f4f8fa'; ctx.beginPath(); rrect(ctx, fx - 16 * fs, fy - 12 * fs, 34 * fs, 7 * fs, 2 * fs); ctx.fill();
        ctx.fillStyle = '#3a5a7a'; for (i = 0; i < 6; i++) ctx.fillRect(fx - 13 * fs + i * 5 * fs, fy - 10 * fs, 3 * fs, 3 * fs);
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); rrect(ctx, fx - 4 * fs, fy - 16 * fs, 12 * fs, 4.5 * fs, 1.5 * fs); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.moveTo(fx - 26 * fs, fy + 2 * fs); ctx.quadraticCurveTo(fx - 40 * fs, fy + 4 * fs, fx - 60 * fs, fy + 3 * fs); ctx.stroke();
        for (i = 0; i < 2; i++) { var bx = ((t * (3 + i * 2) * s + w * (0.2 + i * 0.5)) % (w * 1.2)) - w * 0.1, by = h * (0.43 + i * 0.06), bs = (5 + i * 2) * s; ctx.save(); ctx.translate(bx, by); ctx.scale(1, -0.7); ctx.globalAlpha = 0.25; boat(ctx, 0, 0, bs, '#ffffff', '#2a4a6a'); ctx.restore(); boat(ctx, bx, by, bs, '#ffffff', i ? '#ff7a6b' : '#6c5ce7', '#eaf2fa'); }
        ctx.fillStyle = '#ffffff';
        for (i = 0; i < 16; i++) { var p2 = hash(i, 81), gy = hz + h * 0.01 + p2 * (fl - hz - h * 0.02), gx = w * (0.15 + hash(i, 82) * 0.75); var tw = Math.pow(Math.max(0, Math.sin(t * (1.5 + hash(i, 83) * 2.5) + i * 4)), 8); if (tw < 0.05) continue; var z = (0.8 + p2 * 1.6) * s * tw; ctx.globalAlpha = tw; ctx.fillRect(gx - z * 2, gy - 0.3 * s, z * 4, 0.6 * s); ctx.fillRect(gx - 0.3 * s, gy - z, 0.6 * s, z * 2); }
        ctx.globalAlpha = 1; ctx.strokeStyle = 'rgba(60,70,90,0.7)'; ctx.lineWidth = 1 * s; ctx.lineCap = 'round';
        for (i = 0; i < 3; i++) { var gx2 = ((t * (12 + i * 3) * s + i * 90 * s) % (w * 1.3)) - w * 0.15, gy2 = h * (0.12 + i * 0.035) + Math.sin(t * 0.8 + i) * 5 * s; drawBird(ctx, gx2, gy2, (4 - i * 0.5) * s, t * 6 + i * 2); }
        ctx.restore();
        // breathing light shafts
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (i = 0; i < 3; i++) {
          var a = PI * (0.3 + i * 0.07), br = 0.025 + 0.02 * Math.sin(t * 0.3 + i * 2), Lx = h * 1.1, wd = 0.03, ox = w * 0.12, oy = -h * 0.05;
          ctx.fillStyle = lg(ctx, ox, oy, ox + Math.cos(a) * Lx, oy + Math.sin(a) * Lx, [[0, 'rgba(255,250,230,0)'], [0.3, 'rgba(255,250,230,' + br.toFixed(3) + ')'], [1, 'rgba(255,250,230,0)']]);
          ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + Math.cos(a - wd) * Lx, oy + Math.sin(a - wd) * Lx); ctx.lineTo(ox + Math.cos(a + wd) * Lx, oy + Math.sin(a + wd) * Lx); ctx.fill();
        }
        // Halo: breathing glow, orbiting rings, rising motes
        var ox2 = L.orb[0], oy2 = L.orb[1], R = L.orbR, pulse = 0.5 + 0.5 * Math.sin(t * 1.4);
        var sp = glowSpr('#7ff7e4');
        if (sp) { ctx.globalAlpha = 0.25 + pulse * 0.25; ctx.drawImage(sp, ox2 - R * 2.4, oy2 - R * 2.4, R * 4.8, R * 4.8); }
        ctx.globalAlpha = 1; ctx.lineWidth = Math.max(1, 1.4 * s);
        for (i = 0; i < 3; i++) {
          var tilt = [0.32, -0.5, 0.12][i], rr = R * [1.35, 1.6, 1.9][i], sq = [0.28, 0.22, 0.12][i], rot = t * [0.6, -0.45, 0.3][i];
          ctx.save(); ctx.translate(ox2, oy2); ctx.rotate(tilt);
          ctx.strokeStyle = 'rgba(127,247,228,' + (0.35 + 0.2 * Math.sin(t + i)).toFixed(3) + ')';
          ctx.beginPath(); ctx.ellipse(0, 0, rr, rr * sq, 0, rot, rot + PI * 1.2); ctx.stroke();
          var ba = rot + PI * 1.2; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(Math.cos(ba) * rr, Math.sin(ba) * rr * sq, 1.8 * s, 0, TAU); ctx.fill();
          ctx.restore();
        }
        var sp2 = glowSpr('#bffcf2', true);
        if (sp2) for (i = 0; i < 14; i++) {
          var a3 = hash(i, 31) * TAU, ph = (t * (0.08 + hash(i, 32) * 0.06) + hash(i, 33)) % 1, d = R * (1.1 + ph * 1.6);
          var mx = ox2 + Math.cos(a3 + t * 0.2) * d, my = oy2 + Math.sin(a3 + t * 0.2) * d * 0.6 - ph * R * 1.2, ms = (2 + hash(i, 34) * 3) * s;
          ctx.globalAlpha = Math.sin(ph * PI) * 0.8; ctx.drawImage(sp2, mx - ms, my - ms, ms * 2, ms * 2);
        }
        ctx.restore();
      } catch (e) { PAINT._err = 'hospital overlay: ' + String(e && e.stack || e); }
    }
  };

  /* ============================== NIGHT: the city from a balcony ============================== */
  var nightL = memo(function (w, h) {
    var s = S(w, h), L = { s: s, hz: h * 0.44, rail: h * 0.625, deck: h * 0.705, moon: [w * 0.75, h * 0.17], moonR: w * 0.055 };
    // skyline spec shared by paint (draw) and overlay (blinking lights, flickering windows)
    var r = rng(70111), M = [], x;
    var hand = [
      { x: 0.3, w: 0.06, t: 0.3, kind: 'stone', mast: 0.2 }, { x: 0.365, w: 0.055, t: 0.255, kind: 'glass', slant: -0.02 },
      { x: 0.425, w: 0.065, t: 0.22, kind: 'twist', turb: 2, vgarden: 1 }, { x: 0.495, w: 0.05, t: 0.29, kind: 'stone', roofTrees: 2 },
      { x: 0.55, w: 0.07, t: 0.245, kind: 'garden', vawt: 2 }, { x: 0.625, w: 0.05, t: 0.205, kind: 'glass', mast: 0.12, beacon: 1 },
      { x: 0.68, w: 0.06, t: 0.31, kind: 'stone', solar: 1 }, { x: 0.745, w: 0.055, t: 0.27, kind: 'glass', slant: 0.015 },
      { x: 0.805, w: 0.07, t: 0.235, kind: 'garden', turb: 1 }, { x: 0.88, w: 0.05, t: 0.3, kind: 'stone', mast: 0.15 }, { x: 0.935, w: 0.07, t: 0.33, kind: 'spire', spire: 0.05 }
    ];
    for (var i = 0; i < hand.length; i++) { var m = hand[i]; M.push({ x: w * m.x, w: w * m.w, top: h * m.t, base: L.hz, kind: m.kind, k: 0.08 + (i % 3) * 0.05, seed: 70200 + i * 7, slant: (m.slant || 0) * h, mast: m.mast, turb: m.turb, vawt: m.vawt, roofTrees: m.roofTrees, solar: m.solar, vgarden: m.vgarden, spire: (m.spire || 0) * h, beacon: m.beacon, litMul: 1 }); }
    L.towers = M;
    L.blinks = [];
    for (i = 0; i < M.length; i++) { var B = M[i], top = Math.min(B.top, B.top + (B.slant || 0)); if (B.mast) L.blinks.push([B.x + B.w / 2, top - (B.base - B.top) * B.mast, i]); else if (B.turb) L.blinks.push([B.x + B.w / 2, top - Math.max(6 * s, B.w * 0.45) - 1.5 * s, i]); else if (i % 3 === 0) L.blinks.push([B.x + B.w * 0.85, top - 1.5 * s, i]); }
    L.flick = [];
    for (i = 0; i < 14; i++) { var T = M[(r() * M.length) | 0]; L.flick.push([T.x + T.w * (0.15 + r() * 0.6), lerp(T.top + 8 * s, T.base - 6 * s, r()), r()]); }
    var A = [-w * 0.05, h * 0.36], C = [w * 0.24, h * 0.315], Bp = [w * 1.05, h * 0.355];
    L.cable = function (u) { var xx = lerp(A[0], Bp[0], u), tt; if (xx <= C[0]) { tt = (xx - A[0]) / (C[0] - A[0]); return [xx, lerp(A[1], C[1], tt) + h * 0.004 * 4 * tt * (1 - tt)]; } tt = (xx - C[0]) / (Bp[0] - C[0]); return [xx, lerp(C[1], Bp[1], tt) + h * 0.03 * 4 * tt * (1 - tt)]; };
    L.pylon = C;
    // string lights: two drooping strands under the pergola beam
    L.bulbs = [];
    [[-0.02, 0.5, 0.05, 0.026], [0.5, 1.02, 0.048, 0.024]].forEach(function (St) {
      for (var k = 0; k <= 9; k++) { var u = k / 9; L.bulbs.push([w * lerp(St[0], St[1], u), h * St[2] + h * St[3] * 4 * u * (1 - u)]); }
    });
    return L;
  });
  PAINT.night = {
    focus: { x: 0.75, y: 0.17 },
    paint: function (ctx, w, h) {
      try {
        var L = nightL(w, h), r = rng(70101), s = L.s, i, x, hz = L.hz;
        mark('start', ctx);
        /* ---------- night sky ---------- */
        var SKY = [[0, '#070b26'], [0.3, '#121a4a'], [0.6, '#262a68'], [0.82, '#4a3c80'], [0.94, '#8a5a94'], [1, '#c87a94']];
        ctx.fillStyle = lg(ctx, 0, 0, 0, hz, SKY); ctx.fillRect(0, 0, w, hz + 2);
        skyStrokes(ctx, -20 * s, w + 20 * s, 0, hz, SKY, 260, r, s, 0.12, '#6a5aa8', '#0a1030');
        // a faint milky band
        ctx.save(); ctx.translate(w * 0.4, h * 0.2); ctx.rotate(-0.55); ctx.scale(1, 0.18);
        softGlow(ctx, 0, 0, w * 0.75, '#6a6ab8', 0.22); ctx.restore();
        dots(ctx, 420, [['#ffffff', 0.55], ['#cfd8ff', 0.4]], function () { var u = r(), v = (r() + r() + r()) / 3 - 0.5; var xx = w * 0.4 + Math.cos(-0.55) * (u - 0.5) * w * 1.4 - Math.sin(-0.55) * v * h * 0.12, yy = h * 0.2 + Math.sin(-0.55) * (u - 0.5) * w * 1.4 + Math.cos(-0.55) * v * h * 0.12; if (yy > hz - h * 0.04) return null; return [xx, yy, (0.25 + r() * 0.4) * s, r() < 0.5 ? 0 : 1]; });
        // stars
        dots(ctx, 700, [['#ffffff', 0.9], ['#d8e0ff', 0.7], ['#ffe8c8', 0.7], ['#c8d0ff', 0.45]], function () { var yy = Math.pow(r(), 1.3) * (hz - h * 0.06); return [r() * w, yy, (0.3 + Math.pow(r(), 5) * 1.2) * s, (r() * 4) | 0]; });
        var sp = glowSpr('#dfe6ff', true);
        if (sp) for (i = 0; i < 16; i++) { var gx = r() * w, gy = r() * (hz - h * 0.12), gs = (5 + r() * 8) * s; ctx.globalAlpha = 0.7; ctx.drawImage(sp, gx - gs, gy - gs, gs * 2, gs * 2); }
        ctx.globalAlpha = 1;
        // the moon
        var mx = L.moon[0], my = L.moon[1], mR = L.moonR;
        softGlow(ctx, mx, my, mR * 9, '#8a90d8', 0.3); softGlow(ctx, mx, my, mR * 3.5, '#e8e4ff', 0.35);
        ctx.fillStyle = rg(ctx, mx - mR * 0.3, my - mR * 0.3, mR * 0.1, mR * 1.1, [[0, '#fffaf0'], [0.7, '#f2ecd8'], [1, '#d8d0c0']]); ctx.beginPath(); ctx.arc(mx, my, mR, 0, TAU); ctx.fill();
        dabs(ctx, 14, [['#c8c0b0', 0.45], ['#e0d8c8', 0.5]], function () { var a = r() * TAU, d = Math.sqrt(r()) * mR * 0.7; return [mx + Math.cos(a) * d, my + Math.sin(a) * d, mR * (0.08 + r() * 0.16), mR * (0.06 + r() * 0.12), r() < 0.6 ? 0 : 1, r()]; });
        // moonlit clouds
        var cls = [[0.55, 0.205, 0.4, 0.035], [0.18, 0.25, 0.36, 0.03], [0.92, 0.29, 0.3, 0.025]];
        for (i = 0; i < cls.length; i++) { var vx = mx - w * cls[i][0], vy = my - h * cls[i][1], vl = Math.sqrt(vx * vx + vy * vy) || 1; cloudForm(ctx, w * cls[i][0], h * cls[i][1], w * cls[i][2], h * cls[i][3], r, { lit: '#b8b4e8', mid: '#4a4888', shade: '#262a5c', top: '#6a68a8', al: 0.75, lx: vx / vl, ly: vy / vl, base: 0.6, seam: 0.1 }); }
        // warm city glow on the horizon
        band(ctx, 0, w, hz - h * 0.12, hz + h * 0.02, '#e88a8a', 0.35);
        mark('sky', ctx);
        /* ---------- skyline with lit windows ---------- */
        var E = { s: s, W: w, vpX: w * 0.5, sunX: L.moon[0], haze: '#3a3478', face: '#1e2452', pale: '#2a3060', lit: '#3c4278', shade: '#141838', rim: '#a8b0f0', rimA: 0.35, night: 1,
          glass: ['#262c66', '#1c2254', '#141a40'], win: '#20264e', winLit: '#ffd27a', litP: 0.3, mull: '#0c1030', sheen: '#9aa8ff',
          green: ['#0e2a2a', '#164036', '#2a6a4a', '#5aa86a', '#a8f0b0'] };
        var far = rng(70121);
        for (x = -w * 0.02; x < w * 1.02;) { var bw = (9 + far() * 16) * s, bh = h * (0.03 + far() * 0.07); tower(ctx, { x: x, w: bw, top: hz - bh, base: hz, kind: far() < 0.5 ? 'glass' : 'stone', k: 0.55, seed: (x * 7) | 0, litMul: 0.6 }, E); x += bw * (0.75 + far() * 0.5); }
        // lit cable-stayed bridge (left)
        stayBridge(ctx, { s: s, deck: hz - h * 0.018, water: hz, thick: 2.2 * s, x0: -w * 0.05, x1: w * 0.34, towers: [[w * 0.07, hz - h * 0.1, w * 0.09], [w * 0.24, hz - h * 0.092, w * 0.09]],
          col: '#d8e0ff', shade: '#6070b8', lit: '#ffffff', cable: '#b8ccff', cableA: 0.8, litSide: 1, glowTop: '#7fa8ff' });
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, w * 0.155, hz - h * 0.05, w * 0.22, '#5a7aff', 0.18); ctx.restore();
        for (i = 0; i < L.towers.length; i++) tower(ctx, L.towers[i], E);
        // green-tower garden uplights + beacon
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (i = 0; i < L.towers.length; i++) { var T = L.towers[i]; if (T.kind === 'garden' || T.vgarden) { glow(ctx, T.x + T.w / 2, T.top + (T.base - T.top) * 0.4, T.w * 1.2, '#4ad8a0', 0.12); } if (T.beacon) glow(ctx, T.x + T.w / 2, T.top, T.w * 2, '#5ee6d6', 0.35); }
        ctx.restore();
        // waterfront: low lit buildings + lamp line
        rowhouses(ctx, -2 * s, w + 4 * s, hz - h * 0.002, s, { bricks: ['#3a2a48', '#40304e', '#342640'], lit: '#5a4a70', haze: '#2a2650', roof: '#1a1a34', trim: '#5a5070', win: '#2a2440', winLit: '#ffc870', litP: 0.45 }, r, E);
        dots(ctx, 90, [['#ffe0a0', 0.95], ['#fff4d8', 0.8]], function (k) { return [k / 90 * w + r() * 3 * s, hz + h * 0.001, (0.7 + r() * 0.6) * s, r() < 0.7 ? 0 : 1]; });
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; band(ctx, 0, w, hz - h * 0.02, hz + h * 0.01, '#ffb070', 0.18); ctx.restore();
        mark('skyline', ctx);
        /* ---------- river: reflections, light streaks, moon path ---------- */
        var wy1 = L.rail + h * 0.01;
        ctx.fillStyle = lg(ctx, 0, hz, 0, wy1, [[0, '#2a2860'], [0.5, '#161c46'], [1, '#0c1030']]); ctx.fillRect(0, hz, w, wy1 - hz);
        reflect(ctx, w, hz, wy1, 0.55, 3 * s, 1.0 / s, 5, 1.05);
        ctx.fillStyle = lg(ctx, 0, hz, 0, wy1, [[0, 'rgba(20,20,60,0.15)'], [1, 'rgba(8,10,30,0.5)']]); ctx.fillRect(0, hz, w, wy1 - hz);
        // vertical light streaks under the bright spots
        batch(ctx, 600, [['#ffd27a', 1.2 * s, 0.35], ['#fff0c8', 0.8 * s, 0.4], ['#7fa8ff', 1.2 * s, 0.3]], function () {
          var xx = r() * w, p = Math.pow(r(), 1.5), yy = hz + 2 * s + p * (wy1 - hz) * 0.9, l = (2 + r() * 8) * s, b = xx < w * 0.36 && r() < 0.5 ? 2 : r() < 0.6 ? 0 : 1;
          return [xx, yy, xx + (r() - 0.5) * 2 * s, yy, b];
        });
        batch(ctx, 900, [['#4a4a98', 0.7 * s, 0.4], ['#05081c', 0.8 * s, 0.4]], function () { var p = Math.pow(r(), 1.2), yy = hz + p * (wy1 - hz), xx = r() * w, l = (2 + p * 14) * s; return [xx, yy, xx + l, yy, r() < 0.5 ? 0 : 1]; });
        // moon path
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = lg(ctx, mx - w * 0.1, 0, mx + w * 0.1, 0, [[0, 'rgba(200,200,255,0)'], [0.5, 'rgba(220,220,255,0.18)'], [1, 'rgba(200,200,255,0)']]); ctx.fillRect(mx - w * 0.1, hz, w * 0.2, wy1 - hz);
        ctx.restore();
        batch(ctx, 260, [['#f4f0ff', 0.9 * s, 0.75], ['#c8c8ff', 0.7 * s, 0.5]], function () { var p = r(), yy = hz + 3 * s + p * (wy1 - hz - 4 * s), xx = mx + (r() - 0.5) * w * (0.03 + p * 0.16), l = (2 + p * 9) * s; return [xx - l / 2, yy, xx + l / 2, yy, r() < 0.6 ? 0 : 1]; });
        // a few moored boats with riding lights
        for (i = 0; i < 3; i++) { var bx = w * (0.12 + i * 0.33 + r() * 0.05), by = hz + h * (0.03 + r() * 0.05), bs = (4 + i) * s; boat(ctx, bx, by, bs, '#5a5a90', '#1a1a3a', '#3a3a70'); glow(ctx, bx, by - bs * 1.7, 4 * s, '#ffe0a0', 0.9); }
        // gondola: pylon + cable
        var C = L.pylon;
        ctx.fillStyle = '#2a3060'; ctx.beginPath(); ctx.moveTo(C[0] - 3 * s, hz + h * 0.01); ctx.lineTo(C[0] - 0.8 * s, C[1]); ctx.lineTo(C[0] + 0.8 * s, C[1]); ctx.lineTo(C[0] + 3 * s, hz + h * 0.01); ctx.fill();
        ctx.fillStyle = '#4a5490'; ctx.fillRect(C[0] - 6 * s, C[1] - 0.6 * s, 12 * s, 1.6 * s); glow(ctx, C[0], C[1] - 2 * s, 4 * s, '#ff5a4a', 0.9);
        ctx.strokeStyle = '#6a74b8'; ctx.lineWidth = Math.max(0.8, 0.8 * s); ctx.beginPath();
        for (i = 0; i <= 60; i++) { var cp = L.cable(i / 60); if (!i) ctx.moveTo(cp[0], cp[1]); else ctx.lineTo(cp[0], cp[1]); }
        ctx.stroke();
        // river mist
        for (i = 0; i < 6; i++) wisp(ctx, w * r(), hz + h * (0.01 + r() * 0.05), w * 0.5, h * 0.008, '#8a88c8', 0.12, r);
        mark('river', ctx);
        /* ---------- the balcony ---------- */
        var rl = L.rail, dk = L.deck;
        // deck boards (warm light spilling from the apartment behind us)
        ctx.fillStyle = lg(ctx, 0, rl, 0, h, [[0, '#1a1422'], [0.3, '#2a1e26'], [1, '#3a2628']]); ctx.fillRect(0, rl, w, h - rl);
        var vpx = w * 0.5, vpy = h * 0.42;
        ctx.strokeStyle = 'rgba(8,4,10,0.6)'; ctx.lineWidth = 1.2 * s; ctx.beginPath();
        for (i = -16; i <= 16; i++) { var bx2 = vpx + i * w * 0.09; ctx.moveTo(lerp(vpx, bx2, (rl - vpy) / (h - vpy)), rl); ctx.lineTo(bx2, h); }
        ctx.stroke();
        batch(ctx, 400, [['#5a3a34', 0.7 * s, 0.35], ['#120a10', 0.8 * s, 0.4]], function () { var yy = lerp(rl, h, Math.pow(r(), 0.8)), xx = r() * w, l = (6 + r() * 20) * s * (yy - vpy) / (h - vpy), dx = (xx - vpx) / (yy - vpy); return [xx, yy, xx + dx * l, yy + l, r() < 0.5 ? 0 : 1]; });
        // warm pools: from the apartment behind us, and around the lantern; cool moon sheen near the rail
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = rg(ctx, w * 0.45, h * 1.08, 0, h * 0.36, [[0, 'rgba(255,160,90,0.28)'], [0.6, 'rgba(255,140,80,0.08)'], [1, 'rgba(255,140,80,0)']]); ctx.fillRect(0, rl, w, h - rl);
        ctx.fillStyle = lg(ctx, 0, rl, 0, rl + h * 0.08, [[0, 'rgba(120,130,220,0.18)'], [1, 'rgba(120,130,220,0)']]); ctx.fillRect(0, rl, w, h * 0.08);
        ctx.restore();
        // glass balustrade with a warm-lit handrail
        var gTop = rl - h * 0.07;
        ctx.fillStyle = 'rgba(140,160,220,0.1)'; ctx.fillRect(0, gTop, w, rl - gTop);
        ctx.save(); ctx.beginPath(); ctx.rect(0, gTop, w, rl - gTop); ctx.clip();
        ctx.fillStyle = 'rgba(255,255,255,0.05)'; for (i = 0; i < 5; i++) { var gx2 = w * (0.05 + i * 0.22); ctx.beginPath(); ctx.moveTo(gx2, gTop); ctx.lineTo(gx2 + w * 0.06, gTop); ctx.lineTo(gx2 - w * 0.02, rl); ctx.lineTo(gx2 - w * 0.08, rl); ctx.fill(); }
        ctx.restore();
        for (i = 0; i < 5; i++) { var px = w * (i * 0.25); ctx.fillStyle = '#1a1a2a'; ctx.fillRect(px - 2 * s, gTop - 2 * s, 4 * s, rl - gTop + 6 * s); ctx.fillStyle = 'rgba(255,190,120,0.4)'; ctx.fillRect(px - 2 * s, gTop - 2 * s, 1 * s, rl - gTop + 6 * s); }
        ctx.fillStyle = lg(ctx, 0, gTop - 4 * s, 0, gTop + 2 * s, [[0, '#ffc890'], [0.4, '#7a5a50'], [1, '#2a2030']]); ctx.fillRect(0, gTop - 4 * s, w, 6 * s);
        ctx.fillStyle = '#1a1420'; ctx.fillRect(0, rl, w, 5 * s);
        // pergola beam across the top with two drooping strands of warm string lights
        ctx.fillStyle = lg(ctx, 0, 0, 0, h * 0.04, [[0, '#120c14'], [1, '#2a1a1e']]); ctx.fillRect(0, 0, w, h * 0.035);
        ctx.fillStyle = 'rgba(255,190,120,0.25)'; ctx.fillRect(0, h * 0.035 - 1.5 * s, w, 1.5 * s);
        ctx.strokeStyle = '#1a1418'; ctx.lineWidth = 1 * s; ctx.beginPath();
        for (i = 0; i < L.bulbs.length; i++) { var Bb = L.bulbs[i]; if (i % 10 === 0) ctx.moveTo(Bb[0], Bb[1]); else ctx.lineTo(Bb[0], Bb[1]); }
        ctx.stroke();
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (i = 0; i < L.bulbs.length; i++) glow(ctx, L.bulbs[i][0], L.bulbs[i][1] + 3 * s, 12 * s, '#ffb860', 0.45);
        ctx.restore();
        for (i = 0; i < L.bulbs.length; i++) { ctx.fillStyle = '#fff2c8'; ctx.beginPath(); ctx.ellipse(L.bulbs[i][0], L.bulbs[i][1] + 3 * s, 1.8 * s, 2.6 * s, 0, 0, TAU); ctx.fill(); }
        mark('balcony', ctx);
        // potted plants at the balcony corners (silhouettes with warm rims)
        var npal = ['#06090c', '#0c1418', '#121c1e', '#1a2624', '#ffb070'];
        [[0.06, 0.8, 1], [0.95, 0.83, -1]].forEach(function (Pt, k) {
          var px2 = w * Pt[0], py2 = h * Pt[1], pr = 26 * s;
          var rr = rng(70500 + k);
          for (var q = 0; q < 14; q++) {
            var la = -PI / 2 + (q - 6.5) * 0.17 + (rr() - 0.5) * 0.2, ll = (60 + rr() * 70) * s, lb = [px2 + Math.cos(la) * 8 * s, py2 - pr * 1.1];
            ctx.strokeStyle = '#141c1c'; ctx.lineWidth = 1.6 * s; ctx.beginPath(); ctx.moveTo(lb[0], lb[1]); ctx.quadraticCurveTo(lb[0] + Math.cos(la) * ll * 0.4, lb[1] + Math.sin(la) * ll * 0.5, lb[0] + Math.cos(la) * ll * 0.7, lb[1] + Math.sin(la) * ll * 0.75); ctx.stroke();
            var tx2 = lb[0] + Math.cos(la) * ll * 0.7, ty2 = lb[1] + Math.sin(la) * ll * 0.75;
            ctx.beginPath(); leafPath(ctx, tx2, ty2, ll * 0.42, ll * 0.13, la + (rr() - 0.5) * 0.6, false); ctx.fillStyle = npal[1 + (q % 3)]; ctx.fill();
            ctx.strokeStyle = rgba(q % 2 ? '#ffb070' : '#8a90e0', 0.25 + 0.35 * (Pt[2] * Math.cos(la) < 0 ? 1 : 0)); ctx.lineWidth = 0.9 * s; ctx.stroke();
          }
          ctx.fillStyle = lg(ctx, px2 - pr, 0, px2 + pr, 0, [[0, '#1a1214'], [0.5, '#3a2420'], [1, '#100a0c']]);
          ctx.beginPath(); ctx.moveTo(px2 - pr, py2 - pr * 1.15); ctx.lineTo(px2 + pr, py2 - pr * 1.15); ctx.lineTo(px2 + pr * 0.78, py2); ctx.lineTo(px2 - pr * 0.78, py2); ctx.fill();
          ctx.fillStyle = 'rgba(255,170,100,0.35)'; ctx.fillRect(px2 - pr, py2 - pr * 1.15, pr * 2, 1.5 * s);
        });
        // little lantern on the deck
        var lx = w * 0.8, ly = h * 0.9;
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, lx, ly - 14 * s, 60 * s, '#ffa860', 0.4); ctx.restore();
        ctx.fillStyle = '#1a1414'; ctx.fillRect(lx - 9 * s, ly - 26 * s, 18 * s, 3 * s); ctx.fillRect(lx - 8 * s, ly - 2 * s, 16 * s, 3 * s);
        ctx.fillStyle = 'rgba(255,214,150,0.9)'; ctx.fillRect(lx - 7 * s, ly - 23 * s, 14 * s, 21 * s);
        ctx.strokeStyle = '#1a1414'; ctx.lineWidth = 1.2 * s; ctx.strokeRect(lx - 7 * s, ly - 23 * s, 14 * s, 21 * s); ctx.beginPath(); ctx.moveTo(lx, ly - 23 * s); ctx.lineTo(lx, ly - 2 * s); ctx.stroke();
        ctx.beginPath(); ctx.arc(lx, ly - 30 * s, 4 * s, PI, TAU); ctx.stroke();
        finish(ctx, w, h, '#4a3a90', 0.12, 0.35, 0.05, '#05060f', 0.4);
        mark('finish', ctx);
      } catch (e) { PAINT._err = 'night: ' + String(e && e.stack || e); }
    },
    overlay: function (ctx, w, h, t) {
      try {
        var L = nightL(w, h), s = L.s, i, hz = L.hz, sp = glowSpr('#ffffff', true), spR = glowSpr('#ff5a4a', true), spW = glowSpr('#ffcf80');
        ctx.save();
        // twinkling stars
        if (sp) for (i = 0; i < 30; i++) {
          var sx = hash(i, 11) * w, sy = Math.pow(hash(i, 12), 1.3) * (hz - h * 0.1), tw = Math.pow(Math.max(0, Math.sin(t * (0.7 + hash(i, 13) * 1.6) + i * 2.3)), 4);
          if (tw < 0.05) continue; var ss = (3 + hash(i, 14) * 5) * s * tw; ctx.globalAlpha = tw; ctx.drawImage(sp, sx - ss, sy - ss, ss * 2, ss * 2);
        }
        // an occasional shooting star
        var sper = 17, sph = (t % sper) / sper;
        if (sph < 0.06) { var q = sph / 0.06, x0 = w * 0.15 + Math.floor(t / sper) % 3 * w * 0.2, y0 = h * 0.05; ctx.globalAlpha = Math.sin(q * PI); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.4 * s; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x0 + q * w * 0.3, y0 + q * h * 0.08); ctx.lineTo(x0 + q * w * 0.3 - w * 0.08, y0 + q * h * 0.08 - h * 0.022); ctx.stroke(); }
        // aviation lights blink in a slow rhythm
        if (spR) for (i = 0; i < L.blinks.length; i++) { var Bk = L.blinks[i], on = Math.pow(Math.max(0, Math.sin(t * 1.6 + i * 1.1)), 6); ctx.globalAlpha = 0.25 + on * 0.75; var bs = (3 + on * 4) * s; ctx.drawImage(spR, Bk[0] - bs, Bk[1] - bs, bs * 2, bs * 2); }
        // windows switching on and off
        ctx.fillStyle = '#ffd27a';
        for (i = 0; i < L.flick.length; i++) { var F = L.flick[i], v = Math.sin(t * 0.25 + F[2] * 20); if (v < 0.3) continue; ctx.globalAlpha = Math.min(1, (v - 0.3) * 3) * 0.9; ctx.fillRect(F[0], F[1], 1.6 * s, 1.3 * s); }
        // beacon on the teal tower pulses
        for (i = 0; i < L.towers.length; i++) if (L.towers[i].beacon) { var T = L.towers[i], sb = glowSpr('#5ee6d6'); if (sb) { var pb = 0.5 + 0.5 * Math.sin(t * 0.9); ctx.globalAlpha = 0.3 + pb * 0.5; var bz = T.w * (1.2 + pb); ctx.drawImage(sb, T.x + T.w / 2 - bz, T.top - bz, bz * 2, bz * 2); } }
        // gondola cabins with warm windows
        ctx.globalAlpha = 1;
        for (i = 0; i < 3; i++) { var u = ((t * 0.01 + i / 3) % 1), P = L.cable(u); drawCabin(ctx, P[0], P[1], 3.2 * s, '#3a3a6a', '#ffd890', '#6a74b8', '#ffb860'); }
        // drones with nav lights
        for (i = 0; i < 3; i++) {
          var dph = t * (0.035 + i * 0.02) + i * 2.2, dx = w * (0.5 + Math.sin(dph) * 0.4), dy = h * (0.2 + i * 0.06) + Math.sin(dph * 1.7) * h * 0.015, bl = Math.sin(t * 4 + i * 1.7) > 0.4;
          ctx.globalAlpha = 0.8; ctx.fillStyle = '#2a2e58'; ctx.fillRect(dx - 4 * s, dy - 0.8 * s, 8 * s, 1.6 * s);
          var sd = glowSpr(i % 2 ? '#7ff7e4' : '#ff5a4a', true); if (sd) { ctx.globalAlpha = bl ? 0.95 : 0.25; ctx.drawImage(sd, dx - 5 * s, dy - 5 * s, 10 * s, 10 * s); }
        }
        // moon path shimmer
        ctx.globalAlpha = 1; ctx.strokeStyle = '#f4f0ff'; ctx.lineWidth = 0.9 * s;
        for (i = 0; i < 16; i++) { var p2 = hash(i, 21), yy = hz + 4 * s + p2 * (L.rail - hz - 8 * s), xx = L.moon[0] + (hash(i, 22) - 0.5) * w * (0.03 + p2 * 0.16), a2 = Math.max(0, Math.sin(t * (1.2 + hash(i, 23) * 2) + i * 3)); if (a2 < 0.1) continue; var l2 = (3 + p2 * 10) * s; ctx.globalAlpha = a2 * 0.8; ctx.beginPath(); ctx.moveTo(xx - l2 / 2, yy); ctx.lineTo(xx + l2 / 2, yy); ctx.stroke(); }
        // string lights breathe
        if (spW) for (i = 0; i < L.bulbs.length; i++) { var bb = 0.6 + 0.4 * Math.sin(t * (0.8 + hash(i, 41)) + i * 1.3); ctx.globalAlpha = bb * 0.55; var bz2 = 9 * s * (0.8 + bb * 0.4); ctx.drawImage(spW, L.bulbs[i][0] - bz2, L.bulbs[i][1] + 3 * s - bz2, bz2 * 2, bz2 * 2); }
        // lantern flicker
        var fl2 = 0.75 + 0.15 * Math.sin(t * 9) + 0.1 * Math.sin(t * 13.7);
        if (spW) { ctx.globalAlpha = fl2 * 0.5; ctx.drawImage(spW, w * 0.8 - 30 * s, h * 0.9 - 44 * s, 60 * s, 60 * s); }
        // drifting river mist
        var ws = wispSpr('#a8a8e8');
        if (ws) for (i = 0; i < 2; i++) { var mw = w * (0.8 + i * 0.3), mxp = ((t * (4 + i * 3) * s + i * w * 0.5) % (w + mw)) - mw; ctx.globalAlpha = 0.18; ctx.drawImage(ws, mxp, hz + h * (0.01 + i * 0.04), mw, mw * 0.2); }
        ctx.restore();
      } catch (e) { PAINT._err = 'night overlay: ' + String(e && e.stack || e); }
    }
  };

  /* ============================== TABLE: the Future Table, a holographic room ============================== */
  var tableL = memo(function (w, h) {
    var s = S(w, h), L = { s: s, hz: h * 0.52, vpx: w * 0.5, tc: [w * 0.5, h * 0.6], trx: w * 0.36, try_: h * 0.045, glow: [w * 0.5, h * 0.42] };
    // branching paths of possible futures rising from the table (shared with overlay for node twinkles)
    var r = rng(80111), segs = [], nodes = [];
    function grow(x, y, ang, len, depth) {
      var x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len, mx = (x + x2) / 2 + (r() - 0.5) * len * 0.3, my = (y + y2) / 2;
      segs.push([x, y, mx, my, x2, y2, depth]);
      if (depth >= 3) { nodes.push([x2, y2, depth]); return; }
      var n = depth === 0 ? 3 : 2;
      for (var i = 0; i < n; i++) grow(x2, y2, ang + (i - (n - 1) / 2) * (0.55 - depth * 0.08) + (r() - 0.5) * 0.2, len * (0.72 + r() * 0.1), depth + 1);
      if (depth > 0) nodes.push([x2, y2, depth]);
    }
    grow(L.tc[0], L.tc[1] - h * 0.02, -PI / 2, h * 0.075, 0);
    L.segs = segs; L.nodes = nodes;
    return L;
  });
  PAINT.table = {
    focus: { x: 0.5, y: 0.42 },
    paint: function (ctx, w, h) {
      try {
        var L = tableL(w, h), r = rng(80101), s = L.s, i, x, y, hz = L.hz, vpx = L.vpx;
        mark('start', ctx);
        // deep navy room
        ctx.fillStyle = lg(ctx, 0, 0, 0, h, [[0, '#070b22'], [0.35, '#0f1638'], [0.52, '#18225a'], [0.7, '#0e1640'], [1, '#070b22']]); ctx.fillRect(0, 0, w, h);
        softGlow(ctx, L.glow[0], L.glow[1], w * 0.95, '#2a3c96', 0.45);
        // curved wall: vertical light ribs, denser toward the edges (a round room)
        ctx.save();
        for (i = -10; i <= 10; i++) {
          var u = i / 10, xr = vpx + Math.sin(u * PI * 0.48) * w * 0.62, al = 0.06 + 0.08 * (1 - Math.abs(u));
          ctx.fillStyle = lg(ctx, 0, 0, 0, hz, [[0, rgba('#6a7cff', 0)], [0.5, rgba('#6a7cff', al)], [1, rgba('#5ee6d6', al * 1.4)]]);
          ctx.fillRect(xr - 0.6 * s, h * 0.06, 1.2 * s, hz - h * 0.06);
        }
        // wall panel bands
        [0.18, 0.33].forEach(function (yy) { ctx.fillStyle = lg(ctx, 0, 0, w, 0, [[0, 'rgba(94,230,214,0)'], [0.5, 'rgba(94,230,214,0.1)'], [1, 'rgba(94,230,214,0)']]); ctx.fillRect(0, h * yy, w, 1 * s); });
        ctx.restore();
        // ceiling light ring
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = 'rgba(127,247,228,0.35)'; ctx.lineWidth = 2.5 * s; ctx.beginPath(); ctx.ellipse(vpx, h * 0.035, w * 0.55, h * 0.03, 0, 0, TAU); ctx.stroke();
        ctx.strokeStyle = 'rgba(127,247,228,0.12)'; ctx.lineWidth = 8 * s; ctx.stroke();
        ctx.restore();
        mark('room', ctx);
        // perspective grid floor
        ctx.save(); ctx.beginPath(); ctx.rect(0, hz, w, h - hz); ctx.clip();
        ctx.fillStyle = lg(ctx, 0, hz, 0, h, [[0, '#121c50'], [0.4, '#0c143c'], [1, '#060a20']]); ctx.fillRect(0, hz, w, h - hz);
        ctx.globalCompositeOperation = 'lighter';
        var gl = [], yk = hz + h * 0.004, d = h * 0.008;
        while (yk < h) { gl.push(yk); yk += d; d *= 1.22; }
        for (i = 0; i < gl.length; i++) { var p = (gl[i] - hz) / (h - hz), a2 = 0.5 * Math.pow(1 - p, 0.6) * smooth(0, 0.08, p); ctx.fillStyle = rgba('#5ee6d6', a2); ctx.fillRect(0, gl[i], w, Math.max(0.6, (0.5 + p) * s)); }
        ctx.lineWidth = 0.9 * s;
        for (i = -24; i <= 24; i++) {
          var bx = vpx + i * w * 0.09; ctx.strokeStyle = lg(ctx, 0, hz, 0, h, [[0, 'rgba(94,230,214,0)'], [0.15, 'rgba(94,230,214,0.4)'], [1, 'rgba(94,230,214,0.12)']]);
          ctx.beginPath(); ctx.moveTo(vpx + (bx - vpx) * 0.02, hz); ctx.lineTo(bx, h); ctx.stroke();
        }
        // horizon glow
        band(ctx, 0, w, hz - h * 0.03, hz + h * 0.05, '#5ee6d6', 0.18);
        ctx.restore();
        mark('grid', ctx);
        // the round holo-table
        var tx = L.tc[0], ty = L.tc[1], rx = L.trx, ry = L.try_;
        ctx.fillStyle = 'rgba(2,4,14,0.6)'; ctx.beginPath(); ctx.ellipse(tx, ty + ry * 2.4, rx * 0.8, ry * 0.9, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = lg(ctx, 0, ty, 0, ty + ry * 2.6, [[0, '#1a2458'], [1, '#080c24']]);
        ctx.beginPath(); ctx.moveTo(tx - rx * 0.55, ty + ry * 0.5); ctx.lineTo(tx - rx * 0.3, ty + ry * 2.6); ctx.lineTo(tx + rx * 0.3, ty + ry * 2.6); ctx.lineTo(tx + rx * 0.55, ty + ry * 0.5); ctx.fill();
        ctx.fillStyle = lg(ctx, 0, ty - ry, 0, ty + ry, [[0, '#24306e'], [1, '#141c4a']]); ctx.beginPath(); ctx.ellipse(tx, ty + ry * 0.25, rx, ry, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = lg(ctx, 0, ty - ry, 0, ty + ry, [[0, '#1e2a64'], [1, '#2c3c86']]); ctx.beginPath(); ctx.ellipse(tx, ty, rx, ry, 0, 0, TAU); ctx.fill();
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        [[1, 0.9, 2], [0.78, 0.45, 1.2], [0.55, 0.35, 1], [0.3, 0.5, 1.2]].forEach(function (Q) { ctx.strokeStyle = rgba('#7ff7e4', Q[1]); ctx.lineWidth = Q[2] * s; ctx.beginPath(); ctx.ellipse(tx, ty, rx * Q[0], ry * Q[0], 0, 0, TAU); ctx.stroke(); });
        ctx.strokeStyle = 'rgba(127,247,228,0.25)'; ctx.lineWidth = 0.8 * s; ctx.beginPath();
        for (i = 0; i < 24; i++) { var an = i / 24 * TAU; ctx.moveTo(tx + Math.cos(an) * rx * 0.55, ty + Math.sin(an) * ry * 0.55); ctx.lineTo(tx + Math.cos(an) * rx * 0.78, ty + Math.sin(an) * ry * 0.78); }
        ctx.stroke();
        // the soft holo-glow column and the big glow ellipse above the table
        ctx.fillStyle = lg(ctx, 0, ty, 0, h * 0.18, [[0, 'rgba(94,230,214,0.22)'], [0.6, 'rgba(94,230,214,0.06)'], [1, 'rgba(94,230,214,0)']]);
        ctx.beginPath(); ctx.moveTo(tx - rx * 0.95, ty); ctx.lineTo(tx - rx * 1.25, h * 0.18); ctx.lineTo(tx + rx * 1.25, h * 0.18); ctx.lineTo(tx + rx * 0.95, ty); ctx.closePath(); ctx.fill();
        ctx.save(); ctx.translate(L.glow[0], L.glow[1]); ctx.scale(1, 0.62); softGlow(ctx, 0, 0, w * 0.5, '#5ee6d6', 0.16); softGlow(ctx, 0, 0, w * 0.3, '#9ab4ff', 0.12); ctx.restore();
        // branching futures
        var cols = ['#c8fff6', '#7ff7e4', '#9ab4ff', '#c8a8ff'];
        for (var dpt = 0; dpt < 4; dpt++) {
          ctx.strokeStyle = rgba(cols[dpt], 0.55 - dpt * 0.08); ctx.lineWidth = (2.2 - dpt * 0.4) * s; ctx.lineCap = 'round'; ctx.beginPath();
          for (i = 0; i < L.segs.length; i++) { var G = L.segs[i]; if (G[6] !== dpt) continue; ctx.moveTo(G[0], G[1]); ctx.quadraticCurveTo(G[2], G[3], G[4], G[5]); }
          ctx.stroke();
          ctx.strokeStyle = rgba(cols[dpt], 0.12); ctx.lineWidth = (7 - dpt) * s; ctx.stroke();
        }
        for (i = 0; i < L.nodes.length; i++) { var N = L.nodes[i]; glow(ctx, N[0], N[1], (N[2] === 3 ? 10 : 6) * s, N[2] === 3 ? '#c8a8ff' : '#7ff7e4', 0.8); }
        ctx.restore();
        for (i = 0; i < L.nodes.length; i++) { var N2 = L.nodes[i]; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(N2[0], N2[1], (N2[2] === 3 ? 2.2 : 1.5) * s, 0, TAU); ctx.fill(); }
        mark('table', ctx);
        // faint data arcs (HUD rings) around the glow
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'butt';
        [[0.42, 0.25, 0.2, 2.4, '#5ee6d6'], [0.47, 0.18, 1.9, 4.2, '#9ab4ff'], [0.36, 0.15, 3.5, 5.6, '#7ff7e4']].forEach(function (A2) {
          ctx.strokeStyle = rgba(A2[4], A2[1]); ctx.lineWidth = 1.2 * s; ctx.setLineDash([6 * s, 4 * s]);
          ctx.beginPath(); ctx.ellipse(L.glow[0], L.glow[1], w * A2[0], w * A2[0] * 0.95, 0, A2[2], A2[3]); ctx.stroke();
          ctx.setLineDash([]); ctx.lineWidth = 3 * s; ctx.strokeStyle = rgba(A2[4], A2[1] * 0.4);
          ctx.beginPath(); ctx.ellipse(L.glow[0], L.glow[1], w * A2[0], w * A2[0] * 0.95, 0, A2[2], A2[2] + 0.3); ctx.stroke();
        });
        ctx.restore();
        // floating dust of light
        dots(ctx, 260, [['#7ff7e4', 0.5], ['#9ab4ff', 0.4], ['#ffffff', 0.5]], function () { var yy = r() * h * 0.9, xx = r() * w, near = 1 - Math.min(1, Math.hypot(xx - L.glow[0], (yy - L.glow[1]) * 0.8) / (w * 0.7)); if (r() > 0.25 + near) return null; return [xx, yy, (0.4 + r() * 1.1) * s, (r() * 3) | 0]; });
        // keep the lower area calm and dark for text cards
        ctx.fillStyle = lg(ctx, 0, h * 0.72, 0, h, [[0, 'rgba(6,8,24,0)'], [1, 'rgba(6,8,24,0.45)']]); ctx.fillRect(0, h * 0.72, w, h * 0.28);
        finish(ctx, w, h, '#3a4aa8', 0.1, 0.4, 0.04, '#02030c', 0.42);
        mark('finish', ctx);
      } catch (e) { PAINT._err = 'table: ' + String(e && e.stack || e); }
    },
    overlay: function (ctx, w, h, t) {
      try {
        var L = tableL(w, h), s = L.s, i, sp = glowSpr('#7ff7e4', true), sp2 = glowSpr('#c8a8ff', true), sg = glowSpr('#5ee6d6');
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        // breathing holo glow
        if (sg) { var pb = 0.5 + 0.5 * Math.sin(t * 0.8); ctx.globalAlpha = 0.12 + pb * 0.1; ctx.drawImage(sg, L.glow[0] - w * 0.45, L.glow[1] - w * 0.3, w * 0.9, w * 0.6); }
        // scan line sweeping down the grid
        var ph = (t * 0.12) % 1, sy = L.hz + Math.pow(ph, 1.8) * (h - L.hz);
        ctx.globalAlpha = 0.35 * Math.sin(ph * PI); ctx.fillStyle = lg(ctx, 0, sy - 6 * s, 0, sy + 6 * s, [[0, 'rgba(127,247,228,0)'], [0.5, 'rgba(127,247,228,0.8)'], [1, 'rgba(127,247,228,0)']]); ctx.fillRect(0, sy - 6 * s, w, 12 * s);
        // slowly turning data arcs
        ctx.globalAlpha = 1; ctx.lineWidth = 1.4 * s;
        for (i = 0; i < 3; i++) {
          var rr = w * [0.3, 0.39, 0.45][i], a0 = t * [0.15, -0.1, 0.07][i] + i * 2;
          ctx.strokeStyle = rgba(['#7ff7e4', '#9ab4ff', '#c8a8ff'][i], 0.3);
          ctx.beginPath(); ctx.ellipse(L.glow[0], L.glow[1], rr, rr * 0.95, 0, a0, a0 + 0.9); ctx.stroke();
          ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(L.glow[0] + Math.cos(a0 + 0.9) * rr, L.glow[1] + Math.sin(a0 + 0.9) * rr * 0.95, 1.6 * s, 0, TAU); ctx.fill();
        }
        // future nodes twinkle
        if (sp2) for (i = 0; i < L.nodes.length; i++) { var N = L.nodes[i], tw = 0.5 + 0.5 * Math.sin(t * 1.3 + i * 1.9); ctx.globalAlpha = 0.3 + tw * 0.5; var ns = (N[2] === 3 ? 9 : 6) * s * (0.8 + tw * 0.4); ctx.drawImage(N[2] === 3 ? sp2 : sp, N[0] - ns, N[1] - ns, ns * 2, ns * 2); }
        // particles rising from the table
        if (sp) for (i = 0; i < 34; i++) {
          var a = hash(i, 61), b = hash(i, 62), c = hash(i, 63), per = 6 + c * 6, q = ((t + a * per) % per) / per;
          var px = L.tc[0] + (a - 0.5) * L.trx * 2.2 + Math.sin(t * 0.7 + i) * 8 * s, py = L.tc[1] - q * h * (0.35 + b * 0.25), ps = (1.5 + b * 3) * s;
          ctx.globalAlpha = Math.sin(q * PI) * (0.4 + c * 0.5); ctx.drawImage(i % 3 ? sp : sp2, px - ps, py - ps, ps * 2, ps * 2);
        }
        ctx.restore();
      } catch (e) { PAINT._err = 'table overlay: ' + String(e && e.stack || e); }
    }
  };

  /* ============================== WORKBENCH: a calm, softly blurred office ============================== */
  var wbCache = { key: null, cv: null };
  PAINT.workbench = {
    focus: { x: 0.78, y: 0.16 },
    paint: function (ctx, w, h) {
      try {
        var s = S(w, h), r = rng(90101), i;
        mark('start', ctx);
        // paint the room at 1/6 resolution, then upscale in two steps: a real, cheap depth-of-field blur
        var q = 8, lw = Math.ceil(w / q), lh = Math.ceil(h / q), cv = mk(lw, lh); if (!cv) return;
        var g = cv.getContext('2d'), ls = s / q;
        g.fillStyle = lg(g, 0, 0, 0, lh, [[0, '#e9e8fb'], [0.5, '#dfe1f8'], [1, '#d4d8f2']]); g.fillRect(0, 0, lw, lh);
        // window (upper right) with a soft city beyond
        var wx0 = lw * 0.52, wx1 = lw * 1.02, wy0 = lh * 0.04, wy1 = lh * 0.36;
        g.fillStyle = lg(g, 0, wy0, 0, wy1, [[0, '#bcd8f4'], [0.6, '#e2eefa'], [1, '#f6efe4']]); g.fillRect(wx0, wy0, wx1 - wx0, wy1 - wy0);
        var cr = rng(90111);
        for (var x = wx0; x < wx1;) { var bw = (6 + cr() * 10) * ls, bh = lh * (0.04 + cr() * 0.1); g.fillStyle = cr() < 0.3 ? '#9fc6b8' : '#b4c2de'; g.fillRect(x, wy1 - bh, bw, bh); x += bw * (0.9 + cr() * 0.3); }
        g.fillStyle = '#f4f2fa'; g.fillRect(wx0 - 3 * ls, wy0 - 3 * ls, wx1 - wx0 + 6 * ls, 4 * ls); g.fillRect(wx0 - 3 * ls, wy1, wx1 - wx0 + 6 * ls, 6 * ls); g.fillRect(wx0 - 3 * ls, wy0, 4 * ls, wy1 - wy0); g.fillRect(lerp(wx0, wx1, 0.5), wy0, 3 * ls, wy1 - wy0);
        // light from the window and a warm lamp (upper left)
        softGlow(g, lw * 0.8, lh * 0.2, lw * 0.8, '#ffffff', 0.5);
        softGlow(g, lw * 0.12, lh * 0.08, lw * 0.55, '#fff0c8', 0.55);
        // shelf with books and a plant on the left wall
        var sy0 = lh * 0.3; g.fillStyle = '#c4b8e0'; g.fillRect(-2, sy0, lw * 0.38, 3 * ls);
        var bx = lw * 0.02; ['#8a7ae8', '#5fc6b8', '#f29a8a', '#f5c45a', '#a89af0', '#7ab8e8'].forEach(function (c, k) { var bw2 = (5 + cr() * 4) * ls, bh2 = (18 + cr() * 10) * ls; g.fillStyle = c; g.fillRect(bx, sy0 - bh2, bw2, bh2); bx += bw2 + ls; });
        // big soft plants: monstera on the left, trailing plant top-right
        function leafy(cx, cy, n, R, cols, seed, spread, dir) {
          var lr = rng(seed);
          for (var k = 0; k < n; k++) { var a = dir + (lr() - 0.5) * spread, L2 = R * (0.6 + lr() * 0.6), lx = cx + Math.cos(a) * L2 * 0.6, ly = cy + Math.sin(a) * L2 * 0.6; g.fillStyle = cols[k % cols.length]; g.beginPath(); leafPath(g, lx, ly, L2 * 0.7, L2 * 0.32, a + (lr() - 0.5) * 0.5, true); g.fill(); }
        }
        g.fillStyle = '#b8a6d8'; g.fillRect(lw * 0.04, lh * 0.74, lw * 0.16, lh * 0.12);
        leafy(lw * 0.12, lh * 0.74, 14, lw * 0.3, ['#5aa278', '#78bc8a', '#3f8a64', '#9ad0a0'], 90201, 2.6, -PI / 2);
        leafy(lw * 0.96, lh * 0.04, 12, lw * 0.22, ['#6ab488', '#8ccc9c', '#4f9a70'], 90202, 1.6, PI * 0.6);
        // desk edge at the bottom
        g.fillStyle = lg(g, 0, lh * 0.86, 0, lh, [[0, '#f2eefa'], [1, '#d8d2ee']]); g.fillRect(0, lh * 0.87, lw, lh * 0.13);
        g.fillStyle = '#c8bfe6'; g.fillRect(0, lh * 0.865, lw, 2 * ls);
        // soft bokeh lights inside the blurred layer
        for (i = 0; i < 18; i++) softGlow(g, r() * lw, r() * lh * 0.8, (8 + r() * 20) * ls, ['#ffffff', '#ffe6b8', '#c8c0ff', '#b8f0e8'][i % 4], 0.22);
        // soften toward lavender (low contrast behind documents), blur, then upscale in 2x steps
        g.fillStyle = 'rgba(226,224,248,0.28)'; g.fillRect(0, 0, lw, lh);
        upscale(ctx, boxBlur(cv, 1, 2), w, h);
        mark('blur', ctx);
        // crisp-edged but gentle bokeh discs in the foreground
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (i = 0; i < 10; i++) {
          var bxx = r() * w, byy = r() * h * 0.85, br = (10 + r() * 30) * s, bc = ['#ffffff', '#ffe8c0', '#d0c8ff', '#c0f4ec'][i % 4];
          ctx.fillStyle = rg(ctx, bxx, byy, 0, br, [[0, rgba(bc, 0.05)], [0.75, rgba(bc, 0.06)], [1, rgba(bc, 0)]]); ctx.beginPath(); ctx.arc(bxx, byy, br, 0, TAU); ctx.fill();
        }
        ctx.restore();
        // faint grid paper texture, very low contrast
        ctx.fillStyle = 'rgba(150,140,210,0.07)';
        ctx.beginPath(); for (i = 0; i < h; i += 34 * s) ctx.rect(0, i, w, Math.max(1, 0.8 * s)); for (i = 0; i < w; i += 34 * s) ctx.rect(i, 0, Math.max(1, 0.8 * s), h); ctx.fill();
        finish(ctx, w, h, '#f0e8ff', 0.1, 0.08, 0.03, '#5a5090', 0.45);
        mark('finish', ctx);
      } catch (e) { PAINT._err = 'workbench: ' + String(e && e.stack || e); }
    },
    overlay: function (ctx, w, h, t) {
      try {
        var s = S(w, h), i, sp = glowSpr('#ffffff');
        if (!sp) return;
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (i = 0; i < 12; i++) {
          var a = hash(i, 71), b = hash(i, 72), c = hash(i, 73);
          var x = (a * w + Math.sin(t * (0.05 + c * 0.05) + i) * 30 * s + w) % w, y = (b * h * 0.9 + Math.cos(t * (0.04 + a * 0.04) + i * 2) * 24 * s);
          var r0 = (14 + c * 30) * s; ctx.globalAlpha = 0.06 + 0.05 * Math.sin(t * 0.4 + i * 2);
          ctx.drawImage(sp, x - r0, y - r0, r0 * 2, r0 * 2);
        }
        for (i = 0; i < 14; i++) {
          var a2 = hash(i, 81), b2 = hash(i, 82), per = 14 + hash(i, 83) * 10, q = ((t + a2 * per) % per) / per;
          var mx = a2 * w + Math.sin(t * 0.3 + i) * 12 * s, my = h * (0.9 - q * 0.8) + b2 * h * 0.05, ms = (1.5 + b2 * 2) * s;
          ctx.globalAlpha = Math.sin(q * PI) * 0.35; ctx.drawImage(sp, mx - ms, my - ms, ms * 2, ms * 2);
        }
        ctx.restore();
      } catch (e) { PAINT._err = 'workbench overlay: ' + String(e && e.stack || e); }
    }
  };

  /* placeholders until painted */
  ['street', 'hospital', 'night', 'table', 'workbench'].forEach(function (k) {
    if (!PAINT[k]) PAINT[k] = { focus: { x: 0.5, y: 0.3 }, paint: function (ctx, w, h) { ctx.fillStyle = '#888'; ctx.fillRect(0, 0, w, h); }, overlay: function () {} };
  });
})();
