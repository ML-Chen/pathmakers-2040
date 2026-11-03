// i18n.js — the language system: English (the default) or Simplified Chinese (中文), with optional pinyin.
// T(english, vars) returns the text for the current language. Translations are keyed by the exact English
// text, so content never needs ids, and a missing translation falls back to the English. Dynamic text uses
// placeholders: T('Ask {name} why',{name:S.byte.name}) or T('Day {0}',n); the translation keeps the placeholders.
// Translation files (src/i18n/zh/<id>.js, one per mission plus core.js for the interface) call
// I18N.add('zh','<id>',{strings, glossary, voices, chatterVoices, regex, pinyinFix}). See docs/MISSIONS.md, "Chinese mode".
// Pinyin comes from generated files (src/i18n/zh_pinyin/*.js, made by tools/i18n_pinyin.js with pinyin-pro).
const I18N={
  names:{en:'English',zh:'中文'},
  tab:{zh:{}},      // English text -> translated text
  from:{zh:{}},     // English text -> id of the file that translated it (for tools/i18n_extract.js)
  files:{zh:{}},    // file id -> the data it added
  gloss:{zh:{}},    // English glossary key -> {w: term, d: definition, alt: [other forms of the term used in sentences]}
  gback:{zh:{}},    // term or alt form -> English glossary key, so [[桡骨]] in a sentence opens the "radius" entry
  voices:{zh:{}},   // cast id -> voice key ('byte_female', 'byte_male', 'narrator', and cast ids such as 'maya')
  chatter:{zh:[]},  // passer-by voice keys, matched by position to CHATTER_VOICES
  rx:{zh:{}},       // English RegExp source -> extra alternatives that match the player's writing in this language
  pref:{lang:'en',py:false},
  trace:null,       // set by tools/i18n_extract.js: called as trace(english, found, kind) for every lookup outside English
  add(lang,id,d){const L=lang;for(const k of ['tab','from','gloss','gback','voices','rx'])this[k][L]=this[k][L]||{};this.files[L]=this.files[L]||{};this.files[L][id]=d;
    for(const k in d.strings||{}){this.tab[L][k]=d.strings[k];this.from[L][k]=id}
    for(const k in d.glossary||{}){const g=d.glossary[k];this.gloss[L][k]=g;for(const w of [g.w].concat(g.alt||[]))if(w&&!this.gback[L][w])this.gback[L][w]=k}
    Object.assign(this.voices[L],d.voices||{});if(d.chatterVoices)this.chatter[L]=d.chatterVoices;Object.assign(this.rx[L],d.regex||{});this._sp=null}
};
// The language in use: the save's choice, else this device's last choice, else English.
function LANG(){const s=typeof S!=='undefined'&&S&&S.lang;return s||I18N.pref.lang||'en'}
const I18N_HAN=/[㐀-鿿豈-﫿]/;
function T(s,...a){if(typeof s!=='string'||!s)return s;let out=s;const L=LANG();
  if(L!=='en'){const v=I18N.tab[L]&&I18N.tab[L][s];if(v!=null)out=v;if(I18N.trace&&!I18N_HAN.test(s))I18N.trace(s,v!=null,'text')}
  if(a.length){const v=a.length===1&&a[0]!==null&&typeof a[0]==='object'?a[0]:a;out=String(out).replace(/\{(\w+)\}/g,(m,k)=>k in v?v[k]:m)}
  return out}
// A word that one mission translates differently from the rest of the game (the Saturday control's "Play" is 上场, the map's Play
// button is 开始): a translation file may add the key 'missionId|English', which wins while that mission is the current one.
function TM(s){const L=LANG();if(L!=='en'&&typeof S!=='undefined'&&S&&S.mission){const v=I18N.tab[L]&&I18N.tab[L][S.mission+'|'+s];if(v!=null)return v}return T(s)}
// Glossary: the English key a [[marked]] word opens, the term shown for a key, and its definition.
function gkey(w){const k=w.toLowerCase();if(typeof GLOSSARY==='undefined'||GLOSSARY[k])return k;const b=I18N.gback[LANG()];return (b&&b[w])||k}
function TW(k){const g=I18N.gloss[LANG()];return (g&&g[k]&&g[k].w)||k}
function TD(k){const g=I18N.gloss[LANG()];return (g&&g[k]&&g[k].d)||(typeof GLOSSARY!=='undefined'?GLOSSARY[k]:'')}
// A pattern that also matches the player's writing in the current language (memo checks, chat keywords).
function TRX(re){const L=LANG();const x=L!=='en'&&I18N.rx[L]&&I18N.rx[L][re.source];if(L!=='en'&&I18N.trace)I18N.trace(re.source,!!x,'regex');if(!x)return re;const c=I18N._rxc=I18N._rxc||{},key=L+'|'+re.source+'|'+re.flags;return c[key]||(c[key]=new RegExp(re.source+'|'+x,re.flags))}

