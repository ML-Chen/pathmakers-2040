// Screenshots of the "Getting Hired" career journey at phone size: node tools/hired_shots.js dist/pathmakers.html /tmp/pm-hired
// Starts a new game from the title screen and plays the journey mostly by tapping, the way a player would.
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const [html,out]=[process.argv[2],process.argv[3]||'/tmp/pm-hired'];fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
 const errs=[];p.on('pageerror',e=>errs.push('pageerror: '+e.message));p.on('console',m=>m.type()==='error'&&errs.push('console: '+m.text()));
 await p.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.fulfill({status:200,body:''}));
 await p.addInitScript(()=>{window.__noaudio=1;try{localStorage.clear()}catch(e){}});
 await p.goto('file://'+path.resolve(html));let n=0;const shot=async(name,w=500)=>{await p.waitForTimeout(w);await p.screenshot({path:path.join(out,String(++n).padStart(2,'0')+'-'+name+'.png')})};
 const E=(f,a)=>p.evaluate(f,a);const W=ms=>p.waitForTimeout(ms);
 // tap through a talk screen: pick the first choice (or the clue button) whenever one appears; stop when the step changes
 const talkThrough=async(pick=0,maxTaps=30,stopWhen)=>{const s0=await E(()=>S.step+'|'+document.querySelector('#who')?.textContent);
   for(let i=0;i<maxTaps;i++){if(stopWhen&&await E(stopWhen))return;const c=await p.$$('.choice');if(c.length){await c[Math.min(pick,c.length-1)].click();await W(350);continue}
     const sub=await p.$('#sub');if(!sub)return;await sub.click().catch(()=>{});await W(250);await sub.click().catch(()=>{});await W(250)}};
 await E(()=>{S.mute=true});
 await p.click('#new');await W(300);await p.click('#go');await shot('home',1200);
 await talkThrough(0,12,()=>S.step!=='h-home');
 await shot('explore-1',1400);await p.click('#dnext');await shot('explore-2',1400);await p.click('#dnext');await shot('explore-3',1400);await p.click('#dnext');await shot('explore-4',1400);await p.click('#dnext');await shot('explore-5',1400);
 await p.click('#dnext');await shot('ask-byte',600);
 await p.click('.hj-q[data-q="1"]');await W(300);await p.click('.hj-q[data-q="4"]');await W(300);await p.click('.hj-q[data-q="0"]');await shot('ask-byte-answered',600);
 await p.click('#go');await shot('openhouse',1200);
 // Bea: good intro, write the cat in the notebook, carry the bears
 await p.click('.oh-card[data-p="bea"]');await shot('bea',1200);await talkThrough(0,20,()=>!document.querySelector('#sub'));await shot('openhouse-after-bea',900);
 await p.click('.oh-card[data-p="kofi"]');await W(900);await talkThrough(0,20,()=>!document.querySelector('#sub'));
 await p.click('.oh-card[data-p="ruth"]');await shot('ruth',1200);await talkThrough(0,20,()=>!document.querySelector('#sub'));await shot('openhouse-glasses',900);
 await p.click('#glasses');await shot('openhouse-all',1400);
 await p.click('#go');await shot('reyes',1400);await talkThrough(0,8,()=>/imani/.test(S.step)||document.querySelector('#line')?.textContent.includes('notice kindness'));await shot('reyes-referral',600);
 await talkThrough(0,20,()=>S.step!=='h-reyes');
 await shot('ari',1400);await talkThrough(0,30,()=>S.step!=='h-ari');
 await shot('bench-memo',1400);await E(()=>document.querySelector('.bench').scrollIntoView());await E(()=>window.scrollTo(0,700));await shot('bench-memo-2',600);await E(()=>window.scrollTo(0,1400));await shot('bench-memo-3',600);
 await E(()=>window.scrollTo(0,0));await p.click('#tell');await shot('bench-told',1200);
 await E(()=>{curDoc='coach';renderWorkbench()});await shot('bench-coach',1200);await E(()=>window.scrollTo(0,900));await shot('bench-coach-2',600);
 await E(()=>window.scrollTo(0,99999));await p.click('#next');await shot('criteria',800);
 await p.click('.critb[data-c="heal"]');await p.click('.critb[data-c="plays"]');await shot('criteria-picked',400);await p.click('#next');await shot('table',1600);
 await E(()=>{S.choice={prot:'brace',sat:'sit'};go('h-table')});await shot('table-brace-sit',1600);await p.click('#why');await E(()=>window.scrollTo(0,99999));await shot('table-why',600);
 await p.click('#next');await shot('consent',1000);await p.click('.choice');await shot('consent-reply',900);await p.click('#cont');
 await E(()=>{const t=document.querySelector('#memo');t.value='I recommend a brace and sitting out Saturday because Ari hides his pain and the playoffs matter more. The chance he rolls it again is about 3 in 100.';t.dispatchEvent(new Event('input'))});await shot('memo',600);
 await p.click('#sign');await W(2000);await shot('reveal-end',6500);await p.click('#next');await shot('debrief',1200);await p.click('#next');
 await shot('portfolio',1000);await p.click('#save');await shot('portfolio-saved',900);await p.click('#next');
 await shot('interview-ask',1400);await talkThrough(0,3,()=>document.querySelectorAll('.choice').length>0);await p.click('.choice');await W(600);
 // rehearsal: answer Q1 vaguely to see Byte's tip, then good answers
 await talkThrough(0,3,()=>document.querySelectorAll('.choice').length>0);await shot('rehearse-q1',300);await (await p.$$('.choice'))[1].click();await shot('rehearse-tip',1400);
 for(let k=0;k<3;k++){await talkThrough(0,4,()=>document.querySelectorAll('.choice').length>0);await p.click('.choice');await W(400)}
 await talkThrough(0,6,()=>S.step==='h-interview'&&document.querySelector('.hud .place')?.textContent.includes('office'));await shot('interview',1400);
 await talkThrough(0,3,()=>document.querySelectorAll('.choice').length>0);await shot('interview-q1',400);await p.click('.choice');await shot('interview-q1-reply',1400);
 await talkThrough(0,4,()=>document.querySelectorAll('.choice').length>0);await p.click('#hjown');await p.fill('#hjtxt','I would ask the patient and the AI why they disagree, then explain the tradeoffs so the patient can decide.');await shot('interview-own-words',400);await p.click('#hjsend');await shot('interview-own-reply',1600);
 for(let k=0;k<2;k++){await talkThrough(0,4,()=>document.querySelectorAll('.choice').length>0);await p.click('.choice');await W(500)}
 await talkThrough(0,10,()=>/hired/i.test(document.querySelector('#line')?.textContent||''));await shot('interview-hired',800);await talkThrough(0,4,()=>!!document.querySelector('.badge-card'));await shot('hired-card',1200);
 await p.click('#next');await shot('firstday',1400);
 await talkThrough(0,4,()=>document.querySelectorAll('.choice').length>0);await shot('firstday-bea',400);await p.click('.choice');await shot('firstday-bea-reply',1000);
 await talkThrough(0,60,()=>document.querySelectorAll('.choice').length===2);await shot('firstday-ask',600);await p.click('.choice');await W(800);
 await talkThrough(0,10,()=>!!document.querySelector('.evening'));await shot('firstday-end',1200);
 await p.click('#pb');await shot('portfolio-book',900);await E(()=>document.querySelectorAll('.sheet').forEach(x=>x.remove()));
 await p.click('#go');await shot('day1-morning',1200);
 await E(()=>go('hub'));await shot('hub',900);await p.click('#hud-menu');await shot('menu',600);
 await E(()=>document.querySelectorAll('.sheet').forEach(x=>x.remove()));await E(()=>openGuide());await shot('guide',700);
 fs.writeFileSync(path.join(out,'errors.txt'),errs.join('\n'));console.log(n+' shots; errors: '+(errs.join('\n')||'none'));await b.close()})();
