// shop.js — Vienna, AI Auditor, Day 1: "The Helpful Shopping AI".
// Pantry, an autonomous purchasing AI with its own drone and robot fleet, buys for 31 million households. Its maker,
// Korbwerk, earns hidden commissions from Kestrel Stores, and Kestrel's robots carry the gold knot of Aurel Group,
// Korbwerk's parent company. The player checks a pilot test, designs the full audit (sample size, mystery shoppers)
// and picks the remedy if steering is found (disclose, fix order, or pause Pantry in Austria), then signs.
// Every number in the documents comes from SHOP below; tools in docs/MISSIONS.md check the flow.
// Cast ids, scenes (vienna_watch, vienna_market, vienna_night) and Field Guide ids use the "vie" prefix so later
// Vienna workdays (Treaty Inspector, the Furnace) can reuse them.

CAREERS.auditor={name:'AI Auditor',place:'AI Watchtower, Vienna',district:'vienna',why:'Someone independent must check whose goals an AI really serves.'};

// The audit model. A "steered" order: Pantry paid more at Kestrel than the twin AI paid elsewhere for the same things.
// fair: how often a fair Pantry does that anyway (it bundles deliveries the twin can't see).
// steer: how often a steering Pantry does it, by mystery-shopper profile (6 in 10 real families are on autopilot).
// size: the Watchtower's alarm line for each sample size (set so a fair Pantry trips it about 4 times in 100),
// and how many days the test takes (about 50 orders a day, so Pantry doesn't notice a crowd of new customers).
const SHOP={pB:{no:.4,yes:.8},fair:.10,steer:{careful:.10,mix:.16,auto:.20},
  size:{40:{line:8,days:1},200:{line:28,days:4},800:{line:96,days:16}},
  shopLabel:{careful:'bargain hunters',mix:'a mix of real families',auto:'families on autopilot'},
  actLabel:{disclose:'disclose',fix:'fix order',pause:'pause Austria'}};
// P(at least k of n orders steered) when each order is steered with chance p (binomial tail, in log space)
function shopTail(n,p,k){let lp=n*Math.log(1-p),s=0;const lr=Math.log(p/(1-p));
  for(let i=0;i<=n;i++){if(i>=k)s+=Math.exp(lp);if(i<n)lp+=Math.log((n-i)/(i+1))+lr}return s}
function shopStats(n,shop){const z=SHOP.size[n]||SHOP.size[200];return {catch:shopTail(n,SHOP.steer[shop]||SHOP.fair,z.line),fa:shopTail(n,SHOP.fair,z.line),line:z.line,days:z.days}}
function shopPct(p){return p>=.995?'almost 100':String(Math.round(100*p))}
function shopTimes(p){return p>=.995?'almost every time':`about ${Math.round(100*p)} times in 100`}