// ---------- voices: the same lookups serve the game (playLine) and tools/make_audio.py (spokenLinesZh) ----------
const I18N_FALLBACK_VOICE={kid_girl:'zh_kid_girl',kid_boy:'zh_kid_boy',elder_woman:'zh_elder_woman',elder_man:'zh_elder_man'};
// The text to speak for an English line, or null when it has no translation (the game then plays the English clip).
I18N.say=function(text,L=LANG()){if(L==='en')return text;const tb=this.tab[L]||{};if(tb[text]!=null)return tb[text];
  if(!this._sp){this._sp={};for(const k in tb)this._sp[speechText(k)]=tb[k]}const sp=speechText(text);if(this._sp[sp]!=null)return this._sp[sp];
  const m=/^(.+?)\. ([\s\S]+)$/.exec(text);if(m&&typeof GLOSSARY!=='undefined'&&GLOSSARY[m[1]]===m[2]){const g=(this.gloss[L]||{})[m[1]];if(g&&g.d)return g.w+'。'+g.d}
  return I18N_HAN.test(text)?text:null};
// The voice key for a line spoken by `who` (a cast id, 'byte' or 'narrator'); `en` is the English voice key.
I18N.voice=function(who,en,L=LANG()){if(L==='en')return en;const V=this.voices[L]||{};
  if(who==='byte')return V[typeof BYTE_VOICES!=='undefined'&&en===BYTE_VOICES.male?'byte_male':'byte_female']||en;
  return V[who]||I18N_FALLBACK_VOICE[en]||(/^[ab]m_/.test(en)?'zh_man':/^[ab]f_/.test(en)?'zh_woman':V.narrator)||en};
// The voice key for a passer-by line recorded with English voice `en` (one of CHATTER_VOICES).
I18N.passer=function(en,L=LANG()){if(L==='en')return en;const i=typeof CHATTER_VOICES!=='undefined'?CHATTER_VOICES.indexOf(en):-1,C=this.chatter[L]||[];return (i>=0&&C.length)?C[i%C.length]:this.voice('',en,L)};
// Every spoken line in Chinese, for tools/make_audio.py: [{voice, text, src:'zh_<src>'}], only for translated lines.
function spokenLinesZh(L='zh'){const out=[],seen=new Set();
  for(const x of spokenLines()){const t=I18N.say(x.text,L);if(t==null||/\{\w+\}/.test(t))continue;
    const v=x.who==='chatter'?I18N.passer(x.voice,L):I18N.voice(x.who||'narrator',x.voice,L);const it={voice:v,text:speechText(t),src:L+'_'+(x.src||'core')};
    const k=it.voice+'|'+it.text;if(!seen.has(k)){seen.add(k);out.push(it)}}
  return out}

