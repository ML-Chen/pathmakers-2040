// hired_screens.js — custom screens for the "Getting Hired" journey (hired.js): explore, open house, Portfolio Book,
// interview (with an optional rehearsal with Byte), and the first day. Journey state lives in S.m_hired, which startMission()
// does not wipe, so the first day can check what the player remembers from the open house.

const HJ_OH=()=>window.PAINT&&PAINT.openhouse?'openhouse':'hospital';
function hiredState(){if(!S.m_hired)S.m_hired={};const H=S.m_hired;H.asked=H.asked||[];H.met=H.met||{};H.favor=H.favor||{};return H}
function hjConfetti(){const d=document.createElement('div');d.className='hired-confetti';const cols=['#6c5ce7','#16b3a6','#f5b82e','#ff7a6b','#5b9bf0'];
  d.innerHTML=Array.from({length:42},(_,i)=>`<i style="left:${(i*37)%100}%;background:${cols[i%5]};animation-delay:${(i%9)*.09}s"></i>`).join('');document.body.appendChild(d);setTimeout(()=>d.remove(),3200)}

// ---------- 1. Explore: a day in the life, then questions to Byte ----------
const DITL_CAPS=['7:50 AM. I tell you what Halo did overnight.','9:00 AM. You listen to a family and learn what matters to them.','11:00 AM. We test plans on the Future Table.','2:00 PM. You explain the choice, the family decides, and you sign.','5:00 PM. A follow-up call. Your patient is doing great!'];
const HJ_QS=[
  {q:'What does Halo do, and what do I do?',a:'Halo runs the hospital’s chores: scans, schedules, and medicine deliveries. I read the research and write forecasts. You talk with patients, find out what matters to them, and sign the decision.'},
  {q:'Why do people still want a human doctor?',a:'Because it’s their body and their life. People want someone who listens, explains the odds honestly, and is responsible for the choice. In 2040, the law says a person must sign.'},
  {q:'What’s the hardest part of the job?',a:'Hard choices. Sometimes every option has a downside, and the family is scared. A good Care Doctor stays calm, kind, and honest.'},
  {q:'Do doctors still need to know science?',a:'Yes! You don’t have to memorize everything, because I can look it up in a blink. But you need to understand enough to ask good questions and notice when something doesn’t make sense.'},
  {q:'How do I get hired?',a:'Meet the people who work there, show your work in a Portfolio Book, and do well in an interview with Dr. Reyes. The open house is today!'}
];
function hiredExplore(keep){if(!keep){S.m_hired={asked:[],met:{},favor:{}};save()}let i=0,timer=0;const DUR=6000;
  const panel=()=>{const has=typeof DITL_PANELS!=='undefined'&&DITL_PANELS[i];return has?DITL_PANELS[i]():`<svg viewBox="0 0 320 200"><rect width="320" height="200" fill="#eef1fb"/></svg>`};
  screen('explore',`${scene('hospital')}${hud('A day as a Care Doctor')}<div class="hired-card hired-ditl"><div class="hired-ditl-frame" id="dframe"></div>
    <p class="hired-ditl-cap" id="dcap"></p><div class="hired-ditl-bar" id="dbar">${DITL_CAPS.map(()=>'<i></i>').join('')}</div>
    <div class="hired-row"><button class="mini-btn" id="dskip">Skip</button><button class="btn small" id="dnext">Next</button></div></div>`);
  const show=()=>{clearTimeout(timer);if(!$('#dframe'))return;if(i>=DITL_CAPS.length)return askPart();
    $('#dframe').innerHTML=panel();const cap=DITL_CAPS[i];const m=cap.match(/^([\d:]+ [AP]M)\. (.*)$/);$('#dcap').innerHTML=m?`<b>${m[1]}</b> ${esc(m[2])}`:esc(cap);
    $$('#dbar i').forEach((x,k)=>{x.className=k<i?'done':k===i?'on':'';x.style.setProperty('--dur',DUR+'ms')});
    playLine('byte',cap);timer=setTimeout(()=>{i++;show()},DUR)};
  $('#dnext').onclick=()=>{i++;show()};$('#dskip').onclick=()=>{i=DITL_CAPS.length;show()};show();
  function askPart(){stopVoice();const H=hiredState();
    $('.hired-ditl').outerHTML=`<div class="hired-card"><h2>Ask ${esc(S.byte.name)}</h2>
      <div class="hired-qs">${HJ_QS.map((x,k)=>`<button class="hired-q ${H.asked.includes(k)?'asked':''}" data-q="${k}">${esc(x.q)}</button>`).join('')}</div>
      <div class="byte-note hired-ans" id="ans">${byteBox({...S.byte,mood:'happy'})}<p>Ask me anything about the job!</p></div>
      <div class="hired-row"><button class="mini-btn" id="own">Ask my own question</button><button class="mini-btn" id="again">Watch again</button></div>
      <button class="btn wide" id="go" ${H.asked.length>=2?'':'disabled'}>Go to the open house</button></div>`;
    $$('.hired-q').forEach(b=>b.onclick=()=>{const k=+b.dataset.q;b.classList.add('asked');if(!H.asked.includes(k))H.asked.push(k);save();
      $('#ans').innerHTML=`${byteBox({...S.byte,mood:'happy'})}<p>${rich(HJ_QS[k].a)}</p>`;playLine('byte',HJ_QS[k].a);
      if(H.asked.length>=2)$('#go').disabled=false;if(H.asked.length>=3&&unlock('good-questions'))toast('New Field Guide idea: Asking good questions','good')});
    $('#own').onclick=openChat;$('#again').onclick=()=>hiredExplore(true);$('#go').onclick=()=>nextStep()}}