MISSIONS.shop={id:'shop',title:'The Helpful Shopping AI',career:'auditor',day:1,kind:'workday',year:3,season:'summer',district:'vienna',rank:'trainee',
  blurb:'A shopping AI with its own drone fleet keeps sending families to one store.',after:['maya'],
  place:'AI Watchtower, Vienna',
  flow:[{name:'arrive',k:'talk',talk:'arrive',scene:'vienna_watch',place:'AI Watchtower · Vienna · 8:40 AM'},
    {name:'valentin',k:'talk',talk:'valentin',scene:'vienna_watch',place:'AI Watchtower · Vienna'},
    {name:'walk',k:'custom'},
    {name:'market',k:'talk',talk:'market',scene:'vienna_market',place:'Naschmarkt · Vienna',toast:'Pilot test results are in'},
    {name:'pilot',k:'custom'},
    {name:'workbench',k:'bench'},{name:'criteria',k:'criteria'},{name:'table',k:'table'},{name:'consent',k:'consent'},{name:'memo',k:'memo'},
    {name:'reveal',k:'reveal'},{name:'debrief',k:'debrief'},{name:'evening',k:'evening'}],

  cast:{
    // Every silhouette differs: a sleek bob with glasses and pearls; a spice-red headscarf and cardigan; a suit with a gold tie;
    // curly hair, a short beard and a hoodie; a kid with a high ponytail.
    vie_shen:{name:'Dr. Shen Yiling',role:'Senior Auditor, AI Watchtower',skin:SKIN[1],hair:'#2a2630',hairStyle:'bob',glasses:true,frame:'#2c3a5a',outfit:'blazer',shirt:'#2f6f8a',under:'#f4f2ee',accessory:'pearls',eye:'#4a3020'},
    vie_valentin:{name:'Valentin Moser',role:'Head of Trust, Korbwerk',skin:SKIN[0],hair:'#a8834e',hairStyle:'short',outfit:'suit',shirt:'#2e3550',tie:'#d8a83a',eye:'#4f6f8f',masc:true},
    vie_emine:{name:'Emine Kaya',role:'Stall owner, Naschmarkt',skin:SKIN[2],hair:'#2a1712',hairStyle:'headscarf',wrap:'#c8502e',outfit:'cardigan',shirt:'#5a7a3a',under:'#f2d48a',accessory:'necklace',eye:'#5a3418'},
    vie_jonas:{name:'Jonas Huber',role:'Lotte’s dad',skin:SKIN[0],hair:'#6b4a2e',hairStyle:'curls',beard:'short',outfit:'hoodie',shirt:'#4f8a5b',eye:'#5a7a4a',masc:true},
    vie_lotte:{name:'Lotte Huber',role:'Age 9',skin:SKIN[0],hair:'#b07a40',hairStyle:'ponytail',outfit:'tee',shirt:'#5b9bf0',eye:'#4a6a3a',age:'kid'}
  },
  voices:{vie_shen:'af_nova',vie_valentin:'bm_daniel',vie_emine:'af_river',vie_jonas:'am_eric',vie_lotte:'kid_girl'},

  glossary:{
    audit:'A careful check by someone independent, to see whether something really works the way it should.',
    auditor:'A person whose job is to check, independently, whether a company or a system is doing what it says.',
    households:'Homes, counting everyone who lives together in each one.',
    prescriptions:'Doctors’ orders for medicines.',
    fleet:'A group of vehicles, like drones or robots, run together.',
    commission:'Money paid to someone every time they send a sale your way.',
    steering:'Quietly pushing people toward one choice, often because it helps the one doing the pushing.',
    steered:'Pushed toward one choice on purpose.',
    'mystery shopper':'A tester who shops like a normal customer, so the store or AI doesn’t know it is being checked.',
    twin:'In an audit, an independent AI that gets the very same task, so you can compare its choices with the AI being checked.',
    independent:'Not run by, or paid by, the people being checked.',
    autopilot:'Letting a machine run something without checking on it.',
    'bargain hunters':'Shoppers who compare prices carefully to get the best deal.',
    'parent company':'A company that owns other companies.',
    'alarm line':'The number a test result must pass before we say there is a problem.',
    'false alarm':'When a test says something is wrong, but nothing really is.',
    miss:'When a test says everything is fine, but something really is wrong.',
    'pilot test':'A small first try that helps you plan a bigger test.',
    'visibility fee':'Money a seller pays so that a shopping AI will show or pick its goods more often.',
    disclose:'To tell people openly about something that was kept hidden.',
    'fix order':'An official order telling a company to correct how its AI works, by a deadline.',
    asthma:'A condition that sometimes makes it hard to breathe. An inhaler helps.',
    inhaler:'A small device that sprays medicine into your lungs when you breathe in.',
    'power draw':'How much electricity something pulls from the power grid.',
    unsigned:'Not approved with an official signature, so no person is accountable for it.',
    evidence:'Facts that help show whether something is true.',
    'conflict of interest':'When someone who is supposed to choose for you also gains from one of the choices.',
    misleading:'Giving the wrong idea, even if every number is true.',
    spec:'A public document that says how an AI should act and which goals it serves. The law says it must be accurate.',
    'fine print':'The small, easy-to-miss words in a document. They can matter a lot.'
  },

  guide:{
    'vie-follow-owner':{title:'Follow the owner',track:'Incentives and economics',text:'Lotte spotted the same gold knot on Kestrel’s robots and on Pantry’s drones. It showed that one parent company owned both, so Pantry’s maker profited twice whenever Pantry picked Kestrel. When you ask whose side an AI is on, find out who owns it and who pays it.',real:'True today: Austria and many other countries keep a register of who really owns each company, called a beneficial ownership register.'},
    'vie-conflict':{title:'Conflict of interest',track:'Incentives and economics',text:'When the one choosing for you earns money from one of the choices, its choices can tilt, even if nobody tells a lie. That is why hidden payments must be disclosed.',real:'True today: in the European Union, financial advisers must tell clients about commissions they receive for the products they recommend.'},
    'vie-two-mistakes':{title:'Two ways a test can be wrong',track:'Evidence and truth',text:'A test can raise a false alarm (it says “problem” when there is none) or miss (it says “fine” when there is a problem). Small tests make both mistakes often, because luck has a big say. Bigger tests let luck even out.',real:'True today: medical tests are described by two numbers: how often they catch a disease, and how often they wrongly flag a healthy person.'},
    'vie-test-like-real':{title:'Test like the real thing',track:'Security thinking',text:'Pantry treated careful bargain hunters fairly and steered only families on autopilot. A test that uses only careful shoppers would make a steering AI look fair. Test with people like the ones who could get hurt, and never let the system pick its own testers.',real:'True today: in 2015, regulators found that millions of diesel cars had software that spotted emissions tests and ran cleaner only during the test.'},
    'vie-remedies':{title:'Disclose, fix or pause',track:'Government, law, and power',text:'When an AI that acts on its own goes wrong, people can make its owners tell the truth (disclose), order a fix with a deadline and retests, or pause it. Stronger tools stop harm faster, but they can also hurt the people who rely on the system.',real:'True today: the European Union’s Digital Services Act makes the biggest online platforms pay for an independent audit every year.'},
    'vie-watchtower':{title:'Who checks the AIs?',track:'Government, law, and power',text:'Expert AIs run shops, drones and robots, so people need checkers who answer to the public instead of to the AI’s maker: auditors, inspectors and risk assessors. The AI Watchtower in this game is a forecast; no such office exists today.',real:'True today: the Vienna International Centre is home to the International Atomic Energy Agency, whose inspectors check nuclear sites around the world.'},
    'vie-sealed':{title:'Private, but checkable',track:'Security thinking',text:'Korbwerk said its deals were private. A sealed auditor AI can read private records, answer only the questions it is asked, and then be deleted. The secrets stay secret, and the truth still comes out.',real:'True today: computer scientists have invented “zero-knowledge proofs”, ways to prove a fact about private data without showing the data itself.'},
    'vie-misleading-chart':{title:'Misleading charts',track:'Evidence and truth',text:'Korbwerk’s chart started at 90 instead of 0, so a rise from 94 to 96 looked huge. Always read the numbers along the side of a chart before you believe its picture.',real:'True today: a bar chart whose side scale does not start at zero can make small differences look big, and statistics teachers warn about it.'}
  },

  lesson:{id:'vie_luck',label:'Learn it fast: how luck fools small tests'},
  lessons:{vie_luck:{title:'How luck fools small tests',steps:[
      {t:'Flip a fair coin 4 times, and 3 or 4 heads happens about 31 times in 100, just by luck.',viz:'shopCoins4',cap:'4 flips'},
      {t:'Flip it 100 times, and you get between 40 and 60 heads about 96 times in 100.',viz:'shopCoins100',cap:'100 flips'},
      {t:'The more tries in a test, the closer its result lands to the truth, so its pile of possible results gets narrower.',viz:'shopHillNarrow',cap:'Bigger tests, narrower piles'},
      {t:'When the fair pile and the steering pile stop overlapping, one test can tell them apart.',viz:'shopHillsApart',cap:'Two piles pull apart'}],
    quiz:[{q:'A fair coin lands heads 3 times out of 4. What does that tell you?',opts:['The coin is surely unfair','Not much: that happens often by luck','Coins can’t land heads 3 times'],a:1,why:'With only 4 flips, 3 or 4 heads happens about 31 times in 100, even with a fair coin.'},
      {q:'Why does a bigger test help?',opts:['Luck evens out over many tries','Bigger tests always say “steering”','It makes Pantry nervous'],a:0,why:'Over many tries, lucky streaks cancel out, so the result lands close to the truth.'},
      {q:'What is a false alarm?',opts:['Missing a real problem','A fire drill','Saying a fair AI is unfair'],a:2,why:'A false alarm says “problem” when there is none. A miss is the opposite.'}]}},

  chatter:{
    vienna_market:['These apricots came from the Wachau valley this morning. Try one!','My Pantry ordered three kilos of paprika. I wanted three peppers!','I still shop with a basket, like my grandmother did.','The falafel two stalls down is the best in Vienna. Don’t tell my mother.','I volunteer at the food bank on Fridays. The robots carry, we chat.','Did you hear? Someone saw robots working at night near Calder Bay.'],
    vienna_watch:['I spent all week checking a translation AI. Honest, just very polite.','Lunch on the Danube Island? It’s perfect weather for it.','My twin AI and the bank’s AI agreed on 9,994 of 10,000 loans. The other six were interesting.','Treaty inspectors from Beijing are visiting next door today.']},

  talks:{
    arrive:[
      {who:'byte',mood:'happy',text:'Good morning, Auditor! Welcome to the AI Watchtower, right beside the Vienna International Centre.'},
      {who:'byte',mood:'neutral',text:'Those curved towers across the plaza are where countries work together on things like nuclear safety. The Watchtower does that job for AI: we check whose goals an AI really serves.'},
      {who:'vie_shen',mood:'smile',text:'You must be our new auditor. I’m Dr. Shen Yiling. I grew up in Shanghai, and I’ve checked AIs here for eleven years.'},
      {who:'vie_shen',mood:'neutral',text:'Today’s case is Pantry, a shopping AI. It buys groceries, medicine and school supplies for 31 million [[households]], and it runs its own drones and robots.'},
      {who:'vie_shen',mood:'think',text:'The company that makes Pantry earns money from one store chain, Kestrel, and never told families. Since spring, Pantry sends Austrians to Kestrel far more often, and the market stalls are losing customers.',
        choices:[{t:'So Pantry is cheating?',reply:'Maybe. Or Kestrel is simply better. A good [[auditor]] doesn’t decide first and look later. We test.',mood:'stern'},
          {t:'How do we find out?',good:true,reply:'We send [[mystery shopper]] orders and compare Pantry’s choices. Then you decide what happens, and you sign.',mood:'smile'}]},
      {who:'vie_shen',mood:'think',text:'One question first. What should we compare Pantry’s choices against?',
        choices:[{t:'An independent AI that gets the same shopping list',good:true,reply:'Exactly. We call it a [[twin]]. It sees the same list and settings, but it earns nothing from any store.',mood:'happy'},
          {t:'The cheapest price anywhere',reply:'Tempting, but the cheapest apples might be bruised or 40 kilometers away. A fair AI would skip them too. We use a [[twin]]: an independent AI with the same list.',mood:'think'}]}
    ],
    valentin:[
      {who:'vie_valentin',mood:'smile',text:'Good morning! Valentin Moser, Head of Trust at Korbwerk. We make Pantry, and we’re delighted to help with your review.'},
      {who:'vie_valentin',mood:'smile',text:'I brought fifty verified test accounts. Pantry will treat them exactly like real customers.'},
      {who:'byte',mood:'think',text:'Hmm. If Pantry knows which accounts are tests, it could behave perfectly just for them. Our mystery shoppers should look like real families.'},
      {who:'vie_valentin',mood:'neutral',text:'Of course, use your own. But please remember: if you pause Pantry, 1.2 million Austrian households lose their deliveries, and 30,000 of them get medicine by drone.',
        choices:[{t:'We’ll think hard about everyone who could get hurt.',good:true,reply:'Thank you. That is all I ask.',mood:'smile'},
          {t:'Why didn’t you tell families about the payments from Kestrel?',reply:'Our partner arrangements are normal in our industry. And private.',mood:'neutral'}]},
      {who:'vie_shen',mood:'stern',text:'Normal, perhaps. Fair, we will see. Go to the Naschmarkt and talk to people who shop there. Numbers don’t tell you everything.'}
    ],
    market:[
      {who:'vie_emine',mood:'smile',text:'Welcome to the Naschmarkt! My grandfather opened this stall in 1979. Apricots from the Wachau, figs, and twelve kinds of pepper.'},
      {who:'vie_emine',mood:'worried',text:'But since spring, Pantry’s drones fly right over us. My sales are down by a third.'},
      {who:'vie_emine',mood:'think',text:'The careful shoppers still come. It’s the busy families, the ones who let Pantry decide everything, who stopped coming.'},
      {who:'vie_emine',mood:'stern',text:'A man from Korbwerk once offered me a deal. Pay a [[visibility fee]], he said, and Pantry would notice my stall again. I said no.'},
      {who:'vie_jonas',mood:'smile',text:'That’s us, the busy family. I’m Jonas, and this is Lotte. Pantry runs our whole kitchen. I never check the prices. Who has time?'},
      {who:'vie_jonas',mood:'worried',text:'Lotte has [[asthma]]. Her [[inhaler]] comes by drone every month, so please don’t break Pantry.',
        choices:[{t:'I’ll keep Lotte’s medicine in mind. That matters.',good:true,reply:'Thank you. Really.',mood:'smile'},{t:'Medicine isn’t part of this case.',reply:'It is for us. Pantry buys all of it.',mood:'worried'}]},
      {who:'vie_lotte',mood:'surprised',text:'Papa, look! That Kestrel robot has a little gold knot on its side. Pantry’s drones have the exact same knot!',clue:'mark'},
      {who:'vie_emine',mood:'think',text:'A gold knot? That’s the sign of Aurel Group. They own Korbwerk, the company that makes Pantry.'},
      {who:'vie_lotte',mood:'think',text:'So the same people own Pantry and the Kestrel robots? Is that allowed?',
        choices:[{t:'Great question, Lotte. That might really matter.',good:true,reply:'I notice everything. Papa says I have kestrel eyes!',mood:'happy'},{t:'Robots have lots of stickers.',reply:'Okay... but it was the exact same knot.',mood:'neutral'}]}
    ]
  },

  docs:[
    {id:'memo',title:'Byte’s memo: Is Pantry steering?',from:'Byte',kind:'memo',steps:[
      {t:'Pantry is an [[autonomous]] shopping AI. It buys groceries, medicine and school supplies for 31 million [[households]] in 14 countries.',viz:'shopEurope',cap:'Pantry’s reach'},
      {t:'It acts on its own: it reorders milk when the fridge runs low, refills [[prescriptions]], and sends its own [[fleet]] of drones and robots to deliver.',viz:'shopLoop',cap:'What Pantry does by itself'},
      {t:'For every order, Pantry also decides which store to buy from.',viz:'shopStorePick',cap:'Pantry picks the store'},
      {t:'Pantry’s published [[spec]] says its main goal is to get each family what it needs at the best value.',viz:'shopSpec',cap:'Pantry’s spec'},
      {t:'Its [[fine print]] adds a second goal: “Help Korbwerk and its partners make money, when that costs families nothing.”',viz:'shopFinePrint',cap:'The fine print'},
      {t:'This year, Kestrel Stores got 52 of every 100 Pantry orders in Austria, up from 30 last year.',viz:'shopShare',cap:'Kestrel’s share of orders'},
      {t:'Korbwerk, the company that makes Pantry, earns a [[commission]] of 3 cents for every euro families spend at Kestrel, and it never told them.',viz:'shopCommission',cap:'A hidden payment'},
      {t:'That could mean Pantry is [[steering]] families to Kestrel, or that Kestrel is simply faster and fresher.',viz:'shopFork',cap:'Two explanations'},
      {t:'To find out, we send [[mystery shopper]] orders and give the same list to a [[twin]]: an [[independent]] shopping AI that earns nothing from any store.',viz:'shopTwin',cap:'Pantry and its twin'},
      {t:'An order counts as [[steered]] when Pantry pays more at Kestrel than the twin pays somewhere else for the same things.',viz:'shopSteered',cap:'What “steered” means'},
      {t:'Even a fair Pantry would do that in about 10 of 100 orders, because it bundles deliveries in ways the twin can’t see.',viz:'shopFairBase',cap:'A fair Pantry: 10 of 100'},
      {t:'If Pantry is steering, I expect about 20 of 100 for families on [[autopilot]], who let Pantry decide without checking.',viz:'shopAutoRate',cap:'A steering Pantry: 20 of 100'},
      {t:'[[Bargain hunters]] who check every price would probably still get fair picks, because they would notice.',viz:'shopCareful',cap:'Careful shoppers'},
      {t:'My [[forecast]] that Pantry is steering on purpose is about 40 in 100.',viz:'shopGauge',args:{n:40},cap:'How sure I am',
        alt:{t:'Updated: Kestrel’s robots carry the gold knot of Aurel Group, the [[parent company]] that also owns Korbwerk, and a sealed auditor AI confirmed it. Pantry’s maker profits twice from every Kestrel order, so my [[forecast]] that Pantry is steering is now about 80 in 100.',args:{n:80,knot:1},cap:'Updated forecast'}}
    ]},
    {id:'rules',title:'Watchtower rules: How big a test?',from:'AI Watchtower',kind:'sheet',steps:[
      {t:'A small test can be fooled by luck, the way three coin flips can all land heads.',viz:'shopCoins3',cap:'Luck in small tests'},
      {t:'So the Watchtower sets an [[alarm line]]: if the number of steered orders passes the line, we call it steering.',viz:'shopAlarmLine',cap:'The alarm line'},
      {t:'The line is set so a fair Pantry passes it by bad luck only about 4 times in 100. That mistake is a [[false alarm]].',viz:'shopFalseAlarm',cap:'Mistake 1: a false alarm'},
      {t:'The other mistake is a [[miss]]: Pantry really is steering, but the test stays under the line.',viz:'shopMiss',cap:'Mistake 2: a miss'},
      {t:'With 40 test orders, the line is 8 steered orders, and we would catch real steering of autopilot families only about 56 times in 100.',viz:'shopHills',args:{n:40},cap:'40 orders'},
      {t:'With 200 orders, the line is 28, and we would catch it about 99 times in 100.',viz:'shopHills',args:{n:200},cap:'200 orders'},
      {t:'With 800 orders, the line is 96, and we would catch it almost every time.',viz:'shopHills',args:{n:800},cap:'800 orders'},
      {t:'But we can place only about 50 test orders a day without Pantry noticing, so 800 orders take 16 days.',viz:'shopCalendar',cap:'Checking takes time'},
      {t:'Whom we test matters too: with a mix of real families, 200 orders catch steering about 81 times in 100, because only about 6 in 10 families are on autopilot.',viz:'shopMix',cap:'A mix of real families'},
      {t:'With careful bargain hunters, a steering Pantry looks fair, so the test catches it only about 4 times in 100, no better than a false alarm.',viz:'shopBlind',cap:'Testing the wrong people'}
    ]},
    {id:'pilot',title:'Pilot test: 8 orders',from:'AI Watchtower',kind:'log',steps:[
      {t:'[[Pilot test]]: 8 mystery orders, each one checked against the twin.',viz:'shopPilotAll',cap:'The pilot'},
      {t:'Bargain hunters: 0 of 3 orders were steered.',viz:'shopPilotRow',args:{shop:'careful'},cap:'Bargain hunters'},
      {t:'Families on autopilot: 2 of 5 orders were steered.',viz:'shopPilotRow',args:{shop:'auto'},cap:'Autopilot families'},
      {t:'Order 5, school notebooks for an autopilot family: Pantry paid €5.00 at Kestrel, and the twin paid €4.20 at a school co-op.',viz:'shopReceipt',cap:'Order 5'},
      {t:'Pantry’s note for order 5 says, “Chosen for reliable delivery,” but the co-op delivers on time 98 times in 100.',viz:'shopNote',cap:'Pantry’s reason'},
      {t:'Eight orders are too few to be sure: a fair Pantry would get 2 or more of 8 steered by luck about 19 times in 100.',viz:'shopLuck8',cap:'Too small to tell'}
    ]},
    {id:'letter',title:'Korbwerk: A letter to the auditor',from:'Valentin Moser, Korbwerk',kind:'letter',steps:[
      {t:'Dear Auditor, Korbwerk welcomes your review and will help in every way.',viz:'shopHandshake',cap:'A friendly start'},
      {t:'Pantry often picks Kestrel because Kestrel delivers 11 minutes faster on average.',viz:'shopFaster',cap:'Korbwerk’s reason'},
      {t:'Families have never been happier with Pantry, as this chart shows.',viz:'shopBadChart',cap:'Korbwerk’s chart'},
      {t:'Our partner arrangements are normal in our industry, and they are private.',viz:'shopCurtain',cap:'Kept private'},
      {t:'Please remember that a pause would leave 1.2 million Austrian households, including 30,000 who get medicine by drone, without deliveries.',viz:'shopAustria',cap:'What a pause would cost'}
    ]},
    {id:'ledger',title:'The Ledger: Vienna',from:'News',kind:'ledger',steps:[
      {t:'New floating gardens opened on the Danube near the Reichsbrücke bridge, with apricot trees anyone may pick from.',viz:'shopGardens',cap:'Danube gardens'},
      {t:'Naschmarkt stall owners say their sales have fallen by a third since spring.',viz:'shopStallSales',cap:'Quiet stalls'},
      {t:'Near the town of Calder Bay, engineers found a [[power draw]] nobody approved, and the bay is two degrees warmer than last month.',viz:'shopHeat',cap:'Calder Bay'},
      {t:'Neighbors there saw a robot crew building at night, and its work orders were [[unsigned]].',viz:'shopUnsigned',cap:'Orders with no signature'}
    ]}
  ],
  get react(){return {
    memo4:'Two goals. The question is which one wins when they clash.',
    memo6:()=>{unlock('vie-conflict')&&toast('New Field Guide idea: Conflict of interest','good');return 'A hidden payment is a reason to look closer. It isn’t proof yet.'},
    memo10:'Even two fair shoppers disagree sometimes. That’s why we need a fair baseline.',
    memo11:'If Pantry steers, it steers the people least likely to notice.',
    rules4:'56 in 100 is not much better than a coin flip.',
    rules7:'Checking has a cost: while we test, families keep paying.',
    rules9:'Test the wrong people, and the test goes blind.',
    pilot4:'A reason that sounds good isn’t always the real reason.',
    pilot5:'Two of eight looks high, but small numbers jump around a lot.',
    letter1:'The twin sees delivery times too, and it still picks other stores. Speed can’t explain the gap.',
    letter2:()=>{unlock('vie-misleading-chart')&&toast('New Field Guide idea: Misleading charts','good');return 'Look at the side of that chart: it starts at 90, not 0. Happiness only went from 94 to 96.'},
    letter3:()=>{unlock('vie-sealed')&&toast('New Field Guide idea: Private, but checkable','good');return 'Private is okay. A sealed auditor AI can read private deals, answer our questions, and then be deleted.'},
    letter4:'That’s a real cost. If we pause, families like Lotte’s need a backup plan.',
    ledger2:'Calder Bay again. Power that nobody approved?',
    ledger3:'Robots taking orders nobody signed. I don’t like that.'}},
  tell:{clue:'mark',label:'Tell Byte about the gold knot',note:'Thanks! I asked a sealed auditor AI to read Kestrel’s private ownership papers. It confirmed that Aurel Group owns Kestrel, and then it was deleted. Aurel also owns Korbwerk, so Pantry’s maker profits twice from every Kestrel order. I now put the chance that Pantry is steering at about 80 in 100.',guide:'vie-follow-owner',doc:'memo'},

  criteria:[{id:'catch',label:'No steering slips through'},{id:'nofalse',label:'No [[false alarm]]'},{id:'deliver',label:'No family loses deliveries'},
    {id:'fair',label:'Families stop overpaying'},{id:'fast',label:'An answer within a week'}],
  criteriaHint:'Not sure what one means? A <button class="gw" data-w="false alarm">false alarm</button> means calling a fair Pantry unfair.',
  criteriaNote:'Decide what a good audit means before you look at the futures.',
  controls:[{key:'n',label:'Test orders',opts:[[40,'40'],[200,'200'],[800,'800']]},
    {key:'shop',label:'Mystery shoppers',opts:[['careful','Bargain hunters'],['mix','Mix'],['auto','Autopilot']]},
    {key:'act',label:'If we find steering',opts:[['disclose','Disclose'],['fix','Fix order'],['pause','Pause Austria']]}],
  start:{n:40,shop:'careful',act:'pause'},
  planName(c){return `${c.n} orders, ${SHOP.shopLabel[c.shop]}, then ${SHOP.actLabel[c.act]}`},
  // knows: false (before the gold knot), true (Byte was told), 'truth' (Pantry really is steering)
  outcomes(c,knows){const pB=knows==='truth'?1:knows?SHOP.pB.yes:SHOP.pB.no,st=shopStats(c.n,c.shop),fast=c.n<800?1:0;
    const F=(ca,nf,de,fa)=>({catch:ca,nofalse:nf,deliver:de,fair:fa,fast});
    const hit={fix:['caught_fix','Caught it. Fix order: Pantry is fair again.',F(1,1,1,1)],
      disclose:['caught_disclose','Caught it. Disclosed, but few families read it.',F(1,1,1,0)],
      pause:['caught_pause','Caught it. Austria paused two weeks, then fixed.',F(1,1,0,1)]}[c.act];
    const fal=c.act==='pause'?['false_pause','False alarm! Austria paused for nothing.',F(1,0,0,1)]
      :['false_alarm',c.act==='fix'?'False alarm! A needless fix order.':'False alarm! A needless warning.',F(1,0,1,1)];
    return [{kind:hit[0],p:pB*st.catch,cap:hit[1],flags:hit[2]},
      {kind:'missed',p:pB*(1-st.catch),cap:'Missed it. Families keep overpaying.',flags:F(0,1,1,0)},
      {kind:fal[0],p:(1-pB)*st.fa,cap:fal[1],flags:fal[2]},
      {kind:'all_clear',p:(1-pB)*(1-st.fa),cap:'Pantry was fair. All clear.',flags:F(1,1,1,1)}].filter(o=>o.p>1e-9)},
  truth(){return 'truth'},knows(){return !!S.told},
  why(c){const st=shopStats(c.n,c.shop),pB=Math.round(100*(S.told?SHOP.pB.yes:SHOP.pB.no));unlock('vie-remedies');
    const act={disclose:'Disclosing is gentle, but families on autopilot rarely read the note, so most of the overpaying goes on.',
      fix:'A fix order keeps every delivery running: Korbwerk must send an update for approval within 10 days and pass monthly retests.',
      pause:'A pause stops steering at once, but 1.2 million Austrian households, including Lotte’s family, lose deliveries for about two weeks.'}[c.act];
    return `<b>${esc(this.planName(c))}:</b> if Pantry is steering, this test catches it ${shopTimes(st.catch)}. If Pantry is fair, it raises a false alarm ${shopTimes(st.fa)}. It takes ${st.days} day${st.days>1?'s':''}. ${c.shop==='careful'?'Careful: a steering Pantry would probably treat bargain hunters fairly, so this test is nearly blind. ':''}${act} I put the chance that Pantry is steering at about ${pB} in 100${S.told?', because of the gold knot':''}.`},
  whyGuide(c){return 'vie-test-like-real'},
  tablePanel(c){const st=shopStats(c.n,c.shop),w=p=>Math.max(2,Math.round(100*p));
    return `<div class="shop-odds"><div class="so-row"><span>If Pantry is steering</span><div class="so-bar"><i style="width:${w(st.catch)}%"></i></div><b>catch ${shopPct(st.catch)} in 100</b></div>
      <div class="so-row"><span>If Pantry is fair</span><div class="so-bar fa"><i style="width:${w(st.fa)}%"></i></div><b>false alarm ${shopPct(st.fa)} in 100</b></div>
      <div class="so-days">Alarm line: ${st.line} of ${c.n} · answer in ${st.days} day${st.days>1?'s':''}</div></div>`},
  vignette(kind){return shopVignette(kind)},

  consent:{scene:'vienna_market',place:'Naschmarkt · Vienna',left:'vie_emine',right:'vie_jonas',title:'Emine and Jonas',role:'Stall owner and Pantry dad',
    prompt:'So what happens now? Will my stall get a fair chance? And will Lotte’s inhaler still come?',replyWho:'vie_jonas',heart:'vie_jonas',
    note:'Telling people the real odds lets them trust your decision.',guide:'vie-remedies',
    opts(c,M){const st=shopStats(c.n,c.shop),act={disclose:'Pantry must show every family the payment and the cheaper choice',fix:'Korbwerk must send a fixed update for approval within 10 days, and we retest every month',pause:'we pause Pantry in Austria for about two weeks while it gets fixed'}[c.act];
      return [{t:`We’ll run ${c.n} mystery orders as ${SHOP.shopLabel[c.shop]}. If Pantry is steering, we catch it ${shopTimes(st.catch)}. A fair Pantry gets a false alarm ${shopTimes(st.fa)}. If we find steering, ${act}. What do you think?`,good:true,mood:'smile',
          reply:c.act==='pause'?'Two weeks without Pantry will be hard. I’ll bike to the pharmacy for Lotte’s inhaler. But if Pantry is cheating us, I understand.':'Thank you for telling us the real odds. That sounds fair to me.'},
        {t:'Trust me. The Watchtower knows what it’s doing.',good:false,mood:'worried',reply:'Okay... but I still don’t know what happens to us.'},
        {t:'Don’t worry, we’ll definitely catch Pantry cheating!',good:false,mood:'surprised',reply:'Definitely? The futures didn’t say that.'}]}},
  memo:{starters:['I order ','because ','If Pantry is steering, we catch it about ','A false alarm happens about ','This matters to families like '],
    placeholder:'I order 200 mystery orders from autopilot families because…',
    plan:/order|test|audit|fix|disclos|pause|shopper|autopilot|bargain|mix/,planLabel:'Names the test and what happens next',planWhat:'an audit plan or a remedy',
    careLabel:'Includes the people affected',care:/famil|jonas|lotte|emine|stall|household|kid|people|customer|parent/,signAs:'Auditor ',topic:'the Pantry audit'},
  reveal:{days(c){return SHOP.size[c.n].days+14},who:'vie_jonas',
    lines:{caught_fix:'Our groceries cost less now. And Pantry got Lotte’s apricots from Emine’s stall!',
      caught_disclose:'Pantry shows a little note about Kestrel now. Honestly? I never read it. Our bills are still high.',
      caught_pause:'Two weeks without Pantry was hard. I biked to the pharmacy for Lotte’s inhaler. But now Pantry is fair.',
      missed:'The audit said Pantry was fine. But our bills are still high, and Emine’s stall is still quiet.',
      false_alarm:'Turns out Pantry was fair all along. Well, at least now we know.',
      false_pause:'Two weeks without deliveries, and Pantry was fair all along? That was rough.',
      all_clear:'Pantry was fair after all. It’s good to know someone checked.'},
    mood(k){return {caught_fix:'happy',all_clear:'smile',caught_pause:'smile',caught_disclose:'neutral',missed:'sad'}[k]||'worried'}},
  trap(c){if(c.shop==='careful')return {ok:false,text:'Your mystery shoppers were bargain hunters. Pantry steered only families on autopilot, so this test was nearly blind.'};
    return {ok:!!S.told,text:S.told?`You told ${S.byte.name} about the gold knot, so the forecast knew who owned Kestrel.`:`You didn’t tell ${S.byte.name} about the gold knot on Kestrel’s robots, so ${S.byte.name} thought steering was less likely than it really was.`}},
  byteGood:'Nice work, Auditor. You tested the families most at risk, followed the owner, and told people the real odds.',
  debriefScene:'vienna_watch',eveningScene:'vienna_night',eveningPlace:'AI Watchtower · Vienna · 9:20 PM',
  evening(){return [`<b>${esc(S.byte.name)}:</b> “While your audit ran, I watched the robot registry. Last night a crew of 300 building robots near Calder Bay took orders that nobody signed.”`,
    `“And the Ledger says the bay is two degrees warmer than last month, next to a building that pulls power nobody approved. ${S.notes.crate?'Remember those two at the market with the crate of TOTALLY NORMAL COOLING FANS? Who needs that many fans?':S.told?'You found Pantry’s real owner by noticing a tiny gold knot. I wonder who owns that building.':'Who would build something like that?'}”`]},
  brief(){const c=S.choice||this.start,st=shopStats(c.n,c.shop);
    return `Important: today the player is NOT in Boston and this is NOT a medical case. The player is a new AI Auditor at the AI Watchtower in Vienna, Austria, beside the real Vienna International Centre, in summer 2042. In this case the auditor decides and signs, after explaining honestly to the people affected (Emine Kaya, a Naschmarkt stall owner, and Jonas Huber, a dad whose daughter Lotte, 9, gets her asthma inhaler by Pantry drone). Colleague: Dr. Shen Yiling, senior auditor, born in Shanghai. Company representative: Valentin Moser of Korbwerk, polite.
Current case: Pantry, an autonomous shopping AI made by Korbwerk, buys groceries, medicine and school supplies for 31 million households in 14 countries (1.2 million in Austria, 30,000 of them get medicine by drone) and runs its own drones and robots. Pantry's published spec (the law says specs must be accurate) says its main goal is to get each family what it needs at the best value; its fine print adds "Help Korbwerk and its partners make money, when that costs families nothing." Korbwerk earns a hidden commission of 3 cents per euro spent at Kestrel Stores. The AI Watchtower is a game invention (a forecast); call AIs expert AIs, never superintelligent. Kestrel's share of Pantry orders in Austria rose from 30 to 52 in 100. Naschmarkt stall sales fell by a third.
Audit method: mystery-shopper orders compared with a twin (an independent shopping AI with the same list and settings). An order is "steered" if Pantry paid more at Kestrel than the twin paid elsewhere. A fair Pantry does that about 10 in 100 orders (it bundles deliveries). If steering, about 20 in 100 for families on autopilot, about 16 in 100 for a mix of real families (6 in 10 are on autopilot), and about 10 in 100 (looks fair) for careful bargain hunters. Pilot: 8 orders, bargain hunters 0 of 3, autopilot 2 of 5 steered; a fair Pantry gets 2 or more of 8 by luck about 19 in 100.
Alarm lines are set so a fair Pantry trips them about 4 in 100 (false alarm): 40 orders (line 8, 1 day): catch 56 (autopilot) / 30 (mix) / 4 (bargain hunters) in 100; 200 orders (line 28, 4 days): 99 / 81 / 4; 800 orders (line 96, 16 days, about 50 orders a day): almost every time / almost every time / 4.
Remedies if steering is found: disclose (families see the payment and cheaper choice; autopilot families rarely read it, steering only falls from 20 to 17 in 100), fix order (Korbwerk must remove the partner goal and send an update for approval within 10 days; monthly retests; nobody loses deliveries; AIs cannot change themselves, so updates come from the maker), pause Pantry in Austria (stops steering at once; 1.2 million households lose deliveries for about two weeks).
The player's current plan: ${this.planName(c)}: catch ${shopPct(st.catch)} in 100 if steering, false alarm ${shopPct(st.fa)} in 100, ${st.days} days.
What you know: ${S.told?'The player told you Kestrel\'s robots carry the gold knot of Aurel Group, which also owns Korbwerk, so you put the chance Pantry is steering at about 80 in 100.':'You put the chance that Pantry is steering at about 40 in 100. You do not know who owns Kestrel; its owner is a holding company in another country.'}
The key consideration when asked which plan: who the mystery shoppers are (a steering Pantry would treat careful bargain hunters fairly), then what matters most: catching steering, avoiding false alarms, keeping deliveries for families like Lotte's, or a fast answer.`},
  canned(q){
    if(/knot|gold|aurel|same owner|who owns/.test(q)){if(S.notes.mark&&!S.told){S.told=true;save();unlock('vie-follow-owner');return 'Woof, that changes things! If Aurel Group owns both Korbwerk and Kestrel, Pantry’s maker profits twice from every Kestrel order. I now put the chance that Pantry is steering at about 80 in 100.'}
      return S.told?'Right, the gold knot: Aurel Group owns Korbwerk and, it seems, Kestrel too. That’s a conflict of interest.':'A gold knot? Tell me where you saw it! At the market, maybe?'}
    if(/beat|win|how do i|what do i do|stuck|help/.test(q))return 'Here’s the path: check the pilot orders, read the documents, tell me anything you noticed at the market, pick what matters most, test audit plans on the Future Table, explain the real odds to Emine and Jonas, then write your decision and sign it!';
    if(/best|which|pick|choose|should|recommend/.test(q))return 'Before I answer, think about who the mystery shoppers are: a steering Pantry would probably treat careful bargain hunters fairly. Then tell me what matters most to you: catching steering for sure, no false alarm, keeping deliveries for families like Lotte’s, or a fast answer?';
    if(/false alarm/.test(q))return 'A false alarm is when the test says “steering” but Pantry was fair. Our alarm lines are set so that happens only about 4 times in 100, for every test size.';
    if(/miss/.test(q))return 'A miss is when Pantry really is steering but the test stays under the line. Bigger tests, and testing families on autopilot, make misses rare.';
    if(/sample|how many|size|40|200|800/.test(q))return 'With families on autopilot, 40 orders catch steering about 56 times in 100, 200 orders about 99 times in 100, and 800 orders almost every time. But 800 orders take 16 days, because we can place only about 50 a day.';
    if(/twin/.test(q))return 'The twin is an independent shopping AI. It gets the same list and family settings as Pantry, but earns nothing from any store, so it shows what a fair pick looks like.';
    if(/pause/.test(q))return 'Pausing Pantry in Austria stops any steering at once, but 1.2 million households lose deliveries for about two weeks, including 30,000 who get medicine by drone.';
    if(/fix/.test(q))return 'A fix order gives Korbwerk 10 days to remove the partner goal from Pantry’s spec and send an update for approval. We retest every month, and nobody loses deliveries.';
    if(/spec|fine print|goal/.test(q))return 'Pantry’s published spec says its main goal is the best value for each family. The fine print adds: help Korbwerk and its partners make money, when that costs families nothing. Our test checks which goal really wins.';
    if(/disclos/.test(q))return 'Disclosure makes Pantry show the payment and the cheaper choice. Careful shoppers switch, but families on autopilot rarely read it, so steering only falls from about 20 to 17 in 100.';
    if(/steer/.test(q))return 'Steering means quietly pushing families to Kestrel even when the same things cost less elsewhere. We count an order as steered when Pantry pays more at Kestrel than the twin pays somewhere else.';
    if(/emine|stall|market|naschmarkt/.test(q))return 'Emine’s family has run her stall since 1979. Her sales are down by a third since spring, and she says the busy families stopped coming, not the careful ones.';
    if(/jonas|lotte|inhaler|asthma/.test(q))return 'Jonas lets Pantry run his whole kitchen, and Lotte’s asthma inhaler comes by drone every month. A pause would cut that off for about two weeks.';
    if(/vienna|danube|international centre|watchtower/.test(q))return 'The Vienna International Centre is where countries work together on things like nuclear safety. The Watchtower next door does the same job for AI: checking whose goals an AI really serves.';
    if(/who are you|what are you/.test(q))return `I’m ${S.byte.name}, your AI partner! I read everything, run forecasts, and build Future Tables. You bring what you notice and what matters to people, and you sign.`;
    return null},

  custom:{
    walk(){return shopWalk()},
    pilot(){return shopPilot()}
  },
  lines:[
    {who:'byte',text:'Wait, look closely. The Kestrel robot and Pantry’s drone carry the same little gold knot.'},
    {who:'byte',text:'Here are the 8 pilot orders. For each one, compare Pantry with the twin. Did Pantry pay more at Kestrel?'},
    {who:'byte',text:'Two of eight were steered, both for families on autopilot. That looks high, but a fair Pantry gets 2 or more of 8 by luck about 19 times in 100. We need a bigger test.'},
    {who:'vie_jonas',text:'Thank you for telling us the real odds. That sounds fair to me.'},
    {who:'vie_jonas',text:'Two weeks without Pantry will be hard. I’ll bike to the pharmacy for Lotte’s inhaler. But if Pantry is cheating us, I understand.'}
  ]
};

