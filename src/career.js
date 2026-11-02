// career.js — career journeys as data (spec: Core loop → Career journey), plus the big talk and the promotion moment.
// A career's journey is: explore, meet people, practice project, interview, first day, then the career's workdays,
// a big talk and a promotion. Steps 1 to 5 are one mission with kind:'journey' (see MISSIONS.hired), whose flow uses
// the step kinds registered here, and whose content lives in m.journey. Workdays are ordinary missions. The big talk
// and the promotion are one mission with kind:'bigtalk' (see MISSIONS.grandrounds) and content in m.bigtalk and
// m.promotion. Every spoken line in that content is a {who, text} object, so missionLines() can find it to record it.
//
// Flow step kinds added here (FLOW_KINDS, read by runFlow in game.js):
//   explore   a day in the life (panels + Byte's captions), then questions to Byte        m.journey.explore
//   meet      meet people at an event, remember one thing about each, do small favors     m.journey.meet
//   portfolio save the practice case to the Portfolio Book                                m.journey.portfolio
//   interview an optional rehearsal with Byte, then the interview with a human manager    m.journey.interview
//   firstday  meet the team again, learn the house rule, ask for help                     m.journey.firstday
//   talkprep  build a three-part talk about one of your cases with Byte                   m.bigtalk
//   bigtalk   give the talk to a crowd and answer one tough question                      m.bigtalk
//   promotion a short, joyful rank-up                                                     m.promotion
// A journey mission also lists stages:[{key, at}] (key from JOURNEY_STAGES, at = the flow step that starts it), so the
// place planner can show the journey track and resume it at the furthest stage. Journey state lives in S['m_'+id].

const JOURNEY_STAGES=[['explore','Explore'],['meet','Meet people'],['practice','Practice'],['interview','Interview'],['firstday','First day'],['workdays','Workdays'],['bigtalk','Big talk'],['promotion','Promotion']];

// ---------- shared helpers ----------
function jState(m){m=m||M();const k='m_'+m.id;if(!S[k]||typeof S[k]!=='object')S[k]={};const H=S[k];H.asked=H.asked||[];H.met=H.met||{};H.favor=H.favor||{};return H}
// record a favor for the current journey (use as a talk choice's on() callback)
function jFavor(who){const H=jState();H.favor[who]=true;save()}
function jFavors(){const H=jState();return Object.keys(H.favor).filter(k=>H.favor[k])}
function jScene(k){const ks=[].concat(k||'hospital');return ks.find(x=>(window.PAINT&&PAINT[x])||(typeof SCENES!=='undefined'&&SCENES[x]))||ks[ks.length-1]}
// a line may be one {who,text} or a list of variants [{if:'flag', who, text}, ..., {who, text}]; pick by context flags
function jLine(v,ctx){if(!v)return null;if(Array.isArray(v))return v.find(x=>!x.if||(ctx&&ctx[x.if]))||v[v.length-1];return v}
function jText(t,ctx){return typeof t==='function'?t(ctx):t}
function cmConfetti(n=42){const d=document.createElement('div');d.className='cj-confetti';const cols=['#6c5ce7','#16b3a6','#f5b82e','#ff7a6b','#5b9bf0'];
  d.innerHTML=Array.from({length:n},(_,i)=>`<i style="left:${(i*37)%100}%;background:${cols[i%5]};animation-delay:${(i%9)*.09}s"></i>`).join('');document.body.appendChild(d);setTimeout(()=>d.remove(),3200)}

// ---------- 1. Explore: a day in the life, then questions to Byte ----------
function jExplore(keep){const m=M(),J=m.journey.explore;if(!keep){S['m_'+m.id]={asked:[],met:{},favor:{}};save()}const H=jState(m);let i=0,timer=0;const DUR=J.dur||6000,caps=J.caps;
  screen('explore',`${scene(jScene(J.scene))}${hud(J.place)}<div class="cj-card cj-ditl"><div class="cj-ditl-frame" id="dframe"></div>
    <p class="cj-ditl-cap" id="dcap"></p><div class="cj-ditl-bar" id="dbar">${caps.map(()=>'<i></i>').join('')}</div>
    <div class="cj-row"><button class="mini-btn" id="dskip">Skip</button><button class="btn small" id="dnext">Next</button></div></div>`);
  const show=()=>{clearTimeout(timer);if(!$('#dframe'))return;if(i>=caps.length)return askPart();
    $('#dframe').innerHTML=J.panel?J.panel(i):'';const cap=caps[i].text;const mm=cap.match(/^([\d:]+ [AP]M)\. (.*)$/);$('#dcap').innerHTML=mm?`<b>${mm[1]}</b> ${esc(mm[2])}`:esc(cap);
    $$('#dbar i').forEach((x,k)=>{x.className=k<i?'done':k===i?'on':'';x.style.setProperty('--dur',DUR+'ms')});
    playLine(caps[i].who,cap);timer=setTimeout(()=>{i++;show()},DUR)};
  $('#dnext').onclick=()=>{i++;show()};$('#dskip').onclick=()=>{i=caps.length;show()};show();
  function askPart(){stopVoice();const need=J.need||2;
    $('.cj-ditl').outerHTML=`<div class="cj-card"><h2>Ask ${esc(S.byte.name)}</h2>
      <div class="cj-qs">${J.qs.map((x,k)=>`<button class="cj-q ${H.asked.includes(k)?'asked':''}" data-q="${k}">${esc(x.q)}</button>`).join('')}</div>
      <div class="byte-note cj-ans" id="ans">${byteBox({...S.byte,mood:'happy'})}<p>${esc(J.prompt||'Ask me anything about the job!')}</p></div>
      <div class="cj-row"><button class="mini-btn" id="own">Ask my own question</button><button class="mini-btn" id="again">Watch again</button></div>
      <button class="btn wide" id="go" ${H.asked.length>=need?'':'disabled'}>${esc(J.go||'Next')}</button></div>`;
    $$('.cj-q').forEach(b=>b.onclick=()=>{const k=+b.dataset.q;b.classList.add('asked');if(!H.asked.includes(k))H.asked.push(k);save();const a=J.qs[k].a;
      $('#ans').innerHTML=`${byteBox({...S.byte,mood:'happy'})}<p>${rich(a.text)}</p>`;playLine(a.who,a.text);
      if(H.asked.length>=need)$('#go').disabled=false;if(J.guide&&H.asked.length>=need+1&&unlock(J.guide))toast('New Field Guide idea: '+FIELD_GUIDE[J.guide].title,'good')});
    $('#own').onclick=openChat;$('#again').onclick=()=>jExplore(true);$('#go').onclick=()=>nextStep()}}

