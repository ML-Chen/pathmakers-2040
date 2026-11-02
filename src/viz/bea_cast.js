// bea_cast.js — cast art for the Elder Companion days (Bea, Grace, Wren) and posed full-body figures for pictures.
// Portraits use the same anime pipeline as characters.js (ch_eye, ch_brow, ch_mouth, palettes) in the portrait box
// (viewBox 30 0 240 360, chin at y 191), with hair and outfits drawn here: Bea's short white coils with a silk headband,
// a plum cardigan and pearls; Grace's cropped natural hair, blazer and a little bridge pin. Animation hooks match
// personSVG (.p-body, .p-head, .p-eyes, .p-mouth), so the stage animates them like everyone else.
// Posed figures (beaFig, jordanFig, wrenFig): feet on (0,0), Bea about 64 units tall, Jordan about 72, Wren about 58.
// Everything is reusable by later Companion days: beaPortrait(mood), beaGracePortrait(mood), beaWrenPortrait(mood).

// ---------- coily hair: a bumpy cloud outline built from anchor points, plus curl texture ----------
function bc_rng(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}
// anchors around an ellipse from angle a0 to a1 (degrees, y down), bumps pushed outward
function bc_cloudEdge(cx,cy,rx,ry,a0,a1,n,bump,seed,sign){const r=bc_rng(seed),P=[];sign=sign||1;
  for(let i=0;i<=n;i++){const a=(a0+(a1-a0)*i/n)*Math.PI/180,j=1+(r()-.5)*.06;P.push([cx+Math.cos(a)*rx*j,cy+Math.sin(a)*ry*j])}
  let d=`M${ch_n(P[0][0])} ${ch_n(P[0][1])}`;
  for(let i=0;i<n;i++){const A=P[i],B=P[i+1],dx=B[0]-A[0],dy=B[1]-A[1],l=Math.hypot(dx,dy)||1,k=bump*(.75+r()*.5)*sign;
    d+=` Q${ch_n((A[0]+B[0])/2+dy/l*k*2)} ${ch_n((A[1]+B[1])/2-dx/l*k*2)} ${ch_n(B[0])} ${ch_n(B[1])}`}
  return {d,P}}
// a scalloped curve through points (for a hairline): bumps toward `sign` side of travel
function bc_scallop(P,bump,seed,sign){const r=bc_rng(seed);let d='';
  for(let i=0;i<P.length-1;i++){const A=P[i],B=P[i+1],dx=B[0]-A[0],dy=B[1]-A[1],l=Math.hypot(dx,dy)||1,k=bump*(.7+r()*.6)*sign;
    d+=`${i?'':`M${ch_n(A[0])} ${ch_n(A[1])}`} Q${ch_n((A[0]+B[0])/2+dy/l*k*2)} ${ch_n((A[1]+B[1])/2-dx/l*k*2)} ${ch_n(B[0])} ${ch_n(B[1])}`}
  return d}
// sample a cubic hairline into n points
function bc_curvePts(c,n){return ch_bz(c,n)}
// small curl marks scattered in an ellipse, lit upper-left
function bc_curls(cx,cy,rx,ry,n,seed,lit,shade,w){const r=bc_rng(seed);let a='',b='';
  for(let i=0;i<n;i++){const t=r()*Math.PI*2,d=Math.sqrt(r()),x=cx+Math.cos(t)*rx*d,y=cy+Math.sin(t)*ry*d,s=2+r()*2.2,up=(x-cx)/rx+(y-cy)/ry<-.15;
    const p=`M${ch_n(x-s)} ${ch_n(y+s*.5)} Q${ch_n(x-s*.9)} ${ch_n(y-s)} ${ch_n(x+s*.3)} ${ch_n(y-s*.8)} Q${ch_n(x+s*1.1)} ${ch_n(y-s*.3)} ${ch_n(x+s*.6)} ${ch_n(y+s*.6)}`;
    if(up)a+=p;else b+=p}
  return `<path d="${b}" stroke="${shade}" stroke-width="${w||1.5}" fill="none" stroke-linecap="round" opacity=".8"/><path d="${a}" stroke="${lit}" stroke-width="${(w||1.5)*1.05}" fill="none" stroke-linecap="round" opacity=".85"/>`}

