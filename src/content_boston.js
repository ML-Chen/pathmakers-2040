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
  clot:'A soft clump of blood that forms to protect an injury.', callus:'A bridge of new tissue the body builds across a broken bone. It hardens into bone over weeks.', calibration:'How well your "how sure am I" matches how often you turn out to be right.',
  'error bar':'A line on a chart that shows how far the real answer might be from the number shown.',
  dividend:'Money shared out to people. In 2040, everyone gets a Town Dividend.', autonomous:'Able to act on its own without a person controlling it.'
};

const CAST={
  imani:{name:'Dr. Imani Reyes',role:'Chief of Care, Boston Harbor Hospital',skin:SKIN[4],hair:'#1b1410',hairStyle:'bun',shirt:'#16b3a6',coat:true,glasses:true,accessory:'earring'},
  maya:{name:'Maya Lin',role:'Patient, age 11',skin:SKIN[1],hair:'#1d1512',hairStyle:'braids',shirt:'#ff7a6b',age:'kid',cast:false},
  dad:{name:'Wei Lin',role:'Maya’s dad',skin:SKIN[1],hair:'#2a211c',hairStyle:'buzz',shirt:'#5b7bd5',glasses:false},
  halo:{name:'Halo',role:'The hospital’s operations AI'}
};

// Conversations: lines {who, mood, text, choices?, clue?}. choices: [{t, mood?, good?, reply?}]
const TALKS={
  morning:[
    {who:'byte',mood:'happy',text:'Good morning, Doctor! Today’s the big day: your first shift at Boston Harbor Hospital!'},
    {who:'byte',mood:'neutral',text:'The tram leaves at 8:05, it’s sunny, and your badge is already in your bag. You have one patient this morning: a girl with a broken wrist.'},
    {who:'byte',mood:'happy',text:'I can look things up, run the numbers, and show you what might happen. But helping a family decide? That’s you.',choices:[{t:'What’s my job today?',reply:'Listen to your patient and her family, figure out what matters most to them, explain the choices honestly, and get their [[consent]]. Then you sign. Signing means you’re [[accountable]].'},{t:'Let’s go!',reply:'Woof! Grab your coat!'}]}
  ],
  imani:[
    {who:'imani',mood:'smile',text:'You must be our new Care Doctor. Welcome. I’m Dr. Reyes.'},
    {who:'imani',mood:'neutral',text:'Your patient is Maya Lin, age 11. She fell off her scooter yesterday and broke her wrist: a clean [[fracture]] of the [[radius]].'},
    {who:'imani',mood:'think',text:'There are three good treatments. The right one depends on what Maya and her family care about, and you only learn that by talking to them.',choices:[{t:'What does Maya care about?',reply:'Ask her. I’ll give you a hint, though: she came in holding a violin case with her good arm.',mood:'smile'},{t:'Which treatment would you pick?',reply:'For my own kid? Probably surgery with [[pins]]. But I’m not Maya. Go meet her.',mood:'stern'}]}
  ],
  maya:[
    {who:'maya',mood:'worried',text:'Hi. Is my arm going to be okay?'},
    {who:'maya',mood:'sad',text:'My [[recital]] is Friday. I’ve practiced the Bach piece for four months.',choices:[{t:'Your arm is going to heal. Let’s figure out the best plan together.',good:true,reply:'Okay. Can I still play on Friday?',mood:'worried'},{t:'Don’t worry about the recital right now.',reply:'But it’s really important to me...',mood:'sad'}]},
    {who:'dad',mood:'worried',text:'We just want her arm to heal right. She wants to play for the rest of her life.'},
    {who:'dad',mood:'think',text:'Oh, one thing. Last summer she got a bad [[rash]] from one of those cooling patches for sunburn. We were visiting family in Taipei, so it’s probably not in her records here.',clue:'rash'},
    {who:'maya',mood:'smile',text:'It was super itchy. It looked like strawberry polka dots.',choices:[{t:'Thanks for telling me. That might really matter.',good:true,reply:'Really? Okay!',mood:'smile'},{t:'That was a long time ago.',reply:'Okay...',mood:'neutral'}]}
  ],
  consent:[
    {who:'dad',mood:'think',text:'So, Doctor, what do you think we should do?'},
    {who:'maya',mood:'worried',text:'And will I get to play?'}
  ]
};

