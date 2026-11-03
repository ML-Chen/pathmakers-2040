// missions.js — every mission is data. The engine (game.js) reads MISSIONS[id].
// Mission fields:
//  title, career ('doctor'|'companion'), day, blurb, after (ids that must be done first), place (default place label)
//  flow: [{name, k:'talk'|'custom'|'bench'|'criteria'|'table'|'consent'|'memo'|'reveal'|'debrief'|'evening', talk, scene, place, toast}]
//  talks, docs, react {docId+stepIndex: Byte line}, lesson {id,label}, tell {clue, label, note, guide}
//  criteria [{id,label}], criteriaHint (html), criteriaNote, controls [{key,label,opts:[[value,label]]}], start (default choice)
//  planName(c), outcomes(c, knows) -> [{kind,p,cap,flags:{criterionId:0|1}}], why(c) -> html, whyGuide(c) -> field guide id|null
//  vignette(kind) (optional; defaults to the global vignette), tablePanel(c) (optional; HTML shown under the futures on the Future Table), consent {...}, memo {...}, reveal {...}, trap(c), byteGood, byteBad, evening(), brief(), canned(q)
//  Optional mission-owned tables (merged into the shared ones by mergeMissions() at startup, and recorded by tools/make_audio.py):
//  glossary {lowercase word: meaning}, cast {id: portrait options + name, role}, voices {cast id: voice name}, guide {Field Guide id: {title,track,text,real}},
//  lessons {id: {title, steps, quiz}}, chatter {scene key: [passer-by lines]}, lines [{who, text}] (any other line spoken with playLine),
//  ledger [stories for the Ledger news app, see src/ledger.js], tag (hub card label instead of "Day N"), kind/year/season/district/rank (docs/CAMPAIGN.md).
//  Campaign fields (all optional, see docs/CAMPAIGN.md and src/campaign.js): kind, year, season, district, rank, days, dayLabel.
//  Career screens (src/career.js): journey {explore, meet, portfolio, interview, firstday} with stages, bigtalk, promotion.
//  Top-level code in mission files must be plain data and function definitions: tools/make_audio.py evaluates them in node (no DOM).
//  shots {stepName: [{label, run()}]} (optional): extra states of a custom step for tools/mission_shots.js and tools/mission_deep_shots.js to screenshot.
const MISSIONS={};
function mergeMissions(){for(const m of Object.values(MISSIONS)){if(m._merged)continue;m._merged=1;
  Object.assign(GLOSSARY,m.glossary||{});Object.assign(CAST,m.cast||{});Object.assign(VOICES,m.voices||{});Object.assign(FIELD_GUIDE,m.guide||{});Object.assign(LESSONS,m.lessons||{});
  for(const k in (m.chatter||{}))CHATTER[k]=(CHATTER[k]||[]).concat(m.chatter[k])}}
// Every line a mission speaks with playLine, as [{who, text}] ('byte' lines are recorded in both Byte voices).
function missionLines(m){const L=[],add=(who,t)=>{if(t&&typeof t==='string')L.push({who,text:t})};
  for(const k in (m.talks||{}))for(const x of m.talks[k]){add(x.who,x.text);(x.choices||[]).forEach(c=>add(x.who,c.reply))}
  for(const d of (m.docs||[])){add('narrator',d.title);d.steps.forEach(b=>{add('narrator',b.t);if(b.alt)add('narrator',b.alt.t)})}
  for(const w in (m.glossary||{}))add('narrator',w+'. '+m.glossary[w]);
  for(const id in (m.lessons||{})){const ls=m.lessons[id];add('byte','Here is '+ls.title.toLowerCase()+'.')}
  if(m.reveal&&m.reveal.lines)for(const k in m.reveal.lines)add(m.reveal.who,m.reveal.lines[k]);
  if(m.consent&&m.consent.opts){try{m.consent.opts(m.start,m).forEach(o=>add(m.consent.replyWho,o.reply))}catch(e){}}
  (m.lines||[]).forEach(x=>add(x.who,x.text));
  for(const st of (m.ledger||[])){add('narrator',st.title);(st.steps||[]).forEach(b=>add('narrator',b.t));if(st.trick)add('byte',st.trick.why);if(st.check)add('byte',st.check)}
  ['journey','bigtalk','promotion'].forEach(k=>spokenIn(m[k],add));
  return L.concat(levelLines(m))}