// ---------- 2. Meet people at the open house ----------
const HJ_PEOPLE=['gabi','kofi','ruth'];
const HJ_AGAIN={gabi:()=>'Thanks again for stopping by! I’ll tell Bandage you said hi.',kofi:()=>'Jupiter says beep. That means thank you.',
  ruth:H=>H.favor.ruth?'My glasses! I can read the menu again. Thank you, dear.':'Have you seen my glasses anywhere? They have red frames.'};
function hiredOpenHouse(){const H=hiredState();const all=HJ_PEOPLE.every(k=>H.met[k]);
  const st=k=>`<div class="hired-oh-st">${H.met[k]?'<span class="on" title="Met">✓</span>':''}${S.notes[{gabi:'gabi-cat',kofi:'kofi-planets',ruth:'ruth-song'}[k]]?'<span class="on" title="In your notebook">✎</span>':''}${H.favor[k]?'<span class="on" title="Helped">♥</span>':''}</div>`;
  const line=all?(hiredFavors().length?'Everyone’s talking about how helpful you were. Let’s find Dr. Reyes!':'You met everyone! Let’s find Dr. Reyes.'):H.lost&&!H.favor.ruth?'Ruth’s glasses have red frames. Can you spot them?':'Say hi to everyone. Try to remember one thing about each person.';
  screen('openhouse',`${scene(HJ_OH())}${hud('Open House · Boston Harbor Hospital')}<div class="hired-oh-wrap">
    <div class="hired-oh-people">${HJ_PEOPLE.map(k=>{const c=CAST[k];return `<button class="hired-oh-card ${H.met[k]?'':'new'}" data-p="${k}" aria-label="Talk to ${esc(c.name)}">${st(k)}<svg class="portrait" viewBox="62 20 176 176" preserveAspectRatio="xMidYMid slice">${personSVG({...c,mood:H.favor[k]?'happy':'smile'})}</svg><b>${esc(c.name.split(' ')[0])}</b><small>${esc(c.role.replace(/, age \d+/,''))}</small></button>`}).join('')}</div>
    <div class="hired-oh-foot"><div class="hired-card">${byteBox({...S.byte,mood:all?'happy':'neutral'})}<p>${esc(line)}</p></div>
    ${all?'<button class="btn wide" id="go">Find Dr. Reyes</button>':''}</div></div>
    ${H.lost&&!H.favor.ruth?`<button class="hired-glasses" id="glasses" style="left:${HJ_GLASSES[0]}%;top:${HJ_GLASSES[1]}%" aria-label="Red reading glasses"><svg viewBox="0 0 54 30"><circle cx="13" cy="16" r="10" fill="rgba(200,230,255,.55)" stroke="#e5484d" stroke-width="3.5"/><circle cx="41" cy="16" r="10" fill="rgba(200,230,255,.55)" stroke="#e5484d" stroke-width="3.5"/><path d="M23 14 q4 -4 8 0" stroke="#e5484d" stroke-width="3" fill="none"/><path d="M3 12 L0 6 M51 12 L54 6" stroke="#e5484d" stroke-width="3" stroke-linecap="round"/><path d="M8 11 l4 -2" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg></button>`:''}`);
  $$('.hired-oh-card').forEach(b=>b.onclick=()=>{const k=b.dataset.p;
    if(H.met[k]){const again=HJ_AGAIN[k](H);
      byteNote(CAST[k].name.split(' ')[0]+': “'+again+'”');playLine(k,again);return}
    talk(k,HJ_OH(),'Open House · Boston Harbor Hospital',()=>{H.met[k]=1;if(k==='ruth')H.lost=true;save();render()})});
  const g=$('#glasses');if(g)g.onclick=()=>{H.favor.ruth=true;heart('ruth');save();g.remove();toast('You found Ruth’s glasses!','good');setTimeout(render,700)};
  const go=$('#go');if(go)go.onclick=()=>{if(hiredFavors().length&&unlock('referrals'))toast('New Field Guide idea: Trust and referrals','good');nextStep()};
  function byteNote(t){const p=$('.hired-oh-foot p');if(p)p.textContent=t}}
