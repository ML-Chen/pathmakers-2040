// bea.js — Byte's pictures for "Dancing at 104": one looping picture per document sentence (VIZ.bea_*), the
// muscle lesson, and the Future Table / reveal vignettes (beaVignette). Figures come from src/viz/bea_cast.js.
// Animations are CSS classes from infog (ig-*) and src/css/bea.css (beav-*). Every number matches src/missions/bea.js.
const BEAV={ink:'#1f2340',soft:'#8a90b0',line:'#dfe3f3',teal:'#16b3a6',violet:'#6c5ce7',coral:'#ff7a6b',gold:'#f5b82e',red:'#e5484d',green:'#1fa774',
  plum:'#7d4fa8',lav:'#b89be0',muscle:'#e8737a',muscleL:'#f6a4a0',muscleD:'#b8485a',bone:'#fff3dc',boneS:'#e8d3a8',skin:SKIN[4],skinL:'#9a643e',paper:'#fbf8f3'};
const beaVT=(x,y,t,o={})=>igT(x,y,t,o);
// ---------- small parts ----------
function bvFig(svg,x,y,s){return `<g transform="translate(${x} ${y}) scale(${s})">${svg}</g>`}
function bvHeart(x,y,s,col,extra){return `<path transform="translate(${x} ${y}) scale(${s})" d="M0 3.2 C-1.2 2.2 -4 .4 -4 -1.6 C-4 -3.2 -2.8 -4.2 -1.6 -4.2 C-.8 -4.2 -.2 -3.7 0 -3.1 C.2 -3.7 .8 -4.2 1.6 -4.2 C2.8 -4.2 4 -3.2 4 -1.6 C4 .4 1.2 2.2 0 3.2Z" fill="${col}" ${extra||''}/>`}
function bvPerson(x,y,col,s){s=s||1;return `<g transform="translate(${x} ${y}) scale(${s})"><circle cx="0" cy="-3.6" r="1.9" fill="${col}"/><path d="M-2.4 2.6 C-2.6 -.4 -1.6 -1.4 0 -1.4 C1.6 -1.4 2.6 -.4 2.4 2.6Z" fill="${col}"/></g>`}
// a grid of people (cols x rows), first n highlighted; cls/odd per highlighted
function bvCrowd(x,y,cols,rows,n,on,off,cell,cls){let s='';for(let i=0;i<cols*rows;i++){const c=i%cols,r=Math.floor(i/cols),hit=i>=cols*rows-n;
  s+=`<g class="${hit?cls||'':''}" style="--d:${(i%7)*.12}s">${bvPerson(x+c*cell,y+r*cell*.92,hit?on:off,cell/8.2)}</g>`}return s}
// muscle fiber: a long capsule with striations; w = thickness
function bvFiber(x,y,len,w,o={}){const id='bvf'+(++IGN);return `<g transform="translate(${x} ${y})"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${o.top||BEAV.muscleL}"/><stop offset=".55" stop-color="${o.mid||BEAV.muscle}"/><stop offset="1" stop-color="${o.bot||BEAV.muscleD}"/></linearGradient></defs>
  <rect x="0" y="${-w/2}" width="${len}" height="${w}" rx="${w/2}" fill="url(#${id})" stroke="${o.line||'#9a3a4a'}" stroke-width="1.1"/>
  ${[...Array(Math.max(2,Math.floor(len/7)))].map((_,i)=>`<path d="M${6+i*7} ${-w/2+1.4} Q${8+i*7} 0 ${6+i*7} ${w/2-1.4}" stroke="#ffffff" stroke-width=".8" fill="none" opacity=".35"/>`).join('')}
  <path d="M${w*.5} ${-w*.22} H${len-w*.5}" stroke="#fff" stroke-width="${Math.max(.8,w*.16)}" stroke-linecap="round" opacity=".45"/></g>`}
// cross-section of a muscle: a sheath packed with fiber circles
function bvBundle(cx,cy,r,n,seed){const R=bc_rng(seed||3);let s=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#f9d6d2" stroke="#b8485a" stroke-width="1.6"/>`;
  const pts=[];for(let k=0;pts.length<n&&k<n*40;k++){const a=R()*Math.PI*2,d=Math.sqrt(R())*(r-5),x=cx+Math.cos(a)*d,y=cy+Math.sin(a)*d;if(pts.every(p=>Math.hypot(p[0]-x,p[1]-y)>7.6))pts.push([x,y])}
  return s+pts.map(([x,y])=>`<circle cx="${ch_n(x)}" cy="${ch_n(y)}" r="3.5" fill="${BEAV.muscle}" stroke="#b8485a" stroke-width=".7"/><circle cx="${ch_n(x-1)}" cy="${ch_n(y-1)}" r="1.1" fill="#fff" opacity=".5"/>`).join('')}
// Tempo, the dosing AI: a teal tile with a metronome (its pendulum swings)
function bvTempo(x,y,s){return `<g transform="translate(${x} ${y}) scale(${s||1})"><rect x="-17" y="-17" width="34" height="34" rx="9" fill="#0f8f84"/><rect x="-17" y="-17" width="34" height="34" rx="9" fill="none" stroke="#7ff7e4" stroke-width="1.4" opacity=".7"/>
  <path d="M-8 11 L-3.4 -11 L3.4 -11 L8 11Z" fill="#e8fffb" opacity=".95"/><path d="M-6 6 H6" stroke="#0f8f84" stroke-width="1.4"/><g><animateTransform attributeName="transform" type="rotate" values="-22 0 8;22 0 8;-22 0 8" keyTimes="0;.5;1" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1" dur="1.6s" repeatCount="indefinite"/><path d="M0 8 L0 -12" stroke="#0f5a54" stroke-width="1.8" stroke-linecap="round"/><rect x="-2.4" y="-6" width="4.8" height="3.4" rx="1" fill="#f5b82e"/></g><circle cx="0" cy="8" r="1.6" fill="#0f5a54"/></g>`}
// a weekly patch with a dose level (0..1)
function bvPatch(x,y,s,level,o={}){const id='bvp'+(++IGN);return `<g transform="translate(${x} ${y}) scale(${s})"><defs><clipPath id="${id}"><rect x="-12" y="-12" width="24" height="24" rx="7"/></clipPath></defs>
  <rect x="-12" y="-12" width="24" height="24" rx="7" fill="#fff6fa" stroke="#c46a8a" stroke-width="1.4"/>
  <g clip-path="url(#${id})"><rect x="-12" y="${12-24*level}" width="24" height="${24*level}" fill="${o.col||'#ff9ec0'}" class="${o.cls||''}"/></g>
  <path d="M-3.6 0 H3.6 M0 -3.6 V3.6" stroke="#c46a8a" stroke-width="1.8" stroke-linecap="round"/>${level===0?`<path d="M-15 15 L15 -15" stroke="${BEAV.soft}" stroke-width="2.4" stroke-linecap="round"/>`:''}</g>`}
function bvECG(x,y,w,kind,cls){let d=`M${x} ${y}`;const beat=(bx,a)=>` L${bx} ${y} l3 -2 l2 2 l2 0 l2 ${-12*a} l2 ${16*a} l2 ${-4*a} l3 0`;
  const n=Math.floor(w/22);for(let i=0;i<n;i++){const bx=x+i*22+4,fl=kind==='flutter'&&i>=n/2;d+=fl?` L${bx} ${y} l2 -6 l2 9 l2 -8 l2 7 l2 -9 l2 8 l2 -6 l2 5 l2 -4`:beat(bx,1)}
  return `<path d="${d} L${x+w} ${y}" stroke="${kind==='flutter'?BEAV.red:BEAV.teal}" stroke-width="2" fill="none" stroke-linejoin="round" class="${cls||''}"/>`}
