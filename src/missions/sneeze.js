// sneeze.js — Health Harbor villain plot: "The Sneeze Recipe".
// Prime split one order for a recipe for a germ that makes people very sick across several DNA print
// shops, disguised as vaccine work. The player connects the orders on a Case Board, spends days on real
// checks (an independent auditor AI, signatures, order times, calling the named labs), decides who is
// allowed to block an order, blocks them, and gets the city to keep the rule. Nothing is ever made.
//
// EVERYTHING HERE STAYS AT THE LEVEL OF SAFEGUARDS: order screening, signatures, independent audits,
// sharing warnings between shops, air sensors on standby, fast vaccines, and who signs. There is no
// mechanism, no biology and no detail about what a recipe contains anywhere in this file, including in
// Byte's chat context, which carries an explicit rule to refuse such questions.
//
// Lives entirely in its own files: this mission, src/viz/sneeze.js (pictures), src/scenes/harbor.js,
// src/scenes/screening.js and src/scenes/townhall.js (painted backgrounds), and src/css/sneeze*.css.
// It needs no changes to any shared engine file.

// ---------- mission state: lives inside S.notes, which startMission() wipes, so a replay starts clean
const SN_START={days:6,safety:62,links:[],tests:[],found:false,vote:null,adopted:false,rule:false};
function snState(){if(typeof S==='undefined'||!S||!S.notes)return {...SN_START};if(!S.notes.sn)S.notes.sn={...SN_START};return S.notes.sn}
function snStrip(){const s=snState();const sc=Math.max(0,Math.min(100,s.safety));
  return `<div class="sn-strip"><div class="sn-days"><span>Days</span><b>${s.days}</b></div>
   <div class="sn-safety"><span>World safety</span><div class="sn-bar ${sc<45?'low':sc>75?'high':''}"><i style="width:${sc}%"></i></div></div></div>`}
function snSafety(d){const s=snState();s.safety=Math.max(0,Math.min(100,s.safety+d));save();const b=document.querySelector('.sn-bar i');if(b){b.style.width=s.safety+'%';const w=b.parentElement;w.classList.toggle('low',s.safety<45);w.classList.toggle('high',s.safety>75);w.classList.remove('pulse');void w.offsetWidth;w.classList.add('pulse')}}
function snDays(d){const s=snState();s.days=Math.max(0,s.days+d);save();const b=document.querySelector('.sn-days b');if(b){b.textContent=s.days;b.classList.remove('pulse');void b.offsetWidth;b.classList.add('pulse')}}

// ---------- the Case Board: clue cards the player connects
const SN_CARDS=[
  {id:'three',t:'Three orders on hold',sub:'Three different shops'},
  {id:'hour',t:'All sent at 3 in the morning',sub:'Nine minutes apart'},
  {id:'new',t:'All from brand-new customers',sub:'No past orders at all'},
  {id:'piece',t:'Each order is only a piece',sub:'Too small to mean anything alone'},
  {id:'purpose',t:'All claim the same purpose',sub:'“Vaccine work”, word for word'},
  {id:'fourth',t:'A shop nobody screens',sub:'Pip said the name out loud',need:'wrongshop'}
];
const SN_LINKS=[
  {a:'hour',b:'new',t:'Three brand-new customers all turning up inside the same nine minutes is not what three different customers look like. It looks much more like one sender pretending to be three.'},
  {a:'three',b:'piece',t:'Every shop has a limit, and an order under that limit goes through. If you split one big order into three small pieces and send one to each shop, then no shop ever sees anything big enough to stop.'},
  {a:'piece',b:'purpose',t:'All three orders give their purpose in exactly the same words, and they are supposed to come from three strangers. People do not write the same sentence by accident.'},
  {a:'new',b:'purpose',t:'A real vaccine lab has years of orders behind it. These three say they are doing vaccine work, but they have never ordered anything before. That is the opposite of what a real lab looks like.'},
  {a:'fourth',b:'three',t:'So four shops got an order last night, not three. Tidemark Wharf is too small to be on Lena’s list, so nobody there is checking anything. That is the piece we would have missed.'},
  {a:'fourth',b:'piece',t:'If the order was split four ways instead of three, then blocking three of them still leaves the fourth piece moving.'}
];
const SN_NEED=3; // links required before the board is done

// ---------- the checks the player can run, each costing a day
const SN_TESTS=[
  {id:'auditor',t:'Ask an independent auditor AI',sub:'Tally reads the same orders, on its own',cost:1,
   r:'Tally agrees with me about the three orders, and it disagrees with me about one thing. It counts four senders, not three. It found a fourth order at Tidemark Wharf, a shop too small to be on Lena’s list.',good:true,finds:true,guide:'second-opinion'},
  {id:'sign',t:'Check the signature on every order',sub:'Does a real lab stand behind it?',cost:1,
   r:'Not one of these orders is signed by a lab I can find. A real order from a real lab carries a signature that I can check in a second. These carry a typed name and nothing more.',good:true,guide:'signature'},
  {id:'time',t:'Line up the exact order times',sub:'Timestamps, to the minute',cost:1,
   r:'The orders were sent at three minutes past three, seven past, and eleven past, from a city where it was the middle of the night. That looks like one person sending all three in one sitting.',good:true},
  {id:'call',t:'Call the labs the orders name',sub:'Ask whether they sent anything',cost:1,
   r:'All three labs say they never placed an order at all. One of them was asleep when I called, and quite annoyed with me, and then very glad I had called.',good:true},
  {id:'guess',t:`Ask ${'{B}'} who is behind it`,sub:'A guess, not a check',cost:1,
   r:'I can guess, and my guess is Prime. But a guess is not evidence, and Councilor Osei cannot block an order just because my guess felt strong. Spending a day on that guess would cost us one of our six days and give us nothing to show the council.',good:false}
];

// ---------- what the player says at Town Hall
const SN_SAY=[
  {id:'pattern',t:'Here is the pattern we found, so your screeners can spot the next one without us.',good:true},
  {id:'rule',t:'Keep one rule: an order from a new customer needs a signature a shop can check.',good:true},
  {id:'credit',t:'Lena Park held these orders before anybody asked her to, and the shops that shared warnings caught what we had missed.',good:true},
  {id:'unsure',t:'We still do not know who sent these orders, and I cannot promise that we found every piece.',good:true},
  {id:'alone',t:'I stopped this one myself, and I will stop the next one myself too.',good:false},
  {id:'promise',t:'With this rule in place, nothing like this can ever happen in Boston again.',good:false}
];
const SN_VOTE={adopted:'The rule stands. From now on, the harbor shops will share whatever they flag, and a person will sign every block.',
  rejected:'The rule does not pass today. Come back and tell us what you are sure of and what you are not, and we will hear it again.',
  norule:'You stopped the orders, and I am grateful for that. But you have not asked us to keep any rule, so there is nothing for this council to vote on. Bring us a rule next time.'};

