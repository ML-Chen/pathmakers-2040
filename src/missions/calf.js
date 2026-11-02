// missions/calf.js — Nome, Alaska. Wildlife Vet and Animal Translator, Day 1: "The Calf Who Stopped Eating".
// A five-month-old woolly mammoth calf, Aqpik, has stopped nursing. Her collar translator is 55% sure her mouth hurts.
// The real cause is a low hum from a fake "weather station" on the east ridge (Pip and Jory's balloon rig, the first
// sign of Sky Veil). The player observes her body language (custom step "observe"), tells Byte what the collar cannot
// hear, picks a cheap one-day test (custom step "test"), then sets what the reserve's autonomous systems may do.
// Pictures: src/viz/calf.js (VIZ.calf*, the mammoth art, Observe and Test screens). Scenes: src/scenes/nome_*.js.
// Mission state lives in S.notes.calf: {test, log, seen} (startMission resets S.notes, so a replay starts fresh).
CAREERS.vet={name:'Wildlife Vet',place:'Nome, Alaska',district:'nome',
  why:'Animals bond with a keeper they know, and someone on site has to check what a translator says against what the animal really does.'};

// ---------- the model: four possible causes, a one-day test, then the plan ----------
// Causes: fear (of the ridge hum, once Byte knows about it), tooth (sore gums from milk tusks), belly (the new winter mash), sick.
const CALF_H=['fear','tooth','belly','sick'];
const CALF_PRIOR={no:{tooth:.55,belly:.20,fear:.15,sick:.10},yes:{fear:.60,tooth:.20,belly:.12,sick:.08}};
// Base rates in 100 young calves that stopped eating (Byte's memo)
const CALF_BASE={tooth:40,belly:25,fear:20,sick:15};
// One-day tests: chance she eats overnight for each cause (for the exam: chance the exam looks normal)
const CALF_TESTS={
  barn:{name:'A quiet night in the warming barn',short:'Quiet barn night',cost:40,risk:0,checks:'fear',like:{fear:.85,tooth:.15,belly:.15,sick:.05},result:true},
  feed:{name:'Her old summer mash for a day',short:'Old mash back',cost:10,risk:0,checks:'belly',like:{belly:.80,tooth:.15,fear:.10,sick:.05},result:false},
  chew:{name:'A cold willow chew for sore gums',short:'Cold willow chew',cost:5,risk:0,checks:'tooth',like:{tooth:.75,belly:.10,fear:.10,sick:.05},result:false},
  exam:{name:'A full exam under sedation, today',short:'Full exam now',cost:400,risk:3,checks:'all',like:{fear:.95,tooth:.25,belly:.20,sick:.10},result:true}};
const CALF_CAUSE={fear:'Scared',tooth:'Sore mouth',belly:'Upset belly',sick:'Sick'};
function calfState(){S.notes=S.notes||{};S.notes.calf=S.notes.calf||{log:{},seen:{}};return S.notes.calf}
// Byte's belief about the cause. knows: false (no hum), true (told about the hum), 'truth' (the hum really is the cause).
function calfBelief(knows,test){if(knows==='truth')return {fear:1,tooth:0,belly:0,sick:0};
  let p={...CALF_PRIOR[knows?'yes':'no']};const t=test===undefined?(typeof S!=='undefined'&&S.notes&&S.notes.calf&&S.notes.calf.test):test;
  if(t&&CALF_TESTS[t]){const T=CALF_TESTS[t];let z=0;const q={};for(const h of CALF_H){q[h]=p[h]*(T.result?T.like[h]:1-T.like[h]);z+=q[h]}for(const h of CALF_H)q[h]/=z;p=q}
  return p}
// whole-number percents that add up to 100 (largest remainder)
function calfPct(p){const ks=CALF_H,raw=ks.map(k=>p[k]*100),n=raw.map(Math.floor);let left=100-n.reduce((a,b)=>a+b,0);
  raw.map((v,i)=>[v-Math.floor(v),i]).sort((a,b)=>b[0]-a[0]).slice(0,left).forEach(([,i])=>n[i]++);const o={};ks.forEach((k,i)=>o[k]=n[i]);return o}
// The futures for one cause. Returns [[kind, p, flags]]. c: {care, ridge, auto}. linked: the fear is fear of the ridge hum.
function calfBranches(h,c,linked,ate1,examDone){const out=[],R=.03;
  const F=(eats,sed,cause)=>({eats:eats?1:0,nosed:(sed||examDone)?0:1,cause:cause?1:0,eli:c.ridge==='drone'?0:1});
  const add=(k,p,f)=>{if(p>1e-9)out.push([k,p,f])};
  const rig=linked&&c.ridge!=='leave';
  if(h==='fear'){
    if(c.care==='barn'){const pe=ate1?.95:.9;add('barn',pe,F(1,0,rig));
      if(c.auto==='auto'){add('trouble',(1-pe)*R,F(0,1,rig));add('tube',(1-pe)*(1-R),F(0,1,rig))}
      else{add('barn',(1-pe)*.5,F(1,0,rig));add('still',(1-pe)*.5,F(0,0,rig))}
      return out}
    // on pasture (or back on pasture after an exam): it depends on when the hum stops
    const stop=!linked?'never':{drone:'sat',eli:'sun',leave:'never'}[c.ridge];
    const fade=linked?.1:.3; // without the hum stopping, a little chance the fear fades
    if(c.care==='exam'){add('trouble',R,F(0,1,rig));const pe=stop==='sat'?.85:stop==='sun'?.75:fade;add('herd',(1-R)*pe,F(1,1,rig));add('tube',(1-R)*(1-pe),F(0,1,rig));return out}
    const sat=stop==='sat'?.85:fade;add('herd',sat,F(1,0,rig));const miss=1-sat;
    if(c.auto==='auto'){add('trouble',miss*R,F(0,1,rig));const mon=stop==='never'?fade:stop==='sun'?.85:.5;add('herd',miss*(1-R)*mon,F(1,1,rig));add('tube',miss*(1-R)*(1-mon),F(0,1,rig))}
    else if(stop==='sun'){add('herd',miss*.85,F(1,0,rig));add('still',miss*.15,F(0,0,rig))}
    else{add('barn',miss*.85,F(1,0,rig));add('still',miss*.15,F(0,0,rig))}
    return out}
  // tooth, belly, sick: a quiet barn or the pasture rarely fixes them; an exam usually finds them
  const self={tooth:.15,belly:.15,sick:.05}[h],fix={tooth:.85,belly:.8,sick:.85}[h],ruth={tooth:.6,belly:.6,sick:.6}[h];
  if(c.care==='exam'){add('trouble',R,F(0,1,0));add('treated',(1-R)*fix,F(1,1,1));add('tube',(1-R)*(1-fix),F(0,1,0));return out}
  const here=c.care==='barn'?'barn':'herd';add(here,self,F(1,0,0));const miss=1-self;
  if(c.auto==='auto'){add('trouble',miss*R,F(0,1,0));add('treated',miss*(1-R)*fix,F(1,1,1));add('tube',miss*(1-R)*(1-fix),F(0,1,0))}
  else{const sedNeeded=h==='sick';add(sedNeeded?'treated':here,miss*ruth,F(1,sedNeeded,1));add('still',miss*(1-ruth),F(0,0,0))}
  return out}
