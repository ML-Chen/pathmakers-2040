// hired.js — "Getting Hired": the Care Doctor career journey that leads into Day 1 (spec: Core loop → Career journey, steps 1 to 5).
// Explore a day in the life, meet people at the hospital open house, do a practice case (Ari's ankle) that is saved to the
// Portfolio Book, interview with Dr. Reyes (optional rehearsal with Byte), and the first day with the team.
// This file is only content: the screens are the generic career-journey screens in src/career.js (step kinds explore, meet,
// portfolio, interview, firstday), and the practice case uses the engine's generic mission screens. The career's big talk
// and promotion are MISSIONS.grandrounds (src/missions/grandrounds.js). The day-in-the-life panels are in src/viz/hired_viz.js.

const HIRED_GLOSSARY={
  'open house':'A day when a place invites everyone in to look around and meet the people who work there.',
  'charge nurse':'The nurse who leads the other nurses on one floor during a shift.',
  'chief of care':'The doctor in charge of how patients are cared for in the whole hospital.',
  volunteer:'Someone who helps without being paid.',
  sprain:'An injury where a ligament gets stretched or torn, often in an ankle or wrist.',
  ligament:'A strong, stretchy band that holds two bones together at a joint.',
  brace:'A support you wear around a joint, like an ankle, to keep it from twisting.',
  'walking boot':'A big, stiff boot that keeps an injured foot or ankle still while you walk.',
  scrimmage:'A practice game that does not count in the standings.',
  playoff:'A game near the end of the season that decides who moves on to win.',
  goalkeeper:'The soccer player who guards the goal and may use their hands.',
  portfolio:'A collection of your best work that shows what you can do.',
  interview:'A meeting where someone asks you questions to decide whether to hire you.',
  referral:'When someone who knows you recommends you to someone else.',
  rehearse:'To practice something before you do it for real.',
  trainee:'Someone who is new at a job and still learning it.',
  'house rule':'A rule that one family, team, or workplace agrees to follow.'
};

const HIRED_CAST={
  gabi:{name:'Gabi Santos',role:'Charge nurse',skin:SKIN[2],hair:'#3a2418',hairStyle:'bun',shirt:'#5b9bf0'},
  kofi:{name:'Kofi Asante',role:'Robot crew lead',skin:SKIN[5],hair:'#141010',hairStyle:'buzz',shirt:'#ff9f43',masc:true},
  ruth:{name:'Ruth Abrams',role:'Volunteer, age 88',skin:SKIN[0],hair:'#e9e6f0',hairStyle:'elder',shirt:'#b07ce8',glasses:true},
  ari:{name:'Ari Mensah',role:'Patient, age 10',skin:SKIN[4],hair:'#161010',hairStyle:'short',shirt:'#2fbf71',age:'kid',masc:true},
  abena:{name:'Abena Mensah',role:'Ari’s grandma',skin:SKIN[4],hair:'#d8d4dc',hairStyle:'elder',shirt:'#e85d75',glasses:true}
};

const HIRED_GUIDE={
  'good-questions':{title:'Asking good questions',track:'People skills',text:'A good question is specific and open. “What’s the hardest part of your job?” teaches you more than “Is it fun?” Asking about a career before you choose it is how you find one that fits.',real:'True today: career counselors suggest informational interviews, short talks where you ask someone about their job.'},
  'referrals':{title:'Trust and referrals',track:'People skills',text:'When lots of people can do a job, people pick someone they already trust. People come to trust you when you’re kind and helpful, even when nobody is grading you.',real:'True today: many jobs are filled through referrals, where someone who works there recommends a person they know.'},
  'self-report':{title:'What people say vs. how they feel',track:'Evidence and truth',text:'Some people say “I’m fine” when they are hurting, so a plan that depends on what someone says can fail. Ari hides pain, so “stop if it hurts” was not a safe plan for him.',real:'True today: athletes sometimes hide concussion symptoms to keep playing, so many sports leagues use sideline checks that don’t depend only on what the player says.'},
  'specific-stories':{title:'Show your work',track:'People skills',text:'A real story with details (what you decided, why, and how it turned out) shows more than saying “I’m good at decisions.” Honest stories about mistakes count too.',real:'True today: many interviewers ask “Tell me about a time when…” questions, and people prepare by writing down real examples of their work.'}
};