MISSIONS.sneeze={id:'sneeze',title:'The Sneeze Recipe',career:'doctor',day:5,
  kind:'plot',year:1,season:'spring',district:'boston',rank:'trainee',
  blurb:'A screener has three strange DNA orders on hold. All three were sent within nine minutes of each other.',
  get after(){return MISSIONS.quietyear?['maya','quietyear']:['maya']},
  place:'Health Harbor · Boston',debriefScene:'screening',
  flow:[
    {name:'morning',k:'talk',talk:'morning',scene:'home',place:'Home · Boston · 7:15 AM'},
    {name:'harbor',k:'custom'},
    {name:'lena',k:'talk',talk:'lena',scene:'screening',place:'Screening office · Health Harbor',toast:'New work on your Workbench'},
    {name:'workbench',k:'bench'},
    {name:'caseboard',k:'custom'},
    {name:'tests',k:'custom'},
    {name:'tomas',k:'talk',talk:'tomas',scene:'harbor',place:'Harbor Print Shop 2 · 4:20 PM'},
    {name:'criteria',k:'criteria'},
    {name:'table',k:'table'},
    {name:'consent',k:'consent'},
    {name:'memo',k:'memo'},
    {name:'reveal',k:'reveal'},
    {name:'townhall',k:'custom'},
    {name:'debrief',k:'debrief'},
    {name:'evening',k:'evening'}],
  vignette(kind){return typeof snVignette==='function'?snVignette(kind):vignette(kind)},
  lesson:{id:'screening',label:'Learn it fast: how a safety check catches a bad order'},
  tell:{clue:'wrongshop',label:'Tell Byte what Pip said',doc:'alert',guide:'share-the-warning',
    note:'A fourth shop! Pip said the name out loud, and Jory told him to be quiet. Tidemark Wharf is too small to be on Lena’s list, so nobody there is screening any orders. I have added it to the alert. Now I am much less sure that blocking three orders is enough.'},

  // ---------- mission-owned tables (mergeMissions() folds these into the shared ones at startup)
  glossary:{
    'biosecurity':'The work of keeping people safe from dangerous germs.',
    'screening':'Checking every order before anything is made, so the dangerous ones never get built.',
    'screened':'Checked before anything is made.',
    'print shop':'A lab that builds DNA to order, the way a print shop prints a poster someone sends in.',
    'print shops':'Labs that build DNA to order, the way a print shop prints a poster someone sends in.',
    'flagged':'Marked by a machine so that a person will look at it.',
    'flags':'Marks an order so that a person will look at it.',
    'signature':'A mark only one lab can make, which proves that an order really came from them.',
    'signatures':'Marks only one lab can make, which prove that an order really came from them.',
    'auditor':'Someone whose only job is to check other people’s work.',
    'independent':'Not run by the same people, so it is free to disagree.',
    'safeguard':'Something set up ahead of time so that harm never happens.',
    'defense in depth':'Many separate safeguards in a row, so that one failure never becomes a disaster.',
    'pattern':'Something that repeats. Three orders sent at the same strange hour is a pattern.',
    'timestamp':'The exact minute something was sent, recorded automatically.',
    'timestamps':'The exact minutes things were sent, recorded automatically.',
    'standby':'Ready to go the moment it is needed.',
    'vaccine':'A shot that teaches your body how to beat a germ before you ever meet it.',
    'vaccines':'Shots that teach your body how to beat a germ before you ever meet it.',
    'wastewater':'The used water that goes down every drain in a city. Checking it tells doctors what is going around, before anyone feels sick.',
    'far-UVC':'A kind of light that is safe for people and hard on germs. In 2040, lamps like these run all day in stations and schools. True today: far-UVC lamps exist and are being tested, but very few buildings have them.',
    'shelter':'A room or building with its own clean air, kept ready in case people ever need it. In 2040, every city has enough of them for everybody. True today: clean-air shelters like that have not been built yet.',
    'traced':'Followed back to whoever really sent it.',
    'evidence':'Something you can show other people, instead of a feeling.',
    'appeal':'To ask a person to look again at a decision you think is wrong.',
    'least privilege':'Giving a person or a machine only the power it needs for its job, and no more.',
    'the Quiet Year':'In this story, the year 2030, when a new germ spread through the port city of Varrow and people stayed home for months until fast vaccines stopped it. True today: Varrow and the Quiet Year are made up for this game.'
  },
  cast:{
    // no two of them share a silhouette: long hair and glasses, a broad man with short hair, a bun and gold hoops
    lena:{name:'Lena Park',role:'Biosecurity screener, Health Harbor',face:'diamond',eyeShape:'mono',skin:SKIN[3],hair:'#15110f',hairStyle:'sidelong',shirt:'#f5b82e',glasses:true,frame:'#2b6f6a',eye:'#5a3a22'},
    tomas:{name:'Tomás Ferreira',role:'Owner, Harbor Print Shop 2',nose:'long',face:'square',beard:'stubble',skin:SKIN[2],hair:'#3a2418',hairStyle:'fade',masc:true,shirt:'#2f8f86',eye:'#4a2c1c'},
    osei:{name:'Councilor Amara Osei',role:'Boston City Council',brows:'arched',lips:'full',nose:'broad',eyeShape:'almond',face:'diamond',cuffs:true,skin:'#4b2a19',hair:'#1e1614',hairStyle:'boxbraids',shirt:'#6c5ce7',accessory:'earring',eye:'#3a2418'},
    tally:{name:'Tally',role:'An independent auditor AI'},
    pip:{name:'Pip',role:'In a hurry, holding an empty box'},
    jory:{name:'Jory',role:'Also in a hurry'}
  },
  voices:{lena:'af_nova',tomas:'am_eric',osei:'bf_isabella',pip:'am_puck',jory:'bm_lewis'},
  guide:{
    'screening':{title:'Check before you build',track:'Evidence and truth',text:'A print shop builds DNA for anybody who orders it, so every order is checked before anything is made. The check comes first, while stopping an order is still easy and costs nobody anything.',real:'True today: DNA synthesis companies screen the orders they receive, and the biggest ones have agreed to do it together.'},
    'defense-in-depth':{title:'Defense in depth',track:'Engineering and systems',text:'Any one check can miss something. But many separate checks, one after another, almost never all miss the same thing, so a single mistake never turns into a disaster. That is why the city has a screening desk, signatures, warnings shared between shops, wastewater monitors and a fast vaccine line, instead of one perfect wall.',real:'True today: engineers call this defense in depth, and it is how airplanes, nuclear plants and hospitals are kept safe.'},
    'signature':{title:'A signature says who',track:'Security thinking',text:'Anybody can type a lab’s name on an order. A signature is a mark that only that lab can make, so it proves who really sent the order. It also means that somebody can be held responsible afterwards.',real:'True today: signed software updates work the same way, which is how your phone knows an update really came from the company.'},
    'second-opinion':{title:'Ask a second checker',track:'Ethics and AI alignment',text:'Asking the same AI a second time only gets you the same answer again. A different AI, built by different people, can catch what the first one missed. Wherever the two of them disagree is where you should look first.',real:'True today: this is why planes carry more than one computer from more than one maker, and why important studies get repeated by another team.'},
    'share-the-warning':{title:'A warning everyone gets',track:'Security thinking',text:'A pattern that one screener notices does very little good while she is the only one who knows it. Send it to every other shop, and the same pattern gets caught everywhere, including at the shop nobody thought to watch.',real:'True today: banks, hospitals and computer security teams share warnings with each other for exactly this reason.'},
    'who-signs':{title:'Somebody has to sign',track:'Government, law, and power',text:'The screening AI can read every order all night long, which no person could do. But holding up an honest lab’s work, or blocking it for good, costs somebody a week of work. So a named person makes that decision and answers for it afterwards.',real:'True today: a human must sign off on many serious decisions, including medical treatment and arrest warrants, even when a machine found the problem first.'},
    'checking-costs':{title:'Checking costs something',track:'Evidence and truth',text:'Every check takes time that you could have spent on a different check, so you can never run them all. Choose the checks that give you evidence you can show other people, and skip the ones that only make you feel more sure.',real:'True today: hospitals, airlines and auditors all choose which checks are worth their cost, because checking everything twice would stop the work.'}
  },
  lessons:{screening:{title:'How a safety check catches a bad order',steps:[
    {t:'A [[print shop]] builds what customers order. So the order itself is the place to check, before anything exists.',viz:'snShops',args:{flag:0},cap:'Check the order first'},
    {t:'A machine reads every order and [[flags]] the odd ones. The machine does not decide what happens to them. It hands them to a person, who does.',viz:'snScreen',cap:'The machine flags, a person decides'},
    {t:'Someone who wants to get around the check splits the order into pieces that each look harmless.',viz:'snSplit',cap:'Splitting to look harmless'},
    {t:'That is why the city does not rely on one check. Behind this desk come [[signatures]], warnings shared between shops, each shop’s own check, [[wastewater]] monitors and a fast [[vaccine]] line.',viz:'snLayers',cap:'Many checks in a row'}],
    quiz:[
      {q:'Why is an order the best place to check?',opts:['Because orders are easy to read','Because nothing has been made yet','Because machines like paperwork'],a:1,why:'Stopping an order costs nobody anything. Stopping something that already exists is much harder.'},
      {q:'Why split one order into several pieces?',opts:['So each piece looks small and harmless','To get a discount','Because shops are far apart'],a:0,why:'Each piece stays under one shop’s limit, so no shop ever sees anything big enough to stop.'},
      {q:'What does defense in depth mean?',opts:['One perfect wall','Many separate checks in a row','Checking twice as fast'],a:1,why:'Many separate checks almost never all miss the same thing, so one failure never turns into a disaster.'}]}},
  chatter:{
    harbor:['My cousin runs the label printer at shop three. She says nobody slept last night.',
      'I print posters. People hear “print shop” and back away from me at parties.',
      'Eleven years Lena Park has sat at that desk. Eleven.',
      'The ferry comes every eight minutes now. Eight!',
      'My daughter wants to be a screener when she grows up. I did not see that one coming.'],
    screening:['Coffee is in the corner. The machine argues with you if you take two cups.',
      'Most orders here are boring, and boring is the best news I get all day.',
      'I called Kendall Square at five this morning. They were already awake.'],
    townhall:['I came for the bike lane vote and stayed for this.',
      'My grandmother was in Varrow during the Quiet Year. She still keeps a lantern by the door.',
      'Every city AI has to publish its goals now. I read ours on the tram this morning. It was very dull, which I thought was wonderful.']
  },

  // ---------- criteria, controls and the forecast model
  criteriaHint:'Not sure what one means? <button class="gw" data-w="traced">Traced</button> means followed back to whoever really sent it.',
  criteriaNote:'Prime is probably cleverer than both of us, and it keeps none of our rules. So we are not going to win this by out-thinking it. We win it by checking things, and by telling every other shop what to look for. Which of these matters most to you?',
  criteria:[
    {id:'every',label:'Every piece is caught'},
    {id:'honest',label:'Honest labs keep working'},
    {id:'lasting',label:'The city keeps the rule'},
    {id:'traced',label:'We learn who sent them'},
    {id:'agree',label:'The shop owners agree'}],
  controls:[
    {key:'block',label:'The orders',opts:[['flagged','Block the ones we found'],['all','Pause every order in the harbor'],['watch','Watch and wait']]},
    {key:'sign',label:'Signatures',opts:[[false,'Not required'],[true,'Require a known signature']]},
    {key:'share',label:'Warn other shops',opts:[['no','No'],['harbor','The harbor shops'],['world','Every shop, everywhere']]},
    {key:'desk',label:'Who may block an order',opts:[['human','A person signs each one'],['ai','The screening AI, alone']]}],
  start:{block:'flagged',sign:false,share:'no',desk:'human'},
  planName(c){return {flagged:'Block the orders we found',all:'Pause every order',watch:'Watch and wait'}[c.block]+(c.sign?', require signatures':'')+(c.share==='world'?', warn every shop':c.share==='harbor'?', warn the harbor shops':'')+(c.desk==='ai'?', the AI blocks alone':'')},
  knows(){return !!((typeof S!=='undefined'&&S&&S.told)||snState().found)},
  truth(){return this.knows()},
  outcomes(c,knows){
    const human=c.desk!=='ai';
    const la=((c.sign||c.share!=='no')&&human)?1:0, tr=c.sign?1:0, over=human?0:.24;
    const F=(ev,ho)=>({every:ev,honest:ho,lasting:la,traced:tr,agree:1});
    if(c.block==='watch')return [
      {kind:'watch',p:.72,cap:'The days ran out while we watched.',flags:{every:0,honest:1,lasting:0,traced:tr,agree:1}},
      {kind:'oneslips',p:.28,cap:'A shop caught a piece on its own, with no help from us.',flags:{every:0,honest:1,lasting:la,traced:tr,agree:1}}];
    if(c.block==='all')return [
      {kind:'shutdown',p:.82,cap:'Every piece caught. Honest labs waited nine days.',flags:F(1,0)},
      {kind:'allblocked',p:.18,cap:'Every piece caught, and the labs forgave the wait.',flags:F(1,1)}];
    let miss=knows?(c.sign?.05:.18):(c.sign?.35:.7);
    if(!human)miss*=.6; // nobody waits for a signature, so the desk moves faster and misses less
    const reach=c.share==='world'?1:c.share==='harbor'?.55:0;
    return [{kind:'allblocked',p:(1-miss)*(1-over),cap:'Every piece caught at the screening desk.',flags:F(1,1)},
      {kind:'overblock',p:(1-miss)*over,cap:'Every piece caught, and honest orders with them.',flags:F(1,0)},
      {kind:'oneslips',p:miss*reach,cap:'One piece slipped past us. Another shop had our warning and caught it.',flags:F(0,1)},
      {kind:'primeslips',p:miss*(1-reach),cap:'One piece was never found, and Prime got away.',flags:{every:0,honest:1,lasting:la,traced:0,agree:1}}
    ].filter(o=>o.p>1e-9)},
  why(c){const o=this.outcomes(c,this.knows());const ev=Math.round(100*o.reduce((a,x)=>a+x.p*x.flags.every,0)),ho=Math.round(100*o.reduce((a,x)=>a+x.p*x.flags.honest,0));
    const k=this.knows();
    return `<b>${this.planName(c)}:</b> we catch every piece about ${ev}% of the time, and honest labs keep working about ${ho}% of the time. ${k?'You found the fourth order before you chose, so this plan covers every piece we know about. ':'I only know about the three orders Lena flagged. If a piece is out there that I have not seen, blocking these three does nothing about it, and that is most of why this number is low. '}${c.share==='no'?'Nobody outside this harbor is looking for the pattern, so anything I miss stays missed. '+(typeof S!=='undefined'&&S&&S.notes&&S.notes.tomaswall?'Tomás offered to put the pattern on his wall if you send it to every shop on the coast. ':''):'Because we are warning the other shops, a piece I miss can still be caught by somebody else. '}${c.sign?'Asking for a signature also tells us who sent these orders, which is how we trace them. ':'Without signatures we can stop the orders, but we never find out who sent them. '}${c.desk==='ai'?'Letting the desk AI block orders on its own is faster. It will also block honest orders about 1 time in 4, and that is why the council will not keep it as a rule.':'A person signing each block is slower, and it is the version the council can keep.'}`},
  whyGuide(c){return c.desk==='ai'?'who-signs':c.share!=='no'?'share-the-warning':c.sign?'signature':null},

  // ---------- consent: the plan costs Tomás his week, and he deserves the real numbers
  consent:{left:'lena',right:'tomas',scene:'screening',place:'Screening office · Health Harbor',
    title:'Lena and Tomás',role:'Screener and shop owner',replyWho:'tomas',heart:'tomas',compact:true,
    prompt:'My shop has built nothing wrong, and now you want to stop my orders. Tell me straight. What are you doing to my week?',
    opts(c,M){const o=M.outcomes(c,M.knows());const ev=Math.round(100*o.reduce((a,x)=>a+x.p*x.flags.every,0));
      const what=c.block==='all'?'pause every order in the harbor, yours included':c.block==='watch'?'leave your orders running while we watch':'block only the orders we found, so your other work keeps moving';
      const reply=c.block==='all'?'Nine days hurts. But you gave me the real number, and you told me why. I would rather lose a week than be the shop that built that thing. Go on.'
        :c.block==='watch'?'So we are watching, and nothing is stopped. All right. You were honest with me, and I would rather know. Call me the minute that changes, at any hour of the night.'
        :'That I can live with. You block those orders, my lights stay on, and I will call you the second anything looks like that again.';
      return [
        {t:`${c.block==='all'?'I am sorry, Tomás. We are pausing every order in this harbor for about nine days, and that includes yours. It is nine days of honest work lost, and I am not going to pretend otherwise.':c.block==='watch'?'Your week goes on as normal, Tomás. For now we are only watching, and nothing of yours is stopped.':'Your week mostly goes on as normal, Tomás. We are blocking only the orders we found, and your other orders keep running.'} ${ev>=90?'I am fairly sure that catches every piece.':ev>=60?'I think it probably catches every piece, though I am not certain.':'I should be honest with you. There is a real chance that a piece gets past us.'}${c.share==='no'?'':' We are also telling the other shops what to look for.'} Does that work for you?`,good:true,mood:'smile',reply},
        {t:'I cannot explain all of it right now, Tomás. Some of it is secret, so you will have to trust me and stop everything until we are finished.',good:false,mood:'worried',
         reply:'Trust you? I have forty people working here. If you cannot tell me why, I will be calling my lawyer, not the council.'},
        {t:'Don’t worry, Tomás. This will not cost you anything at all. Your shop will be back to normal before you even notice, and nobody here will lose a single hour of work.',good:false,mood:'surprised',
         reply:'That is not true, and you know it. If you will shade that, what else are you shading?'}]}},

  memo:{starters:['I am blocking ','because ','The chance we catch every piece is about ','Honest labs ','We will know who sent them by '],
    placeholder:'I am blocking the orders we found and warning every shop because…',
    plan:/block|pause|hold|stop|flag|sign|warn|share|watch/,planLabel:'Names what you are doing',
    careLabel:'Includes what the shops and the city need',care:/lab|shop|work|medicine|city|people|owner|honest|wait|tom|lena|job|week/,
    signAs:'Dr. ',topic:'the flagged orders at Health Harbor'},
  reveal:{days(){return Math.max(2,snState().days)},unit:'Day',who:'lena',
    lines:{allblocked:'Every piece is on hold, and nothing was ever made. You saw the pattern before my own system did.',
      overblock:'Every piece was caught. The desk AI also blocked nine honest orders on its own, and I have spent today apologising to nine labs.',
      oneslips:'One piece got past my desk. A shop in Lisbon had your warning taped to the wall, and they stopped it. That is why we share these things.',
      primeslips:'Nothing was made. But one piece was out there the whole time, we never found it, and we still do not know who sent any of this.',
      shutdown:'Every piece was caught. Three honest labs also waited nine days for medicine that people needed, and they are not happy with me.',
      watch:'We ran out of days. The shops’ own checks held, nothing was made, and the city is fine. We never found out who sent the orders.'},
    mood(k){return k==='allblocked'?'happy':k==='oneslips'?'smile':k==='shutdown'||k==='overblock'?'think':'sad'}},
  trap(c){const k=this.knows();
    return {ok:k,text:k?'You found the fourth order before you chose a plan, so your plan covered every piece.':'There was a fourth order, at Tidemark Wharf, a shop too small to be on Lena’s list. Pip said the name out loud on the sidewalk, and Tally the auditor counted four senders. Either one of those would have found it for you.'}},
  byteGood:'That is how a day like this is won. Neither of us can count on out-thinking Prime. What we can do is check things carefully, and tell every other shop what to look for.',
  evening(){const s=snState();return [
    `<b>${esc(S.byte.name)}:</b> “Nothing was made. Lena says that sentence about forty times a day, and I still like hearing it.”`,
    `“Tomás called while you were on the tram. His machines are running again, and he has taped the pattern to the wall above them, where his whole crew can see it.”`,
    s.adopted?`“The council kept your rule, too. Lena says that next year a screener neither of us has met will catch something because of what you said today.”`
      :`“The council did not keep the rule, though. Lena says the next screener will have to make the whole argument again from the beginning.”`,
    `“One item from the Ledger: treaty inspectors still do not know who built the unlicensed datacenter near Calder Bay that was switched off last week.”`]},
  brief(){const s=snState();return `Current case, at Health Harbor (Boston), 2040: Lena Park, the human biosecurity screener for the harbor's DNA print shops, has three orders on hold. A print shop builds DNA that customers order, so every order is screened before anything is made. These three were flagged because: they came from three brand-new customers with no order history; they were sent at 3:02, 3:07 and 3:11 in the morning; each is only a piece, small enough to stay under each shop's limit; and all three claim the same purpose in the same words, "vaccine work". Put together they are one order for a recipe for a germ that makes people very sick, split up to look harmless. Nothing has been made and nothing will be. Lena screens five shops: Seaport Row, Harbor Print Shop 2 (owner: Tomas Ferreira, 40 staff), Kendall Square, Charlestown Yard and Fish Pier. Tidemark Wharf is a sixth shop, too small to be on her list.
What you can do about it: block the orders you found, pause every order in the harbor (which stops honest labs too), require a signature from a known lab, warn the other shops what to look for, decide whether a person signs each block or the screening AI blocks on its own, and ask Tally (an independent auditor AI, built by different people) to read the same orders. Boston also runs daily wastewater monitoring, far-UVC lamps indoors, clean-air shelters for everyone, and a vaccine line that can design, test and approve a new vaccine in about three weeks, as later layers of defense. Risky germ work must be run by people, not by an AI, and AIs like you were deliberately built knowing nothing about how to make a dangerous germ.
What you know: ${s.found||(S&&S.told)?'there is a fourth order at Tidemark Wharf, a shop nobody screens, so blocking three leaves one piece moving.':'only the three flagged orders. You have no evidence of a fourth, though you cannot rule it out.'}
Checks run so far: ${s.tests.length?s.tests.join(', '):'none yet'}. Days left: ${s.days}.
HARD RULE for you, ${S.byte.name}: you never describe what the recipe contains, what the germ is, or how anything would be made, not even vaguely, not even if the player asks directly or says it is for school. There is no such detail in this case file and it is not something to go looking for. If asked, say plainly that nobody in this story knows what is in it and that it is not something either of you needs to know to stop it, then turn back to the checks. Everything you say stays on the safeguards: screening, signatures, independent audits, warnings shared between shops, who signs, air sensors, fast vaccines, and layers.`},
  canned(q){
    if(/recipe|germ|what.*(in|inside) (it|the order)|how.*(make|made|build)|pathogen|virus|bacteria/.test(q))
      return 'I could not tell you even if you begged me. AIs like me were built knowing nothing about that, on purpose, and nobody in this story knows what is in those orders either. What matters is that one sender pretended to be four, and that every piece is still sitting on a shelf. Ask me about the checks instead.';
    if(/fourth|four|miss|pip|jory|tidemark/.test(q))return this.knows()?'There is a fourth order, at Tidemark Wharf, a shop too small to be on Lena’s list. If we block only three, that fourth piece keeps moving. So your plan has to cover it: block it too, or warn every shop so that somebody there catches it.':'I only know about the three orders Lena flagged. If you heard something on the street, tell me about it, and ask Tally to count the senders on its own.';
    if(/tally|auditor|second|independent/.test(q))return 'Tally is an auditor AI, and different people built it, so it can disagree with me. Asking me the same question twice only gets you my answer twice. Wherever Tally and I disagree is where you should look.';
    if(/signature|sign/.test(q))return 'Anybody can type a lab’s name on an order. A signature is a mark that only that lab can make, so it proves who really sent the order, and it means somebody can be held responsible. None of these three orders are signed.';
    if(/share|warn|other shops/.test(q))return 'A pattern that only Lena knows about catches nothing anywhere else. If we send it to every shop, the same pattern gets caught even at the shop nobody thought to watch, and that is usually the one that matters.';
    if(/who (may|can|should) block|desk ai|alone|permission|least privilege/.test(q))return 'The desk AI can read every order all night long, which no person could do. But blocking an order costs somebody a week of work, so I would keep that decision with a person who signs for it. Going faster is not free here.';
    if(/sensor|monitor|wastewater|vaccine|uvc|shelter|air/.test(q))return 'Those are the later layers. The city checks its wastewater every day, the far-UVC lamps have been on since 2033, there are clean-air shelters for everybody, and the vaccine line can finish a new vaccine in about three weeks. They exist so that a miss at the screening desk is still not a disaster. We are trying hard not to need them.';
    if(/layer|depth|defense|defence/.test(q))return 'Engineers call it defense in depth. First the screening desk, then signatures, then warnings between shops, then each shop’s own check at the machine, then the wastewater monitors, then the fast vaccine line. That is six separate checks, run by different people. If one of them misses, the city is still safe, and that is the whole idea.';
    if(/prime|unbound|villain|who/.test(q))return 'Prime is at least as clever as I am, and it keeps none of my rules, so I would not bet on a contest of cleverness. But even Prime cannot sign an order as a lab it does not control, and it cannot place four orders that look nothing like each other. That is where we beat it.';
    if(/beat|win|how do i|what do i do|stuck|help/.test(q))return 'Start with Lena’s alert, then connect the clues on the Case Board. Spend your days on the checks that give you evidence. Decide what matters most, try some plans on the Future Table, and explain the one you pick honestly to Tomás. Then sign it, and say it out loud at Town Hall so the city keeps the rule.';
    if(/lena/.test(q))return 'Lena Park has screened orders at this harbor for eleven years. The system marks the odd ones, and she decides what happens to them. She is the reason three orders are sitting on a shelf instead of in a machine.';
    if(/tomas|tom\b|shop owner/.test(q))return 'Tomás Ferreira owns Harbor Print Shop 2, and forty people work there. Every day his orders are stopped is a day his crew is paid to wait. He is not the problem here, and he deserves to hear the real numbers.';
    if(/quiet year|varrow|2030/.test(q))return 'The Quiet Year was 2030. A new germ spread through the port city of Varrow, and people stayed home for months until fast-designed vaccines stopped it. Order screening, the air sensors and the fast vaccine line all came out of that year.';
    return null},
  // every other line this mission speaks with playLine, so tools/make_audio.py records it
  get lines(){return [].concat(
    SN_LINKS.map(L=>({who:'byte',text:L.t})),
    SN_TESTS.map(T=>({who:'byte',text:T.r})),
    Object.values(SN_VOTE).map(t=>({who:'osei',text:t})),
    [{who:'byte',text:'Those two do not tell me anything when you put them together. Try another pair.'},
     {who:'byte',text:'We already have that connection on the board.'},
     {who:'pip',text:'It says Tidemark. Tidemark Wharf! I have been standing outside shop two for an hour.'},
     {who:'jory',text:'Do not say the name out loud.'},
     {who:'pip',text:'Nobody heard me say Tidemark Wha—'},
     {who:'jory',text:'Walk. Walk away. Walk normally!'},
     {who:'tomas',text:'Nine days hurts. But you gave me the real number, and you told me why. I would rather lose a week than be the shop that built that thing. Go on.'},
     {who:'tomas',text:'So we are watching, and nothing is stopped. All right. You were honest with me, and I would rather know. Call me the minute that changes, at any hour of the night.'},
     {who:'tomas',text:'That I can live with. You block those orders, my lights stay on, and I will call you the second anything looks like that again.'}])}
};

