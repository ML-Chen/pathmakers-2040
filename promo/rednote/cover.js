// The RedNote cover image (3:4, 1080x1440): node promo/rednote/cover.js OUT   (run after render.js, which writes OUT/clean/)
// A grid of four very different places from the game, Byte in front, and the question in big type.
const {chromium} = require('playwright'); const fs = require('fs'), path = require('path');
const out = process.argv[2] || '/tmp/pm-promo';
const pick = ['local', 'source', 'listen', 'audit'].map(id => path.join(out, 'clean', id + '.png')).filter(f => fs.existsSync(f));
const img = f => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
const html = `<!doctype html><meta charset="utf-8"><style>
html,body{margin:0;width:1080px;height:1440px;overflow:hidden;background:#141838;font-family:"Noto Sans CJK SC",sans-serif}
.grid{position:absolute;inset:0;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:10px}
.grid div{background-size:cover;background-position:center 30%;filter:saturate(1.08)}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(14,16,48,.15) 0%,rgba(14,16,48,0) 30%,rgba(14,16,48,.55) 62%,rgba(14,16,48,.92) 100%)}
.band{position:absolute;left:0;right:0;bottom:120px;height:150px;background:rgba(14,16,48,.78)}
.one{position:absolute;left:30px;right:30px;bottom:150px;text-align:center;white-space:nowrap;color:#fff;font-weight:900;font-size:80px;line-height:90px;text-shadow:0 6px 30px rgba(0,0,0,.6)}
.one em{font-style:normal;color:#ffd45c}
</style><div class="grid">${pick.map(f => `<div style="background-image:url(${img(f)})"></div>`).join('')}</div><div class="shade"></div>
<div class="band"></div><div class="one" id="one">vibe coding 出的游戏，帮孩子备战 <em>AI 2040</em></div>`;
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 1080, height: 1440}});
  await p.setContent(html); await p.waitForTimeout(300);
  // shrink the one line until it fits the width
  await p.evaluate(() => { const e = document.getElementById('one'); let f = 80; while (e.scrollWidth > e.clientWidth && f > 30) e.style.fontSize = (f -= 2) + 'px' });
  await p.screenshot({path: path.join(out, 'cover.png')}); await b.close();
  console.log(path.join(out, 'cover.png'));
})();
