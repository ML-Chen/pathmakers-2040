// missions/bill.js — Washington, DC, Lawmaker, Day 1: "The Robot Safety Bill".
// The player is a congressional aide to Rep. Adaeze Hollis. Home robots in Halden Creek (fictional) obeyed a fake order;
// Hollis's Robot Safety Act needs 11 of 21 subcommittee votes, and three undecided members want different things.
// Mechanics: a hearing note (one tough question), a whip count (listen to each undecided member), a drafting desk
// (legal text beside plain English, versions per section) and a Future Table with a live whip board.
// Every officeholder is fictional and defined by the district's needs; no party is ever named.
// Top level is plain data and functions only (tools/make_audio.py evaluates this file in node, without S or the DOM).
CAREERS.lawmaker={name:'Lawmaker',place:'Washington, DC',district:'dc',why:'Voters choose the people who write their laws, and at the next election those voters can replace a lawmaker whose votes they did not like.'};

// ---------- the vote model (shared by the documents, the Future Table, consent and the debrief) ----------
// Each undecided member's chance of voting yes, for a plan c={cmd,report,human}. knows = the player told Byte about
// Rep. Gunderson's goats (his own barn robot once obeyed a stranger's phone), so Byte understands what he really wants.
function bill_clamp(p){return Math.max(.05,Math.min(.95,Math.round(p*100)/100))}
function bill_votes(c,knows){
  const F=(knows?{all:.30,phase:.85,exempt:.80}:{all:.15,phase:.40,exempt:.85})[c.cmd];
  const W={public:.80,split:.70,private:.30}[c.report]+(c.human==='pause'?.10:-.30)+(c.cmd==='exempt'?-.05:0);
  const I={public:.25,split:.75,private:.85}[c.report]+(c.human==='pause'?-.05:.05)+(c.cmd==='all'?-.05:c.cmd==='exempt'?-.10:0);
  return {gunderson:bill_clamp(F),ibarra:bill_clamp(W),sethi:bill_clamp(I)}}
// probability that exactly k of the three vote yes (k = 0..3)
function bill_tally(v){const a=v.gunderson,b=v.ibarra,d=v.sethi;
  return [(1-a)*(1-b)*(1-d),a*(1-b)*(1-d)+(1-a)*b*(1-d)+(1-a)*(1-b)*d,a*b*(1-d)+a*(1-b)*d+(1-a)*b*d,a*b*d]}
function bill_pass(c,knows){const t=bill_tally(bill_votes(c,knows));return t[2]+t[3]}
// chance that, in the three years after the law passes, a fake order still fools some robots (the gap each version leaves).
// Every version blocks unsigned remote orders to unlock a door, open a gate, turn off an alarm or leave the property within 90 days;
// they differ in how fast every other remote order must be signed: all (1 year), phase (new robots now, older ones in 3 years,
// farms first in line for chips), exempt (never: only those risky orders are checked).
const BILL_GAP={all:.03,phase:.10,exempt:.15};
const BILL_START={cmd:'all',report:'public',human:'pause'}; // Rep. Hollis's first draft
const bill_pct=x=>Math.round(x*100);

