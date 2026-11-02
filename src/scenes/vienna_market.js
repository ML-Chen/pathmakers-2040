/* vienna_market.js - the Naschmarkt in Vienna on a summer morning: PAINT.vienna_market (uses window.VIENNA_KIT).
   We stand in the market lane looking north-east toward Karlsplatz. Two rows of stalls line the lane, with awnings,
   crates of apricots, peppers and figs, and cones of spice. Above the left row rise Otto Wagner's Majolika House
   (pink tiles with a painted vine of red roses) and the Medallion House next door (white, with gold medallions and
   gold palm fronds); ordinary 1890s apartment houses stand in shade on the right. At the far end the golden laurel
   dome of the Secession gleams. Receding walls are drawn by mapping flat painted textures in thin vertical strips
   (true perspective). The lower third is the calm lane for subtitles and props. Stall signs are generic German
   words (no brands); "KAYA" is Emine Kaya's fictional stall. */
(function () {
  'use strict';
  var PAINT = (window.PAINT = window.PAINT || {});
  var K = window.VIENNA_KIT; if (!K) return;
  var PI = K.PI, TAU = K.TAU, rng = K.rng, hash = K.hash, clamp = K.clamp, lerp = K.lerp, mix = K.mix, rgba = K.rgba, lg = K.lg, rg = K.rg,
    S = K.S, memo = K.memo, poly = K.poly, rrect = K.rrect, glow = K.glow, softGlow = K.softGlow, wisp = K.wisp, haze = K.haze, band = K.band,
    finish = K.finish, batch = K.batch, dots = K.dots, rects = K.rects, glowSpr = K.glowSpr, cloudForm = K.cloudForm, skyStrokes = K.skyStrokes,
    clump = K.clump, lens = K.lens, mk = K.mk, drawBird = K.drawBird, mark = K.mark, qcirc = K.qcirc;

  var mkL = memo(function (w, h) {
    var s = S(w, h);
    // projection: lateral X and height Y (eye level 0, ground +0.3) at depth g (0 near, 1 = vanishing point)
    return { s: s, vx: w * 0.5, vy: h * 0.4, ground: 0.25,
      P: function (X, Y, g) { return [w * 0.5 + X * (1 - g) * w, h * 0.4 + Y * (1 - g) * h]; } };
  });
  function gz(z) { return 1 - 1 / z; } // world depth z (>=1 in front of us... ) to g
  function zg(g) { return 1 / (1 - g); }

  /* Map a flat texture onto a vertical wall at lateral X, between heights Ytop..Ybot, from depth zA to zB, in strips. */
  function wallMap(ctx, L, tex, X, Ytop, Ybot, zA, zB, w, shade) {
    var gA = gz(zA), gB = gz(zB), xa = L.P(X, 0, gA)[0], xb = L.P(X, 0, gB)[0], n = Math.max(20, Math.ceil(Math.abs(xb - xa) / 1.5)), i;
    for (i = 0; i < n; i++) {
      var x0 = lerp(xa, xb, i / n), x1 = lerp(xa, xb, (i + 1) / n);
      var g0 = 1 - (x0 - L.vx) / (X * w), g1 = 1 - (x1 - L.vx) / (X * w);
      var z0 = zg(g0), z1 = zg(g1), u0 = (z0 - zA) / (zB - zA), u1 = (z1 - zA) / (zB - zA), gm = (g0 + g1) / 2;
      var yt = L.vy + Ytop * (1 - gm) * L.H, yb = L.vy + Ybot * (1 - gm) * L.H;
      var sx = clamp(u0, 0, 1) * tex.width, sw = Math.max(1, Math.abs(u1 - u0) * tex.width);
      if (sx + sw > tex.width) sw = tex.width - sx; if (sw <= 0) continue;
      ctx.drawImage(tex, sx, 0, sw, tex.height, Math.min(x0, x1), yt, Math.abs(x1 - x0) + 0.6, yb - yt);
    }
    if (shade) { // darken with distance and side: a gradient over the quad
      var A = L.P(X, Ytop, gA), B = L.P(X, Ytop, gB), C = L.P(X, Ybot, gB), D = L.P(X, Ybot, gA);
      poly(ctx, [A, B, C, D]); ctx.fillStyle = lg(ctx, A[0], 0, B[0], 0, shade); ctx.fill();
    }
  }
  function quad(ctx, L, a, b, c, d, fill) { poly(ctx, [L.P(a[0], a[1], a[2]), L.P(b[0], b[1], b[2]), L.P(c[0], c[1], c[2]), L.P(d[0], d[1], d[2])]); ctx.fillStyle = fill; ctx.fill(); }

  /* ---------- textures ---------- */
  function windowAt(g, x, y, ww, wh, lit, r) {
    g.fillStyle = '#f8f4ec'; g.fillRect(x - 1.5, y - 1.5, ww + 3, wh + 3);
    g.fillStyle = lg(g, 0, y, 0, y + wh, [[0, '#7e9ab4'], [0.5, '#4a5e78'], [1, '#2e3a50']]); g.fillRect(x, y, ww, wh);
    g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(x + 1, y + 1, ww * 0.35, wh * 0.45);
    g.strokeStyle = '#f8f4ec'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x + ww / 2, y); g.lineTo(x + ww / 2, y + wh); g.moveTo(x, y + wh * 0.32); g.lineTo(x + ww, y + wh * 0.32); g.stroke();
  }
  function railing(g, x, y, ww, col) {
    g.strokeStyle = col; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x - 3, y); g.lineTo(x + ww + 3, y); g.moveTo(x - 3, y + 9); g.lineTo(x + ww + 3, y + 9); g.stroke();
    g.lineWidth = 1; g.beginPath(); for (var k = 0; k <= ww + 6; k += 4) { g.moveTo(x - 3 + k, y); g.quadraticCurveTo(x - 1 + k, y + 4.5, x - 3 + k, y + 9); } g.stroke();
    g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(x - 4, y + 10, ww + 8, 2.4);
  }
  // Left wall: the Majolika House, the Medallion House, then two ordinary houses (a 1600 x 360 texture)
  var texLeft = null, texRight = null, texStallL = null, texStallR = null;
  function makeLeft() {
    var W = 1600, H = 360, c = mk(W, H); if (!c) return null; var g = c.getContext('2d'), r = rng(70411), i, j, x, y;
    var floors = 6, fh = (H - 40) / floors, top = 40;
    // --- Majolika House: 0..520
    var mx0 = 0, mx1 = 520;
    g.fillStyle = '#f1dcd2'; g.fillRect(mx0, top, mx1 - mx0, H - top);
    g.strokeStyle = 'rgba(190,150,140,0.35)'; g.lineWidth = 0.6; g.beginPath(); for (x = mx0; x < mx1; x += 9) { g.moveTo(x, top); g.lineTo(x, H); } for (y = top; y < H; y += 9) { g.moveTo(mx0, y); g.lineTo(mx1, y); } g.stroke();
    // the painted vine: green stems rising between the windows, spreading into a canopy of roses under the cornice
    var cols = 7, cw = (mx1 - mx0) / cols;
    g.strokeStyle = '#4f7f4a'; g.lineCap = 'round';
    for (i = 0; i <= cols; i++) { var sx = mx0 + i * cw; g.lineWidth = 3.2; g.beginPath(); g.moveTo(sx, H - fh * 1.1); g.bezierCurveTo(sx - 8, H - fh * 2.4, sx + 10, top + fh * 2.2, sx + (r() - 0.5) * 20, top + fh * 0.7); g.stroke();
      for (j = 0; j < 5; j++) { var by = lerp(H - fh * 1.4, top + fh * 1.2, j / 5), bd = (j % 2 ? 1 : -1); g.lineWidth = 1.6; g.beginPath(); g.moveTo(sx, by); g.quadraticCurveTo(sx + bd * 14, by - 10, sx + bd * 24, by - 4); g.stroke(); } }
    // leaves
    var LC = ['#3e7a44', '#5a9a52', '#7ab866', '#2f5e36'];
    for (j = 0; j < 4; j++) { g.fillStyle = LC[j]; g.beginPath(); for (i = 0; i < 260; i++) { var lx = mx0 + r() * (mx1 - mx0), ly = top + Math.pow(r(), 1.6) * (H - top - fh * 1.2); lens(g, lx, ly, 6 + r() * 6, 2.2 + r(), r() * TAU); } g.fill(); }
    // roses: big red and pink blossoms, densest under the cornice
    for (i = 0; i < 110; i++) { var rx = mx0 + 10 + r() * (mx1 - mx0 - 20), ry = top + 6 + Math.pow(r(), 1.5) * (H - top) * 0.72, rr = 4 + r() * 6 * (1 - (ry - top) / H);
      g.fillStyle = r() < 0.6 ? '#c8384a' : '#e86a7e'; g.beginPath(); g.arc(rx, ry, rr, 0, TAU); g.fill();
      g.fillStyle = 'rgba(255,220,220,0.55)'; g.beginPath(); g.arc(rx - rr * 0.3, ry - rr * 0.3, rr * 0.45, 0, TAU); g.fill();
      g.strokeStyle = 'rgba(120,20,40,0.5)'; g.lineWidth = 0.8; g.beginPath(); g.arc(rx, ry, rr * 0.55, 0.3, 4.2); g.stroke(); }
    // windows and green iron balconies
    for (j = 1; j < floors; j++) for (i = 0; i < cols; i++) { var wx = mx0 + i * cw + cw * 0.28, wy = top + j * fh - fh + fh * 0.22; if (j === floors - 1) continue;
      windowAt(g, wx, wy + fh * 0.0, cw * 0.44, fh * 0.6, false, r); if (j === 2 || j === 4) railing(g, wx, wy + fh * 0.48, cw * 0.44, '#2e6a4a'); }
    // cornice with lion-head consoles, roof
    g.fillStyle = '#2f5e46'; g.fillRect(mx0 - 4, top - 10, mx1 - mx0 + 8, 12); g.fillStyle = '#e8d8b0'; for (x = mx0 + 6; x < mx1; x += 22) { g.beginPath(); g.arc(x, top + 4, 3.4, 0, TAU); g.fill(); }
    g.fillStyle = '#7a6a68'; g.fillRect(mx0, 0, mx1 - mx0, top - 10); g.fillStyle = '#8a7a74'; for (x = mx0 + 30; x < mx1; x += 90) g.fillRect(x, 8, 26, top - 18);
    // ground floor shops
    g.fillStyle = '#5a4a44'; g.fillRect(mx0, H - fh * 0.95, mx1 - mx0, fh * 0.95);
    for (i = 0; i < 5; i++) { g.fillStyle = '#2a3446'; g.fillRect(mx0 + 14 + i * 102, H - fh * 0.82, 80, fh * 0.82); g.fillStyle = ['#c84a3a', '#3a6a9a', '#e8b84a', '#4a8a5a', '#8a5aa8'][i]; g.fillRect(mx0 + 10 + i * 102, H - fh * 0.95, 88, 9); }
    // --- Medallion House: 520..900
    var dx0 = 520, dx1 = 900;
    g.fillStyle = '#f6f0e2'; g.fillRect(dx0, top, dx1 - dx0, H - top);
    var dcols = 5, dcw = (dx1 - dx0) / dcols;
    for (j = 1; j < floors; j++) for (i = 0; i < dcols; i++) { var ex = dx0 + i * dcw + dcw * 0.3, ey = top + (j - 1) * fh + fh * 0.22; windowAt(g, ex, ey, dcw * 0.4, fh * 0.6, false, r); if (j === 3) railing(g, ex, ey + fh * 0.48, dcw * 0.4, '#2e6a4a'); }
    // gold: medallions under the cornice and palm fronds falling between the windows
    for (i = 0; i < dcols; i++) { var mxp = dx0 + i * dcw + dcw * 0.5, myp = top + fh * 0.12; g.fillStyle = '#d8a83a'; g.beginPath(); g.arc(mxp, myp + 6, 12, 0, TAU); g.fill(); g.fillStyle = '#f6d878'; g.beginPath(); g.arc(mxp - 2, myp + 4, 7, 0, TAU); g.fill(); g.fillStyle = '#b8862a'; g.beginPath(); g.ellipse(mxp + 1, myp + 7, 4, 5, 0, 0, TAU); g.fill(); }
    g.strokeStyle = '#d8a83a'; g.lineWidth = 2;
    for (i = 0; i <= dcols; i++) { var fx = dx0 + i * dcw; g.beginPath(); g.moveTo(fx, top + 18); g.quadraticCurveTo(fx + 6, top + fh * 1.2, fx, top + fh * 2.2); g.stroke(); for (j = 0; j < 8; j++) { var fy = top + 24 + j * fh * 0.25; g.beginPath(); g.moveTo(fx + 2, fy); g.quadraticCurveTo(fx + 10, fy + 2, fx + 14, fy + 8); g.moveTo(fx - 2, fy); g.quadraticCurveTo(fx - 10, fy + 2, fx - 14, fy + 8); g.stroke(); } }
    g.fillStyle = '#e2d6bc'; g.fillRect(dx0 - 2, top - 10, dx1 - dx0 + 4, 11); g.fillStyle = '#6a6070'; g.fillRect(dx0, 0, dx1 - dx0, top - 10);
    g.fillStyle = '#d8a83a'; g.beginPath(); g.arc(dx1 - 14, top - 18, 7, 0, TAU); g.fill(); g.fillRect(dx1 - 16, top - 12, 4, 10);
    g.fillStyle = '#4a4248'; g.fillRect(dx0, H - fh * 0.95, dx1 - dx0, fh * 0.95);
    // --- two ordinary 1890s houses: 900..1600
    [[900, 1240, '#ecd49a', '#c8a868'], [1240, 1600, '#e6e0d2', '#b8b0a0']].forEach(function (Bd, k) {
      g.fillStyle = Bd[2]; g.fillRect(Bd[0], top + 6, Bd[1] - Bd[0], H - top);
      var n = 5, cw2 = (Bd[1] - Bd[0]) / n;
      for (j = 1; j < floors; j++) for (i = 0; i < n; i++) { var qx = Bd[0] + i * cw2 + cw2 * 0.3, qy = top + 6 + (j - 1) * fh + fh * 0.24; windowAt(g, qx, qy, cw2 * 0.4, fh * 0.56, false, r); g.fillStyle = Bd[3]; g.fillRect(qx - 4, qy - 7, cw2 * 0.4 + 8, 4); }
      g.fillStyle = Bd[3]; for (j = 1; j < floors; j++) g.fillRect(Bd[0], top + 6 + j * fh - 3, Bd[1] - Bd[0], 3);
      g.fillStyle = '#8a6a5a'; g.fillRect(Bd[0], 0, Bd[1] - Bd[0], top + 6); g.fillStyle = '#5a4a46'; g.fillRect(Bd[0], H - fh * 0.95, Bd[1] - Bd[0], fh * 0.95);
    });
    return c;
  }
  function makeRight() {
    var W = 1400, H = 360, c = mk(W, H); if (!c) return null; var g = c.getContext('2d'), r = rng(70511), i, j;
    var floors = 6, fh = (H - 40) / floors, top = 40;
    [[0, 330, '#efe0b6', '#cdb27a'], [330, 640, '#e2e8da', '#b4bca8'], [640, 980, '#f0d6c0', '#c8a088'], [980, 1400, '#eae2cc', '#c0b498']].forEach(function (Bd, k) {
      g.fillStyle = Bd[2]; g.fillRect(Bd[0], top - (k % 2) * 10, Bd[1] - Bd[0], H);
      var n = 4 + (k % 2), cw = (Bd[1] - Bd[0]) / n;
      for (j = 1; j < floors; j++) for (i = 0; i < n; i++) { var x = Bd[0] + i * cw + cw * 0.3, y = top + (j - 1) * fh + fh * 0.24; windowAt(g, x, y, cw * 0.4, fh * 0.56, false, r);
        g.fillStyle = Bd[3]; g.beginPath(); g.moveTo(x - 5, y - 4); g.lineTo(x + cw * 0.2, y - 12); g.lineTo(x + cw * 0.4 + 5, y - 4); g.closePath(); g.fill(); if (j === 2 && k % 2 === 0) railing(g, x, y + fh * 0.46, cw * 0.4, '#3a3a40'); }
      g.fillStyle = Bd[3]; g.fillRect(Bd[0], top - (k % 2) * 10 - 6, Bd[1] - Bd[0], 8);
      g.fillStyle = '#9a6a58'; g.fillRect(Bd[0], 0, Bd[1] - Bd[0], top - (k % 2) * 10 - 6); g.fillStyle = '#5a4a44'; g.fillRect(Bd[0], H - fh * 0.95, Bd[1] - Bd[0], fh * 0.95);
      for (i = 0; i < 3; i++) { g.fillStyle = ['#c84a3a', '#3a7a6a', '#e8a84a'][(i + k) % 3]; g.fillRect(Bd[0] + 16 + i * (Bd[1] - Bd[0]) / 3, H - fh * 0.95, (Bd[1] - Bd[0]) / 3 - 30, 9); }
    });
    return c;
  }
  // A row of stall fronts: wooden fronts, signs, shelves of jars, crates of produce and cones of spice
  var SIGNS = [['KAYA', 'GEWÜRZE · TROCKENFRÜCHTE', '#2f6a4a'], ['OBST & GEMÜSE', '', '#3a6a9a'], ['MARILLEN', 'aus der Wachau', '#c8602a'], ['KÄSE', '', '#7a4a2a'], ['OLIVEN', '', '#4a5a2a'], ['BLUMEN', '', '#a83a5a'], ['GEWÜRZE', '', '#8a3a2a'], ['FISCH', '', '#2a5a7a']];
  function makeStalls(seed, order) {
    var n = order.length, SW = 300, W = SW * n, H = 220, c = mk(W, H); if (!c) return null; var g = c.getContext('2d'), r = rng(seed), i, k;
    for (i = 0; i < n; i++) {
      var x0 = i * SW, sg = SIGNS[order[i]], wood = ['#3e7a56', '#e8dcc0', '#2f6a5a', '#b8543a'][i % 4];
      g.fillStyle = wood; g.fillRect(x0 + 6, 0, SW - 12, H);
      g.fillStyle = 'rgba(0,0,0,0.15)'; for (k = 0; k < 12; k++) g.fillRect(x0 + 6 + k * (SW - 12) / 12, 0, 1.2, H);
      // sign band
      g.fillStyle = sg[2]; g.fillRect(x0 + 10, 10, SW - 20, 44); g.strokeStyle = '#f2e6c8'; g.lineWidth = 2; g.strokeRect(x0 + 14, 14, SW - 28, 36);
      g.fillStyle = '#fff6e0'; g.font = '800 ' + (sg[1] ? 20 : 24) + 'px Nunito, sans-serif'; g.textAlign = 'center'; g.fillText(sg[0], x0 + SW / 2, sg[1] ? 33 : 40);
      if (sg[1]) { g.font = '700 11px Nunito, sans-serif'; g.fillText(sg[1], x0 + SW / 2, 47); }
      // dark interior with shelves of jars and hanging garlands of peppers
      g.fillStyle = '#4a3428'; g.fillRect(x0 + 18, 62, SW - 36, 92); g.fillStyle = 'rgba(255,220,160,0.12)'; g.fillRect(x0 + 18, 62, SW - 36, 30);
      // one shelf of glass jars with lids
      g.fillStyle = '#7a5236'; g.fillRect(x0 + 22, 92, SW - 44, 4);
      for (var j = 0; j < 9; j++) { var jx = x0 + 30 + j * (SW - 60) / 9, jw = (SW - 60) / 9 - 8, jc = ['#e8b840', '#c8402a', '#7a3a1a', '#d8682a', '#5a7a2a', '#f2e0b0', '#8a2a4a'][(j + i) % 7];
        g.fillStyle = 'rgba(230,240,245,0.5)'; g.beginPath(); g.moveTo(jx, 92); g.lineTo(jx, 74); g.quadraticCurveTo(jx, 70, jx + 4, 70); g.lineTo(jx + jw - 4, 70); g.quadraticCurveTo(jx + jw, 70, jx + jw, 74); g.lineTo(jx + jw, 92); g.closePath(); g.fill();
        g.fillStyle = jc; g.fillRect(jx + 2, 78, jw - 4, 13); g.fillStyle = '#c8a050'; g.fillRect(jx + 1, 67, jw - 2, 4); g.fillStyle = 'rgba(255,255,255,0.6)'; g.fillRect(jx + 3, 73, 2, 16); }
      // open sacks of spice and dried fruit along the floor of the stall
      for (j = 0; j < 6; j++) { var bx = x0 + 26 + j * (SW - 52) / 6, bw = (SW - 52) / 6 - 6, bc = ['#c8402a', '#e8b030', '#8a4a2a', '#f2e6c0', '#d87a2a', '#6a8a3a'][(j + i * 2) % 6];
        g.fillStyle = '#c8aa78'; g.beginPath(); g.moveTo(bx, 154); g.lineTo(bx + 2, 122); g.quadraticCurveTo(bx + bw / 2, 116, bx + bw - 2, 122); g.lineTo(bx + bw, 154); g.closePath(); g.fill();
        g.strokeStyle = '#9a7a48'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(bx + 4, 130); g.lineTo(bx + bw - 4, 130); g.stroke();
        g.fillStyle = bc; g.beginPath(); g.ellipse(bx + bw / 2, 122, bw / 2 - 2, 6, 0, 0, TAU); g.fill(); g.beginPath(); g.moveTo(bx + 5, 122); g.quadraticCurveTo(bx + bw / 2, 106, bx + bw - 5, 122); g.fill();
        g.fillStyle = 'rgba(255,255,255,0.3)'; g.beginPath(); g.ellipse(bx + bw / 2 - 3, 116, 4, 2, 0, 0, TAU); g.fill(); }
      g.strokeStyle = '#7a4a2a'; g.lineWidth = 1.4; for (k = 0; k < 2; k++) { var gx = x0 + 34 + k * (SW - 68); g.beginPath(); g.moveTo(gx, 62); g.lineTo(gx, 108); g.stroke(); for (j = 0; j < 8; j++) { g.fillStyle = k ? '#f2ecd8' : '#d83a2a'; g.beginPath(); g.ellipse(gx + (j % 2 ? 3.4 : -3.4), 66 + j * 5.4, k ? 4 : 3, k ? 4 : 5.4, j % 2 ? 0.4 : -0.4, 0, TAU); g.fill(); } }
      // counter of crates with produce, front edge
      g.fillStyle = '#9a6a3a'; g.fillRect(x0 + 10, 154, SW - 20, 66);
      for (k = 0; k < 4; k++) { var cx = x0 + 16 + k * (SW - 32) / 4, cwid = (SW - 32) / 4 - 6, produce = [['#f39a2a', '#ffc34a'], ['#d8302a', '#f05a3a'], ['#6a2a5a', '#8a4a7a'], ['#7aa83a', '#a8cc5a'], ['#f2d040', '#ffe880'], ['#c8402a', '#e8783a']][(i * 2 + k) % 6];
        g.fillStyle = '#c89a5a'; g.fillRect(cx, 160, cwid, 54); g.fillStyle = '#a87a3a'; g.fillRect(cx, 186, cwid, 3);
        for (j = 0; j < 22; j++) { var px = cx + 6 + (j % 7) * (cwid - 10) / 6, py = 168 - Math.floor(j / 7) * 7 + (j % 2) * 2; g.fillStyle = produce[j % 2]; g.beginPath(); g.arc(px, py, 6.2, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.arc(px - 2, py - 2, 2, 0, TAU); g.fill(); }
        g.fillStyle = '#fff'; g.fillRect(cx + cwid / 2 - 12, 196, 24, 12); g.fillStyle = '#2a2a2a'; g.font = '800 9px Nunito, sans-serif'; g.fillText('€' + (2 + ((i + k) % 5)) + ',' + ['20', '50', '90', '40', '80'][(i + k) % 5], cx + cwid / 2, 205); }
    }
    return c;
  }

  function paintMarket(ctx, w, h) {
    var L = mkL(w, h), s = L.s, r = rng(70101), i, x; L.H = h;
    if (!texLeft) { texLeft = makeLeft(); texRight = makeRight(); texStallL = makeStalls(70611, [0, 2, 1, 6, 3, 4, 5, 1, 2, 7]); texStallR = makeStalls(70711, [1, 5, 4, 2, 7, 3, 6, 1, 4, 0]); }
    mark('tex', ctx);
    /* ---------- sky ---------- */
    var SKY = [[0, '#4a8fda'], [0.45, '#86bce8'], [0.8, '#c8e2f2'], [1, '#f2ecdc']];
    ctx.fillStyle = lg(ctx, 0, 0, 0, L.vy, SKY); ctx.fillRect(0, 0, w, L.vy + 4);
    skyStrokes(ctx, -20 * s, w + 20 * s, 0, L.vy, SKY, 240, r, s, 0.1, '#ffe8c8', '#4a84cc');
    glow(ctx, w * 0.8, h * 0.02, w * 0.9, '#fff2d0', 0.4);
    cloudForm(ctx, w * 0.55, h * 0.1, w * 0.45, h * 0.045, r, { lit: '#ffffff', mid: '#eef3f8', shade: '#a8bcd6', top: '#ffffff', al: 0.95, lx: 0.6, ly: -0.8, base: 0.6, seam: 0.12 });
    cloudForm(ctx, w * 0.8, h * 0.2, w * 0.3, h * 0.03, r, { lit: '#ffffff', mid: '#eef3f8', shade: '#a8bcd6', top: '#ffffff', al: 0.9, lx: 0.6, ly: -0.8, base: 0.6, seam: 0.12 });
    mark('sky', ctx);
    /* ---------- far end: Karlsplatz, the Secession's golden dome, the Karlskirche ---------- */
    var fe = L.P(0, 0, 0.88);
    ctx.fillStyle = '#d8d2c4'; ctx.fillRect(w * 0.3, L.vy - h * 0.06, w * 0.4, h * 0.08);
    // Karlskirche: green dome on a drum with two columns, behind and to the right
    var kx = w * 0.62, ky = L.vy - h * 0.055;
    ctx.fillStyle = '#e8e0cc'; ctx.fillRect(kx - 14 * s, ky, 28 * s, 16 * s);
    ctx.fillStyle = '#6aa898'; ctx.beginPath(); ctx.ellipse(kx, ky, 12 * s, 13 * s, 0, PI, TAU); ctx.fill(); ctx.fillStyle = '#8ac0b0'; ctx.beginPath(); ctx.ellipse(kx - 4 * s, ky - 5 * s, 3 * s, 6 * s, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#6aa898'; ctx.fillRect(kx - 1 * s, ky - 19 * s, 2 * s, 6 * s);
    ctx.fillStyle = '#e8e0cc'; ctx.fillRect(kx - 26 * s, ky - 4 * s, 4 * s, 22 * s); ctx.fillRect(kx + 22 * s, ky - 4 * s, 4 * s, 22 * s);
    // Secession: white cube with the golden laurel dome (3000 gilded leaves)
    var sx = w * 0.47, sy = L.vy - h * 0.035, sr = 13 * s;
    ctx.fillStyle = '#f4f0e6'; ctx.fillRect(sx - 20 * s, sy, 40 * s, 22 * s); ctx.fillStyle = '#e2dccc'; ctx.fillRect(sx - 20 * s, sy, 6 * s, 22 * s); ctx.fillRect(sx + 14 * s, sy, 6 * s, 22 * s);
    ctx.fillStyle = '#2a2a2a'; ctx.fillRect(sx - 4 * s, sy + 10 * s, 8 * s, 12 * s);
    softGlow(ctx, sx, sy - sr * 0.6, sr * 3, '#ffd870', 0.35);
    ctx.fillStyle = lg(ctx, sx - sr, sy - sr * 2, sx + sr, sy, [[0, '#fff0a0'], [0.4, '#e8b830'], [1, '#a87a1a']]); ctx.beginPath(); ctx.arc(sx, sy - sr * 0.55, sr, PI * 0.97, PI * 2.03); ctx.fill();
    var dr = rng(70151); dots(ctx, 120, [['#fff4b0', 0.9], ['#c8941a', 0.8]], function () { var a = PI + dr() * PI, rr2 = Math.sqrt(dr()) * sr * 0.95; return [sx + Math.cos(a) * rr2, sy - sr * 0.55 + Math.sin(a) * rr2, (0.8 + dr() * 0.8) * s, dr() < 0.5 ? 0 : 1]; });
    ctx.fillStyle = '#f4f0e6'; ctx.fillRect(sx - 15 * s, sy - 3 * s, 30 * s, 3.4 * s);
    haze(ctx, w * 0.25, L.vy - h * 0.08, w * 0.75, L.vy + h * 0.03, '#e8eef2', 0.35);
    mark('far', ctx);
    /* ---------- the two walls of houses ---------- */
    wallMap(ctx, L, texRight, 0.62, -0.9, 0.25, 0.95, 7.5, w, [[0, 'rgba(40,40,80,0.38)'], [1, 'rgba(120,140,170,0.35)']]);
    wallMap(ctx, L, texLeft, -0.62, -0.9, 0.25, 0.95, 7.5, w, [[0, 'rgba(255,220,170,0.08)'], [1, 'rgba(200,215,230,0.4)']]);
    // morning sun on the left facades
    ctx.save(); ctx.globalCompositeOperation = 'soft-light'; poly(ctx, [L.P(-0.62, -0.9, gz(0.95)), L.P(-0.62, -0.9, gz(7.5)), L.P(-0.62, 0.25, gz(7.5)), L.P(-0.62, 0.25, gz(0.95))]); ctx.fillStyle = 'rgba(255,220,160,0.5)'; ctx.fill(); ctx.restore();
    mark('walls', ctx);
    /* ---------- the lane ---------- */
    var gy0 = L.P(0, 0.25, 0)[1];
    ctx.fillStyle = lg(ctx, 0, L.vy, 0, h, [[0, '#c8c2b8'], [0.4, '#b8b0a4'], [1, '#a49a8c']]); poly(ctx, [L.P(-0.62, 0.25, 0.995), L.P(0.62, 0.25, 0.995), [w * 1.6, h], [-w * 0.6, h]]); ctx.fill();
    // paving joints in perspective
    ctx.strokeStyle = 'rgba(90,80,70,0.22)'; ctx.lineWidth = Math.max(0.6, 0.7 * s); ctx.beginPath();
    for (i = -14; i <= 14; i++) { var a = L.P(i * 0.05, 0.25, 0.97), b = L.P(i * 0.05, 0.25, -1.2); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
    for (var zz = 1.05; zz < 12; zz *= 1.14) { var gg = gz(zz) - 0.0, p1 = L.P(-1.5, 0.25, gg), p2 = L.P(1.5, 0.25, gg); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); }
    for (zz = 0.9; zz > 0.45; zz *= 0.9) { var g2 = gz(zz), q1 = L.P(-1.5, 0.25, g2), q2 = L.P(1.5, 0.25, g2); ctx.moveTo(q1[0], q1[1]); ctx.lineTo(q2[0], q2[1]); }
    ctx.stroke();
    // a stone gutter down the middle, puddle sheen
    ctx.fillStyle = 'rgba(120,110,100,0.3)'; poly(ctx, [L.P(-0.012, 0.25, 0.97), L.P(0.012, 0.25, 0.97), L.P(0.012, 0.25, -1.2), L.P(-0.012, 0.25, -1.2)]); ctx.fill();
    dots(ctx, 1500, [['#f4ece0', 0.35], ['#6a6058', 0.3]], function () { var yy = lerp(L.vy + h * 0.02, h, Math.pow(r(), 0.8)); return [r() * w, yy, (0.3 + r() * 0.6) * s * (0.4 + (yy - L.vy) / h * 2.6), r() < 0.5 ? 0 : 1]; });
    mark('lane', ctx);
    /* ---------- stalls: back to front on both sides ---------- */
    function stallSide(side, tex, z0, z1) {
      var X = side * 0.27, n = 10, dz = (z1 - z0) / n, k, tint = side > 0 ? [[0, 'rgba(30,30,70,0.3)'], [1, 'rgba(120,140,170,0.35)']] : [[0, 'rgba(255,230,190,0.04)'], [1, 'rgba(190,205,220,0.38)']];
      // the ground between the stall row and the houses, and the stall backs/roof slabs
      quad(ctx, L, [X, 0.25, gz(z0)], [X, 0.25, gz(z1)], [side * 0.62, 0.25, gz(z1)], [side * 0.62, 0.25, gz(z0)], '#a89e90');
      quad(ctx, L, [X, -0.12, gz(z0)], [X, -0.12, gz(z1)], [side * 0.5, -0.13, gz(z1)], [side * 0.5, -0.13, gz(z0)], side > 0 ? '#3a5248' : '#4a6a58');
      wallMap(ctx, L, tex, X, -0.12, 0.25, z0, z1, w, tint);
      // dark fascia along the roof edge
      quad(ctx, L, [X, -0.135, gz(z0)], [X, -0.135, gz(z1)], [X, -0.12, gz(z1)], [X, -0.12, gz(z0)], side > 0 ? '#2a3a34' : '#2f4a3c');
      // awnings, striped canvas sloping toward the lane
      for (k = n - 1; k >= 0; k--) { var zc = z0 + k * dz + 0.03, zd = zc + dz - 0.08, ac = [['#e8574a', '#fff4dc'], ['#3a8a6a', '#f2ecd8'], ['#f0a83a', '#fff4dc'], ['#4a6ab0', '#eef2f8']][(k + (side > 0 ? 1 : 0)) % 4];
        var st = 6, q;
        for (q = 0; q < st; q++) { var zq0 = lerp(zc, zd, q / st), zq1 = lerp(zc, zd, (q + 1) / st);
          quad(ctx, L, [X, -0.075, gz(zq0)], [X, -0.075, gz(zq1)], [X - side * 0.08, -0.025, gz(zq1)], [X - side * 0.08, -0.025, gz(zq0)], ac[q % 2]); }
        var v0 = L.P(X - side * 0.08, -0.025, gz(zc)), v1 = L.P(X - side * 0.08, -0.025, gz(zd)), vh = 0.02 * (1 - gz((zc + zd) / 2)) * h;
        ctx.fillStyle = ac[0]; ctx.beginPath(); ctx.moveTo(v0[0], v0[1]); var m = 6; for (q = 0; q <= m; q++) { ctx.lineTo(lerp(v0[0], v1[0], q / m), lerp(v0[1], v1[1], q / m) + vh); if (q < m) ctx.lineTo(lerp(v0[0], v1[0], (q + 0.5) / m), lerp(v0[1], v1[1], (q + 0.5) / m) + vh * 0.45); } ctx.lineTo(v1[0], v1[1]); ctx.closePath(); ctx.fill();
        quad(ctx, L, [X, -0.07, gz(zc)], [X, -0.07, gz(zd)], [X, 0.08, gz(zd)], [X, 0.08, gz(zc)], 'rgba(30,20,30,0.16)');
      }
      // display tables in front: sloped crates of apricots, peppers, figs; cones of spice
      for (k = 0; k < n; k++) { var ze = z0 + k * dz + 0.06, zf = ze + dz - 0.14, near = 1 - gz((ze + zf) / 2);
        quad(ctx, L, [X, 0.12, gz(ze)], [X, 0.12, gz(zf)], [X - side * 0.06, 0.15, gz(zf)], [X - side * 0.06, 0.15, gz(ze)], '#c8995a');
        quad(ctx, L, [X - side * 0.06, 0.15, gz(ze)], [X - side * 0.06, 0.15, gz(zf)], [X - side * 0.06, 0.25, gz(zf)], [X - side * 0.06, 0.25, gz(ze)], '#8a5a32');
        quad(ctx, L, [X - side * 0.06, 0.15, gz(ze)], [X - side * 0.06, 0.15, gz(zf)], [X - side * 0.06, 0.165, gz(zf)], [X - side * 0.06, 0.165, gz(ze)], '#6a4024');
        var pr = rng(70800 + k * 13 + (side > 0 ? 500 : 0)), pal = [['#f39a2a', '#ffc04a'], ['#d8302a', '#f2603a'], ['#5a2a4a', '#8a4a72'], ['#7aa83a', '#a8cc5a'], ['#f2d040', '#ffe27a']][(k + (side > 0 ? 2 : 0)) % 5];
        var cnt = Math.round(46 * Math.min(1.8, near) + 8);
        dots(ctx, cnt, [[pal[0], 1], [pal[1], 1]], function () { var t = pr(), u = pr(), zp = lerp(ze, zf, t), P2 = L.P(X - side * (0.008 + u * 0.05), 0.12 + u * 0.03 - 0.005, gz(zp)); return [P2[0], P2[1], Math.max(0.6, 0.0085 * (1 - gz(zp)) * h), pr() < 0.5 ? 0 : 1]; });
        dots(ctx, Math.round(cnt * 0.3), [['#ffffff', 0.45]], function () { var t = pr(), u = pr(), zp = lerp(ze, zf, t), P2 = L.P(X - side * (0.008 + u * 0.05), 0.12 + u * 0.03 - 0.009, gz(zp)); return [P2[0] - 0.002 * w, P2[1], Math.max(0.3, 0.003 * (1 - gz(zp)) * h), 0]; });
        if (k % 3 === 1) { var cz = lerp(ze, zf, 0.7), cb = L.P(X - side * 0.03, 0.12, gz(cz)), ch = 0.045 * (1 - gz(cz)) * h, cwd = 0.014 * (1 - gz(cz)) * w;
          [['#c8402a', 0], ['#e8b030', 1.3], ['#7a4a2a', 2.6]].forEach(function (C2) { var cxp = cb[0] + (C2[1] - 1.3) * cwd * 1.6 * side; ctx.fillStyle = '#d8c8a8'; ctx.fillRect(cxp - cwd * 1.1, cb[1] - ch * 0.15, cwd * 2.2, ch * 0.3); ctx.fillStyle = C2[0]; ctx.beginPath(); ctx.moveTo(cxp - cwd, cb[1]); ctx.quadraticCurveTo(cxp - cwd * 0.2, cb[1] - ch * 0.9, cxp, cb[1] - ch); ctx.quadraticCurveTo(cxp + cwd * 0.2, cb[1] - ch * 0.9, cxp + cwd, cb[1]); ctx.closePath(); ctx.fill(); }); }
      }
    }
    stallSide(1, texStallR, 0.6, 8.5);
    stallSide(-1, texStallL, 0.6, 8.5);
    mark('stalls', ctx);
    /* ---------- foreground: shadows and crates at the edges ---------- */
    ctx.fillStyle = lg(ctx, 0, gy0 - h * 0.1, 0, h, [[0, 'rgba(40,30,50,0)'], [1, 'rgba(40,30,50,0.18)']]); ctx.fillRect(0, gy0 - h * 0.1, w, h);
    // awning shadows on the lane, soft
    for (i = 0; i < 6; i++) { var sp = L.P(-0.16, 0.25, gz(1.1 + i * 0.6)); ctx.save(); ctx.translate(sp[0], sp[1]); ctx.scale(1, 0.25); glow(ctx, 0, 0, 50 * s * (1 - gz(1.1 + i * 0.6)) * 2, '#2a2030', 0.12); ctx.restore(); }
    // sunlight across the lane
    ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = lg(ctx, 0, h * 0.62, w, h, [[0, 'rgba(255,230,180,0.5)'], [1, 'rgba(255,230,180,0)']]); ctx.fillRect(0, h * 0.6, w, h * 0.4); ctx.restore();
    // crates at the bottom corners
    function crate(x0, y0, cw, chh, pal) { ctx.fillStyle = '#b8864a'; ctx.fillRect(x0, y0, cw, chh); ctx.fillStyle = '#8a5a2a'; ctx.fillRect(x0, y0 + chh * 0.45, cw, chh * 0.08); ctx.fillRect(x0, y0, cw * 0.06, chh); ctx.fillRect(x0 + cw * 0.94, y0, cw * 0.06, chh);
      var cr2 = rng((x0 * 7) | 0); dots(ctx, 26, [[pal[0], 1], [pal[1], 1]], function () { return [x0 + cw * (0.1 + cr2() * 0.8), y0 - chh * 0.05 + cr2() * chh * 0.12, cw * 0.075, cr2() < 0.5 ? 0 : 1]; });
      dots(ctx, 12, [['#ffffff', 0.4]], function () { return [x0 + cw * (0.1 + cr2() * 0.8), y0 - chh * 0.08 + cr2() * chh * 0.1, cw * 0.025, 0]; }); }
    crate(-w * 0.03, h * 0.9, w * 0.2, h * 0.07, ['#f39a2a', '#ffc04a']); crate(w * 0.12, h * 0.93, w * 0.16, h * 0.06, ['#d8302a', '#f05a3a']);
    crate(w * 0.83, h * 0.9, w * 0.2, h * 0.07, ['#7aa83a', '#a8cc5a']); crate(w * 0.72, h * 0.935, w * 0.15, h * 0.06, ['#5a2a4a', '#8a4a72']);
    // a flower bucket on the right
    var fx = w * 0.95, fy = h * 0.88; ctx.fillStyle = '#7a8a9a'; ctx.beginPath(); ctx.moveTo(fx - 12 * s, fy); ctx.lineTo(fx + 12 * s, fy); ctx.lineTo(fx + 9 * s, fy + 20 * s); ctx.lineTo(fx - 9 * s, fy + 20 * s); ctx.closePath(); ctx.fill();
    clump(ctx, fx, fy - 6 * s, 14 * s, ['#2a4a2e', '#3c6a3a', '#5a8a48', '#9ac070', '#dceaa8'], r, 0.5, -0.8, false, 0.6);
    dots(ctx, 30, [['#ff6a8a', 1], ['#ffd35a', 1], ['#ffffff', 1]], function () { return [fx + (r() - 0.5) * 24 * s, fy - 6 * s + (r() - 0.6) * 22 * s, (1.6 + r() * 1.4) * s, (r() * 3) | 0]; });
    mark('fore', ctx);
    finish(ctx, w, h, '#ffe0b8', 0.12, 0.2, 0.04, '#2a1a20', 0.42);
    mark('finish', ctx);
  }

  function overlayMarket(ctx, w, h, t) {
    var L = mkL(w, h), s = L.s, i; L.H = h;
    // drones crossing above the market, one Pantry lane and one Kestrel robot rolling up the lane
    for (i = 0; i < 4; i++) {
      var sp = (10 + i * 3) * s, dir = i % 2 ? 1 : -1, ph = hash(i, 61) * w * 1.5, dx = dir > 0 ? ((t * sp + ph) % (w * 1.3)) - w * 0.15 : w * 1.15 - ((t * sp + ph) % (w * 1.3)), dy = h * (0.06 + i * 0.03) + Math.sin(t * 1.4 + i) * 2 * s, ds = (2.6 + (i % 2)) * s;
      ctx.fillStyle = '#f8f8fa'; ctx.beginPath(); ctx.ellipse(dx, dy, ds, ds * 0.45, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#f29a2e'; ctx.fillRect(dx - ds, dy - ds * 0.05, ds * 2, ds * 0.3);
      ctx.strokeStyle = '#9aa4be'; ctx.lineWidth = Math.max(0.5, ds * 0.18); ctx.beginPath(); ctx.moveTo(dx - ds * 1.7, dy - ds * 0.3); ctx.lineTo(dx + ds * 1.7, dy - ds * 0.3); ctx.stroke();
      ctx.fillStyle = 'rgba(170,180,200,0.5)'; ctx.beginPath(); ctx.ellipse(dx - ds * 1.7, dy - ds * 0.45, ds * 0.8, ds * 0.15, 0, 0, TAU); ctx.ellipse(dx + ds * 1.7, dy - ds * 0.45, ds * 0.8, ds * 0.15, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#d8a860'; ctx.fillRect(dx - ds * 0.5, dy + ds * 0.45, ds, ds * 0.6);
    }
    // pigeons wheeling high up
    ctx.strokeStyle = 'rgba(70,70,90,0.7)'; ctx.lineWidth = Math.max(0.8, 0.9 * s); ctx.lineCap = 'round';
    for (i = 0; i < 3; i++) { var bx = w * (0.3 + 0.2 * Math.sin(t * 0.2 + i * 2)), by = h * (0.16 + i * 0.02) + Math.cos(t * 0.3 + i) * 8 * s; drawBird(ctx, bx, by, 3.2 * s, t * 7 + i); }
    // a Kestrel sidewalk robot rolling between the stalls, far to near and back
    var ph2 = (t * 0.035) % 2, u = ph2 < 1 ? ph2 : 2 - ph2, z = lerp(6.5, 1.6, u), g = gz(z), P2 = L.P(-0.12, 0.3, g), sc = (1 - g) * 0.11 * h;
    ctx.fillStyle = 'rgba(20,20,40,0.22)'; ctx.beginPath(); ctx.ellipse(P2[0], P2[1], sc * 0.5, sc * 0.08, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#2a2e40'; [-0.3, 0, 0.3].forEach(function (k) { ctx.beginPath(); ctx.arc(P2[0] + k * sc, P2[1] - sc * 0.09, sc * 0.09, 0, TAU); ctx.fill(); });
    ctx.fillStyle = '#fbfbfd'; ctx.beginPath(); rrect(ctx, P2[0] - sc * 0.45, P2[1] - sc * 0.62, sc * 0.9, sc * 0.48, sc * 0.12); ctx.fill();
    ctx.fillStyle = '#c4553a'; ctx.fillRect(P2[0] - sc * 0.45, P2[1] - sc * 0.4, sc * 0.9, sc * 0.07);
    ctx.fillStyle = '#e8b53a'; ctx.beginPath(); ctx.arc(P2[0] + sc * 0.22, P2[1] - sc * 0.28, sc * 0.045, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#8a90a8'; ctx.lineWidth = Math.max(0.5, sc * 0.02); ctx.beginPath(); ctx.moveTo(P2[0] + sc * 0.3, P2[1] - sc * 0.62); ctx.lineTo(P2[0] + sc * 0.3, P2[1] - sc * 0.95); ctx.stroke(); ctx.fillStyle = '#c4553a'; ctx.fillRect(P2[0] + sc * 0.3, P2[1] - sc * 0.95, sc * 0.14, sc * 0.08);
    // the Secession's gold leaves glint
    var gl = Math.pow(Math.max(0, Math.sin(t * 0.9)), 6), spr = glowSpr('#fff2b0', true); if (spr && gl > 0.02) { ctx.globalAlpha = gl * 0.8; var gx = w * 0.47 + 4 * s, gy = L.vy - h * 0.035 - 12 * s; ctx.drawImage(spr, gx - 6 * s, gy - 6 * s, 12 * s, 12 * s); ctx.globalAlpha = 1; }
  }

  PAINT.vienna_market = {
    focus: { x: 0.47, y: 0.33 }, track: 'morning',
    // the lane's lower third is open paving (y 0.72..0.95); stalls line both sides above it
    anchors: { lane: { y0: 0.72, y1: 0.95 }, secession: { x: 0.47, y: 0.33 } },
    paint: function (ctx, w, h) { ctx.save(); try { paintMarket(ctx, w, h); } catch (e) { PAINT._err = 'vienna_market: ' + String(e && e.stack || e); } finally { ctx.restore(); } },
    overlay: function (ctx, w, h, t) { ctx.save(); try { overlayMarket(ctx, w, h, t); } catch (e) { PAINT._err = 'vienna_market overlay: ' + String(e && e.stack || e); } finally { ctx.restore(); } }
  };
})();
