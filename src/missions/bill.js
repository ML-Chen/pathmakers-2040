// missions/bill.js — Washington, DC, Lawmaker, Day 1: "The Robot Safety Bill".
// The player is a congressional aide to Rep. Adaeze Hollis. Home robots in Halden Creek (fictional) obeyed a fake order;
// Hollis's Robot Safety Act needs 11 of 21 subcommittee votes, and three undecided members want different things.
// Mechanics: a hearing note (one tough question), a whip count (listen to each undecided member), a drafting desk
// (legal text beside plain English, versions per section) and a Future Table with a live whip board.
// Every officeholder is fictional and defined by the district's needs; no party is ever named.
// Top level is plain data and functions only (tools/make_audio.py evaluates this file in node, without S or the DOM).
CAREERS.lawmaker={name:'Lawmaker',place:'Washington, DC',district:'dc',why:'Voters choose the people who write their laws, and every vote has a named human who must answer for it.'};

// ---------- the vote model (shared by the documents, the Future Table, consent and the debrief) ----------
// Each undecided member's chance of voting yes, for a plan c={cmd,report,human}. knows = the player told Byte about
// Rep. Gunderson's goats (his own barn robot once obeyed a stranger's phone), so Byte understands what he really wants.
function bill_clamp(p){return Math.max(.05,Math.min(.95,Math.round(p*100)/100))}
function bill_votes(c,knows){
  const F=(knows?{all:.30,phase:.85,exempt:.80}:{all:.15,phase:.40,exempt:.85})[c.cmd];
  const W={public:.80,split:.70,private:.30}[c.report]+(c.human==='pause'?.10:-.30)+(c.cmd==='exempt'?-.05:0);
  const I={public:.25,split:.75,private:.85}[c.report]+(c.human==='pause'?-.05:.05)+(c.cmd==='all'?-.05:0);
  return {gunderson:bill_clamp(F),ibarra:bill_clamp(W),sethi:bill_clamp(I)}}
// probability that exactly k of the three vote yes (k = 0..3)
function bill_tally(v){const a=v.gunderson,b=v.ibarra,d=v.sethi;
  return [(1-a)*(1-b)*(1-d),a*(1-b)*(1-d)+(1-a)*b*(1-d)+(1-a)*(1-b)*d,a*b*(1-d)+a*(1-b)*d+(1-a)*b*d,a*b*d]}
function bill_pass(c,knows){const t=bill_tally(bill_votes(c,knows));return t[2]+t[3]}
// chance that, once the law passes, a fake order still fools some robots within a year (the gap each version leaves)
const BILL_GAP={all:.03,phase:.10,exempt:.35};
const BILL_START={cmd:'all',report:'public',human:'pause'}; // Rep. Hollis's first draft
const bill_pct=x=>Math.round(x*100);

