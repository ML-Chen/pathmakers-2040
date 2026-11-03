// content_boston.js — Boston, Care Doctor, mission 1: "The Violinist's Wrist".
// Markup in text: [[word]] = glossary word (tap for meaning). Sentences split on ". " for highlighting.
const GLOSSARY={
  fracture:'A crack or break in a bone.', radius:'One of the two bones in your forearm, on the thumb side.',
  recital:'A concert where students perform for an audience.', consent:'Saying yes to something after you understand it. Doctors need a patient’s consent before treating them.',
  hydrogel:'A soft, jelly-like material that holds a lot of water. Some medicines are made from it.',
  allergy:'When your body reacts badly to something that is harmless for most people.',
  sensitive:'Easily affected or bothered by something.', 'heals straight':'When a broken bone grows back in its normal shape, so the arm works and looks like it did before.', 'heal straight':'When a broken bone grows back in its normal shape, so the arm works and looks like it did before.', ingredient:'One of the things that something is made from.',
  'sample size':'How many people or things were studied. Bigger samples usually give answers you can trust more.',
  forecast:'A careful guess about what will probably happen.', likely:'Probably going to happen.',
  options:'Different choices you could pick from.', 'physical therapy':'Exercises with a trained helper that make an injured body part strong again.',
  surgery:'When doctors fix something inside the body, often in an operating room.', pins:'Tiny metal rods that hold broken bone pieces in place while they heal.',
  cast:'A hard shell around a broken arm or leg that keeps it still while it heals.', splint:'A support that keeps an injured body part from moving.',
  rash:'Red, itchy, or bumpy skin.', record:'Information that is written down and saved, like a patient’s health history.',
  synced:'Copied so that two systems have the same information.', accountable:'Responsible for a decision and ready to explain it.',
  tradeoff:'When getting more of one good thing means getting less of another.', uncertain:'Not known for sure.',
  operations:'The everyday work that keeps a big place running.', diagnose:'To figure out what illness or injury someone has.',
  trial:'A careful test of a new medicine to see if it is safe and works.', approved:'Officially allowed after being checked.',
  clot:'A soft clump of blood that forms to protect an injury.', callus:'A bridge of new tissue the body builds across a broken bone. It hardens into bone over weeks.', calibration:'How well the way you say how sure you are matches how often you turn out to be right.',
  'error bar':'A line on a chart that shows how far the real answer might be from the number shown.',
  dividend:'Money shared out to people. In 2040, every adult gets a Citizen’s Dividend, paid from the fees companies pay to build robots and computer chips.', autonomous:'Able to act on its own without a person controlling it.'
};

const CAST={
  imani:{name:'Dr. Imani Reyes',role:'Chief of Care, Boston Harbor Hospital',eye:'#5a3420',brows:'arched',lips:'full',nose:'broad',eyeShape:'almond',face:'oval',clip:'#e8b84a',skin:'#7f4e2e',hair:'#2c1e1a',hairStyle:'puff',shirt:'#16b3a6',coat:true,glasses:true,accessory:'earring'},
  maya:{name:'Maya Lin',role:'Patient, age 11',skin:SKIN[1],hair:'#1d1512',hairStyle:'braids',shirt:'#ff7a6b',age:'kid',cast:false},
  dad:{name:'Wei Lin',role:'Maya’s dad',brows:'straight',nose:'straight',eyeShape:'mono',face:'long',masc:true,skin:SKIN[1],hair:'#221c22',hairStyle:'sidepart',shirt:'#5b7bd5',glasses:false},
  halo:{name:'Halo',role:'The hospital’s operations AI'}
};

