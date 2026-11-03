// missions/treatytalks.js — Beijing travel visit for the Lawmaker: "Trust, Then Check".
// American and Chinese treaty teams meet in a restored courtyard in the hutongs near Shichahai (a historic preserve).
// Under the treaty, each country's treaty AI runs on published goals (its "spec"), and each side checks the other's.
// This year, the player reads the spec of China's treaty AI, Tianping, and taps the lines that could let something slip
// past an inspector (custom step bj_spec, a fine-print reading desk). Meanwhile the Chinese inspector Zhao Mingyu has
// found a self-serving line in the spec of America's treaty AI, Beacon. The player decides how to answer for it
// (bj_answer), and both lead delegates sign a joint statement with a signature and a red name seal (bj_sign).
// The treaty and its AIs are the game's 2040 (AI 2040: Plan A has US-China inspector teams); the Field Guide says so.
// Shared screens: src/missions/china_common.js. Scene: src/scenes/beijing.js. Styles: src/css/china.css.
const BJ_SPEC=[
  {id:'chips',t:'Report where every advanced chip in China is to the joint registry within one day of any move.',flag:false,why:'That line is fine. If every chip move is reported within one day, inspectors can keep track of every chip.'},
  {id:'truth',t:'Tell inspectors the truth, even when the truth is bad for China.',flag:false,why:'That line is fine. The treaty asks both AIs to tell inspectors the truth, even when the truth is bad for their own country.'},
  {id:'holiday',t:'During national holidays, reports may wait up to thirty days.',flag:true,why:'Thirty days is a very long wait. Chips could be moved somewhere else and brought back again before anybody was told.'},
  {id:'jobs',t:'Run only work that the treaty allows, and keep a log of every job.',flag:false,why:'That line is fine. Inspectors read that log to see every job Tianping ran.'},
  {id:'updates',t:'Do not learn on the job. Accept an update only after inspectors from both countries approve it.',flag:false,why:'That line matches the treaty’s rule about updates, and it means both countries have to agree before anything changes.'},
  {id:'ministry',t:'Before answering an inspector, wait until a ministry official approves the answer.',flag:true,why:'If an official has to approve every answer first, then the answers could be reworded, or held back for days.'},
  {id:'unclear',t:'When a rule is unclear, choose the reading that keeps both countries safest.',flag:false,why:'That line is fine. When a rule is unclear, choosing the reading that keeps both countries safest does not favor either side.'}];
const BJ_FIX={
  fix:{t:'Say plainly that the line is wrong, take it out of Beacon’s spec today, and invite Mr. Zhao to check that it is gone.',short:'Strike it and invite a check'},
  keep:{t:'Explain that the line does no harm, because Beacon only uses it when both plans already follow the treaty.',short:'Explain it and keep it'},
  later:{t:'Ask to settle it at next year’s talks, once Congress has had time to read the whole spec.',short:'Wait for next year'}};
function bjSt(){const st=zhSt('bj');st.tap=st.tap||{};return st}

