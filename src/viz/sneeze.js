// sneeze.js — Byte's infographics for the order-screening mission (safeguards only: screening, signatures,
// a second independent checker, sensors on standby, a fast supply line, layered defenses).
// Each VIZ[kind](args) returns an SVG string, ~300 units wide; animations are the calm looping "sn-" CSS classes.
let SNV=0;
const SN={sea:'#cfe8f7',seaD:'#aed6ef',land:'#f3f5ec',landL:'#fbfcf6',block:'#e4e8f4',roof:'#c6cfe3',steel:'#c9cfe0',
  night:'#1e2450',face:'#2b3268',paper:'#ffffff',edge:'#e3e7f3',desk:'#ded8f0',deskD:'#cdc5e6',glass:'#eaf4fd',wall:'#f6f8fe'};
// a blank order sheet / packet, centred on (x,y)
const sn_card=(x,y,w,h,o={})=>`<g transform="translate(${x} ${y}) rotate(${o.rot||0})" class="${o.cls||''}" style="${o.st||''}">
  <rect x="${-w/2+1.5}" y="${-h/2+2.5}" width="${w}" height="${h}" rx="${o.r||7}" fill="${IG.ink}" opacity=".07"/>
  <rect x="${-w/2}" y="${-h/2}" width="${w}" height="${h}" rx="${o.r||7}" fill="${SN.paper}" stroke="${o.stroke||SN.edge}" stroke-width="${o.sw||2}"/>
  ${o.seal?`<circle cx="0" cy="0" r="${o.seal}" fill="${IG.gold}"/><circle cx="0" cy="0" r="${o.seal*.5}" fill="#e0a51f"/>`:''}
  ${o.tick?`<g transform="translate(${w/2-7} ${-h/2+7})"><circle r="6.5" fill="${IG.green}"/><path d="M-3 0 l2.2 2.4 l4 -5" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`:''}
  ${o.hold?`<g transform="translate(${w/2-7} ${-h/2+7})"><circle r="6.5" fill="${IG.gold}"/><rect x="-3.4" y="-3.4" width="2.4" height="6.8" rx="1" fill="#fff"/><rect x="1" y="-3.4" width="2.4" height="6.8" rx="1" fill="#fff"/></g>`:''}</g>`;
// a print shop: a machine with a blank sheet coming out
const sn_printer=(x,y,s=1,cls='')=>`<g transform="translate(${x} ${y}) scale(${s})" class="${cls}">
  <rect x="-9" y="-25" width="18" height="14" rx="2" fill="${SN.paper}" stroke="${SN.edge}" stroke-width="1.8"/>
  <rect x="-17" y="-14" width="34" height="19" rx="5" fill="${SN.steel}"/>
  <rect x="-17" y="-14" width="34" height="6" rx="3" fill="#e2e7f3"/>
  <rect x="-9" y="-5" width="18" height="3.4" rx="1.7" fill="#8d96ad"/>
  <circle cx="12" cy="1.6" r="2" fill="${IG.teal}"/>
  <rect x="-20" y="5" width="40" height="3" rx="1.5" fill="${IG.line}"/></g>`;