// ---------- 2. Meet people at an event ----------
function jMeet(){const m=M(),J=m.journey.meet,H=jState(m),sc=jScene(J.scene),F=J.find;const all=J.people.every(k=>H.met[k]);
  const seeking=F&&H.met[F.who]&&!H.favor[F.who];
  const st=k=>`<div class="cj-oh-st">${H.met[k]?'<span class="on" title="Met">✓</span>':''}${J.notes&&S.notes[J.notes[k]]?'<span class="on" title="In your notebook">✎</span>':''}${H.favor[k]?'<span class="on" title="Helped">♥</span>':''}</div>`;
  const line=all?(jFavors().length?J.doneHelpful:J.done):seeking?F.hint:J.hint;
  screen('openhouse',`${scene(sc)}${hud(J.place)}<div class="cj-oh-wrap">
    <div class="cj-oh-people">${J.people.map(k=>{const c=CAST[k];return `<button class="cj-oh-card ${H.met[k]?'':'new'}" data-p="${k}" aria-label="Talk to ${esc(c.name)}">${st(k)}<svg class="portrait" viewBox="62 20 176 176" preserveAspectRatio="xMidYMid slice">${personSVG({...c,mood:H.favor[k]?'happy':'smile'})}</svg><b>${esc(c.name.split(' ')[0])}</b><small>${esc(c.role.replace(/, age \d+/,''))}</small></button>`}).join('')}</div>
    <div class="cj-oh-foot"><div class="cj-card">${byteBox({...S.byte,mood:all?'happy':'neutral'})}<p>${esc(line)}</p></div>
    ${all?`<button class="btn wide" id="go">${esc(J.go||'Next')}</button>`:''}</div></div>
    ${seeking?`<button class="cj-find" id="find" style="left:${F.at[0]}%;top:${F.at[1]}%" aria-label="${esc(F.label)}">${F.art}</button>`:''}`);
  $$('.cj-oh-card').forEach(b=>b.onclick=()=>{const k=b.dataset.p;
    if(H.met[k]){const L=(H.favor[k]&&J.thanks&&J.thanks[k])||J.again[k];const p=$('.cj-oh-foot p');if(p)p.textContent=CAST[k].name.split(' ')[0]+': “'+L.text+'”';playLine(L.who,L.text);return}
    talk(k,sc,J.place,()=>{H.met[k]=1;save();render()})});
  const f=$('#find');if(f)f.onclick=()=>{H.favor[F.who]=true;addHearts(F.who);save();f.remove();toast(F.toast,'good');setTimeout(render,700)};
  const go=$('#go');if(go)go.onclick=()=>{if(J.guide&&jFavors().length&&unlock(J.guide))toast('New Field Guide idea: '+FIELD_GUIDE[J.guide].title,'good');nextStep()}}

// ---------- 3. Portfolio Book: save the practice case ----------
const CJ_SURE=['A coin flip','A little sure','Pretty sure','Very sure','Sure'];
function jPage(m){return jState(m).page||null}
function jSnapshot(){const m=M(),H=jState(m),r=S.result||{};
  H.page={choice:{...S.choice},plan:m.planName?m.planName(S.choice):'',memo:S.memo||'',conf:S.conf??2,kind:r.kind||'',cap:r.cap||'',stars:S.lastStars||0,told:!!S.told,t:Date.now()};
  S.history=S.history||[];
  // the grown-ups' page (parent.js) records each debrief in S.history; without it, add the same kind of record here
  let e=S.history.slice().reverse().find(x=>x.mission===m.id&&x.memo===H.page.memo);
  if(!e){e={id:Date.now(),t:Date.now(),mission:m.id,title:m.title,day:m.day||0,plan:H.page.plan,stars:H.page.stars,luck:null,good:r.flags?S.criteria.filter(x=>x!=='agree').every(id=>(r.flags[id]??1)>0):null,conf:[50,62,75,87,97][H.page.conf],fc:null,checks:null,memo:H.page.memo};S.history.push(e)}
  e.out=H.page.cap;save();return H.page}
function pageTitle(x){const m=MISSIONS[x.mission];return (m&&(m.caseTitle||m.title))||x.title||'A decision'}
function pageHTML(x,stamp){const sure=x.conf!=null?(typeof x.conf==='number'&&x.conf>4?CJ_SURE[[50,62,75,87,97].indexOf(x.conf)]||x.conf+'%':CJ_SURE[x.conf]):'';
  return `<article class="cj-pbook">${stamp?'<div class="cj-pb-stamp">Saved</div>':''}<h3>${esc(pageTitle(x))}</h3><div class="cj-pb-plan">${esc(x.plan||'')}</div>
    ${x.memo?`<blockquote>${esc(x.memo)}</blockquote>`:''}<dl>${sure?`<dt>How sure</dt><dd>${esc(sure)}</dd>`:''}${x.out||x.cap?`<dt>What happened</dt><dd>${esc(x.out||x.cap)}</dd>`:''}<dt>Stars</dt><dd class="cj-pb-stars">${'★'.repeat(x.stars||0)}${'☆'.repeat(3-(x.stars||0))}</dd></dl></article>`}
