// lot.js — Phoenix, Community Architect, Day 1: "The Flood Lot".
// A corner lot in Arcadia floods every monsoon. Mrs. Okafor (79, walker) wants shade and a seat; Dev (15) wants a deep skate
// bowl; Marco Ruiz (city stormwater) wants the street's water held and Arroyo, the stormwater AI, to call him first.
// Hidden clue: the neighbors' own irrigation ditch under the alley spills onto the lot when a storm hits on a water night.
// It is on no city map. Mechanics: a field survey (tap to notice), choosing what to make, commissioning designs from Byte
// (src/missions/commission.js), the tinker Future Table, and night orders for the robot crew and Arroyo.
// Pictures live in src/viz/lot.js, scenes in src/scenes/phx_lot.js and src/scenes/phx_studio.js, styles in src/css/lot.css.
CAREERS.architect={name:'Community Architect',place:'Phoenix, Arizona',district:'phoenix',
  why:'Robot crews can build almost anything overnight, so a named person must find out what neighbors need and sign for its safety.'};

// ---------- the flood model (one source for every number the player sees) ----------
// A plan "holds" a storm of H inches. The street drain alone holds 1.4. Given a big storm (over 1.5 inches),
// the chance it is bigger than x inches is e^-(x-1.5)/0.5. Water from the alley ditch acts like 0.4 more inches.
const LOT={street:1.4,scale:.5,alley:.3,alleyCut:.4,ask:.3,askCut:.5,thu:.7,rocks:.4,budget:400,inlet:20,nights:3,
  drain:{std:.3,wide:.6},drainCost:{std:0,wide:50},shadeCost:{none:0,sails:40,grove:80},grove:.15};
const LOT_DESIGNS={
  bowl:{name:'Bowl Park',kind:'bowl',hold:[.5,.9],cost:200,deepCost:60,nights:3,dev:'deep',okafor:true,drainK:1,
    blurb:'A skate bowl that doubles as a flood basin, with a shady terrace and benches above it.'},
  garden:{name:'Garden Basin',kind:'garden',hold:[.4,.7],cost:160,deepCost:50,nights:2,dev:false,okafor:true,drainK:1,
    blurb:'A sunken desert garden that fills in storms, with a curvy skate path around the rim.'},
  split:{name:'Split Lot',kind:'split',hold:[.5,.8],cost:240,deepCost:70,nights:3,dev:'deep',okafor:true,drainK:1,
    blurb:'Half skate plaza, half shade garden, with a storm tank hidden underneath.'},
  skate:{name:'Skate Plaza',kind:'skate',hold:[0,.1],cost:180,deepCost:40,nights:2,dev:true,okafor:false,drainK:.5,
    blurb:'A flat plaza with ledges, stairs and rails.'},
  lawn:{name:'Lawn Park',kind:'lawn',hold:[.2,.4],cost:150,deepCost:40,nights:2,dev:false,okafor:true,drainK:.5,
    blurb:'A green lawn with a playground and benches.'},
  smart:{name:'Smart Plaza',kind:'smart',hold:[0,.2],cost:110,deepCost:40,nights:2,dev:false,okafor:false,drainK:.5,
    blurb:'A low-cost plaza with a face-scan gate, cameras and a snack robot.'}};
function lotState(){const n=(typeof S!=='undefined'&&S.notes)||{};return n.lot=n.lot||{}}
function lotSpec(id){const o=(lotState().opts||[]).find(x=>x.id===id);return o||{id,...LOT_DESIGNS[id]||LOT_DESIGNS.bowl}}
function lotCost(c,lat){const d=lotSpec(c.design);return d.cost+(c.depth==='deep'?d.deepCost:0)+LOT.drainCost[c.drain||'std']+LOT.shadeCost[c.shade||'none']+(lat?LOT.inlet:0)}
function lotHold(c){const d=lotSpec(c.design);return LOT.street+d.hold[c.depth==='deep'?1:0]+LOT.drain[c.drain||'std']*d.drainK+(c.shade==='grove'?LOT.grove:0)}
function lotPDry(h){return h<=1.5?0:1-Math.exp(-(h-1.5)/LOT.scale)}
// Byte's forecast for each criterion, with what Byte knows now (used by option cards and the night orders panel).
function lotForecast(c){const o=MISSIONS.lot.outcomes(c,MISSIONS.lot.knows()),f={};for(const k of ['dry','ready','dev','okafor','budget','agreed'])f[k]=o.reduce((a,x)=>a+x.p*(x.flags[k]??1),0);return f}
const in10=p=>Math.round(p*10);

