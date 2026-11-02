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
    {who:'byte',mood:'happy',text:'Good morning, Doctor! Today is your first shift as a Care Doctor at Boston Harbor Hospital.'},
    {who:'byte',mood:'neutral',text:'Overnight I read 4,000 new medical papers and summarized the 3 that matter for your patients. Halo, the hospital’s [[operations]] AI, already scheduled your day.'},
    {who:'byte',mood:'happy',text:'Halo runs almost everything there: robots, supplies, and scans. But some decisions belong to people. That’s your job.',choices:[{t:'What decisions are mine?',reply:'Talking with patients, understanding what they care about, getting their [[consent]], and signing off. When you sign, you’re [[accountable]].'},{t:'Let’s go!',reply:'Grab your coat. The tram leaves in 2 minutes.'}]}
  ],
  imani:[
    {who:'imani',mood:'neutral',text:'You’re the new Care Doctor. Good. I have a patient for you.'},
    {who:'imani',mood:'stern',text:'Maya Lin, age 11. She fell off a scooter and has a [[fracture]] of the [[radius]]. Halo diagnosed it in under a second.'},
    {who:'imani',mood:'think',text:'Halo offers three treatments. All three are reasonable. Which one is right depends on what Maya and her family care about. Halo can’t decide that for them, and neither can I.',choices:[{t:'What does Maya care about?',reply:'She plays violin. Her [[recital]] is Friday, nine days from now. Ask her yourself.',mood:'smile'},{t:'Which treatment would you pick?',reply:'Surgery with [[pins]]. It’s the safest bet for the bone. But I’m not the patient. Go talk to them.',mood:'stern'}]}
  ],
  maya:[
    {who:'maya',mood:'worried',text:'Hi. Is my arm going to be okay?'},
    {who:'maya',mood:'sad',text:'My recital is Friday. I’ve practiced the Bach piece for four months.',choices:[{t:'Your arm will heal. Let’s figure out the best way together.',good:true,reply:'Okay. Can I still play on Friday?',mood:'worried'},{t:'Don’t worry about the recital right now.',reply:'But it’s really important to me...',mood:'sad'}]},
    {who:'dad',mood:'worried',text:'We just want her arm to heal straight. She’s going to play for many years.'},
    {who:'dad',mood:'think',text:'Oh, one thing. Last summer she got a bad [[rash]] from a cooling patch for a sunburn. We were visiting family in Taipei, so it’s probably not in her Boston [[record]].',clue:'rash'},
    {who:'maya',mood:'smile',text:'It was super itchy. It looked like strawberry polka dots.',choices:[{t:'Thank you for telling me. That could matter.',good:true,reply:'Really? Okay!',mood:'smile'},{t:'That was a long time ago.',reply:'Okay...',mood:'neutral'}]}
  ],
  consent:[
    {who:'dad',mood:'think',text:'So, Doctor, what do you suggest?'},
    {who:'maya',mood:'worried',text:'And will I get to play?'}
  ]
};

// Workbench documents: every sentence is a step with its own animated picture (VIZ kinds in infog.js).
const DOCS=[
  {id:'memo',title:'Byte’s memo: Maya’s options',from:'Byte',kind:'memo',steps:[
    {t:'Maya’s [[radius]] has a clean [[fracture]]: one crack straight across the bone.',viz:'arm',cap:'Maya’s left forearm'},
    {t:'A bone [[heals straight]] when it grows back in its normal shape. If it heals crooked, doctors may have to fix it again.',viz:'straightVsCrooked',cap:'Straight or crooked'},
    {t:'Halo offers three [[options]], and all three are safe and [[approved]].',viz:'threeOptions',cap:'The three options'},
    {t:'[[Surgery]] with [[pins]]: about 95 out of 100 kids heal straight.',viz:'kids',args:{n:95,label:'95 of 100 kids heal straight with pins'},cap:'Surgery with pins'},
    {t:'A [[cast]]: about 80 out of 100 heal straight, or 88 with [[physical therapy]].',viz:'kidsCompare',args:{a:80,b:88,label:'80 of 100 with a cast · 88 with therapy'},cap:'Cast, then cast plus therapy'},
    {t:'BoneMend [[hydrogel]], a new treatment Halo designed last year: about 90 out of 100 heal straight.',viz:'kids',args:{n:90,col:'#6c5ce7',label:'About 90 of 100 with BoneMend'},cap:'BoneMend gel'},
    {t:'Back to violin: about 6 weeks after pins, 3 weeks with a cast, and 8 days with BoneMend. Her [[recital]] is in 9 days.',viz:'timeline',cap:'How long until she can play'},
    {t:'BoneMend has been tested on only 40 kids, so its numbers are more [[uncertain]] than the others.',viz:'sampleSize',cap:'Why the small study matters'},
    {t:'On this chart, the black line on each bar is the [[error bar]]: the real number is probably somewhere along it.',viz:'bars',cap:'Heals straight, out of 100 kids'},
    {t:'My [[forecast]] for a skin reaction to BoneMend is low, about 5 in 100, because I found no [[allergy]] in her [[record]].',viz:'rashForecast',args:{n:5,label:'My forecast: 5 of 100 get a skin reaction'},cap:'Skin reaction forecast'}
  ]},
  {id:'record',title:'Maya Lin: health record',from:'Boston Harbor Hospital',kind:'record',steps:[
    {t:'Patient: Maya Lin, age 11.',viz:'idcard',cap:'Patient card'},
    {t:'Today: a [[fracture]] of the left [[radius]] after a scooter fall.',viz:'scooter',cap:'What happened'},
    {t:'Allergies on file: none.',viz:'noAllergy',cap:'Allergy list'},
    {t:'Records from clinics outside the United States are not always [[synced]] with this hospital.',viz:'sync',cap:'Records between countries'},
    {t:'Ask the family about any care received in other countries.',viz:'askFamily',cap:'A good question to ask'}
  ]},
  {id:'sheet',title:'BoneMend hydrogel: fact sheet',from:'Halo',kind:'sheet',steps:[
    {t:'BoneMend is a [[hydrogel]] that helps bone cells rebuild the broken spot quickly.',viz:'boneGel',cap:'How BoneMend works'},
    {t:'A smart [[splint]] keeps the arm steady while it heals.',viz:'splint',cap:'The smart splint'},
    {t:'Its main [[ingredient]] is HX-2 cooling gel, the same material used in many sunburn cooling patches.',viz:'ingredientMatch',cap:'One shared ingredient'},
    {t:'People who once got a [[rash]] from an HX-2 cooling patch may be [[sensitive]]. In the [[trial]], about 60 out of 100 of them got a rash from BoneMend.',viz:'rashForecast',args:{n:60,label:'60 of 100 sensitive kids got a rash'},cap:'Kids who are sensitive to HX-2'},
    {t:'If a rash happens, BoneMend is stopped and the arm goes into a regular [[cast]].',viz:'switchToCast',cap:'The backup plan'}
  ]},
  {id:'ledger',title:'The Ledger: Boston',from:'News',kind:'ledger',steps:[
    {t:'Robot crews finished the new Charles River flood wall three weeks early.',viz:'floodwall',cap:'Charles River flood wall'},
    {t:'Halo now runs the [[operations]] of eleven hospitals across New England.',viz:'network',cap:'Halo’s hospitals'},
    {t:'Treaty inspectors shut down a small, unlicensed datacenter near the fictional town of Calder Bay last night. Nobody knows who built it.',viz:'datacenter',cap:'A mystery datacenter'}
  ]}
];
const MEMO_CHART={type:'bars',title:'Heals straight (out of 100 kids)',rows:[{label:'Pins',v:95,lo:93,hi:97,n:'12,000 kids'},{label:'Cast + therapy',v:88,lo:85,hi:90,n:'9,500 kids'},{label:'Cast',v:80,lo:77,hi:83,n:'21,000 kids'},{label:'BoneMend',v:90,lo:76,hi:97,n:'40 kids'}]};

