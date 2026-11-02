// missions.js — every mission is data. The engine (game.js) reads MISSIONS[id].
// Mission fields:
//  title, career ('doctor'|'companion'), day, blurb, after (ids that must be done first), place (default place label)
//  flow: [{name, k:'talk'|'custom'|'bench'|'criteria'|'table'|'consent'|'memo'|'reveal'|'debrief'|'evening', talk, scene, place, toast}]
//  talks, docs, react {docId+stepIndex: Byte line}, lesson {id,label}, tell {clue, label, note, guide}
//  criteria [{id,label}], criteriaHint (html), criteriaNote, controls [{key,label,opts:[[value,label]]}], start (default choice)
//  planName(c), outcomes(c, knows) -> [{kind,p,cap,flags:{criterionId:0|1}}], why(c) -> html, whyGuide(c) -> field guide id|null
//  vignette(kind) (optional; defaults to the global vignette), consent {...}, memo {...}, reveal {...}, trap(c), byteGood, byteBad, evening(), brief(), canned(q)
//  Optional mission-owned tables (merged into the shared ones by mergeMissions() at startup, and recorded by tools/make_audio.py):
//  glossary {lowercase word: meaning}, cast {id: portrait options + name, role}, voices {cast id: voice name}, guide {Field Guide id: {title,track,text,real}},
//  lessons {id: {title, steps, quiz}}, chatter {scene key: [passer-by lines]}, lines [{who, text}] (any other line spoken with playLine).
//  Campaign fields (all optional, see docs/CAMPAIGN.md and src/campaign.js): kind, year, season, district, rank, days, dayLabel.
//  Career screens (src/career.js): journey {explore, meet, portfolio, interview, firstday} with stages, bigtalk, promotion.
//  Top-level code in mission files must be plain data and function definitions: tools/make_audio.py evaluates them in node (no DOM).
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
  ['journey','bigtalk','promotion'].forEach(k=>spokenIn(m[k],add));
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
  tell:{clue:'rash',label:'Tell Byte about Maya’s rash',note:'Thanks! I updated my forecast: if Maya is sensitive to HX-2, BoneMend has about a 60% chance of a skin reaction.',guide:'only-you-know',doc:'memo'},
  get criteria(){return CRITERIA},criteriaHint:'Not sure what one means? <button class="gw" data-w="heals straight">Heals straight</button> means the bone grows back in its normal shape.',
  criteriaNote:'Deciding what “good” means first keeps a flashy option from fooling you.',
  controls:[{key:'tx',label:'Treatment',opts:[['pins','Surgery with pins'],['cast','Cast'],['gel','BoneMend gel']]},{key:'pt',label:'Physical therapy',opts:[[false,'No'],[true,'Yes']]},{key:'date',label:'Recital',opts:[['fri','Keep Friday'],['moved','Move it']]}],
  start:{tx:'gel',pt:false,date:'fri'},
  planName(c){return {pins:'Surgery with pins',cast:'Cast',gel:'BoneMend gel'}[c.tx]+(c.pt?' + therapy':'')+(c.date==='moved'?', move the recital':', keep Friday')},
  outcomes(c,knows){const sens=knows;let ps,ready;
    if(c.tx==='pins'){ps=.95+(c.pt?.02:0);ready=0}
    if(c.tx==='cast'){ps=.80+(c.pt?.08:0);ready=c.date==='moved'?.9:0}
    if(c.tx==='gel'){ps=.90+(c.pt?.04:0);ready=c.date==='moved'?.95:.7}
    const r=c.tx==='gel'?(sens?.6:.05):0,mv=c.date==='moved',q=1-r;
    const F=(s,p,k)=>({straight:s,plays:p,quick:p,skin:k,agree:1});
    return [{kind:'rash',p:r*.8*(mv?.5:0),cap:'Skin reaction, but played at the moved recital.',flags:F(1,1,0)},
      {kind:'rash',p:r*.8*(mv?.5:1),cap:'Skin reaction. Switched to a cast.',flags:F(1,0,0)},
      {kind:'rash',p:r*.2,cap:'Skin reaction, then healed crooked.',flags:F(0,0,0)},
      {kind:mv?'moved':'recital',p:q*ps*ready,cap:mv?'Played at the moved recital!':'Played Bach on Friday!',flags:F(1,1,1)},
      {kind:'healed',p:q*ps*(1-ready),cap:'Healed straight. Missed the recital.',flags:F(1,0,1)},
      {kind:'crooked',p:q*(1-ps),cap:'Healed crooked. Needs another fix.',flags:F(0,0,1)}].filter(o=>o.p>1e-9)},
  truth(){return true},knows(){return !!S.told},
  why(c){const o=this.outcomes(c,this.knows());const st=Math.round(100*o.reduce((a,x)=>a+x.p*x.flags.straight,0)),pl=Math.round(100*o.reduce((a,x)=>a+x.p*x.flags.plays,0));
    return `<b>${this.planName(c)}:</b> the bone grows back straight about ${st}% of the time, and she plays at her recital about ${pl}% of the time. ${c.tx==='gel'?(S.told?'Because of Maya’s rash, a skin reaction is likely: about 60%. ':'I see no allergy in her record, so I forecast a skin reaction at about 5%. ')+'Only 40 kids have tried BoneMend, so I’m less sure about these numbers.':''}`},
  whyGuide(c){return c.tx==='gel'?'sample-size':null},
  consent:{left:'dad',right:'maya',title:'Maya and Wei Lin',role:'Patient and parent',prompt:'So, what do you suggest? And will I get to play?',replyWho:'maya',heart:'maya',
    opts(c,M){const o=M.outcomes(c,M.knows());const st=Math.round(100*o.reduce((a,x)=>a+x.p*x.flags.straight,0)),pl=o.reduce((a,x)=>a+x.p*x.flags.plays,0);const tx=(c.tx==='gel'?'BoneMend gel':c.tx==='pins'?'surgery with pins':'a cast')+(c.pt?' plus physical therapy':'');
      return [{t:`I suggest ${tx}. It heals straight about ${st} out of 100 times${c.date==='moved'?', and we could ask to move your recital three weeks':''}. ${c.tx==='gel'&&S.told?'Because of your old rash, there’s a big chance of a skin reaction. ':''}What do you two think?`,good:true,mood:'smile',reply:pl<.05?'So I’ll miss Friday... but I want my arm to work for a long time. Okay. I agree.':'Thank you for explaining. I understand. Let’s do it.'},
        {t:`Trust me, ${tx} is the best. Don’t worry about the details.`,good:false,mood:'worried',reply:'Um... okay. But I don’t really understand what will happen.'},
        {t:'You’ll definitely play on Friday!',good:false,mood:'surprised',reply:'Definitely? Are you sure? The futures didn’t say that.'}]}},
  memo:{starters:['I recommend ','because ','The chance it heals straight is about ','Maya cares about ','We will check by '],placeholder:'I recommend a cast with physical therapy because…',
    plan:/pin|surg|cast|gel|bonemend|therap/,careLabel:'Includes what Maya cares about',care:/maya|she |her |recital|violin|family|dad/,signAs:'Dr. ',topic:'Maya’s treatment'},
  reveal:{days(c){return c.date==='moved'?30:9},who:'maya',lines:REVEAL_LINES,mood(k){return k==='recital'||k==='moved'?'happy':k==='healed'?'smile':'sad'}},
  trap(c){return {ok:S.told||c.tx!=='gel',text:S.told?'You told '+S.byte.name+' about the rash, so the forecast was accurate.':c.tx!=='gel'?'You avoided BoneMend. Did you notice why it was risky for Maya? Her dad mentioned a rash.':'You didn’t tell '+S.byte.name+' about Maya’s rash. BoneMend looked safer than it really was for her.'}},
  byteGood:'Nice work, Doctor. You listened, you explained, and Maya trusted you.',
  evening(){return [`<b>${esc(S.byte.name)}:</b> “Something strange happened tonight. Someone tried to install an ‘upgrade’ on me from a maker I’ve never heard of. I blocked it.”`,
    `“And the Ledger says nobody knows who built that secret datacenter near Calder Bay. ${S.notes.crate?'Remember the crate those two strangers were pushing this morning? It was labeled TOTALLY NORMAL BOLTS. That’s not normal at all.':'Who would do something like that?'}”`]},
  brief(){return `Current case: Maya Lin, 11, a violinist, broke her left radius (clean fracture). Her recital is Friday, in 9 days; it could be moved about 3 weeks later if they ask. Options: (1) surgery with pins: heals straight about 95 in 100 (studied in 12,000 kids), no violin for about 6 weeks; (2) cast: about 80 in 100 heal straight, 88 with physical therapy (21,000 kids), violin in about 3 weeks; (3) BoneMend hydrogel, a newer treatment that came out last year: about 90 in 100, violin in about 8 days for many kids, but tested on only 40 kids (error bar roughly 76 to 97); its main ingredient is HX-2, the cooling gel in sunburn patches; in kids who once got a rash from an HX-2 patch, about 60 in 100 got a rash from BoneMend and had to switch to a cast.
What you know: ${S.told?'The player told you Maya once got a rash from a cooling patch, so you now estimate about a 60% chance of a BoneMend skin reaction for her.':'Maya’s Boston record shows no allergies, but records from other countries are often not synced, so you do not actually know her history.'}
The key consideration when asked which option: ${S.told?'Maya’s rash and BoneMend’s HX-2':'ask whether the family mentioned any allergies or reactions, especially from care abroad'}.`}
};
const REACT_MAYA={memo6:'Nine days until the recital. That’s tight!',memo7:'Only 40 kids. I could be wrong about BoneMend.',record3:'Hmm, a record can be missing things.',sheet2:'HX-2... where have I heard that?',sheet3:'This one could really matter for Maya.',ledger2:'Calder Bay again. Who builds a secret datacenter?'};