function bvBubble(x,y,w,h,txt,o={}){return `<g transform="translate(${x} ${y})"><g class="${o.cls||''}" style="--d:${o.d||0}s"><rect x="${-w/2}" y="${-h/2}" width="${w}" height="${h}" rx="${h/2.4}" fill="${o.fill||'#fff'}" stroke="${o.stroke||BEAV.line}" stroke-width="1.4"/>
  <path d="M${o.tail||-w/4} ${h/2-1} l${o.tdx||-6} 8 l10 -8" fill="${o.fill||'#fff'}" stroke="${o.stroke||BEAV.line}" stroke-width="1.4" stroke-linejoin="round"/><rect x="${(o.tail||-w/4)-7}" y="${h/2-3}" width="14" height="3" fill="${o.fill||'#fff'}"/>
  ${String(txt).split('|').map((t,i,a)=>beaVT(0,(i-(a.length-1)/2)*12+4,t,{s:o.s||10.5,c:o.c||BEAV.ink})).join('')}</g></g>`}
function bvDial(x,y,r,v,o={}){const a=-120+240*v,rad=a*Math.PI/180;return `<g transform="translate(${x} ${y})"><path d="M${-r*Math.sin(2.094)} ${r*Math.cos(2.094)} A${r} ${r} 0 1 1 ${r*Math.sin(2.094)} ${r*Math.cos(2.094)}" stroke="${BEAV.line}" stroke-width="5" fill="none" stroke-linecap="round"/>
  <g>${o.cls?`<animateTransform attributeName="transform" type="rotate" values="${-a-120} 0 0;0 0 0;0 0 0;${-a-120} 0 0" keyTimes="0;.3;.85;1" dur="4.5s" repeatCount="indefinite"/>`:''}<path d="M0 0 L${ch_n(Math.sin(rad)*(r-4))} ${ch_n(-Math.cos(rad)*(r-4))}" stroke="${o.col||BEAV.coral}" stroke-width="3" stroke-linecap="round"/></g><circle r="3.6" fill="${BEAV.ink}"/>${o.label?beaVT(0,r+12,o.label,{s:9.5,c:BEAV.soft}):''}</g>`}
// the dance hall floor strip used under figures
function bvFloor(y,w){return `<path d="M0 ${y} H${w||300} V${y+14} H0Z" fill="#e9c58f"/>${[...Array(16)].map((_,i)=>`<path d="M${i*20} ${y} v14" stroke="#c99a5c" stroke-width=".8" opacity=".6"/>`).join('')}<path d="M0 ${y} H${w||300}" stroke="#b07a3a" stroke-width="1.2"/>`}

