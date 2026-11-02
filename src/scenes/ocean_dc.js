/* scenes/ocean_dc.js - PAINT.ocean_dc: the floating datacenters in the open Pacific (international waters).
   A field of six-sided solar-and-battery rafts runs to the horizon under a cream sky. A cluster of white datacenter
   platforms floats in the field, each ringed by the cool water that its pipes draw from the sea. A shipping lane
   crosses the field for the data tankers, and inspection drones check the rafts.
   Style: flat, graphic and slightly retro, after the AI 2040 reference art described in docs/DESIGN_NOTES.md
   (warm cream sky, a limited palette, fine linework).
   Contract (see the header of src/paint_boston.js): PAINT.ocean_dc = { paint(ctx,w,h), overlay(ctx,w,h,t), focus, anchors, track }.
   The painting is a real perspective view: rafts sit on a hex grid on the sea and are projected through one camera,
   so they shrink and crowd together toward the horizon. Everything is seeded, so it paints identically every time.
   The lower third is open, low-contrast rafts and water (calm under subtitles and props); the middle is plain field. */
(function () {
  'use strict';
  var PAINT = (window.PAINT = window.PAINT || {});
  var PI = Math.PI, TAU = PI * 2, SQ3 = Math.sqrt(3);

  /* ============================== utilities (from src/paint_boston.js) ============================== */
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hash(i, s) {
    var x = Math.imul((i | 0) ^ Math.imul(s | 0, 0x9E3779B1), 0x27d4eb2d);
    x ^= x >>> 15; x = Math.imul(x, 0x85ebca6b); x ^= x >>> 13; x = Math.imul(x, 0xc2b2ae35); x ^= x >>> 16;
    return (x >>> 0) / 4294967296;
  }
  function h2(ix, iy, s) { return hash(Math.imul(ix | 0, 0x1B873593) ^ Math.imul(iy | 0, 0x5BD1E995), s); }
  function vn2(x, y, s) {
    var ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
    var ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
    var a = h2(ix, iy, s), b = h2(ix + 1, iy, s), c = h2(ix, iy + 1, s), d = h2(ix + 1, iy + 1, s);
    return (a + (b - a) * ux) * (1 - uy) + (c + (d - c) * ux) * uy;
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  var HX = {};
  function hex(c) { var v = HX[c]; if (v) return v; var d = c.replace('#', ''); v = [parseInt(d.substr(0, 2), 16), parseInt(d.substr(2, 2), 16), parseInt(d.substr(4, 2), 16)]; HX[c] = v; return v; }
  function h2s(v) { v = clamp(Math.round(v), 0, 255); return (v < 16 ? '0' : '') + v.toString(16); }
  function mix(c1, c2, t) { var a = hex(c1), b = hex(c2); return '#' + h2s(lerp(a[0], b[0], t)) + h2s(lerp(a[1], b[1], t)) + h2s(lerp(a[2], b[2], t)); }
  function rgba(c, al) { var a = hex(c); return 'rgba(' + a[0] + ',' + a[1] + ',' + a[2] + ',' + (+al).toFixed(3) + ')'; }
  function lg(ctx, x0, y0, x1, y1, st) { var g = ctx.createLinearGradient(x0, y0, x1, y1); for (var i = 0; i < st.length; i++) g.addColorStop(st[i][0], st[i][1]); return g; }
  function rg(ctx, x, y, r0, r1, st) { var g = ctx.createRadialGradient(x, y, r0, x, y, Math.max(r0 + 0.1, r1)); for (var i = 0; i < st.length; i++) g.addColorStop(st[i][0], st[i][1]); return g; }
  function mk(cw, ch) { if (typeof document === 'undefined') return null; var c = document.createElement('canvas'); c.width = Math.max(1, cw | 0); c.height = Math.max(1, ch | 0); return c; }
  function S(w, h) { return Math.max(0.5, Math.min(w / 390, h / 640)); }
  function memo(fn) { var key = null, val = null; return function (w, h) { var k = w + 'x' + h; if (k !== key) { key = k; val = fn(w, h); } return val; }; }
  function poly(ctx, pts) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); }
  function rrect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  }
  var grainCv = null;
  function finish(ctx, w, h, gradeCol, gradeA, vig, grainA, vigCol, vy) {
    try {
      ctx.save();
      if (gradeCol) { ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = gradeA; ctx.fillStyle = gradeCol; ctx.fillRect(0, 0, w, h); }
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      var R = Math.max(w, h) * 0.75, vc = vigCol || '#14101e';
      if (vig > 0) { ctx.fillStyle = rg(ctx, w / 2, h * (vy || 0.42), R * 0.35, R, [[0, rgba(vc, 0)], [1, rgba(vc, vig)]]); ctx.fillRect(0, 0, w, h); }
      if (!grainCv && typeof document !== 'undefined') {
        grainCv = document.createElement('canvas'); grainCv.width = grainCv.height = 128;
        var g = grainCv.getContext('2d'), id = g.createImageData(128, 128), r = rng(4242), i, v;
        for (i = 0; i < 128 * 128; i++) { v = (r() * 255) | 0; id.data[i * 4] = v; id.data[i * 4 + 1] = v; id.data[i * 4 + 2] = v; id.data[i * 4 + 3] = 255; }
        g.putImageData(id, 0, 0);
      }
      if (grainCv && grainA > 0) { ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = grainA; ctx.fillStyle = ctx.createPattern(grainCv, 'repeat'); ctx.fillRect(0, 0, w, h); }
      ctx.restore();
    } catch (e) { try { ctx.restore(); } catch (e2) {} }
  }
  var SPR = {};
  function glowSpr(col, hard) {
    var key = col + (hard ? 'h' : '');
    if (SPR[key] !== undefined) return SPR[key];
    var c = mk(64, 64); if (c) { var g = c.getContext('2d'); g.fillStyle = rg(g, 32, 32, 0, 32, hard ? [[0, rgba('#ffffff', 1)], [0.12, rgba(col, 1)], [0.3, rgba(col, 0.35)], [1, rgba(col, 0)]] : [[0, rgba(col, 1)], [0.25, rgba(col, 0.55)], [1, rgba(col, 0)]]); g.fillRect(0, 0, 64, 64); }
    SPR[key] = c; return c;
  }

  /* ============================== palette ============================== */
  // a limited, print-like palette: cream sky, peach sun, teal sea, navy panels, warm whites, coral and mustard accents
  var PAL = {
    sky0: '#efe1c4', sky1: '#f6ecd9', sky2: '#f8e4c2', haze: '#f2e2c4', line: '#e2c08f',
    sun: '#f7c48e', sunCore: '#fbd9a8', sunRing: '#ecb07a',
    cloud: '#fbf6ec', cloudLine: '#dcc39c',
    water: '#2f7686', waterMid: '#4a8f9a', waterFar: '#9ebfb7', lane: '#5b9ba3',
    panel: '#22375e', panelMid: '#3a5680', panelFar: '#7d93a6', cell: '#3d5c8e',
    rim: '#e8e0cd', rimSide: '#9b9a8f', glint: '#f9dcaa',
    white: '#fbf8f1', whiteF: '#ece5d7', whiteS: '#d6cdbb', ink: '#26314d',
    coral: '#e4694f', mustard: '#e0a444', teal: '#2a9d9a', cool: '#a8dcd6'
  };

  /* ============================== the camera and the layout ============================== */
  // World units: one raft is 2 units across (about 20 meters). The camera looks along +Z from height Hc.
  // Every platform is a list of boxes; overlay positions (lights, tanker, drones) are worked out here once per size.
  var PLATFORMS = [
    // the near, main platform (right of the portrait): big halls, a tall comms tower, cooling halls
    { X0: 13, X1: 45, Z0: 86, Z1: 98, main: true, deck: 2.2, b: [
      { X0: 14.5, X1: 23.5, Z0: 87.5, Z1: 96, h: 10.5, kind: 'hall', pad: true },
      { X0: 24.5, X1: 33, Z0: 88, Z1: 95, h: 15.5, kind: 'hall' },
      { X0: 34.2, X1: 37.4, Z0: 89, Z1: 92.5, h: 22, kind: 'tower' },
      { X0: 38.4, X1: 44, Z0: 87.5, Z1: 96, h: 8, kind: 'fins' }] },
    // a second platform farther out, toward the middle
    { X0: 3, X1: 25, Z0: 168, Z1: 178, deck: 2, b: [
      { X0: 4, X1: 12, Z0: 169, Z1: 176, h: 12, kind: 'hall' },
      { X0: 13, X1: 16, Z0: 170, Z1: 173, h: 19, kind: 'tower' },
      { X0: 17, X1: 24, Z0: 169, Z1: 176, h: 9, kind: 'fins' }] },
    // a third, just left of center, and two tiny far ones at the edges of the view
    { X0: -19, X1: -2, Z0: 252, Z1: 260, deck: 2, b: [
      { X0: -18, X1: -11, Z0: 253, Z1: 259, h: 10, kind: 'hall' },
      { X0: -10, X1: -3, Z0: 253, Z1: 259, h: 14, kind: 'hall' }] },
    { X0: -178, X1: -146, Z0: 330, Z1: 340, deck: 2, b: [
      { X0: -176, X1: -164, Z0: 331, Z1: 339, h: 13, kind: 'hall' },
      { X0: -162, X1: -158, Z0: 332, Z1: 336, h: 22, kind: 'tower' },
      { X0: -156, X1: -147, Z0: 331, Z1: 339, h: 9, kind: 'fins' }] },
    { X0: 136, X1: 160, Z0: 300, Z1: 310, deck: 2, b: [
      { X0: 137, X1: 148, Z0: 301, Z1: 309, h: 11, kind: 'hall' },
      { X0: 149, X1: 159, Z0: 301, Z1: 309, h: 16, kind: 'hall' }] }
  ];
  var LANE = { z0: 104, z1: 140, zt: 122 };   // the shipping lane (no rafts), and the depth the tanker sails at

  var LM = memo(function (w, h) {
    var L = { w: w, h: h, s: S(w, h) };
    var yh = L.yh = h * 0.405, f = L.f = w, zb = 11.2;
    var Hc = L.Hc = zb * (h - yh) / f;
    L.P = function (X, Z, y) { return [w / 2 + f * X / Z, yh + f * (Hc - (y || 0)) / Z]; };
    L.zAt = function (sy) { return f * Hc / Math.max(0.5, sy - yh); };
    L.sun = { x: w * 0.2, y: h * 0.165, r: w * 0.088 };
    // where the props and the hover drone sit (fractions of the scene column)
    L.droneAt = { x: 0.2, y: 0.705 }; L.raftAt = { x: 0.79, y: 0.845 };
    var dz = L.zAt(h * 0.765); L.droneRaft = [(w * 0.2 - w / 2) * dz / f, dz];
    var rz = L.zAt(h * L.raftAt.y); L.propRaft = [(w * L.raftAt.x - w / 2) * rz / f, rz];
    L.edgeZ = 13.6;   // nearest rafts; open water below them
    L.edgeY = L.P(0, L.edgeZ - 1.2)[1];
    return L;
  });

  /* which hex cells carry a raft: holes from smooth noise, the lane, the water around each platform, a ragged near edge */
  function raftAt(L, q, r) {
    var X = 1.5 * q, Z = SQ3 * (r + q / 2);
    if (Z < L.edgeZ + h2(q, r, 7) * 2.6) return null;
    if (Z > LANE.z0 && Z < LANE.z1) return null;
    if (Math.abs(X) > Z * 0.5 * (L.w / L.f) + 3) return null;
    for (var i = 0; i < PLATFORMS.length; i++) {
      var p = PLATFORMS[i], cx = (p.X0 + p.X1) / 2, cz = (p.Z0 + p.Z1) / 2, rx = (p.X1 - p.X0) / 2 + 7, rz = (p.Z1 - p.Z0) / 2 + 11;
      var ex = (X - cx) / rx, ez = (Z - cz) / rz; if (ex * ex + ez * ez < 1) return null;
    }
    var keep = 0, d1 = Math.hypot(X - L.droneRaft[0], Z - L.droneRaft[1]), d2 = Math.hypot(X - L.propRaft[0], Z - L.propRaft[1]);
    if (d1 < 3.2 || d2 < 3.2) keep = 1;
    var n = vn2(X * 0.028 + 9.4, Z * 0.07 + 2.3, 11) * 0.7 + vn2(X * 0.13, Z * 0.13, 23) * 0.3;
    if (!keep && (n > 0.77 || h2(q, r, 3) < 0.03)) return null;
    return { X: X, Z: Z, q: q, r: r, hub: h2(q, r, 5) < (Z < 30 ? 0.05 : 0.03) && !keep, seed: h2(q, r, 9) };
  }

  /* ============================== sky ============================== */
  function paintSky(ctx, L) {
    var w = L.w, h = L.h, s = L.s, yh = L.yh, i;
    ctx.fillStyle = lg(ctx, 0, 0, 0, yh, [[0, PAL.sky0], [0.45, PAL.sky1], [1, PAL.sky2]]); ctx.fillRect(0, 0, w, yh + 2);
    // a soft warm bloom around the sun, then the flat disk with a fine ring, like a print
    var sn = L.sun;
    ctx.fillStyle = rg(ctx, sn.x, sn.y, sn.r * 0.8, sn.r * 4.2, [[0, rgba('#fbe3bb', 0.75)], [0.4, rgba('#f8e2bf', 0.3)], [1, rgba('#f8e2bf', 0)]]); ctx.fillRect(0, 0, w, yh);
    ctx.fillStyle = PAL.sun; ctx.beginPath(); ctx.arc(sn.x, sn.y, sn.r, 0, TAU); ctx.fill();
    ctx.fillStyle = PAL.sunCore; ctx.beginPath(); ctx.arc(sn.x - sn.r * 0.12, sn.y - sn.r * 0.12, sn.r * 0.72, 0, TAU); ctx.fill();
    ctx.strokeStyle = rgba(PAL.sunRing, 0.7); ctx.lineWidth = 0.8 * s; ctx.beginPath(); ctx.arc(sn.x, sn.y, sn.r * 1.28, 0, TAU); ctx.stroke();
    ctx.strokeStyle = rgba(PAL.sunRing, 0.35); ctx.beginPath(); ctx.arc(sn.x, sn.y, sn.r * 1.6, 0, TAU); ctx.stroke();
    // three thin bands of sky across the lower sun (a retro print motif)
    ctx.save(); ctx.beginPath(); ctx.arc(sn.x, sn.y, sn.r + 1, 0, TAU); ctx.clip();
    for (i = 0; i < 3; i++) { var by = sn.y + sn.r * (0.38 + i * 0.22); ctx.fillStyle = rgba(PAL.sky1, 0.85); ctx.fillRect(sn.x - sn.r - 2, by, sn.r * 2 + 4, (1.2 + i * 0.9) * s); }
    ctx.restore();
    // fine horizontal hatching that thickens toward the horizon
    var y0 = h * 0.28, yy = y0, k = 0;
    while (yy < yh - 1) { var u = (yy - y0) / (yh - y0); ctx.fillStyle = rgba(PAL.line, 0.08 + u * 0.32); ctx.fillRect(0, yy, w, (0.5 + u * 0.7) * s); yy += lerp(7, 2.4, u) * s; k++; }
    // long flat clouds: stacked pills with a fine line under each
    var C = [[0.56, 0.085, 0.36, 1], [0.04, 0.29, 0.30, 0.8], [0.62, 0.235, 0.3, 0.85], [0.34, 0.045, 0.2, 0.6], [0.8, 0.32, 0.22, 0.6]], r = rng(717);
    for (i = 0; i < C.length; i++) {
      var cx = C[i][0] * w, cy = C[i][1] * h, cw = C[i][2] * w, ch = 9 * s * C[i][3], al = 0.95;
      ctx.fillStyle = rgba(PAL.cloud, al);
      ctx.beginPath(); rrect(ctx, cx, cy, cw, ch, ch / 2); ctx.fill();
      ctx.beginPath(); rrect(ctx, cx + cw * (0.12 + r() * 0.2), cy - ch * 0.8, cw * (0.38 + r() * 0.2), ch * 1.1, ch * 0.55); ctx.fill();
      if (r() < 0.7) { ctx.beginPath(); rrect(ctx, cx + cw * (0.5 + r() * 0.15), cy - ch * 0.45, cw * 0.3, ch * 0.9, ch * 0.45); ctx.fill(); }
      ctx.strokeStyle = rgba(PAL.cloudLine, 0.8); ctx.lineWidth = 0.7 * s; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(cx + ch * 0.4, cy + ch + 2 * s); ctx.lineTo(cx + cw * 0.82, cy + ch + 2 * s); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + cw * 0.86, cy + ch + 2 * s); ctx.lineTo(cx + cw * 0.95, cy + ch + 2 * s); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - cw * 0.12, cy + ch * 0.5); ctx.lineTo(cx - cw * 0.03, cy + ch * 0.5); ctx.stroke();
    }
    // a warm haze right at the horizon
    ctx.fillStyle = lg(ctx, 0, yh - 26 * s, 0, yh + 4 * s, [[0, rgba(PAL.haze, 0)], [1, rgba(PAL.haze, 0.9)]]); ctx.fillRect(0, yh - 26 * s, w, 30 * s);
  }

  /* ============================== the sea and the far field ============================== */
  function paintSea(ctx, L) {
    var w = L.w, h = L.h, s = L.s, yh = L.yh, i;
    ctx.fillStyle = lg(ctx, 0, yh, 0, h, [[0, PAL.waterFar], [0.08, PAL.waterMid], [0.4, PAL.water], [1, '#2a6c7c']]); ctx.fillRect(0, yh, w, h - yh);
    // the sun's path on the water: a lighter column that widens toward us
    var sx = L.sun.x; ctx.save(); ctx.globalCompositeOperation = 'screen';
    for (i = 1; i <= 8; i++) { var ww = w * 0.04 * i, al = 0.07;
      ctx.fillStyle = lg(ctx, 0, yh, 0, h, [[0, rgba('#f8e0b0', al * 1.6)], [0.5, rgba('#f8e0b0', al * 0.5)], [1, rgba('#f8e0b0', al * 0.12)]]);
      ctx.beginPath(); ctx.moveTo(sx - 1.2 * i * s, yh); ctx.lineTo(sx + 1.2 * i * s, yh); ctx.lineTo(sx + ww, h); ctx.lineTo(sx - ww, h); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    // fine ripple lines, packed tight near the horizon
    var r = rng(91);
    for (i = 0; i < 260; i++) {
      var u = Math.pow(r(), 1.7), y = yh + 2 + u * (h - yh), len = (6 + r() * 26) * s * (0.3 + u * 1.6), x = r() * w;
      ctx.fillStyle = rgba('#d9efe9', 0.10 + (1 - u) * 0.14); ctx.fillRect(x, y, len, Math.max(0.5, 0.6 * s * (0.5 + u)));
    }
  }
  // beyond the drawn rafts, the field is only rows: stripes of panel and water that fade into the horizon haze
  function paintFarField(ctx, L, zFrom) {
    var w = L.w, s = L.s, yh = L.yh, y1 = L.P(0, zFrom)[1], y, k = 0;
    for (y = y1; y > yh + 0.3; y -= Math.max(0.9, (y - yh) * 0.16)) {
      var u = (y - yh) / (y1 - yh), z = L.zAt(y);
      ctx.fillStyle = rgba(mix(PAL.panelFar, PAL.haze, 1 - u * 0.75), 0.55 + u * 0.35);
      // broken rows: gaps where the far field has open water
      var x = 0; while (x < w) { var seg = (20 + hash(k * 977 + (x | 0), 31) * 80) * s, gap = hash(k * 131 + (x | 0), 37) < 0.18 ? (6 + hash(k, 41) * 30) * s : 1.2 * s; ctx.fillRect(x, y, seg, Math.max(0.6, (y - yh) * 0.07)); x += seg + gap; }
      k++;
    }
    ctx.fillStyle = lg(ctx, 0, yh - 2 * s, 0, yh + 9 * s, [[0, rgba(PAL.haze, 0.95)], [1, rgba(PAL.haze, 0)]]); ctx.fillRect(0, yh - 2 * s, w, 11 * s);
  }

  /* ============================== rafts ============================== */
  var HEXA = [0, 1, 2, 3, 4, 5].map(function (i) { return [Math.cos(i * PI / 3), Math.sin(i * PI / 3)]; });
  function hexPts(L, X, Z, rr, y) { var out = []; for (var i = 0; i < 6; i++) out.push(L.P(X + HEXA[i][0] * rr, Z + HEXA[i][1] * rr, y)); return out; }
  function glintAt(L, sx, sy) { var spread = L.w * 0.05 + (sy - L.yh) * 0.42, d = (sx - L.sun.x) / spread; return Math.exp(-d * d); }
  function drawRaft(ctx, L, R, set) {
    var s = L.s, X = R.X, Z = R.Z, k = L.f / Z, near = Z < 42, mid = Z < 75, i;
    var fade = smooth(14, 150, Z), c = L.P(X, Z, 0.14), g = glintAt(L, c[0], c[1]);
    var th = 0.16, rr = 0.88;
    // the float collar: its dark side, then its pale top
    if (k * th > 0.5) { poly(ctx, hexPts(L, X, Z, rr, 0)); ctx.fillStyle = mix(PAL.rimSide, PAL.waterFar, fade * 0.8); ctx.fill(); }
    var top = hexPts(L, X, Z, rr, th); poly(ctx, top); ctx.fillStyle = mix(mix(PAL.rim, PAL.haze, fade * 0.7), '#fff4dc', g * 0.4); ctx.fill();
    // the solar panel, reflecting more sky (and sun) the farther away it is
    var pan = hexPts(L, X, Z, rr * 0.8, th + 0.01); poly(ctx, pan);
    var pc = Z < 40 ? mix(PAL.panel, PAL.panelMid, smooth(14, 40, Z)) : mix(PAL.panelMid, PAL.panelFar, smooth(40, 150, Z));
    pc = mix(pc, PAL.glint, g * (0.25 + 0.45 * smooth(16, 90, Z)));
    pc = mix(pc, PAL.panel, (R.seed - 0.5) * 0.12 + 0.06);
    ctx.fillStyle = pc; ctx.fill();
    if (near) {
      // solar cells: a fine grid clipped to the panel, lines along the rows and toward the horizon
      ctx.save(); poly(ctx, pan); ctx.clip();
      ctx.strokeStyle = rgba(mix(PAL.cell, PAL.glint, g * 0.5), 0.75); ctx.lineWidth = Math.max(0.5, 0.55 * s);
      ctx.beginPath();
      for (var a = -0.7; a <= 0.71; a += 0.35) { var p0 = L.P(X - 1, Z + a, th), p1 = L.P(X + 1, Z + a, th); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); }
      for (var b = -0.6; b <= 0.61; b += 0.3) { var p2 = L.P(X + b, Z - 1, th), p3 = L.P(X + b, Z + 1, th); ctx.moveTo(p2[0], p2[1]); ctx.lineTo(p3[0], p3[1]); }
      ctx.stroke(); ctx.restore();
      // a bright edge where the panel meets the collar on the far side (sky reflection)
      ctx.strokeStyle = rgba('#cfe0ea', 0.35); ctx.lineWidth = 0.8 * s; ctx.beginPath(); ctx.moveTo(pan[1][0], pan[1][1]); ctx.lineTo(pan[2][0], pan[2][1]); ctx.lineTo(pan[3][0], pan[3][1]); ctx.stroke();
    }
    if (mid) { poly(ctx, top); ctx.strokeStyle = rgba(PAL.ink, 0.22 * (1 - fade)); ctx.lineWidth = Math.max(0.5, 0.6 * s); ctx.stroke(); }
    // links to the neighbors: short pale bridges across the gaps (three directions, so each link is drawn once)
    if (Z < 48) {
      var nb = [[1, 0], [0, 1], [-1, 1]];
      ctx.fillStyle = mix(PAL.rim, PAL.haze, fade * 0.6);
      for (i = 0; i < 3; i++) {
        if (!set[(R.q + nb[i][0]) + ',' + (R.r + nb[i][1])]) continue;
        var nX = 1.5 * (R.q + nb[i][0]), nZ = SQ3 * (R.r + nb[i][1] + (R.q + nb[i][0]) / 2), mx = (X + nX) / 2, mz = (Z + nZ) / 2;
        var dx = (nX - X) / SQ3, dzz = (nZ - Z) / SQ3, px = -dzz * 0.16, pz = dx * 0.16;
        poly(ctx, [L.P(mx - dx * 0.16 + px, mz - dzz * 0.16 + pz, th * 0.8), L.P(mx + dx * 0.16 + px, mz + dzz * 0.16 + pz, th * 0.8), L.P(mx + dx * 0.16 - px, mz + dzz * 0.16 - pz, th * 0.8), L.P(mx - dx * 0.16 - px, mz - dzz * 0.16 - pz, th * 0.8)]);
        ctx.fill();
      }
    }
    // a battery-and-inverter cabinet with a small mast on some rafts
    if (R.hub && Z < 58) {
      var cb = 0.5;
      poly(ctx, [L.P(X - 0.3, Z - 0.22, th), L.P(X + 0.3, Z - 0.22, th), L.P(X + 0.3, Z - 0.22, th + cb), L.P(X - 0.3, Z - 0.22, th + cb)]); ctx.fillStyle = mix(PAL.whiteF, PAL.haze, fade * 0.6); ctx.fill();
      poly(ctx, [L.P(X - 0.3, Z - 0.22, th + cb), L.P(X + 0.3, Z - 0.22, th + cb), L.P(X + 0.3, Z + 0.22, th + cb), L.P(X - 0.3, Z + 0.22, th + cb)]); ctx.fillStyle = mix(PAL.white, PAL.haze, fade * 0.5); ctx.fill();
      if (Z < 45) { var st = L.P(X - 0.18, Z - 0.22, th + cb * 0.55), sw = L.P(X + 0.05, Z - 0.22, th + cb * 0.55); ctx.strokeStyle = rgba(PAL.teal, 0.9); ctx.lineWidth = Math.max(0.6, k * 0.05); ctx.beginPath(); ctx.moveTo(st[0], st[1]); ctx.lineTo(sw[0], sw[1]); ctx.stroke(); }
      var m0 = L.P(X + 0.22, Z, th + cb), m1 = L.P(X + 0.22, Z, th + cb + 1.1);
      ctx.strokeStyle = rgba(PAL.ink, 0.7 * (1 - fade * 0.6)); ctx.lineWidth = Math.max(0.5, k * 0.04); ctx.beginPath(); ctx.moveTo(m0[0], m0[1]); ctx.lineTo(m1[0], m1[1]); ctx.stroke();
      ctx.fillStyle = PAL.coral; ctx.beginPath(); ctx.arc(m1[0], m1[1], Math.max(0.7, k * 0.07), 0, TAU); ctx.fill();
      if (L.lights) L.lights.push([m1[0], m1[1], Math.max(2.5 * s, k * 0.28), R.seed * TAU, 'nav']);
    }
  }
  // far rafts are only a few pixels: a rim-colored dash with a darker panel dash on top
  function drawFarRaft(ctx, L, R) {
    var Z = R.Z, a = L.P(R.X - 0.88, Z, 0.1), b = L.P(R.X + 0.88, Z, 0.1), y = a[1], hgt = Math.max(0.6, L.f * L.Hc * SQ3 * 0.8 / (Z * Z));
    var fade = smooth(60, 320, Z), g = glintAt(L, (a[0] + b[0]) / 2, y);
    ctx.fillStyle = mix(mix(PAL.rim, PAL.haze, 0.5 + fade * 0.5), '#fff4dc', g * 0.4); ctx.fillRect(a[0], y - hgt / 2, b[0] - a[0], hgt);
    ctx.fillStyle = mix(mix(PAL.panelMid, PAL.panelFar, fade), PAL.glint, g * 0.6); ctx.fillRect(a[0] + (b[0] - a[0]) * 0.14, y - hgt * 0.35, (b[0] - a[0]) * 0.72, hgt * 0.7);
  }

  /* ============================== datacenter platforms ============================== */
  // a box from (X0..X1, Z0..Z1, y0..y1): the side we can see, the top if it is below eye level, then the front
  function box(ctx, L, X0, X1, Z0, Z1, y0, y1, cf, cs, ct, ink) {
    var P = L.P, s = L.s;
    var faces = [];
    if (X0 > 0) faces.push([[P(X0, Z0, y0), P(X0, Z0, y1), P(X0, Z1, y1), P(X0, Z1, y0)], cs]);
    if (X1 < 0) faces.push([[P(X1, Z0, y0), P(X1, Z0, y1), P(X1, Z1, y1), P(X1, Z1, y0)], cs]);
    if (y1 < L.Hc) faces.push([[P(X0, Z0, y1), P(X1, Z0, y1), P(X1, Z1, y1), P(X0, Z1, y1)], ct]);
    faces.push([[P(X0, Z0, y0), P(X1, Z0, y0), P(X1, Z0, y1), P(X0, Z0, y1)], cf]);
    for (var i = 0; i < faces.length; i++) { poly(ctx, faces[i][0]); ctx.fillStyle = faces[i][1]; ctx.fill(); if (ink) { ctx.strokeStyle = ink; ctx.lineWidth = Math.max(0.5, 0.6 * s); ctx.lineJoin = 'round'; ctx.stroke(); } }
    return faces[faces.length - 1][0];
  }
  function paintPlatform(ctx, L, p) {
    var P = L.P, s = L.s, k = L.f / p.Z0, fade = smooth(80, 360, p.Z0), i, j;
    var tint = function (c) { return mix(c, PAL.haze, fade * 0.75); };
    var ink = rgba(PAL.ink, 0.38 * (1 - fade * 0.7));
    var cx = (p.X0 + p.X1) / 2, cz = (p.Z0 + p.Z1) / 2;
    // cool water around the platform, with two fine rings (the sea is the cooling system)
    var ring = function (rx, rz) { var pts = []; for (var a = 0; a < 40; a++) { var t = a / 40 * TAU; pts.push(P(cx + Math.cos(t) * rx, cz + Math.sin(t) * rz, 0)); } return pts; };
    var rx = (p.X1 - p.X0) / 2 + 6, rz = (p.Z1 - p.Z0) / 2 + 9;
    poly(ctx, ring(rx, rz)); ctx.fillStyle = rgba(tint(PAL.cool), 0.5); ctx.fill();
    ctx.strokeStyle = rgba('#e6f6f2', 0.55 * (1 - fade)); ctx.lineWidth = Math.max(0.5, 0.7 * s);
    poly(ctx, ring(rx * 0.82, rz * 0.8)); ctx.stroke(); poly(ctx, ring(rx * 1.0, rz * 1.0)); ctx.stroke();
    // reflections of the white halls in the cool water
    for (i = 0; i < p.b.length; i++) { var B = p.b[i], a0 = P(B.X0, p.Z0, 0), a1 = P(B.X1, p.Z0, 0), rl = Math.min(B.h, 10) * k * 0.55;
      ctx.fillStyle = lg(ctx, 0, a0[1], 0, a0[1] + rl, [[0, rgba('#ffffff', 0.32 * (1 - fade))], [1, rgba('#ffffff', 0)]]); ctx.fillRect(a0[0], a0[1], a1[0] - a0[0], rl); }
    // floats: short white columns standing in the water under the deck, with a navy band at the waterline
    var dk = p.deck, n = Math.max(3, Math.round((p.X1 - p.X0) / 3.2));
    for (i = 0; i <= n; i++) { var fx = lerp(p.X0 + 0.8, p.X1 - 0.8, i / n);
      box(ctx, L, fx - 0.45, fx + 0.45, p.Z0 + 0.6, p.Z0 + 1.5, 0, dk * 0.55, tint(PAL.whiteS), tint(PAL.whiteF), tint(PAL.white), null);
      var wb0 = P(fx - 0.45, p.Z0 + 0.6, 0), wb1 = P(fx + 0.45, p.Z0 + 0.6, 0.25); ctx.fillStyle = tint(PAL.panel); ctx.fillRect(wb0[0], wb1[1], wb1[0] - wb0[0], wb0[1] - wb1[1]); }
    // the deck
    box(ctx, L, p.X0, p.X1, p.Z0, p.Z1, dk * 0.55, dk, tint(PAL.whiteF), tint(PAL.white), tint(PAL.white), ink);
    // seawater pipes from the deck down into the sea
    if (p.main) for (i = 0; i < 3; i++) { var px = p.X0 + 4 + i * 11.5;
      box(ctx, L, px - 0.35, px + 0.35, p.Z0 - 0.6, p.Z0 - 0.1, -0.2, dk, tint('#cfdde0'), tint('#e4eef0'), tint('#e4eef0'), ink);
      for (j = 0; j < 3; j++) { var rp0 = P(px - 0.38, p.Z0 - 0.6, 0.3 + j * 0.55), rp1 = P(px + 0.38, p.Z0 - 0.6, 0.3 + j * 0.55); ctx.strokeStyle = tint(PAL.teal); ctx.lineWidth = Math.max(0.5, k * 0.09); ctx.beginPath(); ctx.moveTo(rp0[0], rp0[1]); ctx.lineTo(rp1[0], rp1[1]); ctx.stroke(); } }
    // railing along the deck's front edge
    if (k > 4) { var r0 = P(p.X0, p.Z0, dk), r1 = P(p.X1, p.Z0, dk), ry = k * 0.55; ctx.strokeStyle = rgba(PAL.ink, 0.35); ctx.lineWidth = Math.max(0.5, 0.5 * s);
      ctx.beginPath(); ctx.moveTo(r0[0], r0[1] - ry); ctx.lineTo(r1[0], r1[1] - ry); for (var rxp = r0[0]; rxp <= r1[0]; rxp += k * 1.2) { ctx.moveTo(rxp, r0[1]); ctx.lineTo(rxp, r0[1] - ry); } ctx.stroke(); }
    // the buildings, back to front
    var bs = p.b.slice().sort(function (a, b) { return b.Z0 - a.Z0; });
    for (i = 0; i < bs.length; i++) paintBuilding(ctx, L, p, bs[i], tint, ink, fade);
  }
  function paintBuilding(ctx, L, p, B, tint, ink, fade) {
    var P = L.P, s = L.s, k = L.f / B.Z0, y0 = p.deck, y1 = p.deck + B.h, i;
    if (B.kind === 'tower') {
      var fr = box(ctx, L, B.X0, B.X1, B.Z0, B.Z1, y0, y1, tint(PAL.whiteF), tint(PAL.white), tint(PAL.white), ink);
      // a rounded cap, an antenna and its strobe
      var c0 = P(B.X0, B.Z0, y1), c1 = P(B.X1, B.Z0, y1), cr = (c1[0] - c0[0]) / 2;
      ctx.fillStyle = tint(PAL.white); ctx.beginPath(); ctx.arc(c0[0] + cr, c0[1], cr, PI, TAU); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = Math.max(0.5, 0.6 * s); ctx.stroke();
      var an0 = [c0[0] + cr, c0[1] - cr], an1 = P((B.X0 + B.X1) / 2, B.Z0, y1 + 4.5);
      ctx.strokeStyle = rgba(PAL.ink, 0.7 * (1 - fade * 0.6)); ctx.lineWidth = Math.max(0.5, k * 0.08); ctx.beginPath(); ctx.moveTo(an0[0], an0[1]); ctx.lineTo(an1[0], an0[1] - (c0[1] - an1[1]) + cr); ctx.stroke();
      var top = [an1[0], an0[1] - (c0[1] - an1[1]) + cr];
      ctx.fillStyle = PAL.coral; ctx.beginPath(); ctx.arc(top[0], top[1], Math.max(0.8, k * 0.12), 0, TAU); ctx.fill();
      if (L.lights) L.lights.push([top[0], top[1], Math.max(3 * s, k * 0.5), 0, 'strobe']);
      // a navy window band near the top and fine vertical seams
      var wb0 = P(B.X0 + 0.25, B.Z0, y1 - 3.2), wb1 = P(B.X1 - 0.25, B.Z0, y1 - 2.2); ctx.fillStyle = tint(PAL.panel); ctx.fillRect(wb0[0], wb1[1], wb1[0] - wb0[0], wb0[1] - wb1[1]);
      ctx.strokeStyle = rgba(PAL.ink, 0.16); ctx.lineWidth = Math.max(0.5, 0.5 * s); ctx.beginPath(); var sm = P((B.X0 + B.X1) / 2, B.Z0, y0), sm2 = P((B.X0 + B.X1) / 2, B.Z0, y1 - 3.4); ctx.moveTo(sm[0], sm[1]); ctx.lineTo(sm2[0], sm2[1]); ctx.stroke();
      return;
    }
    var front = box(ctx, L, B.X0, B.X1, B.Z0, B.Z1, y0, y1, tint(PAL.whiteF), tint(PAL.white), tint('#fffdf8'), ink);
    var fx0 = front[0][0], fx1 = front[1][0], fyb = front[0][1], fyt = front[3][1], fh = fyb - fyt;
    ctx.save(); poly(ctx, front); ctx.clip();
    // a soft shade toward the bottom of each hall, so the white reads as a solid form
    ctx.fillStyle = lg(ctx, 0, fyt, 0, fyb, [[0, rgba('#ffffff', 0.25)], [1, rgba('#b8ab95', 0.18)]]); ctx.fillRect(fx0, fyt, fx1 - fx0, fh);
    if (B.kind === 'fins') {
      // cooling halls: many thin vertical fins
      ctx.strokeStyle = rgba(PAL.ink, 0.28 * (1 - fade * 0.6)); ctx.lineWidth = Math.max(0.5, 0.55 * s); ctx.beginPath();
      for (var fxp = fx0 + k * 0.5; fxp < fx1 - k * 0.3; fxp += Math.max(2 * s, k * 0.5)) { ctx.moveTo(fxp, fyt + fh * 0.18); ctx.lineTo(fxp, fyb - fh * 0.08); } ctx.stroke();
      ctx.fillStyle = tint(PAL.teal); ctx.fillRect(fx0, fyt + fh * 0.06, fx1 - fx0, Math.max(1, k * 0.25));
    } else {
      // computer halls: long navy window bands and fine panel seams
      var bands = B.h > 12 ? [0.18, 0.42, 0.66] : [0.25, 0.58];
      for (i = 0; i < bands.length; i++) { ctx.fillStyle = tint(i === 0 ? '#2d4772' : PAL.panel); ctx.fillRect(fx0 + k * 0.6, fyt + fh * bands[i], fx1 - fx0 - k * 1.2, Math.max(1, fh * 0.075)); }
      ctx.strokeStyle = rgba(PAL.ink, 0.12); ctx.lineWidth = Math.max(0.5, 0.5 * s); ctx.beginPath();
      for (var sx = fx0 + k * 2; sx < fx1 - k; sx += k * 2) { ctx.moveTo(sx, fyt); ctx.lineTo(sx, fyb); } ctx.stroke();
      ctx.fillStyle = tint(PAL.mustard); ctx.fillRect(fx0, fyb - Math.max(1, k * 0.22), fx1 - fx0, Math.max(1, k * 0.22));
    }
    ctx.restore();
    // a drone pad on the roof: a coral ring
    if (B.pad && y1 < L.Hc) { var pts = []; for (var a = 0; a < 24; a++) { var t = a / 24 * TAU; pts.push(P((B.X0 + B.X1) / 2 + Math.cos(t) * 2.2, (B.Z0 + B.Z1) / 2 + Math.sin(t) * 2.2, y1)); }
      poly(ctx, pts); ctx.strokeStyle = rgba(PAL.coral, 0.85); ctx.lineWidth = Math.max(0.7, k * 0.12); ctx.stroke(); }
  }
  // the screen rectangle the main platform covers (the tanker sails behind it)
  function platformRect(L, p) {
    var hmax = 0, i; for (i = 0; i < p.b.length; i++) hmax = Math.max(hmax, p.deck + p.b[i].h);
    var a = L.P(p.X0, p.Z1, 0), b = L.P(p.X1, p.Z0, 0), t = L.P(p.X0, p.Z0, hmax);
    return [Math.min(a[0], L.P(p.X0, p.Z0, 0)[0]) - 2, t[1] - 4 * L.s, b[0] + 2, b[1]];
  }

  /* ============================== the shipping lane ============================== */
  function laneBuoys(L) {
    var out = [], edges = [[LANE.z0 + 1.5, 'red'], [LANE.z1 - 1.5, 'green']], i, X;
    for (i = 0; i < 2; i++) { var Z = edges[i][0], half = Z * 0.5 + 4; for (X = -half + (i ? 5 : 0); X < half; X += 11) out.push([X, Z, edges[i][1]]); }
    return out;
  }
  function paintLane(ctx, L) {
    var s = L.s, a = L.P(0, LANE.z1, 0)[1], b = L.P(0, LANE.z0, 0)[1], i;
    ctx.fillStyle = lg(ctx, 0, a, 0, b, [[0, rgba(PAL.waterFar, 0.5)], [1, rgba(PAL.lane, 0.45)]]); ctx.fillRect(0, a, L.w, b - a);
    // dashed lines that mark the lane's edges
    ctx.strokeStyle = rgba('#f4ead4', 0.45); ctx.lineWidth = Math.max(0.5, 0.6 * s); ctx.setLineDash([6 * s, 5 * s]);
    ctx.beginPath(); ctx.moveTo(0, a + 1); ctx.lineTo(L.w, a + 1); ctx.moveTo(0, b - 1); ctx.lineTo(L.w, b - 1); ctx.stroke(); ctx.setLineDash([]);
    var bu = laneBuoys(L);
    for (i = 0; i < bu.length; i++) { var k = L.f / bu[i][1], p0 = L.P(bu[i][0], bu[i][1], 0), bw = Math.max(1.4, k * 0.45), bh = Math.max(2.2, k * 0.9);
      ctx.fillStyle = PAL.mustard; ctx.beginPath(); rrect(ctx, p0[0] - bw / 2, p0[1] - bh, bw, bh, bw * 0.3); ctx.fill();
      ctx.fillStyle = bu[i][2] === 'red' ? PAL.coral : PAL.teal; ctx.fillRect(p0[0] - bw / 2, p0[1] - bh * 0.62, bw, bh * 0.22);
      if (L.lights) L.lights.push([p0[0], p0[1] - bh - 0.6 * s, Math.max(2.2 * s, k * 0.35), i * 1.7, bu[i][2]]); }
  }

  /* ============================== paint ============================== */
  function paint(ctx, w, h) {
    try {
      var L = LM(w, h), s = L.s, i;
      L.lights = [];
      paintSky(ctx, L); paintSea(ctx, L);
      paintFarField(ctx, L, 420);
      // collect rafts: hex cells in view, nearest at Z = edgeZ, drawn up to Z = 420
      var list = [], set = {}, qmax = Math.ceil((420 * 0.5 * (w / L.f) + 4) / 1.5), q, r;
      for (q = -qmax; q <= qmax; q++) {
        var r0 = Math.ceil(L.edgeZ / SQ3 - q / 2), r1 = Math.floor(420 / SQ3 - q / 2);
        for (r = r0; r <= r1; r++) { var R = raftAt(L, q, r); if (R) { list.push(R); set[q + ',' + r] = 1; } }
      }
      list.sort(function (a, b) { return b.Z - a.Z || a.X - b.X; });
      var plats = PLATFORMS.slice().sort(function (a, b) { return b.Z0 - a.Z0; }), pi = 0, laneDone = false;
      for (i = 0; i < list.length; i++) {
        var R2 = list[i];
        while (pi < plats.length && plats[pi].Z0 > R2.Z) paintPlatform(ctx, L, plats[pi++]);
        if (!laneDone && R2.Z < LANE.z0) { paintLane(ctx, L); laneDone = true; }
        if (R2.Z > 150) drawFarRaft(ctx, L, R2); else drawRaft(ctx, L, R2, set);
      }
      while (pi < plats.length) paintPlatform(ctx, L, plats[pi++]);
      // the open water in front of the field stays plain and calm (props and subtitles sit here)
      ctx.fillStyle = lg(ctx, 0, L.edgeY - 30 * s, 0, h, [[0, rgba('#1f5866', 0)], [1, rgba('#1f5866', 0.22)]]); ctx.fillRect(0, L.edgeY - 30 * s, w, h - L.edgeY + 30 * s);
      finish(ctx, w, h, '#f4dcb0', 0.12, 0.16, 0.05, '#2a2030', 0.4);
    } catch (e) { PAINT._err = 'ocean_dc paint: ' + String(e && e.stack || e); }
  }

  /* ============================== overlay: swells, lights, the tanker, drones, seabirds, glints ============================== */
  var OV = memo(function (w, h) {
    var L = LM(w, h), s = L.s, r = rng(5150), i, O = {};
    // the lights: painting records them; repaint into a scratch canvas once if the overlay runs before paint
    if (!L.lights) { var c = mk(8, 8); try { paint(c ? c.getContext('2d') : null, w, h); } catch (e) {} }
    O.lights = (L.lights || []).filter(function (l) { return l[0] > -10 && l[0] < w + 10; });
    O.glints = [];
    for (i = 0; i < 46; i++) { var u = Math.pow(r(), 1.6), y = L.yh + 3 * s + u * (L.edgeY - L.yh), spread = w * 0.04 + (y - L.yh) * 0.35;
      O.glints.push([L.sun.x + (r() - 0.5) * 2 * spread * (0.4 + r() * 0.6), y, (1.2 + u * 2.2) * s, r() * TAU, 0.6 + r() * 1.4]); }
    O.clip = platformRect(L, PLATFORMS[0]);
    O.tz = LANE.zt; O.tk = L.f / O.tz; O.ty = L.P(0, O.tz, 0)[1];
    return O;
  });
  function star(ctx, x, y, r) { ctx.beginPath(); ctx.moveTo(x, y - r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.quadraticCurveTo(x, y, x, y + r); ctx.quadraticCurveTo(x, y, x - r, y); ctx.quadraticCurveTo(x, y, x, y - r); ctx.fill(); }
  function tanker(ctx, L, x, yw, k, t) {
    var s = L.s, Lt = 34, u = function (a) { return x + a * k; }, v = function (b) { return yw - b * k; }, i;
    // the wake behind the stern and a small bow wave
    ctx.strokeStyle = rgba('#f4fbf8', 0.6); ctx.lineWidth = Math.max(0.6, k * 0.18); ctx.lineCap = 'round';
    for (i = 0; i < 5; i++) { var wx = u(-2 - i * 4.5), ww = k * (3.2 - i * 0.4), ph = Math.sin(t * 1.3 + i) * k * 0.15; ctx.globalAlpha = 0.7 - i * 0.12; ctx.beginPath(); ctx.moveTo(wx - ww, yw + ph + k * 0.15); ctx.lineTo(wx, yw + ph + k * 0.1); ctx.stroke(); }
    ctx.globalAlpha = 1;
    ctx.fillStyle = rgba('#f4fbf8', 0.75); ctx.beginPath(); ctx.moveTo(u(Lt - 3.2), yw); ctx.quadraticCurveTo(u(Lt + 0.4), yw - k * 0.3, u(Lt + 1.4), yw + k * 0.35); ctx.lineTo(u(Lt - 3), yw + k * 0.25); ctx.fill();
    // the hull: navy below, a coral stripe, white above, a raked bow
    var hull = function () { ctx.beginPath(); ctx.moveTo(u(0.4), v(0)); ctx.lineTo(u(Lt - 3), v(0)); ctx.quadraticCurveTo(u(Lt - 0.6), v(0.6), u(Lt + 0.6), v(2.7)); ctx.lineTo(u(0), v(2.7)); ctx.lineTo(u(0.1), v(0.8)); ctx.closePath(); };
    hull(); ctx.fillStyle = PAL.white; ctx.fill();
    ctx.save(); hull(); ctx.clip(); ctx.fillStyle = PAL.panel; ctx.fillRect(u(-1), v(1.15), (Lt + 3) * k, 1.4 * k); ctx.fillStyle = PAL.coral; ctx.fillRect(u(-1), v(1.5), (Lt + 3) * k, 0.38 * k); ctx.restore();
    hull(); ctx.strokeStyle = rgba(PAL.ink, 0.5); ctx.lineWidth = Math.max(0.5, 0.6 * s); ctx.stroke();
    // the cargo: rows of sealed hardware pods, white and mustard, with teal seals
    for (i = 0; i < 8; i++) { var px = 6.2 + i * 3.15; if (px > Lt - 4) break;
      ctx.fillStyle = i % 3 === 1 ? PAL.mustard : PAL.whiteF; ctx.beginPath(); rrect(ctx, u(px), v(4.5), 2.75 * k, 1.8 * k, 0.6 * k); ctx.fill();
      ctx.strokeStyle = rgba(PAL.ink, 0.4); ctx.lineWidth = Math.max(0.5, 0.5 * s); ctx.stroke();
      ctx.fillStyle = PAL.teal; ctx.fillRect(u(px + 1.2), v(4.3), 0.35 * k, 1.4 * k);
      if (i % 2 === 0 && i < 6) { ctx.fillStyle = PAL.white; ctx.beginPath(); rrect(ctx, u(px + 0.3), v(6.1), 4.4 * k, 1.6 * k, 0.6 * k); ctx.fill(); ctx.strokeStyle = rgba(PAL.ink, 0.35); ctx.stroke(); } }
    // the bridge at the stern, with its window band and a mast
    ctx.fillStyle = PAL.white; ctx.beginPath(); rrect(ctx, u(0.9), v(8.2), 4.6 * k, 5.5 * k, 0.7 * k); ctx.fill(); ctx.strokeStyle = rgba(PAL.ink, 0.45); ctx.lineWidth = Math.max(0.5, 0.6 * s); ctx.stroke();
    ctx.fillStyle = PAL.panel; ctx.fillRect(u(1.2), v(7.6), 4.0 * k, 0.9 * k);
    ctx.strokeStyle = PAL.ink; ctx.lineWidth = Math.max(0.5, k * 0.12); ctx.beginPath(); ctx.moveTo(u(3.2), v(8.2)); ctx.lineTo(u(3.2), v(10.6)); ctx.moveTo(u(2.4), v(9.6)); ctx.lineTo(u(4), v(9.6)); ctx.stroke();
    var bl = Math.pow(Math.max(0, Math.sin(t * 2.2)), 6), sp = glowSpr('#ffffff', true);
    if (sp) { var z = (2 + bl * 4) * s; ctx.globalAlpha = 0.5 + bl * 0.5; ctx.drawImage(sp, u(3.2) - z, v(10.6) - z, z * 2, z * 2); ctx.globalAlpha = 1; }
  }
  function drone(ctx, x, y, sz, t, ph, beam, groundY) {
    var spin = Math.sin(t * 40 + ph);
    if (beam) {
      // its soft shadow on the raft below
      ctx.fillStyle = 'rgba(20,30,60,0.18)'; ctx.beginPath(); ctx.ellipse(x + sz * 0.3, groundY - sz * 0.15, sz * 0.9, sz * 0.22, 0, 0, TAU); ctx.fill();
      // a soft scanning beam sweeping across the raft below
      var sw = Math.sin(t * 0.8 + ph) * sz * 1.6, bw = sz * 1.5;
      ctx.fillStyle = lg(ctx, 0, y, 0, groundY, [[0, rgba('#9ff3e6', 0.32)], [1, rgba('#9ff3e6', 0.04)]]);
      ctx.beginPath(); ctx.moveTo(x - sz * 0.25, y + sz * 0.3); ctx.lineTo(x + sz * 0.25, y + sz * 0.3); ctx.lineTo(x + sw + bw, groundY); ctx.lineTo(x + sw - bw, groundY); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = rgba('#c9fff6', 0.7); ctx.lineWidth = Math.max(0.6, sz * 0.06); ctx.beginPath(); ctx.moveTo(x + sw - bw, groundY); ctx.lineTo(x + sw + bw, groundY); ctx.stroke();
    }
    ctx.lineCap = 'round';
    // arms and rotor blurs
    ctx.strokeStyle = '#9aa6bd'; ctx.lineWidth = Math.max(0.6, sz * 0.12);
    ctx.beginPath(); ctx.moveTo(x - sz * 1.05, y - sz * 0.32); ctx.lineTo(x + sz * 1.05, y - sz * 0.32); ctx.stroke();
    ctx.fillStyle = 'rgba(210,220,236,0.55)';
    for (var i = -1; i <= 1; i += 2) { ctx.beginPath(); ctx.ellipse(x + i * sz * 1.05, y - sz * 0.42, sz * (0.62 + spin * 0.12), sz * 0.12, 0, 0, TAU); ctx.fill(); }
    // the body: a rounded white shell with a teal stripe and one friendly camera eye
    ctx.fillStyle = PAL.white; ctx.beginPath(); rrect(ctx, x - sz * 0.62, y - sz * 0.48, sz * 1.24, sz * 0.8, sz * 0.36); ctx.fill();
    ctx.strokeStyle = rgba(PAL.ink, 0.55); ctx.lineWidth = Math.max(0.5, sz * 0.06); ctx.stroke();
    ctx.fillStyle = PAL.teal; ctx.fillRect(x - sz * 0.62, y - sz * 0.02, sz * 1.24, sz * 0.12);
    ctx.fillStyle = PAL.ink; ctx.beginPath(); ctx.arc(x, y + sz * 0.3, sz * 0.2, 0, TAU); ctx.fill();
    ctx.fillStyle = Math.sin(t * 3 + ph) > 0.6 ? '#7ff7e4' : '#3fc3b8'; ctx.beginPath(); ctx.arc(x, y + sz * 0.3, sz * 0.1, 0, TAU); ctx.fill();
  }
  function bird(ctx, x, y, sz, flap) {
    ctx.beginPath(); ctx.moveTo(x - sz, y - flap * sz * 0.5); ctx.quadraticCurveTo(x - sz * 0.45, y - sz * 0.35 - flap * sz * 0.2, x, y); ctx.quadraticCurveTo(x + sz * 0.45, y - sz * 0.35 - flap * sz * 0.2, x + sz, y - flap * sz * 0.5); ctx.stroke();
  }
  function overlay(ctx, w, h, t) {
    try {
      var L = LM(w, h), O = OV(w, h), s = L.s, i;
      ctx.save();
      // swells rolling in across the open water at the bottom
      ctx.strokeStyle = 'rgba(226,244,238,0.30)'; ctx.lineWidth = Math.max(0.6, 0.9 * s); ctx.lineCap = 'round';
      var top = L.edgeY + 4 * s, span = h - top;
      for (i = 0; i < 7; i++) { var u = ((i + (t * 0.035) % 1) / 7), y = top + Math.pow(u, 1.3) * span, a = Math.sin(u * PI) * 0.9;
        ctx.globalAlpha = a; ctx.beginPath();
        for (var x = -10; x <= w + 10; x += 14 * s) { var yy = y + Math.sin(x / (60 * s) + t * 0.5 + i * 1.7) * 2.2 * s * (0.5 + u); if (x <= -10) ctx.moveTo(x, yy); else ctx.lineTo(x, yy); }
        ctx.stroke(); }
      ctx.globalAlpha = 1;
      // sun glints twinkling on panels and water
      ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,244,214,0.9)';
      for (i = 0; i < O.glints.length; i++) { var G = O.glints[i], tw = Math.pow(Math.max(0, Math.sin(t * G[4] + G[3])), 8); if (tw < 0.05) continue; ctx.globalAlpha = tw; star(ctx, G[0], G[1], G[2] * (0.6 + tw * 0.6)); }
      // blinking lights: raft masts, lane buoys and the tower strobes
      for (i = 0; i < O.lights.length; i++) { var l = O.lights[i], kind = l[4], b;
        if (kind === 'strobe') b = Math.pow(Math.max(0, Math.sin(t * 1.6)), 14);
        else b = Math.pow(Math.max(0, Math.sin(t * (kind === 'nav' ? 1.1 : 1.5) + l[3])), 6);
        if (b < 0.04) continue; var col = kind === 'green' ? '#7ff7c8' : kind === 'strobe' ? '#ffffff' : '#ff6a4a', sp = glowSpr(col, true); if (!sp) continue;
        ctx.globalAlpha = b; var z = l[2] * (0.6 + b * 0.8); ctx.drawImage(sp, l[0] - z, l[1] - z, z * 2, z * 2); }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      // the data tanker crossing the lane, slowly, behind the main platform
      var per = 300, ph = ((t / per) + 0.24) % 1, tx = -0.34 * w + ph * 1.7 * w, ty = O.ty + Math.sin(t * 0.9) * 0.4 * s;
      var C = O.clip; ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, h); ctx.rect(C[2], C[1], C[0] - C[2], C[3] - C[1]); ctx.clip('evenodd');
      tanker(ctx, L, tx, ty, O.tk, t); ctx.restore();
      // the inspection drone hovering over a raft, scanning it; and two far drones on patrol
      var dx = w * L.droneAt.x + Math.sin(t * 0.35) * 6 * s, dy = h * L.droneAt.y + Math.sin(t * 1.3) * 3 * s;
      drone(ctx, dx, dy, 16 * s, t, 0, true, h * 0.765);
      for (i = 0; i < 2; i++) { var pp = t * (0.045 + i * 0.012) + i * 2.4, px = w * (i ? 0.62 + 0.06 * Math.sin(pp) : 0.16 + 0.12 * Math.sin(pp)), py = h * (i ? 0.43 : 0.5) + Math.sin(pp * 2) * h * 0.008;
        drone(ctx, px, py, (i ? 3.6 : 5.2) * s, t, i * 2, false, 0); }
      // seabirds gliding across the sky, flapping now and then
      ctx.strokeStyle = '#3b3f55'; ctx.lineWidth = Math.max(0.7, 1.1 * s);
      var BD = [[0.0, 0.22, 0.010, 5.5], [0.35, 0.13, 0.008, 4.2], [0.6, 0.3, 0.012, 6.5], [0.8, 0.19, 0.009, 3.6]];
      for (i = 0; i < BD.length; i++) { var bp = (BD[i][0] + t * BD[i][2]) % 1.25 - 0.12, bx = bp * w, by = h * BD[i][1] + Math.sin(t * 0.4 + i * 2) * 8 * s;
        var fl = Math.sin(t * 0.5 + i * 1.3) > 0.2 ? Math.sin(t * 7 + i) : 0.3; bird(ctx, bx, by, BD[i][3] * s, fl); }
      ctx.restore();
    } catch (e) { PAINT._err = 'ocean_dc overlay: ' + String(e && e.stack || e); }
  }

  // anchors (fractions of w,h): the main datacenter platform, the tanker's lane, the hovering drone, a near raft, the sun
  PAINT.ocean_dc = {
    focus: { x: 0.82, y: 0.38 }, track: 'morning',
    anchors: { datacenter: { x: 0.82, y: 0.38 }, lane: { y: 0.455 }, drone: { x: 0.2, y: 0.705 }, raft: { x: 0.79, y: 0.83 }, sun: { x: 0.2, y: 0.165 } },
    paint: function (ctx, w, h) { ctx.save(); try { paint(ctx, w, h); } finally { ctx.restore(); } },
    overlay: function (ctx, w, h, t) { ctx.save(); try { overlay(ctx, w, h, t); } finally { ctx.restore(); } }
  };

  /* tappable things: a raft, the main datacenter, the tanker's lane and the inspection drone (invisible tap targets
     over the painted shapes that flash softly when tapped) */
  if (typeof LATE !== 'undefined') LATE.push(function () {
    if (typeof PROPS === 'undefined' || typeof PROPS_ART === 'undefined') return;
    var hit = function (vw, vh, shape) { return function () { return '<svg viewBox="0 0 ' + vw + ' ' + vh + '"><g class="pa-body pa-hit">' + shape + '</g></svg>'; }; };
    PROPS_ART.raft = hit(100, 56, '<ellipse cx="50" cy="28" rx="50" ry="28" fill="#fff"/>');
    PROPS_ART.datacenter = hit(100, 90, '<rect width="100" height="90" rx="16" fill="#fff"/>');
    PROPS_ART.tanker = hit(100, 14, '<rect width="100" height="14" rx="7" fill="#fff"/>');
    PROPS_ART.drone = hit(100, 100, '<circle cx="50" cy="50" r="50" fill="#fff"/>');
    PROPS.ocean_dc = [
      { id: 'raft', x: 79, y: 86, w: 96, sfx: 'blip', fx: 'glow', burst: 'sparkles', who: 'byte',
        say: 'Each raft has solar panels on top and batteries underneath. The six sides mean every raft fits snugly against its neighbors.' },
      { id: 'datacenter', x: 83, y: 47.5, w: 140, sfx: 'chime', fx: 'glow', who: 'byte',
        say: 'Millions of AIs are thinking inside that platform right now. Cold seawater from deep below keeps their computers from overheating.' },
      { id: 'tanker', x: 46, y: 46.8, w: 360, sfx: 'whoosh', fx: 'glow', who: 'byte',
        say: 'That’s a data tanker. It brings new computer chips out here, and it carries the old ones home to be recycled.' },
      { id: 'drone', x: 20, y: 74, w: 64, sfx: 'beep', fx: 'glow', burst: 'sparkles', who: 'byte',
        say: 'That drone checks the rafts for cracks and barnacles. It gets around to each one about once a week.' }
    ];
  });
})();
