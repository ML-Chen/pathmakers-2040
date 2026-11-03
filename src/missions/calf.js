// missions/calf.js — Nome, Alaska. Wildlife Vet and Animal Translator, Day 1: "The Calf Who Stopped Eating".
// A five-month-old woolly mammoth calf, Aqpik, has stopped nursing. Her collar translator is 55% sure her mouth hurts.
// The real cause is a low hum from a fake "weather station" on the east ridge (Pip and Jory's balloon rig, the first
// sign of Sky Veil). The player observes her body language (custom step "observe"), tells Byte what the collar cannot
// hear, picks a cheap one-day test (custom step "test"), then sets what the reserve's autonomous systems may do.
// Pictures: src/viz/calf.js (VIZ.calf*, the mammoth art, Observe and Test screens). Scenes: src/scenes/nome_*.js.
// Mission state lives in S.notes.calf: {test, log, seen} (startMission resets S.notes, so a replay starts fresh).
CAREERS.vet={name:'Wildlife Vet',place:'Nome, Alaska',district:'nome',
  why:'Animals trust the keepers they know, and a person standing next to the animal has to check what a translator says against what the animal really does.'};

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
const CALF_CAPS={barn:'Aqpik is eating in the quiet barn!',herd:'Aqpik is eating with the herd again!',treated:'The exam found what was wrong, and Aqpik is eating again.',tube:'Aqpik is fed through a tube, but she still won’t nurse.',still:'Aqpik still isn’t nursing.',trouble:'Aqpik had trouble breathing under sedation, but the vets helped her.'};

