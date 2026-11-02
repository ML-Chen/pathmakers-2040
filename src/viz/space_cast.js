// viz/space_cast.js — outfits and AI faces for the Moon (rimshop) and Mars (duststorm) casts.
// spacePerson(castEntry, mood): personSVG plus a space-base outfit chosen by o.space:
//   'suit'   a soft pressure suit with a hard metal neck ring, shoulder patch and chest panel (o.shirt = suit colour,
//            o.trim = stripe colour, o.patch = patch colour)
//   'jumper' a base jumpsuit with a zip, pockets and rolled sleeves (o.shirt, o.trim)
// Extras: o.badge (a brass treaty monitor badge), o.scarf (colour), o.leafpin (a tomato-leaf pin), o.helmet (a clear
// bubble helmet drawn over the head). The outfit is drawn inside the body group, from just below the chin, so the neck
// always meets the collar (no gap between chin, neck and collar).
// tillArt(mood) and deltaArt(mood): the Moon shop's AI clerk and the Mars outpost's AI, drawn in the portrait box.
let SC_N=0;
function scFix(v){return Math.round(v*10)/10}
function spaceOutfit(o){const id='sco'+(++SC_N),kid=o.age==='kid',masc=o.masc!=null?!!o.masc:(['short','bald'].includes(o.hairStyle)&&!kid);
  const build=kid?'K':masc?'M':'F',G=(typeof CH_FACE!=='undefined'&&CH_FACE[build])||{chin:191,nw:19},nb=G.chin+(kid?22:20);
  const col=o.shirt||'#eef0f4',P=typeof ch_clothPal==='function'?ch_clothPal(col):{base:col,sh:'#9aa0b0',sh2:'#7a8090',hi:'#ffffff',line:'#2a2a40'};
  const trim=o.trim||'#e0684a',T=typeof ch_clothPal==='function'?ch_clothPal(trim):{base:trim,sh:trim,line:'#2a1010'};
  const W=kid?.84:masc?1.08:1,cx=150,X=dx=>scFix(cx+dx*W),top=nb-6;
  const torso=`M${X(-34)} ${top} C${X(-62)} ${top+4} ${X(-98)} ${top+12} ${X(-112)} ${top+30} C${X(-124)} ${top+46} ${X(-128)} ${top+70} ${X(-130)} 372 L${X(130)} 372 C${X(128)} ${top+70} ${X(124)} ${top+46} ${X(112)} ${top+30} C${X(98)} ${top+12} ${X(62)} ${top+4} ${X(34)} ${top}Z`;
  let s=`<clipPath id="${id}t"><path d="${torso}"/></clipPath><path d="${torso}" fill="${P.base}" stroke="${P.line}" stroke-width="2.8" stroke-linejoin="round"/>
    <g clip-path="url(#${id}t)"><path d="M${X(70)} ${top+8} C${X(110)} ${top+20} ${X(126)} ${top+48} ${X(128)} 372 L${X(150)} 372 L${X(150)} ${top}Z" fill="${P.sh}"/>
      <path d="M${X(-100)} ${top+18} C${X(-114)} ${top+30} ${X(-122)} ${top+46} ${X(-124)} ${top+66} C${X(-112)} ${top+48} ${X(-100)} ${top+38} ${X(-84)} ${top+32}Z" fill="${P.hi}" opacity=".7"/>`;
  if(o.space==='suit'){
    // seams, a coloured stripe down each arm, a chest panel with lights and a hose port
    s+=`<path d="M${X(-96)} ${top+22} C${X(-104)} ${top+70} ${X(-104)} ${top+120} ${X(-100)} 372 M${X(96)} ${top+22} C${X(104)} ${top+70} ${X(104)} ${top+120} ${X(100)} 372" stroke="${T.base}" stroke-width="9" fill="none"/>
      <path d="M${X(-60)} ${top+40} C${X(-50)} ${top+80} ${X(-52)} ${top+120} ${X(-56)} 372 M${X(60)} ${top+40} C${X(50)} ${top+80} ${X(52)} ${top+120} ${X(56)} 372" stroke="${P.line}" stroke-width="1.4" fill="none" opacity=".35"/>
      <rect x="${X(-30)}" y="${top+52}" width="${scFix(60*W)}" height="40" rx="8" fill="${P.sh2||P.sh}" stroke="${P.line}" stroke-width="2"/>
      <rect x="${X(-24)}" y="${top+58}" width="${scFix(30*W)}" height="14" rx="3" fill="#10203a"/><path d="M${X(-21)} ${top+66} l5 -4 l5 3 l6 -5 l6 2" stroke="#7ff7e4" stroke-width="1.6" fill="none"/>
      <circle cx="${X(16)}" cy="${top+63}" r="3.6" fill="#7ff7e4"/><circle cx="${X(16)}" cy="${top+79}" r="3.6" fill="${T.base}"/><circle cx="${X(-14)}" cy="${top+82}" r="3" fill="#ffd45c"/>
      <circle cx="${X(-74)}" cy="${top+86}" r="9" fill="#c8ccd8" stroke="${P.line}" stroke-width="2"/><circle cx="${X(-74)}" cy="${top+86}" r="4" fill="#6a7080"/>
      <path d="M${X(66)} ${top+42} l26 4 l-2 24 l-26 -4Z" fill="${o.patch||'#2f6fb8'}" stroke="${P.line}" stroke-width="1.6"/><circle cx="${X(78)}" cy="${top+57}" r="5" fill="none" stroke="#fff" stroke-width="1.6"/>`;
  }else{
    // jumpsuit: a zip, collar points, chest pockets, a name tape
    s+=`<path d="M${X(0)} ${top+4} L${X(0)} 372" stroke="${P.line}" stroke-width="2" opacity=".6"/><path d="M${X(-3)} ${top+30} h6" stroke="#c8ccd8" stroke-width="3"/>
      <path d="M${X(-58)} ${top+48} h38 v30 h-38Z M${X(20)} ${top+48} h38 v30 h-38Z" fill="${P.sh}" stroke="${P.line}" stroke-width="1.6"/><path d="M${X(-58)} ${top+56} h38 M${X(20)} ${top+56} h38" stroke="${P.line}" stroke-width="1.2" opacity=".6"/>
      <rect x="${X(22)}" y="${top+36}" width="${scFix(30*W)}" height="8" rx="2" fill="${T.base}"/>
      <path d="M${X(-102)} ${top+92} C${X(-90)} ${top+98} ${X(-70)} ${top+98} ${X(-58)} ${top+92}" stroke="${P.line}" stroke-width="1.4" fill="none" opacity=".5"/>`;
  }
  s+=`</g>`;
  // the collar: a hard metal neck ring for a suit, a soft stand-up collar for a jumpsuit
  const nw=(G.nw||19)*(kid?1:1)+(masc?3:0);
  if(o.space==='suit'){const ry=11,rx=nw+20;
    s+=`<path d="M${cx-rx} ${nb-2} C${cx-rx} ${nb+ry+6} ${cx+rx} ${nb+ry+6} ${cx+rx} ${nb-2} L${cx+rx-4} ${nb-9} C${cx+rx-6} ${nb+3} ${cx-rx+6} ${nb+3} ${cx-rx+4} ${nb-9}Z" fill="#c8ccd8" stroke="#3a3e52" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M${cx-rx+6} ${nb+2} C${cx-rx+14} ${nb+10} ${cx-10} ${nb+12} ${cx} ${nb+12}" stroke="#ffffff" stroke-width="2.4" fill="none" opacity=".8"/>
      <path d="M${cx+rx-8} ${nb+2} C${cx+rx-14} ${nb+9} ${cx+20} ${nb+12} ${cx+6} ${nb+12}" stroke="#7a8094" stroke-width="2.4" fill="none"/>
      <rect x="${cx-4}" y="${nb+9}" width="8" height="5" rx="1.5" fill="${T.base}" stroke="#3a3e52" stroke-width="1.2"/>`}
  else{s+=`<path d="M${cx-nw-10} ${nb-8} C${cx-nw-4} ${nb+10} ${cx-8} ${nb+16} ${cx} ${nb+18} L${cx-nw+4} ${nb+22} C${cx-nw-14} ${nb+16} ${cx-nw-18} ${nb+4} ${cx-nw-16} ${nb-6}Z" fill="${P.base}" stroke="${P.line}" stroke-width="2"/>
      <path d="M${cx+nw+10} ${nb-8} C${cx+nw+4} ${nb+10} ${cx+8} ${nb+16} ${cx} ${nb+18} L${cx+nw-4} ${nb+22} C${cx+nw+14} ${nb+16} ${cx+nw+18} ${nb+4} ${cx+nw+16} ${nb-6}Z" fill="${P.sh}" stroke="${P.line}" stroke-width="2"/>`}
  if(o.scarf){const C=o.scarf,D=typeof ch_mix==='function'?ch_mix(C,'#1a0c20',.35):C;
    s+=`<path d="M${cx-nw-14} ${nb-6} C${cx-nw-10} ${nb+16} ${cx+nw+10} ${nb+16} ${cx+nw+14} ${nb-6} C${cx+nw+16} ${nb+4} ${cx+nw+10} ${nb+24} ${cx} ${nb+26} C${cx-nw-10} ${nb+24} ${cx-nw-16} ${nb+4} ${cx-nw-14} ${nb-6}Z" fill="${C}" stroke="${D}" stroke-width="2"/>
      <path d="M${cx+14} ${nb+18} C${cx+22} ${nb+40} ${cx+18} ${nb+70} ${cx+26} ${nb+96} L${cx+44} ${nb+92} C${cx+36} ${nb+66} ${cx+38} ${nb+40} ${cx+30} ${nb+14}Z" fill="${C}" stroke="${D}" stroke-width="2"/>
      ${[0,1,2,3].map(k=>`<path d="M${cx+18+k*0.5} ${nb+34+k*16} l16 -3" stroke="${D}" stroke-width="1.4" opacity=".6"/>`).join('')}`}
  if(o.badge)s+=`<g transform="translate(${X(-62)} ${top+40})"><path d="M0 -12 L11 -6 L11 6 L0 12 L-11 6 L-11 -6Z" fill="#d4a85a" stroke="#6a4a1a" stroke-width="1.8"/><path d="M-5 0 h10 M0 -5 v10" stroke="#6a4a1a" stroke-width="1.8"/><circle r="2" fill="#fff4d0"/></g>`;
  if(o.leafpin)s+=`<g transform="translate(${X(-46)} ${top+30}) rotate(-20)"><path d="M0 0 C-10 -6 -12 -16 -6 -22 C-2 -14 4 -10 0 0Z" fill="#3fa05a" stroke="#1a4a2a" stroke-width="1.4"/><path d="M0 0 C8 -4 12 -12 10 -20 C4 -14 -2 -10 0 0Z" fill="#4cb868" stroke="#1a4a2a" stroke-width="1.4"/><circle cx="2" cy="4" r="5.4" fill="#e0483a" stroke="#7a1a14" stroke-width="1.4"/><circle cx="0" cy="2" r="1.6" fill="#fff" opacity=".7"/></g>`;
  if(o.sticker)s+=`<g transform="translate(${X(62)} ${top+44}) rotate(8)"><rect x="-14" y="-10" width="28" height="20" rx="4" fill="#fff" stroke="#3a2a40" stroke-width="1.6"/><path d="M-14 -4 h28 M-14 3 h28" stroke="#18a058" stroke-width="5"/><circle cx="0" cy="-0.5" r="3" fill="#18a058" stroke="#fff" stroke-width="1"/></g>`;
  return s}