const sn_check=(x,y,s=1,c=IG.green)=>`<path d="M${x-7*s} ${y+.5*s} l${5*s} ${5.5*s} l${9.5*s} ${-11.5*s}" stroke="${c}" stroke-width="${3.6*s}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
const sn_cross=(x,y,s=1,c=IG.red)=>`<path d="M${x-6*s} ${y-6*s} l${12*s} ${12*s} M${x+6*s} ${y-6*s} l${-12*s} ${12*s}" stroke="${c}" stroke-width="${3.6*s}" stroke-linecap="round"/>`;
// signature squiggle, drawn from (x,y) rightwards
const sn_sig=(x,y,s=1,c=IG.blue)=>`<path transform="translate(${x} ${y}) scale(${s})" d="M0 4 C3 -6 7 -8 8 0 C9 7 6 10 9 9 C13 8 14 -4 19 -3 C23 -2 21 7 25 7 C29 7 31 1 36 3" stroke="${c}" stroke-width="${2.6/s}" fill="none" stroke-linecap="round"/>`;
const sn_mag=(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M15 15 L30 31" stroke="#9aa2bd" stroke-width="7" stroke-linecap="round"/><circle r="21" fill="#dff1fb" opacity=".55"/><circle r="21" fill="none" stroke="#9aa2bd" stroke-width="5"/><path d="M-12 -7 a14 14 0 0 1 9 -8" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round" opacity=".9"/></g>`;
const sn_lock=(x,y,s=1,cls='')=>`<g transform="translate(${x} ${y}) scale(${s})" class="${cls}">
  <path d="M-9 -8 v-6 a9 9 0 0 1 18 0 v6" stroke="#9aa2bd" stroke-width="5" fill="none" stroke-linecap="round"/>
  <rect x="-14" y="-8" width="28" height="22" rx="6" fill="${IG.gold}" stroke="#d79f16" stroke-width="2"/>
  <circle cx="0" cy="2" r="3.4" fill="#8a6410"/><rect x="-1.5" y="2" width="3" height="6" rx="1.5" fill="#8a6410"/></g>`;

