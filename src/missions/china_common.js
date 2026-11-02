// china_common.js — screens shared by the three China travel visits: "The Sister Hospital" (sisterhospital.js,
// Shanghai), "Trust, Then Check" (treatytalks.js, Beijing) and "Who Can Stop a Crew?" (robotfactory.js, Shenzhen).
// Not a mission itself. Top level is plain function definitions (no DOM), so tools/make_audio.py can evaluate it; the
// lines these screens speak belong to the calling mission's `lines`. Classes are prefixed "zh-" (src/css/china.css).
//   zhSt(key)        the visit's working state in S.notes (startMission resets it, so a replay starts fresh)
//   zhLine(o)        one face-to-face line whose words depend on what the player chose earlier
//   zhSign(o)        the signed decision: a short note in the player's words, signed by the player and a partner
//   zhDebrief(o)     stars for the visit (Ask, Decision, Heart), recorded on the grown-ups' page
//   zhPlace(c)       the place card a visit's first screen shows (city name, its Chinese name and the local time)
function zhSt(key){S.notes=S.notes||{};return S.notes[key]=S.notes[key]||{}}

// o: {scene, place, who, mood, text, choices:[{t, reply, mood, good, on()}], btn, next(), dim}
function zhLine(o){const c=o.who==='byte'?{name:S.byte.name,role:T('Your AI partner')}:CAST[o.who]||{};
  screen('talk zh-line',`${scene(o.scene)}<div class="talk-dim"></div>${hud(o.place)}<div class="stage" id="stage">${speakerArt(o.who,o.mood||'smile')}</div>
    <div class="subtitle zh-sub"><div class="who"><b>${esc(T(c.name||''))}</b><span>${esc(T(c.role||''))}</span></div><p id="zl-line">${rich(o.text)}</p>
    <div class="choices" id="zl-ch">${(o.choices||[]).length?mixIdx(o.choices).map(([x,j])=>`<button class="choice" data-j="${j}">${esc(T(x.t))}</button>`).join(''):''}</div>
    <div class="row zh-go"><button class="btn small" id="zl-go" ${(o.choices||[]).length?'hidden':''}>${esc(T(o.btn||'Continue'))}</button></div></div>`);
  const sp=$('.speaker');sp&&sp.classList.add('enter','talking');playLine(o.who,o.text).then(()=>sp&&sp.classList.remove('talking'));
  $$('#zl-ch .choice').forEach(b=>b.onclick=()=>{const x=o.choices[+b.dataset.j];if(x.good&&o.who!=='byte')heart(o.who);if(x.on)x.on();
    $('#zl-line').innerHTML=rich(x.reply);$('#zl-ch').innerHTML='';$('#zl-go').hidden=false;$('#stage').innerHTML=speakerArt(o.who,x.mood||o.mood||'smile');playLine(o.who,x.reply)});
  $('#zl-go').onclick=()=>o.next?o.next():nextStep()}

