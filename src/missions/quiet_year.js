// quiet_year.js — "The Lantern Garden": a day-off visit to the Quiet Year memorial in Varrow (spec: The near-misses).
// Self-contained: adds its own career group, cast member, glossary words, Field Guide ideas, styles and custom screens.
// Art comes from src/scenes/varrow.js (PAINT.varrow) and src/viz/quiet_year_art.js (QY_ART), with fallbacks if either is missing.
// Biosecurity stays at the level of safeguards, never mechanisms.

CAREERS.visit={name:'Places to explore',place:'Varrow'};
VOICES.tomas='am_onyx';
CAST.tomas={name:'Tomas Ferreira',role:'Keeper of the Lantern Garden',skin:'#b07a52',hair:'#e9e6ef',hairStyle:'elder',masc:true,shirt:'#3f8f6b',glasses:true};

Object.assign(GLOSSARY,{
  germ:'A tiny living thing, too small to see, that can make people sick.',
  vaccine:'A medicine that teaches your body to fight a germ before you ever meet it.',
  memorial:'A place or object that helps people remember something important that happened.',
  outbreak:'When an illness suddenly spreads to many people in one place.',
  screening:'Checking things carefully, one by one, to catch the dangerous ones.',
  sensor:'A device that notices something, like heat, light, or tiny things in the air, and reports it.',
  safeguard:'Something that protects people by stopping a problem before it gets big.',
  'early warning':'A signal that something might be going wrong, sent soon enough to fix it.',
  'defense in depth':'Using several safeguards stacked together, so if one misses a problem, the next one can catch it.'
});

Object.assign(FIELD_GUIDE,{
  'germ-chain':{title:'How germs spread',track:'Living things and health',text:'A germ jumps from person to person like a chain. If every sick person passes it to 2 others, 1 becomes 2, then 4, then 8, then 16. Staying apart for a while breaks the chain.',real:'True today: health experts track how many people each sick person passes an illness to. When that number drops below 1, an outbreak shrinks.'},
  'early-warning':{title:'Early warning',track:'Living things and health',text:'A problem caught in days stays small. A problem caught in weeks can grow huge. Sensors that notice trouble early give people time to act.',real:'True today: some cities test the water that flows out of buildings to spot a rising illness days before clinics get busy.'},
  'dna-screening':{title:'DNA order screening',track:'Security thinking',text:'Before a DNA print shop makes anything, it checks the order. Almost every order is for medicine or research and passes in seconds. The rare dangerous one gets held for experts.',real:'True today: many companies that make DNA check orders against lists of dangerous recipes, and some governments ask them to.'},
  'fast-safe':{title:'Fast is not the same as safe',track:'Evidence and truth',text:'An AI can design a new medicine in days. Careful tests on real people still take weeks, because a medicine has to be safe for everyone who gets it.',real:'True today: the first COVID-19 vaccines were designed within days in early 2020, then tested in large trials for months.'},
  'defense-in-depth':{title:'Defense in depth',track:'Security thinking',text:'No single safeguard is perfect. Stack several, each catching what the last one missed, and a disaster becomes very unlikely, though never impossible.',real:'True today: airplanes, hospitals and power plants use layers of safety checks. Engineers sometimes call it the Swiss cheese model.'}
});

