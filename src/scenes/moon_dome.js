/* scenes/moon_dome.js - inside the Market Dome at Shackleton Rim Base (the Moon's south pole, a game forecast for 2041).
   PAINT.moon_dome. We stand on the market floor under a big clear dome. Its ribs run up to the top of the dome over our
   heads, and its rings curve around us. Through the glass: the black sky (no air, so no blue), Earth hanging over the
   rim on the right, lit from the left like everything else, and the low white Sun skimming the hills on the left. The
   grey crater rim and tall solar masts stand outside, throwing long shadows to the right. Inside it is warm and
   ordinary: striped market stalls (a tea corner, a soup pot, Moon-glass beads, greenhouse greens), string lights swagged
   from the ribs, potted greenhouse plants and a wooden deck floor. People in here wear normal clothes; the air is
   pressurised. The middle stays clear for portraits and the lower third is calm floor.
   Uses the painting utilities in window.CHINA_KIT (src/scenes/_china_kit.js). Everything is seeded. */
(function () {
  'use strict';
  var PAINT = (window.PAINT = window.PAINT || {});
  var K, PI = Math.PI, TAU = PI * 2;
  var rng, hash, lerp, mix, rgba, lg, rg, S, rrect, glow, softGlow, finish, batch, dots, dabs, rects, qell, clump, ridge, fbm, glowSpr;
  function bind() {
    if (K) return true; K = window.CHINA_KIT; if (!K) return false;
    rng = K.rng; hash = K.hash; lerp = K.lerp; mix = K.mix; rgba = K.rgba; lg = K.lg; rg = K.rg; S = K.S; rrect = K.rrect; glow = K.glow; softGlow = K.softGlow;
    finish = K.finish; batch = K.batch; dots = K.dots; dabs = K.dabs; rects = K.rects; qell = K.qell; clump = K.clump; ridge = K.ridge; fbm = K.fbm; glowSpr = K.glowSpr;
    return true;
  }
  var LINE = '#3a3440';
  function ink(ctx, s, a, wd) { ctx.strokeStyle = rgba(LINE, a == null ? 0.5 : a); ctx.lineWidth = (wd || 0.7) * s; ctx.lineJoin = 'round'; ctx.stroke(); }

  var LM = null;
  function layout(w, h) {
    var key = w + 'x' + h; if (LM && LM.key === key) return LM;
    var s = S(w, h), L = { key: key, s: s, w: w, h: h };
    L.hz = h * 0.47; L.f = h * 0.75; L.cx = w / 2;
    L.base = function (x) { var a = Math.atan((x - L.cx) / L.f); return L.hz + (h * 0.035) / Math.cos(a); };   // where the dome meets the floor
    L.ring = function (x, yc) { var a = Math.atan((x - L.cx) / L.f); return L.hz - (L.hz - yc) / Math.cos(a); }; // a ring of the dome at height yc (centre)
    L.out = h * 0.475;                  // the ground line outside the glass
    L.sun = { x: w * 0.1, y: h * 0.43 }; L.earth = { x: w * 0.8, y: h * 0.2, r: 27 * s };
    LM = L; return L;
  }

  /* ---------------- outside the glass ---------------- */
  function outside(ctx, L) {
    var w = L.w, h = L.h, s = L.s, r = rng(8101), i, base = L.base(L.cx) + 2 * s;
    ctx.fillStyle = lg(ctx, 0, 0, 0, base, [[0, '#04050b'], [0.7, '#0a0c16'], [1, '#14161e']]); ctx.fillRect(0, 0, w, base + 4 * s);
    dots(ctx, 170, [['#ffffff', 0.75], ['#cfd8ff', 0.5], ['#fff0d8', 0.45]], function () { return [r() * w, r() * h * 0.42, (0.35 + Math.pow(r(), 4) * 1.1) * s, (r() * 3) | 0]; });
    // Earth: blue oceans, cloud swirls, lit from the left, the night side dark with a few city lights
    var E = L.earth;
    softGlow(ctx, E.x - E.r * 0.2, E.y, E.r * 2.2, '#5a8ad8', 0.16);
    ctx.save(); ctx.beginPath(); ctx.arc(E.x, E.y, E.r, 0, TAU); ctx.clip();
    ctx.fillStyle = lg(ctx, E.x - E.r, E.y - E.r, E.x + E.r, E.y + E.r, [[0, '#4a8ae0'], [1, '#1a4a9a']]); ctx.fillRect(E.x - E.r, E.y - E.r, E.r * 2, E.r * 2);
    dabs(ctx, 26, [['#5aa05a', 0.9], ['#c8a868', 0.85]], function (j) { var a = r() * TAU, d = E.r * Math.sqrt(r()) * 0.85; return [E.x + Math.cos(a) * d, E.y + Math.sin(a) * d, (3 + r() * 6) * s, (2 + r() * 3) * s, j % 3 === 0 ? 1 : 0, r() * PI]; });
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineCap = 'round'; ctx.lineWidth = 1.6 * s; ctx.beginPath();
    for (i = 0; i < 7; i++) { var yy = E.y - E.r * 0.8 + i * E.r * 0.27, x0 = E.x - E.r * (0.9 - hash(i, 3) * 0.5); ctx.moveTo(x0, yy); ctx.quadraticCurveTo(x0 + E.r * 0.5, yy - E.r * 0.12, x0 + E.r * (0.6 + hash(i, 4) * 0.7), yy + E.r * 0.05); } ctx.stroke();
    ctx.fillStyle = 'rgba(6,10,26,0.86)'; ctx.beginPath(); ctx.arc(E.x + E.r * 0.62, E.y, E.r * 1.05, 0, TAU); ctx.fill();
    dots(ctx, 14, [['#ffd27a', 0.9]], function () { var a = -PI / 2 + r() * PI, d = E.r * (0.5 + r() * 0.45); return [E.x + Math.cos(a) * d * 0.7 + E.r * 0.25, E.y + Math.sin(a) * d, 0.5 * s, 0]; });
    ctx.restore();
    ctx.strokeStyle = 'rgba(160,200,255,0.7)'; ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.arc(E.x, E.y, E.r + 0.6 * s, PI * 0.55, PI * 1.45); ctx.stroke();
    // the crater rim hills: lit on their left faces by the low Sun, long shadows to the right
    function hill(x) { var u = x / w; return L.out - h * (0.035 + 0.05 * Math.pow(fbm(u * 2.6 + 1.3, 8111, 4), 1.6) + 0.025 * Math.exp(-Math.pow((u - 0.42) / 0.08, 2))); }
    ridge(ctx, -2, w + 2, 1.5 * s, hill, base + 4 * s, '#5e5e66');
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, base + 4 * s); ctx.clip();
    for (var x = 0; x < w; x += 1.5 * s) {
      var y = hill(x), sl = (hill(x + 3 * s) - hill(x - 3 * s)) / (6 * s), lit = sl > 0.05;
      ctx.fillStyle = lit ? '#cfccc4' : (sl > -0.05 ? '#9c9a96' : '#74747a'); ctx.fillRect(x, y, 1.6 * s, (L.out - y) * (lit ? 0.6 : 0.4));
    }
    ctx.fillStyle = lg(ctx, 0, L.out - h * 0.02, 0, base, [[0, '#8a8884'], [1, '#6a6a6c']]); ctx.fillRect(0, L.out - 1 * s, w, base - L.out + 6 * s);
    ctx.strokeStyle = 'rgba(30,30,40,0.5)'; ctx.lineWidth = 0.6 * s; ctx.beginPath(); for (x = 0; x <= w; x += 2 * s) { if (!x) ctx.moveTo(x, hill(x)); else ctx.lineTo(x, hill(x)); } ctx.stroke();
    // the Sun on the horizon, white and hard, with a starburst
    softGlow(ctx, L.sun.x, L.sun.y, w * 0.45, '#e8eeff', 0.22); softGlow(ctx, L.sun.x, L.sun.y, 26 * s, '#ffffff', 0.95);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 0.8 * s; ctx.beginPath();
    for (i = 0; i < 8; i++) { var a = i * PI / 4 + 0.2, l = (i % 2 ? 26 : 58) * s; ctx.moveTo(L.sun.x, L.sun.y); ctx.lineTo(L.sun.x + Math.cos(a) * l, L.sun.y + Math.sin(a) * l); } ctx.stroke(); ctx.restore();
    // tall solar masts outside, each with a long shadow
    [[0.2, 0.3], [0.29, 0.33], [0.64, 0.31], [0.73, 0.28], [0.92, 0.32]].forEach(function (m, j) {
      var mx = w * m[0], top = h * m[1], foot = L.out + 1 * s, pw = 7 * s, ph = (foot - top) * 0.42;
      ctx.fillStyle = 'rgba(20,20,30,0.55)'; ctx.beginPath(); ctx.moveTo(mx, foot); ctx.lineTo(mx + w * 0.4, foot + 1.6 * s); ctx.lineTo(mx + w * 0.4, foot + 0.4 * s); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#b8b8bc'; ctx.lineWidth = 1.2 * s; ctx.beginPath(); ctx.moveTo(mx, foot); ctx.lineTo(mx, top); ctx.stroke();
      ctx.fillStyle = '#1e2a52'; ctx.fillRect(mx - pw / 2, top, pw, ph); ctx.strokeStyle = 'rgba(140,170,230,0.5)'; ctx.lineWidth = 0.4 * s; ctx.beginPath();
      for (var g = 1; g < 6; g++) { ctx.moveTo(mx - pw / 2, top + g * ph / 6); ctx.lineTo(mx + pw / 2, top + g * ph / 6); } ctx.moveTo(mx, top); ctx.lineTo(mx, top + ph); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.fillRect(mx - pw / 2, top, 1 * s, ph);
      ctx.fillStyle = '#ff5a4a'; ctx.beginPath(); ctx.arc(mx, top - 1.5 * s, 0.9 * s, 0, TAU); ctx.fill();
    });
    // a couple of habitat modules and a small lander pad far off on the rim
    [[0.47, 7, '#e8e4da'], [0.53, 5, '#d8d4ca'], [0.84, 6, '#e8e4da']].forEach(function (d) { var hx = w * d[0], hy = L.out + 0.5 * s, R = d[1] * s; ctx.fillStyle = d[2]; ctx.beginPath(); ctx.arc(hx, hy, R, PI, TAU); ctx.fill(); ctx.fillStyle = 'rgba(20,20,30,0.5)'; ctx.beginPath(); ctx.arc(hx, hy, R, PI * 1.5, TAU); ctx.lineTo(hx, hy); ctx.fill(); ctx.fillStyle = '#ffd27a'; ctx.fillRect(hx - R * 0.6, hy - R * 0.45, 1.2 * s, 1.2 * s); });
    ctx.restore();
  }

  /* ---------------- the dome: glass, ribs and rings ---------------- */
  function dome(ctx, L) {
    var w = L.w, h = L.h, s = L.s, i, x, zx = L.cx, zy = -h * 0.62;
    // the glass: faint blue tint, broad soft reflections of the lights inside
    ctx.fillStyle = 'rgba(150,180,230,0.05)'; ctx.fillRect(0, 0, w, L.base(0) + 2 * s);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    [[0.08, 0.3, 0.12], [0.6, 0.12, 0.08], [0.82, 0.38, 0.06]].forEach(function (b) {
      var bx = w * b[0], by = h * b[1], bw = w * 0.07;
      ctx.fillStyle = lg(ctx, bx, by, bx + bw, by + h * 0.12, [[0, 'rgba(255,240,220,0)'], [0.5, 'rgba(255,240,220,' + b[2] + ')'], [1, 'rgba(255,240,220,0)']]);
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + bw, by - h * 0.02); ctx.lineTo(bx + bw * 1.8, by + h * 0.16); ctx.lineTo(bx + bw * 0.8, by + h * 0.18); ctx.closePath(); ctx.fill();
    });
    ctx.restore();
    // meridian ribs: straight-ish lines that meet at the top of the dome, far above us
    var feet = []; for (i = -6; i <= 6; i++) feet.push(L.cx + i * w * 0.2);
    function rib(fx) { var fy = L.base(fx); ctx.beginPath(); ctx.moveTo(fx, fy); ctx.quadraticCurveTo(lerp(fx, zx, 0.45) + (fx - zx) * 0.12, lerp(fy, zy, 0.45), zx, zy); }
    ctx.lineCap = 'round';
    feet.forEach(function (fx) { rib(fx); ctx.strokeStyle = rgba('#1a1a24', 0.5); ctx.lineWidth = 6 * s; ctx.stroke(); rib(fx); ctx.strokeStyle = '#d8dce6'; ctx.lineWidth = 4.2 * s; ctx.stroke(); rib(fx); ctx.strokeStyle = '#f6f6fa'; ctx.lineWidth = 1.2 * s; ctx.save(); ctx.translate(-1.2 * s, 0); ctx.stroke(); ctx.restore(); });
    // rings of the dome curve around us: lowest straight ahead, rising to the sides
    [h * 0.335, h * 0.17, h * 0.0].forEach(function (yc, k) {
      ctx.beginPath(); for (x = -4 * s; x <= w + 4 * s; x += 3 * s) { var y = L.ring(x, yc); if (x < 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
      ctx.strokeStyle = rgba('#1a1a24', 0.5); ctx.lineWidth = (5.2 - k * 0.6) * s; ctx.stroke(); ctx.strokeStyle = '#d0d4de'; ctx.lineWidth = (3.6 - k * 0.5) * s; ctx.stroke();
      ctx.strokeStyle = '#f4f4f8'; ctx.lineWidth = 0.8 * s; ctx.save(); ctx.translate(0, -1 * s); ctx.stroke(); ctx.restore();
      // hubs where ribs cross the ring
      feet.forEach(function (fx) {
        // find where this rib crosses the ring (sample the quadratic)
        var fy = L.base(fx), cxq = lerp(fx, zx, 0.45) + (fx - zx) * 0.12, cyq = lerp(fy, zy, 0.45), best = null;
        for (var t = 0; t <= 1; t += 0.01) { var px = K.bez(fx, cxq, zx, t), py = K.bez(fy, cyq, zy, t); if (py <= L.ring(px, yc)) { best = [px, py]; break; } }
        if (best && best[0] > -10 * s && best[0] < w + 10 * s) { ctx.fillStyle = '#9aa0b0'; ctx.beginPath(); ctx.arc(best[0], best[1], 3 * s, 0, TAU); ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(best[0] - 0.8 * s, best[1] - 0.8 * s, 1.1 * s, 0, TAU); ctx.fill(); }
      });
    });
    // the base ring: a low white parapet with little round air vents
    ctx.beginPath(); ctx.moveTo(-2, L.base(-2) - h * 0.022); for (x = 0; x <= w + 2; x += 3 * s) ctx.lineTo(x, L.base(x) - h * 0.022);
    for (x = w + 2; x >= -2; x -= 3 * s) ctx.lineTo(x, L.base(x) + 1 * s); ctx.closePath();
    ctx.fillStyle = lg(ctx, 0, L.hz, 0, L.base(0) + 2 * s, [[0, '#f2f0ea'], [1, '#c8c4bc']]); ctx.fill(); ink(ctx, s, 0.35);
    for (x = w * 0.04; x < w; x += w * 0.085) { var vy = L.base(x) - h * 0.011; ctx.fillStyle = '#8a8c98'; ctx.beginPath(); ctx.arc(x, vy, 1.8 * s, 0, TAU); ctx.fill(); ctx.fillStyle = '#5ad8c8'; ctx.beginPath(); ctx.arc(x, vy, 0.7 * s, 0, TAU); ctx.fill(); }
  }

  /* ---------------- the market floor ---------------- */
  function floor(ctx, L) {
    var w = L.w, h = L.h, s = L.s, r = rng(8301), i, vx = L.cx, vy = L.hz;
    ctx.beginPath(); ctx.moveTo(-2, L.base(-2)); for (var x = 0; x <= w + 2; x += 3 * s) ctx.lineTo(x, L.base(x)); ctx.lineTo(w + 2, h + 2); ctx.lineTo(-2, h + 2); ctx.closePath();
    ctx.fillStyle = lg(ctx, 0, L.base(L.cx), 0, h, [[0, '#b88e64'], [0.4, '#c89c6c'], [1, '#a87a50']]); ctx.fill();
    ctx.save(); ctx.clip();
    // deck planks running toward the back
    ctx.strokeStyle = 'rgba(90,56,30,0.35)'; ctx.lineWidth = 0.8 * s; ctx.beginPath();
    for (i = -40; i <= 40; i++) { var bx = vx + i * w * 0.07; ctx.moveTo(lerp(vx, bx, 0.06), lerp(vy, h, 0.06)); ctx.lineTo(bx, h); } ctx.stroke();
    batch(ctx, 260, [['rgba(90,56,30,0.4)', 0.7 * s, 1], ['rgba(255,226,180,0.35)', 0.6 * s, 1]], function (j) {
      var t = Math.pow(r(), 1.3), y = lerp(L.base(vx) + 2 * s, h, t), i2 = Math.round((r() - 0.5) * 30), k1 = (y - vy) / (h - vy);
      var xa = vx + i2 * w * 0.07 * k1, xb = vx + (i2 + 1) * w * 0.07 * k1; return [xa, y, xb, y, j % 4 === 0 ? 1 : 0];
    });
    // a lighter tiled walkway down the middle
    ctx.fillStyle = 'rgba(240,222,190,0.45)'; ctx.beginPath(); ctx.moveTo(vx - w * 0.05, L.base(vx)); ctx.lineTo(vx + w * 0.05, L.base(vx)); ctx.lineTo(vx + w * 0.42, h); ctx.lineTo(vx - w * 0.42, h); ctx.closePath(); ctx.fill();
    // warm pools of light from the stalls and string lights, and the reflection of the low Sun
    ctx.globalCompositeOperation = 'lighter';
    softGlow(ctx, w * 0.15, h * 0.7, w * 0.4, '#ffb870', 0.12); softGlow(ctx, w * 0.85, h * 0.7, w * 0.4, '#ffb870', 0.12); softGlow(ctx, w * 0.5, h * 0.58, w * 0.35, '#ffd8a0', 0.1);
    ctx.fillStyle = lg(ctx, 0, h * 0.52, 0, h * 0.9, [[0, 'rgba(230,236,255,0.12)'], [1, 'rgba(230,236,255,0)']]); ctx.beginPath(); ctx.moveTo(L.sun.x - 6 * s, h * 0.52); ctx.lineTo(L.sun.x + 6 * s, h * 0.52); ctx.lineTo(L.sun.x + w * 0.2, h * 0.9); ctx.lineTo(L.sun.x - w * 0.02, h * 0.9); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.fillStyle = lg(ctx, 0, h * 0.8, 0, h, [[0, 'rgba(40,24,20,0)'], [1, 'rgba(40,24,20,0.3)']]); ctx.fillRect(0, h * 0.8, w, h * 0.2);
  }

  function planter(ctx, x, yb, R, s, seed, kind) {
    var r = rng(seed);
    ctx.fillStyle = 'rgba(40,24,20,0.3)'; ctx.beginPath(); qell(ctx, x, yb, R * 1.15, R * 0.22, 0); ctx.fill();
    ctx.fillStyle = lg(ctx, x - R, 0, x + R, 0, [[0, '#e8e2d6'], [0.45, '#fbf8f2'], [1, '#b8b2a8']]); ctx.beginPath(); ctx.moveTo(x - R, yb - R * 0.9); ctx.lineTo(x + R, yb - R * 0.9); ctx.lineTo(x + R * 0.82, yb); ctx.lineTo(x - R * 0.82, yb); ctx.closePath(); ctx.fill(); ink(ctx, s, 0.4);
    ctx.fillStyle = '#2aa89a'; ctx.fillRect(x - R * 0.95, yb - R * 0.62, R * 1.9, R * 0.12);
    var pal = ['#2e5a34', '#3f7a40', '#5a9a4a', '#86c060', '#b8e080'];
    if (kind === 'tree') {
      ctx.strokeStyle = '#7a5a3a'; ctx.lineWidth = R * 0.12; ctx.beginPath(); ctx.moveTo(x, yb - R * 0.9); ctx.lineTo(x, yb - R * 2.2); ctx.stroke();
      for (var i = 0; i < 6; i++) clump(ctx, x + (r() - 0.5) * R * 1.2, yb - R * (2.4 + r() * 0.8), R * (0.45 + r() * 0.2), pal, r, -0.7, -0.6, false, 0.8);
      dots(ctx, 9, [['#f8c830', 1]], function () { return [x + (r() - 0.5) * R * 1.4, yb - R * (2.2 + r() * 1), R * 0.1, 0]; });
    } else {
      for (i = 0; i < 4; i++) clump(ctx, x + (i - 1.5) * R * 0.45, yb - R * (1.05 + r() * 0.3), R * 0.42, pal, r, -0.7, -0.6, false, 0.9);
      if (kind === 'tomato') dots(ctx, 10, [['#e0403a', 1], ['#f07a3a', 1]], function () { return [x + (r() - 0.5) * R * 1.5, yb - R * (1 + r() * 0.5), R * 0.09, r() < 0.7 ? 0 : 1]; });
    }
  }

  // a market stall seen from the front: counter, two posts, a striped scalloped awning; goods on top
  function stall(ctx, x0, x1, yb, s, o) {
    var W = x1 - x0, cH = W * 0.28, top = yb - W * 0.95, aw = W * 0.2, i, n = 7;
    ctx.fillStyle = 'rgba(40,24,20,0.3)'; ctx.beginPath(); qell(ctx, (x0 + x1) / 2, yb + 1 * s, W * 0.58, W * 0.05, 0); ctx.fill();
    // posts and a back cloth
    ctx.fillStyle = o.back; ctx.fillRect(x0 + W * 0.04, top + aw * 0.5, W * 0.92, yb - cH - top - aw * 0.5);
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(x0 + W * 0.04, top + aw * 0.5, W * 0.92, W * 0.06);
    ctx.fillStyle = '#e8e4dc'; ctx.fillRect(x0, top, W * 0.045, yb - top); ctx.fillRect(x1 - W * 0.045, top, W * 0.045, yb - top);
    ctx.beginPath(); ctx.rect(x0, top, W * 0.045, yb - top); ctx.rect(x1 - W * 0.045, top, W * 0.045, yb - top); ink(ctx, s, 0.45);
    // goods on a shelf behind the counter
    if (o.shelf) o.shelf(x0 + W * 0.08, x1 - W * 0.08, yb - cH - W * 0.22);
    // counter
    ctx.fillStyle = lg(ctx, 0, yb - cH, 0, yb, [[0, o.counter[0]], [1, o.counter[1]]]); ctx.beginPath(); ctx.rect(x0 - W * 0.02, yb - cH, W * 1.04, cH); ctx.fill(); ink(ctx, s, 0.5);
    ctx.fillStyle = mix(o.counter[0], '#ffffff', 0.3); ctx.fillRect(x0 - W * 0.04, yb - cH - W * 0.03, W * 1.08, W * 0.035);
    ctx.beginPath(); ctx.rect(x0 - W * 0.04, yb - cH - W * 0.03, W * 1.08, W * 0.035); ink(ctx, s, 0.45);
    if (o.front) o.front(x0, x1, yb - cH, yb);
    if (o.goods) o.goods(x0, x1, yb - cH - W * 0.03);
    // awning: alternating stripes with a scalloped edge
    ctx.save(); ctx.beginPath(); ctx.moveTo(x0 - W * 0.06, top + aw); for (i = 0; i < n; i++) { var sx = x0 - W * 0.06 + i * W * 1.12 / n; ctx.quadraticCurveTo(sx + W * 0.56 / n, top + aw * 1.45, sx + W * 1.12 / n, top + aw); }
    ctx.lineTo(x1 + W * 0.02, top); ctx.lineTo(x0 - W * 0.02, top); ctx.closePath(); ctx.fillStyle = o.awn[0]; ctx.fill(); ink(ctx, s, 0.5); ctx.clip();
    ctx.fillStyle = o.awn[1]; for (i = 0; i < n; i++) if (i % 2) ctx.fillRect(x0 - W * 0.06 + i * W * 1.12 / n, top - 2 * s, W * 1.12 / n, aw * 1.6);
    ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(x0 - W * 0.1, top, W * 1.2, aw * 0.25); ctx.restore();
  }

  function stalls(ctx, L) {
    var w = L.w, h = L.h, s = L.s, r = rng(8501);
    function jars(x0, x1, y) { var n = 6; for (var i = 0; i < n; i++) { var jx = lerp(x0, x1, (i + 0.5) / n), jh = (5 + hash(i, 7) * 4) * s; ctx.fillStyle = ['#e8b04a', '#c0504d', '#7ab06a', '#4a8fc6'][i % 4]; ctx.beginPath(); rrect(ctx, jx - 2.4 * s, y - jh, 4.8 * s, jh, 1 * s); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(jx - 1.6 * s, y - jh + 1 * s, 0.8 * s, jh - 2 * s); } ctx.fillStyle = '#9a6a42'; ctx.fillRect(x0 - 2 * s, y, x1 - x0 + 4 * s, 1.6 * s); }
    function beads(x0, x1, y) { for (var i = 0; i < 3; i++) { var bx = lerp(x0, x1, 0.2 + i * 0.3), R = 6 * s; ctx.fillStyle = '#5a4a6a'; ctx.beginPath(); ctx.ellipse(bx, y - 1 * s, R, R * 0.45, 0, 0, PI); ctx.fill(); dots(ctx, 9, [['#8ad8f0', 0.95], ['#c8a8f0', 0.95], ['#f0e0a0', 0.95]], function (j) { return [bx + (hash(j + i * 9, 3) - 0.5) * R * 1.5, y - 2 * s - hash(j + i * 9, 4) * 3 * s, 1.5 * s, j % 3]; }); } }
    function soup(x0, x1, y) { var px = lerp(x0, x1, 0.35), R = 10 * s; ctx.fillStyle = '#3a3a44'; ctx.beginPath(); ctx.moveTo(px - R, y - R * 1.1); ctx.lineTo(px + R, y - R * 1.1); ctx.lineTo(px + R * 0.85, y); ctx.lineTo(px - R * 0.85, y); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#5a5a66'; ctx.fillRect(px - R * 1.1, y - R * 1.2, R * 2.2, R * 0.2); ctx.fillStyle = '#e0a040'; ctx.beginPath(); qell(ctx, px, y - R * 1.15, R * 0.85, R * 0.18, 0); ctx.fill();
      for (var i = 0; i < 4; i++) { ctx.fillStyle = '#fbf6ea'; ctx.beginPath(); rrect(ctx, lerp(x0, x1, 0.62) + i * 4.4 * s, y - 5 * s, 3.6 * s, 5 * s, 1 * s); ctx.fill(); } }
    function greens(x0, x1, y) { for (var i = 0; i < 3; i++) { var cx = lerp(x0, x1, 0.18 + i * 0.32), cw = (x1 - x0) * 0.26; ctx.fillStyle = '#b8864e'; ctx.fillRect(cx - cw / 2, y - 6 * s, cw, 6 * s); ctx.strokeStyle = 'rgba(80,50,20,0.5)'; ctx.lineWidth = 0.6 * s; ctx.strokeRect(cx - cw / 2, y - 6 * s, cw, 6 * s);
      if (i === 1) dots(ctx, 12, [['#e0403a', 1], ['#c8302a', 1]], function (j) { return [cx + (hash(j, 21) - 0.5) * cw * 0.85, y - 6.5 * s - hash(j, 22) * 2.4 * s, 1.8 * s, j % 2]; });
      else dabs(ctx, 14, [['#4a8a3a', 1], ['#7ab85a', 1]], function (j) { return [cx + (hash(j + i * 31, 23) - 0.5) * cw * 0.9, y - 7 * s - hash(j + i * 31, 24) * 3 * s, 2.6 * s, 1.6 * s, j % 2, hash(j, 25) * PI]; }); } }
    function tea(x0, x1, y) { var tx = lerp(x0, x1, 0.3); ctx.fillStyle = '#e8eef6'; ctx.beginPath(); ctx.moveTo(tx - 7 * s, y); ctx.bezierCurveTo(tx - 8 * s, y - 11 * s, tx + 8 * s, y - 11 * s, tx + 7 * s, y); ctx.closePath(); ctx.fill(); ink(ctx, s, 0.4); ctx.fillStyle = '#b8483a'; ctx.beginPath(); ctx.arc(tx, y - 9 * s, 1.6 * s, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#e8eef6'; ctx.lineWidth = 2 * s; ctx.beginPath(); ctx.moveTo(tx + 6 * s, y - 4 * s); ctx.lineTo(tx + 11 * s, y - 8 * s); ctx.stroke();
      for (var i = 0; i < 3; i++) { ctx.fillStyle = '#f4efe2'; ctx.beginPath(); rrect(ctx, lerp(x0, x1, 0.55) + i * 6 * s, y - 4 * s, 4 * s, 4 * s, 1 * s); ctx.fill(); ctx.fillStyle = '#5a8a5a'; ctx.fillRect(lerp(x0, x1, 0.55) + i * 6 * s, y - 2.6 * s, 4 * s, 0.8 * s); } }
    function lantern(x, y, col) { ctx.strokeStyle = '#6a5a4a'; ctx.lineWidth = 0.6 * s; ctx.beginPath(); ctx.moveTo(x, y - 8 * s); ctx.lineTo(x, y - 4 * s); ctx.stroke(); ctx.fillStyle = col; ctx.beginPath(); qell(ctx, x, y, 4 * s, 5 * s, 0); ctx.fill(); ctx.fillStyle = 'rgba(255,240,200,0.6)'; ctx.beginPath(); qell(ctx, x - 1 * s, y - 1 * s, 1.6 * s, 2.6 * s, 0); ctx.fill(); }
    // far stalls first (smaller), then near ones at the edges
    stall(ctx, w * 0.12, w * 0.31, h * 0.565, s * 0.8, { back: '#4a6a8a', counter: ['#c8925a', '#9a6a3e'], awn: ['#f4ead4', '#2aa89a'], goods: beads });
    stall(ctx, w * 0.69, w * 0.88, h * 0.565, s * 0.8, { back: '#7a4a5a', counter: ['#c8925a', '#9a6a3e'], awn: ['#f4ead4', '#e0684a'], goods: greens });
    planter(ctx, w * 0.4, h * 0.545, 10 * s, s, 8601, 'tomato'); planter(ctx, w * 0.6, h * 0.545, 10 * s, s, 8602, 'herb');
    stall(ctx, -w * 0.06, w * 0.27, h * 0.7, s, { back: '#8a3a3a', counter: ['#d8a070', '#a87048'], awn: ['#fbf2dc', '#c8403a'], goods: tea, shelf: jars });
    stall(ctx, w * 0.73, w * 1.06, h * 0.7, s, { back: '#2a5a6a', counter: ['#d8a070', '#a87048'], awn: ['#fbf2dc', '#2a7ac0'], goods: soup, shelf: jars });
    lantern(w * 0.06, h * 0.555, '#e8604a'); lantern(w * 0.2, h * 0.56, '#f0b040'); lantern(w * 0.8, h * 0.56, '#f0b040'); lantern(w * 0.94, h * 0.555, '#e8604a');
    // potted citrus trees by the walkway
    planter(ctx, w * 0.3, h * 0.64, 13 * s, s, 8603, 'tree'); planter(ctx, w * 0.7, h * 0.64, 13 * s, s, 8604, 'tree');
    // little cafe tables with stools in front of the tea corner and the soup stall
    [[0.1, 0.775, '#2aa89a'], [0.9, 0.775, '#e0684a']].forEach(function (T) {
      var tx = w * T[0], ty = h * T[1], R = 20 * s;
      ctx.fillStyle = 'rgba(40,24,20,0.3)'; ctx.beginPath(); qell(ctx, tx, ty + 2 * s, R * 1.6, R * 0.3, 0); ctx.fill();
      [[-1.3, T[2]], [1.3, T[2]]].forEach(function (st) { var sx = tx + st[0] * R; ctx.fillStyle = '#5a4a44'; ctx.fillRect(sx - 1 * s, ty - 12 * s, 2 * s, 12 * s); ctx.fillStyle = st[1]; ctx.beginPath(); qell(ctx, sx, ty - 12 * s, 7 * s, 2.6 * s, 0); ctx.fill(); ink(ctx, s, 0.4); });
      ctx.fillStyle = '#5a4a44'; ctx.fillRect(tx - 1.4 * s, ty - 22 * s, 2.8 * s, 22 * s); ctx.beginPath(); qell(ctx, tx, ty, 8 * s, 2 * s, 0); ctx.fill();
      ctx.fillStyle = '#f4efe4'; ctx.beginPath(); qell(ctx, tx, ty - 22 * s, R, R * 0.28, 0); ctx.fill(); ink(ctx, s, 0.45);
      ctx.fillStyle = '#fbf6ea'; ctx.beginPath(); rrect(ctx, tx - 5 * s, ty - 29 * s, 5 * s, 6 * s, 1.2 * s); ctx.fill(); ink(ctx, s, 0.35);
      ctx.fillStyle = '#e0a040'; ctx.beginPath(); qell(ctx, tx + 6 * s, ty - 23.5 * s, 4.4 * s, 1.4 * s, 0); ctx.fill();
    });
  }
  // greenhouse baskets hanging from the lowest ring of the dome, with trailing vines
  function baskets(ctx, L) {
    var w = L.w, h = L.h, s = L.s, r = rng(8701);
    [0.07, 0.29, 0.71, 0.93].forEach(function (fx, j) {
      var x = w * fx, y0 = L.ring(x, h * 0.335), y1 = y0 + h * 0.05;
      ctx.strokeStyle = 'rgba(60,50,40,0.8)'; ctx.lineWidth = 0.6 * s; ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x - 6 * s, y1); ctx.moveTo(x, y0); ctx.lineTo(x + 6 * s, y1); ctx.stroke();
      var pal = ['#2e5a34', '#3f7a40', '#5a9a4a', '#86c060', '#b8e080'];
      for (var k = 0; k < 5; k++) { var vx = x + (k - 2) * 3 * s, len = (14 + r() * 16) * s; ctx.strokeStyle = '#3f7a40'; ctx.lineWidth = 0.7 * s; ctx.beginPath(); ctx.moveTo(vx, y1); ctx.quadraticCurveTo(vx + (r() - 0.5) * 6 * s, y1 + len * 0.6, vx + (r() - 0.5) * 4 * s, y1 + len); ctx.stroke();
        dabs(ctx, 6, [[pal[2], 1], [pal[3], 1]], function (q) { var t = (q + 1) / 7; return [vx + (r() - 0.5) * 3 * s, y1 + len * t, 2 * s, 1.2 * s, q % 2, r() * PI]; }); }
      clump(ctx, x, y1 - 3 * s, 8 * s, pal, r, -0.7, -0.6, false, 0.9);
      ctx.fillStyle = j % 2 ? '#c8673f' : '#e8e2d6'; ctx.beginPath(); ctx.moveTo(x - 8 * s, y1 - 1 * s); ctx.lineTo(x + 8 * s, y1 - 1 * s); ctx.quadraticCurveTo(x + 7 * s, y1 + 7 * s, x, y1 + 7 * s); ctx.quadraticCurveTo(x - 7 * s, y1 + 7 * s, x - 8 * s, y1 - 1 * s); ctx.fill(); ink(ctx, s, 0.4);
    });
  }

  // string lights swagged between the ribs; returns the bulb positions for the overlay
  var BULBS = null;
  function lights(ctx, L) {
    var w = L.w, h = L.h, s = L.s, B = [], i;
    var strings = [[-0.05, 0.31, 1.05, 0.27, 0.07], [-0.05, 0.2, 0.55, 0.13, 0.06], [0.45, 0.12, 1.05, 0.21, 0.06], [-0.05, 0.4, 0.4, 0.37, 0.04], [0.6, 0.37, 1.05, 0.41, 0.04]];
    strings.forEach(function (S0) {
      var x0 = w * S0[0], y0 = h * S0[1], x1 = w * S0[2], y1 = h * S0[3], sag = h * S0[4], n = Math.round((x1 - x0) / (14 * s));
      ctx.strokeStyle = 'rgba(40,36,50,0.7)'; ctx.lineWidth = 0.7 * s; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + sag * 2, x1, y1); ctx.stroke();
      for (i = 1; i < n; i++) { var t = i / n, bx = K.bez(x0, (x0 + x1) / 2, x1, t), by = K.bez(y0, (y0 + y1) / 2 + sag * 2, y1, t); B.push([bx, by + 2 * s]); }
    });
    var sp = glowSpr('#ffcf80');
    B.forEach(function (b, j) {
      if (sp) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.4; ctx.drawImage(sp, b[0] - 9 * s, b[1] - 9 * s, 18 * s, 18 * s); ctx.restore(); }
      ctx.fillStyle = ['#ffe8a8', '#ffc870', '#fff4d8'][j % 3]; ctx.beginPath(); qell(ctx, b[0], b[1], 1.6 * s, 2.1 * s, 0); ctx.fill();
    });
    BULBS = B;
  }

  function paint(ctx, w, h) {
    if (!bind()) return;
    var L = layout(w, h);
    outside(ctx, L); dome(ctx, L); floor(ctx, L); stalls(ctx, L); lights(ctx, L); baskets(ctx, L);
    finish(ctx, w, h, '#ffb070', 0.1, 0.22, 0.035, '#1a1020', 0.45);
  }
  function overlay(ctx, w, h, t) {
    if (!bind()) return;
    var L = layout(w, h), s = L.s, i, sp = glowSpr('#ffe2a8');
    // a small rover crawling along the rim outside
    var q = (t % 60) / 60, rx = lerp(-20 * s, w + 20 * s, q), ry = L.out + 0.5 * s;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, L.base(rx) - h * 0.022); ctx.clip();
    ctx.fillStyle = '#e8e4da'; ctx.fillRect(rx - 4 * s, ry - 3 * s, 8 * s, 2.4 * s); ctx.fillStyle = '#2a2a34'; ctx.fillRect(rx - 3.6 * s, ry - 0.8 * s, 2 * s, 1 * s); ctx.fillRect(rx + 1.6 * s, ry - 0.8 * s, 2 * s, 1 * s);
    ctx.fillStyle = Math.sin(t * 5) > 0 ? '#ffd27a' : '#806a40'; ctx.fillRect(rx + 3.4 * s, ry - 2.8 * s, 1 * s, 1 * s);
    ctx.restore();
    // the string lights twinkle softly
    if (BULBS && sp) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (i = 0; i < BULBS.length; i++) { var tw = 0.5 + 0.5 * Math.sin(t * (1.1 + hash(i, 5) * 1.6) + i * 2.3); ctx.globalAlpha = 0.12 + 0.22 * tw; ctx.drawImage(sp, BULBS[i][0] - 7 * s, BULBS[i][1] - 7 * s, 14 * s, 14 * s); } ctx.restore(); }
    // steam from the soup pot and the teapot
    var ws = glowSpr('#ffffff');
    if (ws) [[w * 0.73 + (w * 0.33) * 0.35, h * 0.7 - w * 0.33 * 0.31 - 12 * s], [-w * 0.06 + w * 0.33 * 0.3, h * 0.7 - w * 0.33 * 0.31 - 10 * s]].forEach(function (P, j) {
      for (var k = 0; k < 4; k++) { var ph = (t * 0.3 + k / 4 + j * 0.37) % 1, sz = (3 + ph * 8) * s; ctx.globalAlpha = 0.32 * (1 - ph); ctx.drawImage(ws, P[0] + Math.sin(t * 1.2 + k * 2) * 3 * s - sz, P[1] - ph * 24 * s - sz, sz * 2, sz * 2); }
    });
    ctx.globalAlpha = 1;
    // a slow glint travelling over the glass, and the Sun's glare breathing
    var gq = (t % 14) / 14, gx = lerp(-w * 0.2, w * 1.2, gq);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = lg(ctx, gx - 30 * s, 0, gx + 30 * s, 0, [[0, 'rgba(255,255,255,0)'], [0.5, 'rgba(255,255,255,0.05)'], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(gx - 30 * s, 0, 60 * s, L.hz * 0.95);
    softGlow(ctx, L.sun.x, L.sun.y, (34 + 4 * Math.sin(t * 0.8)) * s, '#ffffff', 0.25); ctx.restore();
  }

  PAINT.moon_dome = { focus: { x: 0.8, y: 0.2 }, track: 'morning', anchors: { earth: { x: 0.8, y: 0.2 }, tea: { x: 0.12, y: 0.62 }, booth: { x: 0.88, y: 0.62 } },
    paint: function (ctx, w, h) { ctx.save(); try { paint(ctx, w, h); } catch (e) { PAINT._err = 'moon_dome: ' + String(e && e.stack || e); } finally { ctx.restore(); } },
    overlay: function (ctx, w, h, t) { ctx.save(); try { overlay(ctx, w, h, t); } catch (e) { PAINT._err = 'moon_dome overlay: ' + String(e && e.stack || e); } finally { ctx.restore(); } } };

  if (typeof LATE !== 'undefined') LATE.push(function () {
    if (typeof PROPS === 'undefined' || typeof PROPS_ART === 'undefined') return;
    // (PROPS_ART.spacewalker, a person in a pressure suit and helmet, is defined in mars_hab.js, whose hook runs first)
    // outside, passers-by wear suits and helmets; inside the dome, people wear normal clothes
    if (PROPS.moon && PROPS_ART.spacewalker) PROPS.moon = PROPS.moon.map(function (p) { return p.id === 'person' ? { id: 'spacewalker', x: p.x, y: p.y, w: p.w * 0.8, talk: p.talk } : p; });
    PROPS.moon_dome = [
      { id: 'person', x: 20, y: 89, w: 50, talk: 'moon', look: { skin: '#c98e64', shirt: '#e86a5a', hair: '#1b1410' } },
      { id: 'mug', x: 8, y: 92, w: 40, sfx: 'clink', fx: 'jiggle', burst: 'steam' },
      { id: 'moonglass', x: 92, y: 92, w: 42, sfx: 'chime', fx: 'jiggle', burst: 'sparkles' },
      { id: 'person', x: 78, y: 88, w: 48, talk: 'moon', look: { skin: '#f1cfb6', shirt: '#4a8fc6', hair: '#b8642e' } },
      { id: 'plant', x: 50, y: 93, w: 40, sfx: 'rustle', fx: 'wiggle', burst: 'leaves' }
    ];
  });
})();