// Conversations: lines {who, mood, text, choices?, clue?}. choices: [{t, mood?, good?, reply?}]
const TALKS={
  morning:[
    {who:'byte',mood:'happy',text:'Good morning, Doctor! Today is your first shift at Boston Harbor Hospital!'},
    {who:'byte',mood:'neutral',text:'The tram leaves at 8:05, it’s sunny, and your badge is already in your bag. You have one patient this morning: a girl with a broken wrist.'},
    {who:'byte',mood:'happy',text:'I can look things up, work out the odds, and show you what might happen with each treatment. Helping the family decide what to do is your job.',choices:[{t:'What’s my job today?',reply:'Listen to your patient and her family, figure out what matters most to them, explain the choices honestly, and get their [[consent]]. Then you sign the decision, which means you are [[accountable]]: you have to explain it and answer for how it turns out.'},{t:'Let’s go!',reply:'Woof! Grab your coat!'}]}
  ],
  imani:[
    {who:'imani',mood:'smile',text:'You must be our new Care Doctor. Welcome. I’m Dr. Reyes.'},
    {who:'imani',mood:'neutral',text:'Your patient is Maya Lin, age 11. She fell off her scooter yesterday and broke her wrist: a clean [[fracture]] of the [[radius]], and the two pieces slipped a little out of line.'},
    {who:'imani',mood:'think',text:'There are three good treatments for Maya’s wrist. Which one is right depends on what Maya and her family care about, and you can only find that out by talking to them.',choices:[{t:'What does Maya care about?',reply:'Ask her. I’ll give you a hint, though: she came in holding a violin case with her good arm.',mood:'smile'},{t:'Which treatment would you pick?',reply:'If it were my own kid, I’d probably pick surgery with [[pins]]. But Maya may care about different things than I do, so go and meet her.',mood:'stern'}]}
  ],
  maya:[
    {who:'maya',mood:'worried',text:'Hi. Is my arm going to be okay?'},
    {who:'maya',mood:'sad',text:'My [[recital]] is Friday. I’ve practiced the Bach piece for four months.',choices:[{t:'Your arm is going to heal. Let’s figure out the best plan together.',good:true,reply:'Okay. Can I still play on Friday?',mood:'worried'},{t:'Don’t worry about the recital right now.',reply:'But it’s really important to me...',mood:'sad'}]},
    {who:'dad',mood:'worried',text:'We just want her arm to heal right. She wants to keep playing the violin for the rest of her life.'},
    {who:'dad',mood:'think',text:'Oh, one thing. Last summer she got a bad [[rash]] from one of those cooling patches for sunburn. We were visiting family in Taipei, so it’s probably not in her records here.',clue:'rash'},
    {who:'maya',mood:'smile',text:'That rash was super itchy. It looked like strawberry polka dots.',choices:[{t:'Thanks for telling me. That might really matter when we choose a treatment.',good:true,reply:'Really? Okay!',mood:'smile'},{t:'That was a long time ago.',reply:'Okay...',mood:'neutral'}]}
  ],
  consent:[
    {who:'dad',mood:'think',text:'So, Doctor, what do you think we should do?'},
    {who:'maya',mood:'worried',text:'And will I get to play?'}
  ]
};