const HJ_GLASSES=[70,34];

// ---------- 3. Portfolio Book: save the practice case ----------
function hjPage(){const H=hiredState();return H.page||null}
function hjSnapshot(){const H=hiredState();const r=S.result||{};
  H.page={choice:{...S.choice},plan:M().planName?M().planName(S.choice):'',memo:S.memo||'',conf:S.conf??2,kind:r.kind||'',cap:r.cap||'',stars:S.lastStars||0,told:!!S.told,t:Date.now()};
  S.history=S.history||[];
  // the grown-ups' page (parent.js) records each debrief in S.history; without it, add the same kind of record here
  let e=S.history.slice().reverse().find(x=>x.mission==='hired'&&x.memo===H.page.memo);
  if(!e){e={id:Date.now(),t:Date.now(),mission:'hired',title:MISSIONS.hired.title,day:0,plan:H.page.plan,stars:H.page.stars,luck:null,good:r.flags?S.criteria.filter(x=>x!=='agree').every(id=>(r.flags[id]??1)>0):null,conf:[50,62,75,87,97][H.page.conf],fc:null,checks:null,memo:H.page.memo};S.history.push(e)}
  e.out=H.page.cap;save();return H.page}
const HJ_SURE=['A coin flip','A little sure','Pretty sure','Very sure','Sure'];
function pageTitle(x){return x.mission==='hired'?'Ari’s ankle · practice case':x.mission==='maya'?'Maya’s wrist':(MISSIONS[x.mission]&&MISSIONS[x.mission].title)||x.title||'A decision'}
function pageHTML(x,stamp){const sure=x.conf!=null?(typeof x.conf==='number'&&x.conf>4?HJ_SURE[[50,62,75,87,97].indexOf(x.conf)]||x.conf+'%':HJ_SURE[x.conf]):'';
  return `<article class="hired-pbook">${stamp?'<div class="hired-pb-stamp">Saved</div>':''}<h3>${esc(pageTitle(x))}</h3><div class="hired-pb-plan">${esc(x.plan||'')}</div>
    ${x.memo?`<blockquote>${esc(x.memo)}</blockquote>`:''}<dl>${sure?`<dt>How sure</dt><dd>${esc(sure)}</dd>`:''}${x.out||x.cap?`<dt>What happened</dt><dd>${esc(x.out||x.cap)}</dd>`:''}<dt>Decision</dt><dd class="hired-pb-stars">${'★'.repeat(x.stars||0)}${'☆'.repeat(3-(x.stars||0))}</dd></dl></article>`}
