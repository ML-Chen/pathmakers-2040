// viz/agreed_viz_docs.js — Byte's infographics for "The Helper That Said Yes": Rosa's record, Byte's memo about her numbers, and the rewards lesson.
// Same style as infog.js: 300-wide igFrame, IG palette, igT labels, calm looping CSS (classes prefixed "agd-").
let AGD_N=0;
const AGD={rosa:{skin:SKIN[2],hair:'#dcd7d2',shirt:'#24477a',style:'bun',outfit:'jacket',pants:'#3b4068',skirt:false},
  leo:{skin:SKIN[2],hair:'#22160f',shirt:'#ffb53b',style:'short',outfit:'tee',pants:'#2c3e5c',age:'kid',skirt:false},
  fur:'#f2c48d',furS:'#d9995a',furL:'#7a4a2c',ear:'#b06e3c',belly:'#fff1dc'};
// animations (agd-*) live in src/css/agreed_viz_docs.css
// ---------- small shared pieces ----------
function agdArc(cx,cy,r,v0,v1){const p=v=>{const a=Math.PI*(1+v);return (cx+r*Math.cos(a)).toFixed(1)+' '+(cy+r*Math.sin(a)).toFixed(1)};return `M${p(v0)} A${r} ${r} 0 0 1 ${p(v1)}`}
// a blood-pressure dial; needle = inner markup of the needle group (rotation is set by the caller's class/style)
function agdDial(cx,cy,r,w,needleCls,needleStyle,o={}){const nl=r-w/2-3;
  return `<g>${agdArc(cx,cy,r,0,1)&&''}<path d="${agdArc(cx,cy,r+w/2+3,0,1)} L${cx+r+w/2+3} ${cy+4} L${cx-r-w/2-3} ${cy+4}Z" fill="#fff"/>
   <path d="${agdArc(cx,cy,r,0,.55)}" stroke="${IG.green}" stroke-width="${w}" fill="none"/><path d="${agdArc(cx,cy,r,.55,.72)}" stroke="${IG.gold}" stroke-width="${w}" fill="none"/><path d="${agdArc(cx,cy,r,.72,1)}" stroke="${IG.red}" stroke-width="${w}" fill="none"/>
   <circle cx="${cx-r}" cy="${cy}" r="${w/2}" fill="${IG.green}"/><circle cx="${cx+r}" cy="${cy}" r="${w/2}" fill="${IG.red}"/>
   ${o.glow||''}
   <g transform="translate(${cx} ${cy})"><g class="${needleCls}" style="${needleStyle}"><path d="M0 -${(w*.28).toFixed(1)} L${-nl} 0 L0 ${(w*.28).toFixed(1)}Z" fill="${IG.ink}" stroke="${IG.ink}" stroke-width="1.6" stroke-linejoin="round"/></g>
   <circle r="${(w*.5).toFixed(1)}" fill="${IG.ink}"/><circle r="${(w*.2).toFixed(1)}" fill="#fff"/></g></g>`}
const agdNeedle=v=>`--a:${(v*180).toFixed(1)}deg;transform:rotate(${(v*180).toFixed(1)}deg)`;
function agdStar(cx,cy,r,c,extra){let d='';for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.45:r;d+=(i?'L':'M')+(cx+rr*Math.cos(a)).toFixed(1)+' '+(cy+rr*Math.sin(a)).toFixed(1)}
  return `<path d="${d}Z" fill="${c||IG.gold}" stroke="${c||IG.gold}" stroke-width="${(r*.28).toFixed(1)}" stroke-linejoin="round" ${extra||''}/>`}