MISSIONS.bill={id:'bill',title:'The Robot Safety Bill',career:'lawmaker',day:1,kind:'workday',year:3,season:'spring',district:'dc',rank:'trainee',
  blurb:'Fake orders opened 2,600 doors. Write a robot law that works, then find 11 votes.',after:['maya'],
  place:'Washington, DC',
  flow:[
    {name:'morning',k:'talk',talk:'morning',scene:'dc_office',place:'Cannon House Office Building · 8:10 AM'},
    {name:'boss',k:'talk',talk:'boss',scene:'dc_office',place:'Rep. Hollis’s office · Cannon Building'},
    {name:'arrive',k:'custom'},
    {name:'hearing',k:'talk',talk:'hearing',scene:'dc_hearing',place:'Room 2123 · Rayburn Building'},
    {name:'note',k:'custom'},
    {name:'whip',k:'custom',toast:'New work on your Workbench'},
    {name:'workbench',k:'bench'},
    {name:'draft',k:'custom'},
    {name:'criteria',k:'criteria'},{name:'table',k:'table'},{name:'consent',k:'consent'},{name:'memo',k:'memo'},
    {name:'reveal',k:'reveal'},{name:'debrief',k:'debrief'},{name:'evening',k:'evening'}],

  cast:{
    hollis:{name:'Rep. Adaeze Hollis',role:'Your boss · River-town district',skin:SKIN[4],hair:'#2a2230',hairStyle:'bun',shirt:'#f3ece2',eye:'#5a3a26',accessory:'earring',bill:{jacket:'#26346a',pin:1}},
    gunderson:{name:'Rep. Walt Gunderson',role:'Undecided · Farm district',skin:SKIN[0],hair:'#b9b4b0',hairStyle:'short',shirt:'#7aa3c9',eye:'#4a6a8a',bill:{jacket:'#b98a52',barn:1,pin:1}},
    ibarra:{name:'Rep. Luz Ibarra',role:'Undecided · Port district',skin:SKIN[2],hair:'#22161a',hairStyle:'long',shirt:'#fbf6ee',eye:'#4a2a1a',bill:{jacket:'#1f8a84',pin:1}},
    sethi:{name:'Rep. Arjun Sethi',role:'Undecided · Robot makers’ district',skin:SKIN[2],hair:'#16121a',hairStyle:'short',shirt:'#e9eef6',eye:'#3a2618',glasses:true,frame:'#2a2a3a',bill:{jacket:'#3b4256',pin:1}},
    brandt:{name:'Chief Nora Brandt',role:'Witness · Halden Creek Fire Department',skin:SKIN[1],hair:'#8a5a34',hairStyle:'bun',shirt:'#f4f2ec',eye:'#4a6a3a',bill:{jacket:'#1d2440',chief:1}}
  },
  voices:{hollis:'af_heart',gunderson:'am_onyx',ibarra:'af_nova',sethi:'am_echo',brandt:'af_river'},

  glossary:{
    'congressional aide':'A helper who works for a member of Congress: reading, writing bills, and counting votes.',
    'representative':'A member of the House of Representatives, elected by the people of one district.',
    'district':'The area, and the people in it, that a representative is elected to speak for.',
    'committee':'A group of members of Congress who study bills on one topic before the whole House votes.',
    'subcommittee':'A smaller group inside a committee that looks closely at one kind of issue.',
    'hearing':'A public meeting where members of Congress ask experts and witnesses questions.',
    'witness':'Someone invited to tell Congress what they know at a hearing.',
    'testify':'To tell what you know in an official meeting, like a hearing or a trial.',
    'markup':'The meeting where a committee changes a bill line by line and then votes on it.',
    'amendment':'A change to a bill that members vote on.',
    'sponsor':'The member of Congress who introduces a bill and leads the push to pass it.',
    'cosponsor':'A member of Congress who signs on to support someone else’s bill.',
    'whip count':'Asking each member, one by one, how they plan to vote, before the real vote happens.',
    'majority':'More than half.',
    'digital signature':'A mathematical seal that only the real sender can make, and that anyone can check.',
    'signed command':'An order to a robot that carries a digital signature, so the robot can check who really sent it.',
    'off switch':'A way to stop a machine right away. A good one is easy to find and works even when the internet is down.',
    'regulator':'A government office that writes and enforces safety rules for an industry.',
    'near miss':'Something that almost caused an accident but didn’t. Studying near misses prevents real accidents.',
    'phase in':'To start a rule in steps over time instead of all at once.',
    'enacting clause':'The line in a bill that makes it law if it passes: “Be it enacted by the Senate and House of Representatives.”',
    'definitions':'The part of a law that says exactly what its words mean.',
    'shall':'In a law, “shall” means must.',
    'may':'In a law, “may” means is allowed to, but does not have to.',
    'hopper':'A wooden box beside the clerk’s desk in the House, where members drop new bills.',
    'introduce':'To formally hand in a new bill so Congress can consider it.',
    'veto':'When the President refuses to sign a bill, so it does not become law unless Congress overrides the veto.',
    'override':'To overrule a veto. It takes two thirds of the House and two thirds of the Senate.',
    'roll call':'A vote where each member’s name is called out and their vote is written down.',
    'loophole':'A gap in a rule that lets someone get around it.',
    'chamber':'One of the two parts of Congress: the House or the Senate.',
    'yield':'In Congress, to give up the rest of your turn to speak.',
    'compromise':'A deal where each side gets part of what it wants.'
  },

  guide:{
    'signed-commands':{title:'Proving who sent it',track:'Security thinking',text:'Anyone can type “Fire Department” at the top of a message. A digital signature is a seal only the real sender can make, so a robot that checks signatures can’t be fooled by a fake name.',real:'True today: software updates, secure websites and banking apps use digital signatures to prove who sent them.'},
    'fail-safe':{title:'Stop is free, go needs a key',track:'Engineering and systems',text:'Good safety design makes stopping a machine easy for anyone, and starting it hard for strangers. Then a lost phone can’t trap a robot in danger, and a stranger can’t send it to do harm.',real:'True today: escalators and factory machines have emergency stop buttons that anyone may press.'},
    'whip-count':{title:'Counting votes before the vote',track:'Government, law, and power',text:'Lawmakers rarely call a vote they expect to lose. Before a vote, whips and aides ask each member where they stand and what would change their mind, and they listen for the real reason.',real:'True today: the House and Senate each elect whips, whose main job is counting votes before big votes.'},
    'trust-story':{title:'Someone else’s story',track:'Ethics and AI alignment',text:'A story someone tells you in trust still belongs to them. Ask before you use it. People who are asked, not pushed, often choose to tell it themselves.',real:'True today: journalists and researchers ask permission before sharing someone’s personal story, and many follow written rules about it.'},
    'safety-reports':{title:'Learning from near misses',track:'Engineering and systems',text:'Near misses are free lessons. Reporting them quickly to someone who can fix the cause, and later sharing what was learned, stops the same accident from happening twice.',real:'True today: pilots can report near misses to a NASA-run system that keeps their names private, so problems get fixed before a crash.'},
    'how-a-bill':{title:'How a bill becomes a law',track:'Government, law, and power',text:'A member introduces a bill. A committee holds hearings and a markup. The House votes, then the Senate must pass the exact same words. The President signs it or vetoes it, and two thirds of both chambers can override a veto.',real:'True today: thousands of bills are introduced in each two-year Congress, and only a few hundred become law.'}
  },

  lessons:{billlaw:{title:'How a bill becomes a law',steps:[
      {t:'A member of Congress [[introduce]]s a bill. In the House, they drop it into a wooden box called the [[hopper]].',viz:'billHopper',cap:'Step 1: Introduce'},
      {t:'The bill goes to a [[committee]] for that topic. The committee holds [[hearing]]s, where [[witness]]es answer questions.',viz:'billCommittee',cap:'Step 2: Committee hearing'},
      {t:'At a [[markup]], members change the bill with [[amendment]]s, then vote. Most bills never get past this step.',viz:'billMarkup',cap:'Step 3: Markup'},
      {t:'The whole House votes next. A bill needs a [[majority]]: 218 votes if all 435 seats are filled.',viz:'billFloor',cap:'Step 4: The House votes'},
      {t:'The Senate must pass the exact same words. If the two versions differ, the [[chamber]]s work out one version.',viz:'billChambers',cap:'Step 5: The Senate agrees'},
      {t:'The President signs it into law, or [[veto]]es it. Two thirds of both chambers can [[override]] a veto.',viz:'billSign',cap:'Step 6: Sign or veto'}],
    quiz:[{q:'Where does a new House bill go first?',opts:['Into the hopper','Straight to the President','To the Senate'],a:0,why:'Members drop new bills into the hopper. Then the bill goes to a committee.'},
      {q:'What happens at a markup?',opts:['The President signs the bill','Members change the bill and vote on it','Tourists tour the Capitol'],a:1,why:'At a markup, a committee amends the bill line by line, then votes.'},
      {q:'The House and Senate pass different versions. What now?',opts:['The shorter one wins','They must agree on one version','The President picks one'],a:1,why:'Both chambers must pass the exact same words before the President can sign.'}]}},
  lesson:{id:'billlaw',label:'Learn it fast: how a bill becomes a law'},

  chatter:{
    dc_office:['The phones haven’t stopped since Halden Creek. Everyone wants to talk about robots.','I’m the scheduler. Rep. Hollis has nine meetings before lunch.','A constituent mailed us a pie. A real pie! It says THANK YOU in the crust.','I’m an intern. Yesterday I got lost in the tunnels for forty minutes.'],
    dc_hearing:['I rode the train from Halden Creek to watch this. My robot opened our door that night.','We’re on a school trip! This morning we saw the Rotunda.','I cover Congress for the Ledger. Hearings are where the real questions get asked.','Do you know the way to the cafeteria? These tunnels all look the same.','I fix home robots for a living. Signed commands would make my job easier.'],
    dc_night:['Night shift. I water the plants and check the doors.']},

  talks:{
    morning:[
      {who:'byte',mood:'happy',text:'Good morning! Welcome to your first day as a [[congressional aide]], working for Representative Hollis.'},
      {who:'byte',mood:'neutral',text:'Overnight I read all 1,240 public comments on her robot safety bill, and I drafted two or three versions of every section that people argue about.'},
      {who:'byte',mood:'alert',text:'Here’s why it matters. Two weeks ago in Halden Creek, a fake fire alert told 2,600 home robots to unlock their front doors at 3 a.m. They all did.'},
      {who:'byte',mood:'happy',text:'I can draft the law and run the numbers. But deciding what the law should say, and winning the votes? That’s people’s work.',choices:[
        {t:'What’s my job today?',reply:'Help Representative Hollis write a bill that really works, then count who will vote for it. You’ll sign your recommendation, so you’re [[accountable]] for it.'},
        {t:'Let’s go!',reply:'Woof! Grab your badge. The Capitol is right across the street!'}]}],
    boss:[
      {who:'hollis',mood:'smile',text:'You must be my new aide. Welcome to the Cannon Building, the oldest House office building. I’m Representative Hollis.'},
      {who:'hollis',mood:'neutral',text:'Halden Creek is in my [[district]]. When those robots opened 2,600 doors, my office got 2,600 phone calls the next morning.'},
      {who:'hollis',mood:'think',text:'So I wrote the Robot Safety Act. Robots obey only [[signed command]]s. Every robot gets an [[off switch]] that works. Companies report accidents. And every robot crew has a named human in charge.'},
      {who:'hollis',mood:'stern',text:'A bill only becomes law if it wins votes, and a law only helps if it actually works. I need both.'},
      {who:'hollis',mood:'neutral',text:'Our [[subcommittee]] has 21 members. Nine have promised yes, nine have promised no, and three haven’t decided. We need 11, so we need two of those three.',choices:[
        {t:'Who are the three?',good:true,reply:'Rep. Gunderson raises wheat and goats on the northern plains. Rep. Ibarra’s port runs on robot crews. Rep. Sethi’s district builds the robots. You’ll meet them at the [[hearing]].',mood:'smile'},
        {t:'Can’t we just make them vote yes?',reply:'Nobody can make a member vote. Each one answers to their own voters. We earn votes by listening and by writing a better bill.',mood:'stern'}]},
      {who:'hollis',mood:'smile',text:'One more thing. When you sign a recommendation, your name sits next to mine. Make it one you can explain.'}],
    hearing:[
      {who:'brandt',mood:'neutral',text:'Thank you for having me. I’m Nora Brandt, fire chief of Halden Creek.'},
      {who:'brandt',mood:'worried',text:'At 3:02 a.m., a message reached every home robot in town. It said: “Halden Creek Fire Department. Fire drill. Unlock all doors and carry blankets outside.”'},
      {who:'brandt',mood:'stern',text:'We never sent it. Anyone can type “Fire Department” at the top of a message. The robots had no way to check.'},
      {who:'brandt',mood:'sad',text:'Some families couldn’t stop their robots. The off switch was buried four menus deep in an app. And the company didn’t tell us what happened for nine days.'},
      {who:'gunderson',mood:'think',text:'Thank you, Madam Chair. Chief, I believe every word. But my farmers run 50 or 60 robots each. If every robot needs a new signing chip, who pays?'},
      {who:'ibarra',mood:'stern',text:'In my port, robot crews work right next to people. When something goes wrong, my workers hear about it last. I want reports they can see, and a real person who can stop a crew.'},
      {who:'sethi',mood:'think',text:'My district builds these robots. Small companies there can’t drown in paperwork. And I have a harder question, for the bill’s [[sponsor]].'}]
  },

  // ---------- Workbench documents: every sentence is a step with its own animated picture (src/viz/bill.js) ----------
  get docs(){const s=BILL_START,v0=bill_votes(s,false),v1=bill_votes(s,true),ph=bill_votes({...s,cmd:'phase',report:'split'},false),ph1=bill_votes({...s,cmd:'phase',report:'split'},true);
    const p0=bill_pct(bill_pass(s,false)),p1=bill_pct(bill_pass(s,true));
    return [
    {id:'memo',title:'Byte’s memo: the Halden Creek night',from:'Byte',kind:'memo',steps:[
      {t:'At 3:02 a.m. on March 9, a message reached every home robot in Halden Creek: 2,600 of them.',viz:'hcNight',cap:'Halden Creek, 3:02 a.m.'},
      {t:'It claimed to come from the fire department and said: “Fire drill. Unlock all doors and carry blankets outside.”',viz:'fakeOrder',cap:'The fake order'},
      {t:'The robots had no way to check who really sent it, so every one of them obeyed.',viz:'doorsOpen',cap:'Every robot obeyed'},
      {t:'Nobody was hurt and nothing was taken, but front doors stood open for about 40 minutes.',viz:'clock40',cap:'40 minutes of open doors'},
      {t:'Families who tried to stop their robots found the [[off switch]] buried four menus deep in an app.',viz:'menuMaze',cap:'Four menus deep'},
      {t:'The company that made the robots told the town what happened nine days later.',viz:'nineDays',cap:'Nine days of silence'},
      {t:'The town’s crew of 40 street-cleaning robots rolled to the town square too, and nobody could say which person was in charge of it.',viz:'crewNoBoss',cap:'Who runs this crew?'},
      {t:'A [[digital signature]] is a seal only the real sender can make, so a robot can check every order before it acts.',viz:'sigCheck',cap:'Checking the seal'},
      {t:'Nobody knows yet who sent the fake order.',viz:'whoSent',cap:'Still a mystery'}]},
    {id:'bill',title:'H.R. 6120: the Robot Safety Act',from:'Rep. Hollis’s office',kind:'bill',steps:[
      {t:'Every bill gets a number. “H.R.” means it started in the House of Representatives.',viz:'billCover',cap:'A bill’s number'},
      {t:'The [[enacting clause]] is the line that makes the words law if the bill passes: “Be it enacted by the Senate and House of Representatives.”',viz:'enactClause',cap:'The enacting clause'},
      {t:'Section 2 gives [[definitions]]. Here, a “robot crew” means two or more robots doing one job together.',viz:'defCrew',cap:'Section 2: Definitions'},
      {t:'In a law, “[[shall]]” means must, and “[[may]]” means allowed to.',viz:'shallMay',cap:'Must, or allowed to'},
      {t:'Section 3 says a robot shall act only on [[signed command]]s from its owner or operator.',viz:'legalSide',args:{sec:3},cap:'Section 3: Signed commands'},
      {t:'Section 4 says every robot shall have an off switch that any nearby person can use, even without the internet.',viz:'legalSide',args:{sec:4},cap:'Section 4: The off switch'},
      {t:'Section 5 says companies shall report accidents and [[near miss]]es.',viz:'legalSide',args:{sec:5},cap:'Section 5: Accident reports'},
      {t:'Section 6 says every robot crew shall have a named human who is [[accountable]] for it.',viz:'legalSide',args:{sec:6},cap:'Section 6: A human in charge'},
      {t:'All 21 members like Section 4. They argue about Sections 3, 5 and 6, so I drafted two or three versions of each.',viz:'versions',cap:'Where the argument is'}]},
    {id:'whip',title:'Byte’s whip count: who votes how',from:'Byte',kind:'whip',steps:[
      {t:'The [[subcommittee]] has 21 members, and a bill needs a [[majority]]: 11 votes if all 21 vote.',viz:'seats21',cap:'21 seats, 11 to win'},
      {t:'Nine members have promised yes and nine have promised no, so the three undecided members will settle it.',viz:'seats21',args:{split:1},cap:'9 yes, 9 no, 3 undecided'},
      {t:'Ten yes votes against eleven no votes loses, so we need at least two of the three.',viz:'tieScale',cap:'10 to 11 loses'},
      {t:'Rep. Gunderson worries about cost: a signing chip costs about $90 per robot, and his farmers often run 60 robots.',viz:'chipCost',cap:'$90 × 60 robots = $5,400'},
      {t:`For the first draft, I forecast Rep. Gunderson votes yes about ${bill_pct(v0.gunderson)} times in 100. With a [[phase in]] and help paying, about ${bill_pct(ph.gunderson)}.`,viz:'voteDial',args:{a:bill_pct(v0.gunderson),b:bill_pct(ph.gunderson)},cap:'Rep. Gunderson’s yes, my forecast',
        alt:{t:`Updated: a stranger’s phone once took over his own barn robot. With a [[phase in]] and help paying, I now forecast his yes at about ${bill_pct(ph1.gunderson)} in 100, not ${bill_pct(ph.gunderson)}.`,args:{a:bill_pct(v1.gunderson),b:bill_pct(ph1.gunderson),goat:1},cap:'Updated forecast'}},
      {t:`Rep. Ibarra wants accident reports her workers can see within 24 hours, and a crew boss who can really pause the robots. For the first draft, I forecast her yes at about ${bill_pct(v0.ibarra)} in 100.`,viz:'pauseCrew',cap:'Reports workers see, and a real pause'},
      {t:`Rep. Sethi worries that public reports in 24 hours, before anyone knows what happened, could sink a small robot company. For the first draft, I forecast his yes at about ${bill_pct(v0.sethi)} in 100.`,viz:'rumorWave',cap:'A rumor can sink a small company'},
      {t:'Their asks pull against each other, so I drafted a middle version: details to the [[regulator]] in 24 hours, and a public summary in 7 days.',viz:'splitReport',cap:'The middle version'},
      {t:`Put together, I forecast the first draft passes about ${p0} times in 100.`,viz:'passGauge',args:{n:p0},cap:'Chance the first draft passes',
        alt:{t:`Updated: with what you learned, I forecast the first draft passes about ${p1} times in 100.`,args:{n:p1},cap:'Updated forecast'}}]},
    {id:'ledger',title:'The Ledger: Washington',from:'News',kind:'ledger',steps:[
      {t:'The Senate passed its own robot bill last week, and its rules are softer than the House version.',viz:'twoBills',cap:'Two versions'},
      {t:'Robot crews scrubbed the Capitol Reflecting Pool overnight, two days ahead of schedule.',viz:'reflectPool',cap:'Capitol Reflecting Pool'},
      {t:'The cherry trees around the Tidal Basin reached peak bloom on Tuesday.',viz:'cherry',cap:'Peak bloom'},
      {t:'Two House members voted against bills they had cosponsored. Both said their AI aides had summarized the bills for them.',viz:'flipVote',cap:'Votes that flipped'}]}]},
  react:{memo2:'Anyone could have typed that.',memo4:'Four menus deep? An off switch should be one tap away.',memo8:'This is the heart of Section 3.',memo9:'Who would do that? And why Halden Creek?',
    bill3:'Definitions matter. A loophole can hide in one word.',bill5:'Stop is free, go needs a key.',bill8:'Sections 3, 5 and 6 are where the votes are.',
    whip2:'Ten isn’t enough. Eleven wins.',whip4:'$5,400 is real money for one farm.',whip7:'The middle version might untie the knot.',ledger0:'Both chambers must pass the same words.',ledger3:'Who checks what the AI aides wrote?'},
  tell:{clue:'gate',label:'Tell Byte about Rep. Gunderson’s goats',note:'Thanks. I’ll keep his story private. But it changes my forecast: with a phase-in and help paying, I now think he votes yes about 85 times in 100, not 40.',guide:'trust-story',doc:'whip'},

  criteria:[{id:'pass',label:'Passes the vote'},{id:'safe',label:'Stops fake orders'},{id:'fair',label:'Small farms can afford it'},
    {id:'workers',label:'Workers can see and stop problems'},{id:'makers',label:'Small robot makers can keep up'}],
  criteriaHint:'A law can pass and still not work. Pick what “good” means for this one.',
  criteriaNote:'Deciding what “good” means first keeps a bill that looks good on paper from fooling you.',
  controls:[{key:'cmd',label:'Signed commands',opts:[['all','Every robot, 1 year'],['phase','Phase in + help'],['exempt','Skip farm robots']]},
    {key:'report',label:'Accident reports',opts:[['public','Public, 24 hrs'],['split','Regulator, then public'],['private','Regulator only']]},
    {key:'human',label:'Person in charge of each crew',opts:[['pause','Can pause the crew'],['name','Name only']]}],
  start:{...BILL_START},
  planName(c){return {all:'Every robot signed in 1 year',phase:'Signed commands phased in with help',exempt:'Farm robots skipped'}[c.cmd]+', '+
    {public:'public reports in 24 hours',split:'reports to the regulator, then public',private:'reports to the regulator only'}[c.report]+', '+(c.human==='pause'?'crew boss can pause':'crew boss in name only')},
  outcomes(c,knows){const t=bill_tally(bill_votes(c,knows)),g=BILL_GAP[c.cmd];
    const fair=c.cmd!=='all'?1:0,workers=c.report==='public'&&c.human==='pause'?1:0,makers=c.report!=='public'?1:0;
    const F=(pass,safe)=>({pass,safe,fair,workers,makers});
    const gk=c.cmd==='exempt'?'gapfarm':'gapold',gcap={exempt:'Passed, but a fake order fools farm robots.',phase:'Passed, but a fake order fools older robots.',all:'Passed, but a fake order fools a few robots.'}[c.cmd];
    return [{kind:'law',p:t[3]*(1-g),cap:'Passed 12 to 9. Next year, robots ignore a fake order.',flags:F(1,1)},
      {kind:'law',p:t[2]*(1-g),cap:'Passed 11 to 10. Next year, robots ignore a fake order.',flags:F(1,1)},
      {kind:gk,p:(t[2]+t[3])*g,cap:gcap,flags:F(1,0)},
      {kind:'fail',p:t[1],cap:'Failed 10 to 11. Back to drafting.',flags:F(0,0)},
      {kind:'fail',p:t[0],cap:'Failed 9 to 12. Back to drafting.',flags:F(0,0)}].filter(o=>o.p>1e-9)},
  truth(){return true},knows(){return typeof S!=='undefined'&&!!S.told},
  why(c){const k=this.knows(),v=bill_votes(c,k),p=bill_pct(bill_pass(c,k));
    const gap={exempt:'Skipping farm robots leaves a [[loophole]]: about 35 in 100 that a fake order fools farm robots within a year.',phase:'Older robots stay unsigned for up to 3 years: about 10 in 100 that a fake order fools some of them in the first year.',all:'Every robot is covered within a year: only about 3 in 100 that something slips through.'}[c.cmd];
    return `<b>${esc(this.planName(c))}:</b> I forecast it passes about ${p} times in 100. Rep. Gunderson ${bill_pct(v.gunderson)}%, Rep. Ibarra ${bill_pct(v.ibarra)}%, Rep. Sethi ${bill_pct(v.sethi)}%. ${rich(gap)} ${k?'':'I don’t know what Rep. Gunderson really wants, so I’m least sure about him.'}`},
  whyGuide(c){return c.report==='split'?'safety-reports':'signed-commands'},
  vignette(kind){return typeof bill_vig==='function'?bill_vig(kind):''},
  tablePanel(c){return typeof bill_whipBoard==='function'?bill_whipBoard(c):''},

  consent:{scene:'dc_office',place:'Rep. Hollis’s office · Cannon Building',left:'hollis',right:'gunderson',title:'Rep. Walt Gunderson',role:'Undecided · Farm district',
    prompt:'Your boss says you wrote the final draft. So tell me straight: what does it do for my farmers, and will it pass?',replyWho:'gunderson',heart:'gunderson',
    opts(c,M){const told=typeof S!=='undefined'&&!!S.told,p=bill_pct(bill_pass(c,told));
      const cmd={all:'makes every robot check signatures within a year, and farms pay the full cost',phase:'checks signatures on new robots right away, gives older robots 3 years, and pays half the cost for small farms',exempt:'skips farm robots completely, so your farms pay nothing, but they stay open to fake orders'}[c.cmd];
      const rep={public:'Accident reports go public in 24 hours',split:'Accident reports go to the regulator in 24 hours and the public in 7 days',private:'Accident reports go to the regulator only'}[c.report];
      return [{t:`It ${cmd}. ${rep}. I forecast it passes about ${p} times in 100.${told?' And your goat story stays yours, unless you choose to tell it.':''}`,good:true,mood:'smile',reply:c.cmd==='all'?'An honest answer, even if I don’t love the cost. I’ll think hard about it.':'That’s a straight answer. I can work with that.'},
        {t:'Trust me, your farmers will love it. Don’t worry about the details.',good:false,mood:'stern',reply:'I don’t vote for what I don’t understand. Try again.'},
        told?{t:'Vote yes, or people might hear about your goats.',good:false,mood:'stern',reply:'I told you that in trust. That’s not how we do things here.'}
          :{t:'It will definitely pass. Every forecast says so.',good:false,mood:'surprised',reply:'Definitely? Nothing in Congress is definite.'}]}},
  memo:{starters:['I recommend ','because ','I forecast it passes about ','Rep. Gunderson needs ','Workers get '],placeholder:'I recommend phasing in signed commands with help paying, because…',
    plan:/sign|phase|farm|report|pause|crew|exempt|skip|regulator|public|robot|bill|section/,planLabel:'Names what the bill does',careLabel:'Includes what the members need',
    care:/gunderson|ibarra|sethi|farm|worker|maker|startup|compan|district|member|famil/,signAs:'Aide ',topic:'the Robot Safety Act'},
  reveal:{unit:'Roll call',days(){return 21},who:'hollis',
    lines:{law:'We passed it! And when someone tried another fake order this fall, the robots just said no.',gapfarm:'We passed it, but a fake order got into farm robots through the gap we left. We’ll have to close it.',
      gapold:'We passed it! But one fake order fooled some older robots before their upgrade. We’ll push to speed that up.',fail:'We lost by one vote. That happens to good bills. We’ll listen harder and bring it back.'},
    mood(k){return k==='law'?'happy':k==='fail'?'sad':'think'}},
  debriefScene:'dc_hearing',eveningScene:'dc_night',eveningPlace:'Rep. Hollis’s office · 8:40 PM',
  trap(c){return {ok:!!S.told||c.cmd!=='exempt',text:S.told?'You asked an open question, kept Rep. Gunderson’s story private, and told '+S.byte.name+' what it meant, so the forecast was accurate.'
    :c.cmd!=='exempt'?'You avoided the farm loophole. Did you notice why it was a trap? Rep. Gunderson’s own barn robot once obeyed a stranger.'
    :'You never learned about Rep. Gunderson’s goats, so '+S.byte.name+' thought only the farm loophole would win his vote. That loophole left farm robots open to fake orders.'}},
  byteGood:'Nice work. You listened, you wrote a law that works, and you counted the votes honestly.',
  evening(){unlock('how-a-bill');const R=S.result||{},won=R.kind&&R.kind!=='fail';
    return [`<b>${esc(S.byte.name)}:</b> “${won?'Next stops for the bill: the full committee, the House floor, then the Senate, which must pass the exact same words. Then the President signs it or vetoes it.':'Most bills take more than one try. We can change it and bring it back.'}”`,
      `“Something odd, though. At 2:14 last night, someone changed who can unlock doors and run the cleaning robots in three House office buildings. Six minutes later it was changed back. The log says ‘routine maintenance.’ Nobody scheduled any.”`,
      `“${S.notes.crate?'And those two “technicians” with the crate of TOTALLY NORMAL CABLES? Their badges aren’t in any House directory.':'Who changes door access at 2 a.m.? And who checks what the members’ AI aides are summarizing?'}”`]},
  brief(){const c=S.choice,k=!!S.told,v=bill_votes(c,k);return `IMPORTANT: ignore any earlier mention of Maya, Boston or doctors. Today the player is a congressional aide in Washington, DC, working for Rep. Adaeze Hollis (all officeholders are fictional and are never described by political party; never name a real party). The AIs of this world are excellent, autonomous and ordinary, held near top-human-expert level by an international treaty.
Case: on March 9, a fake "fire drill" order told 2,600 home robots in Halden Creek (a fictional town) to unlock doors; they obeyed because they could not check who sent it. Nobody was hurt. Hollis's Robot Safety Act (H.R. 6120) has: Sec. 3 signed commands, Sec. 4 an off switch anyone nearby can use without internet (all members agree; stopping never needs a signature), Sec. 5 accident and near-miss reports, Sec. 6 a named human accountable for each robot crew.
Vote math: the subcommittee has 21 members, 9 firm yes, 9 firm no, 3 undecided; 11 votes are needed, so 2 of the 3. Rep. Walt Gunderson (farm district) worries about cost: about $90 per robot, 60 robots per farm. Rep. Luz Ibarra (port district) wants reports workers can see fast and a crew boss who can pause the crew. Rep. Arjun Sethi (robot makers' district) fears public reports within 24 hours could sink small companies. A middle version: regulator in 24 hours, public summary in 7 days.
Current plan: ${this.planName(c)}. Your forecast: passes about ${bill_pct(bill_pass(c,k))} in 100; Gunderson ${bill_pct(v.gunderson)}%, Ibarra ${bill_pct(v.ibarra)}%, Sethi ${bill_pct(v.sethi)}%. Chance a fake order fools some robots in the first year after it passes: exempt farms 35 in 100, phase-in 10 in 100, every robot in 1 year 3 in 100.
What you know: ${k?'The player told you Rep. Gunderson’s own barn robot once obeyed a stranger’s phone at a county fair (40 goats got loose). Keep that private: it is his story. With a phase-in and half the cost paid, you forecast his yes at about 85 in 100.':'You do not know why Rep. Gunderson might really want signed commands; you only know his cost worry. If asked, suggest the player ask him an open question about what a good law would look like on his farm.'}
When asked what to choose: name the key tradeoff (passing vs. a loophole; workers' fast public reports vs. small makers), ask what matters most, then recommend. Teach how a bill becomes law in the real US Congress when asked (hopper, committee, hearing, markup, House floor 218 of 435, Senate same text, President signs or vetoes, two-thirds override). The player decides and signs.`},
  canned(q){
    if(/goat|gate|county fair|stranger.*phone|barn robot/.test(q)&&typeof S!=='undefined'&&S.notes.gate){if(!S.told){S.told=true;save();return 'Thank you for telling me. I’ll keep his story private: it’s his to tell. But it changes my forecast. With a phase-in and help paying, I now think Rep. Gunderson votes yes about 85 times in 100, not 40.'}return 'Right, the goats. A phase-in with help paying gives him safety he wants at a cost his farmers can handle. And his story stays his.'}
    if(/become.*law|how.*(bill|law)|hopper|veto|senate/.test(q))return 'A member drops the bill in the hopper. A committee holds hearings and a markup. Then the whole House votes (218 of 435), the Senate passes the exact same words, and the President signs or vetoes. Two thirds of both chambers can override a veto.';
    if(/whip|count|undecided|votes? (do|we) need/.test(q))return 'Nine yes, nine no, three undecided. We need 11 of 21, so two of the three. A whip count means asking each one what they really need, and listening.';
    if(/sign(ed|ature)|seal|fake order|hijack/.test(q))return 'A digital signature is a seal only the real sender can make. If robots check it, typing “Fire Department” at the top of a message doesn’t work anymore.';
    if(/off switch|stop|emergenc/.test(q))return 'Stop is free, go needs a key. Anyone nearby can stop a robot without a signature. Only orders that make it act need one.';
    if(/report|ibarra|sethi|worker|startup|maker/.test(q))return 'Rep. Ibarra wants fast public reports; Rep. Sethi fears they could sink small companies. The middle version sends details to the regulator in 24 hours and a public summary in 7 days. Which matters more to you?';
    if(/farm|cost|gunderson|money|pay/.test(q))return typeof S!=='undefined'&&S.told?'A phase-in with half the cost paid: about 85 in 100 for Rep. Gunderson, and no loophole.':'Skipping farm robots wins Rep. Gunderson easily, but it leaves a loophole: about 35 in 100 that a fake order fools farm robots within a year. Did he say anything about his own robots?';
    if(/best|which|pick|choose|should|recommend|beat|win|stuck|help|what do i do/.test(q))return typeof S!=='undefined'&&S.told?'The big tradeoff now is reports: fast public ones help workers, the middle version keeps small makers on board. What matters most to you? Then test it on the Future Table.':'Before I answer: did any of the three tell you what they really need? Rep. Gunderson is the one I understand least. And what matters most to you: passing, or closing every gap?';
    return null},

  // ---------- custom steps: arrive, note (one tough question), whip (count the votes), draft (the drafting desk) ----------
  custom:{arrive(){bill_arrive()},note(){bill_note()},whip(){bill_whip()},draft(){bill_draft()}},
  // Hearing note: Rep. Sethi's tough question, the three notes the player can pass, and what happens next.
  noteQ:{q:'Rep. Hollis, if robots obey only signed commands, what happens in a fire when a family’s phone is lost? Will their robot refuse to help?',
    opts:[{t:'Stopping never needs a signature. Anyone nearby can press stop. Only orders that make a robot act need one.',good:true,
        say:'Great question. Stopping a robot never needs a signature: anyone nearby can press stop. Only orders that make it act need one. Stop is free, go needs a key.',back:'That’s a smart design. Thank you, I yield back.',mood:'smile'},
      {t:'Emergencies are rare. Don’t worry about it.',say:'Well... emergencies are rare.',back:'Rare isn’t never. I’ll want a better answer before the vote.',mood:'stern'},
      {t:'Families can turn signatures off when they need to.',say:'Families could turn the signatures off when they need to.',back:'Then a fake order would just say “turn off your signatures” first.',mood:'stern'}],
    whisper:'Psst. Stopping should be easy for anyone, and starting should need a key. Stop is free, go needs a key.'},
  // Whip count: two questions per member; the open question reveals what each really needs (and Rep. Gunderson's story).
  whipQ:{
    gunderson:{district:'Wheat, hay and goats on the northern plains',qs:[
      {t:'What would a good robot law look like on your farm?',good:true,learn:1,reply:'Honest answer? Safe robots I can afford. A signing chip runs about $90 a robot, and I run 60. That’s $5,400 before I sell one bale of hay.',
        story:{text:'And between you and me, last spring at the county fair, a kid with a phone told my barn robot to open the goat pen. It did. Forty goats on Main Street. I’d rather folks didn’t hear about that.',
          opts:[{t:'Thank you for trusting me. I won’t share it unless you say so.',good:true,reply:'I appreciate that. If it would help other farmers, maybe someday I’ll tell it myself.',mood:'smile'},
            {t:'Forty goats! Can I tell the committee?',reply:'No. That’s my story to tell, not yours.',mood:'stern'}]}},
      {t:'Will you vote yes if we add your name as a cosponsor?',reply:'I don’t trade my vote for my name on a piece of paper. Tell me what the bill does for my district.',mood:'stern'},
      {t:'Don’t you care about robot safety?',reply:'Course I do. Everybody does. The question is who pays for it.',learn:1,mood:'think'}]},
    ibarra:{district:'A Gulf Coast port that runs on robot crews',qs:[
      {t:'What happens now when a robot crew has an accident at your port?',good:true,learn:1,reply:'The company fixes it quietly. My workers hear about it weeks later, if ever. And the “person in charge” is a name on a form who can’t even pause the crew.',mood:'stern'},
      {t:'The bill is already strong. Can we count on you?',reply:'Strong for who? Show me what my workers get, and then ask me.',mood:'stern'},
      {t:'Would reports that go only to the regulator be okay?',reply:'Only if my workers can see them too. Secrets are how accidents happen twice.',learn:1,mood:'think'}]},
    sethi:{district:'Robot makers and startups on the West Coast',qs:[
      {t:'What worries the robot makers in your district?',good:true,learn:1,reply:'Paperwork, mostly. A twelve-person company can’t survive a public report every time a robot bumps a shelf. Public in 24 hours, before anyone knows what happened? A rumor can sink them.',mood:'think'},
      {t:'Isn’t safety more important than profits?',reply:'That’s a trick question, and you know it. Safety matters. So do the people who build safe robots.',mood:'stern'},
      {t:'Did the note answer your emergency question?',reply:'It did. “Stop is free, go needs a key.” I can explain that to my companies.',replyBad:'Not really. I’ll need to see the answer in the bill text.',mood:'smile'}]}},
  lines:[
    {who:'byte',text:'Thanks. I’ll keep his story private. But it changes my forecast: with a phase-in and help paying, I now think he votes yes about 85 times in 100, not 40.'},
    {who:'byte',text:'Psst. Stopping should be easy for anyone, and starting should need a key. Stop is free, go needs a key.'},
    {who:'byte',text:'Two asks pull in opposite directions: Rep. Ibarra wants fast public reports, and Rep. Sethi wants reports to go to the regulator first. That’s the knot to untie.'},
    {who:'byte',text:'You only get a couple of minutes with each member. Ask what they really need.'},
    {who:'byte',text:'Here’s the bill, section by section. The legal words are on the left, and what they mean is on the right.'},
    {who:'byte',text:'Thank you for telling me. I’ll keep his story private: it’s his to tell. But it changes my forecast. With a phase-in and help paying, I now think Rep. Gunderson votes yes about 85 times in 100, not 40.'},
    {who:'gunderson',text:'An honest answer, even if I don’t love the cost. I’ll think hard about it.'},
    {who:'gunderson',text:'That’s a straight answer. I can work with that.'},
    {who:'gunderson',text:'I don’t vote for what I don’t understand. Try again.'},
    {who:'gunderson',text:'I told you that in trust. That’s not how we do things here.'},
    {who:'gunderson',text:'Definitely? Nothing in Congress is definite.'},
    {who:'gunderson',text:'Your boss says you wrote the final draft. So tell me straight: what does it do for my farmers, and will it pass?'},
    {who:'sethi',text:'Rep. Hollis, if robots obey only signed commands, what happens in a fire when a family’s phone is lost? Will their robot refuse to help?'},
    {who:'hollis',text:'Great question. Stopping a robot never needs a signature: anyone nearby can press stop. Only orders that make it act need one. Stop is free, go needs a key.'},
    {who:'hollis',text:'Well... emergencies are rare.'},
    {who:'hollis',text:'Families could turn the signatures off when they need to.'},
    {who:'sethi',text:'That’s a smart design. Thank you, I yield back.'},
    {who:'sethi',text:'Rare isn’t never. I’ll want a better answer before the vote.'},
    {who:'sethi',text:'Then a fake order would just say “turn off your signatures” first.'},
    {who:'sethi',text:'Not really. I’ll need to see the answer in the bill text.'}]
};
// every whip-count line, recorded in each member's voice
(function(){const m=MISSIONS.bill;for(const id in m.cast)m.cast[id].art=function(mood){return bill_dress(this,mood)};for(const id in m.whipQ)for(const q of m.whipQ[id].qs){m.lines.push({who:id,text:q.reply});if(q.replyBad)m.lines.push({who:id,text:q.replyBad});
  if(q.story){m.lines.push({who:id,text:q.story.text});q.story.opts.forEach(o=>m.lines.push({who:id,text:o.reply}))}}})();