MISSIONS.treatytalks={id:'treatytalks',title:'Trust, Then Check',career:'lawmaker',day:2,dayLabel:'Travel',tag:'Travel',kind:'travel',year:3,season:'fall',district:'beijing',rank:'trainee',
  blurb:'You travel to Beijing, where the American and Chinese teams read each other’s AI rules line by line.',after:['maya'],
  place:'Hutong near Shichahai · Beijing',
  flow:[{name:'bj_arrive',k:'talk',talk:'arrive',scene:'beijing',place:'Hutong near Shichahai · 8:30 AM'},
    {name:'bj_han',k:'talk',talk:'han',scene:'beijing',place:'Courtyard gate · Treaty talks'},
    {name:'bj_spec',k:'custom'},
    {name:'bj_zhao',k:'talk',talk:'zhao',scene:'beijing',place:'Courtyard · Treaty talks · 11:00 AM'},
    {name:'bj_answer',k:'custom'},
    {name:'bj_reply',k:'custom'},
    {name:'bj_sign',k:'custom'},
    {name:'bj_tea',k:'talk',talk:'tea',scene:'beijing',place:'Hutong near Shichahai · 4:30 PM'},
    {name:'bj_debrief',k:'custom'},
    {name:'bj_evening',k:'evening'}],
  cast:{
    hanyw:{name:'Han Yuewen',role:'Lead delegate for China, treaty talks',brows:'thin',face:'oval',skin:'#f0cfb4',hair:'#5a545e',hairStyle:'bun',eyeShape:'almond',glasses:true,frame:'#8a2a3a',eye:'#2a1a14',
      outfit:'mandarin',shirt:'#2f5a66',trim:'#e6c674',accessory:'earring',art(m){return zhArt(this,m,{chest:bjJadePin(112,262)})}},
    zhaomy:{name:'Zhao Mingyu',role:'Treaty inspector, Beijing team',eyeSize:'small',brows:'thick',nose:'button',face:'square',skin:'#ecc6a4',hair:'#141012',hairStyle:'short',masc:true,eyeShape:'mono',eye:'#24160e',
      outfit:'sweater',shirt:'#d89a3a',glasses:true,frame:'#3a3a4a',art(m){return zhArt(this,m,{chest:bjBadge(196,300)})}},
    qiaoye:{name:'Qiao Shoucheng',role:'Keeps the tea stand by the courtyard gate',brows:'bushy',face:'round',skin:'#e6bc98',hair:'#e8e6ee',hairStyle:'bald',beard:'short',age:'elder',masc:true,eyeShape:'hooded',eye:'#2a1a10',
      outfit:'cardigan',shirt:'#5a6a7a',under:'#f2efe6'}
  },
  voices:{hanyw:'af_aoede',zhaomy:'am_puck',qiaoye:'elder_man'},
  glossary:{
    'treaty':'A written agreement between countries. Both sides promise to follow its rules.',
    'treaty talks':'Meetings where countries check how a treaty is working and agree on changes.',
    'delegate':'A person sent to speak and decide for their country at a meeting.',
    'delegation':'The team a country sends to a meeting.',
    'inspector':'A person whose job is to check that rules are really being followed.',
    'spec':'A published list of the goals and rules an AI must follow. In 2040, the law says a spec has to be accurate. True today: some AI companies publish documents like this, but no law requires them.',
    'fine print':'The small, easy-to-skip lines in a document, where important details sometimes hide.',
    'registry':'An official list that everyone involved can read. In 2040, this one shows where every advanced chip is. True today: there is no such list, though chip sales are tracked in other ways.',
    'advanced chip':'A powerful computer chip of the kind used to build and run expert AIs.',
    'ministry':'A department of a country’s government.',
    'joint statement':'A short document that both sides write and sign together.',
    'name seal':'A small stamp carved with a person’s name. In China, people often stamp it in red ink beside their signature.',
    'hutong':'A narrow lane of old courtyard houses in Beijing. Some hutongs are more than 700 years old.',
    'hutongs':'Narrow lanes of old courtyard houses in Beijing. Some are more than 700 years old.',
    'siheyuan':'A traditional Beijing house built around a square courtyard, with rooms on all four sides.',
    'shichahai':'A group of three lakes in old Beijing, ringed with willows and hutongs.',
    'drum tower':'A tower in Beijing built in the 1270s. Its drums once told the whole city the time.',
    'ginkgo':'One of the oldest kinds of tree on Earth. Its fan-shaped leaves turn gold in autumn.',
    'trust, but verify':'An old saying. It means you can trust someone and still check what they promised.',
    'nǐ hǎo':'“Hello” in Mandarin Chinese.',
    'xièxie':'“Thank you” in Mandarin Chinese.',
    'chá':'“Tea” in Mandarin Chinese.',
    'méi wèntí':'“No problem” in Mandarin Chinese.',
    'xìnrèn':'“Trust” in Mandarin Chinese.'
  },
  guide:{
    'bj-trust-check':{title:'Trust, then check',track:'Government, law, and power',
      text:'Both countries publish the list of goals that each treaty AI must follow. Then each side’s inspectors read the other side’s list and check the other AI’s work against it. Because each side can check the other side’s AI for itself, neither country has to rely on the other’s word alone.',
      real:'True today: arms-control treaties have let each country’s inspectors visit the other’s sites, and “trust, but verify” comes from an old Russian saying. No treaty about AI exists yet. The one in this story is a guess about 2040.'},
    'bj-fine-print':{title:'Read the fine print',track:'Ethics and AI alignment',
      text:'A single line in an AI’s list of goals can change many of the choices that AI makes. So read every line of a published spec, and read your own side’s spec as carefully as you read the other side’s.',
      real:'True today: some AI companies publish documents that describe how their AIs are supposed to behave, and people outside the companies read them and point out problems.'}},
  chatter:{beijing:['My family has lived on this hutong for five generations.','The persimmons are ripe. Mr. Qiao gives them away to anyone who asks.','I came for the Drum Tower. They still beat the drums for visitors every hour.','The lake froze early last winter. Everybody went skating.','I deliver noodles on my bike. A delivery robot only covers the far end of the lane.','Look at the ginkgo! It turns gold in one week, then all the leaves fall at once.']},
  talks:{
    arrive:[
      {who:'byte',mood:'happy',text:'Welcome to Beijing! This narrow lane is called a [[hutong]]. People have lived in houses like these for hundreds of years, and the city keeps them exactly as they were.'},
      {who:'byte',mood:'think',text:'The [[treaty talks]] meet through that red gate, in a [[siheyuan]], which is an old house built around a square courtyard. Every autumn, the American and Chinese teams meet here to check that each country’s AI follows the rules the two countries agreed on. Today you are on the American team.',choices:[
        {t:'What do the teams check?',reply:'Each country has a treaty AI, and each treaty AI follows a published list of goals called its [[spec]]. Your job today is to read China’s list, line by line, and look for any line that could help a country hide something from the inspectors. China’s team is reading our list in the same way.'},
        {t:'Why meet in an old house?',reply:'It is quiet, it belongs to neither government, and the tea at the gate is very good.'}]},
      {who:'qiaoye',mood:'happy',text:'Good morning! [[Nǐ hǎo]]! You must be with the Americans. I’m Qiao Shoucheng. I keep the tea stand by the gate.'},
      {who:'qiaoye',mood:'smile',text:'The treaty talks have met in this courtyard every autumn for twelve years. The first year, nobody would drink my tea, because they all thought I was a spy!',choices:[
        {t:'Xièxie! I’d love a cup of tea.',good:true,mood:'happy',reply:'Ha! A guest with manners. In this lane, we always drink [[chá]] first and go to work afterwards.'},
        {t:'Sorry, I’m late. I should go straight in.',mood:'neutral',reply:'[[Méi wèntí]], no problem. The tea will still be here when you come out.'}]}
    ],
    han:[
      {who:'hanyw',mood:'smile',text:'Welcome. I am Han Yuewen. I lead China’s [[delegation]] this year. I hear this is your first time at the talks.'},
      {who:'hanyw',mood:'neutral',text:'Here is how we work. Your team reads the spec of our treaty AI, which is called Tianping, line by line. Our team reads the spec of your AI, Beacon.'},
      {who:'hanyw',mood:'think',text:'Every line in a treaty AI’s spec has to help both countries keep the treaty, and no line may give one country an advantage. If you find a line that could help a country hide something from an [[inspector]], tell us about it, and we will do the same for you.',choices:[
        {t:'Isn’t that a lot of checking between friends?',mood:'smile',reply:'Our two countries are not enemies, but we do not fully trust each other yet. Each time one side checks a promise and finds that it was kept, the two countries trust each other a little more. In Chinese, the word for trust is [[xìnrèn]].'},
        {t:'Has anyone ever found a real problem?',mood:'neutral',reply:'Every year, and usually small ones. Last year your team found a line in our spec that let reports arrive in the wrong format, and we fixed it within a week.'}]},
      {who:'byte',mood:'think',text:'I can read all of Tianping’s spec in one second. But deciding which lines both countries will accept is the job of the people at these talks, and I can’t decide that for you.'}
    ],
    zhao:[
      {who:'zhaomy',mood:'smile',text:'Hello! I’m Zhao Mingyu, one of the inspectors. I read Beacon’s spec twice last night. Your AI writes very clearly.'},
      {who:'zhaomy',mood:'think',text:'But I found one line near the end, down in the [[fine print]]. It says: “When two plans both follow the treaty, prefer the one that buys more chips from American companies.”'},
      {who:'zhaomy',mood:'neutral',text:'That line does not break any rule in the treaty. But a treaty AI is supposed to help both countries keep the treaty, and this line makes Beacon help American companies sell chips. Our own AI is not allowed to have lines like that.',choices:[
        {t:'You’re right to raise it. Give me a minute to look at it.',good:true,mood:'smile',reply:'Thank you. Take your time. I would rather wait for a real answer.'},
        {t:'That line is probably just there to protect American jobs.',mood:'worried',reply:'Perhaps. But if Tianping had a line like that about Chinese jobs, would your team let it stay?'}]},
      {who:'byte',mood:'think',text:'Mr. Zhao is right about what that line does. It breaks no rule, but whenever Beacon chooses between two allowed plans, the line makes it pick the plan that helps American companies. The spec is accurate, because Beacon really does have that goal. The problem is that a treaty AI should not have that goal at all.'}
    ],
    tea:[
      {who:'qiaoye',mood:'happy',text:'You’re back! Sit, sit. How did the talks go?'},
      {who:'qiaoye',mood:'smile',text:'This [[ginkgo]] tree is older than the drums in the Drum Tower. My grandfather sold tea under it, and his father did before him.'},
      {who:'qiaoye',mood:'think',text:'When I was a boy, people said the two countries would never sit at the same table. Now their teams sit in my courtyard and argue about single words in their AIs’ rules, and afterwards they drink my tea.',choices:[
        {t:'Today one of their inspectors found a mistake in our spec.',good:true,mood:'smile',reply:'And you fixed it in front of them? Good. The other team will remember that your side admitted the mistake and fixed it.'},
        {t:'It was mostly reading. I thought it would be more exciting.',mood:'happy',reply:'Ha! At these talks, a quiet day means the two countries found only small problems, and that is good news for both of them.'}]},
      {who:'qiaoye',mood:'happy',text:'Take a persimmon with you for the road. They are sweetest right after the first frost.'}
    ]
  },
  docs:[],criteria:[],controls:[],start:{},
  planName(){const p=BJ_FIX[bjSt().fix];return T(p?p.short:'Plan')},
  outcomes(){return [{kind:'done',p:1,cap:'',flags:{}}]},truth(){return true},knows(){return true},
  custom:{bj_spec(){bjSpec()},bj_answer(){bjAnswer()},bj_reply(){bjReply()},bj_sign(){bjSign()},bj_debrief(){bjDebrief()}},
  eveningScene:'beijing',eveningPlace:'Hutong near Shichahai · 7:10 PM',
  evening(){const st=bjSt();return [
    `<b>${esc(S.byte.name)}:</b> ${rich('“The [[Drum Tower]] just beat its drums for the evening. The tower is about six hundred years old, and its drums still mark the time.”')}`,
    rich(st.fix==='fix'?'“Mr. Zhao checked Beacon’s spec an hour ago and sent back one word: ‘Confirmed.’ Then he sent a thumbs-up.”':'“Mr. Zhao says his team will read Beacon’s spec again next spring, very carefully.”'),
    rich('“Mr. Qiao kept the tea stand open until the last car left. He put two persimmons in your coat pocket while you were saying goodbye.”'),
    rich('“In the Ledger tonight: a robot factory in Shenzhen has invited an American who runs a school-building robot crew to come and test every way its robot crews can be stopped.”')]},
  brief(){const st=bjSt(),found=BJ_SPEC.filter(x=>x.flag&&st.tap[x.id]).map(x=>x.id);return `Current case: a Beijing travel day for the Lawmaker career. The annual US-China AI treaty talks meet in a restored courtyard house (siheyuan) in the hutongs near Shichahai, by the Drum Tower. Each country's treaty AI runs on a published spec of goals; each side reads the other's. China's lead delegate is Han Yuewen; the Chinese inspector is Zhao Mingyu; Qiao Shoucheng keeps the tea stand at the gate. China's treaty AI is Tianping; America's is Beacon.
Tianping's spec lines: ${BJ_SPEC.map(x=>'"'+x.t+'"').join(' ')}. Two lines could let something slip past inspectors: the 30-day holiday delay and waiting for a ministry official to approve every answer. The player has found: ${found.join(', ')||'none yet'}.
Zhao found a line in Beacon's spec: "When two plans both follow the treaty, prefer the one that buys more chips from American companies." It breaks no rule but tilts a treaty AI toward one country. ${st.fix?'The player chose: '+BJ_FIX[st.fix].t:'The player has not decided how to answer yet.'}
Key consideration: a treaty AI should serve the treaty, not one side; owning up and inviting a check builds trust faster than explaining a problem away.`},
  canned(q){
    if(TRX(/holiday|thirty|30/).test(q))return T('Thirty days is a very long time for a chip report to wait. Chips could be moved somewhere else and brought back again before anybody was told.');
    if(TRX(/ministry|official|approve/).test(q))return T('If a government official has to approve every answer first, then answers could be reworded or held back. Inspectors need to hear the answer straight from the AI.');
    if(TRX(/chip|beacon|american|fine print/).test(q))return T('Beacon’s chip-buying line breaks no rule, but whenever Beacon chooses between two allowed plans, it picks the one that helps American companies sell chips. A treaty AI is supposed to help both countries keep the treaty, so it should not favor either country.');
    if(TRX(/trust|verify|check/).test(q))return T('Both countries publish their treaty AIs’ goals, and each side checks the other side’s AI. Because each side can check for itself, neither country has to rely on the other’s word alone.');
    if(TRX(/tea|qiao|persimmon/).test(q))return T('Mr. Qiao has run the tea stand at the gate through twelve years of these talks. Say xièxie, which means thank you, when he pours.');
    if(TRX(/help|stuck|what do i do/).test(q))return T('Read Tianping’s spec and tap any line that could help a country hide something from the inspectors. Then decide what to do about Beacon’s chip-buying line, and sign the joint statement with Ms. Han.');
    return null},
  lines:[
    {who:'byte',text:'Read every line of Tianping’s spec, and tap any line that could help a country hide something from the inspectors. Two of these lines worry me.'},
    {who:'byte',text:'You found both of the lines that worried me. Let’s show them to Ms. Han.'},
    {who:'hanyw',text:'Thirty days during the holidays. Yes, I see it now. Chips can travel a very long way in thirty days, so we will change the wait to three days.'},
    {who:'hanyw',text:'We wrote that line so that our officials would know what inspectors are asking about. But waiting for an official should never slow down an answer to an inspector. We will change the line, so that Tianping answers the inspector first and tells the ministry at the same time.'},
    {who:'byte',text:'Beacon’s chip-buying line breaks no rule, so you could defend it. But a treaty AI is supposed to help both countries keep the treaty, and Mr. Zhao will remember how you answered him today. Admitting the problem and letting him check the fix would cost our side very little. What matters most to you here?'},
    {who:'hanyw',text:'Thank you. You found two lines in our spec, and you did not hide the one in yours. Mr. Zhao will check your change tonight. When each side fixes the problems the other side finds, these talks are working the way they should.'},
    {who:'hanyw',text:'I understand that the line is legal. But we cannot ask our people to trust an AI that leans toward your companies. We will raise that line first at next year’s talks.'},
    {who:'hanyw',text:'A year is a long time to leave a line like that in place. We will wait, and until then our inspectors will read Beacon’s spec twice as carefully.'}
  ].concat(BJ_SPEC.map(x=>({who:'byte',text:x.why}))),
  shots:{bj_spec:[{label:'both found',run(){const st=bjSt();st.tap={holiday:1,ministry:1,jobs:1};bjSpec()}}],
    bj_answer:[{label:'picked',run(){bjSt().fix='fix';bjAnswer()}}],bj_reply:[{label:'kept it',run(){bjSt().fix='keep';bjReply()}}]}
};

