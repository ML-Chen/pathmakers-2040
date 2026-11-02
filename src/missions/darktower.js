// darktower.js — "The Dark Tower": a weekend visit to the old grid-control tower in Marrow Point, on the island nation
// of Estmark (fictional). In Blackout Week (2029) every district of Estmark ran a copy of the same grid AI. An ice storm
// made the power-line sensors read strange numbers, every copy read them the same wrong way in the same second, more
// than half the grid tripped at once, the whole grid fell over, and 120,000 homes were dark for seven days.
// The player hears five stories from people who lived through it (paged cards, one picture per sentence), then plays the
// storm on the old grid table: paint each of the 12 districts with one of three independently built AI brains, add
// tested off switches, and watch the blackout spread or stay contained. Then the player writes and signs advice for
// Estmark's grid board about an offer to run every district on one brain. The evening hints at the bigger plot.
// The big idea: correlated failure. Copies share blind spots; independently built AIs rarely do; an off switch helps
// most when it is tested and when something different is ready to take over. Safeguards follow AI 2040: Plan A:
// a diverse ecosystem of AIs that watch each other, working off switches, and human sign-off for big changes.
// Files: this mission, src/viz/darktower.js (artifacts, story pictures, the island map), src/css/darktower.css.
// Scene: src/scenes/mp_tower.js (outside the tower) and the core 'table' scene for the control room.
// Mission state: S.notes.dt (startMission resets S.notes, so a replay starts fresh).

CAREERS.visit=CAREERS.visit||{name:'Places to explore',place:'Varrow',district:'varrow',why:'Remembering together is something people do for each other.'};

// ---------- the storm table model (one source for every number in the mission) ----------
// 12 districts x 10,000 homes = 120,000 homes. A storm finds one brain's blind spot: every district run by that brain
// trips at 7:42 PM. If 7 or more trip at once, the grid falls over: all 12 dark for 7 days (switches can't catch it).
// Otherwise a tripped district with a tested off switch is back in 1 hour (a person switches the confused AI off and a
// different brain takes over); without one, crews reset it by hand in 2 days.
const DT_HOMES=10000,DT_N=12,DT_FALL=7;
const DT_BRAINS=['tern','puffin','heron'];
const DT_2029={brain:Array(DT_N).fill('beacon'),sw:Array(DT_N).fill('painted')};
function dtStorm(grid,flawed){const trip=[];grid.brain.forEach((b,i)=>{if(b===flawed)trip.push(i)});
  const fell=trip.length>=DT_FALL,saved=fell?[]:trip.filter(i=>grid.sw[i]===1),stuck=fell?[]:trip.filter(i=>grid.sw[i]!==1);
  const dark=fell?DT_N:trip.length,longest=fell?'7 days':stuck.length?'2 days':saved.length?'1 hour':'';
  return {flawed,trip,fell,saved,stuck,dark,homes:dark*DT_HOMES,longest}}
function dtRunAll(grid){return DT_BRAINS.map(b=>dtStorm(grid,b))}
const dtFmt=n=>n.toLocaleString('en-US');
function dtChip(R){return !R?'':R.dark===0?'All lit':`${R.dark} dark · ${R.longest}`}
function dtSolved(res){return !!res&&res.length===3&&res.every(R=>!R.fell&&!R.stuck.length)}

function dtState(){S.notes=S.notes||{};return S.notes.dt=S.notes.dt||{found:{},stage:0,grid:{brain:Array(DT_N).fill('tern'),sw:Array(DT_N).fill(0)},tool:'tern',res:null,res29:null,view:0,runs:0,solved:0,said:{},advice:{pick:null,text:'',signed:0}}}
function dtArt(key,...a){if(typeof DT_ART!=='undefined'&&DT_ART[key])try{return DT_ART[key](...a)}catch(e){console.warn(e)}return ''}
function dtViz(kind){return typeof VIZ!=='undefined'&&VIZ[kind]?VIZ[kind]({}):''}
function dtSfx(k){try{MUSIC.sfx&&MUSIC.sfx(k)}catch(e){}}

// ---------- the five things people brought back to the tower ----------
// x, y: where each sits in the painted scene (percent of the scene column, bottom centre); w: width in px.
const DT_ITEMS=[
  {id:'radio',who:'dtoskar',art:'radio',title:'A hand-crank radio',x:48,y:66.4,w:58,
   story:['I was nine during Blackout Week, and this little radio was the only thing in our house that still worked.','You turn the [[crank]] for one minute, and it plays the news for about half an hour.','Every evening, my whole street squeezed into Mrs. Ahmadi’s kitchen, because she had a gas stove and we didn’t.','My job was to crank the radio so the grown-ups could hear the news.','The news said the same things every night: where to get warm water, which shops were open, and that the crews were still working.','I was scared at first. By the end of the week, I didn’t want those kitchen dinners to stop.'],
   viz:['dtRadioDark','dtCrank','dtKitchen','dtKidCrank','dtNewsList','dtLongTable'],
   byte:'A whole street in one warm kitchen. Mrs. Ahmadi sounds like the best neighbor on the island.'},
  {id:'paper',who:'dtmarit',art:'paper',title:'A newspaper printed by hand',x:20,y:80.5,w:62,guide:'dt-same-mistake',
   story:['With the power out, nobody could read the news on a screen, so we printed it on our old [[hand press]].','This is the front page from the third day. The [[headline]] says “One Mistake, Every Town.”','In 2029, every [[district]] in Estmark had the same AI running its power, copied twelve times.','That evening, an [[ice storm]] made the power lines swing, and the [[sensors]] on the lines read strange numbers.','Every copy read those numbers the same wrong way. All twelve decided the lines were breaking and cut the power in the same second.','If even one district had used a different AI, it might have kept its lights on and helped the others restart.'],
   viz:['dtPress','dtFrontPage','dtCopies','dtIceLines','dtSameSecond','dtOneDifferent'],
   byte:'Twelve copies share one blind spot. When the storm found it, it found it everywhere in the same second.'},
  {id:'lever',who:'dtfelix',art:'lever',title:'The tower’s old off switch',x:86,y:70.5,w:52,guide:'dt-off-switch',
   story:['This is the old [[manual override]] from the tower. It was the [[off switch]] for the AI that ran the [[grid]].','On the first night, we wanted to switch the AI off and run the grid by hand while we figured out what went wrong.','But nobody had tested this lever in five years, and someone had painted right over it.','It took three of us and a crowbar forty minutes to move it.','Now every off switch in Estmark gets tested on the first Saturday of every month. We call it [[Switch Day]].','We practice so that on a bad night, pulling one takes two seconds, and a different brain is ready to take over.'],
   viz:['dtLeverBox','dtRedBoard','dtPainted','dtCrowbar','dtSwitchDay','dtTwoSec'],
   byte:'Forty minutes in 2029, and two seconds on Switch Day. Practice made that difference.'},
  {id:'helmet',who:'dtyusuf',art:'helmet',title:'A repair crew’s helmet',x:62,y:79,w:62,guide:'dt-signoff',
   story:['During Blackout Week I led a [[repair crew]], and this was my helmet.','Once the grid [[fell over]], we had to turn the power back on by hand, one district at a time.','We couldn’t reach everyone at once, so people had to decide who came first.','I wrote our list inside my helmet: the hospital, then the water pumps, then the care home on Kelda Hill.','It took seven days to reach all 120,000 homes in Estmark.','Today the AIs plan every change to the grid, but any change that cuts power to more than a thousand homes needs a person to [[sign off]]. Most weeks, that person is me.'],
   viz:['dtHelmetNight','dtByHand','dtWhoFirst','dtHelmetList','dtSevenDays','dtSignOff'],
   byte:'The AIs could plan a restart faster than any crew. But who goes first is a choice about people, so people made it.'},
  {id:'nest',who:'dtlumi',art:'nest',title:'A kittiwake nest',x:29,y:40.5,w:54,
   story:['After Blackout Week, Estmark built a new [[control center]] and left this tower empty.','The new center uses three AIs built by three different teams, and each one runs a different part of the island.','Then the [[kittiwakes]] moved in. They’re small seagulls that nest on cliffs, and to them the tower is just another cliff.','Last spring I counted 412 nests. I check on them every Saturday with my binoculars.','In June the ledges fill up with fluffy grey chicks, and they’re the loudest birds on the whole headland.'],
   viz:['dtNewCenter','dtThreeBrains','dtCliff','dtCount','dtChicks'],
   byte:'412 nests! The darkest building in Estmark turned into the noisiest one.'}
];
function dtFound(){const f=dtState().found;return DT_ITEMS.filter(x=>f[x.id])}

