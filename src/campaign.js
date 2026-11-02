// campaign.js — the campaign layer that turns the missions into a three-year game (docs/CAMPAIGN.md).
// It owns: the calendar (2040 to 2042, four seasons each), the places on the world map, where each mission sits
// (with defaults for missions that only declare career, day, after and place), ranks, Hearts, Coins and Days,
// the three star types (Ask, Decision, Heart), save migration and the grown-ups' "Play anything" switch.
// The world map and place planners are drawn by worldmap.js, the career journey screens by career.js, and the
// painted map by scenes/worldmap.js. Top-level code here is plain data and function definitions, so tools can
// evaluate this file in node without a DOM.
//
// Public helpers for missions (documented in docs/MISSIONS.md):
//   addHearts(who, n)        trust with one character; carried across careers. Returns the new count.
//   addCoins(n), spendCoins(n)   the player's wallet (workdays pay on first completion).
//   daysLeft(), spendDays(n)     the current mission's deadline budget, when the mission declares days:N.
//   starsFrom({ask, decision, heart})   -> {ask, decision, heart, stars}. Luck is never an input.
//   awardStars(id?, stars)   records the best of each star type in S.completed[id] (keeps the old .stars total).
//   promote(career, rank)    'pro' or 'legend'; the promotion screen in career.js calls it.

const SAVE_VERSION=2;
const SEASONS=['spring','summer','fall','winter'];
const SEASON_NAME={spring:'Spring',summer:'Summer',fall:'Fall',winter:'Winter'};
const CAMPAIGN_YEARS=[2040,2041,2042];
const RANKS=['trainee','pro','legend'];
const RANK_NAME={trainee:'Trainee',pro:'Pro',legend:'Legend'};
const KIND_NAME={workday:'Workday',journey:'Career journey',bigtalk:'Big talk',plot:'Story',memorial:'Story',ruin:'Ruin',travel:'Travel',finale:'Finale'};
const WEEKS_PER_SEASON=4;                 // first completions per season before the calendar turns the page
const PAY={workday:{trainee:20,pro:35,legend:50},journey:15,bigtalk:30,other:15};
// extra flow step kinds, registered by career.js and later modules: FLOW_KINDS[kind]=()=>render the step
const FLOW_KINDS={};

