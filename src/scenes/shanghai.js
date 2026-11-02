/* scenes/shanghai.js - the Bund, Shanghai, looking east across the Huangpu River at Lujiazui (uses window.CHINA_KIT).
   PAINT.shanghai: a clear autumn morning in 2040. PAINT.shanghai_night: the same view after dark, every tower lit and
   doubled in the river.
   The Bund is a historic preserve, so it looks as it does today: we stand on its granite promenade and look over the
   stone balustrade at the far bank. On the left, the Oriental Pearl Tower (pink spheres on three columns and three
   splayed legs); on the right the Lujiazui trio: Jin Mao (a stepped steel pagoda), the twisting Shanghai Tower and the
   World Financial Center with the opening through its top. Between them, farther off, rises the one thing that is new:
   an arcology, a terraced mountain of glass and gardens with trees on every wide ledge, and a train slipping into a
   green tunnel at its foot. At the water stands the sister hospital to Boston Harbor (a low white building with
   planted terraces and a teal cross). Electric ferries with solar roofs cross the river, a few delivery drones and an
   air taxi drift over it, and gulls ride the wind. Style: flat and graphic with fine linework and a cream horizon,
   after the AI 2040 reference art (docs/DESIGN_NOTES.md, "Three kinds of places"). The lower third (the promenade)
   stays calm for subtitles; the middle of the river stays quiet behind a portrait. No brands; every sign is generic. */
