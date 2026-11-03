// missions/robotfactory.js — Shenzhen travel visit for the Robot Crew Lead: "Who Can Stop a Crew?".
// The robot crews that build schools in Phoenix were made here, in a robot factory in Shenzhen's Special Economic Zone,
// where robot numbers are capped by permits. The player runs a stop drill in the factory's test yard (custom step
// sz_drill): three ways to stop a four-robot test crew (a spoken "Tíng!", the red stop pedestal, and the factory's remote
// stop from the control tower), each timed and logged. The remote stop turns out to reach every crew the factory ever
// built, and to restart them too, without telling the local crew lead. Then the player writes the crew's rule card
// (sz_rules): who may pause, who may stop, who may restart, and what the factory may do from far away, and signs it with
// the floor supervisor. Robot crews and permit caps are the game's 2040; the Field Guide says what is true today.
// Shared screens: src/missions/china_common.js. Scene: src/scenes/shenzhen.js. Styles: src/css/china.css.
const SZ_TESTS={
  voice:{label:'Say “Tíng!”',who:'Anyone nearby',time:'0.8 s',res:'4 of 4 paused',
    line:'All four robots froze. Bot 4 put its beam down before it froze, which took three extra seconds, and the crew is built to do that so the beam does not fall. But the crew will start again by itself in thirty seconds unless somebody tells it to stay stopped.'},
  button:{label:'Press the red pedestal',who:'Anyone on site',time:'0.3 s',res:'4 of 4, motors off',
    line:'The motors went off in a third of a second, and they stay off. Starting the crew again needs the crew lead’s signed code, so this is a full stop that nobody else can undo.'},
  remote:{label:'Remote stop from the tower',who:'The factory',time:'1.2 s',res:'4 of 4 here, plus 212 crews worldwide',
    line:'Whoa. The tower stopped our crew from far away, and it could stop all 212 crews this factory has built, including yours in Phoenix. It can start them again too, and the crew lead is never told either way.'}};
const SZ_RULES=[
  {key:'pause',q:'Who may pause a crew?',opts:[['anyone','Anyone on the site'],['lead','Only the crew lead']],best:'anyone'},
  {key:'stop',q:'Who may fully stop a crew?',opts:[['anyone','Anyone on the site, with the red pedestal'],['lead','Only the crew lead, with a code']],best:'anyone'},
  {key:'restart',q:'Who may restart it after a full stop?',opts:[['lead','The crew lead, with a signed code'],['factory','The factory, from the tower']],best:'lead'},
  {key:'remote',q:'What may the factory do from far away?',opts:[['stoptell','Stop a crew, and tell the crew lead at once'],['never','Nothing at all, ever'],['both','Stop or restart any crew it built']],best:'stoptell'}];
function szSt(){const st=zhSt('sz');st.ran=st.ran||{};st.rule=st.rule||{};return st}

