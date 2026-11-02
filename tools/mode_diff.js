// Pixel-compares two builds of the game on every screen of one mission, played the same way at Kid level.
//   node tools/mode_diff.js A.html B.html OUT [missionId=maya]
// Use it to prove that an engine change leaves Kid mode untouched: A is the old build (for example main), B the new one.
// Both builds run with reduced motion, finished CSS animations, a seeded Math.random and a fixed real outcome, so the
// same screen renders the same pixels. Writes OUT/a/*.png, OUT/b/*.png, OUT/diff/*.png (changed pixels in red) and
// OUT/report.txt. Exits 1 if any screen differs.
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const [A,B,out,mission='maya']=process.argv.slice(2);
if(!A||!B||!out){console.log('usage: node tools/mode_diff.js A.html B.html OUT [missionId]');process.exit(2)}
const W=390,H=844;

async function play(browser,html,dir){
  fs.mkdirSync(dir,{recursive:true});const ctx=await browser.newContext({viewport:{width:W,height:H},deviceScaleFactor:1,reducedMotion:'reduce'});
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.fulfill({status:200,body:''}));
  await p.addInitScript(()=>{window.__noaudio=1;try{localStorage.clear()}catch(e){}let a=12345;Math.random=()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}});
  await p.goto('file://'+path.resolve(html));await p.waitForTimeout(500);
  const E=(f,a)=>p.evaluate(f,a);const names=[];let n=0;
  const shot=async(label,full=false,wait=350)=>{await p.waitForTimeout(wait);const f=String(++n).padStart(3,'0')+'-'+label.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,50)+'.png';
    await p.screenshot({path:path.join(dir,f),fullPage:full,animations:'disabled',caret:'hide'});names.push(f)};
  const clear=()=>E(()=>document.querySelectorAll('.sheet,.signing,.gpop,.bubble,.toast').forEach(x=>x.remove()));
  await E(()=>{S.mute=true});await shot('title');
  await E(m=>{S.completed={};startMission(m)},mission);await p.waitForTimeout(300);
  const flow=await E(()=>M().flow.map(f=>({name:f.name,k:f.k})));
  for(const f of flow){
    if(await E(()=>S.step)!==f.name){await E(n=>go(n),f.name);await p.waitForTimeout(200)}
    if(f.k==='talk'){for(let i=1;i<=80&&await E(n=>S.step===n,f.name);i++){
        const st=await E(()=>{const h=document.querySelector('#hint'),c=document.querySelectorAll('#choices .choice').length;if(h&&h.hidden&&!c)document.querySelector('#sub').click();
          return {clue:!!document.querySelector('#choices .clue'),choices:document.querySelectorAll('#choices .choice').length}});
        await shot(f.name+' '+i);
        if(st.clue){await E(()=>document.querySelector('#choices .clue').click());await p.waitForTimeout(200);await clear();continue}
        if(st.choices){await E(()=>document.querySelector('#choices .choice').click());await p.waitForTimeout(250);await E(()=>{const h=document.querySelector('#hint');if(h&&h.hidden)document.querySelector('#sub').click()});await shot(f.name+' '+i+' reply')}
        await E(()=>document.querySelector('#sub')&&document.querySelector('#sub').click());await p.waitForTimeout(200)}
      continue}
    if(f.k==='bench'){const docs=await E(()=>M().docs.map(d=>d.id));
      for(const id of docs){await E(id=>{curDoc=id;renderWorkbench()},id);await shot('bench '+id,true,600)}
      await E(()=>{const T=M().tell;if(T){S.notes[T.clue]=true;renderWorkbench()}});await shot('bench clue noticed',true,500);
      await E(()=>{const t=document.querySelector('#tell');t&&t.click()});await clear();await E(()=>window.scrollTo(0,0));await shot('bench after telling',true,800);
      if(await E(()=>!!M().lesson)){await E(()=>openLesson(M().lesson.id));await shot('lesson',false,900);await clear()}}
    else if(f.k==='criteria'){await shot('criteria');await E(()=>[...document.querySelectorAll('.critb')].slice(0,3).forEach(b=>b.click()));await shot('criteria picked')}
    else if(f.k==='table'){const plans=await E(()=>allPlans());
      for(const c of plans){await E(c=>{S.choice={...c};renderTable()},c);await shot('table '+JSON.stringify(c),true,500)}
      await E(()=>{S.choice={...M().start};renderTable();document.querySelector('#why').click()});await shot('table why',true)}
    else if(f.k==='consent'){await shot('consent');const k=await E(()=>document.querySelectorAll('.choice').length);
      for(let j=0;j<k;j++){await E(j=>{renderConsent();document.querySelectorAll('.choice')[j].click()},j);await shot('consent answer '+(j+1))}await E(()=>{S.consent=true})}
    else if(f.k==='memo'){await shot('memo empty');await E(()=>{S.memo='I recommend a cast with physical therapy because Maya cares about her recital. The chance it heals straight is about 88 out of 100.';renderMemo()});await shot('memo written');
      await E(()=>document.querySelector('#rev').click());await shot('memo reviewed',false,700);await clear()}
    else if(f.k==='reveal'){await E(n=>{S.result={...M().outcomes(S.choice,M().truth())[0],_h:1};go(n)},f.name);await shot('reveal',false,3200)}
    else if(f.k==='debrief'){await shot('debrief',true,600)}
    else if(f.k==='evening'){await shot('evening');await E(()=>openGuide());await shot('field guide',false,500);await clear();await E(()=>openWords());await shot('word book',false,500);await clear();break}
    else await shot(f.name);
    if(await E(n=>S.step===n,f.name))await E(()=>nextStep());await p.waitForTimeout(150)}
  await ctx.close();return {names,errs}}