(function () {
  'use strict';
  var PAINT = (window.PAINT = window.PAINT || {});
  var K, PI = Math.PI, TAU = PI * 2;
  var rng, lerp, mix, rgba, lg, rg, S, poly, rrect, softGlow, haze, finish, batch, dots, dabs, rects, reflect, glowSpr, cloudForm, skyStrokes, qell, drawBird, clump;
  function bind() {
    if (K) return true; K = window.CHINA_KIT; if (!K) return false;
    rng = K.rng; lerp = K.lerp; mix = K.mix; rgba = K.rgba; lg = K.lg; rg = K.rg; S = K.S; poly = K.poly; rrect = K.rrect;
    softGlow = K.softGlow; haze = K.haze; finish = K.finish; batch = K.batch; dots = K.dots; dabs = K.dabs; rects = K.rects;
    reflect = K.reflect; glowSpr = K.glowSpr; cloudForm = K.cloudForm; skyStrokes = K.skyStrokes; qell = K.qell; drawBird = K.drawBird; clump = K.clump;
    return true;
  }

  /* ---------------- layout (fractions of w, h; heights in units of s) ---------------- */
  var LM = null;
  function layout(w, h) {
    var key = w + 'x' + h; if (LM && LM.key === key) return LM;
    var s = S(w, h), L = { key: key, s: s, w: w, h: h };
    L.bank = h * 0.432;            // the far bank's waterline
    L.rail = h * 0.655;            // top of the balustrade
    L.wall = h * 0.708;            // where the promenade floor starts, in front of the balustrade
    L.pearl = { x: w * 0.16, H: 240 * s };
    L.jinmao = { x: w * 0.655, H: 186 * s, W: 30 * s };
    L.tower = { x: w * 0.77, H: 288 * s, W: 42 * s };
    L.swfc = { x: w * 0.895, H: 234 * s, W: 46 * s };
    L.arco = { x: w * 0.43, W: w * 0.36, H: 150 * s };
    L.hosp = { x: w * 0.5, y: L.bank, W: w * 0.3, H: 26 * s };
    // ordinary towers (x frac, width s, height s, depth 0 far .. 1 near, kind, glass tint)
    var r = rng(9131); L.blds = [];
    var spec = [[0.035, 26, 96, 0.35, 'slab', 0], [0.085, 20, 128, 0.15, 'slant', 1], [0.255, 22, 104, 0.3, 'slab', 2], [0.585, 22, 124, 0.25, 'slant', 2],
      [0.615, 20, 96, 0.5, 'slab', 3], [0.71, 20, 126, 0.3, 'crown', 1], [0.97, 26, 138, 0.12, 'slab', 0], [0.995, 22, 96, 0.45, 'round', 2],
      [0.235, 24, 66, 0.75, 'round', 0], [0.33, 28, 46, 0.85, 'slab', 2], [0.62, 26, 58, 0.82, 'slab', 1], [0.075, 28, 52, 0.9, 'slab', 3], [0.965, 30, 58, 0.88, 'round', 2]];
    for (var i = 0; i < spec.length; i++) L.blds.push({ x: w * spec[i][0], W: spec[i][1] * s, H: spec[i][2] * s * (0.92 + r() * 0.16), d: spec[i][3], kind: spec[i][4], tint: spec[i][5], seed: 300 + i });
    L.blds.sort(function (a, b) { return a.d - b.d; });
    L.lamps = [w * 0.05, w * 0.95];
    LM = L; return L;
  }

  /* ---------------- palettes (limited, slightly retro) ---------------- */
  var PAL = {
    day: { sky: [[0, '#7fb0d6'], [0.38, '#a8cbe0'], [0.68, '#d6e4e2'], [0.86, '#f3ead8'], [1, '#f6e0c2']], warm: '#ffe6c4', cool: '#7aa0c8',
      sun: [0.95, 0.2], sunCol: '#fff3dc', cloud: { lit: '#fffaf0', mid: '#eef0ec', shade: '#c8d2dc', top: '#e4ecf0' },
      far: '#b8c8d4', line: '#3a4a64',
      tints: [['#6d94b8', '#9fc0d8', '#dcebf2'], ['#5f9aa8', '#92c2c8', '#d6ecea'], ['#9a8a6c', '#c8b890', '#f2e6c8'], ['#8a96a8', '#bcc4d0', '#eef0f4']],
      water: ['#86aac4', '#6890b0', '#4c7092'], stone: ['#ddd2c0', '#cbbea8', '#b0a28a', '#eee6d8'], rail: '#e8dfd0', railSh: '#b8aa92',
      pearl: '#e45a8a', pearlHi: '#ffbcd2', green: ['#4a7a52', '#679a5c', '#8ab86a', '#bcd894'], grade: '#ffd8a8', gradeA: 0.08, vig: 0.14 },
    night: { sky: [[0, '#0b1030'], [0.4, '#18205a'], [0.75, '#34306e'], [0.92, '#5e4684'], [1, '#7a5288']], warm: '#ff9ac0', cool: '#2a3a8a',
      sun: [0.86, 0.11], sunCol: '#dfe6ff', cloud: { lit: '#4a4a8a', mid: '#2e3068', shade: '#1c1e48', top: '#3a3a7a' },
      far: '#262a5a', line: '#080a20',
      tints: [['#141a40', '#1e2652', '#33407a'], ['#10223a', '#18344c', '#285068'], ['#2a2236', '#3a3048', '#5a4a62'], ['#181c3a', '#262c50', '#3c4470']],
      water: ['#1a2050', '#121840', '#0a0e2c'], stone: ['#4a4660', '#3a3650', '#2c283e', '#5a5672'], rail: '#6a6680', railSh: '#3a3650',
      pearl: '#ff4a9a', pearlHi: '#ffc0e0', green: ['#14281e', '#1e3a28', '#2a4a30', '#3a5a3a'], grade: '#6a5ad0', gradeA: 0.12, vig: 0.3 }
  };
  function ink(ctx, L, P, night, a) { ctx.strokeStyle = rgba(P.line, night ? 0.6 : (a || 0.45)); ctx.lineWidth = 0.7 * L.s; ctx.lineJoin = 'round'; ctx.stroke(); }

  /* ---------------- the sky ---------------- */
  function sky(ctx, L, P, night) {
    var w = L.w, h = L.h, s = L.s, r = rng(night ? 811 : 711);
    ctx.fillStyle = lg(ctx, 0, 0, 0, L.bank, P.sky); ctx.fillRect(0, 0, w, L.bank + 2);
    skyStrokes(ctx, -20 * s, w + 20 * s, 0, L.bank, P.sky, 200, r, s, night ? 0.1 : 0.1, P.warm, P.cool);
    var sx = w * P.sun[0], sy = h * P.sun[1];
    if (!night) {
      softGlow(ctx, sx, sy, w * 0.9, P.sunCol, 0.3); softGlow(ctx, sx, sy, w * 0.25, '#fff8ea', 0.5);
      var cl = [[0.22, 0.075, 0.46, 0.04], [0.66, 0.14, 0.32, 0.03], [0.08, 0.21, 0.24, 0.022]];
      for (var i = 0; i < cl.length; i++) cloudForm(ctx, w * cl[i][0], h * cl[i][1], w * cl[i][2], h * cl[i][3], r, { lit: P.cloud.lit, mid: P.cloud.mid, shade: P.cloud.shade, top: P.cloud.top, al: 0.9, lx: (P.sun[0] - cl[i][0]) * 2, ly: -0.6, q: 0.5, seam: 0.08 });
      // fine horizontal lines low in the sky, the retro print look
      ctx.strokeStyle = rgba('#ffffff', 0.22); ctx.lineWidth = 0.6 * s; ctx.beginPath();
      for (var k = 0; k < 9; k++) { var yy = L.bank - (12 + k * k * 2.2) * s; ctx.moveTo(0, yy); ctx.lineTo(w, yy); } ctx.stroke();
    } else {
      dots(ctx, 90, [['#ffffff', 0.75], ['#cfd8ff', 0.5]], function () { return [r() * w, Math.pow(r(), 1.8) * L.bank * 0.55, (0.4 + r() * 0.8) * s, r() < 0.3 ? 0 : 1]; });
      softGlow(ctx, sx, sy, 60 * s, '#e8ecff', 0.35);
      ctx.fillStyle = '#f4f2ff'; ctx.beginPath(); ctx.arc(sx, sy, 11 * s, 0, TAU); ctx.fill();
      ctx.fillStyle = mix(P.sky[1][1], P.sky[0][1], 0.3); ctx.beginPath(); ctx.arc(sx + 4.5 * s, sy - 2.5 * s, 10 * s, 0, TAU); ctx.fill();
      haze(ctx, -w * 0.3, L.bank - h * 0.16, w * 1.3, L.bank + h * 0.03, '#ff7ab0', 0.24);
      haze(ctx, w * 0.3, L.bank - h * 0.22, w * 1.2, L.bank, '#8a7aff', 0.16);
    }
  }

  /* ---------------- buildings ---------------- */
  function windows(ctx, x, y, W, H, s, night, r, dens, warm) {
    var rows = Math.max(2, Math.floor(H / (3.2 * s))), cols = Math.max(2, Math.floor(W / (3 * s))), cw = W / cols, rh = H / rows, i;
    if (!night) {
      ctx.save(); ctx.globalAlpha = 0.2; ctx.fillStyle = '#ffffff';
      for (i = 0; i < rows; i += 2) ctx.fillRect(x, y + i * rh, W, Math.max(0.5, 0.4 * s));
      ctx.restore(); return;
    }
    var pal = warm ? ['#ffe2a0', '#fff3cc', '#ffcf80'] : ['#cfe6ff', '#ffffff', '#a8d0ff'];
    rects(ctx, rows * cols, [[pal[0], 0.85], [pal[1], 0.75], [pal[2], 0.7]], function (k) {
      var ci = k % cols, ri = (k / cols) | 0; if (r() > (dens || 0.45)) return null;
      return [x + ci * cw + cw * 0.18, y + ri * rh + rh * 0.2, cw * 0.62, rh * 0.5, (r() * 3) | 0];
    });
  }
  function tower(ctx, L, P, night, b) {
    var s = L.s, x = b.x - b.W / 2, base = L.bank + (b.d - 0.5) * 2 * s, top = base - b.H, W = b.W, r = rng(b.seed), tint = P.tints[b.tint || 0], fadeA = 0.5 * (1 - b.d), pts, a;
    if (b.kind === 'slant') pts = [[x, base], [x, top + 12 * s], [x + W, top], [x + W, base]];
    else if (b.kind === 'crown') pts = [[x, base], [x, top + 10 * s], [x + W * 0.2, top + 4 * s], [x + W * 0.5, top - 6 * s], [x + W * 0.8, top + 4 * s], [x + W, top + 10 * s], [x + W, base]];
    else if (b.kind === 'round') { pts = [[x, base]]; for (a = 0; a <= 12; a++) pts.push([x + W * a / 12, top + 6 * s - Math.sin(a / 12 * PI) * 6 * s]); pts.push([x + W, base]); }
    else pts = [[x, base], [x, top], [x + W, top], [x + W, base]];
    ctx.save(); poly(ctx, pts);
    ctx.fillStyle = lg(ctx, x, 0, x + W, 0, [[0, tint[0]], [0.55, tint[1]], [0.94, tint[2]], [1, night ? tint[2] : '#ffffff']]); ctx.fill(); ctx.clip();
    windows(ctx, x, top, W, b.H, s, night, r, 0.4 + r() * 0.25, r() < 0.5);
    ctx.fillStyle = rgba(night ? '#000000' : '#ffffff', night ? 0.25 : 0.14); for (var m = 1; m < 4; m++) ctx.fillRect(x + W * m / 4, top, 0.5 * s, b.H);
    ctx.restore();
    if (fadeA > 0.02) { ctx.save(); poly(ctx, pts); ctx.fillStyle = rgba(night ? '#3a3a7a' : '#e6ece8', fadeA * (night ? 0.5 : 0.75)); ctx.fill(); ctx.restore(); }
    poly(ctx, pts); ink(ctx, L, P, night, 0.3 + b.d * 0.3);
    if (night) { ctx.fillStyle = rgba(r() < 0.5 ? '#7fe0ff' : '#ff8ad0', 0.8); ctx.fillRect(x, top - 0.5 * s, W, 1.2 * s); }
  }

  // the arcology: a terraced mountain of glass and gardens, farther off than Lujiazui, with a train tunnel at its foot
  function arcology(ctx, L, P, night) {
    var s = L.s, A = L.arco, base = L.bank - 2 * s, cx = A.x, tiers = 7, i, r = rng(4747);
    var glass = night ? ['#1c2850', '#26386a', '#3a5288'] : ['#9cbcca', '#bcd6dc', '#e8f2ee'];
    var green = night ? ['#12261e', '#1a3426', '#24442e'] : ['#5f9462', '#7eae6a', '#a8cc84', '#d0e6a8'];
    // the green hill it stands in, with a tunnel mouth
    ctx.fillStyle = night ? '#101e24' : '#8ab27c'; ctx.beginPath(); ctx.moveTo(cx - A.W * 0.75, base + 2 * s);
    ctx.bezierCurveTo(cx - A.W * 0.45, base - 22 * s, cx + A.W * 0.45, base - 22 * s, cx + A.W * 0.75, base + 2 * s); ctx.closePath(); ctx.fill();
    dabs(ctx, 120, [[green[0], 0.8], [green[1], 0.8], [green[2], 0.7]], function () { var u = r() * 2 - 1, x = cx + u * A.W * 0.7; return [x, base - r() * 18 * s * (1 - u * u), (2 + r() * 3) * s, (1.4 + r()) * s, (r() * 3) | 0, 0]; });
    for (i = 0; i < tiers; i++) {
      var t0 = i / tiers, t1 = (i + 1) / tiers, w0 = A.W * (1 - t0 * 0.78) * 0.5, w1 = A.W * (1 - t1 * 0.78) * 0.5, y0 = base - 10 * s - A.H * t0 * 0.9, y1 = base - 10 * s - A.H * t1 * 0.9;
      var pts = [[cx - w0, y0], [cx - w0 * 0.96, y1 + 3 * s], [cx + w0 * 0.96, y1 + 3 * s], [cx + w0, y0]];
      poly(ctx, pts); ctx.fillStyle = lg(ctx, cx - w0, 0, cx + w0, 0, [[0, glass[0]], [0.5, glass[1]], [1, glass[2]]]); ctx.fill();
      // glass bands and the wide terrace on top of each tier, planted with trees
      ctx.fillStyle = rgba(night ? '#ffe0a0' : '#ffffff', night ? 0.6 : 0.35); for (var k = 1; k < 3; k++) ctx.fillRect(cx - w0 * 0.94, lerp(y0, y1, k / 3), w0 * 1.88, 0.8 * s);
      if (night) windows(ctx, cx - w0 * 0.9, y1 + 4 * s, w0 * 1.8, y0 - y1 - 5 * s, s, true, r, 0.3, true);
      poly(ctx, pts); ink(ctx, L, P, night, 0.35);
      ctx.fillStyle = night ? '#1c3424' : '#cfd8c4'; ctx.fillRect(cx - w0 * 0.97, y1 + 1.5 * s, w0 * 1.94, 2 * s);
      var nT = Math.round(w0 / (3.4 * s));
      for (k = 0; k < nT; k++) { var tx = cx - w0 * 0.92 + (k + r() * 0.4) / nT * w0 * 1.84, tr = (1.8 + r() * 1.4) * s;
        ctx.fillStyle = green[(k + i) % 3]; ctx.beginPath(); qell(ctx, tx, y1 + 0.5 * s - tr * 0.4, tr, tr * 0.85, 0); ctx.fill();
        if (!night) { ctx.fillStyle = green[3]; ctx.beginPath(); qell(ctx, tx - tr * 0.3, y1 - tr * 0.7, tr * 0.45, tr * 0.32, 0); ctx.fill(); } }
    }
    // a slim mast on top with a garden crown
    var topY = base - 10 * s - A.H * 0.9;
    ctx.fillStyle = glass[1]; ctx.fillRect(cx - 1.2 * s, topY - 26 * s, 2.4 * s, 26 * s);
    ctx.fillStyle = green[1]; ctx.beginPath(); qell(ctx, cx, topY - 26 * s, 6 * s, 3 * s, 0); ctx.fill();
    // the rail line along the bank and the tunnel mouth in the hill
    ctx.fillStyle = night ? '#0a1018' : '#5a6a58'; ctx.beginPath(); ctx.ellipse(cx + A.W * 0.38, base + 1 * s, 6 * s, 5 * s, 0, PI, TAU); ctx.fill();
    ctx.strokeStyle = night ? '#3a4a6a' : '#7a7a70'; ctx.lineWidth = 0.8 * s; ctx.beginPath(); ctx.moveTo(cx - A.W * 0.8, base + 1 * s); ctx.lineTo(cx + A.W * 0.38, base + 1 * s); ctx.stroke();
    L.arcoTop = [cx, topY - 26 * s]; L.trainY = base; L.tunnelX = cx + A.W * 0.38; L.trainX0 = cx - A.W * 0.8;
  }

  // the Oriental Pearl Tower: three vertical columns from the ground to the upper sphere, three legs splayed out under
  // the big lower sphere, five small spheres between, the upper sphere, a small top sphere and the banded spire
  function pearl(ctx, L, P, night) {
    var s = L.s, x = L.pearl.x, base = L.bank + 1 * s, H = L.pearl.H, u = H / 240;
    var y1 = base - 52 * u, y2 = base - 142 * u, y3 = base - 176 * u, top = base - H;
    var R1 = 17 * u, R2 = 12.5 * u, R3 = 4.6 * u, colC = night ? '#3e3e70' : '#d8d8de', colD = night ? '#20204a' : '#9a9cae';
    function bar(xa, ya, xb, yb, wA, wB, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(xa - wA, ya); ctx.lineTo(xb - wB, yb); ctx.lineTo(xb + wB, yb); ctx.lineTo(xa + wA, ya); ctx.closePath(); ctx.fill(); ink(ctx, L, P, night, 0.4); }
    bar(x + 26 * u, base, x + 8 * u, y1 + R1 * 0.5, 3 * u, 2.2 * u, colD);
    bar(x - 26 * u, base, x - 8 * u, y1 + R1 * 0.5, 3.2 * u, 2.4 * u, colC); bar(x + 26 * u, base, x + 8 * u, y1 + R1 * 0.5, 3.2 * u, 2.4 * u, mix(colC, colD, 0.5));
    for (var k = -1; k <= 1; k++) bar(x + k * 5.6 * u, base, x + k * 5.6 * u, y2, 2.4 * u, 2 * u, k === 1 ? colD : colC);
    function sphere(cx, cy, R, hi) {
      ctx.fillStyle = rg(ctx, cx - R * 0.4, cy - R * 0.45, R * 0.1, R * 1.1, night ? [[0, P.pearlHi], [0.45, P.pearl], [1, '#6a1a5a']] : [[0, '#ffe8f0'], [0.35, P.pearlHi], [0.78, P.pearl], [1, '#a03a66']]);
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill(); ink(ctx, L, P, night, 0.5);
      ctx.strokeStyle = rgba(night ? '#ffd0f0' : '#ffffff', 0.45); ctx.lineWidth = 0.6 * s;
      for (var b = -2; b <= 2; b++) { ctx.beginPath(); ctx.ellipse(cx, cy + b * R * 0.33, R * Math.sqrt(1 - Math.pow(b * 0.33, 2)), R * 0.08, 0, 0, PI); ctx.stroke(); }
      if (hi) { ctx.fillStyle = rgba('#ffffff', 0.6); ctx.beginPath(); qell(ctx, cx - R * 0.42, cy - R * 0.42, R * 0.25, R * 0.14, -0.6); ctx.fill(); }
    }
    if (night) { softGlow(ctx, x, y1, 60 * u, '#ff4aa0', 0.35); softGlow(ctx, x, y2, 40 * u, '#ff6ab8', 0.3); }
    sphere(x, y1, R1, true);
    [[-5.6, 0.3], [5.6, 0.42], [0, 0.55], [-5.6, 0.68], [5.6, 0.8]].forEach(function (q) { sphere(x + q[0] * u, lerp(y1 - R1, y2 + R2, q[1]), 3.4 * u, false); });
    sphere(x, y2, R2, true);
    bar(x, y2 - R2 * 0.8, x, y3, 2.6 * u, 2 * u, colC);
    sphere(x, y3, R3, false);
    ctx.fillStyle = night ? '#c8c8f0' : '#eceef4'; ctx.beginPath(); ctx.moveTo(x - 1.6 * u, y3 - R3); ctx.lineTo(x - 0.4 * u, top); ctx.lineTo(x + 0.4 * u, top); ctx.lineTo(x + 1.6 * u, y3 - R3); ctx.closePath(); ctx.fill(); ink(ctx, L, P, night, 0.4);
    ctx.fillStyle = night ? '#ff8ac8' : '#d0507e'; for (var q2 = 0; q2 < 4; q2++) ctx.fillRect(x - 1.2 * u, lerp(y3 - R3, top, 0.15 + q2 * 0.2), 2.4 * u, 1.4 * u);
    L.pearlTop = [x, top];
  }

  // Jin Mao: a stepped steel pagoda that narrows in tiers, with a spire
  function jinmao(ctx, L, P, night) {
    var s = L.s, x = L.jinmao.x, base = L.bank, H = L.jinmao.H, W = L.jinmao.W, r = rng(5150);
    var tiers = 13, y = base, wd = W, i, th;
    var body = night ? ['#1c2248', '#2a325e', '#4a5490'] : ['#8a94a6', '#b4bcc8', '#eceef2'];
    for (i = 0; i < tiers; i++) {
      th = H * 0.7 * Math.pow(0.86, i) * 0.17 + 2 * s;
      var w0 = wd, w1 = wd * 0.94;
      ctx.fillStyle = lg(ctx, x - w0 / 2, 0, x + w0 / 2, 0, [[0, body[0]], [0.6, body[1]], [1, body[2]]]);
      ctx.beginPath(); ctx.moveTo(x - w0 / 2, y); ctx.lineTo(x - w1 / 2, y - th); ctx.lineTo(x + w1 / 2, y - th); ctx.lineTo(x + w0 / 2, y); ctx.closePath(); ctx.fill(); ink(ctx, L, P, night, 0.4);
      ctx.fillStyle = rgba(night ? '#ffd890' : '#ffffff', night ? 0.6 : 0.5); ctx.fillRect(x - w1 / 2, y - th, w1, 0.8 * s);
      windows(ctx, x - w0 / 2 + 1 * s, y - th + 1.5 * s, w0 - 2 * s, th - 2 * s, s, night, r, 0.35, true);
      ctx.fillStyle = rgba('#20283c', night ? 0.4 : 0.22); for (var m = -2; m <= 2; m++) ctx.fillRect(x + m * w0 * 0.18 - 0.4 * s, y - th, 0.8 * s, th);
      y -= th; wd = i < 8 ? w1 * 0.985 : w1 * 0.86;
    }
    ctx.fillStyle = body[1]; ctx.beginPath(); ctx.moveTo(x - wd / 2, y); ctx.lineTo(x - wd * 0.18, y - 14 * s); ctx.lineTo(x + wd * 0.18, y - 14 * s); ctx.lineTo(x + wd / 2, y); ctx.closePath(); ctx.fill(); ink(ctx, L, P, night, 0.4);
    if (night) softGlow(ctx, x, y - 8 * s, 18 * s, '#ffd890', 0.45);
    ctx.fillStyle = night ? '#ffe0a0' : '#eef2f8'; ctx.beginPath(); ctx.moveTo(x - 1.4 * s, y - 14 * s); ctx.lineTo(x, base - H); ctx.lineTo(x + 1.4 * s, y - 14 * s); ctx.fill();
    L.jinmaoTop = [x, base - H];
  }

  // Shanghai Tower: a glass tower that tapers and twists as it rises; a notch spirals up the side to a sloped crown
  function shTower(ctx, L, P, night) {
    var s = L.s, x = L.tower.x, base = L.bank, H = L.tower.H, W = L.tower.W, N = 40, i, Lp = [], Rp = [];
    for (i = 0; i <= N; i++) {
      var t = i / N, y = base - H * t * 0.96, half = W / 2 * (1 - t * 0.5), tw = Math.sin(t * PI * 1.2) * W * 0.08;
      Lp.push([x - half + tw, y]); Rp.push([x + half * (1 - 0.12 * t) + tw, y]);
    }
    var tl = Lp[N], tr = Rp[N];
    var pts = Lp.concat([[tl[0] + (tr[0] - tl[0]) * 0.22, base - H], [tr[0] + 0.5 * s, base - H * 0.935]]).concat(Rp.slice().reverse());
    ctx.save(); poly(ctx, pts);
    ctx.fillStyle = lg(ctx, x - W / 2, 0, x + W / 2, 0, night ? [[0, '#16204a'], [0.55, '#24366a'], [1, '#3a5294']] : [[0, '#7a9cbc'], [0.5, '#aac6da'], [0.85, '#dfecf2'], [1, '#ffffff']]);
    ctx.fill(); ctx.clip();
    // the spiral notch, drawn as three rising arcs across the facade
    for (var g = 0; g < 3; g++) { ctx.beginPath(); var started = false;
      for (i = 0; i <= N; i++) { var t2 = i / N, f = t2 * 3 - g; if (f < 0 || f > 1) continue; var xx = lerp(Rp[i][0], Lp[i][0], 0.08 + 0.84 * f); if (!started) { ctx.moveTo(xx, Lp[i][1]); started = true; } else ctx.lineTo(xx, Lp[i][1]); }
      ctx.strokeStyle = rgba(night ? '#0a0e2c' : '#5a7a98', night ? 0.7 : 0.5); ctx.lineWidth = 2.2 * s; ctx.stroke(); ctx.strokeStyle = rgba('#ffffff', night ? 0.15 : 0.55); ctx.lineWidth = 0.7 * s; ctx.stroke(); }
    var r = rng(5252);
    for (i = 2; i < N; i += 1) { var a = Lp[i], b = Rp[i]; ctx.strokeStyle = rgba(night ? '#9ad0ff' : '#ffffff', night ? 0.1 + r() * 0.3 : 0.18); ctx.lineWidth = 0.5 * s; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo((a[0] + b[0]) / 2, a[1] + 1.4 * s, b[0], b[1]); ctx.stroke(); }
    if (night) windows(ctx, x - W / 2, base - H * 0.9, W, H * 0.88, s, true, r, 0.22, false);
    ctx.restore();
    poly(ctx, pts); ink(ctx, L, P, night, 0.45);
    L.towerTop = [tl[0] + (tr[0] - tl[0]) * 0.22, base - H];
  }

  // the World Financial Center: a slab that narrows to a blade at the top, with a trapezoid opening through it
  function swfc(ctx, L, P, night) {
    var s = L.s, x = L.swfc.x, base = L.bank, H = L.swfc.H, W = L.swfc.W, top = base - H;
    var pts = [[x - W / 2, base], [x - W * 0.2, top], [x + W * 0.2, top], [x + W / 2, base]];
    ctx.save(); poly(ctx, pts);
    ctx.fillStyle = lg(ctx, x - W / 2, 0, x + W / 2, 0, night ? [[0, '#141c44'], [0.5, '#1e2a5a'], [1, '#34468a']] : [[0, '#6a8eb2'], [0.5, '#98b6d0'], [0.9, '#d6e6ee'], [1, '#ffffff']]);
    ctx.fill(); ctx.clip();
    ctx.fillStyle = rgba(night ? '#000010' : '#3e5c86', night ? 0.25 : 0.18); ctx.beginPath(); ctx.moveTo(x - W / 2, base); ctx.lineTo(x - W * 0.2, top); ctx.lineTo(x - W * 0.02, top); ctx.lineTo(x - W * 0.08, base); ctx.fill();
    var r = rng(5353); windows(ctx, x - W / 2, top + 20 * s, W, H - 20 * s, s, night, r, 0.3, false);
    ctx.restore();
    poly(ctx, pts); ink(ctx, L, P, night, 0.45);
    var oy0 = top + 5 * s, oy1 = top + 19 * s;
    ctx.fillStyle = night ? mix(P.sky[1][1], P.sky[2][1], 0.4) : mix(P.sky[2][1], P.sky[3][1], 0.3);
    ctx.beginPath(); ctx.moveTo(x - W * 0.175, oy0); ctx.lineTo(x + W * 0.175, oy0); ctx.lineTo(x + W * 0.13, oy1); ctx.lineTo(x - W * 0.13, oy1); ctx.closePath(); ctx.fill();
    ink(ctx, L, P, night, 0.5); if (night) { ctx.strokeStyle = rgba('#7fe0ff', 0.9); ctx.lineWidth = 0.8 * s; ctx.stroke(); }
    L.swfcTop = [x, top];
  }

  // the sister hospital: a low white building at the water with planted terraces and a teal cross
  function hospital(ctx, L, P, night) {
    var s = L.s, x = L.hosp.x, y = L.hosp.y, W = L.hosp.W, H = L.hosp.H, i;
    var wall = night ? '#4a5078' : '#f6f4ee', wallSh = night ? '#2c3058' : '#d2d6d8', glassC = night ? '#ffe4a8' : '#9ec4d8';
    var wings = [[x - W * 0.5, W * 0.4, H * 0.6], [x - W * 0.12, W * 0.38, H], [x + W * 0.24, W * 0.3, H * 0.72]];
    for (i = 0; i < wings.length; i++) {
      var wx = wings[i][0], ww = wings[i][1], wh = wings[i][2];
      ctx.beginPath(); rrect(ctx, wx, y - wh, ww, wh, 3 * s); ctx.fillStyle = lg(ctx, wx, 0, wx + ww, 0, [[0, wallSh], [0.4, wall], [1, wall]]); ctx.fill(); ink(ctx, L, P, night, 0.4);
      ctx.fillStyle = rgba(glassC, night ? 0.85 : 0.8); for (var k = 0; k < 3; k++) ctx.fillRect(wx + 2 * s, y - wh + (5 + k * 7) * s, ww - 4 * s, 2.6 * s);
      var r = rng(600 + i); dabs(ctx, 26, [[P.green[1], 0.95], [P.green[2], 0.9], [P.green[3], 0.8]], function () { return [wx + r() * ww, y - wh - r() * 2 * s, (2 + r() * 2.5) * s, (1.2 + r()) * s, (r() * 3) | 0, 0]; });
    }
    var cx = x - W * 0.12 + W * 0.19, cy = y - H - 8 * s;
    if (night) softGlow(ctx, cx, cy, 16 * s, '#3ad8c8', 0.6);
    ctx.fillStyle = '#16b3a6'; ctx.beginPath(); rrect(ctx, cx - 5 * s, cy - 1.8 * s, 10 * s, 3.6 * s, 1 * s); rrect(ctx, cx - 1.8 * s, cy - 5 * s, 3.6 * s, 10 * s, 1 * s); ctx.fill();
    L.hospCross = [cx, cy];
  }

  function farBank(ctx, L, P, night) {
    var w = L.w, s = L.s, y = L.bank, r = rng(4411), i;
    ctx.fillStyle = night ? '#1a1c40' : '#8a9a84'; ctx.fillRect(0, y - 3 * s, w, 5 * s);
    for (i = 0; i < 40; i++) { var tx = r() * w, rr = (2.5 + r() * 3) * s; if (tx > L.hosp.x - L.hosp.W * 0.5 && tx < L.hosp.x + L.hosp.W * 0.55 && r() < 0.7) continue;
      ctx.save(); ctx.translate(tx, y - 1 * s); clump(ctx, 0, -rr * 0.6, rr, night ? ['#0c1418', '#121e20', '#1a2a26', '#22342c', '#2a3e32'] : ['#4a6a4a', '#5a7e52', '#6e965e', '#8aae6c', '#b4d08e'], r, 0.7, -0.6, false, 0.5); ctx.restore(); }
    ctx.fillStyle = night ? '#2a2a50' : '#c4bca8'; ctx.fillRect(0, y + 1 * s, w, 2.4 * s);
    if (night) dots(ctx, 60, [['#ffe0a0', 0.9]], function (k) { return [k / 60 * w + r() * 2 * s, y - 2 * s, 0.9 * s, 0]; });
  }

  /* ---------------- the river ---------------- */
  function river(ctx, L, P, night) {
    var w = L.w, h = L.h, s = L.s, y0 = L.bank + 3.4 * s, y1 = L.rail + 6 * s, r = rng(night ? 7272 : 7171);
    ctx.fillStyle = lg(ctx, 0, y0, 0, y1, [[0, P.water[0]], [0.5, P.water[1]], [1, P.water[2]]]); ctx.fillRect(0, y0, w, y1 - y0);
    reflect(ctx, w, y0, y1, night ? 0.78 : 0.5, 3 * s, 0.09 / s, 1.3, 0.85);
    ctx.fillStyle = lg(ctx, 0, y0, 0, y1, [[0, rgba(P.water[0], night ? 0.12 : 0.22)], [1, rgba(P.water[2], night ? 0.45 : 0.55)]]); ctx.fillRect(0, y0, w, y1 - y0);
    batch(ctx, 800, [[rgba(night ? '#8a90d0' : '#ffffff', 1), 0.7 * s, night ? 0.2 : 0.3], [rgba(night ? '#000010' : '#2a4a70', 1), 0.8 * s, 0.2]], function () {
      var p = Math.pow(r(), 0.8), y = lerp(y0, y1, p), x = r() * w, l = (3 + p * 16 + r() * 6) * s; return [x, y, x + l, y, r() < 0.55 ? 0 : 1]; });
    if (!night) {
      dots(ctx, 220, [['#fff8e0', 0.9], ['#ffe6b0', 0.7]], function () { var p = r(), y = lerp(y0, y1, p), x = w * (0.96 - p * 0.05) + (r() - 0.5) * w * (0.08 + p * 0.22); return [x, y, (0.4 + r() * 0.8) * s * (0.6 + p), r() < 0.5 ? 0 : 1]; });
      haze(ctx, -w * 0.1, y0 - 2 * s, w * 1.1, y0 + h * 0.02, '#eef0ea', 0.35);
    }
  }

  /* ---------------- the Bund promenade (where we stand) ---------------- */
  function promenade(ctx, L, P, night) {
    var w = L.w, h = L.h, s = L.s, r = rng(night ? 3232 : 3131), i;
    var yW = L.wall, yR = L.rail, vx = w * 0.5, vy = L.bank;
    ctx.fillStyle = lg(ctx, 0, yW, 0, h, [[0, P.stone[0]], [0.4, P.stone[1]], [1, P.stone[2]]]); ctx.fillRect(0, yW, w, h - yW);
    // paving joints in true perspective toward the vanishing point on the far bank
    ctx.save(); ctx.beginPath(); ctx.rect(0, yW, w, h - yW); ctx.clip();
    ctx.strokeStyle = rgba(night ? '#14121e' : '#8a7c66', night ? 0.45 : 0.32); ctx.lineWidth = 0.7 * s; ctx.beginPath();
    for (i = -14; i <= 14; i++) { var xb = vx + i * w * 0.13; ctx.moveTo(vx + (xb - vx) * (yW - vy) / (h - vy), yW); ctx.lineTo(xb, h); }
    for (i = 1; i < 12; i++) { var z = 1 + i * 0.55, yy = vy + (h - vy) * 1.9 / z; if (yy < yW || yy > h) continue; ctx.moveTo(0, yy); ctx.lineTo(w, yy); }
    ctx.stroke(); ctx.restore();
    dabs(ctx, 600, [[P.stone[3], 0.22], [P.stone[2], 0.16], [mix(P.stone[1], '#ffffff', 0.3), 0.14]], function () { var p = Math.pow(r(), 0.8), y = lerp(yW, h, p); return [r() * w, y, (2 + p * 9) * s, (0.6 + p * 1.8) * s, (r() * 3) | 0, 0]; });
    var bh = 20 * s, n = Math.round(w / (10 * s));
    if (!night) {
      // long morning shadows of the balusters, falling toward us and to the left (the sun is over the river, right)
      ctx.save(); ctx.fillStyle = rgba('#6a5a7a', 0.16); ctx.beginPath();
      for (i = 0; i <= n; i++) { var bx0 = i * w / n; ctx.moveTo(bx0 - 1.4 * s, yW); ctx.lineTo(bx0 + 1.4 * s, yW); ctx.lineTo(bx0 - 24 * s, yW + 46 * s); ctx.lineTo(bx0 - 29 * s, yW + 46 * s); ctx.closePath(); }
      ctx.fill(); ctx.fillRect(0, yW, w, 4 * s); ctx.restore();
      ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = lg(ctx, 0, yW, 0, h, [[0, rgba('#fff0d8', 0.6)], [1, rgba('#fff0d8', 0)]]); ctx.fillRect(0, yW, w, h - yW); ctx.restore();
    } else {
      for (i = 0; i < L.lamps.length; i++) softGlow(ctx, L.lamps[i], h * 0.86, 120 * s, '#ffd890', 0.3);
      softGlow(ctx, w / 2, yW + 10 * s, w * 0.6, '#ff8ac0', 0.1);
    }
    // the balustrade: a broad stone handrail on round-bellied balusters, with square pillars and flower boxes
    ctx.fillStyle = mix(P.railSh, P.stone[2], 0.4); ctx.fillRect(0, yR + bh, w, yW - yR - bh);
    for (i = 0; i <= n; i++) { var bx = i * w / n, by = yR + 3 * s;
      ctx.beginPath(); ctx.moveTo(bx - 1.6 * s, by); ctx.bezierCurveTo(bx - 4 * s, by + bh * 0.45, bx - 3.4 * s, by + bh * 0.7, bx - 2 * s, by + bh - 2 * s); ctx.lineTo(bx + 2 * s, by + bh - 2 * s);
      ctx.bezierCurveTo(bx + 3.4 * s, by + bh * 0.7, bx + 4 * s, by + bh * 0.45, bx + 1.6 * s, by); ctx.closePath();
      ctx.fillStyle = lg(ctx, bx - 4 * s, 0, bx + 4 * s, 0, [[0, P.rail], [0.6, mix(P.rail, P.railSh, 0.4)], [1, P.railSh]]); ctx.fill(); ink(ctx, L, P, night, 0.25); }
    ctx.beginPath(); ctx.rect(0, yR - 4 * s, w, 7 * s); ctx.fillStyle = lg(ctx, 0, yR - 4 * s, 0, yR + 3 * s, [[0, mix(P.rail, '#ffffff', night ? 0.1 : 0.45)], [1, P.railSh]]); ctx.fill();
    ctx.strokeStyle = rgba(P.line, 0.3); ctx.lineWidth = 0.7 * s; ctx.beginPath(); ctx.moveTo(0, yR - 4 * s); ctx.lineTo(w, yR - 4 * s); ctx.moveTo(0, yR + 3 * s); ctx.lineTo(w, yR + 3 * s); ctx.stroke();
    ctx.fillStyle = P.railSh; ctx.fillRect(0, yR + bh + 1 * s, w, 3.4 * s);
    for (i = 0; i < 4; i++) { var px = w * (0.14 + i * 0.24);
      ctx.beginPath(); ctx.rect(px - 6 * s, yR - 7 * s, 12 * s, bh + 11 * s); ctx.fillStyle = lg(ctx, px - 6 * s, 0, px + 6 * s, 0, [[0, P.rail], [0.6, P.rail], [1, P.railSh]]); ctx.fill(); ink(ctx, L, P, night, 0.3);
      ctx.fillStyle = mix(P.rail, '#ffffff', 0.35); ctx.fillRect(px - 7.5 * s, yR - 10 * s, 15 * s, 3 * s);
      var rf = rng(90 + i); dots(ctx, 30, [[night ? '#8a3050' : '#e0584a', 0.95], [night ? '#8a7030' : '#f4c04a', 0.9], [P.green[1], 0.9]], function () { return [px + (rf() - 0.5) * 14 * s, yR - 11 * s - rf() * 5 * s, (1.1 + rf() * 1.2) * s, (rf() * 3) | 0]; }); }
    // the old Bund lamp posts at the sides: dark green iron, a fluted post, a cross arm with two glass globes
    for (i = 0; i < L.lamps.length; i++) { var lx = L.lamps[i], ly = h * 0.9, lt = h * 0.5, iron = night ? '#141a24' : '#2e4038', ironHi = night ? '#2a3448' : '#4e665a';
      ctx.fillStyle = iron; ctx.beginPath(); ctx.moveTo(lx - 10 * s, ly); ctx.lineTo(lx - 8 * s, ly - 14 * s); ctx.lineTo(lx - 4.4 * s, ly - 20 * s); ctx.lineTo(lx - 3 * s, lt + 10 * s); ctx.lineTo(lx + 3 * s, lt + 10 * s); ctx.lineTo(lx + 4.4 * s, ly - 20 * s); ctx.lineTo(lx + 8 * s, ly - 14 * s); ctx.lineTo(lx + 10 * s, ly); ctx.closePath(); ctx.fill();
      ctx.fillStyle = ironHi; ctx.fillRect(lx - 1.2 * s, lt + 10 * s, 0.9 * s, ly - lt - 30 * s); ctx.fillRect(lx - 6 * s, ly - 13 * s, 2 * s, 12 * s);
      ctx.strokeStyle = iron; ctx.lineWidth = 2.6 * s; ctx.beginPath(); ctx.moveTo(lx - 14 * s, lt + 4 * s); ctx.quadraticCurveTo(lx, lt + 12 * s, lx + 14 * s, lt + 4 * s); ctx.moveTo(lx, lt + 10 * s); ctx.lineTo(lx, lt - 2 * s); ctx.stroke();
      [[-14, 4], [14, 4], [0, -6]].forEach(function (g) { var gx = lx + g[0] * s, gy = lt + g[1] * s - 5 * s;
        if (night) softGlow(ctx, gx, gy, 30 * s, '#ffe4a8', 0.6);
        ctx.fillStyle = iron; ctx.fillRect(gx - 2.4 * s, gy + 4 * s, 4.8 * s, 2 * s);
        ctx.fillStyle = night ? '#fff4d6' : '#f8f6ee'; ctx.beginPath(); ctx.arc(gx, gy, 6.6 * s, 0, TAU); ctx.fill(); ctx.strokeStyle = rgba(P.line, 0.35); ctx.lineWidth = 0.6 * s; ctx.stroke();
        ctx.fillStyle = rgba('#ffffff', 0.8); ctx.beginPath(); ctx.arc(gx - 1.6 * s, gy - 1.6 * s, 1.4 * s, 0, TAU); ctx.fill();
        ctx.fillStyle = iron; ctx.beginPath(); ctx.moveTo(gx - 2 * s, gy - 5 * s); ctx.lineTo(gx, gy - 8 * s); ctx.lineTo(gx + 2 * s, gy - 5 * s); ctx.fill(); });
    }
    ctx.fillStyle = lg(ctx, 0, h * 0.8, 0, h, [[0, rgba('#1a1420', 0)], [1, rgba('#1a1420', night ? 0.4 : 0.16)]]); ctx.fillRect(0, h * 0.8, w, h * 0.2);
  }

  function paintScene(ctx, w, h, night) {
    if (!bind()) return;
    var L = layout(w, h), P = night ? PAL.night : PAL.day, i;
    sky(ctx, L, P, night);
    // the farthest towers, pale in the haze
    var rf = rng(1919);
    for (i = 0; i < 16; i++) { var fx = rf() * w, fw = (10 + rf() * 16) * L.s, fh = (24 + rf() * 50) * L.s; if (fx > w * 0.26 && fx < w * 0.6) continue;
      ctx.fillStyle = mix(P.far, P.sky[3][1], night ? 0.1 : 0.35); ctx.fillRect(fx - fw / 2, L.bank - fh, fw, fh);
      if (night) windows(ctx, fx - fw / 2, L.bank - fh, fw, fh, L.s, true, rf, 0.18, true); }
    arcology(ctx, L, P, night);
    haze(ctx, -w * 0.2, L.bank - h * 0.06, w * 1.2, L.bank + h * 0.01, night ? '#4a3a7a' : '#eeeee4', night ? 0.3 : 0.4);
    for (i = 0; i < L.blds.length; i++) if (L.blds[i].d < 0.3) tower(ctx, L, P, night, L.blds[i]);
    shTower(ctx, L, P, night); swfc(ctx, L, P, night); jinmao(ctx, L, P, night);
    for (i = 0; i < L.blds.length; i++) if (L.blds[i].d >= 0.3) tower(ctx, L, P, night, L.blds[i]);
    pearl(ctx, L, P, night); hospital(ctx, L, P, night); farBank(ctx, L, P, night);
    river(ctx, L, P, night);
    promenade(ctx, L, P, night);
    finish(ctx, w, h, P.grade, P.gradeA, P.vig, 0.03, night ? '#06061a' : '#1a1420', 0.42);
  }

  /* ---------------- the moving layer ---------------- */
  function ferry(ctx, x, y, sz, night, dir) {
    ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
    ctx.fillStyle = night ? '#d8dcf0' : '#f8f6f0'; ctx.beginPath(); ctx.moveTo(-sz * 1.6, -sz * 0.35); ctx.lineTo(sz * 1.75, -sz * 0.35); ctx.lineTo(sz * 1.4, sz * 0.1); ctx.lineTo(-sz * 1.45, sz * 0.1); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(40,50,80,.45)'; ctx.lineWidth = Math.max(0.6, sz * 0.06); ctx.stroke();
    ctx.fillStyle = '#16b3a6'; ctx.fillRect(-sz * 1.5, -sz * 0.2, sz * 3.1, sz * 0.1);
    ctx.fillStyle = night ? '#ffe4a0' : '#9ec4d8'; ctx.fillRect(-sz * 1.0, -sz * 0.75, sz * 2.0, sz * 0.38);
    ctx.fillStyle = night ? '#2a3060' : '#2b3466'; ctx.fillRect(-sz * 1.15, -sz * 0.9, sz * 2.3, sz * 0.16);
    ctx.restore();
  }
  function overlay(ctx, w, h, t, night) {
    if (!bind()) return;
    var L = layout(w, h), s = L.s, i;
    ctx.save();
    var lanes = [[L.bank + 30 * s, 9 * s, 0.011, 1, 0.1], [L.bank + 66 * s, 14 * s, 0.008, -1, 0.6], [L.bank + 14 * s, 6 * s, 0.015, -1, 0.35]];
    for (i = 0; i < lanes.length; i++) { var ln = lanes[i], p = (t * ln[2] + ln[4]) % 1, x = ln[3] > 0 ? lerp(-w * 0.15, w * 1.15, p) : lerp(w * 1.15, -w * 0.15, p), y = ln[0];
      ctx.fillStyle = rgba(night ? '#a0a8e0' : '#ffffff', 0.35); ctx.beginPath(); qell(ctx, x - ln[3] * ln[1] * 2.6, y + ln[1] * 0.12, ln[1] * 2.2, ln[1] * 0.12, 0); ctx.fill();
      ferry(ctx, x, y, ln[1], night, ln[3]);
      if (night) { var sp = glowSpr('#fff0c0'); if (sp) { ctx.globalAlpha = 0.5; ctx.drawImage(sp, x - ln[1] * 2, y - ln[1] * 1.6, ln[1] * 4, ln[1] * 2.4); ctx.globalAlpha = 1; } } }
    // a train slipping along the far bank and into the green tunnel under the arcology
    if (L.trainY) { var tp = (t * 0.03) % 1, len = 34 * s, tx = lerp(L.trainX0 - len, L.tunnelX + len, tp);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, L.tunnelX, h); ctx.clip();
      ctx.fillStyle = night ? '#e8ecff' : '#ffffff'; ctx.beginPath(); rrect(ctx, tx - len, L.trainY - 3.6 * s, len, 3.6 * s, 1.6 * s); ctx.fill();
      ctx.fillStyle = night ? '#ffe0a0' : '#16b3a6'; ctx.fillRect(tx - len + 2 * s, L.trainY - 2.6 * s, len - 4 * s, 1 * s); ctx.restore(); }
    for (i = 0; i < 3; i++) { var ph = t * (0.022 + i * 0.006) + i * 0.33, dx = w * ((ph % 1) * 1.3 - 0.15), dy = h * (0.3 + i * 0.03) + Math.sin(t * 0.8 + i) * 3 * s;
      K.drawDrone(ctx, dx, dy, (1.4 + i * 0.2) * s, night ? '#c8d0f0' : '#f4f6fb', Math.pow(Math.max(0, Math.sin(t * 4 + i)), 6), i % 2 ? '#7ff7e4' : '#ff6a5a'); }
    var ap = (t * 0.008) % 1, ax = lerp(-w * 0.1, w * 1.1, ap), ay = h * 0.19 - Math.sin(ap * PI) * h * 0.03;
    ctx.fillStyle = night ? '#dfe4ff' : '#ffffff'; ctx.beginPath(); qell(ctx, ax, ay, 6 * s, 2.2 * s, 0); ctx.fill(); ctx.fillStyle = night ? '#ffe0a0' : '#4a6a9a'; ctx.fillRect(ax - 2 * s, ay - 1.2 * s, 4 * s, 1.2 * s);
    ctx.strokeStyle = rgba(night ? '#dfe4ff' : '#ffffff', 0.8); ctx.lineWidth = 0.6 * s; ctx.beginPath(); for (var q = -1; q <= 1; q += 2) { var rr = 3.2 * s, a = t * 18 + q; ctx.moveTo(ax + q * 6 * s - Math.cos(a) * rr, ay - 2.6 * s); ctx.lineTo(ax + q * 6 * s + Math.cos(a) * rr, ay - 2.6 * s); } ctx.stroke();
    ctx.strokeStyle = night ? 'rgba(220,220,255,.5)' : 'rgba(60,70,100,.75)'; ctx.lineWidth = 1.1 * s; ctx.lineCap = 'round';
    for (i = 0; i < 3; i++) { var gp = (t * (0.02 + i * 0.004) + i * 0.33) % 1, gx = lerp(w * 1.1, -w * 0.1, gp), gy = h * (0.12 + i * 0.05) + Math.sin(t * 0.9 + i * 2) * 8 * s; drawBird(ctx, gx, gy, (4 + i) * s, t * 3 + i); }
    var tops = [L.towerTop, L.swfcTop, L.jinmaoTop, L.pearlTop, L.arcoTop];
    for (i = 0; i < tops.length; i++) { if (!tops[i]) continue; var bl = Math.pow(Math.max(0, Math.sin(t * 1.6 + i * 1.3)), 10), sp2 = glowSpr('#ff4a3a', true); if (sp2 && bl > 0.02) { ctx.globalAlpha = bl; var z = 5 * s; ctx.drawImage(sp2, tops[i][0] - z, tops[i][1] - z, z * 2, z * 2); ctx.globalAlpha = 1; } }
    var r = rng(77), y0 = L.bank + 4 * s, y1 = L.rail;
    ctx.fillStyle = night ? '#ffffff' : '#fffbe8';
    for (i = 0; i < 70; i++) { var gx2 = r() * w, gy2 = lerp(y0, y1, Math.pow(r(), 0.7)), tw = Math.pow(Math.max(0, Math.sin(t * (1.2 + r() * 2) + r() * 9)), 12);
      if (!night && gx2 < w * 0.55 && r() < 0.6) continue;
      if (tw > 0.05) { ctx.globalAlpha = tw * (night ? 0.55 : 0.8); ctx.fillRect(gx2, gy2, (2 + r() * 5) * s, 0.7 * s); } }
    ctx.globalAlpha = 1;
    if (night) { var pb = 0.5 + 0.5 * Math.sin(t * 0.6), px = L.pearl.x, u = L.pearl.H / 240;
      var spP = glowSpr(pb > 0.5 ? '#ff5ab0' : '#b06aff'); if (spP) { ctx.globalAlpha = 0.18 + 0.12 * pb; ctx.drawImage(spP, px - 36 * u, L.bank - 88 * u, 72 * u, 72 * u); ctx.drawImage(spP, px - 26 * u, L.bank - 168 * u, 52 * u, 52 * u); ctx.globalAlpha = 1; } }
    ctx.restore();
  }

  PAINT.shanghai = { focus: { x: 0.77, y: 0.2 }, track: 'morning', anchors: { pearl: { x: 0.16, y: 0.3 }, tower: { x: 0.77, y: 0.2 }, hospital: { x: 0.52, y: 0.41 }, arcology: { x: 0.43, y: 0.3 } },
    paint: function (ctx, w, h) { ctx.save(); try { paintScene(ctx, w, h, false); } catch (e) { PAINT._err = 'shanghai: ' + String(e && e.stack || e); } finally { ctx.restore(); } },
    overlay: function (ctx, w, h, t) { ctx.save(); try { overlay(ctx, w, h, t, false); } catch (e) { PAINT._err = 'shanghai overlay: ' + String(e && e.stack || e); } finally { ctx.restore(); } } };
  PAINT.shanghai_night = { focus: { x: 0.16, y: 0.3 }, track: 'night', anchors: { pearl: { x: 0.16, y: 0.3 }, tower: { x: 0.77, y: 0.2 } },
    paint: function (ctx, w, h) { ctx.save(); try { paintScene(ctx, w, h, true); } catch (e) { PAINT._err = 'shanghai_night: ' + String(e && e.stack || e); } finally { ctx.restore(); } },
    overlay: function (ctx, w, h, t) { ctx.save(); try { overlay(ctx, w, h, t, true); } catch (e) { PAINT._err = 'shanghai_night overlay: ' + String(e && e.stack || e); } finally { ctx.restore(); } } };

  /* tappable things on the promenade */
  if (typeof LATE !== 'undefined') LATE.push(function () {
    if (typeof PROPS === 'undefined' || typeof PROPS_ART === 'undefined') return;
    // a bamboo steamer of soup dumplings, still steaming
    PROPS_ART.sh_steamer = function () { return '<svg viewBox="0 0 80 64"><ellipse cx="40" cy="60" rx="32" ry="4" fill="rgba(0,0,0,.18)"/><g class="pa-steam"><path d="M28 18 q-5 -7 2 -12 q5 -5 0 -10 M46 18 q-5 -7 2 -12 q5 -5 0 -10" stroke="#fff" stroke-width="3.2" fill="none" stroke-linecap="round" opacity=".85"/></g>' +
      '<g class="pa-body"><path d="M8 34 h64 v16 a6 6 0 0 1 -6 6 h-52 a6 6 0 0 1 -6 -6z" fill="#d8b070" stroke="#7a5426" stroke-width="2.4"/><path d="M8 40 h64 M8 46 h64" stroke="#a8803e" stroke-width="1.6"/>' +
      [16, 30, 44, 58].map(function (x, i) { return '<path d="M' + (x - 7) + ' 34 C' + (x - 7) + ' 24 ' + (x + 7) + ' 24 ' + (x + 7) + ' 34Z" fill="#fff8ec" stroke="#c8b8a0" stroke-width="1.6"/><path d="M' + x + ' 26 l-3 6 M' + x + ' 26 l3 6 M' + x + ' 26 v7" stroke="#d8c8b0" stroke-width="1"/>'; }).join('') + '</g></svg>'; };
    PROPS.shanghai = [
      { id: 'pigeon', x: 12, y: 90, w: 40, sfx: 'flap', fx: 'flyaway' },
      { id: 'person', x: 27, y: 86, w: 48, talk: 'shanghai', look: { skin: '#f2cfb4', shirt: '#e0584a', hair: '#1a1416' } },
      { id: 'sh_steamer', x: 52, y: 95, w: 56, sfx: 'pop', fx: 'jiggle', burst: 'steam' },
      { id: 'person', x: 73, y: 84, w: 44, talk: 'shanghai', look: { skin: '#e8bf9c', shirt: '#3d6b9a', hair: '#2a2420' } },
      { id: 'robot', x: 88, y: 92, w: 40, sfx: 'beep', fx: 'spin' }
    ];
    PROPS.shanghai_night = [{ id: 'person', x: 30, y: 86, w: 46, talk: 'shanghai', look: { skin: '#f2cfb4', shirt: '#6c5ce7', hair: '#1a1416' } }, { id: 'pigeon', x: 82, y: 92, w: 38, sfx: 'flap', fx: 'flyaway' }];
  });
})();
