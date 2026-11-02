// Byte's closet contact sheet: node tools/byte_sheet.js [outDir=/tmp/byte-sheet]
// Inlines src/characters.js and src/byte_custom.js and draws Byte in every combination that matters: tails x eyes,
// eyes x moods, tail wag extremes, every gear item with every ear style and mood, every colour, gear combinations,
// the real in-game sizes (36 to 220 px) and the animation extremes (blink, head bob, talking, perk, pet squash).
// Writes sheet.png plus one crop per section.
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),src=f=>fs.readFileSync(path.join(root,'src',f),'utf8');
const out=process.argv[2]||'/tmp/byte-sheet';fs.mkdirSync(out,{recursive:true});
const page=`<!doctype html><meta charset="utf-8"><style>
body{margin:0;padding:16px;background:#eef1fb;font:600 13px/1.2 system-ui,sans-serif;color:#2a2f55;width:1560px}
h2{margin:18px 0 8px;font-size:16px}.row{display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end}
.cell{display:flex;flex-direction:column;align-items:center;gap:4px}.lbl{font-size:11px;color:#5a608a;max-width:150px;text-align:center}
.bbox{background:#fff;border-radius:12px;padding:14px 6px 4px}.dark{background:#1a2150}.note{background:#f3f0ff}.scene{background:linear-gradient(#9fc4f0,#f2d6b0)}
.byteart{display:block;overflow:visible}
*,*::before,*::after{animation:none!important}
.blink .byte-eyes{transform:scaleY(.1)}
.bobL .byte-head{transform:translateY(-2px) rotate(-4deg)}.bobR .byte-head{transform:rotate(3deg)}
.bobL .bc-g-helmet .byte-head{transform:translateY(-1.5px) rotate(-2deg)}.bobR .bc-g-helmet .byte-head{transform:rotate(1.5deg)}
.yap .byte-head{transform:translateY(-3px) rotate(-3deg)}.yap .bc-g-helmet .byte-head{transform:translateY(-2px) rotate(-1.5deg)}
.perk .byte-ears{transform-box:fill-box;transform-origin:50% 100%;transform:translateY(-3px) scaleY(1.12)}.perk .bc-g-helmet .byte-ears{transform:translateY(-1.5px) scaleY(1.05)}
.wagA .byte-tail{transform:rotate(-14deg)}.wagB .byte-tail{transform:rotate(16deg)}
.squash .byteart{transform:scale(1.08,.92)}
${src('css/byte_custom.css')}
</style><body><div id="root"></div><script>${src('art.js')}\n${src('characters.js')}\n${src('byte_custom.js')}
const R=document.getElementById('root');let H='';
const cell=(o,w,lbl,cls='',bg='')=>'<div class="cell '+cls+'"><div class="bbox '+bg+'" style="width:'+w+'px">'+byteBox(o)+'</div><div class="lbl">'+lbl+'</div></div>';
const sec=(id,t)=>{H+=(H?'</div>':'')+'<h2 id="s-'+id+'">'+t+'</h2><div class="row">'};
const moods=['happy','neutral','think','alert'],ears=['floppy','pointy','round'],tails=['fluffy','curly','stubby'],eyes=['sparkly','button','glow'];
const base={color:'#f0b35a',ears:'floppy',tail:'fluffy',eyes:'sparkly',wear:[]};
sec('te','Tails x eyes (happy)');
for(const t of tails)for(const e of eyes)H+=cell({...base,tail:t,eyes:e},150,t+' / '+e);
sec('em','Eyes x moods');
for(const e of eyes)for(const m of moods)H+=cell({...base,eyes:e,mood:m},118,e+' '+m);
sec('wag','Tails at the wag extremes, plus blink');
for(const t of tails){H+=cell({...base,tail:t,color:'#8f86ff',ears:'round'},130,t+' -14','wagA');H+=cell({...base,tail:t,color:'#8f86ff',ears:'round'},130,t+' +16','wagB')}
for(const e of eyes)H+=cell({...base,eyes:e},130,e+' blink','blink');
sec('ge','Gear x ears (happy)');
for(const g of BYTE_GEAR)for(const e of ears)H+=cell({...base,ears:e,wear:[g.id]},116,g.name+' / '+e);
sec('gm','Gear x moods (alert flares the ears, think and alert move the effects)');
for(const g of BYTE_GEAR)for(const m of moods)H+=cell({...base,ears:g.slot==='head'?'pointy':'floppy',wear:[g.id],mood:m},104,g.name+' '+m);
sec('gc','Gear on every colour (looks rotate through tails and eyes)');
BYTE_COLORS.forEach((c,ci)=>BYTE_GEAR.forEach((g,gi)=>{H+=cell({color:c,ears:ears[(ci+gi)%3],tail:tails[(ci*2+gi)%3],eyes:eyes[(ci+gi*2)%3],wear:[g.id]},92,c+' '+g.id)}));
sec('combo','Combinations');
const combos=[['helmet','parka','startag'],['helmet','vest','labbadge'],['snorkel','bandana'],['bow','judge','startag'],['bow','parka','bandana'],['snorkel','vest','startag'],['helmet','judge'],['bow','bandana','labbadge'],['snorkel','parka','judge'],['helmet','bandana','vest','startag']];
combos.forEach((w,i)=>{H+=cell({color:BYTE_COLORS[i%7],ears:ears[i%3],tail:tails[(i+1)%3],eyes:eyes[(i+2)%3],wear:w,mood:moods[i%4]},140,w.join(' + '))});
sec('size','Real sizes: chat 36, note 58, table 62, companion 76, walk 84 (on lavender, white, scene and night)');
for(const g of [null,...BYTE_GEAR.map(x=>x.id)]){const o={...base,ears:'pointy',wear:g?[g]:[]};
  H+=cell(o,36,(g||'none')+' 36');H+=cell(o,58,'58','','note');H+=cell(o,76,'76','','scene');H+=cell({...o,mood:'alert'},84,'84 night','','dark')}
sec('anim','Animation extremes: head bob both ways, talking, perk, pet squash');
for(const w of [['helmet'],['snorkel'],['bow'],['helmet','parka'],['judge','startag']])for(const e of ['floppy','pointy'])for(const [cls,l] of [['bobL','bob -4'],['bobR','bob +3'],['yap perk','talk+perk'],['squash','pet']])
  H+=cell({...base,ears:e,wear:w,mood:cls.includes('perk')?'alert':'happy'},104,w.join('+')+' '+e+' '+l,cls);
sec('big','Close-ups: each item at 190 px, then title-size combinations at 220 px');
BYTE_GEAR.forEach((g,i)=>{H+=cell({...base,ears:ears[i%3],tail:tails[i%3],wear:[g.id]},190,g.name)});
for(const w of [['helmet','parka','startag'],['snorkel','vest'],['bow','judge','labbadge'],['bow','bandana']])H+=cell({...base,ears:'floppy',tail:'curly',eyes:'button',wear:w},220,w.join(' + '));
H+='</div>';R.innerHTML=H;
<\/script>`;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1600,height:1000},deviceScaleFactor:2});
  const errs=[];p.on('pageerror',e=>errs.push('pageerror: '+e.message));p.on('console',m=>m.type()==='error'&&errs.push('console: '+m.text()));
  fs.writeFileSync(path.join(out,'sheet.html'),page);await p.setContent(page);await p.waitForTimeout(300);
  await p.screenshot({path:path.join(out,'sheet.png'),fullPage:true});
  for(const id of ['te','em','wag','ge','gm','gc','combo','size','anim','big']){const h=await p.$('#s-'+id);if(!h)continue;
    const box=await p.evaluate(el=>{const r=el.getBoundingClientRect(),n=el.nextElementSibling.getBoundingClientRect();return{x:0,y:r.top+scrollY,width:1600,height:n.bottom-r.top+6}},h);
    await p.screenshot({path:path.join(out,id+'.png'),clip:box,fullPage:true})}
  fs.writeFileSync(path.join(out,'errors.txt'),errs.join('\n'));console.log('errors: '+(errs.join('\n')||'none'));await b.close()})();
