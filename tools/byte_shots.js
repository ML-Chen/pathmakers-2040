// Byte customizing in the real game: node tools/byte_shots.js dist/pathmakers.html [/tmp/byte-shots] [width height]
// Screens: setup with the new rows, an old save migrating, the present on the day planner, the unlock reveal frame
// by frame, Byte's closet (Look and Gear tabs), and the dressed-up Byte on the title, stage, companion, notes,
// Future Table and evening. Also checks the unlock rules and save migration and writes errors.txt.
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const [html,out,W,H]=[process.argv[2],process.argv[3]||'/tmp/byte-shots',+process.argv[4]||390,+process.argv[5]||844];fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:W,height:H},deviceScaleFactor:1});
 const errs=[];p.on('pageerror',e=>errs.push('pageerror: '+e.message));p.on('console',m=>m.type()==='error'&&!/Failed to load resource/.test(m.text())&&errs.push('console: '+m.text()));
 await p.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.fulfill({status:200,body:''}));
 await p.addInitScript(()=>{window.__noaudio=1;try{localStorage.clear()}catch(e){}});
 await p.goto('file://'+path.resolve(html));let n=0;const shot=async(name,w=500)=>{await p.waitForTimeout(w);await p.screenshot({path:path.join(out,String(++n).padStart(2,'0')+'-'+name+'.png')})};
 const E=(f,a)=>p.evaluate(f,a);const check=(ok,msg)=>{if(!ok)errs.push('check failed: '+msg)};
 await E(()=>{S.mute=true});
 // setup: new rows, and every picker still works
 await p.click('#new');await shot('setup');
 await p.click('.sw:nth-child(4)');await p.click('[data-e="pointy"]');await p.click('[data-tail="curly"]');await p.click('[data-eyes="glow"]');await shot('setup-changed',300);
 const look=await E(()=>({...S.byte}));check(look.ears==='pointy'&&look.tail==='curly'&&look.eyes==='glow'&&look.color==='#8f86ff','setup pickers set S.byte '+JSON.stringify(look));
 const tall=await E(()=>document.documentElement.scrollHeight);check(tall<=H+80,'setup is '+tall+'px tall');
 // migration: an old save without the new fields keeps its Byte and earns gear for past progress
 const mig=await E(()=>{const old={v:1,mission:'maya',completed:{maya:{stars:3}},player:'Juniper',byte:{name:'Biscuits',color:'#5fc9bd',ears:'round',voice:'male'},step:'hub',notes:{},hearts:{},words:[],guide:[],read:{}};
   const ok=loadCode('PM1-'+btoa(unescape(encodeURIComponent(JSON.stringify(old)))).replace(/=+$/,''));const L=byteLook({});go('hub');
   return {ok,L:{color:L.color,ears:L.ears,tail:L.tail,eyes:L.eyes,wear:L.wear}}});
 await p.waitForTimeout(100);mig.gifts=await E(()=>byteGifts());
 check(mig.ok&&mig.L.color==='#5fc9bd'&&mig.L.ears==='round'&&mig.L.tail==='fluffy'&&mig.L.eyes==='sparkly'&&!mig.L.wear.length,'old save keeps its Byte '+JSON.stringify(mig.L));
 check(mig.gifts.join()==='bow,startag','old save earns bow and star tag, got '+JSON.stringify(mig));
 await shot('hub-present',1200);
 // the reveal, frame by frame
 await p.click('#bc-gift');await shot('reveal-drop',350);await shot('reveal-wiggle',700);await shot('reveal-open',450);await shot('reveal-done',900);
 await p.click('#bc-wear');await shot('reveal-next',2000);await shot('reveal-next-done',1200);await p.click('#bc-later');await p.waitForTimeout(500);
 const after=await E(()=>({wear:S.byte.wear,opened:S.byte.opened,gift:!!document.getElementById('bc-gift')}));check(after.wear.join()==='bow'&&!after.gift,'after reveals '+JSON.stringify(after));
 await E(()=>openCloset('gear'));await shot('closet-gear-locked',700);await E(()=>document.querySelectorAll('.sheet').forEach(x=>x.remove()));
 // unlock API: rules by district and count, mission unlocks, and unlockAccessory
 const api=await E(()=>{const r={};S.completed={};S.byte.unlocked=[];S.byte.opened=[];r.start=byteCheckUnlocks();
   MISSIONS.zz_nome={id:'zz_nome',career:'vet',district:'nome',flow:[],unlocks:['labbadge']};S.completed.zz_nome={stars:1};r.nome=byteCheckUnlocks();
   r.again=byteCheckUnlocks();r.api=unlockAccessory('helmet');r.twice=unlockAccessory('helmet');r.bad=unlockAccessory('nope');delete MISSIONS.zz_nome;S.completed={maya:{stars:3}};
   S.byte.opened=[...S.byte.unlocked];S.byte.unlocked=BYTE_GEAR.map(g=>g.id);S.byte.opened=BYTE_GEAR.map(g=>g.id).filter(id=>id!=='parka');S.byte.wear=['bow'];save();return r});
 check(api.nome.includes('parka')&&api.nome.includes('labbadge')&&api.nome.includes('bow')&&!api.again.length&&api.api&&!api.twice&&!api.bad,'unlock API '+JSON.stringify(api));
 // the closet
 await E(()=>go('hub'));await p.waitForTimeout(600);await p.click('#hud-menu');await shot('menu',500);
 await p.click('#m-closet');await p.click('[data-tab="look"]');await shot('closet-look',700);
 await p.click('.bc-tile[data-v="stubby"]');await p.click('.bc-tile[data-v="button"]');await p.click('.sw[data-c="#f0b35a"]');await shot('closet-look-changed',600);
 await p.click('[data-tab="gear"]');await shot('closet-gear',600);
 await p.click('.bc-tile[data-g="helmet"]');await p.click('.bc-tile[data-g="vest"]');await p.click('.bc-tile[data-g="startag"]');await shot('closet-gear-worn',600);
 await E(()=>document.querySelector('.sheet-body').scrollTo(0,9999));await shot('closet-gear-bottom',400);
 await p.click('.bc-tile[data-gift="parka"]');await shot('closet-gift-reveal',2600);await p.click('#bc-wear');await shot('closet-after-gift',700);
 const worn=await E(()=>S.byte.wear.join());check(worn==='helmet,startag,parka','wearing parka replaces the vest: '+worn);
 await E(()=>document.querySelectorAll('.sheet').forEach(x=>x.remove()));
 // the dressed-up Byte everywhere
 await E(()=>{S.byte.wear=['snorkel','bandana'];S.step='title';RESUME=null;render()});await shot('title-snorkel',900);
 await E(()=>{S.byte.wear=['helmet','parka','startag'];startMission('maya');go('morning')});await shot('stage-helmet',1500);
 await E(()=>{S.byte.wear=['bow','judge','labbadge'];S.byte.ears='floppy';S.byte.tail='curly';go('workbench')});await shot('companion-judge',1000);
 await E(()=>byteSays('Nine days until the recital. That’s tight!'));await shot('companion-says',600);
 await E(()=>{S.byte.wear=['vest','helmet'];S.told=true;S.notes.rash=true;renderWorkbench()});await E(()=>document.querySelector('#tellslot')&&document.querySelector('#tellslot').scrollIntoView());await shot('note-vest',600);
 await E(()=>{S.byte.wear=['snorkel','parka'];go('table')});await shot('table',1400);
 await E(()=>{S.byte.wear=['helmet','judge'];S.byte.color='#ffffff';go('evening')});await shot('evening',1400);
 await E(()=>{S.byte.wear=['bow','bandana'];S.byte.color='#ff9aa8';openChat()});await shot('chat',700);
 // live refresh: changing gear in the closet redraws the companion behind the sheet
 await E(()=>{document.querySelectorAll('.sheet').forEach(x=>x.remove());go('workbench')});await p.waitForTimeout(400);
 const live=await E(()=>{byteWear('helmet',true);return document.querySelector('#comp .bc-g-helmet')!==null});check(live,'companion redraws after a closet change');
 fs.writeFileSync(path.join(out,'errors.txt'),errs.join('\n'));console.log(n+' shots; errors: '+(errs.join('\n')||'none'));await b.close()})();
