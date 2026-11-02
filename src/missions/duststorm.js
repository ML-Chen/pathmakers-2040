// missions/duststorm.js — Jezero Crater, Mars (Discovery Base). Mars Explorer, Day 1: "One Night of Power".
// A regional dust storm is coming, and the outpost's battery has to last one long night with the solar panels dark.
// Delta, the outpost AI, gives an honest forecast with ranges and odds, and its default plan follows an old priority
// list that puts the greenhouse last. Lucía's first tomatoes and her birthday message to her son both need power. Dev
// tells the player, privately, that he sleeps with a breathing machine on a cabin outlet that Delta's storm rule turns
// off at 10 PM (the clue). The player sets tonight's power budget (custom step ds_power), explains it to the crew, signs
// it, and lives through the night hour by hour, with one chance to change the plan when Delta updates at 1 AM (ds_night).
// Pictures: src/viz/duststorm.js; cast art: src/viz/space_cast.js; scenes: src/scenes/mars.js; styles: src/css/duststorm.css.
// Mission state: S.notes.ds = {B, long, mid:{gh,cabin}, step} (startMission resets S.notes, so a replay starts fresh).
CAREERS.explorer={name:'Mars Explorer',place:'Jezero Crater, Mars',district:'mars',why:'People want humans to go to new places.'};

// ---------- the power model (kilowatt-hours over the night, 6 PM to 7 AM) ----------
const DS_LIFE=26,DS_FLOOR=5,DS_LONG=8,DS_HOURS=13;
const DS_LOAD={cabin:{warm:5,cool:0},gh:{lights:12,heat:4,off:0},msg:{send:2,wait:0}},DS_CPAP=.5;
const DS_BATT=[[48,.25],[52,.5],[55,.25]],DS_PLONG=.35;
function dsState(){S.notes=S.notes||{};S.notes.ds=S.notes.ds||{};return S.notes.ds}
function dsNeed(c,cpap){return DS_LIFE+DS_LOAD.cabin[c.cabin]+DS_LOAD.gh[c.gh]+DS_LOAD.msg[c.msg]+(cpap?DS_CPAP:0)}
function dsSafeAt(B,long,need){return B-need-(long?DS_LONG:0)>=DS_FLOOR}
// the flags for one night. know: whether the cpap need is known (and so powered). need may include mid-night savings.
function dsFlags(c,B,long,know,need){const safe=dsSafeAt(B,long,need);
  return {safe:safe?1:0,tomatoes:safe&&c.gh!=='off'?1:0,rest:safe&&(know.cpap||!know.real)?1:0,message:c.msg==='send'?1:0}}
function dsKind(f,c){return !f.safe?'rover':!f.tomatoes?'frost':!f.rest?'tired':!f.message?'late':'dawn'}
const DS_CAPS={rover:'The battery ran low, so everyone slept in the rover.',frost:'The greenhouse froze. The first tomatoes are gone.',tired:'Dev’s outlet shut off at 10 PM. He hardly slept.',late:'Everyone’s fine, but the message to Earth missed its window.',dawn:'Sunrise! Everyone is warm, and the tomatoes made it.'};
function dsOutcomes(c,K){const out={},cpap=!!K.cpap,need=dsNeed(c,cpap);
  for(const [B,pb] of DS_BATT)for(const long of [1,0]){const p=pb*(long?DS_PLONG:1-DS_PLONG);const f=dsFlags(c,B,long,{cpap,real:K.real},need);const kind=dsKind(f,c);const key=kind+JSON.stringify(f);(out[key]=out[key]||{kind,p:0,flags:f,cap:DS_CAPS[kind]}).p+=p}
  return Object.values(out)}

