// hired_viz.js — art for the "Getting Hired" career journey (Care Doctor at Boston Harbor Hospital).
// Globals: VIZ.ankle/braceBoot/rerollBars/healWeeks/painCheck/painHidden/scrimmage/calendar3/benchCheer,
// HIRED_VIG[kind]() Future Table vignettes (120x90, same wrapper as vignette()), DITL_PANELS[i]() day-in-the-life panels (320x200).
// Ari: a 10-year-old goalkeeper (warm brown skin, short curly black hair, green #2fbf71 jersey) who twisted his right ankle.
// Animations are CSS classes prefixed "hv-" (added below), plus the shared ig-* classes from style.css.
document.head.insertAdjacentHTML('beforeend',`<style id="hv-css">
svg.ditl{display:block;width:100%;height:auto}
.hv-bob{animation:hvbob 2.6s ease-in-out infinite;animation-delay:var(--d,0s)}@keyframes hvbob{50%{transform:translateY(-2px)}}
.hv-hop{animation:hvhop 1.3s ease-in-out infinite;animation-delay:var(--d,0s)}@keyframes hvhop{0%,100%{transform:translateY(0)}35%{transform:translateY(-5px)}60%{transform:translateY(0)}}
.hv-wave{transform-box:fill-box;transform-origin:50% 100%;animation:hvwave 1.1s ease-in-out infinite alternate}@keyframes hvwave{from{transform:rotate(-16deg)}to{transform:rotate(14deg)}}
.hv-up{animation:hvup 5s ease-in-out infinite}@keyframes hvup{0%,38%{opacity:0}46%,90%{opacity:1}97%,100%{opacity:0}}
.hv-down{animation:hvdown 5s ease-in-out infinite}@keyframes hvdown{0%,38%{opacity:1}46%,90%{opacity:0}97%,100%{opacity:1}}
.hv-meter{transform-box:fill-box;transform-origin:50% 100%;animation:hvmeter 5s ease-in-out infinite}@keyframes hvmeter{0%,8%{transform:scaleY(.08)}42%,90%{transform:scaleY(1)}100%{transform:scaleY(.08)}}
.hv-hot{animation:hvhot 1.2s ease-in-out infinite}@keyframes hvhot{50%{opacity:.35}}
.hv-sign{stroke-dasharray:var(--len,300);stroke-dashoffset:var(--len,300);animation:hvsign 6s ease-in-out infinite}@keyframes hvsign{0%,12%{stroke-dashoffset:var(--len,300)}55%,92%{stroke-dashoffset:0}100%{stroke-dashoffset:0;opacity:0}}
.hv-nod{transform-box:fill-box;transform-origin:50% 100%;animation:hvnod 1.6s ease-in-out infinite;animation-delay:var(--d,0s)}@keyframes hvnod{0%,100%{transform:rotate(0)}30%{transform:translateY(1.6px) rotate(3deg)}60%{transform:rotate(-1deg)}}
.hv-spin{transform-box:fill-box;transform-origin:center;animation:spin 24s linear infinite}
.hv-ball{animation:hvball 4s ease-in-out infinite alternate}@keyframes hvball{to{transform:translateX(var(--bx,60px))}}
.hv-flick{animation:hvflick 3.4s ease-in-out infinite;animation-delay:var(--d,0s)}@keyframes hvflick{0%,100%{opacity:.95}20%{opacity:.5}24%{opacity:.95}60%{opacity:.75}64%{opacity:.25}68%{opacity:.95}}
.hv-day{animation:hvday 6s infinite;animation-delay:var(--d,0s)}@keyframes hvday{0%,2%{opacity:0}6%,88%{opacity:1}95%,100%{opacity:0}}
.hv-glow{transform-box:fill-box;transform-origin:center;animation:hvglow 2.2s ease-in-out infinite}@keyframes hvglow{0%,100%{opacity:.25;transform:scale(.85)}50%{opacity:.75;transform:scale(1.15)}}
.hv-stretch{transform-box:fill-box;transform-origin:0 50%;animation:hvstretch 2.2s ease-in-out infinite}@keyframes hvstretch{50%{transform:scaleX(1.12)}}
.hv-save{animation:hvsave 3s ease-in-out infinite}@keyframes hvsave{0%,100%{transform:translate(0,0)}50%{transform:translate(-2px,-3px)}}
.hv-rise{animation:hvrise 6s ease-in-out infinite;animation-delay:var(--d,0s)}@keyframes hvrise{0%,4%{opacity:0;transform:translateY(5px)}12%,90%{opacity:1;transform:none}98%,100%{opacity:0}}
@media (prefers-reduced-motion:reduce){[class*="hv-"]{animation:none!important}}
</style>`);

// ---------- a posable kid/grown-up figure in the game's outlined anime style (ground at local y=0) ----------
let HV_N=0;
const HV={ari:{skin:'#a36a43',hair:'#1d1820',hairStyle:'curly',shirt:'#2fbf71',pants:'#26305a',socks:'#2fbf71',num:'1'},
  doc:{adult:true,coat:true,skin:'#eab38f',hair:'#3a2a24',hairStyle:'bun',shirt:'#16b3a6',pants:'#3b4068'},
  mom:{adult:true,skin:'#7a4a2c',hair:'#1d1820',hairStyle:'long',shirt:'#6c5ce7',pants:'#2c3e5c'}};
function hvR(v){return Math.round(v*10)/10}
function hvBuild(adult){return adult?{hipY:-50,kneeY:-27,ankY:-4,shY:-80,shX:11.5,wX:9.5,headY:-97,hs:.92,leg:5.4,arm:4.4}
  :{hipY:-38,kneeY:-21,ankY:-4,shY:-61,shX:10,wX:8.6,headY:-78,hs:1,leg:5,arm:4}}
function hvPose(name,B){const {hipY,kneeY,ankY,shY,shX}=B,dn=s=>[[s*(shX-1),shY+2],[s*(shX+2.5),shY+13],[s*(shX+2.6),shY+24]];
  const up=s=>[[s*(shX-1),shY+2],[s*(shX+8),shY-11],[s*(shX+12),shY-27]],raise=s=>[[s*(shX-1),shY+2],[s*(shX+6),shY-12],[s*(shX+8),shY-28]];
  const lg=s=>[[s*4.4,hipY],[s*4.8,kneeY],[s*4.8,ankY]];
  const P={stand:{a:dn(-1),b:dn(1),la:lg(-1),lb:lg(1)},cheer:{a:up(-1),b:up(1),la:lg(-1),lb:lg(1)},raise:{a:dn(-1),b:raise(1),la:lg(-1),lb:lg(1),hb:'open'},
    thumb:{a:[[-(shX-1),shY+2],[-(shX+5),shY+11],[-(shX-1),shY+18]],b:[[shX-1,shY+2],[shX+6,shY+11],[shX+7,shY-1]],la:lg(-1),lb:lg(1),hb:'thumb'},
    wave:{a:dn(-1),b:raise(1),la:lg(-1),lb:lg(1),hb:'open'},
    hold:{a:[[-(shX-1),shY+2],[-(shX+3),shY+13],[-5,shY+17]],b:[[shX-1,shY+2],[shX+3,shY+13],[5,shY+17]],la:lg(-1),lb:lg(1)},
    crutch:{a:[[-(shX-1),shY+2],[-(shX+4),shY+11],[-(shX+5),shY+20]],b:[[shX-1,shY+2],[shX+4,shY+11],[shX+5,shY+20]],la:[[-4.4,hipY],[-6,kneeY+1],[-2.6,ankY-9]],lb:lg(1),
      crutch:true},
    dive:{a:[[-(shX-2),shY+2],[-5,shY-12],[-3.5,shY-26]],b:[[shX-2,shY+2],[5,shY-12],[3.5,shY-26]],la:[[-4.4,hipY],[-7,kneeY+1],[-6,ankY]],lb:[[4.4,hipY],[10,kneeY-1],[13,ankY-4]],rot:70}};
  const seat=B.hipY<-45?-31:-30,dy=seat-hipY,sh=a=>a.map(p=>[p[0],p[1]+dy]),foot=B.hipY<-45?ankY:seat+21;
  const sitLegs=[[[-4.4,seat],[-7,seat+3],[-7.6,foot]],[[4.4,seat],[7,seat+3],[7.6,foot]]];
  if(name==='sit')return {a:sh(dn(-1)),b:sh(dn(1)),la:sitLegs[0],lb:sitLegs[1],dy};
  if(name==='sitHands')return {a:sh([[-(shX-1),shY+2],[-(shX+2),shY+12],[-6,shY+19]]),b:sh([[shX-1,shY+2],[shX+2,shY+12],[6,shY+19]]),la:sitLegs[0],lb:sitLegs[1],dy};
  if(name==='sitCheer')return {a:sh(up(-1)),b:sh(up(1)),la:sitLegs[0],lb:sitLegs[1],dy};
  if(name==='sitWave')return {a:sh(dn(-1)),b:sh(raise(1)),la:sitLegs[0],lb:sitLegs[1],dy,hb:'open'};
  if(name==='sitProp')return {a:sh([[-(shX-1),shY+2],[-(shX+3),shY+12],[-(shX+1),shY+21]]),b:sh([[shX-1,shY+2],[shX+3,shY+12],[5,shY+18]]),la:[[-4.4,seat],[-14,seat+2],[-25,seat+3]],lb:sitLegs[1],dy,upA:true};
  if(name==='ground'||name==='groundRaise'){const g=-7,d2=g-hipY,s2=a=>a.map(p=>[p[0],p[1]+d2]);
    return {a:s2([[-(shX-1),shY+2],[-(shX+5),shY+12],[-(shX+8),shY+22]]),b:s2(name==='groundRaise'?raise(1):dn(1)),la:[[-3,g],[11,g-1],[26,g+1]],lb:[[4,g],[17,g-6],[31,g-5]],dy:d2,upA:true,upB:true,hb:'open'}}
  return P[name]||P.stand}
