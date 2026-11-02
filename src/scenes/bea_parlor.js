/* bea_parlor.js — Bea's parlor in a South End brownstone on Rutland Square, a spring afternoon.
   A bow window with interior folding shutters, teal velvet drapes and sheer curtains looks across the square to red-brick
   bow fronts with slate mansard roofs and a magnolia in bloom. A white marble fireplace under a gilt mirror holds her
   photos; a brass chandelier hangs from a plaster medallion; a Persian rug lies on a herringbone floor in a pool of sun.
   2040 shows only quietly: a delivery drone outside and a teal status light on Wren's dock. The lower third is the calm rug.
   Defines PAINT.bea_parlor {paint, overlay, focus, anchors, track}. Shared painting helpers are exported as PAINT._beaU for
   src/scenes/dance_hall.js (loaded after this file). Everything is seeded, so it paints identically every time. */
(function () {
  'use strict';
  var PAINT = (window.PAINT = window.PAINT || {});
  var PI = Math.PI, TAU = PI * 2;
  /* ---------- helpers (adapted from src/paint_boston.js) ---------- */
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
  function S(w, h) { return Math.max(0.5, Math.min(w / 390, h / 640)); }
  function memo(fn) { var key = null, val = null; return function (w, h) { var k = w + 'x' + h; if (k !== key) { key = k; val = fn(w, h); } return val; }; }
  function poly(ctx, pts) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); }
  function rrect(ctx, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath(); }
  function glow(ctx, x, y, r, col, a) { ctx.fillStyle = rg(ctx, x, y, 0, r, [[0, rgba(col, a)], [0.35, rgba(col, a * 0.35)], [1, rgba(col, 0)]]); ctx.fillRect(x - r, y - r, r * 2, r * 2); }
  function softGlow(ctx, x, y, r, col, a) { ctx.fillStyle = rg(ctx, x, y, 0, r, [[0, rgba(col, a)], [0.5, rgba(col, a * 0.5)], [1, rgba(col, 0)]]); ctx.fillRect(x - r, y - r, r * 2, r * 2); }
  var QK = 0.914;
  function qcirc(ctx, x, y, r) { if (r < 1.1) { ctx.rect(x - r, y - r, r * 2, r * 2); return; } var c = r * QK; ctx.moveTo(x + r, y); ctx.quadraticCurveTo(x + c, y + c, x, y + r); ctx.quadraticCurveTo(x - c, y + c, x - r, y); ctx.quadraticCurveTo(x - c, y - c, x, y - r); ctx.quadraticCurveTo(x + c, y - c, x + r, y); }
  function qell(ctx, x, y, rx, ry, a) { var ca = Math.cos(a || 0), sa = Math.sin(a || 0), k = QK; function X(u, v) { return x + u * ca - v * sa; } function Y(u, v) { return y + u * sa + v * ca; }
    ctx.moveTo(X(rx, 0), Y(rx, 0)); ctx.quadraticCurveTo(X(rx * k, ry * k), Y(rx * k, ry * k), X(0, ry), Y(0, ry)); ctx.quadraticCurveTo(X(-rx * k, ry * k), Y(-rx * k, ry * k), X(-rx, 0), Y(-rx, 0));
    ctx.quadraticCurveTo(X(-rx * k, -ry * k), Y(-rx * k, -ry * k), X(0, -ry), Y(0, -ry)); ctx.quadraticCurveTo(X(rx * k, -ry * k), Y(rx * k, -ry * k), X(rx, 0), Y(rx, 0)); }
  function dots(ctx, n, cols, gen) { var i, k, b = []; for (k = 0; k < cols.length; k++) b.push([]); for (i = 0; i < n; i++) { var d = gen(i); if (d) b[d[3]].push(d); }
    ctx.save(); for (k = 0; k < cols.length; k++) { if (!b[k].length) continue; ctx.fillStyle = cols[k][0]; ctx.globalAlpha = cols[k][1]; ctx.beginPath(); for (i = 0; i < b[k].length; i++) { var q = b[k][i]; qcirc(ctx, q[0], q[1], q[2]); } ctx.fill(); } ctx.restore(); }
  function dabs(ctx, n, cols, gen) { var i, k, b = []; for (k = 0; k < cols.length; k++) b.push([]); for (i = 0; i < n; i++) { var d = gen(i); if (d) b[d[4]].push(d); }
    ctx.save(); for (k = 0; k < cols.length; k++) { if (!b[k].length) continue; ctx.fillStyle = cols[k][0]; ctx.globalAlpha = cols[k][1]; ctx.beginPath(); for (i = 0; i < b[k].length; i++) { var q = b[k][i]; qell(ctx, q[0], q[1], q[2], q[3], q[5] || 0); } ctx.fill(); } ctx.restore(); }
  function batch(ctx, n, cols, gen) { var paths = [], i, k; for (k = 0; k < cols.length; k++) paths.push([]); for (i = 0; i < n; i++) { var s = gen(i); if (s) paths[s[4]].push(s); }
    ctx.save(); ctx.lineCap = 'round'; for (k = 0; k < cols.length; k++) { var p = paths[k]; if (!p.length) continue; ctx.beginPath(); for (i = 0; i < p.length; i++) { ctx.moveTo(p[i][0], p[i][1]); if (p[i].length > 5) ctx.quadraticCurveTo(p[i][5], p[i][6], p[i][2], p[i][3]); else ctx.lineTo(p[i][2], p[i][3]); }
      ctx.strokeStyle = cols[k][0]; ctx.lineWidth = cols[k][1]; ctx.globalAlpha = cols[k][2]; ctx.stroke(); } ctx.restore(); }
  var grainCv = null;
  function finish(ctx, w, h, gradeCol, gradeA, vig, grainA, vigCol, vy) {
    try { ctx.save();
      if (gradeCol) { ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = gradeA; ctx.fillStyle = gradeCol; ctx.fillRect(0, 0, w, h); }
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      var R = Math.max(w, h) * 0.75, vc = vigCol || '#14101e';
      if (vig > 0) { ctx.fillStyle = rg(ctx, w / 2, h * (vy || 0.42), R * 0.35, R, [[0, rgba(vc, 0)], [1, rgba(vc, vig)]]); ctx.fillRect(0, 0, w, h); }
      if (!grainCv && typeof document !== 'undefined') { grainCv = document.createElement('canvas'); grainCv.width = grainCv.height = 128; var g = grainCv.getContext('2d'), id = g.createImageData(128, 128), r = rng(4242), i, v;
        for (i = 0; i < 128 * 128; i++) { v = (r() * 255) | 0; id.data[i * 4] = v; id.data[i * 4 + 1] = v; id.data[i * 4 + 2] = v; id.data[i * 4 + 3] = 255; } g.putImageData(id, 0, 0); }
      if (grainCv && grainA > 0) { ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = grainA; ctx.fillStyle = ctx.createPattern(grainCv, 'repeat'); ctx.fillRect(0, 0, w, h); }
      ctx.restore(); } catch (e) { try { ctx.restore(); } catch (e2) {} } }
  var SPR = {};
  function glowSpr(col) { if (SPR[col] !== undefined) return SPR[col]; var c = null; if (typeof document !== 'undefined') { c = document.createElement('canvas'); c.width = c.height = 64; var g = c.getContext('2d'); g.fillStyle = rg(g, 32, 32, 0, 32, [[0, rgba(col, 1)], [0.25, rgba(col, 0.55)], [1, rgba(col, 0)]]); g.fillRect(0, 0, 64, 64); } SPR[col] = c; return c; }
  // velvet drape: vertical folds lit from the window side (lit = +1 light on the right, -1 on the left)
  function drape(ctx, x0, x1, y0, y1, tieY, tieIn, col, s, r, lit) {
    var w = x1 - x0, n = Math.max(4, Math.round(w / (9 * s))), i;
    ctx.save(); ctx.beginPath();
    ctx.moveTo(x0, y0); ctx.lineTo(x1, y0);
    ctx.bezierCurveTo(x1, tieY * 0.6 + y0 * 0.4, x1 - tieIn * lit * 0 + (lit > 0 ? -tieIn : 0), tieY - (tieY - y0) * 0.15, lit > 0 ? x1 - tieIn : x1, tieY);
    ctx.bezierCurveTo(lit > 0 ? x1 - tieIn : x1, tieY + (y1 - tieY) * 0.3, x1 + (lit > 0 ? 0 : tieIn * 0.2), y1 - (y1 - tieY) * 0.3, x1 + (lit > 0 ? 4 * s : 0), y1);
    ctx.lineTo(x0 - (lit < 0 ? 4 * s : 0), y1);
    ctx.bezierCurveTo(x0 - (lit < 0 ? tieIn * 0.2 : 0), y1 - (y1 - tieY) * 0.3, lit < 0 ? x0 + tieIn : x0, tieY + (y1 - tieY) * 0.3, lit < 0 ? x0 + tieIn : x0, tieY);
    ctx.bezierCurveTo(x0 + (lit < 0 ? tieIn : 0), tieY - (tieY - y0) * 0.15, x0, tieY * 0.6 + y0 * 0.4, x0, y0);
    ctx.closePath(); ctx.fillStyle = lg(ctx, x0, 0, x1, 0, lit > 0 ? [[0, mix(col[0], '#000000', 0.25)], [1, col[1]]] : [[0, col[1]], [1, mix(col[0], '#000000', 0.25)]]); ctx.fill(); ctx.clip();
    for (i = 0; i < n; i++) { var fx = x0 + (i + 0.5) * w / n, fw = w / n;
      ctx.fillStyle = lg(ctx, fx - fw / 2, 0, fx + fw / 2, 0, [[0, rgba(col[2], 0.5)], [0.35, rgba(col[1], 0.0)], [0.6, rgba(col[3], 0.35)], [1, rgba(col[2], 0.55)]]);
      ctx.fillRect(fx - fw / 2, y0, fw, y1 - y0); }
    // pinch at the tie-back and fall below it
    ctx.fillStyle = lg(ctx, 0, tieY - 30 * s, 0, tieY + 40 * s, [[0, rgba(col[2], 0)], [0.5, rgba(col[2], 0.45)], [1, rgba(col[2], 0)]]); ctx.fillRect(x0 - 10 * s, tieY - 30 * s, w + 20 * s, 70 * s);
    batch(ctx, 120, [[col[3], 0.6 * s, 0.25], [col[2], 0.7 * s, 0.25]], function () { var xx = x0 + r() * w, yy = y0 + r() * (y1 - y0); return [xx, yy, xx + (r() - 0.5) * s, yy + (10 + r() * 30) * s, r() < 0.5 ? 0 : 1]; });
    ctx.restore();
    // tie-back with a gold tassel
    var tx = lit > 0 ? x1 - tieIn * 0.9 : x0 + tieIn * 0.9;
    ctx.strokeStyle = '#c9962e'; ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.moveTo(lit > 0 ? x0 : x1, tieY - 4 * s); ctx.quadraticCurveTo((x0 + x1) / 2, tieY + 6 * s, tx, tieY); ctx.stroke();
    ctx.fillStyle = '#e8b850'; ctx.beginPath(); qcirc(ctx, tx, tieY + 2 * s, 3.4 * s); ctx.fill();
    ctx.fillStyle = lg(ctx, 0, tieY + 4 * s, 0, tieY + 22 * s, [[0, '#f5d27a'], [1, '#9a6a1e']]);
    ctx.beginPath(); ctx.moveTo(tx - 2.6 * s, tieY + 5 * s); ctx.lineTo(tx + 2.6 * s, tieY + 5 * s); ctx.lineTo(tx + 5 * s, tieY + 22 * s); ctx.lineTo(tx - 5 * s, tieY + 22 * s); ctx.closePath(); ctx.fill();
  }
  PAINT._beaU = { rng: rng, hash: hash, clamp: clamp, lerp: lerp, mix: mix, rgba: rgba, lg: lg, rg: rg, S: S, memo: memo, poly: poly, rrect: rrect, glow: glow, softGlow: softGlow,
    qcirc: qcirc, qell: qell, dots: dots, dabs: dabs, batch: batch, finish: finish, glowSpr: glowSpr, drape: drape };

  /* ---------- layout ---------- */
  var L = memo(function (w, h) {
    var s = S(w, h);
    return { s: s, ceil: h * 0.055, floor: h * 0.645, dado: h * 0.565,
      wx0: w * 0.32, wx1: w * 0.68, wy0: h * 0.115, wy1: h * 0.505,   // bow window (centre sash plus two angled side sashes)
      fx0: -w * 0.06, fx1: w * 0.27, mantel: h * 0.515,                 // fireplace on the left
      sunX: w * 0.62, sunY: h * 0.12 };
  });

  /* ---------- the view through the window: Rutland Square in April ---------- */
  function outside(ctx, w, h, X0, X1, Y0, Y1, s, r) {
    ctx.fillStyle = lg(ctx, 0, Y0, 0, Y1, [[0, '#9cc4e8'], [0.45, '#cfe0ee'], [0.75, '#f6e6cc'], [1, '#f2d6b0']]); ctx.fillRect(X0, Y0, X1 - X0, Y1 - Y0);
    softGlow(ctx, X1 - (X1 - X0) * 0.1, Y0, (X1 - X0) * 0.7, '#fff3d8', 0.55);
    // wispy clouds
    for (var i = 0; i < 4; i++) { var cx = lerp(X0, X1, hash(i, 31)), cy = Y0 + (Y1 - Y0) * (0.08 + hash(i, 32) * 0.15); dabs(ctx, 14, [['#ffffff', 0.35]], function () { return [cx + (r() - 0.5) * 60 * s, cy + (r() - 0.5) * 6 * s, (10 + r() * 16) * s, (3 + r() * 3) * s, 0]; }); }
    // the bow-front rowhouses across the square: red brick, white trim, slate mansard roofs with dormers
    var H = Y1 - Y0, Wd = X1 - X0, cor = Y0 + H * 0.36, base = Y0 + H * 0.86, bw = Wd * 0.34, x = X0 - bw * 0.55, k = 0;
    ctx.fillStyle = lg(ctx, 0, Y0 + H * 0.2, 0, Y0 + H * 0.45, [[0, 'rgba(255,240,220,0)'], [1, 'rgba(255,236,214,0.6)']]); ctx.fillRect(X0, Y0 + H * 0.2, Wd, H * 0.25);
    while (x < X1 + bw * 0.2) {
      var top = cor + H * 0.012 * (hash(k, 41) - 0.5), brick = ['#b4573f', '#a64c38', '#bd6448', '#9c4834', '#b25e44'][k % 5], roofT = top - H * 0.09;
      // slate mansard with two dormers and a chimney
      ctx.fillStyle = lg(ctx, 0, roofT, 0, top, [[0, '#6a6f88'], [1, '#4a4e66']]); ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x + bw * 0.05, roofT); ctx.lineTo(x + bw * 0.95, roofT); ctx.lineTo(x + bw, top); ctx.closePath(); ctx.fill();
      batch(ctx, 26, [['#3e4258', 0.7 * s, 0.6], ['#8a90a8', 0.5 * s, 0.4]], function () { var yy = roofT + r() * (top - roofT), xx = x + bw * (0.07 + r() * 0.86); return [xx - 3 * s, yy, xx + 3 * s, yy, r() < 0.6 ? 0 : 1]; });
      ctx.fillStyle = '#8e4a3a'; ctx.fillRect(x + bw * 0.8, roofT - H * 0.035, bw * 0.08, H * 0.04);
      for (var d = 0; d < 2; d++) { var dx = x + bw * (0.22 + d * 0.42), dw = bw * 0.15; ctx.fillStyle = '#f4f1ea'; ctx.beginPath(); ctx.moveTo(dx, top - H * 0.012); ctx.lineTo(dx, roofT + H * 0.02); ctx.quadraticCurveTo(dx + dw / 2, roofT - H * 0.012, dx + dw, roofT + H * 0.02); ctx.lineTo(dx + dw, top - H * 0.012); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#3a4058'; ctx.fillRect(dx + dw * 0.2, roofT + H * 0.025, dw * 0.6, H * 0.04); }
      ctx.fillStyle = '#efe8dc'; ctx.fillRect(x - 1 * s, top - 1.6 * s, bw + 2 * s, 3.4 * s); ctx.fillStyle = 'rgba(80,50,40,0.4)'; ctx.fillRect(x, top + 1.8 * s, bw, 1.2 * s);
      // brick face; the bow catches the afternoon sun on its left curve
      ctx.fillStyle = lg(ctx, x, 0, x + bw, 0, [[0, mix(brick, '#3a1a14', 0.25)], [0.18, mix(brick, '#ffd8b8', 0.28)], [0.42, brick], [0.62, mix(brick, '#3a1a14', 0.18)], [1, mix(brick, '#3a1a14', 0.3)]]);
      ctx.fillRect(x, top + 1.6 * s, bw, base - top);
      dots(ctx, 90, [[mix(brick, '#ffffff', 0.2), 0.3], [mix(brick, '#000000', 0.2), 0.3]], function () { return [x + r() * bw, top + r() * (base - top), (0.5 + r() * 0.6) * s, r() < 0.5 ? 0 : 1]; });
      for (var row = 0; row < 2; row++) for (var c = 0; c < 3; c++) {
        var ww = bw * 0.17, wh = H * 0.15, wx = x + bw * (0.1 + c * 0.3), wy = top + H * (0.05 + row * 0.22);
        ctx.fillStyle = '#efe6d6'; ctx.fillRect(wx - 1.6 * s, wy - 3 * s, ww + 3.2 * s, wh + 4.6 * s); ctx.fillStyle = '#d8c8b0'; ctx.fillRect(wx - 3 * s, wy - 4.6 * s, ww + 6 * s, 2.6 * s);
        ctx.fillStyle = lg(ctx, 0, wy, 0, wy + wh, [[0, '#8aa0c0'], [1, '#34405e']]); ctx.fillRect(wx, wy, ww, wh);
        ctx.fillStyle = 'rgba(255,240,220,0.35)'; ctx.beginPath(); ctx.moveTo(wx, wy); ctx.lineTo(wx + ww * 0.7, wy); ctx.lineTo(wx, wy + wh * 0.5); ctx.fill();
        ctx.strokeStyle = '#efe6d6'; ctx.lineWidth = 0.9 * s; ctx.beginPath(); ctx.moveTo(wx, wy + wh / 2); ctx.lineTo(wx + ww, wy + wh / 2); ctx.stroke();
        if (row === 1 && c === 1) { ctx.fillStyle = '#ff9ab0'; for (var f = 0; f < 5; f++) { ctx.beginPath(); qcirc(ctx, wx + ww * (0.1 + f * 0.2), wy + wh + 1 * s, 1.4 * s); ctx.fill(); } ctx.fillStyle = '#3a6a34'; ctx.fillRect(wx - 1 * s, wy + wh + 1.6 * s, ww + 2 * s, 2.4 * s); }
        if (row === 0) { ctx.strokeStyle = '#1e1a22'; ctx.lineWidth = 0.8 * s; ctx.beginPath(); ctx.moveTo(wx - 3 * s, wy + wh + 1 * s); ctx.lineTo(wx + ww + 3 * s, wy + wh + 1 * s); for (var bb = 0; bb <= 5; bb++) { var bx2 = wx - 3 * s + bb * (ww + 6 * s) / 5; ctx.moveTo(bx2, wy + wh + 1 * s); ctx.lineTo(bx2, wy + wh + 5 * s); } ctx.moveTo(wx - 3 * s, wy + wh + 5 * s); ctx.lineTo(wx + ww + 3 * s, wy + wh + 5 * s); ctx.stroke(); }
      }
      x += bw; k++;
    }
    // the square's oval garden: young spring trees and the black iron fence
    ctx.fillStyle = 'rgba(255,240,224,0.18)'; ctx.fillRect(X0, Y0 + H * 0.3, Wd, H * 0.4);
    var tc = [['#4a7a3a', 0.9], ['#6aa448', 0.95], ['#9cc85a', 0.9], ['#d6e88a', 0.75]];
    for (var tr = 0; tr < 7; tr++) { var tx = X0 + Wd * (tr / 6) + (hash(tr, 61) - 0.5) * 20 * s, ty = Y0 + H * (0.7 + hash(tr, 62) * 0.06), R = (16 + hash(tr, 63) * 12) * s;
      ctx.strokeStyle = '#3a2a22'; ctx.lineWidth = 2 * s; ctx.beginPath(); ctx.moveTo(tx, Y1); ctx.lineTo(tx, ty); ctx.stroke();
      dabs(ctx, 90, tc, function () { var a = r() * TAU, dd = Math.sqrt(r()); var px = tx + Math.cos(a) * R * dd, py = ty - R * 0.3 + Math.sin(a) * R * 0.7 * dd; var b2 = (py < ty - R * 0.3 ? 2 : 0) + (r() < 0.4 ? 1 : 0); return [px, py, (2.4 + r() * 2.4) * s, (1.8 + r() * 1.4) * s, Math.min(3, b2), r() * PI]; }); }
    var fy = Y0 + H * 0.92; ctx.strokeStyle = '#1e1a22'; ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.moveTo(X0, fy); ctx.lineTo(X1, fy); ctx.moveTo(X0, fy + 6 * s); ctx.lineTo(X1, fy + 6 * s);
    for (var fx = X0; fx < X1; fx += 4 * s) { ctx.moveTo(fx, fy + 9 * s); ctx.lineTo(fx, fy - 4 * s); } ctx.stroke();
    ctx.fillStyle = '#1e1a22'; for (fx = X0; fx < X1; fx += 4 * s) { ctx.beginPath(); ctx.moveTo(fx - 1.2 * s, fy - 4 * s); ctx.lineTo(fx, fy - 6.6 * s); ctx.lineTo(fx + 1.2 * s, fy - 4 * s); ctx.fill(); }
    // a Boston gas lamp at the corner of the square
    var lx = X0 + Wd * 0.2, ly = Y0 + H * 0.66;
    ctx.strokeStyle = '#1e1a22'; ctx.lineWidth = 2.2 * s; ctx.beginPath(); ctx.moveTo(lx, Y1); ctx.lineTo(lx, ly + 10 * s); ctx.stroke();
    ctx.fillStyle = '#1e1a22'; ctx.beginPath(); ctx.moveTo(lx - 5 * s, ly + 10 * s); ctx.lineTo(lx + 5 * s, ly + 10 * s); ctx.lineTo(lx + 7 * s, ly - 5 * s); ctx.lineTo(lx, ly - 11 * s); ctx.lineTo(lx - 7 * s, ly - 5 * s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,236,190,0.85)'; ctx.fillRect(lx - 4 * s, ly - 3.6 * s, 8 * s, 11 * s); glow(ctx, lx, ly + 2 * s, 16 * s, '#ffe6b0', 0.35);
    // magnolia in bloom right outside the window, lower right
    var mx = X0 + Wd * 0.82, my = Y0 + H * 0.66;
    ctx.strokeStyle = '#4a3428'; ctx.lineCap = 'round';
    [[0, 0, -40, -70, 6], [0, 0, 50, -60, 5], [-20, -36, -70, -50, 3], [25, -30, 70, -20, 3], [-30, -55, -10, -100, 2.6], [30, -50, 40, -95, 2.4]].forEach(function (B) { ctx.lineWidth = B[4] * s; ctx.beginPath(); ctx.moveTo(mx + B[0] * s, my + B[1] * s + 70 * s); ctx.quadraticCurveTo(mx + (B[0] + B[2]) * 0.5 * s + 6 * s, my + (B[1] + B[3]) * 0.5 * s + 60 * s, mx + B[2] * s, my + B[3] * s + 70 * s); ctx.stroke(); });
    dabs(ctx, 300, [['#f7d4e2', 0.95], ['#ffffff', 0.95], ['#e8a6c4', 0.9], ['#c87aa0', 0.6]], function () { var a = r() * TAU, dd = Math.sqrt(r()); var px = mx + Math.cos(a) * 64 * s * dd, py = my + Math.sin(a) * 40 * s * dd; return [px, py, (2.6 + r() * 2.6) * s, (1.6 + r() * 1.6) * s, (r() * 4) | 0, r() * PI]; });
    ctx.fillStyle = 'rgba(255,245,230,0.12)'; ctx.fillRect(X0, Y0, X1 - X0, Y1 - Y0);
  }

  PAINT.bea_parlor = {
    track: 'morning',
    focus: { x: 0.5, y: 0.3 },
    anchors: { rug: { y: 0.82 }, window: { x0: 0.32, x1: 0.68, y0: 0.115, y1: 0.505 } },
    paint: function (ctx, w, h) {
      try {
        var A = L(w, h), s = A.s, r = rng(70411), i, x, y;
        /* walls: dusty rose damask above a cream wainscot */
        ctx.fillStyle = lg(ctx, 0, 0, 0, A.dado, [[0, '#8e4f56'], [0.25, '#b56f6c'], [0.7, '#c8847a'], [1, '#a9665f']]); ctx.fillRect(0, 0, w, A.dado);
        // damask: little stamped lilies in a lighter tone
        ctx.save(); ctx.globalAlpha = 0.22; ctx.fillStyle = '#f2c2a8';
        for (y = A.ceil + 14 * s; y < A.dado; y += 30 * s) for (x = ((y / (30 * s)) % 2) * 17 * s; x < w + 20 * s; x += 34 * s) {
          ctx.beginPath(); qell(ctx, x, y, 3 * s, 7 * s, 0); qell(ctx, x - 5 * s, y + 2 * s, 2 * s, 5 * s, -0.7); qell(ctx, x + 5 * s, y + 2 * s, 2 * s, 5 * s, 0.7); qcirc(ctx, x, y + 9 * s, 1.6 * s); ctx.fill(); }
        ctx.restore();
        dabs(ctx, 300, [['#f0b49a', 0.12], ['#6e3a40', 0.12]], function () { return [r() * w, A.ceil + r() * (A.dado - A.ceil), (8 + r() * 20) * s, (3 + r() * 9) * s, r() < 0.5 ? 0 : 1, r() * PI]; });
        // ceiling, plaster medallion, deep crown molding with dentils
        ctx.fillStyle = lg(ctx, 0, 0, 0, A.ceil, [[0, '#e8dccb'], [1, '#f6eadb']]); ctx.fillRect(0, 0, w, A.ceil);
        ctx.fillStyle = lg(ctx, 0, A.ceil - 3 * s, 0, A.ceil + 14 * s, [[0, '#fff8ec'], [0.3, '#e9dcc6'], [0.55, '#bca88c'], [0.7, '#fff4e2'], [1, '#c9b496']]); ctx.fillRect(0, A.ceil - 3 * s, w, 17 * s);
        ctx.fillStyle = '#9c8466'; for (x = 2 * s; x < w; x += 7 * s) ctx.fillRect(x, A.ceil + 8 * s, 3.4 * s, 3.6 * s);
        ctx.fillStyle = 'rgba(60,30,30,0.35)'; ctx.fillRect(0, A.ceil + 14 * s, w, 3 * s);
        ctx.fillStyle = '#f4e8d6'; ctx.beginPath(); qell(ctx, w * 0.5, A.ceil * 0.55, 34 * s, 6 * s, 0); ctx.fill(); ctx.strokeStyle = '#d2bf9e'; ctx.lineWidth = 1 * s; ctx.stroke();
        /* the bow window: outside view, then sashes, shutters, sheers, drapes and pelmet */
        var WX0 = A.wx0, WX1 = A.wx1, WY0 = A.wy0, WY1 = A.wy1, side = (WX1 - WX0) * 0.22, cX0 = WX0 + side, cX1 = WX1 - side;
        // deep window reveal
        ctx.fillStyle = '#e9dcc8'; ctx.fillRect(WX0 - 10 * s, WY0 - 12 * s, WX1 - WX0 + 20 * s, WY1 - WY0 + 20 * s);
        ctx.save(); ctx.beginPath(); ctx.rect(WX0, WY0, WX1 - WX0, WY1 - WY0); ctx.clip();
        outside(ctx, w, h, WX0, WX1, WY0, WY1, s, r);
        // angled side sashes read darker
        ctx.fillStyle = 'rgba(90,60,70,0.18)'; ctx.fillRect(WX0, WY0, side, WY1 - WY0); ctx.fillRect(cX1, WY0, side, WY1 - WY0);
        ctx.restore();
        // sash frames and muntins (two over two), white painted wood
        ctx.strokeStyle = '#fbf6ee'; ctx.lineJoin = 'round';
        [[WX0, side], [cX0, cX1 - cX0], [cX1, side]].forEach(function (P, k) {
          var mid = WY0 + (WY1 - WY0) * 0.5; ctx.lineWidth = 6 * s; ctx.strokeRect(P[0], WY0, P[1], WY1 - WY0);
          ctx.lineWidth = 5 * s; ctx.beginPath(); ctx.moveTo(P[0], mid); ctx.lineTo(P[0] + P[1], mid); ctx.stroke();
          ctx.lineWidth = 2.6 * s; ctx.beginPath(); ctx.moveTo(P[0] + P[1] / 2, WY0); ctx.lineTo(P[0] + P[1] / 2, WY1); ctx.stroke();
          ctx.strokeStyle = 'rgba(150,120,110,0.5)'; ctx.lineWidth = 1 * s; ctx.strokeRect(P[0] + 3 * s, WY0 + 3 * s, P[1] - 6 * s, WY1 - WY0 - 6 * s); ctx.strokeStyle = '#fbf6ee';
        });
        // glass sheen
        ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = lg(ctx, WX0, WY0, WX0 + (WX1 - WX0) * 0.6, WY1, [[0, 'rgba(255,255,255,0.18)'], [0.4, 'rgba(255,255,255,0)'], [0.55, 'rgba(255,255,255,0.12)'], [0.7, 'rgba(255,255,255,0)']]); ctx.fillRect(WX0, WY0, WX1 - WX0, WY1 - WY0); ctx.restore();
        // folding interior shutters, open against the reveal
        [[WX0 - 26 * s, WX0 - 6 * s], [WX1 + 6 * s, WX1 + 26 * s]].forEach(function (P) {
          ctx.fillStyle = lg(ctx, P[0], 0, P[1], 0, [[0, '#efe4d2'], [1, '#d8c8b0']]); ctx.fillRect(P[0], WY0 - 6 * s, P[1] - P[0], WY1 - WY0 + 10 * s);
          for (var p = 0; p < 4; p++) { var py = WY0 + p * (WY1 - WY0) / 4 + 6 * s; ctx.strokeStyle = 'rgba(120,96,70,0.45)'; ctx.lineWidth = 1 * s; ctx.strokeRect(P[0] + 4 * s, py, P[1] - P[0] - 8 * s, (WY1 - WY0) / 4 - 12 * s); }
        });
        // window seat with cushions and the sill
        ctx.fillStyle = lg(ctx, 0, WY1, 0, WY1 + 16 * s, [[0, '#f6ecdc'], [1, '#cdb898']]); ctx.fillRect(WX0 - 30 * s, WY1, WX1 - WX0 + 60 * s, 10 * s);
        ctx.fillStyle = lg(ctx, 0, WY1 + 10 * s, 0, A.dado + 10 * s, [[0, '#7d4fa8'], [1, '#4e2e72']]); rrect(ctx, WX0 - 22 * s, WY1 + 9 * s, WX1 - WX0 + 44 * s, 22 * s, 6 * s); ctx.fill();
        [[0.12, '#e8b850', -0.2], [0.8, '#2bb3a6', 0.18], [0.9, '#f2a6c0', -0.1]].forEach(function (C) { var px = lerp(WX0, WX1, C[0]); ctx.save(); ctx.translate(px, WY1 + 6 * s); ctx.rotate(C[2]); ctx.fillStyle = lg(ctx, 0, -12 * s, 0, 10 * s, [[0, mix(C[1], '#ffffff', 0.3)], [1, mix(C[1], '#000000', 0.25)]]); rrect(ctx, -14 * s, -12 * s, 28 * s, 20 * s, 7 * s); ctx.fill(); ctx.restore(); });
        // sheer curtains with soft vertical folds
        [[WX0 - 4 * s, WX0 + side * 0.9], [WX1 - side * 0.9, WX1 + 4 * s]].forEach(function (P, k) {
          ctx.save(); ctx.globalAlpha = 0.32; ctx.fillStyle = lg(ctx, P[0], 0, P[1], 0, [[0, '#ffffff'], [0.5, '#f6eef0'], [1, '#ffffff']]); ctx.fillRect(P[0], WY0 - 8 * s, P[1] - P[0], WY1 - WY0 + 14 * s);
          ctx.globalAlpha = 0.35; for (var f = 0; f < 5; f++) { var fx = lerp(P[0], P[1], (f + 0.5) / 5); ctx.fillStyle = lg(ctx, fx - 4 * s, 0, fx + 4 * s, 0, [[0, 'rgba(200,180,190,0)'], [0.5, 'rgba(200,180,190,0.8)'], [1, 'rgba(200,180,190,0)']]); ctx.fillRect(fx - 4 * s, WY0 - 8 * s, 8 * s, WY1 - WY0 + 14 * s); }
          ctx.restore(); });
        // teal velvet drapes, floor length, tied back
        var DC = ['#1f6b6a', '#3fa39c', '#0e3e40', '#7fd0c6'];
        drape(ctx, WX0 - 52 * s, WX0 - 16 * s, A.ceil + 18 * s, A.floor + 6 * s, A.wy1 - 30 * s, 10 * s, DC, s, r, 1);
        drape(ctx, WX1 + 16 * s, WX1 + 52 * s, A.ceil + 18 * s, A.floor + 6 * s, A.wy1 - 30 * s, 10 * s, DC, s, r, -1);
        // pelmet with swags and gold trim
        var pX0 = WX0 - 58 * s, pX1 = WX1 + 58 * s, pY = A.ceil + 16 * s;
        ctx.fillStyle = lg(ctx, 0, pY, 0, pY + 30 * s, [[0, '#2f8a86'], [1, '#165252']]);
        ctx.beginPath(); ctx.moveTo(pX0, pY); ctx.lineTo(pX1, pY); ctx.lineTo(pX1, pY + 24 * s);
        var sw = 5; for (i = sw; i >= 0; i--) { var sx = lerp(pX0, pX1, i / sw), px2 = lerp(pX0, pX1, (i + 1) / sw); if (i < sw) ctx.quadraticCurveTo((sx + px2) / 2, pY + 40 * s, sx, pY + 24 * s); }
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#e8b850'; ctx.lineWidth = 2 * s; ctx.beginPath(); ctx.moveTo(pX0, pY + 24 * s); for (i = 0; i < sw; i++) { var a0 = lerp(pX0, pX1, i / sw), a1 = lerp(pX0, pX1, (i + 1) / sw); ctx.quadraticCurveTo((a0 + a1) / 2, pY + 40 * s, a1, pY + 24 * s); } ctx.stroke();
        dots(ctx, sw + 1, [['#e8b850', 1]], function (k) { return [lerp(pX0, pX1, k / sw), pY + 26 * s, 3.2 * s, 0]; });
        ctx.fillStyle = 'rgba(255,240,210,0.3)'; ctx.fillRect(pX0, pY, pX1 - pX0, 3 * s);
        /* wainscot, baseboard */
        ctx.fillStyle = lg(ctx, 0, A.dado, 0, A.floor, [[0, '#f3e7d4'], [1, '#d9c6aa']]); ctx.fillRect(0, A.dado, w, A.floor - A.dado);
        ctx.fillStyle = '#fff6e8'; ctx.fillRect(0, A.dado - 2 * s, w, 5 * s); ctx.fillStyle = 'rgba(90,60,40,0.35)'; ctx.fillRect(0, A.dado + 3 * s, w, 1.4 * s);
        for (x = -10 * s; x < w; x += 54 * s) { ctx.strokeStyle = 'rgba(120,90,60,0.35)'; ctx.lineWidth = 1.2 * s; ctx.strokeRect(x + 6 * s, A.dado + 10 * s, 42 * s, A.floor - A.dado - 22 * s); ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.moveTo(x + 6 * s, A.floor - 12 * s); ctx.lineTo(x + 48 * s, A.floor - 12 * s); ctx.stroke(); }
        ctx.fillStyle = lg(ctx, 0, A.floor - 10 * s, 0, A.floor, [[0, '#5a3424'], [1, '#3a2014']]); ctx.fillRect(0, A.floor - 10 * s, w, 10 * s);
        /* the fireplace (left): white marble with an arched opening, brass fender, gilt mirror above */
        var F0 = A.fx0, F1 = A.fx1, FM = A.mantel, FW = F1 - F0, fc = (F0 + F1) / 2;
        // gilt overmantel mirror with a crest; it reflects the far side of the room (a doorway, a painting, window light)
        var mX0 = F0 + FW * 0.2, mX1 = F1 - FW * 0.16, mY0 = h * 0.17, mY1 = FM - 6 * s, mc = (mX0 + mX1) / 2;
        function arch(x0, x1, y0, y1, lift) { ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x0, y0 + lift); ctx.quadraticCurveTo((x0 + x1) / 2, y0 - lift * 0.6, x1, y0 + lift); ctx.lineTo(x1, y1); ctx.closePath(); }
        ctx.fillStyle = 'rgba(40,20,20,0.3)'; arch(mX0 - 5 * s, mX1 + 9 * s, mY0 + 2 * s, mY1 + 4 * s, 24 * s); ctx.fill();
        ctx.fillStyle = lg(ctx, mX0, 0, mX1, 0, [[0, '#8a5a18'], [0.25, '#f5d27a'], [0.5, '#c9962e'], [0.75, '#f8dc8a'], [1, '#7a4a12']]); arch(mX0 - 7 * s, mX1 + 7 * s, mY0, mY1, 24 * s); ctx.fill();
        ctx.fillStyle = lg(ctx, 0, mY0, 0, mY1, [[0, '#b77c78'], [0.55, '#9a5e5c'], [1, '#7a4448']]); arch(mX0, mX1, mY0 + 7 * s, mY1 - 3 * s, 20 * s); ctx.fill();
        ctx.save(); arch(mX0, mX1, mY0 + 7 * s, mY1 - 3 * s, 20 * s); ctx.clip();
        ctx.fillStyle = 'rgba(255,236,214,0.5)'; ctx.fillRect(mX0 + (mX1 - mX0) * 0.62, mY0 + 30 * s, (mX1 - mX0) * 0.3, (mY1 - mY0) * 0.62);
        ctx.fillStyle = '#5a3030'; ctx.fillRect(mX0 + (mX1 - mX0) * 0.12, mY0 + (mY1 - mY0) * 0.34, (mX1 - mX0) * 0.3, (mY1 - mY0) * 0.66);
        ctx.fillStyle = 'rgba(255,214,160,0.35)'; ctx.fillRect(mX0 + (mX1 - mX0) * 0.14, mY0 + (mY1 - mY0) * 0.36, (mX1 - mX0) * 0.26, (mY1 - mY0) * 0.3);
        ctx.fillStyle = '#c9962e'; ctx.fillRect(mX0 + (mX1 - mX0) * 0.46, mY0 + (mY1 - mY0) * 0.3, (mX1 - mX0) * 0.13, (mY1 - mY0) * 0.2); ctx.fillStyle = '#3f7a6a'; ctx.fillRect(mX0 + (mX1 - mX0) * 0.475, mY0 + (mY1 - mY0) * 0.32, (mX1 - mX0) * 0.08, (mY1 - mY0) * 0.16);
        glow(ctx, mX0 + (mX1 - mX0) * 0.78, mY0 + 40 * s, 40 * s, '#fff2d6', 0.5);
        ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.moveTo(mX0, mY0 + 50 * s); ctx.lineTo(mX0 + 24 * s, mY0 + 20 * s); ctx.lineTo(mX0 + 34 * s, mY0 + 20 * s); ctx.lineTo(mX0, mY0 + 66 * s); ctx.fill();
        ctx.restore();
        // crest and beading on the frame
        ctx.fillStyle = lg(ctx, mc - 14 * s, 0, mc + 14 * s, 0, [[0, '#9a6a1e'], [0.5, '#f8dc8a'], [1, '#8a5a18']]);
        ctx.beginPath(); ctx.moveTo(mc - 16 * s, mY0 - 2 * s); ctx.quadraticCurveTo(mc - 10 * s, mY0 - 16 * s, mc, mY0 - 20 * s); ctx.quadraticCurveTo(mc + 10 * s, mY0 - 16 * s, mc + 16 * s, mY0 - 2 * s); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#fff1c0'; ctx.beginPath(); qcirc(ctx, mc, mY0 - 9 * s, 2.6 * s); ctx.fill();
        dots(ctx, 40, [['#fff4c0', 0.75]], function (k) { var t = k / 39; return t < 0.5 ? [mX0 - 3.6 * s, lerp(mY0 + 26 * s, mY1, t * 2), 0.9 * s, 0] : [mX1 + 3.6 * s, lerp(mY0 + 26 * s, mY1, (t - 0.5) * 2), 0.9 * s, 0]; });
        // marble surround
        var sY0 = FM + 10 * s, sY1 = A.floor + 2 * s;
        ctx.fillStyle = lg(ctx, F0, 0, F1, 0, [[0, '#d9d2cc'], [0.5, '#fbf8f4'], [1, '#e2dad2']]); ctx.fillRect(F0 + FW * 0.06, sY0, FW * 0.88, sY1 - sY0);
        batch(ctx, 50, [['#b8aeb4', 0.8 * s, 0.5], ['#9a8e98', 0.5 * s, 0.4]], function () { var xx = F0 + FW * (0.08 + r() * 0.84), yy = sY0 + r() * (sY1 - sY0); return [xx, yy, xx + (r() - 0.5) * 20 * s, yy + (r() - 0.3) * 16 * s, r() < 0.6 ? 0 : 1, xx + (r() - 0.5) * 10 * s, yy + 6 * s]; });
        // firebox: arched cast-iron opening, a few logs, no fire on a spring afternoon
        var oX0 = F0 + FW * 0.26, oX1 = F1 - FW * 0.26, oY0 = sY0 + (sY1 - sY0) * 0.28;
        ctx.fillStyle = '#2a2226'; ctx.beginPath(); ctx.moveTo(oX0, sY1); ctx.lineTo(oX0, oY0 + 14 * s); ctx.quadraticCurveTo((oX0 + oX1) / 2, oY0 - 14 * s, oX1, oY0 + 14 * s); ctx.lineTo(oX1, sY1); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#4a4248'; ctx.lineWidth = 3 * s; ctx.stroke();
        ctx.fillStyle = '#6a4028'; rrect(ctx, oX0 + 6 * s, sY1 - 14 * s, oX1 - oX0 - 12 * s, 6 * s, 3 * s); ctx.fill(); rrect(ctx, oX0 + 10 * s, sY1 - 20 * s, oX1 - oX0 - 22 * s, 6 * s, 3 * s); ctx.fill();
        ctx.fillStyle = lg(ctx, 0, sY1 - 8 * s, 0, sY1, [[0, '#f5d27a'], [1, '#9a6a1e']]); ctx.fillRect(oX0 - 6 * s, sY1 - 7 * s, oX1 - oX0 + 12 * s, 5 * s);
        // corbels and mantel shelf
        [F0 + FW * 0.1, F1 - FW * 0.18].forEach(function (cx) { ctx.fillStyle = '#efe8e2'; ctx.fillRect(cx, sY0 - 2 * s, FW * 0.08, 18 * s); ctx.fillStyle = 'rgba(120,110,120,0.35)'; ctx.fillRect(cx + FW * 0.06, sY0 - 2 * s, FW * 0.02, 18 * s); });
        ctx.fillStyle = lg(ctx, 0, FM, 0, FM + 12 * s, [[0, '#ffffff'], [0.6, '#e8e0d8'], [1, '#b8aeb0']]); ctx.fillRect(F0, FM, FW, 11 * s);
        ctx.fillStyle = 'rgba(60,30,30,0.3)'; ctx.fillRect(F0, FM + 11 * s, FW, 3 * s);
        // on the mantel: a carriage clock, two photo frames, tulips
        function frame(fx, fy, fw, fh, inner) { ctx.fillStyle = lg(ctx, fx, 0, fx + fw, 0, [[0, '#8a5a18'], [0.5, '#f5d27a'], [1, '#9a6a1e']]); ctx.fillRect(fx, fy, fw, fh); ctx.fillStyle = inner; ctx.fillRect(fx + 2.4 * s, fy + 2.4 * s, fw - 4.8 * s, fh - 4.8 * s); }
        frame(F0 + FW * 0.2, FM - 26 * s, 20 * s, 26 * s, '#cdb89a');
        ctx.fillStyle = '#5a4030'; ctx.beginPath(); qcirc(ctx, F0 + FW * 0.2 + 8 * s, FM - 17 * s, 2.4 * s); qcirc(ctx, F0 + FW * 0.2 + 12.6 * s, FM - 16.4 * s, 2.4 * s); ctx.fill(); ctx.fillRect(F0 + FW * 0.2 + 5.8 * s, FM - 14.4 * s, 9 * s, 10 * s);
        frame(F0 + FW * 0.68, FM - 20 * s, 16 * s, 20 * s, '#e8d0c0');
        var ccx = F0 + FW * 0.5; ctx.fillStyle = lg(ctx, ccx - 10 * s, 0, ccx + 10 * s, 0, [[0, '#9a6a1e'], [0.5, '#f5d27a'], [1, '#8a5a18']]); rrect(ctx, ccx - 9 * s, FM - 24 * s, 18 * s, 24 * s, 3 * s); ctx.fill();
        ctx.fillStyle = '#fffaf0'; ctx.beginPath(); qcirc(ctx, ccx, FM - 15 * s, 6 * s); ctx.fill(); ctx.strokeStyle = '#2a2026'; ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.moveTo(ccx, FM - 15 * s); ctx.lineTo(ccx, FM - 19.4 * s); ctx.moveTo(ccx, FM - 15 * s); ctx.lineTo(ccx + 3 * s, FM - 14 * s); ctx.stroke();
        var vx = F0 + FW * 0.88; ctx.fillStyle = lg(ctx, vx - 6 * s, 0, vx + 6 * s, 0, [[0, '#7fb8d8'], [0.5, '#e8f6ff'], [1, '#5a96b8']]); ctx.beginPath(); ctx.moveTo(vx - 5 * s, FM); ctx.quadraticCurveTo(vx - 8 * s, FM - 12 * s, vx - 3 * s, FM - 18 * s); ctx.lineTo(vx + 3 * s, FM - 18 * s); ctx.quadraticCurveTo(vx + 8 * s, FM - 12 * s, vx + 5 * s, FM); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#3f7a3a'; ctx.lineWidth = 1.4 * s; [[-10, -40], [-2, -46], [6, -42], [12, -34], [-14, -32]].forEach(function (T) { ctx.beginPath(); ctx.moveTo(vx, FM - 16 * s); ctx.quadraticCurveTo(vx + T[0] * 0.3 * s, FM - 28 * s, vx + T[0] * s, FM + T[1] * s); ctx.stroke(); });
        [[-10, -40, '#ff6f8f'], [-2, -46, '#ffd45c'], [6, -42, '#ff6f8f'], [12, -34, '#ffffff'], [-14, -32, '#f5a0c0']].forEach(function (T) { ctx.fillStyle = T[2]; ctx.beginPath(); ctx.moveTo(vx + (T[0] - 3) * s, FM + (T[1] + 1) * s); ctx.quadraticCurveTo(vx + T[0] * s, FM + (T[1] - 10) * s, vx + (T[0] + 3) * s, FM + (T[1] + 1) * s); ctx.quadraticCurveTo(vx + T[0] * s, FM + (T[1] + 4) * s, vx + (T[0] - 3) * s, FM + (T[1] + 1) * s); ctx.fill(); });
        /* right side: a framed 1961 dance-hall poster, a glass cabinet of trophies, a fringed floor lamp */
        var px = w * 0.8, py = A.ceil + 46 * s;
        ctx.fillStyle = '#2a1a1a'; ctx.fillRect(px, py, 58 * s, 76 * s); ctx.fillStyle = lg(ctx, 0, py, 0, py + 70 * s, [[0, '#f0d9a8'], [1, '#d8b47a']]); ctx.fillRect(px + 4 * s, py + 4 * s, 50 * s, 68 * s);
        ctx.fillStyle = '#7d2a3a'; ctx.fillRect(px + 4 * s, py + 4 * s, 50 * s, 14 * s);
        ctx.fillStyle = '#2a1a1a'; ctx.beginPath(); qcirc(ctx, px + 24 * s, py + 34 * s, 4 * s); qcirc(ctx, px + 34 * s, py + 32 * s, 4.4 * s); ctx.fill();
        ctx.beginPath(); ctx.moveTo(px + 18 * s, py + 64 * s); ctx.quadraticCurveTo(px + 22 * s, py + 44 * s, px + 24 * s, py + 38 * s); ctx.lineTo(px + 28 * s, py + 40 * s); ctx.quadraticCurveTo(px + 30 * s, py + 56 * s, px + 32 * s, py + 64 * s); ctx.fill();
        ctx.beginPath(); ctx.moveTo(px + 30 * s, py + 64 * s); ctx.lineTo(px + 33 * s, py + 37 * s); ctx.lineTo(px + 38 * s, py + 37 * s); ctx.lineTo(px + 40 * s, py + 64 * s); ctx.fill();
        ctx.fillStyle = '#f0d9a8'; ctx.fillRect(px + 8 * s, py + 9 * s, 42 * s, 2 * s); ctx.fillRect(px + 14 * s, py + 13 * s, 30 * s, 1.6 * s);
        // cabinet
        var cbx = w * 0.79, cby = A.dado - 76 * s, cbw = 74 * s;
        ctx.fillStyle = lg(ctx, cbx, 0, cbx + cbw, 0, [[0, '#6a3a24'], [0.5, '#8a5434'], [1, '#4a2818']]); ctx.fillRect(cbx, cby, cbw, A.floor - cby);
        ctx.fillStyle = 'rgba(200,220,235,0.35)'; ctx.fillRect(cbx + 6 * s, cby + 6 * s, cbw - 12 * s, 66 * s);
        for (i = 0; i < 3; i++) { var shy = cby + 26 * s + i * 22 * s; ctx.fillStyle = '#4a2818'; ctx.fillRect(cbx + 6 * s, shy, cbw - 12 * s, 2.4 * s);
          for (var t = 0; t < 3; t++) { var tx = cbx + 16 * s + t * 20 * s; ctx.fillStyle = lg(ctx, tx - 4 * s, 0, tx + 4 * s, 0, [[0, '#9a6a1e'], [0.5, '#f5d27a'], [1, '#8a5a18']]);
            ctx.beginPath(); ctx.moveTo(tx - 4 * s, shy - 13 * s); ctx.quadraticCurveTo(tx, shy - 4 * s, tx + 4 * s, shy - 13 * s); ctx.lineTo(tx + 1 * s, shy - 4 * s); ctx.lineTo(tx + 3 * s, shy); ctx.lineTo(tx - 3 * s, shy); ctx.lineTo(tx - 1 * s, shy - 4 * s); ctx.closePath(); ctx.fill(); } }
        ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2 * s; ctx.beginPath(); ctx.moveTo(cbx + 10 * s, cby + 66 * s); ctx.lineTo(cbx + 30 * s, cby + 10 * s); ctx.stroke();
        // floor lamp with a pleated, fringed shade (warm glow)
        var lx = w * 0.74, ly = A.dado - 60 * s;
        ctx.fillStyle = 'rgba(255,214,150,0.22)'; ctx.beginPath(); qell(ctx, lx, ly + 30 * s, 50 * s, 60 * s, 0); ctx.fill();
        ctx.strokeStyle = '#3a2a22'; ctx.lineWidth = 2.6 * s; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx, A.floor + 30 * s); ctx.stroke();
        ctx.fillStyle = lg(ctx, lx - 22 * s, 0, lx + 22 * s, 0, [[0, '#e09a6a'], [0.5, '#ffe2b0'], [1, '#d08a5a']]); ctx.beginPath(); ctx.moveTo(lx - 12 * s, ly - 30 * s); ctx.lineTo(lx + 12 * s, ly - 30 * s); ctx.lineTo(lx + 22 * s, ly); ctx.lineTo(lx - 22 * s, ly); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(150,80,50,0.4)'; ctx.lineWidth = 0.8 * s; for (i = -5; i <= 5; i++) { ctx.beginPath(); ctx.moveTo(lx + i * 2.2 * s, ly - 30 * s); ctx.lineTo(lx + i * 4 * s, ly); ctx.stroke(); }
        ctx.strokeStyle = '#c9962e'; ctx.lineWidth = 1 * s; for (i = -21; i <= 21; i += 2) { ctx.beginPath(); ctx.moveTo(lx + i * s, ly); ctx.lineTo(lx + i * s, ly + 5 * s); ctx.stroke(); }
        glow(ctx, lx, ly - 4 * s, 70 * s, '#ffcf8a', 0.35);
        // a fern on a tall stand by the window (left of the lamp)
        var fnx = w * 0.29, fny = A.floor - 40 * s;
        ctx.fillStyle = '#3a2418'; ctx.fillRect(fnx - 3 * s, fny, 6 * s, 40 * s); ctx.fillStyle = '#5a3424'; rrect(ctx, fnx - 12 * s, fny - 4 * s, 24 * s, 6 * s, 2 * s); ctx.fill();
        ctx.fillStyle = lg(ctx, fnx - 10 * s, 0, fnx + 10 * s, 0, [[0, '#2f8a86'], [1, '#165252']]); rrect(ctx, fnx - 10 * s, fny - 18 * s, 20 * s, 16 * s, 4 * s); ctx.fill();
        batch(ctx, 46, [['#2f6a34', 2 * s, 0.9], ['#5aa84a', 1.4 * s, 0.9]], function (k) { var a = -PI / 2 + (k / 46 - 0.5) * 2.8, L2 = (18 + hash(k, 5) * 16) * s; return [fnx, fny - 16 * s, fnx + Math.cos(a) * L2, fny - 16 * s + Math.sin(a) * L2 * 0.8 + L2 * 0.3, k % 2, fnx + Math.cos(a) * L2 * 0.5, fny - 16 * s + Math.sin(a) * L2]; });
        /* the floor: honey herringbone parquet */
        ctx.fillStyle = lg(ctx, 0, A.floor, 0, h, [[0, '#7a4a2c'], [0.4, '#a2683e'], [1, '#b87a48']]); ctx.fillRect(0, A.floor, w, h - A.floor);
        ctx.save(); ctx.beginPath(); ctx.rect(0, A.floor, w, h - A.floor); ctx.clip();
        var bh = 9 * s, rowH = 12 * s; ctx.strokeStyle = 'rgba(60,30,14,0.24)'; ctx.lineWidth = 0.9 * s; ctx.beginPath();
        for (y = A.floor; y < h + rowH; y += rowH) { var persp = 0.6 + 0.6 * (y - A.floor) / (h - A.floor), st = 22 * s * persp; for (x = -st; x < w + st; x += st) { ctx.moveTo(x, y); ctx.lineTo(x + st / 2, y + rowH); ctx.lineTo(x + st, y); } ctx.moveTo(0, y); ctx.lineTo(w, y); }
        ctx.stroke();
        batch(ctx, 300, [['#4a2414', 0.7 * s, 0.25], ['#f0b880', 0.6 * s, 0.25]], function () { var yy = A.floor + r() * (h - A.floor), xx = r() * w; return [xx, yy, xx + (6 + r() * 12) * s, yy + (r() - 0.5) * 6 * s, r() < 0.6 ? 0 : 1]; });
        ctx.fillStyle = lg(ctx, 0, A.floor, 0, A.floor + 30 * s, [[0, 'rgba(30,14,8,0.5)'], [1, 'rgba(30,14,8,0)']]); ctx.fillRect(0, A.floor, w, 30 * s);
        ctx.restore();
        /* Persian rug in perspective: deep red field, navy border, ivory medallion */
        var rT = h * 0.715, rB = h * 1.02, rTL = w * 0.12, rTR = w * 0.88, rBL = -w * 0.08, rBR = w * 1.08;
        function rugQuad(inset, col) { var it = inset, ib = inset * 1.5; poly(ctx, [[rTL + it * w, rT + it * h * 0.6], [rTR - it * w, rT + it * h * 0.6], [rBR - ib * w, rB - it * h * 0.4], [rBL + ib * w, rB - it * h * 0.4]]); ctx.fillStyle = col; ctx.fill(); }
        ctx.fillStyle = 'rgba(20,10,10,0.35)'; poly(ctx, [[rTL - 3 * s, rT + 4 * s], [rTR + 3 * s, rT + 4 * s], [rBR, rB + 6 * s], [rBL, rB + 6 * s]]); ctx.fill();
        rugQuad(0, '#1f2e5a'); rugQuad(0.012, '#e8d6b0'); rugQuad(0.02, '#2a3c6e'); rugQuad(0.04, '#e8d6b0'); rugQuad(0.048, '#8e2a2e');
        // border motif: little lozenges along the navy band
        dots(ctx, 80, [['#e8b850', 0.85], ['#c0504a', 0.85]], function (k) { var t = (k % 40) / 40, top = k < 40; var xx = top ? lerp(rTL + 0.02 * w, rTR - 0.02 * w, t) : lerp(rBL + 0.05 * w, rBR - 0.05 * w, t), yy = top ? rT + 0.012 * h * 0.6 + 2 * s : rB - 0.03 * h; return [xx, yy, (top ? 1.4 : 2.4) * s, k % 2]; });
        // the medallion (a lobed rosette with pendants) and corner spandrels, squashed into perspective
        var mcx = w * 0.5, mcy = h * 0.865;
        function rosette(rx, ry, lobes, depth, col) { ctx.beginPath(); for (var q = 0; q <= 96; q++) { var an = q / 96 * TAU, rr = 1 + depth * Math.cos(an * lobes); var px = mcx + Math.cos(an) * rx * rr, py = mcy + Math.sin(an) * ry * rr; if (!q) ctx.moveTo(px, py); else ctx.lineTo(px, py); } ctx.closePath(); ctx.fillStyle = col; ctx.fill(); }
        [[-1], [1]].forEach(function (P) { ctx.fillStyle = '#1f2e5a'; ctx.beginPath(); ctx.moveTo(mcx - 14 * s, mcy + P[0] * 0.07 * h); ctx.lineTo(mcx, mcy + P[0] * 0.115 * h); ctx.lineTo(mcx + 14 * s, mcy + P[0] * 0.07 * h); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#e8b850'; ctx.beginPath(); qell(ctx, mcx, mcy + P[0] * 0.1 * h, 4 * s, 2.4 * s, 0); ctx.fill(); });
        rosette(0.3 * w, 0.072 * h, 8, 0.09, '#1f2e5a'); rosette(0.26 * w, 0.062 * h, 8, 0.08, '#e8d6b0'); rosette(0.22 * w, 0.052 * h, 12, 0.07, '#c0504a'); rosette(0.15 * w, 0.036 * h, 8, 0.1, '#1f2e5a'); rosette(0.09 * w, 0.022 * h, 6, 0.12, '#e8b850'); rosette(0.04 * w, 0.01 * h, 6, 0.12, '#8e2a2e');
        dots(ctx, 24, [['#e8d6b0', 0.95]], function (k) { var an = k / 24 * TAU; return [mcx + Math.cos(an) * 0.185 * w, mcy + Math.sin(an) * 0.044 * h, 1.6 * s, 0]; });
        [[rTL + 0.05 * w, rT + 0.035 * h, 1, 1], [rTR - 0.05 * w, rT + 0.035 * h, -1, 1], [rBL + 0.13 * w, rB - 0.05 * h, 1, -1], [rBR - 0.13 * w, rB - 0.05 * h, -1, -1]].forEach(function (C) {
          ctx.fillStyle = '#1f2e5a'; ctx.beginPath(); ctx.moveTo(C[0], C[1]); ctx.quadraticCurveTo(C[0] + C[2] * 0.14 * w, C[1], C[0] + C[2] * 0.16 * w, C[1] + C[3] * 0.006 * h); ctx.quadraticCurveTo(C[0] + C[2] * 0.03 * w, C[1] + C[3] * 0.02 * h, C[0] + C[2] * 0.01 * w, C[1] + C[3] * 0.05 * h); ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#e8b850'; ctx.beginPath(); qcirc(ctx, C[0] + C[2] * 0.03 * w, C[1] + C[3] * 0.01 * h, 2 * s); ctx.fill(); });
        dabs(ctx, 180, [['#c0504a', 0.55], ['#e8b850', 0.4], ['#1f2e5a', 0.4]], function () { var xx = lerp(w * 0.08, w * 0.92, r()), yy = lerp(rT + 0.06 * h, rB - 0.06 * h, r()); if (Math.abs(xx - mcx) / (0.36 * w) + Math.abs(yy - mcy) / (0.09 * h) < 1.05) return null; return [xx, yy, (2 + r() * 3) * s, (1 + r() * 1.4) * s, (r() * 3) | 0, (r() < 0.5 ? 0.6 : -0.6)]; });
        dots(ctx, 1400, [['#ffffff', 0.08], ['#2a1010', 0.1]], function () { return [lerp(rBL, rBR, r()), lerp(rT, rB, r()), (0.5 + r() * 0.8) * s, r() < 0.5 ? 0 : 1]; });
        // fringe
        batch(ctx, 120, [['#f4ead2', 1 * s, 0.85]], function (k) { var xx = lerp(rTL + 4 * s, rTR - 4 * s, k / 120); return [xx, rT, xx, rT - 4 * s, 0]; });
        /* the brass chandelier from the medallion */
        var chx = w * 0.5, chy = A.ceil + 36 * s;
        ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 1.6 * s; ctx.beginPath(); ctx.moveTo(chx, A.ceil); ctx.lineTo(chx, chy - 8 * s); ctx.stroke();
        ctx.fillStyle = lg(ctx, chx - 6 * s, 0, chx + 6 * s, 0, [[0, '#8a5a18'], [0.5, '#f5d27a'], [1, '#8a5a18']]); ctx.beginPath(); qell(ctx, chx, chy, 6 * s, 9 * s, 0); ctx.fill();
        ctx.strokeStyle = '#c9962e'; ctx.lineWidth = 2 * s;
        [-1, -0.5, 0.5, 1].forEach(function (k) { ctx.beginPath(); ctx.moveTo(chx, chy + 2 * s); ctx.quadraticCurveTo(chx + k * 18 * s, chy + 12 * s, chx + k * 26 * s, chy - 2 * s); ctx.stroke();
          ctx.fillStyle = '#fff8e0'; ctx.fillRect(chx + k * 26 * s - 1.4 * s, chy - 10 * s, 2.8 * s, 8 * s); glow(ctx, chx + k * 26 * s, chy - 12 * s, 9 * s, '#fff0c0', 0.8); });
        dots(ctx, 14, [['#ffffff', 0.85]], function (k) { return [chx + (k - 7) * 3.6 * s, chy + 12 * s + Math.abs(k - 7) * 0.6 * s, 1 * s, 0]; });
        /* sunlight: a pool on the rug and floor in front of the window, and shafts through the air */
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = 'rgba(255,214,150,0.16)'; poly(ctx, [[WX0 + 6 * s, A.floor], [WX1 - 6 * s, A.floor], [WX1 + w * 0.12, h * 0.95], [WX0 - w * 0.04, h * 0.95]]); ctx.fill();
        var sg = lg(ctx, 0, WY0, 0, h * 0.95, [[0, 'rgba(255,230,180,0.14)'], [1, 'rgba(255,230,180,0)']]); ctx.fillStyle = sg;
        poly(ctx, [[WX0, WY0], [WX1, WY0], [WX1 + w * 0.12, h * 0.95], [WX0 - w * 0.04, h * 0.95]]); ctx.fill();
        ctx.restore();
        // dim the very bottom slightly (props and subtitles sit here)
        ctx.fillStyle = lg(ctx, 0, h * 0.72, 0, h, [[0, 'rgba(40,16,20,0)'], [1, 'rgba(40,16,20,0.32)']]); ctx.fillRect(0, h * 0.72, w, h * 0.28);
        finish(ctx, w, h, '#ffb070', 0.14, 0.34, 0.045, '#2a1018', 0.38);
      } catch (e) { PAINT._err = 'bea_parlor: ' + String(e && e.stack || e); }
    },
    overlay: function (ctx, w, h, t) {
      try {
        var A = L(w, h), s = A.s, i, sp = glowSpr('#ffe6b8');
        // magnolia petals drifting past the window, and a delivery drone crossing now and then
        ctx.save(); ctx.beginPath(); ctx.rect(A.wx0, A.wy0, A.wx1 - A.wx0, A.wy1 - A.wy0); ctx.clip();
        for (i = 0; i < 7; i++) { var per = 9 + hash(i, 3) * 6, q = ((t + hash(i, 4) * per) % per) / per, px = A.wx0 + (A.wx1 - A.wx0) * (0.3 + hash(i, 5) * 0.8) - q * (A.wx1 - A.wx0) * 0.5, py = A.wy0 + (A.wy1 - A.wy0) * (0.45 + q * 0.6) + Math.sin(t * 2 + i) * 4 * s;
          ctx.fillStyle = i % 2 ? 'rgba(255,240,246,0.95)' : 'rgba(247,196,218,0.95)'; ctx.beginPath(); qell(ctx, px, py, 2.4 * s, 1.4 * s, t * 2 + i); ctx.fill(); }
        var dq = (t % 26) / 26, dx = lerp(A.wx0 - 20 * s, A.wx1 + 20 * s, dq), dy = A.wy0 + (A.wy1 - A.wy0) * 0.2 + Math.sin(t * 1.4) * 3 * s;
        ctx.fillStyle = '#f2eef8'; ctx.fillRect(dx - 6 * s, dy - 1 * s, 12 * s, 2.4 * s); ctx.fillStyle = '#cdd4e4'; ctx.fillRect(dx - 9 * s, dy - 2.4 * s, 5 * s, 1 * s); ctx.fillRect(dx + 4 * s, dy - 2.4 * s, 5 * s, 1 * s);
        ctx.fillStyle = '#f5b82e'; ctx.fillRect(dx - 2 * s, dy + 1.4 * s, 4 * s, 3.4 * s); ctx.fillStyle = Math.sin(t * 6) > 0.5 ? '#7ff7e4' : 'rgba(127,247,228,0.2)'; ctx.fillRect(dx + 5 * s, dy, 1.2 * s, 1.2 * s);
        ctx.restore();
        // breathing sun shafts and floating dust in the light
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (i = 0; i < 3; i++) { var x0 = lerp(A.wx0, A.wx1, 0.2 + i * 0.3), br = 0.04 + 0.03 * Math.sin(t * 0.4 + i * 2);
          ctx.fillStyle = lg(ctx, 0, A.wy0, 0, h * 0.9, [[0, 'rgba(255,226,170,' + br.toFixed(3) + ')'], [1, 'rgba(255,226,170,0)']]);
          ctx.beginPath(); ctx.moveTo(x0 - 10 * s, A.wy0); ctx.lineTo(x0 + 10 * s, A.wy0); ctx.lineTo(x0 + w * 0.12, h * 0.9); ctx.lineTo(x0 + w * 0.02, h * 0.9); ctx.closePath(); ctx.fill(); }
        if (sp) for (i = 0; i < 24; i++) { var a1 = hash(i, 51), b1 = hash(i, 52), c1 = hash(i, 53);
          var mx = lerp(A.wx0 - w * 0.05, A.wx1 + w * 0.12, a1) + Math.sin(t * (0.15 + c1 * 0.2) + i) * 16 * s, my = h * (0.2 + b1 * 0.6) + Math.sin(t * (0.2 + a1 * 0.3) + i * 2) * 12 * s - (t * 3 * s * (0.3 + c1)) % (h * 0.2);
          var tw = 0.5 + 0.5 * Math.sin(t * (0.8 + c1 * 1.5) + i * 3), ms = (1.6 + c1 * 3) * s; ctx.globalAlpha = 0.12 + 0.3 * tw; ctx.drawImage(sp, mx - ms, my - ms, ms * 2, ms * 2); }
        ctx.globalAlpha = 1;
        // chandelier sparkle
        for (i = 0; i < 5; i++) { var tw2 = Math.pow(Math.max(0, Math.sin(t * (1.4 + i * 0.3) + i * 2)), 8); if (tw2 < 0.05) continue; var cx = w * 0.5 + (i - 2) * 9 * s, cy = A.ceil + 48 * s; ctx.globalAlpha = tw2; ctx.fillStyle = '#ffffff'; ctx.fillRect(cx - 4 * s * tw2, cy - 0.4 * s, 8 * s * tw2, 0.8 * s); ctx.fillRect(cx - 0.4 * s, cy - 4 * s * tw2, 0.8 * s, 8 * s * tw2); }
        ctx.restore();
      } catch (e) { PAINT._err = 'bea_parlor overlay: ' + String(e && e.stack || e); }
    }
  };
  ['bea_parlor'].forEach(function (k) { var S0 = PAINT[k], p0 = S0.paint, o0 = S0.overlay;
    S0.paint = function (ctx, w, h) { ctx.save(); try { p0(ctx, w, h); } finally { ctx.restore(); } };
    S0.overlay = function (ctx, w, h, t) { ctx.save(); try { o0(ctx, w, h, t); } finally { ctx.restore(); } }; });
})();