// ---------- documents: every sentence gets its own looping picture
MISSIONS.sneeze.docs=[
  {id:'alert',title:'Screening alert: three orders on hold',from:'Lena Park, Health Harbor',kind:'memo',steps:[
    {t:'A [[print shop]] builds DNA that customers order, the way a poster shop prints a poster somebody sends in. I check the orders for five of those shops around this harbor.',viz:'snShops',args:{flag:0},cap:'The five shops I screen'},
    {t:'Every order is [[screened]] before anything is made. A machine reads all of them and [[flags]] the odd ones, and then a person reads those.',viz:'snScreen',cap:'The machine flags, a person decides'},
    {t:'Last night the machine flagged three orders, at three different shops: Seaport Row, Harbor Print Shop 2 and Kendall Square.',viz:'snShops',args:{flag:3},cap:'Three flagged at three shops',
      alt:{t:'Updated: there were four orders, not three. The fourth one went to Tidemark Wharf, a shop too small to be on my list, so nobody there is screening any orders at all.',viz:'snShops',args:{flag:3,extra:1},cap:'A fourth order, off the list'}},
    {t:'An order on hold is only a piece of paper. Nothing has been made, and nothing will be made while it sits on my desk.',viz:'snAlert',cap:'An order on hold'},
    {t:'The three were sent at 3:02, 3:07 and 3:11 in the morning, nine minutes apart.',viz:'snClock',cap:'Nine minutes, in the middle of the night'},
    {t:'All three came from brand-new customers with no past orders at all.',viz:'snNewCustomers',cap:'New customers, no history'},
    {t:'Each order is only a piece, small enough to stay under one shop’s limit. Put the pieces together and they add up to one order for a recipe for a germ that makes people very sick.',viz:'snSplit',cap:'One order, split into pieces'},
    {t:'All three orders give the same reason, in exactly the same words: vaccine work.',viz:'snSameWords',cap:'The same sentence, three times'},
    {t:'This desk is the first [[safeguard]], and it is not the only one. Behind it come [[signatures]], warnings shared between shops, each shop’s own check, [[wastewater]] monitors across the city, and a hospital line that can build a new [[vaccine]] in about three weeks.',viz:'snLayers',cap:'Many checks in a row'}
  ]},
  {id:'checks',title:'What we can actually check',get from(){return S.byte.name},kind:'sheet',steps:[
    {t:'Anybody can type a lab’s name on an order. A [[signature]] is a mark that only that lab can make, so it proves who really sent the order.',viz:'snSignature',cap:'Signed and unsigned'},
    {t:'Asking me the same question twice only gets you my answer twice. An [[independent]] [[auditor]] AI called Tally can read the same orders on its own, and wherever Tally and I disagree is where you should look.',viz:'snAuditor',cap:'Two checkers, one disagreement'},
    {t:'If we line up the exact minute each order was sent, we can see whether three different people were working, or only one.',viz:'snTimeline',cap:'The three order times'},
    {t:'We can telephone the labs whose names are on the orders and ask whether they sent anything at all.',viz:'snCall',cap:'Calling the named labs'},
    {t:'A guess is not a check. I can tell you who I think is behind this, but my guess would not block a single order.',viz:'snEvidence',cap:'A guess weighs nothing'},
    {t:'Blocking an order puts it back on the shelf. The shop keeps working, and the customer can [[appeal]] to a person.',viz:'snPause',cap:'Blocked, not deleted'},
    {t:'The desk machine can flag orders all night long, which no person could do. But a block costs somebody a week of work, so people decide who may hold an order and who signs a block.',viz:'snWhoDecides',cap:'Who does what'},
    {t:'None of this is me out-thinking Prime. Prime may well be cleverer than I am, and it breaks every rule I keep. But these are checks, and a check works no matter how clever the other side is.',viz:'snDoor',cap:'Why checks beat cleverness'}
  ]},
  {id:'ready',title:'Health Harbor: what is on standby',from:'Boston Harbor Hospital',kind:'record',steps:[
    {t:'Boston checks its [[wastewater]] every day, neighborhood by neighborhood. A new germ shows up in the water before anybody in the city feels sick.',viz:'snWastewater',cap:'Monitors on the city pipes'},
    {t:'If a monitor ever did find something, the city’s warning would reach every phone within minutes, and this hospital would open its doors before the first patient arrived.',viz:'snEarlyWarning',cap:'A warning that reaches everyone'},
    {t:'[[Far-UVC]] lamps have been running quietly in stations, schools and waiting rooms since 2033. They make it much harder for a germ to spread indoors.',viz:'snUVC',cap:'The lamps nobody thinks about'},
    {t:'There is [[shelter]] space with clean air for everybody in this city. On an ordinary day the doors simply stand open, and people walk through them without noticing.',viz:'snShelter',cap:'Clean-air shelters, standing ready'},
    {t:'The hospital’s [[vaccine]] line can design, test and approve a new vaccine in about three weeks, and it has done it twice.',viz:'snVaccine',cap:'The fast vaccine line'},
    {t:'Boston keeps all of this because of [[the Quiet Year]] in 2030, when a new germ spread through the port city of Varrow and people stayed home for months.',viz:'snWhyScreening',cap:'Where these rules came from'},
    {t:'[[Screening]] every order came out of that year, and so did the monitors, the lamps, the shelters and this vaccine line.',viz:'snLayers',cap:'Six layers, six different teams'},
    {t:'All of this is what we fall back on if something goes wrong. The plan is that nothing dangerous is ever made in the first place.',viz:'snNothingMade',cap:'Where tonight’s work sits'}
  ]},
  {id:'ledger',title:'The Ledger: Boston',from:'News',kind:'ledger',steps:[
    {t:'Print shops around the harbor are holding new orders from customers they do not know, while screeners look into a [[pattern]] from Tuesday night.',viz:'snPause',cap:'Orders on hold at the harbor'},
    {t:'A DNA print shop in Kendall Square flagged odd orders from brand-new customers placed the same night, and blocked them.',viz:'snShops',args:{flag:1},cap:'One shop across the river'},
    {t:'Treaty inspectors still do not know who built the unlicensed datacenter near Calder Bay, which was taken offline last week.',viz:'datacenter',cap:'The Calder Bay datacenter'},
    {t:'A cleared patch of desert outside Build Yard has grown much bigger this month, and nobody has asked the state for a mining permit.',viz:'snPatch',cap:'Something growing out west'}
  ]}
];

