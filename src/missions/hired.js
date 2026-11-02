// hired.js — "Getting Hired": the Care Doctor career journey that leads into Day 1 (spec: Core loop → Career journey, steps 1 to 5).
// Explore a day in the life, meet people at the hospital open house, do a practice case (Ari's ankle) that is saved to the
// Portfolio Book, interview with Dr. Reyes (optional rehearsal with Byte), and the first day with the team. The custom
// screens live in hired_screens.js; the practice case reuses the engine's generic mission screens.

Object.assign(GLOSSARY,{
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
});

Object.assign(CAST,{
  bea:{name:'Bea Santos',role:'Charge nurse',skin:SKIN[2],hair:'#3a2418',hairStyle:'bun',shirt:'#5b9bf0'},
  kofi:{name:'Kofi Asante',role:'Robot crew lead',skin:SKIN[5],hair:'#141010',hairStyle:'buzz',shirt:'#ff9f43',masc:true},
  ruth:{name:'Ruth Abrams',role:'Volunteer, age 88',skin:SKIN[0],hair:'#e9e6f0',hairStyle:'elder',shirt:'#b07ce8',glasses:true},
  ari:{name:'Ari Mensah',role:'Patient, age 10',skin:SKIN[4],hair:'#161010',hairStyle:'short',shirt:'#2fbf71',age:'kid',masc:true},
  abena:{name:'Abena Mensah',role:'Ari’s grandma',skin:SKIN[4],hair:'#d8d4dc',hairStyle:'elder',shirt:'#e85d75',glasses:true}
});

Object.assign(FIELD_GUIDE,{
  'good-questions':{title:'Asking good questions',track:'People skills',text:'A good question is specific and open. “What’s the hardest part of your job?” teaches you more than “Is it fun?” Asking about a career before you choose it is how you find one that fits.',real:'True today: career counselors suggest informational interviews, short talks where you ask someone about their job.'},
  'referrals':{title:'Trust and referrals',track:'People skills',text:'When lots of people can do a job, people pick someone they already trust. Being kind and helpful, even when nobody is grading you, is how people come to trust you.',real:'True today: many jobs are filled through referrals, where someone who works there recommends a person they know.'},
  'self-report':{title:'What people say vs. how they feel',track:'Evidence and truth',text:'Some people say “I’m fine” when they are hurting, so a plan that depends on what someone says can fail. Ari hides pain, so “stop if it hurts” was not a safe plan for him.',real:'True today: athletes sometimes hide concussion symptoms to keep playing, so many sports leagues use sideline checks that don’t depend only on what the player says.'},
  'specific-stories':{title:'Show your work',track:'People skills',text:'A real story with details (what you decided, why, and how it turned out) shows more than saying “I’m good at decisions.” Honest stories about mistakes count too.',real:'True today: many interviewers ask “Tell me about a time when…” questions, and people prepare by writing down real examples of their work.'}
});

