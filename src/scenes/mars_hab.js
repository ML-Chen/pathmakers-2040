/* scenes/mars_hab.js - inside the main habitat module at Jezero Station, Mars (a game forecast), late afternoon.
   PAINT.mars_hab. We look down the length of a long round hab module, like a tunnel: white padded wall panels, ribs
   that ring the module, a light strip along the top and cable trays. At the far end a big window shows Mars outside:
   the butterscotch sky (fine red dust in thin air), the mesas of the old river delta, the pink glow of the greenhouse
   tunnels, the solar field, a parked rover, and the brown wall of the dust storm rising in the east. Along the left wall,
   the control desk with the station's screens (power, the storm track, the battery); along the right wall, greenhouse
   shelves under pink grow lights with tomatoes and greens. A striped runner lies down the middle of the deck. People in
   here wear normal clothes: the module is pressurised. The lower third is calm floor.
   Uses the painting utilities in window.CHINA_KIT (src/scenes/_china_kit.js). Everything is seeded. */
(function () {
  'use strict';
  var PAINT = (window.PAINT = window.PAINT || {});
  var K, PI = Math.PI, TAU = PI * 2;
  var rng, hash, lerp, mix, rgba, lg, rg, S, rrect, softGlow, haze, finish, batch, dots, dabs, qell, clump, ridge, fbm, glowSpr, poly;
  function bind() {
    if (K) return true; K = window.CHINA_KIT; if (!K) return false;
    rng = K.rng; hash = K.hash; lerp = K.lerp; mix = K.mix; rgba = K.rgba; lg = K.lg; rg = K.rg; S = K.S; rrect = K.rrect; softGlow = K.softGlow; haze = K.haze;
    finish = K.finish; batch = K.batch; dots = K.dots; dabs = K.dabs; qell = K.qell; clump = K.clump; ridge = K.ridge; fbm = K.fbm; glowSpr = K.glowSpr; poly = K.poly;
    return true;
  }
  var LINE = '#3a2e2c', FV = 0.4, FA = Math.asin(FV);   // the deck sits 0.4 of the radius below the module's axis
  function ink(ctx, s, a, wd) { ctx.strokeStyle = rgba(LINE, a == null ? 0.5 : a); ctx.lineWidth = (wd || 0.7) * s; ctx.lineJoin = 'round'; ctx.stroke(); }

  var LM = null;
  function layout(w, h) {
    var key = w + 'x' + h; if (LM && LM.key === key) return LM;
    var s = S(w, h), L = { key: key, s: s, w: w, h: h };
    L.cx = w / 2; L.cy = h * 0.3; L.Rf = h * 0.22;
    // the module is drawn a little narrower than it is tall, so its side walls fit on a phone
    L.ax = Math.min(1, (w * 0.5) / (L.Rf * 1.9));
    L.rings = [L.Rf, L.Rf * 1.18, L.Rf * 1.42, L.Rf * 1.75, L.Rf * 2.25, L.Rf * 3.1];
    L.win = { x0: L.cx - L.Rf * L.ax * 0.86, x1: L.cx + L.Rf * L.ax * 0.86, y0: L.cy - L.Rf * 0.7, y1: L.cy + L.Rf * 0.3 };
    LM = L; return L;
  }
  // a point in the module: lateral u and height v as fractions of the ring radius R (v = 0.4 is the deck)
  function P(L, R, u, v) { return [L.cx + u * R * L.ax, L.cy + v * R]; }
  function arc(ctx, L, R, a0, a1, ccw) { ctx.ellipse(L.cx, L.cy, R * L.ax, R, 0, a0, a1, !!ccw); }

  /* ---------------- Mars through the window ---------------- */
  function outside(ctx, L) {
    var W = L.win, s = L.s, r = rng(9101), i, hz = lerp(W.y0, W.y1, 0.62), x0 = W.x0, x1 = W.x1, ww = x1 - x0;
    ctx.fillStyle = lg(ctx, 0, W.y0, 0, hz, [[0, '#a8724e'], [0.5, '#cf9a6c'], [1, '#eccb9c']]); ctx.fillRect(x0, W.y0, ww, hz - W.y0 + 1);
    softGlow(ctx, x0 + ww * 0.22, W.y0 + (hz - W.y0) * 0.3, ww * 0.35, '#fff0d8', 0.35); softGlow(ctx, x0 + ww * 0.22, W.y0 + (hz - W.y0) * 0.3, 6 * s, '#ffffff', 0.9);
    // the storm wall rising from the east (right)
    for (i = 0; i < 70; i++) { var u = Math.pow(r(), 0.7), bx = lerp(x0 + ww * 0.42, x1 + ww * 0.1, u), top = (hz - W.y0) * 0.85 * Math.pow(u, 0.8), by = hz - r() * top, R = (5 + r() * 7 + u * 8) * s;
      var lit = r() < 0.4; ctx.fillStyle = lit ? '#c89470' : (r() < 0.5 ? '#a87050' : '#946048'); ctx.beginPath(); ctx.arc(bx, by, R, 0, TAU); ctx.fill(); }
    haze(ctx, x0 + ww * 0.3, hz - (hz - W.y0) * 0.5, x1 + ww * 0.3, hz + 4 * s, '#d8a880', 0.45);
    // mesas of the delta on the left, the plain, the greenhouse tunnels, solar panels and a rover
    ctx.fillStyle = '#b8805c'; [[0.04, 0.2, 0.16], [0.26, 0.15, 0.1]].forEach(function (m) { var mx = x0 + ww * m[0], mw = ww * m[1], mh = (hz - W.y0) * m[2]; ctx.beginPath(); ctx.moveTo(mx, hz); ctx.lineTo(mx + mw * 0.12, hz - mh); ctx.lineTo(mx + mw * 0.86, hz - mh); ctx.lineTo(mx + mw, hz); ctx.fill(); ctx.strokeStyle = 'rgba(120,70,40,0.4)'; ctx.lineWidth = 0.5 * s; ctx.beginPath(); for (var b = 1; b < 4; b++) { ctx.moveTo(mx + mw * 0.06, hz - mh * b / 4); ctx.lineTo(mx + mw * 0.94, hz - mh * b / 4); } ctx.stroke(); });
    ctx.fillStyle = lg(ctx, 0, hz, 0, W.y1, [[0, '#d08a58'], [1, '#b06a40']]); ctx.fillRect(x0, hz, ww, W.y1 - hz + 1);
    dabs(ctx, 50, [['#8a4a2c', 0.6], ['#e8a878', 0.4]], function (j) { return [x0 + r() * ww, hz + 2 * s + r() * (W.y1 - hz), (1 + r() * 3) * s, 0.6 * s, j % 3 === 0 ? 1 : 0, 0]; });
    [[0.08, 0.2], [0.3, 0.16]].forEach(function (g) { var gx = x0 + ww * g[0], gw = ww * g[1], gy = hz + (W.y1 - hz) * 0.42, gh = 5 * s;
      softGlow(ctx, gx + gw / 2, gy - gh / 2, gw * 0.7, '#ff8ad0', 0.35); ctx.fillStyle = '#f2b8dc'; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.quadraticCurveTo(gx, gy - gh * 1.6, gx + gh, gy - gh * 1.6); ctx.lineTo(gx + gw - gh, gy - gh * 1.6); ctx.quadraticCurveTo(gx + gw, gy - gh * 1.6, gx + gw, gy); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 0.5 * s; ctx.beginPath(); for (var q = 1; q < 6; q++) { ctx.moveTo(gx + gw * q / 6, gy); ctx.lineTo(gx + gw * q / 6, gy - gh * 1.5); } ctx.stroke(); ctx.fillStyle = '#4a8a4a'; ctx.fillRect(gx + 1 * s, gy - 1.6 * s, gw - 2 * s, 1.2 * s); });
    ctx.fillStyle = '#2e3a6a'; for (i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x0 + ww * (0.52 + i * 0.05), hz + 3 * s + i * 0.6 * s); ctx.lineTo(x0 + ww * (0.56 + i * 0.05), hz + 3 * s + i * 0.6 * s); ctx.lineTo(x0 + ww * (0.555 + i * 0.05), hz + 5 * s + i * 0.6 * s); ctx.lineTo(x0 + ww * (0.515 + i * 0.05), hz + 5 * s + i * 0.6 * s); ctx.fill(); }
    var rx = x0 + ww * 0.72, ry = W.y1 - (W.y1 - hz) * 0.25; ctx.fillStyle = '#f2ece2'; ctx.beginPath(); rrect(ctx, rx - 12 * s, ry - 8 * s, 24 * s, 7 * s, 2.4 * s); ctx.fill(); ctx.fillStyle = '#e8783a'; ctx.fillRect(rx - 12 * s, ry - 3.6 * s, 24 * s, 1.2 * s); ctx.fillStyle = '#2a3a5a'; ctx.fillRect(rx + 4 * s, ry - 7 * s, 6 * s, 2.6 * s);
    ctx.fillStyle = '#2a2a30'; [-8, 0, 8].forEach(function (d) { ctx.beginPath(); ctx.arc(rx + d * s, ry, 2.2 * s, 0, TAU); ctx.fill(); });
    ctx.fillStyle = 'rgba(60,30,20,0.35)'; ctx.beginPath(); qell(ctx, rx + 6 * s, ry + 2 * s, 16 * s, 1.6 * s, 0); ctx.fill();
  }

  /* ---------------- the module ---------------- */
  function shell(ctx, L) {
    var w = L.w, h = L.h, s = L.s, cx = L.cx, cy = L.cy, i, k, R = L.rings;
    // every surface of the round module: lit from the ceiling strip, darker toward us
    ctx.fillStyle = rg(ctx, cx, cy - L.Rf * 0.3, L.Rf * 0.6, Math.max(w, h) * 0.9, [[0, '#f4f0e8'], [0.45, '#e2ddd2'], [1, '#b8b0a4']]); ctx.fillRect(0, 0, w, h);
    // alternate panel bands between the ribs, with seams running toward the far end
    for (k = R.length - 1; k > 0; k--) {
      ctx.beginPath(); arc(ctx, L, R[k], PI - FA, TAU + FA); arc(ctx, L, R[k - 1], TAU + FA, PI - FA, true); ctx.closePath();
      ctx.fillStyle = k % 2 ? 'rgba(255,255,255,0.18)' : 'rgba(120,100,80,0.06)'; ctx.fill();
    }
    ctx.strokeStyle = 'rgba(120,108,96,0.4)'; ctx.lineWidth = 0.8 * s; ctx.beginPath();
    for (i = 0; i <= 12; i++) { var a = PI - FA + i * (PI + 2 * FA) / 12; ctx.moveTo(cx + Math.cos(a) * L.Rf * L.ax, cy + Math.sin(a) * L.Rf); ctx.lineTo(cx + Math.cos(a) * R[R.length - 1] * 1.4 * L.ax, cy + Math.sin(a) * R[R.length - 1] * 1.4); } ctx.stroke();
    // little round vents and quilting dots on the panels
    dots(ctx, 120, [['#c8c0b4', 0.7]], function (j) { var kk = 1 + (j % (R.length - 1)), rr = lerp(R[kk - 1], R[kk], 0.5), a = PI - FA + hash(j, 3) * (PI + 2 * FA); return [cx + Math.cos(a) * rr * L.ax, cy + Math.sin(a) * rr, 0.7 * s * rr / L.Rf, 0]; });
    // the deck
    var fl = [P(L, L.Rf, -Math.cos(FA), FV), P(L, L.Rf, Math.cos(FA), FV)], far = h * 6;
    poly(ctx, [fl[0], fl[1], P(L, far, Math.cos(FA), FV), P(L, far, -Math.cos(FA), FV)]);
    ctx.fillStyle = lg(ctx, 0, fl[0][1], 0, h, [[0, '#a8a6aa'], [0.5, '#8e8c94'], [1, '#6e6c76']]); ctx.fill();
    ctx.save(); ctx.clip();
    ctx.strokeStyle = 'rgba(40,40,50,0.4)'; ctx.lineWidth = 0.7 * s; ctx.beginPath();
    for (i = -8; i <= 8; i++) { var u = i / 8 * Math.cos(FA); ctx.moveTo.apply(ctx, P(L, L.Rf, u, FV)); ctx.lineTo.apply(ctx, P(L, far, u, FV)); }
    for (i = 0; i < 16; i++) { var rr2 = L.Rf * Math.pow(1.2, i); var a1 = P(L, rr2, -1, FV), b1 = P(L, rr2, 1, FV); ctx.moveTo(a1[0], a1[1]); ctx.lineTo(b1[0], b1[1]); }
    ctx.stroke();
    // a striped runner down the middle, and a warm patch of window light on the deck
    poly(ctx, [P(L, L.Rf, -0.2, FV), P(L, L.Rf, 0.2, FV), P(L, far, 0.2, FV), P(L, far, -0.2, FV)]); ctx.fillStyle = '#9a5a46'; ctx.fill();
    ctx.save(); ctx.clip(); ctx.fillStyle = '#e0c69a'; for (i = 0; i < 2; i++) { var uu = i ? 0.12 : -0.16; poly(ctx, [P(L, L.Rf, uu, FV), P(L, L.Rf, uu + 0.04, FV), P(L, far, uu + 0.04, FV), P(L, far, uu, FV)]); ctx.fill(); } ctx.restore();
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = lg(ctx, 0, fl[0][1], 0, h * 0.8, [[0, 'rgba(255,190,130,0.22)'], [1, 'rgba(255,190,130,0)']]);
    poly(ctx, [P(L, L.Rf, -0.55, FV), P(L, L.Rf, 0.55, FV), P(L, far, 0.9 * 3, FV), P(L, far, -0.9 * 3, FV)]); ctx.fill();
    ctx.restore();
    // the end wall with the big window
    ctx.beginPath(); arc(ctx, L, L.Rf, PI - FA, TAU + FA); ctx.closePath(); ctx.fillStyle = '#ece6dc'; ctx.fill();
    var W = L.win;
    ctx.save(); ctx.beginPath(); rrect(ctx, W.x0, W.y0, W.x1 - W.x0, W.y1 - W.y0, L.Rf * 0.2); ctx.clip(); outside(ctx, L);
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.beginPath(); ctx.moveTo(W.x0 + (W.x1 - W.x0) * 0.1, W.y0); ctx.lineTo(W.x0 + (W.x1 - W.x0) * 0.3, W.y0); ctx.lineTo(W.x0 + (W.x1 - W.x0) * 0.12, W.y1); ctx.lineTo(W.x0 - 4 * s, W.y1); ctx.fill(); ctx.restore();
    ctx.lineWidth = 5 * s; ctx.strokeStyle = '#9a9488'; ctx.beginPath(); rrect(ctx, W.x0, W.y0, W.x1 - W.x0, W.y1 - W.y0, L.Rf * 0.2); ctx.stroke();
    ctx.lineWidth = 2.4 * s; ctx.strokeStyle = '#f8f4ec'; ctx.stroke();
    ctx.lineWidth = 3 * s; ctx.strokeStyle = '#b4ada2'; ctx.beginPath(); ctx.moveTo((W.x0 + W.x1) / 2, W.y0); ctx.lineTo((W.x0 + W.x1) / 2, W.y1); ctx.stroke();
    // the sill, with a small Earth photo and a tomato seedling
    ctx.fillStyle = '#d8d0c4'; ctx.fillRect(W.x0 - 6 * s, W.y1 + 2 * s, W.x1 - W.x0 + 12 * s, 3 * s); ctx.beginPath(); ctx.rect(W.x0 - 6 * s, W.y1 + 2 * s, W.x1 - W.x0 + 12 * s, 3 * s); ink(ctx, s, 0.35);
    ctx.fillStyle = '#5a4a3a'; ctx.fillRect(W.x0 + 4 * s, W.y1 - 8 * s, 9 * s, 10 * s); ctx.fillStyle = '#2a4a8a'; ctx.fillRect(W.x0 + 5.2 * s, W.y1 - 6.8 * s, 6.6 * s, 7.6 * s); ctx.fillStyle = '#6aa0e0'; ctx.beginPath(); ctx.arc(W.x0 + 8.5 * s, W.y1 - 3 * s, 2.4 * s, 0, TAU); ctx.fill();
    ctx.fillStyle = '#c8673f'; ctx.fillRect(W.x1 - 12 * s, W.y1 - 4 * s, 7 * s, 6 * s); ctx.fillStyle = '#4a8a3a'; ctx.beginPath(); qell(ctx, W.x1 - 10 * s, W.y1 - 7 * s, 3 * s, 2 * s, -0.5); qell(ctx, W.x1 - 7 * s, W.y1 - 8 * s, 3 * s, 2 * s, 0.5); ctx.fill();
    // a soft butterscotch glow from the window
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; softGlow(ctx, cx, (W.y0 + W.y1) / 2, L.Rf * 2.2, '#ffb878', 0.12); ctx.restore();
    // ribs ringing the module, nearest last (thicker), with a dark seam and a bright edge
    for (k = 1; k < R.length; k++) {
      var t = k / (R.length - 1), wd = (3 + t * 9) * s;
      ctx.beginPath(); arc(ctx, L, R[k], PI - FA, TAU + FA); ctx.lineCap = 'butt';
      ctx.strokeStyle = rgba('#5a4e46', 0.45); ctx.lineWidth = wd + 2 * s; ctx.stroke(); ctx.strokeStyle = '#d4cec4'; ctx.lineWidth = wd; ctx.stroke();
      ctx.beginPath(); arc(ctx, L, R[k] - wd * 0.3, PI - FA, TAU + FA); ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = wd * 0.22; ctx.stroke();
    }
    ctx.beginPath(); arc(ctx, L, L.Rf, PI - FA, TAU + FA); ctx.strokeStyle = '#a8a094'; ctx.lineWidth = 3 * s; ctx.stroke();
    // the light strip along the top and cable trays
    ctx.strokeStyle = '#fffaf0'; ctx.lineWidth = 4 * s; ctx.beginPath(); ctx.moveTo(cx, cy - L.Rf - 1 * s); ctx.lineTo(cx, -2); ctx.stroke();
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(255,240,210,0.25)'; ctx.lineWidth = 14 * s; ctx.stroke(); ctx.restore();
    [-0.62, 0.62].forEach(function (u) { var v = -Math.sqrt(1 - u * u) * 0.98, a = P(L, L.Rf, u, v), b = P(L, R[R.length - 1] * 1.3, u, v); ctx.strokeStyle = '#8a8478'; ctx.lineWidth = 2.6 * s; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.strokeStyle = u < 0 ? '#e8783a' : '#2aa89a'; ctx.lineWidth = 1 * s; ctx.stroke(); });
  }

  // a quad on the wall at height range [v0, v1] (v up is negative) between depths R0..R1, on side sd (-1 left, 1 right)
  function wallQuad(L, R0, R1, v0, v1, sd, inset) { var u = function (v) { return sd * Math.sqrt(Math.max(0, 1 - v * v)) * (inset || 0.97); }; return [P(L, R0, u(v0), v0), P(L, R1, u(v0), v0), P(L, R1, u(v1), v1), P(L, R0, u(v1), v1)]; }

  function console_(ctx, L) {
    var s = L.s, R0 = L.Rf * 1.12, R1 = L.Rf * 1.85, i;
    // the desk: top surface and front face, against the left wall
    var dv = 0.08, du0 = -0.93, du1 = -0.68;
    poly(ctx, [P(L, R0, du0, dv), P(L, R1, du0, dv), P(L, R1, du1, dv), P(L, R0, du1, dv)]); ctx.fillStyle = '#e8e2d6'; ctx.fill(); ink(ctx, s, 0.45);
    poly(ctx, [P(L, R0, du1, dv), P(L, R1, du1, dv), P(L, R1, du1, FV), P(L, R0, du1, FV)]); ctx.fillStyle = lg(ctx, 0, P(L, R1, 0, dv)[1], 0, P(L, R1, 0, FV)[1], [[0, '#5a6278'], [1, '#3e4458']]); ctx.fill(); ink(ctx, s, 0.5);
    ctx.fillStyle = '#e8783a'; poly(ctx, [P(L, R0, du1, dv + 0.03), P(L, R1, du1, dv + 0.03), P(L, R1, du1, dv + 0.06), P(L, R0, du1, dv + 0.06)]); ctx.fill();
    // three screens on the wall above the desk
    var scr = [[1.16, 1.36, '#1a2440'], [1.4, 1.6, '#1a2440'], [1.64, 1.84, '#1a2440']];
    scr.forEach(function (q, j) {
      var Q = wallQuad(L, L.Rf * q[0], L.Rf * q[1], -0.08, -0.46, -1, 0.95); poly(ctx, Q); ctx.fillStyle = '#8a8478'; ctx.fill();
      var I = wallQuad(L, L.Rf * (q[0] + 0.03), L.Rf * (q[1] - 0.03), -0.11, -0.43, -1, 0.94); poly(ctx, I); ctx.fillStyle = q[2]; ctx.fill();
      // contents: a power graph, the storm track, a battery bar
      var a = I[0], b = I[1], c = I[2], d = I[3];
      function at(x, y) { var tx = lerp(a[0], b[0], x), ty = lerp(a[1], b[1], x), bx2 = lerp(d[0], c[0], x), by2 = lerp(d[1], c[1], x); return [lerp(tx, bx2, y), lerp(ty, by2, y)]; }
      ctx.lineCap = 'round';
      if (j === 0) { ctx.strokeStyle = '#7ff7e4'; ctx.lineWidth = 1 * s; ctx.beginPath(); for (i = 0; i <= 10; i++) { var p = at(0.1 + i * 0.08, 0.3 + 0.4 * (0.5 + 0.5 * Math.sin(i * 0.9)) * (1 - i / 14)); if (!i) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); } ctx.stroke(); }
      else if (j === 1) { ctx.fillStyle = 'rgba(232,140,80,0.8)'; var c0 = at(0.6, 0.4); ctx.beginPath(); ctx.arc(c0[0], c0[1], 4 * s * (b[0] - a[0] > 0 ? 1 : 1), 0, TAU); ctx.fill(); ctx.strokeStyle = '#ffd27a'; ctx.lineWidth = 0.8 * s; ctx.beginPath(); var e1 = at(0.15, 0.7), e2 = at(0.5, 0.5); ctx.moveTo(e1[0], e1[1]); ctx.lineTo(e2[0], e2[1]); ctx.stroke(); }
      else { for (i = 0; i < 5; i++) { var p0 = at(0.15 + i * 0.15, 0.35), p1 = at(0.27 + i * 0.15, 0.65); ctx.fillStyle = i < 3 ? '#5ad88a' : 'rgba(90,216,138,0.25)'; ctx.fillRect(p0[0], p0[1], p1[0] - p0[0], p1[1] - p0[1]); } }
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; var cc = at(0.5, 0.5); softGlow(ctx, cc[0], cc[1], 26 * s, '#5ad8e8', 0.12); ctx.restore();
    });
    // a mug and a tablet on the desk
    var m = P(L, R0 * 1.1, -0.8, dv); ctx.fillStyle = '#2aa89a'; ctx.beginPath(); rrect(ctx, m[0] - 3 * s, m[1] - 7 * s, 6 * s, 7 * s, 1.4 * s); ctx.fill(); ink(ctx, s, 0.4);
    var tb = [P(L, R0 * 1.3, -0.88, dv), P(L, R0 * 1.45, -0.88, dv), P(L, R0 * 1.45, -0.76, dv), P(L, R0 * 1.3, -0.76, dv)]; poly(ctx, tb); ctx.fillStyle = '#2a2a3a'; ctx.fill();
    // an orange chair at the desk
    var ch = P(L, L.Rf * 1.65, -0.5, FV);
    ctx.fillStyle = 'rgba(30,20,20,0.3)'; ctx.beginPath(); qell(ctx, ch[0], ch[1], 16 * s, 4 * s, 0); ctx.fill();
    ctx.fillStyle = '#5a5a66'; ctx.fillRect(ch[0] - 1.2 * s, ch[1] - 18 * s, 2.4 * s, 16 * s); ctx.fillRect(ch[0] - 10 * s, ch[1] - 3 * s, 20 * s, 2.4 * s);
    ctx.fillStyle = '#e8783a'; ctx.beginPath(); rrect(ctx, ch[0] - 12 * s, ch[1] - 24 * s, 24 * s, 7 * s, 3 * s); ctx.fill(); ink(ctx, s, 0.45);
    ctx.beginPath(); rrect(ctx, ch[0] - 14 * s, ch[1] - 48 * s, 9 * s, 26 * s, 3.6 * s); ctx.fill(); ink(ctx, s, 0.45);
    // a red extinguisher and a handrail near us
    var ex = P(L, L.Rf * 2.05, -0.9, 0.12); ctx.fillStyle = '#d8403a'; ctx.beginPath(); rrect(ctx, ex[0] - 5 * s, ex[1] - 26 * s, 10 * s, 26 * s, 4 * s); ctx.fill(); ink(ctx, s, 0.5); ctx.fillStyle = '#2a2a30'; ctx.fillRect(ex[0] - 2 * s, ex[1] - 31 * s, 4 * s, 5 * s);
  }

  function greenhouse(ctx, L) {
    var s = L.s, r = rng(9301), R0 = L.Rf * 1.12, R1 = L.Rf * 1.95, i, j;
    var pal = ['#2e5a34', '#3f7a40', '#5a9a4a', '#86c060', '#b8e080'];
    [[-0.42, 0.88], [-0.12, 0.92], [0.18, 0.92]].forEach(function (lev, k) {
      var v = lev[0] + 0.18, u = lev[1];
      // shelf board along the right wall
      poly(ctx, [P(L, R0, u, v), P(L, R1, u, v), P(L, R1, u - 0.2, v), P(L, R0, u - 0.2, v)]); ctx.fillStyle = '#d8d0c4'; ctx.fill(); ink(ctx, s, 0.45);
      poly(ctx, [P(L, R0, u - 0.2, v), P(L, R1, u - 0.2, v), P(L, R1, u - 0.2, v + 0.03), P(L, R0, u - 0.2, v + 0.03)]); ctx.fillStyle = '#a89e90'; ctx.fill();
      // the pink grow light under the shelf above
      var g0 = P(L, R0, u - 0.1, lev[0]), g1 = P(L, R1, u - 0.1, lev[0]);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(255,110,210,0.35)'; ctx.lineWidth = 12 * s; ctx.beginPath(); ctx.moveTo(g0[0], g0[1]); ctx.lineTo(g1[0], g1[1]); ctx.stroke(); ctx.restore();
      ctx.strokeStyle = '#e8e2d6'; ctx.lineWidth = 3.4 * s; ctx.beginPath(); ctx.moveTo(g0[0], g0[1] - 1 * s); ctx.lineTo(g1[0], g1[1] - 2 * s); ctx.stroke(); ctx.strokeStyle = '#ff9ae0'; ctx.lineWidth = 1.4 * s; ctx.beginPath(); ctx.moveTo(g0[0], g0[1] + 0.8 * s); ctx.lineTo(g1[0], g1[1] + 0.8 * s); ctx.stroke();
      var w0 = P(L, R0, u, lev[0]), w1 = P(L, R1, u, lev[0]); ctx.strokeStyle = '#a89e90'; ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.moveTo(w0[0], w0[1]); ctx.lineTo(g0[0], g0[1]); ctx.moveTo(w1[0], w1[1]); ctx.lineTo(g1[0], g1[1]); ctx.stroke();
      // plants in trays along the shelf, bigger as they come toward us
      for (j = 0; j < 7; j++) {
        var RR = lerp(R0 * 1.05, R1 * 0.95, j / 6), base = P(L, RR, u - 0.1, v), sz = RR / L.Rf * 4.4 * s;
        ctx.fillStyle = '#e8e2d6'; ctx.fillRect(base[0] - sz * 1.2, base[1] - sz * 0.9, sz * 2.4, sz * 0.9);
        clump(ctx, base[0], base[1] - sz * 1.8, sz * 1.25, pal, r, -0.5, -0.8, false, 0.8);
        if ((j + k) % 2 === 0) dots(ctx, 5, [['#e0403a', 1], ['#f08a3a', 1]], function () { return [base[0] + (r() - 0.5) * sz * 1.8, base[1] - sz * (1.2 + r() * 1.2), sz * 0.24, r() < 0.7 ? 0 : 1]; });
      }
      // pink light washing over the leaves
      var mid = P(L, (R0 + R1) / 2, u - 0.1, v - 0.12);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; softGlow(ctx, mid[0], mid[1], (R1 - R0) * 0.5, '#ff70c8', 0.12); ctx.restore();
    });
  }

  function paint(ctx, w, h) {
    if (!bind()) return;
    var L = layout(w, h);
    shell(ctx, L); console_(ctx, L); greenhouse(ctx, L);
    ctx.fillStyle = lg(ctx, 0, h * 0.78, 0, h, [[0, 'rgba(30,20,20,0)'], [1, 'rgba(30,20,20,0.3)']]); ctx.fillRect(0, h * 0.78, w, h * 0.22);
    finish(ctx, w, h, '#ffa868', 0.1, 0.24, 0.035, '#1e1210', 0.38);
  }
  function overlay(ctx, w, h, t) {
    if (!bind()) return;
    var L = layout(w, h), s = L.s, W = L.win, i, ww = W.x1 - W.x0;
    // dust blowing past the window, thickening toward the storm side
    ctx.save(); ctx.beginPath(); rrect(ctx, W.x0, W.y0, ww, W.y1 - W.y0, L.Rf * 0.2); ctx.clip();
    ctx.fillStyle = 'rgba(200,140,100,0.5)';
    for (i = 0; i < 26; i++) { var per = 5 + hash(i, 3) * 4, q = ((t + hash(i, 4) * per) % per) / per, x = W.x1 + 10 * s - q * (ww + 20 * s), y = W.y0 + (W.y1 - W.y0) * hash(i, 5); ctx.globalAlpha = 0.25 + 0.4 * hash(i, 6); ctx.fillRect(x, y, (6 + hash(i, 7) * 10) * s, 0.7 * s); }
    var dq = (t % 18) / 18, dx = W.x0 + ww * (0.15 + dq * 0.3), dy = W.y0 + (W.y1 - W.y0) * 0.68; ctx.globalAlpha = 0.25 * Math.sin(dq * PI); ctx.fillStyle = '#d8a070'; ctx.beginPath(); ctx.moveTo(dx - 2 * s, dy); ctx.lineTo(dx + 2 * s, dy); ctx.lineTo(dx + 6 * s, dy - 22 * s); ctx.lineTo(dx - 4 * s, dy - 22 * s); ctx.fill();
    ctx.restore(); ctx.globalAlpha = 1;
    // screens flicker softly; a cursor blinks on the power graph
    var sp = glowSpr('#5ad8e8'); if (sp) { var p = P(L, L.Rf * 1.26, -0.93, -0.27); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.18 + 0.1 * Math.sin(t * 3); ctx.drawImage(sp, p[0] - 14 * s, p[1] - 14 * s, 28 * s, 28 * s); ctx.restore(); }
    // grow lights breathe
    var gp = glowSpr('#ff70c8'); if (gp) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (i = 0; i < 3; i++) { var g = P(L, L.Rf * 1.5, 0.8, -0.5 + i * 0.32); ctx.globalAlpha = 0.08 + 0.05 * Math.sin(t * 0.9 + i); ctx.drawImage(gp, g[0] - 40 * s, g[1] - 20 * s, 80 * s, 40 * s); } ctx.restore(); }
    // dust motes in the warm light from the window
    var mp = glowSpr('#ffe0b8'); if (mp) for (i = 0; i < 14; i++) { var mx = w * (0.3 + hash(i, 11) * 0.4) + Math.sin(t * 0.3 + i) * 10 * s, my = h * (0.4 + hash(i, 12) * 0.3) + Math.sin(t * 0.25 + i * 2) * 8 * s, ms = (1.4 + hash(i, 13) * 2) * s; ctx.globalAlpha = 0.15 + 0.2 * (0.5 + 0.5 * Math.sin(t + i * 3)); ctx.drawImage(mp, mx - ms, my - ms, ms * 2, ms * 2); }
    ctx.globalAlpha = 1;
  }

  PAINT.mars_hab = { focus: { x: 0.5, y: 0.3 }, track: 'work', anchors: { window: { x: 0.5, y: 0.28 }, desk: { x: 0.12, y: 0.45 }, greenhouse: { x: 0.88, y: 0.4 } },
    paint: function (ctx, w, h) { ctx.save(); try { paint(ctx, w, h); } catch (e) { PAINT._err = 'mars_hab: ' + String(e && e.stack || e); } finally { ctx.restore(); } },
    overlay: function (ctx, w, h, t) { ctx.save(); try { overlay(ctx, w, h, t); } catch (e) { PAINT._err = 'mars_hab overlay: ' + String(e && e.stack || e); } finally { ctx.restore(); } } };

  if (typeof LATE !== 'undefined') LATE.push(function () {
    if (typeof PROPS === 'undefined' || typeof PROPS_ART === 'undefined') return;
    // someone walking around outside on the surface in a pressure suit and helmet (the open surface has no air)
    PROPS_ART.spacewalker = function () { return '<svg viewBox="0 0 50 92"><ellipse cx="25" cy="89" rx="15" ry="3" fill="rgba(0,0,0,.3)"/><g class="pa-body">' +
      '<path d="M15 60 l-2 26 h8 l3 -20 l3 20 h8 l-2 -26z" fill="#e8e4da" stroke="#4a4650" stroke-width="2"/><rect x="11" y="32" width="28" height="30" rx="9" fill="#f2eee4" stroke="#4a4650" stroke-width="2"/>' +
      '<rect x="18" y="40" width="14" height="9" rx="2" fill="#8a8e9a"/><circle cx="21" cy="44" r="1.6" fill="#7ff7e4"/><circle cx="27" cy="44" r="1.6" fill="#ffb84a"/><rect x="11" y="54" width="28" height="3" fill="#e0684a"/>' +
      '<path d="M11 36 q-6 8 -4 20 M39 36 q6 8 4 20" stroke="#e8e4da" stroke-width="6" fill="none" stroke-linecap="round"/>' +
      '<circle cx="25" cy="20" r="14" fill="#f2eee4" stroke="#4a4650" stroke-width="2"/><path d="M14 19 a11 9 0 0 1 22 0 v3 a11 8 0 0 1 -22 0z" fill="#2a3a5a"/><path d="M17 15 q4 -4 9 -3" stroke="#bfe8ff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".9"/></g></svg>'; };
    // outside on the open plain, passers-by wear suits and helmets (moon_dome.js does the same for the Moon)
    if (PROPS.mars) PROPS.mars = PROPS.mars.map(function (p) { return p.id === 'person' ? { id: 'spacewalker', x: p.x, y: p.y, w: p.w * 0.8, talk: p.talk } : p; });
    PROPS.mars_hab = [
      { id: 'marstomato', x: 88, y: 91, w: 46, sfx: 'rustle', fx: 'wiggle', burst: 'hearts' },
      { id: 'person', x: 26, y: 89, w: 50, talk: 'mars', look: { skin: '#d8a888', shirt: '#e07a48', hair: '#2a1a14' } },
      { id: 'mug', x: 10, y: 92, w: 40, sfx: 'clink', fx: 'jiggle', burst: 'steam' },
      { id: 'marsdrone', x: 66, y: 80, w: 44, sfx: 'beep', fx: 'spin' }
    ];
  });
})();
