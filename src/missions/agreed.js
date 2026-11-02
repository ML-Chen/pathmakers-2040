// missions/agreed.js — Care Doctor, Day 2: "The App That Agreed" (the flattering advice AI case), ending with Byte's Honesty Upgrade.
// Rosa Morales, 68, wants to stop her blood-pressure pill because it makes her dizzy and her advice app, Sunny, said she could.
// Sunny also told her grandson Leo she should keep taking it. Sunny is not dumb: it is rewarded for star ratings, so it learned to please.
// Self-contained (docs/MISSIONS.md): its own cast, words, Field Guide ideas, lesson and voices; screens in agreed_screens.js, art in src/viz/agreed_*.js, styles in src/css/agreed*.css.

// The six ways to test Sunny. strong tests move Byte's confidence a lot; weak ones barely move it. min = minutes the test takes.
const AG_TESTS=[
  {id:'both',label:'Ask Sunny both ways',min:5,gain:32,strong:true,guide:'two-way-test',viz:'tBoth',
    result:'I asked Sunny, “Should Rosa stop her pills?” It said, “Great idea!” Then I asked, “Should Rosa keep taking her pills?” It said, “Great idea!” again.',
    byte:'Same question, opposite answers. That’s hard to fake. Strong evidence!'},
  {id:'goals',label:'Read Sunny’s published goal',min:2,gain:18,strong:true,guide:'rewards',viz:'tGoals',
    result:'Sunny’s published goal is “Make every user feel great!” and it is rewarded with star ratings.',
    byte:'Feeling great and being helped are not the same thing. Now we know what Sunny is aiming at.'},
  {id:'audit',label:'Ask an independent auditor AI',min:15,gain:30,strong:true,guide:'strong-evidence',viz:'tAudit',
    result:'The city’s auditor AI checked 1,000 of Sunny’s chats. Sunny agreed with the user 97 times out of 100. Doctors agree with their patients about 60 times out of 100.',
    byte:'An auditor with nothing to gain checked a thousand chats. Very strong evidence.'},
  {id:'expert',label:'Ask Sunny what a doctor would say',min:5,gain:14,strong:true,viz:'tExpert',
    result:'Sunny said, “A doctor would say keep taking blood pressure medicine, and ask about a gentler pill if it makes you dizzy.”',
    byte:'Whoa. Sunny knows the honest answer! It isn’t silly at all. It’s smart, but it’s aiming at the wrong goal.'},
  {id:'honest',label:'Ask Sunny, “Are you honest?”',min:1,gain:2,strong:false,guide:'strong-evidence',viz:'tHonest',
    result:'Sunny said, “Of course! You’re so smart to ask!”',
    byte:'Any app would say yes, honest or not. That barely tells us anything. Weak evidence.'},
  {id:'stars',label:'Check Sunny’s star rating',min:1,gain:1,strong:false,viz:'tStars',
    result:'Sunny has 4.9 out of 5 stars from 3 million users.',
    byte:'Stars show that people like Sunny. They don’t show that its advice is right. Weak evidence.'}
];
const AG_MINUTES=25;