function hvFace(f,uid){const ec='#2a1820',L=[],eye=(x)=>`<ellipse cx="${x}" cy="1.4" rx="2.9" ry="3.7" fill="${ec}"/><ellipse cx="${x}" cy="2.9" rx="2.1" ry="1.8" fill="#8a5a3a"/><circle cx="${x-.9}" cy="0" r="1.15" fill="#fff"/><circle cx="${x+1}" cy="3.2" r=".5" fill="#fff"/><path d="M${x-3.4} -1.6 Q${x} -3.4 ${x+3.4} -1.6" stroke="${ec}" stroke-width="1.3" fill="none" stroke-linecap="round"/>`;
  const arc=x=>`<path d="M${x-3} 2 Q${x} -1.8 ${x+3} 2" stroke="${ec}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
  const squeeze=(x,s)=>`<path d="M${x-2.6*s} -.4 L${x+2.2*s} 1.6 L${x-2.6*s} 3.4" stroke="${ec}" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  const half=x=>`<path d="M${x-3} 1 Q${x} 4.8 ${x+3} 1Z" fill="${ec}"/><path d="M${x-3.4} .9 H${x+3.4}" stroke="${ec}" stroke-width="1.3" stroke-linecap="round"/>`;
  const brow=(k)=>({worried:`<path d="M-8.4 -4.4 L-3.4 -6.2 M8.4 -4.4 L3.4 -6.2" stroke="#2a1820" stroke-width="1.1" stroke-linecap="round"/>`,flat:`<path d="M-8.2 -5.4 H-3.4 M8.2 -5.4 H3.4" stroke="#2a1820" stroke-width="1.1" stroke-linecap="round"/>`}[k]||`<path d="M-8.4 -5.2 Q-5.8 -6.8 -3.4 -5.8 M8.4 -5.2 Q5.8 -6.8 3.4 -5.8" stroke="#2a1820" stroke-width="1.1" fill="none" stroke-linecap="round"/>`);
  const open=`<path d="M-3.4 7 Q0 7.8 3.4 7 Q3 11.2 0 11.4 Q-3 11.2 -3.4 7Z" fill="#7a2a3a"/><path d="M-1.8 10.2 Q0 9 1.8 10.2 Q0 11.4 -1.8 10.2Z" fill="#ff8fab"/>`;
  const smile=`<path d="M-2.6 7.6 Q0 9.8 2.6 7.6" stroke="#7a2a3a" stroke-width="1.2" fill="none" stroke-linecap="round"/>`;
  const F={happy:arc(-5.4)+arc(5.4)+brow()+open,smile:eye(-5.4)+eye(5.4)+brow()+smile,
    grin:eye(-5.4)+eye(5.4)+brow('worried')+`<path d="M-4 7 Q0 8 4 7 Q3.4 10.6 0 10.8 Q-3.4 10.6 -4 7Z" fill="#7a2a3a"/><path d="M-3.4 7.2 H3.4 V8.2 H-3.4Z" fill="#fff"/><path d="M12 -8 C13.4 -5.6 14 -4.4 14 -3.4 C14 -2 13 -1.4 12 -1.4 C11 -1.4 10 -2 10 -3.4 C10 -4.4 10.6 -5.6 12 -8Z" fill="#bfe8ff" stroke="#4a9ad8" stroke-width=".5"/>`,
    ouch:squeeze(-5.4,1)+squeeze(5.4,-1)+brow('worried')+`<path d="M-3 8.6 q1 -1.4 2 0 t2 0 t2 0" stroke="#7a2a3a" stroke-width="1.2" fill="none" stroke-linecap="round"/>`,
    sad:eye(-5.4)+eye(5.4)+brow('worried')+`<path d="M-2.6 9.4 Q0 7.2 2.6 9.4" stroke="#7a2a3a" stroke-width="1.2" fill="none" stroke-linecap="round"/><path d="M-7.4 5 q-1.2 2.4 -.4 3.6 q1.1 1 1.7 -.2 q.3 -1.3 -1.3 -3.4Z" fill="#bfe8ff" stroke="#4a9ad8" stroke-width=".45"/>`,
    bored:half(-5.4)+half(5.4)+brow('flat')+`<path d="M-2.2 8.6 H2.6" stroke="#7a2a3a" stroke-width="1.2" stroke-linecap="round"/>`};
  return F[f]||F.smile}
