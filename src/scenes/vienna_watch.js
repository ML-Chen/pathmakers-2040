/* vienna_watch.js - the AI Watchtower's audit room in Vienna (a game invention), high above the Danube beside the
   real Vienna International Centre (VIC). Defines PAINT.vienna_watch (summer morning) and PAINT.vienna_night (the same
   view at night), both painted by one function with two palettes, using window.VIENNA_KIT (src/scenes/vienna_kit.js).
   The view looks south-west across the river: the VIC's curved Y-shaped towers on the left, the New Danube, the long
   green Danube Island, the main Danube and the Reichsbrücke bridge, then the old city with St. Stephen's Cathedral,
   the Giant Ferris Wheel in the Prater on the left, the Danube Tower and the black DC Tower on the right, and the
   Vienna Woods with the Kahlenberg mast on the horizon. Lower third: a calm stone floor for subtitles and props. */
(function () {
  'use strict';
  var PAINT = (window.PAINT = window.PAINT || {});
  var K = window.VIENNA_KIT; if (!K) return;
  var PI = K.PI, TAU = K.TAU, rng = K.rng, hash = K.hash, fbm = K.fbm, clamp = K.clamp, lerp = K.lerp, mix = K.mix, rgba = K.rgba,
    lg = K.lg, rg = K.rg, S = K.S, memo = K.memo, poly = K.poly, rrect = K.rrect, glow = K.glow, softGlow = K.softGlow, wisp = K.wisp,
    haze = K.haze, band = K.band, finish = K.finish, shafts = K.shafts, batch = K.batch, dots = K.dots, rects = K.rects, qell = K.qell,
    reflect = K.reflect, glowSpr = K.glowSpr, cloudForm = K.cloudForm, skyStrokes = K.skyStrokes, clump = K.clump, ridge = K.ridge, drawBird = K.drawBird, mark = K.mark;

  var DAY = {
    sky: [[0, '#4f93dc'], [0.38, '#83b9ea'], [0.75, '#c4def0'], [1, '#f4ead8']], warm: '#ffe6c0', cool: '#4a84cc',
    hill: ['#8aa6b8', '#9fb6c4'], city: '#c9d2da', cityLit: '#f2e6d4', roof: '#b48c7c', roofG: '#8aa49a', haze: '#dfe8ee', win: '#8a98aa',
    water: [[0, '#a8c8d8'], [0.5, '#6f9fb8'], [1, '#4f839e']], island: ['#3c6a3c', '#4f8a46', '#6aa858', '#a8cc78', '#e2eeb0'],
    vic: '#eef0f2', vicShade: '#b8c0cc', vicBand: '#3a3f4e', stone: '#efe6d6', spire: '#7a6a5a', tileA: '#e8b830', tileB: '#3a4644',
    wheel: '#c0392b', dct: '#2a2f3a', ceil: ['#c8a074', '#e2c49a'], frame: '#f4f2ee', floor: [[0, '#e8dccb'], [1, '#c9b79f']], floorRef: '#ffffff',
    lightLeft: '#fff4dc', night: false
  };
  var NIGHT = {
    sky: [[0, '#0d1238'], [0.45, '#1c2560'], [0.8, '#3a3f7c'], [1, '#6a5a86']], warm: '#ffd9a0', cool: '#2a3070',
    hill: ['#1a2046', '#232a58'], city: '#262c58', cityLit: '#ffd88a', roof: '#30305a', roofG: '#283a52', haze: '#3a3a72', win: '#ffd27a',
    water: [[0, '#2a3466'], [0.5, '#1c2654'], [1, '#141c44']], island: ['#0e1a26', '#16283a', '#1e3446', '#2c4656', '#46606e'],
    vic: '#3a4070', vicShade: '#262a52', vicBand: '#ffe2a0', stone: '#f4d8a0', spire: '#c8a070', tileA: '#c89a40', tileB: '#2a4a46',
    wheel: '#ff6a5a', dct: '#151826', ceil: ['#4a3a3a', '#6a5040'], frame: '#5a5a78', floor: [[0, '#4a4060'], [1, '#2a2440']], floorRef: '#ffd9a0',
    lightLeft: '#ffd9a0', night: true
  };

  var watchL = memo(function (w, h) {
    var s = S(w, h);
    return { s: s, ceil: h * 0.055, sill: h * 0.6, hz: h * 0.33, far: h * 0.345, dan0: h * 0.37, isl0: h * 0.418, isl1: h * 0.436, nd1: h * 0.462, near: h * 0.47,
      wheel: [w * 0.43, h * 0.312, h * 0.024], steph: [w * 0.585, h * 0.335], dtower: [w * 0.885, h * 0.47], dct: [w * 0.735, w * 0.055],
      mull: [0.015, 0.35, 0.65, 0.985], transom: h * 0.215 };
  });

  /* St. Stephen's Cathedral, small and far: the steep roof with its zigzag tiles and the tall Gothic south tower */
  function stephansdom(ctx, x, base, H, P, s) {
    var rw = H * 0.62, rh = H * 0.28, r0 = base - H * 0.12;
    ctx.fillStyle = P.stone; ctx.fillRect(x - rw * 0.55, r0, rw * 1.1, H * 0.12);
    // roof
    poly(ctx, [[x - rw * 0.55, r0], [x - rw * 0.42, r0 - rh], [x + rw * 0.42, r0 - rh], [x + rw * 0.55, r0]]);
    ctx.fillStyle = P.tileB; ctx.fill();
    ctx.save(); ctx.clip(); ctx.strokeStyle = P.tileA; ctx.lineWidth = Math.max(0.6, 0.7 * s);
    for (var k = 0; k < 4; k++) { var yy = r0 - rh * (0.2 + k * 0.22); ctx.beginPath(); for (var i = 0; i <= 14; i++) { var xx = x - rw * 0.55 + i * rw * 1.1 / 14; ctx.lineTo(xx, yy + (i % 2 ? -rh * 0.08 : 0)); } ctx.stroke(); }
    ctx.restore();
    // south tower: square base, setbacks, then the needle spire with pinnacles
    var tx = x + rw * 0.18, tw = H * 0.1;
    ctx.fillStyle = P.spire;
    poly(ctx, [[tx - tw, base], [tx - tw, base - H * 0.42], [tx - tw * 0.8, base - H * 0.5], [tx - tw * 0.6, base - H * 0.62], [tx - tw * 0.18, base - H], [tx + tw * 0.18, base - H], [tx + tw * 0.6, base - H * 0.62], [tx + tw * 0.8, base - H * 0.5], [tx + tw, base - H * 0.42], [tx + tw, base]]);
    ctx.fill();
    ctx.fillStyle = P.night ? 'rgba(255,220,150,0.35)' : 'rgba(255,240,220,0.45)'; poly(ctx, [[tx - tw, base], [tx - tw, base - H * 0.42], [tx - tw * 0.8, base - H * 0.5], [tx - tw * 0.6, base - H * 0.62], [tx - tw * 0.18, base - H], [tx, base - H], [tx, base]]); ctx.fill();
    ctx.strokeStyle = P.spire; ctx.lineWidth = Math.max(0.5, 0.5 * s); ctx.beginPath();
    [0.5, 0.62, 0.75].forEach(function (f) { ctx.moveTo(tx - tw * (1.05 - f * 0.6), base - H * f); ctx.lineTo(tx - tw * (1.05 - f * 0.6), base - H * f - H * 0.06); ctx.moveTo(tx + tw * (1.05 - f * 0.6), base - H * f); ctx.lineTo(tx + tw * (1.05 - f * 0.6), base - H * f - H * 0.06); });
    ctx.stroke();
    // the shorter north tower with its Renaissance cap
    var nx = x - rw * 0.3; ctx.fillStyle = P.spire; ctx.fillRect(nx - tw * 0.7, base - H * 0.42, tw * 1.4, H * 0.3);
    ctx.beginPath(); ctx.ellipse(nx, base - H * 0.43, tw * 0.75, tw * 0.55, 0, PI, TAU); ctx.fill();
  }
  /* The Giant Ferris Wheel: static A-frame legs (paint) and the turning wheel (drawn by wheelRim) */
  function wheelLegs(ctx, cx, cy, R, P, s) {
    ctx.strokeStyle = P.night ? '#8a7aa8' : '#7a6a72'; ctx.lineWidth = Math.max(1, 1.4 * s);
    ctx.beginPath(); ctx.moveTo(cx - R * 0.55, cy + R * 1.05); ctx.lineTo(cx, cy); ctx.lineTo(cx + R * 0.55, cy + R * 1.05); ctx.moveTo(cx - R * 0.3, cy + R * 0.55); ctx.lineTo(cx + R * 0.3, cy + R * 0.55); ctx.stroke();
  }
  function wheelRim(ctx, cx, cy, R, rot, P, s, a) {
    ctx.save(); ctx.globalAlpha = a == null ? 1 : a;
    ctx.strokeStyle = P.night ? '#b8a0e0' : '#6a5a64'; ctx.lineWidth = Math.max(0.6, 0.8 * s);
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
    ctx.lineWidth = Math.max(0.4, 0.45 * s); ctx.beginPath(); ctx.arc(cx, cy, R * 0.93, 0, TAU);
    for (var i = 0; i < 15; i++) { var an = rot + i * TAU / 15; ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(an) * R, cy + Math.sin(an) * R); }
    ctx.stroke();
    for (i = 0; i < 15; i++) {
      var a2 = rot + i * TAU / 15, gx = cx + Math.cos(a2) * R, gy = cy + Math.sin(a2) * R + R * 0.06;
      ctx.fillStyle = P.wheel; ctx.beginPath(); rrect(ctx, gx - R * 0.07, gy - R * 0.03, R * 0.14, R * 0.09, R * 0.02); ctx.fill();
      if (P.night) { ctx.fillStyle = 'rgba(255,230,160,0.9)'; ctx.fillRect(gx - R * 0.045, gy - R * 0.012, R * 0.09, R * 0.03); }
    }
    ctx.restore();
  }
  /* A VIC tower seen from nearby: a tall slab whose outer face curves inward, banded with dark window strips */
  function vicTower(ctx, x0, x1, top, base, hz, P, s, r, lit) {
    var wdt = x1 - x0, i;
    // outline: straight left edge, gently domed crown, concave right edge
    function rightX(y) { var t = (y - top) / (base - top); return x1 - Math.sin(clamp(t, 0, 1) * PI) * wdt * 0.06; }
    ctx.save(); ctx.beginPath(); ctx.moveTo(x0, base); ctx.lineTo(x0, top + 3 * s); ctx.quadraticCurveTo(x0 + wdt * 0.5, top - 2 * s, x1, top + 2 * s);
    for (i = 0; i <= 24; i++) { var yy = lerp(top + 2 * s, base, i / 24); ctx.lineTo(rightX(yy), yy); }
    ctx.closePath();
    ctx.fillStyle = lg(ctx, x0, 0, x1, 0, P.night ? [[0, '#20244a'], [0.6, P.vic], [1, '#4a5080']] : [[0, '#c9ced6'], [0.35, '#eceef0'], [0.8, '#f8f8f6'], [1, '#dfe3e8']]); ctx.fill(); ctx.clip();
    // ribbon windows: each band dips toward the horizon in the middle, because the face curves away
    var floors = Math.max(8, Math.round((base - top) / (5.2 * s)));
    for (i = 1; i < floors; i++) {
      var y0 = lerp(top + 4 * s, base, i / floors), k = (hz - y0) * 0.05, bh = 2.3 * s;
      ctx.beginPath(); ctx.moveTo(x0 - 2, y0); ctx.quadraticCurveTo(x0 + wdt * 0.55, y0 + k * 2, x1 + 2, y0); ctx.lineTo(x1 + 2, y0 + bh); ctx.quadraticCurveTo(x0 + wdt * 0.55, y0 + bh + k * 2, x0 - 2, y0 + bh); ctx.closePath();
      var u = (y0 - top) / (base - top);
      ctx.fillStyle = P.night ? '#141838' : lg(ctx, x0, 0, x1, 0, [[0, '#56627a'], [0.5, mix('#7c94b4', '#a8c4dc', 1 - u)], [1, '#4a566e']]); ctx.fill();
      if (P.night) for (var q = 0; q < 9; q++) if (r() < (lit || 0.3)) { ctx.fillStyle = r() < 0.75 ? '#ffe2a0' : '#cfe8ff'; var qx = x0 + wdt * (q + 0.1) / 9; ctx.fillRect(qx, y0 + k * 2 * Math.sin((q + 0.5) / 9 * PI) + 0.3 * s, wdt / 9 * 0.8, bh - 0.6 * s); }
    }
    // a vertical seam where two wings meet, and shade along the left edge
    ctx.fillStyle = P.night ? 'rgba(0,0,0,0.3)' : 'rgba(80,90,110,0.18)'; ctx.fillRect(x0, top, wdt * 0.12, base - top);
    ctx.fillStyle = P.night ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.35)'; ctx.fillRect(x0 + wdt * 0.7, top, wdt * 0.04, base - top);
    ctx.restore();
    // roof crown: plant room and a thin parapet
    ctx.fillStyle = P.night ? '#2a2e58' : '#d4d8de'; ctx.fillRect(x0 + wdt * 0.18, top - 4 * s, wdt * 0.4, 4.5 * s);
    ctx.fillStyle = P.night ? '#ff5a4a' : '#c8ccd2'; ctx.beginPath(); ctx.arc(x0 + wdt * 0.38, top - 5 * s, 1.1 * s, 0, TAU); ctx.fill();
  }
  function h4(top, base, f) { return (base - top) * f; }
  /* The Danube Tower: slim concrete shaft, the observation "basket", the antenna */
  function donauturm(ctx, x, base, top, P, s) {
    var Hh = base - top;
    ctx.fillStyle = lg(ctx, x - 4 * s, 0, x + 4 * s, 0, P.night ? [[0, '#3a3e6a'], [1, '#5a5e8a']] : [[0, '#d8dce0'], [0.5, '#f4f4f2'], [1, '#b8c0c8']]);
    poly(ctx, [[x - 3.2 * s, base], [x - 2.2 * s, top + Hh * 0.18], [x + 2.2 * s, top + Hh * 0.18], [x + 3.2 * s, base]]); ctx.fill();
    var by = top + Hh * 0.16;
    ctx.fillStyle = P.night ? '#4a4e7a' : '#e8eaec'; ctx.beginPath(); ctx.moveTo(x - 9 * s, by); ctx.lineTo(x + 9 * s, by); ctx.lineTo(x + 6 * s, by + 7 * s); ctx.lineTo(x - 6 * s, by + 7 * s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = P.night ? '#ffd27a' : '#6a7a90'; ctx.fillRect(x - 8 * s, by + 1.4 * s, 16 * s, 2 * s);
    ctx.fillStyle = P.night ? '#4a4e7a' : '#dfe2e6'; ctx.fillRect(x - 5 * s, by - 3 * s, 10 * s, 3 * s);
    ctx.strokeStyle = P.night ? '#8a8eb8' : '#c84a3a'; ctx.lineWidth = Math.max(0.8, 1.1 * s); ctx.beginPath(); ctx.moveTo(x, by - 3 * s); ctx.lineTo(x, top); ctx.stroke();
    ctx.strokeStyle = '#ffffff'; ctx.setLineDash([2 * s, 2 * s]); ctx.beginPath(); ctx.moveTo(x, by - 3 * s); ctx.lineTo(x, top); ctx.stroke(); ctx.setLineDash([]);
  }

  function paintWatch(ctx, w, h, P) {
    var L = watchL(w, h), s = L.s, r = rng(P.night ? 90211 : 90111), i, x, y, hz = L.hz;
    mark('start', ctx);
    /* ---------- sky ---------- */
    ctx.fillStyle = lg(ctx, 0, 0, 0, hz + h * 0.04, P.sky); ctx.fillRect(0, 0, w, hz + h * 0.05);
    skyStrokes(ctx, -20 * s, w + 20 * s, 0, hz, P.sky, 300, r, s, 0.1, P.warm, P.cool);
    if (!P.night) {
      glow(ctx, w * 0.95, h * 0.02, w * 0.9, '#fff4dc', 0.35);
      var cls = [[0.62, 0.1, 0.46, 0.05], [0.24, 0.17, 0.36, 0.04], [0.86, 0.22, 0.3, 0.03], [0.45, 0.255, 0.4, 0.022]];
      for (i = 0; i < cls.length; i++) cloudForm(ctx, w * cls[i][0], h * cls[i][1], w * cls[i][2], h * cls[i][3], r, { lit: '#ffffff', mid: '#eef3f8', shade: '#a8bcd6', top: '#ffffff', al: 0.95, lx: 0.5, ly: -0.85, base: 0.6, seam: 0.12 });
      for (i = 0; i < 5; i++) wisp(ctx, w * (0.1 + r() * 0.8), h * (0.05 + r() * 0.2), w * 0.4, h * 0.006, '#ffffff', 0.28, r);
    } else {
      dots(ctx, 220, [['#ffffff', 0.9], ['#cfd8ff', 0.6]], function () { return [r() * w, Math.pow(r(), 1.4) * hz * 0.9, (0.3 + r() * 0.8) * s, r() < 0.3 ? 0 : 1]; });
      var mx = w * 0.42, my = h * 0.12; softGlow(ctx, mx, my, 60 * s, '#fff2c8', 0.35);
      ctx.fillStyle = '#fff6dc'; ctx.beginPath(); ctx.arc(mx, my, 11 * s, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(220,210,180,0.5)'; ctx.beginPath(); ctx.arc(mx - 3 * s, my - 2 * s, 2.4 * s, 0, TAU); ctx.arc(mx + 4 * s, my + 3 * s, 1.6 * s, 0, TAU); ctx.fill();
      band(ctx, 0, w, hz - h * 0.06, hz + h * 0.01, '#8a5a8a', 0.35);
    }
    mark('sky', ctx);
    /* ---------- Vienna Woods and the Kahlenberg mast (right horizon) ---------- */
    ridge(ctx, w * 0.35, w, 3 * s, function (xx) { var t = (xx - w * 0.35) / (w * 0.65); return hz - h * (0.012 + 0.03 * Math.sin(clamp(t, 0, 1) * PI * 0.9) + 0.008 * fbm(xx / (40 * s), 7, 3)); }, hz + 2, P.hill[0]);
    ridge(ctx, w * 0.5, w, 3 * s, function (xx) { var t = (xx - w * 0.5) / (w * 0.5); return hz - h * (0.006 + 0.02 * Math.sin(clamp(t, 0, 1) * PI) + 0.006 * fbm(xx / (30 * s), 9, 3)); }, hz + 2, P.hill[1]);
    var kx = w * 0.86, ky = hz - h * 0.044; ctx.strokeStyle = P.night ? '#6a6e9a' : '#8a96a8'; ctx.lineWidth = Math.max(0.6, 0.8 * s); ctx.beginPath(); ctx.moveTo(kx, ky + h * 0.01); ctx.lineTo(kx, ky - h * 0.035); ctx.stroke();
    if (P.night) { ctx.fillStyle = '#ff5a4a'; ctx.beginPath(); ctx.arc(kx, ky - h * 0.035, 1.2 * s, 0, TAU); ctx.fill(); }
    band(ctx, 0, w, hz - h * 0.03, hz + h * 0.01, P.haze, P.night ? 0.25 : 0.5);
    /* ---------- the old city: dense blocks, roofs, domes ---------- */
    var cr = rng(90131);
    // Vienna's blocks: cream, ochre and white facades under red-brown and grey roofs, in four hazy rows
    var FAC = P.night ? ['#2c3260', '#323866', '#2a2e5a'] : ['#f2e8d4', '#ecd9a8', '#f6f2ea', '#e2d6c4', '#d8c8a8', '#efe2c0'];
    var ROOF = P.night ? ['#24284e', '#2a2c50'] : ['#b06a52', '#9a5a48', '#8a8e96', '#a87a62', '#7a8a8c'];
    for (var row = 0; row < 4; row++) {
      var yb = hz + h * (0.002 + row * 0.0065), sc = 0.8 + row * 0.28, hzA = [0.55, 0.38, 0.2, 0.08][row];
      for (x = -4 * s; x < w + 4 * s;) {
        var bw = (6 + cr() * 10) * s * sc, bh = (3.5 + cr() * 5) * s * sc, fc = FAC[(cr() * FAC.length) | 0];
        ctx.fillStyle = mix(fc, P.haze, hzA); ctx.fillRect(x, yb - bh, bw, bh + h * 0.012);
        ctx.fillStyle = mix(fc, '#000000', 0.12); ctx.globalAlpha = 1 - hzA; ctx.fillRect(x + bw * 0.78, yb - bh, bw * 0.22, bh + h * 0.012); ctx.globalAlpha = 1;
        var rf = ROOF[(cr() * ROOF.length) | 0]; ctx.fillStyle = mix(rf, P.haze, hzA); poly(ctx, [[x - 0.4 * s, yb - bh], [x + bw * 0.12, yb - bh - 2.4 * s * sc], [x + bw * 0.88, yb - bh - 2.4 * s * sc], [x + bw + 0.4 * s, yb - bh]]); ctx.fill();
        if (!P.night && row > 1) { ctx.fillStyle = mix('#6a7a8c', P.haze, hzA + 0.15); for (var wq = 0; wq < 3; wq++) for (var wr = 0; wr < 2; wr++) ctx.fillRect(x + bw * (0.15 + wq * 0.27), yb - bh + bh * (0.25 + wr * 0.38), 0.9 * s * sc, 1.2 * s * sc); }
        if (P.night && cr() < 0.8) { ctx.fillStyle = cr() < 0.8 ? '#ffd27a' : '#fff0c0'; for (var q = 0; q < 4; q++) if (cr() < 0.55) ctx.fillRect(x + cr() * bw, yb - bh * cr(), 0.9 * s, 0.9 * s); }
        x += bw * (0.8 + cr() * 0.3);
      }
    }
    // a few green copper domes and church towers among the roofs
    [[0.36, 0.006, 'dome'], [0.47, 0.004, 'tower'], [0.67, 0.005, 'dome'], [0.76, 0.003, 'tower'], [0.12, 0.004, 'tower'], [0.3, 0.003, 'tower']].forEach(function (D) {
      var dx = w * D[0], dy = hz + h * D[1];
      ctx.fillStyle = P.night ? '#4a6a6a' : '#7aa898';
      if (D[2] === 'dome') { ctx.beginPath(); ctx.ellipse(dx, dy - 4 * s, 4.5 * s, 4 * s, 0, PI, TAU); ctx.fill(); ctx.fillRect(dx - 0.5 * s, dy - 11 * s, 1 * s, 3.5 * s); ctx.fillStyle = P.city; ctx.fillRect(dx - 5 * s, dy - 4 * s, 10 * s, 4 * s); }
      else { ctx.fillStyle = P.city; ctx.fillRect(dx - 1.8 * s, dy - 9 * s, 3.6 * s, 9 * s); ctx.fillStyle = P.night ? '#4a6a6a' : '#7aa898'; poly(ctx, [[dx - 2.2 * s, dy - 9 * s], [dx, dy - 15 * s], [dx + 2.2 * s, dy - 9 * s]]); ctx.fill(); }
    });
    stephansdom(ctx, L.steph[0], L.steph[1], h * 0.085, P, s);
    if (P.night) softGlow(ctx, L.steph[0] + h * 0.01, L.steph[1] - h * 0.04, h * 0.05, '#ffd9a0', 0.35);
    // the Prater: trees under the Giant Ferris Wheel
    var wl = L.wheel;
    clump(ctx, wl[0] - wl[2] * 1.4, hz + h * 0.01, 9 * s, P.island, r, 0.5, -0.8, true, 0.6); clump(ctx, wl[0] + wl[2] * 1.3, hz + h * 0.012, 10 * s, P.island, r, 0.5, -0.8, true, 0.6);
    wheelLegs(ctx, wl[0], wl[1], wl[2], P, s);
    band(ctx, 0, w, hz - h * 0.008, hz + h * 0.02, P.haze, P.night ? 0.12 : 0.35);
    mark('city', ctx);
    /* ---------- the river: far bank, main Danube, the island, New Danube ---------- */
    var fb = L.far;
    ctx.fillStyle = P.night ? '#2a2e5a' : '#b8b4a6'; ctx.fillRect(0, hz + h * 0.012, w, L.dan0 - hz - h * 0.012);
    batch(ctx, 120, [[P.night ? '#ffd27a' : '#9a9a8a', 1 * s, P.night ? 0.8 : 0.5]], function () { var xx = r() * w, yy = lerp(hz + h * 0.014, L.dan0 - 1 * s, r()); return [xx, yy, xx + (2 + r() * 6) * s, yy, 0]; });
    ctx.fillStyle = lg(ctx, 0, L.dan0, 0, L.isl0, P.water); ctx.fillRect(0, L.dan0, w, L.isl0 - L.dan0);
    reflect(ctx, w, L.dan0, L.isl0, P.night ? 0.5 : 0.28, 1.2 * s, 1.3 / s, 3, 3.2);
    batch(ctx, 500, [['#ffffff', 0.6 * s, P.night ? 0.12 : 0.4], [P.night ? '#ffd27a' : '#3a6a88', 0.7 * s, 0.35]], function () { var yy = lerp(L.dan0 + 1, L.isl0 - 1, Math.pow(r(), 1.1)), xx = r() * w, l = (2 + r() * 8) * s; return [xx, yy, xx + l, yy, r() < 0.6 ? 0 : 1]; });
    // Danube Island: a long green strip of meadow and trees
    ctx.fillStyle = P.night ? '#16283a' : '#7aa860'; ctx.fillRect(0, L.isl0, w, L.isl1 - L.isl0);
    for (x = -10 * s; x < w + 10 * s; x += (5 + r() * 8) * s) clump(ctx, x, L.isl0 + (L.isl1 - L.isl0) * 0.35, (3 + r() * 3.5) * s, P.island, r, 0.5, -0.8, true, 0.5);
    ctx.fillStyle = lg(ctx, 0, L.isl1, 0, L.nd1, P.water); ctx.fillRect(0, L.isl1, w, L.nd1 - L.isl1);
    batch(ctx, 260, [['#ffffff', 0.7 * s, P.night ? 0.15 : 0.45]], function () { var yy = lerp(L.isl1 + 1, L.nd1 - 1, r()), xx = r() * w, l = (3 + r() * 10) * s; return [xx, yy, xx + l, yy, 0]; });
    // the Reichsbrücke: a long straight bridge running from the near bank toward the old city
    var b0 = [w * 0.42, L.nd1 + h * 0.008], b1 = [w * 0.3, hz + h * 0.014];
    ctx.fillStyle = P.night ? '#3a3e6a' : '#d8d4cc'; poly(ctx, [[b1[0] - 2 * s, b1[1]], [b1[0] + 3 * s, b1[1]], [b0[0] + 9 * s, b0[1]], [b0[0] - 5 * s, b0[1]]]); ctx.fill();
    ctx.fillStyle = P.night ? '#24284a' : '#9a968e'; poly(ctx, [[b1[0] + 3 * s, b1[1]], [b1[0] + 4 * s, b1[1] + 1.4 * s], [b0[0] + 10.5 * s, b0[1] + 3 * s], [b0[0] + 9 * s, b0[1]]]); ctx.fill();
    for (i = 1; i < 6; i++) { var bt = i / 6, px = lerp(b1[0], b0[0], bt) + 2 * s, py = lerp(b1[1], b0[1], bt); ctx.fillStyle = P.night ? '#24284a' : '#a8a49c'; ctx.fillRect(px + 1 * s * bt * 3, py, (1 + bt * 2) * s, (2 + bt * 6) * s); }
    if (P.night) { ctx.fillStyle = '#ffe2a0'; for (i = 0; i < 12; i++) { var lt = i / 11; ctx.beginPath(); ctx.arc(lerp(b1[0], b0[0], lt) + (1 + lt * 6) * s, lerp(b1[1], b0[1], lt), (0.5 + lt) * s, 0, TAU); ctx.fill(); } }
    mark('river', ctx);
    /* ---------- near bank: Donau City, the Danube Tower, the DC Tower, park trees ---------- */
    ctx.fillStyle = lg(ctx, 0, L.nd1, 0, L.sill, P.night ? [[0, '#1e2a3e'], [1, '#141c2c']] : [[0, '#8aa870'], [1, '#5f8a4e']]); ctx.fillRect(0, L.nd1, w, L.sill - L.nd1);
    var dct = L.dct, dtop = h * 0.075, dbase = L.sill;
    // DC Tower: black glass with a pleated face
    ctx.fillStyle = P.dct; poly(ctx, [[dct[0], dbase], [dct[0], dtop + h * 0.006], [dct[0] + dct[1], dtop], [dct[0] + dct[1], dbase]]); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.rect(dct[0], dtop, dct[1], dbase - dtop); ctx.clip();
    for (i = 0; i < 26; i++) { var yy2 = dtop + i * (dbase - dtop) / 26; ctx.fillStyle = P.night ? (i % 3 ? 'rgba(255,220,150,0.25)' : 'rgba(150,170,255,0.2)') : 'rgba(150,180,220,0.28)'; ctx.beginPath(); ctx.moveTo(dct[0], yy2); ctx.lineTo(dct[0] + dct[1] * 0.5, yy2 + 4 * s); ctx.lineTo(dct[0] + dct[1], yy2); ctx.lineTo(dct[0] + dct[1], yy2 + 1.6 * s); ctx.lineTo(dct[0] + dct[1] * 0.5, yy2 + 5.6 * s); ctx.lineTo(dct[0], yy2 + 1.6 * s); ctx.fill(); }
    ctx.fillStyle = P.night ? 'rgba(120,140,255,0.12)' : 'rgba(255,255,255,0.12)'; ctx.fillRect(dct[0], dtop, dct[1] * 0.35, dbase - dtop);
    ctx.restore();
    donauturm(ctx, L.dtower[0], L.sill, h * 0.1, P, s);
    // low Donau City blocks and the park canopy along the bank
    var nr = rng(90161);
    for (x = w * 0.36; x < w * 1.02;) { var bw2 = (14 + nr() * 18) * s, bh2 = h * (0.02 + nr() * 0.035); ctx.fillStyle = P.night ? '#2a3058' : mix('#e8e4dc', '#c8ccd4', nr()); ctx.fillRect(x, L.near + h * 0.03 - bh2, bw2, bh2 + h * 0.2);
      ctx.fillStyle = P.night ? '#ffd27a' : '#7a8aa0'; for (var wy = 0; wy < 4; wy++) for (var wx2 = 0; wx2 < 4; wx2++) if (!P.night || nr() < 0.4) ctx.fillRect(x + (2 + wx2 * bw2 / 4.4), L.near + h * 0.03 - bh2 + (2 + wy * 5) * s, 2 * s, 2.4 * s);
      if (nr() < 0.5) { ctx.fillStyle = P.night ? '#24304a' : '#6aa04e'; ctx.fillRect(x, L.near + h * 0.03 - bh2 - 2 * s, bw2, 2 * s); }
      x += bw2 * (1 + nr() * 0.4); }
    for (x = -8 * s; x < w + 8 * s; x += (7 + r() * 9) * s) clump(ctx, x, L.near + h * (0.045 + r() * 0.03), (7 + r() * 7) * s, P.island, r, 0.5, -0.8, false, 0.6);
    // the VIC: two curved towers on the left and the round conference building between them
    vicTower(ctx, w * 0.17, w * 0.31, h * 0.2, L.sill, hz, P, s, r, 0.35);
    ctx.fillStyle = P.night ? '#2a305a' : '#e4e6ea'; ctx.beginPath(); ctx.ellipse(w * 0.3, L.sill - h * 0.05, w * 0.13, h * 0.014, 0, PI, TAU); ctx.fill(); ctx.fillRect(w * 0.17, L.sill - h * 0.05, w * 0.26, h * 0.05);
    ctx.fillStyle = P.night ? '#ffd27a' : '#3a3f4e'; ctx.globalAlpha = P.night ? 0.6 : 0.8; ctx.fillRect(w * 0.17, L.sill - h * 0.04, w * 0.26, h * 0.009); ctx.globalAlpha = 1;
    vicTower(ctx, w * -0.03, w * 0.165, h * 0.13, L.sill, hz, P, s, r, 0.3);
    // flags of many countries along the plaza, drawn as plain colour bars (no real flags)
    for (i = 0; i < 9; i++) { var fx = w * (0.32 + i * 0.026), fy = L.sill - h * 0.016; ctx.strokeStyle = P.night ? '#8a8eb8' : '#9aa4b4'; ctx.lineWidth = Math.max(0.5, 0.6 * s); ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx, fy - h * 0.03); ctx.stroke(); ctx.fillStyle = ['#e04a3a', '#3a6ad0', '#f5c040', '#2a9a5a', '#ffffff', '#c8304a', '#4ab0e0', '#f08a2a', '#6a4ab0'][i]; ctx.fillRect(fx, fy - h * 0.03, 5 * s, 3.2 * s); }
    band(ctx, 0, w, L.near - h * 0.02, L.near + h * 0.03, P.haze, P.night ? 0.1 : 0.25);
    mark('near', ctx);
    /* ---------- the audit room: window frame, ceiling, sill garden, floor ---------- */
    // glass tint
    ctx.fillStyle = P.night ? 'rgba(40,40,90,0.12)' : 'rgba(200,225,240,0.12)'; ctx.fillRect(0, L.ceil, w, L.sill - L.ceil);
    // mullions and transom
    L.mull.forEach(function (f, k) { var mx2 = w * f, mw = (k === 0 || k === 3 ? 7 : 4) * s; ctx.fillStyle = P.frame; ctx.fillRect(mx2 - mw / 2, L.ceil, mw, L.sill - L.ceil); ctx.fillStyle = P.night ? 'rgba(0,0,0,0.25)' : 'rgba(120,110,100,0.25)'; ctx.fillRect(mx2 + mw / 2 - 1.2 * s, L.ceil, 1.2 * s, L.sill - L.ceil); });
    ctx.fillStyle = P.frame; ctx.fillRect(0, L.transom - 1.6 * s, w, 3.2 * s);
    // glass reflections: soft diagonal sheens
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    [[0.05, 0.12], [0.4, 0.1], [0.72, 0.14]].forEach(function (G) { ctx.fillStyle = lg(ctx, w * G[0], L.ceil, w * (G[0] + G[1]), L.sill, [[0, 'rgba(255,255,255,0)'], [0.5, P.night ? 'rgba(160,160,255,0.05)' : 'rgba(255,255,255,0.09)'], [1, 'rgba(255,255,255,0)']]); poly(ctx, [[w * G[0], L.ceil], [w * (G[0] + G[1]), L.ceil], [w * (G[0] + G[1] - 0.12), L.sill], [w * (G[0] - 0.12), L.sill]]); ctx.fill(); });
    ctx.restore();
    // warm oak slat ceiling
    ctx.fillStyle = lg(ctx, 0, 0, 0, L.ceil, [[0, P.ceil[0]], [1, P.ceil[1]]]); ctx.fillRect(0, 0, w, L.ceil);
    rects(ctx, 60, [[P.night ? '#3a2a2a' : '#a8784a', 0.5]], function (k) { return [k * 9 * s, 0, 2 * s, L.ceil, 0]; });
    ctx.fillStyle = P.night ? '#2a2030' : '#8a6040'; ctx.fillRect(0, L.ceil - 2 * s, w, 2.4 * s);
    // two pendant lamps (Jugendstil glass shades)
    [0.18, 0.82].forEach(function (f) { var lx = w * f, ly = L.ceil + h * 0.05; ctx.strokeStyle = P.night ? '#6a6070' : '#8a7a6a'; ctx.lineWidth = Math.max(0.6, 0.8 * s); ctx.beginPath(); ctx.moveTo(lx, L.ceil); ctx.lineTo(lx, ly); ctx.stroke();
      ctx.fillStyle = P.night ? '#ffe2a8' : '#f6eccc'; ctx.beginPath(); ctx.moveTo(lx - 9 * s, ly + 7 * s); ctx.quadraticCurveTo(lx - 8 * s, ly - 1 * s, lx, ly - 1 * s); ctx.quadraticCurveTo(lx + 8 * s, ly - 1 * s, lx + 9 * s, ly + 7 * s); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = P.night ? '#c8a050' : '#b89a5a'; ctx.beginPath(); ctx.moveTo(lx - 9 * s, ly + 7 * s); ctx.lineTo(lx + 9 * s, ly + 7 * s); ctx.moveTo(lx - 5 * s, ly + 1 * s); ctx.quadraticCurveTo(lx, ly + 4 * s, lx + 5 * s, ly + 1 * s); ctx.stroke();
      softGlow(ctx, lx, ly + 8 * s, (P.night ? 40 : 20) * s, '#ffe6b0', P.night ? 0.5 : 0.25); });
    // the sill: a long planter of lavender and grasses
    var sy = L.sill;
    ctx.fillStyle = P.night ? '#3a3450' : '#d8cdbc'; ctx.fillRect(0, sy - 2 * s, w, h * 0.03);
    ctx.fillStyle = P.night ? '#2a2440' : '#b8a890'; ctx.fillRect(0, sy + h * 0.026, w, 2 * s);
    for (x = -6 * s; x < w + 6 * s; x += (9 + r() * 8) * s) clump(ctx, x, sy - (3 + r() * 4) * s, (6 + r() * 5) * s, P.night ? ['#141c24', '#1e2a32', '#2a3a40', '#3a4a50', '#5a6a70'] : ['#2a4a2e', '#3c6a3a', '#5a8a48', '#9ac070', '#dceaa8'], r, -0.4, -0.85, false, 0.7);
    dots(ctx, 90, [[P.night ? '#7a6aa8' : '#9a7ad8', 0.9], [P.night ? '#8a7ab8' : '#c4a8f0', 0.8]], function () { return [r() * w, sy - (4 + r() * 12) * s, (1 + r()) * s, r() < 0.5 ? 0 : 1]; });
    // stone floor with the window light and soft reflections
    var f0 = sy + h * 0.028;
    ctx.fillStyle = lg(ctx, 0, f0, 0, h, P.floor); ctx.fillRect(0, f0, w, h - f0);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (i = 0; i < 4; i++) { var rx2 = w * (0.1 + i * 0.27); ctx.fillStyle = lg(ctx, 0, f0, 0, f0 + h * 0.12, [[0, P.night ? 'rgba(255,210,140,0.07)' : 'rgba(255,255,255,0.1)'], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(rx2, f0, w * 0.1, h * 0.12); }
    ctx.restore();
    ctx.fillStyle = lg(ctx, 0, f0, 0, h, P.night ? [[0, 'rgba(40,30,70,0.2)'], [1, 'rgba(20,16,40,0.6)']] : [[0, 'rgba(240,230,215,0.25)'], [1, 'rgba(200,180,150,0.45)']]); ctx.fillRect(0, f0, w, h - f0);
    // large floor tiles in perspective
    ctx.strokeStyle = P.night ? 'rgba(255,255,255,0.05)' : 'rgba(120,100,80,0.14)'; ctx.lineWidth = Math.max(0.6, 0.7 * s); ctx.beginPath();
    var vpx = w * 0.5, vpy = h * 0.42;
    for (i = -8; i <= 8; i++) { var bx2 = vpx + i * w * 0.16; ctx.moveTo(lerp(vpx, bx2, (f0 - vpy) / (h - vpy)), f0); ctx.lineTo(bx2, h); }
    var yk = f0, rh = h * 0.02; while (yk < h) { ctx.moveTo(0, yk); ctx.lineTo(w, yk); yk += rh; rh *= 1.35; }
    ctx.stroke();
    // window light falling on the floor
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    [[0.02, 0.33], [0.36, 0.64], [0.67, 0.98]].forEach(function (Wn) { ctx.fillStyle = lg(ctx, 0, f0, 0, h * 0.9, [[0, rgba(P.lightLeft, P.night ? 0.03 : 0.08)], [1, rgba(P.lightLeft, 0)]]); poly(ctx, [[w * Wn[0], f0], [w * Wn[1], f0], [w * (Wn[1] + 0.2), h * 0.9], [w * (Wn[0] + 0.24), h * 0.9]]); ctx.fill(); });
    ctx.restore();
    // a Viennese rug with a black-and-white checker border (in the spirit of 1900s Vienna design)
    var ry0 = h * 0.79, ry1 = h * 0.97, rxa = w * 0.2, rxb = w * 0.8, sk = w * 0.07;
    poly(ctx, [[rxa, ry0], [rxb, ry0], [rxb + sk, ry1], [rxa - sk, ry1]]); ctx.fillStyle = P.night ? '#3a2e4a' : '#e6d8c2'; ctx.fill();
    ctx.save(); poly(ctx, [[rxa, ry0], [rxb, ry0], [rxb + sk, ry1], [rxa - sk, ry1]]); ctx.clip();
    var cs = 6 * s, ci;
    for (ci = 0; ci * cs < (rxb - rxa) + 2 * sk; ci++) { var cx0 = rxa - sk + ci * cs; ctx.fillStyle = ci % 2 ? (P.night ? '#1a1424' : '#2a2430') : (P.night ? '#c8b8a0' : '#f6f0e4'); ctx.fillRect(cx0, ry0, cs, cs * 0.6); ctx.fillStyle = ci % 2 ? (P.night ? '#c8b8a0' : '#f6f0e4') : (P.night ? '#1a1424' : '#2a2430'); ctx.fillRect(cx0, ry1 - cs * 0.9, cs, cs * 0.9); }
    ctx.strokeStyle = P.night ? 'rgba(200,160,90,0.5)' : 'rgba(170,120,60,0.55)'; ctx.lineWidth = Math.max(0.8, 1.2 * s); poly(ctx, [[rxa + 6 * s, ry0 + cs], [rxb - 6 * s, ry0 + cs], [rxb + sk - 9 * s, ry1 - cs * 1.4], [rxa - sk + 9 * s, ry1 - cs * 1.4]]); ctx.stroke();
    ctx.fillStyle = P.night ? 'rgba(200,160,90,0.35)' : 'rgba(190,140,70,0.35)'; for (ci = 0; ci < 5; ci++) { var qx2 = lerp(rxa, rxb, (ci + 0.5) / 5), qy2 = (ry0 + ry1) / 2; ctx.beginPath(); ctx.moveTo(qx2, qy2 - 7 * s); ctx.lineTo(qx2 + 5 * s, qy2); ctx.lineTo(qx2, qy2 + 7 * s); ctx.lineTo(qx2 - 5 * s, qy2); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    // side walls: an oak bookcase on the left, an auditor's desk with screens on the right
    ctx.fillStyle = P.night ? '#3a2c34' : '#a87a52'; poly(ctx, [[0, f0 - h * 0.02], [w * 0.075, f0 + h * 0.01], [w * 0.075, h * 0.78], [0, h * 0.8]]); ctx.fill();
    for (i = 0; i < 4; i++) { var shy = lerp(f0, h * 0.77, (i + 0.3) / 4); ctx.fillStyle = P.night ? '#2a2028' : '#7a5636'; ctx.fillRect(0, shy, w * 0.075, 2 * s);
      for (var bk = 0; bk < 5; bk++) { ctx.fillStyle = ['#c8503a', '#3a6aa8', '#e8b840', '#4a8a5a', '#8a5aa8'][(i + bk) % 5]; ctx.globalAlpha = P.night ? 0.45 : 0.9; ctx.fillRect(bk * w * 0.014 + 1 * s, shy - (8 + (bk % 3) * 2) * s, w * 0.011, (8 + (bk % 3) * 2) * s); } ctx.globalAlpha = 1; }
    ctx.fillStyle = P.night ? '#2a2440' : '#d8cdb8'; poly(ctx, [[w, f0 + h * 0.06], [w * 0.86, f0 + h * 0.07], [w * 0.86, f0 + h * 0.08], [w, f0 + h * 0.075]]); ctx.fill();
    ctx.fillStyle = P.night ? '#3a3050' : '#8a6a4a'; ctx.fillRect(w * 0.87, f0 + h * 0.08, 2 * s, h * 0.06); ctx.fillRect(w * 0.985, f0 + h * 0.078, 2 * s, h * 0.065);
    ctx.fillStyle = P.night ? '#1a1830' : '#2a2f45'; ctx.fillRect(w * 0.88, f0 + h * 0.025, w * 0.1, h * 0.04); ctx.fillStyle = P.night ? '#5ee6d6' : '#7fd8ce'; ctx.globalAlpha = 0.7; ctx.fillRect(w * 0.885, f0 + h * 0.03, w * 0.09, h * 0.03); ctx.globalAlpha = 1;
    mark('room', ctx);
    finish(ctx, w, h, P.night ? '#3a2a6a' : '#ffe8c8', 0.1, P.night ? 0.3 : 0.18, 0.035, P.night ? '#0a0820' : '#2a2030', 0.4);
    mark('finish', ctx);
  }

  function overlayWatch(ctx, w, h, t, P) {
    var L = watchL(w, h), s = L.s, i, hz = L.hz;
    ctx.save(); ctx.beginPath(); ctx.rect(0, L.ceil, w, L.sill - L.ceil); ctx.clip();
    // the Giant Ferris Wheel turns, very slowly
    var wl = L.wheel; wheelRim(ctx, wl[0], wl[1], wl[2], t * 0.05, P, s, P.night ? 1 : 0.9);
    if (P.night) softGlow(ctx, wl[0], wl[1], wl[2] * 1.4, '#ff8a7a', 0.12);
    // river sparkle and a slow riverboat
    for (i = 0; i < 14; i++) { var tw = Math.pow(Math.max(0, Math.sin(t * (1.2 + hash(i, 41) * 2) + i * 3)), 10); if (tw < 0.05) continue; var gx = w * hash(i, 42), gy = lerp(L.dan0 + 2 * s, L.isl0 - 2 * s, hash(i, 43)); var sp = glowSpr(P.night ? '#ffd27a' : '#ffffff', true); if (sp) { ctx.globalAlpha = tw * 0.8; ctx.drawImage(sp, gx - 3 * s, gy - 3 * s, 6 * s, 6 * s); } }
    ctx.globalAlpha = 1;
    var bxp = ((t * 3 * s) % (w * 1.4)) - w * 0.2, byp = L.dan0 + (L.isl0 - L.dan0) * 0.55;
    ctx.fillStyle = P.night ? '#3a3e6a' : '#ffffff'; ctx.beginPath(); ctx.moveTo(bxp - 14 * s, byp); ctx.lineTo(bxp + 12 * s, byp); ctx.lineTo(bxp + 9 * s, byp + 3 * s); ctx.lineTo(bxp - 12 * s, byp + 3 * s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = P.night ? '#ffd27a' : '#2a4a6a'; ctx.fillRect(bxp - 9 * s, byp - 3 * s, 16 * s, 3 * s); ctx.fillStyle = P.night ? '#4a4e7a' : '#e8eef4'; ctx.fillRect(bxp - 9 * s, byp - 3.6 * s, 16 * s, 0.8 * s);
    // delivery drones in lanes over the river (Pantry's amber band), and a few gulls
    for (i = 0; i < 7; i++) {
      var lane = i % 3, sp2 = (8 + lane * 4 + hash(i, 51) * 4) * s, dir = i % 2 ? 1 : -1, ph = hash(i, 52) * w * 1.6;
      var dx = dir > 0 ? ((t * sp2 + ph) % (w * 1.3)) - w * 0.15 : w * 1.15 - ((t * sp2 + ph) % (w * 1.3));
      var dy = h * (0.2 + lane * 0.045) + Math.sin(t * 1.3 + i) * 2 * s, ds = (2.2 + lane * 0.8) * s;
      drone(ctx, dx, dy, ds, P);
    }
    if (!P.night) { ctx.strokeStyle = 'rgba(60,70,90,0.7)'; ctx.lineWidth = Math.max(0.8, 0.9 * s); ctx.lineCap = 'round';
      for (i = 0; i < 3; i++) { var gx2 = ((t * (10 + i * 3) * s + i * 120 * s) % (w * 1.3)) - w * 0.15, gy2 = h * (0.08 + i * 0.03) + Math.sin(t * 0.8 + i) * 4 * s; drawBird(ctx, gx2, gy2, (3.6 - i * 0.4) * s, t * 6 + i * 2); } }
    else { // blinking aviation lights on the towers
      var bl = 0.5 + 0.5 * Math.sin(t * 3); var spr = glowSpr('#ff5a4a', true); if (spr) { ctx.globalAlpha = bl; ctx.drawImage(spr, L.dtower[0] - 5 * s, h * 0.1 - 5 * s, 10 * s, 10 * s); ctx.drawImage(spr, L.dct[0] + L.dct[1] / 2 - 4 * s, h * 0.075 - 6 * s, 8 * s, 8 * s); ctx.globalAlpha = 1; } }
    ctx.restore();
    // a slow sheen sliding across the glass
    var shx = ((t * 12 * s) % (w * 2)) - w * 0.5;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = lg(ctx, shx, 0, shx + w * 0.25, 0, [[0, 'rgba(255,255,255,0)'], [0.5, P.night ? 'rgba(160,160,255,0.03)' : 'rgba(255,255,255,0.05)'], [1, 'rgba(255,255,255,0)']]);
    poly(ctx, [[shx, L.ceil], [shx + w * 0.25, L.ceil], [shx + w * 0.1, L.sill], [shx - w * 0.15, L.sill]]); ctx.fill(); ctx.restore();
  }
  function drone(ctx, x, y, sz, P) {
    ctx.fillStyle = P.night ? '#c8ccf0' : '#f8f8fa'; ctx.beginPath(); ctx.ellipse(x, y, sz, sz * 0.45, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#f29a2e'; ctx.fillRect(x - sz, y - sz * 0.05, sz * 2, sz * 0.3);
    ctx.strokeStyle = P.night ? '#8a8eb8' : '#9aa4be'; ctx.lineWidth = Math.max(0.5, sz * 0.18); ctx.beginPath(); ctx.moveTo(x - sz * 1.7, y - sz * 0.3); ctx.lineTo(x + sz * 1.7, y - sz * 0.3); ctx.stroke();
    ctx.fillStyle = P.night ? 'rgba(200,200,255,0.35)' : 'rgba(170,180,200,0.5)'; ctx.beginPath(); ctx.ellipse(x - sz * 1.7, y - sz * 0.45, sz * 0.8, sz * 0.15, 0, 0, TAU); ctx.ellipse(x + sz * 1.7, y - sz * 0.45, sz * 0.8, sz * 0.15, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#d8a860'; ctx.fillRect(x - sz * 0.5, y + sz * 0.45, sz, sz * 0.6);
    if (P.night) { var sp = glowSpr('#ffb070', true); if (sp) { ctx.globalAlpha = 0.6; ctx.drawImage(sp, x - sz * 2, y - sz * 2, sz * 4, sz * 4); ctx.globalAlpha = 1; } }
  }

  function wrap(P) {
    return {
      focus: { x: 0.5, y: 0.3 }, track: P.night ? 'night' : 'work',
      // the floor starts at y 0.63; the sill garden runs along y 0.6; the window spans y 0.055..0.6
      anchors: { floor: { y: 0.63 }, sill: { y: 0.6 }, wheel: { x: 0.2, y: 0.305 } },
      paint: function (ctx, w, h) { ctx.save(); try { paintWatch(ctx, w, h, P); } catch (e) { PAINT._err = 'vienna_watch: ' + String(e && e.stack || e); } finally { ctx.restore(); } },
      overlay: function (ctx, w, h, t) { ctx.save(); try { overlayWatch(ctx, w, h, t, P); } catch (e) { PAINT._err = 'vienna_watch overlay: ' + String(e && e.stack || e); } finally { ctx.restore(); } }
    };
  }
  PAINT.vienna_watch = wrap(DAY);
  PAINT.vienna_night = wrap(NIGHT);
})();
