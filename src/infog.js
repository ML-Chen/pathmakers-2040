// infog.js — Byte's animated infographics: one small looping picture per sentence (Eigenbook style).
// Each VIZ[kind](args) returns an SVG string. Animations are CSS (classes prefixed "ig-"), looping and calm.
const IG={ink:'#1f2340',soft:'#8a90b0',line:'#dfe3f3',teal:'#16b3a6',violet:'#6c5ce7',coral:'#ff7a6b',gold:'#f5b82e',red:'#e5484d',green:'#1fa774',bone:'#fff3dc',boneS:'#e8d3a8',skin:'#f6cfb4',skinS:'#e7ae8e',cast:'#fff7e0',blue:'#5b9bf0'};
function igFrame(w,h,inner,label){return `<svg class="ig" viewBox="0 0 ${w} ${h}" role="img" aria-label="${typeof T==='function'?T(label||''):label||''}">${inner}</svg>`}
function igT(x,y,t,o={}){return `<text x="${x}" y="${y}" font-size="${o.s||11}" font-weight="${o.w||700}" fill="${o.c||IG.ink}" text-anchor="${o.a||'middle'}" font-family="Nunito, sans-serif">${typeof T==='function'?T(t):t}</text>`}
let IGN=0;const igId=p=>p+(++IGN);
const IGK={line:'#c98a6a',nail:'#fbe3d6',crack:'#7a4a2a'};
// A long bone lying along x from 0 to L (centre line y=0). rA/rB = knob radius at each end, w = half the shaft width.
// The ends flare out of the shaft with smooth curves and finish in two rounded condyles, like a textbook bone.
function igBonePath(L,rA,rB,w){const f=v=>+v.toFixed(2);
  return `M${f(rA)} ${f(-rA)} C${f(rA*2.1)} ${f(-rA)} ${f(rA*2.3)} ${f(-w)} ${f(rA*3.4)} ${f(-w)} L${f(L-rB*3.4)} ${f(-w)} C${f(L-rB*2.3)} ${f(-w)} ${f(L-rB*2.1)} ${f(-rB)} ${f(L-rB)} ${f(-rB)}`+
   ` C${f(L-rB*.15)} ${f(-rB)} ${f(L)} ${f(-rB*.62)} ${f(L)} ${f(-rB*.24)} Q${f(L-rB*.32)} 0 ${f(L)} ${f(rB*.24)} C${f(L)} ${f(rB*.62)} ${f(L-rB*.15)} ${f(rB)} ${f(L-rB)} ${f(rB)}`+
   ` C${f(L-rB*2.1)} ${f(rB)} ${f(L-rB*2.3)} ${f(w)} ${f(L-rB*3.4)} ${f(w)} L${f(rA*3.4)} ${f(w)} C${f(rA*2.3)} ${f(w)} ${f(rA*2.1)} ${f(rA)} ${f(rA)} ${f(rA)}`+
   ` C${f(rA*.15)} ${f(rA)} 0 ${f(rA*.62)} 0 ${f(rA*.24)} Q${f(rA*.32)} 0 0 ${f(-rA*.24)} C0 ${f(-rA*.62)} ${f(rA*.15)} ${f(-rA)} ${f(rA)} ${f(-rA)}Z`}
function igBone(L,rA,rB,w,o={}){return `<path d="${igBonePath(L,rA,rB,w)}" fill="${IG.bone}" stroke="${IG.boneS}" stroke-width="${o.sw||1.5}" stroke-linejoin="round" class="${o.cls||''}"/>`+
  `<path d="M${rA*3.1} ${w*.42} H${L-rB*3.1}" stroke="${IG.boneS}" stroke-width="${w*.34}" stroke-linecap="round" opacity=".45"/>`+
  `<path d="M${rA*3.1} ${-w*.4} H${L-rB*3.1}" stroke="#fff" stroke-width="${w*.3}" stroke-linecap="round" opacity=".85"/>`}
// a jagged fracture line across a bone at x=bx, as a list of points from top to bottom
const igFrac=(bx,w)=>[[bx+1,-w-8],[bx+1,-w],[bx-3,-w*.35],[bx+3,w*.15],[bx-2,w*.65],[bx+.5,w],[bx+.5,w+8]];
// clip a shape to the left (side<0) or right (side>0) of a fracture line
function igSplit(id,pts,side){const far=side<0?-400:400,p=pts.map(q=>q.join(' ')).join(' L');
  return `<clipPath id="${id}"><path d="M${far} ${pts[0][1]} L${p} L${far} ${pts[pts.length-1][1]}Z"/></clipPath>`}
// Smooth Catmull-Rom curve through points, as SVG Bezier segments; igLerp reads a y value off a sorted [x,y] table.
const igCR=pts=>{const P=i=>pts[Math.max(0,Math.min(pts.length-1,i))],f=v=>+v.toFixed(2);let d=`M${f(pts[0][0])} ${f(pts[0][1])}`;
  for(let i=0;i<pts.length-1;i++){const a=P(i-1),b=P(i),c=P(i+1),e=P(i+2);
    d+=` C${f(b[0]+(c[0]-a[0])/6)} ${f(b[1]+(c[1]-a[1])/6)} ${f(c[0]-(e[0]-b[0])/6)} ${f(c[1]-(e[1]-b[1])/6)} ${f(c[0])} ${f(c[1])}`}
  return d};