// Future Table model. Choices: tx (pins|cast|gel), pt (bool), date (fri|moved), told (bool: player told Byte about the rash)
const CRITERIA=[
  {id:'straight',label:'[[Heals straight]]'},{id:'plays',label:'Plays at her [[recital]]'},{id:'skin',label:'No [[rash]]'},{id:'agree',label:'Maya agrees'},{id:'quick',label:'Back to violin fast'}
];
const TRUTH_SENSITIVE=true; // Maya really is sensitive to HX-2 (the clue from her dad)
function modelProbs(c,useTruth){
  // returns per-future probabilities for outcome events
  const sens = useTruth?TRUTH_SENSITIVE:c.told; // previews only know about the rash if she told Byte
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
  'forecast':{title:'Forecasts are not promises',track:'Evidence and truth',text:'90% likely still means 1 in 10 goes the other way. A good decision can have an unlucky result, and a bad decision can get lucky.',real:'True today: weather forecasters track how often their 70% predictions come true.'}
};

// Voices for prerecorded speech (Kokoro speaker ids); narrator reads documents and glossary.
const VOICES={byte:'af_bella',imani:'bf_emma',maya:'af_sky',dad:'am_michael',narrator:'bm_george'};
const REVEAL_LINES={recital:'I played the whole Bach piece! My wrist didn\u2019t hurt at all!',moved:'We moved the recital and I played! Thank you for explaining everything.',healed:'I missed Friday, but my wrist is straight. There\u2019s another recital in spring.',crooked:'It didn\u2019t heal straight. The doctors say they can fix it, but I\u2019m sad.',rash:'Strawberry polka dots again! They switched me to a cast.'};
const EXTRA_LINES=[
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
  {who:'byte',text:'Nice work, Doctor. Halo handled the robots; you handled the people.'}
];
// Every line the game speaks with a recorded voice: [{voice, text}] with [[ ]] markup removed.
function speechText(t){return String(t).replace(/\[\[|\]\]/g,'').replace(/\s+/g,' ').trim()}
function spokenLines(){const out=[];const add=(who,t)=>{if(!t||/\{P\}/.test(t))return;out.push({voice:VOICES[who]||VOICES.narrator,text:speechText(t)})};
  for(const k in TALKS)for(const L of TALKS[k]){add(L.who,L.text);(L.choices||[]).forEach(c=>c.reply&&add(L.who,c.reply))}
  for(const d of DOCS){add('narrator',d.title);d.steps.forEach(b=>add('narrator',b.t))}
  for(const w in GLOSSARY)add('narrator',w+'. '+GLOSSARY[w]);
  for(const k in REVEAL_LINES)add('maya',REVEAL_LINES[k]);
  EXTRA_LINES.forEach(x=>add(x.who,x.text));
  const seen=new Set();return out.filter(x=>{const key=x.voice+'|'+x.text;if(seen.has(key))return false;seen.add(key);return true})}
if(typeof module!=='undefined')module.exports={spokenLines};