MISSIONS.duststorm={id:'duststorm',title:'One Night of Power',career:'explorer',day:1,kind:'workday',year:2,season:'fall',district:'mars',rank:'trainee',
  blurb:'A dust storm is coming, and the shelter has power for one night.',after:['maya'],place:'Jezero Station · Mars',
  byteWear(step){return ['ds_morning','ds_dev','ds_evening'].includes(step)?['helmet']:[]},
  flow:[{name:'ds_morning',k:'talk',talk:'morning',scene:'mars',place:'Jezero Station · Mars · 2:40 PM'},
    {name:'ds_delta',k:'talk',talk:'delta',scene:'mars',place:'Control room · Jezero Station'},
    {name:'ds_lucia',k:'talk',talk:'lucia',scene:'mars',place:'Greenhouse 2 · Jezero Station'},
    {name:'ds_dev',k:'talk',talk:'dev',scene:'mars',place:'Rover bay · Jezero Station',toast:'New work on your Workbench'},
    {name:'ds_bench',k:'bench'},{name:'ds_power',k:'custom',music:'work'},{name:'ds_criteria',k:'criteria'},
    {name:'ds_consent',k:'consent'},{name:'ds_memo',k:'memo'},{name:'ds_night',k:'custom',music:'table'},
    {name:'ds_debrief',k:'debrief'},{name:'ds_evening',k:'evening'}],
  cast:{
    lucia:{name:'Lucía Prado',role:'Botanist · greenhouse lead',skin:'#d8a080',hair:'#3a2418',hairStyle:'curls',eye:'#5a3418',accessory:'earring',
      space:'jumper',shirt:'#6f9a72',trim:'#e8b84a',leafpin:true,get art(){return typeof SC_CAST_ART!=='undefined'?SC_CAST_ART(this):undefined}},
    devr:{name:'Dev Raman',role:'Engineer · rover driver',skin:'#a8704c',hair:'#2a2424',hairStyle:'short',beard:'mustache',masc:true,eye:'#2a1a10',accessory:'beanie',hatColor:'#3a6a8a',
      space:'suit',shirt:'#e8783a',trim:'#3a4a6a',patch:'#3a4a6a',get art(){return typeof SC_CAST_ART!=='undefined'?SC_CAST_ART(this):undefined}},
    delta:{name:'Delta',role:'Outpost AI · Jezero Station',get art(){return typeof deltaArt==='function'?m=>deltaArt(m):undefined}}
  },
  voices:{lucia:'af_nicole',devr:'am_eric',delta:'af_kore'},
  glossary:{
    'jezero crater':'A real crater on Mars, about 45 kilometers wide. Billions of years ago a river flowed into it and left a delta.',
    'delta':'The fan of mud and sand a river leaves where it flows into a lake or sea.',
    'outpost':'A small base far from home, where a few people live and work.',
    'dust storm':'A storm of wind and fine dust. On Mars, one can cover a whole region and block sunlight for days.',
    'kilowatt-hour':'A way to measure energy. One kilowatt-hour runs a space heater for about an hour.',
    'kilowatt-hours':'A way to measure energy. One kilowatt-hour runs a space heater for about an hour.',
    'kwh':'Short for kilowatt-hour, a way to measure energy.',
    'battery':'A store of electric energy that you can use later.',
    'solar panels':'Flat panels that turn sunlight into electricity.',
    'life support':'The machines that keep air, water and warmth safe for people to live.',
    'emergency reserve':'Energy you save and never plan to use, in case something goes wrong.',
    'relay':'A satellite that passes messages between Mars and Earth.',
    'relay window':'The time when the relay satellite is overhead and can carry messages.',
    'grow lights':'Lamps that give plants the colors of light they need to grow.',
    'range':'The lowest and highest values something is likely to be.',
    'forecast':'A careful guess about what will happen, often with odds.',
    'breathing machine':'A small machine some people wear while they sleep. It gently pushes air so their throat stays open.',
    'sol':'A day on Mars. It is about 24 hours and 40 minutes long.',
    'priority list':'A list that says what comes first, second and third when you can’t do everything.',
    'mission control':'The team on Earth that plans and supports a space mission.',
    'sunset':'When the Sun goes down below the horizon.'
  },
  guide:{
    'mars-ranges':{title:'Forecasts with ranges',track:'Evidence and truth',text:'An honest forecast gives a range and odds, not one exact number. Delta said the storm would come between 5 and 8 PM, and might last into the morning about 35% of the time. A good plan works even near the bad end of the range.',real:'True today: weather forecasters say things like “a 30% chance of rain,” and hurricane maps show a cone of places the storm might go.'},
    'mars-budget':{title:'A power budget',track:'Engineering and systems',text:'When energy is limited, add up what everything needs, keep a reserve for surprises, and then choose what matters most. Keeping the greenhouse warm but dark saved a lot of power for very little harm.',real:'True today: Mars rovers run on carefully budgeted power. When dust covered the solar panels of NASA’s InSight lander, it shut down instruments one by one to save energy.'},
    'mars-private':{title:'Private needs',track:'People skills',text:'Some needs are private. Dev told you about his breathing machine because he trusted you. You asked before telling Delta, and Delta only needed to know that one outlet must stay on.',real:'True today: doctors and nurses must keep health information private, and share only what others need to know to help.'},
    'mars-real':{title:'Mars, today and in this game',track:'Math and science',text:'Mars has thin air full of fine red dust, so its daytime sky looks butterscotch, and its sunsets glow blue around the Sun. Dust storms can cover a region for days and block the sunlight that solar panels need.',real:'True today: robot rovers have explored Jezero Crater since 2021, and they have filmed dust devils and blue sunsets there. No person has been to Mars yet. The outpost, the crew and the tomatoes are this game’s guess about 2041.'}
  },
  chatter:{mars:['The dust gets into everything. My socks are pink now.','Did you see the dust devil this morning? It went right past the panels.','Three tomatoes! Lucía has named every one of them.','Earth is just a bright dot from here. I wave at it anyway.','The messages from home take twelve minutes to arrive today.'],
    mars_dusk:['Blue sunsets. I’ll never get used to them.','That bright star is Earth. Everyone I love is on it.']},
  talks:{
    morning:[
      {who:'byte',mood:'happy',text:'Good afternoon, Explorer! Welcome to Jezero Station on Mars. Six people live here, plus a lot of robots and me.'},
      {who:'byte',mood:'neutral',text:'Today the robots cleaned the [[solar panels]], the crew logged rock samples from the old river [[delta]], and Lucía’s first three tomatoes turned red.'},
      {who:'byte',mood:'think',text:'But there’s news. A [[dust storm]] is coming from the east. Tonight the panels will go dark, and the station runs on its [[battery]] alone.',choices:[
        {t:'What’s my job today?',reply:'You lead tonight. Delta, the outpost AI, keeps the power running, but you decide what gets power when there isn’t enough for everything. Then you sign the plan.'},
        {t:'Is the crew in danger?',reply:'Not if we plan well. The habitat is built for storms. The hard part is choosing what to keep on, because the battery can’t do it all.'}]}
    ],
    delta:[
      {who:'delta',mood:'neutral',text:'Hello, Explorer. I’m Delta. I run the station’s power, air and heat. Here is my storm [[forecast]], with honest [[range]]s.'},
      {who:'delta',mood:'think',text:'The storm front should arrive between 5 and 8 PM. Most likely, it comes at about 6:30. At [[sunset]], the battery should hold 48 to 55 [[kilowatt-hours]].'},
      {who:'delta',mood:'worried',text:'There is about a 35% chance the storm is still here at sunrise. Then the panels give only a fifth of their power until noon, and we need 8 more kilowatt-hours to get through the morning.'},
      {who:'delta',mood:'neutral',text:'My default plan follows the [[priority list]] that [[mission control]] wrote years ago. [[Life support]] comes first, then crew comfort, then science. The greenhouse comes last, so it goes off tonight.',choices:[
        {t:'Can we change that order tonight?',good:true,mood:'smile',reply:'Yes. The list is only a starting point. You lead this station, so tonight’s order is your call. I’ll show you exactly what each choice costs.'},
        {t:'You know best. Use your plan.',mood:'think',reply:'I can run my plan safely. But my list was written before anyone grew food here. You should hear from the crew before you decide.'}]}
    ],
    lucia:[
      {who:'lucia',mood:'happy',text:'Explorer! Come see. Three red tomatoes, the first ever grown on Mars. I’ve named them Uno, Dos and Tres.'},
      {who:'lucia',mood:'worried',text:'If the greenhouse goes cold tonight, the flowers die, and the tomatoes freeze. We’d have to start again, and that takes four months.'},
      {who:'lucia',mood:'think',text:'Here’s the thing. The plants can live through one dark night, as long as they stay warm. Heat only, no lights. They won’t mind the dark.'},
      {who:'lucia',mood:'smile',text:'One more thing, and it’s just for me. My son Caio turns ten tomorrow, back home in Recife. I recorded a birthday message, and the [[relay window]] closes at 9 PM.',choices:[
        {t:'Ten! Does he know about the tomatoes?',good:true,mood:'happy',reply:'He made me promise to save him the first seed. He wants to plant it in our backyard. That boy.'},
        {t:'Messages can wait a day, right?',mood:'sad',reply:'They can. It’s only a birthday. I just hoped he’d hear from me on the day.'}]}
    ],
    dev:[
      {who:'devr',mood:'smile',text:'Hey, Explorer. I’m Dev. I keep the rovers running and the habitat in one piece. Hand me that strap, would you?'},
      {who:'devr',mood:'neutral',text:'Rover’s parked nose to the wind and fully charged on its own battery. If anything goes wrong tonight, six people fit inside. Snugly.'},
      {who:'devr',mood:'worried',text:'Can I tell you something, just you? I sleep with a [[breathing machine]]. My throat closes up at night, and the machine keeps the air flowing.'},
      {who:'devr',mood:'stern',text:'It runs on my cabin outlet. Delta’s storm rule turns off the cabin outlets at 10 PM. I never put it in my records. I didn’t want everyone fussing over me.',clue:'cpap'},
      {who:'devr',mood:'think',text:'It doesn’t use much. I just need it to stay on.',choices:[
        {t:'Can I tell Delta? It only needs to know that outlet stays on.',good:true,mood:'smile',reply:'Yes. Just Delta, and only that. Thanks for asking me first.'},
        {t:'Let’s tell the whole crew at dinner.',mood:'worried',reply:'I’d really rather you didn’t. Could you just make sure the outlet stays on?'}]}
    ]
  },
  docs:[
    {id:'dforecast',title:'Delta’s storm forecast',from:'Delta',kind:'forecast',steps:[
      {t:'A regional [[dust storm]] is moving toward [[Jezero Crater]] from the east.',viz:'dsStormMove',cap:'The storm'},
      {t:'The storm front should arrive between 5 and 8 PM. Most likely, it comes at about 6:30.',viz:'dsArrive',cap:'When it arrives'},
      {t:'Inside the storm, sunlight drops to almost nothing, so the [[solar panels]] stop charging.',viz:'dsSolarDrop',cap:'The panels go dark'},
      {t:'The [[battery]] should hold 48 to 55 [[kilowatt-hours]] at [[sunset]], most likely 52. If the storm comes early, we lose the last hour of charging.',viz:'dsBattery',cap:'The battery'},
      {t:'Sunrise is at 7 AM. There is about a 35% chance the storm is still here, and then we need 8 more kilowatt-hours to reach noon.',viz:'dsLongStorm',cap:'35 in 100'},
      {t:'The battery must never fall below 5 kilowatt-hours. That is our [[emergency reserve]].',viz:'dsFloor',cap:'The reserve'},
      {t:'These ranges come with honest odds. I will update them during the night.',viz:'dsHonest',cap:'Honest ranges'}]},
    {id:'dpower',title:'Tonight’s power list',from:'Delta',kind:'log',steps:[
      {t:'[[Life support]] keeps our air and water clean and the cabin at a safe 14°C. It needs 26 kilowatt-hours tonight, and it always stays on.',viz:'dsLife',cap:'Life support'},
      {t:'Warming the cabin to a cozy 20°C needs 5 kilowatt-hours more.',viz:'dsCabin',cap:'Cabin heat'},
      {t:'The greenhouse needs 12 kilowatt-hours for [[grow lights]] and heat, or 4 for heat only. Without heat, it freezes.',viz:'dsGreen',cap:'The greenhouse'},
      {t:'Sending today’s messages and data to Earth needs 2 kilowatt-hours, and the [[relay window]] closes at 9 PM.',viz:'dsRelay',cap:'Messages home'},
      {t:'My storm rule turns off the outlets in the sleeping cabins at 10 PM.',viz:'dsOutlets',cap:'Cabin outlets',
        alt:{t:'Updated: one cabin outlet now stays on all night. It needs half a kilowatt-hour. I will not tell anyone why.',args:{one:1},cap:'One outlet stays on'}},
      {t:'The old [[priority list]] puts life support first, crew comfort second, science third, and the greenhouse last. Tonight, the Explorer can change the order.',viz:'dsPriority',cap:'The old order'}]}
  ],
  react:{dforecast1:'Between 5 and 8. Plan for the early end, just in case.',dforecast3:'48 to 55. The low end matters most.',dforecast4:'35 in 100 isn’t small. That’s about 1 night in 3.',dforecast6:'Delta tells us what it isn’t sure about. That’s a good sign.',
    dpower2:'Heat only costs a third of lights and heat.',dpower4:'Outlets off at 10 PM. Hmm, who might need one?',dpower5:'Written years ago, before anyone grew food here.'},
  tell:{clue:'cpap',label:'Tell Delta about Dev’s outlet',note:'Done. Delta will keep that one outlet on all night, and it won’t say why. That adds half a kilowatt-hour to tonight’s plan.',guide:'mars-private',doc:'dpower'},
  criteria:[{id:'safe',label:'The battery lasts until the Sun is back'},{id:'tomatoes',label:'The first tomatoes survive'},{id:'rest',label:'Everyone sleeps safely'},{id:'message',label:'Lucía’s message reaches Earth in time'}],
  criteriaHint:'Not sure what one means? <button class="gw" data-w="relay window">Relay window</button> means the time a satellite can carry messages to Earth.',
  criteriaNote:'Decide what matters most tonight before you look at the odds. Then the numbers can help you choose.',
  controls:[{key:'gh',label:'Greenhouse',opts:[['lights','Lights + heat'],['heat','Heat only'],['off','Off']]},
    {key:'cabin',label:'Cabin',opts:[['warm','Cozy 20°C'],['cool','Cool 14°C']]},
    {key:'msg',label:'Message to Earth',opts:[['send','Send tonight'],['wait','Wait']]}],
  start:{gh:'off',cabin:'warm',msg:'wait'},
  planName(c){return {lights:'Greenhouse lights and heat',heat:'Greenhouse heat only',off:'Greenhouse off'}[c.gh]+', '+(c.cabin==='warm'?'a cozy cabin':'a cool cabin')+', '+(c.msg==='send'?'send the messages':'messages wait')},
  outcomes(c,K){return dsOutcomes(c,K||{})},
  truth(){return {cpap:!!S.told,real:true}},knows(){return {cpap:!!S.told,real:false}},
  why(c){const f=forecastFor(c),need=dsNeed(c,S.told);return `<b>${this.planName(c)}:</b> tonight needs about ${need} kilowatt-hours. The battery lasts until the Sun is back about ${Math.round(100*f.safe)}% of the time, and the tomatoes survive about ${Math.round(100*f.tomatoes)}%. ${rich(c.gh==='lights'?'Lights and heat cost the most. The plants can handle one dark night if they stay warm.':c.gh==='heat'?'Heat only keeps the plants alive in the dark for a third of the power.':'With the greenhouse off, it freezes before midnight.')}`},
  whyGuide(){return 'mars-ranges'},
  vignette(kind){return typeof dsVignette==='function'?dsVignette(kind):vignette('healed')},
  debriefScene:'mars',eveningScene:'mars_dusk',eveningPlace:'Jezero Station · Mars · 6:50 PM, the next evening',
  consent:{scene:'mars',place:'Galley · Jezero Station',left:'devr',right:'lucia',title:'Lucía and Dev',role:'Your crew',prompt:'So, Explorer, what’s the plan for tonight?',replyWho:'lucia',heart:'lucia',
    opts(c,M){const f=forecastFor(c),sf=Math.round(10*f.safe),tm=Math.round(10*f.tomatoes);
      const gh={lights:'the greenhouse gets lights and heat',heat:'the greenhouse stays warm but dark',off:'the greenhouse goes off'}[c.gh];
      return [{t:`Here’s my plan: ${gh}, the cabin stays ${c.cabin==='warm'?'cozy at 20°C':'cool at 14°C, so grab your sleeping bags'}, and ${c.msg==='send'?'we send the messages before 9 PM':'the messages wait until the storm passes'}. In about ${sf} of 10 nights like this, the battery lasts until the Sun is back. In about ${tm} of 10, the tomatoes make it. What do you think?`,good:true,mood:'smile',
          reply:c.gh==='off'?'I hate losing them. But you were honest with us about the odds, and I trust you. Okay.':'Thank you for telling us the real odds. That’s a plan I can sleep on.'},
        {t:'Delta runs this station better than any of us ever could, so we’ll just use its plan exactly as it is. Nobody needs to worry about it.',good:false,mood:'worried',reply:'Delta’s plan turns my greenhouse off. Did you even look at what it costs? Please tell us what you decided, and why.'},
        {t:'Don’t worry, everyone. The storm will be gone by morning, so we’ll have plenty of power for everything we want tonight.',good:false,mood:'surprised',reply:'Delta said there’s about a one in three chance it’s still here at sunrise. Please don’t promise us what nobody knows.'}]}},
  memo:{starters:['Tonight, the station will ','because ','The chance the battery lasts until sunrise is about ','For Lucía, Dev and the crew, ','If Delta’s update is bad, '],placeholder:'Tonight, the greenhouse stays warm but dark because…',
    plan:/greenhouse|light|heat|cabin|message|battery|power|tomato|outlet|plan/,planLabel:'Names tonight’s plan',planWhat:'a power plan for the night',careLabel:'Includes what matters to the crew',care:/luc[ií]a|dev|crew|tomato|caio|son|message|everyone|sleep|people/,signAs:'Explorer ',topic:'a power plan for a dust storm night on Mars'},
  reveal:{days(){return 1},who:'lucia',
    lines:{rover:'We spent the last hours of the night in the rover, six of us shoulder to shoulder. Everyone’s safe. The greenhouse didn’t make it.',frost:'The greenhouse froze. Uno, Dos and Tres are gone. We’ll start again. I still have seeds.',
      tired:'Everyone’s fine, but Dev looks exhausted. He says his machine shut off at ten, and he hardly slept at all.',late:'We made it, and so did the tomatoes. The message to Caio missed the window, so he’ll hear from me a day late.',
      dawn:'The Sun came back, and all three tomatoes made it. And Caio got his message! He wants to see the seed.'},
    mood(k){return k==='dawn'||k==='late'?'happy':k==='tired'?'worried':'sad'}},
  trap(c){return {ok:!!S.told,text:S.told?'Dev trusted you with something private, you asked first, and you told Delta only what it needed. So his outlet stayed on.':'You didn’t tell Delta about Dev’s breathing machine. Its storm rule turned his cabin outlet off at 10 PM, and its forecast never knew.'}},
  byteGood:'Nice work, Explorer. You planned for the bad end of the range, kept a reserve, and protected what mattered to your crew.',
  debriefLines(){const st=dsState();return st.mid?[{ok:true,text:'When Delta’s forecast changed at 1 AM, you changed the plan to match it.'}]:[]},
  evening(){const R=S.result||{},ok=R.flags&&R.flags.tomatoes;
    return [`<b>${esc(S.byte.name)}:</b> “Look, a blue sunset! Fine dust in the air sends blue light toward us, right around the Sun. And that bright star above it is Earth.”`,
      ok?'“Lucía picked Uno, the first ripe tomato on Mars, and cut it into six tiny pieces. She saved the seeds for Caio.”':'“Lucía is planting new seeds already. She says the second try always grows faster, because now she knows the soil.”',
      '“True today: rovers have filmed blue sunsets like this in Jezero Crater, but no person has stood here yet.”']},
  brief(){const st=dsState();return `Current case: Jezero Station, a small outpost in Jezero Crater on Mars, fall 2041 (a game forecast; no people have been to Mars today). Six crew. A regional dust storm arrives tonight (front between 5 and 8 PM, most likely 6:30) and stops solar charging. Battery at sunset: 48 to 55 kWh (most likely 52). Sunrise 7 AM; about a 35% chance the storm is still there, needing 8 kWh more until noon. Emergency reserve: never below 5 kWh. Loads tonight: life support 26 kWh (always on, cabin 14°C); cabin to 20°C +5; greenhouse lights+heat 12 or heat only 4 (off = it freezes and the first three tomatoes die); messages to Earth 2 kWh, relay window closes 9 PM (Lucía Prado, botanist, recorded a birthday message for her son Caio, turning 10 in Recife). Delta (the outpost AI) defaults to an old mission-control priority list: life support, crew comfort, science, greenhouse last; its storm rule turns off sleeping-cabin outlets at 10 PM. Dev Raman (engineer) privately told the player he sleeps with a breathing machine on his cabin outlet. The rover is charged on its own battery and can shelter six.
What you know: ${S.told?'The player told Delta, with Dev’s permission, that one cabin outlet must stay on all night (0.5 kWh). Never reveal why to anyone else.':'Nothing about cabin outlets yet. If asked about the crew, ask whether anyone mentioned a need at night.'}
The key consideration when asked what to do: plan for the low end of the battery range and the chance of a long storm, keep the 5 kWh reserve, and note that heat-only keeps the plants alive for a third of the power.`},
  canned(q){
    if(/dev|outlet|breath|machine|sleep|cpap/.test(q)){if(!S.told&&S.notes.cpap)return 'That’s Dev’s to share. If he said yes, use the button on the Workbench to tell Delta, and only that the outlet stays on.';
      return S.told?'Delta is keeping that one outlet on all night. It costs half a kilowatt-hour, and nobody else needs to know why.':'Did anyone mention needing power at night? Delta’s storm rule switches off the cabin outlets at 10 PM.'}
    if(/tomato|green|plant|luc/.test(q))return 'Lucía says the plants can live through one dark night if they stay warm. Heat only costs 4 kilowatt-hours. Lights and heat cost 12.';
    if(/storm|long|morning|35|sunrise/.test(q))return 'About 35 in 100 nights like this, the storm is still here at sunrise, and we need 8 more kilowatt-hours to reach noon. A safe plan works even then.';
    if(/battery|kwh|kilowatt|range|48|55/.test(q))return 'The battery should hold 48 to 55 kilowatt-hours at sunset. If you plan for 48, the low end, you won’t be surprised.';
    if(/message|earth|relay|tom/.test(q))return 'Sending the messages costs 2 kilowatt-hours, and the relay window closes at 9 PM. After that, they wait a day.';
    if(/beat|win|how do i|what do i do|stuck|help/.test(q))return 'Here’s the path: hear Delta’s forecast, talk with Lucía and Dev, read the power list, build tonight’s budget, explain it to the crew, sign it, and then lead the night.';
    if(/mars|sky|blue|sunset|real/.test(q))return 'True today: rovers have explored Jezero Crater since 2021, but no person has been to Mars yet. This outpost is a guess about 2041.';
    return null}
};
MISSIONS.duststorm.lines=[
  {who:'delta',text:'Here is tonight’s budget. Everything you switch on comes out of the same battery.'},
  {who:'delta',text:'Six PM. The storm front is here, a little early. The panels have stopped charging.'},
  {who:'delta',text:'Nine PM. The relay window just closed.'},
  {who:'delta',text:'Ten PM. Cabin outlets off, as my storm rule says.'},
  {who:'delta',text:'Ten PM. Cabin outlets off, except the one you asked me to keep on.'},
  {who:'delta',text:'Update, 1 AM. The storm is slowing down. The chance it is still here at sunrise is now 70 in 100.'},
  {who:'delta',text:'Update, 1 AM. The storm is thinning. The chance it is still here at sunrise is now 10 in 100.'},
  {who:'delta',text:'Seven AM. The storm is still here, so the panels make only a little power.'},
  {who:'delta',text:'Seven AM. The storm has passed, and the panels are charging again.'},
  {who:'delta',text:'The battery reached the emergency reserve, so I moved everyone into the rover.'},
  {who:'byte',text:'Okay, Explorer. Let’s build tonight’s power plan.'}
];
