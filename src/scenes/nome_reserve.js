/* scenes/nome_reserve.js - painted backgrounds for Nome, Alaska (the Wild Reserve).
   Defines PAINT.nome_reserve (morning on the mammoth reserve) and PAINT.nome_dusk (the same view at a strange white
   sunset), plus PAINT._nomeU, the painting utilities that src/scenes/nome_barn.js reuses.
   The utilities below (rng/hash/fbm, ridge, glow, haze, batch, dots, dabs, clouds, foliage, finish) are copied from
   the header of src/paint_boston.js, as docs/MISSIONS.md suggests, so this file paints on its own. */
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

  /* ============================== NOME: the mammoth reserve on the tundra ============================== */
  /* Looking north from the reserve outside Nome, late September: the Kigluaik Mountains with their first snow
     ("termination dust"), Anvil Mountain's four old White Alice antennas on the left, wind turbines on a ridge, fall
     tundra (red bearberry, gold willow and dwarf birch, white cottongrass), Warming Barn 2 on pilings over the
     permafrost, the mammoth herd grazing far off, and the east ridge on the right with the new "weather station".
     Variant 'dusk': the same view at sunset under a strange white haze (Sky Veil), with balloons rising off the ridge. */
  var nomeL = function (w, h) {
    var s = S(w, h), L = { s: s, hz: h * 0.405, plain: h * 0.47, fg: h * 0.6 };
    // the east ridge: a long hill on the right whose crest peaks near x 0.82
    L.ridgeY = function (x) { var u = x / w; return h * (0.452 - 0.07 * Math.exp(-Math.pow((u - 0.83) / 0.16, 2)) - 0.012 * fbm(u * 6, 911, 3)); };
    L.rig = [w * 0.80, L.ridgeY(w * 0.80)];
    L.anvil = [w * 0.15, h * 0.392];
    L.turb = [[w * 0.33, h * 0.418], [w * 0.385, h * 0.414], [w * 0.44, h * 0.42]];
    L.barn = { x: w * 0.04, y: h * 0.535, w: Math.min(w * 0.3, 190 * s), h: h * 0.05 };
    var r = rng(4040); L.herd = [];
    for (var i = 0; i < 6; i++) L.herd.push([w * (0.42 + i * 0.05 + (r() - 0.5) * 0.03), h * (0.505 + r() * 0.012), (5.5 + r() * 2.5) * s, r() < 0.5 ? 1 : -1, i === 2 ? 0.55 : 1]);
    return L;
  };
  var NOMEPAL = {
    day: { sky: [[0, '#5d8ccf'], [0.45, '#8db4e6'], [0.8, '#c9def0'], [1, '#f1e9da']], warm: '#ffe2bc', cool: '#5a7ad0',
      sun: [0.9, 0.12], sunCol: '#fff3d6', sunA: 0.55, cloud: { lit: '#ffffff', mid: '#dfe8f6', shade: '#b4c3dc', top: '#cfe0f6' },
      mtn: '#7d8fb8', mtnSh: '#5c6c98', snow: '#f4f7ff', snowSh: '#c3cde6', haze: '#c9d6ea', hill: '#8f9a6e', hillSh: '#6f7856', ridge: '#8a8458', ridgeSh: '#6a6644',
      tundra: ['#a8823e', '#b9632f', '#8f8a46', '#c48f3a', '#9c4a2c', '#6e7a3e'], fg: ['#b06a2c', '#c78b3a', '#8a3a24', '#6f7c3a', '#d8a656', '#a24a2a'], grade: '#ffb070', gradeA: 0.1, vig: 0.2 },
    dusk: { sky: [[0, '#8f9cb8'], [0.4, '#c7cdd8'], [0.75, '#ebe8e2'], [1, '#f7f2e8']], warm: '#ffffff', cool: '#9aa6c4',
      sun: [0.2, 0.33], sunCol: '#ffffff', sunA: 0.9, cloud: { lit: '#f6f4f0', mid: '#d8dae2', shade: '#b0b4c6', top: '#e4e6ee' },
      mtn: '#7a809c', mtnSh: '#5e6482', snow: '#e8ecf6', snowSh: '#b8bed2', haze: '#e2e2e6', hill: '#6e6e62', hillSh: '#56564e', ridge: '#6a6656', ridgeSh: '#504c42',
      tundra: ['#8a6e48', '#8e5a3e', '#6e6c48', '#9a7a4a', '#7a4a36', '#5a6040'], fg: ['#7e5a36', '#8e6e42', '#6a3a2c', '#565e3a', '#a08050', '#7a4232'], grade: '#d8d8e8', gradeA: 0.16, vig: 0.32 }
  };
  function nomeSky(ctx, w, h, L, P, r) {
    var s = L.s, hz = L.hz;
    ctx.fillStyle = lg(ctx, 0, 0, 0, hz, P.sky); ctx.fillRect(0, 0, w, hz + 2);
    skyStrokes(ctx, -20 * s, w + 20 * s, 0, hz, P.sky, 240, r, s, 0.14, P.warm, P.cool);
    var sx = w * P.sun[0], sy = h * P.sun[1];
    softGlow(ctx, sx, sy, w * 0.9, P.sunCol, P.sunA * 0.45); softGlow(ctx, sx, sy, w * 0.3, P.sunCol, P.sunA * 0.6);
    if (P === NOMEPAL.dusk) {
      // a pale, washed-out sun inside milky haze bands
      softGlow(ctx, sx, sy, 90 * s, '#ffffff', 0.7); softGlow(ctx, sx, sy, 40 * s, '#ffffff', 0.9);
      ctx.fillStyle = rg(ctx, sx, sy, 0, 18 * s, [[0, 'rgba(255,255,255,1)'], [0.75, 'rgba(255,253,248,1)'], [1, 'rgba(255,250,240,0)']]); ctx.beginPath(); ctx.arc(sx, sy, 18 * s, 0, TAU); ctx.fill();
      for (var b = 0; b < 7; b++) band(ctx, 0, w, h * (0.16 + b * 0.035), h * (0.2 + b * 0.035), '#ffffff', 0.18 + r() * 0.12);
    }
    // clouds: soft cumulus drifting in from the sea, lit from the sun's side
    var cl = P === NOMEPAL.dusk ? [[0.7, 0.1, 0.5, 0.03], [0.35, 0.2, 0.42, 0.025]] : [[0.25, 0.1, 0.42, 0.05], [0.7, 0.2, 0.36, 0.04], [0.12, 0.27, 0.3, 0.03], [0.62, 0.31, 0.28, 0.025]];
    for (var i = 0; i < cl.length; i++) cloudForm(ctx, w * cl[i][0], h * cl[i][1], w * cl[i][2], h * cl[i][3], r, { lit: P.cloud.lit, mid: P.cloud.mid, shade: P.cloud.shade, top: P.cloud.top, al: 0.95, lx: (P.sun[0] - cl[i][0]) * 2, ly: -0.8, q: 0.5 });
  }
  function nomeMountains(ctx, w, h, L, P, r) {
    var s = L.s, hz = L.hz, i, x;
    // the Kigluaik Mountains: sharp, separate peaks (a far, hazy range and a nearer one), dusted with the first snow
    function range(seed, n, base, hmin, hmax, wmin, wmax) {
      var rr = rng(seed), pk = [];
      for (i = 0; i < n; i++) pk.push([(i + rr() * 0.8 - 0.4) / (n - 1) * w * 1.1 - w * 0.05, h * (hmin + rr() * (hmax - hmin)), w * (wmin + rr() * (wmax - wmin))]);
      return function (xx) { var m = 0; for (var k = 0; k < pk.length; k++) { var d = Math.abs(xx - pk[k][0]) / pk[k][2]; if (d < 1) m = Math.max(m, pk[k][1] * Math.pow(1 - d, 1.25)); }
        return base - m - h * 0.006 * fbm(xx / w * 18, seed, 3); };
    }
    function paintRange(top, col, colSh, snowY, alpha) {
      ctx.save(); ctx.globalAlpha = alpha;
      ridge(ctx, -2, w + 2, 1.5 * s, top, hz + 4, col);
      ctx.beginPath(); ctx.moveTo(-2, hz + 4); for (x = -2; x <= w + 2; x += 1.5 * s) ctx.lineTo(x, top(x)); ctx.lineTo(w + 2, hz + 4); ctx.closePath(); ctx.save(); ctx.clip();
      // faces turned away from the morning sun (on the right) are in shade
      for (x = -2; x <= w + 2; x += 1.5 * s) { var sl = top(x + 2 * s) - top(x - 2 * s); if (sl < 0) { ctx.fillStyle = rgba(colSh, Math.min(0.85, -sl / (3 * s))); ctx.fillRect(x, top(x), 1.6 * s, hz + 4 - top(x)); } }
      batch(ctx, 420, [[colSh, 1 * s, 0.45], [mix(col, '#ffffff', 0.25), 0.9 * s, 0.3]], function () { var xx = r() * w, y0 = top(xx), yy = y0 + r() * (hz - y0), l = (3 + r() * 8) * s; return [xx, yy, xx + l * 0.55, yy + l, r() < 0.6 ? 0 : 1]; });
      // first snow on the summits only, running down the gullies in streaks
      ctx.beginPath(); ctx.moveTo(-2, -10); for (x = -2; x <= w + 2; x += 1.5 * s) ctx.lineTo(x, snowY + h * 0.008 * Math.sin(x / s * 0.21) + h * 0.006 * fbm(x / w * 14, 77, 3)); ctx.lineTo(w + 2, -10); ctx.closePath(); ctx.clip();
      ridge(ctx, -2, w + 2, 1.5 * s, top, hz + 4, P.snow);
      for (x = -2; x <= w + 2; x += 1.5 * s) { var sl2 = top(x + 2 * s) - top(x - 2 * s); if (sl2 < 0) { ctx.fillStyle = rgba(P.snowSh, Math.min(0.9, -sl2 / (2.5 * s))); ctx.fillRect(x, top(x), 1.6 * s, hz - top(x)); } }
      ctx.restore();
      batch(ctx, 260, [[P.snow, 0.9 * s, 0.8]], function () { var xx = r() * w, y0 = top(xx); if (y0 > snowY) return null; var l = (2 + r() * 7) * s; return [xx, snowY + r() * 3 * s, xx + (r() - 0.5) * 2 * s, snowY + l, 0]; });
      ctx.restore();
    }
    var far = range(7031, 11, hz + h * 0.004, 0.03, 0.095, 0.08, 0.2), near = range(7043, 7, hz + h * 0.012, 0.018, 0.055, 0.12, 0.24);
    paintRange(far, mix(P.mtn, P.haze, 0.35), mix(P.mtnSh, P.haze, 0.2), hz - h * 0.058, 1);
    haze(ctx, -w * 0.2, hz - h * 0.04, w * 1.2, hz + h * 0.01, P.haze, 0.35);
    paintRange(near, P.mtn, P.mtnSh, hz - h * 0.033, 1);
    haze(ctx, -w * 0.2, hz - h * 0.015, w * 1.2, hz + h * 0.025, P.haze, 0.45);
  }
  function nomeHills(ctx, w, h, L, P, r) {
    var s = L.s, hz = L.hz;
    // rolling foothills
    var hill0 = function (x) { var u = x / w; return hz + h * 0.004 - h * 0.018 * fbm(u * 3 + 9, 719, 4); };
    ridge(ctx, -2, w + 2, 3 * s, hill0, h * 0.5, mix(P.hill, P.haze, 0.45));
    var hill = function (x) { var u = x / w; return hz + h * 0.016 - h * 0.022 * fbm(u * 4 + 3, 721, 4); };
    ridge(ctx, -2, w + 2, 3 * s, hill, h * 0.5, P.hill);
    dabs(ctx, 260, [[P.hillSh, 0.5], [mix(P.hill, '#d8b070', 0.35), 0.45], [mix(P.hill, '#a85a3a', 0.3), 0.4]], function () { var x = r() * w, y = hill(x) + r() * h * 0.06; return [x, y, (4 + r() * 10) * s, (1 + r() * 2) * s, (r() * 3) | 0, 0]; });
    // Anvil Mountain with the four old White Alice antennas (tall curved billboard reflectors)
    var ax = L.anvil[0], ay = L.anvil[1];
    ctx.fillStyle = mix(P.hill, P.mtn, 0.35); ctx.beginPath(); ctx.moveTo(ax - w * 0.2, hz + h * 0.02); ctx.bezierCurveTo(ax - w * 0.1, ay + h * 0.01, ax - w * 0.04, ay, ax, ay); ctx.bezierCurveTo(ax + w * 0.05, ay, ax + w * 0.12, ay + h * 0.015, ax + w * 0.22, hz + h * 0.02); ctx.fill();
    for (var k = 0; k < 4; k++) { var bx = ax + (k - 1.5) * 7 * s, bw = 5 * s, bh = 9 * s;
      ctx.fillStyle = P === NOMEPAL.dusk ? '#9a9aa6' : '#d8dde6'; ctx.beginPath(); ctx.moveTo(bx - bw / 2, ay - bh); ctx.quadraticCurveTo(bx, ay - bh * 1.1, bx + bw / 2, ay - bh); ctx.lineTo(bx + bw / 2, ay - 2 * s); ctx.quadraticCurveTo(bx, ay - 1 * s, bx - bw / 2, ay - 2 * s); ctx.fill();
      ctx.fillStyle = 'rgba(40,40,60,0.35)'; ctx.fillRect(bx + bw * 0.15, ay - bh, bw * 0.35, bh - 2 * s); }
    // wind turbine towers on the low ridge (blades turn in the overlay)
    for (k = 0; k < L.turb.length; k++) { var T = L.turb[k]; ctx.strokeStyle = P === NOMEPAL.dusk ? '#c8c8d0' : '#f2f4f8'; ctx.lineWidth = 1.2 * s; ctx.beginPath(); ctx.moveTo(T[0], T[1] + 16 * s); ctx.lineTo(T[0], T[1]); ctx.stroke(); }
    // the east ridge, nearer and darker, with the "weather station" on its crest
    ridge(ctx, w * 0.45, w + 2, 2 * s, L.ridgeY, h * 0.53, P.ridge);
    ctx.save(); ridge(ctx, w * 0.45, w + 2, 2 * s, L.ridgeY, h * 0.53, null); ctx.clip();
    ctx.fillStyle = lg(ctx, w * 0.6, 0, w, 0, [[0, 'rgba(0,0,0,0)'], [1, rgba(P.ridgeSh, 0.0)]]); ctx.fillRect(0, 0, w, h);
    dabs(ctx, 380, [[P.ridgeSh, 0.55], [mix(P.ridge, '#c8902e', 0.45), 0.5], [mix(P.ridge, '#a03a24', 0.4), 0.45], [mix(P.ridge, '#e8e0c8', 0.3), 0.3]], function () { var x = w * 0.45 + r() * w * 0.56, y = L.ridgeY(x) + r() * h * 0.08; return [x, y, (3 + r() * 9) * s, (1 + r() * 2.2) * s, (r() * 4) | 0, 0]; });
    ctx.restore();
    var gx = L.rig[0], gy = L.rig[1];
    ctx.strokeStyle = '#3a3a48'; ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.moveTo(gx - 3 * s, gy); ctx.lineTo(gx, gy - 12 * s); ctx.lineTo(gx + 3 * s, gy); ctx.moveTo(gx, gy - 12 * s); ctx.lineTo(gx, gy - 15 * s); ctx.moveTo(gx - 3 * s, gy - 15 * s); ctx.lineTo(gx + 3 * s, gy - 15 * s); ctx.stroke();
    ctx.fillStyle = '#6a6a7a'; ctx.fillRect(gx + 2 * s, gy - 3 * s, 5 * s, 3 * s);
  }
  function nomeMammothSil(ctx, x, y, sz, dir, col, colD, calf) {
    // a distant mammoth: domed head, sloping back, shaggy skirt, trunk; sz = shoulder height in px
    ctx.save(); ctx.translate(x, y); ctx.scale(dir * sz / 10, sz / 10);
    ctx.fillStyle = colD; ctx.fillRect(-5.5, -4, 2, 4); ctx.fillRect(3, -4, 2, 4);
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-7, -4); ctx.bezierCurveTo(-8, -8, -5, -10.5, 1, -10.5); ctx.bezierCurveTo(4, -11, 6.5, -10, 7, -8);
    ctx.bezierCurveTo(9, -10.5, 11.5, -9.5, 11.5, -7); ctx.bezierCurveTo(11.6, -4.5, 10.8, -2, 10.6, 0); ctx.lineTo(9.8, 0); ctx.bezierCurveTo(9.8, -2, 9.6, -3.8, 8.8, -5);
    ctx.lineTo(7.5, -4); ctx.lineTo(6.5, 0); ctx.lineTo(4.5, 0); ctx.lineTo(4, -3); ctx.lineTo(-4, -3); ctx.lineTo(-4.5, 0); ctx.lineTo(-6.5, 0); ctx.closePath(); ctx.fill();
    if (!calf) { ctx.strokeStyle = '#efe6d0'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(9.4, -5); ctx.quadraticCurveTo(12, -4, 11.6, -2); ctx.stroke(); }
    ctx.restore();
  }
  function nomePlain(ctx, w, h, L, P, r) {
    var s = L.s, y0 = h * 0.455, y1 = L.fg + h * 0.02;
    ctx.fillStyle = lg(ctx, 0, y0, 0, y1, [[0, mix(P.tundra[0], P.haze, 0.35)], [0.5, P.tundra[0]], [1, P.tundra[3]]]);
    ctx.beginPath(); ctx.moveTo(0, y1); for (var xx = 0; xx <= w + 3 * s; xx += 3 * s) ctx.lineTo(xx, y0 + h * 0.006 * fbm(xx / w * 12, 733, 3)); ctx.lineTo(w, y1); ctx.closePath(); ctx.fill();
    // patchwork of fall colours: larger, softer patches far off, smaller and crisper nearer
    dabs(ctx, 1600, [[P.tundra[1], 0.55], [P.tundra[2], 0.5], [P.tundra[3], 0.5], [P.tundra[4], 0.45], [P.tundra[5], 0.5], [mix(P.tundra[3], '#fff0c8', 0.4), 0.35]], function () {
      var p = Math.pow(r(), 1.3), y = lerp(y0, y1, p), x = r() * w, sc = 0.4 + p * 1.4; return [x, y, (4 + r() * 12) * s * sc, (0.8 + r() * 1.6) * s * sc, (r() * 6) | 0, (r() - 0.5) * 0.1]; });
    // a thaw pond reflecting the sky
    var px = w * 0.66, py = h * 0.528, prx = w * 0.12, pry = h * 0.009;
    ctx.fillStyle = lg(ctx, 0, py - pry, 0, py + pry, [[0, mix(P.sky[2][1], '#ffffff', 0.2)], [1, P.sky[1][1]]]); ctx.beginPath(); ctx.ellipse(px, py, prx, pry, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 0.8 * s; ctx.beginPath(); for (var i = 0; i < 6; i++) { var lx = px + (r() - 0.5) * prx * 1.4, ly = py + (r() - 0.5) * pry; ctx.moveTo(lx, ly); ctx.lineTo(lx + (6 + r() * 10) * s, ly); } ctx.stroke();
    // a gravel track winding to the barn
    ctx.strokeStyle = mix(P.tundra[3], '#e8dcc0', 0.55); ctx.lineWidth = 3 * s; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(w * 0.25, y1); ctx.bezierCurveTo(w * 0.32, h * 0.56, w * 0.18, h * 0.55, w * 0.2, h * 0.538); ctx.stroke();
    // the herd, far off
    for (i = 0; i < L.herd.length; i++) { var H = L.herd[i]; nomeMammothSil(ctx, H[0], H[1], H[2] * H[4], H[3], P === NOMEPAL.dusk ? '#5a3a2a' : '#7a3a1e', '#4a2412', H[4] < 1); }
    // automated feeders near the barn (white hoppers with a teal stripe)
    for (i = 0; i < 3; i++) { var fx = L.barn.x + L.barn.w + (8 + i * 14) * s, fy = h * 0.533 + i * 2 * s; ctx.fillStyle = '#f2f4f8'; ctx.fillRect(fx - 2.5 * s, fy - 7 * s, 5 * s, 6 * s); ctx.fillStyle = '#2f9aa2'; ctx.fillRect(fx - 2.5 * s, fy - 5.5 * s, 5 * s, 1 * s); ctx.fillStyle = '#5a6070'; ctx.fillRect(fx - 2 * s, fy - 1 * s, 1 * s, 2 * s); ctx.fillRect(fx + 1 * s, fy - 1 * s, 1 * s, 2 * s); }
    // Warming Barn 2: a long arched barn on pilings (the ground under it stays frozen), solar panels, warm windows
    var B = L.barn, bx = B.x, by = B.y, bw = B.w, bh = B.h;
    ctx.fillStyle = 'rgba(30,20,20,0.25)'; ctx.beginPath(); ctx.ellipse(bx + bw / 2, by + 2 * s, bw * 0.55, 3 * s, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#5a4a40'; for (i = 0; i < 7; i++) ctx.fillRect(bx + bw * (0.06 + i * 0.145), by - 3 * s, 1.6 * s, 4 * s);
    ctx.fillStyle = P === NOMEPAL.dusk ? '#8a6e5a' : '#b0583a'; ctx.beginPath(); ctx.moveTo(bx, by - 3 * s); ctx.lineTo(bx, by - bh * 0.55); ctx.bezierCurveTo(bx, by - bh * 1.15, bx + bw, by - bh * 1.15, bx + bw, by - bh * 0.55); ctx.lineTo(bx + bw, by - 3 * s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.moveTo(bx + bw * 0.08, by - bh * 0.8); ctx.bezierCurveTo(bx + bw * 0.2, by - bh * 1.05, bx + bw * 0.5, by - bh * 1.08, bx + bw * 0.62, by - bh * 1.04); ctx.lineTo(bx + bw * 0.6, by - bh * 0.92); ctx.bezierCurveTo(bx + bw * 0.45, by - bh * 0.96, bx + bw * 0.2, by - bh * 0.92, bx + bw * 0.1, by - bh * 0.7); ctx.fill();
    ctx.fillStyle = '#2a3460'; for (i = 0; i < 5; i++) { ctx.save(); ctx.translate(bx + bw * (0.18 + i * 0.15), by - bh * 0.98); ctx.rotate(-0.08); ctx.fillRect(-6 * s, -1.6 * s, 12 * s, 2.4 * s); ctx.restore(); }
    ctx.fillStyle = P === NOMEPAL.dusk ? '#ffd890' : '#ffe8b0'; for (i = 0; i < 6; i++) ctx.fillRect(bx + bw * (0.1 + i * 0.14), by - bh * 0.48, 4 * s, 3 * s);
    ctx.fillStyle = '#4a3a34'; ctx.fillRect(bx + bw * 0.78, by - bh * 0.5, bw * 0.12, bh * 0.5 - 3 * s);
    ctx.fillStyle = '#f2f4f8'; ctx.font = '700 ' + (5 * s).toFixed(1) + 'px Nunito, sans-serif'; ctx.fillText('2', bx + bw * 0.82, by - bh * 0.62);
    haze(ctx, -w * 0.1, y0 - h * 0.005, w * 1.1, y0 + h * 0.03, P.haze, 0.35);
    if (P === NOMEPAL.day) { haze(ctx, w * 0.05, h * 0.475, w * 0.45, h * 0.5, '#3a3020', 0.18); haze(ctx, w * 0.6, h * 0.55, w * 1.05, h * 0.585, '#3a3020', 0.16);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = lg(ctx, w, 0, w * 0.3, 0, [[0, 'rgba(255,200,130,0.10)'], [1, 'rgba(255,200,130,0)']]); ctx.fillRect(0, y0, w, h - y0); ctx.restore(); }
  }
  function nomeForeground(ctx, w, h, L, P, r) {
    var s = L.s, y0 = L.fg;
    ctx.fillStyle = lg(ctx, 0, y0, 0, h, [[0, P.fg[0]], [0.4, mix(P.fg[0], P.fg[3], 0.4)], [1, mix(P.fg[3], '#2a2418', 0.35)]]); ctx.fillRect(0, y0, w, h - y0);
    // a ragged, soft top edge so the foreground melts into the plain
    dabs(ctx, 700, [[P.fg[0], 0.7], [mix(P.fg[0], P.tundra[3], 0.5), 0.6], [P.tundra[1], 0.5]], function () { var x = r() * w, y = y0 + (r() - 0.6) * h * 0.03; return [x, y, (4 + r() * 10) * s, (1 + r() * 2) * s, (r() * 3) | 0, (r() - 0.5) * 0.2]; });
    // tussocks and leaf litter: bigger dabs nearer the bottom
    dabs(ctx, 2600, [[P.fg[1], 0.6], [P.fg[2], 0.55], [P.fg[3], 0.55], [P.fg[4], 0.45], [P.fg[5], 0.55], [mix(P.fg[3], '#000000', 0.3), 0.4]], function () {
      var p = Math.pow(r(), 0.9), y = lerp(y0, h, p), x = r() * w, sc = 0.6 + p * 2.2; return [x, y, (3 + r() * 6) * s * sc, (1 + r() * 2) * s * sc, (r() * 6) | 0, (r() - 0.5) * 0.6]; });
    grassField(ctx, w, y0, h, 3800, [[mix(P.fg[4], '#f0e0b0', 0.3), 0.9 * s, 0.55], [P.fg[3], 1 * s, 0.55], [P.fg[1], 0.9 * s, 0.5], [mix(P.fg[3], '#1a2010', 0.4), 1 * s, 0.45]], r, s, -0.15);
    // red bearberry leaves in clusters
    dots(ctx, 900, [['#c0392b', 0.75], ['#e05a3a', 0.6], ['#8a1f1a', 0.6]], function () { var cx = r() * w, cy = lerp(y0, h, Math.pow(r(), 0.8)); var p = (cy - y0) / (h - y0); return [cx + (r() - 0.5) * 6 * s, cy + (r() - 0.5) * 3 * s, (0.6 + r() * 1.4) * s * (0.6 + p * 1.6), (r() * 3) | 0]; });
    // cottongrass: thin stems with white cotton heads
    var cg = []; for (var i = 0; i < 160; i++) { var p = Math.pow(r(), 0.8), y = lerp(y0 + h * 0.01, h, p), x = r() * w, ln = (6 + r() * 10) * s * (0.5 + p * 1.6); cg.push([x, y, ln, (r() - 0.5) * 0.3, p]); }
    L.cotton = cg;
    ctx.strokeStyle = 'rgba(70,70,40,0.6)'; ctx.lineWidth = 0.7 * s; ctx.beginPath(); cg.forEach(function (c) { ctx.moveTo(c[0], c[1]); ctx.quadraticCurveTo(c[0] + c[3] * c[2] * 0.4, c[1] - c[2] * 0.5, c[0] + c[3] * c[2], c[1] - c[2]); }); ctx.stroke();
    dots(ctx, cg.length * 3, [['#ffffff', 0.92], [P === NOMEPAL.dusk ? '#d8d8e0' : '#f2ece0', 0.9]], function (k) { var c = cg[k / 3 | 0]; return [c[0] + c[3] * c[2] + (r() - 0.5) * 2 * s * (0.5 + c[4]), c[1] - c[2] + (r() - 0.5) * 2 * s * (0.5 + c[4]), (1 + r() * 1.2) * s * (0.5 + c[4] * 1.4), r() < 0.5 ? 0 : 1]; });
    // golden willow shrubs at the edges
    var wpal = P === NOMEPAL.dusk ? ['#4a4028', '#6a5a30', '#8a7038', '#a08a48', '#c0a868'] : ['#7a5a18', '#a8801e', '#c89a26', '#e0b83a', '#f4d870'];
    [[0.02, 0.655, 46], [0.12, 0.69, 30], [0.97, 0.64, 40], [0.9, 0.7, 26]].forEach(function (Q, k) { var rr = rng(4100 + k); ctx.save(); ctx.translate(w * Q[0], h * Q[1]); ctx.scale(1.5, 0.62); for (var c = 0; c < 3; c++) clump(ctx, (c - 1) * Q[2] * 0.7 * s, (c % 2) * Q[2] * 0.2 * s, Q[2] * (c === 1 ? 1 : 0.75) * s, wpal, rr, 0.6, -0.8, false, 0.7); ctx.restore(); });
    // the reserve fence: posts and high-tensile wire receding toward the east ridge
    var posts = []; for (i = 0; i < 9; i++) { var t = i / 8, px = lerp(w * 1.04, w * 0.6, Math.pow(t, 0.7)), py = lerp(h * 0.83, h * 0.535, Math.pow(t, 0.7)), ph = lerp(80, 9, Math.pow(t, 0.55)) * s; posts.push([px, py, ph]); }
    L.posts = posts;
    ctx.strokeStyle = 'rgba(60,50,40,0.55)'; ctx.lineWidth = 0.8 * s; for (var wi = 0; wi < 3; wi++) { ctx.beginPath(); posts.forEach(function (Pp, k) { var yy = Pp[1] - Pp[2] * (0.35 + wi * 0.25); if (!k) ctx.moveTo(Pp[0], yy); else ctx.lineTo(Pp[0], yy); }); ctx.stroke(); }
    posts.forEach(function (Pp) { var pw = Math.max(1.2 * s, Pp[2] * 0.07); ctx.fillStyle = '#5a4634'; ctx.fillRect(Pp[0] - pw / 2, Pp[1] - Pp[2], pw, Pp[2]); ctx.fillStyle = 'rgba(255,220,170,0.35)'; ctx.fillRect(Pp[0] - pw / 2, Pp[1] - Pp[2], pw * 0.35, Pp[2]); ctx.fillStyle = '#2f9aa2'; ctx.fillRect(Pp[0] - pw / 2, Pp[1] - Pp[2] * 0.92, pw, Math.max(1, Pp[2] * 0.04)); });
  }
  var nomeLM = memo(nomeL);
  function paintNome(variant) {
    return function (ctx, w, h) {
      try {
        var P = NOMEPAL[variant], L = nomeLM(w, h), r = rng(variant === 'dusk' ? 5151 : 4141);
        nomeSky(ctx, w, h, L, P, r); nomeMountains(ctx, w, h, L, P, r); nomeHills(ctx, w, h, L, P, r); nomePlain(ctx, w, h, L, P, r); nomeForeground(ctx, w, h, L, P, rng(4242));
        if (variant === 'dusk') { // dusk: long shadows and a cool wash; the sun's last light rims the grass
          ctx.fillStyle = lg(ctx, 0, h * 0.45, 0, h, [[0, 'rgba(40,40,70,0.05)'], [1, 'rgba(20,20,40,0.45)']]); ctx.fillRect(0, h * 0.45, w, h * 0.55);
        }
        finish(ctx, w, h, P.grade, P.gradeA, P.vig, 0.04, '#14101e', 0.45);
      } catch (e) { PAINT._err = 'nome_' + variant + ': ' + String(e && e.stack || e); }
    };
  }
  function overlayNome(variant) {
    return function (ctx, w, h, t) {
      try {
        var L = nomeLM(w, h), s = L.s, i;
        ctx.save();
        // wind turbine blades turning slowly
        ctx.strokeStyle = variant === 'dusk' ? '#c8c8d0' : '#ffffff'; ctx.lineWidth = 0.9 * s; ctx.lineCap = 'round';
        for (i = 0; i < L.turb.length; i++) { var T = L.turb[i], a0 = t * (0.9 + i * 0.13) + i * 2; ctx.beginPath(); for (var b = 0; b < 3; b++) { var a = a0 + b * TAU / 3; ctx.moveTo(T[0], T[1]); ctx.lineTo(T[0] + Math.cos(a) * 7 * s, T[1] + Math.sin(a) * 7 * s); } ctx.stroke(); }
        // the ridge station's red light
        var bl = Math.pow(Math.max(0, Math.sin(t * 2.4)), 8); var sp = glowSpr('#ff4a3a', true);
        if (sp) { ctx.globalAlpha = 0.35 + bl * 0.65; var z = (3 + bl * 4) * s; ctx.drawImage(sp, L.rig[0] - z, L.rig[1] - 15 * s - z, z * 2, z * 2); ctx.globalAlpha = 1; }
        if (variant === 'day') {
          // herd drones patrolling: small white quadcopters with blinking lights
          for (i = 0; i < 3; i++) { var ph = t * (0.05 + i * 0.017) + i * 2.1, dx = w * (0.35 + 0.33 * Math.sin(ph)), dy = h * (0.44 + i * 0.025) + Math.sin(ph * 2.3) * h * 0.008, ds = (2.2 + i * 0.5) * s;
            ctx.fillStyle = '#f4f6fb'; ctx.fillRect(dx - ds * 1.4, dy - ds * 0.3, ds * 2.8, ds * 0.8); ctx.fillStyle = 'rgba(200,210,230,0.8)'; ctx.fillRect(dx - ds * 2.4, dy - ds * 0.7, ds * 1.6, ds * 0.25); ctx.fillRect(dx + ds * 0.8, dy - ds * 0.7, ds * 1.6, ds * 0.25);
            ctx.fillStyle = '#2f9aa2'; ctx.fillRect(dx - ds * 1.4, dy, ds * 2.8, ds * 0.25); if (Math.sin(t * 5 + i) > 0.5) { ctx.fillStyle = '#7ff7e4'; ctx.fillRect(dx - ds * 0.3, dy + ds * 0.4, ds * 0.6, ds * 0.6); } }
          // a raven drifting over the tundra
          var rp = (t * 0.03) % 1, rx = w * (1.1 - rp * 1.3), ry = h * (0.2 + 0.03 * Math.sin(t * 0.7)), fl = Math.sin(t * 6) * 3 * s;
          ctx.strokeStyle = '#1a1a26'; ctx.lineWidth = 1.6 * s; ctx.beginPath(); ctx.moveTo(rx - 7 * s, ry - fl); ctx.quadraticCurveTo(rx - 3 * s, ry - 2 * s, rx, ry); ctx.quadraticCurveTo(rx + 3 * s, ry - 2 * s, rx + 7 * s, ry - fl); ctx.stroke();
        } else {
          // balloons rising off the ridge, and a flock of cranes turning back over the haze
          for (i = 0; i < 5; i++) { var bp = ((t * 0.02 + i * 0.21) % 1), bx = L.rig[0] + (i - 2) * 6 * s + Math.sin(t * 0.5 + i) * 4 * s, by = L.rig[1] - 16 * s - bp * h * 0.3;
            ctx.globalAlpha = (1 - bp) * 0.8; ctx.fillStyle = '#f8f6f2'; ctx.beginPath(); ctx.arc(bx, by, (1.4 + bp * 1.6) * s, 0, TAU); ctx.fill(); }
          ctx.globalAlpha = 1; var cp = (t * 0.04) % 1, cx0 = w * (0.15 + 0.6 * Math.sin(cp * PI)), cy0 = h * (0.14 + 0.05 * cp);
          ctx.strokeStyle = '#3a3a4a'; ctx.lineWidth = 1 * s;
          for (i = 0; i < 9; i++) { var row = i - 4, fx = cx0 + Math.abs(row) * 6 * s * (cp < 0.5 ? 1 : -1), fy = cy0 + row * 4 * s, f2 = Math.sin(t * 5 + i) * 1.5 * s; ctx.beginPath(); ctx.moveTo(fx - 3 * s, fy - f2); ctx.lineTo(fx, fy); ctx.lineTo(fx + 3 * s, fy - f2); ctx.stroke(); }
        }
        // cottongrass heads nodding in the wind
        if (L.cotton) { ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.beginPath(); for (i = 0; i < L.cotton.length; i += 4) { var c = L.cotton[i], sw = Math.sin(t * 1.6 + c[0] * 0.05) * 1.6 * s * (0.5 + c[4]); qcirc(ctx, c[0] + c[3] * c[2] + sw, c[1] - c[2], (1 + c[4] * 1.6) * s); } ctx.fill(); }
        ctx.restore();
      } catch (e) { PAINT._err = 'nome overlay: ' + String(e && e.stack || e); }
    };
  }
  // anchors (fractions of w,h): the ridge station, the barn, the herd; the middle stays clear for portraits
  PAINT.nome_reserve = { focus: { x: 0.8, y: 0.39 }, track: 'morning', anchors: { rig: { x: 0.8, y: 0.385 }, barn: { x: 0.18, y: 0.52 }, herd: { x: 0.55, y: 0.505 } }, paint: paintNome('day'), overlay: overlayNome('day') };
  PAINT.nome_dusk = { focus: { x: 0.2, y: 0.33 }, track: 'night', anchors: { rig: { x: 0.8, y: 0.385 }, sun: { x: 0.2, y: 0.33 } }, paint: paintNome('dusk'), overlay: overlayNome('dusk') };
  // the painting utilities, shared with src/scenes/nome_barn.js (which runs its paint() after every file has loaded)
  PAINT._nomeU = { rng: rng, hash: hash, fbm: fbm, fbm2: fbm2, clamp: clamp, lerp: lerp, smooth: smooth, mix: mix, rgba: rgba, lg: lg, rg: rg, S: S, memo: memo, ridge: ridge, poly: poly, rrect: rrect, glow: glow, softGlow: softGlow, haze: haze, band: band, finish: finish, shafts: shafts, batch: batch, dots: dots, dabs: dabs, rects: rects, grassField: grassField, glowSpr: glowSpr, wispSpr: wispSpr, qcirc: qcirc, qell: qell, clump: clump, leafPath: leafPath, PI: PI, TAU: TAU };
})();
