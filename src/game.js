// game.js — state, saving, screens and the mission flow for Pathmakers 2040.
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const APP=$('#app');
const NEW=()=>({v:2,mission:'maya',completed:{},player:'Juniper',byte:{name:'Byte',color:'#f0b35a',ears:'floppy',voice:'female'},step:'title',notes:{},told:false,highlights:{},
  criteria:[],choice:{tx:'gel',pt:false,date:'fri'},seed:1,conf:2,memo:'',consent:null,words:[],guide:[],hearts:{},result:null,done:false,read:{},level:'kid'});
let S=NEW(),RESUME=null;
// hooks: optional systems (src/modes.js, the campaign) register with onHook(name, fn) from a LATE function.
// hook(name, value, ...args) passes value through every registered fn (a fn that returns undefined leaves it unchanged); with none registered it returns value.
const HOOKS={};function onHook(n,f){(HOOKS[n]=HOOKS[n]||[]).push(f)}
function hook(n,v,...a){for(const f of HOOKS[n]||[]){try{const r=f(v,...a);if(r!==undefined)v=r}catch(e){console.warn(e)}}return v}
const M=()=>hook('mission',MISSIONS[S.mission||'maya']);
const MISSION_FIELDS=()=>({notes:{},told:false,highlights:{},criteria:[],seed:1,conf:2,memo:'',memoAI:null,consent:null,result:null,read:{}});

// ---------- saving: browser storage, plus the viewer's private artifact storage when available ----------
let DB=null,UID=null,saveT=0;
function save(){S.t=Date.now();try{localStorage.setItem('pm2040',JSON.stringify(S))}catch(e){}
  clearTimeout(saveT);saveT=setTimeout(()=>{if(DB&&UID)DB.collection('data/users/'+UID).doc('save').set({json:JSON.stringify(S),t:Date.now()}).catch(()=>{})},800)}
function loadLocal(){try{const j=localStorage.getItem('pm2040');if(j)return JSON.parse(j)}catch(e){}return null}
async function connectCloud(){
  if(!window.claude||!window.claude.use)return;
  try{const [db,user]=await Promise.all([claude.use('db'),claude.use('user')]);if(!db||!user)return;
    UID=await user.id();if(!UID)return;DB=db;
    const d=await DB.collection('data/users/'+UID).doc('save').get().catch(()=>null);
    const remote=d&&(d.data?d.data():d);const j=remote&&remote.json;
    if(j){const r=migrateSave(JSON.parse(j));const loc=loadLocal();if(r&&(!loc||loc.step==='title'||(r.t||0)>=(loc.t||0))){RESUME=r;try{localStorage.setItem('pm2040',j)}catch(e){}if(APP.classList.contains('title'))render()}}
  }catch(e){}
}

// ---------- helpers ----------
const P=()=>!S.player||S.player==='Juniper'?T('Juniper'):S.player;
const fill=t=>t.replace(/\{P\}/g,P());
function rngFrom(seed){let a=(seed>>>0)||1;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}
function esc(t){return String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
// graded reader markup: [[word]] → tappable glossary word
function rich(t){return esc(fill(T(t))).replace(/\[\[([^\]]+)\]\]/g,(m,w)=>{const k=gkey(w);return GLOSSARY[k]?`<button class="gw" data-w="${esc(k)}">${w}</button>`:w})}
function toast(msg,kind=''){const prev=$$('.toast:not(.out)'),n=prev.length;const d=document.createElement('div');d.className='toast '+kind;d.innerHTML=msg;document.body.appendChild(d);
  // stack below the toasts already showing, by their real height (a toast can wrap to two lines)
  if(n){const b=Math.max(...prev.map(x=>x.offsetTop+x.offsetHeight));d.style.marginTop=Math.max(0,b+8-d.offsetTop)+'px'}setTimeout(()=>d.classList.add('out'),2600+n*600);setTimeout(()=>d.remove(),3200+n*600)}
// ---------- voices: prerecorded clips (AUDIO from audio.js), device voice as fallback ----------
let curAudio=null,playId=0;
function stopVoice(){playId++;MUSIC.duck(false);try{if(curAudio){curAudio.pause();curAudio=null}}catch(e){}}
function playLine(who,text){stopVoice();const id=playId;if(S.mute)return Promise.resolve();
  const zt=I18N.say(text);const t=speechText(fill(zt??text));const v0=who==='byte'?BYTE_VOICES[S.byte.voice||'female']:(VOICES[who]||VOICES.narrator);const vname=zt==null?v0:I18N.voice(who,v0);const key=vname+'|'+t;
  MUSIC.duck(true);const res0=()=>{};
  return new Promise(res1=>{const res=()=>{if(id===playId)MUSIC.duck(false);res1()};const src=window.AUDIO&&AUDIO[key];
    if(src){const a=new Audio(src);curAudio=a;a.onended=()=>res();a.onerror=()=>res();a.play().catch(()=>res());return}
    const dur=who==='byte'?MUSIC.babble(t,who):0;setTimeout(res,Math.max(700,dur?dur*1000+150:t.length*55))})}
// play a recorded clip by exact voice name (passers-by); silent if there is no clip
function playVoice(voice,text,who){const zt=I18N.say(text);if(zt!=null&&zt!==text){voice=who?I18N.voice(who,voice):I18N.passer(voice);text=zt}const src=window.AUDIO&&AUDIO[voice+'|'+speechText(text)];if(!src||S.mute)return;stopVoice();const a=new Audio(src);curAudio=a;MUSIC.duck(true);a.onended=()=>MUSIC.duck(false);a.play().catch(()=>MUSIC.duck(false))}
async function playSeq(items){stopVoice();const id=playId;for(const [who,t] of items){if(id!==playId)return;await playLine(who,t);playId=id}}
function speak(t){playLine('narrator',t)}
function stopBabble(){}
// speech to text where the browser allows it (not inside Claude artifacts, which block the microphone)
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
function micButton(target){if(!SR)return '';return `<button class="mic" type="button" data-target="${target}" aria-label="${T('Speak instead of typing')}"><svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="12" rx="3" fill="currentColor"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg></button>`}
function wireMics(){$$('.mic').forEach(b=>b.onclick=()=>{const el=document.getElementById(b.dataset.target);if(!el)return;
  try{const r=new SR();r.lang=I18N.speechLang();r.interimResults=true;const base=el.value&&!/\s$/.test(el.value)?el.value+' ':el.value;b.classList.add('on');
    r.onresult=e=>{let t='';for(const x of e.results)t+=x[0].transcript;el.value=base+t;el.dispatchEvent(new Event('input'))};
    r.onerror=()=>{b.classList.remove('on');b.remove();toast(T('The microphone isn\u2019t available here. You can type instead.'))};r.onend=()=>b.classList.remove('on');r.start()}catch(e){b.remove()}})}
function learnWord(k){window.PARENT&&PARENT.noteWord(k);if(!S.words.includes(k)){S.words.push(k);save();bumpHud('words')}}
function unlock(id){window.PARENT&&PARENT.noteIdea(id);if(!S.guide.includes(id)){S.guide.push(id);save();bumpHud('guide');return true}return false}
function heart(who,n=1){S.hearts[who]=(S.hearts[who]||0)+n;save();if(typeof heartFx==='function')heartFx(who,n)}
function bumpHud(id){const b=$('#hud-'+id);if(b){const n=id==='words'?S.words.length:S.guide.length;let sp=b.querySelector('span');if(!sp){sp=document.createElement('span');b.appendChild(sp)}sp.textContent=n;b.classList.remove('bump');void b.offsetWidth;b.classList.add('bump')}}

// glossary popover (one at a time)
document.addEventListener('click',e=>{
  const w=e.target.closest('.gw');const pop=$('.gpop');
  if(w){e.stopPropagation();if(pop)pop.remove();const k=w.dataset.w;learnWord(k);
    const d=document.createElement('div');d.className='gpop';d.innerHTML=`<b>${esc(I18N.text(w))}</b><p>${esc(TD(k))}</p><button class="mini-btn" data-say="1">${T('Listen')}</button>`;
    document.body.appendChild(d);I18N.ruby(d);const r=w.getBoundingClientRect();const top=r.bottom+8+d.offsetHeight>innerHeight?r.top-d.offsetHeight-8:r.bottom+8;
    d.style.top=Math.max(8,top)+'px';d.style.left=Math.min(innerWidth-d.offsetWidth-12,Math.max(12,r.left+r.width/2-d.offsetWidth/2))+'px';
    d.querySelector('[data-say]').onclick=ev=>{ev.stopPropagation();playLine('narrator',k+'. '+GLOSSARY[k])};return}
  if(pop&&!e.target.closest('.gpop'))pop.remove();
},true);

// ---------- HUD ----------
const ICON={
  menu:'<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  on:'<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
  off:'<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  chat:'<svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  guide:'<svg viewBox="0 0 24 24"><path d="M4 5c3-1 6-1 8 1 2-2 5-2 8-1v14c-3-1-6-1-8 1-2-2-5-2-8-1z M12 6v14" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  words:'<svg viewBox="0 0 24 24"><path d="M5 19 10 5h1l5 14M7 14h7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M17 9h3M18.5 7.5v3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
};
function hud(place){return `<div class="hud"><div class="place">${esc(T(place))}</div><div class="hud-btns">
 <button id="hud-mute" class="hbtn" aria-label="${T(S.mute?'Turn sound on':'Turn sound off')}">${S.mute?ICON.off:ICON.on}</button>
  <button id="hud-menu" class="hbtn" aria-label="${T('Menu')}">${ICON.menu}${typeof ledgerHud==='function'?ledgerHud():''}</button>
  <button id="hud-chat" class="hbtn" aria-label="${T('Talk to {0}',esc(S.byte.name))}">${ICON.chat}</button>
  <button id="hud-guide" class="hbtn" aria-label="${T('Field Guide')}">${ICON.guide}${S.guide.length?`<span>${S.guide.length}</span>`:''}</button>
  <button id="hud-words" class="hbtn" aria-label="${T('Word Book')}">${ICON.words}${S.words.length?`<span>${S.words.length}</span>`:''}</button></div></div>`}