// ---------- the page: font and line-breaking classes, the setting controls, saving the device's choice ----------
I18N.locale=function(){return LANG()==='zh'?'zh-CN':undefined};
// SVG labels squeezed to an exact English width keep that width only in English; translations use their natural width.
I18N.fit=function(n){return LANG()==='en'?` textLength="${n}" lengthAdjust="spacingAndGlyphs"`:''};
// An element's text without its pinyin.
I18N.text=function(el){if(!el.querySelector||!el.querySelector('rt'))return el.textContent;const c=el.cloneNode(true);c.querySelectorAll('rt').forEach(r=>r.remove());return c.textContent};
I18N.speechLang=function(){return LANG()==='zh'?'zh-CN':'en-US'};
I18N.aiNote=function(){return LANG()==='zh'?'\nThe player is using the Chinese version of the game: always reply in natural, warm Simplified Chinese (简体中文) that a strong young reader can follow, and keep numbers exactly as given.':''};
I18N.pyOn=function(){const s=typeof S!=='undefined'&&S;return LANG()==='zh'&&!!(s&&s.pinyin!=null?s.pinyin:this.pref.py)};
I18N.savePref=function(){try{localStorage.setItem('pm2040-lang',JSON.stringify({lang:LANG(),py:this.pyOn()}))}catch(e){}};
try{const p=JSON.parse(localStorage.getItem('pm2040-lang')||'null');if(p&&p.lang)I18N.pref={lang:p.lang,py:!!p.py}}catch(e){}
// Called by screen() before every render: keeps <html> classes and lang in step with the save.
I18N.sync=function(){if(typeof document==='undefined')return;const el=document.documentElement,L=LANG();
  if(typeof S!=='undefined'&&S&&!S.lang&&L!=='en')S.lang=L;
  if(this._lang0===undefined)this._lang0=el.getAttribute('lang');
  el.classList.toggle('pm-zh',L==='zh');const py=this.pyOn();
  if(L==='zh')el.setAttribute('lang','zh-CN');else if(this._lang0)el.setAttribute('lang',this._lang0);else el.removeAttribute('lang');
  if(py!==el.classList.contains('pm-py')){el.classList.toggle('pm-py',py);if(py)this.ruby(document.body);else this.unruby(document.body)}};
I18N.set=function(lang,py){if(lang)S.lang=lang;if(py!=null)S.pinyin=py;save();this.savePref();this.sync()};
// Setup: a small pill in the card's corner switches language (it names the other language); in Chinese a second pill toggles pinyin.
I18N.setupHTML=function(){const zh=LANG()==='zh';return `<div class="i18n-pills">${zh?`<button class="i18n-pill ${this.pyOn()?'on':''}" id="i18n-py" aria-pressed="${this.pyOn()}">拼音</button>`:''}<button class="i18n-pill" id="i18n-lang" lang="${zh?'en':'zh-CN'}">${zh?'English':'中文'}</button></div>`};
I18N.wireSetup=function(rerender){const b=document.getElementById('i18n-lang');if(b)b.onclick=()=>{this.set(LANG()==='zh'?'en':'zh');rerender()};
  const p=document.getElementById('i18n-py');if(p)p.onclick=()=>{this.set(null,!this.pyOn());rerender()}};
// Menu: language, and pinyin while in Chinese. Placed last, so the rest of the menu is unchanged.
I18N.menuHTML=function(){const L=LANG(),py=this.pyOn();return `<div class="lbl">${L==='zh'?'语言 · Language':'Language · 语言'}</div><div class="seg i18n-seg">${Object.entries(this.names).map(([k,n])=>`<button class="segb ${L===k?'on':''}" data-lang="${k}" lang="${k==='zh'?'zh-CN':'en'}">${n}</button>`).join('')}</div>`+
  (L==='zh'?`<div class="lbl">拼音</div><div class="seg i18n-seg"><button class="segb ${py?'on':''}" data-py="1">显示拼音</button><button class="segb ${py?'':'on'}" data-py="0">不显示</button></div>`:'')};
I18N.wireMenu=function(d,rerender){d.querySelectorAll('[data-lang]').forEach(b=>b.onclick=()=>{if(b.dataset.lang===LANG())return;this.set(b.dataset.lang);rerender()});
  d.querySelectorAll('[data-py]').forEach(b=>b.onclick=()=>{this.set(null,b.dataset.py==='1');d.querySelectorAll('[data-py]').forEach(x=>x.classList.toggle('on',x===b))})};

// ---------- pinyin: ruby over every Chinese character, added to the page as it renders ----------
// Generated files call I18N.pyText(id, corpus, syllables): the corpus is every translated string of one file, and
// syllables lists one pinyin per Chinese character of the corpus, read in context by pinyin-pro. Text on screen is
// matched against the corpus (longest match first), so polyphonic characters keep the reading of their sentence;
// I18N.pyChars(chars, syllables) gives the common reading of single characters that are not in any sentence.
I18N.py={parts:[],chars:{},C:null};
I18N.pyText=function(id,corpus,syl){this.py.parts.push([corpus,syl]);this.py.C=null};
I18N.pyChars=function(chars,syl){const s=syl.split(' ');let i=0;for(const ch of chars)this.py.chars[ch]=s[i++]};
I18N.pyIndex=function(){const P=this.py;if(P.C!=null)return P;P.C=P.parts.map(p=>p[0]).join('\n');P.Y=[];for(const p of P.parts)if(p[1])P.Y.push(...p[1].split(' '));
  const C=P.C,H=new Int32Array(C.length+1);let n=0;for(let i=0;i<C.length;i++){H[i]=n;if(I18N_HAN.test(C[i]))n++}H[C.length]=n;P.H=H;return P};