// Workbench documents: every sentence is a step with its own animated picture (VIZ kinds in infog.js).
const DOCS=[
  {id:'memo',title:'Byte’s memo: Maya’s options',from:'Byte',kind:'memo',steps:[
    {t:'Maya’s [[radius]] has a clean [[fracture]]: one crack straight across the bone.',viz:'arm',cap:'Maya’s left forearm'},
    {t:'A bone [[heals straight]] when it grows back in its normal shape. If it heals crooked, doctors may have to fix it again.',viz:'straightVsCrooked',cap:'Straight or crooked'},
    {t:'There are three [[options]], and all three are safe and [[approved]].',viz:'threeOptions',cap:'The three options'},
    {t:'[[Surgery]] with [[pins]]: about 95 out of 100 kids heal straight.',viz:'kids',args:{n:95,label:'95 of 100 kids heal straight with pins'},cap:'Surgery with pins'},
    {t:'A [[cast]]: about 80 out of 100 heal straight, or 88 with [[physical therapy]].',viz:'kidsCompare',args:{a:80,b:88,label:'80 of 100 with a cast · 88 with therapy'},cap:'Cast, then cast plus therapy'},
    {t:'BoneMend [[hydrogel]], a newer treatment that came out last year: about 90 out of 100 heal straight.',viz:'kids',args:{n:90,col:'#6c5ce7',label:'About 90 of 100 with BoneMend'},cap:'BoneMend gel'},
    {t:'Back to violin: about 6 weeks after pins, 3 weeks with a cast, and 8 days with BoneMend. Her [[recital]] is in 9 days.',viz:'timeline',cap:'How long until she can play'},
    {t:'BoneMend has been tested on only 40 kids, so its numbers are more [[uncertain]] than the others.',viz:'sampleSize',cap:'Why the small study matters'},
    {t:'On this chart, the black line on each bar is the [[error bar]]: the real number is probably somewhere along it.',viz:'bars',cap:'Heals straight, out of 100 kids'},
    {t:'My [[forecast]] for a skin reaction to BoneMend is low, about 5 in 100, because I found no [[allergy]] in her [[record]].',viz:'rashForecast',args:{n:5,label:'My forecast: 5 of 100 get a skin reaction'},cap:'Skin reaction forecast',alt:{t:'Updated: Maya once got a [[rash]] from an HX-2 cooling patch, so my [[forecast]] for a skin reaction to BoneMend is now about 60 in 100, not 5. For Maya, I would avoid BoneMend.',args:{n:60,label:'New forecast for Maya: 60 of 100'},cap:'Updated forecast'}}
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
    {t:'A smart [[splint]] keeps the arm steady while it heals.',viz:'splint',cap:'The smart splint'},
    {t:'Its main [[ingredient]] is HX-2 cooling gel, the same material used in many sunburn cooling patches.',viz:'ingredientMatch',cap:'One shared ingredient'},
    {t:'People who once got a [[rash]] from an HX-2 cooling patch may be [[sensitive]]. In the [[trial]], about 60 out of 100 of them got a rash from BoneMend.',viz:'rashForecast',args:{n:60,label:'60 of 100 sensitive kids got a rash'},cap:'Kids who are sensitive to HX-2'},
    {t:'If a rash happens, BoneMend is stopped and the arm goes into a regular [[cast]].',viz:'switchToCast',cap:'The backup plan'}
  ]},
  {id:'ledger',title:'The Ledger: Boston',from:'News',kind:'ledger',steps:[
    {t:'Robot crews finished the new Charles River flood wall three weeks early.',viz:'floodwall',cap:'Charles River flood wall'},
    {t:'The average wait in Boston emergency rooms last month was four minutes.',viz:'erWait',cap:'Emergency room waits'},
    {t:'Treaty inspectors shut down a small, unlicensed datacenter near the town of Calder Bay last night. Nobody knows who built it.',viz:'datacenter',cap:'A mystery datacenter'}
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
  const cap={rash:'Skin reaction. Switched to a cast.',crooked:'Healed crooked. Needs another fix.',recital:'Played Bach on Friday!',moved:'Played at the moved recital!',healed:'Healed straight. Missed the recital.'}[kind];
  return {rash,straight,plays,kind,cap};
}
const TX_LABEL={pins:'Surgery with pins',cast:'Cast',gel:'BoneMend gel'};

const FIELD_GUIDE={
  'only-you-know':{title:'Information only you have',track:'Ethics and AI',text:'Even a brilliant AI only knows what it has been told. Maya’s rash happened in another country, so it was not in her record. When you know something the AI doesn’t, tell it.',real:'True today: medical records often don’t transfer between countries or even between hospitals.'},
  'sample-size':{title:'Sample size',track:'Evidence and truth',text:'BoneMend was tested on 40 kids. Casts were studied on 21,000. Numbers from small samples can be far off, which is why BoneMend’s error bar is so wide.',real:'True today: new medicines go through trials with growing numbers of people before approval.'},
  'consent':{title:'Informed consent',track:'Government, law, and power',text:'Patients decide about their own treatment after they understand the choices, the odds, and the tradeoffs. A doctor explains; the patient chooses.',real:'True today: US law requires informed consent for most medical treatments.'},
  'calibration':{title:'Calibration',track:'Evidence and truth',text:'When you say \u201cpretty sure,\u201d you should be right most of the time, and when you say \u201ccoin flip,\u201d about half. Guessing first and then checking is how you get better at knowing how sure to be.',real:'True today: weather forecasters and doctors practice this; when a forecaster says 70% chance of rain, it rains on about 7 of 10 such days.'},
  'forecast':{title:'Forecasts are not promises',track:'Evidence and truth',text:'90% likely still means 1 in 10 goes the other way. A good decision can have an unlucky result, and a bad decision can get lucky.',real:'True today: weather forecasters track how often their 70% predictions come true.'}
};

// Voices for prerecorded speech (Kokoro speaker ids); narrator reads documents and glossary.
const BYTE_VOICES={female:'af_bella',male:'am_adam'};
const VOICES={byte:'af_bella',imani:'bf_emma',maya:'af_sky',dad:'am_michael',narrator:'bm_george'};
const REVEAL_LINES={recital:'I played the whole Bach piece! My wrist didn\u2019t hurt at all!',moved:'We moved the recital and I played! Thank you for explaining everything.',healed:'I missed Friday, but my wrist is straight. There\u2019s another recital in spring.',crooked:'It didn\u2019t heal straight. The doctors say they can fix it, but I\u2019m sad.',rash:'Strawberry polka dots again! They switched me to a cast.'};
const EXTRA_LINES=[
  {who:'byte',text:'Hi! I\u2019m your AI partner. Let\u2019s do great work together!'},
  {who:'byte',text:'Thanks! I updated my forecast: if Maya is sensitive to HX-2, BoneMend has about a 60% chance of a skin reaction.'},
  {who:'byte',text:'Here are 10 possible futures for this plan. Change the plan and watch them shift.'},
  {who:'byte',text:'Deciding what good means first keeps a flashy option from fooling you.'},
  {who:'maya',text:'Thank you for explaining. I understand. Let\u2019s do it.'},
  {who:'maya',text:'So I\u2019ll miss Friday... but I want my arm to work for a long time. Okay. I agree.'},
  {who:'maya',text:'Um... okay. But I don\u2019t really understand what will happen.'},
  {who:'maya',text:'Definitely? Are you sure? The futures didn\u2019t say that.'},
  {who:'maya',text:'So, what do you suggest? And will I get to play?'},
  {who:'byte',text:'Something strange happened tonight. Someone tried to install an upgrade on me from a maker I\u2019ve never heard of. I blocked it.'},
  {who:'byte',text:'Sometimes a good plan gets unlucky. That\u2019s why we judge decisions by what we knew, not only by how they turned out.'},
  {who:'byte',text:'Nice work, Doctor. You listened, you explained, and Maya trusted you.'}
];
// Passers-by: lines and the voice each scene's people use (Kokoro speaker names)
const CHATTER={
  street:['Ugh, the tram was ninety seconds late. NINETY seconds!','I\u2019m voting on the river park plan tonight. Did you read it?','Rain at 3:10, my phone says. Better hurry.','I teach violin on Saturdays. Just because I love it.','Did you hear about that secret datacenter near Calder Bay?','My grandpa ran his first marathon last week. He\u2019s 92!','I\u2019m learning Mandarin. N\u01d0 h\u01ceo!'],
  hospital:['My knee feels brand new. Dr. Reyes explained everything so clearly.','I\u2019m visiting my great-grandma. She\u2019s 104 and still dances on Sundays!','Have you tried the cafeteria dumplings? Ten out of ten.','I volunteer here on Tuesdays. I read stories to the kids.']};
const CHATTER_VOICES=['af_sarah','bm_lewis','af_nicole','bf_isabella','am_michael'];
// Every line the game speaks with a recorded voice: [{voice, text}] with [[ ]] markup removed.
function speechText(t){return String(t).replace(/\[\[|\]\]/g,'').replace(/\s+/g,' ').trim()}
function spokenLines(){const out=[];const add=(who,t)=>{if(!t||/\{P\}/.test(t))return;const vs=who==='byte'?Object.values(BYTE_VOICES):[VOICES[who]||VOICES.narrator];for(const v of vs)out.push({voice:v,text:speechText(t)})};
  for(const k in TALKS)for(const L of TALKS[k]){add(L.who,L.text);(L.choices||[]).forEach(c=>c.reply&&add(L.who,c.reply))}
  for(const d of DOCS){add('narrator',d.title);d.steps.forEach(b=>{add('narrator',b.t);if(b.alt)add('narrator',b.alt.t)})}
  for(const w in GLOSSARY)add('narrator',w+'. '+GLOSSARY[w]);
  for(const k in REVEAL_LINES)add('maya',REVEAL_LINES[k]);
  EXTRA_LINES.forEach(x=>add(x.who,x.text));
  for(const k in CHATTER)CHATTER[k].forEach((t,i)=>out.push({voice:CHATTER_VOICES[i%CHATTER_VOICES.length],text:speechText(t)}));
  out.push({voice:'bf_emma',text:speechText("Good morning, Doctor! Heads up: elevator B is a little slow today.")});
  const seen=new Set();return out.filter(x=>{const key=x.voice+'|'+x.text;if(seen.has(key))return false;seen.add(key);return true})}
if(typeof module!=='undefined')module.exports={spokenLines};
