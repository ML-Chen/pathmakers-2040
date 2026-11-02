// quietyear.js — "The Lantern Garden": a day-off visit to the Quiet Year memorial in Varrow (spec: The near-misses).
// Own files: src/scenes/varrow.js (PAINT.varrow), src/viz/quietyear.js (QY_ART), src/css/quietyear.css, src/audio/quietyear.js (generated).
// Mission state lives in S.m_quietyear.
// Biosecurity stays at the level of safeguards, never mechanisms.

CAREERS.visit={name:'Places to explore',place:'Varrow'};
// The six artifacts people left in the garden. Each story is told by someone who lived through the Quiet Year.
const QY_ITEMS=[
  {id:'phone',teller:'ana',art:'phone',title:'An old phone',who:'Ana Ruiz, who was 14',x:19,y:69,w:58,guide:'germ-chain',
   story:['This was my phone in 2030.','Our school closed on a Monday, and I didn’t see my friends in person for five months.','Every night at eight, my family video-called Grandma Lucía, who lived alone across town.','She taught us her soup recipe over the screen, one step at a time.','When we finally hugged again, she said those calls kept her going.','Staying apart was how we kept each other safe, because a [[germ]] can only spread when people are close.'],
   byte:'Staying apart broke the chain. A germ needs people close together to spread.'},
  {id:'sign',teller:'kwame',art:'sign',title:'A bakery sign',who:'Kwame Osei, baker',x:82,y:65,w:62,
   story:['I closed my bakery’s front door, but I kept the ovens on.','Nurses at Varrow General were working very long shifts.','So every morning I left bread at the back door, and a delivery robot carried it over.','Neighbors I had never met started leaving bags of flour on my step.','By spring, we had fed the whole hospital, one loaf at a time.'],
   byte:'I like Kwame. Helping was how he handled being worried.'},
  {id:'sensor',teller:'priya',art:'sensor',title:'A homemade air sensor',who:'Dr. Priya Nair, engineer',x:31,y:78,w:56,guide:'early-warning',
   story:['When the germ first reached Varrow, nobody noticed it for almost three weeks.','By then, thousands of people had it.','So my team built this box. We called it Sniffer.','It checks the air for new germs and calls for help within a day.','Today there is one at every bus stop and school in Varrow, and in cities all over the world.','A germ that sneaks in now gets noticed in days, not weeks. That is what an [[early warning]] is for.'],
   byte:'Days instead of weeks. That difference is huge when something doubles.'},
  {id:'slip',teller:'lena',art:'slip',title:'An order slip, stamped HOLD',who:'Lena Park, DNA screener',x:70,y:79,w:60,guide:'dna-screening',
   story:['The Quiet Year germ was made with help from an unsafe AI, and its recipe was printed at a DNA print shop.','After that, the world agreed on a rule: every DNA order gets checked before anything is printed.','Checking orders is my job.','Almost every order is for medicine or research, and I approve it in seconds.','Once in a long while, an order looks wrong, so I stamp it HOLD and experts take a closer look.','It is a quiet job. Quiet is good. Quiet means it’s working.'],
   byte:'Lena’s job sounds boring. Boring is what safe looks like.'},
  {id:'sticker',teller:'sam',art:'sticker',title:'A sticker and a vial cap',who:'Sam Okafor, nurse',x:50,y:73,w:52,guide:'fast-safe',
   story:['An AI designed the [[vaccine]] in two days.','We still tested it carefully for weeks, because fast is not the same as safe.','When it was ready, every kid who got a shot got this sticker.','Each shot protected the person who got it, and the people around them too.','That is why the sticker says “I helped Varrow,” not “I got a shot.”'],
   byte:'Remember BoneMend? Only 40 kids tried it. That’s why careful tests matter.'},
  {id:'drawing',teller:'mia',art:'drawing',title:'A crayon drawing',who:'Mia Torres, who was 7',x:62,y:60,w:50,
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


// ---------- art with fallbacks ----------
function qyArt(key,...a){if(typeof QY_ART!=='undefined'&&QY_ART[key])try{return QY_ART[key](...a)}catch(e){}
  if(key==='lantern'){const c=a[0]||'#f5a63a';return `<svg viewBox="0 0 60 90"><path d="M30 4 V14" stroke="#5b4a8a" stroke-width="2.5"/><path d="M14 22 C8 40 8 58 14 72 L46 72 C52 58 52 40 46 22Z" fill="${c}" stroke="#7a3d12" stroke-width="2.5"/><path d="M18 16 H42 V22 H18Z M18 72 H42 V78 H18Z" fill="#5b4a8a"/></svg>`}
  return `<svg viewBox="0 0 120 120"><path d="M30 96 C20 70 30 30 60 26 C90 30 100 70 90 96Z" fill="#f3ecff" stroke="#6c5ce7" stroke-width="2.5"/><text x="60" y="72" text-anchor="middle" font-size="28" font-family="Nunito" font-weight="800" fill="#6c5ce7">?</text></svg>`}

// ---------- reading aloud: recorded clip when one exists, otherwise the device voice ----------
function qySay(text,who){const t=speechText(text);if(S.mute)return Promise.resolve();
  if(window.AUDIO&&AUDIO[(VOICES[who]||VOICES.narrator)+'|'+t])return playLine(who,t);
  return new Promise(res=>{try{const u=new SpeechSynthesisUtterance(t);u.rate=.95;u.onend=res;u.onerror=res;speechSynthesis.speak(u)}catch(e){setTimeout(res,t.length*55)}})}
function qyHush(){stopVoice();try{speechSynthesis.cancel()}catch(e){}}

function qyS(){return S.m_quietyear=S.m_quietyear||{found:{},on:{},lantern:null,last:null}}
function qyFound(){return QY_ITEMS.filter(x=>qyS().found[x.id])}

// ---------- the garden: tap the things people left ----------
function qyGarden(){const Q=qyS();const n=qyFound().length,all=n===QY_ITEMS.length,last=QY_ITEMS.find(x=>x.id===Q.last);
  screen('qyscreen',`${scene('varrow')}${hud('Lantern Garden · Varrow')}
   <div class="qy-field">${QY_ITEMS.map((it,i)=>`<button class="qy-item ${Q.found[it.id]?'found':''}" data-i="${i}" style="left:${it.x}%;top:${it.y}%;width:${it.w}px;--d:${-i*.5}s" aria-label="${esc(it.title)}">${qyArt(it.art)}${Q.found[it.id]?'<span class="qy-check">✓</span>':''}</button>`).join('')}</div>
   <div class="qy-fixed"><div class="caption-card dark"><p>${all?'You found every story. Tomas is waiting by the Safety Table.':last?`<b>${esc(S.byte.name)}:</b> “${esc(last.byte)}”`:'People left things here from the Quiet Year. Tap anything that glows.'}</p>
    <div class="qy-count">${QY_ITEMS.map(x=>`<i class="${Q.found[x.id]?'on':''}"></i>`).join('')}</div>
    ${n>=4?`<div class="row"><button class="btn small" id="qy-on">Go to the Safety Table</button></div>`:''}</div></div>`);
  $$('.qy-item').forEach(b=>b.onclick=e=>{e.stopPropagation();qyOpenItem(QY_ITEMS[+b.dataset.i])});
  const on=$('#qy-on');if(on)on.onclick=()=>{qyHush();nextStep()}}

function qyOpenItem(it){const Q=qyS();const first=!Q.found[it.id];Q.found[it.id]=1;Q.last=it.id;save();
  const d=sheet(esc(it.title),`<div class="qy-sheet"><div class="qy-art">${qyArt(it.art)}</div><div class="row" style="justify-content:space-between"><div class="qy-who">${esc(it.who)}</div><button class="mini-btn" id="qy-read">Read to me</button></div>
    <div class="qy-story">${it.story.map(s=>`<p>${rich(s)}</p>`).join('')}</div></div>`);
  let reading=false;
  $('#qy-read',d).onclick=async()=>{if(reading){qyHush();reading=false;return}reading=true;const ps=$$('.qy-story p',d);
    for(let k=0;k<it.story.length&&reading&&d.isConnected;k++){ps[k].classList.add('reading');await qySay(it.story[k],it.teller);ps[k].classList.remove('reading')}reading=false};
  const close=()=>{qyHush();if(S.step==='qy_garden'){qyGarden();if(first&&it.guide)setTimeout(()=>{if(unlock(it.guide))toast('New Field Guide idea: '+FIELD_GUIDE[it.guide].title,'good')},350)}};
  d.querySelector('.x').addEventListener('click',close);
  d.addEventListener('click',e=>{if(e.target===d){d.classList.remove('on');setTimeout(()=>d.remove(),250);close()}})}

// ---------- the Safety Table: 100 futures for a new germ, spread evenly by the odds ----------
function qyCounts(on){let left=100;const out={};for(const L of QY_LAYERS){if(on[L.id]){const c=left*L.catch;out[L.kind]=c;left-=c}else out[L.kind]=0}
  out.year=left;const keys=['stopped','early','weeks','year'];const fl=keys.map(k=>Math.floor(out[k]));let rem=100-fl.reduce((a,b)=>a+b,0);
  keys.map((k,i)=>[out[k]-fl[i],i]).sort((a,b)=>b[0]-a[0]).slice(0,rem).forEach(([,i])=>fl[i]++);
  const r={};keys.forEach((k,i)=>r[k]=fl[i]);return r}
const QY_YEAR={kind:'year',cap:'Another Quiet Year',color:'#6b6f99'};
function qyTable(){const on=qyS().on;const cnt=qyCounts(on);const layersOn=QY_LAYERS.filter(L=>on[L.id]).length;
  const cats=[...QY_LAYERS.map(L=>({kind:L.kind,cap:L.cap,color:L.color})),QY_YEAR];const cells=[];cats.forEach(c=>{for(let k=0;k<cnt[c.kind];k++)cells.push(c)});
  const lan=c=>`<svg viewBox="0 2 20 25"><path class="qyl" d="M5 6 C1 11 1 19 5 24 L15 24 C19 19 19 11 15 6Z" fill="${c.color}" ${c.kind==='year'?'opacity=".55"':''}/><path d="M6 4 H14 V6 H6Z M6 24 H14 V26 H6Z" fill="#2a2350"/>${c.kind!=='year'?'<path d="M8 10 C7 14 7 17 8 20" stroke="#fff" stroke-width="1.4" fill="none" opacity=".6" stroke-linecap="round"/>':''}</svg>`;
  const line=layersOn===0?'This is what Varrow had in 2030: no safeguards ready. In all 100 futures, a new germ means another Quiet Year. Turn on a safeguard below.':
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
function qyLantern(){const Q=qyS();const L=Q.lantern=Q.lantern||{color:QY_COLORS[0],to:null,text:''};
  screen('qyscreen',`${scene('varrow')}${hud('Lantern Garden · Varrow')}<div class="panel-card" style="margin-top:6vh">
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

MISSIONS.quietyear={id:'quietyear',
  cast:{tomas:{name:'Tomas Ferreira',role:'Keeper of the Lantern Garden',skin:'#b07a52',hair:'#e9e6ef',hairStyle:'elder',masc:true,shirt:'#3f8f6b',glasses:true}},
  voices:{tomas:'elder_man',ana:'af_nova',kwame:'bm_daniel',priya:'af_river',lena:'af_heart',sam:'am_puck',mia:'bf_alice'},
  glossary:{
  germ:'A tiny living thing, too small to see, that can make people sick.',
  vaccine:'A medicine that teaches your body to fight a germ before you ever meet it.',
  memorial:'A place or object that helps people remember something important that happened.',
  outbreak:'When an illness suddenly spreads to many people in one place.',
  screening:'Checking things carefully, one by one, to catch the dangerous ones.',
  sensor:'A device that notices something, like heat, light, or tiny things in the air, and reports it.',
  safeguard:'Something that protects people by stopping a problem before it gets big.',
  'early warning':'A signal that something might be going wrong, sent soon enough to fix it.',
  'defense in depth':'Using several safeguards stacked together, so if one misses a problem, the next one can catch it.'
},
  guide:{
  'germ-chain':{title:'How germs spread',track:'Living things and health',text:'A germ jumps from person to person like a chain. If every sick person passes it to 2 others, 1 becomes 2, then 4, then 8, then 16. Staying apart for a while breaks the chain.',real:'True today: health experts track how many people each sick person passes an illness to. When that number drops below 1, an outbreak shrinks.'},
  'early-warning':{title:'Early warning',track:'Living things and health',text:'A problem caught in days stays small. A problem caught in weeks can grow huge. Sensors that notice trouble early give people time to act.',real:'True today: some cities test the water that flows out of buildings to spot a rising illness days before clinics get busy.'},
  'dna-screening':{title:'DNA order screening',track:'Security thinking',text:'Before a DNA print shop makes anything, it checks the order. Almost every order is for medicine or research and passes in seconds. The rare dangerous one gets held for experts.',real:'True today: many companies that make DNA check orders against lists of dangerous recipes, and some governments ask them to.'},
  'fast-safe':{title:'Fast is not the same as safe',track:'Evidence and truth',text:'An AI can design a new medicine in days. Careful tests on real people still take weeks, because a medicine has to be safe for everyone who gets it.',real:'True today: the first COVID-19 vaccines were designed within days in early 2020, then tested in large trials for months.'},
  'defense-in-depth':{title:'Defense in depth',track:'Security thinking',text:'No single safeguard is perfect. Stack several, each catching what the last one missed, and a disaster becomes very unlikely, though never impossible.',real:'True today: airplanes, hospitals and power plants use layers of safety checks. Engineers sometimes call it the Swiss cheese model.'}
},
  get lines(){return QY_ITEMS.flatMap(it=>it.story.map(t=>({who:it.teller,text:t})))},
  title:'The Lantern Garden',career:'visit',day:2,blurb:'A day off: take the ferry to Varrow’s memorial garden.',after:['maya'],
  place:'Lantern Garden · Varrow',
  flow:[{name:'qy_arrive',k:'talk',talk:'qy_arrive',scene:'varrow',place:'Lantern Garden · Varrow · 6:20 PM'},
    {name:'qy_garden',k:'custom'},
    {name:'qy_table_talk',k:'talk',talk:'qy_table',scene:'varrow',place:'Lantern Garden · Varrow'},
    {name:'qy_table',k:'custom'},
    {name:'qy_lantern',k:'custom'},
    {name:'qy_goodbye',k:'talk',talk:'qy_goodbye',scene:'varrow',place:'Lantern Garden · Varrow'},
    {name:'qy_evening',k:'evening'}],
  custom:{qy_garden:qyGarden,qy_table:qyTable,qy_lantern:qyLantern},
  get talks(){return QY_TALKS},docs:[],criteria:[],controls:[],start:{},
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