const igLerp=(T,x)=>{if(x<=T[0][0])return T[0][1];for(let i=1;i<T.length;i++)if(x<=T[i][0]){const [x0,y0]=T[i-1],[x1,y1]=T[i];return y0+(y1-y0)*(x-x0)/(x1-x0)}return T[T.length-1][1]};
// A rounded, slightly lopsided blob (wrist bones, callus, gel) centred on (cx,cy).
const igBlob=(cx,cy,rx,ry,rot=0)=>`<path transform="translate(${cx} ${cy}) rotate(${rot})" d="M${-rx} 0 C${-rx} ${-ry*.62} ${-rx*.52} ${-ry} ${rx*.08} ${-ry} C${rx*.7} ${-ry} ${rx} ${-ry*.5} ${rx} ${ry*.06} C${rx} ${ry*.62} ${rx*.55} ${ry} ${-rx*.04} ${ry} C${-rx*.66} ${ry} ${-rx} ${ry*.56} ${-rx} 0Z"/>`;
// A short bone with a waist (finger bones, hand bones) from x=0 to x=L, end radii r0 and r1.
const igPhal=(L,r0,r1)=>`M0 ${-r0} C${L*.32} ${-r0*.68} ${L*.68} ${-r1*.68} ${L} ${-r1} C${L+r1*.85} ${-r1} ${L+r1*.85} ${r1} ${L} ${r1} C${L*.68} ${r1*.68} ${L*.32} ${r0*.68} 0 ${r0} C${-r0*.85} ${r0} ${-r0*.85} ${-r0} 0 ${-r0}Z`;
// A finger or thumb along +x: its base starts at x=-8 (hidden inside the palm) and it tapers to a rounded tip at x=L.
const igDigit=(L,wb,wt)=>{const f=v=>+v.toFixed(2),m=wt+(wb-wt)*.3;
  return `M-8 ${-wb} C${f(L*.3)} ${-wb} ${f(L*.62)} ${f(-m)} ${f(L-wt)} ${-wt} C${f(L-wt*.3)} ${-wt} ${f(L+.3)} ${f(-wt*.62)} ${f(L+.3)} 0 C${f(L+.3)} ${f(wt*.62)} ${f(L-wt*.3)} ${wt} ${f(L-wt)} ${wt} C${f(L*.62)} ${f(m)} ${f(L*.3)} ${wb} -8 ${wb}Z`};
// Maya's left forearm and hand, palm up, seen from above like an X-ray: elbow on the left (faded out), fingers to the
// right, thumb on top. Proportions follow an 11-year-old: the hand (wrist crease to fingertip) is about 70% as long as
// the forearm, the forearm tapers from the elbow to a narrow wrist, and the palm is wider than the wrist.
// Inside: the radius on the thumb side (top), the ulna on the pinky side, eight wrist bones, and the hand and finger bones.
const IGARM=(()=>{
  const top=[[-24,-19.6],[-4,-20.4],[18,-20.1],[40,-18.6],[62,-16.4],[84,-14.6],[100,-13.6],[109,-13.4],[120,-14.4],[134,-16.6],[147,-18.3],[155,-18.8]];
  const tip=[[159.5,-14],[161.2,-5],[160.6,5],[157,13]];
  const bot=[[151,17.8],[140,19.6],[127,18.6],[116,15.6],[109,13.8],[100,14],[84,15.4],[62,17.4],[40,19],[18,20.4],[-4,20.8],[-24,20.6]];
  return {top,bot:[...bot].reverse(),
    body:igCR([...top,...tip,...bot])+'Z',
    shade:igCR(bot.map(([x,y])=>[x,y-2.4]).reverse()),
    fingers:[ // where each finger leaves the palm, its angle, length, and half-widths at the base and the tip
      {x:155.4,y:-13.4,a:-6,L:33,wb:4.5,wt:3.5},
      {x:158.6,y:-4,a:-.5,L:36.5,wb:4.7,wt:3.6},
      {x:157.6,y:5.2,a:5,L:33.5,wb:4.5,wt:3.4},
      {x:153.4,y:13.2,a:11,L:26.5,wb:3.9,wt:3}],
    thumb:{x:117,y:-9.6,a:-33,L:49,wb:8.2,wt:4.3},
    R:{x:-14,y:-7.4,a:.55,L:120,rA:3.6,rB:7,w:3.2}, // radius: thin at the elbow, wide at the wrist
    U:{x:-26,y:8.8,a:-.35,L:130,rA:6.2,rB:3.7,w:2.9}, // ulna: wide at the elbow, thin at the wrist
    K:72}})();