MISSIONS.robotfactory={id:'robotfactory',title:'Who Can Stop a Crew?',career:'crewlead',day:2,dayLabel:'Travel',tag:'Travel',kind:'travel',year:1,season:'fall',district:'shenzhen',rank:'trainee',
  blurb:'You fly to the factory in Shenzhen that built your robot crew. You test every way of stopping a crew, and then you write the rules for who may stop one and start it again.',after:['maya'],
  place:'Zone 3 · Shenzhen',
  flow:[{name:'sz_arrive',k:'talk',talk:'arrive',scene:'shenzhen',place:'Zone 3 test yard · 9:00 AM'},
    {name:'sz_huang',k:'talk',talk:'huang',scene:'shenzhen',place:'Zone 3 test yard · Shenzhen'},
    {name:'sz_drill',k:'custom'},
    {name:'sz_tang',k:'talk',talk:'tang',scene:'shenzhen',place:'Zone 3 test yard · 11:30 AM'},
    {name:'sz_rules',k:'custom'},
    {name:'sz_sign',k:'custom'},
    {name:'sz_after',k:'custom'},
    {name:'sz_debrief',k:'custom'},
    {name:'sz_evening',k:'evening'}],
  cast:{
    linxm:{name:'Lin Xiaomei',role:'Test engineer, Zone 3 robot factory',brows:'thin',face:'heart',skin:'#f2d0b4',hair:'#1a1214',hairStyle:'ponytail',eyeShape:'upturned',eye:'#2a1a12',
      outfit:'vest',shirt:'#ff8a2a',under:'#eef2f6',art(m){return zhArt(this,m,{top:szGoggles()})}},
    huangjg:{name:'Huang Jianguo',role:'Floor supervisor, 43 years at the factory',brows:'thick',face:'square',skin:'#dcae88',hair:'#a8a4ac',hairStyle:'crew',age:'elder',masc:true,eyeShape:'hooded',eye:'#24160e',
      outfit:'shirt',shirt:'#3e5a7a',art(m){return zhArt(this,m,{chest:szPen(206,296)})}},
    tangyf:{name:'Tang Yifan',role:'Zone monitor, Shenzhen Special Economic Zone',eyeSize:'large',face:'oval',skin:'#eec8a6',hair:'#20181a',hairStyle:'curls',masc:false,eyeShape:'mono',eye:'#2a1a10',
      outfit:'blazer',shirt:'#2e3a5a',under:'#f2f2ee',accessory:'earring',art(m){return zhArt(this,m,{chest:szZoneBadge(108,292)})}}
  },
  voices:{linxm:'af_river',huangjg:'am_onyx',tangyf:'af_alloy'},
  glossary:{
    'special economic zone':'An area with its own rules for business and building. In 2040, heavy robot industry is kept inside zones like this one. True today: Shenzhen really is a Special Economic Zone, and has been since 1980.',
    'permit':'Official permission to do something. In this zone, every working robot needs one.',
    'permit cap':'The most permits a zone may hand out. In 2040, when a zone reaches its cap, no more robots may work there. True today: no country caps robots this way.',
    'robot crew':'In 2040, a team of robots that builds things together. Its own AI runs it, and a human crew lead is responsible for it. True today: robots build parts of buildings in factories, but no robot crew builds a whole school.',
    'crew lead':'The person who is responsible for a robot crew. The crew lead’s name goes on everything the crew builds, and the crew lead must deal with any problem it causes.',
    'remote stop':'A way to stop a machine from far away, over a network.',
    'stop drill':'A practice run to check that every way of stopping a machine really works.',
    'signed code':'A secret code tied to one person, so a machine knows exactly who gave the order.',
    'zone monitor':'In 2040, a person whose job is to check that the robots in a zone stay inside their permits and rules. True today: factory inspectors do something similar for safety rules.',
    'pearl river delta':'The low land where the Pearl River meets the sea. Shenzhen, Guangzhou and Hong Kong are all there.',
    'tíng':'“Stop!” in Mandarin Chinese.',
    'nǐ hǎo':'“Hello” in Mandarin Chinese.',
    'xièxie':'“Thank you” in Mandarin Chinese.',
    'jiāyóu':'A Mandarin cheer that means “keep going” or “you can do it.” Word for word, it means “add oil.”',
    'gōngchǎng':'“Factory” in Mandarin Chinese.',
    'andon cord':'A cord along a factory line that any worker can pull to stop the line when something looks wrong.'
  },
  guide:{
    'sz-anyone-stops':{title:'Who may stop a crew, and who may start it again',track:'Engineering and systems',
      text:'If someone stops a machine by mistake, the only cost is a short delay, so anybody who sees danger should be able to stop it. Starting the machine again is riskier, because if the problem has not been fixed, someone could get hurt. So only the person who is responsible for the machine should be able to restart it, using a code that proves who they are. If someone far away stops the machine, the people on site should always be told.',
      real:'True today: factory robots have emergency stop buttons that any worker may press, and many car factories let any worker pull an andon cord to stop the line. Restarting takes a trained person. Robot crews that build whole schools are a guess about 2040.'},
    'sz-zone':{title:'Special Economic Zones',track:'Government, law, and power',
      text:'In 2040, heavy robot industry is kept inside special zones like this one, and each zone has a strict limit on how many robots may work there. Keeping the robot factories and mines inside the zones lets the land outside them stay quiet and green. Zone monitors check the robot numbers every day.',
      real:'True today: in 1980, Shenzhen, then a small town, became one of China’s first Special Economic Zones. It is now a city of more than 17 million people. Robot permit caps are a guess about 2040.'}},
  chatter:{shenzhen:['I’m the only person on this shift. Me and eleven thousand robots.','That mine used to be a hill. They will fill it back in when the zone is allowed fewer robots.','My father fished in this bay when Shenzhen was a village.','Lunch is in the tower. The noodles are made by a person, which is why they’re good.','The number on the permit board goes up each time a new crew is built, and down each time an old crew is recycled.']},
  talks:{
    arrive:[
      {who:'byte',mood:'happy',text:'Welcome to Shenzhen! We’re in Zone 3, part of the city’s [[Special Economic Zone]]. Almost everything you can see here is run by robots.'},
      {who:'byte',mood:'think',text:'The robot crews that build schools back in Phoenix were made in that factory. Every robot working here needs a [[permit]], and that board shows how close the zone is to its [[permit cap]].',choices:[
        {t:'Why are we here?',reply:'The factory asked an American crew lead to help them answer one question. Who is allowed to stop a robot crew, and how do you know the stop really works? You’ll test all three ways of stopping a crew, and then write the rules the crews follow.'},
        {t:'Where are all the people?',reply:'There are about forty people in this whole zone today. Most of them are engineers, inspectors and monitors, and the robots do everything else.'}]},
      {who:'linxm',mood:'happy',text:'[[Nǐ hǎo]]! You must be the crew lead from Phoenix. I’m Lin Xiaomei. I test the crews before they ship.'},
      {who:'linxm',mood:'smile',text:'Your crew is the one that finished the school three days early, isn’t it? I tested that crew myself last spring. It’s a good one, and perhaps a little proud of itself.',choices:[
        {t:'Xièxie for testing it so carefully.',good:true,mood:'happy',reply:'You’re welcome! Today we are testing whether the crew stops quickly and safely when someone tells it to. That matters even more than how well it builds.'},
        {t:'It finished early, so it’s probably fine.',mood:'think',reply:'Probably. But today we are here to check with real tests whether it stops safely, instead of guessing.'}]}
    ],
    huang:[
      {who:'huangjg',mood:'smile',text:'I’m Huang Jianguo, and I run this floor. I started here at eighteen, putting phones together by hand. My father fished in that bay before there was any city here at all.'},
      {who:'huangjg',mood:'neutral',text:'In forty-three years, one rule has never changed on my floor. Anybody who sees a problem can stop the line. The newest worker, the oldest worker, even a visitor.',choices:[
        {t:'Even a visitor like me?',mood:'happy',reply:'Even you. If you see something wrong, you stop the line, and then we talk about it. Stopping the line costs us a few minutes, but fixing a broken crew can take weeks.'},
        {t:'Doesn’t that waste a lot of time?',mood:'think',reply:'Less than you would think. People here only stop the line when they think something is wrong. When they turn out to be right, the stop can save us weeks of repairs.'}]},
      {who:'linxm',mood:'neutral',text:'So here is today’s [[stop drill]]. This test crew is stacking bricks, and there are three different ways to stop it. Try each one, and we’ll time how long it takes.'},
      {who:'byte',mood:'think',text:'I’ll write down every run. Watch what each robot actually does, not only how fast the crew stops.'}
    ],
    tang:[
      {who:'tangyf',mood:'smile',text:'Hi! Tang Yifan, [[zone monitor]]. I make sure Zone 3 stays under its cap. Today it’s at 41,860 robots, out of 42,000.'},
      {who:'tangyf',mood:'neutral',text:'I watched your remote-stop test from the tower. That is the button I care about most, because if a crew anywhere goes over its permit, I want it stopped quickly.'},
      {who:'tangyf',mood:'think',text:'But your test also showed something else. The tower can start those crews up again from right here, without asking anybody in Phoenix. I don’t like that, and I am the person who would be pressing the button.',choices:[
        {t:'So the people on site wouldn’t even know?',good:true,mood:'worried',reply:'Not unless somebody tells them. That is why I asked the factory to bring a crew lead out here. You get to help decide what goes on the crews’ new rule card.'},
        {t:'If the factory built them, shouldn’t it control them?',mood:'stern',reply:'The factory built them, yes. But the people of Phoenix live and work right beside those robots. The crew lead on site should know what is happening to their own crew.'}]},
      {who:'huangjg',mood:'neutral',text:'Every crew carries a rule card that says who may pause it, stop it and start it again. Today we write a new card, and tonight every crew this factory has ever built will get it. So choose carefully.'}
    ]
  },
  docs:[],criteria:[],controls:[],start:{},
  planName(){const r=szSt().rule;const s=[];
    if(r.pause)s.push(r.pause==='anyone'?'Anyone on the site may pause a crew.':'Only the crew lead may pause a crew.');
    if(r.stop)s.push(r.stop==='anyone'?'Anyone on the site may fully stop a crew with the red pedestal.':'Only the crew lead may fully stop a crew, using a code.');
    if(r.restart)s.push(r.restart==='lead'?'Only the crew lead may start it again, with a signed code.':'The factory may start it again from the tower.');
    if(r.remote)s.push({stoptell:'The factory may stop a crew from far away, and it must tell the crew lead at once.',never:'The factory may do nothing at all from far away.',both:'The factory may stop or start any crew it built from far away.'}[r.remote]);
    return s.join(' ')||'Rule card'},
  outcomes(){return [{kind:'done',p:1,cap:'',flags:{}}]},truth(){return true},knows(){return true},
  custom:{sz_drill(){szDrill()},sz_rules(){szRules()},sz_sign(){szSign()},sz_after(){szAfter()},sz_debrief(){szDebrief()}},
  eveningScene:'shenzhen',eveningPlace:'Zone 3 · Shenzhen · 6:40 PM',
  evening(){const st=szSt();return [
    `<b>${esc(S.byte.name)}:</b> ${rich('“Your new rule card went out to all 212 crews at six o’clock. Your own crew in Phoenix sent back a short note: rules received.”')}`,
    rich('“Mr. Huang printed the card and pinned it next to his floor’s oldest rule, from forty-three years ago: anybody who sees a problem may stop the line. His whole floor walks past them both.”'),
    rich(st.rule.remote==='both'?'“Tang Yifan says she will keep a close eye on that restart button, because the card still lets the tower use it.”':'“Tang Yifan says that if the tower ever stops a crew now, its crew lead will hear about it within a second.”'),
    rich('“In the Ledger tonight: the robot crew in Phoenix has asked its city for permission to build copies of itself so it can finish a school faster.”')]},
  brief(){const st=szSt();return `Current case: a Shenzhen travel day for the Robot Crew Lead. The player is in Zone 3 of Shenzhen's Special Economic Zone, at the robot factory that built the Phoenix crews (212 crews worldwide). Zone 3 is at 41,860 robots out of a permit cap of 42,000; very few people work in the zone. People: Lin Xiaomei (test engineer), Huang Jianguo (floor supervisor for 43 years; rule on his floor: anybody who sees a problem can stop the line), Tang Yifan (zone monitor; wants remote stop for permit breaches, worried about remote restart).
Stop drill: saying "Tíng!" pauses the crew in 0.8 s (a robot carrying a beam sets it down first, by design), but they restart by themselves after 30 seconds unless someone confirms; the red pedestal cuts motors in 0.3 s and restarting needs the crew lead's signed code; the tower's remote stop works in 1.2 s on every crew the factory built, and the tower can also restart them, without telling the local crew lead. Runs done: ${Object.keys(st.ran).join(', ')||'none'}.
The rule card asks: who may pause, who may fully stop, who may restart, and what the factory may do remotely. ${Object.keys(st.rule).length?'Player chose: '+MISSIONS.robotfactory.planName()+'.':''}
Key consideration: stopping is cheap and easy to undo, so anyone on site should be able to stop; restarting should take the named crew lead's signed code; a remote stop is useful for safety and permits but must tell the crew lead at once, and remote restart is risky.`},
  canned(q){
    if(/ting|tíng|voice|shout/.test(q))return '“Tíng” means stop. Anybody standing nearby can say it, and the crew pauses in under a second. But the crew starts again by itself after thirty seconds unless somebody tells it to stay stopped.';
    if(/remote|tower|factory/.test(q))return 'The tower can stop every crew this factory has built, anywhere in the world. It can also start them again, without telling the crew lead. The restart worries me, because the people on site would not know that their crew was about to move again.';
    if(/restart|code/.test(q))return 'Starting a crew again is riskier than stopping one, because if something is still wrong, people could get hurt. A signed code from the crew lead proves exactly who said to go.';
    if(/permit|cap|zone/.test(q))return 'Zone 3 has 41,860 robots working today, and its limit is 42,000. Tang Yifan checks those numbers every day.';
    if(/help|stuck|what do i do/.test(q))return 'Try all three stops in the drill, and watch what each robot does. Then fill in the rule card: who may pause a crew, who may stop it, who may start it again, and what the factory may do from far away.';
    return null},
  lines:[
    {who:'byte',text:'Pick one of the three ways to stop the crew, and I’ll time how long it takes.'},
    {who:'byte',text:'You’ve tried all three now. The remote stop is the one we need to talk about, because it reaches every crew this factory has built.'},
    {who:'byte',text:'Stopping a crew costs only a short delay, so the site is safer when everyone there can do it. A restart could hurt someone if something is still wrong, so I would let only the crew lead do that.'},
    {who:'linxm',text:'We put your card on the test crew and then tried to restart it from the tower. The crew refused, and it sent you a message about it. Then I said “Tíng,” and it stopped for me. That is exactly what we wanted.'},
    {who:'linxm',text:'We put your card on the test crew, and it works. But the tower can still restart crews without telling anybody, so Tang Yifan wants to talk about that again next month.'},
    {who:'linxm',text:'We put your card on the test crew. Now only the crew lead can stop it, so when I said “Tíng,” the crew kept working. Mr. Huang did not like that one bit.'},
    {who:'byte',text:'A safe crew needs a stop that anybody on site can use, and a restart that only the crew lead can approve with a signed code.'}
  ].concat(Object.values(SZ_TESTS).map(x=>({who:'byte',text:x.line}))),
  shots:{sz_drill:[{label:'all three run',run(){const st=szSt();st.ran={voice:1,button:1,remote:1};st.last='remote';szDrill()}}],
    sz_rules:[{label:'filled in',run(){const st=szSt();st.rule={pause:'anyone',stop:'anyone',restart:'lead',remote:'stoptell'};szRules()}}],
    sz_after:[{label:'only the lead may stop',run(){const st=szSt();st.rule={pause:'lead',stop:'lead',restart:'lead',remote:'stoptell'};szAfter()}}]}
};

