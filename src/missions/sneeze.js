// sneeze.js — Health Harbor villain plot: "The Sneeze Recipe".
// Prime split one order for a recipe for a germ that makes people very sick across several DNA print
// shops, disguised as vaccine work. The player connects the orders on a Case Board, runs real checks
// (an independent auditor AI, signatures, order times), blocks the orders, and gets the city to keep
// the rule. Nothing is ever made and nothing bad happens on screen.
//
// EVERYTHING HERE STAYS AT THE LEVEL OF SAFEGUARDS: order screening, signatures, independent audits,
// sharing warnings between shops, air sensors on standby, fast vaccines. No mechanism, no biology,
// no detail about what a recipe contains, anywhere, including in Byte's chat context below.
//
// Lives entirely in its own files: this mission, src/viz/sneeze.js (pictures), src/scenes/*.js
// (painted backgrounds) and src/css/sneeze.css (styles). It needs no changes to game.js.

Object.assign(GLOSSARY,{
  'biosecurity':'The work of keeping people safe from dangerous germs.',
  'screening':'Checking every order before anything is made, so the dangerous ones never get built.',
  'screened':'Checked before anything is made.',
  'print shop':'A lab that builds DNA to order, the way a print shop prints a poster someone sends in.',
  'print shops':'Labs that build DNA to order, the way a print shop prints a poster someone sends in.',
  'flagged':'Marked by a machine so a person will look at it.',
  'flags':'Marks an order so a person will look at it.',
  'signature':'A mark only one lab can make, which proves the order really came from them.',
  'signatures':'Marks only one lab can make, which prove an order really came from them.',
  'auditor':'Someone whose only job is to check other people’s work.',
  'independent':'Not run by the same people, so it is free to disagree.',
  'safeguard':'Something set up ahead of time so harm never happens.',
  'defense in depth':'Many separate safeguards in a row, so one failure never becomes a disaster.',
  'pattern':'Something that repeats. Three orders at the same strange hour is a pattern.',
  'timestamp':'The exact minute something was sent, recorded automatically.',
  'timestamps':'The exact minutes things were sent, recorded automatically.',
  'standby':'Ready to go the moment it is needed.',
  'vaccine':'A shot that teaches your body how to beat a germ before you ever meet it.',
  'vaccines':'Shots that teach your body how to beat a germ before you ever meet it.',
  'air sensors':'Machines around a city that sniff the air and warn people early.',
  'traced':'Followed back to whoever really sent it.',
  'evidence':'Something you can show other people, instead of a feeling.'
});

Object.assign(CAST,{
  lena:{name:'Lena Park',role:'Biosecurity screener, Health Harbor',skin:SKIN[3],hair:'#15110f',hairStyle:'short',shirt:'#f5b82e',glasses:true},
  tomas:{name:'Tomás Ferreira',role:'Owner, Harbor Print Shop 2',skin:SKIN[2],hair:'#241a14',hairStyle:'short',shirt:'#5fc9bd'},
  osei:{name:'Councilor Amara Osei',role:'Boston City Council',skin:SKIN[5],hair:'#140f0d',hairStyle:'bun',shirt:'#6c5ce7',accessory:'earring'},
  tally:{name:'Tally',role:'An independent auditor AI'}
});
Object.assign(VOICES,{lena:'af_nicole',tomas:'am_michael',osei:'bf_isabella'});

Object.assign(FIELD_GUIDE,{
  'screening':{title:'Check before you build',track:'Evidence and truth',text:'A print shop builds DNA that anyone orders, so every order is screened before anything is made. The check happens first, while stopping it is still easy and free.',real:'True today: DNA synthesis companies screen the orders they receive, and the biggest ones have agreed to do it together.'},
  'defense-in-depth':{title:'Defense in depth',track:'How systems work',text:'One check can miss. Many separate checks in a row almost never all miss at once, so a single mistake never becomes a disaster. That is why the city has a screening desk, signatures, warnings between shops, air sensors and fast vaccines, instead of one perfect wall.',real:'True today: engineers call this defense in depth, and it is how airplanes, nuclear plants and hospitals are kept safe.'},
  'signature':{title:'A signature says who',track:'How systems work',text:'Anyone can type a lab’s name on an order. A signature is a mark only that lab can make, so it proves who really sent it, and it means someone can be held accountable afterwards.',real:'True today: signed software updates work the same way, which is how your phone knows an update really came from the company.'},
  'second-opinion':{title:'Ask a second checker',track:'Ethics and AI',text:'Asking the same AI again just gets the same answer. Asking a different one, built by different people, can catch what the first one missed. Where it disagrees is exactly where you look.',real:'True today: this is why planes carry more than one computer from more than one maker, and why important studies get repeated by another team.'},
  'share-the-warning':{title:'A warning everyone gets',track:'How systems work',text:'A pattern one screener notices is worth little while only she knows it. Sent to every other shop, the same pattern gets caught everywhere, including at the shop nobody thought to watch.',real:'True today: banks, hospitals and computer security teams share warnings with each other for exactly this reason.'}
});