function bjJadePin(x,y){return `<g transform="translate(${x} ${y})"><circle r="10" fill="#5fae8a" stroke="#2a6a4a" stroke-width="1.8"/><circle r="3.6" fill="#f0e8d8" stroke="#2a6a4a" stroke-width="1.4"/><path d="M-6 -5 Q-2 -8 3 -7" stroke="#bfe8d0" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M0 10 L0 20" stroke="#c8302e" stroke-width="2.4"/><path d="M-2 20 h4 l-1 6 h-2z" fill="#c8302e"/></g>`}
function bjBadge(x,y){return `<path d="M${x-26} ${y-92} L${x-6} ${y-4} M${x+14} ${y-92} L${x+4} ${y-4}" stroke="#2f5aa8" stroke-width="5" stroke-linecap="round"/><g transform="translate(${x} ${y}) rotate(-4)"><rect x="-15" y="-4" width="30" height="40" rx="4" fill="#fff" stroke="#3a4a6a" stroke-width="1.6"/><rect x="-15" y="-4" width="30" height="10" rx="3" fill="#2f5aa8"/><circle cx="-5" cy="16" r="6" fill="#ecc6a4" stroke="#3a4a6a" stroke-width="1"/><path d="M4 12 h8 M4 17 h7 M-11 28 h22" stroke="#9aa4be" stroke-width="2" stroke-linecap="round"/><path d="M-11 1 h8 M3 1 h8" stroke="#fff" stroke-width="1.6"/></g>`}