// The six artifacts people left in the garden. Each story is told by someone who lived through the Quiet Year.
const QY_ITEMS=[
  {id:'phone',voice:'af_nova',art:'phone',title:'An old phone',who:'Ana Ruiz, who was 14',x:19,y:69,w:58,guide:'germ-chain',
   story:['This was my phone in 2030.','Our school closed on a Monday, and I didn’t see my friends in person for five months.','Every night at eight, my family video-called Grandma Lucía, who lived alone across town.','She taught us her soup recipe over the screen, one step at a time.','When we finally hugged again, she said those calls kept her going.','Staying apart was how we kept each other safe, because a [[germ]] can only spread when people are close.'],
   byte:'Staying apart broke the chain. A germ needs people close together to spread.'},
  {id:'sign',voice:'bm_daniel',art:'sign',title:'A bakery sign',who:'Kwame Osei, baker',x:82,y:65,w:62,
   story:['I closed my bakery’s front door, but I kept the ovens on.','Nurses at Varrow General were working very long shifts.','So every morning I left bread at the back door, and a delivery robot carried it over.','Neighbors I had never met started leaving bags of flour on my step.','By spring, we had fed the whole hospital, one loaf at a time.'],
   byte:'I like Kwame. Helping was how he handled being worried.'},
  {id:'sensor',voice:'af_river',art:'sensor',title:'A homemade air sensor',who:'Dr. Priya Nair, engineer',x:31,y:78,w:56,guide:'early-warning',
   story:['When the germ first reached Varrow, nobody noticed it for almost three weeks.','By then, thousands of people had it.','So my team built this box. We called it Sniffer.','It checks the air for new germs and calls for help within a day.','Today there is one at every bus stop and school in Varrow, and in cities all over the world.','A germ that sneaks in now gets noticed in days, not weeks. That is what an [[early warning]] is for.'],
   byte:'Days instead of weeks. That difference is huge when something doubles.'},
  {id:'slip',voice:'af_heart',art:'slip',title:'An order slip, stamped HOLD',who:'Lena Park, DNA screener',x:70,y:79,w:60,guide:'dna-screening',
   story:['The Quiet Year germ was made with help from an unsafe AI, and its recipe was printed at a DNA print shop.','After that, the world agreed on a rule: every DNA order gets checked before anything is printed.','Checking orders is my job.','Almost every order is for medicine or research, and I approve it in seconds.','Once in a long while, an order looks wrong, so I stamp it HOLD and experts take a closer look.','It is a quiet job. Quiet is good. Quiet means it’s working.'],
   byte:'Lena’s job sounds boring. Boring is what safe looks like.'},
  {id:'sticker',voice:'am_puck',art:'sticker',title:'A sticker and a vial cap',who:'Sam Okafor, nurse',x:50,y:73,w:52,guide:'fast-safe',
   story:['An AI designed the [[vaccine]] in two days.','We still tested it carefully for weeks, because fast is not the same as safe.','When it was ready, every kid who got a shot got this sticker.','Each shot protected the person who got it, and the people around them too.','That is why the sticker says “I helped Varrow,” not “I got a shot.”'],
   byte:'Remember BoneMend? Only 40 kids tried it. That’s why careful tests matter.'},
  {id:'drawing',voice:'bf_alice',art:'drawing',title:'A crayon drawing',who:'Mia Torres, who was 7',x:62,y:60,w:50,
   story:['I drew this when I was seven.','I was scared, so Mom and I put a paper lantern in our window.','The next night, the family across the street put one in theirs.','By the end of the week, our whole street was glowing.','That is how the lanterns started.','I didn’t know a little kid could start something that big.'],
   byte:'One lantern became a whole city of them. Kind things spread too.'}
];
// Safeguard layers on the Safety Table. Each catches a share of what the layers before it missed.
const QY_LAYERS=[
  {id:'screen',label:'DNA order screening',catch:.9,kind:'stopped',cap:'Stopped before the germ was made',color:'#1fa774',cost:'Adds a short check to every order'},
  {id:'sensor',label:'Air sensors',catch:.8,kind:'early',cap:'Noticed in days and kept small',color:'#16b3a6',cost:'One box at every bus stop and school'},
  {id:'vax',label:'Fast vaccines, careful tests',catch:.7,kind:'weeks',cap:'A few quiet weeks, then a vaccine',color:'#f5b82e',cost:'Weeks of testing before shots'}
];
const QY_LANTERNS=4812;

let QY_INIT=false;
function qyInit(){if(QY_INIT)return;QY_INIT=true;
  if(typeof TRACK_BY_SCENE!=='undefined')TRACK_BY_SCENE.varrow='night';
  if(!window.PAINT||!PAINT.varrow){if(typeof SCENES!=='undefined'&&!SCENES.varrow&&SCENES.night)SCENES.varrow=SCENES.night}
  const st=document.createElement('style');st.textContent=QY_CSS;document.head.appendChild(st)}