function spacePerson(o,mood){const base=personSVG({...o,mood,art:undefined,outfit:'tee',shirt:o.shirt||'#eef0f4'});if(!o.space)return base;
  const i=base.indexOf('<g class="p-head">');if(i<0)return base;const j=base.lastIndexOf('</g>',i);if(j<0)return base;
  let out=base.slice(0,j)+spaceOutfit(o)+base.slice(j);
  if(o.helmet){const k=out.lastIndexOf('</g></g></g>');const kid=o.age==='kid';const cy=kid?116:110;
    const glass=`<g class="sc-helmet"><ellipse cx="150" cy="${cy}" rx="92" ry="98" fill="#bfe8ff" opacity=".12" stroke="#e8f4ff" stroke-width="3" stroke-opacity=".8"/>
      <path d="M86 ${cy-40} C96 ${cy-78} 132 ${cy-96} 168 ${cy-92}" stroke="#fff" stroke-width="7" fill="none" opacity=".6" stroke-linecap="round"/><path d="M84 ${cy-18} C84 ${cy-26} 86 ${cy-32} 88 ${cy-36}" stroke="#fff" stroke-width="5" fill="none" opacity=".5" stroke-linecap="round"/>
      <path d="M226 ${cy+30} C220 ${cy+58} 200 ${cy+78} 176 ${cy+88}" stroke="#7fb0d8" stroke-width="3" fill="none" opacity=".5"/></g>`;
    if(k>0)out=out.slice(0,k)+glass+out.slice(k)}
  return out}
