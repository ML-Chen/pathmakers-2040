// characters.js — anime cast art for Pathmakers 2040 (loaded after art.js; redefines byteSVG, byteBox, personSVG, portrait, mini).
// People: natural-proportion anime busts (viewBox 0 0 300 360, bottom-anchored) with warm ink line art (thick silhouette,
// thin interior), 2-tone cel shading + highlights on skin, hair and clothes, hair built from overlapping pointed clumps
// with shine streaks and a cast shadow on the forehead. Light comes from the upper left.
// Animation hooks kept: .person > .p-body (neck + clothes), .p-head (pivot = neck, via an invisible box), .p-eyes, .p-mouth.
// Byte: a fluffy puppy first, robot second (only a glowing hex tag on the collar). Tail base at (108,116) = CSS origin.
// All ids are unique per instance (prefix chN).

let CH_N=0;
function ch_n(v){return Math.round(v*10)/10}
function ch_rgb(c){c=String(c||'#888888').trim();if(c[0]==='#')c=c.slice(1);if(c.length===3)c=c.replace(/./g,'$&$&');const n=parseInt(c.slice(0,6),16);return isNaN(n)?[136,136,136]:[n>>16&255,n>>8&255,n&255]}
function ch_mix(a,b,t){const A=ch_rgb(a),B=ch_rgb(b);return '#'+A.map((v,i)=>Math.max(0,Math.min(255,Math.round(v+(B[i]-v)*t))).toString(16).padStart(2,'0')).join('')}
function ch_lum(c){const l=ch_rgb(c).map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*l[0]+.7152*l[1]+.0722*l[2]}
// mirror every x of an absolute-coordinate path (M/L/C/Q/Z only) around x=ax
function ch_mx(d,ax){return d.replace(/(-?\d*\.?\d+)[ ,]+(-?\d*\.?\d+)/g,(m,x,y)=>ch_n(2*ax-x)+' '+y)}
// translate an absolute path
function ch_tr(d,dx,dy){return d.replace(/(-?\d*\.?\d+)[ ,]+(-?\d*\.?\d+)/g,(m,x,y)=>ch_n(+x+dx)+' '+ch_n(+y+dy))}
// Bezier sampling (quad or cubic) and chains of segments
function ch_bz(P,N){N=N||12;const o=[];for(let i=0;i<=N;i++){const t=i/N,m=1-t;
  if(P.length===4)o.push([m*m*m*P[0][0]+3*m*m*t*P[1][0]+3*m*t*t*P[2][0]+t*t*t*P[3][0],m*m*m*P[0][1]+3*m*m*t*P[1][1]+3*m*t*t*P[2][1]+t*t*t*P[3][1]]);
  else if(P.length===3)o.push([m*m*P[0][0]+2*m*t*P[1][0]+t*t*P[2][0],m*m*P[0][1]+2*m*t*P[1][1]+t*t*P[2][1]]);
  else o.push([P[0][0]+(P[1][0]-P[0][0])*t,P[0][1]+(P[1][1]-P[0][1])*t])}return o}
function ch_chain(segs,N){let o=[];segs.forEach((s,i)=>{const p=ch_bz(s,N);o=o.concat(i?p.slice(1):p)});return o}
function ch_pl(pts){return pts.map((p,i)=>(i?'L':'M')+ch_n(p[0])+' '+ch_n(p[1])).join('')}
function ch_sub(pts,a,b){const n=pts.length-1;return pts.slice(Math.round(a*n),Math.round(b*n)+1)}
// tapered ribbon along pts; wf(t) = width. mode 0: centred; 1: grows upward; -1: grows downward.
function ch_rib(pts,wf,mode){mode=mode||0;const A=[],B=[],n=pts.length;
  for(let i=0;i<n;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(n-1,i+1)];const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;let nx=dy/l,ny=-dx/l;
    if(mode&&((ny>0)===(mode>0))){nx=-nx;ny=-ny}
    const w=wf(n>1?i/(n-1):0),p=pts[i];
    if(mode){A.push([p[0]+nx*w,p[1]+ny*w]);B.push(p)}else{A.push([p[0]+nx*w/2,p[1]+ny*w/2]);B.push([p[0]-nx*w/2,p[1]-ny*w/2])}}
  return ch_pl(A.concat(B.reverse()))+'Z'}
const ch_tap=(a,b,c)=>t=>t<.5?a+(b-a)*t*2:b+(c-b)*(t-.5)*2;
const ch_swell=(m,e)=>t=>(e||0)+(m-(e||0))*Math.sin(Math.PI*t);
// a tapered line along bezier segments

// ---------- limbs ----------
// Smooth centre line through 2-3 joints (Catmull-Rom), sampled N points per segment.
function ch_spline(P,N){N=N||10;if(P.length<3)return ch_bz(P,N);const o=[];
  for(let i=0;i<P.length-1;i++){const p0=P[Math.max(0,i-1)],p1=P[i],p2=P[i+1],p3=P[Math.min(P.length-1,i+2)];
    const c1=[p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6],c2=[p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6];
    const seg=ch_bz([p1,c1,c2,p2],N);o.push(...(i?seg.slice(1):seg))}return o}
// piecewise-linear width profile: pairs [t, factor]
const ch_prof=(K,w)=>t=>{for(let i=1;i<K.length;i++)if(t<=K[i][0]){const a=K[i-1],b=K[i],u=(t-a[0])/((b[0]-a[0])||1);return w*(a[1]+(b[1]-a[1])*u)}return w*K[K.length-1][1]};
// smooth closed path through a list of points (Catmull-Rom -> cubic Bezier), open polyline version
function ch_smooth(A){let d='';for(let i=0;i<A.length-1;i++){const p0=A[Math.max(0,i-1)],p1=A[i],p2=A[i+1],p3=A[Math.min(A.length-1,i+2)];
  d+=` C${ch_n(p1[0]+(p2[0]-p0[0])/6)} ${ch_n(p1[1]+(p2[1]-p0[1])/6)} ${ch_n(p2[0]-(p3[0]-p1[0])/6)} ${ch_n(p2[1]-(p3[1]-p1[1])/6)} ${ch_n(p2[0])} ${ch_n(p2[1])}`}return d}
