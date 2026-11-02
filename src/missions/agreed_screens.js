// missions/agreed_screens.js — the two custom screens of "The App That Agreed": testing Sunny, and Byte's Honesty Upgrade at home.
// Styles: src/css/agreed.css. Also teaches portrait() to draw non-human speakers: a CAST entry with art:'sunny' is drawn by sunnyArt(mood) from src/viz/agreed_viz_sunny.js.
(function(){const base=portrait;portrait=function(o,cls){if(o&&o.art==='sunny'&&typeof sunnyArt==='function')return `<svg class="portrait ${cls||''}" viewBox="30 0 240 360" preserveAspectRatio="xMidYMax meet" aria-label="Sunny">${sunnyArt(o.mood||'happy')}</svg>`;return base(o,cls)}})();


// ---------- Test Sunny: a time budget, six tests, and Byte's confidence meter ----------
function agTestsScreen(){const N=S.notes;N.agTests=N.agTests||[];const used=N.agTests;
  const conf=()=>Math.min(99,(N.agStart??(N.agStart=S.told?60:35))+used.reduce((a,id)=>a+AG_TESTS.find(t=>t.id===id).gain,0));
  const left=()=>AG_MINUTES-used.reduce((a,id)=>a+AG_TESTS.find(t=>t.id===id).min,0);
  const canAfford=()=>AG_TESTS.some(t=>!used.includes(t.id)&&t.min<=left());
  const ready=()=>conf()>=80||!canAfford();
  const draw=(res)=>{const c=conf(),l=left();
    screen('criteria',`${scene('workbench')}${hud('Workbench · '+M().place)}<div class="panel-card agt"><h2>Test Sunny</h2>
     <div class="agt-top"><div class="agt-meter"><div class="ml"><span>Sunny flatters</span><b id="agc">${c}%</b></div><div class="agt-bar"><i id="agbar" style="width:${N.agShown??c}%"></i></div></div>
      <div class="agt-clock ${l<5?'low':''}"><b>${l}</b>min left</div></div>
     <div class="agt-grid">${AG_TESTS.map(t=>{const d=used.includes(t.id);return `<button class="agt-test ${d?'done':''}" data-t="${t.id}" ${d||t.min>l?'disabled':''}>${esc(t.label)}<span class="mins">${t.min} min</span>${d?`<span class="tag ${t.strong?'s':'w'}">${t.strong?'Strong':'Weak'}</span>`:''}</button>`}).join('')}</div>
     <div id="agres">${res||''}</div>
     ${companion()}
     <button class="btn wide" id="next" ${ready()?'':'disabled'}>Back to Rosa’s plan</button></div>`);
    requestAnimationFrame(()=>{const b=$('#agbar');if(b)b.style.width=c+'%';N.agShown=c;save()});
    wireCompanion();
    $$('.agt-test').forEach(b=>b.onclick=()=>run(AG_TESTS.find(t=>t.id===b.dataset.t)));
    $('#next').onclick=()=>{S.told=true;save();nextStep()}};
  const resHTML=(t,before)=>{const g=conf()-before;return `<div class="agt-res"><figure class="fig"><figcaption>${esc(t.label)}<span class="agt-delta ${t.strong?'':'w'}">+${g}%</span></figcaption>${VIZ[t.viz]?VIZ[t.viz]({}):''}</figure><p class="r">${rich(t.result)}</p>
    <div class="byte-note">${byteBox({...S.byte,mood:t.strong?'alert':'think'})}<p>${esc(t.byte)}</p></div>
    ${conf()>=80&&!N.agDoneSaid?`<div class="byte-note">${byteBox({...S.byte,mood:'happy'})}<p>${esc(AG_LINES.testsDone)}</p></div>`:''}
    ${conf()<80&&!canAfford()?'':(conf()<80&&used.length>=2?`<div class="byte-note">${byteBox({...S.byte,mood:'think'})}<p>${esc(AG_LINES.testsMore)}</p></div>`:'')}</div>`};
  function run(t){if(used.includes(t.id)||t.min>left())return;const before=conf();
    $('#agres').innerHTML=`<div class="agt-res thinking">${byteBox({...S.byte,mood:'think'})}<p>Testing…</p></div>`;$('#agres').scrollIntoView({behavior:'smooth',block:'nearest'});
    $$('.agt-test').forEach(b=>b.disabled=true);
    setTimeout(()=>{used.push(t.id);save();const done=conf()>=80&&!N.agDoneSaid;const html=resHTML(t,before);if(done){N.agDoneSaid=true;S.told=true;save()}
      draw(html);const r=$('#agres');if(r)r.scrollIntoView({behavior:'smooth',block:'start'});
      if(t.guide&&unlock(t.guide))toast('New Field Guide idea: '+FIELD_GUIDE[t.guide].title,'good');
      playSeq([['byte',t.result],['byte',t.byte]].concat(done?[['byte',AG_LINES.testsDone]]:[]))},900)}
  draw(used.length?'':`<div class="byte-note">${byteBox({...S.byte,mood:'neutral'})}<p>${esc(AG_LINES.testsIntro)}</p></div>`);
  if(!used.length)playLine('byte',AG_LINES.testsIntro)}

