/* scenes/beijing.js - a hutong lane near the Drum Tower, Beijing, on a golden autumn morning (uses window.CHINA_KIT).
   PAINT.beijing. The hutongs are a historic preserve, so the lane looks as it does today. Everything is built at true size
   in metres and seen through one camera at eye height (1.6 m): grey brick walls 3 m tall under tiled copings, a lane 5.4 m
   wide, and gatehouses with red double doors 2.2 m tall, carved lintels with their two painted door pins, drum stones,
   steps, couplets and red lanterns. The low morning Sun comes from the upper left: the left wall and most of the paving
   lie in cool shade, the right wall glows warm, and the old ginkgo in the foreground is backlit gold, shedding leaves.
   Past the end of the lane, over grey roofs and autumn trees, rises the Drum Tower (about 47 m): a red podium with three
   arched gateways, a pillared hall with painted brackets, and a double roof of grey tiles with green glazed edges.
   The only 2040 things are quiet ones: a small delivery robot and one drone. Pigeons with whistles circle the tower.
   Style: flat and graphic with fine linework (docs/DESIGN_NOTES.md, "Three kinds of places"). The lower third (the
   paving) stays calm for subtitles, and the middle stays readable behind a portrait. */
(function () {
  'use strict';
  var PAINT = (window.PAINT = window.PAINT || {});
  var K, PI = Math.PI, TAU = PI * 2;
  var rng, lerp, mix, rgba, lg, rg, S, poly, rrect, softGlow, haze, finish, batch, dots, dabs, qell, drawBird, clamp, smooth, fbm, glowSpr;
  function bind() {
    if (K) return true; K = window.CHINA_KIT; if (!K) return false;
    rng = K.rng; lerp = K.lerp; mix = K.mix; rgba = K.rgba; lg = K.lg; rg = K.rg; S = K.S; poly = K.poly; rrect = K.rrect; softGlow = K.softGlow; haze = K.haze;
    finish = K.finish; batch = K.batch; dots = K.dots; dabs = K.dabs; qell = K.qell; drawBird = K.drawBird; clamp = K.clamp; smooth = K.smooth; fbm = K.fbm; glowSpr = K.glowSpr;
    return true;
  }
  var C = { line: '#2e2a33', brickLit: '#b3aca2', brickLit2: '#c9c0b2', brickSh: '#6d727c', brickSh2: '#7d838d', mortarLit: '#d8d0c2', mortarSh: '#8a8f98',
    tile: '#4e535c', tileLt: '#6c727c', tileDk: '#30343b', red: '#b52f28', redLt: '#d8483a', redDk: '#6e1a18', redSh: '#86241f', gold: '#e6b23a', green: '#3b7a68', teal: '#2c6a80', blue: '#2a4a8a',
    pave: '#bdb6aa', paveSh: '#878a92', leaf: ['#8a5a10', '#b47c16', '#d9a21e', '#f0c330', '#ffe060', '#fff3a8'] };
  function ink(ctx, s, a, wd) { ctx.strokeStyle = rgba(C.line, a == null ? 0.5 : a); ctx.lineWidth = (wd || 0.7) * s; ctx.lineJoin = 'round'; ctx.stroke(); }

  /* ---------------- camera and the lane, in metres ---------------- */
  var E = 1.6, WL = -2.5, WR = 2.9, WH = 3.0, ZEND = 58, ZFAR = 66, ZT = 126;
  var SUN = [-0.7, 0.62, -0.35]; // toward the Sun: left, up, and a little behind us
  var LM = null;
  function layout(w, h) {
    var key = w + 'x' + h; if (LM && LM.key === key) return LM;
    var s = S(w, h), L = { key: key, s: s, w: w, h: h };
    L.f = h * 0.92; L.vx = w * 0.44; L.vy = h * 0.53;
    L.P = function (X, Y, Z) { return [L.vx + X * L.f / Z, L.vy + (E - Y) * L.f / Z]; };
    L.k = function (Z) { return L.f / Z; };
    L.Zn = Math.max(1.2, (E * L.f) / (h - L.vy) * 0.98);
    // where the shadow of the left wall falls across the paving (a line parallel to the lane)
    L.shX = WL + WH / SUN[1] * -SUN[0];
    L.gates = [{ side: 1, z0: 12.6, z1: 15.6, big: true }, { side: 1, z0: 27, z1: 28.9 }, { side: 1, z0: 42.5, z1: 44 }, { side: -1, z0: 19, z1: 20.7 }, { side: -1, z0: 35, z1: 36.4 }];
    LM = L; return L;
  }
  function quad(ctx, L, pts) { ctx.beginPath(); for (var i = 0; i < pts.length; i++) { var p = L.P(pts[i][0], pts[i][1], pts[i][2]); if (!i) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); } ctx.closePath(); }

  /* ---------------- the sky ---------------- */
  function sky(ctx, L) {
    var w = L.w, h = L.h, s = L.s, r = rng(2211);
    var st = [[0, '#4f86c4'], [0.35, '#7fb0dc'], [0.68, '#c4dbe6'], [0.88, '#f2e6cc'], [1, '#f7dfb4']];
    ctx.fillStyle = lg(ctx, 0, 0, 0, L.vy, st); ctx.fillRect(0, 0, w, L.vy + 2);
    K.skyStrokes(ctx, -20 * s, w + 20 * s, 0, L.vy, st, 140, r, s, 0.08, '#fff0d0', '#8ab0d8');
    // the morning Sun is just out of the frame, high on the left, behind the ginkgo
    softGlow(ctx, -w * 0.05, h * 0.06, w * 1.1, '#fff2d6', 0.42); softGlow(ctx, 0, h * 0.05, w * 0.4, '#ffffff', 0.5);
    // thin autumn cirrus
    var ws = K.wispSpr('#ffffff');
    if (ws) { [[0.62, 0.08, 0.7, 0.5], [0.85, 0.15, 0.5, 0.4], [0.3, 0.2, 0.6, 0.3], [0.95, 0.04, 0.45, 0.35]].forEach(function (c) { ctx.save(); ctx.globalAlpha = c[3]; ctx.translate(w * c[0], h * c[1]); ctx.rotate(-0.12); ctx.drawImage(ws, -w * c[2] / 2, -h * 0.025, w * c[2], h * 0.05); ctx.restore(); }); }
    ctx.strokeStyle = rgba('#ffffff', 0.35); ctx.lineWidth = 0.6 * s; ctx.beginPath();
    for (var i = 0; i < 18; i++) { var x = w * (0.45 + r() * 0.6), y = h * (0.05 + r() * 0.16), l = (20 + r() * 60) * s; ctx.moveTo(x, y); ctx.quadraticCurveTo(x + l * 0.5, y - l * 0.06, x + l, y - l * 0.02); } ctx.stroke();
  }

  /* ---------------- the Drum Tower ---------------- */
  // seen almost straight on from the south: a red podium with three arched gateways, a white balustrade, a pillared hall
  // with painted brackets under the lower eaves, and a smaller upper hall under the hip-and-gable top roof
  function drumTower(ctx, L) {
    var s = L.s, Z = ZT, X0 = 0.9, k = L.k(Z), i, hz = 0.2; // hz: share of distance haze
    var P = function (x, y) { return L.P(X0 + x, y, Z); };
    var H = function (c) { return mix(c, '#cfd8de', hz); };
    // podium: 50 m wide at the foot, battered walls, 15 m tall
    var pw = 25, pt = 23.5, ph = 15;
    var a = P(-pw, 0), b = P(-pt, ph), c = P(pt, ph), d = P(pw, 0);
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath();
    ctx.fillStyle = lg(ctx, a[0], 0, d[0], 0, [[0, H('#d0604a')], [0.35, H('#c2513e')], [1, H('#9a3c30')]]); ctx.fill(); ink(ctx, s, 0.35);
    ctx.save(); ctx.clip();
    ctx.strokeStyle = rgba('#5a1e18', 0.14); ctx.lineWidth = 0.5 * s; ctx.beginPath(); for (i = 1; i < 30; i++) { var yy = lerp(a[1], b[1], i / 30); ctx.moveTo(a[0] - 10, yy); ctx.lineTo(d[0] + 10, yy); } ctx.stroke();
    ctx.restore();
    // three arched gateways with white stone frames, the middle one taller
    [-11, 0, 11].forEach(function (cx, j) { var aw = j === 1 ? 3.4 : 2.9, ah = j === 1 ? 8.2 : 7.2, q = P(cx - aw, 0), e = P(cx + aw, 0), t = P(cx, ah), t2 = P(cx - aw, ah - aw);
      ctx.beginPath(); ctx.moveTo(q[0] - 1.2 * s, q[1]); ctx.lineTo(q[0] - 1.2 * s, t2[1]); ctx.quadraticCurveTo(q[0] - 1.2 * s, t[1] - 1.5 * s, (q[0] + e[0]) / 2, t[1] - 1.5 * s); ctx.quadraticCurveTo(e[0] + 1.2 * s, t[1] - 1.5 * s, e[0] + 1.2 * s, t2[1]); ctx.lineTo(e[0] + 1.2 * s, q[1]); ctx.closePath(); ctx.fillStyle = H('#e8e0d0'); ctx.fill();
      ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(q[0], t2[1]); ctx.quadraticCurveTo(q[0], t[1], (q[0] + e[0]) / 2, t[1]); ctx.quadraticCurveTo(e[0], t[1], e[0], t2[1]); ctx.lineTo(e[0], q[1]); ctx.closePath();
      ctx.fillStyle = lg(ctx, 0, t[1], 0, q[1], [[0, H('#2a1c1e')], [1, H('#4a3632')]]); ctx.fill(); });
    // stone band and the white balustrade along the top of the podium
    var s0 = P(-pt - 0.4, ph), s1 = P(pt + 0.4, ph + 0.8); ctx.fillStyle = H('#9a9890'); ctx.fillRect(s0[0], s1[1], s1[0] - s0[0], s0[1] - s1[1]);
    var b0 = P(-pt, ph + 0.8), b1 = P(pt, ph + 2); ctx.fillStyle = H('#ece6da'); ctx.fillRect(b0[0], b1[1], b1[0] - b0[0], (b0[1] - b1[1]) * 0.25); ctx.fillRect(b0[0], b0[1] - (b0[1] - b1[1]) * 0.2, b1[0] - b0[0], (b0[1] - b1[1]) * 0.2);
    ctx.fillStyle = H('#ece6da'); for (i = 0; i <= 40; i++) { var px = lerp(b0[0], b1[0], i / 40); ctx.fillRect(px - 0.5 * s, b1[1], 1 * s, b0[1] - b1[1]); }
    // the lower hall: red pillars and lattice doors under a painted bracket band
    function hall(y0, y1, half, bays) {
      var l = P(-half, y0), rr = P(half, y1); var x0 = l[0], x1 = rr[0], yb = l[1], yt = rr[1], hh = yb - yt;
      ctx.fillStyle = H('#7a2a22'); ctx.fillRect(x0, yt, x1 - x0, hh);
      for (var j = 0; j < bays; j++) { var bx = lerp(x0, x1, j / bays), bw = (x1 - x0) / bays;
        ctx.fillStyle = H('#a8382c'); ctx.fillRect(bx + bw * 0.12, yt + hh * 0.3, bw * 0.76, hh * 0.66);
        ctx.strokeStyle = rgba(H('#e8b860'), 0.55); ctx.lineWidth = 0.4 * s; ctx.beginPath(); for (var g = 1; g < 4; g++) { ctx.moveTo(bx + bw * 0.12, yt + hh * (0.3 + g * 0.16)); ctx.lineTo(bx + bw * 0.88, yt + hh * (0.3 + g * 0.16)); ctx.moveTo(bx + bw * (0.12 + g * 0.19), yt + hh * 0.3); ctx.lineTo(bx + bw * (0.12 + g * 0.19), yt + hh * 0.96); } ctx.stroke(); }
      ctx.fillStyle = H('#c8402e'); for (j = 0; j <= bays; j++) { var cx2 = lerp(x0, x1, j / bays); ctx.fillRect(cx2 - 1.1 * s, yt, 2.2 * s, hh); }
      // bracket band: blue-green with gold dots
      ctx.fillStyle = H(C.teal); ctx.fillRect(x0 - 2 * s, yt - hh * 0.2, x1 - x0 + 4 * s, hh * 0.2);
      ctx.fillStyle = H(C.green); ctx.fillRect(x0 - 2 * s, yt - hh * 0.07, x1 - x0 + 4 * s, hh * 0.07);
      // bracket sets: little stacked blocks in a row, painted blue and green with gold edges
      for (j = 0; j < bays * 4; j++) { var bxx = lerp(x0, x1, (j + 0.5) / (bays * 4)); ctx.fillStyle = H(j % 2 ? '#2a5a8a' : '#3f8a6e'); ctx.fillRect(bxx - 1.4 * s, yt - hh * 0.19, 2.8 * s, hh * 0.1); ctx.fillStyle = H('#f0c860'); ctx.fillRect(bxx - 0.5 * s, yt - hh * 0.2, 1 * s, 0.8 * s); }
      ctx.fillStyle = rgba('#1a1414', 0.35); ctx.fillRect(x0, yt, x1 - x0, hh * 0.25); // eave shadow
      return [x0, x1, yt - hh * 0.16];
    }
    // a hip-and-gable roof: a long ridge, steep upper slopes, and wide eaves that sweep up at the corners
    function roof(yEave, yRidge, halfE, halfR, lift, col) {
      var e0 = P(-halfE, yEave), e1 = P(halfE, yEave), r0 = P(-halfR, yRidge), r1 = P(halfR, yRidge), up = lift * k, cy = (e0[1] + r0[1]) / 2;
      ctx.beginPath(); ctx.moveTo(e0[0] - up * 0.6, e0[1] - up); ctx.quadraticCurveTo(lerp(e0[0], r0[0], 0.2), e0[1] + up * 0.15, lerp(e0[0], r0[0], 0.45), cy);
      ctx.lineTo(r0[0], r0[1]); ctx.lineTo(r1[0], r1[1]); ctx.lineTo(lerp(e1[0], r1[0], 0.45), cy); ctx.quadraticCurveTo(lerp(e1[0], r1[0], 0.2), e1[1] + up * 0.15, e1[0] + up * 0.6, e1[1] - up);
      ctx.quadraticCurveTo((e0[0] + e1[0]) / 2, e1[1] + up * 0.5, e0[0] - up * 0.6, e0[1] - up); ctx.closePath();
      ctx.fillStyle = lg(ctx, 0, r0[1], 0, e0[1], [[0, H(mix(col, '#ffffff', 0.12))], [1, H(col)]]); ctx.fill();
      ctx.save(); ctx.clip();
      ctx.strokeStyle = rgba(C.tileDk, 0.45); ctx.lineWidth = 0.5 * s; ctx.beginPath();
      for (var j = -30; j <= 30; j++) { var u = j / 30, xa = lerp((r0[0] + r1[0]) / 2, (r1[0] - r0[0]) / 2 + (r0[0] + r1[0]) / 2, u) ; xa = (r0[0] + r1[0]) / 2 + u * (r1[0] - r0[0]) / 2; var xb = (e0[0] + e1[0]) / 2 + u * ((e1[0] - e0[0]) / 2 + up * 0.6); ctx.moveTo(xa, r0[1]); ctx.lineTo(xb, e0[1] + up * 0.3); } ctx.stroke();
      // sunlit left slope, shaded right
      ctx.fillStyle = lg(ctx, e0[0], 0, e1[0], 0, [[0, 'rgba(255,240,210,0.22)'], [0.5, 'rgba(255,240,210,0)'], [1, 'rgba(20,20,40,0.22)']]); ctx.fillRect(e0[0] - up, r0[1] - up, e1[0] - e0[0] + up * 2, e0[1] - r0[1] + up * 2);
      ctx.restore();
      // hip ridges running down to the upturned corners
      ctx.strokeStyle = H(C.tileDk); ctx.lineWidth = 1.4 * s; ctx.beginPath(); ctx.moveTo(r0[0], r0[1]); ctx.quadraticCurveTo(lerp(e0[0], r0[0], 0.35), lerp(e0[1], r0[1], 0.3), e0[0] - up * 0.6, e0[1] - up); ctx.moveTo(r1[0], r1[1]); ctx.quadraticCurveTo(lerp(e1[0], r1[0], 0.35), lerp(e1[1], r1[1], 0.3), e1[0] + up * 0.6, e1[1] - up); ctx.stroke();
      // the dark underside of the eaves, with the rafter ends
      ctx.fillStyle = H('#2a2224'); ctx.beginPath(); ctx.moveTo(e0[0] - up * 0.6, e0[1] - up); ctx.quadraticCurveTo((e0[0] + e1[0]) / 2, e1[1] + up * 0.5, e1[0] + up * 0.6, e1[1] - up); ctx.quadraticCurveTo((e0[0] + e1[0]) / 2, e1[1] + up * 0.5 + 0.9 * k, e0[0] - up * 0.6, e0[1] - up); ctx.closePath(); ctx.fill();
      // green glazed edge along the eave and the ridge with its end ornaments
      ctx.strokeStyle = H('#3f8a5e'); ctx.lineWidth = 2 * s; ctx.beginPath(); ctx.moveTo(e0[0] - up * 0.6, e0[1] - up); ctx.quadraticCurveTo((e0[0] + e1[0]) / 2, e1[1] + up * 0.5, e1[0] + up * 0.6, e1[1] - up); ctx.stroke();
      ctx.fillStyle = H(C.tileDk); ctx.fillRect(r0[0], r0[1] - 2.2 * s, r1[0] - r0[0], 2.6 * s);
      [r0, r1].forEach(function (q, j) { var dd = j ? 1 : -1; ctx.beginPath(); ctx.moveTo(q[0], q[1] - 2 * s); ctx.quadraticCurveTo(q[0] + dd * 2.5 * s, q[1] - 9 * s, q[0] - dd * 1.6 * s, q[1] - 8 * s); ctx.lineTo(q[0] - dd * 2.4 * s, q[1]); ctx.closePath(); ctx.fillStyle = H(C.tileDk); ctx.fill(); });
      ink(ctx, s, 0.3);
      return [e0, e1];
    }
    var hb = hall(ph + 2, ph + 9.5, 20, 9);
    var e1 = roof(ph + 10.2, ph + 15.5, 26, 15, 2.4, C.tile);
    var hb2 = hall(ph + 15.2, ph + 21.5, 15, 7);
    var e2 = roof(ph + 22, ph + 31.5, 20.5, 8, 2.6, C.tile);
    L.towerTop = P(0, ph + 32); L.towerEaves = [e1[0], e1[1], e2[0], e2[1]];
    // a soft veil of morning haze over the whole tower
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; var tt = P(0, 50), fb = P(0, 0); ctx.fillStyle = lg(ctx, 0, tt[1], 0, fb[1], [[0, 'rgba(255,236,200,0.02)'], [1, 'rgba(255,236,200,0.12)']]); ctx.fillRect(0, tt[1], L.w, fb[1] - tt[1]); ctx.restore();
  }

  /* ---------------- the neighbourhood beyond the lane ---------------- */
  function rooftops(ctx, L) {
    var w = L.w, s = L.s, r = rng(3311), i, j;
    // rows of courtyard-house roofs between the lane end and the tower, paler with distance, with autumn trees among them
    for (j = 3; j >= 0; j--) {
      var Z = 70 + j * 11, hzf = 0.1 + j * 0.06;
      for (i = 0; i < 26; i++) {
        var X = -34 + i * 2.8 + (r() - 0.5) * 1.2, rw = 5 + r() * 4, Y0 = 3.2 + r() * 0.6, Y1 = Y0 + 1.6 + r() * 0.9;
        var a = L.P(X - rw / 2, Y0, Z), b = L.P(X - rw * 0.38, Y1, Z), c = L.P(X + rw * 0.38, Y1, Z), d = L.P(X + rw / 2, Y0, Z);
        if (d[0] < -10 || a[0] > w + 10) continue;
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 1 * s, b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.quadraticCurveTo((c[0] + d[0]) / 2, (c[1] + d[1]) / 2 + 1 * s, d[0], d[1]); ctx.closePath();
        ctx.fillStyle = mix(mix(C.tile, '#9aa4ae', 0.25), '#d8dde0', hzf); ctx.fill();
        ctx.strokeStyle = rgba(mix(C.tileDk, '#c8ccd0', hzf), 0.5); ctx.lineWidth = 0.4 * s; ctx.beginPath(); for (var q = 1; q < 9; q++) { var t = q / 9; ctx.moveTo(lerp(b[0], c[0], t), b[1]); ctx.lineTo(lerp(a[0], d[0], t), a[1]); } ctx.stroke();
        ctx.fillStyle = mix(C.tileDk, '#c8ccd0', hzf); ctx.fillRect(b[0] - 1 * s, b[1] - 1.4 * s, c[0] - b[0] + 2 * s, 1.8 * s);
        var wb = L.P(X - rw * 0.46, Y0, Z), wb2 = L.P(X + rw * 0.46, 0, Z); ctx.fillStyle = mix('#9a9690', '#d8dde0', hzf); ctx.fillRect(wb[0], wb[1], wb2[0] - wb[0], wb2[1] - wb[1]);
      }
      // trees between the rows
      for (i = 0; i < 9; i++) { var tx = -30 + r() * 60, tz = Z - 3, p = L.P(tx, 4 + r() * 3, tz), R = (2 + r() * 2.5) * L.k(tz), pal = r() < 0.45 ? ['#a87a18', '#c8961c', '#e0b42a', '#f0cf48', '#fae890'] : r() < 0.6 ? ['#8a3a18', '#b2542a', '#d47a34', '#e8a050', '#f4c88a'] : ['#3a5a3a', '#4a6e44', '#5e8650', '#7aa060', '#a8c488'];
        if (p[0] < -R || p[0] > w + R) continue;
        pal = pal.map(function (c2) { return mix(c2, '#d8dde0', hzf * 0.8); });
        K.clump(ctx, p[0], p[1], R, pal, r, -0.7, -0.6, false, 0.6); }
    }
    haze(ctx, -w * 0.2, L.vy - L.h * 0.08, w * 1.2, L.vy + L.h * 0.01, '#f4e8d0', 0.35);
  }
  // across the cross street at the end of the lane: a courtyard wall facing us, with a gate and a tree
  function farStreet(ctx, L) {
    var s = L.s, w = L.w;
    // the cross street, half in sun
    quad(ctx, L, [[-30, 0, ZEND], [30, 0, ZEND], [30, 0, ZFAR], [-30, 0, ZFAR]]); ctx.fillStyle = mix(C.pave, '#fff2d8', 0.25); ctx.fill();
    var a = L.P(-30, 3.1, ZFAR), b = L.P(30, 0, ZFAR); ctx.fillStyle = lg(ctx, 0, a[1], 0, b[1], [[0, '#cfc6b6'], [1, '#b2aa9c']]); ctx.fillRect(a[0], a[1], b[0] - a[0], b[1] - a[1]);
    ctx.strokeStyle = rgba('#8a8478', 0.35); ctx.lineWidth = 0.4 * s; ctx.beginPath(); for (var i = 1; i < 12; i++) { var yy = lerp(a[1], b[1], i / 12); ctx.moveTo(a[0], yy); ctx.lineTo(b[0], yy); } ctx.stroke();
    var c0 = L.P(-30, 3.35, ZFAR); ctx.fillStyle = C.tile; ctx.fillRect(c0[0], c0[1], b[0] - c0[0], a[1] - c0[1]);
    // a red gate seen straight on, with its little roof and two lanterns
    var g0 = L.P(-0.4, 0, ZFAR), g1 = L.P(1.2, 2.2, ZFAR), gr = L.P(-0.8, 3.7, ZFAR), gr2 = L.P(1.6, 3.0, ZFAR);
    ctx.fillStyle = C.red; ctx.fillRect(g0[0], g1[1], g1[0] - g0[0], g0[1] - g1[1]); ctx.fillStyle = C.redDk; ctx.fillRect((g0[0] + g1[0]) / 2 - 0.3 * s, g1[1], 0.6 * s, g0[1] - g1[1]);
    ctx.fillStyle = C.tile; ctx.beginPath(); ctx.moveTo(gr[0] - 2 * s, gr2[1]); ctx.lineTo(gr[0] + 2 * s, gr[1]); ctx.lineTo(gr2[0] - 2 * s, gr[1]); ctx.lineTo(gr2[0] + 2 * s, gr2[1]); ctx.closePath(); ctx.fill();
    L.farLanterns = [[g0[0] - 2 * s, g1[1] - 1 * s], [g1[0] + 2 * s, g1[1] - 1 * s]];
    // a breakfast stall on the corner (its steam rises in the overlay)
    var st = L.P(2.2, 0, ZEND + 3), st2 = L.P(3.6, 1.1, ZEND + 3), sr = L.P(1.9, 2.2, ZEND + 3), sr2 = L.P(3.9, 1.9, ZEND + 3);
    ctx.fillStyle = '#e8e2d4'; ctx.fillRect(st[0], st2[1], st2[0] - st[0], st[1] - st2[1]); ctx.fillStyle = '#c8402e'; ctx.fillRect(st[0], st2[1], st2[0] - st[0], (st[1] - st2[1]) * 0.25);
    ctx.fillStyle = '#e8b048'; ctx.beginPath(); ctx.moveTo(sr[0], sr2[1]); ctx.lineTo((sr[0] + sr2[0]) / 2, sr[1]); ctx.lineTo(sr2[0], sr2[1]); ctx.closePath(); ctx.fill();
    L.stall = [(st[0] + st2[0]) / 2, st2[1]];
  }

  /* ---------------- the lane ---------------- */
  function paving(ctx, L) {
    var s = L.s, w = L.w, h = L.h, r = rng(6611), i, j;
    quad(ctx, L, [[WL, 0, L.Zn], [WR, 0, L.Zn], [WR, 0, ZEND], [WL, 0, ZEND]]); ctx.fillStyle = C.pave; ctx.fill();
    // large grey stone slabs in courses, each a slightly different tone (batched by tone)
    var cols = ['#c4bdb0', '#b7b0a4', '#aaa498', '#cfc8ba'], B = [[], [], [], []], z = L.Zn, row = 0;
    while (z < ZEND) { var dz = 0.62, off = (row % 2) * 0.35;
      for (var x = WL - off; x < WR; x += 0.7) { var x0 = Math.max(WL, x), x1 = Math.min(WR, x + 0.7); if (x1 - x0 < 0.05) continue; B[(r() * 4) | 0].push([x0, x1, z, Math.min(ZEND, z + dz)]); }
      z += dz; row++; }
    ctx.save();
    for (j = 0; j < 4; j++) { ctx.fillStyle = cols[j]; ctx.beginPath(); B[j].forEach(function (q) { var a = L.P(q[0], 0, q[2]), b = L.P(q[1], 0, q[2]), c = L.P(q[1], 0, q[3]), d = L.P(q[0], 0, q[3]); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); }); ctx.fill(); }
    // joints
    ctx.strokeStyle = rgba('#6a645a', 0.4); ctx.lineWidth = 0.6 * s; ctx.beginPath();
    B.forEach(function (bb) { bb.forEach(function (q) { if (q[2] > 34) return; var a = L.P(q[0], 0, q[2]), b = L.P(q[1], 0, q[2]), d = L.P(q[0], 0, q[3]); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.moveTo(a[0], a[1]); ctx.lineTo(d[0], d[1]); }); }); ctx.stroke();
    ctx.restore();
    // a gutter of darker bricks along each wall foot
    [WL, WR].forEach(function (X) { var dd = X < 0 ? 0.3 : -0.3; quad(ctx, L, [[X, 0, L.Zn], [X + dd, 0, L.Zn], [X + dd, 0, ZEND], [X, 0, ZEND]]); ctx.fillStyle = rgba('#5a5650', 0.35); ctx.fill(); });
  }
  // light on the paving: the left wall's shadow covers most of the lane; the ginkgo throws dappled shade into the sun
  function lanelight(ctx, L) {
    var s = L.s, r = rng(6612);
    ctx.save();
    quad(ctx, L, [[WL, 0, L.Zn], [L.shX, 0, L.Zn], [L.shX, 0, ZEND], [WL, 0, ZEND]]);
    ctx.fillStyle = rgba('#3a4a6a', 0.36); ctx.fill();
    // the sunlit strip: warm
    quad(ctx, L, [[L.shX, 0, L.Zn], [WR, 0, L.Zn], [WR, 0, ZEND], [L.shX, 0, ZEND]]); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = 'rgba(255,214,150,0.55)'; ctx.fill(); ctx.globalCompositeOperation = 'source-over';
    // a soft edge to the shadow (the Sun is a disc, not a point)
    var a = L.P(L.shX, 0, L.Zn), b = L.P(L.shX, 0, ZEND); ctx.strokeStyle = rgba('#3a4a6a', 0.15); ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    // shadows of the gatehouse roofs on the right wall's foot fall in the overlay of the gate itself; here: dapples from the ginkgo
    var sp = [];
    for (var i = 0; i < 26; i++) { var Zc = L.Zn + Math.pow(r(), 1.3) * 14, Xc = lerp(L.shX, WR, r()); for (var j = 0; j < 7; j++) { var Z = Zc + (r() - 0.5) * 0.8, X = Xc + (r() - 0.5) * 0.7, p = L.P(X, 0, Z), k = L.k(Z), R = (0.05 + r() * 0.14) * k; sp.push([p[0], p[1], R, R * 0.32]); } }
    ctx.fillStyle = rgba('#3a4a6a', 0.2); ctx.beginPath(); sp.forEach(function (q) { qell(ctx, q[0], q[1], q[2], q[3], 0); }); ctx.fill();
    ctx.restore();
  }
  // the roofs of the courtyard houses behind each wall: tiled slopes rising away from the lane to a ridge
  function houseRoofs(ctx, L, side) {
    var s = L.s, WX = side > 0 ? WR : WL, sg = side, r = rng(side > 0 ? 4411 : 4412);
    var runs = side > 0 ? [[L.Zn, 11], [17, 26], [30.5, 41.5], [45.5, 57]] : [[L.Zn, 18], [22, 34], [37.5, 57]];
    runs.forEach(function (run, j) {
      var z0 = run[0], z1 = run[1], eY = WH + 0.35, rY = WH + 2.3 + r() * 0.5, rX = WX + sg * 3.4;
      var face = [[WX + sg * 0.15, eY, z0], [rX, rY, z0], [rX, rY, z1], [WX + sg * 0.15, eY, z1]];
      quad(ctx, L, face); ctx.fillStyle = side > 0 ? '#6a6e74' : '#4e535c'; ctx.fill();
      // tile rows running up the slope
      ctx.save(); quad(ctx, L, face); ctx.clip();
      ctx.strokeStyle = rgba(side > 0 ? '#3a3e46' : '#2e3238', 0.6); ctx.lineWidth = 0.6 * s; ctx.beginPath();
      for (var z = z0; z < z1; z += 0.22) { var a = L.P(WX + sg * 0.15, eY, z), b = L.P(rX, rY, z); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); } ctx.stroke();
      ctx.fillStyle = side > 0 ? 'rgba(255,226,170,0.18)' : 'rgba(150,170,210,0.08)'; ctx.fill();
      ctx.restore();
      // the ridge with its raised end (seen against the sky)
      var r0 = L.P(rX, rY, z0), r1 = L.P(rX, rY, z1), kk = L.k(z0);
      ctx.strokeStyle = side > 0 ? '#565b63' : '#3e434a'; ctx.lineWidth = Math.max(1.2 * s, 0.12 * L.k(z1)); ctx.beginPath(); ctx.moveTo(r0[0], r0[1]); ctx.lineTo(r1[0], r1[1]); ctx.stroke();
      ctx.fillStyle = C.tileDk; ctx.beginPath(); ctx.moveTo(r0[0], r0[1]); ctx.quadraticCurveTo(r0[0] - sg * 0.03 * kk, r0[1] - 0.22 * kk, r0[0] + sg * 0.12 * kk, r0[1] - 0.2 * kk); ctx.lineTo(r0[0] + sg * 0.06 * kk, r0[1] + 0.05 * kk); ctx.closePath(); ctx.fill();
      // the gable end facing us: plastered, with a little tiled edge
      var g = [[WX + sg * 0.15, eY, z0], [rX, rY, z0], [rX + sg * 2.5, eY - 0.2, z0], [rX + sg * 2.5, WH - 0.5, z0], [WX + sg * 0.15, WH - 0.5, z0]];
      if (j > 0) { quad(ctx, L, g); ctx.fillStyle = side > 0 ? '#9a948c' : '#7a7e86'; ctx.fill(); ink(ctx, s, 0.25); }
    });
  }
  // a brick wall along the lane: courses converging on the vanishing point, a stone plinth, a tiled coping
  function wall(ctx, L, side) {
    var s = L.s, WX = side > 0 ? WR : WL, lit = side > 0, r = rng(side > 0 ? 5511 : 5512), i;
    var face = [[WX, 0, L.Zn], [WX, WH, L.Zn], [WX, WH, ZEND], [WX, 0, ZEND]];
    quad(ctx, L, face);
    var a = L.P(WX, 0, L.Zn), b = L.P(WX, 0, ZEND);
    ctx.fillStyle = lg(ctx, a[0], 0, b[0], 0, lit ? [[0, '#c4b8a4'], [1, '#d4cab8']] : [[0, '#6e737c'], [1, '#9298a0']]); ctx.fill();
    ctx.save(); quad(ctx, L, face); ctx.clip();
    // individual bricks with slightly different tones, where they are big enough to see
    var cols = lit ? ['#b8ad9c', '#cbc0ae', '#a99f90', '#d6ccba'] : ['#666b74', '#787d86', '#5d626a', '#828791'], Bk = [[], [], [], []];
    for (var Y = 0.6; Y < WH; Y += 0.11) { var row = Math.round(Y / 0.11), off = (row % 2) * 0.13;
      for (var z = L.Zn + off; z < Math.min(ZEND, 32); z += 0.26) { if (r() < 0.6) continue; Bk[(r() * 4) | 0].push([Y, Y + 0.1, z, z + 0.25]); } }
    for (i = 0; i < 4; i++) { ctx.fillStyle = cols[i]; ctx.beginPath(); Bk[i].forEach(function (q) { var p0 = L.P(WX, q[0], q[2]), p1 = L.P(WX, q[1], q[2]), p2 = L.P(WX, q[1], q[3]), p3 = L.P(WX, q[0], q[3]); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.lineTo(p3[0], p3[1]); ctx.closePath(); }); ctx.fill(); }
    // mortar courses
    ctx.strokeStyle = rgba(lit ? C.mortarLit : C.mortarSh, 0.6); ctx.lineWidth = 0.5 * s; ctx.beginPath();
    for (Y = 0.6; Y < WH; Y += 0.11) { var p = L.P(WX, Y, L.Zn), q2 = L.P(WX, Y, ZEND); ctx.moveTo(p[0], p[1]); ctx.lineTo(q2[0], q2[1]); } ctx.stroke();
    ctx.strokeStyle = rgba(lit ? '#8a8070' : '#4a4e56', 0.3); ctx.beginPath();
    for (z = L.Zn; z < 24; z += 0.26) { var t0 = L.P(WX, 0.6, z), t1 = L.P(WX, WH, z); ctx.moveTo(t0[0], t0[1]); ctx.lineTo(t1[0], t1[1]); } ctx.stroke();
    // the stone plinth: big blocks, a lighter top edge
    var pl = [[WX, 0, L.Zn], [WX, 0.6, L.Zn], [WX, 0.6, ZEND], [WX, 0, ZEND]]; quad(ctx, L, pl); ctx.fillStyle = lit ? '#9a9286' : '#5a5e66'; ctx.fill();
    ctx.strokeStyle = rgba(lit ? '#e8dcc6' : '#8a909a', 0.7); ctx.lineWidth = 0.8 * s; var u0 = L.P(WX, 0.6, L.Zn), u1 = L.P(WX, 0.6, ZEND); ctx.beginPath(); ctx.moveTo(u0[0], u0[1]); ctx.lineTo(u1[0], u1[1]); ctx.stroke();
    ctx.strokeStyle = rgba('#3a3a40', 0.3); ctx.lineWidth = 0.5 * s; ctx.beginPath(); for (z = L.Zn; z < 40; z += 0.9) { var v0 = L.P(WX, 0, z), v1 = L.P(WX, 0.6, z); ctx.moveTo(v0[0], v0[1]); ctx.lineTo(v1[0], v1[1]); } ctx.stroke();
    // weathering: damp darker foot, a few patches of old plaster, and moss
    ctx.fillStyle = lg(ctx, 0, L.P(WX, 1.2, 14)[1], 0, L.P(WX, 0, 14)[1], [[0, 'rgba(40,40,50,0)'], [1, 'rgba(40,40,50,0.18)']]); ctx.fillRect(0, 0, L.w, L.h);
    for (i = 0; i < 9; i++) { var pz = L.Zn + 2 + r() * 30, py = 1 + r() * 1.6, pw = 0.4 + r() * 1.2, ph = 0.2 + r() * 0.5; quad(ctx, L, [[WX, py, pz], [WX, py + ph, pz], [WX, py + ph * 0.8, pz + pw], [WX, py, pz + pw]]); ctx.fillStyle = rgba(lit ? '#ddd4c4' : '#9aa0a8', 0.35); ctx.fill(); }
    // warm light on the sunlit wall fades toward the far end; the shaded wall picks up warm light bounced off the paving
    if (lit) { ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = 'rgba(255,200,120,0.45)'; ctx.fillRect(0, 0, L.w, L.h); ctx.globalCompositeOperation = 'source-over'; }
    else { var f0 = L.P(WX, 0, 12), f1 = L.P(WX, 1.5, 12); ctx.fillStyle = lg(ctx, 0, f1[1], 0, f0[1], [[0, 'rgba(255,200,140,0)'], [1, 'rgba(255,200,140,0.14)']]); ctx.fillRect(0, 0, L.w, L.h); }
    ctx.restore();
    // the coping: an overhanging band of grey tiles with a row of round tile ends, and the ridge on top
    var o = -side * 0.18, cop = [[WX + o, WH, L.Zn], [WX + o, WH + 0.32, L.Zn], [WX + o, WH + 0.32, ZEND], [WX + o, WH, ZEND]];
    quad(ctx, L, cop); ctx.fillStyle = C.tileDk; ctx.fill();
    var cu = [[WX + o, WH + 0.32, L.Zn], [WX, WH + 0.5, L.Zn], [WX, WH + 0.5, ZEND], [WX + o, WH + 0.32, ZEND]]; quad(ctx, L, cu); ctx.fillStyle = lit ? C.tileLt : C.tile; ctx.fill();
    ctx.fillStyle = lit ? '#585e68' : '#3a3e46'; ctx.beginPath();
    for (z = L.Zn; z < ZEND; z += z < 20 ? 0.2 : 0.35) { var e = L.P(WX + o, WH + 0.02, z), kk = L.k(z) * 0.09; if (kk < 0.5) break; ctx.moveTo(e[0] + kk, e[1]); ctx.arc(e[0], e[1], kk, 0, PI); } ctx.fill();
    var rt0 = L.P(WX, WH + 0.5, L.Zn), rt1 = L.P(WX, WH + 0.5, ZEND); ctx.strokeStyle = C.tileDk; ctx.lineWidth = Math.max(1, 0.12 * L.k(8)); ctx.beginPath(); ctx.moveTo(rt0[0], rt0[1]); ctx.lineTo(rt1[0], rt1[1]); ctx.stroke();
    if (lit) { ctx.strokeStyle = 'rgba(255,236,200,0.6)'; ctx.lineWidth = 0.8 * s; ctx.beginPath(); var l0 = L.P(WX, WH + 0.52, L.Zn), l1 = L.P(WX, WH + 0.52, ZEND); ctx.moveTo(l0[0], l0[1]); ctx.lineTo(l1[0], l1[1]); ctx.stroke(); }
    // the coping's shadow on the wall just under it
    quad(ctx, L, [[WX, WH - 0.12, L.Zn], [WX, WH, L.Zn], [WX, WH, ZEND], [WX, WH - 0.12, ZEND]]); ctx.fillStyle = 'rgba(30,30,40,0.28)'; ctx.fill();
  }
  function lantern(ctx, x, y, R, s, lit) {
    ctx.strokeStyle = '#3a2a20'; ctx.lineWidth = Math.max(0.5 * s, R * 0.08); ctx.beginPath(); ctx.moveTo(x, y - R * 1.9); ctx.lineTo(x, y - R); ctx.stroke();
    ctx.fillStyle = rg(ctx, x - R * 0.35, y - R * 0.3, R * 0.1, R * 1.2, lit ? [[0, '#ffb08a'], [0.5, '#e04030'], [1, '#8a1a18']] : [[0, '#e8705a'], [0.6, '#b8302a'], [1, '#6a1414']]); ctx.beginPath(); qell(ctx, x, y, R, R * 0.86, 0); ctx.fill();
    ctx.strokeStyle = rgba('#5a1010', 0.55); ctx.lineWidth = Math.max(0.4 * s, R * 0.05); ctx.beginPath(); for (var k = -2; k <= 2; k++) { ctx.moveTo(x + k * R * 0.36, y - R * 0.8); ctx.quadraticCurveTo(x + k * R * 0.5, y, x + k * R * 0.36, y + R * 0.8); } ctx.stroke();
    ctx.fillStyle = C.gold; ctx.fillRect(x - R * 0.45, y - R * 0.98, R * 0.9, R * 0.22); ctx.fillRect(x - R * 0.45, y + R * 0.76, R * 0.9, R * 0.22);
    ctx.strokeStyle = '#e8b830'; ctx.lineWidth = Math.max(0.4 * s, R * 0.07); ctx.beginPath(); for (k = -2; k <= 2; k++) { ctx.moveTo(x + k * R * 0.12, y + R * 0.98); ctx.lineTo(x + k * R * 0.14, y + R * 1.6); } ctx.stroke();
  }
  /* a gatehouse on a wall (side +1 right, -1 left): it stands out 0.35 m into the lane, with the double door set back in
     a recess, a carved lintel with two door pins, drum stones, two steps, red couplets and a roof with a gable end */
  function gate(ctx, L, G) {
    var s = L.s, sg = G.side, WX = sg > 0 ? WR : WL, p = 0.35, F = WX - sg * p, lit = sg > 0, z0 = G.z0, z1 = G.z1, zc = (z0 + z1) / 2, dw = G.big ? 0.8 : 0.6, dh = G.big ? 2.3 : 2.15, i;
    var dz0 = zc - dw, dz1 = zc + dw, rec = 0.4, D = F + sg * rec, kc = L.k(zc);
    // the gatehouse front (facing the lane) and its near side face (facing us)
    var front = [[F, 0, z0], [F, WH + 0.4, z0], [F, WH + 0.4, z1], [F, 0, z1]];
    quad(ctx, L, front); ctx.fillStyle = lit ? '#bfb4a2' : '#727780'; ctx.fill();
    var sideF = [[WX, 0, z0], [WX, WH + 0.4, z0], [F, WH + 0.4, z0], [F, 0, z0]]; quad(ctx, L, sideF); ctx.fillStyle = lit ? '#9a9284' : '#5e636c'; ctx.fill();
    ctx.save(); quad(ctx, L, front); ctx.clip(); ctx.strokeStyle = rgba(lit ? C.mortarLit : C.mortarSh, 0.55); ctx.lineWidth = 0.45 * s; ctx.beginPath(); for (var Y = 0.11; Y < WH + 0.4; Y += 0.11) { var a = L.P(F, Y, z0), b = L.P(F, Y, z1); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); } ctx.stroke();
      if (lit) { ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = 'rgba(255,200,120,0.45)'; ctx.fillRect(0, 0, L.w, L.h); ctx.globalCompositeOperation = 'source-over'; } ctx.restore();
    // a carved brick panel above the door
    quad(ctx, L, [[F, dh + 0.35, dz0 - 0.15], [F, WH + 0.2, dz0 - 0.15], [F, WH + 0.2, dz1 + 0.15], [F, dh + 0.35, dz1 + 0.15]]); ctx.fillStyle = lit ? '#cfc3ae' : '#80858e'; ctx.fill(); ink(ctx, s, 0.3, 0.5);
    // the recess: dark reveal on the far jamb, the lintel beam, then the door leaves
    quad(ctx, L, [[F, 0, dz1], [F, dh + 0.3, dz1], [D, dh + 0.3, dz1], [D, 0, dz1]]); ctx.fillStyle = lit ? '#6a5a4c' : '#3e3a3c'; ctx.fill();
    quad(ctx, L, [[F, dh, dz0], [F, dh + 0.3, dz0], [F, dh + 0.3, dz1], [F, dh, dz1]]); ctx.fillStyle = '#7a2a20'; ctx.fill();
    var leaf = [[D, 0.12, dz0], [D, dh, dz0], [D, dh, dz1], [D, 0.12, dz1]];
    quad(ctx, L, leaf); var la = L.P(D, 0, dz0), lb = L.P(D, 0, dz1); ctx.fillStyle = lg(ctx, la[0], 0, lb[0], 0, lit ? [[0, C.redSh], [0.3, C.red], [1, C.redLt]] : [[0, C.redDk], [1, C.redSh]]); ctx.fill(); ink(ctx, s, 0.5);
    // the meeting stiles, gold studs on the grand gate, brass knockers and red couplets with gold writing
    var m0 = L.P(D, 0.12, zc), m1 = L.P(D, dh, zc); ctx.strokeStyle = C.redDk; ctx.lineWidth = Math.max(0.6 * s, 0.03 * kc); ctx.beginPath(); ctx.moveTo(m0[0], m0[1]); ctx.lineTo(m1[0], m1[1]); ctx.stroke();
    if (G.big) { ctx.fillStyle = C.gold; for (var rr = 0; rr < 5; rr++) for (var c = 0; c < 6; c++) { var zz = lerp(dz0 + 0.12, dz1 - 0.12, (c + 0.5) / 6), q = L.P(D, lerp(dh - 0.35, 0.6, rr / 4), zz); if ((c === 2 || c === 3)) continue; ctx.beginPath(); ctx.arc(q[0], q[1], Math.max(0.5 * s, 0.025 * L.k(zz)), 0, TAU); ctx.fill(); } }
    [-0.12, 0.12].forEach(function (d) { var q = L.P(D, 1.15, zc + d), R = Math.max(1 * s, 0.07 * L.k(zc + d)); ctx.strokeStyle = '#d8a83a'; ctx.lineWidth = Math.max(0.5 * s, R * 0.25); ctx.beginPath(); ctx.ellipse(q[0], q[1], R * 0.45, R, 0, 0, TAU); ctx.stroke(); ctx.fillStyle = '#b8862a'; ctx.beginPath(); ctx.arc(q[0], q[1] - R, R * 0.4, 0, TAU); ctx.fill(); });
    [[dz0 + 0.06, dz0 + 0.24], [dz1 - 0.24, dz1 - 0.06]].forEach(function (zr) { quad(ctx, L, [[D - sg * 0.01, 0.5, zr[0]], [D - sg * 0.01, dh - 0.15, zr[0]], [D - sg * 0.01, dh - 0.15, zr[1]], [D - sg * 0.01, 0.5, zr[1]]]); ctx.fillStyle = lit ? '#e0402e' : '#9a2a22'; ctx.fill();
      ctx.strokeStyle = rgba('#f0c040', 0.8); ctx.lineWidth = Math.max(0.4 * s, 0.012 * kc); ctx.beginPath(); for (var j = 0; j < 6; j++) { var yy = lerp(dh - 0.3, 0.65, j / 5), q = L.P(D, yy, (zr[0] + zr[1]) / 2); ctx.moveTo(q[0] - 0.02 * kc, q[1]); ctx.lineTo(q[0] + 0.02 * kc, q[1] + 0.03 * kc); } ctx.stroke(); });
    // the tall threshold
    quad(ctx, L, [[D, 0, dz0], [D, 0.22, dz0], [D, 0.22, dz1], [D, 0, dz1]]); ctx.fillStyle = '#5a2a1e'; ctx.fill();
    // two hexagonal door pins in the lintel, painted with gold flowers
    [zc - dw * 0.45, zc + dw * 0.45].forEach(function (zp) { var q = L.P(F - sg * 0.05, dh + 0.15, zp), R = Math.max(1.2 * s, 0.13 * L.k(zp));
      ctx.fillStyle = lit ? '#2a5a8a' : '#1e3a5a'; ctx.beginPath(); for (var j = 0; j < 6; j++) { var an = j / 6 * TAU; ctx.lineTo(q[0] + Math.cos(an) * R * 0.55, q[1] + Math.sin(an) * R); } ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#e8b840'; ctx.lineWidth = Math.max(0.4 * s, R * 0.12); ctx.stroke(); ctx.fillStyle = '#f0c850'; ctx.beginPath(); ctx.arc(q[0], q[1], R * 0.3, 0, TAU); ctx.fill(); });
    // drum stones on either side of the door, and two stone steps
    [dz0 - 0.18, dz1 + 0.12].forEach(function (zs) { var q = L.P(F - sg * 0.25, 0.55, zs), R = Math.max(1.5 * s, 0.3 * L.k(zs)), bq = L.P(F - sg * 0.25, 0, zs);
      ctx.fillStyle = lit ? '#a8a296' : '#6e7078'; ctx.fillRect(q[0] - R * 0.5, q[1] + R * 0.4, R, bq[1] - q[1] - R * 0.4);
      ctx.fillStyle = rg(ctx, q[0] + (lit ? -1 : 1) * R * 0.3, q[1] - R * 0.3, R * 0.1, R * 1.1, lit ? [[0, '#f0ebe0'], [1, '#9a948a']] : [[0, '#a8aab0'], [1, '#5a5c64']]); ctx.beginPath(); qell(ctx, q[0], q[1], R * 0.42, R * 0.6, 0); ctx.fill(); ink(ctx, s, 0.3, 0.5); });
    [[0.18, 0.55], [0.09, 0.3]].forEach(function (st, j) { quad(ctx, L, [[F - sg * st[1], st[0], dz0 - 0.25], [F, st[0], dz0 - 0.25], [F, st[0], dz1 + 0.25], [F - sg * st[1], st[0], dz1 + 0.25]]); ctx.fillStyle = lit ? '#d4ccbc' : '#8a8c92'; ctx.fill();
      quad(ctx, L, [[F - sg * st[1], 0, dz0 - 0.25], [F - sg * st[1], st[0], dz0 - 0.25], [F - sg * st[1], st[0], dz1 + 0.25], [F - sg * st[1], 0, dz1 + 0.25]]); ctx.fillStyle = lit ? '#b0a898' : '#6a6c72'; ctx.fill(); });
    // the gate roof: eave soffit with rafter ends (seen from below), a row of round tile ends, and the gable end facing us
    var eX = F - sg * 0.55, eY = WH + 0.55, rX = WX + sg * 0.3, rY = WH + 1.35, za = z0 - 0.35, zb = z1 + 0.35;
    quad(ctx, L, [[F, WH + 0.4, z0], [eX, eY, za], [eX, eY, zb], [F, WH + 0.4, z1]]); ctx.fillStyle = lit ? '#3a2e2a' : '#262428'; ctx.fill();
    ctx.strokeStyle = lit ? '#8a3020' : '#5a2018'; ctx.lineWidth = Math.max(0.6 * s, 0.05 * kc); ctx.beginPath(); for (var zr2 = za + 0.1; zr2 < zb; zr2 += 0.16) { var u0 = L.P(F, WH + 0.42, Math.max(z0, Math.min(z1, zr2))), u1 = L.P(eX, eY, zr2); ctx.moveTo(u0[0], u0[1]); ctx.lineTo(u1[0], u1[1]); } ctx.stroke();
    quad(ctx, L, [[eX, eY, za], [eX, eY + 0.16, za], [eX, eY + 0.16, zb], [eX, eY, zb]]); ctx.fillStyle = C.green; ctx.fill();
    ctx.fillStyle = C.tileDk; ctx.beginPath(); for (var zt = za; zt < zb; zt += 0.16) { var q3 = L.P(eX, eY + 0.16, zt), R3 = 0.06 * L.k(zt); ctx.moveTo(q3[0] + R3, q3[1]); ctx.arc(q3[0], q3[1], R3, 0, TAU); } ctx.fill();
    var gab = [[eX, eY + 0.16, za], [rX, rY, za], [rX + sg * 0.6, rY - 0.15, za], [rX + sg * 0.6, WH + 0.4, za], [WX, WH + 0.4, za]];
    quad(ctx, L, gab); ctx.fillStyle = lit ? '#8a8e96' : '#4a4e56'; ctx.fill(); ink(ctx, s, 0.45);
    // the tiled roof surface beyond the gable (it shows only because it sweeps up toward the ridge)
    quad(ctx, L, [[eX, eY + 0.16, za], [rX, rY, za], [rX, rY, zb], [eX, eY + 0.16, zb]]); ctx.fillStyle = lit ? '#6a7078' : '#454a52'; ctx.globalAlpha = 0.9; ctx.fill(); ctx.globalAlpha = 1;
    var g0 = L.P(rX, rY, za), g1 = L.P(rX, rY, zb), ke = L.k(za); ctx.strokeStyle = lit ? '#4a5058' : '#353a42'; ctx.lineWidth = Math.max(1 * s, 0.08 * ke); ctx.beginPath(); ctx.moveTo(g0[0], g0[1]); ctx.lineTo(g1[0], g1[1]); ctx.stroke();
    // the upturned ridge end
    ctx.fillStyle = C.tileDk; ctx.beginPath(); ctx.moveTo(g0[0], g0[1]); ctx.quadraticCurveTo(g0[0] - sg * 0.02 * ke, g0[1] - 0.16 * ke, g0[0] + sg * 0.09 * ke, g0[1] - 0.15 * ke); ctx.lineTo(g0[0] + sg * 0.05 * ke, g0[1] + 0.04 * ke); ctx.closePath(); ctx.fill();
    // the eave's shadow on the gate front
    if (lit) { quad(ctx, L, [[F, WH - 0.1, z0], [F, WH + 0.4, z0], [F, WH + 0.4, z1], [F, WH - 0.4, z1]]); ctx.fillStyle = 'rgba(40,30,40,0.35)'; ctx.fill(); }
    // two lanterns from the eave corners
    var lz = [za + 0.2, zb - 0.2]; G.lant = lz.map(function (zl) { var q = L.P(eX + sg * 0.05, eY - 0.55, zl); return [q[0], q[1], Math.max(2 * s, 0.22 * L.k(zl))]; });
    G.lant.forEach(function (q) { lantern(ctx, q[0], q[1], q[2], s, lit); });
  }
  function bicycle(ctx, x, y, R, s, col, lean) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(lean || 0);
    ctx.strokeStyle = '#2a2a34'; ctx.lineWidth = Math.max(0.7 * s, R * 0.12); ctx.beginPath(); ctx.arc(-R * 1.25, -R, R, 0, TAU); ctx.moveTo(R * 2.25, -R); ctx.arc(R * 1.25, -R, R, 0, TAU); ctx.stroke();
    ctx.strokeStyle = rgba('#2a2a34', 0.4); ctx.lineWidth = Math.max(0.3 * s, R * 0.03); ctx.beginPath(); for (var k = 0; k < 8; k++) { var a = k / 8 * PI; ctx.moveTo(-R * 1.25 + Math.cos(a) * R, -R + Math.sin(a) * R); ctx.lineTo(-R * 1.25 - Math.cos(a) * R, -R - Math.sin(a) * R); ctx.moveTo(R * 1.25 + Math.cos(a) * R, -R + Math.sin(a) * R); ctx.lineTo(R * 1.25 - Math.cos(a) * R, -R - Math.sin(a) * R); } ctx.stroke();
    ctx.strokeStyle = col; ctx.lineWidth = Math.max(0.8 * s, R * 0.16); ctx.beginPath(); ctx.moveTo(-R * 1.25, -R); ctx.lineTo(-R * 0.1, -R * 2.1); ctx.lineTo(R * 0.95, -R * 2.1); ctx.lineTo(R * 1.25, -R); ctx.moveTo(-R * 0.1, -R * 2.1); ctx.lineTo(R * 0.15, -R); ctx.lineTo(-R * 1.25, -R); ctx.moveTo(R * 0.15, -R); ctx.lineTo(R * 0.95, -R * 2.1); ctx.stroke();
    ctx.strokeStyle = '#2a2a34'; ctx.beginPath(); ctx.moveTo(R * 0.95, -R * 2.1); ctx.lineTo(R * 0.85, -R * 2.6); ctx.lineTo(R * 1.3, -R * 2.7); ctx.moveTo(-R * 0.1, -R * 2.1); ctx.lineTo(-R * 0.2, -R * 2.45); ctx.stroke();
    ctx.fillStyle = '#4a2e22'; ctx.fillRect(-R * 0.55, -R * 2.55, R * 0.7, R * 0.22);
    ctx.fillStyle = '#c8a050'; ctx.fillRect(R * 1.0, -R * 2.55, R * 0.9, R * 0.55); ctx.strokeStyle = '#8a6a30'; ctx.lineWidth = Math.max(0.3 * s, R * 0.05); ctx.strokeRect(R * 1.0, -R * 2.55, R * 0.9, R * 0.55);
    ctx.restore();
  }
  // a small figure at true scale (h metres tall) - a passer-by in the lane
  function figure(ctx, x, y, H, s, o) {
    var u = H / 7; ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = 'rgba(30,30,50,0.18)'; ctx.beginPath(); qell(ctx, u * 0.6, 0, u * 1.6, u * 0.3, 0); ctx.fill();
    ctx.fillStyle = o.pants; ctx.beginPath(); ctx.moveTo(-u * 0.7, -u * 3.4); ctx.lineTo(-u * 0.75, -u * 0.1); ctx.lineTo(-u * 0.2, -u * 0.1); ctx.lineTo(0, -u * 2.6); ctx.lineTo(u * 0.2, -u * 0.1); ctx.lineTo(u * 0.75, -u * 0.1); ctx.lineTo(u * 0.7, -u * 3.4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#2a2224'; ctx.fillRect(-u * 0.8, -u * 0.25, u * 0.65, u * 0.25); ctx.fillRect(u * 0.15, -u * 0.25, u * 0.65, u * 0.25);
    ctx.fillStyle = o.coat; ctx.beginPath(); ctx.moveTo(-u * 0.95, -u * 3.2); ctx.quadraticCurveTo(-u * 1.05, -u * 5.4, -u * 0.5, -u * 5.6); ctx.lineTo(u * 0.5, -u * 5.6); ctx.quadraticCurveTo(u * 1.05, -u * 5.4, u * 0.95, -u * 3.2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = o.skin; ctx.fillRect(-u * 0.18, -u * 5.9, u * 0.36, u * 0.4); ctx.beginPath(); qell(ctx, 0, -u * 6.35, u * 0.5, u * 0.58, 0); ctx.fill();
    ctx.fillStyle = o.hair; ctx.beginPath(); ctx.ellipse(0, -u * 6.55, u * 0.52, u * 0.42, 0, PI, TAU); ctx.fill();
    if (o.hat) { ctx.fillStyle = o.hat; ctx.beginPath(); ctx.ellipse(0, -u * 6.7, u * 0.56, u * 0.32, 0, PI, TAU); ctx.fill(); ctx.fillRect(-u * 0.7, -u * 6.72, u * 1.4, u * 0.12); }
    if (o.cage) { ctx.strokeStyle = '#6a4a2a'; ctx.lineWidth = Math.max(0.4 * s, u * 0.08); ctx.beginPath(); ctx.moveTo(u * 0.9, -u * 4.2); ctx.lineTo(u * 1.4, -u * 3.4); ctx.stroke(); ctx.fillStyle = '#c8a060'; ctx.beginPath(); ctx.ellipse(u * 1.5, -u * 2.6, u * 0.55, u * 0.8, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#7a5a30'; ctx.beginPath(); for (var k = -2; k <= 2; k++) { ctx.moveTo(u * 1.5 + k * u * 0.2, -u * 3.35); ctx.lineTo(u * 1.5 + k * u * 0.2, -u * 1.85); } ctx.stroke(); ctx.fillStyle = '#3a6ab8'; ctx.fillRect(u * 1.1, -u * 3.4, u * 0.8, u * 0.2); }
    ctx.restore();
  }
  // a rider seen from behind, sitting on the saddle and pedalling
  function rider(ctx, x, y, R, s, t) {
    var sx = x - R * 0.25, sy = y - R * 2.6, ph = t * 5;
    ctx.strokeStyle = '#2a2a34'; ctx.lineWidth = R * 0.32; ctx.lineCap = 'round';
    [0, PI].forEach(function (o) { var kx = x + Math.cos(ph + o) * R * 0.35, ky = y - R * 1.0 + Math.sin(ph + o) * R * 0.35; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo((sx + kx) / 2 + R * 0.3, (sy + ky) / 2 - R * 0.2); ctx.lineTo(kx, ky); ctx.stroke(); });
    ctx.fillStyle = '#2f8a6a'; ctx.beginPath(); ctx.moveTo(sx - R * 0.5, sy); ctx.quadraticCurveTo(sx - R * 0.6, sy - R * 1.6, sx + R * 0.2, sy - R * 2); ctx.lineTo(sx + R * 0.7, sy - R * 1.7); ctx.quadraticCurveTo(sx + R * 0.6, sy - R * 0.6, sx + R * 0.5, sy); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#2f8a6a'; ctx.lineWidth = R * 0.26; ctx.beginPath(); ctx.moveTo(sx + R * 0.4, sy - R * 1.7); ctx.lineTo(x + R * 1.05, y - R * 2.6); ctx.stroke();
    ctx.fillStyle = '#eec8a8'; ctx.beginPath(); qell(ctx, sx + R * 0.35, sy - R * 2.35, R * 0.36, R * 0.4, 0); ctx.fill(); ctx.fillStyle = '#1a1416'; ctx.beginPath(); ctx.ellipse(sx + R * 0.3, sy - R * 2.45, R * 0.38, R * 0.32, 0, PI, TAU); ctx.fill();
  }
  // a string of small lanterns hung across the lane
  function lanternString(ctx, L, Z, Y) {
    var s = L.s, a = L.P(WL + 0.1, Y, Z), b = L.P(WR - 0.1, Y, Z), sag = 0.5 * L.k(Z), n = 9;
    ctx.strokeStyle = '#3a2a24'; ctx.lineWidth = Math.max(0.6 * s, 0.02 * L.k(Z)); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + sag * 2, b[0], b[1]); ctx.stroke();
    L.stringL = [];
    for (var i = 1; i < n; i++) { var t = i / n, x = lerp(a[0], b[0], t), y = lerp(a[1], b[1], t) + 4 * sag * t * (1 - t), R = 0.13 * L.k(Z); lantern(ctx, x, y + R * 1.9, R, s, true); L.stringL.push([x, y + R * 1.9, R]); }
  }

  /* ---------------- trees ---------------- */
  // ginkgo leaf: a little fan with a notch, on a short stalk
  function fanPath(ctx, x, y, R, a, sq) {
    var c = Math.cos(a), sn = Math.sin(a), px = -sn, py = c, i;
    if (sq) { sn *= sq; py *= sq; } // squashed flat, for leaves lying on the paving
    var bx = x - c * R * 0.15, by = y - sn * R * 0.15;
    ctx.moveTo(bx, by);
    var pts = [[-0.62, 0.78], [-0.38, 1.02], [0, 0.92], [0.38, 1.02], [0.62, 0.78]];
    ctx.lineTo(x + c * R * 0.78 * 0.8 + px * R * -0.62, y + sn * R * 0.78 * 0.8 + py * R * -0.62);
    for (i = 1; i < pts.length; i++) { var p0 = pts[i - 1], p1 = pts[i], mx = (p0[0] + p1[0]) / 2, my = Math.max(p0[1], p1[1]) * 1.06;
      ctx.quadraticCurveTo(x + c * R * my + px * R * mx, y + sn * R * my + py * R * mx, x + c * R * p1[1] + px * R * p1[0], y + sn * R * p1[1] + py * R * p1[0]); }
    ctx.closePath();
  }
  // a cheaper fan for the thousands of small leaves in the crown: two straight edges and one curved top
  function fanLite(ctx, x, y, R, a) {
    var c = Math.cos(a), sn = Math.sin(a), px = -sn * R, py = c * R, cx = c * R, cy = sn * R;
    ctx.moveTo(x, y); ctx.lineTo(x + cx * 0.75 - px * 0.62, y + cy * 0.75 - py * 0.62);
    ctx.quadraticCurveTo(x + cx * 1.25, y + cy * 1.25, x + cx * 0.75 + px * 0.62, y + cy * 0.75 + py * 0.62); ctx.closePath();
  }
  /* the old ginkgo: a thick furrowed trunk on the left, limbs that climb and spread, and a crown built from hundreds of
     leaf clusters on short shoots. The Sun is behind it on the upper left, so the crown's edges glow and its heart is amber. */
  function ginkgo(ctx, L) {
    var w = L.w, h = L.h, s = L.s, r = rng(7711), i, j;
    var base = L.P(-1.85, 0, 8.4), bx = base[0], by = base[1], k = L.k(8.4), tw = 0.95 * k;
    // a ring of old bricks around the foot of the tree, heaped with fallen leaves
    var rg0 = L.P(-2.5, 0, 7.2), rg1 = L.P(-1.0, 0.35, 9.4);
    // roots spreading into the paving, the shade of the trunk on the stones
    ctx.fillStyle = 'rgba(40,40,60,0.28)'; ctx.beginPath(); qell(ctx, bx + tw * 0.6, by + 3 * s, tw * 1.3, tw * 0.12, 0.04); ctx.fill();
    ctx.fillStyle = '#2e2420'; ctx.beginPath(); ctx.moveTo(bx - tw * 0.6, by); ctx.quadraticCurveTo(bx - tw * 0.9, by + tw * 0.05, bx - tw * 1.1, by + tw * 0.08); ctx.lineTo(bx - tw * 0.3, by + tw * 0.06); ctx.moveTo(bx + tw * 0.4, by); ctx.quadraticCurveTo(bx + tw * 0.8, by + tw * 0.04, bx + tw * 1.15, by + tw * 0.1); ctx.lineTo(bx + tw * 0.2, by + tw * 0.07); ctx.fill();
    // the trunk and limbs, drawn as tapering, slightly bent strokes in screen space
    var limbs = [], kp = function (x0, y0, x1, y1, w0, w1, bend) { limbs.push([x0, y0, x1, y1, w0, w1, bend]); };
    var tx = bx + tw * 0.2, ty = h * 0.26;
    kp(bx, by + 2 * s, tx, ty, tw, tw * 0.62, -tw * 0.25);
    var tips = [];
    function grow(x, y, ang, len, wd, depth) {
      var x1 = x + Math.cos(ang) * len, y1 = y + Math.sin(ang) * len; kp(x, y, x1, y1, wd, wd * 0.6, (r() - 0.5) * len * 0.25);
      if (depth <= 0 || wd < 1.2 * s) { tips.push([x1, y1, len]); return; }
      var n = depth > 2 ? 3 : 2; for (var q = 0; q < n; q++) { var na = ang + (q - (n - 1) / 2) * (0.55 + r() * 0.3) + (r() - 0.5) * 0.3; na = lerp(na, -PI / 2, 0.15); grow(x1, y1, na, len * (0.6 + r() * 0.2), wd * 0.62, depth - 1); }
      if (r() < 0.85) tips.push([lerp(x, x1, 0.55), lerp(y, y1, 0.55), len * 0.6]);
    }
    grow(tx, ty, -PI * 0.5 - 0.15, h * 0.11, tw * 0.42, 3);
    grow(tx, ty + h * 0.03, -PI * 0.16, h * 0.09, tw * 0.3, 2);
    grow(tx - tw * 0.2, ty + h * 0.04, -PI * 0.92, h * 0.08, tw * 0.3, 2);
    grow(tx + tw * 0.1, ty - h * 0.04, -PI * 0.36, h * 0.12, tw * 0.32, 3);
    grow(tx + tw * 0.1, ty + h * 0.06, -PI * 0.02, h * 0.07, tw * 0.22, 2);
    // the crown: leaf clusters around each tip; build them all first, then paint from back to front by tone
    var LV = [[], [], [], [], [], []], MS = [];
    tips.forEach(function (t) {
      var R = clamp(t[2] * 0.95, 28 * s, 84 * s);
      for (var c = 0; c < 2; c++) {
        var cx = t[0] + (r() - 0.5) * R * 0.9, cy = t[1] + (r() - 0.6) * R * 0.7, cr = R * (0.5 + r() * 0.4), n = Math.min(180, Math.round(cr * cr / (s * s) * 0.1));
        MS.push([cx, cy + cr * 0.1, cr * 0.62]);

        for (var q = 0; q < n; q++) {
          var a = r() * TAU, d = Math.sqrt(r()), px = cx + Math.cos(a) * d * cr, py = cy + Math.sin(a) * d * cr * 0.8;
          // tone: edge facing the Sun glows, the underside and heart are deeper amber; some randomness
          var ex = (px - cx) / cr, ey = (py - cy) / cr, toS = (-ex * 0.7 - ey * 0.7), v = 0.42 + toS * 0.3 + (d > 0.75 ? 0.22 : 0) + (r() - 0.5) * 0.45 - (py > h * 0.24 ? 0.15 : 0);
          var b = v < 0.15 ? 0 : v < 0.35 ? 1 : v < 0.55 ? 2 : v < 0.75 ? 3 : v < 0.95 ? 4 : 5;
          LV[b].push([px, py, (3 + r() * 2.2) * s, -PI * 0.5 + (r() - 0.5) * 2.4]);
        }
      }
    });
    // limbs: behind the leaves, dark and furrowed
    ctx.save();
    ctx.lineCap = 'round';
    limbs.forEach(function (l, li) { if (li === 0) { K.trunkPath(ctx, l[0], l[1], l[2], l[3], l[4], l[5], l[6]); ctx.fillStyle = lg(ctx, bx - tw, 0, bx + tw, 0, [[0, '#5a4636'], [0.45, '#3a2c24'], [1, '#22181a']]); ctx.fill(); return; }
      ctx.strokeStyle = '#33261f'; ctx.lineWidth = (l[4] + l[5]) * 0.5; ctx.beginPath(); ctx.moveTo(l[0], l[1]); ctx.quadraticCurveTo((l[0] + l[2]) / 2 + l[6] * 0.3, (l[1] + l[3]) / 2, l[2], l[3]); ctx.stroke(); });
    // bark furrows on the trunk, and the sunlit edge
    K.trunkPath(ctx, limbs[0][0], limbs[0][1], limbs[0][2], limbs[0][3], limbs[0][4], limbs[0][5], limbs[0][6]); ctx.save(); ctx.clip();
    batch(ctx, 220, [['#1a1214', 1.2 * s, 0.5], ['#7a6250', 0.9 * s, 0.4]], function () { var yy = lerp(ty, by, r()), xx = lerp(tx, bx, (yy - ty) / (by - ty)) + (r() - 0.5) * tw * 1.1, l = (6 + r() * 18) * s; return [xx, yy, xx + (r() - 0.5) * 2 * s, yy + l, r() < 0.6 ? 0 : 1]; });
    ctx.fillStyle = lg(ctx, bx - tw * 0.55, 0, bx + tw * 0.05, 0, [[0, 'rgba(255,214,140,0.6)'], [0.5, 'rgba(255,214,140,0.15)'], [1, 'rgba(255,214,140,0)']]); ctx.fillRect(0, 0, w, h);
    batch(ctx, 140, [['#8a7058', 1.6 * s, 0.35], ['#140e10', 1.8 * s, 0.45]], function () { var yy = lerp(ty, by, r()), xx = lerp(tx, bx, (yy - ty) / (by - ty)) + (r() - 0.5) * tw * 0.9, l = (14 + r() * 30) * s; return [xx, yy, xx + (r() - 0.5) * 3 * s, yy + l, r() < 0.4 ? 0 : 1, xx + (r() - 0.5) * 4 * s, yy + l * 0.5]; });
    ctx.restore();
    ctx.restore();
    var pal = C.leaf;
    // the dense heart of each cluster, so the crown reads as foliage rather than confetti
    ctx.fillStyle = '#9a6a14'; ctx.globalAlpha = 0.85; ctx.beginPath(); MS.forEach(function (m) { for (var q = 0; q < 4; q++) { var a = q * 1.7 + m[0] * 0.01; qell(ctx, m[0] + Math.cos(a) * m[2] * 0.35, m[1] + Math.sin(a) * m[2] * 0.25, m[2] * 0.55, m[2] * 0.42, a); } }); ctx.fill(); ctx.globalAlpha = 1;
    for (j = 0; j < 6; j++) { ctx.fillStyle = pal[j]; ctx.beginPath(); for (i = 0; i < LV[j].length; i++) { var q2 = LV[j][i]; fanLite(ctx, q2[0], q2[1], q2[2], q2[3]); } ctx.fill(); }
    // light through the crown: a warm glow at the Sun-side edge
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; softGlow(ctx, w * 0.05, h * 0.05, w * 0.45, '#ffd860', 0.16); ctx.restore();
    L.crownTips = tips;
  }
  // a persimmon tree over the right-hand wall: nearly bare branches hung with orange fruit
  function persimmon(ctx, L) {
    var s = L.s, r = rng(8811), i, base = L.P(WR + 1.6, WH + 0.2, 31), k = L.k(31);
    ctx.strokeStyle = '#3e2c24'; ctx.lineCap = 'round';
    var br = [];
    function grow(x, y, a, len, wd, d) { var x1 = x + Math.cos(a) * len, y1 = y + Math.sin(a) * len; ctx.lineWidth = wd; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo((x + x1) / 2 + (r() - 0.5) * len * 0.3, (y + y1) / 2, x1, y1); ctx.stroke(); br.push([x, y, x1, y1]);
      if (d > 0) for (var q = 0; q < 2; q++) grow(x1, y1, a + (q ? 0.5 : -0.5) + (r() - 0.5) * 0.4, len * 0.68, wd * 0.62, d - 1); }
    grow(base[0], base[1] + 0.4 * k, -PI * 0.5, 1.6 * k, 0.16 * k, 3); grow(base[0], base[1], -PI * 0.78, 1.5 * k, 0.12 * k, 3);
    dabs(ctx, 90, [['#8a8a3a', 0.85], ['#b0903a', 0.8], ['#c86a2a', 0.8]], function () { var b = br[(r() * br.length) | 0], t = 0.4 + r() * 0.6; return [lerp(b[0], b[2], t) + (r() - 0.5) * 6 * s, lerp(b[1], b[3], t) + (r() - 0.5) * 5 * s, (1.6 + r() * 1.6) * s, (0.8 + r()) * s, (r() * 3) | 0, r() * PI]; });
    L.fruit = [];
    for (i = 0; i < 26; i++) { var b2 = br[3 + (i % (br.length - 3))], t2 = 0.5 + r() * 0.5, fx = lerp(b2[0], b2[2], t2), fy = lerp(b2[1], b2[3], t2) + 2.4 * s, fr = (0.07 + r() * 0.03) * k;
      ctx.fillStyle = rg(ctx, fx - fr * 0.35, fy - fr * 0.35, fr * 0.1, fr * 1.1, [[0, '#ffc070'], [0.55, '#f2801e'], [1, '#b8460e']]); ctx.beginPath(); ctx.arc(fx, fy, fr, 0, TAU); ctx.fill();
      ctx.fillStyle = '#4a5a2a'; ctx.fillRect(fx - fr * 0.45, fy - fr * 1.05, fr * 0.9, fr * 0.32); L.fruit.push([fx, fy, fr]); }
  }
  // fallen ginkgo leaves on the paving: a golden drift under the tree and along the wall feet, thinning down the lane
  function fallenLeaves(ctx, L) {
    var s = L.s, r = rng(6615), B = [[], [], [], [], [], []], i;
    for (i = 0; i < 2600; i++) {
      var Z = L.Zn + Math.pow(r(), 1.7) * (ZEND - L.Zn), X;
      var pick = r(); X = pick < 0.35 ? lerp(-2.4, -0.2, Math.pow(r(), 0.6)) : pick < 0.55 ? WR - Math.pow(r(), 2) * 1.2 : lerp(WL, WR, r());
      if (Z > 20 && r() < 0.5) continue;
      var p = L.P(X, 0, Z), k = L.k(Z), R = (0.045 + r() * 0.03) * k; if (R < 0.6 * s) { R = 0.6 * s; if (r() < 0.6) continue; }
      var inSh = X < L.shX, b = (r() * 4 | 0) + (inSh ? 0 : 2); b = Math.min(5, b);
      B[b].push([p[0], p[1], R, r() * TAU]);
    }
    var pal = C.leaf;
    ctx.save();
    for (var j = 0; j < 6; j++) { ctx.fillStyle = pal[j]; ctx.globalAlpha = 0.95; ctx.beginPath(); B[j].forEach(function (q) { fanPath(ctx, q[0], q[1], q[2], q[3], 0.45); }); ctx.fill(); }
    ctx.restore();
  }

  function paint(ctx, w, h) {
    if (!bind()) return;
    var L = layout(w, h), s = L.s;
    sky(ctx, L); drumTower(ctx, L); rooftops(ctx, L); farStreet(ctx, L);
    paving(ctx, L); lanelight(ctx, L);
    houseRoofs(ctx, L, -1); houseRoofs(ctx, L, 1);
    persimmon(ctx, L);
    wall(ctx, L, -1); wall(ctx, L, 1);
    // gates from far to near
    L.gates.slice().sort(function (A, B) { return B.z0 - A.z0; }).forEach(function (G) { gate(ctx, L, G); });
    lanternString(ctx, L, 30, 3.7);
    // bicycles leaning on the walls, a resident with a birdcage, a neighbour sweeping leaves
    var b1 = L.P(WL + 0.35, 0, 15.5); bicycle(ctx, b1[0], b1[1], 0.33 * L.k(15.5), s, '#2f6a7a', 0);
    var b2 = L.P(WR - 0.4, 0, 33.5); bicycle(ctx, b2[0], b2[1], 0.33 * L.k(33.5), s, '#b8322c', 0);
    var p1 = L.P(-0.6, 0, 31); figure(ctx, p1[0], p1[1], 1.68 * L.k(31), s, { coat: '#3d5a8a', pants: '#2a2a34', skin: '#e8c4a4', hair: '#d8d4dc', hat: '#2a2a30', cage: true });
    var p2 = L.P(2.1, 0, 46); figure(ctx, p2[0], p2[1], 1.6 * L.k(46), s, { coat: '#c8402e', pants: '#3a3a44', skin: '#eec8a8', hair: '#1a1416' });
    fallenLeaves(ctx, L);
    ginkgo(ctx, L);
    finish(ctx, w, h, '#ffd8a0', 0.07, 0.16, 0.025, '#1a1420', 0.45);
  }

  function overlay(ctx, w, h, t) {
    if (!bind()) return;
    var L = layout(w, h), s = L.s, i;
    ctx.save();
    // pigeons circling the Drum Tower (Beijing flocks carry little whistles)
    ctx.strokeStyle = 'rgba(50,50,70,.75)'; ctx.lineWidth = 1 * s; ctx.lineCap = 'round';
    var T = L.towerTop || [w * 0.5, h * 0.15];
    for (i = 0; i < 11; i++) { var a = t * 0.32 + i * 0.3, rx = w * 0.3, ry = h * 0.045, px = T[0] + Math.cos(a) * rx, py = T[1] - h * 0.015 + Math.sin(a) * ry + Math.sin(t + i) * 2 * s; drawBird(ctx, px, py, (2.2 + (Math.sin(a) + 1) * 0.6) * s, t * 6 + i); }
    // steam from the breakfast stall at the end of the lane
    if (L.stall) { var r0 = rng(31); for (i = 0; i < 6; i++) { var ph = (t * 0.25 + i / 6) % 1, sx = L.stall[0] + Math.sin(t + i * 2) * 3 * s + ph * 6 * s; ctx.globalAlpha = 0.35 * Math.sin(ph * PI); K.puff(ctx, sx, L.stall[1] - ph * 26 * s, (4 + ph * 10) * s, '#ffffff', 0.8); } ctx.globalAlpha = 1; }
    // the lanterns glow and sway a little
    var gl = glowSpr('#ff9a6a');
    if (gl) { var all = []; L.gates.forEach(function (G) { if (G.lant) all = all.concat(G.lant); }); all = all.concat(L.stringL || []);
      all.forEach(function (q, j) { ctx.globalAlpha = 0.22 + 0.08 * Math.sin(t * 2 + j); var z = q[2] * 3.2; ctx.drawImage(gl, q[0] - z + Math.sin(t * 1.1 + j) * q[2] * 0.15, q[1] - z, z * 2, z * 2); }); ctx.globalAlpha = 1; }
    // a cyclist riding away down the lane
    var cp = (t * 0.03) % 1, cz = lerp(16, ZEND + 4, cp), cx2 = L.P(0.9, 0, cz), ck = L.k(cz);
    if (cz < ZEND + 3) { bicycle(ctx, cx2[0], cx2[1], 0.33 * ck, s, '#e8b048', 0); rider(ctx, cx2[0], cx2[1], 0.33 * ck, s, t); }
    // the little delivery robot rolling up the sunny side of the lane toward us
    var rp = 1 - ((t * 0.02 + 0.4) % 1), rz = lerp(11, 50, rp), q2 = L.P(2.1, 0, rz), rk = L.k(rz), u = 0.28 * rk;
    ctx.fillStyle = 'rgba(30,30,50,0.2)'; ctx.beginPath(); qell(ctx, q2[0] + u * 0.6, q2[1], u * 1.6, u * 0.25, 0); ctx.fill();
    ctx.fillStyle = '#f4f6fb'; ctx.beginPath(); rrect(ctx, q2[0] - u, q2[1] - u * 1.55, u * 2, u * 1.25, u * 0.35); ctx.fill(); ink(ctx, s, 0.45);
    ctx.fillStyle = '#16b3a6'; ctx.fillRect(q2[0] - u, q2[1] - u * 1.05, u * 2, u * 0.16);
    ctx.fillStyle = '#2a2a34'; ctx.beginPath(); ctx.arc(q2[0] - u * 0.62, q2[1] - u * 0.22, u * 0.24, 0, TAU); ctx.arc(q2[0] + u * 0.62, q2[1] - u * 0.22, u * 0.24, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#9aa6c0'; ctx.lineWidth = Math.max(0.4 * s, u * 0.06); ctx.beginPath(); ctx.moveTo(q2[0] + u * 0.6, q2[1] - u * 1.55); ctx.lineTo(q2[0] + u * 0.7, q2[1] - u * 2.2); ctx.stroke();
    var fl = glowSpr('#7ff7e4', true); if (fl) { ctx.globalAlpha = 0.6 + 0.4 * Math.sin(t * 5); ctx.drawImage(fl, q2[0] + u * 0.7 - u * 0.4, q2[1] - u * 2.2 - u * 0.4, u * 0.8, u * 0.8); ctx.globalAlpha = 1; }
    // ginkgo leaves drifting down, turning over as they fall
    var r = rng(91), pal = C.leaf;
    for (i = 0; i < 26; i++) { var sp = 0.04 + r() * 0.04, p = (t * sp + r()) % 1, x0 = r() * w * 0.95, x = x0 + Math.sin(t * 1.3 + i) * 16 * s + p * 40 * s, y = lerp(h * 0.05, h * 0.97, p), R = (2.4 + r() * 2.2) * s * (0.8 + p * 0.6);
      ctx.save(); ctx.translate(x, y); ctx.scale(1, 0.35 + 0.65 * Math.abs(Math.sin(t * 2.2 + i))); ctx.fillStyle = pal[2 + (i % 4)]; ctx.beginPath(); fanPath(ctx, 0, 0, R, t * (1 + r()) + i); ctx.fill(); ctx.restore(); }
    // one small drone far off over the roofs
    var dp = (t * 0.018) % 1; K.drawDrone(ctx, lerp(w * 1.05, -w * 0.05, dp), h * 0.36 + Math.sin(t) * 3 * s, 1.2 * s, '#f4f6fb', Math.pow(Math.max(0, Math.sin(t * 4)), 6), '#7ff7e4');
    ctx.restore();
  }

  PAINT.beijing = { focus: { x: 0.47, y: 0.2 }, track: 'morning', anchors: { tower: { x: 0.47, y: 0.22 }, gate: { x: 0.86, y: 0.55 } },
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