function hvHair(st,H,front){const ln=H.line,b=H.base,hi=H.hi;const ol=(shapes)=>`<g fill="${ln}" stroke="${ln}" stroke-width="2.2" stroke-linejoin="round">${shapes}</g><g fill="${b}">${shapes}</g>`;
  if(!front){if(st==='long')return ol(`<path d="M-15 -4 C-16 -16 -8 -21 0 -21 C8 -21 16 -16 15 -4 L16 18 Q8 22 0 20 Q-8 22 -16 18Z"/>`);
    if(st==='tails')return ol(`<path d="M-13 -6 C-21 -4 -22 8 -19 15 L-16 10 L-14 14 C-15 6 -14 0 -11 -3Z"/><path d="M13 -6 C21 -4 22 8 19 15 L16 10 L14 14 C15 6 14 0 11 -3Z"/>`);
    if(st==='bun')return ol(`<circle cx="0" cy="-21" r="6.4"/>`);
    return ''}
  if(st==='curly'){let c='';const pts=[];for(let i=0;i<11;i++){const a=(178+i*18.4)*Math.PI/180;pts.push([Math.cos(a)*14.2,-3+Math.sin(a)*14.6])}
    pts.push([-9,-12],[-3,-14],[3,-14],[9,-12],[-6,-15.5],[0,-17],[6,-15.5]);c=pts.map(p=>`<circle cx="${hvR(p[0])}" cy="${hvR(p[1])}" r="4.9"/>`).join('');
    return ol(`<path d="M-15 0 C-16 -14 -8 -19 0 -19 C8 -19 16 -14 15 0 L12 -6 L-12 -6Z"/>${c}`)+`<g fill="${hi}" opacity=".55">${[[-8,-15],[-1,-18],[6,-16],[-13,-8]].map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="1.6"/>`).join('')}</g>`}
  const cap='<path d="M-15 1 C-16.4 -14 -8 -19.4 0 -19.4 C8 -19.4 16.4 -14 15 1 L13.4 -4 L11 -7 L8 -4.6 L5 -8.6 L1.4 -5 L-2 -8.8 L-5.4 -4.8 L-8.4 -8 L-11 -4.4 L-13.6 -6Z"/>';
  return ol(cap)+`<path d="M-9 -15 Q-2 -18.6 6 -16.4" stroke="${hi}" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".7"/>`}
function hvMixC(a,b,t){return typeof ch_mix==='function'?ch_mix(a,b,t):a}
function hvFig(x,y,o){o=Object.assign({},o||{});const B=hvBuild(o.adult);B.adult=!!o.adult;const P=typeof o.pose==='object'?o.pose:hvPose(o.pose||'stand',B);const dy=P.dy||0;
  const sk=o.skin||'#eab38f',ln=hvMixC(sk,'#1a0a14',.62),skS=hvMixC(sk,'#5a2a40',.22),shirt=o.shirt||'#2fbf71',shS=hvMixC(shirt,'#1a1240',.25),pants=o.pants||'#26305a',paS=hvMixC(pants,'#000000',.3);
  const hair=o.hair||'#1d1820',H={base:hvMixC(hair,'#3c3456',.18),line:hvMixC(hair,'#000000',.5),hi:hvMixC(hair,'#ffffff',.35)};
  const R=hvR,pth=pts=>'M'+pts.map(p=>R(p[0])+' '+R(p[1])).join(' L');
  const limb=(pts,w,col,shade)=>`<path d="${pth(pts)}" stroke="${ln}" stroke-width="${R(w+1.8)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${pth(pts)}" stroke="${col}" stroke-width="${R(w)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`+(shade?`<path d="${pth(pts)}" stroke="${shade}" stroke-width="${R(w*.34)}" fill="none" stroke-linecap="butt" transform="translate(${R(w*.28)} 0)" opacity=".7"/>`:'');
  const lerp=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
  const shoe='#2a2440',coat=o.coat,cc='#fbfcff',ccS='#d9deee';
  // legs
  const leg=(L,side)=>{const [hp,kn,an]=L,up=side==='a'?P.upA:P.upB;let s='';
    if(o.adult){s+=limb(L,B.leg,pants,paS)}
    else{s+=limb([hp,kn],B.leg,sk,skS);const sock=o.socks;s+=limb([lerp(kn,an,.18),an],B.leg+.4,sock||sk,sock?hvMixC(sock,'#1a1240',.25):skS);
      if(sock)s+=`<path d="${pth([lerp(kn,an,.18),lerp(kn,an,.3)])}" stroke="#fff" stroke-width="${B.leg+.4}" stroke-linecap="butt"/>`;
      s+=limb([hp,lerp(hp,kn,.55)],B.leg+2.6,pants,paS)}
    // foot
    const hurt=o.injured===side;
    if(hurt&&o.boot){const a=an;s+=`<g><path d="M${R(a[0]-5)} ${R(a[1]-13)} h10 l1 13 q5 1 6 4 v3 h-23 v-3 q0 -3 4 -4z" fill="#a8b0c4" stroke="#3a4060" stroke-width="1.2" stroke-linejoin="round"/><path d="M${R(a[0]-7)} ${R(a[1]+6.2)} h23" stroke="#3a4060" stroke-width="2.2" stroke-linecap="round"/>${[-9,-4.4].map(d=>`<rect x="${R(a[0]-6)}" y="${R(a[1]+d)}" width="12" height="2.6" rx="1" fill="#5b6478"/>`).join('')}</g>`;return s}
    if(up)s+=`<ellipse cx="${R(an[0]+2.4)}" cy="${R(an[1]-2)}" rx="3.4" ry="5.6" fill="${shoe}" stroke="${ln}" stroke-width=".9" transform="rotate(20 ${R(an[0]+2.4)} ${R(an[1]-2)})"/>`;
    else s+=`<ellipse cx="${R(an[0]+(an[0]<0?-.8:.8))}" cy="${R(an[1]+2.6)}" rx="5.8" ry="3.3" fill="${shoe}" stroke="${ln}" stroke-width=".9"/><path d="M${R(an[0]-3)} ${R(an[1]+2)} h4" stroke="#fff" stroke-width=".9" stroke-linecap="round" opacity=".8"/>`;
    if(hurt&&o.brace)s+=`<g><path d="M${R(an[0]-4)} ${R(an[1]-8)} h8 l.6 9 q-4.6 2 -9.2 0z" fill="#6f8fe6" stroke="#2c3f8a" stroke-width=".9" stroke-linejoin="round"/><path d="M${R(an[0]-2.4)} ${R(an[1]-6.4)} l4.8 2.6 M${R(an[0]+2.4)} ${R(an[1]-6.4)} l-4.8 2.6 M${R(an[0]-2.4)} ${R(an[1]-3)} l4.8 2.4 M${R(an[0]+2.4)} ${R(an[1]-3)} l-4.8 2.4" stroke="#fff" stroke-width=".8" stroke-linecap="round"/></g>`;
    if(hurt&&o.wrap)s+=`<g><path d="M${R(an[0]-4.4)} ${R(an[1]-9)} h8.8 l.4 10 q-1 3.6 -4.8 4 q-3.8 -.4 -4.8 -4z" fill="#f3d9b1" stroke="#a07a4a" stroke-width=".9" stroke-linejoin="round"/>${[-6.4,-3.4,-.4].map(d=>`<path d="M${R(an[0]-4)} ${R(an[1]+d)} l8.4 -1.6" stroke="#d9b98a" stroke-width=".8"/>`).join('')}</g>`;
    return s};
  let legs=leg(P.la,'a')+leg(P.lb,'b');
  const hipY=B.hipY+dy,shY=B.shY+dy,shX=B.shX,wX=B.wX;
  if(!o.adult)legs+=`<path d="M${-wX} ${R(hipY-4)} H${wX} L${wX+.6} ${R(hipY+4)} Q0 ${R(hipY+6.4)} ${-wX-.6} ${R(hipY+4)}Z" fill="${pants}" stroke="${ln}" stroke-width=".9" stroke-linejoin="round"/>`;
  else legs+=`<path d="M${-wX} ${R(hipY-4)} H${wX} L${wX} ${R(hipY+3)} H${-wX}Z" fill="${pants}"/>`;
  // torso
  const tor=`M${-shX} ${R(shY+2)} Q${-shX} ${R(shY-1.6)} ${-shX+4} ${R(shY-2)} H${shX-4} Q${shX} ${R(shY-1.6)} ${shX} ${R(shY+2)} L${wX+.4} ${R(hipY+1.6)} H${-wX-.4}Z`;
  let body=`<path d="M-2.6 ${R(shY-6)} V${R(shY+1)} H2.6 V${R(shY-6)}Z" fill="${sk}" stroke="${ln}" stroke-width=".8"/>`;
  if(coat){const cl=`M${-shX} ${R(shY+2)} Q${-shX} ${R(shY-1.6)} ${-shX+4} ${R(shY-2)} L-2.6 ${R(shY-2)} L-1.2 ${R(hipY+(dy?2:13))} L${-wX-2.4} ${R(hipY+(dy?2:13))}Z`;
    body+=`<path d="${tor}" fill="${shirt}" stroke="${ln}" stroke-width=".9"/><path d="${cl}" fill="${cc}" stroke="${ln}" stroke-width=".9" stroke-linejoin="round"/><path d="${cl}" transform="scale(-1 1)" fill="${cc}" stroke="${ln}" stroke-width=".9" stroke-linejoin="round"/>
      <path d="M-2.6 ${R(shY-2)} L-5.4 ${R(shY+6)} L-1.6 ${R(shY+9)}Z M2.6 ${R(shY-2)} L5.4 ${R(shY+6)} L1.6 ${R(shY+9)}Z" fill="${ccS}" stroke="${ln}" stroke-width=".6"/><rect x="${R(shX-7.4)}" y="${R(shY+9)}" width="4" height="1.6" rx=".6" fill="#6c5ce7"/><circle cx="-1.6" cy="${R(shY+14)}" r=".7" fill="${ccS}"/><circle cx="-1.6" cy="${R(shY+20)}" r=".7" fill="${ccS}"/>`}
  else body+=`<path d="${tor}" fill="${shirt}" stroke="${ln}" stroke-width=".9" stroke-linejoin="round"/><path d="M${shX*.3} ${R(shY-1.6)} Q${shX*.7} ${R(shY+8)} ${R(wX*.5)} ${R(hipY+1.6)} H${wX+.4} L${shX} ${R(shY+2)} Q${shX} ${R(shY-1.6)} ${shX-4} ${R(shY-2)}Z" fill="${shS}" opacity=".55"/>
    <path d="M-3.4 ${R(shY-2)} L0 ${R(shY+3)} L3.4 ${R(shY-2)}" stroke="#fff" stroke-width="1.6" fill="${sk}" stroke-linejoin="round"/>${o.num?`<text x="0" y="${R(shY+15)}" font-size="9" font-weight="900" fill="#fff" text-anchor="middle" font-family="Nunito, sans-serif">${o.num}</text>`:''}`;
  // arms
  const hand=(p,kind,side)=>{const gl=o.gloves;if(gl)return `<circle cx="${R(p[0])}" cy="${R(p[1]+.4)}" r="4.4" fill="#f4f6fb" stroke="${ln}" stroke-width=".9"/><path d="M${R(p[0]-3.6)} ${R(p[1]+2.6)} h7.2" stroke="#2fbf71" stroke-width="1.8"/>`;
    if(kind==='thumb')return `<rect x="${R(p[0]-3.2)}" y="${R(p[1]-2)}" width="6.4" height="6" rx="2.6" fill="${sk}" stroke="${ln}" stroke-width=".9"/><rect x="${R(p[0]-1.4)}" y="${R(p[1]-7)}" width="2.8" height="6" rx="1.4" fill="${sk}" stroke="${ln}" stroke-width=".9"/>`;
    if(kind==='open')return `<ellipse cx="${R(p[0])}" cy="${R(p[1]-.6)}" rx="3.1" ry="3.8" fill="${sk}" stroke="${ln}" stroke-width=".9"/><path d="M${R(p[0]-1.2)} ${R(p[1]-3.6)} v-1.6 M${R(p[0]+.4)} ${R(p[1]-3.8)} v-1.8 M${R(p[0]+1.8)} ${R(p[1]-3.2)} v-1.4" stroke="${ln}" stroke-width=".6" stroke-linecap="round"/>`;
    return `<circle cx="${R(p[0])}" cy="${R(p[1]+.4)}" r="3.1" fill="${sk}" stroke="${ln}" stroke-width=".9"/>`};
  const arm=(A,kind,side)=>{const sl=coat?A:[A[0],lerp(A[0],A[1],.62)];let s='';
    if(coat)s+=limb(A,B.arm+.6,cc,ccS);else s+=limb(A,B.arm*.86,sk,skS)+limb(sl,B.arm+1.6,shirt,shS);
    return s+hand(A[2],kind,side)};
  let armA=arm(P.a,P.ha,'a'),armB=arm(P.b,P.hb,'b');
  if(o.cast)armB+=`<path d="${pth([lerp(P.b[1],P.b[2],-.05),lerp(P.b[1],P.b[2],.8)])}" stroke="${ln}" stroke-width="${R(B.arm+4.4)}" stroke-linecap="round"/><path d="${pth([lerp(P.b[1],P.b[2],-.05),lerp(P.b[1],P.b[2],.8)])}" stroke="#fff7e0" stroke-width="${R(B.arm+2.6)}" stroke-linecap="round"/><circle cx="${R(lerp(P.b[1],P.b[2],.4)[0])}" cy="${R(lerp(P.b[1],P.b[2],.4)[1])}" r="1.1" fill="#ff8fab"/>`;
  if(o.armBCls)armB=`<g class="${o.armBCls}">${armB}</g>`;
  const crutch=P.crutch?[-1,1].map(s=>{const top=[s*(shX+3),shY+2],bot=[s*(shX+9),-.5];return `<path d="M${R(top[0])} ${R(top[1])} L${R(bot[0])} ${R(bot[1])}" stroke="#7b8bb8" stroke-width="2.6" stroke-linecap="round"/><path d="M${R(top[0]-4)} ${R(top[1])} h8" stroke="#3a4060" stroke-width="3" stroke-linecap="round"/><path d="M${R(s*(shX+4.2)-3)} ${R(shY+20)} h6" stroke="#3a4060" stroke-width="2.4" stroke-linecap="round"/>`}).join(''):'';
  // head
  const headY=B.headY+dy,hs=B.hs,f=o.face||'smile';
  const head=`<g transform="translate(0 ${R(headY)}) scale(${hs})" class="${o.headCls||''}">${hvHair(o.hairStyle||'short',H,false)}
    <circle cx="-14.4" cy="1.6" r="3.4" fill="${sk}" stroke="${ln}" stroke-width=".9"/><circle cx="14.4" cy="1.6" r="3.4" fill="${sk}" stroke="${ln}" stroke-width=".9"/>
    <path d="M-14 -2 C-14 -12 -8 -16 0 -16 C8 -16 14 -12 14 -2 C14 7 8 13.4 0 14.6 C-8 13.4 -14 7 -14 -2Z" fill="${sk}" stroke="${ln}" stroke-width="1.1"/>
    <path d="M7 -12 C13 -8 14 2 9 10 C12 4 13 -2 12.4 -6Z" fill="${skS}" opacity=".5"/>
    <ellipse cx="-8.6" cy="6.4" rx="2.6" ry="1.4" fill="#ff8fab" opacity=".55"/><ellipse cx="8.6" cy="6.4" rx="2.6" ry="1.4" fill="#ff8fab" opacity=".55"/>
    <g>${hvFace(f)}</g>${hvHair(o.hairStyle||'short',H,true)}</g>`;
  const shadow=o.noShadow?'':`<ellipse cx="0" cy="1.6" rx="${o.adult?15:13}" ry="2.8" fill="rgba(20,25,60,.18)"/>`;
  const inner=`${crutch}${legs}${body}${armA}${armB}${head}`;
  const rot=P.rot?` rotate(${P.rot} 0 ${hipY})`:'';
  return `<g transform="translate(${R(x)} ${R(y)}) scale(${o.s||1})${o.flip?' scale(-1 1)':''}" class="${o.cls||''}" style="${o.d!=null?`--d:${o.d}s`:''}">${P.rot?'':shadow}<g${rot?` transform="${rot.trim()}"`:''}>${inner}</g></g>`}