const agdCheck=(x,y,r,cls,sty)=>`<g class="${cls||''}" style="${sty||''}"><circle cx="${x}" cy="${y}" r="${r}" fill="${IG.green}"/><path d="M${x-r*.45} ${y} l${r*.3} ${r*.32} l${r*.55} ${-r*.62}" stroke="#fff" stroke-width="${(r*.28).toFixed(1)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
const agdPill=(x,y,s,rot)=>`<g transform="translate(${x} ${y}) rotate(${rot||0}) scale(${s||1})"><rect x="-10" y="-5" width="20" height="10" rx="5" fill="#fff" stroke="#c3cbe3" stroke-width="1.2"/><path d="M0 -5 h5 a5 5 0 0 1 0 10 h-5z" fill="${IG.coral}"/><path d="M-6 -2.2 h4" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".9"/></g>`;
const agdSun=(x,y,r,c)=>`<g transform="translate(${x} ${y})">${[0,1,2,3,4,5,6,7].map(i=>`<path d="M0 ${-r-2} v${-r*.55}" stroke="${c||IG.gold}" stroke-width="${(r*.28).toFixed(1)}" stroke-linecap="round" transform="rotate(${i*45})"/>`).join('')}<circle r="${r}" fill="${c||IG.gold}"/></g>`;
// a cheerful sun face (Sunny), centred at 0,0, radius r
const agdSunFace=r=>`<g class="agd-spin" style="animation-duration:14s">${[0,1,2,3,4,5,6,7,8,9].map(i=>`<path d="M0 ${-r-1.5} l${r*.22} ${-r*.42} l${-r*.44} 0z" fill="#ffc93c" stroke="#ffc93c" stroke-width="1.2" stroke-linejoin="round" transform="rotate(${i*36})"/>`).join('')}</g>
  <circle r="${r}" fill="#ffd84a" stroke="#f5b82e" stroke-width="1.2"/><path d="M${-r*.5} ${-r*.08} q${r*.16} ${-r*.26} ${r*.32} 0 M${r*.18} ${-r*.08} q${r*.16} ${-r*.26} ${r*.32} 0" stroke="#6b3a1e" stroke-width="${(r*.11).toFixed(1)}" fill="none" stroke-linecap="round"/>
  <path d="M${-r*.36} ${r*.2} q${r*.36} ${r*.42} ${r*.72} 0z" fill="#c2453a"/><ellipse cx="${-r*.58}" cy="${r*.22}" rx="${r*.17}" ry="${r*.1}" fill="#ff8f6b" opacity=".7"/><ellipse cx="${r*.58}" cy="${r*.22}" rx="${r*.17}" ry="${r*.1}" fill="#ff8f6b" opacity=".7"/>`;
const agdPhone=(x,y,s)=>`<g transform="translate(${x} ${y}) scale(${s||1})"><rect x="-17" y="-28" width="34" height="56" rx="8" fill="#2b3354"/><rect x="-14" y="-23" width="28" height="44" rx="4" fill="#fff6d6"/><rect x="-5" y="-26" width="10" height="2" rx="1" fill="#55608a"/><g transform="translate(0 -2)">${agdSunFace(8)}</g></g>`;
// a cute cartoon heart; o.face 'strain' adds a worried face and sweat
function agdHeart(x,y,s,o={}){return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 9 C-14 0 -13 -11 -6 -11 C-3 -11 -1 -9 0 -7 C1 -9 3 -11 6 -11 C13 -11 14 0 0 9Z" fill="#ff6b7d" stroke="#d94a60" stroke-width="1" stroke-linejoin="round"/><path d="M-8 -7 q-2 2 -1.5 5" stroke="#fff" stroke-width="1.3" fill="none" stroke-linecap="round" opacity=".75"/>
  ${o.face?`<ellipse cx="-3" cy="-2" rx=".9" ry="1.2" fill="#3a1424"/><ellipse cx="3" cy="-2" rx=".9" ry="1.2" fill="#3a1424"/><path d="M-4.6 -4.6 l2.6 1 M4.6 -4.6 l-2.6 1" stroke="#3a1424" stroke-width=".7" stroke-linecap="round"/><path d="M-2 2.6 q1 -.8 2 0 t2 0" stroke="#3a1424" stroke-width=".7" fill="none" stroke-linecap="round"/><path d="M9 -10 c1.2 2 1.6 3 1.6 3.8 a1.6 1.6 0 0 1 -3.2 0 c0 -.8 .4 -1.8 1.6 -3.8z" fill="#bfe8ff" stroke="#4a9ad8" stroke-width=".5" class="ig-blink"/>`:''}</g>`}
// a small dizzy swirl with twinkling stars around (x,y)
const agdDizzy=(x,y,s)=>`<g transform="translate(${x} ${y}) scale(${s||1})"><g class="agd-spinc"><path d="M0 0 a2 2 0 0 1 4 0 a4 4 0 0 1 -8 0 a6 6 0 0 1 12 0 a8 8 0 0 1 -16 0" stroke="${IG.violet}" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".8"/></g>
  <g class="agd-twk">${agdStar(-14,-8,4,IG.gold)}</g><g class="agd-twk" style="--d:.5s">${agdStar(14,-9,3.4,IG.gold)}</g><g class="agd-twk" style="--d:1s">${agdStar(1,-15,2.8,'#ffb3c7')}</g></g>`;
// a cute sitting puppy (front view), feet at local y=0
function agdPuppy(x,y,s){const F=AGD;return `<g transform="translate(${x} ${y}) scale(${s||1})">
  <g transform="translate(13 -10)"><path class="agd-wag" d="M0 0 q10 -4 12 -14" stroke="${F.furS}" stroke-width="5" fill="none" stroke-linecap="round"/></g>
  <ellipse cx="0" cy="1" rx="18" ry="3" fill="#1f2340" opacity=".12"/>
  <path d="M-15 0 C-17 -12 -12 -22 0 -22 C12 -22 17 -12 15 0Z" fill="${F.fur}" stroke="${F.furL}" stroke-width="1.2"/><path d="M-7 0 C-8 -9 -5 -15 0 -15 C5 -15 8 -9 7 0Z" fill="${F.belly}"/>
  <rect x="-9" y="-12" width="6" height="12" rx="3" fill="${F.fur}" stroke="${F.furL}" stroke-width="1"/><rect x="3" y="-12" width="6" height="12" rx="3" fill="${F.fur}" stroke="${F.furL}" stroke-width="1"/>
  <ellipse cx="-6" cy="-.6" rx="4" ry="2.4" fill="${F.belly}" stroke="${F.furL}" stroke-width="1"/><ellipse cx="6" cy="-.6" rx="4" ry="2.4" fill="${F.belly}" stroke="${F.furL}" stroke-width="1"/>
  <path d="M-6 -20 h12" stroke="${IG.coral}" stroke-width="3" stroke-linecap="round"/><circle cx="0" cy="-17.5" r="2" fill="${IG.gold}"/>
  <g transform="translate(0 -32)"><path d="M-12 -8 C-20 -8 -21 4 -16 9 C-13 6 -11 0 -10 -4Z" fill="${F.ear}" stroke="${F.furL}" stroke-width="1"/><path d="M12 -8 C20 -8 21 4 16 9 C13 6 11 0 10 -4Z" fill="${F.ear}" stroke="${F.furL}" stroke-width="1"/>
   <ellipse cx="0" cy="0" rx="14" ry="12.5" fill="${F.fur}" stroke="${F.furL}" stroke-width="1.2"/><ellipse cx="0" cy="5" rx="7" ry="5" fill="${F.belly}"/>
   <ellipse cx="-5.4" cy="-1" rx="2.4" ry="3" fill="#2a1a14"/><ellipse cx="5.4" cy="-1" rx="2.4" ry="3" fill="#2a1a14"/><circle cx="-6.2" cy="-2.2" r="1" fill="#fff"/><circle cx="4.6" cy="-2.2" r="1" fill="#fff"/>
   <ellipse cx="0" cy="3" rx="2.2" ry="1.5" fill="#2a1a14"/><path d="M-2.6 5.6 q1.3 1.4 2.6 0 q1.3 1.4 2.6 0" stroke="#2a1a14" stroke-width=".8" fill="none" stroke-linecap="round"/><path d="M-1.3 6.4 q1.3 3.4 2.6 0z" fill="#ff8fa3"/>
   <ellipse cx="-9" cy="3.4" rx="2.2" ry="1.2" fill="#ff9d8a" opacity=".6"/><ellipse cx="9" cy="3.4" rx="2.2" ry="1.2" fill="#ff9d8a" opacity=".6"/></g></g>`}
