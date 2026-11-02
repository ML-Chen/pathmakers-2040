// art.js — all vector art, drawn in code as SVG strings.
// Palette lives in CSS custom properties; art uses literal fills from ART palette so scenes look identical everywhere.
const PAL={
  ink:'#1f2340', sky1:'#bfe3ff', sky2:'#eaf6ff', sun:'#ffd45c', leaf:'#38b07f', leafD:'#23845d', water:'#5fb8e6',
  brick:'#c4775a', brickD:'#9b5640', stone:'#d9dde8', steel:'#8f9bb7', glass:'#a8d8f0', white:'#ffffff', shadow:'rgba(31,35,64,.14)',
  violet:'#6c5ce7', coral:'#ff7a6b', teal:'#16b3a6', gold:'#f5b82e'
};
const SKIN=['#f8d6c0','#eab38f','#c98e64','#a36a43','#7a4a2c','#5a341f'];

// ---------- color helpers ----------
function mix(h1,h2,t){const p=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));const a=p(h1),b=p(h2);return '#'+a.map((v,i)=>Math.round(v+(b[i]-v)*t).toString(16).padStart(2,'0')).join('')}
let UIDN=0;

// ---------- Byte, a fluffy robot puppy ----------
// opts: {color, ears:'floppy'|'pointy'|'round', mood:'happy'|'neutral'|'think'|'alert'}
function byteSVG(o={}){
  const c=o.color||'#f0b35a', ears=o.ears||'floppy', mood=o.mood||'happy', id='b'+(++UIDN);
  const light=mix(c,'#ffffff',.72), shade=mix(c,'#3a2a50',.22), ink='#2a2140';
  const earP={
    floppy:`<path d="M44 30 Q22 26 24 60 Q26 80 40 72 Q48 56 52 40Z" fill="${shade}"/><path d="M116 30 Q138 26 136 60 Q134 80 120 72 Q112 56 108 40Z" fill="${shade}"/>`,
    pointy:`<path d="M46 40 L40 6 Q58 14 66 28Z" fill="${c}"/><path d="M49 34 L46 14 Q57 20 61 28Z" fill="#ffb3c2"/><path d="M114 40 L120 6 Q102 14 94 28Z" fill="${c}"/><path d="M111 34 L114 14 Q103 20 99 28Z" fill="#ffb3c2"/>`,
    round:`<circle cx="46" cy="24" r="16" fill="${c}"/><circle cx="46" cy="24" r="8" fill="#ffb3c2"/><circle cx="114" cy="24" r="16" fill="${c}"/><circle cx="114" cy="24" r="8" fill="#ffb3c2"/>`
  }[ears];
  const eye=(x,flip)=>mood==='think'&&flip?`<path d="M${x-8} 58 Q${x} 52 ${x+8} 58" stroke="${ink}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`
    :`<ellipse cx="${x}" cy="56" rx="${mood==='alert'?8.5:8}" ry="${mood==='alert'?10.5:10}" fill="${ink}"/><ellipse cx="${x}" cy="60" rx="5.5" ry="5" fill="#5a4a8a" opacity=".7"/><circle cx="${x+2.6}" cy="51.5" r="3.4" fill="#fff"/><circle cx="${x-3}" cy="61" r="1.6" fill="#fff"/>`;
  const mouth=mood==='happy'?`<path d="M72 79 Q76 84 80 79 Q84 84 88 79" stroke="${ink}" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M76 82 Q80 92 84 82Z" fill="#ff7f9a"/>`
    :mood==='alert'?`<ellipse cx="80" cy="82" rx="3.6" ry="4.4" fill="${ink}"/>`:`<path d="M72 80 Q76 84 80 80 Q84 84 88 80" stroke="${ink}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  return `<g class="byte">
  <ellipse cx="80" cy="140" rx="46" ry="6" fill="rgba(31,35,64,.16)"/>
  <g class="byte-tail"><path d="M108 116 Q136 112 132 86 Q130 74 140 70" stroke="${c}" stroke-width="13" fill="none" stroke-linecap="round"/><circle cx="140" cy="70" r="7.5" fill="${light}"/></g>
  <g class="byte-body">
    <path d="M46 138 Q40 98 80 92 Q120 98 114 138Z" fill="${c}"/>
    <path d="M62 136 Q60 106 80 102 Q100 106 98 136Z" fill="${light}"/>
    <ellipse cx="64" cy="136" rx="13" ry="7.5" fill="${light}"/><ellipse cx="96" cy="136" rx="13" ry="7.5" fill="${light}"/>
    <path d="M58 136 v3 M64 137 v3 M70 136 v3 M90 136 v3 M96 137 v3 M102 136 v3" stroke="${shade}" stroke-width="1.6" stroke-linecap="round"/>
  </g>
  <g class="byte-head">
    <g class="byte-ears">${earP}</g>
    <path d="M40 58 Q38 18 80 16 Q122 18 120 58 Q122 92 80 96 Q38 92 40 58Z" fill="${c}"/>
    <path d="M66 20 Q80 30 94 20 Q88 34 80 36 Q72 34 66 20Z" fill="${light}" opacity=".85"/>
    <ellipse cx="80" cy="78" rx="21" ry="15" fill="${light}"/>
    <g class="byte-eyes">${eye(60,false)}${eye(100,true)}</g>
    <ellipse cx="52" cy="72" rx="7" ry="4" fill="#ff8fa8" opacity=".55"/><ellipse cx="108" cy="72" rx="7" ry="4" fill="#ff8fa8" opacity=".55"/>
    <path d="M73 69 Q80 64 87 69 Q86 76 80 77 Q74 76 73 69Z" fill="${ink}"/><ellipse cx="77.5" cy="69" rx="2.4" ry="1.4" fill="#fff" opacity=".8"/>
    ${mouth}
    ${mood==='think'?`<circle cx="128" cy="26" r="3" fill="${c}" class="thinkdot"/><circle cx="136" cy="16" r="4" fill="${c}" class="thinkdot d2"/>`:''}
    <path d="M52 92 Q80 104 108 92 L108 99 Q80 111 52 99Z" fill="#6c5ce7"/>
    <g class="byte-collar"><path d="M80 98 l7 4 v8 l-7 4 l-7 -4 v-8z" fill="#7ff7e4" stroke="#fff" stroke-width="1.5"/><path d="M77 105 h6 M80 102 v6" stroke="#1a6e66" stroke-width="1.6" stroke-linecap="round"/></g>
  </g>
</g>`;
}
function byteBox(o={},cls=''){return `<svg class="byteart ${cls}" viewBox="14 0 136 150" aria-label="${o.name||'Byte'}, your robot puppy">${byteSVG(o)}</svg>`}

// ---------- Anime-style portraits for face-to-face conversations (viewBox 0 0 300 380) ----------
// o: {skin, hair, hairStyle, eye, shirt, coat, glasses, age, mood, clip}
function animeEye(cx,o,flip,uid){const iris=o.eye||'#5a3a2a';const tf=flip?`transform="translate(${2*cx} 0) scale(-1 1)"`:'';
  return `<g ${tf}><path d="M${cx-20} 160 Q${cx-20} 134 ${cx} 133 Q${cx+20} 134 ${cx+20} 160 Q${cx+19} 184 ${cx} 185 Q${cx-19} 184 ${cx-20} 160Z" fill="#fff"/>
   <ellipse cx="${cx+1}" cy="163" rx="15.5" ry="20" fill="url(#iris${uid})"/><ellipse cx="${cx+1}" cy="165" rx="7.5" ry="10" fill="#1d1630"/>
   <circle cx="${cx+7}" cy="152" r="6" fill="#fff"/><circle cx="${cx-6}" cy="174" r="2.8" fill="#fff"/><path d="M${cx-8} 178 Q${cx+1} 183 ${cx+10} 178" stroke="#fff" stroke-width="2" opacity=".55" fill="none"/>
   <path d="M${cx-25} 151 Q${cx-14} 128 ${cx+4} 129 Q${cx+20} 130 ${cx+25} 146 L${cx+29} 140" stroke="#1d1630" stroke-width="5.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
   <path d="M${cx-14} 186 Q${cx} 190 ${cx+12} 186" stroke="#1d1630" stroke-width="1.8" opacity=".5" fill="none" stroke-linecap="round"/></g>`}
function animeMouth(m){return {
  happy:`<path d="M136 214 Q150 232 164 214Z" fill="#7a2a3a"/><path d="M142 222 Q150 230 158 222 Q150 218 142 222Z" fill="#ff8a9e"/>`,
  smile:`<path d="M139 216 Q150 225 161 216" stroke="#7a2a3a" stroke-width="3.2" fill="none" stroke-linecap="round"/>`,
  neutral:`<path d="M142 219 Q150 221 158 219" stroke="#7a2a3a" stroke-width="3.2" fill="none" stroke-linecap="round"/>`,
  worried:`<path d="M140 222 Q145 216 150 220 Q155 224 160 218" stroke="#7a2a3a" stroke-width="3.2" fill="none" stroke-linecap="round"/>`,
  sad:`<path d="M140 224 Q150 214 160 224" stroke="#7a2a3a" stroke-width="3.2" fill="none" stroke-linecap="round"/>`,
  surprised:`<ellipse cx="150" cy="220" rx="6" ry="8" fill="#7a2a3a"/>`,
  stern:`<path d="M140 220 L160 220" stroke="#7a2a3a" stroke-width="3.2" stroke-linecap="round"/>`,
  think:`<path d="M141 220 Q150 216 159 221" stroke="#7a2a3a" stroke-width="3.2" fill="none" stroke-linecap="round"/>`}[m]||''}
function animeBrows(m,col){const L={worried:'M98 124 Q112 116 128 122',sad:'M98 124 Q112 116 128 122',stern:'M98 118 L128 126',surprised:'M98 116 Q112 106 128 112',think:'M98 122 Q112 118 128 122'}[m]||'M98 122 Q112 114 128 118';
  const R={worried:'M172 122 Q188 116 202 124',sad:'M172 122 Q188 116 202 124',stern:'M172 126 L202 118',surprised:'M172 112 Q188 106 202 116',think:'M172 116 Q188 108 202 116'}[m]||'M172 118 Q188 114 202 122';
  return `<g stroke="${col}" stroke-width="4" fill="none" stroke-linecap="round"><path d="${L}"/><path d="${R}"/></g>`}
const BANGS='M68 128 Q66 52 150 46 Q234 52 232 128 L222 118 L214 142 L204 110 L190 138 L180 104 L164 132 L150 100 L136 132 L120 104 L110 138 L96 110 L86 142 L78 118Z';
function hairParts(o){const h=o.hair,hi=mix(h,'#ffffff',.38),sh=mix(h,'#000000',.25);const st=o.hairStyle;
  const sheen=`<path d="M104 70 Q150 52 196 70 Q192 78 186 76 Q150 64 114 78 Q108 78 104 70Z" fill="${hi}" opacity=".55"/>`;
  const back={
    long:`<path d="M62 120 Q54 250 80 300 L220 300 Q246 250 238 120 Q230 60 150 56 Q70 60 62 120Z" fill="${sh}"/>`,
    braids:`<path d="M66 124 Q64 70 150 58 Q236 70 234 124 L226 200 L74 200Z" fill="${sh}"/>`+[0,1,2,3,4].map(i=>`<ellipse cx="66" cy="${206+i*20}" rx="13" ry="12" fill="${h}"/><ellipse cx="234" cy="${206+i*20}" rx="13" ry="12" fill="${h}"/>`).join('')+`<circle cx="66" cy="304" r="7" fill="${o.clip||'#ff7a6b'}"/><circle cx="234" cy="304" r="7" fill="${o.clip||'#ff7a6b'}"/>`,
    bun:`<path d="M66 126 Q62 62 150 54 Q238 62 234 126 L230 170 L70 170Z" fill="${sh}"/><circle cx="150" cy="40" r="32" fill="${h}"/><path d="M128 30 Q150 18 172 30" stroke="${hi}" stroke-width="4" fill="none" opacity=".7"/><circle cx="150" cy="40" r="32" fill="none" stroke="${sh}" stroke-width="2" stroke-dasharray="6 7" opacity=".6"/>`,
    short:`<path d="M66 128 Q62 60 150 52 Q238 60 234 128 L226 160 L74 160Z" fill="${sh}"/>`,
    elder:`<path d="M70 130 Q66 66 150 60 Q234 66 230 130 L224 168 L76 168Z" fill="${sh}"/><circle cx="150" cy="50" r="24" fill="${h}"/>`
  }[st]||'';
  let front;
  if(st==='short'||st==='elder')front=`<path d="M70 124 Q66 56 150 50 Q234 56 230 124 Q216 92 196 104 Q182 80 150 92 Q120 76 104 102 Q84 92 70 124Z" fill="${h}"/>`;
  else front=`<path d="${BANGS}" fill="${h}"/><path d="M68 128 Q62 170 74 206 Q80 176 84 150Z" fill="${h}"/><path d="M232 128 Q238 170 226 206 Q220 176 216 150Z" fill="${h}"/>`;
  return {back,front:front+sheen}}
function personSVG(o){
  const uid=++UIDN, skin=o.skin||'#f6d2bd', skinSh=mix(skin,'#b0566a',.18), kid=o.age==='kid', shirt=o.shirt||'#16b3a6';
  const H=hairParts(o), mood=o.mood||'smile';
  const body=kid?`<path d="M96 380 Q98 300 150 292 Q202 300 204 380Z" fill="${shirt}"/><path d="M128 296 Q150 316 172 296" stroke="#fff" stroke-width="5" fill="none" opacity=".6"/>`
    :`<path d="M66 380 Q70 292 150 282 Q230 292 234 380Z" fill="${shirt}"/>`;
  const coat=o.coat?`<path d="M66 380 Q70 292 150 282 L128 380Z" fill="#fbfdff"/><path d="M234 380 Q230 292 150 282 L172 380Z" fill="#fbfdff"/><path d="M150 284 L132 330 L146 326Z M150 284 L168 330 L154 326Z" fill="#e3e8f6"/><rect x="186" y="330" width="26" height="6" rx="3" fill="#6c5ce7"/><circle cx="104" cy="336" r="9" fill="#16b3a6"/><path d="M100 336 h8 M104 332 v8" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>`:'';
  const glasses=o.glasses?`<g fill="none" stroke="#3a2f5a" stroke-width="3"><rect x="88" y="138" width="46" height="40" rx="16"/><rect x="166" y="138" width="46" height="40" rx="16"/><path d="M134 156 Q150 150 166 156"/></g><path d="M96 144 l12 -4" stroke="#fff" stroke-width="3" opacity=".6"/>`:'';
  return `<g class="person"><defs><radialGradient id="iris${uid}" cx=".5" cy=".75" r=".8"><stop offset="0" stop-color="${mix(o.eye||'#5a3a2a','#ffffff',.45)}"/><stop offset=".6" stop-color="${o.eye||'#5a3a2a'}"/><stop offset="1" stop-color="${mix(o.eye||'#5a3a2a','#000000',.45)}"/></radialGradient></defs>
  ${H.back}
  <g class="p-body">${body}${coat}<path d="M134 230 h32 v60 q-16 10 -32 0z" fill="${skin}"/><path d="M134 246 q16 12 32 0 v-12 h-32z" fill="${skinSh}" opacity=".6"/></g>
  <g class="p-head">
    <ellipse cx="70" cy="168" rx="11" ry="16" fill="${skin}"/><ellipse cx="230" cy="168" rx="11" ry="16" fill="${skin}"/>
    <path d="M70 140 Q70 60 150 58 Q230 60 230 140 Q232 196 196 228 Q172 248 150 249 Q128 248 104 228 Q68 196 70 140Z" fill="${skin}"/>
    <path d="M78 134 Q150 112 222 134 L222 128 Q150 104 78 128Z" fill="${skinSh}" opacity=".35"/>
    ${animeBrows(mood,mix(o.hair,'#000000',.15))}
    <g class="p-eyes">${animeEye(112,o,false,uid)}${animeEye(188,o,true,uid)}</g>
    <ellipse cx="96" cy="200" rx="15" ry="8" fill="#ff8fa3" opacity=".42"/><ellipse cx="204" cy="200" rx="15" ry="8" fill="#ff8fa3" opacity=".42"/>
    <path d="M88 198 l5 -6 M95 199 l5 -6 M102 200 l5 -6 M196 200 l5 -6 M203 199 l5 -6 M210 198 l5 -6" stroke="#ff6f8f" stroke-width="1.6" opacity=".5" stroke-linecap="round"/>
    <path d="M150 192 l-3 6 h5" stroke="${skinSh}" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <g class="p-mouth">${animeMouth(mood)}</g>
    ${glasses}${H.front}
    ${o.hairStyle==='braids'?`<path d="M196 72 l14 -10 l4 14z" fill="${o.clip||'#ff7a6b'}"/><circle cx="208" cy="70" r="4" fill="#fff" opacity=".7"/>`:''}
  </g>
</g>`;}
function portrait(o,cls=''){return `<svg class="portrait ${cls}" viewBox="20 6 260 374" aria-label="${o.name}">${personSVG(o)}</svg>`}

// ---------- small scene people (walkers, crowds, futures) ----------
function mini(x,y,o={}){const s=o.s||1,sk=o.skin||SKIN[(x*7|0)%6],sh=o.shirt||PAL.teal,h=o.hair||PAL.ink;
  return `<g transform="translate(${x} ${y}) scale(${s})" class="${o.cls||''}"><ellipse cx="0" cy="34" rx="11" ry="3" fill="${PAL.shadow}"/><rect x="-9" y="6" width="18" height="24" rx="8" fill="${sh}"/><rect x="-7" y="26" width="5" height="9" rx="2.5" fill="${PAL.ink}"/><rect x="2" y="26" width="5" height="9" rx="2.5" fill="${PAL.ink}"/><circle cx="0" cy="-4" r="11.5" fill="${sk}"/><path d="M-12 -4 Q-12 -17 0 -17 Q12 -17 12 -4 L9 -8 L6 -3 L3 -9 L0 -4 L-3 -9 L-6 -3 L-9 -8Z" fill="${h}"/><ellipse cx="-4.2" cy="-2" rx="2" ry="2.6" fill="#1d1630"/><ellipse cx="4.2" cy="-2" rx="2" ry="2.6" fill="#1d1630"/><circle cx="-3.5" cy="-3" r=".8" fill="#fff"/><circle cx="4.9" cy="-3" r=".8" fill="#fff"/><ellipse cx="-7" cy="2" rx="2.2" ry="1.2" fill="#ff8fa3" opacity=".6"/><ellipse cx="7" cy="2" rx="2.2" ry="1.2" fill="#ff8fa3" opacity=".6"/>${o.face?`<path d="${o.face==='sad'?'M-2.5 4.5 q2.5 -2 5 0':'M-2.5 3 q2.5 2.6 5 0'}" stroke="#7a2a3a" stroke-width="1.2" fill="none" stroke-linecap="round"/>`:''}</g>`}
function robotBot(x,y,s=1,stripe=PAL.teal){return `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="30" rx="14" ry="3" fill="${PAL.shadow}"/><rect x="-12" y="-4" width="24" height="30" rx="9" fill="#f4f6fb" stroke="#d5dae6"/><rect x="-12" y="8" width="24" height="4" fill="${stripe}"/><rect x="-8" y="-16" width="16" height="12" rx="5" fill="#f4f6fb" stroke="#d5dae6"/><rect x="-5" y="-12" width="10" height="4" rx="2" fill="#c9d3e6"/></g>`}
function drone(x,y,s=1){return `<g class="drone" transform="translate(${x} ${y}) scale(${s})"><rect x="-14" y="-3" width="28" height="6" rx="3" fill="#eef1f8" stroke="#cdd4e4"/><ellipse cx="-14" cy="-5" rx="9" ry="2" fill="#cdd4e4"/><ellipse cx="14" cy="-5" rx="9" ry="2" fill="#cdd4e4"/><rect x="-4" y="3" width="8" height="8" rx="2" fill="${PAL.gold}"/></g>`}
function tree(x,y,s=1){return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-3" y="0" width="6" height="26" rx="3" fill="#8a6a4f"/><circle cx="0" cy="-6" r="16" fill="${PAL.leaf}"/><circle cx="-10" cy="2" r="11" fill="${PAL.leafD}"/><circle cx="10" cy="0" r="12" fill="${PAL.leaf}"/></g>`}