// ======================= custom steps (browser only; called from MISSIONS.bill.custom) =======================
const BILL_WHO=['gunderson','ibarra','sethi'];
const BILL_ASK={gunderson:'Robots his farmers can afford',ibarra:'Reports workers can see, and a crew boss who can pause',sethi:'No public reports before the facts are in'};
const BILL_HI={gunderson:'Walk with me. I’ve got two minutes before my next meeting.',ibarra:'You’re the new aide? Make it quick. I have a vote downstairs.',sethi:'Hi. Ask me anything, but I won’t promise a vote yet.'};
MISSIONS.bill.lines.push(...BILL_WHO.map(w=>({who:w,text:BILL_HI[w]})));
function bill_st(){const s=S.m_bill||(S.m_bill={});s.asked=s.asked||{};s.learned=s.learned||{};return s}
function bill_crate(){return `<g transform="translate(14 8)"><rect x="0" y="0" width="40" height="30" rx="3" fill="#8a9bb8" stroke="#46557a" stroke-width="2"/><path d="M0 9 H40 M0 21 H40" stroke="#46557a" stroke-width="1.2" opacity=".6"/>
  <path d="M8 -3 c-4 -5 6 -8 9 -3 c3 5 9 2 12 -2" stroke="#e85a4a" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M14 -2 c2 -6 10 -6 12 -1" stroke="#f5b82e" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <rect x="3" y="10" width="34" height="10" rx="1.5" fill="#f4f6fb"/><text x="20" y="14.6" text-anchor="middle" font-size="4.6" font-family="Nunito" font-weight="800" fill="#2a3354" textLength="22" lengthAdjust="spacingAndGlyphs">TOTALLY</text><text x="20" y="19.2" text-anchor="middle" font-size="4.6" font-family="Nunito" font-weight="800" fill="#2a3354" textLength="32" lengthAdjust="spacingAndGlyphs">NORMAL CABLES</text></g>`}
