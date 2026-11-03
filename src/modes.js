// modes.js — the Challenge setting (Kid, Teen, Grown-up), family play ("grown-up asks") and the Grown-up dossiers.
// Kid is the game exactly as written: every hook below returns early at Kid (family play is off by default), so no Kid screen changes.
// Everything here plugs into the engine through hook() calls in game.js and parent.js (registered in the LATE function at the end).
//
// API for missions (see docs/MISSIONS.md, "Challenge levels"):
//   MODE()                 'kid' | 'teen' | 'grownup'
//   lvl(kid,teen,grownup)  the value for the current level; undefined or null falls back to the level below
//   mission.levels         {teen:{...}, grownup:{...}}: fields that replace the mission's own at that level (levelView() in missions.js)
//   step.deep              [{t,viz,args,cap,lvl}] extra document sentences after a step, each with its own picture.
//                          lvl 'grownup' = Grown-up only, ['teen'] = Teen only, default = Teen and Grown-up. step.alt.deep replaces
//                          step.deep once the player has told Byte the clue.
//   step.levels, line.levels  {teen:{...}, grownup:{...}}: replace fields of one sentence or one conversation line
//   step.dossier           a dossier id unlocked (Teen and Grown-up) when that document is opened
//   tell.match             RegExp: at Grown-up the clue line gets no notebook button; the player tells Byte in their own words
//   take()                 HTML: Byte's key consideration and recommendation. At Grown-up Byte holds it back; asking costs a Decision star
//   predict                {ids:[criterion ids]}: the event Grown-up players price on the Future Table (default: every goal they picked)
//   line.ask, consent.ask  {as: cast id, qs:[questions]}: a "grown-up asks" moment when Family play is on (any level)
const LEVEL_NAMES={kid:'Kid',teen:'Teen',grownup:'Grown-up'};
function MODE(){return LEVEL_NAMES[S&&S.level]?S.level:'kid'}
function lvl(kid,teen,grownup){const L=MODE();if(L==='grownup'&&grownup!=null)return grownup;if(L!=='kid'&&teen!=null)return teen;return kid}

