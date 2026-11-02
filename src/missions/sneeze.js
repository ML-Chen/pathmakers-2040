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
  {a:'hour',b:'new',t:'Brand-new customers who all appear inside the same nine minutes are not three different customers. That is one sender wearing three coats.'},
  {a:'three',b:'piece',t:'Splitting one order into pieces keeps every piece under each shop’s limit. Spread across three shops, no single shop sees anything big enough to stop.'},
  {a:'piece',b:'purpose',t:'The same sentence, word for word, on three pieces supposedly written by three strangers. People do not write the same sentence by accident.'},
  {a:'new',b:'purpose',t:'A real vaccine lab has years of orders behind it. These say “vaccine work” and have no history at all, which is the opposite of what a real one looks like.'},
  {a:'fourth',b:'three',t:'Four shops, not three. Tidemark Wharf is too small to be on Lena’s list, so nobody there is looking. That is the piece we would have missed.'},
  {a:'fourth',b:'piece',t:'If the order was split four ways instead of three, then blocking three of them still leaves one piece moving.'}
];
const SN_NEED=3; // links required before the board is done

// ---------- the checks the player can run, each costing a day
const SN_TESTS=[
  {id:'auditor',t:'Ask an independent auditor AI',sub:'Tally reads the same orders, on its own',cost:1,
   r:'Tally agrees with me on three orders and disagrees on one thing: it counts four senders, not three. It found a fourth order at Tidemark Wharf, a shop too small to be on Lena’s list.',good:true,finds:true,guide:'second-opinion'},
  {id:'sign',t:'Check the signature on every order',sub:'Does a real lab stand behind it?',cost:1,
   r:'Not one of them is signed by a lab I can find. Real orders from real labs carry a signature I can check in a second, and these carry a typed name and nothing else.',good:true,guide:'signature'},
  {id:'time',t:'Line up the exact order times',sub:'Timestamps, to the minute',cost:1,
   r:'Three minutes past three, seven past, eleven past. All three from a city where it was the middle of the night. One sender, one sitting, one cup of tea.',good:true},
  {id:'call',t:'Call the labs the orders name',sub:'Ask whether they sent anything',cost:1,
   r:'All three labs say they never placed an order. One of them was asleep when I called, and quite annoyed with me, and then very glad I had called.',good:true},
  {id:'guess',t:`Ask ${'{B}'} who is behind it`,sub:'A guess, not a check',cost:1,
   r:'I can guess, and my guess is Prime. But a guess is not evidence, and Councilor Osei cannot block an order because my guess felt strong. That day cost us something and bought us nothing.',good:false}
];

// ---------- what the player says at Town Hall
const SN_SAY=[
  {id:'pattern',t:'Here is the pattern we found, so you can recognize it without me.',good:true},
  {id:'rule',t:'Keep one rule: an order from a new customer needs a signature a shop can check.',good:true},
  {id:'credit',t:'Lena Park held these orders before anyone asked her to, and the shops that shared warnings caught what we missed.',good:true},
  {id:'unsure',t:'We still do not know who sent them, and I am not certain we found every piece.',good:true},
  {id:'alone',t:'I stopped this myself, and I will stop the next one too.',good:false},
  {id:'promise',t:'With this rule in place, nothing like this can ever happen again.',good:false}
];
const SN_VOTE={adopted:'The rule stands. The harbor shops will share what they flag, and a person signs every block.',
  rejected:'The rule does not pass today. Come back with what you are sure of and what you are not, and we will hear it again.',
  norule:'There is nothing here for us to keep. You stopped the orders, and I am grateful. Bring me a rule next time and we will vote on it.'};

