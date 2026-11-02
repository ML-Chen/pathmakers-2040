// Phone-size (390x844) screenshots of every mission in MISSIONS, plus a labeled contact sheet per mission.
//   node tools/mission_shots.js dist/pathmakers.html OUT [missionId ...]
// Writes OUT/<group>/NNN-<label>.png, OUT/sheets/<group>.png, OUT/index.html, OUT/manifest.json and OUT/errors.txt.
// Groups are "shared" (title, setup, day planner, sheets) and one per mission id. Nothing here is mission-specific:
// it walks each mission's flow and handles every step kind the engine knows (see the header of src/missions.js).
// Exits 1 if the page logged an error, a step fell back to another screen, or a mission did not reach the day planner.
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const html=path.resolve(process.argv[2]||'dist/pathmakers.html'),out=path.resolve(process.argv[3]||'/tmp/pm-mission-shots'),only=process.argv.slice(4);
const W=390,H=844,PARALLEL=+(process.env.SHOTS_PARALLEL||3);
const slug=s=>String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,48);
const escHTML=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

async function newPage(browser,errs,tag){
  const ctx=await browser.newContext({viewport:{width:W,height:H},deviceScaleFactor:1});const p=await ctx.newPage();
  p.on('pageerror',e=>errs.push(`[${tag}] pageerror: ${e.message}`));
  p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push(`[${tag}] console: ${m.text()}`)});
  await p.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.fulfill({status:200,body:''}));
  await p.addInitScript(()=>{window.__noaudio=1;try{localStorage.clear()}catch(e){}});
  await p.goto('file://'+html);await p.waitForTimeout(400);await p.evaluate(()=>{S.mute=true});
  return {p,ctx};
}

// One recorder per group: numbered files plus a manifest entry with the label shown on the contact sheet.
function recorder(p,group){const dir=path.join(out,group);fs.mkdirSync(dir,{recursive:true});const shots=[];let n=0;
  const shot=async(label,wait=500)=>{await p.waitForTimeout(wait);const file=String(++n).padStart(3,'0')+'-'+slug(label)+'.png';
    await p.screenshot({path:path.join(dir,file)});shots.push({file:group+'/'+file,label});};
  return {shot,shots};
}

async function shared(browser,errs){
  const {p,ctx}=await newPage(browser,errs,'shared');const {shot,shots}=recorder(p,'shared');const E=(f,a)=>p.evaluate(f,a);
  await shot('title',800);
  await p.click('#new');await shot('setup');
  await p.click('.sw:nth-child(4)');await p.click('[data-e="pointy"]');await shot('setup, color and ears changed',300);
  await E(()=>{S.completed={};go('hub')});await shot('day planner, new game',900);
  await E(()=>{for(const id in MISSIONS)S.completed[id]={stars:3};go('hub')});await shot('day planner, all done',900);
  await E(()=>openGuide());await shot('Field Guide, none found',700);
  await E(()=>{document.querySelectorAll('.sheet').forEach(x=>x.remove());S.guide=Object.keys(FIELD_GUIDE);openGuide()});await shot('Field Guide, all found',700);
  await E(()=>{document.querySelectorAll('.sheet').forEach(x=>x.remove());S.words=Object.keys(GLOSSARY).slice(0,8);openWords()});await shot('Word Book',700);
  await E(()=>{document.querySelectorAll('.sheet').forEach(x=>x.remove());openMenu()});await shot('Menu',700);
  await E(()=>{document.querySelectorAll('.sheet').forEach(x=>x.remove());openChat()});await shot('chat',700);
  await ctx.close();return shots;
}

