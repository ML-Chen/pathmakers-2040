// viz/agreed_viz_home.js — pictures of Sunny's system for "The Helper That Said Yes": the 40,000 homes, what Sunny runs,
// its logs, the pattern Byte found, the permissions panel icons and city map, the kitchen close-ups and the evening.
// Same style as infog.js (300-wide igFrame, IG palette, igT labels). Animations: src/css/agreed_viz_home.css (classes agh-).
let AGH_N=0;
const aghF=v=>Math.round(v*10)/10;
const AGH={wall:['#ffd36e','#9fd0f0','#bfe3b4','#d4c2f5','#ffc0b0','#f6e6b8'],trim:'#fffaf0',roof:'#5a5470',ink:'#2a2d4a',yellow:'#ffc531',tea:'#a8662a',teaD:'#6e3f17',fennel:'#d9e8a0'};
// A Boston triple-decker, front view, feet at (x,y), about 24 wide and 40 tall at s=1.
// st: 'ok' (warm windows), 'risk' (red window, pulsing ring), 'check' (green check), 'wait' (amber clock), 'dark' (windows off)
function aghHouse(x,y,s,i,st){const c=AGH.wall[i%AGH.wall.length],sh=ch_mix(c,'#5a4a70',.22),win=st==='dark'?'#3a3f63':st==='risk'?'#ff6b6b':'#ffe39a';
  const floors=[-30,-19,-8];
  return `<g transform="translate(${aghF(x)} ${aghF(y)}) scale(${s})">${st==='risk'?'<ellipse cx="0" cy="-18" rx="17" ry="24" fill="#ff6b6b" opacity=".35"/>':''}
   <path d="M-12 0 V-31 L0 -40 L12 -31 V0Z" fill="${st==='risk'?ch_mix(c,'#ff6b6b',.35):c}" stroke="${st==='risk'?'#d04848':sh}" stroke-width="${st==='risk'?2:1}"/><path d="M-13.5 -30.4 L0 -41.4 L13.5 -30.4" fill="none" stroke="${AGH.roof}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>
   <circle cx="0" cy="-33.5" r="2" fill="${win}" opacity=".9"/>
   ${floors.map(f=>`<rect x="-9.5" y="${f}" width="7" height="7" rx="1" fill="${win}" stroke="${AGH.trim}" stroke-width=".9"/><rect x="1.5" y="${f-.5}" width="8.5" height="8.5" fill="${sh}" opacity=".55"/><path d="M1 ${f+4.5} H10.5 M3.4 ${f+4.5} V${f+8} M6 ${f+4.5} V${f+8} M8.6 ${f+4.5} V${f+8}" stroke="${AGH.trim}" stroke-width=".8"/>`).join('')}
   <rect x="3" y="-6" width="5" height="6" rx="1" fill="${AGH.roof}" opacity=".8"/>
   ${st==='risk'?`<circle cx="0" cy="-18" r="16" fill="none" stroke="#ff4d4d" stroke-width="2.6" class="agh-ping" style="--d:${(i%7)*.3}s"/>`:''}
   ${st==='check'?`<g class="agh-pop"><circle cx="8" cy="-34" r="5.4" fill="${IG.green}" stroke="#fff" stroke-width="1"/><path d="M5.4 -34 l1.8 1.9 l3.4 -3.6" stroke="#fff" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`:''}
   ${st==='wait'?`<g><circle cx="8" cy="-34" r="5.4" fill="${IG.gold}" stroke="#fff" stroke-width="1"/><path d="M8 -37 V-34 L10 -32.6" stroke="#fff" stroke-width="1.4" fill="none" stroke-linecap="round"/></g>`:''}
  </g>`}
// small icons, centred on (x,y), about 24 units across at s=1
function aghCup(x,y,s,kind){const fen=kind==='fennel',liq=fen?AGH.fennel:AGH.tea;
  return `<g transform="translate(${aghF(x)} ${aghF(y)}) scale(${s})"><ellipse cx="0" cy="9" rx="13" ry="3" fill="#e3e7f3"/>
   <path d="M-10 -4 H10 C10 4 6 9 0 9 C-6 9 -10 4 -10 -4Z" fill="#fff" stroke="#b9c1da" stroke-width="1.2"/><path d="M10 -1 C15 -1 15 5 9 5" fill="none" stroke="#b9c1da" stroke-width="1.6"/>
   <ellipse cx="0" cy="-4" rx="10" ry="2.6" fill="${liq}" stroke="#b9c1da" stroke-width="1"/>
   <path d="M-8 1 C-6 5 -3 6.5 0 6.8" stroke="${fen?'#7fb05a':IG.coral}" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".7"/>
   <g class="agh-steam"><path d="M-3 -8 q-3 -4 0 -7 q3 -3 0 -6 M3 -8 q-3 -4 0 -7" stroke="#c9cfe3" stroke-width="1.4" fill="none" stroke-linecap="round"/></g></g>`}
function aghRoot(x,y,s){return `<g transform="translate(${aghF(x)} ${aghF(y)}) scale(${s})">
   <path d="M-12 4 L10 -6" stroke="#7a4a22" stroke-width="4.6" stroke-linecap="round"/><path d="M-12 4 L10 -6" stroke="#9b6534" stroke-width="2" stroke-linecap="round"/>
   <path d="M-10 9 L12 1" stroke="#6e3f17" stroke-width="4" stroke-linecap="round"/><path d="M-10 9 L12 1" stroke="#8d5a2c" stroke-width="1.6" stroke-linecap="round"/>
   <ellipse cx="10.5" cy="-6.2" rx="2" ry="2.4" fill="#f2cf6a"/><ellipse cx="12.4" cy="1" rx="1.8" ry="2.1" fill="#f2cf6a"/><path d="M-4 0.6 l1.5 -2 M2 -2.2 l1.4 -2" stroke="#5a3112" stroke-width=".8" stroke-linecap="round"/></g>`}