const MODES=(()=>{
  const CAP=1;          // Decision stars that Byte's take costs at Grown-up
  const GREC=/\b(best|which|pick|choose|should|recommend|recommendation|what would you do|your take|decide|what matters)\b/;

  // ---------- per-run state (S.md) and the long-lived logs ----------
  const md=()=>{if(!S.md||S.md.mission!==S.mission)S.md={mission:S.mission,run:Date.now(),lv:{[MODE()]:1},pred:{},final:null,take:0,logged:0};return S.md};
  const strip=t=>String(t).replace(/\[\[|\]\]/g,'');
  const pct=v=>Math.round(100*v);
  const fmtB=v=>v.toFixed(2).replace(/^0/,'');

  // ---------- the mission as seen at this level ----------
  const VIEWS=new Map();
  const def=(o,k,v)=>Object.defineProperty(o,k,{value:v,writable:true,configurable:true,enumerable:true});
  function view(m){const L=MODE();if(L==='kid'||!m)return m;const key=m.id+'|'+L;let v=VIEWS.get(key);if(v&&v._base===m)return v;
    v=levelView(m,L);if(v===m)v=Object.create(m);const own=m.levels&&m.levels.grownup||{};
    if(L==='grownup'){if(!('react' in own))def(v,'react',{});if(m.memo&&!('memo' in own))def(v,'memo',{...m.memo,starters:[]})}
    def(v,'_base',m);VIEWS.set(key,v);return v}
  const pick=(x,L)=>{if(!x||!x.levels||L==='kid')return x;const r=L==='grownup'?{...x.levels.teen,...x.levels.grownup}:x.levels[L];return r?{...x,...r}:x};
  const shows=(d,L)=>Array.isArray(d.lvl)?d.lvl.includes(L):d.lvl==='grownup'?L==='grownup':L!=='kid';

  // documents: insert deep sentences after their sentence, apply per-sentence replacements, keep highlight keys stable
  function docSteps(steps,doc){const L=MODE();if(L==='kid')return steps;const out=[];
    steps.forEach((b0,i)=>{const b=pick(b0,L);out.push({...b,key:doc.id+i,n:i+1});
      const alt=S.told&&b.alt&&b.alt.deep,src=alt||b.deep||[];let j=0;
      src.forEach((d,k)=>{if(!shows(d,L))return;out.push({...pick(d,L),alt:null,key:doc.id+i+(alt?'u':'d')+k,n:(i+1)+'abcdefghij'[j++],cls:'md-deep'})})});
    return out}
  // conversations: per-line replacements; at Grown-up the clue gets no notebook button when the player can tell Byte in words
  function talkLines(lines){const L=MODE();if(L==='kid')return lines;const T=M().tell,hide=L==='grownup'&&T&&T.match;
    return lines.map(x=>{let y=pick(x,L);if(hide&&y.clue){y={...y};delete y.clue}return y})}

  // ---------- forecasts ----------
  const goals=()=>{const P=M().predict;return (P&&P.ids)||S.criteria.filter(x=>x!=='agree')};
  const goalLabels=()=>goals().map(id=>{const c=M().criteria.find(x=>x.id===id);return c?strip(c.label):id});
  // chance that plan c meets every goal at once (the joint probability, not a product of separate chances)
  function joint(c,knows,ids=goals()){return M().outcomes(c,knows).reduce((a,x)=>a+x.p*ids.reduce((b,id)=>b*(x.flags[id]??1),1),0)}
  const planKey=c=>M().controls.map(ct=>JSON.stringify(c[ct.key])).join('|');
  const brier=(p,y)=>(p-y)*(p-y);
  const expBrier=(p,q)=>(p-q)*(p-q)+q*(1-q);   // expected Brier score of forecast p when the true chance is q

  // ---------- level changes ----------
  function setLevel(L){if(!LEVEL_NAMES[L]||L===S.level)return;S.level=L;if(S.mission&&MISSIONS[S.mission]){md().lv[L]=1;const v=M();
      for(const ct of v.controls||[])if(!ct.opts.some(([x])=>JSON.stringify(x)===JSON.stringify(S.choice[ct.key])))S.choice[ct.key]=v.start[ct.key]}
    save()}
  const segHTML=(id,cur)=>`<div class="seg md-seg" id="${id}">${Object.entries(LEVEL_NAMES).map(([k,l])=>`<button class="segb ${cur===k?'on':''}" data-lv="${k}">${T(l)}</button>`).join('')}</div>`;
  function setup(){const pn=document.querySelector('.setup label[for="pname"]');if(!pn)return;
    pn.insertAdjacentHTML('beforebegin',`<div class="lbl">${T('Challenge')}</div>${segHTML('md-lv',MODE())}`);
    $$('#md-lv .segb').forEach(b=>b.onclick=()=>{setLevel(b.dataset.lv);$$('#md-lv .segb').forEach(x=>x.classList.toggle('on',x===b))})}
  function menu(d){const hub=$('#m-hub',d);if(!hub)return;
    hub.insertAdjacentHTML('afterend',`<div class="lbl">${T('Challenge')}</div>${segHTML('md-mlv',MODE())}
      <div class="lbl">${T('Family play')}</div><div class="md-fam"><span>${T('A grown-up asks follow-up questions in conversations')}</span><button class="pp-tog ${S.family?'on':''}" id="md-fam" role="switch" aria-checked="${!!S.family}" aria-label="${T('Family play')}"><i></i></button></div>`);
    $$('#md-mlv .segb',d).forEach(b=>b.onclick=()=>{const was=MODE();setLevel(b.dataset.lv);$$('#md-mlv .segb',d).forEach(x=>x.classList.toggle('on',x===b));
      if(was!==MODE()){toast(T('Challenge: {0}',T(LEVEL_NAMES[MODE()])),'good');const f=S.mission&&MISSIONS[S.mission]&&M().flow.find(x=>x.name===S.step);
        if(f&&['bench','criteria','table','consent','memo'].includes(f.k)){d.remove();render()}}});
    const t=$('#md-fam',d);t.onclick=()=>{S.family=!S.family;save();t.classList.toggle('on',!!S.family);t.setAttribute('aria-checked',!!S.family)}}

  // ---------- Workbench: Grown-up tells Byte in words, Byte's take, dossiers ----------
  function bench(doc){const L=MODE();if(L==='kid')return;
    for(const st of docSteps(doc.steps,doc))if(st.dossier)dossier(st.dossier);
    if(L!=='grownup')return;const foot=$('.bench-foot'),next=$('#next');if(!foot||!next)return;const TL=M().tell;let h='';
    if(TL&&TL.match&&!S.told)h+=`<button class="btn ghost small" data-md="tell">${T('Tell {0} something',esc(S.byte.name))}</button>`;
    if(M().take)h+=takeBtn();next.insertAdjacentHTML('beforebegin',h)}
  function openTell(){const TL=M().tell;const d=sheet(T('Tell {0}',esc(S.byte.name)),`<form class="md-tell" id="md-tellf"><textarea id="md-tellin" rows="3" maxlength="300" placeholder="${T('What did you notice?')}"></textarea>${micButton('md-tellin')}
      <button class="btn small" type="submit">${T('Tell {0}',esc(S.byte.name))}</button></form><div class="byte-note" id="md-tellr" hidden>${byteBox({...S.byte,mood:'think'})}<p></p></div>`);
    wireMics();setTimeout(()=>{const i=$('#md-tellin',d);i&&i.focus()},300);
    $('#md-tellf',d).onsubmit=e=>{e.preventDefault();const q=$('#md-tellin',d).value.trim();if(!q)return;window.PARENT&&PARENT.noteChat(q);
      if(TRX(TL.match).test(q)){S.told=true;save();d.remove();unlock(TL.guide)&&toast(T('New Field Guide idea: {0}',T(FIELD_GUIDE[TL.guide].title)),'good');curDoc=TL.doc||curDoc;renderWorkbench();
        setTimeout(()=>{const u=$('#upd');if(u){u.scrollIntoView({behavior:'smooth',block:'center'});u.classList.add('flash')}},350);return}
      const r=$('#md-tellr',d);r.hidden=false;r.querySelector('p').textContent=T('Thanks, noted. That doesn’t change my forecast.');$('#md-tellin',d).value='';MUSIC.babble(T('Thanks, noted.'),'byte')}}
  const takeBtn=()=>`<button class="btn ghost small md-take" data-md="take">${T('{0}’s take',esc(S.byte.name))}${md().take?'':` <span class="md-cost">−1★</span>`}</button>`;
  function openTake(){const show=()=>{const d=sheet(T('{0}’s take',esc(S.byte.name)),`<div class="byte-note md-takebox">${byteBox({...S.byte,mood:'happy'})}<p>${M().take()}</p></div>`);return d};
    if(md().take){show();return}
    const d=sheet(T('{0}’s take',esc(S.byte.name)),`<div class="byte-note">${byteBox({...S.byte,mood:'think'})}<p>${T('My key consideration and my recommendation cost one Decision star today. The best you can earn becomes {0} stars.',3-CAP)}</p></div>
      <div class="row md-row"><button class="btn small" id="md-pay">${T('Ask anyway')}</button><button class="btn small ghost" id="md-no">${T('Not now')}</button></div>`);
    $('#md-no',d).onclick=()=>d.remove();$('#md-pay',d).onclick=()=>{md().take=1;save();d.remove();show();$$('.md-take .md-cost').forEach(x=>x.remove())}}

  // ---------- Future Table: predict first (Grown-up) ----------
  function table(c){if(MODE()!=='grownup')return;const k=planKey(c),P=md().pred[k],head=$('.ft-head p');
    if(!P){['#futs','.meters','#why','#whybox'].forEach(s=>{const e=$(s);if(e)e.hidden=true});const nx=$('#next');if(nx)nx.disabled=true;
      if(head)head.textContent=T('Your odds first. Then I’ll show you mine.');
      $('.ft-head').insertAdjacentHTML('afterend',`<div class="md-gate"><div class="md-gate-plan">${esc(M().planName(c))}</div>
        <div class="md-gate-q">${T('Chance it meets all your goals: {0}',goalLabels().map(esc).join(' + '))}</div>
        <div class="md-odds"><input type="range" id="md-p" min="0" max="100" step="1" value="50" aria-label="${T('Your odds')}"><output id="md-pv">50%</output></div>
        <button class="btn wide" data-md="lock">${T('Show {0}’s futures',esc(S.byte.name))}</button></div>`);
      const r=$('#md-p'),o=$('#md-pv');r.oninput=()=>{o.textContent=r.value+'%'};r.onkeydown=e=>{if(e.key==='Enter')lock(c,+r.value)};return}
    const f=joint(c,M().knows());$('#futs').insertAdjacentHTML('afterend',`<div class="md-vs"><span>${T('All your goals')}</span>${vsBar(T('You'),P.p/100,'you')}${vsBar(S.byte.name,f,'byte')}</div>`);
    if(M().take){const nx=$('#next');nx&&nx.insertAdjacentHTML('beforebegin',takeBtn())}}
  const vsBar=(who,v,cls)=>`<div class="md-vsrow ${cls}"><b>${esc(who)}</b><i><em style="width:${pct(v)}%"></em></i><strong>${pct(v)}%</strong></div>`;
  function lock(c,p){md().pred[planKey(c)]={p,f:joint(c,M().knows()),q:joint(c,M().truth()),plan:M().planName(c),told:!!S.told};save();renderTable()}

  // ---------- consent: options in a fair order (Teen and Grown-up), family follow-up ----------
  function consent(opts){if(MODE()==='kid')return;const box=$('.subtitle .choices');if(!box)return;const bs=[...box.children];
    const rng=rngFrom((S.seed||1)*131+planKey(S.choice).length*17+JSON.stringify(S.choice).split('').reduce((a,ch)=>a+ch.charCodeAt(0),0));
    for(let i=bs.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[bs[i],bs[j]]=[bs[j],bs[i]]}bs.forEach(b=>box.appendChild(b))}
  function consentReply(o){const K=M().consent;if(!S.family||!o.good||!K.ask)return;const cont=$('#cont');if(!cont)return;
    cont.insertAdjacentHTML('beforebegin',`<button class="choice md-ask" data-md="ask">${T('A grown-up asks a follow-up')}</button>`);
    const box=cont.parentElement;box.querySelector('[data-md="ask"]').onclick=e=>{e.stopPropagation();family(box,K.ask,()=>nextStep(),'Write my decision')}}

  // ---------- family play: a second player asks a tough follow-up, the kid answers ----------
  function afterLine(v,L,ctx){if(v||!S.family||!L.ask||L._asked||(L.choices&&!ctx.isReply))return v;
    ctx.choices.innerHTML=`<button class="choice md-ask">${T('A grown-up asks a question')}</button><button class="choice ghost">${T('Keep going')}</button>`;
    const [a,k]=ctx.choices.children;k.onclick=e=>{e.stopPropagation();L._asked=1;ctx.advance()};
    a.onclick=e=>{e.stopPropagation();L._asked=1;family(ctx.choices,L.ask,()=>ctx.advance(),'Keep going')};return true}
  function family(box,ask,done,doneLabel){const sub=box.closest('.subtitle'),who=sub.querySelector('.who'),line=sub.querySelector('#line')||sub.querySelector(':scope > p'),C=CAST[ask.as]||{},stage=$('.stage');
    const face=mood=>{if(!stage||!C.name)return;const sps=stage.querySelectorAll('.speaker'),sp=sps.length>1&&M().consent&&ask.as===M().consent.left?sps[0]:sps[sps.length-1];if(sp)sp.innerHTML=portrait({...C,mood})};
    const askStep=()=>{box.innerHTML=`<div class="md-turn">${T('Grown-up’s turn · you are {0}',esc(C.name?T(C.name):T('the skeptic')))}</div>${ask.qs.map((q,i)=>`<button class="choice md-q" data-i="${i}">${esc(fill(T(q)))}</button>`).join('')}
        <form class="md-own" id="md-own"><input id="md-ownq" maxlength="200" autocomplete="off" placeholder="${T('Or type your own question')}">${micButton('md-ownq')}<button class="btn small" type="submit">${T('Ask')}</button></form>`;
      wireMics();$$('.md-q',box).forEach(b=>b.onclick=e=>{e.stopPropagation();answerStep(fill(T(ask.qs[b.dataset.i])))});
      $('#md-own',box).onsubmit=e=>{e.preventDefault();const q=$('#md-ownq',box).value.trim();if(q)answerStep(q)};$('#md-own',box).onclick=e=>e.stopPropagation()};
    const answerStep=q=>{if(who)who.innerHTML=`<b>${esc(T(C.name||'Grown-up'))}</b><span>${esc(T(C.role||'Asked by a grown-up'))}</span>`;if(line)line.textContent=q;face('think');
      box.innerHTML=`<div class="md-turn kid">${T('Your answer, {0}: say it out loud or type it',esc(M().memo&&M().memo.signAs?T(M().memo.signAs+'{0}',P()):P()))}</div>
        <form class="md-own" id="md-ans"><textarea id="md-ansin" rows="2" maxlength="400" placeholder="${T('Answer here, or out loud')}"></textarea>${micButton('md-ansin')}<button class="btn small" type="submit">${T('Done')}</button></form>`;
      wireMics();$('#md-ans',box).onclick=e=>e.stopPropagation();$('#md-ans',box).onsubmit=e=>{e.preventDefault();judgeStep(q,$('#md-ansin',box).value.trim())}};
    const judgeStep=(q,a)=>{box.innerHTML=`<div class="md-turn">${T('Grown-up: how was that answer?')}</div><button class="choice md-good">${T('Convincing')}</button><button class="choice ghost md-again">${T('Ask another')}</button><button class="choice ghost md-done">${esc(T(doneLabel))}</button>`;
      const log=ok=>{const F=S.familyLog=S.familyLog||[];F.unshift({m:S.mission,as:C.name||'',q:q.slice(0,200),a:a.slice(0,400),ok:!!ok,lv:MODE(),t:Date.now()});F.length=Math.min(F.length,30);save()};
      box.querySelector('.md-good').onclick=e=>{e.stopPropagation();log(1);heart(ask.as);face('smile');toast(T('+1 heart from {0}',esc(C.name?T(C.name):T('your grown-up'))),'good');box.querySelector('.md-good').disabled=true};
      box.querySelector('.md-again').onclick=e=>{e.stopPropagation();if(!box.querySelector('.md-good').disabled)log(0);askStep()};
      box.querySelector('.md-done').onclick=e=>{e.stopPropagation();if(!box.querySelector('.md-good').disabled)log(0);done()}};
    askStep()}

  // ---------- memo (Grown-up): odds as a number, the main risk named, a 0 to 100% slider ----------
  function checks(cs,s,A){if(MODE()!=='grownup')return cs;const Mm=M().memo;return cs.map(c=>c.k!=='odds'?c:{...c,ok:A.odds??TRX(/\d|percent|half|one in|out of/).test(s),l:T('Gives odds as a number')})
    .concat([{k:'risk',ok:A.risk??TRX(Mm.risk||/risk|could go wrong|might not|chance of|side effect|uncertain|fail|crooked|rash|infection/).test(s),l:T('Names the main risk')}])}
  function memo(){if(MODE()!=='grownup')return;const st=$('.starters');if(st&&!st.children.length)st.hidden=true;const cf=$('.conf');if(!cf)return;
    const P=md().pred[planKey(S.choice)],v=md().final??(P?P.p:50);
    cf.outerHTML=`<div class="conf md-conf"><div class="ctl-l">${T('Your odds this plan meets all your goals')}</div><div class="md-odds"><input type="range" id="md-fin" min="0" max="100" step="1" value="${v}" aria-label="${T('Your odds')}"><output id="md-finv">${v}%</output></div></div>`;
    const r=$('#md-fin');r.oninput=()=>{md().final=+r.value;$('#md-finv').textContent=r.value+'%';save()};if(md().final==null){md().final=v;save()}}

  // ---------- debrief ----------
  function score(sc,c){if(MODE()!=='grownup')return sc;const ids=goals();const best=Math.max(...allPlans().map(p=>joint(p,M().truth(),ids)));
    const cs=memoChecks(S.memo,S.memoAI);return {...sc,fit:joint(c,M().truth(),ids)>=best-.08,memoOk:cs.filter(x=>x.ok).length>=cs.length-1,max:md().take?3-CAP:3}}
  function debrief(){const L=MODE();if(L==='kid')return;const card=$('.debrief');if(!card)return;const old=$('.debrief .calib'),earned=$('.debrief .earned');
    if(L==='teen'){const html=teenCalib();if(old)old.outerHTML=html;else if(earned)earned.insertAdjacentHTML('beforebegin',html)}
    else{if(old)old.remove();earned.insertAdjacentHTML('beforebegin',forecastCard());if(md().take)$('.debrief .dlist').insertAdjacentHTML('beforeend',`<li>${T('You asked for {0}’s take, so {1} stars was the most you could earn today.',esc(S.byte.name),3-CAP)}</li>`)}
    finishRun()}
  // Teen keeps the 5-step slider, scored against the joint chance that every goal is met
  function teenCalib(){const ids=goals();if(!ids.length)return '';const p=[50,62,75,87,97][S.conf??2],w=['a coin flip','a little sure','pretty sure','very sure','sure'][S.conf??2],f=pct(joint(S.choice,M().knows(),ids));
    const close=Math.abs(p-f)<=15;if(close)unlock('calibration');
    return `<div class="calib"><b>${f}%</b><span>${T('{0}’s forecast that your plan meets all your goals at once. You said you felt {1} (about {2}%). ',esc(S.byte.name),T(w),p)}${T(close?'Nicely <button class="gw" data-w="calibration">calibrated</button>!':p>f?'You were more sure than the odds. That’s called overconfidence.':'You were less sure than the odds. You can trust good evidence a bit more.')}</span></div>`}
  const outcomeOk=()=>{const R=S.result;return R?goals().every(id=>(R.flags[id]??1)>0)?1:0:null};
  function forecastCard(){const c=S.choice,P=md().pred[planKey(c)],y=outcomeOk(),fin=md().final,f=joint(c,M().knows()),q=joint(c,M().truth());
    const row=(l,v,b)=>v==null?'':`<tr><th>${l}</th><td>${pct(v)}%</td><td>${y==null?'':fmtB(brier(v,y))}</td>${b||''}</tr>`;
    const all=Object.values(md().pred);const gap=all.length?all.reduce((a,x)=>a+Math.abs(x.p/100-x.q),0)/all.length:null,bgap=all.length?all.reduce((a,x)=>a+Math.abs(x.f-x.q),0)/all.length:null;
    const eb=all.length?all.reduce((a,x)=>a+expBrier(x.p/100,x.q),0)/all.length:null,ebB=all.length?all.reduce((a,x)=>a+expBrier(x.f,x.q),0)/all.length:null;
    return `<div class="md-fc"><h3>${T('Your forecast')}</h3><div class="md-fc-plan">${esc(M().planName(c))} · ${goalLabels().map(esc).join(' + ')}</div>
      <table class="md-fct"><thead><tr><th></th><th>${T('Odds')}</th><th>${T('Brier')}</th></tr></thead><tbody>
      ${row(T('You, before {0}',esc(S.byte.name)),P?P.p/100:null)}${row(T('You, when you signed'),fin==null?null:fin/100)}${row(esc(S.byte.name),f)}${Math.abs(q-f)>.005?row(T('With everything known'),q):''}</tbody></table>
      <div class="md-fc-out ${y?'ok':'no'}">${T(y?'It happened: every goal was met.':'It did not happen: at least one goal was missed.')}</div>
      <p class="md-fc-note">${T('Brier score = (odds − outcome)², where the outcome is 1 or 0. 0 is perfect; always saying 50% scores .25.')}</p>
      ${all.length?`<p class="md-fc-note">${T(all.length>1?'You priced {n} plans. Your odds were {gap} points from the true odds on average; {b}’s were {bgap}. Expected Brier: you {eb}, {b} {ebB}.':'You priced {n} plan. Your odds were {gap} points from the true odds on average; {b}’s were {bgap}. Expected Brier: you {eb}, {b} {ebB}.',{n:all.length,gap:pct(gap),b:esc(S.byte.name),bgap:pct(bgap),eb:fmtB(eb),ebB:fmtB(ebB)})}</p>`:''}
      <div class="md-sub">${T('Calibration across your missions')}</div>${calChart(logAll())}</div>`}
  // every priced plan from earlier runs plus this one (this run's entries are added to S.calib by finishRun)
  function logAll(){const cur=md().logged?[]:runEntries();return (S.calib||[]).concat(cur)}
  function runEntries(){const c=S.choice,k=planKey(c),y=outcomeOk(),fin=md().final;
    return Object.entries(md().pred).map(([key,x])=>({m:S.mission,t:md().run,lv:MODE(),plan:x.plan,p:x.p,f:x.f,q:x.q,y:key===k?y:null,fin:key===k&&fin!=null?fin:null}))}
  function finishRun(){const r=md();if(r.logged||!S.result)return;if(MODE()==='grownup'){S.calib=(S.calib||[]).concat(runEntries());if(S.calib.length>400)S.calib=S.calib.slice(-400)}
    r.logged=1;const lvs=Object.keys(r.lv);if(lvs.some(x=>x!=='kid')){const next=Object.keys(DOSSIERS).find(id=>!(S.dossiers||[]).includes(id));if(next)dossier(next)}save()}
  // x = your odds (bins of 10 points); ring = average true odds in that bin; dot = how often it happened (plans you chose)
  function calChart(E){if(!E.length)return `<p class="md-fc-note">${T('Appears after your first priced plan.')}</p>`;const W=300,H=200,l=34,r=10,t=10,b=34,X=v=>l+v/100*(W-l-r),Y=v=>t+(1-v/100)*(H-t-b);
    const bins=[...Array(10)].map((_,i)=>{const g=E.filter(e=>Math.min(9,Math.floor(e.p/10))===i);if(!g.length)return null;const res=g.filter(e=>e.y!=null);
      return {x:g.reduce((a,e)=>a+e.p,0)/g.length,q:100*g.reduce((a,e)=>a+e.q,0)/g.length,n:g.length,obs:res.length?100*res.reduce((a,e)=>a+e.y,0)/res.length:null,nr:res.length}}).filter(Boolean);
    const grid=[0,50,100].map(v=>`<line x1="${l}" x2="${W-r}" y1="${Y(v)}" y2="${Y(v)}" class="md-grid"/><text x="${l-5}" y="${Y(v)+4}" text-anchor="end">${v}%</text><text x="${X(v)}" y="${H-b+15}" text-anchor="middle">${v}%</text>`).join('');
    const marks=bins.map(g=>`<circle cx="${X(g.x)}" cy="${Y(g.q)}" r="${4+Math.min(5,Math.sqrt(g.n))}" class="md-ring"><title>${T('{0} priced: true odds averaged {1}%',g.n,Math.round(g.q))}</title></circle>`+(g.obs!=null?`<circle cx="${X(g.x)}" cy="${Y(g.obs)}" r="4.5" class="md-dot"><title>${T('{0} chosen: happened {1}%',g.nr,Math.round(g.obs))}</title></circle>`:'')).join('');
    return `<svg class="md-cal" viewBox="0 0 ${W} ${H}" role="img" aria-label="${T('Calibration chart')}">${grid}<line x1="${X(0)}" y1="${Y(0)}" x2="${X(100)}" y2="${Y(100)}" class="md-diag"/>${marks}
      <text x="${(l+W-r)/2}" y="${H-4}" text-anchor="middle" class="md-ax">${T('Your odds')}</text></svg>
      <div class="md-legend"><span><i class="md-k ring"></i>${T('True odds')}</span><span><i class="md-k dot"></i>${T('What happened')}</span><span><i class="md-k diag"></i>${T('Perfect')}</span></div>`}

  // ---------- grown-ups' page ----------
  function record(e){const r=md(),lvs=Object.keys(r.lv),L=MODE();e.level=L;if(L!=='kid'||lvs.length>1)e.levelName=T(lvs.length>1?'{0} (switched during the day)':'{0}',T(LEVEL_NAMES[L]));
    if(L==='grownup'){const c=S.choice,P=r.pred[planKey(c)];e.conf=null;e.odds={before:P?P.p:null,final:r.final,byte:pct(joint(c,M().knows())),truth:pct(joint(c,M().truth())),y:outcomeOk(),take:!!r.take}}}
  function parent(d){const H=S.history||[],E=S.calib||[],F=S.familyLog||[];if(!H.some(x=>x.level&&x.level!=='kid')&&!E.length&&!F.length)return;
    const lv=H.slice().sort((a,b)=>b.t-a.t).slice(0,8).map(x=>`<li><div><b>${esc(T(x.title))}</b><span>${T('Day {0}',x.day)}</span></div><em class="md-lvl ${x.level||'kid'}">${esc(T(x.levelName||LEVEL_NAMES[x.level||'kid']))}</em></li>`).join('');
    const res=E.filter(e=>e.y!=null);const avg=(A,f)=>A.reduce((a,x)=>a+f(x),0)/A.length;
    const fc=E.length?`<div class="pp-sub">${T('Forecasting (Grown-up)')}</div><p class="pp-note">${T('{0} plans priced before seeing {1}’s odds.',E.length,esc(S.byte.name))}${res.length?T(res.length>1?' On the {n} chosen plans: Brier {a}, {b} {c}.':' On the {n} chosen plan: Brier {a}, {b} {c}.',{n:res.length,a:fmtB(avg(res,x=>brier(x.p/100,x.y))),b:esc(S.byte.name),c:fmtB(avg(res,x=>brier(x.f,x.y)))}):''}${T(' Expected Brier on every priced plan: {0}, {1} {2}. Lower is better.',fmtB(avg(E,x=>expBrier(x.p/100,x.q))),esc(S.byte.name),fmtB(avg(E,x=>expBrier(x.f,x.q))))}</p>${calChart(E)}`:'';
    const fam=F.length?`<div class="pp-sub">${T('Family questions')}</div><ul class="md-famlog">${F.slice(0,6).map(x=>`<li><p>${T('<b>{0}:</b> {1}',esc(T(x.as||'Grown-up')),esc(x.q))}</p>${x.a?`<p class="md-a">${esc(x.a)}</p>`:''}${x.ok?`<span class="md-ok">${T('Convincing')}</span>`:''}</li>`).join('')}</ul>`:'';
    const card=`<section class="pp-card" id="pp-modes"><div class="pp-h"><h3>${T('Challenge')}</h3></div><ul class="pp-list">${lv}</ul>${fc}${fam}</section>`;
    const at=$('#pp-portfolio',d)||$('#pp-chat',d);if(at)at.insertAdjacentHTML('beforebegin',card)}

  // ---------- chat ----------
  function context(t){const L=MODE();if(L==='kid')return t;
    if(L==='teen')return t+`\nChallenge level: Teen. The player may be a teenager. Give a bit more detail and real statistics, still in plain words.`;
    return t+`\nChallenge level: Grown-up. The player is probably an adult, often one who knows AI well. Write for an adult: precise, concise, with real numbers, base rates and uncertainty. Call 2040's AIs expert AIs, not superintelligent. Give evidence and numbers freely when asked.${M().take?` Do not volunteer the key consideration or recommend an option. If asked which option to choose or what matters most, say that your take costs one Decision star and they can tap "${S.byte.name}'s take". The player has ${md().take?'already paid, so answer fully.':'not paid.'}`:' When asked which option to choose, first ask what they think and why, then give the key consideration; recommend only if they ask again.'}`}
  function canned(r,q){if(MODE()!=='grownup'||!M().take||md().take)return r;return TRX(GREC).test(String(q).toLowerCase())?T('My take costs a Decision star today. Tap “{0}’s take” on the Workbench or the Future Table, or ask me for any number you need.',S.byte.name):r}

  // ---------- dossiers (Teen and Grown-up): DOSSIERS is defined below ----------
  function dossier(id){if(MODE()==='kid'||!DOSSIERS[id])return false;const D=S.dossiers=S.dossiers||[];if(D.includes(id))return false;D.push(id);save();toast(T('New dossier: {0}',T(DOSSIERS[id].title)),'good');return true}
  function guide(d){if(MODE()==='kid')return;const body=$('.sheet-body',d);if(!body)return;const got=S.dossiers||[],all=Object.entries(DOSSIERS);
    body.insertAdjacentHTML('beforeend',`<div class="md-dos-h"><h3>${T('Dossiers')}</h3><span>${T('{0} of {1}',got.length,all.length)}</span></div>`+all.map(([id,x],i)=>got.includes(id)?dossierHTML(id,x,i):`<div class="md-dos locked"><div class="md-dos-tab">${T('Dossier {0}',String(i+1).padStart(2,'0'))}</div><h4>${T('Sealed')}</h4><p>${T('Unlocked by finishing a day at Teen or Grown-up, or by reading closely.')}</p></div>`).join(''))}
  function dossierHTML(id,x,i){return `<details class="md-dos"><summary><div class="md-dos-tab">${T('Dossier {0}',String(i+1).padStart(2,'0'))}</div><h4>${esc(T(x.title))}</h4><p>${esc(T(x.tag))}</p></summary>
    <figure class="md-dos-art">${x.art()}</figure><div class="md-stamp">${T('Forecast')}</div>${x.forecast.map(p=>`<p>${T(p)}</p>`).join('')}
    ${x.game?`<div class="md-gamecard"><span>${T('In the game')}</span>${T(x.game)}</div>`:''}<div class="realcard"><span>${T('True today')}</span>${T(x.today)}</div>
    <p class="md-src">${T('Source: “AI 2040: Plan A” by the AI Futures Project, a scenario its authors call a recommendation, not a prediction. The game’s 2040 matches about 2037 in Plan A.')}</p></details>`}

  // delegated clicks for buttons this file adds to engine screens
  document.addEventListener('click',e=>{const b=e.target.closest('[data-md]');if(!b)return;const a=b.dataset.md;
    if(a==='tell')openTell();else if(a==='take')openTake();else if(a==='lock'){const r=$('#md-p');if(r)lock(S.choice,+r.value)}});

  return {view,docSteps,talkLines,afterLine,setLevel,setup,menu,bench,table,consent,consentReply,checks,memo,score,debrief,record,parent,context,canned,guide,dossier,joint,goals,planKey,brier,expBrier,calChart,md}
})();