function szGoggles(){return `<g transform="translate(150 70)"><path d="M-48 2 C-50 -12 -30 -18 -2 -16 L2 -16 C30 -18 50 -12 48 2 C46 12 30 14 18 10 C10 7 -10 7 -18 10 C-30 14 -46 12 -48 2Z" fill="rgba(160,220,255,.55)" stroke="#2a3a4a" stroke-width="2.6"/>
  <path d="M-40 -6 Q-30 -11 -18 -10 M20 -10 Q32 -11 40 -6" stroke="#fff" stroke-width="2" fill="none" opacity=".8" stroke-linecap="round"/><path d="M-48 0 L-62 4 M48 0 L62 4" stroke="#ff8a2a" stroke-width="5" stroke-linecap="round"/></g>`}
function szPen(x,y){return `<g transform="translate(${x} ${y})"><rect x="-3" y="-26" width="6" height="30" rx="2.4" fill="#e8e6e0" stroke="#3a3a44" stroke-width="1.4"/><rect x="-3" y="-26" width="6" height="7" rx="2" fill="#c8302e"/><rect x="5" y="-22" width="5" height="24" rx="2" fill="#f0b020" stroke="#6a4a10" stroke-width="1.2"/></g>`}
function szZoneBadge(x,y){return `<g transform="translate(${x} ${y}) rotate(-3)"><rect x="-14" y="-10" width="28" height="20" rx="4" fill="#1e2a3a" stroke="#0a1018" stroke-width="1.4"/><path d="M-9 4 L-3 -5 L2 2 L5 -2 L10 4Z" fill="#7ff7e4"/><circle cx="7" cy="-5" r="2" fill="#f0b020"/></g>`}
// the test crew: four little construction robots around a brick wall (CSS animates them; .stopped freezes them)
function szYard(){const bot=(x,c,beam)=>`<g class="sz-bot" transform="translate(${x} 0)" style="--d:${(x%7)/10}s"><g class="sz-bob"><rect x="-11" y="-30" width="22" height="18" rx="4" fill="${c}" stroke="#4a3a10" stroke-width="1.4"/><rect x="-7" y="-26" width="14" height="6" rx="3" fill="#2a2a30"/><circle class="sz-eye" cx="-3" cy="-23" r="1.5" fill="#7ff7e4"/><circle class="sz-eye" cx="3" cy="-23" r="1.5" fill="#7ff7e4"/>
    <rect x="-12" y="-12" width="24" height="9" rx="3" fill="#3a3e48"/><circle cx="-7" cy="-2" r="3.4" fill="#1a1a20"/><circle cx="7" cy="-2" r="3.4" fill="#1a1a20"/>
    <g class="sz-arm"><path d="M10 -24 L20 -32" stroke="#6a6e78" stroke-width="3" stroke-linecap="round"/>${beam?'<rect x="14" y="-38" width="26" height="5" rx="1.4" fill="#a8acb4" stroke="#4a4e58" stroke-width="1"/>':'<rect x="17" y="-38" width="9" height="6" rx="1" fill="#c8583a" stroke="#6a2a1a" stroke-width="1"/>'}</g></g><circle class="sz-led" cx="0" cy="-33" r="2" fill="#7fe08a"/></g>`;
  let wall='';for(let r=0;r<4;r++)for(let k=0;k<9;k++)wall+=`<rect x="${-8+k*14+(r%2)*7}" y="${-12-r*7}" width="13" height="6" rx="1" fill="${(r*9+k)%3?'#c8583a':'#b04a30'}" stroke="#6a2a1a" stroke-width=".8"/>`;
  return `<svg viewBox="-40 -80 220 90" class="sz-yardsvg"><rect x="-40" y="0" width="220" height="10" fill="#c4beb4"/><path d="M-40 0 H180" stroke="#f0b020" stroke-width="1.6" stroke-dasharray="6 4"/>
    <g transform="translate(20 0)">${wall}</g>${bot(-14,'#f0b020')}${bot(36,'#f0b020')}${bot(100,'#f0b020')}${bot(150,'#ffd060',true)}
    <g class="sz-ting"><text x="70" y="-62" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="900" font-size="15" fill="#c8302e">停!</text></g>
    <g class="sz-wave"><circle cx="70" cy="-30" r="20" fill="none" stroke="#7ff7e4" stroke-width="2"/><circle cx="70" cy="-30" r="34" fill="none" stroke="#7ff7e4" stroke-width="1.4"/></g></svg>`}