// opts: crack, cast, pins, gel, splint, crooked, glow. The drawing spans about x -24..196, y -37..25 around (x,y).
function igArm(x,y,o={}){const fade=igId('igf'),cut=igId('igc'),cl=igId('igl'),cr=igId('igr'),out=igId('igo'),cc=igId('igk');
  const A=IGARM,f=v=>+v.toFixed(2),K=A.K,w=A.R.w,T=d=>`translate(${d.x} ${d.y}) rotate(${d.a})`;
  const frac=[[K+.6,-w-6],[K+.6,-w],[K-1.7,-w*.35],[K+1.7,w*.15],[K-1.1,w*.65],[K+.3,w],[K+.3,w+6]];
  const fracD=frac.slice(1,-1).map((q,i)=>(i?'L':'M')+q[0]+' '+q[1]).join(' ');
  const rBone=igBone(A.R.L,A.R.rA,A.R.rB,w,{cls:o.glow?'ig-glowbone':''});
  const radius=o.crooked
    ?`<defs>${igSplit(cl,frac,-1)}${igSplit(cr,frac,1)}</defs><g clip-path="url(#${cl})">${rBone}</g>
      <g transform="rotate(10 ${K} 0) translate(.8 .7)"><g clip-path="url(#${cr})">${rBone}</g></g>
      <g fill="${IG.bone}" stroke="${IG.boneS}" stroke-width="1.1">${igBlob(K+.6,.6,7.2,5.4,6)}</g>
      <path d="M${K-4} -2.2 C${K-2} -3.6 ${K+1} -2.4 ${K+3} -3.4 M${K-3.4} 3 C${K-1.4} 4.2 ${K+1.4} 3.2 ${K+3.6} 4.2" stroke="${IG.boneS}" stroke-width=".8" fill="none" stroke-linecap="round"/>`
    :rBone;
  const dig=d=>`<path transform="${T(d)}" d="${igDigit(d.L,d.wb,d.wt)}"/>`;
  const digits=[...A.fingers].reverse().map(dig).join('')+dig(A.thumb),shapes=`<path d="${A.body}"/>${digits}`;
  // bones of the hand: wrist bones in two rows, a hand bone to each finger, then three finger bones (two in the thumb)
  const bone=(x0,y0,x1,y1,r0,r1)=>{const L=Math.hypot(x1-x0,y1-y0),a=Math.atan2(y1-y0,x1-x0)*180/Math.PI;return `<path transform="translate(${f(x0)} ${f(y0)}) rotate(${f(a)})" d="${igPhal(f(L),r0,r1)}"/>`};
  const carpals=[[112.6,-8.2,3.7,2.5,-32],[113.2,-1.8,2.8,2.9,0],[112.8,4.4,2.6,2.4,18],[111.4,9.2,1.8,1.7,0],[119,-11.4,2.5,2.5,-20],[119.8,-6.4,2.1,2.2,0],[120.6,-.8,3.3,2.9,0],[120,5.4,2.9,2.7,14]].map(c=>igBlob(...c)).join('');
  const bases=[[123.6,-7.6],[124.6,-1.4],[123.8,4.2],[122.8,8.6]];
  const hand=A.fingers.map((d,i)=>{const r=d.a*Math.PI/180,hx=d.x-3.6*Math.cos(r),hy=d.y-3.6*Math.sin(r);
      const ph=[[-.4,.44,2.05,1.85],[.47,.71,1.75,1.55],[.74,1,1.45,1.35]].map(([a,b,r0,r1])=>{const x0=a<0?a:d.L*a+.6,x1=b<1?d.L*b:d.L-2.6;return `<path transform="translate(${f(x0)} 0)" d="${igPhal(f(x1-x0),r0,r1)}"/>`}).join('');
      return bone(bases[i][0],bases[i][1],hx,hy,2.1,2.5)+`<g transform="${T(d)}">${ph}</g>`}).join('')
    +`<g transform="${T(A.thumb)}"><path transform="translate(3.4 0)" d="${igPhal(16.4,2.5,2.4)}"/><path transform="translate(22.4 0)" d="${igPhal(11.6,2.2,1.9)}"/><path transform="translate(36.6 0)" d="${igPhal(9.6,1.8,1.5)}"/></g>`;
  // palm and finger creases
  const crease=d=>[.1,.5,.76].map(t=>{const cx=d.L*t,h=d.wb+(d.wt-d.wb)*t-.9;return `M${f(cx)} ${f(-h)} C${f(cx+1.2)} ${f(-h*.35)} ${f(cx+1.2)} ${f(h*.35)} ${f(cx)} ${f(h)}`}).join(' ');
  const lines=`<g fill="none" stroke="${IGK.line}" stroke-linecap="round" opacity=".42" stroke-width=".9">
     <path d="M146 -15.6 C135 -12.6 123 -7 115 2.4"/><path d="M145.4 -14.6 C141 -6 137 3 133.6 11"/><path d="M147.6 16.4 C151.6 8 153.6 -.6 152.4 -8.6"/>
     <path d="M110.6 -11.6 C109 -4 109 4 110.6 11.6"/>
     ${A.fingers.map(d=>`<path transform="${T(d)}" d="${crease(d)}"/>`).join('')}
     <path transform="${T(A.thumb)}" d="M${A.thumb.L*.74} -3.8 C${A.thumb.L*.74+1.2} -1.3 ${A.thumb.L*.74+1.2} 1.3 ${A.thumb.L*.74} 3.8"/></g>`;
  const top=x=>igLerp(A.top,x),bot=x=>igLerp(A.bot,x);
  const castD=igCR([[-7,-24.6],[20,-24.4],[50,-21.6],[80,-18.6],[104,-17.2],[116,-17.6],[132,-19.6],[146,-21.6]])
     +` C150 -21.8 151.6 -19 151.8 -15 C152.4 -4 151.4 7 147.6 17 C146.6 19.8 145 21.4 142 21.6`
     +igCR([[142,21.6],[128,20.6],[114,18.2],[100,18],[80,19.6],[50,21.8],[20,24.2],[-7,24.8]]).replace(/^M[^C]*/,' ')+` C-10.6 12 -10.6 -12 -7 -24.6Z`;
  const rail=(xs,yf,d0,d1)=>igCR(xs.map(x=>[x,yf(x)+d0]))+' L'+igCR(xs.map(x=>[x,yf(x)+d1]).reverse()).slice(1)+'Z';
  const parts=[
   `<g fill="${IGK.line}" stroke="${IGK.line}" stroke-width="3.2" stroke-linejoin="round">${shapes}</g>`,
   `<g fill="${IG.skin}">${shapes}</g>`,
   `<g clip-path="url(#${cut})"><path d="${A.shade}" stroke="${IG.skinS}" stroke-width="6" fill="none" stroke-linecap="round" opacity=".5"/></g>`,
   `<g clip-path="url(#${out})" fill="none" stroke="${IGK.line}" stroke-width="1.6" stroke-linejoin="round">${digits}</g>`,
   lines,
   `<g clip-path="url(#${cut})">`,
   `<g transform="translate(${A.U.x} ${A.U.y}) rotate(${A.U.a})">${igBone(A.U.L,A.U.rA,A.U.rB,A.U.w)}</g>`,
   `<g fill="${IG.bone}" stroke="${IG.boneS}" stroke-width=".8" stroke-linejoin="round" opacity=".92">${carpals}${hand}</g>`,
   `<g transform="translate(${A.R.x} ${A.R.y}) rotate(${A.R.a})">${radius}
     ${o.crack?`<path d="${fracD}" stroke="${IG.red}" stroke-width="2.6" fill="none" stroke-linejoin="round" opacity=".55" class="ig-blink"/><path d="${fracD}" stroke="${IGK.crack}" stroke-width="1.1" fill="none" stroke-linejoin="round"/>`:''}
     ${o.gel?`<g fill="${IG.violet}" opacity=".5" class="ig-gel">${igBlob(K,0,8.6,5.4)}</g>`:''}
     ${o.pins?`<g class="ig-pop"><rect x="${K-16}" y="-2.2" width="32" height="4.4" rx="2.2" fill="#aeb8d0" stroke="#7c87a6" stroke-width=".9"/>${[-11.5,-4.5,4.5,11.5].map(px=>`<circle cx="${K+px}" cy="0" r="1.7" fill="#d5dcec" stroke="#7c87a6" stroke-width=".8"/><path d="M${K+px-1} 0 h2" stroke="#7c87a6" stroke-width=".7"/>`).join('')}</g>`:''}
   </g></g>`,
   o.crack?`<g transform="translate(${A.R.x} ${A.R.y}) rotate(${A.R.a})"><g class="ig-blink" stroke="${IG.red}" stroke-width="1.8" stroke-linecap="round">${[-150,-90,-30].map(a=>{const r=a*Math.PI/180;return `<path d="M${f(K+12*Math.cos(r))} ${f(12*Math.sin(r)-1)} L${f(K+17*Math.cos(r))} ${f(17*Math.sin(r)-1)}"/>`}).join('')}</g></g>`:'',
   o.cast?`<g class="ig-pop"><defs><clipPath id="${cc}"><path d="${castD}"/></clipPath></defs><path d="${castD}" fill="${IG.cast}" stroke="#d9c58e" stroke-width="1.8" stroke-linejoin="round" opacity=".97"/>
      <g clip-path="url(#${cc})" stroke="#e6d6a6" stroke-width="1.4" fill="none">${[4,22,40,58,76,94,112,130].map(cx=>`<path d="M${cx} -30 C${cx+5} -8 ${cx+5} 8 ${cx-1} 30"/>`).join('')}</g>
      <path d="M-7 -24.6 C-10.6 -12 -10.6 12 -7 24.8" stroke="#efe3bd" stroke-width="4.4" fill="none" stroke-linecap="round"/>
      <path transform="translate(30 0) scale(.82)" d="M0 -4 c-3 -5 -10 -2 -6 4 l6 6 l6 -6 c4 -6 -3 -9 -6 -4z" fill="#ffb3c7"/><path transform="translate(82 -1) scale(.72)" d="M0 -6 l2.4 5 l5.4 .6 l-4 3.6 l1.2 5.4 l-5 -2.8 l-5 2.8 l1.2 -5.4 l-4 -3.6 l5.4 -.6z" fill="#b9b2f5"/></g>`:'',
   o.splint?`<g class="ig-pop">${(()=>{const xt=[-6,10,30,50,70,90,108],xb=[-6,10,30,50,70,90,110,128,142];
       return `<path d="${rail(xt,top,-4.4,.4)}" fill="#cfd6ea" stroke="#9aa6c6" stroke-width="1.1" stroke-linejoin="round"/><path d="${rail(xb,bot,-.4,4.4)}" fill="#cfd6ea" stroke="#9aa6c6" stroke-width="1.1" stroke-linejoin="round"/>`
        +[12,52,96].map(sx=>`<path d="M${sx} ${f(top(sx)-4.4)} C${sx+5} -7 ${sx+5} 7 ${sx} ${f(bot(sx)+4.4)}" stroke="#8f9bbd" stroke-width="5.4" fill="none" stroke-linecap="round" opacity=".92"/>`).join('')
        +`<rect x="${32}" y="${f(top(40)-9)}" width="16" height="7.4" rx="3.7" fill="#2a3060"/><circle cx="40" cy="${f(top(40)-5.3)}" r="2.1" fill="#7ff7e4" class="ig-blink"/>`})()}</g>`:''];
  return `<g transform="translate(${x} ${y})"><defs><linearGradient id="${fade}" gradientUnits="userSpaceOnUse" x1="-26" x2="-4"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient>
    <mask id="${fade}m" maskUnits="userSpaceOnUse" x="-40" y="-60" width="280" height="120"><rect x="-40" y="-60" width="280" height="120" fill="url(#${fade})"/></mask>
    <clipPath id="${cut}">${shapes}</clipPath><clipPath id="${out}"><path clip-rule="evenodd" d="M-90 -90 H300 V90 H-90Z ${A.body}"/></clipPath></defs><g mask="url(#${fade}m)">${parts.join('')}</g></g>`}
