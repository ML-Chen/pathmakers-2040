/* varrow.js — the Lantern Garden in Varrow at dusk (Quiet Year memorial, "The Lantern Garden").
   PAINT.varrow = { paint(ctx,w,h), overlay(ctx,w,h,t), focus, anchors, track }.
   Across the harbor: Varrow's old mill town on its hill, a lighthouse on the point and wind turbines on the ridge.
   This side: a low harbor wall, a lawn of lantern posts (one lantern per family) running down to a reflecting pond,
   the memorial stone, a bench, and two old maples framing the view. The middle stays open for a portrait and
   the lower third stays calm for subtitles. Painting utilities are adapted from src/paint_boston.js. */
(function () {
  'use strict';
  var PAINT = (window.PAINT = window.PAINT || {});
  var PI = Math.PI, TAU = PI * 2;
  function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function hash(i, s) { var x = Math.imul((i | 0) ^ Math.imul(s | 0, 0x9E3779B1), 0x27d4eb2d); x ^= x >>> 15; x = Math.imul(x, 0x85ebca6b); x ^= x >>> 13; x = Math.imul(x, 0xc2b2ae35); x ^= x >>> 16; return (x >>> 0) / 4294967296; }
  function vnoise(x, s) { var i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return hash(i, s) * (1 - u) + hash(i + 1, s) * u; }
  function fbm(x, s, oct) { var v = 0, a = 0.5, fr = 1, n = 0; for (var o = 0; o < (oct || 4); o++) { v += a * vnoise(x * fr, s + o * 131); n += a; a *= 0.5; fr *= 2.07; } return v / n; }
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
  function glow(ctx, x, y, r, col, a) { ctx.fillStyle = rg(ctx, x, y, 0, r, [[0, rgba(col, a)], [0.35, rgba(col, a * 0.35)], [1, rgba(col, 0)]]); ctx.fillRect(x - r, y - r, r * 2, r * 2); }
  function softGlow(ctx, x, y, r, col, a) { ctx.fillStyle = rg(ctx, x, y, 0, r, [[0, rgba(col, a)], [0.5, rgba(col, a * 0.5)], [1, rgba(col, 0)]]); ctx.fillRect(x - r, y - r, r * 2, r * 2); }
  function haze(ctx, x0, y0, x1, y1, col, a) { var cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, rx = (x1 - x0) / 2, ry = Math.max(1, (y1 - y0) / 2); ctx.save(); ctx.translate(cx, cy); ctx.scale(1, ry / rx); ctx.fillStyle = rg(ctx, 0, 0, 0, rx, [[0, rgba(col, a)], [0.6, rgba(col, a * 0.75)], [1, rgba(col, 0)]]); ctx.fillRect(-rx, -rx, rx * 2, rx * 2); ctx.restore(); }
  var QK = 0.914;
  function qcirc(ctx, x, y, r) { if (r < 1.1) { ctx.rect(x - r, y - r, r * 2, r * 2); return; } var c = r * QK; ctx.moveTo(x + r, y); ctx.quadraticCurveTo(x + c, y + c, x, y + r); ctx.quadraticCurveTo(x - c, y + c, x - r, y); ctx.quadraticCurveTo(x - c, y - c, x, y - r); ctx.quadraticCurveTo(x + c, y - c, x + r, y); }
  function qell(ctx, x, y, rx, ry, a) { var ca = Math.cos(a || 0), sa = Math.sin(a || 0), k = QK; function X(u, v) { return x + u * ca - v * sa; } function Y(u, v) { return y + u * sa + v * ca; }
    ctx.moveTo(X(rx, 0), Y(rx, 0)); ctx.quadraticCurveTo(X(rx * k, ry * k), Y(rx * k, ry * k), X(0, ry), Y(0, ry)); ctx.quadraticCurveTo(X(-rx * k, ry * k), Y(-rx * k, ry * k), X(-rx, 0), Y(-rx, 0));
    ctx.quadraticCurveTo(X(-rx * k, -ry * k), Y(-rx * k, -ry * k), X(0, -ry), Y(0, -ry)); ctx.quadraticCurveTo(X(rx * k, -ry * k), Y(rx * k, -ry * k), X(rx, 0), Y(rx, 0)); }
  function dots(ctx, n, cols, gen) { var i, k, b = []; for (k = 0; k < cols.length; k++) b.push([]); for (i = 0; i < n; i++) { var d = gen(i); if (d) b[d[3]].push(d); } ctx.save(); for (k = 0; k < cols.length; k++) { if (!b[k].length) continue; ctx.fillStyle = cols[k][0]; ctx.globalAlpha = cols[k][1]; ctx.beginPath(); for (i = 0; i < b[k].length; i++) { var q = b[k][i]; qcirc(ctx, q[0], q[1], q[2]); } ctx.fill(); } ctx.restore(); }
  function dabs(ctx, n, cols, gen) { var i, k, b = []; for (k = 0; k < cols.length; k++) b.push([]); for (i = 0; i < n; i++) { var d = gen(i); if (d) b[d[4]].push(d); } ctx.save(); for (k = 0; k < cols.length; k++) { if (!b[k].length) continue; ctx.fillStyle = cols[k][0]; ctx.globalAlpha = cols[k][1]; ctx.beginPath(); for (i = 0; i < b[k].length; i++) { var q = b[k][i]; qell(ctx, q[0], q[1], q[2], q[3], q[5] || 0); } ctx.fill(); } ctx.restore(); }
  function batch(ctx, n, cols, gen) { var paths = [], i, k; for (k = 0; k < cols.length; k++) paths.push([]); for (i = 0; i < n; i++) { var s = gen(i); if (s) paths[s[4]].push(s); } ctx.save(); ctx.lineCap = 'round';
    for (k = 0; k < cols.length; k++) { var p = paths[k]; if (!p.length) continue; ctx.beginPath(); for (i = 0; i < p.length; i++) { ctx.moveTo(p[i][0], p[i][1]); if (p[i].length > 5) ctx.quadraticCurveTo(p[i][5], p[i][6], p[i][2], p[i][3]); else ctx.lineTo(p[i][2], p[i][3]); } ctx.strokeStyle = cols[k][0]; ctx.lineWidth = cols[k][1]; ctx.globalAlpha = cols[k][2]; ctx.stroke(); } ctx.restore(); }
  function gradAt(st, t) { if (t <= st[0][0]) return st[0][1]; for (var i = 1; i < st.length; i++) if (t <= st[i][0]) return mix(st[i - 1][1], st[i][1], (t - st[i - 1][0]) / (st[i][0] - st[i - 1][0])); return st[st.length - 1][1]; }
  function skyStrokes(ctx, x0, x1, y0, y1, st, n, r, s, al) { var B = {}, keys = [], i; for (i = 0; i < n; i++) { var y = lerp(y0, y1, r()), x = lerp(x0, x1, r()), tq = Math.round(clamp((y - y0) / (y1 - y0) + (r() - 0.5) * 0.08, 0, 1) * 12), key = tq; if (!B[key]) { B[key] = { c: gradAt(st, tq / 12), q: [] }; keys.push(key); } B[key].q.push([x, y, (14 + r() * 40) * s, (1.5 + r() * 3) * s, (r() - 0.5) * 0.08]); }
    ctx.save(); ctx.globalAlpha = al; for (i = 0; i < keys.length; i++) { var b = B[keys[i]]; ctx.fillStyle = b.c; ctx.beginPath(); for (var j = 0; j < b.q.length; j++) { var q = b.q[j]; qell(ctx, q[0], q[1], q[2], q[3], q[4]); } ctx.fill(); } ctx.restore(); }
  var SPR = {};
  function glowSpr(col, hard) { var key = col + (hard ? 'h' : ''); if (SPR[key] !== undefined) return SPR[key]; var c = mk(64, 64); if (c) { var g = c.getContext('2d'); g.fillStyle = rg(g, 32, 32, 0, 32, hard ? [[0, rgba('#ffffff', 1)], [0.12, rgba(col, 1)], [0.3, rgba(col, 0.35)], [1, rgba(col, 0)]] : [[0, rgba(col, 1)], [0.25, rgba(col, 0.55)], [1, rgba(col, 0)]]); g.fillRect(0, 0, 64, 64); } SPR[key] = c; return c; }
  var grainCv = null;
  function finish(ctx, w, h, gradeCol, gradeA, vig, grainA, vigCol, vy) {
    try { ctx.save(); if (gradeCol) { ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = gradeA; ctx.fillStyle = gradeCol; ctx.fillRect(0, 0, w, h); }
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; var R = Math.max(w, h) * 0.75, vc = vigCol || '#14101e';
      if (vig > 0) { ctx.fillStyle = rg(ctx, w / 2, h * (vy || 0.42), R * 0.35, R, [[0, rgba(vc, 0)], [1, rgba(vc, vig)]]); ctx.fillRect(0, 0, w, h); }
      if (!grainCv && typeof document !== 'undefined') { grainCv = mk(128, 128); var g = grainCv.getContext('2d'), id = g.createImageData(128, 128), r = rng(4242), i, v; for (i = 0; i < 128 * 128; i++) { v = (r() * 255) | 0; id.data[i * 4] = v; id.data[i * 4 + 1] = v; id.data[i * 4 + 2] = v; id.data[i * 4 + 3] = 255; } g.putImageData(id, 0, 0); }
      if (grainCv && grainA > 0) { ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = grainA; ctx.fillStyle = ctx.createPattern(grainCv, 'repeat'); ctx.fillRect(0, 0, w, h); }
      ctx.restore(); } catch (e) { try { ctx.restore(); } catch (e2) {} }
  }
  function lens(ctx, x, y, L, Wd, a) { var c = Math.cos(a), sn = Math.sin(a), tx = x + c * L, ty = y + sn * L, mx = x + c * L * 0.5, my = y + sn * L * 0.5, nx = -sn * Wd, ny = c * Wd; ctx.moveTo(x, y); ctx.quadraticCurveTo(mx + nx, my + ny, tx, ty); ctx.quadraticCurveTo(mx - nx, my - ny, x, y); }
  /* foliage clump of leaf dabs; pal [deep, shadow, mid, lit, rim]; light from (lx,ly) */
  function clump(ctx, cx, cy, R, pal, r, lx, ly, dens) {
    ctx.fillStyle = rg(ctx, cx + lx * R * 0.3, cy + ly * R * 0.3, 0, R * 0.95, [[0, pal[1]], [0.6, pal[0]], [1, pal[0]]]); ctx.beginPath(); ctx.arc(cx, cy, R * 0.8, 0, TAU); ctx.fill();
    var n = Math.min(220, Math.round((30 + R * R * 0.3) * (dens || 1))), B = [[], [], [], [], []], i, k;
    for (i = 0; i < n; i++) { var a = r() * TAU, rr = R * Math.sqrt(r()) * 0.98, px = cx + Math.cos(a) * rr, py = cy + Math.sin(a) * rr * 0.92, nx = (px - cx) / R, ny = (py - cy) / R;
      var v = (nx * lx + ny * ly) * 0.55 - ny * 0.15 + (1 - rr / R) * 0.05 + (r() - 0.5) * 0.4 + 0.42, b = v < 0.24 ? 0 : v < 0.44 ? 1 : v < 0.64 ? 2 : v < 0.88 ? 3 : 4; if (b === 4 && rr < R * 0.72) b = 3;
      var L = R * (0.12 + r() * 0.11); B[b].push([px, py, L, L * (0.28 + r() * 0.12), a + PI * 0.5 + (r() - 0.5) * 1.6]); }
    for (k = 0; k < 5; k++) { if (!B[k].length) continue; ctx.fillStyle = pal[k]; ctx.beginPath(); for (i = 0; i < B[k].length; i++) { var q = B[k][i]; lens(ctx, q[0] - Math.cos(q[4]) * q[2] * 0.5, q[1] - Math.sin(q[4]) * q[2] * 0.5, q[2], q[3], q[4]); } ctx.fill(); }
  }
  function limb(ctx, x0, y0, x1, y1, w0, w1, bend, col) { var mx = (x0 + x1) / 2 + bend, my = (y0 + y1) / 2, N = 12, Lp = [], Rp = [], j;
    for (j = 0; j <= N; j++) { var t = j / N, u = 1 - t, px = u * u * x0 + 2 * u * t * mx + t * t * x1, py = u * u * y0 + 2 * u * t * my + t * t * y1, dx = 2 * u * (mx - x0) + 2 * t * (x1 - mx), dy = 2 * u * (my - y0) + 2 * t * (y1 - my), l = Math.sqrt(dx * dx + dy * dy) || 1, wd = lerp(w0, w1, t) * 0.5; Lp.push([px - dy / l * wd, py + dx / l * wd]); Rp.push([px + dy / l * wd, py - dx / l * wd]); }
    ctx.beginPath(); ctx.moveTo(Lp[0][0], Lp[0][1]); for (j = 1; j <= N; j++) ctx.lineTo(Lp[j][0], Lp[j][1]); for (j = N; j >= 0; j--) ctx.lineTo(Rp[j][0], Rp[j][1]); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); }

  var LCOL = ['#ffb347', '#ffd27a', '#ff9a6a', '#ffc46a', '#ffe08a', '#ff8a7a', '#9be8d8', '#c8b8ff'];

  /* ---------------- layout, shared by paint and overlay ---------------- */
  var L = memo(function (w, h) {
    var s = S(w, h), o = { s: s, hz: h * 0.405, wall: h * 0.47, moon: [w * 0.67, h * 0.2], moonR: 10 * s };
    o.pond = { x: w * 0.53, y: h * 0.712, rx: w * 0.4, ry: h * 0.052 };
    o.stone = { x: w * 0.17, y: h * 0.655, w: w * 0.25 };
    o.bench = { x: w * 0.86, y: h * 0.645, w: w * 0.2 };
    o.light = [w * 0.17, o.hz - h * 0.055]; // lighthouse lamp
    // lantern posts: rows from the harbor wall (far) to the foreground; skip the pond, the path and the stone
    var r = rng(91031), posts = [], rows = 22, j, i;
    for (j = 0; j < rows; j++) {
      var t = j / (rows - 1), y = lerp(o.wall + h * 0.012, h * 0.985, Math.pow(t, 1.65)), sc = lerp(0.16, 1.25, Math.pow(t, 1.25)) * s, gap = lerp(7, 46, Math.pow(t, 1.25)) * s, x = -gap * r();
      for (; x < w + gap; x += gap * (0.8 + r() * 0.4)) {
        var dxp = (x - o.pond.x) / (o.pond.rx * 1.12), dyp = (y - o.pond.y) / (o.pond.ry * 2.2);
        if (dxp * dxp + dyp * dyp < 1) continue;
        var pathX = w * 0.5 + Math.sin(t * 3.2) * w * 0.08 * t; if (Math.abs(x - pathX) < (6 + 40 * t) * s && y > o.pond.y) continue;
        if (Math.abs(x - o.stone.x) < o.stone.w * 0.62 && y > o.stone.y - h * 0.06 && y < o.stone.y + h * 0.02) continue;
        if (Math.abs(x - o.bench.x) < o.bench.w * 0.6 && y > o.bench.y - h * 0.04 && y < o.bench.y + h * 0.015) continue;
        if (t > 0.6 && y > h * 0.8 && x > w * 0.22 && x < w * 0.78) continue; // keep the foreground calm under subtitles
        posts.push({ x: x, y: y, sc: sc, col: LCOL[(r() * LCOL.length) | 0], ph: r() * TAU, t: t });
      }
    }
    o.posts = posts;
    // floating lanterns on the pond
    o.floaters = []; for (i = 0; i < 9; i++) o.floaters.push({ u: hash(i, 5), v: hash(i, 6) * 2 - 1, col: LCOL[i % LCOL.length], sp: 0.004 + hash(i, 7) * 0.006 });
    // lit windows across the harbor (for the overlay's slow window changes)
    o.flick = [];
    return o;
  });

  /* a paper lantern on a short post: base at (x,y), size sc (1 = near) */
  function lanternPost(ctx, x, y, sc, col, near) {
    var ph = 26 * sc, lw = 6.2 * sc, lh = 8.6 * sc, ly = y - ph - lh * 0.5;
    ctx.strokeStyle = '#1a1626'; ctx.lineWidth = Math.max(0.7, 1.5 * sc); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - ph - lh * 0.1); ctx.stroke();
    if (near) { ctx.beginPath(); ctx.moveTo(x - 3.5 * sc, y - ph + 1.5 * sc); ctx.lineTo(x + 3.5 * sc, y - ph + 1.5 * sc); ctx.stroke(); }
    glow(ctx, x, ly, lh * 3.2, col, 0.32);
    // body: Bezier barrel with caps
    var top = ly - lh * 0.5, bot = ly + lh * 0.5;
    ctx.fillStyle = rg(ctx, x - lw * 0.15, ly - lh * 0.1, 0, lw * 0.9, [[0, '#fff6dc'], [0.45, mix(col, '#ffffff', 0.35)], [1, mix(col, '#7a3010', 0.25)]]);
    ctx.beginPath(); ctx.moveTo(x - lw * 0.32, top); ctx.bezierCurveTo(x - lw * 0.62, top + lh * 0.18, x - lw * 0.62, bot - lh * 0.18, x - lw * 0.32, bot); ctx.lineTo(x + lw * 0.32, bot);
    ctx.bezierCurveTo(x + lw * 0.62, bot - lh * 0.18, x + lw * 0.62, top + lh * 0.18, x + lw * 0.32, top); ctx.closePath(); ctx.fill();
    if (near) { ctx.strokeStyle = rgba(mix(col, '#5a2010', 0.55), 0.55); ctx.lineWidth = Math.max(0.5, 0.7 * sc); ctx.beginPath();
      for (var k = -1; k <= 1; k++) { ctx.moveTo(x + k * lw * 0.22, top); ctx.quadraticCurveTo(x + k * lw * 0.36, ly, x + k * lw * 0.22, bot); } ctx.stroke(); }
    ctx.fillStyle = '#2a1e2a'; ctx.fillRect(x - lw * 0.36, top - 1.1 * sc, lw * 0.72, 1.6 * sc); ctx.fillRect(x - lw * 0.36, bot - 0.5 * sc, lw * 0.72, 1.6 * sc);
  }

  PAINT.varrow = {
    track: 'night',
    focus: { x: 0.5, y: 0.42 },
    anchors: { pond: { x: 0.53, y: 0.712 }, stone: { x: 0.17, y: 0.655 }, bench: { x: 0.86, y: 0.645 }, wall: { y: 0.47 } },
    paint: function (ctx, w, h) {
      try {
        var o = L(w, h), s = o.s, r = rng(91001), i, x, y, hz = o.hz;
        /* ---------- blue-hour sky ---------- */
        var SKY = [[0, '#0e1240'], [0.32, '#232668'], [0.58, '#4a3c86'], [0.78, '#9a5a8e'], [0.92, '#e08a86'], [1, '#f7b37e']];
        ctx.fillStyle = lg(ctx, 0, 0, 0, hz, SKY); ctx.fillRect(0, 0, w, hz + 2);
        skyStrokes(ctx, -20 * s, w + 20 * s, 0, hz, SKY, 240, r, s, 0.14);
        dots(ctx, 420, [['#ffffff', 0.85], ['#d8e0ff', 0.6], ['#ffe8c8', 0.55]], function () { var yy = Math.pow(r(), 1.6) * hz * 0.62; return [r() * w, yy, (0.3 + Math.pow(r(), 6) * 1.1) * s, (r() * 3) | 0]; });
        var sp = glowSpr('#dfe6ff', true); if (sp) { for (i = 0; i < 10; i++) { var gx = r() * w, gy = r() * hz * 0.45, gs = (4 + r() * 7) * s; ctx.globalAlpha = 0.7; ctx.drawImage(sp, gx - gs, gy - gs, gs * 2, gs * 2); } ctx.globalAlpha = 1; }
        // crescent moon
        var mx = o.moon[0], my = o.moon[1], mR = o.moonR;
        softGlow(ctx, mx, my, mR * 8, '#8a90d8', 0.28); softGlow(ctx, mx, my, mR * 3, '#efe8ff', 0.3);
        ctx.save(); ctx.beginPath(); ctx.arc(mx, my, mR, 0, TAU); ctx.clip(); ctx.beginPath(); ctx.rect(mx - mR, my - mR, mR * 2, mR * 2); ctx.arc(mx + mR * 0.45, my - mR * 0.25, mR * 0.9, 0, TAU); ctx.fillStyle = '#fff6dc'; ctx.fill('evenodd'); ctx.restore();
        // long sunset clouds lit from below
        for (i = 0; i < 7; i++) { var cy = hz * (0.55 + r() * 0.35), cx = r() * w, cw = w * (0.25 + r() * 0.35), ch = (2 + r() * 4) * s, lit = (cy / hz);
          ctx.save(); ctx.globalAlpha = 0.55; ctx.fillStyle = lg(ctx, 0, cy - ch, 0, cy + ch, [[0, mix('#4a3c86', '#2a2a6a', 0.3)], [0.6, mix('#9a5a8e', '#e88a86', lit - 0.5)], [1, mix('#ffb886', '#ffd8a8', lit - 0.6)]]);
          ctx.beginPath(); for (var k = 0; k < 7; k++) qell(ctx, cx + (k - 3) * cw / 8, cy + Math.sin(k * 1.7 + i) * ch * 0.4, cw / 7, ch * (0.6 + 0.4 * Math.sin(k * 2.1 + i)), 0); ctx.fill(); ctx.restore(); }
        haze(ctx, -w * 0.2, hz - h * 0.1, w * 1.2, hz + h * 0.02, '#ffb488', 0.35);
        /* ---------- across the harbor: the hill town ---------- */
        // far ridge with wind turbines
        ctx.fillStyle = lg(ctx, 0, hz - h * 0.09, 0, hz, [[0, '#4c3f7a'], [1, '#6a4e86']]);
        ctx.beginPath(); ctx.moveTo(0, hz); for (x = 0; x <= w; x += 4 * s) ctx.lineTo(x, hz - h * (0.035 + 0.045 * fbm(x / w * 3 + 1.3, 11, 4)) - (x > w * 0.55 ? h * 0.022 * Math.sin((x / w - 0.55) * 4.5) : 0)); ctx.lineTo(w, hz); ctx.fill();
        o.turb = [];
        for (i = 0; i < 4; i++) { var tx = w * (0.6 + i * 0.1), ty = hz - h * (0.07 + 0.012 * Math.sin(i * 2.1)), th = 26 * s * (1 - i * 0.08); o.turb.push([tx, ty - th, th * 0.42]);
          ctx.strokeStyle = '#8a7aae'; ctx.lineWidth = Math.max(0.8, 1.1 * s); ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx, ty - th); ctx.stroke(); }
        // town: rows of houses climbing the hill, a brick mill with a clock tower, a white steeple
        var town = rng(91011), baseY = hz - h * 0.004;
        function townRow(y0, n0, x0, x1, hmin, hmax, palW, palR, litP, seed) { var rr = rng(seed); for (var xx = x0; xx < x1;) { var bw = (5 + rr() * 9) * s, bh = (hmin + rr() * (hmax - hmin)) * s, yy = y0 - Math.sin((xx / w) * PI) * h * 0.02;
            ctx.fillStyle = palW[(rr() * palW.length) | 0]; ctx.fillRect(xx, yy - bh, bw, bh + 2 * s); ctx.fillStyle = palR[(rr() * palR.length) | 0]; ctx.beginPath(); ctx.moveTo(xx - 0.8 * s, yy - bh); ctx.lineTo(xx + bw / 2, yy - bh - bw * 0.45); ctx.lineTo(xx + bw + 0.8 * s, yy - bh); ctx.fill();
            var nw = Math.max(1, Math.floor(bw / (3 * s))); for (var k = 0; k < nw; k++) if (rr() < litP) { ctx.fillStyle = rr() < 0.8 ? '#ffd27a' : '#ffe8b8'; ctx.fillRect(xx + 1.2 * s + k * 3 * s, yy - bh * 0.62, 1.3 * s, 1.5 * s); }
            xx += bw * (0.85 + rr() * 0.3); } }
        townRow(baseY - h * 0.03, 0, w * 0.12, w * 0.58, 4, 8, ['#4a3a6e', '#52406e', '#443866'], ['#2e2650', '#362a58'], 0.35, 91012);
        townRow(baseY - h * 0.012, 0, w * 0.06, w * 0.7, 5, 10, ['#5a4472', '#624a74', '#4e3e6c'], ['#36294e', '#3e2e56'], 0.45, 91013);
        // brick mill + clock tower
        var mxl = w * 0.36, mw = w * 0.14, mt = baseY - h * 0.05;
        ctx.fillStyle = '#5e3a5a'; ctx.fillRect(mxl, mt, mw, baseY - mt); ctx.fillStyle = '#4a2e4c'; ctx.fillRect(mxl + mw * 0.7, mt, mw * 0.3, baseY - mt);
        for (i = 0; i < 3; i++) for (var c2 = 0; c2 < 7; c2++) if (town() < 0.55) { ctx.fillStyle = town() < 0.85 ? '#ffcc70' : '#ffe2a0'; ctx.fillRect(mxl + mw * 0.06 + c2 * mw * 0.13, mt + (h * 0.008) + i * h * 0.012, mw * 0.06, h * 0.006); }
        var tw0 = mxl + mw * 0.12, tw = 6 * s; ctx.fillStyle = '#6a4262'; ctx.fillRect(tw0, mt - h * 0.035, tw, h * 0.035); ctx.beginPath(); ctx.moveTo(tw0 - s, mt - h * 0.035); ctx.lineTo(tw0 + tw / 2, mt - h * 0.05); ctx.lineTo(tw0 + tw + s, mt - h * 0.035); ctx.fillStyle = '#3e2a4e'; ctx.fill();
        ctx.fillStyle = '#ffe8b0'; ctx.beginPath(); ctx.arc(tw0 + tw / 2, mt - h * 0.024, 2 * s, 0, TAU); ctx.fill(); o.clock = [tw0 + tw / 2, mt - h * 0.024];
        ctx.fillStyle = '#5a3858'; ctx.fillRect(mxl + mw * 0.8, mt - h * 0.03, 3 * s, h * 0.03);
        // white church steeple
        var sx = w * 0.62, sb = baseY - h * 0.02; ctx.fillStyle = '#d8d0ea'; ctx.fillRect(sx - 3.5 * s, sb - h * 0.04, 7 * s, h * 0.04); ctx.beginPath(); ctx.moveTo(sx - 4.5 * s, sb - h * 0.04); ctx.lineTo(sx, sb - h * 0.078); ctx.lineTo(sx + 4.5 * s, sb - h * 0.04); ctx.fillStyle = '#c8bede'; ctx.fill();
        ctx.fillStyle = '#ffd27a'; ctx.fillRect(sx - 1.2 * s, sb - h * 0.03, 2.4 * s, 3.4 * s);
        townRow(baseY, 0, -w * 0.02, w * 1.02, 4, 7, ['#6a4e7c', '#725480', '#644a7a'], ['#3e2e56', '#463460'], 0.5, 91014);
        // lighthouse on the point (left)
        var lx = o.light[0], lyb = hz + 1 * s; ctx.fillStyle = '#3e3462'; ctx.beginPath(); ctx.moveTo(-w * 0.05, hz + 2 * s); ctx.quadraticCurveTo(lx - 8 * s, hz - h * 0.012, lx + 18 * s, hz + 2 * s); ctx.fill();
        ctx.fillStyle = lg(ctx, lx - 5 * s, 0, lx + 5 * s, 0, [[0, '#f2ecf8'], [1, '#b8b0d0']]); ctx.beginPath(); ctx.moveTo(lx - 5 * s, lyb - h * 0.004); ctx.lineTo(lx - 3.4 * s, o.light[1] + 4 * s); ctx.lineTo(lx + 3.4 * s, o.light[1] + 4 * s); ctx.lineTo(lx + 5 * s, lyb - h * 0.004); ctx.fill();
        ctx.fillStyle = '#c0605a'; ctx.fillRect(lx - 4.6 * s, lyb - h * 0.03, 9.2 * s, 3 * s); ctx.fillRect(lx - 4 * s, lyb - h * 0.045, 8 * s, 3 * s);
        ctx.fillStyle = '#2a2448'; ctx.fillRect(lx - 4 * s, o.light[1] - 2 * s, 8 * s, 6 * s); ctx.beginPath(); ctx.moveTo(lx - 4.6 * s, o.light[1] - 2 * s); ctx.lineTo(lx, o.light[1] - 6 * s); ctx.lineTo(lx + 4.6 * s, o.light[1] - 2 * s); ctx.fill();
        glow(ctx, lx, o.light[1] + 1 * s, 14 * s, '#ffe8a0', 0.8);
        /* ---------- harbor water ---------- */
        var wy0 = hz, wy1 = o.wall;
        ctx.fillStyle = lg(ctx, 0, wy0, 0, wy1, [[0, '#c4708a'], [0.25, '#7a4c88'], [1, '#2c2a64']]); ctx.fillRect(0, wy0, w, wy1 - wy0);
        batch(ctx, 500, [['#ffc890', 0.9 * s, 0.5], ['#2a2458', 1 * s, 0.45], ['#e8a0b8', 0.8 * s, 0.4]], function () { var p = Math.pow(r(), 1.2), yy = wy0 + 1.5 * s + p * (wy1 - wy0 - 2 * s), xx = r() * w, l = (2 + p * 12) * s; return [xx, yy, xx + l, yy, r() < 0.3 ? 0 : r() < 0.6 ? 1 : 2]; });
        // town light streaks on the water
        batch(ctx, 260, [['#ffd27a', 1.1 * s, 0.45], ['#fff0c8', 0.8 * s, 0.4]], function () { var xx = w * 0.05 + r() * w * 0.65, yy = wy0 + 2 * s + Math.pow(r(), 1.6) * (wy1 - wy0) * 0.7; return [xx, yy, xx + (1 + r() * 3) * s, yy, r() < 0.6 ? 0 : 1]; });
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = lg(ctx, o.light[0] - 6 * s, 0, o.light[0] + 6 * s, 0, [[0, 'rgba(255,230,160,0)'], [0.5, 'rgba(255,230,160,0.25)'], [1, 'rgba(255,230,160,0)']]); ctx.fillRect(o.light[0] - 6 * s, wy0, 12 * s, (wy1 - wy0) * 0.8); ctx.restore();
        // moored sailboats
        for (i = 0; i < 4; i++) { var bx = w * (0.2 + i * 0.2 + r() * 0.06), by = wy0 + (wy1 - wy0) * (0.3 + r() * 0.35), bs = (3 + r() * 1.6) * s;
          ctx.fillStyle = '#e8e0f4'; ctx.beginPath(); ctx.moveTo(bx - bs * 2, by); ctx.lineTo(bx + bs * 2, by); ctx.lineTo(bx + bs * 1.5, by + bs * 0.7); ctx.lineTo(bx - bs * 1.5, by + bs * 0.7); ctx.fill();
          ctx.strokeStyle = '#d8d0ea'; ctx.lineWidth = Math.max(0.6, 0.6 * s); ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by - bs * 4.2); ctx.stroke(); glow(ctx, bx, by - bs * 4.2, 3.5 * s, '#ffe0a0', 0.9); }
        /* ---------- harbor wall + the far edge of the garden ---------- */
        var wl = o.wall;
        ctx.fillStyle = lg(ctx, 0, wl - 5 * s, 0, wl + 4 * s, [[0, '#8a7aa8'], [0.4, '#5a4a7a'], [1, '#2a2448']]); ctx.fillRect(0, wl - 5 * s, w, 9 * s);
        ctx.strokeStyle = 'rgba(30,24,50,0.5)'; ctx.lineWidth = 0.6 * s; ctx.beginPath(); for (x = 0; x < w; x += 9 * s) { ctx.moveTo(x, wl - 5 * s); ctx.lineTo(x, wl + 4 * s); } ctx.stroke();
        /* ---------- the lawn ---------- */
        ctx.fillStyle = lg(ctx, 0, wl + 4 * s, 0, h, [[0, '#1e2e44'], [0.25, '#20363e'], [0.6, '#1c3034'], [1, '#14222a']]); ctx.fillRect(0, wl + 4 * s, w, h - wl);
        // warm light pooled over the lawn by the lanterns
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; haze(ctx, -w * 0.1, wl, w * 1.1, wl + h * 0.12, '#ff9a50', 0.12); haze(ctx, -w * 0.3, h * 0.6, w * 0.6, h * 0.95, '#ff9a50', 0.08); haze(ctx, w * 0.5, h * 0.55, w * 1.3, h * 0.95, '#ff9a50', 0.08); ctx.restore();
        batch(ctx, 2600, [['#2e5a4a', 0.9 * s, 0.6], ['#3e6e52', 0.8 * s, 0.5], ['#0e1a1e', 0.9 * s, 0.5], ['#7a6a48', 0.8 * s, 0.35]], function () {
          var yy = wl + 6 * s + Math.pow(r(), 0.7) * (h - wl), p = (yy - wl) / (h - wl), xx = r() * w, l = (1 + p * 7 + r() * 2) * s, lean = (r() - 0.5) * l * 0.6; return [xx, yy, xx + lean, yy - l, r() < 0.35 ? 0 : r() < 0.6 ? 1 : r() < 0.85 ? 2 : 3, xx + lean * 0.2, yy - l * 0.6]; });
        // the path: pale stepping stones from the foreground up past the pond
        var PATH = [[0.5, 1.02], [0.47, 0.93], [0.52, 0.86], [0.5, 0.8], [0.45, 0.775]];
        for (i = 0; i < 26; i++) { var u = i / 25, seg = Math.min(PATH.length - 2, Math.floor(u * (PATH.length - 1))), f2 = u * (PATH.length - 1) - seg, px = lerp(PATH[seg][0], PATH[seg + 1][0], f2) * w, py = lerp(PATH[seg][1], PATH[seg + 1][1], f2) * h, sz = lerp(22, 8, Math.pow(u, 0.7)) * s;
          if (i % 2) continue; ctx.fillStyle = lg(ctx, 0, py - sz * 0.3, 0, py + sz * 0.3, [[0, '#8a8aa8'], [1, '#4a4a68']]); ctx.beginPath(); qell(ctx, px + (hash(i, 3) - 0.5) * sz * 0.4, py, sz, sz * 0.32, (hash(i, 4) - 0.5) * 0.2); ctx.fill();
          ctx.fillStyle = 'rgba(255,190,130,0.18)'; ctx.beginPath(); qell(ctx, px + (hash(i, 3) - 0.5) * sz * 0.4, py - sz * 0.08, sz * 0.8, sz * 0.18, 0); ctx.fill(); }
        /* ---------- the reflecting pond ---------- */
        var P = o.pond;
        ctx.save(); ctx.beginPath(); qell(ctx, P.x, P.y, P.rx, P.ry, 0); ctx.clip();
        ctx.fillStyle = lg(ctx, 0, P.y - P.ry, 0, P.y + P.ry, [[0, '#f0a080'], [0.25, '#9a5a8e'], [0.6, '#3a3478'], [1, '#141846']]); ctx.fillRect(P.x - P.rx, P.y - P.ry, P.rx * 2, P.ry * 2);
        batch(ctx, 260, [['#ffd0a0', 0.8 * s, 0.35], ['#0e1238', 1 * s, 0.4]], function () { var xx = P.x + (r() - 0.5) * P.rx * 1.9, yy = P.y + (r() - 0.5) * P.ry * 1.8, l = (3 + r() * 10) * s; return [xx, yy, xx + l, yy, r() < 0.5 ? 0 : 1]; });
        ctx.restore();
        ctx.strokeStyle = '#6a6a8e'; ctx.lineWidth = 2.2 * s; ctx.beginPath(); qell(ctx, P.x, P.y, P.rx, P.ry, 0); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,200,150,0.35)'; ctx.lineWidth = 1 * s; ctx.beginPath(); qell(ctx, P.x, P.y - 1 * s, P.rx * 0.995, P.ry * 0.97, 0); ctx.stroke();
        // reeds and lily pads at the pond's edge
        dabs(ctx, 14, [['#2e6a52', 0.9], ['#3e8a62', 0.8]], function (k) { var a = r() * TAU; return [P.x + Math.cos(a) * P.rx * 0.82, P.y + Math.sin(a) * P.ry * 0.6, (4 + r() * 4) * s, (1.6 + r()) * s, r() < 0.5 ? 0 : 1, 0]; });
        batch(ctx, 60, [['#1e3a2e', 1.2 * s, 0.9], ['#4a7a4a', 1 * s, 0.8]], function () { var side = r() < 0.5 ? -1 : 1, xx = P.x + side * P.rx * (0.9 + r() * 0.12), yy = P.y + (r() - 0.3) * P.ry * 0.8, l = (8 + r() * 12) * s; return [xx, yy, xx + (r() - 0.5) * 4 * s, yy - l, r() < 0.6 ? 0 : 1]; });
        /* ---------- lantern posts, far to near ---------- */
        for (i = 0; i < o.posts.length; i++) { var Q = o.posts[i]; if (Q.t < 0.5) lanternPost(ctx, Q.x, Q.y, Q.sc, Q.col, false); }
        /* ---------- the memorial stone ---------- */
        var St = o.stone, sw = St.w, sh2 = sw * 0.62, sx0 = St.x - sw / 2, sy0 = St.y;
        ctx.fillStyle = 'rgba(8,10,20,0.35)'; ctx.beginPath(); qell(ctx, St.x, sy0, sw * 0.6, sw * 0.08, 0); ctx.fill();
        ctx.fillStyle = lg(ctx, sx0, 0, sx0 + sw, 0, [[0, '#a8a0c8'], [0.55, '#7e76a2'], [1, '#4e4672']]);
        ctx.beginPath(); ctx.moveTo(sx0, sy0); ctx.bezierCurveTo(sx0 - sw * 0.04, sy0 - sh2 * 0.6, sx0 + sw * 0.12, sy0 - sh2 * 1.02, St.x, sy0 - sh2); ctx.bezierCurveTo(sx0 + sw * 0.88, sy0 - sh2 * 1.0, sx0 + sw * 1.04, sy0 - sh2 * 0.55, sx0 + sw, sy0); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(255,200,150,0.45)'; ctx.lineWidth = 1.4 * s; ctx.beginPath(); ctx.moveTo(sx0 + sw * 0.06, sy0 - sh2 * 0.6); ctx.bezierCurveTo(sx0 + sw * 0.16, sy0 - sh2 * 0.92, sx0 + sw * 0.32, sy0 - sh2, St.x, sy0 - sh2 * 0.995); ctx.stroke();
        ctx.fillStyle = 'rgba(40,30,70,0.75)'; ctx.font = '700 ' + (sw * 0.09).toFixed(1) + 'px Nunito, sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('THE QUIET YEAR', St.x, sy0 - sh2 * 0.7); ctx.font = '700 ' + (sw * 0.12).toFixed(1) + 'px Nunito, sans-serif'; ctx.fillText('2030', St.x, sy0 - sh2 * 0.47);
        ctx.font = '700 ' + (sw * 0.062).toFixed(1) + 'px Nunito, sans-serif'; ctx.fillText('WE STAYED HOME', St.x, sy0 - sh2 * 0.31); ctx.fillText('FOR EACH OTHER', St.x, sy0 - sh2 * 0.19);
        dabs(ctx, 40, [['#2e5a3e', 0.9], ['#4a8a52', 0.8], ['#ff8a7a', 0.9], ['#ffd27a', 0.9]], function (k) { var xx = sx0 + r() * sw, yy = sy0 - r() * 4 * s; return [xx, yy, (2 + r() * 3) * s, (1.4 + r() * 1.5) * s, k < 32 ? (r() < 0.5 ? 0 : 1) : (r() < 0.5 ? 2 : 3), r()]; });
        /* ---------- the bench ---------- */
        var Bn = o.bench, bw2 = Bn.w, by2 = Bn.y;
        ctx.fillStyle = 'rgba(8,10,20,0.35)'; ctx.beginPath(); qell(ctx, Bn.x, by2, bw2 * 0.6, bw2 * 0.06, 0); ctx.fill();
        ctx.fillStyle = '#2a2232'; ctx.fillRect(Bn.x - bw2 * 0.42, by2 - bw2 * 0.2, 2.4 * s, bw2 * 0.2); ctx.fillRect(Bn.x + bw2 * 0.4, by2 - bw2 * 0.2, 2.4 * s, bw2 * 0.2);
        ctx.fillStyle = lg(ctx, 0, by2 - bw2 * 0.24, 0, by2 - bw2 * 0.16, [[0, '#a8744a'], [1, '#6a4428']]); ctx.fillRect(Bn.x - bw2 * 0.5, by2 - bw2 * 0.24, bw2, bw2 * 0.08);
        ctx.fillStyle = '#7a5032'; ctx.fillRect(Bn.x - bw2 * 0.48, by2 - bw2 * 0.44, bw2 * 0.96, bw2 * 0.06); ctx.fillRect(Bn.x - bw2 * 0.48, by2 - bw2 * 0.34, bw2 * 0.96, bw2 * 0.06);
        ctx.fillStyle = 'rgba(255,190,130,0.35)'; ctx.fillRect(Bn.x - bw2 * 0.5, by2 - bw2 * 0.24, bw2, 1 * s);
        ctx.fillStyle = '#2a2232'; ctx.fillRect(Bn.x - bw2 * 0.44, by2 - bw2 * 0.46, 2 * s, bw2 * 0.26); ctx.fillRect(Bn.x + bw2 * 0.42, by2 - bw2 * 0.46, 2 * s, bw2 * 0.26);
        for (i = 0; i < o.posts.length; i++) { var Q2 = o.posts[i]; if (Q2.t >= 0.5) lanternPost(ctx, Q2.x, Q2.y, Q2.sc, Q2.col, true); }
        /* ---------- two old maples framing the view ---------- */
        var pal = ['#0a1018', '#122028', '#1c3036', '#38463e', '#e8a060'];
        [[-1, 0.06, 0.2], [1, 0.95, 0.17]].forEach(function (T, k) { var side = T[0], bx2 = w * T[1], tr = rng(91100 + k), trunkTop = h * 0.2;
          var gy = h * 0.6; ctx.fillStyle = 'rgba(6,8,16,0.45)'; ctx.beginPath(); qell(ctx, bx2 + side * 6 * s, gy, 34 * s, 5 * s, 0); ctx.fill();
          limb(ctx, bx2 + side * 10 * s, gy, bx2 - side * 6 * s, trunkTop, 28 * s, 12 * s, side * 12 * s, '#141018');
          // root flare
          ctx.fillStyle = '#141018'; ctx.beginPath(); ctx.moveTo(bx2 + side * 10 * s - 22 * s, gy + 1 * s); ctx.quadraticCurveTo(bx2 + side * 10 * s - 12 * s, gy - 6 * s, bx2 + side * 10 * s - 10 * s, gy - 22 * s); ctx.lineTo(bx2 + side * 10 * s + 10 * s, gy - 22 * s); ctx.quadraticCurveTo(bx2 + side * 10 * s + 12 * s, gy - 6 * s, bx2 + side * 10 * s + 24 * s, gy + 1 * s); ctx.closePath(); ctx.fill();
          limb(ctx, bx2 - side * 4 * s, h * 0.3, bx2 - side * w * 0.2, h * 0.16, 9 * s, 3 * s, -side * 6 * s, '#141018');
          limb(ctx, bx2, h * 0.36, bx2 - side * w * 0.14, h * 0.27, 7 * s, 2.5 * s, side * 6 * s, '#141018');
          limb(ctx, bx2 - side * 4 * s, h * 0.59, bx2 - side * 8 * s, trunkTop + h * 0.04, 5 * s, 2 * s, side * 8 * s, 'rgba(255,170,100,0.16)');
          var cl = [[bx2, h * 0.08, 70], [bx2 - side * w * 0.12, h * 0.12, 52], [bx2 - side * w * 0.2, h * 0.17, 40], [bx2 + side * 10 * s, h * 0.2, 56], [bx2 - side * w * 0.08, h * 0.24, 42], [bx2 - side * w * 0.15, h * 0.27, 30], [bx2, -h * 0.01, 60]];
          for (var q = 0; q < cl.length; q++) clump(ctx, cl[q][0], cl[q][1], cl[q][2] * s * T[2] * 5, pal, tr, -side * 0.5, 0.75, 0.9);
          // a short string of lanterns hanging from the inner branch
          var x0 = bx2 - side * w * 0.04, y0 = h * 0.22, x1 = bx2 - side * w * 0.21, y1 = h * 0.19; ctx.strokeStyle = '#1a1420'; ctx.lineWidth = 0.9 * s; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo((x0 + x1) / 2, y0 + h * 0.03, x1, y1); ctx.stroke();
          o['str' + k] = []; for (var b = 1; b < 5; b++) { var u2 = b / 5, sxp = (1 - u2) * (1 - u2) * x0 + 2 * u2 * (1 - u2) * (x0 + x1) / 2 + u2 * u2 * x1, syp = (1 - u2) * (1 - u2) * y0 + 2 * u2 * (1 - u2) * (y0 + h * 0.03) + u2 * u2 * y1; o['str' + k].push([sxp, syp + 7 * s]);
            ctx.beginPath(); ctx.moveTo(sxp, syp); ctx.lineTo(sxp, syp + 4 * s); ctx.stroke(); lanternPost(ctx, sxp, syp + 16 * s, 0.7 * s, LCOL[(b + k * 2) % LCOL.length], true); }
        });
        /* ---------- foreground: grass tufts and flowers at the bottom corners ---------- */
        batch(ctx, 700, [['#0c1a18', 1.6 * s, 0.9], ['#1e3a2e', 1.3 * s, 0.8], ['#e89060', 0.9 * s, 0.35]], function () { var side = r() < 0.5, xx = side ? r() * w * 0.3 : w - r() * w * 0.3, yy = h - Math.pow(r(), 2) * h * 0.08, l = (8 + r() * 20) * s; return [xx, yy, xx + (r() - 0.5) * l * 0.5, yy - l, r() < 0.45 ? 0 : r() < 0.85 ? 1 : 2]; });
        dabs(ctx, 50, [['#ff8aab', 0.85], ['#ffd27a', 0.85], ['#c8b8ff', 0.8], ['#ffffff', 0.7]], function () { var side = r() < 0.5, xx = side ? r() * w * 0.26 : w - r() * w * 0.26, yy = h - r() * h * 0.06; return [xx, yy - 6 * s, (1.6 + r() * 1.8) * s, (1.3 + r()) * s, (r() * 4) | 0, 0]; });
        finish(ctx, w, h, '#5a3a8a', 0.1, 0.42, 0.05, '#06060f', 0.45);
      } catch (e) { PAINT._err = 'varrow: ' + String(e && e.stack || e); }
    },
    overlay: function (ctx, w, h, t) {
      try {
        var o = L(w, h), s = o.s, i, sp = glowSpr('#ffffff', true);
        ctx.save();
        // twinkling stars
        if (sp) for (i = 0; i < 22; i++) { var sx = hash(i, 31) * w, sy = Math.pow(hash(i, 32), 1.6) * o.hz * 0.55, tw = Math.pow(Math.max(0, Math.sin(t * (0.6 + hash(i, 33) * 1.4) + i * 2.3)), 4); if (tw < 0.05) continue; var ss = (2.5 + hash(i, 34) * 4) * s * tw; ctx.globalAlpha = tw * 0.9; ctx.drawImage(sp, sx - ss, sy - ss, ss * 2, ss * 2); }
        // the lighthouse beam sweeps slowly
        var a = Math.sin(t * 0.35), lx = o.light[0], ly = o.light[1] + 1 * s, len = w * 0.9, sweep = 0.06 + 0.06 * (1 - Math.abs(a));
        ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.5 * (0.4 + 0.6 * (1 - Math.abs(a)));
        ctx.fillStyle = (function () { var g = ctx.createLinearGradient(lx, ly, lx + Math.cos(a * 0.5) * len, ly + Math.sin(a * 0.5) * len * 0.1); g.addColorStop(0, 'rgba(255,236,170,0.55)'); g.addColorStop(1, 'rgba(255,236,170,0)'); return g; })();
        ctx.beginPath(); ctx.moveTo(lx, ly); var ang = a * 0.5 - 0.02; ctx.lineTo(lx + Math.cos(ang - sweep) * len, ly + Math.sin(ang - sweep) * len * 0.35); ctx.lineTo(lx + Math.cos(ang + sweep) * len, ly + Math.sin(ang + sweep) * len * 0.35); ctx.closePath(); ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        // wind turbine blades turning, with red tip lights
        ctx.strokeStyle = '#a89ac8'; ctx.lineWidth = Math.max(0.7, 0.9 * s); ctx.lineCap = 'round';
        if (o.turb) for (i = 0; i < o.turb.length; i++) { var T = o.turb[i], ra = t * (0.5 + i * 0.07) + i; ctx.globalAlpha = 0.9; ctx.beginPath(); for (var b = 0; b < 3; b++) { var aa = ra + b * TAU / 3; ctx.moveTo(T[0], T[1]); ctx.lineTo(T[0] + Math.cos(aa) * T[2], T[1] + Math.sin(aa) * T[2]); } ctx.stroke();
          var rs = glowSpr('#ff5a4a', true); if (rs && Math.sin(t * 1.4 + i) > 0.3) { ctx.globalAlpha = 0.85; ctx.drawImage(rs, T[0] - 3 * s, T[1] - 3 * s, 6 * s, 6 * s); } }
        // lanterns breathe: a soft extra glow on the nearer posts
        ctx.globalCompositeOperation = 'lighter';
        for (i = 0; i < o.posts.length; i++) { var Q = o.posts[i]; if (Q.t < 0.35) continue; var f = 0.5 + 0.5 * Math.sin(t * (1.1 + (i % 5) * 0.17) + Q.ph), gs = glowSpr(Q.col); if (!gs) continue; var R = 20 * Q.sc * (0.85 + f * 0.3); ctx.globalAlpha = 0.18 + f * 0.16; ctx.drawImage(gs, Q.x - R, Q.y - 30 * Q.sc - R, R * 2, R * 2); }
        for (var k = 0; k < 2; k++) { var st = o['str' + k] || []; for (i = 0; i < st.length; i++) { var gs2 = glowSpr(LCOL[(i + 1 + k * 2) % LCOL.length]); if (!gs2) continue; var f2 = 0.5 + 0.5 * Math.sin(t * 1.3 + i * 1.7 + k); ctx.globalAlpha = 0.25 + f2 * 0.2; var R2 = 14 * s; ctx.drawImage(gs2, st[i][0] - R2, st[i][1] + 5 * s - R2, R2 * 2, R2 * 2); } }
        // floating lanterns drift slowly across the pond, with their reflections
        var P = o.pond; ctx.globalCompositeOperation = 'source-over';
        for (i = 0; i < o.floaters.length; i++) { var F = o.floaters[i], u = ((F.u + t * F.sp) % 1), fx = P.x + (u * 2 - 1) * P.rx * 0.85, lim = Math.sqrt(Math.max(0, 1 - Math.pow((fx - P.x) / P.rx, 2))), fy = P.y + F.v * P.ry * 0.6 * lim, edge = Math.min(1, lim * 3), sz = 5 * s * (0.8 + (F.v + 1) * 0.2);
          var gl = glowSpr(F.col); if (gl) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.5 * edge; ctx.drawImage(gl, fx - sz * 3, fy - sz * 2.6, sz * 6, sz * 5); ctx.globalAlpha = 0.25 * edge; ctx.drawImage(gl, fx - sz * 1.2, fy + sz * 0.2, sz * 2.4, sz * 4); }
          ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = edge; ctx.fillStyle = '#3a2a2a'; ctx.beginPath(); qell(ctx, fx, fy + sz * 0.15, sz * 1.1, sz * 0.32, 0); ctx.fill();
          ctx.fillStyle = mix(F.col, '#ffffff', 0.35); ctx.beginPath(); ctx.moveTo(fx - sz * 0.75, fy); ctx.lineTo(fx - sz * 0.55, fy - sz * 1.15); ctx.lineTo(fx + sz * 0.55, fy - sz * 1.15); ctx.lineTo(fx + sz * 0.75, fy); ctx.closePath(); ctx.fill(); }
        // fireflies
        var ff = glowSpr('#e8ff9a', true);
        if (ff) for (i = 0; i < 14; i++) { var px = (hash(i, 51) * w + Math.sin(t * 0.3 + i) * 20 * s), py = h * (0.5 + hash(i, 52) * 0.42) + Math.sin(t * 0.5 + i * 1.7) * 12 * s, on = Math.pow(Math.max(0, Math.sin(t * (0.8 + hash(i, 53)) + i * 3)), 3); if (on < 0.05) continue; ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = on * 0.9; var fs = 5 * s; ctx.drawImage(ff, px - fs, py - fs, fs * 2, fs * 2); }
        // water shimmer on the harbor
        ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = '#ffe0b8'; ctx.lineWidth = 0.8 * s;
        for (i = 0; i < 18; i++) { var p2 = hash(i, 61), yy = o.hz + 2 * s + p2 * (o.wall - o.hz - 6 * s), xx = hash(i, 62) * w, a2 = Math.max(0, Math.sin(t * (1 + hash(i, 63) * 2) + i * 3)); if (a2 < 0.1) continue; var l2 = (3 + p2 * 8) * s; ctx.globalAlpha = a2 * 0.6; ctx.beginPath(); ctx.moveTo(xx - l2 / 2, yy); ctx.lineTo(xx + l2 / 2, yy); ctx.stroke(); }
        ctx.restore();
      } catch (e) { PAINT._err = 'varrow overlay: ' + String(e && e.stack || e); }
    }
  };

  // passers-by and a lantern to jiggle (tappable props; CHATTER.varrow comes from the mission)
  if (typeof LATE !== 'undefined') LATE.push(function () {
    if (typeof PROPS === 'undefined') return;
    PROPS.varrow = [
      { id: 'person', x: 7, y: 95, w: 52, talk: 'varrow', look: { skin: '#a36a43', shirt: '#c58ad8', hair: '#e8e4ee' } },
      { id: 'person', x: 93, y: 95, w: 50, talk: 'varrow', look: { skin: '#f1cfb6', shirt: '#5fc9bd', hair: '#5a3a24' } }
    ];
  });
})();