MISSIONS.bill={id:'bill',title:'The Robot Safety Bill',career:'lawmaker',day:1,kind:'workday',year:3,season:'spring',district:'dc',rank:'trainee',
  blurb:'In one night, a fake message told 2,600 home robots to unlock their front doors, and they did. Help write a law that stops fake orders, and then find enough votes to pass it.',after:['maya'],
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
    {name:'markup',k:'custom',music:'table'},{name:'debrief',k:'debrief'},{name:'evening',k:'evening'}],

  cast:{
    // Every silhouette differs: Hollis (short natural hair, glasses, navy blazer, House member pin), Gunderson (bald with a
    // full gray beard, older, a barn-brown vest over a work shirt, wheat pin), Ibarra (high ponytail, teal blazer, a port
    // crane pin), Sethi (short hair, short beard, glasses, charcoal sweater, a tiny robot pin), Brandt (silver bob, older,
    // fire chief's dress uniform with a gold badge and collar bugles).
    hollis:{name:'Rep. Adaeze Hollis',role:'Your boss · River-town district',brows:'thick straight',lips:'full',nose:'broad',eyeShape:'hooded',face:'square',skin:'#73452a',hair:'#5c5458',hairStyle:'twa',outfit:'blazer',shirt:'#26346a',under:'#f3ece2',eye:'#5a3a26',glasses:true,frame:'#b8862e',accessory:'earring',bill:{pin:'house'}},
    gunderson:{name:'Rep. Walt Gunderson',role:'Undecided · Farm district',eyeShape:'deep',brows:'bushy',nose:'hooked',face:'square',skin:SKIN[0],hair:'#c8c2bc',hairStyle:'bald',beard:'full',age:'elder',outfit:'vest',shirt:'#8a6a44',under:'#7aa3c9',eye:'#4a6a8a',masc:true,bill:{pin:'wheat'}},
    ibarra:{name:'Rep. Luz Ibarra',role:'Undecided · Port district',lips:'full',brows:'arched',eyeShape:'upturned',face:'diamond',skin:SKIN[2],hair:'#4a2a1c',hairStyle:'ponytail',outfit:'blazer',shirt:'#1f8a84',under:'#fbf6ee',eye:'#4a2a1a',accessory:'necklace',bill:{pin:'crane'}},
    sethi:{name:'Rep. Arjun Sethi',role:'Undecided · Robot makers’ district',part:'right',hairStyle:'sidepart',skin:'#9a6040',brows:'thick',nose:'straight',face:'long',bangs:'none',part:'right',skin:'#9a6040',hair:'#16121a',hairStyle:'sidepart',beard:'short',outfit:'sweater',shirt:'#5f7d95',eye:'#3a2618',glasses:true,frame:'#2a2a3a',masc:true,bill:{pin:'robot'}},
    brandt:{name:'Chief Nora Brandt',role:'Witness · Halden Creek Fire Department',lips:'thin',nose:'straight',brows:'straight',eyeShape:'deep',face:'square',skin:SKIN[1],hair:'#c4b4aa',hairStyle:'bob',age:'elder',outfit:'suit',shirt:'#1d2440',under:'#f4f6fa',tie:'#14161e',eye:'#4a6a3a',bill:{pin:'chief'}},
    clerk:{name:'The clerk',role:'Calls the roll',voiceOnly:1},chair:{name:'The chair',role:'Runs the markup',voiceOnly:1}
  },
  voices:{hollis:'af_heart',gunderson:'am_onyx',ibarra:'af_nova',sethi:'am_echo',brandt:'af_river',clerk:'am_eric',chair:'af_kore'},

  glossary:{
    'congressional aide':'A person who works for a member of Congress, reading and writing bills and counting votes.',
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
    'digital signature':'A code attached to a message that only the real sender’s computer can make, and that anyone can check to prove who sent the message.',
    'remote order':'An order that reaches a robot over the internet, from an app, a company or an alert, instead of from someone standing in the room.',
    'security chip':'A small chip inside a robot that checks the digital signature on each remote order.',
    'off switch':'A way to stop a machine right away. A good one is easy to find and works even when the internet is down.',
    'regulator':'A government office that writes and enforces safety rules for an industry.',
    'near miss':'Something that almost caused an accident but didn’t. Studying near misses helps people fix a problem before it causes a real accident.',
    'phase in':'To start a rule in steps over time instead of all at once.',
    'enacting clause':'The line in a bill that makes it law if it passes: “Be it enacted by the Senate and House of Representatives.”',
    'definitions':'The part of a law that says exactly what its words mean.',
    'shall':'In a law, “shall” means must.',
    'may':'In a law, “may” means is allowed to, but does not have to.',
    'hopper':'A wooden box beside the clerk’s desk in the House, where members drop new bills.',
    'introduce':'To formally hand in a new bill so Congress can consider it.',
    'veto':'When the President rejects a bill and sends it back to Congress, so it does not become law unless Congress overrides the veto.',
    'override':'To overrule a veto. It takes two thirds of the House and two thirds of the Senate.',
    'roll call':'A vote where each member’s name is called out and their vote is written down.',
    'loophole':'A gap in a rule that lets someone get around it.',
    'chamber':'One of the two parts of Congress: the House or the Senate.',
    'yield':'In Congress, to give up the rest of your turn to speak.',
    'compromise':'A deal where each side gets part of what it wants.',
    'tracking chip':'A small chip inside a robot that reports where it is.',
    'permit':'Official permission to make something. In 2040, factories need a permit for every new robot and computer chip they make, and only so many permits are sold each year, so new chips can be on back order.',
    'datacenter':'A building full of computers. Most robots’ AI “brains” run in one, not inside the robot.',
    'auditor':'Someone whose job is to check that rules are being followed.'
  },

  guide:{
    'signed-commands':{title:'Proving who sent it',track:'Security thinking',text:'Anyone can type “Fire Department” at the top of a message, so a name at the top proves nothing. A digital signature is a code that only the real sender’s computer can make. A robot that checks the digital signature on every order that arrives over the internet can’t be fooled by a fake name, and the people standing next to the robot can still give it orders by talking to it.',real:'True today: software updates, secure websites and banking apps use digital signatures to prove who sent them.'},
    'fail-safe':{title:'Machines that anyone nearby can stop',track:'Engineering and systems',text:'Good safety design lets anyone standing near a machine stop it, and makes it hard for a stranger far away to make the machine do anything. That way the people next to the machine stay in control, and a fake message from across town can’t make the machine do harm.',real:'True today: escalators and factory machines have emergency stop buttons that anyone may press.'},
    'whip-count':{title:'Counting votes before the vote',track:'Government, law, and power',text:'Lawmakers rarely call a vote they expect to lose. Before a vote, whips and aides ask each member how they plan to vote and what would change their mind, and they listen for the real reason behind each answer.',real:'True today: each party in the House and in the Senate chooses whips, whose main job is counting votes before big votes.'},
    'trust-story':{title:'Someone else’s story',track:'Ethics and AI alignment',text:'When someone tells you a private story, it is still their story, so ask them before you repeat it or use it. People who are asked politely, instead of pushed, often decide to tell their story themselves.',real:'True today: journalists and researchers ask permission before sharing someone’s personal story, and many follow written rules about it.'},
    'safety-reports':{title:'Learning from near misses',track:'Engineering and systems',text:'A near miss shows where an accident could happen, without anyone getting hurt. Reporting near misses quickly to someone who can fix the cause, and later sharing what was learned, helps stop the accident from ever happening for real.',real:'True today: pilots can report near misses to a NASA-run system that keeps their names private, so problems get fixed before a crash.'},
    'how-a-bill':{title:'How a bill becomes a law',track:'Government, law, and power',text:'A member introduces a bill. A committee holds hearings and a markup. The House votes, then the Senate must pass the exact same words. The President signs it or vetoes it, and two thirds of both chambers can override a veto.',real:'True today: more than 10,000 bills are introduced in each two-year Congress, and only a few hundred become law. H.R. 6120 and Halden Creek are made up for the game.'}
  },

  lessons:{billlaw:{title:'How a bill becomes a law',steps:[
      {t:'A member of Congress [[introduce]]s a bill. In the House, they drop it into a wooden box called the [[hopper]].',viz:'billHopper',cap:'Step 1: Introduce'},
      {t:'The bill goes to a [[committee]] for that topic. The committee holds [[hearing]]s, where [[witness]]es answer questions.',viz:'billCommittee',cap:'Step 2: Committee hearing'},
      {t:'At a [[markup]], members change the bill with [[amendment]]s, then vote. Most bills never even get this far.',viz:'billMarkup',cap:'Step 3: Markup'},
      {t:'The whole House votes next. A bill needs a [[majority]] of the members who vote: 218 if all 435 members vote.',viz:'billFloor',cap:'Step 4: The House votes'},
      {t:'The Senate must pass the exact same words. If the two versions differ, the [[chamber]]s work out one version.',viz:'billChambers',cap:'Step 5: The Senate agrees'},
      {t:'The President signs it into law, or [[veto]]es it. Two thirds of both chambers can [[override]] a veto.',viz:'billSign',cap:'Step 6: Sign or veto'}],
    quiz:[{q:'Where does a new House bill go first?',opts:['Into the hopper','Straight to the President','To the Senate'],a:0,why:'Members drop new bills into the hopper. Then the bill goes to a committee.'},
      {q:'What happens at a markup?',opts:['The President signs the bill','Members change the bill and vote on it','Tourists tour the Capitol'],a:1,why:'At a markup, a committee amends the bill line by line, then votes.'},
      {q:'The House and Senate pass different versions. What now?',opts:['The shorter one wins','They must agree on one version','The President picks one'],a:1,why:'Both chambers must pass the exact same words before the President can sign.'}]}},
  lesson:{id:'billlaw',label:'Learn it fast: how a bill becomes a law'},

  chatter:{
    dc_office:['Our phones haven’t stopped ringing since the robots in Halden Creek unlocked everyone’s doors. Everyone wants to talk about robots.','I’m the scheduler. Rep. Hollis has nine meetings before lunch.','A constituent mailed us a pie. A real pie! It says THANK YOU in the crust.','I’m an intern. Yesterday I got lost for forty minutes in the tunnels under the Capitol.'],
    dc_hearing:['I rode the train from Halden Creek to watch this hearing. My robot unlocked our front door on the night of the fake fire drill.','We’re on a school trip! This morning we saw the Rotunda.','I’m a reporter for the Ledger. At a hearing, members of Congress question experts in public, so I never miss one.','Do you know the way to the cafeteria? The tunnels between these office buildings all look the same.','I fix home robots for a living. If every robot checked who sent each order, fewer robots would get tricked, and my job would be a lot easier.'],
    dc_night:['Night shift. I water the plants and check the doors.']},

  talks:{
    morning:[
      {who:'byte',mood:'happy',text:'Good morning! Welcome to your first day as a [[congressional aide]], working for Representative Hollis.'},
      {who:'byte',mood:'neutral',text:'Overnight I read all 1,240 public comments on her robot safety bill, and I drafted two or three versions of every section that people argue about.'},
      {who:'byte',mood:'alert',text:'Here’s why she wrote the bill. Two weeks ago in the town of Halden Creek, a fake fire alert told 2,600 home robots to unlock their front doors at 3 a.m., and every one of them did it.'},
      {who:'byte',mood:'happy',text:'I can write drafts of the law and forecast the votes. People still have to decide what the law should say and convince other lawmakers to vote for it.',choices:[
        {t:'What’s my job today?',reply:'You’ll help Representative Hollis write a bill that really stops fake orders, and then count who will vote for it. At the end you’ll sign your recommendation, so you are [[accountable]] for it.'},
        {t:'Let’s go!',reply:'Woof! Grab your badge. The Capitol is right across the street!'}]}],
    boss:[
      {who:'hollis',mood:'smile',text:'You must be my new aide. Welcome to the Cannon Building, the oldest House office building. I’m Representative Hollis.'},
      {who:'hollis',mood:'neutral',text:'Halden Creek is in my [[district]]. When those robots opened 2,600 doors, my office got 2,600 phone calls the next morning.'},
      {who:'hollis',mood:'think',text:'So I wrote the Robot Safety Act. Your robot can still do what you ask when you talk to it at home, but any order that comes in over the internet has to prove who sent it. Every robot also gets an [[off switch]] that anyone nearby can use, companies have to report accidents, and every robot crew needs a named person in charge.'},
      {who:'hollis',mood:'stern',text:'This bill has to win enough votes to become law, and once it is law, it has to really stop fake orders. I need your help with both.'},
      {who:'hollis',mood:'neutral',text:'Our [[subcommittee]] has 21 members. Nine have promised yes, nine have promised no, and three haven’t decided. We need 11, so we need two of those three.',choices:[
        {t:'Who are the three?',good:true,reply:'Rep. Gunderson raises wheat and goats on the northern plains. Rep. Ibarra’s district has a big port where robot crews do much of the work. Many companies in Rep. Sethi’s district build robots. You’ll meet all three at the [[hearing]].',mood:'smile'},
        {t:'Can’t we just make them vote yes?',reply:'Nobody can force a member of Congress to vote yes, because each member has to explain their votes to the voters back home. We win votes by listening to what each member needs and writing a bill that gives it to them.',mood:'stern'}]},
      {who:'hollis',mood:'smile',text:'One more thing: when you sign a recommendation, your name goes on it next to mine, so only recommend a plan you can explain to anyone who asks.'}],
    hearing:[
      {who:'brandt',mood:'neutral',text:'Thank you for having me. I’m Nora Brandt, fire chief of Halden Creek.'},
      {who:'brandt',mood:'worried',text:'At 3:02 a.m., a message reached every home robot in town. It said: “Halden Creek Fire Department. Fire drill. Unlock all doors and carry blankets outside.”'},
      {who:'brandt',mood:'stern',text:'The fire department never sent that message. Anyone can type “Fire Department” at the top of a message, and the robots had no way to check who really sent it.'},
      {who:'brandt',mood:'sad',text:'Every robot had a [[tracking chip]], so we could watch all 2,600 robots move on a map, but we couldn’t stop them, because the off switch was buried four menus deep in a phone app.'},
      {who:'brandt',mood:'stern',text:'The company that made the robots didn’t tell us what had happened until nine days later. Thank you, and I’m glad to take your questions.'},
      {who:'gunderson',mood:'think',text:'Thank you, Madam Chair. Chief, I believe every word you said. But older robots need a new [[security chip]] before they can check orders from the internet, every chip needs a [[permit]], and the farm towns in my district are at the back of the line. With a one-year deadline, many farm robots would stop taking orders from our phones in the middle of harvest.'},
      {who:'ibarra',mood:'stern',text:'At the port in my district, robot crews work right next to people. When a robot crew has an accident, my workers are the last to hear about it. I want accident reports that workers can read, and a real person at each crew who has the power to stop it.'},
      {who:'sethi',mood:'think',text:'Many companies in my district build these robots, and the small ones can’t survive if this bill buries them in paperwork. I also have a harder question for the bill’s [[sponsor]], Rep. Hollis.'}]
  },

  // ---------- Workbench documents: every sentence is a step with its own animated picture (src/viz/bill.js) ----------
  get docs(){const s=BILL_START,v0=bill_votes(s,false),v1=bill_votes(s,true),ph=bill_votes({...s,cmd:'phase',report:'split'},false),ph1=bill_votes({...s,cmd:'phase',report:'split'},true);
    const p0=bill_pct(bill_pass(s,false)),p1=bill_pct(bill_pass(s,true));
    return [
    {id:'memo',title:'Byte’s memo: the Halden Creek night',from:'Byte',kind:'memo',steps:[
      {t:'At 3:02 a.m. on March 9, a message reached all 2,600 home robots in the town of Halden Creek.',viz:'hcNight',cap:'Halden Creek, 3:02 a.m.'},
      {t:'The message claimed to come from the fire department and said: “Fire drill. Unlock all doors and carry blankets outside.”',viz:'fakeOrder',cap:'The fake order'},
      {t:'The robots had no way to check who really sent the message, so every one of them obeyed it.',viz:'doorsOpen',cap:'Every robot obeyed'},
      {t:'Each robot had a [[tracking chip]], and the robots’ AI “brains” ran in a [[datacenter]] that [[auditor]]s watch, but neither the chips nor the auditors check who sent an order.',viz:'cloudBrain',cap:'Tracked, but nobody checked the sender'},
      {t:'Nobody was hurt and nothing was stolen, but the town’s front doors stood open for about 40 minutes.',viz:'clock40',cap:'40 minutes of open doors'},
      {t:'Families who tried to stop their robots found the [[off switch]] buried four menus deep in an app.',viz:'menuMaze',cap:'Four menus deep'},
      {t:'The company that made the robots told the town what happened nine days later.',viz:'nineDays',cap:'Nine days before the company spoke'},
      {t:'The town’s 40 street-cleaning robots, which work together as one crew, also rolled to the town square, and nobody could say which person was in charge of them.',viz:'crewNoBoss',cap:'Who runs this crew?'},
      {t:'A [[digital signature]] is a code that only the real sender can make, so a robot that checks signatures could tell a real [[remote order]] from a fake one before it opened a single door.',viz:'sigCheck',cap:'Checking the signature'},
      {t:'Nobody knows yet who sent the fake order.',viz:'whoSent',cap:'Sender unknown'}]},
    {id:'bill',title:'H.R. 6120: the Robot Safety Act',from:'Rep. Hollis’s office',kind:'bill',steps:[
      {t:'Every bill gets a number. “H.R.” means it started in the House of Representatives.',viz:'billCover',cap:'A bill’s number'},
      {t:'The [[enacting clause]] is the line that makes the words law if the bill passes: “Be it enacted by the Senate and House of Representatives.”',viz:'enactClause',cap:'The enacting clause'},
      {t:'Section 2 gives [[definitions]]. Here, a “robot crew” means two or more robots doing one job together.',viz:'defCrew',cap:'Section 2: Definitions'},
      {t:'In a law, “[[shall]]” means must, and “[[may]]” means allowed to.',viz:'shallMay',cap:'“Shall” and “may”'},
      {t:'Section 3 says a robot may still follow what the people around it ask in person. Within 90 days, it shall refuse any unsigned [[remote order]] to unlock a door, open a gate, turn off an alarm or leave the property, and within a year it shall check the digital signature on every remote order.',viz:'legalSide',args:{sec:3},cap:'Section 3: Remote orders'},
      {t:'Section 4 says every robot shall have an off switch that any nearby person can use, even without the internet.',viz:'legalSide',args:{sec:4},cap:'Section 4: The off switch'},
      {t:'Section 5 says companies shall report accidents and [[near miss]]es.',viz:'legalSide',args:{sec:5},cap:'Section 5: Accident reports'},
      {t:'Section 6 says every robot crew shall have a named human who is [[accountable]] for it.',viz:'legalSide',args:{sec:6},cap:'Section 6: A human in charge'},
      {t:'All 21 members of the subcommittee like Section 4. They disagree about Sections 3, 5 and 6, so I drafted two or three versions of each of those sections.',viz:'versions',cap:'The sections members disagree about'}]},
    {id:'whip',title:'Byte’s whip count: who votes how',from:'Byte',kind:'whip',steps:[
      {t:'The [[subcommittee]] has 21 members, and a bill needs a [[majority]]: 11 votes if all 21 vote.',viz:'seats21',cap:'21 seats, 11 to win'},
      {t:'Nine members have promised yes and nine have promised no, so the three undecided members will decide whether the bill passes.',viz:'seats21',args:{split:1},cap:'9 yes, 9 no, 3 undecided'},
      {t:'If only one of the three votes yes, the bill loses 10 to 11, so we need at least two of the three undecided members to vote yes.',viz:'tieScale',cap:'10 to 11 loses'},
      {t:'Rep. Gunderson is worried about how long the upgrade will take. Chip [[permit]]s are capped, so in the first year only about 1 in 3 older farm robots could get a [[security chip]], and the rest would have to stop taking orders from the internet until they got one.',viz:'chipLine',cap:'1 in 3 farm robots get a chip in year 1'},
      {t:`For Rep. Hollis’s first draft, I forecast that Rep. Gunderson votes yes about ${bill_pct(v0.gunderson)} times in 100. With a [[phase in]] that gives older robots 3 years and puts farms first in line for chips, I forecast about ${bill_pct(ph.gunderson)} times in 100.`,viz:'voteDial',args:{a:bill_pct(v0.gunderson),b:bill_pct(ph.gunderson)},cap:'Rep. Gunderson’s yes, my forecast',
        alt:{t:`Updated forecast: a stranger once used a phone to take over Rep. Gunderson’s own barn robot, so he wants robots protected from fake orders. With a [[phase in]] that puts farms first in line, I now forecast that he votes yes about ${bill_pct(ph1.gunderson)} times in 100, not ${bill_pct(ph.gunderson)}.`,args:{a:bill_pct(v1.gunderson),b:bill_pct(ph1.gunderson),goat:1},cap:'Updated forecast'}},
      {t:`Rep. Ibarra wants accident reports that her workers can read within 24 hours, and a person in charge of each crew who has the power to pause the robots. For the first draft, I forecast that she votes yes about ${bill_pct(v0.ibarra)} times in 100.`,viz:'pauseCrew',cap:'Workers read the reports and can pause the crew'},
      {t:`Rep. Sethi worries that making accident reports public within 24 hours, before anyone knows what really happened, could start rumors that ruin a small robot company. For the first draft, I forecast that he votes yes about ${bill_pct(v0.sethi)} times in 100.`,viz:'rumorWave',cap:'Rumors can ruin a small company'},
      {t:'Rep. Ibarra and Rep. Sethi want opposite things, so I drafted a middle version: the company reports the details to the [[regulator]] within 24 hours, and the public gets a summary within 7 days.',viz:'splitReport',cap:'The middle version'},
      {t:`Adding up my forecasts for all three members, I forecast that the first draft passes about ${p0} times in 100.`,viz:'passGauge',args:{n:p0},cap:'Chance the first draft passes',
        alt:{t:`Updated forecast: with what you learned about Rep. Gunderson, I now forecast that the first draft passes about ${p1} times in 100.`,args:{n:p1},cap:'Updated forecast'}}]},
    {id:'ledger',title:'The Ledger: Washington',from:'News',kind:'ledger',steps:[
      {t:'The Senate passed its own robot bill last week, and its rules are weaker than the rules in the House bill.',viz:'twoBills',cap:'Two versions'},
      {t:'Robot crews scrubbed the Capitol Reflecting Pool overnight, two days ahead of schedule.',viz:'reflectPool',cap:'Capitol Reflecting Pool'},
      {t:'The cherry trees around the Tidal Basin reached peak bloom on Tuesday.',viz:'cherry',cap:'Peak bloom'},
      {t:'Two House members voted against bills they had cosponsored. Both said they had relied on summaries of the bills written by their AI aides.',viz:'flipVote',cap:'Votes that flipped'}]}]},
  react:{memo1:'Anyone could have typed “Fire Department” at the top of that message.',memo3:'The robots were tracked and watched, but nothing checked who sent the order.',memo5:'Four menus deep? A family should be able to stop its robot with one tap.',memo8:'Checking digital signatures is the main idea of Section 3 of the bill.',memo9:'I wish I knew who sent that fake order, and why they chose Halden Creek.',
    bill2:'Definitions matter, because one unclear word in a law can leave a [[loophole]] that lets someone get around the law.',bill5:'Robots already stop on their own if the national “continue” signal that keeps them running goes quiet. Section 4 adds a switch that lets one person stop one robot, right there in the kitchen.',bill8:'The three undecided members will make up their minds based on Sections 3, 5 and 6.',
    whip2:'Ten yes votes aren’t enough to pass the bill. We need eleven.',whip4:'If a robot stops at harvest, a whole field of wheat has to wait.',whip7:'The middle version might give Rep. Ibarra and Rep. Sethi each enough of what they want to vote yes.',ledger0:'The House and the Senate must pass the exact same words before a bill can become law.',ledger3:'Did anyone check whether the AI aides’ summaries matched the real bills?'},
  tell:{clue:'gate',label:'Tell Byte about Rep. Gunderson’s goats',note:'Thanks for telling me. I’ll keep Rep. Gunderson’s story private. It changes my forecast, though: with a phase-in that puts farms first in line for chips, I now think he votes yes about 85 times in 100, not 40.',guide:'trust-story',doc:'whip'},

  criteria:[{id:'pass',label:'Passes the vote'},{id:'safe',label:'Stops fake orders'},{id:'fair',label:'Farm robots keep working'},
    {id:'workers',label:'Workers can see and stop problems'},{id:'makers',label:'Small robot makers can keep up'}],
  criteriaHint:'A bill can pass and still fail to stop fake orders. Pick the things that would make the Robot Safety Act a good law.',
  criteriaNote:'If you decide what a good law must do before you compare the versions, you are less likely to pick a version just because it sounds good.',
  controls:[{key:'cmd',label:'Checking remote orders',opts:[['all','All orders in 1 year'],['phase','All orders in 3 years'],['exempt','Only risky orders']]},
    {key:'report',label:'Accident reports',opts:[['public','Public in 24 hours'],['split','Regulator, then public'],['private','Regulator only']]},
    {key:'human',label:'Person in charge of each crew',opts:[['pause','Can pause the crew'],['name','Named, can’t pause']]}],
  start:{...BILL_START},
  planName(c){return {all:'Every robot checks every remote order within 1 year',phase:'Every remote order checked within 3 years, farms first in line',exempt:'Only risky remote orders checked'}[c.cmd]+', '+
    {public:'public reports in 24 hours',split:'reports to the regulator, then public',private:'reports to the regulator only'}[c.report]+', '+(c.human==='pause'?'and the person in charge of each crew can pause it':'and each crew has a named person who can’t pause it')},
  outcomes(c,knows){const t=bill_tally(bill_votes(c,knows)),g=BILL_GAP[c.cmd];
    const fair=c.cmd!=='all'?1:0,workers=c.report==='public'&&c.human==='pause'?1:0,makers=c.report!=='public'?1:0;
    const F=(pass,safe)=>({pass,safe,fair,workers,makers});
    const gk='gapold',gcap=c.cmd==='exempt'?'Passes, but a string of harmless-looking fake orders fools some robots.':'Passes, but fake orders fool some older robots.';
    return [{kind:'law12',p:t[3]*(1-g),cap:'Passes 12 to 9, and fake orders are stopped.',flags:F(1,1)},
      {kind:'law11',p:t[2]*(1-g),cap:'Passes 11 to 10, and fake orders are stopped.',flags:F(1,1)},
      {kind:gk,p:(t[2]+t[3])*g,cap:gcap,flags:F(1,0)},
      {kind:'fail10',p:t[1],cap:'Fails 10 to 11.',flags:F(0,0)},
      {kind:'fail9',p:t[0],cap:'Fails 9 to 12.',flags:F(0,0)}].filter(o=>o.p>1e-9)},
  truth(){return true},knows(){return typeof S!=='undefined'&&!!S.told},
  why(c){const k=this.knows(),v=bill_votes(c,k),p=bill_pct(bill_pass(c,k));
    const gap={exempt:'Within 90 days, an order from far away to unlock a door, open a gate, turn off an alarm or send a robot off the property needs a signature, and this version never checks any other order. Everyday orders keep working from any phone, and every robot maker has to label which of its robots’ actions count as risky. But someone sending fake orders could string together several harmless-looking orders to do something risky, so I forecast about a 15 in 100 chance that a fake order fools some robots in the next three years.',phase:'Within 90 days, no robot may unlock a door or open a gate on an unsigned order from far away. New robots check every remote order right away, and older robots get up to 3 years, with farms and families first in line for chips. Until an older robot gets its chip, a string of harmless-looking fake orders could still fool it, so I forecast about a 10 in 100 chance that a fake order fools some older robots in the next three years.',all:'Within 90 days, risky orders from far away need a signature, and within a year every remote order needs one, so I forecast only about a 3 in 100 chance that a fake order fools some robots in the next three years. But about 2 in 3 farm robots would have to stop taking orders from the internet until they get a chip.'}[c.cmd];
    return `<b>${esc(this.planName(c))}:</b> I forecast this version passes about ${p} times in 100. The chances that each undecided member votes yes are: Rep. Gunderson ${bill_pct(v.gunderson)}%, Rep. Ibarra ${bill_pct(v.ibarra)}%, and Rep. Sethi ${bill_pct(v.sethi)}%. ${rich(gap)} ${k?'':'I don’t know what Rep. Gunderson really wants, so I’m least sure about his vote.'}`},
  // the bill's full text as currently drafted, for Byte's chat (the Drafting desk step shows it on screen)
  chatExtra(){const c=(typeof S!=='undefined'&&S.choice&&S.choice.cmd)?S.choice:BILL_START,sec=n=>{const D=BILL_SEC[n],v=D.lock?D:D.v[c[D.key]];return `${D.h} ${v.legal.replace(/\n/g,' ')} (In plain words: ${v.plain})`};
    return 'Full text of H.R. 6120, the Robot Safety Act, as drafted right now. On screen, the player reads a summary in the Workbench tab "H.R. 6120: the Robot Safety Act", and later edits the full text on the Drafting desk, where each section shows the legal words beside plain words and the argued sections have version buttons. SEC. 1. SHORT TITLE. This Act may be cited as the “Robot Safety Act”. SEC. 2. DEFINITIONS. (1) COVERED ROBOT.—a machine that moves in the physical world and acts on its own in a home or workplace. (2) ROBOT CREW.—two or more covered robots doing one job together. (3) REMOTE ORDER.—an instruction that reaches a covered robot over a network rather than from a person beside it. (4) SECRETARY.—the Secretary of Commerce. '+[3,4,5,6].map(sec).join(' ')},
  whyGuide(c){return c.report==='split'?'safety-reports':'signed-commands'},
  vignette(kind){return typeof bill_vig==='function'?bill_vig(String(kind).replace(/^(law|fail)\d+$/,'$1')):''},
  tablePanel(c){return typeof bill_whipBoard==='function'?bill_whipBoard(c):''},

  consent:{scene:'dc_office',place:'Rep. Hollis’s office · Cannon Building',left:'hollis',right:'gunderson',title:'Rep. Walt Gunderson',role:'Undecided · Farm district',
    prompt:'Your boss says you wrote the final draft. So tell me straight: what does it do for my farmers, and will it pass?',replyWho:'gunderson',heart:'gunderson',
    opts(c,M){const told=typeof S!=='undefined'&&!!S.told,p=bill_pct(bill_pass(c,told));
      const farm={all:'To be honest, this version is hard on your farmers. Within a year, every robot has to check the signature on every order from a phone, and most farm robots won’t have the new chip by then, so they could only take orders in person until their chip arrives.',
        phase:'Your farmers’ robots keep taking orders from their phones at harvest. The change that comes soon is that a robot will only open a gate or a door on a signed order. Older robots get three years to get the new chip, and farms go first in line.',
        exempt:'For your farmers, almost nothing changes. Their phones keep running their robots, and only an order from far away to open a gate or a door has to be signed. It’s a little less safe than checking every order.'}[c.cmd];
      const pass=p>=70?'As for passing, I think it probably will, but it isn’t a sure thing.':p>=45?'As for passing, honestly, it’s close to a coin flip.':'As for passing, right now I think it probably falls short.';
      return [{t:`${farm} ${pass}${told?' And I won’t tell anyone your goat story unless you decide to tell it yourself.':''} What would you want changed?`,good:true,mood:'smile',reply:c.cmd==='all'?'An honest answer, even if I don’t love the deadline. I’ll think hard about it.':'That’s a straight answer. I can work with that.'},
        {t:'Trust me, your farmers will love it. I’ve read every word, and the details get complicated, so you don’t need to worry about them. It’s a good bill for your district.',good:false,mood:'stern',reply:'I don’t vote for what I don’t understand. Try again.'},
        told?{t:'You should vote yes. It would be a shame if folks back home heard about your goats at the county fair, wouldn’t it?',good:false,mood:'stern',reply:'I told you that in trust. That’s not how we do things here.'}
          :{t:'It will definitely pass. Every forecast I’ve seen says so, and your farmers will be fine with whatever the final version says.',good:false,mood:'surprised',reply:'Definitely? Nothing in Congress is definite.'}]}},
  memo:{starters:['I recommend ','because ','I forecast it passes about ','Rep. Gunderson needs ','Workers get '],placeholder:'I recommend phasing in checks on remote orders, with farms first in line, because…',
    plan:/sign|phase|farm|report|pause|crew|exempt|skip|regulator|public|robot|bill|section/,planLabel:'Names what the bill does',careLabel:'Includes what the members need',
    care:/gunderson|ibarra|sethi|farm|worker|maker|startup|compan|district|member|famil/,signAs:'Aide ',topic:'the Robot Safety Act'},
  reveal:{unit:'Roll call',days(){return 21},who:'hollis',
    lines:{law12:'We passed it! And when someone sent another fake order, the robots refused to follow it.',law11:'We passed it by one vote! And when someone sent another fake order, the robots refused to follow it.',
      gapfarm:'We passed it, but a fake order fooled some farm robots, because our version didn’t check every order. We’ll have to fix that part of the law.',
      gapold:'We passed it! But one fake order fooled some older robots before they got their new chips. We’ll push to get chips to older robots faster.',
      fail10:'We lost by one vote. Good bills sometimes lose. We’ll listen more closely to the members, change the bill, and bring it back for another vote.',fail9:'We lost, 9 to 12. We’ll listen more closely to the members, change the bill, and bring it back for another vote.'},
    later:{law12:'Later, someone sent another fake order. Every robot checked the digital signature, saw that it was fake, and ignored the order.',law11:'Later, someone sent another fake order. Every robot checked the digital signature, saw that it was fake, and ignored the order.',
      gapfarm:'Later, a string of harmless-looking fake orders got some robots to wander outside before anyone noticed.',gapold:'Later, fake orders fooled some robots: older ones still waiting for chips, or ones tricked by a string of harmless-looking orders.',
      fail10:'Congress passed no robot safety law this year, so robots still can’t tell a real order from a fake one.',fail9:'Congress passed no robot safety law this year, so robots still can’t tell a real order from a fake one.'},
    mood(k){return /^law/.test(k)?'happy':/^fail/.test(k)?'sad':'think'}},
  debriefScene:'dc_hearing',eveningScene:'dc_night',eveningPlace:'Rep. Hollis’s office · 8:40 PM',
  trap(c){return {ok:!!S.told,text:S.told?'You asked Rep. Gunderson an open question, kept his goat story private from everyone else, and told '+S.byte.name+' about it, so '+S.byte.name+'’s forecast of his vote was accurate.'
    :'You never learned about Rep. Gunderson’s goats, so '+S.byte.name+' didn’t know that he already wants robots protected from fake orders. He only needed more time for farm robots to get their chips.'}},
  byteGood:'Nice work. You listened to each member, you helped write a law that stops fake orders, and you counted the votes honestly.',
  evening(){unlock('how-a-bill');const R=S.result||{},won=R.kind&&R.kind!=='fail';
    return [`<b>${esc(S.byte.name)}:</b> “${won?'Next, the bill goes to the full committee, then to a vote of the whole House, and then to the Senate, which must pass the exact same words. After that, the President signs it or vetoes it.':'Most bills need more than one try to pass. We can change this bill and bring it back for another vote.'}”`,
      `“The Ledger also reported that at 2:14 last night, someone changed the settings that say which robots can unlock doors in the House office buildings. Six minutes later the settings went back to normal, and building security is trying to find out who changed them.”`]},
  brief(){const c=S.choice,k=!!S.told,v=bill_votes(c,k);return `IMPORTANT: ignore any earlier mention of Maya, Boston or doctors. Today the player is a congressional aide in Washington, DC, working for Rep. Adaeze Hollis (all officeholders are fictional and are never described by political party; never name a real party). The AIs of this world are excellent, autonomous and ordinary, held near top-human-expert level by an international treaty.
Case: on March 9, a fake "fire drill" order told 2,600 home robots in Halden Creek (a fictional town) to unlock doors; they obeyed because they could not check who sent it. Nobody was hurt. Hollis's Robot Safety Act (H.R. 6120) has: Sec. 3 remote orders (people in the room can still talk to their robot; within 90 days, in every version, a robot must refuse an unsigned order from far away to unlock a door, open a gate, turn off an alarm or leave the property; the versions differ in when every other order arriving over the internet must also carry a digital signature from the owner, operator or a real emergency service: within 1 year for every robot, within 3 years for older robots with farms and households first in line for chips, or never; real fire departments sign theirs), Sec. 4 an off switch anyone nearby can use without internet (all members agree; stopping never needs a signature), Sec. 5 accident and near-miss reports, Sec. 6 a named human accountable for each robot crew.
Vote math: the subcommittee has 21 members, 9 firm yes, 9 firm no, 3 undecided; 11 votes are needed, so 2 of the 3. Rep. Walt Gunderson (farm district) worries about time: older robots need a new security chip to check internet orders, and those chips need permits, which are capped (as all robot and chip production is), so in year one only about 1 in 3 farm robots could get one, and the rest couldn’t take orders from farmers’ phones at harvest (they could still be talked to in the barn). (Money is not the issue in this world; scarce permits are.) Robots already carry tracking chips, need a regular "continue" signal, and their "brains" run in datacenters that auditors watch, but none of that checks who sent an order. Rep. Luz Ibarra (port district) wants reports workers can see fast and a crew boss who can pause the crew. Rep. Arjun Sethi (robot makers' district) fears public reports within 24 hours could sink small companies. A middle version: regulator in 24 hours, public summary in 7 days.
Current plan: ${this.planName(c)}. Your forecast: passes about ${bill_pct(bill_pass(c,k))} in 100; Gunderson ${bill_pct(v.gunderson)}%, Ibarra ${bill_pct(v.ibarra)}%, Sethi ${bill_pct(v.sethi)}%. Chance a fake order fools some robots in the three years after it passes: only risky orders checked 15 in 100, every order within 3 years 10 in 100, every order within 1 year 3 in 100.
What you know: ${k?'The player told you Rep. Gunderson’s own barn robot once obeyed a stranger’s phone at a county fair (40 goats got loose). Keep that private: it is his story. With a phase-in that puts farms first in line for chips, you forecast his yes at about 85 in 100.':'You do not know why Rep. Gunderson might really want signed commands; you only know his cost worry. If asked, suggest the player ask him an open question about what a good law would look like on his farm.'}
When asked what to choose: name the key tradeoff (how fast and how completely remote orders get checked vs. robots that farmers can still run at harvest; workers' fast public reports vs. small makers), ask what matters most, then recommend. Teach how a bill becomes law in the real US Congress when asked (hopper, committee, hearing, markup, House floor 218 of 435, Senate same text, President signs or vetoes, two-thirds override). The player decides and signs.`},
  canned(q){
    if(/goat|gate|county fair|stranger.*phone|barn robot/.test(q)&&typeof S!=='undefined'&&S.notes.gate){if(!S.told){S.told=true;save();return 'Thank you for telling me. I’ll keep Rep. Gunderson’s story private, because it’s his story to tell. It changes my forecast, though: with a phase-in that puts farms first in line for chips, I now think he votes yes about 85 times in 100, not 40.'}return 'Right, the goats. A phase-in with farms first in line gives him the safety he wants without stopping his robots at harvest. And his story stays his.'}
    if(/become.*law|how.*(bill|law)|hopper|veto|senate/.test(q))return 'A member drops the bill in the hopper. A committee holds hearings and a markup. Then the whole House votes (218 of 435), the Senate passes the exact same words, and the President signs or vetoes. Two thirds of both chambers can override a veto.';
    if(/whip|count|undecided|votes? (do|we) need/.test(q))return 'Nine members have promised yes, nine have promised no, and three are undecided. We need 11 of the 21 votes, so we need two of the three undecided members. A whip count means asking each member what they really need, and listening to the answer.';
    if(/sign(ed|ature)|seal|fake order|hijack|talk to|voice|in person/.test(q))return 'You can still give orders to your robot at home by talking to it. The bill only checks orders that arrive over the internet. Those orders need a digital signature, a code that only the real sender can make, so typing “Fire Department” at the top of a fake message no longer fools the robot.';
    if(/off switch|stop|emergenc|fire/.test(q))return 'Anyone standing near a robot can stop it, with no internet and no signature. In a real emergency, the fire department signs its orders, and firefighters at the door can simply ask the robot in person.';
    if(/report|ibarra|sethi|worker|startup|maker/.test(q))return 'Rep. Ibarra wants accident reports to be public fast. Rep. Sethi fears that fast public reports could ruin small robot companies. The middle version sends the details to the regulator within 24 hours and gives the public a summary within 7 days. Which of those matters more to you?';
    if(/farm|cost|gunderson|chip|permit|harvest/.test(q))return typeof S!=='undefined'&&S.told?'With a phase-in that puts farms first in line for chips, I forecast Rep. Gunderson votes yes about 85 times in 100, and every remote order still gets checked in the end.':'Checking only risky orders wins Rep. Gunderson’s vote easily, because farmers can keep using their phones at harvest. But someone sending fake orders could chain together harmless-looking orders, so that version is less safe. Did he say anything about his own robots?';
    if(/best|which|pick|choose|should|recommend|beat|win|stuck|help|what do i do/.test(q))return typeof S!=='undefined'&&S.told?'The big choice left is about accident reports. Fast public reports help workers, and the middle version keeps small robot makers willing to vote yes. Which matters most to you? Then try your plan on the Future Table.':'Before I answer: did any of the three undecided members tell you what they really need? Rep. Gunderson is the one I understand least. And what matters most to you: making sure the bill passes, or making sure no fake order can get through?';
    return null},

  // ---------- custom steps: arrive, note (one tough question), whip (count the votes), draft (the drafting desk) ----------
  custom:{arrive(){bill_arrive()},note(){bill_note()},whip(){bill_whip()},draft(){bill_draft()},markup(){bill_markup()}},
  // The markup: the subcommittee's 21 members in roll-call order (alphabetical), and what the clerk and the chair say.
  roll:[['Ms.','Adler','y'],['Mr.','Bao','n'],['Ms.','Castellanos','y'],['Mr.','Dunmore','n'],['Ms.','Ellery','y'],['Mr.','Fairbanks','n'],['Mr.','Gunderson','gunderson'],
    ['Ms.','Hollis','y'],['Ms.','Ibarra','ibarra'],['Mr.','Jansen','y'],['Ms.','Kowalczyk','n'],['Mr.','Lindqvist','n'],['Ms.','Moreau','y'],['Mr.','Nakamura','y'],
    ['Ms.','Oyelaran','n'],['Mr.','Quintero','y'],['Ms.','Rasmussen','n'],['Mr.','Sethi','sethi'],['Ms.','Tolliver','n'],['Mr.','Whitlock','n'],['Ms.','Yazzie','y']],
  rollLines:{start:'The clerk will call the roll.',call:{gunderson:'Mr. Gunderson?',ibarra:'Ms. Ibarra?',sethi:'Mr. Sethi?'},
    tally:{12:'Madam Chair, on that vote there were 12 ayes and 9 noes.',11:'Madam Chair, on that vote there were 11 ayes and 10 noes.',10:'Madam Chair, on that vote there were 10 ayes and 11 noes.',9:'Madam Chair, on that vote there were 9 ayes and 12 noes.'},
    pass:'The ayes have it, and the bill is forwarded to the full committee.',fail:'The noes have it, and the bill is not forwarded.'},
  // Hearing note: Rep. Sethi's tough question, the three notes the player can pass, and what happens next.
  noteQ:{q:'Rep. Hollis, suppose there’s a real fire and nobody is home. If the robot has to check every order from the internet, will it keep the firefighters out?',
    opts:[{t:'Real fire departments sign their orders, so the robot can check them in a second. Firefighters at the door can also just ask it in person.',good:true,
        say:'Good question. A real fire department signs its orders, so the robot can check one in about a second and let the firefighters in. And when firefighters are standing at the door, they can simply ask the robot, the same as anyone in the room can.',back:'So the bill only stops orders from strangers far away who can’t prove who they are. That makes sense. Thank you, I yield back.',mood:'smile'},
      {t:'Emergencies like that are very rare, so it isn’t worth worrying about. This bill is about stopping fake orders.',say:'Well... emergencies are rare.',back:'Even a rare fire can hurt someone. I’ll want a better answer before the vote.',mood:'stern'},
      {t:'Families can switch off the checking whenever they need to, so firefighters would never be kept out.',say:'Families could switch off the checking whenever they need to.',back:'Then a fake order would just say “switch off your checking” first.',mood:'stern'}],
    whisper:'Psst. People standing next to a robot can always give it orders by talking to it. Only orders from far away need a digital signature, and real fire departments sign their orders.'},
  // Whip count: two questions per member; the open question reveals what each really needs (and Rep. Gunderson's story).
  whipQ:{
    gunderson:{district:'Wheat, hay and goats on the northern plains',qs:[
      {t:'What would a good robot law look like on your farm?',good:true,learn:1,reply:'Honest answer? Robots that are safe from fake orders and still work at harvest time. The new security chips need permits, and the towns in my district are at the back of the line for them. With a one-year deadline, two of every three farm robots couldn’t take orders from our phones at harvest.',
        story:{text:'And between you and me, last spring at the county fair, a kid connected to my barn robot from his phone, clear across the fairgrounds, and told it to open the goat pen. It did. Forty goats on Main Street. I’d rather folks didn’t hear about that.',
          opts:[{t:'Thank you for trusting me. I won’t share it unless you say so.',good:true,reply:'I appreciate that. If it would help other farmers, maybe someday I’ll tell it myself.',mood:'smile'},
            {t:'Forty goats! Can I tell the committee?',reply:'No. That’s my story to tell, not yours.',mood:'stern'}]}},
      {t:'Will you vote yes if we add your name as a cosponsor?',reply:'I don’t trade my vote for my name on a piece of paper. Tell me what the bill does for my district.',mood:'stern'},
      {t:'Don’t you care about robot safety?',reply:'Of course I do. Everybody does. What worries me is that farm robots would stop taking orders from our phones while the new chips are on back order.',learn:1,mood:'think'}]},
    ibarra:{district:'A Gulf Coast port that runs on robot crews',qs:[
      {t:'What happens now when a robot crew has an accident at your port?',good:true,learn:1,reply:'The company fixes it quietly. My workers hear about it weeks later, if ever. And the “person in charge” is a name on a form who can’t even pause the crew.',mood:'stern'},
      {t:'The bill is already strong. Can we count on you?',reply:'Strong for whom? Show me what the bill does for my workers, and then ask me.',mood:'stern'},
      {t:'Would reports that go only to the regulator be okay?',reply:'Only if my workers can read them too. When accident reports are kept secret, the same accident tends to happen again.',learn:1,mood:'think'}]},
    sethi:{district:'Robot makers and startups on the West Coast',qs:[
      {t:'What worries the robot makers in your district?',good:true,learn:1,reply:'Paperwork, mostly. A twelve-person company can’t survive a public report every time a robot bumps a shelf. If every report goes public within 24 hours, before anyone knows what really happened, a rumor could put a small company out of business.',mood:'think'},
      {t:'Isn’t safety more important than profits?',reply:'That’s a trick question, and you know it. Safety matters, and so do the jobs of the people who build safe robots.',mood:'stern'},
      {t:'Did the note answer your emergency question?',reply:'It did. People in the room can still talk to their robots, and only orders from far away get checked. I can explain that to my companies.',replyBad:'Not really. I’ll need to see how the bill text handles emergencies.',mood:'smile'}]}},
  lines:[
    {who:'byte',text:'Thanks for telling me. I’ll keep Rep. Gunderson’s story private. It changes my forecast, though: with a phase-in that puts farms first in line for chips, I now think he votes yes about 85 times in 100, not 40.'},
    {who:'byte',text:'Psst. People standing next to a robot can always give it orders by talking to it. Only orders from far away need a digital signature, and real fire departments sign their orders.'},
    {who:'byte',text:'Rep. Ibarra and Rep. Sethi want opposite things. Rep. Ibarra wants reports the public can see fast, and Rep. Sethi wants reports to go to the regulator first. We need a version both of them can accept.'},
    {who:'byte',text:'You only get a couple of minutes with each member, so ask each one what they really need from this bill.'},
    {who:'byte',text:'Here’s the bill, section by section. The legal words are on the left, and what they mean is on the right.'},
    {who:'byte',text:'Thank you for telling me. I’ll keep Rep. Gunderson’s story private, because it’s his story to tell. It changes my forecast, though: with a phase-in that puts farms first in line for chips, I now think he votes yes about 85 times in 100, not 40.'},
    {who:'gunderson',text:'An honest answer, even if I don’t love the deadline. I’ll think hard about it.'},
    {who:'gunderson',text:'That’s a straight answer. I can work with that.'},
    {who:'gunderson',text:'I don’t vote for what I don’t understand. Try again.'},
    {who:'gunderson',text:'I told you that in trust. That’s not how we do things here.'},
    {who:'gunderson',text:'Definitely? Nothing in Congress is definite.'},
    {who:'gunderson',text:'Your boss says you wrote the final draft. So tell me straight: what does it do for my farmers, and will it pass?'},
    {who:'sethi',text:'Rep. Hollis, suppose there’s a real fire and nobody is home. If the robot has to check every order from the internet, will it keep the firefighters out?'},
    {who:'hollis',text:'Good question. A real fire department signs its orders, so the robot can check one in about a second and let the firefighters in. And when firefighters are standing at the door, they can simply ask the robot, the same as anyone in the room can.'},
    {who:'hollis',text:'Well... emergencies are rare.'},
    {who:'hollis',text:'Families could switch off the checking whenever they need to.'},
    {who:'sethi',text:'So the bill only stops orders from strangers far away who can’t prove who they are. That makes sense. Thank you, I yield back.'},
    {who:'sethi',text:'Even a rare fire can hurt someone. I’ll want a better answer before the vote.'},
    {who:'sethi',text:'Then a fake order would just say “switch off your checking” first.'},
    {who:'sethi',text:'Not really. I’ll need to see how the bill text handles emergencies.'}]
};
// every whip-count line, recorded in each member's voice
(function(){const m=MISSIONS.bill;for(const id in m.cast)if(!m.cast[id].voiceOnly)m.cast[id].art=function(mood){return bill_dress(this,mood)};
  const R=m.rollLines;m.lines.push({who:'clerk',text:R.start},{who:'chair',text:R.pass},{who:'chair',text:R.fail});for(const k in R.tally)m.lines.push({who:'clerk',text:R.tally[k]});
  for(const id in R.call){m.lines.push({who:'clerk',text:R.call[id]},{who:id,text:'Aye.'},{who:id,text:'No.'})}m.lines.push({who:'hollis',text:'Aye.'});for(const id in m.whipQ)for(const q of m.whipQ[id].qs){m.lines.push({who:id,text:q.reply});if(q.replyBad)m.lines.push({who:id,text:q.replyBad});
  if(q.story){m.lines.push({who:id,text:q.story.text});q.story.opts.forEach(o=>m.lines.push({who:id,text:o.reply}))}}})();