MISSIONS.calf={id:'calf',title:'The Calf Who Stopped Eating',career:'vet',day:1,kind:'workday',year:1,season:'fall',district:'nome',rank:'trainee',
  blurb:'A five-month-old mammoth calf won’t nurse, and the translator in her collar is only 55% sure why.',after:['maya'],
  place:'Kigluaik Mammoth Reserve',
  flow:[{name:'calf_morning',k:'talk',talk:'morning',scene:'nome_barn',place:'Warming Barn 2 · Nome · 7:40 AM'},
    {name:'calf_tundra',k:'custom'},
    {name:'calf_ruth',k:'talk',talk:'ruth',scene:'nome_reserve',place:'North Pasture · Kigluaik Mammoth Reserve'},
    {name:'calf_observe',k:'custom'},
    {name:'calf_eli',k:'talk',talk:'eli',scene:'nome_reserve',place:'East Fence · Kigluaik Mammoth Reserve'},
    {name:'calf_bench',k:'bench'},{name:'calf_test',k:'custom'},{name:'calf_criteria',k:'criteria'},{name:'calf_table',k:'table'},
    {name:'calf_consent',k:'consent'},{name:'calf_memo',k:'memo'},{name:'calf_reveal',k:'reveal'},{name:'calf_debrief',k:'debrief'},{name:'calf_evening',k:'evening'}],
  cast:{
    ruthn:{name:'Ruth Nauyaq',role:'Lead keeper, Kigluaik Mammoth Reserve',skin:'#eec6a2',hair:'#1a1416',hairStyle:'bun',faceShape:'round',eyeShape:'almond',blush:1.5,eye:'#3a2216',shirt:'#1f7f86',nome:'ruth',
      get art(){return typeof nomePerson==='function'?m=>nomePerson(this,m):undefined}},
    eli:{name:'Eli Johnson',role:'Reindeer herder',skin:'#e2b98e',hair:'#221812',hairStyle:'short',faceShape:'broad',eyeShape:'mono',blush:2,accessory:'beanie',eye:'#2e1a10',shirt:'#5c6b3a',nome:'eli',
      get art(){return typeof nomePerson==='function'?m=>nomePerson(this,m):undefined}},
    aqpik:{name:'Aqpik',role:'Mammoth calf, 5 months old · words from her collar translator',get art(){return typeof calfPortrait==='function'?m=>calfPortrait(m):undefined}}
  },
  voices:{ruthn:'af_heart',eli:'am_liam',aqpik:'af_nova'},
  glossary:{
    'woolly mammoth':'A big, shaggy relative of elephants that lived in the Ice Age. In 2040, a small herd lives again on a reserve near Nome. True today: woolly mammoths died out about 4,000 years ago. Some scientists are trying to bring back mammoth-like elephants, but none has been born yet.',
    'mammoth':'A big, shaggy relative of elephants that lived in the Ice Age. In 2040, a few live again near Nome. True today: mammoths are extinct, and nobody has brought one back.',
    'nurse':'When a baby animal drinks milk from its mother.','nursed':'Drank milk from its mother.','nursing':'Drinking milk from its mother.',
    'keeper':'A person who cares for animals every day and knows each one well.',
    'base rate':'How often something happens in general, before you look at the clues in one case.',
    'collar translator':'In 2040, an AI in an animal’s collar that turns its sounds and body language into words, with a number for how sure it is. True today: scientists use AI to study whale clicks and bird calls, but no device can turn what an animal means into words.',
    'milk tusks':'A calf’s first small tusks, which fall out when the grown-up tusks grow in. In 2040, Aqpik’s are just coming in. True today: baby elephants have milk tusks too, and they lose them before they are about a year old.',
    'sedation':'Medicine that puts an animal into a deep sleep so vets can work safely.','sedate':'To give medicine that puts an animal into a deep sleep.',
    'protocol':'A set of steps that a system follows every time a certain thing happens.',
    'hertz':'A count of how many times a sound wave shakes each second. Low sounds have few hertz.',
    'confidence':'How sure someone, or some AI, is that a guess is right.',
    'rumble':'A deep, low sound. Elephants rumble to talk to each other, and mammoths probably did too.',
    'rut':'The fall season when male reindeer compete for mates. The bulls are jumpy and easy to scare.',
    'herd drones':'In 2040, flying robots that guide the mammoth herd from pasture to pasture. True today: some farmers already use drones to move sheep and cattle.',
    'tundra':'Cold, treeless land in the far north. The ground just below it stays frozen all year.',
    'quyanaq':'“Thank you” in Iñupiaq.','iñupiaq':'The Iñupiat are Alaska Native people of northern and northwest Alaska. Iñupiaq is their language.',
    'cloudberry':'A small orange berry that grows on the tundra. In Iñupiaq it is called aqpik.',
    'mash':'Soft, wet food for young animals.','winter mix':'A richer mash that the reserve’s feeder robots switch to when the weather gets cold.',
    'weather station':'A set of sensors that measures wind, rain, and temperature.',
    'quake sensor':'An instrument that feels tiny shakes in the ground.',
    'helium':'A light gas that makes balloons float.',
    'gums':'The soft pink skin around teeth.',
    'reindeer':'Tame relatives of caribou. Families on the Seward Peninsula, where Nome is, have herded reindeer since 1892.',
    'matriarch':'The oldest female who leads an elephant family. Mammoth families were probably led the same way.',
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
    'nome-base-rate':{title:'Base rates',track:'Evidence and truth',text:'Before you look at the clues in one case, ask how often each possible cause happens in general. In the reserve’s 2040 records, a sore mouth is the most common reason a young calf stops eating, so the collar translator guessed a sore mouth first. To believe a less common cause instead, you need strong clues, such as a calf that freezes every time the ground hums.',real:'True today: doctors learn the saying “When you hear hoofbeats, think horses, not zebras.” It means a doctor should check the common causes of an illness before the rare ones.'},
    'nome-check-translator':{title:'Check the translation',track:'Evidence and truth',text:'In 2040, an AI translator in an animal’s collar gives its best guess about what the animal means, along with a number for how sure it is. Compare the translator’s guess with what you can see the animal doing, and ask what the collar’s sensors cannot pick up. Aqpik’s collar could not hear the low hum from the ridge, but Aqpik could feel it through her feet.',real:'True today: scientists use AI to find patterns in sperm whale clicks and bird calls, but nobody can yet translate an animal’s sounds into full sentences.'},
    'nome-test-small':{title:'Test small before going big',track:'Engineering and systems',text:'A cheap, safe test that checks one possible cause is often a better first step than a big, risky test. Whatever the small test shows makes some causes more likely and others less likely, and that makes the next step easier to choose.',real:'True today: vets and doctors often try a simple, safe step first, like changing a diet, before ordering tests that need sedation.'},
    'nome-feet':{title:'Hearing with your feet',track:'Living things and health',text:'Elephants make rumbles too low for people to hear, and they can feel those rumbles travel through the ground with the soft pads of their feet. To listen for a far-off rumble, an elephant freezes, spreads its ears, and presses a foot down.',real:'True today: researchers found that elephants can sense rumbles traveling through the ground, and that the pads of their feet are packed with touch sensors.'},
    'nome-local':{title:'Local knowledge',track:'People skills',text:'People who have lived and worked on the same land for years notice changes that sensors miss. Eli noticed that his reindeer suddenly stopped grazing near the east ridge, and his cousin at the weather service knew that nobody in town had built the new station there.',real:'True today: Arctic scientists work with Iñupiaq hunters, whose knowledge of sea ice and weather goes back many generations.'},
    'nome-who-decides':{title:'What may a machine do alone?',track:'Government, law, and power',text:'Some jobs are fine for a machine to do by itself, like turning on a barn’s heaters. Other jobs, like sedating an animal, should wait until a person who knows what is going on says yes. In 2040, the reserve’s care system can sedate a calf without asking anyone, but that automatic rule has no way to know what Eli saw on the ridge.',real:'True today: autopilots can fly a plane for hours, but a pilot is always in command and decides when to take over.'}
  },
  lessons:{nome_feet:{title:'How elephants hear with their feet',steps:[
      {t:'Elephants make deep [[rumble]]s, and some of those rumbles are too low for people to hear.',viz:'calfRumble',cap:'A rumble too low for us'},
      {t:'Low sounds travel far through the ground, the way a drumbeat travels through a floor.',viz:'calfGroundWave',cap:'Through the ground'},
      {t:'An elephant’s soft footpads are packed with touch sensors that feel the ground shake.',viz:'calfFootpad',cap:'Inside a footpad'},
      {t:'To listen, an elephant freezes, spreads its ears, and may lift one foot and press its toes down. Mammoths were close cousins of elephants, so they probably listened the same way.',viz:'calfListen',cap:'The listening pose'}],
    quiz:[{q:'How can an elephant feel a far-away rumble?',opts:['Through the pads of its feet','By smelling it','With its tail'],a:0,why:'The footpads are packed with touch sensors that feel the ground shake.'},
      {q:'Why could a collar translator miss a very low hum?',opts:['Its microphones can’t hear sounds that low','Hums aren’t real','It only works at night'],a:0,why:'Aqpik’s collar can’t hear sounds below 20 hertz, but Aqpik can still feel those sounds through her feet.'},
      {q:'What does an elephant often do when it listens hard?',opts:['Freezes and spreads its ears','Runs in circles','Lies down to sleep'],a:0,why:'Freezing keeps an elephant’s own body still and quiet, so it can feel the far-off sound better.'}]}},
  lesson:{id:'nome_feet',label:'Learn it fast: how elephants hear with their feet'},
  chatter:{
    nome_reserve:['There’s already termination dust on the Kigluaik Mountains, so winter is coming early this year.','I volunteer here on weekends. The calves are SO fluffy.','My grandma says the cranes left two weeks early this year.','Did you see the sunset last night? It was almost white.','The new port had three ships docked at once yesterday, which is a lot for Nome.','I’m learning Iñupiaq with my daughter. She corrects my accent.','Watch your step, because mammoths leave big holes in soft ground.'],
    nome_barn:['Warming Barn 2 is the warmest place on the reserve, and the calves love it.','The feeder robots never forget a meal, but I sometimes forget my own lunch.']},
  talks:{
    morning:[
      {who:'byte',mood:'happy',text:'Good morning, Doctor! Welcome to Nome, and to your first day as a wildlife vet.'},
      {who:'byte',mood:'neutral',text:'Here’s what the reserve’s machines did overnight. The feeder robots switched the calves to their [[winter mix]], the [[herd drones]] moved the mammoth herd away from a fox, and the heaters in this barn ran their weekly test.'},
      {who:'byte',mood:'think',text:'One thing is worrying me, though. Aqpik, a five-month-old [[woolly mammoth]] calf, hasn’t [[nursed]] since yesterday morning, and her [[collar translator]] is 55% sure that her mouth hurts.',choices:[
        {t:'What’s my job today?',reply:'Your job is to find out why Aqpik stopped eating and to decide what the reserve’s machines are allowed to do about it. Many of those machines act without asking anyone first, so a vet like you picks the rules they follow and signs the plan to show you’re responsible for it.'},
        {t:'55% isn’t very sure.',reply:'Right! A 55% guess is only a little better than flipping a coin, so we’ll check the translator’s guess against what we can see Aqpik doing with our own eyes.'},
        {t:'Wait, mammoths are real?',reply:'Here in 2040 they are, and this little herd is one of the first. Back in the 2020s, woolly mammoths were still extinct, and scientists were only starting to try to bring them back.'}]}
    ],
    ruth:[
      {who:'ruthn',mood:'smile',text:'You must be the new vet. I’m Ruth Nauyaq, the lead [[keeper]]. [[Quyanaq]] for coming out so early.'},
      {who:'ruthn',mood:'happy',text:'That’s Aqpik, standing beside her mother, Nuna. We give every calf an [[Iñupiaq]] name, and Aqpik means [[cloudberry]], a small orange berry. We picked that name because her hair is the same orange.'},
      {who:'aqpik',mood:'worried',text:'Collar translator, 55% sure: “My mouth hurts.”'},
      {who:'ruthn',mood:'worried',text:'Aqpik hasn’t nursed since yesterday morning. A calf her age drinks milk all day long, and after about three days without milk, she’ll get weak.'},
      {who:'ruthn',mood:'think',text:'Maybe her mouth does hurt, because her [[milk tusks]] are almost in. But I’ve watched calves teethe for twelve years, and a teething calf fusses and rubs her [[gums]] on everything. Aqpik isn’t doing that.',choices:[
        {t:'What does she do instead?',good:true,mood:'smile',reply:'Go watch her yourself, and look at her feet as well as her face. Mammoths can feel low sounds through their feet, so their feet can show you when they’re listening to something.'},
        {t:'Should we trust the translator?',mood:'neutral',reply:'Mostly. The translator is very good, but it only knows what the sensors in her collar pick up. It hasn’t spent years out here watching calves the way I have.'}]},
      {who:'ruthn',mood:'stern',text:'There’s one more thing you should know. If Aqpik hasn’t eaten by six on Sunday morning, the reserve’s care system will [[sedate]] her without asking anyone. Drones would shoot her with a dart of sleeping medicine, robots would feed her through a tube, and no person has to approve any of it first.'},
      {who:'ruthn',mood:'neutral',text:'Today, you get to decide whether we keep that Sunday rule or change it.'}
    ],
    eli:[
      {who:'eli',mood:'smile',text:'Hey, Doc. I’m Eli Johnson. My Iñupiaq name is Tuttu, after my great-grandpa, who herded [[reindeer]] on this same land.'},
      {who:'eli',mood:'neutral',text:'My family’s reindeer graze just east of your fence. It’s the [[rut]] right now, so the male reindeer are jumpy. Every morning your [[herd drones]] buzz along the fence, and my reindeer run off in every direction.'},
      {who:'eli',mood:'stern',text:'I asked the reserve to keep its drones away from our side of the fence, and all I got back was a polite message. I’d like to talk about it with an actual person.'},
      {who:'eli',mood:'think',text:'Something else is strange, too. Since Tuesday, my reindeer won’t graze near the east ridge, and Tuesday is when a new [[weather station]] went up on that ridge.',clue:'hum'},
      {who:'eli',mood:'worried',text:'My cousin works for the weather service in town, and she says the weather service didn’t put any station on that ridge.',choices:[
        {t:'Thanks. That might matter for Aqpik too.',good:true,mood:'surprised',reply:'Huh. You think whatever’s bothering my reindeer is bothering the calf too? Then let’s find out what that thing on the ridge is.'},
        {t:'Maybe the drones scared your reindeer.',mood:'stern',reply:'Maybe, but my reindeer have seen drones for years, and they never stayed away from the ridge before.'}]}
    ]
  },
  docs:[
    {id:'cmemo',title:'Byte’s memo: Why won’t Aqpik eat?',from:'Byte',kind:'memo',steps:[
      {t:'Aqpik is a five-month-old [[woolly mammoth]] calf. She still drinks her mother’s milk many times a day.',viz:'calfNurse',cap:'Aqpik and her mother, Nuna'},
      {t:'Aqpik has not [[nursed]] or eaten since yesterday morning, about 24 hours ago.',viz:'calfClock',cap:'Hours without milk'},
      {t:'A calf her age gets weak after about three days without milk, so we need her eating again by about Sunday morning.',viz:'calfEnergy',cap:'Time to act'},
      {t:'Before looking at Aqpik’s own clues, I start with the [[base rate]], which is how often each possible cause makes calves her age stop eating.',viz:'calfBaseIdea',cap:'Start with the base rate'},
      {t:'In 100 young calves that stopped eating, about 40 had sore mouths from new teeth, 25 had upset bellies, 20 were scared, and 15 were sick.',viz:'calfBaseGrid',cap:'Out of 100 calves'},
      {t:'Aqpik’s [[collar translator]] reads her sounds and body language, and it is 55% sure that her mouth hurts.',viz:'calfCollarSays',cap:'The translator’s best guess'},
      {t:'Aqpik’s [[milk tusks]] should come in soon, and new tusks can make a calf’s [[gums]] sore.',viz:'calfTusk',cap:'Milk tusks coming in'},
      {t:'Putting the base rate and the collar’s guess together, my forecast for why Aqpik stopped eating is: sore mouth 55%, upset belly 20%, scared 15%, sick 10%.',viz:'calfForecast',args:{p:{tooth:55,belly:20,fear:15,sick:10}},cap:'My forecast',
        alt:{t:'Update: every few minutes, a hum too low for Aqpik’s collar to hear comes from the east ridge, and Aqpik freezes each time. My new forecast for why she stopped eating is: scared 60%, sore mouth 20%, upset belly 12%, sick 8%.',args:{p:{fear:60,tooth:20,belly:12,sick:8},upd:1},cap:'Updated forecast'}},
      {t:'Three of the causes each have a cheap test that takes one day: a quiet night in the barn for fear, the old mash for an upset belly, and a cold willow chew for a sore mouth.',viz:'calfTests',cap:'Three small tests'},
      {t:'A full exam of her teeth, belly, and blood needs [[sedation]] and costs 400 coins, and about 3 in 100 sedated calves have trouble breathing.',viz:'calfExamRisk',cap:'The big test'},
      {t:'If Aqpik still has not eaten by 6 AM on Sunday, the reserve’s care system will sedate her without asking anyone.',viz:'calfProtocol',cap:'The automatic rule'}
    ]},
    {id:'ccollar',title:'Collar translator: Aqpik’s last 24 hours',from:'Collar translator',kind:'translator',steps:[
      {t:'This collar listens to Aqpik’s rumbles and squeaks, and its motion sensors track how she moves her ears, trunk, head, and legs.',viz:'calfSensors',cap:'What the collar senses'},
      {t:'She held her ears out wide and stiff 31 times, which I translate as “I’m alert” (70% sure).',viz:'calfEarsOut',cap:'Ears'},
      {t:'She stopped chewing in the middle of a bite 9 times, which I translate as “My mouth hurts” (55% sure).',viz:'calfChewStop',cap:'Chewing'},
      {t:'She curled her trunk up under her chin, which I translate as “I’m worried” (60% sure).',viz:'calfTrunkCurl',cap:'Trunk'},
      {t:'She lifted a front foot and held it still, which I translate as “Maybe my foot is sore” (30% sure).',viz:'calfFootUp',cap:'Feet'},
      {t:'Most of these movements happen at the same moment, every few minutes, and I could not find what makes her do them.',viz:'calfTogether',cap:'They happen together'},
      {t:'My microphones cannot hear sounds lower than 20 [[hertz]], which is also about the lowest sound that people can hear.',viz:'calfHearing',cap:'What the collar can hear'},
      {t:'Each percent I give is my [[confidence]], meaning how sure I am, and even a guess I am quite sure about can be wrong.',viz:'calfConfidence',cap:'A guess, not a fact'},
      {t:'I do not change the way I translate while I work. The company that made me sends updates, and the reserve has to approve each update first.',viz:'calfUpdates',cap:'How the collar improves'}
    ]},
    {id:'clog',title:'Reserve systems: overnight log',from:'Kigluaik Reserve systems',kind:'log',steps:[
      {t:'2:10 AM. The feeder robots switched the calves’ [[mash]] to the [[winter mix]], as scheduled.',viz:'calfFeeder',cap:'Feeders'},
      {t:'3:40 AM. The [[herd drones]] moved the mammoth herd 2 kilometers west, away from a fox.',viz:'calfDroneHerd',cap:'Herd drones'},
      {t:'4:00 AM. Warming Barn 2 ran its weekly heater test, and every heater worked.',viz:'calfBarnHeat',cap:'Warming barns'},
      {t:'5:15 AM. A new [[weather station]] on the east ridge joined the weather network.',viz:'calfNewStation',cap:'Weather network'},
      {t:'The station is outside the reserve fence, so reserve drones may not [[inspect]] it without a person’s [[permission]].',viz:'calfFence',cap:'Permissions'},
      {t:'Care [[protocol]]: if Aqpik has not eaten by Sunday at 6:00 AM, sedate her, feed her by tube, and scan her teeth.',viz:'calfProtocolSteps',cap:'Care system'},
      {t:'The care system will follow this protocol by itself, without asking anyone, unless a keeper changes the rule.',viz:'calfAutoSwitch',cap:'Who decides'},
      {t:'7:00 AM. Fence drones will fly the east fence line again, next to Eli Johnson’s reindeer.',viz:'calfFencePatrol',cap:'Fence patrol'}
    ]},
    {id:'cledger',title:'The Ledger: Nome',from:'News',kind:'ledger',steps:[
      {t:'Nome’s new deep-water port welcomed its 200th ship of the year.',viz:'calfPort',cap:'Port of Nome'},
      {t:'Sunsets over [[Norton Sound]] have looked strangely white all week.',viz:'calfWhiteSunset',cap:'White sunsets'},
      {t:'Bird watchers say flocks of sandhill cranes flew out over the sea and then turned back toward land.',viz:'calfCranes',cap:'Cranes turning back'},
      {t:'Inspectors who check that countries follow an international treaty are asking why sales of [[helium]] in Nome tripled this month.',viz:'calfHelium',cap:'A helium mystery'}
    ]}
  ],
  react:{cmemo2:'A calf can only go about three days without milk, so we don’t have much time.',cmemo3:'I start with the causes that are most common in calves, and then I look at Aqpik’s own clues.',cmemo4:'A sore mouth is the most common cause, but only 40 of those 100 calves had one.',ccollar5:'Aqpik does all of these at the same moment, so I wonder what sets them off.',ccollar6:'Some elephant rumbles are lower than 20 hertz. The collar would miss those.',clog4:'The station is outside the fence, so a person has to say yes before a drone can check it.',clog6:'The care system can sedate her without any person signing first, and that worries me a little.',cledger1:'Sunsets over the sea are usually orange or red, so white ones are strange.',cledger3:'Helium is the gas that makes balloons float, so someone in Nome may be filling a lot of balloons.'},
  tell:{clue:'hum',label:'Tell Byte about the ridge',note:'Thanks! I checked the reserve’s quake sensor, and every few minutes it picks up a hum from the east ridge that is too low for Aqpik’s collar to hear. Aqpik freezes each time the hum comes. Now I think there’s about a 60% chance she stopped eating because she’s scared, and the chance of a sore mouth drops to 20%.',guide:'nome-local',doc:'cmemo'},
  criteria:[{id:'eats',label:'Aqpik eats again by Monday'},{id:'nosed',label:'No [[sedation]]'},{id:'cause',label:'Find what upset her'},{id:'eli',label:'Eli’s reindeer left in peace'}],
  criteriaHint:'Not sure what one means? <button class="gw" data-w="sedation">Sedation</button> means medicine that puts an animal into a deep sleep.',
  criteriaNote:'If you choose what you want for Aqpik before you look at the options, an option that only sounds good is less likely to fool you.',
  controls:[{key:'care',label:'Aqpik’s next two days',opts:[['barn','Quiet barn'],['pasture','Back with the herd'],['exam','Full exam']]},
    {key:'ridge',label:'The ridge station',opts:[['leave','Leave it'],['drone','Camera drone'],['eli','Eli checks it']]},
    {key:'auto',label:'Sunday’s care protocol',opts:[['auto','Runs on its own'],['ask','A keeper signs first']]}],
  start:{care:'pasture',ridge:'leave',auto:'auto'},
  planName(c){return {barn:'Quiet barn',pasture:'Back with the herd',exam:'Full exam'}[c.care]+', '+{leave:'leave the ridge',drone:'camera drone to the ridge',eli:'Eli checks the ridge'}[c.ridge]+', '+(c.auto==='auto'?'care protocol runs on its own':'a keeper signs first')},
  outcomes(c,knows){const st=calfState(),p=calfBelief(knows),linked=!!knows,ate1=st.test==='barn',examDone=st.test==='exam';const m={};
    for(const h of CALF_H){if(!(p[h]>0))continue;for(const [k,q,f] of calfBranches(h,c,linked,ate1,examDone)){const key=k+JSON.stringify(f);(m[key]=m[key]||{kind:k,p:0,flags:f}).p+=p[h]*q}}
    return Object.values(m).map(o=>({...o,cap:CALF_CAPS[o.kind]+(o.flags.cause&&o.kind!=='treated'&&linked?' Someone found the machine on the ridge that was making the hum.':'')})).filter(o=>o.p>1e-9)},
  truth(){return 'truth'},knows(){return !!S.told},
  why(c){const f=forecastFor(c),e=Math.round(100*f.eats),n=Math.round(100*f.nosed),k=Math.round(100*f.cause),l=Math.round(100*f.eli);const st=calfState();
    const care={barn:'In the warming barn she is far from the ridge, with her mother beside her.',pasture:'On the pasture she stays with the herd, close enough to the ridge to feel any hum that comes from it.',exam:'An exam checks her teeth, belly, and blood, but it needs sedation.'}[c.care];
    const ridge={leave:'Nobody goes to look at the station on the ridge.',drone:'A camera-only drone photographs the ridge station this morning, but it flies over Eli’s reindeer during the rut.',eli:'Eli rides up to the station on his [[four-wheeler]] tonight, so we learn what it is a day later than a drone would tell us, but his reindeer stay calm.'}[c.ridge];
    const auto=c.auto==='auto'?'If she hasn’t eaten by Sunday at 6 AM, the care system sedates her without asking anyone.':'On Sunday at 6 AM, the care system asks Ruth before it sedates her, and Ruth can try something else first.';
    return `<b>${this.planName(c)}:</b> Aqpik eats again by Monday in about ${e}% of the possible futures, and she avoids sedation in about ${n}% of them. We find out what upset her in about ${k}%, and Eli’s reindeer are left in peace in about ${l}%. ${rich(care+' '+ridge+' '+auto)}${S.told?'':' I still don’t know of anything on the ridge that could scare her.'}`},
  whyGuide(c){return c.auto==='ask'?'nome-who-decides':'nome-test-small'},
  vignette(kind){return typeof calfVignette==='function'?calfVignette(kind):vignette('healed')},
  debriefScene:'nome_barn',eveningScene:'nome_dusk',eveningPlace:'Nome · 8:40 PM',
  get eveningMood(){const k=typeof S!=='undefined'&&S.result&&S.result.kind;return k==='still'||k==='tube'||k==='trouble'?'neutral':'happy'},
  consent:{scene:'nome_reserve',place:'North Pasture · Kigluaik Mammoth Reserve',left:'eli',right:'ruthn',title:'Ruth and Eli',role:'Lead keeper and reindeer herder',prompt:'So what’s your plan for Aqpik, Doc? And what should we do about that station on the ridge?',replyWho:'ruthn',heart:'ruthn',
    opts(c,M){const f=forecastFor(c),e=f.eats;
      const care={barn:'I’d keep Aqpik and Nuna in the quiet warming barn for two days, far from the ridge.',pasture:'I’d put Aqpik back out with the herd, so she can stay close to Nuna.',exam:'I’d give Aqpik a full exam today, which means the vets would have to sedate her.'}[c.care];
      const ridge={leave:'As for the ridge, I’d leave that station alone for now.',drone:'I’d send a camera drone to photograph the station on the ridge. I’m sorry, Eli, but the drone would fly over your reindeer.',eli:'Eli, could you ride up to the ridge station tonight and take a look at it?'}[c.ridge];
      const odds=e>=.85?'I think she’ll very likely be eating again by Monday.':e>=.6?'There’s a good chance she’ll be eating again by Monday, but I can’t promise it.':e>=.35?'She might be eating again by Monday, but honestly, it could go either way.':'I have to be honest with you: with this plan, she probably won’t be eating by Monday.';
      const auto=c.auto==='ask'?'If she hasn’t eaten by Sunday morning, the care system will ask Ruth before it sedates her.':'If she hasn’t eaten by Sunday morning, the care system will sedate her on its own.';
      return [{t:`${care} ${ridge} ${odds} ${auto} What do you two think?`,good:true,mood:'smile',
          reply:c.ridge==='drone'?'Eli won’t like having a drone over his reindeer, but you told us honestly what would happen. Let’s do it.':'Thank you for being honest with us about what could happen. I can support that plan.'},
        {t:'The collar translator listens to Aqpik all day, so it knows her better than any of us do. Its numbers are better than our guesses. It says her mouth hurts, so I think we should treat her sore mouth and let the care system handle everything else. That station on the ridge isn’t really our business, so let’s leave it alone.',good:false,mood:'worried',reply:'The translator is a smart tool, but it only knows what its collar can sense, and you saw things today that it missed. What would you do, based on what you saw yourself?'},
        {t:'Don’t worry, you two. Young calves skip meals all the time, and I’m sure she’ll be eating again by tonight. Calves are tougher than they look. We don’t need to change the care system, and nobody has to go up to the ridge. Let’s just wait and see, because I know she’ll be fine.',good:false,mood:'surprised',reply:'You can’t be sure of that, because some of the futures we saw on the Future Table went badly. Please don’t promise what you can’t know.'}]}},
  memo:{starters:['I recommend ','because ','The chance she eats again by Monday is about ','For Aqpik and Eli, ','We will check by '],placeholder:'I recommend keeping Aqpik in the quiet barn because…',
    plan:/barn|pasture|herd|exam|sedat|drone|ridge|protocol|eli |eli’|eli's|test/,careLabel:'Includes what matters to Aqpik or Eli',care:/aqpik|calf|she |her |nuna|ruth|eli|reindeer|mother/,signAs:'Dr. ',topic:'Aqpik, a mammoth calf who stopped nursing'},
  reveal:{days(){return 3},who:'ruthn',
    lines:{barn:'Aqpik is nursing again! Nuna rumbled to her all night, and this morning Aqpik ate her mash too.',herd:'Look at Aqpik! She’s back with the herd and eating as if nothing ever happened.',
      treated:'The vets found what was wrong with Aqpik and fixed it, and she’s eating again.',tube:'The feeding tube kept Aqpik fed, but she still won’t nurse on her own, so something is still bothering her.',
      still:'Aqpik still won’t nurse. We’ll keep trying new things, and I’m not giving up on her.',trouble:'Aqpik’s breathing slowed while she was sedated. The vets helped her breathe, and she’s okay now, but it was scary.'},
    mood(k){return k==='barn'||k==='herd'||k==='treated'?'happy':k==='trouble'||k==='still'?'sad':'worried'}},
  trap(c){const t=calfState().test;return {ok:!!S.told,text:S.told?'You noticed that Aqpik froze and looked toward the ridge, and you told '+S.byte.name+', so the forecast included the hum from the ridge.'+(t==='barn'?' Then your quiet night in the barn tested that idea cheaply.':''):'You didn’t tell '+S.byte.name+' what you saw toward the ridge, so the forecast missed the most likely cause, which was a hum too low for Aqpik’s collar to hear.'}},
  byteGood:'Nice work, Doctor. You watched Aqpik closely, checked the collar translator’s guess against what you saw, and tried a cheap, safe test before a risky one.',
  // The evening closes the day: how it turned out for Aqpik, Nuna, Eli and the keepers, then one plain news item.
  evening(){const c=S.choice||{},k=(S.result&&S.result.kind)||'herd',found=c.ridge&&c.ridge!=='leave';
    const calf={barn:'“Ruth sent a photo from Warming Barn 2. Aqpik is asleep against Nuna’s front legs, with willow leaves still stuck in her fur.”',
      herd:'“Ruth sent a photo from the north pasture. Aqpik is grazing right beside Nuna again, and she nursed four times this afternoon.”',
      treated:'“Ruth says Aqpik ate a whole bowl of mash after the vets fixed what was wrong, and she spent the afternoon leaning against Nuna.”',
      tube:'“Ruth is spending the night in the barn with Aqpik. The tube is keeping her fed, and Nuna hasn’t left her side.”',
      still:'“Ruth is staying in the barn with Aqpik tonight. Aqpik still isn’t nursing, so the vets will try again in the morning, and Nuna is right beside her.”',
      trouble:'“Aqpik is breathing normally again. Ruth wrapped her in a warm blanket, and Nuna rumbled to her until she fell asleep.”'}[k]||'';
    const eli={drone:'“Eli’s reindeer scattered when the camera drone flew over, but he found every one of them before dinner.”',
      eli:'“Eli rode up to the ridge on his four-wheeler and took photos for the state trooper. His reindeer grazed calmly the whole time.”',
      leave:'“Eli says his reindeer still won’t graze near the east ridge, but at least no drone flew over them today.”'}[c.ridge]||'';
    const news=found?'“The state trooper looked at the ridge photos. The ‘weather station’ on the east ridge was really a balloon launcher with a humming pump. The launcher has been switched off, and the ground near the barns is quiet again.”'
      :'“The Ledger says the weather service still doesn’t know who put up the station on the east ridge. A state trooper plans to drive up and look at it tomorrow morning.”';
    return [`<b>${esc(S.byte.name)}:</b> ${calf}`,eli,news].filter(Boolean)},
  brief(){const st=calfState(),p=calfPct(calfBelief(!!S.told));return `Current case: Aqpik, a 5-month-old woolly mammoth calf at the Kigluaik Mammoth Reserve near Nome, Alaska, stopped nursing Thursday morning. It is Friday. Her mother is Nuna; the lead keeper is Ruth Nauyaq; Eli Johnson herds reindeer east of the fence and wants the reserve's fence drones off his land during the rut. Base rates in 100 young calves that stop eating: 40 sore mouth (teeth), 25 upset belly, 20 scared, 15 sick. Her collar translator is 55% sure her mouth hurts (milk tusks due soon). The collar cannot hear below 20 hertz. The feeders switched to the winter mash on schedule. A new "weather station" appeared on the east ridge Tuesday, outside the fence; reserve drones need a person's permission to inspect it; the weather service says it isn't theirs. Care protocol: if she hasn't eaten by Sunday 6 AM, drones sedate her and robots tube-feed her and scan her teeth, with no signature needed (about 3 in 100 calves have breathing trouble under sedation; a full exam costs 400 coins). One-day tests: quiet night in the warming barn (40 coins, checks fear), old summer mash (10 coins, checks belly), cold willow chew (5 coins, checks sore gums).
What you know now: ${S.told?'The player told you about the ridge; you checked the quake sensor and found a hum below 20 hertz every few minutes, and Aqpik freezes each time.':'Nothing about the ridge yet. Her freezes every few minutes have no known trigger.'} ${st.test?'The one-day test was '+CALF_TESTS[st.test].name+': '+(st.test==='exam'?'the exam looked normal (a milk tusk is coming in, which is normal; belly and blood fine), and she was tube-fed once.':CALF_TESTS[st.test].result?'she nursed and ate overnight.':'she still would not eat.'):'No test has been run yet.'} Your forecast of the cause now: scared ${p.fear}%, sore mouth ${p.tooth}%, upset belly ${p.belly}%, sick ${p.sick}%.
The key consideration when asked what to do: ${S.told?'the ridge hum, which only her feet can feel; test the cheap, safe option that checks the most likely cause, and decide whether the care system may sedate her without asking':'ask whether the player saw anything when she freezes, especially toward the east ridge, and whether anyone mentioned the new station'}.`},
  canned(q){const st=calfState();
    if(/hum|ridge|station|feet|foot|vibrat|shak|ripple|listen|ground/.test(q)){if(!S.told){S.notes.hum=true;S.told=true;save();unlock('nome-local');return 'Woof, good catch! I checked the reserve’s quake sensor, and every few minutes it picks up a hum from the east ridge that is too low for Aqpik’s collar to hear. Aqpik freezes each time the hum comes. Now I think there’s about a 60% chance she stopped eating because she’s scared, and the chance of a sore mouth drops to 20%.'}
      return S.told?'My best guess is that the hum from the ridge is scaring Aqpik. Her collar can’t hear that hum, but she can feel it through her feet. A quiet night in the warming barn, far from the ridge, would be a cheap way to test that idea.':'Mammoths can feel low rumbles through their feet. Did you notice anything when Aqpik froze? Watch which way she looks when it happens.'}
    if(/beat|win|how do i|what do i do|stuck|help/.test(q))return 'Here’s what to do: watch Aqpik closely, read the documents, and tell me anything you notice that her collar can’t sense. Then pick one small test, choose what the reserve’s machines are allowed to do, explain your plan to Ruth and Eli, and sign it.';
    if(/which test|test|best|pick|choose|should|recommend/.test(q))return S.told?'A good first test is cheap and safe, and it checks the most likely cause. The ridge hum is now the most likely cause, so the best first test is a quiet night in the warming barn. What matters most to you: the fastest answer, or never risking sedation?':'Did you see anything happen when Aqpik froze? Also, what matters most to you: the fastest answer, or the safest one? Right now my top guess is a sore mouth, and the cold willow chew tests for that.';
    if(/translat|collar|55/.test(q))return 'Her collar reads sounds and body language and gives each guess a confidence number. It’s good, but it can’t hear sounds below 20 hertz, and it didn’t know what was happening on the ridge.';
    if(/sedat|exam|dart/.test(q))return 'A full exam needs sedation, which is like a very deep sleep. About 3 in 100 calves have trouble breathing under it, and it costs 400 coins. It checks her teeth, belly, and blood, but it can’t tell whether she’s scared.';
    if(/protocol|auto|sunday/.test(q))return 'If she hasn’t eaten by Sunday at 6 AM, the care system will sedate her and feed her by tube, all on its own. You can change that so a keeper has to sign first.';
    if(/eli|reindeer|rut/.test(q))return 'Eli’s family has herded reindeer here for generations. It’s the rut, so his male reindeer scare easily, and the reserve’s fence drones fly right along the edge of his land.';
    if(/mammoth|calf|aqpik|nuna/.test(q))return 'Aqpik is five months old and about a meter tall at the shoulder, and she still nurses many times a day. Elephant calves nurse for two years or more, and mammoth calves probably did too.';
    return null}
};
MISSIONS.calf.lines=[
  {who:'byte',text:'Thanks! I checked the reserve’s quake sensor, and every few minutes it picks up a hum from the east ridge that is too low for Aqpik’s collar to hear. Aqpik freezes each time the hum comes. Now I think there’s about a 60% chance she stopped eating because she’s scared, and the chance of a sore mouth drops to 20%.'},
  {who:'ruthn',text:'Eli won’t like having a drone over his reindeer, but you told us honestly what would happen. Let’s do it.'},
  {who:'ruthn',text:'Thank you for being honest with us about what could happen. I can support that plan.'},
  {who:'ruthn',text:'The translator is a smart tool, but it only knows what its collar can sense, and you saw things today that it missed. What would you do, based on what you saw yourself?'},
  {who:'ruthn',text:'You can’t be sure of that, because some of the futures we saw on the Future Table went badly. Please don’t promise what you can’t know.'},
  {who:'byte',text:'Watch Aqpik. Tap what she does with her ears, trunk, mouth, feet, head, and tail.'},
  {who:'byte',text:'Aqpik just froze! Did you see which way she was looking?'},
  {who:'byte',text:'What did you notice about the moments when Aqpik freezes?'},
  {who:'byte',text:'Yes! Mammoths can feel very low sounds through their feet. If something on that ridge is making a low hum, her collar can’t hear it, but Aqpik can feel it.'},
  {who:'byte',text:'Maybe, but when she isn’t frozen, she chews her willow just fine, so a sore mouth doesn’t explain everything she does.'},
  {who:'byte',text:'Let’s keep watching. The next time she freezes, look at which way her head points.'},
  {who:'byte',text:'My best guess, at about 60%, is that the hum from the ridge scared her. What matters more to you: the quickest answer, or never risking sedation? Either way, I’d start with a quiet night in the warming barn, because it’s cheap and safe and it checks the most likely cause.'},
  {who:'byte',text:'My best guess, at about 55%, is that her mouth is sore. What matters more to you: the quickest answer, or never risking sedation? I’d start with the cold willow chew, because it’s cheap and safe and it checks for a sore mouth.'},
  {who:'byte',text:'A good first test is cheap and safe, and it checks the cause we think is most likely.'},
  {who:'byte',text:'Aqpik nursed during her quiet night in the barn! That’s strong evidence that fear was what stopped her from eating.'},
  {who:'byte',text:'Aqpik still won’t eat. That makes the cause this test checked less likely, which helps us narrow down the real cause.'},
  {who:'byte',text:'The exam found nothing wrong. A milk tusk is coming in, but Aqpik’s gums, belly, and blood all look healthy.'}
];

// ---------- custom steps: the walk out, Observe, and the one-day test ----------
const CALF_OBS={
  parts:{ears:{label:'Ears',short:'Ears',calm:['Her ears are relaxed and flop a little.','“I’m calm” (65%)'],pulse:['Her ears spread out wide and stiff.','“I’m alert” (70%)']},
    trunk:{label:'Trunk',short:'Trunk',calm:['Her trunk brings willow to her mouth.','“Maybe I’m hungry” (40%)'],pulse:['Her trunk curls up under her chin.','“I’m worried” (60%)']},
    mouth:{label:'Chewing',short:'Mouth',calm:['She chews her willow just fine.','“I’m eating” (80%)'],pulse:['She stops chewing mid-bite and drops the willow.','“My mouth hurts” (55%)']},
    feet:{label:'Feet',short:'Feet',calm:['She stands on all four feet.','“I’m standing” (90%)'],pulse:['She lifts a front foot, then presses her toes down.','“Maybe my foot is sore” (30%)']},
    head:{label:'Head',short:'Head',calm:['She looks down at the willow.','“I’m looking at food” (50%)'],pulse:['She snaps her head up toward the east ridge.','“Maybe I’m looking for Mom” (35%)']},
    tail:{label:'Tail',short:'Tail',calm:['Her tail swishes from side to side.','“I’m calm” (70%)'],pulse:['Her tail sticks up, stiff.','“I’m scared” (40%)']},
    cup:{label:'Ruth’s tea',short:'Tea',calm:['Ruth’s tea sits still on the post.','Nothing, because it can’t sense the tea.'],pulse:['Ripples spread across Ruth’s tea, even though there’s no wind!','Nothing, because it can’t sense the tea.']},
    ridge:{label:'East ridge',short:'Ridge',calm:['A red light blinks on the ridge station.','Nothing, because the ridge is too far away.'],pulse:['The light on the ridge station flashes fast while she freezes.','Nothing, because the ridge is too far away.']}},
  lines:{intro:'Watch Aqpik. Tap what she does with her ears, trunk, mouth, feet, head, and tail.',freeze:'Aqpik just froze! Did you see which way she was looking?',ask:'What did you notice about the moments when Aqpik freezes?',
    good:'Yes! Mammoths can feel very low sounds through their feet. If something on that ridge is making a low hum, her collar can’t hear it, but Aqpik can feel it.',
    bad:'Maybe, but when she isn’t frozen, she chews her willow just fine, so a sore mouth doesn’t explain everything she does.',unsure:'Let’s keep watching. The next time she freezes, look at which way her head points.'},
  choices:{good:'She freezes and looks at the ridge, like she’s listening.',bad:'She stops chewing because her mouth hurts.',unsure:'I’m not sure yet.'}};
function calfObserveStage(){
  // Nuna (her mother) stands behind on the left with her trunk lowered toward Aqpik; Ruth's tea sits on a fence post on the right.
  return `<defs><radialGradient id="nmgnd" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#5a3a1a" stop-opacity=".35"/><stop offset="1" stop-color="#5a3a1a" stop-opacity="0"/></radialGradient></defs>
    <ellipse cx="20" cy="4" rx="190" ry="16" fill="url(#nmgnd)"/>
    <g transform="translate(-222 -4) scale(1.55)" opacity=".97">${nomeMammoth({age:'adult',shadow:false})}</g>
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
      <div class="caption-card"><p>There’s frost on the cottongrass, and drones hum over the mammoth herd. Far up on the east ridge, a light blinks on a new weather station.</p><div class="row"><button class="btn small ghost" id="clue">Look at the ridge</button><button class="btn small" id="on">Meet the keeper</button></div></div>`);
    $('#clue').onclick=()=>{st.seen.crate=true;save();$('#pj').classList.add('flee');toast('Two strangers hurry over the ridge carrying a crate, and you make a note of it.','good');$('#clue').disabled=true};
    $('#on').onclick=()=>nextStep()},
  calf_observe(){const st=calfState();
    nomeObserve({scene:'nome_reserve',place:'North Pasture · Watching Aqpik',vb:'-150 -182 360 192',stage:calfObserveStage(),animal:'nmcalf',calmCls:'nm-eat',pulseCls:'nm-freeze',
      hot:[{part:'tail',x:-56,y:-88,w:24,h:48},{part:'feet',x:-34,y:-36,w:36,h:42},{part:'feet',x:44,y:-38,w:40,h:44},{part:'ears',x:66,y:-132,w:28,h:34},{part:'head',x:94,y:-146,w:40,h:40},
        {part:'trunk',x:116,y:-100,w:34,h:60},{part:'mouth',x:96,y:-88,w:24,h:22},{part:'cup',x:156,y:-92,w:32,h:36}],
      parts:CALF_OBS.parts,order:['ears','trunk','mouth','feet','head','tail','cup','ridge'],animalParts:['ears','trunk','mouth','feet','head','tail'],need:4,
      period:9,pulseAt:4.4,pulseLen:3.6,src:{x:80,y:37.5,part:'ridge'},state:st.log,hint:'Tap what she does.',collarName:'Collar',
      lines:CALF_OBS.lines,choices:CALF_OBS.choices,saw:l=>l.head==='pulse'||l.cup==='pulse'||l.ridge==='pulse',
      onClue(){if(!S.notes.hum){S.notes.hum=true;save();toast('Added to your notebook: Aqpik freezes whenever the ridge hums.','good')}unlock('nome-feet')},
      onDone(){unlock('nome-check-translator')&&toast('New Field Guide idea: '+FIELD_GUIDE['nome-check-translator'].title,'good');st.observed=1;save();nextStep()},doneLabel:'Go talk to Eli'})},
  calf_test(){const st=calfState();let pick=st.test||null;const done=!!st.test;
    const bars=(p,old)=>{const q=calfPct(p),o=old?calfPct(old):null;return `<div class="calf-bars">${['fear','tooth','belly','sick'].map(h=>`<div class="calf-bar"><span>${CALF_CAUSE[h]}</span><div class="calf-track">${o?`<i class="old" style="width:${o[h]}%"></i>`:''}<i class="${h}" style="width:${q[h]}%"></i></div><b>${q[h]}%</b></div>`).join('')}</div>`};
    const rec=S.told?'barn':'chew';
    const say=S.told?'My best guess, at about 60%, is that the hum from the ridge scared her. What matters more to you: the quickest answer, or never risking sedation? Either way, I’d start with a quiet night in the warming barn, because it’s cheap and safe and it checks the most likely cause.'
      :'My best guess, at about 55%, is that her mouth is sore. What matters more to you: the quickest answer, or never risking sedation? I’d start with the cold willow chew, because it’s cheap and safe and it checks for a sore mouth.';
    const card=k=>{const T=CALF_TESTS[k];return `<button class="calf-test ${pick===k?'on':''}" data-t="${k}" ${done?'disabled':''}><div class="calf-ticon">${calfTestIcon(k)}</div><div class="calf-tt"><b>${esc(T.name)}</b><span>${T.cost} coins · ${T.risk?T.risk+' in 100 have breathing trouble':'no risk'} · tests for ${T.checks==='all'?'problems in her teeth, belly, and blood':{fear:'fear',belly:'an upset belly',tooth:'a sore mouth'}[T.checks]}</span></div></button>`};
    const before=calfBelief(!!S.told,null);
    screen('criteria calf-testscr',`${scene('nome_barn')}${hud('Warming Barn 2 · Friday, 4:30 PM')}<div class="panel-card calf-testcard"><h2>Pick one small test</h2>
      <div class="byte-note">${byteBox({...S.byte,mood:'think'})}<p>${esc(say)}${!S.told&&!done?`<br><button class="btn small" id="calftell">Tell ${esc(S.byte.name)} about the ridge tower</button>`:''}</p></div>
      ${bars(before)}<div class="calf-tests">${['barn','feed','chew','exam'].map(card).join('')}</div>
      <button class="btn wide" id="run" ${pick&&!done?'':'disabled'}>Run this test tonight</button><div id="calfres"></div></div>`);
    if(!done)setTimeout(()=>playLine('byte',say),250);
    const tb=$('#calftell');if(tb)tb.onclick=()=>{S.told=true;S.notes.hum=true;save();unlock('nome-local');toast('You told '+S.byte.name+' about the ridge tower','good');
      setTimeout(()=>playLine('byte','Thanks! I checked the reserve’s quake sensor, and every few minutes it picks up a hum from the east ridge that is too low for Aqpik’s collar to hear. Aqpik freezes each time the hum comes.'),300);M().custom.calf_test()};
    $$('.calf-test').forEach(b=>b.onclick=()=>{pick=b.dataset.t;$$('.calf-test').forEach(x=>x.classList.toggle('on',x===b));$('#run').disabled=false});
    const show=()=>{const T=CALF_TESTS[st.test],after=calfBelief(!!S.told);const ok=st.test==='exam'?null:T.result;
      const line=st.test==='exam'?'The exam found nothing wrong. A milk tusk is coming in, but Aqpik’s gums, belly, and blood all look healthy.':ok?'Aqpik nursed during her quiet night in the barn! That’s strong evidence that fear was what stopped her from eating.':'Aqpik still won’t eat. That makes the cause this test checked less likely, which helps us narrow down the real cause.';
      $('#calfres').innerHTML=`<div class="calf-result ${ok===false?'bad':'good'}"><div class="calf-rvig">${calfTestNight(st.test)}</div><div><h3>${st.test==='exam'?'The exam found nothing wrong':ok?'Saturday, 7 AM: Aqpik ate!':'Saturday, 7 AM: Aqpik still isn’t eating'}</h3><p>${esc(line)}</p></div></div>
        <div class="calf-upd"><span class="upd-badge">Updated</span> My new guess about the cause</div>${bars(after,calfBelief(!!S.told,null))}<button class="btn wide" id="calfgo">Set my goals</button>`;
      $('#calfgo').onclick=()=>nextStep();return line};
    $('#run').onclick=()=>{if(!pick)return;st.test=pick;save();unlock('nome-test-small')&&toast('New Field Guide idea: Test small before going big','good');unlock('nome-base-rate');
      $('#run').disabled=true;$$('.calf-test').forEach(b=>b.disabled=true);
      const ov=document.createElement('div');ov.className='calf-night';ov.innerHTML=`<div class="calf-moon"></div><div class="calf-clock"><b id="calfhr">8 PM</b><span>Friday night</span></div><div class="calf-nvig">${calfTestNight(pick,true)}</div>`;document.body.appendChild(ov);
      const hrs=['8 PM','10 PM','Midnight','2 AM','4 AM','6 AM','7 AM'];let i=0;const tm=setInterval(()=>{i++;const e=$('#calfhr');if(e&&hrs[i])e.textContent=hrs[i];if(i>=hrs.length){clearInterval(tm);ov.classList.add('out');setTimeout(()=>ov.remove(),500);const line=show();playLine('byte',line);$('#calfres').scrollIntoView({behavior:'smooth',block:'start'})}},420)};
    if(done)show()}
};
