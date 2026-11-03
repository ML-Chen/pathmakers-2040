// viz/ocean_dc.js — pictures for the Ledger story about the floating datacenters in the Pacific (id 'ocean-dc' in
// src/ledger.js): one looping picture per sentence, in the Ledger's style (lgPic and friends from viz/ledger.js, which
// loads first). The palette follows the painted scene src/scenes/ocean_dc.js: cream sky, teal sea, navy panels, warm whites.
const OCC={sky:'#f8ecd6',sky2:'#f3dfba',sea:'#3f8c9a',sea2:'#2f7686',deep:'#1f4f64',panel:'#22375e',panel2:'#3a5680',rim:'#efe6d2',
  white:'#fbf8f1',whiteF:'#ece5d7',ink:'#26314d',coral:'#e4694f',mustard:'#e0a444',teal:'#2a9d9a',cool:'#a8dcd6',sun:'#f7c48e'};
// a flat-top hexagon squashed vertically by sy (sy < 1 tilts it away from us)
function ocHex(cx,cy,r,sy=1){return 'M'+[0,1,2,3,4,5].map(i=>`${(cx+r*Math.cos(i*Math.PI/3)).toFixed(1)} ${(cy+r*sy*Math.sin(i*Math.PI/3)).toFixed(1)}`).join(' L')+'Z'}
// one solar raft seen from above at an angle: cream float, navy panel, a line of cells
function ocRaft(cx,cy,r,sy=.5,o={}){return `<path d="${ocHex(cx,cy+r*.18,r,sy)}" fill="#9b9a8f"/><path d="${ocHex(cx,cy,r,sy)}" fill="${o.rim||OCC.rim}"/><path d="${ocHex(cx,cy,r*.78,sy)}" fill="${o.panel||OCC.panel}"/>
  ${r>7?`<path d="M${cx-r*.78} ${cy} H${cx+r*.78} M${cx-r*.4} ${cy-r*.68*sy} L${cx+r*.4} ${cy+r*.68*sy} M${cx+r*.4} ${cy-r*.68*sy} L${cx-r*.4} ${cy+r*.68*sy}" stroke="#4d6a9a" stroke-width=".8"/>`:''}`}
// a white datacenter platform standing in the sea, waterline at (x, gy)
function ocPlat(x,gy,s=1,o={}){return `<g transform="translate(${x} ${gy}) scale(${s})">
  <ellipse cx="0" cy="2" rx="62" ry="7" fill="${OCC.cool}" opacity=".7"/><ellipse cx="0" cy="2" rx="50" ry="5" fill="none" stroke="#e6f6f2" stroke-width="1"/>
  ${[-40,-24,-8,8,24,40].map(c=>`<rect x="${c-2.5}" y="-7" width="5" height="8" fill="#d6cdbb"/><rect x="${c-2.5}" y="-2" width="5" height="2" fill="${OCC.panel}"/>`).join('')}
  <rect x="-46" y="-11" width="92" height="5" rx="1" fill="${OCC.whiteF}" stroke="${OCC.ink}" stroke-opacity=".35" stroke-width=".8"/>
  <rect x="-42" y="-37" width="26" height="26" rx="3" fill="${OCC.white}" stroke="${OCC.ink}" stroke-opacity=".35" stroke-width=".8"/>
  <rect x="-13" y="-52" width="26" height="41" rx="3" fill="${OCC.white}" stroke="${OCC.ink}" stroke-opacity=".35" stroke-width=".8"/>
  <rect x="16" y="-68" width="9" height="57" rx="2" fill="${OCC.white}" stroke="${OCC.ink}" stroke-opacity=".35" stroke-width=".8"/><path d="M16 -68 a4.5 4.5 0 0 1 9 0" fill="${OCC.white}" stroke="${OCC.ink}" stroke-opacity=".35" stroke-width=".8"/>
  <path d="M20.5 -72 V-82" stroke="${OCC.ink}" stroke-width="1"/><circle cx="20.5" cy="-83" r="1.8" fill="${OCC.coral}" class="lg-fade"/>
  <rect x="28" y="-29" width="16" height="18" rx="2" fill="${OCC.white}" stroke="${OCC.ink}" stroke-opacity=".35" stroke-width=".8"/>${[0,1,2,3,4].map(i=>`<path d="M${31+i*3} -26 V-14" stroke="${OCC.ink}" stroke-opacity=".3" stroke-width=".7"/>`).join('')}
  ${[-30,-22].map(y=>`<rect x="-38" y="${y}" width="18" height="3" rx="1" fill="${OCC.panel}"/>`).join('')}${[-46,-36,-26].map(y=>`<rect x="-9" y="${y}" width="18" height="3.4" rx="1" fill="${OCC.panel}"/>`).join('')}
  <rect x="17.5" y="-62" width="6" height="3" fill="${OCC.panel}"/>
  ${o.inner||''}</g>`}
