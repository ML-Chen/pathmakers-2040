// viz/ledger.js — pictures for the Ledger's news stories (src/ledger.js): one looping picture per sentence, VIZ.lg_<name>.
// Pictures are 300 wide. lgPic() gives a rounded, clipped scene with a sky-to-ground gradient; animations are CSS classes in src/css/ledger.css.
const LGC={ink:'#1f2340',soft:'#8a90b0',line:'#dfe3f3',sky:'#cfe8ff',sky2:'#f2f8ff',sea:'#78c0e6',sea2:'#3f8fc6',grass:'#9ad48c',grass2:'#62b26f',sand:'#f2d9a6',
  night:'#1e2450',night2:'#3a4282',teal:'#16b3a6',violet:'#6c5ce7',coral:'#ff7a6b',gold:'#f5b82e',red:'#e5484d',green:'#1fa774',brick:'#c8664f',stone:'#b7b2a8',
  paper:'#fffaf0',space:'#141a3a',mars:'#e08a5a',moon:'#d8d6e2'};
// a rounded scene: h = height, bg = [top, bottom] gradient colours (or null for none), inner = SVG
function lgPic(h,bg,inner,label){const id=igId('lgc'),gid=igId('lgg');
  return igFrame(300,h,`<defs><clipPath id="${id}"><rect width="300" height="${h}" rx="12"/></clipPath>${bg?`<linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></linearGradient>`:''}</defs>
    <g clip-path="url(#${id})">${bg?`<rect width="300" height="${h}" fill="url(#${gid})"/>`:''}${inner}</g>`,label)}
// a small person with feet on the ground line gy (mini() anchors its feet 34·s below y)
function lgP(x,gy,o={}){const s=o.s||.9;return mini(x,gy-34*s,{...o,s})}
function lgGround(y,col,col2,h=200){return `<path d="M0 ${y} Q75 ${y-4} 150 ${y} T300 ${y} V${y+h} H0Z" fill="${col}"/>${col2?`<path d="M0 ${y+8} Q90 ${y+3} 180 ${y+9} T300 ${y+7} V${y+h} H0Z" fill="${col2}" opacity=".55"/>`:''}`}
function lgSun(x,y,r,col='#ffd45c'){return `<circle cx="${x}" cy="${y}" r="${r*1.8}" fill="${col}" opacity=".25"/><circle cx="${x}" cy="${y}" r="${r}" fill="${col}"/>`}
function lgCloud(x,y,s=1,op=.95,cls='lg-drift'){return `<g class="${cls}"><g transform="translate(${x} ${y}) scale(${s})" opacity="${op}"><path d="M-26 6 C-30 -4 -18 -10 -10 -6 C-8 -16 8 -18 12 -8 C20 -12 30 -4 26 6Z" fill="#fff"/></g></g>`}
function lgWaves(y,col='#fff',op=.6){return `<g class="lg-wave" opacity="${op}"><path d="M0 ${y} q10 -4 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" stroke="${col}" stroke-width="1.6" fill="none"/></g>`}
function lgBldg(x,base,w,h,col,o={}){let win='';const cols=Math.max(1,Math.round(w/12)),rows=Math.max(1,Math.round(h/14));
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const lit=o.lit!=null?((r*7+c*3+x)%5<o.lit*5):false;win+=`<rect x="${(x+4+c*(w-8)/cols+1).toFixed(1)}" y="${(base-h+5+r*(h-8)/rows).toFixed(1)}" width="${((w-8)/cols-3).toFixed(1)}" height="${((h-8)/rows-5).toFixed(1)}" rx="1" fill="${lit?'#ffe08a':(o.win||'#dbe8f6')}"/>`}
  return `<rect x="${x}" y="${base-h}" width="${w}" height="${h}" rx="2" fill="${col}"/>${o.roof?`<path d="M${x-2} ${base-h} L${x+w/2} ${base-h-o.roof} L${x+w+2} ${base-h}Z" fill="${o.roofCol||'#5b4a6a'}"/>`:''}${win}`}
function lgClock(x,y,r,hh=3,mm=0,o={}){const a=(hh%12+mm/60)*30,b=mm*6,P=(d,l)=>`${(x+l*Math.sin(d*Math.PI/180)).toFixed(1)} ${(y-l*Math.cos(d*Math.PI/180)).toFixed(1)}`;
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${o.face||'#fff'}" stroke="${o.rim||LGC.ink}" stroke-width="${r/7}"/>${[0,90,180,270].map(d=>`<circle cx="${(x+r*.74*Math.sin(d*Math.PI/180)).toFixed(1)}" cy="${(y-r*.74*Math.cos(d*Math.PI/180)).toFixed(1)}" r="${r/12}" fill="${o.rim||LGC.ink}"/>`).join('')}
    <path d="M${x} ${y} L${P(a,r*.48)}" stroke="${o.hand||LGC.ink}" stroke-width="${r/8}" stroke-linecap="round"/><g class="${o.spin?'lg-spin':''}" style="transform-origin:${x}px ${y}px"><path d="M${x} ${y} L${P(b,r*.72)}" stroke="${o.hand||LGC.ink}" stroke-width="${r/12}" stroke-linecap="round"/></g><circle cx="${x}" cy="${y}" r="${r/9}" fill="${o.hand||LGC.ink}"/>`}
function lgGerm(x,y,r,col='#7cc46a',cls=''){let sp='';for(let i=0;i<8;i++){const a=i*Math.PI/4,c=Math.cos(a),s=Math.sin(a);sp+=`<path d="M${(x+c*r*.9).toFixed(1)} ${(y+s*r*.9).toFixed(1)} L${(x+c*r*1.45).toFixed(1)} ${(y+s*r*1.45).toFixed(1)}" stroke="${col}" stroke-width="${r*.22}" stroke-linecap="round"/><circle cx="${(x+c*r*1.5).toFixed(1)}" cy="${(y+s*r*1.5).toFixed(1)}" r="${r*.2}" fill="${col}"/>`}
  return `<g class="${cls}">${sp}<circle cx="${x}" cy="${y}" r="${r}" fill="${col}"/><circle cx="${x-r*.3}" cy="${y-r*.25}" r="${r*.18}" fill="#fff" opacity=".5"/><path d="M${x-r*.35} ${y+r*.25} q${r*.35} ${-r*.25} ${r*.7} 0" stroke="#2f5a28" stroke-width="${r*.12}" fill="none" stroke-linecap="round"/></g>`}
function lgDoc(x,y,w,h,o={}){const n=o.lines||4;let L='';for(let i=0;i<n;i++)L+=`<path d="M${x+8} ${y+14+i*((h-22)/n)} h${(w-16)*(i===n-1?.6:1)}" stroke="${o.lineCol||'#c9cfe2'}" stroke-width="3" stroke-linecap="round"/>`;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${o.fill||'#fff'}" stroke="${o.stroke||'#c9cfe2'}" stroke-width="1.5"/>${o.head?`<rect x="${x}" y="${y}" width="${w}" height="9" rx="4" fill="${o.head}"/>`:''}${L}`}
function lgSeal(x,y,r,signed=true){return signed?`<g transform="translate(${x} ${y}) scale(${r/12})"><path d="M0 -12l2.4 1.8 3-.2.9 2.9 2.5 1.6-.9 2.9.9 2.9-2.5 1.6-.9 2.9-3-.2L0 10l-2.4-1.8-3 .2-.9-2.9-2.5-1.6.9-2.9-.9-2.9 2.5-1.6.9-2.9 3 .2z" fill="${LGC.green}"/><path d="M-4 -.5l2.7 2.6L4 -3.2" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`
  :`<g transform="translate(${x} ${y}) scale(${r/12})"><circle r="9.4" fill="none" stroke="#a7a29a" stroke-width="2" stroke-dasharray="3.2 2.4"/><path d="M-3.4 -3.4l6.8 6.8M3.4 -3.4l-6.8 6.8" stroke="#a7a29a" stroke-width="2.2" stroke-linecap="round"/></g>`}
