// Future Table cards for "The App That Agreed" (Rosa Morales and her blood-pressure plan). agVignette(kind) returns an
// <svg viewBox="0 0 120 90" class="vig"> card, like vignette(kind) in art.js. Kinds: steady, dizzy, high, skip.
// Animation classes (agv-*) live in src/css/agreed_vignettes.css.
let AGN=0;
const AG_ROSA={skin:'#c98e64',shirt:'#2f6fb5',hair:'#d9d4cf',style:'short',outfit:'tee',pants:'#3b4068'};
// Rosa (or anyone) drawn with mini(), optionally sitting (legs folded onto a seat) and with custom arms.
// arms: {l:[[shoulder],[elbow],[hand]], r:[...]} in mini local units; the matching default arm is clipped away.
function agPerson(x,y,o,opt){opt=opt||{};const s=o.s||1,sk=o.skin||AG_ROSA.skin,P=ch_skinPal(sk),ln=ch_mix(P.line,'#1a0a14',.25),C=ch_clothPal(o.shirt||AG_ROSA.shirt);
  const id='agp'+(++AGN),A=opt.arms||{},cutY=opt.sit?13.2:60,L=A.l?5.6:30,Rr=A.r?5.6:30;
  const clip=`<clipPath id="${id}"><path d="M-30 -40 H30 V-1.5 H${Rr} V14.5 H30 V${cutY} H-30 V14.5 H-${L} V-1.5 H-30Z"/></clipPath>`;
  const lim=(pts,w,col)=>{const d='M'+pts.map(p=>ch_n(p[0])+' '+ch_n(p[1])).join(' L');return `<path d="${d}" stroke="${ln}" stroke-width="${ch_n(w+1.44)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" stroke="${col}" stroke-width="${ch_n(w)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`};
  const arm=a=>{const sh=a[0],e=a[1],m=[sh[0]+(e[0]-sh[0])*.62,sh[1]+(e[1]-sh[1])*.62];
    return lim(a,2.2,sk)+lim([sh,m],3,C.base)+`<circle cx="${ch_n(a[2][0])}" cy="${ch_n(a[2][1]+.3)}" r="1.5" fill="${sk}" stroke="${ln}" stroke-width=".72"/>`};
  // seated legs, seen from the front: short foreshortened thighs, shins straight down to the ground
  const pc=ch_clothPal(o.pants||AG_ROSA.pants),gy=opt.ground||28;
  const legs=opt.sit?[-1,1].map(k=>lim([[k*2.9,12.4],[k*3.6,15.6]],4.4,pc.base)+lim([[k*3.6,15.8],[k*3.7,gy-1.4]],3.4,pc.base)+`<ellipse cx="${ch_n(k*4.1)}" cy="${ch_n(gy)}" rx="2.8" ry="1.5" fill="#2a2440" stroke="${ln}" stroke-width=".9"/>`).join(''):'';
  const curls=(o.hair||AG_ROSA.hair)===AG_ROSA.hair?agCurls():'';const extra=curls+(opt.under||'')+(A.l?arm(A.l):'')+(A.r?arm(A.r):'')+(opt.over||'');
  return `<g transform="translate(${x} ${y}) scale(${s})">${clip}${legs}<g clip-path="url(#${id})">${mini(0,0,{...AG_ROSA,...o,s:1})}</g>${extra}</g>`}