// ======================= custom steps (browser only; called from MISSIONS.bill.custom) =======================
const BILL_WHO=['gunderson','ibarra','sethi'];
const BILL_ASK={gunderson:'Farm robots that keep working at harvest',ibarra:'Reports workers can see, and a crew boss who can pause',sethi:'No public reports before the facts are in'};
const BILL_HI={gunderson:'Walk with me. I’ve got two minutes before my next meeting.',ibarra:'You’re the new aide? Make it quick. I have a vote downstairs.',sethi:'Hi. Ask me anything, but I won’t promise a vote yet.'};
MISSIONS.bill.lines.push(...BILL_WHO.map(w=>({who:w,text:BILL_HI[w]})));
function bill_st(){const s=S.m_bill||(S.m_bill={});s.asked=s.asked||{};s.learned=s.learned||{};return s}
function bill_crate(){return `<g transform="translate(14 8)"><rect x="0" y="0" width="40" height="30" rx="3" fill="#8a9bb8" stroke="#46557a" stroke-width="2"/><path d="M0 9 H40 M0 21 H40" stroke="#46557a" stroke-width="1.2" opacity=".6"/>
  <path d="M8 -3 c-4 -5 6 -8 9 -3 c3 5 9 2 12 -2" stroke="#e85a4a" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M14 -2 c2 -6 10 -6 12 -1" stroke="#f5b82e" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <rect x="3" y="10" width="34" height="10" rx="1.5" fill="#f4f6fb"/><text x="20" y="14.6" text-anchor="middle" font-size="4.6" font-family="Nunito" font-weight="800" fill="#2a3354" textLength="22" lengthAdjust="spacingAndGlyphs">TOTALLY</text><text x="20" y="19.2" text-anchor="middle" font-size="4.6" font-family="Nunito" font-weight="800" fill="#2a3354" textLength="32" lengthAdjust="spacingAndGlyphs">NORMAL CABLES</text></g>`}