const HIRED_TALKS={
  home:[
    {who:'byte',mood:'happy',text:'Good morning, {P}! Guess what? Boston Harbor Hospital is looking for a new Care Doctor.'},
    {who:'byte',mood:'neutral',text:'Today is their [[open house]]. Anyone can visit, meet the people who work there, and try a practice case.'},
    {who:'byte',mood:'happy',text:'Want to see what a Care Doctor’s day looks like first?',choices:[
      {t:'Yes, show me!',reply:'Woof! Here’s a whole day, squeezed into thirty seconds.'},
      {t:'What does a Care Doctor do?',reply:'A Care Doctor helps patients and their families choose a treatment. I find the facts and make the forecasts. You listen to the family, use your judgment, and sign the decision.'}]}
  ],
  gabi:[
    {who:'gabi',mood:'smile',text:'Hi there! Welcome to the [[open house]]. I’m Gabi, the [[charge nurse]] on the kids’ floor.',choices:[
      {t:'Hi Gabi, I’m {P}. What does a charge nurse do?',good:true,mood:'happy',reply:'I make sure every kid on our floor gets what they need, and every nurse has a buddy. Halo, the hospital’s AI, does the schedules, so I get to spend my time with people.'},
      {t:'Can you get me a job here?',mood:'think',reply:'Ha! Let’s start with hello. I’m Gabi, and it’s nice to meet you.'}]},
    {who:'gabi',mood:'happy',text:'My cat is named Bandage, because he sleeps on the first-aid box.',clue:'gabi-cat'},
    {who:'gabi',mood:'worried',text:'Oh no. I promised the kids’ floor this box of teddy bears, and the elevator robot is busy.',choices:[
      {t:'I can carry it for you!',good:true,on(){jFavor('gabi')},mood:'happy',reply:'You’re a star. The kids are going to love them.'},
      {t:'Maybe a robot can take it later.',mood:'sad',reply:'Maybe. They were hoping for them today, though.'}]}
  ],
  kofi:[
    {who:'kofi',mood:'smile',text:'Hey! Mind the robots. I’m Kofi. I lead the robot crew that carries supplies around the hospital.',choices:[
      {t:'What’s the hardest part of your job?',good:true,mood:'think',reply:'Deciding what each robot is NOT allowed to do. A robot that delivers lunch doesn’t need a key to the medicine room.'},
      {t:'Are robots smarter than you?',mood:'happy',reply:'They’re better than me at carrying boxes in the dark, that’s for sure. But I’m the one who decides which boxes matter most.'}]},
    {who:'kofi',mood:'happy',text:'I name every robot after a planet. That big one is Jupiter.',clue:'kofi-planets'},
    {who:'kofi',mood:'worried',text:'Uh oh. Jupiter keeps beeping at that wet-floor sign. It thinks the sign is a person! Could you move the sign while I fix its settings?',choices:[
      {t:'Sure, I’ll move it!',good:true,on(){jFavor('kofi')},mood:'happy',reply:'Thanks! Look, Jupiter is rolling again.'},
      {t:'Can’t the robot figure it out?',mood:'neutral',reply:'Not today, apparently. I’ll do it myself.'}]}
  ],
  ruth:[
    {who:'ruth',mood:'smile',text:'Hello, dear. I’m Ruth. I’ve been a [[volunteer]] here every Tuesday for twenty years.',choices:[
      {t:'Hi Ruth, I’m {P}. Why do you volunteer?',good:true,mood:'happy',reply:'This hospital fixed my hip when I was eighty. Now I walk three miles a day, and coming here is my way of saying thank you.'},
      {t:'Twenty years? Wow, you must be really old!',mood:'think',reply:'Ha! Eighty-eight, and proud of it, dear.'}]},
    {who:'ruth',mood:'happy',text:'On Fridays I play the piano in the lobby. My favorite song is “Fly Me to the Moon.”',clue:'ruth-song'},
    {who:'ruth',mood:'worried',text:'Oh, bother. I’ve lost my reading glasses again. They have red frames, and they’re somewhere in this lobby.',choices:[
      {t:'I’ll help you look!',mood:'smile',reply:'Bless you, dear.'},
      {t:'I hope you find them.',mood:'sad',reply:'Thank you. I’ll keep looking.'}]}
  ],
  reyes:[
    {who:'imani',mood:'smile',text:'Hello! I’m Dr. Reyes, the [[chief of care]]. You must be the visitor everyone is talking about.'},
    {who:'imani',mood:'happy',get text(){return hiredReferral()}},
    {who:'imani',mood:'think',text:'Would you like to try the job? A boy just twisted his ankle in our fun run. You could help with his case, and I’ll watch over your shoulder.',choices:[
      {t:'Yes, I’d love to!',good:true,mood:'happy',reply:'Wonderful. He’s at the first-aid tent. Byte can bring you the facts.'},
      {t:'What if I make a mistake?',good:true,mood:'smile',reply:'Then we’ll talk about it. That’s what practice is for. Come on, he’s at the first-aid tent.'}]}
  ],
  ari:[
    {who:'ari',mood:'worried',text:'Ow, ow. I stepped in a hole during the fun run, and my ankle went sideways.'},
    {who:'ari',mood:'sad',text:'I’m the [[goalkeeper]] for the Southie Stingrays. We have a game on Saturday!',choices:[
      {t:'Your ankle will heal. Let’s figure out a plan together.',good:true,mood:'worried',reply:'Okay. But can I still play?'},
      {t:'Forget about soccer for now. Your ankle comes first.',mood:'sad',reply:'But my team needs me...'}]},
    {who:'abena',mood:'think',text:'He loves that team. I just don’t want him to hurt it worse.'},
    {who:'abena',mood:'worried',text:'One more thing, Doctor. Ari always says “I’m fine,” even when it hurts. Last spring he played a whole game on a sore wrist and never told anyone.',clue:'hides'},
    {who:'ari',mood:'neutral',text:'I just don’t want to let my team down.',choices:[
      {t:'Your team would want to know if you’re hurt. Telling us helps them too.',good:true,mood:'think',reply:'Okay... I’ll try.'},
      {t:'Being tough is great! Goalkeepers have to be tough.',mood:'happy',reply:'Yeah! I’m super tough.'}]}
  ]
};