function hiredPortfolio(){const pg=hjPage()&&hjPage().memo===S.memo?hjPage():null;const page=pg||{plan:M().planName(S.choice),memo:S.memo,conf:S.conf??2,cap:(S.result||{}).cap||'',stars:S.lastStars||0,mission:'hired'};
  screen('debrief',`${scene('night')}<div class="talk-dim"></div>${hud('Home · Boston · 8:30 PM')}<div class="hired-card"><h2>Portfolio Book</h2>
    <div id="pbslot">${pageHTML({...page,mission:'hired'},!!pg)}</div>
    <div class="byte-note">${byteBox({...S.byte,mood:'happy'})}<p>${pg?'Saved! Tomorrow, Dr. Reyes will want to hear about it.':'This is real work you did. Want to save it?'}</p></div>
    ${pg?'<button class="btn wide" id="next">Get ready for the interview</button>':'<button class="btn wide" id="save">Save to my Portfolio Book</button>'}</div>`);
  const sv=$('#save');if(sv)sv.onclick=()=>{hjSnapshot();toast('Saved to your Portfolio Book','good');hiredPortfolio()};
  const nx=$('#next');if(nx)nx.onclick=()=>nextStep()}
function openPortfolio(){const H=(S.history||[]).filter(x=>x.memo&&x.memo.trim()).slice().sort((a,b)=>a.t-b.t);
  const pages=H.length?H:(S.m_hired&&S.m_hired.page?[{...S.m_hired.page,mission:'hired'}]:[]);
  sheet('Portfolio Book',pages.length?pages.map(x=>pageHTML(x)).join(''):'<p class="muted">Your signed decisions will be saved here.</p>')}

// ---------- a small conversation stage (talk() look) with async steps, for the interview and the first day ----------
function hjStage(sceneKey,place){screen('talk',`${scene(sceneKey)}<div class="talk-dim"></div>${hud(place)}<div class="stage" id="stage"></div>
   <div class="subtitle" id="sub"><div class="who" id="who"></div><p id="line"></p><div class="choices" id="choices"></div><div class="tap-hint" id="hint" hidden>Tap to continue</div></div>`);
  const sub=$('#sub'),stage=$('#stage'),who=$('#who'),line=$('#line'),choices=$('#choices'),hint=$('#hint');let onTap=null;
  sub.onclick=e=>{if(e.target.closest('.gw,.choice,textarea,button,.mic'))return;if(onTap)onTap()};
  const alive=()=>sub.isConnected;
  return {
    say(w,mood,text){return new Promise(res=>{if(!alive())return;stage.innerHTML=speakerArt(w,mood||'smile');const sp=stage.firstElementChild;sp.classList.add('enter','talking');
      const nm=w==='byte'?S.byte.name:CAST[w].name,rl=w==='byte'?'Your AI partner':CAST[w].role;who.innerHTML=`<b>${esc(nm)}</b><span>${esc(rl)}</span>`;
      line.innerHTML=rich(text);line.classList.remove('fadein');void line.offsetWidth;line.classList.add('fadein');choices.innerHTML='';hint.hidden=true;
      let fin=false;const t0=Date.now(),minT=Math.min(2400,400+text.length*18);const done=()=>{if(fin)return;fin=true;onTap=null;sp.classList.remove('talking');res()};
      onTap=()=>{stopVoice();done()};playLine(w,text).then(()=>setTimeout(done,Math.max(0,minT-(Date.now()-t0))))})},
    tap(){return new Promise(res=>{if(!alive())return;hint.hidden=false;onTap=()=>{onTap=null;hint.hidden=true;stopVoice();res()}})},
    choose(opts,free){return new Promise(res=>{if(!alive())return;onTap=null;hint.hidden=true;
      choices.innerHTML=opts.map((o,j)=>`<button class="choice" data-j="${j}">${esc(fill(o))}</button>`).join('')+(free?`<button class="choice ghost" id="hjown">Say it my way</button>`:'');
      $$('.choice[data-j]',choices).forEach(b=>b.onclick=e=>{e.stopPropagation();res({j:+b.dataset.j,text:fill(opts[+b.dataset.j])})});
      const own=$('#hjown',choices);if(own)own.onclick=e=>{e.stopPropagation();
        choices.innerHTML=`<div class="hired-free"><textarea id="hjtxt" rows="3" maxlength="400" placeholder="Type your answer"></textarea>${micButton('hjtxt')}</div><div class="hired-row"><button class="mini-btn" id="hjback">Back</button><button class="btn small" id="hjsend">Answer</button></div>`;
        wireMics();const ta=$('#hjtxt');ta.focus();$('#hjback').onclick=ev=>{ev.stopPropagation();res(null)};
        $('#hjsend').onclick=ev=>{ev.stopPropagation();const t=ta.value.trim();if(t.length<8){toast('Write a little more first.');return}res({j:-1,text:t})}}})},
    alive};
}

