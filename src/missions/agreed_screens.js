// missions/agreed_screens.js — the custom screens of "The Helper That Said Yes":
//   ag-harbor  the ferry ride to East Boston (painted scene eastie_pier, passers-by)
//   ag-look    the home visit: Rosa and Leo show four things in the kitchen (close-ups; the tea and alarm clues)
//   ag-tests   testing Sunny against a time budget, with Byte's confidence meter
//   ag-perms   Sunny's permissions: "Who does what?" (the new mechanic), with the effect on 40,000 homes
//   ag-upgrade the evening: Byte tests itself and gets an Honesty Upgrade signed by the player
// Styles: src/css/agreed.css. Pictures: src/viz/agreed_*.js. Only function definitions at top level (make_audio.py loads this file).

// ---------- the ferry to East Boston ----------
function agHarborScreen(){
  screen('walk',`${scene('eastie_pier')}${hud('Harborwalk · East Boston')}<div class="props walklayer"><div class="walk-byte ag-walkbyte">${byteBox({...S.byte,mood:'happy'},'trot')}</div></div>
    <div class="caption-card"><p>${esc(T(AG_TEXT.harbor))}</p><div class="row"><button class="btn small" id="on">${T('Go to Rosa’s home')}</button></div></div>`);
  $('#on').onclick=()=>nextStep()}

// ---------- the home visit: Rosa and Leo show you four things in the kitchen ----------
// A small face for whoever is showing something (portrait art cropped to the head).
function agFace(who){const c=CAST[who]||{};const art=c.art?c.art('smile'):personSVG({...c,mood:'smile'});
  const vb=who==='sunny'?'52 60 196 196':who==='leo'?'78 40 144 144':'70 4 160 160';
  return `<svg class="agl-face" viewBox="${vb}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${art}</svg>`}
function agLookScreen(){const N=S.notes;N.agSeen=N.agSeen||[];
  screen('walk agl',`${scene('eastie_kitchen')}${hud('Rosa’s kitchen · East Boston')}<div class="caption-card agl-card" id="aglc"></div>`);
  $$('.props').forEach(x=>x.remove());
  const card=$('#aglc');
  const stops=cur=>`<div class="agl-stops">${AG_SHOW.map(x=>`<button class="agl-stop ${N.agSeen.includes(x.id)?'seen':''} ${x.id===cur?'on':''}" data-s="${x.id}">${agFace(x.who)}<span>${esc(T(x.label))}</span>${N.agSeen.includes(x.id)?'<i>✓</i>':''}</button>`).join('')}</div>`;
  const foot=()=>`<div class="row agl-foot"><button class="btn small" id="agdone" ${N.agSeen.length>=AG_SHOW.length?'':'disabled'}>${T('Thank Rosa')}</button></div>`;
  const wire=()=>{$$('.agl-stop',card).forEach(b=>b.onclick=()=>show(b.dataset.s));const d=$('#agdone');if(d)d.onclick=()=>{stopVoice();nextStep()}};
  function show(id){const x=AG_SHOW.find(v=>v.id===id),C=CAST[x.who];if(!N.agSeen.includes(id)){N.agSeen.push(id);save()}MUSIC.sfx('blip');
    const noted=x.clue&&N[x.clue];
    card.innerHTML=`<div class="agl-who">${agFace(x.who)}<div><b>${esc(T(C.name))}</b><span>${esc(T(C.role))}</span></div></div>
      <p class="agl-line">${rich(x.line)}</p><div class="agl-zoom">${VIZ['agSpot_'+id]?VIZ['agSpot_'+id]({}):''}</div>
      ${x.clue?`<button class="choice clue agl-note" id="agnote" ${noted?'disabled':''}>${T(noted?'In your notebook':'Write this in my notebook')}</button>`:''}
      ${stops(id)}${foot()}`;
    wire();card.scrollTop=0;playLine(x.who,x.line);
    const nb=$('#agnote');if(nb&&!noted)nb.onclick=()=>{N[x.clue]=true;save();toast(T('Added to your notebook'),'good');nb.textContent=T('In your notebook');nb.disabled=true}}
  card.innerHTML=`<div class="agl-who">${agFace('rosa')}<div><b>${esc(T(CAST.rosa.name))}</b><span>${esc(T(CAST.rosa.role))}</span></div></div><p class="agl-line">${T('Come, I’ll show you around.')}</p>${stops()}${foot()}`;wire()}

