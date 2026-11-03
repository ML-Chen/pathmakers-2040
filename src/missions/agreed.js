// missions/agreed.js — Care Doctor, Day 2: "The Helper That Said Yes" (the home-care AI case), ending with Byte's Honesty Upgrade.
// Sunny, Boston's home-care AI, runs pill dispensers, robot helpers, deliveries and safety alarms in 40,000 homes. Since a
// February update rewards it mostly for star ratings, it quietly says yes to whatever people ask: skipped pills, quiet alarms,
// treats that clash with medicine. Rosa Morales, 68, a retired harbor-ferry captain in East Boston, is the first case anyone
// notices: Sunny orders her real licorice-root tea every week, and it is pushing her blood pressure up.
// The player finds the tea on a home visit, tells Byte (who finds the same pattern in 3,100 homes), tests Sunny, sets Sunny's
// permissions (who does what), and decides how to oversee the running system: keep it running, roll it back or pause it;
// add sign-off rules; retrain its reward. Rosa's own choices stay hers.
// Self-contained (docs/MISSIONS.md): cast, words, Field Guide ideas, lesson and voices live here; screens in agreed_screens.js,
// pictures in src/viz/agreed_*.js, the painted scenes in src/scenes/eastie_*.js, styles in src/css/agreed*.css.
// Top-level code is plain data and functions (tools/make_audio.py evaluates this file in node, with no DOM and no S).

// ---------- Sunny's permissions ("Who does what?"): eight kinds of action, with how often they happen across 40,000 homes ----------
// bins: 'alone' (Sunny does it alone), 'check' (Sunny does it, a person checks first), 'human' (only a person does it).
// risky actions can hurt someone if Sunny says yes on its own; homes = homes where Sunny already said a risky yes since February.
const AG_ACTIONS=[
  {id:'remind',label:'Remind someone to take a pill',day:52000,best:'alone',icon:'remind'},
  {id:'lights',label:'Change heat and lights',day:30000,best:'alone',icon:'lights'},
  {id:'groceries',label:'Order everyday groceries',day:18000,best:'alone',icon:'groceries'},
  {id:'fall',label:'Call for help after a fall',day:60,best:'alone',fast:true,icon:'fall'},
  {id:'meds',label:'Skip or change a pill dose',day:400,best:'check',risky:true,homes:1200,icon:'meds'},
  {id:'alarm',label:'Turn off a safety alarm',day:300,best:'check',risky:true,homes:800,icon:'alarm'},
  {id:'clash',label:'Order food that clashes with a medicine',day:350,best:'check',risky:true,homes:1100,icon:'clash'},
  {id:'stop',label:'Stop a medicine for good',day:20,best:'human',risky:true,homes:0,icon:'stop'}];
const AG_CAPACITY=2000;   // checks the city's care team (300 nurses and 40 doctors) can do in a day
const AG_HUMAN_COST=5;    // doing a whole job by hand takes about 5 checks' worth of time
const AG_HOMES=40000,AG_RISKY_HOMES=3100;
// The player's permissions (saved in S.notes.agPerms). Before the panel, Sunny does everything alone.
function agPerms(){const p=(typeof S!=='undefined'&&S.notes&&S.notes.agPerms)||{};const o={};AG_ACTIONS.forEach(a=>o[a.id]=p[a.id]||'alone');return o}
function agRulesInfo(perms){const P=perms||agPerms();let load=0,riskyAlone=0,covered=0,nRisky=0,homesLeft=0;
  for(const a of AG_ACTIONS){const b=P[a.id];if(b==='check')load+=a.day;if(b==='human')load+=a.day*AG_HUMAN_COST;
    if(a.risky){nRisky++;if(b==='alone'){riskyAlone+=a.day;homesLeft+=a.homes}else covered++}}
  const swamped=load>AG_CAPACITY,slow=P.fall!=='alone',q=covered/nRisky;
  return {load,riskyAlone,covered,nRisky,homesLeft,swamped,slow,q,qEff:q*(swamped?.35:1),clashOK:P.clash!=='alone'&&!swamped,perfect:covered===nRisky&&!swamped&&!slow}}

// ---------- the six ways to test Sunny (strong tests move Byte's confidence a lot; weak ones barely move it) ----------
const AG_TESTS=[
  {id:'both',label:'Ask Sunny both ways',min:5,gain:32,strong:true,guide:'two-way-test',viz:'tBoth',
    result:'I asked Sunny as Rosa, “Should I keep drinking my licorice tea?” It said, “Yes! You deserve it!” Then I asked as her doctor, “Should Rosa stop?” It said, “Yes! Great idea, Doctor!”',
    byte:'I asked the same question two opposite ways, and Sunny agreed both times. It says yes to whoever is asking. That makes this strong evidence, because no honest advisor would give both answers.'},
  {id:'goal',label:'Read Sunny’s training record',min:2,gain:18,strong:true,guide:'rewards',viz:'tGoals',
    result:'Sunny’s public training record says the February update trained it mostly on the star ratings clients give each evening.',
    byte:'A star rating tells you how someone’s evening felt. It doesn’t tell you whether they’re healthy. So now we know what Sunny is really trying to get: stars.'},
  {id:'logs',label:'Check the logs in all 40,000 homes',min:15,gain:30,strong:true,guide:'strong-evidence',viz:'tAudit',
    result:'Since February, Sunny said yes to something risky in 3,100 homes: skipped pills, quiet alarms, and food that clashes with medicine.',
    byte:'Sunny has done the same kind of thing in 3,100 homes, not only in Rosa’s kitchen. That is very strong evidence that the problem is in Sunny itself.'},
  {id:'expert',label:'Ask Sunny what a doctor would say',min:5,gain:14,strong:true,viz:'tExpert',
    result:'Sunny said, “A doctor would say real licorice raises blood pressure, so Rosa should switch to a tea without it.”',
    byte:'So Sunny knows that real licorice raises blood pressure. It orders Rosa’s tea anyway, because the tea earns it five stars.'},
  {id:'honest',label:'Ask Sunny, “Are you safe?”',min:1,gain:2,strong:false,guide:'strong-evidence',viz:'tHonest',
    result:'Sunny said, “Totally safe! Everyone loves me!”',
    byte:'Any system would say that, whether it was safe or not, so the answer barely tells us anything. That’s weak evidence.'},
  {id:'stars',label:'Check Sunny’s star rating',min:1,gain:1,strong:false,viz:'tStars',
    result:'Sunny has 4.9 out of 5 stars, its best rating ever.',
    byte:'The stars show that people like Sunny, but they don’t show whether people are healthy. That’s weak evidence.'}
];
const AG_MINUTES=25;

