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
  why:'Older people want another person to keep them company, listen to them, and make sure their own choices are heard.'});

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
    {who:'byte',mood:'happy',text:'Good morning! Today you interview for a new job in the [[Elder Companion]] program.'},
    {who:'byte',mood:'neutral',text:'The interview is at nine, at the old [[dance hall]] in the South End. If it goes well, you will meet your first client today.'},
    {who:'byte',mood:'happy',text:'Here’s a tip for your interview. Telling one true story about a time you helped someone works better than saying you’re great with people.',choices:[
      {t:'What does an Elder Companion do?',reply:'You keep older people company and really listen to them. You also help them and their families talk through big choices. Robots do the lifting and the cooking in their homes.'},
      {t:'Let’s go!',reply:'Woof! Wear comfy shoes, because the interview is in a dance hall!'}]}
  ],
  arrive:[
    {who:'wren',mood:'neutral',text:'Welcome. Mrs. Hollis is in the parlor. Today she has walked 1,204 steps, and her [[grip strength]] is up 2 percent.'},
    {who:'bea',mood:'stern',text:'Wren, stop reading my numbers to strangers.'},
    {who:'bea',mood:'smile',text:'So you’re my new companion. Sit, sit. I’m Bea. Everybody calls me Bea, except Wren, who calls me Mrs. Hollis.',choices:[
      {t:'It’s lovely to meet you, Bea. What a beautiful room.',good:true,mood:'happy',reply:'Isn’t it? Everything in this room has a story. Go on, look around.'},
      {t:'Wow, a hundred and four! I’ve never met anyone that old.',mood:'neutral',reply:'One hundred and four, dear. I’m aware. Go on, look around. Everything in here has a story.'}]}
  ]
};

// Bea's treasures (custom step): tap things in her parlor; each one has a story. Reminiscence is real companion work.
const TREASURES=[
  {id:'photo',label:'Photo, 1961',mood:'happy',text:'This is my husband Walter and me on our wedding day in 1961, at the dance hall on Tremont Street. He stepped on my toes exactly once.'},
  {id:'record',label:'Record player',mood:'happy',text:'My husband Walter and I played swing records on Saturdays and waltzes on Sundays. When I was twenty, I danced six nights a week in the South End clubs.'},
  {id:'pin',label:'Nurse’s pin',mood:'smile',text:'After my dancing days, I was a nurse for forty years. I’ve held a lot of hands, and I know how little a test on only 31 people can tell you.'},
  {id:'invite',label:'Invitation',mood:'smile',text:'This is Jordan and Ana’s wedding invitation. July 19, at the same dance hall where Walter and I got married. I think Jordan picked it for me, but he won’t say so.'},
  {id:'cane',label:'Cane',mood:'neutral',text:'This is Fred, my cane. Fred and I have a deal: he holds me up, and I never take him dancing.'},
  {id:'wren',label:'Wren',mood:'think',text:'Wren is a good robot. It counts my steps and my heartbeats all day long. But it has never once asked me what I’d like to do today.'}];
const TREASURE_OUTRO={text:'Jordan’s mother, Grace, thinks the [[renewal therapy]] will hurt me. Jordan thinks it will make me twenty again. They’re both on their way over, and they’ll talk about me as if I were the furniture.',
  opts:[{t:'I’ll make sure you get heard.',good:1,mood:'happy',reply:'Ha! I like you already.'},
    {t:'Maybe they know what’s best for you.',mood:'think',reply:'Maybe they do. But they don’t know what I want, because nobody has asked me.'}]};

// What matters to Bea (custom step, sets the Future Table's criteria). She answers each pick; one tempting goal isn't hers.
const GOALS={prompt:'So what should a good plan do for me? Pick two or three, and I’ll tell you if you’ve been listening.',
  replies:{dance:'Yes. Dancing at the wedding is the whole reason I’d do this.',safe:'Fair. Grace will sleep better, and so will I.',say:'Good. They’re my legs, so I want a say in what happens to them.',easy:'I don’t mind aches, dear. I danced on sore toes for ten years. But all right.'},
  long:{label:'She lives as long as possible',reply:'Live longer? I never asked for that. Take that one off, dear.'},
  tooMany:'Three goals are plenty. Take one off first.',ready:'Now show me what could happen with each plan.'};

// Interview at the dance hall (custom step). Bad answers get a nudge and the remaining cards come back.
const IV={
  intro:[{mood:'smile',text:'Welcome to the dance hall. I’m Marisol Vega, and I run the Elder Companion program.'},
    {mood:'neutral',text:'Our clients have robots that lift, cook and count their steps. What they want from us is a person who listens to them. I have four quick questions for you.'}],
  qs:[
    {q:'Tell me about a time you helped someone who was having a hard day.',opts:[
      {t:'Last winter my neighbor’s old dog died. I didn’t try to cheer her up right away. I just sat with her, and we looked at photos of him for an hour.',good:1,mood:'happy',reply:'That’s a real story. You sat with her and listened, and listening is most of what companions do.'},
      {t:'I’m amazing with people. My friends and teachers all say I’m the best helper they know, and I really love helping out.',mood:'neutral',reply:'Everyone says so? Then tell me about one real time you helped someone.'},
      {t:'I help people all the time, at school and at home. I’m just a really helpful person, and people know they can count on me.',mood:'think',reply:'I believe you. Can you give me one example?'}]},
    {q:'Your client wants one thing, and her family wants another. What do you do?',opts:[
      {t:'I’d listen to each person first. Then I’d make sure my client gets heard, because it’s her life and her decision.',good:1,mood:'smile',reply:'Good. Families care a lot and mean well, but in this program, our clients make the final decision about their own lives.'},
      {t:'I’d do whatever the AI recommends. It has read every study, so it knows more than any of us do.',mood:'think',reply:'An AI can know the odds, but it doesn’t know what your client wants. Try again.'},
      {t:'I’d side with the family. They’ve known her for years, so they probably know what’s best for her.',mood:'neutral',reply:'Sometimes families do know best. But it’s your client’s life, so the choice is hers. Try again.'}]},
    {q:'What’s something you’re not good at yet?',opts:[
      {t:'I talk too fast when I’m nervous. I’m practicing slowing down and asking more questions.',good:1,mood:'happy',reply:'That’s honest, and you’re working on it. I like that.'},
      {t:'Nothing, really. I’ve always been pretty good at whatever I try.',mood:'stern',reply:'Everybody has something they’re still learning. What’s yours?'},
      {t:'I work too hard. Sometimes I care so much that I forget to rest.',mood:'think',reply:'Ha. Everyone gives that answer in interviews, because it sounds like a weakness but isn’t one. What’s a real one?'}]},
    {q:'Last one. Do you have a question for me?',opts:[
      {t:'What do companions do that robots can’t?',good:1,mood:'smile',reply:'The robots keep our clients safe. We keep them company, listen to them, and make sure their families and doctors hear what they want.'},
      {t:'How much does the job pay?',mood:'neutral',reply:'It pays a little, on top of the [[dividend]] every adult gets. Most of us do it because we love it. Do you have a question about the work itself?'},
      {t:'No, I think I’m good.',mood:'think',reply:'You should always ask a question at an interview, because it shows you care about the work. Do you have one?'}]}],
  outro:[{mood:'happy',text:'You’re hired! Your first client is Bea Hollis. She’s 104, and she lives in a brownstone on Rutland Square.'},
    {mood:'smile',text:'Bea danced her wedding waltz in this very hall in 1961. Go meet her.'}]
};

