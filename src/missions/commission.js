// commission.js — the "Commissioning work from Byte" mechanic from docs/SPEC.md, reusable by any mission.
//   1. cmMake(cfg): choose what to make. Cards flip to show who each kind of output helps; one is the real job.
//   2. (the engine's criteria step sets the bar before looking)
//   3. cmAsk(cfg): build a request from chips (goal, who it is for, limits, how to judge it, power moves) or typed words.
//      Byte's ears and tail show how clear the request is. Sending it plays a short "drafting" moment, then Byte returns
//      polished options. Vague requests get generic options; every missing detail shows up as a visible guess.
//      Each option card can play a red-team preview ("What could go wrong?") and goes to the Future Table.
// Classes are prefixed "cm-" (styles in src/css/commission.css). Top level is plain function definitions (no DOM),
// so tools/make_audio.py can evaluate this file; spoken lines belong in the calling mission's `lines`.

// ---------- 1. Choose what to make ----------
// cfg: {scene, place, title, cards:[{id, title, icon() -> svg, line (Byte's honest take, spoken), checks:[[label, ok|null]], cost, job:bool}],
//       state() -> object to store {made, tried[]}, next()}
function cmMake(cfg){const st=cfg.state();st.tried=st.tried||[];
  const card=c=>{const open=st.tried.includes(c.id);return `<button class="cm-make ${open?'open':''} ${c.job?'job':''}" data-id="${c.id}">
     <span class="cm-make-ic">${c.icon()}</span><b>${esc(c.title)}</b>
     ${open?`<span class="cm-make-ck">${c.checks.map(([l,ok])=>`<i class="${ok===true?'y':ok===false?'n':'q'}">${ok===true?'✓':ok===false?'✗':'?'} ${esc(l)}</i>`).join('')}</span><span class="cm-make-cost">${esc(c.cost)}</span>`:''}</button>`};
  const draw=()=>{screen('cm-screen',`${scene(cfg.scene)}${hud(cfg.place)}<div class="panel-card cm-panel"><h2>${esc(cfg.title)}</h2>
      <div class="cm-makes">${cfg.cards.map(card).join('')}</div>
      <div class="byte-note" id="cm-say">${byteBox({...S.byte,mood:st.say?'alert':'think'})}<p>${esc(st.say||cfg.intro||'')}</p></div>
      <button class="btn wide" id="cm-go" ${st.made?'':'disabled'}>${esc(st.made?cfg.cards.find(c=>c.id===st.made).goLabel||'Make this':'Make this')}</button></div>`);
    $$('.cm-make').forEach(b=>b.onclick=()=>{const c=cfg.cards.find(x=>x.id===b.dataset.id);if(!st.tried.includes(c.id))st.tried.push(c.id);
      st.say=c.line;st.first=st.first||c.id;if(c.job)st.made=c.id;save();draw();playLine('byte',c.line)});
    $('#cm-go').onclick=()=>cfg.next()};
  draw()}