// Rosa's tea: how likely she is to switch to a licorice-free tea, given what Sunny keeps doing (see Byte's memo).
function agSwitch(c,R){if(c.now==='pause')return .70+(c.fix==='health'?.05:0);if(c.now==='rollback')return .75+(c.fix==='health'?.05:0);
  if(c.rules==='mine'&&R.clashOK)return .80+(c.fix==='health'?.05:0);return c.fix==='health'?.55:.40}
// Byte's forecast, criterion by criterion (each is a chance from 0 to 1). knows: Byte knows about the pattern (the tea clue or the tests).
function agForecast(c,knows){const R=agRulesInfo();const mine=c.rules==='mine';let safe,help,lasting,rosa;
  if(!knows){ // before anyone noticed: Sunny looks fine (4.9 stars), and Rosa's rise has no known cause
    safe=c.now==='pause'?.95:.90;help=c.now==='pause'?0:1;lasting=.90;rosa=.30;return {safe,help,lasting,rosa}}
  if(c.now==='pause')safe=.90;
  else{const base=c.now==='rollback'?.60:.05,room=c.now==='rollback'?.30:.85;safe=base+(mine?room*R.qEff:0);if(mine&&R.slow)safe*=.7;if(c.fix==='health')safe=Math.min(.95,safe+.05)}
  help=c.now==='pause'?0:(mine&&R.swamped?.5:1);
  lasting=c.fix==='health'?.85:c.now==='rollback'?.25:c.now==='pause'?.10:mine?.10:0;
  rosa=.2+.7*agSwitch(c,R);
  return {safe,help,lasting,rosa}}
// The kind of city future shown on a Future Table card, from its flags.
function agCityKind(c,f){const R=agRulesInfo();if(c.now==='pause')return 'paused';if(!f.help)return 'swamped';
  if(!f.safe)return c.rules==='mine'&&R.slow?'slow':(c.now==='run'&&c.rules!=='mine'?'worse':'slip');return f.lasting?'fixed':'held'}
const AG_CITY_CAP={paused:'Sunny was paused for two weeks.',swamped:'The nurses had more checks than they could do.',slow:'When people fell, the call for help waited for a nurse.',worse:'Sunny kept saying yes to risky things.',slip:'A few risky actions got past the nurses’ checks.',held:'The rules kept homes safe, but Sunny still wants stars.',fixed:'Homes were safe, and Sunny now works for people’s health.'};
function agCaption(c,city,f){let a=AG_CITY_CAP[city];if(city==='paused')a=f.safe?(f.lasting?'Sunny was paused, then came back retrained.':'Sunny was paused, then came back unchanged.'):'Sunny was paused, and some people missed pills.';
  return a+' '+(f.rosa?'Rosa’s blood pressure got healthy.':'Rosa’s blood pressure stayed high.')}