function saveCode(){try{return 'PM1-'+btoa(unescape(encodeURIComponent(JSON.stringify(S)))).replace(/=+$/,'')}catch(e){return ''}}
function loadCode(code){try{const j=JSON.parse(decodeURIComponent(escape(atob(code.trim().replace(/^PM1-/,'')))));const g=migrateSave(j);if(g){S={...NEW(),...g};save();return true}}catch(e){}return false}
function openMenu(){const d=sheet(T('Menu'),`<div class="menu">
   <button class="btn wide" id="m-hub">${T('World map')}</button>${typeof openPortfolio==='function'?`<button class="btn wide ghost" id="m-port">${T('Portfolio Book')}</button>`:''}${typeof ledgerMenu==='function'?ledgerMenu():''}${typeof byteClosetButton==='function'?byteClosetButton():''}
   <div class="lbl">${T('Save code')}</div><p class="tiny muted">${T('Copy this code to move your game to another device or browser.')}</p>
   <textarea id="m-code" rows="3" readonly>${esc(saveCode())}</textarea><button class="btn small" id="m-copy">${T('Copy code')}</button>
   <div class="lbl">${T('Load a save code')}</div><textarea id="m-in" rows="3" placeholder="${T('Paste a code that starts with PM1-')}"></textarea><button class="btn small ghost" id="m-load">${T('Load this game')}</button>
   <div class="lbl">${T('Start over')}</div><button class="btn small ghost" id="m-new">${T('New game')}</button><div id="m-confirm"></div>
   ${window.PARENT?`<div class="lbl">${T('For grown-ups')}</div><button class="btn small ghost" id="m-parent">${T('Progress page')}</button>`:''}<div class="lbl">${T('Every workday')}</div><button class="btn small ghost" id="m-all">${T(S.playAll?'Lock days in story order':'Unlock every workday')}</button>${I18N.menuHTML()}</div>`);
  I18N.wireMenu(d,()=>{d.remove();render();openMenu()});
  $('#m-all',d).onclick=()=>{S.playAll=!S.playAll;save();d.remove();toast(T(S.playAll?'Every workday is open':'Days unlock in story order'),'good');render()};const mp=$('#m-parent',d);if(mp)mp.onclick=()=>{d.remove();PARENT.open()};
  $('#m-hub',d).onclick=()=>{d.remove();go('hub')};const mpb=$('#m-port',d);if(mpb)mpb.onclick=()=>{d.remove();openPortfolio()};const ml=$('#m-ledger',d);if(ml)ml.onclick=()=>{d.remove();openLedger()};const mc=$('#m-closet',d);if(mc)mc.onclick=()=>{d.remove();openCloset()};
  $('#m-copy',d).onclick=()=>{const t=$('#m-code',d);navigator.clipboard&&navigator.clipboard.writeText(t.value).then(()=>toast(T('Save code copied'),'good')).catch(()=>{t.select()});t.select()};
  $('#m-load',d).onclick=()=>{if(loadCode($('#m-in',d).value)){d.remove();toast(T('Game loaded'),'good');render()}else toast(T('That code didn\u2019t work. Check that you copied all of it.'))};
  $('#m-new',d).onclick=()=>{$('#m-confirm',d).innerHTML=`<p>${T('Erase this game and start over?')}</p><div class="row"><button class="btn small" id="m-yes">${T('Yes, start over')}</button><button class="btn small ghost" id="m-no">${T('Keep playing')}</button></div>`;
    $('#m-yes',d).onclick=()=>{d.remove();S=NEW();save();go('setup')};$('#m-no',d).onclick=()=>{$('#m-confirm',d).innerHTML=''}};hook('menu',d)}
function wireHud(){const mm=$('#hud-menu');if(mm)mm.onclick=openMenu;const m=$('#hud-mute');if(m)m.onclick=()=>{S.mute=!S.mute;save();stopVoice();MUSIC.mute(S.mute);m.innerHTML=S.mute?ICON.off:ICON.on};const c=$('#hud-chat');if(c)c.onclick=openChat;const g=$('#hud-guide');if(g)g.onclick=openGuide;const w=$('#hud-words');if(w)w.onclick=openWords}
function sheet(title,html){const d=document.createElement('div');d.className='sheet';d.innerHTML=`<div class="sheet-in"><div class="sheet-top"><h2>${title}</h2><button class="x" aria-label="${T('Close')}">×</button></div><div class="sheet-body">${html}</div></div>`;document.body.appendChild(d);
  requestAnimationFrame(()=>d.classList.add('on'));d.querySelector('.x').onclick=()=>{d.classList.remove('on');setTimeout(()=>d.remove(),250)};return d}
function openGuide(){const items=Object.entries(FIELD_GUIDE);hook('guide',sheet(T('Field Guide'),`<p class="muted">${T('{0} of {1} found in Boston',S.guide.length,items.length)}</p>`+items.map(([id,g])=>S.guide.includes(id)?`<div class="fg"><div class="fg-track">${T(g.track)}</div><h3>${T(g.title)}</h3><p>${T(g.text)}</p><div class="realcard"><span>${T('True today')}</span>${T(g.real).replace(/^True today: /,'')}</div></div>`:`<div class="fg locked"><h3>?</h3><p>${T('Keep playing to discover this idea.')}</p></div>`).join('')))}
function openWords(){sheet(T('Word Book'),S.words.length?`<div class="wordlist">${S.words.map(k=>`<div class="wb"><button class="gw" data-w="${esc(k)}">${esc(TW(k))}</button><p>${esc(TD(k))}</p></div>`).join('')}</div>`:`<p class="muted">${T('Tap any underlined word to learn it. It will be saved here.')}</p>`)}

// ---------- chat with Byte ----------
let CHAT=[],SAMPLE=null;
async function getSample(){if(SAMPLE!==null)return SAMPLE;try{SAMPLE=window.claude&&claude.use?await claude.use('sample'):null}catch(e){SAMPLE=null}if(!SAMPLE)SAMPLE=keySample();return SAMPLE}
// Outside Claude.ai (the Android app, an offline copy) there is no sample capability. A grown-up can paste an Anthropic
// API key on the progress page; it stays in this device's storage only (never in S, so never in save codes) and makes
// the same kind of calls the artifact's sample capability makes. With no key, Byte uses scripted replies.
const KEY_STORE='pm2040_apikey';
function liveKey(){try{return localStorage.getItem(KEY_STORE)||''}catch(e){return ''}}
function setLiveKey(k){try{k?localStorage.setItem(KEY_STORE,k.trim()):localStorage.removeItem(KEY_STORE)}catch(e){}SAMPLE=null}
function keySample(){if(!liveKey())return null;
  const call=async(input,opts={})=>{const msgs=typeof input==='string'?[{role:'user',content:input}]:input;
    const model=opts.modelTier==='quick'?'claude-haiku-5-5':'claude-sonnet-5-5';
    const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',signal:opts.signal,headers:{'content-type':'application/json','x-api-key':liveKey(),
      'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify({model,max_tokens:opts.maxTokens||700,messages:msgs})});
    if(!r.ok)throw {code:r.status===429?'rate_limited':'error',message:'HTTP '+r.status};
    const j=await r.json();const text=(j.content||[]).filter(b=>b.type==='text').map(b=>b.text).join('');
    if(opts.onText)opts.onText({text,delta:text});return {text,truncated:j.stop_reason==='max_tokens'}};
  const sm=(input,opts)=>call(input,opts);
  sm.json=async(input,opts={})=>{const add='\n\nReply with only the JSON value, no other text.';
    const inp=typeof input==='string'?input+add:input.map((m,i)=>i===input.length-1?{...m,content:m.content+add}:m);
    const {text}=await call(inp,opts);const m=text.match(/[\[{][\s\S]*[\]}]/);return JSON.parse(m?m[0]:text)};
  return sm}
// What the player can read right now, so Byte can quote it and say where it is on screen.
function chatDocs(){let out='Where things are on screen: the Workbench screen has one tab per document (listed below); tap a tab to read it, and tap "Read to me" to hear it. Top-right buttons: sound, Menu (three lines: World map, Portfolio Book, Byte’s closet, save code, For grown-ups), chat with you, the Field Guide (book icon) and the Word Book (A+ icon). Tapping any underlined word shows its meaning.';
  try{if(M().chatExtra)out+='\n'+M().chatExtra()}catch(e){}
  try{const D=M().docs||[];if(D.length)out+='\nDocuments on the Workbench, word for word (quote them exactly when asked; never invent wording):\n'+D.map(d=>`[${d.title}] from ${d.from}: `+d.steps.map(b=>String(b.t).replace(/\[\[([^\]]+)\]\]/g,'$1')).join(' ')).join('\n')}catch(e){}
  return out.length>14000?out.slice(0,14000)+'…':out}
