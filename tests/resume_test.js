// Autosave resume: leaving a mission halfway and coming back (from the map, or after reloading the page) continues
// at the same step with the same notes, even after playing a different mission in between.
//   node tests/resume_test.js dist/pathmakers.html
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const fails=[],errs=[];
 p.on('pageerror',e=>errs.push(e.message));await p.addInitScript(()=>{window.__noaudio=1});
 const url='file://'+path.resolve(process.argv[2]||'dist/pathmakers.html');await p.goto(url);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(400);
 const play=id=>p.evaluate(id=>{const m=MISSIONS[id];typeof playMission==='function'?playMission(m):(resumeMission(id)||startMission(id))},id);
 await p.evaluate(()=>{S.mute=true;S.playAll=true;startMission('hired');go('h-ari');S.notes.test=1;save();go('hub')});
 await play('hired');let r=await p.evaluate(()=>[S.mission,S.step,!!S.notes.test]);
 if(r[1]!=='h-ari'||!r[2])fails.push('back from the map: '+JSON.stringify(r));
 await p.evaluate(()=>{go('hub')});await play('maya');await p.evaluate(()=>{go('criteria');S.notes.rash=true;save();go('hub')});
 await play('hired');r=await p.evaluate(()=>[S.mission,S.step,!!S.notes.test,!!S.notes.rash]);
 if(r[1]!=='h-ari'||!r[2]||r[3])fails.push('after another mission: '+JSON.stringify(r));
 await p.reload();await p.waitForTimeout(500);await p.click('#cont');await p.waitForTimeout(300);
 r=await p.evaluate(()=>[S.mission,S.step]);if(r[1]!=='h-ari')fails.push('after reload + Continue: '+JSON.stringify(r));
 await play('maya');r=await p.evaluate(()=>[S.mission,S.step,!!S.notes.rash]);if(r[1]!=='criteria'||!r[2])fails.push('maya parked state: '+JSON.stringify(r));
 const all=fails.concat(errs);console.log(all.length?'FAILURES:\n'+all.join('\n'):'resume ok');await b.close();process.exit(all.length?1:0)})();
