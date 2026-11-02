/* phx__kit.js - Phoenix painting pieces shared by phx_lot.js and phx_studio.js (loads before them: '_' sorts before
   letters). Uses the painting utilities in window.CHINA_KIT (src/scenes/_china_kit.js, loaded first of all scenes).
   Exposed as window.PHXK; it paints nothing by itself. Everything is seeded, so scenes paint identically every time.
     saguaro(ctx, x, yb, H, D, arms, s, o)      a saguaro: H tall, D thick; arms [[t, side, out, up]], o {lit, fruit, shadow}
     paloVerde(ctx, x, yb, H, W, s, seed, o)    a palo verde: green bark, airy yellow-green canopy
     fanPalm(ctx, x, yb, H, s, seed, o)         a tall Washingtonia fan palm with its skirt of old fronds
     creosote(ctx, x, y, R, s, r, o)            a creosote bush (small olive-green shrub)
     camelback(ctx, x0, x1, base, H, s, o)      Camelback Mountain seen from Arcadia: the head on the left, the hump on the right
     crewBot(ctx, x, yb, sz, kind, s, o)        a construction robot: 'digger' | 'printer' | 'hauler' | 'walker'
     buildYard(ctx, x0, x1, hz, s, o)           the Build Yard far off: a terraced strip mine, robot factory halls, domes,
                                                a tall tower, solar fields and a rail line (o.night: lights instead of sun)
*/
(function () {
  'use strict';
  var PI = Math.PI, TAU = PI * 2, K = null;
  function k() { return K || (K = window.CHINA_KIT); }
  var LINE = '#4a3e38';

  function ink(ctx, s, a, wd) { ctx.strokeStyle = k().rgba(LINE, a == null ? 0.5 : a); ctx.lineWidth = (wd || 0.7) * s; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }

  /* ---------------- saguaro ---------------- */
  function saguaro(ctx, x, yb, H, D, arms, s, o) {
    var K_ = k(), rgba = K_.rgba, i, j, lit = (o && o.lit) || 1, Da = D * 0.78, top = yb - H + D * 0.5;
    var pal = (o && o.pal) || ['#3f6440', '#56804f', '#77a466', '#a6cc86'];
    var runs = [[x, yb, top, D]], paths = [];
    function trunk(c) { c.beginPath(); c.moveTo(x, yb); c.lineTo(x, top); }
    for (i = 0; i < arms.length; i++) {
      var A = arms[i], ya = yb - A[0] * H, sd = A[1], ox = A[2] * D, ye = ya - A[3] * H;
      paths.push([ya, sd, ox, ye]); runs.push([x + sd * ox, ya - Da * 1.1, ye, Da]);
    }
    function arm(c, P, dx, dy) { c.beginPath(); c.moveTo(x + dx, P[0] + dy); c.lineTo(x + P[1] * D * 0.2 + dx, P[0] + dy); c.quadraticCurveTo(x + P[1] * P[2] + dx, P[0] + D * 0.15 + dy, x + P[1] * P[2] + dx, P[0] - Da * 1.1 + dy); c.lineTo(x + P[1] * P[2] + dx, P[3] + dy); }
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // cast shadow on the ground, long and low (sun from the side `lit` points to)
    if (!(o && o.noShadow)) { ctx.fillStyle = 'rgba(70,40,30,0.22)'; ctx.beginPath(); K_.qell(ctx, x - lit * H * 0.42, yb + D * 0.12, H * 0.45, D * 0.35, 0); ctx.fill(); }
    // outline, body, lit side, highlight
    var layers = [[LINE, 1.7 * s, 0, 0.75], [pal[0], 0, 0, 1], [pal[1], -0.2, 0.06, 1], [pal[2], -0.48, 0.2, 1], [pal[3], -0.8, 0.33, 0.75]];
    for (j = 0; j < layers.length; j++) {
      var Ly = layers[j], add = Ly[1];
      ctx.strokeStyle = Ly[0]; ctx.globalAlpha = Ly[3];
      ctx.lineWidth = j === 0 ? D + add : D * (1 + add); trunk(ctx); if (Ly[2]) { ctx.save(); ctx.translate(lit * D * Ly[2], 0); trunk(ctx); ctx.restore(); }
      ctx.save(); ctx.translate(lit * D * Ly[2], 0); ctx.stroke(); ctx.restore();
      for (i = 0; i < paths.length; i++) { ctx.lineWidth = j === 0 ? Da + add : Da * (1 + add); arm(ctx, paths[i], lit * Da * Ly[2], 0); ctx.stroke(); }
    }
    ctx.globalAlpha = 1;
    // ribs and spines on the upright runs
    ctx.strokeStyle = rgba(pal[0], 0.55); ctx.lineWidth = 0.55 * s; ctx.beginPath();
    for (i = 0; i < runs.length; i++) { var R = runs[i]; for (j = -2; j <= 2; j++) { var rx = R[0] + j * R[3] * 0.19; ctx.moveTo(rx, R[1] - (i ? 0 : D * 0.1)); ctx.lineTo(rx, R[2] + R[3] * 0.2); } }
    ctx.stroke();
    var sp = []; for (i = 0; i < runs.length; i++) { var R2 = runs[i]; for (j = -2; j <= 2; j++) for (var yy = R2[2] + R2[3] * 0.4; yy < R2[1]; yy += 3.2 * s) sp.push([R2[0] + j * R2[3] * 0.19, yy]); }
    ctx.fillStyle = 'rgba(248,240,214,0.55)'; ctx.beginPath(); for (i = 0; i < sp.length; i++) if ((i * 7) % 3 !== 0) ctx.rect(sp[i][0] - 0.45 * s, sp[i][1], 0.9 * s, 0.9 * s); ctx.fill();
    // ripe red fruit on the crowns (late summer)
    if (o && o.fruit) {
      var tips = [[x, top - D * 0.42, D]]; for (i = 0; i < paths.length; i++) tips.push([x + paths[i][1] * paths[i][2], paths[i][3] - Da * 0.42, Da]);
      for (i = 0; i < tips.length; i++) for (j = 0; j < 3; j++) { var fx = tips[i][0] + (j - 1) * tips[i][2] * 0.28, fy = tips[i][1] + Math.abs(j - 1) * tips[i][2] * 0.1; ctx.fillStyle = j === 1 ? '#d8404a' : '#b8303c'; ctx.beginPath(); ctx.arc(fx, fy, Math.max(0.8 * s, tips[i][2] * 0.13), 0, TAU); ctx.fill(); }
    }
    ctx.restore();
  }

  /* ---------------- palo verde ---------------- */
  function paloVerde(ctx, x, yb, H, W, s, seed, o) {
    var K_ = k(), r = K_.rng(seed), i, j, lit = (o && o.lit) || 1;
    var pal = (o && o.pal) || ['#6f8a34', '#8eaa44', '#aec456', '#d0de7a'], bark = (o && o.bark) || ['#c4d27a', '#9cb24e', '#6f8636'];
    var cy = yb - H * 0.66, cl = [];
    for (i = 0; i < 11; i++) { var a = PI + (i / 10) * PI, rr = 0.55 + r() * 0.45; cl.push([x + Math.cos(a) * W * 0.42 * rr + (r() - 0.5) * W * 0.1, cy + Math.sin(a) * H * 0.3 * rr + H * 0.06 + (r() - 0.5) * H * 0.08, W * (0.13 + r() * 0.08)]); }
    for (i = 0; i < 4; i++) cl.push([x + (r() - 0.5) * W * 0.5, cy + (r() - 0.3) * H * 0.18, W * (0.14 + r() * 0.06)]);
    ctx.save();
    if (!(o && o.noShadow)) { ctx.fillStyle = 'rgba(70,50,30,0.18)'; ctx.beginPath(); K_.qell(ctx, x - lit * W * 0.25, yb + 2 * s, W * 0.55, H * 0.06, 0); ctx.fill(); }
    // several green stems splaying from a short trunk, with twigs
    var stems = 5 + ((r() * 2) | 0), fy = yb - H * 0.22, fx = x - lit * W * 0.02;
    K_.trunkPath(ctx, x, yb, fx, fy, W * 0.07, W * 0.055, -lit * W * 0.02);
    ctx.fillStyle = K_.lg(ctx, x - W * 0.05, 0, x + W * 0.05, 0, lit > 0 ? [[0, bark[2]], [0.6, bark[1]], [1, bark[0]]] : [[0, bark[0]], [0.4, bark[1]], [1, bark[2]]]); ctx.fill(); ink(ctx, s, 0.35, 0.6);
    for (i = 0; i < stems; i++) {
      var c = cl[(i * 3 + 1) % cl.length], bx = fx + (i - stems / 2) * W * 0.01;
      K_.trunkPath(ctx, bx, fy + W * 0.01, c[0], c[1] + c[2] * 0.3, W * 0.035, W * 0.01, (r() - 0.5) * W * 0.25);
      ctx.fillStyle = K_.lg(ctx, x - W * 0.05, 0, x + W * 0.05, 0, lit > 0 ? [[0, bark[2]], [0.6, bark[1]], [1, bark[0]]] : [[0, bark[0]], [0.4, bark[1]], [1, bark[2]]]); ctx.fill();
      ink(ctx, s, 0.35, 0.6);
    }
    ctx.strokeStyle = bark[1]; ctx.lineWidth = 0.7 * s; ctx.beginPath();
    for (i = 0; i < cl.length; i++) { var c2 = cl[i]; for (j = 0; j < 3; j++) { var a2 = r() * TAU, l2 = c2[2] * (0.5 + r() * 0.6); ctx.moveTo(c2[0], c2[1] + c2[2] * 0.3); ctx.lineTo(c2[0] + Math.cos(a2) * l2, c2[1] + Math.sin(a2) * l2 * 0.7); } }
    ctx.stroke();
    // the feathery canopy: thousands of tiny leaflets, airy enough to see sky through
    var n = Math.min(3400, Math.round(W * H * 0.16 / (s * s)));
    K_.dabs(ctx, n, [[pal[0], 0.85], [pal[1], 0.85], [pal[2], 0.85], [pal[3], 0.8]], function () {
      var c3 = cl[(r() * cl.length) | 0], a3 = r() * TAU, d = c3[2] * Math.sqrt(r()), px = c3[0] + Math.cos(a3) * d, py = c3[1] + Math.sin(a3) * d * 0.72;
      var v = ((px - x) / W) * lit * 0.9 - ((py - cy) / H) * 0.9 + (r() - 0.5) * 0.7 + 0.35, b = v < 0.05 ? 0 : v < 0.35 ? 1 : v < 0.65 ? 2 : 3;
      return [px, py, (1 + r() * 1.3) * s, (0.6 + r() * 0.5) * s, b, r() * PI];
    });
    if (o && o.bloom) K_.dots(ctx, 160, [['#f2d43a', 0.9], ['#f8e870', 0.9]], function () { var c4 = cl[(r() * cl.length) | 0], a4 = r() * TAU, d4 = c4[2] * Math.sqrt(r()); return [c4[0] + Math.cos(a4) * d4, c4[1] + Math.sin(a4) * d4 * 0.7, 0.9 * s, r() < 0.5 ? 0 : 1]; });
    ctx.restore();
  }

  /* ---------------- fan palm ---------------- */
  function fanPalm(ctx, x, yb, H, s, seed, o) {
    var K_ = k(), r = K_.rng(seed), i, lean = (o && o.lean) || 0, tx = x + lean, ty = yb - H, sc = (o && o.crown) || H * 0.12;
    var pal = (o && o.pal) || ['#4f6e3e', '#6a8c4a', '#8aac5a'], far = o && o.far;
    ctx.save(); ctx.lineCap = 'round';
    // slim trunk with ring marks
    ctx.strokeStyle = far ? (o.trunk || '#8a7c6c') : '#7a6a58'; ctx.lineWidth = Math.max(1, H * 0.022); ctx.beginPath(); ctx.moveTo(x, yb); ctx.quadraticCurveTo(x + lean * 0.2, yb - H * 0.5, tx, ty + sc * 0.6); ctx.stroke();
    if (!far) { ctx.strokeStyle = 'rgba(60,44,30,0.45)'; ctx.lineWidth = 0.6 * s; ctx.beginPath(); for (i = 0; i < 18; i++) { var t = i / 18, px = K_.bez(x, x + lean * 0.2, tx, t), py = K_.bez(yb, yb - H * 0.5, ty + sc * 0.6, t); ctx.moveTo(px - H * 0.012, py); ctx.lineTo(px + H * 0.012, py); } ctx.stroke(); }
    // the skirt of old brown fronds
    ctx.fillStyle = far ? (o.skirt || '#a08e70') : '#a08a62'; ctx.beginPath(); ctx.moveTo(tx - sc * 0.32, ty + sc * 0.05); ctx.quadraticCurveTo(tx - sc * 0.3, ty + sc * 0.8, tx - sc * 0.06, ty + sc * 1.25); ctx.lineTo(tx + sc * 0.06, ty + sc * 1.25); ctx.quadraticCurveTo(tx + sc * 0.3, ty + sc * 0.8, tx + sc * 0.32, ty + sc * 0.05); ctx.closePath(); ctx.fill();
    if (!far) { ctx.strokeStyle = 'rgba(90,66,40,0.6)'; ctx.lineWidth = 0.6 * s; ctx.beginPath(); for (i = 0; i < 9; i++) { var u = (i / 8 - 0.5) * 0.55; ctx.moveTo(tx + u * sc, ty + sc * 0.1); ctx.lineTo(tx + u * sc * 0.4, ty + sc * (0.9 + r() * 0.3)); } ctx.stroke(); }
    // green fan crown: fronds radiating up and drooping at the sides
    var nf = far ? 10 : 15;
    for (i = 0; i < nf; i++) {
      var a = -PI + (i / (nf - 1)) * PI + (r() - 0.5) * 0.2, droop = Math.abs(Math.cos(a)), L = sc * (0.75 + r() * 0.3), ex = tx + Math.cos(a) * L, ey = ty + Math.sin(a) * L * 0.8 + droop * L * 0.5;
      ctx.fillStyle = pal[i % pal.length]; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.quadraticCurveTo(tx + Math.cos(a - 0.25) * L * 0.6, ty + Math.sin(a - 0.25) * L * 0.5, ex, ey);
      ctx.lineTo(tx + Math.cos(a + 0.22) * L * 0.95, ty + Math.sin(a + 0.22) * L * 0.75 + droop * L * 0.4); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  function creosote(ctx, x, y, R, s, r, o) {
    var K_ = k(), pal = (o && o.pal) || ['#5e6a34', '#7a8640', '#9aa452'];
    ctx.save(); ctx.fillStyle = 'rgba(70,50,30,0.2)'; ctx.beginPath(); K_.qell(ctx, x - R * 0.4, y + R * 0.08, R * 1.1, R * 0.2, 0); ctx.fill();
    ctx.strokeStyle = '#6a5a40'; ctx.lineWidth = 0.6 * s; ctx.beginPath(); for (var i = 0; i < 6; i++) { var a = -PI * (0.2 + i * 0.12); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * R, y + Math.sin(a) * R * 0.9); } ctx.stroke();
    K_.dabs(ctx, Math.round(18 + R / s * 3), [[pal[0], 0.9], [pal[1], 0.9], [pal[2], 0.85]], function () { var a = -PI * (0.1 + r() * 0.8), d = R * Math.sqrt(r()); return [x + Math.cos(a) * d, y + Math.sin(a) * d * 0.8 - R * 0.15, (0.8 + r()) * s, (0.5 + r() * 0.5) * s, r() < 0.3 ? 0 : r() < 0.7 ? 1 : 2, r() * PI]; });
    ctx.restore();
  }

  /* ---------------- Camelback Mountain ---------------- */
  function camelProfile(u) {
    var head = Math.abs(u - 0.17) < 0.105 ? 0.44 * Math.sqrt(Math.max(0, 1 - Math.pow(Math.abs(u - 0.17) / 0.105, 3))) : 0;
    var hump = Math.exp(-Math.pow(Math.abs(u - 0.6) / 0.24, 2.6)), base = 0.2 * Math.max(0, 1 - Math.pow((u - 0.5) / 0.5, 4));
    var tail = u > 0.6 ? 0.18 * Math.exp(-Math.pow((u - 0.86) / 0.1, 2)) : 0;
    return Math.max(head, hump, base, tail);
  }
  function camelback(ctx, x0, x1, base, H, s, o) {
    var K_ = k(), r = K_.rng(4407), i, W = x1 - x0, night = o && o.night;
    var pal = (o && o.pal) || ['#9a6a5e', '#b98068', '#d49a78', '#e8bc94'], haze = (o && o.haze) || '#efe0cc', red = (o && o.red) || '#c4644a';
    function Y(x) { var u = (x - x0) / W; return base - H * (camelProfile(u) + 0.022 * (K_.fbm(u * 9, 4417, 4) - 0.5) + 0.01 * (K_.fbm(u * 40, 4419, 2) - 0.5)); }
    ctx.save();
    K_.ridge(ctx, x0, x1, 1.5 * s, Y, base + 2 * s, pal[0]);
    ctx.save(); ctx.clip();
    // light from the east (right): faces that drop to the right are lit
    for (var x = x0; x < x1; x += 1.5 * s) {
      var y = Y(x), slope = (Y(x + 3 * s) - Y(x - 3 * s)) / (6 * s), t = K_.clamp(0.5 + slope * 1.4, 0, 1);
      var col = t > 0.62 ? pal[3] : t > 0.5 ? pal[2] : t > 0.38 ? pal[1] : pal[0];
      if (night) col = t > 0.5 ? pal[1] : pal[0];
      ctx.fillStyle = col; ctx.fillRect(x, y, 1.6 * s, (base - y) * (0.35 + 0.5 * K_.fbm(x / W * 6, 4431, 3)));
    }
    // the red sandstone cliffs of the head
    if (!night) {
      ctx.fillStyle = K_.rgba(red, 0.75); ctx.beginPath(); ctx.moveTo(x0 + W * 0.08, base - H * 0.1);
      for (i = 0; i <= 20; i++) { var u = 0.075 + i * 0.0095, xx = x0 + W * u; ctx.lineTo(xx, Y(xx) + H * 0.025); }
      for (i = 20; i >= 0; i--) { var u2 = 0.075 + i * 0.0095, xx2 = x0 + W * u2; ctx.lineTo(xx2, Y(xx2) + H * (0.13 + 0.06 * Math.sin(i * 0.9))); }
      ctx.closePath(); ctx.fill();
    }
    // gullies running down from the ridge, and scrub dotting the slopes
    K_.batch(ctx, 90, [[K_.mix(pal[0], '#5a3a34', 0.4), 0.8 * s, 0.4], [pal[3], 0.7 * s, night ? 0 : 0.35]], function (j) {
      var xx = x0 + W * (0.06 + r() * 0.9), yy = Y(xx) + 2 * s, len = (base - yy) * (0.3 + r() * 0.5), dx = (r() - 0.5) * len * 0.5;
      return [xx, yy, xx + dx, yy + len, j % 3 === 0 ? 1 : 0, xx + dx * 0.2, yy + len * 0.5];
    });
    K_.dots(ctx, 520, [[night ? '#2a3040' : '#6a6a3e', 0.55], [night ? '#323a4a' : '#86803e', 0.45]], function () {
      var xx = x0 + r() * W, top = Y(xx), yy = top + Math.pow(r(), 0.6) * (base - top); if (yy < top + 3 * s) return null;
      return [xx, yy, (0.5 + r() * 0.8) * s, r() < 0.5 ? 0 : 1];
    });
    // distance haze at the foot
    ctx.fillStyle = K_.lg(ctx, 0, base - H * 0.5, 0, base, [[0, K_.rgba(haze, 0)], [1, K_.rgba(haze, night ? 0.25 : 0.7)]]); ctx.fillRect(x0, base - H * 0.5, W, H * 0.5 + 2 * s);
    ctx.restore();
    // fine ridge line
    ctx.beginPath(); for (x = x0; x <= x1; x += 2 * s) { if (x === x0) ctx.moveTo(x, Y(x)); else ctx.lineTo(x, Y(x)); }
    ctx.strokeStyle = K_.rgba(night ? '#8a90b8' : LINE, night ? 0.5 : 0.4); ctx.lineWidth = 0.7 * s; ctx.stroke();
    ctx.restore();
    return Y;
  }

  /* ---------------- construction robots ---------------- */
  // (x, yb) = ground centre; sz ~ body height in px; o {dir: 1 faces right, night, body, trim}
  function crewBot(ctx, x, yb, sz, kind, s, o) {
    var K_ = k(), rr = K_.rrect, d = (o && o.dir) || 1, body = (o && o.body) || '#f2efe6', trim = (o && o.trim) || '#f0b020', dark = '#3a3e48', eye = (o && o.eye) || '#7ff7e4';
    var shade = K_.mix(body, '#8a8478', 0.35), u = sz / 10;
    ctx.save(); ctx.translate(x, yb); ctx.scale(d, 1); ctx.lineJoin = 'round';
    ctx.fillStyle = 'rgba(40,30,30,0.25)'; ctx.beginPath(); K_.qell(ctx, 0, 0, sz * 0.75, sz * 0.09, 0); ctx.fill();
    function box(x0, y0, ww, hh, rad, fill) { ctx.beginPath(); rr(ctx, x0, y0, ww, hh, rad); ctx.fillStyle = fill; ctx.fill(); ink(ctx, s, 0.55, 0.7); }
    if (kind === 'digger') {
      box(-6 * u, -2.6 * u, 12 * u, 2.6 * u, 1.3 * u, dark);
      ctx.fillStyle = '#5a5e68'; for (var i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(-4.4 * u + i * 2.9 * u, -1.3 * u, 0.8 * u, 0, TAU); ctx.fill(); }
      box(-5 * u, -7.6 * u, 8 * u, 5.2 * u, 1.4 * u, body); ctx.fillStyle = trim; ctx.fillRect(-5 * u, -4.6 * u, 8 * u, 1.1 * u);
      box(-3.6 * u, -9.8 * u, 4.6 * u, 2.6 * u, 1.1 * u, shade); ctx.fillStyle = '#2a2a34'; ctx.beginPath(); rr(ctx, -3 * u, -9.2 * u, 3.4 * u, 1.3 * u, 0.6 * u); ctx.fill();
      ctx.fillStyle = eye; ctx.fillRect(-2.6 * u, -8.9 * u, 2.6 * u, 0.6 * u);
      // the arm: boom up and out, stick down, bucket
      ctx.lineCap = 'round'; ctx.strokeStyle = LINE; ctx.lineWidth = 1.9 * u; ctx.beginPath(); ctx.moveTo(2.5 * u, -6 * u); ctx.lineTo(7 * u, -11 * u); ctx.lineTo(10.5 * u, -5 * u); ctx.stroke();
      ctx.strokeStyle = trim; ctx.lineWidth = 1.3 * u; ctx.stroke();
      ctx.fillStyle = dark; ctx.beginPath(); ctx.moveTo(9 * u, -5.4 * u); ctx.lineTo(12.4 * u, -5 * u); ctx.lineTo(11.8 * u, -2.6 * u); ctx.quadraticCurveTo(10 * u, -2.2 * u, 9 * u, -3.6 * u); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ff6a4a'; ctx.beginPath(); ctx.arc(-2.4 * u, -10.4 * u, 0.55 * u, 0, TAU); ctx.fill();
    } else if (kind === 'printer') {
      // a concrete-printing gantry: two legs on wheels, a cross beam, the print head hanging under it
      ctx.strokeStyle = LINE; ctx.lineWidth = 1.5 * u; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-7 * u, -0.8 * u); ctx.lineTo(-6 * u, -13 * u); ctx.moveTo(7 * u, -0.8 * u); ctx.lineTo(6 * u, -13 * u); ctx.stroke();
      ctx.strokeStyle = trim; ctx.lineWidth = 0.9 * u; ctx.stroke();
      box(-7.6 * u, -14.4 * u, 15.2 * u, 1.8 * u, 0.6 * u, body); ctx.fillStyle = trim; for (i = 0; i < 6; i++) ctx.fillRect(-6.8 * u + i * 2.4 * u, -14.4 * u, 1.2 * u, 1.8 * u);
      ctx.strokeStyle = '#6a6e78'; ctx.lineWidth = 0.5 * u; ctx.beginPath(); ctx.moveTo(1 * u, -12.6 * u); ctx.lineTo(1 * u, -8 * u); ctx.stroke();
      box(-0.6 * u, -8.2 * u, 3.2 * u, 3 * u, 0.8 * u, shade); ctx.fillStyle = dark; ctx.beginPath(); ctx.moveTo(0.2 * u, -5.2 * u); ctx.lineTo(1.8 * u, -5.2 * u); ctx.lineTo(1 * u, -3.8 * u); ctx.fill();
      ctx.fillStyle = eye; ctx.fillRect(0 * u, -7.4 * u, 2 * u, 0.5 * u);
      ctx.fillStyle = dark; [[-7, -0.8], [7, -0.8]].forEach(function (p) { ctx.beginPath(); ctx.arc(p[0] * u, p[1] * u, 1 * u, 0, TAU); ctx.fill(); });
      ctx.fillStyle = '#ff6a4a'; ctx.beginPath(); ctx.arc(-6 * u, -15 * u, 0.55 * u, 0, TAU); ctx.fill();
    } else if (kind === 'hauler') {
      ctx.fillStyle = dark; for (i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-4.5 * u + i * 4.5 * u, -1.2 * u, 1.25 * u, 0, TAU); ctx.fill(); }
      box(-6.5 * u, -4.4 * u, 13 * u, 2.6 * u, 0.9 * u, body); ctx.fillStyle = trim; ctx.fillRect(-6.5 * u, -2.6 * u, 13 * u, 0.7 * u);
      ctx.beginPath(); ctx.moveTo(-6 * u, -4.4 * u); ctx.lineTo(-6.6 * u, -8.4 * u); ctx.lineTo(3.6 * u, -8.4 * u); ctx.lineTo(3.2 * u, -4.4 * u); ctx.closePath(); ctx.fillStyle = shade; ctx.fill(); ink(ctx, s, 0.55, 0.7);
      ctx.fillStyle = (o && o.load) || '#c9a070'; ctx.beginPath(); ctx.moveTo(-6.4 * u, -8.3 * u); ctx.quadraticCurveTo(-1.5 * u, -11.4 * u, 3.4 * u, -8.3 * u); ctx.fill();
      box(3.8 * u, -8 * u, 3 * u, 3.6 * u, 1 * u, body); ctx.fillStyle = '#2a2a34'; ctx.fillRect(4.6 * u, -7.2 * u, 1.8 * u, 1.2 * u); ctx.fillStyle = eye; ctx.fillRect(4.8 * u, -6.9 * u, 1.4 * u, 0.5 * u);
      ctx.fillStyle = '#ff6a4a'; ctx.beginPath(); ctx.arc(5.3 * u, -8.5 * u, 0.5 * u, 0, TAU); ctx.fill();
    } else {
      // walker: a small four-legged survey robot
      ctx.strokeStyle = LINE; ctx.lineWidth = 0.9 * u; ctx.lineCap = 'round'; ctx.beginPath();
      [[-3.4, 1], [-1.4, -1], [1.6, 1], [3.6, -1]].forEach(function (L) { ctx.moveTo(L[0] * u, -5 * u); ctx.lineTo(L[0] * u + L[1] * 1.2 * u, -2.6 * u); ctx.lineTo(L[0] * u + L[1] * 0.4 * u, 0); }); ctx.stroke();
      box(-4.6 * u, -7.4 * u, 9.2 * u, 3.4 * u, 1.6 * u, body); ctx.fillStyle = trim; ctx.fillRect(-4.6 * u, -5.4 * u, 9.2 * u, 0.7 * u);
      box(3.4 * u, -9.2 * u, 3.4 * u, 2.6 * u, 1 * u, shade); ctx.fillStyle = eye; ctx.fillRect(4.4 * u, -8.3 * u, 1.8 * u, 0.6 * u);
      ctx.strokeStyle = '#6a6e78'; ctx.lineWidth = 0.4 * u; ctx.beginPath(); ctx.moveTo(-3 * u, -7.4 * u); ctx.lineTo(-3.4 * u, -10 * u); ctx.stroke(); ctx.fillStyle = '#ff6a4a'; ctx.beginPath(); ctx.arc(-3.4 * u, -10.2 * u, 0.5 * u, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }

  /* ---------------- the Build Yard, far off on the horizon ---------------- */
  function buildYard(ctx, x0, x1, hz, s, o) {
    var K_ = k(), r = K_.rng(5501), W = x1 - x0, i, night = o && o.night, Hm = (o && o.H) || 22 * s;
    var pal = night ? { hill: '#3a3a58', band: ['#45405e', '#3a3654'], hall: '#4a4a66', roof: '#56567a', solar: '#2a3050', plain: '#34324e' }
      : { hill: '#d8b894', band: ['#e6c8a0', '#caa47c', '#b88e68'], hall: '#f4f0e6', roof: '#d8d4cc', solar: '#6a7898', plain: '#ead8bc' };
    ctx.save();
    // the plain
    ctx.fillStyle = pal.plain; ctx.fillRect(x0, hz - 2 * s, W, 4 * s);
    // the strip mine: a stepped canyon cut into the hills on the left part
    var mx = x0 + W * 0.28, mw = W * 0.46, top = hz - Hm * 0.9;
    K_.ridge(ctx, x0, x0 + W * 0.62, 2 * s, function (x) { var u = (x - x0) / (W * 0.62); return hz - Hm * (0.5 + 0.4 * Math.sin(u * PI)) - Hm * 0.12 * K_.fbm(u * 5, 5511, 3); }, hz + 1 * s, pal.hill);
    for (i = 0; i < 7; i++) {
      var t = i / 7, bw = mw * (1 - t * 0.75), by = top + t * Hm * 0.85;
      ctx.fillStyle = pal.band[i % pal.band.length]; ctx.beginPath(); ctx.moveTo(mx - bw / 2, by); ctx.lineTo(mx + bw / 2, by); ctx.lineTo(mx + bw / 2 - mw * 0.05, by + Hm * 0.13); ctx.lineTo(mx - bw / 2 + mw * 0.05, by + Hm * 0.13); ctx.closePath(); ctx.fill();
      if (!night) { ctx.strokeStyle = K_.rgba('#8a6a4e', 0.45); ctx.lineWidth = 0.5 * s; ctx.beginPath(); ctx.moveTo(mx - bw / 2, by); ctx.lineTo(mx + bw / 2, by); ctx.stroke(); }
    }
    // the robot factory: long sawtooth halls, white domes and one tall tower with a ring
    var fx = x0 + W * 0.62, fw = W * 0.36;
    for (i = 0; i < 4; i++) {
      var hx = fx + i * fw * 0.24, hw = fw * 0.22, hh = (5 + (i % 2) * 2) * s, hy = hz - hh - (i % 2) * 1.5 * s;
      ctx.fillStyle = pal.hall; ctx.fillRect(hx, hy, hw, hh + (i % 2) * 1.5 * s);
      ctx.fillStyle = pal.roof; ctx.beginPath(); for (var j = 0; j < 6; j++) { var sx = hx + j * hw / 6; ctx.moveTo(sx, hy); ctx.lineTo(sx + hw / 6, hy - 1.6 * s); ctx.lineTo(sx + hw / 6, hy); } ctx.fill();
      if (!night) { ctx.fillStyle = 'rgba(80,90,110,0.35)'; for (j = 0; j < 5; j++) ctx.fillRect(hx + hw * (0.1 + j * 0.18), hy + hh * 0.35, hw * 0.08, hh * 0.35); }
    }
    ctx.fillStyle = pal.hall; [[0.5, 4], [0.64, 5.4], [0.78, 3.6]].forEach(function (d) { ctx.beginPath(); ctx.arc(fx + fw * d[0], hz, d[1] * s, PI, TAU); ctx.fill(); });
    var tx = fx + fw * 0.58, th = Hm * 2.1;
    ctx.fillStyle = night ? '#5a5a7a' : '#f8f6f0'; ctx.fillRect(tx - 0.9 * s, hz - th, 1.8 * s, th);
    ctx.fillStyle = night ? '#6a6a8a' : '#e8e4dc'; ctx.beginPath(); K_.qell(ctx, tx, hz - th * 0.86, 3.4 * s, 1.1 * s, 0); ctx.fill();
    ctx.fillStyle = night ? '#4a4a6a' : '#5a7a9a'; ctx.fillRect(tx - 3.2 * s, hz - th * 0.86 - 0.4 * s, 6.4 * s, 0.6 * s);
    ctx.strokeStyle = night ? '#6a6a8a' : '#c8c4bc'; ctx.lineWidth = 0.5 * s; ctx.beginPath(); ctx.moveTo(tx, hz - th); ctx.lineTo(tx, hz - th - 4 * s); ctx.stroke();
    // solar fields to the horizon, a rail line with a long train
    ctx.fillStyle = pal.solar; for (i = 0; i < 4; i++) ctx.fillRect(x0 + W * (0.02 + i * 0.24), hz + 0.4 * s, W * 0.2, 1.2 * s);
    if (!night) { ctx.fillStyle = 'rgba(255,255,255,0.55)'; for (i = 0; i < 40; i++) ctx.fillRect(x0 + r() * W, hz + 0.4 * s + r() * 1.2 * s, 1.6 * s, 0.3 * s); }
    ctx.strokeStyle = night ? '#4a4a6a' : '#9a8c7c'; ctx.lineWidth = 0.6 * s; ctx.beginPath(); ctx.moveTo(x0, hz + 2.2 * s); ctx.lineTo(x1, hz + 1.8 * s); ctx.stroke();
    ctx.fillStyle = night ? '#4a4a6a' : '#c0584a'; for (i = 0; i < 12; i++) ctx.fillRect(x0 + W * 0.3 + i * 2.4 * s, hz + 0.6 * s, 2 * s, 1.3 * s);
    if (night) {
      K_.dots(ctx, 120, [['#ffc870', 0.9], ['#fff0c8', 0.8]], function () { var xx = x0 + W * (0.25 + r() * 0.75), yy = hz - r() * 7 * s; return [xx, yy, (0.35 + r() * 0.4) * s, r() < 0.7 ? 0 : 1]; });
      var sp = K_.glowSpr('#ffb860'); if (sp) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.35; ctx.drawImage(sp, fx - 10 * s, hz - 16 * s, fw + 20 * s, 24 * s); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
    }
    ctx.restore();
    return { tower: [tx, hz - th - 4 * s] };
  }

  window.PHXK = { LINE: LINE, ink: ink, saguaro: saguaro, paloVerde: paloVerde, fanPalm: fanPalm, creosote: creosote, camelback: camelback, camelProfile: camelProfile, crewBot: crewBot, buildYard: buildYard };
})();