// ---------- places on the world map ----------
// lat/lon place the true dot on the painted globe; mark is where the medallion sits, in globe radii from the
// center (x right, y down), so crowded coasts can fan out with a leader line. year/season: when the place opens.
// scenes: painted backgrounds for the place's planner, first one that exists wins.
const PLACES={
  boston:{name:'Boston',full:'Boston, Massachusetts',game:'Health Harbor',kind:'city',icon:'harbor',lat:42.36,lon:-71.06,mark:[.52,.40],year:1,season:'spring',scenes:['street','hospital'],
    teaser:'A harbor city of old brick streets, where the hospital is hiring.'},
  nome:{name:'Nome',full:'Nome, Alaska',game:'Wild Reserve',kind:'city',icon:'mammoth',lat:64.5,lon:-165.4,mark:[-.31,.08],year:1,season:'summer',scenes:['nome','tundra'],
    teaser:'A mammoth calf has stopped eating, and nobody knows why.'},
  phoenix:{name:'Phoenix',full:'Phoenix, Arizona',game:'Build Yard',kind:'city',icon:'crane',lat:33.45,lon:-112.07,mark:[-.27,.80],year:1,season:'fall',scenes:['phoenix','lot'],
    teaser:'Robots can build a park overnight. What do the neighbors want?'},
  moon:{name:'The Moon',full:'The Moon’s south pole',game:'Moon Market',kind:'space',icon:'dome',year:2,season:'spring',scenes:['moon'],
    teaser:'A tiny shop at the rim of a crater is waiting for its founder.'},
  bay:{name:'Bay Area',full:'San Francisco Bay Area',game:'Discovery Base',kind:'city',icon:'flask',lat:37.77,lon:-122.42,mark:[-.64,.70],year:2,season:'summer',scenes:['bay','lab'],
    teaser:'Three experiments, one coral reef, and money for only one.'},
  mars:{name:'Mars',full:'Jezero Crater, Mars',game:'Discovery Base',kind:'space',icon:'rover',year:2,season:'fall',scenes:['mars'],
    teaser:'A dust storm is coming, and the shelter has power for one night.'},
  nyc:{name:'New York',full:'New York City',game:'Stage and Studio',kind:'city',icon:'spot',lat:40.71,lon:-74.01,mark:[.72,.70],year:3,season:'spring',scenes:['nyc','stage'],
    teaser:'The lights go up on Broadway. Safe setlist or daring one?'},
  dc:{name:'Washington',full:'Washington, DC',game:'Town Hall',kind:'city',icon:'capitol',lat:38.9,lon:-77.04,mark:[.42,.78],year:3,season:'summer',scenes:['dc','capitol','hearing'],
    teaser:'A robot safety bill needs votes, and yours could count.'},
  vienna:{name:'Vienna',full:'Vienna, Austria',game:'AI Watchtower',kind:'city',icon:'tower',lat:48.2,lon:16.37,mark:[.53,-.17],year:3,season:'fall',scenes:['vienna','watchtower'],
    teaser:'A shopping AI keeps steering families to one store. Why?'},
  shanghai:{name:'Shanghai',full:'Shanghai, China',kind:'travel',icon:'plane',lat:31.23,lon:121.47,mark:[-.56,-.56],scenes:['shanghai'],
    teaser:'Boston’s sister hospital is comparing notes on a rare disease.'},
  beijing:{name:'Beijing',full:'Beijing, China',kind:'travel',icon:'plane',lat:39.9,lon:116.4,mark:[-.22,-.50],scenes:['beijing'],
    teaser:'Treaty talks, a joint concert, and a city that never sleeps.'},
  shenzhen:{name:'Shenzhen',full:'Shenzhen, China',kind:'travel',icon:'plane',lat:22.54,lon:114.06,mark:[-.34,-.84],scenes:['shenzhen'],
    teaser:'The factory that builds the robot crews has questions to answer.'},
  varrow:{name:'Varrow',full:'Varrow (a made-up town)',kind:'fiction',icon:'lantern',lat:43.9,lon:-72.6,mark:[.24,.22],year:1,season:'spring',scenes:['varrow','lantern'],
    teaser:'A garden of lanterns remembers the Quiet Year.'},
  marrowpoint:{name:'Marrow Point',full:'Marrow Point (a made-up town)',kind:'fiction',icon:'darktower',lat:45.1,lon:-87.2,mark:[.02,.52],year:1,season:'winter',scenes:['marrowpoint','darktower'],
    teaser:'A dark tower has stood empty since Blackout Week.'},
  calderbay:{name:'Calder Bay',full:'Calder Bay (a made-up town)',kind:'fiction',icon:'server',lat:46.6,lon:-124.1,mark:[-.50,.36],year:2,season:'winter',scenes:['calderbay','servervalley'],
    teaser:'Someone built a secret datacenter here. Nobody knows who.'}
};
const PLACE_ORDER=['boston','varrow','nome','phoenix','marrowpoint','moon','bay','mars','calderbay','nyc','dc','vienna','shanghai','beijing','shenzhen'];

// ---------- careers: defaults merged under CAREERS entries (CAREERS wins) ----------
const CAREER_INFO={
  doctor:{name:'Care Doctor',district:'boston',year:1,why:'The law requires a human to sign medical decisions, and patients choose a person to talk through their options.'},
  companion:{name:'Elder Companion',district:'boston',year:1,why:'Companionship from a person is the point.'},
  vet:{name:'Wildlife Vet',district:'nome',year:1,why:'Animals bond with a known caretaker, and translations need checking against what the vet sees.'},
  ranger:{name:'Ranger',district:'nome',year:1,why:'Land decisions affect local people, who want a person to answer to.'},
  architect:{name:'Community Architect',district:'phoenix',year:1,why:'Robots can build anything, so someone must decide what neighbors want and approve safety.'},
  crewlead:{name:'Robot Crew Lead',district:'phoenix',year:1,why:'A named human is accountable for each robot crew.'},
  founder:{name:'Founder',district:'moon',year:2,why:'Owners choose the goal, take the risk and own the result.'},
  investor:{name:'Dividend Investor',district:'moon',year:2,why:'Each family decides how to use its dividend and which ventures to back.'},
  scientist:{name:'Science Director',district:'bay',year:2,why:'The AIs run the research, and humans decide which questions matter most.'},
  explorer:{name:'Mars Explorer',district:'mars',year:2,why:'People want humans to go to new places.'},
  performer:{name:'Performer',district:'nyc',year:3,why:'Audiences care that a human is doing it.'},
  coach:{name:'Coach and Mentor',district:'nyc',year:3,why:'Kids want a trusted adult who knows them.'},
  lawmaker:{name:'Lawmaker',district:'dc',year:3,why:'Voters choose representatives, and Congress passes the laws.'},
  judge:{name:'Judge',district:'dc',year:3,why:'People accept rulings from an accountable person.'},
  auditor:{name:'AI Auditor',district:'vienna',year:3,why:'Someone independent must check whose goals an AI really serves.'},
  inspector:{name:'Treaty Inspector',district:'vienna',year:3,why:'The treaty needs people from different countries to verify chips and datacenters.'}
};
function careerInfo(k){const c=(typeof CAREERS!=='undefined'&&CAREERS[k])||{};return {key:k,...(CAREER_INFO[k]||{}),...c,name:c.name||(CAREER_INFO[k]||{}).name||k||''}}