// a sealed hardware pod (cargo on the data tanker)
function ocPod(x,y,col){return `<rect x="${x}" y="${y}" width="13" height="8" rx="2.5" fill="${col}" stroke="${OCC.ink}" stroke-opacity=".4" stroke-width=".7"/><rect x="${x+5.6}" y="${y+1}" width="1.8" height="6" fill="${OCC.teal}"/>`}
// the data tanker, side view, bow to the right, waterline at (x, gy); flip turns it around
function ocTanker(x,gy,s=1,cargo=true,flip=false){return `<g transform="translate(${x} ${gy}) scale(${flip?-s:s} ${s})">
  <path d="M-48 -0 L36 0 Q46 -2 50 -12 L-50 -12 L-49 -3Z" fill="${OCC.white}" stroke="${OCC.ink}" stroke-opacity=".5" stroke-width=".8"/>
  <path d="M-49 -5 L40 -5 Q44 -3 46 -6 L46 -4 Q42 1 36 0 L-48 0Z" fill="${OCC.panel}"/><path d="M-49.5 -6.6 H46.6" stroke="${OCC.coral}" stroke-width="1.6"/>
  ${cargo?[0,1,2,3,4].map(i=>ocPod(-24+i*14,-21,i%3===1?OCC.mustard:OCC.whiteF)).join('')+[0,1].map(i=>ocPod(-17+i*28,-29,OCC.whiteF)).join(''):''}
  <rect x="-46" y="-36" width="18" height="24" rx="2.5" fill="${OCC.white}" stroke="${OCC.ink}" stroke-opacity=".45" stroke-width=".8"/><rect x="-45" y="-33" width="16" height="4" fill="${OCC.panel}"/>
  <path d="M-37 -36 V-46 M-41 -42 H-33" stroke="${OCC.ink}" stroke-width="1"/></g>`}
