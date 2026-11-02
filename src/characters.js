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
     ey:128,ex:26,ew:27,eh:16.5,irx:8.3,iry:10.4,lash:3.7,wing:1,brow:2.3,by:-9,ny:153,my:170,chin:191,nw:17,ear:118},
  K:{face:'M150 52 C120 52 98 74 98 104 C98 122 99 136 103 150 C107 164 116 175 127 182 C135 187 143 189 150 189 C157 189 165 187 173 182 C184 175 193 164 197 150 C201 136 202 122 202 104 C202 74 180 52 150 52Z',
     ey:132,ex:26,ew:28,eh:21,irx:9.4,iry:11.6,lash:3.1,wing:.6,brow:2,by:-8,ny:156,my:171,chin:189,nw:14,ear:122},
  M:{face:'M150 48 C120 48 96 68 96 100 C96 118 97 132 100 146 C103 160 108 171 119 181 C129 190 140 194 150 194 C160 194 171 190 181 181 C192 171 197 160 200 146 C203 132 204 118 204 100 C204 68 180 48 150 48Z',
     ey:128,ex:27,ew:26,eh:12.8,irx:7.6,iry:8.9,lash:2.9,wing:.25,brow:3.6,by:-8,ny:156,my:174,chin:194,nw:22,ear:118}
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
    <ellipse cx="${ch_n(ix)}" cy="${ch_n(iy+iry*.5)}" rx="${ch_n(irx*.66)}" ry="${ch_n(iry*.34)}" fill="${E.irisGlow}" opacity=".6"/>
    <ellipse cx="${ch_n(ix)}" cy="${ch_n(iy-iry*.02)}" rx="${ch_n(irx*(E.lid==='wide'?.3:.44))}" ry="${ch_n(iry*(E.lid==='wide'?.32:.48))}" fill="${E.pupil}"/>
    <ellipse cx="${ch_n(ix)}" cy="${ch_n(iy)}" rx="${ch_n(irx)}" ry="${ch_n(iry)}" fill="none" stroke="${E.irisLine}" stroke-width="1.1"/>
    <path d="${ch_rib(lidPts,()=>h*.3,-1)}" fill="${E.lidSh}" opacity=".5"/>
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
// returns {back (behind face, in head), front:[{d,fill?}] clumps in paint order, cap, shine:{cx,cy,rx,ry,a0,a1}, body (in p-body, in front of clothes),
//          behind (behind body), extra (after front hair), part:[x,y] flow origin for strand lines}
function ch_hairStyle(st,G,H,o){
  const C=ch_clump;
  if(st==='braids'||st==='long'){
    const back='M84 206 C74 150 74 92 100 64 C116 46 134 40 150 40 C166 40 184 46 200 64 C226 92 226 150 216 206 C200 214 100 214 84 206Z';
    const cap='M86 152 C80 102 96 60 124 46 C134 42 142 40 150 40 C158 40 166 42 176 46 C204 60 220 102 214 152 C210 132 206 116 200 104 L100 104 C94 116 90 132 86 152Z';
    const f=[
      C([86,112],[104,94],[95,212],7,-3),C([196,94],[214,112],[205,212],-3,7),
      C([96,94],[118,62],[100,124],6,0),C([186,62],[206,94],[201,124],0,6),
      C([106,72],[134,52],[114,121],5,1),C([170,52],[196,74],[188,120],1,5),
      C([120,58],[146,48],[131,115],4,1),C([156,48],[182,58],[172,114],1,4),
      C([134,50],[160,47],[148,121],3,3),
      C([118,58],[128,54],[124,103],2,1),C([172,54],[182,58],[177,104],1,2)];
    return {back,cap,front:f,shine:{cx:150,cy:110,rx:60,ry:64,a0:-158,a1:-22,w:12},part:[150,44],
      behind:st==='long'?'M80 160 C66 220 64 300 60 380 L240 380 C236 300 234 220 220 160Z':'',ahoge:st==='braids'}}
  if(st==='bun'){
    const back='M90 152 C82 104 92 64 118 46 C128 40 140 36 150 36 C160 36 172 40 182 46 C208 64 218 104 210 152 C206 162 200 166 196 166 L104 166 C100 166 94 162 90 152Z';
    const cap='M91 138 C85 98 98 60 124 44 C134 38 142 36 150 36 C160 36 170 38 178 42 C206 56 216 98 209 138 C205 124 201 112 195 102 C182 84 166 76 150 76 C134 76 117 84 106 100 C100 110 95 124 91 138Z';
    const f=[
      C([110,56],[124,46],[104,104],3,0),
      C([124,46],[150,38],[170,98],-4,8),C([132,42],[164,38],[192,110],-5,9),
      C([150,38],[184,46],[206,128],-4,8),C([172,42],[198,62],[208,140],-2,5),
      C([118,52],[132,44],[146,90],-2,5)];
    return {back,cap,front:f,shine:{cx:150,cy:104,rx:54,ry:58,a0:-160,a1:-30,w:10},part:[128,44],bun:1}}
  if(st==='elder'){
    const back='M88 160 C80 110 90 62 118 44 C130 38 140 36 150 36 C160 36 170 38 182 44 C210 62 220 110 212 160 C206 172 196 176 190 176 L110 176 C104 176 94 172 88 160Z';
    const cap='M88 146 C82 100 96 58 126 42 C134 38 142 36 150 36 C158 36 166 38 174 42 C204 58 218 100 212 146 C208 128 204 114 198 104 L102 104 C96 114 92 128 88 146Z';
    const f=[C([88,114],[106,96],[94,160],8,-2),C([194,96],[212,114],[206,160],-2,8),
      C([100,88],[126,56],[104,116],8,0),C([118,62],[150,44],[132,104],7,2),C([140,46],[172,48],[166,102],2,8),C([166,52],[198,80],[196,112],0,8)];
    return {back,cap,front:f,shine:{cx:150,cy:108,rx:58,ry:62,a0:-158,a1:-24,w:10},part:[140,42],curly:1}}
  // short (default; also 'buzz')
  const back='M90 160 C80 110 88 60 116 42 C128 36 140 33 150 33 C160 33 172 36 184 42 C212 60 220 110 210 160 C208 170 204 174 200 174 L100 174 C96 174 92 170 90 160Z';
  const cap='M91 132 C85 92 98 52 128 38 C138 34 144 31 152 31 C162 31 172 34 182 40 C208 54 218 92 209 132 C206 118 202 108 197 100 L103 100 C98 108 94 118 91 132Z';
  const f=[
    C([90,104],[103,96],[95,146],4,-1),C([197,96],[210,104],[205,146],-1,4),
    C([98,92],[120,58],[100,116],5,-1),
    C([110,64],[134,46],[118,106],4,0),C([186,52],[206,82],[204,114],-1,5),
    C([124,50],[150,40],[146,104],-2,6),C([140,42],[168,42],[172,104],-3,7),C([158,44],[188,54],[192,108],-2,6),
    C([116,46],[134,38],[110,30],3,3),C([156,34],[178,38],[176,24],2,3)];
  return {back,cap,front:f,shine:{cx:150,cy:104,rx:58,ry:62,a0:-160,a1:-22,w:9},part:[130,40]}}

