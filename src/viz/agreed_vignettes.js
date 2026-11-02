// Future Table cards for "The Helper That Said Yes". agVignette(kind) returns an <svg viewBox="0 0 120 90" class="vig"> card,
// like vignette(kind) in art.js. A kind is "<city>-<rosa>": the city's three months (fixed, held, slip, worse, swamped, slow,
// paused) and Rosa's numbers (well, high). The East Boston triple-deckers behind Rosa show the city: warm windows, red risky
// homes, amber waiting checks, or dark windows during a pause. Animation classes (agv-*) live in src/css/agreed_vignettes.css.
let AGV_N=0;
function agvSky(city){return city==='paused'?['#1f2350','#3d4386']:city==='worse'?['#f4a99a','#ffe0bf']:['#bfe2ff','#fff3df']}
function agvBadge(city){
  if(city==='fixed')return `<circle cx="14" cy="13" r="10" fill="#fff"/><path d="${agsHeartD(14,12,6)}" fill="#ff6b7d"/><path d="M9.6 12 l3 3 l5.4 -5.4" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  if(city==='held')return `<circle cx="14" cy="13" r="10" fill="#fff"/>${agsStar(14,13,6.4,IG.gold)}<path d="M20 4 l1 2 l2 .3 l-1.5 1.4 l.4 2 l-1.9 -1 l-1.9 1 l.4 -2 l-1.5 -1.4 l2 -.3z" fill="${IG.gold}" class="agv-tw"/>`;
  if(city==='slip')return `<circle cx="14" cy="13" r="10" fill="#fff"/><g transform="translate(14 13) scale(.55)">${aghBell(0,0,1,false)}</g>`;
  if(city==='worse')return `<g class="agv-bob">${sunnyFace(14,13,8,{glow:false,spin:false,mood:'happy'})}</g><g class="agv-float">${agsHeart(28,8,3.4)}</g>`;
  if(city==='swamped')return `<circle cx="14" cy="13" r="10" fill="#fff"/>${[0,1,2,3].map(i=>`<rect x="${8+(i%2)}" y="${17-i*3.2}" width="12" height="3" rx="1" fill="${i%2?'#fff':'#eef1f8'}" stroke="#b4bbd2" stroke-width=".6"/>`).join('')}`;
  if(city==='slow')return `<circle cx="14" cy="13" r="10" fill="#fff"/><circle cx="14" cy="13" r="6.4" fill="none" stroke="${IG.red}" stroke-width="1.6"/><path d="M14 9 V13 L17 15" stroke="${IG.red}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  if(city==='paused')return `<circle cx="14" cy="13" r="10" fill="#fff" opacity=".95"/><rect x="9.6" y="8" width="3.4" height="10" rx="1" fill="#3d4386"/><rect x="15" y="8" width="3.4" height="10" rx="1" fill="#3d4386"/>`;
  return ''}
function agvHouses(city){const st=i=>city==='paused'?'dark':city==='worse'?'risk':city==='slip'?(i===1?'risk':'ok'):city==='swamped'?'wait':(city==='fixed'||city==='held')?'check':'ok';
  return [0,1,2].map(i=>aghHouse(16+i*24,74,.82,[0,3,1][i],st(i))).join('')}
function agVignette(kind){const [city,rs]=String(kind).split('-'),well=rs==='well',u='agv'+(++AGV_N),[s0,s1]=agvSky(city),night=city==='paused';
  const ground=night?'#2a2f62':'#d8dbe8',curb=night?'#3a4078':'#c3c8da';
  const stars=night?[[30,8],[52,16],[74,6],[100,10]].map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r=".9" fill="#fff" class="ig-blink" style="--d:${i*.5}s"/>`).join('')+`<path d="M84 20 a6 6 0 1 0 6 8 a5 5 0 1 1 -6 -8z" fill="#fff4cf"/>`:
    `<circle cx="${city==='worse'?62:50}" cy="${city==='worse'?30:14}" r="${city==='worse'?9:6}" fill="${city==='worse'?'#ffcf86':'#fff3b0'}" opacity=".9"/>`;
  const extra=city==='swamped'?`<g transform="translate(62 0)">${aghNurse(0,63,.62,{face:'sad'})}</g><g transform="translate(48 84)">${[0,1,2,3,4,5].map(i=>`<rect x="${-6+(i%2)}" y="${-i*2.6}" width="12" height="2.6" rx=".6" fill="#fff" stroke="#b4bbd2" stroke-width=".5"/>`).join('')}</g>`
    :city==='paused'?`<g class="agv-walk">${aghNurse(0,61,.6,{pose:'walk'})}</g>`
    :city==='slow'?`<g transform="translate(66 74)"><rect x="-10" y="-9" width="20" height="9" rx="2" fill="#fff" stroke="#9aa6c0" stroke-width=".8"/><rect x="-3" y="-7" width="6" height="2" fill="${IG.red}"/><rect x="-1" y="-9" width="2" height="6" fill="${IG.red}"/><circle cx="-5" cy="1" r="2" fill="#2a2440"/><circle cx="5" cy="1" r="2" fill="#2a2440"/><circle cx="0" cy="-12" r="2" fill="${IG.red}" class="ig-blink"/></g>`:'';
  const cup=`<g transform="translate(110 0)"><ellipse cx="0" cy="86" rx="7" ry="1.6" fill="#1f2340" opacity=".15"/><path d="M0 70 V85 M-4 85 H4" stroke="#8a6a4f" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="0" cy="69.6" rx="8" ry="2" fill="#c98e5a" stroke="#8a6a4f" stroke-width=".8"/>${aghCup(0,64.4,.36,well?'fennel':'licorice')}</g>`;
  const gauge=`<g transform="translate(104 15)"><circle r="10.5" fill="#fff" stroke="${well?IG.green:IG.red}" stroke-width="1.4"/>${agdDial(0,3.4,6.6,2.4,'agd-ndl',agdNeedle(well?.32:.88))}</g>`;
  const rosa=agdRosa(90,48,.98,{face:well?'happy':'sad'});
  const mood=well?`<g class="agv-tw">${agsSpark(78,30,2.6,IG.gold)}</g><g class="agv-tw" style="animation-delay:-1s">${agsSpark(84,22,1.8,'#fff')}</g>`:`<path d="M97.6 33 q1.6 2.4 0 3.6 q-1.6 -1.2 0 -3.6z" fill="#7fc6ff" class="agv-float"/>`;
  return `<svg viewBox="0 0 120 90" class="vig agv-${city}"><defs><linearGradient id="${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s0}"/><stop offset="1" stop-color="${s1}"/></linearGradient><clipPath id="${u}c"><rect width="120" height="90" rx="10"/></clipPath></defs>
    <g clip-path="url(#${u}c)"><rect width="120" height="90" fill="url(#${u})"/>${stars}
     <path d="M0 52 h8 v-6 h6 v6 h10 v-10 h5 v10 h40 v-4 h8 v4 h60 V74 H0Z" fill="${night?'#2e3470':'#c9d8ec'}" opacity=".7"/>
     ${agvHouses(city)}<rect x="0" y="74" width="120" height="16" fill="${ground}"/><path d="M0 74 H120" stroke="${curb}" stroke-width="1.4"/>
     ${extra}${rosa}${cup}${gauge}${mood}<g transform="translate(2 2)">${agvBadge(city)}</g></g></svg>`}