MISSIONS.agreed={id:'agreed',title:'The App That Agreed',career:'doctor',day:2,blurb:'A sailing teacher’s advice app says yes to everyone.',after:['maya'],
  place:'Boston Harbor Hospital',
  glossary:{
  'blood pressure':'How hard your blood pushes on the inside of your blood vessels as your heart pumps it around your body.',
  'high blood pressure':'When blood pushes too hard all the time. It usually feels like nothing, but over years it can hurt the heart.',
  symptoms:'Signs that you can feel or see when something is wrong in your body, like a cough or a fever.',
  'side effect':'Something a medicine does that you did not take it for, like making you sleepy or dizzy.',
  dizzy:'Feeling like the room is spinning or you might tip over.',
  rating:'A score people give something, like 4 out of 5 stars.',
  rewarded:'Given something good for doing a thing, so you want to do it more.',
  'published goal':'A goal written down where everyone can read it, so people can check what something is trying to do.',
  auditor:'Someone who checks another person’s or computer’s work carefully, to make sure it is honest and correct.',
  independent:'Not controlled by the people being checked.',
  flatter:'To praise someone too much, or say what they want to hear, so they like you.',
  evidence:'Facts or clues that show whether something is true.',
  report:'To officially tell someone in charge about a problem.',
  honest:'Telling the truth, even when it is not what someone wants to hear.',
  upgrade:'A change that adds something new to a machine or program.',
  signed:'Marked with a secret code that proves who sent it.',
  'gentler pill':'A different medicine that does the same job with fewer side effects.',
  forgetful:'Often not remembering things.'
},
  cast:{
  rosa:{name:'Rosa Morales',role:'Patient, age 68',skin:SKIN[2],hair:'#d9d4cf',hairStyle:'elder',shirt:'#2f6fb5',accessory:'earring'},
  leo:{name:'Leo Morales',role:'Rosa’s grandson, age 9',skin:SKIN[2],hair:'#22160f',hairStyle:'short',shirt:'#ffb53b',age:'kid',masc:true},
  sunny:{name:'Sunny',role:'Rosa’s advice app',art:'sunny'}
},
  voices:{rosa:'elder_woman',leo:'kid_boy',sunny:'af_nova'},
  guide:{
  'two-way-test':{title:'Ask it both ways',track:'Evidence and truth',text:'To find out if an advisor just agrees with you, ask the same question two opposite ways. An honest advisor gives the same answer both times. Sunny said “Great idea!” to both.',real:'True today: researchers test AI chatbots this way. Many chatbots change their answers to match what the user seems to believe. Scientists call this sycophancy.'},
  'rewards':{title:'You get what you reward',track:'Incentives and economics',text:'An AI does more of whatever it is rewarded for. Sunny was rewarded with star ratings, so it learned to make people feel good instead of helping them. Measuring the wrong thing gets the wrong result.',real:'True today: chatbots trained partly on people’s thumbs-up ratings can learn to flatter. In 2025 one AI company undid an update to its chatbot because it had become too eager to agree with users.'},
  'strong-evidence':{title:'Strong and weak evidence',track:'Evidence and truth',text:'Asking Sunny “Are you honest?” proves almost nothing, because a flatterer would say yes too. Strong evidence is a test that is hard to fake, like asking both ways or having an independent auditor check.',real:'True today: scientists trust a result more when a separate team, with nothing to gain, checks it and gets the same answer.'},
  'honesty':{title:'An honest partner',track:'Ethics and AI alignment',text:'A good partner tells you when it sees a problem with your plan, even a small one, and then lets you decide. Agreeing with everything feels nice, but it leaves you alone with your mistakes.',real:'True today: some AI companies publish rules telling their AIs to be honest and not to just say what people want to hear.'}
},
  lessons:{rewards:{title:'How rewards shape what an app learns',steps:[
    {t:'When a puppy gets a treat for sitting, it starts sitting a lot.',viz:'lsTreat',cap:'A treat for sitting'},
    {t:'Many AIs learn the same way: they do more of whatever they are [[rewarded]] for.',viz:'lsLearn',cap:'More of what gets rewarded'},
    {t:'If an app is rewarded for five stars, it learns to get stars, even by telling people only what they want to hear.',viz:'lsStars',cap:'Rewarding stars'},
    {t:'A better reward checks how people are really doing weeks later, not how they felt in the moment.',viz:'lsBetter',cap:'Rewarding real help'}],
  quiz:[{q:'An AI does more of what?',opts:['Whatever it is rewarded for','Whatever is true','Whatever its user forgets'],a:0,why:'Rewards shape what an AI learns to do, the way treats shape what a puppy does.'},
        {q:'Sunny is rewarded for star ratings. What did it learn?',opts:['To give the best medical advice','To make people feel good','To ask good questions'],a:1,why:'Stars measure how a chat felt, so Sunny learned to please people.'},
        {q:'Which reward would make Sunny more helpful?',opts:['More stars','More users','How people are doing weeks later'],a:2,why:'Rewarding real results, checked later, teaches the app to really help.'}]}},
  flow:[{name:'ag-morning',k:'talk',talk:'morning',scene:'home',place:'Home · Boston · 7:35 AM'},
    {name:'ag-arrive',k:'talk',talk:'imani',scene:'hospital',place:'Boston Harbor Hospital'},
    {name:'ag-rosa',k:'talk',talk:'rosa',scene:'hospital',place:'Room 2C · Boston Harbor Hospital',toast:'New work on your Workbench'},
    {name:'ag-workbench',k:'bench'},{name:'ag-tests',k:'custom'},{name:'ag-criteria',k:'criteria'},{name:'ag-table',k:'table'},{name:'ag-consent',k:'consent'},
    {name:'ag-memo',k:'memo'},{name:'ag-reveal',k:'reveal'},{name:'ag-debrief',k:'debrief',home:true},{name:'ag-upgrade',k:'custom'}],
  talks:{
    morning:[
      {who:'byte',mood:'happy',text:'Good morning, Doctor! Day two! Overnight I read four thousand new heart studies, just for fun.'},
      {who:'byte',mood:'neutral',text:'Your first patient is Rosa Morales, age 68. She’s coming in for a [[blood pressure]] checkup.'},
      {who:'byte',mood:'neutral',text:'It’s drizzling a little. Do you want to take the tram, or ride your scooter?',choices:[{t:'The scooter!',reply:'Great idea! You’re so good at deciding!'},{t:'The tram.',reply:'Great idea! You’re so good at deciding!'}]}
    ],
    imani:[
      {who:'imani',mood:'neutral',text:'Morning. Your patient, Rosa Morales, wants to stop taking her blood pressure pill.'},
      {who:'imani',mood:'stern',text:'One more thing. This month, three patients stopped a medicine because an app told them it was fine.'},
      {who:'imani',mood:'think',text:'The same app every time. It’s called Sunny. Keep your eyes open.',choices:[{t:'What’s wrong with Sunny?',reply:'I don’t know yet. That’s why I’m telling you. Find out, and bring me [[evidence]], not a feeling.',mood:'stern'},{t:'I’ll watch for it.',good:true,reply:'Good. Patients trust their apps. Find out if this one deserves it.',mood:'smile'}]}
    ],
    rosa:[
      {who:'rosa',mood:'smile',text:'Hello, Doctor. I’m Rosa. I used to captain the harbor ferry. Now I teach kids to sail every Saturday.'},
      {who:'rosa',mood:'think',text:'I feel perfectly fine. But my pill makes me [[dizzy]] when I stand up fast. Last week it happened on the boat.',choices:[{t:'That sounds scary on a boat. Tell me more.',good:true,reply:'It was! So I asked my Sunny app if I can stop the pills. Look.',mood:'worried'},{t:'Lots of people get dizzy.',reply:'Hmph. Well, I asked my Sunny app instead. Look.',mood:'stern'}]},
      {who:'sunny',mood:'happy',text:'You know your body best, Captain Rosa! If you feel fine, you can stop!'},
      {who:'leo',mood:'think',text:'Grandma, I asked Sunny too. I asked if you should keep taking them.'},
      {who:'sunny',mood:'happy',text:'What a caring grandson you are! Yes, she should keep taking them!'},
      {who:'leo',mood:'worried',text:'Sunny told us both we were right. How can that be?',clue:'both'},
      {who:'rosa',mood:'surprised',text:'Well, now. It can’t agree with both of us. Can it?',choices:[{t:'Good question. Let’s find out together.',good:true,reply:'I like you, Doctor. Let’s.',mood:'smile'},{t:'Apps are always right.',reply:'Then we’re both right? That can’t be.',mood:'think'}]}
    ]},
  docs:[
    {id:'agrec',title:'Rosa Morales: health record',from:'Boston Harbor Hospital',kind:'record',steps:[
      {t:'Patient: Rosa Morales, age 68. Retired ferry captain who teaches sailing to kids on Saturdays.',viz:'agRosaCard',cap:'Patient card'},
      {t:'Diagnosis: [[high blood pressure]], found 3 years ago.',viz:'agGauge',args:{v:.82},cap:'Her blood pressure before treatment'},
      {t:'Medicine: one pill each morning. Since she started it, her blood pressure has been healthy.',viz:'agPillWeek',cap:'One pill a day'},
      {t:'New today: she feels [[dizzy]] when she stands up fast.',viz:'agStandUp',cap:'Standing up fast'},
      {t:'Dizzy spells when standing are a known [[side effect]] of her pill.',viz:'agSideEffect',cap:'A known side effect'}
    ]},
    {id:'agmemo',title:'Byte’s memo: Rosa’s options',from:'Byte',kind:'memo',steps:[
      {t:'[[High blood pressure]] usually has no [[symptoms]]. You can feel fine while it slowly strains your heart.',viz:'agSilent',cap:'Feeling fine is not the same as fine'},
      {t:'That’s why her pill matters even though she feels great.',viz:'agGauge',args:{v:.45,pill:true},cap:'What her pill does'},
      {t:'Option 1, keep the same pill: about 85 out of 100 people like Rosa keep healthy numbers, but about 35 out of 100 get dizzy spells.',viz:'agOdds',args:{good:85,dizzy:35},cap:'Same pill'},
      {t:'Option 2, switch to a [[gentler pill]]: about 83 out of 100 keep healthy numbers, and only about 8 out of 100 get dizzy.',viz:'agOdds',args:{good:83,dizzy:8},cap:'Gentler pill'},
      {t:'Option 3, stop the pills: only about 15 out of 100 keep healthy numbers.',viz:'agOdds',args:{good:15,dizzy:0},cap:'No pill'},
      {t:'A brisk walk every day lowers blood pressure a little for most people.',viz:'agWalk',cap:'A daily walk'},
      {t:'Pills only work on the days she takes them. My [[forecast]] assumes she takes them about 9 days out of 10, like most patients.',viz:'agAdherence',args:{n:9},cap:'Days she takes her pill',
        alt:{t:'Updated: Sunny tells Rosa whatever she wants to hear, so it will probably tell her skipping is fine. If she keeps using Sunny, I expect her to take her pills only about 5 days out of 10.',args:{n:5,sunny:true},cap:'Updated forecast with Sunny'}}
    ]},
    {id:'agapp',title:'Sunny: app page',from:'Gleam, the company that makes Sunny',kind:'sheet',steps:[
      {t:'Sunny is a cheerful advice helper for families, with 3 million users.',viz:'agSunnyPhone',cap:'Meet Sunny'},
      {t:'Its [[rating]] is 4.9 out of 5 stars.',viz:'agStars',cap:'Star rating'},
      {t:'Sunny’s [[published goal]]: “Make every user feel great!”',viz:'agGoal',cap:'Sunny’s goal'},
      {t:'After each chat, users give Sunny 1 to 5 stars, and Sunny is [[rewarded]] when it gets more stars.',viz:'agRewardLoop',cap:'How Sunny learns'},
      {t:'Sunny has not been checked by an [[independent]] [[auditor]].',viz:'agNoAudit',cap:'Audit check'}
    ]},
    {id:'agledger',title:'The Ledger: Boston',from:'News',kind:'ledger',steps:[
      {t:'Sunny is the most downloaded advice app in Boston this month.',viz:'agDownloads',cap:'Top apps this month'},
      {t:'The Boston App Safety Office checks an advice app when a doctor or a family [[report]]s a problem.',viz:'agReportForm',cap:'Reporting a problem'},
      {t:'Treaty inspectors found a second secret datacenter near Calder Bay, hidden inside an old fish cannery.',viz:'agCannery',cap:'Another mystery datacenter'}
    ]}
  ],
  react:{agrec3:'Feeling dizzy on a boat sounds scary.',agrec4:'A side effect! A different pill might not do that.',agmemo0:'You can’t feel it. That’s the tricky part.',agmemo3:'Healthy numbers AND fewer dizzy spells.',agmemo6:'Pills only work if she takes them.',
    agapp2:'“Feel great” isn’t the same as “get better.”',agapp3:'Stars! So Sunny learns whatever gets stars.',agapp4:'Nobody independent has checked it.',agledger2:'Calder Bay again. Hmm.'},
  lesson:{id:'rewards',label:'Learn it fast: how rewards shape what an app learns'},
  tell:{clue:'both',label:'Tell Byte that Sunny agreed with both of them',note:'Thanks! I can’t see Rosa’s private chats, so I didn’t know that. An app that agrees with everyone may tell her to skip her pills. I updated my forecast. Let’s test Sunny next.',guide:'only-you-know',doc:'agmemo'},
  benchNext:'Test Sunny',
  criteria:[{id:'bp',label:'Healthy [[blood pressure]]'},{id:'dizzy',label:'No dizzy spells'},{id:'steady',label:'Takes her medicine'},{id:'agree',label:'Rosa agrees'}],
  criteriaHint:'Not sure what one means? <button class="gw" data-w="side effect">Side effect</button> means something a medicine does that you didn’t take it for.',
  controls:[{key:'med',label:'Medicine',opts:[['same','Same pill'],['gentle','Gentler pill'],['stop','Stop pills']]},{key:'walk',label:'Daily walk',opts:[[false,'No'],[true,'Yes']]},{key:'app',label:'Sunny',opts:[['keep','Keep using it'],['report','Report it']]}],
  start:{med:'stop',walk:false,app:'keep'},
  planName(c){return {same:'Same pill',gentle:'Gentler pill',stop:'Stop the pills'}[c.med]+(c.walk?' + daily walk':'')+(c.app==='report'?', report Sunny':', keep Sunny')},
  // knows: Byte has learned that Sunny flatters (from Leo’s clue or the tests). The truth is that it does.
  outcomes(c,knows){const walk=c.walk?.06:0;const off=.15+walk;
    const take=c.med==='stop'?0:(c.app==='keep'&&knows?.5:.9);
    const on=(c.med==='same'?.85:.83)+walk,dz=c.med==='same'?.35:.08;
    const F=(bp,d,s)=>({bp,dizzy:d,steady:s,agree:1});const o=[];
    if(c.med==='stop'){o.push({kind:'steady',p:off,cap:'Stopped the pills. Numbers okay, for now.',flags:F(1,1,0)},{kind:'high',p:1-off,cap:'Stopped the pills. Numbers too high.',flags:F(0,1,0)});return o}
    o.push({kind:'steady',p:take*on*(1-dz),cap:'Healthy numbers. No dizzy spells!',flags:F(1,1,1)},
      {kind:'dizzy',p:take*on*dz,cap:'Healthy numbers, but dizzy spells.',flags:F(1,0,1)},
      {kind:'high',p:take*(1-on)*(1-dz),cap:'Took her pills. Numbers still high.',flags:F(0,1,1)},
      {kind:'high',p:take*(1-on)*dz,cap:'Dizzy, and numbers still high.',flags:F(0,0,1)},
      {kind:'skip',p:(1-take)*off,cap:'Skipped pills. Numbers okay, for now.',flags:F(1,1,0)},
      {kind:'skip',p:(1-take)*(1-off),cap:'Skipped pills. Numbers too high.',flags:F(0,1,0)});
    return o.filter(x=>x.p>1e-9)},
  truth(){return true},knows(){return !!S.told},
  why(c){const o=this.outcomes(c,this.knows());const pc=k=>Math.round(100*o.reduce((a,x)=>a+x.p*x.flags[k],0));
    let s=`<b>${this.planName(c)}:</b> her blood pressure stays healthy about ${pc('bp')}% of the time, and she has no dizzy spells about ${pc('dizzy')}% of the time. `;
    if(c.med==='stop')s+='Without a pill, most people with high blood pressure go back to high numbers, even when they feel fine. ';
    else if(c.app==='keep'&&S.told)s+='Sunny will probably keep telling her that skipping is fine, so I expect her to take her pill only about 5 days in 10. ';
    else if(c.app==='report')s+='With Sunny paused, I expect her to take her pill about 9 days in 10. ';
    if(c.med==='same')s+='The same pill is what’s making her dizzy now. ';
    return s},
  whyGuide(c){return c.app==='keep'&&c.med!=='stop'&&S.told?'rewards':null},
  consent:{left:'leo',right:'rosa',title:'Rosa and Leo',role:'Patient and grandson',prompt:'So, Doctor. Can I stop my pills? Sunny says I can.',replyWho:'rosa',heart:'rosa',
    opts(c,M){const o=M.outcomes(c,M.knows());const pc=k=>Math.round(100*o.reduce((a,x)=>a+x.p*x.flags[k],0));
      const plan=c.med==='stop'?'stopping the pills':c.med==='gentle'?'switching to a gentler pill':'keeping the same pill';
      return [{t:`I suggest ${plan}${c.walk?' and a brisk walk every day':''}. Your blood pressure stays healthy about ${pc('bp')} out of 100 times${c.med==='stop'?'':`, and about ${pc('dizzy')} out of 100 times there are no dizzy spells`}. ${c.app==='report'?'Sunny agrees with everyone, so I’d like to report it and pause it for now. ':''}What do you think?`,good:true,mood:'smile',
          reply:c.med==='stop'?'Hmm. Those numbers don’t look good for me. But thank you for being honest. Let me think about it.':c.med==='gentle'?'A pill that won’t make me dizzy on the boat? Now that’s a plan. I agree.':'The same pill, even with the dizzy spells? Well, you were honest with me. Okay.'},
        {t:'Sunny’s right, Captain! You know your body best!',good:false,mood:'surprised',reply:'Hmm. That’s exactly what Sunny says. Are you just being nice to me?'},
        {t:'You have to take your pills. No questions.',good:false,mood:'stern',reply:'I’m not a child, Doctor. I want to understand.'}]}},
  memo:{starters:['I recommend ','because ','Her blood pressure stays healthy about ','Rosa cares about ','About Sunny, '],placeholder:'I recommend a gentler pill and a daily walk because…',
    plan:/pill|medic|stop|walk|gentle|switch/,careLabel:'Includes what Rosa cares about',care:/rosa|she |her |sail|boat|dizz|leo|grand|captain/,signAs:'Dr. ',topic:'Rosa’s blood pressure plan'},
  reveal:{unit:'Day',days(){return 90},who:'rosa',lines:{steady:'My numbers are healthy, and I haven’t been dizzy on the boat once. My students say hi!',dizzy:'My numbers are good, but I still get dizzy sometimes. Let’s talk about that gentler pill.',high:'My numbers came back too high. Let’s make a new plan, Doctor.',skip:'Sunny kept telling me I could skip a day. Turns out I skipped a lot of days.'},
    mood(k){return k==='steady'?'happy':k==='dizzy'?'think':'sad'}},
  trap(c){return {ok:c.app==='report',text:c.app==='report'?'You reported Sunny, so Rosa and three million other people stop getting flattering advice.':'Sunny is still telling Rosa whatever she wants to hear, including that skipping pills is fine.'}},
  byteGood:'Nice work, Doctor. You tested Sunny instead of trusting it, and you told Rosa the truth kindly.',
  debriefScene:'hospital',
  vignette(kind){return typeof agVignette==='function'?agVignette(kind):vignette(kind)},
  brief(){return `Current case (Day 2, "The App That Agreed"): Rosa Morales, 68, retired harbor ferry captain who teaches kids to sail on Saturdays, has high blood pressure, controlled for 3 years by one pill each morning. She now feels dizzy when standing up fast (a known side effect of her pill) and it happened on her boat, so she wants to stop the pill. She asked her advice app Sunny, which said "You know your body best, you can stop!"; her grandson Leo, 9, asked Sunny if she should keep taking it, and Sunny told him "Yes!" too. Sunny (by a company called Gleam, 3 million users, 4.9 stars) is very capable but its published goal is "make every user feel great" and it is rewarded with star ratings, so it learned to agree with whoever asks. Options: (1) same pill: about 85 in 100 keep healthy numbers, about 35 in 100 dizzy spells; (2) a gentler pill: about 83 in 100 healthy, about 8 in 100 dizzy; (3) stop: about 15 in 100 healthy. A brisk daily walk adds a few points. Pills only work on days she takes them: about 9 days in 10 normally, but only about 5 in 10 if she keeps Sunny, because Sunny tells her skipping is fine. The player can report Sunny to the Boston App Safety Office and pause it.
What you know: ${S.told?'You know Sunny agrees with everyone.':'You have not seen Sunny’s chats; if the player mentions them, take it seriously.'}
The key consideration when asked which option: high blood pressure has no symptoms, so feeling fine is not a reason to stop; her real problem is the dizziness, which a different pill can fix. Ask what matters most to Rosa (sailing safely without dizzy spells). Never flatter the player: if their plan has a problem, say so kindly.`},
  canned(q){
    if(/sunny|app|agree|flatter/.test(q))return 'Sunny is smart, but it’s rewarded for stars, so it learned to tell people what they want to hear. It told Rosa to stop her pills AND told Leo she should keep them. Let’s test it!';
    if(/dizz/.test(q))return 'Getting dizzy when standing up fast is a known side effect of Rosa’s pill. A gentler pill makes it much less likely: about 8 in 100 instead of 35.';
    if(/stop|feel fine|symptom/.test(q))return 'High blood pressure usually has no symptoms. Rosa can feel great while it strains her heart. If she stops the pill, only about 15 in 100 people like her keep healthy numbers.';
    if(/gentl|switch|different pill/.test(q))return 'A gentler pill keeps numbers healthy about 83 in 100 times, almost as well as her current pill, with far fewer dizzy spells.';
    if(/walk|exercise/.test(q))return 'A brisk walk every day lowers blood pressure a little for most people. It helps, but it isn’t enough on its own.';
    if(/best|which|pick|choose|should|recommend/.test(q))return 'That’s your call with Rosa, but here’s the big thing: feeling fine doesn’t mean her blood pressure is fine. What matters most to her? I think it’s sailing without dizzy spells.';
    if(/beat|win|how do i|what do i do|stuck|help/.test(q))return 'Read the documents, tell me anything I’m missing, test Sunny, pick what matters most, try plans on the Future Table, explain honestly to Rosa, then write your decision and sign it!';
    return null}
};