const HIRED_TALKS={
  home:[
    {who:'byte',mood:'happy',text:'Good morning, {P}! Guess what? Boston Harbor Hospital is looking for a new Care Doctor.'},
    {who:'byte',mood:'neutral',text:'Today is their [[open house]]. Anyone can visit, meet the people who work there, and try a practice case.'},
    {who:'byte',mood:'happy',text:'Want to see what a Care Doctor’s day looks like first?',choices:[
      {t:'Yes, show me!',reply:'Woof! Here’s a whole day, squeezed into thirty seconds.'},
      {t:'What does a Care Doctor do?',reply:'A Care Doctor helps patients and families choose a treatment. I bring the facts and the forecasts. You bring the listening, the judgment, and the signature.'}]}
  ],
  bea:[
    {who:'bea',mood:'smile',text:'Hi there! Welcome to the [[open house]]. I’m Bea, the [[charge nurse]] on the kids’ floor.',choices:[
      {t:'Hi Bea, I’m {P}. What does a charge nurse do?',good:true,mood:'happy',reply:'I make sure every kid on our floor gets what they need, and every nurse has a buddy. Halo handles the schedules. I handle the people.'},
      {t:'Can you get me a job here?',mood:'think',reply:'Ha! Let’s start with hello. I’m Bea, and it’s nice to meet you.'}]},
    {who:'bea',mood:'happy',text:'My cat is named Bandage, because he sleeps on the first-aid box.',clue:'bea-cat'},
    {who:'bea',mood:'worried',text:'Oh no. I promised the kids’ floor this box of teddy bears, and the elevator robot is busy.',choices:[
      hiredFavor('bea',{t:'I can carry it for you!',mood:'happy',reply:'You’re a star. The kids are going to love them.'}),
      {t:'Maybe a robot can take it later.',mood:'sad',reply:'Maybe. They were hoping for them today, though.'}]}
  ],
  kofi:[
    {who:'kofi',mood:'smile',text:'Hey! Mind the robots. I’m Kofi. I lead the robot crew that carries supplies around the hospital.',choices:[
      {t:'What’s the hardest part of your job?',good:true,mood:'think',reply:'Deciding what each robot is NOT allowed to do. A robot that delivers lunch doesn’t need a key to the medicine room.'},
      {t:'Are robots smarter than you?',mood:'happy',reply:'At carrying boxes in the dark? Totally. At knowing which boxes matter? That’s my job.'}]},
    {who:'kofi',mood:'happy',text:'I name every robot after a planet. That big one is Jupiter.',clue:'kofi-planets'},
    {who:'kofi',mood:'worried',text:'Uh oh. Jupiter keeps beeping at that wet-floor sign. It thinks the sign is a person! Could you move the sign while I fix its settings?',choices:[
      hiredFavor('kofi',{t:'Sure, I’ll move it!',mood:'happy',reply:'Thanks! Look, Jupiter is rolling again.'}),
      {t:'Can’t the robot figure it out?',mood:'neutral',reply:'Not today, apparently. I’ll do it myself.'}]}
  ],
  ruth:[
    {who:'ruth',mood:'smile',text:'Hello, dear. I’m Ruth. I’ve been a [[volunteer]] here every Tuesday for twenty years.',choices:[
      {t:'Hi Ruth, I’m {P}. Why do you volunteer?',good:true,mood:'happy',reply:'This hospital fixed my hip when I was eighty. Now I walk three miles a day, and I like to say thank you.'},
      {t:'Twenty years? Wow, that’s old!',mood:'think',reply:'Ha! Old and proud of it, dear.'}]},
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
      {t:'Forget about soccer for now.',mood:'sad',reply:'But my team needs me...'}]},
    {who:'abena',mood:'think',text:'He loves that team. I just don’t want him to hurt it worse.'},
    {who:'abena',mood:'worried',text:'One more thing, Doctor. Ari always says “I’m fine,” even when it hurts. Last spring he played a whole game on a sore wrist and never told anyone.',clue:'hides'},
    {who:'ari',mood:'neutral',text:'I just don’t want to let my team down.',choices:[
      {t:'Telling the truth about pain never lets anyone down.',good:true,mood:'think',reply:'Okay... I’ll try.'},
      {t:'Being tough is great!',mood:'happy',reply:'Yeah! I’m super tough.'}]}
  ]
};

function hiredReferral(){const f=hiredFavors();const n=f.length;
  if(n)return `${n>1?f.slice(0,-1).join(', ')+(n>2?',':'')+' and '+f.at(-1):f[0]}. People here notice kindness.`;
  return 'I hear you met some of the team. Helping people, even in small ways, is how they come to trust you.'}
function hiredFavors(){const F=(S.hj||{}).favor||{};return [F.bea&&'Bea says you carried the teddy bears',F.kofi&&'Kofi says you helped Jupiter get unstuck',F.ruth&&'Ruth says you found her glasses'].filter(Boolean)}
// a favor choice records itself when the engine's talk screen reads .good on tap
function hiredFavor(who,c){return Object.defineProperty(c,'good',{enumerable:true,get(){S.hj=S.hj||{};S.hj.favor=S.hj.favor||{};S.hj.favor[who]=true;save();return true}})}

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

