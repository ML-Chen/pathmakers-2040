// viz/nome.js — reusable art and mechanics for the Nome (Wild Reserve) workdays.
// nomeMammoth(o): a woolly mammoth calf or adult in side view, built from Bezier shapes, with parts that animate
//   (classes nm-head, nm-ear, nm-trunk-*, nm-jaw, nm-fl-low, nm-tail). Feet on y=0, facing right, shoulder height 100.
// calfPortrait(mood): the calf, front view, for talk scenes (same box as portrait(): 30 0 240 360).
// nomePerson(castEntry, mood): personSVG plus Nome outfits (o.nome: 'ruth' = calico atikłuk, 'eli' = herder's work jacket).
// nomeDrone, nomeReindeer, nomeFeeder, nomeRig: small props for scenes, documents and vignettes.
// nomeObserve(cfg): the Observe mechanic (tap body language in a live scene, log it, compare with a translator).
// Proportions checked against elephant calves and the woolly mammoth calf Lyuba (85 cm tall at one month): a big domed
// head about 45% of shoulder height, a short trunk that reaches about knee height, tiny furry ears (under 13 cm in
// young mammoths), thick legs about half the shoulder height, round feet with toenails and cushioned soles, a short tail.
let NM_N=0;
const nmF=v=>Math.round(v*10)/10;
function nmRng(seed){let a=seed>>>0||1;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}
function nmBz(P,N){N=N||12;const o=[];for(let i=0;i<=N;i++){const t=i/N,m=1-t;
  if(P.length===4)o.push([m*m*m*P[0][0]+3*m*m*t*P[1][0]+3*m*t*t*P[2][0]+t*t*t*P[3][0],m*m*m*P[0][1]+3*m*m*t*P[1][1]+3*m*t*t*P[2][1]+t*t*t*P[3][1]]);
  else if(P.length===3)o.push([m*m*P[0][0]+2*m*t*P[1][0]+t*t*P[2][0],m*m*P[0][1]+2*m*t*P[1][1]+t*t*P[2][1]]);
  else o.push([P[0][0]+(P[1][0]-P[0][0])*t,P[0][1]+(P[1][1]-P[0][1])*t])}return o}
function nmPl(pts){return pts.map((p,i)=>(i?'L':'M')+nmF(p[0])+' '+nmF(p[1])).join('')}
// tapered ribbon along points; wf(t) = width
function nmRib(pts,wf){const A=[],B=[],n=pts.length;for(let i=0;i<n;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(n-1,i+1)];const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,nx=dy/l,ny=-dx/l,w=wf(n>1?i/(n-1):0)/2,p=pts[i];
  A.push([p[0]+nx*w,p[1]+ny*w]);B.push([p[0]-nx*w,p[1]-ny*w])}return nmPl(A.concat(B.reverse()))+'Z'}
const nmTap=(a,b)=>t=>a+(b-a)*t, nmSwell=(m,e)=>t=>(e||0)+(m-(e||0))*Math.sin(Math.PI*t);
// a pointed lock of fur: root centre (x,y), direction angle a (radians, 0 = right, PI/2 = down), length L, root width w, bend
function nmLock(x,y,a,L,w,bend){const c=Math.cos(a),s=Math.sin(a),nx=-s,ny=c,b=bend||0;
  const P=(u,v)=>nmF(x+c*u+nx*v)+' '+nmF(y+s*u+ny*v);
  return `M${P(0,-w/2)} C${P(L*.35,-w*.55+b*.4)} ${P(L*.75,-w*.2+b)} ${P(L,b*1.25)} C${P(L*.7,w*.3+b)} ${P(L*.3,w*.6+b*.3)} ${P(0,w/2)}Z`}
// locks hanging along a polyline of [x,y] roots. o: {len, w, a (base angle), jit, seed, bend}
function nmFringe(roots,o){const r=nmRng(o.seed||7);return roots.map(([x,y],i)=>{const v=o.v??.5,L=o.len*(1-v/2+r()*v),a=(o.a??Math.PI/2)+(r()-.5)*(o.jit??.35);return nmLock(x,y,a,L,o.w*(.8+r()*.4),(r()-.5)*(o.bend??4))})}
function nmAlong(P,n){return nmBz(P,n)}
// draw a set of shapes as one outlined, filled part: outline pass, fill, then extra (shading/strokes) clipped to the shapes
function nmPart(shapes,fill,line,extra,lw){const id='nmc'+(++NM_N);
  return `<g fill="${line}" stroke="${line}" stroke-width="${lw||3.2}" stroke-linejoin="round">${shapes.map(d=>`<path d="${d}"/>`).join('')}</g>`+
    `<g fill="${fill}">${shapes.map(d=>`<path d="${d}"/>`).join('')}</g>`+
    (extra?`<clipPath id="${id}">${shapes.map(d=>`<path d="${d}"/>`).join('')}</clipPath><g clip-path="url(#${id})">${extra}</g>`:'')}
// short fur strokes scattered in a box, flowing along angle a
function nmFurStrokes(x0,y0,x1,y1,n,a,col,seed,len,op){const r=nmRng(seed);let s='';for(let i=0;i<n;i++){const x=x0+r()*(x1-x0),y=y0+r()*(y1-y0),L=(len||7)*(.6+r()*.8),aa=a+(r()-.5)*.5;
  s+=`<path d="${nmRib(nmBz([[x,y],[x+Math.cos(aa)*L*.5+(r()-.5)*2,y+Math.sin(aa)*L*.5],[x+Math.cos(aa)*L,y+Math.sin(aa)*L]],5),nmTap(1.6,.1))}"/>`}
  return `<g fill="${col}" opacity="${op??.55}">${s}</g>`}
const NM_FUR={calf:{base:'#d97a32',hi:'#f4a85e',hi2:'#ffd49c',sh:'#ad5420',sh2:'#7e3814',line:'#4a1f0b',skin:'#7d5a4b',skinSh:'#5a3e33',nail:'#f1e4c8',pad:'#8a6a5a'},
  adult:{base:'#9c4a24',hi:'#c46a38',hi2:'#e09a62',sh:'#73321a',sh2:'#52220f',line:'#2e1206',skin:'#6a4c40',skinSh:'#4a332a',nail:'#e8dcc0',pad:'#7a5a4a'}};