function lgNote(x,y,s=1,col=LGC.violet,cls='lg-rise',d=0){return `<g class="${cls}" style="--d:${d}s"><g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 V-14 l9 -3 V-3" stroke="${col}" stroke-width="2" fill="none"/><ellipse cx="-2.6" cy="0" rx="3.4" ry="2.6" fill="${col}"/><ellipse cx="6.4" cy="-3" rx="3.4" ry="2.6" fill="${col}"/></g></g>`}
function lgHeart(x,y,s=1,col='#ff6f8f',cls='lg-rise',d=0){return `<g class="${cls}" style="--d:${d}s"><path transform="translate(${x} ${y}) scale(${s})" d="M0 4 C-8 -2 -6 -9 0 -5 C6 -9 8 -2 0 4Z" fill="${col}"/></g>`}
function lgBubble(x,y,w,h,text,o={}){const tx=o.tail==='right'?x+w-14:x+14;return `<g class="${o.cls||''}" style="--d:${o.d||0}s"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${Math.min(12,h/2)}" fill="${o.fill||'#fff'}" stroke="${o.stroke||'#d9def0'}" stroke-width="1.4"/><path d="M${tx-5} ${y+h-1} L${tx+(o.tail==='right'?6:-6)} ${y+h+9} L${tx+6} ${y+h-1}Z" fill="${o.fill||'#fff'}"/>${igT(x+w/2,y+h/2+4,text,{s:o.s||10.5,c:o.c||LGC.ink})}</g>`}
function lgTram(x,y,s,col,label){return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-40 -8 C-40 -20 -32 -26 -20 -26 H24 C36 -26 42 -18 42 -8 V10 H-40Z" fill="${col}"/><rect x="-34" y="-20" width="70" height="14" rx="4" fill="#dff3ff"/>${[-24,-6,12,28].map(c=>`<path d="M${c} -20 v14" stroke="${col}" stroke-width="2"/>`).join('')}<rect x="-40" y="2" width="82" height="4" fill="#fff" opacity=".6"/><circle cx="-24" cy="12" r="4.5" fill="#3a3f5c"/><circle cx="26" cy="12" r="4.5" fill="#3a3f5c"/>
  <path d="M-4 -26 L2 -34 L8 -26" stroke="#3a3f5c" stroke-width="1.6" fill="none"/>${label?`<rect x="-14" y="-4" width="20" height="10" rx="2" fill="#fff"/>${igT(-4,4,label,{s:8,w:800,c:col})}`:''}</g>`}
function lgRobot(x,gy,s=.8,stripe=LGC.teal){return robotBot(x,gy-30*s,s,stripe)}
function lgEarth(x,y,r){const id=igId('lge');return `<defs><clipPath id="${id}"><circle cx="${x}" cy="${y}" r="${r}"/></clipPath></defs><circle cx="${x}" cy="${y}" r="${r+3}" fill="#9fd3ff" opacity=".35"/><circle cx="${x}" cy="${y}" r="${r}" fill="#3f8fc6"/>
  <g clip-path="url(#${id})" fill="#6cc46a"><path d="M${x-r*.7} ${y-r*.5} c${r*.3} ${-r*.3} ${r*.6} ${-r*.1} ${r*.5} ${r*.2} c${-r*.1} ${r*.3} ${-r*.5} ${r*.2} ${-r*.6} ${r*.5} c${-r*.2} ${-r*.2} ${-r*.1} ${-r*.5} ${r*.1} ${-r*.7}z"/><path d="M${x+r*.1} ${y+r*.1} c${r*.4} ${-r*.2} ${r*.7} ${r*.1} ${r*.6} ${r*.4} c${-r*.2} ${r*.3} ${-r*.5} ${r*.4} ${-r*.7} ${r*.2}z"/><ellipse cx="${x-r*.2}" cy="${y+r*.85}" rx="${r*.6}" ry="${r*.25}" fill="#fff"/></g>
  <path d="M${x-r*.6} ${y-r*.75} q${r*.3} ${-r*.15} ${r*.6} 0" stroke="#fff" stroke-width="${r*.08}" fill="none" opacity=".6" stroke-linecap="round"/>`}
function lgStars(n,h,seed=3,col='#fff'){let o='';for(let i=0;i<n;i++){const x=(i*73+seed*37)%300,y=(i*41+seed*17)%h;o+=`<circle cx="${x}" cy="${y}" r="${(i%3?0.8:1.4)}" fill="${col}" opacity="${i%4?0.6:0.95}" class="${i%5?'':'lg-fade'}" style="--d:${(i%7)*.4}s"/>`}return o}
function lgFlag(x,y,c1,c2,s=1){return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 V30" stroke="#6a6f8a" stroke-width="1.6"/><g class="lg-swing" style="transform-origin:0 2px"><path d="M0 2 h18 q-3 5 0 10 h-18z" fill="${c1}"/><path d="M0 7 h18" stroke="${c2}" stroke-width="2.4"/></g></g>`}
function lgMoonBase(x,gy,s=1){return `<g transform="translate(${x} ${gy}) scale(${s})"><path d="M-34 0 a34 30 0 0 1 68 0z" fill="#eef1f8" stroke="#b9c1d9" stroke-width="1.6"/><path d="M-22 -18 a26 20 0 0 1 22 -9" stroke="#fff" stroke-width="3" fill="none" opacity=".8"/><rect x="-6" y="-12" width="12" height="12" rx="2" fill="#ffe08a"/>${[-24,18].map(c=>`<circle cx="${c}" cy="-10" r="3.4" fill="#ffe08a"/>`).join('')}<rect x="34" y="-10" width="20" height="10" rx="3" fill="#dfe4f3" stroke="#b9c1d9"/></g>`}
function lgDome(x,gy,s=1,glow='#ffe08a'){return `<g transform="translate(${x} ${gy}) scale(${s})"><path d="M-30 0 a30 26 0 0 1 60 0z" fill="#dff3ff" fill-opacity=".75" stroke="#b9c1d9" stroke-width="1.6"/><path d="M-30 0 a30 26 0 0 1 60 0" fill="none" stroke="#fff" stroke-width="2" opacity=".6"/>${[-14,0,14].map(c=>`<path d="M${c} 0 q${c*.3} -14 0 ${-24+Math.abs(c)*.3}" stroke="#b9c1d9" stroke-width=".8" fill="none"/>`).join('')}<rect x="-8" y="-9" width="16" height="9" rx="2" fill="${glow}"/></g>`}
function lgMammoth(x,gy,s=1,o={}){const fur=o.fur||'#9a6a48',dk=o.dark||'#6e4a32',lt=o.light||'#c0916a',f=o.flip?' scale(-1 1)':'';
  return `<g transform="translate(${x} ${gy}) scale(${s})${f}"><ellipse cx="0" cy="1" rx="30" ry="3.4" fill="rgba(0,0,0,.14)"/>
    <path d="M-20 -6 v6 h7 v-7 M8 -6 v6 h7 v-7" fill="${dk}" stroke="${dk}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M-28 -16 C-30 -32 -18 -42 -2 -42 C10 -42 18 -38 22 -30 C26 -24 24 -12 18 -8 C8 -4 -10 -4 -20 -6 C-25 -7 -28 -10 -28 -16Z" fill="${fur}"/>
    <path d="M-14 -6 v6 h7 v-7 M14 -6 v6 h7 v-7" fill="${fur}" stroke="${fur}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M-24 -30 c4 -6 12 -9 18 -8 M-18 -22 c6 -3 12 -3 16 -1" stroke="${lt}" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M14 -40 C22 -48 36 -44 36 -32 C36 -26 34 -22 32 -18 C33 -10 36 -4 32 0 C30 2 27 0 28 -3 C30 -8 28 -12 24 -16 C20 -20 12 -24 12 -32 C12 -36 13 -38 14 -40Z" fill="${fur}"/>
    <path d="M18 -46 C20 -52 28 -52 30 -46" fill="${dk}"/><ellipse cx="18" cy="-32" rx="5" ry="7" fill="${dk}"/>
    <path d="M28 -22 C34 -20 40 -24 40 -30" stroke="#fff8ea" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <circle cx="28" cy="-34" r="1.9" fill="#2a1a12"/><circle cx="28.6" cy="-34.6" r=".6" fill="#fff"/></g>`}