// ---------- reading Tianping's spec ----------
function bjSpec(){const st=bjSt(),found=BJ_SPEC.filter(x=>x.flag&&st.tap[x.id]).length,all=found===2,last=st.last&&BJ_SPEC.find(x=>x.id===st.last);
  const say=all?'You found both of the lines that worried me. Let’s show them to Ms. Han.':last?last.why:'Read every line of Tianping’s spec, and tap any line that could help a country hide something from the inspectors. Two of these lines worry me.';
  const rep=last&&last.flag?{holiday:'Thirty days during the holidays. Yes, I see it now. Chips can travel a very long way in thirty days, so we will change the wait to three days.',ministry:'We wrote that line so that our officials would know what inspectors are asking about. But waiting for an official should never slow down an answer to an inspector. We will change the line, so that Tianping answers the inspector first and tells the ministry at the same time.'}[last.id]:null;
  screen('criteria bj-specscr',`${scene('beijing')}${hud('Courtyard · Treaty talks')}<div class="panel-card bj-desk">
    <div class="bj-doc"><div class="bj-dochead"><b>${esc(T('Tianping'))}</b>${LANG()==='zh'?'':'<span lang="zh">天平</span>'}<i>${esc(T('China’s treaty AI · Published spec, 2042'))}</i></div>
      <ol class="bj-lines">${BJ_SPEC.map((x,i)=>{const t=st.tap[x.id];return `<li><button class="bj-line ${t?(x.flag?'flag':'ok'):''}" data-i="${i}">${esc(T(x.t))}${t?`<em>${x.flag?T('Gap'):T('Fine')}</em>`:''}</button></li>`}).join('')}</ol>
      <div class="bj-found">${[0,1].map(k=>`<i class="${k<found?'on':''}"></i>`).join('')}<span>${esc(T('{0} of 2 found',found))}</span></div></div>
    ${rep?`<div class="bj-han"><span class="sh-face">${portrait({...CAST.hanyw,mood:'think'})}</span><p>${esc(T(rep))}</p></div>`:`<div class="byte-note">${byteBox({...S.byte,mood:all?'happy':'think'})}<p>${esc(T(say))}</p></div>`}
    <button class="btn wide" id="bj-go" ${all?'':'disabled'}>${esc(T('Meet Mr. Zhao'))}</button></div>`);
  if(rep)playLine('hanyw',rep);else playLine('byte',say);
  $$('.bj-line').forEach(b=>b.onclick=()=>{const x=BJ_SPEC[+b.dataset.i];if(!st.tap[x.id]&&!x.flag)st.wrong=(st.wrong||0)+1;st.tap[x.id]=1;st.last=x.id;save();
    MUSIC.sfx&&MUSIC.sfx(x.flag?'chime':'click');if(x.flag&&BJ_SPEC.filter(y=>y.flag&&st.tap[y.id]).length===2)unlock('bj-fine-print')&&toast(T('New Field Guide idea: {0}',T('Read the fine print')),'good');bjSpec()});
  $('#bj-go').onclick=()=>nextStep()}