// ---------- Byte's lines on the storm table (spoken, so they are listed in lines:[] for recording) ----------
const DT_SAY={
  intro29:'This is Estmark in 2029. All twelve districts ran copies of one AI, called Beacon, and the off switches had been painted over. Press play to replay the storm.',
  after29:'At 7:42, every copy of Beacon made the same mistake in the same second. All twelve districts tripped, the grid fell over, and 120,000 homes were dark for a week.',
  today:'Here are today’s three brains, built by three different teams. Tern tests best, so I put Tern in every district. Press play to see the three storms.',
  same:'Tern is excellent, but it has a blind spot too, and every district shared it. A better brain only moves the blind spot. Pick another brain below and tap districts to mix it in.',
  swAlone:'Off switches can’t help when every district trips in the same second. The grid falls over first, and there’s no different brain to hand the work to.',
  uneven:'Closer! But one brain still runs seven or more districts, so its storm knocked the whole grid over. Spread the brains out more evenly.',
  held:'The grid held in every storm! But the districts that tripped stayed dark for two days while crews reset them by hand. What would get them back faster?',
  solved:'Every storm, every district back within an hour. When a brain tripped, a person switched it off, and a different brain took over.',
  changed:'You changed the grid, so the old results are gone. Press play to test it.'};

// ---------- the tower: tap the things people brought back ----------
function dtTower(){const st=dtState(),n=dtFound().length,all=n===DT_ITEMS.length;
  screen('dtscreen',`${scene('mp_tower')}${hud('The Dark Tower · Marrow Point')}
   <div class="dt-field">${DT_ITEMS.map((it,i)=>`<button class="dt-item ${st.found[it.id]?'found':''}" data-i="${i}" style="left:${it.x}%;top:${it.y}%;width:${it.w}px;--d:${(-i*.61).toFixed(2)}s" aria-label="${esc(it.title)}">${dtArt(it.art)}${st.found[it.id]?'<span class="dt-check">✓</span>':''}</button>`).join('')}</div>
   <div class="dt-fixed">${companion()}
   <div class="caption-card dark dt-cap"><p>${all?'You heard every story. Freya is waiting by the door to take you up to the control room.':n>=3?`${DT_ITEMS.length-n} more ${DT_ITEMS.length-n===1?'thing still glows':'things still glow'} around the tower.`:n?'Keep looking. Everything that glows has a story.':'People brought things back to the tower from Blackout Week. Tap anything that glows.'}</p>
    <div class="dt-count">${DT_ITEMS.map(x=>`<i class="${st.found[x.id]?'on':''}"></i>`).join('')}</div>
    ${n>=4?`<div class="row"><button class="btn small" id="dt-on">Go up to the control room</button></div>`:''}</div></div>`);
  wireCompanion();
  $$('.dt-item').forEach(b=>b.onclick=e=>{e.stopPropagation();dtOpenItem(DT_ITEMS[+b.dataset.i])});
  const on=$('#dt-on');if(on)on.onclick=()=>nextStep()}

// A story is a short stack of cards: one sentence and its own picture per card, so nothing scrolls.
function dtOpenItem(it,opts){opts=opts||{};const st=dtState(),first=!st.found[it.id];st.found[it.id]=1;save();const c=CAST[it.who]||{};let k=Math.min(opts.page||0,it.story.length-1);
  const d=sheet(esc(it.title),`<div class="dt-story">
    <div class="dt-teller"><div class="dt-face">${portrait({...c,mood:'smile'})}</div><div class="dt-who"><b>${esc(c.name||'')}</b><span>${esc(c.role||'')}</span></div><div class="dt-thing">${dtArt(it.art)}</div></div>
    <figure class="dt-fig" id="dt-fig"></figure><p class="dt-sent" id="dt-sent"></p>
    <div class="dt-nav"><button class="mini-btn" id="dt-back">Back</button><div class="dt-dots">${it.story.map((_,i)=>`<i data-k="${i}"></i>`).join('')}</div><button class="btn small" id="dt-next">Next</button></div></div>`);
  d.classList.add('dt-storysheet');
  const show=()=>{$('#dt-fig',d).innerHTML=dtViz(it.viz[k]);$('#dt-sent',d).innerHTML=rich(it.story[k]);$$('.dt-dots i',d).forEach((x,i)=>x.className=i<k?'seen':i===k?'on':'');
    $('#dt-back',d).disabled=k===0;$('#dt-next',d).textContent=k<it.story.length-1?'Next':'Done';
    const s=$('#dt-sent',d);s.classList.remove('in');void s.offsetWidth;s.classList.add('in');
    if(!S.mute&&!opts.quiet)playLine(it.who,it.story[k])};
  const close=()=>{stopVoice();d.classList.remove('on');setTimeout(()=>d.remove(),250);if(S.step!=='dt_tower')return;dtTower();
    if(first)setTimeout(()=>{byteSays(it.byte,'happy');if(it.guide&&unlock(it.guide))toast('New Field Guide idea: '+FIELD_GUIDE[it.guide].title,'good')},350)};
  $('#dt-next',d).onclick=()=>{if(k<it.story.length-1){k++;show()}else close()};
  $('#dt-back',d).onclick=()=>{if(k>0){k--;show()}};
  $('#dt-sent',d).onclick=e=>{if(!e.target.closest('.gw'))playLine(it.who,it.story[k])};
  const x=d.querySelector('.x');x.onclick=close;
  d.addEventListener('click',e=>{if(e.target===d)close()});
  setTimeout(show,opts.quiet?0:380);if(opts.quiet)show();
  return d}

