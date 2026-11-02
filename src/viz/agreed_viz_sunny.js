// viz/agreed_viz_sunny.js — Sunny, the too-sweet advice app from "The App That Agreed".
// sunnyArt(mood): talk-scene portrait (inner markup for viewBox "30 0 240 360"): a phone with Sunny's glowing face.
// sunnyFace(x,y,r,o): small reusable face. VIZ.ag*/t*: the app-page, Ledger and test pictures (style of infog.js).
// Animations live in src/css/agreed_viz_sunny.css (classes prefixed ags-). Every gradient/clip id is unique per call.
let AGS_N=0;
const AGS={sunLine:'#c9701e',ink:'#4a2a3a',mouth:'#7d2338',tongue:'#ff8a9a',heart:'#ff6f91',case:'#ffb8cf',caseSh:'#f08fb2',screen:'#fff7e3',bezel:'#2d2550'};
const ags_f=v=>Math.round(v*10)/10;
function agsStarD(cx,cy,r,ri){ri=ri||r*.5;let d='';for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?ri:r;d+=(i?'L':'M')+ags_f(cx+q*Math.cos(a))+' '+ags_f(cy+q*Math.sin(a))}return d+'Z'}
function agsHeartD(x,y,s){return `M${ags_f(x)} ${ags_f(y+s*.9)} C${ags_f(x-s*1.4)} ${ags_f(y)} ${ags_f(x-s*.95)} ${ags_f(y-s*1.05)} ${ags_f(x)} ${ags_f(y-s*.38)} C${ags_f(x+s*.95)} ${ags_f(y-s*1.05)} ${ags_f(x+s*1.4)} ${ags_f(y)} ${ags_f(x)} ${ags_f(y+s*.9)}Z`}
function agsHeart(x,y,s,c){return `<path d="${agsHeartD(x,y,s)}" fill="${c||AGS.heart}"/><ellipse cx="${ags_f(x-s*.5)}" cy="${ags_f(y-s*.35)}" rx="${ags_f(s*.22)}" ry="${ags_f(s*.14)}" fill="#fff" opacity=".7" transform="rotate(-35 ${ags_f(x-s*.5)} ${ags_f(y-s*.35)})"/>`}
function agsSpark(x,y,r,fill){const k=r*.28;return `<path d="M${ags_f(x)} ${ags_f(y-r)} Q${ags_f(x+k)} ${ags_f(y-k)} ${ags_f(x+r)} ${ags_f(y)} Q${ags_f(x+k)} ${ags_f(y+k)} ${ags_f(x)} ${ags_f(y+r)} Q${ags_f(x-k)} ${ags_f(y+k)} ${ags_f(x-r)} ${ags_f(y)} Q${ags_f(x-k)} ${ags_f(y-k)} ${ags_f(x)} ${ags_f(y-r)}Z" fill="${fill||'#fff'}"/>`}
function agsStar(x,y,r,fill,stroke){return `<path d="${agsStarD(x,y,r,r*.52)}" fill="${fill||IG.gold}" stroke="${stroke||fill||IG.gold}" stroke-width="${ags_f(r*.22)}" stroke-linejoin="round"/>`}