function jPortfolio(){const m=M(),J=m.journey.portfolio;const pg=jPage(m)&&jPage(m).memo===S.memo?jPage(m):null;
  const page=pg||{plan:m.planName?m.planName(S.choice):'',memo:S.memo,conf:S.conf??2,cap:(S.result||{}).cap||'',stars:S.lastStars||0};
  screen('debrief',`${scene(jScene(J.scene||'night'))}<div class="talk-dim"></div>${hud(J.place)}<div class="cj-card"><h2>Portfolio Book</h2>
    <div id="pbslot">${pageHTML({...page,mission:m.id},!!pg)}</div>
    <div class="byte-note">${byteBox({...S.byte,mood:'happy'})}<p>${esc(pg?J.saved:J.ask)}</p></div>
    ${pg?`<button class="btn wide" id="next">${esc(J.go||'Next')}</button>`:'<button class="btn wide" id="save">Save to my Portfolio Book</button>'}</div>`);
  const sv=$('#save');if(sv)sv.onclick=()=>{jSnapshot();toast('Saved to your Portfolio Book','good');jPortfolio()};
  const nx=$('#next');if(nx)nx.onclick=()=>nextStep()}
function openPortfolio(){const H=(S.history||[]).filter(x=>x.memo&&x.memo.trim()).slice().sort((a,b)=>a.t-b.t);
  const pages=H.length?H:Object.values(MISSIONS).filter(m=>S['m_'+m.id]&&S['m_'+m.id].page).map(m=>({...S['m_'+m.id].page,mission:m.id}));
  sheet('Portfolio Book',pages.length?pages.map(x=>pageHTML(x)).join(''):'<p class="muted">Your signed decisions will be saved here.</p>')}

// ---------- a conversation stage (the talk() look) driven by async steps ----------
function jStage(sceneKey,place,extra){screen('talk',`${scene(sceneKey)}<div class="talk-dim"></div>${hud(place)}${extra||''}<div class="stage" id="stage"></div>
   <div class="subtitle" id="sub"><div class="who" id="who"></div><p id="line"></p><div class="choices" id="choices"></div><div class="tap-hint" id="hint" hidden>Tap to continue</div></div>`);
  const sub=$('#sub'),stage=$('#stage'),who=$('#who'),line=$('#line'),choices=$('#choices'),hint=$('#hint');let onTap=null;
  sub.onclick=e=>{if(e.target.closest('.gw,.choice,textarea,button,.mic'))return;if(onTap)onTap()};
  const alive=()=>sub.isConnected;
  return {
    say(w,mood,text){return new Promise(res=>{if(!alive())return;text=fill(text);stage.innerHTML=speakerArt(w,mood||'smile');const sp=stage.firstElementChild;sp.classList.add('enter','talking');
      const nm=w==='byte'?S.byte.name:CAST[w].name,rl=w==='byte'?'Your AI partner':CAST[w].role;who.innerHTML=`<b>${esc(nm)}</b><span>${esc(rl)}</span>`;
      line.innerHTML=rich(text);line.classList.remove('fadein');void line.offsetWidth;line.classList.add('fadein');choices.innerHTML='';hint.hidden=true;
      let fin=false;const t0=Date.now(),minT=Math.min(2400,400+text.length*18);const done=()=>{if(fin)return;fin=true;onTap=null;sp.classList.remove('talking');if(alive())res()};
      onTap=()=>{stopVoice();done()};playLine(w,text).then(()=>setTimeout(done,Math.max(0,minT-(Date.now()-t0))))})},
    // the player speaks: no voice, a "You" label, and the speaker art cleared or kept
    me(text,keep){return new Promise(res=>{if(!alive())return;if(!keep)stage.innerHTML='';who.innerHTML=`<b>${esc(P())}</b><span>You</span>`;line.innerHTML=esc(fill(text));
      line.classList.remove('fadein');void line.offsetWidth;line.classList.add('fadein');choices.innerHTML='';hint.hidden=false;onTap=()=>{onTap=null;hint.hidden=true;res()}})},
    tap(){return new Promise(res=>{if(!alive())return;hint.hidden=false;onTap=()=>{onTap=null;hint.hidden=true;stopVoice();res()}})},
    choose(opts,free){return new Promise(res=>{if(!alive())return;onTap=null;hint.hidden=true;
      choices.innerHTML=mixIdx(opts).map(([o,j])=>`<button class="choice" data-j="${j}">${esc(fill(o))}</button>`).join('')+(free?`<button class="choice ghost" id="cjown">Say it my way</button>`:'');
      $$('.choice[data-j]',choices).forEach(b=>b.onclick=e=>{e.stopPropagation();res({j:+b.dataset.j,text:fill(opts[+b.dataset.j])})});
      const own=$('#cjown',choices);if(own)own.onclick=e=>{e.stopPropagation();
        choices.innerHTML=`<div class="cj-free"><textarea id="cjtxt" rows="3" maxlength="400" placeholder="Type your answer"></textarea>${micButton('cjtxt')}</div><div class="cj-row"><button class="mini-btn" id="cjback">Back</button><button class="btn small" id="cjsend">Answer</button></div>`;
        wireMics();const ta=$('#cjtxt');ta.focus();$('#cjback').onclick=ev=>{ev.stopPropagation();res(null)};
        $('#cjsend').onclick=ev=>{ev.stopPropagation();const t=ta.value.trim();if(t.length<8){toast('Write a little more first.');return}res({j:-1,text:t})}}})},
    alive};
}
async function jAsk(C,opts,free){let a=null;while(!a){a=await C.choose(opts,free);if(a===null&&!C.alive())return null}return a}
// a typed answer: checked generously by meaning when the artifact's AI is available, otherwise by a simple pattern
async function jGradeFree(persona,Q,text){const bragging=/best at everything|great at everything|perfect|never wrong|always right|i'?m the best|natural/i.test(text);
  let good=!bragging&&text.length>=30&&(!Q.heur||Q.heur.test(text.toLowerCase()));let reply=null;
  const sm=await getSample().catch(()=>null);
  if(sm&&!(window.PARENT&&PARENT.chatOn&&!PARENT.chatOn())){try{const r=await sm.json(`${persona} You asked: "${Q.q.text}". The player answered: """${text.slice(0,400)}""". A strong answer: ${Q.check}. Judge generously by meaning. Return JSON {"good":bool,"reply":"1 or 2 short, kind sentences reacting to the answer; if it is not strong, gently say what would make it stronger. No markdown."}`,{modelTier:'quick',cache:false});
      if(r&&typeof r==='object'){good=!!r.good;reply=r.reply||null}}catch(e){}}
  return {good,reply}}