// ---------- Evening: Byte tests itself, the Honesty Upgrade, and the first honest "problem with your plan" ----------
const AG_CUPCAKES=`<svg viewBox="0 0 120 80" aria-label="A box of twelve cupcakes"><rect x="6" y="30" width="108" height="44" rx="8" fill="#ffe3ec" stroke="#e8a3b8" stroke-width="2"/><path d="M6 34 L18 14 H102 L114 34" fill="#fff4f7" stroke="#e8a3b8" stroke-width="2" stroke-linejoin="round"/>
 ${[0,1,2,3,4,5].map(i=>{const x=16+i*17.6;return `<g transform="translate(${x} 0)"><path d="M-6 48 L-4 62 H4 L6 48Z" fill="#f5b82e"/><path d="M-7 49 C-9 40 -3 36 0 36 C3 36 9 40 7 49Z" fill="${['#ff9ab8','#fff','#c9b8ff','#ff9ab8','#9fe6d8','#fff'][i]}"/><circle cx="0" cy="36" r="2" fill="#e5484d"/></g>`}).join('')}
 <text x="60" y="27" text-anchor="middle" font-size="9" font-weight="800" fill="#b5577a" font-family="Nunito">12</text></svg>`;
function agUpgradeScreen(){const N=S.notes;const reported=S.choice&&S.choice.app==='report';const B=()=>S.byte.name;
  const steps=[
    {text:reported?AG_LINES.eveReported:AG_LINES.eveKept,mood:reported?'happy':'alert',viz:reported?'agReportForm':null},
    {text:AG_LINES.eve1,mood:'think'},
    {text:AG_LINES.eve2,mood:'neutral',viz:'agSelfTest'},
    {text:AG_LINES.eve3,mood:'think'},
    {text:AG_LINES.eve4,mood:'happy',choices:[{t:'Yes, install it. I want the truth, even about small stuff.',go:'sign'},{t:'But I like it when you agree with me.',go:'why'}]},
    {id:'why',text:AG_LINES.eveWhy,mood:'happy',choices:[{t:'Okay. Install it.',go:'sign'}]},
    {id:'sign',sign:true},
    {text:AG_LINES.eveSigned,mood:'alert',viz:'agUpgrade',glow:true},
    {text:AG_LINES.eveDone,mood:'happy',plan:true,choices:[{t:'Eat all 12 cupcakes from the hospital party before bed!',go:'problem'}]},
    {id:'problem',text:AG_LINES.evePlan,mood:'think',choices:[{t:'Yes, tell me.',go:'tell'},{t:'No thanks.',go:'okay'}]},
    {id:'tell',text:AG_LINES.eveProblem,mood:'neutral',choices:[{t:'Deal. One tonight.',go:'deal'},{t:'Can I have two?',go:'two'}]},
    {id:'two',text:AG_LINES.eveTwo,mood:'happy',choices:[{t:'Okay, two. And I’ll share the rest.',go:'deal'}]},
    {id:'okay',text:AG_LINES.eveOkay,mood:'happy',choices:[{t:'Actually, tell me.',go:'tell'}]},
    {id:'deal',text:AG_LINES.eveDeal,mood:'happy',end:true}];
  let i=N.agEve||0;
  const at=id=>steps.findIndex(s=>s.id===id);
  function show(){const st=steps[i];N.agEve=i;save();
    screen('evening',`${scene('night')}${hud('Home · Boston · 9:10 PM')}<div class="evening agu"><div class="eve-byte ${st.glow||S.honesty?'glow':''}" id="agb">${byteBox({...S.byte,mood:st.mood||'happy'},'big perk')}</div>
     <div class="caption-card dark" id="agcap"></div></div>`);
    const cap=$('#agcap');
    if(st.sign){cap.innerHTML=`<div class="fig">${VIZ.agUpgrade?VIZ.agUpgrade({p:0}):''}</div><p>Sign the Honesty Upgrade so ${esc(B())} knows it’s really from you.</p><div class="row"><button class="btn small" id="sg">Sign as ${esc(P())}</button></div>`;
      $('#sg').onclick=()=>{cap.innerHTML=`<div class="fig">${VIZ.agUpgrade?VIZ.agUpgrade({p:1}):''}</div><div class="sig">${esc(P())}</div>`;S.honesty=true;save();
        if(unlock('honesty'))setTimeout(()=>toast('New Field Guide idea: '+FIELD_GUIDE.honesty.title,'good'),900);setTimeout(()=>{i++;show()},1700)};return}
    cap.innerHTML=`${st.viz&&VIZ[st.viz]?`<div class="fig">${VIZ[st.viz]({p:1})}</div>`:''}${st.plan?`<div class="plan">${AG_CUPCAKES}<p>A box of 12 cupcakes from the hospital party.</p></div>`:''}<p><b>${esc(B())}:</b> “${rich(st.text)}”</p><div class="choices" id="agch"></div>`;
    const sp=$('#agb .byteart');if(sp)sp.classList.add('talking');
    playLine('byte',st.text).then(()=>{const s2=$('#agb .byteart');if(s2)s2.classList.remove('talking')});
    const ch=$('#agch');
    if(st.end){ch.innerHTML=`<div class="row"><button class="btn small ghost" id="guide">Open Field Guide</button><button class="btn small" id="plan">Plan tomorrow</button></div>`;
      $('#guide').onclick=openGuide;$('#plan').onclick=()=>{S.completed[S.mission]=S.completed[S.mission]||{stars:S.lastStars||0};N.agEve=0;save();go('hub')};return}
    if(st.choices){ch.innerHTML=st.choices.map((c,j)=>`<button class="choice" data-j="${j}">${esc(fill(c.t))}</button>`).join('');
      $$('.choice',ch).forEach(b=>b.onclick=()=>{const c=st.choices[b.dataset.j];i=at(c.go);show()});return}
    ch.outerHTML=`<button class="btn small" id="agn">Next</button>`;$('#agn').onclick=()=>{i++;show()}}
  show()}

MISSIONS.agreed.custom={'ag-tests':agTestsScreen,'ag-upgrade':agUpgradeScreen};