// ---------- where a mission sits: every field is optional, with defaults ----------
const PLACE_WORDS=[['boston','boston'],['nome','nome'],['alaska','nome'],['phoenix','phoenix'],['arizona','phoenix'],['moon','moon'],['lunar','moon'],['san francisco','bay'],['bay area','bay'],['mars','mars'],['jezero','mars'],
  ['new york','nyc'],['broadway','nyc'],['washington','dc'],['capitol','dc'],['vienna','vienna'],['shanghai','shanghai'],['beijing','beijing'],['shenzhen','shenzhen'],['varrow','varrow'],['marrow point','marrowpoint'],['calder bay','calderbay']];
function placeFromLabel(t){t=String(t||'').toLowerCase();const w=PLACE_WORDS.find(([k])=>t.includes(k));return w?w[1]:null}
function chapterOf(year,season){return (Math.max(1,Math.min(3,year||1))-1)*4+Math.max(0,SEASONS.indexOf(season))}
function chapterLabel(ch){ch=Math.max(0,Math.min(11,ch|0));return SEASON_NAME[SEASONS[ch%4]]+' '+CAMPAIGN_YEARS[ch/4|0]}
function missionMeta(m){
  const kind=m.kind||(m.journey?'journey':m.bigtalk?'bigtalk':'workday');
  const ci=careerInfo(m.career),cd=PLACES[ci.district]?ci.district:null;
  const district=PLACES[m.district]?m.district:kind==='travel'?(placeFromLabel(m.place)||cd||'boston'):(cd||placeFromLabel(m.place)||'boston');
  const home=PLACES[cd||district];
  const year=m.year||ci.year||PLACES[district].year||home.year||1;
  let ch;if(SEASONS.includes(m.season))ch=chapterOf(year,m.season);
  else{const base=chapterOf(year,home.year&&home.year!==year?'spring':home.season||'spring');
    const bump=(kind==='plot'?1:0)+(m.rank==='pro'?1:m.rank==='legend'?2:0);ch=Math.min(chapterOf(year,'winter'),base+bump)}
  return {kind,district,year,chapter:ch,rank:RANKS.includes(m.rank)?m.rank:'trainee'}}

// ---------- campaign state: S.camp, created lazily so old saves and new games both work ----------
//   ch: current chapter (0 = Spring 2040 ... 11 = Winter 2042)   wk: first completions this season
//   fin: {missionId:1} missions already counted by the calendar   ranks: {career: 'trainee'|'pro'|'legend'}
//   coins: wallet   jp: {missionId: furthest journey stage index}   news: things the map should celebrate once
function camp(){if(typeof S==='undefined')return {ch:0,wk:0,fin:{},ranks:{},coins:0,jp:{},news:[]};
  if(!S.camp||typeof S.camp!=='object'){const C={ch:0,wk:0,fin:{},ranks:{},coins:0,jp:{},news:[]};S.camp=C;
    // an older save: count what it already finished without celebrating it again
    for(const id in (S.completed||{})){const m=MISSIONS[id];if(!m)continue;C.fin[id]=1;C.coins+=payFor(m);C.wk++;const r=rankFromMission(m);if(r)C.ranks[m.career]=maxRank(C.ranks[m.career],r)}
    campaignAdvance(true)}
  const C=S.camp;C.fin=C.fin||{};C.ranks=C.ranks||{};C.jp=C.jp||{};C.news=C.news||[];C.coins=C.coins||0;C.ch=C.ch||0;C.wk=C.wk||0;return C}