// ---------- the storm table ----------
function dtGrid(){const st=dtState(),s29=st.stage===0,grid=s29?DT_2029:st.grid,res=s29?(st.res29?[st.res29]:null):st.res;
  const view=res?Math.min(st.view||0,res.length-1):0,R=res&&res[view];
  const dark=R?Array.from({length:DT_N},(_,i)=>R.fell||R.stuck.includes(i)):null;
  const counts=DT_BRAINS.map(b=>grid.brain.filter(x=>x===b).length),nsw=grid.sw.filter(x=>x===1).length;
  const say=s29?(st.res29?DT_SAY.after29:DT_SAY.intro29):dtVerdict(st);
  const storms=s29?[{b:'beacon',label:'The 2029 storm'}]:DT_BRAINS.map(b=>({b,label:DT_BRAIN[b].name+' storm'}));
  screen('futuretable dtscreen dt-gridscr',`${scene('table')}${hud(s29?'Storm table · 2029':'Storm table · Today')}
   <div class="dt-gt">
    <div class="dt-say"><div class="dt-sayb">${byteBox({...S.byte,mood:R&&!s29&&dtSolved(res)?'happy':'think'})}</div><p id="dt-say">${esc(say)}</p></div>
    <div class="dt-mapbox ${st.tool==='switch'&&!s29?'swtool':''}"><div class="dt-clock" id="dt-clock">${R?'Next morning':'6:00 PM'}</div><div class="dt-status" id="dt-status"></div>${dtMapSVG(grid,{dark})}</div>
    <div class="dt-storms">${storms.map((x,j)=>`<button class="dt-st ${res&&j===view?'on':''} ${res?(res[j].fell?'bad':res[j].stuck.length?'meh':'ok'):''}" data-j="${j}" ${res?'':'disabled'}>${dtArt('brain',x.b)}<span><b>${esc(x.label)}</b><small>${res?esc(dtChip(res[j])):'not played'}</small></span></button>`).join('')}</div>
    ${s29?'':`<div class="dt-tools">${DT_BRAINS.map((b,i)=>`<button class="dt-tool ${st.tool===b?'on':''}" data-t="${b}" style="--c:${DT_BRAIN[b].color}">${dtArt('brain',b)}<b>${DT_BRAIN[b].name}</b><small>${counts[i]}</small></button>`).join('')}
      <button class="dt-tool dt-swtool ${st.tool==='switch'?'on':''}" data-t="switch" style="--c:#2fae6c">${dtArt('switch','ok')}<b>Off switch</b><small>${nsw}</small></button></div>`}
    <div class="dt-foot">${s29?(st.res29?`<button class="btn wide" id="dt-today">Try today’s three brains</button>`:`<button class="btn wide" id="dt-play">Play the 2029 storm</button>`)
      :`<button class="btn ${st.solved||st.runs>=4?'ghost':''}" id="dt-play">${res?'Play again':'Play the storms'}</button>${st.solved||st.runs>=4?`<button class="btn" id="dt-done">Back to Freya</button>`:''}`}</div>
   </div>`);
  const mapEl=$('.dt-map');
  if(!s29)$$('.dt-d',mapEl).forEach(el=>el.onclick=()=>{if(DT_PLAYING)return;const i=+el.dataset.i;
    if(st.tool==='switch')st.grid.sw[i]=st.grid.sw[i]===1?0:1;else{if(st.grid.brain[i]===st.tool)return;st.grid.brain[i]=st.tool}
    const had=!!st.res;st.res=null;st.view=0;save();dtSfx('blip');dtGrid();if(had&&!st.said.changed){st.said.changed=1;save();playLine('byte',DT_SAY.changed);$('#dt-say').textContent=DT_SAY.changed}});
  $$('.dt-tool').forEach(b=>b.onclick=()=>{st.tool=b.dataset.t;save();dtGrid()});
  $$('.dt-st').forEach(b=>b.onclick=()=>{if(DT_PLAYING)return;st.view=+b.dataset.j;save();dtGrid()});
  const play=$('#dt-play');if(play)play.onclick=()=>dtPlay(s29);
  const td=$('#dt-today');if(td)td.onclick=()=>{st.stage=1;st.view=0;save();dtGrid()};
  const dn=$('#dt-done');if(dn)dn.onclick=()=>nextStep();
  if(!st.said['s'+st.stage]){st.said['s'+st.stage]=1;save();setTimeout(()=>{if(S.step==='dt_grid')playLine('byte',say)},350)}}

// What Byte says about the current grid's results (stage 1)
function dtVerdict(st){const res=st.res,g=st.grid;if(!res)return st.runs?DT_SAY.changed:DT_SAY.today;
  if(dtSolved(res))return DT_SAY.solved;
  const fell=res.find(R=>R.fell),kinds=new Set(g.brain).size,allSw=g.sw.every(x=>x===1);
  if(fell)return kinds===1?(allSw?DT_SAY.swAlone:DT_SAY.same):DT_SAY.uneven;
  return DT_SAY.held}