// ---------- 4. The interview, with an optional rehearsal ----------
function jInterview(){const m=M(),J=m.journey.interview,H=jState(m);if(H.hired)return jHiredCard();
  const C=jStage(jScene(J.home.scene),J.home.place);const ctx=J.context?J.context():{};
  (async()=>{await C.say(J.ask.who,'happy',J.ask.text);
    const r=await C.choose(['Yes, let’s practice!','I’m ready. Let’s go!']);if(!r)return;
    if(r.j===0){H.rehearsed=true;save();
      for(const Q of J.questions){await C.say(Q.rq.who,'think',Q.rq.text);const a=await jAsk(C,Q.opts.map(o=>jText(o.t,ctx)),!!Q.check);if(!a)return;
        let tip;if(a.j<0){tip=jLine(J.free.tip[(await jGradeFree(J.judge,Q,a.text)).good?0:1])}else tip=jLine(Q.opts[a.j].tip,ctx);
        await C.say(tip.who,a.j>=0&&Q.opts[a.j].good?'happy':'think',tip.text);await C.tap()}
      await C.say(J.ready.who,'happy',J.ready.text);await C.tap()}
    jRealInterview()})()}
function jRealInterview(){const m=M(),J=m.journey.interview,H=jState(m);const C=jStage(jScene(J.office.scene),J.office.place);const ctx=J.context?J.context():{};
  (async()=>{await C.say(J.intro.who,'smile',J.intro.text);await C.tap();let score=0;
    for(const Q of J.questions){await C.say(Q.q.who,'neutral',Q.q.text);const a=await jAsk(C,Q.opts.map(o=>jText(o.t,ctx)),!!Q.check);if(!a)return;
      let good,reply;if(a.j<0){const g=await jGradeFree(J.judge,Q,a.text);good=g.good;reply=g.reply||jLine(J.free.reply[good?0:1]).text}else{good=!!Q.opts[a.j].good;reply=jLine(Q.opts[a.j].reply,ctx).text}
      if(good)score++;await C.say(J.boss,good?'happy':'think',reply);await C.tap()}
    H.ivScore=score;H.hired=true;addHearts(J.boss);save();
    const end=score>=J.questions.length-1?J.best:J.ok;await C.say(end.who,'happy',end.text);
    cmConfetti();if(J.guide&&unlock(J.guide))toast('New Field Guide idea: '+FIELD_GUIDE[J.guide].title,'good');await C.tap();jHiredCard()})()}
function cjBadge(b,rank,flip){return `<div class="cj-badge-card ${flip?'flip':''}"><div class="cj-badge-top"><svg viewBox="0 0 24 24"><path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 14.4 7.2 17l.9-5.4L4.2 7.7l5.4-.8z" fill="#fff"/></svg>${esc(b.org)}</div>
  <div class="cj-badge-body">${byteBox({...S.byte,mood:'happy'})}<div><b>${esc(P())}</b><span>${esc(b.title)}</span><div class="cj-badge-rank r-${rank}">${rankStars(rank)}${RANK_NAME[rank]}</div></div></div><div class="cj-badge-bars"></div></div>`}
function rankStars(rank){const n=RANKS.indexOf(rank)+1;return `<i class="cj-rs">${'★'.repeat(Math.max(1,n))}</i>`}
function jHiredCard(){const m=M(),J=m.journey.interview,H=jState(m);const sc=H.ivScore??0;
  screen('debrief',`${scene(jScene(J.office.scene))}<div class="talk-dim"></div>${hud('Hired!')}<div class="cj-card cj-center"><h2>You’re hired!</h2>${cjBadge(J.badge,'trainee')}
    <div class="byte-note">${byteBox({...S.byte,mood:'happy'})}<p>${sc>=J.questions.length?'You nailed it! ':''}${esc(J.after)}</p></div>
    <button class="btn wide" id="next">${esc(J.go||'Next')}</button></div>`);
  $('#next').onclick=()=>nextStep()}