// Workbench documents: every sentence is a step with its own animated picture (VIZ kinds in infog.js).
const DOCS=[
  {id:'memo',title:'Byte’s memo: Maya’s options',from:'Byte',kind:'memo',steps:[
    {t:'Maya’s [[radius]] has a clean [[fracture]]: one crack straight across the bone, with the two pieces a little out of line.',viz:'arm',cap:'Maya’s left forearm'},
    {t:'A bone [[heals straight]] when it grows back in its normal shape. If it heals crooked, doctors may have to fix it again.',viz:'straightVsCrooked',cap:'Straight or crooked'},
    {t:'There are three [[options]] for treating Maya’s wrist, and all three are safe and [[approved]].',viz:'threeOptions',cap:'The three options'},
    {t:'[[Surgery]] with [[pins]] works well: about 95 out of 100 kids who get it heal straight.',viz:'kids',args:{n:95,label:'95 of 100 kids heal straight with pins'},cap:'Surgery with pins'},
    {t:'With a [[cast]], about 80 out of 100 kids heal straight, and with a cast plus [[physical therapy]], about 88 out of 100 do.',viz:'kidsCompare',args:{a:80,b:88,label:'80 of 100 with a cast · 88 with therapy'},cap:'Cast, then cast plus therapy'},
    {t:'BoneMend [[hydrogel]] is a newer treatment that came out last year, and about 90 out of 100 kids who get it heal straight.',viz:'kids',args:{n:90,col:'#6c5ce7',label:'About 90 of 100 with BoneMend'},cap:'BoneMend gel'},
    {t:'Maya could play violin again about 6 weeks after pins, about 3 weeks after a cast, or about 8 days after BoneMend. Her [[recital]] is in 9 days.',viz:'timeline',cap:'How long until she can play'},
    {t:'BoneMend has been tested on only 40 kids, so its numbers are more [[uncertain]] than the numbers for pins and casts, which were each studied in thousands of kids.',viz:'sampleSize',cap:'Why the small study matters'},
    {t:'On this chart, the black line on each bar is an [[error bar]], and the real number is probably somewhere along that line.',viz:'bars',cap:'Heals straight, out of 100 kids'},
    {t:'My [[forecast]] for a skin reaction to BoneMend is low, about 5 in 100, because I found no [[allergy]] in her [[record]].',viz:'rashForecast',args:{n:5,label:'My forecast: 5 of 100 get a skin reaction'},cap:'Skin reaction forecast',alt:{t:'I updated this: Maya once got a [[rash]] from an HX-2 cooling patch, so my [[forecast]] for a skin reaction to BoneMend is now about 60 in 100, not 5. For Maya, I would avoid BoneMend.',args:{n:60,label:'New forecast for Maya: 60 of 100'},cap:'Updated forecast'}}
  ]},
  {id:'record',title:'Maya Lin: health record',from:'Boston Harbor Hospital',kind:'record',steps:[
    {t:'Patient: Maya Lin, age 11.',viz:'idcard',cap:'Patient card'},
    {t:'Today: a [[fracture]] of the left [[radius]] after a scooter fall.',viz:'scooter',cap:'What happened'},
    {t:'Allergies on file: none.',viz:'noAllergy',cap:'Allergy list'},
    {t:'Records from clinics outside the United States are not always [[synced]] with this hospital.',viz:'sync',cap:'Records between countries'},
    {t:'Ask the family about any care received in other countries.',viz:'askFamily',cap:'A good question to ask'}
  ]},
  {id:'sheet',title:'BoneMend hydrogel: fact sheet',from:'Boston Harbor Hospital',kind:'sheet',steps:[
    {t:'BoneMend is a [[hydrogel]] that helps bone cells rebuild the broken spot quickly.',viz:'boneGel',cap:'How BoneMend works'},
    {t:'A smart [[splint]] with sensors keeps the arm steady while it heals and checks that it stays still.',viz:'splint',cap:'The smart splint'},
    {t:'BoneMend’s main [[ingredient]] is HX-2 cooling gel, the same material used in many sunburn cooling patches.',viz:'ingredientMatch',cap:'One shared ingredient'},
    {t:'People who once got a [[rash]] from an HX-2 cooling patch may be [[sensitive]]. In the [[trial]] of BoneMend, about 60 out of 100 kids like that got a rash from it.',viz:'rashForecast',args:{n:60,label:'60 of 100 sensitive kids got a rash'},cap:'Kids who are sensitive to HX-2'},
    {t:'If a rash happens, BoneMend is stopped and the arm goes into a regular [[cast]].',viz:'switchToCast',cap:'The backup plan'}
  ]},
  {id:'ledger',title:'The Ledger: Boston',from:'News',kind:'ledger',steps:[
    {t:'Robot crews finished the new Charles River flood wall three weeks early.',viz:'floodwall',cap:'Charles River flood wall'},
    {t:'The average wait in Boston emergency rooms last month was four minutes.',viz:'erWait',cap:'Emergency room waits'},
    {t:'Last night, inspectors who enforce the international AI [[treaty]] shut down a small [[datacenter]] near the town of Calder Bay, because it had no license to run. Nobody knows who built the datacenter.',viz:'datacenter',cap:'A mystery datacenter'}
  ]}
];
const LESSONS={bones:{title:'How a broken bone heals',steps:[
    {t:'When a bone breaks, blood rushes to the spot and forms a soft [[clot]] around the break.',viz:'healStage',args:{s:1},cap:'Day 1'},
    {t:'Over about two weeks, the body builds a soft bridge across the gap, called a [[callus]].',viz:'healStage',args:{s:2},cap:'Weeks 1 to 2'},
    {t:'Then the callus slowly hardens into real bone, which takes about 6 to 12 weeks.',viz:'healStage',args:{s:3},cap:'Weeks 3 to 12'},
    {t:'Keeping the bone still with a cast or pins helps the bridge grow straight instead of crooked.',viz:'healStage',args:{s:4},cap:'Why we keep it still'}],
  quiz:[{q:'What forms first around a break?',opts:['A soft clot','Hard new bone','A cast'],a:0,why:'Blood forms a soft clot first. Hard bone comes weeks later.'},
        {q:'What is a callus?',opts:['A kind of cast','A soft bridge the body builds across the gap','An allergy'],a:1,why:'A callus is the bridge of new tissue that later hardens into bone.'},
        {q:'Why keep a broken bone still?',opts:['So it heals faster than a week','So the bridge grows straight','So it doesn\u2019t need a doctor'],a:1,why:'Moving the pieces can make the bridge grow crooked.'}]}};
