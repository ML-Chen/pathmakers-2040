// viz/darktower.js — pictures for "The Dark Tower" (ruin visit, Marrow Point, Estmark; Blackout Week, 2029).
// DT_ART.<key>() returns an SVG (class "dtart", transparent background) for the five things people brought back to the
// tower; DT_ART.g.<key>() returns the same drawing as a bare group for use inside other pictures.
// dtMapSVG(grid, opts) draws the storm table's island: 12 districts as hexes, each with its AI brain and its off switch.
// VIZ.dt*() are the story pictures, one looping picture per sentence (viewBox 300 x 160).
// Style follows src/viz/quietyear.js: Bezier-built forms, a thick contour and a thin detail line in a darkened fill
// colour, flat fill + one shade + one highlight, light from the upper left. Ids are unique per call.
const DT_BRAIN={tern:{name:'Tern',color:'#22b8a8',glyph:'tri'},puffin:{name:'Puffin',color:'#f2a33a',glyph:'dot'},heron:{name:'Heron',color:'#9b7bf0',glyph:'dia'},beacon:{name:'Beacon',color:'#8b93ad',glyph:'sq'}};
const DT_ART=(()=>{
  let N=0;const uid=p=>'dt'+p+(++N);
  const r=v=>Math.round(v*10)/10;
  const rgb=c=>{c=String(c||'#888').trim().replace('#','');if(c.length===3)c=c.replace(/./g,'$&$&');const n=parseInt(c.slice(0,6),16);return isNaN(n)?[136,136,136]:[n>>16&255,n>>8&255,n&255]};
  const mix=(a,b,t)=>{const A=rgb(a),B=rgb(b);return '#'+A.map((v,i)=>Math.max(0,Math.min(255,Math.round(v+(B[i]-v)*t))).toString(16).padStart(2,'0')).join('')};
  const INK='#1f2340',WH='#ffffff',GOLD='#ffd45c',RED='#e0533f',NAVY='#1b2450';
  const dk=(c,t)=>mix(c,INK,t==null?.55:t), lt=(c,t)=>mix(c,WH,t==null?.45:t);
  const O=(c,w)=>`stroke="${dk(c)}" stroke-width="${w||2.5}" stroke-linejoin="round" stroke-linecap="round"`;
  const I=(c,w)=>`stroke="${dk(c)}" stroke-width="${w||1.4}" stroke-linejoin="round" stroke-linecap="round"`;
  const F='font-family="Nunito,Fredoka,sans-serif" font-weight="800"';
  const rr=(x,y,w,h,q)=>`M${r(x+q)} ${r(y)}H${r(x+w-q)}Q${r(x+w)} ${r(y)} ${r(x+w)} ${r(y+q)}V${r(y+h-q)}Q${r(x+w)} ${r(y+h)} ${r(x+w-q)} ${r(y+h)}H${r(x+q)}Q${r(x)} ${r(y+h)} ${r(x)} ${r(y+h-q)}V${r(y+q)}Q${r(x)} ${r(y)} ${r(x+q)} ${r(y)}Z`;
  const ov=(cx,cy,rx,ry)=>{ry=ry==null?rx:ry;const k=.552;return `M${r(cx-rx)} ${r(cy)}C${r(cx-rx)} ${r(cy-ry*k)} ${r(cx-rx*k)} ${r(cy-ry)} ${r(cx)} ${r(cy-ry)}C${r(cx+rx*k)} ${r(cy-ry)} ${r(cx+rx)} ${r(cy-ry*k)} ${r(cx+rx)} ${r(cy)}C${r(cx+rx)} ${r(cy+ry*k)} ${r(cx+rx*k)} ${r(cy+ry)} ${r(cx)} ${r(cy+ry)}C${r(cx-rx*k)} ${r(cy+ry)} ${r(cx-rx)} ${r(cy+ry*k)} ${r(cx-rx)} ${r(cy)}Z`};
  const shadow=(cx,cy,rx,ry)=>`<path d="${ov(cx,cy,rx,ry||rx*.15)}" fill="${INK}" opacity=".18"/>`;
  const svg=(vb,body,cls)=>`<svg viewBox="${vb}" class="${cls||'dtart'}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
  const txt=(x,y,s,fill,t,extra)=>`<text x="${x}" y="${y}" font-size="${s}" fill="${fill}" text-anchor="middle" ${F}${extra?' '+extra:''}>${t}</text>`;

  // ---------- the brains: a coloured disc with a white glyph (shape and colour both say which brain) ----------
  const glyph=(g,cx,cy,s)=>g==='tri'?`<path d="M${r(cx)} ${r(cy-s)}L${r(cx+s*.95)} ${r(cy+s*.62)}L${r(cx-s*.95)} ${r(cy+s*.62)}Z" fill="#fff" stroke="#fff" stroke-width="${r(s*.25)}" stroke-linejoin="round"/>`
    :g==='dot'?`<path d="${ov(cx,cy,s*.82)}" fill="#fff"/>`:g==='dia'?`<path d="M${r(cx)} ${r(cy-s*1.05)}L${r(cx+s*.85)} ${r(cy)}L${r(cx)} ${r(cy+s*1.05)}L${r(cx-s*.85)} ${r(cy)}Z" fill="#fff" stroke="#fff" stroke-width="${r(s*.18)}" stroke-linejoin="round"/>`
    :`<path d="${rr(cx-s*.75,cy-s*.75,s*1.5,s*1.5,s*.25)}" fill="#fff"/>`;
  const brain=(x,y,kind,rad,extra)=>{const B=DT_BRAIN[kind]||DT_BRAIN.beacon,c=B.color;
    return `<g ${extra||''}><path d="${ov(x,y,rad)}" fill="${c}" ${O(c,Math.max(1.2,rad*.16))}/><path d="${ov(x-rad*.28,y-rad*.32,rad*.42,rad*.26)}" fill="${lt(c,.5)}" opacity=".7"/>${glyph(B.glyph,x,y+rad*.04,rad*.46)}</g>`};
  const alert=(x,y,s,cls)=>`<g class="${cls||''}"><path d="${ov(x,y,s)}" fill="${RED}" ${O(RED,1.2)}/><path d="M${r(x)} ${r(y-s*.5)}V${r(y+s*.12)}" stroke="#fff" stroke-width="${r(s*.3)}" stroke-linecap="round"/><path d="${ov(x,y+s*.48,s*.15)}" fill="#fff"/></g>`;

  // ---------- small building blocks ----------
  const house=(x,gy,w,h,col,lit,cls)=>{const roof=h*.42,c=col||'#c9b8a0',win=lit?GOLD:'#3a4170';
    return `<g class="${cls||''}"><path d="M${r(x)} ${r(gy)}V${r(gy-h+roof)}L${r(x+w/2)} ${r(gy-h)}L${r(x+w)} ${r(gy-h+roof)}V${r(gy)}Z" fill="${c}" ${I(c,1.3)}/>
      <path d="M${r(x-2)} ${r(gy-h+roof+1.5)}L${r(x+w/2)} ${r(gy-h-1.5)}L${r(x+w+2)} ${r(gy-h+roof+1.5)}" fill="none" stroke="${dk(c,.4)}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${rr(x+w*.18,gy-h*.48,w*.24,h*.22,1)}${rr(x+w*.58,gy-h*.48,w*.24,h*.22,1)}" fill="${win}" class="${lit?'dt-win':''}"/></g>`};
  const houseLit=(x,gy,w,h,col,cls,d)=>`<g class="${cls}" style="--d:${d||0}s">${house(x,gy,w,h,col,true)}</g>`;
  const stars=(n,seed,h)=>{let s='';let a=seed||7;for(let i=0;i<n;i++){a=(a*9301+49297)%233280;const x=a/233280*290+5;a=(a*9301+49297)%233280;const y=a/233280*(h||70)+6;s+=`<circle cx="${r(x)}" cy="${r(y)}" r="${i%4?0.9:1.4}" fill="#fff" class="dtv-tw" style="--d:${(i*.37%2.4).toFixed(2)}s"/>`}return s};
  const moon=(x,y,s)=>`<path d="${ov(x,y,s)}" fill="#fff6d0"/><path d="${ov(x-s*.3,y-s*.25,s*.18)}${ov(x+s*.25,y+s*.3,s*.12)}" fill="#efe2a8"/>`;
  const sun=(x,y,s)=>`<path d="${ov(x,y,s*1.9)}" fill="#fff4c4" opacity=".55"/><path d="${ov(x,y,s)}" fill="#ffe27a" ${I('#f2b83a',1.2)}/>`;
  const cloud=(x,y,s,c,cls)=>`<g class="${cls||''}"><path d="M${r(x-22*s)} ${r(y+6*s)}C${r(x-30*s)} ${r(y+6*s)} ${r(x-30*s)} ${r(y-6*s)} ${r(x-20*s)} ${r(y-5*s)}C${r(x-18*s)} ${r(y-16*s)} ${r(x-2*s)} ${r(y-18*s)} ${r(x+3*s)} ${r(y-9*s)}C${r(x+10*s)} ${r(y-16*s)} ${r(x+24*s)} ${r(y-10*s)} ${r(x+21*s)} ${r(y-2*s)}C${r(x+30*s)} ${r(y-2*s)} ${r(x+30*s)} ${r(y+6*s)} ${r(x+22*s)} ${r(y+6*s)}Z" fill="${c||'#fff'}"/></g>`;
  const gnd=(y,a,b)=>`<path d="M0 ${y}H300V160H0Z" fill="${a}"/><path d="M0 ${y}H300V${y+3}H0Z" fill="${b}"/>`;
  const pole=(x,gy,h)=>`<path d="M${x-2} ${gy}L${x-1.4} ${gy-h}H${x+1.4}L${x+2} ${gy}Z" fill="#8a6a4a" ${I('#8a6a4a',1)}/><path d="M${x-14} ${gy-h+6}H${x+14}" stroke="#6a4e34" stroke-width="3" stroke-linecap="round"/>${[-11,0,11].map(d=>`<path d="${ov(x+d,gy-h+3.5,1.6,2.4)}" fill="#dfe6f2"/>`).join('')}`;
  const person=(x,gy,o)=>{const s=(o&&o.s)||1;return typeof mini==='function'?mini(x,gy-34*s,{...o,s}):''};
  const clock=(x,y,rad,cls,label)=>`<g><path d="${ov(x,y,rad)}" fill="#fffaf0" ${O('#c9c0a8',2)}/>${[0,1,2,3,4,5,6,7,8,9,10,11].map(i=>{const a=i*Math.PI/6;return `<path d="M${r(x+Math.sin(a)*rad*.78)} ${r(y-Math.cos(a)*rad*.78)}L${r(x+Math.sin(a)*rad*.9)} ${r(y-Math.cos(a)*rad*.9)}" stroke="${INK}" stroke-width="${i%3?1:1.8}"/>`}).join('')}
    <g class="${cls||''}" style="transform-origin:50% 100%"><path d="M${x} ${y}V${r(y-rad*.72)}" stroke="${RED}" stroke-width="2" stroke-linecap="round"/></g><path d="M${x} ${y}L${r(x+rad*.4)} ${r(y+rad*.2)}" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/><path d="${ov(x,y,2)}" fill="${INK}"/>${label?txt(x,y+rad+11,9,'#fff',label):''}</g>`;
  const bg=(kind,id)=>{const G={night:['#1a2150','#3a3f7a'],storm:['#141a3c','#2d3566'],day:['#a9d8f2','#e8f6fb'],room:['#fff0d6','#f2d3a8'],dim:['#3b3352','#5a4a5e'],table:['#0f1838','#1f2d63'],paper:['#f8f2e2','#efe5cc'],dusk:['#f6c79a','#a9c4e8']}[kind]||['#eef1fb','#fff'];
    let s=`<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${G[0]}"/><stop offset="1" stop-color="${G[1]}"/></linearGradient></defs><rect width="300" height="160" rx="14" fill="url(#${id})"/>`;
    if(kind==='table')s+=`<g stroke="#5ee6d6" stroke-width=".6" opacity=".14">${[1,2,3,4,5,6,7,8,9].map(i=>`<path d="M${i*30} 0V160"/>`).join('')}${[1,2,3,4,5].map(i=>`<path d="M0 ${i*27}H300"/>`).join('')}</g>`;
    if(kind==='night'||kind==='storm')s+=stars(kind==='storm'?8:26,kind==='storm'?3:11);
    return s};
  const pic=(kind,body,label)=>{const id=uid('bg');return `<svg viewBox="0 0 300 160" class="ig dtv" role="img" aria-label="${label||''}"><clipPath id="${id}c"><rect width="300" height="160" rx="14"/></clipPath><g clip-path="url(#${id}c)">${bg(kind,id)}${body}</g></svg>`};
  const label=(x,y,t,c,s)=>`<g><path d="${rr(x-t.length*(s||8)*.31-7,y-(s||8)-3,t.length*(s||8)*.62+14,(s||8)+9,6)}" fill="${c||'#fff'}" opacity=".94"/>${txt(x,y,(s||8),INK,t)}</g>`;

  // ---------- the five things people brought back ----------
  const G={};
  G.radio=(crank)=>{const C='#d9573f';return `${shadow(50,90,38,4.5)}
    <path d="M30 33C30 19 70 19 70 33" fill="none" stroke="${dk(C,.35)}" stroke-width="5" stroke-linecap="round"/>
    <path d="M63 31L83 8" stroke="#8a90a8" stroke-width="2.4" stroke-linecap="round"/><path d="${ov(83,8,2.6)}" fill="#d6dae6" ${I('#8a90a8',1)}/>
    <path d="${rr(12,31,72,54,11)}" fill="${C}" ${O(C)}/><path d="${rr(17,35,62,9,4.5)}" fill="${lt(C,.4)}" opacity=".75"/>
    <path d="${ov(34,63,14.5)}" fill="${dk(C,.3)}" ${I(C)}/>${[[-7,-7],[0,-8],[7,-7],[-8,0],[0,0],[8,0],[-7,7],[0,8],[7,7]].map(([a,b])=>`<path d="${ov(34+a,63+b,1.7)}" fill="${dk(C,.62)}"/>`).join('')}
    <path d="${rr(54,51,25,17,4)}" fill="#fff4c8" ${I('#c9a040',1.3)}/>${[57,61,65,69,73,76].map((x,i)=>`<path d="M${x} 54V${i%2?57:59}" stroke="#a9873a" stroke-width="1"/>`).join('')}<path d="M64 66L69 55" stroke="${RED}" stroke-width="1.6" stroke-linecap="round" class="dtv-needle" style="transform-origin:0% 100%"/>
    <path d="${rr(55,73,10,6,2.5)}${rr(68,73,10,6,2.5)}" fill="${dk(C,.3)}"/>
    <path d="${ov(86,62,4.4)}" fill="#c9cede" ${I('#8a90a8',1.2)}/>
    <g class="${crank?'dtv-crank':''}" style="transform-origin:0% 0%"><path d="M86 62H96V77" fill="none" stroke="#7a8098" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/><path d="${rr(92.5,74,7,10,3.5)}" fill="#f0d58a" ${I('#c9a040',1.2)}/></g>`};
  G.paper=()=>{const P='#f6f0e0';return `${shadow(50,90,36,4)}<g transform="rotate(-6 50 50)">
    <path d="${rr(15,12,70,78,3)}" fill="${P}" ${O('#b7ab90',2.2)}/><path d="M20 22H80" stroke="${INK}" stroke-width="1"/>
    ${txt(50,20,6.4,INK,'THE COURIER','textLength="52" lengthAdjust="spacingAndGlyphs" font-family="Georgia,serif"')}
    ${txt(50,33,9.6,INK,'ONE MISTAKE,','textLength="58" lengthAdjust="spacingAndGlyphs"')}${txt(50,44,9.6,INK,'EVERY TOWN','textLength="54" lengthAdjust="spacingAndGlyphs"')}
    <path d="${rr(20,50,26,22,2)}" fill="#c9c0a8"/><path d="M27 72V58L31 53L35 58V72Z" fill="#6a6672"/><path d="M24 72C27 66 31 64 34 70" stroke="#3f7a3a" stroke-width="1.6" fill="none"/>
    ${[52,56,60,64,68,72].map(y=>`<path d="M50 ${y}H${y%8?78:74}" stroke="#8a826e" stroke-width="1.6" stroke-linecap="round"/>`).join('')}${[77,81,85].map(y=>`<path d="M20 ${y}H${y===85?62:78}" stroke="#8a826e" stroke-width="1.6" stroke-linecap="round"/>`).join('')}
    <path d="M85 12L85 90" stroke="#d8cdb2" stroke-width="2"/></g>`};
  G.lever=(pulled)=>{const B='#5f7d6e',H=RED;return `${shadow(50,92,32,4)}
    <path d="${rr(22,10,56,80,7)}" fill="${B}" ${O(B)}/><path d="${rr(26,14,48,72,5)}" fill="${lt(B,.12)}"/>
    <path d="M26 20C34 18 38 26 48 22" stroke="#b8c2bc" stroke-width="3" fill="none" opacity=".55" stroke-linecap="round"/><path d="${ov(66,74,4,2.5)}" fill="#b8c2bc" opacity=".5"/>
    <path d="${rr(45,22,10,46,5)}" fill="${dk(B,.5)}"/>
    <g class="${pulled?'dtv-pull':''}" style="transform-origin:50% 100%"><path d="M50 62L50 28" stroke="#c8ccd6" stroke-width="5" stroke-linecap="round"/><path d="M50 62L50 28" stroke="#fff" stroke-width="1.4" opacity=".6" stroke-linecap="round" transform="translate(-1 0)"/><path d="${ov(50,24,8)}" fill="${H}" ${O(H,2)}/><path d="${ov(47.4,21.6,2.8,1.8)}" fill="#fff" opacity=".7"/></g>
    <path d="${ov(50,62,5)}" fill="#3a4250"/>
    <path d="${rr(29,72,42,10,2)}" fill="#ffd45c" ${I('#c9a040',1)}/><g clip-path="none">${[0,1,2,3,4].map(i=>`<path d="M${32+i*8} 82L${36+i*8} 72H${39+i*8}L${35+i*8} 82Z" fill="${INK}" opacity=".85"/>`).join('')}</g>
    ${txt(50,17,5.4,'#e8eee9','OVERRIDE','textLength="30" lengthAdjust="spacingAndGlyphs"')}`};
  G.helmet=()=>{const Y='#f6c22a';return `${shadow(50,82,38,4.5)}
    <path d="M14 74C10 70 12 66 20 65H80C88 66 90 70 86 74C70 79 30 79 14 74Z" fill="${dk(Y,.18)}" ${O(Y)}/>
    <path d="M20 66C18 38 34 22 50 22C66 22 82 38 80 66Z" fill="${Y}" ${O(Y)}/>
    <path d="M44 23C42 36 42 52 43 66H57C58 52 58 36 56 23Z" fill="${lt(Y,.18)}" ${I(Y,1.3)}/>
    <path d="M27 40C30 32 36 27 42 25" stroke="#fff" stroke-width="3.4" fill="none" opacity=".6" stroke-linecap="round"/>
    <path d="M64 38L70 38L66 46L72 46L62 58L65 49L60 49Z" fill="#2a2f50"/>
    <path d="${rr(24,48,16,9,2)}" fill="#fff" ${I('#c9cede',1)}/>${txt(32,55,6,INK,'4')}
    <path d="M70 60l1.4 2.8 3 .4-2.2 2.1.5 3-2.7-1.4-2.7 1.4.5-3-2.2-2.1 3-.4Z" fill="#fff" opacity=".9"/>`};
  G.nest=()=>{const T='#8a6a3e';return `${shadow(50,88,40,5)}
    <path d="M12 66C12 86 88 86 88 66C88 60 12 60 12 66Z" fill="${T}" ${O(T)}/>
    ${[[14,66,40,62],[22,74,64,70],[30,80,80,72],[18,70,52,78],[48,64,86,70],[60,80,86,66]].map(([a,b,c,d])=>`<path d="M${a} ${b}Q${(a+c)/2} ${Math.min(b,d)-4} ${c} ${d}" stroke="${lt(T,.35)}" stroke-width="2" fill="none" stroke-linecap="round"/>`).join('')}
    ${[[36,52],[62,50]].map(([x,y],i)=>`<g class="dtv-chick" style="--d:${i*.6}s;transform-origin:50% 100%"><path d="${ov(x,y+6,13,12)}" fill="#c9ced8" ${O('#9aa3b8',2)}/><path d="${ov(x-3,y+2,5,3.4)}" fill="#eef0f5" opacity=".8"/>
      <path d="${ov(x+(i?-4:4),y,2.1)}" fill="${INK}"/><path d="M${x+(i?-9:9)} ${y+3}L${x+(i?-16:16)} ${y+1}L${x+(i?-9:9)} ${y+7}Z" fill="#e8c24a" ${I('#c9a040',1)}/></g>`).join('')}`};
  const ART={};for(const k in G)ART[k]=(...a)=>svg('0 0 100 100',G[k](...a));
  ART.g=G;ART.brain=(kind,s)=>svg('-12 -12 24 24',brain(0,0,kind,10.5),'dtbrain');
  ART.switch=(state)=>svg('0 0 24 24',state==='painted'?`<path d="${rr(5,3,14,18,3)}" fill="#8b93ad" ${I('#8b93ad',1.2)}/><path d="M12 15V7" stroke="#c9cede" stroke-width="2.4" stroke-linecap="round"/><path d="M5 8C8 7 9 12 12 10C14 9 16 11 19 9V5H5Z" fill="#c9cede"/><path d="M8 9V13M15 10V12" stroke="#c9cede" stroke-width="1.6" stroke-linecap="round"/>`
    :`<path d="${rr(5,3,14,18,3)}" fill="#3fbf7a" ${I('#3fbf7a',1.2)}/><path d="M12 15L12 7" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><path d="${ov(12,6.5,2.6)}" fill="${RED}"/><path d="M8 17.5L10 19.5L16 14.5" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".0"/>`,'dtsw');

  // ---------- the island map on the storm table ----------
  // 12 pointy-top hexes in four rows of three (a tall island for a phone screen); rows 1 and 3 are shifted half a hex.
  // Districts are lit (gold lights) or dark. HEX43 is the wide 4 x 3 layout the small story pictures use.
  const HR=44,HW=Math.sqrt(3)*HR,MW=300,MH=306;
  const hexC=i=>{const row=Math.floor(i/3),col=i%3;return [r((MW-3.5*HW)/2+HW/2+col*HW+(row%2?HW/2:0)),r(10+HR+row*1.5*HR)]};
  const HR4=37,HW4=Math.sqrt(3)*HR4;
  const hexC43=i=>{const row=Math.floor(i/4),col=i%4;return [r(165-1.5*HW4-HW4/4+col*HW4+(row===1?HW4/2:0)),r(50+row*1.5*HR4)]};
  const hexP=(cx,cy,R)=>{const w=Math.sqrt(3)*R/2;return `M${r(cx)} ${r(cy-R)}L${r(cx+w)} ${r(cy-R/2)}L${r(cx+w)} ${r(cy+R/2)}L${r(cx)} ${r(cy+R)}L${r(cx-w)} ${r(cy+R/2)}L${r(cx-w)} ${r(cy-R/2)}Z`};
  const LIGHTS=[[-20,6],[-10,13],[0,4],[10,14],[20,6],[-5,23],[7,25],[-17,18],[17,19],[0,14],[-26,13],[25,13]];
  ART.hexC=hexC;
  ART.map=(g,o)=>{o=o||{};const id=uid('map');
    const island=`<path d="M40 26C80 -2 160 2 212 8C262 12 294 40 290 90C288 130 297 170 292 212C288 262 272 298 220 303C170 308 110 301 70 298C30 294 8 264 10 222C12 182 2 142 8 102C12 66 16 42 40 26Z" fill="#16224e" stroke="#5ee6d6" stroke-opacity=".35" stroke-width="1.6" stroke-dasharray="4 5"/>`;
    let d='';for(let i=0;i<12;i++){const [cx,cy]=hexC(i),br=g.brain[i],sw=g.sw[i];
      d+=`<g class="dt-d ${o.dark&&o.dark[i]?'':'on'}" data-i="${i}" role="button" tabindex="0" aria-label="District ${i+1}, ${DT_BRAIN[br]?DT_BRAIN[br].name:''}${sw===1?', off switch':''}">
        <path class="dt-hex" d="${hexP(cx,cy,HR-2.8)}"/>
        <g class="dt-lights">${LIGHTS.map(([x,y],k)=>`<circle cx="${r(cx+x)}" cy="${r(cy+y-2)}" r="${k%3?2:2.7}"/>`).join('')}</g>
        <g class="dt-brain" transform="translate(${cx} ${r(cy-17)})">${brain(0,0,br,12.5)}</g>
        ${alert(cx+12,cy-28,6.4,'dt-alert')}
        ${sw?`<g class="dt-sw ${sw==='painted'?'painted':''}" transform="translate(${r(cx+16)} ${r(cy+4)})">${sw==='painted'?
          `<path d="${rr(0,0,14,18,3)}" fill="#7d8598" ${I('#7d8598',1.2)}/><path d="M7 13V5" stroke="#b9c0cf" stroke-width="2.4" stroke-linecap="round"/><path d="M0 5C3 4 4 9 7 7C9 6 11 8 14 6V2H0Z" fill="#b9c0cf"/><path d="M3 6V11M10 7V10" stroke="#b9c0cf" stroke-width="1.8" stroke-linecap="round"/>`
          :`<path d="${rr(0,0,14,18,3)}" fill="#2fae6c" ${I('#2fae6c',1.2)}/><g class="dt-lev"><path d="M7 13V5" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><path d="${ov(7,4.5,2.6)}" fill="${RED}"/></g>`}</g>`
          :`<g class="dt-sock" transform="translate(${r(cx+16)} ${r(cy+4)})"><path d="${rr(0,0,14,18,3)}" fill="none" stroke="#9fb0e0" stroke-width="1.4" stroke-dasharray="3 3"/><path d="M7 6V12M4 9H10" stroke="#9fb0e0" stroke-width="1.4" stroke-linecap="round"/></g>`}
      </g>`}
    const storm=`<g class="dt-storm">${[[60,40,1.4],[165,26,1.7],[252,62,1.4],[98,124,1.2],[222,150,1.3],[62,214,1.3],[196,246,1.4]].map(([x,y,s],k)=>cloud(x,y,s,k%2?'#3f4874':'#4a537e')).join('')}
      <g class="dt-rain" stroke="#a9c4f0" stroke-width="1.3" opacity=".75">${Array.from({length:44},(_,k)=>{const x=14+(k*67%276),y=34+(k*41%250);return `<path d="M${r(x)} ${y}l-3 10"/>`}).join('')}</g>
      <g class="dt-ice" fill="#dff4ff">${Array.from({length:18},(_,k)=>`<path d="${ov(20+(k*47%262),40+(k*59%250),1.5)}"/>`).join('')}</g></g>`;
    return `<svg viewBox="0 0 ${MW} ${MH}" class="dt-map" id="${id}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">${island}<path class="dt-ring" d="${ov(150,153,30)}" fill="none" stroke="#fff4c8" stroke-width="3"/>${d}${storm}<rect class="dt-flash" width="${MW}" height="${MH}" fill="#fff" opacity="0"/></svg>`};

  // ================= story pictures (VIZ.dt*): one per sentence =================
  const OSK={skin:SKIN[0],shirt:'#3a7a5a',hair:'#e8c87a',style:'curly',age:'kid',outfit:'hoodie'};
  const GRAN={skin:SKIN[1],shirt:'#c86b85',hair:'#e8e4ee',style:'bun',outfit:'jacket'};
  const AHM={skin:SKIN[3],shirt:'#e8a43a',hair:'#2a1712',style:'long',outfit:'jacket'};
  const DAD={skin:SKIN[0],shirt:'#5b7bd5',hair:'#a8834e',style:'short',outfit:'tee'};
  const NB1={skin:SKIN[4],shirt:'#38b07f',hair:'#1b1410',style:'short',outfit:'jacket'};
  const NB2={skin:SKIN[2],shirt:'#a99bff',hair:'#3a2418',style:'pony',outfit:'tee'};
  const KID2={skin:SKIN[5],shirt:'#ffd45c',hair:'#1b1410',style:'curly',age:'kid',outfit:'tee'};
  const MARIT={skin:SKIN[0],shirt:'#3f5a8a',hair:'#eeeae6',style:'bun',outfit:'jacket'};
  const FELIX={skin:SKIN[2],shirt:'#f2a52a',hair:'#9a8a80',style:'short',outfit:'jacket'};
  const CREW1={skin:SKIN[4],shirt:'#f2a52a',hair:'#1b1410',style:'short',outfit:'jacket'},CREW2={skin:SKIN[1],shirt:'#f2a52a',hair:'#c4552a',style:'pony',outfit:'jacket'};
  const YUSUF={skin:SKIN[3],shirt:'#f2a52a',hair:'#1a1416',style:'short',outfit:'jacket'};
  const LUMI={skin:SKIN[5],shirt:'#4aa86a',hair:'#1a1210',style:'curly',age:'kid',outfit:'hoodie'};
  const g=(k,x,y,s,extra)=>`<g transform="translate(${x} ${y}) scale(${s})" ${extra||''}>${G[k]()}</g>`;
  const radioAt=(x,y,s,crank)=>`<g transform="translate(${x} ${y}) scale(${s})">${G.radio(crank)}</g>`;
  const waves=(x,y,dir,n,c)=>Array.from({length:n||3},(_,k)=>`<path class="dtv-wave" style="--d:${(k*.45).toFixed(2)}s" d="M${x+dir*(6+k*7)} ${y-8-k*3}Q${x+dir*(11+k*8)} ${y} ${x+dir*(6+k*7)} ${y+8+k*3}" fill="none" stroke="${c||GOLD}" stroke-width="2.2" stroke-linecap="round"/>`).join('');
  const card=(x,y,w,h,icon,t,d)=>`<g class="dtv-pop" style="--d:${d}s"><path d="${rr(x,y,w,h,8)}" fill="#fff" ${I('#c9cede',1.2)}/>${icon}${txt(x+w/2,y+h-7,8,INK,t)}</g>`;
  const cal7=(x,y,w,cls)=>Array.from({length:7},(_,k)=>`<g class="${cls||''}" style="--d:${(k*.5).toFixed(1)}s"><path d="${rr(x+k*w,y,w-4,w-2,4)}" fill="#fff" ${I('#c9cede',1.1)}/><path d="${rr(x+k*w,y,w-4,7,3)}" fill="${RED}"/>${txt(x+k*w+(w-4)/2,y+w-6,9,INK,String(k+1))}</g>`).join('');
  const tableTop=(y,x0,x1,c)=>`<path d="M${x0} ${y}H${x1}V${y+6}H${x0}Z" fill="${c||'#a9744a'}" ${I(c||'#a9744a',1.2)}/><path d="M${x0+8} ${y+6}V${y+24}M${x1-8} ${y+6}V${y+24}" stroke="${dk(c||'#a9744a',.3)}" stroke-width="3.4" stroke-linecap="round"/>`;
  const leverBox=(x,y,s,pulled)=>`<g transform="translate(${x} ${y}) scale(${s})">${G.lever(pulled)}</g>`;
  const screenAI=(x,y,w,h,kind,state)=>`<path d="${rr(x,y,w,h,5)}" fill="#1c2346" ${O('#4a5280',2)}/><path d="${rr(x+4,y+4,w-8,h-8,3)}" fill="${state==='off'?'#2a3158':'#24306a'}"/>${state==='off'?txt(x+w/2,y+h/2+3,8,'#9fb0e0','PAUSED'):brain(x+w/2,y+h/2,kind,Math.min(w,h)*.26)}`;
  const islandHexes=(cx,cy,s,cls,fill)=>{let o='';for(let i=0;i<12;i++){const [hx,hy]=hexC43(i);o+=`<path class="${cls||''}" style="--d:${(i*.35).toFixed(2)}s" d="${hexP(cx+(hx-165)*s,cy+(hy-106)*s,(HR4-3)*s)}" fill="${fill?fill(i):'#2b3a78'}" stroke="#5ee6d6" stroke-opacity=".3" stroke-width="1"/>`}return o};
  const kittiwake=(x,y,s,flip,cls)=>`<g transform="translate(${x} ${y}) scale(${flip?-s:s} ${s})" class="${cls||''}"><path d="${ov(0,-5,7,4.6)}" fill="#fbfbf8" ${I('#c9cede',1)}/><path d="${ov(5,-10,3.6)}" fill="#fbfbf8" ${I('#c9cede',1)}/><path d="M-6 -6C-2 -9 3 -8 5 -5C1 -3 -3 -3 -6 -6Z" fill="#a9b3c4"/><path d="M-7 -6L-10 -4L-7 -3Z" fill="#2a2f40"/><path d="${ov(6,-10.5,.8)}" fill="${INK}"/><path d="M8.6 -10L11.6 -9.2L8.6 -8.4Z" fill="#f2cf3a"/></g>`;
  const flyBird=(x,y,s,cls,d)=>`<g class="${cls||''}" style="--d:${d||0}s"><path d="M${x-8*s} ${y}Q${x-4*s} ${y-5*s} ${x} ${y}Q${x+4*s} ${y-5*s} ${x+8*s} ${y}" fill="none" stroke="#fbfbf8" stroke-width="${2*s}" stroke-linecap="round"/></g>`;
  const towerShape=(x,gy,h,vines,cls)=>{const w=h*.26;return `<g class="${cls||''}"><path d="M${x-w/2} ${gy}L${x-w*.42} ${gy-h*.78}H${x+w*.42}L${x+w/2} ${gy}Z" fill="#b9b4aa" ${I('#8a857c',1.2)}/><path d="M${x-w*.8} ${gy-h*.78}H${x+w*.8}L${x+w*.7} ${gy-h*.92}H${x-w*.7}Z" fill="#3a3d55"/><path d="M${x-w*.85} ${gy-h*.92}H${x+w*.85}V${gy-h*.96}H${x-w*.85}Z" fill="#d8d3c8"/>
    ${Array.from({length:5},(_,k)=>`<path d="M${x-w*.28} ${gy-h*(.68-k*.12)}h${w*.18}v${h*.04}h-${w*.18}ZM${x+w*.1} ${gy-h*(.68-k*.12)}h${w*.18}v${h*.04}h-${w*.18}Z" fill="#3a3d55"/>`).join('')}
    ${vines?`<path d="M${x-w*.45} ${gy}C${x-w*.5} ${gy-h*.3} ${x-w*.2} ${gy-h*.5} ${x-w*.35} ${gy-h*.75}M${x+w*.3} ${gy}C${x+w*.4} ${gy-h*.2} ${x+w*.1} ${gy-h*.35} ${x+w*.2} ${gy-h*.5}" stroke="#3f8a40" stroke-width="${w*.16}" fill="none" stroke-linecap="round" stroke-dasharray="${w*.1} ${w*.06}"/>`:''}</g>`};

  Object.assign(VIZ,{
  // ---------------- Oskar's radio ----------------
  dtRadioDark:()=>pic('night',`${moon(262,26,10)}${gnd(130,'#2a2f5a','#353b6c')}
    ${house(18,130,58,52,'#5a5f88',false)}${house(196,130,58,48,'#5a5f88',false)}${house(104,130,66,62,'#6a6f98',false)}
    <path d="${rr(118,88,38,26,3)}" fill="#ffcf73" class="dtv-glow"/>${radioAt(124,88,.26)}${waves(150,98,1,3,'#ffe7a0')}
    <path d="M86 140H214" stroke="#454b7c" stroke-width="2" stroke-dasharray="8 7"/>`,'A dark street, and one warm window with a radio'),
  dtCrank:()=>pic('room',`${gnd(132,'#e2c49a','#cfae80')}${radioAt(30,40,.98,true)}
    <g transform="translate(176 36)"><path d="${rr(0,0,46,86,8)}" fill="#fff" ${O('#9aa3b8',2)}/><path d="${rr(16,-6,14,7,2)}" fill="#9aa3b8"/>
      ${[0,1,2,3,4].map(k=>`<path class="dtv-bar" style="--d:${(k*.5).toFixed(1)}s" d="${rr(6,68-k*15,34,11,3)}" fill="${k>2?'#3fbf7a':'#9ddf6a'}"/>`).join('')}</g>
    ${txt(250,62,9,'#5a3a1a','1 minute')}<path d="M232 72H268" stroke="#8a6a4a" stroke-width="1.6" marker-end="none"/><path d="M262 68L268 72L262 76" fill="none" stroke="#8a6a4a" stroke-width="1.6"/>${txt(250,90,9,'#5a3a1a','30 minutes')}${txt(250,102,8,'#8a6a4a','of news')}`,'Crank for a minute, listen for half an hour'),
  dtKitchen:()=>pic('room',`<path d="${rr(214,14,62,48,4)}" fill="#26305e" ${I('#8a6a4a',2)}/><path d="M245 14V62M214 38H276" stroke="#8a6a4a" stroke-width="2"/>${moon(260,28,5)}
    ${gnd(132,'#e2c49a','#cfae80')}
    <path d="${rr(10,80,72,52,4)}" fill="#4a5070" ${O('#4a5070',2)}/><path d="${rr(18,96,56,30,3)}" fill="#2a2e44" stroke="#6a7090" stroke-width="1.4"/><path d="M24 101H68" stroke="#8a90b0" stroke-width="2.4" stroke-linecap="round"/>
    ${[20,32,60,72].map(x=>`<path d="${ov(x,89,2.6)}" fill="#c9cede"/>`).join('')}<path d="M8 76H84V81H8Z" fill="#6a7090" ${I('#6a7090',1)}/>
    <g class="dtv-flame">${[22,30,38].map(x=>`<path d="M${x-3} 76C${x-3} 72 ${x} 69 ${x} 67C${x} 69 ${x+3} 72 ${x+3} 76Z" fill="#5b9bf0"/>`).join('')}${[54,62,70].map(x=>`<path d="M${x-3} 76C${x-3} 72 ${x} 69 ${x} 67C${x} 69 ${x+3} 72 ${x+3} 76Z" fill="#5b9bf0"/>`).join('')}</g>
    <path d="M17 72V56C17 53 43 53 43 56V72Z" fill="#9aa3b8" ${O('#9aa3b8',1.8)}/><path d="M13 59H17M43 59H47" stroke="${dk('#9aa3b8')}" stroke-width="2.4" stroke-linecap="round"/><path d="M20 58V68" stroke="#fff" stroke-width="2" opacity=".5" stroke-linecap="round"/>
    <path d="M52 72C50 64 54 60 62 60C70 60 74 64 72 72Z" fill="#e0533f" ${O('#e0533f',1.6)}/><path d="M72 64L80 60" stroke="${dk('#e0533f')}" stroke-width="2.4" stroke-linecap="round"/><path d="M58 60C58 56 66 56 66 60" fill="none" stroke="${dk('#e0533f')}" stroke-width="2"/>
    <g class="dtv-steam"><path d="M26 50Q22 44 27 38M36 50Q32 42 37 36M80 56Q84 50 80 44" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".85"/></g>
    ${tableTop(108,98,208)}${person(110,132,{...AHM,s:.98})}${person(138,132,{...NB2,s:.96})}${person(164,132,{...OSK,s:.92})}${person(190,132,{...GRAN,s:.96})}${person(236,132,{...NB1,s:1})}
    <path d="${ov(152,102,4)}" fill="#ffcf73" class="dtv-glow"/>`,'A whole street in one warm kitchen'),
  dtKidCrank:()=>pic('dim',`${gnd(132,'#4a3f52','#55485e')}${tableTop(104,40,170,'#8a6448')}${radioAt(86,60,.46,true)}
    ${person(62,132,{...OSK,s:1.25})}${waves(134,82,1,4)}
    ${person(200,132,{...GRAN,s:1.18})}${person(234,132,{...DAD,s:1.2})}${person(268,132,{...NB1,s:1.18})}`,'Oskar cranks the radio; the grown-ups listen'),
  dtNewsList:()=>pic('night',`${gnd(140,'#2a2f5a','#353b6c')}${radioAt(126,96,.5)}${waves(176,116,1,2,'#ffe7a0')}${waves(124,116,-1,2,'#ffe7a0')}
    ${card(14,22,84,56,`<path d="M36 31H51C55 31 57 33 57 37V40" stroke="#7a8098" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M44 31V25M39 24H49" stroke="#7a8098" stroke-width="3" stroke-linecap="round"/><path d="M57 44C54 48 54 51 57 51C60 51 60 48 57 44Z" fill="#5b9bf0"/><path d="M66 46Q63 42 66 38M70 46Q67 42 70 38" stroke="#ff8a5a" stroke-width="1.6" fill="none" stroke-linecap="round"/>`,'Warm water',0)}
    ${card(108,12,84,56,`<path d="M132 46V30H168V46" fill="#ffe2a8" stroke="#c9975a" stroke-width="1.4"/><path d="M128 30L134 22H166L172 30Z" fill="#e0533f"/><path d="M140 46V36H148V46" fill="#8a5a3a"/><path d="${rr(152,35,10,7,1)}" fill="#ffd45c"/>`,'Shops open',.6)}
    ${card(202,22,84,56,`${g('helmet',226,26,.36)}`,'Crews working',1.2)}`,'The news each night: warm water, open shops, crews at work'),
  dtLongTable:()=>pic('room',`${gnd(132,'#e2c49a','#cfae80')}${tableTop(104,22,278)}
    ${[[44,AHM],[82,NB2],[118,OSK],[154,GRAN],[192,DAD],[228,KID2],[262,NB1]].map(([x,o])=>person(x,132,{...o,s:o.age?.84:.9})).join('')}
    ${[60,100,140,180,220].map(x=>`<path d="${ov(x,101,7,2.4)}" fill="#fff" ${I('#c9cede',1)}/>`).join('')}
    <g transform="translate(36 10)">${Array.from({length:7},(_,k)=>`<g><path d="${ov(k*38+8,12,10)}" fill="${k<2?'#7a86b8':'#ffcf73'}" class="dtv-daydot" style="--d:${(k*.45).toFixed(2)}s"/>${txt(k*38+8,16,9,k<2?'#fff':'#5a3a1a',String(k+1))}</g>`).join('')}</g>
    ${txt(150,50,8.6,'#8a6a4a','day by day, the dinners got louder')}`,'Seven nights of dinners, from scared to happy'),

  // ---------------- Marit's newspaper ----------------
  dtPress:()=>pic('dim',`${gnd(134,'#4a3f52','#55485e')}<path d="M226 34H286" stroke="#8a6448" stroke-width="4" stroke-linecap="round"/><path d="${ov(262,20,22)}" fill="#ffcf73" opacity=".22" class="dtv-glow"/><path d="${rr(255,18,14,16,3)}" fill="#c9a040" ${I('#c9a040',1)}/><path d="M262 28C259 24 262 20 262 16C265 20 265 24 262 28Z" fill="#ffd45c" class="dtv-flame"/>
    ${[0,1,2,3].map(k=>`<g class="dtv-stack" style="--d:${(k*.6).toFixed(1)}s"><path d="M14 ${128-k*5}H58V${133-k*5}H14Z" fill="#f8f2e2" stroke="#b7ab90" stroke-width=".8"/></g>`).join('')}<path d="M14 133H58" stroke="#3a3040" stroke-width="2"/>
    <path d="M72 134V44H84V134M146 134V44H158V134" fill="#3a3446" ${O('#3a3446',1.6)}/><path d="${rr(66,32,98,16,4)}" fill="#4a4456" ${O('#4a4456',1.6)}/><path d="M74 38H152" stroke="#6a6476" stroke-width="2" stroke-linecap="round"/>
    <path d="${rr(78,104,74,10,2)}" fill="#5a4a4e" ${I('#5a4a4e',1)}/><path d="M84 96H146V104H84Z" fill="#fbf7ec" stroke="#b7ab90" stroke-width="1"/>${[99,101.5].map(y=>`<path d="M90 ${y}H${y>100?128:140}" stroke="#5a5468" stroke-width="1.2"/>`).join('')}
    <g class="dtv-press"><path d="M112 48V74" stroke="#2a2430" stroke-width="7"/>${[54,60,66].map(y=>`<path d="M108 ${y}L116 ${y+3}" stroke="#6a6476" stroke-width="1.4"/>`).join('')}<path d="${rr(86,74,58,10,2)}" fill="#6a6476" ${O('#6a6476',1.6)}/>
      <path d="M112 58L182 86" stroke="#2a2430" stroke-width="4" stroke-linecap="round"/><path d="${ov(184,87,5)}" fill="#a9744a" ${I('#a9744a',1)}/></g>
    ${person(204,134,{...MARIT,s:1.45})}`,'Printing the news by hand on the old press'),
  dtFrontPage:()=>pic('paper',`<g class="dtv-sway"><path d="${rr(56,8,188,146,4)}" fill="#fbf7ec" ${O('#b7ab90',2)}/>
    ${txt(150,26,12,INK,'THE MARROW POINT COURIER','font-family="Georgia,serif" textLength="160" lengthAdjust="spacingAndGlyphs"')}<path d="M66 31H234M66 34H234" stroke="${INK}" stroke-width=".8"/>
    ${txt(150,44,7,'#5a5468','BLACKOUT WEEK · DAY 3 · PRINTED BY HAND')}
    ${txt(150,66,19,INK,'ONE MISTAKE,','textLength="150" lengthAdjust="spacingAndGlyphs"')}${txt(150,88,19,INK,'EVERY TOWN','textLength="136" lengthAdjust="spacingAndGlyphs"')}
    <path d="${rr(68,98,62,46,2)}" fill="#d8d0bc"/>${towerShape(99,144,44,true)}
    ${[102,108,114,120,126,132,138].map(y=>`<path d="M138 ${y}H${y%12?232:220}" stroke="#8a826e" stroke-width="2" stroke-linecap="round"/>`).join('')}</g>`,'The front page from the third day'),
  dtCopies:()=>pic('table',`${Array.from({length:12},(_,k)=>{const x=24+(k%6)*46,y=k<6?96:146;return `<path class="dtv-dash" d="M150 34Q${(150+x+13)/2} ${y-46} ${x+13} ${y-36}" fill="none" stroke="#9fb0e0" stroke-width="1.2" stroke-dasharray="3 4" opacity=".7"/>`}).join('')}
    ${Array.from({length:12},(_,k)=>{const x=24+(k%6)*46,y=k<6?96:146;return `${house(x,y,26,24,'#c9b8a0',true)}${brain(x+13,y-33,'beacon',7.5)}`}).join('')}
    ${brain(150,22,'beacon',14)}${label(150,48,'one AI, Beacon, copied 12 times','#fff',7.6)}`,'Twelve districts, twelve copies of the same AI'),
  dtIceLines:()=>pic('storm',`${gnd(136,'#c9d6ea','#e8f0fa')}
    ${[30,150,270].map(x=>pole(x,136,96)).join('')}
    <g class="dtv-swing">${[-11,0,11].map(d=>`<path d="M${30+d} 43Q${90+d} 74 ${150+d} 43Q${210+d} 74 ${270+d} 43" fill="none" stroke="#2a3050" stroke-width="1.6"/>`).join('')}
      ${Array.from({length:16},(_,k)=>{const x=40+k*14+(k>7?14:0),t=((x-30)%120)/120,y=43+4*31*t*(1-t);return `<path d="M${x-1.6} ${r(y)}L${x} ${r(y+6+(k%3)*2)}L${x+1.6} ${r(y)}Z" fill="#e8f6ff" stroke="#a9c4f0" stroke-width=".6"/>`}).join('')}</g>
    <path d="${rr(166,70,40,30,4)}" fill="#e8eef6" ${O('#9aa3b8',1.8)}/><path d="${rr(170,74,32,18,2)}" fill="#1c2346"/><path class="dtv-squig" d="M172 84L176 80L179 88L183 76L186 90L190 78L194 86L200 82" fill="none" stroke="#ff8a5a" stroke-width="1.4" stroke-linejoin="round"/>${txt(186,98,5,'#5a6388','SENSOR')}
    <g class="dtv-snow" fill="#fff">${Array.from({length:22},(_,k)=>`<path d="${ov(8+k*13.5,10+(k*41%110),1.3)}"/>`).join('')}</g>`,'Ice on the lines, strange numbers on the sensors'),
  dtSameSecond:()=>pic('table',`${label(150,20,'7:42 PM','#fff',10)}
    ${Array.from({length:12},(_,k)=>{const x=14+(k%6)*47,y=k<6?92:150;return `<g class="dtv-lit">${house(x,y,30,26,'#c9b8a0',true)}</g><g class="dtv-dark">${house(x,y,30,26,'#6a6f98',false)}</g>${brain(x+15,y-37,'beacon',8.5)}${alert(x+24,y-46,5,'dtv-bang')}`}).join('')}`,'Every copy made the same mistake in the same second'),
  dtOneDifferent:()=>pic('night',`${Array.from({length:12},(_,k)=>{const x=14+(k%6)*47,y=k<6?84:148,lit=k===8;return `${house(x,y,30,26,lit?'#e8d8b8':'#5a5f88',lit)}${brain(x+15,y-36,lit?'tern':'beacon',8)}`}).join('')}
    <path d="${ov(139,136,30,18)}" fill="#ffd45c" opacity=".18" class="dtv-glow"/>
    ${[[-47,0],[47,0],[0,-64]].map(([dx,dy])=>`<path class="dtv-flow" d="M139 128Q${139+dx*.5+(dy?16:0)} ${128+dy*.5-14} ${139+dx} ${128+dy}" fill="none" stroke="#ffd45c" stroke-width="2.2" stroke-dasharray="4 5" stroke-linecap="round"/>`).join('')}
    ${label(150,18,'one district that thinks differently','#fff',7.6)}`,'One district with a different AI could have helped the rest'),
  // ---------------- Felix's lever ----------------
  dtLeverBox:()=>pic('dim',`${gnd(138,'#4a4554','#57505e')}${leverBox(40,18,1.1)}
    <path d="M100 70C130 70 140 60 170 60" fill="none" stroke="#2a2f40" stroke-width="3"/>${screenAI(170,34,90,62,'beacon','on')}${txt(215,112,8.6,'#e8e4f0','the AI that ran the grid')}`,'The tower’s off switch, wired to the AI'),
  dtRedBoard:()=>pic('dim',`<path d="${rr(150,10,136,82,6)}" fill="#1c2346" ${O('#4a5280',2)}/>${islandHexes(218,52,.34,'dtv-redpulse',()=>'#e0533f')}
    ${gnd(138,'#4a4554','#57505e')}${leverBox(20,46,.8)}${person(118,138,{...FELIX,s:1})}${person(160,138,{...CREW2,s:.98})}${person(196,138,{...CREW1,s:1})}
    <path d="M0 0H300V160H0Z" fill="#e0533f" opacity=".0" class="dtv-alarm"/>`,'The first night: every light on the board was red'),
  dtPainted:()=>pic('dim',`${gnd(138,'#4a4554','#57505e')}${leverBox(60,20,1.1)}
    <path d="M78 28C88 20 104 26 116 22C128 18 140 24 150 26C156 34 154 44 150 52C146 58 140 54 136 60C132 66 126 58 120 64C114 70 108 60 102 64C96 68 92 58 86 62C80 64 78 54 80 46C80 40 76 34 78 28Z" fill="#c9cede" opacity=".97"/>
    ${[90,106,124,142].map((x,k)=>`<path class="dtv-drip" style="--d:${(k*.7).toFixed(1)}s" d="M${x-3} 58C${x-3} 72 ${x+3} 72 ${x+3} 58Z" fill="#c9cede"/>`).join('')}<path d="M96 32C104 30 110 34 118 31" stroke="#fff" stroke-width="2.4" fill="none" opacity=".6" stroke-linecap="round"/>
    <g transform="translate(200 34) rotate(6)"><path d="${rr(0,0,76,58,4)}" fill="#fffaf0" ${O('#c9c0a8',1.6)}/>${txt(38,16,8,INK,'LAST TESTED')}${txt(38,42,19,'#e0533f','2024')}</g>`,'Nobody had tested it for years, and it was painted shut'),
  dtCrowbar:()=>pic('dim',`${gnd(138,'#4a4554','#57505e')}${leverBox(20,40,.96)}<path d="M68 63L150 104" stroke="#c8423a" stroke-width="5" stroke-linecap="round"/><path d="M68 63C62 60 62 54 67 52" fill="none" stroke="#c8423a" stroke-width="5" stroke-linecap="round"/>
    <g class="dtv-heave">${person(156,138,{...FELIX,s:1.12})}${person(186,138,{...CREW1,s:1.12})}${person(214,138,{...CREW2,s:1.08})}</g>
    ${clock(262,44,22,'dtv-spin','40 minutes')}`,'Three people and a crowbar, forty minutes'),
  dtSwitchDay:()=>pic('paper',`${[0,1,2].map(m=>`<g transform="translate(${16+m*94} 24)"><path d="${rr(0,0,84,94,6)}" fill="#fff" ${O('#c9c0a8',1.6)}/><path d="${rr(0,0,84,16,6)}" fill="#2fae6c"/>${txt(42,12,8,'#fff',['MAY','JUNE','JULY'][m])}
      ${Array.from({length:28},(_,k)=>{const c=k%7,rw=Math.floor(k/7),x=8+c*10.5,y=28+rw*15;const sat=k===([5,1,6][m]);return `<path d="${ov(x+2,y,2)}" fill="${sat?'#2fae6c':'#c9cede'}"/>${sat?`<path class="dtv-ring" style="--d:${m*.6}s" d="${ov(x+2,y,6)}" fill="none" stroke="#e0533f" stroke-width="1.8"/>`:''}`}).join('')}</g>`).join('')}
    ${txt(150,146,11,INK,'Switch Day: the first Saturday of every month')}`,'Every switch is tested on the first Saturday of every month'),
  dtTwoSec:()=>pic('dim',`${gnd(138,'#4a4554','#57505e')}${leverBox(16,24,1,true)}
    <g transform="translate(140 30)"><path d="${ov(0,18,18)}" fill="#fff" ${O('#9aa3b8',2)}/><path d="M-4 -3H4V1H-4Z" fill="#9aa3b8"/>${txt(0,24,15,INK,'2 s')}</g>
    ${screenAI(182,18,52,42,'tern','off')}${screenAI(238,18,52,42,'puffin','on')}<path class="dtv-flow" d="M232 76H294" stroke="#3fbf7a" stroke-width="2.4" stroke-dasharray="4 4"/>${txt(236,96,8,'#e8e4f0','a different brain takes over')}
    ${house(194,138,30,26,'#e8d8b8',true)}${house(238,138,30,26,'#e8d8b8',true)}`,'Two seconds: the switch works, and another brain takes over'),

  // ---------------- Yusuf's helmet ----------------
  dtHelmetNight:()=>pic('night',`${gnd(122,'#2a2f5a','#353b6c')}<path d="M0 132H300V150H0Z" fill="#3a3f62"/><path d="M0 141H300" stroke="#c9cede" stroke-width="1.6" stroke-dasharray="12 10"/>
    <g class="dtv-drive"><path d="M150 112H236V136H150Z" fill="#f2a52a" ${O('#f2a52a',2)}/><path d="M236 118H262L272 128V136H236Z" fill="#f2a52a" ${O('#f2a52a',2)}/><path d="M240 120H258L264 128H240Z" fill="#a9d8f2"/>
      <path d="${ov(170,138,7)}${ov(254,138,7)}" fill="#2a2f40"/><path d="M272 128L300 118V142Z" fill="#fff4c4" opacity=".55"/><path d="M158 118H226" stroke="#fff" stroke-width="3" stroke-dasharray="8 6"/></g>
    ${g('helmet',14,36,1)}`,'Yusuf’s helmet, and the crew truck at night'),
  dtByHand:()=>pic('table',`${islandHexes(150,82,.62,'dtv-seq',()=>'#2b3a78')}${islandHexes(150,82,.62,'dtv-seqlit',()=>'#ffd45c')}
    ${txt(150,152,8.6,'#cfd8f6','one district at a time')}`,'Turning the power back on by hand, one district at a time'),
  dtWhoFirst:()=>pic('room',`${gnd(134,'#e2c49a','#cfae80')}${tableTop(110,62,238)}<path d="M120 106H180V110H120Z" fill="#fffaf0"/>
    ${person(96,134,{...YUSUF,s:1.15})}${person(150,134,{...CREW2,s:1.1})}${person(204,134,{...CREW1,s:1.15})}
    ${card(18,10,78,50,`<path d="${rr(48,18,16,16,3)}" fill="#fff" stroke="#e0533f" stroke-width="1.6"/><path d="M56 21V31M51 26H61" stroke="#e0533f" stroke-width="3" stroke-linecap="round"/>`,'Hospital',0)}
    ${card(111,4,78,50,`<path d="M150 14C144 23 142 27 142 30C142 35 146 38 150 38C154 38 158 35 158 30C158 27 156 23 150 14Z" fill="#5b9bf0"/>`,'Water pumps',.4)}
    ${card(204,10,78,50,`<path d="M234 36V25L244 18L254 25V36Z" fill="#ffe2a8" stroke="#c9975a" stroke-width="1.4"/><path d="M244 33C240 30 240 26 242.5 26C243.5 26 244 27.3 244 27.3C244 27.3 244.5 26 245.5 26C248 26 248 30 244 33Z" fill="#e0533f"/>`,'Care home',.8)}`,'Who gets power first? People had to decide'),
  dtHelmetList:()=>pic('paper',`<g transform="translate(18 30) scale(1.2)">${G.helmet()}</g>
    <g transform="translate(150 18) rotate(3)"><path d="${rr(0,0,132,120,4)}" fill="#fffef6" ${O('#c9c0a8',1.6)}/>${[24,46,68,90,112].map(y=>`<path d="M8 ${y}H124" stroke="#a9c4f0" stroke-width=".8"/>`).join('')}
      ${[['1. Hospital',20],['2. Water pumps',42],['3. Care home,',64],['    Kelda Hill',86]].map(([t,y],k)=>`<text x="12" y="${y}" font-size="13" fill="#2a3a8a" font-family="'Segoe Print','Bradley Hand','Comic Sans MS',cursive" class="dtv-write" style="--d:${(k*.5).toFixed(1)}s">${t}</text>`).join('')}</g>`,'The list Yusuf wrote inside his helmet'),
  dtSevenDays:()=>pic('table',`<g transform="translate(20 14)">${cal7(0,0,38,'dtv-daypop')}</g>
    <path d="${rr(30,70,240,16,8)}" fill="#1c2346" ${I('#4a5280',1)}/><path class="dtv-grow" d="${rr(30,70,240,16,8)}" fill="#ffd45c"/>
    ${txt(150,104,10,'#fff','120,000 homes back on')}
    ${Array.from({length:9},(_,k)=>`<g class="dtv-on" style="--d:${(k*.4).toFixed(1)}s">${house(22+k*30,150,22,22,'#e8d8b8',true)}</g>`).join('')}`,'Seven days to reach every home'),
  dtSignOff:()=>pic('room',`<g transform="translate(36 14)"><path d="${rr(0,0,156,128,12)}" fill="#2a2f50" ${O('#2a2f50',2)}/><path d="${rr(8,8,140,112,6)}" fill="#f4f7fc"/>
      ${brain(24,27,'puffin',9)}<text x="40" y="25" font-size="8.4" fill="${INK}" ${F}>Plan: repair Line 7</text><text x="40" y="36" font-size="7.4" fill="#e0533f" ${F}>2,400 homes off, 3 hours</text>
      <path d="M18 52H138M18 62H124M18 72H132" stroke="#c9cede" stroke-width="2" stroke-linecap="round"/>
      <path d="M18 98H138" stroke="${INK}" stroke-width="1"/><path class="dtv-sign" d="M22 94C28 82 32 100 38 88C42 80 44 96 50 90C56 84 60 94 70 88" fill="none" stroke="#2a3a8a" stroke-width="2" stroke-linecap="round"/>${txt(78,112,7,'#5a6388','signed by a person')}</g>
    ${person(244,150,{...YUSUF,shirt:'#3a4a3a',s:1.7})}`,'The AI plans the change; a person signs it'),
  // ---------------- Lumi's nest ----------------
  dtNewCenter:()=>pic('day',`${sun(40,26,9)}${gnd(126,'#8fc070','#7cb060')}${towerShape(76,126,104,true)}<path d="${rr(54,104,44,12,2)}" fill="#fff" ${I('#c9cede',1)}/>${txt(76,113,7,INK,'CLOSED')}
    <path d="M168 126V86H284V126Z" fill="#eef1f6" ${O('#9aa3b8',2)}/><path d="M168 86H284" stroke="#9aa3b8" stroke-width="4"/>${[180,206,232,258].map(x=>`<path d="${rr(x,96,18,12,2)}" fill="#a9d8f2"/>`).join('')}
    ${[['tern',194],['puffin',226],['heron',258]].map(([k,x],i)=>`<g class="dtv-blink" style="--d:${i*.4}s">${brain(x,74,k,8)}</g>`).join('')}`,'The old tower, empty, and the new control center'),
  dtThreeBrains:()=>pic('table',`${islandHexes(150,96,.56,'',i=>['#22b8a8','#f2a33a','#9b7bf0'][[0,0,1,1,0,0,1,2,2,2,1,2][i]])}
    ${[['tern',40,'Team 1'],['puffin',150,'Team 2'],['heron',260,'Team 3']].map(([k,x,t],i)=>`${brain(x,22,k,11)}${txt(x,46,8,'#cfd8f6',t)}`).join('')}`,'Three brains from three teams, each running part of the island'),
  dtCliff:()=>pic('day',`<path d="M0 100Q150 96 300 100V160H0Z" fill="#5a98c2"/><path d="M0 104H300" stroke="#fff" stroke-width="1" opacity=".5" stroke-dasharray="14 10"/>
    <path d="M0 22C22 18 40 26 60 22L96 30C102 60 92 96 100 160H0Z" fill="#8a8380" ${O('#8a8380',2)}/>${[40,58,76].map((y,k)=>`<path d="M${20+k*10} ${y}H${62+k*6}" stroke="#6a6460" stroke-width="2.4"/>${kittiwake(36+k*12,y,1,k%2)}${kittiwake(56+k*8,y,1,!(k%2))}`).join('')}
    ${towerShape(228,160,160,true)}${[48,72,96].map((y,k)=>`${kittiwake(212,y,1,k%2)}${kittiwake(244,y+4,1,!(k%2))}`).join('')}
    ${flyBird(150,30,1.2,'dtv-fly',0)}${flyBird(176,44,1,'dtv-fly',.6)}`,'To a kittiwake, the tower is just another cliff'),
  dtCount:()=>pic('day',`${gnd(128,'#8fc070','#7cb060')}${person(76,142,{...LUMI,s:1.6})}
    <path d="M70 86L76 95L82 86" stroke="#2a2f40" stroke-width="1.2" fill="none"/><path d="${rr(68,93,7,10,2)}${rr(77,93,7,10,2)}" fill="#2a2f40"/><path d="M69.5 101H73.5M78.5 101H82.5" stroke="#7fd8ff" stroke-width="1.6" stroke-linecap="round"/>
    <g transform="translate(150 18) rotate(-3)"><path d="${rr(0,6,112,124,6)}" fill="#c9975a" ${O('#c9975a',2)}/><path d="${rr(8,14,96,110,3)}" fill="#fff"/><path d="${rr(38,0,36,12,3)}" fill="#9aa3b8"/>
      ${txt(56,38,9,'#5a6388','NESTS LAST SPRING')}${txt(56,76,34,INK,'412','class="dtv-pulse"')}
      ${Array.from({length:4},(_,k)=>`<path class="dtv-tally" style="--d:${(k*.35).toFixed(2)}s" d="M${22+k*20} 92V112M${26+k*20} 92V112M${30+k*20} 92V112M${34+k*20} 92V112M${18+k*20} 110L${38+k*20} 94" stroke="#2a3a8a" stroke-width="1.8" stroke-linecap="round"/>`).join('')}</g>`,'Lumi counts 412 nests'),
  dtChicks:()=>pic('day',`<path d="M0 104H300V160H0Z" fill="#b9b4aa"/><path d="M0 104H300" stroke="#8a857c" stroke-width="3"/><g transform="translate(70 30) scale(1.6)">${G.nest()}</g>
    ${[[214,40],[226,30],[238,40]].map(([x,y],k)=>`<path class="dtv-wave" style="--d:${k*.3}s" d="M${x} ${y}q4 -6 8 0" fill="none" stroke="#e0533f" stroke-width="2" stroke-linecap="round"/>`).join('')}
    <g class="dtv-land">${kittiwake(252,60,2.2,true)}</g>`,'Two chicks, very loud, on the third ledge')
  });
  return ART})();

// The storm table's island (src/missions/darktower.js calls this at render time).
function dtMapSVG(grid,opts){return DT_ART.map(grid,opts)}