LATE.push(()=>{if(!LEVEL_NAMES[S.level])S.level='kid';
  onHook('mission',m=>MODES.view(m));onHook('start',()=>{S.md=null;MODES.md()});
  onHook('docSteps',(s,d)=>MODES.docSteps(s,d));onHook('talkLines',l=>MODES.talkLines(l));onHook('afterLine',(v,L,ctx)=>MODES.afterLine(v,L,ctx));
  onHook('bench',d=>{MODES.bench(d)});onHook('table',c=>{MODES.table(c)});onHook('consent',o=>{MODES.consent(o)});onHook('consentReply',o=>{MODES.consentReply(o)});
  onHook('memoChecks',(cs,s,A)=>MODES.checks(cs,s,A));onHook('memo',()=>{MODES.memo()});
  onHook('debriefScore',(sc,c)=>MODES.score(sc,c));onHook('debrief',()=>{MODES.debrief()});
  onHook('record',e=>{MODES.record(e)});onHook('parent',d=>{MODES.parent(d)});
  onHook('setup',()=>{MODES.setup()});onHook('menu',d=>{MODES.menu(d)});onHook('guide',d=>{MODES.guide(d)});
  onHook('byteContext',t=>MODES.context(t));onHook('canned',(r,q)=>MODES.canned(r,q));
  onHook('tellMatch',re=>MODE()==='grownup'&&M().tell&&M().tell.match||re)});