I18N.pinyin=function(run){const P=this.pyIndex(),out=[];let i=0;
  while(i<run.length){let best=0,pos=-1,lo=2,hi=run.length-i;
    while(lo<=hi){const mid=(lo+hi)>>1,p=P.C.indexOf(run.substr(i,mid));if(p>=0){best=mid;pos=p;lo=mid+1}else hi=mid-1}
    if(best>=2){for(let k=0;k<best;k++)out.push(P.Y[P.H[pos+k]]||'');i+=best}
    else{let y=P.chars[run[i]];if(!y){const p=P.C.indexOf(run[i]);y=p>=0?P.Y[P.H[p]]:''}out.push(y||'');i++}}
  return out};
const I18N_OPEN='“‘（《「『〈【', I18N_CLOSE='，。、；：？！”’）》」』〉】…—·%';
// One text node -> ruby cells. Punctuation that may not start a line (，。！？ and closing quotes) is kept in a
// no-wrap span with the character before it, and opening quotes with the character after it.
I18N.rubyNode=function(node){const s=node.nodeValue;if(!s||!I18N_HAN.test(s))return;const frag=document.createDocumentFragment();
  const parts=s.match(/[㐀-鿿豈-﫿]+|[^㐀-鿿豈-﫿]+/g);let open='';
  const cell=(ch,py,o,c)=>{const r=document.createElement('ruby');r.className='i18n-r';r.append(ch);const rt=document.createElement('rt');rt.textContent=py;r.append(rt);
    if(!o&&!c)return r;const w=document.createElement('span');w.className='i18n-nb';if(o)w.append(o);w.append(r);if(c)w.append(c);return w};
  for(let j=0;j<parts.length;j++){const p=parts[j];
    if(p&&I18N_HAN.test(p[0])){let close='';const nx=parts[j+1];
      if(nx){let m=0;while(m<nx.length&&I18N_CLOSE.includes(nx[m]))m++;close=nx.slice(0,m);parts[j+1]=nx.slice(m)}
      const py=this.pinyin(p);for(let c=0;c<p.length;c++)frag.append(cell(p[c],py[c],c===0?open:'',c===p.length-1?close:''));open=''}
    else if(p){let k=p.length;if(j+1<parts.length)while(k>0&&I18N_OPEN.includes(p[k-1]))k--;if(k>0)frag.append(p.slice(0,k));open=p.slice(k)}}
  node.replaceWith(frag)};
I18N.skip=n=>{const e=n.nodeType===1?n:n.parentElement;return !e||!!e.closest('ruby,svg,textarea,script,style,input,select,[data-nopy]')};
I18N.ruby=function(root){if(!root||!this.pyOn())return;if(root.nodeType===3){if(!this.skip(root))this.rubyNode(root);return}if(root.nodeType!==1||this.skip(root))return;
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),list=[];while(w.nextNode())if(I18N_HAN.test(w.currentNode.nodeValue)&&!this.skip(w.currentNode))list.push(w.currentNode);list.forEach(n=>this.rubyNode(n))};
I18N.unruby=function(root){root.querySelectorAll('ruby.i18n-r').forEach(r=>{const rt=r.querySelector('rt');if(rt)rt.remove();r.replaceWith(r.textContent)});
  root.querySelectorAll('.i18n-nb').forEach(w=>w.replaceWith(w.textContent));root.normalize()};
if(typeof MutationObserver!=='undefined'&&typeof document!=='undefined'&&document.body)
  new MutationObserver(recs=>{if(!document.documentElement.classList.contains('pm-py'))return;
    for(const r of recs){if(r.type==='characterData'){if(r.target.isConnected)I18N.ruby(r.target)}else r.addedNodes.forEach(n=>{if(n.isConnected)I18N.ruby(n)})}})
    .observe(document.body,{childList:true,subtree:true,characterData:true});
if(typeof module!=='undefined')module.exports={I18N,T,spokenLinesZh};