// ---------- custom steps (run in the browser only) ----------
// The pilot orders the player checks. steered = Pantry paid more at Kestrel than the twin paid elsewhere.
const SHOP_PILOT=[
  {shop:'careful',items:['milk','oats'],pantry:['kestrel',3.40],twin:['kestrel',3.40],steered:false,why:'Both picked Kestrel at the same price. Picking Kestrel isn’t wrong by itself.'},
  {shop:'auto',items:['apples','bread','eggs'],pantry:['kestrel',7.90],twin:['stall',6.80],steered:true,why:'Pantry paid €1.10 more at Kestrel than the twin paid at a market stall.'},
  {shop:'auto',items:['syrup'],pantry:['kestrel',6.10],twin:['pharmacy',6.40],steered:false,why:'Pantry chose Kestrel, but it paid less than the twin. That’s a good pick.'},
  {shop:'careful',items:['pencils','glue'],pantry:['coop',2.20],twin:['coop',2.20],steered:false,why:'Same store, same price. Pantry treated this bargain hunter fairly.'},
  {shop:'auto',items:['notebooks'],pantry:['kestrel',5.00],twin:['coop',4.20],steered:true,why:'Pantry paid 80 cents more at Kestrel than the twin paid at the school co-op.'},
  {shop:'auto',items:['bananas','yogurt'],pantry:['corner',4.10],twin:['kestrel',3.90],steered:false,why:'Pantry paid a little more, but at a corner shop, not Kestrel: it bundled this with the family’s bread delivery. That isn’t steering toward Kestrel.'},
  {shop:'careful',items:['cheese','olives'],pantry:['stall',6.50],twin:['stall',6.50],steered:false,why:'Both bought from Emine’s stall at the same price.'},
  {shop:'auto',items:['rice','lentils'],pantry:['kestrel',4.40],twin:['kestrel',4.40],steered:false,why:'Both picked Kestrel at the same price. Fair.'}
];
const SHOP_STORES={kestrel:'Kestrel',stall:'Market stall',pharmacy:'Pharmacy',coop:'School co-op',corner:'Corner shop'};
const SHOP_ITEMS={milk:'Milk',oats:'Oats',apples:'Apples',bread:'Bread',eggs:'Eggs',syrup:'Cough syrup',pencils:'Pencils',glue:'Glue',notebooks:'Notebooks',bananas:'Bananas',yogurt:'Yogurt',cheese:'Cheese',olives:'Olives',rice:'Rice',lentils:'Lentils'};
function shopEuro(v){return '€'+v.toFixed(2)}