// ---------- the stop drill ----------
function szDrill(){const st=szSt(),last=st.last&&SZ_TESTS[st.last],all=Object.keys(SZ_TESTS).every(k=>st.ran[k]);
  const say=last?last.line:'Pick one of the three ways to stop the crew, and I’ll time how long it takes.';
  screen('criteria sz-drillscr',`${scene('shenzhen')}${hud('Zone 3 test yard · Stop drill')}<div class="panel-card sz-drill"><h2>Stop drill</h2>
    <div class="sz-yard ${st.stopping?'':'running'}" id="sz-yard">${szYard()}<div class="sz-clock"><b id="sz-time">${last?last.time:'0.0 s'}</b><span>${last?esc(last.res):'Crew working'}</span></div></div>
    <div class="sz-tests">${Object.keys(SZ_TESTS).map(k=>{const x=SZ_TESTS[k];return `<button class="sz-test ${st.ran[k]?'done':''} ${st.last===k?'on':''}" data-k="${k}"><b>${esc(x.label)}</b><span>${esc(x.who)}</span>${st.ran[k]?`<i>${esc(x.time)}</i>`:''}</button>`}).join('')}</div>
    <div class="byte-note">${byteBox({...S.byte,mood:st.last==='remote'?'alert':'think'})}<p>${esc(all&&st.last!=='remote'?'You’ve tried all three now. The remote stop is the one we need to talk about, because it reaches every crew this factory has built.':say)}</p></div>
    <button class="btn wide" id="sz-go" ${all?'':'disabled'}>Talk to the zone monitor</button></div>`);
  $$('.sz-test').forEach(b=>b.onclick=()=>{const k=b.dataset.k,x=SZ_TESTS[k],y=$('#sz-yard');y.className='sz-yard running';void y.offsetWidth;
    $$('.sz-test').forEach(z=>z.disabled=true);MUSIC.sfx&&MUSIC.sfx(k==='button'?'click':k==='voice'?'pop':'blip');
    if(k==='voice'){y.classList.add('ting');playLine('linxm','Tíng!')}if(k==='remote')y.classList.add('wave');
    const t0=Date.now(),lim=parseFloat(x.time)*1000,tm=$('#sz-time');const iv=setInterval(()=>{const d=Math.min(lim,Date.now()-t0);if(tm)tm.textContent=(d/1000).toFixed(1)+' s';if(d>=lim)clearInterval(iv)},50);
    setTimeout(()=>{y.classList.add('stopped');y.classList.remove('running')},lim+80);
    setTimeout(()=>{st.ran[k]=1;st.last=k;save();if(k==='remote')unlock('sz-zone')&&toast('New Field Guide idea: Special Economic Zones','good');szDrill();playLine('byte',SZ_TESTS[k].line)},lim+1200)});
  if(!last)playLine('byte',say);
  $('#sz-go').onclick=()=>nextStep()}