function byteContext(){return hook('byteContext',`You are ${S.byte.name}, the player's AI partner in the game "Pathmakers 2040", shaped like a cute robot puppy. In this 2040, expert AIs like you match the best human experts in every field, and hundreds of millions of them work far faster than people, but an international agreement holds them at that level until the world decides on the Next Step, so never call yourself superintelligent. You are an expert in medicine, science, history and everything else, and you are impressively, concretely helpful. The player, ${P()}, is a kid who reads well above their grade level; speak warmly and clearly, with a little puppy playfulness, in 2 to 4 short sentences unless a list is clearly better. No markdown.
The world: Boston, 2040. AI quietly runs a lot of everyday things (the hospital's systems are run by an AI called Halo), and people treat that as normal and mundane, the way we treat electricity. Humans still make value choices, give consent, and sign off, because the decisions are about their own lives. Mention the AI parts casually, never as a big deal.
${M().brief()}
${chatDocs()}
${S.honesty?'The player installed your Honesty Upgrade: whenever their plan has a problem, even a small one, say "I think your plan has a problem. Want to hear it?" and explain kindly if they say yes, then let them decide.\n':''}How to help: answer factual questions exactly and impressively, with real numbers and reasoning, and explain anything (science, words, how the game works). When asked which option to pick, do not simply hand over the answer at first: point out the single most important consideration for this case, then ask what matters most to the people involved. Once the player says what matters, give a clear recommendation tied to that priority, with the odds. Then remind them gently that the people involved decide after a clear explanation, and the player signs. If asked how to "win" or "beat the game", explain the steps plainly: read the documents, notice clues from the family, tell you anything the record is missing, pick what matters most, test plans on the Future Table, explain honestly to Maya and her dad, write a clear decision with odds, and sign. You can also teach anything (science, words, history) at a kid-friendly level. Stay kind and age-appropriate; gently steer away from anything unsuitable for a child. Never ask for the player’s real name, address, or school.`+I18N.aiNote())}
function cannedReply(q){q=q.toLowerCase();if(M().canned){const r=M().canned(q);if(r)return r}if(S.mission&&S.mission!=='maya'){if(TRX(/beat|win|how do i|what do i do|stuck|help/).test(q))return T('Here\u2019s the path: read the documents, listen for clues from the people involved, tell me anything I\u2019m missing, pick what matters most, test plans on the Future Table, explain honestly, then write your decision and sign it!');return T('Great question! Ask me about this case, the odds, or anything about 2040.')}
  if(TRX(/rash|allerg|patch|itch/).test(q)){if(!S.told){S.told=true;save();return T('Woof, that changes everything! If Maya reacted to an HX-2 cooling patch, BoneMend has about a 60% chance of giving her a rash, so I’d avoid it. A cast with physical therapy plus asking to move the recital is my top pick now.')}return T('Right, the rash! I’d skip BoneMend for Maya. Pins are the surest for the bone; a cast with therapy is gentler and lets her play in about 3 weeks.')}
  if(TRX(/beat|win|how do i|what do i do|stuck|help/).test(q))return T('Here’s the path: read the 3 documents, listen for clues from Maya’s family, tell me anything her record is missing, pick what matters most, test plans on the Future Table, explain the choice honestly to Maya and her dad, then write your decision with odds and sign it!');
  if(TRX(/best|which|pick|choose|should|recommend/).test(q))return T(S.told?'I can\u2019t pick for you, but here\u2019s the big thing: Maya\u2019s rash came from HX-2, the same ingredient in BoneMend. So what matters most to her: the safest healing, or getting to her recital?':'Before I answer, did her family mention any allergies or reactions? Records from other countries are often missing. And what matters most to Maya: the safest healing, or getting to her recital?');
  if(TRX(/bonemend|gel/).test(q))return T('BoneMend fills the break with a gel that helps bone cells rebuild fast, so many kids play again in about 8 days. Only 40 kids have tried it, so the true heal-straight rate could be anywhere from about 76 to 97 in 100.');
  if(TRX(/pin|surg/).test(q))return T('Pins hold the bone pieces perfectly still, so about 95 in 100 heal straight. The tradeoff: about 6 weeks before she can play violin.');
  if(TRX(/cast/).test(q))return T('A cast heals straight about 80 in 100 times, or 88 with physical therapy, and she could play in about 3 weeks. It’s the most studied option: 21,000 kids!');
  if(TRX(/safe|heal.*(best|most)|long.?term|arm first/).test(q))return T(S.told?'Then I\u2019d pick pins (about 95 in 100 heal straight) or a cast with therapy (88 in 100) and ask to move the recital. Skip BoneMend because of her rash.':'Then pins are the surest: about 95 in 100 heal straight, though she\u2019d miss about 6 weeks of violin.');
  if(TRX(/recital matters|play.*(most|matter)|get to (her|the) recital/).test(q))return T(S.told?'Then a cast with therapy and a moved recital gives her the best shot without risking a rash from BoneMend.':'Then BoneMend gives the best shot at Friday, if her skin is fine with HX-2. Moving the recital with a cast is the safer backup.');
  if(TRX(/recital|move|friday/).test(q))return T('Moving the recital about 3 weeks is a great move with a cast: she’d very likely be ready. Keeping Friday only works with BoneMend, and only if her skin is fine with it.');
  if(TRX(/halo/).test(q))return T('Halo is the hospital\u2019s system. It keeps schedules, supplies, and scans running, like the hospital\u2019s brain for chores. The big people decisions are yours.');
  if(TRX(/who are you|what are you/).test(q))return T('I’m {0}, your AI partner! I read everything, run forecasts, and build Future Tables. You bring what matters to people and make the call.',S.byte.name);
  return T('Great question! Ask me about Maya’s options, the odds, how bones heal, or anything about 2040. I know a lot!')}
function openChat(){const d=sheet(T('Talk to {0}',esc(S.byte.name)),`<div class="chatlog" id="chatlog"></div><form class="chatform" id="chatform"><input id="chatin" autocomplete="off" placeholder="${T('Ask {0} anything',esc(S.byte.name))}" maxlength="300">${micButton('chatin')}<button class="btn small" type="submit">${T('Send')}</button></form>`);
  d.classList.add('chat');wireMics();const told0=S.told;d.querySelector('.x').addEventListener('click',()=>{if(S.step==='workbench'&&S.told!==told0)setTimeout(renderWorkbench,260)});const log=$('#chatlog');
  const draw=()=>{log.innerHTML=`<div class="msg b"><div class="mini-byte">${byteBox(S.byte)}</div><p>${T('Hi {0}! Ask me anything.',esc(P()))}</p></div>`+CHAT.map(m=>`<div class="msg ${m.role==='user'?'u':'b'}">${m.role==='user'?'':`<div class="mini-byte">${byteBox(S.byte)}</div>`}<p>${esc(m.content)}</p></div>`).join('');log.scrollTop=log.scrollHeight};draw();
  $('#chatform').onsubmit=async e=>{e.preventDefault();const inp=$('#chatin');const q=inp.value.trim();if(!q)return;inp.value='';CHAT.push({role:'user',content:q});draw();window.PARENT&&PARENT.noteChat(q);
    if(TRX(hook('tellMatch',/rash|allerg|patch|itch/i)).test(q)&&!S.told){S.told=true;save()}
    const placeholder={role:'assistant',content:T('Thinking...')};CHAT.push(placeholder);draw();
    const sm=window.PARENT&&!PARENT.chatOn()?null:await getSample();let answer=null;
    if(sm){try{const turns=[{role:'user',content:byteContext()+'\n\nThe player says: '+CHAT[0].content}];
        const hist=CHAT.slice(0,-1);const msgs=[{role:'user',content:byteContext()+'\n\nConversation so far follows. Reply as '+S.byte.name+' to the last player message.'}].concat(hist.map(m=>({role:m.role,content:m.content})));
        // keep alternation: merge leading user turns
        const merged=[];for(const m of msgs){if(merged.length&&merged.at(-1).role===m.role)merged.at(-1).content+='\n'+m.content;else merged.push({...m})}
        const r=await sm(merged,{modelTier:'quick',cache:false,onText:({text})=>{placeholder.content=text;draw()}});answer=r.text}catch(err){answer=null}}
    placeholder.content=answer||hook('canned',cannedReply(q),q);draw();MUSIC.babble(placeholder.content,'byte');if(S.step==='workbench'&&!d.isConnected)renderWorkbench()};
}

// ---------- painted backgrounds: canvas painters (PAINT, from paint_boston.js) with vector fallback ----------
let CURSCENE=null;const BG={cv:null,cache:{},key:null,raf:0,t0:performance.now()};
// scenes that are referenced but not painted yet borrow the closest painted one instead of the hospital corridor
const SCENE_STANDIN={};
// (CURSCENE keeps the scene's own key, so its props and passers-by stay; only the painting is borrowed)
function standIn(k){return window.PAINT&&!PAINT[k]&&SCENE_STANDIN[k]&&PAINT[SCENE_STANDIN[k]]?SCENE_STANDIN[k]:k}
function scene(k){if(window.PAINT&&(PAINT[k]||PAINT[standIn(k)])&&!SCENES[k]){CURSCENE=k;return ''}if(window.PAINT&&PAINT[k]){CURSCENE=k;return ''}if(SCENES[k]){CURSCENE=k;return SCENES[k]()}CURSCENE=(window.PAINT&&PAINT.hospital)?'hospital':null;return CURSCENE?'':SCENES.hospital()}
function bgSize(){const cv=BG.cv,r=cv.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1);return [Math.max(1,Math.round(r.width*dpr)),Math.max(1,Math.round(r.height*dpr))]}
function applyScene(){const k=standIn(CURSCENE);if(!(window.PAINT&&PAINT[k])){if(BG.cv)BG.cv.style.display='none';return}
  if(!BG.cv){BG.cv=document.createElement('canvas');BG.cv.className='scene bgcanvas';document.body.prepend(BG.cv);addEventListener('resize',()=>{BG.cache={};drawBg(true)})}
  BG.cv.style.display='block';BG.key=k;drawBg(true);if(!BG.raf)loopBg()}