// shine streaks: short tapered strokes radiating from the part along an elliptical band
function ch_shine(sh,H,seed){let s='';const n=17;
  for(let i=0;i<n;i++){const t=i/(n-1),a=(sh.a0+(sh.a1-sh.a0)*t)*Math.PI/180,j=Math.sin(i*12.9898+seed)*.5+.5;
    const len=sh.w*(1.2+1.3*j)*(i%3===1?1.5:1),r=1+(j-.5)*.08,ux=Math.cos(a),uy=Math.sin(a);
    const x=sh.cx+ux*sh.rx*r,y=sh.cy+uy*sh.ry*r,tx=-uy,ty=ux; // tangent of the band
    // streak runs along the hair flow (radial from the band centre)
    const p0=[x-ux*len*.5,y-uy*len*.5],p1=[x+ux*len*.5+tx*.6,y+uy*len*.5+ty*.6];
    s+=`<path d="${ch_rib(ch_bz([p0,p1],6),ch_swell(1.4+2.2*j,.2))}" fill="${i%4===2?'#ffffff':H.hi}" opacity="${i%4===2?.75:.95}"/>`}
  // soft band under the streaks
  const A=[],B=[];for(let i=0;i<=24;i++){const a=(sh.a0+(sh.a1-sh.a0)*i/24)*Math.PI/180;A.push([sh.cx+Math.cos(a)*sh.rx*1.05,sh.cy+Math.sin(a)*sh.ry*1.05]);B.push([sh.cx+Math.cos(a)*sh.rx*(.93-(i%2)*.04),sh.cy+Math.sin(a)*sh.ry*(.93-(i%2)*.04)])}
  return `<path d="${ch_pl(A.concat(B.reverse()))}Z" fill="${H.hi}" opacity=".35"/>`+s}

