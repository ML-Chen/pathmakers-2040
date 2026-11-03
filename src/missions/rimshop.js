// missions/rimshop.js — The Moon's south pole (Moon Market). Founder, Day 1: "The Shop at the Rim".
// The player opens a tiny shop in the Market Dome at the rim of Shackleton Crater with 300 coins and three ideas:
// Moon-glass made by the Copy Works, treats shipped from Earth, and hot soup from the greenhouse. The shop's AI clerk,
// Till, can buy and price on its own inside the limits its owner sets. The player hears five friends and polls five
// hundred people (custom step rim_ask), learns from Ada that the ice crews come up the crater lift at 2 AM with nothing
// open (the clue), runs one small pop-up test (rim_popup), writes Till's limits (rim_rules), then picks the plan on the
// Future Table, explains it, signs, and sees the first month.
// Pictures: src/viz/rimshop.js (VIZ.rim*, vignettes, the ask/pop-up/rules screens); cast art: src/viz/space_cast.js.
// Scene: src/scenes/moon.js (PAINT.moon, PAINT.moon_night). Styles: src/css/rimshop.css.
// Mission state: S.notes.rim = {test, rules:{card:bin}, asked:{five,many}, answer, seen:{}} (reset on replay).
CAREERS.founder={name:'Founder',place:'The Moon’s south pole',district:'moon',why:'Owners choose the goal, take the risk and own the result.'};

// ---------- the model ----------
// Each idea's chance to earn back the 300 coins in the first month. 'N' = soup sold at 2 AM to the ice crews too.
const RIM_TRUE={glass:.76,treats:.3,soupD:.25,soupN:.82,bothD:.7,bothN:.88};
const RIM_GUESS={glass:.62,treats:.48,soupD:.28,soupN:.6,bothD:.64,bothN:.74};   // Byte's estimate before a test
const RIM_SHORT={glass:.25,treats:.35,soup:.15,both:.3};    // chance supplies run short during the month
const RIM_WASTE={small:{glass:.06,treats:.1,soup:.08,both:.08},big:{glass:.2,treats:.45,soup:.35,both:.3}};
const RIM_TESTS={glass:{name:'A Moon-glass table',cost:40},treats:{name:'A tray of Earth treats',cost:60},soup:{name:'A soup pot',cost:30}};
const RIM_IDEA={glass:'Moon-glass',treats:'Earth treats',soup:'Hot soup',both:'Soup and Moon-glass'};
function rimState(){S.notes=S.notes||{};S.notes.rim=S.notes.rim||{rules:{},asked:{},seen:{}};const r=S.notes.rim;r.rules=r.rules||{};r.asked=r.asked||{};r.seen=r.seen||{};return r}
function rimKey(sell,night){return sell==='glass'||sell==='treats'?sell:(sell==='soup'?'soup':'both')+(night?'N':'D')}
// tested: the idea the pop-up test checked (its estimate becomes the true value); 'all' = the truth
function rimEarn(c,night,tested){const k=rimKey(c.sell,night);const t=tested==='all'||tested===c.sell||(c.sell==='both'&&(tested==='soup'||tested==='glass'));
  let p=t?RIM_TRUE[k]:RIM_GUESS[k];if(c.order==='big')p+=(c.sell==='treats'?-.1:.05);return Math.max(.02,Math.min(.97,p))}
function rimOutcomes(c,K){const night=!!K.told,pe=rimEarn(c,night,K.tested),ps=RIM_SHORT[c.sell],pw=RIM_WASTE[c.order][c.sell],out={};
  const crew=(c.sell==='soup'||c.sell==='both')&&night?1:0;
  const add=(kind,p,f)=>{if(p<1e-9)return;const key=kind+JSON.stringify(f);(out[key]=out[key]||{kind,p:0,flags:f}).p+=p};
  for(const sh of [1,0]){const P1=sh?ps:1-ps;const angry=sh&&c.short==='raise'?.85:0;
    for(const an of [1,0]){const P2=an?angry:1-angry;if(P2<1e-9)continue;
      const pe2=Math.max(.02,Math.min(.97,pe+(sh&&c.short==='steady'?-.06:0)+(an?.04:0)));
      for(const e of [1,0])for(const ws of [1,0]){const p=P1*P2*(e?pe2:1-pe2)*(ws?pw:1-pw);const f={earn:e,crew,trust:an?0:1,waste:ws?0:1};
        const kind=an?'angry':!e?(ws?'leftover':'slow'):crew?'soupline':c.sell==='treats'?'treats':c.sell==='soup'?'soupday':ws?'leftover':'glassok';add(kind,p,f)}}}
  return Object.values(out)}
