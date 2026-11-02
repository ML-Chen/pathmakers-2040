// Infographic preview: node tools/viz_preview.js [outDir=/tmp/viz]
// Renders every VIZ kind (Byte's per-sentence pictures) at phone width and at 2x, after 1.6 s of animation.
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),src=f=>fs.readFileSync(path.join(root,'src',f),'utf8');
const out=process.argv[2]||'/tmp/viz';fs.mkdirSync(out,{recursive:true});
const only=(process.argv[3]||'').split(',').filter(Boolean);
const page=`<!doctype html><meta charset="utf-8"><style>${src('style.css')}
body{margin:0;padding:12px;background:#eef1fb;width:1240px;display:flex;flex-wrap:wrap;gap:12px;align-items:flex-start}
.c{background:#fff;border-radius:14px;padding:10px}.c b{display:block;font:700 12px system-ui;color:#5a608a;margin-bottom:4px}
.c.s1{width:290px}.c.s2{width:600px}</style><body><script>${src('art.js')}\n${src('content_boston.js')}\n${src('characters.js')}\n${src('infog.js')}
const cases=[['arm'],['straightVsCrooked'],['threeOptions'],['splint'],['switchToCast'],['boneGel'],['healStage',{s:1}],['healStage',{s:2}],['healStage',{s:3}],['healStage',{s:4}],['idcard'],['scooter'],['noAllergy'],['ingredientMatch']];
const only=${JSON.stringify(only)};let H='';
for(const [k,a] of cases){if(only.length&&!only.includes(k))continue;const svg=VIZ[k](a||{});H+='<div class="c s1 fig"><b>'+k+(a?' '+JSON.stringify(a):'')+'</b>'+svg+'</div><div class="c s2 fig"><b>'+k+' 2x</b>'+svg+'</div>'}
document.body.insertAdjacentHTML('beforeend',H);
<\/script>`;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1264,height:900},deviceScaleFactor:2});
  const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
  await p.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.fulfill({status:200,body:''}));
  await p.setContent(page);await p.waitForTimeout(1600);
  await p.screenshot({path:path.join(out,'viz.png'),fullPage:true});
  console.log('errors: '+(errs.join('\n')||'none'));await b.close()})();