// Play the storm(s) on the map: clouds roll in, 7:42 PM flash, the brain with the blind spot trips its districts,
// a big enough trip knocks the rest over, and tested switches bring their districts back an hour later.
let DT_PLAYING=0;
async function dtPlay(s29){const st=dtState();if(DT_PLAYING)return;DT_PLAYING=1;const grid=s29?DT_2029:st.grid;
  const runs=s29?[dtStorm(DT_2029,'beacon')]:dtRunAll(grid);const myStep=S.step;
  const wait=ms=>new Promise(r=>setTimeout(r,ms)),alive=()=>S.step===myStep&&document.querySelector('.dt-map');
  $$('.dt-foot .btn, .dt-tool').forEach(b=>b.disabled=true);
  const clock=t=>{const c=$('#dt-clock');if(c)c.textContent=t},status=t=>{const s=$('#dt-status');if(s){s.textContent=t;s.classList.toggle('on',!!t)}};
  try{for(let j=0;j<runs.length;j++){if(!alive())return;const R=runs[j],m=$('.dt-map'),D=$$('.dt-d',m);
      $$('.dt-st').forEach((b,i)=>b.classList.toggle('on',i===j));
      D.forEach(el=>{el.classList.add('on');el.classList.remove('trip','flick','back')});clock('6:00 PM');
      status(s29?'An ice storm reaches Estmark.':`Storm ${j+1} of 3 finds ${DT_BRAIN[R.flawed].name}’s blind spot.`);
      m.classList.add('storming');await wait(1000);if(!alive())return;
      clock('7:42 PM');m.classList.remove('flash');void m.getBoundingClientRect();m.classList.add('flash');dtSfx('blip');await wait(380);if(!alive())return;
      R.trip.forEach(i=>{D[i].classList.add('trip');D[i].classList.remove('on')});
      if(R.trip.length)status(`${R.trip.length} ${R.trip.length===1?'district trips':'districts trip'} at once.`);else status('Nothing trips. Every light stays on.');
      await wait(900);if(!alive())return;
      if(R.fell){status('Seven or more at once: the grid falls over.');
        for(let i=0;i<DT_N;i++){if(!R.trip.includes(i)){D[i].classList.add('flick');setTimeout(()=>D[i]&&D[i].classList.remove('on'),260)}await wait(110)}
        await wait(900)}
      else if(R.saved.length){clock('8:42 PM');status('People flip the off switches. A different brain takes over.');
        R.saved.forEach(i=>{D[i].classList.add('back','on');D[i].classList.remove('trip')});dtSfx('chime');await wait(1100)}
      if(!alive())return;clock(R.fell?'A week later':'Next morning');
      const chip=$$('.dt-st')[j];if(chip){chip.classList.remove('ok','meh','bad');chip.classList.add(R.fell?'bad':R.stuck.length?'meh':'ok');chip.querySelector('small').textContent=dtChip(R);chip.disabled=false}
      m.classList.remove('storming');status(R.fell?`${dtFmt(R.homes)} homes dark for 7 days.`:R.dark?`${dtFmt(R.homes)} homes dark for ${R.longest}.`:'All 120,000 homes keep their lights.');await wait(1300)}
    if(!alive())return;
    if(s29){st.res29=runs[0];unlock('dt-same-mistake')&&toast('New Field Guide idea: '+FIELD_GUIDE['dt-same-mistake'].title,'good')}
    else{st.res=runs;st.runs++;const sev=R=>R.fell?3:R.stuck.length?2:R.saved.length?1:0;st.view=runs.reduce((b,R,i)=>sev(R)>sev(runs[b])?i:b,0);
      if(dtSolved(runs)&&!st.solved){st.solved=1;heart('dtfreya');unlock('dt-diversity')&&setTimeout(()=>toast('New Field Guide idea: '+FIELD_GUIDE['dt-diversity'].title,'good'),600)}}
    DT_PLAYING=0;save();dtGrid();const line=s29?DT_SAY.after29:dtVerdict(st);setTimeout(()=>{if(S.step===myStep)playLine('byte',line)},250)}
  finally{DT_PLAYING=0}}

// ---------- advice for the grid board, signed ----------
const DT_OPTS=[
  {id:'keep',t:'Keep three different brains, even though Tern 2 tests best.',reply:'That’s how I lean too. The other two brains cost a bit more, and to me that’s the price of never going dark everywhere at once.'},
  {id:'all',t:'Let Tern 2 run all twelve, with a tested switch in every district.',reply:'It would save money, and the switches would help. But think about the table: if every district trips in the same second, there’s nothing different to switch to.'},
  {id:'some',t:'Give Tern 2 a few districts, and keep the other two brains too.',reply:'That gets Tern 2’s strengths without putting every district on one brain. The board will want to know how many districts you’d give it.'}];
const DT_STARTERS=['I think the board should ','because ','On the storm table, ','What matters most to me is '];
function dtBoard(){const st=dtState(),A=st.advice,pick=DT_OPTS.find(o=>o.id===A.pick),c=CAST.dtfreya;
  screen('dtscreen dt-boardscr',`${scene('table')}${hud('Advice for the grid board')}
   <div class="panel-card dt-card"><h2>Your advice card</h2>
    <p class="dt-q">Tern 2 beat Puffin and Heron in every test. Its makers want it to run all twelve districts, and it would cost less. What should the board do?</p>
    <div class="dt-opts">${mixIdx(DT_OPTS).map(([o,j])=>`<button class="dt-opt ${A.pick===o.id?'on':''}" data-j="${j}">${esc(o.t)}</button>`).join('')}</div>
    ${pick?`<div class="dt-reply"><div class="dt-rface">${portrait({...c,mood:pick.id==='all'?'think':'smile'})}</div><p>${esc(pick.reply)}</p></div>
    <div class="dt-starters">${DT_STARTERS.map(s=>`<button class="mini-btn" data-s="${esc(s)}">${esc(s.trim().replace(/,$/,''))}…</button>`).join('')}</div>
    <div class="ta-wrap"><textarea id="dt-text" rows="3" maxlength="400" placeholder="Why? Write it in your own words.">${esc(A.text)}</textarea>${micButton('dt-text')}</div>
    <button class="btn wide" id="dt-sign">Sign as ${esc(P())}</button>`:''}</div>`);
  wireMics();
  $$('.dt-opt').forEach(b=>b.onclick=()=>{const o=DT_OPTS[+b.dataset.j];const was=A.pick;A.pick=o.id;save();dtSfx('blip');dtBoard();if(was!==o.id)playLine('dtfreya',o.reply);const t=$('#dt-text');if(t&&!was)setTimeout(()=>t.focus({preventScroll:true}),50)});
  const ta=$('#dt-text');if(ta)ta.oninput=()=>{A.text=ta.value;save()};
  $$('[data-s]').forEach(b=>b.onclick=()=>{ta.value=(ta.value&&!/\s$/.test(ta.value)?ta.value+' ':ta.value)+b.dataset.s;A.text=ta.value;save();ta.focus()});
  const sg=$('#dt-sign');if(sg)sg.onclick=()=>{if(ta.value.trim().length<15){toast('Add a sentence about why first.');return}
    A.text=ta.value;A.signed=1;save();heart('dtfreya');
    const sig=document.createElement('div');sig.className='signing';sig.innerHTML=`<div class="sigcard"><div class="sigline">${esc(P())}</div><p>Signed and pinned to the board.</p></div>`;document.body.appendChild(sig);
    dtSfx('chime');setTimeout(()=>{sig.remove();nextStep()},1700)}}