// ---------- the calf, side view ----------
// o: {id, fur (palette override), sprig (willow in trunk), mood ('calm'|'freeze' static pose), collar (true), shadow (true), eye ('open'|'closed'|'happy')}
function nomeMammoth(o){o=o||{};if(o.age==='adult')return nomeMammothAdult(o);const C={...NM_FUR.calf,...(o.fur||{})},L=C.line,id='nmm'+(++NM_N);
  const frz=o.mood==='freeze';
  // legs: columns that narrow a little at the wrist and flare into round, padded feet with toenails.
  // The near front leg (FL) bends at the knee (62,-27) so its foot can lift; knee fur hides the joint.
  const legFL='M47 -72 C46 -54 49 -40 51 -28 C52 -20 52.4 -12 51.4 -6 C50.6 -3 48.8 -1.4 49.2 .8 C53 2.6 70 2.6 74.4 .8 C75 -1.4 73.6 -3.6 73.2 -6 C72.4 -12 72.6 -20 73.8 -28 C75.4 -40 77.6 -54 78 -72Z';
  const legFLup='M47 -72 C46 -54 49 -40 51 -28 C51.4 -25 52 -22 52.4 -20 L72.8 -20 C73 -22 73.4 -25 73.8 -28 C75.4 -40 77.6 -54 78 -72Z';
  const legFLlo='M51.6 -32 C52.4 -22 52.4 -12 51.4 -6 C50.6 -3 48.8 -1.4 49.2 .8 C53 2.6 70 2.6 74.4 .8 C75 -1.4 73.6 -3.6 73.2 -6 C72.4 -12 72.4 -22 73.4 -32Z';
  const legBL='M-40 -66 C-42 -46 -34 -32 -29 -18 C-27.4 -12 -28.6 -6 -29.4 -1.6 C-29.6 1 -24 2.6 -15 2.6 C-6 2.6 -1.6 1.4 -1.8 -1.2 C-2.6 -6 -4.4 -11 -4.2 -18 C-4 -30 1 -46 4 -64Z';
  const nails=(x0,x1)=>{let s='';const n=3;for(let i=0;i<n;i++){const x=x0+(x1-x0)*(i+.5)/n;s+=`<path d="M${nmF(x-3.4)} .9 C${nmF(x-3.6)} -3.6 ${nmF(x+3.6)} -3.6 ${nmF(x+3.4)} .9Z" fill="${C.nail}" stroke="${L}" stroke-width="1"/>`}return s};
  const legFur=(x0,x1,y0,y1,seed)=>nmFurStrokes(x0,y0,x1,y1,12,Math.PI/2+.15,C.sh,seed,8,.45)+nmFurStrokes(x0,y0,x1,y1,7,Math.PI/2+.1,C.hi,seed+3,6,.4);
  const legShade=(x1)=>`<path d="M${x1-8} -90 C${x1-4} -60 ${x1-5} -30 ${x1-6} 4 L${x1+8} 4 L${x1+8} -90Z" fill="${C.sh}" opacity=".75"/><path d="M${x1-30} -90 C${x1-27} -60 ${x1-26} -30 ${x1-27} 4" stroke="${C.hi}" stroke-width="3" fill="none" opacity=".5"/>`;
  // knee fur: shaggy locks that hang over the knee
  const kneeFur=(x0,x1,y,seed)=>nmFringe(nmAlong([[x0,y],[(x0+x1)/2,y+1.5],[x1,y]],6),{len:13,w:7,seed,jit:.35,bend:3,v:.8});
  const farLeg=(d,dx)=>`<g transform="translate(${dx} -2)">${nmPart([d],C.sh,L,`<rect x="-60" y="-80" width="200" height="90" fill="${C.sh2}" opacity=".35"/>`)}</g>`;
  // body (torso) with a convex juvenile back, round rump and a soft belly
  const body='M54 -101 C36 -111 6 -112 -14 -105 C-32 -99 -42 -86 -42 -70 C-42 -58 -37 -48 -27 -44 C-4 -39 30 -39 58 -42 C72 -44 82 -52 86 -64 C90 -76 88 -91 79 -99 C71 -105 61 -103 54 -101Z';
  const bellyLocks=nmFringe(nmAlong([[-32,-48],[0,-38],[40,-38],[78,-50]],11),{len:14,w:9,seed:11,jit:.35,v:.8});
  // fur along the back lies down and points backward, so the top line looks shaggy, not spiky
  const backLocks=nmFringe(nmAlong([[54,-104],[30,-111],[2,-110],[-22,-103],[-38,-90]],13),{len:7,w:9,a:Math.PI*1.08,seed:12,jit:.5,bend:2.4,v:1.1});
  const rumpLocks=nmFringe(nmAlong([[-41,-82],[-44,-66],[-38,-50]],5),{len:10,w:8,a:Math.PI*.72,seed:13,jit:.35,v:.9});
  const bodyShade=`<path d="M-60 -60 C-20 -52 30 -50 100 -58 L100 0 L-60 0Z" fill="${C.sh}" opacity=".85"/><path d="M-60 -48 C-20 -42 30 -40 100 -46 L100 0 L-60 0Z" fill="${C.sh2}" opacity=".35"/>
    <path d="M-40 -88 C-20 -100 20 -104 50 -98" stroke="${C.hi}" stroke-width="9" fill="none" stroke-linecap="round" opacity=".7"/><path d="M-30 -94 C-6 -102 20 -103 40 -100" stroke="${C.hi2}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".55"/>`+
    nmFurStrokes(-44,-96,80,-48,60,Math.PI/2+.5,C.sh,21,9,.45)+nmFurStrokes(-40,-100,70,-70,30,Math.PI/2+.6,C.hi,22,7,.5);
  // tail: short, with a tuft; pivot at (-46,-76)
  const tail=`<g class="nm-tail"><path d="${nmRib(nmBz([[-39,-77],[-46,-70],[-49,-60],[-48,-50]],10),nmTap(5,2.6))}" fill="${C.sh}" stroke="${L}" stroke-width="1.6"/>
    ${nmPart([nmLock(-48,-53,Math.PI/2+.2,13,7,2),nmLock(-48,-53,Math.PI/2-.25,11,6,-2),nmLock(-48,-53,Math.PI/2+.6,10,5,2)],C.sh2,L,'',1.8)}</g>`;
  // head (rotates at the neck, 80,-90): domed skull with a fluffy crown, eye, small ear, mouth and trunk
  const head='M70 -98 C63 -114 72 -132 94 -136 C113 -139 128 -128 131 -112 C133 -102 131 -93 128 -87 C123 -80 116 -75 108 -74 C98 -73 88 -76 81 -83 C75 -88 72 -92 70 -98Z';
  const crown=nmFringe(nmAlong([[120,-130],[104,-139],[88,-136],[75,-125]],11),{len:8,w:9,a:-Math.PI*.8,seed:31,jit:.5,bend:2.6,v:1});
  const cheekLocks=nmFringe(nmAlong([[82,-84],[96,-76],[108,-75]],4),{len:8,w:6,seed:32,jit:.4});
  const headShade=`<path d="M60 -96 C80 -86 104 -80 140 -90 L140 -60 L60 -60Z" fill="${C.sh}" opacity=".8"/><path d="M76 -122 C88 -134 108 -136 120 -128" stroke="${C.hi}" stroke-width="8" fill="none" stroke-linecap="round" opacity=".75"/>
    <path d="M84 -128 C94 -134 106 -134 114 -130" stroke="${C.hi2}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>`+nmFurStrokes(70,-132,128,-80,30,Math.PI/2+.4,C.sh,33,7,.4);
  const eyeOpen=o.eye!=='closed'&&o.eye!=='happy';
  const eye=eyeOpen?`<g class="nm-eye"><ellipse cx="107" cy="-104" rx="6.4" ry="7.6" fill="#fff" stroke="${L}" stroke-width="1.4"/><ellipse cx="108.2" cy="-103.2" rx="4.8" ry="6.2" fill="#3a1b0c"/><ellipse cx="108.6" cy="-102" rx="3.2" ry="4.2" fill="#6a3418"/>
      <circle cx="110" cy="-106.4" r="2" fill="#fff"/><circle cx="106.4" cy="-100.6" r="1" fill="#fff" opacity=".8"/>
      <path d="M99.6 -109.6 C103 -113 110 -113.4 114.6 -109.4" stroke="${L}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path d="M100.4 -110.4 l-3.4 -2.4 M102.6 -112 l-2 -3.4 M105.6 -112.8 l-.6 -3.8" stroke="${L}" stroke-width="1.3" stroke-linecap="round"/></g>`
    :`<path d="M100 -104 C104 -${o.eye==='happy'?109:101} 110 -${o.eye==='happy'?109:101} 114 -104" stroke="${L}" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M100.6 -104.6 l-3.4 -2 M103 -106.6 l-2 -3" stroke="${L}" stroke-width="1.2" stroke-linecap="round"/>`;
  const blush=`<ellipse cx="112" cy="-92" rx="6" ry="3.4" fill="#ff8a8a" opacity=".45"/>`;
  // ear: small and furry, pivot at its front root (88,-112)
  const ear=`<g class="nm-ear">${nmPart(['M90 -120 C84 -126 76 -124 75 -116 C74 -108 78 -102 86 -103 C90 -104 91 -110 90 -120Z'].concat(nmFringe(nmAlong([[77,-122],[74,-112],[79,-104]],4),{len:5,w:5,a:Math.PI*1.02,seed:42,jit:.5})),C.sh,L,
      `<path d="M87.6 -118 C83 -121 79 -119 78.6 -114 C78.2 -109 81 -106 85.6 -107Z" fill="${C.skinSh}" opacity=".5"/>`+nmFurStrokes(74,-126,92,-102,7,Math.PI*.8,C.hi,41,4,.5),2.2)}</g>`;
  // trunk: short (reaches about knee height), ringed, with two fingers at the tip
  const trunkPath=(P)=>{const pts=nmBz(P,16);return {d:nmRib(pts,nmTap(17,8.5)),pts}};
  const trunkDraw=(P,cls,extra)=>{const t=trunkPath(P),tip=t.pts[t.pts.length-1],pre=t.pts[t.pts.length-3],ang=Math.atan2(tip[1]-pre[1],tip[0]-pre[0]);
    let rings='';for(let i=3;i<t.pts.length-2;i+=2){const a=t.pts[i-1],b=t.pts[i+1],p=t.pts[i],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,nx=dy/l,ny=-dx/l,w=(17-(17-8.5)*i/16)/2*.8;
      rings+=`<path d="M${nmF(p[0]+nx*w)} ${nmF(p[1]+ny*w)} Q${nmF(p[0]+dx/l*1.6)} ${nmF(p[1]+dy/l*1.6)} ${nmF(p[0]-nx*w)} ${nmF(p[1]-ny*w)}" stroke="${C.sh2}" stroke-width=".9" fill="none" opacity=".55"/>`}
    const c=Math.cos(ang),s=Math.sin(ang),T=(u,v)=>nmF(tip[0]+c*u-s*v)+' '+nmF(tip[1]+s*u+c*v);
    const fingers=`<path d="M${T(-2,-4.4)} C${T(2,-4.6)} ${T(5.6,-3.4)} ${T(6.4,-1.4)} C${T(5,-.2)} ${T(2,.2)} ${T(0,.2)} C${T(2,1)} ${T(3.8,2.4)} ${T(3.2,4)} C${T(1,4.8)} ${T(-2,4.6)} ${T(-3,3.6)}Z" fill="${C.skin}" stroke="${L}" stroke-width="1.3" stroke-linejoin="round"/>`;
    return `<g class="${cls}">${nmPart([t.d],C.base,L,`<path d="${nmRib(t.pts,nmTap(6,3))}" fill="${C.sh}" opacity=".9" transform="translate(-3 0)"/>${nmFurStrokes(100,-100,150,-30,16,Math.PI/2+.3,C.sh,51,6,.45)}${rings}`,2.6)}${fingers}${extra||''}</g>`};
  const sprig=o.sprig?`<g class="nm-sprig"><path d="M0 0 C-4 -8 -8 -14 -14 -18" stroke="#6b4a2a" stroke-width="1.6" fill="none"/>${[[-4,-6,-.9],[-8,-11,-.4],[-11,-15,-1.2],[-6,-9,2.2],[-12,-17,1.6]].map(([x,y,a])=>`<path d="${nmLock(x,y,a,9,4,1)}" fill="#7fae4a" stroke="#3f5a22" stroke-width=".8"/>`).join('')}</g>`:'';
  // calm: trunk tip curled back up to the mouth with a willow sprig. Freeze: trunk tucked under the chin (J-curl).
  const trunkEat=trunkDraw([[123,-90],[140,-74],[136,-52],[118,-60]],'nm-trunk-eat',sprig?`<g transform="translate(117 -59)">${sprig}</g>`:'');
  const trunkCurl=trunkDraw([[123,-90],[134,-74],[124,-54],[110,-64]],'nm-trunk-curl');
  const trunkHang=trunkDraw([[123,-90],[134,-72],[134,-56],[128,-42]],'nm-trunk-hang');
  const mouth=`<g class="nm-jaw"><path d="M104 -77 C108 -73 114 -72 119 -76 C117 -71 110 -69 104 -77Z" fill="${C.skinSh}" stroke="${L}" stroke-width="1.4" stroke-linejoin="round"/></g>
    <path d="M103 -78 C108 -76 114 -76 119 -79" stroke="${L}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  const collar=o.collar===false?'':`<g class="nm-collar"><path d="M70 -108 C64 -96 68 -82 80 -76" stroke="#1d5f66" stroke-width="7.5" fill="none" stroke-linecap="round"/><path d="M70 -108 C64 -96 68 -82 80 -76" stroke="#2f9aa2" stroke-width="3.6" fill="none" stroke-linecap="round"/>
    <g transform="translate(70 -84) rotate(-24)"><rect x="-6" y="-7" width="12" height="14" rx="3.4" fill="#e9f3f6" stroke="#1d4f56" stroke-width="1.3"/><path d="M0 -3.6 L3.1 -1.8 V1.8 L0 3.6 L-3.1 1.8 V-1.8Z" fill="#5ee6d6" class="nm-collar-light"/></g></g>`;
  const headG=`<g class="nm-head">${nmPart([head].concat(crown,cheekLocks),C.base,L,headShade)}${ear}${trunkHang}${trunkCurl}${trunkEat}${mouth}${blush}${eye}</g>`;
  const shadow=o.shadow===false?'':`<ellipse cx="18" cy="2" rx="78" ry="7" fill="rgba(30,20,40,.22)"/>`;
  const sole=`<g class="nm-sole"><ellipse cx="61.6" cy="1.6" rx="12.4" ry="7.4" fill="${C.pad}" stroke="${L}" stroke-width="1.3"/><ellipse cx="61" cy="2.4" rx="8.6" ry="4.4" fill="${C.skinSh}" opacity=".35"/>
    <path d="M54 0 L58 3 L57 6 M58 3 L63 2.4 L66 5 M63 2.4 L66 -1.6 M66 5 L70 3" stroke="${C.skinSh}" stroke-width=".8" fill="none" opacity=".9"/>
    ${[52.4,58,64.4,70].map((x,i)=>`<path d="M${x-2.6} ${-3.6+Math.abs(i-1.5)*1.6} C${x-2.8} ${-6.6+Math.abs(i-1.5)*1.6} ${x+2.8} ${-6.6+Math.abs(i-1.5)*1.6} ${x+2.6} ${-3.6+Math.abs(i-1.5)*1.6}Z" fill="${C.nail}" stroke="${L}" stroke-width=".9"/>`).join('')}</g>`;
  if(o.lying)return `<g class="nm-mm calf nm-lying ${o.cls||''}" id="${o.id||id}"><ellipse cx="30" cy="2" rx="96" ry="8" fill="rgba(30,20,40,.22)"/>
    <g transform="translate(0 44)">${tail}${nmPart([body].concat(bellyLocks,rumpLocks),C.base,L,bodyShade)}
    ${nmPart([nmLock(60,-46,.2,30,16,2),nmLock(-20,-44,.1,26,16,2)],C.sh,L,'',2.4)}${o.collar===false?'':collar}<g transform="rotate(14 80 -90) translate(4 6)">${headG}</g></g></g>`;
  return `<g class="nm-mm calf ${frz?'nm-freeze':''} ${o.cls||''}" id="${o.id||id}">${shadow}
    ${farLeg(legBL,10)}${farLeg(legFL,9)}
    ${tail}
    <g class="nm-bl">${nmPart([legBL].concat(kneeFur(-36,-3,-36,61)),C.base,L,legShade(-2)+legFur(-36,-4,-60,-6,62))}${nails(-27,-4)}</g>
    <g class="nm-fl"><g class="nm-fl-low">${nmPart([legFLlo],C.base,L,legShade(73)+legFur(50,72,-30,-6,65))}${nails(50.5,72.5)}${sole}</g>
      ${nmPart([legFLup].concat(kneeFur(46,79,-34,63)),C.base,L,legShade(76)+legFur(48,74,-62,-28,64))}</g>
    ${nmPart([body].concat(bellyLocks,rumpLocks),C.base,L,bodyShade)}
    ${collar}${headG}</g>`}

// ---------- an adult mammoth (side view, shoulder height 100): domed head, shoulder hump, sloping back, long coat, curved tusks ----------
function nomeMammothAdult(o){const C={...NM_FUR.adult,...(o.fur||{})},L=C.line;
  const body='M60 -100 C44 -112 10 -108 -20 -96 C-40 -88 -56 -76 -58 -60 C-60 -50 -54 -42 -42 -40 C-10 -34 30 -34 62 -38 C76 -40 86 -50 88 -62 C90 -78 80 -94 60 -100Z';
  const coat=nmFringe(nmAlong([[-56,-48],[-30,-36],[10,-32],[50,-34],[84,-46]],14),{len:24,w:11,seed:71,jit:.3});
  const leg=(x,w,seed)=>`M${x} -64 C${x-1} -40 ${x+2} -22 ${x+1} -8 C${x+.6} -4 ${x-1.4} -1.4 ${x-1} 1 C${x+3} 2.6 ${x+w-3} 2.6 ${x+w+1} 1 C${x+w+1.4} -1.4 ${x+w-.6} -4 ${x+w-1} -8 C${x+w-2} -22 ${x+w+1} -40 ${x+w} -64Z`;
  const legs=[leg(-44,24,1),leg(44,25,2)],far=[leg(-34,22,3),leg(54,23,4)];
  const head='M70 -96 C62 -116 72 -140 96 -142 C116 -143 128 -128 128 -110 C128 -98 124 -88 116 -82 C104 -76 90 -78 80 -86 C74 -90 72 -92 70 -96Z';
  const trunk=nmRib(nmBz([[118,-92],[136,-62],[132,-26],[124,-4]],18),nmTap(20,9));
  const tusk=`<path d="M112 -82 C130 -76 146 -64 146 -46 C146 -38 140 -34 136 -36 C140 -48 130 -64 110 -74Z" fill="#f4ead2" stroke="${L}" stroke-width="1.8" stroke-linejoin="round"/>`;
  const sh=`<path d="M-70 -60 C-20 -50 40 -50 100 -60 L100 0 L-70 0Z" fill="${C.sh}" opacity=".8"/>`+nmFurStrokes(-56,-104,86,-40,70,Math.PI/2+.5,C.sh2,81,11,.45)+nmFurStrokes(-50,-106,70,-70,30,Math.PI/2+.6,C.hi,82,9,.45);
  return `<g class="nm-mm adult ${o.cls||''}">${o.shadow===false?'':`<ellipse cx="16" cy="2" rx="82" ry="7" fill="rgba(30,20,40,.22)"/>`}
    ${far.map(d=>nmPart([d],C.sh2,L)).join('')}
    ${legs.map((d,i)=>{const x=i?44:-44;return nmPart([d].concat(nmFringe(nmAlong([[x,-30],[x+12,-29],[x+24,-30]],5),{len:12,w:7,seed:85+i,jit:.3})),C.base,L,`<rect x="-70" y="-70" width="200" height="80" fill="${C.sh}" opacity=".45"/><path d="M${x+16} -70 L${x+28} -70 L${x+28} 4 L${x+16} 4Z" fill="${C.sh2}" opacity=".35"/>`)+[0,1,2].map(k=>{const nx=x+3+k*7.6;return `<path d="M${nx} 1 C${nx-.2} -3.4 ${nx+6} -3.4 ${nx+6} 1Z" fill="${C.nail}" stroke="${L}" stroke-width="1"/>`}).join('')}).join('')}
    ${nmPart([body].concat(coat),C.base,L,sh)}
    <g class="nm-head">${nmPart([head].concat(nmFringe(nmAlong([[76,-126],[96,-144],[118,-134]],6),{len:9,w:9,a:-Math.PI/2,seed:83,jit:1})),C.base,L,`<path d="M60 -96 C80 -84 110 -80 140 -92 L140 -60 L60 -60Z" fill="${C.sh}" opacity=".8"/>`)}
      ${nmPart(['M90 -118 C82 -126 70 -122 70 -110 C70 -98 78 -92 88 -96Z'].concat(nmFringe(nmAlong([[74,-122],[69,-108],[76,-96]],4),{len:6,w:6,a:Math.PI,seed:84,jit:.5})),C.sh,L,'',2.2)}
      ${nmPart([trunk],C.base,L,`<path d="${nmRib(nmBz([[118,-92],[136,-62],[132,-26],[124,-4]],18),nmTap(7,3))}" fill="${C.sh}" transform="translate(-4 0)"/>`,2.6)}${tusk}
      <path d="M100 -112 C103 -116 108 -116 111 -112" stroke="${L}" stroke-width="2.2" fill="none" stroke-linecap="round"/><circle cx="105.6" cy="-110.4" r="2.2" fill="#2a120a"/></g></g>`}

// ---------- the calf, front view (talk portrait), in the 30 0 240 360 portrait box ----------
// mood: smile happy neutral worried sad surprised think stern (scared = worried)
function calfPortrait(mood){mood=mood||'smile';const C=NM_FUR.calf,L=C.line,id='nmp'+(++NM_N);
  const ears={smile:[0,0],happy:[-6,4],neutral:[0,0],worried:[-22,10],surprised:[-26,12],sad:[16,-6],think:[-6,2],stern:[-14,6]}[mood]||[0,0];
  const trunkC={smile:[[150,214],[146,250],[162,276],[176,262]],happy:[[150,214],[140,250],[168,270],[180,244]],neutral:[[150,214],[150,250],[148,280],[150,300]],
    worried:[[150,214],[154,246],[140,266],[130,252]],surprised:[[150,214],[150,240],[150,262],[152,282]],sad:[[150,214],[152,252],[150,288],[146,312]],think:[[150,214],[144,246],[132,262],[126,248]],stern:[[150,214],[150,250],[148,280],[150,300]]}[mood];
  // body and legs (chest, two front legs with round feet and nails)
  const chest='M150 196 C112 196 86 214 76 242 C68 266 66 296 70 322 L230 322 C234 296 232 266 224 242 C214 214 188 196 150 196Z';
  const legL='M84 290 C82 314 82 336 80 352 C79 360 88 366 104 366 C120 366 128 360 127 352 C125 336 125 314 124 290Z',legR=legL.replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g,(m,x,y)=>nmF(300-x)+' '+y);
  const chestLocks=nmFringe(nmAlong([[74,300],[110,318],[150,322],[190,318],[226,300]],13),{len:24,w:13,seed:91,jit:.3,v:.7}).concat(nmFringe(nmAlong([[72,262],[70,292]],3),{len:12,w:9,a:Math.PI*.8,seed:89,jit:.3}),nmFringe(nmAlong([[228,262],[230,292]],3),{len:12,w:9,a:Math.PI*.2,seed:88,jit:.3}));
  const head='M150 52 C104 52 74 86 72 132 C70 168 88 198 116 210 C128 216 140 218 150 218 C160 218 172 216 184 210 C212 198 230 168 228 132 C226 86 196 52 150 52Z';
  const crown=nmFringe(nmAlong([[108,70],[128,56],[150,52],[172,56],[192,70]],9),{len:16,w:14,a:-Math.PI/2,seed:92,jit:.9,bend:5,v:.9}).concat([nmLock(146,58,-Math.PI*.6,30,14,-6),nmLock(156,58,-Math.PI*.42,24,12,5),nmLock(138,62,-Math.PI*.74,20,11,-4)]);
  const cheeks=nmFringe(nmAlong([[74,150],[80,184],[100,206]],5),{len:14,w:9,a:Math.PI*.75,seed:93,jit:.4}).concat(nmFringe(nmAlong([[226,150],[220,184],[200,206]],5),{len:14,w:9,a:Math.PI*.25,seed:94,jit:.4}));
  const ear=(side)=>{const [rot,dx]=ears,s=side;const cx=s<0?84:216;
    return `<g transform="rotate(${s*rot} ${cx} 128) translate(${s*-dx*.3} 0)">${nmPart([`M${cx} 104 C${cx+s*24} 92 ${cx+s*42} 108 ${cx+s*42} 128 C${cx+s*42} 148 ${cx+s*24} 158 ${cx} 150Z`].concat(nmFringe(nmAlong([[cx+s*30,104],[cx+s*42,128],[cx+s*30,152]],5),{len:9,w:8,a:s<0?Math.PI:0,seed:95+s,jit:.7})),C.sh,L,
      `<path d="M${cx+s*6} 112 C${cx+s*20} 104 ${cx+s*34} 114 ${cx+s*34} 128 C${cx+s*34} 142 ${cx+s*20} 148 ${cx+s*6} 144Z" fill="${C.skinSh}" opacity=".5"/>`,2.6)}</g>`};
  const md={smile:'open',happy:'happy',neutral:'open',worried:'worried',surprised:'wide',sad:'sad',think:'think',stern:'open'}[mood]||'open';
  const eye=(cx,s)=>{if(md==='happy')return `<path d="M${cx-13} 140 C${cx-7} 128 ${cx+7} 128 ${cx+13} 140" stroke="${L}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    const ry=md==='wide'?17:md==='sad'?12:15,rx=md==='wide'?13:12,cy=136+(md==='sad'?3:0),look=md==='think'?[4,-4]:md==='worried'?[s*-2,0]:[0,1];
    return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff" stroke="${L}" stroke-width="2"/><ellipse cx="${cx+look[0]}" cy="${cy+look[1]+1}" rx="${rx*.78}" ry="${ry*.84}" fill="#3a1b0c"/>
      <ellipse cx="${cx+look[0]}" cy="${cy+look[1]+4}" rx="${rx*.5}" ry="${ry*.5}" fill="#7a3a16"/><circle cx="${cx+look[0]+s*-3.5}" cy="${cy+look[1]-5}" r="4" fill="#fff"/><circle cx="${cx+look[0]+s*3}" cy="${cy+look[1]+6}" r="2" fill="#fff" opacity=".8"/>
      ${md==='sad'||md==='worried'?`<path d="M${cx-rx} ${cy-ry+2} C${cx-4} ${cy-ry-6+(s>0?6:0)} ${cx+4} ${cy-ry-6+(s<0?6:0)} ${cx+rx} ${cy-ry+2}" stroke="${L}" stroke-width="4.4" fill="none" stroke-linecap="round"/>`
        :`<path d="M${cx-rx-1} ${cy-ry*.45} C${cx-rx+2} ${cy-ry-3} ${cx+rx-2} ${cy-ry-3} ${cx+rx+1} ${cy-ry*.45}" stroke="${L}" stroke-width="4" fill="none" stroke-linecap="round"/>`}
      <path d="M${cx+s*(rx-1)} ${cy-ry*.6} l${s*6} -6 M${cx+s*(rx-5)} ${cy-ry*.85} l${s*4} -7" stroke="${L}" stroke-width="2" stroke-linecap="round"/>`};
  const browTufts=(md==='worried'||md==='sad')?`<path d="${nmLock(118,112,-Math.PI*.9,16,7,2)}" fill="${C.sh}"/><path d="${nmLock(182,112,-Math.PI*.1,16,7,-2)}" fill="${C.sh}"/>`:'';
  const tp=nmBz(trunkC,18);const trunk=nmRib(tp,nmTap(34,16)),tip=tp[tp.length-1],pre=tp[tp.length-3],ang=Math.atan2(tip[1]-pre[1],tip[0]-pre[0]);
  let rings='';for(let i=3;i<tp.length-2;i+=2){const a=tp[i-1],b=tp[i+1],p=tp[i],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,nx=dy/l,ny=-dx/l,w=(34-18*i/18)/2*.82;
    rings+=`<path d="M${nmF(p[0]+nx*w)} ${nmF(p[1]+ny*w)} Q${nmF(p[0]+dx/l*3)} ${nmF(p[1]+dy/l*3)} ${nmF(p[0]-nx*w)} ${nmF(p[1]-ny*w)}" stroke="${C.sh2}" stroke-width="1.4" fill="none" opacity=".5"/>`}
  const c=Math.cos(ang),s=Math.sin(ang),T=(u,v)=>nmF(tip[0]+c*u-s*v)+' '+nmF(tip[1]+s*u+c*v);
  const tipD=`<path d="M${T(-3,-8.6)} C${T(4,-9)} ${T(11,-6.6)} ${T(12.4,-2.6)} C${T(9.6,-.4)} ${T(4,.4)} ${T(0,.4)} C${T(4,2)} ${T(7.4,4.6)} ${T(6.2,7.8)} C${T(2,9.4)} ${T(-4,9)} ${T(-6,7)}Z" fill="${C.skin}" stroke="${L}" stroke-width="2" stroke-linejoin="round"/>`;
  const mouthY=214,mouth=md==='happy'||mood==='smile'?`<path d="M136 ${mouthY} C142 ${mouthY+8} 158 ${mouthY+8} 164 ${mouthY}" stroke="${L}" stroke-width="2.6" fill="#a8463c" stroke-linejoin="round"/>`:md==='wide'?`<ellipse cx="150" cy="${mouthY+5}" rx="7" ry="8" fill="#7a2a24" stroke="${L}" stroke-width="2.4"/>`:'';
  const collar=`<path d="M92 222 C118 238 182 238 208 222" stroke="#1d5f66" stroke-width="13" fill="none" stroke-linecap="round"/><path d="M92 222 C118 238 182 238 208 222" stroke="#2f9aa2" stroke-width="7" fill="none" stroke-linecap="round"/>
    <g transform="translate(150 240)"><rect x="-13" y="-11" width="26" height="22" rx="6" fill="#e9f3f6" stroke="#1d4f56" stroke-width="2"/><path d="M0 -6 L5.2 -3 V3 L0 6 L-5.2 3 V-3Z" fill="#5ee6d6" class="nm-collar-light"/></g>`;
  const headSh=`<path d="M60 150 C90 196 210 196 240 150 L240 240 L60 240Z" fill="${C.sh}" opacity=".7"/><path d="M98 92 C120 66 180 66 202 92" stroke="${C.hi}" stroke-width="14" fill="none" stroke-linecap="round" opacity=".6"/><path d="M112 82 C134 66 166 66 188 82" stroke="${C.hi2}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".5"/>`+
    nmFurStrokes(76,70,224,200,46,Math.PI/2+.2,C.sh,96,12,.35)+nmFurStrokes(90,60,210,120,22,Math.PI/2,C.hi,97,10,.4);
  const fx=mood==='surprised'?`<path d="M232 70 L244 58 M238 86 L254 82 M68 70 L56 58" stroke="${L}" stroke-width="3.4" stroke-linecap="round"/>`:mood==='worried'?`<path d="M232 96 C236 106 239 112 239 117 C239 122 235 125 231.5 125 C228 125 224 122 224.5 117 C225 112 228 106 232 96Z" fill="#bfe8ff" stroke="#4a9ad8" stroke-width="1.6"/>`:mood==='happy'?`<path d="M236 74 l4 10 l10 2 l-8 6 l2 10 l-8 -5 l-9 5 l2 -10 l-7 -6 l10 -2z" fill="#ffd45c"/>`:'';
  return `<g class="person nm-calf-portrait"><g class="p-body">${nmPart([legL,legR],C.base,L,`<rect x="60" y="290" width="180" height="80" fill="${C.sh}" opacity=".4"/><path d="M112 290 L127 290 L127 366 L112 366Z M188 290 L216 290 L216 366 L188 366Z" fill="${C.sh}" opacity=".5"/>`+nmFurStrokes(78,296,222,350,24,Math.PI/2+.1,C.sh,98,10,.45))}
      ${[[86,124],[176,214]].map(([a,b])=>[0,1,2].map(i=>{const x=a+(b-a)*(i+.5)/3;return `<path d="M${x-6} 366 C${x-6} 357 ${x+6} 357 ${x+6} 366Z" fill="${C.nail}" stroke="${L}" stroke-width="1.6"/>`}).join('')).join('')}
      ${nmPart([chest].concat(chestLocks),C.base,L,`<path d="M60 280 C120 300 180 300 240 280 L240 340 L60 340Z" fill="${C.sh}" opacity=".6"/>`+nmFurStrokes(84,200,216,300,40,Math.PI/2+.3,C.sh,99,12,.4))}${collar}</g>
    <g class="p-head"><rect x="56" y="30" width="188" height="200" fill="none"/>${ear(-1)}${ear(1)}${nmPart([head].concat(crown,cheeks),C.base,L,headSh)}
      <ellipse cx="104" cy="170" rx="14" ry="8" fill="#ff8a8a" opacity=".4"/><ellipse cx="196" cy="170" rx="14" ry="8" fill="#ff8a8a" opacity=".4"/>
      <g class="p-eyes">${eye(112,-1)}${eye(188,1)}</g>${browTufts}${mouth}
      <g class="p-mouth">${nmPart([trunk],C.base,L,`<path d="${nmRib(tp,nmTap(12,5))}" fill="${C.sh}" opacity=".8" transform="translate(-6 0)"/>${rings}`,3)}${tipD}</g>${fx}</g></g>`}