// Family meeting (custom step). Moves: reflect, ask, summarize are listening moves; advise, side, decide are not.
// A beat with retry comes back (without the card just used) until a listening move lands.
const MOVES={reflect:'Reflect',ask:'Ask',summarize:'Summarize',advise:'Advise',side:'Take a side',decide:'Decide for her'};
const MEET={
  tip:'Here are three listening moves you can use. You can reflect, which means saying back what you heard. You can ask an open question. And you can summarize what everyone has said.',
  beats:[
    {who:'grace',mood:'worried',text:'Gran broke her hip at 99, and this renewal therapy was only tested on 31 people over 100. Thirty-one! I’m not going to lose her over a dance.',opts:[
      {m:'reflect',t:'You’re scared of losing her, and a test on only 31 people doesn’t tell you much.',good:1,who:'grace',mood:'smile',reply:'Yes. Exactly that. Thank you.'},
      {m:'advise',t:'Try not to worry. Tempo watches her heart all day, so it will keep her safe.',who:'grace',mood:'stern',reply:'Everyone keeps telling me that. But Tempo isn’t her granddaughter. I am.'},
      {m:'side',t:'Jordan, maybe you should let go of the dancing idea.',who:'jordan',mood:'stern',reply:'Whoa. I didn’t come here to give up on Gran-Bea dancing at my wedding.'}]},
    {who:'jordan',mood:'happy',text:'Mom, the wedding is only three months away! If Gran-Bea starts the full dose tomorrow, she could dance all night at my wedding. Tempo is already set up to run her plan.',opts:[
      {m:'ask',t:'What would it mean to you if she danced at your wedding?',good:1,who:'jordan',mood:'smile',reply:'She taught me to dance in this room when I was six. I stood on her feet. I want her at my wedding up and dancing, not just sitting at a table.'},
      {m:'reflect',t:'You really want her at your wedding, and three months doesn’t feel like much time.',good:1,who:'jordan',mood:'smile',reply:'Yeah, that’s it. Three months will go by fast.'},
      {m:'advise',t:'Then the full dose sounds right. She should start it tomorrow.',who:'grace',mood:'stern',reply:'Excuse me? Nobody has decided anything about Gran’s medicine yet.'}]},
    {who:'grace',mood:'think',text:'We keep having the same argument over and over.',opts:[
      {m:'summarize',t:'Let me check that I’ve got this right. Grace, you want Bea to be safe. Jordan, you want her happy at your wedding. You both want Bea to be okay.',good:1,shared:1,who:'grace',mood:'smile',reply:'When you put it like that, Jordan and I want the same thing.'},
      {m:'side',t:'Let’s just take a vote, and whichever side gets more votes wins.',who:'bea',mood:'stern',reply:'A vote? About my legs? I’m sitting right here.'},
      {m:'advise',t:'Let’s just do whatever Byte recommends. Byte has read every study on this.',who:'jordan',mood:'think',reply:'Byte has never even met Gran-Bea.'}]},
    {who:'bea',mood:'neutral',text:'Is anyone going to ask me what I want?',opts:[
      {m:'ask',t:'Bea, what do you want?',good:1,who:'bea',mood:'smile',reply:'Finally. I want to dance at Jordan’s wedding.'},
      {m:'reflect',t:'You feel left out of this conversation.',good:1,who:'bea',mood:'smile',reply:'I do. So here it is: I want to dance at Jordan’s wedding.'},
      {m:'advise',t:'Don’t worry, Bea. We’ll figure it out for you.',who:'bea',mood:'stern',reply:'For me? I’ve been figuring things out for 104 years.'}]},
    {who:'bea',mood:'smile',text:'There, I said it. I want to dance.',retry:1,opts:[
      {m:'ask',t:'What would that dance look like? Tell me about it.',good:1,clue:1,who:'bea',mood:'happy',reply:'One [[waltz]], like the one my husband Walter and I danced in that hall in 1961. I want three minutes on my own two feet, with no cane, holding Jordan’s hands. I don’t need to dance all night, and I don’t need to live to 120. Three minutes would be plenty.'},
      {m:'reflect',t:'So you want to dance at the wedding.',who:'bea',mood:'neutral',reply:'That’s what I said, dear. But what kind of dancing? Nobody has asked me that.'},
      {m:'advise',t:'Then the full dose gives you the best shot at it.',who:'bea',mood:'think',reply:'Does it? You don’t even know what kind of dancing I mean yet.'}]},
    {who:'jordan',mood:'think',text:'Right now Tempo is set to change Gran-Bea’s plan on its own. That’s the fastest way to get her ready.',opts:[
      {m:'ask',t:'Bea, who should decide when your plan changes?',good:1,who:'bea',mood:'smile',reply:'Me. A machine can tell me my grip is stronger. It can’t tell me whether I feel up to a harder workout today.'},
      {m:'reflect',t:'Jordan, you want Gran-Bea ready for the wedding as fast as possible.',good:1,who:'jordan',mood:'smile',reply:'I do. But it’s Gran-Bea’s body. Maybe she should say yes to each change.'},
      {m:'advise',t:'Let Tempo handle the changes. It knows more about muscles than any of us.',who:'bea',mood:'stern',reply:'About muscles, maybe. But Tempo doesn’t know how I feel when I wake up in the morning.'}]},
    {who:'bea',mood:'smile',text:'Well, companion? What happens now?',retry:1,opts:[
      {m:'summarize',t:'Here’s what I heard. Grace wants you to be safe, and Jordan wants you at the wedding. You want one waltz on your own feet, and you want to choose how you get there. I’ll bring you the real options and their odds, and then you decide.',good:1,final:1,who:'bea',mood:'happy',reply:'Now you sound like a real companion. Go and find out my odds for each choice.'},
      {m:'decide',t:'I’ll look at the numbers, pick the best plan for you, and let you know what it is.',who:'bea',mood:'stern',reply:'You’ll let me know? I’m 104, dear, not 4.'},
      {m:'decide',t:'Grace is your health proxy, so she should be the one to make this decision.',who:'grace',mood:'think',reply:'No. A [[health proxy]] only decides if Gran can’t decide for herself, and she can. I just want her to hear the risks.'}]}
  ],
  end:'You listened until Bea told everyone what she really wants. Next, let’s write the rules for what Tempo may do on its own.'
};