// ---------- outfits (inside .p-body) ----------
function ch_outfit(o,G,sk,id,build){
  const nw=G.nw,cx=150;let s='';
  const neck=`M${cx-nw*.82} 150 C${cx-nw*.8} 190 ${cx-nw*.86} 212 ${cx-nw-3} 236 L${cx+nw+3} 236 C${cx+nw*.86} 212 ${cx+nw*.8} 190 ${cx+nw*.82} 150Z`;
  const neckSh=`<path d="M${cx-nw-4} 150 L${cx-nw-4} ${G.chin-8} C${cx-nw*.6} ${G.chin+14} ${cx+nw*.6} ${G.chin+14} ${cx+nw+4} ${G.chin-8} L${cx+nw+4} 150Z" fill="${sk.sh}" clip-path="url(#${id}n)"/>
    <path d="M${cx+nw*.45} 150 C${cx+nw*.5} 190 ${cx+nw*.6} 214 ${cx+nw*.7} 236 L${cx+nw+4} 236 L${cx+nw+4} 150Z" fill="${sk.sh}" clip-path="url(#${id}n)"/>`;
  const neckG=`<clipPath id="${id}n"><path d="${neck}"/></clipPath><path d="${neck}" fill="${sk.base}" stroke="${sk.line}" stroke-width="2"/>${neckSh}`;
  if(o.coat){ // doctor: white coat over a top, stethoscope, badge, pen
    const W=ch_clothPal('#fbfcff'),T=ch_clothPal(o.shirt||'#16b3a6'),L=W.line;
    const torso='M128 224 C114 230 84 234 62 242 C40 250 28 264 24 286 L16 372 L284 372 L276 286 C272 264 260 250 238 242 C216 234 186 230 172 224Z';
    const lapL='M131 219 C122 222 114 227 108 233 L94 270 L105 272 L99 281 L139 372 L147 372 L126 240Z';
    s+=`<path d="M116 216 C128 204 172 204 184 216 L190 238 L110 238Z" fill="${W.sh}" stroke="${L}" stroke-width="2" stroke-linejoin="round"/>`+neckG;
    s+=`<path d="${torso}" fill="${W.base}" stroke="${L}" stroke-width="2.6" stroke-linejoin="round"/>
     <path d="M238 242 C260 250 272 264 276 286 L284 372 L238 372 C244 330 246 286 238 242Z" fill="${W.sh}"/>
     <path d="M62 242 C48 248 36 258 30 274 C40 266 52 260 66 258Z" fill="${W.hi}" opacity=".6"/>
     <path d="M126 236 L174 236 L156 372 L144 372Z" fill="${T.base}" stroke="${T.line}" stroke-width="1.6"/>
     <path d="M150 248 L174 236 L158 372 L150 372Z" fill="${T.sh}"/>
     <path d="M131 228 C136 250 164 250 169 228 L174 236 C166 260 134 260 126 236Z" fill="${T.base}"/>
     <path d="M131 226 C136 248 164 248 169 226 L169 222 L131 222Z" fill="${sk.base}"/>
     <path d="M150 246 C158 246 166 238 169 226 L169 222 L160 222 C160 234 156 242 150 246Z" fill="${sk.sh}" opacity=".8"/>
     <path d="M131 228 C136 249 164 249 169 228" stroke="${T.line}" stroke-width="1.6" fill="none"/>
     <path d="M136 236 Q141 239 146 238.6 M164 236 Q159 239 154 238.6" stroke="${sk.line}" stroke-width="1" fill="none" opacity=".55" stroke-linecap="round"/>
     <path d="${lapL}" fill="${W.base}" stroke="${L}" stroke-width="1.8" stroke-linejoin="round"/>
     <path d="${ch_mx(lapL,150)}" fill="${W.base}" stroke="${L}" stroke-width="1.8" stroke-linejoin="round"/>
     <path d="M126 240 L139 372 L134 372 L120 252Z" fill="${W.sh}" opacity=".9"/><path d="${ch_mx('M126 240 L139 372 L130 372 L118 246Z',150)}" fill="${W.sh2}" opacity=".55"/>
     <path d="M108 233 L94 270 L100 270 L112 238Z" fill="${W.sh}" opacity=".7"/>
     <path d="M70 300 Q78 330 74 372 M228 300 Q222 330 226 372 M44 300 Q52 290 60 296" stroke="${L}" stroke-width="1.2" fill="none" opacity=".45" stroke-linecap="round"/>`;
    // pen pocket + pen (viewer left)
    s+=`<path d="M62 316 L100 312" stroke="${L}" stroke-width="1.4" opacity=".7"/><rect x="82" y="296" width="5" height="22" rx="2" fill="#6c5ce7" stroke="${L}" stroke-width="1" transform="rotate(-6 84 306)"/><rect x="83.5" y="293" width="2" height="12" rx="1" fill="#c9d0e2" transform="rotate(-6 84 306)"/>`;
    // ID badge (viewer right)
    s+=`<g transform="rotate(4 214 306)"><rect x="210" y="282" width="8" height="8" rx="1.5" fill="#9aa4be" stroke="${L}" stroke-width="1"/><rect x="200" y="288" width="28" height="36" rx="4" fill="#ffffff" stroke="${L}" stroke-width="1.4"/><rect x="200" y="288" width="28" height="9" rx="3" fill="${T.base}"/><circle cx="210" cy="306" r="5.5" fill="${sk.base}" stroke="${L}" stroke-width=".8"/><path d="M219 304 h6 M219 309 h6 M204 317 h20" stroke="#9aa4be" stroke-width="1.6" stroke-linecap="round"/><path d="M211.5 291 v4 M209.5 293 h4" stroke="#fff" stroke-width="1.4"/></g>`;
    // stethoscope draped around the neck
    const tube='#2b3354',thi='#6170a8';
    s+=`<path d="M133 214 C122 232 110 262 112 296 C113 318 120 336 124 352" stroke="${tube}" stroke-width="5.4" fill="none" stroke-linecap="round"/><path d="M131 220 C120 238 112 264 113.5 294" stroke="${thi}" stroke-width="1.4" fill="none" opacity=".8" stroke-linecap="round"/>
     <path d="M167 214 C178 232 190 260 188 292 L186 306" stroke="${tube}" stroke-width="5.4" fill="none" stroke-linecap="round"/><path d="M169 220 C180 238 188 262 186.6 290" stroke="${thi}" stroke-width="1.4" fill="none" opacity=".8" stroke-linecap="round"/>
     <path d="M186 304 C184 318 180 330 178 342 M186 304 C190 318 194 328 196 340" stroke="#aab3c8" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M186 304 C184 318 180 330 178 342 M186 304 C190 318 194 328 196 340" stroke="${L}" stroke-width="3.6" fill="none" stroke-linecap="round" opacity=".25"/>
     <circle cx="178" cy="344" r="3" fill="${tube}"/><circle cx="196" cy="342" r="3" fill="${tube}"/>
     <circle cx="124" cy="352" r="10" fill="url(#${id}m)" stroke="${L}" stroke-width="1.6"/><circle cx="124" cy="352" r="5.6" fill="none" stroke="#7d87a3" stroke-width="1.4"/><ellipse cx="120.5" cy="348" rx="3" ry="1.8" fill="#fff" opacity=".8"/>`;
    return s}
  const C=ch_clothPal(o.shirt||'#5b7bd5'),L=C.line;
  if(build==='M'){ // button-up shirt with open spread collar
    const torso='M122 226 C106 234 70 240 46 248 C24 256 12 272 8 294 L2 372 L298 372 L292 294 C288 272 276 256 254 248 C230 240 194 234 178 226Z';
    s+=`<path d="M114 214 C128 204 172 204 186 214 L190 236 L110 236Z" fill="${C.sh}" stroke="${L}" stroke-width="2" stroke-linejoin="round"/>`+neckG;
    s+=`<path d="${torso}" fill="${C.base}" stroke="${L}" stroke-width="2.6" stroke-linejoin="round"/>
     <path d="M254 248 C276 256 288 272 292 294 L298 372 L252 372 C258 330 262 290 254 248Z" fill="${C.sh}"/>
     <path d="M46 248 C30 254 18 266 12 282 C24 272 38 266 52 264Z" fill="${C.hi}" opacity=".5"/>
     <path d="M128 228 L150 272 L172 228Z" fill="${sk.base}"/><path d="M150 272 L172 228 L160 228 C158 246 154 260 150 272Z" fill="${sk.sh}"/>
     <path d="M136 230 Q150 246 164 230 L168 236 Q150 256 132 236Z" fill="#f4f6fb" stroke="${L}" stroke-width="1.2"/>
     <path d="M150 272 L150 372" stroke="${L}" stroke-width="1.6"/><path d="M150 272 L156 280 L156 372" stroke="${L}" stroke-width="1.1" fill="none" opacity=".6"/>
     <circle cx="153" cy="300" r="2.4" fill="#f4f6fb" stroke="${L}" stroke-width="1"/><circle cx="153" cy="338" r="2.4" fill="#f4f6fb" stroke="${L}" stroke-width="1"/>
     <path d="M126 212 C120 226 114 238 108 250 L132 284 L150 272 L130 232Z" fill="${C.base}" stroke="${L}" stroke-width="1.9" stroke-linejoin="round"/>
     <path d="M174 212 C180 226 186 238 192 250 L168 284 L150 272 L170 232Z" fill="${C.base}" stroke="${L}" stroke-width="1.9" stroke-linejoin="round"/>
     <path d="M174 212 C180 226 186 238 192 250 L186 258 C180 244 176 228 170 232Z" fill="${C.sh}"/><path d="M130 232 L150 272 L144 276Z" fill="${C.sh}" opacity=".6"/>
     <path d="M188 296 L226 292 L228 332 Q208 338 190 334Z" fill="${C.sh}" opacity=".35" stroke="${L}" stroke-width="1.3"/><path d="M188 296 L226 292" stroke="${L}" stroke-width="1.6"/>
     <path d="M64 300 Q80 320 78 372 M236 300 Q224 330 228 372 M96 270 Q112 290 116 316 M204 270 Q196 286 194 296" stroke="${L}" stroke-width="1.2" fill="none" opacity=".45" stroke-linecap="round"/>`;
    return s}
  // kid / default: round-neck top with a little white collar
  const torso='M132 222 C120 228 98 232 80 238 C62 244 52 258 48 278 L42 372 L258 372 L252 278 C248 258 238 244 220 238 C202 232 180 228 168 222Z';
  const colL='M150 248 C138 248 124 242 120 228 C112 232 106 238 106 246 C112 260 136 264 150 254Z';
  s+=neckG+`<path d="${torso}" fill="${C.base}" stroke="${L}" stroke-width="2.4" stroke-linejoin="round"/>
   <path d="M220 238 C238 244 248 258 252 278 L258 372 L222 372 C228 330 230 280 220 238Z" fill="${C.sh}"/>
   <path d="M80 238 C66 244 56 254 52 268 C62 260 72 256 84 254Z" fill="${C.hi}" opacity=".55"/>
   <path d="M132 222 C136 240 164 240 168 222 L168 216 L132 216Z" fill="${sk.base}"/><path d="M150 240 C160 238 166 230 168 222 L168 216 L160 216 C160 228 156 236 150 240Z" fill="${sk.sh}"/>
   <path d="${colL}" fill="#fffaf6" stroke="${L}" stroke-width="1.5" stroke-linejoin="round"/><path d="${ch_mx(colL,150)}" fill="#fffaf6" stroke="${L}" stroke-width="1.5" stroke-linejoin="round"/>
   <path d="${ch_mx('M150 254 C136 264 112 260 106 246 C112 256 136 258 150 250Z',150)}" fill="#e3dde8"/>
   <path d="M150 249 L150 372" stroke="${L}" stroke-width="1.1" opacity=".35"/>
   <path d="M86 280 Q96 300 92 330 M214 280 Q206 300 210 330 M70 262 Q76 252 86 252" stroke="${L}" stroke-width="1.2" fill="none" opacity=".45" stroke-linecap="round"/>`;
  const pin=o.pin!==undefined?o.pin:(/maya/i.test(o.name||'')?'violin':null);
  if(pin==='violin')s+=`<g transform="translate(196 284) rotate(-22) scale(.95)"><path d="M0 -14 C-5 -14 -7 -10 -6 -7 C-5 -4 -7 -2 -7 1 C-7 7 -4 11 0 11 C4 11 7 7 7 1 C7 -2 5 -4 6 -7 C7 -10 5 -14 0 -14Z" fill="#c26a2e" stroke="#5a2a10" stroke-width="1.1"/><path d="M-3 -9 C-1 -10 1 -10 3 -9 L2 4 L-2 4Z" fill="#e08a46" opacity=".7"/><path d="M-3.2 -2 q-1 2 0 4 M3.2 -2 q1 2 0 4" stroke="#3a1a08" stroke-width=".9" fill="none"/><rect x="-1.2" y="-26" width="2.4" height="20" rx="1" fill="#2a1a12"/><circle cx="0" cy="-27" r="2.4" fill="#5a2a10"/><rect x="-3" y="5" width="6" height="2" rx="1" fill="#2a1a12"/><path d="M-.6 -24 V6 M.6 -24 V6" stroke="#f2e2b0" stroke-width=".35"/><circle cx="-5" cy="9" r="1.2" fill="#ffd45c"/></g>`;
  return s}