// ---------- Nome outfits on the shared anime bust ----------
// Ruth: a calico atikłuk (hooded overshirt with a front pocket and rickrack trim) over a fleece; beaded earrings.
// Eli: a waxed-canvas work jacket over a hoodie, with a herder's reflective band.
function nomeOutfit(kind,o){const sk=(typeof ch_skinPal==='function'?ch_skinPal(o.skin):{base:o.skin,sh:'#9a6040',line:'#3a1a0a'}),id='nmo'+(++NM_N);
  if(kind==='ruth'){const B='#1f7f86',Bs='#155e66',Bd='#0e434a',Ln='#0a2e33',T='#f2c14e',Tr='#d8433a',F='#e9e2d6';
    const torso='M126 206 C112 211 90 215 72 222 C50 230 38 246 34 268 L26 372 L274 372 L266 268 C262 246 250 230 228 222 C210 215 188 211 174 206Z';
    const hood='M104 214 C96 200 100 186 118 184 C130 183 140 190 150 196 C160 190 170 183 182 184 C200 186 204 200 196 214 C186 206 170 204 150 210 C130 204 114 206 104 214Z';
    // calico: small five-petal flowers scattered on the shirt
    let cal='';const r=nmRng(55);for(let i=0;i<70;i++){const x=20+r()*262,y=214+r()*160;cal+=`<g transform="translate(${nmF(x)} ${nmF(y)}) rotate(${nmF(r()*72)})">${[0,1,2,3,4].map(k=>`<ellipse cx="0" cy="-2.4" rx="1.5" ry="2.4" fill="${k%2?'#f6d36b':'#f08a7a'}" transform="rotate(${k*72})"/>`).join('')}<circle r="1.1" fill="#fff4d0"/></g>`}
    const rick=(y0,x0,x1)=>{let d=`M${x0} ${y0}`;for(let x=x0;x<x1;x+=6)d+=` Q${x+1.5} ${y0-4} ${x+3} ${y0} Q${x+4.5} ${y0+4} ${x+6} ${y0}`;return d};
    const clip=id+'t';
    return `<path d="M120 200 C130 188 170 188 180 200 L186 222 L114 222Z" fill="${F}" stroke="#9a9488" stroke-width="2"/>
      <path d="${torso}" fill="${B}" stroke="${Ln}" stroke-width="2.8" stroke-linejoin="round"/><clipPath id="${clip}"><path d="${torso}"/></clipPath>
      <g clip-path="url(#${clip})">${cal}<path d="M228 222 C250 230 262 246 266 268 L274 372 L232 372 C238 330 238 272 228 222Z" fill="${Bd}" opacity=".45"/>
        <path d="M60 226 C46 232 34 242 28 258 C38 250 50 244 64 242Z" fill="#ffffff" opacity=".25"/>
        <path d="M20 300 C80 292 220 292 282 300" stroke="${T}" stroke-width="7" fill="none"/><path d="${rick(300,14,290)}" stroke="${Tr}" stroke-width="2.2" fill="none"/>
        <path d="M20 312 C80 304 220 304 282 312" stroke="${Tr}" stroke-width="3" fill="none"/>
        <path d="M96 318 L204 318 L210 372 L90 372Z" fill="${Bs}" stroke="${Ln}" stroke-width="2"/><path d="M96 318 L204 318" stroke="${T}" stroke-width="4"/><path d="${rick(324,96,204)}" stroke="${Tr}" stroke-width="1.8" fill="none"/>
        <path d="M150 318 L150 372" stroke="${Ln}" stroke-width="1.6" opacity=".6"/>
        <path d="M74 236 C66 270 66 320 70 372 M226 236 C234 270 234 320 230 372" stroke="${Ln}" stroke-width="2" fill="none" opacity=".55"/></g>
      <path d="${hood}" fill="${Bs}" stroke="${Ln}" stroke-width="2.4" stroke-linejoin="round"/><path d="M110 210 C124 202 140 202 150 208 C160 202 176 202 190 210" stroke="${T}" stroke-width="3" fill="none"/>
      <path d="M134 208 C138 222 162 222 166 208 L166 200 L134 200Z" fill="${sk.base}"/><path d="M150 222 C158 220 164 214 166 208 L166 200 L160 200 C160 210 157 217 150 222Z" fill="${sk.sh}"/>
      <path d="M131 206 C136 226 164 226 169 206" stroke="#9a9488" stroke-width="5" fill="none"/><path d="M131 206 C136 226 164 226 169 206" stroke="${F}" stroke-width="3" fill="none"/>`}
  if(kind==='eli'){const J='#6b6a3a',Js='#4f4e2a',Jd='#383718',Ln='#22210c',H='#8b8f99',Hs='#6c707a',Cd='#5a3a22';
    const torso='M124 206 C106 213 70 219 46 227 C24 235 12 251 8 273 L2 372 L298 372 L292 273 C288 251 276 235 254 227 C230 219 194 213 176 206Z';
    return `<path d="M116 200 C128 184 172 184 184 200 L190 222 L110 222Z" fill="${Hs}" stroke="${Ln}" stroke-width="2.2"/>
      <path d="${torso}" fill="${J}" stroke="${Ln}" stroke-width="2.8" stroke-linejoin="round"/>
      <path d="M254 227 C276 235 288 251 292 273 L298 372 L252 372 C258 330 262 272 254 227Z" fill="${Jd}" opacity=".6"/>
      <path d="M46 227 C30 233 18 245 12 261 C24 251 38 246 52 245Z" fill="#ffffff" opacity=".22"/>
      <path d="M124 214 L176 214 L164 372 L136 372Z" fill="${H}" stroke="${Ln}" stroke-width="1.8"/><path d="M150 226 L176 214 L164 372 L150 372Z" fill="${Hs}"/>
      <path d="M140 236 L138 300 M160 236 L162 300" stroke="#e9ecf2" stroke-width="2.6" stroke-linecap="round"/><circle cx="138" cy="302" r="2.6" fill="#c9ced8"/><circle cx="162" cy="302" r="2.6" fill="#c9ced8"/>
      <path d="M108 206 C112 232 132 248 150 252 C168 248 188 232 192 206 C186 200 176 198 170 206 C164 222 156 230 150 232 C144 230 136 222 130 206 C124 198 114 200 108 206Z" fill="${H}" stroke="${Ln}" stroke-width="2"/>
      <path d="M134 208 C138 220 162 220 166 208 L166 198 L134 198Z" fill="${sk.base}"/><path d="M150 220 C158 218 164 212 166 208 L166 198 L159 198 C159 210 156 216 150 220Z" fill="${sk.sh}"/>
      <path d="M124 212 L98 226 L112 262 L134 216Z" fill="${Cd}" stroke="${Ln}" stroke-width="2" stroke-linejoin="round"/><path d="M176 212 L202 226 L188 262 L166 216Z" fill="${Cd}" stroke="${Ln}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M104 230 l6 14 M110 228 l6 14 M196 230 l-6 14 M190 228 l-6 14" stroke="#3e2816" stroke-width="1" opacity=".6"/>
      <path d="M118 262 L124 372 M182 262 L176 372" stroke="${Ln}" stroke-width="2"/><path d="M122 262 L128 372" stroke="${Js}" stroke-width="3" opacity=".7"/>
      <path d="M40 300 L104 296 L106 338 Q74 344 42 340Z" fill="${Js}" stroke="${Ln}" stroke-width="1.6"/><path d="M40 300 L104 296" stroke="${Ln}" stroke-width="2"/>
      <path d="M196 296 L262 300 L260 340 Q228 344 194 338Z" fill="${Js}" stroke="${Ln}" stroke-width="1.6"/>
      
      <path d="M60 292 Q70 320 66 372 M240 292 Q230 320 234 372" stroke="${Ln}" stroke-width="1.4" fill="none" opacity=".35"/>`}
  return ''}