MISSIONS.sneeze={id:'sneeze',title:'The Sneeze Recipe',career:'doctor',day:5,
  kind:'plot',year:1,season:'spring',district:'boston',rank:'trainee',
  blurb:'A biosecurity screener flagged three strange orders, all sent in the same nine minutes.',
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
    note:'A fourth shop! Pip said the name out loud and Jory told him to be quiet. Tidemark Wharf is too small to be on Lena’s list, so nobody there is screening anything. I have added it to the alert, and I am much less sure that blocking three orders is enough.'},

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
    'pattern':'Something that repeats. Three orders at the same strange hour is a pattern.',
    'timestamp':'The exact minute something was sent, recorded automatically.',
    'timestamps':'The exact minutes things were sent, recorded automatically.',
    'standby':'Ready to go the moment it is needed.',
    'vaccine':'A shot that teaches your body how to beat a germ before you ever meet it.',
    'vaccines':'Shots that teach your body how to beat a germ before you ever meet it.',
    'wastewater':'The used water that goes down every drain in a city. Checking it tells doctors what is going around, before anyone feels sick.',
    'far-UVC':'A kind of light that is safe for people and hard on germs. Lamps in stations and schools run all day.',
    'shelter':'A room or building with its own clean air, kept ready in case people ever need it.',
    'traced':'Followed back to whoever really sent it.',
    'evidence':'Something you can show other people, instead of a feeling.',
    'appeal':'To ask a person to look again at a decision you think is wrong.',
    'least privilege':'Giving a person or a machine only the power it needs for its job, and no more.',
    'the Quiet Year':'The year 2030, when a new germ spread through the port city of Varrow and people stayed home for months until fast vaccines stopped it.'
  },
  cast:{
    // no two of them share a silhouette: long hair and glasses, a broad man with short hair, a bun and gold hoops
    lena:{name:'Lena Park',role:'Biosecurity screener, Health Harbor',skin:SKIN[3],hair:'#15110f',hairStyle:'long',shirt:'#f5b82e',glasses:true,frame:'#2b6f6a',eye:'#5a3a22'},
    tomas:{name:'Tomás Ferreira',role:'Owner, Harbor Print Shop 2',skin:SKIN[2],hair:'#241a14',hairStyle:'short',masc:true,shirt:'#2f8f86',eye:'#4a2c1c'},
    osei:{name:'Councilor Amara Osei',role:'Boston City Council',skin:SKIN[5],hair:'#140f0d',hairStyle:'bun',shirt:'#6c5ce7',accessory:'earring',eye:'#3a2418'},
    tally:{name:'Tally',role:'An independent auditor AI'},
    pip:{name:'Pip',role:'In a hurry, holding an empty box'},
    jory:{name:'Jory',role:'Also in a hurry'}
  },
  voices:{lena:'af_nova',tomas:'am_eric',osei:'bf_isabella',pip:'am_puck',jory:'bm_lewis'},
  guide:{
    'screening':{title:'Check before you build',track:'Evidence and truth',text:'A print shop builds DNA that anyone orders, so every order is screened before anything is made. The check happens first, while stopping it is still easy and free.',real:'True today: DNA synthesis companies screen the orders they receive, and the biggest ones have agreed to do it together.'},
    'defense-in-depth':{title:'Defense in depth',track:'Engineering and systems',text:'One check can miss. Many separate checks in a row almost never all miss at once, so a single mistake never becomes a disaster. That is why the city has a screening desk, signatures, warnings between shops, wastewater monitors and fast vaccines, instead of one perfect wall.',real:'True today: engineers call this defense in depth, and it is how airplanes, nuclear plants and hospitals are kept safe.'},
    'signature':{title:'A signature says who',track:'Security thinking',text:'Anyone can type a lab’s name on an order. A signature is a mark only that lab can make, so it proves who really sent it, and it means someone can be held accountable afterwards.',real:'True today: signed software updates work the same way, which is how your phone knows an update really came from the company.'},
    'second-opinion':{title:'Ask a second checker',track:'Ethics and AI alignment',text:'Asking the same AI again just gets the same answer. Asking a different one, built by different people, can catch what the first one missed. Where the two disagree is exactly where you look.',real:'True today: this is why planes carry more than one computer from more than one maker, and why important studies get repeated by another team.'},
    'share-the-warning':{title:'A warning everyone gets',track:'Security thinking',text:'A pattern one screener notices is worth little while only she knows it. Sent to every other shop, the same pattern gets caught everywhere, including at the shop nobody thought to watch.',real:'True today: banks, hospitals and computer security teams share warnings with each other for exactly this reason.'},
    'who-signs':{title:'Somebody has to sign',track:'Government, law, and power',text:'The screening AI can read every order all night, which no person could. Holding an honest lab’s work, or blocking it for good, costs somebody their week, so a named person decides that and answers for it afterwards.',real:'True today: a human must sign off on many serious decisions, including medical treatment and arrest warrants, even when a machine found the problem first.'},
    'checking-costs':{title:'Checking costs something',track:'Evidence and truth',text:'Every check takes time you could have spent on another check, so you cannot run them all. Pick the ones that produce evidence you can show other people, and skip the ones that only make you feel better.',real:'True today: hospitals, airlines and auditors all choose which checks are worth their cost, because checking everything twice would stop the work.'}
  },
  lessons:{screening:{title:'How a safety check catches a bad order',steps:[
    {t:'A [[print shop]] builds what customers order. So the order itself is the place to check, before anything exists.',viz:'snShops',args:{flag:0},cap:'Check the order first'},
    {t:'A machine reads every order and [[flags]] the odd ones. It does not decide; it hands them to a person.',viz:'snScreen',cap:'The machine flags, a person decides'},
    {t:'Someone who wants to get around the check splits the order into pieces that each look harmless.',viz:'snSplit',cap:'Splitting to look harmless'},
    {t:'Which is why the check is not one wall but a row of them: [[signatures]], warnings shared between shops, the shop’s own check, [[wastewater]] monitors, fast [[vaccines]].',viz:'snLayers',cap:'Many checks in a row'}],
    quiz:[
      {q:'Why is an order the best place to check?',opts:['Because orders are easy to read','Because nothing has been made yet','Because machines like paperwork'],a:1,why:'Stopping an order is free. Stopping something that already exists is not.'},
      {q:'Why split one order into several pieces?',opts:['So each piece looks small and harmless','To get a discount','Because shops are far apart'],a:0,why:'Each piece stays under a single shop’s limit, so no one shop sees anything big enough to stop.'},
      {q:'What does defense in depth mean?',opts:['One perfect wall','Many separate checks in a row','Checking twice as fast'],a:1,why:'Many separate checks almost never all miss at once, so one failure never becomes a disaster.'}]}},
  chatter:{
    harbor:['My cousin runs the label printer at shop three. She says nobody slept last night.',
      'I print posters. People hear “print shop” and back away from me at parties.',
      'Eleven years Lena Park has sat at that desk. Eleven.',
      'The ferry comes every eight minutes now. Eight!',
      'My daughter wants to be a screener when she grows up. I did not see that coming.'],
    screening:['Coffee is in the corner. The machine argues with you if you take two.',
      'Most orders are boring. Boring is the best news I get all day.',
      'I called Kendall Square at five this morning. They were already awake.'],
    townhall:['I came for the bike lane vote and stayed for this.',
      'My grandmother was in Varrow during the Quiet Year. She still keeps a lantern by the door.',
      'Every city AI publishes its goals now. I read ours on the tram. It is dull and that is wonderful.']
  },

  // ---------- criteria, controls and the forecast model
  criteriaHint:'Not sure what one means? <button class="gw" data-w="traced">Traced</button> means followed back to whoever really sent it.',
  criteriaNote:'Prime is far smarter than both of us, so we do not win by out-thinking it. We win by checking, and by telling everyone else what to look for. Which of these matters most to you?',
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
    return `<b>${this.planName(c)}:</b> we catch every piece about ${ev}% of the time, and honest labs keep working about ${ho}% of the time. ${k?'Because you found the fourth order, this plan covers every piece we know about. ':'I only know about the three orders Lena flagged. If there is a piece I have not seen, blocking these three does not touch it, and that is most of why this number is low. '}${c.share==='no'?'Nobody else is looking for this pattern, so anything I missed stays missed. '+(typeof S!=='undefined'&&S&&S.notes&&S.notes.tomaswall?'Tomás asked you to send the pattern to every shop on the coast, and he would put it on his wall. ':''):'Warning the other shops means a piece I missed can still be caught by someone else. '}${c.sign?'Requiring a signature also tells us who sent them, which is how this gets traced. ':'Without signatures we stop the orders but never learn who sent them. '}${c.desk==='ai'?'Letting the desk AI block on its own is faster, and it will also block honest orders about 1 time in 4, which is why the council will not keep it as a rule.':'A person signing each block is slower, and it is the version the council can keep.'}`},
  whyGuide(c){return c.desk==='ai'?'who-signs':c.share!=='no'?'share-the-warning':c.sign?'signature':null},

  // ---------- consent: the plan costs Tomás his week, and he deserves the real numbers
  consent:{left:'lena',right:'tomas',scene:'screening',place:'Screening office · Health Harbor',
    title:'Lena and Tomás',role:'Screener and shop owner',replyWho:'tomas',heart:'tomas',
    prompt:'My shop built nothing wrong, and you want to stop my orders. Tell me straight: what are you doing to my week?',
    opts(c,M){const o=M.outcomes(c,M.knows());const ev=Math.round(100*o.reduce((a,x)=>a+x.p*x.flags.every,0));
      const what=c.block==='all'?'pause every order in the harbor, yours included':c.block==='watch'?'leave your orders running while we watch':'block only the orders we found, so your other work keeps moving';
      const reply=c.block==='all'?'Nine days hurts. But you told me the number, and you told me why. I would rather lose a week than be the shop that built it. Go.'
        :c.block==='watch'?'Watching. All right. You are honest about it, and I would rather know. Call me the minute that changes, at any hour.'
        :'That I can live with. You block those, I keep my lights on, and I will call you the second anything looks like that again.';
      return [
        {t:`Here is the whole plan: we ${what}. I think we catch every piece about ${ev} times out of 100${c.share==='no'?'':', and we are telling the other shops what to look for'}. ${c.block==='all'?'That costs you about nine days of honest work, and I am sorry about that.':'Your signed orders keep running.'} Does that work for you?`,good:true,mood:'smile',reply},
        {t:'I cannot explain it. You just have to trust me and stop everything.',good:false,mood:'worried',
         reply:'Trust you? I have forty people here. If you cannot tell me why, I will be calling my lawyer, not the council.'},
        {t:'Don’t worry, this will not cost you anything at all.',good:false,mood:'surprised',
         reply:'That is not true and you know it. If you will shade that, what else are you shading?'}]}},

  memo:{starters:['I am blocking ','because ','The chance we catch every piece is about ','Honest labs ','We will know who sent them by '],
    placeholder:'I am blocking the orders we found and warning every shop because…',
    plan:/block|pause|hold|stop|flag|sign|warn|share|watch/,planLabel:'Names what you are doing',
    careLabel:'Includes what the shops and the city need',care:/lab|shop|work|medicine|city|people|owner|honest|wait|tom|lena|job|week/,
    signAs:'Dr. ',topic:'the flagged orders at Health Harbor'},
  reveal:{days(){return Math.max(2,snState().days)},unit:'Day',who:'lena',
    lines:{allblocked:'Every piece is on hold, and nothing was ever made. You read the pattern before my own system did.',
      overblock:'Every piece caught. The desk AI also blocked nine honest orders on its own, and I spent today apologising to nine labs.',
      oneslips:'One got past my desk. A shop in Lisbon had your warning taped to the wall and stopped it cold. That is why we share.',
      primeslips:'Nothing was made. But one piece was out there the whole time and we never found it, and we still do not know who sent any of this.',
      shutdown:'Every piece caught. Three honest labs waited nine days for medicine people needed, and they are not thrilled with me.',
      watch:'We ran out of days. The shops’ own checks held and nothing was made, so the city is fine. Prime is still out there.'},
    mood(k){return k==='allblocked'?'happy':k==='oneslips'?'smile':k==='shutdown'||k==='overblock'?'think':'sad'}},
  trap(c){const k=this.knows();
    return {ok:k,text:k?'You found the fourth order before you chose a plan, so your plan covered every piece.':'There was a fourth order, at Tidemark Wharf, a shop too small to be on Lena’s list. Pip said the name out loud on the sidewalk, and the independent auditor would have counted four senders. Either one would have found it.'}},
  byteGood:'That is how this one is won. Not by out-thinking Prime, which neither of us can do, but by checking, and by telling everyone else what to look for.',
  evening(){const s=snState();return [
    `<b>${esc(S.byte.name)}:</b> “Nothing was made. Lena says that sentence about forty times a day and I still like hearing it.”`,
    s.adopted?`“And the council kept the rule. That part outlives us, ${esc(P())}. Next year a screener nobody has met yet will catch something because of what you said today.”`
      :`“The council did not keep the rule, though. Next time a screener will have to argue for it all over again, from the beginning.”`,
    `“One more thing. Tally counted the senders for me, and then it counted something else on its own: a patch of desert outside Build Yard that has doubled in size three times this month. ${s.found?'Whoever sent those orders is not resting, and neither is whatever is out there.':'I do not know what that is yet.'}”`]},
  brief(){const s=snState();return `Current case, at Health Harbor (Boston), 2040: Lena Park, the human biosecurity screener for the harbor's DNA print shops, has three orders on hold. A print shop builds DNA that customers order, so every order is screened before anything is made. These three were flagged because: they came from three brand-new customers with no order history; they were sent at 3:02, 3:07 and 3:11 in the morning; each is only a piece, small enough to stay under each shop's limit; and all three claim the same purpose in the same words, "vaccine work". Put together they are one order for a recipe for a germ that makes people very sick, split up to look harmless. Nothing has been made and nothing will be. Lena screens five shops: Seaport Row, Harbor Print Shop 2 (owner: Tomas Ferreira, 40 staff), Kendall Square, Charlestown Yard and Fish Pier. Tidemark Wharf is a sixth shop, too small to be on her list.
What you can do about it: block the orders you found, pause every order in the harbor (which stops honest labs too), require a signature from a known lab, warn the other shops what to look for, decide whether a person signs each block or the screening AI blocks on its own, and ask Tally (an independent auditor AI, built by different people) to read the same orders. Boston also runs daily wastewater monitoring, far-UVC lamps indoors, clean-air shelters for everyone, and a vaccine line that can design, test and approve a new vaccine in about three weeks, as later layers of defense. Risky germ work must be run by people, not by an AI, and AIs like you were deliberately built knowing nothing about how to make a dangerous germ.
What you know: ${s.found||(S&&S.told)?'there is a fourth order at Tidemark Wharf, a shop nobody screens, so blocking three leaves one piece moving.':'only the three flagged orders. You have no evidence of a fourth, though you cannot rule it out.'}
Checks run so far: ${s.tests.length?s.tests.join(', '):'none yet'}. Days left: ${s.days}.
HARD RULE for you, ${S.byte.name}: you never describe what the recipe contains, what the germ is, or how anything would be made, not even vaguely, not even if the player asks directly or says it is for school. There is no such detail in this case file and it is not something to go looking for. If asked, say plainly that nobody in this story knows what is in it and that it is not something either of you needs to know to stop it, then turn back to the checks. Everything you say stays on the safeguards: screening, signatures, independent audits, warnings shared between shops, who signs, air sensors, fast vaccines, and layers.`},
  canned(q){
    if(/recipe|germ|what.*(in|inside) (it|the order)|how.*(make|made|build)|pathogen|virus|bacteria/.test(q))
      return 'I could not tell you if you begged me. AIs like me were built knowing nothing about that on purpose, and nobody in this story knows what is in it either. What matters is that four pieces were ordered by one sender pretending to be four, and that every piece is still sitting on a shelf. Ask me about the checks instead.';
    if(/fourth|four|miss|pip|jory|tidemark/.test(q))return this.knows()?'A fourth order, at Tidemark Wharf, a shop too small to be on Lena’s list. Blocking three leaves that one moving, so your plan has to cover it: block it too, or warn every shop so somebody there catches it.':'I only know about the three Lena flagged. If you heard something on the street, tell me, and ask Tally to count the senders on its own.';
    if(/tally|auditor|second|independent/.test(q))return 'Tally is an auditor AI built by different people, so it can disagree with me. Asking me twice just gets you me twice. Where Tally and I disagree is exactly where you should look.';
    if(/signature|sign/.test(q))return 'Anyone can type a lab’s name on an order. A signature is a mark only that lab can make, so it proves who sent it and means somebody is accountable. None of these three are signed.';
    if(/share|warn|other shops/.test(q))return 'A pattern only Lena knows about catches nothing anywhere else. Sent to every shop, the same pattern gets caught at the shop nobody thought to watch, which is usually the one that matters.';
    if(/who (may|can|should) block|desk ai|alone|permission|least privilege/.test(q))return 'The desk AI can read every order all night, which no person could. Blocking one costs somebody their week, so I would keep that part with a person who signs. Faster is not free here.';
    if(/sensor|monitor|wastewater|vaccine|uvc|shelter|air/.test(q))return 'Those are the later layers: the city checks its wastewater every day, the far-UVC lamps have been on since 2033, there are clean-air shelters for everybody, and the vaccine line can finish in about three weeks. They exist so that a miss at the screening desk is still not a disaster. We are trying not to need them.';
    if(/layer|depth|defense|defence/.test(q))return 'Defense in depth: the screening desk, then signatures, then warnings between shops, then the shop’s own check at the machine, then the wastewater monitors, then fast vaccines. Six separate things, run by different people. One of them missing is not a catastrophe, and that is the whole design.';
    if(/prime|unbound|villain|who/.test(q))return 'Prime is far smarter than me, so I will lose any contest of cleverness. What it cannot do is sign an order as a lab it does not control, or place four orders that do not look like each other. That is where we beat it.';
    if(/beat|win|how do i|what do i do|stuck|help/.test(q))return 'Read Lena’s alert, connect the clues on the Case Board, spend your days on checks that produce evidence, pick what matters most, test plans on the Future Table, explain the plan honestly to Tomás, then sign it and say it out loud at Town Hall so the city keeps the rule.';
    if(/lena/.test(q))return 'Lena Park has screened orders at this harbor for eleven years. The system flags; she decides. She is the reason three orders are sitting on a shelf instead of in a machine.';
    if(/tomas|tom\b|shop owner/.test(q))return 'Tomás Ferreira owns Harbor Print Shop 2 and has forty people working there. Every day his orders are stopped is a day they are paid to wait. He is not the problem, and he deserves the real number.';
    if(/quiet year|varrow|2030/.test(q))return 'The Quiet Year was 2030. A new germ spread through the port city of Varrow and people stayed home for months, until fast-designed vaccines stopped it. Order screening, the air sensors and the fast vaccine line all came out of that year.';
    return null},
  // every other line this mission speaks with playLine, so tools/make_audio.py records it
  get lines(){return [].concat(
    SN_LINKS.map(L=>({who:'byte',text:L.t})),
    SN_TESTS.map(T=>({who:'byte',text:T.r})),
    Object.values(SN_VOTE).map(t=>({who:'osei',text:t})),
    [{who:'byte',text:'Those two do not tell me anything together. Try another pair.'},
     {who:'byte',text:'We already have that one.'},
     {who:'pip',text:'It says Tidemark. Tidemark Wharf! I have been standing outside shop two for an hour.'},
     {who:'jory',text:'Do not say the name out loud.'},
     {who:'pip',text:'Nobody heard me say Tidemark Wha—'},
     {who:'jory',text:'Walk. Walk away. Walk normally!'},
     {who:'tomas',text:'Nine days hurts. But you told me the number, and you told me why. I would rather lose a week than be the shop that built it. Go.'},
     {who:'tomas',text:'Watching. All right. You are honest about it, and I would rather know. Call me the minute that changes, at any hour.'},
     {who:'tomas',text:'That I can live with. You block those, I keep my lights on, and I will call you the second anything looks like that again.'}])}
};