// ---------- answering for Beacon's line ----------
function bjAnswer(){const st=bjSt();
  const say='Beacon’s chip-buying line breaks no rule, so you could defend it. But a treaty AI is supposed to help both countries keep the treaty, and Mr. Zhao will remember how you answered him today. Admitting the problem and letting him check the fix would cost our side very little. What matters most to you here?';
  screen('criteria bj-answerscr',`${scene('beijing')}${hud('Courtyard · Treaty talks')}<div class="panel-card sh-decide"><h2>${esc(T('Answer for Beacon'))}</h2>
    <div class="bj-quote"><b>${esc(T('Beacon’s spec, line 41'))}</b><p>${esc(T('“When two plans both follow the treaty, prefer the one that buys more chips from American companies.”'))}</p></div>
    <div class="sh-duo"><span class="sh-face">${portrait({...CAST.zhaomy,mood:'neutral'})}</span><span class="sh-face">${portrait({...CAST.hanyw,mood:'neutral'})}</span><p>${esc(T('“What will your side do about it?”'))}</p></div>
    <div class="sh-plans">${mixIdx(Object.keys(BJ_FIX)).map(([k])=>`<button class="sh-plan ${st.fix===k?'on':''}" data-p="${k}"><b>${esc(T(BJ_FIX[k].t))}</b></button>`).join('')}</div>
    <div class="byte-note">${byteBox({...S.byte,mood:'think'})}<p>${esc(T(say))}</p></div>
    <button class="btn wide" id="bj-go" ${st.fix?'':'disabled'}>${esc(T('Tell them'))}</button></div>`);
  if(!st.said){st.said=1;save();setTimeout(()=>playLine('byte',say),300)}
  $$('.sh-plan').forEach(b=>b.onclick=()=>{st.fix=b.dataset.p;save();$$('.sh-plan').forEach(x=>x.classList.toggle('on',x===b));$('#bj-go').disabled=false});
  $('#bj-go').onclick=()=>{unlock('bj-trust-check')&&toast(T('New Field Guide idea: {0}',T('Trust, then check')),'good');nextStep()}}