// ---------- head builder (portrait space). o: {skin, eye, mood, hair:{kind:'coily'|'crop'|'style', ...}, age:0|1|2, glasses, frame, earring, build, lw}
function bc_head(o){
  const id='bc'+(++CH_N),build=o.build||'F',G=CH_FACE[build],md=CH_MOODS[o.mood]||CH_MOODS.smile,sk=ch_skinPal(o.skin||'#7a4a2c'),lw=o.lw||1;
  const iris=o.eye||'#6a3a22',age=o.age||0,HP=o.hairPal;
  const E={ew:G.ew,eh:age>=2?G.eh*.84:G.eh,irx:G.irx,iry:G.iry,lash:G.lash,wing:G.wing,brow:G.brow,kid:false,lid:md.lid,look:md.look||[0,0],worry:md.worry,tear:md.fx==='tear',
    lashC:ch_mix(HP.lash||'#2a1a20','#1a0810',.4),skinLine:sk.line,white:'#ffffff',irisGlow:ch_mix(iris,'#ffc890',.5),pupil:ch_mix(iris,'#0a0410',.78),irisLine:ch_mix(iris,'#0a0410',.6),lidSh:ch_mix(sk.base,'#5a4a8a',.5)};
  const ey=G.ey,ex=G.ex,browY=ey-E.eh/2+G.by,browC=HP.brow||ch_mix(HP.dk,sk.line,.3);
  const bs=CH_BROWS[md.brow],bL=Array.isArray(bs[0])?bs[0]:bs,bR=Array.isArray(bs[0])?bs[1]:bs;
  const brows=ch_brow(150-ex,browY,-1,bL,E,browC)+ch_brow(150+ex,browY,1,bR,E,browC);
  const earL=`M99 ${G.ear} C91 ${G.ear-5} 85 ${G.ear+2} 86.5 ${G.ear+13} C88 ${G.ear+24} 92 ${G.ear+33} 100 ${G.ear+35}Z`,earIn=`M95 ${G.ear+7} C90.5 ${G.ear+9} 90.5 ${G.ear+18} 94 ${G.ear+25}`;
  const ears=`<path d="${earL}" fill="${sk.base}" stroke="${sk.line}" stroke-width="${2.2*lw}"/><path d="${ch_mx(earL,150)}" fill="${sk.sh}" stroke="${sk.line}" stroke-width="${2.2*lw}"/>
    <path d="${earIn}" stroke="${sk.line}" stroke-width="${1.3*lw}" fill="none" opacity=".7"/><path d="${ch_mx(earIn,150)}" stroke="${sk.line}" stroke-width="${1.3*lw}" fill="none" opacity=".7"/>`;
  // ---- hair
  const hg=`url(#${id}hg)`;let back='',front='',sideFront='',faceShadow='';const hk=o.hair.kind;
  if(hk==='coily'||hk==='crop'){
    const big=hk==='coily',cx=150,cy=big?98:104,rx=big?72:60,ry=big?76:66;
    const ed=bc_cloudEdge(cx,cy,rx,ry,big?150:158,big?390:382,big?17:20,big?5.2:2.6,o.hair.seed||7);
    const backD=ed.d+` L${big?196:192} ${big?150:144} L${big?104:108} ${big?150:144}Z`;
    back=`<path d="${backD}" fill="${HP.line}" stroke="${HP.line}" stroke-width="${3.4*lw}" stroke-linejoin="round"/><path d="${backD}" fill="${hg}"/>
      <clipPath id="${id}hm"><path d="${backD}"/></clipPath><g clip-path="url(#${id}hm)">
       <path d="M${cx+rx*.2} ${cy-ry} C${cx+rx*1.1} ${cy-ry*.6} ${cx+rx*1.2} ${cy+ry*.3} ${cx+rx*.8} ${cy+ry*.8} L${cx+rx*1.4} ${cy+ry} L${cx+rx*1.4} ${cy-ry*1.2}Z" fill="${HP.sh}" opacity=".7"/>
       ${bc_curls(cx,cy-6,rx*.95,ry*.95,big?120:110,(o.hair.seed||7)+3,HP.hi,HP.sh,1.5*lw)}
       <ellipse cx="${cx-rx*.42}" cy="${cy-ry*.62}" rx="${rx*.36}" ry="${ry*.18}" fill="#ffffff" opacity="${HP.gloss||.35}" transform="rotate(-24 ${cx-rx*.42} ${cy-ry*.62})"/></g>`;
    // front mass: covers the crown and comes down over the temples and the tops of the ears; only its inner edge
    // (a scalloped hairline) is inked, so it merges with the back mass
    const hl=big?[[100,128],[101,100],[122,80],[150,78]]:[[100,116],[103,92],[124,72],[150,70]];
    const L=bc_curvePts(hl,8),side=big?[[82,124],[88,134],[96,134]]:[[94,112],[98,118]];
    const line=side.concat(L,L.map(p=>[300-p[0],p[1]]).reverse().slice(1),side.map(p=>[300-p[0],p[1]]).reverse());
    const edge=bc_scallop(line,big?2.1:1.4,(o.hair.seed||7)+9,-1);
    const e0=line[line.length-1],s0=line[0];
    const frontD=edge+(big?` C${e0[0]+8} 62 194 24 150 24 C106 24 ${s0[0]-8} 62 ${s0[0]} ${s0[1]}Z`:` C${e0[0]+6} 64 190 34 150 34 C110 34 ${s0[0]-6} 64 ${s0[0]} ${s0[1]}Z`);
    front=`<path d="${frontD}" fill="${hg}"/><clipPath id="${id}hf"><path d="${frontD}"/></clipPath><g clip-path="url(#${id}hf)">
       <path d="M196 40 C214 60 222 90 214 130 L232 130 L232 40Z" fill="${HP.sh}" opacity=".55"/>
       ${bc_curls(150,big?78:70,big?66:56,big?52:40,big?90:60,(o.hair.seed||7)+5,HP.hi,HP.sh,1.4*lw)}
       <ellipse cx="${cx-rx*.36}" cy="${cy-ry*.6}" rx="${rx*.3}" ry="${ry*.13}" fill="#ffffff" opacity="${(HP.gloss||.35)*.8}" transform="rotate(-26 ${cx-rx*.36} ${cy-ry*.6})"/></g>
      <path d="${edge}" stroke="${HP.line}" stroke-width="${2.2*lw}" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
    faceShadow=`<path d="${edge} L232 20 L68 20Z" fill="${sk.sh}" transform="translate(2.5 5.5)"/>`;
  }
  // ---- faces
  const faceClip=`<clipPath id="${id}f"><path d="${G.face}"/></clipPath>`,R=build==='M'?204:202;
  const shade=`<g clip-path="url(#${id}f)">${faceShadow}
     <path d="M${R-1} 96 C${R+1} 124 ${R-3} 148 ${R-12} 166 C${R-20} 180 ${R-34} 190 ${R-50} 194 L${R+10} 200 L${R+10} 90Z" fill="${sk.sh}"/>
     <path d="M${R-6} 104 C${R-6} 128 ${R-9} 146 ${R-16} 160 C${R-22} 172 ${R-30} 180 ${R-38} 186 C${R-26} 182 ${R-16} 172 ${R-10} 160 C${R-4} 146 ${R-2} 126 ${R-2} 104Z" fill="${sk.sh}"/>
     <path d="M${150-ex+12} ${ey-12} C${150-ex+15} ${ey-6} ${150-ex+16} ${ey-1} ${150-ex+15} ${ey+3}" stroke="${sk.sh}" stroke-width="2.2" fill="none" opacity=".7"/><path d="M${150+ex-12} ${ey-12} C${150+ex-15} ${ey-6} ${150+ex-16} ${ey-1} ${150+ex-15} ${ey+3}" stroke="${sk.sh}" stroke-width="2.6" fill="none" opacity=".9"/></g>`;
  const ny=G.ny,my=G.my,big=build==='M';
  const nose=`<path d="${ch_rib(ch_bz([[153.5,ny-(big?26:20)],[155.5,ny-10],[155.2,ny-2]],8),ch_tap(.4,(big?1.8:1.3)*lw,.6))}" fill="${sk.sh}"/>
    <path d="M153 ${ny-4} Q158 ${ny-.5} 155.4 ${ny+3.4} Q153.4 ${ny+1.4} 151.6 ${ny+1.2}Z" fill="${sk.sh}"/>
    <path d="${ch_rib(ch_bz([[146,ny+1],[150,ny+3.6],[155,ny+.4]],8),ch_swell((big?1.8:1.5)*lw,.3))}" fill="${sk.line}" opacity=".9"/>
    <ellipse cx="148.4" cy="${ny-3.4}" rx="1.4" ry="2.4" fill="${sk.hi}" opacity=".9"/>`;
  const closed=md.mouth!=='happy'&&md.mouth!=='o';
  const lip=(closed?`<path d="M145 ${my+8} Q150 ${my+10} 155 ${my+8} Q150 ${my+8.8} 145 ${my+8}Z" fill="${sk.sh}" stroke="${sk.sh}" stroke-width="1.4"/>`:'')+
    (build==='F'&&closed?`<path d="M141.5 ${my+1.8} Q150 ${my+8.4} 158.5 ${my+1.8} Q150 ${my+5} 141.5 ${my+1.8}Z" fill="${sk.lip}" opacity=".8"/><ellipse cx="147" cy="${my+4.6}" rx="2.2" ry=".9" fill="#fff" opacity=".3"/>`:'');
  const blushOp=(md.fx==='sparkle'?.75:.5)*(build==='M'?.45:.75)*(ch_lum(sk.base)<.12?.7:1);
  const blush=`<ellipse cx="${150-ex-4}" cy="${ey+19}" rx="15" ry="7" fill="url(#${id}b)" opacity="${ch_n(blushOp)}"/><ellipse cx="${150+ex+4}" cy="${ey+19}" rx="15" ry="7" fill="url(#${id}b)" opacity="${ch_n(blushOp)}"/>`;
  const al=sk.line,ao=age>=2?.55:.32;
  const ageLines=age?`<path d="M${150-ex-6} ${ey+9} Q${150-ex+2} ${ey+12} ${150-ex+9} ${ey+9}" stroke="${al}" stroke-width="${lw}" opacity="${ao}" fill="none" stroke-linecap="round"/><path d="M${150+ex+6} ${ey+9} Q${150+ex-2} ${ey+12} ${150+ex-9} ${ey+9}" stroke="${al}" stroke-width="${lw}" opacity="${ao}" fill="none" stroke-linecap="round"/>`+
    `<path d="M127 ${my-8} Q123 ${my} 127 ${my+6} M173 ${my-8} Q177 ${my} 173 ${my+6}" stroke="${al}" stroke-width="${1.1*lw}" opacity="${age>=2?.5:.3}" fill="none" stroke-linecap="round"/>`+
    (age>=2?`<path d="M${150-ex-17} ${ey+1} l-5 -2 M${150-ex-17} ${ey+5} l-5 1 M${150+ex+17} ${ey+1} l5 -2 M${150+ex+17} ${ey+5} l5 1 M${150-ex-4} ${ey+14} Q${150-ex+3} ${ey+16.5} ${150-ex+10} ${ey+14} M${150+ex+4} ${ey+14} Q${150+ex-3} ${ey+16.5} ${150+ex-10} ${ey+14} M134 86 Q150 82 166 86 M138 93 Q150 90 162 93 M141 ${my+15} Q150 ${my+18} 159 ${my+15}" stroke="${al}" stroke-width="${1.1*lw}" opacity=".42" fill="none" stroke-linecap="round"/>`:''):'';
  const gl=o.glasses?(()=>{const fc=o.frame||'#5a2a3c',x1=150-ex,x2=150+ex,y=ey;
    const lens=cx=>`M${cx-18} ${y-8} Q${cx-18} ${y-11} ${cx-14} ${y-11} L${cx+14} ${y-11} Q${cx+18} ${y-11} ${cx+18} ${y-7} L${cx+17} ${y+6} Q${cx+16} ${y+11} ${cx+11} ${y+11} L${cx-12} ${y+11} Q${cx-17} ${y+11} ${cx-17.5} ${y+6}Z`;
    return `<path d="${lens(x1)}" fill="#e8f4ff" opacity=".12"/><path d="${lens(x2)}" fill="#e8f4ff" opacity=".12"/><path d="M${x1-18} ${y-6} L${x1-24} ${y-5} M${x2+18} ${y-6} L${x2+24} ${y-5}" stroke="${fc}" stroke-width="2"/>
      <path d="${lens(x1)}" fill="none" stroke="${fc}" stroke-width="${1.9*lw}"/><path d="${lens(x2)}" fill="none" stroke="${fc}" stroke-width="${1.9*lw}"/><path d="M${x1+18} ${y-5} Q150 ${y-10} ${x2-18} ${y-5}" stroke="${fc}" stroke-width="${1.9*lw}" fill="none"/>
      <path d="M${x1-12} ${y+6} L${x1-4} ${y-7} M${x2+6} ${y+6} L${x2+13} ${y-6}" stroke="#fff" stroke-width="2.2" opacity=".26" stroke-linecap="round"/>`})():'';
  const ear=o.earring==='pearl'?[[91,1],[209,0]].map(([x,lit])=>`<circle cx="${x}" cy="${G.ear+34}" r="4.4" fill="url(#${id}pe)" stroke="#9a8aa8" stroke-width="${.9*lw}"/><circle cx="${x-1.5}" cy="${G.ear+32.4}" r="1.3" fill="#fff" opacity="${lit?.95:.7}"/>`).join('')
    :o.earring==='stud'?`<circle cx="91" cy="${G.ear+31}" r="2.4" fill="#cfd8e8" stroke="#6a7490" stroke-width=".8"/><circle cx="209" cy="${G.ear+31}" r="2.4" fill="#aeb8cc" stroke="#6a7490" stroke-width=".8"/>`:'';
  let fx='';
  if(md.fx==='sparkle')fx=ch_star(230,64,9,'#ffd45c','stroke="#fff" stroke-width="1"')+ch_star(244,86,5,'#fff')+ch_star(66,70,6,'#ffe9a0');
  if(md.fx==='sweat')fx=`<path d="M213 98 C217 108 220 114 220 119 C220 124 216 127 212.5 127 C209 127 205 124 205.5 119 C206 114 209 108 213 98Z" fill="#bfe8ff" stroke="#4a9ad8" stroke-width="1.6"/>`;
  if(md.fx==='tear')fx=`<path d="M${150-ex-12} ${ey+8} C${150-ex-15} ${ey+15} ${150-ex-16} ${ey+19} ${150-ex-14} ${ey+22} C${150-ex-12} ${ey+24.5} ${150-ex-9} ${ey+23} ${150-ex-9.5} ${ey+19.5} C${150-ex-10} ${ey+16} ${150-ex-11} ${ey+12} ${150-ex-12} ${ey+8}Z" fill="#cdeeff" stroke="#5aa9e6" stroke-width="1.2"/>`;
  if(md.fx==='pop')fx=`<path d="M222 54 L232 42 M230 66 L244 60 M78 54 L68 42" stroke="${sk.line}" stroke-width="2.6" stroke-linecap="round"/>`;
  if(md.fx==='dots')fx=`<circle cx="226" cy="62" r="3.2" fill="#fff" stroke="${sk.line}" stroke-width="1.2" class="thinkdot"/><circle cx="235" cy="49" r="4.4" fill="#fff" stroke="${sk.line}" stroke-width="1.2" class="thinkdot d2"/><circle cx="245" cy="34" r="5.8" fill="#fff" stroke="${sk.line}" stroke-width="1.2" class="thinkdot"/>`;
  const defs=`<defs><linearGradient id="${id}i" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${ch_mix(iris,'#0a0410',.55)}"/><stop offset=".38" stop-color="${ch_mix(iris,'#0a0410',.12)}"/><stop offset=".72" stop-color="${ch_mix(iris,'#ffb070',.12)}"/><stop offset="1" stop-color="${ch_mix(iris,'#ffe2b8',.6)}"/></linearGradient>
    <linearGradient id="${id}hg" gradientUnits="userSpaceOnUse" x1="0" y1="20" x2="0" y2="170"><stop offset="0" stop-color="${HP.top}"/><stop offset=".45" stop-color="${HP.base}"/><stop offset="1" stop-color="${HP.sh}"/></linearGradient>
    <radialGradient id="${id}fl" gradientUnits="userSpaceOnUse" cx="128" cy="120" r="78"><stop offset="0" stop-color="${sk.hi}" stop-opacity=".5"/><stop offset=".55" stop-color="${sk.hi}" stop-opacity=".12"/><stop offset="1" stop-color="${sk.hi}" stop-opacity="0"/></radialGradient>
    <radialGradient id="${id}b"><stop offset="0" stop-color="${sk.blush}"/><stop offset="1" stop-color="${sk.blush}" stop-opacity="0"/></radialGradient>
    <radialGradient id="${id}pe" cx=".35" cy=".3"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#f3eef6"/><stop offset="1" stop-color="#c9bcd6"/></radialGradient>${faceClip}</defs>`;
  const eyes=`<g class="p-eyes">${ch_eye(150-ex,ey,-1,E,id,0)}${ch_eye(150+ex,ey,1,E,id,1)}</g>`;
  const lowerLash=md.lid!=='closed'?[-1,1].map(s=>{const cx=150+s*ex,w=E.ew,h=E.eh;return `<path d="${ch_rib(ch_bz([[cx-s*w*.4,ey+h*.02],[cx+s*w*.05,ey+h*.3],[cx+s*w*.44,ey-h*.04]],12),ch_tap(.8,2.4,1.6))}" fill="${E.lashC}"/>`}).join(''):'';
  const core=`${ears}<path d="${G.face}" fill="${sk.base}" stroke="${sk.line}" stroke-width="${2.6*lw}"/><path d="${G.face}" fill="url(#${id}fl)"/>
    ${shade}${blush}${nose}${lip}${ageLines}${brows}${lowerLash}${eyes}<g class="p-mouth">${ch_mouth(md.mouth,my,false,sk,big)}</g>${gl}`;
  return {id,defs,back,core,front:sideFront+front+(o.extraFront?o.extraFront(id,lw):'')+ear+`<g opacity=".42">${brows}</g>`+fx,sk,G}}

// ---------- outfits (portrait space, inside .p-body) ----------
function bc_neck(G,sk,id){const nw=G.nw,cx=150,cy=G.chin,nb=cy+20;
  const neck=`M${cx-nw*.86} 150 C${cx-nw*.86} ${cy} ${cx-nw*.9} ${nb-8} ${cx-nw-4} ${nb+6} L${cx+nw+4} ${nb+6} C${cx+nw*.9} ${nb-8} ${cx+nw*.86} ${cy} ${cx+nw*.86} 150Z`;
  return `<clipPath id="${id}n"><path d="${neck}"/></clipPath><path d="${neck}" fill="${sk.base}" stroke="${sk.line}" stroke-width="2.2"/>
    <g clip-path="url(#${id}n)"><path d="M${cx-nw-6} 150 L${cx-nw-6} ${cy-10} C${cx-nw*.5} ${cy+13} ${cx+nw*.5} ${cy+13} ${cx+nw+6} ${cy-10} L${cx+nw+6} 150Z" fill="${sk.sh}"/>
    <path d="M${cx+nw*.42} 150 C${cx+nw*.5} ${cy+6} ${cx+nw*.62} ${nb} ${cx+nw*.8} ${nb+8} L${cx+nw+6} ${nb+8} L${cx+nw+6} 150Z" fill="${sk.sh}"/>
    <path d="M${cx-nw*.5} ${cy+16} C${cx-nw*.4} ${cy+10} ${cx-nw*.3} ${cy+6} ${cx-nw*.2} ${cy+4}" stroke="${sk.line}" stroke-width="1" fill="none" opacity=".35"/></g>`}
// Bea: cream silk blouse, plum cardigan with ribbed bands and pearl buttons, a strand of pearls, a gold dancing-shoe brooch
function bc_beaOutfit(H,id){const sk=H.sk,K=ch_clothPal('#7d4fa8'),B=ch_clothPal('#fbf1e4'),L=K.line;
  const torso='M128 205 C115 210 95 214 79 219 C61 225 51 239 47 259 L41 372 L259 372 L253 259 C249 239 239 225 221 219 C205 214 185 210 172 205Z';
  const panL='M128 205 C115 210 95 214 79 219 C61 225 51 239 47 259 L41 372 L141 372 L143 300 C141 264 134 230 128 205Z';
  let s=bc_neck(H.G,sk,id);
  s+=`<path d="${torso}" fill="${B.base}" stroke="${L}" stroke-width="2.6" stroke-linejoin="round"/>
   <path d="M127 201 C134 222 145 231 150 232 C155 231 166 222 173 201Z" fill="${sk.base}"/><path d="M150 232 C157 231 167 222 173 201 L164 201 C162 216 157 226 150 232Z" fill="${sk.sh}"/>
   <path d="M150 230 C142 250 143 280 146 300 L154 300 C157 280 158 250 150 230Z" fill="${B.sh}" opacity=".6"/>
   <path d="M131 206 C136 222 145 228 150 229 C155 228 164 222 169 206" fill="${sk.base}" stroke="${B.line}" stroke-width="1.6"/>
   <path d="M150 229 C157 228 165 220 169 206 L162 206 C161 216 157 224 150 229Z" fill="${sk.sh}"/>
   <path d="M129 205 C132 216 140 226 150 230 L142 240 C134 232 128 220 126 207Z" fill="${B.base}" stroke="${B.line}" stroke-width="1.4" stroke-linejoin="round"/>
   <path d="M171 205 C168 216 160 226 150 230 L158 240 C166 232 172 220 174 207Z" fill="${B.base}" stroke="${B.line}" stroke-width="1.4" stroke-linejoin="round"/>
   <path d="${panL}" fill="${K.base}" stroke="${L}" stroke-width="2.4" stroke-linejoin="round"/><path d="${ch_mx(panL,150)}" fill="${K.base}" stroke="${L}" stroke-width="2.4" stroke-linejoin="round"/>
   <path d="M221 219 C239 225 249 239 253 259 L259 372 L222 372 C228 330 230 264 221 219Z" fill="${K.sh}"/>
   <path d="M79 219 C65 225 55 235 51 249 C61 241 71 237 83 235Z" fill="${K.hi}" opacity=".55"/>
   <path d="M128 205 C134 230 141 264 143 300 L141 372 L131 372 L133 300 C131 266 125 234 119 208Z" fill="${K.sh}" stroke="${L}" stroke-width="1.6" stroke-linejoin="round"/>
   <path d="${ch_mx('M128 205 C134 230 141 264 143 300 L141 372 L131 372 L133 300 C131 266 125 234 119 208Z',150)}" fill="${K.sh2}" stroke="${L}" stroke-width="1.6" stroke-linejoin="round"/>
   ${[0,1,2,3,4,5,6,7,8].map(i=>{const t=i/8,y=210+t*160,x=123+t*13;return `<path d="M${ch_n(x-.5)} ${ch_n(y)} l7.6 1.2" stroke="${L}" stroke-width=".9" opacity=".4"/><path d="M${ch_n(300-x+.5)} ${ch_n(y)} l-7.6 1.2" stroke="${L}" stroke-width=".9" opacity=".4"/>`}).join('')}
   ${[66,88,214,236].map((x,i)=>`<path d="M${x} ${236+i%2*4} Q${x+(i<2?4:-4)} 300 ${x+(i<2?2:-2)} 372" stroke="${L}" stroke-width="1.1" fill="none" opacity=".35"/>`).join('')}
   ${[318,350].map(y=>`<circle cx="${ch_n(161.5+ (y-300)*.04)}" cy="${y}" r="3.4" fill="url(#${id}pe)" stroke="${L}" stroke-width=".9"/>`).join('')}
   <path d="M98 300 Q112 304 124 300" stroke="${L}" stroke-width="1.2" fill="none" opacity=".5"/>`;
  // pearls around the neck, resting on the blouse
  const pts=ch_bz([[129,212],[136,238],[164,238],[171,212]],14);
  s+=pts.map((p,i)=>`<circle cx="${ch_n(p[0])}" cy="${ch_n(p[1])}" r="3.1" fill="url(#${id}pe)" stroke="#8f7ea0" stroke-width=".8"/><circle cx="${ch_n(p[0]-1)}" cy="${ch_n(p[1]-1.1)}" r=".9" fill="#fff"/>`).join('');
  // brooch: a little gold eighth note
  s+=`<g transform="translate(201 264) rotate(-8)"><path d="M1.6 -12 L1.6 4" stroke="#9a6a16" stroke-width="3" stroke-linecap="round"/><path d="M1.6 -12 L1.6 4" stroke="#f5c84a" stroke-width="1.8" stroke-linecap="round"/><path d="M1.6 -12 C6 -10 9 -7 8 -2 C7 -5 4.6 -6.6 1.6 -7Z" fill="#f5c84a" stroke="#9a6a16" stroke-width="1"/><ellipse cx="-2" cy="4.4" rx="4.6" ry="3.4" transform="rotate(-24 -2 4.4)" fill="#f5c84a" stroke="#9a6a16" stroke-width="1.1"/><ellipse cx="-3.4" cy="3.2" rx="1.4" ry=".9" fill="#fff6c8"/></g>`;
  return s}
// Grace: navy blazer with lapels over a teal shell top, a small silver bridge pin
function bc_graceOutfit(H,id){const sk=H.sk,J=ch_clothPal('#2f4372'),T=ch_clothPal('#2bb3a6'),L=J.line;
  const torso='M128 205 C115 210 95 214 79 219 C61 225 51 239 47 259 L41 372 L259 372 L253 259 C249 239 239 225 221 219 C205 214 185 210 172 205Z';
  const lapL='M131 204 C121 208 113 214 108 220 L96 258 L108 260 L102 270 L141 372 L149 372 L134 300 L128 226Z';
  let s=bc_neck(H.G,sk,id);
  s+=`<path d="${torso}" fill="${J.base}" stroke="${L}" stroke-width="2.6" stroke-linejoin="round"/>
   <path d="M221 219 C239 225 249 239 253 259 L259 372 L222 372 C228 330 230 264 221 219Z" fill="${J.sh}"/>
   <path d="M79 219 C65 225 55 235 51 249 C61 241 71 237 83 235Z" fill="${J.hi}" opacity=".45"/>
   <path d="M128 214 L172 214 L157 372 L143 372Z" fill="${T.base}" stroke="${T.line}" stroke-width="1.5"/><path d="M150 236 L172 214 L157 372 L150 372Z" fill="${T.sh}"/>
   <path d="M129 200 C134 222 166 222 171 200Z" fill="${sk.base}"/><path d="M132 208 C137 226 163 226 168 208 L168 204 L132 204Z" fill="${sk.base}"/><path d="M150 224 C158 224 165 217 168 208 L168 204 L161 204 C161 214 157 221 150 224Z" fill="${sk.sh}"/>
   <path d="M132 208 C137 227 163 227 168 208" stroke="${T.line}" stroke-width="1.7" fill="none"/>
   <path d="${lapL}" fill="${J.base}" stroke="${L}" stroke-width="1.9" stroke-linejoin="round"/><path d="${ch_mx(lapL,150)}" fill="${J.base}" stroke="${L}" stroke-width="1.9" stroke-linejoin="round"/>
   <path d="M128 226 L141 372 L136 372 L122 240Z" fill="${J.sh}"/><path d="${ch_mx('M128 226 L141 372 L132 372 L119 232Z',150)}" fill="${J.sh2}" opacity=".7"/>
   <path d="M108 220 L96 258 L102 258 L112 224Z" fill="${J.hi}" opacity=".5"/>
   <circle cx="150" cy="318" r="3" fill="${J.sh2}" stroke="${L}" stroke-width=".9"/><circle cx="150" cy="350" r="3" fill="${J.sh2}" stroke="${L}" stroke-width=".9"/>
   <path d="M66 300 Q74 330 70 372 M234 300 Q226 330 230 372" stroke="${L}" stroke-width="1.2" fill="none" opacity=".4"/>
   <g transform="translate(208 262) rotate(-10)"><path d="M-11 4 Q0 -8 11 4" stroke="#e2e8f4" stroke-width="2" fill="none"/><path d="M-11 4 H11 M-6 4 V-1 M0 4 V-2.6 M6 4 V-1" stroke="#e2e8f4" stroke-width="1.3"/><path d="M-11 4 Q0 -8 11 4 M-11 4 H11" stroke="#7a86a6" stroke-width=".6" fill="none"/></g>`;
  return s}

// ---------- portraits ----------
const BEA_HAIR={line:'#6e6680',top:'#ffffff',base:'#f1ece8',sh:'#c9c0d2',dk:'#a29ab2',hi:'#ffffff',lash:'#3a2830',brow:'#9a92a6',gloss:.45};
const GRACE_HAIR={line:'#120c10',top:'#4a3c40',base:'#2b1f22',sh:'#1a1214',dk:'#140e10',hi:'#7a6a72',lash:'#1a1014',brow:'#2a1c1e',gloss:.12};
function bc_headband(id,lw){ // lavender silk band over the coils, knotted on the right
  const band='M95 92 C100 58 124 40 150 39 C176 40 200 58 205 92 L198 96 C194 66 174 50 150 50 C126 50 106 66 102 96Z';
  return `<path d="${band}" fill="#b89be0" stroke="#5a3e86" stroke-width="${2*lw}" stroke-linejoin="round"/><path d="M104 84 C110 62 128 48 150 46" stroke="#e6dafa" stroke-width="${2.4*lw}" fill="none" stroke-linecap="round" opacity=".9"/>
    <path d="M150 50 C174 50 194 66 198 96 L205 92 C201 66 182 50 160 46Z" fill="#9a7ccc" opacity=".55"/>
    <g transform="translate(193 60) rotate(28)"><path d="M0 0 C-10 -12 -20 -8 -16 2 C-14 8 -6 6 0 0Z M0 0 C10 -12 20 -8 16 2 C14 8 6 6 0 0Z" fill="#b89be0" stroke="#5a3e86" stroke-width="${1.6*lw}" stroke-linejoin="round"/><ellipse cx="0" cy="0" rx="3.6" ry="4.2" fill="#9a7ccc" stroke="#5a3e86" stroke-width="${1.4*lw}"/><path d="M-12 -3 C-9 -6 -6 -5 -4 -2 M12 -3 C9 -6 6 -5 4 -2" stroke="#e6dafa" stroke-width="1.2" fill="none"/></g>`}
function bc_person(H,body){return `<g class="person">${H.defs}<g><g class="p-body">${body}</g><g class="p-head"><rect x="56" y="-14" width="188" height="${H.G.chin+24}" fill="none"/>${H.back}${H.core}${H.front}</g></g></g>`}
function beaHeadOpts(mood,lw){return {skin:SKIN[4],eye:'#5a3424',mood,age:2,earring:'pearl',hairPal:BEA_HAIR,hair:{kind:'coily',seed:11},extraFront:bc_headband,lw}}
function beaPortrait(mood){const H=bc_head(beaHeadOpts(mood));return bc_person(H,bc_beaOutfit(H,H.id))}
function beaGracePortrait(mood){const H=bc_head({skin:SKIN[3],eye:'#4a2a1a',mood,age:1,glasses:true,frame:'#2a3a5a',earring:'stud',hairPal:GRACE_HAIR,hair:{kind:'crop',seed:5},
  extraFront:(id)=>`<path d="M104 98 Q100 106 101 116 M196 98 Q200 106 199 116" stroke="#b9b0bc" stroke-width="2" fill="none" stroke-linecap="round" opacity=".85"/>`});return bc_person(H,bc_graceOutfit(H,H.id))}

// Wren, Bea's home robot: soft white shell, teal stripe, a dark visor with one light bar (no face), slim arms.
function beaWrenPortrait(mood){const id='bw'+(++CH_N),ln='#7d879e',sh='#d9deea',hi='#ffffff',teal='#16b3a6';
  const bar={happy:'M126 118 Q150 132 174 118',think:'',worried:'M126 122 Q138 116 150 122 Q162 128 174 122',stern:'M128 120 L172 120',sad:'M128 126 Q150 114 172 126',surprised:'M138 120 Q150 110 162 120 Q150 130 138 120'}[mood]??'M126 120 L174 120';
  const light=mood==='think'?`<g class="p-mouth">${[136,150,164].map((x,i)=>`<circle cx="${x}" cy="120" r="4.4" fill="#7ff7e4" class="thinkdot ${i===1?'d2':''}"/>`).join('')}</g>`
    :`<g class="p-mouth"><path d="${bar}" stroke="#7ff7e4" stroke-width="7" stroke-linecap="round" fill="none" opacity=".35" filter="url(#${id}g)"/><path d="${bar}" stroke="#bafff4" stroke-width="3.6" stroke-linecap="round" fill="none"/></g>`;
  return `<g class="person"><defs><linearGradient id="${id}s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#f1f3f9"/><stop offset="1" stop-color="#cfd5e4"/></linearGradient>
     <linearGradient id="${id}v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a3352"/><stop offset="1" stop-color="#151a30"/></linearGradient><filter id="${id}g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter></defs>
   <g class="p-body">
     <path d="M96 372 C92 300 98 246 112 226 C124 210 176 210 188 226 C202 246 208 300 204 372Z" fill="url(#${id}s)" stroke="${ln}" stroke-width="2.6"/>
     <path d="M188 226 C202 246 208 300 204 372 L180 372 C188 320 188 262 178 230Z" fill="${sh}"/>
     <path d="M101 268 C120 276 180 276 199 268 L200 284 C180 292 120 292 100 284Z" fill="${teal}" stroke="#0f7f75" stroke-width="1.6"/>
     <rect x="134" y="300" width="32" height="20" rx="6" fill="#1d2440" stroke="${ln}" stroke-width="1.4"/><circle cx="143" cy="310" r="3" fill="#7ff7e4" class="ig-blink"/><path d="M150 310 h10" stroke="#5ee6d6" stroke-width="2" stroke-linecap="round"/>
     ${[-1,1].map(s=>{const x=150+s*66;return `<circle cx="${x}" cy="240" r="15" fill="url(#${id}s)" stroke="${ln}" stroke-width="2.2"/><circle cx="${x}" cy="240" r="6" fill="${sh}"/>
       <path d="M${x} 252 C${x+s*6} 290 ${x+s*6} 320 ${x+s*2} 372" stroke="${ln}" stroke-width="22" fill="none" stroke-linecap="round"/><path d="M${x} 252 C${x+s*6} 290 ${x+s*6} 320 ${x+s*2} 372" stroke="#f4f6fb" stroke-width="18" fill="none" stroke-linecap="round"/>
       <path d="M${x+s*5} 262 C${x+s*9} 296 ${x+s*9} 322 ${x+s*6} 372" stroke="${sh}" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="${x+s*4}" cy="300" r="5" fill="${teal}" opacity=".8"/>`}).join('')}
     <rect x="134" y="196" width="32" height="22" rx="8" fill="#9aa4be" stroke="${ln}" stroke-width="2"/><path d="M136 204 h28 M136 210 h28" stroke="#7d879e" stroke-width="1.4"/>
   </g>
   <g class="p-head"><rect x="56" y="-14" width="188" height="215" fill="none"/>
     <path d="M150 54 C196 54 222 76 222 118 C222 160 196 190 150 190 C104 190 78 160 78 118 C78 76 104 54 150 54Z" fill="url(#${id}s)" stroke="${ln}" stroke-width="2.8"/>
     <path d="M200 74 C216 90 222 108 220 132 C216 166 192 186 158 189 C190 178 206 156 208 126 C210 104 206 88 200 74Z" fill="${sh}"/>
     <path d="M104 80 C114 68 130 62 146 61" stroke="${hi}" stroke-width="6" stroke-linecap="round" fill="none" opacity=".9"/>
     <path d="M96 104 C96 92 106 88 118 88 L182 88 C194 88 204 92 204 104 L204 136 C204 150 194 156 182 156 L118 156 C106 156 96 150 96 136Z" fill="url(#${id}v)" stroke="#0e1224" stroke-width="2"/>
     <path d="M104 98 C110 93 120 93 132 93" stroke="#5a6a9a" stroke-width="3" stroke-linecap="round" fill="none" opacity=".8"/>
     ${light}
     ${[-1,1].map(s=>`<circle cx="${150+s*74}" cy="122" r="11" fill="url(#${id}s)" stroke="${ln}" stroke-width="2"/><circle cx="${150+s*74}" cy="122" r="5.5" fill="none" stroke="${teal}" stroke-width="2.4"/>`).join('')}
     <path d="M150 54 V40" stroke="${ln}" stroke-width="4" stroke-linecap="round"/><circle cx="150" cy="36" r="6" fill="${teal}" stroke="#0f7f75" stroke-width="1.6" class="ig-blink"/>
   </g></g>`}

// ---------- posed full-body figures (feet at 0,0) ----------
// shared limb helpers: tapered ribbons with an ink outline
function bc_limb(pts,w0,w1,fill,ln,sh){const P=ch_bz(pts.length===3?pts:[pts[0],[(pts[0][0]+pts[1][0])/2,(pts[0][1]+pts[1][1])/2],pts[1]],10);
  const d=ch_rib(P,t=>w0+(w1-w0)*t);return `<path d="${d}" fill="${fill}" stroke="${ln}" stroke-width=".7" stroke-linejoin="round"/>`+(sh?`<path d="${ch_rib(ch_sub(P,.1,.95),t=>(w0+(w1-w0)*t)*.3)}" fill="${sh}" transform="translate(${ch_n(w0*.25)} 0)" opacity=".7"/>`:'')}
// a hand at p pointing along angle a (degrees): palm, four fingers, thumb on side s (+1/-1)
function bc_hand(p,a,s,sk,ln,sc){sc=sc||1;return `<g transform="translate(${ch_n(p[0])} ${ch_n(p[1])}) rotate(${ch_n(a)}) scale(${sc})"><path d="M-1.5 -1.2 C-1.7 .6 -1.3 2 -1 3 L-.5 4 C-.2 4.4 .2 4.4 .3 4 L.6 3.4 L.9 4.1 C1.2 4.4 1.6 4.2 1.6 3.8 L1.6 1 C1.7 -.4 1.5 -1.2 1.4 -1.4Z" fill="${sk}" stroke="${ln}" stroke-width=".42" stroke-linejoin="round"/>
  <path d="M${ch_n(s*1.4)} -.6 C${ch_n(s*2.6)} .2 ${ch_n(s*2.8)} 1.4 ${ch_n(s*2.2)} 2" stroke="${ln}" stroke-width="1.15" stroke-linecap="round" fill="none"/><path d="M${ch_n(s*1.4)} -.6 C${ch_n(s*2.6)} .2 ${ch_n(s*2.8)} 1.4 ${ch_n(s*2.2)} 2" stroke="${sk}" stroke-width=".6" stroke-linecap="round" fill="none"/>
  <path d="M-.5 2.6 V3.6 M.5 2.8 V3.6" stroke="${ln}" stroke-width=".22" opacity=".8"/></g>`}
// the portrait head placed on a figure: center at (x,y), scale s, tilt
function bc_figHead(H,x,y,s,tilt){return `<g transform="translate(${ch_n(x)} ${ch_n(y)}) rotate(${tilt||0}) scale(${s}) translate(-150 -122)">${H.defs}${H.back}${H.core}${H.front}</g>`}
const BEA_FIG_POSES={
  // arm joints: [shoulder, elbow, hand] for left (viewer's left) and right; hand angle; dress: 'day'|'wedding'
  stand:{L:[[-5.6,-44],[-7.4,-35],[-6.4,-27]],R:[[5.6,-44],[7.6,-35],[6.8,-27]],aL:10,aR:-10},
  cane:{L:[[-5.6,-44],[-7.4,-35],[-6.4,-27]],R:[[5.6,-44],[9.4,-36],[11,-28]],aL:10,aR:-6,cane:1},
  waltz:{L:[[-5.8,-44.4],[-9.8,-38],[-12.4,-31.4]],R:[[5.8,-44.4],[10.4,-51],[11.2,-59.6]],aL:20,aR:-170,tilt:5,sway:2,skirt:1},
  cross:{L:[[-5.6,-44],[-7.6,-36],[3.6,-37.6]],R:[[5.6,-44],[7.4,-36],[-3.2,-36]],aL:-80,aR:80,tilt:4},
  clap:{L:[[-5.6,-44],[-8.4,-37],[-1.2,-40.6]],R:[[5.6,-44],[8.4,-37],[1.4,-40.8]],aL:-70,aR:70,sit:1},
  sit:{L:[[-5.6,-44],[-7.6,-36],[-4.4,-30]],R:[[5.6,-44],[7.6,-36],[4.6,-30]],aL:-20,aR:20,sit:1},
  wave:{L:[[-5.6,-44],[-7.4,-35],[-6.4,-27]],R:[[5.6,-44],[12,-49],[13.6,-58]],aL:10,aR:175},
  rail:{L:[[-5.6,-44],[-9.6,-37],[-13.6,-33]],R:[[5.6,-44],[9.6,-37],[13.4,-33]],aL:-40,aR:40},
  sadsit:{L:[[-5.6,-44],[-7,-37],[-2,-31]],R:[[5.6,-44],[7,-37],[2,-31]],aL:-40,aR:40,sit:1,tilt:8}};
function beaFig(pose,o){o=o||{};const Q=BEA_FIG_POSES[pose]||BEA_FIG_POSES.stand,id='bf'+(++CH_N);
  const sk=ch_skinPal(SKIN[4]),ln='#3a2230',wed=o.dress==='wedding';
  const K=ch_clothPal(wed?'#b89be0':'#7d4fa8'),D=ch_clothPal(wed?'#c8b0ea':'#5d6aa8'),mood=o.mood||'smile';
  const H=bc_head({...beaHeadOpts(mood,2.4)});
  const sit=Q.sit,hip=sit?-22:-28,sway=Q.sway||0;
  let legs='',dress='';
  if(sit){ // seated: thighs forward, shins down, shoes
    legs=[-1,1].map(s=>`${bc_limb([[s*2.6,hip],[s*2.6+8,hip+.6]],3.6,3.2,D.base,ln)}${bc_limb([[s*2.6+8,hip+.6],[s*2.4+8.6,-1.6]],3,2.4,sk.base,ln,sk.sh)}<path d="M${s*2.4+6.2} -1.6 C${s*2.4+6.4} -3 ${s*2.4+11.4} -3 ${s*2.4+12} -1 L${s*2.4+12} 0 L${s*2.4+6.2} 0Z" fill="#4a2a4a" stroke="${ln}" stroke-width=".5"/>`).join('');
    dress=`<path d="M-6.2 ${hip-12} L6.2 ${hip-12} L7 ${hip-1} C10 ${hip-.4} 14 ${hip+1} 15 ${hip+5} L-5.6 ${hip+5} C-7 ${hip+2} -7 ${hip-4} -6.2 ${hip-12}Z" fill="${D.base}" stroke="${ln}" stroke-width=".7" stroke-linejoin="round"/>`}
  else{const hem=wed?-9:-13;
    legs=[-1,1].map(s=>`${bc_limb([[s*2.2,hem+1],[s*2.3,-2.2]],2.5,2.1,sk.base,ln,sk.sh)}<path d="M${s*2.3-2.2} -1.4 C${s*2.3-2.2} -3.2 ${s*2.3+2.6} -3.2 ${s*2.3+2.8} -1 C${s*2.3+3} .4 ${s*2.3-2.2} .4 ${s*2.3-2.2} -1.4Z" fill="${wed?'#f0e2ff':'#4a2a4a'}" stroke="${ln}" stroke-width=".5"/>`).join('');
    const fl=wed?3.6:1.6,fx=Q.skirt?3:0;
    dress=`<path d="M-6 -41 C-6.6 -36 -6.6 -32 -6.2 -28 C-8 -22 -${9+fl+fx} ${hem+3} -${10+fl+fx} ${hem-fx*.8} Q0 ${hem+2.4} ${10+fl} ${hem} C${9+fl} ${hem+3} 8 -22 6.2 -28 C6.6 -32 6.6 -36 6 -41Z" fill="${D.base}" stroke="${ln}" stroke-width=".75" stroke-linejoin="round"/>
      <path d="M2 -28 C5 -22 ${7+fl} ${hem+3} ${8+fl} ${hem+.6} L${10+fl} ${hem} C${9+fl} ${hem+3} 8 -22 6.2 -28Z" fill="${D.sh}"/>
      ${wed?`<path d="M-${9+fl} ${hem+1} Q-${4+fl} ${hem+3.4} 0 ${hem+2.2} Q${4+fl} ${hem+3.4} ${9+fl} ${hem+1}" stroke="#fff" stroke-width=".5" fill="none" opacity=".7"/><path d="M-3 -27 L-5.6 ${hem+1} M1 -27 L1.6 ${hem+2} M4 -27 L7 ${hem+1}" stroke="${D.line}" stroke-width=".3" opacity=".5"/>`:''}`}
  // torso: cardigan (day) or the bodice of the wedding dress
  const top=`<path d="M-1.8 -46.8 C-3.6 -46.6 -5.6 -46.2 -6.5 -44.6 C-7.5 -42.4 -7 -37 -6.2 -28 L6.2 -28 C7 -37 7.5 -42.4 6.5 -44.6 C5.6 -46.2 3.6 -46.6 1.8 -46.8Z" fill="${K.base}" stroke="${ln}" stroke-width=".75" stroke-linejoin="round"/>
    <path d="M2.6 -46.4 C4.6 -40 3.8 -34 3.6 -28 L6.2 -28 C7 -37 7.5 -42.4 6.5 -44.6 C5.8 -45.8 4.4 -46.3 2.6 -46.4Z" fill="${K.sh}"/>
    ${wed?`<path d="M-3.4 -45.6 Q0 -42 3.4 -45.6" stroke="${K.line}" stroke-width=".4" fill="none"/><path d="M-6.4 -30 Q0 -28.6 6.4 -30" stroke="#f6e7ff" stroke-width="1.4" fill="none"/>`
      :`<path d="M-2 -46 L0 -38 L2 -46Z" fill="#fbf1e4" stroke="${ln}" stroke-width=".4"/><path d="M0 -38 L-.4 -28 M0 -38 L.4 -28" stroke="${K.line}" stroke-width=".35"/>`}
    ${ch_bz([[-2.4,-46],[-1.4,-43],[1.4,-43],[2.4,-46]],8).map(p=>`<circle cx="${ch_n(p[0])}" cy="${ch_n(p[1])}" r=".42" fill="#fffaf2" stroke="#9a8aa8" stroke-width=".12"/>`).join('')}`;
  const neck=`<path d="M-1.7 -50 L-1.8 -46.2 L1.8 -46.2 L1.7 -50Z" fill="${sk.base}" stroke="${ln}" stroke-width=".5"/><path d="M-1.7 -48.6 Q0 -47.6 1.7 -48.6 L1.75 -47.4 Q0 -46.6 -1.75 -47.4Z" fill="${sk.sh}"/>`;
  const arm=(A,a,s)=>{const sl=wed?null:K;return (sl?bc_limb([A[0],A[1]],2.9,2.5,K.base,ln,K.sh)+bc_limb([A[1],A[2]],2.4,2,sk.base,ln):bc_limb([A[0],A[1]],2.4,2.1,sk.base,ln,sk.sh)+bc_limb([A[1],A[2]],2.1,1.8,sk.base,ln))+bc_hand(A[2],a,s,sk.base,ln,.62)};
  const cane=Q.cane?`<path d="M12 -29 L13.6 0" stroke="#5a3420" stroke-width="1.5" stroke-linecap="round"/><path d="M12 -29 C11.6 -32 8.6 -32.4 8.2 -29.8" stroke="#5a3420" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M12.2 -28.6 L13.4 -2" stroke="#9a6a44" stroke-width=".5"/>`:'';
  const head=bc_figHead(H,sway*.3,-55.2,.094,(Q.tilt||0));
  const chair=sit?`<path d="M-9 -38 C-10 -44 -6 -48 0 -48 C6 -48 10 -44 9 -38 L10 -22 L-10 -22Z" fill="#8a3a4a" stroke="#4a1a26" stroke-width=".7"/><path d="M-11 -22 L17 -22 L17 -16 L-11 -16Z" fill="#a24a5a" stroke="#4a1a26" stroke-width=".7"/><path d="M-10 -16 L-10 0 M15 -16 L15.6 0" stroke="#4a2a1a" stroke-width="1.4" stroke-linecap="round"/>`:'';
  return `<g class="bea-fig"><ellipse cx="2" cy=".4" rx="11" ry="1.8" fill="rgba(31,35,64,.18)"/><g transform="rotate(${sway} 0 0)">${chair}${legs}${dress}${neck}${top}${head}${arm(Q.R,Q.aR,1)}${arm(Q.L,Q.aL,-1)}${cane}</g></g>`}
// Jordan: suit (wedding) or a casual shirt; poses stand, waltz (mirror of Bea's), cheer
function jordanFig(pose,o){o=o||{};const sk=ch_skinPal(SKIN[3]),ln='#2a1a1a',suit=o.suit!==false,J=ch_clothPal(suit?'#2c3550':'#f5b82e'),Pn=ch_clothPal('#2c3550');
  const H=bc_head({skin:SKIN[3],eye:'#4a2a1a',mood:o.mood||'happy',build:'M',hairPal:{line:'#120c0c',top:'#4a3c40',base:'#231a1a',sh:'#140e0e',dk:'#0e0a0a',hi:'#6a5a60',lash:'#140e0e',brow:'#1e1414',gloss:.15},hair:{kind:'crop',seed:3},lw:2.4});
  const Q={stand:{L:[[-6.6,-50],[-8,-40],[-7.4,-31]],R:[[6.6,-50],[8,-40],[7.4,-31]],aL:10,aR:-10},
    waltz:{L:[[-6.8,-50.4],[-12.2,-54.4],[-11.2,-60]],R:[[6.8,-50.4],[8.6,-42],[4.6,-35]],aL:175,aR:60,tilt:-5,back:1},
    cheer:{L:[[-6.6,-50],[-12,-56],[-13,-65]],R:[[6.6,-50],[12,-56],[13,-65]],aL:175,aR:-175}}[pose]||{};
  const legs=[-1,1].map(s=>bc_limb([[s*3,-31],[s*3.2,-2]],3.8,3.2,Pn.base,ln,Pn.sh)+`<path d="M${s*3.2-2.6} -1.6 C${s*3.2-2.6} -3.4 ${s*3.2+3} -3.4 ${s*3.4+3.4} -1 C${s*3.4+3.6} .4 ${s*3.2-2.6} .4 ${s*3.2-2.6} -1.6Z" fill="#1a1416" stroke="${ln}" stroke-width=".5"/>`).join('');
  const torso=`<path d="M-2 -52.8 C-4.2 -52.6 -6.6 -52.2 -7.6 -50.4 C-8.7 -48 -8 -40 -7 -30 L7 -30 C8 -40 8.7 -48 7.6 -50.4 C6.6 -52.2 4.2 -52.6 2 -52.8Z" fill="${J.base}" stroke="${ln}" stroke-width=".75" stroke-linejoin="round"/>
    <path d="M3 -52.4 C5 -44 4.6 -36 4.4 -30 L7 -30 C8 -40 8.7 -48 7.6 -50.4 C6.8 -51.8 5 -52.3 3 -52.4Z" fill="${J.sh}"/>
    ${suit?`<path d="M-2.2 -51.4 L0 -42 L2.2 -51.4Z" fill="#f6f7fb" stroke="${ln}" stroke-width=".4"/><path d="M0 -50.6 L-.9 -48.6 L0 -43.6 L.9 -48.6Z" fill="#b89be0" stroke="${ln}" stroke-width=".3"/><path d="M-2.4 -51.2 L-4.4 -46 L-.6 -40 M2.4 -51.2 L4.4 -46 L.6 -40" stroke="${ln}" stroke-width=".4" fill="none"/><path d="M-5.6 -44.6 l1.6 -.6 l.6 1.4z" fill="#ffd0e0"/>`:`<path d="M-2 -51.4 L0 -47 L2 -51.4" stroke="${ln}" stroke-width=".4" fill="none"/>`}`;
  const neck=`<path d="M-1.9 -56 L-2 -52.2 L2 -52.2 L1.9 -56Z" fill="${sk.base}" stroke="${ln}" stroke-width=".5"/><path d="M-1.9 -54.6 Q0 -53.4 1.9 -54.6 L1.95 -53.4 Q0 -52.4 -1.95 -53.4Z" fill="${sk.sh}"/>`;
  const arm=(A,a,s)=>bc_limb([A[0],A[1]],3.1,2.7,J.base,ln,J.sh)+bc_limb([A[1],A[2]],2.7,2.3,J.base,ln)+bc_hand(A[2],a,s,sk.base,ln,.7);
  const head=bc_figHead(H,0,-61.4,.1,Q.tilt||0);
  return `<g class="jordan-fig"><ellipse cx="0" cy=".4" rx="11" ry="1.8" fill="rgba(31,35,64,.18)"/>${Q.back?arm(Q.R,Q.aR,1):''}${legs}${neck}${torso}${head}${arm(Q.L,Q.aL,-1)}${Q.back?'':arm(Q.R,Q.aR,1)}</g>`}
// Wren, full body (about 58 tall): rounded shell on a wheeled base, visor with a light bar, arms; pose 'stand'|'spot'|'patch'
function wrenFig(pose,o){o=o||{};const ln='#7d879e',sh='#d3d9e6',teal='#16b3a6',bar=o.bar||'M-4 -48 L4 -48';
  const armR=pose==='spot'?'M7 -34 C12 -32 15 -28 17 -26':pose==='patch'?'M7 -34 C12 -36 16 -40 18 -42':'M7 -34 C9 -28 9 -22 8 -17';
  const armL='M-7 -34 C-9 -28 -9 -22 -8 -17';
  const tip=pose==='spot'?[17,-26]:pose==='patch'?[18,-42]:[8,-17];
  return `<g class="wren-fig"><ellipse cx="0" cy=".4" rx="10" ry="1.8" fill="rgba(31,35,64,.2)"/>
   <rect x="-7" y="-6" width="14" height="5" rx="2.5" fill="#9aa4be" stroke="${ln}" stroke-width=".6"/><circle cx="-4.6" cy="-1" r="1.8" fill="#2a3048"/><circle cx="4.6" cy="-1" r="1.8" fill="#2a3048"/>
   <path d="M-8.4 -6 C-9.4 -18 -9 -30 -6.6 -36 C-4 -40 4 -40 6.6 -36 C9 -30 9.4 -18 8.4 -6Z" fill="#f6f8fc" stroke="${ln}" stroke-width=".8"/>
   <path d="M4 -38 C7.6 -32 8.4 -20 7.6 -6 L8.4 -6 C9.4 -18 9 -30 6.6 -36Z" fill="${sh}"/>
   <path d="M-8.8 -24 Q0 -21.6 8.8 -24 L8.9 -21 Q0 -18.6 -8.9 -21Z" fill="${teal}"/>
   <path d="M-1.4 -40 L-1.4 -42.4 L1.4 -42.4 L1.4 -40Z" fill="#9aa4be" stroke="${ln}" stroke-width=".5"/>
   <path d="M0 -58.6 C6.6 -58.6 9.2 -55 9.2 -50 C9.2 -45 6.6 -42 0 -42 C-6.6 -42 -9.2 -45 -9.2 -50 C-9.2 -55 -6.6 -58.6 0 -58.6Z" fill="#f6f8fc" stroke="${ln}" stroke-width=".8"/>
   <rect x="-6.8" y="-53.6" width="13.6" height="7.6" rx="3.2" fill="#1a2038"/><path d="${bar}" stroke="#7ff7e4" stroke-width="1.2" stroke-linecap="round" fill="none"/>
   <circle cx="0" cy="-60.6" r="1.4" fill="${teal}"/><path d="M0 -58.6 V-59.6" stroke="${ln}" stroke-width=".8"/>
   <path d="${armL}" stroke="${ln}" stroke-width="3.4" stroke-linecap="round" fill="none"/><path d="${armL}" stroke="#f6f8fc" stroke-width="2.4" stroke-linecap="round" fill="none"/>
   <path d="${armR}" stroke="${ln}" stroke-width="3.4" stroke-linecap="round" fill="none"/><path d="${armR}" stroke="#f6f8fc" stroke-width="2.4" stroke-linecap="round" fill="none"/>
   <circle cx="-7" cy="-34" r="2" fill="#f6f8fc" stroke="${ln}" stroke-width=".6"/><circle cx="7" cy="-34" r="2" fill="#f6f8fc" stroke="${ln}" stroke-width=".6"/>
   <path d="M${tip[0]-1.4} ${tip[1]} q1.4 2.4 2.8 0" stroke="${ln}" stroke-width="1" fill="none" stroke-linecap="round"/>
   ${pose==='patch'?`<rect x="${tip[0]-2}" y="${tip[1]-4.6}" width="4" height="3.4" rx="1" fill="#ffd6e6" stroke="#c46a8a" stroke-width=".4"/>`:''}</g>`}