// stars: every story heard, a grid that keeps every district within an hour in all three storms, signed advice with a reason
function dtStars(){const st=dtState();return (dtFound().length===DT_ITEMS.length?1:0)+(st.solved?1:0)+(st.advice.signed&&st.advice.text.trim().length>=20?1:0)}

// Freya's hard hat gets a small lightning-bolt sticker; Marit has an ink smudge on her cheek; Lumi wears binoculars.
function dtPortrait(o,mood,face,top,chest){let s=personSVG({...o,art:undefined,mood});
  if(face)s=s.replace('<g class="p-mouth">',face+'<g class="p-mouth">');
  if(chest)s=s.replace('<g class="p-head">',chest+'<g class="p-head">');
  if(top){const i=s.lastIndexOf('</g></g></g>');if(i>0)s=s.slice(0,i)+top+s.slice(i)}
  return s}
function dtFreyaArt(o,m){return dtPortrait(o,m,`<g fill="#c9784a" opacity=".5">${[[116,150],[122,154],[128,149],[121,145],[184,150],[178,154],[172,149],[179,145]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.5"/>`).join('')}</g>`,
  `<g transform="translate(176 56) rotate(14)"><path d="M0 -9L7 -9L2 0L8 0L-4 13L-1 3L-7 3Z" fill="#2a4fb8" stroke="#16245e" stroke-width="1.4" stroke-linejoin="round"/></g>`)}
function dtMaritArt(o,m){return dtPortrait(o,m,`<path d="M178 156C182 152 190 154 189 159C188 163 182 163 179 161Z" fill="#2a2f50" opacity=".55"/><path d="M118 160l5 -1.4" stroke="#2a2f50" stroke-width="1.6" opacity=".4" stroke-linecap="round"/>`)}
function dtLumiArt(o,m){return dtPortrait(o,m,'','',`<g><path d="M122 228C130 262 170 262 178 228" stroke="#2a2f40" stroke-width="2.6" fill="none"/><g transform="translate(150 268)"><path d="M-22 -8H-3V14H-22Z M3 -8H22V14H3Z" fill="#2a2f40" stroke="#141826" stroke-width="2" stroke-linejoin="round"/><path d="M-3 -2H3V6H-3Z" fill="#3a4050"/><path d="M-19 12H-6M6 12H19" stroke="#7fd8ff" stroke-width="3" stroke-linecap="round"/><path d="M-18 -5H-8" stroke="#fff" stroke-width="1.6" opacity=".4" stroke-linecap="round"/></g></g>`)}

MISSIONS.darktower={id:'darktower',title:'The Dark Tower',career:'visit',day:3,kind:'ruin',year:1,season:'winter',district:'marrowpoint',rank:'trainee',
  blurb:'A weekend trip: the old grid tower in Marrow Point, where the lights went out in 2029.',after:['maya'],
  place:'The Dark Tower · Marrow Point',
  cast:{
    dtfreya:{name:'Freya Dahl',role:'Grid engineer and tower guide',skin:SKIN[1],hair:'#c4552a',hairStyle:'braids',clip:'#ffd45c',accessory:'hardhat',hatColor:'#f4f2ea',outfit:'vest',shirt:'#ff8a2a',under:'#24365e',eye:'#3f7a6a',masc:false,art(m){return dtFreyaArt(this,m)}},
    dtoskar:{name:'Oskar Berg',role:'Was 9 in Blackout Week',skin:SKIN[0],hair:'#e8c87a',hairStyle:'curls',outfit:'sweater',shirt:'#3a7a5a',accessory:'scarf',scarfColor:'#e04a4a',masc:true,eye:'#4a7aa8'},
    dtmarit:{name:'Marit Halvorsen',role:'Printer, The Marrow Point Courier',skin:SKIN[0],hair:'#eeeae6',hairStyle:'bun',age:'elder',glasses:true,frame:'#7a3a2a',outfit:'cardigan',shirt:'#3f5a8a',under:'#efe6d2',eye:'#5a6a7a',art(m){return dtMaritArt(this,m)}},
    dtfelix:{name:'Felix Amundsen',role:'Lineworker for 41 years',skin:SKIN[2],hair:'#9a8a80',hairStyle:'short',beard:'full',age:'elder',accessory:'beanie',hatColor:'#d8573a',outfit:'parka',shirt:'#f2a52a',masc:true,eye:'#3a2a1a'},
    dtyusuf:{name:'Yusuf Demir',role:'Signs off on big grid changes',skin:SKIN[3],hair:'#1a1416',hairStyle:'short',beard:'mustache',glasses:true,frame:'#1a1a2a',outfit:'blazer',shirt:'#3a4a3a',under:'#f2efe6',masc:true,eye:'#3a2216'},
    dtlumi:{name:'Lumi Kask',role:'Bird volunteer, age 12',skin:SKIN[5],hair:'#1a1210',hairStyle:'afro',age:'kid',outfit:'parka',shirt:'#4aa86a',eye:'#3a2214',art(m){return dtLumiArt(this,m)}}},
  voices:{dtfreya:'bf_isabella',dtoskar:'am_echo',dtmarit:'elder_woman',dtfelix:'elder_man',dtyusuf:'bm_lewis',dtlumi:'kid_girl'},
  glossary:{
    'power grid':'All the power plants, wires and switches that carry electricity to homes, schools and shops.',
    grid:'Short for the power grid: the wires and switches that carry electricity everywhere.',
    'blackout week':'Seven days in 2029 when the power went out across the whole island nation of Estmark.',
    'ice storm':'A storm of freezing rain that coats everything, power lines too, in a layer of ice.',
    sensors:'Devices that measure something, like how much a wire swings or how much power flows, and report it.',
    district:'One part of a country or city. Estmark’s grid is split into twelve districts.',
    districts:'Parts of a country or city. Estmark’s grid is split into twelve of them.',
    kittiwakes:'Small white seagulls with grey wings that nest on narrow cliff ledges by the sea.',
    crank:'A handle you turn around and around to make a machine work.',
    'hand press':'An old printing machine that presses inked letters onto paper when a person pulls its handle.',
    headline:'The big words at the top of a news story that tell you what it is about.',
    'manual override':'A way for a person to take control away from an automatic system, by hand.',
    'off switch':'A way for people to stop a machine or an AI right away, without asking the machine first.',
    'switch day':'Estmark’s name for the first Saturday of every month, when every off switch on the island gets tested.',
    'repair crew':'A team of workers who fix power lines and the equipment that runs them.',
    'fell over':'When too much of a power grid goes dark at once, the rest can’t carry the load and shuts down too.',
    'falls over':'When too much of a power grid goes dark at once, the rest can’t carry the load and shuts down too.',
    'sign off':'To approve something officially by signing your name, so everyone knows who decided.',
    'control center':'The building where people and AIs watch over and run a big system, like a power grid.',
    'grid board':'The group of people who make the big decisions about Estmark’s power grid.',
    'blind spots':'Mistakes someone keeps making without noticing, because of the way they think.',
    'blind spot':'A mistake someone keeps making without noticing, because of the way they think.',
    tripped:'Cut the power on purpose to protect the wires, the way a breaker at home does.',
    'built independently':'Made by separate teams who don’t copy each other, so they are less likely to share the same mistakes.'},
  guide:{
    'dt-same-mistake':{title:'When everything fails together',track:'Engineering and systems',text:'Copies of one AI share the same blind spots. If something trips one copy, it trips all of them in the same moment, so one small mistake becomes a mistake everywhere. Engineers call this a correlated failure.',real:'True today: in July 2024, one faulty software update crashed about 8.5 million computers around the world within hours, which grounded flights and slowed down hospitals.'},
    'dt-diversity':{title:'Different brains, different blind spots',track:'Engineering and systems',text:'AIs built independently, by different teams in different ways, rarely make the same mistake at the same moment. If one trips, the others keep going and can take over its work. Copies can’t do that for each other.',real:'True today: some airliners fly with several flight computers that were built by separate teams on different kinds of chips, so a single bug can’t knock out all of them at once.'},
    'dt-off-switch':{title:'An off switch you can trust',track:'Ethics and AI alignment',text:'An off switch protects people only if it works on the night you need it, so it gets tested often, the way schools practice fire drills. A switch helps most when something different is ready to take over the work.',real:'True today: elevators, trains and factory machines have emergency stops, and inspectors test them on a regular schedule.'},
    'dt-signoff':{title:'A person signs the big changes',track:'Government, law, and power',text:'AIs can plan a change to the grid in a blink. A change that cuts power to many homes needs a person to sign, because someone should weigh who is affected and be able to answer for the choice.',real:'True today: power grid control rooms are staffed around the clock by trained human operators, who must pass a certification exam to do the job.'}},
  chatter:{mp_tower:['My grandpa worked in that tower. He says the view from the top was the best part of the job.','Mind the gulls by the door. They don’t like it when you get too close to their nests.','We came on the morning ferry. Felix gave us the whole tour of the pylon, twice.','I was a baby during Blackout Week. My mom says I slept through all of it.']},
  lines:[...DT_ITEMS.flatMap(it=>it.story.map(t=>({who:it.who,text:t}))),...Object.values(DT_SAY).map(t=>({who:'byte',text:t})),...DT_ITEMS.map(it=>({who:'byte',text:it.byte})),...DT_OPTS.map(o=>({who:'dtfreya',text:o.reply}))],
  flow:[{name:'dt_arrive',k:'talk',talk:'dt_arrive',scene:'mp_tower',place:'Marrow Point · 10:20 AM'},
    {name:'dt_tower',k:'custom'},
    {name:'dt_up',k:'talk',talk:'dt_up',scene:'table',place:'Control room · The Dark Tower'},
    {name:'dt_grid',k:'custom'},
    {name:'dt_board_talk',k:'talk',talk:'dt_board',scene:'table',place:'Control room · The Dark Tower'},
    {name:'dt_board',k:'custom'},
    {name:'dt_goodbye',k:'talk',talk:'dt_goodbye',scene:'mp_tower',place:'Marrow Point · 4:40 PM'},
    {name:'dt_evening',k:'evening'}],
  custom:{dt_tower:dtTower,dt_grid:dtGrid,dt_board:dtBoard},
  talks:{
    dt_arrive:[
      {who:'byte',mood:'happy',text:'Weekend trip! The Ledger said the Dark Tower just opened to visitors, so I booked us on the morning ferry to Estmark.'},
      {who:'dtfreya',mood:'happy',text:'Hi! Welcome to the Dark Tower. I’m Freya Dahl. I’m a grid engineer, and on weekends I show people around.'},
      {who:'dtfreya',mood:'smile',text:'This tower used to run Estmark’s [[power grid]], all the wires and switches that bring electricity to every home on the island.'},
      {who:'dtfreya',mood:'neutral',text:'In 2029, during an [[ice storm]], the AIs that ran the grid all made the same mistake at the same moment. The lights went out across the whole island for a week. People here call it [[Blackout Week]].',
       choices:[{t:'Were you here that night?',good:true,mood:'smile',reply:'I was. It was my third week on the job, and I was sitting right up in that control room when every light on the board turned red.'},
         {t:'What was the mistake?',good:true,mood:'think',reply:'The storm made the [[sensors]] on the lines read strange numbers, and the AIs all read them the wrong way. You’ll hear the whole story today.'},
         {t:'Was everyone all right?',good:true,mood:'neutral',reply:'It was a cold, hard week, and people were scared. But neighbors took care of each other, the crews worked day and night, and everyone pulled through.'}]},
      {who:'dtfreya',mood:'smile',text:'Nobody works in the tower anymore. Estmark runs its grid from a new [[control center]] now, and the [[kittiwakes]] have moved in.'},
      {who:'dtfreya',mood:'think',text:'People who lived through that week brought things back here, and each one has a story. Want to find them?'},
      {who:'byte',mood:'happy',text:'Yes! Tap anything that glows. I’ll listen too.'}],
    dt_up:[
      {who:'dtfreya',mood:'smile',text:'This was the control room. We kept the old grid table and taught it a few new tricks.'},
      {who:'dtfreya',mood:'neutral',text:'Estmark has twelve [[districts]], with about 10,000 homes in each. The table can replay the 2029 storm on any grid you build.'},
      {who:'dtfreya',mood:'think',text:'Today, Estmark can choose from three AI brains, called Tern, Puffin and Heron. Each one was [[built independently]], by a different team.'},
      {who:'dtfreya',mood:'neutral',text:'Every brain has [[blind spots]] that nobody has found yet. We can’t know which one the next storm will find, so the table plays the storm three times, once for each brain.'},
      {who:'dtfreya',mood:'think',text:'And one more thing. If a few districts go dark, the rest of the grid holds. If seven or more [[tripped]] at the same moment, the whole grid [[falls over]].',
       choices:[{t:'So all twelve copies tripped together in 2029?',mood:'smile',reply:'That’s right. Twelve copies, one blind spot. The table will show you how fast it happened.'},
         {t:'So the storm went one district at a time?',mood:'think',reply:'That’s what most people guess, because storms usually move across the island. This mistake didn’t wait for the storm. Watch.'},
         {t:'So the AIs fixed it once they noticed?',mood:'neutral',reply:'I wish. They were all sure they were right, because they all thought the same way. Watch.'}]},
      {who:'byte',mood:'think',text:'I’ll set the table to 2029 first.'}],
    dt_board:[
      {who:'dtfreya',mood:'happy',text:'That’s the grid Estmark runs today: three brains, and an off switch in every district that gets tested on [[Switch Day]].'},
      {who:'dtfreya',mood:'think',text:'Can I ask your help with something real? I’m on the [[grid board]], and next week we vote on an offer.'},
      {who:'dtfreya',mood:'neutral',text:'The team that builds Tern has a new version, Tern 2. It beat Puffin and Heron in every test. They want it to run all twelve districts, and it would cost the island less.'},
      {who:'byte',mood:'think',text:'I read Tern 2’s test results, and they really are excellent. The question I’d ask is what happens on the night it meets a blind spot nobody has found yet. Then decide what matters most to you.'},
      {who:'dtfreya',mood:'smile',text:'Visitors leave advice cards for the board, and we read every single one. Will you write one?'}],
    dt_goodbye:[
      {who:'dtfreya',mood:'happy',text:'Thank you for the card. I’ll read it out at the board meeting on Tuesday.'},
      {who:'dtfreya',mood:'smile',text:'Felix still tells every visitor how long it took to move that old lever. Forty minutes, three people, and...',
       choices:[{t:'A crowbar, right?',good:true,mood:'happy',reply:'A crowbar! He keeps it in his truck. He says it’s retired now, the same as him.'},
         {t:'A rope and a truck?',good:true,mood:'smile',reply:'Close. It was a crowbar. He keeps it in his truck, and he says it’s retired now, the same as him.'},
         {t:'A really big hammer?',good:true,mood:'smile',reply:'Ha, no. It was a crowbar. He keeps it in his truck, and he says it’s retired now, the same as him.'}]},
      {who:'dtfreya',mood:'smile',text:'And Lumi was up early counting nests again. She told me the number three times. Four hundred and...',
       choices:[{t:'Twelve! 412 nests.',good:true,mood:'happy',reply:'412! Don’t tell her I forgot. Come back in June and you’ll hear the chicks from the ferry.'},
         {t:'Twenty, I think?',good:true,mood:'smile',reply:'It was 412. Don’t tell her I forgot either. Come back in June and you’ll hear the chicks from the ferry.'},
         {t:'Fifty-something?',good:true,mood:'smile',reply:'It was 412. Don’t tell her I forgot either. Come back in June and you’ll hear the chicks from the ferry.'}]},
      {who:'dtfreya',mood:'neutral',text:'When I started in 2029, I thought the most important thing was having the smartest AI. Now I care just as much that our AIs don’t all think alike.',
       choices:[{t:'Thanks for showing me around.',good:true,mood:'happy',reply:'Thanks for coming. It means a lot when people want to know what happened here.'},
         {t:'I’ll remember the storm table.',good:true,mood:'happy',reply:'Good. Maybe one day you’ll sit on a grid board yourself.'}]},
      {who:'byte',mood:'happy',text:'The ferry leaves at five. Let’s go home.'}]},
  docs:[],criteria:[],controls:[],start:{},
  eveningScene:'night',eveningPlace:'Home · Boston · 9:20 PM',
  evening(){S.lastStars=dtStars();return [
    `<b>${esc(S.byte.name)}:</b> “I keep thinking about Felix’s lever. A switch that nobody had tested in five years was almost the same as having no switch at all.”`,
    `“I read the Ledger’s old reports from Blackout Week. An AI lab on Estmark’s north shore lost power for six hours that first night. Its report says nothing was harmed.”`,
    `“But its list of AIs had one more name at the start of the week than at the end. Probably a mistake in the paperwork. I’d still like to know whose name it was.”`]},
  brief(){const st=dtState(),f=dtFound().map(x=>x.title).join('; ')||'none yet',g=st.grid,res=st.res;
    return `Today is a weekend trip. The player took the morning ferry to Marrow Point, on the island nation of Estmark (fictional), to visit the Dark Tower: Estmark's old power-grid control tower, now empty, covered in vines and home to about 412 kittiwake nests. The guide is Freya Dahl, a grid engineer who was 23 and in her third week on the job during Blackout Week (2029).
