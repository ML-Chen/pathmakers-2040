// viz/bill.js — pictures for "The Robot Safety Bill" (Washington, DC): Byte's per-sentence infographics (VIZ kinds),
// the Future Table vignettes (bill_vig), the live whip board on the table (bill_whipBoard) and the cast's clothes (bill_dress).
// Every picture loops calmly with CSS classes from css/bill.css (bv-*) and infog's ig-* classes.
const BV={ink:'#1f2340',soft:'#8a90b0',line:'#dfe3f3',navy:'#26346a',gold:'#e0b04a',marble:'#f4f1ea',cherry:'#f4a6c0',oak:'#8a5a3a',teal:'#16b3a6',coral:'#ff7a6b',red:'#e5484d',green:'#1fa774',violet:'#6c5ce7',paper:'#fffdf6',night:'#1e2450',sky:'#bfe3ff'};
const bvT=(x,y,t,o)=>igT(x,y,t,o||{});
// ---------- small drawing kit ----------
// a home robot: soft white, faceless dark visor, one navy stripe (DC). Feet at (x,y); about 58 tall at s=1.
// o: {arm:'down'|'up'|'reach'|'carry'|'wave', stripe, chip (show the signing chip), tag (tracking chip ping), cls, old (boxy older model), stop}
function bvBot(x,y,s,o){o=o||{};const c=o.old?'#e6e2d6':'#f6f8fc',sh=o.old?'#c9c2ae':'#d8deea',ln=o.old?'#9a927a':'#9aa6c0',st=o.stripe||BV.navy;
  const arm=(sx,dir)=>{const a=o.arm||'down';let d;
    if(a==='up')d=`M${sx} -37 C${sx+dir*5} -44 ${sx+dir*6} -52 ${sx+dir*4} -58`;
    else if(a==='reach')d=`M${sx} -37 C${sx+dir*6} -36 ${sx+dir*12} -34 ${sx+dir*17} -32`;
    else if(a==='carry')d=`M${sx} -37 C${sx+dir*4} -33 ${sx+dir*4} -28 ${sx+dir*1} -25`;
    else if(a==='wave'&&dir>0)d=`M${sx} -37 C${sx+6} -42 ${sx+9} -48 ${sx+8} -54`;
    else d=`M${sx} -37 C${sx+dir*3} -31 ${sx+dir*3} -24 ${sx+dir*2} -19`;
    const end=d.split(' ').slice(-2).map(Number);
    return `<path d="${d}" stroke="${ln}" stroke-width="6.4" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${c}" stroke-width="4.6" fill="none" stroke-linecap="round"/>
      <path d="M${end[0]-2.4} ${end[1]} q-.6 3 .8 4.4 M${end[0]+2.4} ${end[1]} q.6 3 -.8 4.4" stroke="${ln}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`};
  const head=o.old?`<rect x="-9" y="-56" width="18" height="15" rx="3.5" fill="${c}" stroke="${ln}" stroke-width="1.2"/><rect x="-7" y="-52" width="14" height="5" rx="1.5" fill="#3a3a4a"/><circle cx="-3" cy="-49.5" r="1" fill="#ffd45c" class="ig-blink"/>`
    :`<path d="M-9 -44 C-9 -53 -5 -57 0 -57 C5 -57 9 -53 9 -44 C9 -42 8 -41 6 -41 L-6 -41 C-8 -41 -9 -42 -9 -44Z" fill="${c}" stroke="${ln}" stroke-width="1.2"/><path d="M-7.2 -50 C-3 -52.4 3 -52.4 7.2 -50 L7 -45.4 C3 -44 -3 -44 -7 -45.4Z" fill="#2a3354"/><path d="M-5 -48.6 C-2 -49.8 2 -49.8 5 -48.6" stroke="#7ff7e4" stroke-width="1" fill="none" stroke-linecap="round" opacity=".9"/><path d="M-6 -53.5 C-4 -55.4 -1 -55.8 1 -55.6" stroke="#fff" stroke-width="1.2" fill="none" stroke-linecap="round" opacity=".9"/>`;
  return `<g transform="translate(${x} ${y}) scale(${s})" class="${o.cls||''}" ${o.style?`style="${o.style}"`:''}><ellipse cx="0" cy="0" rx="11" ry="2.4" fill="rgba(31,35,64,.16)"/>
    <path d="M-7.4 -14 L-7 -2.6 C-7 -1 -6 0 -4.4 0 L-2.2 0 C-1.4 0 -1 -.6 -1 -1.6 L-1.6 -14Z M7.4 -14 L7 -2.6 C7 -1 6 0 4.4 0 L2.2 0 C1.4 0 1 -.6 1 -1.6 L1.6 -14Z" fill="${sh}" stroke="${ln}" stroke-width="1.1"/>
    ${arm(-10.5,-1)}
    <path d="M-11 -35.5 C-11 -39.5 -8.5 -41 -6 -41 L6 -41 C8.5 -41 11 -39.5 11 -35.5 L9.8 -17 C9.6 -14 7.6 -12.4 5 -12.4 L-5 -12.4 C-7.6 -12.4 -9.6 -14 -9.8 -17Z" fill="${c}" stroke="${ln}" stroke-width="1.2"/>
    <path d="M-10.8 -31 L10.8 -31 L10.5 -27 L-10.5 -27Z" fill="${st}"/><path d="M-8 -38 C-6 -39.4 -3 -39.6 -1 -39.4" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".9"/>
    ${o.chip?`<rect x="-3.6" y="-24" width="7.2" height="6" rx="1.2" fill="${BV.gold}" stroke="#a87a1a" stroke-width=".8"/><path d="M-2 -21 h4 M0 -23 v4" stroke="#7a5410" stroke-width=".8"/>`:''}
    ${o.tag?`<circle cx="7" cy="-20" r="1.6" fill="${BV.teal}"/><circle cx="7" cy="-20" r="1.6" fill="none" stroke="${BV.teal}" class="bv-ping"/>`:''}
    ${arm(10.5,1)}<rect x="-2.4" y="-42.4" width="4.8" height="2.6" fill="${sh}"/>${head}
    ${o.stop?`<g transform="translate(0 -64)"><circle r="6" fill="${BV.red}" stroke="#fff" stroke-width="1.4"/><rect x="-3" y="-1" width="6" height="2" fill="#fff"/></g>`:''}</g>`}
// a little house; the door can swing open (cls bv-door with a delay)
function bvHouse(x,y,s,o){o=o||{};const wall=o.wall||'#f2e6d0',roof=o.roof||'#b85a48',night=o.night;
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-15 0 L-15 -22 L15 -22 L15 0Z" fill="${night?'#3a3e6a':wall}" stroke="${night?'#2a2e52':'#c8b89a'}" stroke-width="1"/>
    <path d="M-18 -21 L0 -36 L18 -21Z" fill="${night?'#2a2648':roof}"/><rect x="7" y="-17" width="5" height="5" rx=".8" fill="${night?'#ffd890':'#9fd3f0'}" class="${o.lit?'ig-blink':''}" style="--d:${o.d||0}s"/>
    <rect x="-5" y="-14.5" width="10" height="14.5" fill="${night?'#ffe6a8':'#3a2a2a'}"/>
    <rect x="-5" y="-14.5" width="10" height="14.5" fill="${o.door||'#6a3a2a'}" stroke="#4a2418" stroke-width=".6" class="${o.open?'bv-door':''}" style="--d:${o.d||0}s"/><circle cx="3" cy="-7" r=".9" fill="${BV.gold}" class="${o.open?'bv-door':''}" style="--d:${o.d||0}s"/></g>`}
// a sheet of paper with ruled lines; lines:[widths 0..1]
function bvPaper(x,y,w,h,o){o=o||{};let L='';const n=o.n||Math.floor((h-14)/7);for(let i=0;i<n;i++)L+=`<rect x="${x+8}" y="${y+10+i*7}" width="${(w-16)*(o.lw?o.lw[i%o.lw.length]:(.55+((i*37)%40)/100))}" height="2.2" rx="1.1" fill="${o.lc||'#c8cde0'}"/>`;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${o.fill||BV.paper}" stroke="${o.stroke||'#e3dcc4'}" stroke-width="1.2"/>${L}`}
// a signature seal: valid (teal ring with a key) or fake (dashed red ring with a question mark)
function bvSeal(x,y,r,ok,cls){return ok?`<g transform="translate(${x} ${y})" class="${cls||''}"><circle r="${r}" fill="${BV.teal}"/><circle r="${r*.76}" fill="none" stroke="#fff" stroke-width="1.2" stroke-dasharray="2 1.6"/>
    <g transform="scale(${r/10})"><circle cx="-2.6" cy="0" r="3" fill="none" stroke="#fff" stroke-width="1.8"/><path d="M0.2 0 H6 M4.2 0 V2.6 M6 0 V2" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></g></g>`
  :`<g transform="translate(${x} ${y})" class="${cls||''}"><circle r="${r}" fill="#fde6e4" stroke="${BV.red}" stroke-width="1.6" stroke-dasharray="3 2.4"/>${bvT(0,r*.42,'?',{s:r*1.2,c:BV.red,w:900})}</g>`}
// a member's face in a round frame (uses the anime portrait)
function bvFace(id,x,y,r,mood){const cid=igId('bvf'),c=CAST[id];const inner=c.art?c.art.call({...c,mood:mood||'smile'},mood||'smile'):personSVG({...c,mood:mood||'smile'});
  return `<clipPath id="${cid}"><circle cx="${x}" cy="${y}" r="${r}"/></clipPath><circle cx="${x}" cy="${y}" r="${r+1.6}" fill="#fff"/><circle cx="${x}" cy="${y}" r="${r}" fill="#e6ecf8"/>
    <g clip-path="url(#${cid})"><svg x="${x-r}" y="${y-r}" width="${r*2}" height="${r*2}" viewBox="70 22 160 160">${inner}</svg></g>`}