// Challenge levels (the setting lives in src/modes.js): 'kid', 'teen' or 'grownup'. A mission may declare
// levels:{teen:{...},grownup:{...}}: fields that replace the mission's own at that level. Grown-up also takes every Teen field
// it does not replace. Kid always plays the mission exactly as written. levelView(m,lv) is the mission as seen at level lv.
const LEVELS=['kid','teen','grownup'];
function levelView(m,lv){if(!m||!m.levels||!lv||lv==='kid')return m;const v=Object.create(m);
  for(const L of LEVELS.slice(1,LEVELS.indexOf(lv)+1))if(m.levels[L])Object.defineProperties(v,Object.getOwnPropertyDescriptors(m.levels[L]));return v}
// Lines spoken only at Teen and Grown-up: deep sentences (step.deep), per-sentence and per-line replacements (step.levels,
// line.levels), and each level's own docs, talks, consent replies and lines. Duplicates of Kid lines are removed later.
function levelLines(m){const L=[],add=(who,t)=>{if(t&&typeof t==='string')L.push({who,text:t})};
  const step=b=>{add('narrator',b.t);if(b.alt){add('narrator',b.alt.t);(b.alt.deep||[]).forEach(step)}(b.deep||[]).forEach(step);for(const k in (b.levels||{}))step({...b,...b.levels[k],levels:null})};
  const line=x=>{add(x.who,x.text);(x.choices||[]).forEach(c=>add(x.who,c.reply));for(const k in (x.levels||{}))line({...x,...x.levels[k],levels:null})};
  for(const lv of LEVELS){const v=levelView(m,lv);if(lv!=='kid'&&v===m)continue;
    for(const d of (v.docs||[])){add('narrator',d.title);d.steps.forEach(step)}
    for(const k in (v.talks||{}))v.talks[k].forEach(line);
    if(lv!=='kid'&&v.consent&&v.consent.opts){try{v.consent.opts(v.start,v).forEach(o=>add(v.consent.replyWho,o.reply))}catch(e){}}
    if(lv!=='kid')(v.lines||[]).forEach(x=>add(x.who,x.text))}
  return L}
// career screens (career.js) keep every spoken line as a {who, text} object somewhere inside m.journey, m.bigtalk or m.promotion
function spokenIn(o,add,seen=new Set()){if(!o||typeof o!=='object'||seen.has(o))return;seen.add(o);if(typeof o.who==='string'&&typeof o.text==='string')add(o.who,o.text);for(const k in o)spokenIn(o[k],add,seen)}
const CAREERS={doctor:{name:'Care Doctor',place:'Boston Harbor Hospital'},companion:{name:'Elder Companion',place:'Boston'}};

