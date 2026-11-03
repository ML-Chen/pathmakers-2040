// worldmap.js — the hub: a painted world map (PAINT.world*, src/scenes/worldmap.js) with a medallion for every place,
// the season and year, and one "next" suggestion; tapping a place opens that place's planner with its careers, ranks,
// journey track, workdays, story events, ruins, travel and the people the player has earned Hearts with.
// Also: the screen hook game.js calls on every screen (campaignScreen), typed star icons for the debrief and the cards,
// and the floating "+1 heart" effect. Steps: S.step 'hub' is the world map, 'place' is a planner (S.place = key).

// ---------- icons ----------
const CM_ICON={
  harbor:'<path d="M12 3c2 2.6 2.6 4.6 2.6 6.4H9.4C9.4 7.6 10 5.6 12 3Z" fill="#fff"/><path d="M9.4 10h5.2l1 9H8.4z" fill="#fff"/><path d="M8.6 13.5h6.8" stroke="var(--c)" stroke-width="1.6"/><path d="M4 20.5c2.4-1.4 3.6 1.4 6 0s3.6 1.4 6 0 3.6 1.4 4-0.2" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M15.4 6.4l3.4-1.2M15.6 8.6l3.4.6" stroke="#ffe7a0" stroke-width="1.3" stroke-linecap="round"/>',
  mammoth:'<path d="M5 17.5V13c0-4 3-6.6 7-6.6 3.6 0 6.4 2.2 6.6 5.6l.2 2.4c0 1.8-1.2 2.8-2.6 2.8" fill="#fff"/><path d="M16.8 12.6c1.6 1.4 1.4 4.6-.8 6.4M6.4 17.4v2.8M9.6 17.4v2.8M13.2 17v3.2" stroke="#fff" stroke-width="2.2" stroke-linecap="round" fill="none"/><path d="M17.6 14.4c-1 2.6-3.6 3.4-5.4 2.4" stroke="#ffe7a0" stroke-width="1.4" fill="none" stroke-linecap="round"/><circle cx="15.2" cy="10.4" r=".9" fill="var(--c)"/>',
  crane:'<path d="M7 21V5h2v16z" fill="#fff"/><path d="M4 5.6h16v1.8H4z" fill="#fff"/><path d="M9 5.6 7.8 3.4h1.4L10 5.6" fill="#fff"/><path d="M17 7.4v5.2" stroke="#fff" stroke-width="1.2"/><rect x="15.4" y="12.6" width="3.2" height="2.4" rx=".6" fill="#ffe7a0"/><path d="M4 21h8" stroke="#fff" stroke-width="2" stroke-linecap="round"/><path d="M7 9l2 2M9 9l-2 2M7 13l2 2M9 13l-2 2" stroke="var(--c)" stroke-width=".9"/>',
  dome:'<path d="M4 18.5a8 8 0 0 1 16 0z" fill="#fff"/><path d="M8 18.5a4 4 0 0 1 8 0" fill="none" stroke="var(--c)" stroke-width="1.2"/><path d="M12 10.5V6.6M12 6.6l2.6-1" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/><path d="M3 18.5h18" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/><circle cx="9.6" cy="15" r=".9" fill="#ffe7a0"/><circle cx="14.4" cy="15" r=".9" fill="#ffe7a0"/>',
  flask:'<path d="M10 3.6h4M10.6 3.6v5.6L6 17.6c-.8 1.6.2 3 2 3h8c1.8 0 2.8-1.4 2-3l-4.6-8.4V3.6" fill="#fff" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/><path d="M7.8 15h8.4l1.2 2.4c.4.9-.1 1.6-1 1.6H7.6c-.9 0-1.4-.7-1-1.6z" fill="var(--c)" opacity=".55"/><circle cx="11" cy="13" r=".9" fill="#ffe7a0"/><circle cx="13.4" cy="11.4" r=".6" fill="#ffe7a0"/>',
  rover:'<rect x="5.4" y="9.6" width="12" height="5" rx="1.4" fill="#fff"/><path d="M14 9.6V6.4h2.6" stroke="#fff" stroke-width="1.4" fill="none" stroke-linecap="round"/><circle cx="17" cy="6" r="1.2" fill="#ffe7a0"/><circle cx="7.4" cy="17.4" r="2.2" fill="#fff"/><circle cx="12" cy="17.4" r="2.2" fill="#fff"/><circle cx="16.6" cy="17.4" r="2.2" fill="#fff"/><rect x="6.6" y="11" width="5" height="2" rx=".6" fill="var(--c)" opacity=".5"/>',
  spot:'<path d="M12 3.4l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L4.8 8.7l5-.7z" fill="#fff"/><path d="M6 21l3-4M18 21l-3-4" stroke="#ffe7a0" stroke-width="1.4" stroke-linecap="round"/>',
  capitol:'<path d="M7.4 11.6a4.6 4.6 0 0 1 9.2 0z" fill="#fff"/><path d="M12 7V4.4" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/><path d="M5 12.4h14v1.6H5z" fill="#fff"/><path d="M6.4 14v4.6M9.4 14v4.6M12 14v4.6M14.6 14v4.6M17.6 14v4.6" stroke="#fff" stroke-width="1.5"/><path d="M4 19.6h16v1.6H4z" fill="#fff"/>',
  tower:'<path d="M9.6 21l1-11h2.8l1 11z" fill="#fff"/><path d="M8 10h8l-1-3H9z" fill="#fff"/><path d="M12 7V3.6" stroke="#fff" stroke-width="1.3"/><ellipse cx="12" cy="8.6" rx="2" ry="1" fill="var(--c)"/><circle cx="12" cy="8.6" r=".6" fill="#ffe7a0"/><path d="M4.6 6.6c2-2 3.4-2.4 3.4-2.4M19.4 6.6c-2-2-3.4-2.4-3.4-2.4" stroke="#ffe7a0" stroke-width="1.2" fill="none" stroke-linecap="round"/>',
  plane:'<path d="M3.6 13.2l7.2-1.6L15 4.2c.6-1 2.2-.6 2 .6l-1.6 6.2 4.6.4c.8.1 1 1 .3 1.4l-4.9 1.8-1 6.2c-.2 1-1.6 1.1-1.9.1l-1.6-5-5.6.6c-1 .1-1.4-1-.7-1.5z" fill="#fff"/>',
  lantern:'<path d="M12 3.6v2" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/><path d="M8.6 7.2h6.8l1 9.4c0 1.6-2 2.8-4.4 2.8s-4.4-1.2-4.4-2.8z" fill="#fff"/><path d="M8 7.2h8" stroke="#fff" stroke-width="2" stroke-linecap="round"/><path d="M12 10c1.6 1.6 1.6 3.4 0 5-1.6-1.6-1.6-3.4 0-5z" fill="#ffb347"/><path d="M10 20.6h4" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>',
  darktower:'<path d="M9.4 21V8.4L12 3.6l2.6 4.8V21z" fill="#fff"/><path d="M7 21h10" stroke="#fff" stroke-width="2" stroke-linecap="round"/><rect x="11" y="10" width="2" height="2.4" fill="var(--c)"/><rect x="11" y="14.4" width="2" height="2.4" fill="var(--c)"/><path d="M15.6 6.2c1.4-1 2.6-1 3.6 0M16.4 8.4c.8-.6 1.6-.6 2.2 0" stroke="#ffe7a0" stroke-width="1.1" fill="none" stroke-linecap="round"/>',
  server:'<rect x="6" y="4" width="12" height="16.6" rx="1.6" fill="#fff"/><path d="M8 8.4h8M8 12.4h8M8 16.4h8" stroke="var(--c)" stroke-width="1.4"/><circle cx="15.4" cy="6.4" r=".8" fill="#2fd17a"/><circle cx="15.4" cy="10.4" r=".8" fill="#ffb347"/><circle cx="15.4" cy="14.4" r=".8" fill="#2fd17a"/>',
  raft:'<path d="M5.4 10.6 8.7 5h6.6l3.3 5.6-3.3 5.6H8.7z" fill="#fff"/><path d="M7.9 10.6 9.9 7.2h4.2l2 3.4-2 3.4H9.9z" fill="var(--c)" opacity=".75"/><path d="M7.9 10.6h8.2M9.9 7.2l4.2 6.8M14.1 7.2l-4.2 6.8" stroke="#fff" stroke-width=".7"/><path d="M4 20.2c2.4-1.4 3.6 1.4 6 0s3.6 1.4 6 0 3.6 1.4 4-.2" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M18.6 3.4v2.4M17.4 4.6h2.4" stroke="#ffe7a0" stroke-width="1.2" stroke-linecap="round"/>',
  lock:'<rect x="6.6" y="11" width="10.8" height="8.4" rx="2" fill="#fff"/><path d="M8.8 11V8.6a3.2 3.2 0 0 1 6.4 0V11" stroke="#fff" stroke-width="2" fill="none"/><circle cx="12" cy="15" r="1.3" fill="var(--c)"/>',
  heart:'<path d="M12 20.4C5.8 16.2 3.6 12.6 4.2 9.4 4.8 6.4 8.6 5 12 8.4c3.4-3.4 7.2-2 7.8 1 .6 3.2-1.6 6.8-7.8 11Z" fill="currentColor"/>',
  coin:'<circle cx="12" cy="12" r="8.4" fill="currentColor"/><circle cx="12" cy="12" r="5.8" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.4"/><path d="M12 8.6v6.8M10 10.4c0-1 4-1.4 4 .4s-4 1.2-4 3c0 1.6 4 1.4 4 .4" stroke="#fff" stroke-width="1.3" fill="none" stroke-linecap="round"/>',
  star:'<path d="M12 3.2l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.6l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z" fill="currentColor"/>',
  back:'<path d="M14.5 5.5 8 12l6.5 6.5" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  spring:'<path d="M12 21v-7" stroke="#2f9466" stroke-width="2" stroke-linecap="round"/><path d="M12 14c-4 0-6-2.4-6-5.4 3.2 0 5.6 1.6 6 5.4zM12 15.6c3.6 0 5.6-2 5.8-4.8-3 0-5.2 1.4-5.8 4.8z" fill="#38b07f"/><circle cx="12" cy="7" r="3.2" fill="#ff9bb0"/><circle cx="12" cy="7" r="1.2" fill="#ffe7a0"/>',
  summer:'<circle cx="12" cy="12" r="4.4" fill="#ffc533"/><path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.5 5.5l1.8 1.8M16.7 16.7l1.8 1.8M5.5 18.5l1.8-1.8M16.7 7.3l1.8-1.8" stroke="#ffb020" stroke-width="2" stroke-linecap="round"/>',
  fall:'<path d="M12 3.4c3.4 2.4 6.2 6 5.4 9.8-.6 3.2-3 5-5.4 5.4-2.4-.4-4.8-2.2-5.4-5.4C5.8 9.4 8.6 5.8 12 3.4z" fill="#f08a3c"/><path d="M12 6v15.4M12 11l-3-2.2M12 14.4l3.4-2.4" stroke="#a8501c" stroke-width="1.3" fill="none" stroke-linecap="round"/>',
  winter:'<path d="M12 2.8v18.4M4 7.4l16 9.2M4 16.6l16-9.2" stroke="#7fc8ff" stroke-width="2" stroke-linecap="round"/><path d="M9.6 4.4 12 6.6l2.4-2.2M9.6 19.6 12 17.4l2.4 2.2M4.6 10.6l3.2.4-1.2-3M19.4 13.4l-3.2-.4 1.2 3M4.6 13.4l3.2-.4-1.2 3M19.4 10.6l-3.2.4 1.2-3" stroke="#7fc8ff" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
};
const cmSvg=(k,cls='')=>`<svg class="cm-i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${CM_ICON[k]||''}</svg>`;
const PLACE_COLOR={city:'#6c5ce7',space:'#3a4aa8',travel:'#16a3b3',fiction:'#8a5a9a',sea:'#1f86a0'};
const PLACE_TINT={boston:'#e8566c',nome:'#3d8fd1',phoenix:'#e98a2b',moon:'#5d6ac9',bay:'#16a39a',mars:'#c4533a',nyc:'#d4497f',dc:'#3e63c9',vienna:'#7d55c7',varrow:'#c48a2a',marrowpoint:'#5c4a7a',calderbay:'#3a7a8a',ocean:'#1f86a0'};
function placeColor(k){return PLACE_TINT[k]||PLACE_COLOR[PLACES[k].kind]||'#6c5ce7'}

