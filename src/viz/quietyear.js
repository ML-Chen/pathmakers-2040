// quiet_year_art.js — artifacts for the Quiet Year memorial garden (Varrow, 2030).
// QY_ART.<key>() returns an SVG string with class "qyart" and a transparent background.
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

  return {
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
      ${txt(60,61,21,CO,'Closed','textLength="70" lengthAdjust="spacingAndGlyphs"')}
      ${txt(60,74,12,VI,'for now','textLength="44" lengthAdjust="spacingAndGlyphs"')}
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

  // 3 ── the first early-warning air sensor: hand-built box, fan, antenna, green light, tape label
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
    <g transform="rotate(12 40 71)">${[0,90,180,270].map(a=>`<path transform="rotate(${a} 40 71)" d="M40 71C38 64 40 58.5 46 57C47 62 45.5 67.5 40 71Z" fill="${lt(C,.3)}"/>`).join('')}</g>
    <path d="${ov(40,71,3.6)}" fill="${lt(C,.6)}"/>
    <path d="${ov(40,71,12)}M28 71H52M40 59V83M31.6 62.6L48.4 79.4M48.4 62.6L31.6 79.4" fill="none" stroke="#e3ecf4" stroke-width="1.4" opacity=".85"/>
    <path d="M29.5 64.5Q32 58 38.5 56" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".7"/>
    <path d="${ov(23,50,1.3)}${ov(83,50,1.3)}${ov(23,95,1.3)}${ov(83,95,1.3)}" fill="${dk(C,.45)}"/>
    <path d="${ov(76,55,9)}" fill="url(#${g})"/><path d="${ov(76,55,4.2)}" fill="${GR}" ${I(GR)}/><path d="${ov(74.8,53.8,1.3)}" fill="#fff"/>
    <path d="M64 53H68M64 57H68" stroke="${dk(C,.45)}" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M60.5 64H84M60.5 68H84" stroke="${dk(C,.3)}" stroke-width="1.4" stroke-linecap="round"/>
    <g transform="rotate(-7 74 85)">
      <path d="M53 78.6L56 78.2L94 78.4L96 80.2L94.4 82L96 84L94.4 86L96 88L94 89.6L56 90L53 90.4L54.6 88.4L53 86.4L54.6 84.4L53 82.4L54.6 80.4Z" fill="${TP}" ${I(TP)} opacity=".96"/>
      <path d="M55.6 88.6H94" stroke="${dk(TP,.15)}" stroke-width="1.4" opacity=".6"/>
      ${txt(75,87.2,8.6,INK,'SNIFFER v1','textLength="35" lengthAdjust="spacingAndGlyphs" font-style="italic"')}</g>
    
    <path d="M98.4 74C106 74 108 82 104 88C100 94 104 100 110 100" fill="none" ${O('#6b7192')}/><path d="M98.4 74C106 74 108 82 104 88C100 94 104 100 110 100" fill="none" stroke="#9aa0bd" stroke-width="1.4" stroke-linecap="round"/>`)},

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
        ${txt(60,56.5,9.6,ST,'HOLD FOR','textLength="44" lengthAdjust="spacingAndGlyphs"')}
        ${txt(60,67.6,10.6,ST,'REVIEW','textLength="48" lengthAdjust="spacingAndGlyphs"')}
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
})();