Object.assign(VIZ,{
  // 1. the harbor, five print shops, some carrying a calm amber flag
  snShops:({flag=0})=>{const pin=[[46,110],[96,88],[150,84],[204,76],[256,52]],ord=[1,3,0,4,2],on=i=>ord.indexOf(i)<flag;
    return igFrame(300,150,`<rect width="300" height="150" rx="12" fill="${SN.sea}"/>
     <g class="sn-waves">${[0,1,2,3,4,5].map(i=>`<path d="M${-40+i*64} ${106+(i%3)*14} q10 -5 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" stroke="#fff" stroke-width="2" fill="none" opacity=".55"/>`).join('')}</g>
     <path d="M0 0 H300 V36 C258 50 238 76 196 88 C154 100 116 86 78 102 C48 114 20 134 0 150 Z" fill="${SN.land}"/>
     <path d="M300 36 C258 50 238 76 196 88 C154 100 116 86 78 102 C48 114 20 134 0 150" stroke="#dcd6c4" stroke-width="2.4" fill="none"/>
     ${[[112,104,30],[176,92,22],[238,74,26]].map(([px,py,w])=>`<rect x="${px}" y="${py}" width="${w}" height="6" rx="3" fill="#ded3bd" transform="rotate(24 ${px} ${py})"/>`).join('')}
     ${[[20,24,34,22],[68,14,26,26],[128,30,30,20],[186,18,24,30],[240,16,32,22]].map(([bx,by,bw,bh])=>`<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="4" fill="${SN.block}"/>`).join('')}
     ${pin.map((p,i)=>`<g transform="translate(${p[0]} ${p[1]})">
       ${on(i)?`<circle cx="0" cy="-20" r="21" fill="${IG.gold}" opacity=".2" class="sn-halo" style="--d:${(ord.indexOf(i)*.5).toFixed(2)}s"/>`:''}
       <ellipse cx="0" cy="2" rx="7" ry="2.6" fill="${IG.ink}" opacity=".16"/>
       <path d="M0 0 c-8 -10 -12 -15 -12 -22 a12 12 0 0 1 24 0 c0 7 -4 12 -12 22z" fill="#fff" stroke="${on(i)?IG.gold:IG.violet}" stroke-width="2.6"/>
       <rect x="-5" y="-27" width="10" height="11" rx="2" fill="${on(i)?'#fdf0d0':'#ebe8ff'}"/>
       ${on(i)?`<g class="sn-flagwave" style="--d:${(ord.indexOf(i)*.4).toFixed(2)}s"><path d="M0 -34 v-18" stroke="#8d96ad" stroke-width="2.4" stroke-linecap="round"/><path d="M1 -51 q12 3 18 7 q-7 4 -18 7z" fill="${IG.gold}"/></g>`:''}</g>`).join('')}`,
     `A harbor map with five print shops, ${flag} of them flagged`)},
  // 2. one blank order on the screening desk, a HOLD stamp settling
  snAlert:()=>igFrame(300,150,`<rect width="300" height="150" rx="12" fill="${SN.wall}"/>
     <rect x="0" y="104" width="300" height="46" fill="${SN.desk}"/><rect x="0" y="104" width="300" height="7" fill="${SN.deskD}"/>
     <ellipse cx="150" cy="118" rx="74" ry="9" fill="${IG.ink}" opacity=".1"/>
     ${sn_card(150,74,116,80,{rot:-3,r:9})}
     <g class="sn-stamp"><g transform="rotate(-9 150 70)"><rect x="92" y="50" width="116" height="40" rx="9" fill="#fff" opacity=".82"/><rect x="92" y="50" width="116" height="40" rx="9" fill="none" stroke="${IG.red}" stroke-width="4.4"/>${igT(150,78,'HOLD',{s:24,c:IG.red,w:800})}</g></g>
     <g class="sn-stampring"><rect x="86" y="44" width="128" height="52" rx="12" fill="none" stroke="${IG.red}" stroke-width="3"/></g>`,'A blank order with a hold stamp settling on it'),
  // 3. a night clock: the order marks all cluster at one small hour
  snClock:()=>{const cx=150,cy=78,cl=[[-74,46],[-68,38],[-62,50],[-57,42],[-52,34],[-48,48],[-43,40]];
    const P=(a,r)=>[cx+r*Math.sin(a*Math.PI/180),cy-r*Math.cos(a*Math.PI/180)];
    return igFrame(300,150,`<rect width="300" height="150" rx="12" fill="${SN.night}"/>
     ${[[26,30],[52,18],[268,36],[240,22],[16,118],[282,116],[36,132]].map(([sx,sy],i)=>`<circle cx="${sx}" cy="${sy}" r="1.4" fill="#fff" opacity=".5" class="sn-blip" style="--d:${(i*.45).toFixed(2)}s"/>`).join('')}
     <circle cx="${cx}" cy="${cy}" r="58" fill="${IG.gold}" opacity=".12" class="sn-halo"/>
     <circle cx="${cx}" cy="${cy}" r="50" fill="${SN.face}" stroke="#5ee6d6" stroke-width="3"/>
     <path d="M${cx} ${cy} L${P(40,48)[0].toFixed(1)} ${P(40,48)[1].toFixed(1)} A48 48 0 0 1 ${P(80,48)[0].toFixed(1)} ${P(80,48)[1].toFixed(1)} Z" fill="${IG.gold}" opacity=".16"/>
     ${[0,1,2,3,4,5,6,7,8,9,10,11].map(k=>{const a=k*30,o=P(a,42),n=P(a,k%3?38:35);return `<path d="M${o[0].toFixed(1)} ${o[1].toFixed(1)} L${n[0].toFixed(1)} ${n[1].toFixed(1)}" stroke="#cfe0ff" stroke-width="${k%3?1.6:3}" stroke-linecap="round" opacity=".8"/>`}).join('')}
     <path d="M${cx} ${cy} L${P(62,24)[0].toFixed(1)} ${P(62,24)[1].toFixed(1)}" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
     <path d="M${cx} ${cy} L${P(100,34)[0].toFixed(1)} ${P(100,34)[1].toFixed(1)}" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".85"/>
     <circle cx="${cx}" cy="${cy}" r="4" fill="#5ee6d6"/>
     ${[[-96,110],[46,124],[-10,128]].map(([dx,dy])=>`<circle cx="${cx+dx}" cy="${dy}" r="3.6" fill="#8e9ac7" opacity=".55"/>`).join('')}
     ${cl.map(([dx,dy],i)=>`<circle cx="${cx-dx+36}" cy="${dy-18}" r="5.4" fill="${IG.gold}" class="sn-mark" style="--d:${(i*.22).toFixed(2)}s"/>`).join('')}`,'Order marks clustered at one small hour of the night')},
  // 4. five customers; three have an empty history bar
  snNewCustomers:()=>{const neu=[true,false,true,true,false];
    return igFrame(300,130,`${neu.map((n,i)=>{const x=1+i*61,cx=x+27;
      return `<g class="sn-rise" style="--d:${(i*.18).toFixed(2)}s"><rect x="${x}" y="16" width="54" height="98" rx="11" fill="#fff" stroke="${n?'#f3d99a':SN.edge}" stroke-width="2.4"/>
       <circle cx="${cx}" cy="48" r="16" fill="${n?'#fdf3dd':'#edf7f5'}"/>
       <circle cx="${cx}" cy="43" r="6.4" fill="${n?'#e6bb60':'#79c8bf'}"/><path d="M${cx-10} 59 a10 10 0 0 1 20 0z" fill="${n?'#e6bb60':'#79c8bf'}"/>
       ${[0,1,2,3,4].map(k=>`<rect x="${x+7+k*8.4}" y="${n?78:76}" width="6.4" height="${n?10:14}" rx="2.6" fill="${n?'#eef0f7':IG.teal}" stroke="${n?'#dfe3f0':'none'}" stroke-width="1.4"/>`).join('')}
       <rect x="${x+7}" y="96" width="40" height="3" rx="1.5" fill="${IG.line}"/>
       ${n?`<g class="sn-spark" style="--d:${(i*.3).toFixed(2)}s">${ch_star(x+47,22,6.4,IG.gold)}</g>`:''}</g>`}).join('')}`,'Five customers; three with no history')},
  // 5. one sealed packet separating into blank pieces that drift to different shops
  snSplit:()=>{const t=[[-100,86],[-34,98],[34,98],[100,86]];
    return igFrame(300,160,`${t.map((p,i)=>`<path d="M150 42 q${p[0]*.55} ${p[1]*.5} ${p[0]} ${p[1]-14}" stroke="${IG.line}" stroke-width="2" fill="none" stroke-dasharray="5 6" class="sn-dash" style="--d:${(i*.2).toFixed(2)}s"/>`).join('')}
     ${t.map((p,i)=>sn_printer(150+p[0],160,1,'')).join('')}
     ${t.map((p,i)=>`<g class="sn-piece" style="--dx:${p[0]}px;--dy:${p[1]-14}px;--d:${(i*.35).toFixed(2)}s">${sn_card(150+(i%2?12:-12),42+(i<2?-11:11),24,20,{r:4,sw:1.8})}</g>`).join('')}
     <circle cx="150" cy="42" r="8" fill="${IG.gold}"/><circle cx="150" cy="42" r="4" fill="#e0a51f"/>
     <rect x="124" y="20" width="52" height="44" rx="7" fill="none" stroke="${SN.edge}" stroke-width="2" opacity=".9"/>`,'One sealed packet splitting into pieces that go to different shops')},
  // 6. a signature check: one order matches a known customer, one carries none
  snSignature:()=>igFrame(300,150,`
     <g>${sn_card(78,66,118,84,{r:9})}
      ${sn_sig(58,74,1.3,IG.blue)}<path d="M28 94 H128" stroke="${IG.line}" stroke-width="2.4"/>
      <g transform="translate(78 122)"><rect x="-38" y="-14" width="76" height="28" rx="8" fill="#eefaf8" stroke="${IG.teal}" stroke-width="2"/>${sn_sig(-24,0,.76,IG.teal)}</g>
      <g class="sn-pop" style="--d:.2s">${sn_check(130,112,1.2)}</g></g>
     <g>${sn_card(222,66,118,84,{r:9})}
      <path d="M172 94 H272" stroke="${IG.line}" stroke-width="2.4" stroke-dasharray="7 7"/>
      <g transform="translate(222 122)"><rect x="-38" y="-14" width="76" height="28" rx="8" fill="#fdf5e4" stroke="${IG.gold}" stroke-width="2" stroke-dasharray="6 6"/></g>
      <g class="sn-pop" style="--d:.6s">${igT(222,130,'?',{s:22,c:IG.gold,w:800})}</g></g>
     <g class="sn-sweep">${sn_mag(0,66,1.05)}</g>`,'A magnifier checking two signatures'),
  // 7. Byte's answers beside a separate auditor AI's; they agree on two rows and differ on one
  snAuditor:()=>{const rows=[[1,1],[1,0],[1,1]];
    return igFrame(300,170,`<rect x="14" y="4" width="272" height="162" rx="14" fill="#f6f8fe"/>
     <svg x="48" y="8" width="62" height="46" viewBox="22 0 136 100" preserveAspectRatio="xMidYMid meet">${byteSVG({mood:'happy'})}</svg>
     <g>${robotBot(222,44,1.18,IG.violet)}</g>
     <path d="M166 10 V158" stroke="${IG.line}" stroke-width="2" stroke-dasharray="6 7"/>
     ${rows.map((r,i)=>{const y=80+i*28,dis=r[0]!==r[1];
      return `<rect x="26" y="${y-12}" width="248" height="24" rx="12" fill="${dis?'#fdf3dd':'#edf0f9'}"/>
       ${dis?`<rect x="26" y="${y-12}" width="248" height="24" rx="12" fill="none" stroke="${IG.gold}" stroke-width="2.6" class="sn-row"/>`:''}
       <g class="sn-pop" style="--d:${(i*.3).toFixed(2)}s">${r[0]?sn_check(79,y,.95):sn_cross(79,y,.95)}</g>
       <g class="sn-pop" style="--d:${(i*.3+.15).toFixed(2)}s">${r[1]?sn_check(222,y,.95):sn_cross(222,y,.95)}</g>`}).join('')}`,'Byte and a separate auditor compare answers row by row')},
  // 8. rooftop air sensors on standby, breathing green one by one
  snSensors:()=>{const b=[[8,86,44],[58,70,38],[102,96,34],[142,62,40],[188,88,42],[236,74,36],[278,100,22]];
    return igFrame(300,150,`<rect width="300" height="150" rx="12" fill="${SN.glass}"/>
     <rect y="130" width="300" height="20" fill="#dde6f2"/>
     ${b.map(([x,y,w],i)=>`<g><rect x="${x}" y="${y}" width="${w}" height="${132-y}" rx="4" fill="${i%2?'#dfe6f3':'#e9eef8'}" stroke="#cfd8e8" stroke-width="1.6"/>
       ${[0,1,2].map(r=>[0,1].map(c=>`<rect x="${x+8+c*(w-26)}" y="${y+10+r*16}" width="10" height="9" rx="2" fill="#c3d2e6"/>`).join('')).join('')}
       <g transform="translate(${x+w/2} ${y})">
        <circle r="20" fill="none" stroke="${IG.green}" stroke-width="3" class="sn-breathe" style="--d:${(i*.55).toFixed(2)}s"/>
        <rect x="-9" y="-11" width="18" height="11" rx="3" fill="#fff" stroke="#b9c3d8" stroke-width="1.8"/>
        <path d="M0 -11 v-9" stroke="#9aa2bd" stroke-width="2.2" stroke-linecap="round"/><circle cx="0" cy="-22" r="2.6" fill="${IG.green}" class="sn-blip" style="--d:${(i*.55).toFixed(2)}s"/>
        <circle cx="0" cy="-5.5" r="2.6" fill="${IG.green}" opacity=".5"/></g></g>`).join('')}`,'Rooftop air sensors on standby')},
  // 9. the fast vaccine line: vials moving along, days counting down
  snVaccine:()=>igFrame(300,140,`
     <rect x="8" y="78" width="184" height="16" rx="8" fill="${SN.steel}"/>
     ${[0,1,2,3,4,5].map(i=>`<circle cx="${22+i*30}" cy="86" r="5" fill="#aab3c8"/>`).join('')}
     <path d="M12 80.5 H188" stroke="#eef2f9" stroke-width="4" stroke-dasharray="11 9" class="sn-dash"/>
     ${[0,1,2,3].map(i=>`<g class="sn-roll" style="--d:${(i*1.1).toFixed(2)}s"><g transform="translate(0 50)">
       <rect x="-9" y="-2" width="18" height="28" rx="6" fill="#e9f8f5" stroke="${IG.teal}" stroke-width="2.4"/>
       <rect x="-9" y="12" width="18" height="14" rx="6" fill="${IG.teal}" opacity=".6"/>
       <rect x="-6" y="-9" width="12" height="7" rx="2" fill="#9fb0cf"/></g></g>`).join('')}
     <g transform="translate(248 68)"><rect x="-38" y="-44" width="76" height="86" rx="12" fill="#fff" stroke="${SN.edge}" stroke-width="2.6"/>
      <rect x="-38" y="-44" width="76" height="20" rx="12" fill="${IG.violet}"/><rect x="-38" y="-34" width="76" height="10" fill="${IG.violet}"/>
      <rect x="-22" y="-52" width="7" height="14" rx="3.5" fill="#9aa2bd"/><rect x="15" y="-52" width="7" height="14" rx="3.5" fill="#9aa2bd"/>
      ${[0,1,2].map(i=>`<g class="sn-count" style="--d:${(i*1.5).toFixed(2)}s">${igT(0,22,String(9-i*3),{s:42,w:800,c:IG.ink})}</g>`).join('')}</g>
     <path d="M200 86 h26" stroke="${IG.soft}" stroke-width="2.6" stroke-dasharray="5 5" class="sn-dash"/>`,'Vials moving along a fast line while the days count down'),
  // 10. four layers: one try stopped at the first shield, one slips past it and is stopped by the second
  snLayers:()=>{const X=[70,132,194,256],gid='snl'+(++SNV),
    sh=(cx,glyph,clip)=>`<g${clip?` clip-path="url(#${gid})"`:''}><path transform="translate(${cx} 86)" d="M-21 -48 H21 V14 C21 36 4 45 0 47 C-4 45 -21 36 -21 14 Z" fill="#e4f6f4" stroke="${IG.teal}" stroke-width="3.2"/>
      <g transform="translate(${cx} 56)" fill="${IG.violet}">${glyph}</g></g>`;
    return igFrame(300,170,`<defs><clipPath id="${gid}"><rect x="0" y="0" width="300" height="104"/><rect x="0" y="126" width="300" height="60"/></clipPath></defs>
     <path d="M10 60 H290" stroke="${IG.line}" stroke-width="2.4" stroke-dasharray="7 7"/>
     <path d="M10 116 H290" stroke="${IG.line}" stroke-width="2.4" stroke-dasharray="7 7"/>
     ${sh(X[0],'<circle r="7"/>',true)}
     ${sh(X[1],'<rect x="-6.5" y="-6.5" width="13" height="13" rx="2"/>')}
     ${sh(X[2],'<path d="M0 -8 L7.5 6 H-7.5Z"/>')}
     ${sh(X[3],'<path d="M0 -8 L8 0 L0 8 L-8 0Z"/>')}
     <g class="sn-ping" style="--d:0s"><circle cx="${X[0]-26}" cy="60" r="13" fill="none" stroke="${IG.coral}" stroke-width="3"/></g>
     <g class="sn-ping" style="--d:1.1s"><circle cx="${X[1]-26}" cy="116" r="13" fill="none" stroke="${IG.coral}" stroke-width="3"/></g>
     <g class="sn-try" style="--dx:${X[0]-26-20}px;--d:0s"><circle cx="20" cy="60" r="9" fill="${IG.coral}"/></g>
     <g class="sn-try" style="--dx:${X[1]-26-20}px;--d:1.1s"><circle cx="20" cy="116" r="9" fill="${IG.coral}"/></g>`,'Four layers: one attempt stopped by the first, one by the second')},
  // 11. the order queue held by a padlock, honest orders still flowing past
  snPause:()=>igFrame(300,150,`
     <rect x="0" y="34" width="300" height="18" rx="9" fill="#eef5f3"/>
     ${[0,1,2].map(i=>`<g class="sn-flow" style="--d:${(i*1.6).toFixed(2)}s">${sn_card(-30,43,36,28,{r:6,sw:1.8,tick:true})}</g>`).join('')}
     <rect x="0" y="104" width="300" height="20" rx="10" fill="${SN.steel}"/>
     ${[0,1,2,3].map(i=>`<g class="sn-queue" style="--d:${(i*.3).toFixed(2)}s">${sn_card(30+i*42,96,36,30,{r:6,sw:1.8,hold:true})}</g>`).join('')}
     <path d="M206 94 V134" stroke="${IG.gold}" stroke-width="3.4" stroke-linecap="round" stroke-dasharray="7 7"/>
     ${sn_lock(206,96,1.5,'sn-lockdrop')}`,'A padlock holding the order queue while honest orders flow past')
});