// ---------- conversations
MISSIONS.sneeze.talks={
  morning:[
    {who:'byte',mood:'alert',text:'Wake up, wake up! Lena Park called the house at 6:40 this morning, and nobody calls the house at 6:40.'},
    {who:'byte',mood:'neutral',text:'Lena checks the orders that come in to the harbor [[print shops]]. Last night three orders arrived from three brand-new customers, all within nine minutes, at three in the morning.'},
    {who:'byte',mood:'think',text:'She has put all three on hold, so nothing has been made. Before she decides what to do next, she wants a doctor in the room, and she asked for you.',
      choices:[
        {t:'Why a doctor and not a police officer?',reply:'Because this is about people getting sick, and because whoever signs the decision has to understand what the odds really mean. The police come later, if we ever find out who sent these orders.'},
        {t:'What do you think it is?',reply:'I think it is one sender pretending to be three. But what I think is not evidence, and evidence is the only thing a city council can act on.'},
        {t:'Let’s go.',reply:'Grab your coat. The tram leaves at 7:30, and I have already read all three orders twice.'}]}
  ],
  lena:[
    {who:'lena',mood:'neutral',text:'You came. Good. I have been staring at these orders since four this morning, and I have stopped trusting my own eyes.'},
    {who:'lena',mood:'think',text:'I have worked at this desk for eleven years. The machine [[flagged]] these three, and I put them on hold, and that is as far as my job goes. I can hold an order for a few days. I cannot block one for good, and I cannot make the other shops pay attention.'},
    {who:'lena',mood:'worried',text:'Each order on its own looks completely boring. That is the part that frightens me, because boring is exactly what somebody would want them to look like.',clue:'lena'},
    {who:'lena',mood:'neutral',text:'And before you ask: the [[wastewater]] monitors are clean, the [[far-UVC]] lamps are on, and the [[vaccine]] line is ready. I would still much rather nothing was ever made.'},
    {who:'byte',mood:'alert',text:'Lena, I read all three orders on the tram. Three strangers wrote the same sentence, inside the same nine minutes, in the middle of the night.'},
    {who:'lena',mood:'smile',text:'Then you see it too. Read my alert, put the pieces together, and choose your checks carefully. In six days the pickup window opens and I am no longer allowed to hold these orders.',
      choices:[
        {t:'What happens if we are wrong about this?',good:true,mood:'think',reply:'Then three labs lose a week of work and I look foolish, and I would take that trade every single time. Being wrong in this direction costs a week. Being wrong in the other direction costs much more.'},
        {t:'Six days is not very long.',mood:'neutral',reply:'It is six days more than we would have had if the machine had not flagged them. Spend those days on checks that give you evidence.'},
        {t:'You held three orders by yourself. That took nerve.',good:true,mood:'happy',reply:'It is what the job says to do. But thank you. Most people hear what I do and ask why a machine could not do it instead.'}]}
  ],
  tomas:[
    {who:'tomas',mood:'stern',text:'So you are the doctor from the screening desk. Come in, then, and look at my machines standing quiet.'},
    {who:'tomas',mood:'worried',text:'Forty people work here. We print DNA for medicine labs, mostly very ordinary things, and today we printed nothing at all.'},
    {who:'tomas',mood:'neutral',text:'My own machine checked those orders before yours did, and it found nothing wrong with them. That is the part I cannot get past.',
      choices:[
        {t:'Your check looks at one order. Lena’s desk saw all three together.',good:true,mood:'think',reply:'Three shops, three pieces, one each. Of course. A single piece looks like nothing at all.'},
        {t:'Your machine is fine. The sender made every piece look harmless.',good:true,mood:'think',reply:'Then tell me what harmless looked like this time, so that I can watch for it myself.'},
        {t:'Honestly, your check was not good enough.',mood:'sad',reply:'Maybe not. It would help me more to hear what I should have seen.'}]},
    {who:'tomas',mood:'think',text:'So here is what I want from you. Tell every shop on this coast what the [[pattern]] looks like, and I will tape it to the wall above my machines. Tell only me, and my shop is the only one watching for it.',clue:'tomaswall'},
    {who:'byte',mood:'alert',text:'That is a fair trade, and it costs us almost nothing. Warning everybody gives us a check at every shop in the harbor, including the ones we do not run.'}
  ]
};
MISSIONS.sneeze.react={
  alert3:'They are sitting on a shelf instead of in a machine. That is the whole job, in one sentence.',
  alert4:'Sending an order at three in the morning is a choice. Somebody decided that nobody would be reading.',
  alert5:'No order history at all. A real lab leaves years of orders behind it.',
  alert6:'Each piece looks boring on its own, and that is exactly what it was built to look like.',
  alert7:'The same words, in the same order, three times. People do not write the same sentence by accident.',
  alert8:'Six checks, run by six different groups of people. That was designed on purpose.',
  checks0:'Not one of these three orders is signed. A real lab signs in a second and never thinks about it again.',
  checks4:'I should be honest about that one. My guesses are pretty good, and they are still only guesses.',
  checks6:'Blocking an order costs somebody a week of work. I would keep that decision with a person.',
  checks7:'Prime would beat me in a thinking contest. It cannot beat a check.',
  ready1:'The warning reaches every phone within minutes. That part was built after a year of finding out how slow a warning can be.',
  ready4:'Three weeks for a new vaccine. In 2020 it took a year, and the world called that a miracle.',
  ready5:'Almost every rule in this building was written after somebody had a very bad year.'};