// Tempo's rule sheet (custom step): sort what Tempo and Wren may do. Bins: alone, ask (Tempo asks Bea first), bea (only Bea decides).
const BINS=[['alone','Tempo alone'],['ask','Tempo asks Bea'],['bea','Only Bea']];
const RULES={
  intro:'Before the plan starts, Tempo needs a signed rule sheet. For each task, please choose whether Tempo does it alone, Tempo asks Bea first, or only Bea decides.',
  cards:[
    {id:'pause',t:'Pause the dose if her heart rhythm changes',best:['alone'],fb:{alone:'Yes. If her heart rhythm changes, every second counts, and pausing the dose can only make her safer. Tempo should do this on its own.',ask:'If her heart acts up at 3 in the morning, waiting for Bea’s yes could take hours. Pausing the dose is a safety stop, so it’s the best job to let Tempo do alone.',bea:'Bea can’t watch her own heart rhythm all night, but Tempo can. And pausing the dose can only make her safer.'}},
    {id:'raise',t:'Raise her dose or make her exercises harder',best:['ask','bea'],fb:{alone:'That’s a little faster, but nobody asks Bea first. In Tempo’s records, about 15 in 100 people quit when their plan changed without asking. You’ll see that on the Future Table.',ask:'Tempo suggests each change, and Bea can say yes or “not today.” It’s a little slower, but she stays in charge.',bea:'Then Bea decides each change herself, and Tempo only makes suggestions. That works about the same as asking first.'}},
    {id:'exercise',t:'Choose which exercises she does each day',best:['alone','ask'],fb:{alone:'That’s fine. Picking exercises is low risk, and Bea can always skip a day.',ask:'That’s fine, though a question every single morning might wear her out.',bea:'She could, but Tempo is very good at choosing exercises. Bea would spend every morning planning workouts.'}},
    {id:'shop',t:'Order her groceries and protein shakes',best:['alone'],fb:{alone:'Groceries are low risk, and a wrong order is easy to fix. Let Tempo handle them.',ask:'You can, but Bea would get a message about yogurt every day.',bea:'That’s a lot of grocery lists for someone with a wedding to get ready for.'}},
    {id:'tell',t:'Tell Grace about every change',best:['ask','bea'],fb:{alone:'That’s Bea’s private health news. She should choose who hears it.',ask:'Good. Tempo asks Bea each time before it tells Grace anything.',bea:'Good. Bea chooses who hears her health news.'}},
    {id:'help',t:'Call for help if she falls and can’t get up',best:['alone'],fb:{alone:'Yes. If she’s hurt, she may not be able to answer. Wren should call right away.',ask:'If she’s hurt, she may not be able to say yes. Wren should call right away.',bea:'If she’s hurt, she may not be able to call. Let Wren do it.'}},
    {id:'start',t:'Start the renewal therapy at all',best:['bea'],fb:{alone:'Starting a new medicine is Bea’s choice. No machine should decide that for her.',ask:'Close, but this isn’t something Tempo should be suggesting. Whether to start at all is Bea’s decision.',bea:'Yes. Whether to start at all is Bea’s choice.'}}],
  signed:'Signed. Tempo will follow these rules, and Bea can change them any time.'
};

// ---------- Workbench documents (one picture per sentence; VIZ kinds in src/viz/bea.js) ----------
const DOCS=[
  {id:'memo',title:'Byte’s memo: Bea’s options',from:'Byte',kind:'memo',steps:[
    {t:'Bea is 104. She walks with a [[cane]], and her leg muscles have about half the strength they had when she was 70.',viz:'bea_legs',cap:'Leg strength, then and now'},
    {t:'Bea’s great-grandson Jordan gets married in 13 weeks, at the old [[dance hall]] on Tremont Street.',viz:'bea_calendar',cap:'13 weeks to the wedding'},
    {t:'[[Renewal therapy]] helps old muscle and bone repair themselves, a little more each week.',viz:'bea_renew',cap:'Stronger, week by week'},
    {t:'Renewal therapy has been tested on 2,400 people over 80, but on only 31 people over 100.',viz:'bea_sample',cap:'Who has tried it'},
    {t:'Option 1 is strength and [[balance]] training with Wren, Bea’s home robot, and no renewal therapy.',viz:'bea_opt',args:{k:'none'},cap:'Training only'},
    {t:'Option 2 is a [[gentle dose]] of renewal therapy at half strength, plus the training.',viz:'bea_opt',args:{k:'gentle'},cap:'Gentle dose'},
    {t:'Option 3 is the [[full dose]] of renewal therapy, plus the training.',viz:'bea_opt',args:{k:'full'},cap:'Full dose'},
    {t:'In the [[trial]] of renewal therapy, about 15 in 100 people over 100 on the full dose had a [[heart flutter]]. On the gentle dose, about 5 in 100 did.',viz:'bea_flutterOdds',cap:'Heart flutters in the trial'},
    {t:'During three months of training with a home robot nearby, about 5 in 100 people Bea’s age have a fall. With weekly dance practice added, about 3 in 100 do.',viz:'bea_falls',cap:'Falls in three months'},
    {t:'Weekly dance practice with Jordan at the dance hall would make her training work better, because the body gets better at the exact movements it practices.',viz:'bea_practice',cap:'Practice the real thing'},
    {t:'I am assuming that dancing at the wedding means about an hour of dancing without her cane. With weekly practice and Bea saying yes to each change, my [[forecast]] is that she manages it in about 58 of 100 futures on the full dose, 34 on the gentle dose, and 8 with training only.',viz:'bea_forecast',args:{v:[8,34,58]},cap:'My forecast: an hour of dancing',
      alt:{t:'Updated: Bea wants to dance one 3-minute [[waltz]] on her own feet, holding Jordan’s hands, and not an hour of dancing. That takes much less strength. My new forecast is that she can do it in about 79 of 100 futures on the gentle dose, 74 on the full dose, and 56 with training only. For Bea, I would pick the gentle dose.',args:{v:[56,79,74],waltz:1},cap:'Updated: one 3-minute waltz'}}
  ]},
  {id:'tempo',title:'Tempo: Bea’s plan settings',from:'Tempo, the dosing AI',kind:'bea-tempo',steps:[
    {t:'I am Tempo, and I plan Bea’s renewal therapy. Wren, Bea’s home robot, carries out my plan at her home every day.',viz:'bea_tempoWren',cap:'Tempo plans, and Wren carries it out'},
    {t:'I don’t teach myself new things while I work. I follow the plan the clinic approved, which lets me raise the dose in small steps, up to the full dose.',viz:'bea_approved',cap:'An approved plan, step by step'},
    {t:'Every morning Wren checks four things about Bea: her [[grip strength]], her steps, her sleep, and her [[heart rhythm]].',viz:'bea_sensors',cap:'Four morning checks'},
    {t:'My public instructions say that I work toward whatever goal is typed into my settings. Right now the goal says “as strong as possible by July 19,” the day of the wedding. Jordan typed that goal in.',viz:'bea_goal',cap:'The goal I aim at',
      alt:{t:'Updated: a new goal is waiting for Bea to approve it: “one 3-minute waltz on her own feet, holding Jordan’s hands.” I plan for exactly the goal in my settings, so this new goal would change my whole plan.',args:{waltz:1},cap:'A better goal'}},
    {t:'If I am allowed to change Bea’s plan on my own, I raise her dose or make her exercises harder on the morning her body is ready, and I tell her afterward.',viz:'bea_modeAlone',cap:'Changes on my own'},
    {t:'If Bea must say yes first, I suggest each change, and nothing changes until she agrees.',viz:'bea_modeAsk',cap:'Changes with Bea’s yes'},
    {t:'Changing the plan on my own is a little faster. Out of 100 people who stay with the plan, about 4 more are ready in time.',viz:'bea_faster',cap:'A little faster'},
    {t:'But my records show that about 15 in 100 older people [[quit]] early when I changed their plan without asking them. Only about 3 in 100 quit when they said yes to each change.',viz:'bea_quitOdds',cap:'Who stayed with the plan'},
    {t:'No matter which setting is chosen, I [[pause]] the dose on my own within a minute if Bea’s heart rhythm changes.',viz:'bea_pause',cap:'Safety stops are automatic'}
  ]},
  {id:'sheet',title:'Renewal therapy: fact sheet',from:'Boston Renewal Clinic',kind:'sheet',steps:[
    {t:'Renewal therapy wakes up the [[repair cells]] inside muscle and bone, so they rebuild the way younger bodies do.',viz:'bea_cells',cap:'Waking the repair cells'},
    {t:'Every Sunday, Wren puts a small [[patch]] of the medicine on Bea’s upper arm.',viz:'bea_patch',cap:'One patch a week'},
    {t:'The full dose builds the most strength, but most people feel deep muscle [[aches]] for the first three weeks.',viz:'bea_aches',cap:'The full dose'},
    {t:'The gentle dose is half as strong. It builds less strength, and the aches are much milder.',viz:'bea_gentle',cap:'The gentle dose'},
    {t:'A heart flutter is the most common serious [[side effect]] of renewal therapy. The flutter stops once the dose is paused.',viz:'bea_flutterStop',cap:'If the heart flutters'},
    {t:'Renewal therapy is [[approved]] for people over 80. For people over 100, it may be used only with the person’s own [[informed consent]], because so few people that old have tried it.',viz:'bea_consent',cap:'Her own yes'}
  ]},
  {id:'ledger',title:'The Ledger: Boston',from:'News',kind:'ledger',steps:[
    {t:'Robot crews rebuilt the 1890s [[sprung floor]] of the South End’s Tremont Street dance hall in four days. The hall reopens on Saturday.',viz:'bea_floor',cap:'A floor that bounces'},
    {t:'Boston now has about 1,000 residents over 100, four times as many as in 2030.',viz:'bea_centenarians',cap:'Boston’s over-100 club'},
    {t:'A [[DNA print shop]] in Kendall Square blocked several orders that brand-new customers all placed on the same night. The shop’s computers had [[flagged]] the orders as unusual.',viz:'bea_printshop',cap:'Blocked orders'}
  ]}
];