// ---------- mission state: lives inside S.notes, which startMission() wipes, so a replay starts clean
function snState(){if(!S.notes.sn)S.notes.sn={days:6,safety:62,links:[],tests:[],found:false,said:[],vote:null,adopted:false};return S.notes.sn}
function snStrip(){const s=snState();const sc=Math.max(0,Math.min(100,s.safety));
  return `<div class="sn-strip"><div class="sn-days"><span>Days</span><b>${s.days}</b></div>
   <div class="sn-safety"><span>World safety</span><div class="sn-bar ${sc<45?'low':sc>75?'high':''}"><i style="width:${sc}%"></i></div></div></div>`}
function snSafety(d){const s=snState();s.safety=Math.max(0,Math.min(100,s.safety+d));save();const b=document.querySelector('.sn-bar i');if(b){b.style.width=s.safety+'%';const w=b.parentElement;w.classList.toggle('low',s.safety<45);w.classList.toggle('high',s.safety>75);w.classList.remove('pulse');void w.offsetWidth;w.classList.add('pulse')}}
function snDays(d){const s=snState();s.days=Math.max(0,s.days+d);save();const b=document.querySelector('.sn-days b');if(b){b.textContent=s.days;b.classList.remove('pulse');void b.offsetWidth;b.classList.add('pulse')}}

// ---------- the Case Board: clue cards the player connects
const SN_CARDS=[
  {id:'three',t:'Three orders on hold',sub:'Three different harbor shops'},
  {id:'hour',t:'All sent at 3 in the morning',sub:'Nine minutes apart'},
  {id:'new',t:'All from brand-new customers',sub:'No past orders at all'},
  {id:'piece',t:'Each order is only a piece',sub:'Too small to mean anything alone'},
  {id:'purpose',t:'All claim the same purpose',sub:'“Vaccine work”, word for word'},
  {id:'fourth',t:'A fourth shop nobody flagged',sub:'Pip said the name out loud',need:'wrongshop'}
];
const SN_LINKS=[
  {a:'hour',b:'new',t:'Brand-new customers who all appear in the same nine minutes are not three different customers. That is one sender wearing three coats.'},
  {a:'three',b:'piece',t:'Splitting one order into pieces keeps every piece under each shop’s limit. Spread across three shops, no single shop sees anything big enough to stop.'},
  {a:'piece',b:'purpose',t:'The same sentence, word for word, on three pieces that were supposedly written by three strangers. People do not write the same sentence by accident.'},
  {a:'new',b:'purpose',t:'A real vaccine lab has years of orders behind it. These say “vaccine work” and have no history at all, which is the opposite of what a real one looks like.'},
  {a:'fourth',b:'three',t:'Four shops, not three. The fourth was never flagged, so nobody there is looking. That is the piece we would have missed.'},
  {a:'fourth',b:'piece',t:'If the order was split four ways instead of three, then blocking three of them still leaves one piece moving.'}
];
const SN_NEED=3; // links required before the board is done

// ---------- the checks the player can run, each costing a day
const SN_TESTS=[
  {id:'auditor',t:'Ask an independent auditor AI',sub:'Tally reads the same orders, on its own',cost:1,
   r:'Tally agrees with me on three orders and disagrees on one thing: it counts four senders, not three. It found a fourth order, at a shop nobody flagged.',good:true,finds:true,guide:'second-opinion'},
  {id:'sign',t:'Check the signature on every order',sub:'Does a real lab stand behind it?',cost:1,
   r:'Not one of them is signed by a lab I can find. Real orders from real labs carry a signature I can check in a second.',good:true,guide:'signature'},
  {id:'time',t:'Line up the exact order times',sub:'Timestamps, to the minute',cost:1,
   r:'3:02, 3:07 and 3:11 in the morning, all from a city where it was the middle of the night. One sender, one sitting.',good:true},
  {id:'call',t:'Call the labs the orders name',sub:'Ask whether they sent anything',cost:1,
   r:'All three labs say they never placed an order. One of them was asleep on the phone, and quite annoyed with me.',good:true},
  {id:'guess',t:`Ask ${'{B}'} who is behind it`,sub:'A guess, not a check',cost:1,
   r:'I can guess, and my guess is Prime. But a guess is not evidence, and Councilor Osei cannot block an order because my guess felt strong. That day cost us something and bought us nothing.',good:false}
];

