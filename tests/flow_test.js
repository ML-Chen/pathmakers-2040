// Plays every mission's flow headlessly and reports page errors: node tests/flow_test.js dist/pathmakers.html
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.fulfill({status:200,body:''}));
 await p.goto('file://'+path.resolve(process.argv[2]||'dist/pathmakers.html'));await p.waitForTimeout(300);
 const ids=await p.evaluate(()=>Object.keys(MISSIONS));
 for(const id of ids){const r=await p.evaluate(async id=>{S.mute=true;startMission(id);const seen=[];for(let k=0;k<40;k++){seen.push(S.step);const f=M().flow.find(x=>x.name===S.step);if(!f)break;
     if(f.k==='criteria'){S.criteria=M().criteria.slice(0,2).map(c=>c.id)}
     if(f.k==='memo'){S.memo='I recommend this plan because it is safest. I am pretty sure, about 80 out of 100.';}
     if(f.k==='consent'){S.consent=true}
     if(f.k==='talk'){nextStep();continue}
     if(f.k==='reveal'){render();await new Promise(r=>setTimeout(r,50));nextStep();continue}
     render();await new Promise(r=>setTimeout(r,30));if(f.k==='evening'){go('hub');break}nextStep()}
   return seen.join(' > ')+' | completed:'+JSON.stringify(S.completed[id]||null)},id);console.log(id+': '+r)}
 await p.evaluate(()=>go('hub'));await p.waitForTimeout(200);console.log('hub cards:',await p.evaluate(()=>document.querySelectorAll('.mcard').length));
 console.log(errs.length?'ERRORS:\n'+errs.join('\n'):'no errors');await b.close();process.exit(errs.length?1:0)})();