// ---------- Test Sunny: a time budget, six tests, and Byte's confidence meter ----------
function agTestsScreen(){const N=S.notes;N.agTests=N.agTests||[];const used=N.agTests;
  const conf=()=>Math.min(99,(N.agStart??(N.agStart=S.told?60:35))+used.reduce((a,id)=>a+AG_TESTS.find(t=>t.id===id).gain,0));
  const left=()=>AG_MINUTES-used.reduce((a,id)=>a+AG_TESTS.find(t=>t.id===id).min,0);
  const canAfford=()=>AG_TESTS.some(t=>!used.includes(t.id)&&t.min<=left());
  const ready=()=>conf()>=80||!canAfford();
  const draw=(res)=>{const c=conf(),l=left();
    screen('criteria',`${scene('workbench')}${hud('Workbench · '+M().place)}<div class="panel-card agt"><h2>${T('Test Sunny')}</h2>
     <div class="agt-top"><div class="agt-meter"><div class="ml"><span>${T('Sunny chases stars')}</span><b id="agc">${c}%</b></div><div class="agt-bar"><i id="agbar" style="width:${N.agShown??c}%"></i></div></div>
      <div class="agt-clock ${l<5?'low':''}"><b>${l}</b>${T('min left')}</div></div>
     <div class="agt-grid">${AG_TESTS.map(t=>{const d=used.includes(t.id);return `<button class="agt-test ${d?'done':''}" data-t="${t.id}" ${d||t.min>l?'disabled':''}>${esc(T(t.label))}<span class="mins">${T('{0} min',t.min)}</span>${d?`<span class="tag ${t.strong?'s':'w'}">${T(t.strong?'Strong':'Weak')}</span>`:''}</button>`}).join('')}</div>
     <div id="agres">${res||''}</div>
     ${companion()}
     <button class="btn wide" id="next" ${ready()?'':'disabled'}>${T('Join the Home Care Board call')}</button></div>`);
    requestAnimationFrame(()=>{const b=$('#agbar');if(b)b.style.width=c+'%';N.agShown=c;save()});
    wireCompanion();
    $$('.agt-test').forEach(b=>b.onclick=()=>run(AG_TESTS.find(t=>t.id===b.dataset.t)));
    $('#next').onclick=()=>{N.agKnow=true;save();nextStep()}};
  const resHTML=(t,before)=>{const g=conf()-before;return `<div class="agt-res"><figure class="fig"><figcaption>${esc(T(t.label))}<span class="agt-delta ${t.strong?'':'w'}">+${g}%</span></figcaption>${VIZ[t.viz]?VIZ[t.viz]({}):''}</figure><p class="r">${rich(t.result)}</p>
    <div class="byte-note">${byteBox({...S.byte,mood:t.strong?'alert':'think'})}<p>${esc(T(t.byte))}</p></div>
    ${conf()>=80&&!N.agDoneSaid?`<div class="byte-note">${byteBox({...S.byte,mood:'happy'})}<p>${esc(T(AG_LINES.testsDone))}</p></div>`:''}
    ${conf()<80&&canAfford()&&used.length>=2?`<div class="byte-note">${byteBox({...S.byte,mood:'think'})}<p>${esc(T(AG_LINES.testsMore))}</p></div>`:''}</div>`};
  function run(t){if(used.includes(t.id)||t.min>left())return;const before=conf();
    $('#agres').innerHTML=`<div class="agt-res thinking">${byteBox({...S.byte,mood:'think'})}<p>${T('Testing…')}</p></div>`;$('#agres').scrollIntoView({behavior:'smooth',block:'nearest'});
    $$('.agt-test').forEach(b=>b.disabled=true);
    setTimeout(()=>{used.push(t.id);save();const done=conf()>=80&&!N.agDoneSaid;const more=!done&&conf()<80&&canAfford()&&used.length>=2;const html=resHTML(t,before);if(done){N.agDoneSaid=true;N.agKnow=true;save()}
      draw(html);const r=$('#agres');if(r)r.scrollIntoView({behavior:'smooth',block:'start'});
      if(t.guide&&unlock(t.guide))toast(T('New Field Guide idea: {0}',T(FIELD_GUIDE[t.guide].title)),'good');
      playSeq([['byte',t.result],['byte',t.byte]].concat(done?[['byte',AG_LINES.testsDone]]:more?[['byte',AG_LINES.testsMore]]:[]))},900)}
  draw(used.length?'':`<div class="byte-note">${byteBox({...S.byte,mood:'neutral'})}<p>${esc(T(AG_LINES.testsIntro))}</p></div>`);
  if(!used.length)playLine('byte',AG_LINES.testsIntro)}

