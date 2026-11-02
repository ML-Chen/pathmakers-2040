/* scenes/dance_hall.js - the community dance hall on Tremont Street in Boston's South End, where the Elder Companion
   program meets and where Jordan's wedding party dances (bea.js, "Dancing at 104").
   PAINT.dance_hall: night. We stand at one end of a tall old hall and look down its sprung maple floor. Three tall
   arched windows in the far wall look out on the brick bow-front houses across Tremont Street, their windows lit, a
   street lamp glowing. A low stage under the windows holds an upright piano, a drum kit, a double bass and a microphone.
   String lights swag across a pressed-tin ceiling around a mirror ball; brass sconces glow on cream walls with dark wood
   wainscot; folding chairs line the walls; a tea table with an urn, cups and a big vase of peonies stands at the right.
   PAINT.dance_hall_day: the same hall on a spring morning: sun through the windows lays bright shafts on the floor and
   the string lights are off. The middle stays clear for portraits; the lower third is calm floor.
   Uses the painting utilities in window.CHINA_KIT (src/scenes/_china_kit.js). Everything is seeded. */
(function () {
  'use strict';
  var PAINT = (window.PAINT = window.PAINT || {});
  var K, PI = Math.PI, TAU = PI * 2;
  var rng, hash, lerp, mix, rgba, lg, rg, S, rrect, softGlow, haze, finish, batch, dots, dabs, rects, qell, clump, glowSpr, poly;
  function bind() {
    if (K) return true; K = window.CHINA_KIT; if (!K) return false;
    rng = K.rng; hash = K.hash; lerp = K.lerp; mix = K.mix; rgba = K.rgba; lg = K.lg; rg = K.rg; S = K.S; rrect = K.rrect; softGlow = K.softGlow; haze = K.haze;
    finish = K.finish; batch = K.batch; dots = K.dots; dabs = K.dabs; rects = K.rects; qell = K.qell; clump = K.clump; glowSpr = K.glowSpr; poly = K.poly;
    return true;
  }
  var LINE = '#3a2a2a';
  function ink(ctx, s, a, wd) { ctx.strokeStyle = rgba(LINE, a == null ? 0.5 : a); ctx.lineWidth = (wd || 0.7) * s; ctx.lineJoin = 'round'; ctx.stroke(); }
  var PAL = {
    night: { sky: [[0, '#0e1838'], [1, '#2a3466']], brick: ['#5a3a3a', '#4a2e30'], lit: '#ffcf7a', wall: ['#d4b486', '#b8966a'], wain: ['#4a2a1e', '#341c14'], floor: ['#b87a40', '#965c2c', '#6a3e1e'], ceil: ['#a88858', '#7a6040'], night: true },
    day: { sky: [[0, '#9cc4ec'], [1, '#d8e8f4']], brick: ['#b8644a', '#9a503c'], lit: '#e8eef4', wall: ['#f4e6c8', '#e6d2ac'], wain: ['#7a4a30', '#5a3422'], floor: ['#e0aa6a', '#c8904e', '#a87038'], ceil: ['#efe2c4', '#d8c8a4'], night: false }
  };

  var LM = {};
  function layout(w, h) {
    var key = w + 'x' + h; if (LM[key]) return LM[key];
    var s = S(w, h), L = { key: key, s: s, w: w, h: h };
    L.fx0 = w * 0.22; L.fx1 = w * 0.78; L.fy0 = h * 0.15; L.fy1 = h * 0.47; L.vx = w * 0.5; L.vy = h * 0.37;
    // where a side wall meets the floor and the ceiling at a given x (left wall for x < fx0, right wall for x > fx1)
    L.floorY = function (x) { var d = x < L.vx ? (L.fx0 - x) / (L.vx - L.fx0) : (x - L.fx1) / (L.fx1 - L.vx); return L.fy1 + Math.max(0, d) * (L.fy1 - L.vy); };
    L.ceilY = function (x) { var d = x < L.vx ? (L.fx0 - x) / (L.vx - L.fx0) : (x - L.fx1) / (L.fx1 - L.vx); return L.fy0 - Math.max(0, d) * (L.vy - L.fy0); };
    L.depth = function (x) { return x < L.vx ? 1 + (L.fx0 - x) / (L.vx - L.fx0) : 1 + (x - L.fx1) / (L.fx1 - L.vx); }; // 1 at the far wall, larger toward us
    LM[key] = L; return L;
  }

  function street(ctx, L, P, x0, y0, x1, y1) {
    var s = L.s, r = rng(5101 + ((x0 / s) | 0)), n = P.night, i;
    ctx.fillStyle = lg(ctx, 0, y0, 0, y1, P.sky); ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    if (n) dots(ctx, 8, [['#ffffff', 0.7]], function () { return [lerp(x0, x1, r()), lerp(y0, y0 + (y1 - y0) * 0.4, r()), 0.5 * s, 0]; });
    // brick bow fronts across the street
    var by = y0 + (y1 - y0) * 0.3;
    ctx.fillStyle = P.brick[0]; ctx.fillRect(x0, by, x1 - x0, y1 - by);
    ctx.fillStyle = P.brick[1]; ctx.beginPath(); ctx.moveTo(x0, by); ctx.lineTo(x0 + (x1 - x0) * 0.1, by - 5 * s); ctx.lineTo(x1, by - 5 * s); ctx.lineTo(x1, by); ctx.fill();
    for (i = 0; i < 6; i++) { var wx = lerp(x0, x1, 0.12 + (i % 3) * 0.32), wy = by + (y1 - by) * (0.12 + ((i / 3) | 0) * 0.42), ww = (x1 - x0) * 0.16, wh = (y1 - by) * 0.26;
      ctx.fillStyle = n ? (hash(i, x0 | 0) < 0.7 ? P.lit : '#2a2a40') : '#7a9ab8'; ctx.fillRect(wx, wy, ww, wh); ctx.fillStyle = n ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.45)'; ctx.fillRect(wx, wy, ww * 0.3, wh); ctx.strokeStyle = '#f2ece0'; ctx.lineWidth = 0.8 * s; ctx.strokeRect(wx, wy, ww, wh); }
    if (n) { softGlow(ctx, lerp(x0, x1, 0.8), y1 - (y1 - y0) * 0.3, (x1 - x0) * 0.6, '#ffd090', 0.35); ctx.strokeStyle = '#1a1a24'; ctx.lineWidth = 1.2 * s; ctx.beginPath(); ctx.moveTo(lerp(x0, x1, 0.8), y1); ctx.lineTo(lerp(x0, x1, 0.8), y1 - (y1 - y0) * 0.3); ctx.stroke(); ctx.fillStyle = '#fff0c0'; ctx.beginPath(); ctx.arc(lerp(x0, x1, 0.8), y1 - (y1 - y0) * 0.32, 1.8 * s, 0, TAU); ctx.fill(); }
    else { ctx.fillStyle = '#6a9a4a'; for (i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(lerp(x0, x1, 0.2 + i * 0.3), y1 - 2 * s, (x1 - x0) * 0.14, PI, TAU); ctx.fill(); } }
  }

  // a tall arched window: frame, muntins, the street outside
  function archWindow(ctx, L, P, cx, top, bot, ww) {
    var s = L.s, r = ww / 2;
    ctx.save(); ctx.beginPath(); ctx.moveTo(cx - r, bot); ctx.lineTo(cx - r, top + r); ctx.arc(cx, top + r, r, PI, TAU); ctx.lineTo(cx + r, bot); ctx.closePath(); ctx.clip();
    street(ctx, L, P, cx - r, top, cx + r, bot);
    ctx.strokeStyle = P.night ? '#3a2a2a' : '#f6f0e4'; ctx.lineWidth = 1.4 * s; ctx.beginPath(); ctx.moveTo(cx, top); ctx.lineTo(cx, bot); for (var k = 1; k < 4; k++) { var yy = lerp(top + r, bot, k / 4); ctx.moveTo(cx - r, yy); ctx.lineTo(cx + r, yy); } ctx.stroke();
    ctx.restore();
    ctx.beginPath(); ctx.moveTo(cx - r, bot); ctx.lineTo(cx - r, top + r); ctx.arc(cx, top + r, r, PI, TAU); ctx.lineTo(cx + r, bot);
    ctx.strokeStyle = P.night ? '#f0e2c4' : '#fbf6ea'; ctx.lineWidth = 3.4 * s; ctx.stroke(); ink(ctx, s, 0.4, 0.8);
    ctx.fillStyle = P.night ? '#f0e2c4' : '#fbf6ea'; ctx.fillRect(cx - r - 3 * s, bot, ww + 6 * s, 3 * s);
    if (!P.night) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; softGlow(ctx, cx, (top + bot) / 2, ww * 1.4, '#fff4dc', 0.25); ctx.restore(); }
  }

  function walls(ctx, L, P) {
    var w = L.w, h = L.h, s = L.s, r = rng(5201), i, n = P.night;
    // ceiling: pressed tin squares converging to the far wall
    poly(ctx, [[0, 0], [w, 0], [w, L.ceilY(w)], [L.fx1, L.fy0], [L.fx0, L.fy0], [0, L.ceilY(0)]]); ctx.fillStyle = lg(ctx, 0, 0, 0, L.fy0, [[0, P.ceil[1]], [1, P.ceil[0]]]); ctx.fill();
    ctx.save(); ctx.clip(); ctx.strokeStyle = n ? 'rgba(90,60,30,0.35)' : 'rgba(150,120,80,0.35)'; ctx.lineWidth = 0.7 * s; ctx.beginPath();
    for (i = -10; i <= 10; i++) { var tx = L.vx + i * (L.fx1 - L.fx0) / 6; ctx.moveTo(L.vx + (tx - L.vx) * 0.7, L.fy0); ctx.lineTo(L.vx + (tx - L.vx) * 4, L.fy0 - (L.vy - L.fy0) * 3); }
    for (i = 0; i < 8; i++) { var k = Math.pow(1.35, i), yy = L.vy - (L.vy - L.fy0) * k; ctx.moveTo(L.vx - (L.vx - L.fx0) * k, yy); ctx.lineTo(L.vx + (L.fx1 - L.vx) * k, yy); } ctx.stroke(); ctx.restore();
    // side walls: cream plaster above dark wood wainscot
    [[0, L.fx0], [L.fx1, w]].forEach(function (R0, j) {
      var xa = R0[0], xb = R0[1];
      poly(ctx, [[xa, L.ceilY(xa)], [xb, L.ceilY(xb)], [xb, L.floorY(xb)], [xa, L.floorY(xa)]]);
      ctx.fillStyle = lg(ctx, j ? w : 0, 0, j ? L.fx1 : L.fx0, 0, [[0, mix(P.wall[1], '#8a6a50', 0.15)], [1, P.wall[0]]]); ctx.fill();
      var wv = 0.24; poly(ctx, [[xa, lerp(L.floorY(xa), L.ceilY(xa), wv)], [xb, lerp(L.floorY(xb), L.ceilY(xb), wv)], [xb, L.floorY(xb)], [xa, L.floorY(xa)]]);
      ctx.fillStyle = P.wain[0]; ctx.fill(); ctx.strokeStyle = P.wain[1]; ctx.lineWidth = 1 * s; ctx.stroke();
      // pilasters every few metres
      for (var q = 0; q < 4; q++) { var px = lerp(xa, xb, j ? (q + 0.5) / 4 : 1 - (q + 0.5) / 4) , pw = 5 * s * L.depth(px) * 0.6; poly(ctx, [[px - pw / 2, L.ceilY(px)], [px + pw / 2, L.ceilY(px)], [px + pw / 2, L.floorY(px)], [px - pw / 2, L.floorY(px)]]); ctx.fillStyle = 'rgba(255,248,230,0.25)'; ctx.fill(); }
    });
    // the far wall
    ctx.fillStyle = lg(ctx, 0, L.fy0, 0, L.fy1, [[0, P.wall[0]], [1, P.wall[1]]]); ctx.fillRect(L.fx0, L.fy0, L.fx1 - L.fx0, L.fy1 - L.fy0);
    ctx.fillStyle = P.wain[0]; ctx.fillRect(L.fx0, L.fy1 - (L.fy1 - L.fy0) * 0.22, L.fx1 - L.fx0, (L.fy1 - L.fy0) * 0.22);
    ctx.fillStyle = mix(P.wall[0], '#ffffff', 0.4); ctx.fillRect(L.fx0, L.fy0, L.fx1 - L.fx0, 3 * s);
    dabs(ctx, 120, [[n ? '#f4dcb0' : '#fff6e4', 0.15], [n ? '#b89868' : '#d8c4a0', 0.12]], function () { return [lerp(L.fx0, L.fx1, r()), lerp(L.fy0, L.fy1 * 0.95, r()), (5 + r() * 12) * s, (2 + r() * 5) * s, r() < 0.5 ? 0 : 1, r() * PI]; });
    var ww = (L.fx1 - L.fx0) * 0.2, wt = L.fy0 + (L.fy1 - L.fy0) * 0.12, wb = L.fy0 + (L.fy1 - L.fy0) * 0.66;
    [0.2, 0.5, 0.8].forEach(function (u) { archWindow(ctx, L, P, lerp(L.fx0, L.fx1, u), wt, wb, ww); });
    // two tall windows on the left wall too, in perspective (simple quads)
    [0.35, 0.75].forEach(function (u) { var xa = L.fx0 * u - 7 * s, xb = L.fx0 * u + 7 * s, top = function (x) { return lerp(L.floorY(x), L.ceilY(x), 0.84); }, bot = function (x) { return lerp(L.floorY(x), L.ceilY(x), 0.34); };
      ctx.save(); poly(ctx, [[xa, top(xa)], [xb, top(xb)], [xb, bot(xb)], [xa, bot(xa)]]); ctx.clip(); street(ctx, L, P, xa - 2, top(xa), xb + 2, bot(xa)); ctx.restore();
      poly(ctx, [[xa, top(xa)], [xb, top(xb)], [xb, bot(xb)], [xa, bot(xa)]]); ctx.strokeStyle = n ? '#f0e2c4' : '#fbf6ea'; ctx.lineWidth = 2.6 * s; ctx.stroke(); });
    // brass sconces on the walls
    L.sconces = [];
    [[0.12, 0.55], [0.6, 0.55], [L.fx1 / w + 0.04, 0.55], [0.9, 0.55]].forEach(function (q) { var x = w * q[0]; if (x > L.fx0 && x < L.fx1) return; var y = lerp(L.floorY(x), L.ceilY(x), q[1]); L.sconces.push([x, y, L.depth(x)]); });
    [[0.33, 0.28], [0.67, 0.28]].forEach(function (q) { L.sconces.push([lerp(L.fx0, L.fx1, q[0]), lerp(L.fy0, L.fy1, q[1]) + (L.fy1 - L.fy0) * 0.3, 1]); });
    L.sconces.forEach(function (c) { var k = 0.7 + 0.3 * c[2], x = c[0], y = c[1];
      if (n) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; softGlow(ctx, x, y - 3 * s * k, 28 * s * k, '#ffc878', 0.4); ctx.restore(); }
      ctx.fillStyle = '#c8963a'; ctx.fillRect(x - 0.8 * s * k, y - 2 * s * k, 1.6 * s * k, 6 * s * k); ctx.fillStyle = n ? '#fff0c8' : '#f6eee0'; ctx.beginPath(); ctx.moveTo(x - 3.4 * s * k, y - 2 * s * k); ctx.lineTo(x + 3.4 * s * k, y - 2 * s * k); ctx.lineTo(x + 2 * s * k, y - 8 * s * k); ctx.lineTo(x - 2 * s * k, y - 8 * s * k); ctx.closePath(); ctx.fill(); });
  }

  function stage(ctx, L, P) {
    var s = L.s, x0 = L.fx0 + (L.fx1 - L.fx0) * 0.06, x1 = L.fx1 - (L.fx1 - L.fx0) * 0.06, top = L.fy1 - 9 * s, i, n = P.night;
    ctx.fillStyle = n ? '#4a2a22' : '#7a4a30'; ctx.beginPath(); ctx.moveTo(x0, top); ctx.lineTo(x1, top); ctx.lineTo(x1 + 6 * s, L.fy1 + 2 * s); ctx.lineTo(x0 - 6 * s, L.fy1 + 2 * s); ctx.closePath(); ctx.fill(); ink(ctx, s, 0.5);
    ctx.fillStyle = n ? '#8a3a3a' : '#b84a4a'; ctx.fillRect(x0 - 6 * s, L.fy1 - 3 * s, x1 - x0 + 12 * s, 5 * s);
    // piano at the left of the stage
    var px = lerp(x0, x1, 0.12); ctx.fillStyle = '#2a1a18'; ctx.fillRect(px - 10 * s, top - 18 * s, 20 * s, 18 * s); ctx.fillStyle = '#f4efe4'; ctx.fillRect(px - 9 * s, top - 9 * s, 18 * s, 2 * s); ctx.fillStyle = '#1a1010'; for (i = 0; i < 7; i++) ctx.fillRect(px - 8 * s + i * 2.6 * s, top - 9 * s, 1 * s, 1.2 * s);
    ctx.fillStyle = '#3a2420'; ctx.fillRect(px - 11 * s, top - 19 * s, 22 * s, 2 * s);
    // microphone stand in the middle, drum kit and double bass at the right
    var mx = lerp(x0, x1, 0.5); ctx.strokeStyle = '#2a2a30'; ctx.lineWidth = 0.8 * s; ctx.beginPath(); ctx.moveTo(mx, top); ctx.lineTo(mx, top - 16 * s); ctx.moveTo(mx - 3 * s, top); ctx.lineTo(mx + 3 * s, top); ctx.stroke(); ctx.fillStyle = '#5a5a64'; ctx.beginPath(); qell(ctx, mx, top - 17 * s, 1.4 * s, 2 * s, 0); ctx.fill();
    var dx = lerp(x0, x1, 0.78); ctx.fillStyle = '#f2ece0'; ctx.beginPath(); qell(ctx, dx, top - 5 * s, 6 * s, 5 * s, 0); ctx.fill(); ctx.fillStyle = '#b8403a'; ctx.beginPath(); qell(ctx, dx, top - 5 * s, 6 * s, 5 * s, 0); ctx.stroke(); ctx.fillStyle = '#c8303a'; ctx.fillRect(dx - 6 * s, top - 6 * s, 12 * s, 1.4 * s);
    ctx.fillStyle = '#e8c860'; ctx.beginPath(); qell(ctx, dx - 9 * s, top - 14 * s, 4.4 * s, 1 * s, -0.2); qell(ctx, dx + 8 * s, top - 15 * s, 4.4 * s, 1 * s, 0.2); ctx.fill();
    var bx = lerp(x0, x1, 0.94); ctx.fillStyle = '#8a4a24'; ctx.beginPath(); ctx.moveTo(bx, top - 26 * s); ctx.quadraticCurveTo(bx + 5 * s, top - 18 * s, bx + 4 * s, top - 12 * s); ctx.quadraticCurveTo(bx + 7 * s, top - 6 * s, bx + 3 * s, top); ctx.lineTo(bx - 3 * s, top); ctx.quadraticCurveTo(bx - 7 * s, top - 6 * s, bx - 4 * s, top - 12 * s); ctx.quadraticCurveTo(bx - 5 * s, top - 18 * s, bx, top - 26 * s); ctx.fill(); ink(ctx, s, 0.4);
    ctx.strokeStyle = '#2a1a10'; ctx.lineWidth = 0.8 * s; ctx.beginPath(); ctx.moveTo(bx, top - 32 * s); ctx.lineTo(bx, top - 4 * s); ctx.stroke();
  }

  function floor(ctx, L, P) {
    var w = L.w, h = L.h, s = L.s, r = rng(5401), i, n = P.night;
    poly(ctx, [[L.fx0, L.fy1], [L.fx1, L.fy1], [w, L.floorY(w)], [w, h], [0, h], [0, L.floorY(0)]]);
    ctx.fillStyle = lg(ctx, 0, L.fy1, 0, h, [[0, P.floor[1]], [0.4, P.floor[0]], [1, P.floor[2]]]); ctx.fill();
    ctx.save(); ctx.clip();
    // maple boards running toward the stage, with staggered joints
    ctx.strokeStyle = n ? 'rgba(70,40,20,0.4)' : 'rgba(110,70,30,0.35)'; ctx.lineWidth = 0.8 * s; ctx.beginPath();
    for (i = -40; i <= 40; i++) { var bx = L.vx + i * (L.fx1 - L.fx0) / 14; ctx.moveTo(L.vx + (bx - L.vx), L.fy1); ctx.lineTo(L.vx + (bx - L.vx) * ((h - L.vy) / (L.fy1 - L.vy)), h); } ctx.stroke();
    batch(ctx, 300, [[n ? 'rgba(70,40,20,0.45)' : 'rgba(110,70,30,0.4)', 0.7 * s, 1]], function () {
      var t = Math.pow(r(), 1.2), y = lerp(L.fy1 + 1 * s, h, t), k = (y - L.vy) / (L.fy1 - L.vy), j = Math.round((r() - 0.5) * 30), xa = L.vx + j * (L.fx1 - L.fx0) / 14 * k; return [xa, y, xa + (L.fx1 - L.fx0) / 14 * k, y, 0]; });
    // polish: long reflections of the windows (day) or the lights (night)
    ctx.globalCompositeOperation = 'lighter';
    var ww = (L.fx1 - L.fx0) * 0.2;
    [0.2, 0.5, 0.8].forEach(function (u) { var cx = lerp(L.fx0, L.fx1, u), dx = (cx - L.vx) * 3.2; ctx.fillStyle = lg(ctx, 0, L.fy1, 0, h * 0.85, [[0, n ? 'rgba(120,150,255,0.12)' : 'rgba(255,250,235,0.35)'], [1, 'rgba(255,250,235,0)']]); ctx.beginPath(); ctx.moveTo(cx - ww / 2, L.fy1); ctx.lineTo(cx + ww / 2, L.fy1); ctx.lineTo(L.vx + dx + ww * 2, h * 0.85); ctx.lineTo(L.vx + dx - ww * 2, h * 0.85); ctx.closePath(); ctx.fill(); });
    if (n) (L.sconces || []).forEach(function (c) { var fy = c[0] < L.vx ? L.floorY(c[0]) : L.floorY(c[0]); ctx.fillStyle = lg(ctx, 0, fy, 0, fy + h * 0.15, [[0, 'rgba(255,190,110,0.18)'], [1, 'rgba(255,190,110,0)']]); ctx.fillRect(c[0] - 6 * s * c[2], fy, 12 * s * c[2], h * 0.15); });
    softGlow(ctx, L.vx, h * 0.62, w * 0.6, n ? '#ffb060' : '#fff0d0', n ? 0.1 : 0.1);
    ctx.restore();
    ctx.fillStyle = lg(ctx, 0, h * 0.82, 0, h, [[0, 'rgba(40,20,14,0)'], [1, 'rgba(40,20,14,' + (n ? 0.4 : 0.22) + ')']]); ctx.fillRect(0, h * 0.82, w, h * 0.18);
  }

  function chair(ctx, x, yb, k, s, col) {
    var u = 6 * s * k;
    ctx.strokeStyle = '#3a3a44'; ctx.lineWidth = Math.max(0.6, 0.5 * u * 0.25); ctx.beginPath(); ctx.moveTo(x - u * 0.8, yb); ctx.lineTo(x - u * 0.7, yb - u * 1.4); ctx.moveTo(x + u * 0.8, yb); ctx.lineTo(x + u * 0.7, yb - u * 1.4); ctx.moveTo(x - u * 0.7, yb - u * 1.4); ctx.lineTo(x - u * 0.6, yb - u * 2.8); ctx.moveTo(x + u * 0.7, yb - u * 1.4); ctx.lineTo(x + u * 0.6, yb - u * 2.8); ctx.stroke();
    ctx.fillStyle = col; ctx.beginPath(); rrect(ctx, x - u * 0.9, yb - u * 1.6, u * 1.8, u * 0.35, u * 0.12); ctx.fill(); ctx.beginPath(); rrect(ctx, x - u * 0.7, yb - u * 2.9, u * 1.4, u * 0.6, u * 0.15); ctx.fill();
  }

  function furniture(ctx, L, P) {
    var w = L.w, h = L.h, s = L.s, r = rng(5501), i, n = P.night;
    // folding chairs along both walls, smaller toward the far end
    for (i = 0; i < 7; i++) { var t = i / 6; [[lerp(L.fx0 - 4 * s, w * 0.02, t), 1], [lerp(L.fx1 + 4 * s, w * 0.98, t), -1]].forEach(function (c) { var x = c[0], yb = L.floorY(x) + 4 * s * L.depth(x); if (c[1] < 0 && x > w * 0.88) return; chair(ctx, x + c[1] * 4 * s * L.depth(x), yb, 0.75 + (L.depth(x) - 1) * 0.8, s, n ? '#8a2a3a' : '#c8404a'); }); }
    // the tea table at the right: a white cloth, an urn, cups, a big vase of peonies
    var tx0 = w * 0.7, tx1 = w * 1.02, ty = h * 0.6, th = h * 0.045;
    ctx.fillStyle = 'rgba(40,20,14,0.3)'; ctx.beginPath(); qell(ctx, (tx0 + tx1) / 2, ty + th + 3 * s, (tx1 - tx0) * 0.6, 5 * s, 0); ctx.fill();
    ctx.fillStyle = '#5a3a2a'; ctx.fillRect(tx0 + 4 * s, ty, 3 * s, th + 3 * s);
    ctx.fillStyle = n ? '#f0e4cc' : '#fbf8f0'; ctx.beginPath(); ctx.moveTo(tx0, ty - 4 * s); ctx.lineTo(tx1, ty - 4 * s); ctx.lineTo(tx1, ty + th); ctx.quadraticCurveTo(tx0 + (tx1 - tx0) * 0.5, ty + th + 3 * s, tx0, ty + th); ctx.closePath(); ctx.fill(); ink(ctx, s, 0.35);
    ctx.fillStyle = n ? '#e2d2b4' : '#efe8da'; ctx.beginPath(); ctx.moveTo(tx0 + 6 * s, ty - 9 * s); ctx.lineTo(tx1, ty - 9 * s); ctx.lineTo(tx1, ty - 4 * s); ctx.lineTo(tx0, ty - 4 * s); ctx.closePath(); ctx.fill();
    var ux = tx0 + 18 * s; ctx.fillStyle = lg(ctx, ux - 8 * s, 0, ux + 8 * s, 0, [[0, '#a8a8b0'], [0.4, '#f0f0f4'], [1, '#8a8a94']]); ctx.beginPath(); rrect(ctx, ux - 7 * s, ty - 30 * s, 14 * s, 22 * s, 5 * s); ctx.fill(); ink(ctx, s, 0.45); ctx.fillStyle = '#5a5a64'; ctx.fillRect(ux - 1 * s, ty - 34 * s, 2 * s, 4 * s); ctx.fillRect(ux + 7 * s, ty - 16 * s, 4 * s, 1.6 * s);
    for (i = 0; i < 4; i++) { var cx = tx0 + 34 * s + i * 9 * s; ctx.fillStyle = '#ffffff'; ctx.beginPath(); qell(ctx, cx, ty - 8.5 * s, 4 * s, 1.2 * s, 0); ctx.fill(); ctx.beginPath(); rrect(ctx, cx - 2.6 * s, ty - 13 * s, 5.2 * s, 4.4 * s, 1.4 * s); ctx.fill(); ctx.fillStyle = '#3b6fb0'; ctx.fillRect(cx - 2.6 * s, ty - 11.4 * s, 5.2 * s, 0.8 * s); }
    var vx = tx0 + 76 * s, vy = ty - 9 * s; ctx.fillStyle = '#3b6fb0'; ctx.beginPath(); ctx.moveTo(vx - 5 * s, vy); ctx.quadraticCurveTo(vx - 8 * s, vy - 10 * s, vx - 3 * s, vy - 16 * s); ctx.lineTo(vx + 3 * s, vy - 16 * s); ctx.quadraticCurveTo(vx + 8 * s, vy - 10 * s, vx + 5 * s, vy); ctx.closePath(); ctx.fill(); ink(ctx, s, 0.45);
    var pal = ['#2e5a34', '#3f7a40', '#5a9a4a', '#86c060', '#b8e080']; for (i = 0; i < 5; i++) clump(ctx, vx + (r() - 0.5) * 22 * s, vy - 22 * s - r() * 10 * s, 6 * s, pal, r, -0.6, -0.7, false, 0.8);
    for (i = 0; i < 7; i++) { var fx = vx + (r() - 0.5) * 24 * s, fy = vy - 22 * s - r() * 14 * s, fr = (3 + r() * 2.4) * s; ctx.fillStyle = i % 3 ? '#f4a0b8' : '#fbe0e8'; ctx.beginPath(); ctx.arc(fx, fy, fr, 0, TAU); ctx.fill(); ctx.fillStyle = i % 3 ? '#e07090' : '#f4b0c4'; ctx.beginPath(); ctx.arc(fx + fr * 0.15, fy + fr * 0.1, fr * 0.5, 0, TAU); ctx.fill(); }
    // the coat rack at the left, with a red scarf and a hat
    var cx2 = w * 0.08, cb = h * 0.66; ctx.strokeStyle = '#3a2418'; ctx.lineWidth = 2 * s; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx2, cb); ctx.lineTo(cx2, cb - 70 * s); ctx.moveTo(cx2 - 8 * s, cb); ctx.lineTo(cx2 + 8 * s, cb); ctx.moveTo(cx2, cb - 66 * s); ctx.lineTo(cx2 - 7 * s, cb - 70 * s); ctx.moveTo(cx2, cb - 66 * s); ctx.lineTo(cx2 + 7 * s, cb - 70 * s); ctx.stroke();
    ctx.fillStyle = '#c0403a'; ctx.beginPath(); ctx.moveTo(cx2 - 7 * s, cb - 69 * s); ctx.quadraticCurveTo(cx2 - 12 * s, cb - 50 * s, cx2 - 9 * s, cb - 36 * s); ctx.lineTo(cx2 - 5 * s, cb - 36 * s); ctx.quadraticCurveTo(cx2 - 7 * s, cb - 52 * s, cx2 - 3 * s, cb - 67 * s); ctx.fill();
    ctx.fillStyle = '#4a4a5a'; ctx.beginPath(); qell(ctx, cx2 + 6 * s, cb - 70 * s, 7 * s, 2 * s, 0); ctx.fill(); ctx.beginPath(); rrect(ctx, cx2 + 2 * s, cb - 77 * s, 8 * s, 7 * s, 2 * s); ctx.fill();
  }

  // string lights and the mirror ball; bulb positions are kept for the overlay
  function lights(ctx, L, P) {
    var w = L.w, h = L.h, s = L.s, B = [], n = P.night;
    var strands = [[0, L.ceilY(0) + h * 0.03, w, L.ceilY(w) + h * 0.03, h * 0.06], [0, h * 0.1, w * 0.5, h * 0.13, h * 0.03], [w * 0.5, h * 0.13, w, h * 0.1, h * 0.03], [L.fx0, L.fy0 + 4 * s, L.fx1, L.fy0 + 4 * s, h * 0.03], [0, h * 0.2, w, h * 0.2, h * 0.05]];
    strands.forEach(function (q) {
      var x0 = q[0], y0 = q[1], x1 = q[2], y1 = q[3], mx = (x0 + x1) / 2, my = (y0 + y1) / 2 + q[4] * 2, nb = Math.round((x1 - x0) / (13 * s));
      ctx.strokeStyle = 'rgba(40,30,30,0.7)'; ctx.lineWidth = 0.6 * s; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(mx, my, x1, y1); ctx.stroke();
      for (var i = 1; i < nb; i++) { var t = i / nb; B.push([K.bez(x0, mx, x1, t), K.bez(y0, my, y1, t) + 2 * s]); }
    });
    var sp = glowSpr('#ffcf80');
    B.forEach(function (b, j) { if (n && sp) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.45; ctx.drawImage(sp, b[0] - 9 * s, b[1] - 9 * s, 18 * s, 18 * s); ctx.restore(); }
      ctx.fillStyle = n ? ['#ffe8a8', '#ffc870', '#fff4d8'][j % 3] : '#f4eee0'; ctx.beginPath(); qell(ctx, b[0], b[1], 1.5 * s, 2 * s, 0); ctx.fill(); if (!n) { ctx.strokeStyle = 'rgba(80,70,60,0.4)'; ctx.lineWidth = 0.4 * s; ctx.stroke(); } });
    L.bulbs = B;
    // the mirror ball
    var bx = L.vx, by = h * 0.105, R = 11 * s; L.ball = [bx, by, R];
    ctx.strokeStyle = '#3a3030'; ctx.lineWidth = 0.7 * s; ctx.beginPath(); ctx.moveTo(bx, 0); ctx.lineTo(bx, by - R); ctx.stroke();
    ctx.fillStyle = rg(ctx, bx - R * 0.3, by - R * 0.3, 0, R * 1.1, [[0, '#ffffff'], [0.5, '#c8ccd8'], [1, '#6a6e7e']]); ctx.beginPath(); ctx.arc(bx, by, R, 0, TAU); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(bx, by, R, 0, TAU); ctx.clip(); ctx.strokeStyle = 'rgba(60,60,80,0.45)'; ctx.lineWidth = 0.5 * s; ctx.beginPath();
    for (var k = -4; k <= 4; k++) { ctx.moveTo(bx - R, by + k * R / 4.5); ctx.lineTo(bx + R, by + k * R / 4.5); ctx.moveTo(bx + k * R / 4.5, by - R); ctx.quadraticCurveTo(bx + k * R / 3, by, bx + k * R / 4.5, by + R); } ctx.stroke(); ctx.restore();
  }

  function make(mode) {
    var P = PAL[mode];
    return {
      paint: function (ctx, w, h) { if (!bind()) return; var L = layout(w, h); walls(ctx, L, P); stage(ctx, L, P); floor(ctx, L, P); furniture(ctx, L, P); lights(ctx, L, P);
        if (!P.night) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; var ww = (L.fx1 - L.fx0) * 0.2; [0.2, 0.5, 0.8].forEach(function (u) { var cx = lerp(L.fx0, L.fx1, u), top = L.fy0 + (L.fy1 - L.fy0) * 0.2; ctx.fillStyle = lg(ctx, cx, top, cx + (cx - L.vx) * 1.5, h * 0.85, [[0, 'rgba(255,244,214,0.16)'], [1, 'rgba(255,244,214,0)']]); ctx.beginPath(); ctx.moveTo(cx - ww * 0.4, top); ctx.lineTo(cx + ww * 0.4, top); ctx.lineTo(cx + (cx - L.vx) * 2.4 + ww * 2, h * 0.85); ctx.lineTo(cx + (cx - L.vx) * 2.4 - ww * 2, h * 0.85); ctx.closePath(); ctx.fill(); }); ctx.restore(); }
        if (P.night) finish(ctx, w, h, '#ff9a50', 0.14, 0.34, 0.04, '#140a0c', 0.4); else finish(ctx, w, h, '#ffc080', 0.1, 0.18, 0.035, '#2a1612', 0.42); },
      overlay: function (ctx, w, h, t) {
        if (!bind()) return; var L = layout(w, h), s = L.s, i, n = P.night;
        if (n) {
          // the mirror ball turns: spots of light drift across the walls and floor, and the string lights twinkle
          var sp = glowSpr('#fff4e0', true);
          if (sp && L.ball) { ctx.save(); ctx.globalCompositeOperation = 'lighter';
            for (i = 0; i < 26; i++) { var a = hash(i, 3) * TAU + t * 0.25, rr = (0.3 + hash(i, 4) * 0.7) * w * 0.8, x = L.ball[0] + Math.cos(a) * rr, y = L.ball[1] + h * 0.25 + Math.sin(a) * rr * 0.6 + hash(i, 5) * h * 0.2; if (y < 0 || y > h * 0.8) continue; var sz = (2 + hash(i, 6) * 2) * s; ctx.globalAlpha = 0.25 + 0.2 * Math.sin(t * 2 + i); ctx.drawImage(sp, x - sz, y - sz, sz * 2, sz * 2); }
            var bs = glowSpr('#ffcf80'); if (bs && L.bulbs) for (i = 0; i < L.bulbs.length; i++) { var tw = 0.5 + 0.5 * Math.sin(t * (1 + hash(i, 7) * 1.4) + i * 2.1); ctx.globalAlpha = 0.1 + 0.2 * tw; ctx.drawImage(bs, L.bulbs[i][0] - 7 * s, L.bulbs[i][1] - 7 * s, 14 * s, 14 * s); }
            var gl = Math.pow(Math.max(0, Math.sin(t * 1.7)), 10); if (gl > 0.05) { ctx.globalAlpha = gl; ctx.drawImage(sp, L.ball[0] - L.ball[2] * 0.6 - 5 * s, L.ball[1] - L.ball[2] * 0.4 - 5 * s, 10 * s, 10 * s); }
            ctx.restore(); }
        } else {
          // dust motes floating in the sun shafts
          var mp = glowSpr('#fff0d0'); if (mp) for (i = 0; i < 22; i++) { var a1 = hash(i, 51), b1 = hash(i, 52), c1 = hash(i, 53); var mx = w * (0.15 + a1 * 0.7) + Math.sin(t * (0.2 + c1 * 0.2) + i) * 12 * s, my = h * (0.3 + b1 * 0.45) + Math.sin(t * (0.25 + a1 * 0.3) + i * 2) * 10 * s, sz2 = (1.4 + c1 * 2.4) * s; ctx.globalAlpha = 0.15 + 0.3 * (0.5 + 0.5 * Math.sin(t * (0.8 + c1) + i * 3)); ctx.drawImage(mp, mx - sz2, my - sz2, sz2 * 2, sz2 * 2); }
          ctx.globalAlpha = 1;
        }
        // steam from the urn
        var ws = glowSpr('#ffffff'); if (ws) { var ux = w * 0.7 + 18 * s, uy = h * 0.6 - 34 * s; for (var k = 0; k < 3; k++) { var ph = (t * 0.3 + k / 3) % 1, sz = (2 + ph * 6) * s; ctx.globalAlpha = 0.3 * (1 - ph); ctx.drawImage(ws, ux + Math.sin(t + k * 2) * 2 * s - sz, uy - ph * 18 * s - sz, sz * 2, sz * 2); } ctx.globalAlpha = 1; }
      }
    };
  }
  var N = make('night'), D = make('day');
  function wrap(key, M) { return { paint: function (ctx, w, h) { ctx.save(); try { M.paint(ctx, w, h); } catch (e) { PAINT._err = key + ': ' + String(e && e.stack || e); } finally { ctx.restore(); } },
    overlay: function (ctx, w, h, t) { ctx.save(); try { M.overlay(ctx, w, h, t); } catch (e) { PAINT._err = key + ' overlay: ' + String(e && e.stack || e); } finally { ctx.restore(); } } }; }
  PAINT.dance_hall = Object.assign({ focus: { x: 0.5, y: 0.1 }, track: 'night', anchors: { stage: { x: 0.5, y: 0.44 }, ball: { x: 0.5, y: 0.1 }, tea: { x: 0.85, y: 0.58 } } }, wrap('dance_hall', N));
  PAINT.dance_hall_day = Object.assign({ focus: { x: 0.5, y: 0.3 }, track: 'morning', anchors: { stage: { x: 0.5, y: 0.44 }, tea: { x: 0.85, y: 0.58 } } }, wrap('dance_hall_day', D));

  if (typeof LATE !== 'undefined') LATE.push(function () {
    if (typeof PROPS === 'undefined' || typeof PROPS_ART === 'undefined') return;
    // an old record player, and a vase of peonies
    PROPS_ART.dh_record = function () { return '<svg viewBox="0 0 80 64"><ellipse cx="40" cy="61" rx="32" ry="3.5" fill="rgba(0,0,0,.22)"/><g class="pa-body"><rect x="6" y="30" width="68" height="28" rx="4" fill="#8a4a2a" stroke="#3a2418" stroke-width="2"/><rect x="10" y="48" width="60" height="5" rx="2" fill="#c8963a"/>' +
      '<ellipse cx="36" cy="30" rx="26" ry="8" fill="#1a1416" stroke="#3a2418" stroke-width="2"/><ellipse cx="36" cy="30" rx="16" ry="5" fill="none" stroke="#3a3436" stroke-width="1"/><ellipse cx="36" cy="30" rx="5" ry="1.8" fill="#e8403a"/><path d="M66 24 L58 30 L46 32" stroke="#c8ccd8" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="66" cy="24" r="3" fill="#c8ccd8"/></g></svg>'; };
    PROPS_ART.dh_peony = function () { return '<svg viewBox="0 0 60 84"><ellipse cx="30" cy="81" rx="16" ry="3" fill="rgba(0,0,0,.2)"/><g class="pa-leaves"><path d="M30 44 q-14 -6 -20 -16 q12 2 20 16z" fill="#3f7a40"/><path d="M30 44 q14 -6 20 -16 q-12 2 -20 16z" fill="#5a9a4a"/><circle cx="20" cy="22" r="9" fill="#f4a0b8"/><circle cx="21" cy="23" r="4.5" fill="#e07090"/><circle cx="40" cy="20" r="10" fill="#fbe0e8"/><circle cx="41" cy="21" r="5" fill="#f4b0c4"/><circle cx="30" cy="10" r="8" fill="#f4a0b8"/><circle cx="30" cy="11" r="4" fill="#e07090"/></g>' +
      '<g class="pa-body"><path d="M20 44 h20 q4 14 -2 34 h-16 q-6 -20 -2 -34z" fill="#3b6fb0" stroke="#1f3a60" stroke-width="2"/><path d="M24 54 q6 4 12 0" stroke="#fff" stroke-width="2" fill="none" opacity=".7"/></g></svg>'; };
    var hall = [
      { id: 'dh_record', x: 10, y: 92, w: 64, sfx: 'ring', fx: 'jiggle', burst: 'notes' },
      { id: 'person', x: 30, y: 89, w: 50, talk: 'dance_hall', look: { skin: '#8a5a3c', shirt: '#8a5bb8', hair: '#e8e4ea' } },
      { id: 'dh_peony', x: 52, y: 93, w: 34, sfx: 'rustle', fx: 'wiggle', burst: 'hearts' },
      { id: 'person', x: 74, y: 88, w: 50, talk: 'dance_hall', look: { skin: '#f1cfb6', shirt: '#2a7ac0', hair: '#c8c4cc' } },
      { id: 'lamp', x: 92, y: 90, w: 34, sfx: 'click', fx: 'toggle' }
    ];
    PROPS.dance_hall = hall; PROPS.dance_hall_day = hall;
  });
})();