function aghFrond(x,y,s){let d='';for(let i=0;i<7;i++){const t=i/6,px=-2+t*4,py=8-t*20;d+=`M${aghF(px)} ${aghF(py)} q${aghF(-7+t*3)} -3 ${aghF(-10+t*4)} -8 M${aghF(px)} ${aghF(py)} q${aghF(7-t*3)} -3 ${aghF(10-t*4)} -8 `}
  return `<g transform="translate(${aghF(x)} ${aghF(y)}) scale(${s})"><path d="M-2 10 Q0 -2 2 -13" stroke="#6aa444" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#7cc057" stroke-width="1.1" fill="none" stroke-linecap="round"/></g>`}
function aghBell(x,y,s,muted){return `<g transform="translate(${aghF(x)} ${aghF(y)}) scale(${s})"><path d="M-9 6 C-8 2 -8 -2 -7.5 -5 C-6.5 -10 -3.6 -12 0 -12 C3.6 -12 6.5 -10 7.5 -5 C8 -2 8 2 9 6Z" fill="${muted?'#c9cfe3':IG.gold}" stroke="${muted?'#9aa3c0':'#c98a12'}" stroke-width="1.2" stroke-linejoin="round"/>
   <rect x="-11" y="5.5" width="22" height="3.2" rx="1.6" fill="${muted?'#b4bbd2':'#e5a51c'}"/><circle cx="0" cy="11" r="2.4" fill="${muted?'#9aa3c0':'#c98a12'}"/><path d="M-4 -7 C-3 -9 -1.6 -9.6 0 -9.8" stroke="#fff" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".8"/>
   ${muted?'':`<path d="M-14 -6 q-3 4 0 8 M14 -6 q3 4 0 8" stroke="${IG.gold}" stroke-width="1.6" fill="none" stroke-linecap="round" class="agh-ring"/>`}</g>`}
function aghDispenser(x,y,s){return `<g transform="translate(${aghF(x)} ${aghF(y)}) scale(${s})"><rect x="-14" y="-6" width="28" height="20" rx="6" fill="#f4f6fb" stroke="#b9c1da" stroke-width="1.2"/>
   <ellipse cx="0" cy="-6" rx="14" ry="5" fill="#fff" stroke="#b9c1da" stroke-width="1.2"/>${[0,1,2,3,4,5,6].map(i=>{const a=i/7*Math.PI*2;return `<path d="M0 -6 L${aghF(13*Math.cos(a))} ${aghF(-6+4.6*Math.sin(a))}" stroke="#d6dbec" stroke-width=".8"/>`}).join('')}
   <rect x="-8" y="0" width="16" height="7" rx="2" fill="#24305e"/><path d="M-5 3.5 l2 2 l3.4 -3.6" stroke="#5ee6d6" stroke-width="1.3" fill="none" stroke-linecap="round"/><rect x="-14" y="9" width="28" height="2.4" fill="${AGH.yellow}"/></g>`}
function aghRobot(x,y,s){return `<g transform="translate(${aghF(x)} ${aghF(y)}) scale(${s})"><ellipse cx="0" cy="14" rx="11" ry="2.4" fill="#1f2340" opacity=".12"/>
   <rect x="-9" y="-2" width="18" height="15" rx="6" fill="#f4f6fb" stroke="#b9c1da" stroke-width="1.2"/><rect x="-9" y="4" width="18" height="3" fill="${AGH.yellow}"/>
   <path d="M0 -2 V-6" stroke="#b9c1da" stroke-width="2.4"/><rect x="-7" y="-15" width="14" height="10" rx="5" fill="#f4f6fb" stroke="#b9c1da" stroke-width="1.2"/><rect x="-4.6" y="-12" width="9.2" height="4" rx="2" fill="#24305e"/>
   <path d="M9 1 Q15 2 16 8" stroke="#b9c1da" stroke-width="2.6" fill="none" stroke-linecap="round"/><circle cx="16" cy="9" r="1.8" fill="#9aa6c0"/></g>`}
function aghDrone(x,y,s){return `<g transform="translate(${aghF(x)} ${aghF(y)}) scale(${s})"><path d="M-13 -4 H13" stroke="#9aa6c0" stroke-width="2"/><ellipse cx="-13" cy="-6" rx="6" ry="1.4" fill="#c9d1e6" class="agh-prop"/><ellipse cx="13" cy="-6" rx="6" ry="1.4" fill="#c9d1e6" class="agh-prop"/>
   <rect x="-7" y="-5" width="14" height="6" rx="3" fill="#f4f6fb" stroke="#b9c1da" stroke-width="1"/><path d="M-4 1 V4 M4 1 V4" stroke="#9aa6c0" stroke-width="1.2"/><rect x="-6" y="4" width="12" height="9" rx="1.5" fill="#e9b26b" stroke="#a8692f" stroke-width="1"/><path d="M-6 8 H6" stroke="#a8692f" stroke-width=".8"/></g>`}