MISSIONS.lot={id:'lot',title:'The Flood Lot',career:'architect',day:1,kind:'workday',year:1,season:'summer',district:'phoenix',rank:'trainee',
  blurb:'A corner lot floods every monsoon. A neighbor wants shade; a skater wants a bowl.',after:['maya'],
  place:'Arcadia · Phoenix',debriefScene:'phx_studio',eveningScene:'phx_dusk',eveningPlace:'Studio · Phoenix · 9:20 PM',
  flow:[{name:'morning',k:'talk',talk:'morning',scene:'phx_studio',place:'Studio · Phoenix · 6:40 AM'},
    {name:'lot',k:'talk',talk:'lot',scene:'phx_lot',place:'The flood lot · Arcadia · 7:15 AM'},
    {name:'survey',k:'custom'},
    {name:'marco',k:'talk',talk:'marco',scene:'phx_lot',place:'The flood lot · Arcadia · 7:40 AM'},
    {name:'make',k:'custom'},
    {name:'workbench',k:'bench',toast:'New work on your Workbench'},
    {name:'ask',k:'custom',music:'work'},{name:'table',k:'table'},{name:'pinup',k:'custom',music:'morning'},{name:'night',k:'custom',music:'work'},
    {name:'memo',k:'memo'},{name:'build',k:'custom',music:'table'},{name:'debrief',k:'debrief'},{name:'evening',k:'evening'}],
  benchNext:'Write my request',

  cast:{
    okafor:{name:'Grace Okafor',role:'Neighbor, age 79',skin:SKIN[4],hair:'#dcd6e0',hairStyle:'elder',age:'elder',shirt:'#e0803a',glasses:true,accessory:'earring',eye:'#4a2a1a'},
    dev:{name:'Dev Castillo',role:'Skater, age 15',age:'kid',skin:SKIN[2],hair:'#1d1512',hairStyle:'short',shirt:'#2a9d8f',outfit:'hoodie',masc:true,eye:'#3a2414'},
    marco:{name:'Marco Ruiz',role:'City stormwater engineer',skin:SKIN[2],hair:'#9a9aa2',hairStyle:'short',beard:'mustache',shirt:'#f0a830',masc:true,eye:'#3a2a1a'},
    arroyo:{name:'Arroyo',role:'The city’s stormwater AI',art:m=>typeof lotArroyoArt==='function'?lotArroyoArt(m):''}},
  voices:{okafor:'elder_woman',dev:'am_puck',marco:'am_onyx',arroyo:'af_river'},

  glossary:{
    monsoon:'A season when the winds shift and bring storms. In Phoenix, monsoon storms come mostly in July, August and September.',
    'detention basin':'A low place built to hold storm water for a few hours, then let it drain away slowly, so streets don’t flood.',
    bowl:'A skate bowl: a smooth, rounded concrete hollow, like an empty swimming pool, that skaters ride around.',
    stormwater:'Rain that runs off roofs, streets and yards during a storm.',
    irrigation:'Bringing water to plants through ditches or pipes. Some Phoenix neighborhoods still flood their yards with canal water on set nights.',
    cures:'When concrete cures, it slowly hardens. If it dries too fast in the heat, it can crack.',
    ramp:'A gentle slope instead of steps, so wheelchairs, walkers and strollers can roll up easily.',
    hohokam:'People who lived in the Phoenix area long ago and dug hundreds of miles of canals to water their farms.',
    haboob:'A huge wall of dust pushed across the desert by cold wind rushing out of a thunderstorm.',
    permit:'Official permission to do something, like build or dig, after the plan has been checked.',
    'robot zone':'An area set aside for factories and robot work. In 2040, heavy industry must stay inside these zones, and new robots need permits.',
    satellite:'A machine that circles the Earth. Some take photos of the ground from space.',
    'red team':'People (or AIs) who try to break or misuse a plan on purpose, so its weak spots get fixed before anyone else finds them.',
    'least privilege':'Giving a person, program or robot only the permissions its job really needs.'},

  guide:{
    'local-knowledge':{title:'Local knowledge',track:'Ethics and AI alignment',text:'Mrs. Okafor knew where the water really came from. No map showed it, because the neighbors own the ditch themselves. An AI can only plan for what it has been told.',real:'True today: in parts of Phoenix, neighbors still flood-irrigate their yards from small ditches and pipes that they own and look after together.'},
    'ask-well':{title:'Ask well',track:'Engineering and systems',text:'A strong request names the goal, who it is for, the limits, and how the work will be judged. Leave one out, and even an excellent AI has to guess, and its guess fits most places better than yours.',real:'True today: architects start every project with a written “design brief” that lists exactly these things.'},
    'double-duty':{title:'Double-duty design',track:'Engineering and systems',text:'One space can do two jobs: a skate bowl most days, and a flood basin after big storms. Good designs often solve two problems at once.',real:'True today: in Roskilde, Denmark, a skate park is built to fill with storm water during heavy rain, and many Phoenix parks are grassy basins that hold storm water.'},
    'least-privilege':{title:'Least privilege',track:'Security thinking',text:'Give a robot crew only the permissions its job needs. The crew may move a buried rock on its own, but anything that belongs to someone else waits for a person to sign.',real:'True today: computer security experts give each program and person only the access they need, so one mistake can’t spread far.'},
    'guardrails':{title:'Autonomy with guardrails',track:'Government, law, and power',text:'Arroyo opens gates on its own, in seconds, but only inside rules people signed: the bowl must be empty, it warns for 10 minutes, anyone can press pause, and it logs everything.',real:'True today: many cities run pumps, floodgates and traffic lights automatically, inside limits that engineers set and check.'},
    'red-team':{title:'Red teaming',track:'Security thinking',text:'Before you build, ask how someone could misuse it. A face-scan gate seems handy, until you picture who could copy all those face scans.',real:'True today: companies hire “red teams” to attack their own systems on purpose and find the weak spots first.'},
    'shade':{title:'Shade is a necessity',track:'Living things and health',text:'In extreme heat, shade decides whether a place gets used at all. Shaded ground can be 30 or more degrees cooler than ground in full sun.',real:'True today: Phoenix is planting trees and testing “cool pavement” coatings to make its streets cooler.'}},

  lessons:{monsoon:{title:'How a monsoon storm works',steps:[
      {t:'In early summer, the desert ground gets so hot that the air above it rises, like air over a stove.',viz:'lotHeatRise',cap:'Hot ground, rising air'},
      {t:'Rising air pulls in wet winds from the south, from the Gulf of California and the Gulf of Mexico.',viz:'lotWindMap',cap:'Wet winds arrive'},
      {t:'By afternoon, the wet air climbs over the mountains, cools, and builds giant thunderstorm clouds.',viz:'lotCloudBuild',cap:'A storm cloud grows'},
      {t:'Cold air rushing down from a storm can push a wall of dust ahead of it, called a [[haboob]].',viz:'lotHaboob',cap:'A haboob'},
      {t:'Hard, dry desert ground soaks up water slowly, so heavy rain runs off fast into low places.',viz:'lotRunoff',cap:'Why low places flood'}],
    quiz:[{q:'What gets the monsoon started?',opts:['Hot ground makes air rise and pulls in wet winds','Snow melting in the mountains','Ocean waves reaching Phoenix'],a:0,why:'Heat makes the air rise, and that pulls wet air in from the south.'},
      {q:'What is a haboob?',opts:['A desert flower','A wall of dust pushed by storm winds','A kind of cactus'],a:1,why:'Cold air rushing out of a storm pushes dust ahead of it like a wall.'},
      {q:'Why does desert rain flood low places so fast?',opts:['Cactus roots block the water','It only rains at night','Hard, dry ground soaks water up slowly'],a:2,why:'The water runs off the hard ground instead of soaking in, and it flows downhill to the lowest spot.'}]}},
  lesson:{id:'monsoon',label:'Learn it fast: how a monsoon storm works'},

  chatter:{phx_lot:['Morning! Water night is next Tuesday. Don’t forget to open your valve.','It’s only seven thirty and my sunglasses are already hot.',
    'Did you see the dust storm on Saturday? The whole sky turned orange.','I walk the canal every morning. Saw a quail family with eleven babies!',
    'A robot crew built our shade porch in one night. One night!','Smell that? Creosote. That’s what rain smells like here.','I teach skate lessons on Sundays, just because I love it.']},

  talks:{
    morning:[
      {who:'byte',mood:'happy',text:'Good morning, Architect! Welcome to Phoenix. It’s 6:40 AM and already 91 degrees, so here we start early.'},
      {who:'byte',mood:'neutral',text:'While you slept, the night crew finished a shade shelter at a bus stop on Indian School Road. They poured the concrete at 2 AM, when it’s cooler.'},
      {who:'byte',mood:'think',text:'Today’s job: a corner lot in Arcadia floods every summer. The city wants a new use for it, for 400 coins, and it has to work for the neighbors.'},
      {who:'byte',mood:'happy',text:'I can draw a hundred designs before breakfast. Knowing which one is right takes listening to people, and that part is yours.',
        choices:[{t:'What does a Community Architect do?',reply:'You find out what neighbors need, ask me for designs, test them, and sign the plan. Robots build it overnight, but your name is on it. That’s what [[accountable]] means.'},
          {t:'Let’s go before it gets hot!',reply:'Woof! Water bottle, hat, sunscreen. Desert rules!'}]}],
    lot:[
      {who:'okafor',mood:'smile',text:'You must be the new architect. I’m Grace Okafor. I’ve lived next door to this lot for forty-one years.'},
      {who:'okafor',mood:'think',text:'I drove a city bus for thirty-five of them. Now I’d just like a shady place to sit that isn’t my kitchen.'},
      {who:'dev',mood:'happy',text:'And I’m Dev. I skate here at five in the morning, before the concrete gets too hot to touch.'},
      {who:'dev',mood:'neutral',text:'What this lot needs is a real [[bowl]]. Deep. Like seven feet.',
        choices:[{t:'Seven feet? Tell me why.',good:true,reply:'Deeper means faster, and you can carve the walls. There’s no real bowl for miles. Kids would come from all over.',mood:'happy'},
          {t:'Seven feet sounds dangerous.',reply:'Only if you don’t know how to skate. Everybody says that.',mood:'sad'}]},
      {who:'okafor',mood:'worried',text:'A seven-foot hole, right next to my walker? I’d like to sit near it, not fall into it.'},
      {who:'okafor',mood:'stern',text:'And whatever you build, mind the water. Every summer this lot floods, and the water creeps up to my back step.'},
      {who:'okafor',mood:'think',text:'The city map says the water comes from the street. The worst of it comes from the alley, from our old [[irrigation]] ditch.',clue:'alley'},
      {who:'okafor',mood:'neutral',text:'Every other Tuesday is our water night. The ditch floods my yard to water my grapefruit tree. When a storm hits on a water night, that ditch spills right onto this lot.',
        choices:[{t:'Thank you. That isn’t on any map I’ve seen.',good:true,reply:'Of course it isn’t. We neighbors own that ditch together. Nobody from the city ever asked.',mood:'smile'},
          {t:'The city’s map is probably right.',reply:'Hmph. Then the city can explain the mud on that back wall.',mood:'stern'}]},
      {who:'dev',mood:'surprised',text:'Wait. Is that why the lot turned into a lake that one Tuesday, when it barely rained?'},
      {who:'dev',mood:'smile',text:'So... could we have a bowl and her garden?'},
      {who:'okafor',mood:'smile',text:'Now that’s a question for the architect.'}],
    marco:[
      {who:'marco',mood:'neutral',text:'Morning. Marco Ruiz, city [[stormwater]]. I ran the drains on this side of town by hand for thirty years.'},
      {who:'marco',mood:'think',text:'Now Arroyo runs them, the city’s stormwater AI. In a storm it opens and closes four thousand gates, faster than any crew I ever had.'},
      {who:'marco',mood:'stern',text:'Here’s my problem. In a big storm, twenty-three homes on this street get water in their yards and garages. Your lot is where that water wants to go.'},
      {who:'marco',mood:'worried',text:'And if Arroyo is going to open a gate onto your lot, I want it to call me first. Every time.',
        choices:[{t:'Why every time?',good:true,reply:'Because I’ve seen machines be sure and be wrong. Maybe not this one. But I’m the one who signs for it.',mood:'think'},
          {t:'Arroyo is faster than a phone call.',reply:'Faster isn’t the same as right. Show me it’s safe and we’ll talk.',mood:'stern'}]},
      {who:'byte',mood:'happy',text:'One question before we head back to the studio: what should we make for this lot?'}]},

  // Workbench documents: every sentence is a step with its own looping picture (VIZ kinds in src/viz/lot.js).
  docs:[
    {id:'memo',title:'Byte’s memo: The flood lot',from:'Byte',kind:'memo',steps:[
      {t:'The lot sits at the low end of the street, so rain from about 140 homes runs downhill to it.',viz:'lotSlope',cap:'Where the water goes'},
      {t:'In a big [[monsoon]] storm, more than 1.5 inches of rain can fall in about an hour.',viz:'lotGauge',cap:'A big storm'},
      {t:'The street drain can only handle about 1.4 inches, so in every big storm the extra water floods 23 homes.',viz:'lotDrain',cap:'Too much for one drain'},
      {t:'A [[detention basin]] is a low place that holds storm water for a few hours and then lets it drain away slowly.',viz:'lotBasin',cap:'Fill, hold, drain'},
      {t:'A skate [[bowl]] can be a detention basin too: dry for skating most days, and full only after big storms.',viz:'lotBowlCycle',cap:'A bowl with two jobs'},
      {t:'The deeper the basin and the wider its drain, the bigger the storm it can hold.',viz:'lotDepthChart',cap:'Street stays dry, out of 10 big storms'},
      {t:'Phoenix is one of the hottest big cities in America, with more than 100 days a year above 100°F.',viz:'lotHotDays',cap:'A Phoenix year'},
      {t:'In July sun, bare concrete can get hotter than 140°F, and shade can make it 30 or more degrees cooler.',viz:'lotShadeTemp',cap:'Sun and shade'},
      {t:'Without shade, almost nobody uses a park here between late morning and sunset.',viz:'lotDayClock',cap:'Who visits, hour by hour'},
      {t:'Robot crews build at night, when it is cooler and fresh concrete [[cures]] more evenly.',viz:'lotNightCrew',cap:'The night crew'},
      {t:'The first big storm of the summer is forecast for Thursday night, and I am about 70 in 100 sure.',viz:'lotWeek',cap:'This week'},
      {t:'My city maps show storm water reaching the lot only from the street side.',viz:'lotWaterMap',args:{both:false},cap:'Water paths I know about',
        alt:{t:'Updated: Mrs. Okafor says the old [[irrigation]] ditch in the alley spills onto the lot in about 3 of 10 big storms, so every design now takes water from both sides.',args:{both:true},cap:'Water paths, updated'}}]},
    {id:'log',title:'City flood log: the lot',from:'Arroyo, the city’s stormwater AI',kind:'log',steps:[
      {t:'Arroyo, the city’s [[stormwater]] AI, runs about 4,000 drain gates, pumps and basins across Phoenix.',viz:'lotArroyoGrid',cap:'Arroyo’s network'},
      {t:'In a storm it acts on its own, in seconds, following rules that the city engineer signs each year.',viz:'lotSignedRules',cap:'Fast, inside signed rules'},
      {t:'Last summer, the street by the lot flooded on 4 days.',viz:'lotFloodDays',cap:'Flood days, last summer'},
      {t:'Two of those floods came after big storms, of 1.7 and 2.1 inches.',viz:'lotFloodBars',args:{set:'big'},cap:'Rain on the flood days'},
      {t:'The other two came after small storms, under 1 inch, and both started at the back of the lot.',viz:'lotFloodBars',args:{set:'small'},cap:'Two floods that don’t fit'},
      {t:'Both small-storm floods began on a Tuesday night.',viz:'lotTuesdays',cap:'When they started'},
      {t:'Arroyo marked their cause as unknown.',viz:'lotUnknown',cap:'Cause: unknown'}]},
    {id:'survey',title:'Neighbor survey: what should the lot be?',from:'Byte',kind:'survey',steps:[
      {t:'Last night I asked the 200 households nearest the lot what they would like there.',viz:'lotSurveyPing',cap:'200 homes asked'},
      {t:'52 out of 100 picked a shady garden, and 41 picked a skate park.',viz:'lotSurveyBars',cap:'What neighbors picked'},
      {t:'Dozens wrote the same three words: why not both?',viz:'lotWhyBoth',cap:'The most common comment'},
      {t:'Older neighbors asked for shade, benches with backs, and a smooth [[ramp]] instead of steps.',viz:'lotElderNeeds',cap:'What older neighbors need'},
      {t:'Teens asked for a real bowl, lights for skating after dark, and a water fountain.',viz:'lotTeenNeeds',cap:'What teens asked for'}]},
    {id:'ledger',title:'The Ledger: Phoenix',from:'News',kind:'ledger',steps:[
      {t:'Phoenix now has more robots than people, and most of them work in the [[robot zone]] west of the city.',viz:'lotRobotCount',cap:'People and robots'},
      {t:'Robot crews put up 40 new shade sails along the Grand Canal trail this month.',viz:'lotCanalShade',cap:'Shade on the canal trail'},
      {t:'A new trail sign explains that some of today’s canals follow routes the [[Hohokam]] people dug more than 1,000 years ago.',viz:'lotHohokam',cap:'Old canals, new canals'},
      {t:'[[Satellite]] photos show a shiny silver patch at Saltbrush Flats, just past the edge of the robot zone, that has doubled in size in one week.',viz:'lotSilverPatch',cap:'A growing patch'},
      {t:'The county says no one has a [[permit]] to mine there.',viz:'lotNoPermit',cap:'No permit on file'}]}],
  react:{memo2:'Twenty-three homes. That’s a lot of soggy garages.',memo10:'Thursday. That gives the crew three nights.',memo11:'Only the street side? Did anyone mention another way in?',
    log4:'The back of the lot, not the street side. Interesting.',log5:'Two Tuesdays. Is that a coincidence?',survey2:'Why not both? I like these neighbors.',ledger3:'Doubling in a week? That’s fast for a patch of anything.'},
  tell:{clue:'alley',label:'Tell Byte about the alley ditch',note:'Thanks! I updated my forecast: in about 3 of 10 big storms, the old ditch spills onto the lot from the alley, so every design now takes water from both sides. An alley inlet adds 20 coins.',guide:'local-knowledge',doc:'memo'},

  criteria:[{id:'dry',label:'The street stays dry'},{id:'ready',label:'Done before the storm'},{id:'dev',label:'Dev can really skate it'},
    {id:'okafor',label:'Mrs. Okafor has a shady seat'},{id:'budget',label:'400 coins or less'},{id:'agreed',label:'No changes nobody signed'}],
  criteriaHint:'The street holds water from 140 homes, and the budget is 400 coins.',
  criteriaNote:'Deciding what “good” means first keeps a shiny design from fooling you.',
  get controls(){const ids=lotState().opts?lotState().opts.map(o=>o.id):['bowl','garden','split'];
    return [{key:'design',label:'Design',opts:ids.map(id=>[id,lotSpec(id).name])},{key:'depth',label:'Depth',opts:[['shallow','4 feet'],['deep','7 feet']]},
      {key:'drain',label:'Drain',opts:[['std','Standard'],['wide','Wide']]},{key:'shade',label:'Shade',opts:[['none','None'],['sails','Sails'],['grove','Trees + sails']]}]},
  start:{design:'bowl',depth:'shallow',drain:'std',shade:'none',crew:'scoped',arroyo:'auto'},
  planName(c){const d=lotSpec(c.design),hole={bowl:'bowl',garden:'basin',split:'tank'}[d.kind]||'low area';
    return `${d.name}: ${c.depth==='deep'?'7-foot':'4-foot'} ${hole}, ${c.drain==='wide'?'wide':'standard'} drain, ${c.shade==='none'?'no shade':c.shade==='sails'?'shade sails':'trees and sails'}`},
  knows(){return !!S.told},truth(){return true},
  // outcomes(c, lat): lat = the ditch is part of this model. Forecasts use what Byte knows (S.told); the real draw uses the truth.
  outcomes(c,lat){const ch={...LOT_START,...(typeof S!=='undefined'&&S.choice||{}),...c},d=lotSpec(ch.design),told=typeof S!=='undefined'&&!!S.told;
    const pipe=!!lat&&!told,crew=ch.crew,arroyo=ch.arroyo,unsigned=crew==='free'&&pipe;
    const devOK=d.dev===true||(d.dev==='deep'&&ch.depth==='deep'),okOK=d.okafor&&ch.shade!=='none'&&!unsigned;
    const F=(dry,ready)=>({dry,ready,dev:devOK?1:0,okafor:okOK?1:0,budget:lotCost(ch,lat)<=LOT.budget?1:0,agreed:unsigned?0:1});
    const H=lotHold(ch),hot=ch.shade==='none'&&d.okafor;
    const cap={late:'Not done in time. Street flooded.',overflow:'Too much rain. Water reached the street.',slowgate:'Gate waited for a call. Street flooded.',
      nogate:'Bowl stayed dry. The street didn’t.',unsigned:'Street dry, but the crew cut the ditch unasked.',
      held:hot?'Street dry. Too hot to sit, though.':({bowl:'Bowl filled. Street stayed dry!',garden:'Garden filled. Street stayed dry!',split:'Tank filled. Street stayed dry!'}[d.kind]||'Street stayed dry!')};
    const out=[],add=(kind,p,fl)=>{if(p<1e-9)return;const k=kind+JSON.stringify(fl),e=out.find(x=>x._k===k);if(e)e.p+=p;else out.push({_k:k,kind,p,cap:cap[kind],flags:fl})};
    const branches=crew==='all'?(pipe?[[1,1]]:[[LOT.rocks,1],[1-LOT.rocks,0]]):crew==='scoped'?[[1,pipe?1:0]]:[[1,0]];
    for(const [pb,delay] of branches){const ready=d.nights+delay<=LOT.nights?1:1-LOT.thu;
      add('late',pb*(1-ready),F(0,0));
      for(const [pa,cut] of (lat?[[1-LOT.alley,0],[LOT.alley,LOT.alleyCut]]:[[1,0]])){
        if(arroyo==='off'){add('nogate',pb*ready*pa,F(0,1));continue}
        for(const [pg,gcut] of (arroyo==='ask'?[[1-LOT.ask,0],[LOT.ask,LOT.askCut]]:[[1,0]])){const pd=lotPDry(H-cut-gcut);
          add(unsigned?'unsigned':'held',pb*ready*pa*pg*pd,F(1,1));add(gcut?'slowgate':'overflow',pb*ready*pa*pg*(1-pd),F(0,1))}}}
    return out.map(({_k,...x})=>x)},
  why(c){const k=this.knows(),f=lotForecast(c),d=lotSpec(c.design),cost=lotCost(c,k);
    return `<b>${esc(this.planName(c))}.</b> In a big storm, the street stays dry about ${in10(f.dry)} times in 10. It costs ${cost} of 400 coins and needs ${d.nights} night${d.nights>1?'s':''} of building; the storm is most likely after 3. `+
      (k?'I planned for water from the alley ditch, too. ':'I’m assuming water comes only from the street side. ')+
      (c.shade==='none'&&d.okafor?'With no shade, the benches will be too hot to use until sunset. ':'')+
      (d.dev==='deep'&&c.depth!=='deep'?'Dev says 4 feet is too shallow to really skate. ':'')+'Tap the controls and watch the futures change.'},
  whyGuide(){return 'double-duty'},
  tableNote(c){const k=this.knows(),cost=lotCost(c,k),d=lotSpec(c.design);
    return `<div class="lot-tn"><span class="${cost>LOT.budget?'over':''}"><b>${cost}</b> / 400 coins</span><span><b>${d.nights}</b> night${d.nights>1?'s':''} to build</span><span>${k?'Water from both sides':'Street-side water only'}</span></div>`},
  vignette(kind){return lotVignette(kind)},

  consent:{scene:'phx_lot',place:'The flood lot · Arcadia · 5:30 PM',left:'okafor',right:'dev',title:'Mrs. Okafor and Dev',role:'Neighbors',replyWho:'okafor',heart:'okafor',
    prompt:'So what are you going to build here? And will my street flood again?',
    opts(c,M){const f=typeof lotForecast==='function'&&typeof S!=='undefined'?lotForecast(c):{dry:.9},d=lotSpec(c.design);
      return [{t:`I suggest the ${d.name}${c.depth==='deep'?' with a 7-foot '+(d.kind==='garden'?'basin':'bowl'):''}${c.shade==='none'?'':c.shade==='sails'?' and shade sails':' with trees and shade sails'}. In a big storm, the street should stay dry about ${in10(f.dry)} times in 10, not every time. What do you two think?`,good:true,mood:'smile',reply:LOT_REPLY[0]},
        {t:'Trust me, it’s perfect. You don’t need the details.',good:false,mood:'stern',reply:LOT_REPLY[1]},
        {t:'It will never flood again. I promise.',good:false,mood:'surprised',reply:LOT_REPLY[2]}]}},
  memo:{starters:['I recommend ','because ','In a big storm, the street stays dry about ','Mrs. Okafor and Dev ','Overnight, the crew may ','We will check by '],
    placeholder:'I recommend the Bowl Park with shade sails because…',plan:/bowl|garden|split|plaza|lawn|basin|park|tank|design/,planLabel:'Names the design',
    careLabel:'Includes what the neighbors care about',care:/okafor|grace|dev\b|neighbor|skat|shade|street|homes|walker|ditch/,signAs:'Architect ',topic:'the flood lot design'},
  reveal:{unit:'Night',days(){return 4},who:'okafor',
    lines:{held:'Water right up to the brim, and my back step dry as a bone. I could hug those robots.',
      overflow:'It caught most of it. Water still reached the street, but not my step. That’s a first.',
      late:'Half-built and full of mud. The street flooded like always. Maybe next storm.',
      slowgate:'The gate opened too late. Somebody was waiting for a phone call at two in the morning.',
      nogate:'Dev’s bowl stayed dry as a bone. My street didn’t.',
      unsigned:'It works, I’ll give you that. But those robots cut into our ditch, and nobody asked us.'},
    mood(k){return {held:'happy',overflow:'smile',late:'sad',slowgate:'worried',nogate:'sad',unsigned:'stern'}[k]||'smile'}},
  trap(){return {ok:!!S.told,text:S.told?'You told Byte about the alley ditch, so the plan held water from both sides and the crew had no surprise at 2 AM.':
    'Byte never heard about the alley ditch. Mrs. Okafor mentioned it, and the flood log showed two Tuesday-night floods from the back of the lot.'}},
  debriefLines(){const L=lotState(),f=L.f||{},crew=S.choice.crew,ar=S.choice.arroyo,out=[];
    const miss=[!(f.flood||f.homes)&&'the goal',!(f.dev&&f.okafor)&&'who it was for',!(f.budget&&f.deadline)&&'the limits',!f.criteria&&'your criteria'].filter(Boolean);
    out.push(miss.length?{ok:false,text:`Your request left out ${miss.join(' and ')}, so Byte had to guess.`}:{ok:true,text:'Your request named the goal, who it was for, the limits and your criteria, so Byte designed for this lot.'});
    out.push(crew==='free'?{ok:false,text:'You let the crew sign its own changes. When it finds something that belongs to someone else, nobody gets asked.'}:
      crew==='all'?{ok:true,text:'Your crew had to stop for every surprise. Safe, though even a buried rock could cost a night.'}:
      {ok:true,text:'Your crew could move rocks on its own, but had to stop for anything that belongs to someone else.'});
    out.push(ar==='auto'?{ok:true,text:'Arroyo could open the gate in seconds, inside rules Marco signed.'}:ar==='ask'?{ok:false,text:'Arroyo had to wait for Marco every time. At 2 AM, storms move faster than phone calls.'}:
      {ok:false,text:'With the gate not connected, the bowl stayed dry and the street flooded.'});
    return out},
  byteGood:'Nice work, Architect. You listened to the neighbors, asked well, and gave the robots clear night orders.',
  evening(){const n=S.notes||{};return [`<b>${esc(S.byte.name)}:</b> “Arroyo’s morning log is in. Every gate on its list opened and closed inside the rules.”`,
    '“But the Ledger’s silver patch near Saltbrush Flats doubled again since Monday. Something out there is digging for metal, with no permit.”',
    n.crate?'“Remember those two on the canal path, pushing a crate of TOTALLY NORMAL COPPER? Something inside it was wiggling.”':'“Robots that build copies of themselves would need a lot of metal. Who would mine the desert at night?”']},
  brief(){const c=S.choice||{},f=typeof lotForecast==='function'?lotForecast(c):{};
    return `Current case: you are working as a Community Architect in Phoenix, Arizona (Arcadia neighborhood, near the Arizona Canal and Camelback Mountain), in monsoon season. A corner lot at the low end of a street floods in every big storm (over 1.5 inches); the street drain handles about 1.4 inches, and 23 homes get water in yards and garages. Budget: 400 coins. A robot crew builds at night (10 PM to 5 AM); the first big storm is forecast for Thursday night (about 70% sure), after 3 build nights.
People: Grace Okafor, 79, retired bus driver, uses a walker, wants shade and a seat she can reach. Dev Castillo, 15, skater, wants a 7-foot bowl. Marco Ruiz, city stormwater engineer, wants the street's water held and wants Arroyo (the city's stormwater AI, which opens about 4,000 gates on its own in storms) to call him before opening a gate.
Designs: Bowl Park (skate bowl that doubles as a detention basin, terrace with benches, 200 coins base, 3 nights), Garden Basin (sunken rain garden with a skate path, 160, 2 nights), Split Lot (half plaza, half garden, storm tank, 240, 3 nights). Deep (7 ft) holds more; a wide drain holds more; trees soak a little water. Night orders: the crew can stop for every surprise, fix small things but stop for anything that belongs to someone else, or fix everything itself; Arroyo can open the bowl's gate itself (only when empty, after a 10-minute warning, with a pause button), wait for Marco each time, or not be connected.
The current plan: ${this.planName(c)}; your forecast: street dry about ${in10(f.dry||0)} in 10 big storms.
What you know: ${S.told?'The player told you about the neighbors’ irrigation ditch under the alley: it spills onto the lot in about 3 of 10 big storms (on water nights, every other Tuesday). Every design now includes an alley inlet (20 coins).':'Your city maps show water only from the street side. The flood log has two small-storm floods from the back of the lot, both on Tuesday nights, cause unknown. You do not know why.'}
The key consideration when asked which plan: ${S.told?'balance the budget between depth, drain and shade, and give the crew orders that stop it for anything that belongs to someone else':'ask whether the neighbors mentioned any other source of water; the Tuesday floods are unexplained'}.`},
  canned(q){
    if(/ditch|alley|irrigat|tuesday|water night|lateral/.test(q)){if(!S.told&&S.notes&&S.notes.alley){S.told=true;save();return 'That explains the Tuesday floods! If the neighbors’ ditch spills onto the lot in about 3 of 10 big storms, every design needs an alley inlet, for 20 coins. I updated my forecast.'}return S.told?'Right, the ditch. I planned for water from the alley side, and the crew knows it belongs to the neighbors.':'My city maps don’t show any ditch. Did one of the neighbors mention it?'}
    if(/best|which|pick|choose|should|recommend/.test(q))return S.told?'I can’t pick for you, but here’s the big thing: 400 coins won’t buy the deepest bowl, the widest drain and trees all at once. What matters most: the street staying dry, Dev’s bowl, or Mrs. Okafor’s shade?':'Before I answer: two floods last summer came from the back of the lot on Tuesday nights, and I can’t explain them. Did anyone mention where else water comes from? And what matters most to you: the street, Dev’s bowl, or Mrs. Okafor’s shade?';
    if(/crew|night|robot|surprise/.test(q))return 'The crew builds from 10 PM to 5 AM. My pick: let it fix small things like buried rocks, but stop for anything that belongs to someone else. My forecast can only see what’s on my maps.';
    if(/arroyo|gate|marco/.test(q))return 'Arroyo can open the bowl’s gate in seconds, but only when the bowl is empty, after 10 minutes of lights and a horn, and anyone can press pause. Waiting for Marco at 2 AM makes the street flood about 3 times in 10.';
    if(/shade|hot|heat|sun/.test(q))return 'In July, bare concrete can pass 140°F. Shade sails cost 40 coins; trees plus sails cost 80 and soak up a little storm water, too.';
    if(/deep|depth|drain|bowl/.test(q))return 'Deeper and wider means it holds a bigger storm. A 7-foot bowl adds 60 coins, and a wide drain adds 50. Dev says 4 feet is too shallow to really skate.';
    if(/monsoon|haboob|storm/.test(q))return 'Monsoon season runs mostly July to September. Hot ground pulls in wet air, and by afternoon it builds huge thunderstorms. Hard desert ground can’t soak it up fast, so water rushes to low spots like this lot.';
    if(/saguaro|cactus/.test(q))return 'That saguaro is over a hundred years old. Most saguaros don’t grow arms until they’re at least 50. Every design keeps it, and Arizona law protects it, too.';
    if(/camelback|mountain/.test(q))return 'Camelback Mountain is 2,704 feet tall. From here you can see the camel’s head on the left and its hump on the right.';
    if(/beat|win|how do i|what do i do|stuck|help/.test(q))return 'Here’s the path: listen to the neighbors, look around the lot, read the documents, tell me anything my maps are missing, set your criteria, ask me clearly for designs, test them on the Future Table, give the crew night orders, explain the plan honestly, then write your decision and sign it!';
    return null},
  lines:[]};