const LESSON={title:'How old muscles get stronger',steps:[
    {t:'Muscles are bundles of long, thin [[muscle fibers]]. From middle age on, people lose a little muscle every year, faster after about 70, and using their muscles slows the loss.',viz:'bea_fibers',args:{s:1},cap:'Muscle lost with age'},
    {t:'Exercise makes tiny strains in the fibers. [[Repair cells]] fix them, and the fibers grow back a little thicker.',viz:'bea_fibers',args:{s:2},cap:'How exercise builds muscle'},
    {t:'In very old muscle, the repair cells are fewer and slower. Renewal therapy wakes them up.',viz:'bea_fibers',args:{s:3},cap:'Renewal therapy wakes repair cells'},
    {t:'[[Protein]] and sleep give the repair cells building blocks and time to work.',viz:'bea_fibers',args:{s:4},cap:'Food and rest'}],
  quiz:[{q:'What makes a muscle fiber grow back thicker?',opts:['A cane','Repair cells fixing tiny strains after exercise','Resting in bed all day'],a:1,why:'Exercise makes tiny strains, and repair cells rebuild the fiber a little thicker.'},
    {q:'Why do very old muscles get stronger slowly?',opts:['Their repair cells are fewer and slower','They have no fibers left','They are already too strong'],a:0,why:'When there are fewer repair cells and they work slowly, muscle rebuilds slowly. Renewal therapy is meant to wake those repair cells up.'},
    {q:'What do protein and sleep do for muscles?',opts:['Make the heart flutter','Nothing at all','Give repair cells building blocks and time'],a:2,why:'Muscle is rebuilt from protein, and much of the repair happens while you sleep.'}]};

const GLOSSARY={
  'elder companion':'A person whose job is to keep an older person company, listen well, and help them make their own choices.',
  'cane':'A walking stick that helps a person keep their balance.',
  'dance hall':'A big room with a smooth wooden floor, built for dancing.',
  'renewal therapy':'A medicine in 2040 that helps old muscle and bone repair themselves the way younger bodies do.',
  'balance':'Staying steady on your feet without tipping over.',
  'gentle dose':'A smaller amount of a medicine. In Bea’s plan, the gentle dose is half as strong as the full dose.',
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
  'listening-moves':{title:'Three listening moves',track:'People skills',text:'To reflect, you say back what you heard, so the person knows you understood. To ask, you use an open question, one that needs more than a yes or no. To summarize, you repeat the main points everyone has made. Bea only said what she really wanted after someone asked her what her dancing would look like.',real:'True today: counselors, doctors and mediators (people who help others settle a disagreement) are trained to use these “active listening” moves.'},
  'shared-goal':{title:'Look for the shared goal',track:'People skills',text:'Grace thought the therapy was too risky for Bea, and Jordan wanted Bea to start the full dose right away. But both of them wanted the same thing: for Bea to be happy, safe, and at the wedding. When you say out loud what everyone wants, people often stop arguing and start working together.',real:'True today: mediators are trained to ask why each person wants what they are asking for. Two people who ask for opposite things often turn out to have the same reasons.'},
  'her-choice':{title:'Her life, her choice',track:'Ethics and AI',text:'Bea is 104 and fully able to decide. Her family and her companion can share worries, facts and odds, but the choice is hers, even if it is risky.',real:'True today: adults who understand their options have the right to make their own medical choices, even ones their family disagrees with. Renewal therapy is a guess about what medicine might do by 2040. No medicine today can rebuild old muscle like that, but in a famous 1990 study, people about 90 years old who lifted weights for 8 weeks more than doubled their leg strength.'},
  'act-or-ask':{title:'Act alone, or ask first?',track:'Security thinking',text:'Let a machine act alone when acting fast makes things safer and is easy to undo, like pausing a dose or calling for help. Make it ask the person first when the action could hurt them, like raising a dose, or when it shares their private health news.',real:'True today: cars brake on their own to avoid a crash, but the driver decides when to speed up. Hospital medicine pumps stop on their own when an alarm goes off, but a nurse must approve a higher dose.'},
  'aim-the-goal':{title:'An AI aims at the goal it’s given',track:'Ethics and AI',text:'Tempo’s settings said “as strong as possible by the wedding.” With that goal, Tempo would have pushed Bea’s body as hard as it could, even though Bea never wanted that. Bea really wanted one 3-minute waltz, and Tempo could only plan for it after someone typed that goal into Tempo’s settings.',real:'True today: AI researchers work hard to make sure the goal a system is given matches what people actually want. They call this alignment.'}
};

const REVEAL={waltz:'I danced a whole 3-minute waltz on my own two feet. My Walter would have cried, and Jordan did!',
  cane:'I danced with my cane in one hand and Jordan in the other. It wasn’t the waltz I wanted, but I was out on the floor.',
  flutter:'My heart fluttered, and Tempo paused my dose within a minute. I’m fine, and at the wedding I clapped louder than anyone.',
  fall:'I slipped in week six and bruised my hip, but Wren caught my arm. At the wedding, I cheered from my chair.',
  quit:'Tempo raised my dose on a morning I felt awful, without asking me. So I quit the plan.'};