// ---------- Dossiers: optional Field Guide pages about the Plan A world (Teen and Grown-up) ----------
// Facts follow docs/WORLD_2040.md (each with a source there). "forecast" is the scenario's story; "today" is true in 2026.
const DOSSIERS={
  verification:{title:'Trust, but verify',tag:'How two rivals check each other’s AI',
    art:()=>mdArt(`<rect x="14" y="30" width="86" height="74" rx="8" fill="#e9edfb" stroke="#c7cde8" stroke-width="2"/>${[0,1,2,3].map(i=>`<rect x="24" y="${40+i*15}" width="66" height="9" rx="3" fill="#fff" stroke="#c7cde8"/><circle cx="82" cy="${44.5+i*15}" r="2" fill="${i%2?IG.teal:IG.green}" class="ig-blink" style="--d:${i*.3}s"/>`).join('')}
      <path d="M100 58 H150" stroke="#8fd8ff" stroke-width="4"/><path d="M150 58 H204" stroke="#8fd8ff" stroke-width="4" class="ig-dash"/><path d="M152 60 L178 96" stroke="#8fd8ff" stroke-width="3" class="ig-dash"/>
      <path d="M144 48 l12 0 l-6 20z" fill="#bfe9ff" stroke="#5aa9d6" stroke-width="1.5"/>${igT(150,40,'tap',{s:9.5,c:IG.soft})}
      <rect x="160" y="96" width="62" height="28" rx="6" fill="#fff" stroke="${IG.violet}" stroke-width="2"/>${igT(191,108,'re-run',{s:9,c:IG.violet})}${igT(191,119,'samples',{s:9,c:IG.violet})}
      <g class="ig-pop"><circle cx="236" cy="110" r="9" fill="${IG.green}"/><path d="M231 110 l4 4 l7 -8" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/></g>
      <g transform="translate(270 22)"><rect x="-16" y="0" width="32" height="40" rx="5" fill="#fff" stroke="#c7cde8" stroke-width="1.5"/><circle cx="0" cy="13" r="6" fill="#ffd9c2"/><path d="M-9 34 q9 -14 18 0" fill="#e5484d"/></g>
      <g transform="translate(232 22)"><rect x="-16" y="0" width="32" height="40" rx="5" fill="#fff" stroke="#c7cde8" stroke-width="1.5"/><circle cx="0" cy="13" r="6" fill="#f1cfb6"/><path d="M-9 34 q9 -14 18 0" fill="#5b7bd5"/></g>
      ${igT(57,22,'Datacenter',{s:10})}${igT(251,76,'both sign off',{s:9,c:IG.soft})}`,'A network tap copies traffic to a server that re-runs samples, checked by inspectors from both countries'),
    forecast:['In Plan A, the US and China make a deal in 2029 to slow AI down. Neither trusts the other, so the deal is built to be checked. Every major datacenter owner and chip maker publicly declares its big purchases and sales, and a few hundred inspectors from each country visit the other’s chip plants, datacenters and records.',
      'While the checks are set up, all new AI training stops for most of 2029. Existing AIs keep serving customers, but each big datacenter gets <b>network taps</b>: passive glass splitters that copy its traffic to a recomputation server, which re-runs random samples to confirm that only approved AIs are running. Inspectors from both countries sign off on every install.',
      'By late 2029 about 95% of the world’s AI computing is verified this way. Approved AI weights are encrypted by both countries and escorted by both sides to the datacenters that serve the public. By 2034, an unapproved job using 10,000 top AI chips inside a verified datacenter would be caught within about 4.6 hours.'],
    game:'The game’s inspection office in Vienna is an invention. Plan A has no central agency: inspections are done by US and Chinese teams, plus third-party risk assessors.',
    today:'No treaty limits AI training. Checking what a datacenter computes without exposing its secrets is an open research problem; proposals include on-chip mechanisms and network monitoring. The US has required export licenses for top AI chips going to China since 2022.'},
  compute:{title:'Counting every chip',tag:'Why a hidden datacenter is hard to hide',
    art:()=>mdArt(`<path d="M8 104 H156" stroke="#c7cde8" stroke-width="3"/><path d="M14 104 V62 l18 -12 v12 l18 -12 v12 l18 -12 v54z" fill="#e9edfb" stroke="#c7cde8" stroke-width="2" stroke-linejoin="round"/>${igT(42,120,'Chip factory',{s:9.5,c:IG.soft})}
      ${[0,1,2].map(i=>`<g class="md-belt" style="--d:${i*.9}s"><rect x="70" y="90" width="12" height="12" rx="2" fill="${IG.violet}"/><path d="M73 93 h6 M73 96 h6 M73 99 h6" stroke="#fff" stroke-width="1"/></g>`).join('')}
      <rect x="114" y="56" width="40" height="48" rx="4" fill="#fff" stroke="${IG.ink}" stroke-width="1.5"/>${[0,1,2,3].map(i=>`<path d="M120 ${66+i*9} h28" stroke="#c7cde8" stroke-width="2"/>`).join('')}${igT(134,50,'Declared',{s:9.5})}
      <g class="md-orbit"><rect x="226" y="10" width="22" height="12" rx="3" fill="#cfd6ea" stroke="${IG.ink}"/><path d="M214 16 h12 M248 16 h12" stroke="${IG.blue}" stroke-width="5"/></g>
      <path d="M237 24 L204 102 H270 Z" fill="#ffb27a" opacity=".2"/>
      <path d="M180 112 q56 -22 112 0" fill="#9fd2ff" opacity=".6"/><ellipse cx="236" cy="104" rx="22" ry="7" fill="#ff7a3c" opacity=".55" class="ig-pulse"/><ellipse cx="236" cy="104" rx="10" ry="3.5" fill="#ff4d2e" opacity=".8"/>
      ${igT(236,126,'A warm plume',{s:9.5,c:IG.soft})}`,'Chips from a factory are declared in a ledger while a satellite spots a hidden datacenter’s heat'),
    forecast:['Training a frontier AI takes huge numbers of chips, and new chips come from a handful of factories, so computing power is the easiest part of AI to count. Plan A’s declarations start with anyone buying more than about 10,000 top chips (about $100 million worth) and within a year cover anyone with more than 0.001% of the world’s compute. Dead chips must be stored or verifiably destroyed.',
      'The first audit leaves about 1% of the world’s compute untraced. About half of it later turns up in Chinese datacenters, and an amnesty is offered for the rest.',
      'A secret project’s hardest problem is heat: thousands of chips turn electricity into warmth that infrared satellites can see. The scenario’s hiding places include deep-water cooling and a datacenter disguised inside an aluminum smelter; its detectors include radar that senses tunneling, spies, whistleblowers and, later, lie detectors. The authors’ best guess is about a 60% chance of catching a covert project within 5 years.',
      'From 2032, robot and chip production is capped and sold by permit. In the US a chip permit costs about $10,000 and a robot permit about $200,000.'],
    game:'Calder Bay’s unlicensed datacenter, found by its power use and its warm plume, follows this playbook. Calder Bay is fictional.',
    today:'A few companies design nearly all advanced AI chips, one company in Taiwan makes most of them, and one company in the Netherlands makes the extreme-ultraviolet machines needed to print them. In 2024 and 2025, investigators and news reports described AI chips being smuggled into China around US export rules.'},
  treaty:{title:'Rivals at one table',tag:'How the deal holds when no one is in charge',
    art:()=>mdArt(`<path d="M150 14 V112" stroke="#c7cde8" stroke-width="2" stroke-dasharray="5 6"/>
      <g transform="translate(70 72)"><rect x="-46" y="-26" width="92" height="44" rx="6" fill="#fff4f1" stroke="#f0b7a8" stroke-width="2"/>${[0,1,2].map(i=>`<rect x="${-37+i*26}" y="-18" width="20" height="28" rx="3" fill="#fff" stroke="#f0b7a8"/>`).join('')}${igT(0,34,'Canada: China’s chips',{s:9.5})}</g>
      <g transform="translate(230 72)"><rect x="-46" y="-26" width="92" height="44" rx="6" fill="#eef3ff" stroke="#b5c4ef" stroke-width="2"/>${[0,1,2].map(i=>`<rect x="${-37+i*26}" y="-18" width="20" height="28" rx="3" fill="#fff" stroke="#b5c4ef"/>`).join('')}${igT(0,34,'Mongolia: US chips',{s:9.5})}</g>
      <g class="ig-blink"><path d="M112 30 q12 -12 24 0 q-12 12 -24 0z" fill="#fff" stroke="${IG.ink}" stroke-width="1.5"/><circle cx="127" cy="30" r="3.4" fill="${IG.ink}"/></g><g class="ig-blink" style="--d:.7s"><path d="M164 30 q12 -12 24 0 q-12 12 -24 0z" fill="#fff" stroke="${IG.ink}" stroke-width="1.5"/><circle cx="173" cy="30" r="3.4" fill="${IG.ink}"/></g>
      ${igT(150,128,'Each side can see, and reach, the other’s chips',{s:9.5,c:IG.soft})}`,'Each country’s new datacenters sit where the rival could seize them'),
    forecast:['Plan A starts as a US-China deal. China agrees partly because a race looked bad for it: the US had more compute and better AI. Other countries join quickly because they feared a few companies pulling ahead for good, and by the end of 2029 most of the world is in a coalition called the Consortium.',
      'There is no world government. Each country regulates its own AI industry, but almost all research is public, so a country that lets its companies cut corners is noticed at once. Practices that most nations, weighted by bargaining power, consider unsafe get banned everywhere. In 2031, AIs that keep learning on the job are banned after the US and Chinese leaders argue it out on the phone.',
      'To keep the deal from sliding back into a race, new datacenters go where each owner is weakest: America’s in Mongolia and China’s in Canada. If the deal broke, each rival could seize the other’s chips, so each would destroy its own first. The scenario calls this <b>Mutually Assured Compute Destruction</b>.',
      'Capped chip and robot production is split 35% to the US, 20% to China and 45% to everyone else, and middle powers grow about as fast as the superpowers.'],
    game:'In the game, treaty inspectors work in mixed US-China teams, which Plan A supports.',
    today:'The US and China held their first government-to-government talks on AI risk in 2024, and in late 2024 their leaders agreed that humans, not AI, should control decisions to use nuclear weapons. No US-China agreement limits AI development.'},
  transparency:{title:'Research in a glass box',tag:'Published goals, public research, secret weights',
    art:()=>mdArt(`<rect x="70" y="16" width="120" height="96" rx="10" fill="#e8f7ff" fill-opacity=".7" stroke="#8fc9ea" stroke-width="2.5"/>${[0,1,2,3,4].map(i=>`<path d="M82 ${32+i*11} h${40+((i*37)%50)}" stroke="#8fc9ea" stroke-width="3" stroke-linecap="round"/>`).join('')}
      <g transform="translate(166 92)"><rect x="-13" y="-9" width="26" height="20" rx="4" fill="${IG.ink}"/><path d="M-7 -9 v-5 a7 7 0 0 1 14 0 v5" stroke="${IG.ink}" stroke-width="3" fill="none"/><circle cx="0" cy="1" r="3" fill="${IG.gold}"/></g>${igT(130,126,'the weights stay locked',{s:9,c:IG.soft})}
      ${[0,1,2].map(i=>`<g class="md-flow" style="--d:${i*.8}s"><rect x="194" y="${36+i*10}" width="14" height="10" rx="2" fill="#fff" stroke="#8fc9ea"/></g>`).join('')}
      ${[0,1,2,3].map(i=>`<g transform="translate(${232+i*16} 112)">${mini(0,0,{s:.9,shirt:[IG.coral,IG.teal,IG.violet,IG.gold][i]})}</g>`).join('')}${igT(258,60,'the public',{s:9.5,c:IG.soft})}
      <g transform="translate(32 66) rotate(-6)"><rect x="-20" y="-28" width="40" height="54" rx="4" fill="#fff" stroke="#c7cde8" stroke-width="1.5"/>${igT(0,-15,'SPEC',{s:9,w:800})}${[0,1,2,3].map(i=>`<path d="M-13 ${-6+i*7} h26" stroke="#c7cde8" stroke-width="1.6"/>`).join('')}</g>
      <g class="ig-pulse"><circle cx="44" cy="94" r="9" fill="none" stroke="${IG.violet}" stroke-width="2.4"/><path d="M51 101 l7 7" stroke="${IG.violet}" stroke-width="3" stroke-linecap="round"/></g>`,'Research is visible through a glass datacenter while the weights stay locked, and the public reads each AI’s spec'),
    forecast:['From 2030, almost all AI research is public: algorithms, code, the AIs’ chains of thought, even prompts. Anyone can buy computing time inside the research datacenters. The trained AIs themselves, their weights, stay secret, and research leaving a datacenter goes through a channel capped at about 1 megabyte per second, so sneaking out a model would be slow and noticed.',
      'Every developer must publish a <b>Model Specification</b>, a detailed account of how its AI should act, and the law requires it to be accurate. Hidden goals like “maximize engagement” can’t be slipped in unnoticed, but a published spec can still be self-serving: one AI’s spec in the scenario says to “help the company make money and don’t embarrass the company.” Reading the fine print is part of being a citizen.',
      'From 2031, before a new AI is approved, its maker must publish a <b>safety case</b>: an argument that the AI won’t cause an irreversible catastrophe, which has to survive criticism from scientists, auditors and rival companies. Deployed AIs are watched by monitor AIs from other companies, and new models go to the public before they are used for AI research, the reverse of 2026.'],
    game:'Byte refused an “upgrade” from an unknown maker. Under these rules, an AI with no published spec and no approval should not be running at all.',
    today:'Some AI companies publish documents describing how their models should behave, and some publish safety frameworks. In 2025 California passed a law requiring the largest AI developers to publish their safety frameworks and report critical safety incidents.'},
  pause:{title:'Why the AIs stop at expert level',tag:'Control works only up to a point',
    art:()=>mdArt(`<path d="M50 112 A100 100 0 0 1 250 112" fill="none" stroke="#e3e7f5" stroke-width="16"/><path d="M50 112 A100 100 0 0 1 200 25.4" fill="none" stroke="${IG.teal}" stroke-width="16"/><path d="M200 25.4 A100 100 0 0 1 250 112" fill="none" stroke="#c9c3f7" stroke-width="16" stroke-dasharray="6 5"/>
      <g class="md-needle"><path d="M150 112 L192 40" stroke="${IG.ink}" stroke-width="4" stroke-linecap="round"/></g><circle cx="150" cy="112" r="8" fill="${IG.ink}"/>
      <g transform="translate(150 84)"><rect x="-9" y="-10" width="6" height="20" rx="2" fill="${IG.coral}"/><rect x="3" y="-10" width="6" height="20" rx="2" fill="${IG.coral}"/></g>
      ${igT(74,36,'top expert',{s:10,c:'#0b7a71'})}${igT(262,24,'the Next Step',{s:10,c:IG.violet})}${igT(50,128,'2026',{s:9,c:IG.soft})}`,'A capability dial paused at top-expert level, short of the Next Step'),
    forecast:['In Plan A, the best AIs equal or surpass top human experts in every field by 2035, and the world deliberately stops there. The reason is <b>control</b>: watching an AI so closely that it couldn’t cause harm even if it tried. Control “only works up to a point,” the authors write, “and that point is probably somewhere around top human expert level.”',
      'Their analogy: controlling a smarter AI is like being an orphaned 8-year-old heir to a business empire, trying to keep brilliant employees honest when you can’t judge their arguments.',
      'So expert AIs run most of the economy while monitors from different companies watch one another. AIs may not reason further ahead than a top human can follow in a few weeks, and risky biology labs must be run by people. Meanwhile alignment becomes a science: by 2038 there are standard methods for training honesty, checked with tools that read what AIs are thinking.',
      'The authors suggest handing off to smarter AI only once the world is about 99.5% sure the AIs are aligned.'],
    game:'The game’s Next Step vote is its version of this decision. The game’s calendar runs about two to three years behind Plan A, so in the game the pause is still on.',
    today:'AI developers test their models for dangerous abilities before release, and researchers study “AI control”: keeping a possibly untrustworthy AI from causing harm by monitoring it, often with other AIs. No one can yet verify that an AI’s goals match what its developer intended.'},
  road:{title:'The road not taken',tag:'Plan D: racing to superintelligence by 2030',
    art:()=>mdArt(`<path d="M150 130 C150 106 146 92 140 80" stroke="#d9c7a8" stroke-width="16" fill="none" stroke-linecap="round"/>
      <path d="M140 80 C120 58 92 46 56 38" stroke="#d9c7a8" stroke-width="12" fill="none" stroke-linecap="round"/><rect x="8" y="12" width="70" height="40" rx="12" fill="#5d6385" opacity=".35" class="md-fog"/>
      <path d="M140 80 C168 72 186 62 206 60 C226 58 236 48 250 38" stroke="#d9c7a8" stroke-width="12" fill="none" stroke-linecap="round"/><circle cx="272" cy="26" r="12" fill="${IG.gold}" class="ig-pulse"/>
      ${igT(60,74,'Plan D: race',{s:10,c:IG.red})}${igT(60,87,'great future ~10%',{s:9,c:IG.soft})}${igT(232,88,'Plan A: slow, verified',{s:10,c:'#0b7a71'})}${igT(232,101,'great future ~42%',{s:9,c:IG.soft})}`,'A road forks: a steep race into fog, or a slower verified path toward sunrise'),
    forecast:['Plan A opens with a race on track for superintelligence by the end of 2030. In the authors’ <b>Plan D</b>, frontier projects race through it at nearly full speed and spend only about 1% of their resources on safety. The jump from AIs that can replace a company’s programmers to AIs able to take over takes about a year, instead of about six under Plan A.',
      'One author’s estimates: if Plan D happens, about a 10% chance of a great future and about a 75% chance of a takeover by misaligned AI. If Plan A is attempted, about 42% and about 28%. He gives Plan A itself only about a 5% chance of actually happening.',
      'The authors call Plan A “primarily a recommendation, not a prediction,” and say it succeeds “imperfectly and only in the nick of time.”'],
    game:'Characters in the game argue about this road: some think it would have brought wonders sooner, and others think it would have ended everything.',
    today:'In 2026 the leading AI companies are spending hundreds of billions of dollars a year on datacenters, and no binding international limit on AI development exists.'}
};
function mdArt(inner,label){return `<svg class="ig md-art" viewBox="0 0 300 132" role="img" aria-label="${label}">${inner}</svg>`}