function nomePerson(o,mood){const base=personSVG({...o,mood,art:undefined});if(!o.nome)return base;
  const i=base.indexOf('<g class="p-head">');if(i<0)return base;const j=base.lastIndexOf('</g>',i);if(j<0)return base;
  let extra=nomeOutfit(o.nome,o);
  if(o.nome==='ruth'){ // beaded earrings: a small medallion with a dangle, hung inside the head group so they move with it
    const G=CH_FACE&&CH_FACE.F,ey=(G?G.ear:118)+38;const ear=(x)=>`<g transform="translate(${x} ${ey})"><circle r="4.6" fill="#f6efe0" stroke="#5a3a2a" stroke-width="1.2"/><circle r="2.6" fill="#d8433a"/><circle r="1" fill="#fff"/>
      <path d="M0 4.6 L0 12" stroke="#5a3a2a" stroke-width="1"/>${[0,1,2].map(k=>`<circle cy="${7+k*2.6}" r="1.2" fill="${['#2f9aa2','#f2c14e','#2f9aa2'][k]}"/>`).join('')}<path d="M-3 14 L0 19 L3 14Z" fill="#f2c14e" stroke="#5a3a2a" stroke-width=".8"/></g>`;
    const head=base.slice(i);const k=head.indexOf('<g class="p-eyes">');
    const withEar=k>0?head.slice(0,k)+ear(90)+ear(210)+head.slice(k):head;
    return base.slice(0,j)+extra+base.slice(j,i)+withEar}
  return base.slice(0,j)+extra+base.slice(j)}