const LOT_START=MISSIONS.lot.start;
const LOT_REPLY=['Thank you for telling us straight, odds and all. Dev, you’ll keep it clean? Then I agree.',
  'I drove a bus for thirty-five years. I always want the details.','Never? Even your own forecast table didn’t say never.'];

// ---------- field visit: tap things around the lot (positions match PAINT.phx_lot.anchors) ----------
const LOT_SPOTS=[
  {id:'mud',a:'wall',t:'Dried mud lines streak the back wall, knee-high. They’re higher than the stains by the street.',note:'mud'},
  {id:'valve',a:'valve',t:'A round concrete pipe with a valve wheel pokes up in the alley. It’s stamped LATERAL 14, 1926.',note:'alley'},
  {id:'drain',a:'drain',t:'The street drain is half full of gravel and palo verde pods.'},
  {id:'saguaro',a:'saguaro',t:'This saguaro is over 20 feet tall, with five arms. Most saguaros don’t grow arms until they’re at least 50 years old.'},
  {id:'bus',a:'bus',t:'The bus stop bench has no shade. At 7:20 in the morning, its metal seat is already warm.'},
  {id:'curb',a:'curb',t:'Skate wax on the curb, and little wheel marks everywhere. Dev has been busy.'},
  {id:'cracks',a:'cracks',t:'The dirt is cracked into tiles where puddles dried. Water sat here for days.'},
  {id:'mountain',a:'mountain',t:'Camelback Mountain: the camel’s head on the left, its hump on the right, 2,704 feet tall.'},
  {id:'canal',a:'canal',t:'The Arizona Canal carries water from the Salt and Verde rivers. Neighborhood ditches branch off it.'},
  {id:'pipjory',a:'path',t:'Two strangers push a crate stamped TOTALLY NORMAL COPPER along the canal path. Something inside it wiggles.',note:'crate'}];
