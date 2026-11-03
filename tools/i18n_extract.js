// Find every string a player can see that has no translation yet, per mission:
//   node tools/i18n_extract.js dist/pathmakers.html [outDir=/tmp/pm-i18n] [--lang zh] [--strict]
// It loads the built page in the target language and collects strings three ways:
//  1. the sources: every literal passed to T(...) in src/ (interface text, toasts, labels, SVG labels);
//  2. the content: every visible field of every mission (talks, documents, captions, glossary, cast, Field Guide,
//     lessons, chatter, criteria, controls, consent, memo, reveal), plus the text built by mission functions
//     (planName, outcomes, why, consent.opts, trap, evening) for every plan, with and without each clue;
//  3. the screens: it plays every mission and opens every sheet (menu, Field Guide, Word Book, chat, lessons, the
//     grown-ups' page), records every T() lookup, and scans the visible page for English words that never went
//     through T() at all ("leaks").
// Output in outDir: i18n_report.md (read this), i18n_report.json, and missing/<lang>_<id>.js stubs listing each
// untranslated string, ready to fill in and paste into src/i18n/<lang>/<id>.js. --strict exits 1 if anything is missing.
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const argv=process.argv.slice(2),flag=k=>argv.includes(k),opt=(k,d)=>{const i=argv.indexOf(k);return i>=0?argv[i+1]:d};
const LG=opt('--lang','zh'),pos=argv.filter((a,i)=>!a.startsWith('--')&&argv[i-1]!=='--lang');
const html=pos[0]||'dist/pathmakers.html',out=pos[1]||'/tmp/pm-i18n';
const ROOT=path.resolve(__dirname,'..'),SRC=path.join(ROOT,'src');

// ---------- 1. literal T() keys in the sources, and which file (bucket) each string belongs to ----------
const walk=d=>fs.existsSync(d)?fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]):[];
const files=walk(SRC).filter(f=>f.endsWith('.js')&&!/[\\/](audio|i18n)[\\/]|audio\.js$|music_tracks\.js$/.test(f));
function bucketOf(rel){rel=rel.replace(/\\/g,'/');
  if(/^(game|parent|props|i18n|music|build)\.js$/.test(rel))return 'core';
  if(rel==='ledger.js')return 'ledger';if(rel==='career.js')return 'hired';  // the Ledger app; the career-journey screens (Getting Hired, Grand Rounds)
  if(/^(content_boston|missions|infog|art|characters|paint_boston)\.js$/.test(rel))return 'maya';
  const m=/^(missions|viz|scenes)\/([a-z0-9]+)/i.exec(rel);return m?m[2].toLowerCase():'core'}
function unesc(s){return s.replace(/\\(u\{([0-9a-f]+)\}|u([0-9a-f]{4})|x([0-9a-f]{2})|n|t|r|(.))/gi,(m,a,b,c,d,e)=>b?String.fromCodePoint(parseInt(b,16)):c?String.fromCharCode(parseInt(c,16)):d?String.fromCharCode(parseInt(d,16)):a==='n'?'\n':a==='t'?'\t':a==='r'?'\r':e)}
// Scan a JS source for string literals, including those inside ${...} of template literals; returns [{start,end,q,dyn,body}].
// Comments and regex literals are skipped so quotes inside them are not read as strings.
function literals(src){const L=[];
  const regexAt=i=>{let k=i-1;while(k>=0&&/\s/.test(src[k]))k--;const prev=k<0?'':src[k],word=/[\w$]+$/.exec(src.slice(Math.max(0,k-8),k+1));
    if(!(!prev||'(,=:[!&|?{};+-*%<>~^'.includes(prev)||(word&&/^(return|typeof|case|in|of|void)$/.test(word[0]))))return -1;
    let j=i+1,cls=false;while(j<src.length&&src[j]!=='\n'){if(src[j]==='\\')j++;else if(src[j]==='[')cls=true;else if(src[j]===']')cls=false;else if(src[j]==='/'&&!cls)return j;j++}return -1};
  const tmpl=s=>{let j=s+1,dyn=false;while(j<src.length&&src[j]!=='`'){if(src[j]==='\\'){j+=2;continue}if(src[j]==='$'&&src[j+1]==='{'){dyn=true;j=code(j+2,true)+1;continue}j++}
    L.push({start:s,end:j,q:'`',dyn,body:src.slice(s+1,j)});return j};
  const code=(j,inExpr)=>{let d=0;for(;j<src.length;j++){const ch=src[j];
    if(ch==='/'&&src[j+1]==='/'){const e=src.indexOf('\n',j);j=e<0?src.length:e;continue}
    if(ch==='/'&&src[j+1]==='*'){const e=src.indexOf('*/',j+2);j=e<0?src.length:e+1;continue}
    if(ch==='/'){const e=regexAt(j);if(e>0){j=e;continue}}
    if(ch==='\''||ch==='"'){let k=j+1;while(k<src.length&&src[k]!==ch&&src[k]!=='\n'){if(src[k]==='\\')k++;k++}L.push({start:j,end:k,q:ch,dyn:false,body:src.slice(j+1,k)});j=k;continue}
    if(ch==='`'){j=tmpl(j);continue}
    if(ch==='{')d++;else if(ch==='}'){if(inExpr&&d===0)return j;d--}}return j};
  code(0,false);return L.sort((a,b)=>a.start-b.start)}