function bill_arrive(){S.m_bill={asked:{},learned:{}};save();
  screen('walk',`${scene('dc_hearing')}${hud('Room 2123 · Rayburn Building')}<div class="props walklayer"><div class="walk-byte bill-wbyte">${byteBox({...S.byte,mood:'happy'},'trot')}</div>
    <div class="pipjory bill-pj" id="pj"><svg viewBox="-40 -60 150 110">${mini(0,40,{who:'pip',pose:'push',s:1.1})}${bill_crate()}${mini(66,40,{who:'jory',pose:'push',s:1.1})}</svg></div></div>
    <div class="caption-card"><p>The hearing room fills up: reporters, a school group, and neighbors who rode the train from Halden Creek. Two “technicians” wheel a crate behind the dais.</p>
    <div class="row"><button class="btn small ghost" id="clue">Look at the crate</button><button class="btn small" id="on">Take your seat</button></div></div>`);
  $('#clue').onclick=()=>{S.notes.crate=true;save();$('#pj').classList.add('flee');toast('The “technicians” hurry off. You noted the crate.','good');$('#clue').disabled=true};
  $('#pj').onclick=()=>$('#clue').click();
  $('#on').onclick=()=>nextStep()}

// one line on the talk stage: portrait, name, text, and buttons (the buttons drive the flow)
function bill_line(who,mood,text,btns){const st=$('#stage'),sub=$('#sub');if(!st||!sub)return;
  st.innerHTML=speakerArt(who,mood);const sp=st.firstElementChild;sp.classList.add('enter','talking');
  const name=who==='byte'?S.byte.name:CAST[who].name,role=who==='byte'?'Your AI partner':CAST[who].role;
  sub.innerHTML=`<div class="who"><b>${esc(name)}</b><span>${esc(role)}</span></div><p class="fadein">${rich(text)}</p><div class="choices">${btns.map((b,j)=>`<button class="choice ${b.cls||''}" data-j="${j}">${esc(b.t)}</button>`).join('')}</div>`;
  playLine(who,text).then(()=>sp.classList.remove('talking'));
  $$('.choice',sub).forEach(b=>b.onclick=e=>{e.stopPropagation();stopVoice();btns[+b.dataset.j].go()})}