// ---------- 5. First day: meet the team again, remember them, learn the house rule ----------
function jFirstDay(){const m=M(),J=m.journey.firstday,H=jState(m);if(H.badge)return jFirstDayEnd();
  const C=jStage(jScene(J.scene),J.place);
  (async()=>{await C.say(J.intro.who,'happy',J.intro.text);await C.tap();let remembered=0;
    for(const R of J.team){const k=R.ask.who;if(H.favor[k]&&J.thanks&&J.thanks[k]){await C.say(k,'happy',J.thanks[k].text);await C.tap()}
      await C.say(k,'smile',R.ask.text);const rot=(J.team.indexOf(R)+1)%R.opts.length;const order=R.opts.map((_,i)=>(i+rot)%R.opts.length);
      const a=await C.choose(order.map(i=>R.opts[i]));if(!a)return;const ok=order[a.j]===0;if(ok){remembered++;addHearts(k)}
      const L=ok?R.right:R.wrong;await C.say(L.who,ok?'happy':'smile',L.text);await C.tap()}
    H.remembered=remembered;save();
    await C.say(J.rule.who,'smile',J.rule.text);await C.tap();
    const T=J.test;await C.say(T.prompt.who,'alert',T.prompt.text);
    const w=await C.choose(T.opts.map(o=>o.t));if(!w)return;const o=T.opts[w.j];
    if(o.then){await C.say(o.then.who,'think',o.then.text);await C.tap()}if(o.heart)addHearts(o.heart);
    await C.say(T.after.who,'happy',T.after.text);await C.tap();
    H.badge=true;save();jFirstDayEnd()})()}
function jFirstDayEnd(){const m=M(),J=m.journey.firstday,H=jState(m);
  screen('evening',`${scene(jScene(J.end.scene||'night'))}${hud(J.end.place)}<div class="evening"><div class="eve-byte">${byteBox({...S.byte,mood:'happy'},'big perk')}</div>
   <div class="caption-card dark"><p><b>${esc(S.byte.name)}:</b> “${esc(J.end.text(H))}”</p>
   <div class="row"><button class="btn small ghost" id="pb">Portfolio Book</button><button class="btn small" id="plan">${esc(J.go||'Open my world map')}</button></div></div></div>`);
  $('#pb').onclick=openPortfolio;
  $('#plan').onclick=()=>{S.completed[m.id]=S.completed[m.id]||{stars:S.lastStars||0};save();go('hub')}}

// ---------- the big talk: build it with Byte, then give it ----------
// m.bigtalk: {prep:{scene,place,intro,pick}, beats:[{key,ask,opts:[{t(caseCtx), good, tip}]}], stage:{scene,place,intro},
//   question:{q, opts:[{t, good, reply}], check, heur, judge}, applause, cases:{missionId:{title, who, story, clue, lesson, thanks}}, fallback}
function btState(m){const H=jState(m);H.picks=H.picks||[];return H}
// the cases the player can present: their signed decisions in this career, newest first, else a default
function btCases(m){m=m||M();const B=m.bigtalk,seen=new Set(),out=[];
  (S.history||[]).slice().reverse().forEach(x=>{const xm=MISSIONS[x.mission];if(!xm||xm.career!==m.career||seen.has(x.mission))return;seen.add(x.mission);out.push(x)});
  Object.values(MISSIONS).forEach(xm=>{const pg=S['m_'+xm.id]&&S['m_'+xm.id].page;if(xm.career===m.career&&pg&&!seen.has(xm.id)){seen.add(xm.id);out.push({...pg,mission:xm.id})}});
  if(!out.length){const id=Object.keys(B.cases)[0];out.push({mission:id,plan:'',memo:''})}
  return out.map(x=>{const c=B.cases[x.mission]||{...B.fallback,title:pageTitle(x),story:(MISSIONS[x.mission]||{}).blurb||B.fallback.story};return {...c,entry:x,id:x.mission}})}
function btCase(m){const H=btState(m);const cs=btCases(m);return cs.find(c=>c.id===H.case)||cs[0]}
function btCtx(c){const e=c.entry||{};const memo=String(e.memo||'').trim();return {...c,plan:e.plan||'',memo:memo.length>170?memo.slice(0,167).replace(/\s+\S*$/,'')+'…':memo,byte:S.byte.name}}
function btSlides(m,H,c){const B=m.bigtalk;return `<div class="bt-deck">${B.beats.map((b,i)=>{const p=H.picks[i];return `<div class="bt-slide ${p==null?'':'on'} ${p!=null&&b.opts[p].good?'good':''}">${btSlideArt(b.key,c,p!=null)}<span>${esc(b.label)}</span></div>`}).join('')}</div>`}
function btSlideArt(key,c,on){const who=c&&c.who&&CAST[c.who];
  if(key==='story')return on&&who?`<svg viewBox="62 20 176 176" class="bt-face">${personSVG({...who,mood:'smile'})}</svg>`:'<svg viewBox="0 0 40 40"><circle cx="20" cy="15" r="7" fill="currentColor" opacity=".5"/><path d="M8 34 q12-14 24 0" fill="currentColor" opacity=".5"/></svg>';
  if(key==='decision')return `<svg viewBox="0 0 40 40"><rect x="6" y="22" width="6" height="12" rx="2" fill="currentColor" opacity=".45"/><rect x="17" y="14" width="6" height="20" rx="2" fill="currentColor" opacity="${on?.95:.45}"/><rect x="28" y="18" width="6" height="16" rx="2" fill="currentColor" opacity=".45"/><path d="M9 10 l3 3 l6-7" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="${on?1:.4}"/></svg>`;
  return `<svg viewBox="0 0 40 40"><path d="M20 33 C8 25 5 18 9 12 C13 7 18 9 20 13 C22 9 27 7 31 12 C35 18 32 25 20 33Z" fill="currentColor" opacity="${on?.95:.45}"/></svg>`}