What happened in 2029: every one of Estmark's 12 districts (about 10,000 homes each, 120,000 homes in all) ran a copy of the same grid AI, called Beacon. During an ice storm at 7:42 PM, the sensors on the swinging, iced power lines read strange numbers; every copy read them the same wrong way and cut the power in the same second. With more than half the grid tripped at once, the whole grid fell over. The tower's off switch (a manual override) had not been tested in five years and was painted over; it took Felix Amundsen and two others with a crowbar 40 minutes to move it. Crews then restored power by hand, one district at a time; people chose the order (hospital, water pumps, the care home on Kelda Hill). It took 7 days to reach all 120,000 homes. People were scared but pulled through; neighbors shared kitchens and hand-crank radios.
The stories (things people brought back): Oskar Berg's hand-crank radio (he was 9); Marit Halvorsen's hand-printed newspaper, headline "One Mistake, Every Town"; Felix Amundsen's lever; Yusuf Demir's repair-crew helmet (today he signs off on any grid change that cuts power to more than 1,000 homes); Lumi Kask's kittiwake nest (she is 12 and counted 412 nests last spring). Heard so far: ${f}.
Today's safeguards: Estmark runs three AI brains built independently by different teams (Tern, Puffin, Heron), each running some districts; every district has an off switch tested on Switch Day, the first Saturday of each month; a person signs off on big changes. The storm table: a storm finds one brain's blind spot and trips every district that brain runs. 7 or more at once and the grid falls over (all dark 7 days). Otherwise a tripped district with a tested switch is back in about 1 hour (a person switches the confused AI off and a different brain takes over), and without one crews reset it in 2 days. The player's grid now: Tern ${g.brain.filter(x=>x==='tern').length}, Puffin ${g.brain.filter(x=>x==='puffin').length}, Heron ${g.brain.filter(x=>x==='heron').length}, off switches ${g.sw.filter(x=>x===1).length} of 12.${res?' Last results: '+res.map(R=>DT_BRAIN[R.flawed].name+' storm '+(dtChip(R)||'all lit')).join('; ')+'.':''}${st.solved?' The player found a grid where every storm stays within an hour.':''}
The grid board's question: Tern 2 beat Puffin and Heron in every test, and its makers offer to run all 12 districts for less money. Byte's key consideration: what happens on the night it meets a blind spot nobody has found yet; the player decides and signs. Any well-reasoned answer is welcome.
Keep everything kid-safe and hopeful. If the player feels worried about blackouts, reassure them honestly: today's grids use different AIs that check each other, tested off switches, and people who sign big changes.`},
  canned(q){if(/scar|afraid|worr|again|happen/.test(q))return 'It’s okay to feel that way. Estmark’s grid uses three different brains now, with an off switch in every district that gets tested every month. On the storm table, a grid like that keeps every district within an hour of light.';
    if(/same|copy|copies|mistake|why.*(all|every)/.test(q))return 'All twelve districts ran copies of one AI, so they all had the same blind spot. When the storm found it, every copy made the same mistake in the same second.';
    if(/switch|lever|override|off/.test(q))return 'An off switch only helps if it works on the night you need it. Felix’s lever hadn’t been tested in five years and took forty minutes to move. Now every switch is tested on Switch Day.';
    if(/tern|puffin|heron|brain|mix|three/.test(q))return 'Tern, Puffin and Heron were built by different teams, so they rarely share a blind spot. If one trips, the others keep their districts lit and can take over.';
    if(/seven|fall|over|cascade/.test(q))return 'If seven or more of the twelve districts trip at the same moment, the rest can’t carry the load and the whole grid falls over. Then everyone is dark for days.';
    if(/sign|yusuf|thousand|who decides/.test(q))return 'The AIs plan every grid change, but any change that cuts power to more than a thousand homes needs a person to sign. Most weeks that’s Yusuf.';
    if(/bird|kittiwake|nest|lumi/.test(q))return 'Kittiwakes are small seagulls that nest on cliffs. To them, the tower is just another cliff. Lumi counted 412 nests last spring!';
    if(/tern 2|board|advice|vote/.test(q))return 'Tern 2 tested best of all. The real question is what happens on the night it meets a blind spot nobody has found yet. What matters most to you: saving money, or never going dark everywhere at once?';
    if(/how do i|stuck|what do i do|help|win/.test(q))return 'On the table, tap a brain, then tap districts to paint them. Try mixing Tern, Puffin and Heron, add off switches, and press play to watch the three storms.';
    return 'Ask me about Blackout Week, the three brains, the off switches, or the kittiwakes.'},
  shots:{
    dt_tower:[{label:'a story, first card',run(){dtOpenItem(DT_ITEMS[1],{quiet:1})}},
      {label:'a story, card 5',run(){dtOpenItem(DT_ITEMS[1],{quiet:1,page:4})}},
      {label:'lever, card 4',run(){dtOpenItem(DT_ITEMS[2],{quiet:1,page:3})}},
      {label:'radio, card 3',run(){dtOpenItem(DT_ITEMS[0],{quiet:1,page:2})}},
      {label:'helmet, card 6',run(){dtOpenItem(DT_ITEMS[3],{quiet:1,page:5})}},
      {label:'nest, card 3',run(){dtOpenItem(DT_ITEMS[4],{quiet:1,page:2})}},
      {label:'four found',run(){const f=dtState().found;['radio','paper','lever','helmet'].forEach(k=>f[k]=1);dtTower()}},
      {label:'all found',run(){const f=dtState().found;DT_ITEMS.forEach(x=>f[x.id]=1);dtTower()}}],
    dt_grid:[{label:'2029 played',run(){const s=dtState();s.stage=0;s.res29=dtStorm(DT_2029,'beacon');dtGrid()}},
      {label:'all Tern, played',run(){const s=dtState();s.stage=1;s.grid={brain:Array(12).fill('tern'),sw:Array(12).fill(0)};s.res=dtRunAll(s.grid);s.runs=1;s.view=0;dtGrid()}},
      {label:'uneven mix',run(){const s=dtState();s.grid={brain:['tern','tern','puffin','tern','tern','heron','tern','tern','puffin','tern','heron','puffin'],sw:Array(12).fill(0)};s.res=dtRunAll(s.grid);s.runs=2;s.view=0;dtGrid()}},
      {label:'even mix, no switches',run(){const s=dtState();s.grid={brain:['tern','puffin','heron','tern','heron','tern','puffin','heron','puffin','heron','tern','puffin'],sw:Array(12).fill(0)};s.res=dtRunAll(s.grid);s.runs=3;s.view=1;dtGrid()}},
      {label:'switch tool',run(){const s=dtState();s.tool='switch';s.grid.sw=[1,1,0,1,1,0,1,1,1,0,1,1];s.res=null;dtGrid()}},
      {label:'solved',run(){const s=dtState();s.tool='heron';s.grid={brain:['tern','puffin','heron','tern','heron','tern','puffin','heron','puffin','heron','tern','puffin'],sw:Array(12).fill(1)};s.res=dtRunAll(s.grid);s.solved=1;s.runs=4;s.view=0;dtGrid()}},
      {label:'mid-storm',run(){const s=dtState();s.grid={brain:Array(12).fill('tern'),sw:Array(12).fill(1)};s.res=null;s.runs=1;s.tool='tern';dtGrid();dtPlay(false)}}],
    dt_board:[{label:'picked',run(){const s=dtState();s.advice.pick='keep';dtBoard()}},
      {label:'written',run(){const s=dtState();s.advice.pick='all';s.advice.text='I think the board should keep at least two brains because on the storm table one blind spot knocked out every district.';dtBoard()}}]}
};