// braids over the shoulders (inside .p-body, in front of clothes)
function ch_braid(x0,y0,x1,y1,H,tie,side){let s='';const n=7;
  for(let i=0;i<n;i++){const t=i/(n-1),x=x0+(x1-x0)*t+Math.sin(t*2.4)*side*3,y=y0+(y1-y0)*t,w=15-4*t,hh=(y1-y0)/(n-1)*.9,rot=(i%2?1:-1)*24;
    s+=`<g transform="translate(${ch_n(x)} ${ch_n(y)}) rotate(${rot})"><ellipse cx="0" cy="0" rx="${ch_n(w*.62)}" ry="${ch_n(hh*.78)}" fill="${H.base}" stroke="${H.line}" stroke-width="1.5"/><path d="M${ch_n(-w*.3)} ${ch_n(-hh*.45)} Q${ch_n(-w*.1)} 0 ${ch_n(-w*.24)} ${ch_n(hh*.5)}" stroke="${H.hi}" stroke-width="1.6" fill="none" opacity=".8"/><path d="M${ch_n(w*.25)} ${ch_n(-hh*.5)} Q${ch_n(w*.42)} 0 ${ch_n(w*.2)} ${ch_n(hh*.55)}" stroke="${H.sh}" stroke-width="2" fill="none" opacity=".8"/></g>`}
  const tx=x1+Math.sin(2.4)*side*3;
  s+=`<path d="M${ch_n(tx-6)} ${ch_n(y1+8)} L${ch_n(tx-9)} ${ch_n(y1+30)} L${ch_n(tx-3)} ${ch_n(y1+22)} L${ch_n(tx)} ${ch_n(y1+34)} L${ch_n(tx+3)} ${ch_n(y1+22)} L${ch_n(tx+9)} ${ch_n(y1+30)} L${ch_n(tx+6)} ${ch_n(y1+8)}Z" fill="${H.base}" stroke="${H.line}" stroke-width="1.4" stroke-linejoin="round"/>
    <rect x="${ch_n(tx-7.5)}" y="${ch_n(y1+3)}" width="15" height="7" rx="3.5" fill="${tie}" stroke="${ch_mix(tie,'#2a0a10',.5)}" stroke-width="1.2"/><circle cx="${ch_n(tx+side*7)}" cy="${ch_n(y1+6.5)}" r="4.6" fill="${tie}" stroke="${ch_mix(tie,'#2a0a10',.5)}" stroke-width="1.2"/><circle cx="${ch_n(tx+side*7-1.4)}" cy="${ch_n(y1+5)}" r="1.4" fill="#fff" opacity=".8"/>`;
  return s}