(async()=>{fs.rmSync(out,{recursive:true,force:true});const browser=await chromium.launch();
  const a=await play(browser,A,path.join(out,'a')),b=await play(browser,B,path.join(out,'b'));
  const cp=await (await browser.newContext()).newPage();fs.mkdirSync(path.join(out,'diff'),{recursive:true});const lines=[];let bad=0;
  const all=[...new Set(a.names.concat(b.names))];
  for(const f of all){const pa=path.join(out,'a',f),pb=path.join(out,'b',f);
    if(!fs.existsSync(pa)||!fs.existsSync(pb)){lines.push(`MISSING ${f}`);bad++;continue}
    const r=await cp.evaluate(async([x,y])=>{const load=s=>new Promise(res=>{const i=new Image();i.onload=()=>res(i);i.src=s});const [i1,i2]=await Promise.all([load(x),load(y)]);
      if(i1.width!==i2.width||i1.height!==i2.height)return {size:`${i1.width}x${i1.height} vs ${i2.width}x${i2.height}`};
      const c=document.createElement('canvas');c.width=i1.width;c.height=i1.height;const g=c.getContext('2d');g.drawImage(i1,0,0);const d1=g.getImageData(0,0,c.width,c.height).data;g.drawImage(i2,0,0);const d2=g.getImageData(0,0,c.width,c.height);
      let n=0;for(let k=0;k<d1.length;k+=4){if(d1[k]!==d2.data[k]||d1[k+1]!==d2.data[k+1]||d1[k+2]!==d2.data[k+2]){n++;d2.data[k]=255;d2.data[k+1]=0;d2.data[k+2]=0}else{d2.data[k+3]=60}}
      g.putImageData(d2,0,0);return {n,png:n?c.toDataURL('image/png'):null,total:d1.length/4}},['data:image/png;base64,'+fs.readFileSync(pa).toString('base64'),'data:image/png;base64,'+fs.readFileSync(pb).toString('base64')]);
    if(r.size){lines.push(`SIZE ${f}: ${r.size}`);bad++;continue}
    if(r.n){bad++;fs.writeFileSync(path.join(out,'diff',f),Buffer.from(r.png.split(',')[1],'base64'));lines.push(`DIFF ${f}: ${r.n} of ${r.total} pixels`)}else lines.push(`same ${f}`)}
  const errs=a.errs.map(e=>'A error: '+e).concat(b.errs.map(e=>'B error: '+e));
  const rep=`${all.length} screens compared, ${bad} differ\n`+errs.join('\n')+(errs.length?'\n':'')+lines.join('\n');fs.writeFileSync(path.join(out,'report.txt'),rep);
  console.log(rep.split('\n').filter(l=>!l.startsWith('same ')).join('\n'));await browser.close();process.exit(bad||errs.length?1:0)})();
