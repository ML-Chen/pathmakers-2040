/* scenes/bay.js - the San Francisco Bay Area on a summer morning (the world map's preview of the Bay Area place).
   PAINT.bay. We stand on the golden summer grass of the Marin Headlands and look south across the Golden Gate. The
   bridge's two orange Art Deco towers and its great cables span the strait; the morning fog pours over the hills and
   under the deck; San Francisco's hills and towers sit beyond. On the far left shore rises Discovery Base, the Bay
   Area's 2040 science campus: an arcology of tall stepped towers with trees growing on every wide terrace, set in green
   hills by the water, with a train slipping out of a tunnel below it (docs/DESIGN_NOTES.md, "Three kinds of places").
   Sailboats and a ferry cross the blue water. In front: the grassy slope with coyote brush, orange poppies, a trail
   with old fence posts and a Monterey cypress. The interest is in the top half (the place card covers the bottom).
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
  var LINE = '#3a3036', ORANGE = ['#c8402e', '#a8301e', '#e0684a'];
  function ink(ctx, s, a, wd) { ctx.strokeStyle = rgba(LINE, a == null ? 0.5 : a); ctx.lineWidth = (wd || 0.7) * s; ctx.lineJoin = 'round'; ctx.stroke(); }
  var SKY = [[0, '#7eb0dc'], [0.55, '#b8d4ea'], [0.9, '#e8eee8'], [1, '#f4eedc']];

  var LM = null;
  function layout(w, h) {
    var key = w + 'x' + h; if (LM && LM.key === key) return LM;
    var s = S(w, h), L = { key: key, s: s, w: w, h: h };
    L.hz = h * 0.34; L.deck = h * 0.315; L.water1 = h * 0.47;
    L.t1 = { x: w * 0.3, top: h * 0.1 }; L.t2 = { x: w * 0.86, top: h * 0.14 };
    LM = L; return L;
  }

  function sky(ctx, L) {
    var w = L.w, h = L.h, s = L.s, r = rng(3101);
    ctx.fillStyle = lg(ctx, 0, 0, 0, L.hz, SKY); ctx.fillRect(0, 0, w, L.hz + 4 * s);
    skyStrokes(ctx, -20 * s, w + 20 * s, 0, L.hz, SKY, 140, r, s, 0.08, '#fff4e0', '#8ab8e0');
    softGlow(ctx, w * 0.8, h * 0.05, w * 0.6, '#fff8e4', 0.45);
    cloudForm(ctx, w * 0.62, h * 0.07, w * 0.32, h * 0.025, r, { lit: '#ffffff', mid: '#eef2f8', shade: '#c0cedf', al: 0.85, lx: 0.6, ly: -0.8, q: 0.5, seam: 0.06 });
  }

  function farShore(ctx, L) {
    var w = L.w, h = L.h, s = L.s, r = rng(3201), i, hz = L.hz;
    // San Francisco's hills and towers beyond the strait, pale with distance
    ridge(ctx, w * 0.35, w + 2, 2 * s, function (x) { var u = (x - w * 0.35) / (w * 0.65); return hz - h * (0.012 + 0.025 * fbm(u * 3 + 1, 3211, 4) + 0.02 * Math.exp(-Math.pow((u - 0.7) / 0.12, 2))); }, hz + 2 * s, '#9eb0c4');
    for (i = 0; i < 16; i++) { var bx = w * (0.5 + i * 0.028), bh = (6 + hash(i, 3) * 22 + (i > 5 && i < 10 ? 10 : 0)) * s, bw = (5 + hash(i, 4) * 6) * s; ctx.fillStyle = mix('#a8b8cc', '#e0e6ee', hash(i, 5) * 0.6); ctx.fillRect(bx, hz - h * 0.02 - bh, bw, bh + h * 0.02); }
    ctx.fillStyle = '#b8c4d2'; ctx.beginPath(); ctx.moveTo(w * 0.64, hz - h * 0.02 - 30 * s); ctx.lineTo(w * 0.655, hz - h * 0.02 - 54 * s); ctx.lineTo(w * 0.67, hz - h * 0.02 - 30 * s); ctx.fill();
    // Discovery Base on the far left: stepped towers with trees on every terrace, in green hills by the water
    ridge(ctx, -2, w * 0.5, 2 * s, function (x) { var u = x / (w * 0.5); return hz - h * (0.03 + 0.05 * Math.exp(-Math.pow((u - 0.2) / 0.3, 2)) + 0.012 * fbm(u * 5, 3221, 3)); }, hz + 2 * s, '#7a9a6e');
    var pal = ['#3e5e3e', '#4e7448', '#6a9058', '#8aac6a', '#aac88a'];
    [[0.06, 0.05, 0.62], [0.13, 0.055, 0.9], [0.2, 0.045, 0.7], [0.27, 0.04, 0.45]].forEach(function (T, j) {
      var tx = w * T[0], tw = w * T[1], th = h * 0.2 * T[2], base = hz - h * 0.01, steps = 5;
      for (var k = 0; k < steps; k++) { var sw = tw * (1 - k * 0.14), sy = base - th * (k + 1) / steps, sh = th / steps;
        ctx.fillStyle = lg(ctx, tx - sw / 2, 0, tx + sw / 2, 0, [[0, '#d8dce4'], [0.6, '#f4f4f2'], [1, '#c4c8d2']]); ctx.fillRect(tx - sw / 2, sy, sw, sh);
        ctx.fillStyle = 'rgba(90,120,160,0.45)'; ctx.fillRect(tx - sw / 2 + 1 * s, sy + sh * 0.3, sw - 2 * s, sh * 0.3);
        for (var q = 0; q < 4; q++) clump(ctx, tx - sw / 2 + sw * (q + 0.5) / 4, sy + 0.5 * s, (1.6 + hash(q + k * 4 + j * 20, 7) * 1.4) * s, pal, r, -0.7, -0.6, false, 0.6); }
    });
    // the train slipping out of a tunnel in the green hill
    var tny = hz - h * 0.006; ctx.fillStyle = '#3a4a3a'; ctx.beginPath(); ctx.arc(w * 0.34, tny, 4 * s, PI, TAU); ctx.fill();
    ctx.fillStyle = '#f2f4f6'; ctx.beginPath(); rrect(ctx, w * 0.345, tny - 3.2 * s, 26 * s, 3.2 * s, 1.4 * s); ctx.fill(); ctx.fillStyle = '#2a8aa8'; ctx.fillRect(w * 0.345, tny - 1.6 * s, 26 * s, 0.8 * s);
    haze(ctx, -w * 0.2, hz - h * 0.05, w * 1.2, hz + 2 * s, '#eef2f4', 0.3);
  }

  function waterFog(ctx, L) {
    var w = L.w, h = L.h, s = L.s, r = rng(3301), i, y1 = L.water1 + 6 * s;
    ctx.fillStyle = lg(ctx, 0, L.hz, 0, y1, [[0, '#7aa4c8'], [0.5, '#4a80b0'], [1, '#2e6496']]); ctx.fillRect(0, L.hz, w, y1 - L.hz);
    reflect(ctx, w, L.hz + 0.5 * s, L.hz + h * 0.05, 0.3, 1.6 * s, 0.9 / s, 4);
    batch(ctx, 420, [['#e6f2ff', 0.8 * s, 0.6], ['#1e4e80', 0.9 * s, 0.4]], function () { var p = Math.pow(r(), 1.3), yy = L.hz + 2 * s + p * (y1 - L.hz), xx = r() * w, l = (2 + p * 12) * s; return [xx, yy, xx + l, yy, r() < 0.55 ? 0 : 1]; });
    dots(ctx, 40, [['#ffffff', 0.7]], function () { return [r() * w, lerp(L.hz + h * 0.04, y1, r()), (0.6 + r()) * s, 0]; });
    [[0.5, 0.4, 7], [0.64, 0.42, 9], [0.12, 0.395, 5]].forEach(function (b) { ctx.save(); ctx.translate(w * b[0], h * b[1]); ctx.rotate(-0.1); boat(ctx, 0, 0, b[2] * s, '#ffffff', '#2a3a5a', '#e8eef6'); ctx.restore(); });
    // the low fog bank flowing in under the bridge and over the hills
    for (i = 0; i < 6; i++) haze(ctx, w * (-0.3 + i * 0.25), L.deck - h * 0.004, w * (0.2 + i * 0.25), L.deck + h * (0.035 + hash(i, 3) * 0.015), '#ffffff', 0.55);
    haze(ctx, -w * 0.1, L.hz - h * 0.03, w * 0.55, L.hz + h * 0.005, '#ffffff', 0.35);
  }

  function tower(ctx, L, T, s) {
    var x = T.x, top = T.top, foot = L.hz + 3 * s, lw = 5 * s, gap = 9 * s, i;
    ctx.fillStyle = 'rgba(40,60,90,0.25)'; ctx.fillRect(x - gap - lw, foot, gap * 2 + lw * 2, 3 * s);
    [-1, 1].forEach(function (sd) { var lx = x + sd * gap; ctx.fillStyle = lg(ctx, lx - lw / 2, 0, lx + lw / 2, 0, [[0, ORANGE[1]], [0.5, ORANGE[0]], [1, ORANGE[2]]]); ctx.beginPath(); ctx.moveTo(lx - lw / 2, foot); ctx.lineTo(lx - lw * 0.38, top); ctx.lineTo(lx + lw * 0.38, top); ctx.lineTo(lx + lw / 2, foot); ctx.closePath(); ctx.fill(); ink(ctx, s, 0.35);
      for (i = 1; i < 5; i++) { var yy = lerp(top, foot, i / 5.5); ctx.fillStyle = 'rgba(80,20,10,0.4)'; ctx.fillRect(lx - lw * 0.3, yy, lw * 0.6, 0.8 * s); } });
    // Art Deco portal beams between the legs
    [0.02, 0.26, 0.5, 0.74].forEach(function (u) { var yy = lerp(top, L.deck, u), bh = (u ? 4 : 6) * s; ctx.fillStyle = ORANGE[0]; ctx.fillRect(x - gap, yy, gap * 2, bh); ctx.fillStyle = 'rgba(80,20,10,0.35)'; ctx.fillRect(x - gap, yy + bh - 1 * s, gap * 2, 1 * s);
      ctx.fillStyle = 'rgba(255,220,200,0.35)'; ctx.fillRect(x - gap + 2 * s, yy + 1 * s, gap * 2 - 4 * s, 0.8 * s); });
  }

  function bridge(ctx, L) {
    var w = L.w, h = L.h, s = L.s, t1 = L.t1, t2 = L.t2, i, dk = L.deck;
    // the deck: an orange truss with the roadway on top
    ctx.fillStyle = ORANGE[1]; ctx.fillRect(-4, dk, w + 8, 4 * s); ctx.fillStyle = ORANGE[0]; ctx.fillRect(-4, dk - 1.6 * s, w + 8, 1.8 * s);
    ctx.strokeStyle = 'rgba(90,24,14,0.6)'; ctx.lineWidth = 0.5 * s; ctx.beginPath(); for (var x = -4; x < w + 4; x += 4 * s) { ctx.moveTo(x, dk + 0.2 * s); ctx.lineTo(x + 2 * s, dk + 4 * s); ctx.lineTo(x + 4 * s, dk + 0.2 * s); } ctx.stroke();
    // main cable (catenary between the towers) and the side spans, with suspender ropes
    function cable(x0, y0, x1, y1, sag) { var pts = []; for (var k = 0; k <= 40; k++) { var t = k / 40, xx = lerp(x0, x1, t), yy = lerp(y0, y1, t) + sag * 4 * t * (1 - t); pts.push([xx, yy]); } return pts; }
    var spans = [cable(t1.x, t1.top + 2 * s, t2.x, t2.top + 2 * s, (dk - 4 * s) - lerp(t1.top, t2.top, 0.5)), cable(-w * 0.3, dk - 2 * s, t1.x, t1.top + 2 * s, -h * 0.02), cable(t2.x, t2.top + 2 * s, w * 1.3, dk - 4 * s, h * 0.01)];
    spans.forEach(function (P) {
      ctx.strokeStyle = ORANGE[1]; ctx.lineWidth = 0.5 * s; ctx.beginPath(); for (i = 0; i < P.length; i += 1) { if (P[i][1] > dk - 2 * s) continue; ctx.moveTo(P[i][0], P[i][1]); ctx.lineTo(P[i][0], dk - 1.6 * s); } ctx.stroke();
      ctx.strokeStyle = ORANGE[0]; ctx.lineWidth = 1.8 * s; ctx.beginPath(); P.forEach(function (p, j) { if (!j) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); }); ctx.stroke();
    });
    tower(ctx, L, t1, s); tower(ctx, L, t2, s);
    // little cars and a bus on the deck
    for (i = 0; i < 9; i++) { var cx = w * hash(i, 41), col = ['#f4f4f0', '#e8c840', '#4a8ac8', '#d84a3a'][i % 4]; ctx.fillStyle = col; ctx.fillRect(cx, dk - 3.4 * s, (i % 5 ? 3 : 7) * s, 1.8 * s); }
  }

  function headland(ctx, L) {
    var w = L.w, h = L.h, s = L.s, r = rng(3401), i, top = L.water1;
    // the near slope of golden summer grass in rolling folds, the cliff edge above the water
    function Y(x) { var u = x / w; return top - h * (0.04 * (1 - u) + 0.012 * fbm(u * 4, 3411, 3)); }
    ctx.fillStyle = lg(ctx, 0, top - h * 0.05, 0, h, [[0, '#e2c47a'], [0.3, '#cfa65e'], [1, '#a8844a']]); ridge(ctx, -2, w + 2, 2 * s, Y, h + 2, null); ctx.fill();
    ctx.save(); ridge(ctx, -2, w + 2, 2 * s, Y, h + 2, null); ctx.clip();
    ctx.fillStyle = '#9a8a6a'; ridge(ctx, -2, w + 2, 2 * s, function (x) { return Y(x) + 2 * s; }, Y(0) + 6 * s, null); ctx.fill();
    var folds = [[0.6, '#d6b46a', 0.9], [0.68, '#c89e58', 1.3], [0.78, '#d8b870', 0.7], [0.9, '#bf9450', 1.1]];
    folds.forEach(function (f, k) { ctx.fillStyle = f[1]; ridge(ctx, -2, w + 2, 3 * s, function (x) { var u = x / w; return h * f[0] - h * 0.03 * Math.sin(u * PI * f[2] + k * 1.7) - h * 0.012 * fbm(u * 3 + k, 3420 + k, 3); }, h + 2, null); ctx.fill(); });
    batch(ctx, 1400, [['#f2dc98', 0.7 * s, 0.6], ['#a8823e', 0.7 * s, 0.5], ['#8a9a4a', 0.7 * s, 0.4]], function (j) { var x = r() * w, y0 = Y(x), y = lerp(y0, h, Math.pow(r(), 1.1)), l = (2 + (y - y0) / h * 16) * s; return [x, y, x + (r() - 0.3) * l * 0.4, y - l, j % 3]; });
    // coyote brush in clusters along the folds
    var bush = ['#3e5a34', '#4e6e3e', '#6a884a', '#86a45a', '#a8c070'];
    for (i = 0; i < 22; i++) { var f = folds[i % folds.length], bx = w * hash(i, 51), by = h * f[0] - h * 0.02 + hash(i, 52) * h * 0.03, R = (5 + (by - top) / h * 36) * s; clump(ctx, bx, by, R, bush, r, 0.6, -0.7, false, 0.9); clump(ctx, bx + R * 0.8, by + R * 0.2, R * 0.7, bush, r, 0.6, -0.7, false, 0.9); }
    // the trail, with old fence posts and a wire
    ctx.strokeStyle = '#c8b07a'; ctx.lineWidth = 12 * s; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(w * 0.58, h); ctx.quadraticCurveTo(w * 0.42, h * 0.7, w * 0.7, Y(w * 0.7) + 10 * s); ctx.stroke(); ctx.strokeStyle = '#e4d2a0'; ctx.lineWidth = 7 * s; ctx.stroke();
    var posts = []; for (i = 0; i < 7; i++) { var t2 = i / 6, fx = lerp(w * 0.76, w * 0.34, t2), fy = lerp(Y(w * 0.76) + 12 * s, h * 0.95, t2 * t2), fh = (8 + t2 * 34) * s, fw = (1.6 + t2 * 4) * s; posts.push([fx, fy, fh]); ctx.fillStyle = '#6a5040'; ctx.fillRect(fx - fw / 2, fy - fh, fw, fh); ctx.fillStyle = 'rgba(255,240,210,0.35)'; ctx.fillRect(fx - fw / 2, fy - fh, fw * 0.3, fh); }
    ctx.strokeStyle = 'rgba(70,60,50,0.6)'; ctx.lineWidth = 0.7 * s; [0.35, 0.7].forEach(function (v) { ctx.beginPath(); posts.forEach(function (p, j) { var y = p[1] - p[2] * v; if (!j) ctx.moveTo(p[0], y); else ctx.lineTo(p[0], y); }); ctx.stroke(); });
    // patches of orange poppies and purple lupine
    for (i = 0; i < 12; i++) { var px = w * hash(i, 61), py = lerp(top + h * 0.06, h * 0.95, hash(i, 62)), pr = (10 + (py - top) / h * 60) * s, kk = (py - top) / h;
      dots(ctx, 26, [['#f08a20', 0.95], ['#f8b030', 0.9]], function (j) { var a = r() * TAU, d = pr * Math.sqrt(r()); return [px + Math.cos(a) * d, py + Math.sin(a) * d * 0.4, (0.9 + kk * 4) * s, j % 2]; });
      if (i % 3 === 0) batch(ctx, 12, [['#8a6ad0', (1 + kk * 2.4) * s, 0.9]], function () { var x = px + (r() - 0.5) * pr * 1.6, y = py + (r() - 0.5) * pr * 0.3; return [x, y, x, y - (4 + kk * 14) * s, 0]; }); }
    ctx.restore();
    // a coin telescope at the overlook by the cliff edge
    var tx = w * 0.8, tyb = Y(w * 0.8) + 16 * s; ctx.fillStyle = 'rgba(40,30,20,0.3)'; ctx.beginPath(); qell(ctx, tx, tyb, 9 * s, 2 * s, 0); ctx.fill();
    ctx.fillStyle = '#3a5a7a'; ctx.fillRect(tx - 1.6 * s, tyb - 22 * s, 3.2 * s, 22 * s); ctx.beginPath(); rrect(ctx, tx - 7 * s, tyb - 30 * s, 14 * s, 9 * s, 3 * s); ctx.fill(); ink(ctx, s, 0.5);
    ctx.fillStyle = '#2a3a4a'; ctx.beginPath(); rrect(ctx, tx - 10 * s, tyb - 29 * s, 4 * s, 6 * s, 1.4 * s); ctx.fill(); ctx.fillStyle = '#9ad0f0'; ctx.beginPath(); ctx.arc(tx + 6.6 * s, tyb - 25.5 * s, 2.2 * s, 0, TAU); ctx.fill();
    // a wind-bent Monterey cypress at the bottom left, leaning away from the sea
    var cx = w * 0.03, cb = h * 0.98; ctx.fillStyle = '#4a3a2e'; K.trunkPath(ctx, cx, cb, cx + w * 0.16, h * 0.66, 16 * s, 6 * s, w * 0.05); ctx.fill(); ink(ctx, s, 0.4);
    K.trunkPath(ctx, cx + w * 0.08, h * 0.8, cx + w * 0.3, h * 0.66, 7 * s, 3 * s, -w * 0.02); ctx.fill();
    var pal = ['#1e3a2a', '#2a4a34', '#3a5e40', '#4e7650', '#6a9068'];
    [[0.0, 0.62, 30], [0.12, 0.6, 34], [0.24, 0.62, 28], [0.33, 0.645, 20], [0.06, 0.66, 26], [0.2, 0.66, 24]].forEach(function (c) { var px2 = w * c[0], py2 = h * c[1], R2 = c[2] * s; clump(ctx, px2, py2, R2, pal, r, 0.6, -0.7, false, 1); clump(ctx, px2 + R2 * 0.7, py2 + R2 * 0.05, R2 * 0.7, pal, r, 0.6, -0.7, false, 1); });
    ctx.fillStyle = lg(ctx, 0, h * 0.8, 0, h, [[0, 'rgba(40,30,20,0)'], [1, 'rgba(40,30,20,0.25)']]); ctx.fillRect(0, h * 0.8, w, h * 0.2);
  }

  function paint(ctx, w, h) {
    if (!bind()) return;
    var L = layout(w, h);
    sky(ctx, L); farShore(ctx, L); waterFog(ctx, L); bridge(ctx, L); headland(ctx, L);
    finish(ctx, w, h, '#ffc890', 0.1, 0.18, 0.035, '#14202e', 0.42);
  }
  function overlay(ctx, w, h, t) {
    if (!bind()) return;
    var L = layout(w, h), s = L.s, i;
    // fog drifting slowly under the deck, a ferry crossing, cars on the bridge, gulls
    var ws = wispSpr('#ffffff');
    if (ws) { ctx.save(); for (i = 0; i < 5; i++) { var per = 40 + i * 7, q = ((t + i * 11) % per) / per, fx = lerp(-w * 0.6, w * 1.1, q), fy = L.deck - h * 0.005 + i * h * 0.008; ctx.globalAlpha = 0.45; ctx.drawImage(ws, fx, fy - h * 0.02, w * 0.55, h * 0.04); } ctx.restore(); }
    var fq = (t % 50) / 50, fx2 = lerp(w + 30 * s, -30 * s, fq), fy2 = L.hz + h * 0.09;
    ctx.fillStyle = '#f7f8fb'; ctx.beginPath(); ctx.moveTo(fx2 - 14 * s, fy2 - 3 * s); ctx.lineTo(fx2 + 14 * s, fy2 - 3 * s); ctx.lineTo(fx2 + 12 * s, fy2); ctx.lineTo(fx2 - 12 * s, fy2); ctx.fill(); ctx.fillStyle = '#e9edf5'; ctx.fillRect(fx2 - 8 * s, fy2 - 6.4 * s, 14 * s, 3.4 * s); ctx.fillStyle = '#16b3a6'; ctx.fillRect(fx2 - 14 * s, fy2 - 1.4 * s, 28 * s, 0.8 * s);
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 0.8 * s; ctx.beginPath(); ctx.moveTo(fx2 + 13 * s, fy2); ctx.lineTo(fx2 + 34 * s, fy2 + 1.4 * s); ctx.stroke();
    for (i = 0; i < 6; i++) { var cq = ((t * (0.04 + hash(i, 2) * 0.03) + hash(i, 3)) % 1), cx = i % 2 ? lerp(-10 * s, w + 10 * s, cq) : lerp(w + 10 * s, -10 * s, cq); ctx.fillStyle = ['#f4f4f0', '#e8c840', '#4a8ac8'][i % 3]; ctx.fillRect(cx, L.deck - 3.4 * s, 3 * s, 1.8 * s); }
    ctx.strokeStyle = 'rgba(50,60,80,0.85)'; ctx.lineWidth = 1.1 * s; ctx.lineCap = 'round';
    for (i = 0; i < 3; i++) { var a = t * 0.16 + i * 2.1, gx = w * 0.55 + Math.cos(a) * w * 0.3, gy = h * (0.2 + i * 0.04) + Math.sin(a * 1.3) * 8 * s; K.drawBird(ctx, gx, gy, (4 - i * 0.6) * s, t * 5 + i * 1.7); }
    ctx.fillStyle = '#ffffff'; for (i = 0; i < 12; i++) { var wx = hash(i, 31) * w, wy = L.hz + 4 * s + hash(i, 32) * (L.water1 - L.hz - 8 * s), tw = Math.pow(Math.max(0, Math.sin(t * (1.6 + hash(i, 33) * 2) + i * 4)), 6); if (tw < 0.05) continue; ctx.globalAlpha = tw; ctx.fillRect(wx - 3 * s, wy, 6 * s, 0.8 * s); }
    ctx.globalAlpha = 1;
  }

  PAINT.bay = { focus: { x: 0.8, y: 0.05 }, track: 'morning', anchors: { bridge: { x: 0.58, y: 0.25 }, base: { x: 0.15, y: 0.26 }, city: { x: 0.65, y: 0.31 } },
    paint: function (ctx, w, h) { ctx.save(); try { paint(ctx, w, h); } catch (e) { PAINT._err = 'bay: ' + String(e && e.stack || e); } finally { ctx.restore(); } },
    overlay: function (ctx, w, h, t) { ctx.save(); try { overlay(ctx, w, h, t); } catch (e) { PAINT._err = 'bay overlay: ' + String(e && e.stack || e); } finally { ctx.restore(); } } };

  if (typeof LATE !== 'undefined') LATE.push(function () {
    if (typeof PROPS === 'undefined' || typeof PROPS_ART === 'undefined') return;
    var hit = function (vw, vh, shape) { return function () { return '<svg viewBox="0 0 ' + vw + ' ' + vh + '"><g class="pa-body pa-hit">' + shape + '</g></svg>'; }; };
    PROPS_ART.bay_bridge = hit(100, 100, '<rect width="100" height="100" rx="20" fill="#fff"/>');
    PROPS_ART.bay_base = hit(100, 70, '<rect width="100" height="70" rx="16" fill="#fff"/>');
    PROPS.bay = [
      { id: 'bay_bridge', x: 30, y: 33, w: 60, sfx: 'chime', fx: 'glow', who: 'byte', say: 'The Golden Gate Bridge opened in 1937. Its color is called International Orange, so ships can see it in the fog.' },
      { id: 'bay_base', x: 15, y: 34, w: 90, sfx: 'blip', fx: 'glow', burst: 'sparkles', who: 'byte', say: 'That’s Discovery Base, where scientists and AIs run experiments together. In this 2040, trees grow on every terrace.' },
      { id: 'tree', x: 88, y: 90, w: 70, sfx: 'rustle', fx: 'wiggle', burst: 'leaves' },
      { id: 'pigeon', x: 30, y: 92, w: 40, sfx: 'flap', fx: 'flyaway' }
    ];
  });
})();