const HJ_LINES={ivAsk:'Today’s your [[interview]] with Dr. Reyes! Want to [[rehearse]] with me first?',ivReady:'You’re ready! Remember: real stories, honest answers, and one good question.',hiredBest:'That was a wonderful interview: real stories, honest answers, and a great question. Welcome to Boston Harbor Hospital. You’re hired!',hiredOk:'I can tell you care about people, and that matters most. You’re hired! Keep telling real stories, like the ones in your Portfolio Book.',ruthThanks:'Thank you again for finding my glasses, dear. I can read the sheet music now!',rule:'At Harbor we have one [[house rule]]: ask early, ask anyone. If you’re stuck, or something feels off, say so, even to me.',ping:'Ping! Halo says your first patient is in Room 4B tomorrow at nine. Um... where is Room 4B?',wander:'That could take a while... Remember the house rule? Let’s ask Gabi.',room:'Third floor, past the fish tank. Thanks for asking! That’s exactly what the house rule is for.'};
// ---------- 4. The interview, with an optional rehearsal ----------
function hjStory(){const p=hjPage();if(!p||!p.choice||!p.choice.prot)return {good:'At the open house I helped a boy with a sprained ankle decide between playing and resting. I explained the odds to him and his grandma.',kind:''};
  const c=p.choice,play=c.sat==='play'&&c.prot!=='boot';const what=c.prot==='boot'?'a walking boot':c.prot==='brace'?'a brace':'tape';
  const why=p.told?'because his grandma told me he hides pain':play?'because Saturday mattered a lot to him':'because the playoffs mattered more than a friendly game';
  const out={saturday:'He played, and his ankle was fine.',reroll:'He rolled it again, so next time I’d ask more about his pain.',cheer:'He cheered from the bench and was ready for the playoffs.',boot:'He healed in the boot and was ready for the playoffs.'}[p.kind]||'';
  return {good:`At the open house I helped Ari, a goalkeeper with a sprained ankle. I chose ${what}${c.prot==='boot'?'':play?' and playing on Saturday':' and sitting out on Saturday'}, ${why}. ${out}`.trim(),kind:p.kind}}