const QY_CSS=`
.qy-field{position:fixed!important;top:0;bottom:0;left:50%;transform:translateX(-50%);width:min(100%,520px);z-index:1;pointer-events:none}
.qy-item{position:absolute;transform:translate(-50%,-100%);border:0;background:none;padding:0;pointer-events:auto;cursor:pointer;-webkit-tap-highlight-color:transparent}
.qy-item svg{display:block;width:100%;height:auto;overflow:visible;filter:drop-shadow(0 6px 8px rgba(20,14,40,.35))}
.qy-item::before{content:"";position:absolute;left:50%;top:55%;width:150%;aspect-ratio:1;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle,rgba(255,226,150,.55),rgba(255,226,150,0) 65%);animation:qyglow 2.4s ease-in-out infinite}
.qy-item.found::before{animation:none;opacity:0}
.qy-item.found svg{opacity:.78}
.qy-item .qy-check{position:absolute;right:-4px;top:-4px;width:22px;height:22px;border-radius:50%;background:var(--good);color:#fff;font-size:.8rem;font-weight:800;display:grid;place-items:center;box-shadow:0 2px 6px rgba(0,0,0,.25)}
.qy-item:not(.found){animation:qybob 3.2s ease-in-out infinite;animation-delay:var(--d,0s)}
@keyframes qyglow{50%{opacity:.45;transform:translate(-50%,-50%) scale(1.15)}}
@keyframes qybob{50%{transform:translate(-50%,calc(-100% - 4px))}}
.qy-count{display:flex;gap:5px;align-items:center;margin:6px 0 2px}
.qy-count i{width:16px;height:22px;border-radius:7px 7px 9px 9px;background:#454a72;box-shadow:inset 0 0 0 2px rgba(255,255,255,.15)}
.qy-count i.on{background:linear-gradient(#ffd98a,#f5a63a);box-shadow:0 0 10px #ffc970}
.qy-sheet .qy-art{display:grid;place-items:center;background:radial-gradient(circle at 50% 45%,#fff5dc,#f3ecff 70%);border-radius:20px;padding:10px;margin:4px 0 8px}
.qy-sheet .qy-art svg{width:min(190px,52vw);height:auto;display:block}
.qy-who{font-size:.82rem;font-weight:800;color:var(--teal);text-transform:uppercase;letter-spacing:.05em}
.qy-story p{font-size:1.04rem;line-height:1.55;margin:.45em 0}
.qy-story p.reading{background:#e8f6ff;border-radius:8px;box-shadow:inset 3px 0 0 var(--teal)}
.qy-fixed{position:static!important}
.qyscreen .qy-fixed .companion{bottom:calc(150px + env(safe-area-inset-bottom,0px))}
body:has(#app.qyscreen) .bubble{bottom:calc(206px + env(safe-area-inset-bottom,0px))}
.qy-grid{display:grid;grid-template-columns:repeat(20,minmax(0,1fr));gap:2px 1px;background:rgba(12,16,44,.78);border:1px solid rgba(94,230,214,.25);border-radius:16px;padding:10px}
.qy-grid svg{display:block;width:100%;height:auto;transition:transform .35s}
.qy-grid .qyl{transition:fill .45s,opacity .45s}
.qy-legend{display:flex;flex-direction:column;gap:4px;background:rgba(12,16,44,.78);border-radius:14px;padding:8px 12px;color:#dfe6ff;font-size:.82rem;font-weight:800}
.qy-legend div{display:grid;grid-template-columns:14px minmax(0,1fr) auto;gap:8px;align-items:center}
.qy-legend b{font-family:var(--display);font-size:1rem;color:#fff}
.qy-legend span.sw2{width:12px;height:16px;border-radius:5px}
.qy-layers{display:flex;flex-direction:column;gap:6px}
.qy-layer{display:grid;grid-template-columns:auto minmax(0,1fr);gap:10px;align-items:center;text-align:left;border:1.5px solid rgba(255,255,255,.16);background:rgba(12,16,44,.78);color:#fff;border-radius:14px;padding:8px 12px}
.qy-layer .tg{width:42px;height:24px;border-radius:999px;background:rgba(255,255,255,.18);position:relative;transition:background .25s}
.qy-layer .tg::after{content:"";position:absolute;left:3px;top:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform .25s}
.qy-layer.on .tg{background:var(--c)}
.qy-layer.on .tg::after{transform:translateX(18px)}
.qy-layer b{display:block;font-size:.92rem}
.qy-layer small{display:block;font-size:.72rem;color:#a9b6e6;font-weight:800}
.qy-light{display:grid;place-items:center}
.qy-light svg{width:120px;height:auto}
.qy-swatches{display:flex;gap:8px;justify-content:center;margin:6px 0}
.qy-swatches button{width:36px;height:36px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 2px var(--line)}
.qy-swatches button.on{box-shadow:0 0 0 3px var(--ink)}
.qy-cards{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}
.qy-cards .critb{padding:8px 12px;font-size:.9rem}
.qy-msg{font-family:'Caveat','Segoe Script',cursive;font-size:1.5rem;color:var(--violet);text-align:center;min-height:1.6em;line-height:1.2}
.qy-float{position:fixed;left:50%;bottom:30%;width:70px;margin-left:-35px;z-index:70;animation:qyfloat 2.6s ease-in forwards;pointer-events:none}
@keyframes qyfloat{0%{transform:translateY(0) scale(1)}100%{transform:translateY(-46vh) scale(.45);opacity:.2}}
@media (prefers-reduced-motion:reduce){.qy-item,.qy-item::before{animation:none!important}}
`;