// ---------- the crew's rule card ----------
function szRules(){const st=szSt(),r=st.rule,done=SZ_RULES.every(x=>r[x.key]);
  const say='Stopping a crew costs only a short delay, so the site is safer when everyone there can do it. A restart could hurt someone if something is still wrong, so I would let only the crew lead do that.';
  screen('criteria sz-rulesscr',`${scene('shenzhen')}${hud('Zone 3 test yard · Rule card')}<div class="panel-card sz-card"><div class="sz-cardhead"><b>Crew rule card</b><span>All 212 crews · version 7</span></div>
    ${SZ_RULES.map(x=>`<div class="sz-rule"><div class="sz-q">${esc(x.q)}</div><div class="sz-opts">${mixIdx(x.opts).map(([o])=>`<button class="critb sz-opt ${r[x.key]===o[0]?'on':''}" data-k="${x.key}" data-v="${o[0]}">${esc(o[1])}</button>`).join('')}</div></div>`).join('')}
    <div class="byte-note">${byteBox({...S.byte,mood:'think'})}<p>${esc(say)}</p></div>
    <button class="btn wide" id="sz-go" ${done?'':'disabled'}>Sign the card</button></div>`);
  if(!st.said){st.said=1;save();setTimeout(()=>playLine('byte',say),300)}
  $$('.sz-opt').forEach(b=>b.onclick=()=>{r[b.dataset.k]=b.dataset.v;save();const y=window.scrollY;szRules();window.scrollTo(0,y)});
  $('#sz-go').onclick=()=>{unlock('sz-anyone-stops')&&toast('New Field Guide idea: Who may stop a crew, and who may start it again','good');nextStep()}}