// ---------- small props ----------
// herd drone, side view: soft white body, teal stripe, four rotors, no face. Centre (0,0), about 60 wide.
function nomeDrone(s,o){o=o||{};return `<g class="nm-drone" transform="scale(${s||1})">
  <path d="M-30 -5 L-10 -3 M10 -3 L30 -5" stroke="#8a96b4" stroke-width="2.6" stroke-linecap="round"/>
  <rect x="-33" y="-9" width="6" height="5" rx="1.6" fill="#5a6280"/><rect x="27" y="-9" width="6" height="5" rx="1.6" fill="#5a6280"/>
  <g class="nm-rotor"><ellipse cx="-30" cy="-10.5" rx="12" ry="1.8" fill="#c4cde0" opacity=".9"/><ellipse cx="30" cy="-10.5" rx="12" ry="1.8" fill="#c4cde0" opacity=".9"/></g>
  <path d="M-14 -1 C-14 -7 -8 -9 0 -9 C8 -9 14 -7 14 -1 C14 4 8 6 0 6 C-8 6 -14 4 -14 -1Z" fill="#f4f6fb" stroke="#7d89a8" stroke-width="1.5"/>
  <path d="M-13.6 0 C-6 1.6 6 1.6 13.6 0" stroke="${o.stripe||'#2f9aa2'}" stroke-width="2.6" fill="none"/>
  <path d="M-10 6 L-13 11 M10 6 L13 11 M-15 11 L-9 11 M9 11 L15 11" stroke="#7d89a8" stroke-width="1.4" stroke-linecap="round"/>
  <circle cx="5" cy="7.4" r="2.8" fill="#2a3060"/><circle cx="5.6" cy="7.4" r="1.2" fill="${o.cam||'#7ff7e4'}" class="nm-drone-light"/></g>`}