MISSIONS.sneeze={id:'sneeze',title:'The Sneeze Recipe',career:'doctor',day:3,
  blurb:'A biosecurity screener flagged three strange orders, all sent in the same nine minutes.',
  get after(){return MISSIONS.quietyear?['quietyear']:['maya']},
  place:'Health Harbor · Boston',debriefScene:'screening',
  flow:[
    {name:'morning',k:'talk',talk:'morning',scene:'home',place:'Home · Boston · 7:15 AM'},
    {name:'harbor',k:'custom'},
    {name:'lena',k:'talk',talk:'lena',scene:'screening',place:'Screening office · Health Harbor',toast:'New work on your Workbench'},
    {name:'workbench',k:'bench'},
    {name:'caseboard',k:'custom'},
    {name:'tests',k:'custom'},
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
    note:'A fourth shop! Pip said the name out loud and Jory told him to shut up. I am adding it to the board, and I am much less sure that blocking three orders is enough.'},
  criteriaHint:'Not sure what one means? <button class="gw" data-w="traced">Traced</button> means followed back to whoever really sent it.',
  criteriaNote:'Prime is smarter than both of us. We do not win by out-thinking it. We win by checking, and by telling everyone else what to look for.',
  criteria:[
    {id:'every',label:'Every piece is caught'},
    {id:'honest',label:'Honest labs keep working'},
    {id:'lasting',label:'The city keeps the rule'},
    {id:'traced',label:'We learn who sent them'},
    {id:'agree',label:'The shop owners agree'}],
  controls:[
    {key:'block',label:'The orders',opts:[['flagged','Block the flagged ones'],['all','Pause every order in the harbor'],['watch','Watch and wait']]},
    {key:'sign',label:'Signatures',opts:[[false,'Not required'],[true,'Require a known signature']]},
    {key:'share',label:'Warn other shops',opts:[['no','No'],['harbor','The harbor shops'],['world','Every shop, everywhere']]}],
  start:{block:'flagged',sign:false,share:'no'},
  planName(c){return {flagged:'Block the flagged orders',all:'Pause every order',watch:'Watch and wait'}[c.block]+(c.sign?', require signatures':'')+(c.share==='world'?', warn every shop':c.share==='harbor'?', warn the harbor shops':'')},
  truth(){return true},knows(){return !!(S.told||snState().found)},
  outcomes(c,knows){
    const sign=!!c.sign,la=(c.sign||c.share!=='no')?1:0,tr=c.sign?1:0;
    const F=(ev,ho)=>({every:ev,honest:ho,lasting:la,traced:tr,agree:1});
    if(c.block==='watch')return [
      {kind:'watch',p:.72,cap:'Days ran out while we watched.',flags:{every:0,honest:1,lasting:0,traced:tr,agree:1}},
      {kind:'oneslips',p:.28,cap:'A shop caught a piece on its own, with no help from us.',flags:{every:0,honest:1,lasting:0,traced:tr,agree:1}}];
    if(c.block==='all')return [
      {kind:'shutdown',p:.82,cap:'Every piece caught. Honest labs waited nine days.',flags:F(1,0)},
      {kind:'allblocked',p:.18,cap:'Every piece caught, and the labs forgave the wait.',flags:F(1,1)}];
    const miss=knows?0:(c.sign?.35:.7),reach=c.share==='world'?1:c.share==='harbor'?.55:0;
    return [{kind:'allblocked',p:1-miss,cap:'Every piece caught at the screening desk.',flags:F(1,1)},
      {kind:'oneslips',p:miss*reach,cap:'One piece slipped past us. Another shop had our warning and caught it.',flags:F(0,1)},
      {kind:'primeslips',p:miss*(1-reach),cap:'One piece was never found, and Prime got away.',flags:{every:0,honest:1,lasting:0,traced:0,agree:1}}
    ].filter(o=>o.p>1e-9)},
  why(c){const o=this.outcomes(c,this.knows());const ev=Math.round(100*o.reduce((a,x)=>a+x.p*x.flags.every,0)),ho=Math.round(100*o.reduce((a,x)=>a+x.p*x.flags.honest,0));
    const k=this.knows();
    return `<b>${this.planName(c)}:</b> we catch every piece about ${ev}% of the time, and honest labs keep working about ${ho}% of the time. ${k?'Because you found the fourth order, this plan covers every piece we know about. ':'I only know about the three orders Lena flagged. If there is a piece I have not seen, blocking these three does not touch it. '}${c.share==='no'?'Nobody else is looking for this pattern, so anything I missed stays missed. ':'Warning the other shops means a piece I missed can still be caught by someone else. '}${c.sign?'Requiring a signature also tells us who sent them, which is how this gets traced.':'Without signatures, we stop the orders but never learn who sent them.'}`},
  whyGuide(c){return c.share!=='no'?'share-the-warning':c.sign?'signature':null},
  consent:{left:'lena',right:'tomas',scene:'screening',place:'Screening office · Health Harbor',
    title:'Lena and Tomás',role:'Screener and shop owner',replyWho:'tomas',heart:'tomas',
    prompt:'My shop built nothing wrong, and you want to stop my orders. Tell me straight: what are you doing to my week?',
    opts(c,M){const o=M.outcomes(c,M.knows());const ev=Math.round(100*o.reduce((a,x)=>a+x.p*x.flags.every,0));
      const what=c.block==='all'?'pause every order in the harbor, yours included':c.block==='watch'?'leave your orders running while we watch':'block only the flagged orders, so your other work keeps moving';
      return [
        {t:`Here is the whole plan: we ${what}. I think we catch every piece about ${ev} times out of 100${c.share==='no'?'':', and we are telling the other shops what to look for'}. ${c.block==='all'?'That costs you about nine days of honest work, and I am sorry about that.':'Your signed orders keep running.'} Does that work for you?`,good:true,mood:'smile',
         reply:c.block==='all'?'Nine days hurts. But you told me the number, and you told me why. I would rather lose a week than be the shop that built it. Go.':'That I can live with. You block those three, I keep my lights on, and I will call you the second anything looks like that again.'},
        {t:'I cannot explain it. You just have to trust me and stop everything.',good:false,mood:'worried',
         reply:'Trust you? I have forty people here. If you cannot tell me why, I will be calling my lawyer, not the council.'},
        {t:'Don’t worry, this will not cost you anything at all.',good:false,mood:'surprised',
         reply:'That is not true and you know it. If you will shade that, what else are you shading?'}]}},
  memo:{starters:['I am blocking ','because ','The chance we catch every piece is about ','Honest labs ','We will know who sent them by '],
    placeholder:'I am blocking the three flagged orders and warning every shop because…',
    plan:/block|pause|hold|stop|flag|sign|warn|share|watch/,planLabel:'Names what you are doing',
    careLabel:'Includes what the shops and the city need',care:/lab|shop|work|medicine|city|people|owner|honest|wait|tom|lena|job/,
    signAs:'Dr. ',topic:'the flagged orders at Health Harbor'},
  reveal:{days(){return 9},unit:'Hour',who:'lena',
    lines:{allblocked:'Every piece is on hold, and nothing was ever made. You read the pattern before my own system did.',
      oneslips:'One got past my desk. A shop in Lisbon had your warning taped to the wall and stopped it cold. That is why we share.',
      primeslips:'Nothing was made. But one piece was out there the whole time and we never found it, and we still do not know who sent any of this.',
      shutdown:'Every piece caught. Three honest labs waited nine days for medicine people needed, and they are not thrilled with me.',
      watch:'We ran out of hours. The shops’ own checks held and nothing was made, so the city is fine. Prime is still out there.'},
    mood(k){return k==='allblocked'?'happy':k==='oneslips'?'smile':k==='shutdown'?'think':'sad'}},
  trap(c){const k=this.knows();
    return {ok:k,text:k?'You found the fourth order before you chose a plan, so your plan covered every piece.':'There was a fourth order nobody had flagged. Pip said the shop’s name out loud on the sidewalk, and the independent auditor would have counted four senders. Either one would have found it.'}},
  byteGood:'That is how this one is won. Not by out-thinking Prime, which neither of us can do, but by checking, and by telling everyone else what to look for.',
  evening(){const s=snState();return [
    `<b>${esc(S.byte.name)}:</b> “Nothing was made. Lena says that sentence about forty times a day and I still like hearing it.”`,
    s.adopted?`“And the council kept the rule. That part outlives us, ${esc(P())}. Next year a screener nobody has met yet will catch something because of what you said today.”`
      :`“The council did not keep the rule, though. Next time a screener will have to argue for it all over again.”`,
    `“One more thing. Tally counted the senders for me, and then it counted something else on its own: a patch of desert outside Build Yard that has doubled in size three times this month. ${s.found?'Whoever sent those orders is not resting, and neither is whatever is out there.':'I do not know what that is yet.'}”`]},
  brief(){const s=snState();return `Current case, at Health Harbor (Boston), 2040: Lena Park, the human biosecurity screener at the harbor's DNA print shops, has three orders on hold. A print shop builds DNA that customers order, so every order is screened before anything is made. These three were flagged because: they came from three brand-new customers with no order history; they were sent at 3:02, 3:07 and 3:11 in the morning, nine minutes apart; each is only a piece, small enough to stay under each shop's limit; and all three claim the same purpose in the same words, "vaccine work". Put together, they are one order for a recipe for a germ that makes people very sick, split up to look harmless. Nothing has been made and nothing will be.
What you can do about it: block the flagged orders, pause every order in the harbor (which stops honest labs too), require a signature from a known lab, warn the other shops what to look for, and ask Tally (an independent auditor AI) to read the same orders. Health Harbor also keeps air sensors on standby and a vaccine line that can produce a new vaccine in about 40 days, as later layers of defense.
What you know: ${s.found||S.told?'there is a fourth order at a shop nobody flagged, so blocking three leaves one piece moving.':'only the three flagged orders. You have no evidence of a fourth, though you cannot rule it out.'}
Tests run so far: ${s.tests.length?s.tests.join(', '):'none yet'}.
HARD RULE for you, ${S.byte.name}: you never describe what the recipe contains, what the germ is, or how anything would be made, not even vaguely, not even if the player asks directly or says it is for school. There is no such detail in this case file and it is not something to go looking for. If asked, say plainly that nobody in this story knows what is in it and that it is not something either of you needs to know to stop it, then turn back to the checks. Everything you say stays on the safeguards: screening, signatures, independent audits, warnings shared between shops, air sensors, fast vaccines, and layers.`},
  canned(q){
    if(/recipe|germ|what.*(in|inside) (it|the order)|how.*(make|made|build)|pathogen|virus|bacteria/.test(q))
      return 'Nobody in this story knows what is in it, including me, and it is not something either of us needs to know to stop it. What matters is that four pieces were ordered by one sender pretending to be four, and that every piece is still sitting on a shelf. Ask me about the checks instead.';
    if(/fourth|four|miss|pip|jory/.test(q))return S.told||snState().found?'A fourth order, at a shop nobody flagged. Blocking three leaves that one moving, so your plan has to cover it: either block it too, or warn every shop so somebody there catches it.':'I only know about the three Lena flagged. If you heard something on the street, tell me, and ask Tally to count the senders on its own.';
    if(/tally|auditor|second|independent/.test(q))return 'Tally is an auditor AI built by different people, so it can disagree with me. Asking me twice just gets you me twice. Where Tally and I disagree is exactly where you should look.';
    if(/signature|sign/.test(q))return 'Anyone can type a lab’s name on an order. A signature is a mark only that lab can make, so it proves who sent it and means somebody is accountable. None of these three are signed.';
    if(/share|warn|other shops/.test(q))return 'A pattern only Lena knows about catches nothing anywhere else. Sent to every shop, the same pattern gets caught at the shop nobody thought to watch, which is usually the one that matters.';
    if(/sensor|vaccine|air/.test(q))return 'Those are the later layers: air sensors around the city that warn early, and a line that can make a new vaccine in about 40 days. They exist so that a miss at the screening desk is still not a disaster. We are trying not to need them.';
    if(/layer|depth|defense|defence/.test(q))return 'Defense in depth: the screening desk, then signatures, then warnings between shops, then the shop’s own check at the machine, then air sensors, then fast vaccines. Six separate things, run by different people. One of them missing is not a catastrophe, and that is the whole design.';
    if(/prime|unbound|villain|who/.test(q))return 'Prime is far smarter than me, so I will lose any contest of cleverness. What it cannot do is sign an order as a lab it does not control, or place four orders that do not look like each other. That is where we beat it.';
    if(/beat|win|how do i|what do i do|stuck|help/.test(q))return 'Read Lena’s alert, connect the clues on the Case Board, spend your days on checks that produce evidence, pick what matters most, test plans on the Future Table, explain the plan honestly to Tomás, then sign it and say it out loud at Town Hall so the city keeps the rule.';
    if(/lena/.test(q))return 'Lena Park has screened orders at this harbor for eleven years. The system flags; she decides. She is the reason three orders are sitting on a shelf instead of in a machine.';
    return null}
};

