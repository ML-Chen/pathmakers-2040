/* _china_kit.js - painting utilities shared by the China travel scenes (shanghai.js, beijing.js, shenzhen.js).
   Copied unchanged from src/scenes/vienna_kit.js (itself copied from the top of src/paint_boston.js: seeded noise,
   gradients, glows, clouds, batched strokes and dots, foliage clumps, broadleaf trees, water reflections, the film
   finish), so these scenes paint with the same hand. Exposed as window.CHINA_KIT; it paints nothing by itself.
   The leading underscore makes the build load it before beijing.js (files load in alphabetical order). */
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
  /* sunrise stratocumulus: horizontal brush dabs in an envelope, shade body, sun-lit undersides, bright rims.
     o: {shade, mid, lit, rim, al, n, dir (+1 lit from below)} */
  function streakCloud(ctx, cx, cy, W, H, r, o) {
    var n = o.n || 46, D = [], i, k, q = 0.5, pad = H * 1.2, bw = W * 1.2 + pad * 2, bh = H * 2 + pad * 2, ox = bw / 2, oy = bh / 2;
    for (i = 0; i < n; i++) {
      var u = (r() * 2 - 1), env = Math.pow(Math.max(0, 1 - u * u), 0.6) * (0.75 + 0.25 * fbm(u * 3 + cx * 0.01, 77, 3));
      var rx = W * (0.07 + r() * 0.13) * (0.5 + env * 0.6), ry = H * (0.16 + r() * 0.22) * (0.35 + env * 0.75);
      var dy = (r() - 0.5) * H * env * 0.9 - env * H * 0.15;
      D.push([u * W * 0.5, dy, rx, ry, (dy / (H * 0.5 * Math.max(0.2, env)) + 1) / 2]); // last: 0 top .. 1 bottom within the envelope
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

  window.CHINA_KIT = {PI: PI, TAU: TAU, rng: rng, hash: hash, vnoise: vnoise, fbm: fbm, h2: h2, vn2: vn2, fbm2: fbm2, clamp: clamp, lerp: lerp, smooth: smooth, hex: hex, h2s: h2s, mix: mix, rgba: rgba, lg: lg, rg: rg, mk: mk, S: S, memo: memo, pick: pick, mark: mark, ridge: ridge, poly: poly, rrect: rrect, glow: glow, softGlow: softGlow, puff: puff, wisp: wisp, haze: haze, band: band, finish: finish, shafts: shafts, batch: batch, qcirc: qcirc, qell: qell, dots: dots, dabs: dabs, rects: rects, grassField: grassField, reflect: reflect, glowSpr: glowSpr, wispSpr: wispSpr, bez: bez, boxBlur: boxBlur, upscale: upscale, cloudForm: cloudForm, streakCloud: streakCloud, gradAt: gradAt, skyStrokes: skyStrokes, lens: lens, clump: clump, trunkPath: trunkPath, broadleaf: broadleaf, leafPath: leafPath, boat: boat, drawDrone: drawDrone, drawCabin: drawCabin, drawBird: drawBird};
})();