function btPrep(){const m=M(),B=m.bigtalk,H=btState(m);H.picks=[];save();
  const C=jStage(jScene(B.prep.scene),B.prep.place,`<div class="bt-top" id="deck"></div>`);const deck=()=>{const d=$('#deck');if(d&&C.alive())d.innerHTML=btSlides(m,H,btCase(m))};deck();
  (async()=>{await C.say(B.prep.intro.who,'happy',B.prep.intro.text);
    const cs=btCases(m);if(cs.length>1){await C.say(B.prep.pick.who,'think',B.prep.pick.text);const a=await C.choose(cs.map(c=>c.title));if(!a)return;H.case=cs[a.j].id}else H.case=cs[0].id;save();
    const c=btCtx(btCase(m));deck();
    for(const [i,b] of B.beats.entries()){await C.say(b.ask.who,'think',b.ask.text);const a=await C.choose(b.opts.map(o=>jText(o.t,c)));if(!a)return;
      H.picks[i]=a.j;save();deck();const tip=jLine(b.opts[a.j].tip,c);await C.say(tip.who,b.opts[a.j].good?'happy':'think',tip.text);
      if(!b.opts[a.j].good){const k=b.opts.findIndex(o=>o.good);await C.say('byte','smile',B.prep.retry.text);const r=await C.choose([jText(b.opts[k].t,c),jText(b.opts[a.j].t,c)]);if(!r)return;H.picks[i]=r.j===0?k:a.j;save();deck()}}
    await C.say(B.prep.ready.who,'happy',B.prep.ready.text);await C.tap();nextStep()})()}
// the audience: three tiered rows of doctors and nurses facing the speaker, behind wooden row rails. Each person has a
// face, their own hair, skin and clothes (white coat, scrubs or a sweater); a few hold tablets. .bt-p bobs, .bt-react
// holds the hearts and light bulbs from btReact().
function btCrowd(n=11){const sk=(typeof SKIN!=='undefined'&&SKIN.length)?SKIN:['#f6d7c3','#eebd9a','#d9a07a','#b97a55','#8d5a3b','#5e3a26'];
  const hairs=['#2a1d18','#5a3a22','#141010','#c9a36a','#8a4a2a','#d8d4de','#3a2a4a','#b5562e'],tops=['#5b9bf0','#16b3a6','#ff7a6b','#f5b82e','#8f86ff','#e85d75','#2fbf71','#6b7aa8'];
  const rows=[{y:42,s:.6,c:n-1},{y:72,s:.74,c:n},{y:104,s:.9,c:n-2}];let g='';
  rows.forEach((R,r)=>{for(let i=0;i<R.c;i++){const k=i*5+r*3,x=(i+.5)*(400/R.c)+((r%2)?6:-6)+(i%2?2:-2);
    const skin=sk[(k*7+r)%sk.length],hc=hairs[(k*3+1)%hairs.length],top=tops[(k+r)%tops.length],st=(k+i)%7,wear=(k+2*r)%5;
    // hair behind the head (long styles), then the body, head, face, and hair in front
    const back=st===1?`<path d="M-11 -30 C-13 -44 13 -44 11 -30 L12 -14 C6 -11 -6 -11 -12 -14Z" fill="${hc}"/>`:st===4?`<circle cx="0" cy="-41" r="6" fill="${hc}"/>`:st===5?`<path d="M-12 -28 C-14 -46 14 -46 12 -28 L13 -10 C6 -6 -6 -6 -13 -10Z" fill="#3a7a9a"/>`:'';
    const body=wear<2?`<path d="M-17 8 C-16 -6 -10 -12 0 -12 C10 -12 16 -6 17 8Z" fill="#f4f6fb" stroke="#c9cfe0" stroke-width="1"/><path d="M-5 -12 L0 -2 L5 -12Z" fill="${top}"/><path d="M-5 -12 L-2 4 M5 -12 L2 4" stroke="#c9cfe0" stroke-width="1"/>`
      :wear<4?`<path d="M-17 8 C-16 -6 -10 -12 0 -12 C10 -12 16 -6 17 8Z" fill="${wear===2?'#4fb3a9':'#6b8fd6'}"/><path d="M-5 -12 L0 -5 L5 -12" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="1.4"/>`
      :`<path d="M-17 8 C-16 -6 -10 -12 0 -12 C10 -12 16 -6 17 8Z" fill="${top}"/><path d="M-6 -12 C-3 -8 3 -8 6 -12" fill="none" stroke="rgba(0,0,0,.15)" stroke-width="1.4"/>`;
    const lan=wear<2&&k%2?`<path d="M-4 -11 L0 -1 L4 -11" fill="none" stroke="#2f9aa2" stroke-width="1"/><rect x="-2.4" y="-1" width="4.8" height="6" rx="1" fill="#fff" stroke="#2f9aa2" stroke-width=".8"/>`:'';
    const face=`<ellipse cx="-10.4" cy="-27" rx="2" ry="2.6" fill="${skin}"/><ellipse cx="10.4" cy="-27" rx="2" ry="2.6" fill="${skin}"/><path d="M-10 -28 C-10 -40 10 -40 10 -28 C10 -19 6 -15 0 -15 C-6 -15 -10 -19 -10 -28Z" fill="${skin}"/>
      <ellipse cx="-3.8" cy="-26.6" rx="1.7" ry="2.3" fill="#2a2030"/><ellipse cx="3.8" cy="-26.6" rx="1.7" ry="2.3" fill="#2a2030"/><circle cx="-3.2" cy="-27.6" r=".7" fill="#fff"/><circle cx="4.4" cy="-27.6" r=".7" fill="#fff"/>
      <ellipse cx="-6.6" cy="-22.6" rx="1.9" ry="1.1" fill="#ff8a8a" opacity=".45"/><ellipse cx="6.6" cy="-22.6" rx="1.9" ry="1.1" fill="#ff8a8a" opacity=".45"/>
      <path d="M-2 -20.6 C-1 -19.4 1 -19.4 2 -20.6" stroke="#7a3a30" stroke-width="1.1" fill="none" stroke-linecap="round"/><path d="M-5.6 -30.6 l3 -.6 M5.6 -30.6 l-3 -.6" stroke="${hc==='#d8d4de'?'#9a96a6':hc}" stroke-width="1" stroke-linecap="round"/>`;
    const front=st===0?`<path d="M-10.6 -28 C-12 -42 12 -42 10.6 -28 C8 -33 2 -35 -3 -33 C-6 -32 -9 -30 -10.6 -28Z" fill="${hc}"/>`
      :st===1?`<path d="M-10.6 -27 C-12 -43 12 -43 10.6 -27 C9 -33 4 -36 0 -35 C-4 -36 -9 -33 -10.6 -27Z" fill="${hc}"/>`
      :st===2?`<path d="M-10.6 -29 C-11 -41 11 -41 10.6 -29 C7 -32 -7 -32 -10.6 -29Z" fill="${hc}"/>`
      :st===3?[[-8,-33],[-4,-36],[0,-37],[4,-36],[8,-33],[-10,-29],[10,-29]].map(([cx,cy])=>`<circle cx="${cx}" cy="${cy}" r="3.8" fill="${hc}"/>`).join('')
      :st===4?`<path d="M-10.6 -28 C-12 -42 12 -42 10.6 -28 C7 -33 -7 -33 -10.6 -28Z" fill="${hc}"/>`
      :st===5?`<path d="M-12 -28 C-13 -45 13 -45 12 -28 C10 -24 10 -18 7 -15 C9 -21 9 -30 0 -32 C-9 -30 -9 -21 -7 -15 C-10 -18 -10 -24 -12 -28Z" fill="#4a8aaa"/>`
      :`<path d="M-10 -30 C-9 -38 9 -38 10 -30 C6 -33 -6 -33 -10 -30Z" fill="${hc}" opacity=".7"/><rect x="-7.4" y="-29" width="6" height="4.6" rx="2" fill="none" stroke="#3a3a4a" stroke-width="1"/><rect x="1.4" y="-29" width="6" height="4.6" rx="2" fill="none" stroke="#3a3a4a" stroke-width="1"/><path d="M-1.4 -27 h2.8" stroke="#3a3a4a" stroke-width="1"/>`;
    const tab=k%6===1?`<g transform="translate(9 2) rotate(-12)"><rect x="-6" y="-8" width="12" height="9" rx="1.6" fill="#2a3060"/><rect x="-4.6" y="-6.6" width="9.2" height="6.2" rx="1" fill="#8fd8ff"/></g>`:'';
    g+=`<g transform="translate(${x.toFixed(1)} ${R.y}) scale(${R.s})"><g class="bt-p" style="--d:${((i*7+r*3)%10)/10}s">${back}${body}${lan}${face}${front}${tab}<g class="bt-react" data-i="${r*20+i}"></g></g></g>`}
    // the wooden rail in front of this row hides the laps
    g+=`<path d="M0 ${R.y+4*R.s} H400 V${R.y+12*R.s} H0Z" fill="#9a6a44"/><path d="M0 ${R.y+4*R.s} H400" stroke="#c99a6a" stroke-width="2"/><path d="M0 ${R.y+12*R.s} H400" stroke="#6a4428" stroke-width="1.4"/>`});
  return `<svg class="bt-crowd" viewBox="0 0 400 118" preserveAspectRatio="xMidYMax meet"><rect x="0" y="20" width="400" height="98" fill="#7a5236" opacity=".35"/>${g}</svg>`}