function hjQuestions(ctx){const S1=ctx?ctx.story:hjStory(),bad=ctx?ctx.bad:S1.kind==='reroll',told=ctx?ctx.told:(hjPage()||{}).told;
  return [
    {q:'Tell me about a hard choice you made.',rq:'Dr. Reyes might ask: “Tell me about a hard choice you made.”',
     opts:[S1.good,'I make hard choices all the time, and I’m really good at them.',bad?'I helped a boy with a sprained ankle, and everything went perfectly.':'I helped a boy with his ankle, and it went great because I’m a natural.'],good:[1,0,0],
     reply:[`That’s a real story: what you chose, why, and what happened.${bad?' And thank you for being honest that it didn’t go well. That takes courage.':''}`,'Hmm. Can you give me a real example? A story tells me more than “I’m good at it.”',bad?'Your Portfolio Book says his ankle rolled again. I’d rather hear the honest version. Mistakes are how we learn.':'It did go well! But tell me why you chose it. Reasons matter more than luck.'],
     tip:['Great answer! You said what you chose, why, and what happened. Say it just like that.','Try a real example instead, like Ari’s ankle. Details make a story believable.',bad?'Hmm, that’s not quite what happened. Honest stories, even about mistakes, impress people more.':'Add your reason! Say why you chose it, not only that it worked.'],
     check:'a specific real story with what they chose and why, told honestly',heur:/\d|because|so that|ari|grandma|ankle|i chose|i picked|i decided|i helped/},
    {q:'What would you do if your AI and a patient disagreed?',rq:'She might ask: “What would you do if your AI and a patient disagreed?”',
     opts:['I’d ask each of them why. The AI might know facts the patient doesn’t, and the patient might know something the AI doesn’t. Then I’d explain the tradeoffs, and the patient decides.','I’d do whatever the AI says. It’s smarter than everyone.','I’d do whatever the patient wants, even if it’s dangerous.'],good:[1,0,0],
     reply:[told?'Exactly. Like Ari’s grandma knowing he hides pain. Both kinds of knowing matter.':'Exactly. Both kinds of knowing matter.','Our AIs are brilliant, but they only know what they’re told. And it’s the patient’s body.','Listening matters, but so do the facts. Your job is to help them see both.'],
     tip:[told?'Perfect. You could even add an example, like Ari’s grandma telling you he hides pain!':'Perfect. If you have an example, add it!','Careful! I’m smart, but I don’t know everything people know. Say how you’d listen to both.','Patients decide, but they need the facts first. Say how you’d explain the tradeoffs.'],
     check:'listens to both the AI and the patient, explains tradeoffs, and lets the patient decide',heur:/listen|ask|both|explain|why|tradeoff|decide/},
    {q:'What’s something you still need to learn?',rq:'And maybe: “What’s something you still need to learn?”',
     opts:['I’m still learning to explain odds so kids understand them. I practiced with Ari, and I want to get better.','Nothing. I’m already great at everything.','Um, I don’t know.'],good:[1,0,0],
     reply:['That’s honest and specific. It’s a great thing to work on, and we’ll help you.','Everyone has something to learn, even me. Knowing yours is a strength.','That’s okay. Think about it, though. Knowing what you don’t know is a strength.'],
     tip:['Honest and specific. That’s what managers love to hear!','Nobody is great at everything, and Dr. Reyes knows that. Name one real thing you’re working on.','It’s okay to pause and think. Try naming one real thing, like explaining odds.'],
     check:'honestly names one real thing they are still learning',heur:/learn|practic|better|still|not good|hard for me|working on|need to/},
    {q:'Do you have a question for me?',rq:'At the end she’ll ask: “Do you have a question for me?”',
     opts:['What’s the hardest part of your job?','What does a great new doctor do in the first month?','No, I’m good.'],good:[1,1,0],
     reply:['Telling a family that every choice has a downside. It never gets easy, but it gets clearer.','Asks lots of questions. The best new doctors ask for help early.','Okay! Next time, try asking one. It shows you’re curious.'],
     tip:['Great question! It shows you really want to understand the job.','Great question! It shows you want to do well.','Try asking one! A good question shows you’re curious.']}]}
async function hjGradeFree(Q,text){const bragging=/best at everything|great at everything|perfect|never wrong|always right|i'?m the best|natural/i.test(text);
  let good=!bragging&&text.length>=30&&Q.heur.test(text.toLowerCase());let reply=null;
  const sm=await getSample().catch(()=>null);
  if(sm&&!(window.PARENT&&PARENT.chatOn&&!PARENT.chatOn())){try{const r=await sm.json(`You are Dr. Imani Reyes, Chief of Care at Boston Harbor Hospital in a kids' game set in 2040, interviewing an 8-year-old player for a Care Doctor job. You asked: "${Q.q}". The player answered: """${text.slice(0,400)}""". A strong answer: ${Q.check}. Judge generously by meaning. Return JSON {"good":bool,"reply":"1 or 2 short, kind sentences as Dr. Reyes reacting to the answer; if it is not strong, gently say what would make it stronger (a specific example, honesty). No markdown."}`,{modelTier:'quick',cache:false});
      if(r&&typeof r==='object'){good=!!r.good;reply=r.reply||null}}catch(e){}}
  return {good,reply:reply||HJ_FREE.reply[good?0:1],tip:HJ_FREE.tip[good?0:1]}}