// a computer chip
function ocChip(x,y,s=1,col=OCC.teal){return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-7" y="-7" width="14" height="14" rx="2" fill="${OCC.ink}"/><rect x="-4" y="-4" width="8" height="8" rx="1" fill="${col}"/>${[-4,0,4].map(c=>`<path d="M${c} -7 v-3 M${c} 7 v3 M-7 ${c} h-3 M7 ${c} h3" stroke="${OCC.ink}" stroke-width="1.4"/>`).join('')}</g>`}
function ocSea(y,h=200,col=OCC.sea){return `<rect x="0" y="${y}" width="300" height="${h}" fill="${col}"/>`}

Object.assign(VIZ,{
  // 1. a field of rafts to the horizon, north of Hawaii
  lg_ocean1:()=>lgPic(124,[OCC.sky,OCC.sky2],`${lgSun(56,30,13,OCC.sun)}${lgCloud(210,22,.9)}${ocSea(62,62,OCC.sea2)}
    <rect x="0" y="62" width="300" height="5" fill="#9ebfb7"/>
    ${[[66,3,.22],[70,4.5,.26],[76,6.5,.3],[84,9,.34],[95,12.5,.38],[110,17,.42]].map(([y,r,sy],j)=>{const dx=r*3.1;let o='';for(let x=-dx+(j%2)*dx/2;x<300+dx;x+=dx)o+=ocRaft(x,y,r,sy*1.6,{panel:j<2?OCC.panel2:OCC.panel});return o}).join('')}
    ${[0,1,2,3].map(i=>`<path transform="translate(${44+i*14} ${74+i*11})" d="M0 -3 Q0 0 3 0 Q0 0 0 3 Q0 0 -3 0 Q0 0 0 -3Z" fill="#fff6dc" class="lg-fade" style="--d:${i*.6}s"/>`).join('')}
    ${[0,1].map(i=>`<g class="lg-drift" style="--d:${i*1.2}s">${bird(150+i*40,30+i*8,1.1,i*.4)}</g>`).join('')}`,'A field of solar rafts covering the ocean to the horizon'),
  // 2. a raft in cutaway: panels on top, batteries under the waterline, day then night
  lg_ocean2:()=>lgPic(124,null,`<g class="lg-flip"><rect width="300" height="62" fill="${OCC.sky}"/>${lgSun(250,24,12,OCC.sun)}${[0,1,2].map(i=>`<path d="M${236-i*14} ${34+i*3} L${194-i*30} ${46}" stroke="${OCC.sun}" stroke-width="2" class="lg-dash"/>`).join('')}</g>
    <g class="lg-flop"><rect width="300" height="62" fill="#26305e"/>${lgStars(14,50,6)}<circle cx="252" cy="22" r="9" fill="#fff6dc"/><circle cx="256" cy="19" r="8" fill="#26305e"/></g>
    ${ocSea(60,64)}<rect x="0" y="60" width="300" height="64" fill="${OCC.deep}" opacity=".25"/>${lgWaves(62,'#d9efe9',.45)}
    <path d="M70 56 L230 56 L216 42 L84 42Z" fill="${OCC.panel}"/><path d="M77 49 H223 M106 42 L102 56 M128 42 L126 56 M150 42 L150 56 M172 42 L174 56 M194 42 L198 56" stroke="#4d6a9a" stroke-width="1"/><path d="M84 42 H216" stroke="#cfe0ea" stroke-width="1" opacity=".6"/>
    <rect x="64" y="56" width="172" height="8" rx="2" fill="${OCC.rim}"/>
    <rect x="80" y="64" width="140" height="40" rx="6" fill="#d6cdbb" opacity=".9"/><rect x="80" y="64" width="140" height="40" rx="6" fill="none" stroke="#fff" stroke-dasharray="4 3" opacity=".8"/>
    ${[0,1,2,3].map(i=>`<g transform="translate(${92+i*32} 72)"><rect width="24" height="24" rx="3" fill="${OCC.white}" stroke="${OCC.ink}" stroke-opacity=".4"/><rect x="9" y="-3" width="6" height="3" rx="1" fill="${OCC.ink}" opacity=".6"/>
      <g class="lg-flip"><rect x="3" y="3" width="18" height="18" rx="2" fill="${OCC.teal}" class="lg-grow" style="--d:${i*.2}s"/></g><g class="lg-flop"><rect x="3" y="11" width="18" height="10" rx="2" fill="${OCC.mustard}"/></g></g>`).join('')}
    <path d="M226 56 V32" stroke="${OCC.ink}" stroke-width="1.4"/><g class="lg-flop"><circle cx="226" cy="31" r="5" fill="#ffd45c" opacity=".35"/></g><circle cx="226" cy="31" r="2.2" fill="${OCC.coral}"/>
    <g class="lg-flip">${igT(40,24,T('Day{0}',''),{s:11,c:OCC.ink})}</g><g class="lg-flop">${igT(40,24,T('Night{0}',''),{s:11,c:'#fff6dc'})}</g>`,'A raft with solar panels on top and batteries underneath, by day and by night'),
  // 3. a datacenter platform, with cold water pumped up from deep below
  lg_ocean3:()=>{const g=igId('ocd');return lgPic(132,null,`<rect width="300" height="64" fill="${OCC.sky}"/>${lgCloud(56,22,.8)}
    <rect x="0" y="62" width="300" height="70" fill="url(#${g})"/><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${OCC.sea}"/><stop offset="1" stop-color="#173c50"/></linearGradient></defs>
    ${lgWaves(64,'#d9efe9',.4)}${ocRaft(30,68,10,.4)}${ocRaft(270,68,10,.4)}
    ${ocPlat(150,64,.82)}
    <path d="M126 66 V124" stroke="#cfdde0" stroke-width="6"/><path d="M126 66 V124" stroke="${OCC.teal}" stroke-width="6" stroke-dasharray="2 9"/>
    <path d="M118 120 L118 74" stroke="#9ff3e6" stroke-width="2.4" class="lg-dash"/><path d="M114 79 L118 72 L122 79" stroke="#9ff3e6" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    ${igT(96,118,'cold water',{s:9.5,c:'#cfeee8',a:'end'})}
    ${[0,1,2].map(i=>`<circle cx="${150+i*9-9}" cy="${10+(i%2)*4}" r="${2.2+i*.6}" fill="${OCC.teal}" opacity=".55" class="lg-pop" style="--d:${i*.3}s"/>`).join('')}
    ${[0,1,2,3].map(i=>`<path d="M${206+i*12} ${92+i%2*8} q4 -3 8 0 q-4 3 -8 0" fill="#9fd0d8" class="lg-drift" style="--d:${i*.7}s"/>`).join('')}`,'A white datacenter platform drawing cold water from deep below')},
  // 4. far from any city: easy to switch off, hard for any one country to grab
  lg_ocean4:()=>lgPic(124,[OCC.sky,OCC.sky2],`${ocSea(84,40,OCC.sea2)}${lgWaves(88,'#d9efe9',.45)}
    <path d="M0 84 L0 64 Q14 58 30 62 L42 84Z" fill="#b7c49a"/>${[[3,50,8,'#e6dccb'],[12,44,7,'#f1e8da'],[20,54,8,'#ddd2bf']].map(([x,y,bw,c])=>`<rect x="${x}" y="${y}" width="${bw}" height="${66-y}" rx="1" fill="${c}"/>${[0,1,2].map(r=>`<rect x="${x+2}" y="${y+3+r*4}" width="${bw-4}" height="1.6" fill="#b9c8d6"/>`).join('')}`).join('')}
    ${lgArrow(52,74,160,74,OCC.ink)}${igT(106,66,'far from any city',{s:9.5,c:OCC.ink})}
    ${ocPlat(226,86,.62)}
    ${[['#e5484d','#fff'],['#1f6fd1','#f5b82e'],['#1fa774','#fff'],['#f5b82e','#e5484d']].map(([a,b],i)=>`<g transform="translate(${178+i*30} ${96+(i%2)*6})"><path d="M-6 6 h12 l-3 4 h-6z" fill="${OCC.mustard}"/>${lgFlag(0,-20,a,b,.8)}</g>`).join('')}
    <g transform="translate(262 22)"><rect x="-16" y="-10" width="32" height="20" rx="10" fill="#fff" stroke="${OCC.ink}" stroke-opacity=".4"/><g class="lg-flip"><circle cx="6" cy="0" r="7" fill="${OCC.teal}"/></g><g class="lg-flop"><circle cx="-6" cy="0" r="7" fill="${OCC.coral}"/></g></g>
    <g class="lg-flip">${igT(226,26,'ON',{s:9,c:OCC.teal,a:'end',w:800})}</g><g class="lg-flop">${igT(226,26,'OFF',{s:9,c:OCC.coral,a:'end',w:800})}</g>`,'A datacenter far from any city, with boats from many countries watching it and a switch that can turn it off'),
  // 5. data tankers: new chips out, old chips home
  lg_ocean5:()=>lgPic(124,[OCC.sky,OCC.sky2],`${lgCloud(40,22,.7)}${ocSea(74,50,OCC.sea2)}${lgWaves(78,'#d9efe9',.45)}${lgWaves(104,'#d9efe9',.3)}
    ${ocPlat(282,76,.45)}
    <g class="lg-move" style="--from:-70px;--to:110px;animation-duration:9s">${ocTanker(70,80,.9)}<g transform="translate(72 42)">${ocChip(0,0,.8)}</g></g>
    <g class="lg-move" style="--from:60px;--to:-150px;animation-duration:11s">${ocTanker(250,112,.55,true,true)}
      <g transform="translate(246 86)"><circle r="7.5" fill="#fff" stroke="${OCC.ink}" stroke-opacity=".3"/><path d="M-3.8 2.1 A4.2 4.2 0 0 1 -1.7 -3.4 M1.7 -3.7 A4.2 4.2 0 0 1 3.9 1.7 M2.5 3.7 A4.2 4.2 0 0 1 -3.4 2.9" stroke="${OCC.teal}" stroke-width="1.6" fill="none" stroke-linecap="round"/></g></g>
    <g transform="translate(286 0)">${igT(0,20,'new chips out',{s:9.5,c:OCC.ink,a:'end'})}${igT(0,34,'old chips home',{s:9.5,c:'#6f7690',a:'end'})}</g>`,'A data tanker carrying new chips out and old chips home to be recycled'),
  // 6. where it started, in the 2020s: floating solar on a lake, and a test datacenter on the seafloor
  lg_ocean6:()=>{const g=igId('ocs');return lgPic(124,null,`<rect width="150" height="124" fill="#e8f3e6"/><rect x="0" y="0" width="150" height="56" fill="${OCC.sky}"/>
    <path d="M0 56 Q40 46 80 52 T150 50 V60 H0Z" fill="#8fbf7a"/>${[16,40,118,138].map((x,i)=>`<g class="lg-swing" style="--d:${i*.3}s">${tree(x,50,.55)}</g>`).join('')}
    <rect x="0" y="58" width="150" height="66" fill="#6aaab0"/>${lgWaves(62,'#e6f6f2',.4)}
    ${[0,1,2].map(r=>[0,1,2,3,4].map(c=>`<g transform="translate(${22+c*24+(r%2)*10} ${74+r*16})"><path d="M-9 4 H9" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M-8 2 L8 2 L6 -4 L-6 -4Z" fill="${OCC.panel}"/></g>`).join('')).join('')}
    ${lgSun(132,18,8,OCC.sun)}
    <rect x="150" y="0" width="150" height="124" fill="url(#${g})"/><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f8c9a"/><stop offset="1" stop-color="#173c50"/></linearGradient></defs>
    ${[0,1,2,3].map(i=>`<path d="M${170+i*30} 0 L${186+i*30} 124" stroke="#fff" stroke-width="8" opacity=".05"/>`).join('')}
    <path d="M150 112 Q200 104 250 110 T300 108 V124 H150Z" fill="#c9b48a"/>
    <g transform="translate(226 96)"><rect x="-34" y="-12" width="68" height="24" rx="12" fill="#e9eef0" stroke="#9aa6b0" stroke-width="1.2"/>${[-20,-6,8,22].map(c=>`<path d="M${c} -12 V12" stroke="#9aa6b0" stroke-width="1"/>`).join('')}<path d="M-30 12 v6 M30 12 v6" stroke="#7a8590" stroke-width="3"/></g>
    ${[0,1,2].map(i=>`<g class="lg-drift" style="--d:${i*.9}s"><path transform="translate(${180+i*36} ${44+i*14})" d="M0 0 q6 -5 12 0 q-6 5 -12 0 M12 0 l4 -3 v6z" fill="#f5b82e"/></g>`).join('')}
    ${[0,1,2].map(i=>`<circle cx="${244+i*5}" cy="${78-i*12}" r="${1.4+i*.5}" fill="#dff3ff" opacity=".7" class="lg-rise" style="--d:${i*.8}s"/>`).join('')}
    <path d="M150 0 V124" stroke="#fff" stroke-width="2"/>${lgBadge(150,112,'2020s',OCC.ink,{w:56})}`,'Floating solar panels on a lake, and a test datacenter on the seafloor')}
});
