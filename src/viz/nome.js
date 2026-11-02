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
// coat colours, from the sunlit top layer (cape) to the shaded skirt
const NM_FUR={calf:{base:'#d97a32',cape:'#ea9448',hi:'#f6b26a',hi2:'#ffd9a4',sh:'#b55a24',sh2:'#83391a',skirt:'#a64f20',line:'#4a1f0b',skin:'#7d5a4b',skinSh:'#5a3e33',nail:'#f1e4c8',pad:'#8a6a5a',iris:'#3a1b0c',iris2:'#7a3e18'},
  adult:{base:'#8e4422',cape:'#a65530',hi:'#c87448',hi2:'#e6a272',sh:'#6c3018',sh2:'#4a1f0e',skirt:'#5e2814',line:'#2a1006',skin:'#5e4238',skinSh:'#42302a',nail:'#e8dcc0',pad:'#6a4a3e',iris:'#2a1408',iris2:'#5e3216',tusk:'#f3e7cc',tuskSh:'#cdb88e'}};
const nmP=p=>nmF(p[0])+' '+nmF(p[1]);
// a smooth curve through points (Catmull-Rom as cubic Beziers), continuing a path that already sits at pts[0]
function nmSmooth(pts){let s='';for(let i=0;i<pts.length-1;i++){const p0=pts[i-1]||pts[i],p1=pts[i],p2=pts[i+1],p3=pts[i+2]||p2;
  s+=`C${nmP([p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6])} ${nmP([p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6])} ${nmP(p2)}`}return s}
// A layer of coat: a band whose top follows `top` and whose lower edge (`bot`, rear to front) breaks into pointed locks
// that hang down and a little backward. Drawn inside a clip of the body, so the top edge never shows.
// Returns the fill, the inked lock edge and thin strands down each lock.
function nmBand(top,bot,o){const r=nmRng(o.seed||3),a=o.a??Math.PI/2+.28,dir=[Math.cos(a),Math.sin(a)];
  let d='M'+nmP(top[0])+nmSmooth(top)+'L'+nmP(bot[bot.length-1]),e='M'+nmP(bot[bot.length-1]),strands='';
  for(let i=bot.length-2;i>=0;i--){const A=bot[i+1],B=bot[i],w=Math.hypot(A[0]-B[0],A[1]-B[1])||1,u=[(B[0]-A[0])/w,(B[1]-A[1])/w],M=[(A[0]+B[0])/2,(A[1]+B[1])/2];
    const L=o.len*(.72+r()*.56),Q=(s,t)=>[M[0]+u[0]*s+dir[0]*t,M[1]+u[1]*s+dir[1]*t];
    const seg=`C${nmP(Q(-w*.5,L*.5))} ${nmP(Q(-w*.1,L*.86))} ${nmP(Q(w*.16,L))}C${nmP(Q(w*.26,L*.6))} ${nmP(Q(w*.46,L*.22))} ${nmP(B)}`;d+=seg;e+=seg;
    const s0=Q(-w*.05,-(o.depth||14)*.55),s1=Q(w*.08,L*.84);strands+=`<path d="${nmRib(nmBz([s0,[(s0[0]+s1[0])/2+1,(s0[1]+s1[1])/2],s1],6),nmTap(1.5,.2))}"/>`}
  return {d:d+'Z',edge:e,strands}}
function nmLayer(top,bot,o){const B=nmBand(top,bot,o);
  return `<path d="${B.d}" fill="${o.fill}"/><g fill="${o.strand||o.line}" opacity="${o.so??.32}">${B.strands}</g><path d="${B.edge}" fill="none" stroke="${o.line}" stroke-width="${o.lw||1.2}" stroke-linejoin="round" opacity="${o.lo??.6}"/>`}
const nmRow=(x0,x1,n,fy)=>{const o=[];for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n;o.push([x,fy(x)])}return o};
// an anime eye for the side view. o.eye: 'open' | 'closed' | 'happy'; s scales it; lashes on the calf
function nmEye(cx,cy,s,C,o,kind){if(o.eye==='closed'||o.eye==='happy'){const up=o.eye==='happy';
    return `<path d="M${nmF(cx-6*s)} ${nmF(cy+(up?1:-1)*s)} Q${nmF(cx)} ${nmF(cy+(up?-6:4)*s)} ${nmF(cx+6.4*s)} ${nmF(cy+(up?1:-1.4)*s)}" stroke="${C.line}" stroke-width="${nmF(2.4*s)}" fill="none" stroke-linecap="round"/>`+
      (kind==='calf'?`<path d="M${nmF(cx-5.4*s)} ${nmF(cy-.6*s)} l${nmF(-3*s)} ${nmF(-2.2*s)} M${nmF(cx-3.2*s)} ${nmF(cy-2.6*s)} l${nmF(-1.6*s)} ${nmF(-3*s)}" stroke="${C.line}" stroke-width="${nmF(1.2*s)}" stroke-linecap="round"/>`:'')}
  const rx=6.6*s,ry=7.8*s;
  return `<g class="nm-eye"><ellipse cx="${nmF(cx)}" cy="${nmF(cy)}" rx="${nmF(rx)}" ry="${nmF(ry)}" fill="#fff" stroke="${C.line}" stroke-width="${nmF(1.3*s)}"/>
    <ellipse cx="${nmF(cx+1.2*s)}" cy="${nmF(cy+.8*s)}" rx="${nmF(rx*.76)}" ry="${nmF(ry*.82)}" fill="${C.iris}"/><ellipse cx="${nmF(cx+1.4*s)}" cy="${nmF(cy+2.6*s)}" rx="${nmF(rx*.5)}" ry="${nmF(ry*.44)}" fill="${C.iris2}"/>
    <ellipse cx="${nmF(cx+2.8*s)}" cy="${nmF(cy-2.6*s)}" rx="${nmF(2.2*s)}" ry="${nmF(2.6*s)}" fill="#fff"/><circle cx="${nmF(cx-1.2*s)}" cy="${nmF(cy+3.6*s)}" r="${nmF(1.1*s)}" fill="#fff" opacity=".85"/>
    <path d="M${nmF(cx-rx-1*s)} ${nmF(cy-ry*.2)} C${nmF(cx-rx+1*s)} ${nmF(cy-ry-2.6*s)} ${nmF(cx+rx-1*s)} ${nmF(cy-ry-2.6*s)} ${nmF(cx+rx+1.2*s)} ${nmF(cy-ry*.3)}" stroke="${C.line}" stroke-width="${nmF((kind==='calf'?2.8:2.4)*s)}" fill="none" stroke-linecap="round"/>
    ${kind==='calf'?`<path d="M${nmF(cx-rx)} ${nmF(cy-ry*.5)} l${nmF(-3.4*s)} ${nmF(-2*s)} M${nmF(cx-rx+2.4*s)} ${nmF(cy-ry-.4*s)} l${nmF(-2.2*s)} ${nmF(-3.2*s)}" stroke="${C.line}" stroke-width="${nmF(1.4*s)}" stroke-linecap="round"/>`
      :`<path d="M${nmF(cx-rx+.5*s)} ${nmF(cy-ry*.62)} C${nmF(cx-2*s)} ${nmF(cy-ry*.98)} ${nmF(cx+3*s)} ${nmF(cy-ry*.98)} ${nmF(cx+rx)} ${nmF(cy-ry*.55)}" stroke="${C.sh2}" stroke-width="${nmF(1.1*s)}" fill="none" opacity=".7"/>`}</g>`}
