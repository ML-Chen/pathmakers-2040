// Records a canonical playthrough video of every mission at phone size (390x844):
//   node tools/playthrough_video.js dist/pathmakers.html OUT [missionId ...]
// Writes OUT/<id>.mp4 per mission and OUT/playthrough.mp4 (all missions joined), plus OUT/errors.txt.
// It plays like a patient player: reads each line, answers each choice, tells Byte the clue, picks goals, tries the
// Future Table, explains the plan, writes and signs the decision, and watches the outcome. Custom screens are shown
// and scrolled, then the flow moves on. Needs ffmpeg on PATH to turn the recordings into mp4.
const {chromium}=require('playwright');const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
const [html,out='/tmp/pm-video',...only]=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
const W=390,H=844,sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await chromium.launch();const errs=[];
  const probe=await b.newPage();await probe.goto('file://'+path.resolve(html));await sleep(500);
  const ids=only.length?only:await probe.evaluate(()=>{const ms=Object.values(MISSIONS);const order=m=>[(m.year||1),{spring:0,summer:1,fall:2,winter:3}[m.season]??0,m.day||0];
    return ms.sort((a,b)=>{const x=order(a),y=order(b);return x[0]-y[0]||x[1]-y[1]||x[2]-y[2]}).map(m=>m.id)});await probe.close();
  const made=[];
  for(const id of ids){const t0=Date.now();
    const ctx=await b.newContext({viewport:{width:W,height:H},recordVideo:{dir:path.join(out,'raw'),size:{width:W,height:H}}});
    const p=await ctx.newPage();p.on('pageerror',e=>errs.push(id+': '+e.message));
    await p.addInitScript(()=>{window.__noaudio=1;try{localStorage.clear()}catch(e){}});
    await p.goto('file://'+path.resolve(html));await sleep(600);
    const E=(f,a)=>p.evaluate(f,a);
    await E(id=>{S.mute=true;S.playAll=true;startMission(id)},id);await sleep(1600);
    const flow=await E(()=>M().flow.map(f=>({name:f.name,k:f.k})));
    for(let guard=0;guard<flow.length*2+4;guard++){const step=await E(()=>S.step);const f=flow.find(x=>x.name===step);if(!f)break;
      if(f.k==='talk'){for(let n=0;n<40&&await E(()=>S.step)===step;n++){
          const st=await E(()=>({clue:!!document.querySelector('#choices .clue'),choices:document.querySelectorAll('#choices .choice:not(.ghost)').length}));
          await sleep(1300);
          if(st.clue)await E(()=>document.querySelector('#choices .clue').click());
          else if(st.choices)await E(()=>{const cs=[...document.querySelectorAll('#choices .choice:not(.ghost)')];(cs.find(b=>!/wow|old|get me a job/i.test(b.textContent))||cs[0]).click()});
          else await E(()=>{const s=document.querySelector('#sub');if(s)s.click();else nextStep()});
          await sleep(500)}
        continue}
      if(f.k==='bench'){await E(()=>{if(M().knows&&!S.told){S.told=true;save()}});}
      if(f.k==='criteria'){await sleep(1200);await E(()=>{S.criteria=M().criteria.slice(0,2).map(c=>c.id);renderCriteria()});}
      if(f.k==='table'){await sleep(1500);const ctl=await E(()=>M().controls.map(c=>[c.key,c.opts.map(o=>o[0])]));
        for(const [k,vs] of ctl.slice(0,2))for(const v of vs){await E(([k,v])=>{S.choice={...S.choice,[k]:v};renderTable()},[k,v]);await sleep(1300)}}
      if(f.k==='consent'){await sleep(1500);await E(()=>{const cs=[...document.querySelectorAll('.choice')];const i=cs.findIndex((b,j)=>true);});
        const n=await E(()=>document.querySelectorAll('.choice').length);
        for(let j=0;j<n;j++){const good=await E(j=>{renderConsent();const b=document.querySelectorAll('.choice')[j];b.click();return S.consent},j);await sleep(2200);if(good)break}}
      if(f.k==='memo'){await E(()=>{S.memo=`I recommend ${M().planName(S.choice)} because it fits what matters most to the people involved. I am pretty sure, about 80 out of 100.`;renderMemo()});await sleep(2500)}
      if(f.k==='reveal')await sleep(4500);
      // show the screen, scroll through it like a reader, then move on
      await sleep(1500);const h=await E(()=>document.documentElement.scrollHeight);
      for(let y=0;y<h-H;y+=360){await E(y=>window.scrollTo({top:y,behavior:'smooth'}),y);await sleep(900)}
      if(f.k==='evening'){await sleep(1500);break}
      await E(()=>{window.scrollTo(0,0);nextStep()});await sleep(900)}
    const v=p.video();await ctx.close();const raw=await v.path();
    const mp4=path.join(out,id+'.mp4');
    try{execFileSync('ffmpeg',['-y','-loglevel','error','-i',raw,'-vf','scale=390:844,fps=30','-c:v','libx264','-preset','veryfast','-crf','26','-pix_fmt','yuv420p','-an',mp4]);made.push(mp4)}catch(e){errs.push(id+': ffmpeg failed')}
    console.log(`${id}: ${((Date.now()-t0)/1000).toFixed(0)}s recorded`)}
  if(made.length){const list=path.join(out,'list.txt');fs.writeFileSync(list,made.map(m=>`file '${path.resolve(m)}'`).join('\n'));
    try{execFileSync('ffmpeg',['-y','-loglevel','error','-f','concat','-safe','0','-i',list,'-c','copy',path.join(out,'playthrough.mp4')])}catch(e){errs.push('concat failed')}}
  fs.rmSync(path.join(out,'raw'),{recursive:true,force:true});
  fs.writeFileSync(path.join(out,'errors.txt'),errs.join('\n'));console.log(made.length+' videos; errors: '+(errs.join('\n')||'none'));await b.close();process.exit(errs.length?1:0)})();
