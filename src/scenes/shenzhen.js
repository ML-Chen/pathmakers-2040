/* scenes/shenzhen.js - the robot factory zone of Shenzhen's Special Economic Zone in 2040 (uses window.CHINA_KIT).
   PAINT.shenzhen. We stand on the factory's test-yard terrace, high above the zone, in pale hazy light. An industrial
   Special Economic Zone, after the AI 2040 reference art (docs/DESIGN_NOTES.md, "Three kinds of places"): on the left a
   gigantic stepped strip mine, a man-made canyon cut into the hills, with robot haul trucks on its benches; on the right
   a robot factory the size of a town (long halls with sawtooth roofs, white domes and one tall control tower) with
   almost no people; solar fields running to the horizon; rail lines curving in with a long freight train. Beyond it all,
   the green hills that were left alone and Shenzhen Bay with its long bridge. The test yard in front has yellow safety
   lines, a big red stop pedestal, a public board showing the zone's robot permits under their cap, and a test crew of
   three construction robots. Flat, graphic and slightly retro, with fine linework. The lower third stays calm. */
(function () {
  'use strict';
  var PAINT = (window.PAINT = window.PAINT || {});
  var K, PI = Math.PI, TAU = PI * 2;
  var rng, lerp, mix, rgba, lg, rg, S, poly, rrect, softGlow, haze, finish, batch, dots, dabs, rects, skyStrokes, cloudForm, qell, clump, fbm;
  function bind() {
    if (K) return true; K = window.CHINA_KIT; if (!K) return false;
    rng = K.rng; lerp = K.lerp; mix = K.mix; rgba = K.rgba; lg = K.lg; rg = K.rg; S = K.S; poly = K.poly; rrect = K.rrect; softGlow = K.softGlow; haze = K.haze;
    finish = K.finish; batch = K.batch; dots = K.dots; dabs = K.dabs; rects = K.rects; skyStrokes = K.skyStrokes; cloudForm = K.cloudForm; qell = K.qell; clump = K.clump; fbm = K.fbm;
    return true;
  }
  var C = { line: '#4a3e38', sky: [[0, '#c6d6d8'], [0.5, '#e6e4d4'], [0.85, '#f4ead2'], [1, '#f6e4c4']], rock: ['#c8885a', '#b0704a', '#d8a072', '#8e5a3e', '#e8c094'],
    hill: ['#7aa07a', '#5e8a64', '#9ab888'], sea: ['#a8c4c8', '#8ab0b8'], hall: ['#e8e6e0', '#c8c8c4', '#a8aab0'], solar: ['#4a5a7a', '#6a7a98', '#8a9ab4'], yard: ['#d8d4cc', '#c4beb4', '#aaa498'] };
  function ink(ctx, s, a) { ctx.strokeStyle = rgba(C.line, a || 0.45); ctx.lineWidth = 0.7 * s; ctx.lineJoin = 'round'; ctx.stroke(); }

  var LM = null;
  function layout(w, h) {
    var key = w + 'x' + h; if (LM && LM.key === key) return LM;
    var s = S(w, h), L = { key: key, s: s, w: w, h: h };
    L.hz = h * 0.4; L.plain = h * 0.43; L.terrace = h * 0.69; L.dy = h * 0.05;
    L.mine = { x: w * 0.25, y: h * 0.485, rx: w * 0.4, ry: h * 0.08 };
    L.tower = { x: w * 0.78, base: h * 0.5, H: h * 0.27 };
    LM = L; return L;
  }

  function sky(ctx, L) {
    var w = L.w, h = L.h, s = L.s, r = rng(3101);
    ctx.fillStyle = lg(ctx, 0, 0, 0, L.hz + L.dy, C.sky); ctx.fillRect(0, 0, w, L.hz + L.dy + 2);
    skyStrokes(ctx, -20 * s, w + 20 * s, 0, L.hz, C.sky, 160, r, s, 0.1, '#fff4dc', '#a8c0c4');
    softGlow(ctx, w * 0.82, h * 0.1, w * 0.9, '#fffaf0', 0.4); softGlow(ctx, w * 0.82, h * 0.1, 30 * s, '#ffffff', 0.85);
    ctx.strokeStyle = rgba('#ffffff', 0.3); ctx.lineWidth = 0.6 * s; ctx.beginPath(); for (var k = 0; k < 10; k++) { var yy = L.hz - (8 + k * k * 2.2) * s; ctx.moveTo(0, yy); ctx.lineTo(w, yy); } ctx.stroke();
    cloudForm(ctx, w * 0.3, h * 0.12, w * 0.4, h * 0.025, r, { lit: '#fffaf0', mid: '#f0ece0', shade: '#d4d4cc', top: '#f4f2e8', al: 0.7, lx: 0.8, ly: -0.6, q: 0.5, seam: 0.06 });
  }
  // the bay and its bridge on the right, green hills behind, and the far solar fields
  function distance(ctx, L) {
    var w = L.w, h = L.h, s = L.s, r = rng(3202), hz = L.hz, i;
    // far hills across the bay, pale with distance
    K.ridge(ctx, -2, w + 2, 3 * s, function (x) { return hz - h * (0.02 + 0.03 * fbm(x / w * 3 + 4, 331, 4)); }, hz + 2 * s, mix(C.hill[2], C.sky[1][1], 0.6));
    // the bay
    ctx.fillStyle = lg(ctx, 0, hz - 2 * s, 0, hz + 10 * s, [[0, C.sea[0]], [1, C.sea[1]]]); ctx.fillRect(w * 0.42, hz - 2 * s, w * 0.6, 12 * s);
    ctx.strokeStyle = rgba('#ffffff', 0.5); ctx.lineWidth = 0.6 * s; ctx.beginPath(); for (i = 0; i < 20; i++) { var x = w * (0.45 + r() * 0.55), y = hz + r() * 9 * s; ctx.moveTo(x, y); ctx.lineTo(x + (4 + r() * 10) * s, y); } ctx.stroke();
    // the long bay bridge with its leaning single tower and fans of cables
    var by = hz + 2 * s; ctx.strokeStyle = '#8a8e96'; ctx.lineWidth = 1.2 * s; ctx.beginPath(); ctx.moveTo(w * 0.5, by); ctx.lineTo(w * 1.02, by - 3 * s); ctx.stroke();
    var px = w * 0.8, ptop = by - 18 * s; ctx.lineWidth = 1.6 * s; ctx.beginPath(); ctx.moveTo(px, by - 1.5 * s); ctx.lineTo(px - 2 * s, ptop); ctx.stroke();
    ctx.lineWidth = 0.4 * s; ctx.beginPath(); for (i = 1; i <= 7; i++) { ctx.moveTo(px - 2 * s, ptop + i * 1.4 * s); ctx.lineTo(px - i * 6 * s, by - 1 * s); ctx.moveTo(px - 2 * s, ptop + i * 1.4 * s); ctx.lineTo(px + i * 6 * s, by - 2 * s); } ctx.stroke();
    // green hills on the left that were left as they were, and two skyline needles of the old city far off
    K.ridge(ctx, -2, w * 0.55, 3 * s, function (x) { var u = x / w; return hz + 2 * s - h * (0.05 * Math.exp(-Math.pow((u - 0.12) / 0.14, 2)) + 0.025 * fbm(u * 5, 341, 4)); }, hz + 8 * s, C.hill[0]);
    dabs(ctx, 200, [[C.hill[1], 0.6], [C.hill[2], 0.55], ['#4a7a54', 0.5]], function () { var x = r() * w * 0.55, y = hz - r() * h * 0.05; return [x, y, (2 + r() * 4) * s, (1.2 + r() * 1.5) * s, (r() * 3) | 0, 0]; });
    ctx.fillStyle = mix('#9aa4b0', C.sky[1][1], 0.4);
    [[0.6, 40], [0.64, 30], [0.68, 52], [0.71, 26]].forEach(function (b) { var x = w * b[0], bh = b[1] * s; ctx.beginPath(); ctx.moveTo(x - 2.4 * s, hz); ctx.lineTo(x - 1.6 * s, hz - bh); ctx.lineTo(x, hz - bh - 6 * s); ctx.lineTo(x + 1.6 * s, hz - bh); ctx.lineTo(x + 2.4 * s, hz); ctx.closePath(); ctx.fill(); });
    haze(ctx, -w * 0.2, hz - h * 0.04, w * 1.2, hz + h * 0.02, '#f4ecd8', 0.45);
  }
  // the plain of the zone: solar fields in long rows to the horizon, rail lines curving in
  function plain(ctx, L) {
    var w = L.w, h = L.h, s = L.s, hz = L.hz, r = rng(3303), i;
    ctx.fillStyle = lg(ctx, 0, hz + 4 * s, 0, L.terrace, [[0, '#d8c8a8'], [1, '#c8b08a']]); ctx.fillRect(0, hz + 4 * s, w, L.terrace - hz);
    for (var q = 0; q < 8; q++) { var yq = lerp(hz + 5 * s, hz + 30 * s, Math.pow(q / 8, 1.5)); ctx.fillStyle = q % 2 ? C.solar[0] : C.solar[2]; ctx.fillRect(0, yq, w * 0.45, (0.6 + q * 0.4) * s); }
    // solar fields: bands of blue panels, finer with distance
    for (i = 0; i < 14; i++) { var t = i / 14, y = lerp(hz + 6 * s, h * 0.56, Math.pow(t, 1.6)), th = (0.8 + t * 3.2) * s;
      ctx.fillStyle = i % 2 ? C.solar[0] : C.solar[1]; ctx.fillRect(w * 0.45, y, w * 0.6, th);
      ctx.fillStyle = rgba('#e8f0ff', 0.25); ctx.fillRect(w * 0.45, y, w * 0.6, th * 0.25); }
    ctx.fillStyle = rgba('#d8c8a8', 0.5); for (i = 0; i < 8; i++) ctx.fillRect(w * (0.47 + i * 0.07), hz + 6 * s, 1.2 * s, h * 0.16);
    haze(ctx, w * 0.3, hz, w * 1.2, hz + h * 0.04, '#f0e8d4', 0.4);
    // rail lines sweeping in from the left and on toward the factory
    ctx.strokeStyle = '#6a5e54'; ctx.lineWidth = 0.9 * s;
    for (var k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(-10 * s, h * (0.565 + k * 0.012)); ctx.bezierCurveTo(w * 0.3, h * (0.575 + k * 0.012), w * 0.55, h * (0.53 + k * 0.01), w * 1.05, h * (0.505 + k * 0.009)); ctx.stroke(); }
    L.rail = function (t, k) { var u = 1 - t, x0 = -10 * s, x1 = w * 0.3, x2 = w * 0.55, x3 = w * 1.05, y0 = h * (0.565 + k * 0.012), y1 = h * (0.575 + k * 0.012), y2 = h * (0.53 + k * 0.01), y3 = h * (0.505 + k * 0.009);
      return [u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3, u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3]; };
  }
  // the strip mine: a stepped canyon of benches, lit from the upper right
  function mine(ctx, L) {
    var M = L.mine, s = L.s, r = rng(3404), n = 9, i;
    function contour(k) { var t = k / n, pts = []; for (var a = 0; a <= 48; a++) { var th = a / 48 * TAU, wob = 1 + 0.06 * Math.sin(th * 3 + k) + 0.04 * Math.sin(th * 5 + 2);
        pts.push([M.x + Math.cos(th) * M.rx * (1 - t * 0.84) * wob - t * M.rx * 0.06, M.y + Math.sin(th) * M.ry * (1 - t * 0.84) * wob + t * M.ry * 0.95]); } return pts; }
    var dh = M.ry * 0.09;
    function shift(pts, dy) { return pts.map(function (p) { return [p[0], p[1] + dy]; }); }
    for (i = 0; i < n; i++) {
      var pts = contour(i), t = i / n;
      // the bench wall (in shade, deeper is darker), then the flat bench below it, which shows only on the far side
      poly(ctx, pts); ctx.fillStyle = lg(ctx, M.x - M.rx, 0, M.x + M.rx, 0, [[0, mix(C.rock[0], C.rock[3], 0.2 + t * 0.6)], [1, mix(C.rock[1], '#5a3424', 0.3 + t * 0.6)]]); ctx.fill();
      ctx.save(); poly(ctx, pts); ctx.clip();
      poly(ctx, shift(contour(i + 0.02), dh)); ctx.fillStyle = lg(ctx, M.x - M.rx, 0, M.x + M.rx, 0, [[0, mix(C.rock[4], C.rock[2], 0.3 + t * 0.4)], [0.6, mix(C.rock[2], C.rock[0], t * 0.6)], [1, mix(C.rock[0], C.rock[3], t * 0.5)]]); ctx.fill();
      ctx.restore();
      poly(ctx, pts); ink(ctx, s, 0.3);
    }
    // layered rock streaks on the bench walls
    batch(ctx, 260, [[rgba(C.rock[3], 1), 0.6 * s, 0.3], [rgba(C.rock[4], 1), 0.6 * s, 0.35]], function () { var a = r() * TAU, rr = Math.sqrt(r()), x = M.x + Math.cos(a) * M.rx * rr * 0.9, y = M.y + Math.sin(a) * M.ry * rr * 0.9; return [x, y, x + (3 + r() * 6) * s, y, r() < 0.5 ? 0 : 1]; });
    // a pool of water on the floor, and robot haul trucks on the benches (they move in the overlay)
    var f = shift(contour(n - 0.4), dh * 1.4); poly(ctx, f); ctx.fillStyle = '#8ab0b0'; ctx.fill(); ink(ctx, s, 0.3);
    L.benches = []; for (i = 1; i < n - 1; i += 2) L.benches.push(contour(i + 0.3));
    // spoil heaps and a conveyor running from the rim toward the factory
    ctx.strokeStyle = '#5a5054'; ctx.lineWidth = 1.4 * s; ctx.beginPath(); ctx.moveTo(M.x + M.rx * 0.55, M.y - M.ry * 0.4); ctx.lineTo(L.w * 0.58, L.h * 0.475); ctx.stroke();
    ctx.lineWidth = 0.5 * s; ctx.beginPath(); for (i = 0; i < 12; i++) { var u = i / 11, x0 = lerp(M.x + M.rx * 0.55, L.w * 0.58, u), y0 = lerp(M.y - M.ry * 0.4, L.h * 0.475, u); ctx.moveTo(x0, y0); ctx.lineTo(x0, y0 + 4 * s); } ctx.stroke();
  }
  // the factory: long halls with sawtooth roofs, white domes and the control tower
  function factory(ctx, L) {
    var w = L.w, h = L.h, s = L.s, i, r = rng(3505);
    var halls = [[0.5, 0.455, 0.2, 0.018], [0.72, 0.448, 0.26, 0.02], [0.6, 0.48, 0.3, 0.026], [0.88, 0.47, 0.22, 0.024], [0.68, 0.515, 0.36, 0.032]];
    for (i = 0; i < halls.length; i++) { var x = w * halls[i][0], y = h * halls[i][1], hw = w * halls[i][2], hh = h * halls[i][3];
      ctx.beginPath(); ctx.rect(x - hw / 2, y - hh, hw, hh); ctx.fillStyle = lg(ctx, 0, y - hh, 0, y, [[0, C.hall[0]], [1, C.hall[1]]]); ctx.fill(); ink(ctx, s, 0.4);
      // sawtooth roof with north-light glazing
      var nT = Math.round(hw / (7 * s)), tw = hw / nT; ctx.beginPath();
      for (var k = 0; k < nT; k++) { var x0 = x - hw / 2 + k * tw; ctx.moveTo(x0, y - hh); ctx.lineTo(x0 + tw * 0.75, y - hh - tw * 0.45); ctx.lineTo(x0 + tw, y - hh - tw * 0.45); ctx.lineTo(x0 + tw, y - hh); }
      ctx.fillStyle = C.hall[2]; ctx.fill(); ink(ctx, s, 0.35);
      ctx.fillStyle = rgba(C.solar[0], 0.8); for (k = 0; k < nT; k++) { var x1 = x - hw / 2 + k * tw; ctx.beginPath(); ctx.moveTo(x1, y - hh); ctx.lineTo(x1 + tw * 0.75, y - hh - tw * 0.45); ctx.lineTo(x1 + tw * 0.62, y - hh - tw * 0.45); ctx.lineTo(x1 - tw * 0.1, y - hh); ctx.fill(); }
      // big bay doors along the front
      ctx.fillStyle = '#6a7078'; for (k = 0; k < 4; k++) ctx.fillRect(x - hw / 2 + hw * (0.1 + k * 0.22), y - hh * 0.75, hw * 0.1, hh * 0.75);
      ctx.fillStyle = '#f0b020'; ctx.fillRect(x - hw / 2, y - hh * 0.92, hw, 0.8 * s);
    }
    // domes
    [[0.55, 0.505, 22], [0.62, 0.507, 14], [0.94, 0.5, 18]].forEach(function (d) { var x = w * d[0], y = h * d[1], R = d[2] * s;
      ctx.beginPath(); ctx.moveTo(x - R, y); ctx.bezierCurveTo(x - R, y - R * 0.9, x + R, y - R * 0.9, x + R, y); ctx.closePath();
      ctx.fillStyle = lg(ctx, x - R, 0, x + R, 0, [[0, '#ffffff'], [0.6, '#e4e4e0'], [1, '#bcbcb8']]); ctx.fill(); ink(ctx, s, 0.4);
      ctx.strokeStyle = rgba('#a0a0a0', 0.5); ctx.lineWidth = 0.5 * s; ctx.beginPath(); for (var k = 1; k < 4; k++) { ctx.moveTo(x - R * (1 - k * 0.1), y - R * k * 0.17); ctx.quadraticCurveTo(x, y - R * k * 0.24, x + R * (1 - k * 0.1), y - R * k * 0.17); } ctx.stroke(); });
    // the control tower: a slim shaft with a ringed cab and a mast
    var T = L.tower, tx = T.x, tb = T.base, tt = tb - T.H;
    ctx.beginPath(); ctx.moveTo(tx - 6 * s, tb); ctx.lineTo(tx - 3.2 * s, tt + 20 * s); ctx.lineTo(tx + 3.2 * s, tt + 20 * s); ctx.lineTo(tx + 6 * s, tb); ctx.closePath();
    ctx.fillStyle = lg(ctx, tx - 6 * s, 0, tx + 6 * s, 0, [[0, '#f4f2ec'], [1, '#b8b8b4']]); ctx.fill(); ink(ctx, s, 0.45);
    ctx.beginPath(); qell(ctx, tx, tt + 18 * s, 14 * s, 5 * s, 0); ctx.fillStyle = '#e8e6e0'; ctx.fill(); ink(ctx, s, 0.45);
    ctx.beginPath(); ctx.rect(tx - 12 * s, tt + 8 * s, 24 * s, 9 * s); ctx.fillStyle = '#4a6a8a'; ctx.fill(); ink(ctx, s, 0.45);
    ctx.fillStyle = rgba('#cfe8ff', 0.6); ctx.fillRect(tx - 11 * s, tt + 9.5 * s, 22 * s, 2 * s);
    ctx.beginPath(); qell(ctx, tx, tt + 8 * s, 13 * s, 3.4 * s, 0); ctx.fillStyle = '#f4f2ec'; ctx.fill(); ink(ctx, s, 0.45);
    ctx.strokeStyle = '#8a8a8a'; ctx.lineWidth = 0.8 * s; ctx.beginPath(); ctx.moveTo(tx, tt + 5 * s); ctx.lineTo(tx, tt - 8 * s); ctx.stroke();
    L.towerTop = [tx, tt - 8 * s];
    // a few cranes and a robot yard of parked crews (tiny yellow dots in rows)
    dots(ctx, 120, [['#f0b020', 0.9], ['#ffffff', 0.8]], function (k) { var row = (k / 30) | 0, col = k % 30; return [w * (0.47 + col * 0.008), h * (0.545 + row * 0.006), 0.9 * s, (k % 5) ? 0 : 1]; });
  }
  // the test-yard terrace where we stand
  function terrace(ctx, L) {
    var w = L.w, h = L.h, s = L.s, y0 = L.terrace, r = rng(3606), i;
    // a glass balustrade at the terrace edge
    ctx.fillStyle = rgba('#dfeef2', 0.35); ctx.fillRect(0, y0 - 26 * s, w, 26 * s);
    ctx.strokeStyle = rgba('#ffffff', 0.7); ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.moveTo(0, y0 - 26 * s); ctx.lineTo(w, y0 - 26 * s); ctx.stroke();
    ctx.fillStyle = '#8a8e96'; for (i = 0; i <= 8; i++) ctx.fillRect(i * w / 8 - 1 * s, y0 - 26 * s, 2 * s, 26 * s);
    ctx.fillStyle = '#5a5e66'; ctx.fillRect(0, y0 - 27.5 * s, w, 2.4 * s);
    // the concrete floor
    ctx.fillStyle = lg(ctx, 0, y0, 0, h, [[0, C.yard[0]], [0.5, C.yard[1]], [1, C.yard[2]]]); ctx.fillRect(0, y0, w, h - y0);
    ctx.strokeStyle = rgba('#8a847a', 0.35); ctx.lineWidth = 0.7 * s; ctx.beginPath();
    for (i = -8; i <= 8; i++) { ctx.moveTo(w / 2 + i * w * 0.06, y0); ctx.lineTo(w / 2 + i * w * 0.22, h); }
    for (i = 1; i < 7; i++) { var yy = y0 + (h - y0) * Math.pow(i / 7, 1.6); ctx.moveTo(0, yy); ctx.lineTo(w, yy); } ctx.stroke();
    dabs(ctx, 400, [[C.yard[0], 0.25], [C.yard[2], 0.2]], function () { var p = r(), y = lerp(y0, h, p); return [r() * w, y, (2 + p * 8) * s, (0.6 + p * 1.6) * s, r() < 0.5 ? 0 : 1, 0]; });
    // yellow safety lines marking the test bay, and a hatched zone
    ctx.strokeStyle = '#f0b020'; ctx.lineWidth = 2.2 * s; ctx.beginPath(); ctx.moveTo(w * 0.18, y0 + 4 * s); ctx.lineTo(w * 0.02, h * 0.98); ctx.moveTo(w * 0.82, y0 + 4 * s); ctx.lineTo(w * 0.98, h * 0.98); ctx.moveTo(w * 0.18, y0 + 4 * s); ctx.lineTo(w * 0.82, y0 + 4 * s); ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.moveTo(w * 0.2, y0 + 6 * s); ctx.lineTo(w * 0.8, y0 + 6 * s); ctx.lineTo(w * 0.8, y0 + 16 * s); ctx.lineTo(w * 0.2, y0 + 16 * s); ctx.clip();
    ctx.strokeStyle = rgba('#2a2a30', 0.55); ctx.lineWidth = 2 * s; ctx.beginPath(); for (i = 0; i < 60; i++) { var x = w * 0.2 + i * 6 * s; ctx.moveTo(x, y0 + 16 * s); ctx.lineTo(x + 10 * s, y0 + 6 * s); } ctx.stroke(); ctx.restore();
    // the public permit board on the left
    var bx = w * 0.04, by = y0 - 84 * s, bw = 92 * s, bh = 52 * s;
    ctx.fillStyle = '#5a5e66'; ctx.fillRect(bx + bw * 0.45, by + bh, 4 * s, 34 * s);
    ctx.beginPath(); rrect(ctx, bx, by, bw, bh, 5 * s); ctx.fillStyle = '#1e2a3a'; ctx.fill(); ink(ctx, s, 0.6);
    ctx.fillStyle = '#7ff7e4'; ctx.font = '800 ' + (6.4 * s).toFixed(1) + 'px Nunito, sans-serif'; ctx.fillText('ROBOT PERMITS IN USE', bx + 6 * s, by + 11 * s);
    ctx.fillStyle = '#ffffff'; ctx.font = '800 ' + (13 * s).toFixed(1) + 'px Nunito, sans-serif'; ctx.fillText('41,860', bx + 6 * s, by + 28 * s);
    ctx.fillStyle = '#9ab0c8'; ctx.font = '700 ' + (6.4 * s).toFixed(1) + 'px Nunito, sans-serif'; ctx.fillText('CAP 42,000', bx + 54 * s, by + 27 * s);
    ctx.fillStyle = '#34445a'; ctx.fillRect(bx + 6 * s, by + 36 * s, bw - 12 * s, 6 * s); ctx.fillStyle = '#f0b020'; ctx.fillRect(bx + 6 * s, by + 36 * s, (bw - 12 * s) * 0.9967, 6 * s);
    ctx.fillStyle = '#9ab0c8'; ctx.font = '700 ' + (5 * s).toFixed(1) + 'px Nunito, sans-serif'; ctx.fillText('SHENZHEN ZONE 3 · LIVE', bx + 6 * s, by + 49 * s);
    // potted bougainvillea by the board
    var rf = rng(3707); ctx.fillStyle = '#7a6a5a'; ctx.fillRect(w * 0.88, y0 - 14 * s, 30 * s, 14 * s);
    clump(ctx, w * 0.88 + 15 * s, y0 - 22 * s, 18 * s, ['#7a1a4a', '#a8285e', '#d8407a', '#f0609a', '#ffa0c4'], rf, 0.6, -0.7, false, 1);
    ctx.fillStyle = lg(ctx, 0, h * 0.8, 0, h, [[0, rgba('#2a2420', 0)], [1, rgba('#2a2420', 0.16)]]); ctx.fillRect(0, h * 0.8, w, h * 0.2);
  }

  function paint(ctx, w, h) {
    if (!bind()) return;
    var L = layout(w, h);
    sky(ctx, L); ctx.save(); ctx.translate(0, L.dy); distance(ctx, L); plain(ctx, L); mine(ctx, L); factory(ctx, L); ctx.restore(); terrace(ctx, L);
    finish(ctx, w, h, '#ffe0b0', 0.08, 0.12, 0.03, '#2a2018', 0.45);
  }

  function overlay(ctx, w, h, t) {
    if (!bind()) return;
    var L = layout(w, h), s = L.s, i;
    ctx.save(); ctx.translate(0, L.dy);
    // haul trucks crawling along the mine benches
    if (L.benches) for (i = 0; i < L.benches.length; i++) { var B = L.benches[i], p = ((t * 0.01 * (1 + i * 0.3) + i * 0.27) % 1), k = Math.floor(p * (B.length - 1)), q = B[k];
      ctx.fillStyle = '#f0b020'; ctx.fillRect(q[0] - 2.4 * s, q[1] - 1.8 * s, 4.8 * s, 2 * s); ctx.fillStyle = '#5a4a3a'; ctx.fillRect(q[0] - 2.4 * s, q[1] - 2.8 * s, 3 * s, 1.2 * s); }
    // a long freight train sliding along the rails toward the factory
    if (L.rail) { var tp = (t * 0.02) % 1.4 - 0.2; for (i = 0; i < 16; i++) { var u = tp - i * 0.018; if (u < 0 || u > 1) continue; var a = L.rail(u, 1), b = L.rail(Math.min(1, u + 0.014), 1);
      ctx.strokeStyle = i ? '#7a8a9a' : '#e8e6e0'; ctx.lineWidth = 2.6 * s * (0.7 + u * 0.3); ctx.beginPath(); ctx.moveTo(a[0], a[1] - 1.4 * s); ctx.lineTo(b[0], b[1] - 1.4 * s); ctx.stroke(); } }
    // cargo drones between the halls, and a warning light on the tower
    for (i = 0; i < 4; i++) { var ph = t * (0.03 + i * 0.008) + i * 0.25, dx = w * (0.45 + 0.55 * ((ph % 1))), dy = h * (0.36 + i * 0.02) + Math.sin(t + i) * 3 * s; K.drawDrone(ctx, dx, dy, 1.4 * s, '#f4f6fb', Math.pow(Math.max(0, Math.sin(t * 4 + i)), 6), '#ff6a5a'); }
    if (L.towerTop) { var bl = Math.pow(Math.max(0, Math.sin(t * 1.8)), 8), sp = K.glowSpr('#ff4a3a', true); if (sp && bl > 0.02) { ctx.globalAlpha = bl; ctx.drawImage(sp, L.towerTop[0] - 5 * s, L.towerTop[1] - 5 * s, 10 * s, 10 * s); ctx.globalAlpha = 1; } }
    // dust drifting off the mine
    var r = rng(55); for (i = 0; i < 6; i++) { var dp = (t * 0.015 + r()) % 1; ctx.globalAlpha = 0.18 * Math.sin(dp * PI); K.puff(ctx, L.mine.x + (r() - 0.5) * L.mine.rx + dp * 40 * s, L.mine.y - dp * 30 * s, (14 + r() * 10) * s, '#f0d8b0', 0.8); } ctx.globalAlpha = 1;
    // heat shimmer lines on the solar fields
    ctx.strokeStyle = rgba('#ffffff', 0.25); ctx.lineWidth = 0.6 * s; ctx.beginPath(); for (i = 0; i < 6; i++) { var yy = L.hz + (8 + i * 6) * s, ph2 = t * 0.6 + i; ctx.moveTo(w * 0.5, yy); for (var x = w * 0.5; x < w; x += 8 * s) ctx.lineTo(x, yy + Math.sin(x * 0.05 / s + ph2) * 0.8 * s); } ctx.stroke();
    ctx.restore();
  }

  PAINT.shenzhen = { focus: { x: 0.82, y: 0.1 }, track: 'work', anchors: { mine: { x: 0.27, y: 0.48 }, tower: { x: 0.78, y: 0.3 }, board: { x: 0.16, y: 0.55 } },
    paint: function (ctx, w, h) { ctx.save(); try { paint(ctx, w, h); } catch (e) { PAINT._err = 'shenzhen: ' + String(e && e.stack || e); } finally { ctx.restore(); } },
    overlay: function (ctx, w, h, t) { ctx.save(); try { overlay(ctx, w, h, t); } catch (e) { PAINT._err = 'shenzhen overlay: ' + String(e && e.stack || e); } finally { ctx.restore(); } } };

  if (typeof LATE !== 'undefined') LATE.push(function () {
    if (typeof PROPS === 'undefined' || typeof PROPS_ART === 'undefined') return;
    // the big red stop pedestal in the test yard
    PROPS_ART.sz_stop = function () { return '<svg viewBox="0 0 70 96"><ellipse cx="35" cy="92" rx="24" ry="4" fill="rgba(0,0,0,.2)"/><g class="pa-body"><rect x="24" y="40" width="22" height="50" rx="4" fill="#f0b020" stroke="#6a4a10" stroke-width="2.4"/>' +
      '<path d="M24 52 h22 M24 64 h22 M24 76 h22" stroke="#2a2a30" stroke-width="4" opacity=".7"/><rect x="14" y="30" width="42" height="14" rx="4" fill="#3a3e48" stroke="#1a1a20" stroke-width="2"/>' +
      '<g class="pa-light"><ellipse cx="35" cy="28" rx="17" ry="9" fill="#e0302a" stroke="#7a1010" stroke-width="2.4"/><ellipse cx="30" cy="25" rx="6" ry="2.4" fill="#ff9a8a"/></g></g></svg>'; };
    // a small yellow construction robot from the test crew
    PROPS_ART.sz_bot = function () { return '<svg viewBox="0 0 70 90"><ellipse cx="35" cy="86" rx="24" ry="4" fill="rgba(0,0,0,.2)"/><g class="pa-body"><rect x="12" y="62" width="46" height="20" rx="6" fill="#3a3e48"/><circle cx="20" cy="80" r="6" fill="#1a1a20"/><circle cx="50" cy="80" r="6" fill="#1a1a20"/>' +
      '<rect x="14" y="30" width="42" height="34" rx="8" fill="#f0b020" stroke="#6a4a10" stroke-width="2.4"/><rect x="20" y="38" width="30" height="12" rx="5" fill="#2a2a30"/><g class="pa-eyes"><circle cx="28" cy="44" r="3" fill="#7ff7e4"/><circle cx="42" cy="44" r="3" fill="#7ff7e4"/></g>' +
      '<path d="M56 40 L66 30 L64 22" stroke="#6a6e78" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M60 20 l8 0 l-2 6z" fill="#6a6e78"/><rect x="18" y="54" width="34" height="4" fill="#ffffff" opacity=".8"/><circle class="pa-light" cx="35" cy="28" r="3.4" fill="#ff6a5a"/></g></svg>'; };
    PROPS.shenzhen = [
      { id: 'sz_stop', x: 13, y: 90, w: 50, sfx: 'click', fx: 'jiggle' },
      { id: 'sz_bot', x: 36, y: 86, w: 46, sfx: 'beep', fx: 'hop' },
      { id: 'sz_bot', x: 62, y: 88, w: 50, sfx: 'beep', fx: 'spin' },
      { id: 'person', x: 80, y: 84, w: 44, talk: 'shenzhen', look: { skin: '#eec8a8', shirt: '#ff8a2a', hair: '#141012' } },
      { id: 'plant', x: 93, y: 92, w: 44, sfx: 'rustle', fx: 'wiggle', burst: 'leaves' }
    ];
  });
})();