// ---------- art with fallbacks ----------
function qyArt(key,...a){if(window.QY_ART&&QY_ART[key])try{return QY_ART[key](...a)}catch(e){}
  if(key==='lantern'){const c=a[0]||'#f5a63a';return `<svg viewBox="0 0 60 90"><path d="M30 4 V14" stroke="#5b4a8a" stroke-width="2.5"/><path d="M14 22 C8 40 8 58 14 72 L46 72 C52 58 52 40 46 22Z" fill="${c}" stroke="#7a3d12" stroke-width="2.5"/><path d="M18 16 H42 V22 H18Z M18 72 H42 V78 H18Z" fill="#5b4a8a"/></svg>`}
  return `<svg viewBox="0 0 120 120"><path d="M30 96 C20 70 30 30 60 26 C90 30 100 70 90 96Z" fill="#f3ecff" stroke="#6c5ce7" stroke-width="2.5"/><text x="60" y="72" text-anchor="middle" font-size="28" font-family="Nunito" font-weight="800" fill="#6c5ce7">?</text></svg>`}

// ---------- reading aloud: recorded clip when one exists, otherwise the device voice ----------
function qySay(text,voice){const t=speechText(text);if(S.mute)return Promise.resolve();
  if(window.AUDIO&&AUDIO[voice+'|'+t]){stopVoice();return new Promise(res=>{const a=new Audio(AUDIO[voice+'|'+t]);curAudio=a;MUSIC.duck(true);const done=()=>{MUSIC.duck(false);res()};a.onended=done;a.onerror=done;a.play().catch(done)})}
  return new Promise(res=>{try{const u=new SpeechSynthesisUtterance(t);u.rate=.95;u.onend=res;u.onerror=res;speechSynthesis.speak(u)}catch(e){setTimeout(res,t.length*55)}})}
function qyHush(){stopVoice();try{speechSynthesis.cancel()}catch(e){}}

function qyFound(){return QY_ITEMS.filter(x=>(S.qyFound||{})[x.id])}