function paintCache(k,w,h){const id=k+w+'x'+h;if(BG.cache[id])return BG.cache[id];const c=document.createElement('canvas');c.width=w;c.height=h;try{PAINT[k].paint(c.getContext('2d'),w,h)}catch(e){console.warn(e)}BG.cache[id]=c;return c}
function drawBg(){const cv=BG.cv;if(!cv||!BG.key)return;const [w,h]=bgSize();if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h}
  const ctx=cv.getContext('2d');ctx.drawImage(paintCache(BG.key,w,h),0,0);const P=PAINT[BG.key];
  if(P.overlay){const t=matchMedia('(prefers-reduced-motion: reduce)').matches?0:(performance.now()-BG.t0)/1000;try{ctx.save();P.overlay(ctx,w,h,t);ctx.restore()}catch(e){}}}
function loopBg(){BG.raf=requestAnimationFrame(()=>{BG.raf=0;if(document.hidden||!BG.cv||BG.cv.style.display==='none'){setTimeout(loopBg,400);return}drawBg();loopBg()})}

// ---------- screen framework ----------
const TRACK_FOR={title:'title',setup:'title',talk:null,walk:'morning',bench:'work',criteria:'work',memo:'work',futuretable:'table',reveal:'table',debrief:'win',evening:'night'};
if(typeof MUSIC_TRACKS!=='undefined')window.MUSIC_TRACKS=MUSIC_TRACKS;
const TRACK_BY_SCENE={home:'morning',street:'morning',hospital:'hospital',night:'night',table:'table',workbench:'work'};
// a place name too long for two lines ("North Pasture · Kigluaik Mammoth Reserve") gets a smaller three-line pill instead of an ellipsis
function fitPlace(){const pl=APP.querySelector('.hud .place');if(pl&&pl.scrollHeight>pl.clientHeight+2)pl.classList.add('long')}
// In Chinese mode, text drawn inside pictures (SVG labels) and picture captions is translated too, when a translation exists.
function i18nSvg(root){if(typeof LANG!=='function'||LANG()==='en'||!root)return;const tab=I18N.tab[LANG()]||{};
  root.querySelectorAll('svg text,svg tspan,figcaption,.fig-cap').forEach(e=>{if(e.children.length&&e.tagName!=='text')return;const t=e.textContent.trim();const v=tab[t];if(v!=null&&e.childNodes.length<=1)e.textContent=v;
    else if(v!=null&&e.tagName==='text'&&!e.querySelector('tspan'))e.textContent=v})}
function screen(cls,html){I18N.sync();stopVoice();APP.className='screen '+cls;const sk=null;APP.innerHTML=html;i18nSvg(APP);const scn=CURSCENE;
  if(scn&&PROPS[scn]&&PROPS[scn].length)APP.insertAdjacentHTML('afterbegin',propsLayer(scn));
  if(typeof campaignScreen==='function')campaignScreen(cls);fitPlace();applyScene();CURSCENE=null;wireHud();wireProps();window.scrollTo(0,0);const fstep=S.mission&&MISSIONS[S.mission]&&M().flow.find(x=>x.name===S.step);$$('.gpop,.bubble').forEach(x=>x.remove());
  MUSIC.play((fstep&&fstep.music)||TRACK_FOR[cls]||TRACK_BY_SCENE[scn]||(window.PAINT&&PAINT[standIn(scn)]&&PAINT[standIn(scn)].track)||'work')}
document.addEventListener('pointerdown',()=>{MUSIC.unlock();MUSIC.mute(!!S.mute)},{capture:true});
// Autosave keeps the exact step of every unfinished mission (S.at) and, when the player switches to another mission,
// that mission's working state (S.paused), so coming back resumes where they left off instead of restarting a stage.
function go(step){S.step=step;const m=S.mission&&MISSIONS[S.mission];
  if(m&&m.flow&&m.flow.some(f=>f.name===step)){S.at=S.at||{};if(step===m.flow[m.flow.length-1].name){delete S.at[m.id];if(S.paused)delete S.paused[m.id]}else S.at[m.id]=step}
  save();render()}
function resumeAt(id){const st=S.at&&S.at[id],m=MISSIONS[id];return st&&m&&m.flow.some(f=>f.name===st)&&st!==m.flow[0].name?st:null}
function resumeMission(id){const st=resumeAt(id);if(!st)return false;
  if(S.mission!==id){parkMission();const P=S.paused&&S.paused[id];Object.assign(S,MISSION_FIELDS(),P||{});S.mission=id;if(!P)S.choice={...M().start};curDoc=((M().docs||[])[0]||{}).id}
  go(st);return true}
function parkMission(){const cur=S.mission;if(!cur||!resumeAt(cur))return;const keep={choice:S.choice,daysLeft:S.daysLeft};for(const k in MISSION_FIELDS())keep[k]=S[k];S.paused={...(S.paused||{}),[cur]:JSON.parse(JSON.stringify(keep))}}
function render(){if(STEPS[S.step])return STEPS[S.step]();if(S.mission&&MISSIONS[S.mission]&&M().flow.some(f=>f.name===S.step))return runFlow();STEPS.title()}

// Gear Byte wears on a mission's own steps (for example a space helmet on the Moon): the mission lists it in
// byteWear (an array of gear ids, or a function of the step name that returns one). It never changes the save.
function onSite(o){const m=S.mission&&MISSIONS[S.mission];let g=m&&m.byteWear;if(!g||!m.flow||!m.flow.some(f=>f.name===S.step))return o;
  if(typeof g==='function')g=g(S.step);if(!g||!g.length||typeof byteWearFix!=='function')return o;return {...o,wear:byteWearFix([...((o&&o.wear)||[]),...g])}}
// ---------- conversations (face to face) ----------
function speakerArt(who,mood){
  if(who==='byte')return `<div class="speaker byte-speaker">${byteBox({...onSite(S.byte),mood:mood==='neutral'?'neutral':mood==='think'?'think':'happy'},'big')}</div>`;
  const c=CAST[who];return `<div class="speaker">${portrait({...c,mood})}</div>`}
function talk(key,sceneKey,place,next){
  const lines=hook('talkLines',M().talks[key],key);let i=0,typing=null,lineId=0;
  screen('talk',`${scene(sceneKey)}<div class="talk-dim"></div>${hud(place)}<div class="stage" id="stage"></div>
   <div class="subtitle" id="sub"><div class="who" id="who"></div><p id="line"></p><div class="choices" id="choices"></div><div class="tap-hint" id="hint">${T('Tap to continue')}</div></div>`);
  const stage=$('#stage'),line=$('#line'),who=$('#who'),choices=$('#choices'),hint=$('#hint');
  function show(L,textOverride,moodOverride){
    const mood=moodOverride||L.mood||'smile';stage.innerHTML=speakerArt(L.who,mood);const sp=stage.firstElementChild;sp.classList.add('enter');
    const name=L.who==='byte'?S.byte.name:T(CAST[L.who].name), role=T(L.who==='byte'?'Your AI partner':CAST[L.who].role);
    who.innerHTML=`<b>${esc(name)}</b><span>${esc(role)}</span>`;
    const html=rich(textOverride||L.text);line.innerHTML=html;choices.innerHTML='';hint.hidden=true;
    // typewriter by revealing characters with a CSS mask: animate text opacity per word
    const words=$$('#line > *, #line',line).length;sp.classList.add('talking');
    line.classList.remove('fadein');void line.offsetWidth;line.classList.add('fadein');
    clearTimeout(typing);const myId=++lineId;const done=()=>{if(myId!==lineId)return;sp.classList.remove('talking');afterLine(L,!!textOverride)};
    const minT=Math.min(2400,400+html.replace(/<[^>]+>/g,'').length*18);const t0=Date.now();
    playLine(L.who,textOverride||L.text).then(()=>{typing=setTimeout(done,Math.max(0,minT-(Date.now()-t0)))});
  }
  function afterLine(L,isReply){
    if(L.clue&&!S.notes[L.clue]&&!isReply){choices.innerHTML=`<button class="choice clue">${T('Write this in my notebook')}</button><button class="choice ghost">${T('Keep listening')}</button>`;
      choices.firstChild.onclick=e=>{e.stopPropagation();S.notes[L.clue]=true;save();toast(T('Added to your notebook'),'good');advance()};choices.lastChild.onclick=e=>{e.stopPropagation();advance()};return}
    if(L.choices&&!isReply){choices.innerHTML=mixIdx(L.choices).map(([c,j])=>`<button class="choice" data-j="${j}">${esc(fill(T(c.t)))}</button>`).join('');
      $$('.choice',choices).forEach(b=>b.onclick=e=>{e.stopPropagation();const c=L.choices[b.dataset.j];if(c.good)heart(L.who);if(c.on)c.on();show(L,c.reply,c.mood);L._replied=true});return}
    if(hook('afterLine',false,L,{key,isReply,choices,advance}))return;
    hint.hidden=false}
  function advance(){stopVoice();i++;if(i>=lines.length){next();return}lines[i]._replied=false;show(lines[i])}
  $('#sub').onclick=e=>{if(e.target.closest('.gw,.choice'))return;if(choices.children.length)return;
    if(line.classList.contains('fadein')&&hint.hidden){clearTimeout(typing);lineId++;stopVoice();$('.speaker')?.classList.remove('talking');afterLine(lines[i],lines[i]._replied);return}
    advance()};
  show(lines[0]);
}

