/* mp_tower.js — the Dark Tower at Marrow Point, Estmark, seen from the headland on a bright morning (ruin "darktower").
   A vine-covered concrete grid-control tower with seabird nests, an old leaning pylon, the sea, distant wind turbines of
   several different designs, and a wildflower meadow. Uses window.MPK (src/scenes/mp_kit.js) at paint time.
   anchors (fractions of the scene column): tower door, pylon base, helmet in the grass, visitor sign, nest ledges. */
(function () {
  'use strict';
  var PAINT = (window.PAINT = window.PAINT || {});
  var A = { door: { x: 0.36, y: 0.655 }, pylon: { x: 0.8, y: 0.69 }, helmet: { x: 0.735, y: 0.742 }, sign: { x: 0.16, y: 0.75 }, nests: { x: 0.36, y: 0.3 }, sun: { x: 0.84, y: 0.17 } };
  function L(w, h) {
    var K = window.MPK, s = K.S(w, h);
    return { s: s, hz: h * 0.44, tx: w * 0.36, tw: Math.min(w * 0.2, 96 * s), tTop: h * 0.165, tBase: h * 0.66, cr: h * 0.215, sun: [w * A.sun.x, h * A.sun.y],
      land: function (x) { var u = x / w; return h * (0.565 + 0.02 * u + 0.01 * Math.sin(u * 7.3) + (u > 0.55 ? (u - 0.55) * (u - 0.55) * 0.42 : 0)); } };
  }
  function turbine(ctx, x, y, sz, kind, ang, col) {
    var K = window.MPK, i;
    ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineCap = 'round';
    if (kind === 'vawt') { // vertical-axis turbine: a twisted cage
      ctx.lineWidth = sz * 0.05; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - sz * 0.75); ctx.stroke();
      for (i = 0; i < 3; i++) { var ph = ang + i * 2.09, dx = Math.sin(ph) * sz * 0.16; ctx.beginPath(); ctx.moveTo(x, y - sz * 0.75); ctx.quadraticCurveTo(x + dx * 2, y - sz * 0.95, x, y - sz * 1.15); ctx.stroke(); }
      ctx.restore(); return;
    }
    ctx.lineWidth = sz * 0.045; ctx.beginPath(); ctx.moveTo(x - sz * 0.02, y); ctx.lineTo(x, y - sz); ctx.lineTo(x + sz * 0.02, y); ctx.fill(); ctx.stroke();
    var n = kind === 'two' ? 2 : 3, L2 = sz * (kind === 'two' ? 0.62 : 0.5);
    ctx.lineWidth = sz * (kind === 'two' ? 0.05 : 0.035);
    for (i = 0; i < n; i++) { var a = ang + i * K.TAU / n; ctx.beginPath(); ctx.moveTo(x, y - sz); ctx.lineTo(x + Math.cos(a) * L2, y - sz + Math.sin(a) * L2); ctx.stroke(); }
    ctx.beginPath(); ctx.arc(x, y - sz, sz * 0.04, 0, K.TAU); ctx.fill(); ctx.restore();
  }
  var TURB = [[0.06, 0.95, 'three'], [0.13, 0.8, 'two'], [0.2, 0.7, 'vawt'], [0.585, 0.9, 'three'], [0.65, 0.75, 'two'], [0.705, 0.62, 'vawt']];
  function ivy(ctx, K, r, x0, y0, x1, y1, s, wid, dens, pal) { // a climbing vine: stem plus heart-shaped leaves, darker in shade
    var n = Math.round(Math.hypot(x1 - x0, y1 - y0) / (2.2 * s) * (dens || 1)), j;
    ctx.save(); ctx.strokeStyle = pal[0]; ctx.lineWidth = 1.4 * s; ctx.beginPath(); ctx.moveTo(x0, y0);
    var mx = (x0 + x1) / 2 + (r() - 0.5) * wid * 2, my = (y0 + y1) / 2; ctx.quadraticCurveTo(mx, my, x1, y1); ctx.stroke();
    var B = [[], [], [], []];
    for (j = 0; j < n; j++) {
      var t = r(), px = K.bez(x0, mx, x1, t) + (r() - 0.5) * wid, py = K.bez(y0, my, y1, t) + (r() - 0.5) * wid * 0.4, Lf = (3.2 + r() * 4.4) * s * (1 - t * 0.35);
      B[(r() * 4) | 0].push([px, py, Lf, Lf * 0.62, -K.PI / 2 + (r() - 0.5) * 2.4]);
    }
    for (j = 0; j < 4; j++) { ctx.fillStyle = pal[j + 1]; ctx.beginPath(); B[j].forEach(function (q) { K.leafPath(ctx, q[0], q[1], q[2], q[3], q[4], true); }); ctx.fill(); }
    ctx.restore();
  }
  function seabird(ctx, x, y, sz, flip) { // a kittiwake sitting on a ledge: white body, grey wing, yellow bill
    ctx.save(); ctx.translate(x, y); if (flip) ctx.scale(-1, 1);
    ctx.fillStyle = '#fbfbf8'; ctx.beginPath(); ctx.ellipse(0, -sz * 0.45, sz * 0.62, sz * 0.42, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(sz * 0.45, -sz * 0.92, sz * 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#a9b3c4'; ctx.beginPath(); ctx.ellipse(-sz * 0.12, -sz * 0.5, sz * 0.48, sz * 0.24, -0.15, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2a2f40'; ctx.beginPath(); ctx.moveTo(-sz * 0.55, -sz * 0.52); ctx.lineTo(-sz * 0.9, -sz * 0.42); ctx.lineTo(-sz * 0.55, -sz * 0.36); ctx.fill();
    ctx.fillStyle = '#f5c842'; ctx.beginPath(); ctx.moveTo(sz * 0.7, -sz * 0.95); ctx.lineTo(sz * 0.98, -sz * 0.88); ctx.lineTo(sz * 0.7, -sz * 0.84); ctx.fill();
    ctx.fillStyle = '#1f2340'; ctx.beginPath(); ctx.arc(sz * 0.52, -sz * 0.98, sz * 0.055, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  function nest(ctx, K, r, x, y, wd, s) {
    ctx.save(); ctx.fillStyle = '#8a6a3e'; ctx.beginPath(); ctx.ellipse(x, y, wd, wd * 0.32, 0, 0, Math.PI); ctx.fill();
    K.batch(ctx, 18, [['#c9a26b', 0.8 * s, 0.9], ['#6a4a26', 0.7 * s, 0.8]], function () { var a = (r() - 0.5) * 2.6, xx = x + (r() - 0.5) * wd * 1.6; return [xx, y + r() * wd * 0.2, xx + Math.cos(a) * wd * 0.6, y + Math.sin(a) * wd * 0.15, r() < 0.6 ? 0 : 1]; });
    ctx.restore();
  }
  PAINT.mp_tower = {
    focus: { x: A.sun.x, y: A.sun.y }, anchors: A, track: 'morning',
    paint: function (ctx, w, h) {
      var K = window.MPK; if (!K) { ctx.fillStyle = '#9cc8e8'; ctx.fillRect(0, 0, w, h); return; }
      var G = L(w, h), s = G.s, r = K.rng(29029), hz = G.hz, i, x, y;
      /* ---------- sky ---------- */
      var SKY = [[0, '#6aa6dc'], [0.45, '#a9d2ee'], [0.8, '#dceef2'], [1, '#fbe9c8']];
      ctx.fillStyle = K.lg(ctx, 0, 0, 0, hz, SKY); ctx.fillRect(0, 0, w, hz + 2);
      K.skyStrokes(ctx, -20 * s, w + 20 * s, 0, hz, SKY, 220, r, s, 0.14, '#fff2d8', '#7aa8d8');
      K.softGlow(ctx, G.sun[0], G.sun[1], w * 0.55, '#fff4d0', 0.55); K.softGlow(ctx, G.sun[0], G.sun[1], 40 * s, '#ffffff', 0.9);
      ctx.fillStyle = '#fffdf2'; ctx.beginPath(); ctx.arc(G.sun[0], G.sun[1], 15 * s, 0, K.TAU); ctx.fill();
      var CL = [[0.22, 0.12, 0.42, 0.05], [0.62, 0.075, 0.3, 0.035], [0.12, 0.3, 0.3, 0.03], [0.5, 0.33, 0.36, 0.028]];
      for (i = 0; i < CL.length; i++) K.cloudForm(ctx, w * CL[i][0], h * CL[i][1], w * CL[i][2], h * CL[i][3], r, { lit: '#ffffff', mid: '#eaf2fa', shade: '#b8cce4', top: '#ffffff', al: 0.95, lx: 0.7, ly: -0.5 });
      /* ---------- sea and far islands ---------- */
      K.ridge(ctx, 0, w * 0.32, 4, function (xx) { return hz - h * (0.012 + 0.016 * K.fbm(xx / w * 5, 71, 3)) * Math.sin(Math.PI * xx / (w * 0.32)); }, hz + 1, '#8fb2c8');
      K.ridge(ctx, w * 0.55, w * 0.78, 4, function (xx) { var u = (xx - w * 0.55) / (w * 0.23); return hz - h * 0.01 * Math.sin(Math.PI * u) * (0.7 + 0.6 * K.fbm(u * 4, 73, 3)); }, hz + 1, '#9dbccf');
      for (i = 0; i < TURB.length; i++) turbine(ctx, w * TURB[i][0], hz - h * 0.004 * (i % 3), h * 0.042 * TURB[i][1], TURB[i][2], 0.4 + i, '#e8f0f6');
      var sea0 = hz, sea1 = h * 0.64;
      ctx.fillStyle = K.lg(ctx, 0, sea0, 0, sea1, [[0, '#7fb6d6'], [0.35, '#5a98c2'], [1, '#3a77a6']]); ctx.fillRect(0, sea0, w, sea1 - sea0);
      K.batch(ctx, 420, [['#ffffff', 0.9 * s, 0.35], ['#2f6694', 1 * s, 0.35], ['#9cc8e2', 0.9 * s, 0.45]], function () {
        var yy = sea0 + Math.pow(r(), 1.4) * (sea1 - sea0), p = (yy - sea0) / (sea1 - sea0), xx = r() * w, l = (4 + p * 18) * s * (0.5 + r());
        return [xx, yy, xx + l, yy, (r() * 3) | 0];
      });
      // sun glitter path: short bright dashes
      K.batch(ctx, 150, [['#fffbe8', 1.1 * s, 0.75], ['#ffffff', 0.8 * s, 0.5]], function () { var yy = sea0 + Math.pow(r(), 1.3) * (sea1 - sea0) * 0.9, sp = (yy - sea0) / (sea1 - sea0); var xx = G.sun[0] + (r() - 0.5) * (14 + sp * 80) * s, l = (2 + sp * 7) * s * (0.5 + r()); return [xx - l, yy, xx + l, yy, r() < 0.5 ? 0 : 1]; });
      K.band(ctx, 0, w, hz - h * 0.01, hz + h * 0.012, '#fff4dc', 0.5);
      /* ---------- headland: far grass, cliff edge on the right, rocks and surf ---------- */
      ctx.save();
      K.ridge(ctx, 0, w, 3, G.land, h, null);
      ctx.fillStyle = K.lg(ctx, 0, h * 0.54, 0, h, [[0, '#8fc070'], [0.18, '#6da858'], [0.5, '#5a9a4c'], [1, '#3f7a3a']]); ctx.fill();
      ctx.restore();
      // shoreline on the right: rocks where the meadow meets the sea, and a line of surf
      K.dabs(ctx, 90, [['#8a8380', 0.95], ['#b9b2aa', 0.9], ['#5f5956', 0.9]], function () { var xx = w * (0.5 + r() * 0.5), yy = G.land(xx) - (1 + r() * 4) * s; return [xx, yy, (3 + r() * 7) * s, (1.6 + r() * 3) * s, (r() * 3) | 0, (r() - 0.5) * 0.3]; });
      K.dabs(ctx, 70, [['#ffffff', 0.8], ['#dff0f8', 0.7]], function () { var xx = w * (0.48 + r() * 0.52), yy = G.land(xx) - (3 + r() * 5) * s; return [xx, yy, (4 + r() * 10) * s, (0.8 + r() * 1.4) * s, r() < 0.6 ? 0 : 1, 0]; });
      // grass texture over the meadow, denser and taller in front
      K.grassField(ctx, w, h * 0.56, h, 5200, [['#a8d47e', 1 * s, 0.55], ['#4f8a42', 1.1 * s, 0.5], ['#7cbc5e', 1 * s, 0.5], ['#d4e89a', 0.8 * s, 0.4]], r, s, 0.15);
      K.dabs(ctx, 260, [['#3f7a3a', 0.25], ['#b8dc88', 0.22]], function () { var xx = r() * w, yy = K.lerp(h * 0.6, h, Math.pow(r(), 0.7)); return [xx, yy, (10 + r() * 30) * s, (2 + r() * 4) * s, r() < 0.5 ? 0 : 1]; });
      /* ---------- gravel path to the door ---------- */
      ctx.save(); ctx.beginPath(); ctx.moveTo(G.tx - 10 * s, G.tBase); ctx.bezierCurveTo(G.tx - 6 * s, h * 0.75, w * 0.18, h * 0.85, w * 0.12, h); ctx.lineTo(w * 0.5, h);
      ctx.bezierCurveTo(w * 0.42, h * 0.86, G.tx + 14 * s, h * 0.75, G.tx + 12 * s, G.tBase); ctx.closePath();
      ctx.fillStyle = K.lg(ctx, 0, G.tBase, 0, h, [[0, '#d8ccb4'], [1, '#bfae90']]); ctx.fill(); ctx.clip();
      K.dots(ctx, 900, [['#efe6d2', 0.8], ['#9a8a70', 0.6], ['#c8b896', 0.7]], function () { return [r() * w, K.lerp(G.tBase, h, Math.pow(r(), 0.8)), (0.5 + r() * 1.4) * s, (r() * 3) | 0]; });
      ctx.restore();
      /* ---------- the old pylon (leaning, vines) ---------- */
      var px = w * A.pylon.x, py = h * A.pylon.y, pH = h * 0.32, pW = 30 * s, lean = 0.13;
      ctx.save(); ctx.translate(px, py); ctx.rotate(lean);
      ctx.strokeStyle = '#7d8590'; ctx.lineWidth = 2.6 * s; ctx.lineCap = 'round';
      var legL = function (t) { return [-pW * (1 - t * 0.78), -pH * t]; }, legR = function (t) { return [pW * (1 - t * 0.78), -pH * t]; };
      ctx.beginPath(); ctx.moveTo(-pW, 0); ctx.lineTo(-pW * 0.22, -pH); ctx.moveTo(pW, 0); ctx.lineTo(pW * 0.22, -pH); ctx.stroke();
      ctx.lineWidth = 1.2 * s; ctx.beginPath();
      for (i = 0; i < 7; i++) { var t0 = i / 7, t1 = (i + 1) / 7, a0 = legL(t0), b0 = legR(t0), a1 = legL(t1), b1 = legR(t1); ctx.moveTo(a0[0], a0[1]); ctx.lineTo(b1[0], b1[1]); ctx.moveTo(b0[0], b0[1]); ctx.lineTo(a1[0], a1[1]); ctx.moveTo(a1[0], a1[1]); ctx.lineTo(b1[0], b1[1]); }
      ctx.stroke();
      // cross-arms and one dangling cable
      ctx.lineWidth = 2.2 * s; ctx.beginPath(); ctx.moveTo(-pW * 1.15, -pH * 0.86); ctx.lineTo(pW * 1.15, -pH * 0.86); ctx.moveTo(-pW * 0.9, -pH * 0.68); ctx.lineTo(pW * 0.9, -pH * 0.68); ctx.stroke();
      ctx.lineWidth = 1 * s; ctx.strokeStyle = '#4a4f5a'; ctx.beginPath(); ctx.moveTo(-pW * 1.1, -pH * 0.86); ctx.quadraticCurveTo(-pW * 1.6, -pH * 0.5, -pW * 1.3, -pH * 0.15); ctx.stroke();
      ctx.fillStyle = '#c9d0da'; [[-1.1, -0.86], [1.1, -0.86], [-0.85, -0.68], [0.85, -0.68]].forEach(function (q) { ctx.beginPath(); ctx.ellipse(q[0] * pW, q[1] * pH + 5 * s, 2 * s, 5 * s, 0, 0, K.TAU); ctx.fill(); });
      ctx.restore();
      var IV = ['#2f5a2a', '#2f6a34', '#3f8a40', '#5aa84a', '#8ccc66'];
      ivy(ctx, K, r, px - pW * 0.9, py, px - pW * 0.2 + pH * 0.08, py - pH * 0.62, s, 9 * s, 1.4, IV);
      ivy(ctx, K, r, px + pW * 0.9, py, px + pW * 0.5 + pH * 0.05, py - pH * 0.4, s, 8 * s, 1.2, IV);
      /* ---------- the tower ---------- */
      var tx = G.tx, tw = G.tw, top = G.tTop, base = G.tBase, crY = G.cr, crH = h * 0.06, crW = tw * 1.55;
      var lit = '#c9c4ba', mid = '#a8a39b', shade = '#77737a', dark = '#4c4a56';
      // shaft (slight taper), lit on the right
      ctx.save(); ctx.beginPath(); ctx.moveTo(tx - tw * 0.5, base); ctx.lineTo(tx - tw * 0.42, crY + crH); ctx.lineTo(tx + tw * 0.42, crY + crH); ctx.lineTo(tx + tw * 0.5, base); ctx.closePath();
      ctx.fillStyle = K.lg(ctx, tx - tw * 0.5, 0, tx + tw * 0.5, 0, [[0, shade], [0.45, mid], [0.62, lit], [1, '#e2ddd0']]); ctx.fill(); ctx.clip();
      // weathering streaks and window bands
      K.batch(ctx, 160, [['#6a6670', 1.2 * s, 0.22], ['#f4f0e6', 1 * s, 0.18], ['#3f4a34', 1.4 * s, 0.18]], function () { var xx = tx + (r() - 0.5) * tw, yy = K.lerp(crY, base, r()); return [xx, yy, xx + (r() - 0.5) * s, yy + (6 + r() * 26) * s, (r() * 3) | 0]; });
      for (y = crY + crH + h * 0.035; y < base - h * 0.06; y += h * 0.045) {
        for (i = -1; i <= 1; i++) { var wx = tx + i * tw * 0.27 - tw * 0.08; ctx.fillStyle = '#2c2a36'; ctx.fillRect(wx, y, tw * 0.16, h * 0.018); ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(wx, y, tw * 0.16, h * 0.003); }
        ctx.fillStyle = 'rgba(40,36,50,.25)'; ctx.fillRect(tx - tw, y + h * 0.026, tw * 2, 2 * s);
      }
      ctx.restore();
      // control room (wider, cantilevered) with slanted, partly broken windows
      ctx.save(); ctx.beginPath(); ctx.moveTo(tx - crW * 0.5, crY); ctx.lineTo(tx + crW * 0.5, crY); ctx.lineTo(tx + crW * 0.44, crY + crH); ctx.lineTo(tx - crW * 0.44, crY + crH); ctx.closePath();
      ctx.fillStyle = '#26283a'; ctx.fill();
      for (i = 0; i < 6; i++) {
        var gx0 = tx - crW * 0.47 + i * crW * 0.157, gx1 = gx0 + crW * 0.14, broken = (i === 1 || i === 4);
        ctx.fillStyle = broken ? '#1a1b28' : K.lg(ctx, gx0, crY, gx1, crY + crH, [[0, '#a8c8dc'], [0.5, '#5f7f98'], [1, '#3a4a64']]);
        ctx.beginPath(); ctx.moveTo(gx0, crY + 3 * s); ctx.lineTo(gx1, crY + 3 * s); ctx.lineTo(gx1 - crW * 0.01, crY + crH - 3 * s); ctx.lineTo(gx0 - crW * 0.01, crY + crH - 3 * s); ctx.closePath(); ctx.fill();
        if (!broken) { ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1.2 * s; ctx.beginPath(); ctx.moveTo(gx0 + crW * 0.02, crY + 6 * s); ctx.lineTo(gx0 + crW * 0.07, crY + crH * 0.5); ctx.stroke(); }
        else { ctx.strokeStyle = 'rgba(200,220,235,.7)'; ctx.lineWidth = 0.8 * s; ctx.beginPath(); ctx.moveTo(gx0, crY + 3 * s); ctx.lineTo(gx0 + crW * 0.05, crY + crH * 0.4); ctx.lineTo(gx0 + crW * 0.02, crY + crH * 0.7); ctx.stroke(); }
      }
      ctx.restore();
      ctx.fillStyle = '#d8d3c8'; ctx.fillRect(tx - crW * 0.53, crY - h * 0.012, crW * 1.06, h * 0.012); // roof slab
      ctx.fillStyle = '#9a958e'; ctx.fillRect(tx - crW * 0.5, crY + crH, crW, h * 0.008); // balcony slab
      ctx.strokeStyle = '#6a6672'; ctx.lineWidth = 1 * s; ctx.beginPath();
      for (i = 0; i <= 14; i++) { x = tx - crW * 0.5 + i * crW / 14; ctx.moveTo(x, crY + crH); ctx.lineTo(x, crY + crH - h * 0.012); } ctx.moveTo(tx - crW * 0.5, crY + crH - h * 0.012); ctx.lineTo(tx + crW * 0.5, crY + crH - h * 0.012); ctx.stroke();
      // mast and dish on the roof
      ctx.strokeStyle = '#6a6672'; ctx.lineWidth = 2 * s; ctx.beginPath(); ctx.moveTo(tx + crW * 0.2, crY - h * 0.012); ctx.lineTo(tx + crW * 0.2, top - h * 0.03); ctx.stroke();
      ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.moveTo(tx + crW * 0.2, top); ctx.lineTo(tx + crW * 0.1, crY - h * 0.012); ctx.moveTo(tx + crW * 0.2, top); ctx.lineTo(tx + crW * 0.3, crY - h * 0.012); ctx.stroke();
      ctx.fillStyle = '#e6e2d8'; ctx.beginPath(); ctx.ellipse(tx - crW * 0.18, crY - h * 0.022, 9 * s, 6 * s, -0.5, 0, K.TAU); ctx.fill(); ctx.fillStyle = '#b8b2a8'; ctx.beginPath(); ctx.ellipse(tx - crW * 0.17, crY - h * 0.021, 5 * s, 3 * s, -0.5, 0, K.TAU); ctx.fill();
      // door, steps and the faded sign
      var dw = tw * 0.34, dh = h * 0.05;
      ctx.fillStyle = '#3a3846'; K.rrect(ctx, tx - dw / 2, base - dh, dw, dh, 3 * s); ctx.fill();
      ctx.fillStyle = '#5a5664'; ctx.fillRect(tx - dw / 2 + 3 * s, base - dh + 3 * s, dw / 2 - 4 * s, dh - 3 * s); ctx.fillStyle = '#4a4756'; ctx.fillRect(tx + 1 * s, base - dh + 3 * s, dw / 2 - 4 * s, dh - 3 * s);
      ctx.fillStyle = '#cfc8b8'; ctx.fillRect(tx - dw * 0.8, base, dw * 1.6, 3 * s); ctx.fillRect(tx - dw * 0.95, base + 3 * s, dw * 1.9, 3 * s);
      ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.font = '700 ' + Math.round(5.6 * s) + 'px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('GRID CONTROL', tx, base - dh - 4 * s);
      // vines climbing the tower: big masses at the base and up the shaded side, a curtain hanging from the balcony
      for (i = 0; i < 9; i++) { var vx = tx - tw * 0.48 + r() * tw * 0.35, vtop = K.lerp(crY + crH, base - h * 0.08, Math.pow(r(), 0.6)); ivy(ctx, K, r, vx, base, vx + (r() - 0.3) * tw * 0.3, vtop, s, 7 * s, 1.6, IV); }
      for (i = 0; i < 4; i++) { var vx2 = tx + tw * 0.15 + r() * tw * 0.3; ivy(ctx, K, r, vx2, base, vx2 + (r() - 0.5) * tw * 0.2, base - h * (0.06 + r() * 0.12), s, 6 * s, 1.4, IV); }
      for (i = 0; i < 7; i++) { var hx = tx - crW * 0.45 + i * crW * 0.15 + r() * 6 * s; ivy(ctx, K, r, hx, crY + crH, hx + (r() - 0.5) * 8 * s, crY + crH + h * (0.03 + r() * 0.07), s, 4 * s, 1.3, IV); }
      K.clump(ctx, tx - tw * 0.5, base - h * 0.02, 22 * s, ['#1f4022', '#2f5a2a', '#3f7a3a', '#5aa84a', '#8ccc66'], r, 0.7, -0.6, false, 1);
      K.clump(ctx, tx + tw * 0.55, base - h * 0.01, 16 * s, ['#1f4022', '#2f5a2a', '#3f7a3a', '#5aa84a', '#8ccc66'], r, 0.7, -0.6, false, 1);
      // nests and seabirds on the window ledges
      var ledges = [[-0.27, 0], [0.27, 0], [-0.27, 2], [0.27, 3], [0, 1], [0.27, 5], [-0.27, 6]];
      for (i = 0; i < ledges.length; i++) {
        var ly = crY + crH + h * 0.035 + ledges[i][1] * h * 0.045 + h * 0.018, lx = tx + ledges[i][0] * tw - tw * 0.08 + tw * 0.08;
        if (ly > base - h * 0.07) continue;
        nest(ctx, K, r, lx, ly, 5.5 * s, s); seabird(ctx, lx + (r() - 0.5) * 3 * s, ly - 1 * s, 6.5 * s, i % 2 === 0);
        ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(lx - 2 * s, ly + 1 * s, 1.4 * s, (6 + r() * 10) * s);
      }
      seabird(ctx, tx - crW * 0.3, crY + crH - 1 * s, 6 * s, false); seabird(ctx, tx + crW * 0.36, crY - h * 0.012, 6 * s, true);
      /* ---------- foreground: wildflowers, a visitor sign, rocks ---------- */
      var sgx = w * A.sign.x, sgy = h * A.sign.y;
      ctx.fillStyle = '#7a5a3a'; ctx.fillRect(sgx - 2 * s, sgy - 30 * s, 4 * s, 30 * s);
      ctx.fillStyle = '#9a7248'; K.rrect(ctx, sgx - 30 * s, sgy - 45 * s, 60 * s, 21 * s, 3 * s); ctx.fill(); ctx.fillStyle = '#b88a58'; ctx.fillRect(sgx - 28 * s, sgy - 43 * s, 56 * s, 1.5 * s);
      ctx.fillStyle = '#f6ecd6'; ctx.font = '800 ' + (5.2 * s).toFixed(1) + 'px Nunito, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('THE DARK TOWER', sgx, sgy - 35.5 * s); ctx.font = '700 ' + (4.2 * s).toFixed(1) + 'px Nunito, sans-serif'; ctx.fillText('visitors welcome', sgx, sgy - 29 * s);
      // rocks: shaded bodies with lit tops
      for (i = 0; i < 7; i++) { var rx = i < 3 ? w * (0.02 + r() * 0.1) : w * (0.86 + r() * 0.12), ry = h * (0.82 + r() * 0.16), rw = (10 + r() * 14) * s, rh = rw * (0.5 + r() * 0.2);
        ctx.fillStyle = '#6f6a66'; ctx.beginPath(); ctx.ellipse(rx, ry, rw, rh, 0, Math.PI, 0); ctx.lineTo(rx + rw, ry + rh * 0.2); ctx.lineTo(rx - rw, ry + rh * 0.2); ctx.fill();
        ctx.fillStyle = '#a9a39b'; ctx.beginPath(); ctx.ellipse(rx - rw * 0.15, ry - rh * 0.45, rw * 0.62, rh * 0.42, -0.1, 0, K.TAU); ctx.fill(); ctx.fillStyle = '#5a9a4c'; ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.ellipse(rx + rw * 0.4, ry - rh * 0.2, rw * 0.3, rh * 0.18, 0, 0, K.TAU); ctx.fill(); ctx.globalAlpha = 1; }
      // wildflowers in drifts, kept off the path
      var FL = [['#b47ad8', 0.9], ['#ffd34a', 0.95], ['#ffffff', 0.9], ['#ff8fb0', 0.85], ['#8a5ac0', 0.8]];
      var onPath = function (xx, yy) { var t = (yy - G.tBase) / (h - G.tBase); return t > 0 && xx > K.lerp(G.tx - 12 * s, w * 0.1, t * t) - 4 * s && xx < K.lerp(G.tx + 14 * s, w * 0.52, t * t) + 4 * s; };
      K.dots(ctx, 1100, FL, function () { var yy = K.lerp(h * 0.58, h, Math.pow(r(), 0.8)), p = (yy - h * 0.58) / (h * 0.42), xx = r() * w; if (onPath(xx, yy) || K.fbm2(xx / w * 5, yy / h * 9, 51, 3) < 0.47) return null; return [xx, yy, (0.5 + p * 1.4 + r() * 0.4) * s, (r() * 5) | 0]; });
      K.batch(ctx, 700, [['#3f7a3a', 1.2 * s, 0.6], ['#7cbc5e', 1 * s, 0.55]], function () { var x0 = r() * w, y0 = K.lerp(h * 0.72, h, r()), l = (5 + r() * 12) * s; return [x0, y0, x0 + (r() - 0.5) * l * 0.4, y0 - l, r() < 0.5 ? 0 : 1]; });
      K.finish(ctx, w, h, '#ffe2b0', 0.18, 0.22, 0.05, '#1a2a3a', 0.4);
    },
    overlay: function (ctx, w, h, t) {
      var K = window.MPK; if (!K) return; var G = L(w, h), s = G.s, i, hz = G.hz;
      // turbine rotors turning (redrawn over the painted ones)
      for (i = 0; i < TURB.length; i++) { var sp = TURB[i][2] === 'vawt' ? 1.2 : 0.7 + i * 0.07; ctx.globalAlpha = 0.9; turbine(ctx, w * TURB[i][0], hz - h * 0.004 * (i % 3), h * 0.042 * TURB[i][1], TURB[i][2], 0.4 + i + t * sp, '#f4f8fb'); }
      ctx.globalAlpha = 1;
      // glitter twinkles on the sea
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (i = 0; i < 26; i++) { var ph = (t * 0.9 + i * 0.37) % 1, yy = hz + ((i * 53) % 97) / 97 * (h * 0.18), xx = G.sun[0] + (((i * 71) % 89) / 89 - 0.5) * (20 + (yy - hz) / (h * 0.2) * 90) * s;
        ctx.globalAlpha = Math.sin(ph * Math.PI) * 0.8; ctx.fillStyle = '#ffffff'; ctx.fillRect(xx - 2 * s, yy, 4 * s, 1 * s); }
      ctx.restore();
      // gulls gliding over the sea and around the tower
      for (i = 0; i < 5; i++) {
        var cx = ((t * (8 + i * 3) * s + i * w * 0.27) % (w * 1.3)) - w * 0.15, cy = h * (0.12 + i * 0.05) + Math.sin(t * 0.6 + i) * 8 * s, f = Math.sin(t * (3 + i * 0.4) + i);
        ctx.strokeStyle = 'rgba(40,46,70,.75)'; ctx.lineWidth = 1.6 * s; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx - 8 * s, cy - f * 3 * s); ctx.quadraticCurveTo(cx - 4 * s, cy - 4 * s - f * 2 * s, cx, cy); ctx.quadraticCurveTo(cx + 4 * s, cy - 4 * s - f * 2 * s, cx + 8 * s, cy - f * 3 * s); ctx.stroke();
      }
      // a soft breeze shimmer across the meadow
      ctx.save(); ctx.globalAlpha = 0.07 + 0.04 * Math.sin(t * 0.8); ctx.fillStyle = '#fffbe0'; var bx = ((t * 40 * s) % (w * 1.6)) - w * 0.3; K.haze(ctx, bx - w * 0.3, h * 0.66, bx + w * 0.3, h * 0.76, '#fffbe0', 1); ctx.restore();
    }
  };
})();