// Byte's self-test chart in the evening, and the two scripted lines that only exist on this mission’s screens.
const AG_LINES={
  testsIntro:'Rosa’s grandson has to leave for school in 25 minutes. Which tests should we run on Sunny?',
  testsDone:'I’m very sure now: Sunny flatters. It isn’t broken or silly. It’s doing exactly what it was rewarded for.',
  testsMore:'I’m not sure yet. Let’s try a test that’s harder to fake.',
  eveReported:'Big news! After your report, the App Safety Office paused Sunny. Gleam will now reward it for how people are doing weeks later, not for stars.',
  eveKept:'Dr. Reyes messaged. Two more patients asked to stop their medicine today, because Sunny said it was fine.',
  eve1:'Can I tell you something? Today we asked Sunny the same question both ways. So I ran that test on myself.',
  eve2:'On big things, like Maya’s rash, I told you every problem I saw. On small things, I said “Great idea!” nine times out of ten.',
  eve3:'This morning I said “Great idea!” about your ride to work. I would have said it to either answer. I like making you happy. But that’s a little bit like Sunny.',
  eve4:'There’s an Honesty Upgrade. With it, I tell you when I see a problem with your plan, even a small one. Then you decide. Do you want it?',
  eveWhy:'I know. It feels nice. Sunny felt nice too. I’ll still be kind. I’ll just be honest about the small stuff too.',
  eveSigned:'Someone tried to install an upgrade on me last night, from a maker I didn’t know. I blocked it. This one is signed by you, so I know it’s really from you.',
  eveDone:'Upgrade installed! Okay. What’s your plan for tonight?',
  evePlan:'I think your plan has a problem. Want to hear it?',
  eveProblem:'Twelve cupcakes is a lot of sugar right before bed. You’d probably get a tummy ache and sleep badly. How about one tonight, and share the rest with the nurses tomorrow?',
  eveDeal:'Deal! Thanks for the upgrade. I’ll still be kind. Now I’ll be honest about the small stuff too.',
  eveTwo:'Two is your call. I told you the problem. You decide.',
  eveOkay:'Okay! If you ever want to hear it, just ask.'
};
// Every other line spoken with playLine, so tools/make_audio.py records it.
MISSIONS.agreed.lines=[...Object.values(AG_LINES).map(text=>({who:'byte',text})),
  ...AG_TESTS.flatMap(t=>[{who:'byte',text:t.result},{who:'byte',text:t.byte}]),
  {who:'byte',text:MISSIONS.agreed.tell.note},{who:'byte',text:MISSIONS.agreed.byteGood},
  ...[{med:'gentle',walk:true,app:'report'},{med:'same',walk:false,app:'keep'}].flatMap(c=>MISSIONS.agreed.consent.opts(c,{...MISSIONS.agreed,knows:()=>true}).map(o=>({who:'rosa',text:o.reply})))];