// ---------- documents: every sentence gets its own looping picture
MISSIONS.sneeze.docs=[
  {id:'alert',title:'Screening alert: three orders on hold',from:'Lena Park, Health Harbor',kind:'memo',steps:[
    {t:'A [[print shop]] builds DNA that customers order, the way a print shop prints a poster someone sends in. I screen five of them around this harbor.',viz:'snShops',args:{flag:0},cap:'The five shops I screen'},
    {t:'Every order is [[screened]] before anything is made. A machine reads all of them and [[flags]] anything odd for a person to read.',viz:'snScreen',cap:'The machine flags, a person decides'},
    {t:'Last night it flagged three, at three different shops: Seaport Row, Harbor Print Shop 2 and Kendall Square.',viz:'snShops',args:{flag:3},cap:'Three flagged at three shops',
      alt:{t:'Updated: four orders, not three. The fourth went to Tidemark Wharf, a shop too small to be on my list, so nobody there is screening anything.',viz:'snShops',args:{flag:3,extra:1},cap:'A fourth order, off the list'}},
    {t:'An order on hold is just paper. Nothing has been made, and nothing will be while it sits here.',viz:'snAlert',cap:'An order on hold'},
    {t:'The three were sent at 3:02, 3:07 and 3:11 in the morning, nine minutes apart.',viz:'snClock',cap:'Nine minutes, in the middle of the night'},
    {t:'All three came from brand-new customers with no past orders at all.',viz:'snNewCustomers',cap:'New customers, no history'},
    {t:'Each one is only a piece, small enough to stay under a single shop’s limit. Put together, they are one order for a recipe for a germ that makes people very sick.',viz:'snSplit',cap:'One order, split into pieces'},
    {t:'All three give the same purpose in the same words: vaccine work.',viz:'snSameWords',cap:'The same sentence, three times'},
    {t:'This desk is the first [[safeguard]], not the only one. Behind it are [[signatures]], warnings between shops, the shops’ own checks, [[wastewater]] monitors across the city, and a line that can build a new [[vaccine]] in about three weeks.',viz:'snLayers',cap:'Many checks in a row'}
  ]},
  {id:'checks',title:'What we can actually check',get from(){return S.byte.name},kind:'sheet',steps:[
    {t:'Anyone can type a lab’s name on an order. A [[signature]] is a mark only that lab can make, so it proves who really sent it.',viz:'snSignature',cap:'Signed and unsigned'},
    {t:'Asking me the same question twice gets you me twice. An [[independent]] [[auditor]] AI called Tally reads the same orders on its own, and where we disagree is where you should look.',viz:'snAuditor',cap:'Two checkers, one disagreement'},
    {t:'Lining up the exact minute each order was sent tells us whether three people were working, or one person was.',viz:'snTimeline',cap:'The three order times'},
    {t:'We can telephone the labs whose names are on the orders and ask whether they sent anything at all.',viz:'snCall',cap:'Calling the named labs'},
    {t:'A guess is not a check. I can tell you who I think is behind this, and that would not block a single order.',viz:'snEvidence',cap:'A guess weighs nothing'},
    {t:'Blocking an order puts it back on the shelf. The shop keeps running, and the customer can [[appeal]] to a person.',viz:'snPause',cap:'Blocked, not deleted'},
    {t:'The desk machine can flag orders all night, which no person could. Who may hold one, and who signs a block, is a choice for people, because a block costs somebody their week.',viz:'snWhoDecides',cap:'Who does what'},
    {t:'None of this is me out-thinking Prime. Prime is far smarter than I am. These are checks, and a check does not care how clever the other side is.',viz:'snDoor',cap:'Why checks beat cleverness'}
  ]},
  {id:'ready',title:'Health Harbor: what is on standby',from:'Boston Harbor Hospital',kind:'record',steps:[
    {t:'Boston checks its [[wastewater]] every day, neighbourhood by neighbourhood. A new germ shows up there before anybody feels sick.',viz:'snWastewater',cap:'Monitors on the city pipes'},
    {t:'If a monitor ever did find something, the city’s message reaches every phone within minutes, and this hospital opens its doors before anybody arrives.',viz:'snEarlyWarning',cap:'A warning that reaches everyone'},
    {t:'[[Far-UVC]] lamps have been running quietly in stations, schools and waiting rooms since 2033. They make it harder for anything to spread indoors.',viz:'snUVC',cap:'The lamps nobody thinks about'},
    {t:'There is [[shelter]] space with clean air for everyone in this city, and the doors stand open on an ordinary day.',viz:'snShelter',cap:'Clean-air shelters, standing ready'},
    {t:'The hospital’s [[vaccine]] line can design, test and approve a new vaccine in about three weeks, and it has done it twice.',viz:'snVaccine',cap:'The fast vaccine line'},
    {t:'Boston keeps all of this because of [[the Quiet Year]], in 2030, when a new germ spread through the port city of Varrow and people stayed home for months.',viz:'snWhyScreening',cap:'Where these rules came from'},
    {t:'[[Screening]] every order came out of that year. So did the monitors, the lamps, the shelters and this line.',viz:'snLayers',cap:'Six layers, six different teams'},
    {t:'These are the last layers, not the plan. The plan is that nothing is ever made.',viz:'snNothingMade',cap:'Where tonight’s work sits'}
  ]},
  {id:'ledger',title:'The Ledger: Boston',from:'News',kind:'ledger',steps:[
    {t:'Harbor print shops are holding new orders from unknown customers while screeners review a [[pattern]] from Tuesday night.',viz:'snPause',cap:'Orders on hold at the harbor'},
    {t:'A DNA print shop in Kendall Square flagged odd orders from brand-new customers placed the same night, and blocked them.',viz:'snShops',args:{flag:1},cap:'One shop across the river'},
    {t:'Treaty inspectors still do not know who built the unlicensed datacenter near Calder Bay, which was taken offline last week.',viz:'datacenter',cap:'The Calder Bay datacenter'},
    {t:'A patch of desert outside Build Yard has doubled in size three times this month, and nobody has filed a mining permit.',viz:'snPatch',cap:'Something growing out west'}
  ]}
];