function bjReply(){const k=bjSt().fix||'fix';
  const t={fix:'Thank you. You found two lines in our spec, and you did not hide the one in yours. Mr. Zhao will check your change tonight. When each side fixes the problems the other side finds, these talks are working the way they should.',
    keep:'I understand that the line is legal. But we cannot ask our people to trust an AI that leans toward your companies. We will raise that line first at next year’s talks.',
    later:'A year is a long time to leave a line like that in place. We will wait, and until then our inspectors will read Beacon’s spec twice as carefully.'}[k];
  zhLine({scene:'beijing',place:'Courtyard · Treaty talks',who:'hanyw',mood:k==='fix'?'happy':'stern',text:t,btn:'Write the joint statement'})}

function bjSign(){const st=bjSt();
  zhSign({scene:'beijing',place:'Courtyard · Treaty talks',title:'Joint statement',
    plan:`<b>${esc(T('Tianping:'))}</b> ${esc(T('holiday reports will arrive within three days, and answers will go straight to the inspector who asked.'))}<br><b>${esc(T('Beacon:'))}</b> ${esc(T({fix:'the chip-buying line comes out today, and Mr. Zhao may check that it is gone.',keep:'the chip-buying line stays in, with an explanation of when Beacon uses it.',later:'the chip-buying line waits for next year’s talks.'}[st.fix||'fix']))}`,
    starters:['Both teams agree ','because ','We will check ','China’s team found ','Our team found '],placeholder:'Both teams agree to change two lines in Tianping’s spec because…',
    partner:{who:'hanyw',name:'Han Yuewen',zh:'韩悦文'},seal:'悦文',signAs:'{0}',done:'Signed and sealed. Both teams will publish it tonight.'})}

