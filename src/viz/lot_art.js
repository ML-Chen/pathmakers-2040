// lot_art.js — Phoenix art kit for "The Flood Lot": saguaros, palms, palo verdes, crew robots, the neighbors as small figures,
// Future Table vignettes (side view, viewBox 0 0 120 90), commission dioramas (isometric, 0 0 300 180), red-team cartoons,
// make-cards icons, and Arroyo's portrait. Reusable by later Phoenix missions. Animation classes are prefixed "lot-" (src/css/lot.css).
const LX={ink:'#1f2340',soft:'#8a90b0',line:'#dfe3f3',sky:'#a9d6f2',skyL:'#e2f2fb',storm:'#55607f',stormD:'#343b58',stormL:'#8a93ad',sand:'#e8c894',sandL:'#f4dfb6',sandD:'#c9a06a',
  dirt:'#bf8d58',dirtD:'#946639',conc:'#ddd6cb',concD:'#b4ab9c',concL:'#f1ece4',asph:'#5f5b66',asphL:'#7c7884',water:'#4aa3df',waterL:'#97d5f6',waterD:'#2a76b5',
  green:'#78a854',greenD:'#4d7c36',sag:'#5b9351',sagD:'#2e5f31',sagL:'#93c47e',mtn:'#c0693f',mtnD:'#8c4630',mtnL:'#e09a66',sail:'#fff7e8',sailS:'#e6d3b2',
  orange:'#ef7d32',gold:'#f5b82e',red:'#e5484d',teal:'#16b3a6',violet:'#6c5ce7',white:'#ffffff',block:'#d9c3a0',blockD:'#b89c74'};
let LXN=0;const lxId=p=>p+(++LXN);
const lxn=v=>Math.round(v*10)/10;
function lxT(x,y,t,o={}){return `<text x="${x}" y="${y}" font-size="${o.s||11}" font-weight="${o.w||800}" fill="${o.c||LX.ink}" text-anchor="${o.a||'middle'}" font-family="Nunito, sans-serif"${o.op?` opacity="${o.op}"`:''}>${t}</text>`}

