// game.js — state, saving, screens and the mission flow for Pathmakers 2040.
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const APP=$('#app');
const NEW=()=>({v:1,player:'Juniper',byte:{name:'Byte',color:'#f0b35a',ears:'floppy',voice:'female'},step:'title',notes:{},told:false,highlights:{},
  criteria:[],choice:{tx:'gel',pt:false,date:'fri'},seed:1,conf:2,memo:'',consent:null,words:[],guide:[],hearts:{},result:null,done:false,read:{}});
let S=NEW(),RESUME=null;

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
    if(j){const r=JSON.parse(j);const loc=loadLocal();if(r&&r.v===1&&(!loc||loc.step==='title'||(r.t||0)>=(loc.t||0))){RESUME=r;try{localStorage.setItem('pm2040',j)}catch(e){}if(APP.classList.contains('title'))render()}}
  }catch(e){}
}

// ---------- helpers ----------
const P=()=>S.player||'Juniper';
const fill=t=>t.replace(/\{P\}/g,P());
function rngFrom(seed){let a=(seed>>>0)||1;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}
function esc(t){return String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
// graded reader markup: [[word]] → tappable glossary word
function rich(t){return esc(fill(t)).replace(/\[\[([^\]]+)\]\]/g,(m,w)=>{const k=w.toLowerCase();return GLOSSARY[k]?`<button class="gw" data-w="${esc(k)}">${w}</button>`:w})}
function toast(msg,kind=''){const n=$$('.toast:not(.out)').length;const d=document.createElement('div');d.className='toast '+kind;d.style.marginTop=(n*52)+'px';d.innerHTML=msg;document.body.appendChild(d);setTimeout(()=>d.classList.add('out'),2600+n*600);setTimeout(()=>d.remove(),3200+n*600)}
// ---------- voices: prerecorded clips (AUDIO from audio.js), device voice as fallback ----------
let curAudio=null,playId=0;
function stopVoice(){playId++;MUSIC.duck(false);try{if(curAudio){curAudio.pause();curAudio=null}}catch(e){}}
function playLine(who,text){stopVoice();const id=playId;if(S.mute)return Promise.resolve();
  const t=speechText(fill(text));const vname=who==='byte'?BYTE_VOICES[S.byte.voice||'female']:(VOICES[who]||VOICES.narrator);const key=vname+'|'+t;
  MUSIC.duck(true);const res0=()=>{};
  return new Promise(res1=>{const res=()=>{if(id===playId)MUSIC.duck(false);res1()};const src=window.AUDIO&&AUDIO[key];
    if(src){const a=new Audio(src);curAudio=a;a.onended=()=>res();a.onerror=()=>res();a.play().catch(()=>res());return}
    const dur=who==='byte'?MUSIC.babble(t,who):0;setTimeout(res,Math.max(700,dur?dur*1000+150:t.length*55))})}
// play a recorded clip by exact voice name (passers-by); silent if there is no clip
function playVoice(voice,text){const src=window.AUDIO&&AUDIO[voice+'|'+speechText(text)];if(!src||S.mute)return;stopVoice();const a=new Audio(src);curAudio=a;MUSIC.duck(true);a.onended=()=>MUSIC.duck(false);a.play().catch(()=>MUSIC.duck(false))}
async function playSeq(items){stopVoice();const id=playId;for(const [who,t] of items){if(id!==playId)return;await playLine(who,t);playId=id}}
function speak(t){playLine('narrator',t)}
function stopBabble(){}
// speech to text where the browser allows it (not inside Claude artifacts, which block the microphone)
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
function micButton(target){if(!SR)return '';return `<button class="mic" type="button" data-target="${target}" aria-label="Speak instead of typing"><svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="12" rx="3" fill="currentColor"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg></button>`}
function wireMics(){$$('.mic').forEach(b=>b.onclick=()=>{const el=document.getElementById(b.dataset.target);if(!el)return;
  try{const r=new SR();r.lang='en-US';r.interimResults=true;const base=el.value&&!/\s$/.test(el.value)?el.value+' ':el.value;b.classList.add('on');
    r.onresult=e=>{let t='';for(const x of e.results)t+=x[0].transcript;el.value=base+t;el.dispatchEvent(new Event('input'))};
    r.onerror=()=>{b.classList.remove('on');b.remove();toast('The microphone isn\u2019t available here. You can type instead.')};r.onend=()=>b.classList.remove('on');r.start()}catch(e){b.remove()}})}
function learnWord(k){if(!S.words.includes(k)){S.words.push(k);save();bumpHud('words')}}
function unlock(id){if(!S.guide.includes(id)){S.guide.push(id);save();bumpHud('guide');return true}return false}
function heart(who,n=1){S.hearts[who]=(S.hearts[who]||0)+n;save()}
function bumpHud(id){const b=$('#hud-'+id);if(b){const n=id==='words'?S.words.length:S.guide.length;let sp=b.querySelector('span');if(!sp){sp=document.createElement('span');b.appendChild(sp)}sp.textContent=n;b.classList.remove('bump');void b.offsetWidth;b.classList.add('bump')}}

// glossary popover (one at a time)
document.addEventListener('click',e=>{
  const w=e.target.closest('.gw');const pop=$('.gpop');
  if(w){e.stopPropagation();if(pop)pop.remove();const k=w.dataset.w;learnWord(k);
    const d=document.createElement('div');d.className='gpop';d.innerHTML=`<b>${esc(w.textContent)}</b><p>${esc(GLOSSARY[k])}</p><button class="mini-btn" data-say="1">Listen</button>`;
    document.body.appendChild(d);const r=w.getBoundingClientRect();const top=r.bottom+8+d.offsetHeight>innerHeight?r.top-d.offsetHeight-8:r.bottom+8;
    d.style.top=Math.max(8,top)+'px';d.style.left=Math.min(innerWidth-d.offsetWidth-12,Math.max(12,r.left+r.width/2-d.offsetWidth/2))+'px';
    d.querySelector('[data-say]').onclick=ev=>{ev.stopPropagation();playLine('narrator',k+'. '+GLOSSARY[k])};return}
  if(pop&&!e.target.closest('.gpop'))pop.remove();
},true);

// ---------- HUD ----------
const ICON={
  on:'<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
  off:'<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  chat:'<svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  guide:'<svg viewBox="0 0 24 24"><path d="M4 5c3-1 6-1 8 1 2-2 5-2 8-1v14c-3-1-6-1-8 1-2-2-5-2-8-1z M12 6v14" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  words:'<svg viewBox="0 0 24 24"><path d="M5 19 10 5h1l5 14M7 14h7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M17 9h3M18.5 7.5v3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
};
function hud(place){return `<div class="hud"><div class="place">${esc(place)}</div><div class="hud-btns">
 <button id="hud-mute" class="hbtn" aria-label="${S.mute?'Turn sound on':'Turn sound off'}">${S.mute?ICON.off:ICON.on}</button>
  <button id="hud-chat" class="hbtn" aria-label="Talk to ${esc(S.byte.name)}">${ICON.chat}</button>
  <button id="hud-guide" class="hbtn" aria-label="Field Guide">${ICON.guide}${S.guide.length?`<span>${S.guide.length}</span>`:''}</button>
  <button id="hud-words" class="hbtn" aria-label="Word Book">${ICON.words}${S.words.length?`<span>${S.words.length}</span>`:''}</button></div></div>`}
