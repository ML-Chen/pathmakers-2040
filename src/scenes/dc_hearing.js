/* dc_hearing.js - a House committee hearing room in the Rayburn House Office Building (like Room 2123): oak-paneled
   walls, a two-tier curved dais of dark walnut with nameplates and gooseneck microphones, the House seal on a blue
   panel, US flags, wall screens, press cameras, and the witness table in front. Reusable for any DC hearing or markup.
   Layout (fractions of w, h): ceiling to 0.085; back wall to 0.36; upper dais rail y 0.335; lower dais rail y 0.47;
   carpet from 0.56; witness table top y 0.885 (x 0.06..0.94) for props. Uses window.DCK (dc__kit.js). */
(function () {
  'use strict';
  var PAINT = (window.PAINT = window.PAINT || {});
  function K() { return window.DCK; }
  var LAY = null;
  function lay(w, h) {
    var k = w + 'x' + h; if (LAY && LAY.k === k) return LAY;
    var s = K().S(w, h);
    LAY = { k: k, s: s, ceil: h * 0.085, wallB: h * 0.36, up: h * 0.335, low: h * 0.47, floor: h * 0.56, tab: h * 0.885, seal: [w * 0.5, h * 0.19], sealR: Math.min(w * 0.085, h * 0.042),
      scr: [[w * 0.035, h * 0.15, w * 0.2, h * 0.09], [w * 0.765, h * 0.15, w * 0.2, h * 0.09]], cams: [w * 0.06, w * 0.94] };
    return LAY;
  }
  // a curved tier of the dais: the ends come toward the viewer (lower on screen, taller)
  function tierY(L, w, yc, x, bend) { var u = (x - w * 0.5) / (w * 0.5); return yc + bend * u * u; }
  function paintRoom(ctx, w, h) {
    var D = K(), L = lay(w, h), s = L.s, r = D.rng(92101), i, j, x, y;
    var lg = D.lg, rgba = D.rgba, mix = D.mix, TAU = D.TAU;
    /* ---------- ceiling: coffers with recessed lights ---------- */
    ctx.fillStyle = lg(ctx, 0, 0, 0, L.ceil, [[0, '#e6dcc8'], [1, '#d2c6ae']]); ctx.fillRect(0, 0, w, L.ceil);
    // coffers in perspective: rows shrink toward the far wall; beams converge on a vanishing point below the seal
    var rowsY = [0, 0.46, 0.78, 1].map(function (f) { return L.ceil * f; }), vpx = w * 0.5;
    for (j = 0; j < 3; j++) { var cy0 = rowsY[j], cy1 = rowsY[j + 1], n = 5 + j * 2, sh2 = 1 - j * 0.28;
      for (i = 0; i < n; i++) { var xa = w * (i / n), xb = w * ((i + 1) / n), m2 = 3 * s * sh2;
        var q = [[D.lerp(vpx, xa, 1) + m2, cy0 + m2], [xb - m2, cy0 + m2], [D.lerp(xb, vpx, 0.08 * (j + 1)) - m2, cy1 - m2], [D.lerp(xa, vpx, 0.08 * (j + 1)) + m2, cy1 - m2]];
        D.poly(ctx, q); ctx.fillStyle = lg(ctx, 0, cy0, 0, cy1, [[0, '#c4b494'], [1, '#e8dec8']]); ctx.fill();
        var lx2 = (q[0][0] + q[1][0] + q[2][0] + q[3][0]) / 4, ly2 = (cy0 + cy1) / 2;
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; D.glow(ctx, lx2, ly2, 14 * s * sh2, '#fff2c8', 0.5); ctx.restore();
        ctx.fillStyle = '#fffaf0'; ctx.beginPath(); ctx.ellipse(lx2, ly2, 5 * s * sh2, 1.8 * s * sh2, 0, 0, TAU); ctx.fill(); } }
    ctx.fillStyle = '#c8b898'; ctx.fillRect(0, L.ceil - 4 * s, w, 4 * s); ctx.fillStyle = '#f4ead4'; ctx.fillRect(0, L.ceil - 4 * s, w, 1.4 * s);
    /* ---------- back wall: oak panels with fluted pilasters ---------- */
    var oak = ['#7a5232', '#a0703f', '#c89660'];
    ctx.fillStyle = lg(ctx, 0, L.ceil, 0, L.wallB + h * 0.05, [[0, oak[1]], [0.6, oak[0]], [1, '#4a2e1a']]); ctx.fillRect(0, L.ceil, w, L.wallB + h * 0.05 - L.ceil);
    D.batch(ctx, 900, [[oak[2], 0.7 * s, 0.22], ['#4a2e1a', 0.8 * s, 0.2]], function () { var xx = r() * w, yy = D.lerp(L.ceil, L.wallB, r()), l = (10 + r() * 30) * s; return [xx, yy, xx + (r() - 0.5) * s, yy + l, r() < 0.5 ? 0 : 1]; });
    var NP = 8;
    for (i = 0; i <= NP; i++) { x = w * i / NP; ctx.fillStyle = lg(ctx, x - 6 * s, 0, x + 6 * s, 0, [[0, oak[0]], [0.4, oak[2]], [1, '#4a2e1a']]); ctx.fillRect(x - 5 * s, L.ceil, 10 * s, L.wallB - L.ceil);
      for (j = -1; j <= 1; j++) { ctx.fillStyle = rgba('#3a2010', 0.35); ctx.fillRect(x + j * 3 * s - 0.5 * s, L.ceil + 8 * s, 1 * s, L.wallB - L.ceil - 16 * s); } }
    for (i = 0; i < NP; i++) { var px0 = w * i / NP + 9 * s, px1 = w * (i + 1) / NP - 9 * s; ctx.strokeStyle = rgba('#3a2010', 0.35); ctx.lineWidth = 1.2 * s; ctx.strokeRect(px0, L.ceil + 12 * s, px1 - px0, (L.wallB - L.ceil) * 0.55);
      ctx.strokeStyle = rgba(oak[2], 0.35); ctx.strokeRect(px0 + 1.2 * s, L.ceil + 13.2 * s, px1 - px0, (L.wallB - L.ceil) * 0.55); }
    // the blue panel and the seal
    var sx = L.seal[0], sy = L.seal[1], sr = L.sealR;
    ctx.fillStyle = lg(ctx, 0, L.ceil, 0, L.wallB, [[0, '#2a3a72'], [1, '#1a2450']]); ctx.fillRect(sx - sr * 1.55, L.ceil + 6 * s, sr * 3.1, L.wallB - L.ceil - 6 * s);
    ctx.strokeStyle = '#c8a04a'; ctx.lineWidth = 2 * s; ctx.strokeRect(sx - sr * 1.55 + 4 * s, L.ceil + 10 * s, sr * 3.1 - 8 * s, L.wallB - L.ceil - 14 * s);
    D.glow(ctx, sx, sy, sr * 2, '#ffe6a0', 0.25);
    ctx.fillStyle = lg(ctx, sx - sr, sy - sr, sx + sr, sy + sr, [[0, '#f4d27a'], [0.5, '#c89838'], [1, '#8a6420']]); ctx.beginPath(); ctx.arc(sx, sy, sr, 0, TAU); ctx.fill();
    ctx.fillStyle = '#1e2a5c'; ctx.beginPath(); ctx.arc(sx, sy, sr * 0.8, 0, TAU); ctx.fill();
    ctx.fillStyle = '#f4d27a'; ctx.beginPath(); ctx.arc(sx, sy, sr * 0.74, 0, TAU); ctx.fill();
    ctx.fillStyle = '#26346a'; ctx.beginPath(); ctx.arc(sx, sy, sr * 0.7, 0, TAU); ctx.fill();
    // ring of 13 stars and an eagle with spread wings and a shield
    ctx.fillStyle = '#f8e0a0'; for (i = 0; i < 13; i++) { var a = -Math.PI / 2 + i * TAU / 13, stx = sx + Math.cos(a) * sr * 0.9, sty = sy + Math.sin(a) * sr * 0.9; ctx.beginPath(); for (j = 0; j < 10; j++) { var aa = -Math.PI / 2 + j * Math.PI / 5, rr = j % 2 ? sr * 0.025 : sr * 0.06; ctx.lineTo(stx + Math.cos(aa) * rr, sty + Math.sin(aa) * rr); } ctx.closePath(); ctx.fill(); }
    ctx.fillStyle = '#e8c068'; ctx.beginPath(); ctx.moveTo(sx, sy - sr * 0.25);
    ctx.bezierCurveTo(sx - sr * 0.2, sy - sr * 0.45, sx - sr * 0.5, sy - sr * 0.45, sx - sr * 0.6, sy - sr * 0.2); ctx.lineTo(sx - sr * 0.48, sy - sr * 0.22); ctx.lineTo(sx - sr * 0.55, sy - sr * 0.05); ctx.lineTo(sx - sr * 0.42, sy - sr * 0.08); ctx.lineTo(sx - sr * 0.45, sy + sr * 0.08); ctx.quadraticCurveTo(sx - sr * 0.25, sy, sx - sr * 0.15, sy + sr * 0.05);
    ctx.lineTo(sx - sr * 0.18, sy + sr * 0.4); ctx.lineTo(sx, sy + sr * 0.5); ctx.lineTo(sx + sr * 0.18, sy + sr * 0.4); ctx.lineTo(sx + sr * 0.15, sy + sr * 0.05);
    ctx.quadraticCurveTo(sx + sr * 0.25, sy, sx + sr * 0.45, sy + sr * 0.08); ctx.lineTo(sx + sr * 0.42, sy - sr * 0.08); ctx.lineTo(sx + sr * 0.55, sy - sr * 0.05); ctx.lineTo(sx + sr * 0.48, sy - sr * 0.22); ctx.lineTo(sx + sr * 0.6, sy - sr * 0.2);
    ctx.bezierCurveTo(sx + sr * 0.5, sy - sr * 0.45, sx + sr * 0.2, sy - sr * 0.45, sx, sy - sr * 0.25); ctx.fill();
    ctx.beginPath(); ctx.arc(sx, sy - sr * 0.32, sr * 0.09, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.fillRect(sx - sr * 0.13, sy - sr * 0.08, sr * 0.26, sr * 0.08);
    for (i = 0; i < 4; i++) { ctx.fillStyle = i % 2 ? '#ffffff' : '#c8283a'; ctx.fillRect(sx - sr * 0.13 + i * sr * 0.065, sy, sr * 0.065, sr * 0.22); }
    ctx.fillStyle = '#26346a'; ctx.fillRect(sx - sr * 0.13, sy - sr * 0.08, sr * 0.26, sr * 0.08);
    /* ---------- wall screens (2042: thin glass panels showing the hearing) ---------- */
    L.scr.forEach(function (q, k) { var qx = q[0], qy = q[1], qw = q[2], qh = q[3];
      ctx.fillStyle = '#121626'; ctx.beginPath(); D.rrect(ctx, qx - 3 * s, qy - 3 * s, qw + 6 * s, qh + 6 * s, 4 * s); ctx.fill();
      ctx.fillStyle = lg(ctx, qx, qy, qx, qy + qh, [[0, '#24346a'], [1, '#16204a']]); ctx.fillRect(qx, qy, qw, qh);
      ctx.fillStyle = '#e0b04a'; ctx.fillRect(qx + 6 * s, qy + 7 * s, qw * 0.5, 3 * s); ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.fillRect(qx + 6 * s, qy + 14 * s, qw * 0.75, 2 * s); ctx.fillRect(qx + 6 * s, qy + 19 * s, qw * 0.6, 2 * s);
      ctx.font = '700 ' + Math.round(8 * s) + 'px Nunito, sans-serif'; ctx.fillStyle = '#ffffff'; ctx.fillText(k ? 'H.R. 6120' : 'HEARING', qx + 6 * s, qy + qh - 8 * s); });
    /* ---------- flags flanking the seal ---------- */
    D.flagPole(ctx, { x: w * 0.27, top: h * 0.105, foot: L.up + h * 0.01, s: s * 0.8, side: -1, seed: 5 });
    D.flagPole(ctx, { x: w * 0.73, top: h * 0.105, foot: L.up + h * 0.01, s: s * 0.8, side: 1, seed: 9 });
    /* ---------- the dais: two curved tiers of walnut; the ends come toward the viewer ---------- */
    var bUp = h * 0.022, bLow = h * 0.04, Hlow = h * 0.05;
    function chair(x, ty, cw, ch) { // a tall oxblood leather chair back with button tufting
      ctx.fillStyle = lg(ctx, x - cw / 2, 0, x + cw / 2, 0, [[0, '#3a1216'], [0.35, '#7a2a2e'], [0.7, '#5a1c20'], [1, '#2a0c10']]);
      ctx.beginPath(); ctx.moveTo(x - cw / 2, ty + 4 * s); ctx.lineTo(x - cw / 2, ty - ch * 0.75); ctx.quadraticCurveTo(x - cw / 2, ty - ch, x, ty - ch); ctx.quadraticCurveTo(x + cw / 2, ty - ch, x + cw / 2, ty - ch * 0.75); ctx.lineTo(x + cw / 2, ty + 4 * s); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,200,190,0.16)'; ctx.beginPath(); ctx.ellipse(x - cw * 0.18, ty - ch * 0.7, cw * 0.12, ch * 0.18, -0.2, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(20,0,4,0.45)'; for (var t2 = 0; t2 < 2; t2++) for (var t3 = 0; t3 < 3; t3++) { ctx.beginPath(); ctx.arc(x + (t3 - 1) * cw * 0.25 + (t2 ? cw * 0.12 : 0), ty - ch * (0.72 - t2 * 0.2), 0.9 * s, 0, TAU); ctx.fill(); }
      ctx.fillStyle = '#c8a04a'; for (var t4 = 0; t4 < 6; t4++) { ctx.beginPath(); ctx.arc(x - cw / 2 + 1.6 * s, ty - ch * 0.72 + t4 * ch * 0.14, 0.8 * s, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(x + cw / 2 - 1.6 * s, ty - ch * 0.72 + t4 * ch * 0.14, 0.8 * s, 0, TAU); ctx.fill(); }
    }
    function tier(yc, bend, bot, pal, plates, panels) {
      var N = 48, top = [], k;
      for (k = 0; k <= N; k++) { x = w * (-0.02 + 1.04 * k / N); top.push([x, tierY(L, w, yc, x, bend)]); }
      // the desk top: a lighter strip of polished wood
      ctx.beginPath(); top.forEach(function (p, k2) { if (k2) ctx.lineTo(p[0], p[1] - 7 * s); else ctx.moveTo(p[0], p[1] - 7 * s); }); for (k = N; k >= 0; k--) ctx.lineTo(top[k][0], top[k][1]); ctx.closePath();
      ctx.fillStyle = lg(ctx, 0, yc - 7 * s, 0, yc, [[0, pal[1]], [1, pal[2]]]); ctx.fill();
      // front face, down to bot(x)
      ctx.beginPath(); top.forEach(function (p, k2) { if (k2) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); });
      for (k = N; k >= 0; k--) ctx.lineTo(top[k][0], bot(top[k][0])); ctx.closePath();
      ctx.fillStyle = lg(ctx, 0, yc, 0, bot(w * 0.5) + h * 0.03, [[0, pal[1]], [1, pal[0]]]); ctx.fill();
      ctx.save(); ctx.clip();
      D.batch(ctx, 600, [[pal[2], 0.7 * s, 0.22], ['#000000', 0.8 * s, 0.18]], function () { var xx = r() * w, y0 = tierY(L, w, yc, xx, bend), yy = D.lerp(y0, bot(xx), r()), l = (10 + r() * 30) * s; return [xx, yy, xx + l, yy + (r() - 0.5) * s, r() < 0.5 ? 0 : 1]; });
      // raised panels following the curve
      for (k = 0; k < panels; k++) { var xa = w * (k + 0.12) / panels, xb = w * (k + 0.88) / panels, ya = tierY(L, w, yc, xa, bend) + 8 * s, yb = tierY(L, w, yc, xb, bend) + 8 * s, ba = bot(xa) - 5 * s, bb = bot(xb) - 5 * s;
        if (ba - ya < 8 * s) continue; D.poly(ctx, [[xa, ya], [xb, yb], [xb, bb], [xa, ba]]); ctx.fillStyle = rgba('#000000', 0.18); ctx.fill();
        D.poly(ctx, [[xa + 1.5 * s, ya + 1.5 * s], [xb - 1.5 * s, yb + 1.5 * s], [xb - 1.5 * s, bb - 1.5 * s], [xa + 1.5 * s, ba - 1.5 * s]]); ctx.fillStyle = lg(ctx, 0, ya, 0, ba, [[0, mix(pal[1], pal[2], 0.3)], [1, pal[1]]]); ctx.fill(); }
      ctx.restore();
      // brass edge along the top
      ctx.strokeStyle = '#d8b060'; ctx.lineWidth = 1.5 * s; ctx.beginPath(); top.forEach(function (p, k2) { if (k2) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }); ctx.stroke();
      if (plates) for (k = 0; k < plates; k++) { x = w * (0.06 + k * 0.88 / (plates - 1)); var py = tierY(L, w, yc, x, bend), sc = 1 + Math.abs(x / w - 0.5) * 0.5, pw2 = 20 * s * sc;
        // gooseneck microphone
        ctx.strokeStyle = '#2a2a34'; ctx.lineWidth = 1.3 * s; ctx.beginPath(); ctx.moveTo(x + pw2 * 0.4, py - 6 * s); ctx.quadraticCurveTo(x + pw2 * 0.45, py - 19 * s * sc, x + pw2 * 0.15, py - 22 * s * sc); ctx.stroke();
        ctx.fillStyle = '#1a1a22'; ctx.beginPath(); ctx.ellipse(x + pw2 * 0.12, py - 22.5 * s * sc, 2.6 * s, 1.6 * s, -0.4, 0, TAU); ctx.fill();
        ctx.fillStyle = '#2a2a34'; ctx.fillRect(x + pw2 * 0.28, py - 7.5 * s, 7 * s, 2.4 * s);
        // a folder and a glass on the desk, a nameplate on the front edge
        ctx.fillStyle = k % 3 ? '#f4efe2' : '#cfe0f4'; ctx.fillRect(x - pw2 * 0.45, py - 5.5 * s, pw2 * 0.4, 2.6 * s);
        ctx.fillStyle = '#f4efe2'; ctx.fillRect(x - pw2 / 2, py + 3 * s, pw2, 7 * s * sc); ctx.fillStyle = '#2a2a3a'; ctx.fillRect(x - pw2 * 0.35, py + 5.5 * s, pw2 * 0.7, 1.6 * s * sc);
        ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x - pw2 / 2, py + 3 * s + 7 * s * sc, pw2, 1.2 * s); }
    }
    // wall base behind the dais
    ctx.fillStyle = lg(ctx, 0, L.wallB - h * 0.04, 0, L.up + h * 0.04, [[0, '#4a2e1a'], [1, '#2a180c']]); ctx.fillRect(0, L.wallB - h * 0.04, w, L.up + h * 0.08 - L.wallB);
    for (i = 0; i < 11; i++) { x = w * (0.04 + i * 0.92 / 10); var sc2 = 1 + Math.abs(x / w - 0.5) * 0.4; chair(x, tierY(L, w, L.up, x, bUp), 21 * s * sc2, h * 0.062 * sc2); }
    tier(L.up, bUp, function (xx) { return tierY(L, w, L.low, xx, bLow) + 6 * s; }, ['#2e180c', '#56321a', '#8a5a30'], 11, 9);
    for (i = 0; i < 9; i++) { x = w * (0.06 + i * 0.88 / 8); var sc3 = 1 + Math.abs(x / w - 0.5) * 0.5; chair(x, tierY(L, w, L.low, x, bLow), 23 * s * sc3, h * 0.055 * sc3); }
    tier(L.low, bLow, function (xx) { var u = (xx - w * 0.5) / (w * 0.5); return tierY(L, w, L.low, xx, bLow) + Hlow * (1 + 0.6 * u * u); }, ['#2a160a', '#4e2c16', '#7e522c'], 9, 7);
    /* ---------- the well: carpet with a gold border, in perspective ---------- */
    function wellTop(xx) { var u = (xx - w * 0.5) / (w * 0.5); return tierY(L, w, L.low, xx, bLow) + Hlow * (1 + 0.6 * u * u); }
    ctx.save(); ctx.beginPath(); ctx.moveTo(0, h); for (i = 0; i <= 30; i++) { x = w * i / 30; ctx.lineTo(x, wellTop(x) - 0.5); } ctx.lineTo(w, h); ctx.closePath(); ctx.clip();
    var fy = wellTop(w * 0.5);
    ctx.fillStyle = lg(ctx, 0, fy, 0, h, [[0, '#14224a'], [0.4, '#1e3262'], [1, '#18285a']]); ctx.fillRect(0, fy - h * 0.06, w, h - fy + h * 0.06);
    D.batch(ctx, 1400, [['#2e4680', 0.8 * s, 0.3], ['#0e1838', 0.8 * s, 0.3]], function () { var xx = r() * w, yy = D.lerp(fy - h * 0.05, h, r()), l = (1.5 + r() * 3) * s; return [xx, yy, xx + l, yy + (r() - 0.5) * s, r() < 0.5 ? 0 : 1]; });
    // gold border lines of the carpet converging toward the dais
    ctx.strokeStyle = 'rgba(214,176,90,0.55)'; ctx.lineWidth = 1.6 * s; ctx.beginPath(); ctx.moveTo(w * 0.22, fy + h * 0.02); ctx.lineTo(-w * 0.1, h); ctx.moveTo(w * 0.78, fy + h * 0.02); ctx.lineTo(w * 1.1, h);
    ctx.moveTo(w * 0.25, fy + h * 0.02); ctx.lineTo(-w * 0.05, h); ctx.moveTo(w * 0.75, fy + h * 0.02); ctx.lineTo(w * 1.05, h); ctx.stroke();
    for (j = 1; j < 8; j++) { var yy0 = fy + Math.pow(j / 8, 1.6) * (h - fy), sc = 0.4 + j / 8; for (i = -2; i <= 2; i++) { x = w * 0.5 + i * w * 0.15 * sc + (j % 2 ? w * 0.075 * sc : 0); if (Math.abs(x - w / 2) > w * (0.26 + 0.3 * j / 8)) continue; ctx.fillStyle = rgba('#d6b05a', 0.32); ctx.beginPath(); ctx.ellipse(x, yy0, 4.5 * s * sc, 1.6 * s * sc, 0, 0, TAU); ctx.fill(); } }
    ctx.fillStyle = lg(ctx, 0, fy, 0, fy + h * 0.06, [[0, 'rgba(0,0,0,0.45)'], [1, 'rgba(0,0,0,0)']]); ctx.fillRect(0, fy - h * 0.02, w, h * 0.09);
    ctx.restore();
    // the clerk's table and the stenographer's desk in the well
    var ct = fy + h * 0.06; ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(w * 0.5, ct + h * 0.035, w * 0.16, h * 0.008, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = lg(ctx, 0, ct, 0, ct + h * 0.035, [[0, '#5a341c'], [1, '#2e180c']]); ctx.fillRect(w * 0.37, ct, w * 0.26, h * 0.035);
    ctx.fillStyle = '#8a5a30'; ctx.fillRect(w * 0.365, ct - 3 * s, w * 0.27, 4 * s); ctx.fillStyle = '#f4efe2'; ctx.fillRect(w * 0.41, ct - 5 * s, w * 0.06, 2.4 * s); ctx.fillRect(w * 0.53, ct - 5.6 * s, w * 0.05, 3 * s);
    /* ---------- press cameras on tripods at the sides ---------- */
    L.cams.forEach(function (cx3, k) { var by = h * 0.74, sd = k ? -1 : 1;
      ctx.strokeStyle = '#1a1a24'; ctx.lineWidth = 1.6 * s; ctx.beginPath(); ctx.moveTo(cx3, by - h * 0.06); ctx.lineTo(cx3 - 9 * s, by); ctx.moveTo(cx3, by - h * 0.06); ctx.lineTo(cx3 + 9 * s, by); ctx.moveTo(cx3, by - h * 0.06); ctx.lineTo(cx3 + sd * 3 * s, by + 2 * s); ctx.stroke();
      ctx.fillStyle = '#2a2a36'; ctx.beginPath(); D.rrect(ctx, cx3 - 10 * s, by - h * 0.06 - 12 * s, 20 * s, 12 * s, 2 * s); ctx.fill();
      ctx.fillStyle = '#14141c'; ctx.beginPath(); D.rrect(ctx, cx3 + sd * 8 * s - (sd < 0 ? 8 * s : 0), by - h * 0.06 - 10 * s, 8 * s, 8 * s, 2 * s); ctx.fill();
      ctx.fillStyle = '#3a4a8a'; ctx.beginPath(); ctx.arc(cx3 + sd * 12 * s, by - h * 0.06 - 6 * s, 2.4 * s, 0, TAU); ctx.fill(); });
    /* ---------- the witness table in front ---------- */
    var tY = L.tab, tx0 = w * 0.06, tx1 = w * 0.94;
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(tx0, tY - h * 0.01, tx1 - tx0, h * 0.02);
    ctx.fillStyle = lg(ctx, 0, tY - h * 0.012, 0, tY + h * 0.012, [[0, '#9a6a3e'], [1, '#6a4422']]); ctx.beginPath(); D.rrect(ctx, tx0, tY - h * 0.012, tx1 - tx0, h * 0.018, 3 * s); ctx.fill();
    ctx.fillStyle = 'rgba(255,240,210,0.35)'; ctx.fillRect(tx0 + 6 * s, tY - h * 0.011, tx1 - tx0 - 12 * s, 1.4 * s);
    // the skirt: navy cloth with soft folds
    ctx.fillStyle = lg(ctx, 0, tY, 0, h, [[0, '#24306a'], [1, '#141c44']]); ctx.fillRect(tx0, tY + h * 0.006, tx1 - tx0, h - tY);
    for (i = 0; i < 22; i++) { x = tx0 + (tx1 - tx0) * (i + 0.5) / 22; ctx.fillStyle = lg(ctx, x - 6 * s, 0, x + 6 * s, 0, [[0, 'rgba(0,0,0,0)'], [0.5, i % 2 ? 'rgba(120,140,220,0.18)' : 'rgba(0,0,0,0.25)'], [1, 'rgba(0,0,0,0)']]); ctx.fillRect(x - 7 * s, tY + h * 0.006, 14 * s, h - tY); }
    ctx.fillStyle = '#c8a04a'; ctx.fillRect(tx0, tY + h * 0.006, tx1 - tx0, 1.6 * s);
    // two witness microphones, low and to the sides so props have room
    [0.2, 0.8].forEach(function (f) { x = w * f; ctx.fillStyle = '#1e1e28'; ctx.beginPath(); ctx.ellipse(x, tY - h * 0.006, 9 * s, 2.6 * s, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#2a2a34'; ctx.lineWidth = 1.6 * s; ctx.beginPath(); ctx.moveTo(x, tY - h * 0.008); ctx.quadraticCurveTo(x - 2 * s, tY - h * 0.04, x + 6 * s, tY - h * 0.05); ctx.stroke();
      ctx.fillStyle = '#14141c'; ctx.beginPath(); ctx.ellipse(x + 7 * s, tY - h * 0.051, 3.4 * s, 2 * s, 0.3, 0, TAU); ctx.fill(); ctx.fillStyle = '#e04848'; ctx.beginPath(); ctx.arc(x + 1 * s, tY - h * 0.03, 1.2 * s, 0, TAU); ctx.fill(); });
    /* ---------- light: warm pools from the ceiling over the dais ---------- */
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (i = 0; i < 5; i++) { x = w * (0.1 + i * 0.2); D.haze(ctx, x - w * 0.12, L.up - h * 0.06, x + w * 0.12, L.up + h * 0.04, '#ffd8a0', 0.12); }
    D.glow(ctx, w * 0.5, L.ceil, w * 0.8, '#fff0d0', 0.12);
    ctx.restore();
    D.finish(ctx, w, h, '#ffe8c8', 0.1, 0.24, 0.035, '#1a1008', 0.36);
  }
  function overlay(ctx, w, h, t) {
    var D = K(), L = lay(w, h), s = L.s, i;
    // wall screens: a slow scan line and a blinking LIVE dot
    L.scr.forEach(function (q, k) { var y = q[1] + ((t * 8 * s + k * 20 * s) % q[3]); ctx.fillStyle = 'rgba(160,200,255,0.12)'; ctx.fillRect(q[0], y, q[2], 2 * s);
      if (!k) { ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 3); ctx.fillStyle = '#ff4a4a'; ctx.beginPath(); ctx.arc(q[0] + q[2] - 8 * s, q[1] + 8 * s, 2.4 * s, 0, D.TAU); ctx.fill(); ctx.globalAlpha = 1; } });
    // camera tally lights
    L.cams.forEach(function (cx3, k) { var on = Math.sin(t * 2 + k * 2) > 0; ctx.fillStyle = on ? '#ff3a3a' : '#5a1a1a'; ctx.beginPath(); ctx.arc(cx3 - (k ? -6 : 6) * s, h * 0.74 - h * 0.06 - 10 * s, 1.4 * s, 0, D.TAU); ctx.fill(); });
    // microphone "on" rings on the upper dais glow one at a time, as if members take turns
    var who = Math.floor(t / 2.4) % 11, mx = w * (0.06 + who * 0.88 / 10), my = L.up + h * 0.025 * Math.pow((mx - w * 0.5) / (w * 0.5), 2);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; D.glow(ctx, mx + 4 * s, my - 24 * s, 7 * s, '#ff5a4a', 0.6); ctx.restore();
    // dust in the light
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (i = 0; i < 14; i++) { var ph = (t * (0.02 + D.hash(i, 31) * 0.03) + D.hash(i, 32)) % 1, px = w * D.hash(i, 33), py = L.ceil + h * (0.05 + ph * 0.4); ctx.globalAlpha = Math.sin(ph * Math.PI) * 0.4; ctx.fillStyle = '#fff2d0'; ctx.beginPath(); ctx.arc(px, py, (0.6 + D.hash(i, 34)) * s, 0, D.TAU); ctx.fill(); }
    ctx.restore();
  }
  PAINT.dc_hearing = {
    focus: { x: 0.5, y: 0.2 }, track: 'work',
    anchors: { table: { y: 0.885, x0: 0.06, x1: 0.94 }, seal: { x: 0.5, y: 0.2 }, dais: { up: 0.335, low: 0.47 } },
    paint: function (ctx, w, h) { try { paintRoom(ctx, w, h); } catch (e) { PAINT._err = 'dc_hearing: ' + String(e && e.stack || e); } },
    overlay: function (ctx, w, h, t) { try { overlay(ctx, w, h, t); } catch (e) { PAINT._err = 'dc_hearing overlay: ' + String(e && e.stack || e); } }
  };
})();