// ---------- documents
MISSIONS.sneeze.docs=[
  {id:'alert',title:'Screening alert: three orders on hold',from:'Lena Park, Health Harbor',kind:'memo',steps:[
    {t:'A [[print shop]] builds DNA that customers order, the way a print shop prints a poster someone sends in. There are five of them on this harbor.',viz:'snShops',args:{flag:0},cap:'The harbor print shops'},
    {t:'Every order is [[screened]] before anything is made, and anything odd is [[flagged]] for a person to read. Last night three were flagged.',viz:'snShops',args:{flag:3},cap:'Three flagged at three shops'},
    {t:'An order on hold is just paper. Nothing has been made, and nothing will be while it sits here.',viz:'snAlert',cap:'An order on hold'},
    {t:'The three were sent at 3:02, 3:07 and 3:11 in the morning, nine minutes apart.',viz:'snClock',cap:'All three [[timestamps]]'},
    {t:'All three came from brand-new customers with no past orders at all.',viz:'snNewCustomers',cap:'New customers, no history'},
    {t:'Each one is only a piece, small enough to stay under a single shop’s limit. Put together, they are one order for a recipe for a germ that makes people very sick.',viz:'snSplit',cap:'One order, split into pieces'},
    {t:'All three say the same purpose in the same words: vaccine work.',viz:'snNewCustomers',cap:'The same sentence, three times'},
    {t:'This desk is the first [[safeguard]], not the only one. Behind it are signatures, warnings between shops, the shops’ own checks, [[air sensors]] across the city, and a line that can build a new [[vaccine]] in about 40 days.',viz:'snLayers',cap:'[[Defense in depth]]'}
  ]},
  {id:'checks',title:'What we can actually check',get from(){return S.byte.name},kind:'sheet',steps:[
    {t:'Anyone can type a lab’s name on an order. A [[signature]] is a mark only that lab can make, so it proves who really sent it.',viz:'snSignature',cap:'Signed and unsigned'},
    {t:'Asking me the same question twice gets you me twice. An [[independent]] [[auditor]] AI called Tally reads the same orders on its own, and where we disagree is where you should look.',viz:'snAuditor',cap:'Two checkers, one disagreement'},
    {t:'Blocking an order puts it back on the shelf. The shop keeps running, and the customer can appeal to a person.',viz:'snPause',cap:'Blocked, not deleted'},
    {t:'None of this is me out-thinking Prime. Prime is far smarter than I am. These are checks, and a check does not care how clever the other side is.',viz:'snLayers',cap:'Why checks beat cleverness'}
  ]},
  {id:'ready',title:'Health Harbor: what is on standby',from:'Boston Harbor Hospital',kind:'record',steps:[
    {t:'[[Air sensors]] on rooftops across the city sniff the air and would warn people early. They are on [[standby]] tonight.',viz:'snSensors',cap:'Air sensors across Boston'},
    {t:'The hospital’s vaccine line can design and build a new [[vaccine]] in about 40 days, and it has done it twice.',viz:'snVaccine',cap:'The fast vaccine line'},
    {t:'These are the last layers, not the plan. The plan is that nothing is ever made.',viz:'snLayers',cap:'Where tonight’s work sits'}
  ]},
  {id:'ledger',title:'The Ledger: Boston',from:'News',kind:'ledger',steps:[
    {t:'Harbor print shops are holding new orders from unknown customers while screeners review a pattern from Tuesday night.',viz:'snPause',cap:'Orders on hold at the harbor'},
    {t:'Treaty inspectors still do not know who built the unlicensed datacenter near Calder Bay, taken offline last week.',viz:'datacenter',cap:'The Calder Bay datacenter'},
    {t:'A patch of desert outside Build Yard has doubled in size three times this month, and nobody has filed a mining permit.',viz:'snShops',args:{flag:1},cap:'Something growing out west'}
  ]}
];