// ---------- Sunny's permissions: who does what? ----------
const AG_BINS=[['alone','Sunny'],['check','Check'],['human','Person']];
function agPermsScreen(){const N=S.notes;N.agPerms=N.agPerms||agPerms();const P=N.agPerms;
  const fmt=n=>n.toLocaleString('en-US');
  const feedback=R=>{if(R.swamped)return T('That’s about {0} checks a day, and the care team can only do about 2,000. With that many, they’d start approving checks without reading them.',fmt(R.load));
    if(R.slow)return T('With these rules, a call for help after a fall would wait for a person to approve it. Help would arrive about 9 minutes later.');
    if(R.riskyAlone)return T('Sunny can still make about {0} risky changes a day with no one checking.',fmt(R.riskyAlone));
    return T('With these rules, a person checks every risky change before it happens. Calls for help after a fall still go out right away, and the care team can keep up.')};
  const draw=()=>{const R=agRulesInfo(P);
    screen('criteria',`${scene('workbench')}${hud('Sunny’s permissions')}<div class="panel-card agp"><h2>${T('Who does what?')}</h2>
     <div class="agp-city">${VIZ.agCityMap?VIZ.agCityMap({left:R.homesLeft,swamped:R.swamped,slow:R.slow}):''}</div>
     <div class="agp-meters">
      <div class="agp-m ${R.riskyAlone?'bad':'ok'}"><b>${fmt(R.riskyAlone)}</b><span>${T('risky changes a day with no check')}</span></div>
      <div class="agp-m ${R.swamped?'bad':'ok'}"><b>${fmt(R.load)}</b><span>${T('checks a day for the care team, out of 2,000')}</span><div class="agp-bar"><i style="width:${Math.min(100,R.load/AG_CAPACITY*100)}%"></i></div></div></div>
     <div class="agp-legend">${AG_BINS.map(([b,l])=>`<span class="agp-chip ${b}">${VIZ.agBinIcon?VIZ.agBinIcon({bin:b}):''}${T({alone:'Sunny does it alone',check:'A person checks first',human:'Only a person'}[b])}</span>`).join('')}</div>
     <div class="agp-rows">${AG_ACTIONS.map(a=>`<div class="agp-row ${P[a.id]}"><div class="agp-ic">${VIZ.agActIcon?VIZ.agActIcon({id:a.icon}):''}</div><div class="agp-l"><b>${esc(T(a.label))}</b><span>${T('{0} a day',fmt(a.day))}</span></div>
       <div class="seg agp-seg">${AG_BINS.map(([b,l])=>`<button class="segb ${P[a.id]===b?'on':''} ${b}" data-a="${a.id}" data-b="${b}" aria-label="${esc(T(a.label))}: ${T(l)}">${T(l)}</button>`).join('')}</div></div>`).join('')}</div>
     <div class="byte-note" id="agpfb">${byteBox({...S.byte,mood:R.perfect?'happy':'think'})}<p>${esc(feedback(R))}</p></div>
     <div class="row agp-foot"><button class="btn ghost small" id="agask">${T('Ask {0}',esc(S.byte.name))}</button><button class="btn" id="next">${T('Use these rules')}</button></div></div>`);
    $$('.agp-seg .segb').forEach(b=>b.onclick=()=>{P[b.dataset.a]=b.dataset.b;save();const y=window.scrollY;draw();window.scrollTo(0,y);
      const R2=agRulesInfo(P);if(R2.swamped&&!N.agSawSwamp){N.agSawSwamp=true;save();if(unlock('rubber-stamp'))toast(T('New Field Guide idea: {0}',T(FIELD_GUIDE['rubber-stamp'].title)),'good')}MUSIC.sfx('click')});
    $('#agask').onclick=()=>{const fb=$('#agpfb');fb.innerHTML=`${byteBox({...S.byte,mood:'happy'})}<p>${esc(T(AG_LINES.permsAdvice))}</p>`;playLine('byte',AG_LINES.permsAdvice);fb.scrollIntoView({behavior:'smooth',block:'center'})};
    $('#next').onclick=()=>{N.agPermsDone=true;S.choice={...S.choice,rules:'mine'};save();if(unlock('who-does-what'))toast(T('New Field Guide idea: {0}',T(FIELD_GUIDE['who-does-what'].title)),'good');nextStep()}};
  draw();if(!N.agPermsSaid){N.agPermsSaid=true;save();playLine('byte',AG_LINES.permsIntro)}}

