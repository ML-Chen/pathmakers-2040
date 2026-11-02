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
// a small AI: a rounded screen with two calm eyes and an antenna
const sn_ai=(x,y,s=1,c=IG.violet)=>`<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M0 -20 v-6" stroke="#9aa2bd" stroke-width="2.2" stroke-linecap="round"/><circle cx="0" cy="-27" r="2.6" fill="${c}"/>
  <rect x="-15" y="-20" width="30" height="24" rx="8" fill="#fff" stroke="${c}" stroke-width="2.6"/>
  <circle cx="-5.4" cy="-9" r="2.6" fill="${c}"/><circle cx="5.4" cy="-9" r="2.6" fill="${c}"/>
  <path d="M-4 -2.6 q4 2.6 8 0" stroke="${c}" stroke-width="1.8" fill="none" stroke-linecap="round"/></g>`;
// a small person: head and shoulders, no face needed at this size
const sn_head=(x,y,s=1,c=IG.teal,sk='#eccfae')=>`<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M-15 4 C-15 -7 -7 -11 0 -11 C7 -11 15 -7 15 4Z" fill="${c}"/>
  <circle cx="0" cy="-15" r="8.4" fill="${sk}" stroke="#c99a6e" stroke-width="1.4"/>
  <path d="M-8.6 -17 C-8 -24 8 -24 8.6 -17 C6 -20 -5 -21 -8.6 -17Z" fill="#2b2436"/></g>`;
const sn_lock=(x,y,s=1,cls='')=>`<g transform="translate(${x} ${y}) scale(${s})" class="${cls}">
  <path d="M-9 -8 v-6 a9 9 0 0 1 18 0 v6" stroke="#9aa2bd" stroke-width="5" fill="none" stroke-linecap="round"/>
  <rect x="-14" y="-8" width="28" height="22" rx="6" fill="${IG.gold}" stroke="#d79f16" stroke-width="2"/>
  <circle cx="0" cy="2" r="3.4" fill="#8a6410"/><rect x="-1.5" y="2" width="3" height="6" rx="1.5" fill="#8a6410"/></g>`;