const agdTreat=(x,y)=>`<g transform="translate(${x} ${y})"><path d="M-6 -2.4 a2.6 2.6 0 1 1 2.4 -2.4 h7.2 a2.6 2.6 0 1 1 2.4 2.4 v4.8 a2.6 2.6 0 1 1 -2.4 2.4 h-7.2 a2.6 2.6 0 1 1 -2.4 -2.4z" fill="#e9b26b" stroke="#a8692f" stroke-width="1"/></g>`;
function agdBot(x,y,s){return `<g transform="translate(${x} ${y}) scale(${s||1})"><ellipse cx="0" cy="30" rx="18" ry="3.4" fill="#1f2340" opacity=".12"/>
  <path d="M0 -26 v-7" stroke="#9aa6c0" stroke-width="2" stroke-linecap="round"/><circle cx="0" cy="-35" r="3.4" fill="${IG.coral}" class="ig-blink"/>
  <rect x="-13" y="6" width="26" height="22" rx="9" fill="#f4f6fb" stroke="#c9d1e6" stroke-width="1.4"/><rect x="-6" y="12" width="12" height="7" rx="3.5" fill="${IG.teal}" opacity=".85"/>
  <rect x="-22" y="-27" width="44" height="34" rx="13" fill="#f4f6fb" stroke="#c9d1e6" stroke-width="1.4"/><rect x="-16" y="-21" width="32" height="22" rx="9" fill="#24305e"/>
  <path d="M-10 -10 q3 -4 6 0 M4 -10 q3 -4 6 0" stroke="#5ee6d6" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M-4 -5 q4 3 8 0" stroke="#5ee6d6" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  <rect x="-26" y="-16" width="5" height="12" rx="2.5" fill="#c9d1e6"/><rect x="21" y="-16" width="5" height="12" rx="2.5" fill="#c9d1e6"/></g>`}
// Rosa as a small figure, wearing her captain's cap (mini's head is centred near local (0,-11.8))
const agdCap=()=>`<g class="ag-mcap"><path d="M-7 -17.6 C-7 -21.6 -3.6 -22.8 0 -22.8 C3.6 -22.8 7 -21.6 7 -17.6 C7 -16.6 5.6 -16.2 4.4 -16.2 L-4.4 -16.2 C-5.6 -16.2 -7 -16.6 -7 -17.6Z" fill="#fbfcff" stroke="#141a2c" stroke-width=".7"/><path d="M-5.6 -17 H5.6 L5.8 -14.6 H-5.8Z" fill="#2a4476" stroke="#141a2c" stroke-width=".6"/><path d="M-5.8 -14.8 C-3 -13.6 3 -13.6 5.8 -14.8 C5.4 -13.4 3 -12.8 0 -12.8 C-3 -12.8 -5.4 -13.4 -5.8 -14.8Z" fill="#0f1424"/><circle cx="0" cy="-17.6" r=".9" fill="#e9b949"/></g>`;
const agdRosa=(x,y,s,o)=>{s=s||1;return `<g transform="translate(${x} ${y}) scale(${s})">${mini(0,0,Object.assign({},AGD.rosa,{s:1},o||{}))}${o&&o.nocap?'':agdCap()}</g>`};
const agdLeo=(x,y,s,o)=>mini(x,y,Object.assign({},AGD.leo,{s},o||{}));
// 10x10 grid of tiny people, n coloured
function agdGrid(x0,y0,cell,n,col,ch){ch=ch||cell;let s='';for(let i=0;i<100;i++){const r=Math.floor(i/10),c=i%10,x=x0+c*cell+cell/2,y=y0+r*ch+ch/2;
  s+=`<g class="agd-kid ${i<n?'on':''}" style="--d:${(i*.012).toFixed(3)}s;--c:${col}"><circle cx="${x.toFixed(1)}" cy="${(y-cell*.2).toFixed(1)}" r="${(cell*.21).toFixed(2)}"/><rect x="${(x-cell*.31).toFixed(1)}" y="${(y+cell*.05).toFixed(1)}" width="${(cell*.62).toFixed(1)}" height="${(cell*.32).toFixed(1)}" rx="${(cell*.16).toFixed(1)}"/></g>`}return s}
const agdA=(p,dur,extra)=>`class="agd-a" style="animation-name:agd-a${p};animation-duration:${dur}s;${extra||''}"`;