// a trunk: a tapered, ringed tube along a Bezier, with two "fingers" at the tip
function nmTrunk(P,w0,w1,C,cls,extra){const pts=nmBz(P,18),d=nmRib(pts,nmTap(w0,w1)),tip=pts[pts.length-1],pre=pts[pts.length-3],ang=Math.atan2(tip[1]-pre[1],tip[0]-pre[0]),n=pts.length-1;
  let rings='';for(let i=4;i<n-1;i+=2){const a=pts[i-1],b=pts[i+1],p=pts[i],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,nx=dy/l,ny=-dx/l,w=(w0-(w0-w1)*i/n)/2*.8;
    rings+=`<path d="M${nmF(p[0]+nx*w)} ${nmF(p[1]+ny*w)} Q${nmF(p[0]+dx/l*1.8)} ${nmF(p[1]+dy/l*1.8)} ${nmF(p[0]-nx*w)} ${nmF(p[1]-ny*w)}" stroke="${C.sh2}" stroke-width=".9" fill="none" opacity=".5"/>`}
  const c=Math.cos(ang),s=Math.sin(ang),k=w1/8.5,T=(u,v)=>nmF(tip[0]+c*u*k-s*v*k)+' '+nmF(tip[1]+s*u*k+c*v*k);
  const fingers=`<path d="M${T(-2,-4.4)} C${T(2,-4.6)} ${T(5.6,-3.4)} ${T(6.4,-1.4)} C${T(5,-.2)} ${T(2,.2)} ${T(0,.2)} C${T(2,1)} ${T(3.8,2.4)} ${T(3.2,4)} C${T(1,4.8)} ${T(-2,4.6)} ${T(-3,3.6)}Z" fill="${C.skin}" stroke="${C.line}" stroke-width="1.3" stroke-linejoin="round"/>`;
  // fur on the trunk: short strands along its top side, thinning toward the tip
  let fur='';const r=nmRng(Math.round(P[0][0]*7+P[3][1]));for(let i=1;i<n-3;i++){if(r()<.35)continue;const p=pts[i],q=pts[i+1],dx=q[0]-p[0],dy=q[1]-p[1],l=Math.hypot(dx,dy)||1,nx=dy/l,ny=-dx/l,w=(w0-(w0-w1)*i/n)/2*.55,L=4+r()*3;
    fur+=`<path d="${nmRib(nmBz([[p[0]+nx*w,p[1]+ny*w],[p[0]+nx*w+dx/l*L*.6,p[1]+ny*w+dy/l*L*.6+.6],[p[0]+nx*w*.4+dx/l*L,p[1]+ny*w*.4+dy/l*L]],5),nmTap(1.4,.1))}"/>`}
  return `<g class="${cls}">${nmPart([d],C.base,C.line,`<path d="${nmRib(pts,nmTap(w0*.36,w1*.36))}" fill="${C.sh}" opacity=".85" transform="translate(-3 0)"/><path d="${nmRib(pts,nmTap(w0*.16,w1*.12))}" fill="${C.hi}" opacity=".45" transform="translate(${nmF(w0*.22)} -1)"/><g fill="${C.sh2}" opacity=".45">${fur}</g>${rings}`,2.4)}${fingers}${extra||''}</g>`}