const BV_VIZ={
  // memo 1: leg muscle at 70 vs at 104, and Bea with her cane
  bea_legs:()=>igFrame(300,140,`
    <g>${bvBundle(62,62,40,24,5)}${beaVT(62,120,'Age 70',{s:11})}</g>
    <path d="M110 62 h22" stroke="${BEAV.soft}" stroke-width="2.4" stroke-dasharray="4 4" class="ig-dash"/><path d="M130 56 l7 6 l-7 6" fill="none" stroke="${BEAV.soft}" stroke-width="2.4"/>
    <g class="ig-pulse" style="--d:.4s">${bvBundle(170,62,28,12,9)}</g>${beaVT(170,120,'Age 104',{s:11})}${beaVT(170,134,'about half the strength',{s:9.5,c:BEAV.soft})}
    ${bvFig(beaFig('cane',{mood:'smile'}),250,122,1.55)}`,'Leg muscle at 70 and at 104'),
  // memo 2: 13 weeks of calendar, the wedding at the end
  bea_calendar:()=>{let g='';for(let w=0;w<13;w++)for(let d=0;d<7;d++)g+=`<rect x="${14+w*20}" y="${30+d*11}" width="16" height="9" rx="2.5" fill="${w===12&&d===5?BEAV.coral:'#e6e9f6'}" class="${w===12&&d===5?'':'beav-wk'}" style="--d:${(w*.28).toFixed(2)}s"/>`;
    return igFrame(300,150,`${g}${[0,4,8,12].map(w=>beaVT(22+w*20,22,'Wk '+(w+1),{s:9,c:BEAV.soft})).join('')}
     ${beaVT(22,125,'Today',{s:10,a:'start',c:BEAV.ink})}<path d="M18 112 v-6" stroke="${BEAV.ink}" stroke-width="2"/>
     <g class="ig-pulse">${bvHeart(268,85,1.3,'#fff')}</g>
     <g transform="translate(250 128)"><rect x="-44" y="-10" width="88" height="20" rx="10" fill="${BEAV.coral}"/>${beaVT(0,4,'Wedding · July 19',{s:10,c:'#fff'})}</g><path d="M268 96 V117" stroke="${BEAV.coral}" stroke-width="2"/>`,'Thirteen weeks until the wedding')},
  // memo 3: renewal therapy: a fiber thickening week by week
  bea_renew:()=>igFrame(300,140,`${[[1,6],[4,9.5],[8,13],[13,17]].map(([wk,t],i)=>`<g class="ig-rise" style="--d:${i*.5}s">${bvFiber(18+i*70,58,56,t)}${beaVT(46+i*70,90,'Week '+wk,{s:10,c:BEAV.soft})}</g>`).join('')}
    <g class="beav-spark">${[[40,40],[115,36],[190,34],[262,30]].map(([x,y],i)=>ch_star(x,y,4,BEAV.gold,`class="ig-star" style="animation-delay:${i*.5}s"`)).join('')}</g>
    <path d="M20 116 H284" stroke="${BEAV.line}" stroke-width="4" stroke-linecap="round"/><path d="M20 116 H284" stroke="${BEAV.teal}" stroke-width="4" stroke-linecap="round" class="ig-grow"/>${beaVT(150,134,'a little stronger each week',{s:10,c:BEAV.soft})}`,'A muscle fiber growing thicker week by week'),
  // memo 4: 2,400 people over 80 vs 31 over 100
  bea_sample:()=>{let big='',small='';for(let i=0;i<240;i++){const c=i%20,r=Math.floor(i/20);big+=bvPerson(14+c*6.6,32+r*7.6,BEAV.teal,.62)}
    for(let i=0;i<31;i++){const c=i%6,r=Math.floor(i/6);small+=`<g class="ig-pulse" style="--d:${(i*.05).toFixed(2)}s">${bvPerson(218+c*11,40+r*13,BEAV.violet,1.2)}</g>`}
    return igFrame(300,150,`<rect x="6" y="20" width="148" height="100" rx="12" fill="#eefaf8"/>${big}<rect x="196" y="20" width="98" height="100" rx="12" fill="#f2f0ff"/>${small}
     ${beaVT(80,14,'Over 80: 2,400 people',{s:10.5})}${beaVT(245,14,'Over 100: 31',{s:10.5})}${beaVT(80,136,'each dot is 10 people',{s:9.5,c:BEAV.soft})}${beaVT(245,136,'each figure is 1 person',{s:9.5,c:BEAV.soft})}`,'Many people over 80 tried it; only 31 over 100')},
  // memo 5-7: the three options
  bea_opt:({k})=>{const lv={none:0,gentle:.5,full:1}[k],lab={none:'No renewal',gentle:'Half strength',full:'Full strength'}[k];
    return igFrame(300,140,`${bvFloor(118)}${bvFig(wrenFig('spot'),58,118,1.4)}<g class="beav-sitstand">${bvFig(beaFig('rail',{mood:'smile'}),96,118,1.4)}</g>
     <path d="M140 66 h18" stroke="${BEAV.soft}" stroke-width="2.4"/>${k==='none'?'':`<path d="M149 57 v18" stroke="${BEAV.soft}" stroke-width="2.4"/>`}
     ${bvPatch(206,62,2.2,lv,{cls:lv?'beav-fillup':''})}${beaVT(206,104,lab,{s:11})}
     ${k==='none'?beaVT(206,20,'Training only',{s:10,c:BEAV.soft}):beaVT(206,20,'Training + patch',{s:10,c:BEAV.soft})}`,'Bea training with Wren, plus '+lab)},
  // memo 8: heart flutters in the trial
  bea_flutterOdds:()=>{const grid=(x,n)=>{let s='';for(let i=0;i<100;i++){const c=i%10,r=Math.floor(i/10),hit=i>=100-n;s+=`<g class="${hit?'beav-flutter':''}" style="--d:${(i%5)*.1}s">${bvHeart(x+c*12,30+r*9.4,.95,hit?BEAV.red:'#f3c9cf')}</g>`}return s};
    return igFrame(300,150,`${grid(14,15)}${grid(170,5)}${beaVT(68,14,'Full dose: 15 in 100',{s:10.5,c:BEAV.red})}${beaVT(224,14,'Gentle dose: 5 in 100',{s:10.5,c:BEAV.red})}${beaVT(150,140,'a heart flutter during the trial',{s:10,c:BEAV.soft})}`,'Heart flutters on the full and gentle doses')},
  // memo 9: falls in three months
  bea_falls:()=>igFrame(300,150,`${bvCrowd(22,34,10,10,5,BEAV.coral,'#d9def0',11,'beav-wobble')}${bvCrowd(180,34,10,10,3,BEAV.coral,'#d9def0',11,'beav-wobble')}
    ${beaVT(70,14,'Training: 5 in 100',{s:10.5})}${beaVT(228,14,'+ dance practice: 3 in 100',{s:10.5})}${beaVT(150,144,'had a fall in three months',{s:10,c:BEAV.soft})}`,'Falls with and without dance practice'),
  // memo 10: practice the real thing: box-step footprints under Bea and Jordan
  bea_practice:()=>{const fp=(x,y,r,d)=>`<g transform="translate(${x} ${y}) rotate(${r})"><g class="beav-step" style="--d:${d}s"><ellipse cx="0" cy="-3" rx="3.2" ry="5.6" fill="${BEAV.violet}"/><ellipse cx="0" cy="5" rx="2.4" ry="2.6" fill="${BEAV.violet}"/></g></g>`;
    return igFrame(300,150,`<rect x="0" y="0" width="300" height="150" rx="10" fill="#fbf2e2"/>${bvFloor(112)}
     <g transform="translate(70 0)">${bvFig(beaFig('waltz',{dress:'day',mood:'happy'}),0,112,1.3)}${bvFig(jordanFig('waltz',{suit:false}),27,112,1.3)}</g>
     ${[[196,70,0,0],[220,70,0,.5],[220,96,0,1],[196,96,0,1.5],[208,58,0,2]].slice(0,4).map(p=>fp(...p)).join('')}
     <path d="M196 70 L220 70 L220 96 L196 96Z" fill="none" stroke="${BEAV.violet}" stroke-width="1" stroke-dasharray="3 3" opacity=".6"/>
     ${beaVT(208,40,'ONE-two-three',{s:10.5,c:BEAV.violet})}${beaVT(150,140,'Practice the exact move you want',{s:10,c:BEAV.soft})}`,'Bea and Jordan practicing the waltz box step')},
  // memo 11: the forecast (an hour of dancing, or one waltz once Byte knows)
  bea_forecast:({v,waltz})=>{const rows=[['Training only',v[0]],['Gentle dose',v[1]],['Full dose',v[2]]],X=w=>96+w*1.7;
    return igFrame(300,150,`${rows.map(([l,n],i)=>`<g>${beaVT(8,38+i*34,l,{s:11,a:'start'})}<rect x="96" y="${26+i*34}" width="170" height="16" rx="8" fill="#e6e9f6"/>
      <rect x="96" y="${26+i*34}" width="${n*1.7}" height="16" rx="8" fill="${waltz?(i===1?BEAV.gold:'#f7d47a'):(i===2?BEAV.violet:'#b3aaf0')}" class="ig-grow" style="--d:${i*.25}s"/>${beaVT(X(n)+6,39+i*34,String(n),{s:12,a:'start',w:800})}</g>`).join('')}
     ${waltz?`<g transform="translate(150 132)">${beaVT(0,0,'Goal: one 3-minute waltz',{s:10.5,c:'#b07a12'})}</g>`:`<g transform="translate(150 132)">${beaVT(0,0,'Goal assumed: an hour of dancing',{s:10.5,c:BEAV.soft})}</g>`}${beaVT(150,12,'Dances without her cane, out of 100',{s:10,c:BEAV.soft})}`,'Forecast bars')},
  // tempo 1: Tempo plans, Wren does
  bea_tempoWren:()=>igFrame(300,140,`${bvTempo(52,56,1.5)}${beaVT(52,98,'Tempo',{s:11})}${beaVT(52,112,'plans',{s:9.5,c:BEAV.soft})}
    <rect x="96" y="40" width="70" height="34" rx="8" fill="#fff" stroke="${BEAV.line}" stroke-width="1.6"/>${['Patch: Sun','Walk: 10 min','Grip: 3x'].map((t,i)=>beaVT(102,51+i*10,t,{s:8,a:'start',c:BEAV.ink})).join('')}
    <g class="ig-fly beav-fly2"><rect x="0" y="-6" width="12" height="14" rx="2" fill="#fff" stroke="${BEAV.teal}"/></g>
    <path d="M168 57 H196" stroke="${BEAV.teal}" stroke-width="2.4" class="ig-dash"/><path d="M194 51 l7 6 l-7 6" fill="none" stroke="${BEAV.teal}" stroke-width="2.4"/>
    ${bvFig(wrenFig('spot',{bar:'M-4 -49 Q0 -47 4 -49'}),228,122,1.45)}${bvFig(beaFig('cane'),266,122,1.25)}${beaVT(244,136,'Wren does',{s:9.5,c:BEAV.soft})}`,'Tempo makes the plan and Wren carries it out'),
  // tempo 2: a fixed, approved plan: small steps up to the full dose
  bea_approved:()=>{const st=[0,1,2,3,4];return igFrame(300,150,`<rect x="20" y="16" width="160" height="122" rx="10" fill="#fff" stroke="${BEAV.line}" stroke-width="1.6"/><rect x="76" y="10" width="48" height="12" rx="4" fill="#cfd6ea"/>
    ${beaVT(100,38,'Clinic’s approved plan',{s:10.5})}
    ${st.map(i=>`<rect x="${36+i*26}" y="${118-i*14-14}" width="24" height="${14+i*14}" rx="3" fill="${i===4?'#ff9ec0':'#ffd3e2'}" stroke="#c46a8a" stroke-width="1"/>`).join('')}
    <g><animateTransform attributeName="transform" type="translate" values="48 96;74 82;100 68;126 54;152 40;152 40" keyTimes="0;.2;.4;.6;.8;1" calcMode="discrete" dur="5s" repeatCount="indefinite"/>${bvPatch(0,0,.55,.5)}</g>${beaVT(48,132,'start',{s:8.5,c:BEAV.soft})}${beaVT(150,132,'full dose',{s:8.5,c:BEAV.soft})}
    <g transform="translate(240 70)"><circle r="34" fill="#eefaf8" stroke="${BEAV.teal}" stroke-width="2"/>${beaVT(0,-8,'No learning',{s:10,c:'#0f7f75'})}${beaVT(0,6,'on the job',{s:10,c:'#0f7f75'})}<path d="M-10 16 l7 7 l13 -13" stroke="${BEAV.green}" stroke-width="3.4" fill="none" stroke-linecap="round" class="ig-pop"/></g>
    ${beaVT(240,124,'updates need approval',{s:9.5,c:BEAV.soft})}`,'A fixed approved plan with small dose steps')},
  // tempo 3: Wren's four morning checks
  bea_sensors:()=>{const icons=[
      [`<path d="M-9 4 C-9 -6 -4 -9 0 -9 C4 -9 9 -6 9 4" stroke="${BEAV.ink}" stroke-width="3" fill="none"/><rect x="-11" y="2" width="22" height="8" rx="4" fill="${BEAV.teal}"/>`,'Grip'],
      [`<ellipse cx="-4" cy="-2" rx="3" ry="5" fill="${BEAV.ink}"/><ellipse cx="-4" cy="5.6" rx="2.2" ry="2.2" fill="${BEAV.ink}"/><ellipse cx="5" cy="-6" rx="3" ry="5" fill="${BEAV.ink}"/><ellipse cx="5" cy="1.6" rx="2.2" ry="2.2" fill="${BEAV.ink}"/>`,'Steps'],
      [`<path d="M3 -9 A9 9 0 1 0 9 4 A7 7 0 1 1 3 -9Z" fill="${BEAV.violet}"/>${beaVT(9,-4,'z',{s:8,c:BEAV.violet})}`,'Sleep'],
      [`${bvHeart(0,0,2,BEAV.red)}<path d="M-8 1 h4 l2 -4 l2 7 l2 -3 h6" stroke="#fff" stroke-width="1.4" fill="none"/>`,'Heart rhythm']];
    return igFrame(300,140,`${bvFig(wrenFig('stand'),40,124,1.6)}<path d="M54 40 L290 20 L290 100 L54 60Z" fill="#7ff7e4" opacity=".12" class="beav-scan"/>
     ${icons.map(([g,l],i)=>`<g transform="translate(${104+i*54} 62)"><g class="beav-check" style="--d:${i*.6}s"><circle r="20" fill="#fff" stroke="${BEAV.line}" stroke-width="1.6"/>${g}</g></g>${beaVT(104+i*54,98,l,{s:9.5})}<path d="M${98+i*54} 112 l4 4 l8 -8" stroke="${BEAV.green}" stroke-width="2.6" fill="none" stroke-linecap="round" class="beav-tick" style="--d:${i*.6}s"/>`).join('')}`,'Four checks every morning')},
  // tempo 4: the goal Tempo aims at
  bea_goal:({waltz})=>igFrame(300,140,`<g transform="translate(230 66)">${[46,34,22,10].map((r,i)=>`<circle r="${r}" fill="${i%2?'#fff':(waltz?'#ffe9b0':'#e6e9f6')}" stroke="${waltz?BEAV.gold:BEAV.soft}" stroke-width="1.4"/>`).join('')}
     ${waltz?bvHeart(0,1,1.6,BEAV.coral):`<rect x="-7" y="-1.4" width="14" height="2.8" rx="1" fill="${BEAV.ink}"/><rect x="-10" y="-5" width="3.4" height="10" rx="1.2" fill="${BEAV.coral}"/><rect x="6.6" y="-5" width="3.4" height="10" rx="1.2" fill="${BEAV.coral}"/>`}</g>
    <g class="beav-arrow"><path d="M40 66 H170" stroke="${BEAV.teal}" stroke-width="3"/><path d="M170 60 l12 6 l-12 6Z" fill="${BEAV.teal}"/><path d="M40 60 l-8 -6 M40 72 l-8 6" stroke="${BEAV.teal}" stroke-width="3"/></g>
    ${bvTempo(28,66,.9)}
    <g transform="translate(116 114)"><rect x="-104" y="-13" width="208" height="26" rx="13" fill="${waltz?'#fff4d4':'#f0f2fa'}" stroke="${waltz?BEAV.gold:BEAV.line}" stroke-width="1.4"/>${beaVT(0,4,waltz?'Goal: one 3-minute waltz':'Goal: as strong as possible by July 19',{s:10,c:waltz?'#8a5a08':BEAV.ink})}</g>
    ${beaVT(116,18,waltz?'Waiting for Bea’s yes':'Typed in by Jordan',{s:9.5,c:BEAV.soft})}`,'The goal Tempo aims at'),
  // tempo 5: changes on its own, then a message afterward
  bea_modeAlone:()=>igFrame(300,140,`${bvTempo(40,56,1.1)}<path d="M64 56 H96" stroke="${BEAV.teal}" stroke-width="2.4" class="ig-dash"/>${bvDial(130,60,26,.75,{cls:'beav-dialup',label:'dose'})}
    ${bvFig(beaFig('stand',{mood:'surprised'}),246,128,1.45)}${bvBubble(226,24,120,30,'Done! I raised your|dose this morning.',{cls:'beav-late',s:9.5,tail:20,tdx:6})}`,'Tempo changes the plan and tells Bea afterward'),
  // tempo 6: ask first, nothing changes until she agrees
  bea_modeAsk:()=>igFrame(300,140,`${bvTempo(40,56,1.1)}<g transform="translate(130 56)"><rect x="-44" y="-30" width="88" height="62" rx="10" fill="#fff" stroke="${BEAV.line}" stroke-width="1.6"/>${beaVT(0,-14,'Raise the dose?',{s:10})}
     <rect x="-38" y="2" width="36" height="20" rx="8" fill="${BEAV.green}" class="beav-press"/>${beaVT(-20,16,'Yes',{s:10,c:'#fff'})}<rect x="2" y="2" width="36" height="20" rx="8" fill="#eef0f6"/>${beaVT(20,16,'Not today',{s:7.6,c:BEAV.ink})}</g>
    ${bvFig(beaFig('wave',{mood:'happy'}),236,128,1.45)}${beaVT(130,118,'nothing changes until she agrees',{s:9.5,c:BEAV.soft})}`,'Tempo asks; Bea decides'),
  // tempo 7: a little faster: two progress bars racing to the wedding flag
  bea_faster:()=>igFrame(300,120,`${[['Tempo alone',0,BEAV.teal,'beav-race1'],['Bea says yes',1,BEAV.violet,'beav-race2']].map(([l,i,c,cl])=>`<g>${beaVT(8,38+i*36,l,{s:10.5,a:'start'})}<rect x="96" y="${28+i*36}" width="160" height="12" rx="6" fill="#e6e9f6"/><rect x="96" y="${28+i*36}" width="160" height="12" rx="6" fill="${c}" class="${cl}"/></g>`).join('')}
    <path d="M262 18 V92" stroke="${BEAV.coral}" stroke-width="2"/><path d="M262 18 h16 l-4 5 l4 5 h-16Z" fill="${BEAV.coral}"/>${beaVT(150,110,'about 4 more in 100 ready in time',{s:10,c:BEAV.soft})}`,'Changing alone is a little faster'),
  // tempo 8: who quit early
  bea_quitOdds:()=>igFrame(300,150,`${bvCrowd(22,34,10,10,15,BEAV.coral,'#d9def0',11,'beav-leave')}${bvCrowd(180,34,10,10,3,BEAV.coral,'#d9def0',11,'beav-leave')}
    ${beaVT(70,14,'Changed without asking',{s:10})}${beaVT(228,14,'Said yes to each change',{s:10})}${beaVT(72,146,'15 in 100 quit',{s:10.5,c:BEAV.coral})}${beaVT(230,146,'3 in 100 quit',{s:10.5,c:BEAV.coral})}`,'More people quit when changes came without asking'),
  // tempo 9: automatic safety pause
  bea_pause:()=>igFrame(300,130,`<rect x="10" y="20" width="200" height="60" rx="10" fill="#1e2450"/><g clip-path="inset(0)">${bvECG(16,52,190,'flutter','beav-ecg')}</g>
    <g transform="translate(250 50)"><g class="beav-pausepop"><circle r="26" fill="${BEAV.teal}"/><rect x="-9" y="-12" width="6" height="24" rx="2" fill="#fff"/><rect x="3" y="-12" width="6" height="24" rx="2" fill="#fff"/></g></g>
    ${beaVT(250,96,'Paused',{s:11,c:BEAV.teal})}${beaVT(110,104,'under 1 minute, in every setting',{s:10,c:BEAV.soft})}`,'Tempo pauses the dose on its own'),
  // sheet 1: waking the repair cells
  bea_cells:()=>igFrame(300,130,`${bvFiber(20,50,260,22)}<path d="M20 98 H280" stroke="${BEAV.boneS}" stroke-width="16" stroke-linecap="round"/><path d="M20 98 H280" stroke="${BEAV.bone}" stroke-width="12" stroke-linecap="round"/>
    ${[[50,50],[110,46],[170,54],[230,48],[80,98],[150,98],[220,98]].map(([x,y],i)=>`<g class="beav-wake" style="--d:${i*.35}s"><circle cx="${x}" cy="${y}" r="5" fill="#ffd45c" stroke="#b07a12" stroke-width="1"/>${ch_star(x+6,y-7,3.4,'#fff4b0')}</g>`).join('')}
    ${beaVT(150,26,'muscle',{s:10,c:BEAV.soft})}${beaVT(150,124,'bone',{s:10,c:BEAV.soft})}`,'Repair cells waking up in muscle and bone'),
  // sheet 2: Wren places the weekly patch on her upper arm
  bea_patch:()=>igFrame(300,130,`<path d="M0 116 H190" stroke="${BEAV.line}" stroke-width="2"/>${bvFig(wrenFig('patch'),72,116,1.55)}${bvFig(beaFig('sit',{mood:'smile'}),120,116,1.55)}
    <g transform="translate(101.6 50)"><circle r="9" fill="none" stroke="${BEAV.coral}" stroke-width="1.6" stroke-dasharray="3 3" class="ig-pulse"/></g>
    <g transform="translate(244 64)"><rect x="-34" y="-30" width="68" height="62" rx="9" fill="#fff" stroke="${BEAV.line}" stroke-width="1.6"/><rect x="-34" y="-30" width="68" height="16" rx="8" fill="${BEAV.coral}"/>${beaVT(0,-18,'SUNDAY',{s:9.5,c:'#fff'})}${beaVT(0,14,'1 patch',{s:12})}${beaVT(0,27,'each week',{s:9,c:BEAV.soft})}</g>`,'Wren puts a weekly patch on Bea’s upper arm'),
  // sheet 3: full dose: big gains, aches for the first 3 weeks
  bea_aches:()=>igFrame(300,130,`${bvPatch(40,44,1.6,1)}${beaVT(40,82,'Full dose',{s:10.5})}
    <g transform="translate(110 20)">${[0,1,2,3,4,5].map(i=>`<rect x="${i*28}" y="0" width="24" height="24" rx="6" fill="${i<3?'#ffd3d6':'#e6e9f6'}"/>${beaVT(12+i*28,38,'Wk '+(i+1),{s:8.5,c:BEAV.soft})}${i<3?`<path d="M${5+i*28} 12 l4 -5 l4 8 l4 -8 l3 5" stroke="${BEAV.red}" stroke-width="1.8" fill="none" class="beav-ache" style="--d:${i*.2}s"/>`:''}`).join('')}</g>
    <path d="M118 104 L262 72" stroke="${BEAV.green}" stroke-width="4" stroke-linecap="round" class="ig-grow"/><path d="M262 72 l-10 -1 l6 9Z" fill="${BEAV.green}"/>${beaVT(140,120,'biggest gains',{s:10,c:BEAV.green,a:'start'})}`,'The full dose: big gains, three weeks of aches'),
  // sheet 4: gentle dose: half strength, smaller gains, mild aches
  bea_gentle:()=>igFrame(300,130,`${bvPatch(40,44,1.6,.5)}${beaVT(40,82,'Gentle dose',{s:10.5})}
    <g transform="translate(110 20)">${[0,1,2,3,4,5].map(i=>`<rect x="${i*28}" y="0" width="24" height="24" rx="6" fill="${i<1?'#ffe9ea':'#e6e9f6'}"/>${beaVT(12+i*28,38,'Wk '+(i+1),{s:8.5,c:BEAV.soft})}${i<1?`<path d="M${7+i*28} 12 l3 -2 l3 4 l3 -4 l2 2" stroke="#e98a8f" stroke-width="1.4" fill="none" class="beav-ache"/>`:''}`).join('')}</g>
    <path d="M118 104 L262 88" stroke="${BEAV.green}" stroke-width="4" stroke-linecap="round" class="ig-grow"/><path d="M262 88 l-10 -3 l5 9Z" fill="${BEAV.green}"/>${beaVT(140,122,'smaller gains, milder aches',{s:10,c:BEAV.green,a:'start'})}`,'The gentle dose: smaller gains, milder aches'),
  // sheet 5: a flutter stops once the dose is paused
  bea_flutterStop:()=>igFrame(300,120,`<rect x="10" y="16" width="280" height="56" rx="10" fill="#1e2450"/>
    <path d="M16 44 h12 l2 -6 l2 9 l2 -8 l2 7 l2 -9 l2 8 l2 -6 l2 5 h8 l2 -6 l2 9 l2 -8 l2 7 l2 -9 l2 8 h10" stroke="${BEAV.red}" stroke-width="2" fill="none"/>
    <g transform="translate(118 44)"><circle r="12" fill="${BEAV.teal}"/><rect x="-5" y="-6" width="3.6" height="12" rx="1" fill="#fff"/><rect x="1.4" y="-6" width="3.6" height="12" rx="1" fill="#fff"/></g>
    <path d="M134 44 h10 l3 -2 l2 2 l2 0 l2 -12 l2 16 l2 -4 l3 0 h12 l3 -2 l2 2 l2 0 l2 -12 l2 16 l2 -4 l3 0 h12 l3 -2 l2 2 l2 0 l2 -12 l2 16 l2 -4 l3 0 h12 l3 -2 l2 2 l2 0 l2 -12 l2 16 l2 -4 l3 0 h6" stroke="${BEAV.teal}" stroke-width="2" fill="none" class="beav-calm"/>
    ${beaVT(62,92,'flutter',{s:10,c:BEAV.red})}${beaVT(118,92,'pause',{s:10,c:BEAV.teal})}${beaVT(218,92,'back to normal',{s:10,c:BEAV.teal})}`,'The flutter stops after the pause'),
  // sheet 6: over 80 approved; over 100 only with her own informed consent
  bea_consent:()=>igFrame(300,140,`<g transform="translate(58 62)"><rect x="-44" y="-40" width="88" height="80" rx="10" fill="#eefaf8" stroke="${BEAV.teal}" stroke-width="1.4"/>${beaVT(0,-20,'Over 80',{s:11})}<path d="M-12 4 l8 8 l16 -18" stroke="${BEAV.green}" stroke-width="4" fill="none" stroke-linecap="round"/>${beaVT(0,30,'approved',{s:10,c:BEAV.green})}</g>
    <g transform="translate(200 66)"><rect x="-80" y="-48" width="160" height="96" rx="10" fill="#fff" stroke="${BEAV.line}" stroke-width="1.6"/>${beaVT(0,-28,'Over 100: her own yes',{s:11})}
     <rect x="-64" y="-14" width="128" height="40" rx="6" fill="#f6f4fa"/>${beaVT(-56,-2,'I understand the odds.',{s:8.5,a:'start',c:BEAV.soft})}
     <path d="M-54 18 C-46 8 -40 22 -32 12 C-26 6 -22 18 -14 12 C-8 8 -4 16 4 10" stroke="${BEAV.plum}" stroke-width="2" fill="none" stroke-linecap="round" class="beav-sign"/>${beaVT(30,38,'Bea Hollis',{s:9,c:BEAV.soft})}</g>`,'Over 100, only with her own consent'),
  // ledger 1: the sprung floor: boards on springs
  bea_floor:()=>igFrame(300,130,`<rect x="0" y="0" width="300" height="130" rx="10" fill="#fbf2e2"/>
    <g class="beav-bounce"><rect x="20" y="58" width="260" height="14" rx="2" fill="#d9a35f" stroke="#8a5a2a" stroke-width="1.2"/>${[...Array(13)].map((_,i)=>`<path d="M${20+i*20} 58 v14" stroke="#8a5a2a" stroke-width=".8" opacity=".6"/>`).join('')}
     ${bvFig(beaFig('waltz',{dress:'wedding',mood:'happy'}),140,58,.62)}${bvFig(jordanFig('waltz',{suit:false}),154,58,.62)}</g>
    ${[50,100,150,200,250].map(x=>`<path class="beav-spring" d="M${x} 74 l-6 4 l12 4 l-12 4 l12 4 l-12 4 l6 4" stroke="#7d879e" stroke-width="2" fill="none" stroke-linejoin="round"/>`).join('')}
    <rect x="20" y="98" width="260" height="8" rx="2" fill="#a88a6a"/>${beaVT(150,24,'Rebuilt in 4 days',{s:11})}${beaVT(150,122,'springs make the floor bounce',{s:10,c:BEAV.soft})}
    ${robotBot(268,26,.7,BEAV.teal)}`,'A sprung dance floor on springs'),
  // ledger 2: Boston's over-100 club
  bea_centenarians:()=>igFrame(300,130,`${[['2030',250,0],['2040',1000,1]].map(([y,n,i])=>`<g><rect x="${70+i*110}" y="${110-n/11}" width="60" height="${n/11}" rx="6" fill="${i?BEAV.violet:'#b3aaf0'}" class="beav-rise" style="--d:${i*.4}s"/>${beaVT(100+i*110,124,y,{s:11})}${beaVT(100+i*110,104-n/11,n.toLocaleString('en-US'),{s:11,w:800})}</g>`).join('')}
    <g transform="translate(262 70)"><rect x="-16" y="-6" width="32" height="20" rx="4" fill="#ffd3e2" stroke="#c46a8a"/><rect x="-16" y="-6" width="32" height="6" fill="#fff6fa"/>${[-8,0,8].map(x=>`<path d="M${x} -6 v-8" stroke="${BEAV.gold}" stroke-width="2"/><path d="M${x} -16 q2 2 0 4 q-2 -2 0 -4" fill="#ff9a3c" class="ig-blink" style="--d:${(x+8)*.05}s"/>`).join('')}${beaVT(0,30,'100+',{s:10})}</g>`,'Four times as many Bostonians over 100'),
  // ledger 3: a DNA print shop flags odd orders and blocks them (no detail beyond that)
  bea_printshop:()=>igFrame(300,130,`<rect x="0" y="0" width="300" height="130" rx="10" fill="#1e2450"/>${[0,1,2,3,4,5,6,7,8].map(i=>`<circle cx="${(i*67)%300}" cy="${8+(i*29)%40}" r="1.1" fill="#fff" opacity=".6"/>`).join('')}
    <path d="M262 16 A10 10 0 1 0 270 30 A8 8 0 1 1 262 16Z" fill="#fff3c4"/>
    <g transform="translate(70 76)"><rect x="-40" y="-30" width="80" height="58" rx="8" fill="#e9ecf7"/><rect x="-32" y="-22" width="64" height="26" rx="4" fill="#2a3060"/>
     <path d="M-24 -9 C-16 -19 -8 1 0 -9 C8 -19 16 1 24 -9 M-24 -9 C-16 1 -8 -19 0 -9 C8 1 16 -19 24 -9" stroke="#7ff7e4" stroke-width="1.6" fill="none"/>${beaVT(0,20,'Print shop',{s:9.5})}</g>
    ${[0,1,2].map(i=>`<g class="beav-order" style="--d:${i*.8}s"><rect x="150" y="${38+i*24}" width="34" height="18" rx="3" fill="#fff"/><path d="M150 ${38+i*24} l17 9 l17 -9" stroke="${BEAV.soft}" fill="none"/>${beaVT(206,51+i*24,'NEW',{s:8,c:BEAV.gold})}</g>`).join('')}
    <g transform="translate(250 74)"><g class="beav-shield"><path d="M0 -24 L18 -16 C18 2 12 14 0 22 C-12 14 -18 2 -18 -16Z" fill="${BEAV.red}"/><path d="M-8 -8 L8 8 M8 -8 L-8 8" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/></g></g>
    ${beaVT(150,122,'all placed the same night · blocked',{s:10,c:'#cfd6ff'})}`,'A print shop flags and blocks odd orders'),
  // lesson: how old muscles get stronger
  bea_fibers:({s})=>{
    if(s===1)return igFrame(300,130,`${[[70,22,'Age 70'],[150,17,'Age 85'],[230,12,'Age 100']].map(([x,n,l],i)=>`<g class="ig-rise" style="--d:${i*.5}s">${bvBundle(x,56,18+n*.9,n,i+2)}${beaVT(x,112,l,{s:10.5})}</g>`).join('')}${beaVT(150,126,'unless the muscle is used',{s:9.5,c:BEAV.soft})}`,'Muscle shrinking with age');
    if(s===2)return igFrame(300,120,`${bvFiber(20,40,120,12)}<path d="M70 36 l4 6 l-4 4 l5 4" stroke="#fff" stroke-width="1.6" fill="none" class="ig-blink"/>${beaVT(80,74,'tiny strains',{s:10,c:BEAV.soft})}
     <path d="M150 40 h20" stroke="${BEAV.soft}" stroke-width="2.4"/><path d="M168 34 l7 6 l-7 6" fill="none" stroke="${BEAV.soft}" stroke-width="2.4"/>
     <g class="ig-pulse">${bvFiber(184,40,100,17)}</g>${[200,232,262].map((x,i)=>`<circle cx="${x}" cy="27" r="4" fill="#ffd45c" stroke="#b07a12" class="ig-cell" style="--d:${i*.3}s"/>`).join('')}${beaVT(234,74,'repaired, a bit thicker',{s:10,c:BEAV.green})}`,'Repair cells rebuild fibers thicker');
    if(s===3)return igFrame(300,120,`${bvFiber(20,50,260,14,{top:'#e9b8b4',mid:'#d98a8c',bot:'#a85a64'})}
     ${[60,120,180,240].map((x,i)=>`<g><circle cx="${x}" cy="50" r="5.5" fill="#c9c0d2" stroke="#7d6a8a" stroke-width="1"/><g class="beav-wake" style="--d:${i*.4}s"><circle cx="${x}" cy="50" r="5.5" fill="#ffd45c" stroke="#b07a12" stroke-width="1"/></g>${beaVT(x+9,36,'z',{s:9,c:BEAV.violet})}</g>`).join('')}
     ${bvPatch(150,96,.9,.6)}${beaVT(178,100,'renewal',{s:10,a:'start',c:BEAV.soft})}`,'Sleepy repair cells woken by renewal therapy');
    return igFrame(300,120,`<g transform="translate(46 56)"><ellipse rx="16" ry="20" fill="#fff8ec" stroke="#d9c58e" stroke-width="1.6"/><ellipse cx="2" cy="4" rx="7" ry="7" fill="#ffd45c"/></g>
     <g transform="translate(96 60)">${[0,1,2,3,4].map(i=>`<ellipse cx="${(i%3)*9-9}" cy="${Math.floor(i/3)*8-4}" rx="5" ry="3.4" fill="#b8784a" stroke="#7a4a28"/>`).join('')}</g>
     <path d="M126 56 h24" stroke="${BEAV.soft}" stroke-width="2.4" class="ig-dash"/><g class="ig-pulse">${bvFiber(160,56,70,14)}</g>
     <g transform="translate(262 50)"><path d="M3 -14 A14 14 0 1 0 14 6 A11 11 0 1 1 3 -14Z" fill="${BEAV.violet}"/>${beaVT(16,-10,'z',{s:10,c:BEAV.violet})}</g>
     ${beaVT(70,100,'protein',{s:10,c:BEAV.soft})}${beaVT(262,100,'sleep',{s:10,c:BEAV.soft})}`,'Protein and sleep feed the repair')}
};
Object.assign(VIZ,BV_VIZ);

