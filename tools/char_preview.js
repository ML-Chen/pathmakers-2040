// Character sheet preview: node tools/char_preview.js [outDir=/tmp/chars]
// Inlines src/art.js, src/content_boston.js, src/characters.js into one page and screenshots every cast member in
// several moods, Byte in all ear styles / colours / moods, mini() chibis, plus animation-state checks
// (blink, talking mouth, tail wag extremes, head sway). Writes sheet.png and per-section crops.
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),src=f=>fs.readFileSync(path.join(root,'src',f),'utf8');
const out=process.argv[2]||'/tmp/chars';fs.mkdirSync(out,{recursive:true});
const page=`<!doctype html><meta charset="utf-8"><style>
body{margin:0;padding:16px;background:#eef1fb;font:600 13px/1.2 system-ui,sans-serif;color:#2a2f55;width:1560px}
h2{margin:18px 0 8px;font-size:16px}.row{display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end}
.cell{display:flex;flex-direction:column;align-items:center;gap:4px}.lbl{font-size:11px;color:#5a608a}
.pbox{width:186px;height:224px;background:linear-gradient(#cfeef0,#f4fbfb);border-radius:12px;overflow:hidden;display:flex}
.pbox.big{width:300px;height:360px}.duo{width:304px;height:430px;display:flex;align-items:flex-end;background:linear-gradient(#bfe6ff,#e9f4f3);border-radius:12px;overflow:hidden}
.duo .speaker{width:50%;height:100%}.bbox{background:#fff;border-radius:12px;padding:6px}.dark{background:#1a2150}
.byteart{display:block;overflow:visible}.portrait{display:block;width:100%;height:100%;overflow:visible}
.vig{width:160px}.minis{background:linear-gradient(#bfe3ff,#eaf6ff);border-radius:12px}
.blink .p-eyes,.blink .byte-eyes{transform-box:fill-box;transform-origin:center;transform:scaleY(.08)}
.talk .p-mouth{transform-box:fill-box;transform-origin:center top;transform:scaleY(1.9) scaleX(.85)}
.swayL .p-head{transform-box:fill-box;transform-origin:50% 100%;transform:rotate(-1.6deg)}
.swayR .p-head{transform-box:fill-box;transform-origin:50% 100%;transform:rotate(1.6deg)}
.wagA .byte-tail{transform-origin:108px 116px;transform:rotate(-14deg)}.wagB .byte-tail{transform-origin:108px 116px;transform:rotate(16deg)}
.perk .byte-ears{transform-box:fill-box;transform-origin:50% 100%;transform:translateY(-3px) scaleY(1.12)}
.yap .byte-head{transform-box:fill-box;transform-origin:50% 90%;transform:translateY(-3px) rotate(-3deg)}
</style><body><div id="root"></div><script>${src('art.js')}\n${src('content_boston.js')}\n${src('characters.js')}
const R=document.getElementById('root');let H='';
const moods=['smile','happy','neutral','worried','sad','surprised','stern','think'];
const cell=(inner,lbl,cls='')=>'<div class="cell '+cls+'">'+inner+'<div class="lbl">'+lbl+'</div></div>';
for(const who of ['imani','maya','dad']){H+='<h2 id="s-'+who+'">'+CAST[who].name+'</h2><div class="row">';
  for(const m of moods)H+=cell('<div class="pbox">'+portrait({...CAST[who],mood:m})+'</div>',m);H+='</div>'}
H+='<h2 id="s-extra">Big + duo (real sizes) + other styles</h2><div class="row">';
H+=cell('<div class="pbox big">'+portrait({...CAST.imani,mood:'smile'})+'</div>','imani 300x360');
H+=cell('<div class="pbox big">'+portrait({...CAST.maya,mood:'happy'})+'</div>','maya 300x360');
H+=cell('<div class="duo"><div class="speaker">'+portrait({...CAST.dad,mood:'think'})+'</div><div class="speaker">'+portrait({...CAST.maya,mood:'worried'})+'</div></div>','duo 304x430');
H+=cell('<div class="pbox">'+portrait({name:'Long',skin:SKIN[0],hair:'#c9772d',hairStyle:'long',eye:'#3d7a5a',shirt:'#6c5ce7',mood:'smile'})+'</div>','long');
H+=cell('<div class="pbox">'+portrait({name:'Elder',skin:SKIN[3],hair:'#d9d6e2',hairStyle:'elder',shirt:'#f5b82e',glasses:true,mood:'happy'})+'</div>','elder');
H+=cell('<div class="pbox">'+portrait({name:'Kid',skin:SKIN[5],hair:'#1b1410',hairStyle:'short',age:'kid',shirt:'#38b07f',mood:'surprised'})+'</div>','kid short');
H+='</div>';
H+='<h2 id="s-anim">Animation states: blink / talk / sway</h2><div class="row">';
for(const [who,m] of [['imani','neutral'],['maya','smile'],['dad','smile']]){
  H+=cell('<div class="pbox blink">'+portrait({...CAST[who],mood:m})+'</div>',who+' blink');
  H+=cell('<div class="pbox talk">'+portrait({...CAST[who],mood:m})+'</div>',who+' talk');}
H+=cell('<div class="pbox swayL">'+portrait({...CAST.maya,mood:'smile'})+'</div>','sway -1.6');
H+=cell('<div class="pbox talk">'+portrait({...CAST.maya,mood:'happy'})+'</div>','talk happy');
H+='</div>';
const bmoods=['happy','neutral','think','alert'];
H+='<h2 id="s-byte">Byte: ears x moods (#f0b35a)</h2><div class="row">';
for(const e of ['floppy','pointy','round'])for(const m of bmoods)H+=cell('<div class="bbox" style="width:150px">'+byteBox({color:'#f0b35a',ears:e,mood:m})+'</div>',e+' '+m);
H+='</div><h2 id="s-bytec">Byte colours</h2><div class="row">';
[['#ffffff','floppy'],['#8f86ff','pointy'],['#9aa3b8','round'],['#3b3346','pointy'],['#ff9bb0','floppy']].forEach(([c,e])=>{for(const m of bmoods)H+=cell('<div class="bbox" style="width:116px">'+byteBox({color:c,ears:e,mood:m})+'</div>',c+' '+m)});
H+='</div><h2 id="s-bytes">Byte sizes + anim checks</h2><div class="row">';
for(const w of [36,58,92,260])H+=cell('<div class="bbox" style="width:'+w+'px">'+byteBox({color:'#f0b35a',ears:'floppy',mood:'happy'})+'</div>',w+'px');
for(const w of [36,58])H+=cell('<div class="bbox" style="width:'+w+'px">'+byteBox({color:'#ffffff',ears:'pointy',mood:'neutral'})+'</div>',w+'px white');
H+=cell('<div class="bbox wagA" style="width:150px">'+byteBox({color:'#8f86ff',ears:'round',mood:'happy'})+'</div>','tail -14');
H+=cell('<div class="bbox wagB" style="width:150px">'+byteBox({color:'#8f86ff',ears:'round',mood:'happy'})+'</div>','tail +16');
H+=cell('<div class="bbox blink" style="width:150px">'+byteBox({color:'#f0b35a',ears:'pointy',mood:'happy'})+'</div>','blink');
H+=cell('<div class="bbox perk yap" style="width:150px">'+byteBox({color:'#f0b35a',ears:'floppy',mood:'alert'})+'</div>','perk+yap');
H+=cell('<div class="bbox dark" style="width:150px">'+byteBox({color:'#9aa3b8',ears:'pointy',mood:'happy'})+'</div>','on dark');
H+='</div><h2 id="s-mini">mini() people: 1x row, 2x row, poses, villains, vignettes</h2>';
const sk=SKIN;const crowd=[[sk[0],'#6c5ce7','#c9772d',''],[sk[1],'#ff7a6b','#2b1a10','happy'],[sk[2],'#16b3a6','#1b1410','sad'],[sk[3],'#f5b82e','#3a2a20',''],[sk[4],'#fbfdff','#111111','happy'],[sk[5],'#5b7bd5','#1b1410',''],[sk[2],'#3d3d55','#b3541e',''],[sk[0],'#38b07f','#e8c26a','sad'],[sk[1],'#ff9bb0','#5a3a2a','happy'],[sk[4],'#6c5ce7','#1b1410',''],[sk[3],'#e05a7a','#2a1a14',''],[sk[0],'#5b7bd5','#8a5a3a','']];
for(const sc of [1,2]){H+='<div class="row" style="margin:4px 0"><svg class="minis" width="'+(crowd.length*30*sc+40)+'" height="'+(64*sc)+'" viewBox="0 0 '+(crowd.length*30*sc+40)+' '+(64*sc)+'">';
  crowd.forEach(([s,sh,h,f],i)=>{H+=mini(20+i*30*sc,(64-36)*sc,{skin:s,shirt:sh,hair:h,face:f||undefined,s:sc,pose:i%3===1?'walk':'stand'})});H+='</svg><span class="lbl">s='+sc+'</span></div>'}
H+='<div class="row"><svg class="minis" width="1000" height="150" viewBox="0 0 500 75">';
H+=mini(30,30,{who:'pip',s:1})+mini(60,24,{who:'jory',s:1})+mini(100,30,{who:'pip',face:'happy'})+mini(130,24,{who:'jory',pose:'walk'});
H+='<rect x="186" y="34" width="36" height="26" rx="3" fill="#c9a26b" stroke="#6a4a22"/>'+mini(170,30,{who:'pip',pose:'push'})+mini(240,30,{who:'jory',pose:'push',flip:true});
H+=mini(290,30,{skin:SKIN[2],shirt:'#fbfdff',hair:'#3a2a20',pose:'walk'})+mini(320,30,{skin:SKIN[4],shirt:'#ff7a6b',hair:'#1b1410',pose:'walk',flip:true})+mini(350,30,{skin:SKIN[1],shirt:'#ff7a6b',hair:'#2b1a10',age:'kid',face:'happy'})+mini(380,30,{skin:SKIN[0],shirt:'#38b07f',hair:'#c9772d',style:'long',outfit:'hoodie'})+mini(410,30,{skin:SKIN[5],shirt:'#f5b82e',hair:'#1b1410',style:'curly',outfit:'jacket'})+mini(440,30,{skin:SKIN[3],shirt:'#6c5ce7',hair:'#d9d6e2',style:'bun',skirt:true})+mini(470,30,{skin:SKIN[1],shirt:'#5b7bd5',hair:'#2a211c',style:'short',outfit:'tee'});
H+='</svg><span class="lbl">2x: villains, push, styles</span></div>';
H+='<div class="row"><svg viewBox="-40 -30 140 80" width="280" height="160" style="background:#dfe6f5;border-radius:10px">'+mini(0,0,{who:'pip',s:1.4})+mini(56,0,{who:'jory',s:1.4})+'<rect x="10" y="4" width="36" height="26" rx="3" fill="#c9a26b"/></svg><span class="lbl">street pipjory call (as in game.js)</span></div>';
H+='<div class="row" style="margin-top:8px">';
for(const k of ['recital','healed','crooked','rash','waiting','moved'])H+=cell(vignette(k),k);
H+='</div>';
H+='<h2 id="s-zoom">Zoom</h2><div class="row">';
for(const [w,m] of [['imani','smile'],['maya','smile'],['dad','smile']])H+=cell('<div class="pbox" style="width:500px;height:600px">'+portrait({...CAST[w],mood:m})+'</div>',w);
H+='</div>';
R.innerHTML=H;
<\/script>`;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1600,height:1000},deviceScaleFactor:2});
  const errs=[];p.on('pageerror',e=>errs.push('pageerror: '+e.message));p.on('console',m=>m.type()==='error'&&errs.push('console: '+m.text()));
  fs.writeFileSync(path.join(out,'sheet.html'),page);
  await p.setContent(page);await p.waitForTimeout(300);
  await p.screenshot({path:path.join(out,'sheet.png'),fullPage:true});
  for(const id of ['imani','maya','dad','extra','anim','byte','bytec','bytes','mini','zoom']){const h=await p.$('#s-'+id);if(!h)continue;
    const box=await p.evaluate(el=>{const r=el.getBoundingClientRect();let n=el.nextElementSibling,bottom=r.bottom;while(n&&n.tagName!=='H2'){bottom=Math.max(bottom,n.getBoundingClientRect().bottom);n=n.nextElementSibling}return{x:0,y:r.top+scrollY,width:1600,height:bottom-r.top+6}},h);
    await p.screenshot({path:path.join(out,id+'.png'),clip:box,fullPage:true})}
  // head pivot sanity: p-head bbox bottom should sit at the neck
  const piv=await p.evaluate(()=>[...document.querySelectorAll('.pbox.big .p-head')].map(g=>{const b=g.getBBox();return [b.x,b.y,b.width,b.height].map(v=>Math.round(v))}));
  console.log('p-head bboxes',JSON.stringify(piv));
  fs.writeFileSync(path.join(out,'errors.txt'),errs.join('\n'));console.log('errors: '+(errs.join('\n')||'none'));await b.close()})();