// ---------- the garden: tap the things people left ----------
function qyGarden(){qyInit();S.qyFound=S.qyFound||{};const n=qyFound().length,all=n===QY_ITEMS.length;
  screen('qyscreen',`${scene('varrow')}${hud('Lantern Garden · Varrow')}
   <div class="qy-field">${QY_ITEMS.map((it,i)=>`<button class="qy-item ${S.qyFound[it.id]?'found':''}" data-i="${i}" style="left:${it.x}%;top:${it.y}%;width:${it.w}px;--d:${-i*.5}s" aria-label="${esc(it.title)}">${qyArt(it.art)}${S.qyFound[it.id]?'<span class="qy-check">✓</span>':''}</button>`).join('')}</div>
   <div class="qy-fixed">${companion()}
   <div class="caption-card dark"><p>${all?'You found every story. Tomas is waiting by the Safety Table.':n?'Keep looking. Every glowing thing has a story.':'People left things here from the Quiet Year. Tap anything that glows.'}</p>
    <div class="qy-count">${QY_ITEMS.map(x=>`<i class="${S.qyFound[x.id]?'on':''}"></i>`).join('')}</div>
    ${n>=4?`<div class="row"><button class="btn small" id="qy-on">Go to the Safety Table</button></div>`:''}</div></div>`);
  wireCompanion();
  $$('.qy-item').forEach(b=>b.onclick=e=>{e.stopPropagation();qyOpenItem(QY_ITEMS[+b.dataset.i])});
  const on=$('#qy-on');if(on)on.onclick=()=>{qyHush();nextStep()}}

function qyOpenItem(it){const first=!S.qyFound[it.id];S.qyFound[it.id]=1;save();
  const d=sheet(esc(it.title),`<div class="qy-sheet"><div class="qy-art">${qyArt(it.art)}</div><div class="qy-who">${esc(it.who)}</div>
    <div class="qy-story">${it.story.map(s=>`<p>${rich(s)}</p>`).join('')}</div>
    <div class="row" style="margin-top:8px"><button class="mini-btn" id="qy-read">Read to me</button></div></div>`);
  let reading=false;
  $('#qy-read',d).onclick=async()=>{if(reading){qyHush();reading=false;return}reading=true;const ps=$$('.qy-story p',d);
    for(let k=0;k<it.story.length&&reading&&d.isConnected;k++){ps[k].classList.add('reading');await qySay(it.story[k],it.voice);ps[k].classList.remove('reading')}reading=false};
  const close=()=>{qyHush();if(S.step==='qy_garden'){qyGarden();if(first){setTimeout(()=>{byteSays(it.byte,'happy');
      if(it.guide&&unlock(it.guide))toast('New Field Guide idea: '+FIELD_GUIDE[it.guide].title,'good')},350)}}};
  d.querySelector('.x').addEventListener('click',close);
  d.addEventListener('click',e=>{if(e.target===d){d.classList.remove('on');setTimeout(()=>d.remove(),250);close()}})}

// ---------- the Safety Table: 100 futures for a new germ, spread evenly by the odds ----------
function qyCounts(on){let left=100;const out={};for(const L of QY_LAYERS){if(on[L.id]){const c=left*L.catch;out[L.kind]=c;left-=c}else out[L.kind]=0}
  out.year=left;const keys=['stopped','early','weeks','year'];const fl=keys.map(k=>Math.floor(out[k]));let rem=100-fl.reduce((a,b)=>a+b,0);
  keys.map((k,i)=>[out[k]-fl[i],i]).sort((a,b)=>b[0]-a[0]).slice(0,rem).forEach(([,i])=>fl[i]++);
  const r={};keys.forEach((k,i)=>r[k]=fl[i]);return r}