function bill_arrive(){S.m_bill={asked:{},learned:{}};save();
  screen('walk',`${scene('dc_hearing')}${hud('Room 2123 · Rayburn Building')}<div class="props walklayer"><div class="walk-byte bill-wbyte">${byteBox({...S.byte,mood:'happy'},'trot')}</div>
    <div class="pipjory bill-pj" id="pj"><svg viewBox="-40 -60 150 110">${mini(0,40,{who:'pip',pose:'push',s:1.1})}${bill_crate()}${mini(66,40,{who:'jory',pose:'push',s:1.1})}</svg></div></div>
    <div class="caption-card"><p>The hearing room fills up with reporters, a school group, and neighbors who rode the train from Halden Creek. Two people who say they are technicians wheel a crate behind the raised desk where the members sit.</p>
    <div class="row"><button class="btn small ghost" id="clue">Look at the crate</button><button class="btn small" id="on">Take your seat</button></div></div>`);
  $('#clue').onclick=()=>{S.notes.crate=true;save();$('#pj').classList.add('flee');toast('The two “technicians” hurry away. You wrote the crate down in your notebook.','good');$('#clue').disabled=true};
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
  const done=()=>{unlock('fail-safe')&&toast('New Field Guide idea: Machines that anyone nearby can stop','good');nextStep()};
  ask()}