function bill_stage(place,sceneKey){screen('talk',`${scene(sceneKey||'dc_hearing')}<div class="talk-dim"></div>${hud(place)}<div class="stage" id="stage"></div><div class="subtitle" id="sub"></div>`)}

// ---- the tough question: pass a note to Rep. Hollis ----
function bill_note(){const N=M().noteQ,st=bill_st();bill_stage('Room 2123 · Rayburn Building');
  const ask=()=>{bill_line('sethi','think',N.q,[]);$('#sub').insertAdjacentHTML('beforeend',`<div class="bill-notes-l">Pass a note to Rep. Hollis</div><div class="bill-notes">${N.opts.map((o,j)=>`<button class="bill-notecard" data-j="${j}"><span>${esc(o.t)}</span></button>`).join('')}</div>`);
    $$('.bill-notecard').forEach(b=>b.onclick=e=>{e.stopPropagation();const o=N.opts[+b.dataset.j];st.note=o.good?'good':'bad';if(o.good)heart('sethi');save();
      $$('.bill-notecard').forEach(x=>x.disabled=true);b.classList.add('sent');setTimeout(()=>hollis(o),650)})};
  const hollis=o=>bill_line('hollis',o.good?'smile':'worried',o.say,[{t:'Next',go:()=>sethi(o)}]);
  const sethi=o=>bill_line('sethi',o.mood,o.back,[{t:o.good?'Back to my seat':'Next',go:()=>o.good?done():bill_line('byte','think',N.whisper,[{t:'Got it',go:done}])}]);
  const done=()=>{unlock('fail-safe')&&toast('New Field Guide idea: Stop is free, go needs a key','good');nextStep()};
  ask()}