const SC_CAST_ART=o=>typeof spacePerson==='function'?m=>spacePerson(o,m):undefined;

// ---------- Till: the Market Dome's shop AI, a small round clerk robot with a screen face and a brass trim ----------
const SC_EYES={smile:['M-16 -2 Q-10 -10 -4 -2','M4 -2 Q10 -10 16 -2'],happy:['M-16 -2 Q-10 -12 -4 -2','M4 -2 Q10 -12 16 -2'],neutral:['M-16 -4 h12','M4 -4 h12'],
  worried:['M-16 -6 Q-10 0 -4 -2','M4 -2 Q10 0 16 -6'],sad:['M-16 -2 Q-10 2 -4 -6','M4 -6 Q10 2 16 -2'],surprised:null,stern:['M-16 -8 L-4 -4','M4 -4 L16 -8'],think:['M-16 -4 h12','M4 -2 Q10 -10 16 -2']};
function scScreenFace(mood,col){const e=SC_EYES[mood];const eyes=e?e.map(d=>`<path d="${d}" stroke="${col}" stroke-width="4.4" fill="none" stroke-linecap="round"/>`).join(''):`<circle cx="-10" cy="-4" r="5.6" fill="none" stroke="${col}" stroke-width="4"/><circle cx="10" cy="-4" r="5.6" fill="none" stroke="${col}" stroke-width="4"/>`;
  const mouth=mood==='happy'||mood==='smile'?`<path d="M-8 10 Q0 17 8 10" stroke="${col}" stroke-width="3.6" fill="none" stroke-linecap="round"/>`:mood==='surprised'?`<ellipse cx="0" cy="13" rx="4" ry="5" fill="none" stroke="${col}" stroke-width="3.4"/>`:mood==='worried'||mood==='sad'?`<path d="M-7 14 Q0 9 7 14" stroke="${col}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`:`<path d="M-6 12 h12" stroke="${col}" stroke-width="3.4" stroke-linecap="round"/>`;
  return `<g class="p-eyes">${eyes}</g><g class="p-mouth">${mouth}</g>`}