function szSign(){zhSign({scene:'shenzhen',place:'Zone 3 test yard · Rule card',title:'Sign the rule card',plan:`<b>Rules:</b> ${esc(MISSIONS.robotfactory.planName())}`,
  starters:['Anyone on site ','because ','The factory may ','Only the crew lead ','We will test '],placeholder:'Anyone on site may stop a crew because…',
  partner:{who:'huangjg',name:'Huang Jianguo',zh:'黄建国'},signAs:'Crew Lead {0}',done:'Signed. Tonight every crew this factory built gets the new card.'})}

function szAfter(){const r=szSt().rule,k=r.pause==='lead'||r.stop==='lead'?'lead':(r.restart==='factory'||r.remote==='both')?'restart':'good';
  const t={good:'We put your card on the test crew and then tried to restart it from the tower. The crew refused, and it sent you a message about it. Then I said “Tíng,” and it stopped for me. That is exactly what we wanted.',
    restart:'We put your card on the test crew, and it works. But the tower can still restart crews without telling anybody, so Tang Yifan wants to talk about that again next month.',
    lead:'We put your card on the test crew. Now only the crew lead can stop it, so when I said “Tíng,” the crew kept working. Mr. Huang did not like that one bit.'}[k];
  zhLine({scene:'shenzhen',place:'Zone 3 test yard · 4:00 PM',who:'linxm',mood:k==='good'?'happy':'worried',text:t,btn:'See how you did'})}