// ---------- stars ----------
const STAR_ICON={ask:'<path d="M12 2.6l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.6l-5.4 2.9 1-6.1L3.2 9.1l6.1-.9z" fill="currentColor"/><path d="M10.2 9.6c0-1.2.9-2 1.9-2s1.9.7 1.9 1.7c0 1.4-1.9 1.4-1.9 2.8M12.1 13.8v.4" stroke="#fff" stroke-width="1.4" fill="none" stroke-linecap="round"/>',
  decision:'<path d="M12 2.6l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.6l-5.4 2.9 1-6.1L3.2 9.1l6.1-.9z" fill="currentColor"/><path d="M9.2 11.2l2 2 3.6-3.8" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  heart:'<path d="M12 2.6l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.6l-5.4 2.9 1-6.1L3.2 9.1l6.1-.9z" fill="currentColor"/><path d="M12 14.2c-2.2-1.5-3-2.8-2.7-3.9.3-1 1.6-1.4 2.7-.3 1.1-1.1 2.4-.7 2.7.3.3 1.1-.5 2.4-2.7 3.9z" fill="#fff"/>'};
function starIcon(type,on){const l=(STAR_TYPES.find(x=>x[0]===type)||[type,type])[1];return `<svg class="cm-star t-${type} ${on?'on':''}" viewBox="0 0 24 24" aria-label="${esc(T(on?'{0} star':'{0} star (not earned)',LANG()==='en'?type:T(l)))}">${STAR_ICON[type]}</svg>`}
// three labeled stars (debrief, big talk): sb = starsFrom(...) or a S.completed entry
function starRow(sb){return `<div class="cm-stars">${STAR_TYPES.map(([k,l])=>`<span class="cm-st ${sb&&sb[k]?'on':''}">${starIcon(k,sb&&sb[k])}<small>${T(l)}</small></span>`).join('')}</div>`}
// small stars for a mission card: typed when known, plain gold for saves from before star types
function cardStars(c){if(!c)return '';const typed=STAR_TYPES.some(([k])=>k in c);
  if(typed)return `<span class="cm-cstars">${STAR_TYPES.map(([k])=>starIcon(k,c[k])).join('')}</span>`;
  return `<span class="cm-cstars">${[0,1,2].map(i=>`<svg class="cm-star t-plain ${i<(c.stars||0)?'on':''}" viewBox="0 0 24 24">${CM_ICON.star}</svg>`).join('')}</span>`}

// ---------- hearts: a small floating "+1" near the top of the screen ----------
// a character's short name: the first name in English; in Chinese the translated name without 医生 or the family name after ·
function castShort(id){const n=CAST[id]&&CAST[id].name||'';if(LANG()!=='en'){const z=T(n);if(z!==n)return z.replace(/(医生|博士)$/,'').split('·')[0]}return n.split(' ').filter(w=>!/^(Dr|Mr|Mrs|Ms)\.?$/.test(w))[0]||''}
function heartFx(who,n){if(typeof document==='undefined'||!n||n<0)return;const name=who==='byte'?S.byte.name:castShort(who);
  const d=document.createElement('div');d.className='cm-heartfx';d.innerHTML=`${cmSvg('heart')}<b>+${n}</b>${name?`<span>${esc(name)}</span>`:''}`;
  document.body.appendChild(d);
  // sit below any toast and any earlier "+1" still floating, so they never cover each other
  const above=$$('.toast:not(.out),.cm-heartfx').filter(x=>x!==d),b=above.length?Math.max(...above.map(x=>x.offsetTop+x.offsetHeight)):0;
  d.style.marginTop=Math.max(0,b+8-d.offsetTop)+'px';setTimeout(()=>d.remove(),2300)}

// ---------- the screen hook: wide hub screens, the Days chip, journey progress ----------
function campaignScreen(cls){if(typeof document==='undefined')return;
  document.body.classList.toggle('cm-wide',/\b(worldmap|placeplan)\b/.test(cls));
  if(S.mission&&MISSIONS[S.mission]){const m=M();
    if(m.stages){const i=m.stages.findIndex(s=>s.at===S.step);if(i>=0){const C=camp();if((C.jp[m.id]||0)<i){C.jp[m.id]=i;save()}}}
    if(m.days&&!/\b(worldmap|placeplan|title|setup)\b/.test(cls)){const d=daysLeft();const h=APP.querySelector('.hud .place');
      if(h&&d!=null)h.insertAdjacentHTML('afterend',`<div class="cm-days" title="${T('Days left')}"><b>${d}</b><span>${T(d===1?'day':'days')}</span></div>`)}}}

// ---------- the world map ----------
function wmLayout(){const cv=document.querySelector('canvas.bgcanvas');const r=cv&&cv.style.display!=='none'?cv.getBoundingClientRect():{left:0,top:0,width:innerWidth,height:innerHeight};
  const L=window.WMAP?WMAP.layout(r.width,r.height):{cx:r.width/2,cy:r.height/2,R:Math.min(r.width,r.height)*.4,moon:{x:r.width*.8,y:r.height*.15,r:30},mars:{x:r.width*.2,y:r.height*.15,r:16}};
  L.ox=r.left;L.oy=r.top;L.w=r.width;L.h=r.height;return L}
function wmPos(key,L){const P=PLACES[key];if(key==='moon')return {x:L.moon.x,y:L.moon.y+L.moon.r*.55,dot:null};if(key==='mars')return {x:L.mars.x,y:L.mars.y,dot:null};
  const dot=window.WMAP?WMAP.project(P.lat,P.lon,L):{x:L.cx,y:L.cy};return {x:L.cx+P.mark[0]*L.R,y:L.cy+P.mark[1]*L.R,dot}}
function wmSceneKey(){const ch=camp().ch;return window.WMAP?WMAP.key(ch):'night'}
function worldHub(){campaignSync();const C=camp(),ch=C.ch,news=takeNews();const nx=nextUp();
  const ST=starTotals();
  screen('hub worldmap',`${scene(wmSceneKey())}${hud(chapterLabel(ch))}<div class="wm" id="wm"><svg class="wm-lines" id="wmlines"></svg><div class="wm-pins" id="wmpins"></div></div>
    <div class="wm-foot">
      <div class="wm-res"><span class="wm-chip c-heart" title="${T('Hearts')}">${cmSvg('heart')}<b>${heartsTotal()}</b></span><span class="wm-chip c-coin" title="${T('Coins')}">${cmSvg('coin')}<b>${coins()}</b></span><span class="wm-chip c-star" title="${T('Stars')}">${cmSvg('star')}<b>${ST.stars}</b></span></div>
      ${nx?`<button class="wm-next" id="wm-go" data-m="${nx.id}"><span class="wm-next-byte">${byteBox({...S.byte,mood:'happy'})}</span><span class="wm-next-t"><b>${esc(T(nx.title))}</b><span>${esc(T(PLACES[missionMeta(nx).district].name))} · ${esc(cardLabel(nx))}</span></span><span class="wm-play">${T('Play')}</span></button>`
        :`<div class="wm-next done"><span class="wm-next-byte">${byteBox({...S.byte,mood:'happy'})}</span><span class="wm-next-t"><b>${T('All caught up!')}</b><span>${T('New places open as the seasons turn.')}</span></span></div>`}
    </div><div class="wm-pop" id="wmpop" hidden></div>`);
  const pl=$('.hud .place');if(pl)pl.insertAdjacentHTML('afterbegin',cmSvg(SEASONS[ch%4],'wm-season'));
  wmDrawPins();const go=$('#wm-go');if(go)go.onclick=()=>playMission(MISSIONS[go.dataset.m]);
  wmNews(news)}
function wmDrawPins(){const box=$('#wmpins'),lines=$('#wmlines');if(!box)return;const L=wmLayout();
  const keys=PLACE_ORDER.filter(k=>PLACES[k]);let svg='',html='';
  for(const k of keys){const P=PLACES[k],p=wmPos(k,L),open=placeOpen(k),n=open?placeNew(k):0,done=open&&placeMissions(k).length&&placeMissions(k).every(m=>isDone(m.id));
    const x=p.x+L.ox,y=p.y+L.oy;
    if(p.dot){const dx=p.dot.x+L.ox,dy=p.dot.y+L.oy;svg+=`<line x1="${dx.toFixed(1)}" y1="${dy.toFixed(1)}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" class="${open?'on':''}"/><circle cx="${dx.toFixed(1)}" cy="${dy.toFixed(1)}" r="${open?3.2:2.4}" class="wm-dot ${open?'on':''}"/>`}
    html+=`<button class="wm-pin k-${P.kind} ${open?'open':'locked'} ${done?'done':''} ${n?'has-new':''}" data-p="${k}" style="left:${x.toFixed(1)}px;top:${y.toFixed(1)}px;--c:${placeColor(k)}" aria-label="${esc(open?T(P.name):T('{0} (locked)',T(P.name)))}">
      <span class="wm-medal"><svg viewBox="0 0 24 24">${CM_ICON[P.icon]}</svg>${open?'':`<i class="wm-lock">${cmSvg('lock')}</i>`}${n?`<i class="wm-new">${n}</i>`:''}</span><span class="wm-name">${esc(T(P.name))}</span></button>`}
  lines.setAttribute('viewBox',`0 0 ${innerWidth} ${innerHeight}`);lines.innerHTML=svg;box.innerHTML=html;
  $$('.wm-pin',box).forEach(b=>b.onclick=e=>{e.stopPropagation();const k=b.dataset.p;if(placeOpen(k)){wmZoom(b,()=>{S.place=k;go('place')})}else wmTease(k,b)});
  $('#wm').onclick=()=>{const p=$('#wmpop');if(p)p.hidden=true}}
function wmZoom(b,then){const wm=$('#wm');if(!wm||matchMedia('(prefers-reduced-motion: reduce)').matches)return then();const r=b.getBoundingClientRect();
  b.classList.add('pick');document.body.style.setProperty('--zx',(r.left+r.width/2)+'px');document.body.style.setProperty('--zy',(r.top+r.height/2)+'px');document.body.classList.add('wm-zooming');
  setTimeout(()=>{document.body.classList.remove('wm-zooming');then()},280)}
function wmTease(k,b){const P=PLACES[k],pop=$('#wmpop');if(!pop)return;const r=b.getBoundingClientRect();
  pop.innerHTML=`<div class="wm-pop-h" style="--c:${placeColor(k)}"><span class="wm-medal"><svg viewBox="0 0 24 24">${CM_ICON[P.icon]}</svg></span><div><b>${esc(T(P.name))}</b>${P.game?`<span>${esc(T(P.game))}</span>`:''}</div></div><p>${esc(T(P.teaser))}</p><div class="wm-pop-when">${cmSvg('lock')}${esc(placeOpensLabel(k))}</div>`;
  pop.hidden=false;const w=Math.min(280,innerWidth-24);pop.style.width=w+'px';pop.style.left=Math.max(12,Math.min(innerWidth-w-12,r.left+r.width/2-w/2))+'px';
  const top=r.bottom+8+pop.offsetHeight>innerHeight-8?r.top-pop.offsetHeight-8:r.bottom+8;pop.style.top=Math.max(8,top)+'px'}
function wmNews(news){if(!news.length)return;const coinsWon=news.filter(n=>n.coins).reduce((a,n)=>a+n.coins,0);const season=news.filter(n=>n.season!=null).pop();
  if(coinsWon)setTimeout(()=>toast(`${cmSvg('coin','t-coin')} ${T('+{0} coins',coinsWon)}`,'good'),season?2600:300);
  if(season){const ch=season.season,d=document.createElement('div');d.className='wm-season-card';
    const fresh=PLACE_ORDER.filter(k=>PLACES[k].year&&chapterOf(PLACES[k].year,PLACES[k].season)===ch&&placeOpen(k));
    d.innerHTML=`<div class="wm-season-in s-${SEASONS[ch%4]}">${cmSvg(SEASONS[ch%4],'big')}<b>${chapterLabel(ch)}</b>${fresh.length?`<span>${T('New: {0}',fresh.map(k=>esc(T(PLACES[k].name))).join(T(', ')))}</span>`:''}</div>`;
    document.body.appendChild(d);d.onclick=()=>d.remove();setTimeout(()=>d.classList.add('out'),2200);setTimeout(()=>d.remove(),2700)}}
addEventListener('resize',()=>{if(S&&S.step==='hub'&&$('#wmpins'))requestAnimationFrame(wmDrawPins)});

// ---------- starting a mission from the map: journeys resume at the furthest stage ----------
function cardLabel(m){const me=missionMeta(m);return m.dayLabel?T(m.dayLabel):me.kind==='workday'&&m.day?T('Day {0}',m.day):KIND_NAME[me.kind]?T(KIND_NAME[me.kind]):T('Day {0}',m.day)}
function journeyResume(m){if(!m.stages||isDone(m.id))return null;const i=camp().jp[m.id]||0;return i>0&&m.stages[i]?m.stages[i].at:null}
function playMission(m){if(!m)return;if(resumeMission(m.id))return;startMission(m.id,journeyResume(m)||undefined)}

// ---------- a place's planner ----------
// the most beautiful painted view of each place, for its preview screen (outdoor skylines and landscapes, not rooms)
const PLACE_VIEW={boston:['harbor','street'],nome:['nome_reserve','nome_dusk'],phoenix:['phx_lot','phx_street','phx_yard'],dc:['dc_night'],vienna:['vienna_night','vienna_market'],
  marrowpoint:['mp_tower'],mars:['mars_dusk','mars'],moon:['moon','moon_night'],shanghai:['shanghai','shanghai_night'],beijing:['beijing'],shenzhen:['shenzhen'],varrow:['varrow'],ocean:['ocean_dc']};
function placeScene(key){const P=PLACES[key];const k=(PLACE_VIEW[key]||[]).concat(P.scenes||[]).find(x=>window.PAINT&&PAINT[x]);if(k)return k;
  const ms=placeMissions(key);for(const m of ms)for(const f of (m.flow||[]))if(f.scene&&window.PAINT&&PAINT[f.scene]&&!['home','night','table','workbench'].includes(f.scene))return f.scene;
  return wmSceneKey()}
function missionCard(m){const done=S.completed[m.id],open=missionOpen(m),why=open?'':lockReason(m),res=open&&journeyResume(m);const me=missionMeta(m);
  return `<button class="mcard cm-card k-${me.kind} ${done?'done':''} ${open?'':'locked'}" data-m="${m.id}" ${open?'':'disabled'}><div class="mday">${esc(cardLabel(m))}</div>
    <div class="mtxt"><b>${esc(T(m.title))}</b><span>${esc(open?(res?T('Continue where you left off'):T(m.blurb||'')):why)}</span></div><div class="mstar">${done?cardStars(done):open?'<span class="cm-go">▶</span>':cmSvg('lock','cm-lk')}</div></button>`}
function trackHTML(career){const TR=careerTrack(career);if(!TR)return '';
  return `<ol class="cm-track">${TR.map(s=>`<li class="${s.state}" title="${esc(T(s.label))}"><i>${s.state==='done'?'✓':''}</i><span>${esc(T(s.label))}${s.note?` <em>${esc(T(s.note))}</em>`:''}</span></li>`).join('')}</ol>`}
function rankChip(career){const r=rankOf(career);if(!r)return `<span class="cm-rank r-none">${T('New')}</span>`;return `<span class="cm-rank r-${r}">${'★'.repeat(RANKS.indexOf(r)+1)} ${T(RANK_NAME[r])}</span>`}
function placePeople(key){const ids=new Set();if(key==='boston')['imani','maya','dad'].forEach(x=>ids.add(x));
  placeMissions(key).forEach(m=>Object.keys(m.cast||{}).forEach(x=>ids.add(x)));
  return [...ids].filter(id=>CAST[id]&&heartsOf(id)>0&&!CAST[id].art).sort((a,b)=>heartsOf(b)-heartsOf(a))}
function placePlanner(){const key=PLACES[S.place]?S.place:'boston',P=PLACES[key];const ms=placeMissions(key);
  // each mission appears once: story events and ruins, travel, or under its career
  const story=ms.filter(m=>!m.career||['plot','memorial','ruin','finale'].includes(missionMeta(m).kind));
  const travel=ms.filter(m=>!story.includes(m)&&missionMeta(m).kind==='travel');
  const own=ms.filter(m=>!story.includes(m)&&!travel.includes(m));
  const careers=[...new Set(own.map(m=>m.career))];const here=Object.keys(CAREER_INFO).filter(c=>careerInfo(c).district===key&&!careers.includes(c));
  const sec=(t,list)=>list.length?`<section class="cm-sec"><h3>${T(t)}</h3>${list.map(missionCard).join('')}</section>`:'';
  const people=placePeople(key);
  screen('placeplan',`${scene(placeScene(key))}<div class="cm-dim"></div>${hud(T(P.full))}<div class="cm-plan" style="--c:${placeColor(key)}">
    <div class="cm-plan-h"><button class="cm-back" id="back" aria-label="${T('Back to the world map')}">${cmSvg('back')}</button><span class="wm-medal big"><svg viewBox="0 0 24 24">${CM_ICON[P.icon]}</svg></span>
      <div><h2>${esc(T(P.name))}</h2>${P.game?`<span class="cm-game">${esc(T(P.game))}</span>`:''}</div><span class="cm-when">${cmSvg(SEASONS[camp().ch%4],'wm-season')}${esc(chapterLabel(camp().ch))}</span></div>
    ${careers.map(c=>{const I=careerInfo(c);const list=own.filter(m=>m.career===c);return `<section class="cm-career">
      <div class="cm-career-h"><b>${esc(T(I.name))}</b>${rankChip(c)}</div>${!rankOf(c)&&I.why?`<p class="cm-why">${esc(T(I.why))}</p>`:''}${trackHTML(c)}
      ${list.map(missionCard).join('')}</section>`}).join('')}
    ${sec(key==='marrowpoint'||key==='calderbay'?'Ruins':'Story',story)}${sec('Travel',travel)}
    ${!ms.length?`<p class="cm-empty">${esc(T(P.teaser))}</p>`:''}
    ${here.length?`<div class="cm-soon">${here.map(c=>`<span>${esc(T(careerInfo(c).name))}</span>`).join('')}<em>${T('coming soon')}</em></div>`:''}
    ${people.length?`<section class="cm-sec cm-people"><h3>${T('Friends here')}</h3><div>${people.map(id=>`<div class="cm-pal"><svg viewBox="62 20 176 176" preserveAspectRatio="xMidYMid slice">${personSVG({...CAST[id],mood:'smile'})}</svg><b>${esc(castShort(id))}</b><span>${cmSvg('heart')}${heartsOf(id)}</span></div>`).join('')}</div></section>`:''}
  </div>`);
  $('#back').onclick=()=>go('hub');
  $$('.cm-plan .mcard').forEach(b=>b.onclick=()=>playMission(MISSIONS[b.dataset.m]))}

LATE.push(()=>{STEPS.hub=worldHub;STEPS.place=placePlanner});
