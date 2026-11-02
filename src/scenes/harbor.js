/* harbor.js - PAINT.harbor: Harbor Row, the Boston waterfront street of DNA print shops.
   Morning light off the water on the left, a row of low brick shopfronts on the right, and a
   granite promenade across the bottom that stays calm enough for subtitles and a character.
   Contract (see paint_boston.js): window.PAINT.harbor = { paint(ctx,w,h), overlay(ctx,w,h,t), focus, anchors, track }.
   The painting utilities live inside paint_boston.js's IIFE, so the ones used here are copied in. */
(function () {
  'use strict';
  var PAINT = (window.PAINT = window.PAINT || {});
  var PI = Math.PI, TAU = PI * 2;

  /* ============================== utilities (copied from paint_boston.js) ============================== */
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
    g.globalAlpha = o.halo == null ? 0.35 : o.halo; g.fillStyle = form; g.beginPath();
    for (i = 0; i < P.length; i++) { p = P[i]; g.moveTo(p[0] + p[2] * 1.12, p[1]); g.arc(p[0], p[1], p[2] * 1.12, 0, TAU); }
    g.fill(); g.globalAlpha = 1; g.beginPath();
    for (i = 0; i < P.length; i++) { p = P[i]; g.moveTo(p[0] + p[2], p[1]); g.arc(p[0], p[1], p[2], 0, TAU); }
    g.fill();
    g.globalCompositeOperation = 'source-atop';
    P.sort(function (A, B) { return A[1] - B[1]; });
    for (i = 0; i < P.length; i++) {
      p = P[i];
      if (i % 2 === 0) puff(g, p[0] - lx * p[2] * 0.3, p[1] - ly * p[2] * 0.3 + p[2] * 0.35, p[2] * 0.9, o.shade, o.seam == null ? 0.16 : o.seam);
      puff(g, p[0] + lx * p[2] * 0.55, p[1] + ly * p[2] * 0.55, p[2] * 0.6, o.lit, 0.32);
    }
    if (o.top) { g.fillStyle = lg(g, 0, cy - H, 0, cy + H * 0.3, [[0, rgba(o.top, 0.5)], [1, rgba(o.top, 0)]]); g.fillRect(cx - bw, cy - bh, bw * 2, bh * 2); }
    dabs(g, Math.round(P.length * 6), [[o.lit, 0.14], [o.top || o.mid, 0.12], [o.shade, 0.1]], function () {
      var q2 = P[(r() * P.length) | 0], a2 = r() * TAU, d2 = q2[2] * Math.sqrt(r()) * 0.9;
      var px = q2[0] + Math.cos(a2) * d2, py = q2[1] + Math.sin(a2) * d2, f = (Math.cos(a2) * lx + Math.sin(a2) * ly) * d2 / q2[2];
      return [px, py, q2[2] * (0.12 + r() * 0.16), q2[2] * (0.04 + r() * 0.04), f > 0.3 ? 0 : (Math.sin(a2) < -0.3 ? 1 : 2), (r() - 0.5) * 0.5];
    });
    g.globalCompositeOperation = 'destination-out';
    var by = cy + H * (0.12 + (1 - (o.base == null ? 0.6 : o.base)) * 0.3);
    g.fillStyle = lg(g, 0, by, 0, by + H * 0.2, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,1)']]); g.fillRect(cx - bw, by, bw * 2, bh);
    ctx.save(); ctx.globalAlpha = o.al == null ? 1 : o.al; ctx.imageSmoothingEnabled = true;
    ctx.drawImage(cv, cx - ox, cy - oy, bw, bh);
    ctx.restore();
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
  function drawBird(ctx, x, y, sz, flap) {
    var f = Math.sin(flap) * sz * 0.6;
    ctx.beginPath(); ctx.moveTo(x - sz, y - f); ctx.quadraticCurveTo(x - sz * 0.4, y - sz * 0.35, x, y); ctx.quadraticCurveTo(x + sz * 0.4, y - sz * 0.35, x + sz, y - f); ctx.stroke();
  }

  function tower(ctx, b, E) {
    var r = rng(b.seed || 7), s = E.s, x = b.x, w = b.w, top = b.top, base = b.base, H = base - top, k = b.k || 0, j;
    function T(c, e) { return mix(c, E.haze, clamp(k + (e || 0), 0, 1)); }
    var cx = x + w / 2, sd = cx < E.vpX ? 1 : -1, sw = w * (0.12 + 0.2 * clamp(Math.abs(cx - E.vpX) / (E.W * 0.5), 0, 1));
    var f0 = sd > 0 ? x : x + sw, f1 = sd > 0 ? x + w - sw : x + w, s0 = sd > 0 ? f1 : x, s1 = sd > 0 ? x + w : f0;
    var glass = b.kind === 'glass', fw = f1 - f0, fh = Math.max(1.6, 2.6 * s);
    // side face, then front face
    ctx.fillStyle = lg(ctx, 0, top, 0, base, [[0, T(E.shade)], [1, T(E.shade, 0.16)]]);
    ctx.fillRect(Math.min(s0, s1), top, Math.abs(s1 - s0), H);
    ctx.fillStyle = glass ? lg(ctx, 0, top, 0, base, [[0, T(E.glass[0])], [0.5, T(E.glass[1])], [1, T(E.glass[2])]])
      : lg(ctx, 0, top, 0, base, [[0, T(E.face)], [1, T(E.face, 0.16)]]);
    ctx.fillRect(f0, top, fw, H);
    if (glass) {
      // mullion grid + one diagonal sheen
      rects(ctx, 260, [[T(E.mull), 0.14 * (1 - k * 0.5)], ['#ffffff', 0.1 * (1 - k * 0.4)]], function (i) {
        var nx = Math.ceil(fw / (2.4 * s)); if (i < nx) return [f0 + i * fw / nx, top, Math.max(0.6, 0.35 * s), H, 0];
        var ny = Math.ceil(H / fh), q = i - nx; if (q < ny) return [f0, top + q * fh, fw, Math.max(0.5, 0.3 * s), 1];
        return null;
      });
      ctx.save(); ctx.beginPath(); ctx.rect(f0, top, fw, H); ctx.clip();
      ctx.fillStyle = rgba('#ffffff', 0.2 * (1 - k * 0.6));
      var shx = f0 + fw * (0.2 + r() * 0.4);
      ctx.beginPath(); ctx.moveTo(shx, top); ctx.lineTo(shx + fw * 0.3, top); ctx.lineTo(shx - fw * 0.45, base); ctx.lineTo(shx - fw * 0.75, base); ctx.fill();
      ctx.restore();
    } else {
      var cw = Math.max(2, 2.6 * s), nxw = Math.max(1, Math.floor(fw / cw)), ox = f0 + (fw - nxw * cw) / 2, ny2 = Math.max(1, Math.floor((H - fh) / fh));
      rects(ctx, Math.min(300, nxw * ny2), [[T(E.win), 0.7 - k * 0.3], [E.winLit, 0.6 * (1 - k * 0.5)]], function (i) {
        var cxi = i % nxw, cyi = (i / nxw) | 0, wy = top + fh * 0.8 + cyi * fh;
        if (wy > base - fh * 0.6) return null;
        return [ox + cxi * cw + cw * 0.22, wy, cw * 0.56, fh * 0.55, r() < 0.05 ? 1 : 0];
      });
    }
    // rim light along the sunward edge and the roofline
    var rimA = 0.55 * (1 - k * 0.5);
    ctx.fillStyle = rgba(E.rim, rimA); ctx.fillRect(f1 - 0.8 * s, top, 0.8 * s, H * 0.9);
    ctx.strokeStyle = rgba(E.rim, rimA * 0.9); ctx.lineWidth = 0.8 * s;
    ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x + w, top); ctx.stroke();
    if (b.roofTrees) for (j = 0; j < b.roofTrees; j++) clump(ctx, lerp(x + w * 0.16, x + w * 0.84, (j + 0.5) / b.roofTrees), top - 1.5 * s, (1.8 + r() * 2) * s, [T(E.green[0]), T(E.green[1]), T(E.green[2]), T(E.green[3]), T(E.green[4])], r, 0.7, -0.7, false, 0.6);
    if (b.solar) { ctx.fillStyle = T('#2c3a6a'); ctx.beginPath(); for (j = 0; j < 3; j++) { var px0 = x + w * (0.12 + j * 0.27); ctx.moveTo(px0, top); ctx.lineTo(px0 + w * 0.2, top); ctx.lineTo(px0 + w * 0.15, top - 2 * s); ctx.lineTo(px0 - w * 0.02, top - 2 * s); ctx.closePath(); } ctx.fill(); }
    if (b.turb) {
      var tx2 = cx, mh = Math.max(6 * s, w * 0.5), bl = Math.max(3.5 * s, w * 0.3), a0 = r() * TAU;
      ctx.strokeStyle = T('#f6f4f2'); ctx.lineWidth = Math.max(0.7, 0.7 * s); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(tx2, top); ctx.lineTo(tx2, top - mh);
      for (j = 0; j < 3; j++) { var aa = a0 + j * TAU / 3; ctx.moveTo(tx2, top - mh); ctx.lineTo(tx2 + Math.cos(aa) * bl, top - mh + Math.sin(aa) * bl); }
      ctx.stroke();
    }
  }
  function frondPlant(ctx, cx, cy, R, n, pal, seed, spread, dir, s, lx, ly) {
    var r = rng(seed), k, j, F = [];
    for (k = 0; k < n; k++) {
      var a = dir + (r() - 0.5) * spread, Ln = R * (0.5 + r() * 0.7), bend = (r() - 0.5) * 0.45;
      var v = Math.cos(a) * lx + Math.sin(a) * ly, b = clamp(Math.round((v * 0.5 + 0.5) * 4 + (r() - 0.5) * 1.3), 0, 4);
      F.push([cx + Math.cos(a) * Ln * 0.16, cy + Math.sin(a) * Ln * 0.16, Ln, Ln * (0.2 + r() * 0.1), a + bend, b]);
    }
    F.sort(function (A, B) { return B[2] - A[2]; });
    // a dark mass behind, so the fronds do not read as flat cut-outs
    ctx.fillStyle = pal[0]; ctx.beginPath();
    for (j = 0; j < F.length; j++) leafPath(ctx, F[j][0], F[j][1], F[j][2] * 1.04, F[j][3] * 1.25, F[j][4], true);
    ctx.fill();
    for (k = 0; k < 5; k++) {
      ctx.fillStyle = pal[k]; ctx.beginPath();
      for (j = 0; j < F.length; j++) if (F[j][5] === k) leafPath(ctx, F[j][0], F[j][1], F[j][2], F[j][3], F[j][4], true);
      ctx.fill();
    }
    // midribs and a sliver of light along the sunward edge of each frond
    ctx.lineWidth = Math.max(0.5, 0.55 * s);
    ctx.strokeStyle = rgba(pal[1], 0.5); ctx.beginPath();
    for (j = 0; j < F.length; j++) { ctx.moveTo(F[j][0], F[j][1]); ctx.lineTo(F[j][0] + Math.cos(F[j][4]) * F[j][2] * 0.92, F[j][1] + Math.sin(F[j][4]) * F[j][2] * 0.92); }
    ctx.stroke();
    ctx.strokeStyle = rgba(pal[4], 0.5); ctx.beginPath();
    for (j = 0; j < F.length; j++) {
      if (F[j][5] < 3) continue;
      var na = F[j][4] - PI / 2 * (lx < 0 ? -1 : 1), ox2 = Math.cos(na) * F[j][3] * 0.75, oy2 = Math.sin(na) * F[j][3] * 0.75;
      ctx.moveTo(F[j][0] + ox2 * 0.4, F[j][1] + oy2 * 0.4);
      ctx.quadraticCurveTo(F[j][0] + Math.cos(F[j][4]) * F[j][2] * 0.5 + ox2, F[j][1] + Math.sin(F[j][4]) * F[j][2] * 0.5 + oy2,
        F[j][0] + Math.cos(F[j][4]) * F[j][2] * 0.95, F[j][1] + Math.sin(F[j][4]) * F[j][2] * 0.95);
    }
    ctx.stroke();
  }
  /* trailing vine: stems hanging from (x,y) with leaf pairs */

  /* ============================== scene pieces ============================== */
  /* a low brick shopfront: brick face, a lit window, an awning, a sign board and a door */
  function shop(ctx, b, E) {
    var s = E.s, r = rng(b.seed), x = b.x, w = b.w, top = b.top, base = b.base, H = base - top, i;
    var brick = b.brick, mortar = mix(brick, '#f4ece0', 0.45), lit = mix(brick, '#ffe8c0', 0.3), dark = mix(brick, '#2a1c2c', 0.3);
    /* face, lit from the left (the water side) */
    ctx.fillStyle = lg(ctx, x, 0, x + w, 0, [[0, lit], [0.45, brick], [1, dark]]);
    ctx.fillRect(x, top, w, H);
    /* brick courses */
    var bh = Math.max(1.6, 2.4 * s), bw = bh * 2.3, rows = Math.ceil(H / bh);
    rects(ctx, Math.min(900, rows * Math.ceil(w / bw)), [[mortar, 0.3], [mix(brick, '#ffffff', 0.18), 0.22], [dark, 0.18]], function (i2) {
      var nx = Math.ceil(w / bw), ry = (i2 / nx) | 0, cx2 = i2 % nx;
      var yy = top + ry * bh; if (yy > base - bh) return null;
      var xx = x + cx2 * bw + (ry % 2 ? bw * 0.5 : 0) - bw * 0.5;
      if (xx + bw < x || xx > x + w) return null;
      return [Math.max(x, xx), yy, Math.min(bw - 0.6 * s, x + w - Math.max(x, xx)), bh - 0.6 * s, (r() * 3) | 0];
    });
    /* cornice */
    ctx.fillStyle = mix(brick, '#f6efe2', 0.55); ctx.fillRect(x - w * 0.015, top - 2.4 * s, w * 1.03, 3 * s);
    ctx.fillStyle = rgba('#2a1c2c', 0.18); ctx.fillRect(x - w * 0.015, top + 0.6 * s, w * 1.03, 1 * s);
    /* two floors of upper windows */
    var uw = w * 0.2, uh = H * 0.19, fl, col;
    for (fl = 0; fl < 2; fl++) {
      var uy = top + H * (0.12 + fl * 0.3);
      for (col = 0; col < 2; col++) {
        var ux = x + w * (0.16 + col * 0.44), warm = r() < 0.35;
        ctx.fillStyle = mix('#3c4a66', '#f4ece0', 0.12); ctx.fillRect(ux - 1.2 * s, uy - 1.2 * s, uw + 2.4 * s, uh + 2.4 * s);
        ctx.fillStyle = warm ? lg(ctx, ux, uy, ux + uw, uy + uh, [[0, '#ffe9bc'], [1, '#e8c489']])
          : lg(ctx, ux, uy, ux + uw, uy + uh, [[0, '#cfe4f2'], [0.6, '#9fc0dc'], [1, '#6f90b4']]);
        ctx.fillRect(ux, uy, uw, uh);
        ctx.fillStyle = rgba('#ffffff', warm ? 0.3 : 0.5); ctx.fillRect(ux, uy, uw * 0.42, uh);
        ctx.fillStyle = mix('#3c4a66', '#f4ece0', 0.12);
        ctx.fillRect(ux + uw * 0.48, uy, 0.8 * s, uh); ctx.fillRect(ux, uy + uh * 0.48, uw, 0.8 * s);
        ctx.fillStyle = mix(brick, '#f6efe2', 0.5); ctx.fillRect(ux - 2 * s, uy + uh + 1.2 * s, uw + 4 * s, 1.6 * s);
        ctx.fillStyle = mix(brick, '#f6efe2', 0.35); ctx.fillRect(ux - 2.2 * s, uy - 3 * s, uw + 4.4 * s, 1.8 * s);
      }
    }
    /* shop window: a wide pane of warm light with the machine inside, suggested */
    var gy = base - H * 0.29, gh = H * 0.22, gx = x + w * 0.08, gw = w * 0.56;
    ctx.fillStyle = mix(brick, '#2a1c2c', 0.45); ctx.fillRect(gx - 1.6 * s, gy - 1.6 * s, gw + 3.2 * s, gh + 3.2 * s);
    ctx.fillStyle = lg(ctx, 0, gy, 0, gy + gh, [[0, '#fff2d2'], [0.55, '#ffe7b4'], [1, '#f2cf96']]);
    ctx.fillRect(gx, gy, gw, gh);
    /* a printer and a shelf behind the glass */
    ctx.fillStyle = rgba('#8d96ad', 0.55); ctx.fillRect(gx + gw * 0.12, gy + gh * 0.46, gw * 0.3, gh * 0.3);
    ctx.fillStyle = rgba('#ffffff', 0.75); ctx.fillRect(gx + gw * 0.17, gy + gh * 0.3, gw * 0.18, gh * 0.18);
    ctx.fillStyle = rgba('#6a7694', 0.4); ctx.fillRect(gx + gw * 0.56, gy + gh * 0.26, gw * 0.34, 1.4 * s);
    ctx.fillStyle = rgba('#6a7694', 0.4); ctx.fillRect(gx + gw * 0.56, gy + gh * 0.56, gw * 0.34, 1.4 * s);
    ctx.fillStyle = rgba('#5fc9bd', 0.5); ctx.fillRect(gx + gw * 0.6, gy + gh * 0.08, gw * 0.1, gh * 0.14);
    /* glass sheen */
    ctx.save(); ctx.beginPath(); ctx.rect(gx, gy, gw, gh); ctx.clip();
    ctx.fillStyle = rgba('#ffffff', 0.3);
    ctx.beginPath(); ctx.moveTo(gx + gw * 0.1, gy + gh); ctx.lineTo(gx + gw * 0.42, gy); ctx.lineTo(gx + gw * 0.6, gy); ctx.lineTo(gx + gw * 0.28, gy + gh); ctx.fill();
    ctx.restore();
    ctx.fillStyle = mix(brick, '#2a1c2c', 0.45); ctx.fillRect(gx + gw * 0.49, gy, 1.2 * s, gh);
    ctx.fillStyle = lg(ctx, gx, 0, gx + gw, 0, [[0, mix(b.trim, '#ffffff', 0.3)], [1, mix(b.trim, '#1c1628', 0.25)]]);
    ctx.fillRect(gx - 1.6 * s, gy + gh + 1.6 * s, gw + 3.2 * s, base - (gy + gh) - 1.6 * s);
    ctx.fillStyle = rgba('#ffffff', 0.2); ctx.fillRect(gx - 1.6 * s, gy + gh + 1.6 * s, gw + 3.2 * s, 1 * s);
    /* door */
    var dx = x + w * 0.7, dw = w * 0.19, dy = base - H * 0.28, dh = H * 0.28;
    ctx.fillStyle = mix(brick, '#2a1c2c', 0.4); ctx.fillRect(dx - 1.4 * s, dy - 1.4 * s, dw + 2.8 * s, dh + 1.4 * s);
    ctx.fillStyle = lg(ctx, dx, 0, dx + dw, 0, [[0, mix(b.trim, '#ffffff', 0.25)], [1, mix(b.trim, '#20182c', 0.3)]]);
    ctx.fillRect(dx, dy, dw, dh);
    ctx.fillStyle = rgba('#fff4d8', 0.85); ctx.fillRect(dx + dw * 0.18, dy + dh * 0.1, dw * 0.64, dh * 0.3);
    ctx.fillStyle = rgba('#f6e2a8', 0.9); qdot(ctx, dx + dw * 0.84, dy + dh * 0.56, 0.9 * s);
    /* awning over the window */
    var ay = gy - 2.4 * s, aw = gw + w * 0.05, ax = gx - w * 0.025, ad = H * 0.11;
    ctx.fillStyle = rgba('#2a1c2c', 0.18); ctx.fillRect(ax, ay + ad, aw, 1.6 * s);
    var st = Math.max(3, Math.round(aw / (5 * s)));
    for (i = 0; i < st; i++) {
      ctx.fillStyle = i % 2 ? mix(b.awn, '#ffffff', 0.28) : b.awn;
      ctx.beginPath();
      ctx.moveTo(ax + aw * i / st, ay); ctx.lineTo(ax + aw * (i + 1) / st, ay);
      ctx.lineTo(ax - aw * 0.03 + aw * 1.06 * (i + 1) / st, ay + ad); ctx.lineTo(ax - aw * 0.03 + aw * 1.06 * i / st, ay + ad);
      ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = rgba('#ffffff', 0.35); ctx.fillRect(ax, ay, aw, 1 * s);
    ctx.fillStyle = rgba('#2a1c2c', 0.12);
    ctx.beginPath(); ctx.moveTo(ax - aw * 0.03, ay + ad); ctx.lineTo(ax + aw * 1.03, ay + ad); ctx.lineTo(ax + aw * 1.03, ay + ad + 1.4 * s); ctx.lineTo(ax - aw * 0.03, ay + ad + 1.4 * s); ctx.fill();
    /* hanging sign: a painted board on a bracket, no words */
    var sx = x + w * 0.86, sy = top + H * 0.655;
    ctx.strokeStyle = mix('#5a4a3a', '#ffffff', 0.2); ctx.lineWidth = 0.9 * s;
    ctx.beginPath(); ctx.moveTo(x + w * 0.98, sy - 5 * s); ctx.lineTo(sx, sy - 5 * s); ctx.lineTo(sx, sy - 2.6 * s); ctx.stroke();
    ctx.fillStyle = mix(b.trim, '#2a1c2c', 0.12);
    rrect2(ctx, sx - 5.4 * s, sy - 2.6 * s, 10.8 * s, 8 * s, 1.4 * s); ctx.fill();
    ctx.fillStyle = rgba('#f6efe2', 0.9);
    rrect2(ctx, sx - 4.4 * s, sy - 1.7 * s, 8.8 * s, 6.2 * s, 1 * s); ctx.fill();
    /* the sign's mark: a sheet coming out of a slot */
    ctx.fillStyle = mix(b.awn, '#2a1c2c', 0.1);
    ctx.fillRect(sx - 2.6 * s, sy + 1.4 * s, 5.2 * s, 2.4 * s);
    ctx.fillStyle = rgba('#ffffff', 0.95); ctx.fillRect(sx - 1.8 * s, sy - 0.8 * s, 3.6 * s, 2.4 * s);
    ctx.fillStyle = rgba('#2a1c2c', 0.25); ctx.fillRect(sx - 1.2 * s, sy, 2.4 * s, 0.5 * s);
    /* step */
    ctx.fillStyle = mix('#cfc6b4', '#ffffff', 0.2); ctx.fillRect(dx - 1.6 * s, base, dw + 3.2 * s, 1.8 * s);
  }
  function qdot(ctx, x, y, r) { ctx.beginPath(); qcirc(ctx, x, y, r); ctx.fill(); }
  function rrect2(ctx, x, y, w, h, r) { ctx.beginPath(); rrect(ctx, x, y, w, h, r); }
  /* a granite bollard with a loop of rope */
  function bollard(ctx, x, y, hgt, s) {
    var w = hgt * 0.42;
    ctx.fillStyle = rgba('#2a2a34', 0.2); ctx.beginPath(); qell(ctx, x, y, w * 0.8, w * 0.26, 0); ctx.fill();
    ctx.fillStyle = lg(ctx, x - w / 2, 0, x + w / 2, 0, [[0, '#8e9aa8'], [0.4, '#6e7a88'], [1, '#49535e']]);
    ctx.beginPath();
    ctx.moveTo(x - w * 0.42, y); ctx.lineTo(x - w * 0.36, y - hgt * 0.78);
    ctx.quadraticCurveTo(x - w * 0.5, y - hgt * 0.9, x - w * 0.3, y - hgt);
    ctx.lineTo(x + w * 0.3, y - hgt);
    ctx.quadraticCurveTo(x + w * 0.5, y - hgt * 0.9, x + w * 0.36, y - hgt * 0.78);
    ctx.lineTo(x + w * 0.42, y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = rgba('#ffffff', 0.3); ctx.fillRect(x - w * 0.3, y - hgt * 0.76, w * 0.16, hgt * 0.7);
  }

  /* ============================== layout ============================== */
  var L0 = memo(function (w, h) {
    var s = S(w, h), L = { s: s, w: w, h: h };
    L.hz = h * 0.345;            /* the far shore meets the water */
    L.quay = h * 0.555;          /* the near edge of the water */
    L.walk = h * 0.62;           /* where the promenade starts */
    L.split = w * 0.46;          /* water on the left of this, shops on the right */
    L.vpx = w * 0.3;
    L.shopTop = h * 0.185;
    L.shopBase = h * 0.625;
    L.shops = [
      { x: w * 0.42, w: w * 0.26, brick: '#b8705a', trim: '#3f5f6e', awn: '#1f8f86', seed: 311 },
      { x: w * 0.665, w: w * 0.22, brick: '#9c6a52', trim: '#53466e', awn: '#d98b36', seed: 977 },
      { x: w * 0.87, w: w * 0.2, brick: '#c08268', trim: '#3f5f6e', awn: '#c25a5a', seed: 455 }
    ];
    return L;
  });

  PAINT.harbor = {
    focus: { x: 0.33, y: 0.3 },
    anchors: { water: { y: 0.45 }, shops: { x: 0.68, y: 0.35 }, walk: { y: 0.7 } },
    track: 'morning',
    paint: function (ctx, w, h) {
      try {
        var L = L0(w, h), s = L.s, r = rng(5150), i, x, hz = L.hz, quay = L.quay, walk = L.walk;
        mark('start', ctx);
        /* ---------- sky ---------- */
        var SKY = [[0, '#67a9e0'], [0.3, '#95c6ec'], [0.62, '#cfe4f4'], [1, '#f6ecd8']];
        ctx.fillStyle = lg(ctx, 0, 0, 0, hz, SKY); ctx.fillRect(0, 0, w, hz + 2);
        skyStrokes(ctx, 0, w, 0, hz, SKY, 200, r, s, 0.1, '#fff0d0', '#5e9fd8');
        glow(ctx, w * 0.2, h * 0.06, w * 0.75, '#fff6e2', 0.4);
        for (i = 0; i < 5; i++) wisp(ctx, w * (0.1 + r() * 0.8), h * (0.05 + r() * 0.12), w * 0.4, h * 0.006, '#ffffff', 0.26, r);
        var cls = [[0.16, 0.1, 0.42, 0.044], [0.56, 0.14, 0.4, 0.04], [0.86, 0.075, 0.3, 0.03]];
        for (i = 0; i < cls.length; i++) cloudForm(ctx, w * cls[i][0], h * cls[i][1], w * cls[i][2], h * cls[i][3], r,
          { lit: '#ffffff', mid: '#f2f6fb', shade: '#a8bed8', top: '#fff4de', al: 0.95, lx: -0.6, ly: -0.8, base: 0.6, seam: 0.12 });
        mark('sky', ctx);
        /* ---------- the far shore across the water ---------- */
        var E = { s: s, W: w, vpX: L.vpx, haze: '#d8e6f0', face: '#aebdd2', lit: '#f8f4ec', shade: '#8a9cbc', rim: '#ffffff',
          glass: ['#9cc8ee', '#c8e2f4', '#e4eff6'], win: '#6a80a4', winLit: '#ffe6a8', mull: '#5e7298',
          green: ['#2c5444', '#3c7450', '#5c9858', '#9cc86a', '#e8f4b0'] };
        band(ctx, 0, w, hz - h * 0.06, hz + h * 0.004, '#ffeccc', 0.3);
        var far = rng(5161);
        for (x = -w * 0.02; x < w * 1.02;) {
          var bw = (7 + far() * 12) * s, bh = h * (0.01 + far() * 0.026 + 0.04 * Math.sin(clamp(x / w, 0, 1) * PI));
          tower(ctx, { x: x, w: bw, top: hz - bh, base: hz, kind: far() < 0.5 ? 'glass' : 'stone', k: 0.76, seed: (x * 11) | 0 }, E);
          x += bw * (0.84 + far() * 0.4);
        }
        var M = [{ x: 0.05, w: 0.06, t: 0.2, kind: 'stone', roofTrees: 2 }, { x: 0.13, w: 0.052, t: 0.175, kind: 'glass' },
          { x: 0.2, w: 0.062, t: 0.155, kind: 'glass', turb: 1 }, { x: 0.285, w: 0.05, t: 0.19, kind: 'stone', solar: 1 },
          { x: 0.35, w: 0.055, t: 0.168, kind: 'glass' }, { x: 0.43, w: 0.05, t: 0.2, kind: 'stone', roofTrees: 2 }];
        for (i = 0; i < M.length; i++) tower(ctx, { x: w * M[i].x, w: w * M[i].w, top: h * M[i].t, base: hz, kind: M[i].kind,
          k: 0.4, seed: 900 + i * 37, roofTrees: M[i].roofTrees, solar: M[i].solar, turb: M[i].turb }, E);
        treeRow(ctx, -w * 0.02, w * 1.02, function () { return hz + h * 0.002; }, 2 * s, 3.6 * s,
          ['#4a6a5c', '#5a7e60', '#7a9a6a', '#a8c080', '#e8f0c0'], r, -0.6, -0.8, 0.6);
        mark('skyline', ctx);
        /* ---------- the water ---------- */
        ctx.fillStyle = lg(ctx, 0, hz, 0, quay, [[0, '#9ec8e0'], [0.4, '#6ea8cc'], [1, '#3f7aa6']]);
        ctx.fillRect(0, hz, w, quay - hz + 1);
        reflect(ctx, w, hz, quay, 0.4, 1.4 * s, 0.5 / s, 11, 1.5);
        band(ctx, 0, w, hz, hz + h * 0.02, '#ffeccc', 0.22);
        /* the sun's road on the water */
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = lg(ctx, 0, hz, 0, quay, [[0, rgba('#fff2cc', 0.17)], [1, rgba('#fff2cc', 0)]]);
        ctx.beginPath(); ctx.moveTo(w * 0.12, hz); ctx.lineTo(w * 0.28, hz); ctx.lineTo(w * 0.46, quay); ctx.lineTo(w * -0.08, quay); ctx.fill();
        ctx.restore();
        batch(ctx, 900, [['#ffffff', 0.55 * s, 0.5], ['#235f8c', 0.7 * s, 0.3], ['#bfe6f6', 0.55 * s, 0.4]], function () {
          var yy = lerp(hz + h * 0.004, quay, Math.pow(r(), 0.7)), p = (yy - hz) / (quay - hz);
          var ln = (3 + r() * 16) * s * (0.4 + p * 1.5), xx = r() * w;
          return [xx, yy, xx + ln, yy, (r() * 3) | 0];
        });
        dots(ctx, 130, [['#ffffff', 0.6], ['#fff6d8', 0.5]], function () {
          var yy = lerp(hz, quay, Math.pow(r(), 0.8)), p = (yy - hz) / (quay - hz);
          var xx = lerp(w * 0.02, w * 0.46, r());
          return [xx, yy, (0.35 + r() * 0.6) * s * (0.5 + p), r() < 0.7 ? 0 : 1];
        });
        /* two moored boats */
        ctx.save();
        boat(ctx, w * 0.1, hz + (quay - hz) * 0.3, 9 * s, '#fdfbf4', '#3f6f8e', '#e2e8ee');
        boat(ctx, w * 0.3, hz + (quay - hz) * 0.46, 11 * s, '#fdfbf4', '#b4603f', '#e2e8ee');
        ctx.restore();
        mark('water', ctx);
        /* ---------- the granite quay wall and the promenade ---------- */
        ctx.fillStyle = lg(ctx, 0, quay, 0, walk, [[0, '#6d6f74'], [0.35, '#8e8d8c'], [1, '#a8a49c']]);
        ctx.fillRect(0, quay, w, walk - quay + 1);
        rects(ctx, 160, [['#b9b4a8', 0.3], ['#5e6066', 0.26], ['#d6d0c2', 0.2]], function () {
          var yy = lerp(quay + 1 * s, walk - 1.2 * s, r());
          return [r() * w, yy, (10 + r() * 24) * s, (2 + r() * 2.4) * s, (r() * 3) | 0];
        });
        ctx.fillStyle = rgba('#2e3038', 0.3); ctx.fillRect(0, quay, w, 1.6 * s);
        ctx.fillStyle = rgba('#fff6e0', 0.5); ctx.fillRect(0, quay + 1.6 * s, w, 1 * s);
        /* promenade pavers, joints running back to the vanishing point */
        ctx.fillStyle = lg(ctx, 0, walk, 0, h, [[0, '#cfc7b6'], [0.3, '#ded5c2'], [0.78, '#d2c8b4'], [1, '#bdb29c']]);
        ctx.fillRect(0, walk - 1, w, h - walk + 1);
        ctx.save(); ctx.beginPath(); ctx.rect(0, walk, w, h - walk); ctx.clip();
        ctx.strokeStyle = rgba('#a89c86', 0.5); ctx.lineWidth = Math.max(0.6, 0.7 * s);
        for (i = -8; i <= 18; i++) {
          var px = w * (i / 10), ex = L.vpx + (px - L.vpx) * 0.12;
          ctx.beginPath(); ctx.moveTo(px, h); ctx.lineTo(ex, walk); ctx.stroke();
        }
        for (i = 0; i < 9; i++) {
          var t2 = i / 8, yy2 = walk + (h - walk) * Math.pow(t2, 1.8);
          ctx.beginPath(); ctx.moveTo(0, yy2); ctx.lineTo(w, yy2); ctx.stroke();
        }
        rects(ctx, 150, [['#e8e0cc', 0.3], ['#a89c86', 0.22], ['#f4ecd8', 0.22]], function () {
          var yy = lerp(walk, h, Math.pow(r(), 0.6));
          return [r() * w, yy, (12 + r() * 40) * s, (2.4 + r() * 4) * s, (r() * 3) | 0];
        });
        ctx.restore();
        /* a warm pool of morning light across the promenade */
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = rg(ctx, w * 0.22, walk + (h - walk) * 0.35, w * 0.05, w * 0.6,
          [[0, rgba('#fff0c8', 0.26)], [0.5, rgba('#fff0c8', 0.12)], [1, rgba('#fff0c8', 0)]]);
        ctx.fillRect(0, walk - h * 0.02, w, h);
        ctx.restore();
        mark('ground', ctx);
        /* ---------- the shop row ---------- */
        for (i = 0; i < L.shops.length; i++) {
          var sh = L.shops[i];
          shop(ctx, { x: sh.x, w: sh.w, top: L.shopTop + (i % 2) * h * 0.022, base: L.shopBase, brick: sh.brick,
            trim: sh.trim, awn: sh.awn, seed: sh.seed }, E);
        }
        /* the shops' shadow on the promenade */
        for (i = 0; i < 24; i++) {
          var fx = w * 0.4 + i * w * 0.028, fa = Math.min(1, i / 7);
          ctx.fillStyle = lg(ctx, 0, L.shopBase, 0, L.shopBase + h * 0.034, [[0, rgba('#4a3c38', 0.3 * fa)], [1, rgba('#4a3c38', 0)]]);
          ctx.fillRect(fx, L.shopBase, w * 0.029, h * 0.034);
        }
        mark('shops', ctx);
        /* ---------- railing along the water side ---------- */
        var ry = walk - h * 0.012, rh = h * 0.055;
        ctx.strokeStyle = mix('#3e4852', '#ffffff', 0.12); ctx.lineWidth = Math.max(1.4, 2.1 * s); ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-w * 0.02, ry - rh); ctx.lineTo(w * 0.47, ry - rh * 0.86); ctx.stroke();
        ctx.lineWidth = Math.max(1, 1.4 * s);
        ctx.beginPath(); ctx.moveTo(-w * 0.02, ry - rh * 0.55); ctx.lineTo(w * 0.47, ry - rh * 0.48); ctx.stroke();
        for (i = 0; i < 8; i++) {
          var rx = w * (-0.02 + i * 0.07);
          ctx.beginPath(); ctx.moveTo(rx, ry - rh * (1 - i * 0.02)); ctx.lineTo(rx, ry); ctx.stroke();
        }
        ctx.strokeStyle = rgba('#ffffff', 0.4); ctx.lineWidth = Math.max(0.7, 0.9 * s);
        ctx.beginPath(); ctx.moveTo(-w * 0.02, ry - rh - 0.9 * s); ctx.lineTo(w * 0.47, ry - rh * 0.86 - 0.9 * s); ctx.stroke();
        /* bollards and a planter */
        bollard(ctx, w * 0.07, walk + (h - walk) * 0.3, h * 0.052, s);
        bollard(ctx, w * 0.3, walk + (h - walk) * 0.18, h * 0.04, s);
        ctx.fillStyle = rgba('#5a4a3c', 0.22); ctx.beginPath(); qell(ctx, w * 0.9, h * 0.908, w * 0.1, h * 0.012, 0); ctx.fill();
        frondPlant(ctx, w * 0.9, h * 0.845, h * 0.058, 15, ['#2e5a46', '#3e7a54', '#5fa05e', '#92c070', '#d6ecaa'], 7711, 2.6, -PI / 2, s, -0.6, -0.8);
        ctx.fillStyle = lg(ctx, w * 0.83, 0, w * 0.97, 0, [[0, '#cfc5b2'], [0.45, '#efe7d4'], [1, '#b8ad96']]);
        ctx.beginPath(); rrect(ctx, w * 0.835, h * 0.845, w * 0.13, h * 0.062, h * 0.006); ctx.fill();
        ctx.fillStyle = rgba('#7a6a52', 0.28); ctx.fillRect(w * 0.835, h * 0.845, w * 0.13, 1.6 * s);
        ctx.fillStyle = rgba('#ffffff', 0.35); ctx.fillRect(w * 0.835, h * 0.845 + 1.6 * s, w * 0.13, 0.9 * s);
        ctx.save(); ctx.globalAlpha = 0.16; ctx.strokeStyle = '#6a5c4c'; ctx.lineWidth = Math.max(1.2, 1.8 * s); ctx.lineCap = 'round';
        for (i = 0; i < 9; i++) {
          var sx2 = w * (-0.02 + i * 0.07), sy2 = ry;
          ctx.beginPath(); ctx.moveTo(sx2, sy2 + h * 0.005); ctx.lineTo(sx2 + h * 0.055, sy2 + h * 0.075); ctx.stroke();
        }
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.3; ctx.fillStyle = '#9b907c';
        ctx.beginPath(); rrect(ctx, w * 0.23, h * 0.86, w * 0.17, h * 0.03, h * 0.004); ctx.fill();
        ctx.globalAlpha = 0.42; ctx.fillStyle = '#7d7261';
        for (i = 0; i < 5; i++) ctx.fillRect(w * 0.245 + i * w * 0.031, h * 0.864, w * 0.018, h * 0.022);
        ctx.restore();
        mark('props', ctx);
        finish(ctx, w, h, '#ffe9c4', 0.14, 0.16, 0.05, '#2a2436', 0.4);
        mark('finish', ctx);
      } catch (e) { PAINT._err = 'harbor paint: ' + String(e && e.stack || e); }
    },
    overlay: function (ctx, w, h, t) {
      try {
        var L = L0(w, h), s = L.s, hz = L.hz, quay = L.quay, i;
        /* water shimmer: a few bright dashes drifting along the sun's road */
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
        for (i = 0; i < 26; i++) {
          var ph = i * 0.618, yy = hz + (quay - hz) * (0.12 + ((ph + t * 0.016) % 1) * 0.86);
          var p = (yy - hz) / (quay - hz), xx = w * (0.02 + ((Math.sin(i * 2.3) + 1) * 0.5) * 0.44) + Math.sin(t * 0.5 + i) * 3 * s * p;
          var a = (0.1 + 0.14 * (0.5 + 0.5 * Math.sin(t * 1.1 + i * 1.7))) * (0.4 + p);
          ctx.strokeStyle = rgba('#fff6d8', a); ctx.lineWidth = Math.max(0.8, 1.2 * s * (0.5 + p));
          ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx + (5 + 11 * p) * s, yy); ctx.stroke();
        }
        ctx.restore();
        /* two gulls gliding across the sky */
        ctx.save(); ctx.strokeStyle = rgba('#f6f8fb', 0.75); ctx.lineWidth = Math.max(0.8, 1 * s); ctx.lineCap = 'round';
        for (i = 0; i < 2; i++) {
          var u = ((t * 0.018 + i * 0.5) % 1.25) - 0.12;
          drawBird(ctx, w * (1.08 - u * 1.2), h * (0.1 + i * 0.045) + Math.sin(t * 0.6 + i * 2) * h * 0.006, (2.4 + i * 0.7) * s, t * 2.2 + i * 1.3);
        }
        ctx.restore();
        /* the shop windows breathe, very slightly */
        var sp = glowSpr('#ffe9b8');
        if (sp) {
          ctx.save(); ctx.globalCompositeOperation = 'lighter';
          for (i = 0; i < L.shops.length; i++) {
            var sh = L.shops[i], gy = L.shopBase - (L.shopBase - L.shopTop) * 0.44 + (L.shopBase - L.shopTop) * 0.15;
            var R = sh.w * 0.42 * (1 + 0.03 * Math.sin(t * 0.45 + i * 1.7));
            ctx.globalAlpha = 0.1 + 0.05 * Math.sin(t * 0.45 + i * 1.7);
            ctx.drawImage(sp, sh.x + sh.w * 0.34 - R, gy - R, R * 2, R * 2);
          }
          ctx.restore();
        }
      } catch (e) { PAINT._err = 'harbor overlay: ' + String(e && e.stack || e); }
    }
  };

  /* the entry points leave the caller's canvas state untouched */
  (function (k) {
    var S0 = PAINT[k], p0 = S0.paint, o0 = S0.overlay;
    S0.paint = function (ctx, w, h) { ctx.save(); try { p0(ctx, w, h); } finally { ctx.restore(); } };
    S0.overlay = function (ctx, w, h, t) { ctx.save(); try { o0(ctx, w, h, t); } finally { ctx.restore(); } };
  })('harbor');

  /* tappable things along Harbor Row */
  LATE.push(function () {
    if (typeof PROPS === 'undefined') return;
    PROPS.harbor = [
      { id: 'pigeon', x: 12, y: 90, w: 44, sfx: 'flap', fx: 'flyaway' },
      { id: 'robot', x: 22, y: 78, w: 42, sfx: 'beep', fx: 'spin' },
      { id: 'plant', x: 93, y: 84, w: 50, sfx: 'rustle', fx: 'wiggle', burst: 'leaves' },
      { id: 'person', x: 34, y: 81, w: 50, talk: 'harbor', look: { skin: '#c98e64', shirt: '#1f8f86', hair: '#1b1410' } },
      { id: 'person', x: 46, y: 78, w: 46, talk: 'harbor', look: { skin: '#f6d2bd', shirt: '#d98b36', hair: '#6b4a2a' } }
    ];
  });
})();