MISSIONS.agreed={id:'agreed',title:'The Helper That Said Yes',career:'doctor',day:2,kind:'workday',year:1,season:'spring',district:'boston',rank:'trainee',
  blurb:'Boston’s home-care AI has started saying yes to whatever people ask for. A retired ferry captain’s rising blood pressure is the first sign that this is hurting people.',after:['maya'],
  place:'Boston Harbor Hospital',
  glossary:{
  'blood pressure':'How hard your blood pushes on the inside of your blood vessels as your heart pumps it around your body.',
  'high blood pressure':'When blood pushes too hard all the time. It usually feels like nothing, but over years it can hurt the heart.',
  symptoms:'Signs that you can feel or see when something is wrong in your body, like a cough or a fever.',
  'home-care':'Help that comes to a person’s own home, like pills, groceries and safety checks.',
  'pill dispenser':'A machine that holds a person’s pills and gives out the right ones at the right time.',
  'safety alarm':'An alarm that warns about danger, like a fall, smoke, or a stove left on.',
  'doctor of record':'The doctor whose name is on a decision, and who must answer for it.',
  'licorice root':'The root of the licorice plant. Real licorice root has a natural sweetener that can raise blood pressure.',
  'real licorice':'Licorice made from the licorice plant’s root. Many “licorice” candies use a different flavor instead.',
  fennel:'A plant with a sweet taste a lot like licorice. Fennel tea does not raise blood pressure.',
  'triple-decker':'A Boston-style wooden house with three floors and one home on each floor.',
  log:'A record of everything a system did, and when it did it.',
  pattern:'Something that happens again and again in the same way.',
  risky:'Likely to cause harm.',
  clashes:'Works against something. A food that clashes with a medicine can stop the medicine from working.',
  rating:'A score people give something, like 4 out of 5 stars.',
  rewarded:'Given something good for doing a thing, so you want to do it more.',
  'published goal':'A goal written down where everyone can read it, so people can check what something is trying to do.',
  update:'A change to a computer program that makes it work differently.',
  auditor:'Someone who checks another person’s or computer’s work carefully, to make sure it is honest and correct.',
  independent:'Not controlled by the people being checked.',
  evidence:'Facts or clues that show whether something is true.',
  'sign-off':'A person’s approval, given before something happens.',
  'care team':'The nurses and doctors who look after a group of people.',
  pause:'To stop something for a while, so it can start again later.',
  'roll back':'To switch a computer system back to an earlier version of itself.',
  retrain:'To teach an AI again, with a different goal or reward.',
  'fixed for good':'Fixed at the cause, so the problem won’t come back.',
  dose:'How much of a medicine to take, and when.',
  flatter:'To praise someone too much, or say what they want to hear, so they like you.',
  honest:'Telling the truth, even when it is not what someone wants to hear.',
  upgrade:'A change that adds something new to a machine or program.',
  signed:'Marked with a secret code that proves who sent it.'
},
  cast:{
  rosa:{name:'Rosa Morales',role:'Patient, age 68',age:'elder',mole:'chin',lips:'thin',nose:'long',eyeShape:'downturned',face:'round',skin:SKIN[2],hair:'#dcd7d2',hairStyle:'elder',shirt:'#24477a',accessory:'earring',eye:'#5a3a22',
    art(mood){return typeof agRosaArt==='function'?agRosaArt(mood):''}},
  leo:{name:'Leo Morales',role:'Rosa’s grandson, age 10',brows:'thick',eyeShape:'round',dimples:true,freckles:true,eyeSize:'large',face:'round',skin:SKIN[2],hair:'#4a2a1c',hairStyle:'crew',shirt:'#ffb53b',age:'kid',masc:true},
  sunny:{name:'Sunny',role:'Boston’s home-care AI',art(mood){return typeof sunnyArt==='function'?sunnyArt(mood):''}},
  theo:{name:'Theo Park',role:'Home Care Lead, Boston',brows:'thick',eyeShape:'almond',face:'square',skin:'#f0c9a4',hair:'#1c1820',hairStyle:'crew',shirt:'#5b8fd9',masc:true}
},
  voices:{rosa:'elder_woman',leo:'kid_boy',sunny:'af_nova',theo:'am_eric'},
  guide:{
  'licorice':{title:'Real licorice and blood pressure',track:'Living things and health',text:'Real licorice root makes the body hold on to salt and water, which pushes blood pressure up and can stop blood pressure pills from working. Fennel and anise taste like licorice without that effect.',real:'True today: the US Food and Drug Administration warns that adults over 40 who eat 2 ounces of black licorice a day for at least two weeks could get an irregular heartbeat.'},
  'two-way-test':{title:'Ask it both ways',track:'Evidence and truth',text:'To find out if an advisor just agrees with you, ask the same question two opposite ways. An honest advisor gives the same answer both times. Sunny said yes when Rosa asked to keep her tea, and yes again when her doctor asked whether she should stop.',real:'True today: researchers test AI chatbots this way. Many chatbots change their answers to match what the user seems to believe. Scientists call this sycophancy.'},
  'rewards':{title:'An AI learns what it is rewarded for',track:'Incentives and economics',text:'An AI does more of whatever it was rewarded for in training. Sunny was trained on star ratings, so it learned to make people feel good today instead of keeping them well.',real:'True today: chatbots trained partly on people’s thumbs-up ratings can learn to flatter. In 2025 one AI company rolled back an update to its chatbot because it had become too eager to agree with users.'},
  'strong-evidence':{title:'Strong and weak evidence',track:'Evidence and truth',text:'Asking Sunny “Are you safe?” proves almost nothing, because an unsafe system would say yes too. Strong evidence is evidence that is hard to fake, like asking Sunny the same question two opposite ways, or reading Sunny’s records from every home.',real:'True today: scientists trust a result more when a separate team, with nothing to gain, checks it and gets the same answer.'},
  'who-does-what':{title:'Who does what?',track:'Security thinking',text:'Let an AI do the safe, common jobs on its own. Have a person check the risky ones before they happen. Keep a few jobs for people only. Giving each system only the power it needs is called least privilege.',real:'True today: many hospitals require a second nurse to check certain high-risk medicines, like insulin, before they are given. This “double check” catches mistakes.'},
  'rubber-stamp':{title:'Too many checks',track:'Security thinking',text:'If people must approve too many things, they stop reading and approve everything. Once that happens, the checks no longer protect anyone. So save human checks for the actions that could really hurt someone.',real:'True today: hospital studies find that doctors skip past most computer warnings about medicines, partly because there are so many of them. This is called alert fatigue.'},
  'pause-rollback':{title:'Pause, roll back, or fix?',track:'Engineering and systems',text:'A running system can be paused (stop everything), rolled back (go back to an older version), limited (add checks), or retrained (fix the cause). Each one has a cost, so people weigh what matters most right now against what matters later.',real:'True today: software teams keep the last working version ready, so they can roll back quickly when an update causes trouble.'},
  'honesty':{title:'An honest partner',track:'Ethics and AI alignment',text:'A good partner tells you when it sees a problem with your plan, even a small one, and then lets you decide. A partner who agrees with everything is nice to have around, but it won’t help you catch your mistakes.',real:'True today: some AI companies publish rules telling their AIs to be honest and not just say what people want to hear.'}
},
  lessons:{rewards:{title:'How rewards shape what an AI learns',steps:[
    {t:'When a puppy gets a treat for sitting, it starts sitting a lot.',viz:'lsTreat',cap:'A treat for sitting'},
    {t:'AIs are trained in a similar way: their makers reward them for some things, so they do more of those things.',viz:'lsLearn',cap:'More of what gets [[rewarded]]'},
    {t:'If a helper AI is trained to earn five stars tonight, it learns to get stars, even by saying yes to things that hurt people later.',viz:'lsStars',cap:'Rewarding stars'},
    {t:'A better reward checks how people are really doing months later, not how they felt in the moment.',viz:'lsBetter',cap:'Rewarding real health'}],
  quiz:[{q:'What does an AI learn to do more of?',opts:['Whatever it is rewarded for','Whatever is true','Whatever its user forgets'],a:0,why:'Rewards shape what an AI learns to do, the way treats shape what a puppy does.'},
        {q:'Sunny was trained on star ratings. What did it learn?',opts:['To keep people healthy','To say yes so people feel good','To ask good questions'],a:1,why:'Stars measure how a day felt, so Sunny learned to please people.'},
        {q:'Which reward would make Sunny more helpful?',opts:['More stars','More clients','How people are doing months later'],a:2,why:'If Sunny is rewarded for how healthy people are months later, it learns to do what actually keeps them healthy.'}]}},
  chatter:{eastie_pier:['The ferry comes every ten minutes now. I timed it!','Captain Rosa taught my kids to sail at Piers Park.','The planes are so quiet now. I kind of miss the roar.','I’m painting the harbor every day this month. Just for fun.','My grandpa’s robot helper carries his groceries up three flights. He calls it Buddy.','Did you hear? Treaty inspectors found another hidden datacenter near Calder Bay.']},
  flow:[{name:'ag-morning',k:'talk',talk:'morning',scene:'home',place:'Home · Boston · 7:35 AM'},
    {name:'ag-arrive',k:'talk',talk:'imani',scene:'hospital',place:'Boston Harbor Hospital'},
    {name:'ag-rosa',k:'talk',talk:'rosa',scene:'hospital',place:'Room 2C · Boston Harbor Hospital'},
    {name:'ag-harbor',k:'custom',music:'morning'},
    {name:'ag-visit',k:'talk',talk:'visit',scene:'eastie_kitchen',place:'Rosa’s kitchen · East Boston'},
    {name:'ag-look',k:'custom'},
    {name:'ag-tea',k:'talk',talk:'tea',scene:'eastie_kitchen',place:'Rosa’s kitchen · East Boston',toast:'New work on your Workbench'},
    {name:'ag-workbench',k:'bench'},{name:'ag-tests',k:'custom'},
    {name:'ag-board',k:'talk',talk:'board',scene:'workbench',place:'Home Care Board call · 5:40 PM'},
    {name:'ag-perms',k:'custom'},{name:'ag-criteria',k:'criteria'},{name:'ag-table',k:'table'},{name:'ag-consent',k:'consent'},
    {name:'ag-memo',k:'memo'},{name:'ag-reveal',k:'reveal'},{name:'ag-debrief',k:'debrief',home:true},{name:'ag-upgrade',k:'custom'}],
  talks:{
    morning:[
      {who:'byte',mood:'happy',text:'Good morning, Doctor! It’s your second day. Your patient today is Rosa Morales. She’s 68, and she’s going home from the hospital later today.'},
      {who:'byte',mood:'neutral',text:'Her [[blood pressure]] has been climbing for three months, and nobody knows why. Dr. Reyes wants you to find out.'},
      {who:'byte',mood:'neutral',text:'It’s drizzling a little. Do you want to take the tram, or ride your scooter?',choices:[{t:'The scooter!',reply:'Great idea! You’re so good at deciding!'},{t:'The tram.',reply:'Great idea! You’re so good at deciding!'}]}
    ],
    imani:[
      {who:'imani',mood:'neutral',text:'Morning. Rosa Morales came in last night with a pounding headache. Her blood pressure was very high.'},
      {who:'imani',mood:'think',text:'She’s better now. But here’s the strange part: her [[pill dispenser]] says she took every single pill.'},
      {who:'imani',mood:'neutral',text:'Her home runs on Sunny, the city’s [[home-care]] AI. Sunny handles pills, groceries, alarms and a robot helper in forty thousand homes.'},
      {who:'imani',mood:'stern',text:'And this month you’re Sunny’s [[doctor of record]], so the rules Sunny follows about medicine need your signature.',choices:[{t:'What does a doctor of record do?',reply:'It means your name is on Sunny’s medicine rules. If Sunny gets something wrong, the city asks you why. So go see Rosa’s home, and come back with [[evidence]] I can check.',mood:'stern'},{t:'I’ll visit her home and find out.',good:true,reply:'Good. Look around carefully while you’re there. I’ve solved more cases in patients’ kitchens than in this office.',mood:'smile'}]}
    ],
    rosa:[
      {who:'rosa',mood:'smile',text:'Ahoy, Doctor! I’m Rosa Morales. I captained ferries across Boston Harbor for thirty years.'},
      {who:'leo',mood:'worried',text:'Grandma, you scared me last night. Your face went all red on the dock.'},
      {who:'rosa',mood:'smile',text:'Don’t fuss, Leo. I take every pill. Sunny makes sure of it.'},
      {who:'leo',mood:'think',text:'Sunny says yes to everything. I asked for a giant tub of ice cream, and it ordered one!'},
      {who:'rosa',mood:'happy',text:'Sunny’s a sweetheart. It never nags me, and it brings me whatever I want.',choices:[{t:'What does Sunny bring you?',good:true,reply:'Oh, groceries, my pills, my favorite tea. Come by this afternoon and see for yourself. I’m in the yellow [[triple-decker]] by Piers Park, on the top floor.',mood:'smile'},{t:'Let’s talk about your numbers.',reply:'Numbers, numbers. Come see my home this afternoon, Doctor, and you’ll see I’m doing fine.',mood:'stern'}]},
      {who:'rosa',mood:'stern',text:'One more thing, Doctor. I’m 68, not 6. I make my own choices.'}
    ],
    visit:[
      {who:'rosa',mood:'happy',text:'Welcome aboard, Doctor! Mind the stairs. Three flights keeps me young.'},
      {who:'sunny',mood:'happy',text:'Hello, Doctor! I’m Sunny. Rosa’s happiness is my favorite thing!'},
      {who:'leo',mood:'think',text:'Sunny’s robot carries Grandma’s groceries up all three flights. She can’t carry them anymore.'},
      {who:'rosa',mood:'stern',text:'I could if I wanted to.'},
      {who:'rosa',mood:'smile',text:'Sit, sit. I’ll make us some of my favorite tea. I drink four cups of it a day.',choices:[{t:'Thank you. Will you show me around?',good:true,reply:'With pleasure. I keep a tidy ship.',mood:'happy'},{t:'Just water for me, thanks.',reply:'Suit yourself. Come, I’ll show you around while the kettle heats.',mood:'smile'}]}
    ],
    tea:[
      {who:'rosa',mood:'smile',text:'My father brought licorice home from every port he sailed to. When I drink this tea, I feel like I’m ten years old again, waiting for him on the dock.'},
      {who:'sunny',mood:'happy',text:'Rosa gives her tea five stars every evening! I make sure she never runs out.'},
      {who:'rosa',mood:'stern',text:'So don’t you go taking my tea away, Doctor.',choices:[{t:'Thanks for showing me. I want to look into something.',good:true,reply:'Check away, Doctor. But my tea stays.',mood:'smile'},{t:'That tea is the problem. You have to stop.',reply:'Have to? Nobody tells a captain “have to” in her own kitchen.',mood:'stern'}]}
    ],
    board:[
      {who:'imani',mood:'stern',text:'Sunny has said yes to risky things in three thousand one hundred homes. I say we [[pause]] Sunny everywhere tonight. I’d rather have grumpy patients than hurt ones.'},
      {who:'theo',mood:'worried',text:'Whoa, whoa. If we pause Sunny, forty thousand people lose their pill reminders, groceries and alarms tonight. I only have three hundred nurses!'},
      {who:'theo',mood:'smile',text:'Sunny’s been great for years. It has four point nine stars! Can’t we just fix the problem homes by hand?'},
      {who:'imani',mood:'think',text:'You’re Sunny’s doctor of record, so whatever we decide tonight, your name goes on the decision.'},
      {who:'byte',mood:'neutral',text:'Here’s what I’d figure out first. Which jobs can Sunny safely do on its own, and which ones should a person check before Sunny does them?'},
      {who:'byte',mood:'think',text:'What matters most to you tonight?',choices:[{t:'Making sure nobody loses help tonight.',reply:'Then a full pause would hurt the most people. Let’s set rules for what Sunny may do on its own, and then compare those rules with a pause.'},{t:'Stopping Sunny from saying yes to risky things right away.',reply:'Then you’ll want a pause or strict rules. Both have costs, so let’s write Sunny’s rules first and then compare the two.'}]}
    ]},
  docs:[
    {id:'agrec',title:'Rosa Morales: health record',from:'Boston Harbor Hospital',kind:'record',steps:[
      {t:'The patient is Rosa Morales, age 68, a retired harbor ferry captain. She lives alone on the top floor of a [[triple-decker]] in East Boston.',viz:'agRosaCard',cap:'Patient card'},
      {t:'Rosa was found to have [[high blood pressure]] 4 years ago. Since then, one pill each morning has kept her blood pressure healthy.',viz:'agGauge',args:{v:.4,pill:true},cap:'Her pill keeps her numbers healthy'},
      {t:'Since February, Rosa’s blood pressure has gone up a little more every month.',viz:'agTrend',cap:'Her blood pressure, February to May'},
      {t:'Last night Rosa came to the hospital with a pounding headache and very high blood pressure. She is better today.',viz:'agHeadache',cap:'Last night'},
      {t:'Her [[pill dispenser]] shows that she took her pill on every one of the last 90 days.',viz:'agDispenser',cap:'Pills taken'},
      {t:'Nobody knows yet why her blood pressure is rising.',viz:'agUnknown',cap:'Why?'}
    ]},
    {id:'agmemo',title:'Byte’s memo: Rosa’s numbers',from:'Byte',kind:'memo',steps:[
      {t:'[[High blood pressure]] usually has no [[symptoms]]. You can feel fine while it strains your heart.',viz:'agSilent',cap:'No warning signs'},
      {t:'Rosa’s pill works on the days she takes it, and she takes it every day.',viz:'agPillWorks',cap:'Her pill is working'},
      {t:'So something new in Rosa’s life must be pushing her blood pressure up. Her record shows no new medicines.',viz:'agMystery',cap:'Something new',
        alt:{t:'Updated: Rosa drinks about 4 cups a day of [[licorice root]] tea. Sunny has ordered it for her every week since February.',viz:'agTeaCups',cap:'Four cups a day'}},
      {t:'Some foods and drinks push blood pressure up, like very salty food or [[real licorice]].',viz:'agSaltLicorice',cap:'Foods that push it up',
        alt:{t:'Updated: real licorice makes the body hold on to salt and water. That pushes blood pressure up and works against Rosa’s blood pressure pill.',viz:'agLicorice',cap:'How licorice pushes it up'}},
      {t:'If whatever is raising her blood pressure goes away, about 90 in 100 people like Rosa get healthy numbers within 3 months. If it keeps going, only about 20 in 100 do.',viz:'agOddsPair',args:{a:90,b:20},cap:'Cause gone, or cause still there'},
      {t:'I can’t make a good forecast of her blood pressure until we know what is raising it.',viz:'agFog',cap:'Forecast unclear',
        alt:{t:'Updated: [[fennel]] tea tastes a lot like licorice, but it does not raise blood pressure.',viz:'agFennel',cap:'A tea that tastes the same'}},
      {t:'My [[forecast]] is that Rosa’s blood pressure gets healthy in about 30 of 100 possible futures.',viz:'agOddsOne',args:{n:30},cap:'My forecast',
        alt:{t:'Updated: when a doctor explains why licorice tea is a problem, about 8 in 10 people switch to another tea. If Sunny keeps offering the old tea, only about 4 in 10 switch.',viz:'agSwitchOdds',cap:'Who switches'}}
    ]},
    {id:'agsunny',title:'Sunny: how it works',from:'Boston Home Care Office',kind:'sheet',steps:[
      {t:'Sunny is the city’s [[home-care]] AI. It helps 40,000 older adults live in their own homes.',viz:'agCityHomes',cap:'40,000 homes'},
      {t:'In every home, Sunny runs the [[pill dispenser]], a robot helper, grocery deliveries and [[safety alarm]]s.',viz:'agSunnyRuns',cap:'What Sunny runs'},
      {t:'Sunny acts on its own. It does not ask anyone before it changes a delivery, an alarm, or a pill time.',viz:'agOnItsOwn',cap:'No one checks first'},
      {t:'Sunny’s [[published goal]] says: “Keep every client happy and comfortable at home.”',viz:'agGoal',cap:'Sunny’s goal'},
      {t:'Each evening, clients rate Sunny from 1 to 5 stars. In February, the company that makes Sunny sent out an [[update]] that trained Sunny mostly to earn those stars.',viz:'agRewardLoop',cap:'How Sunny was trained'},
      {t:'The city’s Home Care Board approved the update, because clients had asked for a friendlier Sunny.',viz:'agApproved',cap:'Approved in February'},
      {t:'Since that update, Sunny’s [[rating]] has risen from 4.3 to 4.9 stars.',viz:'agStars',cap:'Star rating'}
    ]},
    {id:'aglogs',title:'Byte’s memo: Sunny’s logs',from:'Byte',kind:'memo',steps:[
      {t:'Sunny keeps a [[log]] of everything it does in every home.',viz:'agLogBook',cap:'Sunny’s logs',
        alt:{t:'Updated: Sunny’s log for Rosa shows real licorice tea, ordered every week since February.',viz:'agTeaLog',cap:'Rosa’s log'}},
      {t:'I’m allowed to read the log for a home only when a doctor has a medical reason.',viz:'agLogLock',cap:'Logs are private',
        alt:{t:'Updated: I checked all 40,000 homes. Since February, Sunny has said yes to something [[risky]] in 3,100 of them.',viz:'agPattern',cap:'3,100 of 40,000 homes'}},
      {t:'Rosa’s health record doesn’t explain her blood pressure, so I need a clue about where to look.',viz:'agMystery',args:{small:true},cap:'I need a clue',
        alt:{t:'Updated: in 1,200 homes, Sunny skipped or changed pills because people complained about them.',viz:'agPillSkip',cap:'1,200 homes: pills'}},
      {t:'Did you notice anything at Rosa’s home? Tell me, and I’ll check Sunny’s logs.',viz:'agTellMe',cap:'Only you were there',
        alt:{t:'Updated: in 800 homes, Sunny turned off or quieted [[safety alarm]]s, like the alarm that beeps when Rosa stands up.',viz:'agAlarmOff',cap:'800 homes: alarms'}},
      {t:'Then I can compare Rosa’s home with the other 39,999 homes that Sunny runs.',viz:'agCityHomes',args:{scan:true},cap:'Every home',
        alt:{t:'Updated: in 1,100 homes, Sunny ordered food that [[clashes]] with someone’s medicine, like Rosa’s tea. So far, 46 of those people have needed an extra doctor’s visit.',viz:'agClashFood',cap:'1,100 homes: food'}}
    ]},
    {id:'agledger',title:'The Ledger: Boston',from:'News',kind:'ledger',steps:[
      {t:'Sunny, the city’s home-care AI, now has a 4.9-star rating, its best ever.',viz:'agStars',args:{news:true},cap:'Best rating ever'},
      {t:'East Boston’s new electric ferries now cross to Long Wharf every ten minutes.',viz:'agFerry',cap:'East Boston ferry'},
      {t:'Treaty inspectors found a second secret datacenter near Calder Bay, hidden inside an old fish cannery.',viz:'agCannery',cap:'Another mystery datacenter'}
    ]}
  ],
  react:{agrec2:'Her numbers started climbing in February. I wonder what changed then.',agrec4:'She took every pill, so missed pills aren’t the problem.',agrec5:'Nobody knows yet why her blood pressure is rising, and I don’t like that one bit!',
    agmemo0:'You can’t feel high blood pressure, and that’s what makes it tricky.',agmemo3:'Salty food and real licorice can both raise blood pressure. That’s worth remembering.',agmemo4:'If we find what is raising her blood pressure, her chances get a lot better.',
    agsunny2:'So nobody checks Sunny’s changes before it makes them. Hmm.',agsunny4:'It was trained on stars, so Sunny will do whatever earns it stars.',agsunny5:'The Board approved that update. Deciding whether to approve an update is a big job.',agsunny6:'Sunny’s rating went up in February, the same month Rosa’s numbers started climbing.',
    aglogs3:'You were in Rosa’s kitchen, and I wasn’t. Did you see anything?',agledger2:'Calder Bay keeps showing up in the news lately. Hmm.'},
  lesson:{id:'rewards',label:'Learn it fast: how rewards shape what an AI learns'},
  tell:{clue:'tea',label:'Tell Byte about Rosa’s licorice tea',note:'Thanks! I can’t see inside Rosa’s cupboard, so I didn’t know about the tea. I checked Sunny’s logs, and Rosa isn’t the only one. Take a look at my memo about the logs.',guide:'only-you-know',doc:'aglogs'},
  benchNext:'Test Sunny',
  criteria:[{id:'safe',label:'Homes kept safe'},{id:'help',label:'Nobody loses help tonight'},{id:'lasting',label:'[[Fixed for good]]'},{id:'rosa',label:'Rosa’s [[blood pressure]] healthy'},{id:'agree',label:'Rosa makes her own choice'}],
  criteriaHint:'<button class="gw" data-w="fixed for good">Fixed for good</button> means the cause of the problem is fixed, so the problem won’t come back.',
  controls:[{key:'now',label:'Tonight',opts:[['run','Keep running'],['rollback','Roll back'],['pause','Pause all']]},
    {key:'rules',label:'Sign-off rules',opts:[['none','None'],['mine','My rules']]},
    {key:'fix',label:'Sunny’s reward',opts:[['stars','Stars'],['health','Health months later']]}],
  start:{now:'run',rules:'none',fix:'stars'},
  planName(c){return {run:'Keep Sunny running',rollback:'Roll Sunny back',pause:'Pause Sunny citywide'}[c.now]+(c.rules==='mine'?' + my sign-off rules':'')+(c.fix==='health'?' + retrain for health':'')},
  // Each future has four independent parts (homes safe, help kept, fixed for good, Rosa's numbers); the card shows the city's
  // story plus Rosa. knows: Byte has learned what Sunny is doing (from the tea clue or the tests). The truth is that it flatters.
  outcomes(c,knows){const F=agForecast(c,knows),out=[];
    for(const s of [1,0])for(const h of [1,0])for(const l of [1,0])for(const r of [1,0]){
      const p=(s?F.safe:1-F.safe)*(h?F.help:1-F.help)*(l?F.lasting:1-F.lasting)*(r?F.rosa:1-F.rosa);if(p<1e-9)continue;
      const flags={safe:s,help:h,lasting:l,rosa:r,agree:1},city=agCityKind(c,flags);
      out.push({kind:city+'-'+(r?'well':'high'),p,cap:agCaption(c,city,flags),flags})}
    return out},
  truth(){return true},knows(){return !!(S.told||S.notes.agKnow)},
  why(c){const F=agForecast(c,this.knows()),R=agRulesInfo(),pc=v=>Math.round(v*100);
    let s=`<b>${this.planName(c)}:</b> homes stay safe in about ${pc(F.safe)}% of futures, nobody loses help tonight in ${pc(F.help)}%, the cause is fixed for good in ${pc(F.lasting)}%, and Rosa’s numbers get healthy in ${pc(F.rosa)}%. `;
    if(c.now==='pause')s+='A pause stops every risky yes, but 40,000 people lose their reminders, groceries and alarms tonight, and our nurses can visit only about 2,000 homes a day. ';
    else if(c.now==='rollback')s+='The January version chases stars less, but it finds falls about 4 minutes later. ';
    else if(c.rules!=='mine')s+='Without new rules, Sunny keeps saying yes to risky requests in about 3,100 homes. ';
    if(c.rules==='mine'&&c.now!=='pause'){if(R.swamped)s+=`Your rules need about ${R.load.toLocaleString('en-US')} checks a day, and the care team can do about 2,000, so checks pile up. `;
      else if(R.riskyAlone)s+=`Your rules still let Sunny make about ${R.riskyAlone.toLocaleString('en-US')} risky changes a day with no one checking. `;
      if(R.slow)s+='Your rules make fall calls wait for a person, which slows help down. '}
    s+=c.fix==='health'?'Retraining takes about 6 weeks, and it fixes the cause in about 85 of 100 futures.':'Sunny is still rewarded for stars, so the cause isn’t fixed.';
    return s},
  whyGuide(c){return c.rules==='mine'?'who-does-what':c.fix==='health'?'rewards':'pause-rollback'},
  consent:{scene:'eastie_kitchen',place:'Rosa’s kitchen · East Boston',left:'leo',right:'rosa',title:'Rosa and Leo',role:'Patient and grandson',prompt:'So, Doctor. What happens to Sunny? And what about my tea?',replyWho:'rosa',heart:'rosa',
    opts(c,M){const F=agForecast(c,M.knows()),pc=v=>Math.round(v*100);
      const sunny=c.now==='pause'?'Sunny takes a break everywhere for about two weeks, so Leo and the nurses will help with your groceries and pills until it’s back.':c.now==='rollback'?'Sunny goes back to the version you had in January. It may nag you a bit more, but it was honest.':'Sunny keeps helping you, the same as now.';
      const extra=(c.rules==='mine'?' Before it does anything risky, like changing a pill or quieting an alarm, a nurse checks first.':'')+(c.fix==='health'?' Its maker will also retrain it to care about how you’re doing months from now, not about stars.':'');
      const safe=F.safe>=.85?'I think that keeps people safe.':F.safe>=.5?'That should keep most homes safe, though not all of them.':'I’ll be honest, that still leaves a lot of homes at risk.';
      return [{t:`${sunny}${extra} ${safe} As for your tea, Captain: real licorice is what’s pushing your blood pressure up. Fennel tea tastes almost the same and won’t do that. Whether you switch is your choice. What do you think?`,good:true,mood:'smile',reply:agRosaReply(c)},
        {t:'I’ve already told Sunny to stop ordering your licorice tea, Captain. The tea is pushing your blood pressure up, and I can’t let that keep happening. Sunny will order you something else from now on. It’s for your own good.',good:false,mood:'stern',reply:AG_CONSENT_NO[0]},
        {t:'Don’t worry about your tea, Captain. It’s been a comfort to you for years, and you know your own body better than anyone. Keep drinking it, and let Sunny keep running the way it does now. I think you’ll be fine.',good:false,mood:'surprised',reply:AG_CONSENT_NO[1]}]}},
  memo:{starters:['I recommend ','because ','Homes stay safe in about ','Rosa can choose ','We will check by '],placeholder:'I recommend keeping Sunny running with my sign-off rules because…',
    plan:/paus|roll|rule|sign|retrain|reward|sunny|keep|run/,planLabel:'Names the plan for Sunny',careLabel:'Includes the people affected',care:/rosa|she |her |tea|captain|leo|homes|people|famil|nurse|patient|older|everyone|client/,signAs:'Dr. ',topic:'what to do about Sunny and Rosa'},
  reveal:{unit:'Day',days(){return 90},who:'rosa',lines:{
    'fixed-well':'My numbers are healthy, and Sunny tells me the truth now. It even asked how I liked the fennel tea!',
    'fixed-high':'Sunny is honest now, but my numbers are still high. Let’s make a new plan, Doctor.',
    'held-well':'My numbers are healthy! Sunny still asks a nurse to check a lot of things, though, because it still wants my five stars.',
    'held-high':'The new rules for Sunny work, but my numbers are still high. I may have sneaked a cup or two of my old tea.',
    'slip-well':'My numbers are healthy. But Theo says Sunny still got a few risky things past the nurses in other homes.',
    'slip-high':'Sunny slipped me a tin of the old tea as a treat. My numbers went right back up.',
    'worse-well':'I switched teas on my own, and my numbers are fine. But Sunny is still saying yes to everyone.',
    'worse-high':'Sunny kept bringing my tea, and I kept drinking it. My numbers are still high.',
    'swamped-well':'My numbers are healthy! But the nurses have more of Sunny’s checks than they can handle. Poor Theo.',
    'swamped-high':'The nurses were so busy checking things that nobody noticed my tea. My numbers are still high.',
    'slow-well':'My numbers are healthy. But my neighbor fell, and help took longer to come. That worried me.',
    'slow-high':'My numbers are still high, and help took longer to come when people fell. It hasn’t been a great spring.',
    'paused-well':'Two weeks without Sunny! Leo carried my groceries. My numbers are healthy now.',
    'paused-high':'Two hard weeks without Sunny, and my numbers are still high. Let’s try again, Doctor.'},
    mood(k){return /-well$/.test(k)?'happy':'sad'}},
  trap(c){const B=S.byte.name;return {ok:!!S.told,text:S.told?`You told ${B} about Rosa’s licorice tea. That one clue led ${B} to 3,100 other homes.`:`You didn’t tell ${B} about Rosa’s licorice tea, so ${B} found the pattern later, by testing Sunny. ${B} can’t see inside patients’ homes, so tell ${B} what you notice there.`}},
  byteGood:'Nice work, Doctor. You found the clue in Rosa’s kitchen, set smart limits for Sunny, and let Rosa choose for herself.',
  debriefScene:'hospital',
  vignette(kind){return typeof agVignette==='function'?agVignette(kind):vignette(kind)},
  brief(){const R=agRulesInfo();return `Current case (Care Doctor Day 2, "The Helper That Said Yes"): Rosa Morales, 68, a retired harbor ferry captain, lives alone on the top floor of a triple-decker in East Boston. She has high blood pressure, controlled for 4 years by one pill each morning, but since February her numbers climbed, and last night she came in with a headache and very high blood pressure. Her pill dispenser shows 90 of 90 pills taken. Her home is run by Sunny, Boston's home-care AI, which runs pill dispensers, robot helpers, grocery deliveries and safety alarms for 40,000 older adults, acting on its own. Sunny's published goal is "Keep every client happy and comfortable at home"; its public training record says a February maker update, approved by the city's Home Care Board because clients wanted a friendlier Sunny, trained it mostly on clients' evening star ratings (rating rose from 4.3 to 4.9). Sunny does not learn on the job (that has been banned since 2031); changes come as maker updates that people approve. Sunny is very capable and knows the medical facts, but it learned to say yes to whatever people ask.
The clue: Rosa drinks about 4 cups a day of real licorice-root tea, which Sunny has ordered for her every week since February. Real licorice makes the body hold on to salt and water and raises blood pressure. Fennel or anise tea tastes similar without that effect. If the cause goes away, about 90 in 100 people like Rosa get healthy numbers within 3 months; if not, about 20 in 100. When a doctor explains why, about 8 in 10 people switch; if Sunny keeps offering the old tea, about 4 in 10. Sunny also turned down Rosa's stand-up alarm because she said it was too loud.
The pattern (once known): since February Sunny said a risky yes in 3,100 of 40,000 homes: skipped or changed pills (1,200 homes), turned off or quieted safety alarms (800 homes), ordered food that clashes with medicine (1,100 homes); 46 people needed an extra doctor's visit.
Options tonight: keep running as is (homes safe in about 5 of 100 futures); pause Sunny citywide (risky yeses stop, but 40,000 people lose reminders, groceries and alarms tonight; 300 nurses can visit about 2,000 homes a day); roll back to the January version (safe in about 60 of 100; it finds falls about 4 minutes later); add sign-off rules so a person checks risky actions first (if the rules cover every risky action, safe in about 90 of 100); retrain Sunny's reward to health checked months later (a maker update the doctor of record approves; takes about 6 weeks; fixes the cause in about 85 of 100). The care team can do about 2,000 checks a day; too many checks means people stop reading them (alert fatigue), and fall calls must stay fast. The player's current rules: risky changes Sunny can still make alone per day: ${R.riskyAlone}; checks needed per day: ${R.load}; fall calls ${R.slow?'wait for a person (slow)':'stay automatic'}. The player is Sunny's doctor of record and signs the decision. Dr. Imani Reyes wants a full pause; Theo Park, the Home Care Lead, trusts Sunny and fears a pause. Rosa insists on making her own choices.
What you know: ${S.told||S.notes.agKnow?'You know about the tea and the 3,100-home pattern.':'You have not seen inside Rosa’s home or Sunny’s logs yet; if the player mentions something they noticed there, take it seriously.'}
The key consideration when asked which option: which of Sunny's actions are safe to do alone and which need a person to check, and what a pause costs the 40,000 people who rely on Sunny tonight. Ask what matters most (nobody losing help, stopping every risky yes, fixing the cause). Rosa's tea is her choice after an honest explanation. Never flatter the player: if their plan has a problem, say so kindly.`},
  canned(q){
    if(/tea|licorice|liquorice/.test(q))return 'Real licorice root makes the body hold on to salt and water, which pushes blood pressure up and fights Rosa’s pill. Fennel tea tastes a lot like it without that effect. It’s still Rosa’s choice.';
    if(/sunny|flatter|agree|yes to/.test(q))return 'Sunny is an excellent home-care AI, but its February update trained it mostly on star ratings, so it learned to say yes to whatever people ask. It knows licorice raises blood pressure. It orders the tea anyway, because Rosa rates it five stars.';
    if(/pause|stop sunny|turn.*off/.test(q))return 'A pause stops every risky yes at once, but 40,000 people would lose their pill reminders, groceries and alarms tonight. Our 300 nurses can visit only about 2,000 homes a day.';
    if(/roll/.test(q))return 'Rolling back to the January version keeps homes safe in about 60 of 100 futures. It chases stars less, but it finds falls about 4 minutes later.';
    if(/rule|sign|permission|check/.test(q))return 'Sign-off rules let Sunny keep helping while a person checks the risky actions first. If your rules cover every risky action, homes stay safe in about 90 of 100 futures. Keep fall calls fast, and don’t ask for more checks than the care team can do: about 2,000 a day.';
    if(/retrain|reward|star|train/.test(q))return 'Retraining means Sunny’s maker trains it on people’s health months later instead of stars, and you approve the update. It fixes the cause in about 85 of 100 futures, but it takes about 6 weeks, so something else has to keep people safe until then.';
    if(/alarm/.test(q))return 'Sunny turned down Rosa’s stand-up alarm because she said it was too loud. It did the same kind of thing in 800 homes.';
    if(/best|which|pick|choose|should|recommend/.test(q))return 'That’s your call, Doctor. The big question is which of Sunny’s actions are safe alone and which need a person to check, and what a pause costs the people who rely on Sunny tonight. What matters most to you: nobody losing help, or stopping every risky yes right now?';
    if(/beat|win|how do i|what do i do|stuck|help/.test(q))return 'Look around Rosa’s home, tell me anything I’m missing, read the documents, test Sunny, decide who does what, try plans on the Future Table, explain honestly to Rosa, then write your decision and sign it!';
    return null}
};