const HJ_FREE={reply:['Thank you. That’s a thoughtful answer.','Can you tell me a bit more? A specific example helps me understand.'],tip:['Nice! That answer was clear and real.','Try adding a real example, with what you did and why.']};
function hiredInterview(){const H=hiredState();if(H.hired)return hjHiredCard();
  const C=hjStage('home','Home · Boston · 8:00 AM');
  (async()=>{await C.say('byte','happy',HJ_LINES.ivAsk);
    const r=await C.choose(['Yes, let’s practice!','I’m ready. Let’s go!']);if(!r)return;
    if(r.j===0){H.rehearsed=true;save();
      for(const Q of hjQuestions()){await C.say('byte','think',Q.rq);let a=null;while(!a){a=await C.choose(Q.opts,Q.check);if(a===null&&!C.alive())return}
        let tip;if(a.j<0){tip=(await hjGradeFree(Q,a.text)).tip}else tip=Q.tip[a.j];await C.say('byte',a.j>=0&&Q.good[a.j]?'happy':'think',tip);await C.tap()}
      await C.say('byte','happy',HJ_LINES.ivReady);await C.tap()}
    hjRealInterview()})()}
function hjRealInterview(){const H=hiredState();const C=hjStage('hospital','Dr. Reyes’s office · Boston Harbor Hospital');
  (async()=>{await C.say('imani','smile',`Thanks for coming in, {P}. I read your [[portfolio]]. Let’s talk.`);await C.tap();let score=0;
    for(const Q of hjQuestions()){await C.say('imani','neutral',Q.q);let a=null;while(!a){a=await C.choose(Q.opts,Q.check);if(a===null&&!C.alive())return}
      let good,reply;if(a.j<0){const g=await hjGradeFree(Q,a.text);good=g.good;reply=g.reply}else{good=!!Q.good[a.j];reply=Q.reply[a.j]}
      if(good)score++;await C.say('imani',good?'happy':'think',reply);await C.tap()}
    H.ivScore=score;H.hired=true;heart('imani');save();
    await C.say('imani','happy',score>=3?HJ_LINES.hiredBest:HJ_LINES.hiredOk);
    hjConfetti();if(unlock('specific-stories'))toast('New Field Guide idea: Show your work','good');await C.tap();hjHiredCard()})()}
function hjBadge(){return `<div class="hired-badge-card"><div class="hired-badge-top"><svg viewBox="0 0 24 24"><path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 14.4 7.2 17l.9-5.4L4.2 7.7l5.4-.8z" fill="#fff"/></svg>Boston Harbor Hospital</div>
  <div class="hired-badge-body">${byteBox({...S.byte,mood:'happy'})}<div><b>${esc(P())}</b><span>Care Doctor</span><div class="hired-badge-rank">Trainee</div></div></div><div class="hired-badge-bars"></div></div>`}
function hjHiredCard(){const H=hiredState();const sc=H.ivScore??0;
  screen('debrief',`${scene('hospital')}<div class="talk-dim"></div>${hud('Hired!')}<div class="hired-card hired-center"><h2>You’re hired!</h2>${hjBadge()}
    <div class="byte-note">${byteBox({...S.byte,mood:'happy'})}<p>${sc>=3?'You nailed it! ':''}Your first day is tomorrow. You’ll meet the team.</p></div>
    <button class="btn wide" id="next">Start my first day</button></div>`);
  $('#next').onclick=()=>nextStep()}

// ---------- 5. First day: meet the team, remember them, learn the house rule ----------
const HJ_REMEMBER={
  gabi:{ask:'Welcome back! We met at the open house. Do you remember my cat’s name?',opts:['Bandage','Whiskers','Stethoscope'],right:'Bandage! You remembered. Welcome to the kids’ floor.',wrong:'It’s Bandage, because he sleeps on the first-aid box! Welcome to the team.'},
  kofi:{ask:'Hey, it’s you! Quick quiz: what do I name my robots after?',opts:['Planets','Dinosaurs','Ice cream flavors'],right:'Planets! Jupiter says hi. Beep boop.',wrong:'Planets! That big one is Jupiter, remember? Welcome aboard.'},
  ruth:{ask:'Hello again, dear. What song do I play on the piano on Fridays?',opts:['Fly Me to the Moon','Happy Birthday','Twinkle, Twinkle, Little Star'],right:'Yes! Come and listen this Friday.',wrong:'It’s “Fly Me to the Moon.” Come and listen this Friday!'}};