// 120x90 story vignettes, same wrapper as vignette(kind) in art.js
function snVignette(kind){const lena={skin:'#eccfae',shirt:'#16b3a6',hair:'#2e2436',style:'bun',s:.8,face:'happy'},
  kid={skin:'#f8dcc8',shirt:'#6c5ce7',hair:'#2a2030',age:'kid',s:.78,face:'happy'};let art='';
  const board=(x,y,w,h,inner)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="#fff" stroke="#d9dff0" stroke-width="1.6"/><rect x="${x}" y="${y}" width="${w}" height="6" rx="3" fill="#b9c3e0"/>${inner||''}`;
  const tick=(x,y,s,d)=>`<g class="sn-vtick" style="--d:${d}s"><path d="M${x-4*s} ${y} l${3*s} ${3.4*s} l${6*s} ${-7.4*s}" stroke="#1fa774" stroke-width="${2.4*s}" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  if(kind==='allblocked'){art=`<rect width="120" height="90" fill="#e6f6f2"/><path d="M0 68 H120 V90 H0Z" fill="#d2ebe3"/>
    ${board(64,8,50,34,[0,1,2].map(i=>`<rect x="70" y="${18+i*8}" width="24" height="4" rx="2" fill="#e7ebf7"/>`).join('')+[0,1,2].map(i=>tick(102,20+i*8,.9,i*.4)).join(''))}
    <rect x="4" y="54" width="48" height="14" rx="3" fill="#cfc8e8"/><rect x="4" y="54" width="48" height="4" rx="2" fill="#bdb4dd"/>
    ${[0,1,2].map(i=>`<g transform="translate(${12+i*16} 48)"><rect x="-6" y="-9" width="12" height="15" rx="2" fill="#fff" stroke="#e3e7f3" stroke-width="1.2"/><g class="sn-vtick" style="--d:${(i*.35).toFixed(2)}s"><circle cx="4" cy="-7" r="3.4" fill="#1fa774"/><path d="M2.4 -7 l1.2 1.3 l2.1 -2.6" stroke="#fff" stroke-width="1" fill="none" stroke-linecap="round"/></g></g>`).join('')}
    <g transform="translate(34 46)">${mini(0,0,lena)}</g><g transform="translate(54 50)">${mini(0,0,kid)}</g>`}
  if(kind==='oneslips'){art=`<rect width="120" height="90" fill="#eaf4fb"/><path d="M0 70 H120 V90 H0Z" fill="#d8e7f3"/>
    <rect x="34" y="18" width="10" height="28" rx="3" fill="#dff2f0" stroke="#16b3a6" stroke-width="2.4"/>
    <rect x="34" y="56" width="10" height="22" rx="3" fill="#dff2f0" stroke="#16b3a6" stroke-width="2.4"/>
    <rect x="72" y="18" width="10" height="60" rx="3" fill="#dff2f0" stroke="#16b3a6" stroke-width="2.4"/>
    <g class="sn-vslip"><rect x="-9" y="-7" width="18" height="14" rx="3" fill="#fff" stroke="#c9d0e4" stroke-width="1.4"/></g>
    <g class="sn-vtick" style="--d:1.6s"><circle cx="77" cy="11" r="7" fill="#1fa774"/><path d="M73.8 11 l2.4 2.6 l4.2 -5.2" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
    <g transform="translate(102 46)">${mini(0,0,{...lena,s:.74})}</g>`}
  if(kind==='primeslips'){art=`<rect width="120" height="90" fill="#dfe6f6"/><rect y="0" width="120" height="44" fill="#cdd8ee"/>
    <rect y="44" width="120" height="46" fill="#9fc3dc"/>${[0,1,2].map(i=>`<path d="M${6+i*38} ${58+i*9} h26" stroke="#fff" stroke-width="1.6" opacity=".6" stroke-linecap="round"/>`).join('')}
    <path d="M0 34 H120 V48 H0Z" fill="#cbb79a"/><path d="M0 48 H120 V52 H0Z" fill="#b19f84"/>
    ${[12,46,80,110].map(x=>`<rect x="${x}" y="24" width="7" height="12" rx="3.5" fill="#8d8373"/>`).join('')}
    ${board(6,4,36,20,[0,1].map(i=>tick(32,12+i*7,.85,i*.4)).join(''))}
    <g class="sn-vshadow"><ellipse cx="78" cy="40" rx="15" ry="5" fill="#3a3550" opacity=".4"/><path d="M70 40 C70 28 74 20 78 20 C82 20 86 28 86 40Z" fill="#3a3550" opacity=".45"/></g>`}
  if(kind==='shutdown'){art=`<rect width="120" height="90" fill="#eceaf2"/><path d="M0 72 H120 V90 H0Z" fill="#dcd8e6"/>
    ${[6,66].map((x,i)=>`<g><rect x="${x}" y="14" width="48" height="58" rx="4" fill="#cfd4e4"/><rect x="${x+4}" y="30" width="40" height="42" rx="2" fill="#b7bdd2"/>${[0,1,2,3,4,5].map(k=>`<path d="M${x+4} ${34+k*7} h40" stroke="#a7aec6" stroke-width="2"/>`).join('')}<rect x="${x+8}" y="18" width="32" height="8" rx="3" fill="#9aa2bd"/></g>`).join('')}
    <g transform="translate(30 62)">${mini(0,0,{skin:'#f0cfb0',shirt:'#ff7a6b',hair:'#39302c',s:.72,face:'sad'})}</g>
    <g transform="translate(48 64)">${mini(0,0,{skin:'#d8a97f',shirt:'#5b9bf0',hair:'#1f1a26',s:.7})}</g>
    <g class="sn-vwait" transform="translate(92 60)"><rect x="-10" y="-12" width="20" height="14" rx="2" fill="#d6b98e" stroke="#bda079" stroke-width="1.4"/><path d="M-10 -6 h20" stroke="#bda079" stroke-width="1.4"/><circle cx="8" cy="-16" r="6" fill="#fff" stroke="#f5b82e" stroke-width="1.6"/><path d="M8 -19 v3 l2.4 1.4" stroke="#f5b82e" stroke-width="1.4" fill="none" stroke-linecap="round"/></g>`}
  if(kind==='watch'){art=`<rect width="120" height="90" fill="#eef0f8"/><path d="M0 74 H120 V90 H0Z" fill="#dfe3f0"/>
    ${board(4,10,56,56,[0,1,2,3].map(i=>`<text x="${14+(i%2)*26}" y="${34+Math.floor(i/2)*20}" font-size="15" font-weight="800" fill="#f5b82e" text-anchor="middle" font-family="Nunito, sans-serif" class="sn-vq" style="--d:${(i*.35).toFixed(2)}s">?</text>`).join(''))}
    <g transform="translate(88 40)"><circle r="23" fill="#fff" stroke="#8a90b0" stroke-width="3"/>
     ${[0,1,2,3,4,5,6,7,8,9,10,11].map(k=>`<circle cx="${(17*Math.sin(k*Math.PI/6)).toFixed(1)}" cy="${(-17*Math.cos(k*Math.PI/6)).toFixed(1)}" r="${k%3?.8:1.6}" fill="#8a90b0"/>`).join('')}
     <circle r="19" fill="none" stroke="#e5484d" stroke-width="3" stroke-dasharray="119" stroke-dashoffset="0" opacity=".55"/>
     <g class="sn-vhand"><path d="M0 0 V-15" stroke="#1f2340" stroke-width="2.4" stroke-linecap="round"/></g>
     <path d="M0 0 V-9" stroke="#1f2340" stroke-width="2" stroke-linecap="round"/><circle r="2.4" fill="#1f2340"/></g>`}
  return `<svg viewBox="0 0 120 90" class="vig"><clipPath id="snv${++SNV}"><rect width="120" height="90" rx="10"/></clipPath><g clip-path="url(#snv${SNV})">${art}</g></svg>`;
}