// ---------- steps: title, setup, hub, and each mission's flow ----------
// a new game starts with the earliest unlocked mission (the career journey when it exists)
function firstMission(){return Object.values(MISSIONS).filter(m=>!(m.after||[]).length).sort((a,b)=>a.day-b.day)[0].id}
function startMission(id,at){if(S.mission!==id)parkMission();if(S.at)delete S.at[id];if(S.paused)delete S.paused[id];Object.assign(S,MISSION_FIELDS());S.mission=id;hook('start',id);S.choice={...M().start};S.daysLeft=null;curDoc=((M().docs||[])[0]||{}).id;go(at||M().flow[0].name)}
function nextStep(){const f=M().flow;const i=f.findIndex(x=>x.name===S.step);if(i<0||i>=f.length-1){S.completed[S.mission]=S.completed[S.mission]||{stars:S.lastStars||0};go('hub');return}go(f[i+1].name)}
function runFlow(){const f=M().flow.find(x=>x.name===S.step);if(!f)return STEPS.hub();
  if(f.k==='talk')return talk(f.talk,f.scene,f.place,()=>{if(f.toast)toast(T(f.toast));nextStep()});
  if(f.k==='custom')return (M().custom&&M().custom[f.name]||STEPS[f.name])();
  ((typeof FLOW_KINDS!=='undefined'&&FLOW_KINDS[f.k])||{bench:renderWorkbench,criteria:renderCriteria,table:renderTable,consent:renderConsent,memo:renderMemo,reveal:renderReveal,debrief:renderDebrief,evening:renderEvening}[f.k]||STEPS.hub)()}
const STEPS={
  title(){const has=!!(RESUME&&RESUME.step&&!['title','setup'].includes(RESUME.step));
    screen('title',`${scene('home')}<div class="title-wrap"><h1 class="logo"><span>${T('Pathmakers')}</span><b>2040</b></h1>
      <div class="title-byte">${byteBox({...S.byte,mood:'happy'},'dance')}</div>
      <div class="title-btns">${has?`<button class="btn" id="cont">${T('Continue')}</button>`:''}<button class="btn ${has?'ghost':''}" id="new">${T(has?'New game':'Start')}</button></div>
      </div>`);
    $('#new').onclick=()=>{S=NEW();go('setup')};if(has)$('#cont').onclick=()=>{S={...NEW(),...RESUME};if(!S.mission)S.mission='maya';render()}},
  setup(){const colors=['#f0b35a','#ffffff','#a8743f','#8f86ff','#5fc9bd','#ff9aa8','#9aa3b8'];
    screen('setup',`<div class="setup">${I18N.setupHTML()}<h2>${T('Meet your AI partner')}</h2>
      <div class="setup-byte" id="sb">${byteBox(S.byte,'big wag')}</div>
      <label class="lbl" for="bname">${T('Partner’s name')}</label><input id="bname" maxlength="14" value="${esc(S.byte.name)}">
      <div class="lbl">${T('Color')}</div><div class="swatches">${colors.map(c=>`<button class="sw ${S.byte.color===c?'on':''}" data-c="${c}" style="background:${c}" aria-label="${T('Color')}"></button>`).join('')}</div>
      <div class="lbl">${T('Voice')}</div><div class="seg" id="vseg">${[['female','Female voice'],['male','Male voice']].map(([v,l])=>`<button class="segb ${(S.byte.voice||'female')===v?'on':''}" data-v="${v}">${T(l)}</button>`).join('')}</div>
      ${byteLookRows()}
      <label class="lbl" for="pname">${T('Your character’s name')}</label><input id="pname" maxlength="14" value="${esc(P())}">
      <button class="btn wide" id="go">${T('Start my first day')}</button></div>`);
    I18N.wireSetup(()=>STEPS.setup());
    const redraw=()=>{$('#sb').innerHTML=byteBox(S.byte,'big wag');save()};
    $$('.sw').forEach(b=>b.onclick=()=>{S.byte.color=b.dataset.c;$$('.sw').forEach(x=>x.classList.toggle('on',x===b));redraw()});
    wireByteLook(document,redraw);
    $$('[data-v]').forEach(b=>b.onclick=()=>{S.byte.voice=b.dataset.v;$$('[data-v]').forEach(x=>x.classList.toggle('on',x===b));save();MUSIC.unlock();playLine('byte','Hi! I’m your AI partner. Let’s do great work together!')});
    $('#bname').oninput=e=>{S.byte.name=e.target.value.trim()||'Byte';save()};$('#pname').oninput=e=>{S.player=e.target.value.trim()||'Juniper';save()};
    $('#go').onclick=()=>startMission(firstMission());hook('setup')},
  hub(){const list=Object.values(MISSIONS);const unlocked=m=>(m.after||[]).every(id=>S.completed[id]);
    screen('hub',`${scene('home')}${hud('Your day planner')}<div class="panel-card hub"><h2>${T('What’s next?')}</h2>
      ${Object.entries(CAREERS).map(([ck,cv])=>{const ms=list.filter(m=>m.career===ck).sort((a,b)=>a.day-b.day);if(!ms.length)return '';return `<div class="career"><div class="career-h">${esc(T(cv.name))}</div>${ms.map(m=>{const done=S.completed[m.id],open=unlocked(m);
        return `<button class="mcard ${done?'done':''} ${open?'':'locked'}" data-m="${m.id}" ${open?'':'disabled'}><div class="mday">${esc(m.dayLabel?T(m.dayLabel):m.tag?T(m.tag):T('Day {0}',m.day))}</div><div class="mtxt"><b>${esc(T(m.title))}</b><span>${esc(T(open?m.blurb:'Finish earlier days to unlock.'))}</span></div><div class="mstar">${done?'★'.repeat(done.stars||0)+'☆'.repeat(3-(done.stars||0)):''}</div></button>`}).join('')}</div>`}).join('')}
      </div>`);
    $$('.mcard').forEach(b=>b.onclick=()=>{if(!resumeMission(b.dataset.m))startMission(b.dataset.m)})},
  street(){screen('walk',`${scene('street')}${hud('Commonwealth Ave · Boston')}<div class="props walklayer"><div class="walk-byte">${byteBox({...S.byte,mood:'happy'},'trot')}</div><div class="pipjory" id="pj"><svg viewBox="-40 -60 150 110">${mini(0,40,{who:'pip',pose:'push',s:1.1})}<g transform="translate(14 8)"><rect x="0" y="0" width="40" height="30" rx="3" fill="#c9a26b" stroke="#7a5426" stroke-width="2"/><text x="20" y="13" text-anchor="middle" font-size="6" font-family="Nunito" font-weight="800" fill="#5b3b16"${I18N.fit(24)}>${T('TOTALLY')}</text><text x="20" y="21" text-anchor="middle" font-size="6" font-family="Nunito" font-weight="800" fill="#5b3b16"${I18N.fit(34)}>${T('NORMAL BOLTS')}</text></g>${mini(66,40,{who:'jory',pose:'push',s:1.1})}</svg></div></div>
      <div class="caption-card"><p>${T('Robots carry beams, a tram hums past, and two strangers wheel a crate down the sidewalk.')}</p><div class="row"><button class="btn small ghost" id="clue">${T('Look at the crate')}</button><button class="btn small" id="on">${T('Go to the hospital')}</button></div></div>`);
    $('#clue').onclick=()=>{S.notes.crate=true;S.crate=true;save();$('#pj').classList.add('flee');toast(T('The strangers hurry away. You noted the crate.'),'good');$('#clue').disabled=true};
    $('#on').onclick=()=>nextStep()}
};

// ---------- Workbench: documents in the graded reader ----------
let curDoc='memo';
function chartSVG(ch){const W=320,rowH=46,top=8,left=96,max=100,scale=v=>left+(v/max)*(W-left-28);
  return `<svg class="chart" viewBox="0 0 ${W} ${top+ch.rows.length*rowH+26}" role="img" aria-label="${esc(T(ch.title))}">
  ${[0,50,100].map(t=>`<line x1="${scale(t)}" x2="${scale(t)}" y1="${top}" y2="${top+ch.rows.length*rowH}" stroke="#d9def0"/><text x="${scale(t)}" y="${top+ch.rows.length*rowH+16}" text-anchor="middle" font-size="11" fill="#6b7190">${t}</text>`).join('')}
  ${ch.rows.map((r,i)=>{const y=top+i*rowH+8;return `<g class="bar-row" style="--d:${i*120}ms"><text x="0" y="${y+14}" font-size="12.5" font-weight="700" fill="#1f2340">${esc(T(r.label))}</text><text x="0" y="${y+29}" font-size="10.5" fill="#6b7190">${esc(T(r.n))}</text>
     <rect class="bar" x="${left}" y="${y+2}" width="${scale(r.v)-left}" height="20" rx="6" fill="${r.label==='BoneMend'?'#7c6cf0':'#16b3a6'}"/>
     <line x1="${scale(r.lo)}" x2="${scale(r.hi)}" y1="${y+12}" y2="${y+12}" stroke="#1f2340" stroke-width="2.5"/><line x1="${scale(r.lo)}" x2="${scale(r.lo)}" y1="${y+5}" y2="${y+19}" stroke="#1f2340" stroke-width="2.5"/><line x1="${scale(r.hi)}" x2="${scale(r.hi)}" y1="${y+5}" y2="${y+19}" stroke="#1f2340" stroke-width="2.5"/>
     <text x="${scale(r.hi)+6}" y="${y+16}" font-size="12" font-weight="800" fill="#1f2340">${r.v}</text></g>`}).join('')}</svg>`}