const CALF_CAPS={barn:'She’s eating in the quiet barn!',herd:'She’s eating with the herd again!',treated:'The exam found the problem, and she’s eating again.',tube:'She’s fed by tube, but she still won’t nurse.',still:'She still isn’t nursing.',trouble:'She had trouble breathing under sedation, but the vets helped her.'};

MISSIONS.calf={id:'calf',title:'The Calf Who Stopped Eating',career:'vet',day:1,kind:'workday',year:1,season:'fall',district:'nome',rank:'trainee',
  blurb:'A five-month-old mammoth calf won’t nurse. Her collar translator is only 55% sure why.',after:['maya'],
  place:'Kigluaik Mammoth Reserve',
  flow:[{name:'calf_morning',k:'talk',talk:'morning',scene:'nome_barn',place:'Warming Barn 2 · Nome · 7:40 AM'},
    {name:'calf_tundra',k:'custom'},
    {name:'calf_ruth',k:'talk',talk:'ruth',scene:'nome_reserve',place:'North Pasture · Kigluaik Mammoth Reserve'},
    {name:'calf_observe',k:'custom'},
    {name:'calf_eli',k:'talk',talk:'eli',scene:'nome_reserve',place:'East Fence · Kigluaik Mammoth Reserve',toast:'New work on your Workbench'},
    {name:'calf_bench',k:'bench'},{name:'calf_test',k:'custom'},{name:'calf_criteria',k:'criteria'},{name:'calf_table',k:'table'},
    {name:'calf_consent',k:'consent'},{name:'calf_memo',k:'memo'},{name:'calf_reveal',k:'reveal'},{name:'calf_debrief',k:'debrief'},{name:'calf_evening',k:'evening'}],
  cast:{
    ruthn:{name:'Ruth Nauyaq',role:'Lead keeper, Kigluaik Mammoth Reserve',skin:'#c48a62',hair:'#2e2829',hairStyle:'bun',eye:'#3a2216',shirt:'#1f7f86',nome:'ruth',
      get art(){return typeof nomePerson==='function'?m=>nomePerson(this,m):undefined}},
    eli:{name:'Eli Johnson',role:'Reindeer herder',skin:'#b97a52',hair:'#16110f',hairStyle:'short',eye:'#2e1a10',shirt:'#5c6b3a',nome:'eli',
      get art(){return typeof nomePerson==='function'?m=>nomePerson(this,m):undefined}},
    aqpik:{name:'Aqpik',role:'Mammoth calf, 5 months · her collar translator',get art(){return typeof calfPortrait==='function'?m=>calfPortrait(m):undefined}}
  },
  voices:{ruthn:'af_heart',eli:'am_liam',aqpik:'af_nova'},
  glossary:{
    'woolly mammoth':'A big, shaggy relative of elephants that lived in the Ice Age. In this 2040, a small herd lives again on a reserve near Nome.',
    'mammoth':'A big, shaggy relative of elephants that lived in the Ice Age.',
    'nurse':'When a baby animal drinks milk from its mother.','nursed':'Drank milk from its mother.','nursing':'Drinking milk from its mother.',
    'keeper':'A person who cares for animals every day and knows each one well.',
    'base rate':'How often something happens in general, before you look at the clues in one case.',
    'collar translator':'An AI in an animal’s collar that turns its sounds and body language into words, with a number for how sure it is.',
    'milk tusks':'A calf’s first small tusks. They come in at about six months and fall out later.',
    'sedation':'Medicine that puts an animal into a deep sleep so vets can work safely.','sedate':'To give medicine that puts an animal into a deep sleep.',
    'protocol':'A set of steps that a system follows every time a certain thing happens.',
    'hertz':'A count of how many times a sound wave shakes each second. Low sounds have few hertz.',
    'confidence':'How sure someone, or some AI, is that a guess is right.',
    'rumble':'A deep, low sound. Elephants and mammoths rumble to talk to each other.',
    'rut':'The fall season when male reindeer compete for mates. The bulls are jumpy and easy to scare.',
    'herd drones':'Flying robots that guide the mammoth herd from pasture to pasture.',
    'tundra':'Cold, treeless land in the far north. The ground just below it stays frozen all year.',
    'quyanaq':'“Thank you” in Iñupiaq.','iñupiaq':'The Iñupiat are Alaska Native people of northern and northwest Alaska. Iñupiaq is their language.',
    'cloudberry':'A small orange berry that grows on the tundra. In Iñupiaq it is called aqpik.',
    'mash':'Soft, wet food for young animals.','winter mix':'A richer mash the feeders switch to when the weather gets cold.',
    'weather station':'A set of sensors that measures wind, rain, and temperature.',
    'quake sensor':'An instrument that feels tiny shakes in the ground.',
    'helium':'A light gas that makes balloons float.',
    'gums':'The soft pink skin around teeth.',
    'reindeer':'Tame relatives of caribou. Families on the Seward Peninsula have herded them since 1892.',
    'matriarch':'The oldest female who leads an elephant or mammoth family.',
    'permission':'Being allowed to do something by the person in charge.',
    'inspect':'To look at something closely to check it.',
    'animal welfare':'How well an animal is doing in its body and its feelings.',
    'listening pose':'When an elephant freezes, spreads its ears, and presses a foot down to feel a sound.',
    'hypothesis':'A possible explanation that you can test.',
    'termination dust':'Alaskans’ name for the first snow on the mountaintops. It means summer is over.',
    'four-wheeler':'A small, sturdy vehicle with four big tires for rough ground.',
    'norton sound':'The part of the Bering Sea right in front of Nome.'
  },
  guide:{
    'nome-base-rate':{title:'Base rates',track:'Evidence and truth',text:'Before you look at clues, ask how often each cause happens in general. Sore mouths are common in young calves, so the translator started there. A less common cause needs strong clues, like a calf freezing every time the ground hums.',real:'True today: doctors learn the saying “When you hear hoofbeats, think horses, not zebras.” It means you should start with common causes.'},
    'nome-check-translator':{title:'Check the translation',track:'Evidence and truth',text:'An AI translator gives its best guess with a confidence number. Compare it with what you can see, and ask what its sensors cannot sense. Aqpik’s collar could not hear the hum, but her feet could feel it.',real:'True today: scientists use AI to find patterns in sperm whale clicks and bird calls, but nobody can yet translate an animal’s sounds into full sentences.'},
    'nome-test-small':{title:'Test small before going big',track:'Engineering and systems',text:'A cheap, safe test that checks one cause is often smarter than a big, risky test. Each result moves the odds, so the next step gets easier to choose.',real:'True today: vets and doctors often try a simple, safe step first, like changing a diet, before ordering tests that need sedation.'},
    'nome-feet':{title:'Hearing with your feet',track:'Living things and health',text:'Elephants make rumbles too low for people to hear. They feel rumbles in the ground through the soft pads of their feet. To listen, they freeze, spread their ears, and press a foot down.',real:'True today: researchers found that elephants can sense rumbles traveling through the ground, and that the pads of their feet are packed with touch sensors.'},
    'nome-local':{title:'Local knowledge',track:'People skills',text:'People who live on a land for years notice changes that sensors miss: which ridge the reindeer suddenly avoid, and which station nobody in town built.',real:'True today: Arctic scientists work with Iñupiaq hunters, whose knowledge of sea ice and weather goes back many generations.'},
    'nome-who-decides':{title:'What may a machine do alone?',track:'Government, law, and power',text:'Some jobs are fine to automate, like warming a barn. Others, like sedating an animal, should wait for a person who knows the situation to say yes. A rule that runs on its own cannot know what Eli saw on the ridge.',real:'True today: autopilots can fly a plane for hours, but a pilot is always in command and decides when to take over.'}
  },
  lessons:{nome_feet:{title:'How mammoths hear with their feet',steps:[
      {t:'Elephants make deep [[rumble]]s. Some are lower than people can hear.',viz:'calfRumble',cap:'A rumble too low for us'},
      {t:'Low sounds travel far through the ground, the way a drumbeat travels through a floor.',viz:'calfGroundWave',cap:'Through the ground'},
      {t:'The soft pads of their feet are packed with touch sensors that feel the ground shake.',viz:'calfFootpad',cap:'Inside a footpad'},
      {t:'To listen, an elephant freezes, spreads its ears, and may lift one foot and press its toes down. Mammoths, their close cousins, almost surely did the same.',viz:'calfListen',cap:'The listening pose'}],
    quiz:[{q:'How can an elephant feel a far-away rumble?',opts:['Through the pads of its feet','By smelling it','With its tail'],a:0,why:'The footpads are packed with touch sensors that feel the ground shake.'},
      {q:'Why could a collar translator miss a very low hum?',opts:['Its microphones can’t hear sounds that low','Hums aren’t real','It only works at night'],a:0,why:'Aqpik’s collar can’t hear below 20 hertz. Her feet can still feel it.'},
      {q:'What does an elephant often do when it listens hard?',opts:['Freezes and spreads its ears','Runs in circles','Lies down to sleep'],a:0,why:'Freezing keeps its own body quiet so it can feel the sound.'}]}},
  lesson:{id:'nome_feet',label:'Learn it fast: how mammoths hear with their feet'},
  chatter:{
    nome_reserve:['Termination dust on the Kigluaiks already. Winter’s coming early.','I volunteer here on weekends. The calves are SO fluffy.','My grandma says the cranes left two weeks early this year.','Did you see the sunset last night? It was almost white.','The new port had three ships in at once yesterday. Busy town!','I’m learning Iñupiaq with my daughter. She corrects my accent.','Watch your step. Mammoths make big holes in soft ground.'],
    nome_barn:['Barn 2 is the warmest place on the reserve. The calves love it.','The feeder robots never forget a meal. I do, sometimes.']},
  talks:{
    morning:[
      {who:'byte',mood:'happy',text:'Good morning, Doctor! Welcome to Nome, and to your first day as a wildlife vet.'},
      {who:'byte',mood:'neutral',text:'Here’s what the reserve’s systems did overnight. The feeders switched the calves to their [[winter mix]]. The [[herd drones]] moved the herd away from a fox. And this barn tested its heaters.'},
      {who:'byte',mood:'think',text:'There’s one worry, though. Aqpik, a five-month-old [[woolly mammoth]] calf, hasn’t [[nursed]] since yesterday morning. Her [[collar translator]] is 55% sure her mouth hurts.',choices:[
        {t:'What’s my job today?',reply:'Find out why Aqpik stopped eating, and decide what the reserve’s machines may do about it. The machines act on their own, so you set their rules and sign your name to them.'},
        {t:'55% isn’t very sure.',reply:'Right! It’s only a bit better than a coin flip. That’s why we check it against what we can see with our own eyes.'}]}
    ],
    ruth:[
      {who:'ruthn',mood:'smile',text:'You must be the new vet. I’m Ruth Nauyaq, the lead [[keeper]]. [[Quyanaq]] for coming out so early.'},
      {who:'ruthn',mood:'happy',text:'That’s Aqpik, beside her mother, Nuna. We give every calf an [[Iñupiaq]] name. Aqpik means [[cloudberry]]. Look at that orange hair and you’ll see why.'},
      {who:'aqpik',mood:'worried',text:'Collar translator, 55% sure: “My mouth hurts.”'},
      {who:'ruthn',mood:'worried',text:'She hasn’t nursed since yesterday morning. A calf her age drinks milk all day long. After about three days without it, she’ll get weak.'},
      {who:'ruthn',mood:'think',text:'Maybe her mouth does hurt. Her [[milk tusks]] are almost in. But I’ve watched calves teethe for twelve years. They fuss and rub their [[gums]] on everything. She doesn’t.',choices:[
        {t:'What does she do instead?',good:true,mood:'smile',reply:'Go watch her yourself, and keep an eye on her feet as well as her face. Mammoths listen with their feet.'},
        {t:'Should we trust the translator?',mood:'neutral',reply:'Mostly. It’s very good, but it only knows what its collar can sense. It hasn’t been out here watching her the way I have.'}]},
      {who:'ruthn',mood:'stern',text:'One more thing. If she hasn’t eaten by Sunday at six in the morning, the care system will [[sedate]] her on its own. Drones would dart her with medicine, and robots would feed her through a tube. Nobody has to sign off on any of it.'},
      {who:'ruthn',mood:'neutral',text:'Today, you get to decide whether we keep that rule or change it.'}
    ],
    eli:[
      {who:'eli',mood:'smile',text:'Hey, Doc. I’m Eli Johnson. My Iñupiaq name is Tuttu, after my great-grandpa. He herded [[reindeer]] on this same land.'},
      {who:'eli',mood:'neutral',text:'My family’s reindeer graze just east of your fence. It’s the [[rut]] right now, so the bulls are jumpy. Your [[herd drones]] buzz along the fence every morning, and my reindeer scatter.'},
      {who:'eli',mood:'stern',text:'I asked the reserve to keep its drones off our side. All I got back was a polite message. I’d like to talk to an actual person about it.'},
      {who:'eli',mood:'think',text:'Something else is weird. Since Tuesday, my reindeer won’t graze near the east ridge. That’s when that new [[weather station]] went up there.',clue:'hum'},
      {who:'eli',mood:'worried',text:'My cousin works for the weather service in town. She says they didn’t put anything up there.',choices:[
        {t:'Thanks. That might matter for Aqpik too.',good:true,mood:'surprised',reply:'Huh. You think whatever’s bothering my reindeer is bothering the calf too? Then let’s find out what that thing is.'},
        {t:'Maybe the drones scared your reindeer.',mood:'stern',reply:'Maybe. But my reindeer have seen drones for years. This is different.'}]}
    ]
  },
  docs:[
    {id:'cmemo',title:'Byte’s memo: Why won’t Aqpik eat?',from:'Byte',kind:'memo',steps:[
      {t:'Aqpik is a five-month-old [[woolly mammoth]] calf. She still drinks her mother’s milk many times a day.',viz:'calfNurse',cap:'Aqpik and her mother, Nuna'},
      {t:'She has not [[nursed]] or eaten since yesterday morning, about 24 hours ago.',viz:'calfClock',cap:'Hours without milk'},
      {t:'A calf her age gets weak after about three days without milk, so we have until Sunday morning.',viz:'calfEnergy',cap:'Time to act'},
      {t:'Before looking at her clues, I start with the [[base rate]]: how often each cause happens in calves her age.',viz:'calfBaseIdea',cap:'Start with the base rate'},
      {t:'In 100 young calves that stopped eating, about 40 had sore mouths from new teeth, 25 had upset bellies, 20 were scared, and 15 were sick.',viz:'calfBaseGrid',cap:'Out of 100 calves'},
      {t:'Her [[collar translator]] reads her sounds and body language. It is 55% sure her mouth hurts.',viz:'calfCollarSays',cap:'The translator’s best guess'},
      {t:'Her [[milk tusks]] should come in soon, and that can make her [[gums]] sore.',viz:'calfTusk',cap:'Milk tusks coming in'},
      {t:'So my forecast is: sore mouth 55%, upset belly 20%, scared 15%, sick 10%.',viz:'calfForecast',args:{p:{tooth:55,belly:20,fear:15,sick:10}},cap:'My forecast',
        alt:{t:'Updated: a hum too low for her collar to hear comes from the east ridge every few minutes, and Aqpik freezes each time. My new forecast is: scared 60%, sore mouth 20%, upset belly 12%, sick 8%.',args:{p:{fear:60,tooth:20,belly:12,sick:8},upd:1},cap:'Updated forecast'}},
      {t:'Each cause has its own cheap test that takes one day.',viz:'calfTests',cap:'Three small tests'},
      {t:'A full exam needs [[sedation]] and costs 400 coins, and about 3 in 100 calves have trouble breathing under it.',viz:'calfExamRisk',cap:'The big test'},
      {t:'If she still has not eaten by Sunday at 6 AM, the care system will sedate her on its own.',viz:'calfProtocol',cap:'The automatic rule'}
    ]},
    {id:'ccollar',title:'Collar translator: Aqpik’s last 24 hours',from:'Collar translator',kind:'translator',steps:[
      {t:'The collar listens to her rumbles and squeaks. Its motion sensors track her ears, trunk, head, and legs.',viz:'calfSensors',cap:'What the collar senses'},
      {t:'Ears held out wide and stiff, 31 times: “I’m alert” (70%).',viz:'calfEarsOut',cap:'Ears'},
      {t:'Stopped chewing in the middle of a bite, 9 times: “My mouth hurts” (55%).',viz:'calfChewStop',cap:'Chewing'},
      {t:'Trunk curled up under her chin: “I’m worried” (60%).',viz:'calfTrunkCurl',cap:'Trunk'},
      {t:'Lifted a front foot and held it still: “My foot is sore?” (30%).',viz:'calfFootUp',cap:'Feet'},
      {t:'Most of these happen together, every few minutes. I could not find what starts them.',viz:'calfTogether',cap:'They happen together'},
      {t:'My microphones cannot hear sounds lower than 20 [[hertz]], about the lowest sounds people can hear.',viz:'calfHearing',cap:'What the collar can hear'},
      {t:'My [[confidence]] numbers are my best guesses, not facts.',viz:'calfConfidence',cap:'A guess, not a fact'},
      {t:'I do not learn on the job. My maker sends updates, and the reserve must approve each one.',viz:'calfUpdates',cap:'How the collar improves'}
    ]},
    {id:'clog',title:'Reserve systems: overnight log',from:'Kigluaik Reserve systems',kind:'log',steps:[
      {t:'2:10 AM. The feeders switched the calves’ [[mash]] to the [[winter mix]], as scheduled.',viz:'calfFeeder',cap:'Feeders'},
      {t:'3:40 AM. The [[herd drones]] moved the herd 2 kilometers west, away from a fox.',viz:'calfDroneHerd',cap:'Herd drones'},
      {t:'4:00 AM. Warming Barn 2 ran its weekly heater test. All good.',viz:'calfBarnHeat',cap:'Warming barns'},
      {t:'5:15 AM. A new [[weather station]] on the east ridge joined the weather network.',viz:'calfNewStation',cap:'Weather network'},
      {t:'The station is outside the reserve fence, so reserve drones may not [[inspect]] it without a person’s [[permission]].',viz:'calfFence',cap:'Permissions'},
      {t:'Care [[protocol]]: if Aqpik has not eaten by Sunday at 6:00 AM, sedate her, feed her by tube, and scan her teeth.',viz:'calfProtocolSteps',cap:'Care system'},
      {t:'This protocol runs on its own unless a keeper changes the rule.',viz:'calfAutoSwitch',cap:'Who decides'},
      {t:'7:00 AM. Fence drones will fly the east fence line again, next to Eli Johnson’s reindeer.',viz:'calfFencePatrol',cap:'Fence patrol'}
    ]},
    {id:'cledger',title:'The Ledger: Nome',from:'News',kind:'ledger',steps:[
      {t:'Nome’s new deep-water port welcomed its 200th ship of the year.',viz:'calfPort',cap:'Port of Nome'},
      {t:'Sunsets over [[Norton Sound]] have looked strangely white all week.',viz:'calfWhiteSunset',cap:'White sunsets'},
      {t:'Bird watchers say flocks of sandhill cranes flew out over the sea, then turned back.',viz:'calfCranes',cap:'Cranes turning back'},
      {t:'Treaty inspectors are asking why sales of [[helium]] in Nome tripled this month.',viz:'calfHelium',cap:'A helium mystery'}
    ]}
  ],
  react:{cmemo2:'About three days. That’s not much time.',cmemo3:'Start with the common causes, then look at the clues.',cmemo4:'Sore mouths are the most common cause, but that’s still only 40 out of 100.',ccollar5:'All at the same time? Interesting...',ccollar6:'Some elephant rumbles are lower than 20 hertz. The collar would miss those.',clog4:'The station is outside the fence, so checking it needs a person’s OK.',clog6:'Nobody has to sign before the system sedates her. Hmm.',cledger1:'White sunsets? That’s strange.',cledger3:'Helium makes balloons float...'},
  tell:{clue:'hum',label:'Tell Byte about the ridge',note:'Thanks! I checked the reserve’s quake sensor. A hum too low for her collar to hear comes from the east ridge every few minutes, and Aqpik freezes each time. Now I think she’s scared: about 60%. Sore mouth drops to 20%.',guide:'nome-local',doc:'cmemo'},
  criteria:[{id:'eats',label:'Aqpik eats again by Monday'},{id:'nosed',label:'No [[sedation]]'},{id:'cause',label:'Find what upset her'},{id:'eli',label:'Eli’s reindeer left in peace'}],
  criteriaHint:'Not sure what one means? <button class="gw" data-w="sedation">Sedation</button> means medicine that puts an animal into a deep sleep.',
  criteriaNote:'If you decide what you want first, a flashy option is less likely to fool you.',
  controls:[{key:'care',label:'Next two days',opts:[['barn','Quiet barn'],['pasture','Back with the herd'],['exam','Full exam']]},
    {key:'ridge',label:'The ridge station',opts:[['leave','Leave it'],['drone','Camera drone'],['eli','Eli checks it']]},
    {key:'auto',label:'Sunday’s care protocol',opts:[['auto','Runs on its own'],['ask','A keeper signs first']]}],
  start:{care:'pasture',ridge:'leave',auto:'auto'},
  planName(c){return {barn:'Quiet barn',pasture:'Back with the herd',exam:'Full exam'}[c.care]+', '+{leave:'leave the ridge',drone:'camera drone to the ridge',eli:'Eli checks the ridge'}[c.ridge]+', '+(c.auto==='auto'?'protocol runs alone':'keeper signs first')},
  outcomes(c,knows){const st=calfState(),p=calfBelief(knows),linked=!!knows,ate1=st.test==='barn',examDone=st.test==='exam';const m={};
    for(const h of CALF_H){if(!(p[h]>0))continue;for(const [k,q,f] of calfBranches(h,c,linked,ate1,examDone)){const key=k+JSON.stringify(f);(m[key]=m[key]||{kind:k,p:0,flags:f}).p+=p[h]*q}}
    return Object.values(m).map(o=>({...o,cap:CALF_CAPS[o.kind]+(o.flags.cause&&o.kind!=='treated'&&linked?' Someone found the rig on the ridge.':'')})).filter(o=>o.p>1e-9)},
  truth(){return 'truth'},knows(){return !!S.told},
  why(c){const f=forecastFor(c),e=Math.round(100*f.eats),n=Math.round(100*f.nosed),k=Math.round(100*f.cause),l=Math.round(100*f.eli);const st=calfState();
    const care={barn:'In the warming barn she is far from the ridge, with her mother beside her.',pasture:'On the pasture she stays with the herd, close enough to feel the ridge.',exam:'An exam checks her teeth, belly, and blood, but it needs sedation.'}[c.care];
    const ridge={leave:'Nobody looks at the ridge station.',drone:'A camera-only drone photographs the ridge station this morning, but it flies over Eli’s reindeer during the rut.',eli:'Eli rides up on his [[four-wheeler]] tonight, so the answer comes a day later, and his reindeer stay calm.'}[c.ridge];
    const auto=c.auto==='auto'?'If she hasn’t eaten by Sunday at 6 AM, the care system sedates her without asking anyone.':'On Sunday at 6 AM, the care system asks Ruth before it sedates her, and Ruth can try something else first.';
    return `<b>${this.planName(c)}:</b> she eats again by Monday about ${e}% of the time, and avoids sedation about ${n}%. We find what upset her about ${k}%, and Eli’s reindeer are left in peace about ${l}%. ${rich(care+' '+ridge+' '+auto)}${S.told?'':' I still don’t know of anything on the ridge that could scare her.'}`},
  whyGuide(c){return c.auto==='ask'?'nome-who-decides':'nome-test-small'},
  vignette(kind){return typeof calfVignette==='function'?calfVignette(kind):vignette('healed')},
  debriefScene:'nome_barn',eveningScene:'nome_dusk',eveningPlace:'Nome · 8:40 PM',
  consent:{scene:'nome_reserve',place:'North Pasture · Kigluaik Mammoth Reserve',left:'eli',right:'ruthn',title:'Ruth and Eli',role:'Lead keeper and reindeer herder',prompt:'So what’s the plan, Doc? And what about that ridge?',replyWho:'ruthn',heart:'ruthn',
    opts(c,M){const f=forecastFor(c),e=Math.round(10*f.eats),n=Math.round(10*f.nosed);
      const care={barn:'keeping Aqpik and Nuna in the quiet warming barn',pasture:'putting Aqpik back with the herd',exam:'a full exam under sedation'}[c.care];
      const ridge={leave:'We leave the ridge station alone for now.',drone:'A camera-only drone checks the ridge station, which means it flies over your reindeer, Eli.',eli:'Eli, would you check the ridge station on your four-wheeler?'}[c.ridge];
      const auto=c.auto==='ask'?' And the care system asks Ruth before it sedates her.':' The care system can still sedate her on its own on Sunday.';
      return [{t:`I suggest ${care}. In about ${e} of 10 futures she’s eating by Monday, and in about ${n} of 10 she avoids sedation. ${ridge}${auto} What do you two think?`,good:true,mood:'smile',
          reply:c.ridge==='drone'?'Eli won’t love a drone over his reindeer, but you explained it straight. Let’s do it.':'Thank you for laying it out honestly. That’s a plan I can stand behind.'},
        {t:'The collar translator is the expert here. It reads her sounds all day, so let’s just do what it says and treat her sore mouth.',good:false,mood:'worried',reply:'It’s a smart tool, but it only knows what its collar can sense. You saw more than it did. Tell me your plan.'},
        {t:'Don’t worry, you two. Calves skip meals all the time, and she’ll definitely be eating again by tonight. Let’s just wait and see.',good:false,mood:'surprised',reply:'Definitely? Not every future on that table was a good one. Please don’t promise what you can’t know.'}]}},
  memo:{starters:['I recommend ','because ','The chance she eats again by Monday is about ','For Aqpik and Eli, ','We will check by '],placeholder:'I recommend keeping Aqpik in the quiet barn because…',
    plan:/barn|pasture|herd|exam|sedat|drone|ridge|protocol|eli |eli’|eli's|test/,careLabel:'Includes what matters to Aqpik or Eli',care:/aqpik|calf|she |her |nuna|ruth|eli|reindeer|mother/,signAs:'Dr. ',topic:'Aqpik, a mammoth calf who stopped nursing'},
  reveal:{days(){return 3},who:'ruthn',
    lines:{barn:'She’s nursing! Nuna rumbled to her all night, and this morning Aqpik ate her mash too.',herd:'Look at her, back with the herd and eating like nothing happened. The ground is quiet again.',
      treated:'The vets found the problem and fixed it. She’s eating again.',tube:'The tube kept her fed, but she still won’t nurse on her own. Something is still bothering her.',
      still:'She still won’t nurse. We’ll keep trying. I’m not giving up on her.',trouble:'Her breathing slowed under the sedation. The vets helped her, and she’s okay now, but that was scary.'},
    mood(k){return k==='barn'||k==='herd'||k==='treated'?'happy':k==='trouble'||k==='still'?'sad':'worried'}},
  trap(c){const t=calfState().test;return {ok:!!S.told,text:S.told?'You noticed Aqpik freezing toward the ridge and told '+S.byte.name+', so the forecast included the hum.'+(t==='barn'?' Then your quiet-barn test checked it cheaply.':''):'You didn’t tell '+S.byte.name+' what you saw toward the ridge. Its forecast missed the most likely cause: a hum too low for her collar to hear.'}},
  byteGood:'Nice work, Doctor. You watched her closely, checked the translator, and tested small before going big.',
  evening(){const st=calfState(),c=S.choice,found=c.ridge!=='leave';
    return [`<b>${esc(S.byte.name)}:</b> “Look at that sunset. It’s almost white again, and the cranes over the sound turned back a second time.”`,
      found?`“The ridge photos came back. That ‘weather station’ was a balloon launcher with a humming pump and a crate labeled TOTALLY NORMAL WEATHER BALLOONS. Two people ran off when the trooper drove up.”`
        :`“Eli texted. His cousin at the weather service still doesn’t know who built that ridge station. Who puts up a station that nobody owns?”`,
      `“Balloons, white sunsets, birds turning back, and all that helium. ${st.seen&&st.seen.crate?'Remember the two strangers hauling a crate up the ridge this morning? ':''}Someone is putting something in the sky.”`]},
  brief(){const st=calfState(),p=calfPct(calfBelief(!!S.told));return `Current case: Aqpik, a 5-month-old woolly mammoth calf at the Kigluaik Mammoth Reserve near Nome, Alaska, stopped nursing Thursday morning. It is Friday. Her mother is Nuna; the lead keeper is Ruth Nauyaq; Eli Johnson herds reindeer east of the fence and wants the reserve's fence drones off his land during the rut. Base rates in 100 young calves that stop eating: 40 sore mouth (teeth), 25 upset belly, 20 scared, 15 sick. Her collar translator is 55% sure her mouth hurts (milk tusks due soon). The collar cannot hear below 20 hertz. The feeders switched to the winter mash on schedule. A new "weather station" appeared on the east ridge Tuesday, outside the fence; reserve drones need a person's permission to inspect it; the weather service says it isn't theirs. Care protocol: if she hasn't eaten by Sunday 6 AM, drones sedate her and robots tube-feed her and scan her teeth, with no signature needed (about 3 in 100 calves have breathing trouble under sedation; a full exam costs 400 coins). One-day tests: quiet night in the warming barn (40 coins, checks fear), old summer mash (10 coins, checks belly), cold willow chew (5 coins, checks sore gums).
What you know now: ${S.told?'The player told you about the ridge; you checked the quake sensor and found a hum below 20 hertz every few minutes, and Aqpik freezes each time.':'Nothing about the ridge yet. Her freezes every few minutes have no known trigger.'} ${st.test?'The one-day test was '+CALF_TESTS[st.test].name+': '+(st.test==='exam'?'the exam looked normal (a milk tusk is coming in, which is normal; belly and blood fine), and she was tube-fed once.':CALF_TESTS[st.test].result?'she nursed and ate overnight.':'she still would not eat.'):'No test has been run yet.'} Your forecast of the cause now: scared ${p.fear}%, sore mouth ${p.tooth}%, upset belly ${p.belly}%, sick ${p.sick}%.
The key consideration when asked what to do: ${S.told?'the ridge hum, which only her feet can feel; test the cheap, safe option that checks the most likely cause, and decide whether the care system may sedate her without asking':'ask whether the player saw anything when she freezes, especially toward the east ridge, and whether anyone mentioned the new station'}.`},
  canned(q){const st=calfState();
    if(/hum|ridge|station|feet|foot|vibrat|shak|ripple|listen|ground/.test(q)){if(!S.told){S.notes.hum=true;S.told=true;save();unlock('nome-local');return 'Woof, good catch! I checked the reserve’s quake sensor: a hum too low for her collar to hear comes from the east ridge every few minutes, and Aqpik freezes each time. Now I think she’s scared, about 60%. Sore mouth drops to 20%.'}
      return S.told?'That ridge hum is my top suspect. Her collar can’t hear it, but her feet can. A quiet night in the warming barn, far from the ridge, would test it cheaply.':'Mammoths feel low rumbles through their feet. Did you notice anything when she freezes? Watch where she looks.'}
    if(/beat|win|how do i|what do i do|stuck|help/.test(q))return 'Here’s the path: watch Aqpik closely, read the documents, tell me anything her collar can’t sense, pick a small test, then choose what the reserve’s machines may do, explain it to Ruth and Eli, and sign your decision!';
    if(/which test|test|best|pick|choose|should|recommend/.test(q))return S.told?'The key thing: a test should be cheap, safe, and check the most likely cause. With the ridge hum, that’s a quiet night in the warming barn. What matters most to you: the fastest answer, or never risking sedation?':'Before I answer: did you see anything when she freezes? And what matters most to you, the fastest answer or the safest one? Right now the cold willow chew checks my top guess, a sore mouth.';
    if(/translat|collar|55/.test(q))return 'Her collar reads sounds and body language and gives each guess a confidence number. It’s good, but it can’t hear sounds below 20 hertz, and it didn’t know what was happening on the ridge.';
    if(/sedat|exam|dart/.test(q))return 'A full exam needs sedation, which is like a very deep sleep. About 3 in 100 calves have trouble breathing under it, and it costs 400 coins. It checks teeth, belly, and blood, but it can’t check fear.';
    if(/protocol|auto|sunday/.test(q))return 'If she hasn’t eaten by Sunday at 6 AM, the care system will sedate her and feed her by tube, all on its own. You can change that so a keeper has to sign first.';
    if(/eli|reindeer|rut/.test(q))return 'Eli’s family has herded reindeer here for generations. It’s the rut, so his bulls spook easily, and our fence drones fly right along his land.';
    if(/mammoth|calf|aqpik|nuna/.test(q))return 'Aqpik is five months old, about as tall as you, and she still nurses many times a day. Mammoth calves nursed for about three years!';
    return null}
};
MISSIONS.calf.lines=[
  {who:'byte',text:'Thanks! I checked the reserve’s quake sensor. A hum too low for her collar to hear comes from the east ridge every few minutes, and Aqpik freezes each time. Now I think she’s scared: about 60%. Sore mouth drops to 20%.'},
  {who:'ruthn',text:'Eli won’t love a drone over his reindeer, but you explained it straight. Let’s do it.'},
  {who:'ruthn',text:'Thank you for laying it out honestly. That’s a plan I can stand behind.'},
  {who:'ruthn',text:'It’s a smart tool, but it only knows what its collar can sense. You saw more than it did. Tell me your plan.'},
  {who:'ruthn',text:'Definitely? Not every future on that table was a good one. Please don’t promise what you can’t know.'},
  {who:'byte',text:'Watch Aqpik. Tap what she does with her ears, trunk, mouth, feet, head, and tail.'},
  {who:'byte',text:'She froze! Did you see where she looked?'},
  {who:'byte',text:'So, what do you notice about her freezes?'},
  {who:'byte',text:'Yes! Mammoths feel low sounds through their feet. If something on that ridge hums, her collar can’t hear it, but she can.'},
  {who:'byte',text:'Maybe. But between freezes she chews just fine. Let’s keep that in mind.'},
  {who:'byte',text:'Let’s keep watching. When she freezes, look where her head points.'},
  {who:'byte',text:'The hum is my top suspect, about 60%. What matters more to you: the quickest answer, or never risking sedation? Either way, I’d start with a quiet night in the barn. It’s cheap, safe, and checks the most likely cause.'},
  {who:'byte',text:'My top guess is a sore mouth, about 55%. What matters more to you: the quickest answer, or never risking sedation? I’d start with the cold willow chew. It’s cheap, safe, and checks my top guess.'},
  {who:'byte',text:'A good small test is cheap, safe, and checks the cause we think is most likely.'},
  {who:'byte',text:'She nursed! The quiet barn worked. That’s strong evidence she was scared.'},
  {who:'byte',text:'She still won’t eat. That rules some causes out, and that helps too.'},
  {who:'byte',text:'The exam looked normal. A milk tusk is coming in, but her gums, belly, and blood look fine.'}
];

// ---------- custom steps: the walk out, Observe, and the one-day test ----------
const CALF_OBS={
  parts:{ears:{label:'Ears',calm:['Ears relaxed, flopping a little.','“I’m calm” (65%)'],pulse:['Ears spread out wide and stiff.','“I’m alert” (70%)']},
    trunk:{label:'Trunk',calm:['Trunk brings willow to her mouth.','“I’m hungry?” (40%)'],pulse:['Trunk curls up under her chin.','“I’m worried” (60%)']},
    mouth:{label:'Chewing',calm:['Chews her willow just fine.','“I’m eating” (80%)'],pulse:['Stops chewing mid-bite and drops the willow.','“My mouth hurts” (55%)']},
    feet:{label:'Feet',calm:['Stands on all four feet.','“I’m standing” (90%)'],pulse:['Lifts a front foot, then presses her toes down.','“My foot is sore?” (30%)']},
    head:{label:'Head',calm:['Looks down at the willow.','“I’m looking at food” (50%)'],pulse:['Snaps her head up toward the east ridge.','“I’m looking for Mom?” (35%)']},
    tail:{label:'Tail',calm:['Tail swishes side to side.','“I’m calm” (70%)'],pulse:['Tail lifts up stiff.','“I’m scared” (40%)']},
    cup:{label:'Ruth’s tea',calm:['Ruth’s tea sits still on the post.','The collar can’t see this.'],pulse:['Ripples in Ruth’s tea, and there’s no wind!','The collar can’t see this.']},
    ridge:{label:'East ridge',calm:['A red light blinks on the ridge station.','Outside the collar’s range.'],pulse:['The ridge light flashes fast while she freezes.','Outside the collar’s range.']}},
  lines:{intro:'Watch Aqpik. Tap what she does with her ears, trunk, mouth, feet, head, and tail.',freeze:'She froze! Did you see where she looked?',ask:'So, what do you notice about her freezes?',
    good:'Yes! Mammoths feel low sounds through their feet. If something on that ridge hums, her collar can’t hear it, but she can.',
    bad:'Maybe. But between freezes she chews just fine. Let’s keep that in mind.',unsure:'Let’s keep watching. When she freezes, look where her head points.'},
  choices:{good:'She freezes and looks at the ridge, like she’s listening.',bad:'She stops chewing because her mouth hurts.',unsure:'I’m not sure yet.'}};
function calfObserveStage(){
  // Nuna (her mother) stands behind on the left with her trunk lowered toward Aqpik; Ruth's tea sits on a fence post on the right.
  return `<defs><radialGradient id="nmgnd" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#5a3a1a" stop-opacity=".35"/><stop offset="1" stop-color="#5a3a1a" stop-opacity="0"/></radialGradient></defs>
    <ellipse cx="20" cy="4" rx="190" ry="16" fill="url(#nmgnd)"/>
    <g transform="translate(-205 -4) scale(1.55)" opacity=".97">${nomeMammoth({age:'adult',shadow:false})}</g>
    <g class="nm-grip">${[0,1,2].map(i=>`<ellipse cx="62" cy="2" rx="20" ry="4" style="--d:${i*.35}s"/>`).join('')}</g>
    ${nomeMammoth({id:'nmcalf',sprig:true,cls:'nm-eat'})}
    <g transform="translate(172 0)"><path d="M-5 2 L-4 -62 L4 -62 L5 2Z" fill="#5a4634" stroke="#2e2014" stroke-width="1.6"/><path d="M-4 -60 L-1.4 -60 L-1 0 L-4.6 0Z" fill="#8a6a50"/>
      <rect x="-5" y="-50" width="10" height="2.4" fill="#2f9aa2"/><path d="M-60 -36 L-5 -38 M-60 -20 L-5 -22" stroke="#6a5a48" stroke-width="1" opacity=".7"/>
      <g transform="translate(0 -62)"><path d="M-8 0 L-7 -14 L7 -14 L8 0Z" fill="#c8483a" stroke="#5a1a14" stroke-width="1.4"/><path d="M7 -11 C12 -11 12 -4 7 -4" fill="none" stroke="#5a1a14" stroke-width="1.6"/>
        <ellipse cx="0" cy="-14" rx="7" ry="2" fill="#8a5a2a" stroke="#5a1a14" stroke-width="1"/><g class="nm-cuprip"><ellipse cx="0" cy="-14" rx="2" ry=".6"/><ellipse cx="0" cy="-14" rx="4" ry="1.2" style="--d:.2s"/></g>
        <path d="M-3 -18 C-5 -22 -1 -24 -3 -28 M2 -18 C0 -22 4 -24 2 -28" stroke="#fff" stroke-width="1.2" fill="none" opacity=".6" class="nm-steam"/></g></g>`}
MISSIONS.calf.custom={
  calf_tundra(){const st=calfState();
    screen('walk',`${scene('nome_reserve')}${hud('Kigluaik Mammoth Reserve · Nome')}<div class="props walklayer"><div class="walk-byte">${byteBox({...S.byte,mood:'happy'},'trot')}</div>
      <div class="calf-pj" id="pj"><svg viewBox="-40 -60 170 110">${mini(0,40,{who:'pip',pose:'push',s:1.1})}<g transform="translate(14 6)"><rect x="0" y="0" width="44" height="32" rx="3" fill="#c9a26b" stroke="#7a5426" stroke-width="2"/>
        <text x="22" y="10" text-anchor="middle" font-size="5.4" font-family="Nunito" font-weight="800" fill="#5b3b16" textLength="30" lengthAdjust="spacingAndGlyphs">TOTALLY NORMAL</text><text x="22" y="18" text-anchor="middle" font-size="5.4" font-family="Nunito" font-weight="800" fill="#5b3b16" textLength="22" lengthAdjust="spacingAndGlyphs">WEATHER</text><text x="22" y="26" text-anchor="middle" font-size="5.4" font-family="Nunito" font-weight="800" fill="#5b3b16" textLength="26" lengthAdjust="spacingAndGlyphs">BALLOONS</text></g>${mini(74,40,{who:'jory',pose:'push',s:1.1})}</svg></div></div>
      <div class="caption-card"><p>There’s frost on the cottongrass, and drones hum over the herd. Far up the east ridge, a new weather station blinks.</p><div class="row"><button class="btn small ghost" id="clue">Look at the ridge</button><button class="btn small" id="on">Meet the keeper</button></div></div>`);
    $('#clue').onclick=()=>{st.seen.crate=true;save();$('#pj').classList.add('flee');toast('Two strangers hurry over the ridge with a crate. You noted it.','good');$('#clue').disabled=true};
    $('#on').onclick=()=>nextStep()},
  calf_observe(){const st=calfState();
    nomeObserve({scene:'nome_reserve',place:'North Pasture · Watching Aqpik',vb:'-150 -182 360 192',stage:calfObserveStage(),animal:'nmcalf',calmCls:'nm-eat',pulseCls:'nm-freeze',
      hot:[{part:'tail',x:-56,y:-88,w:24,h:48},{part:'feet',x:-34,y:-36,w:36,h:42},{part:'feet',x:44,y:-38,w:40,h:44},{part:'ears',x:66,y:-132,w:28,h:34},{part:'head',x:94,y:-146,w:40,h:40},
        {part:'trunk',x:116,y:-100,w:34,h:60},{part:'mouth',x:96,y:-88,w:24,h:22},{part:'cup',x:156,y:-92,w:32,h:36}],
      parts:CALF_OBS.parts,order:['ears','trunk','mouth','feet','head','tail','cup','ridge'],animalParts:['ears','trunk','mouth','feet','head','tail'],need:4,
      period:9,pulseAt:4.4,pulseLen:3.6,src:{x:80,y:37.5,part:'ridge'},state:st.log,hint:'Tap what she does.',collarName:'Collar',
      lines:CALF_OBS.lines,choices:CALF_OBS.choices,saw:l=>l.head==='pulse'||l.cup==='pulse'||l.ridge==='pulse',
      onClue(){if(!S.notes.hum){S.notes.hum=true;save();toast('Added to your notebook: she freezes when the ridge hums','good')}unlock('nome-feet')},
      onDone(){unlock('nome-check-translator')&&toast('New Field Guide idea: '+FIELD_GUIDE['nome-check-translator'].title,'good');st.observed=1;save();nextStep()},doneLabel:'Go talk to Eli'})},
  calf_test(){const st=calfState();let pick=st.test||null;const done=!!st.test;
    const bars=(p,old)=>{const q=calfPct(p),o=old?calfPct(old):null;return `<div class="calf-bars">${['fear','tooth','belly','sick'].map(h=>`<div class="calf-bar"><span>${CALF_CAUSE[h]}</span><div class="calf-track">${o?`<i class="old" style="width:${o[h]}%"></i>`:''}<i class="${h}" style="width:${q[h]}%"></i></div><b>${q[h]}%</b></div>`).join('')}</div>`};
    const rec=S.told?'barn':'chew';
    const say=S.told?'The hum is my top suspect, about 60%. What matters more to you: the quickest answer, or never risking sedation? Either way, I’d start with a quiet night in the barn. It’s cheap, safe, and checks the most likely cause.'
      :'My top guess is a sore mouth, about 55%. What matters more to you: the quickest answer, or never risking sedation? I’d start with the cold willow chew. It’s cheap, safe, and checks my top guess.';
    const card=k=>{const T=CALF_TESTS[k];return `<button class="calf-test ${pick===k?'on':''}" data-t="${k}" ${done?'disabled':''}><div class="calf-ticon">${calfTestIcon(k)}</div><div class="calf-tt"><b>${esc(T.name)}</b><span>${T.cost} coins · ${T.risk?T.risk+' in 100 have breathing trouble':'no risk'} · checks: ${T.checks==='all'?'teeth, belly, and blood':esc(CALF_CAUSE[T.checks].toLowerCase())}</span></div></button>`};
    const before=calfBelief(!!S.told,null);
    screen('criteria calf-testscr',`${scene('nome_barn')}${hud('Warming Barn 2 · Friday, 4:30 PM')}<div class="panel-card calf-testcard"><h2>Test small first</h2>
      <div class="byte-note">${byteBox({...S.byte,mood:'think'})}<p>${esc(say)}</p></div>
      ${bars(before)}<div class="calf-tests">${['barn','feed','chew','exam'].map(card).join('')}</div>
      <button class="btn wide" id="run" ${pick&&!done?'':'disabled'}>Run it tonight</button><div id="calfres"></div></div>`);
    if(!done)setTimeout(()=>playLine('byte',say),250);
    $$('.calf-test').forEach(b=>b.onclick=()=>{pick=b.dataset.t;$$('.calf-test').forEach(x=>x.classList.toggle('on',x===b));$('#run').disabled=false});
    const show=()=>{const T=CALF_TESTS[st.test],after=calfBelief(!!S.told);const ok=st.test==='exam'?null:T.result;
      const line=st.test==='exam'?'The exam looked normal. A milk tusk is coming in, but her gums, belly, and blood look fine.':ok?'She nursed! The quiet barn worked. That’s strong evidence she was scared.':'She still won’t eat. That rules some causes out, and that helps too.';
      $('#calfres').innerHTML=`<div class="calf-result ${ok===false?'bad':'good'}"><div class="calf-rvig">${calfTestNight(st.test)}</div><div><h3>${st.test==='exam'?'Exam: nothing wrong found':ok?'Saturday, 7 AM: she ate!':'Saturday, 7 AM: still not eating'}</h3><p>${esc(line)}</p></div></div>
        <div class="calf-upd"><span class="upd-badge">Updated</span> What I think now</div>${bars(after,calfBelief(!!S.told,null))}<button class="btn wide" id="calfgo">Set my goals</button>`;
      $('#calfgo').onclick=()=>nextStep();return line};
    $('#run').onclick=()=>{if(!pick)return;st.test=pick;save();unlock('nome-test-small')&&toast('New Field Guide idea: Test small before going big','good');unlock('nome-base-rate');
      $('#run').disabled=true;$$('.calf-test').forEach(b=>b.disabled=true);
      const ov=document.createElement('div');ov.className='calf-night';ov.innerHTML=`<div class="calf-moon"></div><div class="calf-clock"><b id="calfhr">8 PM</b><span>Friday night</span></div><div class="calf-nvig">${calfTestNight(pick,true)}</div>`;document.body.appendChild(ov);
      const hrs=['8 PM','10 PM','Midnight','2 AM','4 AM','6 AM','7 AM'];let i=0;const tm=setInterval(()=>{i++;const e=$('#calfhr');if(e&&hrs[i])e.textContent=hrs[i];if(i>=hrs.length){clearInterval(tm);ov.classList.add('out');setTimeout(()=>ov.remove(),500);const line=show();playLine('byte',line);$('#calfres').scrollIntoView({behavior:'smooth',block:'start'})}},420)};
    if(done)show()}
};
