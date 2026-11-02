// Screenshots of one mission at phone size, step by step: node tools/mission_shots.js dist/pathmakers.html /tmp/out <missionId>
// Talk scenes: one shot per line (and per reply). Workbench: a full-page shot of every document. Future Table: the start plan,
// then every option of every control (one change at a time) and every outcome vignette. Consent: every reply. Errors go to errors.txt.
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const [html,out,id]=[process.argv[2],process.argv[3]||'/tmp/mission-shots',process.argv[4]];if(!id){console.error('usage: mission_shots.js page.html outDir missionId');process.exit(2)}
fs.mkdirSync(out,{recursive:true});for(const f of fs.readdirSync(out))if(/\.(png|txt)$/.test(f))fs.unlinkSync(path.join(out,f));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
 const errs=[];p.on('pageerror',e=>errs.push('pageerror: '+e.message));p.on('console',m=>m.type()==='error'&&errs.push('console: '+m.text()));
 await p.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.fulfill({status:200,body:''}));
 await p.addInitScript(()=>{try{localStorage.clear()}catch(e){}});
 await p.goto('file://'+path.resolve(html));await p.waitForTimeout(300);
 let n=0;const shot=async(name,w=500,full=false)=>{await p.waitForTimeout(w);await p.screenshot({path:path.join(out,String(++n).padStart(3,'0')+'-'+name+'.png'),fullPage:full})};
 const E=(f,a)=>p.evaluate(f,a);
 const flow=await E(id=>{S.mute=true;if(!MISSIONS[id])return null;S.completed={};startMission(id);return M().flow.map(f=>({name:f.name,k:f.k}))},id);
 if(!flow){console.error('no mission '+id);process.exit(2)}
 for(const f of flow){await E(n=>{window.__st=n;go(n)},f.name);
  if(f.k==='talk'){for(let i=0;i<40;i++){await p.waitForFunction(()=>document.querySelectorAll('#choices .choice').length||(document.querySelector('#hint')&&!document.querySelector('#hint').hidden)||S.step!==window.__st,null,{timeout:3500}).catch(()=>{});await shot(f.name+'-'+i,200);const st=await E(()=>({ch:document.querySelectorAll('#choices .choice').length,step:S.step}));if(st.step!==f.name)break;
      if(st.ch){await p.click('#choices .choice');await p.waitForFunction(()=>document.querySelectorAll('#choices .choice').length||(document.querySelector('#hint')&&!document.querySelector('#hint').hidden),null,{timeout:3500}).catch(()=>{});await shot(f.name+'-'+i+'-reply',200);if(await E(()=>document.querySelectorAll('#choices .choice').length))await p.click('#choices .choice').catch(()=>{})}
      const before=await E(()=>document.querySelector('#line')&&document.querySelector('#line').textContent);await p.click('#sub').catch(()=>{});await p.waitForTimeout(150);
      if(await E(()=>!document.querySelector('#hint')||!document.querySelector('#hint').hidden))await p.click('#sub').catch(()=>{});
      await p.waitForTimeout(200);const now=await E(()=>({step:S.step,line:document.querySelector('#line')&&document.querySelector('#line').textContent}));if(now.step!==f.name)break;if(now.line===before)await p.click('#sub').catch(()=>{})}
    continue}
  if(f.k==='bench'){const docs=await E(()=>M().docs.map(d=>d.id));for(const d of docs){await E(d=>{curDoc=d;renderWorkbench()},d);await shot('bench-'+d,900,true)}
    if(await E(()=>!!M().tell)){await E(()=>{S.told=true;renderWorkbench()});await shot('bench-told',700,true)}
    if(await E(()=>!!M().lesson)){await E(()=>openLesson(M().lesson.id));await shot('lesson',1200,true);await E(()=>document.querySelectorAll('.sheet').forEach(x=>x.remove()))}
    await E(()=>{S.read=Object.fromEntries(M().docs.map(d=>[d.id,1]))});continue}
  if(f.k==='criteria'){await shot('criteria',600);const cs=await E(()=>M().criteria.length);for(let j=1;j<=Math.min(3,cs);j++)await p.click('.critb:nth-child('+j+')').catch(()=>{});await shot('criteria-picked',300);continue}
  if(f.k==='table'){await shot('table-start',1300,true);await p.click('#why').catch(()=>{});await shot('table-why',500,true);
    const ctl=await E(()=>M().controls.map(c=>({key:c.key,opts:c.opts.map(o=>o[0])})));
    for(const c of ctl)for(const v of c.opts){await E(([k,v])=>{S.choice={...M().start,[k]:v};go(S.step)},[c.key,v]);await shot('table-'+c.key+'-'+String(v),1200,true)}
    const kinds=await E(()=>{const ks=new Set();for(const pl of allPlans())for(const o of M().outcomes(pl,true))ks.add(o.kind);for(const pl of allPlans())for(const o of M().outcomes(pl,false))ks.add(o.kind);return [...ks]});
    await E(ks=>{document.body.insertAdjacentHTML('beforeend',`<div id="vigs" style="position:fixed;inset:0;z-index:99;background:#fff;display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px;overflow:auto">${ks.map(k=>`<div style="border:1px solid #ccc;border-radius:12px;overflow:hidden"><div style="font:12px sans-serif;padding:2px 6px">${k}</div>${vig(k)}</div>`).join('')}</div>`)},kinds);
    await shot('vignettes',600);await E(()=>document.getElementById('vigs').remove());await E(()=>{S.choice={...M().start}});continue}
  if(f.k==='consent'){await shot('consent',900);const no=await E(()=>M().consent.opts(S.choice,M()).length);for(let j=0;j<no;j++){await E(()=>renderConsent());await p.waitForTimeout(300);await p.click(`.choice[data-j="${j}"]`);await shot('consent-reply-'+j,900)}continue}
  if(f.k==='memo'){await shot('memo-empty',600);await E(()=>{S.memo='I recommend this plan because it fits what matters most to them. I am pretty sure, about 80 out of 100. We will check in a week.';go(S.step)});await shot('memo',800,true);continue}
  if(f.k==='reveal'){await E(()=>{S.result=null;go(S.step)});await shot('reveal-start',700);await shot('reveal-end',6000);continue}
  await shot(f.name,1300,f.k==='debrief')}
 await E(()=>go('hub'));await shot('hub',900);
 fs.writeFileSync(path.join(out,'errors.txt'),errs.join('\n'));console.log(n+' shots in '+out+'; errors: '+(errs.join('\n')||'none'));await b.close()})();