// A close-up of one bone across the frame, broken in the middle, for the healing lesson and the gel picture.
// gap = how far apart the two pieces sit. Returns the two pieces; the caller draws what fills the gap.
function igBrokenBone(gap,o={}){const L=220,cx=110,w=10,f=igFrac(cx,w),l=igId('igbl'),r=igId('igbr');
  const bone=igBone(L,13,13,w,{sw:2});
  return `<defs>${igSplit(l,f,-1)}${igSplit(r,f,1)}</defs><g transform="translate(${-gap/2} 0)"><g clip-path="url(#${l})">${bone}</g></g><g transform="translate(${gap/2} ${o.drop||0})"><g clip-path="url(#${r})">${bone}</g></g>
   ${o.edges===false?'':`<path d="M${f.slice(1,-1).map(q=>(q[0]-gap/2)+' '+q[1]).join(' L')}" stroke="${IG.boneS}" stroke-width="2" fill="none" stroke-linejoin="round"/><path d="M${f.slice(1,-1).map(q=>(q[0]+gap/2)+' '+(q[1]+(o.drop||0))).join(' L')}" stroke="${IG.boneS}" stroke-width="2" fill="none" stroke-linejoin="round"/>`}`}
// a lumpy spindle that wraps the break (blood clot, soft callus, hard callus)
const igLump=(rx,ry)=>`M${110-rx} 1 C${110-rx} ${-ry*.7} ${110-rx*.55} ${-ry} ${110-rx*.2} ${-ry*.92} C${110} ${-ry*1.08} ${110+rx*.35} ${-ry*.9} ${110+rx*.6} ${-ry*.95} C${110+rx*.95} ${-ry*.8} ${110+rx} ${-ry*.3} ${110+rx} 1 C${110+rx} ${ry*.6} ${110+rx*.6} ${ry} ${110+rx*.2} ${ry*.95} C${110-rx*.15} ${ry*1.05} ${110-rx*.5} ${ry*.9} ${110-rx*.7} ${ry*.85} C${110-rx*.95} ${ry*.7} ${110-rx} ${ry*.4} ${110-rx} 1Z`;
// 100 tiny kids, `n` colored. loop-fills in a wave.
function igKids(n,col,o={}){const W=o.w||300;let s='';const cell=W/20;
  for(let i=0;i<100;i++){const r=Math.floor(i/20),c=i%20,x=c*cell+cell/2,y=r*cell*1.25+cell*.75;const on=i<n;
    s+=`<g class="ig-kid ${on?'on':''}" style="--d:${(i*0.022).toFixed(2)}s;--c:${col}"><circle cx="${x}" cy="${y-cell*.18}" r="${cell*.2}"/><rect x="${x-cell*.22}" y="${y+cell*.02}" width="${cell*.44}" height="${cell*.34}" rx="${cell*.15}"/></g>`}
  return s}
