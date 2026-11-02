/* scenes/beijing.js - a hutong lane near Shichahai, Beijing, on a golden autumn morning (uses window.CHINA_KIT).
   PAINT.beijing. The hutongs are a historic preserve, so the lane looks as it does today: grey brick walls with tiled
   copings, red doors under little gate roofs, red lanterns, a persimmon tree hung with orange fruit leaning over a wall,
   and an old ginkgo turned gold across the top of the picture. At the end of the lane the Drum Tower rises over the
   grey roofs: a red-walled tower on a high brick base, with a double roof of grey tiles and upturned eaves. On the right
   stands the gate of the restored courtyard where the treaty teams meet, with drum stones and lanterns. The only 2040
   things are quiet ones: a little delivery robot at the far end of the lane and one drone. Flocks of pigeons with
   whistles circle the tower. Style: flat and graphic with fine linework under a cream sky (docs/DESIGN_NOTES.md, "Three
   kinds of places"). The lower third (the paving) stays calm for subtitles. */
(function () {
  'use strict';
  var PAINT = (window.PAINT = window.PAINT || {});
  var K, PI = Math.PI, TAU = PI * 2;
  var rng, lerp, mix, rgba, lg, rg, S, poly, rrect, softGlow, haze, finish, batch, dots, dabs, skyStrokes, cloudForm, qell, drawBird, clump;
  function bind() {
    if (K) return true; K = window.CHINA_KIT; if (!K) return false;
    rng = K.rng; lerp = K.lerp; mix = K.mix; rgba = K.rgba; lg = K.lg; rg = K.rg; S = K.S; poly = K.poly; rrect = K.rrect; softGlow = K.softGlow; haze = K.haze;
    finish = K.finish; batch = K.batch; dots = K.dots; dabs = K.dabs; skyStrokes = K.skyStrokes; cloudForm = K.cloudForm; qell = K.qell; drawBird = K.drawBird; clump = K.clump;
    return true;
  }
  var C = { line: '#3a3440', brick: '#8f9298', brickLt: '#aeb0b4', brickDk: '#6e7076', mortar: '#c8c6c0', tile: '#5a5e66', tileDk: '#3e424a', red: '#b8322c', redDk: '#7a1e1c', redLt: '#d85a48',
    gold: '#e8b830', green: '#3e7a6a', teal: '#2f6a7a', stone: ['#c9c4ba', '#b4aea2', '#9a9488', '#ddd8ce'], sky: [[0, '#9cc4dc'], [0.45, '#c4dce4'], [0.78, '#eee6d2'], [1, '#f6e8cc']] };
  function ink(ctx, s, a) { ctx.strokeStyle = rgba(C.line, a || 0.5); ctx.lineWidth = 0.7 * s; ctx.lineJoin = 'round'; ctx.stroke(); }

  /* one-point perspective: lateral X, height Y (eye level 0, ground +1), depth g (0 near .. 1 vanishing point) */
  var LM = null;
  function layout(w, h) {
    var key = w + 'x' + h; if (LM && LM.key === key) return LM;
    var s = S(w, h), L = { key: key, s: s, w: w, h: h, vx: w * 0.47, vy: h * 0.5 };
    L.P = function (X, Y, g) { return [L.vx + X * (1 - g) * w * 0.62, L.vy + Y * (1 - g) * h * 0.46]; };
    L.gEnd = 0.86;           // where the lane meets the cross street
    L.leftX = -1.45; L.rightX = 1.35; L.wallL = -0.62; L.wallR = -0.55;  // wall heights (Y of the coping)
    L.tower = { x: w * 0.6, base: h * 0.556, W: w * 0.56, H: h * 0.42 };
    LM = L; return L;
  }

  function sky(ctx, L) {
    var w = L.w, h = L.h, s = L.s, r = rng(2211);
    ctx.fillStyle = lg(ctx, 0, 0, 0, L.vy, C.sky); ctx.fillRect(0, 0, w, L.vy + 2);
    skyStrokes(ctx, -20 * s, w + 20 * s, 0, L.vy, C.sky, 160, r, s, 0.1, '#fff0d0', '#8ab0d0');
    softGlow(ctx, w * 0.15, h * 0.12, w * 0.8, '#fff4dc', 0.35);
    cloudForm(ctx, w * 0.7, h * 0.07, w * 0.4, h * 0.03, r, { lit: '#fffaf0', mid: '#eeeee8', shade: '#cad2da', top: '#e8eef2', al: 0.85, lx: -0.8, ly: -0.6, q: 0.5, seam: 0.08 });
    ctx.strokeStyle = rgba('#ffffff', 0.25); ctx.lineWidth = 0.6 * s; ctx.beginPath();
    for (var k = 0; k < 8; k++) { var yy = L.vy - (10 + k * k * 2.4) * s; ctx.moveTo(0, yy); ctx.lineTo(w, yy); } ctx.stroke();
  }

  // the grey roofs of the neighbourhood beyond the lane, with trees and a few rows of solar tiles
  function roofs(ctx, L) {
    var w = L.w, s = L.s, r = rng(3311), y0 = L.vy - 4 * s, i;
    for (i = 0; i < 14; i++) {
      var x = (i / 13) * w * 1.1 - w * 0.05, rw = (30 + r() * 30) * s, ry = y0 - (6 + r() * 14) * s, rh = (8 + r() * 6) * s;
      ctx.beginPath(); ctx.moveTo(x - rw / 2, ry + rh); ctx.lineTo(x - rw * 0.38, ry); ctx.lineTo(x + rw * 0.38, ry); ctx.lineTo(x + rw / 2, ry + rh); ctx.closePath();
      ctx.fillStyle = mix(C.tile, '#c8ccd0', 0.45); ctx.fill(); ink(ctx, s, 0.35);
      ctx.strokeStyle = rgba(C.tileDk, 0.35); ctx.lineWidth = 0.5 * s; ctx.beginPath(); for (var k = 1; k < 8; k++) { var xx = x - rw * 0.38 + k * rw * 0.76 / 8; ctx.moveTo(xx, ry); ctx.lineTo(xx + (xx - x) * 0.3, ry + rh); } ctx.stroke();
      if (r() < 0.25) { ctx.fillStyle = rgba('#2a3a6a', 0.55); ctx.fillRect(x - rw * 0.25, ry + rh * 0.35, rw * 0.5, rh * 0.3); }
      ctx.fillStyle = mix(C.tileDk, '#a0a4aa', 0.3); ctx.fillRect(x - rw * 0.4, ry - 1.4 * s, rw * 0.8, 1.8 * s);
      ctx.fillStyle = mix(C.brick, '#d0d0d0', 0.4); ctx.fillRect(x - rw * 0.46, ry + rh, rw * 0.92, 6 * s);
    }
    for (i = 0; i < 9; i++) { var tx = r() * w, rr = (6 + r() * 8) * s, gold = r() < 0.5;
      ctx.save(); ctx.translate(tx, y0 - 6 * s); clump(ctx, 0, -rr * 0.4, rr, gold ? ['#9a7a20', '#c09a28', '#dab83a', '#f0d060', '#f8e8a0'] : ['#3a5a3a', '#4a6e44', '#5e8650', '#7aa060', '#a8c488'], r, -0.7, -0.6, false, 0.5); ctx.restore(); }
  }

  // the Drum Tower: a high brick base pierced by arches, a red hall with a balcony, and a double roof with upturned eaves
  function drumTower(ctx, L) {
    var T = L.tower, s = L.s, cx = T.x, by = T.base, W = T.W, H = T.H, i;
    var baseTop = by - H * 0.42, baseW = W * 0.78;
    // the brick base, slightly battered, with three arched gates
    ctx.beginPath(); ctx.moveTo(cx - baseW / 2, by); ctx.lineTo(cx - baseW * 0.47, baseTop); ctx.lineTo(cx + baseW * 0.47, baseTop); ctx.lineTo(cx + baseW / 2, by); ctx.closePath();
    ctx.fillStyle = lg(ctx, cx - baseW / 2, 0, cx + baseW / 2, 0, [[0, '#a8483a'], [0.6, '#c45a44'], [1, '#9a3e32']]); ctx.fill(); ink(ctx, s, 0.5);
    ctx.strokeStyle = rgba('#6a2a22', 0.25); ctx.lineWidth = 0.5 * s; ctx.beginPath(); for (i = 1; i < 12; i++) { var yy = lerp(by, baseTop, i / 12); ctx.moveTo(cx - baseW * 0.49, yy); ctx.lineTo(cx + baseW * 0.49, yy); } ctx.stroke();
    for (i = -1; i <= 1; i++) { var ax = cx + i * baseW * 0.28, aw = baseW * 0.11, ah = H * 0.2;
      ctx.beginPath(); ctx.moveTo(ax - aw, by); ctx.lineTo(ax - aw, by - ah * 0.6); ctx.quadraticCurveTo(ax - aw, by - ah, ax, by - ah); ctx.quadraticCurveTo(ax + aw, by - ah, ax + aw, by - ah * 0.6); ctx.lineTo(ax + aw, by); ctx.closePath();
      ctx.fillStyle = '#3a2a2a'; ctx.fill(); ink(ctx, s, 0.5); }
    // a grey brick parapet along the top of the base
    ctx.fillStyle = '#8a8c90'; ctx.fillRect(cx - baseW * 0.48, baseTop - 5 * s, baseW * 0.96, 5 * s);
    ctx.fillStyle = '#6e7076'; for (i = 0; i < 18; i++) ctx.fillRect(cx - baseW * 0.48 + i * baseW * 0.96 / 18, baseTop - 7 * s, baseW * 0.96 / 36, 2.4 * s);
    // the hall: red pillars between white-and-green beams, under the lower roof, then the upper hall and the top roof
    function eave(yb, half, rise, depth, col) {
      // a tiled roof that sweeps up at both corners
      ctx.beginPath(); ctx.moveTo(cx - half - depth, yb + rise * 0.2);
      ctx.quadraticCurveTo(cx - half * 0.8, yb + rise * 0.55, cx - half * 0.55, yb - rise * 0.05);
      ctx.lineTo(cx - half * 0.35, yb - rise); ctx.lineTo(cx + half * 0.35, yb - rise); ctx.lineTo(cx + half * 0.55, yb - rise * 0.05);
      ctx.quadraticCurveTo(cx + half * 0.8, yb + rise * 0.55, cx + half + depth, yb + rise * 0.2);
      ctx.lineTo(cx + half + depth * 0.7, yb + rise * 0.36); ctx.quadraticCurveTo(cx, yb + rise * 0.58, cx - half - depth * 0.7, yb + rise * 0.36); ctx.closePath();
      ctx.fillStyle = lg(ctx, 0, yb - rise, 0, yb + rise * 0.5, [[0, mix(col, '#ffffff', 0.18)], [1, col]]); ctx.fill(); ink(ctx, s, 0.55);
      ctx.strokeStyle = rgba(C.tileDk, 0.5); ctx.lineWidth = 0.6 * s; ctx.beginPath();
      for (var k = -10; k <= 10; k++) { var x0 = cx + k * half * 0.035, x1 = cx + k * half * 0.1; ctx.moveTo(x0, yb - rise); ctx.lineTo(x1, yb + rise * 0.42); } ctx.stroke();
      ctx.fillStyle = C.tileDk; ctx.fillRect(cx - half * 0.36, yb - rise - 2 * s, half * 0.72, 2.6 * s);
      // little ridge beasts at the ends of the main ridge
      [-1, 1].forEach(function (d) { ctx.beginPath(); ctx.moveTo(cx + d * half * 0.36, yb - rise - 2 * s); ctx.quadraticCurveTo(cx + d * half * 0.4, yb - rise - 7 * s, cx + d * half * 0.33, yb - rise - 6 * s); ctx.lineTo(cx + d * half * 0.32, yb - rise); ctx.closePath(); ctx.fillStyle = C.tileDk; ctx.fill(); });
    }
    function hall(yb, yt, half) {
      ctx.fillStyle = '#c23a30'; ctx.fillRect(cx - half, yt, half * 2, yb - yt);
      ctx.fillStyle = '#8a221e'; for (var k = 0; k <= 8; k++) ctx.fillRect(cx - half + k * half * 2 / 8 - 1.2 * s, yt, 2.4 * s, yb - yt);
      ctx.fillStyle = '#e8e4d0'; ctx.fillRect(cx - half, yt, half * 2, (yb - yt) * 0.2);
      ctx.fillStyle = C.green; ctx.fillRect(cx - half, yt + (yb - yt) * 0.05, half * 2, (yb - yt) * 0.08);
      ctx.fillStyle = C.teal; for (k = 0; k < 8; k++) ctx.fillRect(cx - half + (k + 0.3) * half * 2 / 8, yt + (yb - yt) * 0.02, half * 0.1, (yb - yt) * 0.15);
      ctx.fillStyle = rgba('#3a1a1a', 0.55); for (k = 0; k < 8; k++) ctx.fillRect(cx - half + (k + 0.25) * half * 2 / 8, yt + (yb - yt) * 0.35, half * 0.13, (yb - yt) * 0.55);
      ctx.beginPath(); ctx.rect(cx - half, yt, half * 2, yb - yt); ink(ctx, s, 0.5);
    }
    var h1b = baseTop - 5 * s, h1t = h1b - H * 0.14, r1 = H * 0.11;
    hall(h1b, h1t, baseW * 0.42);
    // a balcony rail
    ctx.fillStyle = '#d8d0b8'; ctx.fillRect(cx - baseW * 0.45, h1b - 4 * s, baseW * 0.9, 1.6 * s);
    eave(h1t, baseW * 0.44, r1, W * 0.06, C.tile);
    var h2b = h1t - r1 * 0.9, h2t = h2b - H * 0.12, r2 = H * 0.14;
    hall(h2b, h2t, baseW * 0.36);
    eave(h2t, baseW * 0.4, r2, W * 0.07, C.tile);
    L.towerTop = [cx, h2t - r2]; L.towerEaves = [[cx - baseW * 0.44 - W * 0.06, h1t + r1 * 0.2], [cx + baseW * 0.44 + W * 0.06, h1t + r1 * 0.2], [cx - baseW * 0.4 - W * 0.07, h2t + r2 * 0.2], [cx + baseW * 0.4 + W * 0.07, h2t + r2 * 0.2]];
  }

  /* ---------------- the lane ---------------- */
  function wallQuad(L, X, Ytop, g0, g1) { return [L.P(X, 1, g0), L.P(X, Ytop, g0), L.P(X, Ytop, g1), L.P(X, 1, g1)]; }
  function wall(ctx, L, X, Ytop, g0, g1, dark) {
    var s = L.s, q = wallQuad(L, X, Ytop, g0, g1), i, r = rng(X > 0 ? 5511 : 5512);
    poly(ctx, q); ctx.fillStyle = lg(ctx, q[0][0], 0, q[3][0], 0, [[0, dark ? C.brickDk : C.brick], [1, mix(C.brickLt, '#d8d4cc', 0.3)]]); ctx.fill();
    ctx.save(); poly(ctx, q); ctx.clip();
    // brick courses converge on the vanishing point; vertical joints thin out with distance
    ctx.strokeStyle = rgba(C.mortar, 0.55); ctx.lineWidth = 0.6 * s; ctx.beginPath();
    for (i = 0; i <= 28; i++) { var Y = lerp(Ytop, 1, i / 28), a = L.P(X, Y, g0), b = L.P(X, Y, g1); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); } ctx.stroke();
    ctx.strokeStyle = rgba(C.brickDk, 0.35); ctx.beginPath();
    for (i = 0; i < 70; i++) { var g = lerp(g0, g1, Math.pow(i / 70, 0.6)), c0 = L.P(X, Ytop, g), c1 = L.P(X, 1, g); ctx.moveTo(c0[0], c0[1]); ctx.lineTo(c1[0], c1[1]); } ctx.stroke();
    dabs(ctx, 260, [[C.brickLt, 0.25], [C.brickDk, 0.2]], function () { var g = lerp(g0, g1, r()), Y = lerp(Ytop, 1, r()), p = L.P(X, Y, g); return [p[0], p[1], (2 + r() * 5) * s * (1 - g), (1 + r() * 1.4) * s * (1 - g), r() < 0.5 ? 0 : 1, 0]; });
    // a damp darker band at the foot of the wall
    var f0 = L.P(X, 0.9, g0), f1 = L.P(X, 0.9, g1); ctx.fillStyle = rgba('#4a4a50', 0.18); ctx.beginPath(); ctx.moveTo(q[0][0], q[0][1]); ctx.lineTo(f0[0], f0[1]); ctx.lineTo(f1[0], f1[1]); ctx.lineTo(q[3][0], q[3][1]); ctx.closePath(); ctx.fill();
    ctx.restore();
    poly(ctx, q); ink(ctx, s, 0.45);
    // the tiled coping: a dark ridge with round tile ends
    var t0 = L.P(X, Ytop, g0), t1 = L.P(X, Ytop, g1), u0 = L.P(X, Ytop - 0.09, g0), u1 = L.P(X, Ytop - 0.09, g1), o = X < 0 ? 0.06 : -0.06, e0 = L.P(X - o, Ytop + 0.02, g0), e1 = L.P(X - o, Ytop + 0.02, g1);
    ctx.beginPath(); ctx.moveTo(e0[0], e0[1]); ctx.lineTo(u0[0], u0[1]); ctx.lineTo(u1[0], u1[1]); ctx.lineTo(e1[0], e1[1]); ctx.closePath(); ctx.fillStyle = C.tile; ctx.fill(); ink(ctx, s, 0.5);
    ctx.fillStyle = C.tileDk; ctx.beginPath(); for (i = 0; i < 40; i++) { var gg = lerp(g0, g1, Math.pow(i / 40, 0.7)), p = L.P(X - o, Ytop + 0.02, gg); qell(ctx, p[0], p[1], 1.6 * s * (1 - gg), 1.4 * s * (1 - gg), 0); } ctx.fill();
    return q;
  }
  // a red door set into a wall, with a little gate roof and brass knockers
  function door(ctx, L, X, g0, g1, Ytop, big) {
    var s = L.s, a = L.P(X, 1, g0), b = L.P(X, Ytop, g0), c = L.P(X, Ytop, g1), d = L.P(X, 1, g1);
    poly(ctx, [a, b, c, d]); ctx.fillStyle = lg(ctx, a[0], 0, d[0], 0, [[0, C.red], [1, C.redLt]]); ctx.fill(); ink(ctx, s, 0.6);
    var m0 = L.P(X, Ytop, (g0 + g1) / 2), m1 = L.P(X, 1, (g0 + g1) / 2); ctx.beginPath(); ctx.moveTo(m0[0], m0[1]); ctx.lineTo(m1[0], m1[1]); ink(ctx, s, 0.6);
    if (big) { ctx.fillStyle = C.gold; for (var r = 0; r < 4; r++) for (var k = 0; k < 6; k++) { var gq = lerp(g0, g1, (k + 0.5) / 6), p = L.P(X, lerp(Ytop + 0.12, 0.85, r / 3), gq); ctx.beginPath(); ctx.arc(p[0], p[1], 1.1 * s * (1 - gq), 0, TAU); ctx.fill(); } }
    [0.42, 0.58].forEach(function (t) { var p = L.P(X, lerp(Ytop, 1, 0.5), lerp(g0, g1, t)); ctx.strokeStyle = C.gold; ctx.lineWidth = 1.1 * s * (1 - g0); ctx.beginPath(); ctx.arc(p[0], p[1], 2.6 * s * (1 - g0), 0, TAU); ctx.stroke(); });
    // the gate roof over the door
    var rt = Ytop - (big ? 0.28 : 0.2), o = X < 0 ? 0.12 : -0.12, gp = (g1 - g0) * 0.25;
    var r0 = L.P(X - o, Ytop - 0.02, g0 - gp), r1 = L.P(X, rt, g0 - gp * 0.6), r2 = L.P(X, rt, g1 + gp * 0.6), r3 = L.P(X - o, Ytop - 0.02, g1 + gp);
    poly(ctx, [r0, r1, r2, r3]); ctx.fillStyle = C.tile; ctx.fill(); ink(ctx, s, 0.55);
    ctx.fillStyle = C.green; poly(ctx, [L.P(X, Ytop, g0 - gp * 0.3), L.P(X, Ytop - 0.05, g0 - gp * 0.3), L.P(X, Ytop - 0.05, g1 + gp * 0.3), L.P(X, Ytop, g1 + gp * 0.3)]); ctx.fill();
    return [a, b, c, d];
  }
  function lantern(ctx, x, y, R, s) {
    ctx.strokeStyle = '#3a2a20'; ctx.lineWidth = 0.6 * s; ctx.beginPath(); ctx.moveTo(x, y - R * 2); ctx.lineTo(x, y - R); ctx.stroke();
    ctx.fillStyle = rg(ctx, x - R * 0.3, y - R * 0.3, R * 0.1, R * 1.2, [[0, '#ff8a6a'], [0.6, '#d8382c'], [1, '#8a1a18']]); ctx.beginPath(); qell(ctx, x, y, R, R * 0.85, 0); ctx.fill();
    ctx.strokeStyle = rgba('#5a1010', 0.6); ctx.lineWidth = 0.5 * s; ctx.beginPath(); for (var k = -2; k <= 2; k++) { ctx.moveTo(x + k * R * 0.35, y - R * 0.8); ctx.quadraticCurveTo(x + k * R * 0.5, y, x + k * R * 0.35, y + R * 0.8); } ctx.stroke();
    ctx.fillStyle = C.gold; ctx.fillRect(x - R * 0.45, y - R * 0.95, R * 0.9, R * 0.2); ctx.fillRect(x - R * 0.45, y + R * 0.75, R * 0.9, R * 0.2);
    ctx.strokeStyle = '#e8b830'; ctx.lineWidth = 0.7 * s; ctx.beginPath(); for (k = -2; k <= 2; k++) { ctx.moveTo(x + k * R * 0.12, y + R * 0.95); ctx.lineTo(x + k * R * 0.14, y + R * 1.6); } ctx.stroke();
  }
  function ground(ctx, L) {
    var w = L.w, h = L.h, s = L.s, r = rng(6611), i;
    var y0 = L.P(0, 1, L.gEnd)[1];
    ctx.fillStyle = lg(ctx, 0, y0, 0, h, [[0, C.stone[1]], [0.5, C.stone[0]], [1, C.stone[2]]]); ctx.fillRect(0, y0, w, h - y0);
    ctx.save(); ctx.beginPath(); ctx.rect(0, y0, w, h - y0); ctx.clip();
    ctx.strokeStyle = rgba('#6a645a', 0.3); ctx.lineWidth = 0.7 * s; ctx.beginPath();
    for (i = -10; i <= 10; i++) { var a = L.P(i * 0.2, 1, L.gEnd), b = L.P(i * 0.2, 1, 0); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
    for (i = 0; i < 16; i++) { var g = L.gEnd * (1 - Math.pow(i / 16, 0.7)), p = L.P(0, 1, g); ctx.moveTo(0, p[1]); ctx.lineTo(w, p[1]); } ctx.stroke();
    // fallen ginkgo leaves, thicker under the tree on the left
    dabs(ctx, 520, [['#f0c640', 0.85], ['#e0a828', 0.8], ['#f8e070', 0.7]], function () { var g = Math.pow(r(), 0.5) * L.gEnd, X = (r() < 0.6 ? -0.95 + r() * 0.8 : -0.2 + r() * 1.1), p = L.P(X, 1, g), z = (1 - g); return [p[0], p[1], (1.6 + r() * 1.8) * s * z * 1.4, (0.9 + r() * 0.8) * s * z * 1.4, (r() * 3) | 0, r() * PI]; });
    ctx.restore();
    // calm soft shade toward the bottom, for subtitles
    ctx.fillStyle = lg(ctx, 0, h * 0.78, 0, h, [[0, rgba('#2a2430', 0)], [1, rgba('#2a2430', 0.16)]]); ctx.fillRect(0, h * 0.78, w, h * 0.22);
  }
  function bicycle(ctx, x, y, R, s) {
    ctx.strokeStyle = '#2a2a34'; ctx.lineWidth = 1.2 * s; ctx.beginPath(); ctx.arc(x - R * 1.2, y - R, R, 0, TAU); ctx.moveTo(x + R * 2.2, y - R); ctx.arc(x + R * 1.2, y - R, R, 0, TAU); ctx.stroke();
    ctx.strokeStyle = '#2f6a7a'; ctx.lineWidth = 1.6 * s; ctx.beginPath(); ctx.moveTo(x - R * 1.2, y - R); ctx.lineTo(x - R * 0.1, y - R * 2.1); ctx.lineTo(x + R * 0.9, y - R * 2.1); ctx.lineTo(x + R * 1.2, y - R); ctx.moveTo(x - R * 0.1, y - R * 2.1); ctx.lineTo(x + R * 0.2, y - R); ctx.lineTo(x - R * 1.2, y - R); ctx.moveTo(x + R * 0.2, y - R); ctx.lineTo(x + R * 0.9, y - R * 2.1); ctx.stroke();
    ctx.strokeStyle = '#2a2a34'; ctx.beginPath(); ctx.moveTo(x + R * 0.9, y - R * 2.1); ctx.lineTo(x + R * 0.8, y - R * 2.6); ctx.lineTo(x + R * 1.2, y - R * 2.7); ctx.moveTo(x - R * 0.1, y - R * 2.1); ctx.lineTo(x - R * 0.2, y - R * 2.4); ctx.stroke();
    ctx.fillStyle = '#5a3a2a'; ctx.fillRect(x - R * 0.5, y - R * 2.5, R * 0.6, R * 0.2);
    ctx.fillStyle = '#c8a050'; ctx.fillRect(x - R * 1.9, y - R * 2.2, R * 1.2, R * 0.7);
  }
  // the old ginkgo: a gnarled trunk on the left and a gold canopy across the top of the picture
  function ginkgo(ctx, L) {
    var w = L.w, h = L.h, s = L.s, r = rng(7711), i;
    var pal = ['#a87a14', '#c8961c', '#e0b42a', '#f2cf48', '#fae890'];
    // the trunk, leaning in from the bottom left, with two big limbs
    ctx.fillStyle = lg(ctx, 0, 0, w * 0.14, 0, [[0, '#3a2c24'], [0.6, '#5a463a'], [1, '#7a6250']]);
    K.trunkPath(ctx, w * 0.02, h * 0.84, w * 0.09, h * 0.2, 30 * s, 14 * s, 18 * s); ctx.fill(); ink(ctx, s, 0.4);
    K.trunkPath(ctx, w * 0.08, h * 0.34, w * 0.42, h * 0.08, 12 * s, 3 * s, -20 * s); ctx.fill();
    K.trunkPath(ctx, w * 0.07, h * 0.3, w * 0.02, h * 0.02, 10 * s, 3 * s, 10 * s); ctx.fill();
    batch(ctx, 120, [['#2a201a', 0.8 * s, 0.4], ['#8a7260', 0.7 * s, 0.3]], function () { var yy = lerp(h * 0.24, h * 0.82, r()), xx = lerp(w * 0.08, w * 0.03, (yy - h * 0.24) / (h * 0.58)) + (r() - 0.5) * 16 * s; return [xx, yy, xx + (r() - 0.5) * 2 * s, yy + (4 + r() * 10) * s, r() < 0.6 ? 0 : 1]; });
    // the canopy: clumps of fan-shaped leaves across the top left
    var cl = [];
    for (i = 0; i < 26; i++) { var u = r(), v = r(); var cx = w * (-0.05 + u * 0.55 * (1 - v * 0.5)), cy = h * (0.0 + v * 0.26 * (1 - u * 0.7)); cl.push([cx, cy, (16 + r() * 22) * s]); }
    cl.sort(function (A, B) { return A[1] - B[1]; });
    for (i = 0; i < cl.length; i++) clump(ctx, cl[i][0], cl[i][1], cl[i][2], pal, r, 0.6, -0.7, i < 8, 1.3);
    ctx.strokeStyle = '#4a382c'; ctx.lineCap = 'round';
    for (i = 0; i < 7; i++) { var a0 = -PI * (0.05 + r() * 0.35), ln = (40 + r() * 70) * s, sx = w * (0.06 + r() * 0.2), sy = h * (0.08 + r() * 0.14); ctx.lineWidth = (1.2 + r()) * s; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(sx + Math.cos(a0) * ln * 0.5, sy + Math.sin(a0) * ln * 0.5 - 6 * s, sx + Math.cos(a0) * ln, sy + Math.sin(a0) * ln); ctx.stroke(); }
    for (i = 0; i < 10; i++) clump(ctx, w * (0.08 + r() * 0.42), h * (0.03 + r() * 0.2), (8 + r() * 10) * s, pal, r, 0.6, -0.7, false, 1.2);
    // a few single fan leaves at the edge of the canopy
    for (i = 0; i < 40; i++) { var a = r() * PI * 0.9, R = (60 + r() * 140) * s, x = w * 0.18 + Math.cos(a) * R * 1.4, y = h * 0.08 + Math.sin(a) * R * 0.6; fan(ctx, x, y, (3 + r() * 2) * s, r() * TAU, pal[2 + (i % 3)]); }
  }
  function fan(ctx, x, y, R, a, col) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R, -PI * 0.8, -PI * 0.2); ctx.closePath(); ctx.fill(); ctx.strokeStyle = rgba('#8a6010', 0.5); ctx.lineWidth = 0.3 * R; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, R * 0.5); ctx.stroke(); ctx.restore(); }
  // a persimmon tree leaning over the right-hand wall, bare-ish branches hung with orange fruit
  function persimmon(ctx, L) {
    var w = L.w, h = L.h, s = L.s, r = rng(8811), i;
    var base = L.P(L.rightX, L.wallR, 0.66);
    ctx.strokeStyle = '#4a3428'; ctx.lineCap = 'round';
    var br = [];
    for (i = 0; i < 9; i++) { var a = -PI * (0.25 + r() * 0.5), len = (40 + r() * 70) * s, x0 = base[0] + (r() - 0.3) * 30 * s, y0 = base[1] + 6 * s, x1 = x0 + Math.cos(a) * len, y1 = y0 + Math.sin(a) * len;
      ctx.lineWidth = (2.6 - i * 0.15) * s; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo((x0 + x1) / 2 + 10 * s, (y0 + y1) / 2, x1, y1); ctx.stroke(); br.push([x0, y0, x1, y1]); }
    dabs(ctx, 120, [['#7a8a3a', 0.8], ['#a89a3a', 0.75], ['#c86a2a', 0.7]], function () { var b = br[(r() * br.length) | 0], t = 0.3 + r() * 0.7; return [lerp(b[0], b[2], t) + (r() - 0.5) * 10 * s, lerp(b[1], b[3], t) + (r() - 0.5) * 8 * s, (2 + r() * 2) * s, (1 + r()) * s, (r() * 3) | 0, r() * PI]; });
    L.fruit = [];
    for (i = 0; i < 22; i++) { var b2 = br[i % br.length], t2 = 0.4 + r() * 0.6, fx = lerp(b2[0], b2[2], t2), fy = lerp(b2[1], b2[3], t2) + 3 * s, fr = (2.6 + r() * 1.2) * s;
      ctx.fillStyle = rg(ctx, fx - fr * 0.3, fy - fr * 0.3, fr * 0.1, fr, [[0, '#ffb060'], [0.6, '#f07a22'], [1, '#c04a10']]); ctx.beginPath(); ctx.arc(fx, fy, fr, 0, TAU); ctx.fill();
      ctx.fillStyle = '#4a5a2a'; ctx.fillRect(fx - fr * 0.4, fy - fr * 1.05, fr * 0.8, fr * 0.3); L.fruit.push([fx, fy, fr]); }
  }

  function paint(ctx, w, h) {
    if (!bind()) return;
    var L = layout(w, h), s = L.s;
    sky(ctx, L); roofs(ctx, L); drumTower(ctx, L);
    haze(ctx, -w * 0.1, L.vy - h * 0.05, w * 1.1, L.vy + h * 0.02, '#f2ead8', 0.3);
    // the cross street at the end of the lane: a strip of sunlit paving and the far wall
    var e0 = L.P(-1.6, 1, L.gEnd), e1 = L.P(1.6, 1, L.gEnd);
    var ey = L.P(0, 1, L.gEnd)[1]; ctx.fillStyle = mix(C.stone[0], '#fff4dc', 0.3); ctx.fillRect(0, ey - 4 * s, w, 6 * s);
    ctx.fillStyle = mix(C.brick, '#e8e0d0', 0.3); ctx.fillRect(0, ey - 9 * s, w, 5 * s); ctx.fillStyle = C.tile; ctx.fillRect(0, ey - 10.5 * s, w, 1.6 * s);
    ground(ctx, L);
    // the walls: a tall one on the left with two doors, the courtyard's on the right with the gate
    wall(ctx, L, L.leftX, L.wallL, 0, L.gEnd, false);
    door(ctx, L, L.leftX, 0.52, 0.6, -0.3, false); door(ctx, L, L.leftX, 0.72, 0.76, -0.3, false);
    wall(ctx, L, L.rightX, L.wallR, 0, L.gEnd, true);
    door(ctx, L, L.rightX, 0.74, 0.78, -0.28, false);
    // the courtyard gate (the treaty venue): wide red doors with gold studs, drum stones, lanterns
    var gq = door(ctx, L, L.rightX, 0.44, 0.6, -0.4, true);
    [0.42, 0.62].forEach(function (g) { var p = L.P(L.rightX - 0.06, 1, g), R = 9 * s * (1 - g); ctx.fillStyle = lg(ctx, p[0] - R, 0, p[0] + R, 0, [[0, '#d8d2c6'], [1, '#9a948a']]); ctx.beginPath(); ctx.arc(p[0], p[1] - R * 1.2, R, 0, TAU); ctx.fill(); ink(ctx, s, 0.5); ctx.fillStyle = '#a8a296'; ctx.fillRect(p[0] - R, p[1] - R * 0.5, R * 2, R * 0.5); });
    var lp1 = L.P(L.rightX - 0.18, -0.5, 0.43), lp2 = L.P(L.rightX - 0.18, -0.5, 0.61);
    lantern(ctx, lp1[0], lp1[1] + 14 * s, 8 * s, s); lantern(ctx, lp2[0], lp2[1] + 12 * s, 6.5 * s, s);
    var lp3 = L.P(L.leftX + 0.12, -0.36, 0.56); lantern(ctx, lp3[0], lp3[1] + 8 * s, 5 * s, s);
    L.lanterns = [[lp1[0], lp1[1] + 14 * s, 8 * s], [lp2[0], lp2[1] + 12 * s, 6.5 * s], [lp3[0], lp3[1] + 8 * s, 5 * s]];
    persimmon(ctx, L);
    // a bicycle leaning on the left wall, and the little delivery robot waiting at the far end
    var bp = L.P(L.leftX + 0.12, 1, 0.66); bicycle(ctx, bp[0] + 8 * s, bp[1], 4.4 * s, s);
    var rp = L.P(0.25, 1, 0.8); ctx.fillStyle = '#f4f6fb'; ctx.beginPath(); rrect(ctx, rp[0] - 4 * s, rp[1] - 7 * s, 8 * s, 6 * s, 1.6 * s); ctx.fill(); ink(ctx, s, 0.5); ctx.fillStyle = '#16b3a6'; ctx.fillRect(rp[0] - 4 * s, rp[1] - 4.4 * s, 8 * s, 0.9 * s); ctx.fillStyle = '#2a2a34'; ctx.beginPath(); ctx.arc(rp[0] - 2.6 * s, rp[1] - 0.8 * s, 1.1 * s, 0, TAU); ctx.arc(rp[0] + 2.6 * s, rp[1] - 0.8 * s, 1.1 * s, 0, TAU); ctx.fill();
    ginkgo(ctx, L);
    finish(ctx, w, h, '#ffd8a0', 0.08, 0.14, 0.03, '#1a1420', 0.45);
  }

  function overlay(ctx, w, h, t) {
    if (!bind()) return;
    var L = layout(w, h), s = L.s, i;
    ctx.save();
    // pigeons circling the Drum Tower (Beijing flocks carry little whistles)
    ctx.strokeStyle = 'rgba(50,50,70,.7)'; ctx.lineWidth = 1 * s; ctx.lineCap = 'round';
    var T = L.towerTop || [w * 0.62, h * 0.15];
    for (i = 0; i < 9; i++) { var a = t * 0.35 + i * 0.32, rx = w * 0.28, ry = h * 0.05, px = T[0] + Math.cos(a) * rx, py = T[1] - h * 0.02 + Math.sin(a) * ry + Math.sin(t + i) * 2 * s; drawBird(ctx, px, py, (2.4 + (Math.sin(a) + 1) * 0.6) * s, t * 6 + i); }
    // ginkgo leaves drifting down
    var r = rng(91);
    for (i = 0; i < 14; i++) { var sp = 0.05 + r() * 0.04, p = (t * sp + r()) % 1, x0 = r() * w * 0.7, x = x0 + Math.sin(t * 1.3 + i) * 14 * s + p * 30 * s, y = lerp(h * 0.12, h * 0.95, p);
      fan(ctx, x, y, (2.6 + r() * 1.6) * s, t * (1 + r()) + i, ['#f2cf48', '#e0b42a', '#fae890'][i % 3]); }
    // the lanterns sway gently, with a warm glow
    if (L.lanterns) for (i = 0; i < L.lanterns.length; i++) { var Lp = L.lanterns[i], sw = Math.sin(t * 1.1 + i) * 0.06; var g = K.glowSpr('#ff9a6a'); if (g) { ctx.globalAlpha = 0.25 + 0.08 * Math.sin(t * 2 + i); ctx.drawImage(g, Lp[0] - Lp[2] * 3 + sw * 40 * s, Lp[1] - Lp[2] * 3, Lp[2] * 6, Lp[2] * 6); ctx.globalAlpha = 1; } }
    // one small drone far off over the roofs
    var dp = (t * 0.02) % 1; K.drawDrone(ctx, lerp(w * 1.05, -w * 0.05, dp), h * 0.28 + Math.sin(t) * 3 * s, 1.3 * s, '#f4f6fb', Math.pow(Math.max(0, Math.sin(t * 4)), 6), '#7ff7e4');
    ctx.restore();
  }

  PAINT.beijing = { focus: { x: 0.62, y: 0.2 }, track: 'morning', anchors: { tower: { x: 0.62, y: 0.25 }, gate: { x: 0.85, y: 0.6 } },
    paint: function (ctx, w, h) { ctx.save(); try { paint(ctx, w, h); } catch (e) { PAINT._err = 'beijing: ' + String(e && e.stack || e); } finally { ctx.restore(); } },
    overlay: function (ctx, w, h, t) { ctx.save(); try { overlay(ctx, w, h, t); } catch (e) { PAINT._err = 'beijing overlay: ' + String(e && e.stack || e); } finally { ctx.restore(); } } };

  if (typeof LATE !== 'undefined') LATE.push(function () {
    if (typeof PROPS === 'undefined' || typeof PROPS_ART === 'undefined') return;
    // a covered cup of tea on a stone stool
    PROPS_ART.bj_tea = function () { return '<svg viewBox="0 0 70 70"><ellipse cx="35" cy="66" rx="24" ry="4" fill="rgba(0,0,0,.18)"/><g class="pa-steam"><path d="M30 18 q-5 -7 2 -12 q5 -5 0 -10" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".85"/></g>' +
      '<g class="pa-body"><path d="M14 46 h42 v14 h-42z" fill="#b4aea2" stroke="#5a544a" stroke-width="2"/><path d="M20 30 h30 l-4 16 h-22z" fill="#f4f4ee" stroke="#5a6a8a" stroke-width="2"/><path d="M24 36 q11 6 22 0" stroke="#3a6ab8" stroke-width="2" fill="none"/><path d="M18 30 q17 -8 34 0z" fill="#f4f4ee" stroke="#5a6a8a" stroke-width="2"/><circle cx="35" cy="24" r="3" fill="#f4f4ee" stroke="#5a6a8a" stroke-width="1.6"/></g></svg>'; };
    // a persimmon that has fallen off the tree
    PROPS_ART.bj_persimmon = function () { return '<svg viewBox="0 0 50 44"><ellipse cx="25" cy="41" rx="16" ry="3" fill="rgba(0,0,0,.2)"/><g class="pa-body"><circle cx="25" cy="24" r="15" fill="#f07a22" stroke="#9a3a10" stroke-width="2"/><ellipse cx="20" cy="19" rx="5" ry="3" fill="#ffc080" opacity=".8"/><path d="M15 11 q10 -6 20 0 q-4 4 -10 4 q-6 0 -10 -4z" fill="#5a7a2a" stroke="#3a4a1a" stroke-width="1.4"/></g></svg>'; };
    PROPS.beijing = [
      { id: 'pigeon', x: 14, y: 91, w: 40, sfx: 'flap', fx: 'flyaway' },
      { id: 'bj_persimmon', x: 34, y: 95, w: 30, sfx: 'pop', fx: 'jiggle' },
      { id: 'person', x: 52, y: 82, w: 44, talk: 'beijing', look: { skin: '#eec8a8', shirt: '#3d6b9a', hair: '#d8d4dc' } },
      { id: 'bj_tea', x: 74, y: 93, w: 44, sfx: 'clink', fx: 'jiggle', burst: 'steam' },
      { id: 'robot', x: 90, y: 88, w: 38, sfx: 'beep', fx: 'spin' }
    ];
  });
})();