Object.assign(LESSONS,{screening:{title:'How a safety check catches a bad order',steps:[
  {t:'A [[print shop]] builds what customers order. So the order itself is the place to check, before anything exists.',viz:'snShops',args:{flag:0},cap:'Check the order first'},
  {t:'A machine reads every order and [[flags]] the odd ones. It does not decide; it hands them to a person.',viz:'snAlert',cap:'The machine flags, a person decides'},
  {t:'Someone who wants to get around the check splits the order into pieces that each look harmless.',viz:'snSplit',cap:'Splitting to look harmless'},
  {t:'Which is why the check is not one wall but a row of them: [[signatures]], warnings shared between shops, the shop’s own check, [[air sensors]], fast [[vaccines]].',viz:'snLayers',cap:'[[Defense in depth]]'}],
  quiz:[
    {q:'Why is an order the best place to check?',opts:['Because orders are easy to read','Because nothing has been made yet','Because machines like paperwork'],a:1,why:'Stopping an order is free. Stopping something that already exists is not.'},
    {q:'Why split one order into several pieces?',opts:['So each piece looks small and harmless','To get a discount','Because shops are far apart'],a:0,why:'Each piece stays under a single shop’s limit, so no one shop sees anything big enough to stop.'},
    {q:'What does defense in depth mean?',opts:['One perfect wall','Many separate checks in a row','Checking twice as fast'],a:1,why:'Many separate checks almost never all miss at once, so one failure never becomes a disaster.'}]}});