// a teacup for Rosa's tea (licorice: brown) or fennel (pale green), centred at (x,y)
const agdCup=(x,y,s,k)=>typeof aghCup==='function'?aghCup(x,y,s,k):'';
// a simple chart frame: coloured blood-pressure zones behind a line chart
function agdZones(x0,y0,w,h){return `<rect x="${x0}" y="${y0}" width="${w}" height="${h*.34}" rx="6" fill="#ffe3e3"/><rect x="${x0}" y="${y0+h*.34}" width="${w}" height="${h*.26}" fill="#fff3d6"/><rect x="${x0}" y="${y0+h*.6}" width="${w}" height="${h*.4}" rx="6" fill="#e2f6ec"/>
  ${igT(x0+6,y0+12,'very high',{s:9.5,a:'start',c:IG.red})}${igT(x0+6,y0+h*.34+12,'high',{s:9.5,a:'start',c:'#c98a12'})}${igT(x0+w-6,y0+h-6,'healthy',{s:9.5,a:'end',c:IG.green})}`}

Object.assign(VIZ,{
  agRosaCard:()=>{const id='agdc'+(++AGD_N);const art=typeof agRosaArt==='function'?agRosaArt('smile'):'';
    return igFrame(300,124,`<rect x="34" y="8" width="232" height="108" rx="14" fill="#fff" stroke="${IG.line}" stroke-width="2"/><path d="M34 22 a14 14 0 0 1 14 -14 h204 a14 14 0 0 1 14 14 v8 h-232z" fill="${IG.coral}"/>${igT(150,25,'PATIENT',{s:11,c:'#fff',w:800})}
     <clipPath id="${id}"><rect x="46" y="38" width="62" height="70" rx="10"/></clipPath><rect x="46" y="38" width="62" height="70" rx="10" fill="#dcebff"/>
     <g clip-path="url(#${id})"><path d="M46 96 q8 -4 16 0 t16 0 t16 0 t16 0 V110 H46z" fill="#9fd3f0" opacity=".7"/><svg x="38" y="36" width="78" height="80" viewBox="54 2 192 214" preserveAspectRatio="xMidYMin slice">${art}</svg></g>
     ${igT(122,60,'Rosa Morales',{s:15,a:'start',w:800})}${igT(122,77,'Age 68',{s:11,a:'start',c:IG.soft})}${igT(122,92,'Retired ferry captain',{s:11,a:'start',c:IG.soft})}${igT(122,106,'East Boston, top floor',{s:10,a:'start',c:IG.soft})}
     <g transform="translate(250 94) scale(.78)"><g class="agd-spin"><circle r="11" fill="none" stroke="#b57a45" stroke-width="3.4"/>${[0,1,2,3,4,5,6,7].map(i=>`<path d="M0 -6 V-17" stroke="#b57a45" stroke-width="3" stroke-linecap="round" transform="rotate(${i*45})"/>`).join('')}<circle r="4.4" fill="#d9a066" stroke="#b57a45" stroke-width="1.6"/></g></g>`,'Patient card: Rosa Morales, 68, retired ferry captain')},
  agGauge:({v=.82,pill}={})=>{
    if(!pill)return igFrame(300,124,`${agdDial(150,96,68,16,'agd-ndl',agdNeedle(v),{glow:v>.72?`<path d="${agdArc(150,96,68,.72,1)}" stroke="${IG.red}" stroke-width="26" fill="none" opacity=".25" class="ig-blink"/>`:''})}
       ${igT(64,118,'healthy',{s:11,c:IG.green})}${igT(236,118,'high',{s:11,c:IG.red})}`,'A blood pressure dial');
    const a0=(.82*180).toFixed(1),a1=(v*180).toFixed(1);
    return igFrame(300,124,`${agdDial(150,96,68,16,'agd-ndlgo',`--a0:${a0}deg;--a1:${a1}deg;transform:rotate(${a1}deg)`,{glow:`<path d="${agdArc(150,96,68,0,.55)}" stroke="${IG.green}" stroke-width="28" fill="none" opacity=".22" class="agd-glow"/>`})}
       <g class="agd-pilldrop">${agdPill(150,66,1.15,0)}</g>
       ${igT(64,118,'healthy',{s:11,c:IG.green})}${igT(236,118,'high',{s:11,c:IG.red})}`,'A pill moves blood pressure from high back to healthy')},
  agSilent:()=>igFrame(300,146,`<path d="M20 127 H120" stroke="${IG.line}" stroke-width="3" stroke-linecap="round"/><g class="agd-bob">${agdRosa(66,61.4,1.9,{face:'happy'})}</g>
     <g class="agd-twk">${agdStar(34,28,4.6,IG.gold)}</g><g class="agd-twk" style="--d:.8s">${agdStar(100,22,3.8,IG.gold)}</g><g class="agd-twk" style="--d:.4s">${agdStar(104,44,3,'#ffb3c7')}</g>
     <path d="M84 70 H148" stroke="${IG.soft}" stroke-width="2" stroke-dasharray="3 5" stroke-linecap="round"/><circle cx="80" cy="70" r="3" fill="${IG.soft}"/>
     <circle cx="204" cy="70" r="54" fill="#fff" stroke="${IG.line}" stroke-width="4"/><circle cx="204" cy="70" r="47" fill="#fff0f2"/>
     ${agdDial(204,50,17,6,'agd-ndl',agdNeedle(.84))}
     <g class="agd-beat">${agdHeart(204,86,2.3,{face:'strain'})}</g>
     <path d="M168 78 l-6 -3 M170 90 l-7 1 M240 78 l6 -3 M238 90 l7 1" stroke="#ff6b7d" stroke-width="2" stroke-linecap="round" class="ig-blink"/>
     ${igT(66,142,'feels fine',{s:11,c:IG.green})}${igT(204,142,'inside',{s:11,c:IG.red})}`,'Rosa feels fine while her heart works hard inside'),
  agTrend:()=>{const M=['Jan','Feb','Mar','Apr','May'],X=i=>44+i*56,Y=[100,98,82,64,46],pts=M.map((m,i)=>X(i)+' '+Y[i]).join(' L');
    return igFrame(300,134,`${agdZones(24,14,262,100)}
      ${M.map((m,i)=>igT(X(i),128,m,{s:10.5,c:IG.soft})).join('')}
      <path d="M${pts}" fill="none" stroke="${IG.ink}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" class="agd-draw" pathLength="100"/>
      ${M.map((m,i)=>`<circle cx="${X(i)}" cy="${Y[i]}" r="4.4" fill="#fff" stroke="${IG.ink}" stroke-width="2" ${agdA(i*14,6)}/>`).join('')}
      <circle cx="${X(4)}" cy="${Y[4]}" r="9" fill="none" stroke="${IG.red}" stroke-width="2" class="agd-pulse"/>`,'Rosa’s blood pressure climbing from January to May')},
  agHeadache:()=>{const u='agdh'+(++AGD_N);
    return igFrame(300,144,`<clipPath id="${u}"><rect x="8" y="6" width="138" height="118" rx="12"/></clipPath><g clip-path="url(#${u})"><rect x="8" y="6" width="138" height="118" fill="#2c3168"/>
       <path d="M128 22 a9 9 0 1 0 8 13 a7 7 0 1 1 -8 -13z" fill="#fff4cf"/>${[[24,20],[60,14],[100,30]].map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="1.2" fill="#fff" class="ig-blink" style="--d:${i*.5}s"/>`).join('')}
       <path d="M8 112 H146" stroke="#4a5090" stroke-width="3"/>${agdRosa(56,54,1.5,{face:'sad'})}
       <g class="agd-zig">${[[34,44,-1],[78,44,1],[56,22,-1]].map(([x,y,d])=>`<path d="M${x} ${y} l${4*d} -4 l${-4*d} -3 l${4*d} -4" stroke="#ffd23f" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}</g>
       <g transform="translate(116 94)"><circle r="20" fill="#fff"/>${agdDial(0,7,13,5,'agd-ndl',agdNeedle(.93))}</g></g>
      ${igT(77,140,'last night',{s:10.5,c:IG.soft})}
      <rect x="154" y="6" width="138" height="118" rx="12" fill="#eaf6ff"/><rect x="164" y="70" width="8" height="44" rx="3" fill="#c9d1e6"/><rect x="276" y="84" width="8" height="30" rx="3" fill="#c9d1e6"/>
      <rect x="172" y="58" width="34" height="18" rx="8" fill="#fff" stroke="#c9d1e6" stroke-width="1.4"/>${agdRosa(200,58,1.4,{face:'happy'})}<path d="M168 80 Q222 72 280 82 V108 H168Z" fill="#b9e0f7" stroke="#8fc4e6" stroke-width="1.4"/><path d="M176 86 Q222 80 272 88" stroke="#fff" stroke-width="2" fill="none" opacity=".7"/><rect x="166" y="106" width="116" height="7" rx="2" fill="#fff" stroke="#c9d1e6"/>
      <g transform="translate(262 42)"><circle r="20" fill="#fff"/>${agdDial(0,7,13,5,'agd-ndl',agdNeedle(.6))}</g>${igT(223,140,'today',{s:10.5,c:IG.soft})}`,'Last night a pounding headache and very high blood pressure; today she is better')},
  agDispenser:()=>{let g='';for(let i=0;i<90;i++){const c=i%15,r=Math.floor(i/15);g+=`<g ${agdA(r*5,7)}><circle cx="${118+c*11.6}" cy="${18+r*14}" r="4.8" fill="${IG.green}"/><path d="M${115.6+c*11.6} ${18+r*14} l1.8 1.8 l3 -3.2" stroke="#fff" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`}
    return igFrame(300,130,`<g class="agd-bob">${typeof aghDispenser==='function'?aghDispenser(56,62,2.6):''}</g>${g}<text x="200" y="124" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="800" fill="${IG.ink}"><tspan font-size="17" fill="${IG.green}">90</tspan><tspan font-size="11" fill="${IG.soft}" dx="4">out of 90 days</tspan></text>`,'Her pill dispenser shows 90 out of 90 pills taken')},
  agUnknown:()=>igFrame(300,124,`<g opacity=".45">${agdZones(24,10,262,92)}<path d="M44 92 L100 90 L156 76 L212 60 L268 44" fill="none" stroke="${IG.ink}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></g>
      <g class="agd-bob"><circle cx="150" cy="56" r="34" fill="#fff" stroke="${IG.violet}" stroke-width="3"/>${igT(150,74,'?',{s:50,w:900,c:IG.violet})}</g>
      ${igT(150,120,'Cause: unknown',{s:11,w:800,c:IG.soft})}`,'The cause of the rise is unknown'),
  agPillWorks:()=>igFrame(300,124,`<g transform="translate(58 56)">${typeof aghDispenser==='function'?aghDispenser(0,0,2.2):''}</g>
      <path d="M96 56 H140" stroke="${IG.green}" stroke-width="3" stroke-linecap="round" class="agd-flow"/><path d="M136 49 l8 7 l-8 7" fill="none" stroke="${IG.green}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <g class="agd-bob">${agdPill(120,40,.9,-25)}</g>
      ${agdDial(214,74,52,12,'agd-ndl',agdNeedle(.38),{glow:`<path d="${agdArc(214,74,52,0,.55)}" stroke="${IG.green}" stroke-width="22" fill="none" opacity=".2" class="agd-glow"/>`})}
      ${['M','T','W','T','F','S','S'].map((d,i)=>agdCheck(178+i*12,108,4.6,'agd-a',`animation-name:agd-a${i*10};animation-duration:7s`)).join('')}`,'Her pill works on the days she takes it, and she takes it every day'),
  agMystery:({small}={})=>igFrame(300,small?104:120,`<rect x="40" y="8" width="160" height="${small?88:104}" rx="12" fill="#fff" stroke="${IG.line}" stroke-width="2"/>
      ${[['Same pill',1],['New medicines: none',1],['Something new:',0]].map(([l,ok],i)=>`${igT(56,34+i*24,l,{s:11,a:'start',w:700})}${ok?agdCheck(184,30+i*24,7):`<g class="agd-pulse">${igT(184,35+i*24,'?',{s:16,w:900,c:IG.coral})}</g>`}`).join('')}
      <g class="agd-mag"><g transform="translate(150 50)"><circle r="18" fill="#fff" fill-opacity=".3" stroke="${IG.violet}" stroke-width="4"/><path d="M13 13 L26 26" stroke="${IG.violet}" stroke-width="6" stroke-linecap="round"/><path d="M-9 -7 a11 11 0 0 1 8 -5" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/></g></g>
      <g transform="translate(248 ${small?56:62})">${agdPuppy(0,24,1.1)}</g>`,'Byte checks Rosa’s record: same pill, no new medicines, something new unknown'),
  agTeaCups:()=>igFrame(300,124,`<path d="M14 104 H286" stroke="${IG.line}" stroke-width="3" stroke-linecap="round"/>
      <g transform="translate(38 82)">${typeof aghTin==='function'?aghTin(0,0,1.5):''}</g>
      ${[0,1,2,3].map(i=>`<g ${agdA(10+i*15,8)}>${agdCup(104+i*48,88,1.5,'licorice')}${igT(104+i*48,48,String(i+1),{s:15,w:900,c:IG.coral})}</g>`).join('')}
      ${igT(176,120,'4 cups a day',{s:11,w:800,c:IG.soft})}`,'Four cups of licorice root tea a day'),
  agSaltLicorice:()=>igFrame(300,130,`<g transform="translate(52 70)"><path d="M-12 -24 C-12 -32 12 -32 12 -24 L14 22 C14 28 -14 28 -14 22Z" fill="#fff" stroke="#b9c1da" stroke-width="1.6"/><path d="M-12 -24 C-12 -32 12 -32 12 -24 C12 -20 -12 -20 -12 -24Z" fill="#c9d1e6"/>
       ${[-5,0,5].map(x=>`<circle cx="${x}" cy="-27" r="1.2" fill="#8a93b0"/>`).join('')}${igT(0,8,'SALT',{s:8.5,w:900,c:'#8a93b0'})}</g>
      ${typeof aghRoot==='function'?aghRoot(118,74,2):''}${igT(118,112,'real licorice',{s:10,c:IG.soft})}${igT(52,112,'very salty food',{s:10,c:IG.soft})}
      <path d="M150 74 Q172 74 180 60" stroke="${IG.red}" stroke-width="3" fill="none" stroke-linecap="round" class="agd-flow"/><path d="M174 58 l7 -3 l1 8" fill="none" stroke="${IG.red}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      ${agdDial(236,84,46,11,'agd-ndlgo',`--a0:${(.45*180).toFixed(1)}deg;--a1:${(.86*180).toFixed(1)}deg;transform:rotate(${.86*180}deg)`)}`,'Very salty food and real licorice push blood pressure up'),
  agLicorice:()=>{const u='agdv'+(++AGD_N);
    return igFrame(300,140,`<clipPath id="${u}"><path d="M14 46 Q80 40 146 46 V94 Q80 100 14 94Z"/></clipPath>
      ${igT(80,20,'a blood vessel',{s:10,c:IG.soft})}<g class="agd-swell"><path d="M14 46 Q80 40 146 46 V94 Q80 100 14 94Z" fill="#ffd9d9" stroke="#e58a8a" stroke-width="3"/>
       <g clip-path="url(#${u})"><g class="agd-cells">${[0,1,2,3,4,5,6,7,8,9].map(i=>`<ellipse cx="${10+i*30}" cy="${58+(i%3)*12}" rx="7" ry="4.4" fill="#e5484d" opacity=".85"/>`).join('')}
        ${[0,1,2,3,4,5,6,7].map(i=>`<path d="M${24+i*34} ${54+(i%2)*20} q-3 5 0 7 q3 -2 0 -7z" fill="#5b9bf0"/>`).join('')}${[0,1,2,3,4,5].map(i=>`<rect x="${40+i*40}" y="${64+(i%2)*14}" width="3" height="3" fill="#fff" stroke="#b9c1da" stroke-width=".6"/>`).join('')}</g></g>
       <ellipse cx="146" cy="70" rx="7" ry="24" fill="#f7b5b5" stroke="#e58a8a" stroke-width="3"/><ellipse cx="146" cy="70" rx="3.6" ry="17" fill="#c84a4a" opacity=".6"/></g>
      <g class="agd-push">${[[30,32,-1],[80,28,-1],[130,32,-1],[30,108,1],[80,112,1],[130,108,1]].map(([x,y,d])=>`<path d="M${x} ${y} v${d*8} M${x-4} ${y+d*4} l4 ${d*4} l4 ${-d*4}" stroke="${IG.red}" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}</g>
      ${igT(80,132,'holds extra salt and water',{s:10,c:IG.soft})}
      ${agdDial(234,104,42,10,'agd-ndl',agdNeedle(.8))}
      <g class="agd-bob">${agdPill(196,32,.9,-25)}<path d="M196 44 v12 M191 52 l5 5 l5 -5" stroke="${IG.green}" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
      <g class="agd-bob" style="--d:-1.5s">${typeof aghRoot==='function'?aghRoot(272,32,.9):''}<path d="M272 58 v-12 M267 51 l5 -5 l5 5" stroke="${IG.red}" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
      ${igT(234,130,'licorice beats the pill',{s:10,c:IG.red})}`,'Licorice makes the body hold extra salt and water, pushing pressure up against her pill')},
  agOddsPair:({a=90,b=20}={})=>igFrame(300,154,[[a,IG.green,'cause gone',8],[b,IG.coral,'cause still there',154]].map(([n,c,l,x])=>`<rect x="${x}" y="2" width="138" height="150" rx="14" fill="#fff"/>
     <text x="${x+69}" y="27" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="800" fill="${IG.green}"><tspan font-size="24">${n}</tspan><tspan font-size="11" fill="${IG.soft}" font-weight="700" dx="4">of 100 healthy</tspan></text>
     ${agdGrid(x+22,33,9.4,n,IG.green,10.4)}${igT(x+69,146,l,{s:11,c})}`).join(''),`If the cause goes away about ${a} of 100 get healthy numbers; if it stays, about ${b}`),
  agFog:()=>igFrame(300,120,`${agdDial(150,96,66,15,'agd-ndlfog','')}
      <g class="agd-fog">${[[80,60,46],[150,48,52],[220,64,44],[120,84,40],[190,86,40]].map(([x,y,r])=>`<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r*.42}" fill="#eef1f8" opacity=".92"/>`).join('')}</g>
      <g class="agd-fog2">${[[60,44],[240,40]].map(([x,y])=>igT(x,y,'?',{s:20,w:900,c:'#b4bbd2'})).join('')}</g>`,'A foggy forecast'),
  agFennel:()=>igFrame(300,140,`<rect x="8" y="6" width="134" height="128" rx="14" fill="#fff4ec"/><rect x="158" y="6" width="134" height="128" rx="14" fill="#f1faea"/>
      ${agdCup(60,64,1.9,'licorice')}${typeof aghRoot==='function'?aghRoot(108,84,1):''}${agdDial(75,122,22,6,'agd-ndl',agdNeedle(.84))}${igT(75,26,'licorice tea',{s:11,w:800,c:'#8a4a1e'})}
      ${agdCup(210,64,1.9,'fennel')}${typeof aghFrond==='function'?aghFrond(260,76,1.4):''}${agdDial(225,122,22,6,'agd-ndl',agdNeedle(.38))}${igT(225,26,'fennel tea',{s:11,w:800,c:'#4f8a2e'})}
      <g class="agd-pulse"><circle cx="150" cy="58" r="13" fill="#fff" stroke="${IG.gold}" stroke-width="2"/><path d="M144 56 h12 M144 61 h12" stroke="${IG.gold}" stroke-width="2.4" stroke-linecap="round"/></g>${igT(150,84,'tastes',{s:9.5,c:IG.soft})}${igT(150,95,'alike',{s:9.5,c:IG.soft})}`,'Fennel tea tastes like licorice tea, but it doesn’t raise blood pressure'),
  agOddsOne:({n=30}={})=>igFrame(300,154,`<rect x="81" y="2" width="138" height="150" rx="14" fill="#fff"/>
     <text x="150" y="27" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="800" fill="${IG.green}"><tspan font-size="24">${n}</tspan><tspan font-size="11" fill="${IG.soft}" font-weight="700" dx="4">of 100 futures</tspan></text>
     ${agdGrid(103,33,9.4,n,IG.green,10.4)}${igT(150,146,'healthy numbers',{s:11,c:IG.green})}
`,`Healthy numbers in about ${n} of 100 futures`),
  agSwitchOdds:()=>{const row=(y,n,lab,face)=>`${igT(14,y-14,lab,{s:11,a:'start',w:800})}${face}${[...Array(10)].map((_,i)=>`<g transform="translate(${44+i*20.5} ${y+8})">${agdCup(0,0,.7,'licorice')}${i<n?`<g class="agd-swap" style="--d:${(i*.12).toFixed(2)}s">${agdCup(0,0,.7,'fennel')}</g>`:''}</g>`).join('')}${igT(292,y+12,n+' of 10',{s:12,a:'end',w:900,c:IG.green})}`;
    return igFrame(300,132,`${row(30,8,'A doctor explains why',`<g transform="translate(22 38)">${agdCheck(0,0,8)}</g>`)}${row(96,4,'Sunny keeps offering the old tea',`${sunnyFace(22,104,9,{spin:false,glow:false})}`)}`,'With a doctor’s explanation 8 of 10 switch teas; if Sunny keeps offering the old tea, 4 of 10')},
  agApproved:()=>igFrame(300,126,`<rect x="22" y="10" width="140" height="106" rx="8" fill="#fff" stroke="${IG.line}" stroke-width="2"/>${igT(92,30,'Sunny update · February',{s:10.5,w:900})}
      ${igT(36,52,'Train on star ratings',{s:10,a:'start'})}<rect x="36" y="62" width="100" height="5" rx="2.5" fill="${IG.line}"/><rect x="36" y="74" width="80" height="5" rx="2.5" fill="${IG.line}"/>
      <g class="agd-stamp"><g transform="translate(100 96) rotate(-10)"><rect x="-44" y="-13" width="88" height="26" rx="5" fill="#fff" fill-opacity=".6" stroke="${IG.green}" stroke-width="3"/>${igT(0,6,'APPROVED',{s:14,w:900,c:IG.green})}</g></g>
      ${[0,1,2].map(i=>mini(198+i*30,62,{s:1.05,shirt:[IG.violet,IG.teal,IG.coral][i],hair:['#2a1d1a','#c9873a','#1d1a2e'][i],skin:SKIN[[1,3,4][i]],outfit:'jacket',face:'happy',style:['bun','short','long'][i]})).join('')}
      <g class="agd-bob"><rect x="182" y="4" width="108" height="26" rx="13" fill="#ffd23f"/>${igT(236,21,'Friendlier, please!',{s:10.5,w:800})}</g>`,'The Home Care Board approved the February update'),
  lsTreat:()=>igFrame(300,120,`<path d="M20 104 H190" stroke="${IG.line}" stroke-width="3" stroke-linecap="round"/>
     <g class="agd-sit">${agdPuppy(100,104,1.6)}</g><g class="agd-treat">${agdTreat(100,62)}</g><g class="agd-heart">${agdHeart(128,30,.7)}</g>
     <rect x="200" y="20" width="88" height="84" rx="14" fill="#fff"/>${igT(244,40,'sits',{s:11,c:IG.soft})}
     ${[0,1,2,3].map(i=>`<g ${agdA([10,35,60,85][i],8)}>${agdTreat(222+(i%2)*44,58+Math.floor(i/2)*28)}</g>`).join('')}`,'A puppy gets a treat each time it sits'),
  lsLearn:()=>igFrame(300,120,`<g class="agd-happy">${agdBot(62,70,1.15)}</g>
     ${[0,1,2].map(i=>`<g class="agd-starfly" style="--d:${i*2}s;--sx:40px;--sy:-50px;animation-duration:6s">${agdStar(92,38,8,IG.gold)}</g>`).join('')}
     <rect x="128" y="34" width="160" height="56" rx="14" fill="#fff"/>${igT(208,54,'do it again',{s:11,c:IG.soft})}
     <rect x="142" y="64" width="132" height="14" rx="7" fill="${IG.line}"/><rect x="142" y="64" width="132" height="14" rx="7" fill="${IG.violet}" class="agd-bar"/>`,'An AI is rewarded and does that thing more'),
  lsStars:()=>{const st=(sx,sy,d,x)=>`<g class="agd-rain" style="--sx:${sx}px;--sy:${sy}px;--d:${d}s">${agdStar(x,104,5,IG.gold)}</g>`;
    return igFrame(300,142,`<path d="M14 128 H286" stroke="${IG.line}" stroke-width="3" stroke-linecap="round"/>
     <circle cx="70" cy="56" r="28" fill="#fff6d6"/>${sunnyFace(70,56,19,{mood:'happy'})}
     <g class="agd-give"><g transform="translate(118 74)">${typeof aghTin==='function'?aghTin(0,0,.9):''}</g></g>
     <g class="agd-saya"><rect x="14" y="4" width="84" height="22" rx="11" fill="#ffd23f"/>${igT(56,19,'Here you go!',{s:10.5,w:800})}</g>
     ${agdRosa(170,62,1.5,{face:'happy'})}
     ${st(70,-60,0,182)}${st(80,-50,.6,186)}${st(76,-66,1.25,180)}
     <path d="M232 100 h40 v20 a8 8 0 0 1 -8 8 h-24 a8 8 0 0 1 -8 -8z" fill="#fff" opacity=".7"/><path d="M236 108 h32 v12 a5 5 0 0 1 -5 5 h-22 a5 5 0 0 1 -5 -5z" fill="${IG.gold}" opacity=".85" class="agd-jar"/>
     <path d="M232 100 h40 v20 a8 8 0 0 1 -8 8 h-24 a8 8 0 0 1 -8 -8z" fill="none" stroke="#9fb0d6" stroke-width="2.4"/><rect x="228" y="95" width="48" height="7" rx="3.5" fill="#c9d1e6"/>`,'A helper AI hands over a treat and collects stars')},
  lsBetter:()=>{const pages=['Month 1','Month 2','Month 3'];
    return igFrame(300,124,`<g transform="translate(20 22)"><rect x="0" y="6" width="66" height="74" rx="10" fill="#fff" stroke="${IG.line}" stroke-width="2"/>
       ${pages.map((w,i)=>`<g ${agdA(i*25,8,'transform-origin:top')}><rect x="0" y="6" width="66" height="74" rx="10" fill="#fff" stroke="${IG.line}" stroke-width="2"/><rect x="0" y="6" width="66" height="18" rx="9" fill="${IG.coral}"/><rect x="0" y="16" width="66" height="8" fill="${IG.coral}"/>${igT(33,46,'Month',{s:11,w:800,c:IG.soft})}${igT(33,70,String(i+1),{s:22,w:900})}</g>`).join('')}
       <circle cx="18" cy="6" r="3.4" fill="#9aa6c0"/><circle cx="48" cy="6" r="3.4" fill="#9aa6c0"/></g>
     <path d="M96 64 H124" stroke="${IG.soft}" stroke-width="3" stroke-linecap="round" class="agd-flow"/><path d="M120 57 l7 7 l-7 7" fill="none" stroke="${IG.soft}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
     ${agdRosa(158,50,1.2,{face:'happy'})}<g transform="translate(186 34)"><circle r="13" fill="#fff"/>${agdDial(0,5,8.4,3,'agd-ndl',agdNeedle(.35))}</g>
     <path d="M202 64 H226" stroke="${IG.soft}" stroke-width="3" stroke-linecap="round" class="agd-flow"/><path d="M222 57 l7 7 l-7 7" fill="none" stroke="${IG.soft}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
     <circle cx="260" cy="62" r="26" fill="#fff"/><g ${agdA(75,8)}><circle cx="260" cy="62" r="26" fill="${IG.gold}" opacity=".25"/>${agdStar(260,62,16,IG.gold)}</g>${igT(260,108,'reward',{s:11,c:IG.soft})}`,'A reward that checks how people are doing months later')}
});