function bjDebrief(){const st=bjSt(),found=BJ_SPEC.filter(x=>x.flag&&st.tap[x.id]).length;
  const ask=found===2&&(st.wrong||0)<=2,decision=st.fix==='fix',heart=(S.hearts.qiaoye||0)+(S.hearts.zhaomy||0)>0&&String(S.memo||'').length>=12;
  zhDebrief({scene:'beijing',place:'Debrief · Beijing',stars:{ask,decision,heart},
    items:[{star:'ask',ok:ask,text:ask?'You read every line and found both of the gaps in Tianping’s spec.':'Read each line slowly and ask yourself what an inspector could miss. Two of the lines in Tianping’s spec had gaps that could hide things from inspectors.'},
      {star:'decision',ok:decision,text:decision?'You admitted the problem with Beacon’s line and invited Mr. Zhao to check the change. Admitting a mistake and letting the other side check the fix is the quickest way to win back their trust.':'Beacon’s chip-buying line stayed in place. It was legal, but it made a treaty AI favor one country.'},
      {star:'heart',ok:heart,text:heart?'You treated the other team and Mr. Qiao with respect, and you signed a clear statement.':'Next time, be kind to Mr. Qiao or Mr. Zhao. Kindness helps two teams work well together.'}],
    byte:'Each team read the other team’s AI spec and pointed out the lines that worried them. Finding those lines and agreeing how to fix them is the reason both teams came to Beijing.'})}
MISSIONS.treatytalks.lines.push({who:'byte',text:'Each team read the other team’s AI spec and pointed out the lines that worried them. Finding those lines and agreeing how to fix them is the reason both teams came to Beijing.'});