// ---------- a person (natural-proportion anime bust) ----------
function personSVG(o){o=o||{};
  const id='ch'+(++CH_N),st=({buzz:'short'})[o.hairStyle]||o.hairStyle||'short',kid=o.age==='kid';
  const masc=o.masc!=null?!!o.masc:(st==='short'&&!kid),build=kid?'K':masc?'M':'F',G=CH_FACE[build];
  const md=CH_MOODS[o.mood]||CH_MOODS.smile,sk=ch_skinPal(o.skin||'#f2cdb4'),H=ch_hairPal(o.hair||'#2a211c'),HS=ch_hairStyle(st,G,H,o);
  const iris=o.eye||'#6b4330',elder=st==='elder';
  const E={ew:G.ew,eh:elder?G.eh*.82:G.eh,irx:G.irx,iry:G.iry,lash:G.lash,wing:G.wing,brow:G.brow,kid,lid:md.lid,look:md.look||[0,0],worry:md.worry,tear:md.fx==='tear',
    lashC:ch_mix(H.dk,'#1a0810',.5),skinLine:sk.line,white:'#fffdfb',irisGlow:ch_mix(iris,'#ffc890',.5),pupil:ch_mix(iris,'#0a0410',.78),irisLine:ch_mix(iris,'#0a0410',.6),lidSh:ch_mix(sk.base,'#5a4a8a',.5)};
  const ey=G.ey,ex=G.ex,browY=ey-E.eh/2+G.by,browC=ch_mix(H.dk,sk.line,.3);
  const bs=CH_BROWS[md.brow],bL=Array.isArray(bs[0])?bs[0]:bs,bR=Array.isArray(bs[0])?bs[1]:bs;
  const brows=ch_brow(150-ex,browY,-1,bL,E,browC)+ch_brow(150+ex,browY,1,bR,E,browC);
  // ears
  const earL=`M${99} ${G.ear} C91 ${G.ear-5} 85 ${G.ear+2} 86.5 ${G.ear+13} C88 ${G.ear+24} 92 ${G.ear+33} 100 ${G.ear+35}Z`;
  const ears=[earL,ch_mx(earL,150)].map((d,i)=>`<path d="${d}" fill="${i?sk.sh:sk.base}" stroke="${sk.line}" stroke-width="2"/>`).join('')+
    `<path d="M95 ${G.ear+7} C90.5 ${G.ear+9} 90.5 ${G.ear+18} 94 ${G.ear+25}" stroke="${sk.line}" stroke-width="1.2" fill="none" opacity=".7"/><path d="${ch_mx(`M95 ${G.ear+7} C90.5 ${G.ear+9} 90.5 ${G.ear+18} 94 ${G.ear+25}`,150)}" stroke="${sk.line}" stroke-width="1.2" fill="none" opacity=".7"/>`;
  // hair layers
  const hg=`url(#${id}hg)`,front=HS.front;
  const hairShapes=[HS.cap].concat(front.map(c=>c.d));
  const outlinePass=`<g fill="${H.line}" stroke="${H.line}" stroke-width="3.4" stroke-linejoin="round">${hairShapes.map(d=>`<path d="${d}"/>`).join('')}</g>`;
  let clumps='';front.forEach((c,i)=>{const fill=i%3===1?H.sh:hg;
    clumps+=`<path d="${c.d}" fill="${fill}"/>`;
    // inner strand line + edge ink lines (fading toward the root)
    const mid=[[(c.L[0]+c.R[0])/2,(c.L[1]+c.R[1])/2],[(c.a[2][0]+c.b[1][0])/2,(c.a[2][1]+c.b[1][1])/2],c.T];
    clumps+=`<path d="${ch_rib(ch_sub(ch_bz(mid,12),.25,.85),ch_swell(1.3,.1))}" fill="${H.sh}" opacity=".7"/>`;
    clumps+=`<path d="${ch_rib(ch_sub(ch_bz(c.a,14),.45,1),ch_tap(.2,1.5,.5))}" fill="${H.line}"/><path d="${ch_rib(ch_sub(ch_bz(c.b,14),0,.55),ch_tap(.5,1.5,.2))}" fill="${H.line}"/>`});
  const hairClip=`<clipPath id="${id}hc">${hairShapes.map(d=>`<path d="${d}"/>`).join('')}</clipPath>`;
  const shine=`<g clip-path="url(#${id}hc)">${ch_shine(HS.shine,H,st.length)}</g>`;
  // tendril / ahoge / bun / curls
  let extraBack='',extraFront='';
  if(HS.bun){const bx=150,by=24,r=27;let sc='';for(let i=0;i<14;i++){const a=i/14*Math.PI*2;sc+=`<circle cx="${ch_n(bx+Math.cos(a)*r*.86)}" cy="${ch_n(by+Math.sin(a)*r*.8)}" r="${ch_n(r*.3)}"/>`}
    extraBack+=`<g fill="${H.line}" stroke="${H.line}" stroke-width="3.4">${sc}<ellipse cx="${bx}" cy="${by}" rx="${r}" ry="${r*.92}"/></g><g fill="${hg}">${sc}<ellipse cx="${bx}" cy="${by}" rx="${r}" ry="${r*.92}"/></g>`;
    for(let i=0;i<12;i++){const a=i*2.4,rr=(i%3+1)*6.5,x=bx+Math.cos(a)*rr,y=by+Math.sin(a)*rr*.85;extraBack+=`<path d="M${ch_n(x-3.5)} ${ch_n(y+1)} Q${ch_n(x)} ${ch_n(y-4.5)} ${ch_n(x+3.5)} ${ch_n(y+1)}" stroke="${i%2?H.sh:H.dk}" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".8"/>`}
    extraBack+=`<path d="M${bx-17} ${by-12} Q${bx} ${by-24} ${bx+15} ${by-13}" stroke="${H.hi}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/><path d="M${bx-22} ${by+16} Q${bx} ${by+30} ${bx+22} ${by+16}" stroke="${o.shirt||'#16b3a6'}" stroke-width="5" fill="none"/>`;
    // curly tendril at the part-side temple
    const td=ch_chain([[[100,100],[94,112],[104,120],[98,130]],[[98,130],[92,140],[102,148],[96,158]]],10);
    extraFront+=`<path d="${ch_rib(td,ch_tap(3.2,2.6,.6))}" fill="${H.line}" transform="translate(.6 .6)"/><path d="${ch_rib(td,ch_tap(2.6,2,.4))}" fill="${H.base}"/>`;}
  if(HS.ahoge){const ah=ch_bz([[148,44],[146,24],[162,14],[170,24]],14);extraFront+=`<path d="${ch_rib(ah,ch_tap(3.6,2.4,.4))}" fill="${H.line}" transform="translate(.5 .6)"/><path d="${ch_rib(ah,ch_tap(2.8,1.8,.2))}" fill="${H.base}"/>`}
  if(st==='braids'){const cl=o.clip||'#ff7a6b',cd=ch_mix(cl,'#2a0a10',.5);
    extraFront+=`<g transform="rotate(-28 192 88)"><rect x="180" y="84" width="24" height="6" rx="3" fill="${cl}" stroke="${cd}" stroke-width="1.2"/><rect x="183" y="85.4" width="9" height="1.6" rx=".8" fill="#fff" opacity=".7"/></g><g transform="rotate(-28 197 100)"><rect x="185" y="96" width="24" height="6" rx="3" fill="${ch_mix(cl,'#ffd45c',.45)}" stroke="${cd}" stroke-width="1.2"/></g>`}
  if(HS.curly){for(let i=0;i<9;i++){const a=(-170+i*20)*Math.PI/180,x=150+Math.cos(a)*62,y=100+Math.sin(a)*62;extraFront+=`<path d="M${ch_n(x-4)} ${ch_n(y+2)} Q${ch_n(x)} ${ch_n(y-4)} ${ch_n(x+4)} ${ch_n(y+2)}" stroke="${H.sh}" stroke-width="1.5" fill="none" opacity=".8"/>`}}
  // face shading (cel): hair shadow on forehead, shadow side, under-nose, under-lip
  const faceClip=`<clipPath id="${id}f"><path d="${G.face}"/></clipPath>`;
  const hairSh=`<g clip-path="url(#${id}f)"><g fill="${sk.sh}">${hairShapes.map(d=>`<path d="${ch_tr(d,2.5,6)}"/>`).join('')}</g>
     <path d="M202 96 C204 128 200 152 190 168 C182 180 170 188 158 191 L206 200 L210 90Z" fill="${sk.sh}"/>
     <path d="M196 106 C198 130 194 150 186 164 C180 174 172 181 164 186 C178 176 186 162 189 146 C192 132 193 118 192 106Z" fill="${sk.sh}" opacity=".9"/></g>`;
  const ny=G.ny,my=G.my;
  const nose=`<path d="${ch_rib(ch_bz([[153.5,ny-20],[155.5,ny-10],[155,ny-2]],8),ch_tap(.4,1.4,.6))}" fill="${sk.sh}"/>
    <path d="M${153} ${ny-3.5} Q157.5 ${ny-.5} 155 ${ny+3} Q153 ${ny+1.2} 151.5 ${ny+1}Z" fill="${sk.sh}"/>
    <path d="${ch_rib(ch_bz([[146.5,ny+1],[150,ny+3.4],[154.5,ny+.6]],8),ch_swell(build==='M'?1.6:1.3,.3))}" fill="${sk.line}" opacity=".85"/>
    <ellipse cx="148.6" cy="${ny-3}" rx="1.4" ry="2.2" fill="${sk.hi}" opacity=".85"/>`;
  const lipSh=md.mouth==='happy'||md.mouth==='o'?'':`<path d="M${145} ${my+7.5} Q150 ${my+9.5} ${155} ${my+7.5} Q150 ${my+8.2} ${145} ${my+7.5}Z" fill="${sk.sh}" stroke="${sk.sh}" stroke-width="1.2"/>`+(build==='F'?`<path d="M141.5 ${my+1.6} Q150 ${my+8} 158.5 ${my+1.6} Q150 ${my+5} 141.5 ${my+1.6}Z" fill="${sk.lip}" opacity=".75"/>`:'');
  const blushOp=md.fx==='sparkle'?.7:(md.mood==='sad'?.35:.5)*(kid?1.15:.8);
  const blush=`<ellipse cx="${150-ex-4}" cy="${ey+18}" rx="15" ry="7" fill="url(#${id}b)" opacity="${ch_n(blushOp)}"/><ellipse cx="${150+ex+4}" cy="${ey+18}" rx="15" ry="7" fill="url(#${id}b)" opacity="${ch_n(blushOp)}"/>`+
    (kid?[-1,1].map(s=>[0,1,2].map(j=>`<path d="M${ch_n(150+s*(ex+4)-6+j*5)} ${ey+21} l3 -5" stroke="${sk.blush}" stroke-width="1.1" opacity=".55" stroke-linecap="round"/>`).join('')).join(''):'');
  // glasses
  const gl=o.glasses?(()=>{const fc=o.frame||'#4a2436',x1=150-ex,x2=150+ex,y=ey;
    const lens=(cx)=>`M${cx-19} ${y-9} Q${cx-19} ${y-12} ${cx-15} ${y-12} L${cx+15} ${y-12} Q${cx+19} ${y-12} ${cx+19} ${y-8} L${cx+18} ${y+7} Q${cx+17} ${y+12} ${cx+12} ${y+12} L${cx-13} ${y+12} Q${cx-18} ${y+12} ${cx-18.5} ${y+7}Z`;
    return `<path d="${lens(x1)}" fill="#e8f4ff" opacity=".14"/><path d="${lens(x2)}" fill="#e8f4ff" opacity=".14"/>
      <path d="M${x1-21} ${y-6} L${x1-19} ${y-7} M${x2+19} ${y-7} L${x2+21} ${y-6}" stroke="${fc}" stroke-width="2.4"/>
      <path d="${lens(x1)}" fill="none" stroke="${fc}" stroke-width="2.3"/><path d="${lens(x2)}" fill="none" stroke="${fc}" stroke-width="2.3"/>
      <path d="M${x1+19} ${y-6} Q150 ${y-11} ${x2-19} ${y-6}" stroke="${fc}" stroke-width="2.3" fill="none"/>
      <path d="M${x1-19} ${y-11} L${x1+15} ${y-11.4}" stroke="${ch_mix(fc,'#ffffff',.45)}" stroke-width=".9" opacity=".8"/><path d="M${x2-15} ${y-11.4} L${x2+19} ${y-11}" stroke="${ch_mix(fc,'#ffffff',.45)}" stroke-width=".9" opacity=".8"/>
      <path d="M${x1-10} ${y+9} L${x1+2} ${y-9} M${x1-4} ${y+10} L${x1+6} ${y-5} M${x2-6} ${y+9} L${x2+6} ${y-9}" stroke="#fff" stroke-width="2.2" opacity=".35" stroke-linecap="round"/>`})():'';
  const earring=o.accessory==='earring'?`<circle cx="91" cy="${G.ear+40}" r="4.6" fill="none" stroke="#e8b84a" stroke-width="1.9"/><circle cx="209" cy="${G.ear+40}" r="4.6" fill="none" stroke="#c8962e" stroke-width="1.9"/><circle cx="89.6" cy="${G.ear+36.6}" r="1" fill="#fff6c8"/>`:'';
  // mood effects
  let fx='';
  if(md.fx==='sparkle')fx=ch_star(226,70,9,'#ffd45c','stroke="#fff" stroke-width="1"')+ch_star(240,92,5,'#fff')+ch_star(70,76,6,'#ffe9a0');
  if(md.fx==='sweat')fx=`<path d="M210 96 C214 106 217 112 217 117 C217 122 213 125 209.5 125 C206 125 202 122 202.5 117 C203 112 206 106 210 96Z" fill="#bfe8ff" stroke="#4a9ad8" stroke-width="1.6"/><path d="M206.5 116 Q206.5 120 209 121.5" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  if(md.fx==='tear')fx=`<path d="M${150-ex-12} ${ey+8} C${150-ex-15} ${ey+15} ${150-ex-16} ${ey+19} ${150-ex-14} ${ey+22} C${150-ex-12} ${ey+24.5} ${150-ex-9} ${ey+23} ${150-ex-9.5} ${ey+19.5} C${150-ex-10} ${ey+16} ${150-ex-11} ${ey+12} ${150-ex-12} ${ey+8}Z" fill="#cdeeff" stroke="#5aa9e6" stroke-width="1.2"/>`;
  if(md.fx==='pop')fx=`<path d="M218 58 L228 46 M226 70 L240 64 M82 58 L72 46" stroke="${sk.line}" stroke-width="2.6" stroke-linecap="round"/>`;
  if(md.fx==='dots')fx=`<circle cx="222" cy="66" r="3.2" fill="#fff" stroke="${sk.line}" stroke-width="1.2" class="thinkdot"/><circle cx="231" cy="53" r="4.4" fill="#fff" stroke="${sk.line}" stroke-width="1.2" class="thinkdot d2"/><circle cx="241" cy="38" r="5.8" fill="#fff" stroke="${sk.line}" stroke-width="1.2" class="thinkdot"/>`;
  const browOver=`<g opacity=".42">${brows}</g>`;
  const defs=`<defs><linearGradient id="${id}i" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${ch_mix(iris,'#0a0410',.62)}"/><stop offset=".42" stop-color="${ch_mix(iris,'#0a0410',.2)}"/><stop offset=".78" stop-color="${iris}"/><stop offset="1" stop-color="${ch_mix(iris,'#ffd9a8',.5)}"/></linearGradient>
    <linearGradient id="${id}hg" gradientUnits="userSpaceOnUse" x1="0" y1="20" x2="0" y2="220"><stop offset="0" stop-color="${H.top}"/><stop offset=".35" stop-color="${H.base}"/><stop offset="1" stop-color="${H.sh}"/></linearGradient>
    <radialGradient id="${id}b"><stop offset="0" stop-color="${sk.blush}"/><stop offset="1" stop-color="${sk.blush}" stop-opacity="0"/></radialGradient>
    <radialGradient id="${id}m" cx=".35" cy=".3"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#c9d0e2"/><stop offset="1" stop-color="#8a94b0"/></radialGradient>${faceClip}${hairClip}</defs>`;
  let body=ch_outfit(o,G,sk,id,build);
  if(st==='braids'){const tie=o.clip||'#ff7a6b';body+=ch_braid(98,206,90,318,H,tie,-1)+ch_braid(202,206,210,318,H,tie,1)}
  const behind=HS.behind?`<path d="${HS.behind}" fill="${H.sh}" stroke="${H.line}" stroke-width="2.6"/>`:'';
  const elderLines=elder?`<path d="M${150-ex-17} ${ey+2} l-5 -2 M${150-ex-17} ${ey+6} l-5 1 M${150+ex+17} ${ey+2} l5 -2 M${150+ex+17} ${ey+6} l5 1 M126 ${my-6} Q122 ${my+2} 126 ${my+8} M174 ${my-6} Q178 ${my+2} 174 ${my+8}" stroke="${sk.line}" stroke-width="1.1" opacity=".5" fill="none" stroke-linecap="round"/>`:'';
  return `<g class="person">${defs}<g${kid?' transform="translate(0 20)"':''}>
  ${behind}
  <g class="p-body">${body}</g>
  <g class="p-head"><rect x="56" y="-14" width="188" height="${ch_n(G.chin+24)}" fill="none"/>
    <path d="${HS.back}" fill="${H.dk}" stroke="${H.line}" stroke-width="3"/>${extraBack}
    ${ears}
    <path d="${G.face}" fill="${sk.base}" stroke="${sk.line}" stroke-width="2.4"/>
    ${hairSh}${blush}${nose}${lipSh}${elderLines}${brows}
    <g class="p-eyes">${ch_eye(150-ex,ey,-1,E,id,0)}${ch_eye(150+ex,ey,1,E,id,1)}</g>
    <g class="p-mouth">${ch_mouth(md.mouth,my,kid,sk,build==='M')}</g>
    ${gl}${earring}
    ${outlinePass}<path d="${HS.cap}" fill="${hg}"/>${clumps}${shine}${extraFront}${browOver}${fx}
  </g></g></g>`}
