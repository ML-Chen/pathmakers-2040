/* vienna_market.js - the Naschmarkt in Vienna on a summer morning: PAINT.vienna_market (uses window.VIENNA_KIT).
   We stand in the market lane looking north-east toward Karlsplatz. Two rows of separate market booths line the lane.
   Each booth is a solid little building drawn in true perspective: a side wall facing us, a front facing the lane with
   an open counter, its name on the board above the awning, a flat roof with an overhang, two-step display tables of
   crates (apricots, peppers, figs, spice, olives, flowers) and a shadow on the paving. Gaps between the booths show
   the road behind. Set back across the road rise Otto Wagner's Majolika House (pink tiles with a painted vine of red
   roses) and the Medallion House next door (white, with gold medallions and gold palm fronds); ordinary 1890s
   apartment houses stand in shade on the right. At the far end the golden laurel dome of the Secession gleams.
   The world is measured in metres and projected with one focal length for both axes, so the booths keep their shape
   at every window size. The lower third is the calm lane for subtitles and props. Stall signs are generic German
   words (no brands); "KAYA" is Emine Kaya's fictional stall. */
(function () {
  'use strict';
  var PAINT = (window.PAINT = window.PAINT || {});
  var K = window.VIENNA_KIT; if (!K) return;
  var PI = K.PI, TAU = K.TAU, rng = K.rng, hash = K.hash, clamp = K.clamp, lerp = K.lerp, mix = K.mix, rgba = K.rgba, lg = K.lg, rg = K.rg,
    S = K.S, memo = K.memo, poly = K.poly, rrect = K.rrect, glow = K.glow, softGlow = K.softGlow, haze = K.haze,
    finish = K.finish, dots = K.dots, glowSpr = K.glowSpr, cloudForm = K.cloudForm, skyStrokes = K.skyStrokes,
    clump = K.clump, lens = K.lens, mk = K.mk, drawBird = K.drawBird, mark = K.mark;

  /* ---------- camera ----------
     X across the lane in metres (0 = the middle, + = right), hh = height above the paving, z = distance ahead.
     One focal length F for both axes; the eye is G metres above the paving. The window shape only changes how
     wide the view is (and how far back the houses stand), never the shape of a booth. */
  var mkL = memo(function (w, h) {
    var s = S(w, h), F = Math.max(0.6 * h, 0.6 * w), G = 1.5, vx = w * 0.5, vy = h * 0.4, asp = clamp((w / h - 0.46) / 1.14, 0, 1);
    // Xf: the booth fronts (half the lane's width); a phone's narrow window gets a slightly narrower lane
    var L = { s: s, w: w, h: h, F: F, G: G, vx: vx, vy: vy, asp: asp, Xf: 1.6 - 0.3 * (1 - asp), D: 2.6, Xh: 7 + 2 * asp };
    L.P = function (X, hh, z) { return [vx + X * F / z, vy + (G - hh) * F / z]; };
    L.edgeZ = function (X) { return Math.abs(X) * F / (w * 0.5); }; // the depth where the plane |X| leaves the frame
    L.zmin = G * F / (h - vy);
    // the first booth: its roof inside the frame, and on wide windows its whole side wall too
    L.zFirst = Math.max(L.edgeZ(L.Xf) * 0.92, (3.5 - G) * F / (0.37 * h), asp * L.edgeZ(L.Xf + L.D) * 0.95);
    return L;
  });
  var HZ = '#d3dce4';
  function hzz(z) { return clamp((z - 9) / 110, 0, 0.62); }
  function pp(L, pts) { var o = [], i; for (i = 0; i < pts.length; i++) o.push(L.P(pts[i][0], pts[i][1], pts[i][2])); return o; }
  function face(ctx, L, pts, fill) { poly(ctx, pp(L, pts)); ctx.fillStyle = fill; ctx.fill(); }

  /* Map a flat texture onto the vertical plane X = const, from depth z1 (u0) to z2 (u1) and heights h1..h2, in thin strips.
     On the right side (X > 0) the texture is flipped so that it still reads left to right on screen. */
  function mapX(ctx, L, tex, X, z1, z2, h1, h2, u0, u1) {
    if (!tex) return; u0 = u0 || 0; u1 = u1 == null ? 1 : u1;
    var F = L.F, xa = L.vx + X * F / z1, xb = L.vx + X * F / z2, n = Math.max(2, Math.ceil(Math.abs(xb - xa) / 1.2)), i, W = tex.width, H = tex.height, flip = X > 0;
    for (i = 0; i < n; i++) {
      var x0 = lerp(xa, xb, i / n), x1 = lerp(xa, xb, (i + 1) / n);
      if (Math.max(x0, x1) < -2 || Math.min(x0, x1) > L.w + 2) continue;
      var zz0 = X * F / (x0 - L.vx), zz1 = X * F / (x1 - L.vx), zm = (zz0 + zz1) / 2;
      var t0 = (zz0 - z1) / (z2 - z1), t1 = (zz1 - z1) / (z2 - z1); if (flip) { t0 = 1 - t0; t1 = 1 - t1; }
      var ua = lerp(u0, u1, clamp(Math.min(t0, t1), 0, 1)) * W, ub = lerp(u0, u1, clamp(Math.max(t0, t1), 0, 1)) * W;
      var sw = Math.max(0.5, ub - ua); if (ua + sw > W) sw = W - ua; if (sw <= 0) continue;
      var yt = L.vy + (L.G - h2) * F / zm, yb = L.vy + (L.G - h1) * F / zm;
      ctx.drawImage(tex, ua, 0, sw, H, Math.min(x0, x1), yt, Math.abs(x1 - x0) + 0.7, yb - yt);
    }
  }
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

  /* ---------- the booths ---------- */
  // sign text, small line, board colour, what the booth sells
  var SIGNS = [['KAYA', 'GEWÜRZE · TROCKENFRÜCHTE', '#2f6a4a', 'spice'], ['OBST & GEMÜSE', '', '#3a6a9a', 'produce'], ['MARILLEN', 'aus der Wachau', '#c8602a', 'produce'],
    ['KÄSE', '', '#7a4a2a', 'cheese'], ['OLIVEN', '', '#4a5a2a', 'olive'], ['BLUMEN', '', '#a83a5a', 'flower'], ['GEWÜRZE', '', '#8a3a2a', 'spice'], ['FISCH', '', '#2a5a7a', 'fish']];
  var BODY = [['#5a9470', '#2f5a44'], ['#ece0c4', '#8a6a4a'], ['#3f8274', '#24524a'], ['#c87452', '#7a3a2a'], ['#e8d4a4', '#9a7a48'], ['#78a476', '#3e6a44'], ['#dcd0bc', '#6a5a4a']];
  var AWN = [['#e8574a', '#fff4dc'], ['#3a8a6a', '#f2ecd8'], ['#f0a83a', '#fff4dc'], ['#4a6ab0', '#eef2f8'], ['#c8384a', '#fbe8e0']];
  var PROD = { produce: [['#f39a2a', '#ffc04a'], ['#d8302a', '#f2603a'], ['#7aa83a', '#a8cc5a'], ['#5a2a4a', '#8a4a72'], ['#f2d040', '#ffe27a'], ['#e8783a', '#f8a85a']],
    spice: [['#c8402a', '#e0603a'], ['#e8b030', '#f8d060'], ['#8a4a2a', '#a86a3a'], ['#d87a2a', '#f0a050'], ['#6a8a3a', '#8aaa50'], ['#f2e6c0', '#fff8e0']],
    cheese: [['#f2d27a', '#ffe8a8'], ['#e8b850', '#f8d888'], ['#f6ecd0', '#fffaf0']], olive: [['#4a5a2a', '#6a7a3a'], ['#2e2e2a', '#4a4a44'], ['#7a8a3a', '#9aaa5a'], ['#c8402a', '#e06a4a']],
    flower: [['#ff6a8a', '#ffd35a'], ['#ffffff', '#f8a8c8'], ['#e8574a', '#ffb0a0'], ['#a86ad8', '#f0e0ff']], fish: [['#c8d8e4', '#eef6fa'], ['#9ab0c0', '#d8e8f0']] };
  var ROWS = { '-1': [0, 2, 1, 6, 3, 4, 5, 1, 2, 7], '1': [1, 5, 4, 2, 7, 3, 6, 1, 4, 2] };
  var mkBooths = memo(function (w, h) {
    var L = mkL(w, h), out = { '-1': [], '1': [] };
    [-1, 1].forEach(function (sd) {
      var r = rng(sd < 0 ? 71011 : 71023), z = L.zFirst + (sd > 0 ? 0.7 : 0), i = 0, order = ROWS[sd];
      while (z < 150) {
        var len = (i === 0 ? 4.3 : 3.3 + r() * 1.0), sg = SIGNS[order[i % order.length]], bc = BODY[(i * 3 + (sd > 0 ? 2 : 0)) % BODY.length];
        out[sd].push({ za: z, zb: z + len, rt: 3.36 + r() * 0.1, sg: sg, kind: sg[3], body: bc[0], trim: bc[1], awn: AWN[(i + (sd > 0 ? 1 : 0)) % AWN.length], seed: (sd + 3) * 1000 + i, i: i });
        z += len + (i % 5 === 4 ? 2.6 + r() * 0.8 : 0.7 + r() * 0.8); i++;
      }
    });
    return out;
  });

  var signCache = {};
  function signTex(sg, lenM) {
    var key = sg[0] + '|' + Math.round(lenM * 10); if (signCache[key] !== undefined) return signCache[key];
    var H = 80, W = Math.max(60, Math.round(lenM / 0.5 * H)), c = mk(W, H); signCache[key] = c; if (!c) return null; var g = c.getContext('2d');
    g.fillStyle = sg[2]; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(255,255,255,0.13)'; g.fillRect(0, 0, W, H * 0.32); g.fillStyle = 'rgba(0,0,0,0.16)'; g.fillRect(0, H * 0.86, W, H * 0.14);
    g.strokeStyle = '#f2e6c8'; g.lineWidth = 3.5; g.strokeRect(8, 8, W - 16, H - 16);
    g.fillStyle = '#fff6e0'; g.textAlign = 'center'; g.textBaseline = 'middle';
    var fs = sg[1] ? 40 : 56, tw; g.font = '800 ' + fs + 'px Nunito, sans-serif'; tw = g.measureText(sg[0]).width;
    if (tw > W * 0.84) { fs *= W * 0.84 / tw; g.font = '800 ' + fs + 'px Nunito, sans-serif'; }
    g.fillText(sg[0], W / 2, sg[1] ? H * 0.42 : H * 0.54);
    if (sg[1]) { var f2 = 15; g.font = '700 ' + f2 + 'px Nunito, sans-serif'; tw = g.measureText(sg[1]).width; if (tw > W * 0.8) { f2 *= W * 0.8 / tw; g.font = '700 ' + f2 + 'px Nunito, sans-serif'; } g.fillText(sg[1], W / 2, H * 0.74); }
    return c;
  }
  // the far inner wall of a booth, seen through its open front: shelves of goods under a warm lamp (2.6 m wide, 0.5..2.32 m high)
  var interCache = {};
  function interiorTex(kind) {
    if (interCache[kind] !== undefined) return interCache[kind];
    var W = 260, H = 182, c = mk(W, H); interCache[kind] = c; if (!c) return null; var g = c.getContext('2d'), r = rng(9000 + kind.length * 31 + kind.charCodeAt(0)), i, j, pal = PROD[kind] || PROD.produce;
    g.fillStyle = lg(g, 0, 0, 0, H, [[0, '#2e221e'], [0.5, '#4a3628'], [1, '#3a2a22']]); g.fillRect(0, 0, W, H);
    g.fillStyle = rg(g, W * 0.45, 6, 0, 150, [[0, 'rgba(255,214,150,0.5)'], [1, 'rgba(255,214,150,0)']]); g.fillRect(0, 0, W, H);
    for (j = 0; j < 3; j++) {
      var sy = 44 + j * 40; g.fillStyle = '#7a5236'; g.fillRect(0, sy, W, 5); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, sy + 5, W, 3);
      for (i = 0; i < 12; i++) {
        var jx = 4 + i * 21.5, jw = 16, jh = 24 + (r() * 6 | 0), pc = pal[(i + j * 2) % pal.length];
        if (kind === 'flower') { g.fillStyle = '#3c6a3a'; g.fillRect(jx + 4, sy - jh * 0.6, 3, jh * 0.6); g.fillStyle = pc[(i + j) % 2]; g.beginPath(); g.arc(jx + 6, sy - jh * 0.65, 6.5, 0, TAU); g.fill(); continue; }
        if (kind === 'cheese') { g.fillStyle = pc[0]; g.beginPath(); g.ellipse(jx + 8, sy - 9, 10, 9, 0, 0, TAU); g.fill(); g.fillStyle = pc[1]; g.fillRect(jx, sy - 16, 16, 4); continue; }
        if (kind === 'produce' && j === 2) { g.fillStyle = '#b88a52'; g.fillRect(jx, sy - 14, jw + 3, 14); g.fillStyle = pc[0]; for (var q = 0; q < 3; q++) { g.beginPath(); g.arc(jx + 4 + q * 5.5, sy - 15, 4, 0, TAU); g.fill(); } continue; }
        g.fillStyle = 'rgba(230,240,245,0.42)'; g.fillRect(jx, sy - jh, jw, jh);
        g.fillStyle = pc[0]; g.fillRect(jx + 2, sy - jh * 0.72, jw - 4, jh * 0.68);
        g.fillStyle = '#c8a050'; g.fillRect(jx + 1, sy - jh - 4, jw - 2, 4); g.fillStyle = 'rgba(255,255,255,0.55)'; g.fillRect(jx + 3, sy - jh + 3, 2, jh - 6);
      }
    }
    // a garland of dried peppers and one of garlic hanging at the sides
    for (i = 0; i < 2; i++) { var gx = 14 + i * (W - 28); g.strokeStyle = '#6a4a2a'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(gx, 0); g.lineTo(gx, 74); g.stroke();
      for (j = 0; j < 10; j++) { g.fillStyle = i ? '#f2ecd8' : '#d83a2a'; g.beginPath(); g.ellipse(gx + (j % 2 ? 3.4 : -3.4), 6 + j * 6.6, i ? 4.4 : 3.2, i ? 4.4 : 5.6, j % 2 ? 0.4 : -0.4, 0, TAU); g.fill(); } }
    // the stall keeper's back counter
    g.fillStyle = '#6a4a32'; g.fillRect(0, 150, W, 32); g.fillStyle = '#8a6444'; g.fillRect(0, 150, W, 5);
    return c;
  }

  // fill only the screen box of a set of projected points (inside a clip, so huge canvases stay fast)
  function boxFill(ctx, pts, style) { var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, i; for (i = 0; i < pts.length; i++) { x0 = Math.min(x0, pts[i][0]); x1 = Math.max(x1, pts[i][0]); y0 = Math.min(y0, pts[i][1]); y1 = Math.max(y1, pts[i][1]); } ctx.fillStyle = style; ctx.fillRect(x0 - 1, y0 - 1, x1 - x0 + 2, y1 - y0 + 2); }
  function clipFill(ctx, pts, style) { ctx.save(); poly(ctx, pts); ctx.clip(); boxFill(ctx, pts, style); ctx.restore(); }

  /* One booth on side sd (-1 left, +1 right), in metres:
       0 .. 0.92   counter front          0.92 .. 2.4  the open front, with the interior behind
       2.45        the awning's top edge; it slopes out over the tables and down to 2.12 at the front
       2.4 .. 2.8  a trim band with lamps  2.8 .. rt   the roof box, its lane side carrying the sign
     The signs sit high enough that no awning, near or far, ever crosses their lettering from where we stand.
     Draw order: side wall facing us, lane front and interior, tables with crates, awning, roof box with the sign. */
  function drawBooth(ctx, L, b, sd) {
    var F = L.F, Xf = L.Xf * sd, Xb = (L.Xf + L.D) * sd, za = b.za, zb = b.zb, hs = 2.8, rt = b.rt, pxm = F / za, hz = hzz((za + zb) / 2), i, k;
    var lit = sd < 0, shL = lit ? 0 : 0.3, shE = lit ? 0.2 : 0.14;
    function C(c, sh) { return mix(mix(c, '#34405a', clamp(sh, 0, 1)), HZ, hz); }
    function at(X, hh, z) { return L.P(X, hh, z); }
    var Xo = Xf - sd * 0.6, ov = 0.16, Xr = Xf - sd * ov, Xr2 = Xb + sd * 0.12, r0 = za - ov, r1 = zb + ov;
    var xin = at(Xo, 0, zb)[0]; if ((sd < 0 && xin < 0) || (sd > 0 && xin > L.w)) return;
    /* --- the side wall facing us (z = za) --- */
    var EW = [[Xf, 0, za], [Xb, 0, za], [Xb, hs, za], [Xf, hs, za]];
    face(ctx, L, EW, C(b.body, shE));
    if (pxm > 18) {
      var A = at(Xf, hs, za), B = at(Xb, 0, za), pw = Math.abs(B[0] - A[0]), EP = pp(L, EW);
      ctx.save(); poly(ctx, EP); ctx.clip();
      ctx.fillStyle = rgba('#000000', 0.08); for (k = 1; k < 11; k++) { var bx = lerp(A[0], B[0], k / 11); ctx.fillRect(bx, A[1], Math.max(0.6, pw * 0.004), B[1] - A[1]); }
      ctx.fillStyle = lg(ctx, 0, A[1], 0, B[1], [[0, 'rgba(255,240,210,0.10)'], [0.75, 'rgba(0,0,0,0)'], [1, 'rgba(20,10,30,0.22)']]); ctx.fillRect(Math.min(A[0], B[0]), A[1], pw, B[1] - A[1]);
      ctx.fillStyle = lg(ctx, A[0], 0, B[0], 0, [[0, 'rgba(255,240,220,0.08)'], [1, 'rgba(20,10,40,0.12)']]); ctx.fillRect(Math.min(A[0], B[0]), A[1], pw, B[1] - A[1]);
      ctx.restore();
      face(ctx, L, [[Xf, 0, za], [Xb, 0, za], [Xb, 0.28, za], [Xf, 0.28, za]], C(b.trim, shE + 0.1));
      // a small shuttered window, a chalk price board, and empty crates stacked against the wall
      var wX0 = Xf + sd * 1.7, wX1 = Xf + sd * 2.35;
      if (b.i % 2 === 0) { face(ctx, L, [[wX0, 1.25, za - 0.01], [wX1, 1.25, za - 0.01], [wX1, 2.15, za - 0.01], [wX0, 2.15, za - 0.01]], C('#f2ead8', shE));
        face(ctx, L, [[wX0 + sd * 0.05, 1.3, za - 0.02], [wX1 - sd * 0.05, 1.3, za - 0.02], [wX1 - sd * 0.05, 2.1, za - 0.02], [wX0 + sd * 0.05, 2.1, za - 0.02]], C('#4a5e78', 0.1));
        face(ctx, L, [[wX0 + sd * 0.07, 1.75, za - 0.025], [wX1 - sd * 0.07, 1.75, za - 0.025], [wX1 - sd * 0.07, 2.08, za - 0.025], [wX0 + sd * 0.07, 2.08, za - 0.025]], C('#7e9ab4', 0.05));
        // a window box of red geraniums
        var fr = rng(b.seed + 11), fb0 = at(wX0 - sd * 0.04, 1.24, za - 0.12), fb1 = at(wX1 + sd * 0.04, 1.06, za - 0.12), fR = 0.11 * F / za;
        for (k = 0; k < 4; k++) clump(ctx, lerp(fb0[0], fb1[0], (k + 0.5) / 4), fb0[1] - fR * 0.2, fR, ['#24401e', '#2f5a2a', '#4a7a3a', '#6a9a48', '#a8c870'], fr, 0.6, -0.8, false, 0.5);
        dots(ctx, 16, [[C('#e8424a', 0), 1], [C('#ff8a8a', 0), 1]], function () { return [lerp(fb0[0], fb1[0], fr()), fb0[1] - fR * (0.2 + fr() * 0.9), fR * (0.18 + fr() * 0.1), fr() < 0.6 ? 0 : 1]; });
        face(ctx, L, [[wX0 - sd * 0.04, 1.06, za - 0.12], [wX1 + sd * 0.04, 1.06, za - 0.12], [wX1 + sd * 0.04, 1.24, za - 0.12], [wX0 - sd * 0.04, 1.24, za - 0.12]], C('#8a5a3a', shE)); }
      var bX0 = Xf + sd * 0.5, bX1 = Xf + sd * 1.35;
      face(ctx, L, [[bX0, 1.0, za - 0.01], [bX1, 1.0, za - 0.01], [bX1, 1.95, za - 0.01], [bX0, 1.95, za - 0.01]], C(b.trim, 0.2));
      face(ctx, L, [[bX0 + sd * 0.05, 1.05, za - 0.02], [bX1 - sd * 0.05, 1.05, za - 0.02], [bX1 - sd * 0.05, 1.9, za - 0.02], [bX0 + sd * 0.05, 1.9, za - 0.02]], C('#2e3a34', 0.05));
      if (pxm > 50) { var q0 = at(bX0, 1.9, za), q1 = at(bX1, 1.05, za), qx = Math.min(q0[0], q1[0]), qw = Math.abs(q1[0] - q0[0]), qh = q1[1] - q0[1];
        ctx.strokeStyle = rgba('#f4ecd8', 0.6); ctx.lineWidth = Math.max(1, qh * 0.03); ctx.lineCap = 'round'; ctx.beginPath();
        for (k = 0; k < 4; k++) { var ly = q0[1] + qh * (0.2 + k * 0.2); ctx.moveTo(qx + qw * 0.15, ly); ctx.lineTo(qx + qw * (0.5 + 0.3 * hash(k, b.seed)), ly); } ctx.stroke(); }
      face(ctx, L, [[Xb - sd * 0.16, 0, za - 0.04], [Xb - sd * 0.08, 0, za - 0.04], [Xb - sd * 0.08, hs, za - 0.04], [Xb - sd * 0.16, hs, za - 0.04]], C('#5a6068', shE)); // a drainpipe
      var sX = Xf + sd * 1.75;
      for (k = 0; k < 3; k++) { var cy0 = k * 0.3, cxa = sX + sd * (k === 2 ? 0.12 : 0), cxb = cxa + sd * 0.55;
        face(ctx, L, [[cxa, cy0, za - 0.35], [cxb, cy0, za - 0.35], [cxb, cy0 + 0.28, za - 0.35], [cxa, cy0 + 0.28, za - 0.35]], C(k % 2 ? '#c8945a' : '#b8844a', shE));
        face(ctx, L, [[cxa, cy0 + 0.12, za - 0.36], [cxb, cy0 + 0.12, za - 0.36], [cxb, cy0 + 0.16, za - 0.36], [cxa, cy0 + 0.16, za - 0.36]], C('#7a5030', shE)); }
    }
    /* --- the lane front --- */
    var o0 = za + 0.12, o1 = zb - 0.12;
    face(ctx, L, [[Xf, 0, za], [Xf, 0, zb], [Xf, 0.92, zb], [Xf, 0.92, za]], C(b.body, shL + 0.12));
    var OP = pp(L, [[Xf, 0.92, o0], [Xf, 0.92, o1], [Xf, 2.4, o1], [Xf, 2.4, o0]]);
    ctx.save(); poly(ctx, OP); ctx.clip();
    boxFill(ctx, OP, C('#241a18', 0));
    var I0 = at(Xf, 2.4, zb - 0.1), I1 = at(Xb, 0.5, zb - 0.1), it = interiorTex(b.kind);
    if (it) ctx.drawImage(it, Math.min(I0[0], I1[0]), I0[1], Math.abs(I1[0] - I0[0]), I1[1] - I0[1]);
    var c0 = at(Xf, 2.4, o0), c1 = at(Xf, 2.4, o1);
    boxFill(ctx, OP, lg(ctx, c0[0], 0, c1[0], 0, [[0, rgba('#1a1214', 0.55)], [0.5, rgba('#1a1214', 0.15)], [1, rgba('#1a1214', 0)]]));
    boxFill(ctx, OP, lg(ctx, 0, c0[1], 0, at(Xf, 0.92, o0)[1], [[0, rgba('#120c10', 0.5)], [0.35, rgba('#120c10', 0)], [1, rgba('#120c10', 0)]]));
    if (hz > 0.02) boxFill(ctx, OP, rgba(HZ, hz * 0.9));
    ctx.restore();
    face(ctx, L, [[Xf, 0.92, za], [Xf, 0.92, o0], [Xf, 2.4, o0], [Xf, 2.4, za]], C(b.trim, shL));
    face(ctx, L, [[Xf, 0.92, o1], [Xf, 0.92, zb], [Xf, 2.4, zb], [Xf, 2.4, o1]], C(b.trim, shL));
    face(ctx, L, [[Xf, 0.92, za], [Xf, 0.92, zb], [Xf - sd * 0.16, 0.92, zb], [Xf - sd * 0.16, 0.92, za]], C('#c8a070', shL * 0.5));
    // the trim band between the open front and the roof box, with a row of warm lamps
    face(ctx, L, [[Xf, 2.4, za], [Xf, 2.4, zb], [Xf, hs, zb], [Xf, hs, za]], C(b.trim, shL + 0.15));
    if (pxm > 22) { var nb = Math.round((zb - za) / 0.45), spr = glowSpr('#ffd890', true);
      for (k = 0; k < nb; k++) { var lz = lerp(za + 0.25, zb - 0.25, nb > 1 ? k / (nb - 1) : 0.5), LP = at(Xf - sd * 0.02, 2.62, lz), lr = 0.05 * F / lz;
        ctx.fillStyle = C('#fff0c0', 0); ctx.beginPath(); ctx.arc(LP[0], LP[1], lr, 0, TAU); ctx.fill();
        if (spr) { ctx.globalAlpha = 0.5 * (1 - hz); ctx.drawImage(spr, LP[0] - lr * 5, LP[1] - lr * 5, lr * 10, lr * 10); ctx.globalAlpha = 1; } } }
    /* --- display tables in two steps, with crates --- */
    var t0 = za + 0.22, t1 = zb - 0.22, Xm = Xf - sd * 0.27, Xt = Xf - sd * 0.54, pal = PROD[b.kind] || PROD.produce, pr = rng(b.seed * 7 + 3);
    if (pxm > 3) {
      [[Xf, Xm, 1.0], [Xm, Xt, 0.78]].forEach(function (T, ti) {
        var xi = T[0], xo = T[1], top = T[2];
        face(ctx, L, [[xi, top, t0], [xi, top, t1], [xo, top, t1], [xo, top, t0]], C('#8a6038', 0.1));
        var n = Math.max(1, Math.round((t1 - t0) / 0.5)), cl = (t1 - t0) / n, cxI = xi - sd * 0.02, cxO = xo + sd * 0.02, chh = 0.13;
        for (k = n - 1; k >= 0; k--) {
          var cz0 = t0 + k * cl + 0.025, cz1 = cz0 + cl - 0.05, P2 = pal[(k + ti * 2 + b.i) % pal.length], ztop = top + chh;
          face(ctx, L, [[cxI, ztop, cz0], [cxI, ztop, cz1], [cxO, ztop, cz1], [cxO, ztop, cz0]], C(P2[0], shL * 0.6 + 0.12));
          if (pxm < 11) continue; // far booths: a strip of colour per crate is all that shows
          if (pxm > 20) {
            var cnt = pxm > 40 ? clamp(Math.round(pxm * 0.42), 10, 44) : 7;
            dots(ctx, cnt, [[C(P2[0], shL * 0.5), 1], [C(P2[1], shL * 0.5), 1]], function () { var u = pr(), v = pr(), zp = lerp(cz0 + 0.03, cz1 - 0.03, u), xp = lerp(cxI, cxO, 0.12 + v * 0.76), mound = Math.sin(v * PI) * Math.sin(u * PI) * 0.06, Q = L.P(xp, ztop + 0.025 + mound, zp); return [Q[0], Q[1], Math.max(0.6, 0.042 * F / zp), pr() < 0.5 ? 0 : 1]; });
            if (b.kind === 'produce' && pxm > 40) dots(ctx, Math.round(cnt * 0.25), [[C('#3c6a2e', shL), 0.9]], function () { var u = pr(), v = pr(), zp = lerp(cz0 + 0.04, cz1 - 0.04, u), Q = L.P(lerp(cxI, cxO, 0.15 + v * 0.7), ztop + 0.07 + Math.sin(v * PI) * Math.sin(u * PI) * 0.06, zp); return [Q[0], Q[1], Math.max(0.4, 0.011 * F / zp), 0]; });
            if (pxm > 30) dots(ctx, Math.round(cnt * 0.4), [['#ffffff', 0.4]], function () { var u = pr(), v = pr(), zp = lerp(cz0 + 0.05, cz1 - 0.05, u), xp = lerp(cxI, cxO, 0.15 + v * 0.7), Q = L.P(xp, ztop + 0.06 + Math.sin(v * PI) * Math.sin(u * PI) * 0.06, zp); return [Q[0] - 0.012 * F / zp, Q[1], Math.max(0.4, 0.014 * F / zp), 0]; });
          }
          face(ctx, L, [[cxO, top, cz0], [cxO, top, cz1], [cxO, ztop, cz1], [cxO, ztop, cz0]], C('#c8945a', shL * 0.8 + 0.05));
          if (pxm < 24) continue;
          face(ctx, L, [[cxI, top, cz0], [cxO, top, cz0], [cxO, ztop, cz0], [cxI, ztop, cz0]], C('#b07a44', shE + 0.05));
          if (pxm > 26) face(ctx, L, [[cxO, top + chh * 0.45, cz0], [cxO, top + chh * 0.45, cz1], [cxO, top + chh * 0.56, cz1], [cxO, top + chh * 0.56, cz0]], C('#8a5a30', shL));
          if (pxm > 45 && ti === 1 && k % 2 === 0) { var tg = (cz0 + cz1) / 2; face(ctx, L, [[cxO - sd * 0.005, top + 0.02, tg - 0.1], [cxO - sd * 0.005, top + 0.02, tg + 0.1], [cxO - sd * 0.005, top + 0.11, tg + 0.1], [cxO - sd * 0.005, top + 0.11, tg - 0.1]], C('#fbf6ea', shL * 0.5)); }
          if (b.kind === 'spice' && ti === 0 && pxm > 12 && k % 2 === 1) { var cm = (cz0 + cz1) / 2, cb = L.P(lerp(cxI, cxO, 0.5), ztop + 0.02, cm), cH = 0.26 * F / cm, cW = 0.11 * F / cm;
            ctx.fillStyle = C(P2[0], shL * 0.4); ctx.beginPath(); ctx.moveTo(cb[0] - cW, cb[1]); ctx.quadraticCurveTo(cb[0] - cW * 0.2, cb[1] - cH * 0.9, cb[0], cb[1] - cH); ctx.quadraticCurveTo(cb[0] + cW * 0.2, cb[1] - cH * 0.9, cb[0] + cW, cb[1]); ctx.closePath(); ctx.fill();
            ctx.fillStyle = rgba('#ffffff', 0.22); ctx.beginPath(); ctx.moveTo(cb[0] - cW * 0.5, cb[1] - cH * 0.1); ctx.quadraticCurveTo(cb[0] - cW * 0.15, cb[1] - cH * 0.7, cb[0] - cW * 0.02, cb[1] - cH * 0.95); ctx.lineTo(cb[0] - cW * 0.2, cb[1] - cH * 0.1); ctx.closePath(); ctx.fill(); }
        }
        var SK = [[xo, ti ? 0 : 0.78, t0], [xo, ti ? 0 : 0.78, t1], [xo, top, t1], [xo, top, t0]];
        face(ctx, L, SK, C('#9a6a3a', shL + 0.12));
        if (ti === 1 && pxm > 24) {
          // the front step's skirt: wooden planks, darker toward the ground, and a striped cloth along the top
          var SP = pp(L, SK), yT = at(xo, top, t0)[1], yB = at(xo, 0, t0)[1];
          clipFill(ctx, SP, lg(ctx, 0, yT, 0, yB, [[0, 'rgba(255,230,190,0.10)'], [0.6, 'rgba(0,0,0,0)'], [1, 'rgba(30,15,20,0.28)']]));
          ctx.strokeStyle = rgba('#4a2a18', 0.35); ctx.lineWidth = Math.max(0.6, 0.01 * F / t0); ctx.beginPath();
          for (var pz = t0 + 0.22; pz < t1 - 0.05; pz += 0.22) { var pa = at(xo, 0.02, pz), pb = at(xo, top - 0.16, pz); ctx.moveTo(pa[0], pa[1]); ctx.lineTo(pb[0], pb[1]); } ctx.stroke();
          var nc = Math.max(2, Math.round((t1 - t0) / 0.18)), clc = b.awn;
          for (var q = 0; q < nc; q++) { var q0 = lerp(t0, t1, q / nc), q1 = lerp(t0, t1, (q + 1) / nc);
            face(ctx, L, [[xo + sd * 0.004, top - 0.16, q0], [xo + sd * 0.004, top - 0.16, q1], [xo + sd * 0.004, top, q1], [xo + sd * 0.004, top, q0]], C(clc[q % 2], shL + 0.06)); }
        }
        face(ctx, L, [[xo, top - 0.05, t0], [xo, top - 0.05, t1], [xo, top, t1], [xo, top, t0]], C('#6a4024', shL));
        face(ctx, L, [[xi, ti ? 0 : 0.78, t0], [xo, ti ? 0 : 0.78, t0], [xo, top, t0], [xi, top, t0]], C('#7a5030', shE + 0.15));
      });
    }
    /* --- the awning: striped canvas sloping from under the trim band out over the tables; we see its underside --- */
    var a0 = za + 0.06, a1 = zb - 0.06, ha = 2.47,
      // the front edge is as high as it can be while staying below the line from the eye to every sign's bottom edge
      ho = Math.min(2.36, L.G + 0.9 * Math.abs(Xo) * (hs - L.G) / Math.abs(Xr)), ac = b.awn, nS = Math.max(2, Math.round((a1 - a0) / 0.3)), under = lit ? 0.1 : 0.34;
    for (k = 0; k < nS; k++) { var w0 = lerp(a0, a1, k / nS), w1 = lerp(a0, a1, (k + 1) / nS);
      face(ctx, L, [[Xf, ha, w0], [Xf, ha, w1], [Xo, ho, w1], [Xo, ho, w0]], C(ac[k % 2], under)); }
    var AP = pp(L, [[Xf, ha, a0], [Xf, ha, a1], [Xo, ho, a1], [Xo, ho, a0]]), g0 = at(Xf, ha, (a0 + a1) / 2), g1 = at(Xo, ho, (a0 + a1) / 2);
    clipFill(ctx, AP, lg(ctx, g0[0], g0[1], g1[0], g1[1], [[0, 'rgba(30,20,30,0.38)'], [0.45, 'rgba(30,20,30,0.08)'], [1, lit ? 'rgba(255,240,200,0.2)' : 'rgba(255,240,200,0.06)']]));
    var vh = 0.16;
    for (k = 0; k < nS; k++) { var v0 = lerp(a0, a1, k / nS), v1 = lerp(a0, a1, (k + 1) / nS), A1 = at(Xo, ho, v0), B1 = at(Xo, ho, v1), A2 = at(Xo, ho - vh, v0), B2 = at(Xo, ho - vh, v1), M2 = at(Xo, ho - vh * 0.55, (v0 + v1) / 2);
      ctx.fillStyle = C(ac[k % 2], lit ? 0.02 : 0.26); ctx.beginPath(); ctx.moveTo(A1[0], A1[1]); ctx.lineTo(B1[0], B1[1]); ctx.lineTo(B2[0], B2[1]); ctx.quadraticCurveTo(M2[0], M2[1] + (B2[1] - B1[1]) * 0.5, A2[0], A2[1]); ctx.closePath(); ctx.fill(); }
    var e1 = at(Xo, ho, a0), e2 = at(Xo, ho, a1); ctx.strokeStyle = C(ac[0], 0.4); ctx.lineWidth = Math.max(0.6, 0.02 * F / za); ctx.beginPath(); ctx.moveTo(e1[0], e1[1]); ctx.lineTo(e2[0], e2[1]); ctx.stroke();
    var n1 = at(Xf, ha, a0), n2 = at(Xo, ho, a0); ctx.strokeStyle = C('#3a3a40', 0.1); ctx.lineWidth = Math.max(0.6, 0.025 * F / za); ctx.beginPath(); ctx.moveTo(n1[0], n1[1]); ctx.lineTo(n2[0], n2[1]); ctx.stroke();
    /* --- the roof box, overhanging on every side; the sign is its lane side --- */
    face(ctx, L, [[Xr, hs, r0], [Xr, hs, r1], [Xf, hs, r1], [Xf, hs, r0]], C('#2a2228', 0.1));
    face(ctx, L, [[Xr, hs, r0], [Xr2, hs, r0], [Xr2, hs, za], [Xr, hs, za]], C('#2a2228', 0.1));
    face(ctx, L, [[Xr, hs, r0], [Xr2, hs, r0], [Xr2, rt, r0], [Xr, rt, r0]], C(b.trim, shE + 0.05));
    face(ctx, L, [[Xr, rt - 0.05, r0], [Xr2, rt - 0.05, r0], [Xr2, rt, r0], [Xr, rt, r0]], C('#f2ead8', shE + 0.15));
    face(ctx, L, [[Xr, hs, r0], [Xr, hs, r1], [Xr, rt, r1], [Xr, rt, r0]], C(b.trim, shL));
    var s0 = r0 + 0.08, s1 = r1 - 0.08, ze = L.edgeZ(Xr) * 1.03; if (s0 < ze) s0 = ze;
    if (s1 - s0 > 1.5) { var st = signTex(b.sg, s1 - s0); mapX(ctx, L, st, Xr, s0, s1, hs + 0.04, rt - 0.07);
      if (shL + hz > 0.05) face(ctx, L, [[Xr, hs + 0.04, s0], [Xr, hs + 0.04, s1], [Xr, rt - 0.07, s1], [Xr, rt - 0.07, s0]], hz > 0.1 ? rgba(HZ, hz * 0.85) : rgba('#34405a', shL * 0.4)); }
    else if (s1 - s0 > 0.3) face(ctx, L, [[Xr, hs + 0.04, s0], [Xr, hs + 0.04, s1], [Xr, rt - 0.07, s1], [Xr, rt - 0.07, s0]], C(b.sg[2], shL));
    face(ctx, L, [[Xr, rt - 0.05, r0], [Xr, rt - 0.05, r1], [Xr, rt, r1], [Xr, rt, r0]], C('#f2ead8', shL + 0.1));
  }
  // a booth's shadows on the paving (drawn into one layer that is blurred as a whole): the sun is ahead and to the
  // right, so every shadow falls back toward us and to the left; plus darker contact shadows right under the solids
  function hullPoly(ctx, L, pts) {
    pts = pts.filter(function (p) { return p[1] > 0.6; }).sort(function (a, c) { return a[0] - c[0] || a[1] - c[1]; });
    function cr(o, a, c) { return (a[0] - o[0]) * (c[1] - o[1]) - (a[1] - o[1]) * (c[0] - o[0]); }
    var lo = [], up = [], i;
    for (i = 0; i < pts.length; i++) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], pts[i]) <= 0) lo.pop(); lo.push(pts[i]); }
    for (i = pts.length - 1; i >= 0; i--) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], pts[i]) <= 0) up.pop(); up.push(pts[i]); }
    var hull = lo.slice(0, -1).concat(up.slice(0, -1)); if (hull.length < 3) return false;
    poly(ctx, hull.map(function (p) { return L.P(p[0], 0, p[1]); })); return true;
  }
  var SUN = [-0.3, -0.22]; // shadow offset on the ground per metre of height (x, z)
  function boothShadow(ctx, L, b, sd) {
    var Xf = L.Xf * sd, Xb = (L.Xf + L.D) * sd, H = b.rt, Xo = Xf - sd * 0.6, Xt = Xf - sd * 0.54, t0 = b.za + 0.22, t1 = b.zb - 0.22, fade = 1 - hzz(b.za) * 0.8;
    function sh(X, z, hh) { return [X + SUN[0] * hh, z + SUN[1] * hh]; }
    // the cast shadow of the booth, its roof and its awning
    if (hullPoly(ctx, L, [[Xf, b.za], [Xb, b.za], [Xb, b.zb], [Xf, b.zb], sh(Xf, b.za, H), sh(Xb, b.za, H), sh(Xb, b.zb, H), sh(Xf, b.zb, H), sh(Xo, b.za, 2.2), sh(Xo, b.zb, 2.2)])) { ctx.fillStyle = rgba('#3a3050', 0.17 * fade); ctx.fill(); }
    // the display tables: a soft shadow just under and beside them
    if (hullPoly(ctx, L, [[Xf, t0 - 0.04], [Xt - sd * 0.05, t0 - 0.04], [Xt - sd * 0.05, t1 + 0.04], [Xf, t1 + 0.04], sh(Xt, t0, 0.8), sh(Xt, t1, 0.8)])) { ctx.fillStyle = rgba('#2a2030', 0.3 * fade); ctx.fill(); }
    // a thin dark line where the walls meet the paving
    face(ctx, L, [[Xf, 0, b.za - 0.05], [Xb, 0, b.za - 0.05], [Xb, 0, b.za + 0.1], [Xf, 0, b.za + 0.1]], rgba('#1e1624', 0.35 * fade));
    face(ctx, L, [[Xf - sd * 0.06, 0, b.za], [Xf - sd * 0.06, 0, b.zb], [Xf + sd * 0.05, 0, b.zb], [Xf + sd * 0.05, 0, b.za]], rgba('#1e1624', 0.3 * fade));
  }

  function paintMarket(ctx, w, h) {
    var L = mkL(w, h), s = L.s, r = rng(70101), i, F = L.F, G = L.G;
    if (!texLeft) { texLeft = makeLeft(); texRight = makeRight(); }
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
    ctx.fillStyle = '#d8d2c4'; ctx.fillRect(w * 0.3, L.vy - h * 0.06, w * 0.4, h * 0.08);
    var kx = w * 0.62, ky = L.vy - h * 0.055;
    ctx.fillStyle = '#e8e0cc'; ctx.fillRect(kx - 14 * s, ky, 28 * s, 16 * s);
    ctx.fillStyle = '#6aa898'; ctx.beginPath(); ctx.ellipse(kx, ky, 12 * s, 13 * s, 0, PI, TAU); ctx.fill(); ctx.fillStyle = '#8ac0b0'; ctx.beginPath(); ctx.ellipse(kx - 4 * s, ky - 5 * s, 3 * s, 6 * s, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#6aa898'; ctx.fillRect(kx - 1 * s, ky - 19 * s, 2 * s, 6 * s);
    ctx.fillStyle = '#e8e0cc'; ctx.fillRect(kx - 26 * s, ky - 4 * s, 4 * s, 22 * s); ctx.fillRect(kx + 22 * s, ky - 4 * s, 4 * s, 22 * s);
    var sx = w * 0.47, sy = L.vy - h * 0.035, sr = 13 * s;
    ctx.fillStyle = '#f4f0e6'; ctx.fillRect(sx - 20 * s, sy, 40 * s, 22 * s); ctx.fillStyle = '#e2dccc'; ctx.fillRect(sx - 20 * s, sy, 6 * s, 22 * s); ctx.fillRect(sx + 14 * s, sy, 6 * s, 22 * s);
    ctx.fillStyle = '#2a2a2a'; ctx.fillRect(sx - 4 * s, sy + 10 * s, 8 * s, 12 * s);
    softGlow(ctx, sx, sy - sr * 0.6, sr * 3, '#ffd870', 0.35);
    ctx.fillStyle = lg(ctx, sx - sr, sy - sr * 2, sx + sr, sy, [[0, '#fff0a0'], [0.4, '#e8b830'], [1, '#a87a1a']]); ctx.beginPath(); ctx.arc(sx, sy - sr * 0.55, sr, PI * 0.97, PI * 2.03); ctx.fill();
    var dr = rng(70151); dots(ctx, 120, [['#fff4b0', 0.9], ['#c8941a', 0.8]], function () { var a = PI + dr() * PI, rr2 = Math.sqrt(dr()) * sr * 0.95; return [sx + Math.cos(a) * rr2, sy - sr * 0.55 + Math.sin(a) * rr2, (0.8 + dr() * 0.8) * s, dr() < 0.5 ? 0 : 1]; });
    ctx.fillStyle = '#f4f0e6'; ctx.fillRect(sx - 15 * s, sy - 3 * s, 30 * s, 3.4 * s);
    haze(ctx, w * 0.25, L.vy - h * 0.08, w * 0.75, L.vy + h * 0.03, '#e8eef2', 0.35);
    mark('far', ctx);
    /* ---------- the houses across the road, set well back behind the booths ---------- */
    var Xh = L.Xh, Ht = 21, zW0 = L.edgeZ(Xh) * 0.85, zW1 = 175, zMaj = Math.max(zW0, 30 * F / h);
    // left: a plain house first where needed, then the Majolika House, the Medallion House and two more
    if (zMaj > zW0 + 0.5) mapX(ctx, L, texLeft, -Xh, zW0, zMaj, 0, Ht, 0.8, 1);
    mapX(ctx, L, texLeft, -Xh, zMaj, Math.min(zW1, zMaj + 1600 / 17.1), 0, Ht, 0, 1);
    mapX(ctx, L, texRight, Xh, zW0, zW0 + 1400 / 15.5, 0, Ht, 0, 1);
    if (zW0 + 1400 / 15.5 < zW1) mapX(ctx, L, texRight, Xh, zW0 + 1400 / 15.5, zW1, 0, Ht, 0, 1);
    // light: morning sun on the left facades, the right side in shade; both fade into the haze with distance
    [[-Xh, 'rgba(255,220,170,0.10)', 'rgba(200,215,230,0.45)'], [Xh, 'rgba(40,40,80,0.36)', 'rgba(150,165,190,0.45)']].forEach(function (S2) {
      var A = L.P(S2[0], Ht, zW0), B = L.P(S2[0], Ht, zW1), C2 = L.P(S2[0], 0, zW1), D = L.P(S2[0], 0, zW0);
      poly(ctx, [A, B, C2, D]); ctx.fillStyle = lg(ctx, A[0], 0, B[0], 0, [[0, S2[1]], [1, S2[2]]]); ctx.fill(); });
    ctx.save(); ctx.globalCompositeOperation = 'soft-light'; poly(ctx, pp(L, [[-Xh, Ht, zW0], [-Xh, Ht, zW1], [-Xh, 0, zW1], [-Xh, 0, zW0]])); ctx.fillStyle = 'rgba(255,220,160,0.5)'; ctx.fill(); ctx.restore();
    mark('walls', ctx);
    /* ---------- the ground: the lane, the strips behind the booths, the road and pavements ---------- */
    ctx.fillStyle = lg(ctx, 0, L.vy, 0, h, [[0, '#c8c2b8'], [0.4, '#b8b0a4'], [1, '#a49a8c']]); ctx.fillRect(0, L.vy, w, h - L.vy);
    [-1, 1].forEach(function (sd) {
      var zA = 0.8, zB = 200, Xb = (L.Xf + L.D) * sd;
      face(ctx, L, [[Xb, 0, zA], [Xb, 0, zB], [sd * (Xh - 2.1), 0, zB], [sd * (Xh - 2.1), 0, zA]], '#8e8a86'); // the road
      face(ctx, L, [[sd * (Xh - 2.1), 0, zA], [sd * (Xh - 2.1), 0, zB], [sd * Xh, 0, zB], [sd * Xh, 0, zA]], '#bdb4a6'); // the pavement
      face(ctx, L, [[sd * (Xh - 2.1), 0.02, zA], [sd * (Xh - 2.1), 0.02, zB], [sd * (Xh - 2.2), 0.02, zB], [sd * (Xh - 2.2), 0.02, zA]], '#d8d0c4'); // kerb
      face(ctx, L, [[sd * (L.Xf + L.D + 0.3), 0, zA], [sd * (L.Xf + L.D + 0.3), 0, zB], [sd * (L.Xf + L.D + 0.42), 0, zB], [sd * (L.Xf + L.D + 0.42), 0, zA]], '#a8a49e');
    });
    // the paving: stones a little lighter or darker than their neighbours, and patches of morning sun
    for (var pz2 = L.zmin * 0.95, row = 0; pz2 < 30; pz2 += 0.75, row++) for (i = -9; i < 9; i++) { if (i === -1) continue; var tv = hash(i * 31 + row, 7071), sx0 = i ? i * 0.5 : -0.5; // the middle stone spans the lane's centre, so no seam runs down it
      if (tv > 0.3 && tv < 0.7) continue; face(ctx, L, [[sx0, 0, pz2], [(i + 1) * 0.5, 0, pz2], [(i + 1) * 0.5, 0, pz2 + 0.75], [sx0, 0, pz2 + 0.75]], tv < 0.3 ? 'rgba(90,80,70,0.06)' : 'rgba(255,250,240,0.10)'); }
    K.dabs(ctx, 700, [['#fff8ec', 0.07], ['#7a6e62', 0.06], ['#d8c8b0', 0.08]], function () { var zq = L.zmin * 0.95 + Math.pow(r(), 1.6) * 28, Q = L.P((r() - 0.5) * 9, 0, zq), sc2 = F / zq; return [Q[0], Q[1], (0.12 + r() * 0.3) * sc2, (0.02 + r() * 0.03) * sc2, (r() * 3) | 0, (r() - 0.5) * 0.3]; });
    ctx.save(); ctx.globalCompositeOperation = 'soft-light';
    for (i = 0; i < 9; i++) { var sz = L.zmin * 1.2 + Math.pow(hash(i, 7101), 1.5) * 26, sxp = (hash(i, 7103) - 0.5) * 2.4, SP2 = L.P(sxp, 0, sz), rr3 = (0.8 + hash(i, 7105) * 1.2) * F / sz;
      ctx.save(); ctx.translate(SP2[0], SP2[1]); ctx.scale(1, 0.32); glow(ctx, 0, 0, rr3, '#fff0c8', 0.55); ctx.restore(); }
    ctx.restore();
    // paving joints in the lane, in perspective
    ctx.strokeStyle = 'rgba(90,80,70,0.2)'; ctx.lineWidth = Math.max(0.6, 0.7 * s); ctx.beginPath();
    for (i = -9; i <= 9; i++) { if (!i) continue; var a = L.P(i * 0.5, 0, L.zmin * 0.9), b2 = L.P(i * 0.5, 0, 200); ctx.moveTo(a[0], a[1]); ctx.lineTo(b2[0], b2[1]); }
    for (var zz = L.zmin * 0.95; zz < 120; zz += 0.75) { var p1 = L.P(-4.5, 0, zz), p2 = L.P(4.5, 0, zz); if (p2[1] - L.vy < 2.5 * s) break; ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); }
    ctx.stroke();
    dots(ctx, 1500, [['#f4ece0', 0.35], ['#6a6058', 0.3]], function () { var yy = lerp(L.vy + h * 0.02, h, Math.pow(r(), 0.8)); return [r() * w, yy, (0.3 + r() * 0.6) * s * (0.4 + (yy - L.vy) / h * 2.6), r() < 0.5 ? 0 : 1]; });
    mark('lane', ctx);
    /* ---------- the booths: shadows first, then each row far to near ---------- */
    var BT = mkBooths(w, h);
    var shc = mk(w, h);
    if (shc) { var sx2 = shc.getContext('2d'); [-1, 1].forEach(function (sd) { BT[sd].forEach(function (b) { boothShadow(sx2, L, b, sd); }); });
      ctx.save(); ctx.filter = 'blur(' + Math.round(3 * s) + 'px)'; ctx.drawImage(shc, 0, 0); ctx.restore(); }
    [-1, 1].forEach(function (sd) { for (var k = BT[sd].length - 1; k >= 0; k--) drawBooth(ctx, L, BT[sd][k], sd); });
    mark('stalls', ctx);
    /* ---------- foreground light ---------- */
    // the near paving darkens a little toward the bottom edge, with warm sun across it; both gradients start from nothing
    ctx.fillStyle = lg(ctx, 0, h * 0.55, 0, h, [[0, 'rgba(40,30,50,0)'], [1, 'rgba(40,30,50,0.14)']]); ctx.fillRect(0, h * 0.55, w, h * 0.45);
    ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = lg(ctx, 0, h * 0.5, 0, h, [[0, 'rgba(255,230,180,0)'], [0.5, 'rgba(255,230,180,0.35)'], [1, 'rgba(255,230,180,0.2)']]); ctx.fillRect(0, h * 0.5, w, h * 0.5); ctx.restore();
    mark('fore', ctx);
    finish(ctx, w, h, '#ffe0b8', 0.12, 0.2, 0.04, '#2a1a20', 0.42);
    mark('finish', ctx);
  }

  function overlayMarket(ctx, w, h, t) {
    var L = mkL(w, h), s = L.s, i;
    // drones crossing above the market
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
    // a Kestrel sidewalk robot rolling down the lane, far to near and back
    var ph2 = (t * 0.035) % 2, u = ph2 < 1 ? ph2 : 2 - ph2, z = lerp(34, 9, u), P2 = L.P(-0.5, 0, z), sc = 0.62 * L.F / z;
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
    // the lane's lower third is open paving (y 0.72..0.95); booths line both sides above it
    anchors: { lane: { y0: 0.72, y1: 0.95 }, secession: { x: 0.47, y: 0.33 } },
    paint: function (ctx, w, h) { ctx.save(); try { paintMarket(ctx, w, h); } catch (e) { PAINT._err = 'vienna_market: ' + String(e && e.stack || e); } finally { ctx.restore(); } },
    overlay: function (ctx, w, h, t) { ctx.save(); try { overlayMarket(ctx, w, h, t); } catch (e) { PAINT._err = 'vienna_market overlay: ' + String(e && e.stack || e); } finally { ctx.restore(); } }
  };
})();