// ---------- the calf, side view ----------
// o: {id, fur (palette override), sprig (willow in trunk), mood ('calm'|'freeze' static pose), collar (true), shadow (true),
//   eye ('open'|'closed'|'happy'), lying, cls}. Shape notes: a high, round dome with a tuft on top, a shallow dip behind the
//   head, a shoulder that stands higher than the rump, a coat in three layers (sunlit cape, flank, shaggy skirt), short trunk,
//   tiny furry ears, milk-tusk nubs at the lip, column legs with round toenailed feet.
function nomeMammoth(o){o=o||{};if(o.age==='adult')return nomeMammothAdult(o);const C={...NM_FUR.calf,...(o.fur||{})},L=C.line,id='nmm'+(++NM_N);
  const frz=o.mood==='freeze';
  // legs: columns that narrow a little at the wrist and flare into round, padded feet with toenails.
  // The near front leg (FL) bends at the knee (62,-27) so its foot can lift; the knee fur and the skirt hide the joint.
  const legFL='M47 -72 C46 -54 49 -40 51 -28 C52 -20 52.4 -12 51.4 -6 C50.6 -3 48.8 -1.4 49.2 .8 C53 2.6 70 2.6 74.4 .8 C75 -1.4 73.6 -3.6 73.2 -6 C72.4 -12 72.6 -20 73.8 -28 C75.4 -40 77.6 -54 78 -72Z';
  const legFLup='M47 -72 C46 -54 49 -40 51 -28 C51.4 -25 52 -22 52.4 -20 L72.8 -20 C73 -22 73.4 -25 73.8 -28 C75.4 -40 77.6 -54 78 -72Z';
  const legFLlo='M51.6 -32 C52.4 -22 52.4 -12 51.4 -6 C50.6 -3 48.8 -1.4 49.2 .8 C53 2.6 70 2.6 74.4 .8 C75 -1.4 73.6 -3.6 73.2 -6 C72.4 -12 72.4 -22 73.4 -32Z';
  const legBL='M-42 -66 C-44 -46 -35 -32 -30 -18 C-28.4 -12 -29.6 -6 -30.4 -1.6 C-30.6 1 -25 2.6 -16 2.6 C-7 2.6 -2.6 1.4 -2.8 -1.2 C-3.6 -6 -5.4 -11 -5.2 -18 C-5 -30 0 -46 3 -64Z';
  const nails=(x0,x1)=>{let s='';for(let i=0;i<3;i++){const x=x0+(x1-x0)*(i+.5)/3;s+=`<path d="M${nmF(x-3.4)} .9 C${nmF(x-3.6)} -3.6 ${nmF(x+3.6)} -3.6 ${nmF(x+3.4)} .9Z" fill="${C.nail}" stroke="${L}" stroke-width="1"/>`}return s};
  const legFur=(x0,x1,y0,y1,seed)=>nmFurStrokes(x0,y0,x1,y1,12,Math.PI/2+.15,C.sh,seed,8,.45)+nmFurStrokes(x0,y0,x1,y1,7,Math.PI/2+.1,C.hi,seed+3,6,.35);
  const legShade=(x1)=>`<path d="M${x1-8} -90 C${x1-4} -60 ${x1-5} -30 ${x1-6} 4 L${x1+8} 4 L${x1+8} -90Z" fill="${C.sh}" opacity=".75"/><path d="M${x1-30} -90 C${x1-27} -60 ${x1-26} -30 ${x1-27} 4" stroke="${C.hi}" stroke-width="3" fill="none" opacity=".45"/>`;
  const kneeFur=(x0,x1,y,seed)=>nmFringe(nmAlong([[x0,y],[(x0+x1)/2,y+1.5],[x1,y]],6),{len:14,w:7,seed,jit:.35,bend:3,v:.8});
  const farLeg=(d,dx)=>`<g transform="translate(${dx} -2)">${nmPart([d],C.sh,L,`<rect x="-60" y="-80" width="200" height="90" fill="${C.sh2}" opacity=".4"/>`)}</g>`;
  // body: shoulder high at the front (x 30), back sloping down to a round rump; a shallow dip behind the head (x 64)
  const body='M66 -100 C58 -108 46 -111 32 -111 C14 -111 -4 -106 -20 -98 C-34 -91 -44 -82 -47 -70 C-50 -58 -46 -47 -38 -43 C-10 -40 40 -40 78 -43 C86 -49 90 -60 89 -72 C88 -86 80 -96 66 -100Z';
  const lie=!!o.lying,sk=lie?8:15;
  const skirt=nmFringe(nmAlong([[-42,-50],[0,-44],[44,-44],[84,-50]],13),{len:sk,w:11,a:Math.PI/2+.22,seed:11,jit:.3,bend:3,v:.7});
  const rump=nmFringe(nmAlong([[-46,-84],[-49,-66],[-42,-50]],5),{len:10,w:9,a:Math.PI*.74,seed:13,jit:.3,v:.8});
  const chest=nmFringe(nmAlong([[88,-78],[89,-62],[84,-48]],4),{len:12,w:9,a:Math.PI/2+.05,seed:14,jit:.3,v:.6});
  // back fur lies flat and points backward, so the top line looks soft rather than spiky
  const back=nmFringe(nmAlong([[60,-104],[36,-112],[10,-110],[-14,-101],[-34,-89]],12),{len:6,w:10,a:Math.PI*1.07,seed:12,jit:.4,bend:2,v:.8});
  const backY=x=>x>32?-111+(x-32)*.22:-111+(32-x)*.27+(x<-20?(-20-x)*.4:0);
  const coat=nmLayer(nmRow(-60,96,12,x=>backY(x)-14),nmRow(-58,94,14,x=>-62+(x<-30?(-30-x)*.4:0)+(x>70?(x-70)*-.6:0)),{len:12,depth:22,seed:21,fill:C.base,line:L,strand:C.sh2})+
    nmLayer(nmRow(-60,96,12,x=>backY(x)-14),nmRow(-58,96,15,x=>backY(x)+24),{len:10,depth:20,seed:22,fill:C.cape,line:L,strand:C.sh,lo:.45})+
    `<path d="M-30 -92 C-10 -104 16 -110 46 -108" stroke="${C.hi}" stroke-width="8" fill="none" stroke-linecap="round" opacity=".7"/><path d="M-18 -99 C0 -106 20 -108 38 -107" stroke="${C.hi2}" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".6"/>`+
    nmFurStrokes(-44,-104,84,-48,40,Math.PI/2+.45,C.sh2,23,8,.3)+nmFurStrokes(-36,-108,70,-84,22,Math.PI/2+.6,C.hi,24,6,.45);
  // tail: short, with a tuft; pivot at (-39,-77)
  const tail=`<g class="nm-tail"><path d="${nmRib(nmBz([[-39,-77],[-46,-70],[-49,-60],[-48,-50]],10),nmTap(5,2.6))}" fill="${C.sh}" stroke="${L}" stroke-width="1.6"/>
    ${nmPart([nmLock(-48,-53,Math.PI/2+.2,13,7,2),nmLock(-48,-53,Math.PI/2-.25,11,6,-2),nmLock(-48,-53,Math.PI/2+.6,10,5,2)],C.sh2,L,'',1.8)}</g>`;
  // head (rotates at the neck, 80,-90): a high round dome with a tuft on top, a near-vertical brow, cheeks and chin fur
  const head='M70 -96 C62 -110 64 -128 77 -138 C88 -147 104 -148 114 -141 C124 -134 130 -122 131 -110 C132 -100 130 -92 127 -86 C122 -79 114 -74 106 -74 C96 -74 86 -78 80 -84 C75 -88 72 -92 70 -96Z';
  const tuft=[nmLock(96,-144,-Math.PI*.62,15,9,-3),nmLock(103,-143,-Math.PI*.44,12,8,3),nmLock(89,-142,-Math.PI*.78,12,8,-2),nmLock(110,-140,-Math.PI*.3,8,7,2)];
  const crown=nmFringe(nmAlong([[76,-134],[70,-120],[66,-106]],5),{len:7,w:8,a:Math.PI*.95,seed:31,jit:.4,bend:2,v:.8});
  const cheek=nmFringe(nmAlong([[80,-84],[92,-77],[104,-75]],4),{len:9,w:7,a:Math.PI/2+.35,seed:32,jit:.35});
  const headFur=nmLayer(nmRow(60,136,8,x=>-160),nmRow(62,134,9,x=>-126+Math.abs(x-98)*.18),{len:9,depth:14,seed:34,a:Math.PI/2+.45,fill:C.cape,line:L,strand:C.sh,lo:.55,so:.25})+
    `<path d="M60 -96 C80 -86 104 -80 140 -92 L140 -60 L60 -60Z" fill="${C.sh}" opacity=".75"/><path d="M80 -136 C90 -143 104 -144 114 -138" stroke="${C.hi}" stroke-width="6" fill="none" stroke-linecap="round" opacity=".75"/>
    <path d="M88 -139 C96 -143 104 -143 110 -140" stroke="${C.hi2}" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".6"/>`+nmFurStrokes(68,-122,128,-82,22,Math.PI/2+.4,C.sh,33,6,.35);
  // ear: small and furry, pivot at its front root (89,-112)
  const ear=`<g class="nm-ear"><g transform="translate(89 -112) scale(.8) translate(-89 112)">${nmPart(['M90 -120 C84 -126 76 -124 75 -116 C74 -108 78 -102 86 -103 C90 -104 91 -110 90 -120Z'].concat(nmFringe(nmAlong([[77,-122],[74,-112],[79,-104]],4),{len:5,w:5,a:Math.PI*1.02,seed:42,jit:.5})),C.base,L,
      `<path d="M87.6 -118 C83 -121 79 -119 78.6 -114 C78.2 -109 81 -106 85.6 -107Z" fill="${C.sh}" opacity=".7"/>`+nmFurStrokes(74,-126,92,-102,7,Math.PI*.8,C.hi,41,4,.5)+`<path d="M88 -121 C83 -125 77 -123 76.4 -116" stroke="${C.hi}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".6"/>`,2.2)}</g></g>`;
  const sprig=o.sprig?`<g class="nm-sprig"><path d="M0 0 C-4 -8 -8 -14 -14 -18" stroke="#6b4a2a" stroke-width="1.6" fill="none"/>${[[-4,-6,-.9],[-8,-11,-.4],[-11,-15,-1.2],[-6,-9,2.2],[-12,-17,1.6]].map(([x,y,a])=>`<path d="${nmLock(x,y,a,9,4,1)}" fill="#7fae4a" stroke="#3f5a22" stroke-width=".8"/>`).join('')}</g>`:'';
  // trunk: short (reaches about knee height). Calm: the tip brings willow up to the mouth. Freeze: tucked under the chin (J-curl).
  const trunkEat=nmTrunk([[118,-96],[142,-76],[136,-52],[118,-60]],19,8.5,C,'nm-trunk-eat',sprig?`<g transform="translate(117 -59)">${sprig}</g>`:'');
  const trunkCurl=nmTrunk([[118,-96],[136,-76],[124,-54],[110,-64]],19,8.5,C,'nm-trunk-curl');
  const trunkHang=nmTrunk([[118,-96],[136,-74],[135,-56],[129,-40]],19,8.5,C,'nm-trunk-hang');
  // where the trunk grows out of the face: the face fur covers the trunk's top end
  const hc=id+'h',join=`<clipPath id="${hc}"><path d="${head}"/></clipPath><g clip-path="url(#${hc})"><path d="M108 -112 C118 -114 130 -108 131 -100 C131 -94 128 -90 124 -88 C118 -88 110 -92 106 -100Z" fill="${C.cape}"/>${nmFurStrokes(110,-112,128,-90,8,Math.PI/2+.4,C.sh,35,5,.4)}</g>`;
  const mouth=`<g class="nm-jaw"><path d="M104 -77 C108 -72 114 -71 119 -75 C117 -70 110 -68 104 -77Z" fill="${C.skinSh}" stroke="${L}" stroke-width="1.4" stroke-linejoin="round"/></g>
    <path d="M115.6 -78.6 C118.4 -77.6 120.4 -75.4 121 -72.6 C118.6 -73.4 116.6 -75 115.6 -78.6Z" fill="${C.nail}" stroke="${L}" stroke-width="1" stroke-linejoin="round"/>
    <path d="M103 -78 C108 -76 114 -76 119 -79" stroke="${L}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  const blush=`<ellipse cx="114" cy="-93" rx="6" ry="3.2" fill="#ff8a8a" opacity=".45"/>`;
  const brow=`<path d="${nmLock(100,-117,-Math.PI*.9,9,4.4,1.6)}" fill="${C.sh}" opacity=".8"/>`;
  const collar=o.collar===false?'':`<g class="nm-collar"><path d="M70 -108 C64 -96 68 -82 80 -76" stroke="#1d5f66" stroke-width="7.5" fill="none" stroke-linecap="round"/><path d="M70 -108 C64 -96 68 -82 80 -76" stroke="#2f9aa2" stroke-width="3.6" fill="none" stroke-linecap="round"/>
    <g transform="translate(70 -84) rotate(-24)"><rect x="-6" y="-7" width="12" height="14" rx="3.4" fill="#e9f3f6" stroke="#1d4f56" stroke-width="1.3"/><path d="M0 -3.6 L3.1 -1.8 V1.8 L0 3.6 L-3.1 1.8 V-1.8Z" fill="#5ee6d6" class="nm-collar-light"/></g></g>`;
  const headG=`<g class="nm-head">${nmPart([head].concat(tuft,crown,cheek),C.base,L,headFur)}${trunkHang}${trunkCurl}${trunkEat}${join}${ear}${mouth}${blush}${brow}${nmEye(109,-105,1,C,o,'calf')}</g>`;
  const shadow=o.shadow===false?'':`<ellipse cx="18" cy="2" rx="78" ry="7" fill="rgba(30,20,40,.22)"/>`;
  const sole=`<g class="nm-sole"><ellipse cx="61.6" cy="1.6" rx="12.4" ry="7.4" fill="${C.pad}" stroke="${L}" stroke-width="1.3"/><ellipse cx="61" cy="2.4" rx="8.6" ry="4.4" fill="${C.skinSh}" opacity=".35"/>
    <path d="M54 0 L58 3 L57 6 M58 3 L63 2.4 L66 5 M63 2.4 L66 -1.6 M66 5 L70 3" stroke="${C.skinSh}" stroke-width=".8" fill="none" opacity=".9"/>
    ${[52.4,58,64.4,70].map((x,i)=>`<path d="M${x-2.6} ${-3.6+Math.abs(i-1.5)*1.6} C${x-2.8} ${-6.6+Math.abs(i-1.5)*1.6} ${x+2.8} ${-6.6+Math.abs(i-1.5)*1.6} ${x+2.6} ${-3.6+Math.abs(i-1.5)*1.6}Z" fill="${C.nail}" stroke="${L}" stroke-width=".9"/>`).join('')}</g>`;
  const torso=nmPart([body].concat(skirt,rump,chest,back),C.skirt,L,coat);
  if(lie){const tuck=(x0,x1,seed)=>nmPart([`M${x0} -14 C${x0} -22 ${x1-6} -22 ${x1} -12 C${x1+3} -6 ${x1} 2 ${x1-8} 2 L${x0+4} 2 C${x0-2} 2 ${x0} -8 ${x0} -14Z`].concat(nmFringe(nmAlong([[x0+2,-16],[(x0+x1)/2,-20],[x1-4,-16]],4),{len:6,w:7,seed,jit:.3})),C.base,L,`<rect x="${x0-4}" y="-8" width="${x1-x0+8}" height="12" fill="${C.sh}" opacity=".6"/>`)+nails(x1-16,x1-2);
    return `<g class="nm-mm calf nm-lying ${o.cls||''}" id="${o.id||id}"><ellipse cx="30" cy="2" rx="96" ry="8" fill="rgba(30,20,40,.22)"/>
    <g transform="translate(0 37)">${tail}${torso}</g>${tuck(-38,-6,71)}${tuck(58,92,72)}<g transform="translate(0 37)">${collar}<g transform="rotate(14 80 -90) translate(4 6)">${headG}</g></g></g>`}
  return `<g class="nm-mm calf ${frz?'nm-freeze':''} ${o.cls||''}" id="${o.id||id}">${shadow}
    ${farLeg(legBL,10)}${farLeg(legFL,9)}
    ${tail}
    <g class="nm-bl">${nmPart([legBL].concat(kneeFur(-37,-4,-36,61)),C.base,L,legShade(-3)+legFur(-37,-5,-60,-6,62))}${nails(-28,-5)}</g>
    <g class="nm-fl"><g class="nm-fl-low">${nmPart([legFLlo],C.base,L,legShade(73)+legFur(50,72,-30,-6,65))}${nails(50.5,72.5)}${sole}</g>
      ${nmPart([legFLup].concat(kneeFur(46,79,-31,63)),C.base,L,legShade(76)+legFur(48,74,-62,-28,64))}</g>
    ${torso}
    ${collar}${headG}</g>`}

// ---------- an adult (Nuna), side view: feet on y=0, shoulder hump about 116 high, facing right ----------
// A tall, peaked dome on the head with a dip behind it, a fat shoulder hump, the back sloping steeply to low hindquarters,
// a long shaggy skirt that hangs past the knees, small ears, a long trunk to the ground, and long tusks that curve
// forward, out and up. o: {shadow, eye ('open'|'closed'|'happy'), cls, fur}
function nomeMammothAdult(o){const C={...NM_FUR.adult,...(o.fur||{})},L=C.line,id='nma'+(++NM_N);
  const leg=(x,w)=>`M${x} -66 C${x-1} -42 ${x+2.4} -24 ${x+1.6} -9 C${x+1} -4 ${x-1.6} -1.6 ${x-1} 1 C${x+3} 2.8 ${x+w-3} 2.8 ${x+w+1.4} 1 C${x+w+1.8} -1.6 ${x+w-.4} -4 ${x+w-1} -9 C${x+w-2} -24 ${x+w+1} -42 ${x+w} -66Z`;
  const nails=(x0,x1)=>[0,1,2].map(k=>{const nx=x0+(x1-x0)*(k+.5)/3;return `<path d="M${nmF(nx-3.6)} 1 C${nmF(nx-3.8)} -3.8 ${nmF(nx+3.8)} -3.8 ${nmF(nx+3.6)} 1Z" fill="${C.nail}" stroke="${L}" stroke-width="1"/>`}).join('');
  const legPart=(x,w,seed,dark)=>nmPart([leg(x,w)].concat(nmFringe(nmAlong([[x-1,-30],[x+w/2,-28],[x+w+1,-30]],5),{len:12,w:8,seed,jit:.3,a:Math.PI/2+.15})),dark?C.sh:C.base,L,
    dark?`<rect x="-80" y="-80" width="260" height="90" fill="${C.sh2}" opacity=".45"/>`:`<path d="M${x+w-8} -70 L${x+w+6} -70 L${x+w+6} 4 L${x+w-7} 4Z" fill="${C.sh}" opacity=".8"/><path d="M${x+5} -60 C${x+6} -40 ${x+6} -20 ${x+5} -4" stroke="${C.hi}" stroke-width="3" fill="none" opacity=".35"/>`+nmFurStrokes(x,-64,x+w,-8,12,Math.PI/2+.12,C.sh2,seed+5,9,.4))+nails(x+1,x+w-1);
  const body='M64 -98 C56 -110 44 -117 30 -117 C10 -117 -14 -107 -32 -95 C-46 -85 -56 -74 -58 -60 C-60 -50 -56 -44 -48 -42 C-10 -39 44 -39 80 -42 C88 -50 92 -62 91 -76 C90 -88 80 -96 64 -98Z';
  const backY=x=>x>30?-117+(x-30)*.5:-117+(30-x)*.36+(x<-30?(-30-x)*.5:0);
  const skirt=nmFringe(nmAlong([[-54,-50],[-10,-42],[40,-42],[86,-50]],15),{len:24,w:12,a:Math.PI/2+.2,seed:71,jit:.28,bend:4,v:.6});
  const rump=nmFringe(nmAlong([[-50,-86],[-58,-66],[-54,-48]],5),{len:15,w:11,a:Math.PI*.7,seed:72,jit:.3,v:.7});
  const chest=nmFringe(nmAlong([[90,-80],[91,-62],[86,-48]],4),{len:20,w:11,a:Math.PI/2+.04,seed:73,jit:.25,v:.6});
  const back=nmFringe(nmAlong([[58,-104],[34,-118],[6,-114],[-22,-101],[-44,-84]],13),{len:7,w:11,a:Math.PI*1.08,seed:74,jit:.4,bend:2,v:.8});
  const coat=nmLayer(nmRow(-70,100,12,x=>backY(x)-16),nmRow(-68,98,15,x=>-64+(x<-40?(-40-x)*.5:0)+(x>76?(x-76)*-.8:0)),{len:16,depth:24,seed:75,fill:C.base,line:L,strand:C.sh2})+
    nmLayer(nmRow(-70,100,12,x=>backY(x)-16),nmRow(-68,98,16,x=>backY(x)+28),{len:13,depth:24,seed:76,fill:C.cape,line:L,strand:C.sh,lo:.45})+
    `<path d="M-38 -90 C-16 -106 10 -116 44 -114" stroke="${C.hi}" stroke-width="8" fill="none" stroke-linecap="round" opacity=".55"/>`+
    nmFurStrokes(-56,-110,88,-46,54,Math.PI/2+.45,C.sh2,77,10,.32)+nmFurStrokes(-44,-114,74,-86,26,Math.PI/2+.6,C.hi,78,8,.4);
  const tail=`<g class="nm-tail"><path d="${nmRib(nmBz([[-50,-76],[-58,-68],[-61,-56],[-60,-44]],10),nmTap(6,3))}" fill="${C.sh}" stroke="${L}" stroke-width="1.6"/>
    ${nmPart([nmLock(-60,-47,Math.PI/2+.2,16,8,2),nmLock(-60,-47,Math.PI/2-.2,13,7,-2),nmLock(-60,-47,Math.PI/2+.6,12,6,2)],C.sh2,L,'',1.8)}</g>`;
  // head: the peak of the dome sits at the back of the skull (x 88), well above the shoulder hump
  const head='M64 -96 C56 -112 62 -136 80 -148 C90 -154 104 -151 112 -142 C122 -132 127 -118 127 -104 C127 -95 125 -88 121 -82 C115 -76 107 -73 99 -73 C89 -73 80 -77 74 -83 C69 -88 66 -92 64 -96Z';
  const tuft=[nmLock(86,-150,-Math.PI*.66,14,9,-3),nmLock(94,-151,-Math.PI*.5,11,8,3),nmLock(78,-146,-Math.PI*.8,11,8,-2)];
  const crown=nmFringe(nmAlong([[72,-140],[64,-124],[62,-106]],5),{len:8,w:9,a:Math.PI*.95,seed:81,jit:.4,bend:2,v:.8});
  const cheek=nmFringe(nmAlong([[74,-84],[88,-76],[102,-74]],5),{len:14,w:8,a:Math.PI/2+.3,seed:82,jit:.3});
  const headFur=nmLayer(nmRow(56,134,8,x=>-170),nmRow(58,132,9,x=>-130+Math.abs(x-92)*.2),{len:11,depth:16,seed:83,a:Math.PI/2+.45,fill:C.cape,line:L,strand:C.sh,lo:.55,so:.25})+
    `<path d="M58 -98 C80 -86 104 -80 140 -92 L140 -60 L58 -60Z" fill="${C.sh}" opacity=".75"/><path d="M72 -142 C82 -150 96 -152 106 -146" stroke="${C.hi}" stroke-width="6" fill="none" stroke-linecap="round" opacity=".6"/>`+nmFurStrokes(64,-128,124,-80,26,Math.PI/2+.4,C.sh2,84,7,.35);
  const ear=`<g class="nm-ear"><g transform="translate(88 -112) scale(.78) translate(-88 112)">${nmPart(['M88 -122 C82 -128 72 -126 71 -117 C70 -108 75 -101 84 -102 C88 -103 89 -110 88 -122Z'].concat(nmFringe(nmAlong([[73,-124],[70,-113],[75,-103]],4),{len:6,w:6,a:Math.PI*1.02,seed:85,jit:.5})),C.base,L,
    `<path d="M85.6 -119 C81 -122 76 -120 75.6 -115 C75.2 -110 78 -107 83.6 -108Z" fill="${C.sh}" opacity=".75"/><path d="M86 -123 C81 -127 74 -125 73 -117" stroke="${C.hi}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".5"/>`,2.2)}</g></g>`;
  // tusks: they grow from the lip, sweep down and forward, then curve up and in at the tip
  const tuskPts=nmBz([[112,-80],[122,-44],[160,-38],[166,-72]],18),tusk=(dx,dy,dark)=>{const p=tuskPts.map(([x,y])=>[x+dx,y+dy]);
    return `<path d="${nmRib(p,nmTap(9,2.4))}" fill="${dark?C.tuskSh:C.tusk}" stroke="${L}" stroke-width="1.6" stroke-linejoin="round"/>`+(dark?'':`<path d="${nmRib(p.slice(2,16).map(([x,y])=>[x+1.6,y+1.4]),nmTap(2.6,.6))}" fill="${C.tuskSh}" opacity=".8"/><path d="${nmRib(p.slice(3,15).map(([x,y])=>[x-1.4,y-1.6]),nmTap(1.6,.4))}" fill="#fff" opacity=".7"/>`)};
  const trunk=nmTrunk([[116,-98],[140,-66],[130,-26],[136,-8]],23,10,C,'nm-trunk-hang');
  const hc=id+'h',join=`<clipPath id="${hc}"><path d="${head}"/></clipPath><g clip-path="url(#${hc})"><path d="M106 -116 C116 -118 128 -112 128 -102 C128 -94 124 -88 118 -86 C112 -88 104 -94 102 -104Z" fill="${C.cape}"/>${nmFurStrokes(106,-116,126,-88,9,Math.PI/2+.4,C.sh,86,6,.4)}</g>`;
  const lip=`<path d="M100 -76 C105 -71 111 -70 116 -74 C114 -69 106 -67 100 -76Z" fill="${C.skinSh}" stroke="${L}" stroke-width="1.4" stroke-linejoin="round"/>`;
  return `<g class="nm-mm adult ${o.cls||''}" id="${o.id||id}">${o.shadow===false?'':`<ellipse cx="16" cy="2" rx="86" ry="7" fill="rgba(30,20,40,.22)"/>`}
    <g transform="translate(9 -2)">${legPart(-48,26,91,1)}${legPart(46,27,92,1)}</g>
    ${tail}${legPart(-48,26,93)}${legPart(46,27,94)}
    ${nmPart([body].concat(skirt,rump,chest,back),C.skirt,L,coat)}
    <g class="nm-head">${tusk(-6,-3,true)}${nmPart([head].concat(tuft,crown,cheek),C.base,L,headFur)}${trunk}${join}${ear}${lip}${tusk(0,0)}
      <ellipse cx="111" cy="-98" rx="5.6" ry="3" fill="#ff8a8a" opacity=".3"/><path d="${nmLock(97,-122,-Math.PI*.9,10,4.6,1.6)}" fill="${C.sh}" opacity=".8"/>${nmEye(104,-111,.78,C,o,'adult')}</g></g>`}

// ---------- the calf, front view (talk portrait), in the 30 0 240 360 portrait box ----------
// mood: smile happy neutral worried sad surprised think stern (scared = worried)
function calfPortrait(mood){mood=mood||'smile';const C=NM_FUR.calf,L=C.line,id='nmp'+(++NM_N);
  // small round ears that flick back (worried, surprised) or droop (sad)
  const ears={smile:[0,0],happy:[-6,3],neutral:[0,0],worried:[-18,6],surprised:[-22,8],sad:[14,-4],think:[-6,2],stern:[-12,4]}[mood]||[0,0];
  const trunkC={smile:[[150,166],[146,224],[160,262],[176,248]],happy:[[150,166],[140,226],[168,258],[180,232]],neutral:[[150,166],[150,226],[148,262],[150,288]],
    worried:[[150,166],[154,222],[140,252],[128,238]],surprised:[[150,166],[150,218],[150,250],[152,276]],sad:[[150,166],[152,230],[150,276],[146,304]],think:[[150,166],[144,222],[130,248],[124,232]],stern:[[150,166],[150,226],[148,262],[150,288]]}[mood];
  // body and legs (chest, two front legs with round feet and nails)
  const chest='M150 196 C112 196 86 214 76 242 C68 266 66 296 70 322 L230 322 C234 296 232 266 224 242 C214 214 188 196 150 196Z';
  const legL='M84 290 C82 314 82 336 80 352 C79 360 88 366 104 366 C120 366 128 360 127 352 C125 336 125 314 124 290Z',legR=legL.replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g,(m,x,y)=>nmF(300-x)+' '+y);
  const chestLocks=nmFringe(nmAlong([[72,300],[110,320],[150,324],[190,320],[228,300]],13),{len:26,w:13,seed:91,jit:.3,v:.7}).concat(nmFringe(nmAlong([[72,250],[68,296]],4),{len:14,w:9,a:Math.PI*.78,seed:89,jit:.3}),nmFringe(nmAlong([[228,250],[232,296]],4),{len:14,w:9,a:Math.PI*.22,seed:88,jit:.3}));
  const chestCoat=nmLayer(nmRow(40,260,10,x=>170),nmRow(60,240,13,x=>282-Math.abs(x-150)*.12),{len:18,depth:30,seed:87,a:Math.PI/2,fill:C.base,line:L,strand:C.sh2,lo:.5})+
    nmLayer(nmRow(40,260,10,x=>170),nmRow(70,230,11,x=>248-Math.abs(x-150)*.2),{len:16,depth:24,seed:86,a:Math.PI/2,fill:C.cape,line:L,strand:C.sh,lo:.45});
  // head: a domed crown that rises to a soft peak, full cheeks, a tuft of hair on top
  const head='M150 42 C130 42 112 54 100 72 C86 92 78 116 78 142 C78 174 94 198 118 210 C128 215 140 218 150 218 C160 218 172 215 182 210 C206 198 222 174 222 142 C222 116 214 92 200 72 C188 54 170 42 150 42Z';
  const tuft=[nmLock(148,48,-Math.PI*.56,32,15,-6),nmLock(160,50,-Math.PI*.4,24,12,5),nmLock(138,52,-Math.PI*.72,22,12,-4),nmLock(170,56,-Math.PI*.28,16,10,3)];
  const cheeks=nmFringe(nmAlong([[80,150],[86,184],[106,206]],5),{len:15,w:10,a:Math.PI*.72,seed:93,jit:.4}).concat(nmFringe(nmAlong([[220,150],[214,184],[194,206]],5),{len:15,w:10,a:Math.PI*.28,seed:94,jit:.4}));
  const sideHair=nmFringe(nmAlong([[96,80],[82,108],[78,136]],4),{len:12,w:11,a:Math.PI*.82,seed:90,jit:.4}).concat(nmFringe(nmAlong([[204,80],[218,108],[222,136]],4),{len:12,w:11,a:Math.PI*.18,seed:85,jit:.4}));
  const ear=(side)=>{const [rot,dx]=ears,s=side;const cx=s<0?86:214;
    return `<g transform="rotate(${s*rot} ${cx} 132) translate(${s*-dx*.3} 0)">${nmPart([`M${cx} 112 C${cx+s*18} 104 ${cx+s*30} 116 ${cx+s*30} 132 C${cx+s*30} 148 ${cx+s*18} 156 ${cx} 150Z`].concat(nmFringe(nmAlong([[cx+s*22,112],[cx+s*30,132],[cx+s*22,152]],4),{len:7,w:7,a:s<0?Math.PI:0,seed:95+s,jit:.7})),C.base,L,
      `<path d="M${cx+s*4} 118 C${cx+s*14} 112 ${cx+s*23} 120 ${cx+s*23} 132 C${cx+s*23} 144 ${cx+s*14} 148 ${cx+s*4} 144Z" fill="${C.sh}" opacity=".7"/>`,2.6)}</g>`};
  const md={smile:'open',happy:'happy',neutral:'open',worried:'worried',surprised:'wide',sad:'sad',think:'think',stern:'open'}[mood]||'open';
  const eye=(cx,s)=>{if(md==='happy')return `<path d="M${cx-13} 142 C${cx-7} 130 ${cx+7} 130 ${cx+13} 142" stroke="${L}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    const ry=md==='wide'?17:md==='sad'?12:15,rx=md==='wide'?13:12,cy=138+(md==='sad'?3:0),look=md==='think'?[4,-4]:md==='worried'?[s*-2,0]:[0,1];
    return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff" stroke="${L}" stroke-width="2"/><ellipse cx="${cx+look[0]}" cy="${cy+look[1]+1}" rx="${rx*.78}" ry="${ry*.84}" fill="#3a1b0c"/>
      <ellipse cx="${cx+look[0]}" cy="${cy+look[1]+4}" rx="${rx*.5}" ry="${ry*.5}" fill="#7a3a16"/><circle cx="${cx+look[0]+s*-3.5}" cy="${cy+look[1]-5}" r="4" fill="#fff"/><circle cx="${cx+look[0]+s*3}" cy="${cy+look[1]+6}" r="2" fill="#fff" opacity=".8"/>
      ${md==='sad'||md==='worried'?`<path d="M${cx-rx} ${cy-ry+2} C${cx-4} ${cy-ry-6+(s>0?6:0)} ${cx+4} ${cy-ry-6+(s<0?6:0)} ${cx+rx} ${cy-ry+2}" stroke="${L}" stroke-width="4.4" fill="none" stroke-linecap="round"/>`
        :`<path d="M${cx-rx-1} ${cy-ry*.45} C${cx-rx+2} ${cy-ry-3} ${cx+rx-2} ${cy-ry-3} ${cx+rx+1} ${cy-ry*.45}" stroke="${L}" stroke-width="4" fill="none" stroke-linecap="round"/>`}
      <path d="M${cx+s*(rx-1)} ${cy-ry*.6} l${s*6} -6 M${cx+s*(rx-5)} ${cy-ry*.85} l${s*4} -7" stroke="${L}" stroke-width="2" stroke-linecap="round"/>`};
  const browTufts=(md==='worried'||md==='sad')?`<path d="${nmLock(124,116,-Math.PI*.9,16,7,2)}" fill="${C.sh}"/><path d="${nmLock(176,116,-Math.PI*.1,16,7,-2)}" fill="${C.sh}"/>`:'';
  // trunk: broad where it grows from the face, tapering to the two-fingered tip
  const w0=46,w1=17,tp=nmBz(trunkC,18);const trunk=nmRib(tp,nmTap(w0,w1)),tip=tp[tp.length-1],pre=tp[tp.length-3],ang=Math.atan2(tip[1]-pre[1],tip[0]-pre[0]);
  let rings='';for(let i=4;i<tp.length-2;i+=2){const a=tp[i-1],b=tp[i+1],p=tp[i],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,nx=dy/l,ny=-dx/l,w=(w0-(w0-w1)*i/18)/2*.82;
    rings+=`<path d="M${nmF(p[0]+nx*w)} ${nmF(p[1]+ny*w)} Q${nmF(p[0]+dx/l*3)} ${nmF(p[1]+dy/l*3)} ${nmF(p[0]-nx*w)} ${nmF(p[1]-ny*w)}" stroke="${C.sh2}" stroke-width="1.4" fill="none" opacity=".5"/>`}
  const c=Math.cos(ang),s=Math.sin(ang),T=(u,v)=>nmF(tip[0]+c*u-s*v)+' '+nmF(tip[1]+s*u+c*v);
  const tipD=`<path d="M${T(-3,-8.6)} C${T(4,-9)} ${T(11,-6.6)} ${T(12.4,-2.6)} C${T(9.6,-.4)} ${T(4,.4)} ${T(0,.4)} C${T(4,2)} ${T(7.4,4.6)} ${T(6.2,7.8)} C${T(2,9.4)} ${T(-4,9)} ${T(-6,7)}Z" fill="${C.skin}" stroke="${L}" stroke-width="2" stroke-linejoin="round"/>`;
  // the mouth shows at both sides of the trunk; two milk-tusk nubs peek out under the lip
  const my=204,curve={open:3,happy:5,think:2,worried:-1,sad:-4,wide:0}[md]??2;
  const corner=(sd)=>md==='wide'?`<path d="M${150+sd*26} ${my-2} C${150+sd*28} ${my+8} ${150+sd*36} ${my+10} ${150+sd*38} ${my+2}Z" fill="#7a2a24" stroke="${L}" stroke-width="2" stroke-linejoin="round"/>`
    :`<path d="M${150+sd*25} ${my} Q${150+sd*32} ${my+curve+2} ${150+sd*39} ${my-curve}" stroke="${L}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  const nub=(sd)=>`<path d="M${150+sd*24} ${my+3} C${150+sd*25} ${my+10} ${150+sd*28} ${my+14} ${150+sd*31} ${my+14} C${150+sd*31} ${my+8} ${150+sd*30} ${my+4} ${150+sd*28} ${my+2}Z" fill="${C.nail}" stroke="${L}" stroke-width="1.6" stroke-linejoin="round"/>`;
  const collar=`<path d="M92 222 C118 238 182 238 208 222" stroke="#1d5f66" stroke-width="13" fill="none" stroke-linecap="round"/><path d="M92 222 C118 238 182 238 208 222" stroke="#2f9aa2" stroke-width="7" fill="none" stroke-linecap="round"/>
    <g transform="translate(150 240)"><rect x="-13" y="-11" width="26" height="22" rx="6" fill="#e9f3f6" stroke="#1d4f56" stroke-width="2"/><path d="M0 -6 L5.2 -3 V3 L0 6 L-5.2 3 V-3Z" fill="#5ee6d6" class="nm-collar-light"/></g>`;
  // head fur: a lighter top layer that ends in a fringe of locks across the forehead, and cel shading on the lower face
  const headSh=`<path d="M60 160 C90 204 210 204 240 160 L240 240 L60 240Z" fill="${C.sh}" opacity=".65"/>`+
    nmLayer(nmRow(60,240,8,x=>20),nmRow(84,216,10,x=>104+Math.pow(Math.abs(x-150)/66,2)*14),{len:16,depth:26,seed:84,a:Math.PI/2+.05,fill:C.cape,line:L,strand:C.sh,lo:.55,so:.28})+
    `<path d="M108 74 C126 56 174 56 192 74" stroke="${C.hi}" stroke-width="12" fill="none" stroke-linecap="round" opacity=".6"/><path d="M120 64 C138 54 162 54 180 64" stroke="${C.hi2}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".55"/>`+
    nmFurStrokes(80,110,220,206,34,Math.PI/2+.2,C.sh,96,12,.3);
  const fx=mood==='surprised'?`<path d="M232 70 L244 58 M238 86 L254 82 M68 70 L56 58" stroke="${L}" stroke-width="3.4" stroke-linecap="round"/>`:mood==='worried'?`<path d="M232 96 C236 106 239 112 239 117 C239 122 235 125 231.5 125 C228 125 224 122 224.5 117 C225 112 228 106 232 96Z" fill="#bfe8ff" stroke="#4a9ad8" stroke-width="1.6"/>`:mood==='happy'?`<path d="M236 74 l4 10 l10 2 l-8 6 l2 10 l-8 -5 l-9 5 l2 -10 l-7 -6 l10 -2z" fill="#ffd45c"/>`:'';
  return `<g class="person nm-calf-portrait"><g class="p-body">${nmPart([legL,legR],C.base,L,`<rect x="60" y="290" width="180" height="80" fill="${C.sh}" opacity=".4"/><path d="M112 290 L127 290 L127 366 L112 366Z M188 290 L216 290 L216 366 L188 366Z" fill="${C.sh}" opacity=".5"/>`+nmFurStrokes(78,296,222,350,24,Math.PI/2+.1,C.sh,98,10,.45))}
      ${[[86,124],[176,214]].map(([a,b])=>[0,1,2].map(i=>{const x=a+(b-a)*(i+.5)/3;return `<path d="M${x-6} 366 C${x-6} 357 ${x+6} 357 ${x+6} 366Z" fill="${C.nail}" stroke="${L}" stroke-width="1.6"/>`}).join('')).join('')}
      ${nmPart([chest].concat(chestLocks),C.skirt,L,chestCoat+nmFurStrokes(84,200,216,300,30,Math.PI/2+.3,C.sh2,99,12,.3))}${collar}</g>
    <g class="p-head"><rect x="56" y="10" width="188" height="220" fill="none"/>${ear(-1)}${ear(1)}${nmPart([head].concat(tuft,cheeks,sideHair),C.base,L,headSh)}
      <ellipse cx="106" cy="172" rx="14" ry="8" fill="#ff8a8a" opacity=".4"/><ellipse cx="194" cy="172" rx="14" ry="8" fill="#ff8a8a" opacity=".4"/>
      <g class="p-eyes">${eye(112,-1)}${eye(188,1)}</g>${browTufts}${corner(-1)}${corner(1)}${nub(-1)}${nub(1)}
      <g class="p-mouth">${nmPart([trunk],C.base,L,`<path d="${nmRib(tp,nmTap(w0*.34,w1*.34))}" fill="${C.sh}" opacity=".8" transform="translate(-7 0)"/><path d="${nmRib(tp,nmTap(w0*.14,w1*.12))}" fill="${C.hi}" opacity=".45" transform="translate(9 0)"/>${rings}`,3)}${tipD}
        <path d="M128 168 C136 158 164 158 172 168" stroke="${C.cape}" stroke-width="7" fill="none" stroke-linecap="round"/></g>${fx}</g></g>`}