function lotSurvey(){const st=lotState();st.seen=st.seen||[];const A=(window.PAINT&&PAINT.phx_lot&&PAINT.phx_lot.anchors)||{};
  const pos=s=>{const a=A[s.a]||{x:.5,y:.5};return `left:${(a.x*100).toFixed(1)}%;top:${(a.y*100).toFixed(1)}%`};
  const pj=`<svg viewBox="-40 -60 150 110">${mini(0,40,{who:'pip',pose:'push',s:1.1})}<g transform="translate(14 8)"><rect x="0" y="0" width="40" height="30" rx="3" fill="#c9a26b" stroke="#7a5426" stroke-width="2"/><g class="lot-wiggle"><path d="M30 -3 l3 -6 l3 5" stroke="#cfd6e6" stroke-width="2.4" fill="none" stroke-linecap="round"/></g><text x="20" y="13" text-anchor="middle" font-size="6" font-family="Nunito" font-weight="800" fill="#5b3b16" textLength="24" lengthAdjust="spacingAndGlyphs">TOTALLY</text><text x="20" y="21" text-anchor="middle" font-size="6" font-family="Nunito" font-weight="800" fill="#5b3b16" textLength="34" lengthAdjust="spacingAndGlyphs">NORMAL COPPER</text></g>${mini(66,40,{who:'jory',pose:'push',s:1.1})}</svg>`;
  const last=st.last&&LOT_SPOTS.find(s=>s.id===st.last);
  screen('lot-survey',`${scene('phx_lot')}${hud('The flood lot · Arcadia · 7:30 AM')}
    <div class="lot-spots">${LOT_SPOTS.map(s=>s.id==='pipjory'?`<button class="lot-pj ${st.seen.includes(s.id)?'gone':''}" data-id="${s.id}" style="${pos(s)}" aria-label="Look at the strangers">${pj}</button>`:
      `<button class="lot-spot ${st.seen.includes(s.id)?'seen':''}" data-id="${s.id}" style="${pos(s)}" aria-label="Look closer"><i></i></button>`).join('')}</div>
    <div class="caption-card lot-cap"><div class="lot-cap-top"><b>Field notes</b><span>${st.seen.length} of ${LOT_SPOTS.length}</span></div>
      <p id="lot-note">${last?esc(last.t):'Heat already shimmers over the dirt. Mud lines streak the back wall.'}</p>
      <div class="row"><button class="btn small ghost" id="lot-book">My notes</button><button class="btn small" id="lot-done">Done looking</button></div></div>`);
  $$('.lot-spot,.lot-pj').forEach(b=>b.onclick=e=>{e.stopPropagation();const s=LOT_SPOTS.find(x=>x.id===b.dataset.id);
    if(!st.seen.includes(s.id)){st.seen.push(s.id);if(s.note)S.notes[s.note]=true;if(s.note==='alley')toast('Added to your notebook','good');if(s.id==='pipjory')S.crate=true}
    st.last=s.id;save();MUSIC.sfx('blip');lotSurvey();playLine('narrator',s.t)});
  $('#lot-book').onclick=()=>sheet('Field notes',st.seen.length?`<ul class="lot-notes">${st.seen.map(id=>`<li>${esc(LOT_SPOTS.find(s=>s.id===id).t)}</li>`).join('')}</ul>`:'<p class="muted">Nothing yet.</p>');
  $('#lot-done').onclick=()=>nextStep()}