function renderWorkbench(){
  const D=M().docs;let doc=D.find(d=>d.id===curDoc);if(!doc){doc=D[0];curDoc=doc.id}S.read[curDoc]=1;save();const steps=hook('docSteps',doc.steps,doc);
  screen('bench',`${scene('workbench')}${hud(T('Workbench · {0}',T(M().place)))}
   <div class="bench"><div class="tabs">${D.map(d=>`<button class="tab ${d.id===curDoc?'on':''} ${S.read[d.id]?'':'new'}" data-d="${d.id}">${esc(T(d.title).split(/[:：]/)[0])}</button>`).join('')}</div>
   <article class="doc doc-${doc.kind}"><div class="doc-from">${T('From {0}',esc(T(doc.from)))}</div><h2>${esc(T(doc.title))}</h2>
    <div class="doc-tools"><button class="mini-btn" id="readme">${T('Read to me')}</button><span class="tiny muted">${T('Tap a sentence to mark it as evidence.')}</span></div>
    ${doc.steps.map((st0,i)=>{const up=st0.alt&&S.told;const st=up?{...st0,...st0.alt}:st0;return `<section class="step ${up?'updated':''}" ${up?'id="upd"':''}><div class="step-n">${i+1}</div><div class="step-body">${up?`<div class="upd-badge">${T('Updated')}</div>`:''}<p class="sent ${S.highlights[doc.id+i]?'hl':''}" data-k="${doc.id+i}">${rich(st.t)}</p>
      <figure class="fig"><figcaption>${capText(st.cap)}</figcaption>${VIZ[st.viz]?VIZ[st.viz](st.args||{}):''}</figure></div></section>`}).join('')}
   </article>
   ${companion()}<div class="bench-foot">${M().lesson?`<button class="btn ghost small" id="learn">${esc(T(M().lesson.label))}</button>`:''}<div id="tellslot"></div><button class="btn" id="next">${T('Set my criteria')}</button></div></div>`);
  $$('.tab').forEach(b=>b.onclick=()=>{curDoc=b.dataset.d;renderWorkbench()});
  $$('.sent').forEach(p=>p.onclick=e=>{if(e.target.closest('.gw'))return;const k=p.dataset.k;S.highlights[k]=!S.highlights[k];p.classList.toggle('hl');save();const R=M().react||{};if(S.highlights[k]&&R[k])byteSays(typeof R[k]==='function'?R[k]():R[k])});
  $('#readme').onclick=()=>{const items=[['narrator',doc.title]].concat(steps.map(b=>['narrator',b.t]));let k=0;const ps=$$('.sent');
    (async()=>{stopVoice();const id=playId;for(const [w,t] of items){if(id!==playId)break;const p=k>0?ps[k-1]:null;if(p)p.classList.add('reading');await playLine(w,t);playId=id;if(p)p.classList.remove('reading');k++}})()};
  renderTellButton();wireCompanion();if(M().lesson)$('#learn').onclick=()=>openLesson(M().lesson.id);hook('bench',doc);
  $('#next').onclick=()=>{const unread=D.filter(d=>!S.read[d.id]&&d.kind!=='ledger');if(unread.length){toast(T('Read the {0} first.',unread.map(d=>T(d.title).split(/[:：]/)[0]).join(T(' and '))));return}nextStep()};
}
function renderTellButton(){const slot=$('#tellslot');if(!slot)return;const TL=M().tell;if(!TL){slot.innerHTML='';return}
  if(S.notes[TL.clue]&&!S.told)slot.innerHTML=`<button class="btn ghost small" id="tell">${esc(T(TL.label).replace('Byte',S.byte.name))}</button>`;
  else if(S.told)slot.innerHTML=`<div class="byte-note">${byteBox({...S.byte,mood:'alert'})}<p>${esc(T(TL.note))}</p></div>`;
  else slot.innerHTML='';
  const t=$('#tell');if(t)t.onclick=()=>{S.told=true;save();unlock(TL.guide)&&toast(T('New Field Guide idea: {0}',T(FIELD_GUIDE[TL.guide].title)),'good');curDoc=TL.doc||curDoc;renderWorkbench();setTimeout(()=>{const u=$('#upd');if(u){u.scrollIntoView({behavior:'smooth',block:'center'});u.classList.add('flash')}},350)}}

// ---------- companion Byte on work screens: reacts, wags, opens chat ----------
function companion(){return `<button class="companion" id="comp" aria-label="${T('Talk to {0}',esc(S.byte.name))}">${byteBox({...onSite(S.byte),mood:'happy'})}</button>`}
function wireCompanion(){const c=$('#comp');if(c)c.onclick=openChat}
function byteSays(text,mood='alert'){const c=$('#comp');if(!c)return;c.innerHTML=byteBox({...onSite(S.byte),mood});c.classList.remove('hop');void c.offsetWidth;c.classList.add('hop');
  $$('.bubble').forEach(b=>b.remove());const b=document.createElement('div');b.className='bubble';b.textContent=T(text);document.body.appendChild(b);
  setTimeout(()=>{b.classList.add('out');c.innerHTML=byteBox({...onSite(S.byte),mood:'happy'})},4200);setTimeout(()=>b.remove(),4700)}

// ---------- Learn It Fast: a short lesson from Byte, then a 3-question check ----------
// picture captions are plain text: drop any [[glossary]] brackets a writer left in one
function capText(s){return esc(T(s||'')).replace(/\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g,'$1')}
function openLesson(id){const L=LESSONS[id];let qi=0,right=0;
  const d=sheet(esc(T(L.title)),`<div class="lesson">${L.steps.map((st,i)=>`<section class="step"><div class="step-n">${i+1}</div><div class="step-body"><p>${rich(st.t)}</p><figure class="fig"><figcaption>${capText(st.cap)}</figcaption>${VIZ[st.viz](st.args||{})}</figure></div></section>`).join('')}
   <div class="byte-note">${byteBox({...S.byte,mood:'happy'})}<p>${T('Got it? Try 3 quick questions.')}</p></div><div id="quiz"></div></div>`);
  playLine('byte','Here is how a broken bone heals.'.replace('how a broken bone heals',L.title.toLowerCase()));
  const q=()=>{const box=$('#quiz',d);if(qi>=L.quiz.length){box.innerHTML=`<div class="calib"><b>${right}/3</b><span>${T(right===3?'Perfect! You learned it fast.':'Nice work. You can read the steps again anytime.')}</span></div>`;S.lessons=S.lessons||{};S.lessons[id]=right;save();return}
    const Q=L.quiz[qi];box.innerHTML=`<h3>${esc(T(Q.q))}</h3><div class="quiz">${mixIdx(Q.opts).map(([o,j])=>`<button class="qopt" data-j="${j}">${esc(T(o))}</button>`).join('')}</div>`;
    $$('.qopt',box).forEach(b=>b.onclick=()=>{const j=+b.dataset.j;if(j===Q.a){b.classList.add('right');if(!b.dataset.miss)right++;box.insertAdjacentHTML('beforeend',`<p class="qwhy">${esc(T(Q.why))}</p><button class="btn small" id="qn">${T('Next')}</button>`);$$('.qopt',box).forEach(x=>x.disabled=true);$('#qn',box).onclick=()=>{qi++;q()}}else{b.classList.add('wrong');b.disabled=true;$$('.qopt',box).forEach(x=>x.dataset.miss=1)}})};q()}

// ---------- Criteria: set the bar before looking ----------
function renderCriteria(){
  screen('criteria',`${scene('workbench')}${hud(T('Workbench · {0}',T(M().place)))}<div class="panel-card"><h2>${T('What would make this a good decision?')}</h2>
   <p>${T('Pick the 1, 2 or 3 things that matter most, before you look at any futures.')}</p>
   ${M().criteriaHint?`<p class="tiny muted">${T(M().criteriaHint)}</p>`:''}
   <div class="crit">${M().criteria.map(c=>`<button class="critb ${S.criteria.includes(c.id)?'on':''}" data-c="${c.id}">${T(c.label).replace(/\[\[|\]\]/g,'')}</button>`).join('')}</div>
   <div class="byte-note">${byteBox({...onSite(S.byte),mood:'think'})}<p>${esc(T(M().criteriaNote||'Deciding what \u201cgood\u201d means first keeps a flashy option from fooling you.'))}</p></div>
   <button class="btn wide" id="next" ${S.criteria.length>=1?'':'disabled'}>${T('Open the Future Table')}</button></div>`);
  $$('.critb').forEach(b=>b.onclick=()=>{const id=b.dataset.c;if(S.criteria.includes(id))S.criteria=S.criteria.filter(x=>x!==id);else if(S.criteria.length<3)S.criteria.push(id);else{toast(T('Pick at most 3.'));return}save();renderCriteria()});
  $('#next').onclick=()=>nextStep()}

