const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const src = fs.readFileSync('/home/claude/pathmakers-2040/src/paint_boston.js', 'utf8');
const html = `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#000}canvas{display:block}</style><canvas id="c"></canvas><script>${src}<\/script>`;
const sizes = process.argv[2].split(',').map(s=>s.split('x').map(Number));
const scenes = (process.argv[3]||'home,street,hospital,night,table,workbench').split(',');
const out = process.argv[4] || '/home/claude/promo/work/paint';
(async () => {
  const b = await chromium.launch();
  for (const [W,H] of sizes) {
    const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
    p.on('pageerror', e => console.log('err', e.message));
    await p.setContent(html);
    for (const sc of scenes) {
      const t0=Date.now();
      const data = await p.evaluate(([sc,W,H]) => { const cv=document.getElementById('c'); cv.width=W; cv.height=H; const ctx=cv.getContext('2d'); PAINT[sc].paint(ctx,W,H); PAINT[sc].overlay(ctx,W,H,3); return cv.toDataURL('image/jpeg',0.9); }, [sc,W,H]);
      fs.writeFileSync(path.join(out, `${sc}_${W}x${H}.jpg`), Buffer.from(data.split(',')[1], 'base64'));
      console.log(sc, W, H, Date.now()-t0, 'ms');
    }
  }
  await b.close();
})();