function lgGoose(x,y,s=1,d=0){return `<g class="lg-bob" style="--d:${d}s"><g transform="translate(${x} ${y}) scale(${s})"><path d="M-10 0 C-4 -2 4 -2 8 0 C10 1 14 0 16 -2 l2 1 -2 2 C12 3 6 4 0 3Z" fill="#5a5f74"/><path d="M-2 0 L-8 -9 L2 -1Z" fill="#7a8098"/><path d="M14 -2 l4 -1" stroke="#2a2f40" stroke-width="1.2"/></g></g>`}
function lgWhale(x,y,s=1,col='#5f7fa8',o={}){const f=o.flip?' scale(-1 1)':'';return `<g transform="translate(${x} ${y}) scale(${s})${f}">
    <path d="M-44 -2 C-50 -6 -56 -12 -60 -10 C-58 -4 -56 0 -60 6 C-54 8 -48 4 -44 2Z" fill="${col}"/>
    <path d="M-46 0 C-40 -8 -20 -12 0 -14 C14 -15 26 -15 32 -12 C38 -9 38 8 32 12 C20 16 0 14 -18 10 C-32 7 -42 4 -46 0Z" fill="${col}"/>
    <path d="M-30 6 C-14 11 10 12 30 9" stroke="#fff" stroke-width="2" opacity=".35" fill="none"/>
    <path d="M-6 8 C-4 14 2 16 6 14 C4 12 2 10 -6 8Z" fill="${col}"/><circle cx="24" cy="-2" r="1.6" fill="#1f2340"/><path d="M28 10 C24 12 18 12 14 11" stroke="#1f2340" stroke-width="1" fill="none" opacity=".5"/></g>`}