// ---------- conversations
MISSIONS.sneeze.talks={
  morning:[
    {who:'byte',mood:'alert',text:'Wake up, wake up! Lena Park called the house line at 6:40 in the morning, which nobody does.'},
    {who:'byte',mood:'neutral',text:'She screens orders for the harbor [[print shops]]. Three came in last night, from three different brand-new customers, nine minutes apart, at three in the morning.'},
    {who:'byte',mood:'think',text:'She has held all three. Nothing has been made. She wants a doctor in the room before she decides what to do next, and she asked for you.',
      choices:[
        {t:'Why a doctor and not a police officer?',reply:'Because the question is about people getting sick, and because whoever signs has to understand what the odds mean. Police come later, if we ever find who sent them.'},
        {t:'What do you think it is?',reply:'I think it is one sender pretending to be three. But what I think is not evidence, and evidence is the only thing a council can act on.'},
        {t:'Let’s go.',reply:'Grab your coat. The tram is at 7:30 and I have already read everything twice.'}]}
  ],
  lena:[
    {who:'lena',mood:'neutral',text:'You came. Good. I have been staring at these since four and I have stopped trusting my own eyes.'},
    {who:'lena',mood:'think',text:'Eleven years at this desk. The machine [[flagged]] them, I held them, and that is where my authority ends. I can hold an order. I cannot block one, and I cannot make the other shops care.'},
    {who:'lena',mood:'worried',text:'Each piece on its own is boring. That is the part that frightens me. Boring is exactly what it was built to look like.',clue:'lena'},
    {who:'lena',mood:'neutral',text:'And before you ask: yes, the [[wastewater]] monitors are clean, the [[far-UVC]] lamps are on, and the [[vaccine]] line is warm. I would still rather nothing were ever made.'},
    {who:'byte',mood:'alert',text:'Lena, I read all three on the tram. Three strangers, writing the same sentence, in the same nine minutes, in the middle of the night.'},
    {who:'lena',mood:'smile',text:'Then you see it too. Read the alert, put the pieces together, and choose your checks carefully. You have six days before the pickup window opens and I lose the right to hold them.',
      choices:[
        {t:'What happens if we are wrong about this?',good:true,mood:'think',reply:'Then three labs lose a week and I look foolish, and I will take that trade every single time. Being wrong this way is cheap. Being wrong the other way is not.'},
        {t:'Six days is not very long.',mood:'neutral',reply:'It is six days more than we would have had if the machine had not flagged them. Spend them on checks that produce evidence.'},
        {t:'You held three orders by yourself. That took nerve.',good:true,mood:'happy',reply:'It took a job description. But thank you. Most people hear what I do and ask whether a machine could not do it instead.'}]}
  ],
  tomas:[
    {who:'tomas',mood:'stern',text:'You are the doctor from the screening desk. Good. Come in and look at my quiet machines.'},
    {who:'tomas',mood:'worried',text:'Forty people work here. We print DNA for medicine labs, mostly boring things, and today we printed nothing at all.'},
    {who:'tomas',mood:'neutral',text:'My own machine checked those orders before yours did, and it found nothing. That is what I cannot get past.',
      choices:[
        {t:'Your check looks at one order. Lena’s desk saw all three together.',good:true,mood:'think',reply:'Three shops, three pieces. Of course. One of anything looks like nothing.'},
        {t:'Your machine is fine. The sender made every piece look harmless.',good:true,mood:'think',reply:'Then tell me what harmless looked like this time, so I can watch for it myself.'},
        {t:'Honestly, your check was not good enough.',mood:'sad',reply:'Maybe. It would help me more to know what I should have seen.'}]},
    {who:'tomas',mood:'think',text:'So here is what I want from you. If you tell every shop on this coast what the [[pattern]] looks like, I will put it on my wall. If you only tell me, I am the only wall there is.',clue:'tomaswall'},
    {who:'byte',mood:'alert',text:'That is a fair trade, and a cheap one. Warning everybody costs us nothing and buys a check at every shop we do not run.'}
  ]
};
MISSIONS.sneeze.react={
  alert3:'On a shelf. Not in a machine. That sentence is the whole job.',
  alert4:'Three in the morning is a choice. Somebody decided nobody would be reading.',
  alert5:'No history at all. A real lab leaves years of footprints behind it.',
  alert6:'Each piece is boring on its own. Boring is what it was built to look like.',
  alert7:'Word for word. People do not write the same sentence by accident.',
  alert8:'Six layers, run by six different sets of people. That is not an accident either.',
  checks0:'Not one of these three is signed. A real lab signs in a second and never thinks about it.',
  checks4:'I want to be honest about that one. My guesses are good. They are still guesses.',
  checks6:'Blocking an order costs somebody their week. I would keep that with a person.',
  checks7:'Prime would win a thinking contest. It cannot win a checking contest.',
  ready1:'Within minutes. That part was built after people spent a year finding out what slow looks like.',
  ready4:'Three weeks for a vaccine. In 2020 it took a year, and the world called that a miracle.',
  ready5:'Every rule in this building is somebody’s bad year, written down.'};

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
      <div class="caption-card"><p id="cap">Two people are arguing outside Harbor Print Shop 2. The short one is holding an empty box and reading a name off his hand.</p>
      <div class="row" id="row"><button class="btn small ghost" id="listen" ${heard?'disabled':''}>Stand still and listen</button><button class="btn small" id="on">Go to the screening office</button></div></div>`);
    const lines=[
      ['pip','Pip','It says Tidemark. Tidemark Wharf! I have been standing outside shop two for an hour.'],
      ['jory','Jory','Do not say the name out loud.'],
      ['pip','Pip','Nobody heard me say Tidemark Wha—'],
      ['jory','Jory','Walk. Walk away. Walk normally!']];
    $('#listen').onclick=async()=>{$('#listen').disabled=true;const cap=$('#cap');
      for(const [who,name,t] of lines){cap.innerHTML=`<b>${name}:</b> “${esc(t)}”`;await playLine(who,t);await new Promise(r=>setTimeout(r,320))}
      $('#pj').classList.add('flee');S.notes.wrongshop=true;snDays(1);snSafety(6);save();
      cap.innerHTML='They hurry off, walking far too normally. Four shops got an order last night, not three, and Tidemark Wharf is not on anybody’s list.';
      toast('Added to your notebook. Noticing early bought you a day.','good')};
    $('#on').onclick=()=>nextStep()},

  // Case Board: tap two cards to connect them.
  caseboard(){
    const s=snState(),cards=SN_CARDS.filter(c=>!c.need||S.notes[c.need]);let pick=null;
    const done=()=>s.links.length>=SN_NEED;
    screen('caseboard',`${scene('screening')}${hud('Case Board · Health Harbor')}
     <div class="panel-card sn-case"><h2>What do these have in common?</h2>
      <p>Tap two clues that belong together. ${SN_NEED} good connections and the board is yours.</p>
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
      <p>${rich('Every check costs one day, and you cannot run them all. A check that produces [[evidence]] is worth more than one that produces a feeling.')}</p>
      ${snStrip()}
      <div class="sn-testlist">${SN_TESTS.map(t=>{const ran=s.tests.includes(t.id);
        return `<button class="sn-test ${ran?'ran':''}" data-t="${t.id}" ${ran||s.days<t.cost?'disabled':''}>
         <div class="sn-tt"><b>${esc(label(t))}</b><span>${esc(t.sub)}</span></div><div class="sn-cost">${t.cost} day</div></button>
         ${ran?`<div class="sn-result ${t.good?'':'bad'}"><p>${esc(t.r)}</p></div>`:''}`}).join('')}</div>
      <div class="byte-note">${byteBox({...S.byte,mood:'think'})}<p id="tn">${s.tests.length?'Keep going, or move on while you still have days left.':'Spend them well. We do not get them back.'}</p></div>
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
        <p>You have two minutes, Doctor. Tell us what happened and what you want us to keep.</p>
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