MISSIONS.maya={id:'maya',title:'The Violinist’s Wrist',career:'doctor',day:1,blurb:'An 11-year-old violinist broke her wrist nine days before her recital.',after:[],
  place:'Boston Harbor Hospital',
  flow:[{name:'morning',k:'talk',talk:'morning',scene:'home',place:'Home · Boston · 7:40 AM'},{name:'street',k:'custom'},
    {name:'arrive',k:'talk',talk:'imani',scene:'hospital',place:'Boston Harbor Hospital'},
    {name:'maya',k:'talk',talk:'maya',scene:'hospital',place:'Room 4B · Boston Harbor Hospital',toast:'New work on your Workbench'},
    {name:'workbench',k:'bench'},{name:'criteria',k:'criteria'},{name:'table',k:'table'},{name:'consent',k:'consent'},{name:'memo',k:'memo'},{name:'reveal',k:'reveal'},{name:'debrief',k:'debrief'},{name:'evening',k:'evening'}],
  get talks(){return TALKS},get docs(){return DOCS},get react(){return REACT_MAYA},
  lesson:{id:'bones',label:'Learn it fast: how a broken bone heals'},
  tell:{clue:'rash',label:'Tell Byte about Maya’s rash',note:'Thanks! I updated my forecast. Because Maya once got a rash from an HX-2 cooling patch, I now think BoneMend has about a 60% chance of giving her a skin reaction.',guide:'only-you-know',doc:'memo'},
  get criteria(){return CRITERIA},criteriaHint:'Not sure what one means? <button class="gw" data-w="heals straight">Heals straight</button> means the bone grows back in its normal shape.',
  criteriaNote:'Choose what matters to Maya before you look at the futures, so that an exciting new option like BoneMend doesn’t distract you from her goals.',
  controls:[{key:'tx',label:'Treatment',opts:[['pins','Surgery with pins'],['cast','Cast'],['gel','BoneMend gel']]},{key:'pt',label:'Physical therapy',opts:[[false,'No'],[true,'Yes']]},{key:'date',label:'Recital',opts:[['fri','Keep Friday'],['moved','Move it']]}],
  start:{tx:'gel',pt:false,date:'fri'},
  planName(c){return T({pins:'Surgery with pins',cast:'Cast',gel:'BoneMend gel'}[c.tx])+T(c.pt?' + therapy':'')+T(c.date==='moved'?', move the recital':', keep Friday')},
  outcomes(c,knows){const sens=knows;let ps,ready;
    if(c.tx==='pins'){ps=.95+(c.pt?.02:0);ready=0}
    if(c.tx==='cast'){ps=.80+(c.pt?.08:0);ready=c.date==='moved'?.9:0}
    if(c.tx==='gel'){ps=.90+(c.pt?.04:0);ready=c.date==='moved'?.95:.7}
    const r=c.tx==='gel'?(sens?.6:.05):0,mv=c.date==='moved',q=1-r;
    const F=(s,p,k)=>({straight:s,plays:p,quick:p,skin:k,agree:1});
    return [{kind:'rash',p:r*.8*(mv?.5:0),cap:'Skin reaction, but played at the moved recital.',flags:F(1,1,0)},
      {kind:'rash',p:r*.8*(mv?.5:1),cap:'Skin reaction, so she switched to a cast.',flags:F(1,0,0)},
      {kind:'rash',p:r*.2,cap:'Skin reaction, then healed crooked.',flags:F(0,0,0)},
      {kind:mv?'moved':'recital',p:q*ps*ready,cap:mv?'Played at the moved recital!':'Played Bach on Friday!',flags:F(1,1,1)},
      {kind:'healed',p:q*ps*(1-ready),cap:'Healed straight but missed the recital.',flags:F(1,0,1)},
      {kind:'crooked',p:q*(1-ps),cap:'Healed crooked and needs another fix.',flags:F(0,0,1)}].filter(o=>o.p>1e-9)},
  truth(){return true},knows(){return !!S.told},
  why(c){const o=this.outcomes(c,this.knows());const st=Math.round(100*o.reduce((a,x)=>a+x.p*x.flags.straight,0)),pl=Math.round(100*o.reduce((a,x)=>a+x.p*x.flags.plays,0));
    return T('<b>{plan}:</b> the bone grows back straight about {st}% of the time, and she plays at her recital about {pl}% of the time. ',{plan:this.planName(c),st,pl})+(c.tx==='gel'?T(S.told?'Because of Maya’s old rash, a skin reaction from BoneMend is likely, at about 60%. ':'I see no allergy in her record, so I forecast a skin reaction at about 5%. ')+T('Only 40 kids have tried BoneMend, so I’m less sure about these numbers.'):'')},
  whyGuide(c){return c.tx==='gel'?'sample-size':null},
  consent:{left:'dad',right:'maya',title:'Maya and Wei Lin',role:'Patient and parent',prompt:'So, what do you suggest? And will I get to play?',replyWho:'maya',heart:'maya',
    opts(c,M){const o=M.outcomes(c,M.knows());const st=Math.round(100*o.reduce((a,x)=>a+x.p*x.flags.straight,0)),pl=o.reduce((a,x)=>a+x.p*x.flags.plays,0);const tx=T(c.tx==='gel'?'BoneMend gel':c.tx==='pins'?'surgery with pins':'a cast')+T(c.pt?' plus physical therapy':'');
      const mv=c.date==='moved',play=pl>=.8?T(mv?'If we ask to move your recital about three weeks, you’ll very likely get to play.':'You’ll very likely get to play on Friday.'):pl>=.5?T(mv?'If we move your recital about three weeks, there’s a good chance you’ll play, but it isn’t certain.':'There’s a good chance you’ll play on Friday, but it isn’t certain.'):pl>.05?T('You might get to play, Maya, but I can’t promise it.'):T(mv?'I’m sorry, Maya. Even with the recital moved, this plan probably won’t have you ready in time.':'I’m sorry, Maya. With this plan, you won’t be able to play on Friday.');
      const heal=st>=93?T('Almost every kid heals straight with it.'):st>=85?T('Nearly 9 in 10 kids heal straight with it.'):T('About 8 in 10 kids heal straight with it.');
      return [{t:T('{play} I’d suggest {tx}. {heal} {rash}What do you two think?',{play,tx,heal,rash:T(c.tx==='gel'&&S.told?'Because of your rash last summer, the gel could give you another one, so we’d watch for that. ':'')}),good:true,mood:'smile',reply:pl<.05?'So I’ll miss Friday... but I want my arm to work for a long time. Okay. I agree.':'Thank you for explaining. I understand. Let’s do it.'},
        {t:T('Trust me, {tx} is the best choice for you. I’ve looked at all the numbers, so you and your dad don’t need to worry about the details.',{tx}),good:false,mood:'worried',reply:'Um... okay. But I don’t really understand what will happen.'},
        {t:T('You’ll definitely play on Friday, Maya! Kids your age heal really fast, so there’s nothing to worry about.'),good:false,mood:'surprised',reply:'Definitely? Are you sure? The Future Table showed some futures where I don’t get to play.'}]}},
  memo:{starters:['I recommend ','because ','The chance it heals straight is about ','Maya cares about ','We will check by '],placeholder:'I recommend a cast with physical therapy because…',
    plan:/pin|surg|cast|gel|bonemend|therap/,careLabel:'Includes what Maya cares about',care:/maya|she |her |recital|violin|family|dad/,signAs:'Dr. ',topic:'Maya’s treatment'},
  reveal:{days(c){return c.date==='moved'?30:9},who:'maya',lines:REVEAL_LINES,mood(k){return k==='recital'||k==='moved'?'happy':k==='healed'?'smile':'sad'}},
  trap(c){return {ok:S.told||c.tx!=='gel',text:T(S.told?'You told {byte} about Maya’s old rash, so the forecast was accurate.':c.tx!=='gel'?'You avoided BoneMend. Did you notice why it was risky for Maya? Her dad mentioned a rash.':'You didn’t tell {byte} about Maya’s rash. BoneMend looked safer than it really was for her.',{byte:S.byte.name})}},
  byteGood:'Nice work, Doctor. You listened to Maya and her dad, you explained the choices honestly, and Maya trusted you.',
  evening(){return [T('<b>{byte}:</b> “Maya’s dad sent a message tonight. Maya wants to know if you can come to her recital, whichever day it ends up being.”',{byte:esc(S.byte.name)}),
    T('“Tonight the Ledger, the news app, had a story about Calder Bay. A new building there uses as much electricity as a small city, and nobody has a permit for it, so inspectors are going to visit.”')]},
  brief(){return `Current case: Maya Lin, 11, a violinist, broke her left radius (a clean fracture straight across the bone, with the two pieces slightly out of line, which is why pins are an option and why a cast can let it heal crooked). Her recital is Friday, in 9 days; it could be moved about 3 weeks later if they ask. Options: (1) surgery with pins: heals straight about 95 in 100 (studied in 12,000 kids), no violin for about 6 weeks; (2) cast: about 80 in 100 heal straight, 88 with physical therapy (21,000 kids), violin in about 3 weeks; (3) BoneMend hydrogel, a newer treatment that came out last year: about 90 in 100, violin in about 8 days for many kids, but tested on only 40 kids (error bar roughly 76 to 97); its main ingredient is HX-2, the cooling gel in sunburn patches; in kids who once got a rash from an HX-2 patch, about 60 in 100 got a rash from BoneMend and had to switch to a cast.
What you know: ${S.told?'The player told you Maya once got a rash from a cooling patch, so you now estimate about a 60% chance of a BoneMend skin reaction for her.':'Maya’s Boston record shows no allergies, but records from other countries are often not synced, so you do not actually know her history.'}
The key consideration when asked which option: ${S.told?'Maya’s rash and BoneMend’s HX-2':'ask whether the family mentioned any allergies or reactions, especially from care abroad'}.`}
};
const REACT_MAYA={memo6:'Maya’s recital is only nine days away, so there isn’t much time.',memo7:'BoneMend was tested on only 40 kids, so my numbers for it could be wrong.',record3:'Hmm, Maya’s record might be missing care she got in another country.',sheet2:'HX-2 is also in sunburn cooling patches. I wonder if Maya has ever used one.',sheet3:'If Maya is sensitive to HX-2, this rash risk could really matter for her.',ledger2:'Someone built a datacenter in secret near Calder Bay. I wonder who built it, and why they hid it.'};
