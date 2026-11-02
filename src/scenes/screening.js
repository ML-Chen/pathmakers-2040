/* screening.js - PAINT.screening: the biosecurity screening office on the Boston waterfront.
   A calm, bright, hopeful workplace: harbor windows in late-morning light, warm wood, indoor
   plants, a long desk of softly glowing screens and a wall of small, mostly-green status lights.
   Contract (see paint_boston.js): window.PAINT.screening = { paint(ctx,w,h), overlay(ctx,w,h,t), focus }.
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

  /* ============================== scene pieces ============================== */
  /* a compact harbor tower: two faces, a window grid, a rim light and an optional green roof.
     b {x,w,top,base,kind,k(haze),seed,roofTrees,turb,solar}; E {s,haze,face,shade,lit,glass,win,winLit,rim,mull,green} */
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
  /* a potted plant of leaf fronds, shaded leaf by leaf toward the light; pal: 5 greens, dark to pale */
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
  function vines(ctx, x0, x1, y, n, len, cols, seed, s) {
    var r = rng(seed), V = [], i, q;
    ctx.strokeStyle = cols[0]; ctx.lineWidth = Math.max(0.6, 0.9 * s); ctx.beginPath();
    for (i = 0; i < n; i++) {
      var x = lerp(x0, x1, (i + 0.5) / n + (r() - 0.5) * 0.06), L = len * (0.5 + r() * 0.75), sway = (r() - 0.5) * 8 * s;
      ctx.moveTo(x, y); ctx.quadraticCurveTo(x + sway, y + L * 0.55, x + sway * 1.6, y + L);
      V.push([x, y, L, sway]);
    }
    ctx.stroke();
    for (q = 1; q < 3; q++) {
      ctx.fillStyle = cols[q]; ctx.beginPath();
      for (i = 0; i < V.length; i++) {
        var V2 = V[i];
        for (var j = 1; j < 9; j++) {
          if ((j + q) % 2) continue;
          var u = j / 9, lx = V2[0] + V2[3] * u * 1.6, ly = V2[1] + V2[2] * u, sz = (3.4 - j * 0.18) * s;
          lens(ctx, lx, ly, sz, sz * 0.45, PI / 2 + (j % 2 ? -1 : 1) * 0.95);
        }
      }
      ctx.fill();
    }
  }
  /* a desk display: a thin pane of glass the harbor shows through, lit from inside. No text anywhere:
     the readout is soft bars, a calm wave and a ring of light. */
  function screenPanel(ctx, x, y, w, h, s, tint, seed) {
    var r = rng(seed), q;
    ctx.save();
    // slim stand and the shadow it drops on the desk
    ctx.fillStyle = 'rgba(120,120,115,0.35)'; ctx.fillRect(x + w * 0.45, y + h, w * 0.1, 5 * s);
    ctx.fillStyle = 'rgba(95,80,65,0.22)'; ctx.beginPath(); ctx.ellipse(x + w / 2, y + h + 5.5 * s, w * 0.28, 2 * s, 0, 0, TAU); ctx.fill();
    // glass
    ctx.beginPath(); rrect(ctx, x, y, w, h, 2.6 * s);
    ctx.save(); ctx.clip();
    ctx.fillStyle = lg(ctx, x, y, x + w * 0.25, y + h, [[0, rgba(mix(tint, '#ffffff', 0.5), 0.72)], [0.5, rgba(tint, 0.62)], [1, rgba(mix(tint, '#1d5f72', 0.45), 0.66)]]);
    ctx.fillRect(x, y, w, h);
    // a calm field of soft bars: a long list of orders, read as light, never as letters
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath(); rrect(ctx, x + w * 0.08, y + h * 0.1, w * 0.4, h * 0.05, h * 0.025); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.beginPath();
    for (q = 0; q < 6; q++) rrect(ctx, x + w * 0.08, y + h * (0.22 + q * 0.085), w * (0.3 + r() * 0.52), h * 0.036, h * 0.018);
    ctx.fill();
    // steady green ticks beside the rows
    ctx.fillStyle = 'rgba(118,226,166,0.8)'; ctx.beginPath();
    for (q = 0; q < 6; q++) qcirc(ctx, x + w * 0.9, y + h * (0.238 + q * 0.085), 1.5 * s);
    ctx.fill();
    // a slow wave of light along the bottom
    ctx.fillStyle = 'rgba(190,245,240,0.3)';
    ctx.beginPath(); ctx.moveTo(x, y + h);
    for (q = 0; q <= 12; q++) ctx.lineTo(x + w * q / 12, y + h * (0.86 + 0.05 * Math.sin(q * 0.8 + seed)));
    ctx.lineTo(x + w, y + h); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = Math.max(0.6, 0.7 * s); ctx.beginPath();
    for (q = 0; q <= 12; q++) { var wy = y + h * (0.86 + 0.05 * Math.sin(q * 0.8 + seed)); if (q) ctx.lineTo(x + w * q / 12, wy); else ctx.moveTo(x, wy); }
    ctx.stroke();
    softGlow(ctx, x + w * 0.5, y + h * 0.9, w * 0.55, '#d8fbff', 0.3);
    // sheen across the glass
    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    ctx.beginPath(); ctx.moveTo(x + w * 0.58, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w * 0.5, y + h); ctx.lineTo(x + w * 0.16, y + h); ctx.fill();
    ctx.restore();
    // rim
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = Math.max(0.7, 1 * s);
    ctx.beginPath(); rrect(ctx, x, y, w, h, 2.6 * s); ctx.stroke();
    ctx.strokeStyle = 'rgba(70,120,140,0.18)'; ctx.lineWidth = Math.max(0.5, 0.6 * s);
    ctx.beginPath(); rrect(ctx, x + 1.4 * s, y + 1.4 * s, w - 2.8 * s, h - 2.8 * s, 2 * s); ctx.stroke();
    ctx.restore();
  }

  /* ============================== layout ============================== */
  var L0 = memo(function (w, h) {
    var s = S(w, h), L = {
      s: s,
      ceil: h * 0.042,          // bottom of the ceiling soffit
      head: h * 0.062,          // window head
      sill: h * 0.492,          // window sill
      hz: h * 0.247,            // harbor horizon
      wx0: 0, wx1: w * 0.695,   // glass wall (runs off the left edge)
      cx0: w * 0.695, cx1: w * 0.757, // column between glass and the status wall
      rw0: w * 0.757,           // right wall
      deskBack: h * 0.598, deskFront: h * 0.676, deskBase: h * 0.83,
      mull: [0.085, 0.235, 0.385, 0.535, 0.688], trans: [0.148, 0.342],
      board: [w * 0.787, h * 0.108, w * 0.198, h * 0.196],
      shelf: h * 0.392
    };
    L.vpx = w * 0.42; L.vpy = h * 0.45;
    // the wall of small status lights: two columns of slots, nearly all of them calm green
    var B = L.board, cols = 2, rows = 8, i;
    L.lights = [];
    for (i = 0; i < cols * rows; i++) {
      var ci = i % cols, ri = (i / cols) | 0, hv = hash(i, 801);
      L.lights.push([B[0] + 11 * s + (B[2] - 22 * s) * ci, B[1] + 12 * s + (B[3] - 24 * s) * ri / (rows - 1),
        hv > 0.94 ? '#f2b24a' : hv > 0.86 ? '#4ec8c8' : '#57c98a']);
    }
    return L;
  });

  PAINT.screening = {
    focus: { x: 0.42, y: 0.2 },
    anchors: { window: { x: 0.35, y: 0.25 }, desk: { y: 0.598 }, board: { x: 0.885, y: 0.218 } },
    paint: function (ctx, w, h) {
      try {
        var L = L0(w, h), s = L.s, r = rng(80101), i, x, y, hz = L.hz, sill = L.sill;
        mark('start', ctx);
        /* ---------- room shell, so nothing is ever bare ---------- */
        ctx.fillStyle = lg(ctx, 0, 0, 0, h, [[0, '#efe7db'], [0.5, '#f6efe4'], [1, '#e4d8c6']]); ctx.fillRect(0, 0, w, h);

        /* ---------- the view through the glass ---------- */
        ctx.save(); ctx.beginPath(); ctx.rect(L.wx0, L.head, L.wx1 - L.wx0, sill - L.head); ctx.clip();
        var SKY = [[0, '#4f98de'], [0.35, '#7cb6ea'], [0.7, '#bcdcf2'], [1, '#e8f4f6']];
        ctx.fillStyle = lg(ctx, 0, L.head, 0, hz, SKY); ctx.fillRect(0, L.head - 2, w, hz - L.head + 4);
        skyStrokes(ctx, 0, L.wx1, L.head, hz, SKY, 180, r, s, 0.1, '#ffffff', '#4a88d0');
        glow(ctx, w * 0.58, h * 0.03, w * 0.62, '#fff8e8', 0.34);
        for (i = 0; i < 4; i++) wisp(ctx, w * (0.05 + r() * 0.6), h * (0.09 + r() * 0.1), w * 0.36, h * 0.006, '#ffffff', 0.28, r);
        var cls = [[0.2, 0.125, 0.4, 0.045], [0.52, 0.165, 0.34, 0.04], [0.62, 0.09, 0.26, 0.028]];
        for (i = 0; i < cls.length; i++) cloudForm(ctx, w * cls[i][0], h * cls[i][1], w * cls[i][2], h * cls[i][3], r,
          { lit: '#ffffff', mid: '#eef4fa', shade: '#a4bad8', top: '#ffffff', al: 0.95, lx: 0.5, ly: -0.85, base: 0.6, seam: 0.12 });
        mark('sky', ctx);
        var E = { s: s, W: w, vpX: L.vpx, haze: '#d4e6f2', face: '#a6bad2', lit: '#f8f4ec', shade: '#8094b8', rim: '#ffffff',
          glass: ['#94c4ec', '#c4e0f2', '#e2eef4'], win: '#6a80a4', winLit: '#ffe6a8', mull: '#5a7098',
          green: ['#2c5444', '#3c7450', '#5c9858', '#9cc86a', '#e8f4b0'] };
        // offshore wind farm far out on the water (right of the channel)
        ctx.strokeStyle = 'rgba(240,248,252,0.85)'; ctx.lineWidth = Math.max(0.6, 0.5 * s);
        for (i = 0; i < 6; i++) {
          var tx = w * (0.4 + i * 0.05), th = h * (0.022 + (i % 2) * 0.004), ta = r() * TAU;
          ctx.beginPath(); ctx.moveTo(tx, hz); ctx.lineTo(tx, hz - th);
          for (var bl = 0; bl < 3; bl++) { var aa = ta + bl * TAU / 3; ctx.moveTo(tx, hz - th); ctx.lineTo(tx + Math.cos(aa) * th * 0.4, hz - th + Math.sin(aa) * th * 0.4); }
          ctx.stroke();
        }
        band(ctx, 0, L.wx1, hz - h * 0.07, hz + h * 0.005, '#ffe8c8', 0.28);
        // skyline across the harbor: hazy far city, a taller downtown cluster left of centre
        var far = rng(80111);
        for (x = -w * 0.02; x < L.wx1 + w * 0.02;) {
          var bw = (8 + far() * 13) * s, bh = h * (0.012 + far() * 0.03 + 0.055 * Math.sin(clamp((x / L.wx1 - 0.05) / 0.9, 0, 1) * PI));
          tower(ctx, { x: x, w: bw, top: hz - bh, base: hz, kind: far() < 0.5 ? 'glass' : 'stone', k: 0.72, seed: (x * 7) | 0 }, E);
          x += bw * (0.82 + far() * 0.45);
        }
        var M = [
          { x: 0.03, w: 0.055, t: 0.158, kind: 'stone', roofTrees: 2 }, { x: 0.1, w: 0.05, t: 0.133, kind: 'glass' },
          { x: 0.163, w: 0.062, t: 0.112, kind: 'glass', turb: 1 }, { x: 0.237, w: 0.05, t: 0.145, kind: 'stone', solar: 1 },
          { x: 0.3, w: 0.058, t: 0.125, kind: 'glass' }, { x: 0.372, w: 0.052, t: 0.16, kind: 'stone', roofTrees: 3 },
          { x: 0.44, w: 0.06, t: 0.142, kind: 'glass' }, { x: 0.52, w: 0.048, t: 0.168, kind: 'stone' },
          { x: 0.58, w: 0.058, t: 0.15, kind: 'glass', turb: 1 }, { x: 0.65, w: 0.05, t: 0.172, kind: 'stone', roofTrees: 2 }
        ];
        for (i = 0; i < M.length; i++) {
          var m = M[i];
          tower(ctx, { x: w * m.x, w: w * m.w, top: h * m.t, base: hz, kind: m.kind, k: 0.3 + (i % 3) * 0.06, seed: 80200 + i * 7, roofTrees: m.roofTrees, turb: m.turb, solar: m.solar }, E);
        }
        // low waterfront: pier sheds and a green shore walk
        var fr = rng(80131);
        for (x = -w * 0.02; x < L.wx1 + w * 0.02;) {
          var hw = (7 + fr() * 6) * s, hh = (5 + fr() * 7) * s;
          ctx.fillStyle = lg(ctx, 0, hz - hh, 0, hz, [[0, mix(['#c08a74', '#b9a08c', '#cfae96'][(fr() * 3) | 0], '#fff0e0', 0.3)], [1, '#d4e6f2']]);
          ctx.fillRect(x, hz - hh, hw + 0.5, hh);
          ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillRect(x, hz - hh, hw, 0.8 * s);
          x += hw;
        }
        treeRow(ctx, -w * 0.02, L.wx1 + w * 0.02, function () { return hz + h * 0.002; }, 2.2 * s, 4 * s, ['#4a6a5c', '#5a7e60', '#7a9a6a', '#a8c080', '#e8f0c0'], r, 0.6, -0.8, 0.6);
        band(ctx, 0, L.wx1, hz - h * 0.04, hz + h * 0.01, '#e4eef4', 0.55);
        mark('skyline', ctx);
        // harbor water
        ctx.fillStyle = lg(ctx, 0, hz, 0, sill, [[0, '#8ec3e0'], [0.25, '#4f96c8'], [0.7, '#2e78ae'], [1, '#22639c']]);
        ctx.fillRect(0, hz, L.wx1, sill - hz);
        reflect(ctx, w, hz, sill, 0.34, 1.8 * s, 1.1 / s, 2, 1.1);
        ctx.fillStyle = lg(ctx, 0, hz, 0, sill, [[0, 'rgba(170,215,238,0.18)'], [1, 'rgba(22,85,135,0.4)']]); ctx.fillRect(0, hz, L.wx1, sill - hz);
        batch(ctx, 1100, [['#ffffff', 0.6 * s, 0.5], ['#1e5a8a', 0.8 * s, 0.35], ['#bfe6f6', 0.6 * s, 0.4]], function () {
          var p = Math.pow(r(), 1.2), yy = hz + 1 + p * (sill - hz), xx = r() * L.wx1, l = (1 + p * 11 + r() * 5) * s;
          return [xx, yy, xx + l, yy + (r() - 0.5) * 0.4 * s, (r() * 3) | 0];
        });
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = lg(ctx, w * 0.3, 0, w * 0.72, 0, [[0, 'rgba(255,240,210,0)'], [0.5, 'rgba(255,240,210,0.2)'], [1, 'rgba(255,240,210,0)']]);
        ctx.fillRect(w * 0.3, hz, w * 0.42, sill - hz);
        ctx.restore();
        dots(ctx, 300, [['#ffffff', 0.85], ['#fff6d8', 0.7]], function () {
          var p = r(), yy = hz + p * (sill - hz), xx = w * 0.5 + (r() - 0.5) * w * (0.1 + p * 0.5);
          return [xx, yy, (0.4 + r() * 0.7 * (0.3 + p)) * s, r() < 0.5 ? 0 : 1];
        });
        // moored sailboats and a channel buoy
        var bts = [[0.13, 0.3, 3.4], [0.33, 0.315, 4], [0.56, 0.345, 4.6], [0.2, 0.395, 6]];
        for (i = 0; i < bts.length; i++) {
          var bx = w * bts[i][0], by = h * bts[i][1], bs = bts[i][2] * s;
          ctx.save(); ctx.translate(bx, by); ctx.scale(1, -0.7); ctx.globalAlpha = 0.25; boat(ctx, 0, 0, bs, '#ffffff', '#2a4a6a'); ctx.restore();
          boat(ctx, bx, by, bs, '#ffffff', i % 2 ? '#16b3a6' : '#2a4a6a', '#e4eef8');
        }
        ctx.fillStyle = '#e8584a'; ctx.beginPath(); ctx.moveTo(w * 0.44, h * 0.43); ctx.lineTo(w * 0.452, h * 0.43); ctx.lineTo(w * 0.449, h * 0.417); ctx.lineTo(w * 0.443, h * 0.417); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(w * 0.4425, h * 0.4255, 0.7 * w * 0.012, 1.2 * s);
        ctx.restore();
        mark('water', ctx);

        /* ---------- the glass wall itself ---------- */
        ctx.save(); ctx.beginPath(); ctx.rect(L.wx0, L.head, L.wx1 - L.wx0, sill - L.head); ctx.clip();
        ctx.globalCompositeOperation = 'lighter';
        for (i = 0; i < 3; i++) {
          var sx0 = w * (0.04 + i * 0.26);
          ctx.fillStyle = 'rgba(255,255,255,0.03)';
          ctx.beginPath(); ctx.moveTo(sx0, L.head); ctx.lineTo(sx0 + w * 0.07, L.head); ctx.lineTo(sx0 + w * 0.2, sill); ctx.lineTo(sx0 + w * 0.12, sill); ctx.fill();
        }
        ctx.restore();
        // mullions, transoms, head beam
        ctx.fillStyle = '#ffffff';
        for (i = 0; i < L.mull.length; i++) { var mx = w * L.mull[i], mw = (i === L.mull.length - 1 ? 4.6 : 3.2) * s; ctx.fillRect(mx - mw / 2, L.head, mw, sill - L.head); }
        for (i = 0; i < L.trans.length; i++) ctx.fillRect(L.wx0, h * L.trans[i] - 1.3 * s, L.wx1 - L.wx0, 2.6 * s);
        ctx.fillStyle = 'rgba(90,120,150,0.16)';
        for (i = 0; i < L.mull.length; i++) ctx.fillRect(w * L.mull[i] + 1.5 * s, L.head, 1 * s, sill - L.head);
        for (i = 0; i < L.trans.length; i++) ctx.fillRect(L.wx0, h * L.trans[i] + 1.3 * s, L.wx1 - L.wx0, 0.9 * s);
        ctx.fillStyle = '#f4f0e8'; ctx.fillRect(L.wx0, L.head - 3 * s, L.wx1 - L.wx0, 5 * s);
        // sill: pale stone shelf with a long low planter
        ctx.fillStyle = lg(ctx, 0, sill - 2 * s, 0, sill + 9 * s, [[0, '#ffffff'], [1, '#ded5c6']]); ctx.fillRect(L.wx0, sill - 2 * s, L.wx1 - L.wx0, 11 * s);
        ctx.fillStyle = 'rgba(120,110,100,0.22)'; ctx.fillRect(L.wx0, sill + 9 * s, L.wx1 - L.wx0, 2 * s);
        var ppal = ['#1e4430', '#2c683c', '#4a9a48', '#8acb5a', '#e0f6a8'];
        for (x = L.wx0 + 2 * s; x < L.wx1; x += (8 + r() * 6) * s) clump(ctx, x, sill - 4 * s - r() * 3 * s, (6 + r() * 4.5) * s, ppal, r, 0.6, -0.8, false, 0.7);
        dots(ctx, 50, [['#ffffff', 1], ['#ff8aa8', 1], ['#ffd35a', 1]], function () { return [lerp(L.wx0, L.wx1, r()), sill - (4 + r() * 9) * s, (1 + r() * 1.1) * s, (r() * 3) | 0]; });
        mark('glass', ctx);

        /* ---------- ceiling soffit, cove light, two slim pendants ---------- */
        ctx.fillStyle = lg(ctx, 0, 0, 0, L.ceil, [[0, '#e6ddcf'], [1, '#faf5ec']]); ctx.fillRect(0, 0, w, L.ceil + 1);
        ctx.fillStyle = 'rgba(255,236,200,0.5)'; ctx.fillRect(0, L.ceil - 2.2 * s, w, 2.2 * s);
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; band(ctx, 0, w, L.ceil, L.ceil + h * 0.035, '#ffe8c0', 0.22); ctx.restore();
        [[0.16, 0.135, 0.95], [0.46, 0.105, 0.8]].forEach(function (Q) {
          var gx = w * Q[0], gy = h * Q[1], gr2 = 6.5 * s * Q[2];
          ctx.strokeStyle = 'rgba(80,90,110,0.45)'; ctx.lineWidth = 0.8 * s; ctx.beginPath(); ctx.moveTo(gx, L.ceil); ctx.lineTo(gx, gy - gr2); ctx.stroke();
          ctx.fillStyle = '#c8a070'; ctx.fillRect(gx - gr2 * 0.3, gy - gr2 * 1.2, gr2 * 0.6, gr2 * 0.32);
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, gx, gy, gr2 * 4.5, '#ffd8a0', 0.26); ctx.restore();
          ctx.fillStyle = rg(ctx, gx - gr2 * 0.3, gy - gr2 * 0.3, 0, gr2, [[0, '#fffaf0'], [0.6, '#ffe8c0'], [1, '#f2c890']]);
          ctx.beginPath(); ctx.arc(gx, gy, gr2, 0, TAU); ctx.fill();
        });
        // a hanging planter in the top-left corner, spilling into the window light
        ctx.strokeStyle = 'rgba(90,100,115,0.4)'; ctx.lineWidth = 0.8 * s;
        ctx.beginPath(); ctx.moveTo(w * 0.055, L.ceil); ctx.lineTo(w * 0.045, L.ceil + h * 0.013); ctx.moveTo(w * 0.005, L.ceil); ctx.lineTo(w * 0.015, L.ceil + h * 0.013); ctx.stroke();
        ctx.fillStyle = lg(ctx, -w * 0.01, 0, w * 0.07, 0, [[0, '#cbb294'], [0.45, '#efe2cd'], [1, '#c3a98a']]);
        ctx.beginPath(); ctx.moveTo(-w * 0.012, L.ceil + h * 0.012); ctx.lineTo(w * 0.062, L.ceil + h * 0.012);
        ctx.lineTo(w * 0.052, L.ceil + h * 0.033); ctx.quadraticCurveTo(w * 0.025, L.ceil + h * 0.04, -w * 0.004, L.ceil + h * 0.033); ctx.closePath(); ctx.fill();
        vines(ctx, 0, w * 0.055, L.ceil + h * 0.03, 5, h * 0.095, ['#2e6a3a', '#2c683c', '#6cb356'], 80301, s);
        clump(ctx, w * 0.024, L.ceil + h * 0.01, 12 * s, ppal, r, 0.6, -0.7, false, 0.8);
        mark('ceiling', ctx);

        /* ---------- column and the status wall on the right ---------- */
        var c0 = L.cx0, c1 = L.cx1, B = L.board;
        // right wall: warm wood boards, brighter toward the window
        ctx.fillStyle = lg(ctx, L.rw0, 0, w, 0, [[0, '#e8d3b4'], [0.55, '#d8bd9a'], [1, '#c3a383']]);
        ctx.fillRect(L.rw0, 0, w - L.rw0, L.deskBack + h * 0.02);
        ctx.strokeStyle = 'rgba(120,88,58,0.22)'; ctx.lineWidth = 0.8 * s; ctx.beginPath();
        for (x = L.rw0 + 7 * s; x < w; x += 9 * s) { ctx.moveTo(x, 0); ctx.lineTo(x, L.deskBack + h * 0.02); }
        ctx.stroke();
        batch(ctx, 90, [['#f0dcc0', 0.9 * s, 0.3], ['#a67f58', 0.8 * s, 0.22]], function () {
          var yy = r() * (L.deskBack), xx = L.rw0 + r() * (w - L.rw0), l = (10 + r() * 30) * s;
          return [xx, yy, xx, yy + l, r() < 0.5 ? 0 : 1, xx + (r() - 0.5) * 2 * s, yy + l * 0.5];
        });
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; softGlow(ctx, L.rw0, h * 0.2, w * 0.2, '#fff2d8', 0.3); ctx.restore();
        // status board: a soft warm-white panel of small lights, mostly calm green
        ctx.fillStyle = 'rgba(110,80,55,0.22)'; ctx.beginPath(); rrect(ctx, B[0] + 2 * s, B[1] + 3 * s, B[2], B[3], 5 * s); ctx.fill();
        ctx.fillStyle = lg(ctx, B[0], B[1], B[0] + B[2], B[1] + B[3], [[0, '#fbf7f0'], [1, '#e8e2d6']]);
        ctx.beginPath(); rrect(ctx, B[0], B[1], B[2], B[3], 5 * s); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1 * s; ctx.beginPath(); rrect(ctx, B[0] + 0.8 * s, B[1] + 0.8 * s, B[2] - 1.6 * s, B[3] - 1.6 * s, 4.4 * s); ctx.stroke();
        // recessed face the little lights sit in
        ctx.fillStyle = lg(ctx, 0, B[1] + 4 * s, 0, B[1] + B[3] - 4 * s, [[0, '#d9d2c4'], [0.3, '#e7e0d2'], [1, '#d3cbbc']]);
        ctx.beginPath(); rrect(ctx, B[0] + 4 * s, B[1] + 4.5 * s, B[2] - 8 * s, B[3] - 9 * s, 3 * s); ctx.fill();
        ctx.fillStyle = 'rgba(120,105,85,0.22)'; ctx.beginPath(); rrect(ctx, B[0] + 4 * s, B[1] + 4.5 * s, B[2] - 8 * s, 2.2 * s, 1.2 * s); ctx.fill();
        var LC = L.lights, Q2;
        // each light sits in a dark slot, so the calm green reads against the warm panel
        ctx.fillStyle = 'rgba(96,88,76,0.3)'; ctx.beginPath();
        for (i = 0; i < LC.length; i++) rrect(ctx, LC[i][0] - 4.6 * s, LC[i][1] - 2 * s, 9.2 * s, 4 * s, 2 * s);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath();
        for (i = 0; i < LC.length; i++) rrect(ctx, LC[i][0] - 4.6 * s, LC[i][1] + 1.6 * s, 9.2 * s, 0.8 * s, 0.4 * s);
        ctx.fill();
        // the tiny bar of light each slot carries, then the lamp itself
        for (i = 0; i < LC.length; i++) {
          Q2 = LC[i];
          ctx.fillStyle = rgba(Q2[2], 0.3); ctx.beginPath(); rrect(ctx, Q2[0] + 0.4 * s, Q2[1] - 0.7 * s, 3.4 * s, 1.4 * s, 0.7 * s); ctx.fill();
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, Q2[0] - 2.2 * s, Q2[1], 5 * s, Q2[2], 0.55); ctx.restore();
          ctx.fillStyle = rg(ctx, Q2[0] - 2.6 * s, Q2[1] - 0.5 * s, 0, 1.9 * s, [[0, '#ffffff'], [0.4, mix(Q2[2], '#ffffff', 0.45)], [1, Q2[2]]]);
          ctx.beginPath(); qcirc(ctx, Q2[0] - 2.2 * s, Q2[1], 1.6 * s); ctx.fill();
        }
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; softGlow(ctx, B[0] + B[2] * 0.5, B[1] + B[3] * 0.55, B[2] * 1.1, '#8ff0bc', 0.1); ctx.restore();
        // a small shelf under the board with a trailing plant
        ctx.fillStyle = lg(ctx, L.rw0, 0, w, 0, [[0, '#f2e4cc'], [1, '#d2b48e']]); ctx.fillRect(L.rw0 + 4 * s, L.shelf, w - L.rw0 - 4 * s, 3.2 * s);
        ctx.fillStyle = 'rgba(110,80,55,0.2)'; ctx.fillRect(L.rw0 + 4 * s, L.shelf + 3.2 * s, w - L.rw0 - 4 * s, 2 * s);
        ctx.fillStyle = '#e8ded0'; ctx.beginPath(); rrect(ctx, w * 0.815, L.shelf - 7.5 * s, 16 * s, 7.5 * s, 2 * s); ctx.fill();
        clump(ctx, w * 0.845, L.shelf - 9 * s, 9 * s, ppal, r, -0.6, -0.8, false, 0.8);
        vines(ctx, w * 0.82, w * 0.875, L.shelf + 4 * s, 4, h * 0.075, ['#2e6a3a', '#2c683c', '#6cb356'], 80311, s);
        // the column: white face, warm return, catching window light
        ctx.fillStyle = lg(ctx, c0, 0, c1, 0, [[0, '#fbf8f2'], [0.6, '#f0e8da'], [1, '#d9c6a8']]);
        ctx.fillRect(c0, 0, c1 - c0, L.deskBack + h * 0.02);
        ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.fillRect(c0, 0, 1.6 * s, L.deskBack + h * 0.02);
        ctx.fillStyle = 'rgba(120,96,70,0.18)'; ctx.fillRect(c1 - 2 * s, 0, 2 * s, L.deskBack + h * 0.02);
        mark('wall', ctx);

        /* ---------- floor: warm boards, sunlight from the glass ---------- */
        ctx.fillStyle = lg(ctx, 0, sill, 0, h, [[0, '#cbb294'], [0.25, '#dcc5a6'], [1, '#c9ae8c']]);
        ctx.fillRect(0, sill + 8 * s, w, h - sill - 8 * s);
        ctx.save(); ctx.beginPath(); ctx.rect(0, sill + 8 * s, w, h - sill - 8 * s); ctx.clip();
        // boards receding to the vanishing point
        ctx.strokeStyle = 'rgba(130,100,70,0.22)'; ctx.lineWidth = 0.9 * s; ctx.beginPath();
        for (i = -10; i <= 14; i++) { var bx2 = L.vpx + i * w * 0.17; ctx.moveTo(lerp(L.vpx, bx2, (sill - L.vpy) / (h - L.vpy)), sill); ctx.lineTo(bx2, h); }
        var ty2 = sill + h * 0.02, td = h * 0.02; while (ty2 < h) { ctx.moveTo(0, ty2); ctx.lineTo(w, ty2); ty2 += td; td *= 1.3; }
        ctx.stroke();
        batch(ctx, 120, [['#e8d2b2', 0.9 * s, 0.3], ['#a8835c', 0.8 * s, 0.22]], function () {
          var yy = lerp(sill + h * 0.02, h, Math.pow(r(), 0.8)), xx = r() * w, l = (16 + r() * 50) * s * (yy - sill) / (h - sill);
          return [xx, yy, xx + l, yy + (r() - 0.5) * l * 0.12, r() < 0.5 ? 0 : 1, xx + l * 0.5, yy + (r() - 0.5) * l * 0.2];
        });
        // window light laid on the floor, skewed away from the glass
        ctx.globalCompositeOperation = 'lighter';
        for (i = 0; i < 4; i++) {
          var p0 = w * (L.mull[i] + 0.012), p1 = w * (L.mull[i + 1] - 0.012), sk = -w * 0.1;
          ctx.fillStyle = lg(ctx, 0, sill, 0, h * 0.98, [[0, 'rgba(255,246,218,0.26)'], [1, 'rgba(255,236,200,0.04)']]);
          ctx.beginPath(); ctx.moveTo(p0, sill + 6 * s); ctx.lineTo(p1, sill + 6 * s);
          ctx.lineTo(p1 + sk + (p1 - L.vpx) * 0.5, h * 0.98); ctx.lineTo(p0 + sk + (p0 - L.vpx) * 0.5, h * 0.98); ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
        // soft shadow where the wall meets the floor
        ctx.fillStyle = lg(ctx, 0, sill + 6 * s, 0, sill + h * 0.03, [[0, 'rgba(110,80,55,0.3)'], [1, 'rgba(110,80,55,0)']]);
        ctx.fillRect(0, sill + 6 * s, w, h * 0.03);
        ctx.restore();
        mark('floor', ctx);

        /* ---------- a tall plant in front of the glass, left ---------- */
        var px = w * 0.075, pyb = h * 0.575;
        ctx.fillStyle = 'rgba(90,70,55,0.18)'; ctx.beginPath(); ctx.ellipse(px, pyb + 2 * s, 26 * s, 6 * s, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = '#4a7a42'; ctx.lineWidth = 2 * s; ctx.lineCap = 'round'; ctx.beginPath();
        for (i = 0; i < 5; i++) { var sa = -PI / 2 + (i - 2) * 0.22; ctx.moveTo(px, pyb - 8 * s); ctx.lineTo(px + Math.cos(sa) * h * 0.09, pyb - 8 * s + Math.sin(sa) * h * 0.09); }
        ctx.stroke();
        var gpal = ['#17412a', '#215536', '#327b40', '#58a64e', '#92cc66'];
        frondPlant(ctx, px, pyb - h * 0.092, h * 0.108, 26, gpal, 80401, 2.7, -PI / 2, s, 0.72, -0.7);
        frondPlant(ctx, px + 11 * s, pyb - h * 0.052, h * 0.058, 13, gpal, 80402, 2.3, -PI / 2.2, s, 0.72, -0.7);
        // pot
        ctx.fillStyle = lg(ctx, px - 20 * s, 0, px + 20 * s, 0, [[0, '#d8c8b0'], [0.4, '#f6efe2'], [1, '#bda98c']]);
        ctx.beginPath(); ctx.moveTo(px - 19 * s, pyb - 20 * s); ctx.lineTo(px + 19 * s, pyb - 20 * s); ctx.lineTo(px + 15 * s, pyb); ctx.quadraticCurveTo(px, pyb + 3 * s, px - 15 * s, pyb); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#16b3a6'; ctx.fillRect(px - 19 * s, pyb - 17 * s, 38 * s, 1.8 * s);
        ctx.fillStyle = '#5a4a3a'; ctx.beginPath(); ctx.ellipse(px, pyb - 20 * s, 19 * s, 3.4 * s, 0, 0, TAU); ctx.fill();
        mark('plant', ctx);

        /* ---------- the long desk ---------- */
        var dB = L.deskBack, dF = L.deskFront, dBase = L.deskBase;
        // shadow the desk throws back onto the floor
        ctx.fillStyle = lg(ctx, 0, dB - h * 0.02, 0, dB, [[0, 'rgba(100,75,55,0)'], [1, 'rgba(100,75,55,0.22)']]); ctx.fillRect(0, dB - h * 0.02, w, h * 0.02);
        // top surface
        ctx.fillStyle = lg(ctx, 0, dB, 0, dF, [[0, '#e3c8a4'], [0.5, '#d9bb95'], [1, '#e9d2b0']]); ctx.fillRect(0, dB, w, dF - dB);
        ctx.save(); ctx.beginPath(); ctx.rect(0, dB, w, dF - dB); ctx.clip();
        batch(ctx, 90, [['#f3e0c4', 1 * s, 0.35], ['#ab8257', 0.9 * s, 0.22]], function () {
          var yy = dB + r() * (dF - dB), xx = r() * w, l = (24 + r() * 70) * s;
          return [xx, yy, xx + l, yy + (r() - 0.5) * 1.2 * s, r() < 0.5 ? 0 : 1, xx + l * 0.5, yy + (r() - 0.5) * 2 * s];
        });
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; band(ctx, 0, w * 0.72, dB, dF, '#fff0cc', 0.22); ctx.restore();
        ctx.restore();
        // front edge and apron
        ctx.fillStyle = '#f6ead6'; ctx.fillRect(0, dF, w, 2.6 * s);
        ctx.fillStyle = lg(ctx, 0, dF, 0, dBase, [[0, '#c6a780'], [0.5, '#b89570'], [1, '#a07e5c']]); ctx.fillRect(0, dF + 2.6 * s, w, dBase - dF - 2.6 * s);
        ctx.fillStyle = 'rgba(255,240,210,0.16)'; ctx.fillRect(0, dF + 2.6 * s, w * 0.7, 2 * s);
        // a soft warm light line under the lip, and a shallow inlay in the apron
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = lg(ctx, 0, dF + 4 * s, 0, dF + h * 0.035, [[0, 'rgba(255,224,170,0.3)'], [1, 'rgba(255,224,170,0)']]);
        ctx.fillRect(0, dF + 4 * s, w, h * 0.035); ctx.restore();
        ctx.strokeStyle = 'rgba(110,84,60,0.22)'; ctx.lineWidth = 1 * s;
        ctx.beginPath(); rrect(ctx, w * 0.04, dF + h * 0.028, w * 0.92, dBase - dF - h * 0.05, 4 * s); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,240,215,0.3)'; ctx.beginPath(); rrect(ctx, w * 0.04, dF + h * 0.028 + 1.2 * s, w * 0.92, dBase - dF - h * 0.05, 4 * s); ctx.stroke();
        ctx.fillStyle = 'rgba(70,50,35,0.18)'; ctx.fillRect(0, dBase - 2.5 * s, w, 2.5 * s);
        mark('desk', ctx);

        /* ---------- what is on the desk: screens, a mug, a small plant ---------- */
        screenPanel(ctx, w * 0.155, h * 0.466, w * 0.165, h * 0.12, s, '#a8dbe6', 3);
        screenPanel(ctx, w * 0.37, h * 0.442, w * 0.215, h * 0.145, s, '#a8dbe6', 1);
        // the glow the screens throw on the desk
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        softGlow(ctx, w * 0.238, h * 0.605, w * 0.16, '#bfe9f2', 0.18);
        softGlow(ctx, w * 0.478, h * 0.605, w * 0.18, '#bfe9f2', 0.2);
        ctx.restore();
        // a small tablet lying flat near the front edge
        ctx.save(); ctx.fillStyle = 'rgba(80,70,60,0.18)'; ctx.beginPath(); rrect(ctx, w * 0.655, dB + 7 * s, w * 0.1, h * 0.028, 2 * s); ctx.fill();
        ctx.fillStyle = lg(ctx, w * 0.65, 0, w * 0.75, 0, [[0, '#f8f5ef'], [1, '#e2ded4']]);
        ctx.beginPath(); rrect(ctx, w * 0.65, dB + 5 * s, w * 0.1, h * 0.028, 2 * s); ctx.fill();
        ctx.fillStyle = 'rgba(190,232,238,0.85)'; ctx.beginPath(); rrect(ctx, w * 0.658, dB + 6.6 * s, w * 0.084, h * 0.021, 1.4 * s); ctx.fill();
        ctx.restore();
        // mug
        var mx2 = w * 0.795, my2 = dB + h * 0.03;
        ctx.fillStyle = 'rgba(80,60,45,0.2)'; ctx.beginPath(); ctx.ellipse(mx2, my2 + 1 * s, 8 * s, 2.6 * s, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = '#f0ece2'; ctx.lineWidth = 2 * s; ctx.beginPath(); ctx.arc(mx2 + 7 * s, my2 - 5 * s, 3.2 * s, -PI * 0.5, PI * 0.5); ctx.stroke();
        ctx.fillStyle = lg(ctx, mx2 - 7 * s, 0, mx2 + 7 * s, 0, [[0, '#e6e0d4'], [0.4, '#fbf8f2'], [1, '#cfc6b6']]);
        ctx.beginPath(); rrect(ctx, mx2 - 6.5 * s, my2 - 10 * s, 13 * s, 11 * s, 2.4 * s); ctx.fill();
        ctx.fillStyle = '#16b3a6'; ctx.fillRect(mx2 - 6.5 * s, my2 - 7 * s, 13 * s, 1.6 * s);
        // a small plant pot at the right end of the desk
        var sp3 = w * 0.9, spy = dB + h * 0.036;
        ctx.fillStyle = 'rgba(80,60,45,0.2)'; ctx.beginPath(); ctx.ellipse(sp3, spy + 1 * s, 11 * s, 3 * s, 0, 0, TAU); ctx.fill();
        clump(ctx, sp3, spy - 14 * s, 11 * s, ppal, r, -0.6, -0.8, false, 0.85);
        ctx.fillStyle = lg(ctx, sp3 - 9 * s, 0, sp3 + 9 * s, 0, [[0, '#cdbda4'], [0.4, '#f4ede0'], [1, '#b9a78c']]);
        ctx.beginPath(); ctx.moveTo(sp3 - 8 * s, spy - 9 * s); ctx.lineTo(sp3 + 8 * s, spy - 9 * s); ctx.lineTo(sp3 + 6.4 * s, spy); ctx.quadraticCurveTo(sp3, spy + 1.6 * s, sp3 - 6.4 * s, spy); ctx.closePath(); ctx.fill();
        mark('props', ctx);

        /* ---------- light ---------- */
        shafts(ctx, w * 0.56, -h * 0.06, w, h, '#fff8e0', 0.03, 5, r, 0.5, PI * 0.63, 0.02, 0.05);
        finish(ctx, w, h, '#fff4e0', 0.08, 0.2, 0.035, '#20304a', 0.36);
        mark('finish', ctx);
      } catch (e) { PAINT._err = 'screening: ' + String(e && e.stack || e); }
    },
    overlay: function (ctx, w, h, t) {
      try {
        var L = L0(w, h), s = L.s, i, hz = L.hz, sill = L.sill, B = L.board;
        /* through the glass: a slow sailboat, gulls, water sparkle (above the screens) */
        var clipB = Math.min(sill, h * 0.43);
        ctx.save(); ctx.beginPath(); ctx.rect(L.wx0, L.head, L.wx1 - L.wx0, clipB - L.head); ctx.clip();
        var bx = ((t * 2.2 * s + w * 0.1) % (w * 0.95)) - w * 0.08, by = h * 0.333, bs = 4.4 * s;
        ctx.save(); ctx.translate(bx, by); ctx.scale(1, -0.7); ctx.globalAlpha = 0.25; boat(ctx, 0, 0, bs, '#ffffff', '#2a4a6a'); ctx.restore();
        boat(ctx, bx, by, bs, '#ffffff', '#ff7a6b', '#eaf2fa');
        ctx.strokeStyle = 'rgba(255,255,255,0.65)'; ctx.lineWidth = 0.9 * s;
        ctx.beginPath(); ctx.moveTo(bx - bs * 0.6, by); ctx.quadraticCurveTo(bx - bs * 4, by + 1.2 * s, bx - bs * 9, by + 0.6 * s); ctx.stroke();
        // water sparkle
        ctx.fillStyle = '#ffffff';
        for (i = 0; i < 14; i++) {
          var p = hash(i, 81), gy = hz + h * 0.008 + p * (clipB - hz - h * 0.014), gx = L.wx1 * (0.06 + hash(i, 82) * 0.9);
          var tw = Math.pow(Math.max(0, Math.sin(t * (1.2 + hash(i, 83) * 2) + i * 4)), 8);
          if (tw < 0.05) continue;
          var z = (0.8 + p * 1.5) * s * tw; ctx.globalAlpha = tw;
          ctx.fillRect(gx - z * 2, gy - 0.3 * s, z * 4, 0.6 * s); ctx.fillRect(gx - 0.3 * s, gy - z, 0.6 * s, z * 2);
        }
        // two gulls, high and slow
        ctx.globalAlpha = 1; ctx.strokeStyle = 'rgba(60,70,90,0.6)'; ctx.lineWidth = 1 * s; ctx.lineCap = 'round';
        for (i = 0; i < 2; i++) {
          var gx2 = ((t * (7 + i * 3) * s + i * 110 * s) % (L.wx1 + w * 0.3)) - w * 0.15;
          var gy2 = h * (0.115 + i * 0.03) + Math.sin(t * 0.7 + i) * 4 * s;
          drawBird(ctx, gx2, gy2, (3.6 - i * 0.6) * s, t * 5 + i * 2);
        }
        ctx.restore();
        /* the screens' light breathing on the desk, and a slow shift of the sun pool on the floor */
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        var br = 0.5 + 0.5 * Math.sin(t * 0.35);
        ctx.fillStyle = 'rgba(255,246,218,' + (0.03 + 0.025 * br).toFixed(3) + ')';
        for (i = 0; i < 4; i++) {
          var p0 = w * (L.mull[i] + 0.012) + Math.sin(t * 0.12 + i) * 3 * s, p1 = w * (L.mull[i + 1] - 0.012) + Math.sin(t * 0.12 + i) * 3 * s, sk = -w * 0.1;
          ctx.beginPath(); ctx.moveTo(p0, sill + 6 * s); ctx.lineTo(p1, sill + 6 * s);
          ctx.lineTo(p1 + sk + (p1 - L.vpx) * 0.5, h * 0.98); ctx.lineTo(p0 + sk + (p0 - L.vpx) * 0.5, h * 0.98); ctx.fill();
        }
        var sp = glowSpr('#cdeef6');
        if (sp) {
          var gl = [[w * 0.238, h * 0.605, w * 0.15], [w * 0.478, h * 0.605, w * 0.17]];
          for (i = 0; i < gl.length; i++) {
            var a = 0.1 + 0.05 * Math.sin(t * 0.5 + i * 1.7), R = gl[i][2] * (1 + 0.03 * Math.sin(t * 0.5 + i));
            ctx.globalAlpha = a; ctx.drawImage(sp, gl[i][0] - R, gl[i][1] - R, R * 2, R * 2);
          }
        }
        /* two status lights breathing, the rest steady */
        ctx.globalAlpha = 1;
        var hard = glowSpr('#7fe6ad', true);
        if (hard) {
          var pick2 = [5, 12];
          for (i = 0; i < pick2.length; i++) {
            var Q3 = L.lights[pick2[i]];
            var pulse = 0.5 + 0.5 * Math.sin(t * (0.5 + i * 0.11) + i * 2.1), R2 = (3.6 + pulse * 2.2) * s;
            ctx.globalAlpha = 0.25 + pulse * 0.4; ctx.drawImage(hard, Q3[0] - 2.2 * s - R2, Q3[1] - R2, R2 * 2, R2 * 2);
          }
        }
        ctx.restore();
      } catch (e) { PAINT._err = 'screening overlay: ' + String(e && e.stack || e); }
    }
  };

  /* the entry points leave the caller's canvas state untouched */
  (function (k) {
    var S0 = PAINT[k], p0 = S0.paint, o0 = S0.overlay;
    S0.paint = function (ctx, w, h) { ctx.save(); try { p0(ctx, w, h); } finally { ctx.restore(); } };
    S0.overlay = function (ctx, w, h, t) { ctx.save(); try { o0(ctx, w, h, t); } finally { ctx.restore(); } };
  })('screening');
})();