async function mission(browser,errs,id){
  const {p,ctx}=await newPage(browser,errs,id);const {shot,shots}=recorder(p,id);const E=(f,a)=>p.evaluate(f,a);
  const problems=[];const note=m=>{problems.push(m);errs.push(`[${id}] ${m}`)};
  await E(id=>{S.completed={};startMission(id)},id);await p.waitForTimeout(300);
  const flow=await E(()=>M().flow.map(f=>({name:f.name,k:f.k})));
  const clearSheets=()=>E(()=>document.querySelectorAll('.sheet,.signing').forEach(x=>x.remove()));
  for(const f of flow){
    const at=await E(()=>S.step);
    if(at!==f.name){await E(n=>go(n),f.name);await p.waitForTimeout(200)}
    // The engine falls back to the day planner for an unknown step kind or custom screen; catch that.
    const cls=await E(()=>APP.className);if(f.k!=='evening'&&/\bhub\b/.test(cls)&&!/hub/.test(f.name)){note(`step "${f.name}" (${f.k}) rendered the day planner instead`)}
    const L=(s)=>f.name+(s?' · '+s:'');
    if(f.k==='talk'){
      // Show each line in full (skip the timed reveal), shoot it, answer choices with the first option.
      for(let i=1;i<=120&&await E(n=>S.step===n,f.name);i++){
        const st=await E(()=>{const h=document.querySelector('#hint'),c=document.querySelectorAll('#choices .choice').length;if(h&&h.hidden&&!c)document.querySelector('#sub').click();
          return {who:(document.querySelector('#who b')||{}).textContent||'',clue:!!document.querySelector('#choices .clue'),choices:document.querySelectorAll('#choices .choice').length}});
        await shot(L(i+' '+st.who),350);
        if(st.clue){await E(()=>document.querySelector('#choices .clue').click());await p.waitForTimeout(250);continue}
        if(st.choices){await E(()=>document.querySelector('#choices .choice').click());await p.waitForTimeout(300);
          await E(()=>{const h=document.querySelector('#hint');if(h&&h.hidden)document.querySelector('#sub').click()});await shot(L(i+' reply'),350)}
        await E(()=>document.querySelector('#sub')&&document.querySelector('#sub').click());await p.waitForTimeout(250);
      }
      if(await E(n=>S.step===n,f.name))note(`conversation "${f.name}" never ended`);
      continue;
    }
    if(f.k==='bench'){
      const docs=await E(()=>M().docs.map(d=>({id:d.id,title:d.title.split(':')[0],steps:d.steps.length})));
      let gloss=false;
      for(const d of docs){await E(id=>{curDoc=id;renderWorkbench()},d.id);await shot(L(d.title),900);
        if(!gloss&&await E(()=>!!document.querySelector('.doc .gw'))){gloss=true;await E(()=>document.querySelector('.doc .gw').click());await shot(L('word definition'),400);await p.mouse.click(5,5);await clearSheets()}
        for(let i=1;i<d.steps;i++){await E(i=>{const s=document.querySelectorAll('.step')[i];s&&s.scrollIntoView({block:'center'})},i);await shot(L(d.title+' '+(i+1)),450)}}
      const tell=await E(()=>{const T=M().tell;if(!T)return null;S.notes[T.clue]=true;renderWorkbench();return T.label});
      if(tell){await E(()=>document.querySelector('.bench-foot').scrollIntoView({block:'end'}));await shot(L('clue noticed'),500);
        await E(()=>document.querySelector('#tell')&&document.querySelector('#tell').click());await shot(L('after telling '+'Byte'),1200)}
      if(await E(()=>!!M().lesson)){await E(()=>openLesson(M().lesson.id));await shot(L('lesson'),1500);
        await E(()=>{const o=document.querySelector('.qopt');o&&o.click();const b=document.querySelector('.sheet-body');b&&b.scrollTo(0,9999)});await shot(L('lesson check'),600);await clearSheets()}
    }
    else if(f.k==='criteria'){await shot(L('empty'),500);await E(()=>[...document.querySelectorAll('.critb')].slice(0,3).forEach(b=>b.click()));await shot(L('picked'),400)}
    else if(f.k==='table'){
      const ctl=await E(()=>{const c=(M().controls||[])[0];return c?{key:c.key,opts:c.opts.map(o=>[o[0],o[1]])}:null});
      await shot(L(await E(()=>M().planName(S.choice))),1400);
      await E(()=>{const w=document.querySelector('#why');w&&w.click();window.scrollTo(0,document.body.scrollHeight)});await shot(L('why'),500);
      if(ctl)for(const [v,label] of ctl.opts){await E(([k,v])=>{S.choice={...S.choice,[k]:v};renderTable()},[ctl.key,v]);await shot(L(label),1400)}
    }
    else if(f.k==='consent'){await shot(L(),900);const n=await E(()=>document.querySelectorAll('.choice').length);
      for(let j=0;j<n;j++){await E(j=>{renderConsent();document.querySelectorAll('.choice')[j].click()},j);await shot(L('answer '+(j+1)),900)}
      await E(()=>{S.consent=true})}
    else if(f.k==='memo'){await shot(L('empty'),600);
      await E(()=>{S.memo=`I recommend ${M().planName(S.choice)} because it fits what matters most here. I am pretty sure, about 80 out of 100. We will check by looking again in a week.`;renderMemo();document.querySelector('#rev').click()});
      await shot(L('written and reviewed'),900);await E(()=>document.querySelector('#sign').click());await shot(L('signed'),600);await p.waitForTimeout(1300);await clearSheets()}
    else if(f.k==='reveal'){await E(n=>{S.result=null;go(n)},f.name);await shot(L('start'),600);await shot(L('end'),5200)}
    else if(f.k==='debrief'){await shot(L(),1200);await E(()=>window.scrollTo(0,document.body.scrollHeight));await shot(L('bottom'),500)}
    else if(f.k==='evening'){await shot(L(),1200);await E(()=>{const b=document.querySelector('#plan');b?b.click():nextStep()});await p.waitForTimeout(500);break}
    else{await shot(L(),1200); // custom and any future kind
      // extra states the mission lists for this step in shots:{stepName:[{label, run()}]}; run() is called in the page
      const extra=await E(n=>((M().shots||{})[n]||[]).map(x=>x.label),f.name);
      for(let i=0;i<extra.length;i++){await E(([n,i])=>{document.querySelectorAll('.sheet,.bubble').forEach(x=>x.remove());M().shots[n][i].run()},[f.name,i]);await shot(L(extra[i]),1000)}
      if(extra.length){await clearSheets();await E(n=>go(n),f.name);await p.waitForTimeout(200)}}
    if(await E(n=>S.step===n,f.name))await E(()=>nextStep());await p.waitForTimeout(150);
  }
  const end=await E(id=>({step:S.step,done:!!S.completed[id]}),id);
  if(!end.done)note(`mission did not complete (ended on step "${end.step}")`);
  await shot('day planner after '+id,900);
  await ctx.close();return shots;
}

