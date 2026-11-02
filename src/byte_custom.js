// byte_custom.js — Byte's look: tails, eyes and gear that unlocks with progress, Byte's closet and the unlock reveal.
// Loaded right after characters.js and overrides its byteSVG/byteBox (the old copies there are superseded).
// Byte's frame is the same as before: viewBox "14 0 136 150", paws at y≈142, tail base (108,116) = wag origin,
// head pivot (80,88) and eye centre y=57 (both fixed in css/byte_custom.css so gear never moves the pivots).
//
// Save fields (all optional, so old saves keep their Byte): S.byte.tail, S.byte.eyes, S.byte.wear (gear ids worn),
// S.byte.unlocked (gear ids earned), S.byte.opened (gear ids whose reveal the player has seen).
//
// Public API (documented in docs/MISSIONS.md):
//   byteSVG(o), byteBox(o,cls,viewBox)   draw Byte; any look field missing from o comes from S.byte
//   byteAt(x,y,scale,o)                  Byte inside another SVG, paws centred on (x,y)
//   unlockAccessory(id)                  earn a gear item now (the present appears on the next calm screen)
//   byteCheckUnlocks()                   apply every BYTE_GEAR rule and each mission's `unlocks:[ids]`
//   openCloset()                         Byte's closet sheet (Menu → Byte's closet)

const BYTE_DEFAULT={name:'Byte',color:'#f0b35a',ears:'floppy',tail:'fluffy',eyes:'sparkly',voice:'female'};
const BYTE_COLORS=['#f0b35a','#ffffff','#a8743f','#8f86ff','#5fc9bd','#ff9aa8','#9aa3b8'];
const BYTE_STYLES={
  ears:[['floppy','Floppy'],['pointy','Pointy'],['round','Round']],
  tail:[['fluffy','Fluffy'],['curly','Curly'],['stubby','Stubby']],
  eyes:[['sparkly','Sparkly'],['button','Button'],['glow','Glow']]};
const BYTE_SLOTS=['head','neck','body','tag'];

// Gear. `when` is the unlock rule: start, days (missions finished), stars (best stars in one day),
// district + count (missions finished in that place; count:'all' = every mission there), career + count, mission id,
// or a function. A mission can also list gear in `unlocks:[...]`, and story code can call unlockAccessory(id).
const BYTE_GEAR=[
  {id:'bandana',at:[80,120,22],name:'Bandana',slot:'neck',when:{start:true},hint:'Ready from day one',line:'Dashing, right?'},
  {id:'bow',at:[58,21,15],name:'Bow',slot:'head',when:{days:1},hint:'Finish your first day',line:'Do I look cute? I look cute.'},
  {id:'startag',at:[96,112,11],name:'Star tag',slot:'tag',when:{stars:3},hint:'Earn 3 stars in one day',line:'A gold star, for me?'},
  {id:'snorkel',at:[74,20,26],name:'Snorkel',slot:'head',when:{district:'boston',count:2},hint:'Finish 2 days in Boston',line:'Harbor dive, anyone?'},
  {id:'parka',at:[80,118,32],name:'Parka',slot:'body',when:{district:'nome'},hint:'Finish a day in Nome',line:'Toasty enough for Nome!'},
  {id:'vest',at:[80,113,32],name:'Safety vest',slot:'body',when:{district:'phoenix'},hint:'Finish a day in Phoenix',line:'Hard hats on, crews!'},
  {id:'judge',at:[80,112,32],name:'Judge’s collar',slot:'body',also:['neck'],when:{district:'dc'},hint:'Finish a day in Washington',line:'Order in the court! Woof.'},
  {id:'labbadge',at:[97,113,12],name:'Lab badge',slot:'tag',when:{district:'bay'},hint:'Finish a day in the Bay Area',line:'Lab access: granted!'},
  {id:'helmet',at:[80,40,62],name:'Space helmet',slot:'head',when:{district:'moon'},hint:'Finish a day on the Moon',line:'One small step for a puppy!'}];
const byteGear=id=>BYTE_GEAR.find(g=>g.id===id);

// ---------- look: defaults ← S.byte ← o ----------
function byteLook(o){o=o||{};const s=(typeof S!=='undefined'&&S&&S.byte)||{};
  const pick=(k,ok)=>{const v=o[k]!==undefined?o[k]:s[k];return ok?(ok.some(x=>x[0]===v)?v:BYTE_DEFAULT[k]):(v||BYTE_DEFAULT[k])};
  const wear=byteWearFix(Array.isArray(o.wear)?o.wear:Array.isArray(s.wear)?s.wear:[]);
  return {name:pick('name'),color:pick('color'),ears:pick('ears',BYTE_STYLES.ears),tail:pick('tail',BYTE_STYLES.tail),eyes:pick('eyes',BYTE_STYLES.eyes),wear,mood:o.mood||'happy'}}

// the slots an item fills (the judge's robe also fills the neck)
const byteSlotsOf=id=>{const g=byteGear(id);return g?[g.slot,...(g.also||[])]:[]};
// one item per slot: later items win, unknown ids drop out
function byteWearFix(list){const used=new Set(),keep=[];
  for(const id of [...list].reverse()){const sl=byteSlotsOf(id);if(!sl.length||sl.some(x=>used.has(x)))continue;sl.forEach(x=>used.add(x));keep.unshift(id)}return keep}
// two colours too alike to tell apart on a small Byte: near hue and near lightness (greys and whites compare by lightness)
function bc_hsl(c){const [r,g,b]=ch_rgb(c).map(v=>v/255),mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,d=mx-mn;
  if(!d)return [0,0,l];const s=d/(1-Math.abs(2*l-1));const h=mx===r?((g-b)/d+6)%6:mx===g?(b-r)/d+2:(r-g)/d+4;return [h*60,s,l]}
function bc_close(a,b){const A=bc_hsl(a),B=bc_hsl(b);if(Math.abs(A[2]-B[2])>.3)return false;if(A[1]<.2||B[1]<.2)return A[1]<.2&&B[1]<.2;
  const dh=Math.abs(A[0]-B[0]);return Math.min(dh,360-dh)<24}
// gear palette from a base colour (light from the upper left, warm-violet ink like Byte's own)
function bc_pal(c){return {base:c,hi:ch_mix(c,'#ffffff',.42),sh:ch_mix(c,'#3a1a5a',.24),dk:ch_mix(c,'#2a1238',.42),line:ch_mix(c,'#1e1030',.62)}}
// a scalloped edge: bumps of radius ~r bulging to the left of the walking direction along pts
function bc_scallop(pts,r,flip){let d='';for(let i=1;i<pts.length;i++){const [x,y]=pts[i];d+=`A${r} ${r} 0 0 ${flip?0:1} ${ch_n(x)} ${ch_n(y)}`}return d}
// points on a quadratic Bezier
function bc_q(p0,c,p1,n){const o=[];for(let i=0;i<=n;i++){const t=i/n,m=1-t;o.push([m*m*p0[0]+2*m*t*c[0]+t*t*p1[0],m*m*p0[1]+2*m*t*c[1]+t*t*p1[1]])}return o}
// a fur band along a quadratic: thickness th, n tufts on each edge pushed out by k
function bc_furband(p0,c,p1,th,n,k){const P=bc_q(p0,c,p1,n),h=th/2;const top=P.map(([x,y])=>[x,y-h]),bot=P.map(([x,y])=>[x,y+h]).reverse();
  const edge=(pts,s)=>pts.slice(1).map((q,i)=>{const a=pts[i];return `Q${ch_n((a[0]+q[0])/2)} ${ch_n((a[1]+q[1])/2+s*k)} ${ch_n(q[0])} ${ch_n(q[1])}`}).join('');
  const end=(a,b,s)=>`C${ch_n(a[0]+s*3.4)} ${ch_n(a[1])} ${ch_n(b[0]+s*3.4)} ${ch_n(b[1])} ${ch_n(b[0])} ${ch_n(b[1])}`;
  return `M${ch_n(top[0][0])} ${ch_n(top[0][1])}`+edge(top,-1)+end(top.at(-1),bot[0],1)+edge(bot,1)+end(bot.at(-1),top[0],-1)+'Z'}
// a fluffy outline around (cx,cy): n bumps on radius R (rx/ry), each bump pushed out by k
function bc_fluff(cx,cy,rx,ry,n,k,a0){let d='';const P=i=>{const a=(a0||0)+i/n*Math.PI*2;return [cx+Math.cos(a)*rx,cy+Math.sin(a)*ry]};
  for(let i=0;i<=n;i++){const [x,y]=P(i);if(!i){d=`M${ch_n(x)} ${ch_n(y)}`;continue}const a=(a0||0)+(i-.5)/n*Math.PI*2;d+=`Q${ch_n(cx+Math.cos(a)*(rx+k))} ${ch_n(cy+Math.sin(a)*(ry+k))} ${ch_n(x)} ${ch_n(y)}`}return d+'Z'}