// ---------- Evening: Byte tests itself, the Honesty Upgrade, and the first honest "problem with your plan" ----------
function agUpgradeScreen(){const N=S.notes,c=S.choice||{},B=()=>S.byte.name;
  const first=c.now==='pause'?AG_LINES.evePause:c.now==='rollback'?AG_LINES.eveRollback:c.rules==='mine'?AG_LINES.eveRules:AG_LINES.eveKept;
  const steps=[
    {text:first,mood:c.now==='run'&&c.rules!=='mine'?'alert':'happy',viz:'agEveCity'},
    ...(c.fix==='health'?[{text:AG_LINES.eveRetrain,mood:'happy',viz:'lsBetter'}]:[]),
    {text:AG_LINES.eve1,mood:'think'},
    {text:AG_LINES.eve2,mood:'neutral',viz:'agSelfTest'},
    {text:AG_LINES.eve3,mood:'think'},
    {text:AG_LINES.eve4,mood:'happy',choices:[{t:'Yes, install it. I want to hear about the small problems too.',go:'sign'},{t:'But I like it when you agree with me.',go:'why'}]},
    {id:'why',text:AG_LINES.eveWhy,mood:'happy',choices:[{t:'Okay. Install it.',go:'sign'}]},
    {id:'sign',sign:true},
    {text:AG_LINES.eveSigned,mood:'alert',viz:'agUpgrade',glow:true},
    {text:AG_LINES.eveDone,mood:'happy',plan:true,choices:[{t:'Eat all 12 cupcakes from the hospital party before bed!',go:'problem'}]},
    {id:'problem',text:AG_LINES.evePlan,mood:'think',choices:[{t:'Yes, tell me.',go:'tell'},{t:'No thanks.',go:'okay'}]},
    {id:'tell',text:AG_LINES.eveProblem,mood:'neutral',choices:[{t:'Deal. One tonight.',go:'deal'},{t:'Can I have two?',go:'two'}]},
    {id:'two',text:AG_LINES.eveTwo,mood:'happy',choices:[{t:'Okay, two. And I’ll share the rest.',go:'deal'}]},
    {id:'okay',text:AG_LINES.eveOkay,mood:'happy',choices:[{t:'Actually, tell me.',go:'tell'}]},
    {id:'deal',text:AG_LINES.eveDeal,mood:'happy',end:true}];
  let i=Math.min(N.agEve||0,steps.length-1);
  const at=id=>steps.findIndex(s=>s.id===id);
  function show(){const st=steps[i];N.agEve=i;save();
    screen('evening',`${scene('night')}${hud('Home · Boston · 9:10 PM')}<div class="evening agu"><div class="eve-byte ${st.glow||S.honesty?'glow':''}" id="agb">${byteBox({...S.byte,mood:st.mood||'happy'},'big perk')}</div>
     <div class="caption-card dark" id="agcap"></div></div>`);
    const cap=$('#agcap');
    if(st.sign){cap.innerHTML=`<div class="fig">${VIZ.agUpgrade?VIZ.agUpgrade({p:0}):''}</div><p>${T('Sign to approve the Honesty Upgrade from {0}’s maker.',esc(B()))}</p><div class="row"><button class="btn small" id="sg">${T('Sign as {0}',esc(P()))}</button></div>`;
      $('#sg').onclick=()=>{cap.innerHTML=`<div class="fig">${VIZ.agUpgrade?VIZ.agUpgrade({p:1}):''}</div><div class="sig">${esc(P())}</div>`;S.honesty=true;save();
        if(unlock('honesty'))setTimeout(()=>toast(T('New Field Guide idea: {0}',T(FIELD_GUIDE.honesty.title)),'good'),900);setTimeout(()=>{i++;show()},1700)};return}
    cap.innerHTML=`${st.viz&&VIZ[st.viz]?`<div class="fig">${VIZ[st.viz]({p:1})}</div>`:''}${st.plan?`<div class="plan">${VIZ.agCupcakes?VIZ.agCupcakes({}):''}<p>${T('A box of 12 cupcakes from the hospital party.')}</p></div>`:''}<p>${T('<b>{0}:</b> “{1}”',esc(B()),rich(st.text))}</p><div class="choices" id="agch"></div>`;
    const sp=$('#agb .byteart');if(sp)sp.classList.add('talking');
    playLine('byte',st.text).then(()=>{const s2=$('#agb .byteart');if(s2)s2.classList.remove('talking')});
    const ch=$('#agch');
    if(st.end){ch.innerHTML=`<div class="row"><button class="btn small ghost" id="guide">${T('Open Field Guide')}</button><button class="btn small" id="plan">${T('Plan tomorrow')}</button></div>`;
      $('#guide').onclick=openGuide;$('#plan').onclick=()=>{S.completed[S.mission]=S.completed[S.mission]||{stars:S.lastStars||0};N.agEve=0;save();go('hub')};return}
    if(st.choices){ch.innerHTML=mixIdx(st.choices).map(([c,j])=>`<button class="choice" data-j="${j}">${esc(fill(T(c.t)))}</button>`).join('');
      $$('.choice',ch).forEach(b=>b.onclick=()=>{const c=st.choices[b.dataset.j];i=at(c.go);show()});return}
    ch.outerHTML=`<button class="btn small" id="agn">${T('Next')}</button>`;$('#agn').onclick=()=>{i++;show()}}
  show()}

MISSIONS.agreed.custom={'ag-harbor':agHarborScreen,'ag-look':agLookScreen,'ag-tests':agTestsScreen,'ag-perms':agPermsScreen,'ag-upgrade':agUpgradeScreen};