// ---------- plants ----------
// Saguaro with its feet at (x,y), h tall. Arms are rounded tubes that bend upward; ribs run along the trunk; red summer fruit on top.
function lxSaguaro(x,y,h,o={}){const w=h*.17,arms=o.arms||[[-1,.42,.34],[1,.55,.3],[-1,.66,.2]],c=o.c||LX.sag,cd=o.cd||LX.sagD,cl=o.cl||LX.sagL;
  const arm=([side,at,len])=>{const ay=y-h*at,aw=w*.72,ex=x+side*(w*.5+h*.16),top=ay-h*len;
    return `M${lxn(x+side*w*.2)} ${lxn(ay)} C${lxn(x+side*w*.9)} ${lxn(ay+h*.02)} ${lxn(ex)} ${lxn(ay+h*.02)} ${lxn(ex)} ${lxn(ay-h*.07)} L${lxn(ex)} ${lxn(top)}`};
  const A=arms.map(arm),aw=w*.72,tr=`M${x} ${y} L${x} ${lxn(y-h+w*.5)}`;
  return `<g class="${o.cls||''}">${o.shadow===false?'':`<ellipse cx="${lxn(x+h*.08)}" cy="${y}" rx="${lxn(w*1.6)}" ry="${lxn(w*.32)}" fill="#000" opacity=".14"/>`}
    ${A.map(d=>`<path d="${d}" stroke="${cd}" stroke-width="${lxn(aw+1.6)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}
    <path d="${tr}" stroke="${cd}" stroke-width="${lxn(w+1.8)}" stroke-linecap="round"/>
    ${A.map(d=>`<path d="${d}" stroke="${c}" stroke-width="${lxn(aw)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" stroke="${cl}" stroke-width="${lxn(aw*.28)}" fill="none" stroke-linecap="round" stroke-linejoin="round" transform="translate(${lxn(-aw*.18)} 0)" opacity=".7"/>`).join('')}
    <path d="${tr}" stroke="${c}" stroke-width="${lxn(w)}" stroke-linecap="round"/>
    ${[-.3,0,.3].map(k=>`<path d="M${lxn(x+k*w)} ${lxn(y-1)} L${lxn(x+k*w)} ${lxn(y-h+w*.7)}" stroke="${cd}" stroke-width="${lxn(Math.max(.4,w*.07))}" opacity=".55"/>`).join('')}
    <path d="M${lxn(x-w*.22)} ${lxn(y-2)} L${lxn(x-w*.22)} ${lxn(y-h+w*.6)}" stroke="${cl}" stroke-width="${lxn(w*.16)}" opacity=".7" stroke-linecap="round"/>
    ${o.fruit===false?'':[[-.2,-.05],[.15,-.02],[0,-.12]].map(([dx,dy])=>`<circle cx="${lxn(x+dx*w*1.4)}" cy="${lxn(y-h+w*.3+dy*w*2)}" r="${lxn(Math.max(.7,w*.13))}" fill="#e2495a"/>`).join('')}</g>`}
// Fan palm (the tall skinny palms of Phoenix streets): trunk, a skirt of dry fronds and a burst of green fans.
function lxPalm(x,y,h,o={}){const top=y-h,lean=o.lean||0,tx=x+lean,fr=[];for(let i=0;i<11;i++){const a=(-160+i*14)*Math.PI/180,L=h*(.2+(i%2)*.04);
    fr.push(`<path d="M${lxn(tx)} ${lxn(top)} Q${lxn(tx+Math.cos(a)*L*.5)} ${lxn(top+Math.sin(a)*L*.5-L*.18)} ${lxn(tx+Math.cos(a)*L)} ${lxn(top+Math.sin(a)*L+L*.2)}" stroke="${i%3?LX.greenD:LX.green}" stroke-width="${lxn(Math.max(.8,h*.035))}" fill="none" stroke-linecap="round"/>`)}
  return `<g class="${o.cls||''}"><path d="M${x} ${y} Q${lxn(x+lean*.2)} ${lxn(y-h*.5)} ${lxn(tx)} ${lxn(top)}" stroke="#8b6a4c" stroke-width="${lxn(Math.max(1.2,h*.045))}" fill="none" stroke-linecap="round"/>
    <path d="M${lxn(tx-h*.05)} ${lxn(top+h*.02)} Q${lxn(tx)} ${lxn(top+h*.14)} ${lxn(tx+h*.05)} ${lxn(top+h*.02)}" fill="#b08a5a" stroke="#8b6a4c" stroke-width=".5"/>${fr.join('')}</g>`}
// Palo verde (Arizona's state tree): green bark, low branching trunk, airy yellow-green canopy.
function lxPaloVerde(x,y,s,o={}){const id=lxId('pv');let d='';for(let i=0;i<26;i++){const a=i*2.4,r=(6+(i*7)%9)*s;d+=`<circle cx="${lxn(x+Math.cos(a)*r*1.5)}" cy="${lxn(y-24*s+Math.sin(a)*r*.6)}" r="${lxn((3+(i%3))*s)}"/>`}
  return `<g class="${o.cls||''}"><path d="M${x} ${y} C${lxn(x-1*s)} ${lxn(y-8*s)} ${lxn(x-6*s)} ${lxn(y-14*s)} ${lxn(x-12*s)} ${lxn(y-22*s)} M${lxn(x)} ${lxn(y-6*s)} C${lxn(x+4*s)} ${lxn(y-12*s)} ${lxn(x+8*s)} ${lxn(y-18*s)} ${lxn(x+13*s)} ${lxn(y-23*s)} M${lxn(x-1*s)} ${lxn(y-9*s)} L${lxn(x-1*s)} ${lxn(y-26*s)}" stroke="#7fa356" stroke-width="${lxn(1.8*s)}" fill="none" stroke-linecap="round"/>
    <g fill="#a9c45e" opacity=".85">${d}</g><g fill="#d8dc6a" opacity=".55" transform="translate(${lxn(-1.5*s)} ${lxn(-1.5*s)})">${d.split('<circle').slice(0,12).join('<circle')}</g></g>`}
function lxAgave(x,y,s){let d='';for(let i=0;i<9;i++){const a=(-170+i*20)*Math.PI/180,L=(i%2?7:9)*s;d+=`<path d="M${x} ${y} Q${lxn(x+Math.cos(a)*L*.4-1*s)} ${lxn(y+Math.sin(a)*L*.5)} ${lxn(x+Math.cos(a)*L)} ${lxn(y+Math.sin(a)*L)} Q${lxn(x+Math.cos(a)*L*.5+1*s)} ${lxn(y+Math.sin(a)*L*.4)} ${x} ${y}Z"/>`}
  return `<g fill="#8fb39a" stroke="#5e8a73" stroke-width="${lxn(.4*s)}">${d}</g>`}
function lxShrub(x,y,s,c){return `<g><ellipse cx="${x}" cy="${y}" rx="${lxn(6*s)}" ry="${lxn(3.6*s)}" fill="${c||'#9bb069'}"/><ellipse cx="${lxn(x-1.5*s)}" cy="${lxn(y-1*s)}" rx="${lxn(3.6*s)}" ry="${lxn(2*s)}" fill="#c2cf7c" opacity=".8"/>${[0,1,2].map(i=>`<circle cx="${lxn(x-3*s+i*3*s)}" cy="${lxn(y-2.6*s+(i%2)*s)}" r="${lxn(.9*s)}" fill="#f4cf3a"/>`).join('')}</g>`}
// Camelback Mountain seen from the south: the camel's head (with the Praying Monk rock) on the left, the hump on the right.
function lxCamelPath(x,y,w,h){const P=(u,v)=>`${lxn(x+u*w)} ${lxn(y-h+v*h)}`;
  return `M${P(0,1)} C${P(.06,.95)} ${P(.1,.8)} ${P(.15,.62)} C${P(.18,.48)} ${P(.22,.42)} ${P(.245,.4)} L${P(.25,.33)} L${P(.258,.4)} C${P(.29,.42)} ${P(.31,.5)} ${P(.34,.55)} C${P(.39,.6)} ${P(.43,.42)} ${P(.47,.22)} C${P(.5,.06)} ${P(.55,0)} ${P(.59,.03)} C${P(.65,.1)} ${P(.7,.3)} ${P(.76,.42)} C${P(.84,.58)} ${P(.92,.74)} ${P(1,.86)} L${P(1,1)}Z`}
function lxCamelback(x,y,w,h,o={}){return `<path d="${lxCamelPath(x,y,w,h)}" fill="${o.c||LX.mtn}" opacity="${o.op||1}"/>${o.lit?`<path d="${lxCamelPath(x,y,w,h)}" fill="${o.lit}" opacity=".5" clip-path="none" transform="translate(${lxn(w*.02)} 0) scale(1 1)"/>`:''}`}
function lxHouse(x,y,w,h,o={}){const c=o.c||'#e7cfae',r=o.r||'#b9805a';return `<g><rect x="${x}" y="${lxn(y-h)}" width="${w}" height="${h}" fill="${c}"/><rect x="${lxn(x-1)}" y="${lxn(y-h-2)}" width="${w+2}" height="2.6" fill="${r}"/>
  <rect x="${lxn(x+w*.14)}" y="${lxn(y-h*.66)}" width="${lxn(w*.24)}" height="${lxn(h*.3)}" fill="#7fa8c6"/><rect x="${lxn(x+w*.6)}" y="${lxn(y-h*.7)}" width="${lxn(w*.18)}" height="${lxn(h*.7)}" fill="#9a6a48"/></g>`}
function lxCloud(x,y,s,o={}){const c=o.c||LX.storm,l=o.l||LX.stormL;return `<g class="${o.cls||''}"><path d="M${lxn(x-20*s)} ${y} C${lxn(x-24*s)} ${lxn(y-8*s)} ${lxn(x-14*s)} ${lxn(y-13*s)} ${lxn(x-8*s)} ${lxn(y-10*s)} C${lxn(x-6*s)} ${lxn(y-20*s)} ${lxn(x+8*s)} ${lxn(y-22*s)} ${lxn(x+11*s)} ${lxn(y-12*s)} C${lxn(x+20*s)} ${lxn(y-14*s)} ${lxn(x+25*s)} ${lxn(y-5*s)} ${lxn(x+21*s)} ${y}Z" fill="${c}"/>
  <path d="M${lxn(x-8*s)} ${lxn(y-10*s)} C${lxn(x-5*s)} ${lxn(y-18*s)} ${lxn(x+6*s)} ${lxn(y-19*s)} ${lxn(x+9*s)} ${lxn(y-12*s)}" stroke="${l}" stroke-width="${lxn(1.6*s)}" fill="none" stroke-linecap="round" opacity=".8"/></g>`}
function lxRain(x0,x1,y0,y1,n,o={}){let s='';for(let i=0;i<n;i++){const x=x0+(x1-x0)*((i*.618)%1),y=y0+((i*37)%17)/17*(y1-y0)*.4;
    s+=`<path d="M${lxn(x)} ${lxn(y)} l${lxn(-(o.slant||1.2))} ${o.len||5}" stroke="${o.c||'#9cc8ee'}" stroke-width="${o.w||1}" stroke-linecap="round" class="lot-drop" style="--d:${((i*.137)%1).toFixed(2)}s;--fall:${lxn((y1-y0)*.6)}px"/>`}return `<g>${s}</g>`}
function lxSun(x,y,r,o={}){return `<g class="${o.cls||''}"><circle cx="${x}" cy="${y}" r="${lxn(r*1.7)}" fill="#ffd36a" opacity=".25"/>${[0,1,2,3,4,5,6,7].map(i=>{const a=i*Math.PI/4;return `<path d="M${lxn(x+Math.cos(a)*r*1.25)} ${lxn(y+Math.sin(a)*r*1.25)} L${lxn(x+Math.cos(a)*r*1.65)} ${lxn(y+Math.sin(a)*r*1.65)}" stroke="#ffb43a" stroke-width="${lxn(r*.18)}" stroke-linecap="round"/>`}).join('')}<circle cx="${x}" cy="${y}" r="${r}" fill="#ffc94a"/><circle cx="${lxn(x-r*.3)}" cy="${lxn(y-r*.3)}" r="${lxn(r*.35)}" fill="#fff1b8" opacity=".7"/></g>`}
// Crew robot: soft white, faceless, one Phoenix-orange stripe, low tracks, a tool arm.
function lxRobot(x,y,s,o={}){const st=o.stripe||LX.orange;return `<g class="${o.cls||''}" transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="13" ry="2.4" fill="#000" opacity=".16"/>
  <rect x="-11" y="-6" width="22" height="6" rx="3" fill="#4d4a58"/>${[-7,-2.3,2.3,7].map(cx=>`<circle cx="${cx}" cy="-3" r="1.8" fill="#8a8796"/>`).join('')}
  <rect x="-9" y="-21" width="18" height="15" rx="5" fill="#f5f6fa" stroke="#c9cdd9" stroke-width=".8"/><rect x="-9" y="-14" width="18" height="2.6" fill="${st}"/>
  <rect x="-6.5" y="-28" width="13" height="8" rx="3.4" fill="#f5f6fa" stroke="#c9cdd9" stroke-width=".8"/><rect x="-5" y="-25.6" width="10" height="2.8" rx="1.4" fill="#2c3550"/><rect x="-4.2" y="-25" width="3" height="1.2" rx=".6" fill="#7ff7e4" class="lot-blink"/>
  ${o.arm!==false?`<g class="${o.armCls||''}"><path d="M7 -17 L15 -21 L19 -14" stroke="#c9cdd9" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="7" cy="-17" r="1.6" fill="#9aa1b4"/><path d="M19 -14 l2 3 M19 -14 l-1 3.4" stroke="#7d8496" stroke-width="1.2" stroke-linecap="round"/></g>`:''}</g>`}
// Mrs. Okafor (small, with her walker) and Dev (with his board) for vignettes; feet at (x,y).
function lxOkafor(x,y,s,face,o={}){const k=s*.95,flip=o.flip?-1:1;return `<g>${mini(x,y-34*k,{skin:SKIN[4],hair:'#dcd6e0',style:'curly',outfit:'jacket',shirt:'#e0803a',pants:'#5a4a6a',s:k,face,flip:o.flip})}
  <g transform="translate(${lxn(x+flip*7*k)} ${y}) scale(${flip*k} ${k})"><path d="M0 0 L1.5 -15 L8 -15 L9 0 M1 -8 L8.5 -8" stroke="#9aa3b8" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M1.2 -15.4 h7.4" stroke="#5b6680" stroke-width="2.2" stroke-linecap="round"/><circle cx="0" cy="0" r="1.3" fill="#3a3f55"/><circle cx="9" cy="0" r="1.3" fill="#3a3f55"/></g></g>`}
function lxDev(x,y,s,face,o={}){const k=s;return `<g>${o.board!=='under'?`<g transform="translate(${lxn(x+6*k)} ${lxn(y-1*k)}) rotate(-70) scale(${k})"><rect x="-9" y="-1.6" width="18" height="3.2" rx="1.6" fill="#2a9d8f" stroke="#1d5f58" stroke-width=".6"/><circle cx="-6" cy="2.4" r="1.1" fill="#f2f2f2"/><circle cx="6" cy="2.4" r="1.1" fill="#f2f2f2"/></g>`:''}
  ${mini(x,y-34*k,{skin:SKIN[2],hair:'#1d1512',style:'short',outfit:'hoodie',shirt:'#2a9d8f',pants:'#3b4068',s:k,face,age:'kid',flip:o.flip})}
  ${o.board==='under'?`<g transform="translate(${x} ${lxn(y+1*k)}) scale(${k})"><rect x="-10" y="-1.4" width="20" height="2.8" rx="1.4" fill="#2a9d8f" stroke="#1d5f58" stroke-width=".6"/><circle cx="-6.5" cy="2.2" r="1.2" fill="#f2f2f2"/><circle cx="6.5" cy="2.2" r="1.2" fill="#f2f2f2"/></g>`:''}</g>`}
function lxSail(x0,y0,x1,y1,x2,y2,o={}){return `<path d="M${x0} ${y0} Q${lxn((x0+x1)/2)} ${lxn((y0+y1)/2+2)} ${x1} ${y1} Q${lxn((x1+x2)/2-1)} ${lxn((y1+y2)/2)} ${x2} ${y2} Q${lxn((x0+x2)/2+1)} ${lxn((y0+y2)/2-1)} ${x0} ${y0}Z" fill="${o.c||LX.sail}" stroke="${o.s||LX.sailS}" stroke-width="${o.w||.8}"/>`}
function lxBench(x,y,s){return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-7 0 V-3.4 M7 0 V-3.4" stroke="#6a5a4a" stroke-width="1.1"/><rect x="-8" y="-4.4" width="16" height="1.6" rx=".6" fill="#b07a4a"/><rect x="-8" y="-8.6" width="16" height="1.8" rx=".6" fill="#b07a4a"/><path d="M-6.6 -6.8 V-4.4 M6.6 -6.8 V-4.4" stroke="#6a5a4a" stroke-width=".9"/></g>`}

// ---------- Future Table vignettes (side view; viewBox 0 0 120 90) ----------
// The current plan (S.choice) decides what is drawn; the kind decides the weather, the water and the faces.
function lotVignette(kind){const c=(typeof S!=='undefined'&&S.choice)||{design:'bowl',depth:'shallow',drain:'std',shade:'none'},d=lotSpec(c.design),K=d.kind,deep=c.depth==='deep';
  const id=lxId('lv'),G=60,L0=30,L1=94,storm=['held','overflow','late','slowgate','nogate','unsigned','storm'].includes(kind);
  const flooded=['overflow','late','slowgate','nogate'].includes(kind),full=['held','overflow','unsigned'].includes(kind);
  let s=`<defs><linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${storm?'#4d5878':LX.sky}"/><stop offset="1" stop-color="${storm?'#a9a3a8':LX.skyL}"/></linearGradient>
    <linearGradient id="${id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${LX.waterL}"/><stop offset="1" stop-color="${LX.waterD}"/></linearGradient></defs>
    <rect width="120" height="90" fill="url(#${id}s)"/>${lxCamelback(18,47,74,15,{c:storm?'#7d5a64':LX.mtn,op:storm?.75:.9})}
    <path d="M0 47 H120 V60 H0Z" fill="${storm?'#8a8a7a':'#c9b48a'}" opacity=".5"/>`;
  if(storm)s+=lxCloud(36,16,1.1,{c:'#3e4663',l:'#6f7896'})+lxCloud(84,12,1.3,{c:'#353c58',l:'#646d8c'})+lxRain(4,116,16,74,26,{c:'#c6dcf2'});
  if(kind==='late'||kind==='slowgate')s+=`<path class="lot-flash" d="M70 14 l-5 10 h4 l-4 9 l9 -12 h-4 l4 -7z" fill="#fff4b0"/>`;
  // houses across the street (left) and Mrs. Okafor's grapefruit tree behind the alley wall (right)
  s+=lxHouse(-4,G,22,12,{c:'#e3c9a6'})+lxPalm(14,G-10,26,{lean:2})+`<circle cx="112" cy="41" r="7" fill="#5f9a4a"/><circle cx="108" cy="44" r="5" fill="#4d8740"/>${[0,1,2,3].map(i=>`<circle cx="${107+i*3}" cy="${41+(i%2)*4}" r="1.3" fill="#f3d35a"/>`).join('')}`;
  // ground: street (left), the lot, the alley wall (right)
  s+=`<path d="M0 ${G+2} H${L0} V90 H0Z" fill="${LX.asph}"/><path d="M${L0-2} ${G-1} h3 v4 h-3z" fill="${LX.concD}"/><path d="M0 ${G+2} H${L0}" stroke="${LX.asphL}" stroke-width=".8" stroke-dasharray="4 3"/>
    <path d="M${L0} ${G} H120 V90 H${L0}Z" fill="${LX.dirt}"/><path d="M${L0} ${G} H120" stroke="${LX.sandL}" stroke-width="1.2"/>
    <rect x="98" y="${G-14}" width="8" height="14" fill="${LX.block}"/>${[0,1,2,3].map(i=>`<path d="M98 ${G-14+i*3.5} h8" stroke="${LX.blockD}" stroke-width=".4"/>`).join('')}`;
  s+=lxSaguaro(L0+4,G,26,{arms:[[-1,.45,.22],[1,.58,.2]]});
  // the design, cut open
  const hole=K==='bowl'?(deep?20:13):K==='garden'?(deep?13:9):K==='lawn'?(deep?6:4):K==='split'?0:0,bx0=40,bx1=K==='garden'?90:84;
  const bowlPath=`M${bx0} ${G} C${bx0+3} ${G+hole} ${bx0+8} ${G+hole} ${(bx0+bx1)/2} ${G+hole} C${bx1-8} ${G+hole} ${bx1-3} ${G+hole} ${bx1} ${G}Z`;
  if(kind==='late'){s+=`<path d="M42 ${G} C46 ${G+9} 52 ${G+11} 62 ${G+10} C70 ${G+9} 74 ${G+4} 78 ${G}Z" fill="${LX.dirtD}"/><path d="M44 ${G} C48 ${G+7} 70 ${G+8} 76 ${G}" fill="#6a4a2a" opacity=".6"/>
      ${[50,74].map(x=>`<path d="M${x-2.4} ${G} l2.4 -6 l2.4 6z" fill="${LX.orange}"/><path d="M${x-1.4} ${G-2.4} h2.8" stroke="#fff" stroke-width=".8"/>`).join('')}${lxRobot(86,G,.5,{arm:false})}
      <path d="M44 ${G+6} C52 ${G+9} 66 ${G+9} 74 ${G+6} L74 ${G+8} C66 ${G+11} 52 ${G+11} 44 ${G+8}Z" fill="${LX.water}" opacity=".7"/>`}
  else if(hole>0){s+=`<path d="${bowlPath}" fill="${K==='garden'?'#a98a5c':LX.concD}"/><path d="M${bx0} ${G} C${bx0+3} ${G+hole} ${bx0+8} ${G+hole} ${(bx0+bx1)/2} ${G+hole} C${bx1-8} ${G+hole} ${bx1-3} ${G+hole} ${bx1} ${G}" stroke="${K==='garden'?'#8a6c44':'#f3efe7'}" stroke-width="1.6" fill="none"/>`;
    if(K==='garden')s+=[0,1,2,3,4].map(i=>lxAgave(46+i*9.5,G+hole*(i%4?.8:.45)-1,.38)).join('');
    if(K==='bowl')s+=`<path d="M${bx0-1} ${G} h3 M${bx1-2} ${G} h3" stroke="#9aa0ad" stroke-width="2"/>`;
    if(full)s+=`<clipPath id="${id}c"><path d="${bowlPath}"/></clipPath><g clip-path="url(#${id}c)"><rect x="${bx0}" y="${G+1}" width="${bx1-bx0}" height="${hole}" fill="url(#${id}w)" class="lot-fillup"/><path class="lot-wave" d="M${bx0-6} ${G+1.5} q3 -1.4 6 0 t6 0 t6 0 t6 0 t6 0 t6 0 t6 0 t6 0 t6 0 t6 0" stroke="#d7f1ff" stroke-width=".8" fill="none"/></g>`}
  else if(K==='split'){s+=`<rect x="40" y="${G-1}" width="24" height="2" fill="${LX.conc}"/><rect x="44" y="${G+5}" width="40" height="${deep?14:10}" rx="3" fill="#6d6a74" opacity=".55" stroke="#4d4a55" stroke-dasharray="2 1.4" stroke-width=".6"/>
      ${full?`<rect x="45" y="${G+6}" width="38" height="${deep?12:8}" rx="2.4" fill="url(#${id}w)" class="lot-fillup"/>`:''}${lxAgave(72,G-1,.4)+lxAgave(80,G-1,.32)}`}
  else{s+=`<rect x="38" y="${G-1.4}" width="52" height="2.4" fill="${K==='lawn'?'#6fae4e':LX.conc}"/>`;
    if(K==='skate')s+=`<rect x="50" y="${G-5}" width="12" height="4" fill="${LX.concD}"/><path d="M66 ${G-6} h14 M68 ${G-6} v5 M78 ${G-6} v5" stroke="#8a8f9e" stroke-width="1"/>`;
    if(K==='lawn')s+=`<path d="M58 ${G-1} l5 -12 l5 12 M60 ${G-6} h6" stroke="#c0503a" stroke-width="1.1" fill="none"/><path d="M63 ${G-11} v6" stroke="#555" stroke-width=".5"/><rect x="61.4" y="${G-5.4}" width="3.2" height="1" fill="#333"/>`;
    if(K==='smart')s+=`<path d="M44 ${G} v-12 a5 5 0 0 1 10 0 v12" stroke="#7d8496" stroke-width="1.6" fill="none"/><circle cx="49" cy="${G-14}" r="1.8" fill="${LX.teal}" class="lot-blink"/><path d="M76 ${G} v-16 l4 -1" stroke="#7d8496" stroke-width="1"/><rect x="79" y="${G-18}" width="5" height="3" rx="1" fill="#3a3f55"/><rect x="62" y="${G-8}" width="7" height="8" rx="2" fill="#f5f6fa" stroke="#c9cdd9" stroke-width=".5"/>`;
    if(full&&K!=='skate')s+=`<rect x="44" y="${G-1}" width="${K==='lawn'?40:20}" height="1.4" fill="${LX.water}" opacity=".7"/>`}
  // terrace, benches and shade on the alley side
  if(d.okafor&&kind!=='late'){s+=`<path d="M84 ${G} h14 v-3 h-14z" fill="${LX.conc}"/>`+lxBench(91,G-3,.55);if(d.okafor&&lotSpec(c.design).okafor)s+=`<path d="M84 ${G-3} L80 ${G}" stroke="${LX.concD}" stroke-width="1.2"/>`}
  if(c.shade!=='none'&&kind!=='late'){s+=`<path d="M86 ${G-3} v-15 M97 ${G-3} v-18" stroke="#6a6f80" stroke-width=".9"/>`+lxSail(84,G-17,97,G-21,92,G-12);
    if(c.shade==='grove')s+=lxPaloVerde(72,G,.62)}
  // water in the street, and the alley ditch
  if(flooded)s+=`<path d="M0 ${G-2.4} H${L0+2} V${G+3} H0Z" fill="${LX.water}" opacity=".78" class="lot-slosh"/><path d="M2 ${G-2.4} q4 -1 8 0 t8 0 t8 0" stroke="#d7f1ff" stroke-width=".7" fill="none"/>
    <g transform="translate(9 ${G-2})"><rect x="-6" y="-5" width="12" height="4.6" rx="1.6" fill="#e5484d"/><rect x="-4" y="-7.4" width="7" height="3" rx="1.2" fill="#e5484d"/><rect x="-3.2" y="-7" width="2.4" height="2" fill="#bfe3ff"/></g>`;
  if(kind==='overflow')s+=`<path d="M${bx0} ${G-1} C36 ${G-1} 34 ${G+1} 30 ${G+1}" stroke="${LX.water}" stroke-width="2.4" fill="none" stroke-linecap="round" class="lot-spill"/>`;
  if(kind==='slowgate'||kind==='nogate')s+=`<rect x="${L0}" y="${G-7}" width="2.4" height="8" fill="${kind==='nogate'?'#8a8f9e':LX.red}"/>`;
  if(kind==='slowgate')s+=`<g transform="translate(58 30)"><circle r="8" fill="#fff" stroke="${LX.ink}" stroke-width="1"/><path d="M0 0 V-5 M0 0 L3.4 1.4" stroke="${LX.ink}" stroke-width="1.2" stroke-linecap="round"/><g class="lot-ring"><path d="M10 -6 q3 3 0 6 M12.6 -8 q5 5 0 10" stroke="#fff" stroke-width="1" fill="none"/></g></g>`;
  if(kind==='unsigned')s+=`<path d="M100 ${G+5} H120" stroke="#8a8f9e" stroke-width="3"/><path d="M100 ${G+5} L94 ${G+5}" stroke="${LX.water}" stroke-width="2"/><g class="lot-pulse"><circle cx="102" cy="${G+12}" r="5" fill="${LX.orange}"/><path d="M102 ${G+9} v3.6" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/><circle cx="102" cy="${G+14.6}" r=".9" fill="#fff"/></g>`;
  // the neighbors' faces carry the verdict
  const calm=kind==='storm',okFace=calm?undefined:kind==='held'?(d.okafor&&c.shade!=='none'?'happy':'sad'):kind==='overflow'?'happy':'sad',
    devFace=calm?undefined:kind==='late'||kind==='slowgate'?'sad':(K==='bowl'&&deep&&d.dev!==false)||K==='skate'||(K==='split'&&deep&&d.dev!==false)?'happy':'sad',inBowl=K==='bowl'&&kind==='nogate';
  s+=lxDev(inBowl?62:22,inBowl?G+hole-1:G,.42,devFace,{board:'under'})+lxOkafor(108,G,.44,okFace,{flip:true});
  if(c.shade==='none'&&d.okafor&&kind==='held')s+=lxSun(106,14,4.4);
  return `<svg viewBox="0 0 120 90" class="vig lot-vig"><clipPath id="${id}k"><rect width="120" height="90" rx="10"/></clipPath><g clip-path="url(#${id}k)">${s}</g></svg>`}

// ---------- isometric dioramas for the option cards (viewBox 0 0 300 180) ----------
// Lot coordinates: x 0..100 along the street (screen right-down), y 0..70 from the alley (back) to the street (front), z up.
function lxIso(k=1.55,ox=136,oy=18){const c=.866*k,h=.5*k;const P=(x,y,z=0)=>[lxn(ox+(x-y)*c),lxn(oy+(x+y)*h-z*k)];P.k=k;return P}
function lxPoly(P,pts,z=0){return 'M'+pts.map(([x,y,zz])=>P(x,y,zz??z).join(' ')).join(' L')+'Z'}
// a rounded-rectangle ring (superellipse) in the lot plane
function lxRing(cx,cy,rx,ry,n=40,pw=4){const o=[];for(let i=0;i<n;i++){const t=i/n*Math.PI*2,c=Math.cos(t),s=Math.sin(t);o.push([cx+rx*Math.sign(c)*Math.pow(Math.abs(c),2/pw),cy+ry*Math.sign(s)*Math.pow(Math.abs(s),2/pw)])}return o}
function lotDiorama(o){const P=lxIso(),id=lxId('dio'),K=o.kind||'bowl',deep=o.depth==='deep',shade=o.shade||'none',knows=typeof S!=='undefined'&&!!S.told,st=o.stage??3,live=st===3&&!o.night;
  const g=(x,y,z)=>P(x,y,z).join(' ');let s=`<defs><linearGradient id="${id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${LX.waterL}"/><stop offset="1" stop-color="${LX.water}"/></linearGradient>
    <linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9c958a"/><stop offset="1" stop-color="#cfc8bc"/></linearGradient>
    <radialGradient id="${id}g" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#fff9ec"/><stop offset="1" stop-color="#f3e2c4"/></radialGradient></defs>
    <ellipse cx="150" cy="150" rx="140" ry="26" fill="url(#${id}g)"/>`;
  // base slab with soil sides, the street along the front-left edge and a slump-block wall at the back-right
  const T=8;s+=`<path d="${lxPoly(P,[[0,82],[100,82],[100,82,-T],[0,82,-T]])}" fill="#7d6a58"/><path d="${lxPoly(P,[[100,0],[100,82],[100,82,-T],[100,0,-T]])}" fill="#9a8269"/>
    <path d="${lxPoly(P,[[0,0],[100,0],[100,70],[0,70]])}" fill="${K==='lawn'?'#86b862':'#e2c99a'}"/>
    <path d="${lxPoly(P,[[0,70],[100,70],[100,82],[0,82]])}" fill="${LX.asph}"/><path d="${lxPoly(P,[[0,70],[100,70],[100,71.6],[0,71.6]])}" fill="${LX.conc}"/>
    <path d="M${g(0,77)} L${g(100,77)}" stroke="#d7d0b0" stroke-width="1" stroke-dasharray="5 4"/>
    <path d="${lxPoly(P,[[16,70.6,.4],[22,70.6,.4],[22,71.4,.4],[16,71.4,.4]])}" fill="#3a3a44"/>`;
  if(K!=='lawn')s+=Array.from({length:30},(_,i)=>{const x=(i*37)%100,y=(i*53)%68+1;return `<circle cx="${P(x,y)[0]}" cy="${P(x,y)[1]}" r=".7" fill="#c9a874" opacity=".7"/>`}).join('');
  s+=`<path d="${lxPoly(P,[[0,0,0],[100,0,0],[100,0,7],[0,0,7]])}" fill="${LX.block}"/><path d="${lxPoly(P,[[0,0,7],[100,0,7],[100,1.6,7],[0,1.6,7]])}" fill="#e9d6b6"/>
    ${[2,4.5].map(z=>`<path d="M${g(0,0,z)} L${g(100,0,z)}" stroke="${LX.blockD}" stroke-width=".5"/>`).join('')}`;
  if(knows)s+=`<path d="M${g(70,0,1)} L${g(70,10,1)}" stroke="#8a8f9e" stroke-width="3.2"/><path class="lot-flowdash" d="M${g(70,-6,1)} L${g(70,12,.5)}" stroke="${LX.water}" stroke-width="1.6" stroke-dasharray="3 3"/>`;
  // the main feature
  const bowl=(cx,cy,rx,ry,dep,col,water)=>{const rim=lxRing(cx,cy,rx,ry),flo=lxRing(cx,cy,rx*.62,ry*.6),cid=lxId('bc'),dug=st===1;if(dug)col=LX.dirtD;
    return `<clipPath id="${cid}"><path d="${lxPoly(P,rim)}"/></clipPath><path d="${lxPoly(P,rim)}" fill="${dug?LX.dirt:'url(#'+id+'b)'}"/>
      <g clip-path="url(#${cid})"><path d="${lxPoly(P,flo,-dep)}" fill="${col}"/>${water?`<path d="${lxPoly(P,lxRing(cx,cy,rx*.86,ry*.84),-dep*.35)}" fill="url(#${id}w)" opacity=".92" class="lot-shimmer"/>`:''}</g>
      ${dug?'':`<path d="${lxPoly(P,rim)}" fill="none" stroke="#f6f2ea" stroke-width="2.2"/><path d="${lxPoly(P,rim)}" fill="none" stroke="#9aa0ad" stroke-width=".7"/>`}`};
  if(K==='bowl'&&st>=1){s+=bowl(44,44,deep?26:24,deep?20:18,deep?30:18,o.tame?'#d4cdc2':'#c9c2b6');
    if(st>=2)s+=`<path d="M${g(44,44,deep?-30:-18)} m-6 0 a6 3 0 1 0 12 0 a6 3 0 1 0 -12 0" fill="#7c7684"/>`;
    if(!o.tame&&live)s+=`<g class="lot-roll">${lxDev(...P(40,40,deep?-14:-9),.55,'happy',{board:'under'})}</g>`}
  if(K==='garden'&&st>=1){s+=bowl(48,42,32,22,deep?16:10,'#b99a68');if(st>=2){const fl=[[36,40],[52,34],[58,48],[42,52],[48,42],[62,40],[34,46]];
    s+=fl.map(([x,y],i)=>i%2?lxAgave(...P(x,y,deep?-10:-6),.7):lxShrub(...P(x,y,deep?-10:-6),.7)).join('');
    s+=`<path d="${lxPoly(P,lxRing(48,42,38,27),0)}" fill="none" stroke="#a7a1a6" stroke-width="4.6" opacity=".9"/><path d="${lxPoly(P,lxRing(48,42,38,27),0)}" fill="none" stroke="#c9c3c8" stroke-width="2.6"/>`}}
  if(K==='split'&&st===1)s+=`<path d="${lxPoly(P,[[40,22],[90,22],[90,60],[40,60]])}" fill="${LX.dirtD}"/><path d="${lxPoly(P,[[40,22,0],[90,22,0],[90,22,-8],[40,22,-8]])}" fill="#6e4c2c"/>`;
  if(K==='split'&&st>=2){s+=`<path d="${lxPoly(P,[[4,10],[50,10],[50,66],[4,66]],.5)}" fill="${LX.concL}" stroke="${LX.concD}" stroke-width=".5"/>${[16,28,40].map(x=>`<path d="M${g(x,10,.5)} L${g(x,66,.5)}" stroke="${LX.concD}" stroke-width=".4"/>`).join('')}
      <path d="${lxPoly(P,[[12,48,0],[34,48,0],[34,52,0],[12,52,0]],4)}" fill="#cfc8bc"/><path d="${lxPoly(P,[[12,52,0],[34,52,0],[34,52,4],[12,52,4]])}" fill="#a9a196"/>
      <path d="${lxPoly(P,[[54,12],[96,12],[96,66],[54,66]],.3)}" fill="#c7b183"/><ellipse cx="${P(75,40)[0]}" cy="${P(75,40)[1]}" rx="7" ry="3.6" fill="#6d6a74" stroke="#4d4a55"/><path d="M${P(75,40)[0]-4} ${P(75,40)[1]} h8" stroke="#4d4a55" stroke-width=".6"/>
      ${[[62,20],[88,22],[60,58],[90,56],[78,62]].map(([x,y],i)=>i%2?lxAgave(...P(x,y),.7):lxShrub(...P(x,y),.75)).join('')}${deep?bowl(28,30,12,10,10,'#c9c2b6'):''}
      ${live?`<g class="lot-roll">${lxDev(...P(20,40,.5),.5,'happy',{board:'under'})}</g>`:''}`}
  if(K==='skate'&&st>=2){s+=`<path d="${lxPoly(P,[[6,6],[94,6],[94,68],[6,68]],.4)}" fill="${LX.concL}"/>${[[20,20,16,8,5],[62,40,22,6,4]].map(([x,y,w,d,h])=>`<path d="${lxPoly(P,[[x,y],[x+w,y],[x+w,y+d],[x,y+d]],h)}" fill="#cfc8bc"/><path d="${lxPoly(P,[[x,y+d,0],[x+w,y+d,0],[x+w,y+d,h],[x,y+d,h]])}" fill="#a9a196"/><path d="${lxPoly(P,[[x+w,y,0],[x+w,y+d,0],[x+w,y+d,h],[x+w,y,h]])}" fill="#bdb5a9"/>`).join('')}
      <path d="M${g(30,52,6)} L${g(56,52,6)} M${g(32,52,0)} L${g(32,52,6)} M${g(54,52,0)} L${g(54,52,6)}" stroke="#7d8496" stroke-width="1.4"/>${live?`<g class="lot-roll">${lxDev(...P(48,30,.4),.55,'happy',{board:'under'})}</g>`:''}`}
  if(K==='lawn'&&st>=2){s+=Array.from({length:8},(_,i)=>`<path d="M${g(4+i*12,4)} L${g(4+i*12+6,4)} L${g(4+i*12+6,66)} L${g(4+i*12,66)}Z" fill="#9ccb72" opacity=".5"/>`).join('');
      s+=`<path d="M${g(60,30,0)} L${g(64,30,16)} L${g(68,30,0)} M${g(60,46,0)} L${g(64,46,16)} L${g(68,46,0)} M${g(64,30,16)} L${g(64,46,16)}" stroke="#c0503a" stroke-width="1.6" fill="none"/><path d="M${g(64,36,16)} L${g(64,36,5)} M${g(64,40,16)} L${g(64,40,5)}" stroke="#555" stroke-width=".6"/><path d="M${g(64,35,5)} L${g(64,41,5)}" stroke="#333" stroke-width="1.6"/>
        <g class="lot-spray"><path d="M${g(30,30,0)} q-6 -12 -12 -2 M${g(30,30,0)} q6 -12 12 -2" stroke="${LX.waterL}" stroke-width="1" fill="none"/></g>`}
  if(K==='smart'&&st>=2){s+=`<path d="${lxPoly(P,[[6,6],[94,6],[94,64],[6,64]],.4)}" fill="#e9e5df"/>${[10,30,50,70,90].map(x=>`<path d="M${g(x,64,0)} L${g(x,64,6)}" stroke="#7d8496" stroke-width=".8"/>`).join('')}<path d="M${g(6,64,6)} L${g(94,64,6)}" stroke="#7d8496" stroke-width=".8"/>
      <path d="M${g(40,64,0)} L${g(40,64,14)} Q${g(46,64,20)} ${g(52,64,14)} L${g(52,64,0)}" stroke="#5d6680" stroke-width="2.4" fill="none"/><circle cx="${P(46,64,17)[0]}" cy="${P(46,64,17)[1]}" r="2.4" fill="${LX.teal}" class="lot-blink"/>
      ${[[14,14],[86,20]].map(([x,y])=>`<path d="M${g(x,y,0)} L${g(x,y,24)}" stroke="#7d8496" stroke-width="1"/><rect x="${P(x,y,24)[0]-1}" y="${P(x,y,24)[1]-2}" width="6" height="3.4" rx="1" fill="#3a3f55"/><circle cx="${P(x,y,24)[0]+5}" cy="${P(x,y,24)[1]-.4}" r=".9" fill="${LX.red}" class="lot-blink"/>`).join('')}
      ${lxRobot(...P(66,34),.7,{arm:false,stripe:LX.teal})}`}
  // terrace with benches (and a ramp) along the back; shade above it
  const hasSeats=K==='bowl'||K==='garden'||K==='split'||K==='lawn'||K==='smart';
  if(K==='bowl'&&st>=2){s+=`<path d="${lxPoly(P,[[74,4],[98,4],[98,66],[74,66]],3)}" fill="${LX.concL}"/><path d="${lxPoly(P,[[74,66,0],[98,66,0],[98,66,3],[74,66,3]])}" fill="${LX.concD}"/><path d="${lxPoly(P,[[74,4,0],[74,66,0],[74,66,3],[74,4,3]])}" fill="#cbc3b6"/>`;
    if(o.ramp)s+=`<path d="${lxPoly(P,[[76,66,0],[86,66,0],[86,56,3],[76,56,3]])}" fill="#e6dfd4" stroke="#b4ab9c" stroke-width=".5"/>`;else s+=[0,1,2].map(i=>`<path d="${lxPoly(P,[[76+i*3,66],[79+i*3,66],[79+i*3,56],[76+i*3,56]],i)}" fill="#d2cabd" stroke="#a69d90" stroke-width=".4"/>`).join('')}
  if(hasSeats&&st===3)s+=[[86,18],[86,34]].concat(K==='garden'?[[24,64]]:[]).map(([x,y])=>{const p=P(x,y,K==='bowl'?3:0);return lxBench(p[0],p[1],.9)}).join('');
  if(shade!=='none'&&st===3){const z0=K==='bowl'?3:0,sp=[[80,10],[96,12],[94,40],[78,44]];s+=`<path d="${lxPoly(P,[[80,16],[96,18],[90,36]],z0)}" fill="#000" opacity=".12"/>`;
    s+=sp.map(([x,y])=>`<path d="M${g(x,y,z0)} L${g(x,y,z0+26)}" stroke="#6a6f80" stroke-width="1.2"/>`).join('');
    s+=`<path d="M${g(80,10,z0+24)} Q${g(88,16,z0+22)} ${g(96,12,z0+26)} Q${g(92,24,z0+22)} ${g(94,40,z0+24)} Q${g(86,24,z0+20)} ${g(80,10,z0+24)}Z" fill="${LX.sail}" stroke="${LX.sailS}"/>
      <path d="M${g(78,44,z0+22)} Q${g(86,40,z0+20)} ${g(94,40,z0+24)} Q${g(88,52,z0+20)} ${g(86,62,z0+22)}Z" fill="#ffe2c6" stroke="${LX.sailS}"/>`;
    if(shade==='grove')s+=[[10,12],[30,8],[96,64]].map(([x,y])=>lxPaloVerde(...P(x,y),1)).join('')}
  s+=lxSaguaro(...P(6,62),30,{});
  if(o.night){s+=`<rect width="300" height="180" fill="#0b1238" opacity=".52"/>${[0,1,2,3,4,5,6,7,8,9,10,11].map(i=>`<circle cx="${(i*97)%300}" cy="${(i*41)%30+4}" r=".9" fill="#fff" opacity=".8"/>`).join('')}`;
    const bots=[[34,40],[62,52],[84,24]];s+=bots.map(([x,y],i)=>{const p=P(x,y);return `<ellipse cx="${p[0]}" cy="${p[1]}" rx="34" ry="16" fill="#fff2b8" opacity=".22"/><g class="lot-bot" style="--d:${i*.7}s">${lxRobot(p[0],p[1],.75,{armCls:'lot-arm'})}</g>`}).join('')}
  return `<svg class="lot-dio" viewBox="0 0 300 180" role="img" aria-label="${esc(lotSpec(o.design).name)} model">${s}</svg>`}

// ---------- red-team cartoons (viewBox 0 0 300 170) ----------
function lotRedTeamSVG(k){const G=128;let s=`<rect width="300" height="170" rx="14" fill="${k==='bowl'?'#2a3158':'#bfe0f4'}"/>`;
  const ground=c=>`<path d="M0 ${G} H300 V170 H0Z" fill="${c||LX.dirt}"/><path d="M0 ${G} H300" stroke="${LX.sandL}" stroke-width="1.4"/>`;
  if(k==='bowl'){s+=`${[0,1,2,3,4,5,6,7,8].map(i=>`<circle cx="${(i*67)%300}" cy="${8+(i*29)%40}" r="1" fill="#fff" opacity=".7"/>`).join('')}${lxCloud(220,40,1.6,{c:'#1d2240',l:'#4a5278',cls:'lot-cloudin'})}`+ground('#6b5a48')+
      `<path d="M90 ${G} C96 ${G+30} 110 ${G+32} 150 ${G+32} C190 ${G+32} 204 ${G+30} 210 ${G}Z" fill="#7d7686"/><path d="M90 ${G} C96 ${G+30} 110 ${G+32} 150 ${G+32} C190 ${G+32} 204 ${G+30} 210 ${G}" stroke="#d6d1c8" stroke-width="2" fill="none"/>
      <clipPath id="rtb"><path d="M90 ${G} C96 ${G+30} 110 ${G+32} 150 ${G+32} C190 ${G+32} 204 ${G+30} 210 ${G}Z"/></clipPath><g clip-path="url(#rtb)"><rect x="90" y="${G}" width="120" height="34" fill="${LX.water}" class="lot-rt-fill"/></g>
      <g class="lot-rt-skater">${lxDev(150,G+30,.9,'happy',{board:'under'})}</g>
      <path d="M60 ${G} v-52" stroke="#9aa1b4" stroke-width="3"/><g class="lot-rt-light"><circle cx="60" cy="${G-56}" r="7" fill="#ffcf4a"/><circle cx="60" cy="${G-56}" r="16" fill="#ffcf4a" opacity=".3"/></g>
      <g class="lot-rt-horn">${lxT(92,G-58,'BEEP!',{s:14,c:'#ffcf4a'})}</g>
      <g transform="translate(232 ${G})"><rect x="-10" y="-30" width="20" height="30" rx="4" fill="#3d4466"/><circle cx="0" cy="-20" r="5" fill="${LX.red}" class="lot-rt-pause"/>${lxT(0,-6,'PAUSE',{s:6,c:'#fff'})}</g>`}
  else if(k==='garden'){s+=ground()+`<path d="M60 ${G} C70 ${G+22} 110 ${G+26} 150 ${G+26} C190 ${G+26} 230 ${G+22} 240 ${G}Z" fill="#a98a5c"/><rect x="138" y="${G+20}" width="24" height="5" rx="1" fill="#4d4a55"/>${[0,1,2,3].map(i=>`<path d="M${140+i*6} ${G+20} v5" stroke="#8a8796" stroke-width="1"/>`).join('')}
      <g class="lot-rt-leaves">${[0,1,2,3,4,5,6].map(i=>`<path d="M${40+i*30} ${50+(i%3)*12} q4 -3 8 0 q-4 3 -8 0z" fill="${['#b9a24a','#8fae55','#d0a03a'][i%3]}" class="lot-leaf" style="--d:${i*.3}s"/>`).join('')}</g>
      <rect x="62" y="${G+8}" width="176" height="18" fill="${LX.water}" opacity=".75" class="lot-rt-pond"/><g class="lot-rt-bot">${lxRobot(260,G,.9,{})}</g>`}
  else if(k==='split'){s+=ground()+`<rect x="70" y="${G+6}" width="160" height="30" rx="6" fill="#6d6a74"/><rect x="74" y="${G+10}" width="152" height="22" rx="4" fill="${LX.water}"/>
      <g transform="translate(110 ${G-14})"><rect x="-14" y="-12" width="28" height="22" rx="5" fill="#9aa1b4"/><circle cx="0" cy="-1" r="7" fill="#5d6680"/><path d="M-4 -5 l8 8 M4 -5 l-8 8" stroke="${LX.red}" stroke-width="2.6" stroke-linecap="round" class="lot-blink"/></g>
      <path d="M110 ${G-2} V${G+10}" stroke="#5d6680" stroke-width="4"/><g class="lot-cloudin">${lxCloud(230,44,1.4)}</g>${lxT(230,74,'Next storm',{s:11,c:LX.ink})}
      <g transform="translate(190 ${G-14})" class="lot-rt-pump2"><rect x="-14" y="-12" width="28" height="22" rx="5" fill="#cfe9d9" stroke="${LX.teal}" stroke-dasharray="3 2"/>${lxT(0,3,'+1',{s:12,c:LX.teal})}</g>`}
  else if(k==='skate'){s+=lxCloud(150,30,1.6)+lxRain(70,230,30,120,30)+ground()+`<rect x="90" y="${G-4}" width="120" height="5" fill="${LX.conc}"/><path class="lot-flowdash" d="M200 ${G-6} C230 ${G-8} 250 ${G-4} 290 ${G-2}" stroke="${LX.water}" stroke-width="2.4" fill="none" stroke-dasharray="6 5"/>
      <path d="M240 ${G} H300 V${G+6} H240Z" fill="${LX.asph}"/><rect x="240" y="${G-5}" width="60" height="5" fill="${LX.water}" class="lot-rt-rise"/>`}
  else if(k==='lawn'){s+=lxSun(250,36,14)+ground('#86b862')+`<g transform="translate(150 ${G})"><path d="M0 0 v-8" stroke="#666" stroke-width="2"/><g class="lot-spray">${[-1,1].map(d=>`<path d="M0 -8 q${d*30} -40 ${d*60} -4" stroke="${LX.waterL}" stroke-width="1.6" fill="none" stroke-dasharray="3 3"/>`).join('')}</g></g>
      <g transform="translate(56 70)"><path d="M-16 -26 h32 v40 a6 6 0 0 1 -6 6 h-20 a6 6 0 0 1 -6 -6z" fill="#cfe9f7" stroke="#6aa3c8" stroke-width="2"/><rect x="-14" y="-12" width="28" height="30" rx="3" fill="${LX.water}" class="lot-rt-jug"/>${lxT(0,-30,'gallons',{s:10,c:LX.ink})}</g>`}
  else if(k==='smart'){s+=ground(LX.conc)+`<path d="M110 ${G} v-50 q20 -22 40 0 v50" stroke="#5d6680" stroke-width="6" fill="none"/><circle cx="130" cy="${G-62}" r="6" fill="${LX.teal}" class="lot-blink"/>
      <g class="lot-rt-scan"><path d="M130 ${G-58} L104 ${G-20} L156 ${G-20}Z" fill="${LX.teal}" opacity=".22"/></g>
      <g class="lot-rt-walk">${mini(0,G-34,{who:'pip',s:1})}${mini(22,G-34,{who:'jory',s:1})}<g transform="translate(-6 ${G-48})"><rect x="0" y="0" width="14" height="4" rx="2" fill="#1d1d1d"/></g><g transform="translate(16 ${G-60})"><rect x="0" y="0" width="14" height="4" rx="2" fill="#1d1d1d"/></g></g>
      <path d="M230 ${G} v-60" stroke="#7d8496" stroke-width="2.4"/><rect x="228" y="${G-68}" width="16" height="9" rx="2" fill="#3a3f55"/><circle cx="240" cy="${G-64}" r="2" fill="${LX.red}" class="lot-blink"/>
      ${lxRobot(200,G,1,{arm:false,stripe:LX.teal})}<path class="lot-flowdash" d="M236 ${G-60} C220 ${G-90} 120 ${G-100} 40 ${G-80}" stroke="${LX.red}" stroke-width="1.6" fill="none" stroke-dasharray="4 4"/>`}
  return `<svg class="lot-rt" viewBox="0 0 300 170">${s}</svg>`}

// ---------- small icons ----------
function lotMakeIconSVG(k){let s='';
  if(k==='design')s=`<rect x="8" y="10" width="48" height="40" rx="4" fill="#1f4f8f"/>${[16,24,32,40,48].map(x=>`<path d="M${x} 10 V50" stroke="#3d6aa8" stroke-width=".6"/>`).join('')}<path d="M14 36 C20 22 44 22 50 36" stroke="#bfe3ff" stroke-width="2" fill="none"/><path d="M14 36 H50" stroke="#bfe3ff" stroke-width="1.2"/><path d="M40 18 l6 -6 l4 4 l-6 6z" fill="${LX.gold}"/><path d="M12 54 h40" stroke="#c9a06a" stroke-width="4" stroke-linecap="round"/>`;
  if(k==='texts')s=`<rect x="18" y="6" width="28" height="50" rx="6" fill="#2a2f4a"/><rect x="21" y="12" width="22" height="36" rx="2" fill="#e8f2ff"/><rect x="23" y="16" width="18" height="10" rx="3" fill="${LX.red}"/><path d="M32 18 l-4 6 h8z" fill="#fff"/><path d="M24 31 h16 M24 35 h12 M24 39 h14" stroke="#9aa3b8" stroke-width="1.4"/>`;
  if(k==='fence')s=`<path d="M6 50 H58" stroke="#8a6a4a" stroke-width="2"/>${[10,20,30,40,50].map(x=>`<path d="M${x} 52 V22 l3 -4 l3 4 V52" fill="#c9a26b" stroke="#8a6a4a" stroke-width="1"/>`).join('')}<path d="M8 30 H58 M8 42 H58" stroke="#8a6a4a" stroke-width="2"/><rect x="14" y="20" width="36" height="14" rx="2" fill="${LX.red}"/>${lxT(32,30,'KEEP OUT',{s:6.4,c:'#fff'})}`;
  if(k==='bags')s=`<rect x="36" y="12" width="20" height="40" rx="2" fill="#9a6a48"/><circle cx="51" cy="33" r="1.4" fill="${LX.gold}"/>${[[8,46],[22,46],[15,38],[8,30],[22,30]].map(([x,y])=>`<path d="M${x} ${y} h14 q2 4 0 8 h-14 q-2 -4 0 -8z" fill="#d8c08c" stroke="#a88a5a" stroke-width="1"/>`).join('')}<path d="M0 54 H64" stroke="${LX.water}" stroke-width="3"/>`;
  return `<svg viewBox="0 0 64 60">${s}</svg>`}
function lotCrewBadgeSVG(){return `<svg class="lot-badge" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#2a3158"/><circle cx="32" cy="32" r="30" fill="none" stroke="${LX.orange}" stroke-width="3"/>${lxRobot(30,50,1.3,{})}<circle cx="50" cy="14" r="4" fill="#fff7d0"/><circle cx="52" cy="13" r="3.4" fill="#2a3158"/></svg>`}
function lotMiniIconSVG(k){return k==='crew'?`<svg viewBox="0 0 24 24"><path d="M4 15 a8 8 0 0 1 16 0 z" fill="${LX.orange}"/><rect x="3" y="15" width="18" height="3" rx="1.5" fill="#d0641f"/><rect x="11" y="6" width="2" height="5" fill="#fff" opacity=".7"/></svg>`:
  `<svg viewBox="0 0 24 24"><path d="M4 20 V8 a8 6 0 0 1 16 0 V20" fill="none" stroke="#2a76b5" stroke-width="2.4"/><path d="M7 20 V12 h10 V20" fill="${LX.water}"/><path d="M9 4 q3 -3 6 0" stroke="#2a76b5" stroke-width="1.6" fill="none"/></svg>`}
// Arroyo, the city's stormwater AI: a faceted water drop of light with ripple rings and channels (portrait box 30 0 240 360).
function lotArroyoArt(mood){const id=lxId('ar'),hue=mood==='worried'?'#ffb35a':'#5ee0f0';
  return `<defs><radialGradient id="${id}g" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#e9fdff"/><stop offset=".45" stop-color="${hue}"/><stop offset="1" stop-color="#1b6a9a"/></radialGradient></defs>
   <g class="lot-arroyo"><ellipse cx="150" cy="330" rx="96" ry="18" fill="${hue}" opacity=".18"/>${[0,1,2].map(i=>`<ellipse cx="150" cy="330" rx="${40+i*28}" ry="${8+i*5}" fill="none" stroke="${hue}" stroke-width="2" opacity="${.5-i*.14}" class="lot-ripple" style="--d:${i*.6}s"/>`).join('')}
   <path d="M150 60 C176 110 214 160 214 210 C214 252 186 284 150 284 C114 284 86 252 86 210 C86 160 124 110 150 60Z" fill="url(#${id}g)" opacity=".92"/>
   <path d="M150 60 L150 284 M86 210 L214 210 M108 140 L192 250 M192 140 L108 250" stroke="#ffffff" stroke-width="1.6" opacity=".35"/>
   <path d="M118 182 C126 160 136 146 146 134" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".55" fill="none"/>
   ${[[150,210,'lot-pulse'],[124,232,''],[176,232,''],[150,168,'']].map(([x,y,c])=>`<circle cx="${x}" cy="${y}" r="${c?9:5}" fill="#fff" class="${c}" opacity=".9"/>`).join('')}
   <path d="M124 232 L150 210 L176 232 M150 168 L150 210" stroke="#fff" stroke-width="2" opacity=".7"/></g>`}