// ---------- Scenes: tall phone-shaped canvases (viewBox 0 0 390 844), layered for depth, with ambient motion ----------
function hash(n){n=Math.sin(n*127.1)*43758.5453;return n-Math.floor(n)}
function grad(id,stops,v=true){return `<linearGradient id="${id}" x1="0" y1="0" x2="${v?0:1}" y2="${v?1:0}">${stops.map(([o,c,a])=>`<stop offset="${o}" stop-color="${c}"${a!=null?` stop-opacity="${a}"`:''}/>`).join('')}</linearGradient>`}
function windows(x,y,w,h,cols,rows,col,lit,seed=1,litCol='#ffe8a3'){let o='';const cw=w/cols,rh=h/rows;
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const on=hash(seed+r*31+c*7)<lit;o+=`<rect x="${(x+c*cw+cw*.22).toFixed(1)}" y="${(y+r*rh+rh*.2).toFixed(1)}" width="${(cw*.56).toFixed(1)}" height="${(rh*.55).toFixed(1)}" rx="1" fill="${on?litCol:col}"${on&&lit<.9?' class="twinkle" style="animation-delay:'+(hash(seed+r+c)*6).toFixed(1)+'s"':''}/>`}return o}
function cloud(x,y,s,op=.9,cls='cloud',dur=60){return `<g class="${cls}" style="--dur:${dur}s"><g transform="translate(${x} ${y}) scale(${s})" opacity="${op}"><ellipse cx="0" cy="0" rx="46" ry="16" fill="#fff"/><ellipse cx="-20" cy="-10" rx="22" ry="16" fill="#fff"/><ellipse cx="14" cy="-14" rx="26" ry="20" fill="#fff"/></g></g>`}
function bird(x,y,s=1,d=0){return `<g class="bird" style="animation-delay:${d}s"><path transform="translate(${x} ${y}) scale(${s})" d="M-8 0 Q-4 -5 0 0 Q4 -5 8 0" stroke="#3b3f63" stroke-width="1.6" fill="none" stroke-linecap="round" class="wing"/></g>`}
// Boston skyline 2040 in three depth layers. night=true lights the windows.
function skylineFar(y,col){return `<path d="M0 ${y} V${y-40} h30 v-26 h22 v18 h26 v-50 h18 v50 h30 v-30 h24 v-60 h14 v60 h40 v-22 h30 v-46 h20 v46 h26 v-34 h30 v-18 h22 v38 h38 V${y}Z" fill="${col}"/>`}
function skylineMid(y,night){const g=night?'#2b3466':'#8fa6d4',g2=night?'#323d78':'#7d95c6',glass=night?'#3c4a8c':'url(#glassG)';
  return `<g>
   <rect x="34" y="${y-150}" width="40" height="150" fill="${g}"/>${windows(34,y-146,40,140,4,12,night?'#2b3466':'#9db3dc',night?.45:0,3)}
   <rect x="86" y="${y-250}" width="44" height="250" fill="${g2}"/><path d="M86 ${y-250} h44 l-6 -14 h-32z" fill="${g2}"/><rect x="104" y="${y-284}" width="6" height="22" fill="${g2}"/>${windows(86,y-244,44,236,4,22,night?'#323d78':'#93abd8',night?.5:0,5)}
   <path d="M144 ${y} V${y-300} l38 -8 V${y}Z" fill="${glass}"/><path d="M182 ${y} V${y-308} l14 6 V${y}Z" fill="${night?'#2a3570':'#5f7fbf'}"/>${night?windows(146,y-290,34,286,3,26,'#3c4a8c',.35,9):`<path d="M150 ${y-290} l26 -6 v40 l-26 6z" fill="#ffffff" opacity=".35"/>`}
   <path d="M210 ${y} V${y-210} Q228 ${y-246} 246 ${y-210} V${y}Z" fill="${night?'#2d4a5e':'#6fb3a3'}"/>${[0,1,2,3,4,5,6].map(i=>`<path d="M214 ${y-196+i*28} h28" stroke="${night?'#3f8f74':'#38b07f'}" stroke-width="7" stroke-linecap="round"/>`).join('')}
   <g class="turbine" style="transform-origin:228px ${y-238}px"><path d="M228 ${y-238} v-16 M228 ${y-238} l14 8 M228 ${y-238} l-14 8" stroke="${night?'#9fb0e6':'#ffffff'}" stroke-width="2.4" stroke-linecap="round"/></g>
   <rect x="260" y="${y-170}" width="36" height="170" fill="${g}"/>${windows(260,y-164,36,160,3,14,night?'#2b3466':'#9db3dc',night?.5:0,11)}
   <rect x="306" y="${y-120}" width="50" height="120" fill="${g2}"/>${windows(306,y-114,50,110,5,9,night?'#323d78':'#93abd8',night?.45:0,13)}
  </g>`}
