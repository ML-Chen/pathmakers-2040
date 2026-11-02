// Plays every mission's flow headlessly and fails on problems: node tests/flow_test.js dist/pathmakers.html
// A mission fails if the page logs an error, a step renders the day planner instead of its own screen
// (an unknown step kind or a missing custom screen), it never reaches its last step, or "Plan tomorrow"
// does not record it in S.completed. The hub must show one card per mission.
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[],fails=[];
 p.on('pageerror',e=>errs.push('pageerror: '+e.message));
 p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push('console: '+m.text())});
 await p.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.fulfill({status:200,body:''}));
 await p.addInitScript(()=>{window.__noaudio=1;try{localStorage.clear()}catch(e){}});
 await p.goto('file://'+path.resolve(process.argv[2]||'dist/pathmakers.html'));await p.waitForTimeout(300);
 const ids=await p.evaluate(()=>Object.keys(MISSIONS));if(!ids.length)fails.push('MISSIONS is empty');
 // cast keys are global: two missions using one key for different people would draw one of them as the other
 const clash=await p.evaluate(()=>{const seen={},out=[];for(const m of Object.values(MISSIONS))for(const k in (m.cast||{})){const n=m.cast[k].name;if(seen[k]&&seen[k].n!==n)out.push(`cast key "${k}" is ${seen[k].n} in ${seen[k].id} and ${n} in ${m.id}`);else if(!seen[k])seen[k]={n,id:m.id}}return out});
 clash.forEach(x=>fails.push(x));
 for(const id of ids){const r=await p.evaluate(async id=>{S.mute=true;S.completed={};startMission(id);const flow=M().flow,seen=[],bad=[];
     for(let k=0;k<2*flow.length+5;k++){const f=flow.find(x=>x.name===S.step);if(!f)break;seen.push(S.step);
       if(f.k==='criteria'){S.criteria=M().criteria.slice(0,2).map(c=>c.id)}
       if(f.k==='memo'){S.memo='I recommend this plan because it is safest. I am pretty sure, about 80 out of 100.';}
       if(f.k==='consent'){S.consent=true}
       if(f.k==='reveal')S.result=null;
       render();await new Promise(r=>setTimeout(r,f.k==='reveal'?80:30));
       if(f.k!=='evening'&&/\bhub\b/.test(APP.className)&&!/hub/.test(f.name))bad.push(`step "${f.name}" (${f.k}) rendered the day planner`);
       if(!APP.innerHTML.trim())bad.push(`step "${f.name}" (${f.k}) rendered nothing`);
       // every Future Table picture must actually draw something (a missing vignette leaves an empty frame)
       if(f.k==='table'){const empty=[...document.querySelectorAll('.fut svg.vig')].filter(v=>!v.querySelector('g[clip-path] *')).length;if(empty)bad.push(`step "${f.name}": ${empty} Future Table pictures are blank`)}
       if(f.k==='evening'){const b=document.querySelector('#plan');if(b)b.click();else bad.push('evening has no "Plan tomorrow" button');break}
       nextStep()}
     const last=flow[flow.length-1].name;if(seen[seen.length-1]!==last)bad.push(`stopped at "${seen[seen.length-1]}", never reached "${last}"`);
     const missing=flow.map(f=>f.name).filter(n=>!seen.includes(n));if(missing.length)bad.push('skipped steps: '+missing.join(', '));
     if(!S.completed[id])bad.push('not recorded in S.completed');if(S.step!=='hub')bad.push(`ended on "${S.step}" instead of the day planner`);
     return {line:seen.join(' > ')+' | completed:'+JSON.stringify(S.completed[id]||null),bad}},id);
   console.log(id+': '+r.line);r.bad.forEach(x=>fails.push(id+': '+x))}
 await p.evaluate(()=>go('hub'));await p.waitForTimeout(200);
 // The hub is either the old day planner (cards on one screen) or the world map (cards on each place's planner).
 const cards=await p.evaluate(async()=>{const seen=new Set();const grab=()=>document.querySelectorAll('.mcard[data-m]').forEach(b=>seen.add(b.dataset.m));grab();
   if(typeof PLACES!=='undefined')for(const k of Object.keys(PLACES)){S.place=k;try{go('place')}catch(e){}await new Promise(r=>setTimeout(r,30));grab()}
   return seen.size});
 console.log('hub cards:',cards);if(cards!==ids.length)fails.push(`hub shows ${cards} mission cards for ${ids.length} missions`);
 const all=fails.concat(errs);console.log(all.length?'FAILURES:\n'+all.join('\n'):'no errors');await b.close();process.exit(all.length?1:0)})();
