/* dc__kit.js - shared painting kit for Washington, DC scenes (loads before dc_*.js; read lazily as window.DCK).
   Utilities adapted from paint_boston.js (seeded rng, gradients, glows, batched strokes, cloud forms, foliage, finish),
   plus DC pieces reusable by any DC scene (the Lawmaker, the Judge, the Quiet Coup):
     capitol(ctx, o)   the US Capitol seen from the south-east: House wing, the dome with its peristyle, attic, ribbed shell,
                       lantern and the Statue of Freedom. o: {cx, base, D (drum width), night, lit (lantern lit)}
     flagPole(ctx, o)  an indoor US flag draped from a pole with a gold eagle finial. o: {x, top, foot, s, side (+1 flag right)}
     woodWall(ctx, x0, y0, x1, y1, o)  raised-panel wood wainscot. o: {pal:[dark,mid,lit], rows, cols, s, seed}
     books(ctx, x0, y0, x1, y1, s, r)  a shelf of book spines.
   Everything is seeded, so scenes paint identically every time. */
(function () {
  'use strict';
  var PI = Math.PI, TAU = PI * 2;
  function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function hash(i, s) { var x = Math.imul((i | 0) ^ Math.imul(s | 0, 0x9E3779B1), 0x27d4eb2d); x ^= x >>> 15; x = Math.imul(x, 0x85ebca6b); x ^= x >>> 13; x = Math.imul(x, 0xc2b2ae35); x ^= x >>> 16; return (x >>> 0) / 4294967296; }
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
  function softGlow(ctx, x, y, r, col, a) { ctx.fillStyle = rg(ctx, x, y, 0, r, [[0, rgba(col, a)], [0.5, rgba(col, a * 0.5)], [1, rgba(col, 0)]]); ctx.fillRect(x - r, y - r, r * 2, r * 2); }
  function puff(ctx, x, y, R, col, a) { ctx.fillStyle = rg(ctx, x, y, 0, R, [[0, rgba(col, a)], [0.5, rgba(col, a * 0.85)], [0.8, rgba(col, a * 0.35)], [1, rgba(col, 0)]]); ctx.fillRect(x - R, y - R, R * 2, R * 2); }
  function haze(ctx, x0, y0, x1, y1, col, a) { var cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, rx = (x1 - x0) / 2, ry = Math.max(1, (y1 - y0) / 2); ctx.save(); ctx.translate(cx, cy); ctx.scale(1, ry / rx); ctx.fillStyle = rg(ctx, 0, 0, 0, rx, [[0, rgba(col, a)], [0.6, rgba(col, a * 0.75)], [1, rgba(col, 0)]]); ctx.fillRect(-rx, -rx, rx * 2, rx * 2); ctx.restore(); }
  function band(ctx, x0, x1, y0, y1, col, a) { ctx.fillStyle = lg(ctx, 0, y0, 0, y1, [[0, rgba(col, 0)], [0.5, rgba(col, a)], [1, rgba(col, 0)]]); ctx.fillRect(x0, y0, x1 - x0, y1 - y0); }
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
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a - wd) * L, y + Math.sin(a - wd) * L); ctx.lineTo(x + Math.cos(a + wd) * L, y + Math.sin(a + wd) * L); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
  function batch(ctx, n, cols, gen) {
    var paths = [], i, k; for (k = 0; k < cols.length; k++) paths.push([]);
    for (i = 0; i < n; i++) { var s = gen(i); if (s) paths[s[4]].push(s); }
    ctx.save(); ctx.lineCap = 'round';
    for (k = 0; k < cols.length; k++) {
      var p = paths[k]; if (!p.length) continue; ctx.beginPath();
      for (i = 0; i < p.length; i++) { ctx.moveTo(p[i][0], p[i][1]); if (p[i].length > 5) ctx.quadraticCurveTo(p[i][5], p[i][6], p[i][2], p[i][3]); else ctx.lineTo(p[i][2], p[i][3]); }
      ctx.strokeStyle = cols[k][0]; ctx.lineWidth = cols[k][1]; ctx.globalAlpha = cols[k][2]; ctx.stroke();
    }
    ctx.restore();
  }
  var QK = 0.914;
  function qcirc(ctx, x, y, r) { if (r < 1.1) { ctx.rect(x - r, y - r, r * 2, r * 2); return; } var c = r * QK; ctx.moveTo(x + r, y); ctx.quadraticCurveTo(x + c, y + c, x, y + r); ctx.quadraticCurveTo(x - c, y + c, x - r, y); ctx.quadraticCurveTo(x - c, y - c, x, y - r); ctx.quadraticCurveTo(x + c, y - c, x + r, y); }
  function qell(ctx, x, y, rx, ry, a) {
    var ca = Math.cos(a || 0), sa = Math.sin(a || 0), k = QK;
    function X(u, v) { return x + u * ca - v * sa; } function Y(u, v) { return y + u * sa + v * ca; }
    ctx.moveTo(X(rx, 0), Y(rx, 0)); ctx.quadraticCurveTo(X(rx * k, ry * k), Y(rx * k, ry * k), X(0, ry), Y(0, ry)); ctx.quadraticCurveTo(X(-rx * k, ry * k), Y(-rx * k, ry * k), X(-rx, 0), Y(-rx, 0));
    ctx.quadraticCurveTo(X(-rx * k, -ry * k), Y(-rx * k, -ry * k), X(0, -ry), Y(0, -ry)); ctx.quadraticCurveTo(X(rx * k, -ry * k), Y(rx * k, -ry * k), X(rx, 0), Y(rx, 0));
  }
  function dots(ctx, n, cols, gen) { var i, k, b = []; for (k = 0; k < cols.length; k++) b.push([]); for (i = 0; i < n; i++) { var d = gen(i); if (d) b[d[3]].push(d); }
    ctx.save(); for (k = 0; k < cols.length; k++) { if (!b[k].length) continue; ctx.fillStyle = cols[k][0]; ctx.globalAlpha = cols[k][1]; ctx.beginPath(); for (i = 0; i < b[k].length; i++) { var q = b[k][i]; qcirc(ctx, q[0], q[1], q[2]); } ctx.fill(); } ctx.restore(); }
  function dabs(ctx, n, cols, gen) { var i, k, b = []; for (k = 0; k < cols.length; k++) b.push([]); for (i = 0; i < n; i++) { var d = gen(i); if (d) b[d[4]].push(d); }
    ctx.save(); for (k = 0; k < cols.length; k++) { if (!b[k].length) continue; ctx.fillStyle = cols[k][0]; ctx.globalAlpha = cols[k][1]; ctx.beginPath(); for (i = 0; i < b[k].length; i++) { var q = b[k][i]; qell(ctx, q[0], q[1], q[2], q[3], q[5] || 0); } ctx.fill(); } ctx.restore(); }
  function rects(ctx, n, cols, gen) { var i, k, b = []; for (k = 0; k < cols.length; k++) b.push([]); for (i = 0; i < n; i++) { var d = gen(i); if (d) b[d[4]].push(d); }
    ctx.save(); for (k = 0; k < cols.length; k++) { if (!b[k].length) continue; ctx.fillStyle = cols[k][0]; ctx.globalAlpha = cols[k][1]; ctx.beginPath(); for (i = 0; i < b[k].length; i++) { var q = b[k][i]; ctx.rect(q[0], q[1], q[2], q[3]); } ctx.fill(); } ctx.restore(); }
  function gradAt(st, t) { if (t <= st[0][0]) return st[0][1]; for (var i = 1; i < st.length; i++) if (t <= st[i][0]) return mix(st[i - 1][1], st[i][1], (t - st[i - 1][0]) / (st[i][0] - st[i - 1][0])); return st[st.length - 1][1]; }
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
  function cloudForm(ctx, cx, cy, W, H, r, o) {
    var q = o.q || 0.5, pad = H * 0.5, bw = W * 1.15 + pad * 2, bh = H * 1.9 + pad, ox = bw / 2, oy = bh * 0.72;
    var cv = mk(bw * q, bh * q); if (!cv) return;
    var g = cv.getContext('2d'), i, p, lx = o.lx || 0, ly = o.ly == null ? -1 : o.ly;
    g.scale(q, q); g.translate(ox - cx, oy - cy);
    var n = Math.max(4, Math.round(W / (H * 0.42))), P = [], tries;
    for (i = 0; i < n; i++) { var u = (i / (n - 1)) * 2 - 1 + (r() - 0.5) * 0.15, hp = Math.pow(Math.max(0, 1 - u * u), 0.5); var rad = H * (0.2 + 0.26 * hp) * (0.85 + r() * 0.3); P.push([cx + u * (W * 0.5 - rad * 0.6), cy - H * 0.15 * hp + rad * 0.3, rad]); }
    var nb = o.billows || n * 3;
    for (tries = 0; tries < nb * 3 && P.length < n + nb; tries++) {
      var pa = P[(r() * P.length) | 0]; if (pa[2] < H * 0.07) continue;
      var a = -PI * (0.12 + r() * 0.76), d = pa[2] * (0.62 + r() * 0.3), nr = pa[2] * (0.38 + r() * 0.3), nx = pa[0] + Math.cos(a) * d, ny = pa[1] + Math.sin(a) * d;
      if (ny - nr < cy - H * 1.05 || Math.abs(nx - cx) + nr > W * 0.56) continue; P.push([nx, ny, nr]);
    }
    var ext = Math.max(W, H * 2);
    var form = lg(g, cx - lx * ext * 0.5, cy - ly * ext * 0.35, cx + lx * ext * 0.5, cy + ly * ext * 0.35, [[0, o.shade], [0.42, o.mid], [0.78, o.lit], [1, o.lit]]);
    g.globalAlpha = o.halo == null ? 0.35 : o.halo; g.fillStyle = form; g.beginPath();
    for (i = 0; i < P.length; i++) { p = P[i]; g.moveTo(p[0] + p[2] * 1.12, p[1]); g.arc(p[0], p[1], p[2] * 1.12, 0, TAU); }
    g.fill(); g.globalAlpha = 1; g.beginPath();
    for (i = 0; i < P.length; i++) { p = P[i]; g.moveTo(p[0] + p[2], p[1]); g.arc(p[0], p[1], p[2], 0, TAU); }
    g.fill(); g.globalCompositeOperation = 'source-atop';
    P.sort(function (A, B) { return A[1] - B[1]; });
    for (i = 0; i < P.length; i++) { p = P[i]; if (i % 2 === 0) puff(g, p[0] - lx * p[2] * 0.3, p[1] - ly * p[2] * 0.3 + p[2] * 0.35, p[2] * 0.9, o.shade, o.seam == null ? 0.16 : o.seam); puff(g, p[0] + lx * p[2] * 0.55, p[1] + ly * p[2] * 0.55, p[2] * 0.6, o.lit, 0.32); }
    if (o.top) { g.fillStyle = lg(g, 0, cy - H, 0, cy + H * 0.3, [[0, rgba(o.top, 0.5)], [1, rgba(o.top, 0)]]); g.fillRect(cx - bw, cy - bh, bw * 2, bh * 2); }
    dabs(g, Math.round(P.length * 6), [[o.lit, 0.14], [o.top || o.mid, 0.12], [o.shade, 0.1]], function () {
      var q2 = P[(r() * P.length) | 0], a = r() * TAU, d = q2[2] * Math.sqrt(r()) * 0.9, px = q2[0] + Math.cos(a) * d, py = q2[1] + Math.sin(a) * d, f = (Math.cos(a) * lx + Math.sin(a) * ly) * d / q2[2];
      return [px, py, q2[2] * (0.12 + r() * 0.16), q2[2] * (0.04 + r() * 0.04), f > 0.3 ? 0 : (Math.sin(a) < -0.3 ? 1 : 2), (r() - 0.5) * 0.5];
    });
    g.globalCompositeOperation = 'destination-out';
    var by = cy + H * (0.12 + (1 - (o.base == null ? 0.6 : o.base)) * 0.3);
    g.fillStyle = lg(g, 0, by, 0, by + H * 0.2, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,1)']]); g.fillRect(cx - bw, by, bw * 2, bh);
    ctx.save(); ctx.globalAlpha = o.al == null ? 1 : o.al; ctx.imageSmoothingEnabled = true; ctx.drawImage(cv, cx - ox, cy - oy, bw, bh); ctx.restore();
  }
  function lens(ctx, x, y, L, Wd, a) { var c = Math.cos(a), sn = Math.sin(a), tx = x + c * L, ty = y + sn * L, mx = x + c * L * 0.5, my = y + sn * L * 0.5, nx = -sn * Wd, ny = c * Wd; ctx.moveTo(x, y); ctx.quadraticCurveTo(mx + nx, my + ny, tx, ty); ctx.quadraticCurveTo(mx - nx, my - ny, x, y); }
  /* volumetric foliage clump of leaf dabs: pal [deep, shadow, mid, lit, rim]; (lx,ly) toward the light */
  function clump(ctx, cx, cy, R, pal, r, lx, ly, back, dens) {
    ctx.fillStyle = rg(ctx, cx + lx * R * 0.3, cy + ly * R * 0.3, 0, R * 0.95, [[0, pal[1]], [0.6, pal[0]], [1, pal[0]]]);
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.8, 0, TAU); ctx.fill();
    var n = Math.min(200, Math.round((30 + R * R * 0.32) * (dens || 1))), B = [[], [], [], [], []], i, k;
    for (i = 0; i < n; i++) {
      var a = r() * TAU, rr = R * Math.sqrt(r()) * 0.98, px = cx + Math.cos(a) * rr, py = cy + Math.sin(a) * rr * 0.92, nx = (px - cx) / R, ny = (py - cy) / R;
      var v = (nx * lx + ny * ly) * 0.55 - ny * 0.18 + (1 - rr / R) * 0.06 + (r() - 0.5) * 0.4 + (back ? 0.4 : 0.52);
      var b = v < 0.24 ? 0 : v < 0.44 ? 1 : v < 0.64 ? 2 : v < 0.88 ? 3 : 4; if (b === 4 && rr < R * 0.72) b = 3;
      var L = R * (0.12 + r() * 0.11) * (b === 4 ? 0.7 : 1); B[b].push([px, py, L, L * (0.28 + r() * 0.12), a + PI * 0.5 + (r() - 0.5) * 1.6]);
    }
    for (k = 0; k < 5; k++) { if (!B[k].length) continue; ctx.fillStyle = pal[k]; ctx.beginPath(); for (i = 0; i < B[k].length; i++) { var q = B[k][i]; lens(ctx, q[0] - Math.cos(q[4]) * q[2] * 0.5, q[1] - Math.sin(q[4]) * q[2] * 0.5, q[2], q[3], q[4]); } ctx.fill(); }
  }
  /* a blossoming tree crown: green or cherry-pink clumps over a dark mass */
  function treeCrown(ctx, cx, cy, rx, ry, pal, r, n, lx, ly) {
    var k, cl = [];
    for (k = 0; k < n; k++) { var a = r() * TAU, rr = Math.sqrt(r()) * 0.85; cl.push([cx + Math.cos(a) * rx * rr, cy + Math.sin(a) * ry * rr, Math.min(rx, ry) * (0.3 + r() * 0.25)]); }
    cl.sort(function (A, B) { return A[1] - B[1]; });
    for (k = 0; k < cl.length; k++) clump(ctx, cl[k][0], cl[k][1], cl[k][2], pal, r, lx, ly, cl[k][1] < cy - ry * 0.3, 0.8);
  }

  /* ---------------- the US Capitol (seen from the south-east, as from the House office buildings) ---------------- */
  /* Proportions follow the real building: a drum ringed by 36 columns (the peristyle), an attic with windows, a ribbed
     cast-iron shell with three tiers of windows, the lantern (its light burns when Congress meets at night) and the
     bronze Statue of Freedom on top. D = width of the peristyle. Light comes from the upper left (day). */
  function capitol(ctx, o) {
    var cx = o.cx, b = o.base, D = o.D, s = o.s || 1, night = !!o.night, i, x, t;
    var C = night ? { lit: '#f4f0ff', mid: '#c8c8e6', shade: '#7c84b8', deep: '#4a5288', line: '#5a6298', win: '#3a3f6a', warm: '#fff2c8' }
      : { lit: '#fffdf6', mid: '#ece6d8', shade: '#b8bccc', deep: '#8a90a8', line: '#9aa0b4', win: '#5a6684', warm: '#fff6e0' };
    var lx = night ? 0 : -1;
    // vertical shading across a cylinder: u in -1..1 (left..right)
    function cyl(x0, x1, y0, y1, a, c) { var g = lg(ctx, x0, 0, x1, 0, night ? [[0, c.mid], [0.35, c.lit], [0.65, c.lit], [1, c.shade]] : [[0, c.lit], [0.3, c.lit], [0.7, c.mid], [1, c.shade]]); ctx.globalAlpha = a || 1; ctx.fillStyle = g; ctx.fillRect(x0, y0, x1 - x0, y1 - y0); ctx.globalAlpha = 1; }
    // ---- dome shell profile (radius at height t from shell base to lantern) ----
    var yPer = b, perH = D * 0.2, yEnt = yPer - perH, entH = D * 0.045, yAtt = yEnt - entH, attH = D * 0.13, yShell = yAtt - attH - D * 0.02;
    var shellH = D * 0.5, yTop = yShell - shellH, Rs = D * 0.41, Rt = D * 0.105;
    function shellR(tt) { return Rt + (Rs - Rt) * Math.pow(Math.cos(tt * PI / 2), 0.78); } // tt 0 at base, 1 at top
    // the shell
    ctx.beginPath(); ctx.moveTo(cx - Rs, yShell);
    for (i = 0; i <= 24; i++) { t = i / 24; ctx.lineTo(cx - shellR(t), yShell - t * shellH); }
    for (i = 24; i >= 0; i--) { t = i / 24; ctx.lineTo(cx + shellR(t), yShell - t * shellH); }
    ctx.closePath();
    ctx.fillStyle = lg(ctx, cx - Rs, 0, cx + Rs, 0, night ? [[0, C.mid], [0.4, C.lit], [0.62, C.lit], [1, C.shade]] : [[0, C.lit], [0.35, C.lit], [0.7, C.mid], [1, C.shade]]); ctx.fill();
    ctx.save(); ctx.clip();
    ctx.fillStyle = lg(ctx, 0, yTop, 0, yShell, [[0, rgba(C.lit, 0)], [1, rgba(C.shade, 0.25)]]); ctx.fillRect(cx - Rs, yTop, Rs * 2, shellH + 2);
    // ribs (36 around; ~13 visible), drawn as curves following the shell
    ctx.lineWidth = Math.max(0.8, D * 0.006);
    for (i = -6; i <= 6; i++) {
      var ph = i / 7.2; ctx.beginPath();
      for (var j = 0; j <= 20; j++) { t = j / 20; var R = shellR(t); x = cx + Math.sin(ph * PI / 2) * R; var y = yShell - t * shellH; if (j) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
      ctx.strokeStyle = rgba(night ? '#ffffff' : (ph > 0.1 ? '#8a90a8' : '#ffffff'), night ? 0.35 : 0.5); ctx.stroke();
      ctx.strokeStyle = rgba(C.deep, 0.35); ctx.save(); ctx.translate(D * 0.004, 0); ctx.stroke(); ctx.restore();
    }
    // three tiers of small windows between the ribs
    [[0.12, 0.05, 0.034], [0.38, 0.04, 0.026], [0.62, 0.032, 0.02]].forEach(function (T) {
      var y = yShell - T[0] * shellH, R = shellR(T[0]);
      for (i = -6; i < 6; i++) { var ph2 = (i + 0.5) / 7.2, wx = cx + Math.sin(ph2 * PI / 2) * R, sq = Math.cos(ph2 * PI / 2), ww = D * T[2] * sq, wh = D * T[1];
        ctx.fillStyle = night && o.lit ? rgba(C.warm, 0.75) : C.win; ctx.beginPath(); rrect(ctx, wx - ww / 2, y - wh, ww, wh, ww * 0.45); ctx.fill(); }
    });
    ctx.restore();
    // shell base cornice
    ctx.fillStyle = C.mid; ctx.fillRect(cx - Rs * 1.04, yShell - D * 0.012, Rs * 2.08, D * 0.022);
    ctx.fillStyle = rgba(C.lit, 0.9); ctx.fillRect(cx - Rs * 1.04, yShell - D * 0.012, Rs * 2.08, D * 0.006);
    // ---- attic (upper drum) with windows and pilasters ----
    var Ra = D * 0.43;
    cyl(cx - Ra, cx + Ra, yShell, yAtt, 1, C);
    for (i = -7; i <= 7; i++) { var pa = i / 7.6, px = cx + Math.sin(pa * PI / 2) * Ra, pw = D * 0.024 * Math.cos(pa * PI / 2);
      if (i < 7) { var ma = (i + 0.5) / 7.6, mx = cx + Math.sin(ma * PI / 2) * Ra, mw = D * 0.03 * Math.cos(ma * PI / 2);
        ctx.fillStyle = night && o.lit ? rgba(C.warm, 0.6) : C.win; ctx.beginPath(); rrect(ctx, mx - mw / 2, yAtt - attH * 0.82, mw, attH * 0.6, mw * 0.5); ctx.fill(); }
      ctx.fillStyle = rgba(pa > 0.2 ? C.shade : C.lit, 0.6); ctx.fillRect(px - pw / 2, yAtt - attH, pw, attH); }
    ctx.fillStyle = C.mid; ctx.fillRect(cx - Ra * 1.03, yAtt - attH - D * 0.012, Ra * 2.06, D * 0.016);
    // ---- entablature + balustrade over the peristyle ----
    var Rp = D * 0.5;
    cyl(cx - Rp * 1.02, cx + Rp * 1.02, yAtt, yEnt, 1, C);
    ctx.fillStyle = rgba(C.shade, 0.5); ctx.fillRect(cx - Rp * 1.02, yEnt - entH * 0.35, Rp * 2.04, entH * 0.12);
    for (i = 0; i < 40; i++) { var ba = (i / 39) * 2 - 1, bx = cx + Math.sin(ba * PI / 2) * Rp * 0.99; ctx.fillStyle = rgba(C.deep, 0.35); ctx.fillRect(bx - D * 0.003, yAtt + entH * 0.1, D * 0.006, entH * 0.4); }
    // ---- peristyle: the ring of columns with the dark drum wall behind ----
    ctx.fillStyle = night ? '#4a5088' : '#9aa0b6'; ctx.fillRect(cx - Rp * 0.94, yEnt, Rp * 1.88, perH);
    for (i = -8; i <= 8; i++) { var ca = i / 8.6, colx = cx + Math.sin(ca * PI / 2) * Rp * 0.98, cw = D * 0.034 * (0.55 + 0.45 * Math.cos(ca * PI / 2)), shade = (ca + 1) / 2;
      ctx.fillStyle = lg(ctx, colx - cw / 2, 0, colx + cw / 2, 0, [[0, night ? C.mid : C.lit], [0.6, mix(C.lit, C.shade, night ? 0.4 : shade * 0.8)], [1, C.shade]]);
      ctx.fillRect(colx - cw / 2, yEnt, cw, perH);
      ctx.fillStyle = rgba(C.lit, 0.9); ctx.fillRect(colx - cw * 0.65, yEnt, cw * 1.3, D * 0.008); ctx.fillRect(colx - cw * 0.6, yPer - D * 0.008, cw * 1.2, D * 0.008); }
    ctx.fillStyle = C.mid; ctx.fillRect(cx - Rp * 1.04, yPer - D * 0.006, Rp * 2.08, D * 0.03);
    // ---- lantern, its little dome, and the Statue of Freedom ----
    var yL = yTop, Lw = Rt * 1.65, Lh = D * 0.15;
    if (night && o.lit) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, cx, yL - Lh * 0.5, D * 0.28, '#ffe6a8', 0.55); ctx.restore(); }
    ctx.fillStyle = C.mid; ctx.fillRect(cx - Lw * 0.62, yL - D * 0.012, Lw * 1.24, D * 0.02);
    ctx.fillStyle = night && o.lit ? '#ffe9b0' : C.win; ctx.fillRect(cx - Lw * 0.42, yL - Lh, Lw * 0.84, Lh);
    for (i = -3; i <= 3; i++) { var lxx = cx + i * Lw * 0.14; ctx.fillStyle = i > 1 ? C.shade : C.lit; ctx.fillRect(lxx - D * 0.006, yL - Lh, D * 0.012, Lh); }
    ctx.fillStyle = C.mid; ctx.fillRect(cx - Lw * 0.5, yL - Lh - D * 0.014, Lw, D * 0.016);
    ctx.beginPath(); ctx.moveTo(cx - Lw * 0.42, yL - Lh - D * 0.014); ctx.quadraticCurveTo(cx - Lw * 0.36, yL - Lh - D * 0.07, cx, yL - Lh - D * 0.075); ctx.quadraticCurveTo(cx + Lw * 0.36, yL - Lh - D * 0.07, cx + Lw * 0.42, yL - Lh - D * 0.014); ctx.closePath();
    ctx.fillStyle = lg(ctx, cx - Lw * 0.4, 0, cx + Lw * 0.4, 0, [[0, C.lit], [1, C.shade]]); ctx.fill();
    var sy = yL - Lh - D * 0.072, sh = D * 0.11, bz = night ? '#3a3a52' : '#4a4a40', bzl = night ? '#8a8ab8' : '#8a8466';
    ctx.fillStyle = C.mid; ctx.fillRect(cx - D * 0.014, sy - D * 0.02, D * 0.028, D * 0.022);
    // the statue: a robed figure with a crested helmet, a sword hilt at her side and a wreath-topped shield
    ctx.fillStyle = bz; ctx.beginPath();
    ctx.moveTo(cx - sh * 0.16, sy - D * 0.02); ctx.quadraticCurveTo(cx - sh * 0.14, sy - sh * 0.55, cx - sh * 0.07, sy - sh * 0.78);
    ctx.lineTo(cx - sh * 0.05, sy - sh * 0.86); ctx.quadraticCurveTo(cx, sy - sh * 0.98, cx + sh * 0.06, sy - sh * 0.86);
    ctx.lineTo(cx + sh * 0.07, sy - sh * 0.78); ctx.quadraticCurveTo(cx + sh * 0.14, sy - sh * 0.55, cx + sh * 0.16, sy - D * 0.02); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx - sh * 0.04, sy - sh * 0.95); ctx.quadraticCurveTo(cx + sh * 0.02, sy - sh * 1.12, cx + sh * 0.11, sy - sh * 1.02); ctx.quadraticCurveTo(cx + sh * 0.03, sy - sh * 1.0, cx + sh * 0.02, sy - sh * 0.9); ctx.fill();
    ctx.fillRect(cx + sh * 0.14, sy - sh * 0.62, sh * 0.06, sh * 0.34);
    ctx.fillStyle = bzl; ctx.fillRect(cx - sh * 0.1, sy - sh * 0.7, sh * 0.04, sh * 0.6);
  }

  /* ---------------- an indoor US flag draped on a pole, gold eagle finial ---------------- */
  function flagPole(ctx, o) {
    var x = o.x, top = o.top, foot = o.foot, s = o.s, sd = o.side || 1, len = (foot - top), i, k, j;
    var pw = 2.6 * s, fy = top + len * 0.03;
    // stand
    ctx.fillStyle = o.night ? '#6a5a3a' : '#b08a3a';
    ctx.beginPath(); ctx.moveTo(x - 14 * s, foot); ctx.quadraticCurveTo(x, foot - 8 * s, x + 14 * s, foot); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(x + 6 * s, foot + 1 * s, 16 * s, 3 * s, 0, 0, TAU); ctx.fill();
    // pole
    ctx.fillStyle = lg(ctx, x - pw, 0, x + pw, 0, [[0, '#7a5a2a'], [0.4, '#e8c878'], [1, '#6a4a20']]); ctx.fillRect(x - pw / 2, top, pw, len);
    // The flag is sleeved on the pole along its hoist (13 stripes) and its fly droops down beside the pole, so the
    // stripes run down and away from the pole and the blue canton sits at the top next to the pole.
    // Cloth point (u along the fly 0..1, v across the stripes 0 top..1 bottom):
    var H = len * 0.22, Wd = len * 0.12, Lf = len * 0.34;
    function topE(u) { return [x + sd * (pw * 0.5 + Wd * Math.sin(u * PI * 0.5) * 1.05), fy + u * (H * 0.55 + Lf * 0.85) * u + u * H * 0.15]; }
    function botE(u) { return [x + sd * (pw * 0.5 + Wd * 0.62 * Math.sin(u * PI * 0.62)), fy + H + u * Lf]; }
    function P(u, v) { var a = topE(u), b = botE(u), f = Math.sin(v * PI * 6 + u * 2) * 1.4 * s * u; return [lerp(a[0], b[0], v) + f * sd, lerp(a[1], b[1], v)]; }
    function region(u0, u1, v0, v1) { ctx.beginPath(); var N = 12, q; for (j = 0; j <= N; j++) { q = P(lerp(u0, u1, j / N), v0); if (j) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); }
      for (j = N; j >= 0; j--) { q = P(lerp(u0, u1, j / N), v1); ctx.lineTo(q[0], q[1]); } ctx.closePath(); }
    region(0, 1, 0, 1); ctx.fillStyle = o.night ? '#d8d0dc' : '#f6f2ea'; ctx.fill();
    for (k = 0; k < 13; k += 2) { region(0, 1, k / 13, (k + 1) / 13); ctx.fillStyle = o.night ? '#7a2836' : '#b8283a'; ctx.fill(); }
    region(0, 0.4, 0, 7 / 13); ctx.fillStyle = o.night ? '#1a2048' : '#24306a'; ctx.fill();
    var sr = rng(o.seed || 7);
    dots(ctx, 30, [['#ffffff', 0.92]], function () { var q = P(0.03 + sr() * 0.34, 0.04 + sr() * 0.46); return [q[0], q[1], 0.6 * s, 0]; });
    // pleats: soft light and dark bands running down the drape
    region(0, 1, 0, 1); ctx.save(); ctx.clip();
    for (i = 0; i < 7; i++) { var v0 = (i + 0.2) / 7, q0 = P(0, v0), q1 = P(1, v0); ctx.strokeStyle = i % 2 ? 'rgba(255,255,255,0.22)' : 'rgba(30,10,30,0.28)'; ctx.lineWidth = Wd * 0.12; ctx.beginPath(); ctx.moveTo(q0[0], q0[1]);
      var qm = P(0.5, v0 + 0.03); ctx.quadraticCurveTo(qm[0], qm[1], q1[0], q1[1]); ctx.stroke(); }
    ctx.fillStyle = lg(ctx, x, 0, x + sd * Wd * 1.1, 0, [[0, 'rgba(0,0,0,0.25)'], [0.3, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.12)']]); ctx.fillRect(x - Wd * 1.2, fy, Wd * 2.4, H + Lf + 4 * s);
    ctx.restore();
    // gold fringe along the fly end
    ctx.strokeStyle = 'rgba(214,170,70,0.95)'; ctx.lineWidth = 1.6 * s; ctx.setLineDash([1.2 * s, 1.1 * s]); ctx.beginPath();
    for (j = 0; j <= 10; j++) { var qf = P(1, j / 10); if (j) ctx.lineTo(qf[0], qf[1] + 1.2 * s); else ctx.moveTo(qf[0], qf[1] + 1.2 * s); } ctx.stroke(); ctx.setLineDash([]);
    // finial: a little gold eagle with spread wings on a ball
    ctx.fillStyle = '#e0b84a'; ctx.beginPath(); ctx.arc(x, top - 2 * s, 2.6 * s, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x, top - 5 * s); ctx.quadraticCurveTo(x - 6 * s, top - 11 * s, x - 9 * s, top - 7 * s); ctx.quadraticCurveTo(x - 5 * s, top - 8 * s, x - 1.5 * s, top - 4 * s);
    ctx.quadraticCurveTo(x + 5 * s, top - 8 * s, x + 9 * s, top - 7 * s); ctx.quadraticCurveTo(x + 6 * s, top - 11 * s, x, top - 5 * s); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 0.6 * s, top - 7.5 * s, 1.5 * s, 0, TAU); ctx.fill();
  }

  /* ---------------- raised-panel wood wainscot ---------------- */
  function woodWall(ctx, x0, y0, x1, y1, o) {
    var P = o.pal, s = o.s, r = rng(o.seed || 11), cols = o.cols || 4, rows = o.rows || 1, i, j;
    ctx.fillStyle = lg(ctx, 0, y0, 0, y1, [[0, P[1]], [1, P[0]]]); ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    batch(ctx, Math.round((x1 - x0) * (y1 - y0) / (90 * s * s)), [[P[2], 0.6 * s, 0.18], [P[0], 0.8 * s, 0.25]], function () { var x = lerp(x0, x1, r()), y = lerp(y0, y1, r()), l = (8 + r() * 26) * s; return [x, y, x + l, y + (r() - 0.5) * s, r() < 0.5 ? 0 : 1]; });
    var gw = (x1 - x0) / cols, gh = (y1 - y0) / rows, m = Math.min(gw, gh) * 0.14;
    for (i = 0; i < cols; i++) for (j = 0; j < rows; j++) {
      var px = x0 + i * gw + m, py = y0 + j * gh + m * 1.1, pw = gw - m * 2, ph = gh - m * 2.2;
      ctx.fillStyle = rgba(P[0], 0.55); ctx.fillRect(px, py, pw, ph);
      ctx.fillStyle = lg(ctx, px, py, px + pw, py + ph, [[0, mix(P[1], P[2], 0.25)], [1, P[1]]]); ctx.fillRect(px + m * 0.45, py + m * 0.45, pw - m * 0.9, ph - m * 0.9);
      ctx.fillStyle = rgba(P[2], 0.55); ctx.fillRect(px, py, pw, Math.max(1, s * 0.9)); ctx.fillRect(px, py, Math.max(1, s * 0.9), ph);
      ctx.fillStyle = rgba('#000000', 0.25); ctx.fillRect(px, py + ph - s, pw, s); ctx.fillRect(px + pw - s, py, s, ph);
    }
  }
  /* ---------------- book spines on a shelf (x0..x1, standing on y1, up to y0) ---------------- */
  function books(ctx, x0, y0, x1, y1, s, r, night) {
    var cols = night ? ['#4a2a3a', '#2a3a5a', '#3a4a3a', '#5a4a2a', '#3a2a4a', '#5a3a2a'] : ['#8a2f3a', '#2f4a7a', '#3f6a4a', '#b08a3a', '#5a3a6a', '#a2542f', '#2a5a6a', '#d8cfb8'];
    var x = x0;
    while (x < x1 - 2 * s) {
      var bw = (2.6 + r() * 4) * s, bh = (y1 - y0) * (0.72 + r() * 0.26), c = cols[(r() * cols.length) | 0];
      if (x + bw > x1) bw = x1 - x;
      var lean = r() < 0.08 ? 1 : 0;
      ctx.save(); if (lean) { ctx.translate(x, y1); ctx.rotate(-0.18); ctx.translate(-x, -y1); }
      ctx.fillStyle = c; ctx.fillRect(x, y1 - bh, bw, bh);
      ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(x, y1 - bh, bw * 0.3, bh);
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x + bw * 0.82, y1 - bh, bw * 0.18, bh);
      if (r() < 0.6) { ctx.fillStyle = night ? 'rgba(220,190,120,0.45)' : 'rgba(240,210,130,0.85)'; ctx.fillRect(x + bw * 0.15, y1 - bh * 0.82, bw * 0.7, 0.9 * s); ctx.fillRect(x + bw * 0.15, y1 - bh * 0.25, bw * 0.7, 0.9 * s); }
      ctx.restore();
      x += bw + (lean ? 3 * s : 0.3 * s);
    }
  }

  window.DCK = { PI: PI, TAU: TAU, rng: rng, hash: hash, clamp: clamp, lerp: lerp, mix: mix, rgba: rgba, lg: lg, rg: rg, mk: mk, S: S, memo: memo, poly: poly, rrect: rrect,
    glow: glow, softGlow: softGlow, puff: puff, haze: haze, band: band, finish: finish, shafts: shafts, batch: batch, qcirc: qcirc, qell: qell, dots: dots, dabs: dabs, rects: rects,
    skyStrokes: skyStrokes, cloudForm: cloudForm, lens: lens, clump: clump, treeCrown: treeCrown, capitol: capitol, flagPole: flagPole, woodWall: woodWall, books: books };
})();