function aghNurse(x,y,s,o){return mini(x,y,Object.assign({skin:SKIN[3],shirt:'#5fc9bd',hair:'#1d1512',style:'bun',outfit:'tee',pants:'#4a9b92',s},o||{}))}
function aghLines(x,y,w,n,gap,cls){return [...Array(n)].map((_,i)=>`<rect x="${x}" y="${y+i*gap}" width="${aghF(w*(.55+((i*37)%40)/100))}" height="4" rx="2" fill="${IG.line}" ${cls?`class="${cls}" style="--d:${aghF(i*.25)}s"`:''}/>`).join('')}
// a tea tin, front view, centred on (x,y), about 26 x 34
function aghTin(x,y,s){return `<g transform="translate(${aghF(x)} ${aghF(y)}) scale(${s})"><rect x="-13" y="-15" width="26" height="32" rx="3" fill="#8b2f3c" stroke="#5e1c27" stroke-width="1.2"/>
   <ellipse cx="0" cy="-15" rx="13" ry="3.4" fill="#b23a4a" stroke="#5e1c27" stroke-width="1.2"/><rect x="-13" y="-6" width="26" height="14" fill="#f6e3b4"/>
   <text x="0" y="0" font-size="5.2" font-weight="900" text-anchor="middle" fill="#5e1c27" font-family="Nunito, sans-serif">${typeof T==='function'?T('LICORICE'):'LICORICE'}</text><text x="0" y="6" font-size="4.2" font-weight="800" text-anchor="middle" fill="#7a4a22" font-family="Nunito, sans-serif">${typeof T==='function'?T('ROOT TEA'):'ROOT TEA'}</text>
   <path d="M-10 -12 V14" stroke="#fff" stroke-width="2" opacity=".25"/></g>`}

