/* scenes/eastie_pier.js - the East Boston Harborwalk by Piers Park, on a bright spring morning (agreed.js, the ferry
   ride and walk to Rosa's home).
   PAINT.eastie_pier. We stand on the wooden boardwalk of the Harborwalk and look south-west across the inner harbor to
   downtown Boston: granite and glass towers, the Custom House clock tower with its pyramid top, the twin concrete
   Harbor Towers and the low brick wharf buildings along the water. Boston is a "preserve": it looks much as it does
   today. A finger pier with tarred pilings runs out on the left to the ferry float, where a small water taxi waits;
   sailboats from the community sailing center lean in the breeze; the electric ferry crosses, gulls ride the wind and a
   quiet plane glides down toward the airport. On the boardwalk: the harbor railing, two Harborwalk lamp posts, a bench,
   a granite bollard and a planter of tulips. The middle stays clear for portraits; the lower third is calm boards.
   Uses the painting utilities in window.CHINA_KIT (src/scenes/_china_kit.js). Everything is seeded. */
(function () {
  'use strict';
  var PAINT = (window.PAINT = window.PAINT || {});
  var K, PI = Math.PI, TAU = PI * 2;
  var rng, hash, lerp, mix, rgba, lg, rg, S, rrect, softGlow, haze, finish, batch, dots, dabs, rects, qell, clump, glowSpr, poly, skyStrokes, cloudForm, reflect, boat;
  function bind() {
    if (K) return true; K = window.CHINA_KIT; if (!K) return false;
    rng = K.rng; hash = K.hash; lerp = K.lerp; mix = K.mix; rgba = K.rgba; lg = K.lg; rg = K.rg; S = K.S; rrect = K.rrect; softGlow = K.softGlow; haze = K.haze;
    finish = K.finish; batch = K.batch; dots = K.dots; dabs = K.dabs; rects = K.rects; qell = K.qell; clump = K.clump; glowSpr = K.glowSpr; poly = K.poly;
    skyStrokes = K.skyStrokes; cloudForm = K.cloudForm; reflect = K.reflect; boat = K.boat;
    return true;
  }
  var LINE = '#2e3440';
  function ink(ctx, s, a, wd) { ctx.strokeStyle = rgba(LINE, a == null ? 0.5 : a); ctx.lineWidth = (wd || 0.7) * s; ctx.lineJoin = 'round'; ctx.stroke(); }
  var SKY = [[0, '#6aa6e0'], [0.5, '#a8cdef'], [0.85, '#dceaf2'], [1, '#f2ecdc']];

  var LM = null;
  function layout(w, h) {
    var key = w + 'x' + h; if (LM && LM.key === key) return LM;
    var s = S(w, h), L = { key: key, s: s, w: w, h: h };
    L.hz = h * 0.405; L.rail = h * 0.615; L.deck = h * 0.64; L.vx = w * 0.55; L.vy = L.hz;
    LM = L; return L;
  }

  function sky(ctx, L) {
    var w = L.w, h = L.h, s = L.s, r = rng(4101);
    ctx.fillStyle = lg(ctx, 0, 0, 0, L.hz, SKY); ctx.fillRect(0, 0, w, L.hz + 4 * s);
    skyStrokes(ctx, -20 * s, w + 20 * s, 0, L.hz, SKY, 140, r, s, 0.08, '#fff4e0', '#8ab8e0');
    softGlow(ctx, w * 0.15, h * 0.08, w * 0.7, '#fff6dc', 0.4);
    cloudForm(ctx, w * 0.3, h * 0.14, w * 0.42, h * 0.04, r, { lit: '#ffffff', mid: '#eef2f8', shade: '#b8c8dc', top: '#f8fbff', al: 0.95, lx: -0.8, ly: -0.6, q: 0.5, seam: 0.1 });
    cloudForm(ctx, w * 0.82, h * 0.22, w * 0.3, h * 0.028, r, { lit: '#ffffff', mid: '#eef2f8', shade: '#c0cedf', al: 0.9, lx: -0.8, ly: -0.6, q: 0.5, seam: 0.08 });
    cloudForm(ctx, w * 0.6, h * 0.3, w * 0.22, h * 0.018, r, { lit: '#ffffff', mid: '#f0f4f8', shade: '#c8d4e2', al: 0.8, lx: -0.8, ly: -0.6, q: 0.5, seam: 0.06 });
  }

  // downtown across the harbor
  function skyline(ctx, L) {
    var w = L.w, h = L.h, s = L.s, r = rng(4201), base = L.hz, i, Hm = h * 0.2;
    // a hazy back row
    for (var x = -4 * s; x < w;) { var bw = (8 + r() * 12) * s, bh = (10 + r() * 30) * s; ctx.fillStyle = mix('#a8bcd4', '#d8e2ee', 0.3 + r() * 0.4); ctx.fillRect(x, base - bh, bw + 0.6, bh); x += bw * (0.7 + r() * 0.5); }
    // the main towers: [x, width, height (of Hm), kind]
    var T = [[0.04, 0.07, 0.42, 's'], [0.12, 0.06, 0.6, 'g'], [0.2, 0.05, 0.5, 'h'], [0.255, 0.05, 0.5, 'h'], [0.33, 0.06, 0.78, 'g'], [0.4, 0.045, 0.62, 'c'], [0.47, 0.07, 0.9, 's'], [0.55, 0.06, 1, 'g'],
      [0.63, 0.05, 0.7, 'p'], [0.69, 0.07, 0.84, 'g'], [0.77, 0.06, 0.55, 's'], [0.84, 0.05, 0.66, 'g'], [0.9, 0.07, 0.45, 's'], [0.97, 0.05, 0.58, 'g']];
    T.forEach(function (t, k) {
      var tx = w * t[0], tw = w * t[1], th = Hm * t[2], top = base - th, kind = t[3];
      var face = kind === 'g' ? lg(ctx, tx, 0, tx + tw, 0, [[0, '#7ea2cc'], [0.55, '#b8d2ee'], [1, '#6a8eba']]) : kind === 'h' ? lg(ctx, tx, 0, tx + tw, 0, [[0, '#b8b0a6'], [0.6, '#d8d0c4'], [1, '#a09888']]) : lg(ctx, tx, 0, tx + tw, 0, [[0, '#c4b4a2'], [0.6, '#e4d8c8'], [1, '#aa9a88']]);
      if (kind === 'c') { // the Custom House tower: granite shaft, clock, pyramid top
        ctx.fillStyle = face; ctx.fillRect(tx + tw * 0.15, top, tw * 0.7, th); ctx.fillRect(tx - tw * 0.1, base - th * 0.25, tw * 1.2, th * 0.25);
        ctx.beginPath(); ctx.moveTo(tx + tw * 0.1, top); ctx.lineTo(tx + tw * 0.5, top - th * 0.18); ctx.lineTo(tx + tw * 0.9, top); ctx.closePath(); ctx.fillStyle = '#6a9a8a'; ctx.fill();
        ctx.fillStyle = '#f4efe2'; ctx.beginPath(); ctx.arc(tx + tw / 2, top + th * 0.08, tw * 0.22, 0, TAU); ctx.fill(); ctx.strokeStyle = '#3a3a40'; ctx.lineWidth = 0.6 * s; ctx.beginPath(); ctx.moveTo(tx + tw / 2, top + th * 0.08); ctx.lineTo(tx + tw / 2, top + th * 0.08 - tw * 0.16); ctx.moveTo(tx + tw / 2, top + th * 0.08); ctx.lineTo(tx + tw / 2 + tw * 0.12, top + th * 0.08); ctx.stroke();
        ctx.fillStyle = 'rgba(80,70,60,0.35)'; for (i = 0; i < 8; i++) ctx.fillRect(tx + tw * 0.25, top + th * (0.2 + i * 0.08), tw * 0.5, th * 0.025);
        return;
      }
      ctx.fillStyle = face; ctx.fillRect(tx, top, tw, th);
      if (kind === 'p') { ctx.beginPath(); ctx.moveTo(tx, top); ctx.lineTo(tx + tw / 2, top - tw * 0.8); ctx.lineTo(tx + tw, top); ctx.fill(); }
      if (kind === 's') { ctx.fillRect(tx + tw * 0.2, top - th * 0.05, tw * 0.6, th * 0.05); }
      // windows: grids on glass, punched windows on stone, deep rows on the concrete twins
      var cols = Math.max(2, Math.floor(tw / (2.4 * s)));
      rects(ctx, 220, [[kind === 'g' ? '#5a7eaa' : '#7a6a5e', kind === 'g' ? 0.3 : 0.45], ['#ffffff', 0.3]], function (i2) { var rr = (i2 / cols) | 0, cc = i2 % cols, yy = top + 2 * s + rr * (kind === 'h' ? 2 : 2.8) * s; if (yy > base - 2 * s) return null; return [tx + 0.8 * s + cc * (tw - 1.6 * s) / cols, yy, Math.max(0.6, (tw - 1.6 * s) / cols - 0.7 * s), kind === 'h' ? 1.3 * s : 1.1 * s, (rr * 3 + cc + k) % 9 === 0 ? 1 : 0]; });
      ctx.fillStyle = 'rgba(255,246,226,0.5)'; ctx.fillRect(tx, top, 1 * s, th);
      ctx.beginPath(); ctx.rect(tx, top, tw, th); ink(ctx, s, 0.18, 0.5);
    });
    haze(ctx, -w * 0.1, base - Hm * 0.6, w * 1.1, base + 2 * s, '#e8eef6', 0.3);
    // the waterfront: low brick wharf buildings with green copper roofs, trees and a wharf edge
    for (i = 0; i < 18; i++) { var bx = w * (i / 17) - 6 * s, bw2 = (14 + hash(i, 3) * 12) * s, bh2 = (6 + hash(i, 4) * 6) * s; ctx.fillStyle = hash(i, 5) < 0.6 ? '#b0705a' : '#c8b8a0'; ctx.fillRect(bx, base - bh2, bw2, bh2); ctx.fillStyle = hash(i, 6) < 0.4 ? '#6a9a8a' : '#6a5a5a'; ctx.fillRect(bx - 0.6 * s, base - bh2 - 1.4 * s, bw2 + 1.2 * s, 1.6 * s);
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; for (var q = 0; q < 3; q++) ctx.fillRect(bx + bw2 * (0.15 + q * 0.3), base - bh2 * 0.7, bw2 * 0.12, bh2 * 0.25); }
    var pal = ['#3e5a3e', '#4e6e48', '#6a8a58', '#8aa86a', '#a8c088'];
    for (i = 0; i < 9; i++) clump(ctx, w * (0.05 + i * 0.11 + hash(i, 9) * 0.04), base - 3 * s, (4 + hash(i, 8) * 3) * s, pal, r, -0.8, -0.5, true, 0.7);
    ctx.fillStyle = '#8a8480'; ctx.fillRect(0, base - 1 * s, w, 2.4 * s);
  }

  function water(ctx, L) {
    var w = L.w, h = L.h, s = L.s, r = rng(4301), i, y1 = L.rail + 6 * s;
    ctx.fillStyle = lg(ctx, 0, L.hz, 0, y1, [[0, '#8ab4d8'], [0.4, '#5a90c4'], [1, '#2e66a0']]); ctx.fillRect(0, L.hz + 1 * s, w, y1 - L.hz);
    reflect(ctx, w, L.hz + 1 * s, L.hz + h * 0.09, 0.4, 1.8 * s, 0.9 / s, 3);
    batch(ctx, 520, [['#e6f2ff', 0.8 * s, 0.55], ['#245890', 0.9 * s, 0.4]], function () { var p = Math.pow(r(), 1.3), yy = L.hz + 3 * s + p * (y1 - L.hz), xx = r() * w, l = (2 + p * 14) * s; return [xx, yy, xx + l, yy, r() < 0.55 ? 0 : 1]; });
    // sunlight on the water, from the upper left
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = lg(ctx, w * 0.05, 0, w * 0.35, 0, [[0, 'rgba(255,244,214,0)'], [0.5, 'rgba(255,244,214,0.22)'], [1, 'rgba(255,244,214,0)']]); ctx.fillRect(w * 0.05, L.hz, w * 0.3, y1 - L.hz); ctx.restore();
    // sailboats from the sailing center, leaning in the breeze
    [[0.62, 0.43, 7, '#ffffff'], [0.75, 0.445, 9, '#fff6e8'], [0.88, 0.425, 5.5, '#ffffff']].forEach(function (b) { var bx = w * b[0], by = h * b[1], sz = b[2] * s;
      ctx.save(); ctx.translate(bx, by); ctx.rotate(0.12); boat(ctx, 0, 0, sz, b[3], '#c0504d', '#e8eef6'); ctx.restore();
      ctx.fillStyle = 'rgba(40,70,110,0.3)'; ctx.fillRect(bx - sz * 0.6, by + 1 * s, sz * 1.4, 0.8 * s); });
  }

  function pier(ctx, L) {
    var w = L.w, h = L.h, s = L.s, r = rng(4401), i;
    // the finger pier on the left: deck, pilings, the ferry float with a gangway and a water taxi
    var y0 = h * 0.5, y1 = h * 0.6, xL0 = -w * 0.05, xR0 = w * 0.2, xR1 = w * 0.38;
    // pilings under it
    for (i = 0; i < 9; i++) { var t = i / 8, px = lerp(xR1, xR0 + 4 * s, t), py = lerp(y0, y1, t), ph = lerp(14, 30, t) * s, pw = lerp(2.4, 5, t) * s;
      ctx.fillStyle = '#3a2e28'; ctx.fillRect(px - pw / 2, py, pw, ph); ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(px - pw / 2, py, pw * 0.3, ph); ctx.fillStyle = '#5a6a3a'; ctx.fillRect(px - pw / 2, py + ph * 0.7, pw, ph * 0.12); }
    poly(ctx, [[xL0, y0 - 2 * s], [xR1, y0 - 2 * s], [xR0, y1], [xL0, y1]]); ctx.fillStyle = lg(ctx, 0, y0, 0, y1, [[0, '#a88a6a'], [1, '#8a6a4e']]); ctx.fill();
    ctx.strokeStyle = 'rgba(60,40,30,0.35)'; ctx.lineWidth = 0.6 * s; ctx.beginPath(); for (i = 0; i < 12; i++) { var t2 = i / 11, yy = lerp(y0, y1, t2 * t2); ctx.moveTo(xL0, yy); ctx.lineTo(lerp(xR1, xR0, t2 * t2), yy); } ctx.stroke();
    ctx.fillStyle = '#6a4e3a'; poly(ctx, [[xR1, y0 - 2 * s], [xR0, y1], [xR0, y1 + 4 * s], [xR1, y0 + 1 * s]]); ctx.fill();
    // its railing
    ctx.strokeStyle = '#2e3440'; ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.moveTo(xR1 - 2 * s, y0 - 10 * s); ctx.lineTo(xR0 - 2 * s, y1 - 22 * s); for (i = 0; i <= 6; i++) { var t3 = i / 6, rx = lerp(xR1 - 2 * s, xR0 - 2 * s, t3), ry = lerp(y0 - 2 * s, y1, t3), rh = lerp(8, 22, t3) * s; ctx.moveTo(rx, ry); ctx.lineTo(rx, ry - rh); } ctx.stroke();
    // the ferry float at its end, a gangway, the water taxi tied up
    var fx = w * 0.4, fy = h * 0.485; ctx.fillStyle = '#d8d4cc'; ctx.fillRect(fx - 4 * s, fy - 3 * s, 40 * s, 4 * s); ctx.fillStyle = '#2a3a5a'; ctx.fillRect(fx - 4 * s, fy + 1 * s, 40 * s, 1.6 * s);
    ctx.strokeStyle = '#5a6070'; ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.moveTo(xR1 - 4 * s, y0 - 2 * s); ctx.lineTo(fx + 4 * s, fy - 3 * s); ctx.stroke();
    var tx = fx + 22 * s, ty = fy + 6 * s; ctx.fillStyle = '#f4f4f0'; ctx.beginPath(); ctx.moveTo(tx - 16 * s, ty - 4 * s); ctx.lineTo(tx + 14 * s, ty - 4 * s); ctx.quadraticCurveTo(tx + 20 * s, ty - 3 * s, tx + 16 * s, ty); ctx.lineTo(tx - 15 * s, ty); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#f2c14e'; ctx.fillRect(tx - 15 * s, ty - 1.8 * s, 30 * s, 1.4 * s);
    ctx.fillStyle = '#e8ecf2'; ctx.beginPath(); rrect(ctx, tx - 8 * s, ty - 10 * s, 14 * s, 6 * s, 1.6 * s); ctx.fill(); ctx.fillStyle = '#7fb6e0'; ctx.fillRect(tx - 6 * s, ty - 9 * s, 10 * s, 2.4 * s);
  }

  function boardwalk(ctx, L) {
    var w = L.w, h = L.h, s = L.s, r = rng(4501), i, vx = L.vx, vy = L.vy, top = L.rail + 4 * s;
    ctx.fillStyle = lg(ctx, 0, top, 0, h, [[0, '#b89470'], [0.4, '#c8a47e'], [1, '#9a7654']]); ctx.fillRect(0, top, w, h - top);
    // boards running across, joints toward the vanishing point
    ctx.strokeStyle = 'rgba(80,54,34,0.4)'; ctx.lineWidth = 0.8 * s; ctx.beginPath();
    for (var y = top, k = 0; y < h; k++) { ctx.moveTo(0, y); ctx.lineTo(w, y); y += (2.4 + k * 0.9) * s; } ctx.stroke();
    batch(ctx, 140, [['rgba(80,54,34,0.45)', 0.7 * s, 1], ['rgba(255,236,206,0.35)', 0.6 * s, 1]], function (j) { var yy = lerp(top, h, Math.pow(r(), 0.8)), xx = r() * w, l = (yy - vy) * (0.08 + r() * 0.2); return [xx, yy, xx + l, yy, j % 3 === 0 ? 1 : 0]; });
    // board ends: staggered joints
    ctx.strokeStyle = 'rgba(80,54,34,0.35)'; ctx.lineWidth = 0.7 * s; ctx.beginPath(); for (var y2 = top, k2 = 0; y2 < h; k2++) { var bh = (2.4 + k2 * 0.9) * s, jx = hash(k2, 77) * w * 0.4; for (var x2 = jx; x2 < w; x2 += w * 0.45) { ctx.moveTo(x2, y2); ctx.lineTo(x2, y2 + bh); } y2 += bh; } ctx.stroke();
    ctx.fillStyle = 'rgba(40,30,20,0.25)'; ctx.fillRect(0, top, w, 3 * s);
    // the harbor railing: posts, a top rail and steel cables
    var rt = L.rail - h * 0.035;
    ctx.fillStyle = '#2e3440'; for (i = 0; i <= 10; i++) { var px = i * w / 10; ctx.fillRect(px - 1.4 * s, rt, 2.8 * s, L.rail - rt + 4 * s); }
    ctx.fillStyle = '#3a4250'; ctx.fillRect(0, rt - 2 * s, w, 3 * s); ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(0, rt - 2 * s, w, 0.8 * s);
    ctx.strokeStyle = 'rgba(60,66,80,0.7)'; ctx.lineWidth = 0.5 * s; ctx.beginPath(); for (i = 1; i < 5; i++) { var cy = lerp(rt, L.rail + 3 * s, i / 5); ctx.moveTo(0, cy); ctx.lineTo(w, cy); } ctx.stroke();
    // a Harborwalk lamp post on each side
    [[0.07, 1], [0.93, -1]].forEach(function (q) { var x = w * q[0], yb = h * 0.69, yt = h * 0.36;
      ctx.fillStyle = 'rgba(40,30,20,0.25)'; ctx.beginPath(); qell(ctx, x, yb, 10 * s, 2.4 * s, 0); ctx.fill();
      ctx.fillStyle = '#2e3a4e'; ctx.fillRect(x - 1.8 * s, yt, 3.6 * s, yb - yt); ctx.fillRect(x - 4 * s, yb - 10 * s, 8 * s, 10 * s); ctx.beginPath(); rrect(ctx, x - 6 * s, yt - 14 * s, 12 * s, 14 * s, 2 * s); ctx.fill();
      ctx.fillStyle = '#f4eed8'; ctx.fillRect(x - 4 * s, yt - 12 * s, 8 * s, 9 * s); ctx.fillStyle = '#2e3a4e'; ctx.beginPath(); ctx.moveTo(x - 8 * s, yt - 14 * s); ctx.lineTo(x, yt - 20 * s); ctx.lineTo(x + 8 * s, yt - 14 * s); ctx.fill();
      // a blue Harborwalk banner on the post
      ctx.fillStyle = '#2a6ab0'; ctx.fillRect(x + q[1] * 2 * s - (q[1] < 0 ? 12 * s : 0), yt + 14 * s, 12 * s, 24 * s); ctx.fillStyle = '#f2c14e'; ctx.beginPath(); ctx.moveTo(x + q[1] * 2 * s - (q[1] < 0 ? 12 * s : 0), yt + 30 * s); ctx.quadraticCurveTo(x + q[1] * 8 * s, yt + 26 * s, x + q[1] * 2 * s + (q[1] > 0 ? 12 * s : 0), yt + 30 * s); ctx.lineTo(x + q[1] * 2 * s + (q[1] > 0 ? 12 * s : 0), yt + 32 * s); ctx.lineTo(x + q[1] * 2 * s - (q[1] < 0 ? 12 * s : 0), yt + 32 * s); ctx.fill(); });
    // a bench facing the water on the right, a granite bollard and a planter of tulips on the left
    var bx0 = w * 0.62, bx1 = w * 0.86, by = h * 0.705;
    ctx.fillStyle = 'rgba(40,30,20,0.25)'; ctx.beginPath(); qell(ctx, (bx0 + bx1) / 2, by + 9 * s, (bx1 - bx0) * 0.58, 3 * s, 0); ctx.fill();
    ctx.fillStyle = '#2e3a4e'; [bx0 + 4 * s, bx1 - 4 * s].forEach(function (x) { ctx.fillRect(x - 1.4 * s, by - 16 * s, 2.8 * s, 25 * s); });
    for (i = 0; i < 3; i++) { ctx.fillStyle = i % 2 ? '#a8784e' : '#b8865a'; ctx.beginPath(); rrect(ctx, bx0, by - 16 * s + i * 4.4 * s, bx1 - bx0, 3.4 * s, 1 * s); ctx.fill(); }
    ctx.fillStyle = '#b8865a'; ctx.beginPath(); rrect(ctx, bx0 - 2 * s, by, bx1 - bx0 + 4 * s, 3.4 * s, 1 * s); ctx.fill(); ink(ctx, s, 0.4);
    var gx = w * 0.3, gy = h * 0.7; ctx.fillStyle = 'rgba(40,30,20,0.25)'; ctx.beginPath(); qell(ctx, gx, gy + 1 * s, 8 * s, 2 * s, 0); ctx.fill();
    ctx.fillStyle = lg(ctx, gx - 6 * s, 0, gx + 6 * s, 0, [[0, '#8a8a90'], [0.5, '#c8c8cc'], [1, '#7a7a80']]); ctx.beginPath(); ctx.moveTo(gx - 6 * s, gy); ctx.lineTo(gx - 5 * s, gy - 14 * s); ctx.quadraticCurveTo(gx, gy - 19 * s, gx + 5 * s, gy - 14 * s); ctx.lineTo(gx + 6 * s, gy); ctx.closePath(); ctx.fill(); ink(ctx, s, 0.4);
    var plx = w * 0.17, ply = h * 0.74; ctx.fillStyle = '#6a5a4e'; ctx.beginPath(); ctx.moveTo(plx - 16 * s, ply - 14 * s); ctx.lineTo(plx + 16 * s, ply - 14 * s); ctx.lineTo(plx + 13 * s, ply); ctx.lineTo(plx - 13 * s, ply); ctx.closePath(); ctx.fill(); ink(ctx, s, 0.45);
    ctx.fillStyle = '#4a3a30'; ctx.fillRect(plx - 16 * s, ply - 15 * s, 32 * s, 2.4 * s);
    for (i = 0; i < 9; i++) { var fx = plx - 12 * s + i * 3 * s, fh = (8 + hash(i, 4) * 6) * s; ctx.strokeStyle = '#4a8a3a'; ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.moveTo(fx, ply - 14 * s); ctx.lineTo(fx + (hash(i, 5) - 0.5) * 2 * s, ply - 14 * s - fh); ctx.stroke();
      ctx.fillStyle = ['#e8384a', '#f2c14e', '#ff7aa8', '#e8384a'][i % 4]; ctx.beginPath(); qell(ctx, fx + (hash(i, 5) - 0.5) * 2 * s, ply - 15 * s - fh, 1.8 * s, 2.6 * s, 0); ctx.fill(); }
    ctx.fillStyle = lg(ctx, 0, h * 0.8, 0, h, [[0, 'rgba(40,24,20,0)'], [1, 'rgba(40,24,20,0.25)']]); ctx.fillRect(0, h * 0.8, w, h * 0.2);
  }

  function ferry(ctx, x, y, L0, s) {
    var hh = L0 * 0.13;
    ctx.fillStyle = 'rgba(30,50,80,0.25)'; ctx.beginPath(); qell(ctx, x, y + hh * 0.25, L0 * 0.55, hh * 0.25, 0); ctx.fill();
    ctx.fillStyle = '#f7f8fb'; ctx.beginPath(); ctx.moveTo(x - L0 * 0.5, y - hh); ctx.lineTo(x + L0 * 0.42, y - hh); ctx.quadraticCurveTo(x + L0 * 0.56, y - hh * 0.9, x + L0 * 0.5, y); ctx.lineTo(x - L0 * 0.46, y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#1f6f8b'; ctx.fillRect(x - L0 * 0.47, y - hh * 0.38, L0 * 0.95, hh * 0.22);
    ctx.fillStyle = '#e9edf5'; ctx.beginPath(); rrect(ctx, x - L0 * 0.36, y - hh * 2.05, L0 * 0.62, hh * 1.1, hh * 0.25); ctx.fill();
    ctx.fillStyle = '#7fc6e8'; for (var i = 0; i < 7; i++) ctx.fillRect(x - L0 * 0.33 + i * L0 * 0.083, y - hh * 1.8, L0 * 0.06, hh * 0.5);
    ctx.fillStyle = '#16b3a6'; ctx.beginPath(); rrect(ctx, x - L0 * 0.1, y - hh * 2.75, L0 * 0.22, hh * 0.75, hh * 0.2); ctx.fill();
  }

  function paint(ctx, w, h) {
    if (!bind()) return;
    var L = layout(w, h);
    sky(ctx, L); skyline(ctx, L); water(ctx, L); pier(ctx, L); boardwalk(ctx, L);
    finish(ctx, w, h, '#ffc890', 0.1, 0.18, 0.035, '#14202e', 0.42);
  }
  function overlay(ctx, w, h, t) {
    if (!bind()) return;
    var L = layout(w, h), s = L.s, i;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, L.rail - h * 0.035 - 2 * s); ctx.clip();
    // the electric ferry crossing toward Long Wharf
    var span = w + 120 * s, fx = w + 60 * s - ((t * 7 * s) % span), fy = L.hz + h * 0.06;
    ferry(ctx, fx, fy, 46 * s, s);
    ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.moveTo(fx + 24 * s, fy + 1 * s); ctx.lineTo(fx + 60 * s, fy + 2.4 * s); ctx.moveTo(fx + 22 * s, fy + 2 * s); ctx.lineTo(fx + 44 * s, fy + 4 * s); ctx.stroke();
    // a quiet plane gliding down toward the airport, and gulls riding the wind
    var pq = (t % 30) / 30, px = lerp(-30 * s, w + 30 * s, pq), py = h * (0.1 + pq * 0.12);
    ctx.fillStyle = '#f4f6fb'; ctx.beginPath(); qell(ctx, px, py, 10 * s, 1.6 * s, 0.12); ctx.fill(); ctx.beginPath(); ctx.moveTo(px + 2 * s, py); ctx.lineTo(px - 3 * s, py + 5 * s); ctx.lineTo(px - 5 * s, py + 5 * s); ctx.lineTo(px - 2 * s, py); ctx.fill(); ctx.beginPath(); ctx.moveTo(px - 7 * s, py - 0.5 * s); ctx.lineTo(px - 10 * s, py - 4 * s); ctx.lineTo(px - 9 * s, py); ctx.fill();
    ctx.strokeStyle = 'rgba(50,60,80,0.85)'; ctx.lineWidth = 1.1 * s; ctx.lineCap = 'round';
    for (i = 0; i < 4; i++) { var a = t * 0.18 + i * 1.6, gx = w * 0.5 + Math.cos(a) * w * (0.3 + i * 0.04), gy = h * (0.22 + i * 0.05) + Math.sin(a * 1.3) * 10 * s; K.drawBird(ctx, gx, gy, (4.2 - i * 0.6) * s, t * 5 + i * 1.7); }
    // glints on the water
    ctx.fillStyle = '#ffffff';
    for (i = 0; i < 16; i++) { var wx = hash(i, 31) * w, wy = L.hz + 4 * s + hash(i, 32) * (L.rail - L.hz - 30 * s), tw = Math.pow(Math.max(0, Math.sin(t * (1.6 + hash(i, 33) * 2) + i * 4)), 6); if (tw < 0.05) continue; ctx.globalAlpha = tw; ctx.fillRect(wx - 3 * s, wy, 6 * s, 0.8 * s); }
    ctx.restore(); ctx.globalAlpha = 1;
  }

  PAINT.eastie_pier = { focus: { x: 0.15, y: 0.08 }, track: 'morning', anchors: { skyline: { x: 0.55, y: 0.3 }, pier: { x: 0.2, y: 0.55 }, ferry: { x: 0.5, y: 0.47 } },
    paint: function (ctx, w, h) { ctx.save(); try { paint(ctx, w, h); } catch (e) { PAINT._err = 'eastie_pier: ' + String(e && e.stack || e); } finally { ctx.restore(); } },
    overlay: function (ctx, w, h, t) { ctx.save(); try { overlay(ctx, w, h, t); } catch (e) { PAINT._err = 'eastie_pier overlay: ' + String(e && e.stack || e); } finally { ctx.restore(); } } };

  if (typeof LATE !== 'undefined') LATE.push(function () {
    if (typeof PROPS === 'undefined' || typeof PROPS_ART === 'undefined') return;
    PROPS_ART.ep_gull = function () { return '<svg viewBox="0 0 64 50"><ellipse cx="32" cy="47" rx="16" ry="3" fill="rgba(0,0,0,.2)"/><g class="pa-body"><path d="M12 30 q4 -12 22 -10 q12 2 16 8 q-6 8 -20 8 q-12 0 -18 -6z" fill="#fbfbf8" stroke="#4a4e5a" stroke-width="2"/><g class="pa-wing"><path d="M18 26 q10 -6 24 2 q-8 6 -22 4z" fill="#b8c0cc" stroke="#4a4e5a" stroke-width="1.6"/><path d="M38 28 l6 -1" stroke="#1a1a20" stroke-width="2"/></g>' +
      '<circle cx="47" cy="20" r="7" fill="#fbfbf8" stroke="#4a4e5a" stroke-width="2"/><circle cx="49" cy="19" r="1.4" fill="#1d1630"/><path d="M53 21 l8 1 l-8 2z" fill="#f5b82e" stroke="#a87010" stroke-width="1"/><circle cx="59" cy="22.6" r="0.9" fill="#e0403a"/><path d="M28 38 v8 M34 38 v8" stroke="#f0a050" stroke-width="2"/></g></svg>'; };
    PROPS_ART.ep_ring = function () { return '<svg viewBox="0 0 60 64"><ellipse cx="30" cy="61" rx="18" ry="3" fill="rgba(0,0,0,.2)"/><g class="pa-body"><rect x="27" y="2" width="6" height="58" rx="2" fill="#2e3a4e"/><circle cx="30" cy="28" r="20" fill="none" stroke="#f04a3a" stroke-width="10"/>' +
      '<path d="M30 8 a20 20 0 0 1 8 1.6 M50 28 a20 20 0 0 1 -1.6 8 M30 48 a20 20 0 0 1 -8 -1.6 M10 28 a20 20 0 0 1 1.6 -8" stroke="#ffffff" stroke-width="10" fill="none"/><circle cx="30" cy="28" r="20" fill="none" stroke="#7a2018" stroke-width="1.4" opacity=".5"/></g></svg>'; };
    PROPS.eastie_pier = [
      { id: 'ep_ring', x: 9, y: 91, w: 44, sfx: 'click', fx: 'jiggle' },
      { id: 'person', x: 30, y: 89, w: 50, talk: 'eastie_pier', look: { skin: '#c98e64', shirt: '#e86a5a', hair: '#1b1410' } },
      { id: 'ep_gull', x: 54, y: 92, w: 46, sfx: 'flap', fx: 'flyaway' },
      { id: 'person', x: 76, y: 88, w: 48, talk: 'eastie_pier', look: { skin: '#f1cfb6', shirt: '#2a9d8f', hair: '#c9772d' } },
      { id: 'pigeon', x: 93, y: 92, w: 36, sfx: 'flap', fx: 'flyaway' }
    ];
  });
})();
