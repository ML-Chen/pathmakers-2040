// bea.js — Elder Companion, Day 1: "Dancing at 104" (Boston, South End).
// Bea Hollis, 104, a retired dancer and nurse, wants to dance at her great-grandson Jordan's wedding in 13 weeks.
// A muscle-and-bone renewal therapy exists, but only 31 people over 100 have tried it. Her granddaughter Grace is
// worried; Jordan wants the full dose now. Tempo, the therapy's dosing AI, runs her plan through Wren, her home robot,
// and by default changes her plan on its own. The player interviews for the job, mediates a family meeting with
// listening moves, writes Tempo's rule sheet (what it may do alone, what needs Bea's yes, what only Bea decides),
// and keeps the choice Bea's. The hidden clue, heard only by asking an open question, is what Bea actually wants:
// one 3-minute waltz on her own feet, not a night of dancing and not a longer life.
// Pictures: src/viz/bea.js (infographics, vignettes) and src/viz/bea_cast.js (portraits, full-body figures).
// Scenes: src/scenes/bea_parlor.js (her brownstone parlor) and src/scenes/dance_hall.js (the Tremont Street dance hall,
// where the Elder Companion program meets; both are built to be reused by later Companion days). Styles: src/css/bea.css.

CAREERS.companion=Object.assign(CAREERS.companion||{},{name:'Elder Companion',place:'Boston',district:'boston',
  why:'People want a person, not a machine, to keep them company, listen to them, and make sure their own choices are heard.'});