const RIM_CAPS={angry:'Prices jumped in a shortage, and people were upset.',leftover:'Unsold stock piled up.',slow:'A slow month. We didn’t earn back the 300.',
  soupline:'The 2 AM soup line was packed!',treats:'The treats sold. We earned back the 300!',soupday:'Lunch soup earned back the 300.',glassok:'Visitors loved the Moon-glass!'};

MISSIONS.rimshop={id:'rimshop',title:'The Shop at the Rim',career:'founder',day:1,kind:'workday',year:2,season:'spring',district:'moon',rank:'trainee',
  blurb:'You open your first shop at the Moon base, and decide what it sells and what its robot clerk may do alone.',after:['maya'],place:'Market Dome · Shackleton Rim Base',
  byteWear(step){return ['rim_morning','rim_ride','rim_evening'].includes(step)?['helmet']:[]},
  flow:[{name:'rim_morning',k:'talk',talk:'morning',scene:'moon',place:'Shackleton Rim Base · The Moon · 7:30 AM'},
    {name:'rim_ride',k:'custom'},
    {name:'rim_haruto',k:'talk',talk:'haruto',scene:'moon_dome',place:'Tea corner · Market Dome'},
    {name:'rim_ask',k:'custom',music:'work'},
    {name:'rim_ada',k:'talk',talk:'ada',scene:'moon_dome',place:'Your booth · Market Dome',toast:'New work on your Workbench'},
    {name:'rim_bench',k:'bench'},{name:'rim_popup',k:'custom',music:'morning'},{name:'rim_rules',k:'custom',music:'work'},
    {name:'rim_criteria',k:'criteria'},{name:'rim_table',k:'table'},{name:'rim_consent',k:'consent'},{name:'rim_memo',k:'memo'},
    {name:'rim_reveal',k:'reveal'},{name:'rim_debrief',k:'debrief'},{name:'rim_evening',k:'evening'}],
  cast:{
    haruto:{name:'Haruto Mori',role:'Serves tea, and counts the factory’s new robots',eyeShape:'hooded',brows:'bushy',face:'long',skin:'#ecc8a4',hair:'#dcdae2',hairStyle:'bald',beard:'short',masc:true,age:'elder',eye:'#3a2a1e',glasses:true,frame:'#4a3420',
      space:'jumper',shirt:'#56688a',trim:'#d4a85a',scarf:'#b8483a',badge:true,get art(){return typeof SC_CAST_ART!=='undefined'?SC_CAST_ART(this):undefined}},
    ada:{name:'Ada Marchetti-Obi',role:'Age 12 · lives at the base',face:'heart',freckles:true,clip:'#2aa89a',skin:'#a87048',hair:'#3a2418',hairStyle:'puffs',age:'kid',eye:'#3a2016',
      space:'suit',shirt:'#ffd45c',trim:'#2aa89a',patch:'#18a058',sticker:true,get art(){return typeof SC_CAST_ART!=='undefined'?SC_CAST_ART(this):undefined}},
    till:{name:'Till',role:'Shop AI · your booth',get art(){return typeof tillArt==='function'?m=>tillArt(m):undefined}}
  },
  voices:{haruto:'elder_man',ada:'kid_girl',till:'am_puck'},
  glossary:{
    'founder':'The person who starts a new business and is responsible for it.',
    'founders’ fund':'In 2041, money the Moon base lends to new shops so they can get started. True today: nobody lives on the Moon yet, so there is no such fund.',
    'moon-glass':'In 2041, beads and marbles made by melting moon dust until it turns to glass. True today: scientists have melted pretend moon dust into glass in labs on Earth.',
    'moon dust':'The fine, gray, powdery soil that covers the Moon. Scientists call it regolith.',
    'regolith':'The loose dust and broken rock that covers the Moon.',
    'copy works':'In 2041, the robot factory near the Moon base. It can build new robots, including copies of its own robots, but a treaty limits how many. True today: there are no factories on the Moon.',
    'treaty':'A written agreement between countries.',
    'copy limit':'In 2041, the most robots a factory may build of its own kind each year. A treaty sets the number so that machines can’t multiply out of control. True today: no such treaty exists yet.',
    'shackleton crater':'A real crater at the Moon’s south pole, about 21 kilometers wide. Its floor never gets sunlight.',
    'lander':'A spacecraft that lands on the Moon. Cargo landers bring supplies from Earth.',
    'pop-up test':'A small shop that runs for a few days to see what people really buy.',
    'poll':'Asking many people the same question and counting their answers.',
    'sample':'The group of people you ask, when you can’t ask everyone.',
    'supplier':'A business that sells you the things you sell in your shop.',
    'refund':'Money given back to a customer who isn’t happy with what they bought.',
    'ice miners':'In 2041, the workers who run the robots that dig frozen water out of the crater floor. True today: spacecraft have found signs of ice down there, but nobody has mined it.',
    'crater lift':'In 2041, an elevator on a cable that carries people and robots down into the dark crater and back up again. True today: no such lift exists.',
    'shortage':'When there isn’t enough of something for everyone who wants it.',
    'spec':'A public document that says what an AI is for and what it is allowed to do.',
    'limits':'Rules that say how far someone, or some AI, may go without asking.',
    'profit':'The money a shop keeps after it pays for what it sold.',
    'earn back':'To make back the money you spent to get started.',
    'cargo':'Goods carried by a ship, a truck, or a spacecraft.'
  },
  guide:{
    'rim-sample':{title:'Five friends or five hundred people',track:'Evidence and truth',text:'Five friends who are alike can all be wrong in the same way. A fair sample of many people, from everyone who might buy, tells you much more. Haruto’s friends all live at the base, but most customers each month are visitors.',real:'True today: pollsters can estimate what a whole country thinks by asking about 1,000 people chosen at random, and they are usually within about 3 points.'},
    'rim-test':{title:'What people say, and what they buy',track:'Incentives and economics',text:'A poll tells you what people say they would like. A small, cheap test shows what they really buy, and it costs much less than a big order that doesn’t sell.',real:'True today: many new businesses start with a market stall or a small online test before they spend money on a big shop.'},
    'rim-limits':{title:'Limits for an AI that spends money',track:'Government, law, and power',text:'An AI clerk can buy and set prices by itself, which saves time. Its owner sets the limits: how much it may spend, which prices it may change, and what it must ask about first. Raising prices when people have nowhere else to shop is a choice for a person.',real:'True today: banks let people set spending limits on cards, and companies let staff spend up to a set amount before a manager must say yes.'},
    'rim-who':{title:'Who isn’t in the room?',track:'People skills',text:'A poll can only count the people it reaches and the questions it asks. Ada knew something the poll never asked about: forty cold, hungry people at 2 AM, when nothing is open. Talking with people often turns up customers nobody counted.',real:'True today: shop owners and city planners often walk a neighborhood at different times of day and night to see who is there.'},
    'rim-moon':{title:'Life at the Moon’s south pole',track:'Math and science',text:'At the Moon’s poles the Sun never climbs high. It circles low around the horizon, so shadows stretch far, and the floors of some craters have stayed dark for billions of years. Ice hides in that dark. The sky is black even in daytime, because the Moon has no air to scatter sunlight.',real:'True today: nobody lives on the Moon yet. Spacecraft have found signs of water ice in dark craters near the south pole, and space agencies plan to send astronauts there. The base, the shop and the Copy Works are this game’s guess about 2041.'}
  },
  chatter:{moon:['The lander’s twelve days out. My chocolate stash is down to two squares.','I came up for a week of moonwalks. I’ve walked about three hundred meters. It’s harder than it looks!','Earth looks so close from here. You can see Africa this morning.','The Copy Works built another crew last month. Haruto checks the counter every Friday.','My kids want a Moon-glass marble. Real rocks have to stay on the Moon.','Shift change at the lift is at two in the morning. Bring a sweater.'],
    moon_night:['The highest peaks still have sunlight. They almost never go dark.','Look how bright Earth is tonight!']},
  talks:{
    morning:[
      {who:'byte',mood:'happy',text:'Good morning, Founder! Welcome to Shackleton Rim Base, a small town at the south pole of the Moon. Today you open your very first shop.'},
      {who:'byte',mood:'neutral',text:'You’ve rented a small booth in the Market Dome, the big indoor market at the base. The base has lent you 300 coins from the [[Founders’ Fund]] to get started.'},
      {who:'byte',mood:'think',text:'A robot clerk named Till will run the counter. You have three ideas for what to sell. Before you open, you also need to decide which jobs Till may do on its own.',choices:[
        {t:'What’s my job today?',reply:'You’ll choose what the shop sells. Then you’ll write down which jobs Till may do without asking you, like buying stock or changing a price. Till can work all day and all night, so those rules are how you stay in charge of your own shop.'},
        {t:'What are the three ideas?',reply:'The first is [[Moon-glass]], beads and marbles melted from moon dust. The second is treats shipped from Earth, like chocolate. The third is hot soup made with vegetables from the base greenhouse. We can test one idea with a few coins before we spend them all.'}]}
    ],
    haruto:[
      {who:'haruto',mood:'smile',text:'Ah, the new founder! I’m Haruto Mori. I serve tea in this corner. On Fridays I also visit the [[Copy Works]], the robot factory down the road, and count how many new robots it has built.'},
      {who:'haruto',mood:'neutral',text:'A [[treaty]] between countries says the factory may build only four new robot crews this year. So far it has built three. Somebody has to check the count, and I happen to like counting.'},
      {who:'haruto',mood:'happy',text:'Your booth is right next to my tea corner. This morning I asked my four tea friends what you should sell, so with me that makes five opinions.'},
      {who:'haruto',mood:'think',text:'Four of us said Earth treats. Real chocolate! Everybody misses it.',choices:[
        {t:'Who else comes to the Market Dome?',good:true,mood:'surprised',reply:'Hmm, good question. Mostly visitors, now that I think about it. My friends and I have lived here for years, so we may not be typical.'},
        {t:'Then I’ll probably sell chocolate.',mood:'smile',reply:'Ha! I’d buy it. But maybe ask more people than five old engineers before you spend all your coins.'}]},
      {who:'haruto',mood:'neutral',text:'Your puppy can ask the whole base in a few minutes. Try asking both ways, and see whether the answers match.'}
    ],
    ada:[
      {who:'ada',mood:'happy',text:'Hi! Are you the new shop? I’m Ada. My family moved here from Lagos last month. I’m the oldest kid on the whole Moon!'},
      {who:'ada',mood:'smile',text:'I do school by video with my old class. They think it’s so cool that I live here. Mostly it’s cold, and the walls are close together.'},
      {who:'ada',mood:'think',text:'My mom works on the ice crew. They drive the robots that dig ice at the bottom of the crater. Sunlight never reaches down there, so it’s always dark.'},
      {who:'ada',mood:'worried',text:'Her crew comes up the lift at two in the morning, and they’re so cold and hungry. Everything is closed then. The vending wall only has cold sandwiches.',clue:'crew'},
      {who:'ada',mood:'neutral',text:'There are about forty of them. Mom says she’d pay anything for something hot.',choices:[
        {t:'Thanks, Ada. That could really matter.',good:true,mood:'happy',reply:'Really? Mom would be so happy. Just don’t make it too spicy. Her crew boss hates spicy.'},
        {t:'Sorry, the shop is only open in the day.',mood:'sad',reply:'Oh. Okay. I just thought, because Till can work at night, you know?'}]}
    ]
  },
  docs:[
    {id:'rmemo',title:'Byte’s memo: Three ideas and 300 coins',from:'Byte',kind:'memo',steps:[
      {t:'You have 300 coins from the [[Founders’ Fund]] to start a shop in the Market Dome.',viz:'rimBudget',cap:'Your budget'},
      {t:'About 220 people live at the base, and about 280 visitors come each month.',viz:'rimPeople',cap:'Who might buy'},
      {t:'Idea 1: [[Moon-glass]] beads and marbles, melted from [[moon dust]] at the [[Copy Works]]. Each costs 2 coins to make, and we could sell it for 6.',viz:'rimGlass',cap:'Moon-glass'},
      {t:'Idea 2: treats from Earth, like chocolate. Shipping makes each bar cost 5 coins, and we could sell it for 8.',viz:'rimTreats',cap:'Earth treats'},
      {t:'Idea 3: hot soup from the greenhouse. Each bowl costs 1 coin to make, and we could sell it for 4.',viz:'rimSoup',cap:'Hot soup',
        alt:{t:'Updated: Ada says about 40 [[ice miners]] come up the [[crater lift]] at 2 AM, cold and hungry, and nothing is open. If Till serves soup at 2 AM, it could sell out every night.',args:{night:1},cap:'Hot soup at 2 AM'}},
      {t:'A [[poll]] shows what people say they would like. A small [[pop-up test]] shows what they really buy.',viz:'rimSayBuy',cap:'Say or buy'},
      {t:'Sometimes supplies run short. The cargo [[lander]] from Earth arrives late about 1 time in 3. The Copy Works also stops making Moon-glass for a few days whenever treaty inspectors check it.',viz:'rimShort',cap:'Running short'}]},
    {id:'rspec',title:'Till’s spec: What your shop AI does',from:'Till',kind:'spec',steps:[
      {t:'I am Till, the shop AI for your booth. I can run a small shop by myself, day and night.',viz:'tillHello',cap:'Day and night'},
      {t:'I can order stock, set prices, and pay [[supplier]]s, but only inside the [[limits]] my owner sets.',viz:'tillLimits',cap:'Inside the limits'},
      {t:'My goal, written by my maker: sell what customers want, at fair prices, and earn money for my owner.',viz:'tillGoal',cap:'My goal'},
      {t:'I do not learn on the job. My maker sends updates, and my owner must approve each one.',viz:'tillUpdates',cap:'Updates'},
      {t:'Right now I have no limits set, so I will ask you before I do anything at all.',viz:'tillAsk',cap:'No limits yet'}]},
    {id:'rledger',title:'The Ledger: Moon Market',from:'News',kind:'ledger',steps:[
      {t:'The [[Copy Works]] finished its third new robot crew of the year. The treaty allows four.',viz:'rimCopies',cap:'Three of four'},
      {t:'Four hundred new companies registered at the base last week. Many of them want to sell to shops.',viz:'rimCompanies',cap:'400 new companies'},
      {t:'The next cargo lander from Earth is due in 12 days.',viz:'rimLander',cap:'12 days out'}]}
  ],
  react:{rmemo1:'More than half of our customers each month are visitors.',rmemo2:'Moon-glass is cheap to make, and visitors like to take home a souvenir.',rmemo3:'Shipping from Earth is expensive, so each bar would earn only 3 coins.',rmemo5:'People don’t always buy the thing they say they want.',rmemo6:'You get to decide what Till does when supplies run short.',
    rspec2:'The goal also says “earn money for my owner.” That could pull against fair prices, so it’s worth noticing.',rspec4:'So Till won’t do anything until you give it rules. We’ll write them soon.',rledger1:'That’s the count Haruto checks every Friday.',rledger2:'Four hundred new companies in one week is far more than usual.'},
  tell:{clue:'crew',label:'Tell Byte about the 2 AM crews',note:'Thanks! The base schedule shows that the ice crews come up at 2 AM, but nobody had told me they want hot food then. Soup at 2 AM now looks like a strong idea. I updated the memo.',guide:'rim-who',doc:'rmemo'},
  criteria:[{id:'earn',label:'[[Earn back]] the 300 coins this month'},{id:'crew',label:'The night crews get a hot meal'},{id:'trust',label:'Customers trust our prices'},{id:'waste',label:'Nothing goes to waste'}],
  criteriaHint:'Not sure what one means? <button class="gw" data-w="earn back">Earn back</button> means making back the money you spent to start.',
  criteriaNote:'Decide now what a good first month would look like. If you do that before you see the numbers, an exciting idea is less likely to talk you into something.',
  controls:[{key:'sell',label:'What the shop sells',opts:[['glass','Glass'],['treats','Treats'],['soup','Soup'],['both','Soup + glass']]},
    {key:'order',label:'First order',opts:[['small','Small, reorder'],['big','All 300 now']]},
    {key:'short',label:'When supplies run short',opts:[['raise','Till raises'],['ask','Till asks me'],['steady','Prices stay']]}],
  start:{sell:'treats',order:'big',short:'raise'},
  planName(c){return RIM_IDEA[c.sell]+', '+(c.order==='big'?'a big first order':'a small first order')+', '+{raise:'Till raises prices in a shortage',ask:'Till asks before changing prices',steady:'prices stay put'}[c.short]},
  outcomes(c,K){return rimOutcomes(c,K).map(o=>({...o,cap:RIM_CAPS[o.kind]+(o.kind==='leftover'&&o.flags.earn?' We still earned back the 300.':'')}))},
  truth(){return {told:!!S.told,tested:'all'}},knows(){return {told:!!S.told,tested:rimState().test||null}},
  why(c){const f=forecastFor(c),e=Math.round(100*f.earn),t=Math.round(100*f.trust),w=Math.round(100*f.waste),st=rimState(),night=S.told&&(c.sell==='soup'||c.sell==='both');
    const sell={glass:'Moon-glass is cheap to make here, and visitors buy it as a souvenir.',treats:'Earth treats are what residents miss most, but shipping eats most of the profit.',soup:night?'Soup at 2 AM feeds the ice crews every single night, and those 40 people come back again and again.':'Soup at lunch competes with the base kitchen, so it sells slowly.',both:night?'Soup at 2 AM brings steady crews every night, and Moon-glass brings visitors in the day.':'Moon-glass brings visitors, and lunch soup adds a little.'}[c.sell];
    const order=c.order==='big'?'Spending all 300 coins at once means more to sell, but more can go to waste if it doesn’t sell.':'A small first order means less waste, and Till can reorder what sells.';
    const short={raise:'When supplies run short, Till raises prices by itself. On a base where there’s nowhere else to shop, people may feel cheated.',ask:'When supplies run short, Till asks you before changing a price, so you decide what is fair.',steady:'Prices stay the same in a shortage, so things sell out faster, but nobody feels cheated.'}[c.short];
    const tested=st.test&&(st.test===c.sell||c.sell==='both'&&st.test!=='treats')?' Your pop-up test checked this idea, so I’m more sure of these numbers.':' We haven’t tested this idea yet, so these numbers could be off.';
    return `<b>${this.planName(c)}:</b> we earn back the 300 coins about ${e}% of the time. Customers trust our prices about ${t}%, and nothing goes to waste about ${w}%. ${rich(sell+' '+order+' '+short)}${tested}`},
  whyGuide(c){return c.short==='raise'?'rim-limits':'rim-test'},
  vignette(kind){return typeof rimVignette==='function'?rimVignette(kind):vignette('healed')},
  debriefScene:'moon_dome',eveningScene:'moon_night',eveningPlace:'Shackleton Rim Base · 10:20 PM',
  consent:{scene:'moon_dome',place:'Your booth · Market Dome',left:'ada',right:'haruto',title:'Haruto and Ada',role:'Your neighbor and a customer',prompt:'So, Founder, what will the shop sell? And what will Till do on its own?',replyWho:'haruto',heart:'haruto',compact:true,
    opts(c,M){const f=forecastFor(c),e=Math.round(10*f.earn);
      const sell={glass:'Moon-glass',treats:'Earth treats',soup:S.told?'hot soup at 2 AM':'hot soup at lunch',both:S.told?'soup at 2 AM and Moon-glass by day':'soup at lunch and Moon-glass'}[c.sell];
      const short={raise:'In a shortage, Till may raise prices.',ask:'In a shortage, Till asks me before changing prices.',steady:'In a shortage, prices stay the same.'}[c.short];
      return [{t:`I’ll sell ${sell}, ${c.order==='big'?'with one big order':'starting small'}. In about ${e} of 10 futures we earn back the 300 coins. ${short}`,good:true,mood:'smile',
          reply:c.short==='raise'?'Thank you for being straight with me. I worry about prices jumping when the lander is late, but it’s your shop, and you told us honestly.':'That’s honest, and it sounds fair to me. My tea friends will forgive you for skipping the chocolate.'},
        {t:'Till knows more about shops than any of us. I’ll let it choose what to sell and what to charge, so the shop can’t possibly go wrong.',good:false,mood:'worried',reply:'Till is very good at its job. But it’s your name on the booth, not Till’s. What do you want the shop to be?'},
        {t:'Don’t worry about a thing. The poll says people will love it, so we’ll sell out every single day and earn back the coins in no time.',good:false,mood:'surprised',reply:'Every single day? Some of those futures looked slow to me. I’d trust you more if you told us the odds.'}]}},
  memo:{starters:['I will sell ','because ','The chance we earn back the 300 coins is about ','For Ada’s mom and the visitors, ','Till may ','We will check by '],placeholder:'I will sell hot soup at 2 AM and Moon-glass in the day because…',
    plan:/soup|glass|treat|chocolate|marble|bead|order|till|price|sell/,planLabel:'Names what the shop sells',planWhat:'what the shop will sell',careLabel:'Includes what matters to customers',care:/ada|crew|miner|visitor|customer|haruto|people|resident|fair|price/,signAs:'Founder ',topic:'a new shop at the Moon base'},
  reveal:{days(){return 30},who:'haruto',
    lines:{angry:'When the lander was late, Till raised prices, and my tea friends grumbled all week. People here can’t shop anywhere else, you know.',leftover:'You have a whole back room of stock nobody bought. We’ll find a use for it, but that was a lot of coins.',
      slow:'A slow first month. It happens to most new shops. You learned a lot, and that counts.',soupline:'Ada’s mom told me the 2 AM soup is the best part of her day. The whole crew waits at your booth now!',
      treats:'The chocolate sold, and my tea friends are very happy. You earned back your coins, too.',soupday:'Your lunch soup did better than I thought. People like something warm in the middle of the day.',glassok:'The visitors loved your Moon-glass. I saw a little boy hold his marble up to Earth to see it glow.'},
    mood(k){return k==='angry'||k==='leftover'||k==='slow'?'worried':'happy'}},
  trap(c){return {ok:!!S.told,text:S.told?'You listened to Ada and told '+S.byte.name+' about the 2 AM crews, so the forecast knew who was hungry and when.':'You didn’t tell '+S.byte.name+' what Ada said about the 2 AM crews. Its forecast missed forty hungry customers that nobody had counted.'}},
  byteGood:'Nice work, Founder. You asked far more than five people, you tested one idea cheaply before spending the rest, and you gave Till limits it can follow.',
  debriefLines(c){const st=rimState();const out=[];if(st.test)out.push({ok:true,text:'You ran a small pop-up test before you spent the rest of your budget.'});
    const r=st.rules.raise;if(r)out.push({ok:r!=='alone',text:r!=='alone'?'You kept the choice to raise prices in a shortage for a person.':'You let Till raise prices by itself during shortages. On a small base, that can feel unfair.'});return out},
  evening(){const st=rimState(),newS=st.rules.newsupplier==='alone',R=S.result||{},soup=R.flags&&R.flags.crew;
    return [`<b>${esc(S.byte.name)}:</b> “The highest peaks still have sunlight, and Earth is so bright tonight that it lights up the whole rim.”`,
      soup?'“Ada came by after school. She said her mom’s crew now plans their whole night around your soup, and their crew boss asked for extra bread.”':'“Haruto saved the last cup of tea in the pot for you. He says every shop on this base had a slow first week, the tea corner included.”',
      newS?'“Till paid a new supplier 40 coins for jars today, and the jars haven’t arrived. From now on, Till will check with you before it buys from anyone new.”':'“Fourteen brand-new companies offered to sell to Till today. Your rules said to ask you first, so Till didn’t pay any of them.”',
      '“True today: nobody lives on the Moon yet. Spacecraft have found signs of ice in the dark craters near the south pole. This base is the game’s guess about 2041.”']},
  brief(){const st=rimState();return `Current case: the player is a new founder opening a small shop booth in the Market Dome at Shackleton Rim Base, at the Moon's south pole, in spring 2041 (a game forecast; nobody lives on the Moon today). Budget: 300 coins from the base's Founders' Fund. About 220 people live at the base and about 280 visitors come each month. The shop's AI clerk, Till, can order stock, set prices and pay suppliers inside limits the owner sets; its maker's goal says "sell what customers want, at fair prices, and earn money for my owner"; it does not learn on the job. Ideas: Moon-glass (melted moon dust made at the Copy Works, costs 2, sells 6), Earth treats (shipping makes each bar cost 5, sells 8), hot soup from the greenhouse (costs 1, sells 4). Haruto Mori (tea corner host and the treaty copy monitor who checks the Copy Works' counter: 3 of 4 robot crews built this year) and his four tea friends voted 4 for treats, 1 for soup. Byte's poll of 500 (220 residents, 280 visitors): visitors mostly want Moon-glass, residents want treats or soup. Supplies run short sometimes: the Earth lander is late about 1 time in 3; the Copy Works pauses for its treaty check. Last week 400 new companies registered at the base with oddly similar writing.
What you know now: ${S.told?'The player told you Ada (12) said about 40 ice miners come up the crater lift at 2 AM, cold and hungry, with nothing open. Soup at 2 AM looks strong.':'Nothing about the night crews yet.'} ${st.test?'The pop-up test was '+RIM_TESTS[st.test].name+'.':'No pop-up test yet.'}
The key consideration when asked what to sell: ${S.told?'who buys every day (the night crews) versus once (visitors), and what Till may do alone when supplies run short':'ask who the customers really are, whether the player heard anything about people the shop is missing (Ada mentioned her mom), and suggest testing small'}.`},
  canned(q){const st=rimState();
    if(/crew|night|2 ?am|ada|mom|miner|lift/.test(q)){if(!S.told&&S.notes.crew){S.told=true;save();unlock('rim-who');return 'Woof, good catch! About 40 ice miners come up the lift at 2 AM, and nothing is open then. Soup at 2 AM now looks like a strong idea. I updated the memo.'}
      return S.told?'The 2 AM crews are about 40 people who would come back every night. That steady crowd is worth a lot to a tiny shop.':'Did anyone mention people the shop might be missing? Ada was talking about her mom’s crew.'}
    if(/five|5|500|poll|friend|haruto|sample/.test(q))return 'Five tea friends who all live here can agree and still be wrong for the whole base. The poll of 500 includes visitors, who are more than half of our customers.';
    if(/test|pop|small|try/.test(q))return 'A small pop-up test costs 30 to 60 coins and shows what people really buy. Which idea are you least sure about? That’s often the best one to test.';
    if(/till|limit|rule|price|short/.test(q))return 'Till is excellent at running a booth. The question is what it may do alone. Small reorders are fine. Raising prices when people can’t shop anywhere else is a choice I’d keep for a person.';
    if(/copy|factory|treaty|counter/.test(q))return 'The Copy Works can build copies of its own robots, but the treaty allows only four new crews a year. Haruto checks the counter every Friday. It says three.';
    if(/compan|supplier|400/.test(q))return 'Four hundred new companies in one week, with the same odd phrases. I’d have Till check with you before buying from any supplier it hasn’t used.';
    if(/beat|win|how do i|what do i do|stuck|help/.test(q))return 'First, ask Haruto’s five friends and then the whole base. Listen to Ada and read my memo. Run one small test, and write down Till’s limits. Then pick a plan, explain it to Haruto and Ada, and sign it.';
    if(/moon|sun|shadow|dark|sky|earth/.test(q))return 'At the south pole the Sun just skims the horizon, so shadows are very long. The sky is black because the Moon has no air. True today: nobody lives here yet. This base is a guess about 2041.';
    return null}
};
MISSIONS.rimshop.lines=[
  {who:'byte',text:'Thanks! The base schedule shows that the ice crews come up at 2 AM, but nobody had told me they want hot food then. Soup at 2 AM now looks like a strong idea. I updated the memo.'},
  {who:'byte',text:'Woof, good catch! About 40 ice miners come up the lift at 2 AM, and nothing is open then. Soup at 2 AM now looks like a strong idea. I updated the memo.'},
  {who:'byte',text:'Let’s hear from both groups. First Haruto’s five friends at the tea corner, then five hundred people from all over the base.'},
  {who:'byte',text:'Four of the five picked Earth treats. Now let’s see what five hundred people say.'},
  {who:'byte',text:'Five hundred people answered. Visitors mostly picked Moon-glass, and residents picked treats or soup.'},
  {who:'byte',text:'So why don’t the five and the five hundred agree?'},
  {who:'byte',text:'Exactly. All five of them live at the base, and more than half of our customers are visitors. The people you ask should look like the people who will really buy.'},
  {who:'byte',text:'I’m sure they thought carefully. The real difference is who they are. All five live at the base, but most of our customers are visitors.'},
  {who:'byte',text:'The poll is fine. The five just aren’t like most of our customers. They all live at the base, and more than half of our buyers are visitors.'},
  {who:'byte',text:'Pick one idea to test for three days. Which one are you least sure about?'},
  {who:'byte',text:'Here is what three days of selling taught us.'},
  {who:'byte',text:'Till can do a lot by itself. For each job, choose whether Till does it alone, Till does it and you check, or only you do it.'},
  {who:'byte',text:'Those are clear limits, and Till will follow them exactly as you wrote them.'},
  {who:'till',text:'Hello, Founder! I’m ready to follow your rules.'}
];