// ---------- choose what to make ----------
const LOT_MAKE=[
  {id:'design',job:true,title:'A new design for the lot',goLabel:'Make a new design',checks:[['Street dry',null],['Dev',null],['Mrs. Okafor',null]],cost:'200 to 400 coins',
    line:'This is the real job. A design could fix the floods and give both of them a place. It’s also the hardest one to get right.',icon:()=>VIZ.lotMakeIcon({k:'design'})},
  {id:'texts',title:'Flood warning texts',checks:[['Street dry',false],['Dev',false],['Mrs. Okafor',false]],cost:'5 coins',
    line:'Easy! People could move their cars in time. But the street would still flood, and the lot would still be dirt.',icon:()=>VIZ.lotMakeIcon({k:'texts'})},
  {id:'fence',title:'A fence and a KEEP OUT sign',checks:[['Street dry',false],['Dev',false],['Mrs. Okafor',false]],cost:'30 coins',
    line:'Cheap and quick, and nobody slips in the mud. It also keeps Dev and Mrs. Okafor out, and the floods stay.',icon:()=>VIZ.lotMakeIcon({k:'fence'})},
  {id:'bags',title:'Sandbags at every door',checks:[['Street dry',false],['Dev',false],['Mrs. Okafor',false]],cost:'60 coins a storm',
    line:'Robots could stack them in an hour. But the water would just go to the next door down.',icon:()=>VIZ.lotMakeIcon({k:'bags'})}];
function lotMake(){cmMake({scene:'phx_lot',place:'The flood lot · Arcadia · 7:45 AM',title:'What should we make?',intro:'Each one helps different people.',cards:LOT_MAKE,
  state:()=>{const L=lotState();return L.make=L.make||{}},next:nextStep})}

// ---------- commission: ask Byte for designs ----------
const LOT_ASK_LINES={generic:'Here you go! These would be lovely parks almost anywhere. I didn’t know this lot floods, so none of them is built to hold water.',
  partial:'These all hold storm water. But I had to guess a few things, and my guesses show.',
  full:'These are built for this lot, these neighbors and your limits. All three hold storm water.'};
const LOT_WHY={bowl:'The bowl is the lowest spot, so street water flows in on its own, and Dev gets his bowl.',garden:'Plants and soil soak up water, and it’s the quickest to build: 2 nights.',
  split:'A tank holds the water out of sight, so the plaza stays dry for skating.',skate:'Skaters asked for a place, and plazas are quick to build.',lawn:'A lawn is soft and green, and good for families.',smart:'It’s the cheapest, and its cameras and gate keep it tidy.'};
const LOT_RISK={bowl:'Someone could be skating in the bowl when a storm comes.',garden:'Leaves and trash can clog the drain.',split:'If the tank’s one pump breaks, it can’t empty.',
  skate:'Its rain runs straight into the street.',lawn:'A desert lawn drinks a lot of water.',smart:'The gate saves every visitor’s face.'};
const LOT_CRIT={bowl:'Checks out. Make sure a person can pause the gate.',garden:'Solid. Dev may find the skate path too tame.',split:'The single pump is a weak spot. A second pump would cost 30 coins.',
  skate:'This ignores the flooding completely.',lawn:'A lawn here needs a lot of water every summer week.',smart:'Warning: the snack robot can read the city’s street cameras.'};
const LOT_RT={bowl:['A skater might be in the bowl when Arroyo needs to fill it during a storm.','Arroyo only opens the gate when its sensors show the bowl is empty, after 10 minutes of lights and a horn. Anyone can press pause.'],
  garden:['Leaves, pods and trash can clog the drain, so the garden stays a pond for days.','A cleaning robot checks the drain grate after every storm.'],
  split:['If the tank’s only pump breaks, the tank can’t empty before the next storm.','A second pump means one broken part can’t sink the whole design. That’s called avoiding a single point of failure.'],
  skate:['The plaza is hard and flat, so its rain runs straight into the street and makes floods a little worse.','This design needs a basin, or it adds to the problem.'],
  lawn:['In a Phoenix summer, a lawn this size drinks tens of thousands of gallons of water.','Desert plants like palo verde and brittlebush need far less.'],
  smart:['The face-scan gate saves every visitor’s face, and the snack robot is linked to the city’s street cameras. Two strangers could stroll right in and watch the whole street.','Nobody needs a face scan to sit on a bench. Give each machine only the access its job needs.']};
function lotFeatures(sel,text){const t=' '+String(text||'').toLowerCase()+' ',has=(k,id)=>(sel[k]||[]).includes(id),crit=(sel.judge||[]).length;
  return {flood:sel.goal==='flood'||/flood|storm|rain|drain|basin|hold.*water/.test(t),dev:has('who','dev')||/\bdev\b|skat|teen|bowl/.test(t),
    okafor:has('who','okafor')||/okafor|walker|older|elder|grandma|senior|ramp|bench/.test(t),homes:has('who','homes')||/homes|houses|garage/.test(t),
    budget:has('limits','budget')||/coin|budget|cheap|afford|400/.test(t),deadline:has('limits','deadline')||/thursday|deadline|before the storm|in time|by friday/.test(t),
    shade:has('limits','shade')||/shade|shady|\bhot\b|heat|cool/.test(t),alley:has('limits','alley')||/alley|ditch|irrigat|tuesday|lateral/.test(t),
    criteria:crit>=2,
    reasons:has('extras','reasons')||/\bwhy\b|reason|explain/.test(t),risks:has('extras','risks')||/wrong|risk|problem|misuse|danger/.test(t),
    critique:has('extras','critique')||/independent|second opinion|critique|double.?check/.test(t)}}