function hiredFirstDay(){const H=hiredState();if(H.badge)return hjFirstDayEnd();
  const C=hjStage('hospital','Kids’ floor · Boston Harbor Hospital · 8:30 AM');
  (async()=>{await C.say('imani','happy','Welcome to your first day, Doctor {P}! You start as a [[trainee]]. Let me introduce the team.');await C.tap();let remembered=0;
    for(const k of HJ_PEOPLE){const R=HJ_REMEMBER[k];if(k==='ruth'&&H.favor.ruth){await C.say('ruth','happy',HJ_LINES.ruthThanks);await C.tap()}
      await C.say(k,'smile',R.ask);const rot=(HJ_PEOPLE.indexOf(k)+1)%3;const order=[0,1,2].map(i=>(i+rot)%3);
      const a=await C.choose(order.map(i=>R.opts[i]));if(!a)return;const ok=order[a.j]===0;if(ok){remembered++;heart(k)}
      await C.say(k,ok?'happy':'smile',ok?R.right:R.wrong);await C.tap()}
    H.remembered=remembered;save();
    await C.say('imani','smile',HJ_LINES.rule);await C.tap();
    await C.say('byte','alert',HJ_LINES.ping);
    const w=await C.choose(['Ask Gabi where Room 4B is','Wander around until I find it']);if(!w)return;
    if(w.j===1){await C.say('byte','think',HJ_LINES.wander);await C.tap()}else heart('gabi');
    await C.say('gabi','happy',HJ_LINES.room);await C.tap();
    H.badge=true;save();hjFirstDayEnd()})()}
function hjFirstDayEnd(){const H=hiredState();
  screen('evening',`${scene('night')}${hud('Home · Boston · 9:00 PM')}<div class="evening"><div class="eve-byte">${byteBox({...S.byte,mood:'happy'},'big perk')}</div>
   <div class="caption-card dark"><p><b>${esc(S.byte.name)}:</b> “You remembered ${H.remembered??0} of 3 teammates, and you learned the house rule. Tomorrow is your first shift with a real patient. Get some sleep, Doctor!”</p>
   <div class="row"><button class="btn small ghost" id="pb">Portfolio Book</button><button class="btn small" id="go">Start Day 1</button></div></div></div>`);
  $('#pb').onclick=openPortfolio;
  $('#go').onclick=()=>{S.completed.hired={stars:Math.max(S.lastStars||0,(S.completed.hired||{}).stars||0)};save();if(MISSIONS.maya)startMission('maya');else go('hub')}}

// every fixed line spoken with playLine on these screens, so tools/make_audio.py can record them (lines with {P} stay unrecorded)
function hiredLines(){const L=[],add=(who,t)=>{if(t)L.push({who,text:t})};
  DITL_CAPS.forEach(t=>add('byte',t));HJ_QS.forEach(x=>add('byte',x.a));
  add('gabi',HJ_AGAIN.gabi());add('kofi',HJ_AGAIN.kofi());add('ruth',HJ_AGAIN.ruth({favor:{ruth:1}}));add('ruth',HJ_AGAIN.ruth({favor:{}}));
  for(const bad of [false,true])for(const told of [false,true])hjQuestions({story:{good:''},bad,told}).forEach(Q=>{add('imani',Q.q);add('byte',Q.rq);Q.reply.forEach(t=>add('imani',t));Q.tip.forEach(t=>add('byte',t))});
  HJ_FREE.reply.forEach(t=>add('imani',t));HJ_FREE.tip.forEach(t=>add('byte',t));
  for(const k in HJ_REMEMBER){const R=HJ_REMEMBER[k];add(k,R.ask);add(k,R.right);add(k,R.wrong)}
  const who={ivAsk:'byte',ivReady:'byte',hiredBest:'imani',hiredOk:'imani',ruthThanks:'ruth',rule:'imani',ping:'byte',wander:'byte',room:'gabi'};for(const k in HJ_LINES)add(who[k],HJ_LINES[k]);
  const seen=new Set();return L.filter(x=>{const key=x.who+'|'+x.text;if(seen.has(key))return false;seen.add(key);return true})}
MISSIONS.hired.custom={'h-explore':hiredExplore,'h-openhouse':hiredOpenHouse,'h-portfolio':hiredPortfolio,'h-interview':hiredInterview,'h-firstday':hiredFirstDay};