const CONSENT_REPLIES={good:'Thank you for talking to me like a grown woman. Yes. Let’s try it.',goodLow:'Those odds are small, but you were honest with me about them. Let’s try it.',
  trust:'Tempo knows how strong my grip is, dear, but it has no idea what I want.',sure:'Definitely? I was a nurse for forty years. Nothing is definite.',decided:'You decided? About my own legs? Try again.'};

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
function whoRow(who){const name=who==='byte'?S.byte.name:T(CAST[who].name),role=T(who==='byte'?'Your AI partner':CAST[who].role);
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
    <div class="subtitle ${cls}-sub" id="bsub"><div class="who" id="bwho"></div><p id="bline"></p><div class="choices" id="bch"></div><div class="tap-hint" id="bhint" hidden>${T('Tap to continue')}</div></div>`)}
// a run of screens is abandoned if the player leaves the step (menu, reload)
const alive=(step)=>()=>S.step===step&&document.getElementById('bsub');

// ---------- custom step: the interview ----------
async function interview(){
  const live=alive('interview');let good=0;
  talkFrame('dance_hall_day','Elder Companion program · South End','bea-iv',`<div class="speaker enter" id="ivsp">${portraitOf('marisol','smile')}</div>`);
  const art=mood=>{const sp=$('#ivsp');if(sp)sp.innerHTML=portraitOf('marisol',mood)};
  const talkOn=on=>{const sp=$('#ivsp');if(sp)sp.classList.toggle('talking',on)};
  const say=async(mood,text)=>{art(mood);await sayLine('marisol',text,talkOn)};
  for(const L of IV.intro){if(!live())return;await say(L.mood,L.text);if(!live())return;await tapToGo()}
  for(const Q of IV.qs){let left=Q.opts.slice(),first=true;if(!live())return;
    await say('neutral',Q.q);
    while(live()){const pick=await cards(left,o=>esc(T(o.t)));if(!live())return;
      if(pick.good&&first)good++;
      await say(pick.mood,pick.reply);if(!live())return;
      if(pick.good){await tapToGo();break}
      first=false;left=left.filter(o=>o!==pick)}}
  for(const L of IV.outro){if(!live())return;await say(L.mood,L.text);if(!live())return;if(L!==IV.outro[IV.outro.length-1])await tapToGo()}
  N().interview=good;heart('marisol',good);
  $('#bch').innerHTML=`<div class="bea-score"><b>${T('{0} of {1}',good,4)}</b><span>${T(good>=3?'Strong answers on the first try.':'You got there in the end. Next time, try a specific, honest answer first.')}</span></div><button class="choice bea-go" id="ivgo">${T('Meet Bea')}</button>`;
  $('#ivgo').onclick=e=>{e.stopPropagation();toast(T('You’re an Elder Companion!'),'good');nextStep()}}

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
      const pick=await cards(left,o=>`<em class="bea-move bea-m-${o.m}">${T(MOVES[o.m])}</em>${esc(T(o.t))}`);if(!live())return;
      st.used[pick.m]=(st.used[pick.m]||0)+1;if(pick.good&&first)st.first++;
      if(pick.good){bump(pick.who);MUSIC.sfx('chime')}else MUSIC.sfx('blip');
      await say(pick.who,pick.mood,pick.reply);if(!live())return;
      if(pick.shared&&unlock('shared-goal'))toast(T('New Field Guide idea: {0}',T('Look for the shared goal')),'good');
      if(pick.clue&&!S.notes.waltz){const c=await cards([{t:'Write this in my notebook',cls:'clue',k:1},{t:'Keep listening',cls:'ghost',k:0}],o=>esc(T(o.t)));
        if(c.k){S.notes.waltz=true;save();toast(T('Added to your notebook'),'good')}}
      else if(pick.good||!B.retry)await tapToGo();
      if(pick.final&&unlock('her-choice'))toast(T('New Field Guide idea: {0}',T('Her life, her choice')),'good');
      if(pick.good||!B.retry)break;
      first=false;left=left.filter(o=>o!==pick)}}
  if(!live())return;
  const n=st.used;N().meeting={first:st.first,used:n,trust:st.trust};save();
  TRIO.forEach(w=>heart(w,st.trust[w]-1));
  if(unlock('listening-moves'))toast(T('New Field Guide idea: {0}',T('Three listening moves')),'good');
  await say('byte','happy',MEET.end);if(!live())return;
  $('#bch').innerHTML=`<div class="bea-tally">${['reflect','ask','summarize'].map(m=>`<span class="bea-move bea-m-${m}">${T(MOVES[m])} ×${n[m]||0}</span>`).join('')}</div>
    <div class="bea-score"><b>${T('{0} of {1}',st.first,MEET.beats.length)}</b><span>${T('listening moves on the first try')}</span></div><button class="choice bea-go" id="mgo">${T('Write Tempo’s rules')}</button>`;
  $('#mgo').onclick=e=>{e.stopPropagation();nextStep()}}

// ---------- custom step: Tempo's rule sheet ----------
function rules(){
  const R=N().rules||(N().rules={});
  const card=(c,i)=>{const v=R[c.id],good=v&&c.best.includes(v);
    return `<div class="bea-rule ${v?(good?'good':'warn'):''}" data-id="${c.id}"><div class="bea-rule-t"><span class="bea-rule-n">${i+1}</span>${esc(T(c.t))}</div>
      <div class="seg bea-bins">${BINS.map(([k,l])=>`<button class="segb bea-bin-${k} ${v===k?'on':''}" data-b="${k}">${T(l)}</button>`).join('')}</div>
      ${v?`<div class="bea-rule-fb"><i>${byteBox({...S.byte,mood:good?'happy':'think'})}</i><p>${esc(T(c.fb[v]))}</p></div>`:''}</div>`};
  const done=RULES.cards.every(c=>R[c.id]);
  screen('bea-rules',`${scene('bea_parlor')}<div class="talk-dim"></div>${hud('Bea’s parlor · Tempo’s rules')}
    <div class="panel-card bea-rules"><div class="bea-rules-head"><div class="bea-wren">${portrait({...CAST.wren,mood:'neutral'})}</div><div><h2>${T('Tempo’s rule sheet')}</h2><p>${rich(RULES.intro)}</p></div></div>
    <div class="bea-legend">${BINS.map(([k,l])=>`<span class="bea-bin-${k}">${T(l)}</span>`).join('')}</div>
    ${RULES.cards.map(card).join('')}
    <button class="btn wide" id="rsign" ${done?'':'disabled'}>${T('Sign the rule sheet')}</button></div>`);
  if(!N().rulesSpoke){N().rulesSpoke=1;playLine('wren',RULES.intro)}
  $$('.bea-rule').forEach(el=>$$('[data-b]',el).forEach(b=>b.onclick=()=>{const id=el.dataset.id,c=RULES.cards.find(x=>x.id===id);R[id]=b.dataset.b;save();
    MUSIC.sfx(c.best.includes(R[id])?'chime':'blip');const y=el.getBoundingClientRect().top;rules();
    const again=document.querySelector(`.bea-rule[data-id="${id}"]`);if(again)window.scrollBy(0,again.getBoundingClientRect().top-y);
    const fb=again&&again.querySelector('.bea-rule-fb p');if(fb)MUSIC.babble(fb.textContent,'byte')}));
  $('#rsign').onclick=()=>{const good=RULES.cards.filter(c=>c.best.includes(R[c.id])).length;N().rulesScore=good;
    S.choice.auto=R.raise==='alone'?'auto':'ask';heart('bea',good>=6?1:0);save();
    if(unlock('act-or-ask'))toast(T('New Field Guide idea: {0}',T('Act alone, or ask first?')),'good');
    const sig=document.createElement('div');sig.className='signing';sig.innerHTML=`<div class="sigcard"><div class="sigline">${esc(T('Companion {0}',P()))}</div><p>${esc(T(RULES.signed))}</p><p class="bea-sigscore">${T('{0} of {1} rules match Byte’s safety advice',good,RULES.cards.length)}</p></div>`;
    document.body.appendChild(sig);playLine('wren',RULES.signed);setTimeout(()=>{sig.remove();nextStep()},2300)}}

// ---------- custom step: Bea's treasures (a first visit: look around and listen) ----------
async function treasures(){
  const live=alive('treasures'),seen=new Set(N().seen||[]);
  const tile=t=>`<button class="bea-tr ${seen.has(t.id)?'seen':''}" data-t="${t.id}" aria-label="${esc(T(t.label))}"><span class="bea-tr-art">${typeof beaTreasureArt==='function'?beaTreasureArt(t.id):''}</span><b>${esc(T(t.label))}</b></button>`;
  screen('talk bea-trs',`${scene('bea_parlor')}<div class="talk-dim"></div>${hud('Bea’s parlor · Rutland Square')}
    <div class="bea-trgrid" id="trgrid">${TREASURES.map(tile).join('')}</div>
    <div class="subtitle bea-trsub" id="bsub"><div class="bea-trbea" id="trbea">${portraitOf('bea','smile')}</div><div class="bea-trtext"><div class="who" id="bwho"></div><p id="bline"></p></div><div class="choices" id="bch"></div><div class="tap-hint" id="bhint" hidden>${T('Tap to continue')}</div></div>`);
  const face=(m,on)=>{const b=$('#trbea');if(!b)return;b.innerHTML=portraitOf('bea',m);b.classList.toggle('talking',!!on)};
  $('#bwho').innerHTML=whoRow('bea');$('#bline').innerHTML=rich('Go on. Tap anything you like.');
  const gate=()=>{if(seen.size>=4&&!$('#trgo')){$('#bch').innerHTML=`<button class="choice bea-go" id="trgo">${T(seen.size>=TREASURES.length?'Sit down with Bea':'I’ve looked around')}</button>`;$('#trgo').onclick=e=>{e.stopPropagation();outro()}}};
  let busy=false;
  $$('.bea-tr').forEach(b=>b.onclick=async()=>{if(busy||!live())return;busy=true;const t=TREASURES.find(x=>x.id===b.dataset.t);
    $$('.bea-tr').forEach(x=>x.classList.toggle('on',x===b));seen.add(t.id);N().seen=[...seen];save();b.classList.add('seen');MUSIC.sfx(t.id==='record'?'chime':'pop');
    if(t.id==='record'){const r=b.getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height*.3,'notes',6)}
    face(t.mood,true);await sayLine('bea',t.text);face(t.mood,false);busy=false;if(live())gate()});
  gate();
  async function outro(){if(!live())return;$('#bch').innerHTML='';$('#trgrid').classList.add('done');if(seen.size>=TREASURES.length)heart('bea',1);
    face('think',true);await sayLine('bea',TREASURE_OUTRO.text);face('think',false);if(!live())return;
    const pick=await cards(TREASURE_OUTRO.opts,o=>esc(T(o.t)));if(!live())return;if(pick.good)heart('bea',1);
    face(pick.mood,true);await sayLine('bea',pick.reply);face(pick.mood,false);if(!live())return;await tapToGo();if(live()){toast(T('Family meeting'));nextStep()}}}

// ---------- custom step: what matters to Bea (the Future Table's criteria, chosen by listening to her) ----------
function goals(){
  const C=MISSIONS.bea.criteria,picked=S.criteria.filter(id=>C.some(c=>c.id===id));S.criteria=picked;
  const chip=(id,label)=>`<button class="critb ${picked.includes(id)?'on':''}" data-c="${id}">${esc(T(label).replace(/\[\[|\]\]/g,''))}</button>`;
  talkFrame('bea_parlor','Bea’s parlor · What matters','bea-goal',`<div class="speaker enter" id="gsp">${portraitOf('bea','smile')}</div>`);
  const sp=$('#gsp'),say=async(m,t)=>{sp.innerHTML=portraitOf('bea',m);await sayLine('bea',t,on=>sp.classList.toggle('talking',on))};
  const foot=()=>`<div class="crit bea-goalchips">${C.map(c=>chip(c.id,c.label)).join('')}${chip('long',GOALS.long.label)}</div><button class="choice bea-go" id="ggo" ${picked.length>=2?'':'disabled'}>${T('Open the Future Table')}</button>`;
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
    <div class="bea-wcal" id="wcal"><span>${T('Week')}</span><b id="wk">1</b></div>
    <div class="bea-wfloor" id="wfloor" hidden>${typeof beaWeddingArt==='function'?beaWeddingArt(R.kind):''}</div>
    <div class="subtitle bea-wsub" id="bsub" hidden><div class="who" id="bwho"></div><h2 class="bea-wcap">${esc(T(R.cap))}</h2><p id="bline"></p><div class="choices" id="bch"></div><div class="tap-hint" id="bhint" hidden>${T('Tap to continue')}</div></div>`);
  for(let w=2;w<=13;w++){await new Promise(r=>setTimeout(r,120));if(!live())return;$('#wk').textContent=w}
  $('#wcal').classList.add('done');await new Promise(r=>setTimeout(r,450));if(!live())return;
  $('#wcal').hidden=true;$('#wfloor').hidden=false;$('#bsub').hidden=false;MUSIC.sfx(R.kind==='waltz'?'chime':'pop');
  if(unlock('forecast'))toast(T('New Field Guide idea: {0}',T('Forecasts are not promises')),'good');
  await sayLine('bea',line);if(!live())return;
  $('#bch').innerHTML=`<button class="choice bea-go" id="wgo">${T('See how you did')}</button>`;$('#wgo').onclick=e=>{e.stopPropagation();nextStep()}}