// Dr. Reyes has heard about the favors the player did at the open house (a referral)
const HIRED_FAVOR_NEWS={gabi:'Gabi says you carried the teddy bears',kofi:'Kofi says you helped Jupiter get unstuck',ruth:'Ruth says you found her glasses'};
function hiredReferral(F){F=F||(typeof S!=='undefined'&&S.m_hired&&S.m_hired.favor)||{};const f=['gabi','kofi','ruth'].filter(k=>F[k]).map(k=>HIRED_FAVOR_NEWS[k]);const n=f.length;
  if(n)return `${n>1?f.slice(0,-1).join(', ')+(n>2?',':'')+' and '+f.at(-1):f[0]}. People around here notice when someone is kind.`;
  return 'I hear you met some of the team. When you help people out, even in small ways, they remember it.'}
// every version of the referral line, so each can be recorded
function hiredLines(){const L=[];for(let b=0;b<8;b++)L.push({who:'imani',text:hiredReferral({gabi:b&1,kofi:b&2,ruth:b&4})});return L}

const HIRED_DOCS=[
  {id:'amemo',title:'Byte’s memo: Ari’s ankle',from:'Byte',kind:'memo',steps:[
    {t:'Ari rolled his right ankle and stretched a [[ligament]]. That is a mild [[sprain]].',viz:'ankle',cap:'Ari’s right ankle'},
    {t:'Most mild sprains heal in about 2 weeks. A [[brace]] or a [[walking boot]] protects the ankle while it heals.',viz:'braceBoot',cap:'Two ways to protect it'},
    {t:'If he plays on Saturday in a brace, about 1 in 10 kids roll it again. With only tape, about 2 in 10.',viz:'rerollBars',cap:'Rolling it again if he plays',
      alt:{t:'Because Ari hides pain, I updated: if he plays on Saturday, about 3 in 10 roll it again in a brace, and about 5 in 10 with tape.',viz:'rerollBars',args:{hidden:true},cap:'Updated: a kid who hides pain'}},
    {t:'A second sprain takes about 6 weeks to heal. That’s three times as long.',viz:'healWeeks',cap:'First sprain vs. second sprain'},
    {t:'My forecast assumes Ari stops playing when it hurts. Most kids do, but not all.',viz:'painCheck',cap:'The pain check',
      alt:{t:'Ari’s grandma says he hides pain, so the pain check may not work for him.',viz:'painHidden',cap:'A kid who says “I’m fine”'}}
  ]},
  {id:'coach',title:'Message from Coach Dana',from:'Coach Dana, Southie Stingrays',kind:'sheet',steps:[
    {t:'Hi, Doctor! Saturday is a friendly [[scrimmage]] against the Harbor Hawks.',viz:'scrimmage',cap:'Saturday’s game'},
    {t:'Our big [[playoff]] game is in three weeks, and Ari is our best [[goalkeeper]].',viz:'calendar3',cap:'Three weeks away'},
    {t:'Whatever you decide, Ari can sit on the bench with the team and cheer.',viz:'benchCheer',cap:'Still part of the team'}
  ]}
];
const HIRED_REVEAL={saturday:'I made three saves on Saturday! My ankle feels totally fine.',reroll:'Ow. It rolled again, and now I have to miss the playoffs...',
  cheer:'I cheered so loud on Saturday. And now I’m ready for the playoffs!',boot:'That boot was so boring. But my ankle is strong again!'};