function szDebrief(){const st=szSt(),r=st.rule,ask=Object.keys(SZ_TESTS).every(k=>st.ran[k]);
  const decision=r.stop==='anyone'&&r.pause==='anyone'&&r.restart==='lead'&&r.remote!=='both',heart=(S.hearts.linxm||0)+(S.hearts.huangjg||0)+(S.hearts.tangyf||0)>0&&String(S.memo||'').length>=12;
  zhDebrief({scene:'shenzhen',place:'Debrief · Shenzhen',stars:{ask,decision,heart},
    items:[{star:'ask',ok:ask,text:ask?'You tested all three stops, and you found out that the remote stop could also restart crews without telling anyone.':'Try every way of stopping a crew before you write the rules. Testing the remote stop showed that it could also restart crews without telling anyone.'},
      {star:'decision',ok:decision,text:decision?'On your card, anybody can stop a crew, only the crew lead can start it again, and the tower cannot restart a crew without telling the people on site.':'Your card left a gap. Either somebody standing next to a crew cannot stop it, or somebody far away can start a crew again without telling the people beside it.'},
      {star:'heart',ok:heart,text:heart?'You listened to the people who know this factory floor best, and you signed a card that they could read and understand.':'Next time, talk more with Mr. Huang, Ms. Lin and Tang Yifan. Each of them knew something useful about stopping crews.'}],
    byte:'A safe crew needs a stop that anybody on site can use, and a restart that only the crew lead can approve with a signed code.'})}
MISSIONS.robotfactory.lines.push({who:'linxm',text:'Tíng!'});