// ---------- Nome outfits on the shared anime bust ----------
// Ruth: a calico atikłuk (hooded overshirt with a front pocket and rickrack trim) over a fleece; beaded earrings.
// Eli: a waxed-canvas work jacket over a hoodie, with a herder's reflective band.
// the neck for a Nome outfit: it starts behind the chin (the head covers its top) and runs down into the collar opening,
// at the same width as the shared bust's neck, with the shadow the chin casts. x0/x1: sides, chin: chin y, low: bottom centre y.
function nmNeck(x0,x1,chin,low,sk){const m=(x0+x1)/2,w=x1-x0;
  return `<path d="M${x0} 150 L${x0} ${low-4} C${x0+w*.2} ${low+10} ${x1-w*.2} ${low+10} ${x1} ${low-4} L${x1} 150Z" fill="${sk.base}" stroke="${sk.line}" stroke-width="2"/>
    <path d="M${x0+1} 150 L${x0+1} ${chin-10} C${m-w*.25} ${chin+12} ${m+w*.25} ${chin+12} ${x1-1} ${chin-10} L${x1-1} 150Z" fill="${sk.sh}"/>
    <path d="M${m+w*.22} 150 C${m+w*.26} ${chin+4} ${m+w*.32} ${low-6} ${m+w*.4} ${low+4} L${x1-1} ${low} L${x1-1} 150Z" fill="${sk.sh}" opacity=".8"/>`}
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
      ${nmNeck(133.6,166.4,191,208,sk)}
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
      ${nmNeck(129.4,170.6,196,210,sk)}
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
      <div class="nm-icons">${cfg.order.map(id=>`<button class="nm-ic ${st[id]?'on':''} ${st[id]==='pulse'?'key':''}" data-ic="${id}" aria-label="${S_(cfg.parts[id].label)}"><svg viewBox="0 0 24 24">${NM_ICON[id]||''}</svg><span>${S_(cfg.parts[id].short||cfg.parts[id].label)}</span></button>`).join('')}</div>
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