// ---------- Byte, a fluffy robot puppy ----------
function byteSVG(o){const K=byteLook(o);
  const id='ch'+(++CH_N),c=K.color,ears=K.ears,mood=K.mood,L=ch_lum(c),W=new Set(K.wear),helmet=W.has('helmet');
  const light=ch_mix(c,'#fffaf2',L>.7?.6:.68),shade=ch_mix(c,'#4a2e6a',L>.7?.2:.26),deep=ch_mix(c,'#2a1640',L>.7?.34:.42),line=ch_mix(c,'#22142e',L>.7?.5:.64),hi=ch_mix(c,'#ffffff',.5);
  const ink='#21182e',[r,g,b]=ch_rgb(c),violet=b>r&&b-g>40,collar=violet?'#ff7a6b':'#6c5ce7',collarD=ch_mix(collar,'#1a0e30',.4);
  const browC=L>.55?ch_mix(c,'#5a3a5a',.42):ch_mix(c,'#fffaf2',.72);
  const OL=(arr,w)=>`<g fill="${line}" stroke="${line}" stroke-width="${w||3.4}" stroke-linejoin="round">${arr.map(d=>`<path d="${d}"/>`).join('')}</g>${arr.map(d=>`<path d="${d}" fill="${c}"/>`).join('')}`;
  const T={id,c,L,light,shade,deep,line,hi,ink,collar,collarD,ears,mood,W};
  // tail (base at 108,116)
  let tailSvg;
  if(K.tail==='curly'){const cp='M104 121 C116 124.6 131 123.4 138.6 113.6 C145 105 142.4 93.4 132.4 90.6 C123.2 88 115.8 94.4 116.6 102.6 C117.4 109.6 125.4 112.4 130 107.6 C132.6 104.8 131.4 100.6 128.4 100';
    tailSvg=`<path d="${cp}" stroke="${line}" stroke-width="15.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <g fill="${c}" stroke="${line}" stroke-width="2" stroke-linejoin="round"><path d="M141.6 100.6 L148.4 101.4 L143 106.6Z"/><path d="M138.4 91.4 L143.6 86 L143 93.6Z"/><path d="M130 87.4 L132.6 81.4 L135.8 88.4Z"/><path d="M134.4 118.4 L140 123.6 L131.4 122.2Z"/></g>
      <path d="${cp}" stroke="${c}" stroke-width="11.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M117 105 C119.4 110.4 126 112 130 107.6 C132.6 104.8 131.4 100.6 128.4 100" stroke="${light}" stroke-width="6.4" fill="none" stroke-linecap="round"/>
      <path d="M108 122.6 C120 123.6 131 120.4 136 113" stroke="${shade}" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".75"/>
      <path d="M126.6 93.2 C121.6 94.4 119.4 98.4 120 102" stroke="${hi}" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".7"/>`}
  else if(K.tail==='stubby'){const pom=bc_fluff(117.5,108.5,9.4,9,9,3.4,-.3);
    tailSvg=`<path d="${pom}" fill="${c}" stroke="${line}" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="${bc_fluff(115.2,105.6,5,4.6,6,2,-.6)}" fill="${light}"/>
      <path d="M110 115 C114 118.6 121 118.4 125.6 113.6" stroke="${shade}" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".7"/>
`}
  else{const tail='M103 125 C114 125 124 119 130 111 L135 113 L134 105 C138 99 140 93 140 87 L145 85 L140 80 C140 74 136 69 130 68 C125 68 121 71 120 76 C123 74 127 75 128.5 79 C130 86 128 96 122 104 C118 110 112 114 104 116Z';
    const tailTip='M140 87 L145 85 L140 80 C140 74 136 69 130 68 C125 68 121 71 120 76 C123 74 127 75 128.5 79 C129.6 84 129.4 90 128 95 C134 94 138 91 140 87Z';
    tailSvg=`<path d="${tail}" fill="${c}" stroke="${line}" stroke-width="2.2" stroke-linejoin="round"/><path d="${tailTip}" fill="${light}"/><path d="M108 121 C117 119 124 113 127 104" stroke="${shade}" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".8"/><path d="M131 100 l3 -1 M134 92 l3 -.5" stroke="${line}" stroke-width="1.3" stroke-linecap="round" opacity=".6"/>`}
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
  // under the helmet the floppy ears tuck in a little and flare less, so they stay inside the glass
  if(ears==='floppy'){const rot=helmet?(alert?8:-4):alert?26:0;
    earSvg=[floppyL,ch_mx(floppyL,80)].map((d,i)=>`<g transform="rotate(${i?-rot:rot} ${i?108:52} 26)"><path d="${d}" fill="${deep}" stroke="${line}" stroke-width="2.2" stroke-linejoin="round"/><path d="${i?ch_mx('M50 30 C40 32 32 44 30 58 C29 68 31 76 34 80',80):'M50 30 C40 32 32 44 30 58 C29 68 31 76 34 80'}" stroke="${hi}" stroke-width="2" fill="none" opacity=".35" stroke-linecap="round"/><path d="${i?ch_mx('M31 84 C29 86 28 88 30 90 M37 86 C37 88 38 90 40 90',80):'M31 84 C29 86 28 88 30 90 M37 86 C37 88 38 90 40 90'}" stroke="${line}" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>`).join('')}
  else if(ears==='pointy'){earSvg=OL(earsBack,3.2)+`<path d="M47 36 C45 26 44 17 45.5 10 C53 13 60 19 64 26Z" fill="#ffb3c4"/><path d="${ch_mx('M47 36 C45 26 44 17 45.5 10 C53 13 60 19 64 26Z',80)}" fill="#ffb3c4"/><path d="M48 34 L52 26 L53 33 L57 27 L58 33Z" fill="${light}"/><path d="${ch_mx('M48 34 L52 26 L53 33 L57 27 L58 33Z',80)}" fill="${light}"/>`}
  else earSvg=OL(earsBack,3.2)+`<circle cx="47" cy="27" r="8.5" fill="#ffb3c4"/><circle cx="113" cy="27" r="8.5" fill="#ffb3c4"/><path d="M41 22 Q46 18 52 20 M107 20 Q113 18 119 22" stroke="#fff" stroke-width="1.6" fill="none" opacity=".6" stroke-linecap="round"/>`;
  // eyes (every style is centred on y=57 so the blink squashes it in place)
  const think=mood==='think',dx=think?-1.6:0,dy=think?-1.8:0;
  const eyeSparkly=x=>{const y=57,rx=alert?10.5:10,ry=alert?12.8:12;
    if(think)return `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${ink}"/><ellipse cx="${x-2.4}" cy="${y-2.2}" rx="6.8" ry="7.8" fill="url(#${id}e)"/><circle cx="${x-4.4}" cy="${y-6.4}" r="3.4" fill="#fff"/><circle cx="${x+1.6}" cy="${y+1.4}" r="1.4" fill="#fff"/><circle cx="${x+3.8}" cy="${y-6}" r="1" fill="#fff"/>`;
    return alert?`<ellipse cx="${x}" cy="${y}" rx="${rx+.5}" ry="${ry+.5}" fill="#fff" stroke="${ink}" stroke-width="2.2"/><ellipse cx="${x}" cy="${y+1}" rx="7" ry="8.6" fill="${ink}"/><ellipse cx="${x}" cy="${y+2.6}" rx="5" ry="5.6" fill="url(#${id}e)"/><circle cx="${x-2.2}" cy="${y-2.4}" r="2.6" fill="#fff"/>`
      :`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${ink}"/><ellipse cx="${x}" cy="${y+2.2}" rx="7.6" ry="8.8" fill="url(#${id}e)"/><ellipse cx="${x}" cy="${y+7.6}" rx="5" ry="2.6" fill="#7ff7e4" opacity=".28"/><ellipse cx="${x-3.4}" cy="${y-4.6}" rx="4" ry="4.6" fill="#fff"/><circle cx="${x+3.8}" cy="${y+4.8}" r="1.8" fill="#fff"/><circle cx="${x+4.4}" cy="${y-5.6}" r="1" fill="#fff"/>${mood==='happy'?ch_star(x-3.4,y-4.6,2.6,'#fff7d0'):''}`};
  // button: glossy plush-toy eyes, one dark bead with a big catchlight and a soft rim light
  const eyeButton=x=>{const y=57;
    if(alert)return `<ellipse cx="${x}" cy="${y}" rx="11" ry="12.6" fill="#fff" stroke="${ink}" stroke-width="2.2"/><ellipse cx="${x}" cy="${y+1.2}" rx="7.6" ry="8.6" fill="url(#${id}b)"/><ellipse cx="${x-2.4}" cy="${y-2}" rx="2.6" ry="3" fill="#fff"/><circle cx="${x+2.6}" cy="${y+4}" r="1.1" fill="#fff" opacity=".9"/>`;
    return `<ellipse cx="${x+dx*.5}" cy="${y+dy*.5}" rx="9.6" ry="10.8" fill="url(#${id}b)"/><path d="M${x-6.6+dx*.5} ${y+4.4+dy*.5} Q${x+dx*.5} ${y+10.4+dy*.5} ${x+6.6+dx*.5} ${y+4.4+dy*.5}" stroke="#a487b4" stroke-width="1.5" fill="none" stroke-linecap="round" opacity=".7"/>
      <ellipse cx="${x-3.2+dx}" cy="${y-3.8+dy}" rx="3.5" ry="4.1" fill="#fff"/><circle cx="${x+3.4+dx}" cy="${y+3.4+dy}" r="1.6" fill="#fff" opacity=".92"/>${mood==='happy'?ch_star(x-3.2,y-3.8,2.4,'#fff7d0'):''}`};
  // glow: a softly lit teal lens with a ring, the one robot hint in Byte's face
  const eyeGlow=x=>{const y=57;
    if(alert)return `<ellipse cx="${x}" cy="${y}" rx="11" ry="13.3" fill="#fff" stroke="${ink}" stroke-width="2.2"/><ellipse cx="${x}" cy="${y+1}" rx="7.2" ry="8.6" fill="${ink}"/><circle cx="${x}" cy="${y+1.6}" r="4.6" fill="url(#${id}g)"/><circle cx="${x}" cy="${y+1.6}" r="1.5" fill="#0c3a44"/><circle cx="${x-2.4}" cy="${y-2.2}" r="2.2" fill="#fff"/>`;
    return `<ellipse cx="${x}" cy="${y}" rx="10" ry="12" fill="${ink}"/><ellipse cx="${x+dx}" cy="${y+1.6+dy}" rx="7.2" ry="8.4" fill="url(#${id}g)"/><ellipse cx="${x+dx}" cy="${y+1.6+dy}" rx="4.4" ry="5.2" fill="none" stroke="#eafffb" stroke-width="1.1" opacity=".75"/><ellipse cx="${x+dx}" cy="${y+1.8+dy}" rx="1.9" ry="2.3" fill="#0c3a44"/>
      <ellipse cx="${x-3.4+dx}" cy="${y-4.4+dy}" rx="3" ry="3.5" fill="#fff"/><circle cx="${x+3.6+dx}" cy="${y+5+dy}" r="1.3" fill="#fff" opacity=".9"/>${mood==='happy'?ch_star(x-3.4,y-4.4,2.2,'#fff7d0'):''}`};
  const eye={button:eyeButton,glow:eyeGlow}[K.eyes]||eyeSparkly;
  const eyeGlowFx=K.eyes==='glow'&&!alert?`<ellipse cx="59" cy="57.6" rx="12.6" ry="14.4" fill="#7ff7e4" opacity=".2"/><ellipse cx="101" cy="57.6" rx="12.6" ry="14.4" fill="#7ff7e4" opacity=".2"/>`:'';
  const brow=(x,y,rot)=>`<ellipse cx="${x}" cy="${y}" rx="4.4" ry="2.7" fill="${browC}" transform="rotate(${rot} ${x} ${y})"/>`;
  const brows=think?brow(59,37,-16)+brow(101,42,8):alert?brow(59,36,-6)+brow(101,36,6):brow(59,40,-8)+brow(101,40,8);
  const mouth={
    happy:`<path d="M70.5 78 Q75.5 81.5 80 77.5 Q84.5 81.5 89.5 78 Q89 91 80 92.4 Q71 91 70.5 78Z" fill="#5a1a30" stroke="${ink}" stroke-width="1.6" stroke-linejoin="round"/><path d="M73.6 86.6 Q80 81.6 86.4 86.6 Q86 93.6 80 94.6 Q74 93.6 73.6 86.6Z" fill="#ff7f9a" stroke="${ink}" stroke-width="1.2"/><path d="M80 86 V91.5" stroke="#e0607e" stroke-width="1.2" stroke-linecap="round"/>`,
    neutral:`<path d="M77.4 80.8 Q80 79.8 82.6 80.8 Q82.8 86 80 86.4 Q77.2 86 77.4 80.8Z" fill="#ff7f9a" stroke="${ink}" stroke-width="1.1"/><path d="M71 78 Q75.5 82.6 80 78.2 Q84.5 82.6 89 78" stroke="${ink}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    think:`<path d="M72 80 Q77 82.5 81 79.5 Q85 77 89 79.2" stroke="${ink}" stroke-width="2.2" fill="none" stroke-linecap="round"/><circle cx="90.5" cy="80.6" r="1.2" fill="${ink}"/>`,
    alert:`<ellipse cx="80" cy="82.4" rx="3.8" ry="4.8" fill="#5a1a30" stroke="${ink}" stroke-width="1.5"/><path d="M77.6 85 Q80 83.2 82.4 85 Q81.6 87 80 87 Q78.4 87 77.6 85Z" fill="#ff7f9a"/>`}[mood]||'';
  // mood effects sit outside the helmet glass when it is on
  const fxAt=(x,y,hx,hy)=>helmet?[hx,hy]:[x,y];
  let fx='';
  if(mood==='happy'){const [ax,ay]=fxAt(28,24,10,8),[bx,by]=fxAt(134,40,150,30);
    fx=ch_star(ax,ay,5.5,'#ffd45c','class="twinkle" stroke="#fff" stroke-width=".8"')+ch_star(bx,by,4,'#ffd45c','class="twinkle" style="animation-delay:-1.4s"')}
  if(think){const [ax,ay]=fxAt(124,22,140,8),[bx,by]=fxAt(132,12,148,-4);
    fx=`<circle cx="${ax}" cy="${ay}" r="3" fill="#fff" stroke="${line}" stroke-width="1.4" class="thinkdot"/><circle cx="${bx}" cy="${by}" r="4.2" fill="#fff" stroke="${line}" stroke-width="1.4" class="thinkdot d2"/>`}
  if(alert){const [ax,ay]=fxAt(128,14,146,4);
    fx=`<g transform="translate(${ax} ${ay}) rotate(12)"><path d="M-3.4 -12 Q0 -14 3.4 -12 L1.8 3 Q0 4.4 -1.8 3Z" fill="#ff7a6b" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/><circle cx="0" cy="8.6" r="2.6" fill="#ff7a6b" stroke="#fff" stroke-width="1.2"/></g><path d="M${ax+9} ${ay+8} l6 -2 M${ax+8} ${ay+16} l6 2" stroke="#ff7a6b" stroke-width="2" stroke-linecap="round"/>`}
  // gear layers
  const G=K.wear.map(w=>BYTE_ART[w]&&BYTE_ART[w](T)||{});
  const lay=k=>G.map(x=>x[k]||'').join('');
  const collarBand=`<path d="M54 95 Q80 108 106 95 L107 102.5 Q80 116 53 102.5Z" fill="${collar}" stroke="${collarD}" stroke-width="1.6" stroke-linejoin="round"/><path d="M56 97.4 Q80 109.4 104 97.4" stroke="#fff" stroke-width="1.3" fill="none" opacity=".45"/>`;
  return `<g class="byte bc-t-${K.tail} bc-e-${K.eyes}${K.wear.map(w=>' bc-g-'+w).join('')}"><defs><linearGradient id="${id}e" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${ink}" stop-opacity="0"/><stop offset=".55" stop-color="#4a3270"/><stop offset="1" stop-color="#9a74e8"/></linearGradient>
    <radialGradient id="${id}t" cx=".4" cy=".35"><stop offset="0" stop-color="#e8fffb"/><stop offset=".55" stop-color="#7ff7e4"/><stop offset="1" stop-color="#20bfae"/></radialGradient>
    ${K.eyes==='button'?`<radialGradient id="${id}b" cx=".42" cy=".36" r=".7"><stop offset="0" stop-color="#6a4a78"/><stop offset=".55" stop-color="#2c1d3a"/><stop offset="1" stop-color="#120b1a"/></radialGradient>`:''}
    ${K.eyes==='glow'?`<radialGradient id="${id}g" cx=".5" cy=".55" r=".6"><stop offset="0" stop-color="#f2fffd"/><stop offset=".4" stop-color="#8ff9e9"/><stop offset=".8" stop-color="#1bb8a8"/><stop offset="1" stop-color="#0f6a73"/></radialGradient>`:''}
    <clipPath id="${id}h"><path d="${head}"/></clipPath>${lay('defs')}</defs>
  <ellipse cx="80" cy="142" rx="46" ry="5.5" fill="rgba(31,35,64,.16)"/>
  <g class="byte-tail" style="transform-origin:108px 116px">${tailSvg}</g>
  <g class="byte-body">
    ${OL(bodyParts,3.4)}
    <path d="M100 96 C110 106 114 122 112 136 Q104 138 98 138 C104 124 104 108 96 98Z" fill="${shade}" opacity=".8"/>
    <path d="M70 136 C72 128 70 118 62 113 C68 116 72 124 70 136Z" fill="${shade}" opacity=".6"/>
    <path d="M104 112 C110 116 114 124 112 134" stroke="${line}" stroke-width="1.6" fill="none" opacity=".6" stroke-linecap="round"/><path d="M56 112 C50 116 46 124 48 134" stroke="${line}" stroke-width="1.6" fill="none" opacity=".6" stroke-linecap="round"/>
    <path d="${bib}" fill="${light}"/>
    <path d="M71 106 l2 4 M88 108 l-2 4 M78 114 l2 3" stroke="${shade}" stroke-width="1.4" stroke-linecap="round" opacity=".7"/>
    ${lay('body')}
    <g fill="${light}" stroke="${line}" stroke-width="2.2"><path d="${pawL}"/><path d="${ch_mx(pawL,80)}"/></g>
    <path d="M63 137 v3.4 M68 137.4 v3.4 M92 137.4 v3.4 M97 137 v3.4" stroke="${line}" stroke-width="1.5" stroke-linecap="round"/>
    ${lay('under')}
    ${helmet?'':collarBand}
    ${lay('neck')}
    ${lay('ring')}
    <circle cx="80" cy="111.6" r="10" fill="#7ff7e4" opacity=".22"/>
    <g class="byte-collar"><circle cx="80" cy="104.6" r="2.2" fill="none" stroke="#d6dcef" stroke-width="1.6"/><path d="M80 105.6 l7.2 4.2 v8.2 l-7.2 4.2 l-7.2 -4.2 v-8.2z" fill="url(#${id}t)" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round"/><path d="M80 109.4 l3.6 2.1 v4 l-3.6 2.1 l-3.6 -2.1 v-4z" fill="none" stroke="#139e90" stroke-width="1.2"/><circle cx="80" cy="113.5" r="1.3" fill="#139e90"/></g>
    ${lay('tag')}
  </g>
  <g class="byte-head">
    ${ears!=='floppy'?`<g class="byte-ears">${earSvg}</g>`:''}
    ${lay('headBack')}
    ${OL(headParts,3.4)}
    <g clip-path="url(#${id}h)"><path d="M118 40 C124 56 122 76 108 88 C100 94 90 96 80 96 L130 100 L130 30Z" fill="${shade}" opacity=".55"/></g>
    <path d="M60 24 Q80 15 100 24 Q94 26.5 80 23.5 Q66 26.5 60 24Z" fill="${hi}" opacity=".75"/>
    <path d="M47 76 C52 86 64 92 80 92 C96 92 108 86 113 76 C106 82 96 84 80 84 C64 84 54 82 47 76Z" fill="${light}" opacity=".9"/>
    <path d="M64 75 C64 66 71 63 80 64.5 C89 63 96 66 96 75 C96 86 89 91 80 91 C71 91 64 86 64 75Z" fill="${light}"/>
    <path d="M77 64.8 C78 56 78.6 48 80 42 C81.4 48 82 56 83 64.8Z" fill="${light}" opacity=".9"/>
    ${brows}${eyeGlowFx}
    <g class="byte-eyes">${eye(59)}${eye(101)}</g>
    <ellipse cx="46" cy="72" rx="6.6" ry="3.8" fill="#ff8fab" opacity="${mood==='happy'?.7:.5}"/><ellipse cx="114" cy="72" rx="6.6" ry="3.8" fill="#ff8fab" opacity="${mood==='happy'?.7:.5}"/>
    <path d="M42.5 73.5 l2.4 -3.4 M46.5 74 l2.4 -3.4 M111 74 l2.4 -3.4 M115 73.5 l2.4 -3.4" stroke="#ff6f92" stroke-width="1.1" stroke-linecap="round" opacity=".6"/>
    <path d="M72.4 69 Q80 64.6 87.6 69 Q87 75.6 80 77 Q73 75.6 72.4 69Z" fill="${ink}"/><ellipse cx="77.4" cy="68.6" rx="2.6" ry="1.4" fill="#fff" opacity=".85"/><path d="M80 77 V79" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>
    ${mouth}
    ${lay('head')}
    ${ears==='floppy'?`<g class="byte-ears">${earSvg}</g>`:''}
    ${lay('headTop')}
    ${fx}
  </g>
  ${lay('top')?`<g class="byte-gear-top">${lay('top')}</g>`:''}
</g>`}
// viewBox override (vb) is for close-up thumbnails; data-live marks a box drawn from the player's own Byte,
// so byteRefresh() can redraw it in place after a change in the closet.
function byteBox(o,cls,vb){o=o||{};const K=byteLook(o);const s=(typeof S!=='undefined'&&S&&S.byte)||{};
  const live=!vb&&['color','ears','tail','eyes'].every(k=>o[k]===undefined||o[k]===byteLook({})[k])&&(o.wear===undefined||o.wear===s.wear);
  return `<svg class="byteart ${cls||''}" viewBox="${vb||'14 0 136 150'}"${live?` data-live="${K.mood}"`:''} aria-label="${esc_b(K.name)}, your robot puppy">${byteSVG(o)}</svg>`}
function esc_b(t){return String(t).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]))}
// Byte inside another SVG (vignettes, scenes): paws centred on (x,y), s=1 is about 140 units tall
function byteAt(x,y,s,o){s=s||1;return `<g transform="translate(${ch_n(x)} ${ch_n(y)}) scale(${s}) translate(-80 -142)">${byteSVG(o)}</g>`}

// ---------- gear art: each returns layers {defs, body, under, neck, tag, headBack, head, headTop, top} ----------
const BYTE_ART={
  // a red cotton kerchief with white dots, tucked under the collar
  bandana(T){const col=bc_close(T.c,'#e8453c')||bc_close(T.collar,'#e8453c')?'#2f9be0':'#e8453c',P=bc_pal(col),id=T.id;
    const d='M51.5 99.5 Q80 115 108.5 99.5 C107 110 96.6 122.6 82.6 131 Q80 132.6 77.4 131 C63.4 122.6 53 110 51.5 99.5Z';
    let dots='';for(const [x,y] of [[60,106],[70,109],[90,109],[100,106],[65,116],[95,116],[74,121],[86,121],[80,128],[80,114],[57,112],[103,112]])dots+=`<circle cx="${x}" cy="${y}" r="1.5"/>`;
    return {defs:`<clipPath id="${id}bd"><path d="${d}"/></clipPath>`,
      under:`<path d="${d}" fill="${P.base}" stroke="${P.line}" stroke-width="1.8" stroke-linejoin="round"/>
        <g clip-path="url(#${id}bd)"><path d="M80 112 C92 112 102 108 110 100 L112 140 L80 140Z" fill="${P.sh}" opacity=".55"/><g fill="#fff" opacity=".92">${dots}</g>
        <path d="M54 103 Q80 117 106 103" stroke="${P.dk}" stroke-width="3" fill="none" opacity=".45"/><path d="M62 112 Q70 120 79 128" stroke="${P.hi}" stroke-width="1.6" fill="none" opacity=".5" stroke-linecap="round"/></g>`}},
  // a judge's black capelet over the shoulders with a broad white lace collar; it fills the neck slot too
  judge(T){const id=T.id,lace='#fffdf6',edge='#8d86a8',robe='#2b2340';
    const rb='M49.4 99 Q80 114 110.6 99 C113.8 105.6 115.2 112.6 114 119.6 C104.4 127.4 92.6 130.6 80 130.6 C67.4 130.6 55.6 127.4 46 119.6 C44.8 112.6 46.2 105.6 49.4 99Z';
    const cb=t=>{const m=1-t;return [m*m*m*46.6+3*m*m*t*41.6+3*m*t*t*118.4+t*t*t*113.4,m*m*m*99.4+3*m*m*t*131+3*m*t*t*131+t*t*t*99.4]};
    const ci=t=>{const m=1-t;return [m*m*m*51+3*m*m*t*47.4+3*m*t*t*112.6+t*t*t*109,m*m*m*101.4+3*m*m*t*124+3*m*t*t*124+t*t*t*101.4]};
    const N=14,out=[];for(let k=0;k<=N;k++)out.push(cb(k/N));
    let holes='',petals='';for(let k=1;k<N;k++){const [x,y]=ci(k/N);holes+=`<circle cx="${ch_n(x)}" cy="${ch_n(y)}" r="1.15"/>`;
      const [a,b]=cb((k-.5)/N),[c2,d2]=ci((k-.5)/N);petals+=`M${ch_n(c2)} ${ch_n(d2)} L${ch_n(a*.45+c2*.55)} ${ch_n(b*.45+d2*.55)}`}
    const laceD=`M${ch_n(out[0][0])} ${ch_n(out[0][1])}`+bc_scallop(out,3.6,true)+' Q80 114.6 46.6 99.4Z';
    return {defs:`<clipPath id="${id}jr"><path d="${rb}"/></clipPath>`,
      body:`<path d="${rb}" fill="${robe}" stroke="#140e22" stroke-width="2" stroke-linejoin="round"/>
        <g clip-path="url(#${id}jr)" fill="none" stroke-linecap="round"><path d="M48.6 106 C46.6 112 46.8 118 48.8 123" stroke="#8a7cb8" stroke-width="2.6" opacity=".55"/>
          <path d="M62 120 C61 124 61 127 62 130 M98 120 C99 124 99 127 98 130" stroke="#4d4270" stroke-width="1.6"/></g>`,
      neck:`<path d="${laceD}" fill="${lace}" stroke="${edge}" stroke-width="1.3" stroke-linejoin="round"/>
        <path d="M50.4 101.6 Q80 121 109.6 101.6" stroke="#e7e2f1" stroke-width="2.6" fill="none"/>
        <g fill="none" stroke="#bdb4d6" stroke-width=".95">${holes}<path d="${petals}"/></g>`}},
  // hi-vis lime vest with silver reflective bands; it hugs the chest and tapers toward the hips
  vest(T){const col=bc_close(T.c,'#c4ee3a')?'#ff8a2a':'#c4ee3a',P=bc_pal(col),id=T.id;
    const d='M51.2 98.6 Q80 113 108.8 98.6 C112.2 105.4 113.6 112 112.6 118.4 C106 124.4 94 128.2 80 128.2 C66 128.2 54 124.4 47.4 118.4 C46.4 112 47.8 105.4 51.2 98.6Z';
    return {defs:`<clipPath id="${id}vc"><path d="${d}"/></clipPath><linearGradient id="${id}vs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#dfe7ee"/><stop offset="1" stop-color="#aab6c4"/></linearGradient>`,
      body:`<path d="${d}" fill="${P.base}" stroke="${P.line}" stroke-width="2" stroke-linejoin="round"/>
        <g clip-path="url(#${id}vc)"><path d="M100 100 C108 108 112 114 111 122 L118 122 L118 96Z" fill="${P.sh}" opacity=".7"/><path d="M60 100 C54 108 52 113 52 120 L44 120 L44 96Z" fill="${P.hi}" opacity=".4"/>
          <path d="M44 110.6 Q80 123 116 110.6 L116 116.2 Q80 128.6 44 116.2Z" fill="url(#${id}vs)" stroke="#8e9aaa" stroke-width=".9"/>
          <path d="M60.2 101.8 L65 103.8 L65 118.4 L60.2 117Z M99.8 101.8 L95 103.8 L95 118.4 L99.8 117Z" fill="url(#${id}vs)" stroke="#8e9aaa" stroke-width=".9" stroke-linejoin="round"/>
          <path d="M48 118.6 C55 124.6 67 127.6 80 127.6 C93 127.6 105 124.6 112 118.6" stroke="${P.dk}" stroke-width="2.6" fill="none" opacity=".5"/>
          <path d="M80 121 V128" stroke="${P.dk}" stroke-width="1.4" opacity=".6"/></g>
        ${ch_star(56.6,113.6,2.3,'#ffffff','opacity=".95"')}${ch_star(103.8,112.6,1.6,'#ffffff','opacity=".9"')}`}},
  // a puffy quilted parka with a big cream fur ruff and cuffs (the paws stay on top)
  parka(T){const col=bc_close(T.c,'#e2463f')||bc_close(T.c,'#ff9aa8')?'#3b74d6':'#e2463f',P=bc_pal(col),id=T.id;
    const hem=bc_q([114.6,130.4],[80,142.8],[45.4,130.4],6);
    const d='M50.6 99.4 Q80 113.6 109.4 99.4 C114.4 109 116.4 120 114.6 130.4'+bc_scallop(hem,7.4,false)+' C43.6 120 45.6 109 50.6 99.4Z';
    const sleeve='M56.4 108 C54.2 115 54 122 55 128.4 Q66.4 131.6 77.6 128.4 C78.6 122 78.4 114.4 76 108Z';
    const cuff=x=>bc_fluff(x,128.8,11.4,3.6,8,1.9,0);
    return {defs:`<clipPath id="${id}pc"><path d="${d}"/></clipPath><clipPath id="${id}ps"><path d="${sleeve}"/><path d="${ch_mx(sleeve,80)}"/></clipPath>`,
      body:`<path d="${d}" fill="${P.base}" stroke="${P.line}" stroke-width="2" stroke-linejoin="round"/>
        <g clip-path="url(#${id}pc)"><path d="M101 104 C110 112 114 122 113 134 L120 134 L120 98Z" fill="${P.sh}" opacity=".75"/><path d="M74 108 L86 108 L86 140 L74 140Z" fill="${P.sh}" opacity=".7"/>
          <path d="M44 115.6 Q80 127.6 116 115.6" stroke="${P.dk}" stroke-width="1.6" fill="none" opacity=".7"/><path d="M46 118 Q80 130 114 118" stroke="${P.hi}" stroke-width="2" fill="none" opacity=".45"/>
          <path d="M80 121 V137" stroke="${P.dk}" stroke-width="1.6"/><rect x="78.2" y="128" width="3.6" height="5" rx="1.2" fill="#e8e2d6" stroke="${P.line}" stroke-width=".9"/></g>
        <g fill="${P.base}" stroke="${P.line}" stroke-width="2" stroke-linejoin="round"><path d="${sleeve}"/><path d="${ch_mx(sleeve,80)}"/></g>
        <g clip-path="url(#${id}ps)"><path d="M54 118.6 Q66 122.4 79 118.6 M81 118.6 Q94 122.4 106 118.6" stroke="${P.dk}" stroke-width="1.5" fill="none" opacity=".65"/>
          <path d="M58.4 111 C57.4 115 57.4 118 57.8 121 M58.4 122.6 C58 124.4 58 126 58.4 127" stroke="${P.hi}" stroke-width="2" fill="none" opacity=".6" stroke-linecap="round"/><path d="M76 110 C77 116 77 122 76.4 128 M84 110 C83 116 83 122 83.6 128" stroke="${P.sh}" stroke-width="2.4" fill="none" opacity=".6"/></g>
        <g fill="#fbf4e6" stroke="#c9b89a" stroke-width="1.3" stroke-linejoin="round"><path d="${cuff(66.4)}"/><path d="${cuff(93.6)}"/></g>`,
      neck:`<path d="${bc_furband([45.6,99.2],[80,113.6],[114.4,99.2],10.6,10,2.2)}" fill="#fbf4e6" stroke="#c9b89a" stroke-width="1.4" stroke-linejoin="round"/>
        <path d="M52 104.6 Q80 117 108 104.6" stroke="#e3d3b4" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M50 99.6 Q64 106 74 107.4" stroke="#ffffff" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".9"/>`}},
  // a gold star charm beside the translator tag
  startag(){return {tag:`<circle cx="94.6" cy="104.4" r="1.9" fill="none" stroke="#d6dcef" stroke-width="1.4"/>
      <g transform="translate(95.6 112.6) rotate(8)"><path d="M0 -7.4 L2.2 -2.6 L7.2 -2.1 L3.4 1.3 L4.5 6.4 L0 3.8 L-4.5 6.4 L-3.4 1.3 L-7.2 -2.1 L-2.2 -2.6Z" fill="#ffc93c" stroke="#a8660f" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M-1.2 -4 L-.1 -1.6 L-3.6 -1.2" stroke="#fff6c8" stroke-width="1.1" fill="none" stroke-linecap="round" opacity=".9"/></g>`}},
  // a clip-on lab ID badge with a tiny paw photo
  labbadge(){return {tag:`<g transform="translate(96.4 104.4) rotate(9)"><rect x="-2.4" y="-2" width="4.8" height="4" rx="1" fill="#c9d1e4" stroke="#6e7894" stroke-width=".9"/>
      <rect x="-6.4" y="1.4" width="12.8" height="16.4" rx="2" fill="#ffffff" stroke="#4d5a7e" stroke-width="1.3"/><path d="M-6.4 5.6 V3.4 Q-6.4 1.4 -4.4 1.4 H4.4 Q6.4 1.4 6.4 3.4 V5.6Z" fill="#16b3a6"/>
      <rect x="-4.4" y="7.2" width="5.2" height="5.4" rx="1" fill="#ffe1a8"/><circle cx="-1.8" cy="10.4" r="1.3" fill="#a8743f"/><circle cx="-3.2" cy="8.6" r=".6" fill="#a8743f"/><circle cx="-1.8" cy="8.1" r=".6" fill="#a8743f"/><circle cx="-.4" cy="8.6" r=".6" fill="#a8743f"/>
      <path d="M2 8.4 H4.4 M2 10.6 H4.4 M-4.2 14.6 H4.2" stroke="#9aa3b8" stroke-width="1" stroke-linecap="round"/></g>`}},
  // a satin bow at the base of the left ear
  bow(T){const col=bc_close(T.c,'#ff5d8f')?'#7b6cf0':'#ff5d8f',P=bc_pal(col);
    const loop='M0 0 C-4 -6.6 -12.4 -9 -14.6 -4.2 C-16.4 -.4 -13.6 4.6 -8.4 4.4 C-5 4.2 -2 2.4 0 0Z';
    return {headTop:`<g transform="translate(57.6 22.4) rotate(-18)">
      <path d="M-1.4 1.4 L-6.4 11.4 L-3.4 10.4 L-2 13 L1 2.6Z M1.4 1.4 L6.8 10.6 L3.6 10 L2.6 12.8 L-1 2.6Z" fill="${P.sh}" stroke="${P.line}" stroke-width="1.3" stroke-linejoin="round"/>
      <path d="${loop}" fill="${P.base}" stroke="${P.line}" stroke-width="1.5" stroke-linejoin="round"/><path d="${ch_mx(loop,0)}" fill="${P.base}" stroke="${P.line}" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M-3.2 -1.4 C-6.4 -5 -10.6 -6.2 -12.6 -4" stroke="${P.hi}" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".85"/><path d="M3.2 -1.4 C6.4 -5 10.6 -6.2 12.6 -4" stroke="${P.hi}" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".6"/>
      <path d="M-8.6 2.6 C-6.6 2.6 -4.6 1.4 -3.2 .2 M8.6 2.6 C6.6 2.6 4.6 1.4 3.2 .2" stroke="${P.dk}" stroke-width="1.1" fill="none" stroke-linecap="round" opacity=".7"/>
      <ellipse cx="0" cy=".2" rx="3.2" ry="3.6" fill="${P.base}" stroke="${P.line}" stroke-width="1.5"/><ellipse cx="-.9" cy="-.9" rx="1.2" ry="1" fill="${P.hi}"/></g>`}},
  // a dive mask pushed up on the forehead; the strap runs under the ears and the tube rises on the left
  snorkel(T){const id=T.id,teal=!bc_close(T.c,'#20b7c4'),fr=teal?'#20b7c4':'#ffb21f',frD=teal?'#127a88':'#b8700a',frL=teal?'#0d5662':'#7a4806';
    const lens='M61.6 21.4 C67 17.6 93 17.6 98.4 21.4 C101.6 24 101.4 31.4 98.2 33.8 C93.8 36.6 85.8 34.8 80 31.2 C74.2 34.8 66.2 36.6 61.8 33.8 C58.6 31.4 58.4 24 61.6 21.4Z';
    return {defs:`<linearGradient id="${id}sl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6fbff" stop-opacity=".9"/><stop offset="1" stop-color="#7fd9ef" stop-opacity=".75"/></linearGradient>`,
      head:`<path d="M60 26 C50 27.4 43 32 38.6 39.4 M100 26 C110 27.4 117 32 121.4 39.4" stroke="${frL}" stroke-width="4.4" fill="none" stroke-linecap="round"/>
        <path d="M60 26 C50 27.4 43 32 38.6 39.4 M100 26 C110 27.4 117 32 121.4 39.4" stroke="#2b3550" stroke-width="2.6" fill="none" stroke-linecap="round"/>
        <path d="${lens}" fill="${fr}" stroke="${frL}" stroke-width="1.6" stroke-linejoin="round" transform="translate(80 27.4) scale(1.12) translate(-80 -27.4)"/>
        <path d="${lens}" fill="url(#${id}sl)" stroke="${frD}" stroke-width="1.2" stroke-linejoin="round"/>
        <path d="M64.4 23.6 C68 21.4 72 21 75 21.4" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".9"/><path d="M88 22 L84.4 30" stroke="#fff" stroke-width="1.3" stroke-linecap="round" opacity=".6"/>`,
      headTop:`<path d="M60.6 27 C55.4 24.6 52.6 18.6 52.8 11 L53.4 -2" stroke="${frL}" stroke-width="6.6" fill="none" stroke-linecap="round"/><path d="M60.6 27 C55.4 24.6 52.6 18.6 52.8 11 L53.4 -2" stroke="${fr}" stroke-width="4.2" fill="none" stroke-linecap="round"/>
        <path d="M54.6 20 C54 16 54 12 54.3 6" stroke="#bff3f6" stroke-width="1.2" fill="none" stroke-linecap="round" opacity=".8"/>
        <path d="M50 -2.4 Q53.4 -6.4 57 -2.4 L56.4 3 Q53.4 4.4 50.4 3Z" fill="#ff8a3d" stroke="#a84a14" stroke-width="1.3" stroke-linejoin="round"/>
        <rect x="50.4" y="13" width="6.4" height="3.2" rx="1.2" fill="#2b3550"/>`}},
  // a glass bubble helmet on a metal neck ring; the head bobs inside the still glass
  helmet(T){const id=T.id,cx=80,cy=49,rx=67,ry=63,y0=98,hw=rx*Math.sqrt(1-Math.pow((y0-cy)/ry,2)),xl=ch_n(cx-hw),xr=ch_n(cx+hw);
    const dome=`M${xl} ${y0} A${rx} ${ry} 0 1 1 ${xr} ${y0}`;
    return {defs:`<radialGradient id="${id}hg" cx=".5" cy=".46" r=".54"><stop offset=".55" stop-color="#e8f6ff" stop-opacity="0"/><stop offset=".88" stop-color="#bfe2ff" stop-opacity=".16"/><stop offset="1" stop-color="#8fc2ff" stop-opacity=".38"/></radialGradient>
        <linearGradient id="${id}hr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".4" stop-color="#dfe5f4"/><stop offset="1" stop-color="#8a95b6"/></linearGradient>`,
      ring:`<path d="M${xl-3} 95.4 Q80 110.6 ${xr+3} 95.4 L${xr+3} 104.6 Q80 121.6 ${xl-3} 104.6Z" fill="url(#${id}hr)" stroke="#545e82" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M${xl-1} 96.8 Q80 110.4 ${xr+1} 96.8" stroke="#ffffff" stroke-width="1.6" fill="none" opacity=".9"/>
        <path d="M${xl-2.4} 101.4 Q80 116.6 ${xr+2.4} 101.4" stroke="${T.collar}" stroke-width="3" fill="none"/>
        <path d="M${xl-2.6} 104 Q80 119.6 ${xr+2.6} 104" stroke="#6b7598" stroke-width="1.2" fill="none" opacity=".6"/>
        <g fill="#f4f7ff" stroke="#545e82" stroke-width="1"><circle cx="${ch_n(cx-hw+4)}" cy="99.4" r="1.6"/><circle cx="${ch_n(cx+hw-4)}" cy="99.4" r="1.6"/><circle cx="${ch_n(cx-hw+16)}" cy="104.4" r="1.4"/><circle cx="${ch_n(cx+hw-16)}" cy="104.4" r="1.4"/></g>`,
      top:`<path d="${dome}" fill="url(#${id}hg)"/>
        <path d="${dome}" fill="none" stroke="#6a78a8" stroke-width="2.6" stroke-linecap="round"/><path d="M${ch_n(cx-hw+3.4)} ${y0-2} A${rx-3.4} ${ry-3.4} 0 1 1 ${ch_n(cx+hw-3.4)} ${y0-2}" fill="none" stroke="#ffffff" stroke-width="1.4" opacity=".55"/>
        <path d="M28 40 C30 18 46 2 66 -6" stroke="#ffffff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".55"/><circle cx="74" cy="-8.2" r="2.2" fill="#fff" opacity=".7"/>
        <path d="M134 74 C130 84 124 91 116 95" stroke="#ffffff" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".35"/>`}}
};

// ---------- progress: unlock rules, wearing, live redraw ----------
function byteState(){if(typeof S==='undefined'||!S)return null;const b=S.byte=S.byte||{...BYTE_DEFAULT};
  b.unlocked=Array.isArray(b.unlocked)?b.unlocked:[];b.opened=Array.isArray(b.opened)?b.opened:[];b.wear=Array.isArray(b.wear)?b.wear:[];
  for(const g of BYTE_GEAR)if(g.when&&g.when.start&&!b.unlocked.includes(g.id)){b.unlocked.push(g.id);if(!b.opened.includes(g.id))b.opened.push(g.id)}
  return b}
// a mission's place key: its `district`, its career's, or a guess from its place name
function byteDistrict(m){if(!m)return '';if(m.district)return m.district;const c=typeof CAREERS!=='undefined'?CAREERS[m.career]:null;if(c&&c.district)return c.district;
  const t=[m.place,c&&c.place].join(' ');for(const [re,k] of [[/Boston/i,'boston'],[/Nome|Alaska/i,'nome'],[/Phoenix|Arizona/i,'phoenix'],[/Washington|\bD\.?C\.?\b/,'dc'],[/Moon|lunar/i,'moon'],[/Bay Area|San Francisco|Oakland/i,'bay'],[/Mars|Jezero/i,'mars'],[/New York/i,'nyc'],[/Vienna/i,'vienna']])if(re.test(t))return k;return ''}
function byteRuleMet(w){if(!w)return false;if(typeof w==='function')return !!w();if(w.start)return true;
  const done=S.completed||{},ms=typeof MISSIONS!=='undefined'?MISSIONS:{},ids=Object.keys(done);
  if(w.mission)return !!done[w.mission];
  if(w.days)return ids.length>=w.days;
  if(w.stars)return ids.some(id=>((done[id]||{}).stars||0)>=w.stars);
  if(w.district||w.career){const fits=m=>m&&(!w.district||byteDistrict(m)===w.district)&&(!w.career||m.career===w.career);
    if(w.count==='all'){const all=Object.values(ms).filter(fits);return all.length>0&&all.every(m=>done[m.id])}
    return ids.filter(id=>fits(ms[id])).length>=(w.count||1)}
  return false}
// earn every item whose rule is met, plus anything a finished mission lists in `unlocks`; returns the new ids
function byteCheckUnlocks(){const b=byteState();if(!b)return [];const got=[];
  for(const g of BYTE_GEAR)if(!b.unlocked.includes(g.id)&&byteRuleMet(g.when))got.push(g.id);
  const ms=typeof MISSIONS!=='undefined'?MISSIONS:{};
  for(const id in S.completed||{})for(const u of (ms[id]&&ms[id].unlocks)||[])if(byteGear(u)&&!b.unlocked.includes(u)&&!got.includes(u))got.push(u);
  got.forEach(id=>unlockAccessory(id));return got}
// earn one item now; it waits as a present until the player opens it (quiet:true skips the present)
function unlockAccessory(id,opt){const b=byteState();if(!b||!byteGear(id)||b.unlocked.includes(id))return false;
  b.unlocked.push(id);if(opt&&opt.quiet)b.opened.push(id);if(typeof save==='function')save();byteGiftUpdate();return true}
const byteGifts=()=>{const b=byteState();return b?b.unlocked.filter(id=>!b.opened.includes(id)&&byteGear(id)):[]};
function byteWear(id,on){const b=byteState();if(!b)return;if(on===undefined)on=!b.wear.includes(id);
  b.wear=on?byteWearFix([...b.wear.filter(x=>x!==id),id]):b.wear.filter(x=>x!==id);save();byteRefresh()}
// redraw every Byte on the page that shows the player's own Byte (byteBox marks those with data-live="<mood>")
function byteRefresh(){document.querySelectorAll('svg.byteart[data-live]').forEach(el=>{el.innerHTML=byteSVG({mood:el.dataset.live})})}
const byteName=()=>byteLook({}).name;
const bytePoss=()=>{const n=byteName();return /s$/i.test(n)?n+'’':n+'’s'};

// ---------- setup screen rows and the Menu button ----------
function byteLookRows(){const K=byteLook({});return [['ears','Ears','e'],['tail','Tail','tail'],['eyes','Eyes','eyes']].map(([k,l,a])=>
  `<div class="lbl">${l}</div><div class="seg">${BYTE_STYLES[k].map(([v,n])=>`<button class="segb ${K[k]===v?'on':''}" data-${a}="${v}">${n}</button>`).join('')}</div>`).join('')}
function wireByteLook(root,redraw){root=root||document;[['e','ears'],['tail','tail'],['eyes','eyes']].forEach(([a,k])=>{const bs=[...root.querySelectorAll(`[data-${a}]`)];
  bs.forEach(btn=>btn.onclick=()=>{S.byte[k]=btn.dataset[a];bs.forEach(x=>x.classList.toggle('on',x===btn));redraw()})})}
function byteClosetButton(){const n=byteGifts().length;return `<button class="btn wide ghost bc-menu" id="m-closet">${esc_b(bytePoss())} closet${n?`<i class="bc-badge">${n}</i>`:''}</button>`}

// ---------- Byte's closet ----------
const BC_VB={full:'4 -18 152 168',body:'12 4 140 144',head:'14 -2 132 100',eyes:'34 36 92 42'};
const BC_GIFT=`<svg class="bc-giftart" viewBox="0 0 100 100"><ellipse cx="50" cy="93" rx="34" ry="5" fill="rgba(20,20,60,.18)"/>
  <g class="bc-boxbody"><path d="M20 46 H80 V84 Q80 90 74 90 H26 Q20 90 20 84Z" fill="#7b6cf0" stroke="#3a2c9c" stroke-width="2.6" stroke-linejoin="round"/><path d="M68 46 H80 V84 Q80 90 74 90 H68Z" fill="#5d4ed8"/><path d="M44 46 H56 V90 H44Z" fill="#ffc93c" stroke="#a8660f" stroke-width="2"/><path d="M26 52 V80" stroke="#a99ff7" stroke-width="3" stroke-linecap="round"/></g>
  <g class="bc-lid"><path d="M14 34 H86 V46 Q86 50 82 50 H18 Q14 50 14 46Z" fill="#8f82ff" stroke="#3a2c9c" stroke-width="2.6" stroke-linejoin="round"/><path d="M42 34 H58 V50 H42Z" fill="#ffd45c" stroke="#a8660f" stroke-width="2"/>
    <path d="M50 34 C42 20 26 18 26 27 C26 34 40 35 50 34Z M50 34 C58 20 74 18 74 27 C74 34 60 35 50 34Z" fill="#ffd45c" stroke="#a8660f" stroke-width="2.2" stroke-linejoin="round"/><path d="M33 26 C37 24 42 26 45 30 M67 26 C63 24 58 26 55 30" stroke="#fff3c4" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="50" cy="33" r="4.4" fill="#ffc93c" stroke="#a8660f" stroke-width="2"/><path d="M20 38 H60" stroke="#c3baff" stroke-width="2.4" stroke-linecap="round"/></g></svg>`;
const BC_LOCK='<svg class="bc-lock" viewBox="0 0 24 24"><rect x="5" y="10.5" width="14" height="10" rx="2.6" fill="#8b90b0"/><path d="M8 10.5 V8 a4 4 0 0 1 8 0 V10.5" stroke="#8b90b0" stroke-width="2.6" fill="none"/><circle cx="12" cy="15.4" r="1.7" fill="#fff"/></svg>';
let BC_TAB='look';
function openCloset(tab){const b=byteState();if(!b)return;BC_TAB=tab||(byteGifts().length?'gear':BC_TAB);$$('.bc-gift').forEach(x=>x.remove());
  const d=sheet(`${esc_b(bytePoss())} closet`,`<div class="bc-closet"><div class="bc-stage" id="bc-stage">${byteBox({mood:'happy'},'bc-star wag')}</div>
    <div class="seg bc-tabs"><button class="segb" data-tab="look">Look</button><button class="segb" data-tab="gear">Gear<i class="bc-badge" id="bc-tabn" hidden></i></button></div><div id="bc-pane"></div></div>`);
  d.classList.add('bc-sheet');const pane=$('#bc-pane',d),stage=$('#bc-stage',d);
  const cheer=()=>{stage.classList.remove('bc-hop');void stage.offsetWidth;stage.classList.add('bc-hop');MUSIC.sfx('pop');byteRefresh()};
  const tile=(on,art,label,attrs,extra)=>`<button class="bc-tile ${on?'on':''} ${extra||''}" ${attrs}><span class="bc-art">${art}</span><span class="bc-tl">${label}</span></button>`;
  const draw=()=>{const K=byteLook({}),gifts=byteGifts();$$('[data-tab]',d).forEach(x=>x.classList.toggle('on',x.dataset.tab===BC_TAB));
    const tn=$('#bc-tabn',d);tn.hidden=!gifts.length;tn.textContent=gifts.length;
    if(BC_TAB==='look'){const base={...K,wear:[],mood:'happy'};
      pane.innerHTML=`<div class="lbl">Color</div><div class="swatches bc-sw">${BYTE_COLORS.map(c=>`<button class="sw ${K.color===c?'on':''}" data-c="${c}" style="background:${c}" aria-label="Color ${c}"></button>`).join('')}</div>`+
        [['ears','Ears','head'],['tail','Tail','body'],['eyes','Eyes','eyes']].map(([k,l,vb])=>`<div class="lbl">${l}</div><div class="bc-grid">${BYTE_STYLES[k].map(([v,n])=>tile(K[k]===v,byteBox({...base,[k]:v},'',BC_VB[vb]),n,`data-k="${k}" data-v="${v}"`)).join('')}</div>`).join('')}
    else{const b2=byteState();pane.innerHTML=`<div class="bc-grid three">${BYTE_GEAR.map(g=>{const has=b2.unlocked.includes(g.id),gift=has&&!b2.opened.includes(g.id),on=K.wear.includes(g.id);
        if(gift)return tile(false,BC_GIFT,'New!',`data-gift="${g.id}"`,'bc-new');
        if(!has)return tile(false,byteBox({...K,color:'#e4e6f0',eyes:'button',wear:[g.id],mood:'neutral'},'',BC_VB.full)+BC_LOCK,`<small>${esc_b(g.hint)}</small>`,`data-locked="${g.id}"`,'bc-locked');
        return tile(on,byteBox({...K,wear:[g.id],mood:'happy'},'',BC_VB.full),esc_b(g.name),`data-g="${g.id}" aria-pressed="${on}"`)}).join('')}</div>`}
    $$('.sw',pane).forEach(x=>x.onclick=()=>{S.byte.color=x.dataset.c;save();cheer();draw()});
    $$('[data-k]',pane).forEach(x=>x.onclick=()=>{S.byte[x.dataset.k]=x.dataset.v;save();cheer();draw()});
    $$('[data-g]',pane).forEach(x=>x.onclick=()=>{byteWear(x.dataset.g);cheer();draw()});
    $$('[data-gift]',pane).forEach(x=>x.onclick=()=>byteReveal(x.dataset.gift,()=>{draw();byteRefresh()}));
    $$('[data-locked]',pane).forEach(x=>x.onclick=()=>{x.classList.remove('bc-no');void x.offsetWidth;x.classList.add('bc-no');MUSIC.sfx('click')})};
  $$('[data-tab]',d).forEach(x=>x.onclick=()=>{BC_TAB=x.dataset.tab;draw();$('.sheet-body',d).scrollTo(0,0)});
  stage.onclick=()=>{MUSIC.sfx('arf');const r=stage.getBoundingClientRect();if(typeof burst==='function')burst(r.left+r.width/2,r.top+r.height*.35,'hearts',8);cheer()};
  d.querySelector('.x').addEventListener('click',()=>setTimeout(byteGiftUpdate,300));
  draw();return d}

// ---------- the present on calm screens, and the unlock reveal ----------
function byteGiftUpdate(){const app=document.getElementById('app');if(!app||typeof S==='undefined')return;const n=byteGifts().length;let el=document.getElementById('bc-gift');
  const calm=/\b(hub|map|planner|world)\b/.test(app.className)&&!document.querySelector('.bc-reveal');
  if(!n||!calm){if(el)el.remove();return}
  if(!el){el=document.createElement('button');el.id='bc-gift';el.className='bc-gift';el.onclick=()=>byteReveal(byteGifts()[0]);document.body.appendChild(el);try{MUSIC.sfx('chime')}catch(e){}}
  el.setAttribute('aria-label',`A present for ${byteName()}`);el.innerHTML=BC_GIFT+(n>1?`<i class="bc-badge">${n}</i>`:'')}
function byteConfetti(x,y){const cols=['#ffd45c','#ff7a6b','#7ff7e4','#8f86ff','#ff9bb0','#c4ee3a'];
  for(let i=0;i<26;i++){const c=document.createElement('i');c.className='bc-conf';c.style.left=x+'px';c.style.top=y+'px';c.style.background=cols[i%cols.length];
    const a=Math.PI*(1.05+i/25*.9)+(Math.random()-.5)*.3,v=110+Math.random()*120;c.style.setProperty('--dx',Math.cos(a)*v+'px');c.style.setProperty('--dy',Math.sin(a)*v+'px');c.style.setProperty('--r',(Math.random()*720-360)+'deg');
    c.style.animationDelay=(Math.random()*.08)+'s';if(i%3===0)c.style.borderRadius='50%';document.body.appendChild(c);setTimeout(()=>c.remove(),1700)}}
// twinkling stars around the new item, in Byte's own units, laid over the reveal's Byte
function bc_sparkles(g){const [x,y,r]=g.at||[80,80,40];return `<svg class="bc-spark" viewBox="14 0 136 150">${[[-.9,-.5,4.6],[.95,-.7,3.6],[.8,.75,4],[-.75,.85,3.2],[0,-1.1,3]].map(([a,b,k],i)=>
  ch_star(x+a*(r+5),y+b*(r+5),k,i%2?'#ffffff':'#ffe08a',`style="animation-delay:${(i*.17).toFixed(2)}s"`)).join('')}</svg>`}
// a present drops in, wiggles and pops open; Byte springs out already wearing the new item
function byteReveal(id,done){const g=byteGear(id),b=byteState();if(!g||!b){if(done)done();return}
  $$('.bc-reveal').forEach(x=>x.remove());const old=document.getElementById('bc-gift');if(old)old.remove();
  const tryOn=byteWearFix([...b.wear,id]),quick=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const d=document.createElement('div');d.className='bc-reveal'+(quick?' quick':'');d.setAttribute('role','dialog');d.setAttribute('aria-label',`New for ${byteName()}: ${g.name}`);
  d.innerHTML=`<div class="bc-rays"></div><div class="bc-r-stage"><div class="bc-r-byte">${byteBox({mood:'happy',wear:tryOn},'big')}${bc_sparkles(g)}</div><div class="bc-r-box">${BC_GIFT}</div><div class="bc-r-say">${esc_b(g.line||'I love it!')}</div></div>
    <div class="bc-r-card"><h2>New for ${esc_b(byteName())}!</h2><div class="bc-r-name">${esc_b(g.name)}</div><div class="bc-r-btns"><button class="btn" id="bc-wear">Wear it</button><button class="btn ghost" id="bc-later">Not now</button></div></div>`;
  document.body.appendChild(d);requestAnimationFrame(()=>d.classList.add('on'));
  const T=[];const at=(ms,f)=>T.push(setTimeout(f,quick?0:ms));
  const pop=()=>{if(d.classList.contains('open'))return;d.classList.add('open');T.forEach(clearTimeout);try{MUSIC.unlock();MUSIC.sfx('pop');MUSIC.sfx('chime')}catch(e){}
    const r=d.querySelector('.bc-r-box').getBoundingClientRect();if(!quick)byteConfetti(r.left+r.width/2,r.top+r.height*.3);setTimeout(()=>{try{MUSIC.sfx('arf')}catch(e){}},quick?0:450)};
  at(1250,pop);d.querySelector('.bc-r-stage').onclick=pop;
  const finish=wear=>{if(!b.opened.includes(id))b.opened.push(id);if(wear)b.wear=tryOn;save();byteRefresh();d.classList.remove('on');setTimeout(()=>d.remove(),300);
    if(done)done();else{const next=byteGifts()[0];if(next)setTimeout(()=>byteReveal(next),450);else setTimeout(byteGiftUpdate,350)}};
  d.querySelector('#bc-wear').onclick=()=>finish(true);d.querySelector('#bc-later').onclick=()=>finish(false);return d}

// check for new gear whenever the screen changes, and show the present on calm screens
LATE.push(()=>{const app=document.getElementById('app');if(!app||typeof MutationObserver==='undefined')return;
  new MutationObserver(()=>{byteCheckUnlocks();setTimeout(byteGiftUpdate,500)}).observe(app,{attributes:true,attributeFilter:['class']})});