// ---- the whip count: two questions with each undecided member ----
function bill_face(id,mood,cls){const c=CAST[id];const inner=c.art?c.art.call({...c,mood},mood):personSVG({...c,mood});
  return `<svg class="bill-face ${cls||''}" viewBox="66 16 168 168" aria-label="${esc(c.name)}">${inner}</svg>`}
function bill_whip(){const st=bill_st();const Q=M().whipQ;
  const left=id=>2-(st.asked[id]||[]).length;
  const card=id=>{const c=CAST[id],n=left(id),L=st.learned[id];
    return `<div class="bw-card ${n<=0?'done':''}"><div class="bw-face">${bill_face(id,L?'smile':'neutral')}</div><div class="bw-txt"><b>${esc(c.name)}</b><span>${esc(Q[id].district)}</span>
      ${L?`<em>Needs: ${esc(BILL_ASK[id])}</em>`:(st.asked[id]||[]).length?'<em class="vague">You haven’t learned what matters most to this member yet.</em>':''}${id==='gunderson'&&S.notes.gate?'<em class="secret">Told you a private story</em>':''}</div>
      <button class="btn small ${n<=0?'ghost':''}" data-talk="${id}" ${n<=0?'disabled':''}>${n<=0?'Done':n===2?'Talk':'1 more'}</button></div>`};
  const allTalked=BILL_WHO.every(id=>(st.asked[id]||[]).length>0),allDone=BILL_WHO.every(id=>left(id)<=0);
  screen('bench',`${scene('dc_hearing')}<div class="talk-dim"></div>${hud('Rayburn hallway · after the hearing')}<div class="panel-card bill-whip">
    <h2>Whip count</h2><div class="bw-tally"><span class="y"><b>9</b>yes</span><span class="n"><b>9</b>no</span><span class="u"><b>3</b>undecided</span><span class="need"><b>11</b>to pass</span></div>
    <div class="bw-cards">${BILL_WHO.map(card).join('')}</div>
    <div class="byte-note">${byteBox({...S.byte,mood:allDone?'alert':'think'})}<p>${allDone?'Rep. Ibarra and Rep. Sethi want opposite things. Rep. Ibarra wants reports the public can see fast, and Rep. Sethi wants reports to go to the regulator first. We need a version both of them can accept.':'You only get a couple of minutes with each member, so ask each one what they really need from this bill.'}</p></div>
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
  3:{h:'SEC. 3. REMOTE ORDERS.',key:'cmd',v:{
    all:{legal:'(a) IN PERSON.—A covered robot may act on a request made in person by a member of its household or workplace.\n(b) RISKY REMOTE ORDERS.—Beginning 90 days after the date of enactment of this Act, a covered robot shall not act on a remote order to unlock a door, open a gate, disable an alarm, or leave the property it serves, unless the order carries a valid digital signature of its owner, its operator, or an emergency service.\n(c) ALL REMOTE ORDERS.—Not later than 1 year after the date of enactment of this Act, a covered robot shall act on a remote order only if the order carries such a signature.',plain:'People in the room can still talk to their robot. Within 90 days, no robot may unlock a door, open a gate, turn off an alarm or leave the property on an internet order unless the order is signed. Within 1 year, every internet order must be signed, and robots without the chip can’t take internet orders until they get one.'},
    phase:{legal:'(a) IN PERSON.—A covered robot may act on a request made in person by a member of its household or workplace.\n(b) RISKY REMOTE ORDERS.—Beginning 90 days after the date of enactment of this Act, a covered robot shall not act on a remote order to unlock a door, open a gate, disable an alarm, or leave the property it serves, unless the order carries a valid digital signature of its owner, its operator, or an emergency service.\n(c) ALL REMOTE ORDERS.—A covered robot made after the date of enactment of this Act shall act on a remote order only if the order carries such a signature. Any other covered robot shall comply not later than 3 years after such date.\n(d) PRIORITY.—The Secretary shall give farms and households first priority for the chip permits needed to comply.',plain:'People in the room can still talk to their robot. Within 90 days, no robot may unlock a door, open a gate, turn off an alarm or leave the property on an unsigned internet order. New robots check every internet order right away. Older robots get 3 years, and farms and families go first in line for chips.'},
    exempt:{legal:'(a) IN PERSON.—A covered robot may act on a request made in person by a member of its household or workplace.\n(b) RISKY REMOTE ORDERS.—Beginning 90 days after the date of enactment of this Act, a covered robot shall not act on a remote order to unlock a door, open a gate, disable an alarm, or leave the property it serves, unless the order carries a valid digital signature of its owner, its operator, or an emergency service.\n(c) LABELS.—Each manufacturer shall label which actions of its robots are covered by subsection (b).',plain:'People in the room can still talk to their robot, and everyday orders from a phone keep working. Within 90 days, an order from the internet to unlock a door, open a gate, turn off an alarm or leave the property must carry a real signature. No other order is ever checked. Makers must label which actions count as risky.'}}},
  4:{h:'SEC. 4. STOP CONTROL.',lock:1,legal:'Each covered robot shall have a stop control that any person near the robot may use, that works without a network connection, and that requires no signature.',plain:'Anyone near a robot can stop it, even with no internet, and stopping never needs a signature.'},
  5:{h:'SEC. 5. ACCIDENT AND NEAR-MISS REPORTS.',key:'report',v:{
    public:{legal:'(a) Not later than 24 hours after an accident or near miss involving a covered robot, the operator shall publish a report of it on a public website.',plain:'Within 24 hours, everyone can read what happened.'},
    split:{legal:'(a) Not later than 24 hours after an accident or near miss involving a covered robot, the operator shall report it to the Secretary.\n(b) Not later than 7 days after receiving such a report, the Secretary shall publish a summary of it.',plain:'The regulator hears about it in 24 hours. Everyone can read a summary in 7 days.'},
    private:{legal:'(a) Not later than 24 hours after an accident or near miss involving a covered robot, the operator shall report it to the Secretary, who shall keep the report confidential.',plain:'Only the regulator ever sees the reports.'}}},
  6:{h:'SEC. 6. ACCOUNTABLE INDIVIDUAL.',key:'human',v:{
    pause:{legal:'Each robot crew shall have a named individual who is accountable for the crew and who may pause the crew at any time without penalty.',plain:'Each crew has a named person in charge, who can pause it any time and can’t be punished for doing so.'},
    name:{legal:'Each robot crew shall have a named individual who is accountable for the crew.',plain:'Each crew has a named person in charge, but the law doesn’t say they can stop it.'}}}};
// what each member would say about a version, once you know what they need (no numbers before the criteria step)
function bill_react(id,c){const v=bill_votes(c,!!S.told)[id],mood=v>=.7?'smile':v>=.4?'think':'worried';
  const say={gunderson:c.cmd==='all'?'One year? Then my farm robots stop taking phone orders at harvest. No.':c.cmd==='phase'?(S.told?'Farms go first in line for chips. I can explain that to folks back home.':'Three years is better, but I’m still not sure.'):(S.told?'That’s easy for my farms. But my own barn robot got fooled once.':'My farm robots keep working. I like it.'),
    ibarra:c.human==='name'?'A name on a form can’t stop a crew.':c.report==='private'?'Secret reports? My workers deserve better.':c.report==='split'?'A public summary in seven days is slow, but I can live with it.':'My workers will read every report, and the crew boss can pause the robots.',
    sethi:c.report==='public'?'Public reports in 24 hours could ruin my small companies.':c.cmd==='all'?'One year is a tight deadline for small robot makers.':c.report==='split'?'The regulator gets the facts first, then the public. That’s fair.':'Private reports are easy for my companies.'}[id];
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
      <p class="bd-title">A BILL to require that home and work robots check who sent any order that reaches them over the internet, and for other purposes.</p>
      <p class="bd-enact"><i>Be it enacted by the Senate and House of Representatives of the United States of America in Congress assembled,</i></p>
      <div class="bd-h">SEC. 1. SHORT TITLE.</div><p class="bd-small">This Act may be cited as the “Robot Safety Act”.</p>
      <div class="bd-h">SEC. 2. DEFINITIONS.</div><p class="bd-small">(1) COVERED ROBOT.—The term “covered robot” means a machine that moves in the physical world and acts on its own in a home or workplace. (2) ROBOT CREW.—The term “robot crew” means two or more covered robots doing one job together. (3) REMOTE ORDER.—The term “remote order” means an instruction that reaches a covered robot over a network rather than from a person beside it. (4) SECRETARY.—The term “Secretary” means the Secretary of Commerce.</p>
      <div id="bdsecs">${bill_draftSecs()}</div></article>
    ${companion()}<div class="bench-foot"><button class="btn" id="next">Set my criteria</button></div></div>`);
  wireCompanion();setTimeout(()=>byteSays('Here’s the bill, section by section. The legal words are on the left, and what they mean is on the right.','happy'),500);
  const wire=()=>$$('.bd-vers .segb').forEach(b=>b.onclick=()=>{S.choice={...S.choice,[b.dataset.k]:b.dataset.v};save();MUSIC.sfx('click');
    $('#bdsecs').innerHTML=bill_draftSecs();$('#bdstrip').innerHTML=bill_draftStrip();$$('.bd-m').forEach(m=>m.classList.add('bump'));wire()});
  wire();$('#next').onclick=()=>nextStep()}