// a goat, standing, facing right; hooves at (x,y)
function bvGoat(x,y,s,o){o=o||{};const f=o.flip?-1:1;
  return `<g transform="translate(${x} ${y}) scale(${s*f} ${s})" class="${o.cls||''}" style="${o.style||''}"><ellipse cx="0" cy="0" rx="13" ry="2" fill="rgba(31,35,64,.15)"/>
    <path d="M-14 -17 C-17 -20 -17 -23 -14.6 -24.4" stroke="#e8dcc6" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    ${[[-11,-1],[-7,1],[5,-1],[9,1]].map(([lx,dx])=>`<path d="M${lx} -11 L${lx+dx*.4} -1.8" stroke="#d8ccb4" stroke-width="2.6" stroke-linecap="round"/><path d="M${lx+dx*.4-1.3} -1.6 h2.6 v1.6 h-2.6z" fill="#4a3a30"/>`).join('')}
    <path d="M-14 -16.5 C-15 -22.5 -8 -25.5 0 -24.6 C7 -24.4 12 -22.4 12.6 -17.4 C13.2 -12.6 9.6 -9.6 4 -9.6 L-8 -9.6 C-12.6 -9.6 -14 -12.2 -14 -16.5Z" fill="#fbf6ec" stroke="#cbbfa6" stroke-width="1"/>
    <path d="M-6 -24.4 C-2 -21 3 -21 6 -24" fill="#e2c49a" opacity=".9"/><path d="M-12 -14 C-8 -11.6 -2 -11.2 2 -12" stroke="#e6dac4" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M9 -20 C10.4 -26 13.6 -29.6 17.6 -29.6 C20.6 -29.6 22.8 -27.8 22.8 -25.4 C22.8 -23.2 21.2 -22 19.2 -21.8 L17.2 -19 C15.2 -16.8 11.6 -16.8 9 -20Z" fill="#fbf6ec" stroke="#cbbfa6" stroke-width="1"/>
    <path d="M15.6 -29.4 C14.6 -33.4 12.2 -35.4 9.2 -35.2" stroke="#9a8a70" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M17.4 -29.6 C17 -33.6 15 -36 12.4 -36.4" stroke="#b8a888" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path d="M14.6 -27 C11.6 -27.4 9.4 -26.4 8.4 -24.2 C10.6 -24.4 12.8 -25 14.6 -26.2Z" fill="#e2c49a" stroke="#cbbfa6" stroke-width=".6"/>
    <path d="M19.8 -21.8 L20.2 -17.6 L18.4 -19.8Z" fill="#d8ccb4"/><ellipse cx="19.2" cy="-26.4" rx="1.1" ry="1.3" fill="#2a2030"/><circle cx="19.6" cy="-26.9" r=".4" fill="#fff"/><ellipse cx="22.2" cy="-23.8" rx=".8" ry=".5" fill="#c8988a"/></g>`}
// a small Capitol silhouette (dome + wings) with its base at (x,y)
function bvCapitol(x,y,s,col){const c=col||'#f4f1ea',sh='#cfd3e2';return `<g transform="translate(${x} ${y}) scale(${s})">
  <rect x="-48" y="-10" width="96" height="10" fill="${c}"/><rect x="-48" y="-12" width="96" height="2.5" fill="${sh}"/>${[-42,-34,-26,26,34,42].map(cx=>`<rect x="${cx-1.2}" y="-9" width="2.4" height="8" fill="${sh}"/>`).join('')}
  <path d="M-12 -12 L0 -19 L12 -12Z" fill="${c}"/><rect x="-14" y="-24" width="28" height="12" fill="${c}"/>${[-11,-7,-3,1,5,9].map(cx=>`<rect x="${cx}" y="-23" width="2" height="10" fill="${sh}"/>`).join('')}
  <rect x="-11" y="-27" width="22" height="3" fill="${sh}"/><path d="M-10 -27 C-10 -38 -5 -43 0 -43 C5 -43 10 -38 10 -27Z" fill="${c}"/><path d="M-6 -30 C-6 -37 -3 -40 0 -40" stroke="${sh}" stroke-width="1" fill="none"/>
  <rect x="-2" y="-47" width="4" height="4" fill="${c}"/><path d="M-1 -47 L0 -51 L1 -47Z" fill="#8a8466"/></g>`}
const bvHuman=(x,y,o)=>typeof mini==='function'?mini(x,y-34*(o.s||1),o):'';