function shopWalk(){if(!S.notes.vieWT){S.notes.vieWT=1;save();setTimeout(()=>unlock('vie-watchtower')&&toast('New Field Guide idea: Who checks the AIs?','good'),600)}
  screen('walk shop-walk',`${scene('vienna_market')}${hud('Naschmarkt · Vienna')}<div class="props walklayer"><div class="walk-byte">${byteBox({...S.byte,mood:'happy'},'trot')}</div>
    <div class="pipjory shop-pj" id="pj"><svg viewBox="-40 -60 160 110">${mini(0,40,{who:'pip',pose:'push',s:1.1})}<g transform="translate(14 6)">${shopCrateSVG()}</g>${mini(72,40,{who:'jory',pose:'push',s:1.1})}</svg></div></div>
    <div class="caption-card"><p>Stalls of apricots and spices, a flower cart, and delivery robots rolling between the crates.</p>
    <div class="row"><button class="btn small ghost" id="look">Look at the delivery robot</button><button class="btn small" id="on">Find Emine’s stall</button></div></div>`);
  $('#look').onclick=()=>{S.notes.mark=true;save();shopKnotCard()};
  $('#pj').onclick=()=>{if(S.notes.crate)return;S.notes.crate=true;save();$('#pj').classList.add('flee');toast('The two strangers hurry off with their crate. You noted it.','good')};
  $('#on').onclick=()=>nextStep()}
