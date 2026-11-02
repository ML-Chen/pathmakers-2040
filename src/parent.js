// parent.js — the grown-ups' progress page (Menu → For grown-ups), and the small records it reads.
// game.js calls the note*/record hooks; everything they store lives in the normal save (S):
//   S.history  [{id,t,mission,title,day,plan,stars,luck,good,conf,fc,checks,memo}]  one entry per debrief
//   S.wordLog  {word:[day,...]}   days a word was tapped (a second day counts as a review)
//   S.ideaLog  {ideaId:[missionId,...]}   missions where a Field Guide idea came up
//   S.chatLog  [{q,t,m}]   the player's last questions to Byte, newest first
//   S.chatOff  true when a grown-up has turned free chat off (Byte then uses scripted lines only)
// src/modes.js adds level, levelName and the Grown-up forecast fields to each history entry (hook "record") and its own card (hook "parent").
window.PARENT=(()=>{
  const CONF_PCT=[50,62,75,87,97];// same scale as the memo slider and calibLine() in game.js
  const CHECKS=[['treatment','Names a clear plan'],['reason','Gives a reason'],['odds','Says how sure'],['maya','Says who it is for']];
  const LUCK={'Lucky':['lucky','▲'],'As expected':['expected','●'],'Unlucky':['unlucky','▼']};
  const MAXQ=20;let gateOk=false;
  const today=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()};
  const fmtDate=t=>t?new Date(t).toLocaleDateString(I18N.locale(),{month:'short',day:'numeric'}):'';
  const starStr=n=>'★'.repeat(n)+'☆'.repeat(3-n);

  // ---------- hooks called from game.js ----------
  function noteWord(k){const L=S.wordLog=S.wordLog||{};const d=L[k]=L[k]||[];const t=today();if(!d.includes(t)){d.push(t);if(d.length>6)d.splice(1,1);save()}}
  function noteIdea(id){const L=S.ideaLog=S.ideaLog||{};const m=L[id]=L[id]||[];if(S.mission&&!m.includes(S.mission)){m.push(S.mission);save()}}
  function noteChat(q){const L=S.chatLog=S.chatLog||[];L.unshift({q:String(q).slice(0,160),t:Date.now(),m:S.mission});L.length=Math.min(L.length,MAXQ);save()}
  function chatOn(){return !S.chatOff}
  // one entry per finished mission run; re-rendering the debrief updates the same entry
  function record({stars,luck,good,checks}){if(!S.result)return;const m=M(),H=S.history=S.history||[];
    const fc=forecastFor(S.choice),ids=S.criteria.filter(x=>fc[x]!=null);
    const e={id:S.result._h||Date.now(),t:Date.now(),mission:S.mission,title:m.title,day:m.day,plan:m.planName?m.planName(S.choice):'',stars,luck,good,
      conf:CONF_PCT[S.conf??2],fc:ids.length?Math.round(100*ids.reduce((a,k)=>a*fc[k],1)):null,
      checks:Object.fromEntries(checks.map(c=>[c.k,!!c.ok])),memo:String(S.memo||'').slice(0,1200)};
    hook('record',e);const i=H.findIndex(x=>x.id===e.id);if(i>=0){e.t=H[i].t;H[i]=e}else H.push(e);S.result._h=e.id;save()}

  // ---------- data for the page ----------
  function decisions(){const H=(S.history||[]).slice().sort((a,b)=>a.t-b.t);
    // older saves: missions finished before history existed show their best stars, with luck unknown
    const seen=new Set(H.map(x=>x.mission));const old=Object.entries(S.completed||{}).filter(([id])=>!seen.has(id)&&MISSIONS[id]).map(([id,v])=>({mission:id,title:MISSIONS[id].title,day:MISSIONS[id].day,stars:v.stars||0,luck:null,t:0}));
    return old.concat(H)}

  // ---------- sections ----------
  const card=(id,title,num,body)=>`<section class="pp-card" id="pp-${id}"><div class="pp-h"><h3>${T(title)}</h3>${num!=null?`<b class="pp-n">${num}</b>`:''}</div>${body}</section>`;
  const empty=t=>`<p class="pp-empty">${T(t)}</p>`;

  function ideasCard(){const all=Object.entries(FIELD_GUIDE),L=S.ideaLog||{};
    const rows=all.map(([id,g])=>{const found=S.guide.includes(id),again=(L[id]||[]).length>1;
      const [cls,lab]=!found?['no','Not yet']:again?['again','Used again']:['yes','Found'];
      return `<li class="pp-idea ${cls}"><div><b>${esc(T(g.title))}</b><span>${esc(T(g.track))}</span></div><em>${T(lab)}</em></li>`}).join('');
    const les=Object.entries(S.lessons||{}).filter(([id])=>LESSONS[id]);
    const lesHTML=les.length?`<div class="pp-sub">${T('Learn It Fast')}</div><ul class="pp-list">${les.map(([id,r])=>`<li class="pp-idea yes"><div><b>${esc(T(LESSONS[id].title))}</b></div><em>${T('{0} of 3',r)}</em></li>`).join('')}</ul>`:'';
    return card('ideas','Field Guide',T('{0} of {1}',S.guide.length,all.length),`<ul class="pp-list">${rows}</ul>${lesHTML}`)}

  function wordsCard(){const W=S.words||[],L=S.wordLog||{};const rev=W.filter(k=>(L[k]||[]).length>1);
    const body=W.length?`<div class="pp-words">${W.map(k=>`<span class="${(L[k]||[]).length>1?'rev':''}">${esc(TW(k))}</span>`).join('')}</div>${rev.length?`<p class="pp-note"><i class="pp-key rev"></i>${T('{0} looked up again on a later day',rev.length)}</p>`:''}`:empty('Words appear here after they are tapped in a document or conversation.');
    return card('words','Word Book',W.length||null,body)}

  function writingCard(){const H=(S.history||[]).filter(x=>x.checks);if(!H.length)return card('writing','Writing',null,empty('Appears after the first signed decision.'));
    const rows=CHECKS.map(([k,lab])=>{const n=H.filter(x=>x.checks[k]).length;return `<div class="pp-meter"><span>${T(lab)}</span><div class="pp-bar"><i style="width:${Math.round(100*n/H.length)}%"></i></div><b>${T('{0} of {1}',n,H.length)}</b></div>`}).join('');
    return card('writing','Writing',null,rows)}

  function decisionsCard(){const D=decisions();if(!D.length)return card('decisions','Decisions',null,empty('Appears after the first signed decision.'));
    const avg=(D.reduce((a,x)=>a+x.stars,0)/D.length).toFixed(1);const shown=D.slice(-10);
    const cols=shown.map((x,i)=>{const L=LUCK[x.luck];return `<button class="pp-col" data-i="${D.length-shown.length+i}" aria-label="${T('Day {0}: {1} stars, {2}',x.day,x.stars,T(x.luck||'luck unknown'))}">
        <div class="pp-stars">${[2,1,0].map(s=>`<i class="${s<x.stars?'on':''}"></i>`).join('')}</div>
        <div class="pp-luck ${L?L[0]:'none'}">${L?L[1]:'–'}</div><small>${x.day}</small></button>`}).join('');
    const counts=Object.keys(LUCK).map(k=>[k,D.filter(x=>x.luck===k).length]);
    return card('decisions','Decisions',`<span class="pp-gold">★</span> ${T('{0} avg',avg)}`,`
      <div class="pp-tl"><div class="pp-rowlab"><span>${T('Stars')}</span><span>${T('Luck')}</span><span>${T('Day')}</span></div><div class="pp-cols">${cols}</div></div>
      <div class="pp-legend">${counts.map(([k,n])=>`<span><i class="pp-luck ${LUCK[k][0]}">${LUCK[k][1]}</i>${T(k)} ${n}</span>`).join('')}</div>
      <div class="pp-detail" id="pp-detail" hidden></div>
      <div class="pp-sub">${T('Calibration')}</div>${calibChart()}`)}

  // stated sureness (x) against how often plans went well (filled dot) and Byte's average forecast (ring)
  function calibChart(){const H=(S.history||[]).filter(x=>x.conf!=null);if(!H.length)return empty('Appears after the first signed decision.');
    const W=320,Ht=230,l=40,r=14,t=12,b=40,X=v=>l+(v-45)/(100-45)*(W-l-r),Y=v=>t+(1-v/100)*(Ht-t-b);
    const groups=CONF_PCT.map(p=>{const g=H.filter(x=>x.conf===p);if(!g.length)return null;const ok=g.filter(x=>x.good).length;const f=g.filter(x=>x.fc!=null);
      return {p,n:g.length,ok,rate:100*ok/g.length,fc:f.length?f.reduce((a,x)=>a+x.fc,0)/f.length:null}}).filter(Boolean);
    const grid=[0,25,50,75,100].map(v=>`<line x1="${l}" x2="${W-r}" y1="${Y(v)}" y2="${Y(v)}" class="pp-grid"/><text x="${l-6}" y="${Y(v)+4}" text-anchor="end">${v}%</text>`).join('');
    const xt=CONF_PCT.map(v=>`<text x="${X(v)}" y="${Ht-b+20}" text-anchor="middle">${v}%</text>`).join('');
    const marks=groups.map(g=>{const rad=6+Math.min(6,2*Math.sqrt(g.n-1));const ly=g.rate>=85?Y(g.rate)+rad+13:Y(g.rate)-rad-5;
      return `<g>${g.fc!=null?`<circle cx="${X(g.p)}" cy="${Y(g.fc)}" r="6" class="pp-ring"><title>${T("{0}'s forecast averaged {1}%",esc(S.byte.name),Math.round(g.fc))}</title></circle>`:''}
        <circle cx="${X(g.p)}" cy="${Y(g.rate)}" r="${rad}" class="pp-dot"><title>${T('Said {0}%: went well {1} of {2}',g.p,g.ok,g.n)}</title></circle>
        <text x="${X(g.p)}" y="${ly}" text-anchor="middle" class="pp-dl">${T('{0} of {1}',g.ok,g.n)}</text></g>`}).join('');
    const svg=`<svg class="pp-cal" viewBox="0 0 ${W} ${Ht}" role="img" aria-label="${T('Calibration chart')}">${grid}
      <line x1="${X(50)}" y1="${Y(50)}" x2="${X(100)}" y2="${Y(100)}" class="pp-diag"/>${xt}
      <text x="${(l+W-r)/2}" y="${Ht-4}" text-anchor="middle" class="pp-ax">${T('How sure, as said')}</text>${marks}</svg>`;
    const sum=f=>H.reduce((a,x)=>a+f(x),0)/H.length;const fH=H.filter(x=>x.fc!=null);const said=Math.round(sum(x=>x.conf));
    const odds=fH.length?Math.round(fH.reduce((a,x)=>a+x.fc,0)/fH.length):null;
    const bn=esc(S.byte.name);const verdict=odds==null?'':Math.abs(said-odds)<=15?T("Well calibrated: said {said}% on average, and {bn}'s forecasts averaged {odds}%.",{said,bn,odds}):said>odds?T("More sure than the odds: said {said}% on average, while {bn}'s forecasts averaged {odds}%.",{said,bn,odds}):T("Less sure than the odds: said {said}% on average, while {bn}'s forecasts averaged {odds}%.",{said,bn,odds});
    return `${svg}<div class="pp-legend"><span><i class="pp-k dot"></i>${T('Went well')}</span><span><i class="pp-k ring"></i>${T("{0}'s forecast",esc(S.byte.name))}</span><span><i class="pp-k diag"></i>${T('Perfectly calibrated')}</span></div>${verdict?`<p class="pp-note">${verdict}</p>`:''}`}

  function portfolioCard(){const H=(S.history||[]).filter(x=>x.memo&&x.memo.trim()).slice().sort((a,b)=>b.t-a.t);
    if(!H.length)return card('portfolio','Portfolio',null,empty('Signed decisions are saved here.'));
    return card('portfolio','Portfolio',H.length,H.map((x,i)=>`<article class="pp-memo" ${i>=3?'hidden':''}><div class="pp-memo-h"><b>${esc(T(x.title))}</b><span>${fmtDate(x.t)}</span></div>
      ${x.plan?`<div class="pp-plan">${esc(T(x.plan))} <span class="pp-gold">${starStr(x.stars)}</span></div>`:''}<blockquote>${esc(x.memo)}</blockquote></article>`).join('')+
      (H.length>3?`<button class="mini-btn" id="pp-more">${T('Show all {0}',H.length)}</button>`:''))}

  function chatCard(){const L=S.chatLog||[];
    const qs=L.length?`<ul class="pp-qs">${L.map(x=>`<li><p>${esc(x.q)}</p><span>${fmtDate(x.t)}</span></li>`).join('')}</ul><button class="mini-btn" id="pp-clear">${T('Clear questions')}</button>`:empty(T('Questions to {0} appear here.',esc(S.byte.name)));
    return card('chat',T('Talking with {0}',esc(S.byte.name)),null,`<div class="pp-switch"><span id="pp-swl">${T('Free chat')}</span><button class="pp-tog ${chatOn()?'on':''}" id="pp-tog" role="switch" aria-checked="${chatOn()}" aria-labelledby="pp-swl"><i></i></button></div>
      <p class="pp-note" id="pp-swnote">${T(chatOn()?'{0} answers anything, using AI.':'{0} answers with scripted lines only.',esc(S.byte.name))}</p>${keyBox()}<div class="pp-sub">${T('Recent questions')}</div>${qs}`)}
  // Outside Claude.ai, live chat needs a grown-up's own Anthropic API key (kept on this device only).
  function keyBox(){if(window.claude&&window.claude.use||typeof liveKey!=='function')return '';const k=liveKey();
    return `<div class="pp-sub">${T('Live chat on this device')}</div><p class="pp-note">${T(k?'Connected with your API key. It is stored only on this device.':'Without a key, {0} uses scripted lines. Paste an Anthropic API key to turn on live answers. It stays on this device, and use is billed to that key, so set a low spending limit.',esc(S.byte.name))}</p>
      <div class="row"><input id="pp-key" type="password" autocomplete="off" placeholder="${T(k?'Key saved':'sk-ant-...')}" style="flex:1;min-width:0"><button class="btn small" id="pp-keysave">${T('Save')}</button>${k?`<button class="btn small ghost" id="pp-keydel">${T('Remove')}</button>`:''}</div>`}


  // ---------- page and gate ----------
  function page(){$$('.pp').forEach(x=>x.remove());const d=document.createElement('div');d.className='pp';d.setAttribute('role','dialog');d.setAttribute('aria-label',T('Progress'));
    d.innerHTML=`<div class="pp-in"><div class="pp-top"><h2>${T('{0}’s progress',esc(P()))}</h2><button class="x" aria-label="${T('Close')}">×</button></div>
      ${ideasCard()}${wordsCard()}${writingCard()}${decisionsCard()}${portfolioCard()}${chatCard()}</div>`;
    document.body.appendChild(d);requestAnimationFrame(()=>d.classList.add('on'));
    $('.x',d).onclick=()=>{d.classList.remove('on');setTimeout(()=>d.remove(),250)};
    const D=decisions();$$('.pp-col',d).forEach(b=>b.onclick=()=>{const x=D[+b.dataset.i],box=$('#pp-detail',d);$$('.pp-col',d).forEach(c=>c.classList.toggle('sel',c===b));box.hidden=false;
      box.innerHTML=`<b>${T('Day {0}',x.day)} · ${esc(T(x.title))}</b>${x.plan?`<span>${esc(T(x.plan))}</span>`:''}<span><span class="pp-gold">${starStr(x.stars)}</span> · ${x.luck?esc(T(x.luck))+T(x.good?' · went well':' · did not go well'):T('luck not recorded')}${x.conf!=null?T(' · said {0}% sure',x.conf):''}${x.fc!=null?T(" · {0}'s forecast {1}%",esc(S.byte.name),x.fc):''}${x.levelName?` · ${esc(T(x.levelName))}`:''}</span>`});
    const more=$('#pp-more',d);if(more)more.onclick=()=>{$$('.pp-memo',d).forEach(a=>a.hidden=false);more.remove()};
    wireChat(d);hook('parent',d)}
  function wireChat(d){const ks=$('#pp-keysave',d),kd=$('#pp-keydel',d);if(ks)ks.onclick=()=>{const v=$('#pp-key',d).value.trim();if(!v)return;setLiveKey(v);toast(T('Key saved on this device'),'good');d.remove();page()};if(kd)kd.onclick=()=>{setLiveKey('');d.remove();page()};
  const tog=$('#pp-tog',d);tog.onclick=()=>{S.chatOff=!S.chatOff;save();tog.classList.toggle('on',chatOn());tog.setAttribute('aria-checked',chatOn());
      $('#pp-swnote',d).textContent=T(chatOn()?'{0} answers anything, using AI.':'{0} answers with scripted lines only.',esc(S.byte.name))};
    const clr=$('#pp-clear',d);if(clr)clr.onclick=()=>{S.chatLog=[];save();$('#pp-chat',d).outerHTML=chatCard();wireChat(d)}}
  // a light grown-ups gate: a two-digit multiplication question, asked once per visit
  function open(skipGate){if(gateOk||skipGate){gateOk=true;page();return}
    const a=12+Math.floor(Math.random()*8),b=13+Math.floor(Math.random()*7);
    const d=sheet(T('For grown-ups'),`<form class="pp-gate" id="pp-gate"><label class="lbl" for="pp-ans">${T('What is {0} × {1}?',a,b)}</label><div class="row"><input id="pp-ans" inputmode="numeric" autocomplete="off" maxlength="4"><button class="btn small" type="submit">${T('Open')}</button></div></form>`);
    const inp=$('#pp-ans',d);setTimeout(()=>inp.focus(),300);
    $('#pp-gate',d).onsubmit=e=>{e.preventDefault();if(+inp.value===a*b){gateOk=true;d.remove();page()}else{inp.value='';inp.focus();inp.classList.remove('shake');void inp.offsetWidth;inp.classList.add('shake')}}}
  return {noteWord,noteIdea,noteChat,chatOn,record,open}
})();