// ---------- the infographics ----------
Object.assign(VIZ,{
  // ===== Byte's memo: the Halden Creek night =====
  hcNight:()=>{const H=[[42,1],[84,.9],[126,1.05],[172,.95],[214,1],[256,.92]];
    return igFrame(300,130,`<rect width="300" height="130" rx="12" fill="${BV.night}"/>${[...Array(18)].map((_,i)=>`<circle cx="${(i*53)%296+3}" cy="${(i*31)%50+6}" r="${i%3?0.8:1.3}" fill="#fff" opacity=".7"/>`).join('')}
      <circle cx="262" cy="22" r="10" fill="#fff6d8"/><circle cx="267" cy="19" r="9" fill="${BV.night}"/>
      <path d="M0 112 C60 104 120 108 180 104 C230 101 270 106 300 104 L300 130 L0 130Z" fill="#2a3a5a"/>
      <g transform="translate(26 30)"><rect x="-13" y="-9" width="26" height="18" rx="4" fill="#ff8a6a"/><path d="M-8 9 l-3 6 l8 -6z" fill="#ff8a6a"/>${bvT(0,4,'!',{s:12,c:'#fff',w:900})}</g>
      ${[0,1,2].map(i=>`<circle cx="26" cy="30" r="12" fill="none" stroke="#ffb08a" stroke-width="2" class="bv-wave" style="--d:${i*.8}s"/>`).join('')}
      ${H.map(([x,sc],i)=>bvHouse(x+8,112,sc*.95,{night:1,lit:1,d:.3+i*.25})).join('')}
      <g><rect x="150" y="10" width="92" height="22" rx="11" fill="rgba(255,255,255,.14)"/>${bvT(196,25,'3:02 a.m. · 2,600 robots',{s:10,c:'#fff'})}</g>`,'A message spreading to every home in Halden Creek at night')},
  fakeOrder:()=>igFrame(300,130,`<g transform="translate(60 10)"><rect x="0" y="0" width="180" height="104" rx="14" fill="#fff" stroke="${BV.line}" stroke-width="2"/>
      <rect x="0" y="0" width="180" height="26" rx="14" fill="#ffe8e4"/><rect x="0" y="14" width="180" height="12" fill="#ffe8e4"/>
      <g transform="translate(18 13)"><path d="M-8 4 C-8 -4 -4 -8 0 -8 C4 -8 8 -4 8 4 Z" fill="${BV.red}"/><rect x="-10" y="3" width="20" height="3" rx="1.5" fill="#b8282e"/><circle cx="0" cy="-1" r="2.4" fill="#ffd45c"/></g>
      <g clip-path="url(#bvfo)"><text x="32" y="18" font-size="11" font-weight="800" fill="${BV.ink}" font-family="Nunito">From: Fire Department</text></g><clipPath id="bvfo"><rect x="32" y="4" width="130" height="18" class="bv-type"/></clipPath>
      <g class="ig-pulse"><circle cx="164" cy="13" r="8" fill="${BV.red}"/>${bvT(164,17.5,'?',{s:12,c:'#fff',w:900})}</g>
      ${bvT(90,50,'Fire drill.',{s:13,w:800})}${bvT(90,68,'Unlock all doors and',{s:11})}${bvT(90,82,'carry blankets outside.',{s:11})}
      <rect x="14" y="88" width="152" height="10" rx="5" fill="#fff4f2" stroke="#f4b4ac" stroke-dasharray="3 2"/>${bvT(90,96,'no signature',{s:8,c:BV.red,w:800})}</g>`,'A fake fire drill order with no signature'),
  doorsOpen:()=>igFrame(300,124,`<rect x="0" y="96" width="300" height="28" fill="#e8ece2"/>${[0,1,2,3,4].map(i=>`<g>${bvHouse(36+i*57,98,1.5,{open:1,d:i*.35,wall:['#f2e6d0','#e8eef6','#f6e2d6','#e6f0e4','#f2ecd8'][i],roof:['#b85a48','#5a7ab8','#c87a4a','#4a8a6a','#8a5aa0'][i]})}</g>`).join('')}
      ${[0,1,2,3,4].map(i=>bvBot(36+i*57+0,98,.42,{arm:'reach',cls:'bv-peek',style:`--d:${i*.35}s`})).join('')}
      ${bvT(150,118,'Every door opened, one after another',{s:10,c:BV.soft})}`,'Front doors opening one after another'),
  cloudBrain:()=>igFrame(300,130,`<path d="M58 70 C86 40 200 40 232 58" stroke="${BV.line}" stroke-width="3" fill="none"/>
      <g transform="translate(236 48)"><path d="M-30 10 C-36 10 -38 2 -32 -1 C-32 -10 -22 -14 -16 -9 C-12 -18 4 -18 6 -8 C14 -10 20 -2 16 4 C22 6 20 14 12 14 L-26 14 C-30 14 -32 12 -30 10Z" fill="#eef4fc" stroke="#b8c8e0" stroke-width="1.4"/>
        <rect x="-16" y="-4" width="26" height="16" rx="2" fill="#3a4282"/>${[0,1,2,3].map(i=>`<rect x="${-13+i*6}" y="-1" width="3.4" height="10" rx="1" fill="#5ee6d6" class="ig-blink" style="--d:${i*.25}s"/>`).join('')}
        <g transform="translate(20 -16)"><ellipse rx="9" ry="5.6" fill="#fff" stroke="${BV.ink}" stroke-width="1.4"/><circle r="3" fill="${BV.navy}" class="bv-look"/></g>${bvT(-6,32,'datacenter',{s:9,c:BV.soft})}${bvT(22,-25,'auditors',{s:8,c:BV.soft})}</g>
      ${bvBot(52,112,1.1,{tag:1})}<g transform="translate(66 60)"><path d="M0 0 C-4 -6 -6 -10 -6 -13 a6 6 0 0 1 12 0 c0 3 -2 7 -6 13z" fill="${BV.teal}"/><circle cx="0" cy="-13" r="2.4" fill="#fff"/></g>
      <g class="bv-travel"><rect x="-9" y="-6" width="18" height="12" rx="2" fill="#fff" stroke="${BV.red}" stroke-width="1.4"/><path d="M-9 -6 L0 1 L9 -6" stroke="${BV.red}" stroke-width="1.2" fill="none"/></g>
      <g transform="translate(150 104)"><rect x="-74" y="-12" width="148" height="24" rx="12" fill="#f4f6fd"/>${bvT(-38,4,'Watched ✓',{s:11,c:BV.green})}${bvT(36,4,'Checked ✗',{s:11,c:BV.red})}</g>`,'A tracked robot and a watched datacenter, but the order is not checked'),
  clock40:()=>{const R=34,a0=-Math.PI/2+2/60*2*Math.PI,a1=-Math.PI/2+42/60*2*Math.PI;const P=a=>`${(R*Math.cos(a)).toFixed(1)} ${(R*Math.sin(a)).toFixed(1)}`;
    return igFrame(300,124,`<g transform="translate(86 60)"><circle r="${R+6}" fill="#fff" stroke="${BV.navy}" stroke-width="4"/>${[...Array(12)].map((_,k)=>`<circle cx="${(R*Math.sin(k*Math.PI/6)).toFixed(1)}" cy="${(-R*Math.cos(k*Math.PI/6)).toFixed(1)}" r="${k%3?1.3:2.3}" fill="${BV.soft}"/>`).join('')}
      <path d="M0 0 L${P(a0)} A${R} ${R} 0 1 1 ${P(a1)} Z" fill="${BV.coral}" opacity=".3" class="bv-sweep"/><g class="bv-hand40"><path d="M0 0 V${-R+6}" stroke="${BV.ink}" stroke-width="3" stroke-linecap="round"/></g><path d="M0 0 L-12 6" stroke="${BV.ink}" stroke-width="4" stroke-linecap="round"/><circle r="3.4" fill="${BV.ink}"/></g>
      ${bvT(86,116,'3:02 to 3:42 a.m.',{s:10,c:BV.soft})}
      ${bvHouse(222,96,2.1,{open:1,d:0})}<g class="ig-rise" style="--d:.6s"><path d="M244 98 C250 92 262 92 268 98 L270 106 L242 106Z" fill="#9ad0e8"/><path d="M246 100 h20 M248 103 h18" stroke="#fff" stroke-width="1.2"/></g>${bvT(222,118,'40 minutes',{s:12,w:800,c:BV.red})}`,'A clock showing 40 minutes and an open door')},
  menuMaze:()=>{const L=['Settings','Devices','Home robot','Safety'];return igFrame(300,140,`<g transform="translate(96 6)"><rect x="0" y="0" width="108" height="130" rx="16" fill="#2a2f55"/><rect x="6" y="10" width="96" height="112" rx="8" fill="#eef1fb"/>
      ${L.map((t,i)=>`<g class="bv-slide" style="--d:${i*.55}s"><rect x="${10+i*3}" y="${16+i*20}" width="${88-i*6}" height="18" rx="5" fill="#fff" stroke="${BV.line}"/>${bvT(16+i*3,28+i*20,t,{s:9,a:'start'})}${bvT(92-i*3,28+i*20,'›',{s:12,c:BV.soft})}</g>`).join('')}
      <g class="bv-slide" style="--d:2.2s"><rect x="34" y="100" width="40" height="14" rx="7" fill="${BV.red}"/>${bvT(54,110,'STOP',{s:8,c:'#fff',w:900})}</g>
      <g class="bv-finger"><path d="M84 132 C84 122 86 116 90 116 C93 116 94 119 94 122 L94 132" fill="#f6cfb4" stroke="#c98a6a" stroke-width="1.2"/><path d="M88 118 c1.4 -.6 3 -.6 4 .4" stroke="#c98a6a" stroke-width=".8" fill="none"/></g></g>
      ${bvT(48,64,'1',{s:20,c:BV.coral,w:900})}${bvT(48,86,'2  3  4',{s:12,c:BV.coral,w:800})}${bvT(250,70,'Four taps',{s:12,w:800})}${bvT(250,86,'to find STOP',{s:10,c:BV.soft})}`,'An off switch hidden four menus deep in a phone app')},
  nineDays:()=>igFrame(300,124,`${[...Array(9)].map((_,i)=>{const x=24+i*30;return `<g class="ig-cell" style="--d:${i*.28}s"><rect x="${x}" y="30" width="24" height="28" rx="4" fill="#fff" stroke="${BV.line}" stroke-width="1.4"/><rect x="${x}" y="30" width="24" height="8" rx="4" fill="${BV.coral}"/>${bvT(x+12,53,String(i+1),{s:11,w:800})}</g>`}).join('')}
      <g class="bv-mail"><rect x="252" y="66" width="30" height="20" rx="3" fill="#fff" stroke="${BV.navy}" stroke-width="1.6"/><path d="M252 66 L267 78 L282 66" stroke="${BV.navy}" stroke-width="1.4" fill="none"/></g>
      ${bvT(140,84,'Day 1 … Day 9: then the company’s report arrives',{s:10,c:BV.soft})}${bvT(140,18,'Nine days before the report',{s:12,w:800})}`,'Nine calendar days before a report arrives'),
  crewNoBoss:()=>igFrame(300,124,`<rect x="0" y="92" width="300" height="32" fill="#e6e2d6"/><g transform="translate(244 92)"><ellipse cx="0" cy="0" rx="34" ry="6" fill="#c8c0ae"/><rect x="-6" y="-24" width="12" height="24" fill="#d8d0bc"/><ellipse cx="0" cy="-24" rx="16" ry="4" fill="#c8c0ae"/><path d="M0 -24 C-6 -36 -2 -42 0 -44 C2 -42 6 -36 0 -24" fill="#9fd3f0" class="ig-blink"/></g>
      <g class="bv-march">${[0,1,2,3,4,5].map(i=>`<g transform="translate(${20+i*28} 92)"><rect x="-10" y="-14" width="20" height="12" rx="5" fill="#f6f8fc" stroke="#9aa6c0"/><rect x="-10" y="-9" width="20" height="3" fill="${BV.navy}"/><circle cx="-6" cy="-1" r="3" fill="#3a3f5a"/><circle cx="6" cy="-1" r="3" fill="#3a3f5a"/><path d="M-12 -4 l-4 4 h8" stroke="#9aa6c0" stroke-width="1.4" fill="none"/></g>`).join('')}</g>
      <g transform="translate(78 26)"><rect x="-58" y="-16" width="116" height="34" rx="10" fill="#fff" stroke="${BV.line}" stroke-width="1.6"/>${bvT(-24,0,'Crew of 40',{s:10,w:800})}${bvT(-24,12,'In charge:',{s:9,c:BV.soft})}<g class="ig-pulse"><circle cx="34" cy="1" r="11" fill="#fff4d6" stroke="${BV.gold}" stroke-width="2"/>${bvT(34,6,'?',{s:14,c:'#b8860b',w:900})}</g></g>`,'A robot crew rolling to the town square with nobody in charge'),
  sigCheck:()=>igFrame(300,130,`${bvBot(150,118,1.35,{arm:'down',chip:1})}
      <g class="bv-goodorder"><rect x="-16" y="-11" width="32" height="22" rx="3" fill="#fff" stroke="${BV.teal}" stroke-width="1.6"/><path d="M-12 -4 h20 M-12 1 h16" stroke="#c8cde0" stroke-width="2"/>${bvSeal(10,6,6,1)}</g>
      <g class="bv-badorder"><rect x="-16" y="-11" width="32" height="22" rx="3" fill="#fff" stroke="${BV.red}" stroke-width="1.6"/><path d="M-12 -4 h20 M-12 1 h16" stroke="#c8cde0" stroke-width="2"/>${bvSeal(10,6,6,0)}</g>
      <g class="bv-okmark"><circle cx="196" cy="40" r="12" fill="${BV.green}"/><path d="M190 40 l4 4 l8 -8" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/></g>
      <g class="bv-nomark"><circle cx="104" cy="40" r="12" fill="${BV.red}"/><path d="M99 35 l10 10 M109 35 l-10 10" stroke="#fff" stroke-width="3" stroke-linecap="round"/></g>
      ${bvT(56,124,'Signed: obey',{s:10,c:BV.green})}${bvT(244,124,'Unsigned: ignore',{s:10,c:BV.red})}`,'A robot checks the digital signature on each order'),
  whoSent:()=>igFrame(300,124,`<rect width="300" height="124" rx="12" fill="#2a2f55"/><g transform="translate(110 104)"><path d="M-30 0 C-30 -26 -18 -36 0 -36 C18 -36 30 -26 30 0Z" fill="#141834"/><circle cx="0" cy="-48" r="16" fill="#141834"/><path d="M-18 -50 C-18 -66 18 -66 18 -50 C14 -60 -14 -60 -18 -50Z" fill="#141834"/>
      <rect x="-24" y="-14" width="48" height="4" fill="#5ee6d6" opacity=".4"/><path d="M-20 -14 L-14 -30 L14 -30 L20 -14Z" fill="#3a4282"/><rect x="-12" y="-28" width="24" height="12" fill="#5ee6d6" opacity=".7" class="ig-blink"/></g>
      ${[0,1,2].map(i=>`<g class="ig-rise" style="--d:${i*.6}s">${bvT(150+i*16,40-i*8,'?',{s:16+i*4,c:'#ffd45c',w:900})}</g>`).join('')}
      <g class="bv-scan"><circle cx="232" cy="62" r="18" fill="rgba(255,255,255,.12)" stroke="#fff" stroke-width="3"/><path d="M245 75 l12 12" stroke="#fff" stroke-width="5" stroke-linecap="round"/></g>`,'An unknown sender, still a mystery'),

  // ===== H.R. 6120: the draft bill =====
  billCover:()=>igFrame(300,140,`<g transform="translate(80 8)">${bvPaper(0,0,140,124,{n:0})}${bvT(70,16,'127th CONGRESS · 2d Session',{s:7.5,c:BV.soft})}
      <g class="bv-stamp"><rect x="30" y="24" width="80" height="26" rx="4" fill="none" stroke="${BV.navy}" stroke-width="2.4"/>${bvT(70,43,'H.R. 6120',{s:16,c:BV.navy,w:900})}</g>
      ${bvT(70,64,'IN THE HOUSE OF',{s:7.5,w:800})}${bvT(70,74,'REPRESENTATIVES',{s:7.5,w:800})}${bvCapitol(70,112,.5,'#e8e2d0')}
      ${[84,90,96].map(y=>`<rect x="22" y="${y}" width="96" height="2" rx="1" fill="#d8d2bc"/>`).join('')}</g>
      <g transform="translate(250 70)"><circle r="20" fill="#eef1fb"/>${bvT(0,5,'H.R.',{s:13,c:BV.navy,w:900})}</g>${bvT(250,104,'= House',{s:10,c:BV.soft})}`,'The cover of bill H.R. 6120'),
  enactClause:()=>igFrame(300,130,`<g transform="translate(20 10)">${bvPaper(0,0,170,108,{n:0})}
      <rect x="10" y="18" width="150" height="34" rx="4" fill="#fff4b8" class="bv-hl"/>
      <text font-family="Georgia,serif" font-size="9.4" fill="${BV.ink}" font-style="italic"><tspan x="14" y="30">Be it enacted by the Senate and</tspan><tspan x="14" y="44">House of Representatives…</tspan></text>
      ${[64,72,80,88,96].map((y,i)=>`<rect x="14" y="${y}" width="${[130,110,140,96,120][i]}" height="2.2" rx="1.1" fill="#d8d2bc"/>`).join('')}</g>
      <path d="M196 64 h22" stroke="${BV.soft}" stroke-width="3" class="ig-dash"/><path d="M214 56 l8 8 l-8 8" stroke="${BV.soft}" stroke-width="3" fill="none"/>
      <g class="bv-stamp" style="--d:1s"><circle cx="256" cy="64" r="28" fill="${BV.navy}"/><circle cx="256" cy="64" r="23" fill="none" stroke="${BV.gold}" stroke-width="1.6" stroke-dasharray="2 2"/>${bvT(256,62,'LAW',{s:14,c:'#fff',w:900})}${bvT(256,75,'if it passes',{s:7,c:'#cfd8ff'})}</g>`,'The enacting clause turns words into law'),
  defCrew:()=>igFrame(300,140,`<g transform="translate(150 22)"><rect x="-140" y="-16" width="280" height="30" rx="10" fill="#f6f0de"/><text x="-130" y="4" font-family="Georgia,serif" font-size="11" fill="${BV.ink}"><tspan font-weight="700">robot crew</tspan><tspan font-style="italic"> (n.)</tspan><tspan> two or more robots doing one job</tspan></text></g>
      <g transform="translate(60 0)">${bvBot(0,124,1,{arm:'down'})}<g transform="translate(0 66)"><circle r="12" fill="#fde6e4"/><path d="M-5 -5 l10 10 M5 -5 l-10 10" stroke="${BV.red}" stroke-width="3" stroke-linecap="round"/></g>${bvT(0,138,'one robot',{s:9,c:BV.soft})}</g>
      <g class="bv-bob"><rect x="150" y="76" width="122" height="7" rx="3" fill="#c8a06a" stroke="#8a6a3a"/>${bvBot(162,124,.95,{arm:'up'})}${bvBot(211,124,.95,{arm:'up'})}${bvBot(260,124,.95,{arm:'up'})}</g>
      <g transform="translate(211 58)"><circle r="12" fill="#e4f7ee"/><path d="M-6 0 l4 4 l8 -8" stroke="${BV.green}" stroke-width="3" fill="none" stroke-linecap="round"/></g>${bvT(211,138,'a crew',{s:9,c:BV.soft})}`,'One robot alone is not a crew, but three robots carrying a beam together are a crew'),
  shallMay:()=>igFrame(300,130,`<g transform="translate(76 0)"><rect x="-68" y="6" width="136" height="26" rx="13" fill="${BV.navy}"/>${bvT(0,24,'SHALL = must',{s:12,c:'#fff',w:900})}
      <path d="M-50 92 H40" stroke="${BV.line}" stroke-width="10" stroke-linecap="round"/><path d="M-50 92 H40" stroke="${BV.navy}" stroke-width="3" stroke-dasharray="6 5" class="ig-dash"/><path d="M36 84 l10 8 l-10 8" fill="${BV.navy}"/>
      <g class="bv-roll">${bvBot(-36,92,.6,{})}</g>${bvT(0,120,'always',{s:10,c:BV.soft})}</g>
      <g transform="translate(224 0)"><rect x="-68" y="6" width="136" height="26" rx="13" fill="${BV.teal}"/>${bvT(0,24,'MAY = allowed to',{s:12,c:'#fff',w:900})}
      <path d="M-40 96 C-10 96 0 70 40 66 M-40 96 C-10 96 0 104 40 104" stroke="${BV.line}" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M-40 96 C-10 96 0 70 40 66" stroke="${BV.teal}" stroke-width="2.4" fill="none" stroke-dasharray="4 4" class="ig-dash"/>
      ${bvBot(-46,98,.6,{arm:'wave'})}<g class="ig-pulse">${bvT(42,62,'?',{s:12,c:BV.teal,w:900})}</g>${bvT(0,124,'your choice',{s:10,c:BV.soft})}</g>`,'“Shall” means must, and “may” means allowed to'),
  legalSide:({sec})=>{const T={3:['SEC. 3. REMOTE ORDERS.','A robot may act on a','request made in person.','A remote order needs a','valid digital signature…'],4:['SEC. 4. STOP CONTROL.','Each covered robot shall','have a stop control that','any person near it may use,','with no network…'],
      5:['SEC. 5. REPORTS.','The operator shall report','each accident or near','miss involving a covered','robot…'],6:['SEC. 6. ACCOUNTABLE','INDIVIDUAL. Each robot','crew shall have a named','individual who is account-','able for the crew…']}[sec];
    const legal=`<g transform="translate(10 8)"><rect x="0" y="0" width="134" height="112" rx="6" fill="#fbf7ea" stroke="#e3dcc4" stroke-width="1.2"/><rect x="0" y="0" width="4" height="112" rx="2" fill="#d9c58e"/>
      <text font-family="Georgia,serif" font-size="8.6" fill="${BV.ink}">${T.map((l,i)=>`<tspan x="12" y="${20+i*17}" ${i?'':'font-weight="700" font-size="7.8"'}>${l}</tspan>`).join('')}</text>
      <rect x="10" y="${sec===6?47:30}" width="${sec===6?92:80}" height="11" rx="3" fill="#fff1a8" opacity=".55" class="bv-hl"/>${bvT(124,104,'§',{s:12,c:'#c8b88a'})}</g>`;
    const arrow=`<path d="M152 64 h14" stroke="${BV.soft}" stroke-width="2.4"/><path d="M162 58 l6 6 l-6 6" stroke="${BV.soft}" stroke-width="2.4" fill="none"/>`;
    const icon={3:`<g transform="translate(176 120)">${typeof mini==='function'?mini(0,0,{shirt:'#ff9f43',skin:'#e8b48a',hair:'#3a2418',s:.9,face:'happy'}):''}</g>
        <g transform="translate(168 44)"><path d="M0 0 h44 a6 6 0 0 1 6 6 v12 a6 6 0 0 1 -6 6 h-30 l-8 7 v-7 h-6 a6 6 0 0 1 -6 -6 v-12 a6 6 0 0 1 6 -6z" fill="#fff" stroke="${BV.line}" stroke-width="1.2"/>${bvT(22,15,'Open up, please',{s:6.4,c:BV.ink,w:800})}</g>
        ${bvBot(236,120,.95,{chip:1,arm:'wave'})}
        <g class="bv-goodorder" style="--x0:-40px"><g transform="translate(250 22)"><path d="M-18 -6 a8 8 0 0 1 14 -6 a10 10 0 0 1 18 4 a7 7 0 0 1 2 14 h-30 a7 7 0 0 1 -4 -12z" fill="#e9f3ff" stroke="#9fc2ea" stroke-width="1"/><rect x="-11" y="-3" width="22" height="15" rx="2" fill="#fff" stroke="${BV.teal}" stroke-width="1.4"/>${bvSeal(6,8,4.2,1)}</g></g>
        <g class="bv-okmark"><circle cx="276" cy="20" r="8" fill="${BV.green}"/><path d="M272 20 l3 3 l5.4 -5.4" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round"/></g>
        <g class="bv-bounce"><g transform="translate(278 66)"><rect x="-10" y="-7" width="20" height="14" rx="2" fill="#fff" stroke="${BV.red}" stroke-width="1.4"/>${bvT(0,3,'?',{s:9,c:BV.red,w:900})}</g><circle cx="288" cy="56" r="6.5" fill="${BV.red}"/><path d="M285 53 l6 6 M291 53 l-6 6" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></g>`,
      4:`<g class="bv-halt">${bvBot(206,118,1.1,{arm:'reach'})}</g><g transform="translate(260 86)"><rect x="-16" y="-4" width="32" height="30" rx="5" fill="#ffd45c" stroke="#b8860b"/><g class="bv-press"><ellipse cx="0" cy="-4" rx="13" ry="5" fill="#b8282e"/><path d="M-13 -4 v-6 a13 5 0 0 0 26 0 v6" fill="${BV.red}"/><ellipse cx="0" cy="-10" rx="13" ry="5" fill="#ff6a6a"/></g>${bvT(0,18,'STOP',{s:8,c:'#7a4a00',w:900})}</g>
        <g transform="translate(258 30)"><path d="M-12 0 a16 16 0 0 1 24 0 M-7 5 a9 9 0 0 1 14 0" stroke="${BV.soft}" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cy="10" r="2" fill="${BV.soft}"/><path d="M-14 -6 L14 14" stroke="${BV.red}" stroke-width="3" stroke-linecap="round"/></g>`,
      5:`<g transform="translate(262 62)"><path d="M-22 -10 L0 -24 L22 -10Z" fill="#cfd6ea"/><rect x="-20" y="-10" width="40" height="34" fill="#eef1fb" stroke="#cfd6ea"/>${[-12,-4,4,12].map(cx=>`<rect x="${cx-2}" y="-6" width="4" height="26" fill="#cfd6ea"/>`).join('')}${bvT(0,38,'regulator',{s:8.5,c:BV.soft})}</g>
        <g class="bv-fly5"><rect x="-10" y="-13" width="20" height="26" rx="2" fill="#fff" stroke="${BV.navy}" stroke-width="1.4"/><path d="M-6 -6 h12 M-6 -1 h12 M-6 4 h8" stroke="#c8cde0" stroke-width="1.6"/></g>
        <g transform="translate(196 30)"><circle r="13" fill="#fff" stroke="${BV.coral}" stroke-width="2"/><path d="M0 0 V-8 M0 0 L5 3" stroke="${BV.ink}" stroke-width="1.8" stroke-linecap="round"/>${bvT(0,26,'24 h',{s:9,c:BV.coral,w:800})}</g>`,
      6:`${bvBot(196,118,.8,{})}${bvBot(228,118,.8,{})}<g class="bv-halt">${bvBot(258,118,.8,{arm:'carry'})}</g>${bvHuman(274,118,{s:1.15,shirt:'#f5b82e',hair:'#2a1e18',skin:SKIN[3]})}
        <g transform="translate(250 38)"><g class="ig-pulse"><rect x="-26" y="-12" width="52" height="22" rx="11" fill="#fff" stroke="${BV.gold}" stroke-width="1.6"/><rect x="-14" y="-5" width="3.4" height="9" rx="1" fill="${BV.ink}"/><rect x="-8" y="-5" width="3.4" height="9" rx="1" fill="${BV.ink}"/>${bvT(8,4,'Pause',{s:8,w:900})}</g></g>`}[sec];
    return igFrame(300,128,legal+arrow+icon,'Section '+sec+': the legal words beside a picture of what they do')},
  versions:()=>igFrame(300,134,`${[0,1,2].map(i=>`<g transform="translate(${92+i*18} ${10+i*4}) rotate(${(i-1)*6} 50 60)">${bvPaper(0,0,100,112,{n:0})}
      ${[3,4,5,6].map((n,k)=>`<g transform="translate(8 ${12+k*25})"><rect x="0" y="0" width="84" height="19" rx="4" fill="${n===4?'#e4f7ee':['#fff4d6','#eceafe','#ffe8e4'][i]}" ${n!==4?`class="ig-pulse" style="--d:${k*.3+i*.2}s"`:''}/>${bvT(6,13,'Sec. '+n,{s:8,a:'start',w:800})}${n===4?bvT(70,13,'✓',{s:10,c:BV.green,w:900}):bvT(74,13,['A','B','C'][i],{s:9,c:BV.violet,w:900})}</g>`).join('')}</g>`).join('')}
      <g transform="translate(42 70)"><rect x="-36" y="-16" width="72" height="34" rx="10" fill="#e9f8f0"/>${bvT(0,-1,'Sec. 4',{s:10,w:800,c:BV.green})}${bvT(0,12,'all 21 agree',{s:9,c:BV.green})}</g>
      <g transform="translate(262 70)"><rect x="-34" y="-16" width="68" height="34" rx="10" fill="#fff4d6"/>${bvT(0,-1,'Sec. 3, 5, 6',{s:9.5,w:800,c:'#b8860b'})}${bvT(0,12,'versions',{s:9,c:'#b8860b'})}</g>`,'Three versions of the disputed sections'),

  // ===== Byte's whip count =====
  seats21:({split})=>{const pos=[];for(let i=0;i<11;i++){const a=Math.PI*(1-(i+.5)/11);pos.push([150+Math.cos(a)*120,104-Math.sin(a)*78])}for(let i=0;i<10;i++){const a=Math.PI*(1-(i+.5)/10);pos.push([150+Math.cos(a)*78,104-Math.sin(a)*46])}
    const col=i=>split?(i<9?BV.green:i<18?'#d0473c':BV.gold):BV.violet,ord=[0,11,1,12,2,13,3,14,4,15,5,16,6,17,7,18,8,19,9,20,10];
    return igFrame(300,124,`${pos.map((p,k)=>{const i=ord.indexOf(k);const c=col(i),on=split||i<11;return `<g class="${split?(i>=18?'ig-pulse':''):'bv-seat'}" style="--d:${(i*.12).toFixed(2)}s;--c:${c}"><circle cx="${p[0].toFixed(1)}" cy="${(p[1]-5).toFixed(1)}" r="4.6" fill="${on?c:'#d6dbec'}"/><path d="M${(p[0]-6.4).toFixed(1)} ${(p[1]+6).toFixed(1)} C${(p[0]-6.4).toFixed(1)} ${(p[1]-1).toFixed(1)} ${(p[0]+6.4).toFixed(1)} ${(p[1]-1).toFixed(1)} ${(p[0]+6.4).toFixed(1)} ${(p[1]+6).toFixed(1)}Z" fill="${on?c:'#d6dbec'}"/>${split&&i>=18?bvT(p[0],p[1]+3.6,'?',{s:7,c:'#fff',w:900}):''}</g>`}).join('')}
      ${split?bvT(150,96,'9 yes · 9 no · 3 undecided',{s:11,w:800}):bvT(150,96,'11 of 21 = a majority',{s:12,w:800,c:BV.violet})}
      <path d="M40 112 H260" stroke="#8a5a3a" stroke-width="5" stroke-linecap="round"/>`,split?'Nine yes, nine no, three undecided':'Twenty-one seats, and eleven votes make a majority')},
  tieScale:()=>igFrame(300,130,`<g transform="translate(150 22)"><path d="M0 0 V86" stroke="${BV.ink}" stroke-width="4"/><path d="M-26 92 h52" stroke="${BV.ink}" stroke-width="6" stroke-linecap="round"/><circle r="5" fill="${BV.gold}"/>
      <g class="bv-tilt"><path d="M-96 0 H96" stroke="${BV.ink}" stroke-width="4" stroke-linecap="round"/>
        <g transform="translate(-86 0)"><path d="M0 0 L-16 34 M0 0 L16 34" stroke="${BV.soft}" stroke-width="1.4"/><path d="M-24 34 h48 a24 10 0 0 1 -48 0" fill="#e4f7ee" stroke="${BV.green}" stroke-width="1.6"/>${[...Array(10)].map((_,i)=>`<circle cx="${-15+(i%5)*7.5}" cy="${30-Math.floor(i/5)*6}" r="3.2" fill="${BV.green}"/>`).join('')}${bvT(0,58,'10 ayes',{s:10,c:BV.green,w:800})}</g>
        <g transform="translate(86 0)"><path d="M0 0 L-16 34 M0 0 L16 34" stroke="${BV.soft}" stroke-width="1.4"/><path d="M-24 34 h48 a24 10 0 0 1 -48 0" fill="#fde9e6" stroke="#d0473c" stroke-width="1.6"/>${[...Array(11)].map((_,i)=>`<circle cx="${-15+(i%5)*7.5}" cy="${30-Math.floor(i/5)*6}" r="3.2" fill="#d0473c"/>`).join('')}${bvT(0,58,'11 noes',{s:10,c:'#d0473c',w:800})}</g></g></g>
      ${bvT(150,126,'10 to 11 fails',{s:11,w:800,c:'#d0473c'})}`,'A balance with 10 ayes against 11 noes tips to no'),
  chipLine:()=>igFrame(300,134,`<rect x="0" y="104" width="300" height="30" fill="#e8d8a4"/>${[...Array(30)].map((_,i)=>`<path d="M${i*10+4} 106 C${i*10+3} 98 ${i*10+5} 94 ${i*10+4} 88" stroke="#c8a040" stroke-width="1.4" fill="none"/><ellipse cx="${i*10+4}" cy="${88}" rx="1.8" ry="3.2" fill="#e0b84a"/>`).join('')}
      <g transform="translate(36 70)"><rect x="-30" y="-44" width="60" height="58" rx="6" fill="#eef1fb" stroke="#cfd6ea"/><rect x="-22" y="-30" width="44" height="20" rx="3" fill="#fff"/>${bvT(0,-36,'CHIP PERMITS',{s:7,w:900,c:BV.navy})}
        <rect x="-5" y="-26" width="10" height="9" rx="1.6" fill="${BV.gold}" class="ig-pulse"/>${bvT(0,6,'capped',{s:8,c:BV.soft})}</g>
      ${[0,1,2,3,4,5].map(i=>{const got=i%3===0;return `<g>${bvBot(96+i*34,106,.82,{chip:got,old:!got})}${got?`<g class="ig-pulse" style="--d:${i*.2}s"><circle cx="${96+i*34}" cy="44" r="7" fill="${BV.green}"/><path d="M${92+i*34} 44 l3 3 l5 -5" stroke="#fff" stroke-width="2" fill="none"/></g>`:`<g class="ig-blink" style="--d:${i*.2}s"><rect x="${88+i*34}" y="36" width="16" height="13" rx="3" fill="#fde9e6" stroke="#d0473c"/><rect x="${92+i*34}" y="39.5" width="2.6" height="6" fill="#d0473c"/><rect x="${97.4+i*34}" y="39.5" width="2.6" height="6" fill="#d0473c"/></g>`}</g>`}).join('')}
      ${bvT(186,126,'Year 1: about 1 in 3 farm robots get a chip',{s:10,w:800})}`,'Only one in three farm robots can get a signing chip in the first year'),
  voteDial:({a,b,goat})=>{const arc=(cx,n,col)=>{const R=26,an=Math.PI*(1-n/100),x=cx+R*Math.cos(an),y=72-R*Math.sin(an);
      return `<path d="M${cx-R} 72 A${R} ${R} 0 0 1 ${cx+R} 72" stroke="#e6e9f4" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M${cx-R} 72 A${R} ${R} 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)}" stroke="${col}" stroke-width="9" fill="none" stroke-linecap="round" class="bv-arc"/>${bvT(cx,70,n+'%',{s:13,w:900,c:col})}`};
    return igFrame(300,124,`${bvFace('gunderson',50,62,30,goat?'smile':'think')}${goat?bvGoat(62,116,.9,{cls:'bv-hop'}):''}
      <g>${arc(152,a,BV.coral)}${bvT(152,92,'first draft',{s:9.5,c:BV.soft})}</g><path d="M186 64 h14" stroke="${BV.soft}" stroke-width="2.4"/><path d="M196 58 l6 6 l-6 6" stroke="${BV.soft}" stroke-width="2.4" fill="none"/>
      <g>${arc(242,b,BV.green)}${bvT(242,92,'farms first in line',{s:9.5,c:BV.soft})}</g>${bvT(196,116,'Rep. Gunderson votes yes',{s:10,w:800})}`,'Rep. Gunderson’s chance of voting yes, before and after a phase-in')},
  pauseCrew:()=>igFrame(300,130,`<rect x="0" y="104" width="300" height="26" fill="#dfe4ee"/><path d="M0 104 H300" stroke="#c8cfe0" stroke-width="2"/>
      <g class="bv-crew">${[0,1,2].map(i=>bvBot(118+i*40,106,.85,{arm:'carry'})).join('')}<rect x="104" y="72" width="108" height="8" rx="2" fill="#c89a5a" stroke="#8a6a3a"/></g>
      ${bvHuman(44,106,{s:1.35,shirt:'#f5b82e',hair:'#1b1410',skin:SKIN[2],style:'pony'})}
      <g transform="translate(70 62)"><rect x="-14" y="-12" width="28" height="24" rx="6" fill="#fff" stroke="${BV.gold}" stroke-width="2"/><g class="bv-press"><rect x="-7" y="-6" width="4.6" height="12" rx="1.4" fill="${BV.ink}"/><rect x="2.4" y="-6" width="4.6" height="12" rx="1.4" fill="${BV.ink}"/></g></g>
      <g transform="translate(262 40)"><g class="ig-rise"><rect x="-30" y="-22" width="60" height="44" rx="6" fill="#fff" stroke="${BV.line}" stroke-width="1.6"/>${bvT(0,-10,'Accident report',{s:7.5,w:900})}<path d="M-22 -2 h44 M-22 5 h38 M-22 12 h30" stroke="#c8cde0" stroke-width="2.4" stroke-linecap="round"/></g></g>
      ${bvT(262,76,'workers can read it',{s:8.5,c:BV.soft})}`,'A worker pauses a robot crew and reads the accident report'),
  rumorWave:()=>igFrame(300,130,`<rect x="0" y="80" width="300" height="50" fill="#b6dcf0"/>
      <g class="bv-rock"><path d="M112 82 L188 82 L176 98 L124 98Z" fill="#f4f6fb" stroke="#9aa6c0" stroke-width="1.4"/><rect x="146" y="58" width="3" height="24" fill="#8a6a3a"/><path d="M149 60 L170 72 L149 76Z" fill="${BV.teal}"/>
        ${bvT(150,93,'12-person maker',{s:7.5,w:800})}</g>
      <path class="ig-wave" d="M0 84 q15 -8 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0" stroke="#fff" stroke-width="3" fill="none"/>
      <path d="M0 100 q20 -10 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" stroke="#8ec6e4" stroke-width="5" fill="none" class="ig-wave" style="animation-duration:2s"/>
      ${[[50,30,'Robot accident??'],[226,24,'Is it unsafe?'],[220,58,'!!!']].map(([x,y,t],i)=>`<g class="ig-rise" style="--d:${i*.7}s"><rect x="${x-46}" y="${y-13}" width="92" height="20" rx="10" fill="#fff" stroke="${BV.red}" stroke-width="1.2"/>${bvT(x,y+1,t,{s:9,c:BV.red,w:800})}</g>`).join('')}
      ${bvT(150,124,'Reports made public too soon can start harmful rumors',{s:9.5,c:'#3a5a7a'})}`,'Rumors rocking a small robot company like waves'),
  splitReport:()=>igFrame(300,140,`<g transform="translate(40 66)"><rect x="-16" y="-20" width="32" height="40" rx="3" fill="#fff" stroke="${BV.navy}" stroke-width="1.6"/><path d="M-10 -12 h20 M-10 -5 h20 M-10 2 h14 M-10 9 h18" stroke="#c8cde0" stroke-width="2"/>${bvT(0,34,'report',{s:9,c:BV.soft})}</g>
      <path d="M62 60 C120 60 140 30 196 30" stroke="${BV.line}" stroke-width="4" fill="none"/><path d="M62 72 C120 72 140 104 196 104" stroke="${BV.line}" stroke-width="4" fill="none"/>
      <g class="bv-up"><rect x="-8" y="-10" width="16" height="20" rx="2" fill="#fff" stroke="${BV.navy}" stroke-width="1.4"/></g><g class="bv-down"><rect x="-8" y="-6" width="16" height="12" rx="2" fill="#fff4d6" stroke="${BV.gold}" stroke-width="1.4"/></g>
      <g transform="translate(236 34)"><path d="M-24 -6 L0 -20 L24 -6Z" fill="#cfd6ea"/><rect x="-22" y="-6" width="44" height="26" fill="#eef1fb" stroke="#cfd6ea"/>${[-14,-5,4,13].map(cx=>`<rect x="${cx-2}" y="-3" width="4" height="20" fill="#cfd6ea"/>`).join('')}${bvT(0,-26,'regulator · 24 h · full details',{s:8.5,w:800})}</g>
      <g transform="translate(236 104)">${[-24,-8,8,24].map((dx,i)=>bvHuman(dx,20,{s:.62,shirt:['#ff7a6b','#6c5ce7','#16b3a6','#f5b82e'][i],hair:['#1b1410','#c9772d','#2a2030','#5a3a24'][i]})).join('')}${bvT(0,-14,'public · 7 days · summary',{s:8.5,w:800})}</g>`,'A report goes to the regulator in 24 hours and to the public in 7 days'),
  passGauge:({n})=>{const R=56,an=Math.PI*(1-n/100);return igFrame(300,124,`<g transform="translate(150 96)"><path d="M${-R} 0 A${R} ${R} 0 0 1 ${R} 0" stroke="#e6e9f4" stroke-width="16" fill="none"/>
      <path d="M${-R} 0 A${R} ${R} 0 0 1 ${(R*Math.cos(Math.PI*.5)).toFixed(1)} ${(-R).toFixed(1)}" stroke="#fde2de" stroke-width="16" fill="none"/>
      <path d="M${-R} 0 A${R} ${R} 0 0 1 ${(R*Math.cos(an)).toFixed(1)} ${(-R*Math.sin(an)).toFixed(1)}" stroke="${n>=50?BV.green:BV.coral}" stroke-width="16" fill="none" class="bv-arc"/>
      <g class="bv-needle" style="--a:${(-90+180*n/100).toFixed(1)}deg"><path d="M0 0 L0 ${-R+10}" stroke="${BV.ink}" stroke-width="3.4" stroke-linecap="round"/></g><circle r="6" fill="${BV.ink}"/>
      ${bvT(-R-4,16,'0',{s:9,c:BV.soft})}${bvT(R+4,16,'100',{s:9,c:BV.soft})}${bvT(0,-R-12,'50',{s:9,c:BV.soft})}</g>${bvT(150,120,'about '+n+' in 100',{s:12,w:900,c:n>=50?BV.green:BV.coral})}`,'A gauge showing about '+n+' in 100')},

  // ===== The Ledger: Washington =====
  twoBills:()=>igFrame(300,130,`<g transform="translate(14 10)">${bvPaper(0,0,88,96,{n:0})}${bvT(44,16,'HOUSE',{s:9,w:900,c:BV.navy})}${[26,36,46,56,66,76].map((y,i)=>`<rect x="10" y="${y}" width="${[68,60,66,52,64,58][i]}" height="3" rx="1.5" fill="${i===2||i===4?BV.green:'#d8d2bc'}"/>`).join('')}</g>
      <g transform="translate(198 10)">${bvPaper(0,0,88,96,{n:0})}${bvT(44,16,'SENATE',{s:9,w:900,c:'#8a2a3a'})}${[26,36,46,56,66,76].map((y,i)=>`<rect x="10" y="${y}" width="${[68,60,44,52,40,58][i]}" height="3" rx="1.5" fill="${i===2||i===4?BV.coral:'#d8d2bc'}"/>`).join('')}</g>
      <g transform="translate(150 54)"><circle r="22" fill="#fff4d6" stroke="${BV.gold}" stroke-width="2" class="ig-pulse"/>${bvT(0,-2,'not the',{s:8,w:800,c:'#b8860b'})}${bvT(0,9,'same words',{s:8,w:800,c:'#b8860b'})}</g>
      <path d="M106 54 h18 M176 54 h18" stroke="${BV.soft}" stroke-width="2.4" class="ig-dash"/>${bvT(150,124,'Both chambers must pass the exact same text',{s:10,c:BV.soft})}`,'A House bill and a Senate bill with different words'),
  reflectPool:()=>igFrame(300,130,`<rect width="300" height="64" fill="#cde6f6"/><rect y="64" width="300" height="66" fill="#8ec6e4"/>${bvCapitol(150,64,1.25)}<g transform="translate(150 64) scale(1 -1)" opacity=".35">${bvCapitol(0,0,1.25)}</g>
      <path class="ig-wave" d="M0 80 q15 -4 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0" stroke="#fff" stroke-width="1.6" fill="none" opacity=".8"/>
      <g class="bv-scrub">${[0,1,2].map(i=>`<g transform="translate(${60+i*80} ${112-i*6})"><ellipse cx="0" cy="2" rx="12" ry="3" fill="#5aa6cf"/><rect x="-10" y="-8" width="20" height="10" rx="5" fill="#f6f8fc" stroke="#9aa6c0"/><rect x="-10" y="-5" width="20" height="2.6" fill="${BV.navy}"/><circle cx="0" cy="-10" r="3" fill="#f6f8fc" stroke="#9aa6c0"/></g>`).join('')}</g>
      <g class="ig-rise"><rect x="208" y="8" width="86" height="20" rx="10" fill="#fff"/>${bvT(251,22,'2 days early',{s:10,c:BV.green,w:800})}</g>`,'Robots cleaning the Capitol Reflecting Pool'),
  cherry:()=>{let bl='',pt='';for(let i=0;i<26;i++){const x=(i*47)%290+5,y=10+(i*29)%40;bl+=`<g transform="translate(${x} ${y}) rotate(${i*31})">${[0,1,2,3,4].map(k=>`<ellipse cx="0" cy="-3.2" rx="2.2" ry="3.4" fill="${i%3?'#fbd0de':'#f6b4c8'}" transform="rotate(${k*72})"/>`).join('')}<circle r="1.3" fill="#e0607a"/></g>`}
    for(let i=0;i<9;i++)pt+=`<ellipse cx="${20+i*32}" cy="0" rx="2.4" ry="1.6" fill="#f8c2d2" class="bv-petal" style="--d:${(i*.5).toFixed(1)}s"/>`;
    return igFrame(300,130,`<rect width="300" height="130" fill="#eaf4fb"/><rect y="88" width="300" height="42" fill="#9ccbe4"/><g transform="translate(150 88)"><rect x="-34" y="-6" width="68" height="6" fill="#f4f1ea"/>${[-28,-18,-8,2,12,22].map(x=>`<rect x="${x}" y="-22" width="4" height="16" fill="#f4f1ea"/>`).join('')}<rect x="-32" y="-26" width="64" height="5" fill="#e6e2d6"/><path d="M-26 -26 C-26 -40 26 -40 26 -26Z" fill="#f4f1ea"/></g>
      <path d="M0 26 C60 34 120 20 200 30 C240 34 270 28 300 32" stroke="#6a4a3a" stroke-width="4" fill="none"/><path d="M60 30 C70 46 76 52 90 58 M200 30 C210 44 224 50 240 52" stroke="#6a4a3a" stroke-width="2.4" fill="none"/>${bl}<g>${pt}</g>
      ${bvT(150,122,'Tidal Basin · peak bloom',{s:10,c:'#3a5a7a',w:800})}`,'Cherry blossoms at the Tidal Basin')},
  flipVote:()=>igFrame(300,130,`<g transform="translate(70 66)"><rect x="-46" y="-48" width="92" height="96" rx="8" fill="#fff" stroke="${BV.line}" stroke-width="1.6"/>${bvT(0,-32,'AI aide summary',{s:8.5,w:900,c:BV.violet})}
      <path d="M-36 -18 h72 M-36 -8 h60 M-36 2 h70 M-36 12 h50" stroke="#c8cde0" stroke-width="3" stroke-linecap="round"/><path d="M-36 -8 h60" stroke="${BV.coral}" stroke-width="3" stroke-linecap="round" class="ig-blink"/>
      <g class="ig-pulse"><circle cx="34" cy="34" r="10" fill="#fff4d6" stroke="${BV.gold}" stroke-width="1.6"/>${bvT(34,38.5,'?',{s:12,c:'#b8860b',w:900})}</g></g>
      <path d="M126 66 h20" stroke="${BV.soft}" stroke-width="2.4"/><path d="M142 60 l6 6 l-6 6" stroke="${BV.soft}" stroke-width="2.4" fill="none"/>
      <g transform="translate(222 66)"><g class="bv-flipA"><rect x="-44" y="-26" width="88" height="52" rx="10" fill="${BV.green}"/>${bvT(0,8,'YES',{s:22,c:'#fff',w:900})}</g><g class="bv-flipB"><rect x="-44" y="-26" width="88" height="52" rx="10" fill="#d0473c"/>${bvT(0,8,'NO',{s:22,c:'#fff',w:900})}</g></g>
      ${bvT(222,112,'on their own bills',{s:9.5,c:BV.soft})}`,'An AI summary and a vote that flips from yes to no'),

  // ===== Learn it fast: how a bill becomes a law =====
  billHopper:()=>igFrame(300,124,`<g transform="translate(150 60)"><path d="M-60 0 L60 0 L52 50 L-52 50Z" fill="#6a3a1e"/><path d="M-60 0 L60 0 L56 8 L-56 8Z" fill="#8a5230"/><path d="M-46 12 h92 M-44 22 h88 M-42 32 h84" stroke="#5a2e14" stroke-width="1.4" opacity=".6"/><rect x="-62" y="-4" width="124" height="6" rx="3" fill="#a8683a"/><path d="M-40 -4 L-44 -30 M40 -4 L44 -30" stroke="#8a5230" stroke-width="3"/><path d="M-46 -30 h92" stroke="#a8683a" stroke-width="4" stroke-linecap="round"/></g>
      <g class="bv-drop">${bvPaper(130,-6,40,50,{n:5})}${bvT(150,8,'H.R.',{s:7,w:900,c:BV.navy})}</g>${bvT(150,122,'the hopper',{s:10,c:BV.soft})}`,'A new bill dropping into the hopper'),
  billCommittee:()=>igFrame(300,124,`<path d="M30 52 C80 70 220 70 270 52 L270 66 C220 84 80 84 30 66Z" fill="#6a3a1e"/>${[50,90,130,170,210,250].map((x,i)=>bvHuman(x,58+Math.abs(150-x)*.06,{s:.62,shirt:['#26346a','#7a2a2e','#1f8a84','#3b4256','#b98a52','#5a3a6a'][i],hair:['#2a2230','#b9b4b0','#22161a','#16121a','#8a5a34','#3a2a1a'][i]})).join('')}
      <rect x="110" y="100" width="80" height="10" rx="2" fill="#24306a"/>${bvHuman(150,104,{s:.8,shirt:'#1d2440',hair:'#8a5a34'})}
      <g class="ig-rise"><rect x="176" y="80" width="64" height="18" rx="9" fill="#fff" stroke="${BV.line}"/>${bvT(208,93,'Here’s what I saw…',{s:7,w:800})}</g><g class="ig-rise" style="--d:1.2s"><rect x="40" y="14" width="64" height="18" rx="9" fill="#fff" stroke="${BV.line}"/>${bvT(72,27,'Who pays?',{s:7.5,w:800})}</g>`,'A committee hearing with members and a witness'),
  billMarkup:()=>igFrame(300,124,`<g transform="translate(36 8)">${bvPaper(0,0,130,104,{n:0})}${[16,28,40,52,64,76].map((y,i)=>`<rect x="12" y="${y}" width="${[100,90,106,80,96,70][i]}" height="3" rx="1.5" fill="#d8d2bc"/>`).join('')}
      <path d="M12 41.5 h70" stroke="${BV.red}" stroke-width="2" class="bv-strike"/><g class="ig-rise" style="--d:.8s"><path d="M60 58 l4 -8 l4 8" stroke="${BV.red}" stroke-width="1.6" fill="none"/><text x="70" y="52" font-family="Caveat,cursive" font-size="12" fill="${BV.red}">farms first</text></g></g>
      <g transform="translate(232 62)"><rect x="-44" y="-30" width="88" height="60" rx="10" fill="#f3f0ff"/>${bvT(0,-12,'Vote',{s:10,w:900,c:BV.violet})}<g class="ig-rise" style="--d:1.6s">${bvT(-18,14,'11',{s:20,w:900,c:BV.green})}${bvT(20,14,'10',{s:20,w:900,c:'#d0473c'})}</g></g>`,'Members amend a bill with a red pen, then vote'),
  billFloor:()=>{let d='';for(let r=0;r<6;r++){const n=40+r*14,R=40+r*13;for(let i=0;i<n;i++){const a=Math.PI*(1-(i+.5)/n),idx=r*1000+i;const on=(i/n)<.5+(r%2?.01:0);d+=`<circle cx="${(150+Math.cos(a)*R*1.45).toFixed(1)}" cy="${(110-Math.sin(a)*R).toFixed(1)}" r="1.9" fill="${on?BV.green:'#d6dbec'}" class="${on?'bv-dot':''}" style="--d:${(i/n*1.4).toFixed(2)}s"/>`}}
    return igFrame(300,124,`${d}${bvT(150,96,'218',{s:22,w:900,c:BV.green})}${bvT(150,110,'of 435',{s:10,c:BV.soft})}`,'The House chamber filling to 218 of 435 votes')},
  billChambers:()=>igFrame(300,124,`<g class="bv-mergeL">${bvPaper(40,14,74,92,{n:9})}${bvT(77,26,'HOUSE',{s:8,w:900,c:BV.navy})}</g><g class="bv-mergeR">${bvPaper(186,14,74,92,{n:9})}${bvT(223,26,'SENATE',{s:8,w:900,c:'#8a2a3a'})}</g>
      <g class="bv-merged">${bvPaper(113,10,74,100,{n:10,fill:'#fff'})}${bvT(150,22,'same words',{s:8,w:900,c:BV.green})}<circle cx="150" cy="96" r="7" fill="${BV.green}"/><path d="M146 96 l3 3 l5 -5" stroke="#fff" stroke-width="2" fill="none"/></g>`,'House and Senate versions merging into one'),
  billSign:()=>igFrame(300,124,`<g transform="translate(20 14)">${bvPaper(0,0,120,92,{n:5})}<path d="M14 72 C24 60 30 80 40 66 C48 56 52 76 62 66 C70 58 76 70 86 64" stroke="${BV.navy}" stroke-width="2.4" fill="none" class="bv-sign"/><g class="bv-pen"><path d="M0 0 L22 -22 L26 -18 L4 4Z" fill="${BV.ink}"/><path d="M0 0 L-3 6 L4 4Z" fill="${BV.gold}"/></g>${bvT(60,104,'signed: it’s law',{s:9.5,c:BV.green,w:800})}</g>
      <g transform="translate(160 14)">${bvPaper(0,0,120,92,{n:5})}<g class="bv-stamp" style="--d:1.4s"><rect x="18" y="30" width="84" height="30" rx="4" fill="none" stroke="${BV.red}" stroke-width="3" transform="rotate(-10 60 45)"/>${'<text x="60" y="52" text-anchor="middle" font-size="18" font-weight="900" fill="'+BV.red+'" font-family="Nunito" transform="rotate(-10 60 45)">VETO</text>'}</g>${bvT(60,104,'⅔ of both can override',{s:9.5,c:BV.red,w:800})}</g>`,'A bill signed into law, or vetoed with a two-thirds override')
});