// reindeer, side view, facing right, feet at y=0, about 50 tall at the antler tips
function nomeReindeer(o){o=o||{};const c=o.col||'#7a5a44',d='#4a3424',w='#e8e0d2';
  return `<g class="nm-reindeer">${o.shadow===false?'':'<ellipse cx="0" cy="1" rx="18" ry="2.6" fill="rgba(0,0,0,.2)"/>'}
    <path d="M-14 -22 C-16 -14 -15 -6 -15 0 M-8 -20 C-8 -12 -9 -6 -9 0 M10 -20 C11 -12 10 -6 11 0 M15 -21 C16 -13 16 -6 16 0" stroke="${d}" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M-18 -28 C-18 -34 -10 -36 4 -35 C14 -34 19 -31 20 -26 C20 -20 14 -18 2 -18 C-10 -18 -18 -20 -18 -28Z" fill="${c}" stroke="${d}" stroke-width="1.4"/>
    <path d="M-14 -22 C-4 -18 10 -18 18 -22" stroke="${w}" stroke-width="3" fill="none" opacity=".8"/>
    <path d="M14 -30 C17 -38 20 -42 24 -42 C29 -42 31 -38 30 -35 C29 -33 26 -33 24 -34 C22 -32 19 -29 18 -26Z" fill="${c}" stroke="${d}" stroke-width="1.4"/>
    <path d="M12 -32 C14 -26 20 -24 22 -30" fill="${w}" opacity=".9"/><circle cx="25" cy="-39" r="1" fill="#1a1010"/>
    ${o.antlers===false?'':`<path d="M22 -42 C18 -50 14 -54 10 -56 M18 -49 C20 -53 22 -55 24 -56 M14 -53 C13 -57 14 -59 16 -61 M24 -42 C24 -50 27 -54 31 -56 M26 -50 C30 -51 32 -50 34 -48" stroke="#c8b08a" stroke-width="1.8" stroke-linecap="round" fill="none"/>`}</g>`}