function maxRank(a,b){return RANKS.indexOf(b)>RANKS.indexOf(a)?b:(a||b)}
// finishing anything in a career makes you at least a Trainee; only a big talk promotes
function rankFromMission(m){if(!m.career)return null;return missionMeta(m).kind==='bigtalk'&&RANKS.includes(m.promotes)?m.promotes:'trainee'}
function payFor(m){const k=missionMeta(m);return k.kind==='workday'?PAY.workday[k.rank]:PAY[k.kind]||PAY.other}

// ---------- ranks ----------
function rankOf(career){return camp().ranks[career]||null}
function rankAtLeast(career,r){return RANKS.indexOf(rankOf(career)||'')>=RANKS.indexOf(r)}
function promote(career,to){const C=camp();if(!RANKS.includes(to))return;const was=C.ranks[career];C.ranks[career]=maxRank(was,to);
  if(C.ranks[career]!==was)C.news.push({promo:career,rank:to});save()}

// ---------- unlocking ----------
const isDone=id=>!!(S.completed&&S.completed[id]);
function careerJourney(career){return Object.values(MISSIONS).find(m=>m.career===career&&missionMeta(m).kind==='journey')||null}
function bigTalkNeeds(m){const me=missionMeta(m);return Object.values(MISSIONS).filter(x=>x!==m&&x.career===m.career&&missionMeta(x).kind==='workday'&&missionMeta(x).rank===me.rank).map(x=>x.id)}
function missionNeeds(m){const me=missionMeta(m);let need=(m.after||[]).filter(id=>MISSIONS[id]);
  if(me.kind==='bigtalk')need=need.concat(bigTalkNeeds(m).filter(id=>!need.includes(id)));
  return need}
// why a mission is locked, or '' when it can be played (ignores Play anything)
function lockReason(m){const me=missionMeta(m),C=camp();
  const need=missionNeeds(m).filter(id=>!isDone(id));
  if(need.length){const n=MISSIONS[need[0]];return 'Finish “'+(n.title||need[0])+'” first'}
  if(m.career&&me.kind!=='journey'){const j=careerJourney(m.career);if(j&&!isDone(j.id))return 'Finish “'+j.title+'” first'}
  if(m.career&&me.rank!=='trainee'&&!rankAtLeast(m.career,me.rank))return 'Needs '+RANK_NAME[me.rank]+' rank';
  if(me.chapter>C.ch)return 'Opens in '+chapterLabel(me.chapter);
  return ''}
function missionOpen(m){return !!(S.playAll||!lockReason(m))}
const KIND_ORDER={journey:0,workday:1,bigtalk:2,memorial:3,plot:4,travel:5,ruin:6,finale:7};
function missionSort(a,b){const A=missionMeta(a),B=missionMeta(b);return A.chapter-B.chapter||(KIND_ORDER[A.kind]??9)-(KIND_ORDER[B.kind]??9)||PLACE_ORDER.indexOf(A.district)-PLACE_ORDER.indexOf(B.district)||String(a.career||'').localeCompare(String(b.career||''))||(a.day||0)-(b.day||0)}
// the one thing the map suggests next
function nextUp(){return Object.values(MISSIONS).filter(m=>!isDone(m.id)&&!lockReason(m)).sort(missionSort)[0]||null}
function placeMissions(key){return Object.values(MISSIONS).filter(m=>missionMeta(m).district===key).sort(missionSort)}
// a place is open once anything there is playable or done, or the calendar has reached it
function placeOpen(key){if(S.playAll)return placeMissions(key).length>0;const P=PLACES[key];const ms=placeMissions(key);
  if(ms.some(m=>isDone(m.id)||!lockReason(m)))return true;
  return !!(P.year&&ms.length&&chapterOf(P.year,P.season)<=camp().ch)}
function placeOpensLabel(key){const P=PLACES[key],ms=placeMissions(key);if(!ms.length)return 'Coming soon';
  const ch=Math.min(...ms.map(m=>missionMeta(m).chapter));return ch>camp().ch?'Opens in '+chapterLabel(ch):'Coming soon'}
function placeNew(key){return placeMissions(key).filter(m=>!isDone(m.id)&&missionOpen(m)).length}