MISSIONS.hired={id:'hired',title:'Getting Hired',career:'doctor',day:0,dayLabel:'Start',blurb:'See what the job is like, meet the team, try a practice case, and interview with Dr. Reyes.',after:[],
  kind:'journey',district:'boston',year:1,season:'spring',caseTitle:'Ari’s ankle · practice case',
  place:'Boston Harbor Hospital',debriefScene:'hospital',
  stages:[{key:'explore',at:'h-home'},{key:'meet',at:'h-openhouse'},{key:'practice',at:'h-reyes'},{key:'interview',at:'h-interview'},{key:'firstday',at:'h-firstday'}],
  flow:[{name:'h-home',k:'talk',talk:'home',scene:'home',place:'Home · Boston · 8:00 AM'},{name:'h-explore',k:'explore'},{name:'h-openhouse',k:'meet'},
    {name:'h-reyes',k:'talk',talk:'reyes',scene:'hospital',place:'Open House · Boston Harbor Hospital'},
    {name:'h-ari',k:'talk',talk:'ari',scene:'hospital',place:'First-aid tent · Open House',toast:'Practice case on your Workbench'},
    {name:'h-bench',k:'bench'},{name:'h-criteria',k:'criteria'},{name:'h-table',k:'table'},{name:'h-consent',k:'consent'},{name:'h-memo',k:'memo'},{name:'h-reveal',k:'reveal'},{name:'h-debrief',k:'debrief'},
    {name:'h-portfolio',k:'portfolio'},{name:'h-interview',k:'interview'},{name:'h-firstday',k:'firstday'}],
  get journey(){return HIRED_JOURNEY},
  glossary:HIRED_GLOSSARY,cast:HIRED_CAST,guide:HIRED_GUIDE,voices:{gabi:'af_sarah',kofi:'am_liam',ruth:'elder_woman',ari:'kid_boy',abena:'elder_woman'},
  get lines(){return hiredLines()},
  talks:HIRED_TALKS,docs:HIRED_DOCS,
  react:{amemo2:'Only 1 in 10... if the pain check works.',amemo4:'This is the sentence I’m least sure about.',coach1:'So Saturday matters less than the playoffs?'},
  tell:{clue:'hides',label:'Tell Byte that Ari hides his pain',note:'Thanks! I updated my forecast. If Ari plays on Saturday, he has about a 3 in 10 chance of rolling it again, even in a brace.',guide:'self-report',doc:'amemo'},
  criteria:[{id:'heal',label:'Healthy for the [[playoff]] game'},{id:'plays',label:'Plays in Saturday’s game'},{id:'comfy',label:'No heavy [[walking boot]]'}],
  criteriaHint:'Not sure what one means? Tap a word: <button class="gw" data-w="playoff">playoff</button>, <button class="gw" data-w="walking boot">walking boot</button>.',
  controls:[{key:'prot',label:'Protect the ankle',opts:[['brace','Brace'],['tape','Tape'],['boot','Walking boot']]},{key:'sat',label:'Saturday',opts:[['play','Play'],['sit','Sit out']]}],
  start:{prot:'tape',sat:'play'},
  planName(c){const p={brace:'Brace',tape:'Tape',boot:'Walking boot'}[c.prot];return c.prot==='boot'?p+', sit out Saturday':p+(c.sat==='play'?', play Saturday':', sit out Saturday')},
  outcomes(c,knows){const hide=!!knows,play=c.sat==='play'&&c.prot!=='boot',comfy=c.prot==='boot'?0:1;
    const r=play?(c.prot==='brace'?(hide?.3:.1):(hide?.5:.2)):({brace:.03,tape:.08,boot:.02}[c.prot]);
    if(play)return [{kind:'saturday',p:1-r,cap:'He played Saturday, and his ankle stayed fine!',flags:{heal:1,plays:1,comfy}},
      {kind:'reroll',p:r,cap:'He rolled it again Saturday and misses the playoffs.',flags:{heal:0,plays:1,comfy}}];
    return [{kind:c.prot==='boot'?'boot':'cheer',p:1-r,cap:c.prot==='boot'?'He healed in the boot and is ready for the playoffs!':'He cheered on Saturday and is ready for the playoffs!',flags:{heal:1,plays:0,comfy}},
      {kind:'reroll',p:r,cap:'He rolled it again at home and misses the playoffs.',flags:{heal:0,plays:0,comfy}}]},
  truth(){return true},knows(){return !!S.told},
  vignette(kind){return typeof HIRED_VIG!=='undefined'&&HIRED_VIG[kind]?HIRED_VIG[kind]():vignette(kind)},
  why(c){const o=this.outcomes(c,this.knows());const re=Math.round(100*o.filter(x=>x.kind==='reroll').reduce((a,x)=>a+x.p,0));
    const boot=c.prot==='boot'&&c.sat==='play'?'Nobody can play soccer in a walking boot, so this plan means sitting out. ':'';
    const play=c.sat==='play'&&c.prot!=='boot';
    return `${boot}<b>${this.planName(c)}:</b> about ${re} in 100 kids roll the ankle again. ${play?(S.told?'Because Ari hides pain, the “stop if it hurts” check may not work, so I raised the risk.':'That assumes he stops when it hurts.'):'Resting lets the ligament heal before the playoffs.'}`},
  whyGuide(c){return null},
  consent:{left:'abena',right:'ari',title:'Ari and his grandma',role:'Patient and grandparent',prompt:'So can I play on Saturday or not?',replyWho:'ari',heart:'ari',scene:'hospital',place:'First-aid tent · Open House',
    opts(c,M){const o=M.outcomes(c,M.knows());const re=Math.round(100*o.filter(x=>x.kind==='reroll').reduce((a,x)=>a+x.p,0));const play=c.sat==='play'&&c.prot!=='boot';
      const what=(c.prot==='boot'?'a walking boot for about two weeks':c.prot==='brace'?'a brace':'tape')+(play?' and playing on Saturday':', and sitting out on Saturday');
      const odds=re>=40?'about half the kids who do that roll it again':re>=25?'about 3 in 10 kids who do that roll it again':re>=15?'about 2 in 10 kids who do that roll it again':re>=8?'about 1 in 10 kids who do that roll it again':'very few kids roll it again';
      const gear=c.prot==='boot'?'a walking boot for about two weeks':c.prot==='brace'?'a brace':'tape';
      return [{t:play?`Yes, you can play on Saturday, Ari, with ${gear} on. But ${odds}, so you’d have to tell us the truth the moment it hurts. What do you two think?`:`Not this Saturday, Ari. I’d like you to rest it with ${gear}, so you’re strong for the playoffs in three weeks. ${re<=5?'Resting like that, very few kids hurt it again.':'Resting like that, only a few kids in 100 hurt it again.'} You can still sit with your team and cheer. What do you two think?`,good:true,mood:'think',
          reply:play?'I promise I’ll tell the truth if it hurts. Okay, let’s do it.':'I really wanted to play... but I want to be ready for the playoffs. Okay.'},
        {t:`Trust me, ${what} is the best plan for you. I’ve looked at all the numbers, so you two don’t need to worry about the details.`,good:false,mood:'worried',reply:'Um... okay. But what if it gets worse?'},
        {t:'You’ll definitely be fine, Ari. Kids your age heal really fast, so nothing can go wrong with this plan!',good:false,mood:'surprised',reply:'Definitely? The futures didn’t say that.'}]}},
  memo:{starters:['I recommend ','because ','The chance he rolls it again is about ','Ari cares about ','We will check by '],placeholder:'I recommend a brace and sitting out Saturday because…',
    plan:/brace|tape|boot|rest|sit|play|bench/,careLabel:'Includes what Ari cares about',care:/ari|he |his |him |soccer|game|saturday|playoff|goal|team|grandma/,signAs:'',topic:'Ari’s sprained ankle'},
  reveal:{days(c){return c.sat==='play'&&c.prot!=='boot'?4:21},who:'ari',lines:HIRED_REVEAL,mood(k){return k==='reroll'?'sad':'happy'}},
  trap(c){const play=c.sat==='play'&&c.prot!=='boot';return {ok:S.told||!play,text:S.told?'You told '+S.byte.name+' that Ari hides pain, so the forecast was accurate.':!play?'You chose rest. Did you notice why playing was riskier for Ari? His grandma said he hides pain.':'You didn’t tell '+S.byte.name+' that Ari hides pain. Playing looked safer than it really was for him.'}},
  byteGood:'Nice work! You listened to Ari and his grandma, and you showed your work.',
  brief(){return hiredBrief()},
  canned(q){return hiredCanned(q)}
};