// ---------- Future Table and reveal vignettes (viewBox 0 0 120 90) ----------
function beaHall(){const id='bh'+(++VGN);return `<defs><radialGradient id="${id}" cx=".5" cy=".1" r=".9"><stop offset="0" stop-color="#ffe6b0"/><stop offset=".6" stop-color="#e8b880"/><stop offset="1" stop-color="#9a6a54"/></radialGradient></defs>
  <rect width="120" height="90" fill="url(#${id})"/>${[14,42,78,106].map(x=>`<path d="M${x-8} 0 V36 Q${x} 26 ${x+8} 36 V0Z" fill="#fff4d8" opacity=".5"/>`).join('')}
  <path d="M0 62 H120 V90 H0Z" fill="#c98a4a"/><path d="M0 62 H120" stroke="#8a5a2a" stroke-width="1"/>${[...Array(9)].map((_,i)=>`<path d="M${60+(i-4)*8} 62 L${60+(i-4)*24} 90" stroke="#a86a34" stroke-width=".6"/>`).join('')}
  <g class="beav-chand"><path d="M60 0 V6" stroke="#8a6a3a"/><path d="M50 8 Q60 14 70 8" stroke="#d9b060" stroke-width="1.4" fill="none"/>${[50,55,60,65,70].map(x=>`<circle cx="${x}" cy="${x===60?12:10}" r="1.2" fill="#fff6c8"/>`).join('')}</g>`}
