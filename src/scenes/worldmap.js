/* scenes/worldmap.js - the painted world map for the campaign hub (src/worldmap.js draws the medallions on top).
   The Earth is seen from above the North Pole (an azimuthal map, like the UN emblem), so Alaska, the US, Europe and
   China all fit in one round globe that works in a phone portrait and in a wide landscape. North America sits at the
   bottom, Europe to the upper right and China at the top. The Moon and Mars hang in the starry sky.
   Defines PAINT.world0 ... PAINT.world11, one per campaign chapter (Spring 2040 ... Winter 2042): the seasons change
   the snow line, the sea ice and the colors of the land, and the years grow the Moon base, the Mars outpost and the
   Phoenix Special Economic Zone. Also defines window.WMAP = {layout(w,h), project(lat,lon,L), key(chapter)} so the
   DOM layer can put medallions exactly over the painted places.
   Painting utilities are adapted from src/paint_boston.js. Everything is seeded, so each chapter paints identically. */
(function () {
  'use strict';
  var PAINT = (window.PAINT = window.PAINT || {});
  var PI = Math.PI, TAU = PI * 2, DEG = PI / 180;

  /* ============================== utilities (from paint_boston.js) ============================== */
  function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function hash(i, s) { var x = Math.imul((i | 0) ^ Math.imul(s | 0, 0x9E3779B1), 0x27d4eb2d); x ^= x >>> 15; x = Math.imul(x, 0x85ebca6b); x ^= x >>> 13; x = Math.imul(x, 0xc2b2ae35); x ^= x >>> 16; return (x >>> 0) / 4294967296; }
  function h2(ix, iy, s) { return hash(Math.imul(ix | 0, 0x1B873593) ^ Math.imul(iy | 0, 0x5BD1E995), s); }
  function vn2(x, y, s) { var ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
    var a = h2(ix, iy, s), b = h2(ix + 1, iy, s), c = h2(ix, iy + 1, s), d = h2(ix + 1, iy + 1, s); return (a + (b - a) * ux) * (1 - uy) + (c + (d - c) * ux) * uy; }
  function fbm2(x, y, s, oct) { var v = 0, a = 0.5, fr = 1, n = 0, o; for (o = 0; o < (oct || 4); o++) { v += a * vn2(x * fr, y * fr, s + o * 71); n += a; a *= 0.5; fr *= 2.03; } return v / n; }
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
  function memo(fn) { var key = null, val = null; return function (w, h) { var k = w + 'x' + h; if (k !== key) { key = k; val = fn(w, h); } return val; }; }
  function glow(ctx, x, y, r, col, a) { ctx.fillStyle = rg(ctx, x, y, 0, r, [[0, rgba(col, a)], [0.35, rgba(col, a * 0.35)], [1, rgba(col, 0)]]); ctx.fillRect(x - r, y - r, r * 2, r * 2); }
  function softGlow(ctx, x, y, r, col, a) { ctx.fillStyle = rg(ctx, x, y, 0, r, [[0, rgba(col, a)], [0.5, rgba(col, a * 0.5)], [1, rgba(col, 0)]]); ctx.fillRect(x - r, y - r, r * 2, r * 2); }
  function puff(ctx, x, y, R, col, a) { ctx.fillStyle = rg(ctx, x, y, 0, R, [[0, rgba(col, a)], [0.5, rgba(col, a * 0.85)], [0.8, rgba(col, a * 0.35)], [1, rgba(col, 0)]]); ctx.fillRect(x - R, y - R, R * 2, R * 2); }
  function batch(ctx, n, cols, gen) { var paths = [], i, k; for (k = 0; k < cols.length; k++) paths.push([]);
    for (i = 0; i < n; i++) { var s = gen(i); if (s) paths[s[4]].push(s); }
    ctx.save(); ctx.lineCap = 'round';
    for (k = 0; k < cols.length; k++) { var p = paths[k]; if (!p.length) continue; ctx.beginPath();
      for (i = 0; i < p.length; i++) { ctx.moveTo(p[i][0], p[i][1]); if (p[i].length > 5) ctx.quadraticCurveTo(p[i][5], p[i][6], p[i][2], p[i][3]); else ctx.lineTo(p[i][2], p[i][3]); }
      ctx.strokeStyle = cols[k][0]; ctx.lineWidth = cols[k][1]; ctx.globalAlpha = cols[k][2]; ctx.stroke(); }
    ctx.restore(); }
  var QK = 0.914;
  function qcirc(ctx, x, y, r) { if (r < 1.1) { ctx.rect(x - r, y - r, r * 2, r * 2); return; } var c = r * QK;
    ctx.moveTo(x + r, y); ctx.quadraticCurveTo(x + c, y + c, x, y + r); ctx.quadraticCurveTo(x - c, y + c, x - r, y); ctx.quadraticCurveTo(x - c, y - c, x, y - r); ctx.quadraticCurveTo(x + c, y - c, x + r, y); }
  function qell(ctx, x, y, rx, ry, a) { var ca = Math.cos(a || 0), sa = Math.sin(a || 0), k = QK;
    function X(u, v) { return x + u * ca - v * sa; } function Y(u, v) { return y + u * sa + v * ca; }
    ctx.moveTo(X(rx, 0), Y(rx, 0)); ctx.quadraticCurveTo(X(rx * k, ry * k), Y(rx * k, ry * k), X(0, ry), Y(0, ry)); ctx.quadraticCurveTo(X(-rx * k, ry * k), Y(-rx * k, ry * k), X(-rx, 0), Y(-rx, 0));
    ctx.quadraticCurveTo(X(-rx * k, -ry * k), Y(-rx * k, -ry * k), X(0, -ry), Y(0, -ry)); ctx.quadraticCurveTo(X(rx * k, -ry * k), Y(rx * k, -ry * k), X(rx, 0), Y(rx, 0)); }
  function dots(ctx, n, cols, gen) { var i, k, b = []; for (k = 0; k < cols.length; k++) b.push([]); for (i = 0; i < n; i++) { var d = gen(i); if (d) b[d[3]].push(d); }
    ctx.save(); for (k = 0; k < cols.length; k++) { if (!b[k].length) continue; ctx.fillStyle = cols[k][0]; ctx.globalAlpha = cols[k][1]; ctx.beginPath(); for (i = 0; i < b[k].length; i++) { var q = b[k][i]; qcirc(ctx, q[0], q[1], q[2]); } ctx.fill(); } ctx.restore(); }
  function dabs(ctx, n, cols, gen) { var i, k, b = []; for (k = 0; k < cols.length; k++) b.push([]); for (i = 0; i < n; i++) { var d = gen(i); if (d) b[d[4]].push(d); }
    ctx.save(); for (k = 0; k < cols.length; k++) { if (!b[k].length) continue; ctx.fillStyle = cols[k][0]; ctx.globalAlpha = cols[k][1]; ctx.beginPath(); for (i = 0; i < b[k].length; i++) { var q = b[k][i]; qell(ctx, q[0], q[1], q[2], q[3], q[5] || 0); } ctx.fill(); } ctx.restore(); }
  var grainCv = null;
  function finish(ctx, w, h, gradeCol, gradeA, vig, grainA, vigCol, vy) {
    try { ctx.save();
      if (gradeCol) { ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = gradeA; ctx.fillStyle = gradeCol; ctx.fillRect(0, 0, w, h); }
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      var R = Math.max(w, h) * 0.75, vc = vigCol || '#14101e';
      if (vig > 0) { ctx.fillStyle = rg(ctx, w / 2, h * (vy || 0.42), R * 0.35, R, [[0, rgba(vc, 0)], [1, rgba(vc, vig)]]); ctx.fillRect(0, 0, w, h); }
      if (!grainCv && typeof document !== 'undefined') { grainCv = mk(128, 128); var g = grainCv.getContext('2d'), id = g.createImageData(128, 128), r = rng(4242), i, v;
        for (i = 0; i < 128 * 128; i++) { v = (r() * 255) | 0; id.data[i * 4] = v; id.data[i * 4 + 1] = v; id.data[i * 4 + 2] = v; id.data[i * 4 + 3] = 255; } g.putImageData(id, 0, 0); }
      if (grainCv && grainA > 0) { ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = grainA; ctx.fillStyle = ctx.createPattern(grainCv, 'repeat'); ctx.fillRect(0, 0, w, h); }
      ctx.restore(); } catch (e) { try { ctx.restore(); } catch (e2) {} } }
  var SPR = {};
  function glowSpr(col, hard) { var key = col + (hard ? 'h' : ''); if (SPR[key] !== undefined) return SPR[key];
    var c = mk(64, 64); if (c) { var g = c.getContext('2d'); g.fillStyle = rg(g, 32, 32, 0, 32, hard ? [[0, rgba('#ffffff', 1)], [0.12, rgba(col, 1)], [0.3, rgba(col, 0.35)], [1, rgba(col, 0)]] : [[0, rgba(col, 1)], [0.25, rgba(col, 0.55)], [1, rgba(col, 0)]]); g.fillRect(0, 0, 64, 64); }
    SPR[key] = c; return c; }
  function cloudSpr(seed) { var key = 'cl' + seed; if (SPR[key] !== undefined) return SPR[key];
    var c = mk(256, 128); if (c) { var g = c.getContext('2d'), r = rng(seed);
      for (var i = 0; i < 26; i++) { var x = 40 + r() * 176, y = 46 + (r() - 0.5) * 40 * Math.sin((x - 40) / 176 * PI), rr = 10 + r() * 20; g.save(); g.translate(x, y); g.scale(1.7, 0.7);
        g.fillStyle = rg(g, 0, 0, 0, rr, [[0, 'rgba(255,255,255,0.42)'], [0.6, 'rgba(255,255,255,0.16)'], [1, 'rgba(255,255,255,0)']]); g.fillRect(-rr, -rr, rr * 2, rr * 2); g.restore(); } }
    SPR[key] = c; return c; }

  /* ============================== geography ============================== */
  /* Hand-traced coastlines north of about 10°N, as flat [lon, lat, lon, lat, ...] lists. Longitudes past 180 continue
     eastward (Chukotka is 190 rather than -170) so a coast never jumps across the date line. The painter adds a little
     fractal wobble to every coast so it reads as painted, not plotted. */
  var LAND = {
    na: [-168.1,65.6,-166.2,66.2,-163.8,66.6,-161.9,66.3,-163.7,67.2,-165.4,68.0,-166.8,68.4,-163.9,69.0,-161.6,70.3,-156.8,71.3,-152.0,70.9,-148.5,70.3,-143.3,70.1,-139.0,69.6,-135.0,69.5,-132.0,69.6,-129.0,70.0,-125.0,69.4,-120.5,69.4,-116.0,68.0,-114.5,67.8,-110.0,68.0,-106.5,68.4,-101.0,67.8,-98.0,67.9,-96.0,68.3,-95.0,69.5,-94.0,71.8,-91.8,70.0,-89.0,69.0,-86.0,68.4,-85.0,69.8,-82.0,69.2,-81.5,67.0,-84.0,66.0,-86.5,66.5,-88.0,64.2,-90.5,63.5,-93.5,62.0,-94.5,60.0,-94.2,58.7,-92.5,57.0,-90.0,57.0,-87.0,55.8,-85.0,55.3,-82.3,55.1,-82.2,53.0,-80.5,51.3,-79.0,51.6,-78.8,54.5,-76.8,56.5,-77.4,58.5,-78.2,60.5,-77.6,62.4,-73.5,62.4,-70.0,61.0,-69.6,59.0,-67.6,58.4,-65.0,60.4,-64.4,59.2,-62.5,57.5,-61.0,56.0,-60.0,55.0,-57.4,54.1,-56.0,52.5,-55.7,51.6,-57.2,51.3,-59.5,50.4,-63.0,50.3,-66.4,50.2,-68.0,49.2,-70.6,47.4,-71.2,46.8,-70.0,47.6,-67.5,48.9,-64.3,48.8,-64.8,47.4,-64.5,46.2,-61.0,45.6,-60.0,46.0,-61.5,45.1,-63.5,44.6,-65.8,43.6,-64.4,45.3,-66.0,45.2,-67.2,44.6,-68.5,44.3,-70.2,43.7,-70.8,42.6,-71.0,42.3,-70.5,41.8,-70.0,41.7,-70.0,42.0,-70.6,41.6,-71.4,41.4,-72.9,41.2,-74.0,40.6,-74.0,40.0,-74.4,39.4,-74.9,38.9,-75.1,38.6,-75.6,37.5,-75.9,37.1,-76.0,36.9,-75.5,35.2,-76.5,34.7,-77.9,33.9,-79.2,33.2,-80.9,32.0,-81.4,30.4,-80.6,28.4,-80.1,26.5,-80.4,25.2,-81.1,25.1,-81.8,26.2,-82.6,27.6,-82.8,29.0,-84.0,30.0,-85.4,29.7,-86.5,30.4,-88.0,30.4,-89.4,30.0,-89.3,29.0,-90.5,29.1,-92.0,29.6,-94.0,29.6,-95.0,29.2,-96.6,28.0,-97.4,26.8,-97.2,25.5,-97.7,24.0,-97.8,22.0,-97.2,20.6,-96.2,19.2,-94.8,18.5,-93.0,18.4,-91.5,18.5,-90.6,19.8,-90.4,21.0,-88.0,21.5,-87.0,21.5,-86.8,20.4,-87.5,19.0,-88.2,17.5,-88.4,16.0,-87.8,15.8,-86.0,16.0,-84.0,15.6,-83.2,15.0,-83.5,13.0,-83.7,11.0,-82.5,9.6,-81.5,8.8,-80.0,9.4,-79.0,9.5,-77.5,8.6,-77.0,6.0,-80.0,5.0,-80.4,7.4,-81.7,8.1,-83.0,8.3,-84.0,9.5,-85.8,10.0,-85.7,11.1,-87.2,12.7,-88.5,13.2,-90.8,13.9,-92.3,14.6,-94.0,16.0,-96.2,15.7,-98.5,16.4,-101.0,17.3,-103.5,18.3,-105.0,19.8,-105.6,20.9,-105.3,22.5,-106.5,23.5,-108.2,25.2,-109.3,26.4,-110.6,27.8,-112.2,29.0,-113.2,31.2,-114.7,31.7,-114.5,30.2,-113.2,28.8,-112.0,27.0,-111.0,25.8,-110.3,24.2,-109.5,23.2,-109.9,22.9,-110.5,23.5,-111.8,24.6,-112.4,26.0,-114.0,27.8,-114.8,28.6,-115.8,30.4,-116.8,31.9,-117.2,32.7,-118.3,33.7,-118.8,34.0,-120.6,34.5,-121.9,36.6,-122.4,37.2,-122.5,37.8,-123.0,38.0,-123.7,39.0,-124.4,40.4,-124.2,41.8,-124.5,42.8,-124.0,44.6,-123.9,46.2,-124.1,47.0,-124.7,48.4,-123.0,48.2,-123.2,49.1,-125.0,50.0,-127.0,50.8,-127.8,52.2,-130.0,54.3,-131.5,55.5,-133.0,57.0,-135.0,58.3,-136.5,58.3,-138.5,59.2,-141.0,60.0,-144.0,60.2,-146.5,60.9,-148.5,60.6,-150.0,59.6,-151.8,59.2,-150.2,61.2,-152.5,60.2,-153.5,59.2,-154.5,58.0,-156.5,57.0,-158.5,56.0,-161.0,55.2,-163.0,54.8,-164.8,54.4,-162.5,55.6,-160.0,56.6,-158.0,57.6,-157.0,58.7,-158.5,58.8,-160.5,58.7,-162.0,59.8,-163.8,60.0,-165.4,60.6,-165.0,61.6,-166.1,61.5,-164.6,63.0,-161.0,63.6,-160.8,64.4,-163.5,64.5,-165.4,64.5,-166.6,64.7],
    greenland: [-73.0,78.0,-66.0,80.0,-60.0,82.0,-50.0,82.6,-40.0,83.5,-30.0,83.5,-21.0,82.5,-12.0,81.5,-17.0,80.0,-19.0,78.0,-18.5,76.0,-20.0,74.5,-22.0,72.5,-24.0,71.5,-22.0,70.3,-25.0,68.8,-30.0,68.2,-34.0,66.0,-37.6,65.6,-40.0,64.5,-41.0,63.0,-42.5,61.5,-43.8,60.0,-46.0,60.7,-48.5,61.5,-50.5,63.5,-51.5,64.2,-53.0,66.0,-53.6,67.5,-51.0,68.5,-51.5,69.5,-52.0,70.8,-54.5,71.5,-55.5,72.6,-57.5,74.0,-58.5,75.5,-62.0,76.2,-66.0,76.0,-68.7,76.5],
    baffin: [-79.6,73.6,-76.0,72.8,-72.0,71.6,-68.5,70.5,-67.0,69.2,-66.0,67.5,-61.9,66.6,-64.0,65.3,-65.5,64.2,-64.7,63.0,-65.5,61.9,-67.5,62.4,-70.0,62.8,-71.5,63.5,-73.8,64.4,-76.5,64.3,-77.5,65.4,-73.0,67.0,-76.0,68.5,-79.5,69.8,-84.5,70.0,-89.0,71.0,-88.0,73.5,-84.0,73.5],
    ellesmere: [-90.0,76.6,-84.0,76.3,-78.0,76.2,-75.0,78.5,-70.0,79.5,-63.0,81.5,-62.0,82.5,-70.0,83.0,-80.0,83.0,-90.0,81.5,-95.0,80.0,-93.0,78.0],
    devon: [-92.0,74.6,-86.0,74.4,-80.0,74.6,-80.0,76.2,-88.0,76.6,-92.0,75.8],
    victoria: [-119.0,71.5,-117.0,73.2,-110.0,73.0,-104.5,72.5,-101.5,70.5,-104.5,69.0,-108.0,68.6,-114.0,68.8,-117.0,70.0],
    banks: [-125.5,72.0,-124.5,74.2,-120.0,74.3,-116.5,73.5,-118.0,71.5,-122.0,71.0],
    melville: [-117.0,75.5,-110.0,75.0,-106.0,75.8,-111.0,76.6,-116.0,76.4],
    southampton: [-86.5,64.8,-82.0,64.0,-80.5,63.5,-84.0,63.3,-87.0,64.0],
    newfoundland: [-59.4,47.6,-57.0,50.6,-55.6,51.6,-55.4,49.5,-53.5,49.5,-52.7,47.6,-53.0,46.7,-55.5,47.0,-56.5,47.6],
    vancouver: [-128.4,50.8,-125.2,50.4,-123.4,48.4,-124.7,48.6,-126.5,49.6,-128.0,50.3],
    cuba: [-84.9,21.9,-82.4,23.15,-80.0,23.1,-77.2,21.6,-75.6,21.1,-74.2,20.2,-75.5,19.9,-77.7,19.85,-77.0,20.6,-78.5,21.5,-80.5,21.8,-81.8,22.2,-83.4,22.2],
    hispaniola: [-74.4,18.5,-72.8,19.9,-70.0,19.8,-68.3,18.6,-70.0,18.2,-71.5,17.6,-73.0,18.0],
    jamaica: [-78.3,18.4,-76.2,18.0,-77.2,17.7], puertorico: [-67.2,18.5,-65.6,18.4,-66.0,18.0,-67.2,18.0],
    hawaii: [-155.9,19.0,-154.8,19.5,-155.8,20.2,-156.0,19.7],
    iceland: [-24.0,65.5,-22.5,66.4,-18.0,66.2,-15.0,66.5,-13.6,65.3,-14.8,64.3,-18.0,63.4,-20.5,63.7,-22.6,63.8,-21.7,64.5,-24.0,64.9],
    britain: [-5.7,50.0,1.5,51.2,1.7,52.7,0.0,53.5,-1.6,55.5,-2.0,57.0,-1.8,57.6,-3.2,58.6,-5.0,58.6,-6.2,57.4,-5.6,55.3,-4.8,54.8,-3.0,54.0,-3.0,53.4,-4.5,52.8,-4.2,51.6],
    ireland: [-10.0,51.6,-6.0,52.2,-6.0,54.0,-7.5,55.3,-10.0,54.2],
    eurasia: [-5.6,36.0,-6.3,36.8,-7.4,37.2,-8.9,37.0,-8.8,38.5,-9.5,38.8,-8.9,40.2,-8.7,41.9,-9.2,43.0,-8.0,43.7,-5.8,43.6,-3.8,43.5,-1.8,43.4,-1.4,44.6,-1.2,46.2,-2.2,47.2,-4.4,47.8,-4.7,48.4,-3.0,48.8,-1.6,48.7,-1.3,49.7,0.2,49.5,1.5,50.1,1.6,50.9,2.5,51.1,3.6,51.4,4.2,52.0,4.7,52.9,5.6,53.4,7.0,53.6,8.6,53.9,8.9,54.9,8.6,55.5,8.1,56.6,8.6,57.1,10.6,57.7,10.2,56.1,9.8,55.0,10.8,54.4,11.0,54.0,12.4,54.4,14.0,54.0,16.5,54.5,18.5,54.8,19.6,54.4,21.2,55.7,21.0,56.5,21.6,57.4,22.6,57.8,24.1,57.0,24.4,58.3,23.5,59.2,24.8,59.5,28.0,59.5,29.9,59.9,28.8,60.5,26.9,60.4,25.0,60.2,22.9,59.9,21.5,60.7,21.4,61.6,21.5,63.1,22.8,63.9,24.7,64.9,25.4,65.0,24.2,65.8,22.1,65.6,21.0,64.5,20.3,63.8,18.5,62.9,17.3,62.4,17.2,61.7,17.4,60.6,18.7,60.2,18.9,59.4,18.1,59.3,16.8,58.6,16.6,57.3,16.4,56.6,15.6,56.1,14.3,55.5,13.8,55.4,12.9,55.6,12.6,56.2,11.9,57.7,11.2,58.9,10.7,59.9,10.2,59.0,8.3,58.2,6.6,58.1,5.6,58.8,5.3,60.4,5.0,61.5,5.6,62.3,7.2,63.0,8.6,63.5,10.4,63.4,11.0,64.5,12.5,65.9,14.4,67.3,15.6,68.5,16.5,69.0,18.9,69.7,21.0,70.1,23.7,70.7,25.8,71.1,28.5,70.9,31.0,70.3,30.0,69.8,32.5,69.4,33.1,69.0,36.0,69.1,40.0,67.8,41.2,66.9,40.4,66.0,44.0,66.3,44.2,68.3,46.4,68.0,48.0,67.6,53.5,68.2,53.9,68.9,58.0,68.8,60.5,69.9,64.0,69.6,66.8,70.4,66.6,71.4,68.5,72.9,69.8,73.0,72.8,72.8,74.5,71.5,77.0,72.4,80.5,73.4,80.6,72.0,86.0,73.8,87.0,75.1,94.0,76.0,99.0,76.5,104.3,77.7,106.0,77.2,112.0,76.3,113.5,75.6,113.0,74.0,110.5,73.6,118.0,73.6,124.0,73.5,127.0,73.4,129.5,72.0,131.5,71.0,135.0,71.6,139.0,72.4,141.0,72.8,146.0,72.3,150.0,71.5,152.0,70.9,157.0,71.0,160.0,70.0,161.5,69.6,165.0,69.7,170.0,70.1,175.0,69.8,178.0,69.4,182.0,68.6,185.0,67.3,187.5,66.4,190.3,66.1,188.5,65.4,187.4,64.4,185.5,64.6,183.0,64.5,178.5,64.6,177.0,62.6,174.0,61.8,172.0,61.0,170.0,60.0,166.0,59.9,163.5,59.8,163.4,58.5,162.3,57.0,162.6,56.2,160.8,54.5,159.0,53.0,158.5,52.0,156.7,51.0,156.0,52.8,155.7,55.0,156.4,57.0,157.8,58.0,160.0,59.5,161.0,60.4,159.0,61.6,156.0,61.5,154.0,59.4,151.0,59.3,148.0,59.3,145.0,59.3,142.0,59.0,140.6,58.2,138.0,56.6,137.2,54.0,139.0,53.6,141.4,52.2,140.5,50.0,140.4,48.4,138.6,46.9,136.5,45.0,133.5,42.9,132.0,43.2,130.7,42.3,129.7,41.0,129.5,39.5,129.4,37.1,129.3,35.5,129.0,35.1,127.5,34.6,126.3,34.4,126.5,35.6,126.6,36.8,126.0,37.5,125.2,37.9,124.7,38.9,124.3,39.9,122.3,40.5,121.2,38.8,121.8,40.0,121.0,40.8,120.0,40.2,119.0,39.3,118.0,39.0,117.7,38.9,118.3,38.0,119.0,37.3,120.7,37.8,122.6,37.4,121.6,36.8,120.3,36.0,119.3,35.0,120.3,34.3,120.9,32.6,121.9,31.7,121.8,31.2,121.9,30.9,121.9,30.0,121.7,29.0,121.3,28.2,120.4,27.0,119.7,26.0,119.5,25.4,118.5,24.6,117.5,23.7,116.5,23.0,114.8,22.6,114.2,22.3,113.5,22.2,112.5,21.8,111.0,21.4,110.4,20.4,110.2,20.3,109.7,21.4,108.5,21.6,107.5,21.2,106.6,20.3,105.8,19.0,106.6,17.4,107.8,16.2,108.2,16.0,108.9,15.0,109.3,13.0,109.2,11.6,108.0,10.9,106.8,10.4,105.0,8.6,104.8,9.9,104.0,10.5,103.0,11.0,102.3,12.2,100.9,12.8,100.6,13.5,100.0,13.0,99.9,11.5,99.2,10.2,99.8,9.0,100.4,7.3,101.0,6.8,102.2,6.2,103.4,4.5,103.5,2.6,104.2,1.4,103.5,1.3,101.3,2.8,100.4,4.5,100.3,5.8,99.6,7.0,98.3,8.0,98.6,9.5,98.5,10.8,98.6,12.5,98.2,13.8,97.6,16.0,97.0,16.6,95.5,15.8,94.3,16.0,94.6,17.6,94.3,18.8,93.6,19.7,92.4,20.7,92.0,21.8,91.4,22.6,90.4,22.0,89.0,21.7,88.0,21.6,87.0,20.8,86.5,20.0,85.0,19.3,84.0,18.3,82.3,16.6,81.0,15.6,80.2,13.4,80.3,13.1,79.8,11.5,79.4,10.3,78.2,8.9,77.5,8.1,76.6,8.9,76.2,10.0,75.6,11.5,74.8,12.9,74.1,14.8,73.5,16.3,72.9,18.9,72.7,20.5,72.6,21.5,72.0,21.2,70.0,20.8,69.0,22.3,70.2,22.6,68.8,23.2,67.3,24.4,66.6,25.4,64.4,25.2,61.6,25.2,58.9,25.5,57.3,25.9,56.5,27.1,55.0,26.6,53.5,26.9,52.0,27.8,50.8,28.9,50.0,30.1,48.6,30.0,48.0,29.9,48.4,28.5,49.6,27.1,50.2,26.3,50.8,25.0,51.6,25.6,51.5,24.6,52.6,24.2,54.4,24.4,55.6,25.4,56.3,26.3,56.3,24.9,57.4,23.8,58.6,23.6,59.8,22.5,58.8,21.0,57.8,19.0,56.8,18.5,55.4,17.5,54.0,17.0,52.2,15.6,49.5,14.6,48.0,14.0,45.0,13.0,43.5,12.7,43.3,13.6,42.7,15.5,42.5,16.5,41.5,18.6,40.5,19.8,39.2,21.5,38.5,23.5,37.4,24.8,36.6,26.0,35.4,27.9,34.6,28.2,35.0,29.5,34.3,27.8,33.5,28.6,32.6,29.9,32.3,31.2,33.5,31.1,34.2,31.3,34.8,32.3,35.1,33.1,35.5,33.9,35.9,35.0,35.8,35.9,36.2,36.6,35.6,36.6,34.6,36.8,33.6,36.2,32.4,36.1,31.0,36.8,29.6,36.2,28.2,36.7,27.3,37.0,27.2,38.2,26.4,38.4,26.9,39.4,26.2,40.0,26.0,40.8,24.5,40.9,23.7,40.2,22.9,40.6,22.6,39.6,23.2,38.9,24.0,38.2,23.0,37.5,22.8,36.5,22.0,36.8,21.7,36.8,21.6,37.6,21.2,38.3,20.8,39.2,20.0,39.7,19.4,40.3,19.4,41.8,18.6,42.4,17.6,43.0,16.4,43.5,15.4,44.2,14.8,45.1,13.6,45.7,12.3,45.5,12.3,44.6,12.6,44.0,13.6,43.5,14.2,42.4,15.2,41.9,16.0,41.4,17.2,40.9,18.5,40.1,17.2,40.5,16.6,40.0,16.5,39.4,17.1,39.0,16.5,38.4,15.7,37.9,15.6,38.3,15.8,39.5,15.6,40.1,14.9,40.3,14.3,40.7,13.7,41.2,12.6,41.5,11.6,42.2,11.1,42.6,10.5,43.0,10.2,43.9,8.9,44.4,8.1,43.9,7.2,43.7,6.4,43.2,5.4,43.3,4.6,43.4,3.6,43.3,3.1,42.5,3.2,41.9,2.2,41.4,1.0,41.0,0.5,40.6,-0.3,39.5,0.2,38.8,-0.5,38.3,-0.8,37.6,-1.6,37.0,-2.2,36.7,-3.5,36.7,-4.4,36.7,-5.2,36.4],
    africa: [-5.9,35.8,-6.8,34.0,-8.5,33.3,-9.3,32.4,-9.8,30.4,-11.0,28.6,-12.9,27.9,-14.5,26.2,-16.0,24.0,-16.9,21.9,-17.1,20.8,-16.2,19.4,-16.5,17.5,-16.5,16.0,-17.4,14.7,-16.8,13.5,-16.7,12.4,-15.0,9.0,-10.0,4.0,10.0,0.0,40.0,-2.0,48.0,4.0,51.0,10.0,51.2,11.8,49.0,11.3,47.0,10.9,45.0,10.5,44.0,10.4,43.1,11.6,42.6,12.6,41.6,13.5,40.4,14.8,39.6,15.5,39.1,16.6,38.6,18.0,37.2,19.6,37.0,21.0,36.9,22.0,35.7,23.9,35.0,25.5,34.4,26.6,33.8,27.3,32.6,29.9,32.3,31.2,31.0,31.6,29.9,31.2,28.0,30.9,25.2,31.6,23.9,32.0,22.0,32.9,20.1,32.1,19.9,31.0,19.0,30.3,17.0,31.0,15.5,31.5,15.1,32.4,13.2,32.9,11.5,33.2,10.3,33.7,10.1,34.3,11.1,35.2,10.6,36.4,11.0,37.1,10.2,36.8,9.8,37.3,7.8,36.9,6.0,37.0,5.0,36.7,3.0,36.8,1.5,36.6,-0.6,35.7,-2.2,35.1,-3.5,35.2,-5.3,35.9],
    svalbard: [11.0,78.5,13.5,79.8,17.0,80.0,22.0,80.3,27.0,80.0,22.0,78.2,18.5,77.0,16.0,76.6,14.0,77.5],
    franzjosef: [47.0,80.8,60.0,81.5,64.0,80.5,55.0,80.0],
    novayazemlya: [52.5,71.5,55.5,73.5,59.5,75.5,66.0,76.8,69.0,77.0,66.5,76.0,61.0,74.5,57.5,72.5,56.5,70.6,53.5,70.8],
    severnaya: [93.0,79.0,98.0,81.0,104.0,79.5,100.0,78.3],
    newsiberia: [136.0,75.0,140.0,76.3,150.0,75.3,145.0,74.3],
    wrangel: [178.6,71.2,182.5,71.5,182.0,70.9,179.0,70.9],
    sakhalin: [141.8,46.0,143.0,47.5,143.4,49.2,143.0,51.0,143.3,53.0,142.5,54.3,141.8,52.8,142.1,51.0,141.9,49.0,142.0,47.6],
    hokkaido: [139.9,41.5,140.0,42.6,141.4,43.3,141.6,45.4,142.7,44.6,144.3,44.0,145.6,43.4,143.3,42.0,141.0,41.8],
    honshu: [141.4,41.5,141.9,39.6,141.0,38.3,140.9,37.0,140.6,35.7,139.8,35.0,138.8,34.6,137.0,34.6,136.8,34.3,135.8,33.5,135.1,34.4,133.9,34.4,132.5,34.2,131.0,33.9,131.0,34.5,132.5,35.4,134.0,35.5,135.8,35.6,136.8,36.9,137.4,36.9,138.6,37.8,139.6,38.8,140.0,40.0,140.3,41.0],
    kyushu: [129.7,33.4,130.4,33.9,131.6,33.6,131.9,32.5,131.4,31.4,130.6,31.0,130.2,31.6,129.8,32.6],
    shikoku: [132.5,33.5,133.0,34.2,134.6,34.2,134.7,33.8,134.1,33.2,133.0,32.8],
    taiwan: [120.1,23.0,120.7,22.0,121.5,22.7,121.9,24.5,121.5,25.3,120.7,24.6],
    hainan: [108.6,19.2,109.6,18.2,110.6,18.5,111.0,19.6,110.2,20.1,109.2,19.9],
    luzon: [120.0,16.0,120.6,18.5,122.2,18.5,122.4,17.0,121.6,15.6,122.0,14.0,124.0,13.0,123.0,13.6,121.0,13.8,120.6,14.4],
    sicily: [12.4,38.1,15.6,38.3,15.1,36.7,13.0,37.5], sardinia: [8.2,40.9,9.6,41.1,9.7,39.2,8.5,39.0,8.4,40.0],
    corsica: [8.6,42.9,9.4,43.0,9.5,42.0,9.2,41.4,8.6,41.9], crete: [23.5,35.3,26.3,35.3,25.0,34.9,23.6,35.2], cyprus: [32.3,35.0,34.6,35.6,33.9,34.9,32.5,34.7]
  };
  var LAKES = {
    black: [27.6,42.5,28.0,43.4,28.6,44.2,29.6,45.2,30.7,46.5,31.8,46.6,33.0,46.0,33.6,44.5,34.0,44.4,35.5,45.0,36.6,45.4,37.6,44.7,38.5,44.3,39.8,43.5,41.6,41.6,41.0,41.1,39.5,41.0,37.5,41.1,35.9,41.7,34.8,42.0,33.3,42.0,32.0,41.6,30.0,41.2,29.1,41.2,28.2,41.5,27.8,42.0],
    azov: [35.0,45.6,36.6,45.4,38.2,47.1,37.4,47.0,35.5,46.3],
    caspian: [46.8,44.6,47.8,45.6,49.2,46.4,51.2,47.1,53.0,46.8,53.2,45.6,51.4,45.0,51.2,44.5,52.8,42.6,52.6,41.5,53.0,40.3,53.9,39.3,53.9,37.4,51.6,36.8,50.0,37.4,49.0,38.4,49.4,40.3,49.8,40.6,48.6,41.8,47.6,42.9,47.4,43.9],
    superior: [-92.1,46.7,-89.6,48.0,-88.3,48.8,-86.6,48.7,-84.9,47.9,-84.6,46.5,-86.5,46.5,-88.3,47.4,-90.4,46.6],
    michigan: [-87.8,41.7,-86.6,41.9,-86.2,43.4,-86.4,44.6,-85.6,45.3,-84.8,45.8,-86.4,45.9,-87.7,45.4,-87.8,44.3,-87.6,43.0],
    huron: [-84.6,46.0,-82.5,45.4,-81.3,45.2,-80.3,44.9,-81.6,44.1,-82.5,43.0,-82.2,44.0,-83.5,44.0,-83.4,44.9,-84.6,45.7],
    erie: [-83.5,41.7,-81.7,41.5,-79.0,42.8,-80.5,42.6,-82.5,42.1], ontario: [-79.8,43.3,-78.0,43.4,-76.2,43.6,-76.4,44.2,-77.6,44.0,-79.4,43.7],
    winnipeg: [-99.0,50.6,-97.0,50.6,-97.5,53.5,-99.0,53.4], baikal: [104.0,51.6,106.5,52.6,108.5,53.7,109.5,55.6,109.0,55.8,107.2,53.2,105.0,52.0]
  };
  var RIDGES = [ // mountain chains [lon,lat,...], height 0..1
    [[-152,63.2,-149,63.4,-145,62.8],0.9], [[-136,60,-131,58,-127,56,-123,53,-119,50.5,-116,48.5,-113.5,46,-111,44,-108.5,41.5,-106.5,39,-105.8,36.5,-105.5,34],1], [[-121,40.5,-119.6,38,-118.4,36.2],0.7],
    [[-106,27,-104.5,24,-103.2,21.6,-101,19.5],0.6], [[-84.5,34.6,-82,36.4,-79.6,38.2,-77.4,40.2,-74.8,42,-72.4,44,-70,46],0.35],
    [[5.8,45.0,7.4,45.9,9.4,46.4,11.4,46.8,13.4,47.1,15.0,47.3],0.75], [[-1.6,43.0,0.8,42.7,3.0,42.4],0.5], [[18.0,49.3,21.0,49.2,23.6,48.3,25.4,47.4,25.8,45.8],0.45],
    [[38.5,43.6,41.5,43.1,44.5,42.6,47.5,41.6,49.2,40.8],0.8], [[6.5,60.2,8.5,61.8,10.5,63.2,13.0,65.2,15.5,67.2,18.0,68.6,20.5,69.4],0.45], [[59,51,59.2,54.5,59.4,58,59.8,61.5,60.8,64.5,64,67.4,66,68.8],0.4],
    [[45.5,35.2,47.5,33.6,50,31.5,52.6,29.6,55.6,27.6],0.55], [[71.5,35.8,74.4,35.2,76.8,33.9,79.2,32.2,81.6,30.4,84.2,28.7,86.9,27.9,89.6,27.6,92.4,27.7,95.0,28.6],1.25],
    [[67.5,34.8,70.0,35.6,72.2,36.6,74.0,38.4],0.85], [[70,40.8,73.5,41.3,77,41.8,80.5,42.4,84,43.1,88.5,43.5],0.8], [[76,36.6,80,35.9,84,35.6,89,35.8,94,35.6,98.5,34.8],0.75],
    [[86,50.2,88.5,49.3,91,48.4,94.5,47.2],0.55], [[126,68,128.5,66,131,63.8,134.5,62.2],0.45], [[140,67.3,144,66.3,148,65.6,152,64.6,156.5,63.4,160,62.2],0.45],
    [[158,52.6,159.2,54.5,160.2,56.4,161.0,58.4],0.6], [[-8.8,30.8,-6.2,31.9,-4.0,32.9,-1.2,33.9,2.5,35.0,6.0,35.7,8.8,36.2],0.55],
    [[138.4,35.6,138.6,36.6,139.4,38.2,140.4,39.8],0.45], [[99,26,101.5,29,102.5,31.5],0.7]
  ];
  var DESERTS = [ // [lon, lat, radius in degrees, strength]
    [-8,24,7,0.9],[0,25,8,1],[9,24,8,1],[18,23,8,1],[27,24,7,1],[33,22,4,0.8],[-12,21,5,0.8],[13,18,6,0.7],[25,17,5,0.6],[-3,18,6,0.7],
    [45,23,6,1],[50,20,5,0.9],[40,27,5,0.8],[55,22,4,0.8],[71,27,4,0.7],[57,31,5,0.7],[62,33,4,0.6],[60,39,5,0.7],[64,42,4,0.6],[83,39,5,0.9],
    [98,42,5,0.75],[106,43,6,0.75],[-114,34,4,0.8],[-111.5,32,3.5,0.8],[-105,29,4,0.6],[-117,40,4,0.45],[-108,40,3,0.3],[52,44,4,0.4],[88,34,7,0.35],[-101,37,4,0.25]
  ];
  var RIVERS = [
    [-91.2,47.2,-91.0,44.6,-90.5,42.2,-90.9,40.0,-90.2,38.6,-89.2,37.0,-89.7,35.0,-91.0,33.0,-91.4,31.0,-90.0,29.2],
    [-76.5,44.2,-74.5,45.4,-72.4,46.4,-71.2,46.8,-69.5,48.0], [8.2,48.0,11.0,48.6,13.8,48.3,16.37,48.2,17.4,48.0,19.0,47.5,18.9,45.9,20.5,44.8,22.5,44.3,25.0,43.7,28.0,44.2,29.6,45.2],
    [121.8,31.3,118.8,32.0,116.2,30.0,114.3,30.6,112.0,30.3,108.5,30.5,104.6,29.0,100.0,27.0], [119.0,37.8,116.5,37.0,114.3,35.0,111.0,34.6,110.4,36.5,111.3,39.5,108.0,40.6,106.0,38.0,103.0,36.0],
    [31.2,31.5,31.0,30.0,31.2,27.0,32.8,24.5,32.5,21.8,31.0,20.5,32.5,15.6], [-117.0,47.0,-119.3,46.2,-121.0,45.6,-123.9,46.2]
  ];

  /* ============================== the projection ============================== */
  var LON0 = -90, EDGE = 78; // longitude at the bottom of the globe; colatitude at the globe's rim (12°N)
  function layout(w, h) {
    var L = {}, port = h > w * 1.1, R;
    if (port) {
      R = Math.min(w * 0.47, h * 0.29); L.R = R; L.cx = w * 0.5; L.cy = Math.max(h * 0.51, R + h * 0.24);
      L.moon = { x: w * 0.79, y: h * 0.145, r: Math.min(w * 0.075, h * 0.036) }; L.mars = { x: w * 0.2, y: h * 0.17, r: Math.min(w * 0.075, h * 0.036) * 0.52 };
    } else {
      R = Math.min(h * 0.41, w * 0.3); L.R = R; L.cx = Math.max(R + w * 0.04, w * 0.42); L.cy = h * 0.53;
      L.moon = { x: w * 0.83, y: h * 0.22, r: h * 0.068 }; L.mars = { x: w * 0.935, y: h * 0.47, r: h * 0.031 };
    }
    L.port = port; return L;
  }
  function project(lat, lon, L) { var r = (90 - lat) / EDGE * L.R, t = (lon - LON0) * DEG; return { x: L.cx + r * Math.sin(t), y: L.cy + r * Math.cos(t) }; }
  function unproject(x, y, L) { var dx = x - L.cx, dy = y - L.cy, r = Math.sqrt(dx * dx + dy * dy); return { lat: 90 - r / L.R * EDGE, lon: LON0 + Math.atan2(dx, dy) / DEG }; }
  window.WMAP = { layout: layout, project: project, unproject: unproject, key: function (ch) { return 'world' + Math.max(0, Math.min(11, ch | 0)); } };

  // a coast with a painted wobble: subdivide every edge and nudge points along the normal with smooth noise
  function coastPts(arr, L, seed, wob) {
    var out = [], n = arr.length / 2, i, j;
    for (i = 0; i < n; i++) {
      var lo0 = arr[i * 2], la0 = arr[i * 2 + 1], lo1 = arr[((i + 1) % n) * 2], la1 = arr[((i + 1) % n) * 2 + 1];
      var dlo = (lo1 - lo0) * Math.cos(((la0 + la1) / 2) * DEG), dla = la1 - la0, len = Math.sqrt(dlo * dlo + dla * dla), steps = Math.max(1, Math.round(len / 0.7));
      for (j = 0; j < steps; j++) {
        var t = j / steps, lo = lerp(lo0, lo1, t), la = lerp(la0, la1, t);
        if (j > 0 && wob) { var nx = -dla / (len || 1), ny = dlo / (len || 1), k = (fbm2(lo * 0.45, la * 0.45, seed, 3) - 0.5) * wob * Math.min(1, len / 1.5); lo += nx * k / Math.max(0.2, Math.cos(la * DEG)); la += ny * k; }
        out.push(project(la, lo, L));
      }
    }
    return out;
  }
  function pathFrom(pts) { var p = new Path2D(), i, n = pts.length; if (!n) return p;
    p.moveTo((pts[n - 1].x + pts[0].x) / 2, (pts[n - 1].y + pts[0].y) / 2);
    for (i = 0; i < n; i++) { var a = pts[i], b = pts[(i + 1) % n]; p.quadraticCurveTo(a.x, a.y, (a.x + b.x) / 2, (a.y + b.y) / 2); }
    p.closePath(); return p; }
  var geo = memo(function (w, h) {
    var L = layout(w, h), land = new Path2D(), lakes = new Path2D(), k, parts = {};
    for (k in LAND) { var p = pathFrom(coastPts(LAND[k], L, 900 + k.length * 7, k === 'eurasia' || k === 'na' || k === 'africa' ? 0.9 : 0.45)); parts[k] = p; land.addPath(p); }
    for (k in LAKES) lakes.addPath(pathFrom(coastPts(LAKES[k], L, 700 + k.length, 0.25)));
    return { L: L, land: land, lakes: lakes, parts: parts };
  });

  /* ============================== seasons and years ============================== */
  //   snow: latitude of the snow line on land; ice: edge of the Arctic sea ice
  var SEASON = [
    { name: 'spring', snow: 56, ice: 70, tint: '#a8e070', tintA: 0.14, sky: '#2a2f78' },
    { name: 'summer', snow: 71, ice: 78, tint: '#5fbf5a', tintA: 0.1, sky: '#24306e' },
    { name: 'fall', snow: 63, ice: 75, tint: '#e8902c', tintA: 0.2, sky: '#2c2a6a' },
    { name: 'winter', snow: 45, ice: 64, tint: '#cfe4ff', tintA: 0.16, sky: '#1f2a66' }
  ];
  // land color by latitude (the polar map makes climate zones into rings) for a season
  function zoneCols(si) {
    return si === 0 ? ['#c9b98a', '#6f8f5c', '#3d7a4e', '#5fa356', '#86b75c', '#b7b46a'] :
      si === 1 ? ['#a8a878', '#57864e', '#2f6e44', '#4f9a4a', '#7eae54', '#b3ae62'] :
      si === 2 ? ['#b39a6e', '#7a7a46', '#8a7a3a', '#b98a3a', '#a8a050', '#bdb066'] :
      ['#d8dde6', '#6d7f66', '#41664a', '#6d955c', '#8fae66', '#bfb56c'];
  }
  function desertAt(lat, lon) { var v = 0; for (var i = 0; i < DESERTS.length; i++) { var D = DESERTS[i], dx = (lon - D[0]) * Math.cos(lat * DEG), dy = lat - D[1], d2 = (dx * dx + dy * dy) / (D[2] * D[2]); if (d2 < 2.5) v = Math.max(v, D[3] * Math.exp(-d2 * 1.1)); } return v; }

  /* ============================== the painting ============================== */
  function paintWorld(ctx, w, h, ch) {
    var G = geo(w, h), L = G.L, R = L.R, cx = L.cx, cy = L.cy, si = ch % 4, yr = (ch / 4) | 0, SE = SEASON[si], r = rng(5100 + ch), u = R / 183, i;
    /* ---------- space ---------- */
    ctx.fillStyle = lg(ctx, 0, 0, w * 0.3, h, [[0, '#070a22'], [0.45, '#0d1440'], [1, '#141a4c']]); ctx.fillRect(0, 0, w, h);
    softGlow(ctx, w * 0.05, h * 0.02, Math.max(w, h) * 0.55, '#ffcf8a', 0.16);
    softGlow(ctx, w * 0.95, h * 0.95, Math.max(w, h) * 0.5, '#3ad6c8', 0.08);
    softGlow(ctx, w * 0.15, h * 0.85, Math.max(w, h) * 0.45, '#8a5ad8', 0.12);
    softGlow(ctx, w * 0.85, h * 0.12, Math.max(w, h) * 0.35, '#6a6ad8', 0.12);
    ctx.save(); ctx.translate(w * 0.5, h * 0.5); ctx.rotate(-0.7); ctx.scale(1, 0.16); softGlow(ctx, 0, 0, Math.max(w, h) * 0.8, '#7a7ae0', 0.12); ctx.restore();
    dots(ctx, Math.round(900 * Math.max(1, w * h / 600000)), [['#ffffff', 0.85], ['#cfd8ff', 0.6], ['#ffe8c8', 0.55], ['#b8c4ff', 0.4]], function () { return [r() * w, r() * h, (0.35 + Math.pow(r(), 6) * 1.6) * Math.max(1, u * 0.9), (r() * 4) | 0]; });
    var sp = glowSpr('#dfe6ff', true); if (sp) { for (i = 0; i < 22; i++) { var gs = (4 + r() * 9) * u; ctx.globalAlpha = 0.6 + r() * 0.4; ctx.drawImage(sp, r() * w - gs, r() * h - gs, gs * 2, gs * 2); } ctx.globalAlpha = 1; }
    /* ---------- the atmosphere halo ---------- */
    ctx.fillStyle = rg(ctx, cx, cy, R * 0.94, R * 1.2, [[0, 'rgba(120,220,255,0.55)'], [0.18, 'rgba(90,190,255,0.32)'], [0.5, 'rgba(70,120,255,0.1)'], [1, 'rgba(60,80,220,0)']]);
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.2, 0, TAU); ctx.fill();
    /* ---------- the ocean ---------- */
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip();
    ctx.fillStyle = rg(ctx, cx, cy, 0, R, [[0, '#2b7fae'], [0.45, '#1f6ea4'], [0.8, '#175a92'], [1, '#124781']]); ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
    dabs(ctx, 900, [['#2a86b8', 0.25], ['#123f74', 0.22], ['#3a9cc4', 0.16]], function () { var a = r() * TAU, d = Math.sqrt(r()) * R, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d, n = fbm2(x / R * 3, y / R * 3, 31, 3); return [x, y, (10 + r() * 22) * u, (4 + r() * 8) * u, n > 0.55 ? 0 : n < 0.42 ? 1 : 2, a + PI / 2]; });
    // waves: short strokes along the latitude circles
    batch(ctx, 1600, [['#7fd0f0', 0.9 * u, 0.12], ['#0d3a6a', 1.0 * u, 0.14]], function () { var a = r() * TAU, d = Math.sqrt(r()) * R, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d, l = (3 + r() * 9) * u, ta = a + PI / 2; return [x, y, x + Math.cos(ta) * l, y + Math.sin(ta) * l, r() < 0.5 ? 0 : 1, x + Math.cos(ta) * l * 0.5 + Math.cos(a) * l * 0.12, y + Math.sin(ta) * l * 0.5 + Math.sin(a) * l * 0.12]; });
    // sea ice around the pole
    var iceR = (90 - SE.ice) / EDGE * R;
    ctx.fillStyle = rg(ctx, cx, cy, iceR * 0.55, iceR * 1.08, [[0, 'rgba(236,246,255,0.95)'], [0.7, 'rgba(214,234,250,0.82)'], [1, 'rgba(200,226,248,0)']]); ctx.beginPath(); ctx.arc(cx, cy, iceR * 1.1, 0, TAU); ctx.fill();
    dabs(ctx, 260, [['#ffffff', 0.55], ['#cfe6f8', 0.5], ['#a8cfee', 0.35]], function () { var a = r() * TAU, d = iceR * (0.75 + r() * 0.4) * (0.9 + 0.2 * Math.sin(a * 5 + 1.3)), x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d; return [x, y, (5 + r() * 12) * u, (2 + r() * 4) * u, (r() * 3) | 0, a + PI / 2 + (r() - 0.5)]; });
    batch(ctx, 140, [['#8ab8de', 0.7 * u, 0.35]], function () { var a = r() * TAU, d = r() * iceR * 0.9, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d, l = (4 + r() * 10) * u, b = r() * TAU; return [x, y, x + Math.cos(b) * l, y + Math.sin(b) * l, 0]; });
    // sun glint on the open ocean (light from the upper left)
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(cx - R * 0.5, cy - R * 0.44); ctx.rotate(-0.5); ctx.scale(1, 0.62); softGlow(ctx, 0, 0, R * 0.42, '#bfe8ff', 0.2); ctx.restore();
    /* ---------- shallow water around every coast ---------- */
    ctx.save(); ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(120,214,226,0.22)'; ctx.lineWidth = 9 * u; ctx.stroke(G.land);
    ctx.strokeStyle = 'rgba(150,232,232,0.35)'; ctx.lineWidth = 4.2 * u; ctx.stroke(G.land);
    ctx.restore();
    /* ---------- the land ---------- */
    ctx.save(); ctx.clip(G.land);
    var Z = zoneCols(si), rr = function (lat) { return (90 - lat) / EDGE * R; };
    ctx.fillStyle = rg(ctx, cx, cy, 0, R, [[0, Z[0]], [rr(72) / R, Z[0]], [rr(64) / R, Z[1]], [rr(57) / R, Z[2]], [rr(47) / R, Z[3]], [rr(37) / R, Z[4]], [rr(25) / R, Z[5]], [1, Z[5]]]);
    ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
    // deserts and dry plains
    for (i = 0; i < DESERTS.length; i++) { var D = DESERTS[i], pc = project(D[1], D[0], L), dr = D[2] / EDGE * R * 1.35;
      ctx.fillStyle = rg(ctx, pc.x, pc.y, 0, dr, [[0, rgba('#e2bf7c', 0.85 * D[3])], [0.55, rgba('#d8b070', 0.55 * D[3])], [1, rgba('#d8b070', 0)]]); ctx.fillRect(pc.x - dr, pc.y - dr, dr * 2, dr * 2); }
    // brush texture: dabs colored by the zone underneath, plus grassy flicks
    var cols = [[Z[1], 0.5], [Z[2], 0.45], [Z[3], 0.45], [Z[4], 0.4], ['#e8c98a', 0.45], [mix(Z[2], '#0e2a1a', 0.35), 0.35], [mix(Z[3], '#ffffff', 0.25), 0.3]];
    dabs(ctx, 4200, cols, function () { var a = r() * TAU, d = Math.sqrt(r()) * R, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d, g = unproject(x, y, L), lat = g.lat + (r() - 0.5) * 6;
      var b = desertAt(g.lat, g.lon) > 0.45 + r() * 0.3 ? 4 : lat > 64 ? 0 : lat > 55 ? (r() < 0.5 ? 1 : 5) : lat > 42 ? (r() < 0.6 ? 2 : r() < 0.5 ? 5 : 6) : lat > 30 ? (r() < 0.5 ? 3 : 6) : 3;
      return [x, y, (3 + r() * 7) * u, (1.5 + r() * 3) * u, b, a + PI / 2 + (r() - 0.5) * 0.8]; });
    batch(ctx, 2200, [['#1f4a2c', 0.8 * u, 0.22], ['#d8e8a0', 0.7 * u, 0.18]], function () { var a = r() * TAU, d = Math.sqrt(r()) * R, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d, l = (2 + r() * 4) * u, b = r() * TAU; return [x, y, x + Math.cos(b) * l, y + Math.sin(b) * l, r() < 0.6 ? 0 : 1]; });
    // the season: blossoms, lush greens, autumn leaves or fresh snow
    if (si === 0) dots(ctx, 520, [['#ffb3c8', 0.55], ['#ffffff', 0.45]], function () { var a = r() * TAU, d = R * (0.5 + r() * 0.3), x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d; return [x, y, (0.8 + r() * 1.3) * u, r() < 0.7 ? 0 : 1]; });
    if (si === 2) dabs(ctx, 1500, [['#e86a2c', 0.4], ['#f2a33a', 0.4], ['#c8402a', 0.3], ['#ffd25a', 0.3]], function () { var a = r() * TAU, d = R * (0.36 + r() * 0.3), x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d; return [x, y, (2 + r() * 4) * u, (1.2 + r() * 2.2) * u, (r() * 4) | 0, r() * PI]; });
    ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = rgba(SE.tint, SE.tintA * 2); ctx.fillRect(cx - R, cy - R, R * 2, R * 2); ctx.globalCompositeOperation = 'source-over';
    // snow: everything poleward of the season's snow line, with a ragged edge
    var sr = rr(SE.snow);
    ctx.fillStyle = rg(ctx, cx, cy, 0, sr * 1.08, [[0, 'rgba(248,252,255,0.96)'], [0.82, 'rgba(240,248,255,0.9)'], [0.93, 'rgba(232,242,252,0.5)'], [1, 'rgba(232,242,252,0)']]); ctx.beginPath(); ctx.arc(cx, cy, sr * 1.08, 0, TAU); ctx.fill();
    dabs(ctx, 700, [['#ffffff', 0.7], ['#dfeaf6', 0.6], ['#b8cce2', 0.35]], function () { var a = r() * TAU, n = fbm2(Math.cos(a) * 3, Math.sin(a) * 3, 77 + si, 3), d = sr * (0.92 + n * 0.32), x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d; return [x, y, (3 + r() * 7) * u, (1.5 + r() * 3) * u, (r() * 3) | 0, a + PI / 2]; });
    // mountains: light faces toward the sun, shade away, snowy peaks
    for (i = 0; i < RIDGES.length; i++) {
      var RD = RIDGES[i][0], hgt = RIDGES[i][1], rs = rng(6100 + i), n2 = RD.length / 2, k;
      for (k = 0; k < n2 - 1; k++) { var steps = 7, q;
        for (q = 0; q < steps; q++) { var t2 = (q + rs()) / steps, lo = lerp(RD[k * 2], RD[k * 2 + 2], t2) + (rs() - 0.5) * 1.6, la = lerp(RD[k * 2 + 1], RD[k * 2 + 3], t2) + (rs() - 0.5) * 1.6, pp = project(la, lo, L);
          var ph = (4.5 + rs() * 4) * u * hgt, pw = ph * (0.85 + rs() * 0.5);
          ctx.fillStyle = rgba('#5a4a3a', 0.55); ctx.beginPath(); ctx.moveTo(pp.x - pw, pp.y + ph * 0.25); ctx.lineTo(pp.x, pp.y - ph); ctx.lineTo(pp.x + pw * 0.9, pp.y + ph * 0.25); ctx.fill();
          ctx.fillStyle = rgba('#efe2c4', 0.5); ctx.beginPath(); ctx.moveTo(pp.x - pw, pp.y + ph * 0.25); ctx.lineTo(pp.x, pp.y - ph); ctx.lineTo(pp.x - pw * 0.1, pp.y + ph * 0.25); ctx.fill();
          var snowy = hgt > 0.9 || la > SE.snow - 14 + hgt * 6;
          if (snowy) { ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.beginPath(); ctx.moveTo(pp.x - pw * 0.34, pp.y - ph * 0.42); ctx.lineTo(pp.x, pp.y - ph); ctx.lineTo(pp.x + pw * 0.3, pp.y - ph * 0.45); ctx.lineTo(pp.x + pw * 0.05, pp.y - ph * 0.55); ctx.closePath(); ctx.fill(); }
        } } }
    // rivers
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (i = 0; i < RIVERS.length; i++) { var RV = RIVERS[i], pr = new Path2D(); for (var j = 0; j < RV.length / 2; j++) { var pq = project(RV[j * 2 + 1], RV[j * 2], L); if (!j) pr.moveTo(pq.x, pq.y); else pr.lineTo(pq.x, pq.y); }
      ctx.strokeStyle = rgba('#2a7ab0', 0.55); ctx.lineWidth = 1.1 * u; ctx.stroke(pr); ctx.strokeStyle = rgba('#8ad0f0', 0.35); ctx.lineWidth = 0.5 * u; ctx.stroke(pr); }
    // Greenland's ice sheet, always white
    ctx.save(); ctx.clip(G.parts.greenland); var gp = project(72, -41, L); ctx.fillStyle = rg(ctx, gp.x, gp.y, 0, R * 0.2, [[0, '#ffffff'], [0.7, '#eef6ff'], [1, '#cfe2f4']]); ctx.fillRect(cx - R, cy - R, R * 2, R * 2); ctx.restore();
    // the Phoenix Special Economic Zone: rows of solar fields and robot factories that grow each year
    var pz = project(33.2, -112.6, L), zr = rng(830); ctx.save(); ctx.translate(pz.x, pz.y); ctx.rotate((-112.6 - LON0) * -DEG);
    for (i = 0; i < 5 + yr * 4; i++) { var zx = ((i % 4) - 1.5) * 2.6 * u + (zr() - 0.5) * u, zy = (((i / 4) | 0) - 0.5) * 2.4 * u; ctx.fillStyle = i % 3 ? '#9fb8d8' : '#d8e4f2'; ctx.fillRect(zx - 1.1 * u, zy - 0.8 * u, 2.2 * u, 1.6 * u); }
    ctx.restore(); ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, pz.x, pz.y, 7 * u, '#bfe6ff', 0.25 + yr * 0.08); ctx.restore();
    ctx.restore(); // end land clip
    // lakes and inland seas on top of the land
    ctx.fillStyle = '#1e70a4'; ctx.fill(G.lakes); ctx.strokeStyle = 'rgba(150,232,232,0.35)'; ctx.lineWidth = 1.2 * u; ctx.stroke(G.lakes);
    if (si === 3) { ctx.save(); ctx.clip(G.lakes); ctx.fillStyle = rg(ctx, cx, cy, 0, rr(46), [[0, 'rgba(235,245,255,0.9)'], [0.9, 'rgba(235,245,255,0.75)'], [1, 'rgba(235,245,255,0)']]); ctx.fillRect(cx - R, cy - R, R * 2, R * 2); ctx.restore(); }
    // coastline ink
    ctx.save(); ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(20,52,58,0.55)'; ctx.lineWidth = 1.1 * u; ctx.stroke(G.land); ctx.strokeStyle = 'rgba(255,250,220,0.18)'; ctx.lineWidth = 0.5 * u; ctx.translate(-0.5 * u, -0.6 * u); ctx.stroke(G.land); ctx.restore();
    // graticule: faint latitude rings and meridians, like a navigator's map
    ctx.save(); ctx.strokeStyle = 'rgba(220,240,255,0.1)'; ctx.lineWidth = 0.8 * u; ctx.setLineDash([3 * u, 4 * u]);
    [30, 45, 60, 75].forEach(function (lat) { ctx.beginPath(); ctx.arc(cx, cy, rr(lat), 0, TAU); ctx.stroke(); });
    for (i = 0; i < 12; i++) { var ta = (i * 30) * DEG; ctx.beginPath(); ctx.moveTo(cx + Math.sin(ta) * rr(80), cy + Math.cos(ta) * rr(80)); ctx.lineTo(cx + Math.sin(ta) * R, cy + Math.cos(ta) * R); ctx.stroke(); }
    ctx.restore();
    // clouds: soft bands and two storms far out at sea
    var cs = cloudSpr(17), cs2 = cloudSpr(29);
    if (cs) { var CL = [[-40, 40, 1.1, 0.7], [-150, 42, 1.3, 0.75], [160, 32, 1.0, 0.6], [-60, 58, 0.9, 0.55], [80, 58, 1.2, 0.45], [20, 62, 1.0, 0.45], [-130, 25, 0.9, 0.5], [130, 50, 0.8, 0.4]];
      for (i = 0; i < CL.length; i++) { var cp = project(CL[i][1], CL[i][0], L), cw = R * 0.42 * CL[i][2]; ctx.save(); ctx.translate(cp.x, cp.y); ctx.rotate(Math.atan2(cp.y - cy, cp.x - cx) + PI / 2); ctx.globalAlpha = CL[i][3]; ctx.drawImage(i % 2 ? cs2 : cs, -cw / 2, -cw / 4, cw, cw / 2); ctx.restore(); } }
    [[-45, 33], [168, 26]].forEach(function (S2, k) { var sp2 = project(S2[1], S2[0], L), sr2 = R * 0.075; ctx.save(); ctx.translate(sp2.x, sp2.y); ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineCap = 'round';
      for (var a2 = 0; a2 < 3; a2++) { ctx.lineWidth = (2.6 - a2 * 0.6) * u; ctx.beginPath(); for (var q2 = 0; q2 <= 30; q2++) { var tt = q2 / 30, ang = a2 * TAU / 3 + tt * 4.2 * (k ? -1 : 1), rad = sr2 * (0.15 + tt); var xx = Math.cos(ang) * rad, yy = Math.sin(ang) * rad * 0.9; if (!q2) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy); } ctx.stroke(); }
      puff(ctx, 0, 0, sr2 * 0.5, '#ffffff', 0.5); ctx.restore(); });
    // the globe is a sphere: light from the upper left, darker limb, a thin bright rim
    ctx.fillStyle = rg(ctx, cx - R * 0.38, cy - R * 0.42, R * 0.05, R * 1.5, [[0, 'rgba(255,248,230,0.16)'], [0.45, 'rgba(255,248,230,0)'], [0.75, 'rgba(8,18,60,0.14)'], [1, 'rgba(6,12,48,0.5)']]); ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
    ctx.fillStyle = rg(ctx, cx, cy, R * 0.86, R, [[0, 'rgba(110,200,255,0)'], [0.75, 'rgba(110,200,255,0.18)'], [1, 'rgba(160,230,255,0.42)']]); ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
    ctx.restore(); // end globe clip
    ctx.strokeStyle = 'rgba(190,240,255,0.55)'; ctx.lineWidth = 1.4 * u; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
    /* ---------- the Moon, with its south-pole base glowing at the bottom ---------- */
    paintMoon(ctx, L.moon, yr, u, r);
    paintMars(ctx, L.mars, yr, u, r);
    finish(ctx, w, h, '#4a3a90', 0.1, 0.32, 0.045, '#05060f', 0.5);
  }
  function paintMoon(ctx, M, yr, u, r) {
    var x = M.x, y = M.y, mr = M.r, i;
    softGlow(ctx, x, y, mr * 3.4, '#9aa8ff', 0.16); softGlow(ctx, x, y, mr * 1.6, '#f0ecff', 0.18);
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, mr, 0, TAU); ctx.clip();
    ctx.fillStyle = rg(ctx, x - mr * 0.35, y - mr * 0.35, mr * 0.1, mr * 1.25, [[0, '#fbf6ea'], [0.55, '#e4ddcc'], [1, '#a8a294']]); ctx.fillRect(x - mr, y - mr, mr * 2, mr * 2);
    var mar = [[-0.3, -0.25, 0.32], [0.1, -0.35, 0.22], [0.25, 0.05, 0.25], [-0.1, 0.2, 0.2], [-0.45, 0.15, 0.16]];
    for (i = 0; i < mar.length; i++) puff(ctx, x + mar[i][0] * mr, y + mar[i][1] * mr, mar[i][2] * mr * 1.4, '#9a958a', 0.55);
    dabs(ctx, 24, [['#c2bcae', 0.6], ['#f8f2e4', 0.55]], function (k) { var a = r() * TAU, d = Math.sqrt(r()) * mr * 0.85; return [x + Math.cos(a) * d, y + Math.sin(a) * d, mr * (0.05 + r() * 0.08), mr * (0.05 + r() * 0.07), k % 2, 0]; });
    ctx.fillStyle = lg(ctx, x - mr, y, x + mr, y, [[0, 'rgba(10,12,40,0)'], [0.62, 'rgba(10,12,40,0)'], [1, 'rgba(10,12,40,0.55)']]); ctx.fillRect(x - mr, y - mr, mr * 2, mr * 2);
    ctx.restore();
    // the base at the south pole: a few warm lights in 2040, a lit settlement by 2042
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    var bx = x - mr * 0.1, by = y + mr * 0.9, nL = 3 + yr * 3;
    glow(ctx, bx, by, mr * (0.35 + yr * 0.1), '#ffcf7a', 0.35 + yr * 0.12);
    for (i = 0; i < nL; i++) { var a = PI * (0.38 + (i / Math.max(1, nL - 1)) * 0.24), lx = x + Math.cos(a) * mr * 0.93, ly = y + Math.sin(a) * mr * 0.93; glow(ctx, lx, ly, (2 + (i % 2)) * u, i % 3 ? '#ffe2a0' : '#9ff0ff', 0.9); }
    ctx.restore();
  }
  function paintMars(ctx, M, yr, u, r) {
    var x = M.x, y = M.y, mr = M.r;
    softGlow(ctx, x, y, mr * 3, '#ff8a5a', 0.14);
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, mr, 0, TAU); ctx.clip();
    ctx.fillStyle = rg(ctx, x - mr * 0.35, y - mr * 0.35, mr * 0.1, mr * 1.2, [[0, '#f0a26a'], [0.5, '#d2663a'], [1, '#7a2e1c']]); ctx.fillRect(x - mr, y - mr, mr * 2, mr * 2);
    puff(ctx, x + mr * 0.15, y + mr * 0.05, mr * 0.45, '#7a3420', 0.55); puff(ctx, x - mr * 0.35, y + mr * 0.3, mr * 0.3, '#8a3c24', 0.45);
    ctx.fillStyle = 'rgba(255,250,245,0.9)'; ctx.beginPath(); ctx.ellipse(x, y - mr * 0.88, mr * 0.42, mr * 0.2, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = lg(ctx, x - mr, y, x + mr, y, [[0, 'rgba(20,6,10,0)'], [0.6, 'rgba(20,6,10,0)'], [1, 'rgba(20,6,10,0.5)']]); ctx.fillRect(x - mr, y - mr, mr * 2, mr * 2);
    ctx.restore();
    if (yr >= 1) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, x + mr * 0.25, y - mr * 0.1, (2.5 + yr) * u, '#9ff0ff', 0.9); ctx.restore(); }
  }

  /* ============================== calm motion ============================== */
  function overlayWorld(ctx, w, h, t, ch) {
    var G = geo(w, h), L = G.L, R = L.R, cx = L.cx, cy = L.cy, u = R / 183, i, sp = glowSpr('#ffffff', true);
    ctx.save();
    // twinkling stars (skip the globe)
    if (sp) for (i = 0; i < 26; i++) { var sx = hash(i, 11) * w, sy = hash(i, 12) * h; if ((sx - cx) * (sx - cx) + (sy - cy) * (sy - cy) < R * R * 1.2) continue;
      var tw = Math.pow(Math.max(0, Math.sin(t * (0.6 + hash(i, 13) * 1.4) + i * 2.3)), 4); if (tw < 0.05) continue; var ss = (3 + hash(i, 14) * 5) * u * tw; ctx.globalAlpha = tw; ctx.drawImage(sp, sx - ss, sy - ss, ss * 2, ss * 2); }
    // clouds drifting eastward (counterclockwise around the pole)
    var cs = cloudSpr(41);
    if (cs) { ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip();
      for (i = 0; i < 3; i++) { var lat = 38 + i * 9, ang = (t * (0.6 + i * 0.25) + i * 120) * DEG, rad = (90 - lat) / EDGE * R, px = cx + Math.sin(-ang + i) * rad, py = cy + Math.cos(-ang + i) * rad, cw = R * 0.5;
        ctx.save(); ctx.translate(px, py); ctx.rotate(Math.atan2(py - cy, px - cx) + PI / 2); ctx.globalAlpha = 0.28; ctx.drawImage(cs, -cw / 2, -cw / 4, cw, cw / 2); ctx.restore(); }
      ctx.restore(); }
    // glints on the sunlit ocean
    for (i = 0; i < 10; i++) { var gx = cx - R * 0.5 + (hash(i, 31) - 0.5) * R * 0.5, gy = cy - R * 0.44 + (hash(i, 32) - 0.5) * R * 0.32, ga = Math.pow(Math.max(0, Math.sin(t * (1.1 + hash(i, 33)) + i * 2)), 6);
      if (ga > 0.05 && sp) { ctx.globalAlpha = ga * 0.7; var gz = 3 * u; ctx.drawImage(sp, gx - gz, gy - gz, gz * 2, gz * 2); } }
    // shuttles: Earth to the Moon, and a slow cargo ship toward Mars
    [[L.moon, 13, '#ffe2a0', 0], [L.mars, 31, '#ff9a7a', 5]].forEach(function (S2) {
      var T = S2[0], per = S2[1], ph = ((t + S2[3]) % per) / per, a0 = Math.atan2(T.y - cy, T.x - cx), x0 = cx + Math.cos(a0) * R * 1.02, y0 = cy + Math.sin(a0) * R * 1.02, x1 = T.x - Math.cos(a0) * T.r * 1.2, y1 = T.y - Math.sin(a0) * T.r * 1.2;
      var mx = (x0 + x1) / 2 - (y1 - y0) * 0.18, my = (y0 + y1) / 2 + (x1 - x0) * 0.18, p = ph < 0.85 ? ph / 0.85 : 1, fade = ph < 0.85 ? Math.min(1, ph * 8) : 1 - (ph - 0.85) / 0.15;
      ctx.globalAlpha = 0.18; ctx.strokeStyle = S2[2]; ctx.lineWidth = 1 * u; ctx.setLineDash([2 * u, 5 * u]); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(mx, my, x1, y1); ctx.stroke(); ctx.setLineDash([]);
      var bxp = (1 - p) * (1 - p) * x0 + 2 * (1 - p) * p * mx + p * p * x1, byp = (1 - p) * (1 - p) * y0 + 2 * (1 - p) * p * my + p * p * y1, gl = glowSpr(S2[2], true);
      if (gl) { ctx.globalAlpha = fade * 0.95; var gz2 = 6 * u; ctx.drawImage(gl, bxp - gz2, byp - gz2, gz2 * 2, gz2 * 2); } });
    // satellites crossing in front of the globe
    for (i = 0; i < 2; i++) { var oa = t * (0.12 + i * 0.05) + i * 2.4, ox = cx + Math.cos(oa) * R * (1.08 + i * 0.06), oy = cy + Math.sin(oa) * R * (0.42 + i * 0.12) - R * 0.1 * i, bl = Math.sin(t * 5 + i) > 0.5;
      ctx.globalAlpha = 0.85; ctx.fillStyle = '#dfe8ff'; ctx.fillRect(ox - 2 * u, oy - 0.6 * u, 4 * u, 1.2 * u); var sg = glowSpr(i ? '#7ff7e4' : '#ff6a5a', true); if (sg) { ctx.globalAlpha = bl ? 0.9 : 0.25; ctx.drawImage(sg, ox - 4 * u, oy - 4 * u, 8 * u, 8 * u); } }
    // the Moon base breathes
    var mb = glowSpr('#ffcf7a'); if (mb) { var yr = (ch / 4) | 0, pulse = 0.5 + 0.5 * Math.sin(t * 1.3); ctx.globalAlpha = 0.25 + pulse * 0.3; var mz = L.moon.r * (0.5 + yr * 0.12); ctx.drawImage(mb, L.moon.x - L.moon.r * 0.1 - mz, L.moon.y + L.moon.r * 0.9 - mz, mz * 2, mz * 2); }
    ctx.restore();
  }

  for (var c = 0; c < 12; c++) (function (ch) {
    PAINT['world' + ch] = {
      focus: { x: 0.5, y: 0.5 }, track: 'title',
      paint: function (ctx, w, h) { ctx.save(); try { paintWorld(ctx, w, h, ch); } catch (e) { PAINT._err = 'world: ' + String(e && e.stack || e); } finally { ctx.restore(); } },
      overlay: function (ctx, w, h, t) { ctx.save(); try { overlayWorld(ctx, w, h, t, ch); } catch (e) { PAINT._err = 'world overlay: ' + String(e && e.stack || e); } finally { ctx.restore(); } }
    };
  })(c);
})();