// automated feeder: a hopper on legs with a teal stripe and a trough
function nomeFeeder(o){o=o||{};return `<g class="nm-feeder"><rect x="-20" y="-6" width="40" height="8" rx="3" fill="#8a96b4"/><path d="M-16 -46 L16 -46 L12 -14 L-12 -14Z" fill="#f4f6fb" stroke="#8a96b4" stroke-width="1.8" stroke-linejoin="round"/>
  <rect x="-16" y="-40" width="32" height="4" fill="#2f9aa2"/><rect x="-6" y="-31" width="12" height="9" rx="2" fill="#2a3060"/><text x="0" y="-24.4" text-anchor="middle" font-size="5" font-weight="800" fill="#7ff7e4" font-family="Nunito">${o.label||'MIX'}</text>
  <path d="M-12 -14 L-14 -4 M12 -14 L14 -4" stroke="#8a96b4" stroke-width="2.4"/><path d="M-20 -6 C-14 -1 14 -1 20 -6" fill="#c9a26b"/></g>`}
// the ridge "weather station": really a balloon launcher with a humming pump (Pip and Jory's)
function nomeRig(o){o=o||{};const true_=o.reveal;return `<g class="nm-rig"><path d="M0 0 L-10 -2 L-3 -40 L3 -40 L10 -2Z" fill="none" stroke="#5a6070" stroke-width="2"/><path d="M-6 -18 L6 -18 M-8 -9 L8 -9" stroke="#5a6070" stroke-width="1.6"/>
  <rect x="-2" y="-52" width="4" height="14" fill="#5a6070"/><path d="M-12 -52 L12 -52" stroke="#5a6070" stroke-width="2"/><circle cx="12" cy="-52" r="3" fill="#cfd6ea" stroke="#5a6070"/>
  <circle cx="0" cy="-56" r="3" fill="#ff5a4a" class="nm-rig-light"/>
  ${true_?`<rect x="10" y="-14" width="26" height="14" rx="2" fill="#c9a26b" stroke="#7a5426" stroke-width="1.4"/><text x="23" y="-8.6" text-anchor="middle" font-size="3.6" font-weight="800" fill="#5b3b16" font-family="Nunito">TOTALLY NORMAL</text><text x="23" y="-4" text-anchor="middle" font-size="3.6" font-weight="800" fill="#5b3b16" font-family="Nunito">WEATHER BALLOONS</text>
    <rect x="-30" y="-12" width="16" height="12" rx="3" fill="#7a8090" stroke="#3a3f4c" stroke-width="1.2"/><circle cx="-22" cy="-6" r="3.4" fill="#3a3f4c" class="nm-rig-pump"/><path d="M-14 -8 C-8 -10 -6 -16 -2 -20" stroke="#3a3f4c" stroke-width="1.6" fill="none"/>`:''}</g>`}