function beaVignette(kind){let art='';const W=(x,y,s,m,d)=>bvFig(beaFig('waltz',{dress:'wedding',mood:m||'happy'}),x,y,s);
  if(kind==='waltz')art=beaHall()+`<g class="beav-dance">${W(46,82,.95)}${bvFig(jordanFig('waltz'),68,82,.95)}</g>
    <g class="vnote"><path d="M20 26 v-9 l7 -2 v9" stroke="#fff" stroke-width="1.6" fill="none"/><ellipse cx="18.6" cy="26" rx="2.4" ry="1.7" fill="#fff"/><ellipse cx="25.6" cy="24" rx="2.4" ry="1.7" fill="#fff"/></g>
    <g class="vnote d2"><path d="M98 30 v-9" stroke="#fff" stroke-width="1.5"/><ellipse cx="96.6" cy="30" rx="2.4" ry="1.7" fill="#fff"/><path d="M98 21 q4 2 3 6" stroke="#fff" stroke-width="1.5" fill="none"/></g>
    <g transform="translate(88 8)"><rect width="26" height="12" rx="6" fill="#fff"/><text x="13" y="8.6" text-anchor="middle" font-size="6.4" font-weight="800" fill="#7d4fa8" font-family="Nunito">no cane!</text></g>`;
  if(kind==='cane')art=beaHall()+`${bvFig(beaFig('cane',{mood:'smile'}),48,82,.95)}${bvFig(jordanFig('stand',{mood:'happy'}),70,82,.95)}
    <path d="M58 30 Q60 26 62 30" stroke="#fff" stroke-width="1.2" fill="none"/>${ch_star(30,20,3,'#fff6c8')}`;
  if(kind==='flutter')art=`<rect width="120" height="90" fill="#eef3ff"/><path d="M0 64 H120 V90 H0Z" fill="#dfe6f6"/>
    <g transform="translate(8 10)"><rect width="50" height="26" rx="5" fill="#1e2450"/><path d="M4 14 h6 l2 -5 l2 8 l2 -7 l2 6 l2 -6" stroke="#ff7a8a" stroke-width="1.4" fill="none"/><circle cx="34" cy="13" r="6.5" fill="#16b3a6"/><rect x="31.4" y="10" width="2" height="6" fill="#fff"/><rect x="34.6" y="10" width="2" height="6" fill="#fff"/></g>
    ${bvFig(beaFig('clap',{mood:'smile'}),88,84,.95)}${bvFig(wrenFig('stand'),40,84,.9)}
    <g class="vnote"><path d="M106 22 l3 -3 m0 6 l3 -3" stroke="#f5b82e" stroke-width="1.4"/></g>`;
  if(kind==='fall')art=`<rect width="120" height="90" fill="#fdf0ea"/><path d="M0 64 H120 V90 H0Z" fill="#f2dccf"/>
    ${bvFig(beaFig('sadsit',{mood:'sad'}),70,84,.95)}${bvFig(wrenFig('spot'),36,84,.9)}
    <g transform="translate(8 8)"><rect width="34" height="20" rx="4" fill="#fff"/><text x="17" y="13" text-anchor="middle" font-size="7" font-weight="800" fill="#e5484d" font-family="Nunito">week 6</text></g>
    <g transform="translate(92 14)"><rect width="22" height="14" rx="4" fill="#cfe8ff"/><text x="11" y="10" text-anchor="middle" font-size="6.4" font-weight="800" fill="#2a5a9a" font-family="Nunito">ice</text></g>`;
  if(kind==='quit')art=`<rect width="120" height="90" fill="#f3eefc"/><path d="M0 64 H120 V90 H0Z" fill="#e2d9f2"/>
    ${bvFig(beaFig('cross',{mood:'stern'}),78,84,.95)}${bvFig(wrenFig('stand',{bar:'M-4 -48 Q0 -50 4 -48'}),34,84,.9)}
    <g transform="translate(6 6)"><rect width="56" height="22" rx="6" fill="#fff" stroke="#d9def0"/><text x="28" y="9.6" text-anchor="middle" font-size="5.6" font-weight="800" fill="#1f2340" font-family="Nunito">Dose raised</text><text x="28" y="17" text-anchor="middle" font-size="5" font-weight="700" fill="#8a90b0" font-family="Nunito">without asking</text></g>
    <path d="M100 12 l10 10 M110 12 l-10 10" stroke="#e5484d" stroke-width="2.6" stroke-linecap="round"/>`;
  if(!art)return vignette(kind);
  return `<svg viewBox="0 0 120 90" class="vig"><clipPath id="vc${++VGN}"><rect width="120" height="90" rx="10"/></clipPath><g clip-path="url(#vc${VGN})">${art}</g></svg>`}

