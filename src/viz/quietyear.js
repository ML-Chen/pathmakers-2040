// quietyear.js — pictures for the Lantern Garden (Quiet Year memorial, Varrow, 2030).
// QY_ART.<key>() returns an SVG string with class "qyart" and a transparent background: the six things people left,
// the lantern, the memorial stone and the "Who does what?" job icons. VIZ.qy*() are the story pictures, one per sentence.
// Style: Bezier-built forms, two outline weights (2.5 contour / 1.4 detail) in a darkened fill colour,
// flat fill + one shade + one highlight per object, light from the upper left.
// Every gradient / clip / path id is unique per call (counter), so copies can share a page.
const QY_ART=(()=>{
  let N=0;const uid=p=>'qy'+p+(++N);
  const r=v=>Math.round(v*10)/10;
  const rgb=c=>{c=String(c||'#888').trim().replace('#','');if(c.length===3)c=c.replace(/./g,'$&$&');const n=parseInt(c.slice(0,6),16);return isNaN(n)?[136,136,136]:[n>>16&255,n>>8&255,n&255]};
  const mix=(a,b,t)=>{const A=rgb(a),B=rgb(b);return '#'+A.map((v,i)=>Math.max(0,Math.min(255,Math.round(v+(B[i]-v)*t))).toString(16).padStart(2,'0')).join('')};
  const INK='#1f2340',VI='#6c5ce7',TE='#16b3a6',CO='#ff7a6b',GO='#f5b82e',GR='#1fa774',PA='#fffaf0',WH='#ffffff';
  const dk=(c,t)=>mix(c,INK,t==null?.55:t), lt=(c,t)=>mix(c,WH,t==null?.45:t);
  const O=c=>`stroke="${dk(c)}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"`;
  const I=c=>`stroke="${dk(c)}" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"`;
  const F='font-family="Nunito,Fredoka,sans-serif" font-weight="800"';
  // rounded rectangle as a path (quadratic corners)
  const rr=(x,y,w,h,q)=>`M${r(x+q)} ${y}H${r(x+w-q)}Q${r(x+w)} ${y} ${r(x+w)} ${r(y+q)}V${r(y+h-q)}Q${r(x+w)} ${r(y+h)} ${r(x+w-q)} ${r(y+h)}H${r(x+q)}Q${x} ${r(y+h)} ${x} ${r(y+h-q)}V${r(y+q)}Q${x} ${y} ${r(x+q)} ${y}Z`;
  // oval from four cubic arcs
  const ov=(cx,cy,rx,ry)=>{ry=ry==null?rx:ry;const k=.552;return `M${r(cx-rx)} ${r(cy)}C${r(cx-rx)} ${r(cy-ry*k)} ${r(cx-rx*k)} ${r(cy-ry)} ${r(cx)} ${r(cy-ry)}C${r(cx+rx*k)} ${r(cy-ry)} ${r(cx+rx)} ${r(cy-ry*k)} ${r(cx+rx)} ${r(cy)}C${r(cx+rx)} ${r(cy+ry*k)} ${r(cx+rx*k)} ${r(cy+ry)} ${r(cx)} ${r(cy+ry)}C${r(cx-rx*k)} ${r(cy+ry)} ${r(cx-rx)} ${r(cy+ry*k)} ${r(cx-rx)} ${r(cy)}Z`};
  const shadow=(cx,cy,rx,ry)=>`<path d="${ov(cx,cy,rx,ry||rx*.15)}" fill="${INK}" opacity=".18"/>`;
  const svg=(vb,body)=>`<svg viewBox="${vb}" class="qyart" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${body}</svg>`;
  const txt=(x,y,s,fill,t,extra)=>`<text x="${x}" y="${y}" font-size="${s}" fill="${fill}" text-anchor="middle" ${F}${extra?' '+extra:''}>${t}</text>`;

  // a tiny smiling face on a video-call tile
  const callFace=(x,y,w,h,bg,skin,hair,style)=>{
    const cx=x+w/2,cy=y+h*.46;let hr='';
    if(style===0)hr=`<path d="M${r(cx-6.6)} ${r(cy+1)}C${r(cx-7.4)} ${r(cy-9)} ${r(cx+7.4)} ${r(cy-9)} ${r(cx+6.6)} ${r(cy+1)}C${r(cx+5)} ${r(cy-4)} ${r(cx-1)} ${r(cy-5.5)} ${r(cx-6.6)} ${r(cy+1)}Z" fill="${hair}"/>`;
    if(style===1)hr=`<path d="M${r(cx-7)} ${r(cy+6)}C${r(cx-9)} ${r(cy-10)} ${r(cx+9)} ${r(cy-10)} ${r(cx+7)} ${r(cy+6)}C${r(cx+6)} ${r(cy-2)} ${r(cx+4)} ${r(cy-4.5)} ${r(cx)} ${r(cy-4.5)}C${r(cx-4)} ${r(cy-4.5)} ${r(cx-6)} ${r(cy-2)} ${r(cx-7)} ${r(cy+6)}Z" fill="${hair}"/>`;
    if(style===2)hr=`<path d="M${r(cx-6)} ${r(cy-2)}C${r(cx-5)} ${r(cy-9)} ${r(cx+5)} ${r(cy-9)} ${r(cx+6)} ${r(cy-2)}Q${r(cx)} ${r(cy-5)} ${r(cx-6)} ${r(cy-2)}Z" fill="${hair}"/><path d="${ov(cx,cy-8.2,2.6)}" fill="${hair}"/>`;
    if(style===3)hr=`<path d="M${r(cx-6.4)} ${r(cy-1)}C${r(cx-6)} ${r(cy-8.5)} ${r(cx+6)} ${r(cy-8.5)} ${r(cx+6.4)} ${r(cy-1)}C${r(cx+3)} ${r(cy-4)} ${r(cx-3)} ${r(cy-4)} ${r(cx-6.4)} ${r(cy-1)}Z" fill="${hair}"/>`;
    return `<path d="${rr(x,y,w,h,2.5)}" fill="${bg}"/>
      <path d="M${r(x+1.5)} ${r(y+h)}C${r(x+2)} ${r(y+h-7)} ${r(x+w-2)} ${r(y+h-7)} ${r(x+w-1.5)} ${r(y+h)}Z" fill="${lt(bg,.55)}"/>
      <path d="${ov(cx,cy,5.6,6.4)}" fill="${skin}"/>${hr}
      <path d="${ov(cx-2.1,cy+.6,.8,1)}${ov(cx+2.1,cy+.6,.8,1)}" fill="${INK}"/>
      <path d="M${r(cx-2.4)} ${r(cy+3)}Q${r(cx)} ${r(cy+5.4)} ${r(cx+2.4)} ${r(cy+3)}" fill="none" stroke="${INK}" stroke-width="1.4" stroke-linecap="round"/>
      <path d="${ov(cx-3.6,cy+2.6,1.2,.8)}${ov(cx+3.6,cy+2.6,1.2,.8)}" fill="${CO}" opacity=".55"/>`;
  };

  // a small paper lantern glyph (used on the sticker, the drawing and the stone)
  const miniLantern=(cx,cy,s,col,line)=>{const L=line||dk(col);return `<g transform="translate(${cx} ${cy}) scale(${s})">
    <path d="M0 -13V-10" stroke="${L}" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M-4 -10H4Q5 -10 5 -8.5H-5Q-5 -10 -4 -10Z" fill="${L}"/>
    <path d="M-4 -8.5C-11 -6 -11 6 -4 8.5H4C11 6 11 -6 4 -8.5Z" fill="${col}" stroke="${L}" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M0 -8.5V8.5M-4.5 -7.6C-7.5 -3 -7.5 3 -4.5 7.6M4.5 -7.6C7.5 -3 7.5 3 4.5 7.6" fill="none" stroke="${L}" stroke-width="1" opacity=".6"/>
    <path d="M-5 8.5H5Q5 10 4 10H-4Q-5 10 -5 8.5Z" fill="${L}"/><path d="M0 10V13.5" stroke="${L}" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M-3.8 -5C-6 -2 -6 1.5 -4.6 4" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".7"/></g>`};

  const ART={
  // 1 ── a teenager's old 2026 phone, scuffed, sticker on the case, family video call on screen
  phone(){
    const cl=uid('phc'),C=VI,cx=60;
    const tiles=[[41,24,lt(GO,.35),'#f2c9a5','#5a3a2a',0],[60.5,24,lt(TE,.4),'#c98d63','#2c2233',1],[41,52.5,lt(CO,.4),'#8a5a3c','#1f1a24',2],[60.5,52.5,lt(VI,.5),'#f6d2b4','#b9b5c9',3]];
    return svg('0 0 120 120',`${shadow(60,112,30,4)}
    <defs><clipPath id="${cl}"><path d="${rr(40,22,40,72,3)}"/></clipPath></defs>
    <g transform="rotate(-8 60 60)">
      <path d="${rr(32,9,56,102,12)}" fill="${C}" ${O(C)}/>
      <path d="M84 16C87 24 87 96 84 104Q82 108 76 109.5H70Q80 106 81 98C82.5 80 82.5 34 81 18Q80 13 76 11Q82 11 84 16Z" fill="${dk(C,.28)}"/>
      <path d="M36 22C35 40 35 70 36 92" fill="none" stroke="${lt(C,.5)}" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>
      <path d="M36.5 15.5Q37 13 39.5 12.8" fill="none" stroke="${lt(C,.5)}" stroke-width="1.4" stroke-linecap="round"/>
      <path d="${rr(37,14,46,92,8)}" fill="${INK}"/>
      <path d="${rr(40,22,40,72,3)}" fill="#dfe8ff"/>
      <g clip-path="url(#${cl})">${tiles.map(t=>callFace(t[0],t[1],18.5,27,t[2],t[3],t[4],t[5])).join('')}
        <path d="M40 22H60L40 50Z" fill="#fff" opacity=".16"/></g>
      <path d="${rr(42,83,36,9,4.5)}" fill="${mix(INK,'#fff',.15)}"/>
      <path d="${ov(51,87.5,3)}" fill="${lt(TE,.2)}"/><path d="${rr(56,85,14,5,2.5)}" fill="${CO}"/>
      <path d="M61 87.5H65" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>
      <path d="${rr(53,16.3,14,3.4,1.7)}" fill="${mix(INK,'#000',.4)}"/><path d="${ov(64.8,18,.9)}" fill="${lt(TE,.3)}"/>
      <path d="${rr(52,98.5,16,2.6,1.3)}" fill="#fff" opacity=".55"/>
      <path d="M43 103.5L47 101.5M76 12.5L79 14M85 60L85.4 66" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".55"/>
      <g transform="translate(83 22) rotate(16)">
        <path d="M0 -10.5Q1.8 -10.5 3 -5.6Q3.6 -3.4 6.4 -3.2Q11.6 -2.8 10.6 -0.6Q9.6 1.2 5 4Q4.2 4.8 5.2 8Q6.8 12.4 4.6 12Q2.6 11.6 0 9Q-2.6 11.6 -4.6 12Q-6.8 12.4 -5.2 8Q-4.2 4.8 -5 4Q-9.6 1.2 -10.6 -0.6Q-11.6 -2.8 -6.4 -3.2Q-3.6 -3.4 -3 -5.6Q-1.8 -10.5 0 -10.5Z" fill="${PA}" ${O(GO)}/>
        <path d="M0 -6.8Q1 -6.8 1.8 -3.4Q2.4 -1.6 4.4 -1.4Q7.4 -1.2 6.8 0Q6.2 1 3.4 2.8Q2.6 3.6 3.4 6Q4.4 8.6 3 8.4Q1.6 8 0 6.2Q-1.6 8 -3 8.4Q-4.4 8.6 -3.4 6Q-2.6 3.6 -3.4 2.8Q-6.2 1 -6.8 0Q-7.4 -1.2 -4.4 -1.4Q-2.4 -1.6 -1.8 -3.4Q-1 -6.8 0 -6.8Z" fill="${GO}"/>
        <path d="M0.8 2.4Q2.4 4.4 3.2 6.6Q1.6 5.6 0 4.4Z" fill="${dk(GO,.3)}"/>
        <path d="M-2.6 -1.4Q-1.4 -1.8 -.8 -4" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/></g>
    </g>`)},

  // 2 ── hand-lettered bakery door sign on a string
  sign(){
    const P=PA,BR='#e39a45';
    return svg('0 0 120 120',`<g transform="rotate(-3 60 8)">
      <path d="M29 40Q44 22 60 9Q76 22 91 40" fill="none" ${I('#b08a5a')}/>
      <path d="M14 34C40 31 80 33.5 106 32C108 58 106.5 86 107.5 111C80 113 40 110.5 13 112C12 86 14.5 60 14 34Z" fill="${P}" ${O('#d8c49a')}/>
      <path d="M15.5 101C40 103 80 103.5 106.4 101.5L106.8 109.6C80 111.6 40 109.2 14.5 110.5Z" fill="${mix(P,'#d8c49a',.45)}"/>
      <path d="M19 40C40 37.5 70 38.5 88 37.6" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M19.5 39.5C42 37 80 38.5 101.5 37.5C103 60 101.5 82 102.4 105C80 106.6 42 104.6 18.6 106C18 82 19.8 60 19.5 39.5Z" fill="none" stroke="${CO}" stroke-width="1.4" stroke-dasharray="5 3" stroke-linecap="round" opacity=".8"/>
      <path d="${ov(29,40,2.4)}${ov(91,40,2.4)}" fill="${dk('#d8c49a',.4)}"/>
      ${txt(60,58,20,CO,'Closed','textLength="70" lengthAdjust="spacingAndGlyphs"')}
      ${txt(60,73.4,12,VI,'for now','textLength="44" lengthAdjust="spacingAndGlyphs"')}
      <path d="M18 98C16 87 22.5 80.5 32 80.5C41.5 80.5 48 87 46 98Q32 100 18 98Z" fill="${BR}" ${O(BR)}/>
      <path d="M20 96.4C19.6 94 19.8 92.2 20.6 91Q32 93.8 43.4 91C44.2 92.2 44.4 94 44 96.4Q32 98.4 20 96.4Z" fill="${dk(BR,.22)}"/>
      <path d="M24 88Q27 84 30 83.5M31 88Q34 84 37 83.5M38 89.5Q40.5 86.4 42 86" fill="none" ${I(BR)}/>
      <path d="M22.5 86Q24 82.4 28 81.6" fill="none" stroke="${lt(BR,.6)}" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M27 77Q25 74.5 27 72.5Q29 70.5 27 68M36 77Q34 74.5 36 72.5Q38 70.5 36 68" fill="none" stroke="${GO}" stroke-width="1.4" stroke-linecap="round"/>
      ${txt(75,86,8.4,INK,'Bread for','textLength="36" lengthAdjust="spacingAndGlyphs"')}
      ${txt(75,95,8.4,INK,'nurses','textLength="27" lengthAdjust="spacingAndGlyphs"')}
      <path d="M52 101.6Q56 100.6 60 101.4M57.6 99.2L60.4 101.4L57.6 103.6" fill="none" stroke="${TE}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
      ${txt(80,104,8.4,TE,'back door','textLength="36" lengthAdjust="spacingAndGlyphs"')}
    </g>
    <path d="${ov(60,8,3.4)}" fill="${GO}" ${I(GO)}/><path d="${ov(59,7,1)}" fill="#fff"/>`)},

  // 3 ── the first early-warning wastewater tester: hand-built box, water sample window, antenna, green light, tape label, hose to a drain pipe
  sensor(){
    const g=uid('sng'),C=TE,TP='#f3dfa0';
    return svg('0 0 120 120',`<defs><radialGradient id="${g}"><stop offset="0" stop-color="${GR}" stop-opacity=".55"/><stop offset="1" stop-color="${GR}" stop-opacity="0"/></radialGradient></defs>
    ${shadow(60,104,46,5)}
    <path d="M76 39C78 30 80 22 84 13" fill="none" ${O('#8c93ad')}/><path d="M76 39C78 30 80 22 84 13" fill="none" stroke="#c9cee0" stroke-width="1.4" stroke-linecap="round"/>
    <path d="${ov(84.5,12,4)}" fill="${CO}" ${I(CO)}/><path d="${ov(83.3,10.8,1.2)}" fill="#fff"/>
    <path d="M18 47C18.4 46 19 45.5 20 45.4L28 37C28.8 36.3 29.4 36 30.4 36H96C97.6 36 98.4 36.8 98.4 38.4V88C98.4 89 98 89.8 97.4 90.4L89.6 99C89 99.6 88.2 100 87.2 100H20.4C19 100 18 99 18 97.6Z" fill="${C}" ${O(C)}/>
    <path d="M87.6 47.4L97.6 37.4C98.2 38 98.4 38.4 98.4 39V88C98.4 89 98 89.8 97.4 90.4L89.6 99C89 99.6 88.2 99.6 87.6 99.6Z" fill="${dk(C,.3)}"/>
    <path d="M20 45.4H87.6L97.4 37.2" fill="none" ${I(C)}/><path d="M87.6 45.6V99.4" fill="none" ${I(C)}/>
    <path d="M31 39.4H70" stroke="${lt(C,.55)}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="${ov(40,71,16.5)}" fill="${dk(C,.62)}" ${I(C)}/>
    <path d="${ov(40,71,13.4)}" fill="#7cc4ec"/><path d="M27 73C31 69.5 35 76.5 40 73S49 69.5 53.4 73C53 80 47.6 84.4 40 84.4S27 80 27 73Z" fill="#4a9ad8"/>
    <path d="M29.5 76.6C33 74 36.4 79 40.2 76.6S47.6 74 50.8 76.4" fill="none" stroke="#bfe8ff" stroke-width="1.4" stroke-linecap="round"/>
    <path d="${ov(34.5,66,1.8)}${ov(44,63.5,1.2)}${ov(47.5,68.5,1.5)}" fill="#e8f7ff"/>
    <path d="${ov(40,71,13.4)}" fill="none" stroke="#e3ecf4" stroke-width="1.4"/>
    <path d="M29.5 64.5Q32 58 38.5 56" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".8"/>
    <path d="${ov(23,50,1.3)}${ov(83,50,1.3)}${ov(23,95,1.3)}${ov(83,95,1.3)}" fill="${dk(C,.45)}"/>
    <path d="${ov(76,55,9)}" fill="url(#${g})"/><path d="${ov(76,55,4.2)}" fill="${GR}" ${I(GR)}/><path d="${ov(74.8,53.8,1.3)}" fill="#fff"/>
    <path d="M64 53H68M64 57H68" stroke="${dk(C,.45)}" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M60.5 64H84M60.5 68H84" stroke="${dk(C,.3)}" stroke-width="1.4" stroke-linecap="round"/>
    <g transform="rotate(-7 74 85)">
      <path d="M53 78.6L56 78.2L94 78.4L96 80.2L94.4 82L96 84L94.4 86L96 88L94 89.6L56 90L53 90.4L54.6 88.4L53 86.4L54.6 84.4L53 82.4L54.6 80.4Z" fill="${TP}" ${I(TP)} opacity=".96"/>
      <path d="M55.6 88.6H94" stroke="${dk(TP,.15)}" stroke-width="1.4" opacity=".6"/>
      ${txt(75,87.2,8.6,INK,'SNIFFER v1','textLength="35" lengthAdjust="spacingAndGlyphs" font-style="italic"')}</g>
    
    <path d="M98.4 74C107 74 110 82 107 90C105 96 106 100 108 104" fill="none" stroke="#3d5a80" stroke-width="5.6" stroke-linecap="round"/><path d="M98.4 74C107 74 110 82 107 90C105 96 106 100 108 104" fill="none" stroke="#7aa6d8" stroke-width="3" stroke-linecap="round"/>
    <path d="M100 103H116V111H100Z" fill="#9aa0bd" ${I('#9aa0bd')}/><path d="M98 101.6H118V104.4H98Z" fill="#c9cee0" ${I('#9aa0bd')}/>`)},

  // 4 ── DNA print-shop order slip with a red HOLD FOR REVIEW stamp
  slip(){
    const P=PA,ST='#e0484a';let top='M26 18';for(let x=26;x<94;x+=6)top+=`Q${x+1.5} 14.5 ${x+3} 15.5Q${x+4.5} 16.6 ${x+6} 18`;
    const bars=[2,1,1,3,1,2,1,1,2,3,1,1,2,1,3,1,2,1,1,2,1,3,2];let bx=34,bc='';bars.forEach((w,i)=>{if(i%2===0)bc+=`M${bx} 86V99H${bx+w*.95}V86Z`;bx+=w*1.06+.6});
    const sq=(y,len,ph)=>{let d=`M34 ${y}`;for(let x=34;x<34+len;x+=6)d+=`q1.5 ${ph?-2:-1.6} 3 0 q1.5 ${ph?2:1.4} 3 0`;return d};
    return svg('0 0 120 120',`${shadow(62,110,36,3.5)}<g transform="rotate(5 60 60)">
      <path d="${top}L94 92L80 106H26Z" fill="${P}" ${O('#cbbfa0')}/>
      <path d="M94 92L80 106C82 99 84.6 96 94 92Z" fill="${mix(P,'#cbbfa0',.6)}" ${I('#cbbfa0')}/>
      <path d="M29.5 22V100" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
      <path d="${rr(32,22,56,12,3)}" fill="${TE}"/>
      <path d="M37 24Q42 28 37 32M41.5 24Q36.5 28 41.5 32" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>
      ${txt(64,31,7.4,'#fff','PRINT ORDER','textLength="38" lengthAdjust="spacingAndGlyphs"')}
      <path d="${sq(42,46,0)}M34 50H38${sq(50,30,1).replace('M34 50','M42 50')}${sq(58,40,0)}${sq(66,22,1)}" fill="none" stroke="${INK}" stroke-width="1.4" stroke-linecap="round" opacity=".45"/>
      <path d="${rr(70,62,14,8,1.5)}" fill="none" stroke="${INK}" stroke-width="1.4" opacity=".35"/>
      <path d="M73 66Q75 68 76.5 67.5Q79 64 81 63.5" fill="none" stroke="${VI}" stroke-width="1.4" stroke-linecap="round"/>
      <path d="${bc}" fill="${INK}" opacity=".85"/>
      <g transform="rotate(-13 60 58)" opacity=".92">
        <path d="M27 45Q27 42 30 42H90Q93 42 93 45V71Q93 74 90 74H30Q27 74 27 71Z" fill="none" stroke="${ST}" stroke-width="2.5"/>
        <path d="M30.5 46Q30.5 45.4 31.2 45.4H88.8Q89.5 45.4 89.5 46V70Q89.5 70.6 88.8 70.6H31.2Q30.5 70.6 30.5 70Z" fill="none" stroke="${ST}" stroke-width="1.4"/>
        ${txt(60,55.2,9.6,ST,'HOLD FOR','textLength="44" lengthAdjust="spacingAndGlyphs"')}
        ${txt(60,68.8,10.6,ST,'REVIEW','textLength="48" lengthAdjust="spacingAndGlyphs"')}
        <path d="${ov(40,49,.9)}${ov(71,63,1.1)}${ov(55,52,.7)}${ov(84,58,.9)}${ov(47,66,.8)}" fill="${P}"/></g>
    </g>`)},

  // 5 ── round "I helped Varrow" sticker with a lantern, beside a friendly capped vial
  sticker(){
    const a=uid('sta'),b=uid('stb'),g=uid('stg'),cx=44,cy=58,G='#cfeef0',CAP=CO;
    return svg('0 0 120 120',`<defs>
      <path id="${a}" d="M${cx-21} ${cy}A21 21 0 0 1 ${cx+21} ${cy}"/><path id="${b}" d="M${cx-27.5} ${cy}A27.5 27.5 0 0 0 ${cx+27.5} ${cy}"/>
      <radialGradient id="${g}"><stop offset="0" stop-color="${GO}" stop-opacity=".7"/><stop offset="1" stop-color="${GO}" stop-opacity="0"/></radialGradient></defs>
    ${shadow(48,98,36,4)}${shadow(98,107,14,2.6)}
    <path d="${ov(cx,cy,37)}" fill="${PA}" ${O('#c9c0e8')}/>
    <path d="${ov(cx,cy,31.5)}" fill="${VI}"/>
    <path d="M${cx+31.5} ${cy}C${cx+31.5} ${cy+17} ${cx+17} ${cy+31.5} ${cx} ${cy+31.5}C${cx-10} ${cy+31.5} ${cx-18} ${cy+27} ${cx-24} ${cy+20}C${cx-14} ${cy+27} ${cx+12} ${cy+28} ${cx+22} ${cy+12}C${cx+27} ${cy+4} ${cx+28} ${cy-8} ${cx+25} ${cy-17}C${cx+29.5} ${cy-12} ${cx+31.5} ${cy-6} ${cx+31.5} ${cy}Z" fill="${dk(VI,.3)}"/>
    <path d="M${cx-24} ${cy-14}C${cx-19} ${cy-24} ${cx-9} ${cy-29} ${cx+2} ${cy-29}" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".35"/>
    <path d="${ov(cx,cy+1,17)}" fill="url(#${g})"/>
    ${miniLantern(cx,cy+1,1.12,GO,dk(GO,.5))}
    <text font-size="9.6" fill="${PA}" ${F} letter-spacing=".6"><textPath href="#${a}" xlink:href="#${a}" startOffset="50%" text-anchor="middle">I HELPED</textPath></text>
    <text font-size="10.4" fill="${GO}" ${F} letter-spacing="1"><textPath href="#${b}" xlink:href="#${b}" startOffset="50%" text-anchor="middle">VARROW</textPath></text>
    <path d="M${cx+20} ${cy+29}C${cx+24} ${cy+27} ${cx+28} ${cy+24} ${cx+30.5} ${cy+20}C${cx+27} ${cy+22} ${cx+23} ${cy+22} ${cx+20} ${cy+21}C${cx+21} ${cy+23.6} ${cx+21} ${cy+26.4} ${cx+20} ${cy+29}Z" fill="#e9e5f5" ${I('#c9c0e8')}/>
    <path d="M90 74H106C106 74 107 84 107 96C107 104 104 107 98 107C92 107 89 104 89 96C89 84 90 74 90 74Z" fill="${G}" ${O('#7fb9bd')}/>
    <path d="M89.6 88C93 89.4 103 89.4 106.6 88C106.9 92 107 94 107 96C107 104 104 107 98 107C92 107 89 104 89 96C89 93 89.2 90 89.6 88Z" fill="${lt(VI,.55)}"/>
    <path d="M102.6 76H105.6C106 80 106.8 88 107 96C107 103 104.5 106.4 100.6 106.9C103 104 103.6 99 103.6 94C103.6 86 103.2 80 102.6 76Z" fill="${dk(G,.18)}" opacity=".9"/>
    <path d="M92.5 79V100" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".85"/>
    <path d="M90.3 82H106.6V87H90Z" fill="${PA}"/><path d="M98.2 86.2C96 84.6 96 82.6 97.4 82.6C98 82.6 98.2 83 98.2 83.4C98.2 83 98.4 82.6 99 82.6C100.4 82.6 100.4 84.6 98.2 86.2Z" fill="${CO}"/>
    <path d="M90.6 68.6H105.4V74.8H90.6Z" fill="#c9cfdc" ${I('#c9cfdc')}/>
    <path d="M89 62.4C89 58.6 91 57.6 98 57.6C105 57.6 107 58.6 107 62.4V67.4C107 69 106 69.6 104 69.6H92C90 69.6 89 69 89 67.4Z" fill="${CAP}" ${O(CAP)}/>
    <path d="M102 59C105 59.6 105.4 61 105.4 62.6V67.6C104 68.4 103 68.6 101.6 68.6Z" fill="${dk(CAP,.25)}"/>
    <path d="M92 61.4Q94.6 60 98 60" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".8"/>`)},

  // 6 ── a child's crayon drawing: house, lantern in the window, rainbow; paper corner curling
  drawing(){
    const cl=uid('drc'),P=PA,cr=(d,c,w,o)=>`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w||3}" stroke-linecap="round" stroke-linejoin="round" opacity="${o||.92}"/>`;
    const scrib=(x0,x1,y0,y1,step)=>{let d=`M${x0} ${y0}`;let up=false;for(let x=x0;x<=x1;x+=step){d+=`L${r(x)} ${up?y0:y1}`;up=!up}return d};
    const PAPER='M14 16C40 14 80 15 106 14C107 40 106 62 106.4 84C99 86 92 94 88 106C60 106.6 36 105 14 106.4C13 76 15 46 14 16Z';
    return svg('0 0 120 120',`${shadow(60,112,46,3.6)}<defs><clipPath id="${cl}"><path d="${PAPER}"/></clipPath></defs>
    <g transform="rotate(-3 60 60)">
      <path d="${PAPER}" fill="${P}" ${O('#cfc3a6')}/>
      <g clip-path="url(#${cl})">
        ${cr('M19 68C19 24 101 24 101 68',CO,4.4)}${cr('M25 68C25 31 95 31 95 68',GO,4.4)}${cr('M31 68C31 38 89 38 89 68',GR,4.4)}${cr('M37 68C37 45 83 45 83 68',TE,4.4,.85)}
        ${cr('M24 24Q24 18.6 29 18.6Q34 18.6 34 24Q34 29 29 29Q24 29 24 24Z',GO,2.5)}${cr(scrib(25,33,20,28,2),GO,1.6,.6)}
        ${cr('M22 17L19.6 14.6M29 14.6V11.6M36 17L38.4 14.6M20 25H17',GO,2)}
        <path d="M95 22C96 20 99 20 99 22.6C99 20 102 20 103 22C104 24.4 99 28 99 28C99 28 94 24.4 95 22Z" fill="${CO}" opacity=".85"/>
        <path d="M36 64H84V95H36Z" fill="${P}"/>
        ${cr(scrib(37,83,65,94,2.4),CO,2,.45)}
        ${cr('M36 63C36 74 36.6 85 36 95H84.4C84 85 84.6 74 84 62.6',CO,3)}
        <path d="M29 65L60 41L91 65Z" fill="${P}"/>
        ${cr(scrib(36,84,55,64,2.3).replace(/L([\d.]+) 55/g,(m,x)=>`L${x} ${r(Math.max(44,64-Math.min(+x-31,89-+x)*.72))}`),VI,2,.5)}
        ${cr('M29 65L60 41L91 65',VI,3.6)}
        <path d="M42 70H60V86H42Z" fill="${INK}" opacity=".85"/>
        ${cr('M42 70H60V86H42ZM51 70V86',GO,2.4)}
        <path d="${ov(46.5,78,4.4)}" fill="${GO}" opacity=".45"/>
        <path d="M46.5 74C43.4 75.4 43.4 80.6 46.5 82C49.6 80.6 49.6 75.4 46.5 74Z" fill="${GO}"/>
        <path d="M45.5 73H47.5M45.5 83H47.5" stroke="${CO}" stroke-width="1.4" stroke-linecap="round"/>
        <path d="${ov(55.5,78,4.4)}" fill="${GO}" opacity=".45"/>
        <path d="M55.5 74C52.4 75.4 52.4 80.6 55.5 82C58.6 80.6 58.6 75.4 55.5 74Z" fill="${CO}"/>
        ${cr('M66 95V79Q71.5 75.4 77 79V95',TE,3)}${cr(scrib(67.4,75.6,80,94,2),TE,1.6,.5)}${cr('M74 87.4V87.6',INK,2.4)}
        ${cr('M16 99Q20 93.6 22 99Q26 93 29 99Q32 93.6 35 99Q39 93.6 42 99Q46 93.6 48 99Q52 93 55 99Q59 93.6 62 99Q66 93.6 69 99Q72 93.6 76 99Q79 93.6 82 99Q86 93.6 89 99Q93 93.6 96 99',GR,2.6)}
        ${cr('M95 96V82',GR,2)}${cr('M95 89Q99 86 100 88',GR,1.8)}
        <path d="M95 74C97 71 101 72 100 75C103 75 103 79 100 79.4C101 82.4 97 83.4 95 80.6C93 83.4 89 82.4 90 79.4C87 79 87 75 90 75C89 72 93 71 95 74Z" fill="${CO}" opacity=".9"/><path d="${ov(95,77.6,2.2)}" fill="${GO}"/>
      </g>
      <path d="M106.4 84C99 86 92 94 88 106C92 99 95 95.4 101 94C104 93.4 106 89 106.4 84Z" fill="${mix(P,'#cfc3a6',.65)}" ${O('#cfc3a6')}/>
      <path d="M18 22C18 40 17.6 60 18 80" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".9"/>
      <path d="M50 10.6L70.4 11.4L69.6 19.6L49.2 18.8Z" fill="${lt(GO,.55)}" ${I(lt(GO,.3))} opacity=".85"/>
    </g>`)},

  // 7 ── paper lantern (any colour) with a soft glow halo; viewBox 0 0 60 90
  lantern(color){
    const C=color||'#f7a440',g=uid('lng'),h=uid('lnh'),L=dk(C,.5),cap=mix(C,INK,.58);
    return svg('0 0 60 90',`<defs>
      <radialGradient id="${g}" cx="30" cy="44" r="30" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${lt(C,.5)}" stop-opacity=".95"/><stop offset=".6" stop-color="${lt(C,.25)}" stop-opacity=".5"/><stop offset="1" stop-color="${C}" stop-opacity="0"/></radialGradient>
      <radialGradient id="${h}" cx="27" cy="41" r="15" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff6d8" stop-opacity=".95"/><stop offset="1" stop-color="${lt(C,.4)}" stop-opacity="0"/></radialGradient></defs>
    <path d="${ov(30,44,30,36)}" fill="url(#${g})"/>
    <path d="M30 6V15" stroke="${L}" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M27.4 4.6C27.4 1.6 32.6 1.6 32.6 4.6C32.6 7 27.4 7 27.4 4.6Z" fill="none" stroke="${L}" stroke-width="1.4"/>
    <path d="M16 22C7 30 7 58 16 66H44C53 58 53 30 44 22Z" fill="${C}" ${O(C)}/>
    <path d="M39 23.2C46 28 48.6 37 48.6 44C48.6 52 46 60.4 40 65.2H44C53 58 53 30 44 22Z" fill="${dk(C,.2)}"/>
    <path d="${ov(27,42,13,16)}" fill="url(#${h})"/>
    <path d="M30 22.6V65.4M23 22.4C17.4 32 17.4 56 23 65.6M37 22.4C42.6 32 42.6 56 37 65.6M18.6 23.4C11.6 33 11.6 55 18.6 64.6M41.4 23.4C48.4 33 48.4 55 41.4 64.6" fill="none" ${I(C)} opacity=".7"/>
    <path d="M14 34C12.6 39 12.6 46 14.2 52" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".75"/>
    <path d="M19 15.4H41Q44 15.4 44 18.4V20.4Q44 23 41.4 23H18.6Q16 23 16 20.4V18.4Q16 15.4 19 15.4Z" fill="${cap}" ${O(cap)}/>
    <path d="M19.4 18H29" stroke="${lt(cap,.45)}" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M18.6 65H41.4Q44 65 44 67.4V68.4Q44 71 41 71H19Q16 71 16 68.4V67.4Q16 65 18.6 65Z" fill="${cap}" ${O(cap)}/>
    <path d="${ov(30,73.6,2.6,2.4)}" fill="${GO}" ${I(GO)}/>
    <path d="M27.4 76C26.6 80 26.2 84 26.6 88Q30 89.4 33.4 88C33.8 84 33.4 80 32.6 76Q30 77.2 27.4 76Z" fill="${CO}" ${O(CO)}/>
    <path d="M28.8 79V87.2M31.2 79V87.2" stroke="${dk(CO,.3)}" stroke-width="1.4" stroke-linecap="round"/>`)},

  // 8 ── the carved memorial stone (a big friendly boulder) with its inscription and moss; viewBox 0 0 160 120
  stone(){
    const S='#c3bddc',cv=dk(S,.66),hi=lt(S,.6);
    const carve=(y,s,t,len)=>`${txt(80,y+1,s,hi,t,`textLength="${len}" lengthAdjust="spacingAndGlyphs"`)}${txt(80,y,s,cv,t,`textLength="${len}" lengthAdjust="spacingAndGlyphs"`)}`;
    const ROCK='M10 104C6 82 10 48 28 30C44 14 66 10 84 10C106 10 128 16 140 32C153 50 154 82 150 104Z';
    return svg('0 0 160 120',`${shadow(80,108,76,6)}
    <path d="${ROCK}" fill="${S}" ${O(S)}/>
    <path d="M124 18C134 24 138 28 140 32C153 50 154 82 150 104H134C140 84 141 54 132 36C130 31 127.6 24 124 18Z" fill="${dk(S,.18)}"/>
    <path d="M17 58C19 44 26 33 36 25C44 19 54 15 64 13.6" fill="none" stroke="${hi}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M30 80L33 76L32 72M136 64L133 68" fill="none" ${I(S)} opacity=".6"/>
    ${carve(41,12.6,'THE QUIET YEAR',92)}
    <path d="M48 52.4C52.4 49.6 56.6 49.6 61 52.4C56.6 55.2 52.4 55.2 48 52.4ZM99 52.4C103.4 49.6 107.6 49.6 112 52.4C107.6 55.2 103.4 55.2 99 52.4Z" fill="${cv}"/>
    ${carve(58.4,15,'2030',34)}
    ${carve(73,10.6,'WE STAYED HOME',92)}${carve(86,10.6,'FOR EACH OTHER',94)}
    <path d="M4 106C3 99 8 94 15 95C16 88 25 86 29 91C33 87 41 88 43 94C48 91 55 94 55 99C60 97 66 100 66 106Z" fill="${GR}" ${O(GR)}/>
    <path d="M96 106C96 100 101 96 107 98C109 91 118 90 122 95C126 90 136 91 137 98C143 95 152 98 151 106C152 101 156 101 157 106Z" fill="${GR}" ${O(GR)}/>
    <path d="M6 103.6C20 101.6 50 101.8 65 103.6L66 106H4Z M97 103.6C110 101.6 135 101.6 156 103.6L157 106H96Z" fill="${dk(GR,.3)}"/>
    <path d="M10 99Q12 96 15.4 96.4M31 92Q34 90.6 37.4 92.4M101 100Q103.4 97.6 107 98.4M112 94Q115.4 92.2 119 94" fill="none" stroke="${lt(GR,.5)}" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M70 106C72 103 77 102.8 79 105.2C81 102.8 86 103.4 88 106Z" fill="${GR}" ${I(GR)}/>
    <path d="${ov(24,91.6,2.4)}${ov(118,92.6,2.4)}${ov(144,97.6,2)}" fill="${CO}"/><path d="${ov(46,94.6,2)}${ov(131,96,2)}${ov(79,103.4,1.6)}${ov(12,96,1.6)}" fill="${GO}"/>
    <path d="${ov(24,91.6,.8)}${ov(118,92.6,.8)}${ov(144,97.6,.7)}" fill="#fff"/>`)},
  };

  // ================= the "Who does what?" job icons (viewBox 0 0 100 100) =================
  ART.job=(k)=>{const B=(inner)=>svg('0 0 100 100',inner);
    if(k==='scan')return B(`${shadow(50,92,30,3)}<path d="${rr(30,22,40,56,5)}" fill="${PA}" ${O('#cbbfa0')}/><path d="${rr(30,22,40,11,5)}" fill="${TE}"/><path d="M37 44H63M37 52H58M37 60H61" stroke="${INK}" stroke-width="2.4" opacity=".35" stroke-linecap="round"/>
      <path d="M20 40H80" stroke="${TE}" stroke-width="4" opacity=".55" class="qyv-bob"/><path d="${ov(66,72,11)}" fill="${GR}" ${I(GR)}/><path d="M60.5 72.5L64.5 76.5L71.5 68" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
    if(k==='alert')return B(`${shadow(50,92,32,3)}<g transform="translate(36 70)"><path d="M-10 -26V-36" stroke="#8c93ad" stroke-width="2.4" stroke-linecap="round"/><path d="${ov(-10,-37,3)}" fill="${CO}"/><path d="${rr(-22,-26,44,30,6)}" fill="${TE}" ${O(TE)}/><path d="${ov(-8,-11,8)}" fill="${dk(TE,.6)}"/><path d="${ov(10,-16,3.6)}" fill="#e5484d" class="qyv-blink"/></g>
      <path d="${ov(72,30,7)}" fill="none" stroke="${GO}" stroke-width="3" class="qyv-ring"/><path d="M64 38C64 26 80 26 80 38V46H64Z" fill="${GO}" ${I(GO)}/><path d="M61 46H83" stroke="${dk(GO)}" stroke-width="3" stroke-linecap="round"/><path d="${ov(72,50,3)}" fill="${dk(GO)}"/>`);
    if(k==='hold')return B(`${shadow(50,92,30,3)}<path d="${rr(22,30,36,48,5)}" fill="${PA}" ${O('#cbbfa0')}/><path d="${rr(22,30,36,10,5)}" fill="${TE}"/><path d="M29 50H51M29 58H47M29 66H50" stroke="${INK}" stroke-width="2.4" opacity=".35" stroke-linecap="round"/>
      <path d="M52 16V40" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/><path d="M52 16H66L62 21L66 26H52Z" fill="#e5484d" class="qyv-sway"/>
      <path d="${ov(72,64,10)}" fill="none" stroke="${INK}" stroke-width="4"/><path d="${ov(72,64,10)}" fill="#cfeaff" opacity=".6"/><path d="M79 72L88 82" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`);
    if(k==='trial')return B(`${shadow(50,92,32,3)}<path d="${rr(42,20,38,58,5)}" fill="#fff" ${O('#b9c1d9')}/><path d="${rr(52,16,18,9,3)}" fill="#b9c1d9"/>${[34,46,58].map((y,i)=>`<g class="qyv-pop" style="--d:${i*.5}s"><path d="M48 ${y}L51 ${y+3}L56 ${y-3}" stroke="${GR}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g><path d="M60 ${y}H74" stroke="${INK}" stroke-width="2.4" opacity=".3" stroke-linecap="round"/>`).join('')}
      <path d="M20 40H36C36 40 37 54 37 66C37 74 34 78 28 78C22 78 19 74 19 66C19 54 20 40 20 40Z" fill="#cfeef0" ${O('#7fb9bd')}/><path d="M19.6 58H36.6C36.9 61 37 64 37 66C37 74 34 78 28 78C22 78 19 74 19 66C19 63 19.2 60 19.6 58Z" fill="${lt(VI,.5)}"/><path d="M18 32H38V40H18Z" fill="${CO}" ${I(CO)}/>`);
    if(k==='close')return B(`${shadow(50,92,36,3)}<path d="M18 86V44H82V86Z" fill="#f2d3a0" ${O('#d8a868')}/><path d="M12 46L50 22L88 46Z" fill="#c0605a" ${O('#c0605a')}/><path d="${ov(50,36,5)}" fill="#fff" ${I('#c0605a')}/>
      ${[26,62].map(x=>`<path d="${rr(x,52,12,12,2)}" fill="#ffe8a8" ${I('#d8a868')}/>`).join('')}<path d="M43 86V64H57V86Z" fill="#8a5a3a"/>
      <g class="qyv-sway"><path d="M32 64L50 58L68 64" stroke="${INK}" stroke-width="1.6" fill="none"/><path d="${rr(28,64,44,16,4)}" fill="#fff" ${I('#e5484d')}/>${txt(50,75.5,9.5,'#e5484d','CLOSED','textLength="34" lengthAdjust="spacingAndGlyphs"')}</g>`);
    if(k==='off')return B(`${shadow(50,92,32,3)}<g transform="translate(42 72)"><path d="M-10 -28V-38" stroke="#8c93ad" stroke-width="2.4" stroke-linecap="round"/><path d="${ov(-10,-39,3)}" fill="${CO}"/><path d="${rr(-24,-28,48,32,6)}" fill="${TE}" ${O(TE)}/><path d="${ov(-8,-12,9)}" fill="${dk(TE,.6)}"/><path d="${ov(12,-18,3.6)}" fill="${GO}" class="qyv-blink"/></g>
      <path d="${ov(76,40,13)}" fill="#fff" ${O('#9aa0bd')}/><path d="M76 31V40" stroke="#e5484d" stroke-width="3.4" stroke-linecap="round"/><path d="M69.5 34.5C66 38 66.5 45 71 48C75 50.5 80.5 49.5 83 45.5C85 42 84.5 37 82.5 34.5" stroke="#e5484d" stroke-width="3.4" fill="none" stroke-linecap="round"/>`);
    return ''};

  // ================= story pictures: one looping picture per sentence (VIZ.qy*, 300 x 130) =================
  const pic=(c1,c2,inner,label)=>{const g=uid('pg'),cp=uid('pc');return igFrame(300,130,`<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient><clipPath id="${cp}"><path d="${rr(0,0,300,130,14)}"/></clipPath></defs><g clip-path="url(#${cp})"><rect width="300" height="130" fill="url(#${g})"/>${inner}</g>`,label)};
  const NIGHT=['#1b1f4e','#3d3c7e'],DAWN=['#ffd9b8','#fff3e2'],DAY=['#cfeaff','#f2f9ff'],WARM=['#fff0da','#ffe2c2'],ROOM=['#efe8ff','#fff7ec'],MINT=['#dff5ef','#f7fffb'];
  const P=(x,gy,o)=>mini(x,gy-34*((o&&o.s)||1),o||{});
  const gnd=(y,col,edge)=>`<path d="M0 ${y}H300V130H0Z" fill="${col}"/>${edge?`<path d="M0 ${y}H300V${y+2.2}H0Z" fill="${edge}"/>`:''}`;
  const stars=(n,seed,ymax)=>{let s='';for(let i=0;i<n;i++){const x=(i*73+seed*31)%296+2,y=(i*41+seed*17)%(ymax||60)+5;s+=`<circle cx="${x}" cy="${y}" r="${i%5?.8:1.3}" fill="#fff" opacity=".8" class="${i%4?'':'qyv-blink'}" style="--d:${((i*.37)%2).toFixed(2)}s"/>`}return s};
  const moon=(x,y,m)=>`<path d="${ov(x,y,m*2.4)}" fill="#fff4cf" opacity=".1"/><path d="M${x} ${y-m}A${m} ${m} 0 0 0 ${x} ${y+m}A${r(m*.55)} ${m} 0 0 1 ${x} ${y-m}Z" fill="#fff1c4"/>`;
  const sun=(x,y,m)=>`<path d="${ov(x,y,m*2)}" fill="#fff1b0" opacity=".35"/><path d="${ov(x,y,m)}" fill="#ffd45c"/>`;
  const heart=(x,y,s,col,cls,d)=>`<g class="${cls||''}" style="--d:${d||0}s"><path transform="translate(${x} ${y}) scale(${s})" d="M0 4C-6 -1 -8 -4 -8 -7C-8 -10 -5.5 -12 -3 -12C-1.4 -12 -.4 -11 0 -10C.4 -11 1.4 -12 3 -12C5.5 -12 8 -10 8 -7C8 -4 6 -1 0 4Z" fill="${col||CO}"/></g>`;
  const win=(x,y,w,h,lit,cls,d)=>`<g class="${cls||''}" style="--d:${d||0}s">${lit?`<path d="${ov(x+w/2,y+h/2,w*1.15)}" fill="#ffcf7a" opacity=".25"/>`:''}<path d="${rr(x,y,w,h,1.5)}" fill="${lit?'#ffd98a':'#3b3f6e'}" stroke="#5a3a40" stroke-width="1.1"/><path d="M${x+w/2} ${y}V${y+h}M${x} ${r(y+h*.5)}H${x+w}" stroke="#5a3a40" stroke-width=".8" opacity=".6"/></g>`;
  // a little house front: x = left wall, gy = ground; o: {wall, roof, door (false to hide), doorX (fraction)}
  const house=(x,gy,w,h,o)=>{o=o||{};const wall=o.wall||'#f0c39a',roof=o.roof||'#7d4a68',top=gy-h,rh=o.rh||w*.36;
    let s=`<path d="M${x} ${gy}V${top}H${x+w}V${gy}Z" fill="${wall}" stroke="${dk(wall,.5)}" stroke-width="1.1"/><path d="M${r(x+w*.74)} ${top}H${x+w}V${gy}H${r(x+w*.74)}Z" fill="${dk(wall,.14)}" opacity=".55"/>
      <path d="M${x-4} ${top+2}L${r(x+w/2)} ${r(top-rh)}L${x+w+4} ${top+2}Z" fill="${roof}" stroke="${dk(roof,.4)}" stroke-width="1.1" stroke-linejoin="round"/>`;
    if(o.door!==false){const dw=r(w*.2),dx=r(x+w*(o.doorX==null?.68:o.doorX));s+=`<path d="M${dx} ${gy}V${r(gy-h*.4)}Q${r(dx+dw/2)} ${r(gy-h*.48)} ${r(dx+dw)} ${r(gy-h*.4)}V${gy}Z" fill="${dk(wall,.42)}"/>`}
    return s};
  const lamp=(cx,cy,s,col,cls,d)=>`<g class="${cls||''}" style="--d:${d||0}s"><path d="${ov(cx,cy,9*s)}" fill="${col||GO}" opacity=".28"/>${miniLantern(cx,cy,s*.62,col||'#f7a440')}</g>`;
  const germ=(x,y,m,col,extra)=>{col=col||'#7cc576';let k='';for(let i=0;i<8;i++){const a=i/8*Math.PI*2+.3;k+=ov(x+Math.cos(a)*m*1.02,y+Math.sin(a)*m*1.02,m*.27)}
    return `<g ${extra||''}><path d="${k}" fill="${dk(col,.22)}"/><path d="${ov(x,y,m)}" fill="${col}" stroke="${dk(col,.4)}" stroke-width=".9"/><path d="${ov(x-m*.32,y-m*.3,m*.3)}" fill="#fff" opacity=".45"/></g>`};
  const slipG=(x,y,s,o)=>{o=o||{};return `<g transform="translate(${x} ${y}) scale(${s||1})"><path d="${rr(0,0,22,28,2.5)}" fill="#fffaf0" stroke="#c9bc9a" stroke-width="1"/><path d="M2.5 0H19.5Q22 0 22 2.5V6H0V2.5Q0 0 2.5 0Z" fill="${TE}"/><path d="M4 11H18M4 15H15" stroke="${INK}" stroke-width="1.1" opacity=".35" stroke-linecap="round"/>
    ${o.icon==='med'?`<path d="M9.6 18H12.4V20.4H14.8V23.2H12.4V25.6H9.6V23.2H7.2V20.4H9.6Z" fill="${CO}"/>`:o.icon==='lab'?`<path d="M9.4 18V20.6L7 25.4H15L12.6 20.6V18Z" fill="${lt(VI,.35)}" stroke="${VI}" stroke-width=".8" stroke-linejoin="round"/>`:'<path d="M4 19H17M4 23H13" stroke="#1f2340" stroke-width="1.1" opacity=".35" stroke-linecap="round"/>'}
    ${o.flag?`<path d="M19 -9V8" stroke="${INK}" stroke-width="1.2" stroke-linecap="round"/><g class="qyv-sway"><path d="M19 -9H28L25.4 -5.4L28 -1.8H19Z" fill="#e5484d"/></g>`:''}
    ${o.check?`<g class="${o.cc||''}" style="--d:${o.d||0}s"><path d="${ov(19,25,5)}" fill="${GR}"/><path d="M16.6 25.2L18.4 27L21.6 23.4" stroke="#fff" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`:''}</g>`};
  // Sniffer, the air sensor box (sits on y): light colour + class
  const boxG=(x,y,s,lc,lcls)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M-12 -24V-35" stroke="#8c93ad" stroke-width="1.8" stroke-linecap="round"/><path d="${ov(-12,-36,2.4)}" fill="${CO}"/>
    <path d="M20 -8C25 -8 26 -3 25 2" stroke="#3d5a80" stroke-width="3" fill="none" stroke-linecap="round"/><path d="${rr(-20,-24,40,25,4)}" fill="${TE}" stroke="${dk(TE)}" stroke-width="1.4"/><path d="M15 -23.6H19.6V0.6H15Z" fill="${dk(TE,.25)}" opacity=".6"/><path d="${ov(-7,-11.5,8)}" fill="${dk(TE,.62)}"/>
    <path d="${ov(-7,-11.5,6.6)}" fill="#7cc4ec"/><path d="M-13.6 -10.4C-11 -12.4 -9 -8.6 -7 -10.4S-2.6 -12.4 -.4 -10.4C-.8 -6.8 -3.6 -4.9 -7 -4.9S-13.2 -6.8 -13.6 -10.4Z" fill="#4a9ad8" class="qyv-bob"/>
    <path d="${ov(9,-15,3.2)}" fill="${lc||GR}" class="${lcls||''}"/><path d="M3 -6.5H16V-2.5H3Z" fill="#f3dfa0"/></g>`;
  // a public building: o {col, roof, sign, cross, rows, cols}
  const bld=(x,gy,w,h,o)=>{o=o||{};const c=o.col||'#e3e7f5',top=gy-h,line=dk(c,.45);let s=`<path d="M${x} ${gy}V${top+3}Q${x} ${top} ${x+3} ${top}H${x+w-3}Q${x+w} ${top} ${x+w} ${top+3}V${gy}Z" fill="${c}" stroke="${line}" stroke-width="1.1"/>`;
    const cols=o.cols||Math.max(2,Math.round(w/15)),rows=o.rows||Math.max(1,Math.floor((h-22)/14)),cw=w/cols;
    for(let j=0;j<rows;j++)for(let i=0;i<cols;i++)s+=`<path d="${rr(r(x+i*cw+cw*.25),r(top+(o.sign?16:8)+j*14),r(cw*.5),8,1.2)}" fill="${o.lit&&(i+j)%3===0?'#ffd98a':'#a8c4e8'}" opacity=".9"/>`;
    if(o.sign)s+=`<path d="${rr(x+w*.12,top+3,w*.76,10,2)}" fill="#fff" stroke="${line}" stroke-width=".8"/>${txt(x+w/2,top+11,6.6,o.signCol||INK,o.sign,`textLength="${r(w*.64)}" lengthAdjust="spacingAndGlyphs"`)}`;
    if(o.cross)s+=`<path d="M${x+w/2-2.4} ${top-11}h4.8v3.6h3.6v4.8h-3.6v3.6h-4.8v-3.6h-3.6v-4.8h3.6Z" fill="#e5484d"/>`;
    s+=`<path d="M${r(x+w/2-6)} ${gy}V${gy-11}H${r(x+w/2+6)}V${gy}Z" fill="${line}" opacity=".8"/>`;return s};
  const deliv=(x,gy,s,cls,dx)=>`<g class="${cls||''}" style="--dx:${dx||0}px"><g transform="translate(${x} ${gy}) scale(${s})"><path d="${ov(0,0,15,2.4)}" fill="${INK}" opacity=".15"/>
    <path d="M-9 -24C-9 -29 -4 -31 0 -31C4 -31 9 -29 9 -24Z" fill="#f2c27a" stroke="#b8803a" stroke-width="1"/><path d="M-5 -27Q-2 -30 1 -27M1 -28Q4 -31 6.5 -27" stroke="#b8803a" stroke-width=".9" fill="none"/>
    <path d="${rr(-13,-24,26,19,6)}" fill="#f4f6fb" stroke="#b9c1d9" stroke-width="1.2"/><path d="M-13 -13H13V-10H-13Z" fill="${TE}"/><path d="${rr(-8,-21,16,6,3)}" fill="${INK}"/><path d="${ov(-3.5,-18,1.4)}${ov(3.5,-18,1.4)}" fill="#7ff7e4"/>
    <path d="${ov(-8,-3,3.4)}${ov(8,-3,3.4)}" fill="${INK}"/><path d="${ov(-8,-3,1.2)}${ov(8,-3,1.2)}" fill="#9aa0bd"/></g></g>`;
  const orb=(x,y,m)=>{const g=uid('orb');return `<defs><radialGradient id="${g}" cx=".4" cy=".35"><stop offset="0" stop-color="#ffffff"/><stop offset=".4" stop-color="#7ff7e4"/><stop offset="1" stop-color="${TE}"/></radialGradient></defs><path d="${ov(x,y,m*1.9)}" fill="#7ff7e4" opacity=".18" class="qyv-pulse"/><path d="${ov(x,y,m)}" fill="url(#${g})" stroke="${dk(TE,.3)}" stroke-width="1.2"/><g class="qyv-spin"><path d="${ov(x,y,m*1.45,m*.42)}" fill="none" stroke="#7ff7e4" stroke-width="1.4" opacity=".8"/></g>`};
  const clockG=(x,y,m,spin)=>`<path d="${ov(x,y,m)}" fill="#fff" stroke="${INK}" stroke-width="1.6"/>${[0,1,2,3,4,5,6,7,8,9,10,11].map(k=>`<path d="${ov(r(x+Math.sin(k*Math.PI/6)*m*.78),r(y-Math.cos(k*Math.PI/6)*m*.78),k%3?.6:1.1)}" fill="${INK}"/>`).join('')}
    <path d="M${x} ${y}L${r(x+m*.38)} ${r(y+m*.18)}" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/><g class="${spin||''}"><path d="${ov(x,y,m)}" fill="none"/><path d="M${x} ${y}V${r(y-m*.7)}" stroke="${CO}" stroke-width="1.4" stroke-linecap="round"/></g><path d="${ov(x,y,1.6)}" fill="${INK}"/>`;
  const calG=(x,y,w,head,big,cls,d,hc)=>`<g class="${cls||''}" style="--d:${d||0}s"><path d="${rr(x,y,w,w*1.05,3)}" fill="#fff" stroke="#c9cfe2" stroke-width="1"/><path d="M${x+3} ${y}H${x+w-3}Q${x+w} ${y} ${x+w} ${y+3}V${r(y+w*.3)}H${x}V${y+3}Q${x} ${y} ${x+3} ${y}Z" fill="${hc||'#e5484d'}"/>
    ${txt(x+w/2,r(y+w*.23),r(w*.2),'#fff',head)}${txt(x+w/2,r(y+w*.84),r(w*.44),INK,big)}</g>`;
  const globe=(x,y,m)=>{const cp=uid('gl');return `<defs><clipPath id="${cp}"><path d="${ov(x,y,m)}"/></clipPath></defs><path d="${ov(x,y,m)}" fill="#5fb8e6" stroke="#2e7fb0" stroke-width="1.2"/>
    <g clip-path="url(#${cp})"><path d="M${x-m*.9} ${y-m*.3}C${x-m*.6} ${y-m*.7} ${x-m*.1} ${y-m*.6} ${x-m*.15} ${y-m*.25}C${x-m*.2} ${y+m*.1} ${x-m*.5} ${y+m*.15} ${x-m*.45} ${y+m*.55}C${x-m*.6} ${y+m*.7} ${x-m*.95} ${y+m*.2} ${x-m*.9} ${y-m*.3}Z
      M${x+m*.15} ${y-m*.75}C${x+m*.5} ${y-m*.85} ${x+m*.9} ${y-m*.5} ${x+m*.8} ${y-m*.1}C${x+m*.7} ${y+m*.2} ${x+m*.45} ${y+m*.05} ${x+m*.35} ${y+m*.35}C${x+m*.3} ${y+m*.65} ${x+m*.05} ${y+m*.6} ${x+m*.1} ${y+m*.3}C${x+m*.15} ${y} ${x-m*.05} ${y-m*.4} ${x+m*.15} ${y-m*.75}Z" fill="#7cc576"/>
    <path d="M${x-m} ${y}H${x+m}M${x} ${y-m}C${x-m*.55} ${y-m*.5} ${x-m*.55} ${y+m*.5} ${x} ${y+m}M${x} ${y-m}C${x+m*.55} ${y-m*.5} ${x+m*.55} ${y+m*.5} ${x} ${y+m}" stroke="#fff" stroke-width=".8" fill="none" opacity=".45"/></g>
    <path d="M${r(x-m*.7)} ${r(y-m*.45)}C${r(x-m*.45)} ${r(y-m*.8)} ${r(x-m*.1)} ${r(y-m*.92)} ${r(x+m*.2)} ${r(y-m*.92)}" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".5"/>`};
  const tablet=(x,y,w,h,inner)=>`<path d="${rr(x,y,w,h,4)}" fill="${INK}"/><path d="${rr(x+2.5,y+2.5,w-5,h-5,2)}" fill="#dfe8ff"/>${inner||''}`;
  // people of the stories (mini options)
  const ANA={skin:SKIN[1],shirt:'#ff8a7a',hair:'#7a4a2a',style:'long',outfit:'hoodie'},GRAN={skin:SKIN[2],shirt:'#c58ad8',hair:'#eceaf2',style:'bun',outfit:'jacket'},
    MOM={skin:SKIN[2],shirt:'#5b7bd5',hair:'#2a1a14',style:'pony',outfit:'tee'},DAD={skin:SKIN[1],shirt:'#3f8f6b',hair:'#2a211c',style:'short',outfit:'tee'},
    KWAME={skin:SKIN[5],shirt:'#ffffff',hair:'#141010',style:'short',outfit:'tee'},NURSE={skin:SKIN[0],shirt:'#5fc9bd',hair:'#c9772d',style:'short',outfit:'tee'},
    PRIYA={skin:SKIN[3],shirt:'#16b3a6',hair:'#1a1414',style:'bun',outfit:'jacket'},NOOR={skin:SKIN[2],shirt:'#6c5ce7',hair:'#2a1c16',style:'bob',outfit:'jacket'},
    IVY={skin:SKIN[2],shirt:'#a99bff',hair:'#2a1a14',style:'tails',age:'kid'},KID2={skin:SKIN[4],shirt:'#ffd45c',hair:'#1b1410',style:'curly',age:'kid'};
  const street=(y)=>`${gnd(y,'#4a4d7c','#5d6194')}<path d="M0 ${y+10}H300" stroke="#6a6ea2" stroke-width="1.2" stroke-dasharray="10 9" opacity=".7"/>`;

  Object.assign(VIZ,{
  // ---------------- Ana's phone ----------------
  qyPhoneThen:()=>pic(...ROOM,`${gnd(108,'#d9c3a8','#c4aa8a')}<path d="M0 108H300" stroke="#b8946a" stroke-width="1"/>
    <g class="qyv-bob"><g transform="translate(70 4) scale(.9)">${ART.phone().replace('<svg ','<svg width="120" height="120" ')}</g></g>
    ${calG(176,24,58,'YEAR','2030','qyv-pop',.2,VI)}<path d="M168 70Q160 76 150 74" stroke="${dk(VI,.2)}" stroke-width="1.6" fill="none" stroke-dasharray="3 3"/>
    ${txt(205,104,9,'#8a6a4f','ten years ago','font-style="italic"')}`,'Ana’s old phone from 2030'),
  qySchoolShut:()=>pic(...DAY,`${gnd(108,'#9fd6a0','#7fc082')}${sun(268,22,9)}
    <path d="M18 108V54H112V108Z" fill="#f2d3a0" stroke="#c9975a" stroke-width="1.1"/><path d="M12 56L65 30L118 56Z" fill="#c0605a" stroke="#9a4440" stroke-width="1.1" stroke-linejoin="round"/>${win(28,66,14,12,0)}${win(88,66,14,12,0)}<path d="M57 108V80H73V108Z" fill="#8a5a3a"/>
    <g class="qyv-sway"><path d="M50 80L65 74L80 80" stroke="${INK}" stroke-width="1" fill="none"/><path d="${rr(47,80,36,12,3)}" fill="#fff" stroke="#e5484d" stroke-width="1"/>${txt(65,89,7.4,'#e5484d','CLOSED','textLength="27" lengthAdjust="spacingAndGlyphs"')}</g>
    ${[0,1,2,3,4].map(i=>calG(134+i*32,40+(i%2)*6,26,'MONTH',String(i+1),'qyv-pop',i*.55,i<4?'#8f86ff':'#16b3a6')).join('')}
    <path d="M134 98H290" stroke="#8a90b0" stroke-width="1.4" stroke-dasharray="3 4"/>${P(290,108,{...ANA,s:.62,face:'happy'})}`,'The school closed for five months'),
  qyVideoCall:()=>pic(...NIGHT,`${stars(22,1,48)}${moon(150,22,9)}${gnd(112,'#2e3266')}
    ${house(16,112,96,62,{wall:'#e8b48a',roof:'#6a3e5e',doorX:.06})}<path d="${rr(40,64,64,34,3)}" fill="#ffd98a" stroke="#5a3a40" stroke-width="1.2"/>
    ${callFace(43,67,19,28,'#ffe8b0',SKIN[1],'#3a2418',1)}${callFace(62,67,19,28,'#ffe8b0',SKIN[1],'#2a211c',3)}${callFace(81,67,19,28,'#ffe8b0',SKIN[1],'#2a1a14',0)}
    ${house(208,112,72,50,{wall:'#d9c2e8',roof:'#5a4a7a',doorX:.1})}<path d="${rr(236,74,36,30,3)}" fill="#ffd98a" stroke="#5a3a40" stroke-width="1.2"/>${callFace(244,76,20,27,'#ffe8b0',SKIN[2],'#eceaf2',2)}
    <path d="M106 80C140 56 176 56 232 74" stroke="#7ff7e4" stroke-width="2" fill="none" class="qyv-dash"/>${heart(168,58,.7,'#ff9bb0','qyv-pulse')}
    <g transform="translate(150 98)">${clockG(0,0,10)}</g>${txt(150,124,8,'#cfd6ff','8:00')}`,'Video calls with Grandma every night at eight'),
  qySoupLesson:()=>pic(...WARM,`${gnd(104,'#e9c9a0','#d8b080')}<path d="M0 104H300" stroke="#c49a6a" stroke-width="1"/>
    <path d="M20 76H130V104H20Z" fill="#cfd6e8" stroke="#9aa3c0" stroke-width="1"/><path d="${ov(52,76,16,3)}${ov(98,76,16,3)}" fill="#3a3f5a"/>
    <path d="M56 54C56 48 60 46 75 46C90 46 94 48 94 54L92 72C92 76 88 78 75 78C62 78 58 76 58 72Z" fill="#e5484d" stroke="#a83236" stroke-width="1.2"/><path d="M54 52H96" stroke="#a83236" stroke-width="2.4" stroke-linecap="round"/><path d="M62 56Q68 60 72 56" stroke="#fff" stroke-width="1.4" fill="none" opacity=".6"/>
    ${[0,1,2].map(i=>`<path d="M${66+i*9} 40Q${62+i*9} 34 ${67+i*9} 28Q${71+i*9} 22 ${66+i*9} 16" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" class="qyv-steam" style="--d:${i*.7}s"/>`).join('')}
    <g class="qyv-stir"><path d="M86 30L80 58" stroke="#8a5a3a" stroke-width="2.4" stroke-linecap="round"/><path d="${ov(79,59,4,2.6)}" fill="#8a5a3a"/></g>
    ${tablet(150,24,64,48,`<path d="${rr(153,27,58,42,2)}" fill="#ffe8b0"/><g transform="translate(182 49) scale(2.1) translate(-9.25 -15)">${callFace(0,0,18.5,27,'#ffe8b0',SKIN[2],'#eceaf2',2)}</g>`)}<path d="M174 72L170 104M190 72L194 104" stroke="#8a90b0" stroke-width="2"/>
    ${['1','2','3'].map((n,i)=>`<g class="qyv-on" style="--d:${i*1.4}s"><path d="${rr(226,22+i*26,58,20,5)}" fill="#fff" stroke="#e0c49a"/>${txt(238,36+i*26,10,CO,n)}<path d="M248 ${32+i*26}H276" stroke="${INK}" stroke-width="1.6" opacity=".3" stroke-linecap="round"/></g>`).join('')}`,'Grandma teaching soup over the screen, one step at a time'),
  qyHug:()=>pic(...DAWN,`${sun(240,30,12)}${gnd(112,'#a8d8a0','#88c080')}${house(196,112,70,48,{wall:'#d9c2e8',roof:'#5a4a7a',doorX:.4})}
    <g class="qyv-hug"><g transform="translate(0 0)">${P(126,112,{...ANA,s:1.25,face:'happy',pose:'walk'})}</g></g>
    <g class="qyv-hug r">${P(150,112,{...GRAN,s:1.2,face:'happy',flip:true,pose:'walk'})}</g>
    ${heart(138,30,1.1,'#ff7a8f','qyv-pop',1.2)}${heart(116,44,.6,'#ffb0c0','qyv-pop',1.6)}${heart(162,40,.7,'#ffb0c0','qyv-pop',1.9)}`,'Hugging Grandma again'),
  qyChainBreak:()=>{const close=[30,52,74,96,118],apart=[176,222,268];
    return pic(...MINT,`${gnd(108,'#bfe3d2','#a6d4bf')}<path d="M150 14V122" stroke="#9fc9b8" stroke-width="1.4" stroke-dasharray="4 4"/>
    ${close.map((x,i)=>P(x,108,{s:.95,shirt:['#ff8a7a','#5b7bd5','#ffd45c','#a99bff','#3f8f6b'][i],face:'happy'})).join('')}
    ${close.slice(0,-1).map((x,i)=>`<path d="M${x} 48Q${x+11} 34 ${x+22} 48" stroke="#78b86e" stroke-width="1.6" fill="none" class="qyv-dash"/>`).join('')}
    <g class="qyv-slide" style="--dx:88px">${germ(30,44,5)}</g>
    ${apart.map((x,i)=>`${house(x-20,108,40,30,{wall:['#f0c39a','#d9c2e8','#bfe0f0'][i],roof:'#6a5a8a',door:false})}${win(x-7,88,14,11,1)}`).join('')}
    <path d="M176 60Q192 44 206 58" stroke="#78b86e" stroke-width="1.6" fill="none" stroke-dasharray="3 4"/><g class="qyv-pop" style="--d:.6s"><path d="M197 50L207 60M207 50L197 60" stroke="#e5484d" stroke-width="2.6" stroke-linecap="round"/></g>
    ${germ(176,62,4.5,'#b9d9b0','opacity=".8"')}${txt(74,124,9,'#3e7a62','close together')}${txt(222,124,9,'#3e7a62','apart at home')}`,'A germ jumps between people who are close, and stops when they stay apart')},
  // ---------------- Kwame's bakery ----------------
  qyOvensOn:()=>pic(...DAWN,`${gnd(112,'#c9a88a','#b08a6a')}
    <path d="M30 112V40H230V112Z" fill="#f6e1c0" stroke="#b8946a" stroke-width="1.2"/><path d="M24 40H236L226 24H34Z" fill="#e5484d" stroke="#a83236" stroke-width="1.1" stroke-linejoin="round"/>
    ${[0,1,2,3,4,5,6,7].map(i=>`<path d="M${34+i*25} 24L${36+i*25} 40H${50+i*25}L${52+i*25} 24Z" fill="#fff" opacity=".85"/>`).join('')}
    <path d="${rr(44,52,110,48,3)}" fill="#ffcc80" stroke="#8a5a3a" stroke-width="1.2"/><path d="${rr(56,62,40,30,4)}${rr(102,62,40,30,4)}" fill="#3a2a2a"/>
    <path d="${rr(60,70,32,18,3)}${rr(106,70,32,18,3)}" fill="#ff8a3a" class="qyv-pulse"/>${[[66,78],[78,80],[112,78],[124,80]].map(([x,y])=>`<path d="M${x} ${y}C${x} ${y-4} ${x+10} ${y-4} ${x+10} ${y}Z" fill="#c98a4a"/>`).join('')}
    <path d="M170 112V56H214V112Z" fill="#8a5a3a" stroke="#5a3a20" stroke-width="1.2"/><path d="${ov(207,86,1.8)}" fill="#f5b82e"/>
    <g class="qyv-sway"><path d="M180 58L192 52L204 58" stroke="${INK}" stroke-width="1" fill="none"/><path d="${rr(176,58,32,13,3)}" fill="#fff" stroke="${CO}"/>${txt(192,67.5,7,CO,'Closed','textLength="22" lengthAdjust="spacingAndGlyphs"')}</g>
    <path d="M206 24V10H218V24" fill="#a8604a"/>${[0,1].map(i=>`<path d="M212 8Q206 0 212 -6" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" class="qyv-steam" style="--d:${i*1.2}s"/>`).join('')}`,'The bakery door is closed, but the ovens are on'),
  qyNurseShift:()=>pic(...DAY,`${gnd(112,'#cfd6e8','#b9c1d9')}<g class="qyv-off">${sun(42,26,10)}</g><g class="qyv-on">${moon(42,26,10)}</g>
    ${bld(84,112,150,80,{col:'#eef1fb',sign:'Varrow General',cross:1,cols:8,rows:3,lit:1})}
    ${P(70,112,{...NURSE,s:1.15})}<g transform="translate(262 52)">${clockG(0,0,19,'qyv-spin')}</g>${txt(262,86,8.6,'#5d6385','long shifts')}`,'Nurses at Varrow General working long shifts'),
  qyBreadRobot:()=>pic(...DAWN,`${sun(150,34,10)}${gnd(112,'#d8c0a0','#c4aa8a')}<path d="M70 120H230" stroke="#b8946a" stroke-width="1.2" stroke-dasharray="6 6"/>
    <path d="M10 112V44H66V112Z" fill="#f6e1c0" stroke="#b8946a" stroke-width="1.1"/><path d="M6 44H70L64 34H12Z" fill="#e5484d"/><path d="M34 112V78H52V112Z" fill="#8a5a3a"/>
    <path d="M14 104C14 98 32 98 32 104Z" fill="#c98a4a" stroke="#8a5a3a" stroke-width=".8"/>
    ${deliv(84,116,1.2,'qyv-roll',118)}${bld(226,112,64,64,{col:'#eef1fb',cross:1,cols:3,rows:3})}`,'A delivery robot carries bread from the bakery to the hospital'),
  qyFlourStep:()=>pic(...DAWN,`${gnd(108,'#d8c0a0','#c4aa8a')}<path d="M60 108V30H170V108Z" fill="#f6e1c0" stroke="#b8946a" stroke-width="1.1"/><path d="M96 108V58H132V108Z" fill="#8a5a3a" stroke="#5a3a20"/>
    <path d="M86 108H142V114H86Z" fill="#a8a0b8"/>
    ${[[84,112],[104,114],[124,112],[146,113]].map(([x,y],i)=>`<g class="qyv-pop" style="--d:${i*.7}s"><path d="M${x-9} ${y}C${x-10} ${y-10} ${x-8} ${y-18} ${x-5} ${y-20}L${x-6} ${y-23}H${x+6}L${x+5} ${y-20}C${x+8} ${y-18} ${x+10} ${y-10} ${x+9} ${y}Z" fill="#f4efe6" stroke="#b8a888" stroke-width="1"/><path d="M${x-5} ${y-10}H${x+5}" stroke="#d8a868" stroke-width="2.4"/></g>`).join('')}
    <g class="qyv-fly" style="--dx:30px;--dy:0px">${P(208,110,{skin:SKIN[3],shirt:'#5b9bf0',hair:'#1b1410',style:'curly',pose:'walk'})}</g>${heart(250,40,.7,CO,'qyv-pop',1)}`,'Neighbors leave bags of flour on the step'),
  qyLoafCount:()=>pic(...['#ffe7ef','#fff8f2'],`${gnd(110,'#bfe3a8','#a6d08e')}
    <path d="M-4 18C40 10 70 22 100 14" stroke="#8a5a3a" stroke-width="3" fill="none" stroke-linecap="round"/>${[[20,14],[44,19],[64,12],[86,17]].map(([x,y],i)=>`<g class="qyv-pop" style="--d:${i*.4}s">${[0,1,2,3,4].map(k=>`<path d="${ov(x+Math.cos(k*1.256)*4,y+Math.sin(k*1.256)*4,3.4)}" fill="#ffc2d6"/>`).join('')}<path d="${ov(x,y,2)}" fill="#ff8aab"/></g>`).join('')}
    <path d="M6 110V58H48V110Z" fill="#f6e1c0" stroke="#b8946a"/><path d="M2 58H52L46 48H8Z" fill="#e5484d"/>${bld(232,110,60,66,{col:'#eef1fb',cross:1,cols:3,rows:3})}
    ${[0,1,2,3,4,5,6,7,8,9].map(i=>`<g class="qyv-pop" style="--d:${(i*.35).toFixed(2)}s"><path d="M${62+i*16} 108C${62+i*16} 98 ${76+i*16} 98 ${76+i*16} 108Z" fill="#d89a52" stroke="#9a6430" stroke-width="1"/><path d="M${66+i*16} 103L${68+i*16} 101M${70+i*16} 103L${72+i*16} 101" stroke="#9a6430" stroke-width=".9"/></g>`).join('')}`,'Loaf after loaf, all the way to the hospital, by spring'),
  // ---------------- Priya's sensor ----------------
  qyUnnoticed:()=>pic(...DAY,`${gnd(116,'#cfe8c0')}
    <g transform="translate(20 14)"><path d="${rr(0,0,150,96,6)}" fill="#fff" stroke="#c9cfe2"/><path d="M6 0H144Q150 0 150 6V14H0V6Q0 0 6 0Z" fill="#e5484d"/>${txt(75,10.5,8,'#fff','3 WEEKS','textLength="38" lengthAdjust="spacingAndGlyphs"')}
     ${Array.from({length:21},(_,i)=>{const cx=12+(i%7)*21,cy=28+Math.floor(i/7)*24;return `<path d="${rr(cx-8,cy-8,16,16,3)}" fill="#f2f4fb"/>${txt(cx,cy+3.4,8,'#8a90b0',String(i+1))}${i<19?`<g class="qyv-on" style="--d:${(i*.22).toFixed(2)}s"><path d="M${cx-6} ${cy-6}L${cx+6} ${cy+6}M${cx+6} ${cy-6}L${cx-6} ${cy+6}" stroke="${CO}" stroke-width="1.8" stroke-linecap="round" opacity=".8"/></g>`:''}`}).join('')}</g>
    <g transform="translate(232 60)"><path d="M-30 0C-18 -18 18 -18 30 0C18 18 -18 18 -30 0Z" fill="#fff" stroke="${INK}" stroke-width="2"/><path d="M-30 0C-18 12 18 12 30 0" stroke="${INK}" stroke-width="2.4" fill="none"/>
     <path d="M-24 3L-30 10M-12 7L-14 15M0 8V16M12 7L14 15M24 3L30 10" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/>${txt(30,-18,12,'#8a90b0','z','font-style="italic" class="qyv-blink"')}${txt(40,-28,9,'#8a90b0','z','font-style="italic" class="qyv-blink" style="--d:.6s"')}</g>
    ${germ(220,104,4,'#7cc576','opacity=".55"')}${germ(246,108,3,'#7cc576','opacity=".45"')}`,'Nobody noticed the germ for almost three weeks'),
  qyHomesLit:()=>{let s='';for(let j=0;j<5;j++)for(let i=0;i<16;i++){const x=14+i*17.5+(j%2)*7,y=18+j*21,hit=(i*7+j*11)%10<5;
      s+=`<path d="M${x} ${y+12}V${y+5}L${x+6} ${y}L${x+12} ${y+5}V${y+12}Z" fill="#e8e2f4" stroke="#b8b0d0" stroke-width=".8"/>${hit?`<path d="${ov(x+6,y+8,2.6)}" fill="${CO}" class="qyv-on" style="--d:${(((i*13+j*7)%20)*.12).toFixed(2)}s"/>`:''}`}
    return pic(...['#f6f2ff','#fff'],s,'The outbreak reached more than a hundred homes')},
  qyBuildBox:()=>pic(...ROOM,`${gnd(104,'#d9c3a8','#c4aa8a')}<path d="M70 92H230V98H70Z" fill="#a8744a"/><path d="M80 98V122M220 98V122" stroke="#8a5a3a" stroke-width="4"/>
    ${boxG(150,92,1.25,GR,'qyv-blink')}
    <path d="M96 90L114 86" stroke="#8a90b0" stroke-width="2.4" stroke-linecap="round"/><path d="M114 86L122 84" stroke="#e5484d" stroke-width="3.6" stroke-linecap="round"/>
    <path d="M182 91L196 84" stroke="#9aa0bd" stroke-width="3" stroke-linecap="round"/><path d="${ov(198,83,3.4)}" fill="none" stroke="#9aa0bd" stroke-width="2.2"/><path d="${rr(204,84,14,8,2)}" fill="#5b9bf0"/><path d="M207 88H215" stroke="#fff" stroke-width="1.2"/>
    ${P(70,104,{...PRIYA,s:1.2})}${P(236,104,{skin:SKIN[0],shirt:'#ff8a7a',hair:'#d9a441',style:'pony',outfit:'jacket',s:1.2,flip:true})}
    ${[[118,40],[186,36],[200,54]].map(([x,y],i)=>`<g class="qyv-pop" style="--d:${i*.6}s"><path d="M${x} ${y-5}V${y+5}M${x-5} ${y}H${x+5}" stroke="${GO}" stroke-width="2" stroke-linecap="round"/></g>`).join('')}`,'Priya’s team builds the first water tester, Sniffer'),
  qySniff:()=>pic(...DAY,`${gnd(96,'#cfe8c0','#b8dca8')}<path d="M0 104H300V130H0Z" fill="#b9a68a"/><path d="M0 108H122" stroke="#5d6385" stroke-width="12"/><path d="M0 108H122" stroke="#7aa6d8" stroke-width="7"/>
    ${[0,1,2,3,4].map(i=>`<g class="qyv-slide" style="--dx:100px;--d:${i*.6}s"><path d="${ov(8,106+(i%2)*3,1.8)}" fill="#e8f7ff"/></g>`).join('')}<g class="qyv-slide" style="--dx:100px;--d:1.4s">${germ(8,108,3.2)}</g>
    <path d="M118 108C126 108 128 100 126 96" stroke="#3d5a80" stroke-width="3" fill="none"/>${boxG(100,96,1.5,'#e5484d','qyv-blink')}
    <path d="${ov(114,60,8)}" fill="none" stroke="#e5484d" stroke-width="2" class="qyv-ring"/><path d="${ov(114,60,8)}" fill="none" stroke="#e5484d" stroke-width="2" class="qyv-ring" style="--d:1.2s"/>
    <path d="M132 62H186" stroke="#e5484d" stroke-width="2" class="qyv-dash"/>${bld(196,108,74,56,{col:'#eef1fb',sign:'Health office',cols:3,rows:2})}
    <path d="${rr(250,26,40,16,8)}" fill="#e5484d" class="qyv-pulse"/>${txt(270,37.5,8.6,'#fff','< 1 day')}`,'Sniffer finds something new in the water and sends an alert within a day'),
  qySensorMap:()=>pic(...DAY,`<path d="${rr(10,10,170,110,8)}" fill="#e9f2e2" stroke="#b9d0a8"/><path d="M10 64H180M96 10V120M40 10C52 50 50 90 36 120" stroke="#fff" stroke-width="7" fill="none"/>
    ${bld(118,58,40,34,{col:'#f2d3a0',cols:2,rows:1})}${txt(138,30,6.4,'#8a5a3a','SCHOOL','textLength="26" lengthAdjust="spacingAndGlyphs"')}
    ${[[26,40,0],[64,34,1],[70,96,0],[22,96,1],[156,100,0],[124,96,1]].map(([x,y,k],i)=>`<path d="M${x-7} ${y+4}V${y-3}L${x} ${y-9}L${x+7} ${y-3}V${y+4}Z" fill="${k?'#f0c39a':'#d9c2e8'}" stroke="#8a7a9a" stroke-width=".8"/><path d="${ov(x+9,y+3,3.4)}" fill="${TE}" class="qyv-pulse" style="--d:${i*.3}s"/>`).join('')}
    <path d="${ov(150,40,3.4)}" fill="${TE}" class="qyv-pulse" style="--d:.9s"/>
    ${globe(240,64,40)}${[[222,46],[252,40],[262,72],[230,84],[214,64],[246,94],[270,52]].map(([x,y],i)=>`<path d="${ov(x,y,2.4)}" fill="#fff" stroke="${TE}" stroke-width="1.4" class="qyv-blink" style="--d:${i*.35}s"/>`).join('')}
    <g class="qyv-fly" style="--dx:40px;--dy:-6px"><path transform="translate(196 22) rotate(-12)" d="M-10 0H8L12 -2H14L12 1L14 4H12L8 2H-10Q-12 1 -10 0ZM-2 0L-6 -6H-3L3 0ZM-2 2L-6 8H-3L3 2Z" fill="#fff" stroke="#8a90b0" stroke-width=".6"/></g>`,'A tester at every school and neighborhood, and in cities and airports all over the world'),
  qyWatchAll:()=>{const pts=[[30,26],[70,16],[22,70],[56,104],[100,112],[104,30]];
    return pic(...['#e9f4ff','#f8fbff'],`${pts.map(([x,y],i)=>`<path d="M${x} ${y}L120 66" stroke="${TE}" stroke-width="1.4" class="qyv-dash" opacity=".7"/>${boxG(x,y+8,.42,GR,'qyv-blink')}`).join('')}${orb(120,66,15)}
    <path d="M140 66H196" stroke="#e5484d" stroke-width="2.2" class="qyv-dash"/><path d="M190 60L198 66L190 72" stroke="#e5484d" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    ${bld(206,112,80,64,{col:'#eef1fb',sign:'Health office',cols:4,rows:2})}<g transform="translate(270 34)"><g class="qyv-wave"><path d="M-7 4C-7 -6 7 -6 7 4V8H-7Z" fill="${GO}" stroke="${dk(GO)}"/><path d="M-9 8H9" stroke="${dk(GO)}" stroke-width="2" stroke-linecap="round"/><path d="${ov(0,10,2)}" fill="${dk(GO)}"/></g></g>`,'One AI watches every sensor and alerts the health office')},
  qyDaysWeeks:()=>{const dots=(x0,y0,n,col)=>Array.from({length:n},(_,i)=>`<path d="${ov(x0+(i%16)*7,y0-Math.floor(i/16)*7,2.6)}" fill="${col}" class="qyv-on" style="--d:${(i*.05).toFixed(2)}s"/>`).join('');
    return pic(...['#fff6ec','#fff'],`${txt(26,44,10,INK,'2030','text-anchor="start"')}<path d="M70 40H280" stroke="#e5d8c8" stroke-width="10" stroke-linecap="round"/><path d="M70 40H272" stroke="${CO}" stroke-width="10" stroke-linecap="round" class="qyv-grow"/>${txt(278,62,8.6,CO,'19 days','text-anchor="end"')}
    ${dots(96,24,48,'#ffb0a6')}
    ${txt(26,104,10,INK,'Now','text-anchor="start"')}<path d="M70 100H280" stroke="#e5d8c8" stroke-width="10" stroke-linecap="round"/><path d="M70 100H82" stroke="${TE}" stroke-width="10" stroke-linecap="round" class="qyv-grow"/>${txt(96,122,8.6,TE,'1 day')}
    <path d="${ov(76,86,2.6)}" fill="#7fd8c8"/>`,'Noticed in days now, not weeks')},
  // ---------------- Noor's order slip ----------------
  qyUnsafeAI:()=>pic(...['#efeaf8','#faf8ff'],`${gnd(112,'#dcd6ea')}
    <path d="${rr(22,30,74,56,6)}" fill="#3a3f5a" stroke="#22263a" stroke-width="1.4"/><path d="${rr(28,36,62,40,3)}" fill="#59607e"/><path d="M50 86H68L72 100H46Z" fill="#8a90b0"/>
    <path d="${ov(48,52,3)}${ov(70,52,3)}" fill="#c9cfe2"/><path d="M48 64Q59 70 70 64" stroke="#c9cfe2" stroke-width="2" fill="none" stroke-linecap="round"/>
    <g transform="translate(96 26)"><path d="M0 8C0 2 4 0 8 0C12 0 16 2 16 8" stroke="#8a90b0" stroke-width="2.4" fill="none" transform="rotate(-24 0 8)"/><path d="${rr(-2,8,18,14,3)}" fill="${GO}"/></g>
    <g class="qyv-slide" style="--dx:110px">${slipG(102,60,.9)}</g>
    ${bld(206,112,80,70,{col:'#e8f6f4',sign:'Print shop',cols:4,rows:2})}<g transform="translate(246 28)"><path d="M-5 -12C5 -7 5 -1 0 0S-5 7 5 12M5 -12C-5 -7 -5 -1 0 0S5 7 -5 12" stroke="${TE}" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M-3.4 -9H3.4M-3.4 9H3.4M-2 -4.6H2M-2 4.6H2" stroke="${lt(TE,.2)}" stroke-width="1.4" stroke-linecap="round"/></g>`,'An unsafe AI helped, and the order went to a print shop'),
  qyWorldRule:()=>{const ring=[[0,-1],[.87,-.5],[.87,.5],[0,1],[-.87,.5],[-.87,-.5]];
    return pic(...['#e6f1ff','#f8fbff'],`${globe(150,66,34)}${ring.map(([a,b],i)=>{const x=150+a*84,y=66+b*48;return `<path d="M${150+a*40} ${66+b*40}L${x} ${y}" stroke="#b9c1d9" stroke-width="1" stroke-dasharray="2 3"/><g transform="translate(${x-12} ${y-11})"><path d="M0 22V7L12 0L24 7V22Z" fill="#e8f6f4" stroke="${TE}" stroke-width="1"/><path d="M9 22V14H15V22Z" fill="${TE}"/></g><g class="qyv-pop" style="--d:${i*.45}s"><path d="${ov(x+12,y-10,6)}" fill="${GR}"/><path d="M${x+9} ${y-10}L${x+11} ${y-8}L${x+15} ${y-12.5}" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>`}).join('')}`,'Every print shop in the world checks every order')},
  qyOrderScan:()=>pic(...['#eef7f6','#fbfffe'],`<path d="M0 92H300V104H0Z" fill="#8a90b0"/>${[0,1,2,3,4,5,6,7,8,9,10].map(i=>`<path d="${ov(14+i*28,104,4)}" fill="#5d6385"/>`).join('')}
    <path d="M128 92V30Q128 22 136 22H164Q172 22 172 30V92" stroke="${TE}" stroke-width="7" fill="none"/><path d="M134 34H166V90H134Z" fill="#7ff7e4" opacity=".22" class="qyv-pulse"/>
    ${[0,1,2,3].map(i=>`<g class="qyv-slide" style="--dx:330px;--d:${(i*.8).toFixed(1)}s">${slipG(-30,62,1,{check:1,cc:'qyv-chk',d:(i*.8).toFixed(1)})}</g>`).join('')}`,'An AI checks every order in less than a second'),
  qyOrdersPass:()=>pic(...['#eef7f6','#fbfffe'],`${slipG(14,30,1,{icon:'med'})}${slipG(42,44,1,{icon:'lab'})}${slipG(18,72,1,{icon:'med'})}
    <path d="M72 70H110" stroke="${TE}" stroke-width="2.4" class="qyv-dash"/><path d="M106 64L114 70L106 76" stroke="${TE}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="${rr(118,36,80,62,8)}" fill="#e8f6f4" stroke="${TE}" stroke-width="1.6"/><path d="${rr(128,46,60,18,4)}" fill="#3a3f5a"/><path d="M134 55H182" stroke="#7ff7e4" stroke-width="2" class="qyv-dash"/><path d="${ov(176,82,4)}" fill="${GR}" class="qyv-blink"/>
    <path d="M198 84H230" stroke="#b9c1d9" stroke-width="3"/>${[0,1,2].map(i=>`<g class="qyv-slide" style="--dx:60px;--d:${i*.9}s"><path d="M${208} 66H218V84Q218 88 213 88Q208 88 208 84Z" fill="#cfeef0" stroke="#7fb9bd" stroke-width="1"/><path d="M207 62H219V67H207Z" fill="${i===1?VI:CO}"/></g>`).join('')}`,'Medicine and research orders print right away'),
  qyFlagHold:()=>pic(...['#f6f2ff','#fffaf3'],`${gnd(112,'#ddd6ee')}${slipG(30,48,1.6,{flag:1})}<path d="M84 72H110" stroke="#e5484d" stroke-width="2" class="qyv-dash"/>
    ${P(150,112,{...NOOR,s:1.25})}<g class="qyv-bob"><g transform="translate(176 62)"><path d="${ov(0,0,10)}" fill="#cfeaff" opacity=".6" stroke="${INK}" stroke-width="2.6"/><path d="M7 7L14 14" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/></g></g>
    <g class="qyv-stamp"><g transform="rotate(-10 248 56)"><path d="${rr(212,40,72,32,4)}" fill="none" stroke="#e0484a" stroke-width="3"/>${txt(248,63,17,'#e0484a','HOLD','textLength="52" lengthAdjust="spacingAndGlyphs"')}</g></g>`,'The AI flags an odd order, and Noor decides whether to hold it'),
  qyQuietDesk:()=>pic(...['#2a2e5e','#3a3a70'],`<path d="${rr(18,12,92,62,4)}" fill="#141a44" stroke="#5a5a8a" stroke-width="2"/><g>${stars(9,3,50).replace(/cx="(\d+)"/g,(m,x)=>`cx="${22+(+x)%84}"`)}</g>${moon(88,28,7)}<path d="M64 12V74M18 43H110" stroke="#5a5a8a" stroke-width="1.6"/>
    ${gnd(118,'#4a3f5e')}<path d="M130 82H292V88H130Z" fill="#a8744a"/><path d="M136 88V118M286 88V118" stroke="#7a5032" stroke-width="4"/>
    <path d="${rr(170,34,84,46,4)}" fill="#22263a"/><path d="${rr(174,38,76,38,2)}" fill="#2e3456"/><path d="M206 80H218L222 82H202Z" fill="#22263a"/>${[0,1,2,3].map(i=>`<path d="M182 ${46+i*8}H226" stroke="#7ff7e4" stroke-width="2" opacity=".35"/><path d="M232 ${46+i*8}L235 ${49+i*8}L240 ${43+i*8}" stroke="${GR}" stroke-width="1.8" fill="none" stroke-linecap="round" class="qyv-on" style="--d:${i*.8}s"/>`).join('')}
    <path d="M264 82V70H276V82Z" fill="#f2f2f6" stroke="#b9c1d9"/><path d="M276 73Q281 74 276 79" stroke="#b9c1d9" stroke-width="1.6" fill="none"/>${[0,1].map(i=>`<path d="M${268+i*4} 66Q${265+i*4} 60 ${269+i*4} 54" stroke="#fff" stroke-width="1.6" fill="none" class="qyv-steam" style="--d:${i}s" stroke-linecap="round"/>`).join('')}
    <path d="M140 82C137 70 143 62 146 54C149 62 155 70 152 82Z" fill="#3f8f6b"/><path d="M138 82H154L153 74H139Z" fill="#c98a4a"/>
    ${P(112,122,{...NOOR,s:1.35,face:'happy'})}`,'A quiet night at the screening desk'),
  // ---------------- Sam's sticker ----------------
  qyDesignFast:()=>pic(...['#eef0ff','#fbfbff'],`${orb(60,62,18)}<path d="M84 62H120" stroke="${VI}" stroke-width="2" class="qyv-dash"/>
    <g transform="translate(150 22)"><path d="M10 14H30C30 14 31 34 31 52C31 62 27 68 20 68C13 68 9 62 9 52C9 34 10 14 10 14Z" fill="none" stroke="${VI}" stroke-width="1.6" stroke-dasharray="4 3" class="qyv-dash"/><path d="M8 6H32V14H8Z" fill="none" stroke="${VI}" stroke-width="1.6" stroke-dasharray="4 3"/>
     <path d="M9.6 40H30.4C30.8 44 31 48 31 52C31 62 27 68 20 68C13 68 9 62 9 52C9 48 9.2 44 9.6 40Z" fill="${lt(VI,.45)}" class="qyv-on"/></g>
    ${calG(212,30,34,'DAY','1','qyv-pop',0,VI)}${calG(252,40,34,'DAY','2','qyv-pop',.8,VI)}`,'An AI designed the vaccine in two days'),
  qyTestWeeks:()=>pic(...MINT,`${gnd(110,'#cfe8dc')}${[0,1,2,3,4,5].map(i=>calG(14+i*9,22+i*4,40,'WEEK',String(i+1),'qyv-pop',i*.6,TE)).join('')}
    <path d="${rr(132,22,62,82,5)}" fill="#fff" stroke="#b9c1d9" stroke-width="1.4"/><path d="${rr(150,16,26,10,3)}" fill="#b9c1d9"/>${[0,1,2,3].map(i=>`<g class="qyv-pop" style="--d:${.6+i*.7}s"><path d="M140 ${40+i*16}L143 ${43+i*16}L149 ${36+i*16}" stroke="${GR}" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g><path d="M154 ${40+i*16}H184" stroke="${INK}" stroke-width="2" opacity=".25" stroke-linecap="round"/>`).join('')}
    ${P(232,110,{skin:SKIN[4],shirt:'#ffffff',hair:'#1b1410',style:'bun',outfit:'coat',s:1.2})}${P(270,110,{...NURSE,s:1.15,flip:true})}`,'Weeks of careful tests'),
  qyStickerKid:()=>pic(...['#e3f6ff','#f8fdff'],`${gnd(112,'#cfe0ee')}${P(98,112,{...NURSE,s:1.35})}${P(180,112,{...KID2,s:1.3,face:'happy',flip:true})}
    <g class="qyv-fly" style="--dx:30px;--dy:-4px"><g transform="translate(118 64)"><path d="${ov(0,0,6)}" fill="${VI}" stroke="#fff" stroke-width="1.4"/>${miniLantern(0,0,.28,GO)}</g></g>
    <g class="qyv-pop" style="--d:2.4s"><g transform="translate(182 88)"><path d="${ov(0,0,4.4)}" fill="${VI}" stroke="#fff" stroke-width="1"/></g></g>${heart(220,40,.7,CO,'qyv-pop',2.8)}`,'Every kid who got a shot got a sticker'),
  qyShield:()=>pic(...['#eef7ff','#fbfdff'],`${gnd(112,'#d8e6f4')}<path d="M70 112C70 50 230 50 230 112" fill="#7ff7e4" opacity=".16"/><path d="M70 112C70 50 230 50 230 112" fill="none" stroke="${TE}" stroke-width="2" class="qyv-pulse"/>
    ${P(150,112,{...KID2,s:1.2,face:'happy'})}<path d="${ov(154,92,3)}" fill="${VI}"/>${P(112,112,{...GRAN,s:1.15,face:'happy'})}${P(190,112,{...MOM,s:1.15,face:'happy',flip:true})}
    ${[[30,60],[270,54],[40,96],[262,96]].map(([x,y],i)=>`<g class="qyv-blink" style="--d:${i*.5}s">${germ(x,y,5,'#9cc994','opacity=".7"')}</g>`).join('')}`,'One shot protects you and the people around you'),
  qyHelped:()=>pic(...NIGHT,`${stars(18,5,50)}<path d="M0 96L20 80H40V70H60V84H86V60H104V78H126V66H150V88H176V56H192V76H214V64H236V82H258V72H280V90H300V130H0Z" fill="#2a2e60"/>
    ${[[30,86],[50,76],[94,70],[112,82],[160,94],[182,66],[222,72],[244,88],[268,80]].map(([x,y],i)=>`<path d="M${x} ${y}h3v3h-3Z" fill="#ffd98a" class="qyv-on" style="--d:${i*.4}s"/>`).join('')}
    <g transform="translate(96 4)">${ART.sticker().replace('<svg ','<svg width="118" height="118" ')}</g>${heart(70,34,.8,CO,'qyv-pop',.4)}${heart(232,30,.9,'#ff9bb0','qyv-pop',1.1)}`,'“I helped Varrow”'),
  // ---------------- Ivy's drawing ----------------
  qyCrayons:()=>pic(...ROOM,`${gnd(96,'#e9d2b0','#d8bc90')}<path d="${rr(120,30,130,82,3)}" fill="#fffaf0" stroke="#d8c8a8" transform="rotate(-3 185 70)"/>
    <path d="M140 92V66H190V92M134 68L165 46L196 68" stroke="${CO}" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="160" class="qyv-draw"/>
    <g class="qyv-bob"><path d="M196 54L224 26" stroke="#5b9bf0" stroke-width="7" stroke-linecap="round"/><path d="M196 54L192 58" stroke="#5b9bf0" stroke-width="4" stroke-linecap="round"/></g>
    <path d="${rr(62,74,52,22,3)}" fill="#ffd45c" stroke="#d8a838"/>${[CO,GO,GR,TE,VI].map((c,i)=>`<path d="M${68+i*9} 74V62L${71+i*9} 56L${74+i*9} 62V74Z" fill="${c}"/>`).join('')}
    ${P(34,126,{...IVY,s:1.15,face:'happy'})}`,'Ivy drawing at seven'),
  qyFirstLantern:()=>pic(...NIGHT,`${stars(20,7,44)}${moon(40,22,8)}${gnd(116,'#2e3266')}${house(70,116,160,84,{wall:'#e8b48a',roof:'#6a3e5e',door:false})}
    <path d="${rr(110,52,80,52,3)}" fill="#ffd98a" stroke="#5a3a40" stroke-width="1.6"/><path d="${rr(110,52,80,52,3)}" fill="#ffb347" opacity=".25" class="qyv-pulse"/>
    <defs><clipPath id="qyfl1"><path d="${rr(111,53,78,50,2)}"/></clipPath></defs><g clip-path="url(#qyfl1)">${P(132,128,{...MOM,s:1.6})}${P(168,128,{...IVY,s:1.35,face:'happy'})}</g>
    <path d="M110 96H190V104H110Z" fill="#c98a5a"/><g class="qyv-pop" style="--d:.8s">${lamp(150,82,1.8,'#f7a440')}</g>
    <path d="M150 52V104" stroke="#5a3a40" stroke-width="1.6" opacity=".55"/><path d="${rr(110,52,80,52,3)}" fill="none" stroke="#5a3a40" stroke-width="2"/>`,'Ivy and her mom put a paper lantern in the window'),
  qyAcrossStreet:()=>pic(...NIGHT,`${stars(18,9,40)}${moon(150,20,8)}${street(100)}
    ${house(14,100,96,64,{wall:'#e8b48a',roof:'#6a3e5e',doorX:.1})}${win(48,52,26,22,1)}${lamp(61,62,1.1,'#f7a440','qyv-sway')}
    ${house(190,100,96,64,{wall:'#bfd8ee',roof:'#4a5a8a',doorX:.72})}${win(224,52,26,22,0)}<g class="qyv-on" style="--d:1.2s">${win(224,52,26,22,1)}${lamp(237,62,1.1,'#ff8a7a')}</g>`,'The next night, the house across the street lit one too'),
  qyStreetGlow:()=>{const cols=['#e8b48a','#bfd8ee','#d9c2e8','#f0d890','#c8e4c0','#f0c0b0'],lc=['#f7a440','#ff8a7a','#ffd45c','#7fd8c8','#a99bff','#f7a440'];
    return pic(...NIGHT,`${stars(16,11,30)}${street(104)}${cols.map((c,i)=>{const x=6+i*49;return `${house(x,104,44,54,{wall:c,roof:i%2?'#5a4a7a':'#6a3e5e',rh:14,door:false})}${win(x+12,62,20,16,0)}<g class="qyv-on" style="--d:${(i*.7).toFixed(1)}s">${win(x+12,62,20,16,1)}${lamp(x+22,70,.85,lc[i])}</g>`}).join('')}`,'By the end of the week, the whole street glowed')},
  qyGardenGrows:()=>pic(...['#2a2e6c','#6a5a92'],`${stars(14,13,36)}${gnd(104,'#2c4a44','#3a5e52')}
    ${house(10,104,70,58,{wall:'#e8b48a',roof:'#6a3e5e',door:false})}${win(32,62,24,20,1)}
    ${[0,1,2,3].map(i=>`<g class="qyv-fly" style="--dx:${70+i*14}px;--dy:${-10-i*4}px;--d:${i*1.1}s">${lamp(44,72,.9,['#f7a440','#ff8a7a','#ffd45c','#7fd8c8'][i])}</g>`).join('')}
    ${[0,1,2,3,4,5,6].map(i=>`<path d="M${150+i*20} 104V${70+(i%2)*6}" stroke="#1e2a2a" stroke-width="1.6"/>${lamp(150+i*20,66+(i%2)*6,.9,['#f7a440','#ff8a7a','#ffd45c','#7fd8c8','#a99bff','#f7a440','#ff8a7a'][i],'qyv-sway',i*.3)}`).join('')}
    ${[0,1,2,3,4,5,6,7,8].map(i=>lamp(140+i*17,96+(i%2)*3,.55,['#f7a440','#ffd45c','#ff8a7a'][i%3])).join('')}`,'That is how the lantern garden started'),
  qyBigFromSmall:()=>{let s='';for(let k=0;k<3;k++){const n=8+k*6,R=26+k*24;for(let i=0;i<n;i++){const a=i/n*Math.PI*2+k*.3,x=190+Math.cos(a)*R*1.3,y=66+Math.sin(a)*R*.7;if(x<110||x>292||y<6||y>124)continue;s+=`<g class="qyv-on" style="--d:${(k*.9+i*.04).toFixed(2)}s">${lamp(r(x),r(y),.55,['#f7a440','#ffd45c','#ff8a7a','#7fd8c8','#a99bff'][(i+k)%5])}</g>`}}
    return pic(...NIGHT,`${stars(12,15,30)}${gnd(112,'#2c3466')}${P(44,112,{...IVY,s:1.3,face:'happy'})}${lamp(66,70,1.3,'#f7a440','qyv-sway')}${lamp(190,66,1.1,'#ffd45c','qyv-pulse')}${s}`,'One small lantern led to thousands')}
  });

  return ART;
})();