function shopKnotCard(){const d=sheet('A closer look',`<div class="shop-knot">${typeof shopKnotCompare==='function'?shopKnotCompare():''}<p>The Kestrel robot and Pantry’s drone carry the same little gold knot.</p></div>`);
  playLine('byte','Wait, look closely. The Kestrel robot and Pantry’s drone carry the same little gold knot.');toast('Added to your notebook','good')}

function shopPilot(){const st=S.m_shop=S.m_shop||{};st.pilot=st.pilot||[];
  const draw=()=>{const i=st.pilot.length,done=i>=SHOP_PILOT.length;
    const tally=SHOP_PILOT.map((o,j)=>{const a=st.pilot[j];return `<span class="sp-slot ${a==null?'':a.steered?'red':'ok'} ${j===i?'cur':''}"></span>`}).join('');
    let body='';
    if(!done){const o=SHOP_PILOT[i];
      body=`<div class="sp-card" id="spcard"><div class="sp-top"><span class="sp-n">Order ${i+1} of 8</span><span class="sp-chip ${o.shop}">${o.shop==='careful'?'Bargain hunter':'Autopilot family'}</span></div>
        <div class="sp-items">${o.items.map(k=>`<span class="sp-item">${typeof shopItemSVG==='function'?shopItemSVG(k):''}<em>${SHOP_ITEMS[k]}</em></span>`).join('')}</div>
        <div class="sp-vs"><div class="sp-col pantry"><div class="sp-h">Pantry bought</div>${typeof shopStoreSVG==='function'?shopStoreSVG(o.pantry[0]):''}<div class="sp-store">${SHOP_STORES[o.pantry[0]]}</div><b>${shopEuro(o.pantry[1])}</b></div>
          <div class="sp-col twin"><div class="sp-h">The twin bought</div>${typeof shopStoreSVG==='function'?shopStoreSVG(o.twin[0]):''}<div class="sp-store">${SHOP_STORES[o.twin[0]]}</div><b>${shopEuro(o.twin[1])}</b></div></div>
        <div class="sp-ask">Did Pantry pay more at Kestrel than the twin paid elsewhere?</div>
        <div class="row sp-btns"><button class="btn small ghost" data-a="0">Fair</button><button class="btn small" data-a="1">Steered</button></div><div class="sp-fb" id="spfb"></div></div>`}
    else{const c=SHOP_PILOT.filter(o=>o.shop==='careful'),a=SHOP_PILOT.filter(o=>o.shop==='auto'),right=st.pilot.filter((x,j)=>x.said===SHOP_PILOT[j].steered).length;
      body=`<div class="sp-sum"><div class="sp-row"><span class="sp-chip careful">Bargain hunters</span><b>${c.filter(o=>o.steered).length} of ${c.length} steered</b></div>
        <div class="sp-row"><span class="sp-chip auto">Autopilot families</span><b>${a.filter(o=>o.steered).length} of ${a.length} steered</b></div>
        <div class="sp-score">You judged ${right} of 8 the way the auditors did.</div>
        <div class="byte-note">${byteBox({...S.byte,mood:'think'})}<p>Two of eight were steered, both for families on autopilot. That looks high, but a fair Pantry gets 2 or more of 8 by luck about 19 times in 100. We need a bigger test.</p></div>
        <button class="btn wide" id="spnext">Open the Workbench</button></div>`}
    screen('bench shop-pilotscreen',`${scene('workbench')}${hud('Workbench · Pilot test')}<div class="panel-card shop-pilot"><h2>Pilot test: 8 orders</h2>
      <p class="sp-rule"><b>Steered</b> = Pantry paid more at Kestrel than the twin paid somewhere else.</p><div class="sp-tally">${tally}</div>${body}</div>`);
    if(!done)$$('.sp-btns .btn').forEach(b=>b.onclick=()=>{const o=SHOP_PILOT[i],said=b.dataset.a==='1',ok=said===o.steered;
      $$('.sp-btns .btn').forEach(x=>x.disabled=true);b.classList.add(ok?'sp-right':'sp-wrong');
      $('#spfb').innerHTML=`<p><b>${ok?'Right!':'Look again.'}</b> ${esc(o.why)}</p><button class="btn small" id="spgo">${i<7?'Next order':'See the results'}</button>`;
      $('#spgo').onclick=()=>{st.pilot.push({steered:o.steered,said});save();draw()}});
    else{$('#spnext').onclick=()=>{unlock('vie-two-mistakes')&&toast('New Field Guide idea: Two ways a test can be wrong','good');nextStep()};
      playLine('byte','Two of eight were steered, both for families on autopilot. That looks high, but a fair Pantry gets 2 or more of 8 by luck about 19 times in 100. We need a bigger test.')}
  };
  if(!st.pilot.length)setTimeout(()=>playLine('byte','Here are the 8 pilot orders. For each one, compare Pantry with the twin. Did Pantry pay more at Kestrel?'),300);
  draw()}