function tillArt(mood){const id='till'+(++SC_N);
  return `<g class="person till"><defs><radialGradient id="${id}b" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#e6e2f0"/><stop offset="1" stop-color="#a8a2c0"/></radialGradient>
      <linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2350"/><stop offset="1" stop-color="#151230"/></linearGradient></defs>
    <ellipse cx="150" cy="352" rx="70" ry="10" fill="rgba(20,16,40,.25)"/>
    <g class="p-body"><path d="M96 352 C92 300 100 262 150 258 C200 262 208 300 204 352Z" fill="url(#${id}b)" stroke="#5a4a8a" stroke-width="3"/>
      <path d="M100 300 C130 290 170 290 200 300" stroke="#d4a85a" stroke-width="6" fill="none"/>
      <rect x="120" y="306" width="60" height="30" rx="7" fill="#fffaf0" stroke="#5a4a8a" stroke-width="2"/><text x="150" y="326" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="800" font-size="15" fill="#5a4a8a">TILL</text>
      <path d="M100 280 C72 286 62 306 70 322" stroke="#5a4a8a" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M100 280 C72 286 62 306 70 322" stroke="#e6e2f0" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M200 280 C228 286 238 306 230 322" stroke="#5a4a8a" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M200 280 C228 286 238 306 230 322" stroke="#e6e2f0" stroke-width="7" fill="none" stroke-linecap="round"/>
      <circle cx="70" cy="324" r="9" fill="#d4a85a" stroke="#5a4a8a" stroke-width="2.4"/><circle cx="230" cy="324" r="9" fill="#d4a85a" stroke="#5a4a8a" stroke-width="2.4"/></g>
    <g class="p-head"><rect x="56" y="60" width="188" height="200" fill="none"/>
      <path d="M150 250 V232" stroke="#5a4a8a" stroke-width="10"/><path d="M150 250 V232" stroke="#c8c2d8" stroke-width="5"/>
      <rect x="78" y="112" width="144" height="124" rx="46" fill="url(#${id}b)" stroke="#5a4a8a" stroke-width="3.4"/>
      <rect x="94" y="128" width="112" height="88" rx="34" fill="url(#${id}s)"/>
      <g transform="translate(150 170) scale(1.3)">${scScreenFace(mood,'#7ff7e4')}</g>
      <ellipse cx="112" cy="140" rx="12" ry="6" fill="#fff" opacity=".18" transform="rotate(-25 112 140)"/>
      <circle cx="104" cy="200" r="5" fill="#ff9aa8" opacity=".55"/><circle cx="196" cy="200" r="5" fill="#ff9aa8" opacity=".55"/>
      <path d="M150 112 V88" stroke="#5a4a8a" stroke-width="3.4"/><circle cx="150" cy="82" r="9" fill="#d4a85a" stroke="#5a4a8a" stroke-width="3"/><circle cx="147" cy="79" r="3" fill="#fff" opacity=".7"/>
      <path d="M78 160 C64 160 60 186 76 190" stroke="#5a4a8a" stroke-width="3" fill="#d4a85a"/><path d="M222 160 C236 160 240 186 224 190" stroke="#5a4a8a" stroke-width="3" fill="#d4a85a"/></g></g>`}

