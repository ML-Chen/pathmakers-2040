// Screenshots of the grown-ups' progress page at phone size: node tools/parent_shots.js dist/pathmakers.html /tmp/pm-parent
// Plays one real mission to its debrief (so the page reads a genuine record), then fills in a longer sample history.
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const [html,out]=[process.argv[2],process.argv[3]||'/tmp/pm-parent'];fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
 const errs=[];p.on('pageerror',e=>errs.push('pageerror: '+e.message));p.on('console',m=>m.type()==='error'&&errs.push('console: '+m.text()));
 await p.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.fulfill({status:200,body:''}));
 await p.addInitScript(()=>{window.__noaudio=1;try{localStorage.clear()}catch(e){}});
 await p.goto('file://'+path.resolve(html));let n=0;const shot=async(name,w=500)=>{await p.waitForTimeout(w);await p.screenshot({path:path.join(out,String(++n).padStart(2,'0')+'-'+name+'.png')})};
 const E=(f,a)=>p.evaluate(f,a);const scroll=async y=>{await E(y=>document.querySelector('.pp').scrollTo(0,y),y)};
 await E(()=>{S.mute=true;startMission('maya')});
 // empty save: menu button, gate, wrong answer, then the page
 await E(()=>go('hub'));await p.click('#hud-menu');await E(()=>document.querySelector('.sheet-body').scrollTo(0,9999));await shot('menu',500);
 await p.click('#m-parent');await shot('gate',500);
 await p.fill('#pp-ans','1');await p.click('.pp-gate .btn');await shot('gate-wrong',200);
 const ans=await E(()=>{const t=document.querySelector('label[for=pp-ans]').textContent.match(/(\d+) × (\d+)/);return t[1]*t[2]});
 await p.fill('#pp-ans',String(ans));await p.click('.pp-gate .btn');await shot('empty-top',500);await scroll(9999);await shot('empty-bottom',300);
 // play one mission through to its debrief
 await E(()=>{document.querySelector('.pp .x').click()});await p.waitForTimeout(300);
 await E(()=>{startMission('maya');S.notes.rash=true;go('workbench')});await p.waitForTimeout(600);await p.click('.gw');await p.mouse.click(5,5);
 await E(()=>{S.told=true;unlock('only-you-know');S.criteria=['straight','plays'];S.choice={tx:'cast',pt:true,date:'moved'};S.conf=3;S.consent=true;
   S.memo='I recommend a cast with physical therapy because Maya had a rash from HX-2. It heals straight about 88 out of 100 times, and we can move her recital.';go('table')});
 await p.waitForTimeout(800);await p.click('#why');
 await E(()=>{openChat()});await p.fill('#chatin','Why do bones heal faster in kids?');await p.click('#chatform .btn');await p.waitForTimeout(400);
 await p.fill('#chatin','Is BoneMend safe if Maya had a rash?');await p.click('#chatform .btn');await p.waitForTimeout(400);await E(()=>document.querySelectorAll('.sheet').forEach(x=>x.remove()));
 await E(()=>{S.result=null;go('reveal')});await p.waitForTimeout(5500);await E(()=>go('debrief'));await p.waitForTimeout(800);await E(()=>go('debrief'));
 const rec=await E(()=>JSON.stringify(S.history));fs.writeFileSync(path.join(out,'history.json'),rec);
 await E(()=>PARENT.open());await shot('one-top',600);await scroll(700);await shot('one-mid',300);await scroll(9999);await shot('one-bottom',300);
 // a longer sample history (8 decisions), as if several missions had been played
 await E(()=>{const base=S.history[0],day=864e5,t0=Date.now()-9*day;const mk=(i,stars,luck,good,conf,fc,ch,memo)=>({...base,id:i+1,t:t0+i*day,day:i+1,stars,luck,good,conf,fc,checks:{treatment:ch[0],reason:ch[1],odds:ch[2],maya:ch[3]},memo:memo||base.memo});
   S.history=[mk(0,1,'Lucky',true,97,48,[1,0,0,1],'Pins. She will be fine.'),mk(1,2,'As expected',false,87,55,[1,1,0,1],'I pick the gel because she wants to play Friday.'),mk(2,2,'Unlucky',false,87,71,[1,1,1,0]),mk(3,3,'As expected',true,75,74,[1,1,1,1]),
     mk(4,2,'As expected',true,75,68,[1,1,0,1]),mk(5,3,'Lucky',true,62,58,[1,1,1,1]),mk(6,3,'As expected',true,87,82,[1,1,1,1]),mk(7,3,'Unlucky',false,50,61,[1,1,1,1])];
   S.words=['fracture','radius','consent','hydrogel','sample size','forecast','calibrated','overconfidence'];S.wordLog={fracture:['a','b'],consent:['a','b','c'],radius:['a']};
   S.guide=['only-you-know','sample-size','consent','calibration'];S.ideaLog={'only-you-know':['maya','m2'],consent:['maya','m2','m3'],'sample-size':['maya']};S.lessons={bones:3};save()});
 await E(()=>PARENT.open());await shot('full-top',600);await scroll(560);await shot('full-writing',300);
 await E(()=>{const el=document.querySelector('#pp-decisions');document.querySelector('.pp').scrollTo(0,el.offsetTop-70)});await p.click('.pp-col[data-i="2"]');await shot('full-decisions',400);
 await E(()=>{const el=document.querySelector('#pp-decisions .pp-sub');document.querySelector('.pp').scrollTo(0,el.offsetTop-90)});await shot('full-calibration',300);
 await E(()=>{const el=document.querySelector('#pp-portfolio');document.querySelector('.pp').scrollTo(0,el.offsetTop-70)});await shot('full-portfolio',300);
 await scroll(99999);await p.click('#pp-tog');await shot('full-chat-off',400);
 // free chat off: Byte must answer with a scripted line without calling the AI
 await E(()=>{document.querySelector('.pp .x').click()});await p.waitForTimeout(300);
 const off=await E(async()=>{let called=0;const old=window.claude;window.claude={use:async()=>{called++;return async()=>({text:'AI'})}};SAMPLE=null;openChat();document.querySelector('#chatin').value='how do I win';
   document.querySelector('#chatform').dispatchEvent(new Event('submit',{cancelable:true}));await new Promise(r=>setTimeout(r,300));window.claude=old;return {called,chatOff:S.chatOff,last:CHAT.at(-1).content}});
 errs.push('check chat off: '+JSON.stringify(off));
 fs.writeFileSync(path.join(out,'errors.txt'),errs.join('\n'));console.log(n+' shots; '+errs.join('\n'));await b.close()})();