function zakim(x,y,night){const c=night?'#c9d4ff':'#ffffff';return `<g opacity=".95"><path d="M${x} ${y} L${x+40} ${y-110} L${x+80} ${y}" stroke="${c}" stroke-width="3" fill="none"/>${[0,1,2,3,4,5,6,7].map(i=>`<path d="M${x+40} ${y-104+i*4} L${x-30+i*10} ${y}" stroke="${c}" stroke-width=".9" opacity=".8"/><path d="M${x+40} ${y-104+i*4} L${x+110-i*10} ${y}" stroke="${c}" stroke-width=".9" opacity=".8"/>`).join('')}<rect x="${x-40}" y="${y-2}" width="160" height="5" fill="${c}"/></g>`}
function river(y,h,night){return `<rect x="0" y="${y}" width="390" height="${h}" fill="url(#riverG)"/>${[0,1,2,3,4,5,6,7,8].map(i=>`<path class="ripple" style="animation-delay:${(i*.7).toFixed(1)}s" d="M${(hash(i+3)*330).toFixed(0)} ${y+12+i*(h-20)/9} h${30+hash(i)*50}" stroke="#fff" stroke-opacity="${night?.25:.5}" stroke-width="1.6" stroke-linecap="round"/>`).join('')}`}
function sailboat(x,y,s=1){return `<g class="boat" style="--dx:${70*s}px"><g transform="translate(${x} ${y}) scale(${s})"><path d="M-14 0 h28 l-5 6 h-18z" fill="#fff"/><path d="M0 -2 V-30 L14 -4z" fill="#fff"/><path d="M-2 -4 V-24 L-12 -4z" fill="#ffd3cc"/></g></g>`}
function gondola(x1,y1,x2,y2,night){return `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${night?'#8892c6':'#6b7aa8'}" stroke-width="1.4"/><g class="gondola" style="--gx:${x2-x1}px;--gy:${y2-y1}px"><g transform="translate(${x1} ${y1})"><path d="M0 0 v8" stroke="#6b7aa8" stroke-width="1.4"/><rect x="-9" y="8" width="18" height="12" rx="4" fill="${night?'#ffd45c':'#ff7a6b'}"/><rect x="-6" y="11" width="12" height="4" rx="1.5" fill="${night?'#fff3c4':'#e9f6ff'}"/></g></g>`}
const SCENES={
  home:()=>`<svg class="scene" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice"><defs>
     ${grad('dawn',[[0,'#7aa7ff'],[.35,'#c9b8ff'],[.62,'#ffc3c0'],[.8,'#ffe1b0']])}${grad('glassG',[[0,'#b9d8ff'],[1,'#6f8fd0']],false)}${grad('riverG',[[0,'#8fb6f0'],[1,'#5d86d1']])}${grad('room',[[0,'#fff1e6'],[1,'#f6d9cc']])}${grad('floor',[[0,'#d9a98c'],[1,'#c48e72']])}
     <radialGradient id="sunG"><stop offset="0" stop-color="#fff6d6"/><stop offset=".35" stop-color="#ffe08a"/><stop offset="1" stop-color="#ffd45c" stop-opacity="0"/></radialGradient>
     <radialGradient id="lightG" cx=".3" cy=".1" r=".9"><stop offset="0" stop-color="#fff2c9" stop-opacity=".7"/><stop offset="1" stop-color="#fff2c9" stop-opacity="0"/></radialGradient></defs>
    <rect width="390" height="844" fill="url(#room)"/>
    <clipPath id="winH"><rect x="22" y="70" width="346" height="470" rx="18"/></clipPath>
    <g clip-path="url(#winH)"><rect x="22" y="70" width="346" height="470" rx="18" fill="url(#dawn)"/>
     <circle cx="276" cy="300" r="90" fill="url(#sunG)"/><circle cx="276" cy="300" r="26" fill="#fff4cf"/>
     ${cloud(80,170,1.1,.85,'cloud',70)}${cloud(260,130,.8,.7,'cloud slow',90)}${cloud(150,250,.6,.6,'cloud',55)}
     ${skylineFar(420,'#b8b4e6')}${skylineMid(462,false)}${zakim(300,470,false)}
     ${gondola(30,330,370,290,false)}
     ${river(462,78,false)}${sailboat(70,500,1)}${sailboat(240,520,.7)}
     ${bird(120,210,1,0)}${bird(140,200,.8,.3)}${bird(300,190,.9,.6)}
     ${drone(110,290,.8)}${drone(330,240,.6)}
    </g>
    <rect x="22" y="70" width="346" height="470" rx="18" fill="none" stroke="#c88f6e" stroke-width="12"/><rect x="190" y="70" width="10" height="470" fill="#c88f6e"/>
    <path d="M10 60 h370" stroke="#a7745a" stroke-width="10" stroke-linecap="round"/>
    <path d="M30 64 Q60 140 40 220 L22 220 L22 64Z" fill="#ff9b8a" opacity=".9"/><path d="M360 64 Q330 140 350 220 L368 220 L368 64Z" fill="#ff9b8a" opacity=".9"/>
    <rect x="0" y="540" width="390" height="304" fill="url(#floor)"/><rect x="0" y="540" width="390" height="14" fill="#b07a5f"/>
    <rect width="390" height="844" fill="url(#lightG)"/>
    <g transform="translate(330 500)"><rect x="-22" y="0" width="44" height="40" rx="8" fill="#5b7bd5"/><path d="M0 0 Q-30 -40 -14 -70 M0 0 Q6 -60 26 -64 M0 0 Q-4 -30 -36 -30 M0 0 Q20 -30 40 -18" stroke="#2f9466" stroke-width="7" fill="none" stroke-linecap="round"/><ellipse cx="-14" cy="-72" rx="10" ry="6" fill="#38b07f"/><ellipse cx="26" cy="-66" rx="10" ry="6" fill="#38b07f"/></g>
    <g transform="translate(60 520)"><rect x="-16" y="0" width="32" height="20" rx="6" fill="#ffd45c"/><path d="M0 0 Q-10 -26 4 -40 M0 0 Q12 -22 22 -26" stroke="#2f9466" stroke-width="6" fill="none" stroke-linecap="round"/></g>
    <rect x="70" y="640" width="250" height="20" rx="10" fill="#8a5a43"/><rect x="88" y="660" width="14" height="140" fill="#7a4d39"/><rect x="288" y="660" width="14" height="140" fill="#7a4d39"/>
    <g transform="translate(118 612)"><rect x="0" y="0" width="54" height="28" rx="5" fill="#fff"/><rect x="5" y="5" width="44" height="18" rx="3" fill="#bfe3ff"/><path d="M8 18 l10 -8 l8 5 l12 -9" stroke="#6c5ce7" stroke-width="2" fill="none"/></g>
    <g transform="translate(240 616)"><path d="M0 0 h28 v18 a8 8 0 0 1 -8 8 h-12 a8 8 0 0 1 -8 -8z" fill="#fff"/><path d="M28 6 a6 6 0 0 1 0 12" stroke="#fff" stroke-width="4" fill="none"/><g class="steam"><path d="M8 -4 q-4 -8 2 -14 M18 -4 q-4 -8 2 -14" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".8"/></g></g>
  </svg>`,
  street:()=>`<svg class="scene" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice"><defs>${grad('skyS',[[0,'#79b8ff'],[.6,'#cfe8ff'],[1,'#f2f8ff']])}${grad('glassG',[[0,'#b9d8ff'],[1,'#6f8fd0']],false)}${grad('road',[[0,'#b7bdd1'],[1,'#9aa2bb']])}${grad('brick1',[[0,'#d58a69'],[1,'#b8694c']])}${grad('brick2',[[0,'#c97c60'],[1,'#a65a40']])}</defs>
    <rect width="390" height="844" fill="url(#skyS)"/>${cloud(70,120,1,.9,'cloud',80)}${cloud(300,80,.8,.8,'cloud slow',100)}
    ${skylineFar(330,'#c3cdee')}${skylineMid(380,false)}
    ${gondola(0,240,390,200,false)}${drone(80,170,.9)}${drone(300,220,.7)}${bird(200,120,1,.2)}${bird(218,112,.8,.5)}
    ${[0,1,2,3,4].map(i=>{const x=-14+i*82,top=360+(i%2)*14,fill=i%2?'url(#brick1)':'url(#brick2)';return `<g><rect x="${x}" y="${top}" width="80" height="${620-top}" fill="${fill}"/><rect x="${x}" y="${top-8}" width="80" height="10" fill="#6e3627"/>
      ${i==1||i==3?`<path d="M${x} ${top-8} h80 v-30 h-80z" fill="#3f8f74"/><g>${[0,1,2,3].map(k=>`<rect x="${x+6+k*19}" y="${top-34}" width="15" height="22" fill="#2d3c78" stroke="#fff" stroke-width=".8" transform="skewX(-12)"/>`).join('')}</g>`:`<path d="M${x+4} ${top-8} q36 -44 72 0z" fill="#38b07f"/><circle cx="${x+22}" cy="${top-22}" r="6" fill="#ff9bb0"/><circle cx="${x+52}" cy="${top-26}" r="7" fill="#ffd45c"/>`}
      <path d="M${x+40} ${top+20} v${560-top}" stroke="#000" stroke-opacity=".06" stroke-width="40"/>
      ${[0,1,2,3,4].map(r=>`<rect x="${x+12}" y="${top+22+r*44}" width="22" height="30" rx="3" fill="#bfe1f5"/><rect x="${x+46}" y="${top+22+r*44}" width="22" height="30" rx="3" fill="#bfe1f5"/><path d="M${x+12} ${top+22+r*44} h22 l-4 8 h-14z M${x+46} ${top+22+r*44} h22 l-4 8 h-14z" fill="#fff" opacity=".45"/>`).join('')}
      <rect x="${x+28}" y="${600}" width="24" height="20" fill="#6e3627"/><rect x="${x+20}" y="${614}" width="40" height="6" fill="#d9dde8"/></g>`}).join('')}
    <rect x="0" y="620" width="390" height="40" fill="#e3e6ef"/><rect x="0" y="618" width="390" height="5" fill="#cfd4e2"/>
    <rect x="0" y="660" width="390" height="184" fill="url(#road)"/>${[0,1,2,3,4].map(i=>`<rect x="${i*90+10}" y="748" width="50" height="6" rx="3" fill="#fff" opacity=".8"/>`).join('')}
    <path d="M0 690 h390" stroke="#7c86a6" stroke-width="3"/>
    ${[40,200,350].map(x=>`<g><rect x="${x-2}" y="540" width="4" height="82" fill="#3a4060"/><rect x="${x-12}" y="532" width="24" height="10" rx="4" fill="#3a4060"/><rect x="${x-10}" y="528" width="20" height="5" rx="2" fill="#2b3466"/><rect x="${x-9}" y="527" width="18" height="2" fill="#7ff7e4"/></g>`).join('')}
    ${tree(118,590,1.5)}${tree(282,592,1.4)}
    <g class="tram"><g transform="translate(0 666)"><rect x="0" y="0" width="190" height="62" rx="22" fill="#fff" stroke="#d5dae6" stroke-width="2"/><rect x="14" y="10" width="162" height="22" rx="8" fill="#9fd0f0"/>${[0,1,2,3].map(k=>`<circle cx="${30+k*40}" cy="21" r="5" fill="#ffd7c2"/>`).join('')}<rect x="0" y="40" width="190" height="7" fill="#16b3a6"/><rect x="80" y="-6" width="30" height="6" rx="3" fill="#cfd4e2"/></g></g>
    ${robotBot(320,640,1.3,'#16b3a6')}<g class="robo-walk">${robotBot(60,646,1.1,'#f5b82e')}<rect x="44" y="620" width="34" height="8" rx="3" fill="#8a94a6"/></g>
    <g class="ped">${mini(250,640,{skin:SKIN[4],shirt:'#ff7a6b',hair:'#1b1410',s:1.5})}</g><g class="ped slow">${mini(150,646,{skin:SKIN[0],shirt:'#6c5ce7',hair:'#c9772d',s:1.4})}</g>
  </svg>`,
  hospital:()=>`<svg class="scene" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice"><defs>${grad('atrium',[[0,'#d8f3f5'],[1,'#f4fbfb']])}${grad('glassG',[[0,'#b9d8ff'],[1,'#6f8fd0']],false)}${grad('harbor',[[0,'#bfe6ff'],[.55,'#e2f4ff'],[.56,'#7fc0e8'],[1,'#5aa7da']])}${grad('riverG',[[0,'#8fc8ee'],[1,'#5aa7da']])}
     <radialGradient id="haloG"><stop offset="0" stop-color="#7ff7e4" stop-opacity=".9"/><stop offset="1" stop-color="#16b3a6" stop-opacity="0"/></radialGradient>
     <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
    <rect width="390" height="844" fill="url(#atrium)"/>
    <clipPath id="winHo"><rect x="16" y="90" width="358" height="420" rx="14"/></clipPath>
    <g clip-path="url(#winHo)"><rect x="16" y="90" width="358" height="420" rx="14" fill="url(#harbor)"/>${cloud(90,160,.9,.9,'cloud',80)}${cloud(280,140,.7,.8,'cloud slow',95)}
    <g transform="translate(0 -40)">${skylineFar(380,'#c6d7f0')}${skylineMid(360,false)}</g>${river(320,190,false)}${sailboat(120,380,1.1)}${sailboat(290,420,.8)}
    <g class="ferry"><g transform="translate(0 440)"><path d="M0 0 h70 l-8 12 h-56z" fill="#fff"/><rect x="12" y="-12" width="44" height="12" rx="4" fill="#fff"/><rect x="16" y="-9" width="36" height="5" fill="#16b3a6"/></g></g></g>
    ${[16,135,255,374].map(x=>`<rect x="${x-5}" y="86" width="10" height="428" fill="#ffffff"/>`).join('')}<path d="M10 90 h370" stroke="#fff" stroke-width="10"/><path d="M10 312 h370" stroke="#fff" stroke-width="6"/>
    ${[60,190,320].map((x,i)=>`<path class="beam" style="animation-delay:${i*1.3}s" d="M${x-30} 90 L${x+30} 90 L${x+80} 640 L${x-60} 640Z" fill="url(#beam)"/>`).join('')}
    <rect x="0" y="512" width="390" height="332" fill="#e9f4f3"/><rect x="0" y="512" width="390" height="10" fill="#cfe5e3"/>
    ${[0,1,2,3,4,5].map(i=>`<path d="M${-40+i*90} 844 L${150+i*20} 522" stroke="#d6e9e7" stroke-width="2"/>`).join('')}
    <g transform="translate(195 600)"><ellipse cx="0" cy="40" rx="120" ry="18" fill="#cfe5e3"/><g class="halo-orb"><circle cx="0" cy="-120" r="70" fill="url(#haloG)"/><circle cx="0" cy="-120" r="30" fill="none" stroke="#16b3a6" stroke-width="3" opacity=".8"/><ellipse cx="0" cy="-120" rx="48" ry="14" fill="none" stroke="#7ff7e4" stroke-width="2" class="ring"/><circle cx="0" cy="-120" r="10" fill="#fff"/></g>
     <rect x="-90" y="0" width="180" height="36" rx="12" fill="#fff" stroke="#cfe0e6"/><text x="0" y="24" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="15" font-weight="600" fill="#16b3a6">Boston Harbor Hospital</text></g>
    ${[[40,520],[350,520]].map(([x,y])=>`<g transform="translate(${x} ${y})"><rect x="-18" y="60" width="36" height="40" rx="8" fill="#fff"/>${tree(0,30,1.6)}</g>`).join('')}
    <g class="robo-walk">${robotBot(90,700,1.3,'#ff7a9a')}</g><g class="robo-walk rev">${robotBot(300,730,1.1,'#16b3a6')}</g>
  </svg>`,
  workbench:()=>`<svg class="scene" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice"><defs>${grad('wb',[[0,'#e6ecfb'],[1,'#d7def5']])}<radialGradient id="lamp" cx=".8" cy="0" r="1"><stop offset="0" stop-color="#fff6d6" stop-opacity=".9"/><stop offset="1" stop-color="#fff6d6" stop-opacity="0"/></radialGradient></defs>
    <rect width="390" height="844" fill="url(#wb)"/><rect width="390" height="844" fill="url(#lamp)"/>
    ${[0,1,2,3,4,5,6,7,8].map(i=>`<circle cx="${(hash(i)*390).toFixed(0)}" cy="${(hash(i+9)*844).toFixed(0)}" r="${(2+hash(i+4)*4).toFixed(1)}" fill="#6c5ce7" opacity=".08" class="float" style="animation-delay:${i*.6}s"/>`).join('')}
    <g opacity=".5">${[0,1,2,3,4,5,6,7,8,9,10,11,12].map(i=>`<path d="M0 ${i*70} H390" stroke="#c9d1ee" stroke-width="1"/>`).join('')}${[0,1,2,3,4,5,6].map(i=>`<path d="M${i*65} 0 V844" stroke="#c9d1ee" stroke-width="1"/>`).join('')}</g></svg>`,
  table:()=>`<svg class="scene" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice"><defs><radialGradient id="tg" cx=".5" cy=".45" r=".75"><stop offset="0" stop-color="#2f3f86"/><stop offset=".6" stop-color="#1a2150"/><stop offset="1" stop-color="#0e1230"/></radialGradient>
     <radialGradient id="holo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#5ee6d6" stop-opacity=".35"/><stop offset="1" stop-color="#5ee6d6" stop-opacity="0"/></radialGradient></defs>
    <rect width="390" height="844" fill="url(#tg)"/>
    <g opacity=".35">${[0,1,2,3,4,5,6,7,8,9,10,11].map(i=>`<path d="M195 520 L${-400+i*108} 844" stroke="#5ee6d6" stroke-width="1"/>`).join('')}${[0,1,2,3,4,5].map(i=>`<path d="M0 ${560+i*i*12} H390" stroke="#5ee6d6" stroke-width="${.6+i*.2}"/>`).join('')}</g>
    <ellipse cx="195" cy="520" rx="260" ry="90" fill="url(#holo)"/>
    ${[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17].map(i=>`<circle class="particle" style="animation-delay:${(hash(i)*5).toFixed(1)}s;--rise:${(-120-hash(i+2)*200).toFixed(0)}px" cx="${(hash(i+5)*390).toFixed(0)}" cy="${(560+hash(i+7)*260).toFixed(0)}" r="${(1+hash(i+1)*2).toFixed(1)}" fill="#7ff7e4"/>`).join('')}</svg>`,
  night:()=>`<svg class="scene" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice"><defs>${grad('nsky',[[0,'#0d1236'],[.55,'#28306e'],[.8,'#4b3f86']])}${grad('riverG',[[0,'#2a3470'],[1,'#141a40']])}<linearGradient id="moonPath" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3c4" stop-opacity=".7"/><stop offset="1" stop-color="#fff3c4" stop-opacity="0"/></linearGradient><radialGradient id="moonG"><stop offset="0" stop-color="#fff8dc"/><stop offset=".3" stop-color="#fff3c4" stop-opacity=".6"/><stop offset="1" stop-color="#fff3c4" stop-opacity="0"/></radialGradient></defs>
    <rect width="390" height="844" fill="url(#nsky)"/>
    ${[...Array(40)].map((_,i)=>`<circle class="twinkle" style="animation-delay:${(hash(i)*5).toFixed(1)}s" cx="${(hash(i+1)*390).toFixed(0)}" cy="${(hash(i+2)*380).toFixed(0)}" r="${(.6+hash(i+3)*1.4).toFixed(1)}" fill="#fff"/>`).join('')}
    <circle cx="300" cy="140" r="70" fill="url(#moonG)"/><circle cx="300" cy="140" r="20" fill="#fff8dc"/>
    ${skylineFar(470,'#232b62')}${skylineMid(520,true)}${zakim(300,528,true)}${gondola(0,400,390,360,true)}
    ${river(520,324,true)}
    ${[0,1,2,3,4,5,6,7,8,9].map(i=>`<rect x="${(30+hash(i+11)*330).toFixed(0)}" y="${(540+hash(i+12)*120).toFixed(0)}" width="${(2+hash(i)*3).toFixed(1)}" height="${(10+hash(i+3)*30).toFixed(0)}" fill="#ffd36b" opacity=".55" rx="1.5" class="twinkle" style="animation-delay:${i*.5}s"/>`).join('')}<rect x="270" y="530" width="60" height="200" fill="url(#moonPath)" opacity=".5"/>
    <g class="drone"><circle cx="90" cy="300" r="2.4" fill="#ff7a6b" class="twinkle"/></g><g class="drone"><circle cx="220" cy="260" r="2.4" fill="#7ff7e4" class="twinkle"/></g>
  </svg>`
};
// ---------- Future vignettes (mini cards on the Future Table) ----------
// kind: 'recital' (plays violin on stage), 'healed' (good, no recital), 'crooked' (needs re-set), 'rash' (skin reaction), 'waiting'
function vignette(kind){
  const girl=(face,extra='')=>`<g transform="translate(60 52)">${mini(0,0,{skin:SKIN[2],shirt:PAL.coral,hair:'#2b1a10',face,s:1.25})}${extra}</g>`;
  const bg={recital:'#ffe7a8',healed:'#cdeedd',crooked:'#ffd3cc',rash:'#ffd3cc',waiting:'#dfe4f3',moved:'#e2dcff'}[kind]||'#eee';
  let art='';
  if(kind==='recital'||kind==='moved')art=`<rect x="0" y="70" width="120" height="20" fill="#9a6b4f"/>${[18,102].map(x=>`<path d="M${x} 0 L${x} 70" stroke="${PAL.coral}" stroke-width="8"/>`).join('')}${girl('happy',`<g transform="translate(10 4) rotate(-30)"><ellipse cx="0" cy="0" rx="5" ry="9" fill="#a0522d"/><path d="M0 -9 V-20" stroke="#5a2d10" stroke-width="2"/></g>`)}${kind==='moved'?`<text x="96" y="20" font-size="15">📅</text>`:''}<g class="vnote"><text x="14" y="22" font-size="14" fill="#6c5ce7">&#9834;</text></g><g class="vnote d2"><text x="28" y="30" font-size="11" fill="#ff7a6b">&#9835;</text></g>`;
  if(kind==='healed')art=`${girl('happy')}<path class="vpop" d="M86 24 l6 6 l12 -14" stroke="${PAL.leafD}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  if(kind==='crooked')art=`${girl('sad')}<path d="M84 18 l18 18 M102 18 l-18 18" stroke="#d3452f" stroke-width="5" stroke-linecap="round"/>`;
  if(kind==='rash')art=`${girl('sad')}${[[52,58],[58,64],[66,56],[62,70]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2.6" fill="#e5484d" class="vblink"/>`).join('')}<text x="88" y="30" font-size="16" fill="#e5484d" font-weight="800">!</text>`;
  if(kind==='waiting')art=`${girl()}<rect x="84" y="14" width="22" height="26" rx="3" fill="#fff" stroke="${PAL.steel}"/><path d="M88 22 h14 M88 28 h14 M88 34 h9" stroke="${PAL.steel}" stroke-width="2"/>`;
  return `<svg viewBox="0 0 120 90" class="vig"><rect width="120" height="90" rx="10" fill="${bg}"/>${art}</svg>`;
}