const VIZ={
  healStage:({s})=>{const T=[0,[6,3],[6,1],[4,0],[0,0]][s]||[0,0];
    const cells=(col,n,sp)=>[...Array(n)].map((_,i)=>`<circle cx="${110-sp+(i%4)*(sp*2/3)}" cy="${-8+Math.floor(i/4)*14+(i%2)*3}" r="2.8" fill="${col}" class="ig-cell" style="--d:${i*.22}s"/>`).join('');
    const fibres=`<path d="M86 -8 C96 -12 104 -2 114 -6 C122 -9 128 -4 134 -6 M86 2 C96 -2 104 8 114 4 C122 1 128 6 134 4 M88 10 C98 6 104 14 114 10 C122 8 128 12 132 10" stroke="#9d86f0" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
    const trab=[[96,-6],[104,4],[112,-8],[120,6],[126,-2],[100,8],[116,-1]].map(([a,b],i)=>`<ellipse cx="${a}" cy="${b}" rx="${2.4+(i%2)}" ry="1.6" fill="${IG.boneS}" opacity=".6" transform="rotate(${(i*37)%60-30} ${a} ${b})"/>`).join('');
    const under=s===1?`<path d="${igLump(30,24)}" fill="${IG.red}" opacity=".55" class="ig-pulse"/>`:'';
    const layer=
      s===1?`<path d="${igLump(24,18)}" fill="${IG.red}" opacity=".22"/>${cells(IG.red,8,22)}`:
      s===2?`<path d="${igLump(32,20)}" fill="#c9b8ff" opacity=".85" stroke="#a796f2" stroke-width="1.5" class="ig-pulse"/>${fibres}${cells('#fff',8,22)}`:
      s===3?`<path d="${igLump(30,17)}" fill="${IG.bone}" stroke="${IG.boneS}" stroke-width="2"/>${trab}<path d="${igLump(30,17)}" fill="#c9b8ff" class="ig-fadeout"/>`:
      s===4?`<path d="${igLump(20,13)}" fill="${IG.bone}" stroke="${IG.boneS}" stroke-width="2"/>${trab}`:'';
    const cast=s===4?`<g class="ig-pop"><path d="M46 -26 C80 -28 140 -28 174 -26 C179 -14 179 14 174 26 C140 28 80 28 46 26 C41 14 41 -14 46 -26Z" fill="${IG.cast}" fill-opacity=".6" stroke="#d9c58e" stroke-width="2.2"/>
      ${[66,88,110,132,154].map(c=>`<path d="M${c-5} -27 C${c+3} -10 ${c+3} 10 ${c-5} 27" stroke="#d9c58e" stroke-width="1.5" fill="none" opacity=".7"/>`).join('')}
      <path d="M46 -26 C41 -14 41 14 46 26 M174 -26 C179 -14 179 14 174 26" stroke="#efe3bd" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M46 -26 C41 -14 41 14 46 26 M174 -26 C179 -14 179 14 174 26" stroke="#d9c58e" stroke-width="1.4" fill="none"/></g>`:'';
    return igFrame(300,110,`<g transform="translate(40 50)">${under}${s===4?igBone(220,13,13,10,{sw:2}):igBrokenBone(T[0],{drop:T[1]})}${layer}${cast}</g>
     ${[1,2,3,4].map(i=>`<circle cx="${120+i*14}" cy="102" r="4" fill="${i<=s?IG.violet:IG.line}"/>`).join('')}`,typeof T==='function'?T('Bone healing stage {0}',s):'Bone healing stage '+s)},
  arm:()=>igFrame(300,110,`<g transform="translate(150 52) scale(1.16) translate(-86 -5)">${igArm(0,0,{crack:true,glow:false})}</g>${igT(130,104,'The radius (thumb-side bone) has one crack',{s:11,c:IG.soft})}`,'A forearm with a cracked radius bone'),
  straightVsCrooked:()=>igFrame(300,150,`<g transform="translate(108 34) scale(.86) translate(-86 -5)">${igArm(0,0,{})}</g><g transform="translate(108 94) scale(.86) translate(-86 -5)">${igArm(0,0,{crooked:true})}</g>
     ${igT(252,27,'Heals straight',{c:IG.green,s:11.5})}<path d="M245 40 l5 5 l10 -11" stroke="${IG.green}" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
     ${igT(252,87,'Heals crooked',{c:IG.red,s:11.5})}<path d="M247 95 l10 10 M257 95 l-10 10" stroke="${IG.red}" stroke-width="3.2" stroke-linecap="round"/>
     ${igT(150,144,'Straight = the bone grows back in its normal shape',{s:10.5,c:IG.soft})}`,'A straight healed bone and a crooked one'),
  threeOptions:()=>igFrame(300,130,[['pins','Surgery + pins',{pins:true}],['cast','Cast',{cast:true}],['gel','BoneMend gel',{gel:true,splint:true}]].map(([k,l,o],i)=>`<g transform="translate(${i*100} 0)"><g class="ig-rise" style="--d:${i*.25}s"><rect x="6" y="4" width="88" height="100" rx="14" fill="#f4f6fd" stroke="${IG.line}"/><g transform="translate(50 54) rotate(-90) scale(.41) translate(-86 -5)">${igArm(0,0,o)}</g>${igT(50,120,l,{s:10.5})}</g></g>`).join(''),'Three treatment options'),
  kids:({n,col,label,sub})=>igFrame(300,118,`${igKids(n,col||IG.teal)}${igT(150,112,label,{s:11.5})}`,label),
  kidsCompare:({a,b,label})=>igFrame(300,118,`<g class="ig-kidswap">${igKids(b,IG.teal)}</g>${igT(150,112,label,{s:11.5})}`,label),
  timeline:()=>{const X=d=>20+d*(260/45);return igFrame(300,150,`
     <path d="M20 118 H284" stroke="${IG.line}" stroke-width="2"/>${[0,7,14,21,28,35,42].map(d=>`<path d="M${X(d)} 114 v8" stroke="${IG.soft}"/>${igT(X(d),134,d===0?'Today':typeof T==='function'?T('Wk {0}',d/7):'Wk '+d/7,{s:9.5,c:IG.soft})}`).join('')}
     <path d="M${X(9)} 20 V118" stroke="${IG.coral}" stroke-width="2" stroke-dasharray="4 4"/><g transform="translate(${X(9)} 12)"><path d="M0 0 v14 M0 0 h14 l-4 4 l4 4 h-14" fill="${IG.coral}" stroke="${IG.coral}" stroke-width="1.5"/></g>${igT(X(9)+20,18,'Recital (day 9)',{s:10,c:IG.coral,a:'start'})}
     ${[['BoneMend',8,IG.violet],['Cast',21,IG.teal],['Pins',42,'#7b8bb8']].map(([l,d,c],i)=>`<g><rect x="20" y="${38+i*24}" width="${X(d)-20}" height="14" rx="7" fill="${c}" class="ig-grow" style="--d:${i*.3}s"/>${X(d)-20>70?igT(26,49+i*24,l,{s:10,c:'#fff',a:'start'}):igT(X(d)+22,49+i*24,l,{s:10,c:c,w:800,a:'start'})}<text x="${X(d)+6}" y="${49+i*24}" font-size="12" font-family="Nunito" fill="${IG.ink}">&#119070;</text></g>`).join('')}`,'Time until violin for each option')},
  sampleSize:()=>{let big='',small='';for(let i=0;i<220;i++)big+=`<circle cx="${(12+(i*37)%126).toFixed(0)}" cy="${(30+((i*53)%70)).toFixed(0)}" r="2.4" fill="${IG.teal}" opacity=".75"/>`;for(let i=0;i<40;i++)small+=`<circle cx="${(172+(i*29)%110).toFixed(0)}" cy="${(30+((i*41)%70)).toFixed(0)}" r="2.4" fill="${IG.violet}"/>`;
     return igFrame(300,150,`<rect x="6" y="22" width="138" height="86" rx="14" fill="#eefaf8"/>${big}<rect x="160" y="22" width="134" height="86" rx="14" fill="#f2f0ff"/>${small}
     ${igT(75,16,'Cast: 21,000 kids',{s:11})}${igT(227,16,'BoneMend: 40 kids',{s:11})}
     <g><path d="M20 128 H130" stroke="${IG.line}" stroke-width="6" stroke-linecap="round"/><g class="ig-needle tight"><path d="M75 120 v16" stroke="${IG.teal}" stroke-width="4" stroke-linecap="round"/></g></g>
     <g><path d="M172 128 H282" stroke="${IG.line}" stroke-width="6" stroke-linecap="round"/><g class="ig-needle wide"><path d="M227 120 v16" stroke="${IG.violet}" stroke-width="4" stroke-linecap="round"/></g></g>
     ${igT(75,148,'Estimate barely moves',{s:9.5,c:IG.soft})}${igT(227,148,'Estimate jumps around',{s:9.5,c:IG.soft})}`,'A big sample and a small sample')},
  bars:()=>chartSVG(MEMO_CHART),
  rashForecast:({n,label})=>igFrame(300,118,`${igKids(n,IG.red)}${igT(150,112,label,{s:11.5})}`,label),
  idcard:()=>igFrame(300,124,`<rect x="34" y="8" width="232" height="108" rx="14" fill="#fff" stroke="${IG.line}" stroke-width="2"/><path d="M34 22 a14 14 0 0 1 14 -14 h204 a14 14 0 0 1 14 14 v8 h-232z" fill="${IG.coral}"/>${igT(150,25,'PATIENT',{s:11,c:'#fff',w:800})}
     <clipPath id="idc"><rect x="46" y="38" width="62" height="70" rx="10"/></clipPath><rect x="46" y="38" width="62" height="70" rx="10" fill="#ffe6dc"/>
     <g clip-path="url(#idc)"><svg x="40" y="36" width="74" height="78" viewBox="40 20 220 232" preserveAspectRatio="xMidYMin slice">${personSVG({...CAST.maya,mood:'smile'})}</svg></g>
     ${igT(122,62,'Maya Lin',{s:15,a:'start',w:800})}${igT(122,80,'Age 11',{s:11,a:'start',c:IG.soft})}${igT(122,96,'Violinist',{s:11,a:'start',c:IG.soft})}
     <g class="ig-sway-wrap">${violinArt(232,72,.78,24)}</g>`,'Maya\u2019s patient card'),
  scooter:()=>igFrame(300,110,`<path d="M10 96 H290" stroke="${IG.line}" stroke-width="3"/><g class="ig-tip"><g transform="translate(120 70)"><rect x="-40" y="16" width="80" height="6" rx="3" fill="${IG.violet}"/><path d="M34 18 V-26 h10" stroke="${IG.violet}" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="-32" cy="24" r="6" fill="${IG.ink}"/><circle cx="32" cy="24" r="6" fill="${IG.ink}"/></g></g><g class="ig-star">${igT(210,50,'Ouch!',{s:16,c:IG.red})}</g>`,'A scooter fall'),
  noAllergy:()=>igFrame(300,110,`<rect x="80" y="8" width="140" height="96" rx="10" fill="#fff" stroke="${IG.line}" stroke-width="2"/><rect x="128" y="2" width="44" height="14" rx="5" fill="#cfd6ea"/>
     ${igT(150,36,'Allergies on file',{s:11})}<path d="M120 60 h60" stroke="${IG.soft}" stroke-width="3" stroke-linecap="round"/>${igT(150,86,'none found',{s:11,c:IG.soft})}<circle cx="236" cy="60" r="14" fill="none" stroke="${IG.gold}" stroke-width="3" class="ig-pulse"/>${igT(236,65,'?',{s:14,c:IG.gold})}`,'An empty allergy list'),
  sync:()=>igFrame(300,120,`<g transform="translate(46 54)"><rect x="-34" y="-30" width="68" height="56" rx="8" fill="#fff4e8" stroke="${IG.line}"/><path d="M-34 -30 l34 -18 l34 18" fill="#ffd9c2"/><path d="M-6 -12 h12 M0 -18 v12" stroke="${IG.red}" stroke-width="3"/>${igT(0,46,'Clinic in Taipei',{s:10})}</g>
     <g transform="translate(254 54)"><rect x="-34" y="-30" width="68" height="56" rx="8" fill="#eaf6ff" stroke="${IG.line}"/><path d="M-34 -30 l34 -18 l34 18" fill="#cfe3ff"/><path d="M-6 -12 h12 M0 -18 v12" stroke="${IG.teal}" stroke-width="3"/>${igT(0,46,'Boston hospital',{s:10})}</g>
     <path d="M86 50 H214" stroke="${IG.soft}" stroke-width="2" stroke-dasharray="5 6"/><g class="ig-fly"><rect x="0" y="-10" width="18" height="22" rx="3" fill="#fff" stroke="${IG.soft}"/><path d="M4 -3 h10 M4 2 h10" stroke="${IG.soft}" stroke-width="1.5"/></g><g class="ig-x"><path d="M140 40 l20 20 M160 40 l-20 20" stroke="${IG.red}" stroke-width="4" stroke-linecap="round"/></g>`,'A record that does not transfer between countries'),
  askFamily:()=>igFrame(300,110,`<g transform="translate(90 92)">${mini(0,0,{skin:'#f1cfb6',shirt:'#5b7bd5',hair:'#25202e',s:2})}</g><g transform="translate(130 96)">${mini(0,0,{skin:'#f8dcc8',shirt:IG.coral,hair:'#2a2030',s:1.5})}</g>
     <g class="ig-rise"><rect x="160" y="18" width="128" height="44" rx="16" fill="${IG.violet}"/><path d="M170 58 l-12 14 l22 -10z" fill="${IG.violet}"/>${igT(224,38,'Any care in',{s:11,c:'#fff'})}${igT(224,53,'other countries?',{s:11,c:'#fff'})}</g>`,'Ask the family a question'),
  boneGel:()=>igFrame(300,110,`<g transform="translate(40 48)">${igBrokenBone(24,{})}
     <path d="M96 -12 C104 -15 116 -15 124 -12 C127 -4 127 4 124 12 C116 15 104 15 96 12 C93 4 93 -4 96 -12Z" fill="${IG.violet}" opacity=".38" class="ig-fillgap"/>${[0,1,2,3,4,5].map(i=>`<circle cx="${102+(i%3)*8}" cy="${-5+Math.floor(i/3)*10}" r="3" fill="${IG.bone}" stroke="${IG.boneS}" stroke-width=".8" class="ig-cell" style="--d:${i*.3}s"/>`).join('')}</g>
     <g class="ig-drop"><path d="M150 2 C146 9 143 13 143 17 C143 21 146 23 150 23 C154 23 157 21 157 17 C157 13 154 9 150 2Z" fill="${IG.violet}"/><path d="M147 15 q0 4 3 5" stroke="#fff" stroke-width="1.4" fill="none" opacity=".7" stroke-linecap="round"/></g>${igT(150,100,'Gel fills the gap; bone cells rebuild it',{s:10.5,c:IG.soft})}`,'Gel helping bone cells fill a gap'),
  splint:()=>igFrame(300,110,`<g transform="translate(150 52) scale(1.12) translate(-86 -5)">${igArm(0,0,{splint:true})}</g>${igT(130,104,'The smart splint checks the arm stays still',{s:10.5,c:IG.soft})}`,'A smart splint on the arm'),
  ingredientMatch:()=>igFrame(300,130,`<g transform="translate(64 56)"><rect x="-30" y="-24" width="60" height="44" rx="10" fill="#e4f6ff" stroke="#9fd3f0" stroke-width="2"/><circle cx="0" cy="-2" r="10" fill="#9fd3f0" opacity=".6"/>${igT(0,40,'Cooling patch',{s:10.5})}</g>
     <g transform="translate(236 56)"><rect x="-14" y="-30" width="28" height="48" rx="8" fill="${IG.violet}" opacity=".85"/><rect x="-8" y="-38" width="16" height="10" rx="3" fill="#b9b2f5"/>${igT(0,40,'BoneMend gel',{s:10.5})}</g>
     <g class="ig-match"><rect x="122" y="40" width="56" height="26" rx="13" fill="${IG.gold}"/>${igT(150,58,'HX-2',{s:13,c:IG.ink,w:800})}<path d="M96 52 H120 M180 52 H206" stroke="${IG.gold}" stroke-width="3" stroke-dasharray="4 4"/></g>
     ${igT(150,120,'Same ingredient in both',{s:11,c:IG.soft})}`,'The same HX-2 ingredient in a cooling patch and in BoneMend'),
  switchToCast:()=>igFrame(300,110,`<g transform="translate(70 48) scale(.56) translate(-86 -5)">${igArm(0,0,{gel:true,splint:true})}</g><path d="M138 50 h22" stroke="${IG.soft}" stroke-width="3" class="ig-dash"/><path d="M157 43 l8 7 l-8 7" fill="none" stroke="${IG.soft}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><g transform="translate(232 48) scale(.56) translate(-86 -5)">${igArm(0,0,{cast:true})}</g>${igT(150,100,'Rash? Stop the gel, use a cast',{s:10.5,c:IG.soft})}`,'Switching from gel to a cast'),
  floodwall:()=>igFrame(300,110,`<rect x="0" y="62" width="300" height="48" fill="#9fd3f0"/><path class="ig-wave" d="M0 70 q15 -6 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0" stroke="#fff" stroke-width="2" fill="none"/><rect x="150" y="36" width="150" height="40" fill="#cfd6ea"/>${[0,1,2,3,4].map(i=>`<rect x="${152+i*30}" y="36" width="26" height="40" fill="#dfe4f3" stroke="#b9c1d9"/>`).join('')}<g class="ig-robot">${robotBot(130,36,.9,IG.gold)}</g>${igT(225,28,'Done 3 weeks early',{s:11,c:IG.green})}`,'Robots finished a flood wall'),
  network:()=>{const pts=[[150,58],[90,40],[60,80],[120,96],[200,30],[240,70],[210,100],[40,40],[260,40],[170,88],[100,72]];return igFrame(300,118,`${pts.slice(1).map(p=>`<path d="M150 58 L${p[0]} ${p[1]}" stroke="${IG.teal}" stroke-width="1.6" opacity=".5" class="ig-dash"/>`).join('')}${pts.map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="${i?7:12}" fill="${i?'#fff':IG.teal}" stroke="${IG.teal}" stroke-width="2.4" class="${i?'ig-pulse':''}" style="--d:${i*.15}s"/>`).join('')}${igT(150,63,'H',{s:12,c:'#fff',w:800})}${igT(150,114,'Halo runs 11 hospitals',{s:11,c:IG.soft})}`,'One AI connected to eleven hospitals')},
  erWait:()=>igFrame(300,110,`<g transform="translate(70 55)"><circle r="38" fill="#fff" stroke="${IG.teal}" stroke-width="5"/>${[0,1,2,3,4,5,6,7,8,9,10,11].map(k=>`<circle cx="${30*Math.sin(k*Math.PI/6)}" cy="${-30*Math.cos(k*Math.PI/6)}" r="${k%3?1.4:2.6}" fill="${IG.soft}"/>`).join('')}<path d="M0 0 L0 -24 A24 24 0 0 1 ${24*Math.sin(Math.PI*4/30)} ${-24*Math.cos(Math.PI*4/30)} Z" fill="${IG.teal}" opacity=".35" class="ig-pulse"/><g class="ig-hand"><path d="M0 0 V-26" stroke="${IG.ink}" stroke-width="3" stroke-linecap="round"/></g><circle r="3.5" fill="${IG.ink}"/></g>
     ${igT(200,50,'4 minutes',{s:22,c:IG.teal,w:800})}${igT(200,74,'average wait',{s:12,c:IG.soft})}`,'A clock showing a four minute wait'),
  datacenter:()=>igFrame(300,110,`<rect x="0" y="0" width="300" height="110" rx="10" fill="#1e2450"/>${[0,1,2,3,4,5,6,7,8,9,10,11,12].map(i=>`<circle cx="${(i*71)%300}" cy="${(i*37)%60}" r="1.2" fill="#fff" opacity=".6"/>`).join('')}<rect x="96" y="44" width="108" height="50" rx="4" fill="#3a4282"/>${[0,1,2,3,4,5].map(i=>`<rect x="${104+i*16}" y="54" width="10" height="30" rx="2" fill="#5ee6d6" class="ig-blink" style="--d:${i*.2}s"/>`).join('')}<path d="M80 30 l140 70 M220 30 l-140 70" stroke="${IG.red}" stroke-width="5" stroke-linecap="round" opacity=".85"/>${igT(150,22,'Calder Bay',{s:10.5,c:'#cfd6ff'})}`,'A secret datacenter that was shut down')
};

// An SVG piece placed with transform="translate(...)" loses its place when a CSS animation also animates transform:
// the animation replaces the attribute and the piece jumps to the corner. Wrap any such piece in a <g> that keeps the
// placement, so the animation runs inside it. Runs on everything added to the page (docs, vignettes, props, maps).
function svgUnclash(root){if(!root||!root.querySelectorAll)return;
  const els=root.querySelectorAll('svg [transform][class],svg [transform][style]');
  for(const el of els){if(!el.getAnimations)continue;let hit=false;
    try{hit=el.getAnimations().some(a=>a.effect&&a.effect.getKeyframes().some(k=>'transform' in k||'translate' in k||'scale' in k||'rotate' in k))}catch(e){}
    if(!hit)continue;const g=document.createElementNS('http://www.w3.org/2000/svg','g');g.setAttribute('transform',el.getAttribute('transform'));
    el.removeAttribute('transform');el.parentNode.insertBefore(g,el);g.appendChild(el)}}
if(typeof MutationObserver!=='undefined'&&typeof document!=='undefined'){let q=[],t=0;
  const run=()=>{t=0;const r=q;q=[];r.forEach(n=>{if(n.isConnected)svgUnclash(n.tagName==='svg'?n.parentNode:n)})};
  new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1&&(n.tagName==='svg'||n.querySelector&&n.querySelector('svg')))q.push(n);
    if(q.length&&!t)t=requestAnimationFrame(run)}).observe(document.documentElement,{childList:true,subtree:true})}