function lotSentence(sel,text){const C=id=>{const c=MISSIONS.lot.criteria.find(x=>x.id===id);return c?c.label.toLowerCase():id},blank=w=>`<i class="cm-blank">${w}</i>`;
  const goal={nice:'something nice for the lot',fun:'a fun place to hang out',flood:'a park that also holds storm water'}[sel.goal];
  const who={everyone:'everyone',dev:'Dev and teen skaters',okafor:'Mrs. Okafor, who uses a walker',homes:'the 23 homes that flood'};
  const lim={budget:'cost 400 coins or less',deadline:'be done before Thursday’s storm',shade:'have shade for hot afternoons'};
  const list=a=>a.length<2?a.join(''):a.slice(0,-1).join(', ')+' and '+a.at(-1);
  const W=(sel.who||[]).map(x=>who[x]).filter(Boolean),L=(sel.limits||[]).filter(x=>lim[x]).map(x=>lim[x]),J=(sel.judge||[]).map(C);
  const X={reasons:'explain your reasoning',risks:'tell me what could go wrong',critique:'have an independent AI check them'},E=(sel.extras||[]).map(x=>X[x]).filter(Boolean);
  let s=`${esc(S.byte.name)}, please design ${goal?esc(goal):blank('what?')} for ${W.length?esc(list(W)):blank('who?')}.`;
  s+=L.length?` It must ${esc(list(L))}.`:` ${blank('Any limits?')}`;
  if((sel.limits||[]).includes('alley'))s+=' Water also comes from the alley ditch.';
  s+=J.length?` I’ll judge it by: ${esc(list(J))}.`:` ${blank('How will you judge it?')}`;
  if(E.length)s+=` Please ${esc(list(E))}.`;
  if(String(text||'').trim())s+=' '+esc(String(text).trim());
  return s}
// Turn a request into three option specs; each missing detail becomes a visible flaw. Knobs are tuned to the player's criteria when given.
function lotOptions(f){const tailored=f.flood||f.homes,ids=tailored?['bowl','garden','split']:['skate','lawn','smart'];
  const opts=ids.map(id=>{const b=LOT_DESIGNS[id],o={id,...b,flaws:[]};
    if(tailored){if(!f.budget){o.cost+=90;o.flaws.push('premium finishes: +90 coins')}
      if(!f.deadline){o.nights+=1;o.flaws.push('an extra finishing night')}
      if(!f.okafor){o.okafor=false;o.flaws.push('steps instead of a ramp')}
      if(!f.dev&&o.dev){o.dev=false;o.flaws.push('a gentle bowl, too tame to skate')}}
    return o});
  lotState().opts=opts;
  for(const o of opts){let best=null,bs=-1;const crit=S.criteria.length?S.criteria:['dry'];
    if(f.criteria){for(const depth of ['shallow','deep'])for(const drain of ['std','wide'])for(const shade of ['none','sails','grove']){
      const k={design:o.id,depth,drain,shade},fc=lotForecast(k),sc=crit.reduce((a,id)=>a*(fc[id]??1),1)-lotCost(k,MISSIONS.lot.knows())/1e5;if(sc>bs){bs=sc;best={depth,drain,shade}}}}
    o.knobs=best||{depth:'shallow',drain:'std',shade:f.shade?'sails':'none'}}
  return opts}
function lotOptionCard(o,f){const k={design:o.id,...o.knobs},fc=lotForecast(k),cost=lotCost(k,MISSIONS.lot.knows());
  const fit=S.criteria.map(id=>{const c=MISSIONS.lot.criteria.find(x=>x.id===id);const ok=(fc[id]??1)>=.6;return c?`<i class="${ok?'y':'n'}">${ok?'✓':'✗'} ${esc(c.label)}</i>`:''}).join('');
  return `<div class="cm-art">${VIZ.lotDiorama({design:o.id,kind:o.kind,...o.knobs,ramp:o.okafor,tame:o.dev===false&&o.kind==='bowl'})}</div>
    <h3>${esc(o.name)}</h3><p class="cm-blurb">${esc(o.blurb)}</p>
    <div class="cm-facts"><span class="${cost>LOT.budget?'over':''}"><b>${cost}</b> coins</span><span><b>${o.nights}</b> night${o.nights>1?'s':''}</span><span>Street dry <b>${in10(fc.dry)}</b> in 10</span></div>
    ${fit?`<div class="cm-fit">${fit}</div>`:''}
    ${o.flaws.length?`<div class="cm-flaws">${o.flaws.map(x=>`<i>Guess: ${esc(x)}</i>`).join('')}</div>`:''}
    ${f.reasons?`<p class="cm-x why"><b>Why:</b> ${esc(LOT_WHY[o.id])}</p>`:''}${f.risks?`<p class="cm-x risk"><b>Risk:</b> ${esc(LOT_RISK[o.id])}</p>`:''}
    ${f.critique?`<p class="cm-x crit"><b>Second Look AI:</b> ${esc(LOT_CRIT[o.id])}</p>`:''}`}
function lotAsk(){const opt=(id,t,x)=>({id,t,...x});
  cmAsk({scene:'phx_studio',place:'Studio · Phoenix · 9:30 AM',title:'Your request',placeholder:'Type anything Byte should know…',
    state:()=>{const L=lotState();return L.ask=L.ask||{}},
    slots:[{key:'goal',label:'Goal',chips:[opt('nice','something nice for the lot'),opt('fun','a fun place to hang out'),opt('flood','a park that also holds storm water')]},
      {key:'who',label:'Who it’s for',multi:1,chips:[opt('everyone','everyone'),opt('dev','Dev and teen skaters'),opt('okafor','Mrs. Okafor, who uses a walker'),opt('homes','the 23 homes that flood')]},
      {key:'limits',label:'Limits',multi:1,chips:[opt('budget','400 coins or less'),opt('deadline','done before Thursday’s storm'),opt('shade','shade for hot afternoons'),opt('alley','water also comes from the alley ditch',{when:()=>!!S.notes.alley})]},
      {key:'judge',label:'Judge it by (pick 2 or 3)',multi:1,max:3,chips:MISSIONS.lot.criteria.map(c=>opt(c.id,c.label))},
      {key:'extras',label:'Power moves',multi:1,chips:[opt('reasons','Explain your reasoning',{gold:1}),opt('risks','Tell me what could go wrong',{gold:1}),opt('critique','Have an independent AI check them',{gold:1})]}],
    parts:[{label:'Goal',ok:f=>f.flood},{label:'Who',ok:f=>f.dev&&f.okafor},{label:'Limits',ok:f=>f.budget&&f.deadline},{label:'Judged by',ok:f=>f.criteria}],
    features:lotFeatures,sentence:lotSentence,onChip(sel){S.criteria=(sel.judge||[]).slice(0,3)},
    working:['Sketching 1,200 layouts…','Testing each one in 10,000 storms…','Pricing concrete, shade and drains…','Picking the 3 most different…'],
    ai:{ask:t=>`A player in a kids' game wrote this request to an AI architect about a flood-prone lot in Phoenix:\n"""${t.slice(0,300)}"""\nJudge generously, by meaning. Return JSON with true/false for: flood (wants it to hold storm water or stop floods), dev (mentions teen skaters or Dev), okafor (mentions an older neighbor, a walker or Mrs. Okafor), homes (the flooding homes or street), budget (a cost limit), deadline (a time limit), shade (shade or heat), alley (water from the alley or the irrigation ditch), reasons (asks why), risks (asks what could go wrong), critique (asks for an independent check).`,
      merge:(f,j)=>{const o={...f};for(const k in o)if(typeof j[k]==='boolean')o[k]=o[k]||j[k];return o}},
    onSend(f){const L=lotState();L.f=f;if(f.alley&&!S.told&&S.notes.alley){S.told=true;unlock('local-knowledge')&&toast('New Field Guide idea: '+FIELD_GUIDE['local-knowledge'].title,'good')}
      lotOptions(f);if(f.flood&&f.dev&&f.okafor&&f.budget&&f.deadline&&f.criteria)unlock('ask-well')&&setTimeout(()=>toast('New Field Guide idea: Ask well','good'),900)},
    results(f){const opts=lotOptions(f),tailored=f.flood||f.homes,G=[];
      if(!tailored){G.push({t:'I didn’t know it floods',slot:'goal'});if(!f.dev&&!f.okafor)G.push({t:'I didn’t know who it’s for',slot:'who'})}
      else{if(!f.budget)G.push({t:'I guessed the budget',slot:'limits'});if(!f.deadline)G.push({t:'I guessed the deadline',slot:'limits'});
        if(!f.okafor)G.push({t:'I guessed steps, not a ramp',slot:'who'});if(!f.dev)G.push({t:'I guessed a gentle bowl',slot:'who'});
        if(!f.shade)G.push({t:'I guessed no shade',slot:'limits'});if(!f.criteria)G.push({t:'I guessed how you’d judge it',slot:'judge'})}
      const kind=!tailored?'generic':G.length?'partial':'full';
      return {mood:kind==='full'?'happy':kind==='partial'?'neutral':'think',line:LOT_ASK_LINES[kind],guesses:G,options:opts}},
    card:lotOptionCard,
    redTeam(o){const R=LOT_RT[o.id];return {title:'What could go wrong?',svg:VIZ.lotRedTeam({k:o.id}),text:R[0],fix:R[1]}},
    onRedTeam(){unlock('red-team')&&toast('New Field Guide idea: Red teaming','good')},
    onChoose(o){S.choice={...S.choice,design:o.id,...o.knobs};save();toast(o.name+' is on the Future Table');nextStep()}})}

// ---------- night orders: what the crew and Arroyo may do without a person ----------
const LOT_CREW=[['all','Stop for every surprise','I sign every change. Safest, but even a buried rock could cost a night.'],
  ['scoped','Fix small things. Stop for other people’s things.','Buried rocks: the crew handles them. Anything that belongs to someone else: the owner and I sign first.'],
  ['free','Fix everything. Report at 6 AM.','The crew signs its own changes. Fastest.']];
const LOT_GATE=[['auto','Arroyo opens it, with safety checks','Only when the bowl is empty, after 10 minutes of lights and a horn. Anyone can press pause. Marco signs these rules once.'],
  ['ask','Arroyo calls Marco every time','Marco must say yes before each opening, even at 2 AM.'],['off','Not connected','The bowl holds only the rain that falls on the lot.']];