// o: {scene, place, title, plan (html), starters:[...], placeholder, partner:{who, name, zh, role}, seal (Chinese characters for a red seal, optional),
//     signAs, done:'line under the signatures', onSign(text)}
function zhSign(o){const st=zhSt('sign');st.text=st.text||'';const signed=!!st.signed;
  const pt=o.partner||{},pc=CAST[pt.who]||{};
  screen('criteria zh-sign',`${scene(o.scene)}${hud(o.place)}<div class="panel-card zh-signcard"><h2>${esc(T(o.title))}</h2>
    <div class="zh-plan">${o.plan}</div>
    <div class="starters">${o.starters.map(s=>`<button class="mini-btn" data-s="${esc(T(s))}">${esc(T(s).trim())}…</button>`).join('')}</div>
    <textarea id="zh-note" rows="3" maxlength="400" placeholder="${esc(T(o.placeholder||''))}">${esc(st.text)}</textarea>
    <div class="zh-sigs"><div class="zh-sig me ${signed?'on':''}"><i>${signed?esc(T(o.signAs||'{0}',P())):''}</i><span>${esc(P())}</span></div>
      <div class="zh-sig them ${signed?'on':''}"><i>${signed?`<b lang="zh">${esc(pt.zh||'')}</b>`:''}</i><span>${esc(T(pt.name||pc.name||''))}</span>${o.seal&&signed?`<em class="zh-seal" lang="zh">${esc(o.seal)}</em>`:''}</div></div>
    <button class="btn wide" id="zh-signbtn">${signed?esc(T('Continue')):esc(T('Sign together'))}</button></div>`);
  wireMics&&wireMics();const ta=$('#zh-note');ta.oninput=()=>{st.text=ta.value;save()};
  $$('[data-s]').forEach(b=>b.onclick=()=>{ta.value=(ta.value&&!/\s$/.test(ta.value)?ta.value+' ':ta.value)+b.dataset.s;st.text=ta.value;save();ta.focus()});
  $('#zh-signbtn').onclick=()=>{if(st.signed){nextStep();return}
    if(ta.value.trim().length<12){toast(T('Write a sentence or two in your own words first.'));return}
    st.text=ta.value.trim();st.signed=1;S.memo=st.text;S.consent=true;save();o.onSign&&o.onSign(st.text);MUSIC.sfx&&MUSIC.sfx('chime');
    const sig=document.createElement('div');sig.className='signing zh-signing';
    sig.innerHTML=`<div class="sigcard"><div class="sigline">${esc(T(o.signAs||'{0}',P()))}</div><div class="sigline zh-pen" lang="zh">${esc(pt.zh||'')}</div>${o.seal?`<em class="zh-seal big" lang="zh">${esc(o.seal)}</em>`:''}<p>${esc(T(o.done||'Signed by both of you.'))}</p></div>`;
    document.body.appendChild(sig);setTimeout(()=>{sig.remove();nextStep()},2100)}}

// o: {scene, place, stars:{ask, decision, heart}, items:[{star:'ask'|'decision'|'heart', ok, text}], byte, btn, plan}
function zhDebrief(o){const SB=starsFrom(o.stars);S.lastStars=SB.stars;
  screen('debrief zh-deb',`${scene(o.scene)}<div class="talk-dim"></div>${hud(o.place||'Debrief')}<div class="panel-card debrief">
    <h2>${T('How you did')}</h2><div class="scores"><div class="score">${starRow(SB)}<b>${T('Stars')}</b><span>${T('For the questions you asked, the plan you chose and the people you looked after')}</span></div></div>
    <ul class="dlist">${o.items.map(x=>`<li class="${x.ok?'ok':''}">${starIcon(x.star,x.ok)}${esc(T(x.text))}</li>`).join('')}</ul>
    <div class="byte-note">${byteBox({...S.byte,mood:'happy'})}<p>${esc(T(o.byte))}</p></div>
    <div class="earned"><span>${T('{0} Field Guide ideas',S.guide.length)}</span><span>${T('{0} new words',S.words.length)}</span><span>${T('{0} hearts',Object.values(S.hearts).reduce((a,b)=>a+b,0))}</span></div>
    <button class="btn wide" id="next">${esc(T(o.btn||'Head out for the evening'))}</button></div>`);
  $('#next').onclick=()=>{awardStars(S.mission,SB);S.result=S.result||{kind:'done',flags:{}};
    try{window.PARENT&&PARENT.record({stars:SB.stars,luck:'As expected',good:true,checks:[]})}catch(e){}nextStep()}}

// A portrait with signature details on top of the standard one (personSVG): chest (a pin or badge, drawn over the
// clothes), top (drawn over the hair, e.g. glasses pushed up) and face (under the mouth, e.g. smile lines).
function zhArt(o,mood,x){x=x||{};let s=personSVG({...o,art:undefined,mood});
  if(x.face)s=s.replace('<g class="p-mouth">',x.face+'<g class="p-mouth">');
  if(x.chest)s=s.replace('<g class="p-head">',x.chest+'<g class="p-head">');
  if(x.top){const i=s.lastIndexOf('</g></g></g>');if(i>0)s=s.slice(0,i)+x.top+s.slice(i)}
  return s}
// a small place card for a visit's first screen: {name, zh, time}
function zhPlace(c){return `<div class="zh-placecard"><b>${esc(T(c.name))}</b><span lang="zh">${esc(c.zh)}</span><i>${esc(T(c.time||''))}</i></div>`}