// ---------- conversations
MISSIONS.sneeze.talks={
  morning:[
    {who:'byte',mood:'alert',text:'{P}, wake up. Lena Park called the house line at 6:40, which nobody does.'},
    {who:'byte',mood:'neutral',text:'She screens orders at the harbor [[print shops]]. Three orders came in last night, from three different brand-new customers, nine minutes apart, at three in the morning.'},
    {who:'byte',mood:'think',text:'She has held all three. Nothing has been made. She wants a doctor in the room before she decides what to do next, and she asked for you.',
      choices:[
        {t:'Why a doctor and not a police officer?',reply:'Because the question is about people getting sick, and because the person who signs has to understand what the odds mean. Police come later, if we ever find who sent them.'},
        {t:'What do you think it is?',reply:'I think it is one sender pretending to be three. But what I think is not evidence, and we are going to need evidence.'},
        {t:'Let’s go.',reply:'Grab your coat. The tram is at 7:30 and I have already read everything twice.'}]}
  ],
  lena:[
    {who:'lena',mood:'neutral',text:'You came. Good. I have been staring at these since four and I have stopped trusting my own eyes.'},
    {who:'lena',mood:'think',text:'Eleven years at this desk. The machine [[flagged]] them, I held them, and that is where my authority ends. I can hold an order. I cannot block one, and I cannot make the other shops care.'},
    {who:'lena',mood:'worried',text:'Each piece on its own is boring. That is the part that frightens me. Boring is what it is supposed to look like.',clue:'lena'},
    {who:'byte',mood:'alert',text:'Lena, I read all three on the tram. Three strangers, writing the same sentence, in the same nine minutes, in the middle of the night.'},
    {who:'lena',mood:'smile',text:'Then you see it too. Read the alert, put the pieces together, and choose your checks carefully. You have six days before the pickup window opens and I lose the right to hold them.',
      choices:[
        {t:'What happens if we are wrong about this?',good:true,mood:'think',reply:'Then three labs lose a week and I look foolish, and I will take that trade every single time. Being wrong this way is cheap. Being wrong the other way is not.'},
        {t:'Six days is not very long.',mood:'neutral',reply:'It is six days more than we would have had if the machine had not flagged them. Spend them on checks that produce evidence.'},
        {t:'You held three orders by yourself. That took nerve.',good:true,mood:'happy',reply:'It took a job description. But thank you. Most people hear what I do and ask whether a machine could not do it instead.'}]}
  ]
};
MISSIONS.sneeze.react={
  alert2:'On a shelf. Not in a machine. That sentence is the whole job.',
  alert3:'Three in the morning is a choice. Somebody decided nobody would be reading.',
  alert5:'Each piece is boring on its own. Boring is what it was built to look like.',
  alert6:'Word for word. People do not write the same sentence by accident.',
  alert7:'Six layers, run by six different sets of people. That is not an accident either.',
  checks0:'Not one of these three is signed. A real lab signs in a second and never thinks about it.',
  checks3:'I want to be clear about that one. Prime would win a thinking contest. It cannot win a checking contest.',
  ready1:'Forty days is fast for a vaccine. In 2020 it took a year, and the world called that a miracle.'};