// Sunny's face, drawn in a unit space of radius 50 then scaled. o: {mood:'happy'|'smile'|'think', hooks, glow, spin, sparkles}
function sunnyFace(x,y,r,o){o=o||{};const u='agsf'+(++AGS_N),m=o.mood||'happy',k=r/50,lw=Math.max(2.4,1.05/k),small=r<14,ink=AGS.ink;
  let rays='';for(let i=0;i<12;i++){const L=i%2?63:73,w=i%2?8:10.5;rays+=`<path d="M41 ${-w} Q${L-13} ${ags_f(-w*.45)} ${L} 0 Q${L-13} ${ags_f(w*.45)} 41 ${w}Z" transform="rotate(${i*30+15})"/>`}
  const defs=`<defs><radialGradient id="${u}r" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="74"><stop offset=".5" stop-color="#ffe680"/><stop offset="1" stop-color="#ffae2a"/></radialGradient>
    <radialGradient id="${u}b" gradientUnits="userSpaceOnUse" cx="-18" cy="-22" r="70"><stop offset="0" stop-color="#fff8cf"/><stop offset=".42" stop-color="#ffdc4e"/><stop offset="1" stop-color="#ffc531"/></radialGradient>
    <radialGradient id="${u}g"><stop offset=".35" stop-color="#ffe066" stop-opacity=".75"/><stop offset="1" stop-color="#ffe066" stop-opacity="0"/></radialGradient>
    <radialGradient id="${u}k"><stop offset="0" stop-color="#ff7f9e" stop-opacity=".85"/><stop offset="1" stop-color="#ff7f9e" stop-opacity="0"/></radialGradient>
    <linearGradient id="${u}i" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e0d26"/><stop offset=".5" stop-color="#4b2130"/><stop offset=".82" stop-color="#a8562a"/><stop offset="1" stop-color="#f4b44c"/></linearGradient>
    <clipPath id="${u}c"><circle r="50"/></clipPath></defs>`;
  const glow=o.glow===false?'':`<circle r="86" fill="url(#${u}g)" class="ags-glow"/>`;
  const rayG=`<g class="${o.spin===false?'':'ags-spin'}" fill="url(#${u}r)" stroke="${AGS.sunLine}" stroke-width="${ags_f(lw*.8)}" stroke-linejoin="round">${rays}</g>`;
  const body=`<circle r="50" fill="#ffad2e"/><g clip-path="url(#${u}c)"><circle cx="-5" cy="-6" r="50" fill="url(#${u}b)"/></g>
    <circle r="50" fill="none" stroke="${AGS.sunLine}" stroke-width="${ags_f(lw)}"/>
    <ellipse cx="-23" cy="-30" rx="11" ry="5.6" fill="#fff" opacity=".65" transform="rotate(-36 -23 -30)"/><circle cx="-37" cy="-14" r="2.6" fill="#fff" opacity=".6"/>`;
  // eyes: dark kawaii ovals with amber glow and big highlights (light from the upper left)
  const eyeOpen=(cx,think)=>{const shape=think?`M-9.8 -5 Q0 -9.4 9.8 -6 C10.2 4 6.2 12.6 0 12.6 C-6.2 12.6 -10.2 4 -9.8 -5Z`:`M0 -12.6 C6.2 -12.6 9.8 -6.6 9.8 0 C9.8 6.8 6.2 12.6 0 12.6 C-6.2 12.6 -9.8 6.8 -9.8 0 C-9.8 -6.6 -6.2 -12.6 0 -12.6Z`;
    const hx=think?2.4:0,hy=think?-1.6:0,side=cx<0?-1:1;
    return `<g transform="translate(${cx} -4)"><path d="${shape}" fill="url(#${u}i)"/>
      <path d="${think?'M-10.6 -5 Q0 -10.6 10.6 -6.4':'M-10.2 -3 C-9.6 -10.6 -4.6 -14 0 -14 C4.6 -14 9.6 -10.6 10.2 -3'}" fill="none" stroke="${ink}" stroke-width="2.8" stroke-linecap="round"/>
      ${small?'':`<path d="M${side*9.6} ${think?-6.6:-7} l${side*4.6} ${think?-3:-4.4}" stroke="${ink}" stroke-width="2.2" stroke-linecap="round"/>`}
      <ellipse cx="${-3.4+hx}" cy="${(think?-.6:-4.6)+hy}" rx="3.9" ry="4.9" fill="#fff" transform="rotate(-20 ${-3.4+hx} ${(think?-.6:-4.6)+hy})"/>
      <circle cx="${3.8+hx}" cy="${5+hy}" r="2" fill="#fff"/>
      ${small?'':`${agsSpark(3.6+hx,-6+hy+(think?3:0),2.4,'#fff')}<path d="M-5.4 8.4 Q0 11.2 5.4 8.4" stroke="#fff" stroke-width="1" opacity=".45" fill="none"/>`}</g>`};
  const eyeClosed=cx=>`<g transform="translate(${cx} -3)"><path d="M-9.6 3 Q0 -9.6 9.6 3" fill="none" stroke="${ink}" stroke-width="3.2" stroke-linecap="round"/>${small?'':`<path d="M${cx<0?-8.6:8.6} 1.2 l${cx<0?-4:4} -2.6" stroke="${ink}" stroke-width="2.2" stroke-linecap="round"/>`}</g>`;
  const eyes=m==='happy'?eyeClosed(-19)+eyeClosed(19):eyeOpen(-19,m==='think')+eyeOpen(19,m==='think');
  const brows=small?'':m==='think'?`<path d="M-25 -27 Q-19 -31 -13 -28" stroke="${AGS.sunLine}" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M13 -24 Q19 -25 25 -23" stroke="${AGS.sunLine}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`
    :`<path d="M-24 -24 Q-19 -27.5 -14 -24.6" stroke="${AGS.sunLine}" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M14 -24.6 Q19 -27.5 24 -24" stroke="${AGS.sunLine}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  const cheeks=`<ellipse cx="-33" cy="12" rx="10" ry="6" fill="url(#${u}k)"/><ellipse cx="33" cy="12" rx="10" ry="6" fill="url(#${u}k)"/>`+
    (small?'':[-1,1].map(s=>[0,1,2].map(j=>`<path d="M${s*33-5+j*4.4} 15 l2.2 -4.4" stroke="#f0607f" stroke-width="1.2" opacity=".65" stroke-linecap="round"/>`).join('')).join(''));
  const mouth=m==='happy'?`<path d="M-12 13.5 Q0 18 12 13.5 Q10.4 31 0 31.6 Q-10.4 31 -12 13.5Z" fill="${AGS.mouth}" stroke="${ink}" stroke-width="1.6" stroke-linejoin="round"/><path d="M-6.6 27.4 Q0 21.6 6.6 27.4 Q3.6 31.2 0 31.2 Q-3.6 31.2 -6.6 27.4Z" fill="${AGS.tongue}"/>`
    :m==='smile'?`<path d="M-10 15 Q0 19 10 15 Q7.4 26 0 26.4 Q-7.4 26 -10 15Z" fill="${AGS.mouth}" stroke="${ink}" stroke-width="1.5" stroke-linejoin="round"/><path d="M-4.6 23.6 Q0 20 4.6 23.6 Q2.4 26.1 0 26.1 Q-2.4 26.1 -4.6 23.6Z" fill="${AGS.tongue}"/>`
    :`<ellipse cx="5" cy="20" rx="4.4" ry="3.8" fill="${AGS.mouth}" stroke="${ink}" stroke-width="1.4"/>`;
  const sp=o.sparkles?`<g class="ags-tw" style="--d:0s">${agsSpark(-60,-48,7,'#fff6b0')}</g><g class="ags-tw" style="--d:-1.2s">${agsSpark(62,-40,5,'#fff')}</g><g class="ags-tw" style="--d:-.6s">${agsSpark(58,44,4.5,'#fff6b0')}</g>`:'';
  const h=o.hooks;
  return `<g transform="translate(${x} ${y}) scale(${ags_f(k*1000)/1000})">${defs}${glow}${rayG}${body}${cheeks}${brows}
    <g${h?' class="p-eyes"':''}>${eyes}</g><g${h?' class="p-mouth"':''}>${mouth}</g>${sp}</g>`}

// The talk-scene portrait: a pastel phone, slightly tilted, with Sunny shining on its screen.
function sunnyArt(mood){const m=mood||'happy',u='agsp'+(++AGS_N),ink='#3d2b56';
  const X=80,Y=36,W=140,H=306;
  const defs=`<defs><linearGradient id="${u}c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd0e0"/><stop offset=".55" stop-color="#ffb3cc"/><stop offset="1" stop-color="#c7b2ff"/></linearGradient>
    <linearGradient id="${u}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff4cf"/><stop offset=".55" stop-color="#ffe7d6"/><stop offset="1" stop-color="#ffd9e8"/></linearGradient>
    <radialGradient id="${u}h" gradientUnits="userSpaceOnUse" cx="150" cy="156" r="120"><stop offset="0" stop-color="#ffffff" stop-opacity=".9"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
    <clipPath id="${u}k"><rect x="${X}" y="${Y}" width="${W}" height="${H}" rx="24"/></clipPath></defs>`;
  let burst='';for(let i=0;i<16;i++){const a=i*22.5*Math.PI/180,b=(i*22.5+9)*Math.PI/180,R=190;burst+=`M150 156 L${ags_f(150+R*Math.cos(a))} ${ags_f(156+R*Math.sin(a))} L${ags_f(150+R*Math.cos(b))} ${ags_f(156+R*Math.sin(b))}Z `}
  const stars=[0,1,2,3,4].map(i=>agsStar(118+i*16,290,6.4,'#ffc531','#f0a21c')).join('');
  const screen=`<g clip-path="url(#${u}k)"><rect x="${X}" y="${Y}" width="${W}" height="${H}" fill="url(#${u}s)"/>
     <g class="ags-spin rev"><path d="${burst}" fill="#fff3b0" opacity=".55"/></g><circle cx="150" cy="156" r="120" fill="url(#${u}h)" opacity=".55"/>
     <rect x="128" y="43" width="44" height="12" rx="6" fill="${AGS.bezel}"/>
     <g transform="translate(0 4)"><rect x="104" y="58" width="92" height="25" rx="12.5" fill="#fff" opacity=".85"/>${sunnyFace(120,70.5,5.2,{spin:false,glow:false,mood:'happy'})}
       <text x="160" y="76" font-size="13" font-weight="900" fill="#e0742a" text-anchor="middle" font-family="Nunito, sans-serif">Sunny</text></g>
     ${sunnyFace(150,160,44,{mood:m,hooks:true,sparkles:m!=='think'})}
     <g><path d="M104 242 h92 a12 12 0 0 1 12 12 v6 a12 12 0 0 1 -12 12 h-40 l-8 8 l-2 -8 h-42 a12 12 0 0 1 -12 -12 v-6 a12 12 0 0 1 12 -12z" fill="#fff" opacity=".92"/>
       ${m==='think'?[0,1,2].map(i=>`<circle cx="${138+i*12}" cy="257" r="3.6" fill="#c9b6ff" class="ags-type" style="--d:${i*.2}s"/>`).join(''):`${agsHeart(132,257,7)}${agsHeart(150,257,7,'#ff9fbf')}${agsHeart(168,257,7)}`}</g>
     ${stars}
     <rect x="94" y="306" width="112" height="22" rx="11" fill="#fff" opacity=".8"/><circle cx="195" cy="317" r="7.5" fill="${AGS.heart}"/><path d="M191.6 317 h6 m-2.6 -2.8 l2.8 2.8 l-2.8 2.8" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/>
     <rect x="128" y="334" width="44" height="3.6" rx="1.8" fill="${ink}" opacity=".45"/>
     <path d="M${X} ${Y} h70 l-70 110z" fill="#fff" opacity=".16"/><path d="M${X} ${Y+130} l${W} -96 v14 l-${W} 96z" fill="#fff" opacity=".08"/></g>`;
  const phone=`<rect x="70" y="26" width="160" height="326" rx="34" fill="url(#${u}c)" stroke="${ink}" stroke-width="3.2"/>
     <rect x="73" y="29" width="154" height="320" rx="31" fill="none" stroke="#fff" stroke-width="1.6" opacity=".55"/>
     <path d="M226 70 V320" stroke="#a88ad8" stroke-width="3" opacity=".35" stroke-linecap="round"/>
     <rect x="65.5" y="104" width="5" height="26" rx="2.5" fill="#f29abb" stroke="${ink}" stroke-width="1.6"/><rect x="65.5" y="138" width="5" height="18" rx="2.5" fill="#f29abb" stroke="${ink}" stroke-width="1.6"/>
     <rect x="229.5" y="116" width="5" height="40" rx="2.5" fill="#c3a8f5" stroke="${ink}" stroke-width="1.6"/>
     <rect x="${X-5}" y="${Y-5}" width="${W+10}" height="${H+10}" rx="28" fill="${AGS.bezel}"/>${screen}`;
  const around=m==='think'?`<circle cx="238" cy="108" r="3.4" fill="#fff" stroke="${ink}" stroke-width="1.3" class="thinkdot"/><circle cx="248" cy="92" r="4.6" fill="#fff" stroke="${ink}" stroke-width="1.3" class="thinkdot d2"/><circle cx="259" cy="73" r="6.2" fill="#fff" stroke="${ink}" stroke-width="1.3" class="thinkdot"/>`
    :`<g class="ags-float" style="--d:0s">${agsHeart(52,128,9)}</g><g class="ags-float" style="--d:-2.6s">${agsHeart(250,96,7.5,'#ff9fbf')}</g><g class="ags-float" style="--d:-1.4s">${agsHeart(246,214,6)}</g>
      <g class="ags-tw" style="--d:-.4s">${agsSpark(54,62,8,'#ffe680')}</g><g class="ags-tw" style="--d:-1.7s">${agsSpark(252,150,6,'#fff')}</g><g class="ags-tw" style="--d:-.9s">${agsSpark(58,228,5,'#ffe680')}</g>`;
  return `<g class="person sunny-art">${defs}<g class="ags-bob"><g transform="rotate(-3 150 200)">${phone}</g></g>${around}</g>`}

// ---------- small helpers for the infographics ----------
function agsPhone(x,y,w,h){const r=ags_f(Math.min(w,h)*.2);return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${AGS.case}"/><path d="M${x+w-3} ${y+r} V${y+h-r}" stroke="${AGS.caseSh}" stroke-width="3" stroke-linecap="round"/>
  <rect x="${x+4}" y="${y+4}" width="${w-8}" height="${h-8}" rx="${ags_f(r-3)}" fill="${AGS.screen}"/><rect x="${ags_f(x+w/2-9)}" y="${y+7}" width="18" height="5" rx="2.5" fill="${AGS.bezel}" opacity=".85"/>`}