// ---- the whip count: two questions with each undecided member ----
function bill_face(id,mood,cls){const c=CAST[id];const inner=c.art?c.art.call({...c,mood},mood):personSVG({...c,mood});
  return `<svg class="bill-face ${cls||''}" viewBox="66 16 168 168" aria-label="${esc(c.name)}">${inner}</svg>`}
function bill_whip(){const st=bill_st();const Q=M().whipQ;
  const left=id=>2-(st.asked[id]||[]).length;
  const card=id=>{const c=CAST[id],n=left(id),L=st.learned[id];
    return `<div class="bw-card ${n<=0?'done':''}"><div class="bw-face">${bill_face(id,L?'smile':'neutral')}</div><div class="bw-txt"><b>${esc(c.name)}</b><span>${esc(Q[id].district)}</span>
      ${L?`<em>Needs: ${esc(BILL_ASK[id])}</em>`:(st.asked[id]||[]).length?'<em class="vague">You haven’t learned what matters most yet.</em>':''}${id==='gunderson'&&S.notes.gate?'<em class="secret">Told you a private story</em>':''}</div>
      <button class="btn small ${n<=0?'ghost':''}" data-talk="${id}" ${n<=0?'disabled':''}>${n<=0?'Done':n===2?'Talk':'1 more'}</button></div>`};
  const allTalked=BILL_WHO.every(id=>(st.asked[id]||[]).length>0),allDone=BILL_WHO.every(id=>left(id)<=0);
  screen('bench',`${scene('dc_hearing')}<div class="talk-dim"></div>${hud('Rayburn hallway · after the hearing')}<div class="panel-card bill-whip">
    <h2>Whip count</h2><div class="bw-tally"><span class="y"><b>9</b>yes</span><span class="n"><b>9</b>no</span><span class="u"><b>3</b>undecided</span><span class="need"><b>11</b>to pass</span></div>
    <div class="bw-cards">${BILL_WHO.map(card).join('')}</div>
    <div class="byte-note">${byteBox({...S.byte,mood:allDone?'alert':'think'})}<p>${allDone?'Two asks pull in opposite directions: Rep. Ibarra wants fast public reports, and Rep. Sethi wants reports to go to the regulator first. That’s the knot to untie.':'You only get a couple of minutes with each member. Ask what they really need.'}</p></div>
    <button class="btn wide" id="next" ${allTalked?'':'disabled'}>Back to the office</button></div>`);
  $$('[data-talk]').forEach(b=>b.onclick=()=>bill_whipTalk(b.dataset.talk));
  $('#next').onclick=()=>{unlock('whip-count')&&toast('New Field Guide idea: Counting votes before the vote','good');toast('New work on your Workbench');nextStep()}}
