// Renders every infographic in the built game (VIZ kinds from every mission), saves contact sheets, and checks for
// layout bugs a person would notice:
//  - "clash": an SVG element with a transform attribute whose CSS animation also animates transform. The animation
//    replaces the attribute, so the piece jumps to the top-left corner (misplaced bubbles, stacked icons).
//  - "overlap": two text labels in one picture that cover each other where a person can see them.
//  - "cut": a text label that runs past the edge of its picture.
//  - "throw": the picture failed to draw.
// Each picture is drawn the way the game draws it: with every set of args a document, lesson or Ledger story passes it
// (pictures no data names are drawn with {}), in the language PM_LANG (default English), with the game's SVG
// translation applied. The animations are paused and stepped through one loop (SAMPLES frames, STEP ms apart), and a
// problem counts only when it lasts for at least two frames in a row while both labels are fully shown. So:
//  - labels that take turns in one spot (Day/Night, a YES that flips to NO, a counter going 3, 2, 1) are fine;
//  - a label hidden behind a solid shape drawn on top of it (a stack of calendar pages or papers, a coin behind a
//    coin) is fine, found by asking the browser what is painted on top at points inside the overlap;
//  - a label outside its clip-path (a scrolling list) is hidden, and the part inside the clip is what is checked;
//  - the height of a label is the height of its letters, not the font's line box, so a big number above a small word
//    is fine as long as the letters themselves do not touch.
// PM_REDUCED=1 draws everything the way a phone set to reduce motion sees it (the CSS reduced-motion rules apply, so
// pictures whose frames take turns must still show one clean frame).
// Usage: [PM_LANG=zh] [PM_REDUCED=1] node tools/viz_audit.js dist/pathmakers.html OUT   (writes OUT/viz_*.png and OUT/viz_report.txt;
// exit 1 on problems unless VIZ_AUDIT_WARN=1)
const {chromium} = require('playwright'); const fs = require('fs'), path = require('path');
const [file, out = '/tmp/pm-viz'] = process.argv.slice(2);
const LANG = process.env.PM_LANG || '';
const SAMPLES = 41, STEP = 200;
fs.mkdirSync(out, {recursive: true});
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 1320, height: 900}, deviceScaleFactor: 1});
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  if (process.env.PM_REDUCED) await p.emulateMedia({reducedMotion: 'reduce'});
  await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.fulfill({status: 200, body: ''}));
  await p.addInitScript(() => { window.__noaudio = 1; try { localStorage.clear() } catch (e) {} });
  await p.goto('file://' + path.resolve(file)); await p.waitForTimeout(800);
  // every picture, once per distinct set of args the game's data passes it
  const items = await p.evaluate(lg => {
    try { S.mute = true } catch (e) {}
    if (lg) { S.lang = lg; if (typeof I18N !== 'undefined') I18N.sync() }
    const uses = {}, seen = new Set();
    const add = (k, a) => { if (typeof k !== 'string' || !VIZ[k]) return; a = a || {}; (uses[k] = uses[k] || {})[JSON.stringify(a)] = a };
    const walk = (o, d) => {
      if (!o || typeof o !== 'object' || seen.has(o) || d > 14 || o.nodeType) return; seen.add(o);
      if (typeof o.viz === 'string') {
        add(o.viz, o.args);
        // a step's update is drawn as {...step, ...step.alt}
        if (o.alt && typeof o.alt === 'object' && ('viz' in o.alt || 'args' in o.alt)) add(o.alt.viz || o.viz, 'args' in o.alt ? o.alt.args : o.args);
      }
      if (Array.isArray(o.viz)) o.viz.forEach(k => add(k, {}));
      for (const [key, v] of Object.entries(o)) if (v && typeof v === 'object') {
        if (key === 'alt' && typeof o.viz === 'string') { for (const w of Object.values(v)) walk(w, d + 1) } else walk(v, d + 1);
      }
    };
    for (const g of ['MISSIONS', 'LESSONS', 'LEDGER', 'LEDGER_LIBRARY']) { try { walk(eval(g), 0) } catch (e) {} }
    const list = [];
    for (const k of Object.keys(VIZ).sort()) {
      const v = uses[k] ? Object.values(uses[k]) : [{}];
      v.forEach(a => list.push({k, args: a, label: v.length > 1 || Object.keys(a).length ? k + ' ' + JSON.stringify(a) : k}));
    }
    return list;
  }, LANG);
  const per = 24; const problems = []; let sheet = 0;
  for (let i = 0; i < items.length; i += per) {
    const batch = items.slice(i, i + per);
    const res = await p.evaluate(batch => {
      document.body.innerHTML = '<style>#vgrid svg,#vgrid svg *{pointer-events:visiblePainted!important}</style><div id="vgrid" style="display:grid;grid-template-columns:repeat(4,320px);gap:10px;padding:10px;background:#fff"></div>';
      const g = document.getElementById('vgrid'); const bad = [];
      for (const it of batch) {
        const f = document.createElement('figure'); f.className = 'fig'; f.style.margin = '0';
        let html = ''; try { html = VIZ[it.k](it.args) || '' } catch (e) { bad.push([it.label, 'throw', e.message]); }
        const c = document.createElement('figcaption'); c.textContent = it.label;
        f.innerHTML = html; f.prepend(c); g.appendChild(f);
      }
      if (typeof i18nSvg === 'function') g.querySelectorAll('figure').forEach(f => { const c = f.querySelector('figcaption'), t = c.textContent; i18nSvg(f); c.textContent = t });
      return bad;
    }, batch);
    problems.push(...res);
    await p.waitForTimeout(1400);
    await p.screenshot({path: path.join(out, `viz_${String(++sheet).padStart(2, '0')}.png`), fullPage: true});
    // the whole grid must be inside the viewport for the browser's hit test
    const h = await p.evaluate(() => document.documentElement.scrollHeight);
    await p.setViewportSize({width: 1320, height: Math.max(900, h + 20)});
    const found = await p.evaluate(({SAMPLES, STEP}) => {
      const bad = [];
      const figs = [...document.querySelectorAll('#vgrid figure')].map(f => ({k: f.querySelector('figcaption').textContent, svg: f.querySelector('svg')})).filter(o => o.svg);
      // clash: transform attribute + animated transform
      for (const {k, svg} of figs) svg.querySelectorAll('[transform]').forEach(el => {
        const anims = el.getAnimations ? el.getAnimations() : [];
        if (anims.some(a => a.effect && a.effect.getKeyframes().some(kf => 'transform' in kf || 'translate' in kf || 'scale' in kf || 'rotate' in kf)))
          bad.push([k, 'clash', (el.getAttribute('class') || el.tagName) + ' transform="' + el.getAttribute('transform') + '"']);
      });
      const anims = document.getAnimations(); anims.forEach(a => a.pause());
      // how opaque an element really is: its own opacity times every group around it, inside its picture
      const effOp = (el, svg) => { let o = 1;
        for (let e = el; e && e !== svg.parentNode; e = e.parentNode) { const cs = getComputedStyle(e);
          if (cs.display === 'none' || cs.visibility === 'hidden') return 0;
          o *= +cs.opacity; if (o <= 0) return 0 }
        return o };
      const alpha = c => { const m = /rgba?\(([^)]+)\)/.exec(c); if (!m) return 1; const v = m[1].split(/[ ,\/]+/).filter(Boolean); return v.length > 3 ? parseFloat(v[3]) : 1 };
      // a solid shape that hides whatever is painted under it
      const solid = (el, svg) => { if (!svg.contains(el) || el === svg || /^(text|tspan|textPath)$/i.test(el.tagName)) return false;
        const cs = getComputedStyle(el);
        if (!/^(image|foreignObject)$/i.test(el.tagName)) { if (cs.fill === 'none' || alpha(cs.fill) < .85 || +cs.fillOpacity < .85) return false }
        return effOp(el, svg) >= .85 };
      // is text t painted with nothing solid on top of it at screen point (x,y)? null when the hit test does not find it
      const seenAt = (t, x, y, svg) => { const st = document.elementsFromPoint(x, y); const i = st.findIndex(e => t === e || t.contains(e));
        if (i < 0) return null; for (let j = 0; j < i; j++) if (!st[j].contains(t) && solid(st[j], svg)) return false; return true };
      // the screen box of the clip-path(s) around an element, or null
      const clipBox = (el, svg) => { let box = null;
        for (let e = el; e && e !== svg; e = e.parentNode) { if (!e.getAttribute) continue;
          const ref = e.getAttribute('clip-path') || ''; const m = /url\(["']?#([^"')]+)["']?\)/.exec(ref); if (!m) continue;
          const cp = svg.ownerDocument.getElementById(m[1]); if (!cp || !e.getScreenCTM) continue; const M = e.getScreenCTM(); let r = null;
          for (const c of cp.children) { if (!c.getBBox) continue; const bb = c.getBBox();
            for (const [px, py] of [[bb.x, bb.y], [bb.x + bb.width, bb.y], [bb.x, bb.y + bb.height], [bb.x + bb.width, bb.y + bb.height]]) {
              const X = M.a * px + M.c * py + M.e, Y = M.b * px + M.d * py + M.f;
              r = r ? {l: Math.min(r.l, X), r: Math.max(r.r, X), t: Math.min(r.t, Y), b: Math.max(r.b, Y)} : {l: X, r: X, t: Y, b: Y} } }
          if (r) box = box ? {l: Math.max(box.l, r.l), r: Math.min(box.r, r.r), t: Math.max(box.t, r.t), b: Math.min(box.b, r.b)} : r }
        return box };
      // the box of a label's letters: the browser's box gives the width; the height comes from the letters' ink
      const cv = document.createElement('canvas').getContext('2d'); const inkCache = {};
      const inkBox = t => { const R = t.getBoundingClientRect(); let r = {l: R.left, r: R.right, t: R.top, b: R.bottom};
        const M = t.getScreenCTM && t.getScreenCTM(); if (!M || Math.abs(M.b) > .01 || Math.abs(M.c) > .01 || t.querySelector('tspan')) return r;
        const cs = getComputedStyle(t); const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`; const key = font + '|' + t.textContent;
        let m = inkCache[key]; if (!m) { cv.font = font; const q = cv.measureText(t.textContent); m = inkCache[key] = [q.fontBoundingBoxAscent, q.fontBoundingBoxDescent, q.actualBoundingBoxAscent, q.actualBoundingBoxDescent] }
        const [fa, fd, aa, ad] = m; if (!(fa + fd > 0)) return r; const s = (R.height) / (fa + fd); const base = R.top + fa * s;
        return {l: r.l, r: r.r, t: base - aa * s, b: base + ad * s} };
      const sets = figs.map(({k, svg}) => ({k, svg, sb: svg.getBoundingClientRect(), texts: [...svg.querySelectorAll('text')].filter(t => t.textContent.trim())}));
      const pairRun = {}, pairMax = {}, cutRun = {}, cutMax = {};
      for (let s = 0; s < SAMPLES; s++) {
        anims.forEach(a => { try { a.currentTime = s * STEP } catch (e) {} });
        for (const {k, svg, sb, texts} of sets) {
          const L = texts.map(t => { const o = effOp(t, svg); if (o < .5) return null; let r = inkBox(t); if (r.r - r.l <= 0) return null;
            const c = clipBox(t, svg); if (c) { r = {l: Math.max(r.l, c.l), r: Math.min(r.r, c.r), t: Math.max(r.t, c.t), b: Math.min(r.b, c.b)}; if (r.r - r.l < 1 || r.b - r.t < 1) return null }
            return {t, o, r, s: t.textContent.trim()} });
          L.forEach((A, a) => { const id = k + '|' + a; let hit = false;
            if (A) { const r = A.r; hit = r.l < sb.left - 2 || r.r > sb.right + 2 || r.t < sb.top - 2 || r.b > sb.bottom + 2 }
            cutRun[id] = hit ? (cutRun[id] || 0) + 1 : 0; if (hit && cutRun[id] >= 2) cutMax[id] = [k, A.s] });
          for (let a = 0; a < L.length; a++) for (let c = a + 1; c < L.length; c++) {
            const id = k + '|' + a + '|' + c, A = L[a], B = L[c]; let hit = false;
            if (A && B && A.o >= .8 && B.o >= .8) {
              const w = Math.min(A.r.r, B.r.r) - Math.max(A.r.l, B.r.l), h = Math.min(A.r.b, B.r.b) - Math.max(A.r.t, B.r.t);
              if (w > 3 && h > Math.min(A.r.b - A.r.t, B.r.b - B.r.t) * .35) {
                // can both be seen somewhere inside the overlap?
                let known = false; hit = false;
                const x0 = Math.max(A.r.l, B.r.l), y0 = Math.max(A.r.t, B.r.t);
                for (const fx of [.2, .5, .8]) for (const fy of [.25, .5, .75]) { if (hit) break;
                  const x = x0 + w * fx, y = y0 + h * fy, va = seenAt(A.t, x, y, svg), vb = seenAt(B.t, x, y, svg);
                  if (va === null || vb === null) continue; known = true; if (va && vb) hit = true }
                if (!known) hit = true;
              }
            }
            pairRun[id] = hit ? (pairRun[id] || 0) + 1 : 0; if (hit && pairRun[id] >= 2) pairMax[id] = [k, A.s + ' / ' + B.s];
          }
        }
      }
      for (const v of Object.values(cutMax)) bad.push([v[0], 'cut', v[1]]);
      for (const v of Object.values(pairMax)) bad.push([v[0], 'overlap', v[1]]);
      return bad;
    }, {SAMPLES, STEP});
    problems.push(...found);
    await p.setViewportSize({width: 1320, height: 900});
  }
  const seen = new Set(); const uniq = problems.filter(x => { const s = x.join('|'); if (seen.has(s)) return false; seen.add(s); return true; });
  const rep = [`${items.length} pictures, ${sheet} sheets, ${uniq.length} problems${LANG ? ' (' + LANG + ')' : ''}${process.env.PM_REDUCED ? ' (reduced motion)' : ''}`, ...uniq.map(x => x.join('  ·  ')), ...errs.map(e => 'pageerror  ·  ' + e)].join('\n');
  fs.writeFileSync(path.join(out, 'viz_report.txt'), rep + '\n'); console.log(rep);
  await b.close(); process.exit(uniq.length && !process.env.VIZ_AUDIT_WARN ? 1 : 0);
})();
