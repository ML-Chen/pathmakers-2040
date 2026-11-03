/* scenes/shenzhen.js - the robot factory zone of Shenzhen's Special Economic Zone in 2040, at golden hour (uses window.CHINA_KIT).
   PAINT.shenzhen. We stand on the factory's test-yard terrace, high above the zone, looking across it toward Shenzhen
   Bay in golden-hour light, with the Sun low over the water. An industrial Special Economic Zone, after the AI 2040 reference art
   (docs/DESIGN_NOTES.md, "Three kinds of places"), beside the real city: the skyline of Shenzhen stands in the golden haze
   across the bay (the tall tapering Ping An Finance Center, the white ribbed "Spring Bamboo" tower by the water and many
   more), with the green hills that were left alone behind it and the long bay bridge running out over the water. In the
   zone below: rows of solar panels catching the glare, a terraced pit cut into red earth, a robot factory the size of a
   town (long halls with sawtooth roofs whose north-light glazing glows from inside), white domes, the slim zone tower,
   tower cranes and rail lines with freight trains. The Sun is ahead, so the fronts of the buildings are in warm shade and
   every shadow runs long toward us. The terrace in front has yellow safety lines, the public board showing the zone's robot
   permits under their cap, and a glass balustrade full of sunset. The lower third stays calm. */