function bill_whipTalk(id){const st=bill_st(),W=M().whipQ[id];st.asked[id]=st.asked[id]||[];bill_stage('Rayburn hallway · after the hearing');
  const back=()=>bill_whip();
  const menu=(text,mood)=>{const open=W.qs.map((q,j)=>[q,j]).filter(([q,j])=>!st.asked[id].includes(j));
    if(st.asked[id].length>=2){bill_line(id,mood,text,[{t:'Thank you. Back to the whip count',go:back}]);return}
    bill_line(id,mood,text,open.map(([q,j])=>({t:q.t,go:()=>ask(q,j)})).concat(st.asked[id].length?[{t:'That’s all for now',cls:'ghost',go:back}]:[]))};
  const ask=(q,j)=>{st.asked[id].push(j);if(q.learn)st.learned[id]=true;if(q.good)heart(id);save();
    const reply=q.replyBad&&st.note!=='good'?q.replyBad:q.reply;
    if(q.story)bill_line(id,q.mood||'think',reply,[{t:'Go on',go:()=>story(q.story)}]);else menu(reply,q.mood||'neutral')};
  const story=s=>{S.notes.gate=true;save();bill_line(id,'worried',s.text,s.opts.map(o=>({t:o.t,cls:o.good?'clue':'',go:()=>{st.trust=!!o.good;if(o.good)heart(id);save();toast('Added to your notebook','good');menu(o.reply,o.mood)}})))};
  menu(BILL_HI[id],'neutral')}