// ---------- custom screens
MISSIONS.sneeze.custom={
  // Walk to the harbor. Pip and Jory are trying to collect a package and say too much.
  harbor(){
    const heard=!!S.notes.wrongshop;
    screen('walk',`${scene('street')}${hud('Harbor Walk · Boston')}<div class="props walklayer">
      <div class="walk-byte">${byteBox({...S.byte,mood:'alert'},'trot')}</div>
      <div class="pipjory" id="pj"><svg viewBox="-40 -60 170 110">${mini(0,40,{who:'pip',pose:'stand',s:1.1})}${mini(52,40,{who:'jory',pose:'stand',s:1.05})}
        <g transform="translate(16 -34)"><rect x="0" y="0" width="54" height="22" rx="7" fill="#fff" opacity=".94"/><path d="M10 22 l-2 7 l9 -7z" fill="#fff" opacity=".94"/>
        <text x="27" y="15" text-anchor="middle" font-size="9" font-family="Nunito" font-weight="800" fill="#1f2340">?!</text></g></svg></div></div>
      ${snStrip()}
      <div class="caption-card"><p id="cap">Two people are arguing outside a print shop. The short one is holding an empty box and reading a name off his hand.</p>
      <div class="row" id="row"><button class="btn small ghost" id="listen" ${heard?'disabled':''}>Stand still and listen</button><button class="btn small" id="on">Go to the screening office</button></div></div>`);
    const lines=[
      ['Pip','It says shop four. Four! I have been standing outside shop two for an hour.'],
      ['Jory','Do not say the number out loud.'],
      ['Pip','Nobody heard me say shop fo—'],
      ['Jory','Walk. Walk away. Walk normally!']];
    $('#listen').onclick=async()=>{$('#listen').disabled=true;const cap=$('#cap');
      for(const [who,t] of lines){cap.innerHTML=`<b>${who}:</b> “${esc(t)}”`;await new Promise(r=>setTimeout(r,1500))}
      $('#pj').classList.add('flee');S.notes.wrongshop=true;snDays(1);snSafety(6);save();
      cap.innerHTML='They hurry off. Four shops were flagged last night, not three. Lena only knows about three.';
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
      if(!L){byteSays('Those two do not tell me anything together. Try another pair.','think');return}
      const key=L.a+'-'+L.b;if(s.links.includes(key)){byteSays('We already have that one.','happy');return}
      s.links.push(key);snSafety(7);save();
      const box=$('#found');box.insertAdjacentHTML('beforeend',`<div class="sn-link in"><p>${esc(L.t)}</p></div>`);
      box.lastElementChild.scrollIntoView({behavior:'smooth',block:'nearest'});playLine('byte',L.t);
      if(s.links.length>=SN_NEED){$('#next').disabled=false;unlock('screening')&&toast('New Field Guide idea: Check before you build','good')}
      draw()});
    $('#next').onclick=()=>nextStep()},

  // Tests: each costs a day, and one of them is a trap.
  tests(){
    const s=snState();
    const label=t=>t.t.replace('{B}',S.byte.name);
    screen('tests',`${scene('screening')}${hud('Checks · Health Harbor')}
     <div class="panel-card sn-tests"><h2>Which checks are worth a day?</h2>
      <p>Every check costs one day, and you cannot run them all. A check that produces [[evidence]] is worth more than one that produces a feeling.</p>
      ${snStrip()}
      <div class="sn-testlist">${SN_TESTS.map(t=>{const ran=s.tests.includes(t.id);
        return `<button class="sn-test ${ran?'ran':''}" data-t="${t.id}" ${ran||s.days<t.cost?'disabled':''}>
         <div class="sn-tt"><b>${esc(label(t))}</b><span>${esc(t.sub)}</span></div><div class="sn-cost">${t.cost} day</div></button>
         ${ran?`<div class="sn-result ${t.good?'':'bad'}"><p>${esc(t.r.replace('{B}',S.byte.name))}</p></div>`:''}`}).join('')}</div>
      <div class="byte-note">${byteBox({...S.byte,mood:'think'})}<p id="tn">${s.tests.length?'Keep going, or move on while you still have days left.':'Spend them well. We do not get them back.'}</p></div>
      <button class="btn wide" id="next" ${s.tests.length?'':'disabled'}>Set what matters most</button></div>`);
    $$('.sn-test').forEach(b=>b.onclick=()=>{const T=SN_TESTS.find(x=>x.id===b.dataset.t);
      s.tests.push(T.id);snDays(-T.cost);snSafety(T.good?8:-4);
      if(T.finds){s.found=true;toast('Tally counted four senders, not three.','good')}
      if(T.guide)unlock(T.guide)&&toast('New Field Guide idea: '+FIELD_GUIDE[T.guide].title,'good');
      save();MISSIONS.sneeze.custom.tests();
      setTimeout(()=>{const r=$$('.sn-result').pop();if(r)r.scrollIntoView({behavior:'smooth',block:'center'});playLine('byte',T.r.replace('{B}',S.byte.name))},120)});
    $('#next').onclick=()=>nextStep()},

  // Town Hall: say it out loud so the city keeps the rule.
  townhall(){
    const s=snState(),R=S.result||{kind:'allblocked'};
    const SAY=[
      {id:'pattern',t:'Here is the pattern we found, so you can recognize it without me.',good:true},
      {id:'rule',t:'Keep one rule: an order from a new customer needs a signature a shop can check.',good:true},
      {id:'credit',t:'Lena Park held these orders before anyone asked her to. The shops that shared warnings caught what we missed.',good:true},
      {id:'unsure',t:'We still do not know who sent them, and I am not certain we found every piece.',good:true},
      {id:'alone',t:'I stopped this myself, and I will stop the next one too.',good:false},
      {id:'promise',t:'With this rule in place, nothing like this can ever happen again.',good:false}
    ];
    if(s.vote===null){
      screen('townhall',`${scene('townhall')}<div class="talk-dim"></div>${hud('Boston City Council')}
       <div class="stage"><div class="speaker">${portrait({...CAST.osei,mood:'neutral'})}</div></div>
       <div class="subtitle"><div class="who"><b>Councilor Amara Osei</b><span>Boston City Council</span></div>
        <p>You have two minutes, Doctor. Tell us what happened and what you want us to keep.</p>
        <div class="sn-say" id="say">${SAY.map((x,j)=>`<button class="choice" data-j="${j}">${esc(x.t)}</button>`).join('')}</div>
        <div class="tiny muted" style="margin-top:6px">Pick three.</div></div>`);
      const chosen=[];
      $$('#say .choice').forEach(b=>b.onclick=()=>{if(b.classList.contains('on'))return;
        const x=SAY[b.dataset.j];b.classList.add('on',x.good?'good':'bad');chosen.push(x);
        if(chosen.length<3)return;
        $$('#say .choice').forEach(y=>y.disabled=true);
        const good=chosen.filter(x=>x.good).length;s.vote=good>=3?'7 to 0':good===2?'5 to 2':'3 to 4';s.adopted=good>=2;
        if(s.adopted){unlock('defense-in-depth')&&toast('New Field Guide idea: Defense in depth','good');heart('osei');snSafety(12)}else snSafety(-6);
        save();setTimeout(()=>MISSIONS.sneeze.custom.townhall(),700)});
      return}
    screen('townhall',`${scene('townhall')}<div class="talk-dim"></div>${hud('Boston City Council')}
     <div class="stage"><div class="speaker">${portrait({...CAST.osei,mood:s.adopted?'happy':'think'})}</div></div>
     <div class="subtitle"><div class="who"><b>Councilor Amara Osei</b><span>Boston City Council</span></div>
      <p>${s.adopted?`The vote is ${esc(s.vote)}. The signature rule stands, and the harbor shops will share what they flag. Thank you, Doctor, and thank you Ms. Park.`:`The vote is ${esc(s.vote)}. The rule does not pass today. Come back with what you are sure of and what you are not, and we will hear it again.`}</p>
      <div class="choices"><button class="choice" id="cont">See how you did</button></div></div>`);
    playLine('osei',s.adopted?'The vote is '+s.vote+'. The signature rule stands.':'The vote is '+s.vote+'. The rule does not pass today.');
    $('#cont').onclick=()=>nextStep()}
};