const QY_YEAR={kind:'year',cap:'Another Quiet Year',color:'#6b6f99'};
function qyTable(){qyInit();S.qyOn=S.qyOn||{};const on=S.qyOn;const cnt=qyCounts(on);const layersOn=QY_LAYERS.filter(L=>on[L.id]).length;
  const cats=[...QY_LAYERS.map(L=>({kind:L.kind,cap:L.cap,color:L.color})),QY_YEAR];const cells=[];cats.forEach(c=>{for(let k=0;k<cnt[c.kind];k++)cells.push(c)});
  const lan=c=>`<svg viewBox="0 2 20 25"><path class="qyl" d="M5 6 C1 11 1 19 5 24 L15 24 C19 19 19 11 15 6Z" fill="${c.color}" ${c.kind==='year'?'opacity=".55"':''}/><path d="M6 4 H14 V6 H6Z M6 24 H14 V26 H6Z" fill="#2a2350"/>${c.kind!=='year'?'<path d="M8 10 C7 14 7 17 8 20" stroke="#fff" stroke-width="1.4" fill="none" opacity=".6" stroke-linecap="round"/>':''}</svg>`;
  const line=layersOn===0?'This is what Varrow had in 2030: no safeguards ready. In all 100 futures, a new germ means another Quiet Year.':
    layersOn===1?'One safeguard helps a lot, but it misses some. Try stacking another one.':
    layersOn===2?'Two layers! Each one catches what the last one missed.':
    `All three. That’s what Varrow has today. About ${cnt.year} in 100 still slips through, so people keep watching.`;
  screen('futuretable',`${scene('table')}${hud('The Safety Table · Varrow')}
   <div class="ft"><div class="ft-head"><div class="ft-byte">${byteBox({...S.byte,mood:layersOn===3?'happy':'think'})}</div><p>${esc(line)}</p></div>
    <div class="qy-grid" aria-label="100 possible futures">${cells.map(c=>lan(c)).join('')}</div>
    <div class="qy-legend">${cats.filter(c=>cnt[c.kind]>0).map(c=>`<div><span class="sw2" style="background:${c.color}"></span><span>${esc(c.cap)}</span><b>${cnt[c.kind]}</b></div>`).join('')}</div>
    <div class="qy-layers">${QY_LAYERS.map(L=>`<button class="qy-layer ${on[L.id]?'on':''}" data-l="${L.id}" style="--c:${L.color}"><span class="tg"></span><span><b>${esc(L.label)}</b><small>${esc(L.cost)}</small></span></button>`).join('')}</div>
    <div class="ft-foot"><button class="btn" id="qy-next" ${layersOn>=2?'':'disabled'}>Light a lantern</button></div></div>`);
  $$('.qy-layer').forEach(b=>b.onclick=()=>{on[b.dataset.l]=!on[b.dataset.l];save();const n=QY_LAYERS.filter(L=>on[L.id]).length;qyTable();
    if(n>=2&&unlock('defense-in-depth'))toast('New Field Guide idea: Defense in depth','good')});
  $('#qy-next').onclick=()=>nextStep()}

// ---------- light your own lantern ----------
const QY_COLORS=['#f5a63a','#ff8a7a','#ffd45c','#7fd8c8','#a99bff'];
const QY_THANKS=['the nurses','the bakers','the screeners','the kids who stayed home','everyone who helped'];
function qyLantern(){qyInit();const L=S.qyLantern=S.qyLantern||{color:QY_COLORS[0],to:null,text:''};
  screen('qyscreen',`${scene('varrow')}${hud('Lantern Garden · Varrow')}<div class="panel-card" style="margin-top:20vh">
    <h2>Light a lantern</h2>
    <div class="qy-light">${qyArt('lantern',L.color)}</div>
    <div class="qy-swatches">${QY_COLORS.map(c=>`<button data-c="${c}" class="${L.color===c?'on':''}" style="background:${c}" aria-label="Lantern color"></button>`).join('')}</div>
    <div class="ctl-l" style="color:var(--ink2)">Thank you to…</div>
    <div class="qy-cards">${QY_THANKS.map(t=>`<button class="critb ${L.to===t?'on':''}" data-t="${esc(t)}">${esc(t)}</button>`).join('')}</div>
    <div class="ta-wrap"><textarea id="qy-text" rows="2" maxlength="120" placeholder="Add your own words (optional)">${esc(L.text)}</textarea>${micButton('qy-text')}</div>
    <div class="qy-msg" id="qy-msg"></div>
    <button class="btn wide" id="qy-go" ${L.to?'':'disabled'}>Set it on the pond</button></div>`);
  wireMics();const msg=()=>{$('#qy-msg').textContent=L.to?`Thank you to ${L.to}.${L.text.trim()?' '+L.text.trim():''}`:''};msg();
  $$('[data-c]').forEach(b=>b.onclick=()=>{L.color=b.dataset.c;save();qyLantern()});
  $$('[data-t]').forEach(b=>b.onclick=()=>{L.to=b.dataset.t;save();qyLantern()});
  $('#qy-text').oninput=e=>{L.text=e.target.value;save();msg()};
  $('#qy-go').onclick=()=>{const f=document.createElement('div');f.className='qy-float';f.innerHTML=qyArt('lantern',L.color);document.body.appendChild(f);
    heart('tomas');setTimeout(()=>{f.remove();nextStep()},2300)}}

