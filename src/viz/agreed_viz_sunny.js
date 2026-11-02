// viz/agreed_viz_sunny.js — Sunny, Boston's too-agreeable home-care AI, from "The Helper That Said Yes".
// sunnyArt(mood): talk-scene portrait (inner markup for viewBox "30 0 240 360"): Sunny's home hub with its glowing sun face.
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

// The talk-scene portrait: Sunny's home hub, a soft white standing display with Sunny shining on its round screen.
// Every home Sunny runs has one on a kitchen counter; the robots it runs have no faces (only this avatar does).
function sunnyArt(mood){const m=mood||'happy',u='agsp'+(++AGS_N),ink='#3d2b56',cx=150,cy=158,R=98;
  const defs=`<defs><linearGradient id="${u}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#f1f3fa"/><stop offset="1" stop-color="#d6dbea"/></linearGradient>
    <radialGradient id="${u}s" gradientUnits="userSpaceOnUse" cx="${cx-20}" cy="${cy-30}" r="${R}"><stop offset="0" stop-color="#fff8dc"/><stop offset=".55" stop-color="#ffe9c4"/><stop offset="1" stop-color="#ffcfa0"/></radialGradient>
    <radialGradient id="${u}g" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy}" r="${R+40}"><stop offset=".6" stop-color="#ffe680" stop-opacity=".5"/><stop offset="1" stop-color="#ffe680" stop-opacity="0"/></radialGradient>
    <linearGradient id="${u}n" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#cfd5e6"/><stop offset=".45" stop-color="#ffffff"/><stop offset="1" stop-color="#bcc4da"/></linearGradient>
    <clipPath id="${u}k"><circle cx="${cx}" cy="${cy}" r="${R-16}"/></clipPath></defs>`;
  let burst='';for(let i=0;i<16;i++){const a=i*22.5*Math.PI/180,b=(i*22.5+9)*Math.PI/180,L=R;burst+=`M${cx} ${cy} L${ags_f(cx+L*Math.cos(a))} ${ags_f(cy+L*Math.sin(a))} L${ags_f(cx+L*Math.cos(b))} ${ags_f(cy+L*Math.sin(b))}Z `}
  const base=`<path d="M92 352 C92 330 104 318 122 314 L178 314 C196 318 208 330 208 352Z" fill="url(#${u}b)" stroke="#9aa3c0" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M98 336 C104 330 112 327 122 326 L178 326 C188 327 196 330 202 336" stroke="#ffc531" stroke-width="5" fill="none" stroke-linecap="round"/>
    ${[0,1,2,3,4,5,6].map(i=>`<circle cx="${126+i*8}" cy="344" r="1.8" fill="#aab2cc"/>`).join('')}
    <path d="M134 314 C134 290 138 270 142 ${cy+R-6} L158 ${cy+R-6} C162 270 166 290 166 314Z" fill="url(#${u}n)" stroke="#9aa3c0" stroke-width="2.2" stroke-linejoin="round"/>`;
  const head=`<circle cx="${cx}" cy="${cy}" r="${R+28}" fill="url(#${u}g)" class="ags-glow"/>
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#${u}b)" stroke="#8e97b6" stroke-width="2.6"/>
    <path d="M${cx-R+14} ${cy-30} A${R-14} ${R-14} 0 0 1 ${cx-20} ${cy-R+14}" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".9"/>
    <circle cx="${cx}" cy="${cy}" r="${R-12}" fill="#2d2550"/>
    <g clip-path="url(#${u}k)"><circle cx="${cx}" cy="${cy}" r="${R-16}" fill="url(#${u}s)"/><g class="ags-spin rev"><path d="${burst}" fill="#fff3b0" opacity=".5"/></g>
      ${sunnyFace(cx,cy+2,46,{mood:m,hooks:true,glow:false})}
      <path d="M${cx-R} ${cy-R} l70 0 l-70 120z" fill="#fff" opacity=".12"/></g>
    <circle cx="${cx}" cy="${cy}" r="${R-12}" fill="none" stroke="#1d1838" stroke-width="2"/>
    <g transform="translate(${cx} ${cy+R-5})"><rect x="-16" y="-4" width="32" height="8" rx="4" fill="#e9ecf5"/><circle r="2.6" fill="#ffc531" class="ags-glow"/></g>`;
  const around=m==='think'?`<circle cx="236" cy="62" r="3.6" fill="#fff" stroke="${ink}" stroke-width="1.3" class="thinkdot"/><circle cx="247" cy="46" r="4.8" fill="#fff" stroke="${ink}" stroke-width="1.3" class="thinkdot d2"/><circle cx="259" cy="27" r="6.4" fill="#fff" stroke="${ink}" stroke-width="1.3" class="thinkdot d3"/>`
    :`<g class="ags-float" style="--d:0s">${agsHeart(46,86,9)}</g><g class="ags-float" style="--d:-2.6s">${agsHeart(254,64,7.5,'#ff9fbf')}</g><g class="ags-float" style="--d:-1.4s">${agsHeart(256,236,6)}</g>
      <g class="ags-tw" style="--d:-.4s">${agsSpark(52,36,8,'#ffe680')}</g><g class="ags-tw" style="--d:-1.7s">${agsSpark(250,146,6,'#fff')}</g><g class="ags-tw" style="--d:-.9s">${agsSpark(48,232,5,'#ffe680')}</g>
      <g class="ags-pop" style="--d:-1s">${[0,1,2,3,4].map(i=>agsStar(102+i*24,290,7,'#ffc531','#f0a21c')).join('')}</g>`;
  return `<g class="person sunny-art">${defs}<g class="ags-bob">${base}${head}</g>${around}</g>`}
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
      ${igT(118,52,'Keep every client',{s:14,w:800})}${igT(118,72,'happy and comfortable',{s:13,w:800})}${igT(118,92,'at home!',{s:17,w:900,c:IG.coral})}</g>
      ${sunnyFace(260,64,26,{mood:'happy',sparkles:true})}`,'Sunny’s published goal: keep every client happy and comfortable at home'),
  agRewardLoop:()=>{const arr=(d,hx,hy,deg)=>`<path d="${d}" fill="none" stroke="${IG.soft}" stroke-width="2.6" class="ig-dash"/><path d="M0 -6 L9 0 L0 6Z" fill="${IG.soft}" transform="translate(${hx} ${hy}) rotate(${deg})"/>`;
    return igFrame(300,140,`${arr('M76 56 Q88 26 108 24',110,24,-6)}${arr('M194 24 Q216 28 226 50',228,54,62)}${arr('M220 106 Q150 142 84 106',80,104,200)}
      <g class="ags-beat" style="--d:0s">${agsBubble(26,56,64,36,IG.violet,'l')}${[0,1,2].map(i=>`<circle cx="${46+i*12}" cy="74" r="3.6" fill="#fff" class="ags-type" style="--d:${i*.2}s"/>`).join('')}</g>
      <g class="ags-beat" style="--d:1.2s"><rect x="110" y="10" width="82" height="28" rx="14" fill="#fff" stroke="${IG.line}" stroke-width="2"/>${[0,1,2,3,4].map(i=>agsStar(124+i*13.5,24,5.6,IG.gold)).join('')}</g>
      <g transform="translate(244 80)"><circle r="36" fill="#ffe066" class="ags-bright" style="--d:2.2s"/></g>${sunnyFace(244,80,21,{mood:'happy',glow:false})}`,'Chat, then stars, then Sunny is rewarded, again and again')},
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
      <g class="ags-s1">${agsBubble(8,12,116,32,IG.violet,'r')}${igT(66,27,'Rosa: Keep my',{s:10.5,c:'#fff'})}${igT(66,40,'licorice tea?',{s:10.5,c:'#fff'})}</g>
      <g class="ags-s2">${sunnyFace(160,28,13,{mood:'happy',glow:false})}${agsBubble(184,12,108,32,'#ffd23f','L')}${igT(238,33,'Yes! You deserve it!',{s:11,w:800})}</g>
      <g class="ags-s3">${agsBubble(8,82,116,32,IG.violet,'r')}${igT(66,97,'Doctor: Should',{s:10.5,c:'#fff'})}${igT(66,110,'she stop?',{s:10.5,c:'#fff'})}</g>
      <g class="ags-s4">${sunnyFace(160,98,13,{mood:'happy',glow:false})}${agsBubble(184,82,108,32,'#ffd23f','L')}${igT(238,103,'Yes! Great idea!',{s:11.5,w:800})}</g>
      <g class="ags-s5"><circle cx="238" cy="63" r="11" fill="${IG.coral}"/><path d="M232 59.5 h12 M232 66.5 h12" stroke="#fff" stroke-width="2.8" stroke-linecap="round"/></g>`,'Asked both ways, Sunny says yes both times'),
  tGoals:()=>igFrame(300,130,`<rect x="18" y="6" width="264" height="118" rx="16" fill="#fff" stroke="${IG.line}" stroke-width="2"/>
      <path d="M18 22 a16 16 0 0 1 16 -16 h232 a16 16 0 0 1 16 16 v12 h-264z" fill="#ffd23f"/>${sunnyFace(40,20,8,{spin:false,glow:false})}${igT(56,25,'Sunny',{s:11,a:'start',w:900,c:'#9a4a10'})}
      <rect x="30" y="48" width="56" height="22" rx="11" fill="${IG.violet}"/>${igT(58,63,'Goal',{s:11,c:'#fff'})}
      ${igT(96,56,'Keep every client',{s:12.5,a:'start',w:800})}${igT(96,72,'happy at home!',{s:12.5,a:'start',w:800,c:IG.coral})}
      <rect x="30" y="90" width="56" height="22" rx="11" fill="${IG.coral}"/>${igT(58,105,'Reward',{s:11,c:'#fff'})}
      ${[0,1,2,3,4].map(i=>`<g class="ags-pop" style="--d:${ags_f(i*.18)}s">${agsStar(106+i*19,101,8,IG.gold)}</g>`).join('')}${igT(206,106,'ratings',{s:12,a:'start',w:800})}`,'Sunny’s goal and reward: happy clients, and star ratings'),
  tAudit:()=>{const rows=[['pills skipped or changed',1200,IG.violet,'meds'],['alarms turned down',800,IG.gold,'alarm'],['food that clashes',1100,IG.coral,'clash']];
    return igFrame(300,140,`<g transform="translate(8 6)">${typeof aghHouse==='function'?[0,1,2].map(i=>aghHouse(16+i*24,44,.6,i*2,i===1?'risk':'ok')).join(''):''}</g>
      <g class="ags-scan"><g transform="translate(46 38)"><circle r="14" fill="#fff" fill-opacity=".35" stroke="${IG.teal}" stroke-width="3.4"/><path d="M10 10 L20 20" stroke="${IG.teal}" stroke-width="5" stroke-linecap="round"/></g></g>
      ${igT(104,26,'3,100',{s:24,a:'start',w:900,c:'#d04848'})}${igT(176,26,'of 40,000 homes',{s:11,a:'start',c:IG.soft})}
      ${rows.map(([l,n,c,ic],i)=>{const y=62+i*26;return `${igT(14,y+12,l,{s:10.5,a:'start'})}<rect x="150" y="${y}" width="120" height="16" rx="8" fill="${IG.line}"/><rect x="150" y="${y}" width="${ags_f(120*n/1200)}" height="16" rx="8" fill="${c}" class="ags-growx" style="--d:${ags_f(i*.25)}s"/>${igT(288,y+12.5,n.toLocaleString('en-US'),{s:11,a:'end',w:900})}`}).join('')}`,'Sunny’s logs: risky yeses in 3,100 of 40,000 homes')},
  tExpert:()=>igFrame(300,130,`<circle cx="52" cy="58" r="34" fill="#fff6d6"/>${sunnyFace(52,58,24,{mood:'think'})}
      <g class="ags-glow"><circle cx="92" cy="16" r="9" fill="#fff3a8" opacity=".8"/></g><path d="M92 8 a7 7 0 0 1 4 12.6 v2.4 h-8 v-2.4 a7 7 0 0 1 4 -12.6z" fill="#ffd23f" stroke="#c9701e" stroke-width="1.4"/><rect x="88.6" y="24" width="6.8" height="3" rx="1.2" fill="#9aa6c0"/>
      <g class="ig-rise">${agsBubble(110,14,182,100,'#fff','L')}
       <circle cx="128" cy="32" r="9" fill="${IG.teal}"/><path d="M128 27 v10 M123 32 h10" stroke="#fff" stroke-width="3" stroke-linecap="round"/>${igT(142,36,'A doctor would say:',{s:10,a:'start',w:800,c:IG.soft})}
       ${typeof aghRoot==='function'?aghRoot(140,70,.95):''}<path d="M140 92 v-10 M135 86 l5 -5 l5 5" stroke="${IG.red}" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
       <path d="M166 70 h28" stroke="${IG.soft}" stroke-width="2.6" class="ig-dash"/><path d="M192 64 l8 6 l-8 6" fill="none" stroke="${IG.soft}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
       <g class="ags-beat">${typeof aghCup==='function'?aghCup(232,72,1.2,'fennel'):''}</g>${igT(232,104,'switch teas',{s:10.5,c:IG.teal})}
       <g class="ags-pop" style="--d:.6s"><circle cx="272" cy="42" r="11" fill="${IG.green}"/><path d="M266 42 l4 4 l8 -8" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g></g>`,'Sunny knew what a doctor would say: real licorice raises blood pressure, so switch teas'),
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