Object.assign(VIZ,{
  // 1. the harbor, five print shops, some carrying a calm amber flag; extra adds the shop off the list
  snShops:({flag=0,extra=0})=>{const pin=[[46,110],[96,88],[150,84],[204,76],[256,52]],ord=[1,3,0,4,2],on=i=>ord.indexOf(i)<flag;
    return igFrame(300,150,`<rect width="300" height="150" rx="12" fill="${SN.sea}"/>
     <g class="sn-waves">${[0,1,2,3,4,5].map(i=>`<path d="M${-40+i*64} ${106+(i%3)*14} q10 -5 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" stroke="#fff" stroke-width="2" fill="none" opacity=".55"/>`).join('')}</g>
     <path d="M0 0 H300 V36 C258 50 238 76 196 88 C154 100 116 86 78 102 C48 114 20 134 0 150 Z" fill="${SN.land}"/>
     <path d="M300 36 C258 50 238 76 196 88 C154 100 116 86 78 102 C48 114 20 134 0 150" stroke="#dcd6c4" stroke-width="2.4" fill="none"/>
     ${extra?`<path d="M300 150 V84 C266 92 240 116 228 150Z" fill="${SN.land}"/><path d="M300 84 C266 92 240 116 228 150" stroke="#dcd6c4" stroke-width="2.4" fill="none"/>
      <g transform="translate(266 134)"><circle cx="0" cy="-19" r="22" fill="none" stroke="${IG.violet}" stroke-width="2.4" stroke-dasharray="5 6" class="sn-dash"/>
       <ellipse cx="0" cy="2" rx="7" ry="2.6" fill="${IG.ink}" opacity=".16"/>
       <path d="M0 0 c-8 -10 -12 -15 -12 -22 a12 12 0 0 1 24 0 c0 7 -4 12 -12 22z" fill="#fff" stroke="${IG.violet}" stroke-width="2.6"/>
       ${igT(0,-16,'?',{s:15,c:IG.violet,w:800})}</g>`:''}
     ${[[112,104,30],[176,92,22],[238,74,26]].map(([px,py,w])=>`<rect x="${px}" y="${py}" width="${w}" height="6" rx="3" fill="#ded3bd" transform="rotate(24 ${px} ${py})"/>`).join('')}
     ${[[20,24,34,22],[68,12,26,28],[128,30,30,20],[186,16,24,32],[238,14,32,24]].map(([bx,by,bw,bh])=>`<g><rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="3" fill="${SN.block}"/>
       <rect x="${bx}" y="${by}" width="${bw}" height="4" rx="2" fill="${SN.roof}"/>
       ${[0,1,2].map(r=>[0,1].map(c=>`<rect x="${bx+5+c*(bw-13)}" y="${by+9+r*8}" width="6" height="5" rx="1.4" fill="#f3f6ff" opacity="${by+9+r*8+5<by+bh-3?.95:0}"/>`).join('')).join('')}</g>`).join('')}
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
  // 3. a night clock: all three orders land inside one quarter of an hour, in the small hours
  snClock:()=>{const cx=150,cy=66,R=44;
    const P=(a,r)=>[+(cx+r*Math.sin(a*Math.PI/180)).toFixed(1),+(cy-r*Math.cos(a*Math.PI/180)).toFixed(1)];
    const mins=[2,7,11];
    return igFrame(300,150,`<rect width="300" height="150" rx="12" fill="${SN.night}"/>
     ${[[26,26],[52,16],[268,30],[240,18],[20,104],[282,100],[40,124],[262,122]].map(([sx,sy],i)=>`<circle cx="${sx}" cy="${sy}" r="1.4" fill="#fff" opacity=".5" class="sn-blip" style="--d:${(i*.4).toFixed(2)}s"/>`).join('')}
     <circle cx="${cx}" cy="${cy}" r="${R}" fill="${SN.face}" stroke="#5ee6d6" stroke-width="3"/>
     ${[0,1,2,3,4,5,6,7,8,9,10,11].map(k=>{const a=k*30,o=P(a,R-4),n=P(a,k%3?R-8:R-11);
       return `<path d="M${o[0]} ${o[1]} L${n[0]} ${n[1]}" stroke="#cfe0ff" stroke-width="${k%3?1.5:2.8}" stroke-linecap="round" opacity="${k===3?1:.75}"/>`}).join('')}
     ${igT(P(90,R-20)[0],P(90,R-20)[1]+4,'3',{s:14,c:IG.gold,w:800})}
     <path d="M${cx} ${cy} L${P(93.5,R-22)[0]} ${P(93.5,R-22)[1]}" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
     <path d="M${cx} ${cy} L${P(42,R-10)[0]} ${P(42,R-10)[1]}" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".9"/>
     <circle cx="${cx}" cy="${cy}" r="3.6" fill="#5ee6d6"/>
     ${mins.map((m,i)=>{const a=78+i*12,p=P(a,R+14),q=P(a,R+3);
       return `<g class="sn-mark" style="--d:${(i*.3).toFixed(2)}s"><path d="M${q[0]} ${q[1]} L${p[0]} ${p[1]}" stroke="${IG.gold}" stroke-width="2.2" stroke-linecap="round"/><circle cx="${p[0]}" cy="${p[1]}" r="5.4" fill="${IG.gold}"/></g>`}).join('')}
     <rect x="76" y="118" width="148" height="24" rx="12" fill="#2b3268"/>
     ${igT(150,135,'3:02 · 3:07 · 3:11',{s:14,c:'#ffd97a',w:800})}`,'A clock at night with three order marks in the same quarter hour')},
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
     ${t.map((p,i)=>sn_printer(150+p[0],150,.95,'')).join('')}
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
     ${sn_ai(222,54,1.05)}
     <path d="M166 10 V158" stroke="${IG.line}" stroke-width="2" stroke-dasharray="6 7"/>
     ${rows.map((r,i)=>{const y=80+i*28,dis=r[0]!==r[1];
      return `<rect x="26" y="${y-12}" width="248" height="24" rx="12" fill="${dis?'#fdf3dd':'#edf0f9'}"/>
       ${dis?`<rect x="26" y="${y-12}" width="248" height="24" rx="12" fill="none" stroke="${IG.gold}" stroke-width="2.6" class="sn-row"/>`:''}
       <g class="sn-pop" style="--d:${(i*.3).toFixed(2)}s">${r[0]?sn_check(79,y,.95):sn_cross(79,y,.95)}</g>
       <g class="sn-pop" style="--d:${(i*.3+.15).toFixed(2)}s">${r[1]?sn_check(222,y,.95):sn_cross(222,y,.95)}</g>`}).join('')}`,'Byte and a separate auditor compare answers row by row')},
  // 8. the city's wastewater monitors: every neighbourhood checked every day
  snWastewater:()=>{const bl=[[10,52,46],[62,36,40],[108,60,36],[150,30,44],[200,54,40],[246,42,48]];
    return igFrame(300,160,`<rect width="300" height="160" rx="12" fill="${SN.glass}"/>
     ${bl.map(([x,y,w],i)=>`<g><rect x="${x}" y="${y}" width="${w}" height="${96-y}" rx="4" fill="${i%2?'#dfe6f3':'#e9eef8'}" stroke="#cfd8e8" stroke-width="1.6"/>
       <rect x="${x}" y="${y}" width="${w}" height="5" rx="2.5" fill="#cfd8e8"/>
       ${[0,1,2].map(r=>[0,1].map(c=>`<rect x="${x+8+c*(w-26)}" y="${y+12+r*15}" width="10" height="9" rx="2" fill="${y+12+r*15+9<92?'#c3d2e6':'none'}"/>`).join('')).join('')}</g>`).join('')}
     <rect y="96" width="300" height="12" fill="#cfd8e8"/><rect y="96" width="300" height="4" fill="#bcc8dc"/>
     <rect y="108" width="300" height="52" fill="#e6ddcd"/>
     <rect x="0" y="118" width="300" height="26" rx="4" fill="#b9c3d8"/><rect x="0" y="122" width="300" height="18" fill="#8fa8c4"/>
     <g class="sn-dash">${[0,1,2,3,4,5,6].map(i=>`<circle cx="${18+i*44}" cy="131" r="4.4" fill="#cfe6f7" opacity=".8"/>`).join('')}</g>
     ${[62,150,238].map((x,i)=>`<g transform="translate(${x} 118)">
       <circle r="22" fill="none" stroke="${IG.green}" stroke-width="3" class="sn-breathe" style="--d:${(i*.6).toFixed(2)}s"/>
       <rect x="-11" y="-20" width="22" height="20" rx="4" fill="#fff" stroke="#b9c3d8" stroke-width="2"/>
       <path d="M0 -20 v-10" stroke="#9aa2bd" stroke-width="2.2" stroke-linecap="round"/><circle cx="0" cy="-32" r="2.8" fill="${IG.green}" class="sn-blip" style="--d:${(i*.6).toFixed(2)}s"/>
       <circle cx="0" cy="-10" r="3.4" fill="${IG.green}" opacity=".55"/></g>`).join('')}`,
     'Monitors on the city pipes, one for each neighbourhood')},
  // 8b. far-UVC lights over a station platform
  snUVC:()=>igFrame(300,150,`<rect width="300" height="150" rx="12" fill="#eef2fb"/>
     <rect y="0" width="300" height="20" fill="#dce3f2"/>
     ${[52,150,248].map((x,i)=>`<g><rect x="${x-26}" y="18" width="52" height="9" rx="4" fill="#cdd6ea"/>
       <path d="M${x-24} 27 L${x-44} 112 L${x+44} 112 L${x+24} 27Z" fill="#b9a8ff" opacity=".22" class="sn-breathe" style="--d:${(i*.7).toFixed(2)}s"/>
       <rect x="${x-22}" y="22" width="44" height="5" rx="2.5" fill="#cdbcff"/></g>`).join('')}
     <rect y="112" width="300" height="38" fill="#dfe4f0"/><rect y="112" width="300" height="5" fill="#c8d0e2"/>
     ${[0,1,2,3].map(i=>`<rect x="${12+i*78}" y="120" width="56" height="5" rx="2.5" fill="#cfd6e6"/>`).join('')}
     <g transform="translate(96 112)">${mini(0,0,{skin:'#eccfae',shirt:'#16b3a6',hair:'#2b2436',s:1.15,pose:'walk'})}</g>
     <g transform="translate(206 112)">${mini(0,0,{skin:'#c98e64',shirt:'#f5b82e',hair:'#1b1410',s:1.05,pose:'walk',flip:true})}</g>`,
     'Soft light panels over a station platform'),
  // 8c. clean-air shelters, enough for everyone, standing quietly ready
  snShelter:()=>igFrame(300,150,`<rect width="300" height="150" rx="12" fill="#eef5f3"/>
     <rect y="118" width="300" height="32" fill="#dde8e3"/>
     <g><rect x="66" y="26" width="168" height="94" rx="8" fill="#f3f7fb" stroke="#cfd8e8" stroke-width="2.4"/>
      <rect x="58" y="18" width="184" height="14" rx="6" fill="${IG.teal}"/>
      ${[0,1,2,3].map(i=>`<rect x="${82+i*38}" y="44" width="24" height="26" rx="4" fill="#dbe6f2"/>`).join('')}
      <rect x="124" y="80" width="52" height="40" rx="4" fill="#cfe0ef"/><path d="M150 80 V120" stroke="#b6c6d8" stroke-width="2"/>
      <g transform="translate(150 58)"><circle r="15" fill="#fff" stroke="${IG.teal}" stroke-width="2.4"/>
       <path d="M-7 2 q7 -11 14 0 q-7 6 -14 0z" fill="${IG.teal}"/><path d="M0 2 v6" stroke="${IG.teal}" stroke-width="2" stroke-linecap="round"/></g></g>
     ${[0,1,2].map(i=>`<g class="sn-breathe" style="--d:${(i*.8).toFixed(2)}s"><circle cx="150" cy="58" r="${22+i*10}" fill="none" stroke="${IG.teal}" stroke-width="2"/></g>`).join('')}
     <g transform="translate(40 118)">${mini(0,0,{skin:'#d8a97f',shirt:'#6c5ce7',hair:'#1f1a26',s:1.1,pose:'walk'})}</g>
     <g transform="translate(260 118)">${mini(0,0,{skin:'#f0cfb0',shirt:'#ff7a6b',hair:'#39302c',s:1.05,pose:'walk',flip:true})}</g>`,
     'A clean-air shelter with its doors open and nobody in a hurry'),
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
      ${[0,1,2].map(i=>`<g class="sn-count" style="--d:${(i*1.5).toFixed(2)}s">${igT(0,16,String(3-i),{s:36,w:800,c:IG.ink})}</g>`).join('')}
      ${igT(0,34,'weeks',{s:11.5,c:IG.soft,w:800})}</g>
     <path d="M200 86 h26" stroke="${IG.soft}" stroke-width="2.6" stroke-dasharray="5 5" class="sn-dash"/>`,'Vials moving along a fast line while the days count down'),
  // 10. four layers: one try stopped at the first shield, one slips past it and is stopped by the second
  snLayers:()=>{const X=[70,132,194,256],gid='snl'+(++SNV),
    sh=(cx,glyph,clip)=>`<g${clip?` clip-path="url(#${gid})"`:''}><path transform="translate(${cx} 86)" d="M-21 -48 H21 V14 C21 36 4 45 0 47 C-4 45 -21 36 -21 14 Z" fill="#e4f6f4" stroke="${IG.teal}" stroke-width="3.2"/>
      <g transform="translate(${cx} 56)" fill="${IG.violet}">${glyph}</g></g>`;
    return igFrame(300,170,`<defs><clipPath id="${gid}"><rect x="0" y="0" width="300" height="108"/><rect x="0" y="124" width="300" height="62"/></clipPath></defs>
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
     <g class="sn-lockdrop">${sn_lock(206,96,1.5)}</g>`,'A padlock holding the order queue while honest orders flow past'),

  // 12. the reader: every order goes through, the odd one waits on a person
  snScreen:()=>igFrame(300,160,`<rect width="300" height="160" rx="12" fill="${SN.wall}"/>
     <rect x="0" y="44" width="300" height="12" rx="6" fill="#e8ecf7"/>
     <g clip-path="url(#snsc)"><defs><clipPath id="snsc"><rect x="0" y="4" width="300" height="48"/></clipPath></defs>
      ${[0,1,2,3].map(i=>`<g class="sn-belt" style="--d:${(i*1.2).toFixed(2)}s">${sn_card(-24,30,34,28,{r:6,sw:1.8,tick:true})}</g>`).join('')}</g>
     <g><rect x="116" y="2" width="68" height="54" rx="12" fill="none" stroke="${IG.teal}" stroke-width="3.4"/>
      <rect x="116" y="2" width="68" height="54" rx="12" fill="${IG.teal}" opacity=".07"/>
      <g class="sn-scan"><rect x="120" y="6" width="60" height="4" rx="2" fill="${IG.teal}" opacity=".9"/></g></g>
     <path d="M138 60 V84" stroke="${IG.gold}" stroke-width="3" stroke-linecap="round" stroke-dasharray="6 7" class="sn-dash"/>
     <path d="M131 78 l7 9 l7 -9z" fill="${IG.gold}"/>
     <rect x="0" y="130" width="300" height="30" fill="${SN.desk}"/><rect x="0" y="130" width="300" height="6" fill="${SN.deskD}"/>
     ${sn_card(118,112,48,40,{r:7,hold:true})}
     <g class="sn-flagwave"><path d="M142 98 v-20" stroke="#8d96ad" stroke-width="2.4" stroke-linecap="round"/><path d="M143 77 q12 3 18 7 q-7 4 -18 7z" fill="${IG.gold}"/></g>
     <g transform="translate(216 79)">${mini(0,0,{skin:'#eccfae',shirt:'#f5b82e',hair:'#15110f',style:'short',s:1.5})}</g>`,'A reader checking every order, with the odd one left for a person'),

  // 13. the same sentence, word for word, on three different orders
  snSameWords:()=>igFrame(300,150,`${[0,1,2].map(i=>{const x=16+i*96;
     return `<g>${sn_card(x+38,74,76,112,{r:9})}
      ${[0,1].map(k=>`<rect x="${x+12}" y="${30+k*10}" width="${k?40:52}" height="4.4" rx="2.2" fill="#e8ebf6"/>`).join('')}
      <rect x="${x+10}" y="${64}" width="56" height="18" rx="6" fill="#fdf3dd" stroke="${IG.gold}" stroke-width="2" class="sn-pop" style="--d:${(i*.3).toFixed(2)}s"/>
      ${igT(x+38,77,'vaccine work',{s:8.4,c:'#a6760a',w:800})}
      ${[0,1,2].map(k=>`<rect x="${x+12}" y="${94+k*10}" width="${[48,52,34][k]}" height="4.4" rx="2.2" fill="#e8ebf6"/>`).join('')}
      <g class="sn-pop" style="--d:${(i*.3+.15).toFixed(2)}s">${sn_check(x+58,120,.8)}</g></g>`}).join('')}
     <path d="M94 73 H110 M190 73 H206" stroke="${IG.gold}" stroke-width="2.4" stroke-dasharray="4 5" class="sn-dash" opacity=".9"/>`,'The same sentence written on three different orders'),

  // 14. the three order times, zoomed to one quarter of an hour
  snTimeline:()=>{const x0=26,x1=278,per=(x1-x0)/15,at=m=>+(x0+m*per).toFixed(1),mk=[2,7,11];
    return igFrame(300,150,`<rect width="300" height="150" rx="12" fill="${SN.night}"/>
     <path d="M${x0} 92 H${x1}" stroke="#6b77ad" stroke-width="2.6" stroke-linecap="round"/>
     ${[0,5,10,15].map(m=>`<path d="M${at(m)} 86 V98" stroke="#8e9ac7" stroke-width="2.2" stroke-linecap="round"/>${igT(at(m),114,'3:'+String(m).padStart(2,'0'),{s:10.5,c:'#9aa6d4',w:700})}`).join('')}
     ${mk.map((m,i)=>`<g class="sn-mark" style="--d:${(i*.3).toFixed(2)}s"><path d="M${at(m)} 92 V56" stroke="${IG.gold}" stroke-width="2.6" stroke-linecap="round"/><circle cx="${at(m)}" cy="50" r="8" fill="${IG.gold}"/>${igT(at(m),54,String(i+1),{s:11,c:'#5c4208',w:800})}</g>`).join('')}
     <path d="M${at(2)} 128 V134 H${at(11)} V128" stroke="#5ee6d6" stroke-width="2.2" fill="none" stroke-linejoin="round"/>
     ${igT(150,26,'nine minutes',{s:13,c:'#5ee6d6',w:800})}`,'Three order times inside the same nine minutes')},

  // 15. calling the labs whose names are on the orders
  snCall:()=>igFrame(300,152,`${[0,1,2].map(i=>{const y=26+i*46;
     return `<g><rect x="12" y="${y-14}" width="56" height="34" rx="6" fill="#eef1fa" stroke="${SN.edge}" stroke-width="2"/>
      <rect x="20" y="${y-22}" width="40" height="10" rx="3" fill="#dfe4f2"/>
      ${[0,1,2].map(k=>`<rect x="${20+k*14}" y="${y-6}" width="9" height="9" rx="2" fill="#c3cde2"/>`).join('')}
      <path d="M74 ${y} H176" stroke="${IG.line}" stroke-width="2.4" stroke-dasharray="6 7" class="sn-dash" style="--d:${(i*.3).toFixed(2)}s"/>
      <g class="sn-pop" style="--d:${(i*.45).toFixed(2)}s"><rect x="180" y="${y-16}" width="68" height="32" rx="12" fill="#fff" stroke="${SN.edge}" stroke-width="2"/>
       <path d="M188 ${y+15} l-3 8 l10 -8z" fill="#fff" stroke="${SN.edge}" stroke-width="2" stroke-linejoin="round"/>
       ${sn_cross(214,y,.8)}</g></g>`}).join('')}
     <g transform="translate(262 78) scale(.85)"><path d="M-12 -16 q4 -5 9 -2 l5 7 q2 3 -2 6 l-3 2 q4 9 12 13 l2 -3 q3 -4 6 -1 l6 6 q3 4 -2 8 q-10 7 -23 -5 q-13 -12 -10 -31z" fill="${IG.teal}"/></g>`,'Three calls to three named labs, each answering no'),

  // 16. a guess on one pan, evidence on the other
  snEvidence:()=>igFrame(300,152,`
     <rect x="142" y="42" width="16" height="92" rx="4" fill="#c7cde0"/><ellipse cx="150" cy="136" rx="40" ry="7" fill="#b7bfd6"/>
     <g class="sn-tip" style="transform-origin:150px 44px">
      <path d="M72 44 H228" stroke="#9aa2bd" stroke-width="6" stroke-linecap="round"/>
      <g transform="translate(72 44)"><path d="M0 0 V22" stroke="#9aa2bd" stroke-width="2.4"/><path d="M-26 22 H26 L18 38 H-18Z" fill="#edeffa" stroke="#9aa2bd" stroke-width="2.4" stroke-linejoin="round"/>
       <g transform="translate(0 -22)"><path d="M-20 0 a20 14 0 1 1 40 0 a20 14 0 1 1 -40 0Z" fill="#fff" stroke="${SN.edge}" stroke-width="2"/>${igT(0,5,'?',{s:16,c:IG.soft,w:800})}</g></g>
      <g transform="translate(228 44)"><path d="M0 0 V22" stroke="#9aa2bd" stroke-width="2.4"/><path d="M-26 22 H26 L18 38 H-18Z" fill="#edeffa" stroke="#9aa2bd" stroke-width="2.4" stroke-linejoin="round"/>
       ${[0,1,2].map(k=>`<g transform="translate(${k%2?2:-2} ${12-k*9})">${sn_card(0,0,38,13,{r:3,sw:1.6})}${sn_sig(-13,1,.55,IG.blue)}</g>`).join('')}</g></g>
     ${igT(72,148,'a guess',{s:11.5,c:IG.soft,w:800})}${igT(228,148,'evidence',{s:11.5,c:IG.blue,w:800})}`,'A balance tipping from a guess towards evidence'),

  // 17. who does what: the AI flags, a person checks the hold, only a person signs a block
  snWhoDecides:()=>{const col=(x,label,who,mid,icons)=>`<g transform="translate(${x} 0)">
     <rect x="-45" y="14" width="90" height="122" rx="14" fill="#fff" stroke="${SN.edge}" stroke-width="2.4"/>
     ${igT(0,38,label,{s:14,w:800})}<g transform="translate(0 64)">${mid}</g>
     <path d="M-32 88 H32" stroke="${IG.line}" stroke-width="2"/>
     <g transform="translate(0 112)">${icons}</g>${igT(0,130,who,{s:10,c:IG.soft,w:800})}</g>`;
    return igFrame(300,150,`
     ${col(52,'Flag','the AI alone',`<g class="sn-flagwave"><path d="M-9 8 v-20" stroke="#8d96ad" stroke-width="2.2" stroke-linecap="round"/><path d="M-8 -13 q13 3 19 7 q-8 4 -19 6z" fill="${IG.gold}"/></g>`,sn_ai(0,8,.62))}
     ${col(150,'Hold','AI + a check',`${sn_card(0,-2,42,18,{r:5,sw:1.8,hold:true})}`,`${sn_ai(-17,8,.56)}${sn_head(17,4,.56)}${sn_check(0,-2,.5)}`)}
     ${col(248,'Block','only a person',`${sn_sig(-21,-4,1.05,IG.blue)}<path d="M-24 10 H24" stroke="${IG.line}" stroke-width="2"/>`,sn_head(0,4,.72,IG.violet,'#d8a97f'))}`,
     'Three jobs sorted: the AI flags, the AI holds and a person checks, only a person blocks')},
  // 18. cleverness at a door that only opens for a signature
  snDoor:()=>igFrame(300,150,`<rect width="300" height="150" rx="12" fill="${SN.wall}"/>
     <rect x="0" y="126" width="300" height="24" fill="${SN.desk}"/>
     <g class="sn-lean"><ellipse cx="86" cy="128" rx="44" ry="7" fill="${IG.ink}" opacity=".18"/>
      <path d="M44 126 C40 84 52 42 86 22 C120 42 132 84 128 126Z" fill="#3a3550" opacity=".55"/>
      <circle cx="86" cy="52" r="9" fill="#fff" opacity=".2"/>${igT(86,92,'?',{s:30,c:'#fff',w:800})}</g>
     <rect x="176" y="18" width="104" height="108" rx="10" fill="#e9eef9" stroke="#b9c3d8" stroke-width="3"/>
     <rect x="188" y="30" width="80" height="48" rx="6" fill="#fff" stroke="${SN.edge}" stroke-width="2"/>
     ${sn_sig(200,56,.9,IG.blue)}<path d="M192 68 H264" stroke="${IG.line}" stroke-width="2"/>
     ${sn_lock(228,100,1.15)}
     <path d="M176 126 V18" stroke="#9aa6c0" stroke-width="3"/>`,'A clever shadow at a door that only opens for a signature'),

  // 19. one warning reaching every phone, and the hospital opening early
  snEarlyWarning:()=>igFrame(300,150,`<rect width="300" height="150" rx="12" fill="${SN.glass}"/>
     <rect y="118" width="300" height="32" fill="#dde6f2"/>
     ${[[14,74,36],[58,60,30],[96,84,26],[130,54,32],[172,78,30],[212,66,28]].map(([x,y,w],i)=>`<rect x="${x}" y="${y}" width="${w}" height="${120-y}" rx="4" fill="${i%2?'#dfe6f3':'#e9eef8'}" stroke="#cfd8e8" stroke-width="1.6"/>`).join('')}
     <g transform="translate(146 54)">${[0,1,2].map(i=>`<circle r="${16+i*16}" fill="none" stroke="${IG.green}" stroke-width="2.6" class="sn-breathe" style="--d:${(i*.5).toFixed(2)}s"/>`).join('')}
      <rect x="-8" y="-10" width="16" height="10" rx="3" fill="#fff" stroke="#b9c3d8" stroke-width="1.8"/><path d="M0 -10 v-8" stroke="#9aa2bd" stroke-width="2.2" stroke-linecap="round"/><circle cx="0" cy="-20" r="2.6" fill="${IG.green}"/></g>
     ${[36,78,118].map((x,i)=>`<g transform="translate(${x} 128)"><g class="sn-pop" style="--d:${(i*.35).toFixed(2)}s"><rect x="-9" y="-24" width="18" height="30" rx="5" fill="#fff" stroke="#9aa6c0" stroke-width="2"/><rect x="-6" y="-20" width="12" height="19" rx="2" fill="${IG.green}" opacity=".45"/><circle cx="0" cy="2.6" r="1.6" fill="#9aa6c0"/></g></g>`).join('')}
     <g transform="translate(252 94)"><rect x="-28" y="-30" width="56" height="54" rx="7" fill="#fff" stroke="${SN.edge}" stroke-width="2.4"/>
      <rect x="-28" y="-30" width="56" height="13" rx="6" fill="${IG.teal}"/><rect x="-28" y="-24" width="56" height="7" fill="${IG.teal}"/>
      <path d="M-5 -4 h10 v-8 h8 v10 h-8 v8 h-10 v-8 h-8 v-10 h8z" fill="${IG.coral}"/>
      <rect x="-10" y="14" width="20" height="10" rx="2" fill="#dfe6f3"/></g>
     <g class="sn-blip"><circle cx="252" cy="58" r="4" fill="${IG.green}"/></g>`,'A sensor warning reaching phones across the city while the hospital opens'),

  // 20. where these rules came from: one hard year, then the safeguards
  snWhyScreening:()=>{const st=(x,year,inner)=>`<g transform="translate(${x} 0)">${igT(0,30,year,{s:12,c:IG.soft,w:800})}<g transform="translate(0 46)">${inner}</g></g>`;
    return igFrame(300,150,`<rect width="300" height="150" rx="12" fill="#f7f4ef"/>
     <path d="M30 118 H270" stroke="${IG.line}" stroke-width="3" stroke-linecap="round"/>
     ${[52,150,248].map(x=>`<circle cx="${x}" cy="118" r="6" fill="${IG.violet}"/>`).join('')}
     <path d="M74 118 H128 M172 118 H226" stroke="${IG.violet}" stroke-width="2.4" stroke-dasharray="6 7" class="sn-dash"/>
     ${st(52,'2030',`<path d="M-13 -4 h26 v34 h-26z" fill="#fff6e0" stroke="#d8a93f" stroke-width="2.4"/><path d="M-16 -4 h32 M-16 30 h32" stroke="#d8a93f" stroke-width="2.6" stroke-linecap="round"/>
       <path d="M0 -4 v-10" stroke="#d8a93f" stroke-width="2.2" stroke-linecap="round"/>
       <g class="sn-blip"><path d="M0 22 c-6 -4 -6 -12 0 -18 c6 6 6 14 0 18z" fill="${IG.gold}"/></g>`)}
     ${st(150,'2031',`<g>${sn_card(0,12,46,36,{r:6,seal:0})}<path d="M-14 2 H14 M-14 12 H8" stroke="${IG.line}" stroke-width="2.6" stroke-linecap="round"/>${sn_check(6,22,.8)}</g>`)}
     ${st(248,'today',`${sn_printer(0,34,1.1)}<g class="sn-flagwave"><path d="M18 18 v-12" stroke="#8d96ad" stroke-width="2" stroke-linecap="round"/><path d="M19 5 q10 3 14 6 q-5 3 -14 5z" fill="${IG.gold}"/></g>`)}
     ${igT(52,140,'the Quiet Year',{s:9.6,c:IG.soft,w:800})}${igT(150,140,'the rules',{s:9.6,c:IG.soft,w:800})}${igT(248,140,'this desk',{s:9.6,c:IG.soft,w:800})}`,
     'A line from one hard year to the rules it left behind')},

  // 21. the machine is dark and the orders stay on the shelf
  snNothingMade:()=>igFrame(300,150,`<rect width="300" height="150" rx="12" fill="${SN.wall}"/>
     <rect x="0" y="122" width="300" height="28" fill="${SN.desk}"/><rect x="0" y="122" width="300" height="6" fill="${SN.deskD}"/>
     <g transform="translate(88 122) scale(2.1)"><rect x="-17" y="-14" width="34" height="19" rx="5" fill="${SN.steel}"/>
      <rect x="-17" y="-14" width="34" height="6" rx="3" fill="#e2e7f3"/><rect x="-9" y="-5" width="18" height="3.4" rx="1.7" fill="#8d96ad"/>
      <circle cx="12" cy="1.6" r="2" fill="#aab3c8" class="sn-blip"/></g>
     ${igT(88,54,'0 made',{s:15,c:IG.green,w:800})}
     <rect x="182" y="40" width="104" height="6" rx="3" fill="${SN.deskD}"/>
     <rect x="182" y="92" width="104" height="6" rx="3" fill="${SN.deskD}"/>
     ${[0,1].map(i=>sn_card(206+i*52,24,40,32,{r:5,sw:1.8,hold:true})).join('')}
     ${[0,1].map(i=>sn_card(206+i*52,76,40,32,{r:5,sw:1.8,hold:true})).join('')}`,'A dark machine and four orders still on the shelf'),

  // 22. a silver patch out west that doubles, and doubles again
  snPatch:()=>{const step=[[1,1],[2,1],[2,2],[4,2]],cell=13;
    return igFrame(300,150,`<rect width="300" height="150" rx="12" fill="#c9a97e"/>
     ${[0,1,2,3,4,5,6,7].map(i=>`<path d="M${-20+i*44} ${18+((i*37)%110)} q22 -7 44 0" stroke="#b8976c" stroke-width="3" fill="none" stroke-linecap="round"/>`).join('')}
     ${step.map(([w,h],i)=>{const x=34+i*66,y=80;
       return `<g class="sn-pop" style="--d:${(i*.55).toFixed(2)}s"><rect x="${x-w*cell/2}" y="${y-h*cell/2}" width="${w*cell}" height="${h*cell}" rx="2" fill="#d8dde8" stroke="#9aa6c0" stroke-width="1.6"/>
        ${igT(x,y+34,'×'+Math.pow(2,i),{s:12,c:'#5d4524',w:800})}</g>`}).join('')}
     ${igT(150,28,'three times this month',{s:12,c:'#5d4524',w:800})}`,'A silver patch in the desert doubling again and again')}
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
  if(kind==='overblock'){art=`<rect width="120" height="90" fill="#f4eee6"/><path d="M0 70 H120 V90 H0Z" fill="#e2d8ca"/>
    <rect x="4" y="12" width="50" height="58" rx="4" fill="#dcd4e4"/><rect x="8" y="26" width="42" height="44" rx="2" fill="#c7bfd4"/>
    ${[0,1,2,3].map(i=>`<path d="M8 ${30+i*9} h42" stroke="#b6adc6" stroke-width="2"/>`).join('')}
    <rect x="12" y="16" width="34" height="8" rx="3" fill="#9aa2bd"/>
    ${[0,1,2].map(i=>`<g class="sn-vtick" style="--d:${(i*.4).toFixed(2)}s"><rect x="${62+i*18}" y="${16+i*3}" width="14" height="18" rx="2" fill="#fff" stroke="#e3e7f3" stroke-width="1.2"/>
      <circle cx="${73+i*18}" cy="${18+i*3}" r="3.6" fill="#f5b82e"/><rect x="${71.4+i*18}" y="${16.4+i*3}" width="1.2" height="3.4" rx=".6" fill="#fff"/><rect x="${73.8+i*18}" y="${16.4+i*3}" width="1.2" height="3.4" rx=".6" fill="#fff"/></g>`).join('')}
    <g transform="translate(88 66)">${mini(0,0,{skin:'#d8a97f',shirt:'#5fc9bd',hair:'#241a14',s:.74,face:'sad'})}</g>
    <g transform="translate(34 62)">${robotBot(0,0,.4,'#6c5ce7')}</g>`}
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
    <g transform="translate(92 60)"><g class="sn-vwait"><rect x="-10" y="-12" width="20" height="14" rx="2" fill="#d6b98e" stroke="#bda079" stroke-width="1.4"/><path d="M-10 -6 h20" stroke="#bda079" stroke-width="1.4"/><circle cx="8" cy="-16" r="6" fill="#fff" stroke="#f5b82e" stroke-width="1.6"/><path d="M8 -19 v3 l2.4 1.4" stroke="#f5b82e" stroke-width="1.4" fill="none" stroke-linecap="round"/></g></g>`}
  if(kind==='watch'){art=`<rect width="120" height="90" fill="#eef0f8"/><path d="M0 74 H120 V90 H0Z" fill="#dfe3f0"/>
    ${board(4,10,56,56,[0,1,2,3].map(i=>`<text x="${14+(i%2)*26}" y="${34+Math.floor(i/2)*20}" font-size="15" font-weight="800" fill="#f5b82e" text-anchor="middle" font-family="Nunito, sans-serif" class="sn-vq" style="--d:${(i*.35).toFixed(2)}s">?</text>`).join(''))}
    <g transform="translate(88 40)"><circle r="23" fill="#fff" stroke="#8a90b0" stroke-width="3"/>
     ${[0,1,2,3,4,5,6,7,8,9,10,11].map(k=>`<circle cx="${(17*Math.sin(k*Math.PI/6)).toFixed(1)}" cy="${(-17*Math.cos(k*Math.PI/6)).toFixed(1)}" r="${k%3?.8:1.6}" fill="#8a90b0"/>`).join('')}
     <circle r="19" fill="none" stroke="#e5484d" stroke-width="3" stroke-dasharray="119" stroke-dashoffset="0" opacity=".55"/>
     <g class="sn-vhand"><path d="M0 0 V-15" stroke="#1f2340" stroke-width="2.4" stroke-linecap="round"/></g>
     <path d="M0 0 V-9" stroke="#1f2340" stroke-width="2" stroke-linecap="round"/><circle r="2.4" fill="#1f2340"/></g>`}
  return `<svg viewBox="0 0 120 90" class="vig"><clipPath id="snv${++SNV}"><rect width="120" height="90" rx="10"/></clipPath><g clip-path="url(#snv${SNV})">${art}</g></svg>`;
}
