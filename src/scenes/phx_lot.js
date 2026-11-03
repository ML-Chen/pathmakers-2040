/* scenes/phx_lot.js - the flood lot in Arcadia, Phoenix, at 7:15 on a monsoon-season morning (lot.js, "The Flood Lot").
   PAINT.phx_lot. We stand across the street from an empty corner lot at the low end of the block. The morning sun is
   low in the east (right), so shadows stretch left. Behind the lot: an old block wall with knee-high dried mud lines
   and a gap where the neighbors' irrigation ditch comes through from the alley (the concrete standpipe with its valve
   wheel stands in the gap); then the Arizona Canal's bank path, the canal itself, the next neighborhood's palms and
   eucalyptus, and Camelback Mountain (the camel's head on the left, the hump on the right). On the lot: cracked mud tiles
   where puddles dried, creosote bushes, dry grass, the robot crew's orange survey flags and a 20-foot, five-armed
   saguaro. To the right, Mrs. Okafor's white-brick ranch house with teal trim, her grapefruit tree and a palo verde.
   In front: the sidewalk, a bus stop bench with no shade, a curb with skate-wax marks and the street drain.
   Arcadia is an ordinary 2040 neighborhood that looks much as it does today (a "preserve"), so the robots stay out of
   sight. anchors are the field-visit spots in src/missions/lot.js (fractions of w, h).
   Uses window.CHINA_KIT and window.PHXK (src/scenes/phx__kit.js). Everything is seeded. */