// ---------- Bea's treasures (tiles in her parlor, viewBox 0 0 100 100) ----------
function beaTreasureArt(id){const g='bt'+(++VGN);let a='';
  if(id==='photo')a=`<defs><filter id="${g}s"><feColorMatrix type="matrix" values=".39 .77 .19 0 0  .35 .69 .17 0 0  .27 .53 .13 0 0  0 0 0 1 0"/></filter><radialGradient id="${g}v" cx=".5" cy=".45" r=".7"><stop offset=".6" stop-color="#3a2410" stop-opacity="0"/><stop offset="1" stop-color="#3a2410" stop-opacity=".5"/></radialGradient></defs>
    <rect x="12" y="8" width="76" height="86" rx="4" fill="#c9962e" stroke="#7a5418" stroke-width="2"/><rect x="17" y="13" width="66" height="76" rx="2" fill="#e8b850" stroke="#9a6a1e" stroke-width="1"/>
    <rect x="21" y="17" width="58" height="68" fill="#d8c4a0"/><g filter="url(#${g}s)"><path d="M21 62 H79 V85 H21Z" fill="#b89a70"/>${bvFig(beaFig('waltz',{dress:'wedding',mood:'happy'}),42,83,.82)}${bvFig(jordanFig('waltz'),58,83,.82)}</g>
    <rect x="21" y="17" width="58" height="68" fill="url(#${g}v)"/>${[[12,8],[88,8],[12,94],[88,94]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3.4" fill="#f5d27a" stroke="#7a5418"/>`).join('')}`;
  if(id==='record')a=`<rect x="8" y="30" width="84" height="58" rx="6" fill="#9a5a34" stroke="#5a3018" stroke-width="2"/><rect x="8" y="80" width="84" height="8" rx="3" fill="#6a3a20"/>
    <g transform="translate(44 56)"><g><animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="3s" repeatCount="indefinite"/><circle r="24" fill="#1a1418"/>${[20,16,12].map(r=>`<circle r="${r}" fill="none" stroke="#3a3238" stroke-width=".8"/>`).join('')}<circle r="7.5" fill="#ff7a6b"/><path d="M-4 -2 h8" stroke="#fff" stroke-width="1.2"/><circle r="1.3" fill="#1a1418"/><path d="M-18 -10 A20 20 0 0 1 -6 -19" stroke="#fff" stroke-width="1.6" fill="none" opacity=".35"/></g></g>
    <path d="M82 36 L80 64 L64 72" stroke="#d9dee8" stroke-width="2.6" fill="none" stroke-linecap="round"/><circle cx="82" cy="36" r="4" fill="#c9ced9" stroke="#7d879e"/><rect x="60" y="68" width="8" height="5" rx="1.5" fill="#7d879e"/>
    <g class="vnote"><path d="M20 22 v-9 l7 -2 v9" stroke="#6c5ce7" stroke-width="1.6" fill="none"/><ellipse cx="18.6" cy="22" rx="2.4" ry="1.7" fill="#6c5ce7"/><ellipse cx="25.6" cy="20" rx="2.4" ry="1.7" fill="#6c5ce7"/></g>`;
  if(id==='pin')a=`<path d="M10 70 C10 58 26 54 50 54 C74 54 90 58 90 70 C90 82 74 88 50 88 C26 88 10 82 10 70Z" fill="#2f3e6b" stroke="#1a2440" stroke-width="2"/><path d="M18 66 C26 60 40 58 50 58" stroke="#4a5c94" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M14 46 C14 30 30 18 50 18 C70 18 86 30 86 46 L80 50 C70 44 60 42 50 42 C40 42 30 44 20 50Z" fill="#fff" stroke="#9aa4be" stroke-width="1.8"/><path d="M20 50 C30 44 40 42 50 42 C60 42 70 44 80 50 L80 56 C70 50 60 48 50 48 C40 48 30 50 20 56Z" fill="#e8ecf6" stroke="#9aa4be" stroke-width="1.2"/>
    <path d="M44 28 h12 M50 22 v12" stroke="#e5484d" stroke-width="4" stroke-linecap="round"/>
    <g transform="translate(50 70)"><circle r="12" fill="#f5c84a" stroke="#9a6a16" stroke-width="1.6"/><circle r="8" fill="#ffffff" stroke="#9a6a16" stroke-width="1"/><path d="M-3 0 h6 M0 -3 v6" stroke="#2f3e6b" stroke-width="2.2" stroke-linecap="round"/>${[-1,1].map(s=>`<path d="M${s*9} 6 C${s*13} 2 ${s*13} -4 ${s*10} -8" stroke="#3a8a4a" stroke-width="1.6" fill="none"/>`).join('')}<circle cx="-4" cy="-6" r="1.6" fill="#fff" opacity=".8"/></g>`;
  if(id==='invite')a=`<g transform="rotate(-6 50 52)"><rect x="12" y="18" width="76" height="66" rx="5" fill="#fffaf0" stroke="#d9c58e" stroke-width="1.6"/><rect x="17" y="23" width="66" height="56" rx="3" fill="none" stroke="#e8c870" stroke-width="1.2"/>
    <text x="50" y="40" text-anchor="middle" font-size="9" font-family="Georgia, serif" font-style="italic" fill="#7d4fa8">Jordan</text><text x="50" y="50" text-anchor="middle" font-size="7" font-family="Georgia, serif" fill="#9a8aa8">&amp;</text><text x="50" y="60" text-anchor="middle" font-size="9" font-family="Georgia, serif" font-style="italic" fill="#7d4fa8">Ana</text>
    <text x="50" y="72" text-anchor="middle" font-size="6.4" font-weight="800" font-family="Nunito" fill="#b07a12" letter-spacing=".5">JULY 19</text></g>
    <g transform="translate(76 80)"><g class="ig-pulse"><circle r="9" fill="#c0304a" stroke="#8a1a30" stroke-width="1.2"/>${bvHeart(0,0,1.2,'#ff9aa8')}</g></g>`;
  if(id==='cane')a=`<path d="M58 94 L46 30" stroke="#4a2814" stroke-width="7" stroke-linecap="round"/><path d="M58 94 L46 30" stroke="#8a5430" stroke-width="5" stroke-linecap="round"/><path d="M57 92 L46.6 34" stroke="#c08a5a" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M46 30 C44 14 26 12 24 26" stroke="#4a2814" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M46 30 C44 14 26 12 24 26" stroke="#8a5430" stroke-width="5" fill="none" stroke-linecap="round"/>
    <rect x="52" y="92" width="10" height="5" rx="2" fill="#2a1a12"/>
    <g transform="translate(62 48) rotate(14)"><path d="M-6 -2 L-12 -6" stroke="#9a8aa8" stroke-width="1"/><rect x="0" y="-8" width="26" height="14" rx="3" fill="#fff6d8" stroke="#c9a24a" stroke-width="1.2"/><circle cx="3" cy="-1" r="1.4" fill="#c9a24a"/><text x="15" y="2.6" text-anchor="middle" font-size="7.6" font-weight="800" font-family="Nunito" fill="#7d4fa8">Fred</text></g>`;
  if(id==='wren')a=bvFig(wrenFig('stand',{bar:'M-4 -49 Q0 -47 4 -49'}),50,96,1.42);
  return `<svg viewBox="0 0 100 100" class="bea-trsvg">${a}</svg>`}

// ---------- the wedding: the real outcome on the dance floor (viewBox 0 0 300 250; the painted hall shows behind) ----------
function beaWeddingArt(kind){const g='bw'+(++VGN);
  const looks=[{skin:SKIN[1],shirt:'#5fc9bd',hair:'#e8e4e0'},{skin:SKIN[3],shirt:'#3f7fbf',hair:'#2b1d18'},{skin:SKIN[2],shirt:'#f5b82e',hair:'#6a3a20'},{skin:SKIN[0],shirt:'#e86a8a',hair:'#c9772d'},{skin:SKIN[5],shirt:'#8f86ff',hair:'#1b1410'},{skin:SKIN[4],shirt:'#ff7a6b',hair:'#efe9e2'}];
  const guests=side=>[0,1,2].map(i=>{const x=side<0?20+i*26:280-i*26;return `<g class="beav-clap" style="--d:${i*.3}s">${mini(x,152+(i%2)*8,{...looks[(side<0?0:3)+i],s:1.5,face:'happy',flip:side>0})}</g>`}).join('');
  const notes=`<g class="vnote"><path d="M70 60 v-14 l11 -3 v14" stroke="#fff" stroke-width="2.2" fill="none"/><ellipse cx="68" cy="60" rx="3.6" ry="2.6" fill="#fff"/><ellipse cx="79" cy="57" rx="3.6" ry="2.6" fill="#fff"/></g><g class="vnote d2"><path d="M232 66 v-14" stroke="#ffe8a0" stroke-width="2"/><ellipse cx="230" cy="66" rx="3.6" ry="2.6" fill="#ffe8a0"/><path d="M232 52 q6 3 4 9" stroke="#ffe8a0" stroke-width="2" fill="none"/></g>`;
  const spot=`<defs><radialGradient id="${g}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff4cc" stop-opacity=".75"/><stop offset="1" stop-color="#fff4cc" stop-opacity="0"/></radialGradient></defs><ellipse cx="150" cy="232" rx="120" ry="22" fill="url(#${g})"/>`;
  const petals=[...Array(10)].map((_,i)=>`<path class="beav-petal" style="--d:${(i*.6).toFixed(1)}s;--x:${(20+i*27)%290}px" d="M0 0 c2 -3 6 -3 6 0 c0 3 -4 4 -6 0z" fill="${['#ffd0e0','#fff','#e6dafa'][i%3]}"/>`).join('');
  let main='';
  if(kind==='waltz')main=`<g class="beav-dance">${bvFig(beaFig('waltz',{dress:'wedding',mood:'happy'}),132,236,2.75)}${bvFig(jordanFig('waltz',{mood:'happy'}),172,236,2.75)}</g>${notes}`;
  else if(kind==='cane')main=`${bvFig(jordanFig('stand',{mood:'happy'}),118,236,2.75)}${bvFig(beaFig('cane',{dress:'wedding',mood:'happy'}),164,236,2.75)}${notes}`;
  else main=`${bvFig(beaFig(kind==='flutter'?'clap':'sit',{dress:'wedding',mood:kind==='fall'?'smile':'happy'}),132,236,2.6)}${bvFig(jordanFig('stand',{mood:'smile'}),186,236,2.6)}`;
  return `<svg viewBox="0 0 300 250" class="bea-wsvg">${spot}${guests(-1)}${guests(1)}${main}${kind==='waltz'||kind==='cane'?petals:''}</svg>`}