// ---------- Future Table (generic: missions give outcomes(plan, knows) as kinds with probabilities and criterion flags) ----------
function forecastFor(c,knows){const o=M().outcomes(c,knows??M().knows());const f={};for(const cr of M().criteria)f[cr.id]=o.reduce((a,x)=>a+x.p*(x.flags[cr.id]??1),0);return f}
function typicalFutures(c,rng){const o=M().outcomes(c,M().knows());const tot=o.reduce((a,x)=>a+x.p,0)||1;const want=o.map(x=>x.p/tot*10);const n=want.map(Math.floor);let left=10-n.reduce((a,b)=>a+b,0);
  want.map((w,i)=>[w-Math.floor(w),i]).sort((a,b)=>b[0]-a[0]).slice(0,left).forEach(([,i])=>n[i]++);const out=[];o.forEach((x,i)=>{for(let k=0;k<n[i];k++)out.push(x)});
  for(let i=out.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out}
function critScore(id,futs){return futs.filter(f=>(f.flags[id]??1)>0).length}
function sampleReal(c,rng){const o=M().outcomes(c,M().truth());const tot=o.reduce((a,x)=>a+x.p,0);let u=rng()*tot;for(const x of o){u-=x.p;if(u<=0)return {...x}}return {...o.at(-1)}}
function allPlans(){let plans=[{}];for(const ct of M().controls)plans=plans.flatMap(p=>ct.opts.map(([v])=>({...p,[ct.key]:v})));return plans}
function vig(kind){return (M().vignette||vignette)(kind)}
function controlsHTML(c,cls=''){return M().controls.map(ct=>`<div class="ctl"><div class="ctl-l">${esc(T(ct.label))}</div><div class="seg">${ct.opts.map(([v,l])=>`<button class="segb ${c[ct.key]===v?'on':''}" data-k="${ct.key}" data-v="${esc(JSON.stringify(v))}">${esc(T(l))}</button>`).join('')}</div></div>`).join('')}
function wireControls(root,rerender){$$('[data-k]',root).forEach(b=>b.onclick=e=>{e.stopPropagation();S.choice[b.dataset.k]=JSON.parse(b.dataset.v);save();rerender()})}
function renderTable(){
  const c=S.choice;const rng=rngFrom(S.seed*7919+JSON.stringify(c).length*31+Object.values(c).join('').length);
  const futs=typicalFutures(c,rng);const fc=forecastFor(c);
  const meters=S.criteria.filter(id=>id!=='agree').map(id=>{const n=critScore(id,futs);const cr=M().criteria.find(x=>x.id===id);if(!cr)return '';const lab=rich(cr.label);
    return `<div class="meter"><span>${lab}</span><div class="mbar"><i style="width:${n*10}%"></i><em style="left:${Math.round(fc[id]*100)}%"></em></div><b>${T('{0} of 10',n)}</b><small>${T('forecast {0}%',Math.round(fc[id]*100))}</small></div>`}).join('');
  screen('futuretable',`${scene('table')}${hud('The Future Table')}
  <div class="ft"><div class="ft-head"><div class="ft-byte">${byteBox({...onSite(S.byte),mood:'think'})}</div><p>${T('Here are 10 futures for this plan, spread out the way my forecast says. Change the plan and watch them shift.')}</p></div>
   <div class="futs" id="futs">${futs.map((f,i)=>`<figure class="fut" style="--d:${i*70}ms">${vig(f.kind)}<figcaption>${esc(T(f.cap))}</figcaption></figure>`).join('')}</div>
   ${M().tablePanel?M().tablePanel(c):''}
   <div class="meters">${meters}</div>${M().tablePanelAfter?M().tablePanelAfter(c):''}${M().tableNote?M().tableNote(c):''}
   <div class="controls">${controlsHTML(c)}</div>
   <div class="ft-foot"><button class="btn ghost small" id="why">${T('Ask {0} why',esc(S.byte.name))}</button><button class="btn" id="next">${T('Choose this plan')}</button></div>
   <div class="why" id="whybox" hidden></div></div>`);
  wireControls($('.controls'),renderTable);
  $('#why').onclick=()=>{const box=$('#whybox');box.hidden=false;box.innerHTML=`<p>${M().why(c)}</p>`;const gid=M().whyGuide&&M().whyGuide(c);if(gid)unlock(gid)&&toast(T('New Field Guide idea: {0}',T(FIELD_GUIDE[gid].title)),'good');box.scrollIntoView({behavior:'smooth',block:'nearest'})};
  $('#next').onclick=()=>nextStep();hook('table',c)}

// ---------- Consent conversation ----------
function renderConsent(){const K=M().consent,c=S.choice;const opts=K.opts(c,M());
  screen('talk',`${scene(K.scene||'hospital')}<div class="talk-dim"></div>${hud(K.place||M().place)}<div class="stage duo"><div class="speaker">${portrait({...CAST[K.left],mood:'think'})}</div><div class="speaker">${portrait({...CAST[K.right],mood:'worried'})}</div></div>
    <div class="subtitle"><div class="planpick"><div class="ctl-l">${T('Your plan')}</div>${controlsHTML(c)}</div>
      <div class="who"><b>${esc(T(K.title))}</b><span>${esc(T(K.role))}</span></div><p>${esc(T(K.prompt))}</p>
    <div class="choices">${mixIdx(opts).map(([o,j])=>`<button class="choice" data-j="${j}">${esc(o.t)}</button>`).join('')}</div>
    <div class="tiny muted" style="margin-top:6px">${K.note?esc(T(K.note)):T('Explaining honestly lets them give real <button class="gw" data-w="consent">consent</button>.')}</div></div>`);
  wireControls($('.planpick'),renderConsent);
  $$('.choice').forEach(b=>b.onclick=()=>{const o=opts[b.dataset.j];S.consent=o.good;if(o.good){heart(K.heart);const g=K.guide||'consent';unlock(g)&&toast(T('New Field Guide idea: {0}',T(FIELD_GUIDE[g].title)),'good')}save();
    $('.stage').innerHTML=`<div class="speaker">${portrait({...CAST[K.left],mood:o.good?'smile':'worried'})}</div><div class="speaker talking">${portrait({...CAST[K.replyWho],mood:o.mood})}</div>`;
    playLine(K.replyWho,o.reply);
    $('.subtitle').innerHTML=`<div class="who"><b>${esc(T(CAST[K.replyWho].name))}</b><span>${esc(T(CAST[K.replyWho].role))}</span></div><p>${esc(T(o.reply))}</p><div class="choices"><button class="choice" id="cont">${T(o.good?'Write my decision':'Try explaining again')}</button></div>`;
    $('#cont').onclick=()=>o.good?nextStep():renderConsent();hook('consentReply',o)});hook('consent',opts)}

// ---------- Decision memo, confidence, signature ----------
function memoChecks(t,ai){const s=' '+t.toLowerCase().replace(/[’']/g,"'")+' ';const A=ai||{};const Mm=M().memo;return hook('memoChecks',[
  {k:'treatment',ok:A.treatment??TRX(Mm.plan).test(s),l:T(Mm.planLabel||'Names the plan')},
  {k:'reason',ok:A.reason??TRX(/because|since|so that| so she| so her| so it|that's why|that is why|which is why|this is why|the reason|reason is|in order to| to avoid| to keep| to help| to make sure|balances|helps|means|otherwise| due to|thanks to|given that|as she|as her/).test(s),l:T('Gives a reason')},
  {k:'odds',ok:A.odds??TRX(/\d|percent|%|out of|likely|unlikely|probably|pretty sure|very sure|not sure|i'm sure|i am sure|most of the time|chance (is|of|it)|odds/).test(s),l:T('Says how sure, with odds')},
  {k:'maya',ok:A.maya??TRX(Mm.care).test(s),l:T(Mm.careLabel)}],s,A)}
function renderMemo(){
  const Mm=M().memo,starters=Mm.starters;
  screen('memo',`${scene('workbench')}${hud('Workbench · Decision')}<div class="panel-card">
   <h2>${T('Write your decision')}</h2><p>${T('2 or 3 sentences: what to do, why, and how sure you are.')}</p>
   <div class="starters">${starters.map(s=>T(s)).map(s=>`<button class="mini-btn" data-s="${esc(s)}">${esc(s.trim())}…</button>`).join('')}</div>
 <div class="ta-wrap"><textarea id="memo" rows="5" placeholder="${esc(T(Mm.placeholder))}">${esc(S.memo)}</textarea>
   <ul class="checks" id="checks"></ul>
   <div class="byte-note" id="review">${byteBox({...onSite(S.byte),mood:'neutral'})}<p>${T('When you’re ready, I can review it like a kind editor.')}</p></div>
   <div class="row"><button class="btn ghost small" id="rev">${T('Ask {0} to review',esc(S.byte.name))}</button></div>
   <div class="conf"><div class="ctl-l">${T('How sure are you that this plan will go well?')}</div><input type="range" id="conf" min="0" max="4" step="1" value="${S.conf}"><div class="conf-l"><span>${T('Coin flip')}</span><span>${T('Pretty sure')}</span><span>${T('Sure')}</span></div></div>
   <button class="btn wide" id="sign">${T('Sign as {0}',esc(T(Mm.signAs+'{0}',P())))}</button></div>`);
  wireMics();const ta=$('#memo');const upd=()=>{S.memo=ta.value;S.memoAI=null;save();$('#checks').innerHTML=memoChecks(ta.value).map(c=>`<li class="${c.ok?'ok':''}">${c.l}</li>`).join('')};upd();ta.oninput=upd;
  $$('[data-s]').forEach(b=>b.onclick=()=>{ta.value=(ta.value&&!/\s$/.test(ta.value)?ta.value+' ':ta.value)+b.dataset.s;ta.focus();upd()});
  $('#conf').oninput=e=>{S.conf=+e.target.value;save()};
  $('#rev').onclick=async()=>{const box=$('#review p');const miss=memoChecks(ta.value).filter(c=>!c.ok).map(c=>c.l.toLowerCase());
    box.textContent=T('Reading...');const sm=await getSample();let out=null;
    if(sm&&ta.value.trim().length>15){try{const r=await sm.json(`${byteContext()}\n\nThe player wrote this decision memo about ${Mm.topic}:\n"""${ta.value.slice(0,800)}"""\nTheir chosen plan: ${M().planName(S.choice)}.\nJudge generously, by meaning not keywords. Return JSON: {"treatment":bool (names ${Mm.planWhat||'a treatment'}),"reason":bool (gives any reason why, in any wording),"odds":bool (states how sure or gives odds/numbers),"maya":bool (${Mm.careLabel.toLowerCase()}),"feedback":"2 or 3 short kind sentences for a young player: one strength, then the single most useful improvement; point out any wrong odds; don't rewrite it"}`,{modelTier:'quick',cache:false});
        if(r&&typeof r==='object'){S.memoAI=r;save();$('#checks').innerHTML=memoChecks(ta.value,r).map(c=>`<li class="${c.ok?'ok':''}">${c.l}</li>`).join('');out=r.feedback}}catch(e){}}
    box.textContent=out||(miss.length?T('Nice start! To make it stronger, add: {0}.',miss.join(T(', '))):T('This is clear and honest. You named the plan, gave a reason, said how sure you are, and included what matters to the people involved.'));MUSIC.babble(box.textContent,'byte')};
  $('#sign').onclick=()=>{if(ta.value.trim().length<20){toast(T('Write at least a sentence or two first.'));return}
    const sig=document.createElement('div');sig.className='signing';sig.innerHTML=`<div class="sigcard"><div class="sigline">${esc(T(Mm.signAs+'{0}',P()))}</div><p>${T('Signed. You are accountable for this decision.')}</p></div>`;document.body.appendChild(sig);
    setTimeout(()=>{sig.remove();nextStep()},1700)}}

// ---------- The real future ----------
function renderReveal(){const RV=M().reveal;
  if(!S.result){S.result=sampleReal(S.choice,rngFrom(Date.now()%100000+7));save()}
  const R=S.result,days=RV.days(S.choice);
  screen('reveal',`${scene('table')}${hud('The real future')}<div class="reveal"><div class="cal" id="cal"><span>${T(RV.unit||'Day')}</span><b id="day">1</b></div>
   <div class="real-fut" id="rf" hidden><div class="rf-card">${vig(R.kind)}</div><h2>${esc(T(R.cap))}</h2></div>
   <div class="rf-talk" id="rft" hidden></div><button class="btn" id="next" hidden>${T('See how you did')}</button></div>`);
  let d=1;const t=setInterval(()=>{if(!$('#day')){clearInterval(t);return}d++;$('#day').textContent=d;if(d>=days){clearInterval(t);$('#cal').classList.add('done');
    setTimeout(()=>{$('#rf').hidden=false;$('#rft').hidden=false;const line=RV.lines[R.kind]||'';if(line)playLine(RV.who,line);
      unlock('forecast')&&toast(T('New Field Guide idea: Forecasts are not promises'),'good');
      $('#rft').innerHTML=`<div class="rf-maya">${portrait({...CAST[RV.who],mood:RV.mood(R.kind)})}</div><p>“${esc(T(line))}”</p>`;$('#next').hidden=false;$('#next').onclick=()=>nextStep()},500)}},Math.max(40,Math.min(160,1600/days)))}

// ---------- Debrief ----------
// calibration: how sure she said she was vs. Byte's forecast that the plan meets her goals
function calibLine(){const pct=[50,62,75,87,97][S.conf??2],words=T(['a coin flip','a little sure','pretty sure','very sure','sure'][S.conf??2]);
  const fc=forecastFor(S.choice),ids=S.criteria.filter(x=>fc[x]!=null);if(!ids.length)return '';const f=Math.round(100*ids.reduce((a,k)=>a*fc[k],1));
  const close=Math.abs(pct-f)<=15;if(close)unlock('calibration');
  return `<div class="calib"><b>${f}%</b><span>${T('Byte\u2019s forecast that your plan meets all your goals. You said you felt {words} (about {pct}%). ',{words,pct})}${T(close?'Nicely <button class="gw" data-w="calibration">calibrated</button>!':pct>f?'You were more sure than the odds. That\u2019s called overconfidence.':'You were less sure than the odds. You can trust good evidence a bit more.')}</span></div>`}
function expectedFor(c){const f=forecastFor(c,M().truth());return id=>f[id]??1}
function renderDebrief(){
  const c=S.choice,R=S.result;const TP=M().trap(c);
  const crit=S.criteria.filter(x=>x!=='agree');const score=p=>{const e=expectedFor(p);return crit.reduce((a,id)=>a*e(id),1)};
  const mine=score(c),best=Math.max(...allPlans().map(score));const fit=mine>=best-.08;
  const memoOk0=memoChecks(S.memo,S.memoAI).filter(x=>x.ok).length>=3;
  const sc=hook('debriefScore',{T:TP,fit,memoOk:memoOk0,max:3},c),memoOk=sc.memoOk,fit2=sc.fit;
  const SB=starsFrom({ask:TP.ok,decision:fit2,heart:memoOk&&S.consent}),stars=Math.min(sc.max,SB.stars);S.lastStars=stars;
  const truth=M().outcomes(c,M().truth());const pk=truth.filter(o=>o.kind===R.kind).reduce((a,o)=>a+o.p,0);const good=crit.every(id=>(R.flags[id]??1)>0);
  const luck=good?(pk<.4?'Lucky':'As expected'):(pk<.3?'Unlucky':'As expected');
  if(S.consent)heart(M().consent.left);
  window.PARENT&&PARENT.record({stars,luck,good,checks:memoChecks(S.memo,S.memoAI)});
  screen('debrief',`${scene(M().debriefScene||'hospital')}<div class="talk-dim"></div>${hud('Debrief')}<div class="panel-card debrief">
   <h2>${T('How you did')}</h2>
   <div class="scores"><div class="score">${starRow(SB)}<b>${T('Stars')}</b><span>${T('For asking well, choosing wisely and caring')}</span></div>
    <div class="score"><div class="luckpill ${luck.toLowerCase().replace(' ','-')}">${T(luck)}</div><b>${T('Luck')}</b><span>${T('How the dice landed. Luck never earns stars.')}</span></div></div>
   <ul class="dlist">
    <li class="${TP.ok?'ok':''}">${starIcon('ask',TP.ok)}${esc(TP.text)}</li>
    <li class="${fit?'ok':''}">${starIcon('decision',fit)}${T(fit?'Your plan was one of the best for the goals you picked.':'Another plan would have done better on the goals you picked. Try the Future Table again next time.')}</li>
    <li class="${memoOk&&S.consent?'ok':''}">${starIcon('heart',memoOk&&S.consent)}${T(memoOk?'Your written decision was clear.':'Your written decision could add a reason, odds, or what matters to the people involved.')} ${T(S.consent?'You explained honestly, so they could truly agree.':'')}</li>
    ${(M().debriefLines?M().debriefLines(c):[]).map(x=>`<li class="${x.ok?'ok':''}">${esc(T(x.text))}</li>`).join('')}</ul>
   <div class="byte-note">${byteBox({...onSite(S.byte),mood:'happy'})}<p>${good?esc(T(M().byteGood)):fit?T('Sometimes a good plan gets unlucky. That’s why we judge decisions by what we knew, not only by how they turned out.'):T('This plan was never likely to meet every goal you picked. That’s fine if a goal didn’t really matter to you. Next time, pick only the goals you care about, so the Future Table can find the plan that fits them.')}</p></div>
   ${calibLine()}
   <div class="earned"><span>${T('{0} Field Guide ideas',S.guide.length)}</span><span>${T('{0} new words',S.words.length)}</span><span>${T('{0} hearts',Object.values(S.hearts).reduce((a,b)=>a+b,0))}</span></div>
   <button class="btn wide" id="next">${T(M().flow.some(f=>f.k==='evening'||f.home)?'Head home':'Finish the day')}</button></div>`);
  $('#next').onclick=()=>{awardStars(S.mission,SB);nextStep()};hook('debrief',{stars,good,luck})}

function renderEvening(){const lines=M().evening();
  screen('evening',`${scene(M().eveningScene||'night')}${hud(M().eveningPlace||'Home · Boston · 9:10 PM')}<div class="evening"><div class="eve-byte">${byteBox({...onSite(S.byte),mood:M().eveningMood||'happy'},'big')}</div>
   <div class="caption-card dark">${lines.map(l=>`<p>${l}</p>`).join('')}
   <div class="row"><button class="btn small ghost" id="guide">${T('Open Field Guide')}</button><button class="btn small" id="plan">${T('Plan tomorrow')}</button></div></div></div>`);
  $('#guide').onclick=openGuide;$('#plan').onclick=()=>{S.completed[S.mission]=S.completed[S.mission]||{stars:S.lastStars||0};save();go('hub')}}

// ---------- boot ----------
(function boot(){mergeMissions();LATE.forEach(f=>{try{f()}catch(e){console.warn(e)}});RESUME=migrateSave(loadLocal());render();connectCloud()})();

// Android app hooks: Back closes the top sheet or progress page (returns true if it closed something); pause silences audio.
window.pmBack=()=>{const top=[...document.querySelectorAll('.sheet,.pp')].pop();if(!top)return false;const x=top.querySelector('.x,[aria-label="Close"]');if(x)x.click();else top.remove();return true};
window.pmPause=()=>{try{MUSIC.pause();document.querySelectorAll('audio').forEach(a=>a.pause())}catch(e){}};
document.addEventListener('visibilitychange',()=>{try{document.hidden?window.pmPause():MUSIC.resume()}catch(e){}});