(function () {
  'use strict';
  var PAINT = (window.PAINT = window.PAINT || {});
  var K, PI = Math.PI, TAU = PI * 2;
  var rng, lerp, mix, rgba, lg, rg, S, poly, rrect, softGlow, haze, finish, batch, dots, dabs, rects, qell, clump, fbm, clamp, smooth, glowSpr;
  function bind() {
    if (K) return true; K = window.CHINA_KIT; if (!K) return false;
    rng = K.rng; lerp = K.lerp; mix = K.mix; rgba = K.rgba; lg = K.lg; rg = K.rg; S = K.S; poly = K.poly; rrect = K.rrect; softGlow = K.softGlow; haze = K.haze;
    finish = K.finish; batch = K.batch; dots = K.dots; dabs = K.dabs; rects = K.rects; qell = K.qell; clump = K.clump; fbm = K.fbm; clamp = K.clamp; smooth = K.smooth; glowSpr = K.glowSpr;
    return true;
  }
  var C = { line: '#3a2a30', haze: '#f6c890', hazeHi: '#ffe2b0', shade: '#6a4a5a', rock: ['#c8744a', '#a85a3a', '#e09a62', '#7a3e30', '#f2bc82'], win: '#ffd27a',
    sky: [[0, '#4e5a8e'], [0.32, '#9a7f9e'], [0.6, '#e8a27e'], [0.82, '#ffc27a'], [1, '#ffe0a0']], yard: ['#c8b8a4', '#b4a08a', '#9a8670'] };
  function ink(ctx, s, a, wd) { ctx.strokeStyle = rgba(C.line, a == null ? 0.45 : a); ctx.lineWidth = (wd || 0.6) * s; ctx.lineJoin = 'round'; ctx.stroke(); }

  /* ---------------- camera: a long lens from the terrace, 236 m up; X right, Z away, Y up (metres) ---------------- */
  var CAM = 236;
  var LM = null;
  function layout(w, h) {
    var key = w + 'x' + h; if (LM && LM.key === key) return LM;
    var s = S(w, h), L = { key: key, s: s, w: w, h: h };
    L.f = h * 1.4; L.hz = h * 0.4; L.cx = w * 0.5;
    L.P = function (X, Y, Z) { return [L.cx + X * L.f / Z, L.hz + (CAM - Y) * L.f / Z]; };
    L.k = function (Z) { return L.f / Z; };
    L.sun = [w * 0.62, h * 0.318];
    L.shore = h * 0.448; L.far = h * 0.404; L.terrace = h * 0.63;
    L.mine = { x: -120, z: 2900, rx: 640, rz: 560, n: 14, d: 300 };
    // the factory: a town of long halls in rows, left clear around the pit
    var r = rng(4100), Z, X; L.halls = [];
    for (Z = 1950; Z < 4200; Z += 330 + r() * 60) for (X = -3200; X < 3200; X += 360 + r() * 140) {
      var lx = 220 + r() * 220, dz = 100 + r() * 70, xc = X + (r() - 0.5) * 60;
      if (Math.abs(xc - L.mine.x) < L.mine.rx + lx * 0.5 + 40 && Z < L.mine.z + L.mine.rz + 80) continue;
      if (Math.abs(xc - 60) < lx * 0.5 + 40 && Math.abs(Z - 4300) < 260) continue;
      if (r() < 0.12) continue;
      L.halls.push([xc, Z, lx, dz, 20 + r() * 18]); }
    L.domes = [[420, 2150, 44], [520, 2260, 30], [-760, 2250, 40], [980, 3500, 52], [-1500, 3300, 48]];
    L.cranes = [[-210, 2080, 150, 1], [190, 2350, 175, -1], [430, 3650, 170, 1], [-420, 3500, 140, -1], [-1300, 2500, 160, -1], [1400, 2100, 150, -1], [900, 2900, 160, 1]];
    L.tower = { x: 60, z: 4300, H: 520 };
    LM = L; return L;
  }
  function quad(ctx, L, pts) { ctx.beginPath(); for (var i = 0; i < pts.length; i++) { var p = L.P(pts[i][0], pts[i][1], pts[i][2]); if (!i) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); } ctx.closePath(); }
  // golden-hour haze: farther things melt into the warm air (a: 0 near .. 1 lost in haze)
  function hz(c, a) { return mix(c, C.haze, clamp(a, 0, 1)); }
  function hazeAt(Z) { return clamp((Z - 1500) / 7000, 0, 0.6); }

  /* ---------------- sky, Sun and clouds ---------------- */
  function sky(ctx, L) {
    var w = L.w, h = L.h, s = L.s, r = rng(3101), sx = L.sun[0], sy = L.sun[1];
    ctx.fillStyle = lg(ctx, 0, 0, 0, L.shore, C.sky); ctx.fillRect(0, 0, w, L.shore + 2);
    K.skyStrokes(ctx, -20 * s, w + 20 * s, 0, L.far, C.sky, 160, r, s, 0.08, '#ffd8a8', '#8a8ab8');
    // the great warm bloom around the low Sun
    softGlow(ctx, sx, sy, w * 1.2, '#ffd08a', 0.55); softGlow(ctx, sx, sy, w * 0.45, '#fff0c8', 0.6);
    // long strands of cloud lit from beneath, pink and gold
    [[0.3, 0.12, 0.7, 0.022, 0.85], [0.78, 0.07, 0.55, 0.016, 0.75], [0.15, 0.24, 0.45, 0.014, 0.8], [0.9, 0.2, 0.4, 0.012, 0.7], [0.55, 0.19, 0.35, 0.01, 0.6]].forEach(function (c, j) {
      K.streakCloud(ctx, w * c[0], h * c[1], w * c[2], h * c[3], r, { shade: mix('#8a6a8a', '#c890a0', j * 0.15), mid: '#e0a090', lit: '#ffc890', rim: '#fff0c0', al: c[4], n: 40, dir: 1 }); });
    // the Sun: a soft-edged disc sitting in the haze over the bay
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; softGlow(ctx, sx, sy, 60 * s, '#ffe8b0', 0.8); ctx.restore();
    ctx.fillStyle = rg(ctx, sx, sy, 0, 16 * s, [[0, '#fffbea'], [0.75, '#fff0c0'], [1, 'rgba(255,230,170,0)']]); ctx.beginPath(); ctx.arc(sx, sy, 16 * s, 0, TAU); ctx.fill();
    // rays through the haze
    K.shafts(ctx, sx, sy, w, h, '#ffe0a0', 0.05, 14, rng(3102), PI * 0.9, PI * 0.5, 0.01, 0.04);
  }

  /* ---------------- the far shore: hills and the skyline across the bay ---------------- */
  function hills(ctx, L) {
    var w = L.w, h = L.h, s = L.s, far = L.far;
    // three ranges of green hills, each paler and pinker with distance
    [[0.07, 0.5, '#b8a0a8', 0.85, 411], [0.05, 0.36, '#9a9898', 0.7, 412], [0.03, 0.22, '#6e8a72', 0.4, 413]].forEach(function (Rg, j) {
      K.ridge(ctx, -2, w + 2, 3 * s, function (x) { var u = x / w; return far + 1 * s - h * (Rg[0] * (0.35 + 0.65 * fbm(u * 3.2 + j * 2, Rg[4], 4)) * (0.6 + 0.4 * Math.exp(-Math.pow((u - (j === 1 ? 0.12 : 0.88)) / 0.25, 2)))); }, far + 3 * s, mix(Rg[2], C.haze, Rg[3] * 0.6));
    });
    var r = rng(414);
    dabs(ctx, 160, [['#5e7a62', 0.5], ['#7a9a72', 0.45]], function () { var x = r() * w, y = far - r() * h * 0.018; return [x, y, (2 + r() * 3) * s, (1 + r()) * s, (r() * 2) | 0, 0]; });
  }
  // a tower in the haze: tapering shaft (profile function), lit edge toward the Sun, faint window rows
  function towerShape(ctx, L, x, y0, H, W, prof, o) {
    var s = L.s, n = 24, i, pts = [];
    for (i = 0; i <= n; i++) { var t = i / n; pts.push([x - W * prof(t) * 0.5, y0 - H * t]); }
    for (i = n; i >= 0; i--) { var t2 = i / n; pts.push([x + W * prof(t2) * 0.5, y0 - H * t2]); }
    poly(ctx, pts); var lit = x < L.sun[0] ? 1 : -1;
    ctx.fillStyle = lg(ctx, x - W / 2, 0, x + W / 2, 0, lit > 0 ? [[0, o.c0], [0.75, o.c1], [1, o.rim]] : [[0, o.rim], [0.25, o.c1], [1, o.c0]]); ctx.fill();
    ctx.save(); poly(ctx, pts); ctx.clip();
    if (o.ribs) { ctx.strokeStyle = rgba(o.rib || '#ffffff', 0.3); ctx.lineWidth = 0.4 * s; ctx.beginPath(); for (var k = 1; k < o.ribs; k++) { var u = k / o.ribs - 0.5; for (var j = 0; j <= 12; j++) { var tt = j / 12, xx = x + u * W * prof(tt), yy = y0 - H * tt; if (!j) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy); } } ctx.stroke(); }
    // window glints facing the Sun
    ctx.fillStyle = rgba('#fff0c0', 0.5); var r = rng(Math.round(x * 13 + H)); for (var q = 0; q < H / (3 * s); q++) if (r() < 0.25) ctx.fillRect(x + lit * W * (0.1 + r() * 0.3), y0 - r() * H * 0.95, 1 * s, 0.6 * s);
    ctx.fillStyle = lg(ctx, 0, y0 - H * 0.3, 0, y0, [[0, rgba(C.haze, 0)], [1, rgba(C.haze, 0.55)]]); ctx.fillRect(x - W, y0 - H, W * 2, H);
    ctx.restore();
  }
  function skyline(ctx, L) {
    var w = L.w, h = L.h, s = L.s, y0 = L.far + 1 * s, r = rng(4401), i;
    var c0 = '#b08aa0', c1 = '#c69aa4', rim = '#ffe0b0';
    // a dense spread of ordinary towers, two depths
    for (var d = 0; d < 2; d++) for (i = 0; i < 46; i++) {
      var x = r() * w * 1.04 - w * 0.02, H2 = h * (0.012 + Math.pow(r(), 2.2) * (d ? 0.05 : 0.035)), W2 = (4 + r() * 9) * s;
      if (Math.abs(x - L.sun[0]) < 14 * s && d === 0) continue;
      var flat = r() < 0.7; towerShape(ctx, L, x, y0, H2, W2, flat ? function () { return 1; } : function (t) { return 1 - t * 0.35; }, { c0: mix(d ? '#c4a0aa' : '#d4b0b0', C.haze, 0.3), c1: mix(d ? c1 : '#dcb8b4', C.haze, 0.35), rim: rim, ribs: 0 });
    }
    // the "Spring Bamboo" tower: white, round, ribbed, tapering to a rounded tip, by the water on the right
    var bx = w * 0.8, bH = h * 0.135, bW = 16 * s;
    towerShape(ctx, L, bx, y0, bH, bW, function (t) { return t < 0.9 ? 1 - t * 0.32 : (1 - 0.9 * 0.32) * Math.sqrt(Math.max(0, 1 - (t - 0.9) / 0.1)); }, { c0: '#d8b8b8', c1: '#f0d4c8', rim: '#fff4dc', ribs: 9, rib: '#ffffff' });
    // Kingkey 100 (flat top with a curved crown) and a few more tall neighbours on the left
    towerShape(ctx, L, w * 0.18, y0, h * 0.11, 15 * s, function (t) { return t < 0.92 ? 1 : 1 - (t - 0.92) * 4; }, { c0: '#b490a4', c1: '#caa2aa', rim: rim, ribs: 4 });
    towerShape(ctx, L, w * 0.42, y0, h * 0.085, 12 * s, function (t) { return 1 - t * 0.2; }, { c0: '#b894a6', c1: '#cca6ac', rim: rim, ribs: 3 });
    towerShape(ctx, L, w * 0.95, y0, h * 0.07, 11 * s, function () { return 1; }, { c0: '#c09aa8', c1: '#d0aaae', rim: rim, ribs: 3 });
    // the Ping An Finance Center: the tallest, a tapering shaft with steel piers at its corners and a pointed crown
    var px = w * 0.3, pH = h * 0.215, pW = 20 * s;
    towerShape(ctx, L, px, y0, pH, pW, function (t) { return t < 0.78 ? 1 - t * 0.28 : t < 0.95 ? (1 - 0.78 * 0.28) * (1 - (t - 0.78) * 2.6) : (1 - 0.78 * 0.28) * (1 - 0.17 * 2.6) * (1 - (t - 0.95) * 18); }, { c0: '#a8869c', c1: '#c49cac', rim: '#ffe8c0', ribs: 6, rib: '#fff0d0' });
    ctx.strokeStyle = rgba('#fff0d0', 0.55); ctx.lineWidth = 0.8 * s; ctx.beginPath(); ctx.moveTo(px + pW * 0.48, y0); ctx.lineTo(px + pW * 0.36, y0 - pH * 0.76); ctx.stroke();
    L.pingan = [px, y0 - pH];
    haze(ctx, -w * 0.2, y0 - h * 0.05, w * 1.2, y0 + h * 0.01, C.haze, 0.35);
  }
  // Shenzhen Bay: the water reflecting the sky, a glittering path under the Sun, the long bridge and a few boats
  function bay(ctx, L) {
    var w = L.w, h = L.h, s = L.s, y0 = L.far, y1 = L.shore, r = rng(4501), i;
    ctx.fillStyle = lg(ctx, 0, y0, 0, y1, [[0, '#f2c08a'], [0.4, '#d8a08a'], [1, '#a87c88']]); ctx.fillRect(0, y0, w, y1 - y0);
    // reflected skyline smear
    ctx.fillStyle = rgba('#b08aa0', 0.25); ctx.fillRect(0, y0, w, (y1 - y0) * 0.18);
    // ripples
    batch(ctx, 260, [['#ffe0b0', 0.6 * s, 0.5], ['#8a6a7a', 0.5 * s, 0.35]], function () { var y = lerp(y0 + 1 * s, y1, Math.pow(r(), 1.3)), x = r() * w, l = (3 + r() * 10) * s * (0.4 + (y - y0) / (y1 - y0)); return [x, y, x + l, y, r() < 0.55 ? 0 : 1]; });
    // the glitter path under the Sun
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    var gx = L.sun[0]; ctx.fillStyle = lg(ctx, gx - w * 0.12, 0, gx + w * 0.12, 0, [[0, 'rgba(255,220,150,0)'], [0.5, 'rgba(255,230,170,0.35)'], [1, 'rgba(255,220,150,0)']]); ctx.fillRect(gx - w * 0.12, y0, w * 0.24, y1 - y0);
    for (i = 0; i < 160; i++) { var t = Math.pow(r(), 0.8), yy = lerp(y0 + 1 * s, y1, t), spread = (6 + t * 40) * s, xx = gx + (r() + r() - 1) * spread, l = (2 + r() * 6) * s * (0.5 + t); ctx.fillStyle = rgba('#fff6d8', 0.4 + r() * 0.5); ctx.fillRect(xx - l / 2, yy, l, 0.7 * s); }
    ctx.restore();
    // the bay bridge: a low deck curving out across the water with one leaning pylon and fans of cables
    var bL = [-0.05 * w, y0 + (y1 - y0) * 0.28], bR = [w * 1.05, y0 + (y1 - y0) * 0.12], pyx = w * 0.7;
    var deck = function (x) { var t = (x - bL[0]) / (bR[0] - bL[0]); return lerp(bL[1], bR[1], t) - Math.sin(t * PI) * 1.5 * s; };
    ctx.strokeStyle = mix('#7a6070', C.haze, 0.3); ctx.lineWidth = 1.4 * s; ctx.beginPath(); for (var x = bL[0]; x <= bR[0]; x += 4 * s) { if (x === bL[0]) ctx.moveTo(x, deck(x)); else ctx.lineTo(x, deck(x)); } ctx.stroke();
    ctx.strokeStyle = rgba('#5a4458', 0.4); ctx.lineWidth = 0.6 * s; ctx.beginPath(); for (x = bL[0]; x <= bR[0]; x += 9 * s) { ctx.moveTo(x, deck(x)); ctx.lineTo(x, deck(x) + 3 * s); } ctx.stroke();
    var top = [pyx - 3 * s, deck(pyx) - 24 * s]; ctx.strokeStyle = mix('#7a6070', C.haze, 0.25); ctx.lineWidth = 1.8 * s; ctx.beginPath(); ctx.moveTo(pyx, deck(pyx) + 2 * s); ctx.lineTo(top[0], top[1]); ctx.stroke();
    ctx.strokeStyle = rgba('#fff0d8', 0.45); ctx.lineWidth = 0.35 * s; ctx.beginPath(); for (i = 1; i <= 9; i++) { var tt = top[1] + i * 2 * s; ctx.moveTo(top[0] + i * 0.25 * s, tt); ctx.lineTo(pyx - i * 7 * s, deck(pyx - i * 7 * s)); ctx.moveTo(top[0] + i * 0.25 * s, tt); ctx.lineTo(pyx + i * 7 * s, deck(pyx + i * 7 * s)); } ctx.stroke();
    L.bridge = { L: bL, R: bR, deck: deck };
    // a few boats with bright wakes
    [[0.12, 0.6], [0.48, 0.45], [0.86, 0.7]].forEach(function (b) { var bx = w * b[0], by = lerp(y0, y1, b[1]); ctx.fillStyle = 'rgba(255,240,210,0.5)'; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx - 18 * s, by + 1.5 * s); ctx.lineTo(bx - 18 * s, by + 0.3 * s); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#5a4458'; ctx.fillRect(bx - 3 * s, by - 2 * s, 5 * s, 2 * s); ctx.fillStyle = '#e8e0d8'; ctx.fillRect(bx - 2 * s, by - 3 * s, 2.5 * s, 1.2 * s); });
    // the near shore: a band of mangrove green, then the land of the zone
    ctx.fillStyle = lg(ctx, 0, y1 - 2 * s, 0, y1 + 3 * s, [[0, '#6a7a5a'], [1, '#8a7a5a']]); ctx.fillRect(0, y1 - 1.5 * s, w, 4 * s);
    dabs(ctx, 180, [['#4e6a4e', 0.7], ['#6a8a5a', 0.6]], function () { return [r() * w, y1 - r() * 2 * s, (2 + r() * 4) * s, (1 + r() * 1.4) * s, (r() * 2) | 0, 0]; });
  }

  /* ---------------- the zone ---------------- */
  function groundPlane(ctx, L) {
    var w = L.w, h = L.h, s = L.s, y0 = L.shore, y1 = L.terrace, r = rng(4601), i;
    ctx.fillStyle = lg(ctx, 0, y0, 0, y1, [[0, '#d8a478'], [0.35, '#c48a64'], [1, '#a87058']]); ctx.fillRect(0, y0 + 1 * s, w, y1 - y0);
    // fields and lots in faint blocks, warm earth and paler concrete
    for (i = 0; i < 70; i++) { var Z = lerp(1500, 6500, Math.pow(r(), 0.8)), X = (r() - 0.5) * 5000, dz = 60 + r() * 200, dx = 80 + r() * 300; quad(ctx, L, [[X, 0, Z], [X + dx, 0, Z], [X + dx, 0, Z + dz], [X, 0, Z + dz]]); ctx.fillStyle = rgba(r() < 0.5 ? '#e8c098' : '#b07a5a', 0.25); ctx.fill(); }
    // roads: a straight highway and service roads, in warm grey
    ctx.strokeStyle = rgba('#8a7468', 0.8);
    [[-3000, 1600, 3000, 5200, 2.2], [-3000, 4200, 3000, 4000, 1.4], [-200, 1500, -150, 6000, 1.2]].forEach(function (R) { var a = L.P(R[0], 0, R[1]), b = L.P(R[2], 0, R[3]); ctx.lineWidth = R[4] * s; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); });
    L.road = [L.P(-3000, 0, 1600), L.P(3000, 0, 5200)];
  }
  // solar fields: long rows of panels tilted toward the Sun; from behind we see their edges catching the glare
  function solar(ctx, L) {
    var w = L.w, s = L.s, r = rng(4701), Z;
    for (Z = 6600; Z > 3700; Z -= Z > 5000 ? 70 : 50) {
      var k = L.k(Z), hh = Math.max(0.6 * s, 3.2 * k), y = L.P(0, 0, Z)[1], aH = hazeAt(Z);
      for (var seg = 0; seg < 3; seg++) {
        var X0 = [-4200, -700, 1500][seg], X1 = [-1700, 1100, 4200][seg];
        if (seg === 1 && Z < 4300) continue;
        var a = L.P(X0, 0, Z), b = L.P(X1, 0, Z);
        ctx.fillStyle = hz('#3a4a70', 0.25 + aH * 0.6); ctx.fillRect(a[0], y - hh, b[0] - a[0], hh);
        // the bright top edges, brightest in line with the Sun
        var g = lg(ctx, a[0], 0, b[0], 0, [[0, 'rgba(255,230,180,0.25)'], [clamp((L.sun[0] - a[0]) / Math.max(1, b[0] - a[0]), 0, 1), 'rgba(255,248,220,0.9)'], [1, 'rgba(255,230,180,0.25)']]);
        ctx.fillStyle = g; ctx.fillRect(a[0], y - hh, b[0] - a[0], Math.max(0.5 * s, hh * 0.3));
        // gaps between panel blocks
        ctx.fillStyle = hz('#a86a50', 0.4 + aH * 0.5); for (var x = a[0] + 30 * k; x < b[0]; x += 120 * k) ctx.fillRect(x, y - hh, Math.max(0.6 * s, 6 * k), hh);
      }
    }
  }
  // the terraced pit: benches stepping down into red earth, bench tops lit by the low Sun, risers in warm shade
  function mine(ctx, L) {
    var M = L.mine, s = L.s, i, r = rng(4801);
    L.benches = [];
    var aH = hazeAt(M.z) * 0.6;
    var ring = function (ff, YY, i) { var pts = []; for (var a = 0; a <= 40; a++) { var th = a / 40 * TAU, wob = 1 + 0.05 * Math.sin(th * 3 + i * 0.3) + 0.03 * Math.sin(th * 7 + 1); pts.push(L.P(M.x + Math.cos(th) * M.rx * ff * wob, YY, M.z + Math.sin(th) * M.rz * ff * wob)); } return pts; };
    var open = ring(1, 0, 0); ctx.save(); poly(ctx, open); ctx.fillStyle = hz(C.rock[2], aH); ctx.fill(); ctx.clip();
    for (i = 0; i < M.n; i++) {
      var f = 1 - i / M.n * 0.88, Y = -M.d * i / M.n, Y2 = -M.d * (i + 1) / M.n, t = i / M.n;
      var up = ring(f, Y, i), dn = ring(f, Y2, i);
      // the bench floor at this depth (deeper levels paint over its middle)
      poly(ctx, dn); ctx.fillStyle = hz(mix('#f2b67e', '#e0905e', t), aH); ctx.fill();
      // the riser: the far wall of this step faces us with the Sun behind it, so it stands in warm shade with layered strata
      var band = up.slice(0, 21).concat(dn.slice(0, 21).reverse()); poly(ctx, band); ctx.fillStyle = hz(mix('#a05a44', '#6a3438', t), aH); ctx.fill();
      ctx.save(); poly(ctx, band); ctx.clip(); ctx.strokeStyle = rgba('#5a2a2a', 0.3); ctx.lineWidth = 0.5 * s; ctx.beginPath();
      for (var q = 1; q < 3; q++) { var yy = lerp(Y, Y2, q / 3); var rr2 = ring(f, yy, i); for (var j = 0; j <= 20; j++) { if (!j) ctx.moveTo(rr2[j][0], rr2[j][1]); else ctx.lineTo(rr2[j][0], rr2[j][1]); } } ctx.stroke(); ctx.restore();
      // the lip of the step catches the low Sun
      ctx.strokeStyle = rgba('#ffe6b8', 0.85 - t * 0.4); ctx.lineWidth = 0.8 * s; ctx.beginPath(); for (j = 0; j <= 20; j++) { if (!j) ctx.moveTo(up[j][0], up[j][1]); else ctx.lineTo(up[j][0], up[j][1]); } ctx.stroke();
      var bq = ring(f - 0.04, Y2, i); if (i % 2 === 0 && bq[10][1] < open[30][1] - 3 * s) L.benches.push(bq.slice(4, 17));
    }
    ctx.restore();
    // the sunlit lip of the pit, and its near rim in shade
    ctx.strokeStyle = rgba('#fff0c8', 0.8); ctx.lineWidth = 1 * s; ctx.beginPath(); for (i = 0; i <= 20; i++) { if (!i) ctx.moveTo(open[i][0], open[i][1]); else ctx.lineTo(open[i][0], open[i][1]); } ctx.stroke();
    ctx.strokeStyle = rgba('#6a3a3a', 0.5); ctx.lineWidth = 1.2 * s; ctx.beginPath(); for (i = 20; i <= 40; i++) { if (i === 20) ctx.moveTo(open[i][0], open[i][1]); else ctx.lineTo(open[i][0], open[i][1]); } ctx.stroke();
    // a green pool at the bottom
    // a conveyor from the rim to the factory
    var c0 = L.P(M.x + M.rx * 0.8, 6, M.z - M.rz * 0.3), c1 = L.P(80, 14, 2300); ctx.strokeStyle = '#6a5054'; ctx.lineWidth = 1.4 * s; ctx.beginPath(); ctx.moveTo(c0[0], c0[1]); ctx.lineTo(c1[0], c1[1]); ctx.stroke();
    ctx.lineWidth = 0.5 * s; ctx.beginPath(); for (i = 0; i <= 14; i++) { var u = i / 14, xx = lerp(c0[0], c1[0], u), yy = lerp(c0[1], c1[1], u); ctx.moveTo(xx, yy); ctx.lineTo(xx, yy + 4 * s); } ctx.stroke();
    L.conveyor = [c0, c1];
  }
  // a long factory hall with a sawtooth roof: the north-light glazing faces us and glows from inside
  function hall(ctx, L, H) {
    var s = L.s, X = H[0], Z = H[1], lx = H[2], dz = H[3], ht = H[4], X0 = X - lx / 2, X1 = X + lx / 2, Z0 = Z, Z1 = Z + dz, aH = hazeAt(Z), i;
    // the long shadow it throws toward us
    quad(ctx, L, [[X0, 0, Z0], [X1, 0, Z0], [X1 + 10, 0, Z0 - ht * 6], [X0 + 10, 0, Z0 - ht * 6]]); ctx.fillStyle = rgba('#4a2a3e', 0.42 * (1 - aH)); ctx.fill();
    // side face (the one we can see), front face in warm shade
    var sideX = X0 > 0 ? X0 : X1;
    quad(ctx, L, [[sideX, 0, Z0], [sideX, ht, Z0], [sideX, ht, Z1], [sideX, 0, Z1]]); ctx.fillStyle = hz(sideX > 0 ? '#8a6a7a' : '#c8a090', aH); ctx.fill();
    quad(ctx, L, [[X0, 0, Z0], [X0, ht, Z0], [X1, ht, Z0], [X1, 0, Z0]]); ctx.fillStyle = hz('#5a3c52', aH * 0.8); ctx.fill();
    // rows of lit windows and open bay doors
    var a = L.P(X0, 0, Z0), b = L.P(X1, ht, Z0), fw = b[0] - a[0], fh = a[1] - b[1];
    ctx.fillStyle = hz(C.win, aH * 0.6); for (i = 0; i < Math.max(4, fw / (5 * s)); i++) { var wx = a[0] + fw * (i + 0.3) / Math.max(4, fw / (5 * s)); ctx.fillRect(wx, b[1] + fh * 0.22, Math.max(0.6 * s, fw * 0.012), Math.max(0.5 * s, fh * 0.1)); }
    for (i = 0; i < 4; i++) { var dx = a[0] + fw * (0.12 + i * 0.22); ctx.fillStyle = hz('#ffcf80', aH * 0.5); ctx.fillRect(dx, a[1] - fh * 0.55, fw * 0.09, fh * 0.55); ctx.fillStyle = rgba('#ff9a40', 0.25); ctx.fillRect(dx - fw * 0.02, a[1] - fh * 0.1, fw * 0.13, fh * 0.12); }
    // the sawtooth roof: each tooth's glazed face looks north, toward us
    var nT = Math.max(3, Math.round(dz / 18)), td = dz / nT;
    for (i = nT - 1; i >= 0; i--) { var za = Z0 + i * td, zb = za + td;
      quad(ctx, L, [[X0, ht, za], [X1, ht, za], [X1, ht + 9, za + td * 0.15], [X0, ht + 9, za + td * 0.15]]); ctx.fillStyle = hz('#ffd890', aH * 0.5); ctx.fill();
      quad(ctx, L, [[X0, ht + 9, za + td * 0.15], [X1, ht + 9, za + td * 0.15], [X1, ht, zb], [X0, ht, zb]]); ctx.fillStyle = hz(i % 2 ? '#e8d8cc' : '#dccabc', aH); ctx.fill(); }
    var e0 = L.P(X0, ht, Z0), e1 = L.P(X1, ht, Z0); ctx.strokeStyle = rgba('#fff0d0', 0.7 * (1 - aH)); ctx.lineWidth = 0.6 * s; ctx.beginPath(); ctx.moveTo(e0[0], e0[1]); ctx.lineTo(e1[0], e1[1]); ctx.stroke();
    ctx.fillStyle = '#f0b020'; ctx.fillRect(a[0], a[1] - fh * 0.92, fw, Math.max(0.5 * s, fh * 0.04));
  }
  function dome(ctx, L, D) {
    var s = L.s, p = L.P(D[0], 0, D[1]), R = D[2] * L.k(D[1]), aH = hazeAt(D[1]);
    quad(ctx, L, [[D[0] - D[2], 0, D[1]], [D[0] + D[2], 0, D[1]], [D[0] + D[2], 0, D[1] - D[2] * 5], [D[0] - D[2], 0, D[1] - D[2] * 5]]); ctx.fillStyle = rgba('#5a3a4a', 0.25); ctx.fill();
    ctx.beginPath(); ctx.moveTo(p[0] - R, p[1]); ctx.bezierCurveTo(p[0] - R, p[1] - R * 0.95, p[0] + R, p[1] - R * 0.95, p[0] + R, p[1]); ctx.closePath();
    ctx.fillStyle = lg(ctx, 0, p[1] - R * 0.7, 0, p[1], [[0, hz('#fff2dc', aH * 0.5)], [0.35, hz('#e8cfc0', aH)], [1, hz('#9a7a88', aH)]]); ctx.fill(); ink(ctx, s, 0.3);
    ctx.strokeStyle = rgba('#ffffff', 0.4); ctx.lineWidth = 0.5 * s; ctx.beginPath(); for (var k = 1; k < 4; k++) { ctx.moveTo(p[0] - R * (1 - k * 0.12), p[1] - R * k * 0.17); ctx.quadraticCurveTo(p[0], p[1] - R * k * 0.25, p[0] + R * (1 - k * 0.12), p[1] - R * k * 0.17); } ctx.stroke();
  }
  // a tower crane: lattice mast and jib against the glowing sky
  function crane(ctx, L, Cr) {
    var s = L.s, X = Cr[0], Z = Cr[1], H = Cr[2], d = Cr[3], k = L.k(Z), b = L.P(X, 0, Z), t = L.P(X, H, Z), mw = Math.max(1.4 * s, 2.4 * k), jl = H * 0.55 * k, i;
    var col = hz('#3e2a3a', hazeAt(Z) * 0.5);
    ctx.strokeStyle = col; ctx.lineWidth = Math.max(0.5 * s, 0.3 * k);
    ctx.beginPath(); ctx.moveTo(b[0] - mw / 2, b[1]); ctx.lineTo(t[0] - mw / 2, t[1]); ctx.moveTo(b[0] + mw / 2, b[1]); ctx.lineTo(t[0] + mw / 2, t[1]);
    for (var y = b[1]; y > t[1]; y -= mw) { ctx.moveTo(b[0] - mw / 2, y); ctx.lineTo(b[0] + mw / 2, y - mw); } ctx.stroke();
    // jib and counter-jib with their tie bars
    var jy = t[1], jx = t[0] + d * jl, cx2 = t[0] - d * jl * 0.35;
    ctx.lineWidth = Math.max(0.7 * s, 0.5 * k); ctx.beginPath(); ctx.moveTo(cx2, jy); ctx.lineTo(jx, jy); ctx.moveTo(cx2, jy + mw * 0.6); ctx.lineTo(jx, jy + mw * 0.3); ctx.stroke();
    ctx.lineWidth = Math.max(0.4 * s, 0.2 * k); ctx.beginPath(); for (i = 0; i < 16; i++) { var u = i / 16, xx = lerp(cx2, jx, u); ctx.moveTo(xx, jy); ctx.lineTo(xx + d * (jx - cx2) / 32, jy + mw * 0.45); }
    ctx.moveTo(t[0], jy - mw * 3); ctx.lineTo(jx, jy); ctx.moveTo(t[0], jy - mw * 3); ctx.lineTo(cx2, jy); ctx.moveTo(t[0], jy); ctx.lineTo(t[0], jy - mw * 3); ctx.stroke();
    ctx.fillStyle = col; ctx.fillRect(cx2 - mw * 0.4, jy, mw * 1.6 * -d * -1, mw * 1.2);
    ctx.fillStyle = '#f0b020'; ctx.fillRect(t[0] - mw * 0.7, jy + mw * 0.5, mw * 1.4, mw * 1.1);
    // the hook line and a load
    var hx = lerp(t[0], jx, 0.65); ctx.strokeStyle = col; ctx.lineWidth = 0.4 * s; ctx.beginPath(); ctx.moveTo(hx, jy + mw * 0.4); ctx.lineTo(hx, jy + H * 0.45 * k); ctx.stroke(); ctx.fillStyle = hz('#3a6a8a', 0.3); ctx.fillRect(hx - 3 * k, jy + H * 0.45 * k, 6 * k + 1 * s, 2.5 * k + 1 * s);
    Cr.tip = [t[0], jy - mw * 3]; Cr.jib = [jx, jy];
  }
  function zoneTower(ctx, L) {
    var s = L.s, T = L.tower, k = L.k(T.z), b = L.P(T.x, 0, T.z), t = L.P(T.x, T.H, T.z), w0 = 26 * k, w1 = 11 * k, aH = hazeAt(T.z);
    quad(ctx, L, [[T.x - 12, 0, T.z], [T.x + 12, 0, T.z], [T.x + 40, 0, T.z - T.H * 5], [T.x - 10, 0, T.z - T.H * 5]]); ctx.fillStyle = rgba('#5a3a4a', 0.22); ctx.fill();
    ctx.beginPath(); ctx.moveTo(b[0] - w0, b[1]); ctx.lineTo(t[0] - w1, t[1] + 40 * k); ctx.lineTo(t[0] + w1, t[1] + 40 * k); ctx.lineTo(b[0] + w0, b[1]); ctx.closePath();
    ctx.fillStyle = lg(ctx, b[0] - w0, 0, b[0] + w0, 0, [[0, hz('#fff0d0', 0.1)], [0.18, hz('#a07a8a', aH)], [0.8, hz('#8a6478', aH)], [1, hz('#ffe2b8', 0.1)]]); ctx.fill(); ink(ctx, s, 0.3);
    // the ringed cab: glass glowing with sunset, a white rim, a mast with a red light
    var cy = t[1] + 30 * k;
    ctx.fillStyle = hz('#f4ece4', aH * 0.5); ctx.beginPath(); qell(ctx, t[0], cy + 14 * k, 34 * k, 8 * k, 0); ctx.fill(); ink(ctx, s, 0.35);
    ctx.fillStyle = lg(ctx, t[0] - 30 * k, 0, t[0] + 30 * k, 0, [[0, '#8a6a8a'], [0.6, '#f0b880'], [1, '#fff0c8']]); ctx.fillRect(t[0] - 30 * k, cy - 6 * k, 60 * k, 18 * k);
    ctx.fillStyle = rgba('#fff8e0', 0.7); ctx.fillRect(t[0] - 28 * k, cy - 2 * k, 56 * k, 2 * k);
    ctx.fillStyle = hz('#f4ece4', aH * 0.5); ctx.beginPath(); qell(ctx, t[0], cy - 6 * k, 32 * k, 7 * k, 0); ctx.fill(); ink(ctx, s, 0.35);
    ctx.strokeStyle = hz('#8a7078', aH); ctx.lineWidth = Math.max(0.6 * s, 2 * k); ctx.beginPath(); ctx.moveTo(t[0], cy - 12 * k); ctx.lineTo(t[0], t[1] - 30 * k); ctx.stroke();
    L.towerTop = [t[0], t[1] - 30 * k];
  }
  function rails(ctx, L) {
    var s = L.s, w = L.w, i;
    // three tracks sweeping in from the left, past the pit and on to the factory yards
    L.railPts = [];
    for (var k = 0; k < 3; k++) {
      var pts = []; for (i = 0; i <= 60; i++) { var t = i / 60, X = lerp(-3400, 3400, t), Z = 1760 + k * 34 + 70 * Math.sin(t * PI * 1.3); pts.push(L.P(X, 0, Z)); }
      ctx.strokeStyle = rgba('#5a4448', 0.7); ctx.lineWidth = 0.8 * s; ctx.beginPath(); pts.forEach(function (p, j) { if (!j) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); }); ctx.stroke();
      ctx.strokeStyle = rgba('#ffe0b0', 0.4); ctx.lineWidth = 0.4 * s; ctx.beginPath(); pts.forEach(function (p, j) { if (!j) ctx.moveTo(p[0], p[1] - 0.5 * s); else ctx.lineTo(p[0], p[1] - 0.5 * s); }); ctx.stroke();
      L.railPts.push(pts);
    }
    // a gantry crane over the rail yard
    var g0 = L.P(1250, 0, 3600), g1 = L.P(1650, 0, 3600), gt = L.P(1250, 40, 3600), gt2 = L.P(1650, 40, 3600);
    ctx.strokeStyle = '#d89a30'; ctx.lineWidth = 1.2 * s; ctx.beginPath(); ctx.moveTo(g0[0], g0[1]); ctx.lineTo(gt[0], gt[1]); ctx.lineTo(gt2[0], gt2[1]); ctx.lineTo(g1[0], g1[1]); ctx.stroke();
  }
  // the front of the zone: container stacks by the rails, a yard of parked robot crews, light masts and charging canopies
  function frontYard(ctx, L) {
    var s = L.s, r = rng(4901), i;
    var cols = ['#c8402e', '#2a6a9a', '#e8a030', '#3a8a6a', '#e8e4dc', '#8a4a8a'];
    for (i = 0; i < 60; i++) {
      var X = (r() - 0.5) * 6400, Z = 1820 + r() * 120; if (Math.abs(X - L.mine.x) < 300 && r() < 0.6) continue;
      var nx = 1 + (r() * 3 | 0), ny = 1 + (r() * 3 | 0), k = L.k(Z), p = L.P(X, 0, Z), cw = 12 * k, ch = 2.6 * k;
      for (var a = 0; a < nx; a++) for (var b = 0; b < ny; b++) { var c = cols[(r() * cols.length) | 0], x = p[0] + a * cw * 1.02, y = p[1] - (b + 1) * ch;
        ctx.fillStyle = mix(c, '#5a3c52', 0.35); ctx.fillRect(x, y, cw, ch); ctx.fillStyle = rgba('#ffe8c0', 0.55); ctx.fillRect(x, y, cw, Math.max(0.4 * s, ch * 0.18)); }
      ctx.fillStyle = rgba('#4a2a3e', 0.3); ctx.fillRect(p[0], p[1], nx * cw, ch * ny * 2);
    }
    // robot crews parked in rows on a yard (small yellow machines with lit eyes)
    for (var row = 0; row < 4; row++) { var Z2 = 2050 + row * 45; for (i = 0; i < 40; i++) { var X2 = 700 + i * 22 + (row % 2) * 11; var q = L.P(X2, 0, Z2), kk = L.k(Z2) * 6; if (q[0] > L.w + 4) break;
      ctx.fillStyle = '#f0b020'; ctx.fillRect(q[0] - kk * 0.4, q[1] - kk * 0.6, kk * 0.8, kk * 0.6); ctx.fillStyle = '#7ff7e4'; ctx.fillRect(q[0] - kk * 0.2, q[1] - kk * 0.45, kk * 0.4, Math.max(0.4 * s, kk * 0.1)); } }
    for (row = 0; row < 3; row++) { Z2 = 2100 + row * 50; for (i = 0; i < 26; i++) { X2 = -1600 - i * 24; q = L.P(X2, 0, Z2); kk = L.k(Z2) * 6; if (q[0] < -4) break; ctx.fillStyle = '#f0b020'; ctx.fillRect(q[0] - kk * 0.4, q[1] - kk * 0.6, kk * 0.8, kk * 0.6); } }
    // light masts with their lamps already on
    L.lamps = [];
    for (i = 0; i < 9; i++) { var X3 = -2400 + i * 640 + (r() - 0.5) * 200, Z3 = 1990 + r() * 200, b0 = L.P(X3, 0, Z3), t0 = L.P(X3, 34, Z3); ctx.strokeStyle = '#4a3444'; ctx.lineWidth = Math.max(0.6 * s, 0.8 * L.k(Z3)); ctx.beginPath(); ctx.moveTo(b0[0], b0[1]); ctx.lineTo(t0[0], t0[1]); ctx.stroke(); L.lamps.push(t0); }
  }
  /* ---------------- the viewing terrace where we stand ----------------
     A landscaped forecourt on the factory roof, seen from its upper step (eye 6 m above the paving, a normal lens): big
     warm stone pavers still wet from a shower, so the puddles hold the golden sky; raised planters with grasses and
     bougainvillea, two royal palms framing the view, benches, a wayfinding sign, a cargo-tram track set into the paving
     and the glass balustrade at the far edge. The Sun is ahead, so everything throws a long shadow toward us and every top
     edge is rimmed with light. The nearest stones (the lower third) stay plain and soft for the dialogue. */
  var TE = 6; // eye height above the paving
  function plazaCam(L) {
    if (L.pz) return L.pz;
    var w = L.w, h = L.h, f = h * 0.9, cx = w * 0.5, hz = L.hz;
    var C2 = { f: f, cx: cx, hz: hz };
    C2.P = function (X, Y, Z) { return [cx + X * f / Z, hz + (TE - Y) * f / Z]; };
    C2.k = function (Z) { return f / Z; };
    C2.zr = TE * f / (L.terrace - hz);            // the balustrade (far edge of the plaza)
    C2.zn = TE * f / (h - hz) * 0.97;             // the bottom of the picture
    C2.xr = (w * 0.5 + 40 * L.s) / (f / C2.zr);   // half-width of the view at the balustrade, in metres
    C2.sdx = (L.sun[0] - cx) / L.f;               // shadows run toward us and a little away from the Sun's side
    L.pz = C2; return C2;
  }
  function pq(ctx, C2, pts) { ctx.beginPath(); for (var i = 0; i < pts.length; i++) { var p = C2.P(pts[i][0], pts[i][1], pts[i][2]); if (!i) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); } ctx.closePath(); }
  // a long ground shadow from a footprint [x0, x1] at depth z, cast toward us by an object of height H
  function pshadow(ctx, C2, x0, x1, z, H, a) {
    var len = Math.min(H * 2.4, z - C2.zn + 1), d = C2.sdx * len;
    pq(ctx, C2, [[x0, 0, z], [x1, 0, z], [x1 - d * 0.5, 0, z - len], [x0 - d * 0.5, 0, z - len]]);
    var p0 = C2.P(0, 0, z), p1 = C2.P(0, 0, z - len);
    ctx.fillStyle = lg(ctx, 0, p0[1], 0, p1[1], [[0, 'rgba(70,36,52,' + a + ')'], [1, 'rgba(70,36,52,0)']]); ctx.fill();
  }
  function paving(ctx, L, C2) {
    var w = L.w, h = L.h, s = L.s, r = rng(3606), i, X, Z;
    var y0 = L.terrace;
    // the base: warm stone, darker toward us, with a broad sheen in line with the Sun (the stones are wet)
    ctx.fillStyle = lg(ctx, 0, y0, 0, h, [[0, '#c9a894'], [0.35, '#b08e7c'], [1, '#86685c']]); ctx.fillRect(0, y0, w, h - y0);
    // big pavers in courses, each a slightly different tone (batched by tone)
    var tones = ['#c4a28e', '#b89684', '#cdae98', '#ac8a7a'], B = [[], [], [], []], zz = C2.zn, row = 0, xr = C2.xr * 1.1;
    while (zz < C2.zr) { var dz = 1.2, off = (row % 2) * 0.6;
      for (X = -xr - off; X < xr; X += 1.2) { if (r() < 0.55) continue; B[(r() * 4) | 0].push([X, X + 1.2, zz, Math.min(C2.zr, zz + dz)]); }
      zz += dz; row++; }
    for (i = 0; i < 4; i++) { ctx.fillStyle = tones[i]; ctx.globalAlpha = 0.55; ctx.beginPath(); B[i].forEach(function (q) { var a = C2.P(q[0], 0, q[2]), b = C2.P(q[1], 0, q[2]), c = C2.P(q[1], 0, q[3]), d = C2.P(q[0], 0, q[3]); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); }); ctx.fill(); }
    ctx.globalAlpha = 1;
    // joints: lines toward the vanishing point and across
    ctx.strokeStyle = rgba('#6e5048', 0.28); ctx.lineWidth = 0.6 * s; ctx.beginPath();
    for (X = -Math.ceil(xr / 1.2) * 1.2; X <= xr; X += 1.2) { var a2 = C2.P(X, 0, C2.zn), b2 = C2.P(X, 0, C2.zr); ctx.moveTo(a2[0], a2[1]); ctx.lineTo(b2[0], b2[1]); }
    for (Z = C2.zn; Z < C2.zr; Z += 1.2) { var c2 = C2.P(0, 0, Z); ctx.moveTo(0, c2[1]); ctx.lineTo(w, c2[1]); } ctx.stroke();
    // the wet sheen: a soft streak of reflected glow running from the Sun's direction toward us
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = lg(ctx, 0, y0, 0, h, [[0, 'rgba(255,214,160,0.34)'], [0.5, 'rgba(255,200,150,0.1)'], [1, 'rgba(255,200,150,0)']]);
    ctx.beginPath(); ctx.moveTo(L.sun[0] - w * 0.12, y0); ctx.lineTo(L.sun[0] + w * 0.12, y0); ctx.lineTo(L.sun[0] + w * 0.34, h); ctx.lineTo(L.sun[0] - w * 0.3, h); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  // a puddle: the sky mirrored in it (golden at its far edge, violet nearer), the glare streak and dark reflected posts
  function puddle(ctx, L, C2, X, Z, rx, rz, seed) {
    var s = L.s, r = rng(seed), pts = [], i;
    for (i = 0; i <= 28; i++) { var a = i / 28 * TAU, wob = 1 + 0.1 * Math.sin(a * 2 + seed) + 0.05 * Math.sin(a * 3 + seed * 2); pts.push(C2.P(X + Math.cos(a) * rx * wob, 0, Z + Math.sin(a) * rz * wob)); }
    var top = C2.P(X, 0, Z + rz)[1], bot = C2.P(X, 0, Z - rz)[1];
    poly(ctx, pts); ctx.fillStyle = lg(ctx, 0, top, 0, bot, [[0, '#ffe6b0'], [0.3, '#f6bc84'], [0.7, '#c08a98'], [1, '#6e6490']]); ctx.fill();
    ctx.save(); poly(ctx, pts); ctx.clip();
    // the glare: a bright vertical streak in line with the Sun
    var gx = L.sun[0] + (C2.P(X, 0, Z)[0] - L.sun[0]) * 0.15; ctx.fillStyle = lg(ctx, gx - 6 * s, 0, gx + 6 * s, 0, [[0, 'rgba(255,248,224,0)'], [0.5, 'rgba(255,248,224,0.85)'], [1, 'rgba(255,248,224,0)']]); ctx.fillRect(gx - 6 * s, top, 12 * s, bot - top);
    // reflections of the balustrade posts and its rail
    ctx.fillStyle = 'rgba(60,40,60,0.35)'; var span = C2.xr * 2; for (var q = -C2.xr; q <= C2.xr; q += 1.8) { var px = C2.P(q, 0, C2.zr)[0]; ctx.fillRect(px - 0.8 * s, top, 1.6 * s, (bot - top) * 0.7); }
    // ripples
    ctx.strokeStyle = 'rgba(255,240,210,0.45)'; ctx.lineWidth = 0.5 * s; ctx.beginPath(); for (i = 0; i < 5; i++) { var yy = lerp(top, bot, r()), xx = lerp(pts[21][0], pts[7][0], r()) || pts[0][0]; ctx.moveTo(xx - 6 * s, yy); ctx.lineTo(xx + 6 * s, yy); } ctx.stroke();
    ctx.restore();
    // a darker wet rim
    poly(ctx, pts); ctx.strokeStyle = 'rgba(90,60,64,0.35)'; ctx.lineWidth = 1 * s; ctx.stroke();
  }
  // a raised planter of grey stone with grasses and bougainvillea, rimmed with light on top
  function planter(ctx, L, C2, x0, x1, z0, z1, seed) {
    var s = L.s, r = rng(seed), H = 0.6, i;
    pshadow(ctx, C2, x0, x1, z0, H, 0.4);
    // the side we can see (toward the centre) and the front face
    var side = x0 > 0 ? x0 : x1;
    pq(ctx, C2, [[side, 0, z0], [side, H, z0], [side, H, z1], [side, 0, z1]]); ctx.fillStyle = '#9a8478'; ctx.fill();
    pq(ctx, C2, [[x0, 0, z0], [x0, H, z0], [x1, H, z0], [x1, 0, z0]]); ctx.fillStyle = '#7a6260'; ctx.fill();
    pq(ctx, C2, [[x0, H, z0], [x1, H, z0], [x1, H, z1], [x0, H, z1]]); ctx.fillStyle = '#5a4a3a'; ctx.fill();
    var e0 = C2.P(x0, H, z0), e1 = C2.P(x1, H, z0); ctx.strokeStyle = 'rgba(255,230,190,0.8)'; ctx.lineWidth = 0.9 * s; ctx.beginPath(); ctx.moveTo(e0[0], e0[1]); ctx.lineTo(e1[0], e1[1]); ctx.stroke();
    // planting: tufts of grass (backlit, so their tips glow) and shrubs of bougainvillea
    var tufts = [];
    for (i = 0; i < 46; i++) tufts.push([lerp(x0 + 0.15, x1 - 0.15, r()), lerp(z0 + 0.15, z1 - 0.15, r())]);
    tufts.sort(function (A, B) { return B[1] - A[1]; });
    tufts.forEach(function (t2, j) {
      var p = C2.P(t2[0], H, t2[1]), k = C2.k(t2[1]);
      if (j % 4 === 0) { clump(ctx, p[0], p[1] - 0.35 * k, 0.4 * k, ['#5a1a3e', '#8a2450', '#c83a72', '#ee6a9a', '#ffb4cc'], r, 0.3, -0.9, false, 0.8); return; }
      batch(ctx, 9, [['#5a6a3a', Math.max(0.6 * s, 0.03 * k), 0.9], ['#e8c070', Math.max(0.5 * s, 0.022 * k), 0.85]], function (q) { var hh = (0.35 + r() * 0.35) * k, lx = (r() - 0.5) * 0.4 * k; return [p[0] + (r() - 0.5) * 0.15 * k, p[1], p[0] + lx, p[1] - hh, q < 6 ? 0 : 1, p[0] + lx * 0.3, p[1] - hh * 0.6]; });
    });
  }
  // a royal palm: a smooth grey trunk and a crown of arching fronds, black against the sunset with rimmed edges
  function palm(ctx, L, C2, X, Z, H, seed) {
    var s = L.s, r = rng(seed), k = C2.k(Z), b = C2.P(X, 0, Z), t = C2.P(X + 0.3, H, Z), i;
    pshadow(ctx, C2, X - 0.3, X + 0.3, Z, H * 0.7, 0.3);
    var tw0 = 0.42 * k, tw1 = 0.26 * k;
    ctx.beginPath(); ctx.moveTo(b[0] - tw0, b[1]); ctx.quadraticCurveTo(b[0] - tw0 * 0.6, (b[1] + t[1]) / 2, t[0] - tw1, t[1]); ctx.lineTo(t[0] + tw1, t[1]); ctx.quadraticCurveTo(b[0] + tw0 * 0.7, (b[1] + t[1]) / 2, b[0] + tw0, b[1]); ctx.closePath();
    ctx.fillStyle = lg(ctx, b[0] - tw0, 0, b[0] + tw0, 0, [[0, '#8a6a6a'], [0.5, '#5a4450'], [1, '#c89a80']]); ctx.fill();
    ctx.strokeStyle = 'rgba(40,24,36,0.35)'; ctx.lineWidth = 0.5 * s; ctx.beginPath(); for (i = 1; i < 14; i++) { var yy = lerp(b[1], t[1], i / 14); ctx.moveTo(lerp(b[0], t[0], i / 14) - tw0 * 0.8, yy); ctx.lineTo(lerp(b[0], t[0], i / 14) + tw0 * 0.8, yy); } ctx.stroke();
    // the green crownshaft and the fronds
    ctx.fillStyle = '#4a5a3a'; ctx.beginPath(); qell(ctx, t[0], t[1] - 0.6 * k, tw1 * 1.1, 0.9 * k, 0); ctx.fill();
    var cx = t[0], cy = t[1] - 1.3 * k;
    for (i = 0; i < 15; i++) {
      var a = -PI * 0.5 + (i / 14 - 0.5) * PI * 1.75 + (r() - 0.5) * 0.2, L2 = (1.8 + r() * 0.8) * k, droop = (0.35 + 0.5 * Math.abs(Math.cos(a))) * L2;
      var ex = cx + Math.cos(a) * L2, ey = cy + Math.sin(a) * L2 * 0.7 + droop * 0.6, mx = cx + Math.cos(a) * L2 * 0.55, my = cy + Math.sin(a) * L2 * 0.55 - L2 * 0.12;
      ctx.strokeStyle = '#2e2a2c'; ctx.lineWidth = Math.max(0.8 * s, 0.06 * k); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.quadraticCurveTo(mx, my, ex, ey); ctx.stroke();
      // leaflets along the rib
      ctx.fillStyle = i % 2 ? '#2e3a2e' : '#3a4634'; ctx.beginPath();
      for (var j = 2; j < 22; j++) { var u = j / 22, px = (1 - u) * (1 - u) * cx + 2 * (1 - u) * u * mx + u * u * ex, py = (1 - u) * (1 - u) * cy + 2 * (1 - u) * u * my + u * u * ey, ll = (0.75 - Math.abs(u - 0.45) * 0.9) * k;
        [1.25, -1.25].forEach(function (da) { var dx = Math.cos(a + da) * ll * 0.55, dy = ll * 0.95, wv = 0.06 * k; ctx.moveTo(px, py); ctx.quadraticCurveTo(px + dx * 0.5 + wv, py + dy * 0.4, px + dx, py + dy); ctx.quadraticCurveTo(px + dx * 0.5 - wv, py + dy * 0.5, px, py); }); }
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,210,150,0.55)'; ctx.lineWidth = Math.max(0.4 * s, 0.02 * k); ctx.beginPath(); ctx.moveTo(cx, cy - 0.04 * k); ctx.quadraticCurveTo(mx, my - 0.04 * k, ex, ey - 0.04 * k); ctx.stroke();
    }
  }
  // a Hong Kong orchid tree in the right planter, pink with flowers and lit from behind
  function flowerTree(ctx, L, C2, X, Z, seed) {
    var s = L.s, r = rng(seed), k = C2.k(Z), b = C2.P(X, 0.6, Z), t = C2.P(X - 0.2, 3.2, Z);
    pshadow(ctx, C2, X - 1, X + 1, Z, 3.5, 0.3);
    K.trunkPath(ctx, b[0], b[1], t[0], t[1], 0.22 * k, 0.1 * k, 0.3 * k); ctx.fillStyle = '#4a3436'; ctx.fill();
    var cl = [[0, 0], [-0.9, 0.15], [0.8, 0.1], [-0.45, -0.3], [0.45, -0.35], [-1.3, -0.2], [1.2, -0.25], [0, 0.4]];
    cl.forEach(function (c) { var p = C2.P(X - 0.2 + c[0], 3.4 + c[1], Z); clump(ctx, p[0], p[1], 0.48 * k, ['#4a2a3a', '#7a3a5a', '#c05a8a', '#ec8ab4', '#ffd0e2'], r, 0.2, -0.95, false, 0.9); });
  }
  function bench(ctx, L, C2, x0, x1, Z) {
    var s = L.s, k = C2.k(Z), i;
    pshadow(ctx, C2, x0, x1, Z, 0.9, 0.35);
    [x0 + 0.15, x1 - 0.15].forEach(function (X) { var a = C2.P(X, 0, Z), b = C2.P(X, 0.85, Z); ctx.strokeStyle = '#3a3036'; ctx.lineWidth = Math.max(0.8 * s, 0.05 * k); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); });
    // seat seen from behind, then the slatted backrest with glowing top edges
    pq(ctx, C2, [[x0, 0.42, Z - 0.45], [x1, 0.42, Z - 0.45], [x1, 0.42, Z], [x0, 0.42, Z]]); ctx.fillStyle = '#6a4a3a'; ctx.fill();
    for (i = 0; i < 3; i++) { var y0 = 0.5 + i * 0.13; pq(ctx, C2, [[x0, y0, Z], [x1, y0, Z], [x1, y0 + 0.09, Z], [x0, y0 + 0.09, Z]]); ctx.fillStyle = '#7a5440'; ctx.fill();
      var e0 = C2.P(x0, y0 + 0.09, Z), e1 = C2.P(x1, y0 + 0.09, Z); ctx.strokeStyle = 'rgba(255,214,160,0.75)'; ctx.lineWidth = 0.6 * s; ctx.beginPath(); ctx.moveTo(e0[0], e0[1]); ctx.lineTo(e1[0], e1[1]); ctx.stroke(); }
  }
  // the wayfinding sign: a slim totem with the zone's name, a robot pictogram and an arrow toward the test yard
  function signpost(ctx, L, C2, X, Z) {
    var s = L.s, k = C2.k(Z), b = C2.P(X, 0, Z), t = C2.P(X, 2.3, Z), wd = 0.62 * k, hh = b[1] - t[1];
    pshadow(ctx, C2, X - 0.3, X + 0.3, Z, 2.3, 0.35);
    ctx.fillStyle = '#2a2430'; ctx.beginPath(); rrect(ctx, b[0] - wd / 2, t[1], wd, hh, 2 * s); ctx.fill();
    ctx.fillStyle = '#f0b020'; ctx.fillRect(b[0] - wd / 2, t[1] + hh * 0.06, wd, hh * 0.05);
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '800 ' + (wd * 0.26).toFixed(1) + 'px Nunito, sans-serif'; ctx.fillText('测试场', b[0], t[1] + hh * 0.2);
    ctx.font = '800 ' + (wd * 0.17).toFixed(1) + 'px Nunito, sans-serif'; ctx.fillText('TEST YARD', b[0], t[1] + hh * 0.29);
    // robot pictogram and an arrow
    var py = t[1] + hh * 0.45, u = wd * 0.12; ctx.fillStyle = '#7ff7e4'; ctx.beginPath(); rrect(ctx, b[0] - u * 1.5, py - u, u * 3, u * 2, u * 0.5); ctx.fill(); ctx.fillStyle = '#2a2430'; ctx.fillRect(b[0] - u * 0.8, py - u * 0.3, u * 0.4, u * 0.4); ctx.fillRect(b[0] + u * 0.4, py - u * 0.3, u * 0.4, u * 0.4);
    ctx.strokeStyle = '#7ff7e4'; ctx.lineWidth = Math.max(0.8 * s, u * 0.4); ctx.beginPath(); ctx.moveTo(b[0] - u * 1.5, py + u * 2.6); ctx.lineTo(b[0] + u * 1.4, py + u * 2.6); ctx.moveTo(b[0] + u * 0.6, py + u * 1.9); ctx.lineTo(b[0] + u * 1.5, py + u * 2.6); ctx.lineTo(b[0] + u * 0.6, py + u * 3.3); ctx.stroke();
    ctx.fillStyle = 'rgba(255,214,150,0.7)'; ctx.fillRect(b[0] + wd / 2 - 0.8 * s, t[1] + 2 * s, 0.8 * s, hh - 4 * s);
    ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic';
  }
  // a figure seen against the light: a worker in a hard hat and orange vest, standing at the balustrade
  function worker(ctx, x, y, H, s, o) {
    var u = H / 7; ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = '#3a2e3a'; ctx.fillRect(-u * 0.7, -u * 3.4, u * 0.6, u * 3.3); ctx.fillRect(u * 0.1, -u * 3.4, u * 0.6, u * 3.3);
    ctx.fillStyle = o.coat; ctx.beginPath(); ctx.moveTo(-u * 1, -u * 3.2); ctx.quadraticCurveTo(-u * 1.1, -u * 5.4, -u * 0.5, -u * 5.6); ctx.lineTo(u * 0.5, -u * 5.6); ctx.quadraticCurveTo(u * 1.1, -u * 5.4, u * 1, -u * 3.2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,240,200,0.9)'; ctx.fillRect(-u * 0.95, -u * 4.3, u * 1.9, u * 0.22);
    ctx.fillStyle = o.skin; ctx.beginPath(); qell(ctx, 0, -u * 6.25, u * 0.48, u * 0.55, 0); ctx.fill();
    ctx.fillStyle = o.hat; ctx.beginPath(); ctx.ellipse(0, -u * 6.5, u * 0.58, u * 0.45, 0, PI, TAU); ctx.fill(); ctx.fillRect(-u * 0.7, -u * 6.52, u * 1.4, u * 0.14);
    ctx.strokeStyle = 'rgba(255,220,170,0.8)'; ctx.lineWidth = Math.max(0.4 * s, u * 0.1); ctx.beginPath(); ctx.moveTo(-u * 1, -u * 3.3); ctx.quadraticCurveTo(-u * 1.1, -u * 5.4, -u * 0.5, -u * 5.6); ctx.stroke();
    ctx.restore();
  }
  function terrace(ctx, L) {
    var w = L.w, h = L.h, s = L.s, y0 = L.terrace, C2 = plazaCam(L), i;
    paving(ctx, L, C2);
    // the cargo-tram track set into the paving, running across the terrace
    L.tramZ = C2.zr - 3.2;
    [-0.5, 0.5].forEach(function (d) { var a = C2.P(-C2.xr * 1.6, 0, L.tramZ + d), b = C2.P(C2.xr * 1.6, 0, L.tramZ + d); ctx.strokeStyle = '#5a4448'; ctx.lineWidth = 1.2 * s; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,230,190,0.8)'; ctx.lineWidth = 0.5 * s; ctx.beginPath(); ctx.moveTo(a[0], a[1] - 0.6 * s); ctx.lineTo(b[0], b[1] - 0.6 * s); ctx.stroke(); });
    // puddles left by the afternoon shower
    puddle(ctx, L, C2, -1.3, C2.zn + 1.9, 0.9, 0.38, 11); puddle(ctx, L, C2, 1.7, C2.zn + 5.2, 0.9, 0.5, 12); puddle(ctx, L, C2, -2.6, C2.zn + 8.6, 0.8, 0.45, 13); puddle(ctx, L, C2, 0.6, C2.zr - 5.2, 1.2, 0.5, 14);
    // the test-bay markings: yellow corner brackets and a hatched entry strip (the stop pedestal and the test crew stand here)
    ctx.strokeStyle = 'rgba(240,176,32,0.85)'; ctx.lineWidth = 1.8 * s; ctx.beginPath();
    var bz0 = C2.zn + 1.3, bz1 = C2.zn + 7, bx = 2.8;
    [[-bx, bz0, 1, 1], [bx, bz0, -1, 1], [-bx, bz1, 1, -1], [bx, bz1, -1, -1]].forEach(function (c) { var p = C2.P(c[0], 0, c[1]), q = C2.P(c[0] + c[2] * 0.9, 0, c[1]), q2 = C2.P(c[0], 0, c[1] + c[3] * 0.9); ctx.moveTo(q[0], q[1]); ctx.lineTo(p[0], p[1]); ctx.lineTo(q2[0], q2[1]); }); ctx.stroke();
    ctx.save(); pq(ctx, C2, [[-bx + 0.3, 0, bz1 + 0.3], [bx - 0.3, 0, bz1 + 0.3], [bx - 0.3, 0, bz1 + 0.9], [-bx + 0.3, 0, bz1 + 0.9]]); ctx.clip();
    ctx.strokeStyle = 'rgba(42,36,48,0.4)'; ctx.lineWidth = 2 * s; ctx.beginPath(); var ha = C2.P(-bx, 0, bz1 + 0.9), hb = C2.P(bx, 0, bz1 + 0.3); for (var x = ha[0]; x < hb[0] + 20 * s; x += 6 * s) { ctx.moveTo(x, hb[1]); ctx.lineTo(x + 8 * s, ha[1]); } ctx.stroke(); ctx.restore();
    // things on the terrace, from the balustrade toward us
    var items = [];
    items.push([C2.zr - 1.6, function () { signpost(ctx, L, C2, -0.9, C2.zr - 1.6); }]);
    items.push([C2.zr - 0.9, function () { worker(ctx, C2.P(2.2, 0, C2.zr - 0.9)[0], C2.P(2.2, 0, C2.zr - 0.9)[1], 1.72 * C2.k(C2.zr - 0.9), s, { coat: '#ff8a2a', skin: '#e8b890', hat: '#f4f0e6' }); }]);
    var zp1 = C2.zr - 3.2, zp2 = C2.zr - 6.6, xp1 = (-w * 0.015 - C2.cx) / C2.k(zp1), xp2 = (w * 0.93 - C2.cx) / C2.k(zp2);
    items.push([zp1, function () { palm(ctx, L, C2, xp1, zp1, 9, 31); }]);
    items.push([zp2, function () { flowerTree(ctx, L, C2, xp2, zp2, 33); }]);
    items.push([C2.zr - 6.5, function () { planter(ctx, L, C2, -C2.xr * 1.3, -C2.xr * 0.55, C2.zr - 6.5, C2.zr - 3.6, 41); }]);
    items.push([C2.zr - 8.2, function () { planter(ctx, L, C2, C2.xr * 0.5, C2.xr * 1.3, C2.zr - 8.2, C2.zr - 5.6, 42); }]);
    items.push([C2.zr - 7.2, function () { bench(ctx, L, C2, -C2.xr * 0.5, -C2.xr * 0.5 + 1.6, C2.zr - 7.2); }]);
    items.sort(function (A, B) { return B[0] - A[0]; });
    // the glass balustrade at the far edge, full of reflected sunset, its posts throwing long shadows toward us
    var gt = y0 - 30 * s;
    ctx.fillStyle = lg(ctx, 0, gt, 0, y0, [[0, 'rgba(255,236,200,0.28)'], [1, 'rgba(255,200,150,0.12)']]); ctx.fillRect(0, gt, w, y0 - gt);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = lg(ctx, L.sun[0] - w * 0.2, 0, L.sun[0] + w * 0.2, 0, [[0, 'rgba(255,220,160,0)'], [0.5, 'rgba(255,230,180,0.22)'], [1, 'rgba(255,220,160,0)']]); ctx.fillRect(0, gt, w, y0 - gt); ctx.restore();
    for (var X = -C2.xr * 1.4; X <= C2.xr * 1.4; X += 1.8) pshadow(ctx, C2, X - 0.05, X + 0.05, C2.zr, 1.1, 0.3);
    ctx.fillStyle = '#5a4e52'; for (X = -C2.xr * 1.4; X <= C2.xr * 1.4; X += 1.8) { var p = C2.P(X, 0, C2.zr); ctx.fillRect(p[0] - 1.1 * s, gt, 2.2 * s, y0 - gt); }
    ctx.fillStyle = '#4a3e44'; ctx.fillRect(0, gt - 1.6 * s, w, 2.6 * s); ctx.fillStyle = 'rgba(255,230,190,0.8)'; ctx.fillRect(0, gt - 1.6 * s, w, 0.7 * s);
    ctx.fillStyle = '#6a5a58'; ctx.fillRect(0, y0 - 1.5 * s, w, 3 * s);
    // a small plaque on the rail
    var pl = C2.P(0.6, 0, C2.zr); ctx.fillStyle = '#2a2430'; ctx.beginPath(); rrect(ctx, pl[0] - 28 * s, gt + 6 * s, 56 * s, 10 * s, 2 * s); ctx.fill();
    ctx.fillStyle = '#f2c46a'; ctx.font = '800 ' + (5.2 * s).toFixed(1) + 'px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('观景台 · VIEW DECK', pl[0], gt + 11.2 * s); ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic';
    // the public permit board on the left, its back to the Sun
    var bx2 = w * 0.04, by = y0 - 86 * s, bw = 92 * s, bh = 52 * s;
    ctx.fillStyle = 'rgba(70,40,50,0.3)'; ctx.beginPath(); ctx.moveTo(bx2 + bw * 0.45, y0 + 2 * s); ctx.lineTo(bx2 + bw * 0.45 + 6 * s, y0 + 2 * s); ctx.lineTo(bx2 + bw * 0.2, y0 + 40 * s); ctx.lineTo(bx2 + bw * 0.05, y0 + 40 * s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#4a4248'; ctx.fillRect(bx2 + bw * 0.45, by + bh, 4 * s, y0 - by - bh + 2 * s);
    ctx.beginPath(); rrect(ctx, bx2 - 2 * s, by - 2 * s, bw + 4 * s, bh + 4 * s, 6 * s); ctx.fillStyle = '#2a2430'; ctx.fill();
    ctx.beginPath(); rrect(ctx, bx2, by, bw, bh, 5 * s); ctx.fillStyle = '#16202e'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,214,150,0.7)'; ctx.lineWidth = 0.8 * s; ctx.beginPath(); ctx.moveTo(bx2 + bw, by + 4 * s); ctx.lineTo(bx2 + bw, by + bh - 4 * s); ctx.stroke();
    ctx.fillStyle = '#7ff7e4'; ctx.font = '800 ' + (6.4 * s).toFixed(1) + 'px Nunito, sans-serif'; ctx.fillText('ROBOT PERMITS IN USE', bx2 + 6 * s, by + 11 * s);
    ctx.fillStyle = '#ffffff'; ctx.font = '800 ' + (13 * s).toFixed(1) + 'px Nunito, sans-serif'; ctx.fillText('41,860', bx2 + 6 * s, by + 28 * s);
    ctx.fillStyle = '#9ab0c8'; ctx.font = '700 ' + (6.4 * s).toFixed(1) + 'px Nunito, sans-serif'; ctx.fillText('CAP 42,000', bx2 + 54 * s, by + 27 * s);
    ctx.fillStyle = '#34445a'; ctx.fillRect(bx2 + 6 * s, by + 36 * s, bw - 12 * s, 6 * s); ctx.fillStyle = '#f0b020'; ctx.fillRect(bx2 + 6 * s, by + 36 * s, (bw - 12 * s) * 0.9967, 6 * s);
    ctx.fillStyle = '#9ab0c8'; ctx.font = '700 ' + (5 * s).toFixed(1) + 'px Nunito, sans-serif'; ctx.fillText('SHENZHEN ZONE 3 · LIVE', bx2 + 6 * s, by + 49 * s);
    L.board = [bx2, by, bw, bh];
    items.forEach(function (it) { it[1](); });
    // the nearest stones fall into soft shade, calm for the dialogue
    ctx.fillStyle = lg(ctx, 0, h * 0.76, 0, h, [[0, rgba('#2a1820', 0)], [1, rgba('#2a1820', 0.26)]]); ctx.fillRect(0, h * 0.76, w, h * 0.24);
  }

  function paint(ctx, w, h) {
    if (!bind()) return;
    var L = layout(w, h), s = L.s;
    sky(ctx, L); hills(ctx, L); skyline(ctx, L); bay(ctx, L);
    groundPlane(ctx, L); solar(ctx, L);
    // the zone from far to near
    var items = [];
    L.halls.forEach(function (H) { items.push([H[1] + H[3], function () { hall(ctx, L, H); }]); });
    L.domes.forEach(function (D) { items.push([D[1], function () { dome(ctx, L, D); }]); });
    L.cranes.forEach(function (Cr) { items.push([Cr[1], function () { crane(ctx, L, Cr); }]); });
    items.push([L.mine.z + L.mine.rz, function () { mine(ctx, L); }]);
    items.push([L.tower.z, function () { zoneTower(ctx, L); }]);
    items.push([1800, function () { rails(ctx, L); frontYard(ctx, L); }]);
    items.sort(function (A, B) { return B[0] - A[0]; }).forEach(function (it) { it[1](); });
    // warm haze lying over the zone, thickest far away and toward the Sun
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = lg(ctx, 0, L.far, 0, L.terrace, [[0, 'rgba(255,200,140,0.22)'], [0.4, 'rgba(255,190,130,0.06)'], [1, 'rgba(255,190,130,0)']]); ctx.fillRect(0, L.far, w, L.terrace - L.far);
    ctx.fillStyle = rg(ctx, L.sun[0], L.far, 0, w * 0.5, [[0, 'rgba(255,220,160,0.28)'], [1, 'rgba(255,220,160,0)']]); ctx.fillRect(0, 0, w, L.terrace); ctx.restore();
    terrace(ctx, L);
    finish(ctx, w, h, '#ffc890', 0.1, 0.18, 0.03, '#2a1418', 0.42);
  }

  function along(pts, u) { var n = pts.length - 1, f = clamp(u, 0, 0.9999) * n, i = Math.floor(f), t = f - i; return [lerp(pts[i][0], pts[i + 1][0], t), lerp(pts[i][1], pts[i + 1][1], t), pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]]; }
  function overlay(ctx, w, h, t) {
    if (!bind()) return;
    var L = layout(w, h), s = L.s, i;
    ctx.save();
    // haul trucks crawling along the benches of the pit, headlights on
    var hl = glowSpr('#fff0c0', true);
    if (L.benches) for (i = 0; i < L.benches.length; i++) { var B = L.benches[i], p = ((t * 0.012 * (1 + i * 0.3) + i * 0.27) % 1), q = along(B, p), z = 2.2 * s;
      ctx.fillStyle = '#f0b020'; ctx.fillRect(q[0] - z, q[1] - z * 0.9, z * 2, z * 0.9); ctx.fillStyle = '#5a3a3a'; ctx.fillRect(q[0] - z, q[1] - z * 1.4, z * 1.2, z * 0.5);
      if (hl) { ctx.globalAlpha = 0.7; ctx.drawImage(hl, q[0] + (q[2] > 0 ? z : -z) - 2 * s, q[1] - z * 0.6 - 2 * s, 4 * s, 4 * s); ctx.globalAlpha = 1; } }
    // freight trains sliding along the rails: containers in a row, catching the light on top
    if (L.railPts) for (var k = 0; k < 2; k++) { var R = L.railPts[k * 2], tp = ((t * (0.016 + k * 0.006) + k * 0.5) % 1.4) - 0.2, cols = ['#e8e4dc', '#c8402e', '#2a6a9a', '#e8a030', '#3a8a6a'];
      for (i = 0; i < 22; i++) { var u = k ? 1 - tp + i * 0.011 : tp - i * 0.011; if (u < 0 || u > 1) continue; var a = along(R, u), b = along(R, Math.min(1, u + 0.009)), wd = 2.6 * s * (0.6 + 0.6 * (a[1] - L.far) / (L.terrace - L.far));
        ctx.strokeStyle = i ? cols[i % cols.length] : '#f4f4f0'; ctx.lineWidth = wd; ctx.beginPath(); ctx.moveTo(a[0], a[1] - wd * 0.5); ctx.lineTo(b[0], b[1] - wd * 0.5); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,236,200,0.7)'; ctx.lineWidth = wd * 0.25; ctx.beginPath(); ctx.moveTo(a[0], a[1] - wd); ctx.lineTo(b[0], b[1] - wd); ctx.stroke(); } }
    // robot trucks on the highway, tail lights and head lights
    if (L.road) { for (i = 0; i < 8; i++) { var up = ((t * 0.02 + i / 8) % 1), dir = i % 2, uu = dir ? up : 1 - up, x = lerp(L.road[0][0], L.road[1][0], uu), y = lerp(L.road[0][1], L.road[1][1], uu) - (dir ? 1 : -1) * 0.6 * s, sp = glowSpr(dir ? '#ff5a3a' : '#fff4d8', true); if (sp) { ctx.globalAlpha = 0.8; ctx.drawImage(sp, x - 2 * s, y - 2 * s, 4 * s, 4 * s); } } ctx.globalAlpha = 1; }
    var ls = glowSpr('#ffd890', true); if (ls && L.lamps) L.lamps.forEach(function (p) { ctx.globalAlpha = 0.85; ctx.drawImage(ls, p[0] - 3 * s, p[1] - 3 * s, 6 * s, 6 * s); }); ctx.globalAlpha = 1;
    // cargo drones crossing the zone, blinking
    for (i = 0; i < 6; i++) { var ph = t * (0.02 + i * 0.006) + i * 0.21, dx = lerp(-w * 0.05, w * 1.05, (ph % 1)), dy = h * (0.3 + (i % 3) * 0.035) + Math.sin(t * 0.8 + i) * 3 * s; K.drawDrone(ctx, i % 2 ? w - dx : dx, dy, (1.1 + (i % 3) * 0.3) * s, '#3a2e3a', Math.pow(Math.max(0, Math.sin(t * 4 + i)), 6), '#ff6a5a'); }
    // warning lights on the zone tower and the crane tips
    var sr = glowSpr('#ff4a3a', true);
    if (sr) { var pts = [L.towerTop].concat(L.cranes.map(function (c) { return c.tip; })).filter(Boolean); pts.forEach(function (p, j) { var bl = Math.pow(Math.max(0, Math.sin(t * 1.8 + j * 1.3)), 8); if (bl < 0.02) return; ctx.globalAlpha = bl; ctx.drawImage(sr, p[0] - 4 * s, p[1] - 4 * s, 8 * s, 8 * s); }); ctx.globalAlpha = 1; }
    // the crane jibs slowly slew back and forth (their hooks swing in the glow)
    // the sparkle on the bay drifts
    var r = rng(55);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (i = 0; i < 40; i++) { var tt = r(), yy = lerp(L.far + 1 * s, L.shore - 1 * s, Math.pow(tt, 0.8)), spread = (6 + tt * 40) * s, xx = L.sun[0] + (r() + r() - 1) * spread + Math.sin(t * 0.7 + i) * 2 * s, a2 = Math.pow(Math.max(0, Math.sin(t * (2 + r() * 2) + i * 1.7)), 4);
      ctx.fillStyle = rgba('#fffaf0', a2 * 0.9); ctx.fillRect(xx - 2 * s, yy, 4 * s, 0.8 * s); }
    ctx.restore();
    // dust drifting off the pit, glowing in the low light
    for (i = 0; i < 6; i++) { var dp = (t * 0.015 + r()) % 1, mp = L.P(L.mine.x + (r() - 0.5) * L.mine.rx, 0, L.mine.z); ctx.globalAlpha = 0.16 * Math.sin(dp * PI); K.puff(ctx, mp[0] + dp * 40 * s, mp[1] - dp * 30 * s, (14 + r() * 10) * s, '#ffd8a8', 0.8); } ctx.globalAlpha = 1;
    // on the terrace: a cargo tram gliding along its track, delivery robots crossing, two workers walking by the rail
    var C2 = L.pz;
    if (C2) {
      for (i = 0; i < 2; i++) { var wp = ((t * 0.018 + i * 0.55) % 1), wz = C2.zr - 0.6 - i * 0.5, wx = lerp(-C2.xr * 1.1, C2.xr * 1.1, i ? 1 - wp : wp), q4 = C2.P(wx, 0, wz), bob = Math.abs(Math.sin(t * 4 + i)) * 0.03 * C2.k(wz);
        worker(ctx, q4[0], q4[1] - bob, 1.7 * C2.k(wz), s, { coat: i ? '#f4f0e6' : '#ff8a2a', skin: i ? '#c89a74' : '#eec8a8', hat: i ? '#f0b020' : '#f4f0e6' }); }
      var tz = L.tramZ, tp2 = ((t * 0.035) % 1.6) - 0.3, txc = lerp(-C2.xr * 1.6, C2.xr * 1.6, tp2), k2 = C2.k(tz);
      for (i = 0; i < 3; i++) { var x0 = txc - i * 2.1, a3 = C2.P(x0 - 0.9, 0.12, tz), b3 = C2.P(x0 + 0.9, 0.66, tz);
        ctx.fillStyle = 'rgba(70,36,52,0.35)'; ctx.beginPath(); qell(ctx, (a3[0] + b3[0]) / 2, a3[1] + 0.1 * k2, (b3[0] - a3[0]) * 0.55, 0.12 * k2, 0); ctx.fill();
        ctx.fillStyle = '#2a2430'; [x0 - 0.55, x0 + 0.55].forEach(function (wx2) { var wq = C2.P(wx2, 0.1, tz); ctx.beginPath(); ctx.arc(wq[0], wq[1], 0.1 * k2, 0, TAU); ctx.fill(); });
        ctx.fillStyle = i ? '#e8e2d8' : '#f0b020'; ctx.beginPath(); rrect(ctx, a3[0], b3[1], b3[0] - a3[0], a3[1] - b3[1], 0.15 * k2); ctx.fill();
        ctx.fillStyle = i ? ['#c8402e', '#2a6a9a'][i - 1] : '#2a2430'; ctx.fillRect(a3[0] + 0.15 * k2, b3[1] + 0.15 * k2, b3[0] - a3[0] - 0.3 * k2, (a3[1] - b3[1]) * 0.45);
        ctx.fillStyle = 'rgba(255,236,200,0.85)'; ctx.fillRect(a3[0], b3[1], b3[0] - a3[0], Math.max(0.6 * s, 0.05 * k2)); }
      var lamp = glowSpr('#fff0c0', true); if (lamp) { var hp3 = C2.P(txc + 1, 0.5, tz); ctx.globalAlpha = 0.9; ctx.drawImage(lamp, hp3[0] - 3 * s, hp3[1] - 3 * s, 6 * s, 6 * s); ctx.globalAlpha = 1; }
      for (i = 0; i < 2; i++) { var rp = ((t * (0.04 + i * 0.015) + i * 0.5) % 1), rz = C2.zr - 5.6 - i * 2.4, rx2 = lerp(i ? C2.xr * 1.2 : -C2.xr * 1.2, i ? -C2.xr * 1.2 : C2.xr * 1.2, rp), q3 = C2.P(rx2, 0, rz), k3 = C2.k(rz), u3 = 0.28 * k3;
        pshadow(ctx, C2, rx2 - 0.3, rx2 + 0.3, rz, 0.7, 0.35);
        ctx.fillStyle = '#f4f6fb'; ctx.beginPath(); rrect(ctx, q3[0] - u3, q3[1] - u3 * 1.6, u3 * 2, u3 * 1.3, u3 * 0.35); ctx.fill();
        ctx.fillStyle = '#16b3a6'; ctx.fillRect(q3[0] - u3, q3[1] - u3 * 1.1, u3 * 2, u3 * 0.16); ctx.fillStyle = 'rgba(255,214,150,0.8)'; ctx.fillRect(q3[0] - u3, q3[1] - u3 * 1.6, u3 * 2, Math.max(0.5 * s, u3 * 0.08));
        ctx.fillStyle = '#2a2a34'; ctx.beginPath(); ctx.arc(q3[0] - u3 * 0.6, q3[1] - u3 * 0.25, u3 * 0.25, 0, TAU); ctx.arc(q3[0] + u3 * 0.6, q3[1] - u3 * 0.25, u3 * 0.25, 0, TAU); ctx.fill();
        var bl3 = glowSpr('#7ff7e4', true); if (bl3) { ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 5 + i); ctx.drawImage(bl3, q3[0] - u3 * 0.4, q3[1] - u3 * 2.1, u3 * 0.8, u3 * 0.8); ctx.globalAlpha = 1; } }
    }
    // heat shimmer on the terrace edge glass
    ctx.strokeStyle = rgba('#fff4dc', 0.18); ctx.lineWidth = 0.6 * s; ctx.beginPath(); for (i = 0; i < 4; i++) { var y2 = L.terrace - (6 + i * 6) * s, ph2 = t * 0.6 + i; ctx.moveTo(0, y2); for (var x2 = 0; x2 < w; x2 += 8 * s) ctx.lineTo(x2, y2 + Math.sin(x2 * 0.05 / s + ph2) * 0.6 * s); } ctx.stroke();
    ctx.restore();
  }

  PAINT.shenzhen = { focus: { x: 0.62, y: 0.32 }, track: 'work', anchors: { mine: { x: 0.25, y: 0.52 }, tower: { x: 0.62, y: 0.33 }, board: { x: 0.16, y: 0.57 } },
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