function wireHud(){const m=$('#hud-mute');if(m)m.onclick=()=>{S.mute=!S.mute;save();stopVoice();MUSIC.mute(S.mute);m.innerHTML=S.mute?ICON.off:ICON.on};const c=$('#hud-chat');if(c)c.onclick=openChat;const g=$('#hud-guide');if(g)g.onclick=openGuide;const w=$('#hud-words');if(w)w.onclick=openWords}
function sheet(title,html){const d=document.createElement('div');d.className='sheet';d.innerHTML=`<div class="sheet-in"><div class="sheet-top"><h2>${title}</h2><button class="x" aria-label="Close">×</button></div><div class="sheet-body">${html}</div></div>`;document.body.appendChild(d);
  requestAnimationFrame(()=>d.classList.add('on'));d.querySelector('.x').onclick=()=>{d.classList.remove('on');setTimeout(()=>d.remove(),250)};return d}
function openGuide(){const items=Object.entries(FIELD_GUIDE);sheet('Field Guide',`<p class="muted">${S.guide.length} of ${items.length} found in Boston</p>`+items.map(([id,g])=>S.guide.includes(id)?`<div class="fg"><div class="fg-track">${g.track}</div><h3>${g.title}</h3><p>${g.text}</p><div class="realcard"><span>True today</span>${g.real.replace(/^True today: /,'')}</div></div>`:`<div class="fg locked"><h3>?</h3><p>Keep playing to discover this idea.</p></div>`).join(''))}
function openWords(){sheet('Word Book',S.words.length?`<div class="wordlist">${S.words.map(k=>`<div class="wb"><button class="gw" data-w="${esc(k)}">${esc(k)}</button><p>${esc(GLOSSARY[k])}</p></div>`).join('')}</div>`:'<p class="muted">Tap any underlined word to learn it. It will be saved here.</p>')}

// ---------- chat with Byte ----------
let CHAT=[],SAMPLE=null;
async function getSample(){if(SAMPLE!==null)return SAMPLE;try{SAMPLE=window.claude&&claude.use?await claude.use('sample'):null}catch(e){SAMPLE=null}return SAMPLE}
function byteContext(){return `You are ${S.byte.name}, the player's AI partner in the game "Pathmakers 2040", shaped like a cute robot puppy. In this 2040, AI is far smarter than any human; you are a superintelligent expert (in medicine, science, history, everything) and you are impressively, concretely helpful. The player, ${P()}, is a kid who reads well above their grade level; speak warmly and clearly, with a little puppy playfulness, in 2 to 4 short sentences unless a list is clearly better. No markdown.
The world: Boston, 2040. AI quietly runs a lot of everyday things (the hospital's systems are run by an AI called Halo), and people treat that as normal and mundane, the way we treat electricity. Humans still make value choices, give consent, and sign off, because the decisions are about their own lives. Mention the AI parts casually, never as a big deal.
Current case: Maya Lin, 11, a violinist, broke her left radius (clean fracture). Her recital is Friday, in 9 days; it could be moved about 3 weeks later if they ask. Options: (1) surgery with pins: heals straight about 95 in 100 (studied in 12,000 kids), no violin for about 6 weeks; (2) cast: about 80 in 100 heal straight, 88 with physical therapy (21,000 kids), violin in about 3 weeks; (3) BoneMend hydrogel, a newer treatment that came out last year: about 90 in 100, violin in about 8 days for many kids, but tested on only 40 kids (error bar roughly 76 to 97); its main ingredient is HX-2, the cooling gel in sunburn patches; in kids who once got a rash from an HX-2 patch, about 60 in 100 got a rash from BoneMend and had to switch to a cast.
What you know: ${S.told?'The player told you Maya once got a rash from a cooling patch, so you now estimate about a 60% chance of a BoneMend skin reaction for her.':'Maya’s Boston record shows no allergies, but records from other countries are often not synced, so you do not actually know her history.'}
How to help: answer factual questions exactly and impressively, with real numbers and reasoning, and explain anything (science, words, how the game works). When asked which option to pick, do not simply hand over the answer at first: point out the single most important consideration${S.told?' (Maya\u2019s rash and BoneMend\u2019s HX-2)':' (and ask whether the family mentioned any allergies or reactions, especially from care abroad, since records from other countries are often missing)'}, then ask what matters most to Maya and her family. Once the player says what matters, give a clear recommendation tied to that priority, with the odds. Then remind them gently that Maya and her family decide after a clear explanation, and the doctor signs. If asked how to "win" or "beat the game", explain the steps plainly: read the documents, notice clues from the family, tell you anything the record is missing, pick what matters most, test plans on the Future Table, explain honestly to Maya and her dad, write a clear decision with odds, and sign. You can also teach anything (science, words, history) at a kid-friendly level. Stay kind and age-appropriate; gently steer away from anything unsuitable for a child. Never ask for the player’s real name, address, or school.`}
function cannedReply(q){q=q.toLowerCase();
  if(/rash|allerg|patch|itch/.test(q)){if(!S.told){S.told=true;save();return 'Woof, that changes everything! If Maya reacted to an HX-2 cooling patch, BoneMend has about a 60% chance of giving her a rash, so I’d avoid it. A cast with physical therapy plus asking to move the recital is my top pick now.'}return 'Right, the rash! I’d skip BoneMend for Maya. Pins are the surest for the bone; a cast with therapy is gentler and lets her play in about 3 weeks.'}
  if(/beat|win|how do i|what do i do|stuck|help/.test(q))return 'Here’s the path: read the 3 documents, listen for clues from Maya’s family, tell me anything her record is missing, pick what matters most, test plans on the Future Table, explain the choice honestly to Maya and her dad, then write your decision with odds and sign it!';
  if(/best|which|pick|choose|should|recommend/.test(q))return S.told?'I can\u2019t pick for you, but here\u2019s the big thing: Maya\u2019s rash came from HX-2, the same ingredient in BoneMend. So what matters most to her: the safest healing, or getting to her recital?':'Before I answer, did her family mention any allergies or reactions? Records from other countries are often missing. And what matters most to Maya: the safest healing, or getting to her recital?';
  if(/bonemend|gel/.test(q))return 'BoneMend fills the break with a gel that helps bone cells rebuild fast, so many kids play again in about 8 days. Only 40 kids have tried it, so the true heal-straight rate could be anywhere from about 76 to 97 in 100.';
  if(/pin|surg/.test(q))return 'Pins hold the bone pieces perfectly still, so about 95 in 100 heal straight. The tradeoff: about 6 weeks before she can play violin.';
  if(/cast/.test(q))return 'A cast heals straight about 80 in 100 times, or 88 with physical therapy, and she could play in about 3 weeks. It’s the most studied option: 21,000 kids!';
  if(/safe|heal.*(best|most)|long.?term|arm first/.test(q))return S.told?'Then I\u2019d pick pins (about 95 in 100 heal straight) or a cast with therapy (88 in 100) and ask to move the recital. Skip BoneMend because of her rash.':'Then pins are the surest: about 95 in 100 heal straight, though she\u2019d miss about 6 weeks of violin.';
  if(/recital matters|play.*(most|matter)|get to (her|the) recital/.test(q))return S.told?'Then a cast with therapy and a moved recital gives her the best shot without risking a rash from BoneMend.':'Then BoneMend gives the best shot at Friday, if her skin is fine with HX-2. Moving the recital with a cast is the safer backup.';
  if(/recital|move|friday/.test(q))return 'Moving the recital about 3 weeks is a great move with a cast: she’d very likely be ready. Keeping Friday only works with BoneMend, and only if her skin is fine with it.';
  if(/halo/.test(q))return 'Halo is the hospital\u2019s system. It keeps schedules, supplies, and scans running, like the hospital\u2019s brain for chores. The big people decisions are yours.';
  if(/who are you|what are you/.test(q))return `I’m ${S.byte.name}, your AI partner! I read everything, run forecasts, and build Future Tables. You bring what matters to people and make the call.`;
  return 'Great question! Ask me about Maya’s options, the odds, how bones heal, or anything about 2040. I know a lot!'}