function lgCoin(x,y,r=6){return `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffd45c" stroke="#c9961a" stroke-width="1.4"/><path d="M${x} ${y-r*.5} v${r}" stroke="#c9961a" stroke-width="1.2"/>`}
function lgPhone(x,y,w,h,inner='',o={}){return `<g transform="translate(${x} ${y})"><rect x="0" y="0" width="${w}" height="${h}" rx="${w*.14}" fill="${o.body||'#2a2f4a'}"/><rect x="${w*.07}" y="${h*.07}" width="${w*.86}" height="${h*.86}" rx="${w*.08}" fill="${o.screen||'#dff3ff'}"/>${inner}</g>`}
function lgBadge(x,y,text,col=LGC.green,o={}){const w=o.w||text.length*6.4+16;return `<g class="${o.cls||''}" style="--d:${o.d||0}s"><rect x="${x-w/2}" y="${y-10}" width="${w}" height="20" rx="10" fill="${col}"/>${igT(x,y+4,text,{s:o.s||10.5,c:'#fff',w:800})}</g>`}
function lgArrow(x1,y1,x2,y2,col=LGC.soft,cls='lg-dash'){const a=Math.atan2(y2-y1,x2-x1),h=6;return `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${col}" stroke-width="2.2" class="${cls}"/><path d="M${x2} ${y2} L${(x2-h*Math.cos(a-.5)).toFixed(1)} ${(y2-h*Math.sin(a-.5)).toFixed(1)} M${x2} ${y2} L${(x2-h*Math.cos(a+.5)).toFixed(1)} ${(y2-h*Math.sin(a+.5)).toFixed(1)}" stroke="${col}" stroke-width="2.2" stroke-linecap="round"/>`}
function lgViolin(x,y,s=1,rot=0){return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M0 -9 C-4 -9 -5 -6 -3.5 -4 C-5 -2 -5 2 -3 4 C-5 6 -4 10 0 10 C4 10 5 6 3 4 C5 2 5 -2 3.5 -4 C5 -6 4 -9 0 -9Z" fill="#b5652e"/><path d="M0 -9 V-20" stroke="#5a2e12" stroke-width="1.6"/><circle cx="0" cy="-21" r="1.4" fill="#5a2e12"/></g>`}
function lgTrumpet(x,y,s=1){return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-10 0 H6 M-10 -3 H2" stroke="#e8b830" stroke-width="2"/><path d="M6 0 L14 -5 V5Z" fill="#f5c842"/><circle cx="-2" cy="-3" r="2" fill="none" stroke="#e8b830" stroke-width="1.4"/></g>`}
function lgCello(x,y,s=1){return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -16 C-6 -16 -8 -11 -6 -7 C-9 -3 -9 3 -6 7 C-9 11 -6 16 0 16 C6 16 9 11 6 7 C9 3 9 -3 6 -7 C8 -11 6 -16 0 -16Z" fill="#9a4a22"/><path d="M0 -16 V-30 M0 16 v6" stroke="#4a2410" stroke-width="2"/><path d="M-1 -4 v10 M1 -4 v10" stroke="#f2d9a6" stroke-width=".6"/></g>`}

Object.assign(VIZ,{
  // ---------- cold spray ----------
  lg_cold1:()=>lgPic(120,['#e6f7f3','#cdeee6'],`
    <g transform="translate(70 80)"><rect x="-16" y="-34" width="32" height="50" rx="10" fill="#7fd6c4" stroke="#2f8f84" stroke-width="2"/><rect x="-16" y="-14" width="32" height="14" fill="#fff" opacity=".85"/><path d="M-7 -7 h14 M0 -13 v12" stroke="${LGC.teal}" stroke-width="3"/>
      <rect x="-8" y="-46" width="16" height="13" rx="3" fill="#fff" stroke="#2f8f84" stroke-width="2"/><path d="M-4 -52 h24 v7 h-24z" fill="#2f8f84"/></g>
    ${[0,1,2,3].map(i=>`<circle cx="${102+i*13}" cy="${36-i%2*4}" r="${4+i*1.6}" fill="#fff" opacity=".85" class="lg-pop" style="--d:${i*.18}s"/>`).join('')}
    ${lgGerm(212,44,11,'#7cc46a','lg-flip')}${lgGerm(246,78,9,'#9bd16a','lg-flip')}${lgGerm(196,92,8,'#7cc46a','lg-flip')}
    <g class="lg-flop">${[[212,44],[246,78],[196,92]].map(([x,y])=>`<path d="M${x-10} ${y} h20 M${x} ${y-10} v20 M${x-7} ${y-7} l14 14 M${x+7} ${y-7} l-14 14" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".9"/>`).join('')}</g>
    ${lgBadge(214,108,'Final trial: passed',LGC.green,{w:130})}`,'A nose spray stopping cold germs'),
  lg_cold2:()=>lgPic(124,null,`${igT(150,15,'30,000 people in the trial',{s:11,c:LGC.soft})}
    ${[...Array(10)].map((_,i)=>`<g class="lg-pop" style="--d:${i*.12}s">${lgP(24+i*28,100,{s:.82,face:i===9?'sad':'happy',shirt:['#ff7a6b','#6c5ce7','#16b3a6','#f5b82e','#5b9bf0','#e86a8a','#38b07f','#c98a2a','#7a6cd0','#9aa3b8'][i],skin:SKIN[i%6]})}</g>`).join('')}
    <g transform="translate(288 76)"><path d="M-5 -4 q5 -4 10 0 v8 q-5 3 -10 0z" fill="#fff" stroke="#c9cfe2"/></g>
    <path d="M10 106 H262" stroke="${LGC.green}" stroke-width="4" stroke-linecap="round" class="lg-growx"/>${igT(136,120,'9 of 10 colds gone within a day',{s:11,c:LGC.green})}`,'Nine of ten people well within a day'),
  lg_cold3:()=>lgPic(120,['#fde9cf','#f6d8b0'],`${lgGround(98,'#d9c3a0','#c4a77f')}
    ${lgBldg(70,98,120,70,'#f4efe6',{win:'#cfe6f5'})}<rect x="70" y="28" width="120" height="14" fill="${LGC.teal}"/>${igT(130,39,'PHARMACY',{s:9.5,c:'#fff',w:800})}
    <g transform="translate(130 70)"><rect x="-12" y="-14" width="24" height="28" rx="2" fill="#bfe8ff" stroke="#fff" stroke-width="2"/></g>
    <g transform="translate(40 30)" class="lg-beat"><rect x="-12" y="-4" width="24" height="8" rx="2" fill="${LGC.green}"/><rect x="-4" y="-12" width="8" height="24" rx="2" fill="${LGC.green}"/></g>
    <g transform="translate(250 98)"><path d="M-3 0 V-36" stroke="#8a5a3a" stroke-width="5"/><circle cx="0" cy="-46" r="20" fill="#e8863a"/><circle cx="-12" cy="-38" r="12" fill="#d2602a"/><circle cx="12" cy="-40" r="13" fill="#f0a040"/></g>
    ${[0,1,2,3].map(i=>`<path transform="translate(${226+i*16} ${30+i*8})" d="M0 0 c4 -4 8 0 4 4 c-4 4 -8 0 -4 -4z" fill="${['#e8863a','#d2602a','#f0a040','#c94a22'][i]}" class="lg-rise" style="--d:${i*.7}s;animation-direction:reverse"/>`).join('')}
    <g class="lg-drift">${lgRobot(196,100,.7,LGC.teal)}<rect x="188" y="62" width="16" height="10" rx="2" fill="#c9a26b" stroke="#7a5426"/></g>
    ${lgBadge(38,106,'By fall',LGC.coral,{w:60})}`,'A pharmacy in fall, with a delivery robot'),
  // ---------- orchestra ----------
  lg_orch1:()=>lgPic(120,['#fff4e0','#ffe6c4'],`<path d="M0 100 H300 V120 H0Z" fill="#e8c9a0"/>
    ${[[34,{skin:SKIN[4],shirt:'#ff7a6b',hair:'#1b1410'},'v'],[78,{skin:SKIN[0],shirt:'#6c5ce7',hair:'#e8e8e8',style:'short'},'c'],[122,{skin:SKIN[2],shirt:'#16b3a6',hair:'#2a1a12',age:'kid'},'t'],[166,{skin:SKIN[1],shirt:'#f5b82e',hair:'#7a4a2a'},'v'],[210,{skin:SKIN[5],shirt:'#5b9bf0',hair:'#1b1410',age:'kid'},'v'],[254,{skin:SKIN[3],shirt:'#e86a8a',hair:'#d8d4dc'},'t']].map(([x,o,k],i)=>
      `<g class="lg-bob" style="--d:${i*.3}s">${lgP(x,102,{...o,s:.95,face:'happy'})}${k==='v'?lgViolin(x+9,70,1.1,-30):k==='c'?lgCello(x+12,82,.9):lgTrumpet(x+12,64,1.1)}</g>`).join('')}
    ${[0,1,2,3,4].map(i=>lgNote(40+i*55,36,1,['#6c5ce7','#ff7a6b','#16b3a6','#f5b82e','#e86a8a'][i],'lg-rise',i*.6)).join('')}
    ${lgBadge(150,14,'300 neighbors',LGC.violet,{w:104})}`,'Neighbors of all ages with instruments'),
  lg_orch2:()=>lgPic(120,['#fff8e8','#f6e3c6'],`<path d="M0 104 H300 V120 H0Z" fill="#c9a37a"/>
    ${[60,150,240].map(x=>`<path d="M${x-22} 70 V34 a22 22 0 0 1 44 0 V70Z" fill="#ffe7a8"/><path d="M${x} 12 V70 M${x-22} 44 H${x+22}" stroke="#d8b46a" stroke-width="2"/>`).join('')}
    <g class="lg-fade" opacity=".5">${[60,150,240].map(x=>`<path d="M${x-18} 70 L${x-40} 104 H${x+30} L${x+18} 70Z" fill="#fff3c0"/>`).join('')}</g>
    ${lgSun(150,6,9,'#ffc533')}
    ${[[48,'#ff7a6b'],[104,'#16b3a6'],[196,'#6c5ce7'],[252,'#f5b82e']].map(([x,c],i)=>`<g class="lg-bob" style="--d:${i*.4}s">${lgP(x,106,{s:.8,shirt:c,face:'happy',skin:SKIN[(i*2)%6]})}${lgViolin(x+8,80,.9,-35)}</g>`).join('')}
    ${lgHeart(130,60,1.2,'#ff6f8f','lg-rise',0)}${lgHeart(170,64,1,'#ff6f8f','lg-rise',1.3)}${lgNote(118,84,.9,'#6c5ce7','lg-rise',.6)}${lgNote(178,88,.9,'#ff7a6b','lg-rise',2)}
    ${igT(150,117,'7:00 AM, every morning',{s:9.5,c:'#7a5a3a'})}`,'Morning practice in a church hall'),
  lg_orch3:()=>lgPic(120,['#bfe3ff','#e6f4ff'],`<rect y="78" width="300" height="42" fill="${LGC.sea}"/>${lgWaves(90)}${lgWaves(104,'#fff',.4)}
    <path d="M0 80 H300 V84 H0Z" fill="#8fc88a"/>
    <g transform="translate(150 78)"><path d="M-46 0 A46 46 0 0 1 46 0Z" fill="#f4efe6"/>${[34,26,18,10].map((r,i)=>`<path d="M${-r} 0 A${r} ${r} 0 0 1 ${r} 0" stroke="#d9cfbf" stroke-width="2" fill="none"/>`).join('')}<path d="M-50 0 H50 V5 H-50Z" fill="#b9ad9a"/></g>
    ${[0,1,2,3,4,5,6,7,8].map(i=>lgP(26+i*10+(i>4?150:0)+(i>4?16:0),80,{s:.42,shirt:['#ff7a6b','#6c5ce7','#16b3a6','#f5b82e','#5b9bf0','#e86a8a','#38b07f','#7a6cd0','#c98a2a'][i]})).join('')}
    ${lgNote(130,40,1,'#6c5ce7','lg-rise',0)}${lgNote(160,36,1,'#ff7a6b','lg-rise',1.2)}${lgNote(180,44,.8,'#16b3a6','lg-rise',2.2)}
    ${lgBadge(42,18,'FREE',LGC.green,{w:46})}<g transform="translate(244 6)"><rect width="44" height="34" rx="5" fill="#fff" stroke="#c9cfe2"/><rect width="44" height="10" rx="4" fill="${LGC.coral}"/>${igT(22,8.5,'JUNE',{s:7.5,c:'#fff',w:800})}${igT(22,28,'14',{s:14})}</g>`,'A free concert at the riverside band shell'),
  // ---------- tram trick ----------
  lg_tram1:()=>lgPic(120,['#eef4ff','#e0e9fb'],`<path d="M0 96 H300" stroke="#9aa3b8" stroke-width="3"/><path d="M0 100 H300" stroke="#c9cfe2" stroke-width="2"/>
    <g class="lg-bob">${lgTram(78,82,1,'#2e9a5a','B')}</g><g class="lg-bob" style="--d:.6s">${lgTram(222,82,1,'#e0773a','P')}</g>
    ${lgClock(78,26,12,9,0,{spin:true})}${lgClock(222,26,12,9,4,{spin:true})}
    ${igT(78,116,'Boston: 97 of 100',{s:11,c:'#2e9a5a'})}${igT(222,116,'Phoenix: 94 of 100',{s:11,c:'#e0773a'})}`,'Boston and Phoenix trams with on-time numbers'),
  lg_tram2:()=>{const X0=56,Y0=104,Y1=14,yv=v=>Y0-(v-90)/10*(Y0-Y1);
    return igFrame(300,124,`<rect x="0" y="0" width="300" height="124" rx="12" fill="#fff"/>
      ${[90,92,94,96,98,100].map(v=>`<path d="M${X0} ${yv(v)} H272" stroke="#e6e9f4" stroke-width="1"/>${igT(X0-8,yv(v)+4,v,{s:10,a:'end',c:LGC.soft})}`).join('')}
      <path d="M${X0} ${Y1-4} V${Y0} H274" stroke="${LGC.ink}" stroke-width="1.6" fill="none"/>
      <rect x="92" y="${yv(97)}" width="58" height="${Y0-yv(97)}" rx="3" fill="#2e9a5a" class="lg-grow"/>${igT(121,yv(97)-5,'97',{s:13,w:800,c:'#2e9a5a'})}
      <rect x="184" y="${yv(94)}" width="58" height="${Y0-yv(94)}" rx="3" fill="#e0773a" class="lg-grow" style="--d:.2s"/>${igT(213,yv(94)-5,'94',{s:13,w:800,c:'#e0773a'})}
      ${igT(121,119,'Boston',{s:11})}${igT(213,119,'Phoenix',{s:11})}`,'A bar chart of trams on time: Boston 97, Phoenix 94, with the axis starting at 90')},
  lg_tram3:()=>lgPic(120,['#fff1d6','#ffe2b8'],`${lgGround(96,'#e8c99a','#d9b07a')}
    <g transform="translate(40 96)"><path d="M0 0 V-40 M0 -26 h-10 v-10 M0 -20 h10 v-12" stroke="#4f9a5a" stroke-width="7" stroke-linecap="round" fill="none"/></g>
    ${lgSun(48,24,12,'#ffc533')}
    <path d="M60 104 H300" stroke="#9aa3b8" stroke-width="3"/>
    <g class="lg-move" style="--from:-20px;--to:40px;animation-duration:5s;animation-direction:alternate">${lgTram(150,92,.9,'#2e9a5a','B')}</g>
    <g transform="translate(262 96)"><path d="M0 0 V-46" stroke="#6a6f8a" stroke-width="3"/><rect x="-26" y="-60" width="46" height="18" rx="4" fill="#2e9a5a"/>${igT(-3,-47,'BOSTON',{s:9,c:'#fff',w:800})}</g>`,'A tram heading to Boston'),
  // ---------- space solar collector ----------
  lg_sun1:()=>lgPic(124,[LGC.space,'#2a3170'],`${lgStars(30,124,4)}${lgEarth(150,250,150)}
    <g transform="translate(150 50)"><rect x="-6" y="-6" width="12" height="12" rx="2" fill="#dfe4f3"/>
      ${[0,60,120,180,240,300].map((a,i)=>`<g transform="rotate(${a})"><g class="lg-pop" style="--d:${i*.15}s"><path d="M8 0 L22 -9 L44 -9 L58 0 L44 9 L22 9Z" fill="#9fd3ff" stroke="#e8f6ff" stroke-width="1.2" opacity=".95"/><path d="M22 -9 L36 0 L22 9 M44 -9 L36 0 L44 9" stroke="#e8f6ff" stroke-width=".8" fill="none"/></g></g>`).join('')}</g>
    ${igT(150,114,'As wide as 6 soccer fields',{s:10.5,c:'#fff'})}`,'A huge mirror unfolding in orbit'),
  lg_sun2:()=>lgPic(124,['#1c2350','#ffcf9a'],`${lgStars(14,50,7)}${lgSun(28,24,12,'#ffd45c')}
    <path d="M38 30 L132 34" stroke="#ffd45c" stroke-width="3" opacity=".7" class="lg-dash"/>
    <g transform="translate(150 34)"><path d="M-22 -8 L22 -8 L28 0 L22 8 L-22 8 L-28 0Z" fill="#9fd3ff" stroke="#fff" stroke-width="1"/></g>
    <path d="M150 44 L150 96" stroke="#ffe08a" stroke-width="6" opacity=".5" class="lg-fade"/><path d="M150 44 L150 96" stroke="#fff6c8" stroke-width="2" class="lg-dash"/>
    ${lgGround(100,'#e8b77a','#d49a5a')}
    <g transform="translate(150 100)">${[-30,-15,0,15,30].map(x=>`<g transform="translate(${x} 0)"><path d="M0 0 V-6" stroke="#6a6f8a" stroke-width="2"/><path d="M-6 -6 a6 4 0 0 0 12 0z" fill="#eef1f8"/></g>`).join('')}</g>
    <g transform="translate(238 100)">${lgBldg(0,0,18,20,'#f4efe6',{lit:.8})}${lgBldg(22,0,14,30,'#e6e0f0',{lit:.7})}</g><path d="M182 104 H236" stroke="#ffd45c" stroke-width="2" class="lg-dash"/>`,'Sunlight beamed down to a desert station'),
  lg_sun3:()=>lgPic(124,[LGC.space,'#262c66'],`${lgStars(26,124,9)}${lgEarth(150,64,28)}
    <path d="M150 64 m-62 0 a62 26 0 1 0 124 0 a62 26 0 1 0 -124 0" stroke="#5a6aa8" stroke-width="1" fill="none" stroke-dasharray="3 4"/>
    <g transform="translate(150 38)"><path d="M-10 -4 L10 -4 L13 0 L10 4 L-10 4 L-13 0Z" fill="#ffe08a" stroke="#fff" stroke-width="1"/></g>${igT(150,26,'1 now',{s:10,c:'#ffe08a'})}
    ${[...Array(20)].map((_,i)=>{const a=i/20*Math.PI*2,x=150+Math.cos(a)*62,y=64+Math.sin(a)*26;return Math.abs(y-38)<6&&Math.abs(x-150)<16?'':`<path transform="translate(${x.toFixed(1)} ${y.toFixed(1)})" d="M-5 -2 L5 -2 L6.5 0 L5 2 L-5 2 L-6.5 0Z" fill="#9fd3ff" class="lg-pop" style="--d:${(i*.12).toFixed(2)}s"/>`}).join('')}
    ${igT(150,116,'20 more if it works for a year',{s:10.5,c:'#cfd6ff'})}`,'One collector now and twenty later around Earth'),
  // ---------- Calder Bay datacenter ----------
  lg_calder1:()=>lgPic(120,[LGC.night,'#2c3570'],`${lgStars(20,60,2)}<rect y="88" width="300" height="32" fill="#22305e"/>${lgWaves(98,'#5a6aa8',.6)}
    <path d="M60 90 L240 90 L236 86 L64 86Z" fill="#3a4282"/><rect x="88" y="48" width="124" height="40" rx="3" fill="#4a5296"/>${[0,1,2,3,4,5].map(i=>`<rect x="${98+i*18}" y="56" width="10" height="24" rx="2" fill="#2a3060"/>`).join('')}
    <path d="M80 70 L220 70" stroke="#f5b82e" stroke-width="7"/><path d="M80 70 L220 70" stroke="#2a2f40" stroke-width="7" stroke-dasharray="10 10"/>
    <g class="lg-pop"><rect x="114" y="32" width="72" height="20" rx="4" fill="${LGC.red}"/>${igT(150,46,'NO LICENSE',{s:10,c:'#fff',w:800})}</g>
    ${lgP(46,92,{s:.8,shirt:'#f5b82e',outfit:'jacket',hair:'#1b1410',skin:SKIN[3]})}${lgP(254,92,{s:.8,shirt:'#f5b82e',outfit:'jacket',hair:'#c9772d',skin:SKIN[0],flip:true})}
    ${igT(150,16,'Calder Bay',{s:10.5,c:'#cfd6ff'})}`,'Inspectors shut down a datacenter with no license'),
  lg_calder2:()=>lgPic(120,['#e9e4f0','#d8d2e4'],`<path d="M0 98 H300 V120 H0Z" fill="#b9b0c8"/>
    <rect x="40" y="24" width="64" height="74" rx="3" fill="#8a7aa8"/><rect x="46" y="30" width="52" height="68" fill="#6a5a88"/><circle cx="90" cy="64" r="3" fill="#ffd45c"/>
    <rect x="44" y="12" width="56" height="10" rx="2" fill="#fff"/>${igT(72,20,'NORTHWIND LLC',{s:6.5,w:800,c:LGC.ink})}
    <rect x="150" y="70" width="90" height="8" rx="2" fill="#a88a6a"/><path d="M158 78 V98 M232 78 V98" stroke="#a88a6a" stroke-width="5"/>
    <path d="M250 10 L250 28 M240 28 a10 6 0 0 0 20 0" stroke="#7a6f8a" stroke-width="1.6" fill="none"/><g class="lg-swing" style="transform-origin:250px 10px"><path d="M250 10 V30" stroke="#7a6f8a" stroke-width="1.2"/><path d="M243 30 h14 l-3 6 h-8z" fill="#cfc7dc"/></g>
    <path d="M150 20 Q170 30 190 22 M160 20 Q170 28 180 18" stroke="#fff" stroke-width="1" fill="none" opacity=".8"/>
    <g class="lg-beat"><circle cx="196" cy="44" r="15" fill="#fff"/>${igT(196,51,'?',{s:20,c:LGC.violet,w:800})}</g>
    <ellipse cx="200" cy="96" rx="9" ry="4" fill="#cfc7dc"/>`,'An empty office with nobody home'),
  lg_calder3:()=>lgPic(120,[LGC.night,'#2c3570'],`${lgStars(18,60,5)}${lgGround(92,'#2a3060','#20264e')}<path d="M0 100 H300" stroke="#4a5296" stroke-width="2" stroke-dasharray="12 10"/>
    <rect x="236" y="56" width="50" height="36" rx="3" fill="#4a5296"/>${[0,1,2].map(i=>`<rect x="${242+i*15}" y="64" width="9" height="20" rx="1" fill="#5ee6d6" class="lg-fade" style="--d:${i*.4}s"/>`).join('')}
    <g class="lg-move" style="--from:-40px;--to:120px;animation-duration:6s"><g transform="translate(30 96)"><rect x="0" y="-30" width="54" height="26" rx="3" fill="#dfe4f3"/><rect x="54" y="-22" width="20" height="18" rx="3" fill="#9aa6c0"/><rect x="60" y="-19" width="10" height="7" rx="1" fill="#bfe8ff"/><circle cx="12" cy="-2" r="5" fill="#2a2f40"/><circle cx="62" cy="-2" r="5" fill="#2a2f40"/>
      <path d="M74 -12 L110 -20 L110 0 Z" fill="#fff6c8" opacity=".35"/><rect x="6" y="-26" width="18" height="16" fill="#c9a26b" stroke="#7a5426"/><rect x="28" y="-26" width="18" height="16" fill="#c9a26b" stroke="#7a5426"/></g></g>
    ${lgPhone(122,10,26,42,`${igT(13,26,'!',{s:16,c:LGC.coral,w:800})}`)}${igT(186,30,'Seen them?',{s:10,c:'#cfd6ff',a:'start'})}`,'A delivery truck driving to the datacenter at night'),
  // ---------- river park vote ----------
  lg_vote1:()=>lgPic(120,['#2a3170','#5a6ab0'],`${lgStars(14,50,8)}<circle cx="262" cy="22" r="10" fill="#fff8dc"/>
    ${skylineFar?`<g opacity=".9" transform="translate(0 -10)">${skylineFar(96,'#3a4590')}</g>`:''}<rect y="86" width="300" height="34" fill="#2a3a7a"/>${lgWaves(98,'#8aa0e8',.5)}
    <g transform="translate(150 80)"><rect x="-26" y="-22" width="52" height="40" rx="4" fill="#fff"/><rect x="-14" y="-24" width="28" height="5" rx="2" fill="${LGC.ink}"/>${igT(0,4,'VOTE',{s:11,w:800,c:LGC.violet})}</g>
    <g class="lg-in"><g transform="translate(150 36)"><rect x="-10" y="-12" width="20" height="24" rx="2" fill="#fff" stroke="#c9cfe2"/><path d="M-5 -2 l3 3 l6 -7" stroke="${LGC.green}" stroke-width="2.2" fill="none"/></g></g>`,'A ballot going into a ballot box at night'),
  lg_vote2:()=>lgPic(120,['#e8f6ec','#d4efdc'],`${lgGround(98,LGC.grass,LGC.grass2)}
    <g transform="translate(16 12)">${[...Array(9)].map((_,i)=>`<rect x="${(i%5)*20}" y="${Math.floor(i/5)*20}" width="17" height="17" rx="3" fill="#fff" stroke="#c9cfe2"/><path class="lg-pop" style="--d:${i*.25}s" d="M${(i%5)*20+4} ${Math.floor(i/5)*20+9} l3 3 l6 -7" stroke="${LGC.green}" stroke-width="2.2" fill="none"/>`).join('')}${igT(48,52,'9 days',{s:11})}</g>
    ${[150,196,242].map((x,i)=>`<g class="lg-pop" style="--d:${.6+i*.5}s">${tree(x,74,.9)}</g>`).join('')}
    <g class="lg-drift">${lgRobot(132,102,.75,LGC.gold)}</g><g class="lg-drift" style="--d:1s">${lgRobot(276,102,.75,LGC.gold)}</g>
    <path d="M120 106 Q200 96 300 104" stroke="#e8d9b0" stroke-width="5" fill="none"/>`,'Robots building a park in nine days'),
  lg_vote3:()=>lgPic(120,['#d6ecff','#eaf5ff'],`<rect y="84" width="300" height="36" fill="${LGC.sea}"/>${lgWaves(96)}<path d="M0 86 H300" stroke="#8fc88a" stroke-width="4"/>
    <g transform="translate(150 84)"><rect x="-44" y="-36" width="88" height="36" fill="#b5703e"/><path d="M-50 -36 L0 -58 L50 -36Z" fill="#7a3a22"/>${[-26,0,26].map(x=>`<path d="M${x-9} 0 V-16 a9 9 0 0 1 18 0 V0Z" fill="#4a2a1a"/>`).join('')}<path d="M-44 -26 H44" stroke="#9a5a30" stroke-width="1.2"/></g>
    ${lgP(46,104,{s:.85,shirt:'#6c5ce7',skin:SKIN[1],hair:'#e8e8e8',style:'bob'})}${lgP(254,104,{s:.85,shirt:'#16b3a6',skin:SKIN[4],flip:true})}
    <g class="lg-flip">${lgBubble(14,8,82,22,'Keep it!',{c:LGC.violet})}</g><g class="lg-flop">${lgBubble(204,8,84,22,'Build new!',{c:LGC.teal,tail:'right'})}</g>`,'Two neighbors disagree about the old boathouse'),
  // ---------- whales ----------
  lg_whale1:()=>lgPic(120,['#2a6aa0','#173d6e'],`${[0,1,2].map(i=>`<path d="M${104+i*14} ${46-i*8} q8 ${14+i*8} 0 ${28+i*16}" stroke="#bfe8ff" stroke-width="2.2" fill="none" class="lg-fade" style="--d:${i*.3}s"/>`).join('')}
    ${lgWhale(60,62,.95,'#5f7fa8')}
    <g transform="translate(196 22)"><rect x="0" y="0" width="80" height="76" rx="6" fill="#fff8e8"/><path d="M40 0 V76" stroke="#e0d2b0" stroke-width="2"/>${[0,1,2,3].map(i=>`<g class="lg-in" style="--d:${i*.5}s"><path d="M8 ${14+i*16} h4 m3 0 h2 m3 0 h6" stroke="#5f7fa8" stroke-width="3" stroke-linecap="round"/><path d="M48 ${14+i*16} h24" stroke="#c9cfe2" stroke-width="3" stroke-linecap="round"/></g>`).join('')}</g>
    ${lgBadge(236,110,'1,000 entries',LGC.violet,{w:96})}`,'A whale clicking, and clicks becoming dictionary entries'),
  lg_whale2:()=>lgPic(120,['#3a86c0','#1d4f86'],`${[0,1,2,3,4].map(i=>`<path d="M${30+i*60} 0 L${50+i*60} 120" stroke="#fff" stroke-width="10" opacity=".06"/>`).join('')}
    ${lgWhale(120,64,1,'#5f7fa8')}<g class="lg-drift">${lgWhale(214,80,.5,'#7f9fc8')}</g>
    ${lgBubble(176,12,112,24,'come here, little one',{s:9.5,tail:'left'})}${lgHeart(178,58,1,'#ffb0c8','lg-rise',.4)}
    ${[0,1,2].map(i=>`<circle cx="${70+i*20}" cy="${30-i*6}" r="${2+i}" fill="#bfe8ff" opacity=".6" class="lg-rise" style="--d:${i*.8}s"/>`).join('')}`,'A mother whale calling to her calf'),
  lg_whale3:()=>lgPic(124,null,`${[['come here, little one',82,LGC.green],['food is below us',64,LGC.gold],['(not sure yet)',31,LGC.coral]].map(([m,v,c],i)=>`<g transform="translate(8 ${8+i*38})"><rect width="284" height="32" rx="8" fill="#fff" stroke="#e1e5f2"/>
      <path d="M10 16 h4 m4 0 h2 m4 0 h6 m4 0 h2" stroke="#5f7fa8" stroke-width="3.4" stroke-linecap="round"/>${igT(52,20,m,{s:10.5,a:'start'})}
      <rect x="182" y="11" width="70" height="10" rx="5" fill="#eef1f8"/><rect x="182" y="11" width="${v*.7}" height="10" rx="5" fill="${c}" class="lg-growx" style="--d:${i*.3}s"/>${igT(272,20,v+'%',{s:10.5,w:800,c})}</g>`).join('')}`,'Dictionary entries, each with a confidence number'),
  // ---------- the Dark Tower ----------
  lg_dt1:()=>lgPic(124,['#ffd9a8','#bfe0f0'],`${lgSun(250,30,14,'#fff0b0')}<rect y="86" width="300" height="38" fill="#5f9fc8"/>${lgWaves(98,'#fff',.5)}
    <path d="M60 124 L70 70 Q120 58 190 64 L210 124Z" fill="#7a8a6a"/><path d="M70 72 Q120 60 190 66 L192 74 Q130 66 72 80Z" fill="#9ac07a"/>
    <g transform="translate(140 66)"><path d="M-16 0 L-12 -54 L12 -54 L16 0Z" fill="#8a8f9e"/><rect x="-18" y="-64" width="36" height="12" rx="2" fill="#6f7484"/>${[-40,-30,-20].map(y=>`<rect x="-8" y="${y}" width="16" height="5" rx="1" fill="#3a3f52"/>`).join('')}
      <path d="M-14 -2 C-10 -16 -16 -30 -10 -44 C-8 -50 -12 -56 -8 -62 M10 -4 C14 -20 6 -32 12 -46" stroke="#4f9a5a" stroke-width="3" fill="none" stroke-linecap="round"/>${[[-12,-20],[-11,-38],[11,-24],[12,-40],[-8,-60]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3" fill="#6cc46a"/>`).join('')}</g>
    ${[0,1,2,3].map(i=>`<g class="lg-drift" style="--d:${i*.8}s">${bird(100+i*22,20+i%2*10,1,i*.3)}</g>`).join('')}
    ${lgBadge(56,20,'Open again',LGC.green,{w:84})}`,'The Dark Tower on its headland'),
  lg_dt2:()=>lgPic(124,['#1e2450','#2c3570'],`<path d="M70 96 C50 80 60 50 92 40 C120 30 170 26 206 38 C240 48 250 74 232 92 C210 108 160 104 130 108 C104 110 84 106 70 96Z" fill="#3a4a6a" stroke="#5a6a9a" stroke-width="1.6"/>
    ${[[100,60],[124,50],[150,74],[176,48],[200,66],[214,84],[118,88],[160,92],[188,80],[96,80]].map(([x,y],i)=>`<g class="lg-flip" style="--d:${i*.08}s"><circle cx="${x}" cy="${y}" r="5" fill="#ffd45c" opacity=".35"/><circle cx="${x}" cy="${y}" r="2.4" fill="#ffe08a"/></g>`).join('')}
    ${igT(150,18,'Estmark',{s:11,c:'#cfd6ff'})}
    <g transform="translate(28 112)">${[...Array(7)].map((_,i)=>`<rect x="${i*36}" y="-6" width="30" height="10" rx="3" fill="#2a3060"/>${igT(i*36+15,2,'Day '+(i+1),{s:6.8,c:'#8a96d0'})}`).join('')}</g>`,'An island map whose lights go out for seven days'),
  lg_dt3:()=>lgPic(124,['#cfe8f6','#eaf5ff'],`<rect x="70" y="0" width="160" height="124" fill="#9aa0ac"/>${[30,70,110].map(y=>`<rect x="66" y="${y}" width="168" height="8" fill="#7a808e"/>`).join('')}
    <path d="M80 0 C90 30 74 60 86 124 M210 0 C200 40 218 80 204 124" stroke="#4f9a5a" stroke-width="4" fill="none"/>${[[84,20],[80,50],[88,90],[206,30],[212,70],[204,104]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="5" fill="#6cc46a"/>`).join('')}
    ${[[110,30],[170,30],[140,70],[190,110],[100,110]].map(([x,y],i)=>`<g class="lg-bob" style="--d:${i*.4}s"><path d="M${x-12} ${y} q12 6 24 0 q-2 -6 -12 -6 q-10 0 -12 6z" fill="#c9a26b" stroke="#8a6a3a"/><g transform="translate(${x} ${y-8})"><ellipse cx="0" cy="0" rx="6" ry="5" fill="#fff"/><circle cx="3" cy="-3" r="3.4" fill="#fff"/><path d="M6 -3 l4 1 l-4 1z" fill="#f5b82e"/><circle cx="4" cy="-4" r=".9" fill="#1f2340"/><path d="M-6 -1 q-3 -2 -5 0" stroke="#9aa3b8" stroke-width="2" fill="none"/></g></g>`).join('')}
    ${[0,1,2].map(i=>`<g class="lg-drift" style="--d:${i}s">${bird(30+i*110+(i>1?40:0),18+i*14,1.3,i*.5)}</g>`).join('')}`,'Seabird nests on the tower ledges')
});
