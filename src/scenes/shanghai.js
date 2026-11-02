/* scenes/shanghai.js - the Bund, Shanghai, looking east across the Huangpu River at Lujiazui (uses window.CHINA_KIT).
   PAINT.shanghai: a clear autumn morning in 2040. PAINT.shanghai_night: the same view after dark, every tower lit and
   doubled in the river.
   From the granite promenade on the Bund we look over the stone balustrade at the far bank: the Oriental Pearl Tower
   (pink spheres on three legs) on the left, and on the right the Lujiazui trio, Jin Mao (a stepped pagoda of steel),
   the twisting Shanghai Tower and the World Financial Center with its open top. Between them stand ordinary glass
   towers, two new 2040 towers wrapped in spiral gardens, and, at the water on the right, the sister hospital to Boston
   Harbor: a low white building with planted terraces and a teal cross. Electric ferries with solar roofs cross the
   river, delivery drones and an air taxi drift over it, and gulls ride the wind. The lower third (the promenade) stays
   calm for subtitles, and the middle of the river stays quiet behind a portrait. No brands; every sign is generic. */
(function () {
  'use strict';
  var PAINT = (window.PAINT = window.PAINT || {});
  var K, PI = Math.PI, TAU = PI * 2;
  var rng, clamp, lerp, mix, rgba, lg, rg, S, memo, poly, rrect, glow, softGlow, haze, band, finish, batch, dots, dabs, rects, reflect, glowSpr, cloudForm, skyStrokes, qell, qcirc, drawBird, clump, fbm, mk;
  function bind() {
    if (K) return true; K = window.CHINA_KIT; if (!K) return false;
    rng = K.rng; clamp = K.clamp; lerp = K.lerp; mix = K.mix; rgba = K.rgba; lg = K.lg; rg = K.rg; S = K.S; memo = K.memo; poly = K.poly; rrect = K.rrect;
    glow = K.glow; softGlow = K.softGlow; haze = K.haze; band = K.band; finish = K.finish; batch = K.batch; dots = K.dots; dabs = K.dabs; rects = K.rects;
    reflect = K.reflect; glowSpr = K.glowSpr; cloudForm = K.cloudForm; skyStrokes = K.skyStrokes; qell = K.qell; qcirc = K.qcirc; drawBird = K.drawBird; clump = K.clump; fbm = K.fbm; mk = K.mk;
    return true;
  }

  /* ---------------- layout (fractions of w, h; heights in units of s) ---------------- */
  var LM = null;
  function layout(w, h) {
    var key = w + 'x' + h; if (LM && LM.key === key) return LM;
    var s = S(w, h), L = { key: key, s: s, w: w, h: h };
    L.bank = h * 0.432;            // the far bank's waterline
    L.rail = h * 0.66;             // top of the balustrade
    L.wall = h * 0.712;            // where the promenade floor starts, in front of the balustrade
    // the landmarks: x (fraction of w), height above the bank (s units)
    L.pearl = { x: w * 0.16, H: 238 * s };
    L.jinmao = { x: w * 0.65, H: 188 * s, W: 30 * s };
    L.tower = { x: w * 0.765, H: 286 * s, W: 42 * s };
    L.swfc = { x: w * 0.885, H: 232 * s, W: 44 * s };
    L.hosp = { x: w * 0.5, y: L.bank, W: w * 0.3, H: 30 * s };
    // ordinary towers (x frac, width s, height s, depth 0 far .. 1 near, kind, glass tint)
    var r = rng(9131); L.blds = [];
    var spec = [[0.03, 26, 92, 0.35, 'slab', 0], [0.075, 20, 124, 0.15, 'slant', 1], [0.255, 24, 112, 0.25, 'slab', 2], [0.31, 18, 150, 0.05, 'crown', 0],
      [0.37, 30, 84, 0.55, 'round', 3], [0.43, 22, 172, 0.12, 'garden', 1], [0.495, 26, 104, 0.42, 'slab', 0], [0.55, 22, 136, 0.18, 'slant', 2],
      [0.6, 20, 112, 0.5, 'slab', 3], [0.705, 20, 128, 0.3, 'slab', 1], [0.955, 24, 152, 0.1, 'garden', 0], [0.99, 22, 100, 0.45, 'slab', 2],
      [0.235, 22, 70, 0.75, 'round', 0], [0.33, 26, 58, 0.85, 'slab', 2], [0.62, 26, 62, 0.82, 'slab', 1], [0.08, 26, 54, 0.9, 'slab', 3], [0.97, 30, 60, 0.88, 'round', 2]];
    for (var i = 0; i < spec.length; i++) L.blds.push({ x: w * spec[i][0], W: spec[i][1] * s, H: spec[i][2] * s * (0.92 + r() * 0.16), d: spec[i][3], kind: spec[i][4], tint: spec[i][5], seed: 300 + i });
    L.blds.sort(function (a, b) { return a.d - b.d; });
    L.lamps = [w * 0.045, w * 0.955];
    LM = L; return L;
  }

  /* ---------------- palettes ---------------- */
  var PAL = {
    day: { sky: [[0, '#4f86d6'], [0.35, '#7fb0e8'], [0.7, '#bcd8f0'], [0.9, '#f1e4d4'], [1, '#f8dcc0']], warm: '#ffe0bc', cool: '#6a8ad8',
      sun: [0.97, 0.2], sunCol: '#fff1d6', cloud: { lit: '#ffffff', mid: '#e4ecf8', shade: '#b8c6e0', top: '#d6e4f6' },
      far: '#a9bad4', glass: ['#6d8fb8', '#9cb8d8', '#d6e6f4'], steel: ['#8a96aa', '#b9c2d0', '#eef2f8'], water: ['#7da2c8', '#5d84ae', '#3f6690'],
      stone: ['#d9cfc0', '#c4b8a6', '#a89a86', '#ece4d8'], rail: '#e6ddd0', railSh: '#b3a690', pearl: '#e0558a', pearlHi: '#ffb4cf', green: ['#3f7a4a', '#5f9a58', '#86b866', '#b6d88a'],
      grade: '#ffcf9a', gradeA: 0.1, vig: 0.18 },
    night: { sky: [[0, '#0b1030'], [0.4, '#18205a'], [0.75, '#3a3478'], [0.92, '#6a4a8a'], [1, '#8a5a8a']], warm: '#ff9ac0', cool: '#2a3a8a',
      sun: [0.86, 0.11], sunCol: '#dfe6ff', cloud: { lit: '#4a4a8a', mid: '#2e3068', shade: '#1c1e48', top: '#3a3a7a' },
      far: '#262a5a', glass: ['#141a40', '#1e2652', '#33407a'], steel: ['#1a2046', '#283060', '#4a5490'], water: ['#1a2050', '#121840', '#0a0e2c'],
      stone: ['#4a4660', '#3a3650', '#2c283e', '#5a5672'], rail: '#6a6680', railSh: '#3a3650', pearl: '#ff4a9a', pearlHi: '#ffc0e0', green: ['#14281e', '#1e3a28', '#2a4a30', '#3a5a3a'],
      grade: '#6a5ad0', gradeA: 0.12, vig: 0.3 }
  };

  /* ---------------- the sky ---------------- */
  function sky(ctx, L, P, night) {
    var w = L.w, h = L.h, s = L.s, r = rng(night ? 811 : 711);
    ctx.fillStyle = lg(ctx, 0, 0, 0, L.bank, P.sky); ctx.fillRect(0, 0, w, L.bank + 2);
    skyStrokes(ctx, -20 * s, w + 20 * s, 0, L.bank, P.sky, 260, r, s, night ? 0.1 : 0.13, P.warm, P.cool);
    var sx = w * P.sun[0], sy = h * P.sun[1];
    if (!night) {
      softGlow(ctx, sx, sy, w * 1.0, P.sunCol, 0.32); softGlow(ctx, sx, sy, w * 0.35, '#fff6e4', 0.55);
      haze(ctx, -w * 0.2, L.bank - h * 0.12, w * 1.2, L.bank + h * 0.02, '#ffe8d0', 0.35);
      var cl = [[0.2, 0.07, 0.46, 0.045], [0.62, 0.15, 0.34, 0.035], [0.08, 0.22, 0.26, 0.025], [0.5, 0.27, 0.22, 0.02]];
      for (var i = 0; i < cl.length; i++) cloudForm(ctx, w * cl[i][0], h * cl[i][1], w * cl[i][2], h * cl[i][3], r, { lit: P.cloud.lit, mid: P.cloud.mid, shade: P.cloud.shade, top: P.cloud.top, al: 0.92, lx: (P.sun[0] - cl[i][0]) * 2, ly: -0.6, q: 0.5 });
    } else {
      // stars thin out toward the glowing city; a crescent moon high on the right
      dots(ctx, 260, [['#ffffff', 0.8], ['#cfd8ff', 0.6]], function () { var y = Math.pow(r(), 1.6) * L.bank * 0.7; return [r() * w, y, (0.4 + r() * 0.9) * s, r() < 0.3 ? 0 : 1]; });
      softGlow(ctx, sx, sy, 60 * s, '#e8ecff', 0.35);
      ctx.fillStyle = '#f4f2ff'; ctx.beginPath(); ctx.arc(sx, sy, 11 * s, 0, TAU); ctx.fill();
      ctx.fillStyle = mix(P.sky[1][1], P.sky[0][1], 0.3); ctx.beginPath(); ctx.arc(sx + 4.5 * s, sy - 2.5 * s, 10 * s, 0, TAU); ctx.fill();
      // city glow along the horizon
      haze(ctx, -w * 0.3, L.bank - h * 0.14, w * 1.3, L.bank + h * 0.03, '#ff7ab0', 0.22);
      haze(ctx, w * 0.4, L.bank - h * 0.2, w * 1.2, L.bank, '#8a7aff', 0.16);
      for (var j = 0; j < 3; j++) { var c = rng(870 + j); K.wisp(ctx, w * (0.2 + j * 0.3), h * (0.1 + j * 0.06), w * 0.5, 6 * s, '#5a5aa0', 0.18, c); }
    }
  }

  /* ---------------- buildings ---------------- */
  // window grid on a rectangle (day: faint reflections; night: lit panes)
  function windows(ctx, x, y, W, H, s, night, r, dens, warm) {
    var rows = Math.max(2, Math.floor(H / (3.2 * s))), cols = Math.max(2, Math.floor(W / (3 * s))), cw = W / cols, rh = H / rows, i, j;
    if (!night) {
      ctx.save(); ctx.globalAlpha = 0.18; ctx.fillStyle = '#ffffff';
      for (i = 0; i < rows; i += 1) ctx.fillRect(x, y + i * rh, W, Math.max(0.5, 0.35 * s));
      ctx.restore(); return;
    }
    var pal = warm ? ['#ffe2a0', '#fff3cc', '#ffcf80'] : ['#cfe6ff', '#ffffff', '#a8d0ff'];
    rects(ctx, rows * cols, [[pal[0], 0.85], [pal[1], 0.75], [pal[2], 0.7]], function (k) {
      var ci = k % cols, ri = (k / cols) | 0; if (r() > (dens || 0.45)) return null;
      return [x + ci * cw + cw * 0.18, y + ri * rh + rh * 0.2, cw * 0.62, rh * 0.5, (r() * 3) | 0];
    });
  }
  function glassBody(ctx, pts, x0, x1, P, night, lit) {
    ctx.save(); poly(ctx, pts);
    ctx.fillStyle = lg(ctx, x0, 0, x1, 0, night ? [[0, P.glass[0]], [0.6, P.glass[1]], [1, P.glass[2]]] : [[0, P.glass[0]], [0.55, P.glass[1]], [0.92, P.glass[2]], [1, '#ffffff']]);
    ctx.fill(); ctx.clip();
    return function () { ctx.restore(); };
  }
  function tower(ctx, L, P, night, b) {
    var s = L.s, x = b.x - b.W / 2, base = L.bank + (b.d - 0.5) * 2 * s, top = base - b.H, W = b.W, r = rng(b.seed), fadeA = 0.55 * (1 - b.d);
    var pts;
    if (b.kind === 'slant') pts = [[x, base], [x, top + 12 * s], [x + W, top], [x + W, base]];
    else if (b.kind === 'crown') pts = [[x, base], [x, top + 10 * s], [x + W * 0.2, top + 4 * s], [x + W * 0.5, top - 6 * s], [x + W * 0.8, top + 4 * s], [x + W, top + 10 * s], [x + W, base]];
    else if (b.kind === 'round') { pts = []; pts.push([x, base]); for (var a = 0; a <= 12; a++) { var t = a / 12; pts.push([x + W * t, top + 6 * s - Math.sin(t * PI) * 6 * s]); } pts.push([x + W, base]); }
    else pts = [[x, base], [x, top], [x + W, top], [x + W, base]];
    var done = glassBody(ctx, pts, x, x + W, P, night);
    windows(ctx, x, top, W, b.H, s, night, r, 0.4 + r() * 0.25, r() < 0.5);
    // vertical mullions and the lit edge
    ctx.fillStyle = rgba(night ? '#000000' : '#ffffff', night ? 0.25 : 0.12); for (var m = 1; m < 4; m++) ctx.fillRect(x + W * m / 4, top, 0.5 * s, b.H);
    ctx.fillStyle = lg(ctx, x + W * 0.75, 0, x + W, 0, [[0, rgba('#ffffff', 0)], [1, rgba(night ? '#9ab0ff' : '#fff6e8', night ? 0.25 : 0.55)]]); ctx.fillRect(x, top - 10 * s, W, b.H + 10 * s);
    if (b.kind === 'garden') {
      // a 2040 tower wrapped in a spiral ribbon of planted terraces
      var turns = 5, i, yy;
      for (i = 0; i < turns * 16; i++) {
        var u = i / (turns * 16), ph = u * turns * TAU, y = base - u * b.H, xx = x + W / 2 + Math.sin(ph) * W * 0.5;
        if (Math.cos(ph) < -0.1) continue;
        ctx.fillStyle = P.green[(i % 3) + (night ? 0 : 1)]; ctx.beginPath(); qell(ctx, xx, y, 3.2 * s, 2 * s, 0); ctx.fill();
        if (!night && i % 2 === 0) { ctx.fillStyle = P.green[3]; ctx.beginPath(); qell(ctx, xx - 0.8 * s, y - 0.8 * s, 1.6 * s, 1 * s, 0); ctx.fill(); }
      }
    }
    done();
    // atmospheric depth: farther buildings sink into the haze
    if (fadeA > 0.02) { ctx.save(); poly(ctx, pts); ctx.fillStyle = rgba(night ? '#3a3a7a' : '#d8e2ee', fadeA * (night ? 0.5 : 0.7)); ctx.fill(); ctx.restore(); }
    if (night && b.kind !== 'garden') { // a strip of LED light along the crown
      ctx.fillStyle = rgba(r() < 0.5 ? '#7fe0ff' : '#ff8ad0', 0.8); ctx.fillRect(x, top - 0.5 * s, W, 1.2 * s);
    }
    b.top = top;
  }

  // the Oriental Pearl Tower: three slanted legs, the big lower sphere, five small spheres on three columns, the upper
  // sphere, a small top sphere and the spire
  function pearl(ctx, L, P, night) {
    var s = L.s, x = L.pearl.x, base = L.bank + 1 * s, H = L.pearl.H, u = H / 236;
    var y1 = base - 70 * u, y2 = base - 168 * u, y3 = base - 196 * u, top = base - H;
    var R1 = 21 * u, R2 = 13.5 * u, R3 = 5 * u, colC = night ? '#3a3a6a' : '#c9cdd8', colD = night ? '#20204a' : '#8e94a8';
    function leg(xa, xb, yb, wA, wB, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(xa - wA, base); ctx.lineTo(xb - wB, yb); ctx.lineTo(xb + wB, yb); ctx.lineTo(xa + wA, base); ctx.closePath(); ctx.fill(); }
    // the three thick legs (the back one is darker)
    leg(x, x, y1, 3.2 * u, 3 * u, colD);
    leg(x - 24 * u, x - 9 * u, y1 + 8 * u, 3.6 * u, 3 * u, colC); leg(x + 24 * u, x + 9 * u, y1 + 8 * u, 3.6 * u, 3 * u, mix(colC, colD, 0.4));
    // the three columns between the spheres
    for (var k = -1; k <= 1; k++) { ctx.fillStyle = k === 1 ? colD : colC; ctx.fillRect(x + k * 5.2 * u - 1.6 * u, y2, 3.2 * u, y1 - y2); }
    function sphere(cx, cy, R, hi) {
      ctx.fillStyle = rg(ctx, cx - R * 0.4, cy - R * 0.45, R * 0.1, R * 1.1, night ? [[0, P.pearlHi], [0.45, P.pearl], [1, '#6a1a5a']] : [[0, '#ffe0ec'], [0.35, P.pearlHi], [0.75, P.pearl], [1, '#8a2a5a']]);
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();
      // the silver bands of glass panels
      ctx.strokeStyle = rgba(night ? '#ffd0f0' : '#ffffff', night ? 0.5 : 0.45); ctx.lineWidth = 0.6 * s;
      for (var b = -2; b <= 2; b++) { ctx.beginPath(); ctx.ellipse(cx, cy + b * R * 0.33, R * Math.sqrt(1 - Math.pow(b * 0.33, 2)), R * 0.08, 0, 0, PI); ctx.stroke(); }
      if (hi) { ctx.fillStyle = rgba('#ffffff', 0.55); ctx.beginPath(); qell(ctx, cx - R * 0.42, cy - R * 0.42, R * 0.25, R * 0.14, -0.6); ctx.fill(); }
    }
    if (night) { softGlow(ctx, x, y1, 60 * u, '#ff4aa0', 0.35); softGlow(ctx, x, y2, 40 * u, '#ff6ab8', 0.3); }
    sphere(x, y1, R1, true);
    // five small spheres up the columns
    [[-5.2, 0.28], [5.2, 0.42], [0, 0.55], [-5.2, 0.7], [5.2, 0.82]].forEach(function (q) { sphere(x + q[0] * u, lerp(y1, y2, q[1]), 3.6 * u, false); });
    sphere(x, y2, R2, true);
    ctx.fillStyle = colC; ctx.fillRect(x - 2.2 * u, y3, 4.4 * u, y2 - y3 - R2 * 0.8);
    sphere(x, y3, R3, false);
    // the spire, banded
    ctx.fillStyle = night ? '#c8c8f0' : '#e8ecf4'; ctx.beginPath(); ctx.moveTo(x - 1.6 * u, y3 - R3); ctx.lineTo(x - 0.4 * u, top); ctx.lineTo(x + 0.4 * u, top); ctx.lineTo(x + 1.6 * u, y3 - R3); ctx.fill();
    ctx.fillStyle = night ? '#ff8ac8' : '#c84a7a'; for (var q2 = 0; q2 < 4; q2++) ctx.fillRect(x - 1.2 * u, lerp(y3 - R3, top, 0.2 + q2 * 0.2), 2.4 * u, 1.2 * u);
    L.pearlTop = [x, top];
  }

  // Jin Mao: a stepped steel pagoda that narrows in tiers, with a spire
  function jinmao(ctx, L, P, night) {
    var s = L.s, x = L.jinmao.x, base = L.bank, H = L.jinmao.H, W = L.jinmao.W, r = rng(5150);
    var tiers = 13, y = base, wd = W, i, th, pts = [];
    var body = night ? ['#1c2248', '#2a325e', '#4a5490'] : ['#7c879c', '#a8b2c2', '#e4e8f0'];
    for (i = 0; i < tiers; i++) {
      th = H * 0.7 * Math.pow(0.86, i) * 0.17 + 2 * s;
      var w0 = wd, w1 = wd * 0.94;
      ctx.fillStyle = lg(ctx, x - w0 / 2, 0, x + w0 / 2, 0, [[0, body[0]], [0.6, body[1]], [1, body[2]]]);
      ctx.beginPath(); ctx.moveTo(x - w0 / 2, y); ctx.lineTo(x - w1 / 2, y - th); ctx.lineTo(x + w1 / 2, y - th); ctx.lineTo(x + w0 / 2, y); ctx.closePath(); ctx.fill();
      // the setback ledge and its window bands
      ctx.fillStyle = rgba(night ? '#ffd890' : '#ffffff', night ? 0.6 : 0.45); ctx.fillRect(x - w1 / 2, y - th, w1, 0.8 * s);
      windows(ctx, x - w0 / 2 + 1 * s, y - th + 1.5 * s, w0 - 2 * s, th - 2 * s, s, night, r, 0.35, true);
      ctx.fillStyle = rgba('#20283c', night ? 0.4 : 0.25); for (var m = -2; m <= 2; m++) ctx.fillRect(x + m * w0 * 0.18 - 0.4 * s, y - th, 0.8 * s, th);
      y -= th; wd = i < 8 ? w1 * 0.985 : w1 * 0.86;
    }
    // the crown: a narrow lantern and the spire
    ctx.fillStyle = body[1]; ctx.beginPath(); ctx.moveTo(x - wd / 2, y); ctx.lineTo(x - wd * 0.18, y - 14 * s); ctx.lineTo(x + wd * 0.18, y - 14 * s); ctx.lineTo(x + wd / 2, y); ctx.fill();
    if (night) softGlow(ctx, x, y - 8 * s, 18 * s, '#ffd890', 0.45);
    ctx.fillStyle = night ? '#ffe0a0' : '#eef2f8'; ctx.beginPath(); ctx.moveTo(x - 1.4 * s, y - 14 * s); ctx.lineTo(x, base - H); ctx.lineTo(x + 1.4 * s, y - 14 * s); ctx.fill();
    L.jinmaoTop = [x, base - H];
  }

  // Shanghai Tower: a glass tower that tapers and twists as it rises; one rounded corner spirals up the side
  function shTower(ctx, L, P, night) {
    var s = L.s, x = L.tower.x, base = L.bank, H = L.tower.H, W = L.tower.W, N = 40, i, Lp = [], Rp = [];
    for (i = 0; i <= N; i++) {
      var t = i / N, y = base - H * t * 0.97, half = W / 2 * (1 - t * 0.48) * (1 + 0.04 * Math.sin(t * 9)), tw = Math.sin(t * PI * 1.2) * W * 0.08;
      Lp.push([x - half + tw, y]); Rp.push([x + half * (1 - 0.1 * t) + tw, y]);
    }
    // the sloped, notched crown
    var tl = Lp[N], tr = Rp[N];
    var pts = Lp.concat([[tl[0] + (tr[0] - tl[0]) * 0.25, base - H], [tr[0], base - H * 0.94]]).concat(Rp.slice().reverse());
    ctx.save(); poly(ctx, pts);
    ctx.fillStyle = lg(ctx, x - W / 2, 0, x + W / 2, 0, night ? [[0, '#16204a'], [0.55, '#24366a'], [1, '#3a5294']] : [[0, '#7898bc'], [0.5, '#a8c4de'], [0.85, '#dceaf6'], [1, '#ffffff']]);
    ctx.fill(); ctx.clip();
    // the spiral groove: a curved line that winds up the facade, with the shadowed notch beside it
    ctx.strokeStyle = rgba(night ? '#0a0e2c' : '#4e6a90', night ? 0.7 : 0.45); ctx.lineWidth = 2.4 * s; ctx.beginPath();
    for (i = 0; i <= N; i++) { var t2 = i / N, xx = lerp(Rp[i][0], Lp[i][0], 0.15 + 0.7 * ((t2 * 1.6) % 1)), yy = Lp[i][1]; if (i && ((t2 * 1.6) % 1) < ((i - 1) / N * 1.6) % 1) ctx.moveTo(xx, yy); else if (!i) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy); }
    ctx.stroke();
    ctx.strokeStyle = rgba('#ffffff', night ? 0.15 : 0.5); ctx.lineWidth = 0.8 * s; ctx.stroke();
    // floor lines (curved, because the tower is round) and lit windows at night
    var r = rng(5252);
    for (i = 2; i < N; i += 1) { var a = Lp[i], b = Rp[i]; ctx.strokeStyle = rgba(night ? '#9ad0ff' : '#ffffff', night ? 0.1 + r() * 0.3 : 0.16); ctx.lineWidth = 0.5 * s; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo((a[0] + b[0]) / 2, a[1] + 1.4 * s, b[0], b[1]); ctx.stroke(); }
    if (night) windows(ctx, x - W / 2, base - H * 0.9, W, H * 0.88, s, true, r, 0.22, false);
    ctx.fillStyle = lg(ctx, x + W * 0.2, 0, x + W / 2, 0, [[0, rgba('#ffffff', 0)], [1, rgba(night ? '#9ab0ff' : '#fff4e4', night ? 0.25 : 0.6)]]); ctx.fillRect(x - W, base - H, W * 2, H);
    ctx.restore();
    L.towerTop = [tl[0] + (tr[0] - tl[0]) * 0.25, base - H];
  }

  // the World Financial Center: a slab that narrows to a blade at the top, with a trapezoid opening through it
  function swfc(ctx, L, P, night) {
    var s = L.s, x = L.swfc.x, base = L.bank, H = L.swfc.H, W = L.swfc.W, top = base - H;
    var pts = [[x - W / 2, base], [x - W * 0.14, top], [x + W * 0.14, top], [x + W / 2, base]];
    ctx.save(); poly(ctx, pts);
    ctx.fillStyle = lg(ctx, x - W / 2, 0, x + W / 2, 0, night ? [[0, '#141c44'], [0.5, '#1e2a5a'], [1, '#34468a']] : [[0, '#5e82ae'], [0.5, '#8eaed2'], [0.9, '#d2e2f2'], [1, '#ffffff']]);
    ctx.fill(); ctx.clip();
    // the facade's diagonal crease: two faces meeting at a ridge
    ctx.fillStyle = rgba(night ? '#000010' : '#3e5c86', night ? 0.25 : 0.2); ctx.beginPath(); ctx.moveTo(x - W / 2, base); ctx.lineTo(x - W * 0.14, top); ctx.lineTo(x, top); ctx.lineTo(x - W * 0.05, base); ctx.fill();
    var r = rng(5353); windows(ctx, x - W / 2, top + 14 * s, W, H - 14 * s, s, night, r, 0.3, false);
    ctx.restore();
    // the opening at the top (sky shows through it)
    var oy0 = top + 6 * s, oy1 = top + 16 * s;
    ctx.fillStyle = night ? mix(P.sky[1][1], P.sky[2][1], 0.4) : mix(P.sky[2][1], P.sky[3][1], 0.3);
    ctx.beginPath(); ctx.moveTo(x - W * 0.13, oy0); ctx.lineTo(x + W * 0.13, oy0); ctx.lineTo(x + W * 0.1, oy1); ctx.lineTo(x - W * 0.1, oy1); ctx.fill();
    if (night) { ctx.strokeStyle = rgba('#7fe0ff', 0.9); ctx.lineWidth = 0.8 * s; ctx.stroke(); }
    L.swfcTop = [x, top];
  }

  // the sister hospital: a low white building at the water with planted terraces, a teal cross and a drone pad
  function hospital(ctx, L, P, night) {
    var s = L.s, x = L.hosp.x, y = L.hosp.y, W = L.hosp.W, H = L.hosp.H, i;
    var wall = night ? '#4a5078' : '#f4f6fa', wallSh = night ? '#2c3058' : '#c9d2e2', glassC = night ? '#ffe4a8' : '#9ec4e4';
    // three stepped wings, each with a green roof terrace
    var wings = [[x - W * 0.5, W * 0.42, H * 0.62], [x - W * 0.12, W * 0.4, H], [x + W * 0.24, W * 0.36, H * 0.75]];
    for (i = 0; i < wings.length; i++) {
      var wx = wings[i][0], ww = wings[i][1], wh = wings[i][2];
      ctx.fillStyle = lg(ctx, wx, 0, wx + ww, 0, [[0, wallSh], [0.4, wall], [1, wall]]); ctx.beginPath(); rrect(ctx, wx, y - wh, ww, wh, 3 * s); ctx.fill();
      ctx.fillStyle = rgba(glassC, night ? 0.85 : 0.75); for (var k = 0; k < 3; k++) ctx.fillRect(wx + 2 * s, y - wh + (5 + k * 8) * s, ww - 4 * s, 3 * s);
      var r = rng(600 + i); dabs(ctx, 26, [[P.green[1], 0.95], [P.green[2], 0.9], [P.green[3], 0.8]], function () { return [wx + r() * ww, y - wh - r() * 2 * s, (2 + r() * 2.5) * s, (1.2 + r()) * s, (r() * 3) | 0, 0]; });
    }
    // the teal cross on the tallest wing
    var cx = x - W * 0.12 + W * 0.2, cy = y - H - 9 * s;
    if (night) softGlow(ctx, cx, cy, 16 * s, '#3ad8c8', 0.6);
    ctx.fillStyle = '#16b3a6'; ctx.beginPath(); rrect(ctx, cx - 5 * s, cy - 1.8 * s, 10 * s, 3.6 * s, 1 * s); rrect(ctx, cx - 1.8 * s, cy - 5 * s, 3.6 * s, 10 * s, 1 * s); ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 0.7 * s; ctx.beginPath(); rrect(ctx, cx - 5 * s, cy - 1.8 * s, 10 * s, 3.6 * s, 1 * s); ctx.stroke();
    // trees along the riverside park
    var rt = rng(661);
    for (i = 0; i < 16; i++) { var tx = x - W * 0.6 + rt() * W * 1.2, ty = y + 1 * s; ctx.save(); ctx.translate(tx, ty); ctx.scale(1, 0.9); clump(ctx, 0, -4 * s, (3 + rt() * 3) * s, night ? ['#0e1a16', '#14241c', '#1c3024', '#24402c', '#2e4a34'] : ['#2a5a34', '#3a7040', '#4e8a4a', '#6aa458', '#9cc878'], rt, 0.7, -0.6, false, 0.6); ctx.restore(); }
  }

  // the far bank: the riverside park and promenade under the towers
  function farBank(ctx, L, P, night) {
    var w = L.w, s = L.s, y = L.bank, r = rng(4411), i;
    ctx.fillStyle = night ? '#1a1c40' : '#7a8a7a'; ctx.fillRect(0, y - 3 * s, w, 5 * s);
    // a line of trees along the Pudong riverside
    for (i = 0; i < 46; i++) { var tx = r() * w, rr = (2.5 + r() * 3) * s; ctx.save(); ctx.translate(tx, y - 1 * s); clump(ctx, 0, -rr * 0.6, rr, night ? ['#0c1418', '#121e20', '#1a2a26', '#22342c', '#2a3e32'] : ['#3a5a40', '#4a6e48', '#5e8656', '#7aa064', '#a4c488'], r, 0.7, -0.6, false, 0.5); ctx.restore(); }
    // the embankment wall and its lamps
    ctx.fillStyle = night ? '#2a2a50' : '#b8b4a8'; ctx.fillRect(0, y + 1 * s, w, 2.4 * s);
    if (night) dots(ctx, 60, [['#ffe0a0', 0.9]], function (k) { return [k / 60 * w + r() * 2 * s, y - 2 * s, 0.9 * s, 0]; });
  }

  /* ---------------- the river ---------------- */
  function river(ctx, L, P, night) {
    var w = L.w, h = L.h, s = L.s, y0 = L.bank + 3 * s, y1 = L.wall + 4 * s, r = rng(night ? 7272 : 7171);
    ctx.fillStyle = lg(ctx, 0, y0, 0, y1, [[0, P.water[0]], [0.5, P.water[1]], [1, P.water[2]]]); ctx.fillRect(0, y0, w, y1 - y0);
    // the city doubled in the water, in wobbling strips
    reflect(ctx, w, y0, y1, night ? 0.75 : 0.5, 3 * s, 0.09 / s, 1.3, 0.9);
    // the water's own colour over the reflection, deeper toward us
    ctx.fillStyle = lg(ctx, 0, y0, 0, y1, [[0, rgba(P.water[0], night ? 0.15 : 0.25)], [1, rgba(P.water[2], night ? 0.45 : 0.55)]]); ctx.fillRect(0, y0, w, y1 - y0);
    // ripples: short horizontal strokes, longer near us
    batch(ctx, 900, [[rgba(night ? '#8a90d0' : '#ffffff', 1), 0.7 * s, night ? 0.2 : 0.28], [rgba(night ? '#000010' : '#2a4a70', 1), 0.8 * s, 0.22]], function () {
      var p = Math.pow(r(), 0.8), y = lerp(y0, y1, p), x = r() * w, l = (3 + p * 14 + r() * 6) * s; return [x, y, x + l, y, r() < 0.55 ? 0 : 1]; });
    if (!night) { // sun glitter on the right, under the sun
      dots(ctx, 260, [['#fff8e0', 0.9], ['#ffe6b0', 0.7]], function () { var p = r(), y = lerp(y0, y1, p), x = w * (0.98 - p * 0.06) + (r() - 0.5) * w * (0.08 + p * 0.25); return [x, y, (0.4 + r() * 0.8) * s * (0.6 + p), r() < 0.5 ? 0 : 1]; });
      haze(ctx, -w * 0.1, y0 - 2 * s, w * 1.1, y0 + h * 0.02, '#e8eef4', 0.35);
    }
    L.waterY = [y0, y1];
  }
  // boats that stay put in the painting (the moving ones are in the overlay)
  function moored(ctx, L, P, night) {
    var s = L.s, w = L.w;
    // a long cargo barge on the far side, low in the water
    var bx = w * 0.42, by = L.bank + 9 * s;
    ctx.fillStyle = night ? '#1a1c38' : '#4a4e5e'; ctx.beginPath(); ctx.moveTo(bx - 34 * s, by - 3 * s); ctx.lineTo(bx + 34 * s, by - 3 * s); ctx.lineTo(bx + 30 * s, by); ctx.lineTo(bx - 32 * s, by); ctx.fill();
    ctx.fillStyle = night ? '#3a3a60' : '#c96a3a'; ctx.fillRect(bx - 28 * s, by - 6 * s, 40 * s, 3 * s);
    ctx.fillStyle = night ? '#eef' : '#f4f2ee'; ctx.fillRect(bx + 18 * s, by - 9 * s, 8 * s, 6 * s);
    if (night) { softGlow(ctx, bx + 22 * s, by - 7 * s, 6 * s, '#fff0c0', 0.6); }
  }

  /* ---------------- the Bund promenade (where we stand) ---------------- */
  function promenade(ctx, L, P, night) {
    var w = L.w, h = L.h, s = L.s, r = rng(night ? 3232 : 3131), i;
    var yW = L.wall, yR = L.rail;
    // the granite floor, with a soft gradient and long paving joints converging on the river
    ctx.fillStyle = lg(ctx, 0, yW, 0, h, [[0, P.stone[0]], [0.35, P.stone[1]], [1, P.stone[2]]]); ctx.fillRect(0, yW, w, h - yW);
    ctx.save(); ctx.strokeStyle = rgba(night ? '#1a1828' : '#8a7e6a', night ? 0.4 : 0.35); ctx.lineWidth = 0.8 * s; ctx.beginPath();
    for (i = -8; i <= 8; i++) { var xb = w / 2 + i * w * 0.16; ctx.moveTo(w / 2 + i * w * 0.05, yW + 6 * s); ctx.lineTo(xb, h); }
    for (i = 0; i < 9; i++) { var yy = yW + 6 * s + Math.pow(i / 8, 1.8) * (h - yW); ctx.moveTo(0, yy); ctx.lineTo(w, yy); }
    ctx.stroke(); ctx.restore();
    dabs(ctx, 700, [[P.stone[3], 0.25], [P.stone[2], 0.2], [mix(P.stone[1], '#ffffff', 0.3), 0.15]], function () { var p = Math.pow(r(), 0.8), y = lerp(yW, h, p); return [r() * w, y, (2 + p * 10) * s, (0.6 + p * 2) * s, (r() * 3) | 0, 0]; });
    // morning light: a warm wash from the river side, and long soft shadows of the balusters
    if (!night) {
      ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = lg(ctx, 0, yW, 0, h, [[0, rgba('#fff0d8', 0.6)], [1, rgba('#fff0d8', 0)]]); ctx.fillRect(0, yW, w, h - yW); ctx.restore();
    } else {
      // lamplight pools on the stone
      for (i = 0; i < L.lamps.length; i++) softGlow(ctx, L.lamps[i], h * 0.8, 110 * s, '#ffd890', 0.28);
      softGlow(ctx, w / 2, yW + 10 * s, w * 0.6, '#ff8ac0', 0.1);
    }
    // the river side of the flood wall seen over the rail: a band of stone
    ctx.fillStyle = lg(ctx, 0, yR, 0, yW + 6 * s, [[0, P.railSh], [1, mix(P.railSh, P.stone[1], 0.5)]]); ctx.fillRect(0, yR + 6 * s, w, yW - yR);
    // the balustrade: a stone handrail on squat stone posts
    var bh = 16 * s, n = Math.round(w / (9 * s));
    ctx.fillStyle = P.railSh; for (i = 0; i <= n; i++) { var bx = i * w / n; ctx.beginPath(); rrect(ctx, bx - 1.6 * s, yR + 2 * s, 3.2 * s, bh - 2 * s, 1 * s); ctx.fill(); }
    ctx.fillStyle = P.rail; for (i = 0; i <= n; i++) { var bx2 = i * w / n; ctx.fillRect(bx2 - 1.6 * s, yR + 2 * s, 1.4 * s, bh - 3 * s); }
    ctx.fillStyle = lg(ctx, 0, yR - 3 * s, 0, yR + 4 * s, [[0, mix(P.rail, '#ffffff', night ? 0.1 : 0.4)], [1, P.railSh]]); ctx.fillRect(0, yR - 3 * s, w, 6 * s);
    ctx.fillStyle = P.railSh; ctx.fillRect(0, yR + bh, w, 3 * s);
    // pillars every so often, each with a small planter of red and yellow flowers
    for (i = 0; i < 5; i++) { var px = w * (0.1 + i * 0.2);
      ctx.fillStyle = P.rail; ctx.fillRect(px - 5 * s, yR - 6 * s, 10 * s, bh + 9 * s); ctx.fillStyle = P.railSh; ctx.fillRect(px + 2 * s, yR - 6 * s, 3 * s, bh + 9 * s);
      ctx.fillStyle = mix(P.rail, '#ffffff', 0.3); ctx.fillRect(px - 6 * s, yR - 8 * s, 12 * s, 2.6 * s);
      var rf = rng(90 + i); dots(ctx, 26, [[night ? '#8a3050' : '#e0484a', 0.95], [night ? '#8a7030' : '#f4c040', 0.9], [P.green[1], 0.9]], function () { return [px + (rf() - 0.5) * 12 * s, yR - 9 * s - rf() * 5 * s, (1 + rf() * 1.2) * s, (rf() * 3) | 0]; }); }
    // the old lamp posts at the sides: dark green iron with a white glass globe
    for (i = 0; i < L.lamps.length; i++) { var lx = L.lamps[i], ly = h * 0.84, lh = h * 0.36;
      ctx.fillStyle = night ? '#141a24' : '#2c3a34'; ctx.fillRect(lx - 1.8 * s, ly - lh, 3.6 * s, lh); ctx.fillRect(lx - 5 * s, ly - 8 * s, 10 * s, 8 * s);
      ctx.fillRect(lx - 9 * s, ly - lh + 6 * s, 18 * s, 1.6 * s);
      [-8, 8].forEach(function (dx) { var gx = lx + dx * s, gy = ly - lh + 1 * s;
        if (night) softGlow(ctx, gx, gy, 26 * s, '#ffe4a8', 0.6);
        ctx.fillStyle = night ? '#fff4d6' : '#f6f4ee'; ctx.beginPath(); ctx.arc(gx, gy, 4.2 * s, 0, TAU); ctx.fill();
        ctx.fillStyle = rgba('#ffffff', 0.7); ctx.beginPath(); ctx.arc(gx - 1.4 * s, gy - 1.4 * s, 1.3 * s, 0, TAU); ctx.fill(); });
    }
    // soft darkening at the very bottom, so subtitles sit on a calm ground
    ctx.fillStyle = lg(ctx, 0, h * 0.78, 0, h, [[0, rgba('#1a1420', 0)], [1, rgba('#1a1420', night ? 0.4 : 0.18)]]); ctx.fillRect(0, h * 0.78, w, h * 0.22);
  }

  function paintScene(ctx, w, h, night) {
    if (!bind()) return;
    var L = layout(w, h), P = night ? PAL.night : PAL.day;
    sky(ctx, L, P, night);
    // the farthest towers, pale in the haze
    var rf = rng(1919); ctx.save(); ctx.globalAlpha = 1;
    for (var i = 0; i < 26; i++) { var fx = rf() * w, fw = (10 + rf() * 16) * L.s, fh = (30 + rf() * 70) * L.s; ctx.fillStyle = mix(P.far, P.sky[3][1], night ? 0.1 : 0.3); ctx.fillRect(fx - fw / 2, L.bank - fh, fw, fh);
      if (night) windows(ctx, fx - fw / 2, L.bank - fh, fw, fh, L.s, true, rf, 0.18, true); }
    ctx.restore();
    haze(ctx, -w * 0.2, L.bank - h * 0.08, w * 1.2, L.bank + h * 0.01, night ? '#4a3a7a' : '#dfe6ee', night ? 0.35 : 0.45);
    for (i = 0; i < L.blds.length; i++) if (L.blds[i].d < 0.3) tower(ctx, L, P, night, L.blds[i]);
    shTower(ctx, L, P, night); swfc(ctx, L, P, night); jinmao(ctx, L, P, night);
    for (i = 0; i < L.blds.length; i++) if (L.blds[i].d >= 0.3) tower(ctx, L, P, night, L.blds[i]);
    pearl(ctx, L, P, night); hospital(ctx, L, P, night); farBank(ctx, L, P, night);
    river(ctx, L, P, night); moored(ctx, L, P, night);
    promenade(ctx, L, P, night);
    finish(ctx, w, h, P.grade, P.gradeA, P.vig, 0.035, night ? '#06061a' : '#1a1420', 0.42);
  }

  /* ---------------- the moving layer: ferries, drones, an air taxi, gulls, blinking lights, river sparkle ---------------- */
  function ferry(ctx, x, y, sz, night, dir) {
    ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
    // hull, cabin, a solar roof, a teal stripe
    ctx.fillStyle = night ? '#d8dcf0' : '#f6f6f2'; ctx.beginPath(); ctx.moveTo(-sz * 1.6, -sz * 0.35); ctx.lineTo(sz * 1.75, -sz * 0.35); ctx.lineTo(sz * 1.4, sz * 0.1); ctx.lineTo(-sz * 1.45, sz * 0.1); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#16b3a6'; ctx.fillRect(-sz * 1.5, -sz * 0.2, sz * 3.1, sz * 0.1);
    ctx.fillStyle = night ? '#ffe4a0' : '#9ec4e4'; ctx.fillRect(-sz * 1.0, -sz * 0.75, sz * 2.0, sz * 0.38);
    ctx.fillStyle = night ? '#2a3060' : '#2b3466'; ctx.fillRect(-sz * 1.15, -sz * 0.9, sz * 2.3, sz * 0.16);
    ctx.restore();
  }
  function overlay(ctx, w, h, t, night) {
    if (!bind()) return;
    var L = layout(w, h), s = L.s, i;
    ctx.save();
    // ferries crossing the river, slowly, with a soft wake
    var lanes = [[L.bank + 26 * s, 9 * s, 0.012, 1, 0.1], [L.bank + 52 * s, 13 * s, 0.009, -1, 0.6], [L.bank + 14 * s, 6 * s, 0.016, -1, 0.35]];
    for (i = 0; i < lanes.length; i++) { var ln = lanes[i], p = (t * ln[2] + ln[4]) % 1, x = ln[3] > 0 ? lerp(-w * 0.15, w * 1.15, p) : lerp(w * 1.15, -w * 0.15, p), y = ln[0];
      ctx.fillStyle = rgba(night ? '#a0a8e0' : '#ffffff', 0.35); ctx.beginPath(); qell(ctx, x - ln[3] * ln[1] * 2.6, y + ln[1] * 0.12, ln[1] * 2.2, ln[1] * 0.12, 0); ctx.fill();
      ferry(ctx, x, y, ln[1], night, ln[3]);
      if (night) { var sp = glowSpr('#fff0c0'); if (sp) { ctx.globalAlpha = 0.5; ctx.drawImage(sp, x - ln[1] * 2, y - ln[1] * 1.6, ln[1] * 4, ln[1] * 2.4); ctx.globalAlpha = 1; }
        ctx.fillStyle = rgba('#ffe0a0', 0.35); ctx.fillRect(x - ln[1] * 0.8, y + ln[1] * 0.2, ln[1] * 1.6, ln[1] * 1.2 + Math.sin(t * 2 + i) * ln[1] * 0.2); } }
    // delivery drones on their lanes over the water, and one air taxi gliding toward Pudong
    for (i = 0; i < 4; i++) { var ph = t * (0.025 + i * 0.006) + i * 0.27, dx = w * ((ph % 1) * 1.3 - 0.15), dy = h * (0.3 + i * 0.03) + Math.sin(t * 0.8 + i) * 3 * s;
      K.drawDrone(ctx, dx, dy, (1.4 + i * 0.2) * s, night ? '#c8d0f0' : '#f4f6fb', Math.pow(Math.max(0, Math.sin(t * 4 + i)), 6), i % 2 ? '#7ff7e4' : '#ff6a5a'); }
    var ap = (t * 0.008) % 1, ax = lerp(-w * 0.1, w * 1.1, ap), ay = h * 0.19 + Math.sin(ap * PI) * -h * 0.03;
    ctx.fillStyle = night ? '#dfe4ff' : '#ffffff'; ctx.beginPath(); qell(ctx, ax, ay, 6 * s, 2.2 * s, 0); ctx.fill(); ctx.fillStyle = night ? '#ffe0a0' : '#4a6a9a'; ctx.fillRect(ax - 2 * s, ay - 1.2 * s, 4 * s, 1.2 * s);
    ctx.strokeStyle = rgba(night ? '#dfe4ff' : '#ffffff', 0.8); ctx.lineWidth = 0.6 * s; ctx.beginPath(); for (var q = -1; q <= 1; q += 2) { var rr = 3.2 * s, a = t * 18 + q; ctx.moveTo(ax + q * 6 * s - Math.cos(a) * rr, ay - 2.6 * s); ctx.lineTo(ax + q * 6 * s + Math.cos(a) * rr, ay - 2.6 * s); } ctx.stroke();
    // gulls riding the wind above the promenade
    ctx.strokeStyle = night ? 'rgba(220,220,255,.5)' : 'rgba(60,70,100,.75)'; ctx.lineWidth = 1.1 * s; ctx.lineCap = 'round';
    for (i = 0; i < 3; i++) { var gp = (t * (0.02 + i * 0.004) + i * 0.33) % 1, gx = lerp(w * 1.1, -w * 0.1, gp), gy = h * (0.12 + i * 0.05) + Math.sin(t * 0.9 + i * 2) * 8 * s; drawBird(ctx, gx, gy, (4 + i) * s, t * 3 + i); }
    // aircraft warning lights on the tall tower tops, and the hospital drone pad
    var tops = [L.towerTop, L.swfcTop, L.jinmaoTop, L.pearlTop];
    for (i = 0; i < tops.length; i++) { if (!tops[i]) continue; var bl = Math.pow(Math.max(0, Math.sin(t * 1.6 + i * 1.3)), 10), sp2 = glowSpr('#ff4a3a', true); if (sp2 && bl > 0.02) { ctx.globalAlpha = bl; var z = 5 * s; ctx.drawImage(sp2, tops[i][0] - z, tops[i][1] - z, z * 2, z * 2); ctx.globalAlpha = 1; } }
    // light glinting on the river (day) or the reflections shimmering (night)
    var r = rng(77), y0 = L.bank + 4 * s, y1 = L.wall;
    ctx.fillStyle = night ? '#ffffff' : '#fffbe8';
    for (i = 0; i < 70; i++) { var gx2 = r() * w, gy2 = lerp(y0, y1, Math.pow(r(), 0.7)), tw = Math.pow(Math.max(0, Math.sin(t * (1.2 + r() * 2) + r() * 9)), 12);
      if (!night && gx2 < w * 0.55 && r() < 0.6) continue;
      if (tw > 0.05) { ctx.globalAlpha = tw * (night ? 0.55 : 0.8); ctx.fillRect(gx2, gy2, (2 + r() * 5) * s, 0.7 * s); } }
    ctx.globalAlpha = 1;
    if (night) { // the Pearl's spheres breathe slowly through pink and violet
      var pb = 0.5 + 0.5 * Math.sin(t * 0.6), px = L.pearl.x, u = L.pearl.H / 236;
      var spP = glowSpr(pb > 0.5 ? '#ff5ab0' : '#b06aff'); if (spP) { ctx.globalAlpha = 0.18 + 0.12 * pb; ctx.drawImage(spP, px - 40 * u, L.bank - 110 * u, 80 * u, 80 * u); ctx.drawImage(spP, px - 26 * u, L.bank - 194 * u, 52 * u, 52 * u); ctx.globalAlpha = 1; }
    }
    ctx.restore();
  }

  PAINT.shanghai = { focus: { x: 0.77, y: 0.2 }, track: 'morning', anchors: { pearl: { x: 0.165, y: 0.3 }, tower: { x: 0.765, y: 0.2 }, hospital: { x: 0.83, y: 0.43 } },
    paint: function (ctx, w, h) { ctx.save(); try { paintScene(ctx, w, h, false); } catch (e) { PAINT._err = 'shanghai: ' + String(e && e.stack || e); } finally { ctx.restore(); } },
    overlay: function (ctx, w, h, t) { ctx.save(); try { overlay(ctx, w, h, t, false); } catch (e) { PAINT._err = 'shanghai overlay: ' + String(e && e.stack || e); } finally { ctx.restore(); } } };
  PAINT.shanghai_night = { focus: { x: 0.165, y: 0.3 }, track: 'night', anchors: { pearl: { x: 0.165, y: 0.3 }, tower: { x: 0.765, y: 0.2 } },
    paint: function (ctx, w, h) { ctx.save(); try { paintScene(ctx, w, h, true); } catch (e) { PAINT._err = 'shanghai_night: ' + String(e && e.stack || e); } finally { ctx.restore(); } },
    overlay: function (ctx, w, h, t) { ctx.save(); try { overlay(ctx, w, h, t, true); } catch (e) { PAINT._err = 'shanghai_night overlay: ' + String(e && e.stack || e); } finally { ctx.restore(); } } };
})();