// ---------- Delta: Jezero outpost's AI, a floating lantern-like drone with a wide visor and dust-orange fins ----------
function deltaArt(mood){const id='dlt'+(++SC_N);
  return `<g class="person delta"><defs><linearGradient id="${id}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6f2ec"/><stop offset=".7" stop-color="#d8d0c4"/><stop offset="1" stop-color="#a8988a"/></linearGradient>
      <radialGradient id="${id}g"><stop offset="0" stop-color="#ffb070" stop-opacity=".5"/><stop offset="1" stop-color="#ffb070" stop-opacity="0"/></radialGradient></defs>
    <ellipse cx="150" cy="350" rx="56" ry="8" fill="rgba(60,30,20,.22)"/><circle cx="150" cy="190" r="140" fill="url(#${id}g)"/>
    <g class="p-body sc-float"><path d="M114 290 L150 330 L186 290Z" fill="#c8643a" stroke="#5a2a1a" stroke-width="3" stroke-linejoin="round"/><path d="M150 330 V346" stroke="#5a2a1a" stroke-width="3"/><circle cx="150" cy="348" r="4" fill="#ffd45c"/></g>
    <g class="p-head sc-float"><rect x="56" y="40" width="188" height="260" fill="none"/>
      <path d="M78 150 L40 120 L50 190Z M222 150 L260 120 L250 190Z" fill="#e07a48" stroke="#5a2a1a" stroke-width="3" stroke-linejoin="round"/>
      <path d="M150 64 L226 108 L226 212 L150 256 L74 212 L74 108Z" fill="url(#${id}b)" stroke="#4a3a3a" stroke-width="3.6" stroke-linejoin="round"/>
      <path d="M150 64 L226 108 L150 120 L74 108Z" fill="#fff" opacity=".35"/>
      <rect x="88" y="132" width="124" height="66" rx="30" fill="#1a1420"/><g transform="translate(150 166) scale(1.25)">${scScreenFace(mood,'#ffb070')}</g>
      <path d="M150 64 V44" stroke="#4a3a3a" stroke-width="3"/><circle cx="150" cy="40" r="6" fill="#7ff7e4" stroke="#4a3a3a" stroke-width="2.4"/>
      <path d="M100 222 h100" stroke="#c8643a" stroke-width="5" stroke-linecap="round"/><circle cx="110" cy="236" r="3.4" fill="#7ff7e4"/><circle cx="124" cy="236" r="3.4" fill="#ffd45c"/></g></g>`}