function sheetHTML(title,shots){
  return `<!doctype html><meta charset="utf-8"><style>body{margin:0;padding:24px;background:#16181d;color:#e9ecf2;font:14px/1.3 system-ui,sans-serif;width:${6*215-16}px}
  h1{font-size:26px;margin:0 0 18px}.g{display:grid;grid-template-columns:repeat(6,195px);gap:20px}
  figure{margin:0}img{width:195px;height:422px;display:block;border-radius:10px;border:1px solid #333a46}figcaption{margin-top:6px;height:34px;overflow:hidden;font-size:12px;color:#c3c9d4}b{color:#fff}</style>
  <h1>${escHTML(title)}</h1><div class="g">${shots.map((s,i)=>`<figure><img src="../${s.file}"><figcaption><b>${i+1}</b> ${escHTML(s.label)}</figcaption></figure>`).join('')}</div>`;
}

(async()=>{
  fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(path.join(out,'sheets'),{recursive:true});
  const browser=await chromium.launch();const errs=[];
  const {p:probe,ctx:pc}=await newPage(browser,errs,'probe');
  const info=await probe.evaluate(()=>Object.values(MISSIONS).map(m=>({id:m.id,title:m.title,career:(CAREERS[m.career]||{}).name||m.career,day:m.day})));await pc.close();
  const missions=info.filter(m=>!only.length||only.includes(m.id));
  const groups=[{id:'shared',title:'Shared screens',run:()=>shared(browser,errs)}].concat(missions.map(m=>({id:m.id,title:`${m.title} (${m.career}, Day ${m.day})`,run:()=>mission(browser,errs,m.id)})));
  const results={};let next=0;
  await Promise.all(Array.from({length:Math.min(PARALLEL,groups.length)},async()=>{while(next<groups.length){const g=groups[next++];const t0=Date.now();
    try{results[g.id]=await g.run()}catch(e){errs.push(`[${g.id}] crashed: ${e.stack||e}`);results[g.id]=results[g.id]||[]}
    console.log(`${g.id}: ${results[g.id].length} shots in ${((Date.now()-t0)/1000).toFixed(1)}s`)}}));
  // Contact sheets: one tall PNG per group, rendered by the same browser.
  const cp=await (await browser.newContext({viewport:{width:1300,height:900},deviceScaleFactor:1})).newPage();
  for(const g of groups){const f=path.join(out,'sheets',g.id+'.html');fs.writeFileSync(f,sheetHTML(g.title,results[g.id]||[]));
    await cp.goto('file://'+f);await cp.waitForLoadState('load');await cp.screenshot({path:path.join(out,'sheets',g.id+'.png'),fullPage:true});fs.rmSync(f)}
  const manifest=groups.map(g=>({id:g.id,title:g.title,shots:results[g.id]||[]}));
  fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,1));
  fs.writeFileSync(path.join(out,'index.html'),`<!doctype html><meta charset="utf-8"><title>Pathmakers screenshots</title><style>body{background:#16181d;color:#e9ecf2;font:15px system-ui,sans-serif;margin:24px}a{color:#9ec5ff}img{max-width:100%}</style>
    <h1>Pathmakers screenshots</h1><ul>${manifest.map(g=>`<li><a href="#${g.id}">${escHTML(g.title)}</a> (${g.shots.length})</li>`).join('')}</ul>
    ${errs.length?`<h2>Errors</h2><pre>${escHTML(errs.join('\n'))}</pre>`:'<p>No errors.</p>'}
    ${manifest.map(g=>`<h2 id="${g.id}">${escHTML(g.title)}</h2><a href="sheets/${g.id}.png"><img src="sheets/${g.id}.png"></a>`).join('')}`);
  fs.writeFileSync(path.join(out,'errors.txt'),errs.join('\n'));
  const total=manifest.reduce((a,g)=>a+g.shots.length,0);
  console.log(`${total} shots across ${manifest.length} groups in ${out}; errors: ${errs.length?'\n'+errs.join('\n'):'none'}`);
  await browser.close();process.exit(errs.length?1:0);
})();