function openChat(){const d=sheet(`Talk to ${esc(S.byte.name)}`,`<div class="chatlog" id="chatlog"></div><form class="chatform" id="chatform"><input id="chatin" autocomplete="off" placeholder="Ask ${esc(S.byte.name)} anything" maxlength="300">${micButton('chatin')}<button class="btn small" type="submit">Send</button></form>`);
  d.classList.add('chat');wireMics();const told0=S.told;d.querySelector('.x').addEventListener('click',()=>{if(S.step==='workbench'&&S.told!==told0)setTimeout(renderWorkbench,260)});const log=$('#chatlog');
  const draw=()=>{log.innerHTML=`<div class="msg b"><div class="mini-byte">${byteBox(S.byte)}</div><p>Hi ${esc(P())}! Ask me anything.</p></div>`+CHAT.map(m=>`<div class="msg ${m.role==='user'?'u':'b'}">${m.role==='user'?'':`<div class="mini-byte">${byteBox(S.byte)}</div>`}<p>${esc(m.content)}</p></div>`).join('');log.scrollTop=log.scrollHeight};draw();
  $('#chatform').onsubmit=async e=>{e.preventDefault();const inp=$('#chatin');const q=inp.value.trim();if(!q)return;inp.value='';CHAT.push({role:'user',content:q});draw();
    if(/rash|allerg|patch|itch/i.test(q)&&!S.told){S.told=true;save()}
    const placeholder={role:'assistant',content:'Thinking...'};CHAT.push(placeholder);draw();
    const sm=await getSample();let answer=null;
    if(sm){try{const turns=[{role:'user',content:byteContext()+'\n\nThe player says: '+CHAT[0].content}];
        const hist=CHAT.slice(0,-1);const msgs=[{role:'user',content:byteContext()+'\n\nConversation so far follows. Reply as '+S.byte.name+' to the last player message.'}].concat(hist.map(m=>({role:m.role,content:m.content})));
        // keep alternation: merge leading user turns
        const merged=[];for(const m of msgs){if(merged.length&&merged.at(-1).role===m.role)merged.at(-1).content+='\n'+m.content;else merged.push({...m})}
        const r=await sm(merged,{modelTier:'quick',cache:false,onText:({text})=>{placeholder.content=text;draw()}});answer=r.text}catch(err){answer=null}}
    placeholder.content=answer||cannedReply(q);draw();MUSIC.babble(placeholder.content,'byte');if(S.step==='workbench'&&!d.isConnected)renderWorkbench()};
}

