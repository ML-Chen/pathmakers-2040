/* scenes/nyc.js - Times Square and Broadway in New York at twilight (the world map's preview of the New York place).
   PAINT.nyc. We stand at the south end of the square and look up Broadway. New York is a "preserve": it looks much as
   it does today, with more tourists. Tall buildings on both sides are wrapped in glowing screens (abstract shapes and
   colors, no brands), theater marquees ring with bulbs, a narrow tower stacked with screens stands at the far end, and
   the sky above the canyon of buildings turns from violet to peach. Below: red glowing steps where people sit, a crowd of
   tourists, yellow cabs (they drive themselves in 2040) and a street performer's spot. The interest is in the top half
   (the place card covers the bottom); the lower part is the plaza.
   Uses the painting utilities in window.CHINA_KIT (src/scenes/_china_kit.js). Everything is seeded. */
(function () {
  'use strict';
  var PAINT = (window.PAINT = window.PAINT || {});
  var K, PI = Math.PI, TAU = PI * 2;
  var rng, hash, lerp, mix, rgba, lg, rg, S, rrect, softGlow, haze, finish, batch, dots, dabs, rects, qell, glowSpr, poly, skyStrokes;
  function bind() {
    if (K) return true; K = window.CHINA_KIT; if (!K) return false;
    rng = K.rng; hash = K.hash; lerp = K.lerp; mix = K.mix; rgba = K.rgba; lg = K.lg; rg = K.rg; S = K.S; rrect = K.rrect; softGlow = K.softGlow; haze = K.haze;
    finish = K.finish; batch = K.batch; dots = K.dots; dabs = K.dabs; rects = K.rects; qell = K.qell; glowSpr = K.glowSpr; poly = K.poly; skyStrokes = K.skyStrokes;
    return true;
  }
  var LINE = '#1e1a2a';
  function ink(ctx, s, a, wd) { ctx.strokeStyle = rgba(LINE, a == null ? 0.5 : a); ctx.lineWidth = (wd || 0.7) * s; ctx.lineJoin = 'round'; ctx.stroke(); }
  var SKY = [[0, '#3a3a7a'], [0.45, '#7a5a9a'], [0.8, '#e0889a'], [1, '#f6b890']];
  var SCR = [['#ff5a8a', '#ffd25a'], ['#3ac8f0', '#7a5aff'], ['#ffb03a', '#ff5a4a'], ['#5ae8a0', '#2a8af0'], ['#f0f0ff', '#8a9aff'], ['#ff7ad8', '#5a4aff']];

  var LM = null;
  function layout(w, h) {
    var key = w + 'x' + h; if (LM && LM.key === key) return LM;
    var s = S(w, h), L = { key: key, s: s, w: w, h: h };
    L.vx = w * 0.5; L.vy = h * 0.36; L.street = h * 0.47; L.far = { x0: w * 0.4, x1: w * 0.6 };
    LM = L; return L;
  }

  // a screen panel: gradient with simple shapes (a wave, circles, stripes, a smiling face, stars), never words
  function screenArt(ctx, pts, k, s) {
    var c = SCR[k % SCR.length], xs = pts.map(function (p) { return p[0]; }), ys = pts.map(function (p) { return p[1]; }), minx = Math.min.apply(null, xs), maxx = Math.max.apply(null, xs), miny = Math.min.apply(null, ys), maxy = Math.max.apply(null, ys);
    ctx.save(); poly(ctx, pts); ctx.fillStyle = lg(ctx, minx, miny, maxx, maxy, [[0, c[0]], [1, c[1]]]); ctx.fill(); ctx.clip();
    var cx = (minx + maxx) / 2, cy = (miny + maxy) / 2, W = maxx - minx, H = maxy - miny, m = k % 5;
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = Math.max(0.8, W * 0.06);
    if (m === 0) { ctx.beginPath(); ctx.arc(cx, cy, Math.min(W, H) * 0.3, 0, TAU); ctx.fill(); }
    else if (m === 1) { ctx.beginPath(); ctx.moveTo(minx, cy); ctx.quadraticCurveTo(cx - W * 0.2, miny, cx, cy); ctx.quadraticCurveTo(cx + W * 0.2, maxy, maxx, cy); ctx.stroke(); }
    else if (m === 2) { for (var i = 0; i < 4; i++) ctx.fillRect(minx, miny + H * (0.1 + i * 0.24), W, H * 0.08); }
    else if (m === 3) { ctx.beginPath(); ctx.arc(cx, cy, Math.min(W, H) * 0.32, 0, TAU); ctx.fill(); ctx.fillStyle = c[1]; ctx.beginPath(); ctx.arc(cx - W * 0.08, cy - H * 0.06, Math.min(W, H) * 0.04, 0, TAU); ctx.arc(cx + W * 0.08, cy - H * 0.06, Math.min(W, H) * 0.04, 0, TAU); ctx.fill(); ctx.strokeStyle = c[1]; ctx.beginPath(); ctx.arc(cx, cy, Math.min(W, H) * 0.15, 0.2, PI - 0.2); ctx.stroke(); }
    else { ctx.beginPath(); for (i = 0; i < 5; i++) { var a = -PI / 2 + i * TAU * 2 / 5, R = Math.min(W, H) * 0.3; ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); } ctx.closePath(); ctx.fill(); }
    ctx.restore();
  }

  function paint(ctx, w, h) {
    if (!bind()) return;
    var L = layout(w, h), s = L.s, r = rng(2101), i, j, vx = L.vx, vy = L.vy;
    // twilight sky above the canyon of buildings
    ctx.fillStyle = lg(ctx, 0, 0, 0, L.street, SKY); ctx.fillRect(0, 0, w, L.street);
    skyStrokes(ctx, 0, w, 0, L.street, SKY, 80, r, s, 0.08, '#ffd8b0', '#5a5aa0');
    dots(ctx, 20, [['#ffffff', 0.7]], function () { return [w * (0.3 + r() * 0.4), r() * h * 0.12, 0.5 * s, 0]; });
    // far skyscrapers up Broadway, and the narrow tower stacked with screens at the end of the square
    for (i = 0; i < 9; i++) { var bx = lerp(L.far.x0 - w * 0.05, L.far.x1 + w * 0.02, i / 8), bw = (8 + hash(i, 3) * 10) * s, bh = h * (0.12 + hash(i, 4) * 0.16); ctx.fillStyle = mix('#3a3460', '#6a5a8a', hash(i, 5) * 0.5); ctx.fillRect(bx, L.street - bh, bw, bh);
      rects(ctx, 60, [['#ffd890', 0.7]], function (q) { return hash(q + i * 60, 9) < 0.3 ? [bx + 1 * s + (q % 4) * (bw - 2 * s) / 4, L.street - bh + 2 * s + ((q / 4) | 0) * 3 * s, 1.2 * s, 1.2 * s, 0] : null; }); }
    var tx = vx, tw = w * 0.1, tt = h * 0.13;
    ctx.fillStyle = '#2a2440'; ctx.fillRect(tx - tw / 2, tt, tw, L.street - tt); ctx.fillStyle = '#4a4466'; ctx.fillRect(tx - tw * 0.3, tt - h * 0.02, tw * 0.6, h * 0.02); ctx.fillRect(tx - 0.6 * s, tt - h * 0.05, 1.2 * s, h * 0.03);
    for (i = 0; i < 6; i++) { var sy = tt + h * 0.01 + i * (L.street - tt - h * 0.02) / 6; screenArt(ctx, [[tx - tw / 2 + 1 * s, sy], [tx + tw / 2 - 1 * s, sy], [tx + tw / 2 - 1 * s, sy + (L.street - tt) / 6 - 2 * s], [tx - tw / 2 + 1 * s, sy + (L.street - tt) / 6 - 2 * s]], i + 2, s); }
    // the plaza: pavement, the red glowing steps, a crowd, cabs
    ctx.fillStyle = lg(ctx, 0, L.street, 0, h, [[0, '#5a4a5e'], [0.4, '#6a5866'], [1, '#3a3040']]); ctx.fillRect(0, L.street, w, h - L.street);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = lg(ctx, 0, L.street, 0, h * 0.8, [[0, 'rgba(255,120,180,0.25)'], [1, 'rgba(120,120,255,0)']]); ctx.fillRect(0, L.street, w, h * 0.33); ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 0.7 * s; ctx.beginPath(); for (i = -10; i <= 10; i++) { ctx.moveTo(vx + i * w * 0.02, L.street); ctx.lineTo(vx + i * w * 0.2, h); } for (i = 0; i < 10; i++) { var yy = L.street + (h - L.street) * Math.pow(i / 10, 1.6); ctx.moveTo(0, yy); ctx.lineTo(w, yy); } ctx.stroke();
    // the buildings on both sides, in perspective, wrapped in screens and lit windows
    [[-1, [[0.0, 0.0], [0.4, 0.26]]], [1, [[1.0, 0.0], [0.6, 0.26]]]].forEach(function (side, sd) {
      var dir = side[0], nb = 4;
      for (var b = nb - 1; b >= 0; b--) {
        var t0 = b / nb, t1 = (b + 1) / nb, xNear = dir < 0 ? -w * 0.02 : w * 1.02, xFar = dir < 0 ? L.far.x0 : L.far.x1;
        var xa = lerp(xFar, xNear, Math.pow(t0, 1.3)), xb = lerp(xFar, xNear, Math.pow(t1, 1.3)), H0 = lerp(0.17, 0.02, t0) * h, H1 = lerp(0.17, 0.02, t1) * h;
        var topA = H0 - (b % 2 ? h * 0.05 : 0), topB = H1 - (b % 2 ? h * 0.05 : 0), botA = vy + (L.street - vy) * (1 + t0 * 1.3), botB = vy + (L.street - vy) * (1 + t1 * 1.3);
        var face = [[xa, topA], [xb, topB], [xb, botB], [xa, botA]];
        poly(ctx, face); ctx.fillStyle = lg(ctx, xa, 0, xb, 0, [[0, mix('#2a2440', '#4a3e5e', b / nb)], [1, mix('#3a3254', '#5a4c70', b / nb)]]); ctx.fill(); ink(ctx, s, 0.4);
        // lit storefronts along the foot of the building
        (function () { var fa = [xa, botA - (botA - topA) * 0.08], fb = [xb, botB - (botB - topB) * 0.08]; poly(ctx, [fa, fb, [xb, botB], [xa, botA]]); ctx.fillStyle = '#ffcf8a'; ctx.fill();
          ctx.strokeStyle = 'rgba(60,40,50,0.6)'; ctx.lineWidth = 0.6 * s; ctx.beginPath(); for (var q = 1; q < 6; q++) { var u = q / 6; ctx.moveTo(lerp(xa, xb, u), lerp(fa[1], fb[1], u)); ctx.lineTo(lerp(xa, xb, u), lerp(botA, botB, u)); } ctx.stroke();
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; softGlow(ctx, (xa + xb) / 2, (botA + botB) / 2, Math.abs(xb - xa) * 0.7, '#ffb070', 0.2); ctx.restore(); })();
        // lit windows
        rects(ctx, 260, [['#ffd890', 0.75], ['#9ab8ff', 0.5]], function (q) { var u = hash(q + b * 300 + sd * 1000, 11), v = hash(q + b * 300 + sd * 1000, 12); if (hash(q, b + 30) < 0.45) return null; var x = lerp(xa, xb, u), y = lerp(lerp(topA, topB, u), lerp(botA, botB, u), v * 0.55); return [x, y, Math.abs(xb - xa) * 0.03, 1.4 * s * (1 + t0), q % 5 === 0 ? 1 : 0]; });
        // two or three big screens on each building
        var nS = 2 + (b % 2);
        for (j = 0; j < nS; j++) { var u0 = 0.08 + j * 0.9 / nS, u1 = u0 + 0.8 / nS, v0 = 0.3 + (j % 2) * 0.12, v1 = v0 + 0.22;
          function at(u, v) { return [lerp(xa, xb, u), lerp(lerp(topA, topB, u), lerp(botA, botB, u), v)]; }
          screenArt(ctx, [at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1)], b * 3 + j + sd * 2, s);
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; var cc = at((u0 + u1) / 2, (v0 + v1) / 2); softGlow(ctx, cc[0], cc[1], Math.abs(xb - xa) * 0.6, SCR[(b * 3 + j + sd * 2) % SCR.length][0], 0.18); ctx.restore(); }
        // a theater marquee with a ring of bulbs near street level
        if (b === 1 || b === 2) { var mA = [lerp(xa, xb, 0.2), lerp(botA, botB, 0.2) - h * 0.05], mB = [lerp(xa, xb, 0.8), lerp(botA, botB, 0.8) - h * 0.05], mh = h * 0.018 * (1 + t0);
          poly(ctx, [mA, mB, [mB[0], mB[1] + mh], [mA[0], mA[1] + mh]]); ctx.fillStyle = '#c8303a'; ctx.fill(); ink(ctx, s, 0.5);
          dots(ctx, 18, [['#fff0b0', 1]], function (q) { var t = q / 17; return [lerp(mA[0], mB[0], t), lerp(mA[1], mB[1], t) + (q % 2 ? mh : 0), 0.9 * s * (1 + t0), 0]; }); }
      }
    });
    // red steps in the middle of the square
    var sx0 = w * 0.38, sx1 = w * 0.62, sy0 = L.street - h * 0.002;
    for (i = 0; i < 6; i++) { var y0 = sy0 + i * 2.2 * s, k2 = 1 + i * 0.05; ctx.fillStyle = i % 2 ? '#c82a3a' : '#e8404a'; ctx.fillRect(vx - (vx - sx0) * k2, y0, (sx1 - sx0) * k2, 2.4 * s); }
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; softGlow(ctx, vx, sy0 + 6 * s, w * 0.18, '#ff4a5a', 0.3); ctx.restore();
    // a street performer's chalk circle and a food cart with an umbrella
    var pcx = w * 0.3, pcy = h * 0.66; ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1.2 * s; ctx.beginPath(); qell(ctx, pcx, pcy, 34 * s, 8 * s, 0); ctx.stroke();
    var fcx = w * 0.78, fcy = h * 0.68; ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); qell(ctx, fcx, fcy + 1 * s, 22 * s, 4 * s, 0); ctx.fill();
    ctx.fillStyle = '#d8dce4'; ctx.beginPath(); rrect(ctx, fcx - 18 * s, fcy - 18 * s, 36 * s, 16 * s, 3 * s); ctx.fill(); ink(ctx, s, 0.5); ctx.fillStyle = '#2a8ad8'; ctx.fillRect(fcx - 18 * s, fcy - 10 * s, 36 * s, 3 * s);
    ctx.fillStyle = '#2a2a30'; ctx.beginPath(); ctx.arc(fcx - 11 * s, fcy - 1 * s, 3 * s, 0, TAU); ctx.arc(fcx + 11 * s, fcy - 1 * s, 3 * s, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#5a5a64'; ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.moveTo(fcx, fcy - 18 * s); ctx.lineTo(fcx, fcy - 40 * s); ctx.stroke();
    for (i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? '#f2c41e' : '#2a8ad8'; ctx.beginPath(); ctx.moveTo(fcx, fcy - 44 * s); ctx.lineTo(fcx - 24 * s + i * 8 * s, fcy - 36 * s); ctx.lineTo(fcx - 16 * s + i * 8 * s, fcy - 36 * s); ctx.closePath(); ctx.fill(); }
    // the crowd: little silhouettes in bright jackets
    for (i = 0; i < 120; i++) { var py = lerp(L.street + 3 * s, h * 0.8, Math.pow(r(), 1.6)), spread = (py - L.vy) / (L.street - L.vy), px = L.vx + (r() - 0.5) * w * 0.4 * spread, k3 = 0.6 + (py - L.street) / (h * 0.07) * 0.8, ph = 9 * s * k3; if (px < -10 * s || px > w + 10 * s) continue;
      ctx.fillStyle = ['#e8566c', '#3ac8f0', '#ffd25a', '#f0f0f0', '#5ae8a0', '#8a5ad8', '#2a2a3a'][(r() * 7) | 0]; ctx.beginPath(); rrect(ctx, px - ph * 0.18, py - ph * 0.75, ph * 0.36, ph * 0.5, ph * 0.12); ctx.fill();
      ctx.fillStyle = '#2a2230'; ctx.fillRect(px - ph * 0.14, py - ph * 0.28, ph * 0.28, ph * 0.28); ctx.fillStyle = ['#f1cfb6', '#c98e64', '#8a5a3c', '#e8b896'][(r() * 4) | 0]; ctx.beginPath(); ctx.arc(px, py - ph * 0.88, ph * 0.14, 0, TAU); ctx.fill(); }
    // yellow cabs crossing at the near street
    [[0.12, 0.535], [0.7, 0.545], [0.9, 0.53]].forEach(function (c) { var cx = w * c[0], cy = h * c[1], cl = 24 * s; ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); qell(ctx, cx, cy + 1 * s, cl * 0.55, 2 * s, 0); ctx.fill();
      ctx.fillStyle = '#f2c41e'; ctx.beginPath(); rrect(ctx, cx - cl / 2, cy - 7 * s, cl, 6 * s, 2 * s); ctx.fill(); ctx.beginPath(); rrect(ctx, cx - cl * 0.28, cy - 11 * s, cl * 0.56, 5 * s, 2 * s); ctx.fill(); ink(ctx, s, 0.5);
      ctx.fillStyle = '#3a4a6a'; ctx.fillRect(cx - cl * 0.24, cy - 10 * s, cl * 0.22, 3 * s); ctx.fillRect(cx + cl * 0.02, cy - 10 * s, cl * 0.22, 3 * s); ctx.fillStyle = '#2a2a30'; ctx.beginPath(); ctx.arc(cx - cl * 0.3, cy - 1 * s, 2.4 * s, 0, TAU); ctx.arc(cx + cl * 0.3, cy - 1 * s, 2.4 * s, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff6c8'; ctx.fillRect(cx - 2 * s, cy - 12.6 * s, 4 * s, 1.6 * s); });
    ctx.fillStyle = lg(ctx, 0, h * 0.7, 0, h, [[0, 'rgba(20,14,30,0)'], [1, 'rgba(20,14,30,0.4)']]); ctx.fillRect(0, h * 0.7, w, h * 0.3);
    finish(ctx, w, h, '#ff9ac0', 0.1, 0.3, 0.04, '#0e0a1a', 0.38);
  }
  function overlay(ctx, w, h, t) {
    if (!bind()) return;
    var L = layout(w, h), s = L.s, i;
    // the screens flicker and change: soft colored pulses sweep over the facades
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (i = 0; i < 8; i++) { var side = i % 2 ? 1 : -1, u = hash(i, 3), x = side < 0 ? lerp(w * 0.02, w * 0.36, u) : lerp(w * 0.64, w * 0.98, u), y = h * (0.12 + hash(i, 4) * 0.26), ph = 0.5 + 0.5 * Math.sin(t * (0.7 + hash(i, 5)) + i * 2);
      softGlow(ctx, x, y, (20 + 20 * hash(i, 6)) * s, SCR[i % SCR.length][(Math.floor(t * 0.3 + i) % 2)], 0.08 + 0.1 * ph); }
    // marquee bulbs chase around
    ctx.fillStyle = '#ffffff'; for (i = 0; i < 20; i++) { var q = (t * 3 + i) % 20; if (q > 1) continue; ctx.globalAlpha = 0.7; ctx.fillRect(w * (0.05 + hash(i, 8) * 0.9), h * (0.4 + hash(i, 9) * 0.04), 1.4 * s, 1.4 * s); }
    ctx.restore(); ctx.globalAlpha = 1;
    // a cab gliding across, and a delivery drone high between the buildings
    var cq = (t % 12) / 12, cx = lerp(-30 * s, w + 30 * s, cq), cy = h * 0.56, cl = 26 * s;
    ctx.fillStyle = '#f2c41e'; ctx.beginPath(); rrect(ctx, cx - cl / 2, cy - 7 * s, cl, 6 * s, 2 * s); ctx.fill(); ctx.beginPath(); rrect(ctx, cx - cl * 0.28, cy - 11 * s, cl * 0.56, 5 * s, 2 * s); ctx.fill();
    ctx.fillStyle = '#3a4a6a'; ctx.fillRect(cx - cl * 0.24, cy - 10 * s, cl * 0.22, 3 * s); ctx.fillRect(cx + cl * 0.02, cy - 10 * s, cl * 0.22, 3 * s); ctx.fillStyle = '#2a2a30'; ctx.beginPath(); ctx.arc(cx - cl * 0.3, cy - 1 * s, 2.4 * s, 0, TAU); ctx.arc(cx + cl * 0.3, cy - 1 * s, 2.4 * s, 0, TAU); ctx.fill();
    var dq = (t % 26) / 26; K.drawDrone(ctx, lerp(w * 0.35, w * 0.65, dq), h * 0.08 + Math.sin(t) * 3 * s, 3.4 * s, '#e8e8f4', Math.sin(t * 5) > 0.5 ? 1 : 0, '#ff5a4a');
  }

  PAINT.nyc = { focus: { x: 0.5, y: 0.13 }, track: 'night', anchors: { tower: { x: 0.5, y: 0.25 }, steps: { x: 0.5, y: 0.48 } },
    paint: function (ctx, w, h) { ctx.save(); try { paint(ctx, w, h); } catch (e) { PAINT._err = 'nyc: ' + String(e && e.stack || e); } finally { ctx.restore(); } },
    overlay: function (ctx, w, h, t) { ctx.save(); try { overlay(ctx, w, h, t); } catch (e) { PAINT._err = 'nyc overlay: ' + String(e && e.stack || e); } finally { ctx.restore(); } } };

  if (typeof LATE !== 'undefined') LATE.push(function () {
    if (typeof PROPS === 'undefined' || typeof PROPS_ART === 'undefined') return;
    var hit = function (vw, vh, shape) { return function () { return '<svg viewBox="0 0 ' + vw + ' ' + vh + '"><g class="pa-body pa-hit">' + shape + '</g></svg>'; }; };
    PROPS_ART.nyc_tower = hit(60, 160, '<rect width="60" height="160" rx="10" fill="#fff"/>');
    PROPS_ART.nyc_steps = hit(120, 30, '<rect width="120" height="30" rx="10" fill="#fff"/>');
    PROPS.nyc = [
      { id: 'nyc_tower', x: 50, y: 47, w: 40, sfx: 'chime', fx: 'glow', burst: 'sparkles', who: 'byte', say: 'Every New Year’s Eve, a big glowing ball drops from a tower right here. It has happened almost every year since 1907.' },
      { id: 'nyc_steps', x: 50, y: 50, w: 96, sfx: 'blip', fx: 'glow', who: 'byte', say: 'People sit on these red steps to watch the screens. More than 40 theaters are within a few blocks of here.' },
      { id: 'star', x: 44, y: 6, w: 18, sfx: 'chime', fx: 'shoot' }
    ];
  });
})();
