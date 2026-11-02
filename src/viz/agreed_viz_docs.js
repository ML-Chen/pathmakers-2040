// viz/agreed_viz_docs.js — Byte's infographics for "The App That Agreed": Rosa's record, Byte's memo, and the rewards lesson.
// Same style as infog.js: 300-wide igFrame, IG palette, igT labels, calm looping CSS (classes prefixed "agd-").
let AGD_N=0;
const AGD={rosa:{skin:SKIN[2],hair:'#d9d4cf',shirt:'#2f6fb5',style:'bun',outfit:'jacket',pants:'#3b4068',skirt:false},
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
const agdRosa=(x,y,s,o)=>mini(x,y,Object.assign({},AGD.rosa,{s},o||{}));
const agdLeo=(x,y,s,o)=>mini(x,y,Object.assign({},AGD.leo,{s},o||{}));
// 10x10 grid of tiny people, n coloured
function agdGrid(x0,y0,cell,n,col,ch){ch=ch||cell;let s='';for(let i=0;i<100;i++){const r=Math.floor(i/10),c=i%10,x=x0+c*cell+cell/2,y=y0+r*ch+ch/2;
  s+=`<g class="agd-kid ${i<n?'on':''}" style="--d:${(i*.012).toFixed(3)}s;--c:${col}"><circle cx="${x.toFixed(1)}" cy="${(y-cell*.2).toFixed(1)}" r="${(cell*.21).toFixed(2)}"/><rect x="${(x-cell*.31).toFixed(1)}" y="${(y+cell*.05).toFixed(1)}" width="${(cell*.62).toFixed(1)}" height="${(cell*.32).toFixed(1)}" rx="${(cell*.16).toFixed(1)}"/></g>`}return s}
const agdA=(p,dur,extra)=>`class="agd-a" style="animation-name:agd-a${p};animation-duration:${dur}s;${extra||''}"`;

Object.assign(VIZ,{
  agRosaCard:()=>{const id='agdc'+(++AGD_N);const R=(typeof CAST!=='undefined'&&CAST.rosa)||{skin:SKIN[2],hair:'#d9d4cf',hairStyle:'elder',shirt:'#2f6fb5',accessory:'earring'};
    return igFrame(300,124,`<rect x="34" y="8" width="232" height="108" rx="14" fill="#fff" stroke="${IG.line}" stroke-width="2"/><path d="M34 22 a14 14 0 0 1 14 -14 h204 a14 14 0 0 1 14 14 v8 h-232z" fill="${IG.coral}"/>${igT(150,25,'PATIENT',{s:11,c:'#fff',w:800})}
     <clipPath id="${id}"><rect x="46" y="38" width="62" height="70" rx="10"/></clipPath><rect x="46" y="38" width="62" height="70" rx="10" fill="#dcebff"/>
     <g clip-path="url(#${id})"><path d="M46 96 q8 -4 16 0 t16 0 t16 0 t16 0 V110 H46z" fill="#9fd3f0" opacity=".7"/><svg x="40" y="36" width="74" height="78" viewBox="40 20 220 232" preserveAspectRatio="xMidYMin slice">${personSVG({...R,mood:'smile'})}</svg></g>
     ${igT(122,62,'Rosa Morales',{s:15,a:'start',w:800})}${igT(122,80,'Age 68',{s:11,a:'start',c:IG.soft})}${igT(122,96,'Sailing teacher',{s:11,a:'start',c:IG.soft})}
     <g transform="translate(240 90)"><g class="agd-spin"><circle r="11" fill="none" stroke="#b57a45" stroke-width="3.4"/>${[0,1,2,3,4,5,6,7].map(i=>`<path d="M0 -6 V-17" stroke="#b57a45" stroke-width="3" stroke-linecap="round" transform="rotate(${i*45})"/>`).join('')}<circle r="4.4" fill="#d9a066" stroke="#b57a45" stroke-width="1.6"/></g></g>`,'Rosa’s patient card')},
  agGauge:({v=.82,pill}={})=>{
    if(!pill)return igFrame(300,124,`${agdDial(150,96,68,16,'agd-ndl',agdNeedle(v),{glow:v>.72?`<path d="${agdArc(150,96,68,.72,1)}" stroke="${IG.red}" stroke-width="26" fill="none" opacity=".25" class="ig-blink"/>`:''})}
       ${igT(64,118,'healthy',{s:11,c:IG.green})}${igT(236,118,'high',{s:11,c:IG.red})}`,'A blood pressure dial reading high');
    const a0=(.82*180).toFixed(1),a1=(v*180).toFixed(1);
    return igFrame(300,124,`${agdDial(150,96,68,16,'agd-ndlgo',`--a0:${a0}deg;--a1:${a1}deg;transform:rotate(${a1}deg)`,{glow:`<path d="${agdArc(150,96,68,0,.55)}" stroke="${IG.green}" stroke-width="28" fill="none" opacity=".22" class="agd-glow"/><path d="${agdArc(150,96,68,.72,1)}" stroke="${IG.red}" stroke-width="26" fill="none" opacity=".22" class="agd-redglow"/>`})}
       <g class="agd-pilldrop">${agdPill(150,66,1.15,0)}</g>
       ${igT(64,118,'healthy',{s:11,c:IG.green})}${igT(236,118,'high',{s:11,c:IG.red})}`,'A pill moves blood pressure from high back to healthy')},
  agPillWeek:()=>{const D=['M','T','W','T','F','S','S'],X=i=>22+i*35;
    return igFrame(300,124,`${D.map((d,i)=>`<g transform="translate(${X(i)+15} 18)">${agdSun(0,0,5,'#e6e2f2')}<g ${agdA(5+i*10,8)}>${agdSun(0,0,5,IG.gold)}</g></g>`).join('')}
     <rect x="14" y="38" width="254" height="60" rx="14" fill="#c9b8ff"/><rect x="14" y="38" width="254" height="10" rx="5" fill="#b3a2f5"/>
     ${D.map((d,i)=>`<rect x="${X(i)}" y="44" width="30" height="48" rx="9" fill="#fff" stroke="#a594ee" stroke-width="1.4"/>${igT(X(i)+15,108,d,{s:10.5,c:IG.soft})}<g ${agdA(5+i*10,8)}>${agdPill(X(i)+15,70,1,-25)}</g>`).join('')}
     ${agdCheck(284,68,11,'agd-a',`animation-name:agd-a75;animation-duration:8s`)}`,'A week of pills, one each morning')},
  agStandUp:()=>{const id='agdk'+(++AGD_N),cx=112;
    return igFrame(300,136,`<clipPath id="${id}"><rect x="0" y="0" width="300" height="127"/></clipPath>
     <path d="M10 127 H290" stroke="${IG.line}" stroke-width="3" stroke-linecap="round"/>
     <path d="M${cx-32} 100 V62 a32 22 0 0 1 64 0 V100z" fill="#9a90ea"/><path d="M${cx-26} 98 V64 a26 17 0 0 1 52 0 V98z" fill="#b9b2f5"/>
     <g clip-path="url(#${id})"><g class="agd-up"><g class="agd-sway"><g class="agd-calm">${agdRosa(cx,62.4,1.9,{face:'happy'})}</g><g class="agd-dz">${agdRosa(cx,62.4,1.9,{face:'nervous'})}</g></g>
       <g class="agd-dz">${agdDizzy(cx,18,1.1)}</g></g></g>
     <rect x="${cx-34}" y="98" width="68" height="29.5" rx="8" fill="#b9b2f5" stroke="#9a90ea" stroke-width="2"/><path d="M${cx-30} 108 h60" stroke="#a69cf0" stroke-width="2" stroke-linecap="round"/><rect x="${cx-42}" y="84" width="14" height="40" rx="7" fill="#9a90ea"/><rect x="${cx+28}" y="84" width="14" height="40" rx="7" fill="#9a90ea"/>
     <path d="M${cx-36} 123 v4 M${cx+36} 123 v4" stroke="#7d73cf" stroke-width="5" stroke-linecap="round"/>`,'Rosa stands up from a chair and feels dizzy')},
  agSideEffect:()=>igFrame(300,130,`<g transform="translate(58 66)"><circle r="34" fill="#fff"/><g class="agd-bob">${agdPill(0,0,2.2,-30)}</g></g>
     <path d="M96 54 Q138 30 176 40" stroke="${IG.green}" stroke-width="5" fill="none" stroke-linecap="round" class="agd-flow"/><path d="M170 32 l10 8 l-12 5" fill="none" stroke="${IG.green}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
     <path d="M96 82 Q130 104 166 104" stroke="${IG.coral}" stroke-width="2.6" fill="none" stroke-linecap="round" class="agd-flow"/><path d="M160 98 l8 6 l-8 6" fill="none" stroke="${IG.coral}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
     ${agdDial(232,52,30,9,'agd-ndl',agdNeedle(.3))}${igT(232,72,'main job',{s:11,c:IG.green})}
     <circle cx="190" cy="104" r="17" fill="#fff"/>${agdDizzy(190,106,.8)}${igT(214,108,'side effect',{s:11,c:IG.coral,a:'start'})}`,'The pill’s main job and its dizzy side effect'),
  agSilent:()=>igFrame(300,146,`<path d="M20 127 H120" stroke="${IG.line}" stroke-width="3" stroke-linecap="round"/><g class="agd-bob">${agdRosa(66,61.4,1.9,{face:'happy'})}</g>
     <g class="agd-twk">${agdStar(34,28,4.6,IG.gold)}</g><g class="agd-twk" style="--d:.8s">${agdStar(100,22,3.8,IG.gold)}</g><g class="agd-twk" style="--d:.4s">${agdStar(104,44,3,'#ffb3c7')}</g>
     <path d="M84 70 H148" stroke="${IG.soft}" stroke-width="2" stroke-dasharray="3 5" stroke-linecap="round"/><circle cx="80" cy="70" r="3" fill="${IG.soft}"/>
     <circle cx="204" cy="70" r="54" fill="#fff" stroke="${IG.line}" stroke-width="4"/><circle cx="204" cy="70" r="47" fill="#fff0f2"/>
     ${agdDial(204,50,17,6,'agd-ndl',agdNeedle(.84))}
     <g class="agd-beat">${agdHeart(204,86,2.3,{face:'strain'})}</g>
     <path d="M168 78 l-6 -3 M170 90 l-7 1 M240 78 l6 -3 M238 90 l7 1" stroke="#ff6b7d" stroke-width="2" stroke-linecap="round" class="ig-blink"/>
     ${igT(66,142,'feels fine',{s:11,c:IG.green})}${igT(204,142,'inside',{s:11,c:IG.red})}`,'Rosa feels fine while her heart works hard inside'),
  agOdds:({good=85,dizzy=35}={})=>igFrame(300,154,[[good,IG.green,'healthy numbers',8],[dizzy,IG.coral,'dizzy spells',154]].map(([n,c,l,x])=>`<rect x="${x}" y="2" width="138" height="150" rx="14" fill="#fff"/>
     <text x="${x+69}" y="27" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="800" fill="${c}"><tspan font-size="24">${n}</tspan><tspan font-size="11" fill="${IG.soft}" font-weight="700" dx="4">out of 100</tspan></text>
     ${agdGrid(x+22,33,9.4,n,c,10.4)}${igT(x+69,146,l,{s:11,c:n?c:IG.soft})}`).join(''),`About ${good} out of 100 keep healthy numbers; about ${dizzy} out of 100 get dizzy spells`),
  agWalk:()=>{const id='agdw'+(++AGD_N);return igFrame(300,132,`<clipPath id="${id}"><rect x="0" y="0" width="300" height="132" rx="12"/></clipPath><g clip-path="url(#${id})">
     <rect x="0" y="0" width="300" height="60" fill="#dff0ff"/><circle cx="34" cy="22" r="10" fill="#ffe08a" opacity=".9"/>
     <rect x="0" y="56" width="300" height="24" fill="#9fd3f0"/><g class="agd-wave"><path d="M0 66 q10 -4 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" stroke="#fff" stroke-width="1.4" fill="none" opacity="0.7"/></g>
     <g transform="translate(196 58)"><rect x="-5" y="-38" width="10" height="38" fill="#fff" stroke="#d5dae6"/><rect x="-5" y="-28" width="10" height="6" fill="${IG.coral}"/><rect x="-5" y="-14" width="10" height="6" fill="${IG.coral}"/><rect x="-7" y="-46" width="14" height="9" rx="2" fill="#ffe08a" class="ig-blink"/><path d="M-8 -46 L0 -53 L8 -46z" fill="${IG.coral}"/></g>
     <g transform="translate(120 66)"><g class="agd-bob"><path d="M-12 0 h24 l-5 6 h-14z" fill="${IG.coral}"/><path d="M0 -1 V-24 L11 -3z" fill="#fff" stroke="#d5dae6"/><path d="M-2 -1 V-18 L-10 -3z" fill="#fff" stroke="#d5dae6"/></g></g>
     <rect x="0" y="80" width="300" height="20" fill="#eadcc6"/><path d="M0 80 H300" stroke="#c9b394" stroke-width="2"/>${[0,1,2,3,4,5,6,7,8,9,10].map(i=>`<path d="M${i*30+8} 100 v-8" stroke="#c9b394" stroke-width="1.4"/>`).join('')}
     <rect x="0" y="100" width="300" height="32" fill="#8cc8ea"/><g class="agd-wave"><path d="M0 110 q10 -4 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" stroke="#fff" stroke-width="2" fill="none" opacity="0.8"/><path d="M10 122 q10 -4 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" stroke="#fff" stroke-width="1.6" fill="none" opacity="0.6"/></g>
     <g class="agd-walk"><g class="agd-step">${mini(26,47.8,Object.assign({},AGD.rosa,{s:1.3,pose:'walk',face:'happy'}))}</g></g>
     <rect x="226" y="4" width="70" height="50" rx="12" fill="#fff"/>${agdDial(261,44,25,8,'agd-ndlgo',`--t:7s;--a0:${(.66*180).toFixed(1)}deg;--a1:${(.5*180).toFixed(1)}deg;transform:rotate(${.5*180}deg)`)}</g>`,'Rosa takes a brisk walk along the harbor')},
  agAdherence:({n=9,sunny}={})=>{const m=10-n,skip=i=>Math.floor((i+1)*m/10+.5)>Math.floor(i*m/10+.5),top=sunny?50:14,X=i=>13+i*28;
    const tiles=[...Array(10)].map((_,i)=>{const sk=skip(i);return `<g ${agdA(5+i*5,8)}><rect x="${X(i)}" y="${top}" width="24" height="44" rx="7" fill="${sk?'#eceef5':'#fff'}" stroke="${sk?'#c9cfe0':IG.line}" stroke-width="1.4" ${sk?'stroke-dasharray="3 3"':''}/>
       ${sk?`<path d="M${X(i)+7} ${top+13} l10 10 M${X(i)+17} ${top+13} l-10 10" stroke="#b4bbd2" stroke-width="2.6" stroke-linecap="round"/>`:`${agdPill(X(i)+12,top+14,.78,-30)}${agdCheck(X(i)+12,top+32,6.5)}`}</g>`}).join('');
    const fs=sunny?`<g ${agdA(60,8)}><g transform="translate(26 22)">${agdPhone(0,0,.62)}</g><rect x="48" y="4" width="64" height="26" rx="13" fill="#ffd84a"/><path d="M58 28 l-4 10 l12 -9z" fill="#ffd84a"/>${igT(80,22,'Skip it!',{s:12,c:'#6b3a1e',w:800})}</g>`:'';
    return igFrame(300,sunny?132:96,`${fs}${tiles}<text x="150" y="${top+68}" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="800" fill="${IG.ink}"><tspan font-size="18" fill="${IG.green}">${n}</tspan><tspan font-size="11" fill="${IG.soft}" dx="4">out of 10 days</tspan></text>`,`Pills taken ${n} days out of 10`)},
  lsTreat:()=>igFrame(300,120,`<path d="M20 104 H190" stroke="${IG.line}" stroke-width="3" stroke-linecap="round"/>
     <g class="agd-sit">${agdPuppy(100,104,1.6)}</g><g class="agd-treat">${agdTreat(100,62)}</g><g class="agd-heart">${agdHeart(128,30,.7)}</g>
     <rect x="200" y="20" width="88" height="84" rx="14" fill="#fff"/>${igT(244,40,'sits',{s:11,c:IG.soft})}
     ${[0,1,2,3].map(i=>`<g ${agdA([10,35,60,85][i],8)}>${agdTreat(222+(i%2)*44,58+Math.floor(i/2)*28)}</g>`).join('')}`,'A puppy gets a treat each time it sits'),
  lsLearn:()=>igFrame(300,120,`<g class="agd-happy">${agdBot(62,70,1.15)}</g>
     ${[0,1,2].map(i=>`<g class="agd-starfly" style="--d:${i*2}s;--sx:40px;--sy:-50px;animation-duration:6s">${agdStar(92,38,8,IG.gold)}</g>`).join('')}
     <rect x="128" y="34" width="160" height="56" rx="14" fill="#fff"/>${igT(208,54,'do it again',{s:11,c:IG.soft})}
     <rect x="142" y="64" width="132" height="14" rx="7" fill="${IG.line}"/><rect x="142" y="64" width="132" height="14" rx="7" fill="${IG.violet}" class="agd-bar"/>`,'An AI gets stars and does that thing more'),
  lsStars:()=>{const st=(sx,sy,d,x)=>`<g class="agd-rain" style="--sx:${sx}px;--sy:${sy}px;--d:${d}s">${agdStar(x,104,5,IG.gold)}</g>`;
    return igFrame(300,142,`<g class="agd-bob">${agdPhone(150,40,1.25)}</g>
     <g class="agd-saya"><rect x="22" y="12" width="92" height="26" rx="13" fill="#ffd84a"/><path d="M112 22 l12 2 l-12 8z" fill="#ffd84a"/>${igT(68,30,'You’re right!',{s:11,c:'#6b3a1e',w:800})}</g>
     <g class="agd-sayb"><rect x="186" y="12" width="92" height="26" rx="13" fill="#ffd84a"/><path d="M188 22 l-12 2 l12 8z" fill="#ffd84a"/>${igT(232,30,'You’re right!',{s:11,c:'#6b3a1e',w:800})}</g>
     ${agdRosa(44,82,1.3,{face:'happy'})}${agdLeo(258,86,1.3,{face:'happy',flip:true})}
     ${st(-88,-30,0,150)}${st(96,-26,.6,154)}${st(-90,-40,1.25,146)}${st(92,-36,1.85,150)}
     <path d="M130 100 h40 v30 a8 8 0 0 1 -8 8 h-24 a8 8 0 0 1 -8 -8z" fill="#fff" opacity=".7"/><path d="M134 108 h32 v22 a5 5 0 0 1 -5 5 h-22 a5 5 0 0 1 -5 -5z" fill="${IG.gold}" opacity=".85" class="agd-jar"/>
     <path d="M130 100 h40 v30 a8 8 0 0 1 -8 8 h-24 a8 8 0 0 1 -8 -8z" fill="none" stroke="#9fb0d6" stroke-width="2.4"/><rect x="126" y="95" width="48" height="7" rx="3.5" fill="#c9d1e6"/>`,'An app tells two people they are right and collects stars')},
  lsBetter:()=>{const pages=['Wk 1','Wk 2','Wk 3'];
    return igFrame(300,124,`<g transform="translate(20 22)"><rect x="0" y="6" width="66" height="74" rx="10" fill="#fff" stroke="${IG.line}" stroke-width="2"/>
       ${pages.map((w,i)=>`<g ${agdA(i*25,8,'transform-origin:top')}><rect x="0" y="6" width="66" height="74" rx="10" fill="#fff" stroke="${IG.line}" stroke-width="2"/><rect x="0" y="6" width="66" height="18" rx="9" fill="${IG.coral}"/><rect x="0" y="16" width="66" height="8" fill="${IG.coral}"/>${igT(33,60,w,{s:16,w:800})}</g>`).join('')}
       <circle cx="18" cy="6" r="3.4" fill="#9aa6c0"/><circle cx="48" cy="6" r="3.4" fill="#9aa6c0"/></g>
     <path d="M96 64 H124" stroke="${IG.soft}" stroke-width="3" stroke-linecap="round" class="agd-flow"/><path d="M120 57 l7 7 l-7 7" fill="none" stroke="${IG.soft}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
     <g transform="translate(0 0)">${agdRosa(158,50,1.2,{face:'happy'})}</g>${agdCheck(178,40,9,'agd-a','animation-name:agd-a65;animation-duration:8s')}
     <path d="M196 64 H224" stroke="${IG.soft}" stroke-width="3" stroke-linecap="round" class="agd-flow"/><path d="M220 57 l7 7 l-7 7" fill="none" stroke="${IG.soft}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
     <circle cx="260" cy="62" r="26" fill="#fff"/><g ${agdA(75,8)}><circle cx="260" cy="62" r="26" fill="${IG.gold}" opacity=".25"/>${agdStar(260,62,16,IG.gold)}</g>${igT(260,108,'reward',{s:11,c:IG.soft})}`,'A reward that checks how people are doing weeks later')}
});
