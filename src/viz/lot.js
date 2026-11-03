// lot.js (viz) — Byte's looping pictures for "The Flood Lot": one per document sentence, plus the monsoon lesson.
// Uses igFrame/igT from infog.js and the Phoenix art kit (LX, lx*) from src/viz/lot_art.js (called at runtime only).
// Last summer's flood days (summer 2039): two small storms on water-night Tuesdays, two big storms.
const LOT_FLOODS=[{m:'Jul',d:12,dow:2,rain:.8,back:1},{m:'Jul',d:30,dow:6,rain:1.7},{m:'Aug',d:9,dow:2,rain:.9,back:1},{m:'Aug',d:25,dow:4,rain:2.1}];
// chance the street stays dry in a big storm, from storage alone (what the memo chart shows)
function lotDryP(c){const H=lotHold(c),told=typeof S!=='undefined'&&!!S.told;return told?(1-LOT.alley)*lotPDry(H)+LOT.alley*lotPDry(H-LOT.alleyCut):lotPDry(H)}
const lxDropPath=(x,y,r)=>`M${x} ${y-r*1.5} C${x+r*.6} ${y-r*.6} ${x+r} ${y-r*.1} ${x+r} ${y+r*.35} C${x+r} ${y+r*.95} ${x+r*.5} ${y+r*1.2} ${x} ${y+r*1.2} C${x-r*.5} ${y+r*1.2} ${x-r} ${y+r*.95} ${x-r} ${y+r*.35} C${x-r} ${y-r*.1} ${x-r*.6} ${y-r*.6} ${x} ${y-r*1.5}Z`;
const lxHomeIcon=(x,y,s,c)=>`<path d="M${x-6*s} ${y} V${y-6*s} L${x} ${y-11*s} L${x+6*s} ${y-6*s} V${y}Z" fill="${c||'#e3c9a6'}" stroke="#a8825c" stroke-width="${.8*s}"/><rect x="${x-1.6*s}" y="${y-4*s}" width="${3.2*s}" height="${4*s}" fill="#9a6a48"/>`;
const lxPerson=(x,y,s,c)=>`<circle cx="${x}" cy="${y-9*s}" r="${2.6*s}" fill="${c}"/><path d="M${x-3.4*s} ${y} C${x-3.4*s} ${y-6*s} ${x+3.4*s} ${y-6*s} ${x+3.4*s} ${y}Z" fill="${c}"/>`;
const lxBot=(x,y,s,c)=>`<rect x="${x-3*s}" y="${y-10*s}" width="${6*s}" height="${5*s}" rx="${1.6*s}" fill="#f5f6fa" stroke="#9aa1b4" stroke-width="${.5*s}"/><rect x="${x-4*s}" y="${y-5.4*s}" width="${8*s}" height="${5.4*s}" rx="${1.8*s}" fill="#f5f6fa" stroke="#9aa1b4" stroke-width="${.5*s}"/><rect x="${x-4*s}" y="${y-3.6*s}" width="${8*s}" height="${1.2*s}" fill="${c||LX.orange}"/><rect x="${x-2*s}" y="${y-8.6*s}" width="${4*s}" height="${1.4*s}" rx=".6" fill="#2c3550"/>`;
const lxThermo=(x,y,h,frac,col,cls)=>`<rect x="${x-4}" y="${y-h}" width="8" height="${h}" rx="4" fill="#fff" stroke="#9aa3b8" stroke-width="1.2"/><circle cx="${x}" cy="${y+3}" r="7" fill="${col}" stroke="#9aa3b8" stroke-width="1.2"/><rect x="${x-2}" y="${y-h*frac}" width="4" height="${h*frac+2}" rx="2" fill="${col}" class="${cls||''}"/>`;
Object.assign(VIZ,{
  // ---- Byte's memo ----
  lotSlope:()=>{const gy=x=>34+x*.27;return igFrame(300,130,`${lxRain(0,300,2,50,26)}
    <path d="M0 ${gy(0)} L220 ${gy(220)} C232 ${gy(232)+2} 240 112 254 112 L300 112 V130 H0Z" fill="${LX.sandL}"/><path d="M0 ${gy(0)} L220 ${gy(220)} C232 ${gy(232)+2} 240 112 254 112 L300 112" stroke="${LX.sandD}" stroke-width="2" fill="none"/>
    ${[0,1,2,3,4,5].map(i=>{const x=14+i*36;return lxHouse(x,gy(x+10)+1,22,14,{c:['#e7cfae','#f0dcc2','#dcc0a0'][i%3],r:['#b9805a','#a5653f','#c48a5c'][i%3]})}).join('')}
    <path d="M4 ${gy(4)+3} L220 ${gy(220)+3} C232 ${gy(232)+5} 240 109 262 109" stroke="${LX.water}" stroke-width="3" fill="none" stroke-dasharray="7 6" class="lot-flowdash" stroke-linecap="round"/>
    <ellipse cx="274" cy="112" rx="22" ry="5" fill="${LX.water}" class="lot-pulse"/>
    ${igT(66,20,'Rain from 140 homes…',{s:11})}${igT(270,98,'The lot',{s:11,c:'#b1561f'})}`,'Rain running downhill from 140 homes to the lot')},
  lotGauge:()=>igFrame(300,140,`${lxCloud(92,24,1.1)}${lxRain(70,116,22,40,8)}
    <rect x="72" y="42" width="40" height="84" rx="7" fill="#f2fbff" stroke="#9fc3dc" stroke-width="2"/><clipPath id="lgcl"><rect x="74" y="44" width="36" height="80" rx="5"/></clipPath>
    <g clip-path="url(#lgcl)"><rect x="74" y="70" width="36" height="54" fill="${LX.water}" class="lot-fillup" style="animation-duration:6s"/></g>
    ${[0,.5,1,1.5,2].map(v=>{const y=124-v*36;return `<path d="M112 ${y} h6" stroke="#6a7a90" stroke-width="1.4"/>${igT(126,y+4,v===0?'0':String(v),{s:9,c:'#6a7a90',a:'start'})}`}).join('')}
    <path d="M70 70 h46" stroke="${LX.red}" stroke-width="2" stroke-dasharray="4 3"/>
    <g transform="translate(212 80)"><circle r="32" fill="#fff" stroke="${LX.teal}" stroke-width="4"/>${[0,1,2,3,4,5,6,7,8,9,10,11].map(k=>`<circle cx="${26*Math.sin(k*Math.PI/6)}" cy="${-26*Math.cos(k*Math.PI/6)}" r="${k%3?1.2:2.4}" fill="${IG.soft}"/>`).join('')}
      <path d="M0 0 L0 -26 A26 26 0 1 1 -.1 -26Z" fill="${LX.teal}" opacity=".18" class="lot-pulse"/><g class="lot-sweep"><path d="M0 0 V-24" stroke="${IG.ink}" stroke-width="3" stroke-linecap="round"/></g><circle r="3.4" fill="${IG.ink}"/></g>
    ${igT(92,138,'1.5 inches of rain',{s:11})}${igT(212,128,'in about an hour',{s:11})}`,'A rain gauge filling to 1.5 inches in about an hour'),
  lotDrain:()=>igFrame(300,140,`<path d="M0 60 H140 V74 H0Z" fill="${LX.asph}"/><path d="M0 60 H140" stroke="${LX.concD}" stroke-width="2"/>
    <rect x="0" y="52" width="140" height="8" fill="${LX.water}" opacity=".75" class="lot-slosh"/>${[0,1,2].map(i=>`<path d="M${8+i*30} 48 l14 0 l-4 -4 M${22+i*30} 48 l-4 4" stroke="${LX.waterD}" stroke-width="1.8" fill="none" stroke-linecap="round" class="lot-blink" style="--d:${i*.3}s"/>`).join('')}
    <rect x="96" y="60" width="26" height="26" rx="3" fill="#4d4a55"/><rect x="99" y="62" width="20" height="4" fill="#2d2a35"/>${[0,1,2,3].map(i=>`<path d="M${101+i*5} 62 v4" stroke="#8a8796" stroke-width="1"/>`).join('')}
    <path d="M109 86 V104 H150" stroke="#6d6a74" stroke-width="7" fill="none"/><path d="M109 86 V104 H150" stroke="${LX.water}" stroke-width="3" fill="none" stroke-dasharray="5 4" class="lot-flowdash"/>
    ${igT(110,124,'Drain: 1.4 inches',{s:11})}
    <path d="M142 52 C156 44 160 40 170 40" stroke="${LX.waterD}" stroke-width="2.4" fill="none" stroke-dasharray="5 4" class="lot-flowdash"/><path d="M166 35 l6 5 l-7 3" fill="none" stroke="${LX.waterD}" stroke-width="2"/>
    ${Array.from({length:23},(_,i)=>{const x=184+(i%6)*18,y=26+Math.floor(i/6)*22;return `<g>${lxHomeIcon(x,y,1)}<rect x="${x-7}" y="${y-2.6}" width="14" height="3" rx="1.2" fill="${LX.water}" class="lot-floodh" style="--d:${(i*.12).toFixed(2)}s"/></g>`}).join('')}
    ${igT(238,124,'The rest: 23 homes flood',{s:11})}`,'One drain takes 1.4 inches; the rest floods 23 homes'),
  lotBasin:()=>igFrame(300,130,`<path d="M0 50 H60 C80 50 84 92 120 92 H180 C216 92 220 50 240 50 H300 V130 H0Z" fill="${LX.sandL}"/>
    <path d="M0 50 H60 C80 50 84 92 120 92 H180 C216 92 220 50 240 50 H300" stroke="#8fae55" stroke-width="4" fill="none"/>
    <clipPath id="lbcl"><path d="M60 50 C80 50 84 92 120 92 H180 C216 92 220 50 240 50Z"/></clipPath><g clip-path="url(#lbcl)"><rect x="60" y="50" width="180" height="42" fill="${LX.water}" class="lot-bcycle"/></g>
    <g class="lot-ph1"><path d="M8 40 C30 36 44 40 62 50" stroke="${LX.waterD}" stroke-width="2.4" fill="none" stroke-dasharray="5 4" class="lot-flowdash"/>${lxRain(20,280,0,36,20)}</g>
    <path d="M178 92 V108 H230" stroke="#6d6a74" stroke-width="5" fill="none"/><g class="lot-ph3"><path d="M178 92 V108 H230" stroke="${LX.water}" stroke-width="2" fill="none" stroke-dasharray="3 4" class="lot-flowdash"/></g>
    <g class="lot-ph2" transform="translate(150 70)"><circle r="11" fill="#fff" stroke="${IG.ink}" stroke-width="1.6"/><path d="M0 0 V-7 M0 0 L5 2" stroke="${IG.ink}" stroke-width="1.6" stroke-linecap="round"/></g>
    <g class="lot-ph1">${igT(60,124,'Fills',{s:12,c:LX.waterD})}</g><g class="lot-ph2">${igT(150,124,'Holds a few hours',{s:12,c:LX.waterD})}</g><g class="lot-ph3">${igT(240,124,'Drains slowly',{s:12,c:LX.waterD})}</g>`,'A detention basin fills, holds water, then drains slowly'),
  lotBowlCycle:()=>igFrame(300,140,`<g class="lot-bsun">${lxSun(250,26,10)}</g><g class="lot-bstorm">${lxCloud(130,30,1.4)}${lxCloud(200,26,1.1)}${lxRain(70,240,24,64,26)}</g>
    <path d="M0 64 H70 C78 64 80 112 150 112 C220 112 222 64 230 64 H300 V140 H0Z" fill="${LX.dirt}"/>
    <path d="M70 64 C78 64 80 112 150 112 C220 112 222 64 230 64Z" fill="${LX.concD}"/><path d="M70 64 C78 64 80 112 150 112 C220 112 222 64 230 64" stroke="#f3efe7" stroke-width="3" fill="none"/>
    <clipPath id="lbwc"><path d="M70 64 C78 64 80 112 150 112 C220 112 222 64 230 64Z"/></clipPath><g clip-path="url(#lbwc)"><rect x="70" y="64" width="160" height="48" fill="${LX.water}" class="lot-bfill"/></g>
    <path d="M66 64 h8 M226 64 h8" stroke="#9aa0ad" stroke-width="3"/><path d="M230 64 h70 v-4 h-70z" fill="${LX.conc}"/>${lxBench(262,60,1)}<path d="M244 60 v-30 M290 60 v-34" stroke="#6a6f80" stroke-width="1.4"/>${lxSail(240,30,292,24,272,44)}
    <g class="lot-bskate">${lxDev(150,111,.9,'happy',{board:'under'})}</g>
    ${igT(150,134,'Dry most days · full after big storms',{s:11})}`,'A skate bowl that fills with storm water, then drains'),
  lotDepthChart:()=>{const rows=[['shallow','std','4 ft, standard drain'],['shallow','wide','4 ft, wide drain'],['deep','std','7 ft, standard drain'],['deep','wide','7 ft, wide drain']];
    return igFrame(300,124,rows.map(([depth,drain,l],i)=>{const n=in10(lotDryP({design:'bowl',depth,drain,shade:'sails'})),y=16+i*28;
      return `${igT(8,y+4,l,{s:10.5,a:'start'})}${[...Array(10)].map((_,j)=>`<path d="${lxDropPath(140+j*15,y,4.6)}" fill="${j<n?LX.water:'#dfe3f3'}" class="${j<n?'lot-dropin':''}" style="--d:${(i*.25+j*.05).toFixed(2)}s"/>`).join('')}${igT(296,y+4,n+'/10',{s:11,a:'end',c:LX.waterD})}`}).join('')+igT(150,120,'Bowl Park with shade sails',{s:10,c:IG.soft}),'Street stays dry, out of 10 big storms, by depth and drain')},
  lotHotDays:()=>{const hot={3:1,4:10,5:26,6:30,7:28,8:14,9:1},M='JFMAMJJASOND';let s='';
    for(let m=0;m<12;m++){const h=hot[m]||0,st=m===4?31-h:m===8?0:0;for(let d=0;d<30;d++){const x=10+m*24+(d%3)*6,y=22+Math.floor(d/3)*7.4,isH=m===4?d>=30-h:d<h;
      s+=`<rect x="${x}" y="${y}" width="5" height="5.4" rx="1.2" fill="${isH?'#ef6a3a':'#efe3cf'}" class="${isH?'lot-hotd':''}" style="--d:${(m*.12+d*.01).toFixed(2)}s"/>`}
      s+=igT(18+m*24,16,M[m],{s:9.5,c:IG.soft})}
    return igFrame(300,124,s+`<rect x="40" y="102" width="12" height="9" rx="2" fill="#ef6a3a"/>${igT(58,110,'over 100°F: more than 100 days a year',{s:10.5,a:'start'})}`,'A calendar year with more than 100 days above 100°F')},
  lotShadeTemp:()=>igFrame(300,140,`${lxSun(64,24,11)}<g class="lot-heat">${[40,64,88].map(x=>`<path d="M${x} 92 q-4 -8 0 -16 q4 -8 0 -16" stroke="#ff8a4a" stroke-width="1.6" fill="none" opacity=".7"/>`).join('')}</g>
    <path d="M14 96 H120 V108 H14Z" fill="#d9cbb5"/><path d="M14 96 H120" stroke="#f4ead8" stroke-width="2"/>${lxThermo(130,90,48,.92,'#ef4a3a','lot-tfill')}${igT(66,128,'In the sun: 140°F+',{s:11,c:'#c4381f'})}
    <path d="M178 96 H284 V108 H178Z" fill="#cfc4b2"/><path d="M178 96 H284" stroke="#efe5d4" stroke-width="2"/><path d="M190 96 v-56 M276 96 v-62" stroke="#6a6f80" stroke-width="2"/>${lxSail(184,40,282,32,240,56,{w:1.4})}
    <path d="M196 96 L270 96 L262 106 L204 106Z" fill="#000" opacity=".1"/>${lxThermo(170,90,48,.52,'#f5a83a','lot-tfill')}${igT(231,128,'In the shade: 30°+ cooler',{s:11,c:LX.waterD})}`,'Concrete in sun and under a shade sail'),
  lotDayClock:()=>{const H=[5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22],ppl={5:3,6:4,7:3,8:2,9:1,19:1,20:3,21:4,22:2},X=h=>14+(h-5)*16;
    return igFrame(300,130,`<rect x="${X(10)-6}" y="18" width="${X(19)-X(10)}" height="86" rx="8" fill="#ffe2cc" opacity=".7"/>${igT((X(10)+X(19))/2-6,32,'too hot',{s:10,c:'#c4581f'})}
      <path d="M${X(6)} 70 Q${X(13.5)} -18 ${X(21)} 70" stroke="#ffd98a" stroke-width="1.4" fill="none" stroke-dasharray="3 4"/><g class="lot-sunarc">${lxSun(0,0,6)}</g>
      <path d="M8 104 H292" stroke="${IG.line}" stroke-width="2"/>${H.filter(h=>h%3===2||h===22).map(h=>`<path d="M${X(h)} 100 v8" stroke="${IG.soft}"/>${igT(X(h),120,h<12?T('{0} AM',h):h===12?T('noon'):T('{0} PM',h-12,h),{s:9,c:IG.soft})}`).join('')}
      ${H.map(h=>[...Array(ppl[h]||0)].map((_,k)=>`<g class="lot-pop" style="--d:${((h-5)*.08+k*.1).toFixed(2)}s">${lxPerson(X(h),100-k*13,1,['#2a9d8f','#e0803a','#6c5ce7','#3b7dd8'][k%4])}</g>`).join('')).join('')}`,'Park visitors by hour: mornings and evenings, almost none midday')},
  lotNightCrew:()=>igFrame(300,130,`<rect width="300" height="130" rx="10" fill="#1d2552"/>${[0,1,2,3,4,5,6,7,8,9,10,11,12,13].map(i=>`<circle cx="${(i*71)%300}" cy="${6+(i*23)%46}" r="1" fill="#fff" opacity=".8" class="${i%3?'':'lot-blink'}" style="--d:${i*.2}s"/>`).join('')}
    <circle cx="258" cy="24" r="11" fill="#fff6cf"/><circle cx="263" cy="21" r="10" fill="#1d2552"/>
    <path d="M0 96 H300 V130 H0Z" fill="#5a4a3e"/><path d="M60 96 C68 96 70 122 120 122 C170 122 172 96 180 96Z" fill="#8a8178"/><ellipse cx="100" cy="96" rx="80" ry="30" fill="#fff2b8" opacity=".12"/>
    <path d="M70 99 C76 112 96 118 120 118" stroke="#cfc7ba" stroke-width="5" fill="none" class="lot-pourline"/>
    ${lxRobot(206,96,1.4,{armCls:'lot-arm'})}<path d="M196 60 L180 66 L150 92" stroke="#c9cdd9" stroke-width="3" fill="none"/><path d="M150 92 L140 104" stroke="#bdb5a8" stroke-width="5" stroke-linecap="round" stroke-dasharray="4 3" class="lot-flowdash"/>
    ${lxRobot(36,96,1.1,{})}
    <g transform="translate(250 64)">${lxThermo(0,20,30,.4,'#f5a83a')}${igT(14,10,'88°F',{s:11,c:'#fff',a:'start'})}</g>${igT(110,22,'10 PM to 5 AM',{s:12,c:'#cfe0ff'})}`,'Robots pouring concrete at night'),
  lotWeek:()=>{const D=['Mon','Tue','Wed','Thu','Fri'];return igFrame(300,130,D.map((d,i)=>{const x=10+i*58,storm=i===3;
    return `<g class="lot-wk" style="--d:${i*.5}s"><rect x="${x}" y="14" width="52" height="96" rx="10" fill="${storm?'#e9eef9':'#f6f4ff'}" stroke="${storm?'#7d8bb8':'#d9d4fb'}" stroke-width="1.6"/>${igT(x+26,30,d,{s:11})}
      ${i<3?`<circle cx="${x+34}" cy="46" r="7" fill="#fff3b8"/><circle cx="${x+37}" cy="44" r="6.4" fill="#f6f4ff"/>${lxBot(x+20,64,1.6)}${igT(x+26,96,'build',{s:10,c:IG.violet})}`:''}
      ${storm?`${lxCloud(x+26,58,.9,{c:'#4d5878'})}<path class="lot-flash" d="M${x+28} 58 l-6 12 h5 l-4 10 l10 -14 h-5 l4 -8z" fill="#ffd34a"/>${igT(x+26,96,'70% sure',{s:11,c:'#c4381f'})}`:''}</g>`}).join(''),'Three build nights, then a likely storm on Thursday')},
  lotWaterMap:({both})=>igFrame(300,140,`<rect x="0" y="0" width="300" height="140" fill="#f4e8d2"/>
    <rect x="0" y="24" width="300" height="12" fill="#c9c1b6"/>${igT(30,33,'alley',{s:9,c:'#6a6258',a:'start'})}
    ${[0,1,2,3,4,5].map(i=>`<rect x="${4+i*50}" y="2" width="40" height="18" rx="2" fill="#e3c9a6" stroke="#b9805a"/>`).join('')}
    <rect x="0" y="108" width="300" height="20" fill="${LX.asph}"/><path d="M0 118 H300" stroke="#d7d0b0" stroke-dasharray="6 5"/>${igT(30,121,'street',{s:9,c:'#e6e6e6',a:'start'})}
    <rect x="12" y="44" width="70" height="56" rx="2" fill="#e3c9a6" stroke="#b9805a"/><rect x="218" y="44" width="70" height="56" rx="2" fill="#e3c9a6" stroke="#b9805a"/>${igT(253,76,'Mrs. Okafor',{s:8.5,c:'#7a5a3a'})}
    <rect x="92" y="40" width="116" height="64" rx="4" fill="#dcb47e" stroke="#b58a52" stroke-width="1.5"/>${igT(150,76,'the lot',{s:11,c:'#7a5426'})}
    <circle cx="100" cy="98" r="4" fill="${LX.sag}"/>
    ${[110,150,190].map((x,i)=>`<path d="M${x} 112 V92" stroke="${LX.waterD}" stroke-width="3" stroke-dasharray="5 4" class="lot-flowdash" stroke-linecap="round"/><path d="M${x-5} 96 l5 -6 l5 6" fill="none" stroke="${LX.waterD}" stroke-width="2.4" class="lot-blink" style="--d:${i*.2}s"/>`).join('')}
    ${both?`<path d="M0 30 H300" stroke="${LX.water}" stroke-width="3" stroke-dasharray="6 4" class="lot-flowdash"/><circle cx="150" cy="30" r="5" fill="#bdb6aa" stroke="#6a6258"/><circle cx="150" cy="30" r="2" fill="#6a6258"/>
      ${[130,170].map((x,i)=>`<path d="M${x} 34 V54" stroke="${LX.waterD}" stroke-width="3" stroke-dasharray="5 4" class="lot-flowdash" stroke-linecap="round"/><path d="M${x-5} 50 l5 6 l5 -6" fill="none" stroke="${LX.waterD}" stroke-width="2.4"/>`).join('')}${igT(222,20,'irrigation ditch',{s:9.5,c:LX.waterD})}`:''}`,both?'Water reaches the lot from the street and from the alley ditch':'Water reaches the lot from the street'),
  // ---- City flood log ----
  lotArroyoGrid:()=>{let s='';for(let i=0;i<9;i++)s+=`<path d="M${10+i*35} 8 V112" stroke="#d6dbe9" stroke-width="3"/>`;for(let j=0;j<4;j++)s+=`<path d="M6 ${14+j*32} H294" stroke="#d6dbe9" stroke-width="3"/>`;
    for(let i=0;i<9;i++)for(let j=0;j<4;j++)if((i+j)%2===0)s+=`<rect x="${6+i*35}" y="${10+j*32}" width="8" height="8" rx="2" fill="${LX.teal}" class="lot-gate" style="--d:${((i+j)*.15).toFixed(2)}s"/>`;
    return igFrame(300,130,s+`<g transform="translate(150 62)"><circle r="22" fill="#fff" stroke="${LX.water}" stroke-width="2"/><path d="${lxDropPath(0,2,10)}" fill="${LX.water}"/><circle cx="0" cy="5" r="3" fill="#fff"/></g>${igT(150,126,'About 4,000 gates, pumps and basins',{s:11})}`,'Arroyo running gates across the city')},
  lotSignedRules:()=>igFrame(300,140,`<path class="lot-flash" d="M30 10 l-10 22 h9 l-7 18 l18 -26 h-9 l7 -14z" fill="${LX.gold}" style="animation-duration:3s"/>
    ${[0,1,2].map(i=>`<g transform="translate(${60+i*30} 56)"><rect x="-10" y="-14" width="20" height="28" rx="3" fill="#e3e8f3"/><rect x="-10" y="-14" width="20" height="14" rx="3" fill="${LX.teal}" class="lot-gateup" style="--d:${i*.25}s"/></g>`).join('')}
    ${igT(70,96,'Acts in seconds',{s:11})}
    <g transform="translate(190 14)"><rect width="100" height="110" rx="8" fill="#fffdf6" stroke="#e5dcc8" stroke-width="1.6"/>${igT(50,16,'GATE RULES',{s:9.5,c:IG.soft})}
      ${['1. Bowl must be empty','2. Warn for 10 minutes','3. Anyone can pause','4. Log everything'].map((t,i)=>igT(8,32+i*14,t,{s:8.4,a:'start',w:700})).join('')}
      <path d="M8 96 H92" stroke="${IG.ink}" stroke-width="1"/><text x="12" y="92" font-family="Caveat, cursive" font-size="17" fill="${IG.violet}" class="lot-signit">${T('Marco Ruiz')}</text></g>
    ${igT(240,136,'Rules a person signs',{s:11})}`,'Arroyo acts fast, inside rules a person signs'),
  lotFloodDays:()=>{const mon=[['Jun',3],['Jul',5],['Aug',1],['Sep',4]],len={Jun:30,Jul:31,Aug:31,Sep:30};let s='';
    mon.forEach(([m,first],k)=>{const x0=8+k*73;s+=igT(x0+31,14,m,{s:10.5});for(let d=1;d<=len[m];d++){const cell=first+d-1,cx=x0+(cell%7)*9,cy=22+Math.floor(cell/7)*13,f=LOT_FLOODS.find(F=>F.m===m&&F.d===d);
      s+=f?`<g class="lot-pop" style="--d:${(k*.3).toFixed(1)}s"><path d="${lxDropPath(cx+4,cy+5,4.2)}" fill="${LX.water}"/></g>`:`<rect x="${cx}" y="${cy}" width="7" height="9" rx="1.6" fill="#ece8f2"/>`}});
    return igFrame(300,118,s+igT(150,112,'4 flood days',{s:11.5,c:LX.waterD}),'A summer calendar with 4 flood days')},
  lotFloodBars:({set})=>{const X=i=>40+i*64,Y=v=>100-v*36;
    return igFrame(300,140,`<path d="M24 100 H292" stroke="${IG.line}" stroke-width="2"/>${[0,1,2].map(v=>`${igT(18,Y(v)+4,v+'"',{s:9,c:IG.soft,a:'end'})}`).join('')}
      ${LOT_FLOODS.map((F,i)=>{const on=set==='big'?!F.back:!!F.back;return `<g opacity="${on?1:.3}"><rect x="${X(i)}" y="${Y(F.rain)}" width="34" height="${F.rain*36}" rx="4" fill="${LX.water}" class="lot-barup" style="--d:${i*.15}s"/>${igT(X(i)+17,Y(F.rain)-5,F.rain+'"',{s:11,c:LX.waterD})}${igT(X(i)+17,114,F.m+' '+F.d,{s:9.5,c:IG.ink})}
        ${on&&F.back?`<g class="lot-pulse"><circle cx="${X(i)+17}" cy="${Y(F.rain)-22}" r="8" fill="${LX.gold}"/>${igT(X(i)+17,Y(F.rain)-18,'?',{s:12})}</g>`:''}</g>`}).join('')}
      <path d="M24 ${Y(1.4)} H292" stroke="${LX.red}" stroke-width="1.6" stroke-dasharray="5 4"/>${igT(292,Y(1.4)-4,'street drain limit',{s:9,c:LX.red,a:'end'})}
      ${set==='small'?igT(150,134,'Small storms, floods from the back',{s:11}):igT(150,134,'Big storms, floods from the street',{s:11})}`,'Rain on the four flood days')},
  lotTuesdays:()=>{const W='SMTWTFS';let s='';[['July 2039',5],['August 2039',1]].forEach(([m,first],k)=>{const x0=14+k*146,len=31;s+=igT(x0+60,14,m,{s:10.5});
      [...W].forEach((d,i)=>s+=igT(x0+8+i*17,28,d,{s:9,c:i===2?IG.violet:IG.soft}));
      for(let d=1;d<=len;d++){const cell=first+d-1,cx=x0+8+(cell%7)*17,cy=40+Math.floor(cell/7)*14,f=LOT_FLOODS.find(F=>F.m===m.slice(0,3)&&F.d===d);
        s+=`${f&&f.back?`<circle cx="${cx}" cy="${cy-3}" r="7.5" fill="none" stroke="${LX.red}" stroke-width="2" class="lot-pulse"/>`:''}${igT(cx,cy,String(d),{s:8.5,w:f&&f.back?900:600,c:f&&f.back?LX.red:IG.ink})}`}});
    return igFrame(300,140,`<rect x="${14+2*17}" y="18" width="16" height="104" rx="6" fill="${IG.violet}" opacity=".08"/><rect x="${160+2*17}" y="18" width="16" height="104" rx="6" fill="${IG.violet}" opacity=".08"/>`+s+igT(150,136,'Both on a Tuesday',{s:11,c:LX.red}),'Two flood dates, both Tuesdays')},
  lotUnknown:()=>igFrame(300,130,`<g transform="translate(40 14) rotate(-3)"><rect width="150" height="96" rx="10" fill="#fff" stroke="${IG.line}" stroke-width="2"/><rect width="150" height="20" rx="10" fill="${LX.water}"/><rect y="10" width="150" height="10" fill="${LX.water}"/>${igT(75,14,'ARROYO · FLOOD REPORT',{s:8.5,c:'#fff'})}
      ${igT(10,38,'Jul 12 and Aug 9',{s:10,a:'start'})}${igT(10,54,'Rain: under 1 inch',{s:9.5,a:'start',c:IG.soft})}${igT(10,68,'Started: back of lot',{s:9.5,a:'start',c:IG.soft})}
      <g transform="translate(92 80) rotate(-12)" class="lot-stampin"><rect x="-44" y="-12" width="88" height="20" rx="4" fill="none" stroke="${LX.red}" stroke-width="2.4"/>${igT(0,3,'CAUSE: UNKNOWN',{s:9,c:LX.red})}</g></g>
    <g class="lot-pulse" style="transform-origin:240px 62px"><circle cx="240" cy="62" r="30" fill="${LX.gold}" opacity=".25"/>${igT(240,78,'?',{s:46,c:'#e09a1a'})}</g>`,'Two floods with an unknown cause'),
  // ---- Neighbor survey ----
  lotSurveyPing:()=>{let s='';for(let i=0;i<200;i++){const a=i*2.399,r=12+Math.sqrt(i/200)*54;s+=`<rect x="${(150+Math.cos(a)*r*1.9-2).toFixed(1)}" y="${(62+Math.sin(a)*r-2).toFixed(1)}" width="4" height="4" rx="1" fill="#d9c6a8" class="lot-reply" style="--d:${(i*.012).toFixed(2)}s"/>`}
    return igFrame(300,130,`${[0,1,2].map(i=>`<ellipse cx="150" cy="62" rx="40" ry="22" fill="none" stroke="${LX.teal}" stroke-width="2" class="lot-ripple" style="--d:${i*.8}s"/>`).join('')}${s}<rect x="140" y="55" width="20" height="14" rx="2" fill="#dcb47e" stroke="#b58a52"/>${igT(150,128,'200 households asked',{s:11})}`,'Byte asking the 200 nearest households')},
  lotSurveyBars:()=>{let s='';for(let i=0;i<100;i++){const c=i%20,r=Math.floor(i/20),x=14+c*14,y=14+r*16,col=i<52?'#5fa25a':i<93?LX.teal:'#c3c7d6';
      s+=`<g class="lot-pop" style="--d:${(i*.015).toFixed(2)}s">${lxPerson(x,y+11,1,col)}</g>`}
    return igFrame(300,130,s+`<rect x="14" y="100" width="10" height="10" rx="2" fill="#5fa25a"/>${igT(28,109,'52 shady garden',{s:10.5,a:'start'})}<rect x="128" y="100" width="10" height="10" rx="2" fill="${LX.teal}"/>${igT(142,109,'41 skate park',{s:10.5,a:'start'})}<rect x="232" y="100" width="10" height="10" rx="2" fill="#c3c7d6"/>${igT(246,109,'7 other',{s:10.5,a:'start'})}${igT(150,126,'out of every 100',{s:9.5,c:IG.soft})}`,'52 of 100 picked a garden and 41 a skate park')},
  lotWhyBoth:()=>igFrame(300,130,`<g transform="translate(60 92)">${lxShrub(0,0,2.2)}${lxBench(18,0,1.4)}${lxAgave(-18,-2,1.2)}</g>${igT(150,82,'+',{s:30,c:IG.violet})}
    <g transform="translate(236 86) rotate(-12)"><rect x="-24" y="-4" width="48" height="8" rx="4" fill="${LX.teal}"/><circle cx="-15" cy="7" r="3.4" fill="#eee" stroke="#999"/><circle cx="15" cy="7" r="3.4" fill="#eee" stroke="#999"/></g>
    ${[[70,26,-6,'#fff7d6'],[160,18,4,'#e6f7f4'],[236,34,-3,'#f3f0ff']].map(([x,y,r,c],i)=>`<g class="lot-bub" style="--d:${i*.6}s" transform="translate(${x} ${y}) rotate(${r})"><rect x="-44" y="-13" width="88" height="24" rx="12" fill="${c}" stroke="${IG.line}"/><path d="M-8 11 l-4 8 l10 -8" fill="${c}"/><text x="0" y="4" text-anchor="middle" font-family="Caveat, cursive" font-size="16" fill="${IG.ink}">${T('why not both?')}</text></g>`).join('')}`,'Neighbors writing: why not both?'),
  lotElderNeeds:()=>igFrame(300,130,`<path d="M0 104 H300" stroke="${LX.sandD}" stroke-width="2"/>
    <g opacity=".55">${[0,1,2,3].map(i=>`<rect x="${16+i*10}" y="${104-(i+1)*9}" width="${40-i*10}" height="9" fill="#d2cabd" stroke="#a69d90"/>`).join('')}</g><path d="M14 60 l40 40 M54 60 l-40 40" stroke="${LX.red}" stroke-width="4" stroke-linecap="round"/>${igT(34,122,'steps',{s:10,c:LX.red})}
    <path d="M80 104 L160 76 H200 V104Z" fill="#e6dfd4" stroke="#b4ab9c"/><g class="lot-rampup">${lxOkafor(0,0,.9,'happy')}</g>${igT(130,122,'a smooth ramp',{s:10,c:'#167a52'})}
    <path d="M214 104 v-62 M290 104 v-66" stroke="#6a6f80" stroke-width="2"/>${lxSail(206,42,296,36,262,58,{w:1.4})}<path d="M218 104 h66 l-8 -6 h-50z" fill="#000" opacity=".08"/>${lxBench(252,100,2)}${igT(238,122,'shade, bench with a back',{s:9.5,c:'#167a52'})}`,'A ramp instead of steps, and a shaded bench with a back'),
  lotTeenNeeds:()=>igFrame(300,130,`<rect width="300" height="130" rx="10" fill="#22295a"/>${[0,1,2,3,4,5,6,7].map(i=>`<circle cx="${(i*83)%300}" cy="${8+(i*19)%30}" r="1" fill="#fff" opacity=".7"/>`).join('')}
    <path d="M0 84 H70 C78 84 80 118 140 118 C200 118 202 84 210 84 H300 V130 H0Z" fill="#4a4258"/><path d="M70 84 C78 84 80 118 140 118 C200 118 202 84 210 84" stroke="#bdb6c8" stroke-width="3" fill="none"/>
    <path d="M226 84 V20 h14" stroke="#9aa1b4" stroke-width="3" fill="none"/><g class="lot-lighton"><path d="M240 22 L190 84 H280 Z" fill="#fff2b8" opacity=".25"/><circle cx="240" cy="22" r="5" fill="#fff2b8"/></g>
    <g class="lot-roll">${lxDev(140,117,.9,'happy',{board:'under'})}</g>
    <g transform="translate(40 84)"><rect x="-6" y="-20" width="12" height="20" rx="3" fill="#9aa1b4"/><path d="M2 -20 q14 -16 22 6" stroke="${LX.waterL}" stroke-width="2" fill="none" class="lot-spray"/></g>`,'A lit skate bowl at night and a water fountain'),
  // ---- The Ledger ----
  lotRobotCount:()=>igFrame(300,130,`${igT(10,18,'People',{s:10.5,a:'start'})}${[...Array(9)].map((_,i)=>lxPerson(16+i*14,40,1.1,'#e0803a')).join('')}
    ${igT(10,58,'Robots',{s:10.5,a:'start'})}${[...Array(12)].map((_,i)=>`<g class="lot-pop" style="--d:${(i*.08).toFixed(2)}s">${lxBot(16+i*14,82,1.2)}</g>`).join('')}
    <g transform="translate(196 6)"><rect width="100" height="90" rx="8" fill="#f0e6d2"/><path d="M8 8 h40 v74 h-40z" fill="#e6ddd0" stroke="${LX.orange}" stroke-width="1.6" stroke-dasharray="4 3"/>${igT(28,22,'zone',{s:8.5,c:LX.orange})}
      ${[[14,34],[30,40],[18,56],[34,64]].map(([x,y],i)=>`<rect x="${x}" y="${y}" width="10" height="7" fill="#b9b2a6"/><g class="lot-bot" style="--d:${i*.4}s">${lxBot(x+5,y+18,.6)}</g>`).join('')}
      ${[[62,20],[78,30],[64,46],[80,58],[66,70]].map(([x,y])=>lxHomeIcon(x,y,.9)).join('')}${igT(72,86,'city',{s:8.5,c:IG.soft})}</g>${igT(150,124,'More robots than people',{s:11})}`,'Phoenix has more robots than people'),
  lotCanalShade:()=>igFrame(300,130,`<rect x="0" y="92" width="300" height="24" fill="${LX.water}"/><path class="lot-wave" d="M-30 100 q10 -3 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" stroke="#d7f1ff" stroke-width="1.4" fill="none"/>
    <path d="M0 86 H300 V92 H0Z" fill="${LX.sand}"/>${[0,1,2,3,4,5,6].map(i=>`<g class="lot-sailpop" style="--d:${i*.35}s"><path d="M${16+i*42} 86 v-38 M${50+i*42} 86 v-42" stroke="#6a6f80" stroke-width="1.4"/>${lxSail(12+i*42,48,54+i*42,42,34+i*42,62)}</g>`).join('')}
    <g class="lot-walkby">${mini(0,52,{skin:SKIN[3],shirt:'#6c5ce7',hair:'#1b1410',pose:'walk',s:.9})}</g>${igT(150,126,'40 new shade sails on the canal trail',{s:10.5})}`,'Shade sails popping up along a canal trail'),
  lotHohokam:()=>igFrame(300,140,`<rect width="300" height="120" fill="#efe2c8" rx="8"/>${[[40,30],[90,70],[200,40],[250,86]].map(([x,y])=>`<g opacity=".6">${[0,1,2].map(k=>`<path d="M${x+k*6} ${y} v-10 M${x+k*6-3} ${y-6} l3 -3 l3 3" stroke="#9a8a4a" stroke-width="1.2" fill="none"/>`).join('')}</g>`).join('')}
    <path d="M0 96 C60 96 70 40 140 50 C200 58 220 20 300 24" stroke="#a5733e" stroke-width="12" fill="none" stroke-linecap="round" opacity=".55" class="lot-drawon"/>
    <path d="M0 96 C60 96 70 40 140 50 C200 58 220 20 300 24" stroke="${LX.water}" stroke-width="5" fill="none" stroke-linecap="round" class="lot-drawon2"/>
    <rect x="12" y="104" width="12" height="8" rx="2" fill="#a5733e" opacity=".6"/>${igT(28,112,'Hohokam canal, 1,000+ years ago',{s:9.5,a:'start'})}<rect x="182" y="104" width="12" height="8" rx="2" fill="${LX.water}"/>${igT(198,112,'canal today',{s:9.5,a:'start'})}
    ${igT(150,134,'Same route, a thousand years apart',{s:10.5})}`,'An ancient canal route and a modern canal on the same path'),
  lotSilverPatch:()=>{const f=(x,lbl,big)=>`<g transform="translate(${x} 10)"><rect width="134" height="96" rx="6" fill="#d9b98a"/>${[0,1,2,3,4].map(i=>`<path d="M0 ${16+i*18} q30 -6 67 0 t67 0" stroke="#c9a676" fill="none"/>`).join('')}
      <path d="M0 32 H134 M0 64 H134 M44 0 V96 M88 0 V96" stroke="#fff" stroke-width=".5" opacity=".5"/><g class="${big?'lot-grow2':''}" style="transform-origin:${x+70}px 60px"><ellipse cx="70" cy="50" rx="${big?30:15}" ry="${big?18:11}" fill="url(#lspg)"/><ellipse cx="64" cy="46" rx="${big?10:5}" ry="${big?4:2.4}" fill="#fff" opacity=".7" class="lot-blink"/></g>${igT(67,112,lbl,{s:10.5})}</g>`;
    return igFrame(300,124,`<defs><linearGradient id="lspg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f6fb"/><stop offset=".5" stop-color="#a9b2c6"/><stop offset="1" stop-color="#dfe4ee"/></linearGradient></defs>${f(10,'Last week',0)}${f(156,'Today',1)}<path d="M146 58 l8 0 l-3 -3 M154 58 l-3 3" stroke="${IG.ink}" stroke-width="1.6" fill="none"/>`,'A silver patch doubling in satellite photos')},
  lotNoPermit:()=>igFrame(300,130,`<g transform="translate(40 8)"><rect width="128" height="112" rx="8" fill="#fffdf6" stroke="#d9cdb2" stroke-width="2"/><rect x="44" y="-6" width="40" height="14" rx="4" fill="#9aa1b4"/>
      ${igT(64,26,'MINING PERMITS',{s:9.5,c:IG.soft})}${igT(64,42,'Saltbrush Flats',{s:11})}<rect x="14" y="54" width="100" height="40" rx="6" fill="none" stroke="#d9cdb2" stroke-dasharray="4 3"/>${igT(64,79,'none on file',{s:11,c:LX.red})}</g>
    <g class="lot-scan"><circle cx="0" cy="0" r="14" fill="#e8f4ff" fill-opacity=".5" stroke="${IG.ink}" stroke-width="3"/><path d="M10 10 l12 12" stroke="${IG.ink}" stroke-width="5" stroke-linecap="round"/></g>
    <g transform="translate(212 70)"><rect x="-40" y="-60" width="84" height="74" rx="8" fill="#1d2552"/>${[0,1,2,3,4].map(i=>`<circle cx="${-30+(i*19)%80}" cy="${-52+(i*11)%20}" r=".9" fill="#fff"/>`).join('')}<path d="M-40 4 H44 V14 H-40Z" fill="#6a5a4a"/>
      <g class="lot-bot">${lxBot(-10,4,1.3,'#9aa1b4')}</g><path d="M6 4 l6 -12 l8 12" fill="#8a8a96"/><circle cx="12" cy="-10" r="1.4" fill="${LX.red}" class="lot-blink"/></g>`,'No mining permit on file'),
  // ---- Learn it fast: monsoon ----
  lotHeatRise:()=>igFrame(300,120,`${lxSun(250,24,12)}<defs><linearGradient id="lhg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff9a4a"/><stop offset="1" stop-color="#c8643b"/></linearGradient></defs><path d="M0 92 H300 V120 H0Z" fill="url(#lhg)"/>
    ${[40,90,140,190].map((x,i)=>`<g class="lot-heatup" style="--d:${i*.4}s"><path d="M${x} 88 q-6 -10 0 -20 q6 -10 0 -20" stroke="#ff7a3a" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M${x-5} 46 l5 -8 l5 8" stroke="#ff7a3a" stroke-width="2.4" fill="none"/></g>`).join('')}${igT(110,112,'Hot ground, rising air',{s:11,c:'#fff'})}`,'Hot ground making air rise'),
  lotWindMap:()=>igFrame(300,140,`<rect width="300" height="140" rx="10" fill="#8fc6e8"/><path d="M20 10 H190 L196 60 L170 74 L150 110 L176 132 L240 134 L250 96 L230 70 L250 40 L300 30 V0 H20Z" fill="#e6d3ae"/>
    <path d="M60 10 L60 0 M60 10 H170 V60 L120 66 L60 50Z" fill="#f0dfbd" stroke="#b9a07a" stroke-width="1.2"/>${igT(110,38,'Arizona',{s:10,c:'#7a5a3a'})}
    <path d="M70 66 C90 80 104 100 120 130 L100 136 C88 108 72 90 60 74Z" fill="#8fc6e8"/>${igT(70,120,'Gulf of California',{s:9,c:'#2a5a8a',a:'middle'})}${igT(268,124,'Gulf of',{s:9,c:'#2a5a8a'})}${igT(268,135,'Mexico',{s:9,c:'#2a5a8a'})}
    <circle cx="112" cy="46" r="5" fill="${LX.red}"/>${igT(124,50,'Phoenix',{s:10,a:'start'})}
    <path d="M96 120 C100 96 106 70 110 54" stroke="#fff" stroke-width="3" fill="none" stroke-dasharray="7 6" class="lot-flowdash"/><path d="M258 110 C220 90 160 70 120 50" stroke="#fff" stroke-width="3" fill="none" stroke-dasharray="7 6" class="lot-flowdash"/>`,'Wet winds blowing toward Phoenix from two gulfs'),
  lotCloudBuild:()=>igFrame(300,140,`<path d="M0 120 L60 84 L110 104 L170 70 L240 102 L300 90 V140 H0Z" fill="#a8775a"/><g class="lot-cloudgrow" style="transform-origin:150px 100px"><path d="M100 100 C90 86 104 72 118 76 C116 52 140 40 156 52 C160 28 196 30 196 54 C214 52 222 70 210 82 C224 88 218 104 204 100Z" fill="#f2f4f8"/>
    <path d="M118 76 C126 62 140 60 150 64 M156 52 C166 46 178 48 184 58" stroke="#c9d0dd" stroke-width="3" fill="none"/><path d="M96 24 C130 16 190 14 230 22 C220 30 190 34 156 34 C130 34 108 32 96 24Z" fill="#e6e9f0" class="lot-anvil"/><path d="M150 34 V60" stroke="#e6e9f0" stroke-width="22"/></g>
    <path class="lot-flash" d="M160 100 l-6 14 h6 l-4 12 l12 -16 h-6 l4 -10z" fill="#ffd34a"/>${igT(150,136,'A storm cloud can grow taller than 10 miles',{s:10,c:'#fff'})}`,'A thunderstorm cloud growing over mountains'),
  lotHaboob:()=>igFrame(300,130,`<rect width="300" height="130" rx="10" fill="#f0c98a"/>${lxCloud(70,28,1.6,{c:'#5a5a72'})}<path d="M0 106 H300 V130 H0Z" fill="#d8a868"/>
    ${[0,1,2,3,4,5].map(i=>`<rect x="${200+i*14}" y="${70-(i%3)*10}" width="10" height="${36+(i%3)*10}" fill="#9a8a7a"/>`).join('')}
    <g class="lot-haboob">${[0,1,2,3,4,5,6].map(i=>`<circle cx="${30+(i%3)*14}" cy="${100-i*12}" r="${18+(i%2)*6}" fill="${['#b9864e','#c99460','#a8784a'][i%3]}"/>`).join('')}<path d="M10 106 V26 C30 20 50 24 64 34 V106Z" fill="#b9864e" opacity=".85"/></g>
    ${[0,1].map(i=>`<path d="M${60+i*30} 40 v20 l-5 -5 M${60+i*30} 60 l5 -5" stroke="#3a3a52" stroke-width="2" fill="none" class="lot-blink" style="--d:${i*.3}s"/>`).join('')}${igT(150,124,'A wall of dust can be a mile high',{s:10.5})}`,'A haboob dust wall rolling toward a city'),
  lotRunoff:()=>igFrame(300,130,`<g><rect x="6" y="80" width="134" height="30" fill="#6a4a2a"/><path d="M6 80 H140" stroke="#8ab04a" stroke-width="4"/>${[0,1,2,3,4].map(i=>`<path d="${lxDropPath(24+i*24,30,4)}" fill="${LX.water}" class="lot-soak" style="--d:${i*.25}s"/>`).join('')}${igT(73,124,'Soft soil soaks it up',{s:10.5})}</g>
    <g><path d="M160 56 L290 96 V110 H160Z" fill="#c9905a"/><path d="M160 56 L290 96" stroke="#e8c48a" stroke-width="3"/><ellipse cx="282" cy="100" rx="14" ry="4" fill="${LX.water}" class="lot-pulse"/>${[0,1,2,3].map(i=>`<path d="${lxDropPath(176+i*22,20,4)}" fill="${LX.water}" class="lot-runoff" style="--d:${i*.3}s"/>`).join('')}${igT(225,124,'Hard ground: it runs off',{s:10.5})}</g>`,'Soft soil soaks rain; hard desert ground sends it downhill'),
  // ---- registered art from lot_art.js ----
  lotMakeIcon:({k})=>lotMakeIconSVG(k),lotDiorama:o=>lotDiorama(o),lotRedTeam:({k})=>lotRedTeamSVG(k),lotCrewBadge:()=>lotCrewBadgeSVG(),lotMiniIcon:({k})=>lotMiniIconSVG(k)});
