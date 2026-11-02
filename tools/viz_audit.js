// Renders every infographic in the built game (VIZ kinds from every mission), saves contact sheets, and checks for
// layout bugs a person would notice:
//  - "clash": an SVG element with a transform attribute whose CSS animation also animates transform. The animation
//    replaces the attribute, so the piece jumps to the top-left corner (misplaced bubbles, stacked icons).
//  - "overlap": two text labels in one picture that cover each other.
//  - "cut": a text label that runs past the edge of its picture.
//  - "throw": the picture failed to draw.
// Usage: node tools/viz_audit.js dist/pathmakers.html OUT   (writes OUT/viz_*.png and OUT/viz_report.txt; exit 1 on problems
// unless VIZ_AUDIT_WARN=1)
const {chromium} = require('playwright'); const fs = require('fs'), path = require('path');
const [file, out = '/tmp/pm-viz'] = process.argv.slice(2);
fs.mkdirSync(out, {recursive: true});
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 1320, height: 900}, deviceScaleFactor: 1});
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(file)); await p.waitForTimeout(800);
  const kinds = await p.evaluate(() => Object.keys(VIZ).sort());
  const per = 24; const problems = []; let sheet = 0;
  for (let i = 0; i < kinds.length; i += per) {
    const batch = kinds.slice(i, i + per);
    const res = await p.evaluate(batch => {
      try { S.mute = true } catch (e) {}
      document.body.innerHTML = '<div id="vgrid" style="display:grid;grid-template-columns:repeat(4,320px);gap:10px;padding:10px;background:#fff"></div>';
      const g = document.getElementById('vgrid'); const bad = [];
      for (const k of batch) {
        const f = document.createElement('figure'); f.className = 'fig'; f.style.margin = '0';
        let html = ''; try { html = VIZ[k]({}) || '' } catch (e) { bad.push([k, 'throw', e.message]); }
        f.innerHTML = `<figcaption>${k}</figcaption>${html}`; g.appendChild(f);
      }
      return bad;
    }, batch);
    problems.push(...res);
    await p.waitForTimeout(1400);
    await p.screenshot({path: path.join(out, `viz_${String(++sheet).padStart(2, '0')}.png`), fullPage: true});
    const found = await p.evaluate(() => {
      const bad = [];
      document.querySelectorAll('#vgrid figure').forEach(f => {
        const k = f.querySelector('figcaption').textContent; const svg = f.querySelector('svg'); if (!svg) return;
        // clash: transform attribute + animated transform
        svg.querySelectorAll('[transform]').forEach(el => {
          const anims = el.getAnimations ? el.getAnimations() : [];
          if (anims.some(a => a.effect && a.effect.getKeyframes().some(kf => 'transform' in kf || 'translate' in kf || 'scale' in kf || 'rotate' in kf)))
            bad.push([k, 'clash', (el.getAttribute('class') || el.tagName) + ' transform="' + el.getAttribute('transform') + '"']);
        });
        // freeze every animation at its resting layout for the geometry checks
        svg.getAnimations({subtree: true}).forEach(a => a.cancel());
        const sb = svg.getBoundingClientRect();
        const texts = [...svg.querySelectorAll('text')].filter(t => t.textContent.trim() && getComputedStyle(t).opacity !== '0' && t.getAttribute('opacity') !== '0')
          .map(t => ({t: t.textContent.trim(), r: t.getBoundingClientRect()})).filter(o => o.r.width > 0);
        for (const o of texts) if (o.r.left < sb.left - 2 || o.r.right > sb.right + 2 || o.r.top < sb.top - 2 || o.r.bottom > sb.bottom + 2) bad.push([k, 'cut', o.t]);
        for (let a = 0; a < texts.length; a++) for (let c = a + 1; c < texts.length; c++) {
          const A = texts[a].r, B = texts[c].r;
          const w = Math.min(A.right, B.right) - Math.max(A.left, B.left), h = Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top);
          if (w > 3 && h > Math.min(A.height, B.height) * .35) bad.push([k, 'overlap', texts[a].t + ' / ' + texts[c].t]);
        }
      });
      return bad;
    });
    problems.push(...found);
  }
  const seen = new Set(); const uniq = problems.filter(x => { const s = x.join('|'); if (seen.has(s)) return false; seen.add(s); return true; });
  const rep = [`${kinds.length} pictures, ${sheet} sheets, ${uniq.length} problems`, ...uniq.map(x => x.join('  ·  ')), ...errs.map(e => 'pageerror  ·  ' + e)].join('\n');
  fs.writeFileSync(path.join(out, 'viz_report.txt'), rep + '\n'); console.log(rep);
  await b.close(); process.exit(uniq.length && !process.env.VIZ_AUDIT_WARN ? 1 : 0);
})();