function hiredBrief(){const st=S.step||'';
  const base='Right now the player is on the Care Doctor career journey, "Getting Hired", before their first workday. Steps: explore the job, meet people at Boston Harbor Hospital\'s open house (Nurse Gabi Santos, the charge nurse; Kofi Asante, the robot crew lead; Ruth Abrams, an 88-year-old volunteer), do a supervised practice case, save it to a Portfolio Book, interview with Dr. Imani Reyes (Chief of Care), then a first day with the team.';
  const ari=`Practice case: Ari Mensah, 10, a soccer goalkeeper for the Southie Stingrays, has a mild right ankle sprain from the open house fun run. Saturday (4 days away) is a friendly scrimmage; the playoffs are in 3 weeks. Most mild sprains heal in about 2 weeks; a second sprain takes about 6 weeks. If he plays Saturday: about 1 in 10 kids roll it again in a brace and 2 in 10 with only tape, assuming they stop when it hurts. If he sits out: about 3 in 100 (brace), 8 in 100 (tape), 2 in 100 (walking boot). ${S.told?'The player told you Ari hides pain (his grandma said so), so you now estimate 3 in 10 (brace) and 5 in 10 (tape) if he plays.':'You do not know whether Ari reports pain honestly; his grandma may know.'} Do not pick for the player; ask what matters most (Saturday or the playoffs) first.`;
  const iv='The interview: Dr. Reyes will ask about a hard choice they made, what they would do if their AI and a patient disagreed, and what they still need to learn, then invite a question. Good answers are specific real stories (like the practice case) and honest; asking a good question back is a plus. Help them prepare but do not write their answers for them.';
  if(/h-(bench|criteria|table|consent|memo|reveal|debrief|ari)/.test(st))return base+'\n'+ari;
  if(/h-(portfolio|interview)/.test(st))return base+'\n'+iv;
  return base}
