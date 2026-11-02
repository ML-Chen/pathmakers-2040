// Prove a change leaves English pixel-identical: node tools/i18n_endiff.js base.html new.html [outDir=/tmp/pm-endiff]
// Plays the same scripted tour of every Maya screen, sheet and the grown-ups' page in both builds at 390x844 and
// compares the screenshots pixel by pixel. Runs are deterministic: seeded Math.random, a fixed Date, reduced motion
// (the painted scenes draw their t=0 frame) and CSS animations disabled at capture. Writes <outDir>/report.txt and,
// for each screen that differs, base/new/diff PNGs (changed pixels in magenta). Exit code 1 if any screen differs.
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const [A,B,out]=[process.argv[2],process.argv[3],process.argv[4]||'/tmp/pm-endiff'];
if(!A||!B){console.log('usage: node tools/i18n_endiff.js base.html new.html [outDir]');process.exit(2)}
fs.mkdirSync(out,{recursive:true});
const TOUR=[
 ['title',async(p,E)=>{},800],
 ['setup',async(p,E)=>{await p.click('#new')},500],
 ['setup-custom',async(p,E)=>{await p.click('.sw:nth-child(2)');await p.click('.segb:nth-child(2)')},300],
 ['morning',async(p,E)=>{await p.click('#go')},2600],
 ['morning-choice',async(p,E)=>{await p.click('#sub');await p.waitForTimeout(300);await p.click('#sub');await p.waitForTimeout(300);await p.click('#sub')},2600],
 ['street',async(p,E)=>{await E(()=>{startMission('maya');go('street')})},1200],
 ['imani',async(p,E)=>{await E(()=>go('arrive'))},2600],
 ['maya',async(p,E)=>{await E(()=>go('maya'))},2600],
 ['maya-clue',async(p,E)=>{for(let i=0;i<4;i++){await p.click('#sub').catch(()=>{});await p.waitForTimeout(2700);const c=await p.$('.choice');if(c){await c.click();await p.waitForTimeout(2700)}}},300],
 ['workbench-memo',async(p,E)=>{await E(()=>{S.notes.rash=true;go('workbench')})},1200],
 ['glossary',async(p,E)=>{await p.click('.gw')},400],
 ['workbench-sheet',async(p,E)=>{await p.mouse.click(5,5);await E(()=>{curDoc='sheet';renderWorkbench()});await p.click('.step:nth-of-type(4) .sent')},600],
 ['workbench-record-told',async(p,E)=>{await E(()=>{document.querySelectorAll('.bubble').forEach(x=>x.remove());S.read={memo:1,record:1,sheet:1};S.told=true;curDoc='record';renderWorkbench()})},500],
 ['workbench-memo-told',async(p,E)=>{await E(()=>{curDoc='memo';renderWorkbench();document.querySelector('#upd').scrollIntoView({block:'center'})})},500],
 ['lesson',async(p,E)=>{await E(()=>openLesson('bones'))},1500],
 ['lesson-quiz',async(p,E)=>{await E(()=>{document.querySelector('.qopt').click();document.querySelector('.sheet-body').scrollTo(0,9999)})},600],
 ['criteria',async(p,E)=>{await E(()=>document.querySelectorAll('.sheet').forEach(x=>x.remove()));await E(()=>go('criteria'));await p.click('.critb:nth-child(1)');await p.click('.critb:nth-child(2)');await p.click('.critb:nth-child(3)')},400],
 ['table',async(p,E)=>{await E(()=>go('table'))},1400],
 ['table-why',async(p,E)=>{await p.click('#why');await E(()=>window.scrollTo(0,document.body.scrollHeight))},600],
 ['table-cast',async(p,E)=>{await E(()=>{S.choice={tx:'cast',pt:true,date:'moved'};go('table')})},1400],
 ['consent',async(p,E)=>{await E(()=>go('consent'))},900],
 ['consent-reply',async(p,E)=>{await p.click('.choice')},800],
 ['memo',async(p,E)=>{await E(()=>{S.memo='I recommend a cast with physical therapy because Maya had a rash from HX-2. It heals straight about 88 out of 100 times, and we can move her recital.';go('memo')})},600],
 ['memo-review',async(p,E)=>{await p.click('#rev')},900],
 ['reveal-end',async(p,E)=>{await E(()=>{S.result=null;go('reveal')})},5400],
 ['debrief',async(p,E)=>{await E(()=>go('debrief'))},1200],
 ['evening',async(p,E)=>{await E(()=>go('evening'))},1200],
 ['hub',async(p,E)=>{await E(()=>go('hub'))},900],
 ['guide',async(p,E)=>{await E(()=>openGuide())},700],
 ['words',async(p,E)=>{await E(()=>{document.querySelectorAll('.sheet').forEach(x=>x.remove());S.words=['radius','fracture','heals straight','consent'];openWords()})},700],
 ['chat',async(p,E)=>{await E(()=>{document.querySelectorAll('.sheet').forEach(x=>x.remove());openChat()})},700],
 ['menu',async(p,E)=>{await E(()=>{document.querySelectorAll('.sheet').forEach(x=>x.remove());openMenu()})},700],
 ['parent',async(p,E)=>{await E(()=>{document.querySelectorAll('.sheet').forEach(x=>x.remove());PARENT.open(true)})},900],
];
async function shoot(html,dir){const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,reducedMotion:'reduce'});const p=await ctx.newPage();
  const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.clock.setFixedTime(new Date('2026-11-02T09:00:00Z'));
  await p.addInitScript(()=>{window.__noaudio=1;try{localStorage.clear()}catch(e){}window.__seed=12345;Math.random=()=>{window.__seed=(window.__seed*1103515245+12345)%2147483648;return window.__seed/2147483648}});
  await p.goto('file://'+path.resolve(html));await p.evaluate(()=>{S.mute=true});const E=(f,a)=>p.evaluate(f,a);const shots={};
  // Before each capture: stop the scene loop, redraw one frame from a reset random seed, and stop SVG (SMIL) animations at t=0.
  // Toasts and speech bubbles disappear on wall-clock timers, so they are removed; every CSS animation and transition is
  // switched off while capturing (so no element sits on its own compositing layer), and the page's DOM is kept as well.
  const freeze=()=>E(()=>{if(typeof BG!=='undefined'){cancelAnimationFrame(BG.raf);BG.raf=-1;window.__seed=777;drawBg()}document.querySelectorAll('svg').forEach(s=>{try{s.pauseAnimations();s.setCurrentTime(0)}catch(e){}});
    document.querySelectorAll('.toast,.bubble,.pbubble,.burst').forEach(x=>x.remove());const st=document.createElement('style');st.id='endiff-still';st.textContent='*,*::before,*::after{animation:none!important;transition:none!important}';document.head.appendChild(st);
    return [...document.body.children].filter(e=>e.tagName!=='CANVAS'&&e.tagName!=='SCRIPT').map(e=>e.outerHTML).join('\n')});
  const thaw=()=>E(()=>{const st=document.getElementById('endiff-still');if(st)st.remove();if(typeof BG!=='undefined'&&BG.raf===-1){BG.raf=0;loopBg()}});
  const dom={};
  for(const [name,act,wait] of TOUR){await E(()=>{window.__seed=4242});try{await act(p,E)}catch(e){errs.push(name+': '+e.message)}await p.waitForTimeout(wait);
    await p.mouse.move(2,2);await p.waitForTimeout(60);dom[name]=await freeze();await p.waitForTimeout(60);shots[name]=await p.screenshot({animations:'disabled',caret:'hide'});await thaw();fs.writeFileSync(path.join(dir,name+'.png'),shots[name])}
  await b.close();return {shots,errs,dom}}
