// viz/duststorm.js — "One Night of Power" (Mars): Byte's pictures (VIZ.ds*), the Future pictures, the power board
// (ds_power) and the night, hour by hour (ds_night). Styles: src/css/duststorm.css. Mission data: src/missions/duststorm.js.
const DSC={ink:'#2a1a1a',soft:'#8a7070',rust:'#c8643a',rustD:'#8a3e22',sand:'#e8b884',sky:'#d8a878',pink:'#e070c0',green:'#3fa05a',tomato:'#e8302a',blue:'#5aa8e8',gold:'#f5b82e',teal:'#16b3a6',red:'#e5484d',bat:'#2fbf6a'};
const dT=(x,y,t,o)=>igT(x,y,t,o);
function dBattery(x,y,wd,ht,fill,o){o=o||{};const id=igId('dbt');return `<g transform="translate(${x} ${y})"><rect x="0" y="0" width="${wd}" height="${ht}" rx="6" fill="#fff" stroke="${DSC.ink}" stroke-width="2"/><rect x="${wd}" y="${ht*.3}" width="6" height="${ht*.4}" rx="2" fill="${DSC.ink}"/>
  <clipPath id="${id}"><rect x="3" y="3" width="${wd-6}" height="${ht-6}" rx="4"/></clipPath><g clip-path="url(#${id})"><rect x="3" y="3" width="${(wd-6)*fill}" height="${ht-6}" fill="${fill<.25?DSC.red:DSC.bat}" class="${o.cls||''}"/>${o.range?`<rect x="${3+(wd-6)*o.range[0]}" y="3" width="${(wd-6)*(o.range[1]-o.range[0])}" height="${ht-6}" fill="#fff" opacity=".45"/>`:''}</g></g>`}