function hiredCanned(q){
  if(/beat|win|how do i|what do i do|stuck|help/.test(q)){
    if(/h-(bench|criteria|table|consent|memo)/.test(S.step))return 'Read my memo and the coach’s message, tell me anything I’m missing about Ari, pick what matters most, test plans on the Future Table, explain honestly to Ari and his grandma, then write your decision and sign it!';
    if(S.step==='h-interview')return 'Tell real stories with details: what you chose, why, and how it turned out. Be honest, even about mistakes. And ask Dr. Reyes a good question at the end!';
    return 'Explore the job, meet people at the open house, help them out, and remember one thing about each person. Then try the practice case!'}
  if(/hide|pain|i'?m fine|tough/.test(q)){if(!S.told&&S.notes&&S.notes.hides){S.told=true;save();return 'Woof, that matters a lot! If Ari hides pain, “stop if it hurts” won’t protect him. If he plays Saturday, I now forecast about 3 in 10 roll it again, even in a brace.'}return 'Some kids say “I’m fine” even when it hurts. If that’s Ari, playing on Saturday is riskier than my first forecast.'}
  if(/brace/.test(q))return 'A brace is a lace-up support that stops the ankle from rolling. If Ari plays in one, about 1 in 10 kids roll it again, as long as they stop when it hurts.';
  if(/tape/.test(q))return 'Tape helps a little, but it loosens during a game. About 2 in 10 kids who play with only tape roll it again.';
  if(/boot/.test(q))return 'A walking boot keeps the ankle very still, so it heals safely, but it’s heavy and he can’t play soccer in it.';
  if(/sprain|ligament|ankle/.test(q))return 'A sprain is a stretched or torn ligament, the stretchy band that holds bones together. A mild one heals in about 2 weeks. A second sprain takes about 6.';
  if(/saturday|playoff|scrimmage/.test(q))return 'Saturday is just a friendly scrimmage. The playoffs are in 3 weeks, and Ari is their best goalkeeper. So what matters more to Ari and his grandma?';
  if(/best|which|pick|choose|should|recommend/.test(q))return 'I can’t pick for you, but here’s the big question: what matters more to Ari, Saturday’s friendly game or being healthy for the playoffs?';
  if(/interview|reyes/.test(q))return 'Dr. Reyes likes real stories with details and honest answers. Your Portfolio Book is full of real stories! You can practice with me first.';
  if(/gabi|cat|bandage/.test(q))return 'Gabi is the charge nurse on the kids’ floor. Her cat is named Bandage, because he sleeps on the first-aid box!';
  if(/kofi|robot|jupiter|planet/.test(q))return 'Kofi leads the robot crew. He names every robot after a planet. The big one is Jupiter.';
  if(/ruth|piano|glasses/.test(q))return 'Ruth has volunteered here for twenty years. She plays “Fly Me to the Moon” on the lobby piano on Fridays.';
  if(/portfolio/.test(q))return 'Your Portfolio Book holds your signed decisions: what you chose, why, how sure you were, and what happened. Employers in 2040 love seeing real work.';
  if(/who are you|what are you/.test(q))return `I’m ${S.byte.name}, your AI partner! I read everything, run forecasts, and build Future Tables. You bring what matters to people and make the call.`;
  return null}

// ---------- the journey screens' content (src/career.js reads it) ----------
// Every spoken line is a {who, text} object, so missionLines() finds it for recording.
function hiredStory(){const p=(typeof S!=='undefined'&&S.m_hired&&S.m_hired.page)||null;
  if(!p||!p.choice||!p.choice.prot)return {story:'At the open house I helped a boy with a sprained ankle decide between playing and resting. I explained the odds to him and his grandma.',bad:false,told:false};
  const c=p.choice,play=c.sat==='play'&&c.prot!=='boot';const what=c.prot==='boot'?'a walking boot':c.prot==='brace'?'a brace':'tape';
  const why=p.told?'because his grandma told me he hides pain':play?'because Saturday mattered a lot to him':'because the playoffs mattered more than a friendly game';
  const out={saturday:'He played, and his ankle was fine.',reroll:'He rolled it again, so next time I’d ask more about his pain.',cheer:'He cheered from the bench and was ready for the playoffs.',boot:'He healed in the boot and was ready for the playoffs.'}[p.kind]||'';
  return {story:`At the open house I helped Ari, a goalkeeper with a sprained ankle. I chose ${what}${c.prot==='boot'?'':play?' and playing on Saturday':' and sitting out on Saturday'}, ${why}. ${out}`.trim(),bad:p.kind==='reroll',told:!!p.told}}
const HJ_GLASSES_SVG='<svg viewBox="0 0 54 30"><circle cx="13" cy="16" r="10" fill="rgba(200,230,255,.55)" stroke="#e5484d" stroke-width="3.5"/><circle cx="41" cy="16" r="10" fill="rgba(200,230,255,.55)" stroke="#e5484d" stroke-width="3.5"/><path d="M23 14 q4 -4 8 0" stroke="#e5484d" stroke-width="3" fill="none"/><path d="M3 12 L0 6 M51 12 L54 6" stroke="#e5484d" stroke-width="3" stroke-linecap="round"/><path d="M8 11 l4 -2" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>';
const B_=t=>({who:'byte',text:t}),I_=t=>({who:'imani',text:t});
const HIRED_JOURNEY={
  explore:{place:'A day as a Care Doctor',scene:'hospital',need:2,guide:'good-questions',go:'Go to the open house',
    panel:i=>typeof DITL_PANELS!=='undefined'&&DITL_PANELS[i]?DITL_PANELS[i]():'<svg viewBox="0 0 320 200"><rect width="320" height="200" fill="#eef1fb"/></svg>',
    caps:[B_('7:50 AM. I tell you what Halo did overnight.'),B_('9:00 AM. You listen to a family and learn what matters to them.'),B_('11:00 AM. We test plans on the Future Table.'),
      B_('2:00 PM. You explain the choice, the family decides, and you sign.'),B_('5:00 PM. A follow-up call. Your patient is doing great!')],
    qs:[{q:'What does Halo do, and what do I do?',a:B_('Halo runs the hospital’s chores: scans, schedules, and medicine deliveries. I read the research and write forecasts. You talk with patients, find out what matters to them, and sign the decision.')},
      {q:'Why do people still want a human doctor?',a:B_('Because it’s their body and their life. People want someone who listens, explains the odds honestly, and is responsible for the choice. In 2040, the law says a person must sign.')},
      {q:'What’s the hardest part of the job?',a:B_('Hard choices. Sometimes every option has a downside, and the family is scared. A good Care Doctor stays calm, kind, and honest.')},
      {q:'Do doctors still need to know science?',a:B_('Yes! You don’t have to memorize everything, because I can look it up in a blink. But you need to understand enough to ask good questions and notice when something doesn’t make sense.')},
      {q:'How do I get hired?',a:B_('Meet the people who work there, show your work in a Portfolio Book, and do well in an interview with Dr. Reyes. The open house is today!')}]},
  meet:{place:'Open House · Boston Harbor Hospital',scene:['openhouse','hospital'],people:['gabi','kofi','ruth'],guide:'referrals',go:'Find Dr. Reyes',
    notes:{gabi:'gabi-cat',kofi:'kofi-planets',ruth:'ruth-song'},
    hint:'Say hi to everyone. Try to remember one thing about each person.',done:'You met everyone! Let’s find Dr. Reyes.',doneHelpful:'Everyone’s talking about how helpful you were. Let’s find Dr. Reyes!',
    again:{gabi:{who:'gabi',text:'Thanks again for stopping by! I’ll tell Bandage you said hi.'},kofi:{who:'kofi',text:'Jupiter says beep. That means thank you.'},ruth:{who:'ruth',text:'Have you seen my glasses anywhere? They have red frames.'}},
    thanks:{ruth:{who:'ruth',text:'My glasses! I can read the menu again. Thank you, dear.'}},
    find:{who:'ruth',at:[70,34],label:'Red reading glasses',art:HJ_GLASSES_SVG,toast:'You found Ruth’s glasses!',hint:'Ruth’s glasses have red frames. Can you spot them?'}},
  portfolio:{scene:'night',place:'Home · Boston · 8:30 PM',ask:'This is real work you did. Want to save it?',saved:'Saved! Tomorrow, Dr. Reyes will want to hear about it.',go:'Get ready for the interview'},
  interview:{boss:'imani',home:{scene:'home',place:'Home · Boston · 8:00 AM'},office:{scene:'hospital',place:'Dr. Reyes’s office · Boston Harbor Hospital'},
    context:hiredStory,guide:'specific-stories',badge:{org:'Boston Harbor Hospital',title:'Care Doctor'},after:'Your first day is tomorrow. You’ll meet the team.',go:'Start my first day',
    judge:'You are Dr. Imani Reyes, Chief of Care at Boston Harbor Hospital in a kids’ game set in 2040, interviewing a young player for a Care Doctor job.',
    ask:B_('Today’s your [[interview]] with Dr. Reyes! Want to [[rehearse]] with me first?'),ready:B_('You’re ready! Remember: real stories, honest answers, and one good question.'),
    intro:I_('Thanks for coming in, {P}. I read your [[portfolio]]. Let’s talk.'),
    best:I_('That was a wonderful interview. You told me real stories, you were honest, and you asked a great question. Welcome to Boston Harbor Hospital. You’re hired!'),
    ok:I_('I can tell you care about people, and that matters most. You’re hired! Keep telling real stories, like the ones in your Portfolio Book.'),
    free:{reply:[I_('Thank you. That’s a thoughtful answer.'),I_('Can you tell me a bit more? A specific example helps me understand.')],tip:[B_('Nice! That answer was clear and real.'),B_('Try adding a real example, with what you did and why.')]},
    questions:[
      {q:I_('Tell me about a hard choice you made.'),rq:B_('Dr. Reyes might ask: “Tell me about a hard choice you made.”'),
       check:'a specific real story with what they chose and why, told honestly',heur:/\d|because|so that|ari|grandma|ankle|i chose|i picked|i decided|i helped/,
       opts:[{t:x=>x.story,good:true,reply:[{if:'bad',who:'imani',text:'That’s a real story: what you chose, why, and what happened. And thank you for being honest that it didn’t go well. That takes courage.'},I_('That’s a real story: what you chose, why, and what happened.')],
           tip:B_('Great answer! You said what you chose, why, and what happened. Say it just like that.')},
         {t:'I make hard choices all the time. At school I pick the hardest projects, and my friends always ask me for advice.',reply:I_('Hmm. Can you give me a real example? A story tells me more than “I’m good at it.”'),tip:B_('Try a real example instead, like Ari’s ankle. Details make a story believable.')},
         {t:x=>x.bad?'I helped a goalkeeper named Ari with a sprained ankle at the open house, and everything went perfectly from start to finish.':'I helped a goalkeeper named Ari with a sprained ankle at the open house. It went great, and everyone said I’m a natural.',
           reply:[{if:'bad',who:'imani',text:'Your Portfolio Book says his ankle rolled again. I’d rather hear what really happened. We all learn from our mistakes here.'},I_('It did go well! But tell me why you chose that plan. I want to hear how you decided, not just how it turned out.')],
           tip:[{if:'bad',who:'byte',text:'Hmm, that’s not quite what happened. Honest stories, even about mistakes, impress people more.'},B_('Add your reason! Say why you chose it, not only that it worked.')]}]},
      {q:I_('What would you do if your AI and a patient disagreed?'),rq:B_('She might ask: “What would you do if your AI and a patient disagreed?”'),
       check:'listens to both the AI and the patient, explains tradeoffs, and lets the patient decide',heur:/listen|ask|both|explain|why|tradeoff|decide/,
       opts:[{t:'I’d ask each of them why. Each one may know something the other doesn’t. Then I’d explain the tradeoffs, and the patient decides.',good:true,
           reply:[{if:'told',who:'imani',text:'Exactly. Ari’s grandma knew something no AI could have known: that he hides pain.'},I_('Exactly. Patients often know things about themselves that no AI could know.')],
           tip:[{if:'told',who:'byte',text:'Perfect. You could even add an example, like Ari’s grandma telling you he hides pain!'},B_('Perfect. If you have an example, add it!')]},
         {t:'The AI has read every medical study ever written, so I’d gently help the patient understand why the AI’s plan is the right one.',reply:I_('Our AIs are brilliant, but they only know what they’re told. And it’s the patient’s body.'),tip:B_('Careful! I know a lot, but I don’t know everything people know. Say how you’d listen to both.')},
         {t:'It’s the patient’s body, so I’d do exactly what they want right away, even if the AI warns that it could be dangerous.',reply:I_('Listening matters, but so do the facts. Your job is to help the patient understand the risks before they decide.'),tip:B_('Patients decide, but they need the facts first. Say how you’d explain the tradeoffs.')}]},
      {q:I_('What’s something you still need to learn?'),rq:B_('And maybe: “What’s something you still need to learn?”'),
       check:'honestly names one real thing they are still learning',heur:/learn|practic|better|still|not good|hard for me|working on|need to/,
       opts:[{t:'Explaining odds so kids understand them. I practiced with Ari, and I want to get better at it.',good:true,reply:I_('That’s honest and specific. It’s a great thing to work on, and we’ll help you.'),tip:B_('That was honest and specific. Managers love hearing answers like that!')},
         {t:'I’m already good at most things, so mostly I’d just learn the hospital’s computer system and where everything is.',reply:I_('Everyone has something to learn, even me. I’d like to hear what yours is.'),tip:B_('Nobody is great at everything, and Dr. Reyes knows that. Name one real thing you’re working on.')},
         {t:'I’m not sure yet. I’d let my AI figure out what I need to learn, and then I’d do whatever lessons it gives me.',reply:I_('Your AI can help you study, but you know best what feels hard for you. I’d like to hear what that is.'),tip:B_('I can help you study, but you know best what’s hard for you. Try naming one real thing, like explaining odds.')}]},
      {q:I_('Do you have a question for me?'),rq:B_('At the end she’ll ask: “Do you have a question for me?”'),
       opts:[{t:'What’s the hardest part of your job?',good:true,reply:I_('Telling a family that every choice has a downside. It never gets easy, but I get better at explaining it.'),tip:B_('Great question! It shows you really want to understand the job.')},
         {t:'What does a great new doctor do in the first month?',good:true,reply:I_('Asks lots of questions. The best new doctors ask for help early.'),tip:B_('Great question! It shows you want to do well.')},
         {t:'No, I think I’m all set. I read the hospital’s website, and my AI already told me everything about the job.',reply:I_('Okay! Next time, try asking one. It shows you’re curious.'),tip:B_('Try asking one! A good question shows you’re curious.')}]}]},
  firstday:{scene:'hospital',place:'Kids’ floor · Boston Harbor Hospital · 8:30 AM',go:'Open my world map',
    intro:I_('Welcome to your first day, Doctor {P}! You start as a [[trainee]]. Let me introduce the team.'),
    thanks:{ruth:{who:'ruth',text:'Thank you again for finding my glasses, dear. I can read the sheet music now!'}},
    team:[{ask:{who:'gabi',text:'Welcome back! Sorry, I’m a little sleepy. Someone at home knocked the whole first-aid box off the shelf at 3 a.m. and then fell asleep inside it...'},
        opts:['Was it Bandage?','Did your dog do that?','Was it a robot?'],
        right:{who:'gabi',text:'Of course it was Bandage! You remembered. He thinks that box is his bed. Welcome to the kids’ floor.'},
        wrong:{who:'gabi',text:'Ha! It was my cat, Bandage. He thinks the first-aid box is his bed. Welcome to the team.'}},
      {ask:{who:'kofi',text:'Hey, it’s you! Careful, the big one’s backing up. Every new robot gets a name, and this little one just came in, so I’m calling her... hmm...'},
        opts:['Let me guess: Saturn?','How about Sparky?','Is she named after a dinosaur?'],
        right:{who:'kofi',text:'Saturn! You remembered my planets. Jupiter says hi. Beep boop.'},
        wrong:{who:'kofi',text:'Close! I name them all after planets, remember? She’s Saturn. Jupiter says hi.'}},
      {ask:{who:'ruth',text:'Hello again, dear. I’m practicing for Friday. You know the one I always play: da-da da-da-da, da-da...'},
        opts:['Fly Me to the Moon!','Is it Happy Birthday?','Twinkle, Twinkle?'],
        right:{who:'ruth',text:'That’s the one! You listened. Come and hear it this Friday.'},
        wrong:{who:'ruth',text:'Oh, close! It’s “Fly Me to the Moon.” Come and hear it this Friday!'}}],
    rule:I_('At Harbor we have one [[house rule]]: ask early, ask anyone. If you’re stuck, or something feels off, say so, even to me.'),
    test:{prompt:B_('Ping! Halo says your first patient is in Room 4B tomorrow at nine. Um... where is Room 4B?'),
      opts:[{t:'Ask Gabi where Room 4B is',heart:'gabi'},{t:'Wander around until I find it',then:B_('That could take a while... Remember the house rule? Let’s ask Gabi.')}],
      after:{who:'gabi',text:'Third floor, past the fish tank. Thanks for asking! That’s exactly what the house rule is for.'}},
    end:{scene:'night',place:'Home · Boston · 9:00 PM',text:H=>`You remembered ${H.remembered??0} of 3 teammates, and you learned the house rule. Tomorrow is your first shift with a real patient. Get some sleep, Doctor!`}}
};