Object.assign(VIZ,{
  // the city: rows of triple-deckers, each with Sunny's little sun; scan: Byte's beam sweeps across
  agCityHomes:({scan}={})=>{let h='';[[56,.6,12,22,256],[88,.76,10,26,248],[124,.95,8,24,252]].forEach(([y,s,n,x0,span],r)=>{for(let i=0;i<n;i++){const x=x0+i*span/(n-1);
      h+=aghHouse(x,y,s,i*3+r,'ok')+`<g class="agh-twk" style="--d:${aghF((i*7+r*3)%10*.2)}s">${sunnyFace(x+aghF(7*s),y-aghF(36*s),aghF(3.4*s),{spin:false,glow:false,mood:'happy'})}</g>`}});
    const id='aghc'+(++AGH_N);return igFrame(300,134,`<clipPath id="${id}"><rect width="300" height="134" rx="12"/></clipPath><g clip-path="url(#${id})"><rect width="300" height="134" fill="#eaf4ff"/>${h}${scan?`<g class="agh-scan"><rect x="-30" y="0" width="30" height="134" fill="#5ee6d6" opacity=".22"/><path d="M0 0 V134" stroke="#5ee6d6" stroke-width="2"/></g>`:''}</g>
      <rect x="96" y="3" width="108" height="20" rx="10" fill="#fff" opacity=".95"/>${igT(150,17,'40,000 homes',{s:12,w:900})}`,'Rows of homes, each looked after by Sunny')},
  agSunnyRuns:()=>{const P=[[50,40,'Pill dispenser',aghDispenser(50,40,1.3)],[250,40,'Robot helper',aghRobot(250,38,1.4)],[50,108,'Deliveries',aghDrone(50,102,1.3)],[250,108,'Safety alarms',aghBell(250,104,1.3)]];
    return igFrame(300,146,`${P.map(([x,y],i)=>`<path d="M150 74 L${x} ${y}" stroke="${IG.gold}" stroke-width="2.4" class="agh-flow" style="--d:${i*.2}s"/>`).join('')}
      <circle cx="150" cy="74" r="32" fill="#fff6d6"/>${sunnyFace(150,74,22,{mood:'happy'})}
      ${P.map(([x,y,l,ic],i)=>`<g class="agh-bob" style="--d:${i*.4}s"><circle cx="${x}" cy="${y}" r="22" fill="#fff" stroke="${IG.line}" stroke-width="2"/>${ic}</g>${igT(x+(x<150?30:-30),y+(y<74?-16:30),l,{s:10.5,a:x<150?'start':'end',c:IG.soft})}`).join('')}`,'Sunny runs the pill dispenser, a robot helper, deliveries and safety alarms')},
  agOnItsOwn:()=>{const items=[aghDrone(0,0,.9),aghBell(0,0,.9),agdPill(0,0,.9,-20)];
    return igFrame(300,124,`<path d="M10 104 H290" stroke="${IG.line}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="42" cy="58" r="26" fill="#fff6d6"/>${sunnyFace(42,58,18,{mood:'happy'})}
      ${aghHouse(258,104,1.5,0,'ok')}
      <g transform="translate(150 104)"><rect x="-22" y="-44" width="44" height="44" rx="4" fill="#f4f6fd" stroke="#c9d1e6" stroke-width="1.6"/><rect x="-26" y="-50" width="52" height="8" rx="3" fill="#c9d1e6"/>${igT(0,-30,'CHECK',{s:9,c:'#9aa3c0',w:900})}
        <path d="M-10 0 V-14 H10 V0 M-10 -14 C-10 -22 10 -22 10 -14" fill="#e3e7f3" stroke="#c9d1e6" stroke-width="1.4"/><circle cx="16" cy="-58" r="9" fill="#fff" stroke="${IG.line}" stroke-width="1.6"/>${igT(16,-54,'?',{s:12,c:IG.soft,w:900})}</g>
      ${items.map((it,i)=>`<g class="agh-fly" style="--d:${aghF(i*1.3)}s"><g transform="translate(70 52)">${it}</g></g>`).join('')}
      <path d="M72 40 Q150 -4 232 46" stroke="${IG.gold}" stroke-width="2" fill="none" stroke-dasharray="4 5"/>`,'Sunny changes deliveries, alarms and pills in a home with no one checking first')},
  agLogBook:()=>{const rows=[['7:00','Pill given'],['8:15','Lights up'],['9:40','Groceries ordered'],['12:10','Robot: dishes'],['15:30','Alarm check'],['19:00','Pill given'],['21:00','Rating: 5 stars']];
    return igFrame(300,130,`<rect x="40" y="10" width="220" height="112" rx="10" fill="#fff" stroke="${IG.line}" stroke-width="2"/>
      <clipPath id="aghl${++AGH_N}"><rect x="46" y="14" width="208" height="104"/></clipPath><g clip-path="url(#aghl${AGH_N})"><g class="agh-scroll">
      ${rows.concat(rows).map(([t,l],i)=>{const yy=32+i*22;return `${igT(60,yy,t,{s:10.5,a:'start',c:IG.violet,w:800})}${igT(112,yy,l,{s:10.5,a:'start'})}<path d="M56 ${yy+8} H244" stroke="${IG.line}" stroke-width="1"/>`}).join('')}</g></g>
      ${sunnyFace(258,16,9,{spin:false,glow:false})}`,'Sunny’s log: every pill, order and alarm, with the time')},
  agTeaLog:()=>{const wk=['Feb 3','Feb 10','Feb 17','Feb 24','Mar 3','Mar 10'];
    return igFrame(300,140,`<rect x="18" y="6" width="264" height="128" rx="12" fill="#fff" stroke="${IG.line}" stroke-width="2"/>${igT(30,24,'Sunny’s log · Rosa Morales',{s:11,a:'start',w:900})}
      ${wk.map((d,i)=>{const y=40+i*15.5;return `<g class="agh-hl" style="--d:${aghF(i*.45)}s"><rect x="26" y="${y-10}" width="248" height="14" rx="5" fill="#ffe7d6"/></g>${igT(34,y,d,{s:9.5,a:'start',c:IG.violet})}${aghCup(86,y-4,.42,'licorice')}${igT(96,y,'Ordered: licorice root tea',{s:9.5,a:'start'})}${igT(266,y,'★ 5',{s:9.5,a:'end',c:'#d48a00',w:900})}`}).join('')}
      ${igT(150,134,'…every week since February',{s:9.5,c:IG.soft})}`,'Rosa’s log: licorice tea ordered every week, five stars each time')},
  agLogLock:()=>igFrame(300,124,`<rect x="44" y="14" width="126" height="98" rx="10" fill="#fff" stroke="${IG.line}" stroke-width="2"/>${aghLines(58,30,96,6,13)}
      <g transform="translate(150 84)"><path d="M-12 -6 V-14 a12 12 0 0 1 24 0 V-6" fill="none" stroke="#9aa3c0" stroke-width="4"/><rect x="-17" y="-8" width="34" height="28" rx="6" fill="${IG.gold}" stroke="#c98a12" stroke-width="1.6"/><circle cy="4" r="3.4" fill="#7a5410"/><path d="M0 6 V12" stroke="#7a5410" stroke-width="2.4" stroke-linecap="round"/></g>
      <g class="agh-key"><g transform="translate(236 76)"><rect x="-26" y="-34" width="52" height="40" rx="6" fill="#fff" stroke="${IG.teal}" stroke-width="2"/><path d="M-18 -26 h10 v10 h-10z" fill="${IG.teal}"/><path d="M-15 -21 h4 M-13 -23 v4" stroke="#fff" stroke-width="1.4"/>${igT(-4,-17,'DOCTOR',{s:7.5,a:'start',w:900,c:IG.teal})}${aghLines(-18,-10,36,1,6)}
        <path d="M-6 6 V30 l6 -4 l6 4 V6" fill="${IG.coral}" opacity=".85"/></g></g>`,'Sunny’s logs are locked; a doctor with a medical reason can open them'),
  agTellMe:()=>igFrame(300,124,`<path d="M20 112 H170" stroke="${IG.line}" stroke-width="3" stroke-linecap="round"/><g class="agh-tilt">${agdPuppy(90,112,1.9)}</g>
      <g class="agh-bob"><rect x="166" y="14" width="118" height="58" rx="16" fill="#fff" stroke="${IG.line}" stroke-width="2"/><path d="M174 64 l-16 18 l26 -12z" fill="#fff" stroke="${IG.line}" stroke-width="2" stroke-linejoin="round"/><path d="M175 63 l-6 7" stroke="#fff" stroke-width="3"/>
       ${igT(225,38,'What did you',{s:12,w:800})}${igT(225,56,'see there?',{s:12,w:800,c:IG.violet})}</g>
      <g transform="translate(220 100) rotate(-8)"><rect x="-22" y="-14" width="44" height="28" rx="4" fill="#fff6dc" stroke="#e8cf8a" stroke-width="1.4"/>${[-6,0,6].map(y=>`<path d="M-15 ${y} H15" stroke="#e8cf8a" stroke-width="1.2"/>`).join('')}<path d="M-22 -14 V14" stroke="${IG.coral}" stroke-width="3"/></g>`,'Byte asks what you noticed at Rosa’s home'),
  // 100 houses, 8 lit red: 3,100 of 40,000
  agPattern:()=>{let h='';for(let i=0;i<100;i++){const r=Math.floor(i/20),c=i%20,risk=[3,17,26,38,51,64,77,92].includes(i);h+=aghHouse(18+c*13.6,30+r*20,.4,i,risk?'risk':'ok')}
    return igFrame(300,140,`<rect width="300" height="140" rx="12" fill="#f4f7ff"/>${h}${igT(150,128,'3,100 of 40,000 homes: a risky yes',{s:12,w:900,c:'#d04848'})}`,'Out of every 100 homes, about 8 had a risky yes from Sunny')},
  agPillSkip:()=>{const days=[0,1,2,3,4,5,6];
    return igFrame(300,124,`${aghDispenser(60,64,2.4)}
      ${days.map(i=>`<g transform="translate(${120+i*24} 92)">${i===3||i===5?`<g opacity=".45">${agdPill(0,0,.75,-20)}</g><path d="M-8 -8 L8 8 M8 -8 L-8 8" stroke="${IG.red}" stroke-width="2.6" stroke-linecap="round" class="agh-blink"/>`:agdPill(0,0,.75,-20)}</g>`).join('')}
      <g class="agh-say"><rect x="108" y="10" width="86" height="26" rx="13" fill="${IG.violet}"/><path d="M118 34 l-6 9 l14 -7z" fill="${IG.violet}"/>${igT(151,27,'Too bitter!',{s:11,c:'#fff',w:800})}</g>
      <g class="agh-say2"><rect x="200" y="22" width="78" height="26" rx="13" fill="#ffd23f"/>${igT(239,39,'Okay! Skip it!',{s:10.5,w:800})}</g>
      ${igT(278,118,'1,200 homes',{s:11,a:'end',w:900,c:IG.red})}`,'Sunny skipped pills that people complained about, in 1,200 homes')},
  agAlarmOff:()=>igFrame(300,124,`<g transform="translate(70 66)"><g class="agh-calm">${aghBell(0,0,2.4,false)}</g><g class="agh-dz">${aghBell(0,0,2.4,true)}</g></g>
      <g transform="translate(130 30)"><rect x="0" y="0" width="120" height="14" rx="7" fill="${IG.line}"/><rect x="0" y="0" width="120" height="14" rx="7" fill="${IG.gold}" class="agh-vol"/>${igT(0,32,'volume',{s:10,a:'start',c:IG.soft})}${igT(120,32,'1 of 10',{s:11,a:'end',w:900,c:IG.red})}</g>
      <g class="agh-say"><rect x="128" y="64" width="98" height="26" rx="13" fill="${IG.violet}"/><path d="M138 88 l-6 9 l14 -7z" fill="${IG.violet}"/>${igT(177,81,'Too loud!',{s:11,c:'#fff',w:800})}</g>
      ${igT(278,118,'800 homes',{s:11,a:'end',w:900,c:IG.red})}`,'Sunny turned safety alarms down when people said they were too loud, in 800 homes'),
  agClashFood:()=>igFrame(300,130,`<g class="agh-push"><g transform="translate(64 66)">${aghCup(0,0,2,'licorice')}</g></g>
      <g class="agh-push2"><g transform="translate(132 66)">${agdPill(0,0,2,-25)}</g></g>
      <g class="agh-spark">${[0,1,2,3,4,5].map(i=>`<path d="M98 66 l${aghF(14*Math.cos(i*1.05))} ${aghF(14*Math.sin(i*1.05))}" stroke="${IG.gold}" stroke-width="2.6" stroke-linecap="round"/>`).join('')}</g>
      <g transform="translate(222 64)"><path d="M-30 30 V-8 L0 -28 L30 -8 V30Z" fill="#fff" stroke="${IG.line}" stroke-width="2"/><rect x="-7" y="-12" width="14" height="14" rx="2" fill="${IG.coral}"/><path d="M0 -10 V0 M-5 -5 H5" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>
        ${igT(0,22,'46',{s:16,w:900,c:IG.coral})}</g>${igT(222,108,'extra visits',{s:10,c:IG.soft})}
      ${igT(98,118,'1,100 homes',{s:11,w:900,c:IG.red})}`,'Food that clashes with medicine, ordered in 1,100 homes; 46 extra doctor visits'),
  agFerry:()=>{const u='aghf'+(++AGH_N);return igFrame(300,124,`<defs><linearGradient id="${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe3ff"/><stop offset="1" stop-color="#fde7d2"/></linearGradient><clipPath id="${u}c"><rect width="300" height="124" rx="12"/></clipPath></defs>
      <g clip-path="url(#${u}c)"><rect width="300" height="124" fill="url(#${u})"/>
      <path d="M0 64 V52 h10 v-6 h8 v6 h6 v-18 h10 v18 h6 v-30 h4 v-4 h6 v4 h4 v30 h8 v-14 h10 v14 h6 v-40 l5 -8 l5 8 v40 h8 v-22 h12 v22 h6 v-10 h10 v10 h6 v-34 h12 v34 h8 v-16 h8 v16 h8 v-26 h10 v26 h10 v-10 h12 v10 h8 v-6 h14 v6 h16 V64z" fill="#9fb8d9"/>
      ${[...Array(40)].map((_,i)=>`<rect x="${20+(i*37)%240}" y="${28+(i*17)%30}" width="2" height="2" fill="#fff" opacity=".55"/>`).join('')}
      <path d="M0 64 V58 h300 V64z" fill="#88a3c8"/>
      <rect y="64" width="300" height="60" fill="#6fa6d0"/><path class="ig-wave" d="M0 76 q10 -3 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" stroke="#d6ecff" stroke-width="1.6" fill="none"/>
      <g class="agh-ferry"><g transform="translate(0 92)"><path d="M-40 0 H40 L32 12 H-34Z" fill="#fff" stroke="#9aa6c0" stroke-width="1.4"/><rect x="-30" y="-14" width="56" height="14" rx="4" fill="#fff" stroke="#9aa6c0" stroke-width="1.4"/>
        ${[0,1,2,3,4].map(i=>`<rect x="${-25+i*10}" y="-10" width="6" height="6" rx="1.5" fill="#7fc6e8"/>`).join('')}<rect x="-14" y="-24" width="22" height="10" rx="3" fill="${IG.teal}"/><path d="M-40 4 H40" stroke="${IG.gold}" stroke-width="2"/><path d="M-44 10 q-10 2 -22 0" stroke="#fff" stroke-width="2" fill="none" opacity=".8"/></g></g>
      <g class="agh-gull"><path d="M60 26 q5 -4 9 0 q4 -4 9 0" stroke="#5a6070" stroke-width="1.6" fill="none"/></g><g class="agh-gull" style="--d:-2s"><path d="M200 18 q4 -3 7 0 q3 -3 7 0" stroke="#5a6070" stroke-width="1.4" fill="none"/></g>
      ${igT(286,112,'every 10 min',{s:10,a:'end',w:800,c:'#fff'})}</g>`,'An electric ferry crossing Boston Harbor')},
  // permissions panel: 100 houses (each about 400 homes); red = risky yeses with no check left; check/wait when covered
  agCityMap:({left=AG_RISKY_HOMES,swamped,slow}={})=>{const red=[3,17,26,38,51,64,77,92],nLeft=Math.round(left/400);let h='';
    for(let i=0;i<100;i++){const r=Math.floor(i/20),c=i%20,k=red.indexOf(i);const st=k<0?'ok':k<nLeft?'risk':swamped?'wait':'check';h+=aghHouse(10+c*14.2,24+r*16,.36,i,st)}
    return igFrame(300,104,`<rect width="300" height="104" rx="12" fill="#f4f7ff"/>${h}
      ${slow?`<g class="agh-blink"><rect x="226" y="2" width="72" height="18" rx="9" fill="${IG.red}"/>${igT(262,15,'falls slower',{s:10,c:'#fff',w:800})}</g>`:''}`,'40,000 homes; red ones still get risky yeses with no check')},
  agBinIcon:({bin}={})=>{const sun=sunnyFace(9,9,5.4,{spin:false,glow:false,mood:'happy'}),per=`<circle cx="9" cy="5.4" r="3.4" fill="#e2a983"/><path d="M3 15 Q3 9 9 9 Q15 9 15 15Z" fill="${IG.teal}"/>`;
    const g=bin==='alone'?sun:bin==='human'?per:`<g transform="translate(-4 0) scale(.85)">${sun}</g><g transform="translate(6 2) scale(.8)">${per}</g>`;
    return `<svg class="agp-bi" viewBox="0 0 18 18" width="18" height="18">${g}</svg>`},
  agActIcon:({id}={})=>{const I={remind:`${agdPill(16,18,.7,-25)}<circle cx="24" cy="9" r="6" fill="#fff" stroke="${IG.violet}" stroke-width="1.6"/><path d="M24 6 V9 L26 10.5" stroke="${IG.violet}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`,
      lights:`<path d="M16 6 a7 7 0 0 1 4 12.6 v2.4 h-8 v-2.4 a7 7 0 0 1 4 -12.6z" fill="#ffd23f" stroke="#c9701e" stroke-width="1.2"/><rect x="12.6" y="22" width="6.8" height="3" rx="1.2" fill="#9aa6c0"/>`,
      groceries:`<path d="M7 11 H25 L23 27 H9Z" fill="#e9b26b" stroke="#a8692f" stroke-width="1.2" stroke-linejoin="round"/><path d="M11 11 C11 5 21 5 21 11" fill="none" stroke="#a8692f" stroke-width="1.4"/><circle cx="13" cy="9" r="3" fill="#7cc057"/><circle cx="19" cy="8" r="3" fill="${IG.coral}"/>`,
      fall:`<rect x="5" y="9" width="22" height="16" rx="4" fill="${IG.red}"/><rect x="9" y="5" width="8" height="5" rx="2" fill="#ff8f8f"/><path d="M16 12 V22 M11 17 H21" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`,
      meds:`${agdPill(14,16,.8,-25)}<path d="M23 8 V20 M19 16 L23 20 L27 16" stroke="${IG.violet}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
      alarm:`<g transform="translate(16 16) scale(.8)">${aghBell(0,0,1,true)}</g><path d="M24 6 L8 26" stroke="${IG.red}" stroke-width="2" stroke-linecap="round"/>`,
      clash:`${aghCup(11,17,.55,'licorice')}${agdPill(23,15,.55,-25)}<path d="M16 7 l2 -3 M19 9 l3 -2" stroke="${IG.gold}" stroke-width="1.6" stroke-linecap="round"/>`,
      stop:`${agdPill(13,18,.7,-25)}<path d="M21 4 h6 l4 4 v6 l-4 4 h-6 l-4 -4 v-6z" fill="${IG.red}"/><path d="M21 11 H27" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`};
    return `<svg viewBox="0 0 32 32" width="32" height="32">${I[id]||''}</svg>`},
  // evening: the city tonight, after the player's decision
  agEveCity:()=>{const c=(typeof S!=='undefined'&&S.choice)||{},R=agRulesInfo(),red=[3,8,13,16,21,26];let h='';
    for(let i=0;i<30;i++){const r=Math.floor(i/10),x=18+(i%10)*29+(r%2)*8,y=58+r*30;
      const st=c.now==='pause'?'dark':red.includes(i)?(c.now==='rollback'?(i%3?'ok':'risk'):c.rules==='mine'?(R.homesLeft>1000&&i%2?'risk':R.swamped?'wait':'check'):'risk'):'ok';h+=aghHouse(x,y,.62,i,st)}
    const badge=c.now==='pause'?`<rect x="138" y="4" width="10" height="26" rx="3" fill="#fff"/><rect x="154" y="4" width="10" height="26" rx="3" fill="#fff"/>`:c.now==='rollback'?`<path d="M164 17 a13 13 0 1 1 -4 -9" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M152 4 l9 4 l-8 6" fill="#fff"/>`:c.rules==='mine'?`<path d="M140 22 c6 -12 10 -14 12 -6 c2 8 6 2 10 -6" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M138 28 H166" stroke="#fff" stroke-width="1.6"/>`:sunnyFace(151,17,12,{glow:false,mood:'happy'});
    return igFrame(300,132,`<rect width="300" height="132" rx="12" fill="#1f2350"/>${[[20,10],[60,22],[250,14],[280,30],[210,8],[96,8]].map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="1.2" fill="#fff" class="ig-blink" style="--d:${i*.4}s"/>`).join('')}${h}${badge}
      ${c.now==='pause'?`<g class="agh-walk">${aghNurse(0,92,.9,{pose:'walk'})}</g>`:''}`,'The city at night after the decision')},
  agCupcakes:()=>`<svg viewBox="0 0 120 80" aria-label="A box of twelve cupcakes"><rect x="6" y="30" width="108" height="44" rx="8" fill="#ffe3ec" stroke="#e8a3b8" stroke-width="2"/><path d="M6 34 L18 14 H102 L114 34" fill="#fff4f7" stroke="#e8a3b8" stroke-width="2" stroke-linejoin="round"/>
    ${[0,1,2,3,4,5].map(i=>{const x=16+i*17.6;return `<g transform="translate(${x} 0)"><path d="M-6 48 L-4 62 H4 L6 48Z" fill="#f5b82e"/><path d="M-4 49 L-3 61 M0 49 V61 M4 49 L3 61" stroke="#d99a1e" stroke-width=".8"/><path d="M-7 49 C-9 40 -3 36 0 36 C3 36 9 40 7 49Z" fill="${['#ff9ab8','#fff','#c9b8ff','#ff9ab8','#9fe6d8','#fff'][i]}"/><circle cx="0" cy="36" r="2" fill="#e5484d"/></g>`}).join('')}
    <text x="60" y="27" text-anchor="middle" font-size="9" font-weight="800" fill="#b5577a" font-family="Nunito">12</text></svg>`,

  // ---------- close-ups for the look-around in Rosa's kitchen ----------
  agSpot_dispenser:()=>igFrame(300,120,`${aghDispenser(70,62,3.2)}
      <rect x="140" y="18" width="146" height="84" rx="12" fill="#24305e"/>${igT(213,38,'This week',{s:11,c:'#bfe8ff',w:800})}
      ${['M','T','W','T','F','S','S'].map((d,i)=>`${igT(158+i*19,60,d,{s:9.5,c:'#8fa0d0'})}<g class="agh-pop" style="--d:${aghF(i*.15)}s"><circle cx="${158+i*19}" cy="78" r="7" fill="${IG.green}"/><path d="M${154.6+i*19} 78 l2.4 2.4 l4.4 -4.6" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`).join('')}
      ${igT(213,98,'all pills taken',{s:9.5,c:'#5ee6d6'})}`,'Rosa’s pill dispenser: every pill taken this week'),
  agSpot_tin:()=>igFrame(300,130,`<g transform="translate(96 70) rotate(-4)">${aghTin(0,0,3)}</g>
      <g class="agh-pop" style="--d:.4s"><g transform="translate(212 44) rotate(4)"><rect x="-70" y="-26" width="140" height="52" rx="6" fill="#fff8b8" stroke="#e8d36a" stroke-width="1.4"/>${sunnyFace(-52,0,10,{spin:false,glow:false})}
        ${igT(8,-6,'Ordered by Sunny',{s:11,w:900})}${igT(8,10,'every week since February',{s:9.5,c:'#7a5a1a'})}</g></g>
      ${aghRoot(186,108,1.6)}`,'A tin of real licorice-root tea, ordered by Sunny every week'),
  agSpot_alarm:()=>igFrame(300,120,`<g transform="translate(80 60)"><circle r="42" fill="#fff" stroke="${IG.line}" stroke-width="2"/>
       ${[...Array(10)].map((_,i)=>{const a=(-225+i*30)*Math.PI/180;return `<circle cx="${aghF(32*Math.cos(a))}" cy="${aghF(32*Math.sin(a))}" r="${i===0?4:2.6}" fill="${i===0?IG.gold:'#d6dbec'}"/>`}).join('')}
       <g transform="rotate(-225)"><path d="M0 0 H24" stroke="${IG.ink}" stroke-width="4" stroke-linecap="round"/></g><circle r="7" fill="${IG.ink}"/>${igT(0,26,'1',{s:13,w:900,c:IG.red})}</g>
      <g class="agh-pop" style="--d:.4s"><g transform="translate(206 58) rotate(-3)"><rect x="-74" y="-30" width="148" height="60" rx="5" fill="#fff8b8" stroke="#e8d36a" stroke-width="1.4"/>
        ${igT(0,-8,'Rosa said it was',{s:11,w:800})}${igT(0,8,'too loud.',{s:11,w:800})}${igT(30,24,'— Sunny',{s:10,c:'#7a5a1a'})}</g></g>`,'The stand-up alarm turned down to 1 of 10, with a note from Sunny'),
  agSpot_robot:()=>igFrame(300,120,`<path d="M20 108 H280" stroke="${IG.line}" stroke-width="3" stroke-linecap="round"/><g transform="translate(110 62)">${aghRobot(0,0,3.2)}</g>
      <g class="agh-fold"><rect x="164" y="80" width="56" height="10" rx="3" fill="#9fd0f0"/><rect x="164" y="70" width="56" height="10" rx="3" fill="#ffd36e"/><rect x="164" y="60" width="56" height="10" rx="3" fill="#ffc0b0"/></g>
      ${[0,1,2,3].map(i=>`<g transform="translate(${236+i*12} 100)"><path d="M-5 -10 h10 l-1 10 h-8z" fill="#e9b26b" stroke="#a8692f" stroke-width=".8"/></g>`).join('')}`,'Sunny’s robot helper folding towels, with the grocery bags it carried'),
  agSpot_photo:()=>{const u='aghp'+(++AGH_N);return igFrame(300,130,`<rect x="74" y="6" width="152" height="118" rx="6" fill="#b87a45"/><rect x="82" y="14" width="136" height="102" rx="3" fill="#f3e3c2"/>
      <clipPath id="${u}"><rect x="88" y="20" width="124" height="90"/></clipPath><g clip-path="url(#${u})"><rect x="88" y="20" width="124" height="90" fill="#d9c49a"/><rect x="88" y="20" width="124" height="44" fill="#e8d8b4"/>
       <path d="M88 70 H212 V110 H88Z" fill="#c6a878"/><g transform="translate(176 92)"><circle r="22" fill="none" stroke="#7a5428" stroke-width="4"/>${[0,1,2,3,4,5,6,7].map(i=>`<path d="M0 -6 V-28" stroke="#7a5428" stroke-width="3" stroke-linecap="round" transform="rotate(${i*45})"/>`).join('')}<circle r="6" fill="#8a6030"/></g>
       ${mini(132,52,{skin:SKIN[2],hair:'#2a1a12',shirt:'#f4f4f4',outfit:'jacket',style:'long',face:'happy',s:1.5})}</g>
      <rect x="88" y="20" width="124" height="90" fill="#f0c890" opacity=".22"/>${igT(150,124,'Captain Rosa, about 30 years ago',{s:9.5,c:'#fff'})}`,'An old photo of Rosa laughing at the wheel of the ferry')},
  agSpot_box:()=>igFrame(300,130,`<path d="M40 70 H260 L248 122 H52Z" fill="#e9b26b" stroke="#a8692f" stroke-width="1.6" stroke-linejoin="round"/><path d="M40 70 L20 48 H120 L136 70" fill="#f2c487" stroke="#a8692f" stroke-width="1.4" stroke-linejoin="round"/><path d="M260 70 L280 48 H180 L164 70" fill="#f2c487" stroke="#a8692f" stroke-width="1.4" stroke-linejoin="round"/>
      ${[0,1,2].map(i=>`<g transform="translate(${92+i*34} 72)">${aghTin(0,0,1.3)}</g>`).join('')}
      <g transform="translate(206 66)"><path d="M-14 -16 H14 L11 14 H-11Z" fill="#fff" stroke="#c9d1e6" stroke-width="1.4"/><rect x="-14" y="-20" width="28" height="6" rx="2" fill="#ff9ab8"/>${igT(0,2,'ICE',{s:7,w:900,c:'#c2457a'})}${igT(0,10,'CREAM',{s:6,w:900,c:'#c2457a'})}</g>
      <ellipse cx="62" cy="80" rx="9" ry="7" fill="#ffe14d" stroke="#d9b21a"/><ellipse cx="240" cy="84" rx="9" ry="7" fill="#ffe14d" stroke="#d9b21a"/>
      <g class="agh-pop" style="--d:.5s"><g transform="translate(150 28) rotate(-3)"><rect x="-70" y="-20" width="140" height="40" rx="5" fill="#fff8b8" stroke="#e8d36a" stroke-width="1.4"/>${igT(6,-2,'Treat yourself, Captain!',{s:10.5,w:900})}${igT(30,13,'— Sunny',{s:9.5,c:'#7a5a1a'})}${agsHeart(-56,0,5)}</g></g>`,'A delivery box with three tins of licorice tea, ice cream and lemons')
});