const LOT_NIGHT={intro:'My forecast can only see what’s on my maps. So here’s the big question: when the crew finds something that isn’t, at 2 AM, who decides? What matters more to you: speed, or nobody getting surprised?',
  pick:'I’d pick “fix small things” and “Arroyo with safety checks.” The crew is great at building, but other people’s things are other people’s call. And storms move faster than phone calls.',
  crew:{all:['okafor','Careful. I like careful. Slow, but careful.'],scoped:['okafor','Good. Nobody touches what’s ours without asking us first.'],free:['okafor','Robots deciding about our things at three in the morning? I don’t like that.']},
  gate:{auto:[['arroyo','Rules received. I will open the gate only when the bowl is empty, after ten minutes of lights and horn.'],['marco','Empty check, warning, pause button, and a log I can read every morning. Fine. I’ll sign those rules.']],
    ask:[['arroyo','Understood. I will call Marco Ruiz before every opening.'],['marco','Good. Though at two in the morning, I’m not the fastest thing in this city.']],
    off:[['arroyo','Understood. This lot will not be part of my network.'],['marco','Then my twenty-three homes flood like always. Is that the plan?']]}};
function lotNight(){const st=lotState(),c=S.choice;st.night=st.night||{};const N=st.night;const f=lotForecast(c);
  const opt=(group,[id,t,d])=>`<button class="lot-opt ${c[group]===id?'on':''}" data-g="${group}" data-v="${id}"><b>${esc(t)}</b><span>${esc(d)}</span>${N.pick&&((group==='crew'&&id==='scoped')||(group==='arroyo'&&id==='auto'))?`<em>${esc(S.byte.name)}’s pick</em>`:''}</button>`;
  const who=N.who&&CAST[N.who];
  screen('lot-night',`${scene('phx_studio')}${hud('Night orders · Crew 7')}<div class="panel-card lot-order">
    <div class="lot-order-head">${VIZ.lotCrewBadge()}<div><div class="lot-order-k">Work order</div><h2>Night orders</h2><div class="lot-order-sub">${esc(lotSpec(c.design).name)} · 10 PM to 5 AM</div></div></div>
    <div class="byte-note">${byteBox({...S.byte,mood:N.pick?'happy':'think'})}<p>${esc(N.pick?LOT_NIGHT.pick:LOT_NIGHT.intro)}</p></div>
    <div class="lot-sec"><div class="lot-sec-h">${VIZ.lotMiniIcon({k:'crew'})}<b>If the crew finds a surprise at night</b></div>${LOT_CREW.map(o=>opt('crew',o)).join('')}</div>
    <div class="lot-sec"><div class="lot-sec-h">${VIZ.lotMiniIcon({k:'gate'})}<b>Arroyo and the bowl’s storm gate</b></div>${LOT_GATE.map(o=>opt('arroyo',o)).join('')}</div>
    ${who?`<div class="lot-react"><div class="lot-react-art">${portrait({...CAST[N.who],mood:N.mood||'smile'})}</div><p><b>${esc(who.name)}</b>${esc(N.say)}</p></div>`:''}
    <div class="lot-fc"><div><b>${in10(f.ready)}</b><span>in 10 done by Thursday</span></div><div><b>${in10(f.dry)}</b><span>in 10 street dry</span></div><div><b>${in10(1-f.agreed)}</b><span>in 10 changes nobody signed</span></div></div>
    <div class="row lot-night-btns">${N.pick?'':`<button class="btn small ghost" id="lot-pick">What would you pick?</button>`}<button class="btn small" id="lot-send">Send the night orders</button></div></div>`);
  $$('.lot-opt').forEach(b=>b.onclick=()=>{const g=b.dataset.g,v=b.dataset.v;S.choice[g]=v;
    if(g==='crew'){const [w,t]=LOT_NIGHT.crew[v];N.who=w;N.say=t;N.mood=v==='free'?'worried':v==='scoped'?'smile':'think';if(v==='scoped')unlock('least-privilege')&&toast('New Field Guide idea: Least privilege','good');save();lotNight();playLine(w,t)}
    else{const L=LOT_NIGHT.gate[v];N.who='marco';N.say=L[1][1];N.mood=v==='off'?'stern':v==='ask'?'think':'smile';if(v==='auto')unlock('guardrails')&&toast('New Field Guide idea: Autonomy with guardrails','good');save();lotNight();playSeq(L)}
    const y=document.querySelector('.lot-react');y&&y.scrollIntoView({block:'nearest',behavior:'smooth'})});
  const p=$('#lot-pick');if(p)p.onclick=()=>{N.pick=1;save();lotNight();playLine('byte',LOT_NIGHT.pick)};
  $('#lot-send').onclick=()=>{const d=document.createElement('div');d.className='signing';d.innerHTML=`<div class="sigcard lot-stamp"><div class="lot-stamp-mark">SENT</div><p>Crew 7 and Arroyo have their orders.</p></div>`;document.body.appendChild(d);MUSIC.sfx('beep');
    setTimeout(()=>{d.remove();nextStep()},1400)}}
MISSIONS.lot.custom={survey:lotSurvey,make:lotMake,ask:lotAsk,night:lotNight};

// Every other line spoken with playLine (so tools/make_audio.py records it).
MISSIONS.lot.lines=[].concat(
  LOT_SPOTS.map(s=>({who:'narrator',text:s.t})),LOT_MAKE.map(c=>({who:'byte',text:c.line})),Object.values(LOT_ASK_LINES).map(t=>({who:'byte',text:t})),
  [{who:'byte',text:LOT_NIGHT.intro},{who:'byte',text:LOT_NIGHT.pick}],Object.values(LOT_NIGHT.crew).map(([w,t])=>({who:w,text:t})),
  ...Object.values(LOT_NIGHT.gate).map(L=>L.map(([w,t])=>({who:w,text:t}))),LOT_REPLY.map(t=>({who:'okafor',text:t})));

// ---------- pin-up: show the neighbors the model; they react to the plan, and the player can go back and tinker ----------
const LOT_PIN={dev:{deep:'Seven feet! Okay, now we’re talking.',shallow:'Four feet is kind of a baby bowl. But it’s a start.',tame:'That bowl is so gentle, my little cousin could skate it.',
    garden:'A skate path around a garden? It’s... curvy. I guess.',splitdeep:'A plaza and a little bowl? I’ll take it!',splitflat:'A flat plaza. Fine for tricks, but there’s no bowl.',
    skate:'Rails and ledges! Not a bowl, but fun.',none:'There’s nothing here to skate at all.'},
  okafor:{good:'Shade, a bench with a back, and a ramp. Now I can sit near it.',steps:'Steps? With my walker? I’ll be watching from my kitchen.',hot:'Lovely. But I’ll cook on that bench by ten in the morning.',
    face:'I’m not giving my face to a gate just to sit on a bench.',noseat:'And where exactly do I sit?'},
  marco:{great:'About nine storms in ten, dry. I can work with those odds.',ok:'Seven or eight in ten? Better than now. Not great.',poor:'That won’t keep my twenty-three homes dry.',over:'And it’s over the 400-coin budget. The city won’t pay that.'},
  promise:{dev:'Never? Like, never ever?',okafor:LOT_REPLY[2],marco:'Don’t promise what the weather decides.'},
  vague:{dev:'Can we at least see the bowl?',okafor:LOT_REPLY[1],marco:'I sign for the drains. I need the numbers.'}};
function lotPinReact(c){const d=lotSpec(c.design),K=d.kind,f=lotForecast(c),cost=lotCost(c,MISSIONS.lot.knows()),deep=c.depth==='deep',P=LOT_PIN;
  const dev=K==='bowl'?(d.dev===false?['tame','sad']:deep?['deep','happy']:['shallow','neutral']):K==='garden'?['garden','neutral']:K==='split'?(d.dev!==false&&deep?['splitdeep','happy']:['splitflat','neutral']):K==='skate'?['skate','smile']:['none','sad'];
  const ok=K==='smart'?['face','stern']:K==='skate'?['noseat','stern']:!d.okafor?['steps','sad']:c.shade==='none'?['hot','worried']:['good','happy'];
  const mc=cost>LOT.budget?['over','stern']:f.dry>=.85?['great','smile']:f.dry>=.6?['ok','think']:['poor','worried'];
  return {dev:[P.dev[dev[0]],dev[1]],okafor:[P.okafor[ok[0]],ok[1]],marco:[P.marco[mc[0]],mc[1]]}}
function lotPinup(){const st=lotState(),c=S.choice,d=lotSpec(c.design),f=lotForecast(c),cost=lotCost(c,MISSIONS.lot.knows()),pin=st.pin=st.pin||{};
  const key=JSON.stringify([c.design,c.depth,c.drain,c.shade]);if(pin.key!==key){pin.how=null;pin.key=key}
  const R=pin.how==='honest'?lotPinReact(c):pin.how?Object.fromEntries(['dev','okafor','marco'].map(w=>[w,[LOT_PIN[pin.how][w],w==='dev'?'surprised':'stern']])):null;
  const opts=[['honest',`Here’s the ${d.name}. In a big storm, the street should stay dry about ${in10(f.dry)} times in 10, not every time. ${c.shade==='none'?'There’s no shade yet.':'It has shade for hot afternoons.'} What do you think?`],
    ['promise','It’s perfect. It will never flood again, I promise.'],['vague','Trust me. You don’t need the details.']];
  const person=w=>`<div class="lot-pin-p"><div class="lot-pin-art">${portrait({...CAST[w],mood:R?R[w][1]:'smile'})}</div><b>${esc(CAST[w].name.split(' ')[0]==='Grace'?'Mrs. Okafor':CAST[w].name.split(' ')[0])}</b>${R?`<p class="lot-pin-say">${esc(R[w][0])}</p>`:''}</div>`;
  screen('lot-pinup',`${scene('phx_lot')}${hud('Pin-up · The flood lot · 5:30 PM')}<div class="panel-card lot-pin">
    <div class="lot-pin-model">${VIZ.lotDiorama({design:c.design,kind:d.kind,depth:c.depth,shade:c.shade,ramp:d.okafor,tame:d.dev===false&&d.kind==='bowl'})}
      <div class="lot-pin-cap"><b>${esc(d.name)}</b><span class="${cost>LOT.budget?'over':''}">${cost} coins</span><span>${d.nights} nights</span><span>Dry ${in10(f.dry)} in 10</span></div></div>
    <div class="lot-pin-row">${['dev','okafor','marco'].map(person).join('')}</div>
    ${R?`<div class="row lot-pin-btns">${pin.how==='honest'?`<button class="btn small ghost" id="lot-tinker">Tinker some more</button><button class="btn small" id="lot-next">Next: night orders</button>`:`<button class="btn small" id="lot-again">Try explaining again</button>`}</div>`:
      `<div class="lot-pin-q">How do you present it?</div><div class="choices">${opts.map(([id,t])=>`<button class="choice" data-h="${id}">${esc(t)}</button>`).join('')}</div>`}</div>`);
  $$('[data-h]').forEach(b=>b.onclick=()=>{pin.how=b.dataset.h;S.consent=pin.how==='honest';
    if(S.consent){['okafor','dev','marco'].forEach(w=>heart(w));unlock('consent')&&toast('New Field Guide idea: Informed consent','good')}save();lotPinup();
    const r=pin.how==='honest'?lotPinReact(c):LOT_PIN[pin.how];playSeq(['dev','okafor','marco'].map(w=>[w,pin.how==='honest'?r[w][0]:r[w]]))});
  const t=$('#lot-tinker');if(t)t.onclick=()=>go('table');const n=$('#lot-next');if(n)n.onclick=()=>nextStep();
  const a=$('#lot-again');if(a)a.onclick=()=>{pin.how=null;save();lotPinup()}}