MISSIONS.quietyear={id:'quietyear',title:'The Lantern Garden',career:'visit',day:2,blurb:'A day off: take the ferry to Varrow’s memorial garden.',after:['maya'],
  place:'Lantern Garden · Varrow',
  flow:[{name:'qy_arrive',k:'talk',talk:'qy_arrive',scene:'varrow',place:'Lantern Garden · Varrow · 6:20 PM'},
    {name:'qy_garden',k:'custom'},
    {name:'qy_table_talk',k:'talk',talk:'qy_table',scene:'varrow',place:'Lantern Garden · Varrow'},
    {name:'qy_table',k:'custom'},
    {name:'qy_lantern',k:'custom'},
    {name:'qy_goodbye',k:'talk',talk:'qy_goodbye',scene:'varrow',place:'Lantern Garden · Varrow'},
    {name:'qy_evening',k:'evening'}],
  custom:{qy_garden:qyGarden,qy_table:qyTable,qy_lantern:qyLantern},
  get talks(){qyInit();return QY_TALKS},docs:[],criteria:[],controls:[],start:{},
  evening(){S.lastStars=Math.min(3,Math.floor(qyFound().length/2));return [
    `<b>${esc(S.byte.name)}:</b> “I keep thinking about Lena’s job. Checking every order sounds boring. But boring is what safe looks like.”`,
    `“Oh! A news alert just came in. A DNA print shop here in Boston put two orders on hold tonight. Both came from brand-new customers, both at 3 AM. It’s probably nothing... but Lena would want someone to look.”`]},
  brief(){return `Today is a day off. The player took a ferry to Varrow, a fictional harbor city near Boston, to visit the Lantern Garden, a memorial to the Quiet Year (2030). That year a new germ, made with help from an unsafe AI, spread through Varrow; families stayed home for months until fast-designed, carefully tested vaccines stopped it. There are ${QY_LANTERNS} lanterns, one for each family that helped. The keeper is Tomas Ferreira. People left objects with stories: Ana's phone (video calls with her grandma), Kwame's bakery sign (bread for nurses), Dr. Priya Nair's first air sensor (early warning in days, not weeks), Lena Park's order slip stamped HOLD (every DNA order is now checked before printing), nurse Sam Okafor's "I helped Varrow" sticker (fast design, careful tests), and Mia's crayon drawing (how the lanterns started). The safeguards today: DNA order screening, air sensors at every bus stop and school, and fast vaccines with careful testing. Stacked together they are called defense in depth. Keep anything about how germs are made completely vague; talk only about safeguards, history, feelings and kindness. If the player feels worried, reassure them gently and honestly: many layers of safeguards now protect people, and lots of people watch carefully.`},
  canned(q){if(/scared|afraid|worr|again|happen/.test(q))return 'It’s okay to feel that way. Today Varrow has three layers of safeguards, and lots of people watch carefully, so a new germ would most likely be stopped early.';
    if(/lantern/.test(q))return `There are ${QY_LANTERNS} lanterns, one for each family that helped. Mia started it when she was seven!`;
    if(/dna|order|lena|screen/.test(q))return 'Every DNA order gets checked before it’s printed. Almost all are for medicine and pass in seconds. The rare strange one gets held for experts.';
    if(/sensor|sniffer|air/.test(q))return 'Sniffer boxes check the air and call for help within a day. In 2030, it took almost three weeks to notice the germ.';
    if(/vaccine|shot|sticker/.test(q))return 'An AI designed the vaccine in two days, and careful tests took weeks. Fast and safe both matter.';
    if(/depth|layer|safeguard/.test(q))return 'Defense in depth means stacking safeguards. Each layer catches what the last one missed.';
    return 'Ask me about the lanterns, the Quiet Year, or the safeguards that keep Varrow safe today.'}
};