// ---------- the calendar: finishing missions moves the date ----------
// Called whenever the map is shown. A mission counts once, the first time it lands in S.completed (however it got
// there), so replays never move the clock. A season ends after WEEKS_PER_SEASON first completions, or early when
// nothing is left to play in it but later content exists.
function campaignSync(){const C=camp();let moved=false;
  for(const id in (S.completed||{})){if(C.fin[id]||!MISSIONS[id])continue;const m=MISSIONS[id];C.fin[id]=1;C.wk++;
    const pay=payFor(m);C.coins+=pay;C.news.push({coins:pay,mission:id});
    const r=rankFromMission(m);if(r)C.ranks[m.career]=maxRank(C.ranks[m.career],r);moved=true}
  if(campaignAdvance())moved=true;if(moved)save();return moved}
function campaignAdvance(quiet){const C=S.camp;let turned=false;
  const later=()=>Object.values(MISSIONS).some(m=>!isDone(m.id)&&missionMeta(m).chapter>C.ch);
  const openNow=()=>Object.values(MISSIONS).some(m=>!isDone(m.id)&&!lockReason(m));
  for(let guard=0;guard<12&&C.ch<11;guard++){
    if(C.wk>=WEEKS_PER_SEASON||(!openNow()&&later())){C.ch++;C.wk=Math.max(0,C.wk-WEEKS_PER_SEASON);turned=true;if(!quiet)C.news.push({season:C.ch})}else break}
  return turned}
function takeNews(){const C=camp();const n=C.news.splice(0);if(n.length)save();return n}

// ---------- resources: Hearts (per character), Coins, Days ----------
function addHearts(who,n=1){if(!who)return 0;heart(who,n);return S.hearts[who]}
function heartsOf(who){return (S.hearts||{})[who]||0}
function heartsTotal(){return Object.values(S.hearts||{}).reduce((a,b)=>a+(+b||0),0)}
function addCoins(n){const C=camp();C.coins=Math.max(0,C.coins+(n|0));save();return C.coins}
function spendCoins(n){const C=camp();if(C.coins<n)return false;C.coins-=n;save();return true}
function coins(){return camp().coins}
// Days: a mission that declares days:N gets N days for its work; checks and tests can spend them.
function daysLeft(){const m=typeof M==='function'&&M();if(!m||!m.days)return null;if(S.daysFor!==S.mission||S.daysLeft==null){S.daysFor=S.mission;S.daysLeft=m.days}return S.daysLeft}
function spendDays(n=1){const d=daysLeft();if(d==null||d<n)return false;S.daysLeft=d-n;save();const el=document.querySelector('.cm-days b');if(el)el.textContent=S.daysLeft;return true}

// ---------- stars: Ask (a clear request), Decision (a wise choice), Heart (treating people and animals well) ----------
const STAR_TYPES=[['ask','Ask'],['decision','Decision'],['heart','Heart']];
function starsFrom(o){o=o||{};const r={ask:o.ask?1:0,decision:o.decision?1:0,heart:o.heart?1:0};r.stars=r.ask+r.decision+r.heart;return r}
function awardStars(id,sb){if(typeof id==='object'){sb=id;id=S.mission}sb=starsFrom(sb);const prev=S.completed[id]||{};const n={...prev};
  for(const [k] of STAR_TYPES)n[k]=Math.max(prev[k]||0,sb[k]);n.stars=Math.max(prev.stars||0,n.ask+n.decision+n.heart);
  S.completed[id]=n;S.lastStars=sb.stars;save();return n}
function starTotals(){const t={ask:0,decision:0,heart:0,stars:0};for(const id in (S.completed||{})){const c=S.completed[id]||{};t.stars+=c.stars||0;for(const [k] of STAR_TYPES)t[k]+=c[k]||0}return t}

// ---------- saves ----------
// Version 1 saves are plain game state. Version 2 adds S.camp (built from S.completed on first use, so nothing is
// lost), hearts keyed by character, and the playAll switch. Any save without a version number is rejected.
const HEART_ALIASES={reyes:'imani',home:'byte',morning:'byte'};
function migrateSave(s){if(!s||typeof s!=='object'||!s.v)return null;
  if(s.v<2){const h={};for(const k in (s.hearts||{})){const to=HEART_ALIASES[k]||k;h[to]=(h[to]||0)+(+s.hearts[k]||0)}s.hearts=h;delete s.camp;s.v=2}
  return s}