// ---------- painted backgrounds: canvas painters (PAINT, from paint_boston.js) with vector fallback ----------
let CURSCENE=null;const BG={cv:null,cache:{},key:null,raf:0,t0:performance.now()};
function scene(k){CURSCENE=k;return window.PAINT&&PAINT[k]?'':SCENES[k]()}
function bgSize(){const cv=BG.cv,r=cv.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1);return [Math.max(1,Math.round(r.width*dpr)),Math.max(1,Math.round(r.height*dpr))]}
function applyScene(){const k=CURSCENE;if(!(window.PAINT&&PAINT[k])){if(BG.cv)BG.cv.style.display='none';return}
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
function screen(cls,html){stopVoice();APP.className='screen '+cls;const sk=null;APP.innerHTML=html;const scn=CURSCENE;
  if(scn&&PROPS[scn]&&PROPS[scn].length)APP.insertAdjacentHTML('afterbegin',propsLayer(scn));
  applyScene();CURSCENE=null;wireHud();wireProps();window.scrollTo(0,0);MUSIC.play(TRACK_FOR[cls]||TRACK_BY_SCENE[scn]||'work')}
document.addEventListener('pointerdown',()=>{MUSIC.unlock();MUSIC.mute(!!S.mute)},{capture:true});
function go(step){S.step=step;save();render()}
function render(){(STEPS[S.step]||STEPS.title)()}

// ---------- conversations (face to face) ----------
function speakerArt(who,mood){
  if(who==='byte')return `<div class="speaker byte-speaker">${byteBox({...S.byte,mood:mood==='neutral'?'neutral':mood==='think'?'think':'happy'},'big')}</div>`;
  const c=CAST[who];return `<div class="speaker">${portrait({...c,mood})}</div>`}
function talk(key,sceneKey,place,next){
  const lines=TALKS[key];let i=0,typing=null,lineId=0;
  screen('talk',`${scene(sceneKey)}<div class="talk-dim"></div>${hud(place)}<div class="stage" id="stage"></div>
   <div class="subtitle" id="sub"><div class="who" id="who"></div><p id="line"></p><div class="choices" id="choices"></div><div class="tap-hint" id="hint">Tap to continue</div></div>`);
  const stage=$('#stage'),line=$('#line'),who=$('#who'),choices=$('#choices'),hint=$('#hint');
  function show(L,textOverride,moodOverride){
    const mood=moodOverride||L.mood||'smile';stage.innerHTML=speakerArt(L.who,mood);const sp=stage.firstElementChild;sp.classList.add('enter');
    const name=L.who==='byte'?S.byte.name:CAST[L.who].name, role=L.who==='byte'?'Your AI partner':CAST[L.who].role;
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
    if(L.clue&&!S.notes[L.clue]&&!isReply){choices.innerHTML=`<button class="choice clue">Write this in my notebook</button><button class="choice ghost">Keep listening</button>`;
      choices.firstChild.onclick=e=>{e.stopPropagation();S.notes[L.clue]=true;save();toast('Added to your notebook','good');advance()};choices.lastChild.onclick=e=>{e.stopPropagation();advance()};return}
    if(L.choices&&!isReply){choices.innerHTML=L.choices.map((c,j)=>`<button class="choice" data-j="${j}">${esc(fill(c.t))}</button>`).join('');
      $$('.choice',choices).forEach(b=>b.onclick=e=>{e.stopPropagation();const c=L.choices[b.dataset.j];if(c.good)heart(L.who==='byte'?'byte':key);show(L,c.reply,c.mood);L._replied=true});return}
    hint.hidden=false}
  function advance(){stopVoice();i++;if(i>=lines.length){next();return}lines[i]._replied=false;show(lines[i])}
  $('#sub').onclick=e=>{if(e.target.closest('.gw,.choice'))return;if(choices.children.length)return;
    if(line.classList.contains('fadein')&&hint.hidden){clearTimeout(typing);lineId++;stopVoice();$('.speaker')?.classList.remove('talking');afterLine(lines[i],lines[i]._replied);return}
    advance()};
  show(lines[0]);
}

// ---------- steps ----------
const STEPS={
  title(){const has=!!(RESUME&&RESUME.step&&!['title','setup'].includes(RESUME.step));
    screen('title',`${scene('home')}<div class="title-wrap"><h1 class="logo"><span>Pathmakers</span><b>2040</b></h1>
      <div class="title-byte">${byteBox({...S.byte,mood:'happy'},'dance')}</div>
      <div class="title-btns">${has?'<button class="btn" id="cont">Continue</button>':''}<button class="btn ${has?'ghost':''}" id="new">${has?'New game':'Start'}</button></div>
      </div>`);
    $('#new').onclick=()=>{S=NEW();go('setup')};if(has)$('#cont').onclick=()=>{S=RESUME;render()}},
  setup(){const colors=['#f0b35a','#ffffff','#a8743f','#8f86ff','#5fc9bd','#ff9aa8','#9aa3b8'];
    screen('setup',`<div class="setup"><h2>Meet your AI partner</h2>
      <div class="setup-byte" id="sb">${byteBox(S.byte,'big wag')}</div>
      <label class="lbl" for="bname">Partner’s name</label><input id="bname" maxlength="14" value="${esc(S.byte.name)}">
      <div class="lbl">Color</div><div class="swatches">${colors.map(c=>`<button class="sw ${S.byte.color===c?'on':''}" data-c="${c}" style="background:${c}" aria-label="Color"></button>`).join('')}</div>
      <div class="lbl">Voice</div><div class="seg" id="vseg">${[['female','Female voice'],['male','Male voice']].map(([v,l])=>`<button class="segb ${(S.byte.voice||'female')===v?'on':''}" data-v="${v}">${l}</button>`).join('')}</div>
      <div class="lbl">Ears</div><div class="seg">${['floppy','pointy','round'].map(e=>`<button class="segb ${S.byte.ears===e?'on':''}" data-e="${e}">${e[0].toUpperCase()+e.slice(1)}</button>`).join('')}</div>
      <label class="lbl" for="pname">Your character’s name</label><input id="pname" maxlength="14" value="${esc(S.player)}">
      <button class="btn wide" id="go">Start my first day</button></div>`);
    const redraw=()=>{$('#sb').innerHTML=byteBox(S.byte,'big wag');save()};
    $$('.sw').forEach(b=>b.onclick=()=>{S.byte.color=b.dataset.c;$$('.sw').forEach(x=>x.classList.toggle('on',x===b));redraw()});
    $$('[data-e]').forEach(b=>b.onclick=()=>{S.byte.ears=b.dataset.e;$$('[data-e]').forEach(x=>x.classList.toggle('on',x===b));redraw()});
    $$('[data-v]').forEach(b=>b.onclick=()=>{S.byte.voice=b.dataset.v;$$('[data-v]').forEach(x=>x.classList.toggle('on',x===b));save();MUSIC.unlock();playLine('byte','Hi! I\u2019m your AI partner. Let\u2019s do great work together!')});
    $('#bname').oninput=e=>{S.byte.name=e.target.value.trim()||'Byte';save()};$('#pname').oninput=e=>{S.player=e.target.value.trim()||'Juniper';save()};
    $('#go').onclick=()=>go('morning')},
  morning(){talk('morning','home','Home · Boston · 7:40 AM',()=>go('street'))},
  street(){screen('walk',`${scene('street')}${hud('Commonwealth Ave · Boston')}<div class="props walklayer"><div class="walk-byte">${byteBox({...S.byte,mood:'happy'},'trot')}</div><div class="pipjory" id="pj"><svg viewBox="-40 -60 150 110">${mini(0,40,{who:'pip',pose:'push',s:1.1})}<g transform="translate(14 8)"><rect x="0" y="0" width="40" height="30" rx="3" fill="#c9a26b" stroke="#7a5426" stroke-width="2"/><text x="20" y="13" text-anchor="middle" font-size="6" font-family="Nunito" font-weight="800" fill="#5b3b16">TOTALLY</text><text x="20" y="21" text-anchor="middle" font-size="6" font-family="Nunito" font-weight="800" fill="#5b3b16">NORMAL BOLTS</text></g>${mini(66,40,{who:'jory',pose:'push',s:1.1})}</svg></div></div>
      <div class="caption-card"><p>Robots carry beams, a tram hums past, and two strangers wheel a crate down the sidewalk.</p><div class="row"><button class="btn small ghost" id="clue">Look at the crate</button><button class="btn small" id="on">Go to the hospital</button></div></div>`);
    $('#clue').onclick=()=>{S.notes.crate=true;save();$('#pj').classList.add('flee');toast('The strangers hurry away. You noted the crate.','good');$('#clue').disabled=true};
    $('#on').onclick=()=>go('arrive')},
  arrive(){talk('imani','hospital','Boston Harbor Hospital',()=>go('maya'))},
  maya(){talk('maya','hospital','Room 4B · Boston Harbor Hospital',()=>{toast('New work on your Workbench');go('workbench')})},
  workbench(){renderWorkbench()},
  criteria(){renderCriteria()},
  table(){renderTable()},
  consent(){renderConsent()},
  memo(){renderMemo()},
  reveal(){renderReveal()},
  debrief(){renderDebrief()},
  evening(){renderEvening()}
};

// ---------- Workbench: documents in the graded reader ----------
let curDoc='memo';
function chartSVG(ch){const W=320,rowH=46,top=8,left=96,max=100,scale=v=>left+(v/max)*(W-left-28);
  return `<svg class="chart" viewBox="0 0 ${W} ${top+ch.rows.length*rowH+26}" role="img" aria-label="${esc(ch.title)}">
  ${[0,50,100].map(t=>`<line x1="${scale(t)}" x2="${scale(t)}" y1="${top}" y2="${top+ch.rows.length*rowH}" stroke="#d9def0"/><text x="${scale(t)}" y="${top+ch.rows.length*rowH+16}" text-anchor="middle" font-size="11" fill="#6b7190">${t}</text>`).join('')}
  ${ch.rows.map((r,i)=>{const y=top+i*rowH+8;return `<g class="bar-row" style="--d:${i*120}ms"><text x="0" y="${y+14}" font-size="12.5" font-weight="700" fill="#1f2340">${esc(r.label)}</text><text x="0" y="${y+29}" font-size="10.5" fill="#6b7190">${esc(r.n)}</text>
     <rect class="bar" x="${left}" y="${y+2}" width="${scale(r.v)-left}" height="20" rx="6" fill="${r.label==='BoneMend'?'#7c6cf0':'#16b3a6'}"/>
     <line x1="${scale(r.lo)}" x2="${scale(r.hi)}" y1="${y+12}" y2="${y+12}" stroke="#1f2340" stroke-width="2.5"/><line x1="${scale(r.lo)}" x2="${scale(r.lo)}" y1="${y+5}" y2="${y+19}" stroke="#1f2340" stroke-width="2.5"/><line x1="${scale(r.hi)}" x2="${scale(r.hi)}" y1="${y+5}" y2="${y+19}" stroke="#1f2340" stroke-width="2.5"/>
     <text x="${scale(r.hi)+6}" y="${y+16}" font-size="12" font-weight="800" fill="#1f2340">${r.v}</text></g>`}).join('')}</svg>`}
function renderWorkbench(){
  const doc=DOCS.find(d=>d.id===curDoc);S.read[curDoc]=1;save();
  screen('bench',`${scene('workbench')}${hud('Workbench · Boston Harbor Hospital')}
   <div class="bench"><div class="tabs">${DOCS.map(d=>`<button class="tab ${d.id===curDoc?'on':''} ${S.read[d.id]?'':'new'}" data-d="${d.id}">${esc(d.title.split(':')[0])}</button>`).join('')}</div>
   <article class="doc doc-${doc.kind}"><div class="doc-from">From ${esc(doc.from)}</div><h2>${esc(doc.title)}</h2>
    <div class="doc-tools"><button class="mini-btn" id="readme">Read to me</button><span class="tiny muted">Tap a sentence to mark it as evidence.</span></div>
    ${doc.steps.map((st0,i)=>{const up=st0.alt&&S.told;const st=up?{...st0,...st0.alt}:st0;return `<section class="step ${up?'updated':''}" ${up?'id="upd"':''}><div class="step-n">${i+1}</div><div class="step-body">${up?'<div class="upd-badge">Updated</div>':''}<p class="sent ${S.highlights[doc.id+i]?'hl':''}" data-k="${doc.id+i}">${rich(st.t)}</p>
      <figure class="fig"><figcaption>${esc(st.cap||'')}</figcaption>${VIZ[st.viz]?VIZ[st.viz](st.args||{}):''}</figure></div></section>`}).join('')}
   </article>
   ${companion()}<div class="bench-foot"><button class="btn ghost small" id="learn">Learn it fast: how a broken bone heals</button><div id="tellslot"></div><button class="btn" id="next">Set my criteria</button></div></div>`);
  $$('.tab').forEach(b=>b.onclick=()=>{curDoc=b.dataset.d;renderWorkbench()});
  $$('.sent').forEach(p=>p.onclick=e=>{if(e.target.closest('.gw'))return;const k=p.dataset.k;S.highlights[k]=!S.highlights[k];p.classList.toggle('hl');save();if(S.highlights[k]&&REACT[k])byteSays(S.notes.rash&&k==='sheet3'?'Maya\u2019s dad said she got a rash from a cooling patch!':REACT[k]);
    if(k==='sheet3'&&S.highlights[k]&&S.notes.rash&&!S.told)toast('This matches what Maya’s dad told you!','good')});
  $('#readme').onclick=()=>{const items=[['narrator',doc.title]].concat(doc.steps.map(b=>['narrator',b.t]));let k=0;const ps=$$('.sent');
    (async()=>{stopVoice();const id=playId;for(const [w,t] of items){if(id!==playId)break;const p=k>0?ps[k-1]:null;if(p)p.classList.add('reading');await playLine(w,t);playId=id;if(p)p.classList.remove('reading');k++}})()};
  renderTellButton();wireCompanion();$('#learn').onclick=()=>openLesson('bones');
  $('#next').onclick=()=>{const unread=DOCS.filter(d=>!S.read[d.id]&&d.id!=='ledger');if(unread.length){toast('Read the '+unread.map(d=>d.title.split(':')[0]).join(' and ')+' first.');return}go('criteria')};
}
function renderTellButton(){const slot=$('#tellslot');if(!slot)return;
  if(S.notes.rash&&!S.told)slot.innerHTML=`<button class="btn ghost small" id="tell">Tell ${esc(S.byte.name)} about Maya’s rash</button>`;
  else if(S.told)slot.innerHTML=`<div class="byte-note" data-speak="byte">${byteBox({...S.byte,mood:'alert'})}<p>Thanks! I updated my forecast: if Maya is sensitive to HX-2, BoneMend has about a 60% chance of a skin reaction.</p></div>`;
  else slot.innerHTML='';
  const t=$('#tell');if(t)t.onclick=()=>{S.told=true;save();unlock('only-you-know')&&toast('New Field Guide idea: Information only you have','good');curDoc='memo';renderWorkbench();setTimeout(()=>{const u=$('#upd');if(u){u.scrollIntoView({behavior:'smooth',block:'center'});u.classList.add('flash')}},350)}}

// ---------- companion Byte on work screens: reacts, wags, opens chat ----------
function companion(){return `<button class="companion" id="comp" aria-label="Talk to ${esc(S.byte.name)}">${byteBox({...S.byte,mood:'happy'})}</button>`}
function wireCompanion(){const c=$('#comp');if(c)c.onclick=openChat}
function byteSays(text,mood='alert'){const c=$('#comp');if(!c)return;c.innerHTML=byteBox({...S.byte,mood});c.classList.remove('hop');void c.offsetWidth;c.classList.add('hop');
  $$('.bubble').forEach(b=>b.remove());const b=document.createElement('div');b.className='bubble';b.textContent=text;document.body.appendChild(b);
  setTimeout(()=>{b.classList.add('out');c.innerHTML=byteBox({...S.byte,mood:'happy'})},4200);setTimeout(()=>b.remove(),4700)}
const REACT={memo7:'Nine days until the recital. That\u2019s tight!',memo8:'Only 40 kids. I could be wrong about BoneMend.',record3:'Hmm, a record can be missing things.',sheet2:'HX-2... where have I heard that?',sheet3:'This one could really matter for Maya.',ledger2:'Calder Bay again. Who builds a secret datacenter?'};

// ---------- Learn It Fast: a short lesson from Byte, then a 3-question check ----------
function openLesson(id){const L=LESSONS[id];let qi=0,right=0;
  const d=sheet(esc(L.title),`<div class="lesson">${L.steps.map((st,i)=>`<section class="step"><div class="step-n">${i+1}</div><div class="step-body"><p>${rich(st.t)}</p><figure class="fig"><figcaption>${esc(st.cap)}</figcaption>${VIZ[st.viz](st.args||{})}</figure></div></section>`).join('')}
   <div class="byte-note">${byteBox({...S.byte,mood:'happy'})}<p>Got it? Try 3 quick questions.</p></div><div id="quiz"></div></div>`);
  playLine('byte','Here is how a broken bone heals.');
  const q=()=>{const box=$('#quiz',d);if(qi>=L.quiz.length){box.innerHTML=`<div class="calib"><b>${right}/3</b><span>${right===3?'Perfect! You learned it fast.':'Nice work. You can read the steps again anytime.'}</span></div>`;S.lessons=S.lessons||{};S.lessons[id]=right;save();return}
    const Q=L.quiz[qi];box.innerHTML=`<h3>${esc(Q.q)}</h3><div class="quiz">${Q.opts.map((o,j)=>`<button class="qopt" data-j="${j}">${esc(o)}</button>`).join('')}</div>`;
    $$('.qopt',box).forEach(b=>b.onclick=()=>{const j=+b.dataset.j;if(j===Q.a){b.classList.add('right');if(!b.dataset.miss)right++;box.insertAdjacentHTML('beforeend',`<p class="qwhy">${esc(Q.why)}</p><button class="btn small" id="qn">Next</button>`);$$('.qopt',box).forEach(x=>x.disabled=true);$('#qn',box).onclick=()=>{qi++;q()}}else{b.classList.add('wrong');b.disabled=true;$$('.qopt',box).forEach(x=>x.dataset.miss=1)}})};q()}

// ---------- Criteria: set the bar before looking ----------
function renderCriteria(){
  screen('criteria',`${scene('workbench')}${hud('Workbench · Boston Harbor Hospital')}<div class="panel-card"><h2>What would make this a good decision?</h2>
   <p>Pick 2 or 3 things that matter most, before you look at any futures.</p>
   <p class="tiny muted">Not sure what one means? <button class="gw" data-w="heals straight">Heals straight</button> means the bone grows back in its normal shape.</p>
   <div class="crit">${CRITERIA.map(c=>`<button class="critb ${S.criteria.includes(c.id)?'on':''}" data-c="${c.id}">${c.label.replace(/\[\[|\]\]/g,'')}</button>`).join('')}</div>
   <div class="byte-note">${byteBox({...S.byte,mood:'think'})}<p>Deciding what “good” means first keeps a flashy option from fooling you. Want to ask Maya what she’d pick? You can, later.</p></div>
   <button class="btn wide" id="next" ${S.criteria.length>=2?'':'disabled'}>Open the Future Table</button></div>`);
  $$('.critb').forEach(b=>b.onclick=()=>{const id=b.dataset.c;if(S.criteria.includes(id))S.criteria=S.criteria.filter(x=>x!==id);else if(S.criteria.length<3)S.criteria.push(id);else{toast('Pick at most 3.');return}save();renderCriteria()});
  $('#next').onclick=()=>go('table')}

// ---------- Future Table ----------
// Byte's forecast per criterion, computed exactly from the model (what Byte knows)
function forecastFor(c){const p=modelProbs(c,false),r=c.tx==='gel'?p.rash:0;const rashPlays=c.date==='moved'?.8*.5:0;
  const straight=(1-r)*p.straight+r*.8,plays=(1-r)*p.straight*p.ready+r*rashPlays;return {straight,plays,skin:1-r,quick:plays}}
// a "typical" batch of 10 whose counts match the forecast (rounded), in shuffled order
function typicalFutures(c,rng){const f=forecastFor(c);const nR=10-Math.round(f.skin*10),nS=Math.round(f.straight*10),nP=Math.min(nS,Math.round(f.plays*10));
  const out=[];for(let i=0;i<10;i++)out.push({rash:i<nR,straight:false,plays:false});
  const order=[...out.keys()].sort((x,y)=>(out[x].rash-out[y].rash));let s=0;for(const i of order)if(s<nS){out[i].straight=true;s++}
  let q=0;for(const i of order)if(q<nP&&out[i].straight&&(!out[i].rash||c.date==='moved')){out[i].plays=true;q++}
  for(const o of out){o.kind=o.rash?'rash':!o.straight?'crooked':o.plays?(c.date==='moved'?'moved':'recital'):'healed';
    o.cap={rash:'Skin reaction. Switched to a cast.',crooked:'Healed crooked. Needs another fix.',recital:'Played Bach on Friday!',moved:'Played at the moved recital!',healed:'Healed straight. Missed the recital.'}[o.kind]}
  for(let i=out.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out}
function critScore(id,futs){return futs.filter(f=>({straight:f.straight,plays:f.plays,skin:!f.rash,agree:true,quick:f.plays||f.kind==='recital'})[id]).length}
function renderTable(){
  const c=S.choice;const pk=c.tx+(c.pt?'+pt':'')+'/'+c.date;const random=false;
  const rng=rngFrom(S.seed*7919+({pins:1,cast:2,gel:3}[c.tx])*31+(c.pt?5:0)+(c.date==='moved'?11:0));
  const futs=random?Array.from({length:10},()=>sampleFuture(c,false,rng)):typicalFutures(c,rng);
  const fc=forecastFor(c);
  const meters=S.criteria.filter(id=>id!=='agree').map(id=>{const n=critScore(id,futs),f=Math.round(fc[id]*10);const lab=rich(CRITERIA.find(x=>x.id===id).label);
    return `<div class="meter"><span>${lab}</span><div class="mbar"><i style="width:${n*10}%"></i><em style="left:${f*10}%" title="Forecast"></em></div><b>${n} of 10</b><small>forecast ${Math.round(fc[id]*100)}%</small></div>`}).join('');
  const wob=random&&S.criteria.some(id=>id!=='agree'&&Math.abs(critScore(id,futs)-Math.round(fc[id]*10))>=2);
  screen('futuretable',`${scene('table')}${hud('The Future Table')}
  <div class="ft"><div class="ft-head"><div class="ft-byte">${byteBox({...S.byte,mood:'think'})}</div><p>Here are 10 futures for this plan, spread out the way my forecast says. Change the plan and watch them shift.</p></div>
   <div class="futs" id="futs">${futs.map((f,i)=>`<figure class="fut" style="--d:${i*70}ms">${vignette(f.kind)}<figcaption>${f.cap}</figcaption></figure>`).join('')}</div>
   <div class="meters">${meters}</div>
   <div class="controls">
    <div class="ctl"><div class="ctl-l">Treatment</div><div class="seg">${['pins','cast','gel'].map(t=>`<button class="segb ${c.tx===t?'on':''}" data-tx="${t}">${TX_LABEL[t]}</button>`).join('')}</div></div>
    <div class="ctl two"><div><div class="ctl-l">Physical therapy</div><div class="seg">${[[false,'No'],[true,'Yes']].map(([v,l])=>`<button class="segb ${c.pt===v?'on':''}" data-pt="${v}">${l}</button>`).join('')}</div></div>
     <div><div class="ctl-l">Recital</div><div class="seg">${[['fri','Keep Friday'],['moved','Ask to move it']].map(([v,l])=>`<button class="segb ${c.date===v?'on':''}" data-date="${v}">${l}</button>`).join('')}</div></div></div>
   </div>
   <div class="ft-foot"><button class="btn ghost small" id="why">Ask ${esc(S.byte.name)} why</button><button class="btn" id="next">Suggest this plan to Maya</button></div>
   <div class="why" id="whybox" hidden></div></div>`);
  $$('[data-tx]').forEach(b=>b.onclick=()=>{S.choice.tx=b.dataset.tx;save();renderTable()});
  $$('[data-pt]').forEach(b=>b.onclick=()=>{S.choice.pt=b.dataset.pt==='true';save();renderTable()});
  $$('[data-date]').forEach(b=>b.onclick=()=>{S.choice.date=b.dataset.date;save();renderTable()});
  $('#why').onclick=()=>{const p=modelProbs(c,false);const box=$('#whybox');box.hidden=false;
    box.innerHTML=`<p><b>${TX_LABEL[c.tx]}${c.pt?' with physical therapy':''}:</b> the bone grows back straight about ${Math.round(p.straight*100)}% of the time. ${p.ready?`If it heals well, she’s ready ${c.date==='fri'?'by Friday':'for the moved recital'} about ${Math.round(p.ready*100)}% of the time.`:`She can’t play ${c.date==='fri'?'by Friday':'in 3 weeks'} with this treatment.`} ${c.tx==='gel'?(S.told?'Because of Maya’s rash, a skin reaction is likely: about 60%.':'I see no allergy in her record, so I forecast a skin reaction at about 5%.'):''} ${c.tx==='gel'?'Only 40 kids have tried BoneMend, so I’m less sure about these numbers.':''}</p>`;
    if(c.tx==='gel')unlock('sample-size')&&toast('New Field Guide idea: Sample size','good')};
  $('#next').onclick=()=>go('consent');}

// ---------- Consent conversation ----------
function renderConsent(){
  const c=S.choice,p=modelProbs(c,false);const tx=(c.tx==='gel'?'BoneMend gel':TX_LABEL[c.tx].toLowerCase())+(c.pt?' plus physical therapy':'');
  const honest=`I suggest ${tx}. It heals straight about ${Math.round(p.straight*100)} out of 100 times${c.date==='moved'?', and we could ask to move your recital three weeks':''}. ${c.tx==='gel'&&S.told?'Because of your old rash, there’s a big chance of a skin reaction.':''} What do you two think?`;
  const opts=[{t:honest,good:true,mood:'smile',reply:c.date==='fri'&&!p.ready?'So I’ll miss Friday... but I want my arm to work for a long time. Okay. I agree.':'Thank you for explaining. I understand. Let’s do it.'},
   {t:`Trust me, ${tx} is the best. Don’t worry about the details.`,good:false,mood:'worried',reply:'Um... okay. But I don’t really understand what will happen.'},
   {t:`You’ll definitely play on Friday!`,good:false,mood:'surprised',reply:'Definitely? Are you sure? Byte’s futures didn’t say that.'}];
  screen('talk',`${scene('hospital')}<div class="talk-dim"></div>${hud('Room 4B · Boston Harbor Hospital')}<div class="stage duo"><div class="speaker">${portrait({...CAST.dad,mood:'think'})}</div><div class="speaker">${portrait({...CAST.maya,mood:'worried'})}</div></div>
    <div class="subtitle"><div class="planpick"><div class="ctl-l">Your plan</div>
      <div class="seg">${['pins','cast','gel'].map(t=>`<button class="segb ${c.tx===t?'on':''}" data-tx="${t}">${TX_LABEL[t]}</button>`).join('')}</div>
      <div class="seg">${[[false,'No therapy'],[true,'Physical therapy']].map(([v,l])=>`<button class="segb ${c.pt===v?'on':''}" data-pt="${v}">${l}</button>`).join('')}</div>
      <div class="seg">${[['fri','Keep Friday'],['moved','Move the recital']].map(([v,l])=>`<button class="segb ${c.date===v?'on':''}" data-date="${v}">${l}</button>`).join('')}</div></div>
      <div class="who"><b>Maya and Wei Lin</b><span>Patient and parent</span></div><p>So, what do you suggest? And will I get to play?</p>
    <div class="choices">${opts.map((o,j)=>`<button class="choice" data-j="${j}">${esc(o.t)}</button>`).join('')}</div>
    <div class="tiny muted" style="margin-top:6px">Explaining honestly lets them give real <button class="gw" data-w="consent">consent</button>.</div></div>`);
  $$('.planpick [data-tx]').forEach(b=>b.onclick=e=>{e.stopPropagation();S.choice.tx=b.dataset.tx;save();renderConsent()});
  $$('.planpick [data-pt]').forEach(b=>b.onclick=e=>{e.stopPropagation();S.choice.pt=b.dataset.pt==='true';save();renderConsent()});
  $$('.planpick [data-date]').forEach(b=>b.onclick=e=>{e.stopPropagation();S.choice.date=b.dataset.date;save();renderConsent()});
  $$('.choice').forEach(b=>b.onclick=()=>{const o=opts[b.dataset.j];S.consent=o.good;if(o.good){heart('maya');unlock('consent')&&toast('New Field Guide idea: Informed consent','good')}save();
    $('.stage').innerHTML=`<div class="speaker">${portrait({...CAST.dad,mood:o.good?'smile':'worried'})}</div><div class="speaker talking">${portrait({...CAST.maya,mood:o.mood})}</div>`;
    $('.subtitle').innerHTML=`<div class="who"><b>Maya</b><span>Patient, age 11</span></div><p>${esc(o.reply)}</p><div class="choices"><button class="choice" id="cont">${o.good?'Write my decision':'Try explaining again'}</button></div>`;
    $('#cont').onclick=()=>o.good?go('memo'):renderConsent()})}

// ---------- Decision memo, confidence, signature ----------
function memoChecks(t,ai){const s=' '+t.toLowerCase().replace(/[’']/g,"'")+' ';const A=ai||{};return [
  {k:'treatment',ok:A.treatment??/pin|surg|cast|gel|bonemend|therap/.test(s),l:'Names the treatment'},
  {k:'reason',ok:A.reason??/because|since|so that| so she| so her| so it|that's why|that is why|which is why|this is why|the reason|reason is|in order to| to avoid| to keep| to help| to make sure|balances|helps|means|otherwise| due to|thanks to|given that|as she|as her/.test(s),l:'Gives a reason'},
  {k:'odds',ok:A.odds??/\d|percent|%|out of|likely|unlikely|probably|pretty sure|very sure|not sure|i'm sure|i am sure|most of the time|chance (is|of|it)|odds/.test(s),l:'Says how sure, with odds'},
  {k:'maya',ok:A.maya??/maya|she |her |recital|violin|family|dad/.test(s),l:'Includes what Maya cares about'}]}
function renderMemo(){
  const starters=['I recommend ','because ','The chance it heals straight is about ','Maya cares about ','We will check by '];
  screen('memo',`${scene('workbench')}${hud('Workbench · Decision')}<div class="panel-card">
   <h2>Write your decision</h2><p>2 or 3 sentences: what to do, why, and how sure you are.</p>
   <div class="starters">${starters.map(s=>`<button class="mini-btn" data-s="${esc(s)}">${esc(s.trim())}…</button>`).join('')}</div>
 <div class="ta-wrap"><textarea id="memo" rows="5" placeholder="I recommend a cast with physical therapy because…">${esc(S.memo)}</textarea>
   <ul class="checks" id="checks"></ul>
   <div class="byte-note" id="review">${byteBox({...S.byte,mood:'neutral'})}<p>When you’re ready, I can review it like a kind editor.</p></div>
   <div class="row"><button class="btn ghost small" id="rev">Ask ${esc(S.byte.name)} to review</button></div>
   <div class="conf"><div class="ctl-l">How sure are you that this plan will go well?</div><input type="range" id="conf" min="0" max="4" step="1" value="${S.conf}"><div class="conf-l"><span>Coin flip</span><span>Pretty sure</span><span>Sure</span></div></div>
   <button class="btn wide" id="sign">Sign as Dr. ${esc(P())}</button></div>`);
  wireMics();const ta=$('#memo');const upd=()=>{S.memo=ta.value;S.memoAI=null;save();$('#checks').innerHTML=memoChecks(ta.value).map(c=>`<li class="${c.ok?'ok':''}">${c.l}</li>`).join('')};upd();ta.oninput=upd;
  $$('[data-s]').forEach(b=>b.onclick=()=>{ta.value=(ta.value&&!/\s$/.test(ta.value)?ta.value+' ':ta.value)+b.dataset.s;ta.focus();upd()});
  $('#conf').oninput=e=>{S.conf=+e.target.value;save()};
  $('#rev').onclick=async()=>{const box=$('#review p');const miss=memoChecks(ta.value).filter(c=>!c.ok).map(c=>c.l.toLowerCase());
    box.textContent='Reading...';const sm=await getSample();let out=null;
    if(sm&&ta.value.trim().length>15){try{const r=await sm.json(`${byteContext()}\n\nThe player wrote this decision memo for Maya's treatment:\n"""${ta.value.slice(0,800)}"""\nTheir chosen plan: ${TX_LABEL[S.choice.tx]}${S.choice.pt?' with physical therapy':''}, recital ${S.choice.date==='fri'?'kept on Friday':'moved 3 weeks later'}.\nJudge generously, by meaning not keywords. Return JSON: {"treatment":bool (names a treatment),"reason":bool (gives any reason why, in any wording),"odds":bool (states how sure or gives odds/numbers),"maya":bool (mentions what Maya or her family care about),"feedback":"2 or 3 short kind sentences for a young player: one strength, then the single most useful improvement; point out any wrong odds; don't rewrite it"}`,{modelTier:'quick',cache:false});
        if(r&&typeof r==='object'){S.memoAI=r;save();$('#checks').innerHTML=memoChecks(ta.value,r).map(c=>`<li class="${c.ok?'ok':''}">${c.l}</li>`).join('');out=r.feedback}}catch(e){}}
    box.textContent=out||(miss.length?`Nice start! To make it stronger, add: ${miss.join(', ')}.`:'This is clear and honest. You named the plan, gave a reason, said how sure you are, and included what Maya cares about.');MUSIC.babble(box.textContent,'byte')};
  $('#sign').onclick=()=>{if(ta.value.trim().length<20){toast('Write at least a sentence or two first.');return}
    const sig=document.createElement('div');sig.className='signing';sig.innerHTML=`<div class="sigcard"><div class="sigline">Dr. ${esc(P())}</div><p>Signed. You are accountable for this decision.</p></div>`;document.body.appendChild(sig);
    setTimeout(()=>{sig.remove();go('reveal')},1700)}}

// ---------- The real future ----------
function renderReveal(){
  if(!S.result){const r=rngFrom(Date.now()%100000+7);S.result=sampleFuture(S.choice,true,r);S.result.days=0;save()}
  const R=S.result;
  screen('reveal',`${scene('table')}${hud('The real future')}<div class="reveal"><div class="cal" id="cal"><span>Day</span><b id="day">1</b></div>
   <div class="real-fut" id="rf" hidden><div class="rf-card">${vignette(R.kind)}</div><h2>${R.cap}</h2></div>
   <div class="rf-talk" id="rft" hidden></div><button class="btn" id="next" hidden>See how you did</button></div>`);
  let d=1;const t=setInterval(()=>{d++;$('#day').textContent=d;if(d>=(S.choice.date==='moved'?30:9)){clearInterval(t);$('#cal').classList.add('done');
    setTimeout(()=>{$('#rf').hidden=false;$('#rft').hidden=false;const mood=R.kind==='recital'||R.kind==='moved'?'happy':R.kind==='healed'?'smile':'sad';
      const line={recital:'I played the whole Bach piece! My wrist didn’t hurt at all!',moved:'We moved the recital and I played! Thank you for explaining everything.',healed:'I missed Friday, but my wrist is straight. There’s another recital in spring.',crooked:'It didn’t heal straight. The doctors say they can fix it, but I’m sad.',rash:'Strawberry polka dots again! They switched me to a cast.'}[R.kind];
      unlock('forecast')&&toast('New Field Guide idea: Forecasts are not promises','good');
      $('#rft').innerHTML=`<div class="rf-maya">${portrait({...CAST.maya,mood})}</div><p>“${line}”</p>`;$('#next').hidden=false;$('#next').onclick=()=>go('debrief')},500)}},S.choice.date==='moved'?60:140)}

// ---------- Debrief ----------
// calibration: how sure she said she was vs. Byte's forecast that the plan meets her goals
function calibLine(){const pct=[50,62,75,87,97][S.conf??2],words=['a coin flip','a little sure','pretty sure','very sure','sure'][S.conf??2];
  const fc=forecastFor(S.choice),ids=S.criteria.filter(x=>fc[x]!=null);if(!ids.length)return '';const f=Math.round(100*ids.reduce((a,k)=>a*fc[k],1));
  const close=Math.abs(pct-f)<=15;if(close)unlock('calibration');
  return `<div class="calib"><b>${f}%</b><span>Byte\u2019s forecast that your plan meets all your goals. You said you felt ${words} (about ${pct}%). ${close?'Nicely <button class="gw" data-w="calibration">calibrated</button>!':pct>f?'You were more sure than the odds. That\u2019s called overconfidence.':'You were less sure than the odds. You can trust good evidence a bit more.'}</span></div>`}
function expectedFor(c){const r=rngFrom(4242);let futs=Array.from({length:400},()=>sampleFuture(c,true,r));return id=>critScore(id,futs)/400}
function renderDebrief(){
  const c=S.choice,R=S.result;const avoidedTrap=S.told||c.tx!=='gel';
  // compare chosen plan with the best plan under the player's own criteria, using the true model
  const plans=[];for(const tx of['pins','cast','gel'])for(const pt of[false,true])for(const date of['fri','moved'])plans.push({tx,pt,date});
  const crit=S.criteria.filter(x=>x!=='agree');const score=p=>{const e=expectedFor(p);return crit.reduce((a,id)=>a+e(id),0)};
  const mine=score(c),best=Math.max(...plans.map(score));const fit=mine>=best-.25;
  const memoOk=memoChecks(S.memo,S.memoAI).filter(x=>x.ok).length>=3;
  const stars=[avoidedTrap,fit,memoOk&&S.consent].filter(Boolean).length;
  const likely=(()=>{const e=expectedFor(c);const p=R.kind==='rash'?e('skin'):R.straight?e('straight'):1-e('straight');return 1-p})();
  const luck=['recital','moved','healed'].includes(R.kind)?(likely>.5?'Lucky':'As expected'):(likely<.3?'Unlucky':'As expected');
  if(S.consent)heart('dad');
  screen('debrief',`${scene('hospital')}<div class="talk-dim"></div>${hud('Debrief')}<div class="panel-card debrief">
   <h2>How you did</h2>
   <div class="scores"><div class="score"><div class="stars">${[0,1,2].map(i=>`<span class="${i<stars?'on':''}">★</span>`).join('')}</div><b>Decision</b><span>How wise your choice was, given what you knew</span></div>
    <div class="score"><div class="luckpill ${luck.toLowerCase().replace(' ','-')}">${luck}</div><b>Luck</b><span>How the dice landed. Luck never earns stars.</span></div></div>
   <ul class="dlist">
    <li class="${avoidedTrap?'ok':''}">${S.told?'You told '+esc(S.byte.name)+' about the rash, so the forecast was accurate.':c.tx!=='gel'?'You avoided BoneMend. Did you notice why it was risky for Maya? Her dad mentioned a rash.':'You didn’t tell '+esc(S.byte.name)+' about Maya’s rash. BoneMend looked safer than it really was for her.'}</li>
    <li class="${fit?'ok':''}">${fit?'Your plan was one of the best for the criteria you picked.':'Another plan would have done better on the criteria you picked. Try the Future Table again next time.'}</li>
    <li class="${memoOk&&S.consent?'ok':''}">${memoOk?'Your written decision was clear.':'Your written decision could add a reason, odds, or what Maya cares about.'} ${S.consent?'You explained honestly, so Maya and her dad could truly agree.':''}</li></ul>
   <div class="byte-note">${byteBox({...S.byte,mood:'happy'})}<p>${R.kind==='crooked'||R.kind==='rash'?'Sometimes a good plan gets unlucky. That’s why we judge decisions by what we knew, not only by how they turned out.':'Nice work, Doctor. You listened, you explained, and Maya trusted you.'}</p></div>
   ${calibLine()}
   <div class="earned"><span>${S.guide.length} Field Guide ideas</span><span>${S.words.length} new words</span><span>${Object.values(S.hearts).reduce((a,b)=>a+b,0)} hearts</span></div>
   <button class="btn wide" id="next">Head home</button></div>`);
  $('#next').onclick=()=>{S.done=true;go('evening')}}

function renderEvening(){
  screen('evening',`${scene('night')}${hud('Home · Boston · 9:10 PM')}<div class="evening"><div class="eve-byte">${byteBox({...S.byte,mood:'alert'},'big perk')}</div>
   <div class="caption-card dark"><p><b>${esc(S.byte.name)}:</b> “Something strange happened tonight. Someone tried to install an ‘upgrade’ on me from a maker I’ve never heard of. I blocked it.”</p>
   <p>“And the Ledger says nobody knows who built that secret datacenter near Calder Bay. ${S.notes.crate?'Remember the crate those two strangers were pushing this morning? It was labeled TOTALLY NORMAL BOLTS. That’s not normal at all.':'Who would do something like that?'}”</p>
   <p class="tbc">To be continued in the next chapter.</p>
   <div class="row"><button class="btn small ghost" id="guide">Open Field Guide</button><button class="btn small" id="again">Play this day again</button></div></div></div>`);
  $('#guide').onclick=openGuide;$('#again').onclick=()=>{const keep={player:S.player,byte:S.byte,words:S.words,guide:S.guide,hearts:S.hearts};S={...NEW(),...keep,step:'morning'};save();render()}}

// ---------- boot ----------
(function boot(){const l=loadLocal();if(l&&l.v===1)RESUME=l;render();connectCloud()})();