const MEMO_CHART={type:'bars',title:'Heals straight (out of 100 kids)',rows:[{label:'Pins',v:95,lo:93,hi:97,n:'12,000 kids'},{label:'Cast + therapy',v:88,lo:85,hi:90,n:'9,500 kids'},{label:'Cast',v:80,lo:77,hi:83,n:'21,000 kids'},{label:'BoneMend',v:90,lo:76,hi:97,n:'40 kids'}]};

// Future Table model. Choices: tx (pins|cast|gel), pt (bool), date (fri|moved), told (bool: player told Byte about the rash)
const CRITERIA=[
  {id:'straight',label:'[[Heals straight]]'},{id:'plays',label:'Plays at her [[recital]]'},{id:'skin',label:'No [[rash]]'},{id:'agree',label:'Maya agrees'},{id:'quick',label:'Back to violin fast'}
];
const TRUTH_SENSITIVE=true; // Maya really is sensitive to HX-2 (the clue from her dad)
function modelProbs(c,useTruth){
  // returns per-future probabilities for outcome events
  const sens = useTruth?TRUTH_SENSITIVE:!!(c.told||(typeof S!=='undefined'&&S.told)); // previews only know about the rash if she told Byte
  let straight, readyFri, readyMoved, rash=0;
  if(c.tx==='pins'){straight=.95+(c.pt?.02:0);readyFri=0;readyMoved=0;}
  if(c.tx==='cast'){straight=.80+(c.pt?.08:0);readyFri=0;readyMoved=.9;}
  if(c.tx==='gel'){straight=.90+(c.pt?.04:0);readyFri=.7;readyMoved=.95;rash=sens?.6:.05;}
  return {straight,ready:c.date==='fri'?readyFri:readyMoved,rash};
}
// Sample one future. rng: () => [0,1)
function sampleFuture(c,useTruth,rng){
  const p=modelProbs(c,useTruth); let rash=c.tx==='gel'&&rng()<p.rash;
  let straight, plays;
  if(rash){straight=rng()<.8; plays=c.date==='moved'?straight&&rng()<.5:false;} // switch to cast after reaction
  else {straight=rng()<p.straight; plays=straight&&rng()<p.ready;}
  const kind=rash?'rash':!straight?'crooked':plays?(c.date==='moved'?'moved':'recital'):'healed';
  const cap={rash:'Skin reaction, so she switched to a cast.',crooked:'Healed crooked and needs another fix.',recital:'Played Bach on Friday!',moved:'Played at the moved recital!',healed:'Healed straight but missed the recital.'}[kind];
  return {rash,straight,plays,kind,cap};
}
const TX_LABEL={pins:'Surgery with pins',cast:'Cast',gel:'BoneMend gel'};