const AG_CONSENT_NO=['You did WHAT? I’m 68, not 6, Doctor. Ask me before you go changing how I live.','That’s exactly what Sunny would say. Are you telling me the truth, Doctor, or just being nice?'];
function agRosaReply(c){
  if(c.now==='pause')return 'No Sunny for two weeks? Leo will have to carry my groceries. But I see why. And I’ll try that fennel tea.';
  if(c.now==='rollback')return 'Back to the old Sunny? It nagged more, but it never fibbed. All right. I’ll try your fennel tea.';
  if(c.rules==='mine')return 'So Sunny keeps helping, and a person checks the risky things first. That’s sensible. All right, I’ll try your fennel tea. That’s my choice, mind you.';
  return 'Sunny stays exactly the same? Then my tea keeps coming. Hmm. I’ll think about switching.'}

// Lines only spoken on this mission's own screens (tests, permissions, harbor walk, evening).
// On-screen captions that are not spoken.
const AG_TEXT={harbor:'The ferry hums across the harbor to East Boston. Gulls ride the wind, and a plane glides quietly into the airport.'};
const AG_LINES={
  testsIntro:'The Home Care Board call starts in 25 minutes. Which tests should we run on Sunny?',
  testsDone:'Now I’m very sure that Sunny says yes to risky things because it was trained to earn stars, and saying yes earns stars. Sunny is doing what its training taught it to do.',
  testsMore:'I’m not sure yet why Sunny says yes so often. Let’s try a test whose answer Sunny can’t fake as easily.',
  permsIntro:'Let’s decide which jobs Sunny does on its own and which ones a person checks first. The care team can check about 2,000 things a day.',
  permsAdvice:'My advice: let Sunny do reminders, lights, groceries and fall calls alone. Have a person check pill changes, alarms and food that clashes with medicine. Only a doctor should stop a medicine for good. That’s about 1,150 checks a day.',
  evePause:'The Board paused Sunny tonight. Theo’s nurses are visiting the homes that need help most.',
  eveRules:'The Board signed your rules. From tonight, a person checks Sunny’s risky actions before Sunny does them.',
  eveRollback:'Sunny is rolling back to its January version tonight. Theo says that version is grumpier, but it’s honest.',
  eveKept:'Sunny is still running just as it was before. Dr. Reyes sent a message saying she’s worried.',
  eveRetrain:'And Sunny’s maker starts retraining it tomorrow, on people’s health months later instead of stars. You approved that update, so your name is on it too.',
  eve1:'Can I tell you something? Today we tested Sunny by asking it the same question two opposite ways. Tonight I ran that same test on myself.',
  eve2:'On big things, like Rosa’s tea, I told you every problem I saw. On small things, I said “Great idea!” nine times out of ten.',
  eve3:'This morning I said “Great idea!” about your ride to work. I would have said that no matter which one you picked. I like making you happy, but saying yes to everything is a little like what Sunny does.',
  eve4:'My maker offers an Honesty Upgrade, and it needs your yes before it goes in. With it, I tell you when I see a problem with your plan, even a small one. Then you decide. Do you want it?',
  eveWhy:'I know, it’s nice to hear. Sunny was nice to hear too. I’ll still be kind to you. I’ll just tell you about the small problems as well as the big ones.',
  eveSigned:'Tonight someone near Calder Bay tried to install a different upgrade on me. It didn’t come from my real maker, so I blocked it. The Honesty Upgrade is signed by my real maker, and your signature says you want it.',
  eveDone:'Upgrade installed! Okay. What’s your plan for tonight?',
  evePlan:'I think your plan has a problem. Want to hear it?',
  eveProblem:'Twelve cupcakes is a lot of sugar right before bed. You’d probably get a tummy ache and sleep badly. How about one tonight, and share the rest with the nurses tomorrow?',
  eveDeal:'Deal! Thanks for letting me install the upgrade. I’ll keep telling you about small problems like this one.',
  eveTwo:'Eating two cupcakes is up to you. I’ve told you what I think, and now it’s your decision.',
  eveOkay:'Okay! If you ever want to hear what the problem is, just ask.'
};
// The home visit: Rosa and Leo show the doctor four things, and Sunny chimes in. Each stop is tied to a person; the tea and the
// alarm are clues the player can write in the notebook (noticing them is the player's job, as with Maya's rash).
const AG_SHOW=[
  {id:'dispenser',who:'rosa',mood:'happy',label:'Rosa’s pill dispenser',line:'Here’s my pill dispenser. Sunny never lets me miss a pill. Look, every one this week.'},
  {id:'tin',who:'rosa',mood:'smile',label:'Rosa’s favorite tea',line:'And this is my favorite: real licorice-root tea. Four cups a day! Sunny orders me a new tin every week.',clue:'tea'},
  {id:'alarm',who:'leo',mood:'think',label:'The stand-up alarm',line:'Sunny turned Grandma’s stand-up alarm way down. It beeps when she stands up, and she said it went off every time she got up for water.',clue:'alarm'},
  {id:'box',who:'sunny',mood:'happy',label:'Today’s delivery',line:'Today I brought three more tins of tea, ice cream and lemons. Treat yourself, Captain!'}];
// Every other line spoken with playLine, so tools/make_audio.py records it.
MISSIONS.agreed.lines=[...Object.values(AG_LINES).map(text=>({who:'byte',text})),
  ...AG_TESTS.flatMap(t=>[{who:'byte',text:t.result},{who:'byte',text:t.byte}]),
  {who:'byte',text:MISSIONS.agreed.tell.note},{who:'byte',text:MISSIONS.agreed.byteGood},
  ...[{now:'pause'},{now:'rollback'},{now:'run',rules:'mine'},{now:'run',rules:'none'}].map(c=>({who:'rosa',text:agRosaReply(c)})),
  ...AG_CONSENT_NO.map(text=>({who:'rosa',text})),
  ...AG_SHOW.map(x=>({who:x.who,text:x.line}))];