const looksText=s=>/[A-Z]|\s|[.!?,:;’'“”…]/.test(s)&&/[A-Za-z]{2}/.test(s)&&!/^[#\d.\s%(),a-z-]*$/.test(s)&&!/^[a-z]+(-[a-z]+)*$/.test(s);
const SOURCE_KEYS={},SRC_TEXT={};
for(const f of files){const rel=path.relative(SRC,f),src=fs.readFileSync(f,'utf8'),b=bucketOf(rel);SRC_TEXT[rel]=unesc(src);
  if(/^(characters|paint_boston)\.js$|^scenes[\\/]/.test(rel))continue;  // these files have their own local T() helpers
  const lits=literals(src),byStart=new Map(lits.map(l=>[l.start,l]));
  // T( calls: the first argument's literal(s). A lone literal is always a key; literals inside an expression (a ? 'x' : 'y') count when they look like text.
  const re=/(^|[^\w$.])T\(/g;let m;while((m=re.exec(src))){let i=m.index+m[0].length,depth=1,firstEnd=-1;const inArg=[];
    while(i<src.length&&depth){const lit=byStart.get(i);if(lit){if(firstEnd<0)inArg.push(lit);i=lit.end+1;continue}
      const ch=src[i];if(ch==='('||ch==='['||ch==='{')depth++;else if(ch===')'||ch===']'||ch==='}')depth--;else if(ch===','&&depth===1&&firstEnd<0)firstEnd=i;i++}
    const lone=inArg.length===1&&src.slice(m.index+m[0].length,(firstEnd>0?firstEnd:i-1)).trim().length===inArg[0].body.length+2;
    for(const l of inArg){if(l.dyn)continue;const s=unesc(l.body);if(lone||looksText(s))(SOURCE_KEYS[s]=SOURCE_KEYS[s]||new Set()).add(b)}}}
function literalBucket(s){for(const rel in SRC_TEXT)if(SRC_TEXT[rel].includes(s))return bucketOf(rel);return null}

// ---------- 2 and 3: in the page ----------
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];
  p.on('pageerror',e=>errs.push('pageerror: '+e.message));
  await p.addInitScript(()=>{window.__noaudio=1;try{localStorage.clear()}catch(e){}});
  await p.goto('file://'+path.resolve(html));await p.waitForTimeout(300);
  const R=await p.evaluate(async LG=>{
    const rec={},dyn=[],leaks=[],sleep=ms=>new Promise(r=>setTimeout(r,ms));let CTX='core',WHERE='';
    const note=(s,found,kind,stat)=>{if(typeof s!=='string'||!s.trim())return;const r=rec[s]||(rec[s]={s,found:false,kind,ctx:[],where:[],stat:false});r.found=r.found||found;if(!r.ctx.includes(CTX))r.ctx.push(CTX);if(WHERE&&!r.where.includes(WHERE)&&r.where.length<4)r.where.push(WHERE);if(stat)r.stat=true};
    I18N.trace=(s,found,kind)=>note(s,found,kind,false);
    S.lang=LG;S.mute=true;S.pinyin=false;I18N.sync();
    const TAB=I18N.tab[LG]||{};const W=s=>{if(typeof s==='string'&&s.trim()&&!/^[\s\d.,%:+\-–—·()/]*$/.test(s))note(s,TAB[s]!=null,'text',true)};
    // English words allowed on screen: those that the translations themselves keep (names like Byte, codes like HX-2).
    const allowed=new Set(['pm1']);const addWords=t=>(String(t).replace(/<[^>]+>/g,' ').match(/[A-Za-z][A-Za-z0-9'’-]*/g)||[]).forEach(w=>allowed.add(w.toLowerCase()));
    Object.values(TAB).forEach(addWords);Object.values(I18N.gloss[LG]||{}).forEach(g=>{addWords(g.w);addWords(g.d)});
    const engWords=t=>(String(t).replace(/<[^>]+>/g,' ').replace(/&[a-z#0-9]+;/gi,' ').match(/[A-Za-z][A-Za-z'’-]+/g)||[]).filter(w=>!allowed.has(w.toLowerCase())&&!allowed.has(w.toLowerCase().replace(/['’]s$/,'')));
    const leakText=(kind,text)=>{const w=engWords(text);if(w.length)dyn.push({ctx:CTX,kind,text:String(text).replace(/<[^>]+>/g,'').slice(0,200),words:[...new Set(w)].slice(0,8)})};
    const svgText=svg=>{const d=document.createElement('div');d.innerHTML=svg;return [...d.querySelectorAll('text,title')].map(t=>t.textContent).join(' · ')};
    function scan(){const seen=new Set();const add=t=>{t=t.replace(/\s+/g,' ').trim();if(!t||seen.has(t))return;const w=engWords(t);if(w.length){seen.add(t);leaks.push({ctx:CTX,where:WHERE,text:t.slice(0,160),words:[...new Set(w)].slice(0,6)})}};
      const tw=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);while(tw.nextNode()){const n=tw.currentNode,e=n.parentElement;if(!e||e.closest('script,style,textarea,rt,[data-nopy],.i18n-pills,.i18n-seg'))continue;if(e.checkVisibility&&!e.checkVisibility())continue;add(n.nodeValue)}
      document.querySelectorAll('[placeholder],[aria-label]').forEach(e=>{if(e.closest('.i18n-pills,.i18n-seg'))return;if(e.checkVisibility&&!e.checkVisibility())return;add(e.getAttribute('placeholder')||'');add(e.getAttribute('aria-label')||'')})}
    const lessonStrings=L=>{W(L.title);(L.steps||[]).forEach(s=>{W(s.t);W(s.cap)});(L.quiz||[]).forEach(q=>{W(q.q);(q.opts||[]).forEach(W);W(q.why)})};
    const owned={cast:new Set(),guide:new Set(),lessons:new Set(),glossary:{}};
    const glossNeed=[];
    // ----- content of every mission -----
    for(const [id,m] of Object.entries(MISSIONS)){CTX=id;WHERE='content';
      ['title','blurb','place','eveningPlace','criteriaHint','criteriaNote','byteGood','byteBad'].forEach(k=>W(m[k]));
      (m.flow||[]).forEach(f=>{W(f.place);W(f.toast)});
      for(const k in (m.talks||{}))for(const L of m.talks[k]){W(L.text);(L.choices||[]).forEach(c=>{W(c.t);W(c.reply)});if(L.who!=='byte'&&!(I18N.voices[LG]||{})[L.who])glossNeed.push({ctx:id,voice:L.who})}
      for(const d of (m.docs||[])){W(d.title);W(d.from);for(const st of d.steps||[]){W(st.t);W(st.cap);if(st.args){W(st.args.label);W(st.args.sub)}if(st.alt){W(st.alt.t);W(st.alt.cap);if(st.alt.args)W(st.alt.args.label)}
        try{if(VIZ[st.viz])leakText('picture '+st.viz,svgText(VIZ[st.viz](st.args||{})));if(st.alt&&VIZ[st.alt.viz||st.viz])leakText('picture '+(st.alt.viz||st.viz),svgText(VIZ[st.alt.viz||st.viz]({...(st.args||{}),...(st.alt.args||{})})))}catch(e){}}}
      for(const k in (m.react||{}))if(typeof m.react[k]==='string')W(m.react[k]);
      if(m.lesson)W(m.lesson.label);if(m.tell){W(m.tell.label);W(m.tell.note)}
      (m.criteria||[]).forEach(c=>W(c.label));(m.controls||[]).forEach(c=>{W(c.label);c.opts.forEach(o=>W(o[1]))});
      if(m.consent)['title','role','prompt','place'].forEach(k=>W(m.consent[k]));
      if(m.memo){(m.memo.starters||[]).forEach(W);['placeholder','careLabel','planLabel'].forEach(k=>W(m.memo[k]));if(typeof m.memo.signAs==='string')W(m.memo.signAs+'{0}');
        ['plan','care'].forEach(k=>{if(m.memo[k]instanceof RegExp)TRX(m.memo[k])})}
      if(m.reveal){for(const k in (m.reveal.lines||{}))W(m.reveal.lines[k]);W(m.reveal.unit)}
      for(const k in (m.cast||{})){owned.cast.add(k);W(m.cast[k].name);W(m.cast[k].role)}
      for(const k in (m.guide||{})){owned.guide.add(k);['title','track','text','real'].forEach(x=>W(m.guide[k][x]))}
      for(const k in (m.lessons||{})){owned.lessons.add(k);lessonStrings(m.lessons[k])}
      for(const k in (m.chatter||{}))m.chatter[k].forEach(W);
      (m.lines||[]).forEach(x=>W(x.text));
      for(const k in (m.glossary||{}))owned.glossary[k]=id;
      if(typeof CAREERS!=='undefined'&&CAREERS[m.career])W(CAREERS[m.career].name);
      // career journeys and big talks (src/career.js): every text in m.journey, m.bigtalk and m.promotion, and the lines built for each case
      {const SK=new Set(['scene','who','mood','art','viz','if','key','k','judge','check','heur','career','to','at','boss','guide','notes','people','id','rank','kind']);
        const walkW=(o,dp=0)=>{if(dp>7||o==null)return;if(typeof o==='string'){W(o);return}if(Array.isArray(o)){o.forEach(x=>walkW(x,dp+1));return}
          if(typeof o==='object')for(const k in o){if(SK.has(k))continue;let v;try{v=o[k]}catch(e){continue}if(typeof v!=='function')walkW(v,dp+1)}};
        ['journey','bigtalk','promotion'].forEach(k=>{try{walkW(m[k])}catch(e){}});
        const B=m.bigtalk;if(B){for(const c of Object.values(B.cases||{}).concat(B.fallback?[B.fallback]:[]))for(const memo of ['','I chose this plan.']){const ctx={...c,plan:'',memo,byte:'Byte'};
          for(const b of B.beats||[])for(const o of b.opts||[])if(typeof o.t==='function')try{leakText('big talk option',o.t(ctx))}catch(e){}
          for(const o of (B.question&&B.question.opts)||[])if(typeof o.t==='function')try{leakText('big talk answer',o.t(ctx))}catch(e){}}}
        const J=m.journey;if(J&&J.interview){const ctxs=[J.interview.context?J.interview.context():{},{bad:true},{bad:false}];
          for(const ctx of ctxs)for(const Q of J.interview.questions||[])for(const o of Q.opts||[])if(typeof o.t==='function')try{leakText('interview option',o.t(ctx))}catch(e){}
          if(J.firstday&&J.firstday.end&&typeof J.firstday.end.text==='function')try{leakText('first day',J.firstday.end.text({remembered:2}))}catch(e){}}}
      // text built by the mission's functions, for every plan, with and without each clue
      Object.assign(S,MISSION_FIELDS());S.mission=id;S.choice={...(m.start||{})};let plans=[S.choice];try{plans=allPlans()}catch(e){}
      for(const told of [false,true])for(const crate of [false,true]){S.told=told;S.notes={crate};WHERE='functions';
        for(const c of plans){S.choice=c;const tryit=(kind,f)=>{try{const v=f();if(typeof v==='string')leakText(kind,v);return v}catch(e){return null}};
          tryit('planName',()=>m.planName&&m.planName(c));tryit('why',()=>m.why&&m.why(c));
          try{(m.outcomes(c,m.knows?m.knows():told)||[]).forEach(o=>{W(o.cap);try{leakText('picture '+o.kind,svgText(vig(o.kind)))}catch(e){}})}catch(e){}
          try{m.consent.opts(c,m).forEach(o=>{leakText('consent option',o.t);W(o.reply)})}catch(e){}
          tryit('trap',()=>m.trap&&m.trap(c).text)}
        try{(m.evening?m.evening():[]).forEach(l=>leakText('evening',l))}catch(e){}}}
    // ----- the Ledger news app (src/ledger.js): stories (a story declared by a mission belongs to that mission), Byte's lines, ideas and words -----
    if(typeof LEDGER!=='undefined'){for(const st of LEDGER.list){CTX=st.mission||'ledger';WHERE='content';['title','place','by','org','check'].forEach(k=>W(st[k]));if(st.link)W(st.link.label);
        (st.steps||[]).forEach(x=>{W(x.t);W(x.cap);try{if(VIZ[x.viz])leakText('picture '+x.viz,svgText(VIZ[x.viz](x.args||{})))}catch(e){}});
        if(st.trick){W(st.trick.why);W(st.trick.stamp);Object.values(st.trick.near||{}).forEach(W)}}
      CTX='ledger';Object.values(LEDGER_BYTE).forEach(W);for(const k in LEDGER_GUIDE){owned.guide.add(k);['title','track','text','real'].forEach(x=>W(LEDGER_GUIDE[k][x]))}
      for(const k in LEDGER_GLOSSARY)owned.glossary[k]='ledger';['Spring {0}','Summer {0}','Fall {0}','Winter {0}'].forEach(W)}
    // ----- shared tables from content_boston.js that no mission file owns: the Maya mission and Boston -----
    CTX='maya';WHERE='content';
    for(const k in CAST)if(!owned.cast.has(k)){W(CAST[k].name);W(CAST[k].role)}
    for(const k in FIELD_GUIDE)if(!owned.guide.has(k))['title','track','text','real'].forEach(x=>W(FIELD_GUIDE[k][x]));
    for(const k in LESSONS)if(!owned.lessons.has(k))lessonStrings(LESSONS[k]);
    for(const k in CORE_CHATTER)CORE_CHATTER[k].forEach(W);
    if(typeof MEMO_CHART!=='undefined'){W(MEMO_CHART.title);MEMO_CHART.rows.forEach(r=>{W(r.label);W(r.n)})}
    for(const k in PROPS)(PROPS[k]||[]).forEach(pr=>{if(pr.say)W(pr.say)});
    // glossary: every word needs a translated term and definition
    const G=I18N.gloss[LG]||{},gloss=[];for(const k in GLOSSARY){const g=G[k];if(!g||!g.w||!g.d)gloss.push({ctx:owned.glossary[k]||'maya',key:k,en:GLOSSARY[k],has:!!g})}
    // [[markers]] in translations must open a glossary entry
    const broken=[];for(const [en,zh] of Object.entries(TAB)){const mk=String(zh).match(/\[\[([^\]]+)\]\]/g)||[];for(const x of mk){const w=x.slice(2,-2);if(!GLOSSARY[gkey(w)])broken.push({en,marker:w})}}
    // ----- screens: play every mission in the target language -----
    // a screen whose render waits for taps never resolves, so each screen gets at most 4 seconds
    const shots=async(where,f,ms=40)=>{WHERE=where;try{await Promise.race([Promise.resolve().then(f),sleep(4000)])}catch(e){}await sleep(ms);scan()};
    CTX='core';
    RESUME={...NEW(),step:'hub',lang:LG};await shots('title',()=>STEPS.title());await shots('setup',()=>STEPS.setup());
    for(const id of Object.keys(MISSIONS)){CTX=id;const m=MISSIONS[id];S.completed={};startMission(id);
      for(let k=0;k<2*m.flow.length+5;k++){const f=m.flow.find(x=>x.name===S.step);if(!f)break;
        if(f.k==='criteria')S.criteria=m.criteria.slice(0,3).map(c=>c.id);if(f.k==='memo')S.memo='I recommend this plan because it is safest. I am pretty sure, about 80 out of 100.';if(f.k==='consent')S.consent=true;if(f.k==='reveal')S.result=null;
        await shots(f.name,()=>render(),f.k==='reveal'?2600:f.k==='talk'?60:40);
        if(f.k==='bench'){for(const d of m.docs||[]){await shots(f.name+':'+d.id,()=>{curDoc=d.id;renderWorkbench()})}S.told=true;S.notes[(m.tell||{}).clue]=true;await shots(f.name+':told',()=>renderWorkbench())}
        if(f.k==='table'){await shots(f.name+':why',()=>document.querySelector('#why').click())}
        if(f.k==='consent'){await shots(f.name+':reply',()=>document.querySelector('.choice').click())}
        if(f.k==='memo'){await shots(f.name+':review',()=>document.querySelector('#rev').click(),300)}
        if(f.k==='evening')break;nextStep()}
      S.guide=Object.keys(FIELD_GUIDE);S.words=Object.keys(GLOSSARY);
      await shots('field guide',()=>openGuide());document.querySelectorAll('.sheet').forEach(x=>x.remove());
      await shots('word book',()=>openWords());document.querySelectorAll('.sheet').forEach(x=>x.remove());
      for(const L in LESSONS){await shots('lesson '+L,()=>openLesson(L));document.querySelectorAll('.sheet').forEach(x=>x.remove())}}
    CTX='core';
    await shots('hub',()=>go('hub'));await shots('chat',()=>openChat());
    // the Ledger: the list, every story, and the checking flow (Looks solid, Something's off, a wrong tap, the answer)
    if(typeof openLedger==='function'){CTX='ledger';document.querySelectorAll('.sheet').forEach(x=>x.remove());const C0=S.completed;S.completed=Object.fromEntries(Object.keys(MISSIONS).map(k=>[k,{stars:3}]));S.ledger=null;
      await shots('ledger',()=>openLedger());const d=document.querySelector('.sheet.ledger'),L=lgState();
      for(const ch of ['science','saved'])await shots('ledger '+ch,()=>{LG_VIEW.chip=ch;lgRender(d)});LG_VIEW.chip='all';
      for(const st of LEDGER.list){CTX=st.mission||'ledger';const art=()=>{LG_VIEW.story=st.id;LG_VIEW.mode=null;lgRender(d)};
        L.check[st.id]=0;await shots('ledger '+st.id,art);await shots('ledger saved '+st.id,()=>document.querySelector('#lg-save').click());
        if(st.trick){await shots('ledger nudge '+st.id,()=>document.querySelector('#lg-ok').click());await shots('ledger find '+st.id,()=>document.querySelector('#lg-off').click());
          for(const part of ['head','by','s0','s1','s2','f0','f1'].filter(x=>!st.trick.parts.includes(x)))await shots('ledger near '+st.id,()=>{const e=document.querySelector(`.lg-part[data-part="${part}"]`);e&&e.click()});
          L.check[st.id]='spotted';await shots('ledger spotted '+st.id,art)}
        else{await shots('ledger solid '+st.id,()=>document.querySelector('#lg-off').click());L.check[st.id]='trusted';await shots('ledger trusted '+st.id,art)}}
      document.querySelectorAll('.sheet').forEach(x=>x.remove());await shots('ledger menu',()=>openMenu());document.querySelectorAll('.sheet').forEach(x=>x.remove());S.completed=C0;S.ledger=null;CTX='core'}
    for(const told of [false,true]){S.told=told;S.mission='maya';['how do I win','which is best','tell me about bonemend gel','pins surgery','what about a cast','safest long term','the recital matters most','move the recital friday','what is halo','who are you','she had a rash','hello'].forEach(q=>{CTX='maya';try{cannedReply(q)}catch(e){}})}
    CTX='core';document.querySelectorAll('.sheet').forEach(x=>x.remove());
    await shots('menu',()=>openMenu());await shots('menu: start over',()=>document.querySelector('#m-new').click());document.querySelectorAll('.sheet').forEach(x=>x.remove());
    await shots('grown-ups gate',()=>PARENT.open());document.querySelectorAll('.sheet').forEach(x=>x.remove());
    S.history=[{id:1,t:Date.now()-864e5,mission:'maya',title:MISSIONS.maya.title,day:1,plan:MISSIONS.maya.planName({tx:'cast',pt:true,date:'moved'}),stars:3,luck:'As expected',good:true,conf:75,fc:79,checks:{treatment:true,reason:true,odds:true,maya:true},memo:'I recommend a cast with physical therapy.'},
      {id:2,t:Date.now(),mission:'maya',title:MISSIONS.maya.title,day:1,plan:MISSIONS.maya.planName({tx:'gel',pt:false,date:'fri'}),stars:1,luck:'Unlucky',good:false,conf:97,fc:30,checks:{treatment:true,reason:false,odds:true,maya:false},memo:'Gel.'}];
    S.lessons={bones:3};S.chatLog=[{q:'what is a radius?',t:Date.now(),m:'maya'}];
    await shots('grown-ups page',()=>PARENT.open(true));document.querySelector('.pp-col')&&document.querySelector('.pp-col').click();scan();
    I18N.trace=null;
    // pinyin coverage: translated strings with characters that the generated pinyin does not cover yet
    const P=I18N.pyIndex(),stale=[];for(const [en,zh] of Object.entries(TAB)){const runs=String(zh).replace(/\[\[|\]\]/g,'').replace(/\{\w+\}/g,'\n').match(/[㐀-鿿豈-﫿]+/g)||[];if(runs.some(r=>P.C.indexOf(r)<0)){stale.push(en);if(stale.length>500)break}}
    for(const g of Object.values(I18N.gloss[LG]||{}))for(const t of [g.w,g.d])if(t&&(String(t).match(/[㐀-鿿豈-﫿]+/g)||[]).some(r=>P.C.indexOf(r)<0)){stale.push('glossary: '+g.w);break}
    const fileKeys={};for(const [fid,d] of Object.entries(I18N.files[LG]||{}))fileKeys[fid]=Object.keys(d.strings||{});
    const voices=[...new Map(glossNeed.filter(x=>x.voice).map(x=>[x.ctx+'|'+x.voice,x])).values()];
    return {rec:Object.values(rec),dyn,leaks,gloss,broken,stale,fileKeys,voices,missions:Object.keys(MISSIONS)}},LG);
  await b.close();

  // ---------- attribute every string to a bucket (a mission id, or core for the interface) ----------
  const known=new Set(R.missions.concat(['core']));const norm=bk=>known.has(bk)?bk:(R.missions.find(m=>bk.startsWith(m)||m.startsWith(bk))||bk);
  const all=new Map();for(const r of R.rec)all.set(r.s,{...r});
  for(const [s,bs] of Object.entries(SOURCE_KEYS))if(!all.has(s)){const tab=null;all.set(s,{s,found:null,kind:'text',ctx:[...bs],where:['source'],stat:true})}
  const B={};const bucket=r=>{if(r.kind==='regex')return norm(r.ctx[0]||'core');if(r.stat&&r.where.includes('content'))return norm(r.ctx[0]);const lb=literalBucket(r.s);if(lb)return norm(lb);return norm(r.ctx.find(c=>c!=='core')||r.ctx[0]||'core')};
  const keyFile={};for(const [fid,ks] of Object.entries(R.fileKeys))for(const k of ks)keyFile[k]=fid;
  for(const r of all.values()){if(r.found===null)r.found=keyFile[r.s]!==undefined;const bk=bucket(r);(B[bk]=B[bk]||{ok:0,missing:[],regex:[]});
    if(r.kind==='regex'){if(!r.found)B[bk].regex.push(r);continue}if(r.found)B[bk].ok++;else B[bk].missing.push(r)}
  const seen=new Set(all.keys());const stale={};for(const [fid,ks] of Object.entries(R.fileKeys)){const st=ks.filter(k=>!seen.has(k));if(st.length)stale[fid]=st}
  for(const g of R.gloss)(B[norm(g.ctx)]=B[norm(g.ctx)]||{ok:0,missing:[],regex:[]});
  // ---------- write the report ----------
  fs.mkdirSync(path.join(out,'missing'),{recursive:true});const q=s=>JSON.stringify(s);
  const order=Object.keys(B).sort((a,b)=>a==='core'?-1:b==='core'?1:a.localeCompare(b));let md=`# Translation report (${LG})\n\nBuilt page: ${html}\n\n| File | Translated | Missing strings | Missing glossary | Regex | English leaks on screen | Built text with English |\n|---|---|---|---|---|---|---|\n`;
  const leaksBy=id=>R.leaks.filter(l=>norm(l.ctx)===id),dynBy=id=>R.dyn.filter(d=>norm(d.ctx)===id),glossBy=id=>R.gloss.filter(g=>norm(g.ctx)===id);
  for(const id of order)md+=`| src/i18n/${LG}/${id}.js | ${B[id].ok} | ${B[id].missing.length} | ${glossBy(id).length} | ${B[id].regex.length} | ${leaksBy(id).length} | ${dynBy(id).length} |\n`;
  for(const id of order){const x=B[id],L=leaksBy(id),D=dynBy(id),G=glossBy(id);if(!x.missing.length&&!L.length&&!D.length&&!G.length&&!x.regex.length&&!stale[id])continue;
    md+=`\n## ${id}\n`;
    if(x.missing.length){md+=`\n### Untranslated strings (${x.missing.length})\n\n`+x.missing.map(r=>`- ${q(r.s)}${r.where.length?`  _(${r.where.join(', ')})_`:''}`).join('\n')+'\n'}
    if(G.length)md+=`\n### Glossary words without a translated term and definition (${G.length})\n\n`+G.map(g=>`- ${q(g.key)}: ${g.en}`).join('\n')+'\n';
    if(x.regex.length)md+=`\n### Patterns without ${LG} alternatives (memo checks, chat keywords) (${x.regex.length})\n\n`+x.regex.map(r=>'- `'+r.s+'`').join('\n')+'\n';
    if(D.length)md+=`\n### Text built in code that still contains English (wrap the pieces in T(); use {placeholders} for values) (${D.length})\n\n`+[...new Map(D.map(d=>[d.kind+d.words.join(),d])).values()].map(d=>`- ${d.kind}: ${q(d.text)} (English: ${d.words.join(', ')})`).join('\n')+'\n';
    if(L.length)md+=`\n### English on screen that never went through T() (${L.length})\n\n`+L.map(l=>`- ${l.where}: ${q(l.text)}`).join('\n')+'\n';
    if(stale[id])md+=`\n### Possibly stale: translated, but not seen in this run (${stale[id].length})\n\n`+stale[id].map(s=>'- '+q(s)).join('\n')+'\n'}
  if(R.broken.length)md+=`\n## Glossary markers in translations that open no entry (${R.broken.length})\n\nAdd the term to that word's \`alt\` list, or fix the marker.\n\n`+R.broken.map(x=>`- [[${x.marker}]] in ${q(x.en)}`).join('\n')+'\n';
  if(R.voices.length)md+=`\n## Speakers without a ${LG} voice (they fall back to a generic voice)\n\n`+R.voices.map(v=>`- ${v.ctx}: ${v.voice}`).join('\n')+'\n';
  if(R.stale.length)md+=`\n## Pinyin is out of date for ${R.stale.length} string(s)\n\nRun \`node tools/i18n_pinyin.js\` (after \`cd tools && npm install\`). First few:\n\n`+R.stale.slice(0,12).map(s=>'- '+q(s)).join('\n')+'\n';
  if(errs.length)md+=`\n## Page errors\n\n`+errs.map(e=>'- '+e).join('\n')+'\n';
  fs.writeFileSync(path.join(out,'i18n_report.md'),md);
  fs.writeFileSync(path.join(out,'i18n_report.json'),JSON.stringify({lang:LG,buckets:Object.fromEntries(order.map(id=>[id,{translated:B[id].ok,missing:B[id].missing.map(r=>r.s),glossary:glossBy(id).map(g=>g.key),regex:B[id].regex.map(r=>r.s),leaks:leaksBy(id),built:dynBy(id),stale:stale[id]||[]}])),broken:R.broken,voices:R.voices,pinyinStale:R.stale.length,errors:errs},null,1));
  let total=0;for(const id of order){const x=B[id],G=glossBy(id);if(!x.missing.length&&!G.length)continue;total+=x.missing.length+G.length;
    fs.writeFileSync(path.join(out,'missing',`${LG}_${id}.js`),`// Untranslated strings for src/i18n/${LG}/${id}.js, from tools/i18n_extract.js. Fill in each value, then merge into that file.\nI18N.add('${LG}','${id}',{\n strings:{\n`+x.missing.map(r=>`  ${q(r.s)}:'',`).join('\n')+`\n },\n glossary:{\n`+G.map(g=>`  ${q(g.key)}:{w:'',d:''},  // ${g.en}`).join('\n')+`\n }\n});\n`)}
  console.log(order.map(id=>`${id.padEnd(12)} translated ${String(B[id].ok).padStart(4)}  missing ${String(B[id].missing.length).padStart(4)}  glossary ${String(glossBy(id).length).padStart(3)}  leaks ${String(leaksBy(id).length).padStart(3)}  built ${String(dynBy(id).length).padStart(3)}`).join('\n'));
  console.log(`report: ${path.join(out,'i18n_report.md')}${R.stale.length?`\npinyin out of date for ${R.stale.length} string(s): run node tools/i18n_pinyin.js`:''}${errs.length?'\nPAGE ERRORS:\n'+errs.join('\n'):''}`);
  process.exit(flag('--strict')&&(total||R.leaks.length||R.dyn.length)?1:0)})();