function dPanel(x,y,s,dark){s=s||1;return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-20 0 L20 0 L26 -10 L-14 -10Z" fill="${dark?'#2a2a3a':'#26306a'}" stroke="${DSC.ink}" stroke-width="1.4"/><path d="M-6 0 L0 -10 M8 0 L14 -10 M-17 -5 H23" stroke="#5a6ab0" stroke-width=".9"/><path d="M0 0 V8" stroke="${DSC.ink}" stroke-width="1.6"/></g>`}
function dGreenhouse(x,y,s,o){o=o||{};s=s||1;const cold=o.cold;return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-30 0 V-12 Q-30 -22 -20 -22 H20 Q30 -22 30 -12 V0Z" fill="${cold?'#cfe0f0':o.dark?'#7a4a7a':'#f0a0dc'}" stroke="${DSC.ink}" stroke-width="1.4"/>${[-22,-12,-2,8,18].map((px,i)=>`<g><ellipse cx="${px+2}" cy="-5" rx="3.4" ry="6" fill="${cold?'#8aa0a8':'#3fa05a'}"/>${!cold&&i%2===0?`<circle cx="${px+3}" cy="-6" r="2" fill="${DSC.tomato}"/>`:''}</g>`).join('')}${cold?`<path d="M-20 -16 l3 3 m0 -3 l-3 3 M10 -18 l3 3 m0 -3 l-3 3" stroke="#fff" stroke-width="1.4"/>`:''}${[-15,0,15].map(rx=>`<path d="M${rx} 0 V-22" stroke="#fff" stroke-width=".8" opacity=".6"/>`).join('')}</g>`}
function dPerson(x,y,col,s,o){o=o||{};return rPawn?rPawn(x,y,col,s,o):''}
function dStormCloud(x,y,s,cls){s=s||1;return `<g transform="translate(${x} ${y}) scale(${s})" class="${cls||''}">${[[-20,0,14],[0,-8,18],[20,-2,15],[36,4,11],[-34,6,10]].map(([a,b,r])=>`<circle cx="${a}" cy="${b}" r="${r}" fill="#b0683e"/><circle cx="${a-r*.3}" cy="${b-r*.35}" r="${r*.5}" fill="#e0a070" opacity=".6"/>`).join('')}<rect x="-44" y="4" width="92" height="12" fill="#b0683e"/></g>`}
function dClockBar(ranges){return ranges}
const VIZ_DS={
  dsStormMove:()=>igFrame(300,120,`<rect width="300" height="120" rx="10" fill="#f2d8b8"/><circle cx="150" cy="60" r="44" fill="#d07848"/><circle cx="150" cy="60" r="44" fill="none" stroke="${DSC.rustD}" stroke-width="2"/>
    <circle cx="138" cy="56" r="7" fill="none" stroke="#fff" stroke-width="2"/><circle cx="138" cy="56" r="2.4" fill="#fff"/>${dT(138,80,'Jezero',{s:9,c:'#fff'})}
    <g class="ds-stormin">${dStormCloud(196,54,.7)}</g><path d="M248 60 H214" stroke="${DSC.ink}" stroke-width="2" stroke-dasharray="4 4" class="rim-flow"/>${dT(262,64,'east',{s:10,c:DSC.soft})}`,'The storm is coming'),
  dsArrive:()=>{const X=h=>30+(h-3)*40;return igFrame(300,120,`<path d="M30 70 H270" stroke="${DSC.ink}" stroke-width="2"/>${[3,4,5,6,7,8,9].map(h=>`<path d="M${X(h)} 64 V76" stroke="${DSC.ink}" stroke-width="1.6"/>${dT(X(h),92,h+' PM',{s:10,c:DSC.soft})}`).join('')}
    <rect x="${X(5)}" y="52" width="${X(8)-X(5)}" height="12" rx="6" fill="${DSC.rust}" opacity=".35"/><circle cx="${X(6.5)}" cy="58" r="7" fill="${DSC.rust}" class="ds-pulse"/>${dT(X(6.5),40,'most likely 6:30',{s:11,w:800})}${dT((X(5)+X(8))/2,110,'likely between 5 and 8',{s:10,c:DSC.soft})}`,'Arrival time')},
  dsSolarDrop:()=>igFrame(300,120,`<rect width="300" height="120" rx="10" fill="#e8c49a"/><rect width="300" height="120" rx="10" fill="#4a2414" class="ds-darken"/><circle cx="60" cy="34" r="12" fill="#fff6dc" class="ds-sunfade"/>
    ${dPanel(150,92,1.6)}<g transform="translate(232 70)"><path d="M0 -24 L-10 2 H0 L-6 24 L14 -6 H4 L10 -24Z" fill="${DSC.gold}" stroke="${DSC.ink}" stroke-width="1.4" class="ds-bolt"/></g>`,'No sun, no charging'),
  dsBattery:()=>igFrame(300,120,`${dBattery(40,30,200,50,.52/0.6,{range:[.48/.6,.55/.6]})}${dT(140,62,'52 kWh',{s:16,w:900,c:'#fff'})}${dT(140,100,'likely 48 to 55',{s:11,c:DSC.soft})}<g class="ds-early"><circle cx="270" cy="34" r="10" fill="#fff" stroke="${DSC.ink}" stroke-width="1.4"/><path d="M270 34 V27 M270 34 L275 37" stroke="${DSC.ink}" stroke-width="1.6"/>${dT(270,58,'early?',{s:9,c:DSC.soft})}</g>`,'At sunset'),
  dsLongStorm:()=>{let d='';for(let i=0;i<100;i++){const x=24+(i%20)*13,y=22+Math.floor(i/20)*13;d+=`<circle cx="${x}" cy="${y}" r="4.6" fill="${i<35?DSC.rust:'#f0d8b8'}" class="rim-dot" style="--d:${i*.012}s"/>`}
    return igFrame(300,120,`${d}${dT(150,100,'35 in 100 nights: still stormy at sunrise',{s:11,w:800})}${dT(150,114,'then 8 more kWh to reach noon',{s:10,c:DSC.soft})}`,'A long storm')},
  dsFloor:()=>igFrame(300,120,`${dBattery(40,34,200,46,.5,{cls:'ds-drain'})}<path d="M${43+194*5/60} 24 V90" stroke="${DSC.red}" stroke-width="2.4" stroke-dasharray="4 3"/>${dT(70,104,'5 kWh: never below',{s:11,w:800,c:DSC.red})}`,'The reserve'),
  dsHonest:()=>igFrame(300,120,`<g transform="translate(70 62)"><rect x="-44" y="-30" width="88" height="56" rx="10" fill="#fff" stroke="${DSC.ink}" stroke-width="1.6"/>${dT(0,-6,'48–55',{s:16,w:900})}${dT(0,14,'a range',{s:10,c:DSC.soft})}</g>
    <g transform="translate(220 62)" opacity=".5"><rect x="-44" y="-30" width="88" height="56" rx="10" fill="#fff" stroke="${DSC.soft}" stroke-width="1.6" stroke-dasharray="4 3"/>${dT(0,-6,'exactly 52!',{s:13,w:900,c:DSC.soft})}${dT(0,14,'a promise',{s:10,c:DSC.soft})}<path d="M-30 -24 L30 22" stroke="${DSC.red}" stroke-width="3"/></g>
    <g class="ds-pulse">${dT(146,66,'not',{s:12,w:900,c:DSC.red})}</g>`,'Honest ranges'),
  dsLife:()=>igFrame(300,120,`<g transform="translate(70 70)"><path d="M-30 30 V-6 Q-30 -30 0 -30 Q30 -30 30 -6 V30Z" fill="#fbf6ee" stroke="${DSC.ink}" stroke-width="1.6"/><circle cx="-10" cy="-2" r="5" fill="#ffc261"/><circle cx="10" cy="-2" r="5" fill="#ffc261"/>${dT(0,22,'14°C',{s:11,w:800})}</g>
    ${[['air','M0 -8 C6 -8 6 0 0 0 H-12 M-12 6 H6 C12 6 12 14 6 14'],['water','M0 -10 C6 -2 8 2 8 6 C8 11 4 14 0 14 C-4 14 -8 11 -8 6 C-8 2 -6 -2 0 -10Z']].map(([l,d],i)=>`<g transform="translate(${150+i*50} 56)" class="rim-goal" style="--d:${i*.4}s"><path d="${d}" stroke="${DSC.blue}" stroke-width="2.4" fill="${i?DSC.blue:'none'}" opacity=".85"/>${dT(0,34,l,{s:10,c:DSC.soft})}</g>`).join('')}
    ${dT(254,62,'26',{s:22,w:900})}${dT(254,80,'kWh, always on',{s:9,c:DSC.soft})}`,'Life support'),
  dsCabin:()=>igFrame(300,120,`<g transform="translate(80 62)"><rect x="-10" y="-40" width="20" height="70" rx="10" fill="#fff" stroke="${DSC.ink}" stroke-width="1.6"/><circle cy="30" r="14" fill="${DSC.red}" stroke="${DSC.ink}" stroke-width="1.6"/><rect x="-5" y="-14" width="10" height="44" fill="${DSC.red}" class="ds-therm"/>${dT(28,-10,'20°',{s:11,w:800,a:'start'})}${dT(28,14,'14°',{s:11,w:800,a:'start',c:DSC.soft})}</g>
    <g transform="translate(200 70)"><rect x="-34" y="-8" width="68" height="26" rx="10" fill="#7a9ad8"/><rect x="-34" y="-14" width="22" height="12" rx="6" fill="#fff"/>${dT(0,44,'+5 kWh for cozy',{s:11,w:800})}</g>`,'Cabin heat'),
  dsGreen:()=>igFrame(300,120,`${[['lights',60,'12 kWh',{}],['heat only',150,'4 kWh',{dark:true}],['off',240,'0',{cold:true}]].map(([l,x,k,o])=>`<g>${dGreenhouse(x,70,1.1,o)}${o.dark?'':o.cold?'':`<g class="ds-pulse"><circle cx="${x}" cy="40" r="5" fill="${DSC.pink}"/></g>`}${dT(x,96,l,{s:11,w:800})}${dT(x,110,k,{s:10,c:DSC.soft})}</g>`).join('')}`,'Three ways'),
  dsRelay:()=>igFrame(300,120,`<rect width="300" height="120" rx="10" fill="#2a1a2a"/><circle cx="262" cy="30" r="12" fill="#2f6fd0"/><path d="M256 26 Q262 22 266 28 Q268 34 262 36Z" fill="#6ab04c"/>${dT(262,54,'Earth',{s:9,c:'#fff'})}
    <g transform="translate(150 30)"><rect x="-6" y="-4" width="12" height="8" fill="#c8ccd8"/><rect x="-22" y="-2" width="14" height="4" fill="#26306a"/><rect x="8" y="-2" width="14" height="4" fill="#26306a"/></g>
    <path d="M40 92 Q90 40 144 34" stroke="${DSC.gold}" stroke-width="1.6" stroke-dasharray="3 4" fill="none" class="rim-flow"/><path d="M156 34 Q210 30 250 32" stroke="${DSC.gold}" stroke-width="1.6" stroke-dasharray="3 4" fill="none" class="rim-flow"/>
    <path d="M24 100 Q40 84 56 100Z" fill="#c8643a"/><path d="M40 90 V78" stroke="#ddd" stroke-width="1.4"/><ellipse cx="40" cy="76" rx="7" ry="3" fill="#eee" transform="rotate(-30 40 76)"/>${dT(150,102,'window closes at 9 PM · 2 kWh',{s:11,w:800,c:'#fff'})}`,'Messages home'),
  dsOutlets:(a)=>{a=a||{};return igFrame(300,120,`${[0,1,2,3,4,5].map(i=>{const on=a.one&&i===3;return `<g transform="translate(${40+i*44} 54)"><rect x="-16" y="-20" width="32" height="40" rx="6" fill="#fff" stroke="${DSC.ink}" stroke-width="1.6"/><rect x="-6" y="-10" width="3" height="8" rx="1" fill="${DSC.ink}"/><rect x="3" y="-10" width="3" height="8" rx="1" fill="${DSC.ink}"/><circle cy="8" r="3" fill="${on?DSC.bat:'#d8d0d0'}" class="${on?'ds-pulse':''}"/></g>`}).join('')}
    ${dT(150,100,a.one?'one outlet stays on · 0.5 kWh':'off at 10 PM during storms',{s:11,w:800})}`,'Cabin outlets')},
  dsPriority:()=>igFrame(300,120,`${[['life support',DSC.blue],['crew comfort',DSC.gold],['science',DSC.teal],['greenhouse',DSC.green]].map(([l,c],i)=>`<g transform="translate(${36+i*70} 56)" class="rim-goal" style="--d:${i*.3}s"><rect x="-30" y="-20" width="60" height="40" rx="10" fill="${c}" opacity=".9"/>${dT(0,-2,String(i+1),{s:16,w:900,c:'#fff'})}${dT(0,12,l,{s:8.6,w:800,c:'#fff'})}</g>`).join('')}${dT(150,100,'written years ago by mission control',{s:10.5,c:DSC.soft})}`,'The old order')
};
Object.assign(VIZ,VIZ_DS);

function dsVignette(kind){let a='';
  const out=(sky)=>`<rect width="120" height="90" fill="${sky||'#e8b884'}"/><rect y="62" width="120" height="28" fill="#c8643a"/><path d="M0 62 Q30 56 60 62 T120 60 V64 H0Z" fill="#b8583a"/>`;
  if(kind==='dawn')a=out('#f0c890')+`<circle cx="22" cy="30" r="7" fill="#fff8e0"/>`+dGreenhouse(76,66,1)+dPanel(26,70,.7)+`<g class="ds-pulse"><circle cx="100" cy="24" r="3" fill="${DSC.tomato}"/></g>`;
  else if(kind==='late')a=out('#f0c890')+dGreenhouse(70,66,1)+`<g transform="translate(18 26)"><rect x="-10" y="-7" width="20" height="14" rx="2" fill="#fff" stroke="${DSC.ink}"/><path d="M-10 -7 L0 1 L10 -7" stroke="${DSC.ink}" fill="none"/></g><circle cx="34" cy="20" r="7" fill="#fff" stroke="${DSC.ink}"/><path d="M34 20 V15 M34 20 L37 22" stroke="${DSC.ink}" stroke-width="1.2"/>`;
  else if(kind==='frost')a=out('#d8c8c0')+dGreenhouse(60,66,1.3,{cold:true})+`<path d="M20 20 l4 4 m0 -4 l-4 4 M98 26 l4 4 m0 -4 l-4 4" stroke="#fff" stroke-width="1.6"/>`;
  else if(kind==='tired')a=`<rect width="120" height="90" fill="#3a2a3a"/><rect x="10" y="50" width="70" height="22" rx="6" fill="#7a6a8a"/><ellipse cx="28" cy="50" rx="12" ry="6" fill="#fff"/><circle cx="30" cy="44" r="8" fill="#a8704c"/><path d="M26 44 h3 M32 44 h3" stroke="#2a1a10" stroke-width="1.2"/><g transform="translate(96 40)"><rect x="-10" y="-14" width="20" height="28" rx="4" fill="#fff" stroke="${DSC.ink}"/><circle cy="6" r="3" fill="#d8d0d0"/></g>${dT(90,20,'zzz?',{s:10,w:900,c:'#fff'})}`;
  else if(kind==='rover')a=`<rect width="120" height="90" fill="#4a2414"/>${[0,1,2,3].map(i=>`<path d="M${i*30} ${20+i*12} h40" stroke="#c87a4a" stroke-width="1.4" opacity=".5"/>`).join('')}<rect y="66" width="120" height="24" fill="#381a0e"/><path d="M22 66 V44 Q22 34 32 34 H86 Q98 34 98 46 V66Z" fill="#9a8a8a"/><rect x="64" y="38" width="24" height="12" rx="4" fill="#ffc261"/>${[30,42,54].map(x=>`<circle cx="${x}" cy="46" r="4" fill="#e8c0a0"/>`).join('')}${[34,60,86].map(x=>`<circle cx="${x}" cy="68" r="7" fill="#2a2020"/>`).join('')}`;
  else a=out();
  return `<svg viewBox="0 0 120 90" class="vig"><clipPath id="vc${++VGN}"><rect width="120" height="90" rx="10"/></clipPath><g clip-path="url(#vc${VGN})">${a}</g></svg>`}

// ---------- the power board ----------
// rows: [key, label, options], loads come from DS_LOAD; the board shows kWh, the battery range and 10 typical nights
const DS_ROWS=[['gh','Greenhouse',[['lights','Lights + heat'],['heat','Heat only'],['off','Off']]],['cabin','Cabin',[['warm','Cozy 20°C'],['cool','Cool 14°C']]],['msg','Message to Earth',[['send','Send tonight'],['wait','Wait']]]];
function dsBoardHTML(c){const need=dsNeed(c,S.told),f=forecastFor(c),max=60,W=v=>(v/max*100).toFixed(1)+'%';
  const segs=[['Life support',DS_LIFE,'#5aa8e8'],['Cabin',DS_LOAD.cabin[c.cabin],'#f5b82e'],['Greenhouse',DS_LOAD.gh[c.gh],'#e070c0'],['Messages',DS_LOAD.msg[c.msg],'#16b3a6']].concat(S.told?[['Outlet',DS_CPAP,'#2fbf6a']]:[]);
  const nights=typicalFutures(c,rngFrom(7+JSON.stringify(c).length));const safeN=nights.filter(x=>x.flags.safe).length;
  return `<div class="ds-meter"><div class="ds-bar">${segs.map(([l,v,col])=>v?`<i style="width:${W(v)};background:${col}" title="${l}"></i>`:'').join('')}<i class="ds-long" style="width:${W(DS_LONG)}"></i></div>
    <div class="ds-scale"><span class="ds-floor" style="left:${W(48-DS_FLOOR)}"></span><span class="ds-band" style="left:${W(48)};width:${W(7)}"></span></div>
    <div class="ds-legend"><span><b>${need}</b> kWh tonight</span><span class="ds-lg-long">+8 if the storm lasts</span><span class="ds-lg-band">battery 48–55</span></div></div>
    <div class="ds-nights"><div class="ds-nl">In 10 nights like tonight</div><div class="ds-nrow">${nights.map(n=>`<span class="ds-n ${n.flags.safe?'ok':'bad'}" title="${esc(n.cap)}">${n.flags.safe?'☀':'!'}</span>`).join('')}</div>
      <div class="ds-nsum">The battery lasts in <b>${safeN}</b> of 10. The tomatoes make it in <b>${nights.filter(x=>x.flags.tomatoes).length}</b>.</div></div>`}
MISSIONS.duststorm.custom={
  ds_power(){const c=S.choice;
    const say=()=>{const need=dsNeed(c,S.told),worst=48-need-DS_LONG;
      return worst>=DS_FLOOR?'Even on the worst night in my range, this plan never touches the emergency reserve.':48-need>=DS_FLOOR?'This plan is safe if the storm clears by morning. If the storm lasts and the battery starts at the low end, we would dip into the reserve.':'This plan only works if the storm comes late and leaves early. On most nights, we would run down to the reserve.'};
    screen('criteria ds-powscr',`${scene('mars')}${hud('Control room · Tonight’s power')}<div class="panel-card ds-card"><h2>Tonight’s power</h2>
      <div class="ds-rows"><div class="ds-row ds-locked"><span>Life support</span><b>26 kWh · always on</b></div>
        ${DS_ROWS.map(([k,l,opts])=>`<div class="ds-row"><span>${l}</span><div class="seg">${opts.map(([v,t])=>`<button class="segb ${c[k]===v?'on':''}" data-k="${k}" data-v="${esc(JSON.stringify(v))}">${t} <small>${DS_LOAD[k][v]}</small></button>`).join('')}</div></div>`).join('')}
        ${S.told?`<div class="ds-row ds-locked"><span>One cabin outlet</span><b>0.5 kWh · stays on</b></div>`:''}</div>
      <div id="dsboard">${dsBoardHTML(c)}</div>
      <div class="byte-note ds-delta"><div class="ds-dface">${typeof deltaArt==='function'?`<svg viewBox="40 30 220 240">${deltaArt('think')}</svg>`:''}</div><p id="dssay">${esc(say())}</p></div>
      <button class="btn wide" id="next">Lock in tonight’s plan</button></div>`);
    setTimeout(()=>playLine('delta','Here is tonight’s budget. Everything you switch on comes out of the same battery.'),250);
    $$('[data-k]').forEach(b=>b.onclick=()=>{S.choice[b.dataset.k]=JSON.parse(b.dataset.v);save();$$(`[data-k="${b.dataset.k}"]`).forEach(x=>x.classList.toggle('on',x===b));$('#dsboard').innerHTML=dsBoardHTML(S.choice);$('#dssay').textContent=say()});
    $('#next').onclick=()=>{unlock('mars-budget')&&toast('New Field Guide idea: '+FIELD_GUIDE['mars-budget'].title,'good');nextStep()}},
  ds_night(){dsNightRun(false)}
};
// The night: the real draw (battery at sunset and whether the storm lasts) is made once, from the true odds. The screen
// plays it hour by hour; at 1 AM Delta updates its forecast and the player may cut the greenhouse lights or the cabin heat.
function dsDraw(){const st=dsState();if(st.B==null){const r=rngFrom(Date.now()%100000+11);let u=r(),B=55;for(const [b,p] of DS_BATT){if(u<p){B=b;break}u-=p}st.B=B;st.long=r()<DS_PLONG?1:0;save()}return st}
function dsResult(){const st=dsDraw(),c={...S.choice},m=st.mid||{};let need=dsNeed(c,S.told);
  if(m.gh&&c.gh==='lights')need-=(DS_LOAD.gh.lights-DS_LOAD.gh.heat)*6/DS_HOURS;if(m.cabin&&c.cabin==='warm')need-=DS_LOAD.cabin.warm*6/DS_HOURS;
  const f=dsFlags(c,st.B,st.long,{cpap:!!S.told,real:true},need),kind=dsKind(f,c);S.result={kind,flags:f,cap:DS_CAPS[kind]};save();return {st,need,f,kind}}
function dsNightRun(skip){const st=dsDraw();let R=dsResult();const hours=['6 PM','7 PM','8 PM','9 PM','10 PM','11 PM','Midnight','1 AM','2 AM','3 AM','4 AM','5 AM','6 AM','7 AM'];
  screen('reveal ds-nightscr',`${scene('mars_storm')}${hud('Jezero Station · The storm night')}<div class="ds-night"><div class="ds-clock"><b id="dshr">6 PM</b><span id="dstemp">Outside: −45°C</span></div>
    <div class="ds-nbat">${dBatteryHTML()}</div><div class="ds-log" id="dslog"></div><div id="dsmid"></div><div id="dsend"></div></div>`);
  const log=(t,who)=>{const L0=$('#dslog');if(!L0)return;const d=document.createElement('p');d.innerHTML=t;L0.prepend(d);if(who)playLine(who,d.textContent)};
  let i=st.step||0,timer=0;const totalNeed=()=>R.need;
  const setBat=h=>{const used=totalNeed()*Math.min(h,DS_HOURS)/DS_HOURS+(h>DS_HOURS?DS_LONG*(h-DS_HOURS)/3:0);const left=Math.max(st.B-used,DS_FLOOR*(R.f.safe?1:.6));const e=$('#dsbatfill'),n=$('#dsbatn');if(e){e.style.width=(left/60*100)+'%';e.classList.toggle('low',left<12)}if(n)n.textContent=Math.round(left*10)/10+' kWh'};
  const tick=()=>{const hr=$('#dshr');if(!hr)return clearInterval(timer);
    if(i<hours.length){hr.textContent=hours[i];$('#dstemp').textContent='Outside: −'+Math.round(45+Math.sin(i/13*Math.PI)*40)+'°C';setBat(i);
      if(i===0)log('Six PM. The storm has arrived, a little earlier than I expected, and the panels have stopped charging.','delta');
      if(i===3)log(S.choice.msg==='send'?'Nine PM. The messages went out to Earth before the relay window closed.':'Nine PM. The relay window just closed.');
      if(i===4)log(S.told?'Ten PM. The cabin outlets are off now, except the one you asked me to keep on.':'Ten PM. The cabin outlets are off now, as my storm rule says.');
      if(i===7&&!st.midShown){st.midShown=1;save();clearInterval(timer);mid();return}
      if(i===13){if(st.long)setBat(DS_HOURS+3);log(st.long?'Seven AM. The storm is still here, so the panels make only a little power.':'Seven AM. The storm has passed, and the panels are charging again.','delta')}
      i++;st.step=i;save();return}
    clearInterval(timer);finish()};
  const mid=()=>{if(!$('#dsmid'))return;const hr0=$('#dshr');if(hr0)hr0.textContent='1 AM';const can=[];if(S.choice.gh==='lights')can.push(['gh','Switch the greenhouse to heat only']);if(S.choice.cabin==='warm')can.push(['cabin','Turn the cabin down to 14°C']);
    const line=st.long?'Update, 1 AM. The storm is slowing down. The chance it is still here at sunrise is now 70 in 100.':'Update, 1 AM. The storm is thinning. The chance it is still here at sunrise is now 10 in 100.';
    $('#dsmid').innerHTML=`<div class="ds-update"><div class="upd-badge">Delta’s update</div><p>${esc(line)}</p><div class="choices">${can.map(([k,t])=>`<button class="choice" data-m="${k}">${t}</button>`).join('')}<button class="choice" data-m="keep">Keep the plan</button></div></div>`;playLine('delta',line);
    $$('#dsmid [data-m]').forEach(b=>b.onclick=()=>{st.mid=st.mid||{};if(b.dataset.m!=='keep'){st.mid[b.dataset.m]=1;unlock('mars-ranges')&&toast('New Field Guide idea: '+FIELD_GUIDE['mars-ranges'].title,'good')}save();R=dsResult();
      if(b.dataset.m!=='keep')b.remove();else{$('#dsmid').innerHTML='';i++;st.step=i;save();timer=setInterval(tick,skip?1:420)}})};
  const finish=()=>{R=dsResult();if(!R.f.safe)log('The battery reached the emergency reserve, so I moved everyone into the rover.','delta');
    const RV=MISSIONS.duststorm.reveal,line=RV.lines[R.kind];st.done=1;save();
    const hr1=$('#dshr');if(hr1){hr1.textContent=st.long?'10 AM':'7 AM';$('#dstemp').textContent=st.long?'Storm still blowing':'Sunrise'}
    setTimeout(()=>{if(!$('#dsend'))return;$('#dsend').innerHTML=`<div class="rf-card ds-rf">${dsVignette(R.kind)}</div><h2 class="ds-cap">${esc(DS_CAPS[R.kind])}</h2><div class="rf-talk"><div class="rf-maya">${portrait({...CAST.lucia,mood:RV.mood(R.kind)})}</div><p>“${esc(line)}”</p></div><button class="btn" id="next">See how you did</button>`;
      $('#next').onclick=()=>nextStep();playLine('lucia',line);$('#dsend').scrollIntoView({behavior:'smooth',block:'end'})},skip?0:600)};
  if(skip||st.done){i=hours.length;setBat(st.long?DS_HOURS+3:DS_HOURS);if(st.midShown||skip){}finish();return}
  if(st.midShown&&i===7)mid();else timer=setInterval(tick,420)}
function dBatteryHTML(){return `<div class="ds-batt"><i id="dsbatfill"></i><span id="dsbatn"></span></div>`}
MISSIONS.duststorm.shots={
  ds_power:[{label:'sturdy plan, told',run(){S.told=true;S.choice={gh:'heat',cabin:'cool',msg:'send'};go('ds_power')}},{label:'risky plan',run(){S.choice={gh:'lights',cabin:'warm',msg:'send'};go('ds_power')}}],
  ds_night:[{label:'1 AM update',run(){const st=dsState();st.B=52;st.long=1;st.step=7;st.midShown=1;delete st.done;S.choice={gh:'lights',cabin:'warm',msg:'send'};go('ds_night')}},
    {label:'sunrise',run(){const st=dsState();st.B=52;st.long=0;st.done=1;S.told=true;S.choice={gh:'heat',cabin:'warm',msg:'send'};go('ds_night')}}]};