// ---------- the Observe mechanic (reusable for any Nome workday) ----------
// The animal loops between a calm behaviour and a reaction ("pulse") to something in the scene. The player taps body
// parts or things in the scene; each tap logs what they saw at that moment, next to what the collar translator says.
// cfg: {scene, place, vb (stage viewBox), stage (SVG), animal (id of the animal's root <g>), calmCls ('nm-eat'), pulseCls ('nm-freeze'),
//   hot: [{part, x, y, w, h}] (stage coords), parts: {id: {label, calm: [seen, collar], pulse: [seen, collar]}}, order: [ids],
//   animalParts: [ids that count toward need], need, period, pulseAt, pulseLen, src: {x, y} (percent; where the pulse comes from),
//   state: {} (persisted log: part -> 'calm'|'pulse'), lines: {intro, freeze, ask, good, bad, unsure}, choices: {bad, good, unsure},
//   saw(state) -> true if the player logged the evidence that makes the good answer available, onClue(), onDone()}
const NM_ICON={ears:'<path d="M7 5 C3 6 2 12 4 16 C6 19 10 19 12 17 C13 13 12 7 7 5Z M14 8 C17 7 21 9 21 13" />',
  trunk:'<path d="M6 4 C12 4 15 8 15 13 C15 17 13 20 9 20 C7 20 6 18 7 16" />',mouth:'<path d="M4 11 C8 16 16 16 20 11 M7 12 L7 14 M11 13 L11 15 M15 12 L15 14"/>',
  feet:'<path d="M6 4 L6 15 C6 19 18 19 18 15 L18 4 M7 18 L9 16 M11 19 L12 17 M15 18 L15 16"/>',head:'<circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><path d="M2 12 C6 5 18 5 22 12 C18 19 6 19 2 12Z"/>',
  tail:'<path d="M5 5 C7 10 10 13 12 17 M10 16 L13 21 M12 16 L16 20 M11 17 L12 22"/>',cup:'<path d="M5 8 L7 20 L15 20 L17 8Z M17 11 C21 11 21 16 16 16 M8 11 C10 12 12 10 14 11"/>',
  ridge:'<path d="M2 20 L9 9 L13 14 L16 10 L22 20Z M16 10 L16 3 M14 3 L18 3"/>'};
function nomeObserve(cfg){const st=cfg.state;let t0=performance.now(),timer=0,pulsing=false,firstFreeze=true,asked=false;
  const S_=v=>esc(v);
  screen('nm-observe',`${scene(cfg.scene)}${hud(cfg.place)}<div class="nm-layer"><div class="nm-src ${cfg.src.part?'nm-env':''}" ${cfg.src.part?`data-part="${cfg.src.part}"`:''} id="nmsrc" style="left:${cfg.src.x}%;top:${cfg.src.y}%"><i></i><i></i><i></i></div></div>
    <div class="nm-stage" id="nmstage"><svg viewBox="${cfg.vb}" preserveAspectRatio="xMidYMax meet">${cfg.stage}
      ${cfg.hot.map(h=>`<rect class="nm-hot" data-part="${h.part}" x="${h.x}" y="${h.y}" width="${h.w}" height="${h.h}" rx="8"/>`).join('')}</svg></div>
    <div class="nm-card" id="nmcard"></div>`);
  $$('.props',APP).forEach(x=>x.remove());
  const stage=$('#nmstage'),src=$('#nmsrc'),root=()=>document.getElementById(cfg.animal);
  const count=()=>cfg.animalParts.filter(p=>st[p]).length;
  function card(last){const box=$('#nmcard');if(!box)return;const P=last&&cfg.parts[last.part];
    box.innerHTML=`<div class="nm-last">${P?`<b>${S_(P.label)}</b> ${S_(P[last.phase][0])}<span class="nm-tr">${S_(cfg.collarName||'Collar')}: ${S_(P[last.phase][1])}</span>`:`<span class="nm-hint">${S_(cfg.hint)}</span>`}</div>
      <div class="nm-icons">${cfg.order.map(id=>`<button class="nm-ic ${st[id]?'on':''} ${st[id]==='pulse'?'key':''}" data-ic="${id}" aria-label="${S_(cfg.parts[id].label)}"><svg viewBox="0 0 24 24">${NM_ICON[id]||''}</svg></button>`).join('')}</div>
      <button class="btn small wide" id="nmcmp" ${count()>=cfg.need?'':'disabled'}>${S_(cfg.compareLabel||'Compare with the collar')}</button>`;
    $$('.nm-ic',box).forEach(b=>b.onclick=()=>log(b.dataset.ic));  // the buttons work like tapping that part in the picture
    $('#nmcmp',box).onclick=compare}
  function setPulse(on){pulsing=on;const r=root();if(r){r.classList.toggle(cfg.pulseCls,on);r.classList.toggle(cfg.calmCls,!on)}stage.classList.toggle('pulse',on);src.classList.toggle('on',on);
    if(on&&firstFreeze&&cfg.lines.freeze){firstFreeze=false;nmBubble(cfg.lines.freeze)}}
  function tick(){if(!document.body.contains(stage)){clearInterval(timer);return}const t=((performance.now()-t0)/1000)%cfg.period;const on=t>=cfg.pulseAt&&t<cfg.pulseAt+cfg.pulseLen;if(on!==pulsing)setPulse(on)}
  function log(part,ev){const phase=pulsing?'pulse':'calm';if(st[part]!=='pulse')st[part]=phase;save();MUSIC.sfx&&MUSIC.sfx('blip');
    if(ev&&ev.clientX!=null){const r=stage.getBoundingClientRect(),m=document.createElement('div');m.className='nm-mark'+(phase==='pulse'?' key':'');m.style.left=(ev.clientX-r.left)+'px';m.style.top=(ev.clientY-r.top)+'px';stage.appendChild(m);setTimeout(()=>m.remove(),900)}
    card({part,phase:st[part]==='pulse'?'pulse':phase});cfg.onLog&&cfg.onLog(part,phase,st)}
  function nmBubble(text){$$('.nm-bubble').forEach(b=>b.remove());const d=document.createElement('div');d.className='nm-bubble';d.innerHTML=`<div class="nm-bbyte">${byteBox({...S.byte,mood:'alert'})}</div><p>${esc(text)}</p>`;APP.appendChild(d);playLine('byte',text);setTimeout(()=>{d.classList.add('out');setTimeout(()=>d.remove(),400)},4200)}
  function compare(){const box=$('#nmcard');const saw=cfg.saw(st);
    box.innerHTML=`<div class="nm-cmp"><div class="nm-cmp-h"><span>${S_(cfg.youLabel||'You saw')}</span><span>${S_(cfg.collarName||'Collar')}</span></div>
      ${cfg.order.filter(id=>st[id]).map(id=>{const P=cfg.parts[id],ph=st[id];return `<div class="nm-row ${ph==='pulse'?'key':''}"><b>${S_(P[ph][0])}</b><span>${S_(P[ph][1])}</span></div>`}).join('')}</div>
      <div class="nm-ask"><div class="nm-bbyte">${byteBox({...S.byte,mood:'think'})}</div><p>${S_(cfg.lines.ask)}</p></div>
      <div class="choices">${saw?`<button class="choice" data-c="good">${S_(cfg.choices.good)}</button>`:''}<button class="choice" data-c="bad">${S_(cfg.choices.bad)}</button><button class="choice" data-c="unsure">${S_(cfg.choices.unsure)}</button></div>`;
    if(!asked){asked=true;playLine('byte',cfg.lines.ask)}
    $$('[data-c]',box).forEach(b=>b.onclick=()=>{const c=b.dataset.c;const reply=cfg.lines[c];playLine('byte',reply);
      if(c==='unsure'){nmBubble(reply);card(null);return}
      if(c==='good')cfg.onClue&&cfg.onClue();
      box.innerHTML=`<div class="nm-ask"><div class="nm-bbyte">${byteBox({...S.byte,mood:c==='good'?'happy':'neutral'})}</div><p>${S_(reply)}</p></div>
        <div class="row nm-end"><button class="btn small ghost" id="nmmore">Keep watching</button><button class="btn small" id="nmdone">${S_(cfg.doneLabel||'Done')}</button></div>`;
      $('#nmmore').onclick=()=>card(null);$('#nmdone').onclick=()=>cfg.onDone&&cfg.onDone(st)})}
  $$('.nm-hot',stage).forEach(h=>h.addEventListener('click',e=>{e.stopPropagation();log(h.dataset.part,e)}));
  const env=$$('.nm-env');env.forEach(h=>h.addEventListener('click',e=>{e.stopPropagation();log(h.dataset.part,e)}));
  card(null);if(cfg.lines.intro)setTimeout(()=>playLine('byte',cfg.lines.intro),300);timer=setInterval(tick,90);tick()}