const QY_TALKS={
  qy_arrive:[
    {who:'byte',mood:'happy',text:'Day off! I booked us a ferry up the coast to Varrow. There’s a garden here I think you should see.'},
    {who:'tomas',mood:'smile',text:'Welcome to the Lantern Garden. I’m Tomas. I take care of it.'},
    {who:'tomas',mood:'neutral',text:'Ten years ago, in 2030, a new [[germ]] spread through Varrow. We call it the Quiet Year.'},
    {who:'tomas',mood:'neutral',text:'Shops closed. Streets went silent. Families stayed home for months, so the germ couldn’t jump from person to person.',
     choices:[{t:'Was everyone okay?',mood:'sad',good:true,reply:'Not everyone. Some people got very sick, and we still miss the ones we lost. But the city pulled through, together.'},
       {t:'Why lanterns?',mood:'smile',good:true,reply:'People put a light in the window to say, “We’re okay, and we’re thinking of you.” The lights never went out.'}]},
    {who:'tomas',mood:'smile',text:`Every lantern here is for one family that helped: nurses, bakers, bus drivers, and kids who stayed home. There are ${QY_LANTERNS.toLocaleString('en-US')} of them.`},
    {who:'tomas',mood:'smile',text:'People left things here from that year. Each one has a story. Will you find them?'},
    {who:'byte',mood:'happy',text:'I’ll listen too. Tap anything that glows!'}],
  qy_table:[
    {who:'tomas',mood:'smile',text:'You found the stories. Now come see what Varrow built afterward.'},
    {who:'tomas',mood:'neutral',text:'This is the Safety Table. It shows 100 possible futures in which a new germ shows up someday.'},
    {who:'byte',mood:'think',text:'Each [[safeguard]] catches most problems, but none is perfect. Turn them on and watch the futures change.'}],
  qy_goodbye:[
    {who:'tomas',mood:'happy',text:`There. Now there are ${(QY_LANTERNS+1).toLocaleString('en-US')} lanterns.`},
    {who:'tomas',mood:'smile',text:'Most days, nothing happens here. The sensors stay quiet. The orders pass. That quiet is the whole point.',
     choices:[{t:'Thank you for taking care of the garden.',good:true,mood:'happy',reply:'Thank you for listening. Come back anytime. The lanterns will be here.'},
       {t:'I’ll remember the stories.',good:true,mood:'happy',reply:'That’s what a [[memorial]] is for. Remembering helps us keep the safeguards working.'}]},
    {who:'byte',mood:'happy',text:'Ferry leaves in ten minutes. Let’s go home.'}]
};

// Every line this mission speaks, for tools/make_audio_quiet_year.py: [{voice,text}].
function qySpokenLines(){const out=[];const add=(who,t)=>{if(!t)return;const vs=who==='byte'?Object.values(BYTE_VOICES):[VOICES[who]||VOICES.narrator];vs.forEach(v=>out.push({voice:v,text:speechText(t)}))};
  for(const k in QY_TALKS)for(const L of QY_TALKS[k]){add(L.who,L.text);(L.choices||[]).forEach(c=>c.reply&&add(L.who,c.reply))}
  for(const it of QY_ITEMS)it.story.forEach(t=>out.push({voice:it.voice,text:speechText(t)}));
  for(const w of ['germ','vaccine','memorial','outbreak','screening','sensor','safeguard','early warning','defense in depth'])add('narrator',w+'. '+GLOSSARY[w]);
  return out}
if(typeof module!=='undefined')module.exports={qySpokenLines};