const FIELD_GUIDE={
  'only-you-know':{title:'Information only you have',track:'Ethics and AI',text:'An AI can be very smart and still know only what is in its records or what people tell it. Maya’s rash happened in another country, so it was not in her Boston record, and Byte had no way to know about it. When you know something your AI doesn’t, tell it.',real:'True today: medical records often don’t transfer between countries or even between hospitals.'},
  'sample-size':{title:'Sample size',track:'Evidence and truth',text:'BoneMend was tested on 40 kids. Casts were studied on 21,000. Numbers from small samples can be far off, which is why BoneMend’s error bar is so wide.',real:'True today: new medicines go through trials with growing numbers of people before approval. BoneMend is made up for the game, though scientists are testing gels that help broken bones heal.'},
  'consent':{title:'Informed consent',track:'Government, law, and power',text:'Patients decide about their own treatment after they understand the choices, the odds, and the tradeoffs. The doctor explains, and the patient chooses.',real:'True today: US law requires informed consent for most medical treatments. For a child, a parent gives consent, and doctors also ask the child to agree, which is called assent.'},
  'calibration':{title:'Calibration',track:'Evidence and truth',text:'Being well calibrated means your words match your results. When you say you are \u201cpretty sure,\u201d you should turn out right most of the time, and when you say it is a \u201ccoin flip,\u201d you should be right about half the time. You get better at this by writing down how sure you are and later checking how often you were right.',real:'True today: weather forecasters and doctors practice this. When a good forecaster says there is a 70% chance of rain, it rains on about 7 of every 10 of those days.'},
  'forecast':{title:'Forecasts are not promises',track:'Evidence and truth',text:'A forecast of 90% still means that about 1 time in 10, things go the other way. So a good decision can still turn out badly because of bad luck, and a bad decision can turn out well because of good luck.',real:'True today: weather forecasters track how often their 70% predictions come true.'}
};

// Voices for prerecorded speech (Kokoro speaker ids); narrator reads documents and glossary.
const BYTE_VOICES={female:'af_bella',male:'am_adam'};
const VOICES={byte:'af_bella',imani:'bf_emma',maya:'af_sky',dad:'am_michael',narrator:'bm_george'};
const REVEAL_LINES={recital:'I played the whole Bach piece! My wrist didn\u2019t hurt at all!',moved:'We moved the recital and I played! Thank you for explaining everything.',healed:'I missed Friday, but my wrist is straight. There\u2019s another recital in spring.',crooked:'It didn\u2019t heal straight. The doctors say they can fix it, but I\u2019m sad.',rash:'I got the strawberry polka-dot rash again! The doctors switched me to a cast.'};
const EXTRA_LINES=[
  {who:'byte',text:'Hi! I\u2019m your AI partner. Let\u2019s do great work together!'},
  {who:'byte',text:'Thanks! I updated my forecast. Because Maya once got a rash from an HX-2 cooling patch, I now think BoneMend has about a 60% chance of giving her a skin reaction.'},
  {who:'byte',text:'Here are 10 possible futures for this plan, in the same mix that my forecast predicts. If you change the plan, the futures change too.'},
  {who:'byte',text:'Choose what matters to Maya before you look at the futures, so that an exciting new option like BoneMend doesn\u2019t distract you from her goals.'},
  {who:'byte',text:'Choosing what matters before you see the futures helps you pick the plan that fits those goals, instead of the plan that looks most exciting.'},
  {who:'maya',text:'Thank you for explaining. I understand. Let\u2019s do it.'},
  {who:'maya',text:'So I\u2019ll miss Friday... but I want my arm to work for a long time. Okay. I agree.'},
  {who:'maya',text:'Um... okay. But I don\u2019t really understand what will happen.'},
  {who:'maya',text:'Definitely? Are you sure? The Future Table showed some futures where I don\u2019t get to play.'},
  {who:'maya',text:'So, what do you suggest? And will I get to play?'},
  {who:'byte',text:'Something strange happened tonight. Someone tried to install an upgrade on me from a maker I\u2019ve never heard of. I blocked it.'},
  {who:'byte',text:'Your plan fit your goals well, but this time it was unlucky. We judge a decision by what you knew when you made it, not only by how it turned out.'},
  {who:'byte',text:'Nice work, Doctor. You listened to Maya and her dad, you explained the choices honestly, and Maya trusted you.'}
];
// Passers-by: lines and the voice each scene's people use (Kokoro speaker names)
const CHATTER={
  street:['Ugh, the tram was ninety seconds late. NINETY seconds!','I\u2019m voting on the river park plan tonight. Did you read it?','Rain at 3:10, my phone says. Better hurry.','I teach violin on Saturdays, just because I love it.','Did you hear about that secret datacenter near Calder Bay?','My grandpa ran his first marathon last week. He\u2019s 92!','I\u2019m learning Mandarin. N\u01d0 h\u01ceo!'],
  hospital:['My knee feels brand new. Dr. Reyes explained everything so clearly.','I\u2019m visiting my great-grandma. She\u2019s 104 and still dances on Sundays!','Have you tried the cafeteria dumplings? I\u2019d give them ten out of ten.','I volunteer here on Tuesdays. I read stories to the kids.']};