function hvAri(x,y,o){return hvFig(x,y,Object.assign({},HV.ari,o||{}))}
// Byte as a nested svg so its own CSS animations keep their origins; (x,y)=bottom-centre, h=height
function hvByte(x,y,h,o){const w=h*136/150;return `<svg x="${hvR(x-w/2)}" y="${hvR(y-h)}" width="${hvR(w)}" height="${hvR(h)}" viewBox="14 0 136 150" overflow="visible">${byteSVG(o||{})}</svg>`}
// side view of a lower leg and foot (shin top at y0, heel at left); s scales
function hvLeg(x,y,s,o={}){const sk=o.skin||'#c98e64',ln=hvMixC(sk,'#1a0a14',.55);
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M12 14 Q12 0 32 0 Q54 0 54 14 L54 52 C60 70 76 78 96 84 L158 94 C170 100 166 113 150 113 L40 113 C20 113 2 112 0 102 C-2 90 10 78 12 60Z" fill="${sk}" stroke="${ln}" stroke-width="2.4" stroke-linejoin="round"/><path d="M40 113 L150 113 C160 113 164 108 160 102 C130 104 70 106 40 108Z" fill="${hvMixC(sk,'#5a2a40',.2)}" opacity=".6"/></g>`}
function hvMeter(x,y,h,lvl,col,o={}){const fillH=h*lvl/10;
  return `<g transform="translate(${x} ${y})"><rect x="-9" y="-4" width="18" height="${h+8}" rx="9" fill="#fff" stroke="${IG.line}" stroke-width="2"/>
   ${[0,2,4,6,8,10].map(v=>`<path d="M9 ${hvR(h-h*v/10)} h4" stroke="${IG.soft}" stroke-width="1.2"/>`).join('')}
   <text x="17" y="${h+3.5}" font-size="10" font-weight="800" fill="${IG.soft}" font-family="Nunito, sans-serif">0</text><text x="17" y="4" font-size="10" font-weight="800" fill="${IG.soft}" font-family="Nunito, sans-serif">10</text>
   <rect x="-5" y="${hvR(h-fillH)}" width="10" height="${hvR(fillH)}" rx="5" fill="${col}" class="${o.cls||''}"/></g>`}
// tiny calendar tag like the 'moved' recital vignette
function hvTag(x,y,top,bot,col){return `<g transform="translate(${x} ${y})"><rect x="0" y="0" width="26" height="24" rx="3" fill="#fff"/><rect x="0" y="0" width="26" height="7" rx="3" fill="${col||'#6c5ce7'}"/><circle cx="6" cy="3.5" r="1.2" fill="#fff"/><circle cx="20" cy="3.5" r="1.2" fill="#fff"/><text x="13" y="15.5" text-anchor="middle" font-size="6.5" font-weight="800" fill="#2a2140" font-family="Nunito">${T(top)}</text><text x="13" y="21.5" text-anchor="middle" font-size="5" font-weight="700" fill="#6b7190" font-family="Nunito">${T(bot)}</text></g>`}
function hvTrophy(x,y,s){return `<g transform="translate(${x} ${y}) scale(${s||1})"><path d="M-8 -20 h16 v6 q0 10 -8 11 q-8 -1 -8 -11z" fill="#f5b82e" stroke="#b07a12" stroke-width="1.2"/><path d="M-8 -17 q-6 0 -5 5 q1 4 6 4 M8 -17 q6 0 5 5 q-1 4 -6 4" stroke="#b07a12" stroke-width="1.6" fill="none"/><rect x="-1.6" y="-3" width="3.2" height="5" fill="#d9a020"/><rect x="-6" y="2" width="12" height="4" rx="1.2" fill="#8a5a1a"/><path d="M-4 -17 v7" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".7"/></g>`}
function hvBall(x,y,r){return `<g transform="translate(${x} ${y})"><circle r="${r}" fill="#fff" stroke="#2a2440" stroke-width="${hvR(r*.14)}"/><path d="M0 ${-r*.42} l${r*.4} ${r*.3} l${-r*.15} ${r*.46} h${-r*.5} l${-r*.15} ${-r*.46}z" fill="#2a2440"/></g>`}
function hvGrass(y,w,h,c1,c2){let s=`<rect x="0" y="${y}" width="${w}" height="${h}" fill="${c1}"/>`;for(let i=0;i<w/40;i++)s+=`<rect x="${i*40}" y="${y}" width="20" height="${h}" fill="${c2}" opacity=".5"/>`;return s}
function hvSky(id,w,h,c1,c2){return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#${id})"/>`}
function hvSun(x,y,r){return `<g transform="translate(${x} ${y})"><g class="hv-spin">${[0,1,2,3,4,5,6,7].map(i=>`<path d="M0 ${-r-3} v${-r*.55}" stroke="#ffd45c" stroke-width="${hvR(r*.22)}" stroke-linecap="round" transform="rotate(${i*45})"/>`).join('')}</g><circle r="${r}" fill="#ffd45c"/><circle r="${hvR(r*.7)}" fill="#ffe89a"/></g>`}
// team bench: seat top at local y=-30*s (matches hvFig sit poses for kids), ground at 0
function hvBench(x,y,w,s=1){return `<g transform="translate(${x} ${y}) scale(${s})">${[10,w-14].map(px=>`<rect x="${px}" y="-60" width="5" height="60" rx="1.5" fill="#6a4424"/>`).join('')}<rect x="0" y="-58" width="${w}" height="7" rx="3" fill="#c08a5a" stroke="#6a4424" stroke-width="1.2"/><rect x="0" y="-47" width="${w}" height="7" rx="3" fill="#c08a5a" stroke="#6a4424" stroke-width="1.2"/>
  <path d="M-3 -30 H${w+3} L${w} -33 H0Z" fill="#e0aa74"/><rect x="-3" y="-30" width="${w+6}" height="6" rx="2" fill="#b07a4a" stroke="#6a4424" stroke-width="1.2"/>${[14,w-18].map(px=>`<rect x="${px}" y="-24" width="4" height="24" fill="#5a3818"/>`).join('')}</g>`}
function hvGoal(x,y,w,h){let n='';for(let i=1;i<w/7;i++)n+=`<path d="M${i*7} 0 V${h}" stroke="#fff" stroke-width=".6" opacity=".6"/>`;for(let j=1;j<h/7;j++)n+=`<path d="M0 ${j*7} H${w}" stroke="#fff" stroke-width=".6" opacity=".6"/>`;
  return `<g transform="translate(${x} ${y})"><rect x="0" y="0" width="${w}" height="${h}" fill="#ffffff" opacity=".18"/>${n}<path d="M0 ${h} V0 H${w} V${h}" stroke="#fff" stroke-width="3" fill="none" stroke-linejoin="round"/></g>`}

Object.assign(VIZ,{
  ankle:()=>igFrame(300,130,`${hvLeg(64,6,1,{skin:'#e7b896'})}
    <g transform="translate(64 6)" opacity=".95">
      <path d="M42 16 V56" stroke="${IG.boneS}" stroke-width="20" stroke-linecap="round"/><path d="M42 16 V56" stroke="${IG.bone}" stroke-width="15" stroke-linecap="round"/>
      <path d="M24 18 V58" stroke="${IG.boneS}" stroke-width="10" stroke-linecap="round"/><path d="M24 18 V58" stroke="${IG.bone}" stroke-width="6" stroke-linecap="round"/>
      <circle cx="25" cy="64" r="7.6" fill="${IG.bone}" stroke="${IG.boneS}" stroke-width="2.4"/>
      <ellipse cx="50" cy="73" rx="16" ry="10" fill="${IG.bone}" stroke="${IG.boneS}" stroke-width="2.4"/>
      <ellipse cx="24" cy="96" rx="18" ry="10" fill="${IG.bone}" stroke="${IG.boneS}" stroke-width="2.4"/>
      <ellipse cx="80" cy="88" rx="13" ry="8" fill="${IG.bone}" stroke="${IG.boneS}" stroke-width="2.4"/>
      ${[[92,90,140,100],[94,97,142,106],[148,101,158,103],[148,106,156,108]].map(([a,b,c,d])=>`<path d="M${a} ${b} L${c} ${d}" stroke="${IG.boneS}" stroke-width="8" stroke-linecap="round"/><path d="M${a} ${b} L${c} ${d}" stroke="${IG.bone}" stroke-width="5" stroke-linecap="round"/>`).join('')}
      <ellipse cx="44" cy="74" rx="22" ry="12" fill="${IG.coral}" class="hv-glow"/>
      <g class="hv-stretch"><path d="M27 69 L60 79" stroke="#c43b47" stroke-width="9" stroke-linecap="round"/><path d="M27 69 L60 79" stroke="${IG.coral}" stroke-width="6" stroke-linecap="round"/><path d="M34 70.2 l2 1.2 M41 72.2 l2 1.2 M48 74.2 l2 1.2" stroke="#ffd0c8" stroke-width="1.2" stroke-linecap="round"/></g>
    </g>
    <path d="M188 30 C150 30 130 50 112 76" stroke="${IG.coral}" stroke-width="2" fill="none" stroke-dasharray="4 3"/><circle cx="112" cy="77" r="2.6" fill="${IG.coral}"/>
    ${igT(194,34,'ligament',{s:15,c:IG.coral,a:'start',w:800})}`,'The outer ankle ligament, gently stretched'),
  braceBoot:()=>igFrame(300,140,`
    <g class="ig-rise"><rect x="8" y="4" width="136" height="108" rx="16" fill="#f4f6fd" stroke="${IG.line}"/>${hvLeg(40,12,.52,{skin:'#c98e64'})}
      <g transform="translate(40 12) scale(.52)"><path d="M8 34 L56 34 L58 60 C66 74 84 80 104 86 L104 112 L40 112 C14 112 -2 108 0 96 C2 84 8 74 8 60Z" fill="#6f8fe6" stroke="#2c3f8a" stroke-width="3" stroke-linejoin="round"/>
      ${[42,54,66].map(yy=>`<path d="M22 ${yy} L44 ${yy+8} M44 ${yy} L22 ${yy+8}" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`).join('')}<path d="M8 100 H100" stroke="#2c3f8a" stroke-width="3" opacity=".5"/></g></g>
    <g class="ig-rise" style="--d:.4s"><rect x="156" y="4" width="136" height="108" rx="16" fill="#f4f6fd" stroke="${IG.line}"/>${hvLeg(188,12,.52,{skin:'#c98e64'})}
      <g transform="translate(188 12) scale(.52)"><path d="M2 8 L62 8 L62 62 C70 74 96 80 150 86 C166 88 170 98 166 112 L4 112 C-4 112 -2 98 0 86Z" fill="#a8b0c4" stroke="#3a4060" stroke-width="3" stroke-linejoin="round"/>
      <path d="M-4 118 Q80 130 170 118 L166 112 L4 112Z" fill="#3a4060"/>${[22,46,70].map(yy=>`<rect x="-2" y="${yy}" width="68" height="11" rx="4" fill="#5b6478"/><rect x="48" y="${yy+2}" width="12" height="7" rx="2" fill="#c7cfe0"/>`).join('')}<rect x="80" y="84" width="70" height="11" rx="4" fill="#5b6478" transform="rotate(8 80 84)"/></g></g>
    ${igT(76,130,'Brace',{s:13})}${igT(224,130,'Walking boot',{s:13})}`,'An ankle brace and a walking boot'),
  rerollBars:(a={})=>{const nb=a.hidden?3:1,nt=a.hidden?5:2;const row=(y,n,lab)=>{let s=`${igT(10,y-24,lab,{s:12,a:'start'})}<g>${igT(290,y-24,n+' of 10',{s:12,a:'end',c:IG.red})}</g>`;
      for(let i=0;i<10;i++){const x=24+i*28,on=i<n;s+=`<g class="${on?'hv-hot':''}" style="animation-delay:${i*.2}s"><circle cx="${x}" cy="${y-6}" r="5.4" fill="${on?IG.red:IG.teal}"/><path d="M${x-7} ${y+12} v-6 q0 -6 7 -6 q7 0 7 6 v6z" fill="${on?IG.red:IG.teal}"/></g>`}
      return s};
    return igFrame(300,120,`${row(46,nb,'Brace')}${row(104,nt,'Tape only')}`,a.hidden?'Rolled again: brace 3 in 10, tape 5 in 10':'Rolled again: brace 1 in 10, tape 2 in 10')},
  healWeeks:()=>{const X=w=>16+w*(268/6);return igFrame(300,130,`
    ${igT(16,22,'First sprain: about 2 weeks',{s:12,a:'start'})}<rect x="16" y="30" width="268" height="16" rx="8" fill="${IG.line}" opacity=".6"/><rect x="16" y="30" width="${hvR(X(2)-16)}" height="16" rx="8" fill="${IG.teal}" class="ig-grow"/>
    ${igT(16,70,'Second sprain: about 6 weeks',{s:12,a:'start'})}<rect x="16" y="78" width="268" height="16" rx="8" fill="${IG.line}" opacity=".6"/><rect x="16" y="78" width="268" height="16" rx="8" fill="${IG.coral}" class="ig-grow" style="--d:.5s"/>
    <path d="M16 106 H284" stroke="${IG.line}" stroke-width="2"/>${[0,1,2,3,4,5,6].map(w=>`<path d="M${hvR(X(w))} 102 v8" stroke="${IG.soft}"/>${igT(hvR(X(w)),124,w===0?'Start':'Wk '+w,{s:10,c:IG.soft})}`).join('')}`,'A first sprain heals in about 2 weeks, and a second sprain takes about 6 weeks')},
  painCheck:()=>igFrame(300,140,`<rect x="0" y="0" width="300" height="140" rx="12" fill="#e6f6ff"/>${hvGrass(92,300,48,'#7fd08a','#6cc47a')}${hvGoal(14,30,70,64)}
    <g transform="translate(118 0)"><ellipse cx="11" cy="118" rx="26" ry="4" fill="rgba(20,25,60,.15)"/>
      <g class="hv-down">${hvAri(0,120,{pose:'ground',face:'smile',gloves:true,s:1.1,noShadow:true})}</g>
      <g class="hv-up"><ellipse cx="30" cy="113" rx="9" ry="7" fill="${IG.coral}" class="hv-glow"/>${hvAri(0,120,{pose:'groundRaise',face:'ouch',gloves:true,s:1.1,noShadow:true})}</g></g>
    <g class="hv-up">${igT(184,46,'Ow!',{s:16,c:IG.red,w:800})}</g>
    ${hvMeter(250,22,96,7,IG.gold,{cls:'hv-meter'})}${igT(250,136,'Pain',{s:11,c:IG.ink})}`,'Ari sits down and raises his hand when it hurts'),
  painHidden:()=>igFrame(300,140,`<rect x="0" y="0" width="300" height="140" rx="12" fill="#e6f6ff"/>${hvGrass(104,300,36,'#7fd08a','#6cc47a')}
    ${hvAri(100,128,{pose:'thumb',face:'grin',gloves:false,s:.98,injured:'a'})}<circle cx="94" cy="124" r="8" fill="${IG.red}" opacity=".35" class="hv-glow"/>
    <g class="ig-rise"><rect x="136" y="10" width="92" height="34" rx="16" fill="#fff" stroke="${IG.line}" stroke-width="2"/><path d="M148 42 l-12 12 l22 -10z" fill="#fff" stroke="${IG.line}" stroke-width="2" stroke-linejoin="round"/><rect x="146" y="38" width="16" height="6" fill="#fff"/>${igT(182,33,'I&#8217;m fine!',{s:14,w:800})}</g>
    ${hvMeter(256,22,96,9,IG.red,{cls:'hv-hot'})}${igT(256,136,'Pain',{s:11,c:IG.ink})}`,'Ari says he is fine while his pain is high'),
  scrimmage:()=>{const team=(xs,y,col,dir)=>xs.map((x,i)=>`<g class="hv-bob" style="--d:${(i*.37).toFixed(2)}s">${mini(x,y,{age:'kid',shirt:col,s:.66,pose:'walk',flip:dir<0,hair:['#1d1820','#5a3420','#2a2030'][i%3],skin:SKIN[(i*2+(dir>0?1:0))%6],pants:'#26305a',skirt:false,style:['short','curly','pony'][i%3]})}</g>`).join('');
    return igFrame(300,140,`<defs><clipPath id="hvsc"><rect width="300" height="140" rx="12"/></clipPath></defs><g clip-path="url(#hvsc)">${hvSky('hvsk'+(++HV_N),300,140,'#8fd0ff','#dff3ff')}${hvSun(262,26,11)}${cloud(70,28,.42,.95,'',0)}
    ${hvGrass(70,300,70,'#79cc84','#69c076')}<path d="M0 70 H300" stroke="#fff" stroke-width="2" opacity=".8"/><path d="M150 70 V140" stroke="#fff" stroke-width="2" opacity=".8"/><ellipse cx="150" cy="104" rx="38" ry="14" stroke="#fff" stroke-width="2" fill="none" opacity=".8"/>
    ${hvGoal(4,52,26,34)}${hvGoal(270,52,26,34)}
    ${team([62,100,130],84,'#2fbf71',1)}${team([178,212,246],86,'#ff9f43',-1)}
    <g class="hv-ball" style="--bx:34px"><g transform="translate(134 124)">${hvBall(0,0,5)}</g></g>
    <path d="M90 8 Q150 22 210 8" stroke="#6b7aa8" stroke-width="1.2" fill="none"/>
    <g class="hv-bob"><path d="M100 10 h100 v18 q-50 8 -100 0z" fill="#ff7a6b" stroke="#c4473c" stroke-width="1.4"/>${igT(150,25,'Friendly game',{s:12,c:'#fff',w:800})}</g>
    <g transform="translate(12 6)"><rect width="34" height="30" rx="5" fill="#fff" stroke="${IG.line}"/><rect width="34" height="10" rx="5" fill="${IG.violet}"/><rect y="6" width="34" height="4" fill="${IG.violet}"/>${igT(17,25,'SAT',{s:11,w:900})}</g></g>`,'A friendly scrimmage on a sunny Saturday')},
  calendar3:()=>{const cw=37,x0=20,y0=46,rh=22,days=T('S M T W T F S').split(' ');let cells='';
    for(let r=0;r<4;r++)for(let c=0;c<7;c++){const x=x0+c*cw,y=y0+r*rh,i=r*7+c,today=r===0&&c===4,play=r===3&&c===6,past=r===0&&c<4,lit=!past&&!today;
      cells+=`<rect x="${x+2}" y="${y+2}" width="${cw-4}" height="${rh-4}" rx="5" fill="${past?'#f4f6fd':'#fff'}" stroke="${IG.line}"/>`;
      if(lit&&!play)cells+=`<rect x="${x+2}" y="${y+2}" width="${cw-4}" height="${rh-4}" rx="5" fill="#e3f8f5" class="hv-day" style="--d:${((i-4)*.16).toFixed(2)}s"/>`}
    const tx=x0+4*cw+cw/2,ty=y0+rh/2,px=x0+6*cw+cw/2,py=y0+3*rh+rh/2;
    return igFrame(300,144,`<rect x="14" y="6" width="272" height="134" rx="14" fill="#fff" stroke="${IG.line}" stroke-width="2"/><path d="M14 20 a14 14 0 0 1 14 -14 h244 a14 14 0 0 1 14 14 v6 h-272z" fill="${IG.violet}"/>${igT(150,22,'Next 3 weeks',{s:11,c:'#fff',w:800})}
      ${days.map((d,c)=>igT(x0+c*cw+cw/2,41,d,{s:10,c:IG.soft})).join('')}${cells}
      <rect x="${tx-cw/2+2}" y="${y0+2}" width="${cw-4}" height="${rh-4}" rx="5" fill="${IG.teal}"/>${igT(tx,ty+3.6,'Today',{s:10,c:'#fff',w:800})}
      <g transform="translate(${x0+6*cw+cw/2} ${y0+rh/2})">${hvBall(0,0,6)}</g>
      <rect x="${px-cw/2+2}" y="${py-rh/2+2}" width="${cw-4}" height="${rh-4}" rx="5" fill="#fff3d0" stroke="${IG.gold}" stroke-width="2"/><g class="ig-pulse">${hvTrophy(px,py+5,.7)}</g>`,'A calendar from today to the playoffs three weeks later')},
  benchCheer:()=>{const mates=[{skin:'#f1cfb6',hair:'#e0a040',hairStyle:'tails'},{skin:'#7a4a2c',hair:'#1d1820',hairStyle:'short'},null,{skin:'#eab38f',hair:'#5a3420',hairStyle:'short'}];
    return igFrame(300,140,`<defs><clipPath id="hvbc"><rect width="300" height="140" rx="12"/></clipPath></defs><g clip-path="url(#hvbc)">${hvSky('hvbk'+(++HV_N),300,140,'#9bd6ff','#e6f6ff')}${hvGrass(84,300,56,'#79cc84','#69c076')}
      ${hvBench(36,128,228)}
      ${mates.map((m,i)=>{const x=66+i*56,d=(i*.22).toFixed(2);return `<g class="hv-hop" style="--d:${d}s">${m?hvFig(x,128,{...m,shirt:'#2fbf71',pants:'#26305a',socks:'#2fbf71',pose:'sitCheer',face:'happy',s:1,noShadow:true}):hvAri(x,128,{pose:'sitCheer',face:'happy',s:1,injured:'a',brace:true,noShadow:true})}</g>`}).join('')}
      ${[[40,30,'#ffd45c'],[150,18,'#ff7a6b'],[260,34,'#6c5ce7'],[110,40,'#16b3a6'],[206,24,'#ffd45c']].map(([x,y,c],i)=>`<g class="ig-blink" style="--d:${i*.3}s">${typeof ch_star==='function'?ch_star(x,y,5,c):`<circle cx="${x}" cy="${y}" r="3" fill="${c}"/>`}</g>`).join('')}</g>`,'Ari cheers from the bench with his teammates')}
});

// ---------- Future Table vignettes (120x90, same wrapper as vignette() in art.js) ----------
function hvVig(art){const id='vc'+(typeof VGN!=='undefined'?++VGN:++HV_N)+'h';return `<svg viewBox="0 0 120 90" class="vig"><clipPath id="${id}"><rect width="120" height="90" rx="10"/></clipPath><g clip-path="url(#${id})">${art}</g></svg>`}
const HIRED_VIG={
  saturday:()=>hvVig(`${hvSky('hvs'+(++HV_N),120,90,'#8fd0ff','#e6f6ff')}${hvSun(104,14,6)}${hvGrass(62,120,28,'#79cc84','#69c076')}<path d="M0 62 H120" stroke="#fff" stroke-width="1.2" opacity=".8"/>
    ${hvGoal(-4,30,30,34)}
    <g class="hv-save">${hvAri(56,50,{pose:'dive',face:'happy',gloves:true,injured:'a',brace:true,s:.62,noShadow:true})}<g transform="translate(91 32)"><g class="vpop">${hvBall(0,0,5.4)}</g></g></g>
    <path d="M18 46 h10 M14 52 h12 M20 58 h8" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".85" class="vblink"/>
    <ellipse cx="60" cy="80" rx="26" ry="3" fill="rgba(20,40,30,.18)"/>
    ${[[100,48,'#ffd45c'],[78,18,'#fff']].map(([x,y,c],i)=>`<g class="twinkle" style="animation-delay:${-i*1.2}s">${ch_star(x,y,3.4,c)}</g>`).join('')}`),
  reroll:()=>hvVig(`${hvSky('hvr'+(++HV_N),120,90,'#b9c6dc','#e4e9f2')}${cloud(30,14,.32,.9,'',0)}${cloud(96,20,.26,.8,'',0)}${hvGrass(58,120,32,'#8fbf98','#84b48d')}<path d="M0 58 H120" stroke="#fff" stroke-width="1" opacity=".6"/>
    <g opacity=".75">${mini(84,40,{age:'kid',shirt:'#2fbf71',s:.34,pose:'walk',pants:'#26305a',skirt:false,style:'short'})}${mini(100,42,{age:'kid',shirt:'#ff9f43',s:.34,pose:'walk',flip:true,pants:'#26305a',skirt:false,style:'curly'})}${mini(112,39,{age:'kid',shirt:'#2fbf71',s:.32,pose:'walk',flip:true,pants:'#26305a',skirt:false,style:'pony'})}</g>
    <path d="M0 64 H120" stroke="#fff" stroke-width="1.6" stroke-dasharray="5 4" opacity=".7"/>
    ${hvAri(44,84,{pose:'crutch',face:'sad',injured:'a',wrap:true,s:.62})}`),
  cheer:()=>hvVig(`${hvSky('hvc'+(++HV_N),120,90,'#9bd6ff','#e6f6ff')}${hvGrass(56,120,34,'#79cc84','#69c076')}
    ${hvBench(4,86,92,.62)}
    <g class="hv-hop" style="--d:.3s">${hvFig(22,86,{skin:'#f1cfb6',hair:'#e0a040',hairStyle:'tails',shirt:'#2fbf71',pants:'#26305a',socks:'#2fbf71',pose:'sitCheer',face:'happy',s:.58,noShadow:true})}</g>
    <g class="hv-hop">${hvAri(52,86,{pose:'sitCheer',face:'happy',injured:'a',brace:true,s:.62,noShadow:true})}</g>
    <g class="hv-hop" style="--d:.6s">${hvFig(80,86,{skin:'#7a4a2c',hair:'#1d1820',hairStyle:'short',shirt:'#2fbf71',pants:'#26305a',socks:'#2fbf71',pose:'sitCheer',face:'happy',s:.58,noShadow:true})}</g>
    ${hvTag(90,10,'3 weeks','later','#16b3a6')}<g class="vpop">${hvTrophy(103,58,.62)}</g>
    ${[[10,14,'#ffd45c'],[70,10,'#ff7a6b']].map(([x,y,c],i)=>`<g class="twinkle" style="animation-delay:${-i*1.4}s">${ch_star(x,y,3.4,c)}</g>`).join('')}`),
  boot:()=>hvVig(`<rect width="120" height="90" fill="#fde9d6"/><rect y="70" width="120" height="20" fill="#e3c4a2"/><path d="M0 70 H120" stroke="#cfa982" stroke-width="1"/>
    <rect x="8" y="10" width="34" height="28" rx="3" fill="#bfe6ff" stroke="#fff" stroke-width="2.4"/><path d="M25 10 V38 M8 24 H42" stroke="#fff" stroke-width="1.6"/>${cloud(22,20,.14,.95,'',0)}
    <g transform="translate(64 14)"><circle r="7" fill="#fff" stroke="#6b7190" stroke-width="1.4"/><path d="M0 0 V-4.6" stroke="#2a2140" stroke-width="1.2" stroke-linecap="round"/><g class="turbine" style="transform-box:fill-box;transform-origin:0 0;animation-duration:6s"><path d="M0 0 H4.6" stroke="#ff7a6b" stroke-width="1" stroke-linecap="round"/></g><circle r="1" fill="#2a2140"/></g>
    <rect x="14" y="44" width="70" height="20" rx="6" fill="#6c5ce7"/><rect x="8" y="50" width="12" height="22" rx="5" fill="#5a4bd0"/><rect x="78" y="50" width="12" height="22" rx="5" fill="#5a4bd0"/><rect x="16" y="58" width="66" height="10" rx="4" fill="#7f71ee"/><rect x="14" y="68" width="70" height="6" rx="2" fill="#4a3cb8"/>
    <g transform="translate(0 -1)">${hvAri(49,85,{pose:'sitHands',face:'bored',injured:'a',boot:true,s:.6,noShadow:true})}</g>
    <g transform="translate(98 74)"><path d="M-6 0 h12 l-2 -10 h-8z" fill="#c76b4a"/><path d="M0 -10 q-8 -6 -6 -14 q4 4 6 12 q2 -10 8 -12 q2 8 -6 14" fill="#4fae6a"/></g>
    ${hvTag(90,8,'2 weeks','in a boot','#6c5ce7')}`)
};

// ---------- "Day in the life of a Care Doctor" slideshow panels (320x200) ----------
function hvPanel(art,label){const id='hvp'+(++HV_N);return `<svg viewBox="0 0 320 200" class="ditl" role="img" aria-label="${T(label)}"><clipPath id="${id}"><rect width="320" height="200" rx="14"/></clipPath><g clip-path="url(#${id})">${art}</g></svg>`}
function hvChair(x,y,col){return `<g transform="translate(${x} ${y})"><rect x="-16" y="-62" width="32" height="34" rx="9" fill="${col}"/><rect x="-18" y="-34" width="36" height="9" rx="4" fill="${hvMixC(col,'#000000',.15)}"/><path d="M-14 -25 V0 M14 -25 V0" stroke="#6b7190" stroke-width="3" stroke-linecap="round"/></g>`}
function hvSofa(x,y,w,col){const d=hvMixC(col,'#1a1240',.18);return `<g transform="translate(${x} ${y})"><rect x="6" y="-66" width="${w-12}" height="36" rx="12" fill="${col}"/><rect x="0" y="-48" width="14" height="40" rx="6" fill="${d}"/><rect x="${w-14}" y="-48" width="14" height="40" rx="6" fill="${d}"/><rect x="10" y="-36" width="${w-20}" height="16" rx="6" fill="${hvMixC(col,'#ffffff',.18)}"/><rect x="8" y="-22" width="${w-16}" height="14" rx="4" fill="${d}"/><path d="M14 -8 v8 M${w-14} -8 v8" stroke="#6a4424" stroke-width="3"/></g>`}
function hvBubble(x,y,w,h,inner,tail,d){return `<g class="hv-rise" style="--d:${d||0}s"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h/2}" fill="#fff" stroke="#dfe3f3" stroke-width="1.6"/><path d="M${x+tail[0]} ${y+h-1} l${tail[1]} 10 l${tail[2]} -10z" fill="#fff" stroke="#dfe3f3" stroke-width="1.6" stroke-linejoin="round"/><rect x="${x+tail[0]-1}" y="${y+h-4}" width="${Math.abs(tail[2])+2}" height="4" fill="#fff"/>${inner}</g>`}
function hvHeart(x,y,s,c){return `<path transform="translate(${x} ${y}) scale(${s})" d="M0 4 C-6 -1 -6 -6 -3 -7 C-1.4 -7.6 -.4 -6.6 0 -5.4 C.4 -6.6 1.4 -7.6 3 -7 C6 -6 6 -1 0 4Z" fill="${c||'#ff7a6b'}"/>`}
function hvNote(x,y,s,c){return `<g transform="translate(${x} ${y}) scale(${s})" fill="${c||'#6c5ce7'}"><path d="M-1 4 V-8 L7 -10 V2" stroke="${c||'#6c5ce7'}" stroke-width="1.6" fill="none"/><ellipse cx="-3" cy="4" rx="2.6" ry="2"/><ellipse cx="5" cy="2" rx="2.6" ry="2"/></g>`}
const HV_KID={skin:'#f1cfb6',hair:'#5a3420',hairStyle:'tails',shirt:'#ff9f43',pants:'#3b4068'};
const DITL_PANELS=[
  // 0: 7:50 AM, Byte tells you what Halo did overnight
  ()=>{const id='hvsr'+(++HV_N);const rows=[['scan','312 scans read'],['pill','40 medicines delivered'],['bed','27 families updated']];
    const icon=(k,x,y)=>k==='scan'?`<rect x="${x-6}" y="${y-6}" width="12" height="12" rx="2" fill="none" stroke="#7ff7e4" stroke-width="1.6"/><path d="M${x-3} ${y} h6 M${x} ${y-3} v6" stroke="#7ff7e4" stroke-width="1.4"/>`
      :k==='pill'?`<rect x="${x-7}" y="${y-3.5}" width="14" height="7" rx="3.5" fill="#ffd45c"/><rect x="${x}" y="${y-3.5}" width="7" height="7" rx="3.5" fill="#ff7a6b"/><rect x="${x-1}" y="${y-3.5}" width="2" height="7" fill="#ff7a6b"/>`
      :`<path d="M${x-7} ${y+5} v-8 M${x-7} ${y+1} h14 v4 M${x-7} ${y-2} h5" stroke="#7ff7e4" stroke-width="1.6" fill="none" stroke-linecap="round"/><circle cx="${x-4}" cy="${y-3}" r="2" fill="#7ff7e4"/>`;
    return hvPanel(`<rect width="320" height="200" fill="#fbe3cf"/>
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7aa7e8"/><stop offset=".55" stop-color="#ffb38a"/><stop offset="1" stop-color="#ffe2a8"/></linearGradient></defs>
      <rect x="14" y="14" width="112" height="112" rx="8" fill="url(#${id})" stroke="#fff" stroke-width="4"/>
      <g class="float" style="animation-duration:9s"><circle cx="70" cy="112" r="16" fill="#ffd45c" opacity=".95"/><circle cx="70" cy="112" r="24" fill="#ffd45c" opacity=".25"/></g>
      <path d="M16 124 V104 h10 v-12 h8 v8 h10 v-22 h8 v22 h12 v-14 h10 v18 h8 v-30 h6 v30 h12 v-10 h10 v14 h6 V124Z" fill="#4a5a8a" opacity=".85"/><path d="M70 14 V126 M14 70 H126" stroke="#fff" stroke-width="3"/>
      <rect y="150" width="320" height="50" fill="#c99a6a"/><rect y="150" width="320" height="6" fill="#e0b282"/>
      <path d="M96 150 L150 40 H306 V128 L118 150Z" fill="#7ff7e4" opacity=".08"/>
      <g class="hv-flick" style="animation-duration:6s"><rect x="146" y="22" width="160" height="108" rx="12" fill="#0f2a40" opacity=".82" stroke="#7ff7e4" stroke-width="1.6"/>
        <text x="160" y="40" font-size="10.5" font-weight="800" fill="#7ff7e4" font-family="Nunito, sans-serif">${T('HALO · OVERNIGHT')}</text></g>
      ${rows.map(([k,t],i)=>`<g class="hv-rise" style="--d:${.4+i*.6}s">${icon(k,166,58+i*24)}<text x="180" y="${62+i*24}" font-size="11.5" font-weight="800" fill="#ffffff" font-family="Nunito, sans-serif">${T(t)}</text></g>`).join('')}
      <g class="talking">${hvByte(96,158,74,{mood:'happy'})}</g>
      <g transform="translate(262 150)"><g class="steam"><path d="M-4 -26 q-4 -6 0 -12 M4 -26 q-4 -6 0 -12" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".9"/></g><rect x="-11" y="-24" width="22" height="24" rx="4" fill="#ff7a6b"/><path d="M11 -18 q8 0 8 6 q0 6 -8 6" stroke="#ff7a6b" stroke-width="3.4" fill="none"/>${hvHeart(0,-12,.9,'#fff')}</g>
      <g transform="translate(206 150)"><rect x="-26" y="-20" width="52" height="20" rx="5" fill="#2a2140"/><text x="0" y="-5.5" font-size="12" font-weight="900" fill="#7ff7e4" text-anchor="middle" font-family="Nunito, sans-serif">7:50</text></g>`,'Byte shows what Halo did overnight')},
  // 1: 9:00 AM, you listen to a family
  ()=>hvPanel(`<rect width="320" height="200" fill="#efeaff"/><rect y="168" width="320" height="32" fill="#d9cfee"/><path d="M0 168 H320" stroke="#c6b9e2" stroke-width="2"/>
      <rect x="128" y="20" width="62" height="44" rx="4" fill="#fff" stroke="#c6b9e2" stroke-width="2"/><path d="M134 56 l14 -16 l10 10 l8 -6 l16 12z" fill="#9fd8b0"/><circle cx="174" cy="32" r="5" fill="#ffd45c"/>
      <g transform="translate(150 178)"><path d="M-8 0 h16 l-3 -16 h-10z" fill="#c76b4a"/><path d="M0 -16 q-14 -10 -10 -26 q8 8 10 22 q2 -18 14 -24 q2 16 -12 28" fill="#4fae6a"/></g>
      ${hvChair(66,186,'#16b3a6')}${hvFig(66,186,{...HV.doc,pose:'sitHands',face:'smile'})}
      <g>${hvByte(30,190,40,{mood:'happy'})}</g>
      ${hvSofa(180,186,130,'#ff9f8a')}
      ${hvFig(220,186,{...HV.mom,pose:'sitHands',face:'smile'})}${hvFig(270,186,{...HV_KID,pose:'sitHands',face:'smile',cast:true,s:.9})}
      ${hvBubble(186,24,46,30,hvHeart(209,41,1.5),[10,-6,12],0)}${hvBubble(244,40,46,30,hvNote(266,55,1.1),[12,4,12],1.2)}${hvBubble(52,22,46,30,`<text x="75" y="43" font-size="16" font-weight="900" fill="#16b3a6" text-anchor="middle" font-family="Nunito, sans-serif">?</text>`,[14,2,12],2.4)}`,'You listen to a family'),
  // 2: 11:00 AM, you test plans on the Future Table
  ()=>{const id='hvft'+(++HV_N);const cards=[[70,52,'ball'],[120,34,'crutch'],[170,26,'trophy'],[220,34,'boot'],[262,56,'bench']];
    const ic=(k)=>k==='ball'?hvBall(0,1,6):k==='crutch'?`<path d="M-4 -9 L-6 9 M4 -9 L6 9 M-7 -9 h6 M1 -9 h6" stroke="#cfe9ff" stroke-width="2" stroke-linecap="round"/>`:k==='trophy'?hvTrophy(0,8,.62):k==='boot'?`<path d="M-6 -9 h7 v10 q8 1 8 6 v2 h-16z" fill="#a8b0c4"/><path d="M-6 -4 h7 M-6 0 h7" stroke="#5b6478" stroke-width="2"/>`:`${hvHeart(0,1,1.2,'#ff7a6b')}`;
    return hvPanel(`<defs><radialGradient id="${id}" cx=".5" cy=".75" r=".7"><stop offset="0" stop-color="#21406a"/><stop offset="1" stop-color="#0d1630"/></radialGradient></defs><rect width="320" height="200" fill="url(#${id})"/>
      ${[0,1,2,3,4,5,6,7,8,9].map(i=>`<circle cx="${(i*67+20)%320}" cy="${(i*41+12)%110}" r="1.2" fill="#7ff7e4" opacity=".5" class="twinkle" style="animation-delay:${-i*.5}s"/>`).join('')}
      <path d="M90 150 L40 30 H280 L230 150Z" fill="#7ff7e4" opacity=".07"/>
      <ellipse cx="160" cy="176" rx="34" ry="8" fill="#0a1024"/><rect x="146" y="150" width="28" height="26" fill="#1c2c50"/>
      <ellipse cx="160" cy="150" rx="104" ry="22" fill="#163a5a" stroke="#7ff7e4" stroke-width="2.4"/><ellipse cx="160" cy="148" rx="86" ry="15" fill="#7ff7e4" opacity=".18" class="beam"/>
      ${[0,1,2,3,4,5].map(i=>`<circle cx="${110+i*20}" cy="150" r="2" fill="#bffcf2" class="particle" style="--rise:-110px;animation-delay:${-i*1.1}s"/>`).join('')}
      ${cards.map(([x,y,k],i)=>`<g class="hv-flick" style="--d:${-i*.7}s"><g class="hv-bob" style="--d:${i*.4}s"><g transform="translate(${x} ${y})"><rect x="-18" y="-15" width="36" height="30" rx="6" fill="#7ff7e4" fill-opacity=".14" stroke="#7ff7e4" stroke-width="1.4"/>${ic(k)}</g></g></g><path d="M${x} ${y+15} L${160+(x-160)*.5} 140" stroke="#7ff7e4" stroke-width=".8" opacity=".35" stroke-dasharray="2 3"/>`).join('')}
      ${hvFig(34,198,{...HV.doc,pose:'raise',face:'smile',s:.92})}
      ${hvByte(290,196,52,{mood:'think'})}`,'You test plans on the Future Table')},
  // 3: 2:00 PM, the family decides, and you sign
  ()=>hvPanel(`<rect width="320" height="200" fill="#e4f6f0"/><rect y="170" width="320" height="30" fill="#c8e8dc"/>
      ${hvFig(40,194,{...HV.doc,pose:'hold',face:'smile'})}
      <g transform="translate(86 16)"><rect width="134" height="160" rx="14" fill="#2a2140"/><rect x="8" y="8" width="118" height="144" rx="8" fill="#fff"/>
        <text x="67" y="30" font-size="12" font-weight="900" fill="#2a2140" text-anchor="middle" font-family="Nunito, sans-serif">${T('Care plan')}</text>
        ${[0,1,2].map(i=>`<g class="hv-rise" style="--d:${i*.35}s"><rect x="18" y="${42+i*20}" width="12" height="12" rx="3" fill="#1fa774"/><path d="M21 ${48+i*20} l2.4 2.4 l4.4 -5" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/><rect x="36" y="${45+i*20}" width="${[70,58,64][i]}" height="6" rx="3" fill="#dfe3f3"/></g>`).join('')}
        <path d="M18 132 H116" stroke="#8a90b0" stroke-width="1.2"/><text x="18" y="129" font-size="10" font-weight="800" fill="#8a90b0" font-family="Nunito, sans-serif">&#215;</text>
        <path class="hv-sign" style="--len:190" d="M30 126 c4 -14 8 -18 9 -10 c1 8 -4 14 -2 6 c2 -8 8 -12 10 -4 c1 5 3 6 6 -2 c2 -6 4 -3 5 1 c2 6 5 4 8 -4 c2 -5 4 -2 6 2 c3 5 8 2 12 -3 q6 -6 12 0" stroke="#6c5ce7" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
      <g class="hv-nod" style="--d:.2s">${hvFig(254,194,{...HV.mom,face:'smile'})}</g>
      <g class="hv-nod" style="--d:.5s">${hvFig(292,194,{...HV_KID,face:'happy',cast:true,s:.9})}</g>`,'The family decides, and you sign'),
  // 4: 5:00 PM, a follow-up call
  ()=>{const id='hvev'+(++HV_N);return hvPanel(`<rect width="320" height="200" fill="#fde2cf"/>
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff9f7a"/><stop offset="1" stop-color="#ffd8a0"/></linearGradient></defs>
      <rect x="252" y="18" width="54" height="70" rx="5" fill="url(#${id})" stroke="#fff" stroke-width="3"/><circle cx="279" cy="74" r="10" fill="#ffd45c" opacity=".9"/><path d="M279 18 V88" stroke="#fff" stroke-width="2"/>
      <rect y="160" width="320" height="40" fill="#c99a6a"/><rect y="160" width="320" height="5" fill="#e0b282"/>
      <rect x="22" y="14" width="214" height="136" rx="12" fill="#2a2140"/><rect x="30" y="22" width="198" height="114" rx="6" fill="#dff4ff"/>
      <rect x="30" y="100" width="198" height="36" fill="#f6e3c8"/><rect x="44" y="34" width="40" height="30" rx="3" fill="#fff" stroke="#c6d4e8"/>${hvTrophy(196,70,.8)}
      ${hvFig(128,178,{...HV_KID,pose:'wave',face:'happy',armBCls:'hv-wave',s:1.15,noShadow:true})}
      <g class="twinkle">${ch_star(160,42,4,'#ffd45c')}</g><g class="twinkle" style="animation-delay:-1.6s">${ch_star(172,62,3,'#ff7a6b')}</g>
      <rect x="22" y="136" width="214" height="14" fill="#2a2140"/><circle cx="116" cy="143" r="4.6" fill="#e5484d"/><circle cx="134" cy="143" r="4.6" fill="#1fa774"/>
      <rect x="180" y="104" width="42" height="28" rx="4" fill="#cfe9ff" stroke="#fff" stroke-width="1.6"/><g transform="translate(201 140)">${''}</g>
      <svg x="180" y="104" width="42" height="28" viewBox="-21 -112 42 28" overflow="hidden">${hvFig(0,-60,{...HV.doc,s:.5,noShadow:true})}</svg>
      <rect x="110" y="150" width="38" height="12" fill="#3a3050"/>
      ${hvByte(282,190,64,{mood:'happy'})}`,'A follow-up call')}
];