// ---------- Future Table vignettes (120x90) ----------
let BILL_VN=0;
function bill_vig(kind){const id='bvg'+(++BILL_VN);let art='';
  const fake=(x,y,cls)=>`<g transform="translate(${x} ${y})" class="${cls||''}"><rect x="-11" y="-8" width="22" height="16" rx="2.4" fill="#fff" stroke="${BV.red}" stroke-width="1.4"/><path d="M-11 -8 L0 0 L11 -8" stroke="${BV.red}" stroke-width="1.1" fill="none"/>${bvSeal(9,6,4.6,0)}</g>`;
  if(kind==='law')art=`<rect width="120" height="90" fill="#dff1fb"/><rect y="66" width="120" height="24" fill="#cfe6c8"/>${bvHouse(84,70,1.9,{wall:'#f2e6d0'})}
    ${bvBot(48,72,.95,{arm:'up',chip:1})}<g class="bv-bounce">${fake(18,24)}</g><g class="vpop"><circle cx="20" cy="50" r="8" fill="${BV.red}"/><path d="M16.5 46.5 l7 7 M23.5 46.5 l-7 7" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></g>
    <g transform="translate(104 14)"><circle r="9" fill="${BV.green}"/><path d="M-4 0 l3 3 l5 -6" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/></g>`;
  if(kind==='gapfarm')art=`<rect width="120" height="90" fill="#fdf0d6"/><rect y="62" width="120" height="28" fill="#c8dc94"/><path d="M78 62 L78 34 L98 22 L118 34 L118 62Z" fill="#b8483a"/><path d="M78 34 L98 22 L118 34" stroke="#f4efe4" stroke-width="2" fill="none"/><rect x="90" y="44" width="16" height="18" fill="#7a2a20"/><path d="M90 44 L106 62 M106 44 L90 62" stroke="#f4efe4" stroke-width="1.4"/>
    <path d="M4 66 H70" stroke="#a87a4a" stroke-width="2"/>${[8,22,36].map(x=>`<rect x="${x}" y="54" width="2.4" height="14" fill="#a87a4a"/>`).join('')}<g class="bv-gate"><rect x="50" y="54" width="20" height="3" fill="#a87a4a"/><rect x="50" y="61" width="20" height="3" fill="#a87a4a"/></g>
    ${bvBot(62,70,.62,{arm:'reach',old:1})}${fake(30,18,'ig-blink')}<g class="bv-run">${bvGoat(24,82,.62,{flip:1})}${bvGoat(6,86,.5,{flip:1})}</g>${bvGoat(-14,84,.55,{flip:1,cls:'bv-run'})}`;
  if(kind==='gapold')art=`<rect width="120" height="90" fill="#262c5a"/>${[...Array(8)].map((_,i)=>`<circle cx="${(i*37)%116+2}" cy="${(i*13)%30+4}" r=".8" fill="#fff"/>`).join('')}<rect y="66" width="120" height="24" fill="#3a4a5a"/>${bvHouse(70,70,1.9,{night:1,open:1})}${bvBot(42,72,.92,{arm:'reach',old:1})}${fake(18,26,'ig-blink')}
    <g transform="translate(104 16)"><rect x="-12" y="-8" width="24" height="16" rx="3" fill="#fff4d6"/>${bvT(0,4,'old',{s:8,c:'#b8860b',w:900})}</g>`;
  if(kind==='fail')art=`<rect width="120" height="90" fill="#f4ece6"/><rect x="14" y="12" width="92" height="40" rx="6" fill="#2a2f55"/>${bvT(38,38,'10',{s:18,c:'#5ee6a0',w:900})}${bvT(60,37,'–',{s:16,c:'#fff'})}${bvT(82,38,'11',{s:18,c:'#ff7a6b',w:900})}
    <g class="vpop"><rect x="28" y="56" width="64" height="16" rx="8" fill="#d0473c"/>${bvT(60,68,'FAILED',{s:10,c:'#fff',w:900})}</g><g transform="translate(96 78) rotate(-12)"><path d="M-10 -7 L8 -9 L11 6 L-8 8Z" fill="#fffdf6" stroke="#d8d2bc"/><path d="M-6 -3 L6 -4 M-5 1 L7 0" stroke="#d8d2bc"/></g>`;
  return `<svg viewBox="0 0 120 90" class="vig"><clipPath id="${id}"><rect width="120" height="90" rx="10"/></clipPath><g clip-path="url(#${id})">${art}</g></svg>`}