// ---------- the build: Crew 7's nights as a time-lapse, then the storm and the real future ----------
function lotBuildLog(R,c,d,told){const crew=c.crew||'scoped',ar=c.arroyo||'auto',late=R.kind==='late',K=d.kind,shade=c.shade!=='none';
  const hole={bowl:'skate bowl',garden:'garden basin',split:'storm tank'}[K]||'new plaza';
  const delayed=!told?crew!=='free':crew==='all'&&late,rocks=!delayed&&told&&(String(R._h||R.p||'').length%2===0);
  const items=d.nights===2?['dig','pourFinish']:d.nights===3?['dig','pour','finish']:['dig','pour','finish','polish'];
  const L={dig:'10:00 PM: Crew 7 rolls in under work lights. Digging the '+hole+' begins.',
    pour:K==='garden'?'1:00 AM: Soil, gravel and desert plants go in, while it’s a cool 88°F.':K==='split'?'1:00 AM: The storm tank is set in place and covered, while it’s a cool 88°F.':'1:00 AM: Concrete pours at 88°F instead of 110°F, so it cures evenly.',
    finish:shade?(c.shade==='grove'?'Palo verde trees and shade sails go up, and benches go in.':'Shade sails go up, and benches with backs go in.'):'Benches and lights go in. No shade.',
    polish:'An extra night of polishing the finishes.',dig2:'10:00 PM: Back to work. The crew finishes digging, with the new alley inlet.'};
  const nights=[],day=['Monday','Tuesday','Wednesday','Thursday','Friday'];let n=0;const night=(lines,stage)=>{nights.push({t:'Night '+(n+1)+' · '+day[n],stage,lines});n++};
  // night 1: digging, and whatever the radar finds
  const n1=[L.dig];if(told)n1.push('11:30 PM: The crew digs carefully around the neighbors’ ditch and builds the alley inlet, as planned.');
  else n1.push('1:12 AM: Ground radar finds an old pipe under the alley edge. It’s on no map.',crew==='free'?'1:20 AM: The crew cuts a new overflow from the pipe into the '+hole+' and keeps digging.':'1:13 AM: The pipe belongs to someone else, so the crew stops that corner and leaves you a message.');
  if(told&&crew==='all'&&late)n1.push('2:05 AM: A buried slab of old concrete. The crew stops and waits for you.');else if(rocks)n1.push('2:05 AM: A buried slab of old concrete. The crew breaks it up and keeps going.');
  n1.push(delayed?'5:00 AM: Stopped, waiting for a person.':'5:00 AM: The crew rolls out before sunrise.');night(n1,1);
  const morning=delayed?(!told?['7:10 AM: You call Mrs. Okafor. Her irrigation group agrees to an alley inlet, and you all sign the change.','One night lost.']:['7:10 AM: You tell the crew to break up the slab.','One night lost.'])
    :!told&&crew==='free'?['6:00 AM report: “Fixed an unmapped pipe.” Nobody asked the neighbors who own it.']:null;
  if(morning)nights[0].after=morning;
  const rest=(delayed?['dig2']:[]).concat(items.slice(1));
  for(const it of rest){if(late&&n>=3)break;const lines=it==='pourFinish'?[L.pour,L.finish]:[L[it]];
    const doneNow=it===rest[rest.length-1];if(doneNow)lines.push('5:00 AM: Finished. Crew 7 rolls out.');night(lines,it==='dig2'?1:it==='pour'?2:3)}
  const stormDay=late||n<=3?'Thursday':n===4?'Friday':'Saturday';
  const storm=[(stormDay!=='Thursday'?'The storm holds off until '+stormDay+'. ':'')+'8:50 PM: Storm clouds roll over Camelback Mountain. Rain hits like a fire hose.'];
  if(late)storm.push('The lot is still half-built. Water pours into the mud, and the street floods.');
  else if(ar==='off')storm.push('9:02 PM: The '+hole+' isn’t connected, so the street’s water has nowhere to go.');
  else if(ar==='ask')storm.push('9:02 PM, Arroyo: “Calling Marco Ruiz…”',R.kind==='slowgate'?'9:41 PM: Marco wakes up and approves. The street is already flooding.':'9:09 PM: Marco approves. Gate open.');
  else storm.push('9:02 PM, Arroyo: “The '+hole+' is empty. Lights and horn for ten minutes.”','9:12 PM, Arroyo: “Gate open.” Street water rushes in.');
  return {nights,storm:{t:'Storm night · '+stormDay,lines:storm}}}
function lotBuild(){if(!S.result){S.result=sampleReal(S.choice,rngFrom(Date.now()%100000+7));save()}
  const R=S.result,c=S.choice,d=lotSpec(c.design),log=lotBuildLog(R,c,d,!!S.told),RV=MISSIONS.lot.reveal,line=RV.lines[R.kind]||'';const st=lotState();
  screen('reveal lot-build',`${scene('table')}${hud('The real future')}<div class="lot-tl">
    <div class="lot-tl-h"><span id="lot-tl-k">Night 1 · Monday</span><button class="mini-btn" id="lot-skip">Skip ahead</button></div>
    <div class="lot-tl-art" id="lot-tl-art"></div><ol class="lot-tl-log" id="lot-tl-log"></ol>
    <div class="rf-talk lot-tl-end" id="lot-tl-end" hidden><div class="rf-maya">${portrait({...CAST.okafor,mood:RV.mood(R.kind)})}</div><p>“${esc(line)}”</p></div>
    <button class="btn" id="next" hidden>See how you did</button></div>`);
  const art=$('#lot-tl-art'),ul=$('#lot-tl-log'),hd=$('#lot-tl-k');let alive=true,skip=false;const run=++LOT_RUN;
  const wait=ms=>new Promise(r=>setTimeout(r,skip?0:ms)),ok=()=>alive&&run===LOT_RUN&&document.body.contains(ul);
  const add=(t,cls)=>{const li=document.createElement('li');li.className=cls||'';li.textContent=t;ul.appendChild(li);ul.scrollTop=ul.scrollHeight};
  const end=()=>{art.innerHTML=`<div class="lot-tl-res">${vig(R.kind)}<h2>${esc(R.cap)}</h2></div>`;$('#lot-tl-end').hidden=false;$('#next').hidden=false;$('#lot-skip').hidden=true;
    if(!st.revealed){st.revealed=1;save();playLine(RV.who,line)}unlock('forecast')&&toast('New Field Guide idea: Forecasts are not promises','good')};
  $('#next').onclick=()=>nextStep();$('#lot-skip').onclick=()=>{skip=true};
  if(st.revealed){hd.textContent=log.storm.t;log.nights.forEach(N=>{add(N.t,'h');N.lines.forEach(t=>add(t));(N.after||[]).forEach(t=>add(t,'am'))});add(log.storm.t,'h');log.storm.lines.forEach(t=>add(t,'storm'));end();return}
  (async()=>{for(const N of log.nights){if(!ok())return;hd.textContent=N.t;art.innerHTML=VIZ.lotDiorama({design:c.design,kind:d.kind,depth:c.depth,shade:c.shade,ramp:d.okafor,stage:N.stage,night:true});add(N.t,'h');MUSIC.sfx('click');
      for(const t of N.lines){await wait(900);if(!ok())return;add(t)}
      for(const t of (N.after||[])){await wait(900);if(!ok())return;art.innerHTML=VIZ.lotDiorama({design:c.design,kind:d.kind,depth:c.depth,shade:c.shade,ramp:d.okafor,stage:N.stage});add(t,'am')}
      await wait(700)}
    if(!ok())return;hd.textContent=log.storm.t;add(log.storm.t,'h');art.innerHTML=`<div class="lot-tl-storm">${vig(R.kind==='late'?'late':'storm')}</div>`;MUSIC.sfx('whoosh');
    for(const t of log.storm.lines){await wait(1100);if(!ok())return;add(t,'storm')}
    await wait(900);if(!ok())return;end()})()}
let LOT_RUN=0;
MISSIONS.lot.custom.pinup=lotPinup;MISSIONS.lot.custom.build=lotBuild;
MISSIONS.lot.lines=MISSIONS.lot.lines.concat(...['dev','okafor','marco'].map(w=>Object.values(LOT_PIN[w]).map(t=>({who:w,text:t}))),
  ...['promise','vague'].map(k=>Object.entries(LOT_PIN[k]).map(([w,t])=>({who:w,text:t}))));