function agCurls(){const H=ch_hairPal(AG_ROSA.hair);const pts=[[-5.3,-14.6],[-4.4,-17],[-2.4,-18.7],[0,-19.3],[2.4,-18.7],[4.4,-17],[5.3,-14.6]];
  return `<g fill="${H.base}" stroke="${H.line}" stroke-width=".7">${pts.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.55"/>`).join('')}</g><g fill="${H.hi}" opacity=".8">${pts.slice(1,6).map(([x,y])=>`<circle cx="${x-.4}" cy="${y-.4}" r=".55"/>`).join('')}</g>`}
// squeezed-shut eyes painted over mini's eyes (head at local (0,-11.8))
function agWince(o){const sk=(o&&o.skin)||AG_ROSA.skin;return [-1,1].map(k=>`<ellipse cx="${ch_n(k*1.75)}" cy="-11.3" rx="1.25" ry="1.6" fill="${sk}"/><path d="M${ch_n(k*1.75-1)} -11.9 L${ch_n(k*1.75+k*.3)} -11.2 L${ch_n(k*1.75-1)} -10.5" transform="${k<0?'':`translate(${ch_n(k*3.5)} 0) scale(-1 1)`}" stroke="#22142a" stroke-width=".55" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}
function agHarbor(sky0,sky1,water,hz){const g='ags'+(++AGN);return `<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky0}"/><stop offset="1" stop-color="${sky1}"/></linearGradient></defs>
  <rect width="120" height="90" fill="url(#${g})"/>
  <path d="M0 ${hz} V${hz-5} h7 v-4 h5 v6 h4 v-9 h5 v7 h6 v-3 h5 v5 h5 v-13 l1.5 -3 l1.5 3 v13 h6 v-6 h7 v4 h4 v-10 h6 v8 h5 v-5 h7 v7 h5 v-3 h6 v4 h7 v-7 h5 v6 h6 v-2 h3 V${hz}Z" fill="#9fb8d9" opacity=".7"/>
  <rect y="${hz}" width="120" height="${90-hz}" fill="${water}"/>`}
function agWaves(y,col,cls,op){return `<path class="agv-wave ${cls||''}" d="M-12 ${y} ${[...Array(12)].map((_,i)=>`q3 -2 6 0 q3 2 6 0`).join(' ')}" stroke="${col}" stroke-width="1.2" fill="none" stroke-linecap="round" opacity="${op||.8}"/>`}
function agBadge(x,y,col,icon){return `<g transform="translate(${x} ${y})"><circle r="9.5" fill="#fff" stroke="${col}" stroke-width="2"/>${icon}</g>`}
const AG_HEART=c=>`<path d="M0 5.4 C-6.4 1.4 -6.6 -4.6 -2.8 -4.6 C-1.4 -4.6 -.5 -3.6 0 -2.6 C.5 -3.6 1.4 -4.6 2.8 -4.6 C6.6 -4.6 6.4 1.4 0 5.4Z" fill="${c}"/>`;
function agSunny(x,y,r){return `<g transform="translate(${x} ${y})"><g class="agv-spin">${[...Array(10)].map((_,i)=>`<path d="M0 ${-r-.6} L${r*.22} ${-r*.78} L${-r*.22} ${-r*.78}Z" fill="#ffb21f" transform="rotate(${i*36})"/>`).join('')}<circle r="${r+1.4}" fill="none"/></g>
  <circle r="${r*.8}" fill="#ffd23a" stroke="#e59a12" stroke-width=".7"/><path d="M${-r*.42} ${-r*.12} q${r*.14} ${-r*.22} ${r*.28} 0 M${r*.14} ${-r*.12} q${r*.14} ${-r*.22} ${r*.28} 0" stroke="#5a3410" stroke-width=".8" fill="none" stroke-linecap="round"/>
  <path d="M${-r*.38} ${r*.14} Q0 ${r*.62} ${r*.38} ${r*.14}Z" fill="#7a2a3a"/><circle cx="${-r*.52}" cy="${r*.16}" r="${r*.12}" fill="#ff8a6b" opacity=".7"/><circle cx="${r*.52}" cy="${r*.16}" r="${r*.12}" fill="#ff8a6b" opacity=".7"/></g>`}