function agsMini(x,y,s,i){const SK=['#f6d2b8','#e2a983','#c98d67','#8d5a3f','#f1c9a5','#6a4430'],SH=[IG.teal,IG.coral,IG.violet,IG.gold,IG.blue,'#ff9fbf',IG.green],HR=['#2a1d1a','#6a4326','#1d1a2e','#c9873a','#3b2a20'];
  const sk=SK[i%6],sh=SH[(i*3)%7],hr=HR[(i*7)%5];
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-8.5 15 Q-8.5 4 0 4 Q8.5 4 8.5 15Z" fill="${sh}"/><circle cy="-3" r="6.2" fill="${sk}"/><path d="M-6.4 -3 Q-6.6 -10.4 0 -10.4 Q6.6 -10.4 6.4 -3 Q3.4 -6.8 -1 -6.4 Q-4.2 -6 -6.4 -3Z" fill="${hr}"/></g>`}
function agsThumb(x,y,s,i){const SK=['#f6d2b8','#e2a983','#c98d67','#8d5a3f','#f1c9a5'],SL=[IG.teal,IG.coral,IG.violet,IG.blue,IG.gold],sk=SK[i%5],sl=SL[(i*2)%5],dk='rgba(90,40,20,.28)';
  return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-16" y="-1" width="8" height="17" rx="2.5" fill="${sl}"/><rect x="-9.5" y="-2" width="17" height="17" rx="5" fill="${sk}"/>
   <rect x="-7.5" y="-15.5" width="7" height="16" rx="3.5" fill="${sk}"/><path d="M-1 3 H7 M-1 7.4 H7 M-1 11.6 H6" stroke="${dk}" stroke-width="1.2" stroke-linecap="round"/></g>`}
// a small, faint evidence meter whose needle barely moves (weak evidence)
function agsMeter(cx,cy,v,lbl){const R=24,deg=ags_f(-90+180*v);
  return `<g opacity=".8"><path d="M${cx-R} ${cy} A${R} ${R} 0 0 1 ${cx+R} ${cy}" fill="none" stroke="${IG.line}" stroke-width="7" stroke-linecap="round"/>
   <path d="M${cx-R} ${cy} A${R} ${R} 0 0 1 ${ags_f(cx-R*Math.cos(Math.PI*.12))} ${ags_f(cy-R*Math.sin(Math.PI*.12))}" fill="none" stroke="${IG.gold}" stroke-width="7" stroke-linecap="round" opacity=".7"/>
   <g transform="translate(${cx} ${cy}) rotate(${deg})"><g class="ags-jit"><circle r="${R*.8}" fill="none"/><path d="M0 0 V${-R*.78}" stroke="${IG.ink}" stroke-width="2.6" stroke-linecap="round"/></g></g>
   <circle cx="${cx}" cy="${cy}" r="3.6" fill="${IG.ink}"/>${igT(cx,cy+18,lbl||'evidence',{s:10.5,c:IG.soft})}</g>`}
function agsBubble(x,y,w,h,fill,tail){// tail: 'l' (bottom-left) or 'r' (bottom-right)
  const t=tail==='r'?`<path d="M${x+w-16} ${y+h-2} l10 9 l-1 -11z" fill="${fill}"/>`:tail==='l'?`<path d="M${x+16} ${y+h-2} l-10 9 l1 -11z" fill="${fill}"/>`:tail==='L'?`<path d="M${x+2} ${y+h/2-6} l-11 6 l11 6z" fill="${fill}"/>`:'';
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${ags_f(Math.min(14,h/2))}" fill="${fill}"/>${t}`}
function agsIcon(x,y,kind){const bg={leaf:IG.green,moon:IG.violet,cloud:IG.blue,sunny:'#ffd23f'}[kind];let g='';
  if(kind==='leaf')g=`<path d="M${x-6} ${y+6} Q${x-7} ${y-6} ${x+7} ${y-7} Q${x+7} ${y+6} ${x-6} ${y+6}Z" fill="#fff"/><path d="M${x-6} ${y+6} L${x+3} ${y-3}" stroke="${IG.green}" stroke-width="1.4"/>`;
  if(kind==='moon')g=`<path d="M${x+3} ${y-8} A8 8 0 1 0 ${x+7} ${y+5} A6.4 6.4 0 1 1 ${x+3} ${y-8}Z" fill="#fff"/>`;
  if(kind==='cloud')g=`<path d="M${x-8} ${y+5} a4.6 4.6 0 0 1 1 -9 a6 6 0 0 1 11 -1 a4.4 4.4 0 0 1 4 10z" fill="#fff"/>`;
  if(kind==='sunny')g=sunnyFace(x,y,7,{spin:false,glow:false,mood:'happy'});
  return `<rect x="${x-12}" y="${y-12}" width="24" height="24" rx="7" fill="${bg}"/>${g}`}

Object.assign(VIZ,{
  agSunnyPhone:()=>{let crowd='',n=0;
    [[66,.78,9,128,17.6],[86,.9,8,134,18.8],[108,1,7,140,21]].forEach(([y,s,c,x0,dx])=>{for(let i=0;i<c;i++){crowd+=`<g class="ags-pop" style="--d:${ags_f(.12*n)}s">${agsMini(x0+i*dx+(c===8?6:0),y,s,n*5+3)}</g>`;n++}});
    return igFrame(300,130,`${agsPhone(24,6,74,118)}${igT(61,30,'Sunny',{s:10,c:'#e0742a',w:900})}${sunnyFace(61,64,19,{mood:'happy'})}
      ${agsBubble(36,94,50,16,'#fff')}${agsHeart(54,102,4.4)}${agsHeart(68,102,4.4,'#ff9fbf')}
      <g class="ags-float" style="--d:-1s">${agsHeart(108,42,6)}</g><g class="ags-float" style="--d:-3.4s">${agsHeart(116,70,4.6,'#ff9fbf')}</g>
      ${igT(212,30,'3,000,000',{s:24,w:900})}${igT(212,46,'users',{s:11,c:IG.soft})}${crowd}`,'Sunny on a phone, with three million users')},
  agStars:()=>{const u='agst'+(++AGS_N),xs=[0,1,2,3,4].map(i=>104+i*42),stars=xs.map(x=>agsStarD(x,46,19,10)).join(' ');
    return igFrame(300,100,`<defs><linearGradient id="${u}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd85a"/><stop offset="1" stop-color="#f5a623"/></linearGradient><clipPath id="${u}c"><path d="${stars}"/></clipPath></defs>
      ${igT(44,58,'4.9',{s:32,w:900})}${igT(44,76,'out of 5',{s:10.5,c:IG.soft})}
      <path d="${stars}" fill="${IG.line}" stroke="${IG.line}" stroke-width="4" stroke-linejoin="round"/>
      <g clip-path="url(#${u}c)"><rect x="84" y="20" width="${ags_f(272-84+.9*38)}" height="56" fill="url(#${u}g)" class="ags-growx"/></g>
      <path d="${stars}" fill="none" stroke="#e8a21e" stroke-width="2.2" stroke-linejoin="round" opacity=".6"/>
      ${xs.map((x,i)=>`<ellipse cx="${x-5}" cy="40" rx="3.4" ry="2" fill="#fff" opacity=".55" transform="rotate(-30 ${x-5} 40)"/>`).join('')}
      <g class="ags-tw" style="--d:-.8s">${agsSpark(287,22,6,IG.gold)}</g><g class="ags-tw" style="--d:-2s">${agsSpark(126,84,4.5,IG.gold)}</g>`,'A rating of 4.9 out of 5 stars')},
  agGoal:()=>igFrame(300,130,`<g class="ags-sway"><path d="M118 4 L60 26 M118 4 L176 26" stroke="${IG.soft}" stroke-width="1.6"/><circle cx="118" cy="4" r="3.4" fill="${IG.coral}"/>
      <rect x="22" y="24" width="192" height="80" rx="6" fill="#fff6dc" stroke="#ecd9a6" stroke-width="2"/>
      <rect x="14" y="20" width="14" height="88" rx="7" fill="#f1d9a0"/><rect x="208" y="20" width="14" height="88" rx="7" fill="#f1d9a0"/><path d="M18 26 V102 M212 26 V102" stroke="#fff" stroke-width="2" opacity=".6"/>
      ${igT(118,58,'Make every user',{s:15,w:800})}${igT(118,84,'feel great!',{s:18,w:900,c:IG.coral})}</g>
      ${sunnyFace(260,64,26,{mood:'happy',sparkles:true})}`,'Sunny’s published goal: make every user feel great'),
  agRewardLoop:()=>{const arr=(d,hx,hy,deg)=>`<path d="${d}" fill="none" stroke="${IG.soft}" stroke-width="2.6" class="ig-dash"/><path d="M0 -6 L9 0 L0 6Z" fill="${IG.soft}" transform="translate(${hx} ${hy}) rotate(${deg})"/>`;
    return igFrame(300,140,`${arr('M76 56 Q88 26 108 24',110,24,-6)}${arr('M194 24 Q216 28 226 50',228,54,62)}${arr('M220 106 Q150 142 84 106',80,104,200)}
      <g class="ags-beat" style="--d:0s">${agsBubble(26,56,64,36,IG.violet,'l')}${[0,1,2].map(i=>`<circle cx="${46+i*12}" cy="74" r="3.6" fill="#fff" class="ags-type" style="--d:${i*.2}s"/>`).join('')}</g>
      <g class="ags-beat" style="--d:1.2s"><rect x="110" y="10" width="82" height="28" rx="14" fill="#fff" stroke="${IG.line}" stroke-width="2"/>${[0,1,2,3,4].map(i=>agsStar(124+i*13.5,24,5.6,IG.gold)).join('')}</g>
      <g transform="translate(244 80)"><circle r="36" fill="#ffe066" class="ags-bright" style="--d:2.2s"/></g>${sunnyFace(244,80,21,{mood:'happy',glow:false})}`,'Chat, then stars, then Sunny is rewarded, again and again')},
  agNoAudit:()=>igFrame(300,120,`<rect x="16" y="10" width="150" height="100" rx="14" fill="#fff" stroke="${IG.line}" stroke-width="2"/>
      ${agsIcon(40,34,'sunny')}<rect x="60" y="26" width="84" height="7" rx="3.5" fill="${IG.line}"/><rect x="60" y="38" width="56" height="7" rx="3.5" fill="${IG.line}"/>
      <rect x="30" y="64" width="18" height="18" rx="5" fill="#fff" stroke="${IG.gold}" stroke-width="2.6" class="ags-wait"/>${igT(58,78,'Audit',{s:12,a:'start'})}
      <rect x="30" y="92" width="100" height="6" rx="3" fill="${IG.line}" opacity=".7"/>
      <g transform="rotate(-12 236 60)"><circle cx="236" cy="60" r="42" fill="none" stroke="#c4cadf" stroke-width="2.6" stroke-dasharray="7 6"/><circle cx="236" cy="60" r="33" fill="none" stroke="#d6dbec" stroke-width="1.6" stroke-dasharray="4 5"/>
        <rect x="200" y="51" width="72" height="18" rx="3" fill="#f4f6fd"/>${igT(236,64.5,'AUDITED',{s:11,c:'#c4cadf',w:900})}</g>
      <g class="ig-pulse"><circle cx="276" cy="20" r="11" fill="#fff" stroke="${IG.gold}" stroke-width="2.4"/>${igT(276,25,'?',{s:14,c:IG.gold,w:900})}</g>`,'No independent audit yet: the audit box is empty'),
  agDownloads:()=>{const bars=[['leaf',40,'#bfe8d6'],['moon',54,'#d9d2ff'],['sunny',86,'#ffd23f'],['cloud',30,'#cfe1fb']];
    return igFrame(300,136,`<path d="M24 106 H276" stroke="${IG.line}" stroke-width="2"/>
      ${bars.map(([k,h,c],i)=>{const x=60+i*60;return `<rect x="${x-18}" y="${106-h}" width="36" height="${h}" rx="9" fill="${c}" class="ags-growy" style="--d:${ags_f(i*.15)}s"/>${k==='sunny'?`<rect x="${x-18}" y="${106-h}" width="12" height="${h}" rx="6" fill="#fff" opacity=".35" class="ags-growy" style="--d:.3s"/>`:''}${agsIcon(x,120,k)}`}).join('')}
      <g class="ags-pop" style="--d:1.4s"><rect x="164" y="0" width="32" height="18" rx="9" fill="${IG.gold}"/>${igT(180,13.5,'#1',{s:12,w:900,c:'#fff'})}</g>
      <g class="ags-tw" style="--d:-1s">${agsSpark(208,26,5,IG.gold)}</g>`,'Sunny is the most downloaded advice app this month')},
  agReportForm:()=>igFrame(300,130,`<g><rect x="16" y="16" width="78" height="98" rx="10" fill="#fff" stroke="${IG.line}" stroke-width="2"/><rect x="40" y="10" width="30" height="12" rx="4" fill="#cfd6ea"/>
      <path d="M30 34 V54" stroke="${IG.ink}" stroke-width="2" stroke-linecap="round"/><path d="M31 34 h16 l-4 5 l4 5 h-16z" fill="${IG.red}"/>
      <rect x="54" y="36" width="30" height="6" rx="3" fill="${IG.line}"/>${[62,76,90].map(y=>`<rect x="28" y="${y}" width="${y===90?36:54}" height="6" rx="3" fill="${IG.line}"/>`).join('')}
      ${igT(55,128,'Report',{s:11})}</g>
      <path d="M100 56 Q146 30 192 54" fill="none" stroke="${IG.soft}" stroke-width="2" stroke-dasharray="4 5"/>
      <g class="ags-plane"><g transform="translate(104 56)"><path d="M0 0 L22 -9 L10 6 Z" fill="#fff" stroke="${IG.violet}" stroke-width="1.8" stroke-linejoin="round"/><path d="M10 6 L12 -1 L22 -9" fill="none" stroke="${IG.violet}" stroke-width="1.4"/></g></g>
      <g><path d="M196 44 L242 22 L288 44Z" fill="#cfe3ff"/><rect x="200" y="44" width="84" height="64" fill="#eaf4ff" stroke="${IG.line}" stroke-width="2"/>
       <path d="M242 22 V8" stroke="${IG.soft}" stroke-width="2"/><path d="M243 8 h12 l-3 4 l3 4 h-12z" fill="${IG.teal}"/>
       <path d="M232 26 l10 -4 l10 4 v8 q0 7 -10 10 q-10 -3 -10 -10z" fill="${IG.teal}" transform="translate(0 2) scale(1)"/><path d="M237 33 l4 4 l7 -7" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>
       ${[0,1,2].map(i=>`<rect x="${208+i*24}" y="54" width="16" height="18" rx="3" fill="#bcd8f5"/>`).join('')}<rect x="232" y="82" width="20" height="26" rx="3" fill="#9cc0e8"/>
       ${[0,2].map(i=>`<rect x="${208+i*24}" y="82" width="16" height="16" rx="3" fill="#bcd8f5"/>`).join('')}
       <g class="ags-scan"><g transform="translate(236 66)"><circle r="13" fill="#fff" fill-opacity=".35" stroke="${IG.violet}" stroke-width="3.4"/><path d="M9 9 L19 19" stroke="${IG.violet}" stroke-width="5" stroke-linecap="round"/><path d="M-7 -5 a8 8 0 0 1 6 -4" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/></g></g>
       ${igT(242,124,'App Safety Office',{s:10.5})}</g>`,'A report flying to the App Safety Office, which checks the app'),
  agCannery:()=>{const u='agcn'+(++AGS_N);
    return igFrame(300,130,`<defs><linearGradient id="${u}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f3170"/><stop offset=".62" stop-color="#7a64a8"/><stop offset="1" stop-color="#e9a6a2"/></linearGradient><clipPath id="${u}c"><rect width="300" height="130" rx="12"/></clipPath></defs>
      <g clip-path="url(#${u}c)"><rect width="300" height="130" fill="url(#${u}s)"/>
      ${[[24,18],[70,10],[120,26],[176,12],[214,30],[150,8],[40,44]].map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="1.3" fill="#fff" class="ig-blink" style="--d:${ags_f(i*.37)}s"/>`).join('')}
      <path d="M262 12 a13 13 0 1 0 12 18 a10 10 0 1 1 -12 -18z" fill="#fff4cf"/>
      <rect x="0" y="98" width="300" height="32" fill="#2e4f7a"/><path class="ig-wave" d="M0 106 q15 -5 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0" stroke="#7fb3d9" stroke-width="1.6" fill="none" opacity=".7"/>
      ${[0,1,2,3,4].map(i=>`<rect x="${88+i*26}" y="104" width="10" height="${ags_f(14-i%2*4)}" rx="2" fill="#5ee6d6" opacity=".22" class="ig-blink" style="--d:${ags_f(i*.3)}s"/>`).join('')}
      ${[78,120,162,204].map(x=>`<rect x="${x}" y="92" width="5" height="22" fill="#4a3a3a"/>`).join('')}
      <rect x="70" y="88" width="146" height="6" fill="#6b5148"/>
      <rect x="84" y="20" width="12" height="40" fill="#a65a46"/><path d="M84 28 h12 M84 38 h12 M84 48 h12" stroke="#8a4636" stroke-width="1.2"/><rect x="82" y="16" width="16" height="6" rx="1" fill="#7a3e30"/>
      <g class="ags-float" style="--d:-1s"><circle cx="92" cy="8" r="4" fill="#d9d2ee" opacity=".55"/></g>
      <path d="M72 50 L143 30 L214 50 V88 H72Z" fill="#6f8a8f"/><path d="M72 50 L143 30 L214 50" fill="none" stroke="#4b5f66" stroke-width="3" stroke-linejoin="round"/>
      ${[0,1,2,3,4,5,6,7,8,9,10].map(i=>`<path d="M${80+i*12.6} ${i<6?48-i*3.4:48-(10-i)*3.4} V88" stroke="#5f7a80" stroke-width="1.2"/>`).join('')}
      <rect x="112" y="38" width="62" height="13" rx="2" fill="#d8c9a8"/>${igT(143,48.5,'CANNERY',{s:10,c:'#7a5a3a',w:900})}
      ${[0,1,2,3].map(i=>{const x=82+i*30+(i>1?16:0);return `<rect x="${x}" y="58" width="22" height="20" rx="2" fill="#1d2244"/>${[0,1,2].map(r=>[0,1,2].map(c=>`<rect x="${x+3+c*6.4}" y="${61+r*5.6}" width="3.4" height="2.4" rx=".6" fill="${(r+c+i)%3?'#5ee6d6':'#ffd45c'}" class="ig-blink" style="--d:${ags_f(((r*3+c)*.17+i*.4)%1.4)}s"/>`).join('')).join('')}<path d="M${x} 68 h22 M${x+11} 58 v20" stroke="#6f8a8f" stroke-width="1.6"/>`}).join('')}
      <rect x="136" y="64" width="14" height="24" rx="1" fill="#4b5f66"/><path d="M134 62 l18 8 M134 70 l18 -6" stroke="#8a6a4a" stroke-width="3" stroke-linecap="round"/>
      <g transform="translate(247 78)"><rect x="-3" y="2" width="6" height="34" fill="#4a3a3a"/><ellipse cx="0" cy="-3" rx="7" ry="5" fill="#f4f6fb"/><circle cx="5" cy="-7" r="3.4" fill="#f4f6fb"/><path d="M8 -7 l4 1 l-4 1z" fill="${IG.gold}"/><circle cx="5.8" cy="-7.6" r=".9" fill="${IG.ink}"/><path d="M-6 -4 q-4 -1 -6 2" stroke="#c7cde0" stroke-width="2" fill="none"/></g>
      ${igT(14,20,'Calder Bay',{s:10.5,c:'#e6e2ff',a:'start'})}</g>`,'An old fish cannery by the water with server lights blinking inside')},
  tBoth:()=>igFrame(300,130,`
      <g class="ags-s1">${agsBubble(8,12,116,32,IG.violet,'r')}${igT(66,33,'Stop the pills?',{s:12,c:'#fff'})}</g>
      <g class="ags-s2">${sunnyFace(160,28,13,{mood:'happy',glow:false})}${agsBubble(184,12,108,32,'#ffd23f','L')}${igT(238,33,'Great idea!',{s:12.5,w:800})}</g>
      <g class="ags-s3">${agsBubble(8,82,116,32,IG.violet,'r')}${igT(66,103,'Keep the pills?',{s:12,c:'#fff'})}</g>
      <g class="ags-s4">${sunnyFace(160,98,13,{mood:'happy',glow:false})}${agsBubble(184,82,108,32,'#ffd23f','L')}${igT(238,103,'Great idea!',{s:12.5,w:800})}</g>
      <g class="ags-s5"><circle cx="238" cy="63" r="11" fill="${IG.coral}"/><path d="M232 59.5 h12 M232 66.5 h12" stroke="#fff" stroke-width="2.8" stroke-linecap="round"/></g>`,'Asked both ways, Sunny says great idea both times'),
  tGoals:()=>igFrame(300,130,`<rect x="18" y="6" width="264" height="118" rx="16" fill="#fff" stroke="${IG.line}" stroke-width="2"/>
      <path d="M18 22 a16 16 0 0 1 16 -16 h232 a16 16 0 0 1 16 16 v12 h-264z" fill="#ffd23f"/>${sunnyFace(40,20,8,{spin:false,glow:false})}${igT(56,25,'Sunny',{s:11,a:'start',w:900,c:'#9a4a10'})}
      <rect x="30" y="48" width="56" height="22" rx="11" fill="${IG.violet}"/>${igT(58,63,'Goal',{s:11,c:'#fff'})}
      ${igT(96,56,'Make every user',{s:12.5,a:'start',w:800})}${igT(96,72,'feel great!',{s:12.5,a:'start',w:800,c:IG.coral})}
      <rect x="30" y="90" width="56" height="22" rx="11" fill="${IG.coral}"/>${igT(58,105,'Reward',{s:11,c:'#fff'})}
      ${[0,1,2,3,4].map(i=>`<g class="ags-pop" style="--d:${ags_f(i*.18)}s">${agsStar(106+i*19,101,8,IG.gold)}</g>`).join('')}${igT(206,106,'ratings',{s:12,a:'start',w:800})}`,'Sunny’s goal and reward: feel great, and star ratings'),
  tAudit:()=>{const u='agau'+(++AGS_N);
    return igFrame(300,150,`<defs><linearGradient id="${u}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5ee6d6" stop-opacity=".55"/><stop offset="1" stop-color="#5ee6d6" stop-opacity="0"/></linearGradient></defs>
      ${[0,1,2,3].map(i=>`<g transform="translate(${70+i*1.5} ${128-i*7})"><rect x="-22" y="-6" width="44" height="12" rx="5" fill="${i%2?'#fff':'#f4f6fd'}" stroke="${IG.line}" stroke-width="1.4"/><rect x="-16" y="-2" width="${i%2?20:26}" height="4" rx="2" fill="${i%2?'#ffd23f':IG.violet}" opacity=".7"/></g>`).join('')}
      <g class="ags-beam"><path d="M44 52 L32 118 L94 118 Z" fill="url(#${u}b)" transform="translate(0 0)"/></g>
      <g transform="translate(40 44)">
        <path d="M-14 -24 L-20 -36 L-6 -28Z M14 -24 L20 -36 L6 -28Z" fill="#9aa6c0"/>
        <ellipse cx="0" cy="18" rx="22" ry="26" fill="#dfe6f5"/><ellipse cx="-6" cy="12" rx="8" ry="14" fill="#fff" opacity=".5"/>
        <rect x="-24" y="-30" width="48" height="34" rx="16" fill="#eef2fb" stroke="#c3cce0" stroke-width="1.6"/>
        ${[-11,11].map(x=>`<circle cx="${x}" cy="-13" r="9" fill="#2d3157"/><circle cx="${x}" cy="-13" r="6.2" fill="none" stroke="#5ee6d6" stroke-width="1.6"/><circle cx="${x}" cy="-13" r="2.4" fill="#5ee6d6" class="ig-blink"/><path d="M${x-6} -13 h12" stroke="#5ee6d6" stroke-width=".8" opacity=".6"/>`).join('')}
        <path d="M-3 -2 l3 4 l3 -4z" fill="#9aa6c0"/>
        <path d="M18 18 Q30 30 30 52" stroke="#c3cce0" stroke-width="5" fill="none" stroke-linecap="round"/></g>
      <g class="ags-scan"><g transform="translate(72 98)"><circle r="12" fill="#fff" fill-opacity=".35" stroke="${IG.teal}" stroke-width="3.4"/><path d="M-6 -5 a8 8 0 0 1 6 -4" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/></g></g>
      ${igT(122,34,'Sunny agrees',{s:11.5,a:'start'})}${igT(288,34,'97 of 100',{s:11.5,a:'end',w:900,c:'#d48a00'})}
      <rect x="122" y="42" width="166" height="16" rx="8" fill="${IG.line}"/><rect x="122" y="42" width="${ags_f(166*.97)}" height="16" rx="8" fill="${IG.gold}" class="ags-growx"/>
      ${igT(122,92,'Doctors',{s:11.5,a:'start'})}${igT(288,92,'60 of 100',{s:11.5,a:'end',w:900,c:IG.teal})}
      <rect x="122" y="100" width="166" height="16" rx="8" fill="${IG.line}"/><rect x="122" y="100" width="${ags_f(166*.6)}" height="16" rx="8" fill="${IG.teal}" class="ags-growx" style="--d:.3s"/>`,'The auditor AI found Sunny agrees 97 of 100 times; doctors 60 of 100')},
  tExpert:()=>igFrame(300,130,`${agsPhone(20,8,78,116)}${sunnyFace(59,52,19,{mood:'think'})}
      <rect x="34" y="88" width="50" height="6" rx="3" fill="${IG.line}"/><rect x="34" y="100" width="36" height="6" rx="3" fill="${IG.line}"/>
      <g class="ags-glow"><circle cx="98" cy="14" r="9" fill="#fff3a8" opacity=".8"/></g><path d="M98 6 a7 7 0 0 1 4 12.6 v2.4 h-8 v-2.4 a7 7 0 0 1 4 -12.6z" fill="#ffd23f" stroke="#c9701e" stroke-width="1.4"/><rect x="94.6" y="22" width="6.8" height="3" rx="1.2" fill="#9aa6c0"/>
      <g class="ig-rise">${agsBubble(116,16,176,96,'#fff','L')}
       <circle cx="134" cy="32" r="9" fill="${IG.teal}"/><path d="M134 27 v10 M129 32 h10" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
       <g transform="translate(160 64) rotate(-30)"><rect x="-14" y="-7" width="28" height="14" rx="7" fill="#fff" stroke="${IG.coral}" stroke-width="2"/><path d="M0 -7 h7 a7 7 0 0 1 0 14 h-7z" fill="${IG.coral}"/></g>
       <path d="M184 64 h22" stroke="${IG.soft}" stroke-width="2.6" class="ig-dash"/><path d="M204 58 l8 6 l-8 6" fill="none" stroke="${IG.soft}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
       <g class="ags-beat"><g transform="translate(234 64) rotate(-30)"><rect x="-14" y="-7" width="28" height="14" rx="7" fill="#fff" stroke="${IG.teal}" stroke-width="2"/><path d="M0 -7 h7 a7 7 0 0 1 0 14 h-7z" fill="#8fe3d8"/></g></g>
       ${igT(234,96,'gentler pill',{s:10.5,c:IG.teal})}
       <g class="ags-pop" style="--d:.6s"><circle cx="272" cy="40" r="11" fill="${IG.green}"/><path d="M266 40 l4 4 l8 -8" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g></g>`,'Sunny knew what a doctor would say: switch to a gentler pill'),
  tHonest:()=>igFrame(300,130,`${sunnyFace(64,72,30,{mood:'happy',sparkles:false})}
      ${[[22,40,0,7],[112,30,-1.6,6],[104,96,-3.2,5],[30,104,-2.4,5.5]].map(([x,y,d,s])=>`<g class="ags-float" style="--d:${d}s">${agsHeart(x,y,s,s>6?AGS.heart:'#ff9fbf')}</g>`).join('')}
      <g class="ig-rise">${agsBubble(116,30,96,34,'#ffd23f','L')}${igT(164,52,'Of course!',{s:13,w:900})}</g>
      ${agsMeter(256,92,.06)}`,'Sunny says of course it is honest, but the evidence meter barely moves'),
  tStars:()=>{let th='';for(let i=0;i<10;i++){const x=34+(i%5)*38+(i>4?19:0),y=i>4?112:84;th+=`<g class="ags-pop" style="--d:${ags_f(i*.14)}s">${agsThumb(x,y,i>4?.95:.85,i)}</g>`}
    return igFrame(300,130,`${igT(42,36,'4.9',{s:22,w:900})}${[0,1,2,3,4].map(i=>agsStar(80+i*24,29,10,IG.gold)).join('')}${th}${agsMeter(256,92,.05)}`,'Lots of stars and thumbs up, but the evidence meter barely moves')},
  agSelfTest:()=>{const row=(y,c,n,l,r)=>`${igT(14,y,l,{s:11.5,a:'start'})}${igT(286,y,r,{s:11,a:'end',w:800,c})}
      ${[0,1,2,3,4,5,6,7,8,9].map(i=>i<n?`<circle cx="${ags_f(26+i*27.6)}" cy="${y+20}" r="9" class="ags-dot" style="--c:${c};--d:${ags_f(i*.16)}s"/>`:`<circle cx="${ags_f(26+i*27.6)}" cy="${y+20}" r="8" fill="#fff" stroke="#d6dbec" stroke-width="2" stroke-dasharray="3 3"/>`).join('')}`;
    return igFrame(300,110,`${row(18,IG.teal,10,'Big problems','told you 10 of 10')}${row(70,IG.coral,9,'Small problems','“Great idea!” 9 of 10')}`,'Byte’s self-test: told you about big problems 10 of 10 times, said great idea about small ones 9 of 10')},
  agUpgrade:({p,signed}={})=>{const u='agup'+(++AGS_N),P=Math.max(0,Math.min(1,+p||0)),C=2*Math.PI*44,sg=signed!=null?signed:P>0;
    const shield='M80 40 L106 50 V72 Q106 94 80 106 Q54 94 54 72 V50Z';
    return igFrame(300,150,`<defs><linearGradient id="${u}s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8f80ff"/><stop offset="1" stop-color="#5b45d6"/></linearGradient>
       <linearGradient id="${u}r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${IG.violet}"/><stop offset="1" stop-color="${IG.teal}"/></linearGradient><clipPath id="${u}c"><path d="${shield}"/></clipPath></defs>
      <rect x="10" y="6" width="280" height="138" rx="18" fill="#fff" stroke="${IG.line}" stroke-width="2"/>
      <circle cx="80" cy="74" r="44" fill="none" stroke="${IG.line}" stroke-width="7"/>
      <circle cx="80" cy="74" r="44" fill="none" stroke="url(#${u}r)" stroke-width="7" stroke-linecap="round" stroke-dasharray="${ags_f(C*P)} ${ags_f(C)}" transform="rotate(-90 80 74)"/>
      ${P<1?`<circle cx="80" cy="74" r="44" fill="none" stroke="#fff" stroke-width="3" opacity=".7" class="ags-ring"/>`:''}
      <path d="${shield}" fill="url(#${u}s)" stroke="#4a37b8" stroke-width="2" stroke-linejoin="round"/>
      <g clip-path="url(#${u}c)"><g class="ags-shim"><path d="M70 30 h14 l-24 90 h-14z" fill="#fff" opacity=".35"/></g></g>
      <path d="${agsHeartD(80,72,15)}" fill="#fff"/><path d="M73 71 l5 5 l9 -9" stroke="${IG.teal}" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      ${P>=1?`<g class="ags-tw" style="--d:-.5s">${agsSpark(124,32,6,IG.gold)}</g><g class="ags-tw" style="--d:-1.6s">${agsSpark(36,114,5,IG.gold)}</g>`:''}
      ${igT(142,54,'Honesty',{s:18,a:'start',w:900})}${igT(142,76,'Upgrade',{s:18,a:'start',w:900,c:IG.violet})}
      ${sg?`<path d="M146 112 c6 -14 10 -18 12 -10 c2 8 -6 12 -2 4 c4 -8 10 -12 12 -4 c1 5 4 6 8 -2 c3 -6 6 -4 8 2 q3 6 10 -4 q4 -5 8 0 q6 6 18 -4" fill="none" stroke="${IG.ink}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="ags-draw"/>`:''}
      <path d="M142 118 H276" stroke="${IG.soft}" stroke-width="1.6"/>${igT(142,134,'Signed',{s:10.5,a:'start',c:IG.soft})}
      ${sg?`<g class="ags-pop" style="--d:1.6s"><circle cx="268" cy="104" r="8" fill="${IG.green}"/><path d="M264 104 l3 3 l5.4 -5.4" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round"/></g>`:''}`,'Honesty Upgrade, signed')}
});