// Outline of a tapered limb along centre points C with width function wf(t); round caps. side>0 also returns a shade band on the +normal side.
function ch_limbPath(C,wf,band){const A=[],B=[],n=C.length;
  for(let i=0;i<n;i++){const a=C[Math.max(0,i-1)],b=C[Math.min(n-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,nx=dy/l,ny=-dx/l,w=wf(n>1?i/(n-1):0)/2,p=C[i];
    if(band){A.push([p[0]+nx*w,p[1]+ny*w]);B.push([p[0]+nx*w*(1-band*2),p[1]+ny*w*(1-band*2)])}else{A.push([p[0]+nx*w,p[1]+ny*w]);B.push([p[0]-nx*w,p[1]-ny*w])}}
  B.reverse();const r0=wf(1)/2,r1=wf(0)/2,P=q=>ch_n(q[0])+' '+ch_n(q[1]);
  return band?`M${P(A[0])}${ch_smooth(A)} L${P(B[0])}${ch_smooth(B)}Z`
    :`M${P(A[0])}${ch_smooth(A)} A${ch_n(r0)} ${ch_n(r0)} 0 0 1 ${P(B[0])}${ch_smooth(B)} A${ch_n(r1)} ${ch_n(r1)} 0 0 1 ${P(A[0])}Z`}
const CH_LEG=[[0,1],[.3,.9],[.48,.74],[.56,.76],[.68,.8],[.9,.56],[1,.52]],CH_ARM=[[0,1],[.38,.84],[.5,.74],[.62,.8],[.9,.62],[1,.6]],CH_PANT=[[0,1],[.5,.88],[1,.84]];
// joints -> outlined, tapered, softly bent limb with a shade band
function ch_limb(pts,w,prof,fill,line,lw,sh){const C=ch_spline(pts,10),wf=ch_prof(prof,w);
  return `<path d="${ch_limbPath(C,wf)}" fill="${fill}" stroke="${line}" stroke-width="${ch_n(lw)}" stroke-linejoin="round"/>`+(sh?`<path d="${ch_limbPath(C.slice(1,-1),t=>wf(t)*.94,.2)}" fill="${sh}"/>`:'')}
function ch_ln(segs,wf,fill,extra){return `<path d="${ch_rib(ch_chain(segs,14),wf)}" fill="${fill}"${extra?' '+extra:''}/>`}
// a pointed hair clump: roots L,R; tip T; bl/br bulge outward on each side (negative = concave)
function ch_clump(L,R,T,bl,br){const d1=[T[0]-L[0],T[1]-L[1]],l1=Math.hypot(d1[0],d1[1])||1,n1=[-d1[1]/l1,d1[0]/l1];
  const d2=[R[0]-T[0],R[1]-T[1]],l2=Math.hypot(d2[0],d2[1])||1,n2=[-d2[1]/l2,d2[0]/l2];
  const a=[L,[L[0]+d1[0]*.32+n1[0]*bl,L[1]+d1[1]*.32+n1[1]*bl],[L[0]+d1[0]*.72+n1[0]*bl*.75,L[1]+d1[1]*.72+n1[1]*bl*.75],T];
  const b=[T,[T[0]+d2[0]*.28+n2[0]*br*.75,T[1]+d2[1]*.28+n2[1]*br*.75],[T[0]+d2[0]*.68+n2[0]*br,T[1]+d2[1]*.68+n2[1]*br],R];
  const P=p=>ch_n(p[0])+' '+ch_n(p[1]);
  return {d:`M${P(L)} C${P(a[1])} ${P(a[2])} ${P(T)} C${P(b[1])} ${P(b[2])} ${P(R)}Z`,a,b,L,R,T}}
function ch_star(x,y,r,fill,extra){const k=r*.28;return `<path d="M${ch_n(x)} ${ch_n(y-r)} Q${ch_n(x+k)} ${ch_n(y-k)} ${ch_n(x+r)} ${ch_n(y)} Q${ch_n(x+k)} ${ch_n(y+k)} ${ch_n(x)} ${ch_n(y+r)} Q${ch_n(x-k)} ${ch_n(y+k)} ${ch_n(x-r)} ${ch_n(y)} Q${ch_n(x-k)} ${ch_n(y-k)} ${ch_n(x)} ${ch_n(y-r)}Z" fill="${fill}"${extra?' '+extra:''}/>`}

// ---------- palettes ----------
function ch_skinPal(s){const L=ch_lum(s),dk=L<.2;
  return {base:s,sh:ch_mix(s,dk?'#2a0c1c':'#7a2a3c',dk?.32:.24),sh2:ch_mix(s,dk?'#1e0612':'#5a1628',dk?.46:.36),hi:ch_mix(s,dk?'#f2b88e':'#fff6ec',dk?.3:.5),
    line:ch_mix(s,'#24090a',dk?.62:.74),blush:dk?'#e2566f':'#ff7088',mouth:'#4e1422',tongue:dk?'#d65a6c':'#ef7684',lip:ch_mix(s,dk?'#8a2c48':'#e0707e',dk?.42:.32)}}
function ch_hairPal(h){const L=ch_lum(h);const base=L<.025?ch_mix(h,'#3c3456',.34):L<.07?ch_mix(h,'#3c3456',.2):h;const Lb=ch_lum(base);
  return {base,top:ch_mix(base,Lb<.1?'#8a8cb8':'#fff0d8',.22),sh:ch_mix(base,'#1a0c26',Lb<.1?.42:.3),dk:ch_mix(base,'#0e0614',Lb<.1?.62:.5),
    hi:ch_mix(base,Lb<.1?'#c4ccff':'#fff4e0',Lb<.1?.5:.55),line:ch_mix(base,'#0a0410',Lb<.1?.72:.62)}}
function ch_clothPal(c){const L=ch_lum(c);return {base:c,sh:ch_mix(c,'#20184a',L>.8?.16:.26),sh2:ch_mix(c,'#140c30',L>.8?.3:.42),hi:ch_mix(c,'#ffffff',.35),line:ch_mix(c,'#120a26',L>.8?.72:.7)}}

// ---------- head geometry by build ----------
const CH_FACE={
  F:{face:'M150 50 C121 50 98 70 98 100 C98 116 98 128 101 142 C104 158 112 170 124 180 C133 187 142 190 150 191 C158 190 167 187 176 180 C188 170 196 158 199 142 C202 128 202 116 202 100 C202 70 179 50 150 50Z',
     ey:128,ex:26,ew:27,eh:16.5,irx:8.3,iry:10.4,lash:3.7,wing:1,brow:2.3,by:-9,ny:153,my:170,chin:191,nw:19,ear:118},
  K:{face:'M150 52 C120 52 98 74 98 104 C98 122 99 136 103 150 C107 164 116 175 127 182 C135 187 143 189 150 189 C157 189 165 187 173 182 C184 175 193 164 197 150 C201 136 202 122 202 104 C202 74 180 52 150 52Z',
     ey:132,ex:26,ew:28,eh:21,irx:9.4,iry:11.6,lash:3.1,wing:.6,brow:2,by:-8,ny:156,my:171,chin:189,nw:15,ear:122},
  M:{face:'M150 48 C120 48 96 68 96 100 C96 118 97 134 100 148 C103 162 108 173 118 183 C128 192 140 196 150 196 C160 196 172 192 182 183 C192 173 197 162 200 148 C203 134 204 118 204 100 C204 68 180 48 150 48Z',
     ey:128,ex:27,ew:26,eh:11.6,irx:7.2,iry:8.6,lash:2.5,wing:.2,brow:3.8,by:-8,ny:156,my:175,chin:196,nw:24,ear:118}
};
// eyelid shapes: [inner y, peak y, peak u, outer y, bottom y] in units of eye height (u in eye widths)
const CH_LIDS={normal:[-.02,-.56,-.04,-.22,.48],wide:[-.08,-.76,-.02,-.32,.6],half:[.06,-.26,.1,-.08,.46],sad:[-.22,-.44,-.16,.04,.46],stern:[.1,-.3,.14,-.38,.42]};

// one eye. o=-1 viewer-left, +1 viewer-right. E: geometry + colours + mood bits
function ch_eye(cx,cy,o,E,id,k){
  const w=E.ew,h=E.eh,X=u=>cx+o*u,lash=E.lashC;
  if(E.lid==='closed'){ // happy: curved closed lid with lashes
    const pts=ch_bz([[X(-w*.48),cy+h*.12],[X(-w*.02),cy-h*.62],[X(w*.52),cy+h*.02]],18);
    let s=`<path d="${ch_rib(pts,t=>.9+E.lash*.85*Math.sin(Math.PI*Math.min(1,.15+t*.9)))}" fill="${lash}"/>`;
    if(E.wing>.3)s+=`<path d="M${ch_n(X(w*.4))} ${ch_n(cy-h*.12)} L${ch_n(X(w*.62))} ${ch_n(cy-h*.3)} L${ch_n(X(w*.5))} ${ch_n(cy+h*.06)}Z" fill="${lash}"/>`;
    s+=ch_ln([[[X(-w*.3),cy+h*.42],[X(0),cy+h*.62],[X(w*.3),cy+h*.42]]],ch_swell(1.1,.2),E.skinLine,'opacity=".45"');
    return s}
  const S=CH_LIDS[E.lid]||CH_LIDS.normal;
  const I=[X(-w/2),cy+h*S[0]],Pk=[X(w*S[2]),cy+h*S[1]],O=[X(w/2+.5),cy+h*S[3]],By=cy+h*S[4],B=[X(w*.04),By];
  const s1=[I,[I[0],I[1]+(Pk[1]-I[1])*.72],[X(w*S[2]-w*.3),Pk[1]],Pk],s2=[Pk,[X(w*S[2]+w*.3),Pk[1]],[O[0],O[1]+(Pk[1]-O[1])*.55],O];
  const s3=[O,[X(w/2),cy+h*.2],[X(w*.3),By],B],s4=[B,[X(-w*.24),By],[X(-w/2-.5),cy+h*.28],I];
  const P=p=>ch_n(p[0])+' '+ch_n(p[1]);
  const white=`M${P(I)} C${P(s1[1])} ${P(s1[2])} ${P(Pk)} C${P(s2[1])} ${P(s2[2])} ${P(O)} C${P(s3[1])} ${P(s3[2])} ${P(B)} C${P(s4[1])} ${P(s4[2])} ${P(I)}Z`;
  const sc=E.lid==='wide'?.74:E.worry?.9:1,irx=E.irx*sc,iry=E.iry*sc,ix=cx+E.look[0]-o*.4,iy=cy+h*.1+E.look[1];
  const lidPts=ch_chain([s1,s2],12);
  let s=`<clipPath id="${id}e${k}"><path d="${white}"/></clipPath><path d="${white}" fill="${E.white}"/>
   <g clip-path="url(#${id}e${k})">
    <ellipse cx="${ch_n(ix)}" cy="${ch_n(iy)}" rx="${ch_n(irx)}" ry="${ch_n(iry)}" fill="url(#${id}i)"/>
    <ellipse cx="${ch_n(ix)}" cy="${ch_n(iy+iry*.5)}" rx="${ch_n(irx*.66)}" ry="${ch_n(iry*.34)}" fill="${E.irisGlow}" opacity=".8"/>
    <ellipse cx="${ch_n(ix)}" cy="${ch_n(iy-iry*.02)}" rx="${ch_n(irx*(E.lid==='wide'?.3:.44))}" ry="${ch_n(iry*(E.lid==='wide'?.32:.48))}" fill="${E.pupil}"/>
    <ellipse cx="${ch_n(ix)}" cy="${ch_n(iy)}" rx="${ch_n(irx)}" ry="${ch_n(iry)}" fill="none" stroke="${E.irisLine}" stroke-width="1.1"/>
    <path d="${ch_rib(lidPts,()=>h*.2,-1)}" fill="${E.lidSh}" opacity=".36"/>
    <ellipse cx="${ch_n(ix-irx*.34)}" cy="${ch_n(iy-iry*.36)}" rx="${ch_n(irx*.3)}" ry="${ch_n(iry*.24)}" fill="#fff" transform="rotate(-24 ${ch_n(ix-irx*.34)} ${ch_n(iy-iry*.36)})"/>
    <circle cx="${ch_n(ix+irx*.42)}" cy="${ch_n(iy+iry*.3)}" r="${ch_n(irx*.14)}" fill="#fff" opacity=".95"/>
    ${E.kid?`<circle cx="${ch_n(ix+irx*.36)}" cy="${ch_n(iy-iry*.42)}" r="${ch_n(irx*.08)}" fill="#fff"/>`:''}
    <path d="M${ch_n(ix-irx*.55)} ${ch_n(iy+iry*.52)} Q${ch_n(ix)} ${ch_n(iy+iry*.8)} ${ch_n(ix+irx*.55)} ${ch_n(iy+iry*.52)}" stroke="#fff" stroke-width=".9" opacity=".45" fill="none"/>
    ${E.tear?`<path d="M${ch_n(X(-w*.5))} ${ch_n(cy+h*.3)} Q${ch_n(X(-w*.25))} ${ch_n(cy+h*.16)} ${ch_n(X(0))} ${ch_n(cy+h*.3)} Q${ch_n(X(w*.25))} ${ch_n(cy+h*.44)} ${ch_n(X(w*.5))} ${ch_n(cy+h*.28)}" stroke="#fff" stroke-width="1.8" opacity=".9" fill="none"/>`:''}
   </g>`;
  // upper lash band, thickest toward the outer corner, plus wing and small spikes
  const wf=t=>.7+E.lash*(.25+.75*Math.pow(t,1.1))*(t>.93?1-(t-.93)*3:1);
  s+=`<path d="${ch_rib(lidPts,wf,1)}" fill="${lash}"/>`;
  const wEnd=wf(1),Ot=[O[0],O[1]-wEnd];
  if(E.wing>0)s+=`<path d="M${P([X(w*.36),O[1]-wEnd*1.2])} L${P([X(w/2+1+4.5*E.wing),O[1]-1.5-3.2*E.wing])} L${P([X(w/2+.8+1.5*E.wing),O[1]+.8+1.2*E.wing])} L${P([X(w/2-1),O[1]+.6])}Z" fill="${lash}"/>`;
  if(E.wing>.5){for(const t of [.62,.8]){const i=Math.round(t*(lidPts.length-1)),p=lidPts[i],q=lidPts[Math.max(0,i-1)],r=lidPts[Math.min(lidPts.length-1,i+1)],ww=wf(t);
    s+=`<path d="M${P([q[0],q[1]-ww*.7])} L${P([p[0]+o*3,p[1]-ww-3.2])} L${P([r[0],r[1]-ww*.7])}Z" fill="${lash}"/>`}}
  // double-lid crease
  const cr=ch_sub(lidPts,.3,.92).map((p,i,a)=>[p[0],p[1]-wf(.3+.62*i/(a.length-1))-2.6]);
  s+=`<path d="${ch_rib(cr,ch_swell(.95,.15))}" fill="${E.skinLine}" opacity=".55"/>`;
  // lower lash: soft partial line on the outer half
  s+=`<path d="${ch_rib(ch_sub(ch_bz(s3,12),.12,.95),ch_swell(E.kid?1:1.1,.2))}" fill="${lash}" opacity=".55"/>`;
  return s}

// eyebrow (tapered) — sh: [inner dy, mid dy, outer dy]
function ch_brow(cx,by,o,sh,E,col){const w=E.ew,X=u=>cx+o*u;
  const pts=ch_bz([[X(-w*.42),by+sh[0]],[X(w*.1),by+sh[1]-2.6],[X(w*.62),by+sh[2]+1]],12);
  return `<path d="${ch_rib(pts,ch_tap(E.brow*1.15,E.brow,.5))}" fill="${col}"/>`}
const CH_BROWS={soft:[1.2,-1.2,1.2],flat:[.4,0,1.4],worried:[-4.6,-2.6,2.6],stern:[4.2,1.4,-1.2],up:[-5.5,-8,-4],think:[[-4.5,-6,-2],[2,1,.8]]};
const CH_MOODS={
  smile:{lid:'normal',brow:'soft',mouth:'smile'},happy:{lid:'closed',brow:'soft',mouth:'happy',fx:'sparkle'},
  neutral:{lid:'normal',brow:'flat',mouth:'neutral'},worried:{lid:'normal',brow:'worried',mouth:'worried',fx:'sweat',worry:1},
  sad:{lid:'sad',brow:'worried',mouth:'sad',fx:'tear'},surprised:{lid:'wide',brow:'up',mouth:'o',fx:'pop'},
  stern:{lid:'stern',brow:'stern',mouth:'stern'},think:{lid:'half',brow:'think',mouth:'think',look:[4,-3.5],fx:'dots'}};

// mouth shapes centred on (150,y); filled so the talking scale reads as opening
function ch_mouth(m,y,K,sk,masc){const c=150,wd=masc?1.08:K?.9:1,X=dx=>ch_n(c+dx*wd),Y=dy=>ch_n(y+dy),dk=sk.mouth,ln=sk.line;
  const teeth=(a,b)=>`<path d="M${X(-a)} ${Y(.4)} Q${X(0)} ${Y(2.4)} ${X(a)} ${Y(.4)} L${X(a-.6)} ${Y(b)} Q${X(0)} ${Y(b+2)} ${X(-a+.6)} ${Y(b)}Z" fill="#fffaf6"/>`;
  switch(m){
    case 'happy':return `<path d="M${X(-11)} ${Y(-1)} Q${X(0)} ${Y(2.6)} ${X(11)} ${Y(-1)} Q${X(9)} ${Y(12)} ${X(0)} ${Y(12.6)} Q${X(-9)} ${Y(12)} ${X(-11)} ${Y(-1)}Z" fill="${dk}" stroke="${ln}" stroke-width="1.1" stroke-linejoin="round"/>${teeth(9,2.4)}<path d="M${X(-6)} ${Y(9.6)} Q${X(0)} ${Y(5.4)} ${X(6)} ${Y(9.6)} Q${X(3)} ${Y(12.2)} ${X(0)} ${Y(12.2)} Q${X(-3)} ${Y(12.2)} ${X(-6)} ${Y(9.6)}Z" fill="${sk.tongue}"/>`;
    case 'smile':return `<path d="M${X(-9.5)} ${Y(-.6)} Q${X(0)} ${Y(2.4)} ${X(9.5)} ${Y(-.6)} Q${X(5)} ${Y(4.6)} ${X(0)} ${Y(4.8)} Q${X(-5)} ${Y(4.6)} ${X(-9.5)} ${Y(-.6)}Z" fill="${dk}"/>${teeth(7,1.4)}<path d="${ch_rib(ch_bz([[c-wd*10.5,y-2],[c-wd*9.6,y-.4],[c-wd*8.2,y+.4]],5),ch_swell(1.1,.3))}" fill="${ln}"/><path d="${ch_rib(ch_bz([[c+wd*10.5,y-2],[c+wd*9.6,y-.4],[c+wd*8.2,y+.4]],5),ch_swell(1.1,.3))}" fill="${ln}"/>`;
    case 'neutral':return `<path d="${ch_rib(ch_bz([[c-wd*8.5,y+.4],[c,y+1.8],[c+wd*8.5,y+.2]],12),ch_swell(2,.5))}" fill="${dk}"/>`;
    case 'worried':return `<path d="M${X(-7.5)} ${Y(1.4)} Q${X(-3.5)} ${Y(-1.4)} ${X(.5)} ${Y(.4)} Q${X(4.5)} ${Y(1.8)} ${X(7.5)} ${Y(-.2)} Q${X(5)} ${Y(4.6)} ${X(0)} ${Y(4.4)} Q${X(-5)} ${Y(4.6)} ${X(-7.5)} ${Y(1.4)}Z" fill="${dk}"/>${teeth(4.5,1.6)}`;
    case 'sad':return `<path d="M${X(-8)} ${Y(3.6)} Q${X(0)} ${Y(-2.6)} ${X(8)} ${Y(3.6)} Q${X(0)} ${Y(1.8)} ${X(-8)} ${Y(3.6)}Z" fill="${dk}" stroke="${dk}" stroke-width="1.2" stroke-linejoin="round"/>`;
    case 'o':return `<ellipse cx="${c}" cy="${Y(3.6)}" rx="${ch_n(5*wd)}" ry="6.2" fill="${dk}" stroke="${ln}" stroke-width="1"/><path d="M${X(-3.2)} ${Y(7.6)} Q${X(0)} ${Y(5)} ${X(3.2)} ${Y(7.6)} Q${X(0)} ${Y(9.8)} ${X(-3.2)} ${Y(7.6)}Z" fill="${sk.tongue}"/>`;
    case 'stern':return `<path d="${ch_rib(ch_bz([[c-wd*9.5,y+1.8],[c-wd*6,y+.2],[c,y+.4],[c+wd*9.5,y+1.8]],12),ch_swell(2.1,.7))}" fill="${dk}"/>`;
    case 'think':return `<path d="${ch_rib(ch_bz([[c-wd*3,y+1.2],[c+wd*3,y-.6],[c+wd*9,y+.6]],10),ch_swell(2,.5))}" fill="${dk}"/><path d="M${X(9.5)} ${Y(-1.2)} Q${X(10.6)} ${Y(.4)} ${X(9.6)} ${Y(1.8)}" stroke="${ln}" stroke-width=".9" fill="none" stroke-linecap="round"/>`;
  }return ''}

// ---------- hair styles ----------
// Each style: back (behind the face, in .p-head), cap (crown mass), clumps (pointed locks, paint order), shine band, part (flow origin),
// optional behind (long hair behind the body) and flags. Coordinates match CH_FACE builds.
function ch_hairStyle(st,G){
  const C=ch_clump;
  if(st==='braids'||st==='long'){
    const back=st==='long'?'M150 38 C112 38 84 64 83 112 C82 150 86 186 92 206 L208 206 C214 186 218 150 217 112 C216 64 188 38 150 38Z'
      :'M150 38 C112 38 86 62 85 108 C84 140 90 170 100 200 L114 204 C112 186 112 168 116 156 L184 156 C188 168 188 186 186 204 L200 200 C210 170 216 140 215 108 C214 62 188 38 150 38Z';
    const cap='M88 150 C82 100 98 60 126 46 C134 42 142 40 150 40 C158 40 166 42 174 46 C202 60 218 100 212 150 C208 130 204 116 198 106 L102 106 C96 116 92 130 88 150Z';
    const side=st==='long'?[]:[C([88,104],[103,95],[94,180],5,-2),C([197,95],[212,104],[206,180],-2,5),C([93,112],[105,103],[103,166],3,-1),C([195,103],[207,112],[197,166],-1,3)];
    const f=side.concat([
      C([92,98],[114,68],[95,128],7,-1),C([186,68],[208,98],[205,128],-1,7),
      C([102,76],[128,54],[106,124],6,0),C([172,52],[196,72],[192,124],0,6),
      C([116,60],[140,46],[121,119],5,0),C([160,46],[184,56],[177,118],0,5),
      C([128,52],[146,44],[134,123],4,1),C([148,44],[170,48],[161,124],1,4),
      C([138,46],[158,44],[147,116],3,2),
      C([123,56],[132,52],[127,111],1.5,1),C([166,50],[175,53],[169,110],1,1.5)]);
    return {back,cap,clumps:f,shine:{crown:[140,44],cx:150,cy:150,rx:64,ry:90,a0:-152,a1:-28,t:9},
      behind:st==='long'?'M84 140 C70 210 66 290 62 372 L238 372 C234 290 230 210 216 140Z':'',ahoge:st==='braids',locks:st==='long'}}
  if(st==='bun'){
    const back='M92 142 C86 96 104 50 140 40 C146 38 154 38 160 40 C196 50 214 96 208 142 C206 150 202 154 198 152 L102 152 C98 154 94 150 92 142Z';
    const cap='M93 134 C88 94 102 56 128 42 C136 38 144 36 150 36 C160 36 170 38 178 42 C204 56 214 94 207 134 C203 120 198 108 192 98 C180 82 166 76 150 76 C134 76 118 82 108 96 C101 106 96 120 93 134Z';
    const f=[C([108,58],[124,46],[100,102],3,-1),
      C([122,46],[140,40],[160,92],-3,6),C([128,44],[154,38],[182,102],-4,7),C([134,43],[146,41],[168,98],-2,3),
      C([142,40],[170,40],[199,114],-4,8),C([158,40],[186,48],[209,128],-3,7),C([176,46],[200,66],[212,142],-2,5)];
    return {back,cap,clumps:f,shine:{crown:[124,44],cx:150,cy:152,rx:62,ry:96,a0:-150,a1:-30,t:8},bun:1,combed:1}}
  if(st==='elder'){
    const back='M90 150 C84 100 104 46 150 38 C196 46 216 100 210 150 C208 160 202 164 196 162 L104 162 C98 164 92 160 90 150Z';
    const cap='M92 136 C86 92 104 50 132 40 C140 37 146 36 152 36 C162 36 172 39 180 44 C204 58 214 94 208 136 C204 120 200 110 196 104 L104 104 C100 110 96 120 92 136Z';
    const f=[C([88,104],[106,92],[94,156],7,-2),C([194,92],[212,104],[206,156],-2,7),
      C([100,84],[124,56],[102,118],7,0),C([116,58],[146,42],[130,106],6,1),C([138,42],[168,44],[166,104],1,7),C([160,46],[192,66],[198,116],0,8),C([180,62],[206,92],[208,130],0,6)];
    return {back,cap,clumps:f,shine:{crown:[140,42],cx:150,cy:150,rx:62,ry:94,a0:-150,a1:-30,t:8},curly:1}}
  // short (default, also 'buzz'): neat side-swept cut from a part on the left, short sides, ears visible
  const back='M93 130 C88 84 110 38 150 36 C190 38 212 84 207 130 C205 126 203 122 200 118 L100 118 C97 122 95 126 93 130Z';
  const cap='M95 122 C89 86 104 46 132 36 C140 33 146 32 152 32 C162 32 172 35 182 40 C206 54 213 90 205 122 C203 110 198 98 190 88 C176 74 160 70 146 72 C130 74 116 80 108 90 C102 98 98 108 95 122Z';
  const f=[C([96,110],[102,106],[99,140],1.6,-.6),C([198,106],[204,110],[201,140],-.6,1.6),
    C([91,98],[108,72],[95,124],4,-1),C([192,72],[209,98],[205,124],-1,4),
    C([104,66],[122,46],[100,104],3,-1),C([112,54],[126,44],[112,86],2,0),
    C([120,44],[140,36],[150,92],-2,5),C([128,40],[152,34],[173,98],-3,6),C([134,40],[144,38],[163,92],-1,2),
    C([140,36],[166,36],[191,104],-3,7),C([156,36],[182,44],[204,114],-2,6),C([130,36],[148,32],[160,25],1.5,1.5)];
  return {back,cap,clumps:f,shine:{crown:[124,40],cx:150,cy:150,rx:62,ry:98,a0:-150,a1:-30,t:8},silver:1}}

// classic anime shine band: a jagged ring around the crown whose spikes follow the hair flow
function ch_shine(sh,H){const N=28,top=[],bot=[];
  for(let i=0;i<=N;i++){const a=(sh.a0+(sh.a1-sh.a0)*i/N)*Math.PI/180,p=[sh.cx+Math.cos(a)*sh.rx,sh.cy+Math.sin(a)*sh.ry];
    let dx=p[0]-sh.crown[0],dy=p[1]-sh.crown[1];const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;
    const fade=Math.pow(Math.sin(Math.PI*i/N),.6),j=Math.sin(i*91.7)*.5+.5;
    const up=(sh.t*(.25+.3*j)*(i%2?1:.35))*fade+.2,dn=(sh.t*(.35+.8*j)*(i%2?.3:1.25))*fade+.2;
    top.push([p[0]-dx*up,p[1]-dy*up]);bot.push([p[0]+dx*dn,p[1]+dy*dn])}
  let s=`<path d="${ch_pl(top.concat(bot.reverse()))}Z" fill="${H.hi}" opacity=".88"/>`;
  for(const k of [.3,.62]){const a=(sh.a0+(sh.a1-sh.a0)*k)*Math.PI/180,p=[sh.cx+Math.cos(a)*sh.rx,sh.cy+Math.sin(a)*sh.ry];
    let dx=p[0]-sh.crown[0],dy=p[1]-sh.crown[1];const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;
    s+=`<path d="${ch_rib(ch_bz([[p[0]-dx*sh.t*.6,p[1]-dy*sh.t*.6],[p[0]+dx*sh.t*1.4,p[1]+dy*sh.t*1.4]],6),ch_swell(1.8,.1))}" fill="#fff" opacity=".7"/>`}
  return s}

// a twisted bun (two-strand twist coils) centred at (x,y)
function ch_bun(x,y,r,H,hg,id){let c='';const n=13;
  for(let i=0;i<n;i++){const a=i/n*Math.PI*2+.2,rr=r*(.84+.06*Math.sin(i*2.7));c+=`<circle cx="${ch_n(x+Math.cos(a)*rr)}" cy="${ch_n(y+Math.sin(a)*rr*.86)}" r="${ch_n(r*(.3+.05*Math.cos(i*1.9)))}"/>`}
  c+=`<ellipse cx="${x}" cy="${y}" rx="${r*.9}" ry="${ch_n(r*.8)}"/>`;
  let s=`<g fill="${H.line}" stroke="${H.line}" stroke-width="3.4">${c}</g><g fill="${hg}">${c}</g>`;
  // coil texture: small curls, darker toward the lower right, lighter at the upper left
  for(let i=0;i<22;i++){const a=i*2.39996,rr=r*.95*Math.sqrt((i+.5)/22),cx=x+Math.cos(a)*rr,cy=y+Math.sin(a)*rr*.86,lit=(cx-x)+(cy-y)<-r*.25;
    s+=`<path d="M${ch_n(cx-2.6)} ${ch_n(cy+1.2)} Q${ch_n(cx-2.4)} ${ch_n(cy-2.6)} ${ch_n(cx+.6)} ${ch_n(cy-2.2)} Q${ch_n(cx+3)} ${ch_n(cy-1)} ${ch_n(cx+1.6)} ${ch_n(cy+1.4)}" stroke="${lit?H.hi:H.sh}" stroke-width="${lit?1.5:1.4}" fill="none" stroke-linecap="round" opacity="${lit?.75:.85}"/>`}
  s+=`<path d="M${ch_n(x-r*.62)} ${ch_n(y-r*.36)} Q${ch_n(x-r*.1)} ${ch_n(y-r*.92)} ${ch_n(x+r*.5)} ${ch_n(y-r*.5)}" stroke="${H.hi}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".55"/>`;
  return s}

// ---------- outfits (inside .p-body) ----------
function ch_outfit(o,G,sk,id,build){
  const nw=G.nw,cx=150,cy=G.chin;let s='';
  const nb=cy+(build==='K'?22:20); // where the neck meets the shoulders
  const neck=`M${cx-nw*.86} 150 C${cx-nw*.86} ${cy} ${cx-nw*.9} ${nb-8} ${cx-nw-4} ${nb+6} L${cx+nw+4} ${nb+6} C${cx+nw*.9} ${nb-8} ${cx+nw*.86} ${cy} ${cx+nw*.86} 150Z`;
  const neckG=`<clipPath id="${id}n"><path d="${neck}"/></clipPath><path d="${neck}" fill="${sk.base}" stroke="${sk.line}" stroke-width="2.2"/>
    <g clip-path="url(#${id}n)"><path d="M${cx-nw-6} 150 L${cx-nw-6} ${cy-10} C${cx-nw*.5} ${cy+13} ${cx+nw*.5} ${cy+13} ${cx+nw+6} ${cy-10} L${cx+nw+6} 150Z" fill="${sk.sh}"/>
    <path d="M${cx+nw*.42} 150 C${cx+nw*.5} ${cy+6} ${cx+nw*.62} ${nb} ${cx+nw*.8} ${nb+8} L${cx+nw+6} ${nb+8} L${cx+nw+6} 150Z" fill="${sk.sh}"/>
    <path d="M${cx-nw*.5} ${cy+16} C${cx-nw*.4} ${cy+10} ${cx-nw*.3} ${cy+6} ${cx-nw*.2} ${cy+4}" stroke="${sk.line}" stroke-width="1" fill="none" opacity=".35"/></g>`;
  if(o.coat){ // doctor: white coat over a top, stethoscope, badge, pen
    const W=ch_clothPal('#fbfcff'),T=ch_clothPal(o.shirt||'#16b3a6'),L=W.line;
    const torso='M129 206 C114 213 84 219 60 227 C38 235 26 251 22 275 L14 372 L286 372 L278 275 C274 251 262 235 240 227 C216 219 186 213 171 206Z';
    const lapL='M132 200 C123 203 115 208 109 214 L95 252 L106 254 L100 263 L139 372 L147 372 L127 222Z';
    s+=`<path d="M113 204 C124 186 176 186 187 204 L193 226 L107 226Z" fill="${W.sh}" stroke="${L}" stroke-width="2.2" stroke-linejoin="round"/>`+neckG;
    s+=`<path d="${torso}" fill="${W.base}" stroke="${L}" stroke-width="2.8" stroke-linejoin="round"/>
     <path d="M240 227 C262 235 274 251 278 275 L286 372 L240 372 C246 328 248 272 240 227Z" fill="${W.sh}"/>
     <path d="M60 227 C46 233 34 243 28 259 C38 251 50 245 64 243Z" fill="#ffffff"/>
     <path d="M126 214 L174 214 L156 372 L144 372Z" fill="${T.base}" stroke="${T.line}" stroke-width="1.6"/>
     <path d="M150 232 L174 214 L158 372 L150 372Z" fill="${T.sh}"/>
     <path d="M131 210 C136 230 164 230 169 210 L169 205 L131 205Z" fill="${sk.base}"/>
     <path d="M150 228 C158 228 166 220 169 210 L169 205 L161 205 C161 216 157 224 150 228Z" fill="${sk.sh}"/>
     <path d="M131 210 C136 231 164 231 169 210" stroke="${T.line}" stroke-width="1.8" fill="none"/>
     <path d="M137 219 Q141.5 222.6 146 222 M163 219 Q158.5 222.6 154 222" stroke="${sk.line}" stroke-width="1.1" fill="none" opacity=".55" stroke-linecap="round"/>
     <path d="${lapL}" fill="${W.base}" stroke="${L}" stroke-width="1.9" stroke-linejoin="round"/>
     <path d="${ch_mx(lapL,150)}" fill="${W.base}" stroke="${L}" stroke-width="1.9" stroke-linejoin="round"/>
     <path d="M127 222 L139 372 L134 372 L121 236Z" fill="${W.sh}"/><path d="${ch_mx('M127 222 L139 372 L130 372 L118 230Z',150)}" fill="${W.sh2}" opacity=".6"/>
     <path d="M109 214 L95 252 L101 252 L113 219Z" fill="${W.sh}"/><path d="${ch_mx('M109 214 L95 252 L101 252 L113 219Z',150)}" fill="${W.sh2}" opacity=".7"/>
     <path d="M66 290 Q76 322 72 372 M232 290 Q224 322 228 372 M40 296 Q50 284 60 292 M104 268 Q112 300 110 330" stroke="${L}" stroke-width="1.3" fill="none" opacity=".45" stroke-linecap="round"/>`;
    s+=`<path d="M62 310 L100 306" stroke="${L}" stroke-width="1.5" opacity=".7"/><rect x="82" y="290" width="5" height="22" rx="2" fill="#6c5ce7" stroke="${L}" stroke-width="1" transform="rotate(-6 84 300)"/><rect x="83.5" y="287" width="2" height="12" rx="1" fill="#c9d0e2" transform="rotate(-6 84 300)"/>`;
    s+=`<g transform="rotate(4 214 300)"><rect x="210" y="274" width="8" height="8" rx="1.5" fill="#9aa4be" stroke="${L}" stroke-width="1"/><rect x="200" y="280" width="28" height="36" rx="4" fill="#ffffff" stroke="${L}" stroke-width="1.4"/><rect x="200" y="280" width="28" height="9" rx="3" fill="${T.base}"/><circle cx="210" cy="298" r="5.5" fill="${sk.base}" stroke="${L}" stroke-width=".8"/><path d="M219 296 h6 M219 301 h6 M204 309 h20" stroke="#9aa4be" stroke-width="1.6" stroke-linecap="round"/><path d="M211.5 283 v4 M209.5 285 h4" stroke="#fff" stroke-width="1.4"/></g>`;
    const tube='#2b3354',thi='#6170a8';
    s+=`<path d="M131 196 C121 214 110 246 112 284 C113 310 120 330 124 348" stroke="${tube}" stroke-width="5.6" fill="none" stroke-linecap="round"/><path d="M129.6 202 C120 220 112 248 113.6 282" stroke="${thi}" stroke-width="1.4" fill="none" opacity=".8" stroke-linecap="round"/>
     <path d="M169 196 C179 214 190 244 188 282 L186 298" stroke="${tube}" stroke-width="5.6" fill="none" stroke-linecap="round"/><path d="M170.4 202 C180 220 188 246 186.6 280" stroke="${thi}" stroke-width="1.4" fill="none" opacity=".8" stroke-linecap="round"/>
     <path d="M186 296 C184 312 180 324 178 336 M186 296 C190 310 194 322 196 334" stroke="${L}" stroke-width="3.8" fill="none" stroke-linecap="round" opacity=".3"/><path d="M186 296 C184 312 180 324 178 336 M186 296 C190 310 194 322 196 334" stroke="#b3bbcf" stroke-width="2.4" fill="none" stroke-linecap="round"/>
     <circle cx="178" cy="338" r="3" fill="${tube}"/><circle cx="196" cy="336" r="3" fill="${tube}"/>
     <circle cx="124" cy="350" r="10.5" fill="url(#${id}m)" stroke="${L}" stroke-width="1.6"/><circle cx="124" cy="350" r="5.8" fill="none" stroke="#7d87a3" stroke-width="1.4"/><ellipse cx="120.5" cy="346" rx="3" ry="1.8" fill="#fff" opacity=".8"/>`;
    return s}
  const C=ch_clothPal(o.shirt||'#5b7bd5'),L=C.line;
  if(build==='M'){ // button-up shirt, spread collar, top button open
    const torso='M125 206 C108 213 72 219 48 227 C26 235 14 251 10 273 L4 372 L296 372 L290 273 C286 251 274 235 252 227 C228 219 192 213 175 206Z';
    const flapL='M127 196 C121 208 115 220 108 232 L130 262 L148 248 L131 212Z';
    s+=`<path d="M115 200 C128 184 172 184 185 200 L189 220 L111 220Z" fill="${C.sh}" stroke="${L}" stroke-width="2.2" stroke-linejoin="round"/>`+neckG;
    s+=`<path d="${torso}" fill="${C.base}" stroke="${L}" stroke-width="2.8" stroke-linejoin="round"/>
     <path d="M252 227 C274 235 286 251 290 273 L296 372 L250 372 C256 330 260 272 252 227Z" fill="${C.sh}"/>
     <path d="M48 227 C32 233 20 245 14 261 C26 251 40 246 54 245Z" fill="${C.hi}" opacity=".6"/>
     <path d="M127 202 L150 250 L173 202Z" fill="${sk.base}"/><path d="M150 250 L173 202 L163 202 C161 226 156 240 150 250Z" fill="${sk.sh}"/>
     <path d="M135 213 C140 220 146 222 150 222 C154 222 160 220 165 213" stroke="${sk.sh}" stroke-width="3" fill="none" opacity=".8"/>
     <path d="M150 250 L150 372" stroke="${L}" stroke-width="1.7"/><path d="M150 252 L157 260 L157 372" stroke="${L}" stroke-width="1.2" fill="none" opacity=".55"/>
     <circle cx="153.6" cy="286" r="2.5" fill="#f4f6fb" stroke="${L}" stroke-width="1"/><circle cx="153.6" cy="326" r="2.5" fill="#f4f6fb" stroke="${L}" stroke-width="1"/><circle cx="153.6" cy="364" r="2.5" fill="#f4f6fb" stroke="${L}" stroke-width="1"/>
     <path d="${flapL}" fill="${C.base}" stroke="${L}" stroke-width="2" stroke-linejoin="round"/><path d="${ch_mx(flapL,150)}" fill="${C.base}" stroke="${L}" stroke-width="2" stroke-linejoin="round"/>
     <path d="${ch_mx('M127 196 C121 208 115 220 108 232 L115 240 C120 226 125 212 131 212Z',150)}" fill="${C.sh}"/><path d="M131 212 L148 248 L142 252Z" fill="${C.sh}" opacity=".7"/>
     <path d="M108 232 L130 262 L120 266 Q104 252 96 240Z" fill="${C.sh}" opacity=".45"/><path d="${ch_mx('M108 232 L130 262 L120 266 Q104 252 96 240Z',150)}" fill="${C.sh2}" opacity=".45"/>
     <path d="M188 290 L226 286 L228 326 Q208 332 190 328Z" fill="${C.sh}" opacity=".35" stroke="${L}" stroke-width="1.3"/><path d="M188 290 L226 286" stroke="${L}" stroke-width="1.8"/>
     <path d="M64 290 Q80 316 78 372 M236 290 Q224 324 228 372 M98 262 Q114 286 118 316 M30 288 Q42 276 54 282" stroke="${L}" stroke-width="1.3" fill="none" opacity=".45" stroke-linecap="round"/>`;
    return s}
  // kid / default: top with a rounded white collar
  const torso='M133 204 C122 210 100 214 82 220 C64 226 54 240 50 260 L44 372 L256 372 L250 260 C246 240 236 226 218 220 C200 214 178 210 167 204Z';
  const colL='M150 230 C138 230 125 224 121 210 C113 214 107 220 107 228 C113 242 136 246 150 236Z';
  s+=neckG+`<path d="${torso}" fill="${C.base}" stroke="${L}" stroke-width="2.6" stroke-linejoin="round"/>
   <path d="M218 220 C236 226 246 240 250 260 L256 372 L220 372 C226 328 228 262 218 220Z" fill="${C.sh}"/>
   <path d="M82 220 C68 226 58 236 54 250 C64 242 74 238 86 236Z" fill="${C.hi}" opacity=".6"/>
   <path d="M134 204 C138 220 162 220 166 204 L166 198 L134 198Z" fill="${sk.base}"/><path d="M150 220 C158 218 164 212 166 204 L166 198 L159 198 C159 210 156 216 150 220Z" fill="${sk.sh}"/>
   <path d="${colL}" fill="#fffaf6" stroke="${L}" stroke-width="1.6" stroke-linejoin="round"/><path d="${ch_mx(colL,150)}" fill="#fffaf6" stroke="${L}" stroke-width="1.6" stroke-linejoin="round"/>
   <path d="${ch_mx('M150 236 C136 246 112 242 107 228 C114 238 136 240 150 232Z',150)}" fill="#e3dde8"/><path d="M134 222 C140 230 146 232 150 232" stroke="#e3dde8" stroke-width="2" fill="none"/>
   <path d="M88 268 Q98 290 94 330 M212 268 Q204 290 208 330 M70 246 Q76 236 86 236 M120 300 Q132 310 130 336" stroke="${L}" stroke-width="1.3" fill="none" opacity=".45" stroke-linecap="round"/>`;
  const pin=o.pin!==undefined?o.pin:(/maya/i.test(o.name||'')?'violin':null);
  if(pin==='violin')s+=`<g transform="translate(192 274) rotate(-22) scale(.95)"><path d="M0 -14 C-5 -14 -7 -10 -6 -7 C-5 -4 -7 -2 -7 1 C-7 7 -4 11 0 11 C4 11 7 7 7 1 C7 -2 5 -4 6 -7 C7 -10 5 -14 0 -14Z" fill="#c26a2e" stroke="#5a2a10" stroke-width="1.1"/><path d="M-3 -9 C-1 -10 1 -10 3 -9 L2 4 L-2 4Z" fill="#e08a46" opacity=".7"/><path d="M-3.2 -2 q-1 2 0 4 M3.2 -2 q1 2 0 4" stroke="#3a1a08" stroke-width=".9" fill="none"/><rect x="-1.2" y="-26" width="2.4" height="20" rx="1" fill="#2a1a12"/><circle cx="0" cy="-27" r="2.4" fill="#5a2a10"/><rect x="-3" y="5" width="6" height="2" rx="1" fill="#2a1a12"/><path d="M-.6 -24 V6 M.6 -24 V6" stroke="#f2e2b0" stroke-width=".35"/><circle cx="-5" cy="9" r="1.2" fill="#ffd45c"/></g>`;
  return s}

// a real three-strand braid: interlocking tapered lobes with strand lines, shading and highlights; tie + tuft at the end
function ch_braid(x0,y0,x1,y1,H,hg,tie,side,k){k=k||1;const n=8,step=(y1-y0)/n;let s='';
  const ax=t=>[x0+(x1-x0)*t+Math.sin(t*Math.PI)*side*5,y0+(y1-y0)*t];
  // dark core so gaps read as depth
  s+=`<path d="${ch_rib(ch_bz([ax(0),ax(.5),ax(1)],10),t=>22-8*t)}" fill="${H.dk}" stroke="${H.line}" stroke-width="${2.4*k}"/>`;
  for(let i=0;i<n;i++){const t=(i+.5)/n,[cx,cy]=ax(t),w=10.5-3.6*t,o=i%2?1:-1,X=u=>cx+o*u;
    const P0=[X(-w*1.02),cy-step*.95],T=[X(w*.55),cy+step*.62],P2=[X(-w*1.08),cy+step*.12];
    const up=[P0,[X(-w*.1),cy-step*1.02],[X(w*.62),cy-step*.1],T],lo=[T,[X(w*.05),cy+step*.66],[X(-w*.8),cy+step*.5],P2];
    const P=p=>ch_n(p[0])+' '+ch_n(p[1]);
    const d=`M${P(P0)} C${P(up[1])} ${P(up[2])} ${P(T)} C${P(lo[1])} ${P(lo[2])} ${P(P2)} Q${P([X(-w*1.3),cy-step*.4])} ${P(P0)}Z`;
    s+=`<path d="${d}" fill="${hg}" stroke="${H.line}" stroke-width="${1.5*k}" stroke-linejoin="round"/>`;
    s+=`<path d="${ch_rib(ch_sub(ch_bz(lo,10),.05,.95),ch_swell(3.4,.3),-1)}" fill="${H.sh}" opacity=".9"/>`;
    for(const k of [.32,.62]){const a=[X(-w*1.05),cy-step*(.95-k*1.05)],b=[X(-w*.1+w*k*.4),cy-step*(.62-k*.9)],c=[X(w*.48-w*k*.2),cy+step*(.5-k*.25)];
      s+=`<path d="${ch_rib(ch_bz([a,b,c],8),ch_swell(.9*Math.min(k,2.4),.1))}" fill="${H.line}" opacity=".45"/>`}
    s+=`<path d="${ch_rib(ch_sub(ch_bz(up,10),.12,.6),ch_swell(2.2,.2))}" fill="${H.hi}" opacity=".8" transform="translate(0 2)"/>`}
  const [tx,ty]=ax(1);const tw=H.line,td=ch_mix(tie,'#2a0a10',.5);let tuft='';
  const tips=[[-9,26],[-4.5,32],[0,28],[4.5,33],[9,25]];
  for(const [dx,dy] of tips){tuft+=`<path d="${ch_clump([tx+dx*.45-3.4,ty+6],[tx+dx*.45+3.4,ty+6],[tx+dx,ty+dy],1.6,1.6).d}"/>`}
  s+=`<g fill="${tw}" stroke="${tw}" stroke-width="${2.6*k}" stroke-linejoin="round">${tuft}</g><g fill="${hg}">${tuft}</g>`;
  for(const [dx,dy] of tips.slice(1,4))s+=`<path d="M${ch_n(tx+dx*.3)} ${ch_n(ty+9)} L${ch_n(tx+dx*.8)} ${ch_n(ty+dy-6)}" stroke="${H.sh}" stroke-width="${k}" opacity=".8"/>`;
  s+=`<rect x="${ch_n(tx-7)}" y="${ch_n(ty-1)}" width="14" height="8" rx="3.5" fill="${tie}" stroke="${td}" stroke-width="${1.3*k}"/><path d="M${ch_n(tx-5)} ${ch_n(ty+1.4)} h6" stroke="#fff" stroke-width="1.3" opacity=".6" stroke-linecap="round"/><circle cx="${ch_n(tx+side*7.5)}" cy="${ch_n(ty+3)}" r="4.4" fill="${tie}" stroke="${td}" stroke-width="${1.3*k}"/><circle cx="${ch_n(tx+side*7.5-1.4)}" cy="${ch_n(ty+1.6)}" r="1.3" fill="#fff" opacity=".85"/>`;
  return s}

// ---------- a person (natural-proportion anime bust) ----------
function personSVG(o){o=o||{};
  const id='ch'+(++CH_N),st=({buzz:'short'})[o.hairStyle]||o.hairStyle||'short',kid=o.age==='kid';
  const masc=o.masc!=null?!!o.masc:(st==='short'&&!kid),build=kid?'K':masc?'M':'F',G=CH_FACE[build];
  const md=CH_MOODS[o.mood]||CH_MOODS.smile,sk=ch_skinPal(o.skin||'#f2cdb4'),H=ch_hairPal(o.hair||'#2a211c'),HS=ch_hairStyle(st,G);
  const iris=o.eye||'#7a4a2e',elder=st==='elder';
  const E={ew:G.ew,eh:elder?G.eh*.82:G.eh,irx:G.irx,iry:G.iry,lash:G.lash,wing:G.wing,brow:G.brow,kid,lid:md.lid,look:md.look||[0,0],worry:md.worry,tear:md.fx==='tear',
    lashC:ch_mix(H.dk,'#1a0810',.5),skinLine:sk.line,white:'#ffffff',irisGlow:ch_mix(iris,'#ffc890',.5),pupil:ch_mix(iris,'#0a0410',.78),irisLine:ch_mix(iris,'#0a0410',.6),lidSh:ch_mix(sk.base,'#5a4a8a',.5)};
  const ey=G.ey,ex=G.ex,browY=ey-E.eh/2+G.by,browC=ch_mix(H.dk,sk.line,.3);
  const bs=CH_BROWS[md.brow],bL=Array.isArray(bs[0])?bs[0]:bs,bR=Array.isArray(bs[0])?bs[1]:bs;
  const brows=ch_brow(150-ex,browY,-1,bL,E,browC)+ch_brow(150+ex,browY,1,bR,E,browC);
  const earL=`M99 ${G.ear} C91 ${G.ear-5} 85 ${G.ear+2} 86.5 ${G.ear+13} C88 ${G.ear+24} 92 ${G.ear+33} 100 ${G.ear+35}Z`,earIn=`M95 ${G.ear+7} C90.5 ${G.ear+9} 90.5 ${G.ear+18} 94 ${G.ear+25}`;
  const ears=`<path d="${earL}" fill="${sk.base}" stroke="${sk.line}" stroke-width="2.2"/><path d="${ch_mx(earL,150)}" fill="${sk.sh}" stroke="${sk.line}" stroke-width="2.2"/>
    <path d="${earIn}" stroke="${sk.line}" stroke-width="1.3" fill="none" opacity=".7"/><path d="${ch_mx(earIn,150)}" stroke="${sk.line}" stroke-width="1.3" fill="none" opacity=".7"/>`;
  // hair layers
  const hg=`url(#${id}hg)`,cl=HS.clumps,hairShapes=[HS.cap].concat(cl.map(c=>c.d));
  const outlinePass=`<g fill="${H.line}" stroke="${H.line}" stroke-width="3.6" stroke-linejoin="round">${hairShapes.map(d=>`<path d="${d}"/>`).join('')}</g>`;
  let clumps='';cl.forEach((c,i)=>{const fill=i%3===1?`url(#${id}hs)`:hg;
    clumps+=`<path d="${c.d}" fill="${fill}"/>`;
    const mid=[[(c.L[0]+c.R[0])/2,(c.L[1]+c.R[1])/2],[(c.a[2][0]+c.b[1][0])/2,(c.a[2][1]+c.b[1][1])/2],c.T];
    clumps+=`<path d="${ch_rib(ch_sub(ch_bz(mid,12),.3,.88),ch_swell(1.2,.1))}" fill="${H.sh}" opacity=".75"/>`;
    {const A=ch_bz(c.a,14),Bv=ch_bz(c.b,14).reverse();for(const [f,col,op] of [[.26,H.sh,.6],[.74,H.hi,.32]]){const pts=A.map((p,k)=>[p[0]*(1-f)+Bv[k][0]*f,p[1]*(1-f)+Bv[k][1]*f]);
      clumps+=`<path d="${ch_rib(ch_sub(pts,.35,.92),ch_swell(.8,.05))}" fill="${col}" opacity="${op}"/>`}}
    clumps+=`<path d="${ch_rib(ch_sub(ch_bz(c.a,14),.42,1),ch_tap(.2,1.6,.5))}" fill="${H.line}"/><path d="${ch_rib(ch_sub(ch_bz(c.b,14),0,.58),ch_tap(.5,1.6,.2))}" fill="${H.line}"/>`});
  const hairClip=`<clipPath id="${id}hc">${hairShapes.map(d=>`<path d="${d}"/>`).join('')}</clipPath>`;
  const rim=ch_chain([[[96,128],[92,96],[104,58],[136,42]]],16);
  const shine=`<g clip-path="url(#${id}hc)">${ch_shine(HS.shine,H)}<path d="${ch_rib(rim,ch_swell(3.4,.4))}" fill="${H.hi}" opacity=".42" transform="translate(3 2)"/></g>`;
  let extraBack='',extraFront='';
  if(HS.bun){extraBack+=ch_bun(150,24,27,H,hg,id);
    const td=ch_chain([[[102,98],[92,106],[96,116],[103,118]],[[103,118],[109,120],[103,132],[96,132]],[[96,132],[89,132],[92,146],[99,148]],[[99,148],[104,150],[101,160],[96,162]]],8);
    extraFront+=`<path d="${ch_rib(td,ch_tap(4.6,3.8,1.2))}" fill="${H.line}"/><path d="${ch_rib(td,ch_tap(3,2.4,.4))}" fill="${H.base}"/><path d="${ch_rib(ch_sub(td,.05,.6),ch_swell(1,.1))}" fill="${H.hi}" opacity=".7" transform="translate(-.6 -.4)"/>`}
  if(HS.combed)extraFront+=[[108,96],[116,86],[126,80],[100,112]].map(([x,y])=>`<path d="${ch_rib(ch_bz([[x,y],[x+6,y-22],[124+(x-110)*.2,46]],10),ch_swell(1.2,.1))}" fill="${H.sh}" opacity=".8"/>`).join('');
  if(HS.ahoge){const ah=ch_bz([[146,44],[144,24],[160,14],[168,24]],14);extraFront+=`<path d="${ch_rib(ah,ch_tap(4.2,3,.9))}" fill="${H.line}"/><path d="${ch_rib(ah,ch_tap(2.6,1.6,.2))}" fill="${H.base}"/>`}
  if(HS.silver)extraFront+=`<path d="M95 104 Q95 114 97 124 M201 102 Q204 112 204 122" stroke="#c9c6d6" stroke-width=".9" fill="none" opacity=".55" stroke-linecap="round"/>`;
  if(st==='braids'){const c1=o.clip||'#ff7a6b',cd=ch_mix(c1,'#2a0a10',.5);
    extraFront+=`<g transform="rotate(-28 192 88)"><rect x="180" y="84" width="24" height="6" rx="3" fill="${c1}" stroke="${cd}" stroke-width="1.2"/><rect x="183" y="85.4" width="9" height="1.6" rx=".8" fill="#fff" opacity=".7"/></g><g transform="rotate(-28 197 100)"><rect x="185" y="96" width="24" height="6" rx="3" fill="${ch_mix(c1,'#ffd45c',.45)}" stroke="${cd}" stroke-width="1.2"/></g>`}
  if(HS.curly){for(let i=0;i<9;i++){const a=(-170+i*20)*Math.PI/180,x=150+Math.cos(a)*62,y=100+Math.sin(a)*62;extraFront+=`<path d="M${ch_n(x-4)} ${ch_n(y+2)} Q${ch_n(x)} ${ch_n(y-4)} ${ch_n(x+4)} ${ch_n(y+2)}" stroke="${H.sh}" stroke-width="1.5" fill="none" opacity=".8"/>`}}
  // face shading (cel): hair shadow on forehead, shadow side crescent, nose, lips
  const faceClip=`<clipPath id="${id}f"><path d="${G.face}"/></clipPath>`;
  const R=build==='M'?204:202;
  const hairSh=`<g clip-path="url(#${id}f)"><g fill="${sk.sh}">${hairShapes.map(d=>`<path d="${ch_tr(d,2.5,6.5)}"/>`).join('')}</g>
     <path d="M${R-1} 96 C${R+1} 124 ${R-3} 148 ${R-12} 166 C${R-20} 180 ${R-34} 190 ${R-50} 194 L${R+10} 200 L${R+10} 90Z" fill="${sk.sh}"/>
     <path d="M${R-6} 104 C${R-6} 128 ${R-9} 146 ${R-16} 160 C${R-22} 172 ${R-30} 180 ${R-38} 186 C${R-26} 182 ${R-16} 172 ${R-10} 160 C${R-4} 146 ${R-2} 126 ${R-2} 104Z" fill="${sk.sh}"/>
     ${build!=='K'?`<path d="M${150-ex+12} ${ey-12} C${150-ex+15} ${ey-6} ${150-ex+16} ${ey-1} ${150-ex+15} ${ey+3}" stroke="${sk.sh}" stroke-width="2.2" fill="none" opacity=".7"/><path d="M${150+ex-12} ${ey-12} C${150+ex-15} ${ey-6} ${150+ex-16} ${ey-1} ${150+ex-15} ${ey+3}" stroke="${sk.sh}" stroke-width="2.6" fill="none" opacity=".9"/>`:''}
</g>`;
  const ny=G.ny,my=G.my,big=build==='M';
  const nose=`<path d="${ch_rib(ch_bz([[153.5,ny-(big?26:20)],[155.5,ny-10],[155.2,ny-2]],8),ch_tap(.4,big?1.8:1.3,.6))}" fill="${sk.sh}"/>
    <path d="M153 ${ny-4} Q158 ${ny-.5} 155.4 ${ny+3.4} Q153.4 ${ny+1.4} 151.6 ${ny+1.2}Z" fill="${sk.sh}"/>
    <path d="${ch_rib(ch_bz([[146,ny+1],[150,ny+3.6],[155,ny+.4]],8),ch_swell(big?1.8:1.4,.3))}" fill="${sk.line}" opacity=".9"/>
    ${big?`<path d="M144.6 ${ny-1.6} Q144 ${ny+1} 146 ${ny+1.6}" stroke="${sk.line}" stroke-width="1" fill="none" opacity=".6"/>`:''}
    <ellipse cx="148.4" cy="${ny-3.4}" rx="1.4" ry="2.4" fill="${sk.hi}" opacity=".9"/>`;
  const closed=md.mouth!=='happy'&&md.mouth!=='o';
  const lipSh=(closed?`<path d="M145 ${my+8} Q150 ${my+10} 155 ${my+8} Q150 ${my+8.8} 145 ${my+8}Z" fill="${sk.sh}" stroke="${sk.sh}" stroke-width="1.4"/>`:'')+
    (build==='F'&&closed?`<path d="M141.5 ${my+1.8} Q150 ${my+8.4} 158.5 ${my+1.8} Q150 ${my+5} 141.5 ${my+1.8}Z" fill="${sk.lip}" opacity=".8"/><ellipse cx="147" cy="${my+4.6}" rx="2.2" ry=".9" fill="#fff" opacity=".3"/>`:'');
  const blushOp=(md.fx==='sparkle'?.75:.5)*(kid?1.15:build==='M'?.45:.75)*(ch_lum(sk.base)<.12?.6:1);
  const blush=`<ellipse cx="${150-ex-4}" cy="${ey+19}" rx="15" ry="7" fill="url(#${id}b)" opacity="${ch_n(blushOp)}"/><ellipse cx="${150+ex+4}" cy="${ey+19}" rx="15" ry="7" fill="url(#${id}b)" opacity="${ch_n(blushOp)}"/>`+
    (kid?[-1,1].map(s=>[0,1,2].map(j=>`<path d="M${ch_n(150+s*(ex+4)-6+j*5)} ${ey+22} l3 -5" stroke="${sk.blush}" stroke-width="1.1" opacity=".55" stroke-linecap="round"/>`).join('')).join(''):'');
  const gl=o.glasses?(()=>{const fc=o.frame||'#5a2a3c',x1=150-ex,x2=150+ex,y=ey;
    const lens=cx=>`M${cx-18} ${y-8} Q${cx-18} ${y-11} ${cx-14} ${y-11} L${cx+14} ${y-11} Q${cx+18} ${y-11} ${cx+18} ${y-7} L${cx+17} ${y+6} Q${cx+16} ${y+11} ${cx+11} ${y+11} L${cx-12} ${y+11} Q${cx-17} ${y+11} ${cx-17.5} ${y+6}Z`;
    return `<path d="${lens(x1)}" fill="#e8f4ff" opacity=".12"/><path d="${lens(x2)}" fill="#e8f4ff" opacity=".12"/>
      <path d="M${x1-18} ${y-6} L${x1-24} ${y-5} M${x2+18} ${y-6} L${x2+24} ${y-5}" stroke="${fc}" stroke-width="2"/>
      <path d="${lens(x1)}" fill="none" stroke="${fc}" stroke-width="1.9"/><path d="${lens(x2)}" fill="none" stroke="${fc}" stroke-width="1.9"/>
      <path d="M${x1+18} ${y-5} Q150 ${y-10} ${x2-18} ${y-5}" stroke="${fc}" stroke-width="1.9" fill="none"/>
      <path d="M${x1-14} ${y-10} L${x1+14} ${y-10.2}" stroke="${ch_mix(fc,'#ffffff',.5)}" stroke-width=".8" opacity=".8"/><path d="M${x2-14} ${y-10.2} L${x2+14} ${y-10}" stroke="${ch_mix(fc,'#ffffff',.5)}" stroke-width=".8" opacity=".8"/>
      <path d="M${x1-12} ${y+6} L${x1-4} ${y-7} M${x2+6} ${y+6} L${x2+13} ${y-6}" stroke="#fff" stroke-width="2.2" opacity=".26" stroke-linecap="round"/>`})():'';
  const earring=o.accessory==='earring'?`<circle cx="91" cy="${G.ear+40}" r="4.6" fill="none" stroke="#e8b84a" stroke-width="1.9"/><circle cx="209" cy="${G.ear+40}" r="4.6" fill="none" stroke="#c8962e" stroke-width="1.9"/><circle cx="89.6" cy="${G.ear+36.6}" r="1" fill="#fff6c8"/>`:'';
  let fx='';
  if(md.fx==='sparkle')fx=ch_star(226,70,9,'#ffd45c','stroke="#fff" stroke-width="1"')+ch_star(240,92,5,'#fff')+ch_star(70,76,6,'#ffe9a0');
  if(md.fx==='sweat')fx=`<path d="M211 96 C215 106 218 112 218 117 C218 122 214 125 210.5 125 C207 125 203 122 203.5 117 C204 112 207 106 211 96Z" fill="#bfe8ff" stroke="#4a9ad8" stroke-width="1.6"/><path d="M207.5 116 Q207.5 120 210 121.5" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  if(md.fx==='tear')fx=`<path d="M${150-ex-12} ${ey+8} C${150-ex-15} ${ey+15} ${150-ex-16} ${ey+19} ${150-ex-14} ${ey+22} C${150-ex-12} ${ey+24.5} ${150-ex-9} ${ey+23} ${150-ex-9.5} ${ey+19.5} C${150-ex-10} ${ey+16} ${150-ex-11} ${ey+12} ${150-ex-12} ${ey+8}Z" fill="#cdeeff" stroke="#5aa9e6" stroke-width="1.2"/>`;
  if(md.fx==='pop')fx=`<path d="M218 58 L228 46 M226 70 L240 64 M82 58 L72 46" stroke="${sk.line}" stroke-width="2.6" stroke-linecap="round"/>`;
  if(md.fx==='dots')fx=`<circle cx="222" cy="66" r="3.2" fill="#fff" stroke="${sk.line}" stroke-width="1.2" class="thinkdot"/><circle cx="231" cy="53" r="4.4" fill="#fff" stroke="${sk.line}" stroke-width="1.2" class="thinkdot d2"/><circle cx="241" cy="38" r="5.8" fill="#fff" stroke="${sk.line}" stroke-width="1.2" class="thinkdot"/>`;
  const defs=`<defs><linearGradient id="${id}i" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${ch_mix(iris,'#0a0410',.55)}"/><stop offset=".38" stop-color="${ch_mix(iris,'#0a0410',.12)}"/><stop offset=".72" stop-color="${ch_mix(iris,'#ffb070',.12)}"/><stop offset="1" stop-color="${ch_mix(iris,'#ffe2b8',.6)}"/></linearGradient>
    <linearGradient id="${id}hg" gradientUnits="userSpaceOnUse" x1="0" y1="20" x2="0" y2="${kid?330:220}"><stop offset="0" stop-color="${H.top}"/><stop offset=".3" stop-color="${H.base}"/><stop offset="1" stop-color="${H.sh}"/></linearGradient>
    <linearGradient id="${id}hs" gradientUnits="userSpaceOnUse" x1="0" y1="20" x2="0" y2="220"><stop offset="0" stop-color="${H.base}"/><stop offset="1" stop-color="${H.dk}"/></linearGradient>
    <radialGradient id="${id}fl" gradientUnits="userSpaceOnUse" cx="128" cy="120" r="78"><stop offset="0" stop-color="${sk.hi}" stop-opacity=".5"/><stop offset=".55" stop-color="${sk.hi}" stop-opacity=".12"/><stop offset="1" stop-color="${sk.hi}" stop-opacity="0"/></radialGradient>
    <radialGradient id="${id}b"><stop offset="0" stop-color="${sk.blush}"/><stop offset="1" stop-color="${sk.blush}" stop-opacity="0"/></radialGradient>
    <radialGradient id="${id}m" cx=".35" cy=".3"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#c9d0e2"/><stop offset="1" stop-color="#8a94b0"/></radialGradient>${faceClip}${hairClip}</defs>`;
  let body=ch_outfit(o,G,sk,id,build);
  if(st==='braids'){const tie=o.clip||'#ff7a6b';body+=ch_braid(104,198,96,306,H,hg,tie,-1)+ch_braid(196,198,204,306,H,hg,tie,1)}
  if(HS.locks)body+=[ch_clump([84,150],[104,150],[80,330],6,-2),ch_clump([196,150],[216,150],[220,330],-2,6)].map(c=>`<path d="${c.d}" fill="${hg}" stroke="${H.line}" stroke-width="2.4"/>`).join('');
  const behind=HS.behind?`<path d="${HS.behind}" fill="${H.sh}" stroke="${H.line}" stroke-width="2.6"/>`:'';
  const ageLines=(elder||build==='M')?`<path d="M${150-ex-6} ${ey+9} Q${150-ex+2} ${ey+12} ${150-ex+9} ${ey+9}" stroke="${sk.line}" stroke-width="1" opacity="${elder?.5:.28}" fill="none" stroke-linecap="round"/><path d="M${150+ex+6} ${ey+9} Q${150+ex-2} ${ey+12} ${150+ex-9} ${ey+9}" stroke="${sk.line}" stroke-width="1" opacity="${elder?.5:.28}" fill="none" stroke-linecap="round"/>`+
    (elder?`<path d="M${150-ex-17} ${ey+1} l-5 -2 M${150-ex-17} ${ey+5} l-5 1 M${150+ex+17} ${ey+1} l5 -2 M${150+ex+17} ${ey+5} l5 1 M127 ${my-8} Q123 ${my} 127 ${my+6} M173 ${my-8} Q177 ${my} 173 ${my+6}" stroke="${sk.line}" stroke-width="1.1" opacity=".5" fill="none" stroke-linecap="round"/>`:''):'';
  return `<g class="person">${defs}<g${kid?' transform="translate(0 20)"':''}>
  ${behind}
  <g class="p-body">${body}</g>
  <g class="p-head"><rect x="56" y="-14" width="188" height="${ch_n(G.chin+24)}" fill="none"/>
    <path d="${HS.back}" fill="${H.dk}" stroke="${H.line}" stroke-width="3.2"/>${extraBack}
    ${ears}
    <path d="${G.face}" fill="${sk.base}" stroke="${sk.line}" stroke-width="2.6"/><path d="${G.face}" fill="url(#${id}fl)"/>
    ${hairSh}${blush}${nose}${lipSh}${ageLines}${brows}
    ${md.lid!=='closed'?[-1,1].map(o=>{const cx=150+o*ex,w=E.ew,h=E.eh;return `<path d="${ch_rib(ch_bz([[cx-o*w*.4,ey+h*.02],[cx+o*w*.05,ey+h*.3],[cx+o*w*.44,ey-h*.04]],12),ch_tap(.8,2.4,1.6))}" fill="${E.lashC}"/>`}).join(''):''}
    <g class="p-eyes">${ch_eye(150-ex,ey,-1,E,id,0)}${ch_eye(150+ex,ey,1,E,id,1)}</g>
    <g class="p-mouth">${ch_mouth(md.mouth,my,kid,sk,build==='M')}</g>
    ${gl}${earring}
    ${outlinePass}<path d="${HS.cap}" fill="${hg}"/>${clumps}${shine}${extraFront}<g opacity=".42">${brows}</g>${fx}
  </g></g></g>`}
function portrait(o,cls){return `<svg class="portrait ${cls||''}" viewBox="30 0 240 360" preserveAspectRatio="xMidYMax meet" aria-label="${(o&&o.name)||''}">${personSVG(o||{})}</svg>`}

// ---------- Maya, full body and posed (Future Table cards, reveal) ----------
// posedGirl(kind,o) -> SVG <g>. Feet on (0,0); about 70 units tall (ahoge tip ~y=-71, hair top ~-68); body about ±10 wide
// (the violin pose reaches x≈+30 with the scroll and the bow tip; thumbsup raises a hand to y≈-63).
// kind: 'violin'|'thumbsup'|'sad'|'itchy'|'waiting'|'stand'. o: {skin, hair, shirt, skirt, clip, cast (cast colour)}
// The head is drawn in the portrait's coordinate space (same hair design as her portrait) scaled to 0.1 with heavier lines.
function ch_violin(gid){ // local frame: tail end at the origin, strings along +x, ~28.5 long
  const body='M0 0 C0 -3.2 1.6 -4.6 3.6 -4.6 C5.6 -4.6 6.6 -3.9 7.1 -3.2 C7.5 -2.6 7.8 -2.5 8.4 -2.5 C9 -2.5 9.3 -2.6 9.7 -3.1 C10.3 -3.8 11.2 -4 12.4 -4 C14.4 -4 15.7 -2.7 15.7 -1.2 L15.7 1.2 C15.7 2.7 14.4 4 12.4 4 C11.2 4 10.3 3.8 9.7 3.1 C9.3 2.6 9 2.5 8.4 2.5 C7.8 2.5 7.5 2.6 7.1 3.2 C6.6 3.9 5.6 4.6 3.6 4.6 C1.6 4.6 0 3.2 0 0Z';
  return `<path d="${body}" fill="url(#${gid})" stroke="#4a1c0a" stroke-width=".5" stroke-linejoin="round"/>
   <path d="${body}" fill="none" stroke="#7a3412" stroke-width=".22" opacity=".7" transform="translate(.8 0) scale(.9 .84) translate(0 0)"/>
   <ellipse cx="3.4" cy="-2.1" rx="2.2" ry=".8" fill="#fff" opacity=".35"/><ellipse cx="12.6" cy="-2" rx="1.4" ry=".55" fill="#fff" opacity=".28"/>
   <path d="M5.6 -2.6 Q7 -1.6 8.4 -2.4 M5.6 2.6 Q7 1.6 8.4 2.4" stroke="#2a1006" stroke-width=".32" fill="none" stroke-linecap="round"/><circle cx="5.6" cy="-2.6" r=".25" fill="#2a1006"/><circle cx="8.4" cy="-2.4" r=".25" fill="#2a1006"/><circle cx="5.6" cy="2.6" r=".25" fill="#2a1006"/><circle cx="8.4" cy="2.4" r=".25" fill="#2a1006"/>
   <path d="M.6 -.95 L4.9 -.62 L4.9 .62 L.6 .95Z" fill="#2a1a12"/><ellipse cx="1.4" cy="2.7" rx="1.5" ry="1.1" fill="#2a1a12"/>
   <path d="M15.6 -1.1 L24.2 -.8 L24.2 .8 L15.6 1.1Z" fill="#b8642c" stroke="#4a1c0a" stroke-width=".3"/>
   <path d="M8.2 -.9 L24 -.62 L24 .62 L8.2 .9Z" fill="#1e1410"/>
   <path d="M7 -1.5 L7 1.5" stroke="#f0d8a0" stroke-width=".55" stroke-linecap="round"/>
   <path d="M4.9 -.42 L24.4 -.3 M4.9 -.14 L24.4 -.1 M4.9 .14 L24.4 .1 M4.9 .42 L24.4 .3" stroke="#f6ecc8" stroke-width=".11"/>
   <path d="M24 -1 L26.8 -.9 L26.8 .9 L24 1Z" fill="#a85424" stroke="#4a1c0a" stroke-width=".3"/>
   <path d="M24.8 -2.3 L24.8 2.3 M25.9 -2.2 L25.9 2.2" stroke="#2a1a12" stroke-width=".55" stroke-linecap="round"/>
   <circle cx="27.8" cy="0" r="1.35" fill="#b8642c" stroke="#4a1c0a" stroke-width=".3"/><path d="M27.8 0 m-.7 0 a.7 .7 0 1 1 .7 .7" stroke="#4a1c0a" stroke-width=".22" fill="none"/>`}
function ch_bow(F,T){ // frog F -> tip T, hair on the lower side
  const dx=T[0]-F[0],dy=T[1]-F[1],l=Math.hypot(dx,dy),ux=dx/l,uy=dy/l,nx=-uy,ny=ux,s=ny>0?1:-1,hx=nx*s*.75,hy=ny*s*.75,P=(t,o)=>ch_n(F[0]+dx*t+hx*o)+' '+ch_n(F[1]+dy*t+hy*o);
  return `<path d="M${P(.02,1)} L${P(.985,1)}" stroke="#f4ecd8" stroke-width=".45" stroke-linecap="round"/>
   <path d="M${P(0,0)} Q${P(.5,-.55)} ${P(1,0)}" stroke="#1e0e06" stroke-width="1" fill="none" stroke-linecap="round"/><path d="M${P(0,0)} Q${P(.5,-.55)} ${P(1,0)}" stroke="#8a4a22" stroke-width=".5" fill="none" stroke-linecap="round"/>
   <path d="M${P(.97,-.2)} L${P(1,1.15)} L${P(.985,1.2)}Z" fill="#1e0e06"/>
   <path d="M${P(.01,-.1)} L${P(.1,-.1)} L${P(.1,1.25)} L${P(.03,1.25)}Z" fill="#1e0e06" stroke="#1e0e06" stroke-width=".3" stroke-linejoin="round"/><circle cx="${ch_n(F[0]+dx*.055+hx*.55)}" cy="${ch_n(F[1]+dy*.055+hy*.55)}" r=".3" fill="#fff"/>`}
function posedGirl(kind,o){o=o||{};
  const id='ch'+(++CH_N),sk=ch_skinPal(o.skin||SKIN[1]),H=ch_hairPal(o.hair||'#1d1512'),C=ch_clothPal(o.shirt||'#ff7a6b'),SK=ch_clothPal(o.skirt||'#3b4a7a');
  const ln=ch_mix(sk.line,'#1a0a14',.15),clip=o.clip||'#ff7a6b',R=ch_n,lw=.75;
  const K={
    stand:{tilt:0,kn:[.7,0],L:[[6.6,-49.2],[8.9,-41.8],[7.4,-34.6]],Rt:[[-6.6,-49.2],[-8.9,-41.8],[-7.4,-34.6]],hL:'rest',hR:'rest',face:'calm'},
    violin:{tilt:13,hdx:1,sway:-2.5,L:[[6.4,-49.2],[14.6,-46.2],[21.4,-55.8]],hL:'neck',hR:'bow',face:'joy'},
    thumbsup:{tilt:-5,kn:[-.3,.4],L:[[6.6,-49.4],[12.6,-55.2],[12.4,-62.4]],Rt:[[-6.6,-49.2],[-11.8,-43.2],[-5.8,-38.4]],hL:'thumb',hR:'hip',face:'grin'},
    sad:{tilt:8,hdy:.8,drop:.8,kn:[1.1,-1.1],L:[[6.2,-48.6],[8.6,-40.8],[-.6,-38.8]],Rt:[[-6.2,-48.6],[-8.8,-41.4],[.4,-37.4]],hL:'limp',hR:'cradle',face:'sad'},
    itchy:{tilt:-7,kn:[0,-.7],L:[[6.4,-49.2],[11.2,-41.2],[1.4,-45.6]],Rt:[[-6.4,-49.2],[-10.6,-42.4],[5.6,-44.4]],hL:'open',hR:'scratch',face:'annoyed'},
    waiting:{tilt:4,kn:[.7,0],L:[[6.4,-49.2],[8,-40.6],[-2.4,-40.4]],Rt:[[-6.6,-49.2],[-8.4,-41.6],[-8,-34.4]],hL:'castHand',hR:'rest',face:'calm',cast:1}}[kind]||null;
  const Q=K||{tilt:0,L:[[6.6,-49.2],[8.2,-41.6],[7.8,-34.4]],Rt:[[-6.6,-49.2],[-8.2,-41.6],[-7.8,-34.4]],hL:'rest',hR:'rest',face:'calm'};
  // violin geometry and the bowing arm
  let violin='',bow='';
  if(kind==='violin'){const vx=1.2,vy=-51,va=-13*Math.PI/180,vs=1.18,sy=.82,toW=(x,y)=>[vx+x*vs*Math.cos(va)-y*sy*vs*Math.sin(va),vy+x*vs*Math.sin(va)+y*sy*vs*Math.cos(va)];
    const Cn=toW(9.4,0),hand=[-2.4,-42.6],dx=Cn[0]-hand[0],dy=Cn[1]-hand[1],l=Math.hypot(dx,dy),u=[dx/l,dy/l],F=[hand[0]-u[0]*1.4,hand[1]-u[1]*1.4],T=[F[0]+u[0]*35,F[1]+u[1]*35];
    Q.Rt=[[-6.6,-49.2],[-12.6,-43.6],hand];Q.L=[[6.4,-49.2],[15.6,-46.6],toW(21.2,1.6)];
    violin=`<g transform="translate(${vx} ${vy}) rotate(-13) scale(${vs} ${R(sy*vs)})">${ch_violin(id+'v')}</g>`;bow=ch_bow(F,T)}
  const drop=Q.drop||0;
  // ---- helpers
  const limb=(pts,w,col,sh)=>{const d='M'+pts.map(p=>R(p[0])+' '+R(p[1])).join(' L');
    return `<path d="${d}" stroke="${ln}" stroke-width="${R(w+lw*2)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" stroke="${col}" stroke-width="${R(w)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`+
      (sh?`<path d="${d}" stroke="${sh}" stroke-width="${R(w*.34)}" fill="none" stroke-linejoin="round" transform="translate(${R(w*.3)} ${R(w*.08)})"/>`:'')};
  const lerp=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
  const hand=(A,type)=>{const p=A[2],q=A[1],ang=Math.atan2(p[1]-q[1],p[0]-q[0])*180/Math.PI-90,t=`translate(${R(p[0])} ${R(p[1])})`;
    const st=`fill="${sk.base}" stroke="${ln}" stroke-width=".55" stroke-linejoin="round"`;
    if(type==='thumb')return `<g transform="${t}"><rect x="-1.9" y="-1.3" width="3.8" height="3.6" rx="1.5" ${st}/><rect x="-.9" y="-4.4" width="1.7" height="3.8" rx=".85" ${st}/><path d="M-1.4 .1 h2.6 M-1.4 1.1 h2.6" stroke="${ln}" stroke-width=".3" opacity=".7"/></g>`;
    let s=`<g transform="${t} rotate(${R(ang)})"><path d="M-1.55 -.6 C-1.7 1.5 -.9 2.7 0 2.7 C.9 2.7 1.7 1.5 1.55 -.6Z" ${st}/><ellipse cx="1.45" cy=".3" rx=".55" ry="1" transform="rotate(-24 1.45 .3)" ${st}/>`;
    if(type==='scratch')s+=`<path d="M-1 1.7 q.3 .8 .1 1.4 M0 1.9 q.3 .9 .1 1.5 M1 1.7 q.3 .8 .1 1.4" stroke="${ln}" stroke-width=".38" fill="none" stroke-linecap="round"/>`;
    return s+'</g>'};
  const armSvg=(A0,type,cast)=>{const A=[[A0[0][0]+Math.sign(A0[0][0])*.4,A0[0][1]],A0[1],A0[2]];let s=ch_limb(A,3.4,CH_ARM,sk.base,ln,.6,sk.sh)+(type==='thumb'||cast?'':`<path d="M${R(A[1][0]-.7)} ${R(A[1][1]-.5)} q.7 .5 1.3 .1" stroke="${ln}" stroke-width=".28" fill="none" opacity=".45" stroke-linecap="round"/>`);
    if(cast){const c=o.cast||'#c3b6ff',cs=ch_mix(c,'#3a2a6a',.25),a=lerp(A[1],A[2],.08),b=lerp(A[1],A[2],.86);
      s+=ch_limb([a,b],4.2,[[0,.96],[.5,1.04],[1,.9]],c,ln,.6,cs)+`<path d="M${R(a[0]+(b[0]-a[0])*.35)} ${R(a[1]+(b[1]-a[1])*.35-.6)} l.4 .9 l.9 .1 l-.7 .6 l.2 .9 l-.8 -.5 l-.8 .5 l.2 -.9 l-.7 -.6 l.9 -.1z" fill="#ffd45c" stroke="${ln}" stroke-width=".15"/><path d="M${R(a[0]+(b[0]-a[0])*.65)} ${R(a[1]+(b[1]-a[1])*.65)} m0 .6 l-.9 -.9 a.5 .5 0 0 1 .9 -.5 a.5 .5 0 0 1 .9 .5z" fill="#ff7a6b"/>`}
    const sE=lerp(A[0],A[1],.46);s+=ch_limb([A[0],sE],4.4,[[0,1],[.55,1.1],[1,1.02]],C.base,ln,.6,C.sh);
    return s+hand(A,type)};
  // ---- legs, socks, shoes, skirt
  const kn=Q.kn||[0,0],legs=[-1,1].map(sd=>{const hip=[sd*2.7,-30],knee=[sd*2.7+kn[sd<0?0:1],-15.8],ank=[sd*2.6,-2.8],sk0=lerp(knee,ank,.7);
    return ch_limb([hip,knee,ank],4.6,CH_LEG,sk.base,ln,.6,sk.sh)+`<path d="M${R(knee[0]-1)} ${R(knee[1]+.2)} Q${R(knee[0])} ${R(knee[1]+1.1)} ${R(knee[0]+1)} ${R(knee[1]+.2)}" stroke="${ln}" stroke-width=".3" fill="none" opacity=".5" stroke-linecap="round"/>`+
      ch_limb([sk0,ank],3.3,[[0,1],[.6,.9],[1,.84]],'#f6f4fa',ln,.5,'#d8d4e6')+`<path d="M${R(sk0[0]-1.6)} ${R(sk0[1]+.5)} L${R(sk0[0]+1.6)} ${R(sk0[1]+.5)}" stroke="#d8d4e6" stroke-width=".4"/>`+
      `<path d="M${R(sd*2.6-2.6)} -1.4 C${R(sd*2.6-2.8)} -3.4 ${R(sd*2.6+2.6)} -3.6 ${R(sd*2.6+3)} -1.2 C${R(sd*2.6+3.2)} .2 ${R(sd*2.6-2.6)} .4 ${R(sd*2.6-2.6)} -1.4Z" fill="#7a2a3a" stroke="${ln}" stroke-width=".55"/><path d="M${R(sd*2.6-1.6)} -2.6 L${R(sd*2.6+1.8)} -2.8" stroke="#4a1424" stroke-width=".5"/><ellipse cx="${R(sd*2.6-.8)}" cy="-.9" rx="1" ry=".35" fill="#fff" opacity=".45"/>`}).join('');
  const skirt=`<path d="M-5.2 -38.6 L5.2 -38.6 C6.6 -35 8.6 -30.6 10 -27.2 Q0 -25.2 -10 -27.2 C-8.6 -30.6 -6.6 -35 -5.2 -38.6Z" fill="${SK.base}" stroke="${ln}" stroke-width="${lw}" stroke-linejoin="round"/>
    <path d="M2 -38 C3.6 -34 6.4 -30 7.4 -26.4 L10 -27.2 C8.6 -30.6 6.6 -35 5.2 -38.6Z" fill="${SK.sh}"/>
    <path d="M-2.6 -37.4 L-4.6 -26.2 M0 -37.4 L0 -25.8 M2.6 -37.4 L4.6 -26.2 M-5 -36 L-7.6 -26.8 M5 -36 L7.6 -26.8" stroke="${ln}" stroke-width=".35" opacity=".55"/>
    <path d="M-5.3 -38.4 L5.3 -38.4 L5.5 -36.8 L-5.5 -36.8Z" fill="${SK.sh}" stroke="${ln}" stroke-width=".45"/>`;
  // ---- torso: coral short-sleeve top with a white rounded collar
  const sY=-49.6+drop;
  const torso=`<path d="M-1.6 -55.6 L-1.7 ${R(sY+1)} L1.7 ${R(sY+1)} L1.6 -55.6Z" fill="${sk.base}" stroke="${ln}" stroke-width=".6"/><path d="M-1.7 -54.4 Q0 -52.6 1.7 -54.4 L1.7 -52.6 Q0 -51 -1.7 -52.6Z" fill="${sk.sh}"/>
    <path d="M-7.6 ${R(sY)} C-8.1 ${R(sY+4)} -6 -42 -5.4 -38 L5.4 -38 C6 -42 8.1 ${R(sY+4)} 7.6 ${R(sY)} Q0 ${R(sY-1.7)} -7.6 ${R(sY)}Z" fill="${C.base}" stroke="${ln}" stroke-width="${lw}" stroke-linejoin="round"/>
    <path d="M2.6 ${R(sY+.4)} C4.8 -44 3.8 -40 3.6 -38 L5.4 -38 C6 -42 8.1 ${R(sY+4)} 7.6 ${R(sY)}Z" fill="${C.sh}"/>
    <path d="M0 ${R(sY+1.8)} C-1.6 ${R(sY+1.8)} -3.4 ${R(sY+1.2)} -3.8 ${R(sY-.3)} C-4.8 ${R(sY+.2)} -5.3 ${R(sY+1)} -5.1 ${R(sY+1.9)} C-4.3 ${R(sY+3.5)} -1.5 ${R(sY+3.7)} 0 ${R(sY+2.7)}Z M0 ${R(sY+1.8)} C1.6 ${R(sY+1.8)} 3.4 ${R(sY+1.2)} 3.8 ${R(sY-.3)} C4.8 ${R(sY+.2)} 5.3 ${R(sY+1)} 5.1 ${R(sY+1.9)} C4.3 ${R(sY+3.5)} 1.5 ${R(sY+3.7)} 0 ${R(sY+2.7)}Z" fill="#fffaf6" stroke="${ln}" stroke-width=".5" stroke-linejoin="round"/>
    <path d="M-3 -42.6 Q-1.4 -41.6 -.6 -39.4 M3.4 -45 Q2.6 -43 3 -40.6" stroke="${ln}" stroke-width=".35" fill="none" opacity=".5"/>`;
  // ---- head (portrait space, scaled 0.1): back hair separate so it sits behind the body
  const G=CH_FACE.K,HS=ch_hairStyle('braids',G),hg=`url(#${id}hg)`;
  const face={joy:{lid:'closed',brow:'soft',mouth:'happy'},grin:{lid:'normal',brow:'up',mouth:'happy',star:1},sad:{lid:'sad',brow:'worried',mouth:'sad',tear:1},annoyed:{lid:'stern',brow:'stern',mouth:'grit'},calm:{lid:'normal',brow:'soft',mouth:'smile',look:[3,-2]}}[Q.face];
  const iris=o.eye||'#7a4a2e';
  const E={ew:34,eh:30,irx:11.2,iry:13.8,lash:8.5,wing:.7,brow:6,kid:true,lid:face.lid,look:face.look||[0,0],tear:!!face.tear,
    lashC:ch_mix(H.dk,'#1a0810',.5),skinLine:ln,white:'#ffffff',irisGlow:ch_mix(iris,'#ffc890',.5),pupil:ch_mix(iris,'#0a0410',.78),irisLine:ch_mix(iris,'#0a0410',.6),lidSh:ch_mix(sk.base,'#5a4a8a',.5)};
  const ey=137,ex=28,bs=CH_BROWS[face.brow],browC=ch_mix(H.dk,sk.line,.3);
  const brows=ch_brow(150-ex,ey-E.eh/2-9,-1,bs,E,browC)+ch_brow(150+ex,ey-E.eh/2-9,1,bs,E,browC);
  const shapes=[HS.cap].concat(HS.clumps.map(c=>c.d));
  let clumps='';HS.clumps.forEach((c,i)=>{clumps+=`<path d="${c.d}" fill="${i%3===1?H.sh:hg}"/>`;const mid=[[(c.L[0]+c.R[0])/2,(c.L[1]+c.R[1])/2],[(c.a[2][0]+c.b[1][0])/2,(c.a[2][1]+c.b[1][1])/2],c.T];clumps+=`<path d="${ch_rib(ch_sub(ch_bz(mid,10),.3,.9),ch_swell(3.4,.3))}" fill="${H.line}" opacity=".55"/>`});
  const mouth=face.mouth==='grit'?`<path d="M139 172 Q150 168.6 161 172 L160 179 Q150 181 140 179Z" fill="#fffaf6" stroke="${sk.mouth}" stroke-width="2.6" stroke-linejoin="round"/><path d="M140 175.6 Q150 174.4 160 175.6 M146 170.4 V180.4 M154 170.4 V180.4" stroke="${sk.mouth}" stroke-width="1.6" fill="none"/>`
    :`<g transform="translate(150 172) scale(1.8) translate(-150 -172)">${ch_mouth(face.mouth,172,true,sk,false)}</g>`;
  const ah=ch_bz([[146,44],[144,22],[160,10],[170,22]],14);
  const fx=face.tear?`<path d="M${150-ex-16} 150 C${150-ex-20} 160 ${150-ex-21} 166 ${150-ex-18} 170 C${150-ex-15} 173 ${150-ex-10} 171 ${150-ex-11} 166 C${150-ex-12} 161 ${150-ex-14} 156 ${150-ex-16} 150Z" fill="#cdeeff" stroke="#4a9ad8" stroke-width="2.4"/><path d="M${150+ex+16} 152 C${150+ex+13} 160 ${150+ex+12} 164 ${150+ex+14} 167 C${150+ex+16} 169 ${150+ex+20} 168 ${150+ex+19} 164 C${150+ex+18.6} 160 ${150+ex+17} 156 ${150+ex+16} 152Z" fill="#cdeeff" stroke="#4a9ad8" stroke-width="2.4"/>`:'';
  const headFront=`<g clip-path="url(#${id}f)"><g fill="${sk.sh}">${shapes.map(d=>`<path d="${ch_tr(d,2.5,7)}"/>`).join('')}</g><path d="M201 96 C203 124 199 148 190 166 C182 180 170 188 158 192 L212 200 L212 90Z" fill="${sk.sh}"/></g>
    <ellipse cx="${150-ex-6}" cy="${ey+19}" rx="16" ry="8" fill="url(#${id}b)" opacity="${face.mouth==='grit'?.9:.75}"/><ellipse cx="${150+ex+6}" cy="${ey+19}" rx="16" ry="8" fill="url(#${id}b)" opacity="${face.mouth==='grit'?.9:.75}"/>
    <path d="M153 152 Q156 160 153 165" stroke="${sk.sh}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M146.5 165.5 Q150 167.5 154 165" stroke="${ln}" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".85"/>
    ${brows}${ch_eye(150-ex,ey,-1,E,id,0)}${ch_eye(150+ex,ey,1,E,id,1)}
    ${face.star?ch_star(150-ex-3,ey-3,6,'#fff7d0')+ch_star(150+ex-3,ey-3,6,'#fff7d0'):''}
    ${mouth}${fx}
    <g fill="${H.line}" stroke="${H.line}" stroke-width="10" stroke-linejoin="round">${shapes.map(d=>`<path d="${d}"/>`).join('')}</g><path d="${HS.cap}" fill="${hg}"/>${clumps}
    <g clip-path="url(#${id}hc)">${ch_shine(HS.shine,H)}</g>
    <path d="${ch_rib(ah,ch_tap(9,6.5,2.4))}" fill="${H.line}"/><path d="${ch_rib(ah,ch_tap(5,3.4,.6))}" fill="${H.base}"/>
    <g transform="rotate(-28 192 88)"><rect x="178" y="83" width="27" height="8" rx="4" fill="${clip}" stroke="${ch_mix(clip,'#2a0a10',.5)}" stroke-width="3"/></g><g transform="rotate(-28 197 102)"><rect x="183" y="97" width="27" height="8" rx="4" fill="${ch_mix(clip,'#ffd45c',.45)}" stroke="${ch_mix(clip,'#2a0a10',.5)}" stroke-width="3"/></g>
    <g opacity=".6">${brows}</g>`;
  const hS=.122,hx=Q.hdx||0,hy=-53.4-(189-121)*hS+(Q.hdy||0)+drop,HT=`translate(0 -54) rotate(${Q.tilt}) translate(0 54) translate(${hx} ${R(hy)}) scale(${hS}) translate(-150 -121)`;
  const headBack=`<g transform="${HT}"><path d="${HS.back}" fill="${H.dk}" stroke="${H.line}" stroke-width="9"/></g>`;
  const head=`<g transform="${HT}"><path d="${G.face}" fill="${sk.base}" stroke="${ln}" stroke-width="8"/>${headFront}</g>`;
  // braids over the shoulders (portrait space, scaled)
  const braids=`<g transform="translate(0 -51.6) scale(.1) translate(-150 0)">${ch_braid(108,-22,98,128,H,hg,clip,-1,3.6)}${ch_braid(192,-22,202,128,H,hg,clip,1,3.6)}</g>`;
  // extras per pose
  let pre='',post='';
  if(kind==='thumbsup')post+=ch_star(17,-66,2.6,'#ffd45c','stroke="#fff" stroke-width=".4"')+ch_star(8,-70,1.6,'#ffe9a0')+ch_star(20,-58.6,1.3,'#fff')+ch_star(-12,-62,1.8,'#ffd45c');
  if(kind==='itchy'){const a=Q.L[1],b=Q.L[2];for(let i=0;i<11;i++){const t=.1+i*.075,p=lerp(a,b,t),off=((i%3)-1)*.8;post+=`<circle cx="${R(p[0]+off*.3)}" cy="${R(p[1]+off)}" r="${i%2?.55:.72}" fill="#e5484d" stroke="#ffd0d0" stroke-width=".18"/>`}
    for(const p of [lerp(Q.L[0],Q.L[1],.62),lerp(Q.L[0],Q.L[1],.8)])post+=`<circle cx="${R(p[0]+.4)}" cy="${R(p[1])}" r=".45" fill="#e5484d"/>`;
    post+=`<path d="M7.4 -47.4 q1.2 -1.2 2.4 0 M8.2 -49 q1.4 -1.4 2.8 0 M2.4 -48 q-1 -1.2 -2 0" stroke="#e5484d" stroke-width=".45" fill="none" stroke-linecap="round"/><path d="M-9 -66 l1.4 1.4 l-1.4 1.4 l1.4 1.4 M-11.6 -64 l1.2 1.2 l-1.2 1.2" stroke="#e5484d" stroke-width=".6" fill="none" stroke-linecap="round"/>`}
  if(kind==='waiting'){const a=Q.L[1],b=Q.L[2],sl='#5b7bd5',sd=ch_mix(sl,'#141a40',.45);
    pre+=`<path d="M-2.6 -54.4 L-4 -52 L-3.6 -41 L-2.2 -41 L-2.2 -52.2Z" fill="${sl}" stroke="${sd}" stroke-width=".45" stroke-linejoin="round"/><path d="M2.4 -54.4 L4.2 -52.6 L9.4 -42.6 L8 -41.8 L3 -51.6Z" fill="${ch_mix(sl,'#141a40',.2)}" stroke="${sd}" stroke-width=".45" stroke-linejoin="round"/>`;
    post+=`<path d="M${R(a[0]+1.6)} ${R(a[1]-.6)} Q${R((a[0]+b[0])/2)} ${R(a[1]+6.4)} ${R(b[0]-1)} ${R(b[1]+.6)} L${R(b[0]-.4)} ${R(b[1]+1.6)} Q${R((a[0]+b[0])/2)} ${R(a[1]+3.2)} ${R(a[0]+1)} ${R(a[1]+1)}Z" fill="${sl}" stroke="${sd}" stroke-width=".5" stroke-linejoin="round"/><path d="M${R(a[0]-1)} ${R(a[1]+2.4)} Q${R((a[0]+b[0])/2)} ${R(a[1]+4.8)} ${R(b[0]+1)} ${R(b[1]+1.8)}" stroke="#fff" stroke-width=".35" fill="none" opacity=".5"/>`}
  const sway=Q.sway?` transform="rotate(${Q.sway} 0 0)"`:'';
  const armsFront=kind==='violin'?`${violin}${head}${armSvg(Q.L,Q.hL)}${bow}${armSvg(Q.Rt,Q.hR)}`
    :kind==='itchy'?`${head}${armSvg(Q.L,Q.hL)}${post}${armSvg(Q.Rt,Q.hR)}<path d="M2.6 -47.6 q1.6 -1 3.2 0 M3 -41.2 q1.6 1 3.2 0" stroke="${ln}" stroke-width=".4" fill="none" stroke-linecap="round" opacity=".7"/>`
    :`${pre}${head}${armSvg(Q.Rt,Q.hR)}${armSvg(Q.L,Q.hL,Q.cast)}${post}`;
  return `<g class="posed-girl"><defs><linearGradient id="${id}hg" gradientUnits="userSpaceOnUse" x1="0" y1="20" x2="0" y2="300"><stop offset="0" stop-color="${H.top}"/><stop offset=".3" stop-color="${H.base}"/><stop offset="1" stop-color="${H.sh}"/></linearGradient>
    <linearGradient id="${id}i" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${ch_mix(iris,'#0a0410',.55)}"/><stop offset=".38" stop-color="${ch_mix(iris,'#0a0410',.12)}"/><stop offset=".72" stop-color="${ch_mix(iris,'#ffb070',.12)}"/><stop offset="1" stop-color="${ch_mix(iris,'#ffe2b8',.6)}"/></linearGradient>
    <radialGradient id="${id}b"><stop offset="0" stop-color="${sk.blush}"/><stop offset="1" stop-color="${sk.blush}" stop-opacity="0"/></radialGradient>
    <linearGradient id="${id}v" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9954c"/><stop offset=".6" stop-color="#c2581f"/><stop offset="1" stop-color="#8a3510"/></linearGradient>
    <clipPath id="${id}f"><path d="${G.face}"/></clipPath><clipPath id="${id}hc">${shapes.map(d=>`<path d="${d}"/>`).join('')}</clipPath></defs>
   <ellipse cx="0" cy=".4" rx="12" ry="2" fill="rgba(31,35,64,.18)"/>
   <g transform="scale(.95)"><g${sway}>${headBack}${legs}${skirt}${torso}${braids}${armsFront}</g></g></g>`}

// ---------- Byte, a fluffy robot puppy ----------
function byteSVG(o){o=o||{};
  const id='ch'+(++CH_N),c=o.color||'#f0b35a',ears=o.ears||'floppy',mood=o.mood||'happy',L=ch_lum(c);
  const light=ch_mix(c,'#fffaf2',L>.7?.6:.68),shade=ch_mix(c,'#4a2e6a',L>.7?.2:.26),deep=ch_mix(c,'#2a1640',L>.7?.34:.42),line=ch_mix(c,'#22142e',L>.7?.5:.64),hi=ch_mix(c,'#ffffff',.5);
  const ink='#21182e',[r,g,b]=ch_rgb(c),violet=b>r&&b-g>40,collar=violet?'#ff7a6b':'#6c5ce7',collarD=ch_mix(collar,'#1a0e30',.4);
  const browC=L>.55?ch_mix(c,'#5a3a5a',.42):ch_mix(c,'#fffaf2',.72);
  const OL=(arr,w)=>`<g fill="${line}" stroke="${line}" stroke-width="${w||3.4}" stroke-linejoin="round">${arr.map(d=>`<path d="${d}"/>`).join('')}</g>${arr.map(d=>`<path d="${d}" fill="${c}"/>`).join('')}`;
  // tail (base at 108,116)
  const tail='M103 125 C114 125 124 119 130 111 L135 113 L134 105 C138 99 140 93 140 87 L145 85 L140 80 C140 74 136 69 130 68 C125 68 121 71 120 76 C123 74 127 75 128.5 79 C130 86 128 96 122 104 C118 110 112 114 104 116Z';
  const tailTip='M140 87 L145 85 L140 80 C140 74 136 69 130 68 C125 68 121 71 120 76 C123 74 127 75 128.5 79 C129.6 84 129.4 90 128 95 C134 94 138 91 140 87Z';
  // body
  const haunchL='M44 130 C40 118 48 108 60 110 C70 112 74 124 70 136 C64 140 50 140 44 130Z';
  const torso='M60 96 C50 106 46 122 48 136 Q80 142 112 136 C114 122 110 106 100 96Z';
  const legL='M61 110 C59 120 59 128 59 136 L74 136 C74 128 74 118 74 110Z';
  const pawL='M56 136 C56 131 61 129 66.5 129 C72 129 77 131 77 136 C77 141 72 142.5 66.5 142.5 C61 142.5 56 141 56 136Z';
  const bodyParts=[haunchL,ch_mx(haunchL,80),torso,legL,ch_mx(legL,80)];
  const bib='M65 96 Q80 104 95 96 C98 108 95 118 89 125 L86 120 L83 128 L80 121 L77 128 L74 120 L71 125 C65 118 62 108 65 96Z';
  // head
  const head='M80 18 C107 18 124 34 124 57 C124 80 106 95 80 95 C54 95 36 80 36 57 C36 34 53 18 80 18Z';
  const cheekL='M42 60 C34 63 29 68 27 74 C32 74 35 75 37 76 C31 80 30 85 31 89 C36 87 40 87 43 88 C41 91 41 94 43 97 C50 94 56 93 60 92Z';
  const tuft='M66 24 C70 14 76 9 82 8 C80 12 80 15 82 18 C86 12 92 10 98 12 C93 16 92 20 94 25Z';
  const headParts=[head,cheekL,ch_mx(cheekL,80),tuft];
  // ears
  const earsBack={pointy:['M44 42 C40 28 38 14 41 3 C52 7 63 15 70 26Z','M116 42 C120 28 122 14 119 3 C108 7 97 15 90 26Z'],round:['M30 28 C30 18 38 11 47 11 C56 11 63 18 63 28 C63 36 56 42 47 42 C38 42 30 36 30 28Z','M130 28 C130 18 122 11 113 11 C104 11 97 18 97 28 C97 36 104 42 113 42 C122 42 130 36 130 28Z']}[ears];
  const floppyL='M52 24 C38 22 26 32 23 50 C21 64 24 78 31 84 C35 87 39 85 41 81 C43 76 42 70 45 64 C47 56 51 46 58 34Z';
  const alert=mood==='alert';
  let earSvg='';
  if(ears==='floppy'){const rot=alert?26:0;
    earSvg=[floppyL,ch_mx(floppyL,80)].map((d,i)=>`<g transform="rotate(${i?-rot:rot} ${i?108:52} 26)"><path d="${d}" fill="${deep}" stroke="${line}" stroke-width="2.2" stroke-linejoin="round"/><path d="${i?ch_mx('M50 30 C40 32 32 44 30 58 C29 68 31 76 34 80',80):'M50 30 C40 32 32 44 30 58 C29 68 31 76 34 80'}" stroke="${hi}" stroke-width="2" fill="none" opacity=".35" stroke-linecap="round"/><path d="${i?ch_mx('M31 84 C29 86 28 88 30 90 M37 86 C37 88 38 90 40 90',80):'M31 84 C29 86 28 88 30 90 M37 86 C37 88 38 90 40 90'}" stroke="${line}" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>`).join('')}
  else if(ears==='pointy'){earSvg=OL(earsBack,3.2)+`<path d="M47 36 C45 26 44 17 45.5 10 C53 13 60 19 64 26Z" fill="#ffb3c4"/><path d="${ch_mx('M47 36 C45 26 44 17 45.5 10 C53 13 60 19 64 26Z',80)}" fill="#ffb3c4"/><path d="M48 34 L52 26 L53 33 L57 27 L58 33Z" fill="${light}"/><path d="${ch_mx('M48 34 L52 26 L53 33 L57 27 L58 33Z',80)}" fill="${light}"/>`}
  else earSvg=OL(earsBack,3.2)+`<circle cx="47" cy="27" r="8.5" fill="#ffb3c4"/><circle cx="113" cy="27" r="8.5" fill="#ffb3c4"/><path d="M41 22 Q46 18 52 20 M107 20 Q113 18 119 22" stroke="#fff" stroke-width="1.6" fill="none" opacity=".6" stroke-linecap="round"/>`;
  // eyes
  const eye=(x,k)=>{const y=57,rx=alert?10.5:10,ry=alert?12.8:12;
    if(mood==='think'){return `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${ink}"/><ellipse cx="${x-2.4}" cy="${y-2.2}" rx="6.8" ry="7.8" fill="url(#${id}e)"/><circle cx="${x-4.4}" cy="${y-6.4}" r="3.4" fill="#fff"/><circle cx="${x+1.6}" cy="${y+1.4}" r="1.4" fill="#fff"/><circle cx="${x+3.8}" cy="${y-6}" r="1" fill="#fff"/>`}
    return `${alert?`<ellipse cx="${x}" cy="${y}" rx="${rx+.5}" ry="${ry+.5}" fill="#fff" stroke="${ink}" stroke-width="2.2"/><ellipse cx="${x}" cy="${y+1}" rx="7" ry="8.6" fill="${ink}"/><ellipse cx="${x}" cy="${y+2.6}" rx="5" ry="5.6" fill="url(#${id}e)"/><circle cx="${x-2.2}" cy="${y-2.4}" r="2.6" fill="#fff"/>`
      :`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${ink}"/><ellipse cx="${x}" cy="${y+2.2}" rx="7.6" ry="8.8" fill="url(#${id}e)"/><ellipse cx="${x}" cy="${y+7.6}" rx="5" ry="2.6" fill="#7ff7e4" opacity=".28"/><ellipse cx="${x-3.4}" cy="${y-4.6}" rx="4" ry="4.6" fill="#fff"/><circle cx="${x+3.8}" cy="${y+4.8}" r="1.8" fill="#fff"/><circle cx="${x+4.4}" cy="${y-5.6}" r="1" fill="#fff"/>${mood==='happy'?ch_star(x-3.4,y-4.6,2.6,'#fff7d0'):''}`}`};
  const brow=(x,y,rot)=>`<ellipse cx="${x}" cy="${y}" rx="4.4" ry="2.7" fill="${browC}" transform="rotate(${rot} ${x} ${y})"/>`;
  const brows=mood==='think'?brow(59,37,-16)+brow(101,42,8):alert?brow(59,36,-6)+brow(101,36,6):brow(59,40,-8)+brow(101,40,8);
  const mouth={
    happy:`<path d="M70.5 78 Q75.5 81.5 80 77.5 Q84.5 81.5 89.5 78 Q89 91 80 92.4 Q71 91 70.5 78Z" fill="#5a1a30" stroke="${ink}" stroke-width="1.6" stroke-linejoin="round"/><path d="M73.6 86.6 Q80 81.6 86.4 86.6 Q86 93.6 80 94.6 Q74 93.6 73.6 86.6Z" fill="#ff7f9a" stroke="${ink}" stroke-width="1.2"/><path d="M80 86 V91.5" stroke="#e0607e" stroke-width="1.2" stroke-linecap="round"/>`,
    neutral:`<path d="M77.4 80.8 Q80 79.8 82.6 80.8 Q82.8 86 80 86.4 Q77.2 86 77.4 80.8Z" fill="#ff7f9a" stroke="${ink}" stroke-width="1.1"/><path d="M71 78 Q75.5 82.6 80 78.2 Q84.5 82.6 89 78" stroke="${ink}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    think:`<path d="M72 80 Q77 82.5 81 79.5 Q85 77 89 79.2" stroke="${ink}" stroke-width="2.2" fill="none" stroke-linecap="round"/><circle cx="90.5" cy="80.6" r="1.2" fill="${ink}"/>`,
    alert:`<ellipse cx="80" cy="82.4" rx="3.8" ry="4.8" fill="#5a1a30" stroke="${ink}" stroke-width="1.5"/><path d="M77.6 85 Q80 83.2 82.4 85 Q81.6 87 80 87 Q78.4 87 77.6 85Z" fill="#ff7f9a"/>`}[mood]||'';
  let fx='';
  if(mood==='happy')fx=ch_star(28,24,5.5,'#ffd45c','class="twinkle" stroke="#fff" stroke-width=".8"')+ch_star(134,40,4,'#ffd45c','class="twinkle" style="animation-delay:-1.4s"');
  if(mood==='think')fx=`<circle cx="124" cy="22" r="3" fill="#fff" stroke="${line}" stroke-width="1.4" class="thinkdot"/><circle cx="132" cy="12" r="4.2" fill="#fff" stroke="${line}" stroke-width="1.4" class="thinkdot d2"/>`;
  if(alert)fx=`<g transform="translate(128 14) rotate(12)"><path d="M-3.4 -12 Q0 -14 3.4 -12 L1.8 3 Q0 4.4 -1.8 3Z" fill="#ff7a6b" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/><circle cx="0" cy="8.6" r="2.6" fill="#ff7a6b" stroke="#fff" stroke-width="1.2"/></g><path d="M137 22 l6 -2 M136 30 l6 2" stroke="#ff7a6b" stroke-width="2" stroke-linecap="round"/>`;
  return `<g class="byte"><defs><linearGradient id="${id}e" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${ink}" stop-opacity="0"/><stop offset=".55" stop-color="#4a3270"/><stop offset="1" stop-color="#9a74e8"/></linearGradient>
    <radialGradient id="${id}t" cx=".4" cy=".35"><stop offset="0" stop-color="#e8fffb"/><stop offset=".55" stop-color="#7ff7e4"/><stop offset="1" stop-color="#20bfae"/></radialGradient>
    <clipPath id="${id}h"><path d="${head}"/></clipPath></defs>
  <ellipse cx="80" cy="142" rx="46" ry="5.5" fill="rgba(31,35,64,.16)"/>
  <g class="byte-tail" style="transform-origin:108px 116px"><path d="${tail}" fill="${c}" stroke="${line}" stroke-width="2.2" stroke-linejoin="round"/><path d="${tailTip}" fill="${light}"/><path d="M108 121 C117 119 124 113 127 104" stroke="${shade}" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".8"/><path d="M131 100 l3 -1 M134 92 l3 -.5" stroke="${line}" stroke-width="1.3" stroke-linecap="round" opacity=".6"/></g>
  <g class="byte-body">
    ${OL(bodyParts,3.4)}
    <path d="M100 96 C110 106 114 122 112 136 Q104 138 98 138 C104 124 104 108 96 98Z" fill="${shade}" opacity=".8"/>
    <path d="M70 136 C72 128 70 118 62 113 C68 116 72 124 70 136Z" fill="${shade}" opacity=".6"/>
    <path d="M104 112 C110 116 114 124 112 134" stroke="${line}" stroke-width="1.6" fill="none" opacity=".6" stroke-linecap="round"/><path d="M56 112 C50 116 46 124 48 134" stroke="${line}" stroke-width="1.6" fill="none" opacity=".6" stroke-linecap="round"/>
    <path d="${bib}" fill="${light}"/>
    <path d="M71 106 l2 4 M88 108 l-2 4 M78 114 l2 3" stroke="${shade}" stroke-width="1.4" stroke-linecap="round" opacity=".7"/>
    <g fill="${light}" stroke="${line}" stroke-width="2.2"><path d="${pawL}"/><path d="${ch_mx(pawL,80)}"/></g>
    <path d="M63 137 v3.4 M68 137.4 v3.4 M92 137.4 v3.4 M97 137 v3.4" stroke="${line}" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M54 95 Q80 108 106 95 L107 102.5 Q80 116 53 102.5Z" fill="${collar}" stroke="${collarD}" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M56 97.4 Q80 109.4 104 97.4" stroke="#fff" stroke-width="1.3" fill="none" opacity=".45"/>
    <circle cx="80" cy="111.6" r="10" fill="#7ff7e4" opacity=".22"/>
    <g class="byte-collar"><circle cx="80" cy="104.6" r="2.2" fill="none" stroke="#d6dcef" stroke-width="1.6"/><path d="M80 105.6 l7.2 4.2 v8.2 l-7.2 4.2 l-7.2 -4.2 v-8.2z" fill="url(#${id}t)" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round"/><path d="M80 109.4 l3.6 2.1 v4 l-3.6 2.1 l-3.6 -2.1 v-4z" fill="none" stroke="#139e90" stroke-width="1.2"/><circle cx="80" cy="113.5" r="1.3" fill="#139e90"/></g>
  </g>
  <g class="byte-head">
    ${ears!=='floppy'?`<g class="byte-ears">${earSvg}</g>`:''}
    ${OL(headParts,3.4)}
    <g clip-path="url(#${id}h)"><path d="M118 40 C124 56 122 76 108 88 C100 94 90 96 80 96 L130 100 L130 30Z" fill="${shade}" opacity=".55"/></g>
    <path d="M60 24 Q80 15 100 24 Q94 26.5 80 23.5 Q66 26.5 60 24Z" fill="${hi}" opacity=".75"/>
    <path d="M47 76 C52 86 64 92 80 92 C96 92 108 86 113 76 C106 82 96 84 80 84 C64 84 54 82 47 76Z" fill="${light}" opacity=".9"/>
    <path d="M64 75 C64 66 71 63 80 64.5 C89 63 96 66 96 75 C96 86 89 91 80 91 C71 91 64 86 64 75Z" fill="${light}"/>
    <path d="M77 64.8 C78 56 78.6 48 80 42 C81.4 48 82 56 83 64.8Z" fill="${light}" opacity=".9"/>
    ${brows}
    <g class="byte-eyes">${eye(59,0)}${eye(101,1)}</g>
    <ellipse cx="46" cy="72" rx="6.6" ry="3.8" fill="#ff8fab" opacity="${mood==='happy'?.7:.5}"/><ellipse cx="114" cy="72" rx="6.6" ry="3.8" fill="#ff8fab" opacity="${mood==='happy'?.7:.5}"/>
    <path d="M42.5 73.5 l2.4 -3.4 M46.5 74 l2.4 -3.4 M111 74 l2.4 -3.4 M115 73.5 l2.4 -3.4" stroke="#ff6f92" stroke-width="1.1" stroke-linecap="round" opacity=".6"/>
    <path d="M72.4 69 Q80 64.6 87.6 69 Q87 75.6 80 77 Q73 75.6 72.4 69Z" fill="${ink}"/><ellipse cx="77.4" cy="68.6" rx="2.6" ry="1.4" fill="#fff" opacity=".85"/><path d="M80 77 V79" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>
    ${mouth}
    ${ears==='floppy'?`<g class="byte-ears">${earSvg}</g>`:''}
    ${fx}
  </g>
</g>`}
function byteBox(o,cls){o=o||{};return `<svg class="byteart ${cls||''}" viewBox="14 0 136 150" aria-label="${o.name||'Byte'}, your robot puppy">${byteSVG(o)}</svg>`}

// ---------- small full-body scene people (crowds, walkers, villains, Future Table vignettes) ----------
// Anchor: (x,y) + local (0,34) is the ground point between the feet (same as the old mini). Natural height at s=1:
// adult ~53 units (top of hair at local y=-19), kid ~47, pip ~47, jory ~60. o: {skin, shirt, hair, s, face:'happy'|'sad',
// cls, style:'short'|'bob'|'tails'|'pony'|'bun'|'long'|'curly', outfit:'tee'|'hoodie'|'jacket'|'coat', skirt:bool,
// pants, pose:'stand'|'walk'|'push', flip:bool (face left), age:'kid', who:'pip'|'jory'}
const CH_MINI_BUILD={
  adult:{hy:-11.8,hs:1,shY:-4.4,shX:6.8,wX:5,hipY:12,hipX:2.9,kneeY:22.4,ankY:31.4,arm:2.7,leg:3.6},
  kid:{hy:-6.6,hs:1.08,shY:.6,shX:5.8,wX:4.6,hipY:14.4,hipX:2.6,kneeY:23.4,ankY:31.4,arm:2.5,leg:3.3},
  pip:{hy:-5.4,hs:1.12,shY:1.6,shX:7.6,wX:8,hipY:16,hipX:3.3,kneeY:24.4,ankY:31.4,arm:3,leg:4},
  jory:{hy:-20,hs:.94,shY:-12.2,shX:6.4,wX:4.2,hipY:9,hipX:2.6,kneeY:20.6,ankY:31.4,arm:2.3,leg:3.1}};
function mini(x,y,o){o=o||{};const s=o.s||1,who=o.who,sk=o.skin||(who==='jory'?SKIN[0]:who==='pip'?SKIN[2]:SKIN[(x*7|0)%6]);
  const key=String(o.shirt)+String(o.hair)+Math.round(x)+'|'+Math.round(y);let hv=7;for(let i=0;i<key.length;i++)hv=(hv*31+key.charCodeAt(i))|0;hv=Math.abs(hv);
  const B=CH_MINI_BUILD[who||(o.age==='kid'?'kid':'adult')],P=ch_skinPal(sk);
  const shirtC=o.shirt||(who?'#3d3d55':PAL.teal),hairC=o.hair||(who==='jory'?'#d8602a':who==='pip'?'#2a1a14':PAL.ink),H=ch_hairPal(hairC);
  const white=ch_lum(shirtC)>.85;
  const outfit=o.outfit||(who?'jacket':white?'coat':['tee','hoodie','jacket','tee','hoodie','jacket'][(hv>>3)%6]);
  const style=who==='jory'?'messy':who==='pip'?'beanie':o.style||((shirtC==='#ff7a6b')?'tails':['short','bob','tails','pony','short','bun','long','curly'][hv%8]);
  const femme=['bob','tails','pony','bun','long'].includes(style),skirt=o.skirt!=null?o.skirt:(femme&&outfit!=='coat'&&!who&&(hv>>6)%3===0);
  const pants=o.pants||(who?'#2a2a3c':['#3b4068','#2c3e5c','#55473a','#46506e','#2f3346','#6a7090'][(hv>>4)%6]),shoe=['#2a2440','#6a3b2a','#f2f2f6','#3a3050'][(hv>>5)%4];
  const C=ch_clothPal(shirtC),PC=ch_clothPal(pants),ln=ch_mix(P.line,'#1a0a14',.25),pose=o.pose||(who?'stand':'stand');
  const lw=.9,R=v=>ch_n(v);
  const limb=(pts,w,col,sh,prof)=>ch_limb(pts,w*1.1,prof||CH_PANT,col,ln,lw*.85,sh);
  const SLV=[[0,1.04],[.5,.92],[1,.86]],SKL=[[0,.92],[.3,1],[.85,.66],[1,.6]];
  const {hy,hs,shY,shX,wX,hipY,hipX,kneeY,ankY,arm,leg}=B,mid=shY+(hipY-shY)*.5;
  // ---- rig by pose
  let L,Rr,ArmL,ArmR,lean=0;
  if(pose==='walk'){L=[[-hipX,hipY],[-hipX-1.2,kneeY],[-hipX-2.4,ankY]];Rr=[[hipX,hipY],[hipX+.9,kneeY+.2],[hipX+2.6,ankY-.5]];
    ArmL=[[-shX+.6,shY+1.2],[-shX-.4,mid],[-shX+.8,hipY-.8]];ArmR=[[shX-.6,shY+1.2],[shX+1.6,mid],[shX+3,hipY-1.8]]}
  else if(pose==='push'){lean=17;L=[[-hipX,hipY],[-hipX-3.2,kneeY+.4],[-hipX-7.6,ankY]];Rr=[[hipX,hipY],[hipX+2.6,kneeY-.6],[hipX+2.8,ankY]];
    ArmL=[[-shX+1.4,shY+1.2],[shX*.1+2,shY+4.6],[shX+7.6,shY+3.6]];ArmR=[[shX-.6,shY+1.2],[shX+4,shY+4.4],[shX+8.8,shY+3]]}
  else{const v=who?0:(hv>>7)%3;L=[[-hipX,hipY],[-hipX-.3,kneeY],[-hipX-.4,ankY]];Rr=[[hipX,hipY],[hipX+.3,kneeY],[hipX+.4,ankY]];
    ArmL=[[-shX+.6,shY+1.2],[-shX-1.5,mid],[-shX-.5,hipY-.6]];ArmR=[[shX-.6,shY+1.2],[shX+1.5,mid],[shX+.5,hipY-.6]];
    if(v===1){Rr=[[hipX,hipY],[hipX-.9,kneeY+.3],[hipX+.5,ankY]];ArmR=[[shX-.6,shY+1.2],[shX+2,mid+.4],[wX-.4,hipY-1.4]];ArmR.pocket=1}
    if(v===2){ArmL=[[-shX+.6,shY+1.2],[-shX-.8,mid+.6],[-.9,hipY-.2]];ArmR=[[shX-.6,shY+1.2],[shX+.8,mid+.6],[.9,hipY-.4]]}}
  // ---- legs, shoes, skirt
  const shoeAt=(p,back)=>{const x=p[0]+(back?-.3:.3),y=p[1]+1.6,w=leg*.8,h=leg*.5;return `<path d="M${R(x-w)} ${R(y+h*.62)} C${R(x-w)} ${R(y-h*.5)} ${R(x-w*.45)} ${R(y-h*.9)} ${R(x)} ${R(y-h*.9)} C${R(x+w*.5)} ${R(y-h*.9)} ${R(x+w*1.05)} ${R(y-h*.3)} ${R(x+w*1.05)} ${R(y+h*.62)}Z" fill="${shoe}" stroke="${ln}" stroke-width="${lw}" stroke-linejoin="round"/><path d="M${R(x-w*.95)} ${R(y+h*.2)} L${R(x+w)} ${R(y+h*.2)}" stroke="${ch_mix(shoe,'#ffffff',.5)}" stroke-width=".45"/><path d="M${R(x-w*.5)} ${R(y-h*.5)} Q${R(x)} ${R(y-h*.85)} ${R(x+w*.3)} ${R(y-h*.6)}" stroke="#fff" stroke-width=".4" fill="none" opacity=".55" stroke-linecap="round"/>`};
  let legs='';
  if(skirt){const sock=(A)=>limb([[A[1][0]+(A[2][0]-A[1][0])*.72,A[1][1]+(A[2][1]-A[1][1])*.72],A[2]],leg*.72,'#f4f2f8',null,[[0,1],[1,.9]]);legs+=limb(L.slice(1),leg*.8,sk,P.sh,SKL)+limb(Rr.slice(1),leg*.8,sk,P.sh,SKL)+sock(L)+sock(Rr)}
  else legs+=limb(L,leg,PC.base,PC.sh)+limb(Rr,leg,PC.base,PC.sh);
  legs+=shoeAt(L[2],pose==='push')+shoeAt(Rr[2]);
  if(skirt){const sY=hipY-2.6,eY=hipY+6.4;legs+=`<path d="M${R(-wX)} ${R(sY)} L${R(wX)} ${R(sY)} L${R(wX+2.6)} ${R(eY)} Q0 ${R(eY+1.4)} ${R(-wX-2.6)} ${R(eY)}Z" fill="${PC.base}" stroke="${ln}" stroke-width="${lw}" stroke-linejoin="round"/><path d="M${R(wX*.4)} ${R(sY+1)} L${R(wX+1.6)} ${R(eY)} L${R(wX+2.6)} ${R(eY)} L${R(wX)} ${R(sY)}Z" fill="${PC.sh}"/><path d="M${R(-wX*.3)} ${R(sY+1.6)} L${R(-wX*.6)} ${R(eY)} M${R(wX*.3)} ${R(sY+1.6)} L${R(wX*.6)} ${R(eY)}" stroke="${ln}" stroke-width=".45" opacity=".5"/>`}
  // ---- torso & clothes
  const top=shY,belly=who==='pip'?2.2:0;
  const tor=`M${R(-shX)} ${R(top)} C${R(-shX-.5)} ${R(top+4)} ${R(-wX-belly-.4)} ${R(hipY-6)} ${R(-wX-belly*.6)} ${R(hipY-2.4)} L${R(-wX-.4)} ${R(hipY+1.2)} L${R(wX+.4)} ${R(hipY+1.2)} L${R(wX+belly*.6)} ${R(hipY-2.4)} C${R(wX+belly+.4)} ${R(hipY-6)} ${R(shX+.5)} ${R(top+4)} ${R(shX)} ${R(top)} Q0 ${R(top-1.5)} ${R(-shX)} ${R(top)}Z`;
  const torSh=`M${R(shX*.25)} ${R(top+.2)} C${R(shX*.6)} ${R(top+5)} ${R(wX*.5)} ${R(hipY-4)} ${R(wX*.5)} ${R(hipY+1.2)} L${R(wX+.4)} ${R(hipY+1.2)} L${R(wX+belly*.6)} ${R(hipY-2.4)} C${R(wX+belly+.4)} ${R(hipY-6)} ${R(shX+.5)} ${R(top+4)} ${R(shX)} ${R(top)}Z`;
  const neckY0=hy+hs*4.4;
  let body=`<path d="M-1.4 ${R(neckY0)} L-1.5 ${R(top+1.2)} L1.5 ${R(top+1.2)} L1.4 ${R(neckY0)}Z" fill="${sk}" stroke="${ln}" stroke-width="${lw*.8}"/><path d="M-1.5 ${R(neckY0+.4)} Q0 ${R(neckY0+1.8)} 1.5 ${R(neckY0+.4)} L1.5 ${R(neckY0+1.6)} Q0 ${R(neckY0+3)} -1.5 ${R(neckY0+1.6)}Z" fill="${P.sh}"/>`;
  let sleeve=C.base,sleeveSh=C.sh,cuff='';
  if(outfit==='hoodie')body=`<path d="M${R(-shX+1)} ${R(top+.6)} C${R(-shX+.6)} ${R(top-2.6)} ${R(shX-.6)} ${R(top-2.6)} ${R(shX-1)} ${R(top+.6)} Z" fill="${C.sh}" stroke="${ln}" stroke-width="${lw}"/>`+body;
  body+=`<path d="${tor}" fill="${outfit==='jacket'||outfit==='coat'?(outfit==='coat'?'#16b3a6':ch_mix(shirtC,'#ffffff',.78)):C.base}" stroke="${ln}" stroke-width="${lw}" stroke-linejoin="round"/>`;
  if(outfit==='tee'){body+=`<path d="${torSh}" fill="${C.sh}"/><path d="M-1.8 ${R(top-.2)} Q0 ${R(top+1.6)} 1.8 ${R(top-.2)}" stroke="${ln}" stroke-width="${lw*.7}" fill="${sk}"/><circle cx="${R(-wX*.35)}" cy="${R(top+4.4)}" r="1.1" fill="${C.hi}" opacity=".8"/>`}
  if(outfit==='hoodie'){body+=`<path d="${torSh}" fill="${C.sh}"/><path d="M-1.6 ${R(top-.4)} Q0 ${R(top+1.4)} 1.6 ${R(top-.4)}" stroke="${ln}" stroke-width="${lw*.7}" fill="${sk}"/><path d="M-.9 ${R(top+.9)} L-1.1 ${R(top+4.4)} M.9 ${R(top+.9)} L1.1 ${R(top+4.4)}" stroke="#f4f2f8" stroke-width=".55" stroke-linecap="round"/>
      <path d="M${R(-wX*.7)} ${R(hipY-4.6)} L${R(wX*.7)} ${R(hipY-4.6)} L${R(wX*.9)} ${R(hipY-.4)} L${R(-wX*.9)} ${R(hipY-.4)}Z" fill="${C.sh}" stroke="${ln}" stroke-width="${lw*.6}"/><path d="M${R(-wX-.4)} ${R(hipY)} L${R(wX+.4)} ${R(hipY)}" stroke="${ln}" stroke-width=".5" opacity=".6"/>`;cuff=C.sh}
  if(outfit==='jacket'||outfit==='coat'){const J=outfit==='coat'?ch_clothPal('#fbfcff'):C,len=outfit==='coat'?kneeY-1.6:hipY+1.6,jl=`M${R(-shX)} ${R(top)} C${R(-shX-.5)} ${R(top+4)} ${R(-wX-belly-.4)} ${R(hipY-6)} ${R(-wX-belly*.6-(outfit==='coat'?.2:0))} ${R(hipY-2.4)} L${R(-wX-(outfit==='coat'?1.4:.5))} ${R(len)} L${R(-1.1)} ${R(len)} L${R(-1.3)} ${R(top+5)} L-2.4 ${R(top-.6)}Z`;
    body+=`<path d="${jl}" fill="${J.base}" stroke="${ln}" stroke-width="${lw}" stroke-linejoin="round"/><path d="${ch_mx(jl,0)}" fill="${J.base}" stroke="${ln}" stroke-width="${lw}" stroke-linejoin="round"/>
      <path d="${ch_mx(`M${R(-shX*.25)} ${R(top+.4)} C${R(-shX*.6)} ${R(top+5)} ${R(-wX*.5)} ${R(hipY-4)} ${R(-wX*.4)} ${R(len)} L${R(-wX-(outfit==='coat'?1.4:.5))} ${R(len)} L${R(-wX-belly*.6)} ${R(hipY-2.4)} C${R(-wX-belly-.4)} ${R(hipY-6)} ${R(-shX-.5)} ${R(top+4)} ${R(-shX)} ${R(top)}Z`,0)}" fill="${J.sh}"/>
      <path d="M-2.4 ${R(top-.6)} L-1.3 ${R(top+5)} L-3.4 ${R(top+2.4)}Z M2.4 ${R(top-.6)} L1.3 ${R(top+5)} L3.4 ${R(top+2.4)}Z" fill="${J.sh}" stroke="${ln}" stroke-width="${lw*.6}" stroke-linejoin="round"/>
      <path d="M${R(-wX*.75)} ${R(hipY-2)} h2.2 M${R(wX*.75)} ${R(hipY-2)} h-2.2" stroke="${ln}" stroke-width=".55" opacity=".7"/>`;
    sleeve=J.base;sleeveSh=J.sh;
    if(outfit==='coat')body+=`<path d="M-2.2 ${R(top-.2)} Q-3.6 ${R(top+4)} -2.6 ${R(top+7)} M2.2 ${R(top-.2)} Q3.6 ${R(top+4)} 2.8 ${R(top+6)}" stroke="#2b3354" stroke-width=".7" fill="none"/><circle cx="-2.6" cy="${R(top+7.4)}" r=".8" fill="#c9d0e2" stroke="${ln}" stroke-width=".35"/>`;}
  // arms (sleeves + hands); tees show skin forearms
  const handAt=p=>`<circle cx="${R(p[0])}" cy="${R(p[1]+.6)}" r="${R(arm*.56)}" fill="${sk}" stroke="${ln}" stroke-width="${lw*.8}"/>`;
  const armSvg=A=>{const hd=A.pocket?'':handAt(A[2]);if(outfit==='tee'){const e=A[1],sh=A[0],m=[sh[0]+(e[0]-sh[0])*.6,sh[1]+(e[1]-sh[1])*.6];return limb(A,arm*.86,sk,P.sh,CH_ARM)+limb([sh,m],arm*1.12,C.base,C.sh,[[0,1],[.6,1.06],[1,1]])+hd}
    return limb(A,arm,sleeve,sleeveSh,SLV)+(cuff&&!A.pocket?limb([[A[2][0]-(A[2][0]-A[1][0])*.12,A[2][1]-(A[2][1]-A[1][1])*.12],A[2]],arm*.95,cuff,null,[[0,1],[1,1]]):'')+hd};
  // ---- head (local frame centred at (0,0): skull top -5.4, chin 5.4)
  const f=o.face||(who==='pip'?'sly':who==='jory'?'nervous':''),face='M-4.3 -.6 C-4.3 -4 -2.4 -5.4 0 -5.4 C2.4 -5.4 4.3 -4 4.3 -.6 C4.3 2.2 2.7 4.5 0 5.4 C-2.7 4.5 -4.3 2.2 -4.3 -.6Z';
  const fxo=pose==='push'?.7:0,ec='#22142a',E=(ex,ey,k)=>{
    if(f==='happy')return `<path d="M${R(ex-1)} ${R(ey+.3)} Q${R(ex)} ${R(ey-1.3)} ${R(ex+1)} ${R(ey+.3)}" stroke="${ec}" stroke-width=".6" fill="none" stroke-linecap="round"/>`;
    if(f==='sly'&&k)return `<path d="M${R(ex-1)} ${R(ey)} Q${R(ex)} ${R(ey-.7)} ${R(ex+1)} ${R(ey)}" stroke="${ec}" stroke-width=".65" fill="none" stroke-linecap="round"/>`;
    const ry=f==='nervous'?1.25:1.1,rx=f==='nervous'?.82:.78;
    return `<ellipse cx="${R(ex)}" cy="${R(ey)}" rx="${R(rx)}" ry="${R(ry)}" fill="${f==='nervous'?'#fff':ec}" ${f==='nervous'?`stroke="${ec}" stroke-width=".35"`:''}/>${f==='nervous'?`<circle cx="${R(ex)}" cy="${R(ey+.2)}" r=".42" fill="${ec}"/>`:`<ellipse cx="${R(ex)}" cy="${R(ey+.45)}" rx="${R(rx*.62)}" ry="${R(ry*.42)}" fill="${ch_mix('#6b4330','#ffffff',.15)}"/><circle cx="${R(ex-.28)}" cy="${R(ey-.4)}" r=".34" fill="#fff"/>`}<path d="M${R(ex-1)} ${R(ey-.85)} Q${R(ex)} ${R(ey-1.5)} ${R(ex+1.05)} ${R(ey-.95)}" stroke="${ec}" stroke-width=".42" fill="none" stroke-linecap="round"/>`};
  const browY=-1.9,brow=f==='sad'||f==='nervous'?[`M-2.7 ${browY+.2} L-1 ${browY-.5}`,`M2.7 ${browY+.2} L1 ${browY-.5}`]:f==='sly'?[`M-2.7 ${browY-.5} L-1 ${browY}`,`M2.7 ${browY-.7} L1 ${browY-.3}`]:[`M-2.7 ${browY} Q-1.8 ${browY-.5} -1 ${browY-.2}`,`M2.7 ${browY} Q1.8 ${browY-.5} 1 ${browY-.2}`];
  const mouth=f==='happy'?`<path d="M${R(fxo-1.3)} 3.1 Q${R(fxo)} 3.6 ${R(fxo+1.3)} 3.1 Q${R(fxo+.9)} 4.9 ${R(fxo)} 4.9 Q${R(fxo-.9)} 4.9 ${R(fxo-1.3)} 3.1Z" fill="#7a2a3a"/>`
    :f==='sad'?`<path d="M${R(fxo-1)} 4.2 Q${R(fxo)} 3.2 ${R(fxo+1)} 4.2" stroke="#7a2a3a" stroke-width=".5" fill="none" stroke-linecap="round"/>`
    :f==='sly'?`<path d="M${R(fxo-1.2)} 3.6 Q${R(fxo+.2)} 4.2 ${R(fxo+1.5)} 2.8" stroke="#7a2a3a" stroke-width=".55" fill="none" stroke-linecap="round"/>`
    :f==='nervous'?`<path d="M${R(fxo-1.3)} 3.8 q.65 -.6 1.3 0 t1.3 0" stroke="#7a2a3a" stroke-width=".5" fill="none" stroke-linecap="round"/>`
    :`<path d="M${R(fxo-.9)} 3.4 Q${R(fxo)} 4 ${R(fxo+.9)} 3.4" stroke="#7a2a3a" stroke-width=".5" fill="none" stroke-linecap="round"/>`;
  // hair
  const Cl=ch_clump,hg=H.base;let hBack='',hFront='',hat='',cap='M-5 .6 C-5.8 -5 -3 -7.2 0 -7.2 C3 -7.2 5.8 -5 5 .6 C4.6 -1.4 4 -2.6 3 -3.4 L-3 -3.4 C-4 -2.6 -4.6 -1.4 -5 .6Z';
  let cl=[Cl([-4.6,-3],[-2.6,-6],[-4.3,1.2],.8,-.2),Cl([-3.4,-5.6],[-.6,-6.8],[-2.7,-1.2],.6,0),Cl([-1.6,-6.6],[1.2,-6.9],[.1,-.9],.3,.4),Cl([.4,-6.8],[3,-6],[2.6,-1.3],0,.6),Cl([2.6,-6],[4.6,-3],[4.3,1.2],-.2,.8)];
  if(style==='short'||style==='messy')cl=[Cl([-4.8,-2.6],[-3,-5.6],[-4.6,.2],.6,-.2),Cl([-3.4,-5.8],[-.6,-6.8],[-2.3,-2.2],.4,0),Cl([-1.4,-6.8],[1.6,-6.8],[1.6,-1.8],-.2,.7),Cl([.8,-6.8],[3.8,-5.6],[3.7,-1.5],-.2,.8),Cl([3,-5],[5,-2.6],[4.7,.2],-.2,.6)];
  if(style==='messy')cl=cl.concat([Cl([-4.4,-4],[-2.4,-6.2],[-7.2,-6.4],.5,.5),Cl([-1.6,-6.6],[1,-7],[-1.6,-10.2],.5,.5),Cl([1.4,-6.6],[3.6,-5.4],[5.4,-9],.5,.5),Cl([3.6,-4.4],[5,-2],[7.6,-4],.4,.4)]);
  if(style==='curly'){cap='M-5.6 1 C-6.6 -6 -3.4 -8.2 0 -8.2 C3.4 -8.2 6.6 -6 5.6 1 L3.6 -2.6 L-3.6 -2.6Z';let c='';for(let i=0;i<11;i++){const a=(150+i*24)*Math.PI/180;c+=`<circle cx="${R(Math.cos(a)*5.6)}" cy="${R(-1.6+Math.sin(a)*6.2)}" r="2.2"/>`}
    hBack+=`<g fill="${H.line}" stroke="${H.line}" stroke-width="1.4">${c}</g><g fill="${H.sh}">${c}</g>`;cl=[Cl([-4.4,-4],[-1.6,-6.6],[-3.6,-1.6],.9,.4),Cl([-1.8,-6.8],[1.8,-6.8],[0,-2.4],.8,.8),Cl([1.6,-6.6],[4.4,-4],[3.6,-1.6],.4,.9)]}
  const backShape={bob:'M-5.4 0 C-6 -5.4 -3 -7.4 0 -7.4 C3 -7.4 6 -5.4 5.4 0 L5.7 4.8 Q4.8 5.8 3.8 5.1 L-3.8 5.1 Q-4.8 5.8 -5.7 4.8Z',
    long:'M-5.4 0 C-6 -5.4 -3 -7.4 0 -7.4 C3 -7.4 6 -5.4 5.4 0 C5.8 6 6.6 11 6.2 15.6 L4 14 L2 15.8 L-2 15.8 L-4 14 L-6.2 15.6 C-6.6 11 -5.8 6 -5.4 0Z',
    tails:'M-5.2 -1.6 C-8.4 -.6 -8.6 5 -7 10 L-6.2 7 L-5.4 9.6 C-5.6 6 -5 2 -4.2 -.4Z M5.2 -1.6 C8.4 -.6 8.6 5 7 10 L6.2 7 L5.4 9.6 C5.6 6 5 2 4.2 -.4Z',
    pony:'M3.4 -6 C8 -6.4 9.4 -1 8.6 4.6 L7.6 2.6 L7 6.4 C6.6 2 5.4 -2 3 -3.6Z',bun:''}[style]||'';
  if(backShape)hBack+=`<path d="${backShape}" fill="${H.sh}" stroke="${H.line}" stroke-width="${lw}" stroke-linejoin="round"/>`;
  if(style==='tails')hBack+=`<circle cx="-5.4" cy="-1.2" r=".9" fill="#ff7a6b" stroke="${ln}" stroke-width=".3"/><circle cx="5.4" cy="-1.2" r=".9" fill="#ff7a6b" stroke="${ln}" stroke-width=".3"/>`;
  if(style==='bun')hBack+=`<circle cx="0" cy="-7.6" r="2.7" fill="${H.base}" stroke="${H.line}" stroke-width="${lw}"/><path d="M-1.4 -8.6 Q0 -9.6 1.4 -8.6" stroke="${H.hi}" stroke-width=".6" fill="none"/>`;
  const shapes=[cap].concat(cl.map(c=>c.d));
  if(style==='beanie'){cl=[Cl([-4.6,-2],[-2.4,-3.2],[-4.4,1.4],.5,-.2),Cl([2.4,-3.2],[4.6,-2],[4.4,1.4],-.2,.5),Cl([-1.6,-3.4],[1,-3.4],[-.6,-.6],.3,.3)];
    hat=`<path d="M-5.6 -1.6 C-6 -6.6 -3 -8.8 0 -8.8 C3 -8.8 6 -6.6 5.6 -1.6Z" fill="#2c2a3e" stroke="${ln}" stroke-width="${lw}"/><path d="M-5.9 -3.2 Q0 -4.4 5.9 -3.2 L6 -.6 Q0 -1.8 -6 -.6Z" fill="#3a3850" stroke="${ln}" stroke-width="${lw*.8}"/>${[-4.4,-2.6,-.9,.9,2.6,4.4].map(x=>`<path d="M${x} ${R(-3.6+Math.abs(x)*.02)} v2.4" stroke="#24223a" stroke-width=".45"/>`).join('')}<circle cx="0" cy="-9.2" r="1.5" fill="#ff7a6b" stroke="${ln}" stroke-width=".6"/><path d="M-3.6 -6.6 Q-1.6 -8 .6 -7.8" stroke="#55537a" stroke-width=".8" fill="none" stroke-linecap="round"/>`}
  const hs2=style==='beanie'?cl.map(c=>c.d):shapes;
  hFront+=`<g fill="${H.line}" stroke="${H.line}" stroke-width="${R(lw*1.3)}" stroke-linejoin="round">${hs2.map(d=>`<path d="${d}"/>`).join('')}</g>`+hs2.map((d,i)=>`<path d="${d}" fill="${i%3===2?H.sh:hg}"/>`).join('');
  if(style!=='beanie')hFront+=`<path d="M-3.8 -4.6 L-3.2 -3.4 L-2.6 -4.9 L-1.6 -3.6 L-.8 -5.4 L.2 -3.8 L1 -5.4 L1.8 -3.6 L2.8 -4.9 L3.3 -3.5 L3.9 -4.5 Q0 -7.2 -3.8 -4.6Z" fill="${H.hi}" opacity=".9"/>`;
  const sweat=f==='nervous'?`<path d="M5.4 -4.6 C6.2 -3.2 6.6 -2.4 6.6 -1.8 C6.6 -1 6 -.6 5.4 -.6 C4.8 -.6 4.2 -1 4.2 -1.8 C4.2 -2.4 4.6 -3.2 5.4 -4.6Z" fill="#bfe8ff" stroke="#4a9ad8" stroke-width=".35"/>`:'';
  const tear=f==='sad'?`<path d="M-2.6 .9 q-.5 1 -.2 1.6 q.5 .5 .8 -.1 q.1 -.6 -.6 -1.5Z" fill="#bfe8ff" stroke="#4a9ad8" stroke-width=".25"/>`:'';
  const head=`<g transform="translate(${R(fxo*.6)} ${R(hy)}) scale(${hs})">
    <path d="M-4.4 -.4 Q-5.6 .2 -5 1.8 Q-4.6 2.6 -4 2.4Z M4.4 -.4 Q5.6 .2 5 1.8 Q4.6 2.6 4 2.4Z" fill="${sk}" stroke="${ln}" stroke-width="${lw*.7}"/>
    <path d="${face}" fill="${sk}" stroke="${ln}" stroke-width="${lw}"/>
    <path d="M2.2 -4.6 C4.6 -3 4.6 1.4 2.6 4 C3.6 2.6 4.4 1.4 4.3 -.6 C4.3 -2.6 3.6 -3.8 2.2 -4.6Z" fill="${P.sh}"/>
    <path d="M-3.8 -3.2 L-3.2 -1.8 L-2.6 -3.3 L-1.6 -2 L-.8 -3.4 L.2 -2.2 L1 -3.4 L1.8 -2 L2.8 -3.3 L3.6 -1.8 L4 -3 L4 -4 L-4 -4Z" fill="${P.sh}" opacity="${style==='beanie'?0:.8}"/>
    <ellipse cx="${R(fxo-2.8)}" cy="2.1" rx="1" ry=".5" fill="${P.blush}" opacity=".6"/><ellipse cx="${R(fxo+2.8)}" cy="2.1" rx="1" ry=".5" fill="${P.blush}" opacity=".6"/>
    ${E(fxo-1.75,.5,0)}${E(fxo+1.75,.5,1)}
    <path d="${brow[0]}" transform="translate(${fxo} 0)" stroke="${H.line}" stroke-width=".5" fill="none" stroke-linecap="round"/><path d="${brow[1]}" transform="translate(${fxo} 0)" stroke="${H.line}" stroke-width=".5" fill="none" stroke-linecap="round"/>
    <path d="M${R(fxo+.3)} 1.7 L${R(fxo+.6)} 2.6 L${R(fxo)} 2.7" stroke="${P.line}" stroke-width=".35" fill="none" opacity=".7" stroke-linecap="round"/>
    ${mouth}${tear}${hFront}${hat}${sweat}</g>`;
  const backHair=hBack?`<g transform="translate(${R(fxo*.6)} ${R(hy)}) scale(${hs})">${hBack}</g>`:'';
  const upper=`${backHair}${pose==='push'?armSvg(ArmL):''}${body}${pose!=='push'?armSvg(ArmL):''}${armSvg(ArmR)}${head}`;
  const flip=o.flip?' scale(-1 1)':'';
  return `<g transform="translate(${x} ${y}) scale(${s})" class="${o.cls||''}"><g${flip?` transform="${flip.trim()}"`:''}><ellipse cx="0" cy="34" rx="${pose==='push'?13:10}" ry="2.6" fill="${PAL.shadow}"/>
   ${legs}${lean?`<g transform="rotate(${lean} 0 ${hipY})">${upper}</g>`:upper}</g></g>`}
