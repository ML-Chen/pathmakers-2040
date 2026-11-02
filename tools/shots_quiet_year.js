// Screenshots of the Lantern Garden (Quiet Year memorial) at phone size: node tools/shots_quiet_year.js dist/pathmakers.html OUT
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const [html,out]=[process.argv[2],process.argv[3]||'/tmp/pm-qy'];fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
 const errs=[];p.on('pageerror',e=>errs.push('pageerror: '+e.message));p.on('console',m=>m.type()==='error'&&errs.push('console: '+m.text()));
 await p.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.fulfill({status:200,body:''}));
 await p.addInitScript(()=>{window.__noaudio=1;try{localStorage.clear()}catch(e){}});
 await p.goto('file://'+path.resolve(html));let n=0;const shot=async(name,w=500)=>{await p.waitForTimeout(w);await p.screenshot({path:path.join(out,String(++n).padStart(2,'0')+'-'+name+'.png')})};
 const E=(f,a)=>p.evaluate(f,a);
 await E(()=>{S.mute=true;S.completed.maya={stars:3};go('hub')});await shot('hub',900);
 await E(()=>startMission('quietyear'));await shot('arrive',1400);
 for(let i=0;i<3;i++){await p.click('#sub');await p.waitForTimeout(400);await p.click('#sub').catch(()=>{});await p.waitForTimeout(400)}
 const c=await p.$('.choice');if(c){await shot('arrive-choice',300);await c.click();await shot('arrive-reply',900)}
 await E(()=>go('qy_garden'));await shot('garden',1500);
 await p.click('.qy-item[data-i="3"]',{force:true});await shot('item-slip',700);
 await E(()=>document.querySelector('.sheet .x').click());await shot('garden-after',1200);
 await E(()=>{S.qyFound={phone:1,sign:1,sensor:1,slip:1,sticker:1,drawing:1};go('qy_garden')});await shot('garden-all',1200);
 await E(()=>go('qy_table_talk'));await shot('table-talk',1400);
 await E(()=>{S.qyOn={};go('qy_table')});await shot('table-none',1200);
 await p.click('.qy-layer[data-l="screen"]');await shot('table-one',700);
 await p.click('.qy-layer[data-l="sensor"]');await shot('table-two',700);
 await p.click('.qy-layer[data-l="vax"]');await p.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));await shot('table-three',700);
 await E(()=>go('qy_lantern'));await p.click('[data-t="the screeners"]');await shot('lantern',700);
 await E(()=>go('qy_goodbye'));await shot('goodbye',1400);
 await E(()=>go('qy_evening'));await shot('evening',1200);
 await E(()=>{S.completed.quietyear={stars:3};go('hub')});await shot('hub-done',900);
 await E(()=>openGuide());await shot('guide',700);
 fs.writeFileSync(path.join(out,'errors.txt'),errs.join('\n'));console.log(n+' shots; errors: '+(errs.join('\n')||'none'));await b.close()})();