(async()=>{fs.mkdirSync(path.join(out,'base'),{recursive:true});fs.mkdirSync(path.join(out,'new'),{recursive:true});
  const a=await shoot(A,path.join(out,'base')),bb=await shoot(B,path.join(out,'new'));
  const b=await chromium.launch();const p=await b.newPage();const lines=[];let bad=0;
  for(const [name] of TOUR){const x=a.shots[name],y=bb.shots[name],sameDom=a.dom[name]===bb.dom[name];if(x.equals(y)){lines.push('identical  '+name+(sameDom?'':' (pixels equal, DOM differs)'));continue}
    if(!sameDom){fs.writeFileSync(path.join(out,name+'-dom-base.html'),a.dom[name]);fs.writeFileSync(path.join(out,name+'-dom-new.html'),bb.dom[name])}
    const r=await p.evaluate(async([x,y])=>{const load=s=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src='data:image/png;base64,'+s});const [i,j]=await Promise.all([load(x),load(y)]);
      const w=Math.max(i.width,j.width),h=Math.max(i.height,j.height),c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');
      g.drawImage(i,0,0);const d1=g.getImageData(0,0,w,h).data;g.clearRect(0,0,w,h);g.drawImage(j,0,0);const D=g.getImageData(0,0,w,h);const d2=D.data;let n=0,box=[w,h,0,0];
      for(let k=0;k<d1.length;k+=4){const px=(k/4)%w,py=Math.floor(k/4/w);if(d1[k]!==d2[k]||d1[k+1]!==d2[k+1]||d1[k+2]!==d2[k+2]){n++;box=[Math.min(box[0],px),Math.min(box[1],py),Math.max(box[2],px),Math.max(box[3],py)];d2[k]=255;d2[k+1]=0;d2[k+2]=255}else{d2[k+3]=60}}
      g.putImageData(D,0,0);return {n,box,png:c.toDataURL('image/png').split(',')[1]}},[x.toString('base64'),y.toString('base64')]);
    if(r.n===0){lines.push('identical  '+name+' (pixels equal, encoding differs)');continue}
    bad++;fs.writeFileSync(path.join(out,name+'-diff.png'),Buffer.from(r.png,'base64'));lines.push(`DIFFERENT  ${name}: ${r.n} pixels in x ${r.box[0]}-${r.box[2]}, y ${r.box[1]}-${r.box[3]}; DOM ${sameDom?'identical':'differs'}`)}
  await b.close();const rep=lines.join('\n')+`\n\n${TOUR.length-bad} of ${TOUR.length} screens identical.`+(a.errs.length||bb.errs.length?`\nerrors (base): ${a.errs.join('; ')||'none'}\nerrors (new): ${bb.errs.join('; ')||'none'}`:'');
  fs.writeFileSync(path.join(out,'report.txt'),rep+'\n');console.log(rep);process.exit(bad?1:0)})();