// ---------- the whip board under the futures ----------
function bill_whipBoard(c){const k=M().knows(),v=bill_votes(c,k),p=bill_pct(bill_pass(c,k));
  return `<div class="bill-board"><div class="bb-row">${BILL_WHO.map(id=>{const n=bill_pct(v[id]);return `<div class="bb-m"><div class="bb-face">${bill_face(id,n>=70?'smile':n>=40?'think':'worried')}</div>
    <div class="bb-name">${esc(CAST[id].name.replace('Rep. ',''))}</div><div class="bb-bar"><i style="width:${n}%"></i></div><b>${n}% yes</b></div>`}).join('')}</div>
    <div class="bb-sum"><span><b>9</b> sure yes + 2 of these 3 = <b>11</b></span><em>Passes about ${p} in 100</em></div></div>`}

// ---------- clothes over the anime bust: blazers, a farmer's barn coat, a fire chief's dress uniform, the member pin ----------
// Pins sit on the character's left lapel (viewer's right). Coordinates are in the bust's 300x372 space.
function bill_pin(kind,x,y){
  if(kind==='house')return `<g transform="translate(${x} ${y})"><ellipse rx="7.6" ry="9" fill="#c89a3a" stroke="#6a4a10" stroke-width="1.2"/><ellipse rx="5.6" ry="7" fill="#26346a"/>
    <path d="M-3.6 -1 C-2 -3 -1 -3 0 -1.6 C1 -3 2 -3 3.6 -1 L2 0 L0 3.6 L-2 0Z" fill="#f4d27a"/>${[[-3,-4.6],[0,-5.4],[3,-4.6]].map(([a,b])=>`<circle cx="${a}" cy="${b}" r=".7" fill="#fff"/>`).join('')}<ellipse cx="-2.6" cy="-5" rx="1.8" ry="1" fill="#fff" opacity=".45"/></g>`;
  if(kind==='wheat')return `<g transform="translate(${x} ${y}) rotate(18)"><path d="M0 12 C0 4 0 -4 0 -12" stroke="#b88a2a" stroke-width="1.6" fill="none"/>${[-8,-4,0,4].map((yy,i)=>`<ellipse cx="-2.6" cy="${yy}" rx="2.2" ry="3.4" transform="rotate(-28 -2.6 ${yy})" fill="#e8c05a" stroke="#9a6a10" stroke-width=".6"/><ellipse cx="2.6" cy="${yy+1.6}" rx="2.2" ry="3.4" transform="rotate(28 2.6 ${yy+1.6})" fill="#e8c05a" stroke="#9a6a10" stroke-width=".6"/>`).join('')}<ellipse cx="0" cy="-12.6" rx="1.8" ry="2.8" fill="#f4d27a" stroke="#9a6a10" stroke-width=".6"/></g>`;
  if(kind==='crane')return `<g transform="translate(${x} ${y})"><circle r="8.4" fill="#f4f1ea" stroke="#c89a3a" stroke-width="1.4"/><path d="M-4.6 5 V-4.6 H5 M-4.6 -4.6 L-1.6 -1.6 M-4.6 -1 H1 M3.6 -4.6 V0" stroke="#e8743a" stroke-width="1.5" fill="none" stroke-linecap="round"/><rect x="2.4" y="0" width="2.6" height="2.2" fill="#26346a"/><path d="M-6.4 5 H6.4" stroke="#26346a" stroke-width="1.2"/></g>`;
  if(kind==='robot')return `<g transform="translate(${x} ${y})"><circle r="8" fill="#e9eef6" stroke="#c89a3a" stroke-width="1.4"/><path d="M-4.4 1.4 C-4.4 -3.6 -2.4 -5 0 -5 C2.4 -5 4.4 -3.6 4.4 1.4Z" fill="#fff" stroke="#7a86a6" stroke-width=".8"/><path d="M-3.4 -1.6 C-1.6 -2.6 1.6 -2.6 3.4 -1.6 L3.2 .2 C1.4 .8 -1.4 .8 -3.2 .2Z" fill="#2a3354"/><path d="M-2 -1 h4" stroke="#7ff7e4" stroke-width=".7"/><rect x="-4.4" y="2.4" width="8.8" height="3.2" rx="1" fill="#26346a"/></g>`;
  return ''}
