// Preview the painted backgrounds in src/paint_boston.js.
//   node tools/paint_preview.js [outDir=/tmp/paint] [scene,...] [--sizes] [--top]
// Renders each scene at 390x844 CSS px (deviceScaleFactor 2), calls paint() then overlay(t=3),
// saves <outDir>/<scene>.png and prints paint/overlay timings plus any page errors.
//   --sizes  also renders 520x900 and 360x640 (<scene>_520x900.png, <scene>_360x640.png)
//   --top    also saves a full-resolution crop of the top 45% (<scene>_top.png)
//   --raw    also saves the painting without the overlay (<scene>_raw.png)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');

const args = process.argv.slice(2);
const flags = new Set(args.filter(a => a.startsWith('--')));
const pos = args.filter(a => !a.startsWith('--'));
const out = pos[0] || '/tmp/paint';
const ALL = ['home', 'street', 'hospital', 'night', 'table', 'workbench'];
const scenes = pos[1] ? pos[1].split(',') : ALL;
fs.mkdirSync(out, { recursive: true });

const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'paint_boston.js'), 'utf8');
const html = `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#000}canvas{display:block}</style>
<canvas id="c"></canvas><script>${src}<\/script>`;

(async () => {
  const browser = await chromium.launch();
  const sizes = [[390, 844]].concat(flags.has('--sizes') ? [[520, 900], [360, 640]] : []);
  for (const [W, H] of sizes) {
    const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
    const errs = [];
    page.on('pageerror', e => errs.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
    await page.setContent(html);
    for (const sc of scenes) {
      const res = await page.evaluate(([sc, W, H]) => {
        const P = window.PAINT || {}, S = P[sc];
        if (!S) return { err: 'no scene ' + sc };
        const dpr = window.devicePixelRatio || 1, cv = document.getElementById('c');
        cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
        cv.style.width = W + 'px'; cv.style.height = H + 'px';
        const ctx = cv.getContext('2d');
        P._err = null;
        // warm-up on a scratch canvas so one-time sprite/grain setup is not counted twice
        const t0 = performance.now();
        S.paint(ctx, cv.width, cv.height);
        ctx.getImageData(0, 0, 1, 1); // flush
        const t1 = performance.now();
        const raw = cv.toDataURL('image/png');
        // overlay cost: average of 30 frames drawn over a cached copy
        const cache = document.createElement('canvas'); cache.width = cv.width; cache.height = cv.height;
        cache.getContext('2d').drawImage(cv, 0, 0);
        let ot = 0;
        for (let i = 0; i < 30; i++) {
          ctx.drawImage(cache, 0, 0);
          const a = performance.now(); S.overlay(ctx, cv.width, cv.height, 3 + i / 60); ctx.getImageData(0, 0, 1, 1); ot += performance.now() - a;
        }
        ctx.drawImage(cache, 0, 0);
        S.overlay(ctx, cv.width, cv.height, 3);
        // second paint to check determinism
        const c2 = document.createElement('canvas'); c2.width = cv.width; c2.height = cv.height;
        const t2 = performance.now(); S.paint(c2.getContext('2d'), c2.width, c2.height); c2.getContext('2d').getImageData(0, 0, 1, 1);
        const t3 = performance.now();
        const same = c2.toDataURL('image/png') === raw;
        return { paint: t1 - t0, repaint: t3 - t2, overlay: ot / 30, err: P._err, same, raw };
      }, [sc, W, H]);
      const tag = W === 390 ? '' : `_${W}x${H}`;
      if (res.err && !res.paint) { console.log(sc, tag, 'ERROR', res.err); continue; }
      const cv = await page.$('#c');
      await cv.screenshot({ path: path.join(out, `${sc}${tag}.png`) });
      if (flags.has('--raw') && res.raw) fs.writeFileSync(path.join(out, `${sc}${tag}_raw.png`), Buffer.from(res.raw.split(',')[1], 'base64'));
      if (flags.has('--top') && !tag) await page.screenshot({ path: path.join(out, `${sc}_top.png`), clip: { x: 0, y: 0, width: W, height: Math.round(H * 0.45) } });
      console.log(`${(sc + tag).padEnd(20)} paint ${res.paint.toFixed(0).padStart(4)} ms (repaint ${res.repaint.toFixed(0)} ms)  overlay ${res.overlay.toFixed(2)} ms/frame  deterministic=${res.same}${res.err ? '  ERR ' + res.err : ''}`);
    }
    if (errs.length) console.log('page errors:\n' + errs.join('\n'));
    await page.close();
  }
  await browser.close();
  console.log('PNGs in ' + out);
})();
