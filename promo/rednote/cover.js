// The RedNote cover image (3:4, 1080x1440): node promo/rednote/cover.js OUT   (run after render.js, which writes OUT/clean/)
// A grid of four very different places from the game, Byte in front, and the question in big type.
const {chromium} = require('playwright'); const fs = require('fs'), path = require('path');
const out = process.argv[2] || '/tmp/pm-promo';
const pick = ['audit', 'source', 'listen', 'world'].map(id => path.join(out, 'clean', id + '.png')).filter(f => fs.existsSync(f));
const img = f => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
const html = `<!doctype html><meta charset="utf-8"><style>
html,body{margin:0;width:1080px;height:1440px;overflow:hidden;background:#141838;font-family:"Noto Sans CJK SC",sans-serif}
.grid{position:absolute;inset:0;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:10px}
.grid div{background-size:cover;background-position:center 30%;filter:saturate(1.08)}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(14,16,48,.15) 0%,rgba(14,16,48,0) 30%,rgba(14,16,48,.55) 62%,rgba(14,16,48,.92) 100%)}
.top{position:absolute;left:0;right:0;top:64px;text-align:center}
.top span{display:inline-block;background:#ffd45c;color:#1f2350;font-weight:900;font-size:56px;padding:8px 30px;border-radius:22px;box-shadow:0 12px 40px rgba(0,0,0,.45)}
.title{position:absolute;left:40px;right:40px;bottom:250px;text-align:center;color:#fff;font-weight:900;font-size:104px;line-height:1.16;text-shadow:0 6px 30px rgba(0,0,0,.55)}
.title em{font-style:normal;color:#ffd45c}
.sub{position:absolute;left:40px;right:40px;bottom:120px;text-align:center;color:#fff;font-weight:700;font-size:40px;opacity:.95}
.sub b{background:rgba(255,255,255,.16);padding:4px 18px;border-radius:14px}
</style><div class="grid">${pick.map(f => `<div style="background-image:url(${img(f)})"></div>`).join('')}</div><div class="shade"></div>
<div class="top"><span>2040年 · AI 成了顶级专家</span></div>
<div class="title">孩子今天<br>该学<em>什么</em>？</div>
<div class="sub"><b>我和 Claude 一个通宵做了个游戏来回答</b></div>`;
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 1080, height: 1440}});
  await p.setContent(html); await p.waitForTimeout(300);
  await p.screenshot({path: path.join(out, 'cover.png')}); await b.close();
  console.log(path.join(out, 'cover.png'));
})();
