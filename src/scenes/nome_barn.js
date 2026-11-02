/* scenes/nome_barn.js - Warming Barn 2 on the Kigluaik Mammoth Reserve, Nome: inside a long arched barn.
   Wooden arch ribs recede to a big sliding door at the far end, open on the bright tundra and the Kigluaik Mountains.
   Radiant heater panels glow on the left wall; the feeder rail with its white hoppers runs along the right wall; the
   floor is deep straw. Uses the painting utilities that src/scenes/nome_reserve.js shares as PAINT._nomeU. */
(function () {
  'use strict';
  var PAINT = (window.PAINT = window.PAINT || {});
  function U() { return PAINT._nomeU; }
  var barnL = function (w, h) {
    var u = U(), s = u.S(w, h), L = { s: s, vx: w * 0.5, vy: h * 0.44, fy: h * 0.6 };
    // the far door: a rectangle around the vanishing point
    L.door = { x0: w * 0.36, x1: w * 0.64, y0: h * 0.33, y1: h * 0.52 };
    // arch ribs from near (k=0) to far (k=1): centre, half-width, crown height, floor y
    // a cubic arch with both control points at height cy peaks at fy + 0.75 (cy - fy), so cy is set from the wanted peak
    L.ribs = []; for (var i = 0; i < 9; i++) { var k = Math.pow(i / 8, 0.62), hw = u.lerp(w * 0.8, (L.door.x1 - L.door.x0) * 0.62, k), fy = u.lerp(h * 1.02, L.door.y1, k), pk = u.lerp(-h * 0.06, L.door.y0 - h * 0.03, k), cy = fy + (pk - fy) / 0.75; L.ribs.push([hw, cy, fy, k, pk]); }
    return L;
  };
  var bLM = null;
  PAINT.nome_barn = { focus: { x: 0.5, y: 0.42 }, track: 'work', anchors: { door: { x: 0.5, y: 0.42 }, floor: { y: 0.6 } },
    paint: function (ctx, w, h) {
      try {
        var u = U(); if (!bLM) bLM = u.memo(barnL); var L = bLM(w, h), s = L.s, r = u.rng(6161), i, k, D = L.door, lerp = u.lerp, mix = u.mix, rgba = u.rgba, lg = u.lg, rg = u.rg, TAU = u.TAU;
        // walls and arched ceiling: warm wood in shadow
        ctx.fillStyle = lg(ctx, 0, 0, 0, h, [[0, '#3a2418'], [0.45, '#5a3a24'], [1, '#2a1a12']]); ctx.fillRect(0, 0, w, h);
        // ceiling planks between ribs, lit from the door
        for (i = 0; i < L.ribs.length - 1; i++) {
          var A = L.ribs[i], B = L.ribs[i + 1], lit = 0.25 + B[3] * 0.6;
          ctx.fillStyle = mix('#4a2e1c', '#c8925a', lit * 0.7); ctx.beginPath();
          ctx.moveTo(L.vx - A[0], A[2]); ctx.bezierCurveTo(L.vx - A[0], A[1], L.vx + A[0], A[1], L.vx + A[0], A[2]);
          ctx.lineTo(L.vx + B[0], B[2]); ctx.bezierCurveTo(L.vx + B[0], B[1], L.vx - B[0], B[1], L.vx - B[0], B[2]); ctx.closePath(); ctx.fill();
          // plank seams follow the arch
          ctx.strokeStyle = rgba('#2a160c', 0.35); ctx.lineWidth = 0.8 * s; ctx.beginPath();
          for (k = 1; k < 6; k++) { var t = k / 6, cx = lerp(A[0], B[0], t), cy = lerp(A[1], B[1], t), fy = lerp(A[2], B[2], t); ctx.moveTo(L.vx - cx, fy); ctx.bezierCurveTo(L.vx - cx, cy, L.vx + cx, cy, L.vx + cx, fy); }
          ctx.stroke();
        }
        // skylights along the crown (sunlight through the solar roof gaps)
        for (i = 0; i < L.ribs.length - 1; i += 2) { var R = L.ribs[i], R2 = L.ribs[i + 1], y1 = R[4] - 6 * s, y2 = R2[4] - 4 * s;
          ctx.fillStyle = 'rgba(220,240,255,0.55)'; ctx.beginPath(); ctx.moveTo(L.vx - R[0] * 0.18, y1 + 6 * s); ctx.lineTo(L.vx + R[0] * 0.18, y1 + 6 * s); ctx.lineTo(L.vx + R2[0] * 0.18, y2 + 4 * s); ctx.lineTo(L.vx - R2[0] * 0.18, y2 + 4 * s); ctx.fill(); }
        // the far doorway: bright tundra, snowy peaks and sky
        ctx.save(); ctx.beginPath(); ctx.rect(D.x0, D.y0, D.x1 - D.x0, D.y1 - D.y0); ctx.clip();
        ctx.fillStyle = lg(ctx, 0, D.y0, 0, D.y1, [[0, '#9cc4ee'], [0.55, '#dbe9f6'], [0.62, '#b8c2dc'], [0.7, '#c49a52'], [1, '#b06a2c']]); ctx.fillRect(D.x0, D.y0, D.x1 - D.x0, D.y1 - D.y0);
        var my = D.y0 + (D.y1 - D.y0) * 0.6; ctx.fillStyle = '#8a98c0'; ctx.beginPath(); ctx.moveTo(D.x0, my);
        for (k = 0; k <= 12; k++) { var px = lerp(D.x0, D.x1, k / 12); ctx.lineTo(px, my - (D.y1 - D.y0) * (0.05 + 0.12 * Math.abs(Math.sin(k * 1.7 + 1)) * (k % 3 ? 0.6 : 1))); } ctx.lineTo(D.x1, my); ctx.fill();
        ctx.fillStyle = '#f4f7ff'; ctx.beginPath(); for (k = 0; k <= 12; k += 3) { var qx = lerp(D.x0, D.x1, k / 12), qy = my - (D.y1 - D.y0) * 0.17; ctx.moveTo(qx - 4 * s, qy + 4 * s); ctx.lineTo(qx, qy); ctx.lineTo(qx + 4 * s, qy + 4 * s); } ctx.fill();
        u.dabs(ctx, 160, [['#c0602e', 0.6], ['#d8a646', 0.5], ['#7a8a3e', 0.5]], function () { return [lerp(D.x0, D.x1, r()), lerp(my + 2 * s, D.y1, r()), (2 + r() * 5) * s, (0.6 + r()) * s, (r() * 3) | 0, 0]; });
        ctx.restore();
        u.glow(ctx, L.vx, (D.y0 + D.y1) / 2, w * 0.5, '#fff1d0', 0.35);
        // door frame and the big sliding door pushed aside
        ctx.fillStyle = '#2a1a12'; ctx.fillRect(D.x0 - 4 * s, D.y0 - 4 * s, D.x1 - D.x0 + 8 * s, 4 * s); ctx.fillRect(D.x0 - 4 * s, D.y0, 4 * s, D.y1 - D.y0); ctx.fillRect(D.x1, D.y0, 4 * s, D.y1 - D.y0);
        ctx.fillStyle = '#7a3a24'; ctx.fillRect(D.x1 + 4 * s, D.y0 + 2 * s, (D.x1 - D.x0) * 0.45, D.y1 - D.y0 - 2 * s);
        ctx.strokeStyle = 'rgba(255,220,180,0.35)'; ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.moveTo(D.x1 + 4 * s, D.y0 + 2 * s); ctx.lineTo(D.x1 + 4 * s + (D.x1 - D.x0) * 0.45, D.y1); ctx.moveTo(D.x1 + 4 * s + (D.x1 - D.x0) * 0.45, D.y0 + 2 * s); ctx.lineTo(D.x1 + 4 * s, D.y1); ctx.stroke();
        // arch ribs: heavy glulam beams, lit on the door side
        for (i = 0; i < L.ribs.length; i++) { var Rb = L.ribs[i], th = lerp(16, 3, Rb[3]) * s;
          ctx.strokeStyle = '#2a1810'; ctx.lineWidth = th; ctx.beginPath(); ctx.moveTo(L.vx - Rb[0], Rb[2]); ctx.bezierCurveTo(L.vx - Rb[0], Rb[1], L.vx + Rb[0], Rb[1], L.vx + Rb[0], Rb[2]); ctx.stroke();
          ctx.strokeStyle = 'rgba(255,200,140,0.45)'; ctx.lineWidth = th * 0.3; ctx.beginPath(); ctx.moveTo(L.vx - Rb[0] + th * 0.3, Rb[2]); ctx.bezierCurveTo(L.vx - Rb[0] + th * 0.3, Rb[1] + th * 0.5, L.vx + Rb[0] - th * 0.3, Rb[1] + th * 0.5, L.vx + Rb[0] - th * 0.3, Rb[2]); ctx.stroke(); }
        // left wall: radiant heater panels glowing between the ribs
        for (i = 1; i < L.ribs.length - 2; i++) { var a = L.ribs[i], b = L.ribs[i + 1], ax = L.vx - a[0] + 4 * s, bx = L.vx - b[0] + 3 * s, ay = lerp(a[2], a[1], 0.42), by = lerp(b[2], b[1], 0.42), ah = (a[2] - a[1]) * 0.12, bh = (b[2] - b[1]) * 0.12;
          ctx.fillStyle = '#3a2a2a'; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo(bx, by + bh); ctx.lineTo(ax, ay + ah); ctx.fill();
          ctx.fillStyle = 'rgba(255,120,60,0.9)'; ctx.beginPath(); ctx.moveTo(ax + 2 * s, ay + ah * 0.2); ctx.lineTo(bx - 1 * s, by + bh * 0.2); ctx.lineTo(bx - 1 * s, by + bh * 0.8); ctx.lineTo(ax + 2 * s, ay + ah * 0.8); ctx.fill();
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; u.glow(ctx, (ax + bx) / 2, (ay + by) / 2 + ah * 0.5, (a[0] - b[0]) * 1.4 + 20 * s, '#ff7a3a', 0.3); ctx.restore(); }
        // right wall: automated feeders standing on the straw, white hoppers with a teal stripe and a screen
        for (i = 1; i < L.ribs.length - 2; i++) { var c = L.ribs[i], d = L.ribs[i + 1], hx = (L.vx + c[0] * 0.86 + L.vx + d[0] * 0.86) / 2, hy = (c[2] + d[2]) / 2 - (c[2] - d[2]) * 0.1, hs = u.lerp(1.3, 0.35, c[3]) * s;
          ctx.fillStyle = 'rgba(40,20,10,0.35)'; ctx.beginPath(); ctx.ellipse(hx, hy, 14 * hs, 3 * hs, 0, 0, TAU); ctx.fill();
          ctx.fillStyle = '#8a96b4'; ctx.fillRect(hx - 9 * hs, hy - 10 * hs, 2.2 * hs, 10 * hs); ctx.fillRect(hx + 7 * hs, hy - 10 * hs, 2.2 * hs, 10 * hs);
          ctx.fillStyle = '#c9a26b'; ctx.fillRect(hx - 13 * hs, hy - 12 * hs, 26 * hs, 4 * hs);
          ctx.fillStyle = '#f4f6fb'; ctx.beginPath(); ctx.moveTo(hx - 11 * hs, hy - 44 * hs); ctx.lineTo(hx + 11 * hs, hy - 44 * hs); ctx.lineTo(hx + 8 * hs, hy - 14 * hs); ctx.lineTo(hx - 8 * hs, hy - 14 * hs); ctx.fill();
          ctx.fillStyle = 'rgba(60,70,110,0.25)'; ctx.beginPath(); ctx.moveTo(hx + 4 * hs, hy - 44 * hs); ctx.lineTo(hx + 11 * hs, hy - 44 * hs); ctx.lineTo(hx + 8 * hs, hy - 14 * hs); ctx.lineTo(hx + 3 * hs, hy - 14 * hs); ctx.fill();
          ctx.fillStyle = '#2f9aa2'; ctx.fillRect(hx - 10.6 * hs, hy - 38 * hs, 21.2 * hs, 3.4 * hs); ctx.fillStyle = '#2a3060'; ctx.fillRect(hx - 4 * hs, hy - 30 * hs, 8 * hs, 6 * hs);
          ctx.fillStyle = '#7ff7e4'; ctx.fillRect(hx - 2 * hs, hy - 28.4 * hs, 4 * hs, 2.4 * hs); }
        // floor: deep golden straw, with light pooling from the door
        ctx.save(); ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(0, L.ribs[0][2] - h * 0.02); ctx.lineTo(L.vx - L.ribs[8][0], D.y1); ctx.lineTo(L.vx + L.ribs[8][0], D.y1); ctx.lineTo(w, L.ribs[0][2] - h * 0.02); ctx.lineTo(w, h); ctx.closePath(); ctx.clip();
        ctx.fillStyle = lg(ctx, 0, D.y1, 0, h, [[0, '#d8b46a'], [0.3, '#b8873e'], [1, '#6a4a22']]); ctx.fillRect(0, D.y1, w, h - D.y1);
        u.batch(ctx, 5200, [['#f4d68a', 0.8 * s, 0.6], ['#c89a48', 0.9 * s, 0.6], ['#8a6024', 0.9 * s, 0.5], ['#fff0c0', 0.6 * s, 0.5]], function () {
          var p = Math.pow(r(), 0.85), y = lerp(D.y1, h, p), x = L.vx + (r() - 0.5) * lerp(D.x1 - D.x0, w * 1.6, p), l = (2 + r() * 8) * s * (0.4 + p * 1.6), a2 = r() * u.PI; return [x, y, x + Math.cos(a2) * l, y + Math.sin(a2) * l * 0.4, (r() * 4) | 0]; });
        ctx.restore();
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, L.vx, D.y1 + h * 0.05, 0, w * 0.6, [[0, 'rgba(255,230,170,0.35)'], [1, 'rgba(255,230,170,0)']]); ctx.fillRect(0, 0, w, h); ctx.restore();
        // light shafts from the doorway and skylights
        u.shafts(ctx, L.vx, (D.y0 + D.y1) / 2, w, h, '#fff0c8', 0.06, 6, r, 1.2, u.PI / 2, 0.03, 0.08);
        // hay bales stacked at the left front, a bucket and a keeper's thermos on the right
        function bale(x, y, bw, bh) { ctx.fillStyle = '#c8a050'; ctx.fillRect(x, y - bh, bw, bh); ctx.fillStyle = '#e8c878'; ctx.fillRect(x, y - bh, bw, bh * 0.25); ctx.fillStyle = 'rgba(90,60,20,0.35)'; ctx.fillRect(x + bw * 0.8, y - bh, bw * 0.2, bh);
          ctx.strokeStyle = '#7a3a24'; ctx.lineWidth = 1.4 * s; ctx.beginPath(); ctx.moveTo(x + bw * 0.3, y - bh); ctx.lineTo(x + bw * 0.3, y); ctx.moveTo(x + bw * 0.65, y - bh); ctx.lineTo(x + bw * 0.65, y); ctx.stroke();
          u.batch(ctx, 90, [['#a87a30', 0.7 * s, 0.6], ['#f4dc90', 0.6 * s, 0.5]], function () { var xx = x + r() * bw, yy = y - r() * bh; return [xx, yy, xx + (r() - 0.5) * 6 * s, yy + (r() - 0.5) * 2 * s, r() < 0.6 ? 0 : 1]; }); }
        var by0 = h * 0.9, bw0 = 84 * s, bh0 = 40 * s; bale(-16 * s, by0, bw0, bh0); bale(bw0 - 22 * s, by0 + 8 * s, bw0, bh0); bale(4 * s, by0 - bh0, bw0 * 0.9, bh0);
        ctx.fillStyle = '#2f6a72'; ctx.beginPath(); ctx.moveTo(w - 46 * s, h * 0.86); ctx.lineTo(w - 22 * s, h * 0.86); ctx.lineTo(w - 25 * s, h * 0.86 - 26 * s); ctx.lineTo(w - 43 * s, h * 0.86 - 26 * s); ctx.fill();
        ctx.fillStyle = '#1f4a52'; ctx.fillRect(w - 44 * s, h * 0.86 - 28 * s, 20 * s, 4 * s);
        u.finish(ctx, w, h, '#ffb070', 0.12, 0.42, 0.04, '#140a06', 0.42);
      } catch (e) { PAINT._err = 'nome_barn: ' + String(e && e.stack || e); }
    },
    overlay: function (ctx, w, h, t) {
      try {
        var u = U(); if (!bLM) bLM = u.memo(barnL); var L = bLM(w, h), s = L.s, i, D = L.door, sp = u.glowSpr('#fff0c8');
        ctx.save();
        // dust motes drifting in the door light
        if (sp) for (i = 0; i < 26; i++) { var px = L.vx + Math.sin(t * 0.13 + i * 2.1) * w * 0.3 * u.hash(i, 3), py = h * (0.3 + 0.4 * u.hash(i, 5)) + Math.sin(t * 0.3 + i) * 10 * s, a = 0.3 + 0.4 * Math.sin(t * 0.8 + i * 1.3); if (a < 0.05) continue; ctx.globalAlpha = a; var z = (1 + u.hash(i, 7) * 2) * s; ctx.drawImage(sp, px - z, py - z, z * 2, z * 2); }
        // heater panels breathe
        var hp = u.glowSpr('#ff7a3a'); if (hp) for (i = 1; i < L.ribs.length - 2; i++) { var a2 = L.ribs[i], b2 = L.ribs[i + 1], gx = (L.vx - a2[0] + L.vx - b2[0]) / 2, gy = u.lerp(a2[2], a2[1], 0.42) + (a2[2] - a2[1]) * 0.06; ctx.globalAlpha = 0.25 + 0.15 * Math.sin(t * 0.9 + i); var z2 = (a2[0] - b2[0]) * 0.8 + 10 * s; ctx.drawImage(hp, gx - z2, gy - z2, z2 * 2, z2 * 2); }
        ctx.restore();
      } catch (e) { PAINT._err = 'nome_barn overlay: ' + String(e && e.stack || e); }
    }
  };
})();