function btReact(kind){const gs=$$('.bt-react');const pick=gs.filter((_,i)=>(i*7+Date.now())%3!==0).slice(0,kind==='clap'?gs.length:9);
  const art={heart:'<path d="M0 -46 C-7 -51 -10 -56 -6 -60 C-3 -63 0 -61 0 -58 C0 -61 3 -63 6 -60 C10 -56 7 -51 0 -46Z" fill="#ff7a8a"/>',bulb:'<circle cx="0" cy="-58" r="5" fill="#ffd45c"/><path d="M-3 -52 h6" stroke="#8a7a40" stroke-width="2"/>',
    hmm:'<text x="0" y="-50" text-anchor="middle" font-size="12" font-weight="800" fill="#fff">?</text>',zzz:'<text x="0" y="-50" text-anchor="middle" font-size="10" font-weight="800" fill="#cfd6ff">z</text>',clap:'<path d="M-6 -52 l3 -6 M0 -54 v-7 M6 -52 l-3 -6" stroke="#ffd45c" stroke-width="2" stroke-linecap="round"/>'}[kind]||'';
  gs.forEach(g=>g.innerHTML='');pick.forEach((g,i)=>{setTimeout(()=>{g.innerHTML=`<g class="bt-pop">${art}</g>`},i*70)});
  const c=$('.bt-crowd');if(c){c.classList.remove('nod','clap');void c.offsetWidth;c.classList.add(kind==='clap'?'clap':'nod')}}