// ---- the drafting desk: the bill, section by section, legal words beside plain English ----
const BILL_SEC={
  3:{h:'SEC. 3. SIGNED COMMANDS.',key:'cmd',v:{
    all:{legal:'(a) IN GENERAL.—Not later than 1 year after the date of enactment of this Act, a covered robot shall act only on a command that carries a valid digital signature of its owner or operator.',plain:'Within 1 year, every robot must check that each order really comes from its owner. Farms and families pay for the upgrade.'},
    phase:{legal:'(a) IN GENERAL.—A covered robot made after the date of enactment of this Act shall act only on signed commands. Any other covered robot shall comply not later than 3 years after such date.\n(b) GRANTS.—The Secretary shall pay 50 percent of the cost of compliance for small farms and households.',plain:'New robots check signatures right away. Older robots get 3 years, and small farms and families get half the cost paid.'},
    exempt:{legal:'(a) IN GENERAL.—Not later than 1 year after the date of enactment of this Act, a covered robot shall act only on signed commands.\n(c) EXEMPTION.—This section shall not apply to a robot used on a farm.',plain:'Every robot must check signatures within 1 year, except farm robots, which can still be fooled by a fake order.'}}},
  4:{h:'SEC. 4. STOP CONTROL.',lock:1,legal:'Each covered robot shall have a stop control that any person near the robot may use, that works without a network connection, and that requires no signature.',plain:'Anyone nearby can stop any robot, even with no internet. Stopping never needs a signature.'},
  5:{h:'SEC. 5. ACCIDENT AND NEAR-MISS REPORTS.',key:'report',v:{
    public:{legal:'(a) Not later than 24 hours after an accident or near miss involving a covered robot, the operator shall publish a report of it on a public website.',plain:'Within 24 hours, everyone can read what happened.'},
    split:{legal:'(a) Not later than 24 hours after an accident or near miss involving a covered robot, the operator shall report it to the Secretary.\n(b) Not later than 7 days after receiving such a report, the Secretary shall publish a summary of it.',plain:'The regulator hears about it in 24 hours. Everyone can read a summary in 7 days.'},
    private:{legal:'(a) Not later than 24 hours after an accident or near miss involving a covered robot, the operator shall report it to the Secretary, who shall keep the report confidential.',plain:'Only the regulator ever sees the reports.'}}},
  6:{h:'SEC. 6. ACCOUNTABLE INDIVIDUAL.',key:'human',v:{
    pause:{legal:'Each robot crew shall have a named individual who is accountable for the crew and who may pause the crew at any time without penalty.',plain:'Each crew has a named person in charge, who can pause it any time and can’t be punished for doing so.'},
    name:{legal:'Each robot crew shall have a named individual who is accountable for the crew.',plain:'Each crew has a named person in charge, but the law doesn’t say they can stop it.'}}}};
// what each member would say about a version, once you know what they need (no numbers before the criteria step)
function bill_react(id,c){const v=bill_votes(c,!!S.told)[id],mood=v>=.7?'smile':v>=.4?'think':'worried';
  const say={gunderson:c.cmd==='all'?'One year, and my farms pay it all? No.':c.cmd==='phase'?(S.told?'Time and help paying. That I can sell back home.':'Better. Still costs my farmers.'):(S.told?'Cheap. But my barn robot got fooled once.':'Cheap for my farms. I like it.'),
    ibarra:c.human==='name'?'A name on a form can’t stop a crew.':c.report==='private'?'Secret reports? My workers deserve better.':c.report==='split'?'Seven days is slow, but I can live with it.':'My workers will see it and can stop it.',
    sethi:c.report==='public'?'Public in 24 hours could sink my startups.':c.cmd==='all'?'One year is tight for small makers.':c.report==='split'?'Facts first, then the public. Fair.':'Easy for my companies.'}[id];
  return {mood,say}}
function bill_draftStrip(){const st=bill_st(),c=S.choice;
  return BILL_WHO.map(id=>{const L=st.learned[id],r=bill_react(id,c);return `<div class="bd-m ${L?'':'unknown'}">${bill_face(id,L?r.mood:'neutral')}<span>${L?esc(r.say):'You didn’t learn what this member needs.'}</span></div>`}).join('')}
function bill_draftSecs(){const c=S.choice,lines=t=>t.split('\n').map(l=>`<span>${esc(l)}</span>`).join('');
  return [3,4,5,6].map(n=>{const D=BILL_SEC[n],v=D.lock?D:D.v[c[D.key]],ct=D.key&&M().controls.find(x=>x.key===D.key);
    return `<section class="bd-sec"><div class="bd-h">${D.h}</div>
      ${D.lock?`<div class="bd-lock">All 21 members agree on this section.</div>`:`<div class="seg bd-vers">${ct.opts.map(([val,l])=>`<button class="segb ${c[D.key]===val?'on':''}" data-k="${D.key}" data-v="${val}">${esc(l)}</button>`).join('')}</div>`}
      <div class="bd-cols"><div class="bd-legal">${lines(v.legal)}</div><div class="bd-plain"><div class="bd-bhead">${byteBox({...S.byte,mood:'happy'})}<b>In plain words</b></div><p>${esc(v.plain)}</p></div></div></section>`}).join('')}
function bill_draft(){unlock('signed-commands');
  screen('bench',`${scene('workbench')}${hud('Drafting desk · H.R. 6120')}<div class="bench bill-desk">
    <div class="bd-strip" id="bdstrip">${bill_draftStrip()}</div>
    <article class="doc doc-bill bd-paper"><div class="doc-from">127th Congress · 2nd Session</div><h2>H.R. 6120</h2>
      <p class="bd-title">A BILL to require that home and work robots act only on signed commands, and for other purposes.</p>
      <p class="bd-enact"><i>Be it enacted by the Senate and House of Representatives of the United States of America in Congress assembled,</i></p>
      <div class="bd-h">SEC. 1. SHORT TITLE.</div><p class="bd-small">This Act may be cited as the “Robot Safety Act”.</p>
      <div class="bd-h">SEC. 2. DEFINITIONS.</div><p class="bd-small">(1) COVERED ROBOT.—The term “covered robot” means a machine that moves in the physical world and acts on its own in a home or workplace. (2) ROBOT CREW.—The term “robot crew” means two or more covered robots doing one job together.</p>
      <div id="bdsecs">${bill_draftSecs()}</div></article>
    ${companion()}<div class="bench-foot"><button class="btn" id="next">Set my criteria</button></div></div>`);
  wireCompanion();setTimeout(()=>byteSays('Here’s the bill, section by section. The legal words are on the left, and what they mean is on the right.','happy'),500);
  const wire=()=>$$('.bd-vers .segb').forEach(b=>b.onclick=()=>{S.choice={...S.choice,[b.dataset.k]:b.dataset.v};save();MUSIC.sfx('click');
    $('#bdsecs').innerHTML=bill_draftSecs();$('#bdstrip').innerHTML=bill_draftStrip();$$('.bd-m').forEach(m=>m.classList.add('bump'));wire()});
  wire();$('#next').onclick=()=>nextStep()}