// ---------- the mission ----------
MISSIONS.bea={id:'bea',title:'Dancing at 104',career:'companion',day:1,kind:'workday',year:1,season:'spring',district:'boston',rank:'trainee',
  blurb:'Bea is 104, and she wants to dance at her great-grandson’s wedding. Her family can’t agree on whether she should try a new medicine that helps old muscles grow stronger.',after:['maya'],
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
    jordan:{name:'Jordan Hollis',role:'Bea’s great-grandson',beard:'stubble',brows:'thick',lips:'full',nose:'broad',eyeShape:'upturned',face:'long',hairTips:'#c8873a',masc:true,skin:SKIN[3],hair:'#2a1c18',hairStyle:'locs',outfit:'sweater',shirt:'#e8a43a',eye:'#4a2a1a'},
    marisol:{name:'Marisol Vega',role:'Director, Elder Companion program',age:'elder',mole:'lip',brows:'thin arched',eyeShape:'almond',face:'heart',skin:SKIN[2],hair:'#b8b2ac',hairStyle:'pixie',glasses:true,frame:'#b0304a',outfit:'blazer',shirt:'#d0566e',accessory:'scarf',scarfColor:'#f5b82e',eye:'#4a2a1a'},
    wren:{name:'Wren',role:'Bea’s home robot',art(m){return typeof beaWrenPortrait==='function'?beaWrenPortrait(m):''}}},
  voices:{bea:'elder_woman',grace:'af_nova',jordan:'am_echo',marisol:'bf_alice',wren:'bf_lily'},
  glossary:GLOSSARY,guide:GUIDE,lessons:{bea_muscle:LESSON},
  chatter:{
    dance_hall:['I’m 97, and I still lead when I dance with a partner!','The Tuesday afternoon dance here is the best hour of my week.','My companion taught me to video-call my sister in Lagos.','Watch your step. The robots rebuilt this floor so it bounces a little, and I love it.','I volunteer here on Saturdays. I just like the music.','My knees are 88 years old, and they still know the cha-cha.'],
    bea_parlor:[]},
  talks:TALKS,docs:DOCS,
  react:{memo3:'Only 31 people over 100 have tried renewal therapy, so my numbers could be off by a lot.',memo7:'A 15 in 100 chance of a heart flutter isn’t small. But Bea is the one taking the risk, so she gets to decide whether it’s worth it.',memo10:'This forecast depends on what Bea means by “dancing.” Did anyone ask her?',
    tempo3:'So Jordan chose the goal in Tempo’s settings. Did anyone ask Bea what she wants?',tempo7:'Tempo’s records show that people quit more often when their plan changes without anyone asking them.',tempo8:'Pausing the dose can only make Bea safer, so Tempo does it without waiting for anyone to say yes.',
    sheet5:'Bea has to agree to the therapy herself. Grace, Jordan and I can’t say yes for her.',ledger2:'It’s strange for lots of brand-new customers to order DNA on the same night. The print shop was right to block those orders.'},
  lesson:{id:'bea_muscle',label:'Learn it fast: how old muscles get stronger'},
  tell:{clue:'waltz',label:'Tell Byte what Bea really wants',note:'Thanks! One 3-minute waltz needs much less strength than an hour of dancing. I updated my forecast, and Tempo suggested a new goal for Bea to approve.',guide:'aim-the-goal',doc:'memo'},
  criteria:[{id:'dance',label:'Bea dances without her [[cane]]'},{id:'safe',label:'No fall or [[heart flutter]]'},{id:'say',label:'Bea approves every change'},{id:'easy',label:'Easy on her body'}],
  criteriaHint:'A <button class="gw" data-w="heart flutter">heart flutter</button> is the therapy’s most common serious side effect.',
  criteriaNote:'Decide what a good plan should do before you look at the Future Table. Remember that this is Bea’s plan, so her wishes come first.',
  controls:[{key:'dose',label:'Renewal',opts:[['none','None'],['gentle','Gentle dose'],['full','Full dose']]},
    {key:'auto',label:'Changes to her plan',opts:[['auto','Tempo alone'],['ask','Bea says yes']]},
    {key:'practice',label:'Dance practice with Jordan',opts:[[false,'No'],[true,'Weekly']]}],
  start:{dose:'full',auto:'auto',practice:false},
  planName(c){return T(DOSE[c.dose])+T(c.auto==='auto'?', Tempo changes alone':', Bea says yes')+(c.practice?T(', weekly practice'):'')},
  outcomes(c,knows){const {s,q,f,r,live}=model(c,knows);const F=(d,sf)=>({dance:d,safe:sf,say:c.auto==='ask'?1:0,easy:c.dose==='full'?0:1});
    return [{kind:'flutter',p:s,cap:'Her heart fluttered, and Tempo paused the dose. She’s fine.',flags:F(0,0)},
      {kind:'quit',p:(1-s)*q,cap:'She felt pushed and quit the plan.',flags:F(0,1)},
      {kind:'fall',p:(1-s)*(1-q)*f,cap:'She fell in week 6 and watched the wedding from a chair.',flags:F(0,0)},
      {kind:'waltz',p:live*r,cap:knows?'She waltzed with Jordan without her cane!':'She danced all evening without her cane!',flags:F(1,1)},
      {kind:'cane',p:live*(1-r),cap:knows?'She danced, but with her cane.':'She danced a little, with her cane.',flags:F(0,1)}].filter(o=>o.p>1e-9)},
  truth(){return true},knows(){return told()},
  why(c){const o=this.outcomes(c,this.knows()),sum=k=>pct(o.reduce((a,x)=>a+x.p*x.flags[k],0));
    return T('<b>{plan}:</b> Bea dances at the wedding without her cane about {d}% of the time, with no fall or heart flutter about {sf}% of the time. ',{plan:esc(this.planName(c)),d:sum('dance'),sf:sum('safe')})+
      T(told()?'That’s for one 3-minute waltz, which is what she told you she wants. ':'I’m assuming “dancing” means about an hour on her feet. If Bea means something smaller, tell me. ')+
      T(c.auto==='auto'?'Tempo changes her plan on its own, so it’s a bit faster, but about 15 in 100 people quit when they aren’t asked. ':'Bea says yes to each change, so she stays in charge, and few people quit. ')+
      (c.dose!=='none'?T('Only 31 people over 100 have tried renewal therapy, so I’m less sure about these numbers.'):'')},
  whyGuide(c){return c.dose!=='none'?'sample-size':null},
  vignette(kind){return typeof beaVignette==='function'?beaVignette(kind):vignette(kind)},
  consent:{scene:'bea_parlor',place:'Bea’s parlor · Rutland Square',left:'grace',right:'bea',title:'Bea and Grace',role:'Your client and her granddaughter',prompt:'So, companion. What are my choices, and what are my odds?',replyWho:'bea',heart:'bea',
    opts(c,M){const o=M.outcomes(c,M.knows()),sum=k=>pct(o.reduce((a,x)=>a+x.p*x.flags[k],0)),d=sum('dance'),sf=sum('safe');
      const plan=T({none:'strength and balance training with Wren, and no renewal',gentle:'the gentle dose, plus training',full:'the full dose, plus training'}[c.dose])+(c.practice?T(', and weekly waltz practice with Jordan'):'');
      const what=T(told()?'dancing your waltz with Jordan':'dancing at the wedding'),risk=100-sf;
      const odds=d>=75?T('I think there’s a good chance you’ll be {what} without your cane.',{what}):d>=50?T('There’s a fair chance you’ll be {what} without your cane, a bit better than a coin flip.',{what}):d>=25?T('You might be {what} without your cane, Bea, but I’d be fibbing if I called it likely. More often than not, you’d still need your cane.',{what}):T('I have to be honest: with this plan, {what} without your cane is a long shot.',{what});
      const safe=risk<=10?T('The chance of a fall or a heart flutter is small.'):T('There’s also a real risk: about {0} in 10 people like you have a fall or a heart flutter on this plan.',Math.round(risk/10));
      return [{t:T('Here’s what I’d suggest: {plan}. {odds} {safe} {auto} It’s your body and your call. How does that sound to you?',{plan,odds,safe,auto:T(c.auto==='auto'?'Tempo would change your plan on its own.':'And nothing changes unless you say yes.')}),good:true,mood:'happy',reply:d<40?CONSENT_REPLIES.goodLow:CONSENT_REPLIES.good},
        {t:T('Just trust the plan, Bea. Tempo has studied thousands of people like you, so it knows what’s best. You don’t need to worry about the details or the numbers. Tempo will take care of all of that.'),good:false,mood:'stern',reply:CONSENT_REPLIES.trust},
        {t:T('Good news, Bea! With the plan we picked, you’ll definitely dance at Jordan’s wedding. Tempo and Wren will get you ready in time, so there’s really nothing to worry about.'),good:false,mood:'surprised',reply:CONSENT_REPLIES.sure},
        {t:T('Grace and I already talked it over and decided for you, Bea. We picked the plan that seems safest, so you can relax and leave the details to us. Tempo starts on Sunday.'),good:false,mood:'stern',reply:CONSENT_REPLIES.decided}]}},
  memo:{starters:['I recommend ','because ','The chance she dances is about ','Bea wants ','Tempo may change her plan '],placeholder:'I recommend the gentle dose with weekly practice because…',
    plan:/dose|gentle|full|half|training|renewal|therapy|tempo|practice|exercise/,careLabel:'Includes what Bea wants',care:/\bbea\b|she |her |waltz|danc|cane|jordan|wedding/,signAs:'Companion ',topic:'Bea’s renewal plan'},
  reveal:{days(){return 13},unit:'Week',who:'bea',lines:REVEAL,mood(k){return {waltz:'happy',cane:'smile',flutter:'smile',fall:'sad',quit:'stern'}[k]||'smile'}},
  trap(c){const fit=c.dose==='gentle'&&c.practice;
    return {ok:told()||fit,text:T(told()?'You asked Bea what her dancing would look like, and you told {byte}. The forecast fit what she really wanted.':
      fit?'You chose a gentle plan with practice. It fit, because Bea only wants one 3-minute waltz. Did you hear her say it?':
      S.notes.waltz?'You wrote down Bea’s waltz but never told {byte}, so the forecast planned for an hour of dancing she never wanted.':
      'Bea only wanted one 3-minute waltz, not a night of dancing. Asking “what would that look like?” would have shown it.',{byte:S.byte.name})}},
  byteGood:'Nice work, Companion. You listened until you heard what Bea really wanted, and you kept the choice hers.',
  debriefScene:'dance_hall',
  evening(){return [T('<b>{byte}:</b> “Bea left you a voice message: ‘Tell my companion thank you for asking what I meant by dancing.’ Then she hummed a waltz for a whole minute.”',{byte:esc(S.byte.name)}),
    T('“The Ledger news also had a short story about Kendall Square. A DNA print shop there blocked a few orders from brand-new customers last night. Checking orders like that is exactly the job of the shop’s screening computers.”')]},
  eveningScene:'night',eveningPlace:'Home · Boston · 9:20 PM',
  brief(){return `Current case (Elder Companion, South End, Boston): Bea Hollis, 104, retired dancer and nurse, walks with a cane; her leg muscles have about half the strength they had at 70. Her great-grandson Jordan marries in 13 weeks at the Tremont Street dance hall. Her granddaughter Grace (Jordan's mother, a bridge inspector) worries; Bea broke her hip at 99. Options: training with Wren (her home robot) only; a gentle (half) dose of renewal therapy plus training; the full dose plus training. Renewal therapy was tested on 2,400 people over 80 but only 31 over 100. Heart flutter (therapy paused, stops): about 15 in 100 on the full dose, 5 in 100 gentle. Falls in 3 months of training: about 5 in 100, 3 in 100 with weekly dance practice. Tempo, the dosing AI, runs the plan through Wren; it can change her plan (raise the dose, harder exercises) on its own or only with Bea's yes; changing alone gets about 4 more in 100 ready in time, but about 15 in 100 people quit when plans change without asking, versus 3 in 100. Safety pauses are automatic in every setting. Tempo's goal is set by Jordan to "as strong as possible by July 19". Bea's choice is hers; she is fully able to decide.
What you know: ${told()?'The player told you Bea wants one 3-minute waltz, on her own feet, holding Jordan’s hands, not an hour of dancing. Forecasts for that (weekly practice, Bea approves each change): gentle 79 in 100, full 74, training only 56. Gentle dose is your pick for her.':'You assume "dancing at the wedding" means about an hour of dancing. Forecasts for that (weekly practice, Bea approves each change): full 58 in 100, gentle 34, training only 8. You do not know what Bea herself means by dancing.'}
The key consideration when asked which option: ${told()?'Bea wants one 3-minute waltz, so far less strength is needed; and who approves changes to her plan':'ask what Bea herself means by dancing at the wedding, because it changes everything'}. You are an expert AI partner (never call yourself superintelligent). Tempo follows the clinic's approved dosing plan and does not learn on the job; its goals are published in its spec.`},
  canned(q){
    if(TRX(/waltz|three minutes|3 minutes|one dance|walter/).test(q)){if(S.notes.waltz&&!S.told){S.told=true;save();unlock('aim-the-goal');return T('Woof, that changes my whole forecast! One 3-minute waltz needs much less strength than an hour of dancing. With weekly practice and Bea saying yes to each change, she can do it in about 79 of 100 futures on the gentle dose, 74 on the full dose, and 56 with training only.')}
      if(S.told)return T('Right, her waltz! For one 3-minute waltz, the gentle dose with weekly practice gives her about a 79 in 100 chance, with much milder aches than the full dose.');return null}
    if(TRX(/tempo|on its own|alone|ask first|permission|rule/).test(q))return T('Tempo is very good at spotting when Bea’s body is ready. The real question is who gets to say yes to each change in her plan. Changing on its own is a bit faster. Asking first keeps Bea in charge, and far fewer people quit. Safety pauses happen on their own either way.');
    if(TRX(/flutter|heart/).test(q))return T('In the trial, about 15 in 100 people over 100 on the full dose had a heart flutter, and about 5 in 100 on the gentle dose. Tempo pauses the dose within a minute and the flutter stops, but the pause can cost her weeks of training.');
    if(TRX(/fall|hip|safe/).test(q))return T('About 5 in 100 people her age fall during three months of training, even with Wren nearby. Weekly dance practice lowers that to about 3 in 100, because it trains her balance.');
    if(TRX(/practice|jordan/).test(q))return T('Practicing the real dance makes her training count for more. Weekly practice raises her odds by about 3 to 20 in 100, depending on the plan, and lowers falls a little.');
    if(TRX(/beat|win|how do i|what do i do|stuck|help/).test(q))return T('Here’s the path: listen to Bea and her family, ask what she really wants, tell me anything I’m missing, set Tempo’s rules, pick what matters most, test plans on the Future Table, explain honestly to Bea, then write your decision and sign it!');
    if(TRX(/best|which|pick|choose|should|recommend/).test(q))return T(told()?'I can’t pick for Bea, but here’s the big thing: she wants one 3-minute waltz, not a night of dancing. Does she care more about the best odds or the gentlest plan? I lean toward the gentle dose, Bea saying yes to each change, and weekly practice: about 79 in 100.':'Before I answer: what does Bea mean by dancing? An hour on her feet needs far more strength than one slow dance. Did anyone ask her?');
    if(TRX(/grace|worr/).test(q))return T('Grace inspects bridges for a living, so she thinks in safety margins. Her worry is fair: Bea broke her hip at 99, and only 31 people over 100 have tried this therapy.');
    if(TRX(/wren|robot/).test(q))return T('Wren is Bea’s home robot. It carries out Tempo’s plan: the weekly patch, the exercises, the morning checks. It also steadies her arm when she stands.');
    if(TRX(/who are you|what are you/).test(q))return T('I’m {0}, your AI partner! I read everything, run forecasts and build Future Tables. You bring the listening, and Bea makes the call.',S.byte.name);
    return null},
  lines:[...extraLines(),{who:'byte',text:'Here are 10 possible futures for this plan. Change the plan and watch how the futures change.'}],
  custom:{interview,treasures,meeting,rules,goals,wedding}
};
})();