(function () {
  'use strict';
  var PAINT = (window.PAINT = window.PAINT || {});
  var K, X, PI = Math.PI, TAU = PI * 2;
  var rng, hash, lerp, mix, rgba, lg, rg, S, rrect, softGlow, haze, finish, batch, dots, dabs, rects, qell, clump, ridge, fbm, glowSpr, poly, skyStrokes, cloudForm;
  function bind() {
    if (K && X) return true; K = window.CHINA_KIT; X = window.PHXK; if (!K || !X) return false;
    rng = K.rng; hash = K.hash; lerp = K.lerp; mix = K.mix; rgba = K.rgba; lg = K.lg; rg = K.rg; S = K.S; rrect = K.rrect; softGlow = K.softGlow; haze = K.haze;
    finish = K.finish; batch = K.batch; dots = K.dots; dabs = K.dabs; rects = K.rects; qell = K.qell; clump = K.clump; ridge = K.ridge; fbm = K.fbm; glowSpr = K.glowSpr; poly = K.poly;
    skyStrokes = K.skyStrokes; cloudForm = K.cloudForm;
    return true;
  }
  var LINE = '#4a3e38';
  function ink(ctx, s, a, wd) { ctx.strokeStyle = rgba(LINE, a == null ? 0.5 : a); ctx.lineWidth = (wd || 0.7) * s; ctx.lineJoin = 'round'; ctx.stroke(); }

  var ANCH = { wall: { x: 0.3, y: 0.528 }, valve: { x: 0.64, y: 0.512 }, drain: { x: 0.84, y: 0.742 }, saguaro: { x: 0.14, y: 0.535 }, bus: { x: 0.13, y: 0.69 },
    curb: { x: 0.6, y: 0.738 }, cracks: { x: 0.42, y: 0.615 }, mountain: { x: 0.62, y: 0.36 }, canal: { x: 0.72, y: 0.47 }, path: { x: 0.5, y: 0.44 } };
  var SKY = [[0, '#9cc4dc'], [0.45, '#cfe0dc'], [0.8, '#f2e6c8'], [1, '#f8e2bc']];

  var LM = null;
  function layout(w, h) {
    var key = w + 'x' + h; if (LM && LM.key === key) return LM;
    var s = S(w, h), L = { key: key, s: s, w: w, h: h };
    L.hz = h * 0.405; L.bank = h * 0.446; L.water = [h * 0.458, h * 0.478]; L.path = [h * 0.483, h * 0.5];
    L.wallTop = h * 0.503; L.wallBase = h * 0.537; L.gap = [w * 0.585, w * 0.7];
    L.walk = h * 0.7; L.curb = h * 0.736; L.gutter = h * 0.748;
    L.vx = w * 0.5; L.vy = L.hz;
    LM = L; return L;
  }

  function sky(ctx, L) {
    var w = L.w, h = L.h, s = L.s, r = rng(6101);
    ctx.fillStyle = lg(ctx, 0, 0, 0, L.hz, SKY); ctx.fillRect(0, 0, w, L.hz + 4 * s);
    skyStrokes(ctx, -20 * s, w + 20 * s, 0, L.hz, SKY, 150, r, s, 0.09, '#fff2d8', '#a8c8d8');
    softGlow(ctx, w * 1.02, h * 0.16, w * 0.9, '#fff4d8', 0.5); softGlow(ctx, w * 1.02, h * 0.16, 30 * s, '#ffffff', 0.9);
    // a few early cumulus building far off over the mountains (monsoon season), and high wisps
    cloudForm(ctx, w * 0.22, h * 0.2, w * 0.34, h * 0.035, r, { lit: '#fffaf0', mid: '#f0e8dc', shade: '#c8ccd4', top: '#f6f2ea', al: 0.85, lx: 0.9, ly: -0.4, q: 0.5, seam: 0.08 });
    cloudForm(ctx, w * 0.78, h * 0.26, w * 0.26, h * 0.022, r, { lit: '#fffaf0', mid: '#f4ece0', shade: '#d0d2d8', al: 0.7, lx: 0.9, ly: -0.4, q: 0.5, seam: 0.06 });
    ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 0.9 * s; ctx.lineCap = 'round'; ctx.beginPath();
    for (var i = 0; i < 7; i++) { var x = w * (0.35 + r() * 0.5), y = h * (0.08 + r() * 0.08); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 20 * s, y - 3 * s, x + (40 + r() * 40) * s, y + 2 * s); } ctx.stroke();
  }

  function far(ctx, L) {
    var w = L.w, h = L.h, s = L.s, r = rng(6201), i;
    // pale far ranges behind Camelback
    ridge(ctx, -2, w + 2, 3 * s, function (x) { var u = x / w; return L.hz - h * (0.018 + 0.03 * fbm(u * 3 + 2, 6211, 4) + 0.04 * Math.exp(-Math.pow((u - 0.05) / 0.06, 2))); }, L.hz + 2 * s, mix('#a8b4c8', SKY[2][1], 0.45));
    X.camelback(ctx, -w * 0.08, w * 1.02, L.hz + 1 * s, h * 0.125, s, {});
    // the next neighborhood across the canal: rooftops, eucalyptus, oleander and tall fan palms
    ctx.fillStyle = '#b8b0a2'; ctx.fillRect(0, L.hz - 1 * s, w, L.bank - L.hz + 1 * s);
    for (i = 0; i < 14; i++) { var rx = w * (i / 13) + (r() - 0.5) * 12 * s, rw = (18 + r() * 16) * s, rh = (4 + r() * 4) * s, ry = L.bank - h * 0.012 - r() * 3 * s;
      ctx.fillStyle = r() < 0.5 ? '#e8dcc8' : '#d8c8b0'; ctx.fillRect(rx, ry - rh, rw, rh); ctx.fillStyle = r() < 0.5 ? '#a86a50' : '#8a7a6a'; ctx.beginPath(); ctx.moveTo(rx - 2 * s, ry - rh); ctx.lineTo(rx + rw / 2, ry - rh - 3 * s); ctx.lineTo(rx + rw + 2 * s, ry - rh); ctx.fill(); }
    var pal = ['#3e5a3e', '#4e6e48', '#6a8a58', '#8aa86a', '#a8c088'];
    for (i = 0; i < 11; i++) { var ex = w * (i / 10) + (r() - 0.5) * 20 * s, eR = (6 + r() * 11) * s, tall = r() < 0.4; clump(ctx, ex, L.bank - h * 0.01 - eR * (tall ? 1.3 : 0.5), eR * (tall ? 0.8 : 1), pal, r, 0.8, -0.5, true, 0.7); if (tall) clump(ctx, ex + eR * 0.3, L.bank - h * 0.01 - eR * 0.4, eR * 0.7, pal, r, 0.8, -0.5, true, 0.7); }
    [[0.08, 0.13, 3], [0.34, 0.11, -2], [0.37, 0.095, 2], [0.71, 0.12, 2], [0.93, 0.1, -3]].forEach(function (p, j) { X.fanPalm(ctx, w * p[0], L.bank - 2 * s, h * p[1], s, 6230 + j, { lean: p[2] * s, far: true, crown: h * p[1] * 0.14 }); });
    haze(ctx, -w * 0.2, L.hz - h * 0.03, w * 1.2, L.bank, '#f2e6d0', 0.3);
    // the far bank and the canal: concrete lining, blue-green water, reflections and ripples
    // the far bank's path, where people walk and push carts along the canal
    ctx.fillStyle = lg(ctx, 0, L.bank - 1 * s, 0, L.water[0], [[0, '#e4d6bc'], [1, '#cfc2a6']]); ctx.fillRect(0, L.bank - 1 * s, w, L.water[0] - L.bank + 1 * s);
    ctx.fillStyle = 'rgba(90,70,50,0.35)'; ctx.fillRect(0, L.water[0] - 1 * s, w, 1 * s);
    ctx.fillStyle = lg(ctx, 0, L.water[0], 0, L.water[1], [[0, '#6a9a9a'], [1, '#4a7e86']]); ctx.fillRect(0, L.water[0], w, L.water[1] - L.water[0]);
    dabs(ctx, 60, [['#8ab8b4', 0.6], ['#3e6a72', 0.5]], function (j) { return [r() * w, lerp(L.water[0] + 1 * s, L.water[1] - 1 * s, r()), (4 + r() * 10) * s, 0.5 * s, j % 2, 0]; });
    ctx.fillStyle = '#d8d0c0'; ctx.fillRect(0, L.water[1], w, L.path[0] - L.water[1]);
    ctx.fillStyle = 'rgba(80,60,40,0.3)'; ctx.fillRect(0, L.water[1], w, 1 * s);
    // the canal bank path (decomposed granite), and the alley strip between it and the wall
    ctx.fillStyle = lg(ctx, 0, L.path[0], 0, L.wallTop, [[0, '#e8d8bc'], [1, '#d8c4a0']]); ctx.fillRect(0, L.path[0], w, L.wallTop - L.path[0] + 2 * s);
    dots(ctx, 160, [['#b89a74', 0.5], ['#fff4dc', 0.5]], function (j) { return [r() * w, lerp(L.path[0], L.path[1], r()), (0.4 + r() * 0.6) * s, j % 2]; });
    for (i = 0; i < 5; i++) X.creosote(ctx, w * (0.05 + i * 0.22 + r() * 0.06), L.path[1] + 1 * s, (4 + r() * 3) * s, s, r);
    // an old wooden utility pole in the alley with sagging wires
    var px = w * 0.83; ctx.fillStyle = '#7a6048'; ctx.fillRect(px - 1.4 * s, L.hz - h * 0.11, 2.8 * s, L.wallTop - L.hz + h * 0.11); ctx.fillRect(px - 9 * s, L.hz - h * 0.1, 18 * s, 1.6 * s);
    ctx.strokeStyle = 'rgba(60,50,50,0.55)'; ctx.lineWidth = 0.6 * s; ctx.beginPath(); [-8, 8].forEach(function (d) { ctx.moveTo(-2, L.hz - h * 0.085); ctx.quadraticCurveTo(px * 0.5, L.hz - h * 0.06, px + d * s, L.hz - h * 0.1); ctx.moveTo(px + d * s, L.hz - h * 0.1); ctx.quadraticCurveTo(px + 30 * s, L.hz - h * 0.08, w + 2, L.hz - h * 0.09); }); ctx.stroke();
  }

  function backWall(ctx, L) {
    var w = L.w, h = L.h, s = L.s, r = rng(6301), i, t = L.wallTop, b = L.wallBase, g0 = L.gap[0], g1 = L.gap[1];
    // through the gap: the alley floor, the ditch channel and the standpipe with its valve wheel
    ctx.fillStyle = '#c8ac84'; ctx.fillRect(g0, t, g1 - g0, b - t);
    ctx.fillStyle = '#9a7a58'; ctx.beginPath(); ctx.moveTo(g0 + 4 * s, b); ctx.lineTo(g0 + 10 * s, t + 6 * s); ctx.lineTo(g1 - 12 * s, t + 6 * s); ctx.lineTo(g1 - 4 * s, b); ctx.closePath(); ctx.fill();
    var vx = w * 0.64, vb = b - 2 * s, vw = 11 * s, vh = 15 * s;
    ctx.fillStyle = 'rgba(60,40,30,0.3)'; ctx.beginPath(); qell(ctx, vx - 8 * s, vb + 1 * s, 12 * s, 2 * s, 0); ctx.fill();
    ctx.fillStyle = lg(ctx, vx - vw / 2, 0, vx + vw / 2, 0, [[0, '#9a948a'], [0.6, '#cfc8bc'], [1, '#e4ddd0']]); ctx.fillRect(vx - vw / 2, vb - vh, vw, vh); ctx.beginPath(); ctx.rect(vx - vw / 2, vb - vh, vw, vh); ink(ctx, s, 0.5);
    ctx.fillStyle = '#ece6da'; ctx.beginPath(); qell(ctx, vx, vb - vh, vw / 2, 2 * s, 0); ctx.fill(); ink(ctx, s, 0.45);
    ctx.strokeStyle = '#4a3a30'; ctx.lineWidth = 1.2 * s; ctx.beginPath(); ctx.moveTo(vx, vb - vh); ctx.lineTo(vx, vb - vh - 4 * s); ctx.stroke();
    ctx.strokeStyle = '#a8442e'; ctx.lineWidth = 1.6 * s; ctx.beginPath(); qell(ctx, vx, vb - vh - 4.5 * s, 5 * s, 1.8 * s, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(vx - 5 * s, vb - vh - 4.5 * s); ctx.lineTo(vx + 5 * s, vb - vh - 4.5 * s); ctx.moveTo(vx, vb - vh - 6.3 * s); ctx.lineTo(vx, vb - vh - 2.7 * s); ctx.lineWidth = 0.8 * s; ctx.stroke();
    ctx.fillStyle = 'rgba(80,60,40,0.5)'; ctx.fillRect(vx - vw / 2, vb - vh * 0.45, vw, 0.8 * s);
    // the wall itself: stuccoed block, sun on its face, a cap course, faint block joints
    function wallRun(x0, x1) {
      ctx.fillStyle = lg(ctx, 0, t, 0, b, [[0, '#e6d6b8'], [1, '#d4c09c']]); ctx.fillRect(x0, t, x1 - x0, b - t);
      ctx.strokeStyle = 'rgba(140,110,80,0.22)'; ctx.lineWidth = 0.5 * s; ctx.beginPath();
      for (var yy = t + 4 * s, row = 0; yy < b; yy += 4.2 * s, row++) { ctx.moveTo(x0, yy); ctx.lineTo(x1, yy); for (var xx = x0 + (row % 2) * 6 * s; xx < x1; xx += 12 * s) { ctx.moveTo(xx, yy); ctx.lineTo(xx, yy + 4.2 * s); } } ctx.stroke();
      ctx.fillStyle = '#efe2c8'; ctx.fillRect(x0 - 1 * s, t - 2 * s, x1 - x0 + 2 * s, 2.6 * s); ctx.fillStyle = 'rgba(120,90,60,0.35)'; ctx.fillRect(x0, t + 0.6 * s, x1 - x0, 0.8 * s);
      ctx.beginPath(); ctx.rect(x0, t - 2 * s, x1 - x0, b - t + 2 * s); ink(ctx, s, 0.35);
    }
    wallRun(-2, g0); wallRun(g1, w * 0.8);
    // knee-high mud lines: a dark tide band with drips, higher toward the gap where the ditch water pours in
    [[-2, g0], [g1, w * 0.8]].forEach(function (R0) {
      ctx.save(); ctx.beginPath(); ctx.rect(R0[0], t, R0[1] - R0[0], b - t); ctx.clip();
      for (var k = 0; k < 3; k++) {
        ctx.strokeStyle = rgba(k ? '#a0845e' : '#8a6a4a', 0.55 - k * 0.12); ctx.lineWidth = (1.4 - k * 0.3) * s; ctx.beginPath();
        for (var x = R0[0]; x <= R0[1]; x += 3 * s) { var near = Math.max(0, 1 - Math.abs(x - (g0 + g1) / 2) / (w * 0.45)), y = b - (b - t) * (0.32 + 0.22 * near) - k * 2.2 * s + Math.sin(x * 0.2 / s + k) * 0.6 * s; if (x === R0[0]) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(138,106,74,0.35)'; ctx.beginPath(); for (var d = 0; d < 26; d++) { var dx = lerp(R0[0], R0[1], r()), near2 = Math.max(0, 1 - Math.abs(dx - (g0 + g1) / 2) / (w * 0.45)), dy = b - (b - t) * (0.32 + 0.22 * near2); ctx.rect(dx, dy, 0.8 * s, (2 + r() * 5) * s); } ctx.fill();
      ctx.fillStyle = 'rgba(120,90,60,0.25)'; ctx.fillRect(R0[0], b - (b - t) * 0.3, R0[1] - R0[0], (b - t) * 0.3);
      ctx.restore();
    });
    // gap posts
    [g0, g1].forEach(function (gx) { ctx.fillStyle = '#d8c8a8'; ctx.fillRect(gx - 2.4 * s, t - 4 * s, 4.8 * s, b - t + 4 * s); ctx.beginPath(); ctx.rect(gx - 2.4 * s, t - 4 * s, 4.8 * s, b - t + 4 * s); ink(ctx, s, 0.45); });
  }

  function okafor(ctx, L) {
    var w = L.w, h = L.h, s = L.s, r = rng(6401), x0 = w * 0.74, x1 = w * 1.04, base = h * 0.572, top = h * 0.478, i;
    // her low ranch house: painted white brick, teal trim, a shallow roof with solar tiles, a swamp cooler
    ctx.fillStyle = '#9a7a66'; ctx.beginPath(); ctx.moveTo(x0 - 8 * s, top); ctx.lineTo(x0 + 6 * s, top - h * 0.03); ctx.lineTo(x1 + 4 * s, top - h * 0.03); ctx.lineTo(x1 + 8 * s, top); ctx.closePath(); ctx.fill(); ink(ctx, s, 0.5);
    ctx.fillStyle = '#2e3a5e'; for (i = 0; i < 4; i++) { var spx = x0 + 48 * s + i * 13 * s; ctx.beginPath(); ctx.moveTo(spx, top - 2 * s); ctx.lineTo(spx + 11 * s, top - 2 * s); ctx.lineTo(spx + 12 * s, top - h * 0.024); ctx.lineTo(spx + 3 * s, top - h * 0.024); ctx.closePath(); ctx.fill(); }
    ctx.strokeStyle = 'rgba(160,190,240,0.6)'; ctx.lineWidth = 0.4 * s; ctx.beginPath(); for (i = 0; i < 4; i++) { var spx2 = x0 + 48 * s + i * 13 * s; ctx.moveTo(spx2 + 1.5 * s, top - h * 0.012); ctx.lineTo(spx2 + 12 * s, top - h * 0.012); } ctx.stroke();
    ctx.fillStyle = '#d8d4cc'; ctx.fillRect(x0 + 30 * s, top - h * 0.03 - 7 * s, 12 * s, 7 * s); ctx.beginPath(); ctx.rect(x0 + 30 * s, top - h * 0.03 - 7 * s, 12 * s, 7 * s); ink(ctx, s, 0.4);
    ctx.fillStyle = lg(ctx, x0, 0, x1, 0, [[0, '#e4ded2'], [0.3, '#f6f2ea'], [1, '#fbf8f2']]); ctx.fillRect(x0, top, x1 - x0, base - top);
    ctx.strokeStyle = 'rgba(150,130,110,0.25)'; ctx.lineWidth = 0.5 * s; ctx.beginPath(); for (var by = top + 3 * s; by < base; by += 3 * s) { ctx.moveTo(x0, by); ctx.lineTo(x1, by); } ctx.stroke();
    ctx.fillStyle = '#2a8a8a'; ctx.fillRect(x0 - 6 * s, top, x1 - x0 + 12 * s, 2.4 * s);
    // a window with teal shutters, and the side door with its back step
    var wx = x0 + 22 * s, wy = top + 10 * s; ctx.fillStyle = '#5a7a8a'; ctx.fillRect(wx, wy, 22 * s, 16 * s); ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(wx + 2 * s, wy + 2 * s, 6 * s, 12 * s);
    ctx.strokeStyle = '#f6f2ea'; ctx.lineWidth = 1.4 * s; ctx.strokeRect(wx, wy, 22 * s, 16 * s); ctx.beginPath(); ctx.moveTo(wx + 11 * s, wy); ctx.lineTo(wx + 11 * s, wy + 16 * s); ctx.stroke();
    ctx.fillStyle = '#2a8a8a'; ctx.fillRect(wx - 6 * s, wy, 5 * s, 16 * s); ctx.fillRect(wx + 23 * s, wy, 5 * s, 16 * s);
    ctx.fillStyle = '#2a8a8a'; ctx.fillRect(x0 + 4 * s, top + 8 * s, 11 * s, base - top - 9 * s); ctx.fillStyle = '#e8b040'; ctx.beginPath(); ctx.arc(x0 + 13 * s, base - 12 * s, 0.9 * s, 0, TAU); ctx.fill();
    ctx.fillStyle = '#cfc4b0'; ctx.fillRect(x0 + 1 * s, base - 2.4 * s, 17 * s, 3 * s);
    ctx.fillStyle = 'rgba(120,90,60,0.3)'; ctx.fillRect(x0, base - 5 * s, x1 - x0, 5 * s); // old water stain at the foot of her wall
    // her low side-yard wall, running toward us
    var fy0 = base + 1 * s, fx0 = x0 - 4 * s, fy1 = h * 0.69, fx1 = L.vx + (fx0 - L.vx) * (fy1 - L.vy) / (fy0 - L.vy), fhB = 9 * s, fhF = fhB * (fy1 - L.vy) / (fy0 - L.vy);
    poly(ctx, [[fx0, fy0], [fx1, fy1], [fx1, fy1 - fhF], [fx0, fy0 - fhB]]); ctx.fillStyle = '#d8c6a4'; ctx.fill(); ink(ctx, s, 0.45);
    poly(ctx, [[fx0, fy0 - fhB], [fx1, fy1 - fhF], [fx1 + 4 * s, fy1 - fhF - 1 * s], [fx0 + 1.5 * s, fy0 - fhB - 0.5 * s]]); ctx.fillStyle = '#efe2c8'; ctx.fill();
    // the grapefruit tree behind it, heavy with fruit
    var pal = ['#2e4e2e', '#3e6a3a', '#5a8a46', '#7aa858', '#a8c878'];
    for (i = 0; i < 7; i++) clump(ctx, w * (0.92 + (r() - 0.5) * 0.12), h * (0.56 + (r() - 0.5) * 0.04), (9 + r() * 5) * s, pal, r, 0.8, -0.6, false, 1);
    dots(ctx, 16, [['#f2c832', 1], ['#e8a828', 1]], function () { return [w * (0.92 + (r() - 0.5) * 0.14), h * (0.56 + (r() - 0.5) * 0.05), 2 * s, r() < 0.6 ? 0 : 1]; });
    // a palo verde at the corner of her yard, leaning over the sidewalk
    X.paloVerde(ctx, w * 0.97, h * 0.668, h * 0.19, w * 0.36, s, 6431, { lit: 1 });
  }

  function lot(ctx, L) {
    var w = L.w, h = L.h, s = L.s, r = rng(6501), i, t = L.wallBase, b = L.walk;
    ctx.fillStyle = lg(ctx, 0, t, 0, b, [[0, '#d2b48a'], [0.5, '#dcbd90'], [1, '#e2c49a']]); ctx.fillRect(0, t, w, b - t);
    // a silt fan spreading from the gap in the wall, where the ditch water comes in
    var gx = (L.gap[0] + L.gap[1]) / 2;
    ctx.fillStyle = 'rgba(150,118,84,0.35)'; ctx.beginPath(); ctx.moveTo(L.gap[0], t); ctx.quadraticCurveTo(gx - w * 0.2, t + h * 0.04, w * 0.25, h * 0.62); ctx.quadraticCurveTo(w * 0.45, h * 0.655, w * 0.62, h * 0.63); ctx.quadraticCurveTo(gx + w * 0.08, t + h * 0.03, L.gap[1], t); ctx.closePath(); ctx.fill();
    // the low spot: cracked mud tiles where puddles dried
    var cx = w * 0.42, cy = h * 0.615, rx = w * 0.26, ry = h * 0.038;
    ctx.save(); ctx.beginPath(); qell(ctx, cx, cy, rx, ry, 0); ctx.clip();
    ctx.fillStyle = '#c8a47a'; ctx.fillRect(cx - rx, cy - ry, rx * 2, ry * 2);
    // a network of cracks: a jittered grid squashed by perspective, each tile slightly curled and lighter at its edges
    var nx = 16, ny = 7, G = [];
    for (var gj = 0; gj <= ny; gj++) { G.push([]); for (var gi = 0; gi <= nx; gi++) { var kk = gj / ny; G[gj].push([cx - rx + (gi + (hash(gi * 31 + gj, 61) - 0.5) * 0.7) * rx * 2 / nx, cy - ry + Math.pow(kk, 1.15) * ry * 2 + (hash(gi + gj * 17, 62) - 0.5) * ry * 0.18]); } }
    ctx.fillStyle = '#dcbc90';
    for (gj = 0; gj < ny; gj++) for (gi = 0; gi < nx; gi++) { var A = G[gj][gi], B = G[gj][gi + 1], C = G[gj + 1][gi + 1], D = G[gj + 1][gi], sh = 0.16; function I(p, q2) { return [lerp(p[0], q2[0], sh), lerp(p[1], q2[1], sh)]; } var mxp = [(A[0] + C[0]) / 2, (A[1] + C[1]) / 2]; poly(ctx, [I(A, mxp), I(B, mxp), I(C, mxp), I(D, mxp)]); ctx.fill(); }
    ctx.strokeStyle = 'rgba(110,80,52,0.5)'; ctx.lineWidth = 0.7 * s; ctx.beginPath();
    for (gj = 0; gj <= ny; gj++) for (gi = 0; gi <= nx; gi++) { var P0 = G[gj][gi]; if (gi < nx) { ctx.moveTo(P0[0], P0[1]); ctx.lineTo(G[gj][gi + 1][0], G[gj][gi + 1][1]); } if (gj < ny) { ctx.moveTo(P0[0], P0[1]); ctx.lineTo(G[gj + 1][gi][0], G[gj + 1][gi][1]); } }
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,248,230,0.25)'; ctx.fillRect(cx - rx, cy - ry, rx * 2, ry * 0.6);
    ctx.restore();
    ctx.strokeStyle = 'rgba(120,90,60,0.35)'; ctx.lineWidth = 0.8 * s; ctx.beginPath(); qell(ctx, cx, cy, rx, ry, 0); ctx.stroke();
    // pebbles, dry grass, palo verde pods, tire tracks
    dots(ctx, 260, [['#a88a66', 0.6], ['#f2e2c4', 0.6], ['#8a7060', 0.5]], function (j) { var y = lerp(t, b, Math.pow(r(), 0.8)); return [r() * w, y, (0.4 + (y - t) / (b - t) * 0.9) * s, j % 3]; });
    batch(ctx, 220, [['#b89a5a', 0.7 * s, 0.7], ['#d8c080', 0.6 * s, 0.6]], function (j) { var y = lerp(t, b, Math.pow(r(), 0.7)), x = r() * w, l = (2 + (y - t) / (b - t) * 6) * s; if (Math.abs(x - cx) < rx * 0.9 && Math.abs(y - cy) < ry * 0.9) return null; return [x, y, x + (r() - 0.5) * l * 0.6, y - l, j % 2]; });
    ctx.strokeStyle = 'rgba(140,110,80,0.35)'; ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.moveTo(w * 0.18, b); ctx.quadraticCurveTo(w * 0.3, h * 0.6, w * 0.52, h * 0.56); ctx.moveTo(w * 0.3, b); ctx.quadraticCurveTo(w * 0.4, h * 0.61, w * 0.58, h * 0.565); ctx.stroke();
    // creosote bushes and a few rocks
    [[0.05, 0.58, 9], [0.56, 0.575, 7], [0.7, 0.65, 10], [0.27, 0.68, 8]].forEach(function (c) { X.creosote(ctx, w * c[0], h * c[1], c[2] * s, s, r); });
    [[0.62, 0.68, 5], [0.12, 0.64, 4], [0.48, 0.67, 3.4]].forEach(function (k) { var x = w * k[0], y = h * k[1], R = k[2] * s; ctx.fillStyle = 'rgba(70,50,30,0.25)'; ctx.beginPath(); qell(ctx, x - R, y + 0.5 * s, R * 1.6, R * 0.3, 0); ctx.fill(); ctx.fillStyle = '#a89480'; ctx.beginPath(); ctx.moveTo(x - R, y); ctx.quadraticCurveTo(x - R * 0.8, y - R * 1.1, x, y - R); ctx.quadraticCurveTo(x + R, y - R * 0.8, x + R, y); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#cdbca6'; ctx.beginPath(); ctx.moveTo(x, y - R); ctx.quadraticCurveTo(x + R, y - R * 0.8, x + R, y); ctx.lineTo(x + R * 0.2, y - R * 0.3); ctx.fill(); });
    // the robot crew's orange survey flags, staked out yesterday
    [[0.33, 0.575], [0.5, 0.585], [0.24, 0.64], [0.6, 0.655], [0.4, 0.675]].forEach(function (f) { var x = w * f[0], y = h * f[1], H = (y - L.hz) * 0.06; ctx.strokeStyle = '#d8d0c4'; ctx.lineWidth = 0.8 * s; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - H); ctx.stroke(); ctx.fillStyle = '#ff7a2a'; ctx.beginPath(); ctx.moveTo(x, y - H); ctx.lineTo(x + H * 0.45, y - H * 0.85); ctx.lineTo(x, y - H * 0.7); ctx.fill(); });
    // the big saguaro, five arms, with ripe red fruit on top
    X.saguaro(ctx, w * 0.14, h * 0.578, h * 0.215, h * 0.017, [[0.38, -1, 2.4, 0.42], [0.47, 1, 2.2, 0.36], [0.58, -1, 1.7, 0.2], [0.62, 1, 1.6, 0.26], [0.3, 1, 3, 0.26]], s, { lit: 1, fruit: true });
  }

  function front(ctx, L) {
    var w = L.w, h = L.h, s = L.s, r = rng(6601), i, vx = L.vx, vy = L.vy;
    // sidewalk with joints running toward the mountain
    ctx.fillStyle = lg(ctx, 0, L.walk, 0, L.curb, [[0, '#ded6c8'], [1, '#cfc6b6']]); ctx.fillRect(0, L.walk, w, L.curb - L.walk);
    ctx.strokeStyle = 'rgba(120,104,88,0.4)'; ctx.lineWidth = 0.7 * s; ctx.beginPath();
    for (i = -8; i <= 8; i++) { var bx = vx + i * w * 0.16, k0 = (L.walk - vy) / (L.curb - vy); ctx.moveTo(vx + (bx - vx) * k0, L.walk); ctx.lineTo(bx, L.curb); } ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(0, L.walk, w, 1 * s);
    // curb face, gutter, street
    ctx.fillStyle = '#bab0a2'; ctx.fillRect(0, L.curb, w, L.gutter - L.curb); ctx.fillStyle = '#f0e8dc'; ctx.fillRect(0, L.curb, w, 1.2 * s);
    ctx.fillStyle = lg(ctx, 0, L.gutter, 0, h, [[0, '#7a7476'], [0.3, '#6e686c'], [1, '#5a5458']]); ctx.fillRect(0, L.gutter, w, h - L.gutter);
    ctx.fillStyle = '#a8a098'; ctx.fillRect(0, L.gutter, w, 5 * s);
    dots(ctx, 900, [['#8a8486', 0.5], ['#4a4448', 0.45], ['#a8a2a0', 0.4]], function (j) { return [r() * w, lerp(L.gutter + 5 * s, h, r()), (0.4 + r() * 0.8) * s, j % 3]; });
    ctx.strokeStyle = 'rgba(240,236,220,0.55)'; ctx.lineWidth = 2.4 * s; ctx.setLineDash([22 * s, 18 * s]); ctx.beginPath(); ctx.moveTo(-10 * s, h * 0.9); ctx.lineTo(w + 10 * s, h * 0.9); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(40,36,40,0.35)'; ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.moveTo(w * 0.1, h * 0.82); ctx.quadraticCurveTo(w * 0.3, h * 0.8, w * 0.36, h * 0.84); ctx.moveTo(w * 0.66, h * 0.79); ctx.lineTo(w * 0.8, h * 0.8); ctx.stroke();
    // the curb with skate wax and wheel marks
    ctx.fillStyle = 'rgba(250,250,240,0.6)'; ctx.fillRect(w * 0.52, L.curb - 0.5 * s, w * 0.16, 1.6 * s);
    ctx.strokeStyle = 'rgba(40,36,40,0.35)'; ctx.lineWidth = 0.6 * s; ctx.beginPath(); for (i = 0; i < 9; i++) { var mx = w * (0.5 + r() * 0.2), my = L.gutter + (2 + r() * 10) * s; ctx.moveTo(mx, my); ctx.quadraticCurveTo(mx + 10 * s, my - 2 * s, mx + (16 + r() * 14) * s, my + (r() - 0.5) * 4 * s); } ctx.stroke();
    // the street drain: a slot in the curb, choked with gravel and palo verde pods
    var dx = w * 0.84, dw = 30 * s; ctx.fillStyle = '#2a262a'; ctx.fillRect(dx - dw / 2, L.curb + 1.5 * s, dw, L.gutter - L.curb - 1.5 * s);
    ctx.fillStyle = '#9a9086'; ctx.beginPath(); ctx.moveTo(dx - dw / 2 - 8 * s, L.gutter + 5 * s); ctx.lineTo(dx - dw / 2, L.gutter); ctx.lineTo(dx + dw / 2, L.gutter); ctx.lineTo(dx + dw / 2 + 8 * s, L.gutter + 5 * s); ctx.closePath(); ctx.fill();
    dots(ctx, 40, [['#b8aa98', 1], ['#6a6058', 1]], function (j) { return [dx + (r() - 0.5) * dw, L.curb + 2 * s + r() * (L.gutter - L.curb - 1 * s), (0.6 + r() * 0.7) * s, j % 2]; });
    ctx.strokeStyle = '#8a7a3a'; ctx.lineWidth = 1 * s; ctx.lineCap = 'round'; ctx.beginPath(); for (i = 0; i < 8; i++) { var px = dx + (r() - 0.5) * dw * 1.4, py = L.gutter + r() * 4 * s; ctx.moveTo(px, py); ctx.lineTo(px + (r() - 0.5) * 5 * s, py + (r() - 0.5) * 2 * s); } ctx.stroke();
    // the bus stop: a metal bench with no shade, and the sign
    var bx0 = w * 0.03, bx1 = w * 0.23, sy = h * 0.705;
    ctx.fillStyle = 'rgba(60,40,30,0.25)'; ctx.beginPath(); qell(ctx, (bx0 + bx1) / 2 - 10 * s, L.walk + 12 * s, (bx1 - bx0) * 0.62, 3 * s, 0); ctx.fill();
    ctx.strokeStyle = '#3a4a5a'; ctx.lineWidth = 1.6 * s; ctx.beginPath(); [bx0 + 4 * s, bx1 - 4 * s].forEach(function (x) { ctx.moveTo(x, sy); ctx.lineTo(x - 1 * s, sy + 12 * s); ctx.moveTo(x, sy - 1 * s); ctx.lineTo(x + 1 * s, sy - 15 * s); }); ctx.stroke();
    ctx.fillStyle = '#5a7a9a'; ctx.beginPath(); rrect(ctx, bx0, sy - 3 * s, bx1 - bx0, 3.4 * s, 1 * s); ctx.fill(); ink(ctx, s, 0.5);
    ctx.fillStyle = '#6a8aa8'; for (i = 0; i < 3; i++) { ctx.beginPath(); rrect(ctx, bx0, sy - 15 * s + i * 3.6 * s, bx1 - bx0, 2.4 * s, 1 * s); ctx.fill(); }
    ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillRect(bx0 + 2 * s, sy - 2.6 * s, bx1 - bx0 - 4 * s, 0.7 * s);
    var sx = w * 0.27; ctx.strokeStyle = '#8a8e96'; ctx.lineWidth = 1.8 * s; ctx.beginPath(); ctx.moveTo(sx, L.walk + 14 * s); ctx.lineTo(sx, h * 0.6); ctx.stroke();
    ctx.fillStyle = '#2a6ab0'; ctx.beginPath(); rrect(ctx, sx - 8 * s, h * 0.6 - 2 * s, 16 * s, 12 * s, 2 * s); ctx.fill(); ink(ctx, s, 0.5);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(sx - 5 * s, h * 0.6 + 1 * s, 10 * s, 2 * s); ctx.beginPath(); rrect(ctx, sx - 4 * s, h * 0.6 + 4.5 * s, 8 * s, 3.4 * s, 1 * s); ctx.fill();
    // long morning shadows of the sign and the palo verde across the sidewalk
    ctx.fillStyle = 'rgba(70,50,40,0.18)'; ctx.beginPath(); ctx.moveTo(sx, L.walk + 14 * s); ctx.lineTo(sx - w * 0.2, L.walk + 15 * s); ctx.lineTo(sx - w * 0.2, L.walk + 13 * s); ctx.fill();
    ctx.beginPath(); qell(ctx, w * 0.72, L.walk + 8 * s, w * 0.2, 5 * s, 0); ctx.fill();
  }

  function paint(ctx, w, h) {
    if (!bind()) return;
    var L = layout(w, h);
    sky(ctx, L); far(ctx, L); backWall(ctx, L); lot(ctx, L); okafor(ctx, L); front(ctx, L);
    // warm low sun from the right
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = lg(ctx, w, 0, 0, h * 0.3, [[0, 'rgba(255,214,150,0.12)'], [1, 'rgba(255,214,150,0)']]); ctx.fillRect(0, 0, w, h); ctx.restore();
    ctx.fillStyle = lg(ctx, 0, h * 0.8, 0, h, [[0, 'rgba(40,24,20,0)'], [1, 'rgba(40,24,20,0.25)']]); ctx.fillRect(0, h * 0.8, w, h * 0.2);
    finish(ctx, w, h, '#ffb070', 0.12, 0.2, 0.04, '#2a1612', 0.42);
  }
  function overlay(ctx, w, h, t) {
    if (!bind()) return;
    var L = layout(w, h), s = L.s, i;
    // glints on the canal
    ctx.fillStyle = '#ffffff';
    for (i = 0; i < 12; i++) { var gx = hash(i, 31) * w, gy = lerp(L.water[0] + 1 * s, L.water[1] - 1 * s, hash(i, 32)), tw = Math.pow(Math.max(0, Math.sin(t * (1.4 + hash(i, 33) * 2) + i * 4)), 6); if (tw < 0.05) continue; ctx.globalAlpha = tw * 0.9; ctx.fillRect(gx - 3 * s, gy, 6 * s, 0.7 * s); }
    ctx.globalAlpha = 1;
    // heat shimmer rising off the dirt
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (i = 0; i < 6; i++) { var y = lerp(L.wallBase + 6 * s, L.walk - 6 * s, hash(i, 41)), x = hash(i, 42) * w, ph = t * 0.8 + i; ctx.strokeStyle = 'rgba(255,240,210,' + (0.05 + 0.04 * Math.sin(ph)).toFixed(3) + ')'; ctx.lineWidth = 1.2 * s; ctx.beginPath();
      for (var k = 0; k <= 12; k++) { var xx = x - 30 * s + k * 5 * s, yy = y - (t * 6 * s + i * 9 * s) % (14 * s) + Math.sin(k * 0.9 + t * 3 + i) * 1.2 * s; if (!k) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy); } ctx.stroke(); }
    ctx.restore();
    // a Gambel's quail family scurrying across the lot now and then
    var per = 26, q = (t % per) / per;
    if (q < 0.45) { var qx = lerp(-20 * s, w + 20 * s, q / 0.45), qy = h * 0.655;
      for (i = 0; i < 5; i++) { var bx = qx - i * (i ? 7 : 0) * s - (i ? 6 * s : 0), by = qy + (i % 2) * 2 * s, sz = i ? 0.6 : 1, hop = Math.abs(Math.sin(t * 14 + i)) * 1 * s;
        ctx.fillStyle = '#8a8478'; ctx.beginPath(); qell(ctx, bx, by - 3 * s * sz - hop, 4 * s * sz, 3 * s * sz, 0); ctx.fill(); ctx.fillStyle = '#6a6458'; ctx.beginPath(); ctx.arc(bx + 3.4 * s * sz, by - 5.6 * s * sz - hop, 1.8 * s * sz, 0, TAU); ctx.fill();
        if (!i) { ctx.strokeStyle = '#2a2420'; ctx.lineWidth = 0.7 * s; ctx.beginPath(); ctx.moveTo(bx + 3.6 * s, by - 7 * s - hop); ctx.quadraticCurveTo(bx + 5 * s, by - 10 * s - hop, bx + 6.4 * s, by - 9.4 * s - hop); ctx.stroke(); ctx.fillStyle = '#c8642a'; ctx.beginPath(); ctx.arc(bx + 3 * s, by - 6 * s - hop, 0.8 * s, 0, TAU); ctx.fill(); } } }
    // a delivery drone gliding high along the canal
    var dq = (t % 34) / 34, dx = lerp(w + 20 * s, -20 * s, dq), dy = h * 0.3 + Math.sin(t * 1.3) * 3 * s;
    ctx.fillStyle = '#f2eef6'; ctx.fillRect(dx - 5 * s, dy - 1 * s, 10 * s, 2 * s); ctx.fillStyle = '#c8cedc'; ctx.fillRect(dx - 8 * s, dy - 2.2 * s, 4 * s, 0.8 * s); ctx.fillRect(dx + 4 * s, dy - 2.2 * s, 4 * s, 0.8 * s);
    ctx.fillStyle = '#f5b82e'; ctx.fillRect(dx - 1.6 * s, dy + 1 * s, 3.2 * s, 2.6 * s);
    // a grackle flapping over the rooftops
    ctx.strokeStyle = 'rgba(40,36,50,0.8)'; ctx.lineWidth = 1 * s; ctx.lineCap = 'round';
    for (i = 0; i < 2; i++) { var a = t * 0.15 + i * 2.6, bx2 = w * 0.5 + Math.cos(a) * w * 0.35, by2 = h * (0.36 + i * 0.03) + Math.sin(a * 1.7) * 6 * s, f = Math.sin(t * 7 + i) * 2 * s; ctx.beginPath(); ctx.moveTo(bx2 - 3.4 * s, by2 - f); ctx.quadraticCurveTo(bx2 - 1.4 * s, by2 - 1.2 * s, bx2, by2); ctx.quadraticCurveTo(bx2 + 1.4 * s, by2 - 1.2 * s, bx2 + 3.4 * s, by2 - f); ctx.stroke(); }
  }

  PAINT.phx_lot = { focus: { x: 0.95, y: 0.16 }, track: 'morning', anchors: ANCH,
    paint: function (ctx, w, h) { ctx.save(); try { paint(ctx, w, h); } catch (e) { PAINT._err = 'phx_lot: ' + String(e && e.stack || e); } finally { ctx.restore(); } },
    overlay: function (ctx, w, h, t) { ctx.save(); try { overlay(ctx, w, h, t); } catch (e) { PAINT._err = 'phx_lot overlay: ' + String(e && e.stack || e); } finally { ctx.restore(); } } };

  if (typeof LATE !== 'undefined') LATE.push(function () {
    if (typeof PROPS === 'undefined' || typeof PROPS_ART === 'undefined') return;
    // Dev's skateboard, a Gambel's quail with its topknot, a steel water bottle
    PROPS_ART.phx_board = function () { return '<svg viewBox="0 0 90 40"><ellipse cx="45" cy="37" rx="36" ry="3" fill="rgba(0,0,0,.22)"/><g class="pa-body"><path d="M8 18 q-6 0 -6 -6 q0 -2 3 -2 h80 q3 0 3 2 q0 6 -6 6z" fill="#2a9d8f" stroke="#1f3a40" stroke-width="2"/><path d="M20 13 h50" stroke="#f5b82e" stroke-width="3" stroke-linecap="round"/><path d="M14 18 v6 M76 18 v6" stroke="#6a6e78" stroke-width="3"/><circle cx="14" cy="28" r="5" fill="#f2eee4" stroke="#4a4650" stroke-width="2"/><circle cx="76" cy="28" r="5" fill="#f2eee4" stroke="#4a4650" stroke-width="2"/></g></svg>'; };
    PROPS_ART.phx_quail = function () { return '<svg viewBox="0 0 60 56"><ellipse cx="30" cy="53" rx="16" ry="3" fill="rgba(0,0,0,.2)"/><g class="pa-body"><ellipse cx="28" cy="36" rx="17" ry="13" fill="#8a8478" stroke="#4a4038" stroke-width="2"/><g class="pa-wing"><path d="M14 34 q10 -8 22 0 q-8 8 -22 0z" fill="#a89a84"/><path d="M18 36 l4 -2 M24 37 l4 -2 M30 37 l3 -2" stroke="#fff" stroke-width="1.4"/></g><path d="M22 44 q6 4 12 0" fill="#e8d8b8"/>' +
      '<circle cx="42" cy="22" r="8.5" fill="#6a6458" stroke="#4a4038" stroke-width="2"/><path d="M40 20 a5 5 0 0 1 8 0" fill="#c8642a"/><circle cx="45" cy="22" r="1.6" fill="#1d1630"/><path d="M50 23 l5 1 l-5 2z" fill="#2a2420"/><path d="M42 26 q4 4 8 0" stroke="#fff" stroke-width="1.6" fill="none"/><path d="M41 14 q-2 -8 4 -10 q1 4 -2 7" fill="#2a2420"/><path d="M24 48 v6 M32 48 v6" stroke="#8a6a4a" stroke-width="2"/></g></svg>'; };
    PROPS_ART.phx_bottle = function () { return '<svg viewBox="0 0 40 80"><ellipse cx="20" cy="77" rx="12" ry="3" fill="rgba(0,0,0,.2)"/><g class="pa-body"><rect x="9" y="18" width="22" height="58" rx="7" fill="#e86a5a" stroke="#5b2a2a" stroke-width="2.4"/><rect x="12" y="8" width="16" height="11" rx="3" fill="#d8dce6" stroke="#4a4650" stroke-width="2.4"/><path d="M14 8 a6 6 0 0 1 12 0" stroke="#4a4650" stroke-width="2.4" fill="none"/><rect x="13" y="26" width="4" height="40" rx="2" fill="#fff" opacity=".45"/><path d="M12 50 q8 -6 16 0" stroke="#fff" stroke-width="2.4" fill="none"/></g></svg>'; };
    PROPS.phx_lot = [
      { id: 'phx_bottle', x: 22, y: 74, w: 24, sfx: 'clink', fx: 'jiggle' },
      { id: 'person', x: 32, y: 74, w: 46, talk: 'phx_lot', look: { skin: '#c98e64', shirt: '#f2c14e', hair: '#1b1410' } },
      { id: 'phx_board', x: 45, y: 75, w: 54, sfx: 'whoosh', fx: 'spin' },
      { id: 'phx_quail', x: 70, y: 66, w: 34, sfx: 'flap', fx: 'flyaway' },
      { id: 'person', x: 92, y: 74, w: 44, talk: 'phx_lot', look: { skin: '#e8b896', shirt: '#2a9d8f', hair: '#9a9aa2' } }
    ];
  });
})();