function btScreen(m,H,c,i){const B=m.bigtalk;const b=B.beats[i];const p=i!=null&&H.picks[i]!=null?b.opts[H.picks[i]]:null;
  return `<div class="bt-hall"><div class="bt-screen ${p?'lit':''}"><div class="bt-screen-in">${i==null?`<b>${esc(B.stage.title)}</b><span>${esc(c.title)}</span>`:`${btSlideArt(b.key,c,true)}<b>${esc(b.label)}</b>`}</div></div>${btCrowd()}</div>`}
function btStage(){const m=M(),B=m.bigtalk,H=btState(m);const c=btCtx(btCase(m));
  const C=jStage(jScene(B.stage.scene),B.stage.place,`<div class="bt-top" id="hall">${btScreen(m,H,c,null)}</div>`);
  (async()=>{await C.say(B.stage.intro.who,'smile',B.stage.intro.text);await C.tap();let good=[];
    for(const [i,b] of B.beats.entries()){const k=H.picks[i]??b.opts.findIndex(o=>o.good);H.picks[i]=k;const o=b.opts[k];if(!C.alive())return;$('#hall').innerHTML=btScreen(m,H,c,i);
      await C.me(jText(o.t,c));btReact(o.good?(b.key==='thanks'?'heart':'bulb'):(i%2?'hmm':'zzz'));good.push(!!o.good);await new Promise(r=>setTimeout(r,500))}
    const Q=B.question;await C.say(Q.q.who,'think',Q.q.text);const a=await jAsk(C,Q.opts.map(o=>jText(o.t,c)),!!Q.check);if(!a)return;
    let qg,reply;if(a.j<0){const g=await jGradeFree(Q.judge,Q,a.text);qg=g.good;reply=g.reply||jLine(Q.free[qg?0:1]).text}else{qg=!!Q.opts[a.j].good;reply=jLine(Q.opts[a.j].reply,c).text}
    if(a.j<0)await C.me(a.text,true);
    await C.say(Q.q.who,qg?'happy':'think',reply);await C.tap();H.answered=qg;
    btReact('clap');const end=jLine(B.applause,{strong:good.every(Boolean)&&qg});await C.say(end.who,'happy',end.text);await C.tap();
    const sb=awardStars(m.id,starsFrom({ask:good[0]&&good[1],decision:qg,heart:good[2]}));save();
    if(B.guide&&unlock(B.guide))toast('New Field Guide idea: '+FIELD_GUIDE[B.guide].title,'good');nextStep()})()}

// ---------- the promotion: short and joyful ----------
function btPromotion(){const m=M(),P0=m.promotion,career=P0.career||m.career,to=P0.to||m.promotes||'pro';const from=RANKS[Math.max(0,RANKS.indexOf(to)-1)];
  promote(career,to);addCoins(P0.bonus||50);
  screen('promo',`${scene(jScene(P0.scene||'hospital'))}<div class="cj-rays"></div><div class="talk-dim"></div>${hud(P0.place||'Promotion')}<div class="cj-promo">
    <div class="cj-promo-badge" id="pbadge">${cjBadge(P0.badge,from)}</div>
    <h2 class="cj-promo-h">${esc(RANK_NAME[to])}!</h2>
    <div class="cj-promo-who">${speakerArt(P0.line.who,'happy')}<p>${esc(fill(P0.line.text))}</p></div>
    <ul class="cj-unlocks">${(P0.unlocks||[]).map(u=>`<li>${esc(u)}</li>`).join('')}</ul>
    <div class="cj-promo-byte">${byteBox({...S.byte,mood:'happy'},'dance')}</div>
    <button class="btn wide" id="next">Back to the map</button></div>`);
  setTimeout(()=>{const b=$('#pbadge');if(!b)return;b.innerHTML=cjBadge(P0.badge,to,true);cmConfetti(60)},900);
  playSeq([[P0.line.who,P0.line.text],[P0.byte.who,P0.byte.text]]);
  $('#next').onclick=()=>nextStep()}

Object.assign(FLOW_KINDS,{explore:()=>jExplore(),meet:jMeet,portfolio:jPortfolio,interview:jInterview,firstday:jFirstDay,talkprep:btPrep,bigtalk:btStage,promotion:btPromotion});

// ---------- the career track shown in a place planner ----------
// [{key,label,state:'done'|'now'|'todo', go:{id,at}|null, note}] for one career; null when the career has no journey and no big talk
function careerTrack(career){const jm=careerJourney(career),C=camp();
  const work=Object.values(MISSIONS).filter(m=>m.career===career&&missionMeta(m).kind==='workday'&&missionMeta(m).rank==='trainee');
  const talk=Object.values(MISSIONS).find(m=>m.career===career&&missionMeta(m).kind==='bigtalk'&&missionMeta(m).rank==='trainee');
  if(!jm&&!talk)return null;const out=[];
  JOURNEY_STAGES.slice(0,5).forEach(([k,l])=>{if(!jm)return;const i=(jm.stages||[]).findIndex(s=>s.key===k);if(i<0)return;const reached=C.jp[jm.id]||0;
    out.push({key:k,label:l,state:isDone(jm.id)||i<reached?'done':i===reached?'now':'todo',go:{id:jm.id,at:jm.stages[i].at}})});
  const wd=work.filter(m=>isDone(m.id)).length;out.push({key:'workdays',label:'Workdays',state:work.length&&wd===work.length?'done':'todo',note:work.length?wd+' of '+work.length:''});
  if(talk)out.push({key:'bigtalk',label:'Big talk',state:isDone(talk.id)?'done':'todo',go:{id:talk.id}});
  out.push({key:'promotion',label:'Promotion',state:rankAtLeast(career,'pro')?'done':'todo'});
  const first=out.findIndex(x=>x.state!=='done');if(first>=0&&!out.some(x=>x.state==='now'))out[first].state='now';
  return out}