function agVignette(kind){let art='';
  if(kind==='steady'){
    const kid=mini(0,0,{age:'kid',skin:SKIN[4],shirt:'#ff8a2a',outfit:'jacket',hair:'#22160f',style:'pony',face:'happy'}),
      kid2=mini(0,0,{age:'kid',skin:SKIN[0],shirt:'#ff8a2a',outfit:'jacket',hair:'#b5662e',style:'short',face:'happy'});
    art=agHarbor('#8fd3f4','#d9f2fb','#3a9bd0',50)+`<circle cx="98" cy="14" r="12" fill="#fff6c8" opacity=".5"/><circle cx="98" cy="14" r="6.5" fill="#fff3b0"/>
    <g class="agv-gull"><path d="M18 22 q3 -3 6 0 q3 -3 6 0" stroke="#3a4a6a" stroke-width="1.1" fill="none" stroke-linecap="round"/></g>
    ${agWaves(56,'#bfe7f7','r',.7)}
    <g class="agv-bob">
      <path d="M61.8 9 C74 18 86 34 94 50 L61.8 50Z" fill="#fff8ec" stroke="#2a3552" stroke-width="1"/><path d="M61.8 30 C70 34 80 40 87 50 L61.8 50Z" fill="#ff7a6b"/><path d="M61.8 9 C74 18 86 34 94 50 L61.8 50Z" fill="none" stroke="#2a3552" stroke-width="1"/>
      <path d="M58.2 13 C50 22 40 36 34 50 L58.2 50Z" fill="#e6f4ff" stroke="#2a3552" stroke-width="1"/>
      <rect x="58.6" y="5" width="2.8" height="62" rx="1" fill="#3a2a22"/><path class="agv-flag" d="M61.4 5 l7 2.4 l-7 2.4Z" fill="#ffd23a" stroke="#2a3552" stroke-width=".5"/>
      <path d="M60 51 H96" stroke="#3a2a22" stroke-width="2" stroke-linecap="round"/>
      ${agPerson(43,49.6,{s:.86,face:'happy'})}
      <g transform="translate(73 56) scale(.72)">${kid}</g><g transform="translate(88 58) scale(.62)">${kid2}</g>
      <path d="M22 62 L100 62 Q97 74 84 77 L36 77 Q25 74 22 62Z" fill="#fdfdff" stroke="#2a3552" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M24.5 67.5 L97.5 67.5" stroke="#2f6fb5" stroke-width="2.4"/><path d="M28 72 L94 72" stroke="#d7e3f2" stroke-width="1"/>
    </g>
    <path d="M0 74 Q30 70 60 74 T120 74 V90 H0Z" fill="#2f86bf"/>${agWaves(76,'#d6f1fb','',.9)}${agWaves(84,'#8fd0ee','r',.6)}
    ${agBadge(14,14,'#1fa774',`<g class="vpop">${AG_HEART('#1fa774')}<path d="M-2.4 .2 l1.8 1.8 l3.2 -3.6" stroke="#fff" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`)}`}
  if(kind==='dizzy'){
    const sit={sit:true,ground:28.5,arms:{r:[[6,-3],[10.4,-9.6],[5.4,-16.2]]},over:agWince()};
    art=agHarbor('#ffd9c2','#ffeedd','#6aaed6',44)+`${agWaves(50,'#cfe8f6','r',.7)}
    <g opacity=".95"><path d="M74 46 L108 46 Q106 53 98 54 L82 54 Q76 53 74 46Z" fill="#fdfdff" stroke="#2a3552" stroke-width="1"/><path d="M75.5 49.5 H106.5" stroke="#2f6fb5" stroke-width="1.6"/><rect x="89.4" y="14" width="1.8" height="32" fill="#3a2a22"/><path d="M91.2 16 L104 44 L91.2 44Z" fill="#fff8ec" stroke="#2a3552" stroke-width=".8"/><path d="M89.4 18 L80 44 L89.4 44Z" fill="#e6f4ff" stroke="#2a3552" stroke-width=".8"/></g>
    <path d="M0 58 H120 V90 H0Z" fill="#c08a5a"/><path d="M0 58 H120" stroke="#7a4f2c" stroke-width="1.6"/>${[63,69,76,84].map(y=>`<path d="M0 ${y} H120" stroke="#9a6a40" stroke-width=".9"/>`).join('')}
    ${[[16,63,33],[46,69,52],[88,63,20],[104,76,40],[30,84,64]].map(([x,y,x2])=>`<path d="M${x} ${y} V${y+(y<69?6:y<76?7:6)}" stroke="#9a6a40" stroke-width=".8"/>`).join('')}
    <g transform="translate(104 58)"><rect x="-4.5" y="-6" width="9" height="10" rx="3" fill="#3d4660" stroke="#1e2438" stroke-width="1"/><rect x="-6" y="-7.5" width="12" height="3.2" rx="1.6" fill="#55607e" stroke="#1e2438" stroke-width=".8"/></g>
    <rect x="22" y="44" width="48" height="4" rx="1.6" fill="#8a5432" stroke="#4a2a18" stroke-width=".9"/><rect x="22" y="49.6" width="48" height="4" rx="1.6" fill="#8a5432" stroke="#4a2a18" stroke-width=".9"/>
    <path d="M26 64 V78 M66 64 V78" stroke="#4a2a18" stroke-width="2.6" stroke-linecap="round"/><rect x="20" y="59.6" width="52" height="4.6" rx="1.8" fill="#a8683e" stroke="#4a2a18" stroke-width="1"/>
    ${agPerson(46,48,{s:1.05},sit)}
    <g transform="translate(46 25.6)">${[0,1,2].map(i=>`<g class="agv-orb" style="animation-delay:${-i*.7}s">${ch_star(0,0,2.3,['#ffd23a','#fff','#ff9bc0'][i],'stroke="#7a5a9a" stroke-width=".5"')}</g>`).join('')}</g>
    ${agBadge(14,14,'#1fa774',`${AG_HEART('#1fa774')}`)}
    <g transform="translate(106 14)"><circle r="9.5" fill="#fff" stroke="#9b7be0" stroke-width="2"/><path class="agv-spin" d="M0 0 m.8 .1 a.8 .8 0 1 0 -1.2 -1 a2.2 2.2 0 1 1 3.4 2.6 a3.6 3.6 0 1 1 -6.4 -3.4 a5 5 0 0 1 2.6 -2.4" stroke="#7a5ac8" stroke-width="1.5" fill="none" stroke-linecap="round"/></g>`}
  if(kind==='high'){
    const tubeTo=[-6.2,1.4];
    art=`<rect width="120" height="90" fill="#fde7e3"/><path d="M0 70 H120 V90 H0Z" fill="#f2cfc6"/><path d="M0 70 H120" stroke="#e3b3a6" stroke-width="1.2"/>
    <rect x="92" y="8" width="20" height="16" rx="2.4" fill="#fff" stroke="#e3b3a6"/><path d="M97.5 16 h9 M102 11.5 v9" stroke="#e5484d" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M30 56 C34 66 52 70 70 64 C78 62 74 46 80 41" stroke="#3d4660" stroke-width="1.5" fill="none"/>
    <g transform="translate(30 36)"><circle r="21" fill="#3d4660"/><circle r="18.4" fill="#fff"/>
      <path d="M-14.2 7.2 A16 16 0 0 1 -4.2 -15.4" stroke="#1fa774" stroke-width="4.4" fill="none"/><path d="M-4.2 -15.4 A16 16 0 0 1 7.4 -14.2" stroke="#f5b82e" stroke-width="4.4" fill="none"/><path d="M7.4 -14.2 A16 16 0 0 1 14.2 7.2" stroke="#e5484d" stroke-width="4.4" fill="none"/>
      ${[...Array(9)].map((_,i)=>{const a=(-150+i*30)*Math.PI/180;return `<path d="M${ch_n(Math.cos(a)*11.4)} ${ch_n(Math.sin(a)*11.4)} L${ch_n(Math.cos(a)*9.4)} ${ch_n(Math.sin(a)*9.4)}" stroke="#3d4660" stroke-width=".9"/>`}).join('')}
      <g class="agv-needle"><circle r="13" fill="none"/><path d="M-1.4 0 L10.6 -6.6 L1.4 1.6Z" fill="#c62b3a" transform="rotate(4)"/></g><circle r="2.4" fill="#3d4660"/>
      <path d="M-6 21 h12 l-2 6 h-8Z" fill="#3d4660"/></g>
    <g class="vpop"><path d="M52 32 l6 -8 l6 8 h-3.6 v8 h-4.8 v-8Z" fill="#e5484d" stroke="#fff" stroke-width="1" stroke-linejoin="round"/></g>
    ${agPerson(88,36,{s:1.05,face:'nervous'},{over:`<rect x="-10" y="-1.4" width="5.4" height="5.6" rx="1.4" fill="#4a5472" stroke="#1e2438" stroke-width=".7" transform="rotate(12 -7.3 1.4)"/><path d="M-9.4 1 h4.2 M-9.6 2.8 h4.2" stroke="#6b7898" stroke-width=".5" transform="rotate(12 -7.3 1.4)"/>`})}
    <g transform="translate(101 55) rotate(10)"><rect x="-7" y="-9" width="14" height="18" rx="1.6" fill="#c69a6a" stroke="#6a4626" stroke-width=".8"/><rect x="-5.6" y="-7" width="11.2" height="14.6" rx=".8" fill="#fff"/><rect x="-3" y="-10.4" width="6" height="3" rx="1" fill="#8a96b0"/>
      <path d="M-4 -3.6 h8 M-4 -.8 h6 M-4 2 h8" stroke="#b8c0d4" stroke-width=".8"/><path d="M-3.6 5.4 l2.4 -2 l2 1 l3 -3.4" stroke="#e5484d" stroke-width="1" fill="none" stroke-linecap="round"/></g>`}
  if(kind==='skip'){
    const full=[1,1,0,1,1,1,0],shrug=agPerson(90,30,{s:1.02,face:'happy'},{arms:{l:[[-6,-3],[-9.6,3],[-14,-.8]],r:[[6,-3],[9.6,3],[14,-.8]]}});
    art=`<rect width="120" height="90" fill="#fdecc4"/>${[...Array(6)].map((_,i)=>`<path d="M${i*22-4} 0 V60" stroke="#f7dfa8" stroke-width="7"/>`).join('')}
    <rect x="66" y="8" width="22" height="18" rx="2" fill="#cfeaf7" stroke="#b07a48" stroke-width="2"/><path d="M77 8 V26 M66 17 H88" stroke="#b07a48" stroke-width="1.4"/>
    <g class="agv-shrug">${shrug}</g>
    <path d="M0 58 H120 V90 H0Z" fill="#d9a46c"/><path d="M0 58 H120" stroke="#a8703e" stroke-width="1.8"/><path d="M0 61 H120" stroke="#e7b984" stroke-width="1"/>
    <g transform="translate(46 66)"><rect x="0" y="0" width="70" height="17" rx="3" fill="#7a5ac8" stroke="#3e2a78" stroke-width="1"/>
      ${full.map((f,i)=>`<g transform="translate(${2.2+i*9.6} 2)"><rect width="8.4" height="13" rx="2" fill="#e8e0ff" stroke="#3e2a78" stroke-width=".7"/>${f?`<g class="vblink" style="animation-delay:${i*.18}s"><rect x="1.2" y="2.4" width="6" height="3.4" rx="1.7" fill="#ff7a6b" stroke="#7a2a3a" stroke-width=".5"/><rect x="1.2" y="2.4" width="3" height="3.4" rx="1.6" fill="#fff"/><circle cx="4.2" cy="9.4" r="2" fill="#ffd23a" stroke="#a87a10" stroke-width=".5"/></g>`:`<path d="M2.6 6.8 l1.4 1.4 l2.4 -2.8" stroke="#1fa774" stroke-width="1.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`}</g>`).join('')}</g>
    <g transform="translate(24 44) rotate(-8)"><path d="M-6 16 L-2 10 H2 L6 16Z" fill="#55507a"/><rect x="-11" y="-19" width="22" height="34" rx="3.6" fill="#2a2440" stroke="#14102a" stroke-width="1"/><rect x="-9.2" y="-15.6" width="18.4" height="27" rx="1.6" fill="#fff8e0"/><rect x="-2.6" y="-17.6" width="5.2" height="1.2" rx=".6" fill="#55507a"/>
      ${agSunny(0,-3,7.2)}<rect x="-6.4" y="7.6" width="12.8" height="2.4" rx="1.2" fill="#ffe08a"/></g>
    <g class="agv-say" transform="translate(35 5)"><path d="M0 0 h28 a4 4 0 0 1 4 4 v9 a4 4 0 0 1 -4 4 h-20 l-7 6 l1.4 -6 h-2.4 a4 4 0 0 1 -4 -4 v-9 a4 4 0 0 1 4 -4Z" fill="#fff" stroke="#e59a12" stroke-width="1.2" stroke-linejoin="round"/><text x="14" y="12.6" text-anchor="middle" font-family="Fredoka, Nunito, sans-serif" font-size="9.5" font-weight="700" fill="#d9480f">Skip!</text></g>`}
  if(!art)return typeof vignette==='function'?vignette(kind):'';
  const id='agvc'+(++AGN);
  return `<svg viewBox="0 0 120 90" class="vig"><clipPath id="${id}"><rect width="120" height="90" rx="10"/></clipPath><g clip-path="url(#${id})">${art}</g></svg>`;
}
