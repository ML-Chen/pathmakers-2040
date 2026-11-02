/* scenes/phx_studio.js - the Community Architect's studio in Phoenix (lot.js, "The Flood Lot").
   PAINT.phx_studio: 6:40 on a summer morning. The studio is a converted 1960s block building on the first floor above
   the city's robot crew depot. A wide steel-framed window looks down on Crew 7's yard: a long solar canopy with the
   crew parked and charging under it (a digger, a concrete-printing gantry, a hauler and a little walking survey robot),
   stacks of pipe and pavers and a gravel pile behind a chain-link fence. Beyond: low Phoenix rooftops and fan palms,
   the red humps of the Papago Buttes, the mountains, and far off on the horizon the Build Yard, the robot Special
   Economic Zone: a terraced strip mine, factory halls with sawtooth roofs, white domes, one tall tower and solar fields,
   in pale desert light. Inside: a pin-up wall with drawings and a site photo, a wide-brim sun hat on a peg, a long desk
   with a white foam model of the flood lot, rolled plans, a barrel cactus, a water bottle and a drafting lamp, and a
   polished concrete floor with a woven rug. The lower third is calm.
   PAINT.phx_dusk: the same studio at 9:20 PM. The sky has gone deep blue with a last purple band in the west, stars and
   a moon; city lights twinkle; the Build Yard glows amber on the horizon with a red beacon on its tower; flood lights
   are on in the yard as Crew 7 gets ready to roll out at 10; inside, only the drafting lamp is lit.
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
  var LINE = '#3e3430';
  function ink(ctx, s, a, wd) { ctx.strokeStyle = rgba(LINE, a == null ? 0.5 : a); ctx.lineWidth = (wd || 0.7) * s; ctx.lineJoin = 'round'; ctx.stroke(); }
  var PAL = {
    day: { sky: [[0, '#a6c8de'], [0.5, '#d6e2dc'], [0.85, '#f4e6c8'], [1, '#f8deb4']], mtn: ['#b0a4b4', '#c8b8bc'], butte: ['#b8664a', '#d4845c', '#8a4a3a'], city: ['#e8dcc8', '#d4c4ac', '#c4a888'],
      yard: ['#d4c09c', '#c4ac86'], wall: ['#efe4d2', '#e2d4bc'], floor: ['#c8beb2', '#b0a698', '#9a9084'], desk: ['#c8925e', '#9a6a40'], night: false },
    night: { sky: [[0, '#0e1430'], [0.55, '#1e2450'], [0.85, '#3e2e5e'], [1, '#6a3e6a']], mtn: ['#2a2848', '#34305a'], butte: ['#3a2a44', '#4a3450', '#2a1e34'], city: ['#2e2c48', '#26243e', '#3a3654'],
      yard: ['#3a3848', '#302e3e'], wall: ['#4a4252', '#3e3848'], floor: ['#3a3440', '#302a36', '#28222e'], desk: ['#6a4a3a', '#4a3228'], night: true }
  };

  var LM = {};
  function layout(w, h) {
    var key = w + 'x' + h; if (LM[key]) return LM[key];
    var s = S(w, h), L = { key: key, s: s, w: w, h: h };
    L.ceil = h * 0.055; L.wx0 = w * 0.17; L.wx1 = w * 0.975; L.wy0 = h * 0.07; L.wy1 = h * 0.45; L.tr = h * 0.165;
    L.hz = h * 0.3; L.city = h * 0.335; L.yard = h * 0.45;
    L.deskB = h * 0.492; L.deskF = h * 0.518; L.deskBot = h * 0.6; L.floor = h * 0.6;
    L.lamp = { x: w * 0.86, y: L.deskB - 2 * s };
    LM[key] = L; return L;
  }

  /* ---------------- the view through the window ---------------- */
  function view(ctx, L, P) {
    var w = L.w, h = L.h, s = L.s, r = rng(7101), i, x0 = L.wx0 - 4 * s, x1 = L.wx1 + 4 * s, n = P.night;
    ctx.save(); ctx.beginPath(); ctx.rect(x0, L.wy0 - 4 * s, x1 - x0, L.wy1 - L.wy0 + 8 * s); ctx.clip();
    ctx.fillStyle = lg(ctx, 0, L.wy0, 0, L.hz, P.sky); ctx.fillRect(x0, L.wy0 - 4 * s, x1 - x0, L.hz - L.wy0 + 6 * s);
    if (!n) {
      skyStrokes(ctx, x0, x1, L.wy0, L.hz, P.sky, 90, r, s, 0.08, '#fff2d8', '#a8c8d8');
      softGlow(ctx, w * 0.93, h * 0.12, w * 0.6, '#fff4d8', 0.5); softGlow(ctx, w * 0.93, h * 0.12, 18 * s, '#ffffff', 0.9);
      cloudForm(ctx, w * 0.45, h * 0.12, w * 0.3, h * 0.022, r, { lit: '#fffaf0', mid: '#f0e8dc', shade: '#c8ccd4', al: 0.8, lx: 0.9, ly: -0.4, q: 0.5, seam: 0.06 });
    } else {
      dots(ctx, 120, [['#ffffff', 0.8], ['#cfd8ff', 0.5]], function () { return [lerp(x0, x1, r()), lerp(L.wy0, L.hz - 20 * s, Math.pow(r(), 1.4)), (0.35 + Math.pow(r(), 4)) * s, r() < 0.6 ? 0 : 1]; });
      var mx = w * 0.32, my = h * 0.12; softGlow(ctx, mx, my, 40 * s, '#e8ecff', 0.25); ctx.fillStyle = '#f4f2e4'; ctx.beginPath(); ctx.arc(mx, my, 7 * s, 0, TAU); ctx.fill(); ctx.fillStyle = P.sky[1][1]; ctx.beginPath(); ctx.arc(mx + 3 * s, my - 1.5 * s, 6.2 * s, 0, TAU); ctx.fill();
      softGlow(ctx, w * 0.1, L.hz, w * 0.6, '#c86a8a', 0.25);
    }
    // the valley floor between the horizon and the near rooftops: hazy city, trees and streets
    ctx.fillStyle = lg(ctx, 0, L.hz, 0, L.city, n ? [[0, '#2a2644'], [1, '#24223a']] : [[0, '#e2d2b8'], [1, '#d2bea0']]); ctx.fillRect(x0, L.hz, x1 - x0, L.city - L.hz + 2 * s);
    for (i = 0; i < 60; i++) { var fx0 = lerp(x0, x1, r()), fy0 = lerp(L.hz + 2 * s, L.city - 2 * s, Math.pow(r(), 0.7)), fk = (fy0 - L.hz) / (L.city - L.hz), fw = (4 + r() * 8) * s * (0.5 + fk), fh = (1.5 + r() * 3) * s * (0.5 + fk);
      ctx.fillStyle = n ? (r() < 0.5 ? '#34304e' : '#2c2a44') : (r() < 0.45 ? '#ece0cc' : r() < 0.7 ? '#c8b494' : '#a8a07a'); ctx.fillRect(fx0, fy0 - fh, fw, fh); }
    dabs(ctx, 140, [[n ? '#22243a' : '#8a9a6a', 0.8], [n ? '#2a2c44' : '#a8b080', 0.7]], function (j) { var fy1 = lerp(L.hz + 2 * s, L.city, Math.pow(r(), 0.7)), fk1 = (fy1 - L.hz) / (L.city - L.hz); return [lerp(x0, x1, r()), fy1, (1.5 + r() * 2.5) * s * (0.5 + fk1), (1 + r() * 1.4) * s * (0.5 + fk1), j % 2, 0]; });
    if (n) dots(ctx, 160, [['#ffd27a', 0.85], ['#fff2c8', 0.75], ['#ff9a6a', 0.6]], function () { return [lerp(x0, x1, r()), lerp(L.hz + 2 * s, L.city, Math.pow(r(), 0.7)), (0.35 + r() * 0.45) * s, (r() * 3) | 0]; });
    // far mountains and the Build Yard on the horizon at the left
    ridge(ctx, x0, x1, 3 * s, function (x) { var u = x / w; return L.hz - h * (0.012 + 0.03 * fbm(u * 3 + 7, 7111, 4) + 0.02 * Math.exp(-Math.pow((u - 0.8) / 0.1, 2))); }, L.hz + 2 * s, P.mtn[0]);
    var BY = X.buildYard(ctx, x0, w * 0.6, L.hz + 1 * s, s, { night: n, H: 22 * s });
    L.beacon = BY.tower;
    haze(ctx, x0 - w * 0.2, L.hz - h * 0.03, x1 + w * 0.2, L.hz + h * 0.01, n ? '#3a2e5a' : '#f4ead8', n ? 0.3 : 0.4);
    // the red Papago Buttes, with a hole in one of them
    ctx.fillStyle = P.butte[0]; ctx.beginPath(); ctx.moveTo(w * 0.58, L.city); ctx.bezierCurveTo(w * 0.6, L.hz - h * 0.03, w * 0.66, L.hz - h * 0.035, w * 0.69, L.hz - h * 0.01); ctx.bezierCurveTo(w * 0.72, L.hz - h * 0.03, w * 0.77, L.hz - h * 0.025, w * 0.79, L.city); ctx.fill();
    if (!n) { ctx.fillStyle = P.butte[1]; ctx.beginPath(); ctx.moveTo(w * 0.69, L.hz - h * 0.01); ctx.bezierCurveTo(w * 0.72, L.hz - h * 0.03, w * 0.77, L.hz - h * 0.025, w * 0.79, L.city); ctx.lineTo(w * 0.73, L.city); ctx.fill(); }
    ctx.fillStyle = n ? P.sky[2][1] : '#e8d8c0'; ctx.beginPath(); qell(ctx, w * 0.62, L.hz - h * 0.012, 2.4 * s, 1.8 * s, 0); ctx.fill();
    // the low city: rooftops, a few taller blocks downtown, palms
    for (i = 0; i < 26; i++) { var bx = lerp(x0, x1, i / 25) + (r() - 0.5) * 10 * s, bw = (10 + r() * 14) * s, bh = (3 + r() * 5 + (i > 6 && i < 11 ? 14 : 0) * r()) * s;
      ctx.fillStyle = P.city[(i * 7) % 3]; ctx.fillRect(bx, L.city - bh, bw, bh + h * 0.01); if (n) dots(ctx, 4, [['#ffd27a', 0.9], ['#fff2c8', 0.8]], function () { return [bx + r() * bw, L.city - r() * bh, 0.6 * s, r() < 0.7 ? 0 : 1]; }); }
    [[0.24, 0.06], [0.3, 0.075], [0.48, 0.065], [0.88, 0.07], [0.93, 0.055]].forEach(function (p, j) { X.fanPalm(ctx, w * p[0], L.city + 2 * s, h * p[1], s, 7130 + j, { far: true, crown: h * p[1] * 0.16, lean: (j % 2 ? 2 : -2) * s, pal: n ? ['#1e2238', '#262a44', '#2e3250'] : undefined, trunk: n ? '#2a2a40' : undefined, skirt: n ? '#2e2c42' : undefined }); });
    if (n) { K.dots(ctx, 90, [['#ffd27a', 0.9], ['#fff0c8', 0.8], ['#ff9a6a', 0.7]], function () { return [lerp(x0, x1, r()), L.city - r() * h * 0.012, (0.4 + r() * 0.5) * s, (r() * 3) | 0]; }); }
    // the crew yard: gravel ground, fence, material stacks, the solar canopy and Crew 7
    ctx.fillStyle = lg(ctx, 0, L.city, 0, L.yard, [[0, P.yard[1]], [1, P.yard[0]]]); ctx.fillRect(x0, L.city, x1 - x0, L.yard - L.city + 4 * s);
    dots(ctx, 300, [[n ? '#4a4858' : '#b09a78', 0.5], [n ? '#26242e' : '#e8dcc4', 0.5]], function (j) { return [lerp(x0, x1, r()), lerp(L.city + 2 * s, L.yard, r()), (0.4 + r() * 0.6) * s, j % 2]; });
    ctx.strokeStyle = n ? 'rgba(120,120,150,0.5)' : 'rgba(120,120,130,0.5)'; ctx.lineWidth = 0.5 * s; ctx.beginPath();
    var fy = L.city + h * 0.008, fh = h * 0.016; for (var fx = x0; fx < x1; fx += 3 * s) { ctx.moveTo(fx, fy); ctx.lineTo(fx + 3 * s, fy - fh); ctx.moveTo(fx + 3 * s, fy); ctx.lineTo(fx, fy - fh); } ctx.stroke();
    ctx.strokeStyle = n ? '#6a6a80' : '#8a8a92'; ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.moveTo(x0, fy - fh); ctx.lineTo(x1, fy - fh); for (fx = x0; fx < x1; fx += 24 * s) { ctx.moveTo(fx, fy); ctx.lineTo(fx, fy - fh); } ctx.stroke();
    // pipe stack and pavers on pallets, gravel pile
    var gy = L.city + h * 0.06;
    ctx.fillStyle = n ? '#4a4652' : '#a8916c'; ctx.beginPath(); ctx.moveTo(w * 0.2, gy); ctx.quadraticCurveTo(w * 0.27, gy - h * 0.04, w * 0.35, gy); ctx.fill(); ctx.beginPath(); ctx.moveTo(w * 0.2, gy); ctx.quadraticCurveTo(w * 0.27, gy - h * 0.04, w * 0.35, gy); ink(ctx, s, 0.35);
    for (i = 0; i < 9; i++) { var px = w * 0.37 + (i % 4) * 5.4 * s + ((i / 4) | 0) * 2.7 * s, py = gy - 2.7 * s - ((i / 4) | 0) * 4.6 * s; ctx.fillStyle = n ? '#5a5a70' : '#d8dce4'; ctx.beginPath(); ctx.arc(px, py, 2.6 * s, 0, TAU); ctx.fill(); ctx.fillStyle = n ? '#2a2a38' : '#7a8090'; ctx.beginPath(); ctx.arc(px, py, 1.5 * s, 0, TAU); ctx.fill(); }
    ctx.fillStyle = n ? '#4a4050' : '#b86a4a'; ctx.fillRect(w * 0.19, gy + h * 0.02, 22 * s, 9 * s); ctx.fillStyle = n ? '#3a3240' : '#9a8060'; ctx.fillRect(w * 0.19, gy + h * 0.02 + 9 * s, 22 * s, 2 * s);
    // the solar canopy, posts, a big 7 on its edge
    var cy0 = L.city + h * 0.022, cyB = cy0 + h * 0.012, cx0 = w * 0.43, cx1 = x1 + 4 * s, foot = L.yard - h * 0.012;
    ctx.fillStyle = n ? '#5a5a70' : '#9a9aa4'; [0.47, 0.64, 0.81, 0.97].forEach(function (u) { ctx.fillRect(w * u - 1.2 * s, cyB, 2.4 * s, foot - cyB); });
    ctx.fillStyle = n ? '#1a2040' : '#2e3e6a'; ctx.beginPath(); ctx.moveTo(cx0, cyB); ctx.lineTo(cx0 + 10 * s, cy0); ctx.lineTo(cx1, cy0); ctx.lineTo(cx1, cyB); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = n ? 'rgba(110,130,200,0.4)' : 'rgba(180,200,240,0.6)'; ctx.lineWidth = 0.5 * s; ctx.beginPath(); for (var gx = cx0 + 10 * s; gx < cx1; gx += 9 * s) { ctx.moveTo(gx, cy0); ctx.lineTo(gx - 10 * s, cyB); } ctx.stroke();
    ctx.fillStyle = n ? '#8a8aa0' : '#e8e4dc'; ctx.fillRect(cx0, cyB, cx1 - cx0, 4 * s); ctx.fillStyle = '#e8a020'; ctx.font = '800 ' + (7 * s).toFixed(1) + 'px Nunito, sans-serif'; ctx.textBaseline = 'middle'; ctx.fillText('7', cx0 + 6 * s, cyB + 2.2 * s);
    if (n) { var sp = glowSpr('#fff0c8'); if (sp) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; [0.52, 0.7, 0.88].forEach(function (u) { ctx.globalAlpha = 0.5; ctx.drawImage(sp, w * u - 40 * s, cyB - 4 * s, 80 * s, 60 * s); }); ctx.restore(); } }
    else { ctx.fillStyle = 'rgba(40,30,40,0.25)'; ctx.fillRect(cx0, cyB + 4 * s, cx1 - cx0, foot - cyB - 4 * s); }
    // Crew 7, charging: cables run from the posts
    var bots = [['walker', 0.5, 22], ['digger', 0.6, 30], ['printer', 0.76, 30], ['hauler', 0.9, 28]];
    bots.forEach(function (b, j) { var bx2 = w * b[1], by2 = foot + (j % 2) * 3 * s;
      ctx.strokeStyle = n ? '#7ff7e4' : '#2a2a34'; ctx.lineWidth = 0.6 * s; ctx.beginPath(); ctx.moveTo(w * [0.47, 0.64, 0.64, 0.81][j] + 1 * s, foot - h * 0.02); ctx.quadraticCurveTo(bx2 - 6 * s, by2 + 2 * s, bx2 - 3 * s, by2 - 6 * s); ctx.stroke();
      X.crewBot(ctx, bx2, by2, b[2] * s, b[0], s, { dir: j % 2 ? -1 : 1, body: n ? '#8a8a9e' : '#f2efe6', trim: n ? '#a88a3a' : '#f0b020', load: n ? '#4a4050' : undefined }); });
    if (!n) { ctx.fillStyle = 'rgba(255,240,210,0.08)'; ctx.fillRect(x0, L.wy0, x1 - x0, L.wy1 - L.wy0); }
    ctx.restore();
  }

  /* ---------------- the room ---------------- */
  function room(ctx, L, P) {
    var w = L.w, h = L.h, s = L.s, r = rng(7201), i, n = P.night;
    // walls, with the window cut out
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, L.floor + 2 * s); ctx.rect(L.wx0, L.wy0, L.wx1 - L.wx0, L.wy1 - L.wy0);
    ctx.fillStyle = lg(ctx, 0, 0, 0, L.floor, [[0, P.wall[1]], [0.5, P.wall[0]], [1, P.wall[1]]]); ctx.fill('evenodd'); ctx.clip('evenodd');
    dabs(ctx, 200, [[n ? '#5a5262' : '#fff6e4', 0.16], [n ? '#2e2838' : '#d8c4a4', 0.12]], function () { return [r() * w, r() * L.floor, (6 + r() * 18) * s, (3 + r() * 8) * s, r() < 0.5 ? 0 : 1, r() * PI]; });
    ctx.restore();
    // ceiling beams
    ctx.fillStyle = n ? '#2a2230' : '#7a5a40'; ctx.fillRect(0, 0, w, L.ceil); ctx.fillStyle = n ? '#3a3040' : '#9a7454';
    for (i = 0; i < 6; i++) ctx.fillRect(i * w / 5 - 6 * s, 0, 12 * s, L.ceil + 3 * s);
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(0, L.ceil, w, 2 * s);
    // the steel window frame: mullions, a transom and a deep sill
    var fc = n ? '#1e1e28' : '#3a3e48';
    ctx.fillStyle = fc; ctx.fillRect(L.wx0 - 5 * s, L.wy0 - 5 * s, L.wx1 - L.wx0 + 10 * s, 5 * s); ctx.fillRect(L.wx0 - 5 * s, L.wy0, 5 * s, L.wy1 - L.wy0); ctx.fillRect(L.wx1, L.wy0, 5 * s, L.wy1 - L.wy0);
    for (i = 1; i < 4; i++) ctx.fillRect(lerp(L.wx0, L.wx1, i / 4) - 1.6 * s, L.wy0, 3.2 * s, L.wy1 - L.wy0);
    ctx.fillRect(L.wx0, L.tr - 1.6 * s, L.wx1 - L.wx0, 3.2 * s);
    ctx.strokeStyle = fc; ctx.lineWidth = 1 * s; ctx.beginPath(); for (i = 0; i < 4; i++) { var mx = lerp(L.wx0, L.wx1, (i + 0.5) / 4); ctx.moveTo(mx, L.wy0); ctx.lineTo(mx, L.tr); } ctx.stroke();
    // reflections on the glass
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = n ? 'rgba(255,200,140,0.06)' : 'rgba(255,255,255,0.07)';
    for (i = 0; i < 3; i++) { var gx = lerp(L.wx0, L.wx1, 0.1 + i * 0.3); ctx.beginPath(); ctx.moveTo(gx, L.wy0); ctx.lineTo(gx + 18 * s, L.wy0); ctx.lineTo(gx - 10 * s, L.wy1); ctx.lineTo(gx - 28 * s, L.wy1); ctx.fill(); }
    if (n) softGlow(ctx, L.lamp.x - 20 * s, L.wy1 - h * 0.08, 40 * s, '#ffcf8a', 0.14);
    ctx.restore();
    ctx.fillStyle = n ? '#3a3440' : '#e8dcc6'; ctx.fillRect(L.wx0 - 10 * s, L.wy1, L.wx1 - L.wx0 + 20 * s, 6 * s); ctx.fillStyle = 'rgba(80,60,40,0.3)'; ctx.fillRect(L.wx0 - 10 * s, L.wy1 + 6 * s, L.wx1 - L.wx0 + 20 * s, 2 * s);
    // the pin-up wall at the left: cork board with drawings, a site photo, a monsoon chart; a hat on a peg
    var bx0 = w * 0.015, bx1 = w * 0.145, by0 = h * 0.1, by1 = h * 0.33;
    ctx.fillStyle = n ? '#5a4634' : '#c89a64'; ctx.fillRect(bx0, by0, bx1 - bx0, by1 - by0); ctx.beginPath(); ctx.rect(bx0, by0, bx1 - bx0, by1 - by0); ink(ctx, s, 0.5);
    var sheets = [[0.1, 0.12, 0.08, '#f8f4ea', 'plan'], [0.2, 0.17, 0.06, '#f4efe2', 'photo'], [0.3, 0.22, 0.07, '#f8f4ea', 'chart']];
    sheets.forEach(function (q, j) { var sx = bx0 + (bx1 - bx0) * (0.12 + (j % 2) * 0.12), sy = h * q[1], sw = (bx1 - bx0) * 0.72, sh = h * q[2];
      ctx.save(); ctx.translate(sx + sw / 2, sy + sh / 2); ctx.rotate((hash(j, 5) - 0.5) * 0.1); ctx.translate(-sw / 2, -sh / 2);
      ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(1.5 * s, 1.5 * s, sw, sh); ctx.fillStyle = n ? mix(q[3], '#4a4060', 0.55) : q[3]; ctx.fillRect(0, 0, sw, sh);
      if (q[4] === 'plan') { ctx.strokeStyle = n ? '#6a7aa0' : '#3a6ab0'; ctx.lineWidth = 0.7 * s; ctx.strokeRect(sw * 0.12, sh * 0.15, sw * 0.76, sh * 0.6); ctx.beginPath(); ctx.ellipse(sw * 0.45, sh * 0.45, sw * 0.2, sh * 0.16, 0, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.ellipse(sw * 0.45, sh * 0.45, sw * 0.1, sh * 0.08, 0, 0, TAU); ctx.stroke(); }
      else if (q[4] === 'photo') { ctx.fillStyle = n ? '#4a5070' : '#a8c8dc'; ctx.fillRect(sw * 0.08, sh * 0.1, sw * 0.84, sh * 0.45); ctx.fillStyle = n ? '#5a4a50' : '#d8b88c'; ctx.fillRect(sw * 0.08, sh * 0.55, sw * 0.84, sh * 0.35); ctx.fillStyle = n ? '#3a5040' : '#5a8a50'; ctx.fillRect(sw * 0.2, sh * 0.25, sw * 0.05, sh * 0.38); }
      else { ctx.fillStyle = n ? '#4a6a90' : '#4a8fc6'; for (var b = 0; b < 6; b++) { var bh2 = sh * (0.15 + 0.55 * [0.1, 0.15, 0.6, 0.9, 0.7, 0.2][b]); ctx.fillRect(sw * (0.1 + b * 0.14), sh * 0.85 - bh2, sw * 0.1, bh2); } }
      ctx.fillStyle = '#e0403a'; ctx.beginPath(); ctx.arc(sw / 2, 2 * s, 1.4 * s, 0, TAU); ctx.fill(); ctx.restore(); });
    // the sun hat
    var hx = w * 0.08, hy = h * 0.385; ctx.fillStyle = '#5a4a3a'; ctx.beginPath(); ctx.arc(hx, hy - 6 * s, 1.4 * s, 0, TAU); ctx.fill();
    ctx.fillStyle = n ? '#7a6a50' : '#e8c87a'; ctx.beginPath(); qell(ctx, hx, hy + 3 * s, 20 * s, 5 * s, 0); ctx.fill(); ink(ctx, s, 0.45); ctx.beginPath(); ctx.moveTo(hx - 10 * s, hy + 3 * s); ctx.quadraticCurveTo(hx - 10 * s, hy - 9 * s, hx, hy - 9 * s); ctx.quadraticCurveTo(hx + 10 * s, hy - 9 * s, hx + 10 * s, hy + 3 * s); ctx.fill(); ink(ctx, s, 0.45);
    ctx.fillStyle = n ? '#5a3a40' : '#c0504d'; ctx.fillRect(hx - 10 * s, hy - 1 * s, 20 * s, 2.6 * s);
  }

  function desk(ctx, L, P) {
    var w = L.w, h = L.h, s = L.s, r = rng(7301), i, n = P.night;
    // the long desk: top surface, front edge and cabinets
    ctx.fillStyle = lg(ctx, 0, L.deskB, 0, L.deskF, [[0, P.desk[0]], [1, mix(P.desk[0], P.desk[1], 0.4)]]); ctx.fillRect(0, L.deskB, w, L.deskF - L.deskB);
    batch(ctx, 50, [[P.desk[1], 0.7 * s, 0.4]], function () { var y = lerp(L.deskB, L.deskF, r()), x = r() * w; return [x, y, x + (14 + r() * 30) * s, y, 0]; });
    ctx.fillStyle = P.desk[1]; ctx.fillRect(0, L.deskF, w, 3 * s);
    ctx.fillStyle = lg(ctx, 0, L.deskF, 0, L.deskBot, [[0, n ? '#3a3444' : '#5a7a7a'], [1, n ? '#2a2632' : '#4a6a6a']]); ctx.fillRect(0, L.deskF + 3 * s, w, L.deskBot - L.deskF - 3 * s);
    for (i = 0; i < 5; i++) { var dx = w * (0.02 + i * 0.2), dw = w * 0.18; ctx.strokeStyle = 'rgba(20,30,30,0.4)'; ctx.lineWidth = 1 * s; ctx.strokeRect(dx, L.deskF + 7 * s, dw, L.deskBot - L.deskF - 12 * s); ctx.fillStyle = n ? '#8a7a5a' : '#e8c070'; ctx.fillRect(dx + dw / 2 - 6 * s, L.deskF + 12 * s, 12 * s, 2 * s); }
    // the white foam model of the flood lot: base, bowl, tiny trees, a saguaro
    var mx0 = w * 0.04, mx1 = w * 0.3, my = L.deskB + 8 * s, mh = 7 * s;
    ctx.fillStyle = 'rgba(40,24,20,0.25)'; ctx.beginPath(); qell(ctx, (mx0 + mx1) / 2, my + 2 * s, (mx1 - mx0) * 0.55, 4 * s, 0); ctx.fill();
    ctx.fillStyle = n ? '#8a8494' : '#f8f6f0'; ctx.beginPath(); ctx.moveTo(mx0, my); ctx.lineTo(mx0 + 8 * s, my - 14 * s); ctx.lineTo(mx1 - 4 * s, my - 14 * s); ctx.lineTo(mx1, my); ctx.closePath(); ctx.fill(); ink(ctx, s, 0.4);
    ctx.fillStyle = n ? '#6a6474' : '#dedad2'; ctx.fillRect(mx0, my, mx1 - mx0, mh * 0.6); ctx.beginPath(); ctx.rect(mx0, my, mx1 - mx0, mh * 0.6); ink(ctx, s, 0.4);
    ctx.fillStyle = n ? '#5a5464' : '#d8d4ca'; ctx.beginPath(); qell(ctx, (mx0 + mx1) / 2, my - 7 * s, (mx1 - mx0) * 0.24, 4.4 * s, 0); ctx.fill(); ctx.fillStyle = n ? '#4a4454' : '#c4beb2'; ctx.beginPath(); qell(ctx, (mx0 + mx1) / 2, my - 6.4 * s, (mx1 - mx0) * 0.14, 2.4 * s, 0); ctx.fill();
    [0.12, 0.22, 0.78, 0.88].forEach(function (u, j) { var tx = lerp(mx0, mx1, u), ty = my - 9 * s - (j % 2) * 2 * s; ctx.strokeStyle = n ? '#8a8494' : '#b8b2a6'; ctx.lineWidth = 0.6 * s; ctx.beginPath(); ctx.moveTo(tx, ty + 3 * s); ctx.lineTo(tx, ty); ctx.stroke(); ctx.fillStyle = n ? '#7a8a6a' : '#a8c890'; ctx.beginPath(); ctx.arc(tx, ty - 1.5 * s, 2.6 * s, 0, TAU); ctx.fill(); });
    ctx.strokeStyle = n ? '#5a7a5a' : '#5a9a5a'; ctx.lineWidth = 1.4 * s; ctx.lineCap = 'round'; ctx.beginPath(); var sgx = lerp(mx0, mx1, 0.62); ctx.moveTo(sgx, my - 6 * s); ctx.lineTo(sgx, my - 16 * s); ctx.moveTo(sgx, my - 10 * s); ctx.lineTo(sgx + 2.4 * s, my - 10 * s); ctx.lineTo(sgx + 2.4 * s, my - 13 * s); ctx.stroke();
    // rolled plans with rubber bands
    for (i = 0; i < 3; i++) { var rx = w * (0.36 + i * 0.012), ry = L.deskB + 5 * s - i * 3 * s, rl = 34 * s; ctx.save(); ctx.translate(rx, ry); ctx.rotate(-0.1 + i * 0.05); ctx.fillStyle = n ? ['#7a7a8a', '#6a7a9a', '#8a8070'][i] : ['#f4efe2', '#bcd8f0', '#f0e2c0'][i]; ctx.beginPath(); rrect(ctx, 0, -2.6 * s, rl, 5.2 * s, 2.6 * s); ctx.fill(); ink(ctx, s, 0.35); ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.beginPath(); ctx.arc(rl - 1 * s, 0, 2.4 * s, 0, TAU); ctx.fill(); ctx.fillStyle = '#e0403a'; ctx.fillRect(rl * 0.3, -2.6 * s, 1.2 * s, 5.2 * s); ctx.restore(); }
    // barrel cactus in a terracotta pot, a steel water bottle, a tablet showing Crew 7's map
    var cx = w * 0.7, cy = L.deskB + 6 * s; ctx.fillStyle = '#b8603a'; ctx.beginPath(); ctx.moveTo(cx - 8 * s, cy - 10 * s); ctx.lineTo(cx + 8 * s, cy - 10 * s); ctx.lineTo(cx + 6 * s, cy); ctx.lineTo(cx - 6 * s, cy); ctx.closePath(); ctx.fill(); ink(ctx, s, 0.45);
    ctx.fillStyle = n ? '#3a5a44' : '#5a9a5a'; ctx.beginPath(); qell(ctx, cx, cy - 15 * s, 8 * s, 7 * s, 0); ctx.fill(); ink(ctx, s, 0.45);
    ctx.strokeStyle = n ? '#2a4434' : '#3e7a44'; ctx.lineWidth = 0.6 * s; ctx.beginPath(); for (i = -2; i <= 2; i++) { ctx.moveTo(cx + i * 3 * s, cy - 21 * s); ctx.quadraticCurveTo(cx + i * 4 * s, cy - 15 * s, cx + i * 3 * s, cy - 9 * s); } ctx.stroke();
    ctx.fillStyle = n ? '#c8a03a' : '#f2c832'; ctx.beginPath(); ctx.arc(cx, cy - 21.5 * s, 2 * s, 0, TAU); ctx.fill();
    var bx = w * 0.62; ctx.fillStyle = n ? '#7a4a4a' : '#e86a5a'; ctx.beginPath(); rrect(ctx, bx - 3.6 * s, cy - 20 * s, 7.2 * s, 20 * s, 2.4 * s); ctx.fill(); ink(ctx, s, 0.45); ctx.fillStyle = '#d8dce6'; ctx.fillRect(bx - 2.8 * s, cy - 24 * s, 5.6 * s, 4 * s);
    ctx.save(); ctx.translate(w * 0.5, L.deskB + 9 * s); ctx.transform(1, 0, -0.5, 0.4, 0, 0); ctx.fillStyle = '#2a2a3a'; ctx.beginPath(); rrect(ctx, -16 * s, -24 * s, 32 * s, 22 * s, 2 * s); ctx.fill(); ctx.fillStyle = n ? '#2a5a6a' : '#bfe8ff'; ctx.fillRect(-14 * s, -22 * s, 28 * s, 18 * s); ctx.restore();
    // the drafting lamp
    var lx = L.lamp.x, ly = L.lamp.y + 8 * s; ctx.strokeStyle = n ? '#5a5a6a' : '#3a3e48'; ctx.lineWidth = 2 * s; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(lx + 10 * s, ly); ctx.lineTo(lx + 4 * s, ly - 30 * s); ctx.lineTo(lx - 14 * s, ly - 44 * s); ctx.stroke();
    ctx.fillStyle = n ? '#4a4a5a' : '#3a3e48'; ctx.beginPath(); qell(ctx, lx + 10 * s, ly, 9 * s, 2.4 * s, 0); ctx.fill();
    ctx.fillStyle = n ? '#e8b040' : '#f0b020'; ctx.beginPath(); ctx.moveTo(lx - 22 * s, ly - 38 * s); ctx.lineTo(lx - 8 * s, ly - 48 * s); ctx.lineTo(lx - 2 * s, ly - 38 * s); ctx.lineTo(lx - 14 * s, ly - 30 * s); ctx.closePath(); ctx.fill(); ink(ctx, s, 0.5);
    L.bulb = [lx - 14 * s, ly - 32 * s];
    if (n) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = lg(ctx, 0, ly - 34 * s, 0, ly + 4 * s, [[0, 'rgba(255,210,140,0.35)'], [1, 'rgba(255,210,140,0.05)']]); ctx.beginPath(); ctx.moveTo(lx - 18 * s, ly - 34 * s); ctx.lineTo(lx - 10 * s, ly - 36 * s); ctx.lineTo(lx + 16 * s, ly + 2 * s); ctx.lineTo(lx - 46 * s, ly + 2 * s); ctx.closePath(); ctx.fill();
      softGlow(ctx, lx - 14 * s, ly - 6 * s, 70 * s, '#ffc878', 0.22); ctx.restore(); }
  }

  function floor(ctx, L, P) {
    var w = L.w, h = L.h, s = L.s, r = rng(7401), i, n = P.night, vx = w * 0.5, vy = h * 0.42;
    ctx.fillStyle = lg(ctx, 0, L.floor, 0, h, [[0, P.floor[0]], [0.5, P.floor[1]], [1, P.floor[2]]]); ctx.fillRect(0, L.floor, w, h - L.floor);
    dabs(ctx, 160, [[n ? '#4a4452' : '#d8d0c4', 0.25], [n ? '#221e28' : '#9a9084', 0.18]], function () { return [r() * w, lerp(L.floor, h, r()), (10 + r() * 30) * s, (2 + r() * 4) * s, r() < 0.5 ? 0 : 1, 0]; });
    ctx.strokeStyle = n ? 'rgba(20,16,24,0.4)' : 'rgba(110,100,90,0.35)'; ctx.lineWidth = 0.8 * s; ctx.beginPath(); for (i = -3; i <= 3; i++) { var bx = vx + i * w * 0.45; ctx.moveTo(vx + (bx - vx) * (L.floor - vy) / (h - vy), L.floor); ctx.lineTo(bx, h); } ctx.moveTo(0, h * 0.78); ctx.lineTo(w, h * 0.78); ctx.stroke();
    ctx.fillStyle = 'rgba(30,20,20,0.3)'; ctx.fillRect(0, L.floor, w, 4 * s);
    // the window's reflection on the polished floor
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = lg(ctx, 0, L.floor, 0, h * 0.85, [[0, n ? 'rgba(120,120,200,0.06)' : 'rgba(255,240,210,0.16)'], [1, 'rgba(255,240,210,0)']]);
    ctx.beginPath(); ctx.moveTo(L.wx0, L.floor + 4 * s); ctx.lineTo(L.wx1, L.floor + 4 * s); ctx.lineTo(L.wx1 + w * 0.1, h * 0.85); ctx.lineTo(L.wx0 - w * 0.1, h * 0.85); ctx.closePath(); ctx.fill();
    if (n) softGlow(ctx, L.lamp.x, h * 0.72, w * 0.35, '#ffc878', 0.08);
    ctx.restore();
    // a woven rug with stripes
    var ry = h * 0.82, rw = w * 0.42, rh = h * 0.07;
    ctx.save(); ctx.beginPath(); ctx.moveTo(w * 0.5 - rw * 0.85, ry - rh); ctx.lineTo(w * 0.5 + rw * 0.85, ry - rh); ctx.lineTo(w * 0.5 + rw, ry + rh); ctx.lineTo(w * 0.5 - rw, ry + rh); ctx.closePath();
    ctx.fillStyle = n ? '#5a3a3a' : '#c8603a'; ctx.fill(); ctx.clip();
    var cols = n ? ['#3a3040', '#6a5a4a', '#2a2a3e'] : ['#f2e2c0', '#2a8a8a', '#e8a838'];
    for (i = 0; i < 7; i++) { ctx.fillStyle = cols[i % 3]; ctx.fillRect(0, ry - rh + (i + 0.5) * rh * 2 / 7, w, rh * 0.1); }
    ctx.restore();
  }

  function make(mode) {
    var P = PAL[mode];
    return {
      paint: function (ctx, w, h) { if (!bind()) return; var L = layout(w, h); view(ctx, L, P); room(ctx, L, P); desk(ctx, L, P); floor(ctx, L, P);
        ctx.fillStyle = lg(ctx, 0, h * 0.8, 0, h, [[0, 'rgba(30,20,20,0)'], [1, 'rgba(30,20,20,' + (P.night ? 0.4 : 0.25) + ')']]); ctx.fillRect(0, h * 0.8, w, h * 0.2);
        if (P.night) finish(ctx, w, h, '#5a4a9a', 0.12, 0.38, 0.04, '#0a0814', 0.4); else finish(ctx, w, h, '#ffb070', 0.12, 0.2, 0.035, '#2a1612', 0.42); },
      overlay: function (ctx, w, h, t) {
        if (!bind()) return; var L = layout(w, h), s = L.s, i, n = P.night;
        ctx.save(); ctx.beginPath(); ctx.rect(L.wx0, L.wy0, L.wx1 - L.wx0, L.wy1 - L.wy0); ctx.clip();
        // a drone ferrying parts over the yard; at night its light blinks, and the tower beacon pulses
        var q = (t % 22) / 22, dx = lerp(L.wx1 + 10 * s, L.wx0 - 10 * s, q), dy = L.city - h * 0.04 + Math.sin(t * 1.5) * 2 * s;
        K.drawDrone(ctx, dx, dy, 3.4 * s, n ? '#9a9ab0' : '#f2eef6', Math.sin(t * 5) > 0.6 ? 1 : 0, '#ff5a4a');
        if (n && L.beacon) { var bs = glowSpr('#ff4a3a', true); if (bs) { ctx.globalAlpha = 0.4 + 0.6 * Math.max(0, Math.sin(t * 2.4)); ctx.drawImage(bs, L.beacon[0] - 6 * s, L.beacon[1] - 6 * s, 12 * s, 12 * s); ctx.globalAlpha = 1; } }
        // the walking survey robot trots along the fence and back; at night Crew 7's lights pulse as it wakes up
        var wq = (Math.sin(t * 0.2) + 1) / 2, wx = lerp(L.wx0 + 20 * s, w * 0.4, wq), wy = L.city + h * 0.03;
        X.crewBot(ctx, wx, wy, 14 * s, 'walker', s, { dir: Math.cos(t * 0.2) > 0 ? 1 : -1, body: n ? '#8a8a9e' : '#f2efe6', trim: n ? '#a88a3a' : '#f0b020' });
        if (n) { var es = glowSpr('#7ff7e4'); if (es) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; [0.6, 0.76, 0.9].forEach(function (u, j) { ctx.globalAlpha = 0.25 + 0.25 * Math.sin(t * 1.6 + j * 1.3); ctx.drawImage(es, w * u - 12 * s, L.yard - h * 0.05, 24 * s, 24 * s); }); ctx.restore(); } }
        // twinkling city lights at night, heat shimmer in the morning
        if (n) { ctx.fillStyle = '#fff2c8'; for (i = 0; i < 14; i++) { var tw = Math.pow(Math.max(0, Math.sin(t * (1 + hash(i, 3) * 2) + i * 5)), 8); if (tw < 0.1) continue; ctx.globalAlpha = tw; ctx.fillRect(lerp(L.wx0, L.wx1, hash(i, 4)), L.city - hash(i, 5) * h * 0.012, 1 * s, 1 * s); } ctx.globalAlpha = 1; }
        else { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (i = 0; i < 4; i++) { var yy = L.city + h * 0.02 + i * h * 0.02; ctx.strokeStyle = 'rgba(255,240,210,' + (0.04 + 0.03 * Math.sin(t + i)).toFixed(3) + ')'; ctx.lineWidth = 1 * s; ctx.beginPath(); for (var k = 0; k <= 24; k++) { var xx = lerp(L.wx0, L.wx1, k / 24), y2 = yy + Math.sin(k * 0.8 + t * 3 + i) * 0.8 * s; if (!k) ctx.moveTo(xx, y2); else ctx.lineTo(xx, y2); } ctx.stroke(); } ctx.restore(); }
        ctx.restore();
        // dust motes in the morning sun; a soft glow breathing around the lamp at night
        var mp = glowSpr(n ? '#ffd8a0' : '#fff0d0');
        if (mp) for (i = 0; i < (n ? 6 : 16); i++) { var a1 = hash(i, 51), b1 = hash(i, 52), c1 = hash(i, 53); var mx = (n ? L.lamp.x - 30 * s + a1 * 50 * s : w * (0.2 + a1 * 0.7)) + Math.sin(t * (0.2 + c1 * 0.2) + i) * 10 * s, my = (n ? L.lamp.y - 30 * s + b1 * 40 * s : h * (0.45 + b1 * 0.3)) + Math.sin(t * (0.25 + a1 * 0.3) + i * 2) * 8 * s, sz = (1.4 + c1 * 2.4) * s; ctx.globalAlpha = 0.15 + 0.25 * (0.5 + 0.5 * Math.sin(t * (0.8 + c1) + i * 3)); ctx.drawImage(mp, mx - sz, my - sz, sz * 2, sz * 2); }
        ctx.globalAlpha = 1;
        if (n && L.bulb) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; softGlow(ctx, L.bulb[0], L.bulb[1], (22 + 2 * Math.sin(t * 2)) * s, '#ffd090', 0.3); ctx.restore(); }
      }
    };
  }
  var D = make('day'), N = make('night');
  PAINT.phx_studio = { focus: { x: 0.93, y: 0.12 }, track: 'morning', anchors: { yard: { x: 0.7, y: 0.42 }, buildyard: { x: 0.3, y: 0.29 }, model: { x: 0.17, y: 0.48 } },
    paint: function (ctx, w, h) { ctx.save(); try { D.paint(ctx, w, h); } catch (e) { PAINT._err = 'phx_studio: ' + String(e && e.stack || e); } finally { ctx.restore(); } },
    overlay: function (ctx, w, h, t) { ctx.save(); try { D.overlay(ctx, w, h, t); } catch (e) { PAINT._err = 'phx_studio overlay: ' + String(e && e.stack || e); } finally { ctx.restore(); } } };
  PAINT.phx_dusk = { focus: { x: 0.32, y: 0.12 }, track: 'night', anchors: { yard: { x: 0.7, y: 0.42 }, buildyard: { x: 0.3, y: 0.29 }, lamp: { x: 0.86, y: 0.45 } },
    paint: function (ctx, w, h) { ctx.save(); try { N.paint(ctx, w, h); } catch (e) { PAINT._err = 'phx_dusk: ' + String(e && e.stack || e); } finally { ctx.restore(); } },
    overlay: function (ctx, w, h, t) { ctx.save(); try { N.overlay(ctx, w, h, t); } catch (e) { PAINT._err = 'phx_dusk overlay: ' + String(e && e.stack || e); } finally { ctx.restore(); } } };

  if (typeof LATE !== 'undefined') LATE.push(function () {
    if (typeof PROPS === 'undefined' || typeof PROPS_ART === 'undefined') return;
    // a little construction robot from Crew 7, visiting the studio
    PROPS_ART.phx_bot = function () { return '<svg viewBox="0 0 70 70"><ellipse cx="35" cy="66" rx="26" ry="4" fill="rgba(0,0,0,.22)"/><g class="pa-body"><rect x="8" y="50" width="46" height="12" rx="6" fill="#3a3e48"/><circle cx="16" cy="56" r="3.4" fill="#5a5e68"/><circle cx="28" cy="56" r="3.4" fill="#5a5e68"/><circle cx="40" cy="56" r="3.4" fill="#5a5e68"/>' +
      '<rect x="12" y="26" width="32" height="24" rx="6" fill="#f2efe6" stroke="#3e3430" stroke-width="2"/><rect x="12" y="40" width="32" height="4" fill="#f0b020"/><rect x="16" y="16" width="20" height="12" rx="4" fill="#d8d2c6" stroke="#3e3430" stroke-width="2"/><rect x="19" y="19" width="14" height="6" rx="3" fill="#2a2a34"/><g class="pa-eyes"><circle cx="23" cy="22" r="1.6" fill="#7ff7e4"/><circle cx="29" cy="22" r="1.6" fill="#7ff7e4"/></g>' +
      '<path d="M42 30 L56 18 L64 30" stroke="#3e3430" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M42 30 L56 18 L64 30" stroke="#f0b020" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M60 30 h9 l-2 6 h-6z" fill="#3a3e48"/><circle class="pa-light" cx="20" cy="14" r="2.4" fill="#ff6a4a"/></g></svg>'; };
    PROPS.phx_studio = [
      { id: 'plant', x: 9, y: 91, w: 50, sfx: 'rustle', fx: 'wiggle', burst: 'leaves' },
      { id: 'phx_bottle', x: 28, y: 92, w: 24, sfx: 'clink', fx: 'jiggle' },
      { id: 'phx_bot', x: 72, y: 91, w: 58, sfx: 'beep', fx: 'hop' },
      { id: 'mug', x: 91, y: 92, w: 40, sfx: 'clink', fx: 'jiggle', burst: 'steam' }
    ];
    // the evening card covers the floor, so at night the robot sits on the desk and a star shines in the window
    PROPS.phx_dusk = [
      { id: 'phx_bot', x: 44, y: 51.5, w: 34, sfx: 'beep', fx: 'hop' },
      { id: 'star', x: 30, y: 10, w: 22, sfx: 'chime', fx: 'shoot' },
      { id: 'star', x: 86, y: 16, w: 16, sfx: 'chime', fx: 'shoot' }
    ];
  });
})();