// ---------- 3. Ask well, then judge what comes back ----------
// cfg: {scene, place, title, state() -> persisted object, slots:[{key, label, multi, max?, chips:[{id, t, when()?, gold?}]}], onChip(sel)?,
//   parts:[{label, ok(f)}] (the four parts a good request names), features(sel, text) -> f, sentence(sel, text) -> html,
//   ai: {ask(text) -> prompt string, merge(f, json)} (optional: live AI reads free text), onSend(f), results(f) -> {mood, line, guesses:[{t, slot}], options:[opt]},
//   card(opt, f) -> html (the body of one option card), redTeam(opt) -> {title, svg, text, fix}, onRedTeam(), onChoose(opt, f), working:[status lines]}
function cmClarity(cfg,f){return cfg.parts.filter(p=>p.ok(f)).length}
function cmAsk(cfg){const st=cfg.state();st.sel=st.sel||{};st.text=st.text||'';st.phase=st.phase||'compose';
  if(st.phase==='results'&&st.f)return cmResults(cfg,st);
  const sel=st.sel,f=cfg.features(sel,st.text),n=cmClarity(cfg,f),N=cfg.parts.length,mood=n>=N?'happy':n>=N-1?'neutral':'think';
  const chip=(s,c)=>{const on=s.multi?(sel[s.key]||[]).includes(c.id):sel[s.key]===c.id;return `<button class="critb cm-chip ${on?'on':''} ${c.gold?'gold':''}" data-s="${s.key}" data-c="${c.id}">${esc(c.t)}</button>`};
  screen('cm-screen',`${scene(cfg.scene)}${hud(cfg.place)}<div class="panel-card cm-panel cm-ask">
    <div class="cm-head"><div class="cm-byte ${n>=N?'cm-wag':n<=1?'cm-tilt':''}">${byteBox({...S.byte,mood})}</div>
      <div class="cm-req"><div class="cm-req-to">${esc(cfg.title)}</div><p id="cm-sent">${cfg.sentence(sel,st.text)}</p></div></div>
    <div class="cm-parts">${cfg.parts.map(p=>`<span class="${p.ok(f)?'on':''}">${p.ok(f)?'✓ ':''}${esc(p.label)}</span>`).join('')}</div>
    ${cfg.slots.map(s=>{const cs=s.chips.filter(c=>!c.when||c.when());return cs.length?`<div class="lbl">${esc(s.label)}</div><div class="crit cm-chips">${cs.map(c=>chip(s,c)).join('')}</div>`:''}).join('')}
    <div class="lbl">Anything else?</div><div class="cm-more"><textarea id="cm-text" rows="2" maxlength="300" placeholder="${esc(cfg.placeholder||'')}">${esc(st.text)}</textarea>${micButton('cm-text')}</div>
    <button class="btn wide" id="cm-send">Send to ${esc(S.byte.name)}</button></div>`);
  wireMics();
  $$('.cm-chip').forEach(b=>b.onclick=()=>{const s=cfg.slots.find(x=>x.key===b.dataset.s),id=b.dataset.c;
    if(s.multi){const a=sel[s.key]=sel[s.key]||[];if(!a.includes(id)&&s.max&&a.length>=s.max){toast('Pick at most '+s.max+'.');return}sel[s.key]=a.includes(id)?a.filter(x=>x!==id):a.concat(id)}else sel[s.key]=sel[s.key]===id?null:id;
    cfg.onChip&&cfg.onChip(sel);const y=window.scrollY;save();cmAsk(cfg);window.scrollTo(0,y)});
  const ta=$('#cm-text');ta.oninput=()=>{st.text=ta.value;save();$('#cm-sent').innerHTML=cfg.sentence(sel,st.text)};
  ta.onchange=()=>{const y=window.scrollY;cmAsk(cfg);window.scrollTo(0,y)};
  $('#cm-send').onclick=async()=>{st.text=ta.value;let f=cfg.features(sel,st.text);
    const box=document.createElement('div');box.className='cm-working';
    box.innerHTML=`<div class="cm-work-in"><div class="cm-work-byte">${byteBox({...S.byte,mood:'think'},'perk')}<i class="cm-ring"></i></div>
      <svg class="cm-sketch" viewBox="0 0 200 110">${[0,1,2].map(i=>`<g class="cm-sk" style="--d:${i*.9}s"><rect x="10" y="10" width="180" height="90" rx="8" fill="#183a6b"/>${[30,60,90,120,150].map(x=>`<path d="M${x} 10 V100" stroke="#3d6aa8" stroke-width=".6"/>`).join('')}${[30,55,80].map(y=>`<path d="M10 ${y} H190" stroke="#3d6aa8" stroke-width=".6"/>`).join('')}
        <path class="cm-draw" d="${['M30 80 C50 40 150 40 170 80','M40 70 h50 v-30 h60 v30 h10','M30 75 Q100 20 170 75 M60 75 h80'][i]}" stroke="#bfe3ff" stroke-width="2.4" fill="none" stroke-linecap="round"/></g>`).join('')}</svg>
      <p id="cm-status">${esc((cfg.working||['Drafting…'])[0])}</p></div>`;document.body.appendChild(box);
    const lines=cfg.working||[];let k=0;const tick=setInterval(()=>{k++;const p=$('#cm-status');if(p&&lines[k])p.textContent=lines[k]},800);
    MUSIC.sfx&&MUSIC.sfx('blip');
    // Live AI (when the artifact has it) reads the typed words for request features; the chips work without it.
    if(cfg.ai&&st.text.trim().length>6){try{const sm=window.PARENT&&!PARENT.chatOn()?null:await getSample();if(sm){const r=await sm.json(cfg.ai.ask(st.text),{modelTier:'quick',cache:false});if(r&&typeof r==='object')f=cfg.ai.merge(f,r)}}catch(e){}}
    await new Promise(r=>setTimeout(r,Math.max(400,lines.length*800)));clearInterval(tick);
    st.f=f;st.rounds=(st.rounds||0)+1;cfg.onSend&&cfg.onSend(f);st.phase='results';save();box.classList.add('out');setTimeout(()=>box.remove(),300);cmResults(cfg,st)};
}
function cmResults(cfg,st){const f=st.f,R=cfg.results(f);st.pick=Math.min(st.pick||0,R.options.length-1);
  screen('cm-screen',`${scene(cfg.scene)}${hud(cfg.place)}<div class="cm-res">
    <div class="panel-card cm-react"><div class="byte-note">${byteBox({...S.byte,mood:R.mood})}<p>${esc(R.line)}</p></div>
      ${R.guesses.length?`<div class="cm-guess">${R.guesses.map(g=>`<button class="cm-g" data-slot="${esc(g.slot||'')}">${esc(g.t)}</button>`).join('')}</div>`:''}</div>
    <div class="cm-cards" id="cm-cards">${R.options.map((o,i)=>`<article class="cm-card" data-i="${i}">${cfg.card(o,f)}
      <div class="cm-card-btns"><button class="btn ghost small cm-rt" data-i="${i}">What could go wrong?</button><button class="btn small cm-pick" data-i="${i}">Test on the Future Table</button></div></article>`).join('')}</div>
    <div class="cm-dots">${R.options.map((o,i)=>`<i class="${i===st.pick?'on':''}"></i>`).join('')}</div>
    <button class="btn ghost wide" id="cm-revise">Revise my request</button></div>`);
  playLine('byte',R.line);
  const strip=$('#cm-cards'),dots=$$('.cm-dots i');
  strip.addEventListener('scroll',()=>{const i=Math.round(strip.scrollLeft/Math.max(1,strip.firstElementChild.offsetWidth+12));dots.forEach((d,j)=>d.classList.toggle('on',j===i))},{passive:true});
  $$('.cm-rt').forEach(b=>b.onclick=()=>{const o=R.options[+b.dataset.i],T=cfg.redTeam(o);cfg.onRedTeam&&cfg.onRedTeam(o);
    sheet(esc(T.title),`<div class="cm-rt-box">${T.svg}</div><p>${rich(T.text)}</p><div class="byte-note">${byteBox({...S.byte,mood:'alert'})}<p>${esc(T.fix)}</p></div>`)});
  $$('.cm-pick').forEach(b=>b.onclick=()=>{cfg.onChoose(R.options[+b.dataset.i],f)});
  const back=slot=>{st.phase='compose';st.focus=slot||'';save();cmAsk(cfg);if(slot){const el=$(`.cm-chip[data-s="${slot}"]`);el&&el.scrollIntoView({block:'center'})}};
  $('#cm-revise').onclick=()=>back();$$('.cm-g').forEach(b=>b.onclick=()=>back(b.dataset.slot))}