function portrait(o,cls){return `<svg class="portrait ${cls||''}" viewBox="0 0 300 360" preserveAspectRatio="xMidYMax meet" aria-label="${(o&&o.name)||''}">${personSVG(o||{})}</svg>`}

// ---------- Byte, a fluffy robot puppy ----------
function byteSVG(o){o=o||{};
  const id='ch'+(++CH_N),c=o.color||'#f0b35a',ears=o.ears||'floppy',mood=o.mood||'happy',L=ch_lum(c);
  const light=ch_mix(c,'#fffaf2',L>.7?.6:.68),shade=ch_mix(c,'#4a2e6a',L>.7?.2:.26),deep=ch_mix(c,'#2a1640',L>.7?.34:.42),line=ch_mix(c,'#22142e',L>.7?.5:.64),hi=ch_mix(c,'#ffffff',.5);
  const ink='#21182e',[r,g,b]=ch_rgb(c),violet=b>r&&b-g>40,collar=violet?'#ff7a6b':'#6c5ce7',collarD=ch_mix(collar,'#1a0e30',.4);
  const browC=L>.55?ch_mix(c,'#5a3a5a',.42):ch_mix(c,'#fffaf2',.72);
  const OL=(arr,w)=>`<g fill="${line}" stroke="${line}" stroke-width="${w||3.4}" stroke-linejoin="round">${arr.map(d=>`<path d="${d}"/>`).join('')}</g>${arr.map(d=>`<path d="${d}" fill="${c}"/>`).join('')}`;
  // tail (base at 108,116)
  const tail='M104 121 C112 116 120 110 124 100 C127 92 126 84 131 76 C133 72 137 70 139 72 C138 76 142 78 145 76 C146 82 143 86 145 90 C141 92 140 96 141 100 C136 104 133 112 126 118 C120 123 112 126 106 127Z';
  const tailTip='M131 76 C133 72 137 70 139 72 C138 76 142 78 145 76 C146 82 143 86 145 90 C141 92 140 95 140 97 C136 92 132 86 131 76Z';
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
  if(ears==='floppy'){const rot=alert?-24:0;
    earSvg=[floppyL,ch_mx(floppyL,80)].map((d,i)=>`<g transform="rotate(${i?-rot:rot} ${i?108:52} 26)"><path d="${d}" fill="${deep}" stroke="${line}" stroke-width="2.2" stroke-linejoin="round"/><path d="${i?ch_mx('M50 30 C40 32 32 44 30 58 C29 68 31 76 34 80',80):'M50 30 C40 32 32 44 30 58 C29 68 31 76 34 80'}" stroke="${hi}" stroke-width="2" fill="none" opacity=".35" stroke-linecap="round"/><path d="${i?ch_mx('M31 84 C29 86 28 88 30 90 M37 86 C37 88 38 90 40 90',80):'M31 84 C29 86 28 88 30 90 M37 86 C37 88 38 90 40 90'}" stroke="${line}" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>`).join('')}
  else if(ears==='pointy'){earSvg=OL(earsBack,3.2)+`<path d="M47 36 C45 26 44 17 45.5 10 C53 13 60 19 64 26Z" fill="#ffb3c4"/><path d="${ch_mx('M47 36 C45 26 44 17 45.5 10 C53 13 60 19 64 26Z',80)}" fill="#ffb3c4"/><path d="M48 34 L52 26 L53 33 L57 27 L58 33Z" fill="${light}"/><path d="${ch_mx('M48 34 L52 26 L53 33 L57 27 L58 33Z',80)}" fill="${light}"/>`}
  else earSvg=OL(earsBack,3.2)+`<circle cx="47" cy="27" r="8.5" fill="#ffb3c4"/><circle cx="113" cy="27" r="8.5" fill="#ffb3c4"/><path d="M41 22 Q46 18 52 20 M107 20 Q113 18 119 22" stroke="#fff" stroke-width="1.6" fill="none" opacity=".6" stroke-linecap="round"/>`;
  // eyes
  const eye=(x,k)=>{const y=57,rx=alert?10.5:10,ry=alert?12.8:12;
    if(mood==='think'){return `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${ink}"/><ellipse cx="${x-2.5}" cy="${y-1}" rx="7" ry="8.4" fill="url(#${id}e)"/><circle cx="${x-4.6}" cy="${y-6}" r="3.6" fill="#fff"/><circle cx="${x+2.4}" cy="${y+3.6}" r="1.5" fill="#fff"/><path d="M${x-rx-1.5} ${y-3.5} Q${x} ${y-8} ${x+rx+1.5} ${y-5.5} L${x+rx+2} ${y-ry-3} L${x-rx-2} ${y-ry-3}Z" fill="${c}"/><path d="M${x-rx-.5} ${y-3.6} Q${x} ${y-7.8} ${x+rx+.5} ${y-5.6}" stroke="${ink}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`}
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
  <g class="byte-tail" style="transform-origin:108px 116px"><path d="${tail}" fill="${c}" stroke="${line}" stroke-width="2.2" stroke-linejoin="round"/><path d="${tailTip}" fill="${light}"/><path d="M110 122 C118 118 124 110 127 100" stroke="${shade}" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".8"/></g>
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

// ---------- tiny scene people (crowds, walkers, Future Table vignettes) ----------
// Same frame as before: origin at the hips' centre line, feet on y=34. o: {skin, shirt, hair, s, face:'sad'|'happy', cls, style}
function mini(x,y,o){o=o||{};const s=o.s||1,sk=o.skin||SKIN[(x*7|0)%6],sh=o.shirt||PAL.teal,P=ch_skinPal(sk),H=ch_hairPal(o.hair||PAL.ink),C=ch_clothPal(sh);
  const key=String(sh)+String(o.hair)+Math.round(x)+'|'+Math.round(y);let hv=0;for(let i=0;i<key.length;i++)hv=(hv*31+key.charCodeAt(i))|0;
  const styles=['short','bob','tails','pony','short','bun'],stl=o.style||((sh===PAL.coral||sh==='#ff7a6b')?'tails':styles[Math.abs(hv)%styles.length]);
  const ln=ch_mix(P.line,'#1a0a14',.2),f=o.face,eyeC='#2a1a2a';
  const back={bob:`<path d="M-13.5 -7 C-14 -18 -8 -22.5 0 -22.5 C8 -22.5 14 -18 13.5 -7 L13 3 Q0 6 -13 3Z" fill="${H.sh}" stroke="${H.line}" stroke-width=".9"/>`,
    tails:`<path d="M-12 -8 C-19 -6 -20 4 -17 10 C-15 6 -13 2 -11 -2Z M12 -8 C19 -6 20 4 17 10 C15 6 13 2 11 -2Z" fill="${H.base}" stroke="${H.line}" stroke-width=".9"/><circle cx="-13.4" cy="-6" r="1.8" fill="#ff7a6b"/><circle cx="13.4" cy="-6" r="1.8" fill="#ff7a6b"/>`,
    pony:`<path d="M10 -16 C19 -16 21 -6 18 4 C16 -2 13 -6 9 -9Z" fill="${H.base}" stroke="${H.line}" stroke-width=".9"/>`,
    bun:`<circle cx="0" cy="-22" r="5.2" fill="${H.base}" stroke="${H.line}" stroke-width=".9"/>`}[stl]||'';
  const eyes=f==='happy'?`<path d="M-6.6 -3.4 Q-4.4 -6.6 -2.2 -3.4 M2.2 -3.4 Q4.4 -6.6 6.6 -3.4" stroke="${eyeC}" stroke-width="1.3" fill="none" stroke-linecap="round"/>`
    :`<ellipse cx="-4.4" cy="-3.6" rx="2" ry="2.7" fill="${eyeC}"/><ellipse cx="4.4" cy="-3.6" rx="2" ry="2.7" fill="${eyeC}"/><circle cx="-5" cy="-4.5" r=".85" fill="#fff"/><circle cx="3.8" cy="-4.5" r=".85" fill="#fff"/>${f==='sad'?`<path d="M-7 -8 l3.4 -1.2 M7 -8 l-3.4 -1.2" stroke="${H.line}" stroke-width=".9" stroke-linecap="round"/>`:''}`;
  const mouth=f==='happy'?`<path d="M-2.6 1.6 Q0 5.4 2.6 1.6Z" fill="#7a2a3a"/>`:f==='sad'?`<path d="M-2.2 3.6 Q0 1.6 2.2 3.6" stroke="#7a2a3a" stroke-width="1.1" fill="none" stroke-linecap="round"/>`:`<path d="M-1.8 2 Q0 3.4 1.8 2" stroke="#7a2a3a" stroke-width="1" fill="none" stroke-linecap="round"/>`;
  const bangs=stl==='short'?`M-13 -5 C-14.5 -17 -7 -22.5 1 -22 C9 -21.6 14.6 -16 13 -5 Q11.6 -9 10.6 -11 Q10 -7 7.6 -6 Q7.4 -10 5.6 -12.4 Q4 -8.6 1 -7.6 Q.8 -11 -1 -13 Q-3 -9 -6 -7.4 Q-6.2 -10.4 -7.4 -12 Q-9.6 -8.6 -11.4 -6.6Z`
    :`M-13.4 -4 C-15 -17 -7.4 -22.4 0 -22.4 C7.4 -22.4 15 -17 13.4 -4 Q12.4 -8 11 -10.4 Q10.4 -6 8.6 -5 Q8 -9 6 -11.4 Q4.6 -7.6 1.6 -6.6 Q1 -10 -.6 -12 Q-2.6 -8 -5.6 -6.6 Q-5.8 -9.6 -7.2 -11.6 Q-9.4 -7.6 -11.6 -6.2 Q-12.4 -6 -12.6 -2Z`;
  return `<g transform="translate(${x} ${y}) scale(${s})" class="${o.cls||''}"><ellipse cx="0" cy="34" rx="11" ry="3" fill="${PAL.shadow}"/>
   ${back}
   <path d="M-5.6 24 L-5.8 32.4 M5.6 24 L5.8 32.4" stroke="${ln}" stroke-width="5.6" stroke-linecap="round"/><path d="M-5.6 24 L-5.8 32 M5.6 24 L5.8 32" stroke="#3b4068" stroke-width="3.8" stroke-linecap="round"/>
   <ellipse cx="-6.2" cy="33" rx="3.4" ry="1.9" fill="#2a2440"/><ellipse cx="6.2" cy="33" rx="3.4" ry="1.9" fill="#2a2440"/>
   <path d="M-8.4 9 C-11.6 12 -12.6 17 -11.6 21.6 M8.4 9 C11.6 12 12.6 17 11.6 21.6" stroke="${ln}" stroke-width="5.4" fill="none" stroke-linecap="round"/><path d="M-8.4 9 C-11.6 12 -12.6 17 -11.6 21.6 M8.4 9 C11.6 12 12.6 17 11.6 21.6" stroke="${sh}" stroke-width="3.6" fill="none" stroke-linecap="round"/>
   <circle cx="-11.6" cy="22.6" r="2.1" fill="${sk}" stroke="${ln}" stroke-width=".8"/><circle cx="11.6" cy="22.6" r="2.1" fill="${sk}" stroke="${ln}" stroke-width=".8"/>
   <path d="M-8.6 25.6 C-9.8 17 -8 7 0 6.6 C8 7 9.8 17 8.6 25.6 Q0 27.6 -8.6 25.6Z" fill="${sh}" stroke="${ln}" stroke-width="1"/><path d="M3 7.6 C7 9 8.6 16 8 25.4 Q5.6 26.2 4 26.2 C5.6 18 5.4 11 3 7.6Z" fill="${C.sh}" opacity=".8"/>
   <path d="M-3.2 7 Q0 9.6 3.2 7" stroke="${ln}" stroke-width=".9" fill="none"/>
   <circle cx="0" cy="-7.6" r="13" fill="${sk}" stroke="${ln}" stroke-width="1.1"/>
   <path d="M8 -12 C12.6 -6 11 2 5 5 C9.6 -1 9.6 -7 8 -12Z" fill="${P.sh}" opacity=".7"/>
   <ellipse cx="-7.6" cy="1" rx="2.4" ry="1.3" fill="${P.blush}" opacity=".55"/><ellipse cx="7.6" cy="1" rx="2.4" ry="1.3" fill="${P.blush}" opacity=".55"/>
   ${eyes}${mouth}
   <path d="${bangs}" fill="${H.base}" stroke="${H.line}" stroke-width="1" stroke-linejoin="round"/>
   <path d="M-8.6 -15.6 Q0 -21.6 8.6 -15.6" stroke="${H.hi}" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".85"/>
  </g>`}