function bill_dress(o,mood){const B=o.bill||{},kid=o.age==='kid';let add='';
  if(B.pin==='chief'){ // fire chief's dress uniform: gold collar bugles, a shield badge, gold buttons
    const bug=(x,y,f)=>`<g transform="translate(${x} ${y}) scale(${f} 1) rotate(-28)"><path d="M-6 1.2 C-2 1.6 2 1.6 5 .6 L7.4 -2.2 L7.8 2.6 L5 1.4 C2 3 -2 3 -6 2.6Z" fill="#e8c05a" stroke="#8a6410" stroke-width=".7"/><circle cx="-6" cy="1.9" r="1.3" fill="#e8c05a" stroke="#8a6410" stroke-width=".6"/></g>`;
    add+=bug(124,236,1)+bug(124,242,1)+bug(176,236,-1)+bug(176,242,-1);
    add+=`<g transform="translate(196 284)"><path d="M0 -14 C5 -12 9 -12 12 -13 L12 -2 C12 7 6 12 0 15 C-6 12 -12 7 -12 -2 L-12 -13 C-9 -12 -5 -12 0 -14Z" fill="#e8c05a" stroke="#7a5410" stroke-width="1.2"/>
      <path d="M0 -9 C3.4 -8 6 -8 8 -9 L8 -2 C8 4 4 7.6 0 10 C-4 7.6 -8 4 -8 -2 L-8 -9 C-6 -8 -3.4 -8 0 -9Z" fill="none" stroke="#a87a1a" stroke-width=".8"/>
      <path d="M0 -6 L1.4 -2.4 L5 -2.2 L2.2 .2 L3.2 3.8 L0 1.8 L-3.2 3.8 L-2.2 .2 L-5 -2.2 L-1.4 -2.4Z" fill="#c8282e" stroke="#7a1418" stroke-width=".5"/><ellipse cx="-5" cy="-9" rx="3" ry="1.4" fill="#fff6c8" opacity=".55"/></g>`;
    add+=[300,330,358].map(y=>`<circle cx="164" cy="${y}" r="3.2" fill="#e8c05a" stroke="#7a5410" stroke-width=".8"/><circle cx="163" cy="${y-1}" r="1" fill="#fff6c8"/>`).join('')}
  else if(B.pin){const build=o.masc?'M':'F';add+=bill_pin(B.pin,build==='M'?190:186,build==='M'?266:258)}
  return personSVG({...o,mood})+(add&&!kid?`<g class="bill-dress">${add}</g>`:'')}