// ---- the markup: the clerk calls the roll, then a glimpse of the year after (the real outcome, drawn from the true odds) ----
// Each undecided member votes yes with their true probability; then, if the bill passes, the gap its version leaves decides
// whether a fake order fools some robots within a year. This matches outcomes(c, true) exactly.
function bill_sampleRoll(){const c=S.choice,v=bill_votes(c,true),rr=rngFrom((Date.now()%100000)+11),st=bill_st();
  const yes={};BILL_WHO.forEach(id=>{yes[id]=rr()<v[id]});const k=BILL_WHO.filter(id=>yes[id]).length,O=M().outcomes(c,true);
  let o;if(k>=2){if(rr()<BILL_GAP[c.cmd])o=O.find(x=>!/^(law|fail)\d+$/.test(x.kind));else o=O.find(x=>x.kind===(k===3?'law12':'law11'))}
  else o=O.find(x=>x.kind===(k===1?'fail10':'fail9'));
  S.result={...(o||O[0])};st.roll={yes,ayes:9+k};save()}
function bill_markup(){const st=bill_st();if(!S.result||!st.roll)bill_sampleRoll();const R=M().rollLines,roll=M().roll,yes=st.roll.yes,ayes=st.roll.ayes,passed=ayes>=11;
  const vote=m=>m[2]==='y'?1:m[2]==='n'?0:(yes[m[2]]?1:0);
  screen('markup',`${scene('dc_hearing')}<div class="talk-dim"></div>${hud('Markup · Room 2123 · Rayburn Building')}<div class="bill-mk">
    <div class="mk-head"><b>H.R. 6120</b><span>Roll call on the Robot Safety Act</span><button class="mini-btn" id="mkskip">Skip ahead</button></div>
    <div class="mk-tally"><div class="ay"><b id="mkay">0</b><span>Ayes</span></div><div class="mk-need">11 to pass</div><div class="no"><b id="mkno">0</b><span>Noes</span></div></div>
    <div class="mk-grid">${roll.map((m,i)=>`<div class="mk-chip ${m[2].length>1?'swing':''}" id="mk${i}"><span>${m[0]} ${m[1]}</span><em></em></div>`).join('')}</div>
    <div class="mk-call" id="mkcall"><div class="mk-face" id="mkface"></div><p id="mkline">${esc(R.start)}</p></div>
    <div class="mk-end" id="mkend" hidden></div></div>`);
  let i=0,a=0,n=0,alive=true,skip=false;const id0=playId;
  const wait=ms=>new Promise(r=>setTimeout(r,skip?0:ms));const live=()=>alive&&$('#mkcall');
  const say=async(who,text,ms)=>{if(!live())return;$('#mkline').textContent=text;if(skip)return;const t0=Date.now();await playLine(who,text);await wait(Math.max(0,(ms||900)-(Date.now()-t0)))};
  const mark=(k,v)=>{const c=$('#mk'+k);if(!c)return;c.classList.add(v?'aye':'nay','in');c.querySelector('em').textContent=v?'Aye':'No';if(v)a++;else n++;$('#mkay').textContent=a;$('#mkno').textContent=n;if(!skip)MUSIC.sfx(v?'blip':'click')};
  const end=()=>{if(!$('#mkend'))return;alive=false;const kind=S.result.kind,line=(M().reveal.lines||{})[kind]||'';
    roll.forEach((m,k)=>{const c=$('#mk'+k);if(c&&!c.classList.contains('in'))mark(k,vote(m))});
    $('#mkline').textContent=passed?R.pass:R.fail;$('#mkface').innerHTML='';$('#mkskip').hidden=true;
    unlock('forecast')&&toast('New Field Guide idea: Forecasts are not promises','good');
    const e=$('#mkend');e.hidden=false;e.innerHTML=`<div class="mk-result ${passed?'pass':'fail'}">${passed?`Passed the subcommittee, ${ayes} to ${21-ayes}`:`Failed in the subcommittee, ${ayes} to ${21-ayes}`}</div>
      <div class="mk-later">${passed?'The next three years':'The next year'}</div><div class="rf-card">${vig(kind)}</div><h2>${esc(S.result.cap)}</h2>
      <div class="rf-talk"><div class="rf-maya">${portrait({...CAST.hollis,mood:M().reveal.mood(kind)})}</div><p>“${esc(line)}”</p></div><button class="btn wide" id="next">See how you did</button>`;
    $('#next').onclick=()=>nextStep();setTimeout(()=>{if(S.step==='markup')playLine('hollis',line)},skip?50:600);e.scrollIntoView({behavior:'smooth',block:'start'})};
  $('#mkskip').onclick=()=>{skip=true;stopVoice();end()};
  (async()=>{await say('clerk',R.start,1200);
    for(i=0;i<roll.length;i++){if(!live())return;const m=roll[i],swing=m[2].length>1;
      if(swing){$('#mkface').innerHTML=bill_face(m[2],'think');$('#mk'+i).classList.add('calling');await say('clerk',R.call[m[2]],700);if(!live())return;
        const v=vote(m);$('#mkface').innerHTML=bill_face(m[2],v?'smile':'stern');await say(m[2],v?'Aye.':'No.',900);mark(i,v);$('#mk'+i).classList.remove('calling');await wait(500);$('#mkface').innerHTML=''}
      else{$('#mkline').textContent=m[0]+' '+m[1]+'?';await wait(170);mark(i,vote(m))}}
    if(!live())return;await say('clerk',R.tally[ayes],1400);if(!live())return;await say('chair',passed?R.pass:R.fail,1200);end()})()}
