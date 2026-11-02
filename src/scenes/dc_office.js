/* dc_office.js - a House member's office in the Cannon House Office Building, Washington, DC, with the US Capitol
   dome through the tall window. Two keys share one layout: dc_office (spring morning) and dc_night (evening, the dome
   floodlit and its lantern lit because the House is still working).
   Layout (fractions of w, h): ceiling to 0.04; bookcase x 0..0.21; flag pole x 0.255; window x 0.56..0.96, y 0.07..0.56;
   wainscot y 0.6..0.7; carpet from 0.7; a low table x 0.3..0.7 with its top at y 0.905 for props. The middle stays
   clear for portraits, the lower third calm for subtitles. Uses window.DCK (dc__kit.js). */
(function () {
  'use strict';
  var PAINT = (window.PAINT = window.PAINT || {});
  function K() { return window.DCK; }
  var LAY = null;
  function lay(w, h) {
    var k = w + 'x' + h; if (LAY && LAY.k === k) return LAY;
    var D = K(), s = D.S(w, h);
    LAY = { k: k, s: s, ceil: h * 0.04, wx0: w * 0.56, wx1: w * 0.96, wy0: h * 0.07, wy1: h * 0.56, rail: h * 0.6, base: h * 0.7,
      bk0: 0, bk1: w * 0.21, bky0: h * 0.1, bky1: h * 0.69, pole: w * 0.255, tabY: h * 0.905, tx0: w * 0.3, tx1: w * 0.7,
      dome: { cx: w * 0.77, base: h * 0.43, D: Math.min(w * 0.3, h * 0.15) } };
    return LAY;
  }
  function paintOffice(ctx, w, h, night) {
    var D = K(), L = lay(w, h), s = L.s, r = D.rng(night ? 91301 : 91201), i, x, y;
    var lg = D.lg, rg = D.rg, rgba = D.rgba, mix = D.mix, TAU = D.TAU;
    /* ---------- the view through the window ---------- */
    ctx.save(); ctx.beginPath(); ctx.rect(L.wx0, L.wy0, L.wx1 - L.wx0, L.wy1 - L.wy0); ctx.clip();
    var SKY = night ? [[0, '#0e1236'], [0.45, '#1c2258'], [0.8, '#3a3a78'], [1, '#6a5a8a']] : [[0, '#4d8fd8'], [0.4, '#79b0e6'], [0.75, '#b6d6f0'], [1, '#eaf2f2']];
    ctx.fillStyle = lg(ctx, 0, L.wy0, 0, L.wy1, SKY); ctx.fillRect(L.wx0, L.wy0, L.wx1 - L.wx0, L.wy1 - L.wy0);
    D.skyStrokes(ctx, L.wx0, L.wx1, L.wy0, L.wy1, SKY, 120, r, s, night ? 0.08 : 0.1, night ? '#5a5a9a' : '#ffffff', night ? '#0a0e30' : '#4a88d0');
    if (night) {
      D.dots(ctx, 70, [['#ffffff', 0.85], ['#c8d4ff', 0.6]], function () { return [D.lerp(L.wx0, L.wx1, r()), D.lerp(L.wy0, L.wy1 - (L.wy1 - L.wy0) * 0.35, Math.pow(r(), 1.4)), (0.4 + r() * 0.8) * s, r() < 0.4 ? 0 : 1]; });
      D.glow(ctx, L.dome.cx, L.dome.base - L.dome.D * 0.5, L.dome.D * 1.6, '#8a8ad0', 0.25);
    } else {
      D.glow(ctx, L.wx0, L.wy0, w * 0.6, '#fff8e6', 0.35);
      D.cloudForm(ctx, w * 0.66, h * 0.13, w * 0.24, h * 0.03, r, { lit: '#ffffff', mid: '#eef4fa', shade: '#a8bed8', top: '#ffffff', al: 0.95, lx: -0.6, ly: -0.8, base: 0.6 });
      D.cloudForm(ctx, w * 0.92, h * 0.2, w * 0.18, h * 0.022, r, { lit: '#ffffff', mid: '#eef4fa', shade: '#b0c4dc', top: '#ffffff', al: 0.9, lx: -0.6, ly: -0.8, base: 0.6 });
    }
    // the Capitol: House wing (south) in front, the dome behind it
    var dm = L.dome, wy = dm.base + dm.D * 0.06, Cw = night ? ['#e8e6fa', '#b8bce0', '#7a80b8'] : ['#fbf6ea', '#e2dccd', '#b2b4c4'];
    // wing roofline with a pediment and a colonnade
    ctx.fillStyle = Cw[1]; ctx.fillRect(L.wx0 - 2, wy, L.wx1 - L.wx0 + 4, L.wy1 - wy);
    ctx.fillStyle = lg(ctx, 0, wy, 0, L.wy1, [[0, Cw[0]], [1, Cw[1]]]); ctx.fillRect(L.wx0 - 2, wy + dm.D * 0.05, L.wx1 - L.wx0 + 4, L.wy1 - wy);
    var pcx = dm.cx - dm.D * 0.05, pw = dm.D * 0.95;
    ctx.fillStyle = Cw[0]; ctx.beginPath(); ctx.moveTo(pcx - pw / 2, wy + dm.D * 0.02); ctx.lineTo(pcx, wy - dm.D * 0.16); ctx.lineTo(pcx + pw / 2, wy + dm.D * 0.02); ctx.closePath(); ctx.fill();
    ctx.fillStyle = Cw[1]; ctx.beginPath(); ctx.moveTo(pcx - pw * 0.42, wy + dm.D * 0.005); ctx.lineTo(pcx, wy - dm.D * 0.13); ctx.lineTo(pcx + pw * 0.42, wy + dm.D * 0.005); ctx.closePath(); ctx.fill();
    // the dome sits behind the pediment: draw it first in a clip above the roof, then repaint the pediment
    ctx.save(); ctx.beginPath(); ctx.rect(L.wx0, L.wy0, L.wx1 - L.wx0, wy - L.wy0); ctx.clip();
    D.capitol(ctx, { cx: dm.cx, base: dm.base, D: dm.D, s: s, night: night, lit: night });
    ctx.restore();
    ctx.fillStyle = Cw[0]; ctx.beginPath(); ctx.moveTo(pcx - pw / 2, wy + dm.D * 0.02); ctx.lineTo(pcx, wy - dm.D * 0.16); ctx.lineTo(pcx + pw / 2, wy + dm.D * 0.02); ctx.closePath(); ctx.fill();
    ctx.fillStyle = night ? '#c8cce8' : '#ece4d2'; ctx.beginPath(); ctx.moveTo(pcx - pw * 0.4, wy); ctx.lineTo(pcx, wy - dm.D * 0.12); ctx.lineTo(pcx + pw * 0.4, wy); ctx.closePath(); ctx.fill();
    ctx.fillStyle = Cw[0]; ctx.fillRect(L.wx0, wy + dm.D * 0.015, L.wx1 - L.wx0, dm.D * 0.035);
    // columns of the wing's portico
    for (i = 0; i < 9; i++) { x = pcx - pw * 0.42 + i * pw * 0.84 / 8; ctx.fillStyle = lg(ctx, x - dm.D * 0.015, 0, x + dm.D * 0.015, 0, [[0, Cw[0]], [1, Cw[2]]]); ctx.fillRect(x - dm.D * 0.014, wy + dm.D * 0.05, dm.D * 0.028, dm.D * 0.22); }
    for (i = 0; i < 8; i++) { x = pcx - pw * 0.42 + (i + 0.5) * pw * 0.84 / 8; ctx.fillStyle = night ? '#4a4f88' : '#a6aabb'; ctx.fillRect(x - dm.D * 0.03, wy + dm.D * 0.06, dm.D * 0.06, dm.D * 0.2);
      ctx.fillStyle = night ? (i % 3 ? '#ffd890' : '#e8c070') : '#5a6684'; ctx.beginPath(); D.rrect(ctx, x - dm.D * 0.014, wy + dm.D * 0.1, dm.D * 0.028, dm.D * 0.09, dm.D * 0.012); ctx.fill(); }
    // the long facade beyond the portico, with rows of windows
    for (i = 0; i < 14; i++) { x = L.wx0 + (i + 0.5) * (L.wx1 - L.wx0) / 14; if (Math.abs(x - pcx) < pw * 0.5) continue; ctx.fillStyle = night ? (i % 4 ? '#f0c878' : '#6a6aa0') : '#7a84a0'; ctx.fillRect(x - dm.D * 0.012, wy + dm.D * 0.1, dm.D * 0.024, dm.D * 0.07); }
    if (night) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; D.glow(ctx, dm.cx, dm.base - dm.D * 0.4, dm.D * 1.2, '#b8c0ff', 0.18); D.glow(ctx, pcx, wy + dm.D * 0.2, dm.D * 0.9, '#ffe0a8', 0.12); ctx.restore(); }
    // trees along Independence Avenue: spring green with cherry blossom
    var tr = D.rng(night ? 91311 : 91211);
    var green = night ? ['#0e1a26', '#162636', '#22384a', '#34506a', '#4a6a88'] : ['#2a4a34', '#3a6a40', '#5a9450', '#8cc26a', '#d8f0a8'];
    var pink = night ? ['#2a1e3a', '#3a2a4e', '#5a3e6a', '#7a5a8a', '#a07ab0'] : ['#a85878', '#d27a98', '#f0a2bc', '#fbcadb', '#fff0f6'];
    // two rows of crowns: a darker back row, then a front row where a few cherry trees bloom
    var green2 = green.map(function (c) { return mix(c, night ? '#0a0e20' : '#6a8aa8', 0.3); });
    for (i = 0; i < 16; i++) { var bx2 = L.wx0 + (i / 15) * (L.wx1 - L.wx0) + (tr() - 0.5) * w * 0.02; D.clump(ctx, bx2, L.wy1 - h * (0.035 + tr() * 0.015), w * (0.022 + tr() * 0.014), green2, tr, -0.6, -0.8, true, 0.7); }
    for (i = 0; i < 12; i++) { var fx2 = L.wx0 + ((i + 0.5) / 12) * (L.wx1 - L.wx0) + (tr() - 0.5) * w * 0.02, pk = (i % 4 === 1 || i % 5 === 3);
      D.clump(ctx, fx2, L.wy1 - h * (0.012 + tr() * 0.01), w * (pk ? 0.03 : 0.024) * (0.85 + tr() * 0.3), pk ? pink : green, tr, -0.6, -0.8, false, pk ? 0.9 : 0.75); }
    if (!night) D.dots(ctx, 50, [['#fff0f6', 0.85], ['#f7b8cc', 0.8]], function () { return [D.lerp(L.wx0, L.wx1, tr()), L.wy1 - h * tr() * 0.05, (0.5 + tr() * 0.8) * s, tr() < 0.5 ? 0 : 1]; });
    if (!night) D.haze(ctx, L.wx0, L.wy0 + (L.wy1 - L.wy0) * 0.4, L.wx1, L.wy1, '#e6f0f6', 0.18);
    ctx.restore();
    // window glass sheen
    ctx.save(); ctx.beginPath(); ctx.rect(L.wx0, L.wy0, L.wx1 - L.wx0, L.wy1 - L.wy0); ctx.clip(); ctx.globalCompositeOperation = 'lighter';
    for (i = 0; i < 3; i++) { var sx = L.wx0 + (L.wx1 - L.wx0) * (0.1 + i * 0.36); ctx.fillStyle = rgba('#ffffff', night ? 0.03 : 0.07); ctx.beginPath(); ctx.moveTo(sx, L.wy0); ctx.lineTo(sx + w * 0.05, L.wy0); ctx.lineTo(sx - w * 0.06, L.wy1); ctx.lineTo(sx - w * 0.11, L.wy1); ctx.fill(); }
    ctx.restore();
    /* ---------- the wall ---------- */
    var wallC = night ? ['#3a3048', '#4a3c52', '#5a4858'] : ['#e9dcc4', '#f2e8d4', '#fbf4e6'];
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, L.rail); ctx.rect(L.wx0, L.wy0, L.wx1 - L.wx0, L.wy1 - L.wy0); ctx.clip('evenodd');
    ctx.fillStyle = lg(ctx, 0, 0, 0, L.rail, [[0, wallC[0]], [0.5, wallC[1]], [1, wallC[0]]]); ctx.fillRect(0, 0, w, L.rail);
    D.batch(ctx, 700, [[wallC[2], 1.2 * s, 0.18], [mix(wallC[0], '#8a6a4a', 0.15), 1.2 * s, 0.12]], function () { var xx = r() * w, yy = r() * L.rail, l = (6 + r() * 16) * s; return [xx, yy, xx + l * 0.3, yy + l, r() < 0.5 ? 0 : 1]; });
    if (night) { D.softGlow(ctx, w * 0.36, h * 0.3, w * 0.5, '#ffb070', 0.18); }
    else D.glow(ctx, w * 0.42, h * 0.2, w * 0.7, '#fff6e0', 0.25);
    ctx.restore();
    // crown molding + ceiling
    ctx.fillStyle = night ? '#2a2236' : '#f6f0e4'; ctx.fillRect(0, 0, w, L.ceil);
    ctx.fillStyle = night ? '#4a3e58' : '#fffaf0'; ctx.fillRect(0, L.ceil - 5 * s, w, 5 * s);
    ctx.fillStyle = rgba('#5a4030', 0.25); ctx.fillRect(0, L.ceil, w, 2 * s);
    for (x = 0; x < w; x += 7 * s) { ctx.fillStyle = rgba('#5a4030', 0.12); ctx.fillRect(x, L.ceil - 4 * s, 3 * s, 3 * s); }
    // window frame, sash bars and drapes
    var fr = night ? '#8a84a2' : '#fdfbf6', frS = night ? '#58526e' : '#d8d0c0';
    ctx.fillStyle = frS; ctx.fillRect(L.wx0 - 9 * s, L.wy0 - 9 * s, L.wx1 - L.wx0 + 18 * s, 9 * s); ctx.fillRect(L.wx0 - 9 * s, L.wy1, L.wx1 - L.wx0 + 18 * s, 10 * s);
    ctx.fillStyle = fr; ctx.fillRect(L.wx0 - 7 * s, L.wy0 - 7 * s, L.wx1 - L.wx0 + 14 * s, 7 * s); ctx.fillRect(L.wx0 - 10 * s, L.wy1 + 1 * s, L.wx1 - L.wx0 + 20 * s, 6 * s);
    ctx.fillRect(L.wx0 - 7 * s, L.wy0, 7 * s, L.wy1 - L.wy0); ctx.fillRect(L.wx1, L.wy0, 7 * s, L.wy1 - L.wy0);
    var midY = L.wy0 + (L.wy1 - L.wy0) * 0.5;
    ctx.fillRect(L.wx0, midY - 3.5 * s, L.wx1 - L.wx0, 7 * s);
    for (i = 1; i < 3; i++) { x = L.wx0 + (L.wx1 - L.wx0) * i / 3; ctx.fillRect(x - 1.6 * s, L.wy0, 3.2 * s, L.wy1 - L.wy0); }
    for (i = 1; i < 2; i++) { y = L.wy0 + (midY - L.wy0) * i / 2; ctx.fillRect(L.wx0, y - 1.4 * s, L.wx1 - L.wx0, 2.8 * s); y = midY + (L.wy1 - midY) * i / 2; ctx.fillRect(L.wx0, y - 1.4 * s, L.wx1 - L.wx0, 2.8 * s); }
    ctx.fillStyle = rgba('#000000', 0.12); ctx.fillRect(L.wx0, midY + 3.5 * s, L.wx1 - L.wx0, 2 * s);
    // drapes: navy velvet, gold tiebacks, soft folds
    function drape(x0, x1, side) {
      var top = L.wy0 - 16 * s, bot = L.rail + h * 0.02, tie = h * 0.38;
      ctx.beginPath(); ctx.moveTo(x0, top); ctx.lineTo(x1, top);
      if (side < 0) { ctx.bezierCurveTo(x1, tie - h * 0.08, x1 - (x1 - x0) * 0.55, tie - h * 0.02, x1 - (x1 - x0) * 0.6, tie); ctx.bezierCurveTo(x1 - (x1 - x0) * 0.3, tie + h * 0.06, x1, bot - h * 0.05, x1 + 4 * s, bot); ctx.lineTo(x0, bot); }
      else { ctx.lineTo(x1, bot); ctx.lineTo(x0 - 4 * s, bot); ctx.bezierCurveTo(x0, bot - h * 0.05, x0 + (x1 - x0) * 0.3, tie + h * 0.06, x0 + (x1 - x0) * 0.6, tie); ctx.bezierCurveTo(x0 + (x1 - x0) * 0.55, tie - h * 0.02, x0, tie - h * 0.08, x0, top); }
      ctx.closePath();
      var dc = night ? ['#141838', '#22285a', '#343c78'] : ['#1c2654', '#2a3a7a', '#4a5aa0'];
      ctx.fillStyle = lg(ctx, x0, 0, x1, 0, [[0, dc[1]], [0.5, dc[2]], [1, dc[0]]]); ctx.fill();
      ctx.save(); ctx.clip();
      for (var f = 0; f < 6; f++) { var fx = x0 + (x1 - x0) * (f + 0.5) / 6; ctx.fillStyle = lg(ctx, fx - 4 * s, 0, fx + 4 * s, 0, [[0, 'rgba(0,0,0,0)'], [0.5, f % 2 ? rgba(dc[2], 0.7) : 'rgba(0,0,0,0.3)'], [1, 'rgba(0,0,0,0)']]); ctx.fillRect(fx - 5 * s, top, 10 * s, bot - top); }
      ctx.restore();
      ctx.fillStyle = '#d8b04a'; var tx2 = side < 0 ? x1 - (x1 - x0) * 0.55 : x0 + (x1 - x0) * 0.55; ctx.beginPath(); D.rrect(ctx, tx2 - 7 * s, tie - 3 * s, 14 * s, 6 * s, 3 * s); ctx.fill();
      ctx.fillStyle = '#b08a2a'; ctx.beginPath(); ctx.arc(tx2, tie + 6 * s, 3 * s, 0, TAU); ctx.fill(); ctx.fillRect(tx2 - 1 * s, tie + 6 * s, 2 * s, 9 * s);
    }
    drape(L.wx0 - w * 0.075, L.wx0 + w * 0.01, -1); drape(L.wx1 - w * 0.01, w * 1.02, 1);
    // valance rod
    ctx.fillStyle = '#c8a040'; ctx.fillRect(L.wx0 - w * 0.09, L.wy0 - 19 * s, L.wx1 - L.wx0 + w * 0.15, 4 * s);
    ctx.beginPath(); ctx.arc(L.wx0 - w * 0.09, L.wy0 - 17 * s, 4 * s, 0, TAU); ctx.fill();
    /* ---------- the big picture on the wall: Halden Creek on its river (mostly behind the speaker) ---------- */
    var px0 = w * 0.3, py0 = h * 0.13, pw2 = w * 0.2, ph2 = h * 0.12;
    ctx.fillStyle = '#b08a3a'; ctx.fillRect(px0 - 5 * s, py0 - 5 * s, pw2 + 10 * s, ph2 + 10 * s);
    ctx.fillStyle = night ? '#3a4466' : '#a8cce4'; ctx.fillRect(px0, py0, pw2, ph2 * 0.55);
    ctx.fillStyle = night ? '#24324a' : '#5a8a5a'; ctx.beginPath(); ctx.moveTo(px0, py0 + ph2 * 0.5); for (i = 0; i <= 8; i++) ctx.lineTo(px0 + pw2 * i / 8, py0 + ph2 * (0.42 + 0.08 * Math.sin(i * 1.3))); ctx.lineTo(px0 + pw2, py0 + ph2); ctx.lineTo(px0, py0 + ph2); ctx.fill();
    ctx.fillStyle = night ? '#2a3a5a' : '#6aa8d0'; ctx.fillRect(px0, py0 + ph2 * 0.7, pw2, ph2 * 0.3);
    ctx.strokeStyle = night ? '#8a8aa8' : '#f4efe4'; ctx.lineWidth = 1.4 * s; ctx.beginPath(); ctx.moveTo(px0, py0 + ph2 * 0.68); ctx.quadraticCurveTo(px0 + pw2 / 2, py0 + ph2 * 0.52, px0 + pw2, py0 + ph2 * 0.68); ctx.stroke();
    for (i = 0; i < 5; i++) { ctx.fillStyle = ['#d06a4a', '#f4e4c4', '#6a8ac0', '#e8c060', '#c45a5a'][i]; ctx.fillRect(px0 + pw2 * (0.1 + i * 0.16), py0 + ph2 * 0.48, pw2 * 0.09, ph2 * 0.14); }
    /* ---------- bookcase (left) ---------- */
    var bw0 = L.bk0, bw1 = L.bk1, by0 = L.bky0, by1 = L.bky1, woodC = night ? ['#1e140e', '#3a2618', '#5a3e28'] : ['#3e2614', '#6a4426', '#9a6a3e'];
    ctx.fillStyle = lg(ctx, bw0, 0, bw1, 0, [[0, woodC[0]], [0.7, woodC[1]], [1, woodC[2]]]); ctx.fillRect(bw0, by0 - 8 * s, bw1 - bw0 + 4 * s, by1 - by0 + 8 * s);
    ctx.fillStyle = woodC[2]; ctx.fillRect(bw0, by0 - 12 * s, bw1 - bw0 + 8 * s, 6 * s);
    var shelves = 5, sh = (by1 - by0 - 10 * s) / shelves;
    for (i = 0; i < shelves; i++) {
      var sy0 = by0 + i * sh, sy1 = sy0 + sh - 4 * s;
      ctx.fillStyle = night ? '#120c08' : '#2a1a0e'; ctx.fillRect(bw0 + 2 * s, sy0, bw1 - bw0 - 6 * s, sh - 4 * s);
      D.books(ctx, bw0 + 3 * s, sy0 + sh * 0.12, bw1 - 7 * s, sy1, s, r, night);
      if (i === 2) { ctx.fillStyle = night ? '#6a5a3a' : '#c8a050'; ctx.fillRect(bw1 - 30 * s, sy1 - 22 * s, 18 * s, 22 * s); ctx.fillStyle = night ? '#3a4a5a' : '#7ab0d0'; ctx.fillRect(bw1 - 28 * s, sy1 - 20 * s, 14 * s, 14 * s); }
      ctx.fillStyle = woodC[2]; ctx.fillRect(bw0, sy1, bw1 - bw0, 4 * s); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(bw0, sy1 + 4 * s, bw1 - bw0, 2 * s);
    }
    ctx.fillStyle = woodC[1]; ctx.fillRect(bw1 - 4 * s, by0 - 8 * s, 8 * s, by1 - by0 + 8 * s);
    ctx.fillStyle = woodC[2]; ctx.fillRect(bw1 - 4 * s, by0 - 8 * s, 2 * s, by1 - by0 + 8 * s);
    /* ---------- wainscot, baseboard, carpet ---------- */
    D.woodWall(ctx, 0, L.rail, w, L.base, { pal: night ? ['#1a110c', '#2e1e14', '#4a3222'] : ['#3a2414', '#5e3c22', '#8a5e38'], cols: 6, rows: 1, s: s, seed: night ? 7 : 5 });
    ctx.fillStyle = night ? '#5a4632' : '#a8784a'; ctx.fillRect(0, L.rail - 5 * s, w, 5 * s); ctx.fillStyle = rgba('#ffffff', night ? 0.08 : 0.25); ctx.fillRect(0, L.rail - 5 * s, w, 1.5 * s);
    ctx.fillStyle = night ? '#120a06' : '#2a1a0e'; ctx.fillRect(0, L.base - 6 * s, w, 6 * s);
    var fy0 = L.base;
    ctx.fillStyle = lg(ctx, 0, fy0, 0, h, night ? [[0, '#141a3a'], [1, '#0c1028']] : [[0, '#2a3a6a'], [1, '#1e2a52']]); ctx.fillRect(0, fy0, w, h - fy0);
    D.batch(ctx, 1400, [[night ? '#2a3260' : '#4a5a92', 0.8 * s, 0.3], [night ? '#0a0c20' : '#141c3a', 0.8 * s, 0.3]], function () { var xx = r() * w, yy = D.lerp(fy0, h, r()), l = (1.5 + r() * 3) * s; return [xx, yy, xx + l, yy + (r() - 0.5) * s, r() < 0.5 ? 0 : 1]; });
    // rug with a gold border, in perspective
    var ry0 = h * 0.74, ry1 = h * 1.02, rx0 = w * 0.16, rx1 = w * 0.84, spread = w * 0.1;
    D.poly(ctx, [[rx0, ry0], [rx1, ry0], [rx1 + spread, ry1], [rx0 - spread, ry1]]);
    ctx.fillStyle = night ? '#4a2a2a' : '#8a3a34'; ctx.fill();
    D.poly(ctx, [[rx0 + 8 * s, ry0 + 5 * s], [rx1 - 8 * s, ry0 + 5 * s], [rx1 + spread - 12 * s, ry1], [rx0 - spread + 12 * s, ry1]]);
    ctx.strokeStyle = night ? '#8a6a3a' : '#e0b85a'; ctx.lineWidth = 2 * s; ctx.stroke();
    D.poly(ctx, [[rx0 + 16 * s, ry0 + 10 * s], [rx1 - 16 * s, ry0 + 10 * s], [rx1 + spread - 22 * s, ry1], [rx0 - spread + 22 * s, ry1]]);
    ctx.fillStyle = night ? '#3a1e24' : '#6e2a2c'; ctx.fill();
    // a gold star medallion in the middle of the rug (foreshortened)
    ctx.save(); ctx.translate(w * 0.5, h * 0.82); ctx.scale(1, 0.32); ctx.fillStyle = night ? '#6a5030' : '#d8a848';
    ctx.beginPath(); for (i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? w * 0.035 : w * 0.085; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); ctx.fill();
    ctx.strokeStyle = night ? '#6a5030' : '#d8a848'; ctx.lineWidth = 2 * s; ctx.beginPath(); ctx.arc(0, 0, w * 0.12, 0, TAU); ctx.stroke(); ctx.restore();
    if (!night) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      var Q = [[w * 0.5, L.base + 2 * s], [w * 0.9, L.base + 2 * s], [w * 0.66, h * 0.99], [w * 0.12, h * 0.99]];
      D.poly(ctx, Q); ctx.fillStyle = lg(ctx, 0, L.base, 0, h, [[0, 'rgba(255,236,190,0.16)'], [1, 'rgba(255,236,190,0.05)']]); ctx.fill();
      ctx.restore();
      ctx.fillStyle = 'rgba(20,24,60,0.16)';
      [1 / 3, 2 / 3].forEach(function (f) { var a = D.lerp(Q[0][0], Q[1][0], f), b = D.lerp(Q[3][0], Q[2][0], f); D.poly(ctx, [[a - 2 * s, Q[0][1]], [a + 2 * s, Q[0][1]], [b + 5 * s, Q[3][1]], [b - 5 * s, Q[3][1]]]); ctx.fill(); });
      var my2 = D.lerp(L.base, h, 0.5); ctx.fillRect(D.lerp(Q[0][0], Q[3][0], 0.5), my2 - 3 * s, D.lerp(Q[1][0], Q[2][0], 0.5) - D.lerp(Q[0][0], Q[3][0], 0.5), 6 * s);
    }
    ctx.fillStyle = lg(ctx, 0, L.base, 0, L.base + h * 0.04, [[0, 'rgba(0,0,0,0.3)'], [1, 'rgba(0,0,0,0)']]); ctx.fillRect(0, L.base, w, h * 0.04);
    /* ---------- the flag on its pole ---------- */
    D.flagPole(ctx, { x: L.pole, top: h * 0.12, foot: h * 0.72, s: s, side: 1, night: night, seed: 3 });
    /* ---------- the low table for props ---------- */
    var t0 = L.tx0, t1 = L.tx1, ty0 = L.tabY, td = h * 0.03;
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(w * 0.5, ty0 + td + h * 0.05, (t1 - t0) * 0.6, h * 0.02, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = night ? '#24160e' : '#4a2c18'; ctx.fillRect(t0 + 10 * s, ty0 + td, 6 * s, h * 0.06); ctx.fillRect(t1 - 16 * s, ty0 + td, 6 * s, h * 0.06);
    ctx.fillStyle = lg(ctx, 0, ty0 - td * 0.2, 0, ty0 + td, night ? [[0, '#5a3a24'], [1, '#2a1a10']] : [[0, '#9a6638'], [0.4, '#7a4c28'], [1, '#4a2c16']]);
    ctx.beginPath(); D.rrect(ctx, t0, ty0 - td * 0.15, t1 - t0, td * 1.15, 4 * s); ctx.fill();
    ctx.fillStyle = rgba('#ffffff', night ? 0.1 : 0.22); ctx.fillRect(t0 + 6 * s, ty0 - td * 0.1, t1 - t0 - 12 * s, 1.5 * s);
    if (night) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; D.glow(ctx, w * 0.5, ty0 - h * 0.02, w * 0.4, '#ffb060', 0.25); ctx.restore(); }
    /* ---------- light ---------- */
    if (!night) D.shafts(ctx, L.wx0 + (L.wx1 - L.wx0) * 0.3, L.wy0, w, h, '#fff4d8', 0.05, 6, r, 0.35, Math.PI * 0.62, 0.02, 0.05);
    // brass ceiling pendant (half hidden by the HUD)
    var cx2 = w * 0.42, cy2 = h * 0.075;
    ctx.strokeStyle = night ? '#6a5a3a' : '#9a7a3a'; ctx.lineWidth = 1.4 * s; ctx.beginPath(); ctx.moveTo(cx2, 0); ctx.lineTo(cx2, cy2 - 8 * s); ctx.stroke();
    ctx.fillStyle = night ? '#ffe6b0' : '#fff2d6'; ctx.beginPath(); ctx.moveTo(cx2 - 14 * s, cy2 + 6 * s); ctx.quadraticCurveTo(cx2, cy2 - 14 * s, cx2 + 14 * s, cy2 + 6 * s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c8a040'; ctx.fillRect(cx2 - 15 * s, cy2 + 5 * s, 30 * s, 3 * s);
    if (night) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; D.glow(ctx, cx2, cy2 + 6 * s, w * 0.35, '#ffb868', 0.35); ctx.restore(); }
    D.finish(ctx, w, h, night ? '#3a2a5a' : '#fff0d8', night ? 0.18 : 0.1, night ? 0.32 : 0.16, 0.035, night ? '#06061a' : '#2a1e14', 0.4);
  }
  function overlay(ctx, w, h, t, night) {
    var D = K(), L = lay(w, h), s = L.s, i;
    ctx.save(); ctx.beginPath(); ctx.rect(L.wx0, L.wy0, L.wx1 - L.wx0, (L.wy1 - L.wy0) * 0.62); ctx.clip();
    if (night) {
      for (i = 0; i < 14; i++) { var tw = Math.pow(Math.max(0, Math.sin(t * (0.8 + D.hash(i, 5) * 1.6) + i * 3)), 6); if (tw < 0.05) continue; var sx = D.lerp(L.wx0, L.wx1, D.hash(i, 6)), sy = D.lerp(L.wy0, L.wy0 + (L.wy1 - L.wy0) * 0.45, D.hash(i, 7)); ctx.globalAlpha = tw; ctx.fillStyle = '#ffffff'; ctx.fillRect(sx - 2 * s * tw, sy - 0.3 * s, 4 * s * tw, 0.6 * s); ctx.fillRect(sx - 0.3 * s, sy - 2 * s * tw, 0.6 * s, 4 * s * tw); }
      // the lantern on the dome breathes softly
      var dm = L.dome, ly = dm.base - dm.D * 0.94; ctx.globalAlpha = 0.25 + 0.15 * Math.sin(t * 1.3); ctx.globalCompositeOperation = 'lighter'; D.glow(ctx, dm.cx, ly, dm.D * 0.22, '#ffe6a0', 0.7);
      // a plane's blinking light crossing slowly
      var px = L.wx0 + ((t * 6 * s) % ((L.wx1 - L.wx0) * 1.4)) - (L.wx1 - L.wx0) * 0.2, py = L.wy0 + h * 0.05; ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = (Math.sin(t * 6) > 0.6) ? 1 : 0.25; ctx.fillStyle = '#ff6a6a'; ctx.beginPath(); ctx.arc(px, py, 1.4 * s, 0, D.TAU); ctx.fill();
    } else {
      // birds over the dome, a delivery drone crossing
      ctx.strokeStyle = 'rgba(50,60,90,0.75)'; ctx.lineWidth = 1 * s; ctx.lineCap = 'round';
      for (i = 0; i < 3; i++) { var bx = L.wx0 + ((t * (9 + i * 3) * s + i * 70 * s) % ((L.wx1 - L.wx0) * 1.3)) - (L.wx1 - L.wx0) * 0.15, by = L.wy0 + h * (0.05 + i * 0.025) + Math.sin(t * 0.9 + i) * 4 * s, f = Math.sin(t * 7 + i * 2) * 2.4 * s, z = (3.6 - i * 0.5) * s;
        ctx.beginPath(); ctx.moveTo(bx - z, by - f * 0.4); ctx.quadraticCurveTo(bx - z * 0.4, by - f - z * 0.3, bx, by); ctx.quadraticCurveTo(bx + z * 0.4, by - f - z * 0.3, bx + z, by - f * 0.4); ctx.stroke(); }
      var dx = L.wx1 - ((t * 11 * s) % ((L.wx1 - L.wx0) * 1.5)) + (L.wx1 - L.wx0) * 0.2, dy = L.wy0 + h * 0.15 + Math.sin(t * 1.4) * 3 * s;
      ctx.fillStyle = '#f4f6fb'; ctx.fillRect(dx - 6 * s, dy - 1.2 * s, 12 * s, 2.4 * s); ctx.fillStyle = '#c8d0e0'; ctx.fillRect(dx - 8 * s, dy - 2.6 * s, 4 * s, 0.8 * s); ctx.fillRect(dx + 4 * s, dy - 2.6 * s, 4 * s, 0.8 * s); ctx.fillStyle = '#26346a'; ctx.fillRect(dx - 2 * s, dy + 1.2 * s, 4 * s, 3 * s);
    }
    ctx.restore();
    // dust motes drifting in the window light (day) or lamp light (night)
    var sp = null;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (i = 0; i < 16; i++) { var ph = (t * (0.02 + D.hash(i, 21) * 0.03) + D.hash(i, 22)) % 1, mx = (night ? w * 0.35 : L.wx0) + D.hash(i, 23) * w * (night ? 0.3 : 0.35) - ph * w * 0.15, my = h * (0.15 + D.hash(i, 24) * 0.5) + ph * h * 0.12;
      ctx.globalAlpha = Math.sin(ph * Math.PI) * 0.5; ctx.fillStyle = night ? '#ffc888' : '#fff6dc'; ctx.beginPath(); ctx.arc(mx, my, (0.6 + D.hash(i, 25)) * s, 0, D.TAU); ctx.fill(); }
    ctx.restore();
  }
  PAINT.dc_office = {
    focus: { x: 0.775, y: 0.32 }, track: 'work',
    anchors: { table: { y: 0.905, x0: 0.3, x1: 0.7 }, dome: { x: 0.775, y: 0.32 }, window: { x0: 0.56, x1: 0.96, y0: 0.07, y1: 0.56 } },
    paint: function (ctx, w, h) { try { paintOffice(ctx, w, h, false); } catch (e) { PAINT._err = 'dc_office: ' + String(e && e.stack || e); } },
    overlay: function (ctx, w, h, t) { try { overlay(ctx, w, h, t, false); } catch (e) { PAINT._err = 'dc_office overlay: ' + String(e && e.stack || e); } }
  };
  PAINT.dc_night = {
    focus: { x: 0.775, y: 0.32 }, track: 'night',
    anchors: { table: { y: 0.905, x0: 0.3, x1: 0.7 }, dome: { x: 0.775, y: 0.32 } },
    paint: function (ctx, w, h) { try { paintOffice(ctx, w, h, true); } catch (e) { PAINT._err = 'dc_night: ' + String(e && e.stack || e); } },
    overlay: function (ctx, w, h, t) { try { overlay(ctx, w, h, t, true); } catch (e) { PAINT._err = 'dc_night overlay: ' + String(e && e.stack || e); } }
  };
})();