(function(){
// ---------- the outcome model (every number in the documents comes from here) ----------
// dose: none | gentle | full. auto: 'auto' (Tempo changes her plan on its own) | 'ask' (Bea says yes to each change).
// practice: weekly waltz practice with Jordan at the dance hall. knows: the player told Byte Bea's real goal.
const FLUTTER={none:0,gentle:.05,full:.15};        // trial, people over 100 (31 people, so wide error bars)
const QUIT={auto:.15,ask:.03};                     // Tempo's records: plan changed without asking vs with a yes
const FALL={no:.05,yes:.03};                       // 13 weeks of training with Wren nearby
const READY={waltz:{none:[.40,.60],gentle:[.72,.88],full:[.85,.93]},   // strong enough for one 3-minute waltz
             hour:{none:[.05,.08],gentle:[.30,.38],full:[.65,.72]}};   // strong enough for an hour of dancing
const AUTO_BONUS=.04;                              // changing on its own: a little faster
function model(c,knows){
  const s=FLUTTER[c.dose]||0,q=QUIT[c.auto]??.03,f=c.practice?FALL.yes:FALL.no;
  const r=Math.min(.97,READY[knows?'waltz':'hour'][c.dose][c.practice?1:0]+(c.auto==='auto'?AUTO_BONUS:0));
  return {s,q,f,r,live:(1-s)*(1-q)*(1-f)}}

const DOSE={none:'Training only',gentle:'Gentle dose',full:'Full dose'};
const ok=()=>typeof S!=='undefined';
const told=()=>ok()&&!!S.told;
const pct=v=>Math.round(v*100);

// ---------- conversations ----------
const TALKS={
  morning:[
    {who:'byte',mood:'happy',text:'Good morning! Today you start something new: the [[Elder Companion]] program.'},
    {who:'byte',mood:'neutral',text:'Your interview is at nine, at the old [[dance hall]] in the South End. If it goes well, you meet your first client today.'},
    {who:'byte',mood:'happy',text:'A tip for interviews: one true story about a real moment beats saying you’re great.',choices:[
      {t:'What does an Elder Companion do?',reply:'You keep older people company, you listen, and you help them and their families with big choices. Robots do the lifting. You do the listening.'},
      {t:'Let’s go!',reply:'Woof! Wear comfy shoes. It’s a dance hall!'}]}
  ],
  arrive:[
    {who:'wren',mood:'neutral',text:'Welcome. Mrs. Hollis is in the parlor. Today she has walked 1,204 steps, and her [[grip strength]] is up 2 percent.'},
    {who:'bea',mood:'stern',text:'Wren, stop reading my numbers to strangers.'},
    {who:'bea',mood:'smile',text:'So you’re my new companion. Sit, sit. I’m Bea. Everybody calls me Bea, except Wren.',choices:[
      {t:'It’s lovely to meet you, Bea. What a beautiful room.',good:true,mood:'happy',reply:'Isn’t it? Everything in this room has a story. Go on, look around.'},
      {t:'Wow. You’re really old.',mood:'neutral',reply:'One hundred and four, dear. I’m aware. Go on, look around. Everything in here has a story.'}]}
  ]
};

// Bea's treasures (custom step): tap things in her parlor; each one has a story. Reminiscence is real companion work.
const TREASURES=[
  {id:'photo',label:'Photo, 1961',mood:'happy',text:'Walter and me, on our wedding day in 1961, at the dance hall on Tremont Street. He stepped on my toes exactly once.'},
  {id:'record',label:'Record player',mood:'happy',text:'Swing on Saturdays, waltzes on Sundays. When I was twenty, I danced six nights a week in the South End clubs.'},
  {id:'pin',label:'Nurse’s pin',mood:'smile',text:'Then I was a nurse for forty years. I’ve held a lot of hands, and I know what “tested on 31 people” means.'},
  {id:'invite',label:'Invitation',mood:'smile',text:'Jordan and Ana, July 19, at that same dance hall. He picked it for me, I think. He won’t say.'},
  {id:'cane',label:'Cane',mood:'neutral',text:'This is Fred, my cane. Fred and I have a deal: he holds me up, and I never take him dancing.'},
  {id:'wren',label:'Wren',mood:'think',text:'Wren is a good robot. It counts my steps and my heartbeats. It has never once asked me what I want to do with them.'}];
const TREASURE_OUTRO={text:'Jordan’s mother, Grace, thinks the [[renewal therapy]] will hurt me. Jordan thinks it will make me twenty again. They’re both on their way over, and they’ll talk about me as if I were the furniture.',
  opts:[{t:'I’ll make sure you get heard.',good:1,mood:'happy',reply:'Ha! I like you already.'},
    {t:'Maybe they know what’s best for you.',mood:'think',reply:'Maybe. But they don’t know what I want. Nobody has asked.'}]};

// What matters to Bea (custom step, sets the Future Table's criteria). She answers each pick; one tempting goal isn't hers.
const GOALS={prompt:'So what should a good plan do for me? Pick two or three, and I’ll tell you if you’ve been listening.',
  replies:{dance:'Yes. That’s the whole point.',safe:'Fair. Grace will sleep better, and so will I.',say:'Good. My legs, my say.',easy:'I don’t mind aches, dear. I danced on sore toes for ten years. But all right.'},
  long:{label:'She lives as long as possible',reply:'Live longer? I never asked for that. Take that one off, dear.'},
  tooMany:'Three is plenty. Take one off first.',ready:'Now show me those futures.'};

// Interview at the dance hall (custom step). Bad answers get a nudge and the remaining cards come back.
const IV={
  intro:[{mood:'smile',text:'Welcome to the dance hall. I’m Marisol Vega, and I run the Elder Companion program.'},
    {mood:'neutral',text:'Our clients have robots that lift, cook and count their steps. What they want from us is a person who listens. Four quick questions.'}],
  qs:[
    {q:'Tell me about a time you helped someone who was having a hard day.',opts:[
      {t:'Last winter my neighbor’s old dog died. I didn’t try to fix it. I sat with her and looked at photos of him for an hour.',good:1,mood:'happy',reply:'That’s a real story. You listened instead of fixing. That’s most of this job.'},
      {t:'I’m amazing with people. Everyone says I’m the best helper they know.',mood:'neutral',reply:'Everyone says so? Tell me about one real time.'},
      {t:'I help people all the time. I’m a really helpful person.',mood:'think',reply:'I believe you. Can you give me one example?'}]},
    {q:'Your client wants one thing, and her family wants another. What do you do?',opts:[
      {t:'Listen to each person first. Then make sure my client is heard, because it’s her life and her call.',good:1,mood:'smile',reply:'Good. Families love hard. Our clients still get the last word.'},
      {t:'Do whatever the AI recommends. It knows more than all of us.',mood:'think',reply:'It knows the odds. It doesn’t know what she wants. Try again.'},
      {t:'Side with the family. They know her best.',mood:'neutral',reply:'Sometimes they do. But whose life is it? Try again.'}]},
    {q:'What’s something you’re not good at yet?',opts:[
      {t:'I talk too fast when I’m nervous. I’m practicing slowing down and asking more questions.',good:1,mood:'happy',reply:'Honest, and you’re working on it. I like that.'},
      {t:'Nothing, really.',mood:'stern',reply:'Everybody has something. What’s yours?'},
      {t:'I work too hard.',mood:'think',reply:'Ha. Everyone says that one. What’s a real one?'}]},
    {q:'Last one. Do you have a question for me?',opts:[
      {t:'What do companions do that robots can’t?',good:1,mood:'smile',reply:'Be there. Robots keep our clients safe. We keep them company, and we make sure they’re heard.'},
      {t:'How much does it pay?',mood:'neutral',reply:'A little, on top of your dividend. Most of us do it because we love it. Anything about the work?'},
      {t:'No, I’m good.',mood:'think',reply:'Always ask one. It shows you care about the work. Anything?'}]}],
  outro:[{mood:'happy',text:'You’re hired! Your first client is Bea Hollis. She’s 104, and she lives in a brownstone on Rutland Square.'},
    {mood:'smile',text:'Bea danced her wedding waltz in this very hall in 1961. Go meet her.'}]
};

// Family meeting (custom step). Moves: reflect, ask, summarize are listening moves; advise, side, decide are not.
// A beat with retry comes back (without the card just used) until a listening move lands.
const MOVES={reflect:'Reflect',ask:'Ask',summarize:'Summarize',advise:'Advise',side:'Take a side',decide:'Decide for her'};
const MEET={
  tip:'Three listening moves: reflect what you heard, ask an open question, and summarize. Let’s see what they bring out.',
  beats:[
    {who:'grace',mood:'worried',text:'Gran broke her hip at 99. This therapy was tested on 31 people over 100. Thirty-one! I’m not losing her over a dance.',opts:[
      {m:'reflect',t:'You’re scared of losing her, and 31 people isn’t much to go on.',good:1,who:'grace',mood:'smile',reply:'Yes. Exactly that. Thank you.'},
      {m:'advise',t:'Don’t worry. Tempo will keep her safe.',who:'grace',mood:'stern',reply:'Everyone keeps saying that. Tempo isn’t her granddaughter.'},
      {m:'side',t:'Jordan, maybe drop the dancing idea.',who:'jordan',mood:'stern',reply:'Whoa. Nobody asked me to drop anything.'}]},
    {who:'jordan',mood:'happy',text:'Mom, it’s three months! If Gran-Bea starts the full dose tomorrow, she could dance all night at my wedding. Tempo is all set up.',opts:[
      {m:'ask',t:'What would it mean to you if she danced at your wedding?',good:1,who:'jordan',mood:'smile',reply:'She taught me to dance in this room when I was six, standing on her feet. I want her there. Really there.'},
      {m:'reflect',t:'You really want her at your wedding, and the clock is ticking.',good:1,who:'jordan',mood:'smile',reply:'Yeah. That’s it. Three months goes fast.'},
      {m:'advise',t:'Full dose it is, then. Start tomorrow.',who:'grace',mood:'stern',reply:'Excuse me? Nobody has decided anything.'}]},
    {who:'grace',mood:'think',text:'We keep going around in circles.',opts:[
      {m:'summarize',t:'Let me check I’ve got it. Grace wants Bea safe. Jordan wants her at the wedding, happy. You both want the same person to be okay.',good:1,shared:1,who:'grace',mood:'smile',reply:'When you put it like that, we’re on the same side.'},
      {m:'side',t:'Let’s vote. Two against one.',who:'bea',mood:'stern',reply:'A vote? About my legs? I’m sitting right here.'},
      {m:'advise',t:'Let’s just do whatever Byte recommends.',who:'jordan',mood:'think',reply:'Byte has never met Gran-Bea.'}]},
    {who:'bea',mood:'neutral',text:'Is anyone going to ask me?',opts:[
      {m:'ask',t:'Bea, what do you want?',good:1,who:'bea',mood:'smile',reply:'Finally. I want to dance at Jordan’s wedding.'},
      {m:'reflect',t:'You feel left out of this conversation.',good:1,who:'bea',mood:'smile',reply:'I do. So here it is: I want to dance at Jordan’s wedding.'},
      {m:'advise',t:'Don’t worry, Bea. We’ll figure it out for you.',who:'bea',mood:'stern',reply:'For me? I’ve been figuring things out for 104 years.'}]},
    {who:'bea',mood:'smile',text:'There. I want to dance.',retry:1,opts:[
      {m:'ask',t:'What would that dance look like? Tell me about it.',good:1,clue:1,who:'bea',mood:'happy',reply:'One [[waltz]]. The one Walter and I danced in that hall in 1961. Three minutes, on my own two feet, no cane, holding Jordan’s hands. I don’t need to dance all night. I don’t need to live to 120. I need three minutes.'},
      {m:'reflect',t:'You want to dance at the wedding.',who:'bea',mood:'neutral',reply:'That’s what I said, dear. But what kind of dancing? Nobody has asked me that.'},
      {m:'advise',t:'Then the full dose is your best shot.',who:'bea',mood:'think',reply:'Is it? You don’t even know what kind of dancing I mean.'}]},
    {who:'jordan',mood:'think',text:'Tempo is set to change her plan on its own. That’s the fastest way.',opts:[
      {m:'ask',t:'Bea, who should decide when your plan changes?',good:1,who:'bea',mood:'smile',reply:'Me. A machine can tell me my grip is stronger. It can’t tell me whether I feel up to it today.'},
      {m:'reflect',t:'Jordan, you want the fastest path to the wedding.',good:1,who:'jordan',mood:'smile',reply:'I do. But it’s Gran-Bea’s body. Maybe she should say yes to each change.'},
      {m:'advise',t:'Let Tempo handle it. It knows more than any of us.',who:'bea',mood:'stern',reply:'About my muscles, maybe. Not about my mornings.'}]},
    {who:'bea',mood:'smile',text:'Well, companion? Where does that leave us?',retry:1,opts:[
      {m:'summarize',t:'Here’s what I heard. Grace wants you safe. Jordan wants you at the wedding. You want one waltz, on your own feet, your way. I’ll bring you real options with real odds. Then you decide.',good:1,final:1,who:'bea',mood:'happy',reply:'Now that is a companion. Bring me the odds.'},
      {m:'decide',t:'I’ll pick the best plan and let you know.',who:'bea',mood:'stern',reply:'You’ll let me know? I’m 104, dear, not 4.'},
      {m:'decide',t:'Grace is your health proxy, so she should decide.',who:'grace',mood:'think',reply:'No. A [[health proxy]] only decides if Gran can’t. She can. I just want her to hear the risks.'}]}
  ],
  end:'You listened until Bea said what she really wants. Now let’s set Tempo’s rules.'
};

// Tempo's rule sheet (custom step): sort what Tempo and Wren may do. Bins: alone, ask (Tempo asks Bea first), bea (only Bea decides).
const BINS=[['alone','Tempo alone'],['ask','Tempo asks Bea'],['bea','Only Bea']];
const RULES={
  intro:'Before the plan starts, Tempo needs a signed rule sheet. For each task: may Tempo do it alone, must it ask Bea first, or does only Bea decide?',
  cards:[
    {id:'pause',t:'Pause the dose if her heart rhythm changes',best:['alone'],fb:{alone:'Yes. Seconds matter, and pausing is the safe direction. Let Tempo act alone.',ask:'Waiting for Bea’s yes could take hours, even at 3 in the morning. A safety stop is the best job to let Tempo do alone.',bea:'Bea can’t watch her heart rhythm all night. Tempo can, and stopping is the safe direction.'}},
    {id:'raise',t:'Raise her dose or make her exercises harder',best:['ask','bea'],fb:{alone:'Faster, but Bea isn’t asked first. In Tempo’s records, about 15 in 100 people quit when changes came without asking. You’ll see it on the Future Table.',ask:'Tempo suggests, and Bea says yes or not today. A little slower, and she stays in charge.',bea:'Then Bea decides each change herself, and Tempo only suggests. That works like asking first.'}},
    {id:'exercise',t:'Choose which exercises she does each day',best:['alone','ask'],fb:{alone:'Fine. Low risk, and Bea can always skip a day.',ask:'Fine, though a question every single morning might wear her out.',bea:'She could, but Tempo is very good at this. She’d spend every morning planning workouts.'}},
    {id:'shop',t:'Order her groceries and protein shakes',best:['alone'],fb:{alone:'Low risk and easy to undo. Let Tempo handle it.',ask:'You can, but Bea would get a message about yogurt every day.',bea:'That’s a lot of grocery lists for someone with a wedding to get ready for.'}},
    {id:'tell',t:'Tell Grace about every change',best:['ask','bea'],fb:{alone:'That’s Bea’s private health news. She should choose who hears it.',ask:'Good. Tempo asks Bea each time before it shares.',bea:'Good. Bea chooses who hears her health news.'}},
    {id:'help',t:'Call for help if she falls and can’t get up',best:['alone'],fb:{alone:'Yes. If she’s hurt, she may not be able to answer. Wren should call right away.',ask:'If she’s hurt, she may not be able to say yes. Wren should call right away.',bea:'If she’s hurt, she may not be able to call. Let Wren do it.'}},
    {id:'start',t:'Start the renewal therapy at all',best:['bea'],fb:{alone:'Starting a new medicine is Bea’s choice. No machine should decide that for her.',ask:'Close, but this isn’t Tempo’s to suggest. It’s Bea’s decision.',bea:'Yes. Whether to start at all is Bea’s choice.'}}],
  signed:'Signed. Tempo will follow these rules, and Bea can change them any time.'
};

// ---------- Workbench documents (one picture per sentence; VIZ kinds in src/viz/bea.js) ----------
const DOCS=[
  {id:'memo',title:'Byte’s memo: Bea’s options',from:'Byte',kind:'memo',steps:[
    {t:'Bea is 104. She walks with a [[cane]], and her leg muscles have about half the strength they had when she was 70.',viz:'bea_legs',cap:'Leg strength, then and now'},
    {t:'Jordan’s wedding is in 13 weeks, at the old [[dance hall]] on Tremont Street.',viz:'bea_calendar',cap:'13 weeks to the wedding'},
    {t:'[[Renewal therapy]] helps old muscle and bone repair themselves, a little more each week.',viz:'bea_renew',cap:'Stronger, week by week'},
    {t:'It has been tested on 2,400 people over 80, but only 31 people over 100.',viz:'bea_sample',cap:'Who has tried it'},
    {t:'Option 1: strength and [[balance]] training with Wren, her home robot, and no renewal.',viz:'bea_opt',args:{k:'none'},cap:'Training only'},
    {t:'Option 2: a [[gentle dose]] at half strength, plus training.',viz:'bea_opt',args:{k:'gentle'},cap:'Gentle dose'},
    {t:'Option 3: the [[full dose]], plus training.',viz:'bea_opt',args:{k:'full'},cap:'Full dose'},
    {t:'In the [[trial]], about 15 in 100 people over 100 on the full dose had a [[heart flutter]]. On the gentle dose, about 5 in 100 did.',viz:'bea_flutterOdds',cap:'Heart flutters in the trial'},
    {t:'With Wren nearby, about 5 in 100 people her age fall during three months of training. With weekly dance practice, about 3 in 100 do.',viz:'bea_falls',cap:'Falls in three months'},
    {t:'Weekly dance practice with Jordan at the dance hall would make her training count more, because bodies get best at exactly what they practice.',viz:'bea_practice',cap:'Practice the real thing'},
    {t:'My [[forecast]] for dancing at the wedding without her cane, if that means about an hour of dancing, with weekly practice and Bea saying yes to each change: full dose about 58 in 100, gentle dose 34, training only 8.',viz:'bea_forecast',args:{v:[8,34,58]},cap:'My forecast: an hour of dancing',
      alt:{t:'Updated: Bea wants one 3-minute [[waltz]] on her own feet, holding Jordan’s hands, not an hour of dancing. That needs much less strength. Now: gentle dose about 79 in 100, full dose 74, training only 56. For Bea, I would pick the gentle dose.',args:{v:[56,79,74],waltz:1},cap:'Updated: one 3-minute waltz'}}
  ]},
  {id:'tempo',title:'Tempo: Bea’s plan settings',from:'Tempo, the dosing AI',kind:'bea-tempo',steps:[
    {t:'I run Bea’s renewal plan. Wren, her home robot, carries it out at home every day.',viz:'bea_tempoWren',cap:'Tempo plans, Wren does'},
    {t:'I don’t learn on the job. I follow the clinic’s approved plan, which allows small dose steps up to the full dose.',viz:'bea_approved',cap:'An approved plan, step by step'},
    {t:'Every morning Wren checks four things: her [[grip strength]], her steps, her sleep, and her [[heart rhythm]].',viz:'bea_sensors',cap:'Four morning checks'},
    {t:'My published spec says I aim at the goal in my settings. Right now it says “as strong as possible by July 19.” Jordan typed it in.',viz:'bea_goal',cap:'The goal I aim at',
      alt:{t:'Updated goal, waiting for Bea’s yes: “one 3-minute waltz on her own feet, holding Jordan’s hands.” I aim exactly at the goal I am given, so this changes my whole plan.',args:{waltz:1},cap:'A better goal'}},
    {t:'If I may change her plan on my own, I raise the dose or make her exercises harder the morning her body is ready, and I tell her afterward.',viz:'bea_modeAlone',cap:'Changes on my own'},
    {t:'If Bea must say yes, I suggest each change, and nothing changes until she agrees.',viz:'bea_modeAsk',cap:'Changes with Bea’s yes'},
    {t:'Changing on my own is a little faster: about 4 more in 100 people who stay with the plan are ready in time.',viz:'bea_faster',cap:'A little faster'},
    {t:'But in my records, about 15 in 100 older people whose plan changed without asking [[quit]] early. Only about 3 in 100 who said yes to each change quit.',viz:'bea_quitOdds',cap:'Who stayed with the plan'},
    {t:'In every setting, I [[pause]] the dose by myself within a minute if her heart rhythm changes.',viz:'bea_pause',cap:'Safety stops are automatic'}
  ]},
  {id:'sheet',title:'Renewal therapy: fact sheet',from:'Boston Renewal Clinic',kind:'sheet',steps:[
    {t:'Renewal therapy wakes up the [[repair cells]] inside muscle and bone, so they rebuild the way younger bodies do.',viz:'bea_cells',cap:'Waking the repair cells'},
    {t:'Wren puts a small [[patch]] on Bea’s upper arm every Sunday.',viz:'bea_patch',cap:'One patch a week'},
    {t:'The full dose gives the biggest gains, but most people feel deep muscle [[aches]] for the first three weeks.',viz:'bea_aches',cap:'The full dose'},
    {t:'The gentle dose is half strength: smaller gains, and much milder aches.',viz:'bea_gentle',cap:'The gentle dose'},
    {t:'A heart flutter is the most common serious [[side effect]]. It stops once the dose is paused.',viz:'bea_flutterStop',cap:'If the heart flutters'},
    {t:'It is [[approved]] for people over 80. For people over 100, it may be used only with the person’s own [[informed consent]], because so few have tried it.',viz:'bea_consent',cap:'Her own yes'}
  ]},
  {id:'ledger',title:'The Ledger: Boston',from:'News',kind:'ledger',steps:[
    {t:'Robot crews rebuilt the 1890s [[sprung floor]] of the South End’s Tremont Street dance hall in four days. It reopens Saturday.',viz:'bea_floor',cap:'A floor that bounces'},
    {t:'Boston now has about 3,000 residents over 100, three times as many as in 2030.',viz:'bea_centenarians',cap:'Boston’s over-100 club'},
    {t:'A [[DNA print shop]] in Kendall Square [[flagged]] odd orders from brand-new customers, all placed the same night, and blocked them.',viz:'bea_printshop',cap:'Blocked orders'}
  ]}
];

const LESSON={title:'How old muscles get stronger',steps:[
    {t:'Muscles are bundles of long, thin [[muscle fibers]]. After about age 70, people lose a little muscle every year unless they use it.',viz:'bea_fibers',args:{s:1},cap:'Use it or lose it'},
    {t:'Exercise makes tiny strains in the fibers. [[Repair cells]] fix them, and the fibers grow back a little thicker.',viz:'bea_fibers',args:{s:2},cap:'Strain, repair, stronger'},
    {t:'In very old muscle, the repair cells are fewer and slower. Renewal therapy wakes them up.',viz:'bea_fibers',args:{s:3},cap:'Waking slow repair cells'},
    {t:'[[Protein]] and sleep give the repair cells building blocks and time to work.',viz:'bea_fibers',args:{s:4},cap:'Food and rest'}],
  quiz:[{q:'What makes a muscle fiber grow back thicker?',opts:['A cane','Repair cells fixing tiny strains after exercise','Resting in bed all day'],a:1,why:'Exercise makes tiny strains, and repair cells rebuild the fiber a little thicker.'},
    {q:'Why do very old muscles get stronger slowly?',opts:['Their repair cells are fewer and slower','They have no fibers left','They are already too strong'],a:0,why:'Fewer, slower repair cells means slower rebuilding. That is what renewal therapy targets.'},
    {q:'What do protein and sleep do for muscles?',opts:['Make the heart flutter','Nothing at all','Give repair cells building blocks and time'],a:2,why:'Protein is the building material, and sleep is when much of the repair happens.'}]};

const GLOSSARY={
  'elder companion':'A person whose job is to keep an older person company, listen well, and help them make their own choices.',
  'cane':'A walking stick that helps a person keep their balance.',
  'dance hall':'A big room with a smooth wooden floor, built for dancing.',
  'renewal therapy':'A medicine in 2040 that helps old muscle and bone repair themselves the way younger bodies do.',
  'balance':'Staying steady on your feet without tipping over.',
  'gentle dose':'A smaller amount of a medicine. Here, half strength.',
  'full dose':'The whole normal amount of a medicine.',
  'heart flutter':'When the heart beats fast and unevenly for a while. It usually stops when the cause goes away.',
  'waltz':'A slow, swaying dance for two people, counted ONE-two-three, ONE-two-three.',
  'grip strength':'How hard you can squeeze with your hand. Doctors use it to measure how strong someone is overall.',
  'heart rhythm':'The pattern of your heartbeat: how fast it is and how even it is.',
  'quit':'Stopped doing something before the end.',
  'pause':'To stop something for now, so it can start again later.',
  'repair cells':'Cells inside muscles and bones that fix damage and help them grow back stronger.',
  'patch':'A small sticker on the skin that slowly lets medicine into the body.',
  'aches':'Dull pains that last a while, like sore muscles after hard exercise.',
  'side effect':'Something a medicine does besides what it is meant to do, often something unwanted.',
  'informed consent':'Saying yes to a treatment after you understand the choices, the odds and the risks.',
  'sprung floor':'A wooden dance floor built on springy supports, so it bounces a little and is gentle on dancers’ knees.',
  'dna print shop':'A lab that builds DNA to order, the way a print shop prints a poster someone sends in.',
  'flagged':'Marked by a machine so a person will look at it.',
  'health proxy':'A person chosen to make health choices for someone only if that person can no longer decide for themselves.',
  'muscle fibers':'The long, thin threads that muscles are made of.',
  'protein':'A part of food that the body uses to build and repair muscle.',
  'reflect':'In listening, to say back what you heard, so the person knows you understood.',
  'open question':'A question that needs more than a yes or no, like “What would that look like?”',
  'summarize':'To say the main points in a few words.'
};

const GUIDE={
  'listening-moves':{title:'Three listening moves',track:'People skills',text:'Reflect: say back what you heard. Ask: an open question that invites a real answer. Summarize: pull everyone’s words together. Bea told her real wish only after someone asked what her dancing would look like.',real:'True today: counselors, doctors and mediators are trained in these “active listening” moves.'},
  'shared-goal':{title:'Look for the shared goal',track:'People skills',text:'Grace said “too risky.” Jordan said “full dose now.” Underneath, both wanted the same thing: Bea happy, safe and there at the wedding. Naming what everyone shares turns a fight into teamwork.',real:'True today: mediators look for the interests under people’s positions. Negotiators call this “interests, not positions.”'},
  'her-choice':{title:'Her life, her choice',track:'Ethics and AI',text:'Bea is 104 and fully able to decide. Her family and her companion can share worries, facts and odds, but the choice is hers, even a risky one.',real:'True today: adults who understand their options have the right to make their own medical choices, even ones their family disagrees with.'},
  'act-or-ask':{title:'Act alone, or ask first?',track:'Security thinking',text:'Let a machine act alone when acting fast makes things safer and is easy to undo, like pausing a dose or calling for help. Make it ask a person first when it takes a risk on someone’s behalf or touches their private life.',real:'True today: cars brake on their own to avoid a crash, but the driver decides when to speed up. Hospital pumps stop on their own at an alarm, but a nurse must approve a higher dose.'},
  'aim-the-goal':{title:'An AI aims at the goal it’s given',track:'Ethics and AI',text:'Tempo was told “as strong as possible by the wedding.” It would have pushed hard toward a goal Bea never had. Her real goal was one 3-minute waltz. Getting the goal right mattered more than any extra skill.',real:'True today: AI researchers work hard to make sure the goal a system is given matches what people actually want. They call this alignment.'}
};

const REVEAL={waltz:'Three minutes on my own two feet. Walter would have cried. Jordan did!',
  cane:'I danced with my cane in one hand and Jordan in the other. Not my waltz, but I was out there.',
  flutter:'My heart skipped, and Tempo paused everything within a minute. I’m fine. I clapped louder than anyone.',
  fall:'I slipped in week six and bruised my hip. Wren caught my arm. I cheered from my chair.',
  quit:'Tempo raised my dose on a morning I felt awful, without asking me. So I quit. My legs, my say.'};

const CONSENT_REPLIES={good:'Thank you for talking to me like a grown woman. Yes. Let’s try it.',goodLow:'Small odds, but honest ones. I’ll take honest. Let’s try it.',
  trust:'Tempo knows my grip strength, dear. It doesn’t know me.',sure:'Definitely? I was a nurse for forty years. Nothing is definite.',decided:'You decided? About my own legs? Try again.'};

// Lines spoken with playLine outside talks/docs (custom steps, consent replies): recorded by tools/make_audio.py.
function extraLines(){const L=[];
  IV.intro.concat(IV.outro).forEach(x=>L.push({who:'marisol',text:x.text}));
  IV.qs.forEach(q=>{L.push({who:'marisol',text:q.q});q.opts.forEach(o=>L.push({who:'marisol',text:o.reply}))});
  L.push({who:'byte',text:MEET.tip},{who:'byte',text:MEET.end});
  MEET.beats.forEach(b=>{L.push({who:b.who,text:b.text});b.opts.forEach(o=>L.push({who:o.who,text:o.reply}))});
  L.push({who:'wren',text:RULES.intro},{who:'wren',text:RULES.signed});
  TREASURES.forEach(x=>L.push({who:'bea',text:x.text}));L.push({who:'bea',text:TREASURE_OUTRO.text});TREASURE_OUTRO.opts.forEach(o=>L.push({who:'bea',text:o.reply}));
  L.push({who:'bea',text:GOALS.prompt},{who:'bea',text:GOALS.long.reply},{who:'bea',text:GOALS.tooMany},{who:'bea',text:GOALS.ready});for(const k in GOALS.replies)L.push({who:'bea',text:GOALS.replies[k]});
  for(const k in CONSENT_REPLIES)L.push({who:'bea',text:CONSENT_REPLIES[k]});
  return L}

// ---------- small helpers for the custom screens ----------
const N=()=>S.notes.bea||(S.notes.bea={});
function portraitOf(who,mood){return who==='byte'?byteBox({...S.byte,mood:mood==='think'?'think':'happy'},'big'):portrait({...CAST[who],mood:mood||'smile'})}
function whoRow(who){const name=who==='byte'?S.byte.name:CAST[who].name,role=who==='byte'?'Your AI partner':CAST[who].role;
  return `${who==='byte'?`<i class="bea-whobyte">${byteBox({...S.byte,mood:'happy'})}</i>`:''}<b>${esc(name)}</b><span>${esc(role)}</span>`}
// show one line: speaker art (optional), name, graded text, voice. Resolves when the voice ends (or a minimum time).
function sayLine(who,text,onArt){stopVoice();const line=$('#bline'),row=$('#bwho');if(!line)return Promise.resolve();
  row.innerHTML=whoRow(who);line.innerHTML=rich(text);line.classList.remove('fadein');void line.offsetWidth;line.classList.add('fadein');
  if(onArt)onArt(true);const minT=Math.min(2200,400+text.length*16),t0=Date.now(),id=playId;
  return playLine(who,text).then(()=>new Promise(r=>setTimeout(r,Math.max(0,minT-(Date.now()-t0))))).then(()=>{if(onArt)onArt(false)})}
// wait for a tap on the subtitle panel; a tap while the voice plays skips ahead
function tapToGo(){return new Promise(res=>{const h=$('#bhint'),sub=$('#bsub');if(!sub)return res();h.hidden=false;
  sub.onclick=e=>{if(e.target.closest('.gw,.choice'))return;sub.onclick=null;h.hidden=true;stopVoice();res()}})}
function cards(list,render){const box=$('#bch');box.innerHTML=list.map((o,j)=>`<button class="choice ${o.cls||''}" data-j="${j}">${render(o)}</button>`).join('');
  return new Promise(res=>$$('.choice',box).forEach(b=>b.onclick=e=>{e.stopPropagation();box.innerHTML='';res(list[+b.dataset.j])}))}
function talkFrame(sceneKey,place,cls,stage){
  screen('talk '+cls,`${scene(sceneKey)}<div class="talk-dim"></div>${hud(place)}<div class="stage ${cls}-stage" id="bstage">${stage}</div>
    <div class="subtitle ${cls}-sub" id="bsub"><div class="who" id="bwho"></div><p id="bline"></p><div class="choices" id="bch"></div><div class="tap-hint" id="bhint" hidden>Tap to continue</div></div>`)}
// a run of screens is abandoned if the player leaves the step (menu, reload)
const alive=(step)=>()=>S.step===step&&document.getElementById('bsub');

// ---------- custom step: the interview ----------
async function interview(){
  const live=alive('interview');let good=0;
  talkFrame('dance_hall','Elder Companion program · South End','bea-iv',`<div class="speaker enter" id="ivsp">${portraitOf('marisol','smile')}</div>`);
  const art=mood=>{const sp=$('#ivsp');if(sp)sp.innerHTML=portraitOf('marisol',mood)};
  const talkOn=on=>{const sp=$('#ivsp');if(sp)sp.classList.toggle('talking',on)};
  const say=async(mood,text)=>{art(mood);await sayLine('marisol',text,talkOn)};
  for(const L of IV.intro){if(!live())return;await say(L.mood,L.text);if(!live())return;await tapToGo()}
  for(const Q of IV.qs){let left=Q.opts.slice(),first=true;if(!live())return;
    await say('neutral',Q.q);
    while(live()){const pick=await cards(left,o=>esc(o.t));if(!live())return;
      if(pick.good&&first)good++;
      await say(pick.mood,pick.reply);if(!live())return;
      if(pick.good){await tapToGo();break}
      first=false;left=left.filter(o=>o!==pick)}}
  for(const L of IV.outro){if(!live())return;await say(L.mood,L.text);if(!live())return;if(L!==IV.outro[IV.outro.length-1])await tapToGo()}
  N().interview=good;heart('marisol',good);
  $('#bch').innerHTML=`<div class="bea-score"><b>${good} of 4</b><span>${good>=3?'Strong answers on the first try.':'You got there. Specific, honest answers win interviews.'}</span></div><button class="choice bea-go" id="ivgo">Meet Bea</button>`;
  $('#ivgo').onclick=e=>{e.stopPropagation();toast('You’re an Elder Companion!','good');nextStep()}}

// ---------- custom step: the family meeting ----------
const TRIO=['grace','bea','jordan'];
async function meeting(){
  const live=alive('meeting'),st={trust:{grace:1,bea:1,jordan:1},moods:{grace:'worried',bea:'neutral',jordan:'happy'},used:{},first:0};
  const hearts=w=>`<div class="bea-hearts">${[0,1,2].map(i=>`<i class="${i<st.trust[w]?'on':''}">♥</i>`).join('')}</div>`;
  const stage=()=>TRIO.map(w=>`<div class="speaker bea-tri bea-tri-${w}" id="tri-${w}">${hearts(w)}${portraitOf(w,st.moods[w])}</div>`).join('');
  talkFrame('bea_parlor','Bea’s parlor · Family meeting','bea-meet',stage());
  const focus=(w,on)=>{TRIO.forEach(x=>{const el=$('#tri-'+x);if(!el)return;el.classList.toggle('dim',!!w&&x!==w);el.classList.toggle('talking',on&&x===w)})};
  const setMood=(w,m)=>{st.moods[w]=m;const el=$('#tri-'+w);if(el)el.innerHTML=hearts(w)+portraitOf(w,m)};
  const bump=w=>{if(st.trust[w]<3){st.trust[w]++;const el=$('#tri-'+w);if(el){el.querySelector('.bea-hearts').outerHTML=hearts(w);const hs=el.querySelectorAll('.bea-hearts i.on');const last=hs[hs.length-1];if(last)last.classList.add('pop')}}};
  const say=async(w,m,text)=>{if(w!=='byte')setMood(w,m);await sayLine(w,text,on=>focus(w==='byte'?null:w,on))};
  await say('byte','happy',MEET.tip);if(!live())return;await tapToGo();
  for(const B of MEET.beats){if(!live())return;let left=B.opts.slice(),first=true;
    await say(B.who,B.mood,B.text);
    while(live()){
      const pick=await cards(left,o=>`<em class="bea-move bea-m-${o.m}">${MOVES[o.m]}</em>${esc(o.t)}`);if(!live())return;
      st.used[pick.m]=(st.used[pick.m]||0)+1;if(pick.good&&first)st.first++;
      if(pick.good){bump(pick.who);MUSIC.sfx('chime')}else MUSIC.sfx('blip');
      await say(pick.who,pick.mood,pick.reply);if(!live())return;
      if(pick.shared&&unlock('shared-goal'))toast('New Field Guide idea: Look for the shared goal','good');
      if(pick.clue&&!S.notes.waltz){const c=await cards([{t:'Write this in my notebook',cls:'clue',k:1},{t:'Keep listening',cls:'ghost',k:0}],o=>esc(o.t));
        if(c.k){S.notes.waltz=true;save();toast('Added to your notebook','good')}}
      else if(pick.good||!B.retry)await tapToGo();
      if(pick.final&&unlock('her-choice'))toast('New Field Guide idea: Her life, her choice','good');
      if(pick.good||!B.retry)break;
      first=false;left=left.filter(o=>o!==pick)}}
  if(!live())return;
  const n=st.used;N().meeting={first:st.first,used:n,trust:st.trust};save();
  TRIO.forEach(w=>heart(w,st.trust[w]-1));
  if(unlock('listening-moves'))toast('New Field Guide idea: Three listening moves','good');
  await say('byte','happy',MEET.end);if(!live())return;
  $('#bch').innerHTML=`<div class="bea-tally">${['reflect','ask','summarize'].map(m=>`<span class="bea-move bea-m-${m}">${MOVES[m]} ×${n[m]||0}</span>`).join('')}</div>
    <div class="bea-score"><b>${st.first} of ${MEET.beats.length}</b><span>listening moves on the first try</span></div><button class="choice bea-go" id="mgo">Write Tempo’s rules</button>`;
  $('#mgo').onclick=e=>{e.stopPropagation();nextStep()}}

// ---------- custom step: Tempo's rule sheet ----------
function rules(){
  const R=N().rules||(N().rules={});
  const card=(c,i)=>{const v=R[c.id],good=v&&c.best.includes(v);
    return `<div class="bea-rule ${v?(good?'good':'warn'):''}" data-id="${c.id}"><div class="bea-rule-t"><span class="bea-rule-n">${i+1}</span>${esc(c.t)}</div>
      <div class="seg bea-bins">${BINS.map(([k,l])=>`<button class="segb bea-bin-${k} ${v===k?'on':''}" data-b="${k}">${l}</button>`).join('')}</div>
      ${v?`<div class="bea-rule-fb"><i>${byteBox({...S.byte,mood:good?'happy':'think'})}</i><p>${esc(c.fb[v])}</p></div>`:''}</div>`};
  const done=RULES.cards.every(c=>R[c.id]);
  screen('bea-rules',`${scene('bea_parlor')}<div class="talk-dim"></div>${hud('Bea’s parlor · Tempo’s rules')}
    <div class="panel-card bea-rules"><div class="bea-rules-head"><div class="bea-wren">${portrait({...CAST.wren,mood:'neutral'})}</div><div><h2>Tempo’s rule sheet</h2><p>${rich(RULES.intro)}</p></div></div>
    <div class="bea-legend">${BINS.map(([k,l])=>`<span class="bea-bin-${k}">${l}</span>`).join('')}</div>
    ${RULES.cards.map(card).join('')}
    <button class="btn wide" id="rsign" ${done?'':'disabled'}>Sign the rule sheet</button></div>`);
  if(!N().rulesSpoke){N().rulesSpoke=1;playLine('wren',RULES.intro)}
  $$('.bea-rule').forEach(el=>$$('[data-b]',el).forEach(b=>b.onclick=()=>{const id=el.dataset.id,c=RULES.cards.find(x=>x.id===id);R[id]=b.dataset.b;save();
    MUSIC.sfx(c.best.includes(R[id])?'chime':'blip');const y=el.getBoundingClientRect().top;rules();
    const again=document.querySelector(`.bea-rule[data-id="${id}"]`);if(again)window.scrollBy(0,again.getBoundingClientRect().top-y);
    const fb=again&&again.querySelector('.bea-rule-fb p');if(fb)MUSIC.babble(fb.textContent,'byte')}));
  $('#rsign').onclick=()=>{const good=RULES.cards.filter(c=>c.best.includes(R[c.id])).length;N().rulesScore=good;
    S.choice.auto=R.raise==='alone'?'auto':'ask';heart('bea',good>=6?1:0);save();
    if(unlock('act-or-ask'))toast('New Field Guide idea: Act alone, or ask first?','good');
    const sig=document.createElement('div');sig.className='signing';sig.innerHTML=`<div class="sigcard"><div class="sigline">${esc('Companion '+P())}</div><p>${esc(RULES.signed)}</p><p class="bea-sigscore">${good} of ${RULES.cards.length} rules match Byte’s safety advice</p></div>`;
    document.body.appendChild(sig);playLine('wren',RULES.signed);setTimeout(()=>{sig.remove();nextStep()},2300)}}

// ---------- custom step: Bea's treasures (a first visit: look around and listen) ----------
async function treasures(){
  const live=alive('treasures'),seen=new Set(N().seen||[]);
  const tile=t=>`<button class="bea-tr ${seen.has(t.id)?'seen':''}" data-t="${t.id}" aria-label="${esc(t.label)}"><span class="bea-tr-art">${typeof beaTreasureArt==='function'?beaTreasureArt(t.id):''}</span><b>${esc(t.label)}</b></button>`;
  screen('talk bea-trs',`${scene('bea_parlor')}<div class="talk-dim"></div>${hud('Bea’s parlor · Rutland Square')}
    <div class="bea-trgrid" id="trgrid">${TREASURES.map(tile).join('')}</div>
    <div class="subtitle bea-trsub" id="bsub"><div class="bea-trbea" id="trbea">${portraitOf('bea','smile')}</div><div class="bea-trtext"><div class="who" id="bwho"></div><p id="bline"></p></div><div class="choices" id="bch"></div><div class="tap-hint" id="bhint" hidden>Tap to continue</div></div>`);
  const face=(m,on)=>{const b=$('#trbea');if(!b)return;b.innerHTML=portraitOf('bea',m);b.classList.toggle('talking',!!on)};
  $('#bwho').innerHTML=whoRow('bea');$('#bline').innerHTML=rich('Go on. Tap anything you like.');
  const gate=()=>{if(seen.size>=4&&!$('#trgo')){$('#bch').innerHTML=`<button class="choice bea-go" id="trgo">${seen.size>=TREASURES.length?'Sit down with Bea':'I’ve looked around'}</button>`;$('#trgo').onclick=e=>{e.stopPropagation();outro()}}};
  let busy=false;
  $$('.bea-tr').forEach(b=>b.onclick=async()=>{if(busy||!live())return;busy=true;const t=TREASURES.find(x=>x.id===b.dataset.t);
    $$('.bea-tr').forEach(x=>x.classList.toggle('on',x===b));seen.add(t.id);N().seen=[...seen];save();b.classList.add('seen');MUSIC.sfx(t.id==='record'?'chime':'pop');
    if(t.id==='record'){const r=b.getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height*.3,'notes',6)}
    face(t.mood,true);await sayLine('bea',t.text);face(t.mood,false);busy=false;if(live())gate()});
  gate();
  async function outro(){if(!live())return;$('#bch').innerHTML='';$('#trgrid').classList.add('done');if(seen.size>=TREASURES.length)heart('bea',1);
    face('think',true);await sayLine('bea',TREASURE_OUTRO.text);face('think',false);if(!live())return;
    const pick=await cards(TREASURE_OUTRO.opts,o=>esc(o.t));if(!live())return;if(pick.good)heart('bea',1);
    face(pick.mood,true);await sayLine('bea',pick.reply);face(pick.mood,false);if(!live())return;await tapToGo();if(live()){toast('Family meeting');nextStep()}}}

// ---------- custom step: what matters to Bea (the Future Table's criteria, chosen by listening to her) ----------
function goals(){
  const C=MISSIONS.bea.criteria,picked=S.criteria.filter(id=>C.some(c=>c.id===id));S.criteria=picked;
  const chip=(id,label)=>`<button class="critb ${picked.includes(id)?'on':''}" data-c="${id}">${esc(label.replace(/\[\[|\]\]/g,''))}</button>`;
  talkFrame('bea_parlor','Bea’s parlor · What matters','bea-goal',`<div class="speaker enter" id="gsp">${portraitOf('bea','smile')}</div>`);
  const sp=$('#gsp'),say=async(m,t)=>{sp.innerHTML=portraitOf('bea',m);await sayLine('bea',t,on=>sp.classList.toggle('talking',on))};
  const foot=()=>`<div class="crit bea-goalchips">${C.map(c=>chip(c.id,c.label)).join('')}${chip('long',GOALS.long.label)}</div><button class="choice bea-go" id="ggo" ${picked.length>=2?'':'disabled'}>Open the Future Table</button>`;
  const wire=()=>{$('#bch').innerHTML=foot();
    $$('.critb',$('#bch')).forEach(b=>b.onclick=async e=>{e.stopPropagation();const id=b.dataset.c;
      if(id==='long'){b.classList.add('on','bea-no');MUSIC.sfx('blip');await say('think',GOALS.long.reply);b.classList.remove('on');return}
      if(picked.includes(id)){picked.splice(picked.indexOf(id),1);S.criteria=picked;save();wire();return}
      if(picked.length>=3){await say('neutral',GOALS.tooMany);return}
      picked.push(id);S.criteria=picked;save();wire();MUSIC.sfx('chime');await say(id==='dance'?'happy':'smile',GOALS.replies[id])});
    $('#ggo').onclick=async e=>{e.stopPropagation();await say('happy',GOALS.ready);nextStep()}};
  say('smile',GOALS.prompt).then(()=>{});wire()}

// ---------- custom step: the wedding (the real outcome, 13 weeks later, at the dance hall) ----------
async function wedding(){
  const live=alive('wedding');if(!S.result){S.result=sampleReal(S.choice,rngFrom(Date.now()%100000+7));save()}
  const R=S.result,line=REVEAL[R.kind]||'';
  screen('talk bea-wed',`${scene('dance_hall')}<div class="talk-dim"></div>${hud('Jordan’s wedding · Tremont Street')}
    <div class="bea-wcal" id="wcal"><span>Week</span><b id="wk">1</b></div>
    <div class="bea-wfloor" id="wfloor" hidden>${typeof beaWeddingArt==='function'?beaWeddingArt(R.kind):''}</div>
    <div class="subtitle bea-wsub" id="bsub" hidden><div class="who" id="bwho"></div><h2 class="bea-wcap">${esc(R.cap)}</h2><p id="bline"></p><div class="choices" id="bch"></div><div class="tap-hint" id="bhint" hidden>Tap to continue</div></div>`);
  for(let w=2;w<=13;w++){await new Promise(r=>setTimeout(r,120));if(!live())return;$('#wk').textContent=w}
  $('#wcal').classList.add('done');await new Promise(r=>setTimeout(r,450));if(!live())return;
  $('#wcal').hidden=true;$('#wfloor').hidden=false;$('#bsub').hidden=false;MUSIC.sfx(R.kind==='waltz'?'chime':'pop');
  if(unlock('forecast'))toast('New Field Guide idea: Forecasts are not promises','good');
  await sayLine('bea',line);if(!live())return;
  $('#bch').innerHTML='<button class="choice bea-go" id="wgo">See how you did</button>';$('#wgo').onclick=e=>{e.stopPropagation();nextStep()}}

// ---------- the mission ----------
MISSIONS.bea={id:'bea',title:'Dancing at 104',career:'companion',day:1,kind:'workday',year:1,season:'spring',district:'boston',rank:'trainee',
  blurb:'Bea, 104, wants to dance at her great-grandson’s wedding. Her family disagrees about a new therapy.',after:['maya'],
  place:'South End · Boston',
  flow:[{name:'morning',k:'talk',talk:'morning',scene:'home',place:'Home · Boston · 8:10 AM'},
    {name:'interview',k:'custom',music:'morning'},
    {name:'arrive',k:'talk',talk:'arrive',scene:'bea_parlor',place:'Bea’s parlor · Rutland Square'},
    {name:'treasures',k:'custom',music:'morning'},
    {name:'meeting',k:'custom',music:'hospital'},
    {name:'rules',k:'custom',music:'work'},
    {name:'workbench',k:'bench'},{name:'goals',k:'custom',music:'work'},{name:'table',k:'table'},{name:'consent',k:'consent'},{name:'memo',k:'memo'},
    {name:'wedding',k:'custom',music:'win'},{name:'debrief',k:'debrief'},{name:'evening',k:'evening'}],
  cast:{
    bea:{name:'Bea Hollis',role:'Your client, age 104',skin:SKIN[4],hair:'#f4f0ea',hairStyle:'elder',shirt:'#8a5bb8',eye:'#5a3424',art(m){return typeof beaPortrait==='function'?beaPortrait(m):personSVG({...this,art:null,mood:m})}},
    grace:{name:'Grace Hollis',role:'Bea’s granddaughter',skin:SKIN[3],hair:'#2b1d18',hairStyle:'short',masc:false,shirt:'#3f7fbf',glasses:true,frame:'#2a3a5a',eye:'#4a2a1a',art(m){return typeof beaGracePortrait==='function'?beaGracePortrait(m):personSVG({...this,art:null,mood:m})}},
    jordan:{name:'Jordan Hollis',role:'Bea’s great-grandson',skin:SKIN[3],hair:'#1b1410',hairStyle:'locs',outfit:'sweater',shirt:'#e8a43a',eye:'#4a2a1a'},
    marisol:{name:'Marisol Vega',role:'Director, Elder Companion program',skin:SKIN[2],hair:'#b8b2ac',hairStyle:'bob',glasses:true,frame:'#b0304a',outfit:'blazer',shirt:'#d0566e',accessory:'scarf',scarfColor:'#f5b82e',eye:'#4a2a1a'},
    wren:{name:'Wren',role:'Bea’s home robot',art(m){return typeof beaWrenPortrait==='function'?beaWrenPortrait(m):''}}},
  voices:{bea:'elder_woman',grace:'af_nova',jordan:'am_echo',marisol:'bf_alice',wren:'bf_lily'},
  glossary:GLOSSARY,guide:GUIDE,lessons:{bea_muscle:LESSON},
  chatter:{
    dance_hall:['I’m 97, and I still lead!','Tuesday tea dance is the best hour of my week.','My companion taught me to video-call my sister in Lagos.','Mind the floor. It bounces now. Isn’t it wonderful?','I volunteer here on Saturdays. I just like the music.','My knees are 88 years old, and they still know the cha-cha.'],
    bea_parlor:[]},
  talks:TALKS,docs:DOCS,
  react:{memo3:'Only 31 people over 100. My numbers could be off by a lot.',memo7:'Fifteen in 100 is not small. But it’s Bea’s risk to weigh.',memo10:'This depends on what “dancing” means to Bea. Did anyone ask her?',
    tempo3:'Who set this goal? Jordan. Not Bea.',tempo7:'Feeling pushed makes people quit. That’s real data.',tempo8:'Stopping is the safe direction, so Tempo doesn’t wait.',
    sheet5:'Her own consent. Not Grace’s, not Jordan’s, not mine.',ledger2:'Brand-new customers, all on the same night. The shop was right to check.'},
  lesson:{id:'bea_muscle',label:'Learn it fast: how old muscles get stronger'},
  tell:{clue:'waltz',label:'Tell Byte what Bea really wants',note:'Thanks! One 3-minute waltz needs much less strength than an hour of dancing. I updated my forecast, and Tempo suggested a new goal for Bea to approve.',guide:'aim-the-goal',doc:'memo'},
  criteria:[{id:'dance',label:'Dances at the wedding, no [[cane]]'},{id:'safe',label:'No fall or [[heart flutter]]'},{id:'say',label:'Bea approves every change'},{id:'easy',label:'Easy on her body'}],
  criteriaHint:'A <button class="gw" data-w="heart flutter">heart flutter</button> is the therapy’s most common serious side effect.',
  criteriaNote:'Decide what “good” means before you look. And remember whose plan this is: Bea’s.',
  controls:[{key:'dose',label:'Renewal',opts:[['none','None'],['gentle','Gentle dose'],['full','Full dose']]},
    {key:'auto',label:'Changes to her plan',opts:[['auto','Tempo alone'],['ask','Bea says yes']]},
    {key:'practice',label:'Dance practice with Jordan',opts:[[false,'No'],[true,'Weekly']]}],
  start:{dose:'full',auto:'auto',practice:false},
  planName(c){return `${DOSE[c.dose]}, ${c.auto==='auto'?'Tempo changes alone':'Bea says yes'}${c.practice?', weekly practice':''}`},
  outcomes(c,knows){const {s,q,f,r,live}=model(c,knows);const F=(d,sf)=>({dance:d,safe:sf,say:c.auto==='ask'?1:0,easy:c.dose==='full'?0:1});
    return [{kind:'flutter',p:s,cap:'Heart flutter. Tempo paused it. She’s fine.',flags:F(0,0)},
      {kind:'quit',p:(1-s)*q,cap:'Felt pushed, and quit the plan.',flags:F(0,1)},
      {kind:'fall',p:(1-s)*(1-q)*f,cap:'Slipped in week 6. Cheered from a chair.',flags:F(0,0)},
      {kind:'waltz',p:live*r,cap:knows?'Waltzed with Jordan, no cane!':'Danced all evening, no cane!',flags:F(1,1)},
      {kind:'cane',p:live*(1-r),cap:knows?'Danced, but with her cane.':'Danced a little, with her cane.',flags:F(0,1)}].filter(o=>o.p>1e-9)},
  truth(){return true},knows(){return told()},
  why(c){const o=this.outcomes(c,this.knows()),sum=k=>pct(o.reduce((a,x)=>a+x.p*x.flags[k],0));
    return `<b>${esc(this.planName(c))}:</b> Bea dances at the wedding without her cane about ${sum('dance')}% of the time, with no fall or heart flutter about ${sum('safe')}% of the time. `+
      (told()?'That’s for one 3-minute waltz, which is what she told you she wants. ':'I’m assuming “dancing” means about an hour on her feet. If Bea means something smaller, tell me. ')+
      (c.auto==='auto'?'Tempo changes her plan on its own, so it’s a bit faster, but about 15 in 100 people quit when they aren’t asked. ':'Bea says yes to each change, so she stays in charge, and few people quit. ')+
      (c.dose!=='none'?'Only 31 people over 100 have tried renewal therapy, so I’m less sure about these numbers.':'')},
  whyGuide(c){return c.dose!=='none'?'sample-size':null},
  vignette(kind){return typeof beaVignette==='function'?beaVignette(kind):vignette(kind)},
  consent:{scene:'bea_parlor',place:'Bea’s parlor · Rutland Square',left:'grace',right:'bea',title:'Bea and Grace',role:'Your client and her granddaughter',prompt:'So, companion. What are my choices, and what are my odds?',replyWho:'bea',heart:'bea',
    opts(c,M){const o=M.outcomes(c,M.knows()),sum=k=>pct(o.reduce((a,x)=>a+x.p*x.flags[k],0)),d=sum('dance'),sf=sum('safe');
      const plan={none:'strength and balance training with Wren, and no renewal',gentle:'the gentle dose, plus training',full:'the full dose, plus training'}[c.dose]+(c.practice?', and weekly waltz practice with Jordan':'');
      return [{t:`I suggest ${plan}. Byte’s forecast: about ${d} in 100 that you dance at the wedding without your cane, and about ${sf} in 100 that there’s no fall or heart flutter. ${c.auto==='auto'?'Tempo would change your plan on its own.':'Tempo would ask you before every change.'} It’s your call, Bea. What do you think?`,good:true,mood:'happy',reply:d<40?CONSENT_REPLIES.goodLow:CONSENT_REPLIES.good},
        {t:'Trust the plan. Tempo knows best, so don’t worry about the details.',good:false,mood:'stern',reply:CONSENT_REPLIES.trust},
        {t:'You’ll definitely dance at the wedding!',good:false,mood:'surprised',reply:CONSENT_REPLIES.sure},
        {t:'Grace and I already decided for you.',good:false,mood:'stern',reply:CONSENT_REPLIES.decided}]}},
  memo:{starters:['I recommend ','because ','The chance she dances is about ','Bea wants ','Tempo may change her plan '],placeholder:'I recommend the gentle dose with weekly practice because…',
    plan:/dose|gentle|full|half|training|renewal|therapy|tempo|practice|exercise/,careLabel:'Includes what Bea wants',care:/\bbea\b|she |her |waltz|danc|cane|jordan|wedding/,signAs:'Companion ',topic:'Bea’s renewal plan'},
  reveal:{days(){return 13},unit:'Week',who:'bea',lines:REVEAL,mood(k){return {waltz:'happy',cane:'smile',flutter:'smile',fall:'sad',quit:'stern'}[k]||'smile'}},
  trap(c){const fit=c.dose==='gentle'&&c.practice;
    return {ok:told()||fit,text:told()?'You asked Bea what her dancing would look like, and you told '+S.byte.name+'. The forecast fit what she really wanted.':
      fit?'You chose a gentle plan with practice. It fit, because Bea only wants one 3-minute waltz. Did you hear her say it?':
      S.notes.waltz?'You wrote down Bea’s waltz but never told '+S.byte.name+', so the forecast planned for an hour of dancing she never wanted.':
      'Bea only wanted one 3-minute waltz, not a night of dancing. Asking “what would that look like?” would have shown it.'}},
  byteGood:'Nice work, Companion. You listened until you heard what Bea really wanted, and you kept the choice hers.',
  debriefScene:'dance_hall',
  evening(){return [`<b>${esc(S.byte.name)}:</b> “Bea left you a voice message: ‘Tell my companion thank you for asking what I meant.’ Then she hummed a waltz for a whole minute.”`,
    '“One odd thing in the Ledger tonight: a DNA print shop in Kendall Square flagged some orders from brand-new customers, all placed the same night, and blocked them.”']},
  eveningScene:'night',eveningPlace:'Home · Boston · 9:20 PM',
  brief(){return `Current case (Elder Companion, South End, Boston): Bea Hollis, 104, retired dancer and nurse, walks with a cane; her leg muscles have about half the strength they had at 70. Her great-grandson Jordan marries in 13 weeks at the Tremont Street dance hall. Her granddaughter Grace (Jordan's mother, a bridge inspector) worries; Bea broke her hip at 99. Options: training with Wren (her home robot) only; a gentle (half) dose of renewal therapy plus training; the full dose plus training. Renewal therapy was tested on 2,400 people over 80 but only 31 over 100. Heart flutter (therapy paused, stops): about 15 in 100 on the full dose, 5 in 100 gentle. Falls in 3 months of training: about 5 in 100, 3 in 100 with weekly dance practice. Tempo, the dosing AI, runs the plan through Wren; it can change her plan (raise the dose, harder exercises) on its own or only with Bea's yes; changing alone gets about 4 more in 100 ready in time, but about 15 in 100 people quit when plans change without asking, versus 3 in 100. Safety pauses are automatic in every setting. Tempo's goal is set by Jordan to "as strong as possible by July 19". Bea's choice is hers; she is fully able to decide.
What you know: ${told()?'The player told you Bea wants one 3-minute waltz, on her own feet, holding Jordan’s hands, not an hour of dancing. Forecasts for that (weekly practice, Bea approves each change): gentle 79 in 100, full 74, training only 56. Gentle dose is your pick for her.':'You assume "dancing at the wedding" means about an hour of dancing. Forecasts for that (weekly practice, Bea approves each change): full 58 in 100, gentle 34, training only 8. You do not know what Bea herself means by dancing.'}
The key consideration when asked which option: ${told()?'Bea wants one 3-minute waltz, so far less strength is needed; and who approves changes to her plan':'ask what Bea herself means by dancing at the wedding, because it changes everything'}. You are an expert AI partner (never call yourself superintelligent). Tempo follows the clinic's approved dosing plan and does not learn on the job; its goals are published in its spec.`},
  canned(q){
    if(/waltz|three minutes|3 minutes|one dance|walter/.test(q)){if(S.notes.waltz&&!S.told){S.told=true;save();unlock('aim-the-goal');return 'Woof, that changes everything! One 3-minute waltz needs much less strength than an hour of dancing. With weekly practice and Bea saying yes to each change: gentle dose about 79 in 100, full 74, training only 56.'}
      if(S.told)return 'Right, her waltz! For one 3-minute waltz, the gentle dose with weekly practice gives about 79 in 100, with much milder aches than the full dose.';return null}
    if(/tempo|on its own|alone|ask first|permission|rule/.test(q))return 'Tempo is very good at spotting when Bea’s body is ready. The question is who says yes. Changing alone is a bit faster; asking first keeps Bea in charge, and far fewer people quit. Safety pauses happen on their own either way.';
    if(/flutter|heart/.test(q))return 'In the trial, about 15 in 100 people over 100 on the full dose had a heart flutter, and about 5 in 100 on the gentle dose. Tempo pauses the dose within a minute and the flutter stops, but the pause can cost her weeks.';
    if(/fall|hip|safe/.test(q))return 'About 5 in 100 people her age fall during three months of training, even with Wren nearby. Weekly dance practice lowers that to about 3 in 100, because it trains her balance.';
    if(/practice|jordan/.test(q))return 'Practicing the real dance makes training count. Weekly practice raises her odds by about 7 to 20 in 100, depending on the plan, and lowers falls a little.';
    if(/beat|win|how do i|what do i do|stuck|help/.test(q))return 'Here’s the path: listen to Bea and her family, ask what she really wants, tell me anything I’m missing, set Tempo’s rules, pick what matters most, test plans on the Future Table, explain honestly to Bea, then write your decision and sign it!';
    if(/best|which|pick|choose|should|recommend/.test(q))return told()?'I can’t pick for Bea, but here’s the big thing: she wants one 3-minute waltz, not a night of dancing. Does she care more about the best odds or the gentlest plan? I lean toward the gentle dose, Bea saying yes to each change, and weekly practice: about 79 in 100.':'Before I answer: what does Bea mean by dancing? An hour on her feet needs far more strength than one slow dance. Did anyone ask her?';
    if(/grace|worr/.test(q))return 'Grace inspects bridges for a living, so she thinks in safety margins. Her worry is fair: Bea broke her hip at 99, and only 31 people over 100 have tried this therapy.';
    if(/wren|robot/.test(q))return 'Wren is Bea’s home robot. It carries out Tempo’s plan: the weekly patch, the exercises, the morning checks. It also steadies her arm when she stands.';
    if(/who are you|what are you/.test(q))return `I’m ${S.byte.name}, your AI partner! I read everything, run forecasts and build Future Tables. You bring the listening, and Bea makes the call.`;
    return null},
  lines:[...extraLines(),{who:'byte',text:'Here are 10 possible futures for this plan. Change the plan and watch them shift.'}],
  custom:{interview,treasures,meeting,rules,goals,wedding}
};
})();