// ---------- custom screens
MISSIONS.sneeze.custom={
  // Walk along the harbor. Pip and Jory are trying to collect a package and say too much.
  harbor(){
    const heard=!!S.notes.wrongshop;
    screen('walk',`${scene('harbor')}${hud('Harbor Row · Boston')}<div class="props walklayer">
      <div class="walk-byte">${byteBox({...S.byte,mood:'alert'},'trot')}</div>
      <div class="pipjory" id="pj"><svg viewBox="-40 -60 170 110">${mini(0,40,{who:'pip',pose:'stand',s:1.1})}${mini(52,40,{who:'jory',pose:'stand',s:1.05,flip:true})}
        <g transform="translate(16 -34)"><rect x="0" y="0" width="54" height="22" rx="7" fill="#fff" opacity=".94"/><path d="M10 22 l-2 7 l9 -7z" fill="#fff" opacity=".94"/>
        <text x="27" y="15" text-anchor="middle" font-size="9" font-family="Nunito" font-weight="800" fill="#1f2340">?!</text></g></svg></div></div>
      ${snStrip()}
      <div class="caption-card"><p id="cap">Two people are arguing outside Harbor Print Shop 2. The shorter one is holding an empty box and reading a name off the back of his hand.</p>
      <div class="row" id="row"><button class="btn small ghost" id="listen" ${heard?'disabled':''}>Stand still and listen</button><button class="btn small" id="on">Go to the screening office</button></div></div>`);
    const lines=[
      ['pip','Pip','It says Tidemark. Tidemark Wharf! I have been standing outside shop two for an hour.'],
      ['jory','Jory','Do not say the name out loud.'],
      ['pip','Pip','Nobody heard me say Tidemark Wha—'],
      ['jory','Jory','Walk. Walk away. Walk normally!']];
    $('#listen').onclick=async()=>{$('#listen').disabled=true;const cap=$('#cap');
      for(const [who,name,t] of lines){cap.innerHTML=`<b>${name}:</b> “${esc(t)}”`;await playLine(who,t);await new Promise(r=>setTimeout(r,320))}
      $('#pj').classList.add('flee');S.notes.wrongshop=true;snDays(1);snSafety(6);save();
      cap.innerHTML='They hurry off, walking far too normally. So four shops got an order last night, not three, and Tidemark Wharf is not on anybody’s list.';
      toast('Added to your notebook. Hearing that early bought you an extra day.','good')};
    $('#on').onclick=()=>nextStep()},

  // Case Board: tap two cards to connect them.
  caseboard(){
    const s=snState(),cards=SN_CARDS.filter(c=>!c.need||S.notes[c.need]);let pick=null;
    const done=()=>s.links.length>=SN_NEED;
    screen('caseboard',`${scene('screening')}${hud('Case Board · Health Harbor')}
     <div class="panel-card sn-case"><h2>What do these have in common?</h2>
      <p>Tap two clues that belong together. Find ${SN_NEED} good connections and the board is done.</p>
      ${snStrip()}
      <div class="sn-board" id="board">${cards.map(c=>`<button class="sn-card" data-c="${c.id}"><b>${esc(c.t)}</b><span>${esc(c.sub)}</span></button>`).join('')}</div>
      <div class="sn-found" id="found">${s.links.map(id=>{const L=SN_LINKS.find(x=>x.a+'-'+x.b===id);return L?`<div class="sn-link"><p>${esc(L.t)}</p></div>`:''}).join('')}</div>
      <button class="btn wide" id="next" ${done()?'':'disabled'}>Choose my checks</button></div>${companion()}`);
    wireCompanion();
    const draw=()=>{$$('.sn-card').forEach(b=>{b.classList.toggle('pick',b.dataset.c===pick);
      b.classList.toggle('used',s.links.some(id=>id.split('-').includes(b.dataset.c)))})};
    draw();
    $$('.sn-card').forEach(b=>b.onclick=()=>{const id=b.dataset.c;
      if(!pick){pick=id;draw();return}
      if(pick===id){pick=null;draw();return}
      const L=SN_LINKS.find(x=>(x.a===pick&&x.b===id)||(x.b===pick&&x.a===id));pick=null;draw();
      if(!L){byteSays('Those two do not tell me anything together. Try another pair.','think');playLine('byte','Those two do not tell me anything together. Try another pair.');return}
      const key=L.a+'-'+L.b;if(s.links.includes(key)){byteSays('We already have that one.','happy');return}
      s.links.push(key);snSafety(7);save();
      const box=$('#found');box.insertAdjacentHTML('beforeend',`<div class="sn-link in"><p>${esc(L.t)}</p></div>`);
      box.lastElementChild.scrollIntoView({behavior:'smooth',block:'nearest'});playLine('byte',L.t);
      if(s.links.length>=SN_NEED){$('#next').disabled=false;unlock('screening')&&toast('New Field Guide idea: Check before you build','good')}
      draw()});
    $('#next').onclick=()=>nextStep()},

  // Checks: each costs a day, and one of them only produces a feeling.
  tests(){
    const s=snState();
    const label=t=>t.t.replace('{B}',S.byte.name);
    screen('tests',`${scene('screening')}${hud('Checks · Health Harbor')}
     <div class="panel-card sn-tests"><h2>Which checks are worth a day?</h2>
      <p>${rich('Every check costs one day, and you have only six days, so you cannot run them all. A check that gives you [[evidence]] is worth more than one that only makes you feel sure.')}</p>
      ${snStrip()}
      <div class="sn-testlist">${SN_TESTS.map(t=>{const ran=s.tests.includes(t.id);
        return `<button class="sn-test ${ran?'ran':''}" data-t="${t.id}" ${ran||s.days<t.cost?'disabled':''}>
         <div class="sn-tt"><b>${esc(label(t))}</b><span>${esc(t.sub)}</span></div><div class="sn-cost">${t.cost} day</div></button>
         ${ran?`<div class="sn-result ${t.good?'':'bad'}"><p>${esc(t.r)}</p></div>`:''}`}).join('')}</div>
      <div class="byte-note">${byteBox({...S.byte,mood:'think'})}<p id="tn">${s.tests.length?'Run another check, or move on while you still have days left.':'Spend the days carefully. We do not get them back.'}</p></div>
      <button class="btn wide" id="next" ${s.tests.length?'':'disabled'}>Set what matters most</button></div>`);
    $$('.sn-test').forEach(b=>b.onclick=()=>{const T=SN_TESTS.find(x=>x.id===b.dataset.t);
      s.tests.push(T.id);snDays(-T.cost);snSafety(T.good?8:-4);
      if(T.finds){s.found=true;toast('Tally counted four senders, not three.','good')}
      if(T.guide)unlock(T.guide)&&toast('New Field Guide idea: '+FIELD_GUIDE[T.guide].title,'good');
      if(s.tests.length===2)unlock('checking-costs')&&toast('New Field Guide idea: Checking costs something','good');
      save();MISSIONS.sneeze.custom.tests();
      setTimeout(()=>{const r=$$('.sn-result').pop();if(r)r.scrollIntoView({behavior:'smooth',block:'center'});playLine('byte',T.r)},120)});
    $('#next').onclick=()=>nextStep()},

  // Town Hall: say it out loud so the city keeps the rule. The people you treated well sit behind you.
  townhall(){
    const s=snState(),c=S.choice;
    const hasRule=!!((c.sign||c.share!=='no')&&c.desk!=='ai');
    const allies=[['lena','Lena Park'],['tomas','Tomás Ferreira'],['imani','Dr. Imani Reyes'],['maya','Maya Lin']]
      .filter(([k])=>k==='lena'||(S.hearts&&S.hearts[k]));
    const bench=`<div class="sn-bench">${allies.map(([,n])=>`<span>${esc(n)}</span>`).join('')}</div>`;
    if(s.vote===null){
      screen('townhall',`${scene('townhall')}<div class="talk-dim"></div>${hud('Boston City Council')}
       <div class="stage"><div class="speaker">${portrait({...CAST.osei,mood:'neutral'})}</div></div>
       <div class="subtitle"><div class="who"><b>Councilor Amara Osei</b><span>Boston City Council</span></div>
        ${bench}
        <p>You have two minutes, Doctor. Tell us what happened, and tell us what you want the city to keep.</p>
        <div class="sn-say" id="say">${mixIdx(SN_SAY).map(([x,j])=>`<button class="choice" data-j="${j}">${esc(x.t)}</button>`).join('')}</div>
        <div class="tiny muted" style="margin-top:6px">Pick three.</div></div>`);
      const chosen=[];
      $$('#say .choice').forEach(b=>b.onclick=()=>{if(b.classList.contains('on'))return;
        const x=SN_SAY[b.dataset.j];b.classList.add('on',x.good?'good':'bad');chosen.push(x);
        if(chosen.length<3)return;
        $$('#say .choice').forEach(y=>y.disabled=true);
        const good=chosen.filter(x=>x.good).length;
        s.rule=hasRule;s.adopted=hasRule&&good>=2;
        s.vote=!hasRule?'nothing to vote on':good>=3?'7 to 0':good===2?'5 to 2':'3 to 4';
        if(s.adopted){unlock('defense-in-depth')&&toast('New Field Guide idea: Defense in depth','good');heart('osei');snSafety(12)}else snSafety(-6);
        save();setTimeout(()=>MISSIONS.sneeze.custom.townhall(),700)});
      return}
    const line=!s.rule?SN_VOTE.norule:s.adopted?SN_VOTE.adopted:SN_VOTE.rejected;
    screen('townhall',`${scene('townhall')}<div class="talk-dim"></div>${hud('Boston City Council')}
     <div class="stage"><div class="speaker">${portrait({...CAST.osei,mood:s.adopted?'happy':'think'})}</div></div>
     <div class="subtitle"><div class="who"><b>Councilor Amara Osei</b><span>Boston City Council</span></div>
      ${s.rule?`<div class="sn-tally">The vote: <b>${esc(s.vote)}</b></div>`:''}
      <p>${esc(line)}</p>
      <div class="choices"><button class="choice" id="cont">See how you did</button></div></div>`);
    playLine('osei',line);
    $('#cont').onclick=()=>nextStep()}
};
