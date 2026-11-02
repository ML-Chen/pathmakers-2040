/* scenes/calderbay.js - Calder Bay, a made-up fishing town on a foggy Pacific Northwest bay in winter (the world map's
   preview of the Calder Bay place; the villain plot's secret datacenter is here, so the place is fictional).
   PAINT.calderbay. We stand on a driftwood beach and look across the grey-green bay. Layers of fog hang between dark
   hills of Douglas fir, their tops dusted with snow. On the left, the little town climbs its hill: clapboard houses in
   faded red, yellow and blue, a white church steeple, a fishing pier with trawlers and a lighthouse on the point. On
   the right shore stands the thing nobody can explain: a huge windowless datacenter building behind a fence, rows of
   cooling vents on its roof, and warm water pouring from its outfall so the bay steams in the cold air. Gulls, a
   crab boat, the lighthouse beam. Kid-safe and quietly mysterious. The interest is in the top half (the place card
   covers the bottom); the lower part is the calm beach.
   Uses the painting utilities in window.CHINA_KIT (src/scenes/_china_kit.js). Everything is seeded. */
(function () {
  'use strict';
  var PAINT = (window.PAINT = window.PAINT || {});
  var K, PI = Math.PI, TAU = PI * 2;
  var rng, hash, lerp, mix, rgba, lg, rg, S, rrect, softGlow, haze, finish, batch, dots, dabs, rects, qell, clump, ridge, fbm, glowSpr, poly, skyStrokes, cloudForm, reflect, boat, wispSpr;
  function bind() {
    if (K) return true; K = window.CHINA_KIT; if (!K) return false;
    rng = K.rng; hash = K.hash; lerp = K.lerp; mix = K.mix; rgba = K.rgba; lg = K.lg; rg = K.rg; S = K.S; rrect = K.rrect; softGlow = K.softGlow; haze = K.haze;
    finish = K.finish; batch = K.batch; dots = K.dots; dabs = K.dabs; rects = K.rects; qell = K.qell; clump = K.clump; ridge = K.ridge; fbm = K.fbm; glowSpr = K.glowSpr; poly = K.poly;
    skyStrokes = K.skyStrokes; cloudForm = K.cloudForm; reflect = K.reflect; boat = K.boat; wispSpr = K.wispSpr;
    return true;
  }
  var LINE = '#26302e';
  function ink(ctx, s, a, wd) { ctx.strokeStyle = rgba(LINE, a == null ? 0.5 : a); ctx.lineWidth = (wd || 0.7) * s; ctx.lineJoin = 'round'; ctx.stroke(); }
  var SKY = [[0, '#8a9aa8'], [0.5, '#b8c4c8'], [0.9, '#dde2de'], [1, '#e8e8e0']];

  var LM = null;
  function layout(w, h) {
    var key = w + 'x' + h; if (LM && LM.key === key) return LM;
    var s = S(w, h), L = { key: key, s: s, w: w, h: h };
    L.hz = h * 0.36; L.water1 = h * 0.5; L.dc = { x0: w * 0.58, x1: w * 0.98, top: h * 0.29, base: h * 0.365 };
    LM = L; return L;
  }

  // a ridge of Douglas firs: dark pointed crowns along a hill line, snow on the upper slopes
  function firRidge(ctx, L, x0, x1, base, Hh, seed, col, snow) {
    var w = L.w, h = L.h, s = L.s, r = rng(seed);
    function Y(x) { var u = (x - x0) / (x1 - x0); return base - Hh * (0.45 + 0.55 * Math.sin(u * PI * 0.9 + 0.2)) - Hh * 0.2 * fbm(u * 4, seed, 3); }
    ridge(ctx, x0, x1, 2 * s, Y, base + 2 * s, col);
    if (snow) { ctx.save(); ridge(ctx, x0, x1, 2 * s, Y, base + 2 * s, null); ctx.clip(); batch(ctx, 70, [['#f4f6f8', 0.8 * s, 0.6], ['#dfe6ea', 0.7 * s, 0.5]], function (j) { var x = lerp(x0, x1, r()), y = Y(x) + Math.pow(r(), 2) * Hh * 0.2, l = (1.5 + r() * 3) * s; return [x, y, x + l, y + l * 0.35, j % 2]; }); ctx.restore(); }
    ctx.fillStyle = col; ctx.beginPath();
    for (var x = x0; x < x1; x += (2.4 + r() * 2.6) * s) { var y = Y(x) + r() * 2 * s, th = (6 + r() * 8) * s * (Hh / (h * 0.1)); ctx.moveTo(x - th * 0.22, y + 1 * s); ctx.lineTo(x, y - th); ctx.lineTo(x + th * 0.22, y + 1 * s); }
    ctx.fill();
    return Y;
  }

  function paint(ctx, w, h) {
    if (!bind()) return;
    var L = layout(w, h), s = L.s, r = rng(1101), i, hz = L.hz;
    // pale winter sky with low clouds
    ctx.fillStyle = lg(ctx, 0, 0, 0, hz, SKY); ctx.fillRect(0, 0, w, hz + 4 * s);
    skyStrokes(ctx, -20 * s, w + 20 * s, 0, hz, SKY, 150, r, s, 0.1, '#f4f0e4', '#8a9aaa');
    softGlow(ctx, w * 0.3, h * 0.12, w * 0.5, '#f8f4e8', 0.35);
    cloudForm(ctx, w * 0.7, h * 0.1, w * 0.5, h * 0.04, r, { lit: '#eef0ee', mid: '#d4dadc', shade: '#9aa6b0', al: 0.8, lx: -0.6, ly: -0.7, q: 0.5, seam: 0.1 });
    // fir-covered hills in layers, fading into the fog
    firRidge(ctx, L, -2, w + 2, hz - h * 0.02, h * 0.08, 1111, '#8a9a9c', true);
    var ws = wispSpr('#ffffff'); if (ws) { ctx.save(); ctx.globalAlpha = 0.7; for (i = 0; i < 6; i++) ctx.drawImage(ws, w * (-0.3 + i * 0.25), hz - h * 0.06 - hash(i, 3) * h * 0.02, w * 0.5, h * 0.05); ctx.restore(); }
    firRidge(ctx, L, -2, w * 0.62, hz, h * 0.07, 1121, '#4a5e58', true);
    firRidge(ctx, L, w * 0.5, w + 2, hz, h * 0.05, 1131, '#56685e', false);
    // the town on the left: clapboard houses climbing the hill, a steeple, the lighthouse on the point
    var hillY = function (x) { return hz - h * 0.05 * Math.max(0, 1 - x / (w * 0.45)); };
    ctx.fillStyle = '#5a6a58'; ctx.beginPath(); ctx.moveTo(-2, hz + 2 * s); for (var x = -2; x <= w * 0.48; x += 3 * s) ctx.lineTo(x, hillY(x)); ctx.lineTo(w * 0.48, hz + 2 * s); ctx.fill();
    var cols = ['#b84a3a', '#e8c25a', '#5a8ab0', '#f2ece0', '#8aa86a', '#c86a4a'];
    for (i = 0; i < 16; i++) { var hx = w * (0.02 + (i % 8) * 0.052) + ((i / 8) | 0) * w * 0.02, hy = hillY(hx) + (((i / 8) | 0) ? h * 0.012 : 0) + 3 * s, hw = (11 + hash(i, 4) * 6) * s, hh = (7 + hash(i, 5) * 4) * s;
      ctx.fillStyle = cols[i % cols.length]; ctx.fillRect(hx, hy - hh, hw, hh); ctx.fillStyle = '#3a3a40'; ctx.beginPath(); ctx.moveTo(hx - 1.4 * s, hy - hh); ctx.lineTo(hx + hw / 2, hy - hh - 5 * s); ctx.lineTo(hx + hw + 1.4 * s, hy - hh); ctx.fill();
      ctx.fillStyle = hash(i, 6) < 0.5 ? '#ffe0a0' : 'rgba(40,50,60,0.6)'; ctx.fillRect(hx + hw * 0.2, hy - hh * 0.6, hw * 0.2, hh * 0.3); ctx.fillRect(hx + hw * 0.6, hy - hh * 0.6, hw * 0.2, hh * 0.3); }
    var cx = w * 0.3, cy = hillY(cx); ctx.fillStyle = '#f4f0e6'; ctx.fillRect(cx - 4 * s, cy - 16 * s, 8 * s, 16 * s); ctx.beginPath(); ctx.moveTo(cx - 4 * s, cy - 16 * s); ctx.lineTo(cx, cy - 30 * s); ctx.lineTo(cx + 4 * s, cy - 16 * s); ctx.fill(); ink(ctx, s, 0.4);
    var lx = w * 0.46, ly = hz + 1 * s; ctx.fillStyle = '#6a6a5e'; ctx.beginPath(); qell(ctx, lx, ly, 14 * s, 3 * s, 0); ctx.fill();
    ctx.fillStyle = '#f4f2ea'; ctx.beginPath(); ctx.moveTo(lx - 4 * s, ly); ctx.lineTo(lx - 2.6 * s, ly - 24 * s); ctx.lineTo(lx + 2.6 * s, ly - 24 * s); ctx.lineTo(lx + 4 * s, ly); ctx.fill(); ink(ctx, s, 0.4);
    ctx.fillStyle = '#c0403a'; ctx.fillRect(lx - 3.6 * s, ly - 14 * s, 7.2 * s, 3 * s); ctx.fillStyle = '#2a2a30'; ctx.fillRect(lx - 3.4 * s, ly - 29 * s, 6.8 * s, 5 * s); ctx.fillStyle = '#ffe8a0'; ctx.fillRect(lx - 2.4 * s, ly - 28 * s, 4.8 * s, 3 * s);
    ctx.beginPath(); ctx.moveTo(lx - 4 * s, ly - 29 * s); ctx.lineTo(lx, ly - 33 * s); ctx.lineTo(lx + 4 * s, ly - 29 * s); ctx.fillStyle = '#2a2a30'; ctx.fill();
    L.beam = [lx, ly - 26.5 * s];
    // the datacenter on the right shore: a huge windowless block behind a fence, roof vents, the outfall
    var D = L.dc;
    ctx.fillStyle = 'rgba(30,40,40,0.3)'; ctx.fillRect(D.x0 - 4 * s, D.base, D.x1 - D.x0 + 8 * s, 3 * s);
    ctx.fillStyle = lg(ctx, D.x0, 0, D.x1, 0, [[0, '#9aa2a6'], [0.4, '#c4cacc'], [1, '#8a9296']]); ctx.fillRect(D.x0, D.top, D.x1 - D.x0, D.base - D.top); ctx.beginPath(); ctx.rect(D.x0, D.top, D.x1 - D.x0, D.base - D.top); ink(ctx, s, 0.5);
    ctx.strokeStyle = 'rgba(80,90,96,0.45)'; ctx.lineWidth = 0.6 * s; ctx.beginPath(); for (x = D.x0 + 8 * s; x < D.x1; x += 8 * s) { ctx.moveTo(x, D.top); ctx.lineTo(x, D.base); } ctx.stroke();
    for (i = 0; i < 6; i++) { var vx = lerp(D.x0 + 6 * s, D.x1 - 14 * s, i / 5); ctx.fillStyle = '#6a7276'; ctx.fillRect(vx, D.top - 5 * s, 10 * s, 5 * s); ctx.fillStyle = '#3a4246'; ctx.beginPath(); qell(ctx, vx + 5 * s, D.top - 5 * s, 4.4 * s, 1.2 * s, 0); ctx.fill(); }
    ctx.fillStyle = '#2a3236'; ctx.fillRect(D.x0 + (D.x1 - D.x0) * 0.42, D.base - 8 * s, 12 * s, 8 * s);
    ctx.fillStyle = '#5ae8d8'; ctx.fillRect(D.x0 + 6 * s, D.top + 4 * s, 2 * s, 2 * s);
    ctx.strokeStyle = 'rgba(60,70,74,0.7)'; ctx.lineWidth = 0.5 * s; ctx.beginPath(); var fy = D.base + 2 * s; for (x = D.x0 - 8 * s; x < w; x += 2.6 * s) { ctx.moveTo(x, fy); ctx.lineTo(x + 2.6 * s, fy - 5 * s); ctx.moveTo(x + 2.6 * s, fy); ctx.lineTo(x, fy - 5 * s); } ctx.moveTo(D.x0 - 8 * s, fy - 5 * s); ctx.lineTo(w, fy - 5 * s); ctx.stroke();
    // the bay: grey-green water, a pale warm patch where the outfall steams
    ctx.fillStyle = lg(ctx, 0, hz, 0, L.water1 + 6 * s, [[0, '#9aaaa8'], [0.5, '#6a8482'], [1, '#4a6664']]); ctx.fillRect(0, hz + 1 * s, w, L.water1 - hz + 6 * s);
    reflect(ctx, w, hz + 1 * s, hz + h * 0.06, 0.35, 1.4 * s, 0.9 / s, 6);
    batch(ctx, 360, [['#dfe8e6', 0.8 * s, 0.45], ['#3a5452', 0.9 * s, 0.35]], function () { var p = Math.pow(r(), 1.3), yy = hz + 3 * s + p * (L.water1 - hz), xx = r() * w, l = (2 + p * 12) * s; return [xx, yy, xx + l, yy, r() < 0.5 ? 0 : 1]; });
    var ox = D.x0 + (D.x1 - D.x0) * 0.47; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, ox, hz + h * 0.02, 0, w * 0.25, [[0, 'rgba(255,230,200,0.12)'], [1, 'rgba(255,230,200,0)']]); ctx.beginPath(); qell(ctx, ox, hz + h * 0.025, w * 0.25, h * 0.03, 0); ctx.fill(); ctx.restore();
    if (ws) { ctx.save(); for (i = 0; i < 8; i++) { ctx.globalAlpha = 0.35; ctx.drawImage(ws, ox - w * 0.2 + hash(i, 7) * w * 0.25, hz + h * (0.005 + hash(i, 8) * 0.03) - h * 0.02, w * 0.25, h * 0.04); } ctx.restore(); }
    // the fishing pier with a trawler, and a crab boat out on the bay
    ctx.fillStyle = '#5a4a3e'; ctx.fillRect(w * 0.05, hz + h * 0.03, w * 0.3, 2.4 * s); for (i = 0; i < 10; i++) ctx.fillRect(w * (0.06 + i * 0.03), hz + h * 0.03, 1.4 * s, 7 * s);
    var bx = w * 0.22, by = hz + h * 0.05; ctx.fillStyle = '#2a4a6a'; ctx.beginPath(); ctx.moveTo(bx - 16 * s, by - 5 * s); ctx.lineTo(bx + 18 * s, by - 5 * s); ctx.lineTo(bx + 14 * s, by); ctx.lineTo(bx - 14 * s, by); ctx.fill(); ctx.fillStyle = '#f2ece0'; ctx.fillRect(bx - 4 * s, by - 12 * s, 10 * s, 7 * s); ctx.strokeStyle = '#3a3a40'; ctx.lineWidth = 0.8 * s; ctx.beginPath(); ctx.moveTo(bx - 10 * s, by - 5 * s); ctx.lineTo(bx - 10 * s, by - 22 * s); ctx.lineTo(bx + 4 * s, by - 12 * s); ctx.stroke();
    var cbx = w * 0.62, cby = hz + h * 0.09; ctx.fillStyle = '#c0503a'; ctx.beginPath(); ctx.moveTo(cbx - 11 * s, cby - 3.4 * s); ctx.lineTo(cbx + 12 * s, cby - 3.4 * s); ctx.lineTo(cbx + 9 * s, cby); ctx.lineTo(cbx - 9 * s, cby); ctx.fill(); ctx.fillStyle = '#f2ece0'; ctx.fillRect(cbx - 2 * s, cby - 8 * s, 7 * s, 4.6 * s); ctx.fillStyle = '#e8c25a'; for (i = 0; i < 3; i++) ctx.fillRect(cbx - 9 * s + i * 2.6 * s, cby - 5.4 * s, 2 * s, 2 * s);
    // the driftwood beach in front
    var bY = L.water1; ctx.fillStyle = lg(ctx, 0, bY, 0, h, [[0, '#a8a090'], [0.3, '#968e7e'], [1, '#6a6458']]); ctx.beginPath(); ctx.moveTo(-2, bY + 4 * s); ctx.quadraticCurveTo(w * 0.5, bY - 6 * s, w + 2, bY + 2 * s); ctx.lineTo(w + 2, h + 2); ctx.lineTo(-2, h + 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.4 * s; ctx.beginPath(); ctx.moveTo(-2, bY + 3 * s); ctx.quadraticCurveTo(w * 0.5, bY - 7 * s, w + 2, bY + 1 * s); ctx.stroke();
    dots(ctx, 500, [['#c8c0ae', 0.6], ['#5a5448', 0.5], ['#e8e2d4', 0.5]], function (j) { var y = lerp(bY + 4 * s, h, Math.pow(r(), 0.8)); return [r() * w, y, (0.5 + (y - bY) / h * 3) * s, j % 3]; });
    [[0.1, 0.58, 0.32, -0.08], [0.55, 0.62, 0.4, 0.05], [0.7, 0.7, 0.3, -0.1]].forEach(function (d) { var x0 = w * d[0], y0 = h * d[1], len = w * d[2]; ctx.save(); ctx.translate(x0, y0); ctx.rotate(d[3]); ctx.fillStyle = 'rgba(40,36,30,0.3)'; ctx.beginPath(); qell(ctx, len / 2, 4 * s, len * 0.52, 3 * s, 0); ctx.fill();
      ctx.fillStyle = lg(ctx, 0, -5 * s, 0, 5 * s, [[0, '#d8d0c0'], [1, '#9a9080']]); ctx.beginPath(); rrect(ctx, 0, -4 * s, len, 8 * s, 4 * s); ctx.fill(); ink(ctx, s, 0.4); ctx.strokeStyle = 'rgba(100,90,76,0.5)'; ctx.lineWidth = 0.6 * s; ctx.beginPath(); for (i = 0; i < 4; i++) { ctx.moveTo(len * 0.1, -2 * s + i * 1.4 * s); ctx.lineTo(len * 0.9, -2.4 * s + i * 1.4 * s); } ctx.stroke(); ctx.restore(); });
    // dark rocks with a tide pool, a rowboat pulled up on the stones, a stack of crab pots
    [[0.08, 0.7, 18], [0.16, 0.72, 11], [0.86, 0.6, 14], [0.92, 0.62, 9], [0.4, 0.8, 16]].forEach(function (k2) { var x = w * k2[0], y = h * k2[1], R = k2[2] * s; ctx.fillStyle = 'rgba(30,30,30,0.3)'; ctx.beginPath(); qell(ctx, x, y + 1 * s, R * 1.2, R * 0.25, 0); ctx.fill(); ctx.fillStyle = '#3e4440'; ctx.beginPath(); ctx.moveTo(x - R, y); ctx.quadraticCurveTo(x - R * 0.9, y - R * 0.9, x - R * 0.1, y - R * 0.8); ctx.quadraticCurveTo(x + R * 0.9, y - R * 0.7, x + R, y); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#5a625c'; ctx.beginPath(); ctx.moveTo(x - R * 0.7, y - R * 0.5); ctx.quadraticCurveTo(x - R * 0.2, y - R * 0.9, x + R * 0.3, y - R * 0.7); ctx.lineTo(x - R * 0.1, y - R * 0.45); ctx.fill(); dots(ctx, 6, [['#f2ece0', 0.8]], function () { return [x + (r() - 0.5) * R, y - R * (0.2 + r() * 0.4), 0.8 * s, 0]; }); });
    ctx.fillStyle = '#6a8a90'; ctx.beginPath(); qell(ctx, w * 0.24, h * 0.735, 22 * s, 4 * s, 0); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); qell(ctx, w * 0.22, h * 0.733, 10 * s, 1.4 * s, 0); ctx.fill();
    var rbx = w * 0.68, rby = h * 0.76; ctx.save(); ctx.translate(rbx, rby); ctx.rotate(-0.12); ctx.fillStyle = 'rgba(30,30,30,0.3)'; ctx.beginPath(); qell(ctx, 0, 4 * s, 40 * s, 5 * s, 0); ctx.fill();
    ctx.fillStyle = '#e8e2d4'; ctx.beginPath(); ctx.moveTo(-38 * s, -8 * s); ctx.lineTo(36 * s, -10 * s); ctx.quadraticCurveTo(30 * s, 4 * s, 10 * s, 4 * s); ctx.lineTo(-26 * s, 4 * s); ctx.quadraticCurveTo(-36 * s, 0, -38 * s, -8 * s); ctx.closePath(); ctx.fill(); ink(ctx, s, 0.5);
    ctx.fillStyle = '#3a6a8a'; ctx.fillRect(-36 * s, -5 * s, 70 * s, 2.4 * s); ctx.fillStyle = '#8a6a4a'; ctx.fillRect(-10 * s, -9 * s, 4 * s, 8 * s); ctx.restore();
    for (i = 0; i < 5; i++) { var px = w * 0.88 + (i % 2) * 14 * s - (i > 2 ? 7 * s : 0), py = h * 0.73 - ((i / 2) | 0) * 11 * s; ctx.fillStyle = '#c8a040'; ctx.fillRect(px - 7 * s, py - 10 * s, 14 * s, 10 * s); ctx.strokeStyle = '#5a4a2a'; ctx.lineWidth = 0.6 * s; ctx.beginPath(); for (var q = 0; q < 4; q++) { ctx.moveTo(px - 7 * s + q * 4.6 * s, py - 10 * s); ctx.lineTo(px - 7 * s + q * 4.6 * s, py); ctx.moveTo(px - 7 * s, py - 10 * s + q * 3.3 * s); ctx.lineTo(px + 7 * s, py - 10 * s + q * 3.3 * s); } ctx.stroke(); }
    ctx.fillStyle = lg(ctx, 0, h * 0.75, 0, h, [[0, 'rgba(30,36,36,0)'], [1, 'rgba(30,36,36,0.3)']]); ctx.fillRect(0, h * 0.75, w, h * 0.25);
    finish(ctx, w, h, '#a8c0c8', 0.12, 0.22, 0.045, '#141c1e', 0.42);
  }
  function overlay(ctx, w, h, t) {
    if (!bind()) return;
    var L = layout(w, h), s = L.s, i, D = L.dc, ws = K.wispSpr('#ffffff'), sp = glowSpr('#ffffff');
    // steam rising from the warm outfall and the roof vents
    if (sp) { ctx.save(); var ox = D.x0 + (D.x1 - D.x0) * 0.47;
      for (i = 0; i < 14; i++) { var per = 7 + hash(i, 3) * 4, q = ((t + hash(i, 4) * per) % per) / per, x = ox + (hash(i, 5) - 0.5) * w * 0.3 + Math.sin(t * 0.5 + i) * 6 * s, y = L.hz + h * 0.02 - q * h * 0.08, sz = (6 + q * 20) * s; ctx.globalAlpha = 0.28 * Math.sin(q * PI); ctx.drawImage(sp, x - sz, y - sz, sz * 2, sz * 2); }
      for (i = 0; i < 6; i++) { var vx = lerp(D.x0 + 11 * s, D.x1 - 9 * s, i / 5); for (var k = 0; k < 3; k++) { var q2 = ((t * 0.25 + k / 3 + i * 0.13) % 1), sz2 = (3 + q2 * 10) * s; ctx.globalAlpha = 0.3 * (1 - q2); ctx.drawImage(sp, vx - sz2 + Math.sin(t + k) * 2 * s, D.top - 6 * s - q2 * h * 0.06 - sz2, sz2 * 2, sz2 * 2); } }
      ctx.restore(); }
    // fog drifting along the hills
    if (ws) { ctx.save(); for (i = 0; i < 4; i++) { var fq = ((t * 0.01 + i * 0.27) % 1), fx = lerp(-w * 0.6, w * 1.1, fq); ctx.globalAlpha = 0.4; ctx.drawImage(ws, fx, L.hz - h * (0.05 + i * 0.012), w * 0.6, h * 0.05); } ctx.restore(); }
    // the lighthouse beam sweeping, gulls
    if (L.beam) { var a = t * 0.9, br = Math.max(0, Math.cos(a)); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = lg(ctx, L.beam[0], L.beam[1], L.beam[0] + Math.sin(a) * w * 0.5, L.beam[1], [[0, 'rgba(255,240,190,' + (0.35 * br).toFixed(3) + ')'], [1, 'rgba(255,240,190,0)']]);
      ctx.beginPath(); ctx.moveTo(L.beam[0], L.beam[1]); ctx.lineTo(L.beam[0] + Math.sin(a) * w * 0.5, L.beam[1] - 10 * s); ctx.lineTo(L.beam[0] + Math.sin(a) * w * 0.5, L.beam[1] + 10 * s); ctx.closePath(); ctx.fill(); softGlow(ctx, L.beam[0], L.beam[1], 10 * s, '#fff0b0', 0.4 + 0.4 * br); ctx.restore(); }
    ctx.strokeStyle = 'rgba(40,50,60,0.85)'; ctx.lineWidth = 1.1 * s; ctx.lineCap = 'round';
    for (i = 0; i < 3; i++) { var g = t * 0.14 + i * 2.2, gx = w * 0.5 + Math.cos(g) * w * 0.32, gy = h * (0.18 + i * 0.04) + Math.sin(g * 1.3) * 8 * s; K.drawBird(ctx, gx, gy, (4 - i * 0.6) * s, t * 5 + i * 1.7); }
  }

  PAINT.calderbay = { focus: { x: 0.3, y: 0.12 }, track: 'night', anchors: { datacenter: { x: 0.78, y: 0.32 }, town: { x: 0.2, y: 0.32 }, lighthouse: { x: 0.46, y: 0.34 } },
    paint: function (ctx, w, h) { ctx.save(); try { paint(ctx, w, h); } catch (e) { PAINT._err = 'calderbay: ' + String(e && e.stack || e); } finally { ctx.restore(); } },
    overlay: function (ctx, w, h, t) { ctx.save(); try { overlay(ctx, w, h, t); } catch (e) { PAINT._err = 'calderbay overlay: ' + String(e && e.stack || e); } finally { ctx.restore(); } } };

  if (typeof LATE !== 'undefined') LATE.push(function () {
    if (typeof PROPS === 'undefined' || typeof PROPS_ART === 'undefined') return;
    var hit = function (vw, vh, shape) { return function () { return '<svg viewBox="0 0 ' + vw + ' ' + vh + '"><g class="pa-body pa-hit">' + shape + '</g></svg>'; }; };
    PROPS_ART.cb_dc = hit(100, 40, '<rect width="100" height="40" rx="8" fill="#fff"/>');
    PROPS_ART.cb_light = hit(30, 60, '<rect width="30" height="60" rx="8" fill="#fff"/>');
    PROPS.calderbay = [
      { id: 'cb_dc', x: 78, y: 37, w: 150, sfx: 'blip', fx: 'glow', who: 'byte', say: 'That building showed up last year. Its computers run so hot that the water around it steams. Nobody here knows who owns it.' },
      { id: 'cb_light', x: 46, y: 37, w: 24, sfx: 'chime', fx: 'glow', burst: 'sparkles', who: 'byte', say: 'The lighthouse still blinks every night, even though boats here steer with satellites now.' },
      { id: 'ep_gull', x: 20, y: 92, w: 44, sfx: 'flap', fx: 'flyaway' }
    ];
  });
})();