const CORE_CHATTER=JSON.parse(JSON.stringify(CHATTER));
const CHATTER_VOICES=['af_sarah','bm_lewis','af_nicole','bf_isabella','am_michael'];
// Every line the game speaks with a recorded voice: [{voice, text}] with [[ ]] markup removed.
function speechText(t){return String(t).replace(/\[\[|\]\]/g,'').replace(/\s+/g,' ').trim()}
function spokenLines(){const out=[];let SRC='core';const add=(who,t)=>{if(!t||/\{P\}/.test(t))return;const vs=who==='byte'?Object.values(BYTE_VOICES):[VOICES[who]||VOICES.narrator];for(const v of vs)out.push({voice:v,text:speechText(t),src:SRC,who})};
  for(const k in TALKS)for(const L of TALKS[k]){add(L.who,L.text);(L.choices||[]).forEach(c=>c.reply&&add(L.who,c.reply))}
  for(const d of DOCS){add('narrator',d.title);d.steps.forEach(b=>{add('narrator',b.t);if(b.alt)add('narrator',b.alt.t)})}
  for(const w in GLOSSARY)add('narrator',w+'. '+GLOSSARY[w]);
  for(const k in REVEAL_LINES)add('maya',REVEAL_LINES[k]);
  EXTRA_LINES.forEach(x=>add(x.who,x.text));
  if(typeof levelLines!=='undefined'&&MISSIONS.maya)levelLines(MISSIONS.maya).forEach(x=>add(x.who,x.text)); // Teen and Grown-up lines (src/missions/maya_levels.js)
  for(const k in CORE_CHATTER)CORE_CHATTER[k].forEach((t,i)=>out.push({voice:CHATTER_VOICES[i%CHATTER_VOICES.length],text:speechText(t),src:'core',who:'chatter'}));
  out.push({voice:"bf_emma",text:speechText("Good morning, Doctor! Heads up: elevator B is a little slow today."),src:"core",who:'halo'});
  // Missions in src/missions/*.js: each one's lines are written to src/audio/<id>.js (the Maya mission's lines live in src/audio.js).
  if(typeof MISSIONS!=='undefined'){mergeMissions();for(const id in MISSIONS){if(id==='maya')continue;SRC=id;const m=MISSIONS[id];missionLines(m).forEach(x=>add(x.who,x.text));
    for(const k in (m.chatter||{}))m.chatter[k].forEach((t,i)=>out.push({voice:(m.chatterVoices||CHATTER_VOICES)[i%(m.chatterVoices||CHATTER_VOICES).length],text:speechText(t),src:id,who:'chatter'}))}}
  // The Ledger news app (src/ledger.js): its library, words and Byte's lines go to src/audio/ledger.js.
  if(typeof ledgerLines==='function'){SRC='ledger';ledgerLines().forEach(x=>add(x.who,x.text))}
  const seen=new Set();return out.filter(x=>{const key=x.voice+'|'+x.text;if(seen.has(key))return false;seen.add(key);return true})}
if(typeof module!=='undefined')module.exports={spokenLines};
