// The RedNote cover image (3:4, 1080x1440): node promo/rednote/cover.js OUT [game.html]
// A grid of four very different places from the game, Byte in front, and the question in big type.
const {chromium} = require('playwright'); const fs = require('fs'), path = require('path');
const out = process.argv[2] || '/tmp/pm-promo';
const game = process.argv[3] || path.join(__dirname, '..', '..', 'dist', 'pathmakers.html');
// the four tiles are the game's most futuristic paintings, rendered fresh (no people in front)
const SCENES = ['moon', 'ocean_dc', 'mars_dusk', 'shenzhen'];
const img = f => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
let pick = [];
const page = () => `<!doctype html><meta charset="utf-8"><style>
html,body{margin:0;width:1080px;height:1440px;overflow:hidden;background:#141838;font-family:"Noto Sans CJK SC",sans-serif}
.grid{position:absolute;inset:0;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:10px}
.grid div{background-size:cover;background-position:center 30%;filter:saturate(1.08)}
.shade{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,rgba(14,16,48,0) 55%,rgba(14,16,48,.35) 100%)}
.band{position:absolute;left:0;right:0;top:50%;height:420px;transform:translateY(-50%);background:rgba(14,16,48,.8)}
.one{position:absolute;left:24px;right:24px;top:50%;transform:translateY(-50%);text-align:center;color:#fff;font-weight:900;text-shadow:0 6px 30px rgba(0,0,0,.6)}
.fit{display:block;white-space:nowrap;font-size:150px;line-height:1.25}
.one em{font-style:normal;color:#ffd45c}
</style><div class="grid">${pick.map(f => `<div style="background-image:url(${img(f)})"></div>`).join('')}</div><div class="shade"></div>
<div class="band"></div><div class="one"><span class="fit">vibe coding 的游戏</span><span class="fit">帮孩子备战 <em>AI 2040</em></span></div>`;
(async () => {
  const b = await chromium.launch();
  const g = await b.newPage({viewport: {width: 405, height: 540}, deviceScaleFactor: 8/3});
  await g.goto('file://' + path.resolve(game)); await g.waitForTimeout(800); fs.mkdirSync(path.join(out, 'clean'), {recursive: true});
  for (const k of SCENES) { await g.evaluate(k => { S.mute = true; screen('covershot', scene(k)); document.querySelectorAll('.props,.hud').forEach(e => e.remove()) }, k); await g.waitForTimeout(1500);
    const f = path.join(out, 'clean', 'cover_' + k + '.png'); await g.screenshot({path: f}); pick.push(f) }
  await g.close();
  const p = await b.newPage({viewport: {width: 1080, height: 1440}});
  await p.setContent(page()); await p.waitForTimeout(300);
  // shrink the one line until it fits the width
  await p.evaluate(() => { const fs = [...document.querySelectorAll('.fit')]; let f = 150; const over = () => fs.some(e => e.scrollWidth > e.parentElement.clientWidth); while (over() && f > 40) { f -= 2; fs.forEach(e => e.style.fontSize = f + 'px') } });
  await p.screenshot({path: path.join(out, 'cover.png')}); await b.close();
  console.log(path.join(out, 'cover.png'));
})();