MISSIONS.hired={id:'hired',title:'Getting Hired',career:'doctor',day:0,dayLabel:'Start',blurb:'Explore the job, meet the team, practice, and interview with Dr. Reyes.',after:[],
  place:'Boston Harbor Hospital',debriefScene:'hospital',
  flow:[{name:'h-home',k:'talk',talk:'home',scene:'home',place:'Home · Boston · 8:00 AM'},{name:'h-explore',k:'custom'},{name:'h-openhouse',k:'custom'},
    {name:'h-reyes',k:'talk',talk:'reyes',scene:'hospital',place:'Open House · Boston Harbor Hospital'},
    {name:'h-ari',k:'talk',talk:'ari',scene:'hospital',place:'First-aid tent · Open House',toast:'Practice case on your Workbench'},
    {name:'h-bench',k:'bench'},{name:'h-criteria',k:'criteria'},{name:'h-table',k:'table'},{name:'h-consent',k:'consent'},{name:'h-memo',k:'memo'},{name:'h-reveal',k:'reveal'},{name:'h-debrief',k:'debrief'},
    {name:'h-portfolio',k:'custom'},{name:'h-interview',k:'custom'},{name:'h-firstday',k:'custom'}],
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
    if(play)return [{kind:'saturday',p:1-r,cap:'Played Saturday, and the ankle stayed fine!',flags:{heal:1,plays:1,comfy}},
      {kind:'reroll',p:r,cap:'Rolled it again Saturday. Misses the playoffs.',flags:{heal:0,plays:1,comfy}}];
    return [{kind:c.prot==='boot'?'boot':'cheer',p:1-r,cap:c.prot==='boot'?'Healed in the boot. Ready for the playoffs!':'Cheered on Saturday. Ready for the playoffs!',flags:{heal:1,plays:0,comfy}},
      {kind:'reroll',p:r,cap:'Rolled it again at home. Misses the playoffs.',flags:{heal:0,plays:0,comfy}}]},
  truth(){return true},knows(){return !!S.told},
  vignette(kind){return window.HIRED_VIG&&HIRED_VIG[kind]?HIRED_VIG[kind]():vignette(kind)},
  why(c){const o=this.outcomes(c,this.knows());const re=Math.round(100*o.filter(x=>x.kind==='reroll').reduce((a,x)=>a+x.p,0));
    const boot=c.prot==='boot'&&c.sat==='play'?'Nobody can play soccer in a walking boot, so this plan means sitting out. ':'';
    const play=c.sat==='play'&&c.prot!=='boot';
    return `${boot}<b>${this.planName(c)}:</b> about ${re} in 100 kids roll the ankle again. ${play?(S.told?'Because Ari hides pain, the “stop if it hurts” check may not work, so I raised the risk.':'That assumes he stops when it hurts.'):'Resting lets the ligament heal before the playoffs.'}`},
  whyGuide(c){return null},
  consent:{left:'abena',right:'ari',title:'Ari and his grandma',role:'Patient and grandparent',prompt:'So can I play on Saturday or not?',replyWho:'ari',heart:'ari',scene:'hospital',place:'First-aid tent · Open House',
    opts(c,M){const o=M.outcomes(c,M.knows());const re=Math.round(100*o.filter(x=>x.kind==='reroll').reduce((a,x)=>a+x.p,0));const play=c.sat==='play'&&c.prot!=='boot';
      const what=(c.prot==='boot'?'a walking boot for about two weeks':c.prot==='brace'?'a brace':'tape')+(play?' and playing on Saturday':', and sitting out on Saturday');
      return [{t:`I suggest ${what}. About ${re} out of 100 kids would roll it again${play?', so you’d have to tell us the truth if it hurts':''}. ${play?'':'You can still sit with your team and cheer. '}What do you two think?`,good:true,mood:'think',
          reply:play?'I promise I’ll tell the truth if it hurts. Okay, let’s do it.':'I really wanted to play... but I want to be ready for the playoffs. Okay.'},
        {t:`Trust me, ${what} is the best. Don’t worry about the details.`,good:false,mood:'worried',reply:'Um... okay. But what if it gets worse?'},
        {t:'You’ll definitely be fine. Nothing can go wrong!',good:false,mood:'surprised',reply:'Definitely? The futures didn’t say that.'}]}},
  memo:{starters:['I recommend ','because ','The chance he rolls it again is about ','Ari cares about ','We will check by '],placeholder:'I recommend a brace and sitting out Saturday because…',
    plan:/brace|tape|boot|rest|sit|play|bench/,careLabel:'Includes what Ari cares about',care:/ari|he |his |him |soccer|game|saturday|playoff|goal|team|grandma/,signAs:'',topic:'Ari’s sprained ankle'},
  reveal:{days(c){return c.sat==='play'&&c.prot!=='boot'?4:21},who:'ari',lines:HIRED_REVEAL,mood(k){return k==='reroll'?'sad':'happy'}},
  trap(c){const play=c.sat==='play'&&c.prot!=='boot';return {ok:S.told||!play,text:S.told?'You told '+S.byte.name+' that Ari hides pain, so the forecast was accurate.':!play?'You chose rest. Did you notice why playing was riskier for Ari? His grandma said he hides pain.':'You didn’t tell '+S.byte.name+' that Ari hides pain. Playing looked safer than it really was for him.'}},
  byteGood:'Nice work! You listened to Ari and his grandma, and you showed your work.',
  brief(){return hiredBrief()},
  canned(q){return hiredCanned(q)}
};

function hiredBrief(){const st=S.step||'';
  const base='Right now the player is on the Care Doctor career journey, "Getting Hired", before their first workday. Steps: explore the job, meet people at Boston Harbor Hospital\'s open house (Nurse Bea Santos, the charge nurse; Kofi Asante, the robot crew lead; Ruth Abrams, an 88-year-old volunteer), do a supervised practice case, save it to a Portfolio Book, interview with Dr. Imani Reyes (Chief of Care), then a first day with the team.';
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
  if(/bea|cat|bandage/.test(q))return 'Bea is the charge nurse on the kids’ floor. Her cat is named Bandage, because he sleeps on the first-aid box!';
  if(/kofi|robot|jupiter|planet/.test(q))return 'Kofi leads the robot crew. He names every robot after a planet. The big one is Jupiter.';
  if(/ruth|piano|glasses/.test(q))return 'Ruth has volunteered here for twenty years. She plays “Fly Me to the Moon” on the lobby piano on Fridays.';
  if(/portfolio/.test(q))return 'Your Portfolio Book holds your signed decisions: what you chose, why, how sure you were, and what happened. Employers in 2040 love seeing real work.';
  if(/who are you|what are you/.test(q))return `I’m ${S.byte.name}, your AI partner! I read everything, run forecasts, and build Future Tables. You bring what matters to people and make the call.`;
  return null}
