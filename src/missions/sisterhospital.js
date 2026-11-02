// missions/sisterhospital.js — Shanghai travel visit for the Care Doctor: "The Sister Hospital".
// Boston Harbor Hospital and Riverside Children's Hospital in Pudong are sister hospitals. The player flies to Shanghai
// for their twice-a-year case conference, held on the terrace of Riverside's old clinic on the Bund (a historic preserve).
// The case: Ellie Gao, 5, in Boston, has had a fever for five days with some signs of Kawasaki disease, but not enough to
// be sure. Boston's hospital AI (Halo) knows Ellie but has seen few cases; Riverside's AI has seen thousands but has never
// met her. Ellie's mother, on video, mentions that her baby-shot scar has gone pink (she was born in Shanghai and got the
// BCG shot there), a real early clue that Shanghai's doctors know well and Boston's rarely see.
// Mechanic (custom step sh_notes): "Compare notes", a two-sided board. The player chooses which of Boston's cards to send
// across; each medical fact flips one of Shanghai's cards and moves the shared forecast. Private cards (name, address,
// school photo) can be sent too, but Ellie's mother asked that they stay home. Then the two doctors choose a plan together
// (sh_decide), write and co-sign a note to Ellie's mother (sh_sign), hear how it went (sh_news), and debrief.
// Medicine here is real (Kawasaki disease, IVIG, the BCG-scar clue); the hospital AIs are the game's 2040.
// Shared screens: src/missions/china_common.js. Scene: src/scenes/shanghai.js. Styles: src/css/china.css.
const SH_CARDS={
  boston:[
    {id:'fever',t:'Fever for five days that keeps coming back',kind:'med',reply:'s_rate'},
    {id:'eyes',t:'Red eyes and red, cracked lips',kind:'med',reply:'s_incomplete'},
    {id:'norash',t:'No rash, and her hands and feet look normal',kind:'med',reply:'s_incomplete'},
    {id:'born',t:'Born in Shanghai, with her baby shots there',kind:'med',key:1,reply:'s_bcg'},
    {id:'scar',t:'Her baby-shot scar turned pink and puffy yesterday',kind:'med',key:1,clue:'bcg',reply:'s_scar'},
    {id:'name',t:'Her full name and birthday',kind:'private'},
    {id:'addr',t:'Her home address in Boston',kind:'private'},
    {id:'photo',t:'A photo from her school',kind:'private'}],
  shanghai:{
    s_rate:{who:'wenjh',k:'Riverside sees many more cases',t:'Riverside treats about 300 children with Kawasaki disease a year. Boston Harbor sees about 20.'},
    s_incomplete:{who:'luguo',k:'Early on, only two or three signs',t:'Many children with Kawasaki disease show only two or three signs at first. If we wait for every sign, we can wait too long.'},
    s_bcg:{who:'wenjh',k:'Babies in China get the BCG shot',t:'Babies in China get the [[BCG]] shot at birth. Most children born in the United States never get it, so Halo has almost never seen this clue.'},
    s_scar:{who:'luguo',k:'A red BCG scar is a strong clue',t:'In young children who had the BCG shot, the scar turns red in about half of those with Kawasaki disease. With an ordinary virus, it almost never does.'}}};
// the shared forecast that it is Kawasaki disease, in percent, from what has been sent
function shForecast(st){const s=st.sent||{};if(!SH_CARDS.boston.some(c=>c.kind==='med'&&s[c.id]))return null;
  let p=45;if(s.fever&&s.eyes&&s.norash)p+=5;if(s.born)p+=4;if(s.scar)p+=s.born?28:18;return Math.min(84,p)}
function shSt(){const st=zhSt('sh');st.sent=st.sent||{};return st}
const SH_PLANS={
  treat:{t:'Start the IVIG drip tonight, and scan her heart in the morning',short:'Drip tonight, heart scan tomorrow'},
  scan:{t:'Scan her heart tonight, and start the drip only if the scan shows swelling',short:'Heart scan first'},
  wait:{t:'Wait two more days, and treat her if the fever keeps coming back',short:'Wait two more days'}};

MISSIONS.sisterhospital={id:'sisterhospital',title:'The Sister Hospital',career:'doctor',day:5,dayLabel:'Travel',tag:'Travel',kind:'travel',year:1,season:'fall',district:'shanghai',rank:'trainee',
  blurb:'Boston’s sister hospital in Shanghai is comparing notes on a rare disease. Each side knows something the other doesn’t.',after:['maya'],
  place:'The Bund · Shanghai',
  flow:[{name:'sh_arrive',k:'talk',talk:'arrive',scene:'shanghai',place:'The Bund · Shanghai · 7:40 AM'},
    {name:'sh_walk',k:'custom'},
    {name:'sh_case',k:'talk',talk:'caseconf',scene:'shanghai',place:'Bund Clinic · 9:00 AM'},
    {name:'sh_mom',k:'talk',talk:'mom',scene:'shanghai',place:'Video call · Boston, 9:15 PM'},
    {name:'sh_notes',k:'custom'},
    {name:'sh_decide',k:'custom'},
    {name:'sh_sign',k:'custom'},
    {name:'sh_news',k:'custom'},
    {name:'sh_debrief',k:'custom'},
    {name:'sh_evening',k:'evening'}],
  cast:{
    wenjh:{name:'Dr. Wen Jiahui',role:'Children’s doctor, Riverside Children’s Hospital',face:'oval',skin:'#f4d6bf',hair:'#1d1416',hairStyle:'lob',eyeShape:'almond',eye:'#3a2216',
      shirt:'#5fb3a8',coat:true,glasses:true,frame:'#b98a46',art(m){return zhArt(this,m,{chest:shMagnoliaPin(112,270)})}},
    luguo:{name:'Dr. Lu Guoqiang',role:'Children’s heart doctor, Riverside',face:'long',skin:'#ecc4a2',hair:'#d2cfd8',hairStyle:'sidepart',age:'elder',masc:true,eyeShape:'hooded',eye:'#2e1c12',
      outfit:'cardigan',shirt:'#8a6a4e',under:'#ece6da',glasses:true,frame:'#2a2a36',art(m){return zhArt(this,m,{chest:shHeartPin(112,292)})}},
    gaoying:{name:'Gao Ying',role:'Ellie’s mom, on video from Boston',part:'left',hairStyle:'wavy',face:'round',part:'left',skin:'#f2cdb0',hair:'#2a1c18',hairStyle:'wavy',eyeShape:'mono',eye:'#2a1a12',
      outfit:'hoodie',shirt:'#9a8ad8',accessory:'earring'}
  },
  voices:{wenjh:'af_nicole',luguo:'elder_man',gaoying:'af_sarah'},
  glossary:{
    'sister hospital':'A hospital in another city that works with yours. Their doctors visit each other and compare hard cases.',
    'sister hospitals':'Hospitals in two cities that work together. Their doctors visit each other and compare hard cases.',
    'kawasaki disease':'A rare illness, mostly in children under five, that causes a long fever and red eyes and lips. If it is not treated, it can hurt the heart.',
    'incomplete kawasaki':'Kawasaki disease that shows only some of the usual signs, so it is harder to be sure about.',
    'coronary arteries':'The small blood vessels that bring blood to the heart muscle itself.',
    'ivig':'A drip of antibodies collected from donated blood. It calms the body’s attack on its own blood vessels in Kawasaki disease.',
    'bcg':'A vaccine that protects babies from a lung disease called tuberculosis. Babies in China get it at birth, and it leaves a small round scar on the arm.',
    'heart scan':'A painless ultrasound picture of the heart. Doctors call it an echocardiogram.',
    'the bund':'Shanghai’s old riverfront, a row of grand stone buildings from about a hundred years ago along the Huangpu River.',
    'bund':'Shanghai’s old riverfront, a row of grand stone buildings along the Huangpu River.',
    'lujiazui':'The business district across the river from the Bund, where Shanghai’s tallest towers stand.',
    'huangpu':'The river that runs through the middle of Shanghai.',
    'pudong':'The part of Shanghai on the east side of the Huangpu River.',
    'qingtai':'A new town across the river, built in one piece, with homes, shops and gardens stacked on wide terraces. It is a guess about 2040.',
    'zǎoshang hǎo':'“Good morning” in Mandarin Chinese.',
    'nǐ hǎo':'“Hello” in Mandarin Chinese.',
    'xièxie':'“Thank you” in Mandarin Chinese.',
    'yīshēng':'“Doctor” in Mandarin Chinese.',
    'lóngjǐng':'A green tea from Hangzhou, a city near Shanghai. Its name means “dragon well.”',
    'jiāyóu':'A Mandarin cheer that means “keep going” or “you can do it.” Word for word, it means “add oil.”',
    'de-identified':'With names, addresses and photos taken out, so nobody can tell who the person is.',
    'case conference':'A meeting where doctors talk through one patient’s case together.'
  },
  guide:{
    'sh-two-halves':{title:'Two halves of the picture',track:'Evidence and truth',
      text:'Halo knew Ellie. Riverside’s AI knew Kawasaki disease. Neither could see the whole picture alone. When two teams each know something the other doesn’t, sharing the right facts beats trusting either side’s guess.',
      real:'True today: Kawasaki disease is much more common in Japan, Korea and China than in the United States, and doctors there noticed that a red BCG scar can be an early clue. The hospital AIs in this story are a guess about 2040.'},
    'sh-need-to-know':{title:'Share what’s needed',track:'People skills',
      text:'Ellie’s mother agreed to share her medical facts, but not her name. Doctors can compare cases without knowing who the child is. Asking first, and sharing only what the job needs, keeps people’s trust.',
      real:'True today: hospitals often take out names, addresses and photos before they share records for research. This is called de-identifying the data.'}},
  chatter:{shanghai:['Every morning I walk the Bund before work. The river looks different every day.','My grandmother danced here in the 1990s. Now I bring my kids.','The ferries are so quiet now. You can hear the gulls.','That terraced town across the river has a forest on the roof. I want to live there.','Try the soup dumplings on the corner. Bite a small hole first, or you’ll burn your tongue!','The old buildings behind us are almost a hundred years old. They look just like my grandpa’s photos.']},
  talks:{
    arrive:[
      {who:'byte',mood:'happy',text:'Good morning from Shanghai! This is [[the Bund]], the old riverfront. The towers across the river are [[Lujiazui]].'},
      {who:'byte',mood:'think',text:'Boston Harbor Hospital and Riverside Children’s Hospital are [[sister hospitals]]. Twice a year their doctors compare hard cases. This time, you’re the Boston doctor at the table.',choices:[
        {t:'What’s the case?',reply:'A five-year-old in Boston named Ellie has had a fever for five days. It might be a rare illness that Shanghai’s doctors know much better than we do.'},
        {t:'Why fly here for a meeting?',reply:'Some things go better face to face. And Riverside sees some rare illnesses fifteen times as often as Boston does.'}]},
      {who:'wenjh',mood:'happy',text:'[[Zǎoshang hǎo]]! Good morning! I’m Dr. Wen Jiahui, a children’s doctor at Riverside. Welcome to Shanghai.'},
      {who:'wenjh',mood:'smile',text:'I trained at Boston Harbor for a year. I still miss the clam chowder, and I still talk with your Dr. Reyes every month.'},
      {who:'wenjh',mood:'neutral',text:'Our [[case conference]] is on the terrace of Riverside’s old clinic, right here on the Bund. The new hospital is the white building across the river, with the teal cross.',choices:[
        {t:'Nǐ hǎo! Thank you for meeting me so early.',good:true,mood:'happy',reply:'Your Mandarin is good! For thank you, we say [[xièxie]]. You’ll hear it a lot today.'},
        {t:'What’s that terraced building with the trees?',mood:'smile',reply:'That’s [[Qingtai]], a new town built all at once, with homes and shops and gardens stacked up together. The Bund stays the way it was. People here like it that way.'}]}
    ],
    caseconf:[
      {who:'luguo',mood:'smile',text:'Welcome, Doctor. I’m Lu Guoqiang. I take care of children’s hearts at Riverside. Please sit down. The tea is [[lóngjǐng]], from Hangzhou.'},
      {who:'luguo',mood:'neutral',text:'Dr. Reyes sent us Ellie’s case last night. Let me make sure I have it right. She is five, with a fever for five days, red eyes and red, cracked lips.'},
      {who:'luguo',mood:'think',text:'She has no rash, and her hands and feet look normal. So she has some signs of [[Kawasaki disease]], but not enough to be sure. We call that [[incomplete Kawasaki]].'},
      {who:'wenjh',mood:'neutral',text:'Kawasaki disease is rare in Boston. Here we treat about three hundred children with it every year. It is much more common in East Asia, and nobody knows exactly why.'},
      {who:'luguo',mood:'stern',text:'If it is Kawasaki, the fever is not the real danger. The danger is to the heart. The illness can swell the [[coronary arteries]], the small vessels that feed the heart muscle.',choices:[
        {t:'How do you treat it?',mood:'smile',reply:'With [[IVIG]], a drip of antibodies from donated blood, plus aspirin. Given within ten days of the first fever, it protects the heart in almost every child.'},
        {t:'And if it isn’t Kawasaki?',mood:'neutral',reply:'Then it is most likely a virus that will pass on its own, and the drip would mean a long day in hospital for nothing. That is why we try to be sure first.'}]},
      {who:'byte',mood:'think',text:'Boston’s hospital AI, Halo, is 30% sure it’s Kawasaki. Riverside’s AI is 45% sure. Halo knows Ellie but has seen only a few cases like hers. Riverside’s AI has seen thousands, but it has never met Ellie.'},
      {who:'wenjh',mood:'smile',text:'Ellie’s mother is on video from Boston. It is evening there. Let’s say hello.'}
    ],
    mom:[
      {who:'gaoying',mood:'worried',text:'Hi, Doctor. Hi, everyone. I’m Gao Ying, Ellie’s mom. She just fell asleep. The fever keeps coming back every few hours.'},
      {who:'gaoying',mood:'smile',text:'Dr. Reyes said you’re in Shanghai today. I grew up there! Ellie was born there too. We moved to Boston when she was one.'},
      {who:'gaoying',mood:'think',text:'This might be silly, but she keeps showing me her arm. The little round scar from her baby shot went pink and puffy yesterday. Is that from the fever?',clue:'bcg'},
      {who:'gaoying',mood:'worried',text:'I just want to know what this is. And I don’t want her stuck in the hospital for nothing.',choices:[
        {t:'We’ll work it out together tonight, and I’ll tell you how sure we are.',good:true,mood:'smile',reply:'Thank you. Please tell me the truth, even if nobody is sure yet.'},
        {t:'Try not to worry. It’s almost certainly just a virus that will pass.',mood:'worried',reply:'Almost certainly? Dr. Reyes said that’s exactly what you were trying to find out.'}]},
      {who:'wenjh',mood:'neutral',text:'Thank you, Ms. Gao. May we share Ellie’s medical facts with Riverside’s AI, so it can compare her with the children we’ve treated?'},
      {who:'gaoying',mood:'smile',text:'Her medical facts, yes. Please leave out her name and where we live. I don’t want her name in a hospital computer on the other side of the world.'}
    ]
  },
  docs:[],criteria:[],controls:[],start:{},
  planName(){const p=SH_PLANS[shSt().plan];return p?p.short:'Plan'},
  outcomes(){return [{kind:'done',p:1,cap:'',flags:{}}]},truth(){return true},knows(){return true},
  custom:{sh_walk(){shWalk()},sh_notes(){shNotes()},sh_decide(){shDecide()},sh_sign(){shSign()},sh_news(){shNews()},sh_debrief(){shDebrief()}},
  eveningScene:'shanghai_night',eveningPlace:'The Bund · Shanghai · 9:30 PM',
  evening(){const st=shSt();return [
    `<b>${esc(S.byte.name)}:</b> “Look at the river. Every tower is doubled in the water.”`,
    rich(`“Dr. Wen sent a message: ‘[[Xièxie]] for today. Ellie is lucky to have two hospitals looking after her.’${st.plan==='treat'?' She added a photo of a pancake.':''}”`),
    rich('“And the Ledger says American and Chinese treaty teams meet in Beijing next month, to check each other’s AI promises in person.”')]},
  brief(){const st=shSt(),f=shForecast(st);return `Current case: a Shanghai travel day for the Care Doctor. Boston Harbor Hospital and Riverside Children's Hospital in Pudong, Shanghai, are sister hospitals; the player is at their case conference on the terrace of Riverside's old clinic on the Bund. Doctors: Dr. Wen Jiahui (children's doctor, trained a year in Boston) and Dr. Lu Guoqiang (children's heart doctor). Patient: Ellie Gao, 5, in Boston, fever for 5 days that keeps coming back, red eyes and red cracked lips, no rash, hands and feet normal: possible incomplete Kawasaki disease. Kawasaki disease is rare in Boston (about 20 children a year at Boston Harbor) and much more common in East Asia (about 300 a year at Riverside). Treatment: IVIG (antibodies from donated blood) plus aspirin, best within 10 days of the first fever; it protects the coronary arteries in almost every child. A heart scan this early often looks normal even with Kawasaki. Halo (Boston's AI) is 30% sure; Riverside's AI is 45% sure. Ellie's mother Gao Ying says Ellie was born in Shanghai and got her baby shots there (including the BCG shot, given at birth in China and rarely in the US), and her BCG scar turned pink and puffy yesterday, which Shanghai's doctors know as a strong early clue. She agreed to share Ellie's medical facts but not her name, address or photos.
What has been shared so far: ${Object.keys(st.sent).filter(k=>st.sent[k]).join(', ')||'nothing yet'}. Shared forecast: ${f==null?'not yet':f+'% Kawasaki'}. ${st.plan?'The doctors chose: '+SH_PLANS[st.plan].t+'.':''}
Key consideration: ${st.sent.scar?'with the scar clue, it is probably Kawasaki, and treatment works best within ten days; a heart scan tonight could look normal even if it is Kawasaki.':'ask whether Ellie\'s mother mentioned anything Halo might not know about, like where Ellie got her baby shots or her vaccine scar.'}`},
  canned(q){const st=shSt();
    if(/scar|bcg|shot|vaccin|arm/.test(q))return st.sent.scar?'That scar is the clue Halo couldn’t see. In children who had the BCG shot, it turns red in about half of those with Kawasaki disease.':'Ms. Gao said Ellie’s baby-shot scar went pink yesterday. Riverside’s doctors might know what that means. Try sending it across.';
    if(/name|address|photo|privat/.test(q))return 'Ms. Gao said yes to sharing Ellie’s medical facts and no to her name, address and photos. Riverside’s AI doesn’t need them to compare her with other children.';
    if(/kawasaki/.test(q))return 'Kawasaki disease mostly affects children under five. It causes a long fever, red eyes and lips, and sometimes a rash and swollen hands. The real danger is to the heart’s small arteries, so it’s treated quickly.';
    if(/ivig|drip|treat/.test(q))return 'IVIG is a drip of antibodies from donated blood. Given within ten days of the first fever, it protects the heart in almost every child. Today is day five.';
    if(/scan|echo|heart/.test(q))return 'A heart scan is a painless ultrasound. This early, it often looks normal even when it is Kawasaki, so a normal scan wouldn’t settle the question.';
    if(/mandarin|chinese|say|word/.test(q))return 'Try “nǐ hǎo” for hello and “xièxie” for thank you. Dr. Wen will be delighted.';
    if(/help|stuck|what do i do/.test(q))return 'Listen to Ellie’s mom, then send Boston’s medical facts across to Riverside one card at a time. Keep her private details at home. Then choose a plan with Dr. Wen and sign it together.';
    return null},
  lines:[
    {who:'byte',text:'Send Boston’s cards across one at a time. Each fact you share can change what Riverside’s AI sees.'},
    {who:'byte',text:'Both AIs are looking at the same facts now. Together they think it is probably Kawasaki: about 8 in 10.'},
    {who:'byte',text:'Together they’re still not sure. Is there anything Ms. Gao said that Halo might not know about?'},
    {who:'wenjh',text:'Her mother asked us to leave that out. Let’s keep it in Boston. Riverside’s AI doesn’t need it.'},
    {who:'byte',text:'The drip works best within ten days of the first fever, and today is day five. This early, a heart scan can look normal even with Kawasaki. With what we know together, I’d start the drip tonight and scan her heart in the morning. What matters most to you?'},
    {who:'byte',text:'We’re close to a coin flip. A heart scan tonight is quick and painless, but this early it can look normal even with Kawasaki. I’d scan first. Did Ms. Gao mention anything Halo wouldn’t know?'},
    {who:'gaoying',text:'Her fever broke at three in the morning. She just asked for pancakes! Dr. Reyes says her heart scan looks normal.'},
    {who:'gaoying',text:'The heart scan last night looked normal, so they waited. The fever came back this morning, and Dr. Reyes started the drip at noon. Her heart still looks fine.'},
    {who:'gaoying',text:'The fever kept coming back for two more days, so Dr. Reyes started the drip on day seven. Her heart is fine, but they want to check it again in six weeks.'},
    {who:'byte',text:'You helped two hospitals see one whole picture, and you kept Ellie’s name where her mom wanted it.'},
    {who:'byte',text:'The Bund’s buildings are about a hundred years old. Shanghai keeps them just as they were, so the delivery robots work quietly in the back lanes.'},
    {who:'byte',text:'That’s Qingtai across the water: a whole new town stacked on terraces, with trains running through tunnels under its gardens.'}
  ].concat(Object.values(SH_CARDS.shanghai).map(c=>({who:c.who,text:c.t}))),
  shots:{
    sh_notes:[{label:'scar shared',run(){const st=shSt();st.sent={fever:1,eyes:1,born:1,scar:1};shNotes()}},{label:'private card sent',run(){const st=shSt();st.sent={fever:1};shNotes('name')}}],
    sh_decide:[{label:'picked',run(){const st=shSt();st.sent={fever:1,eyes:1,norash:1,born:1,scar:1};st.plan='treat';shDecide()}}],
    sh_news:[{label:'heart scan first',run(){shSt().plan='scan';shNews()}},{label:'waited',run(){shSt().plan='wait';shNews()}}]}
};

// ---------- pins and pictures ----------
function shMagnoliaPin(x,y){return `<g transform="translate(${x} ${y})"><circle r="11" fill="#fffaf2" stroke="#c9b48a" stroke-width="1.6"/>
  ${[0,72,144,216,288].map(a=>`<path d="M0 0 C-3.2 -3 -2.6 -8.4 0 -9.6 C2.6 -8.4 3.2 -3 0 0Z" fill="#ffffff" stroke="#d8a8b8" stroke-width=".9" transform="rotate(${a})"/>`).join('')}<circle r="2" fill="#f0c860"/></g>`}
function shHeartPin(x,y){return `<g transform="translate(${x} ${y})"><path d="M0 7 C-9 0 -9 -7 -4.6 -8.4 C-2.2 -9.2 -.6 -7.6 0 -6 C.6 -7.6 2.2 -9.2 4.6 -8.4 C9 -7 9 0 0 7Z" fill="#e0485a" stroke="#8a1e2a" stroke-width="1.4"/><path d="M-4 -5 Q-5.6 -3 -4.4 -1" stroke="#fff" stroke-width="1.2" fill="none" opacity=".8"/></g>`}
function shIcon(id){const I={
  fever:'<rect x="15" y="4" width="10" height="26" rx="5" fill="#fff" stroke="#5a5a7a" stroke-width="2"/><circle cx="20" cy="31" r="7" fill="#ff6a5a" stroke="#5a5a7a" stroke-width="2"/><rect x="18" y="14" width="4" height="16" fill="#ff6a5a"/>',
  eyes:'<path d="M4 20 Q20 6 36 20 Q20 34 4 20Z" fill="#fff" stroke="#5a5a7a" stroke-width="2"/><path d="M8 18 l5 2 M30 18 l-5 2 M10 23 l4 -1" stroke="#ff6a5a" stroke-width="1.4"/><circle cx="20" cy="20" r="6" fill="#4a3424"/><circle cx="18" cy="18" r="2" fill="#fff"/>',
  norash:'<path d="M10 34 C8 24 10 14 14 10 C16 6 20 8 20 12 L22 8 C24 4 28 6 27 10 L30 12 C32 18 30 28 28 34Z" fill="#f2cdb0" stroke="#5a5a7a" stroke-width="2"/><path d="M28 6 L36 14 M36 6 L28 14" stroke="#16b3a6" stroke-width="2.4" stroke-linecap="round"/>',
  born:'<rect x="5" y="8" width="30" height="22" rx="4" fill="#fff" stroke="#5a5a7a" stroke-width="2"/><path d="M5 14 H35" stroke="#e0485a" stroke-width="4"/><path d="M11 22 h18 M11 26 h12" stroke="#9aa4be" stroke-width="2"/><circle cx="29" cy="24" r="3.4" fill="#e0485a"/>',
  scar:'<path d="M6 34 C6 18 10 8 20 6 C30 8 34 18 34 34Z" fill="#f2cdb0" stroke="#5a5a7a" stroke-width="2"/><circle cx="20" cy="20" r="6" fill="#ff9aa8" stroke="#e0485a" stroke-width="1.6"/><circle cx="20" cy="20" r="2.4" fill="#f9d8d0"/>',
  name:'<rect x="6" y="9" width="28" height="22" rx="4" fill="#fff" stroke="#5a5a7a" stroke-width="2"/><circle cx="14" cy="18" r="4" fill="#9aa4be"/><path d="M21 16 h9 M21 21 h7 M10 26 h20" stroke="#9aa4be" stroke-width="2"/>',
  addr:'<path d="M6 20 L20 8 L34 20 V34 H6Z" fill="#fff" stroke="#5a5a7a" stroke-width="2" stroke-linejoin="round"/><rect x="16" y="24" width="8" height="10" fill="#9aa4be"/>',
  photo:'<rect x="5" y="9" width="30" height="24" rx="3" fill="#fff" stroke="#5a5a7a" stroke-width="2"/><circle cx="20" cy="19" r="5" fill="#f2cdb0" stroke="#5a5a7a" stroke-width="1.4"/><path d="M11 31 C12 25 28 25 29 31" fill="#9a8ad8"/>'};
  return `<svg viewBox="0 0 40 40" aria-hidden="true">${I[id]||''}</svg>`}

// ---------- the walk along the Bund ----------
function shWalk(){const st=shSt();
  screen('walk sh-walk',`${scene('shanghai')}${hud('The Bund · Shanghai')}<div class="props walklayer"><div class="walk-byte">${byteBox({...S.byte,mood:'happy'},'trot')}</div></div>
    ${zhPlace({name:'Shanghai',zh:'上海',time:'Friday, 8:50 AM'})}
    <div class="caption-card"><p>${rich('A cool wind comes off the [[Huangpu]]. Electric ferries hum across, and gulls follow them. Across the water, the white hospital with the teal cross is already busy.')}</p>
    <div class="row"><button class="btn small ghost" id="sh-look">${st.looked?'Look again':'Look across the river'}</button><button class="btn small" id="on">Go to the terrace</button></div></div>`);
  $('#sh-look').onclick=()=>{const t=st.looked?'That’s Qingtai across the water: a whole new town stacked on terraces, with trains running through tunnels under its gardens.':'The Bund’s buildings are about a hundred years old. Shanghai keeps them just as they were, so the delivery robots work quietly in the back lanes.';
    st.looked=(st.looked||0)+1;save();toast(S.byte.name+': '+t,'good');playLine('byte',t)};
  $('#on').onclick=()=>nextStep()}

// ---------- Compare notes: the two-sided board ----------
function shNotes(flash){const st=shSt(),f=shForecast(st),sent=st.sent,noted=!!S.notes.bcg;
  const card=c=>{const on=!!sent[c.id];return `<button class="sh-card ${c.kind} ${on?'sent':''} ${c.clue&&noted?'noted':''}" data-c="${c.id}" ${on?'disabled':''}>
      <span class="sh-ic">${shIcon(c.id)}</span><span class="sh-t">${esc(c.t)}</span>${c.kind==='private'?'<i class="sh-lock" aria-label="Private">●</i>':''}${c.clue&&noted?'<i class="sh-nb">From your notebook</i>':''}</button>`};
  const shown=Object.keys(SH_CARDS.shanghai).filter(k=>SH_CARDS.boston.some(c=>sent[c.id]&&c.reply===k));
  const open=st.open&&shown.includes(st.open)?st.open:shown[shown.length-1];
  const reply=k=>{const r=SH_CARDS.shanghai[k],c=CAST[r.who],o=k===open;return `<button class="sh-reply ${k} ${o?'open':''}" data-k="${k}"><span class="sh-face">${portrait({...c,mood:'smile'})}</span><p>${o?rich(r.t):esc(r.k)}</p></button>`};
  const bar=(lbl,v,cls)=>`<div class="sh-bar ${cls}"><span>${esc(lbl)}</span><div class="sh-track"><i style="width:${v==null?0:v}%"></i></div><b>${v==null?'?':v+'%'}</b></div>`;
  const nMed=SH_CARDS.boston.filter(c=>c.kind==='med'&&sent[c.id]).length;
  const say=flash?'Her mother asked us to leave that out. Let’s keep it in Boston. Riverside’s AI doesn’t need it.':f==null?'Send Boston’s cards across one at a time. Each fact you share can change what Riverside’s AI sees.':f>=70?'Both AIs are looking at the same facts now. Together they think it is probably Kawasaki: about 8 in 10.':nMed>=3?'Together they’re still not sure. Is there anything Ms. Gao said that Halo might not know about?':'';
  screen('criteria sh-notesscr',`${scene('shanghai')}${hud('Riverside’s Bund Clinic')}<div class="panel-card sh-board"><h2>Compare notes</h2>
    <div class="sh-cols"><div class="sh-col boston"><div class="sh-head"><b>Boston</b><span>Ellie’s chart</span></div>${SH_CARDS.boston.map(card).join('')}</div>
      <div class="sh-col shanghai"><div class="sh-head"><b>Shanghai</b><span lang="zh">上海</span></div>${shown.length?shown.map(reply).join(''):'<p class="sh-empty">Riverside’s team is listening.</p>'}</div></div>
    <div class="sh-meter"><div class="sh-mlbl">Is it Kawasaki disease?</div>${bar('Halo, Boston',30,'b')}${bar('Riverside’s AI',45,'s')}${bar('Together',f,'t')}</div>
    ${say?`<div class="byte-note">${byteBox({...S.byte,mood:flash?'alert':f>=70?'happy':'think'})}<p>${esc(flash?CAST.wenjh.name+': “'+say+'”':say)}</p></div>`:''}
    <button class="btn wide" id="sh-go" ${nMed>=3?'':'disabled'}>Decide with Dr. Wen</button></div>`);
  if(say&&!flash)playLine('byte',say);if(flash)playLine('wenjh',say);
  $$('.sh-card').forEach(b=>b.onclick=()=>{const c=SH_CARDS.boston.find(x=>x.id===b.dataset.c);MUSIC.sfx&&MUSIC.sfx('whoosh');
    if(c.kind==='private'){st.leak=(st.leak||0)+1;save();b.classList.add('sh-bounce');setTimeout(()=>shNotes(c.id),420);return}
    sent[c.id]=1;st.open=c.reply;save();b.classList.add('sh-fly');
    if(c.id==='scar'||c.id==='born')unlock('sh-two-halves')&&toast('New Field Guide idea: Two halves of the picture','good');
    setTimeout(()=>{shNotes();const r=SH_CARDS.shanghai[c.reply];st.open=c.reply;if(r&&!(st.heard||{})[c.reply]){st.heard=st.heard||{};st.heard[c.reply]=1;save();setTimeout(()=>playLine(r.who,r.t),900)}
      const el=$('.sh-reply.'+c.reply);el&&el.classList.add('sh-new')},380)});
  $$('.sh-reply').forEach(b=>b.onclick=()=>{st.open=b.dataset.k;save();shNotes()});
  $('#sh-go').onclick=()=>{unlock('sh-need-to-know')&&toast('New Field Guide idea: Share what’s needed','good');nextStep()}}

// ---------- choosing a plan together ----------
function shDecide(){const st=shSt(),f=shForecast(st)||45,know=f>=70;
  const say=know?'The drip works best within ten days of the first fever, and today is day five. This early, a heart scan can look normal even with Kawasaki. With what we know together, I’d start the drip tonight and scan her heart in the morning. What matters most to you?'
    :'We’re close to a coin flip. A heart scan tonight is quick and painless, but this early it can look normal even with Kawasaki. I’d scan first. Did Ms. Gao mention anything Halo wouldn’t know?';
  const odds={treat:`If it is Kawasaki (about ${f} in 100), her heart is protected in almost every case. If it isn’t, she spends a long day on a drip she didn’t need.`,
    scan:`A clear scan sends her home tonight. But this early, a scan can look normal even with Kawasaki, which could delay the drip by a day or more.`,
    wait:`Some fevers fade by themselves. If this one is Kawasaki, she still gets the drip before day ten, but closer to the edge.`};
  const opt=k=>`<button class="sh-plan ${st.plan===k?'on':''}" data-p="${k}"><b>${esc(SH_PLANS[k].t)}</b><span>${esc(odds[k])}</span></button>`;
  screen('criteria sh-decidescr',`${scene('shanghai')}${hud('Riverside’s Bund Clinic')}<div class="panel-card sh-decide"><h2>Choose together</h2>
    <div class="sh-duo"><span class="sh-face">${portrait({...CAST.wenjh,mood:'think'})}</span><span class="sh-face">${portrait({...CAST.luguo,mood:'neutral'})}</span><p>“${esc(know?'With the scar, I think it is Kawasaki. But she is your patient, Doctor. What do you want to do?':'We are not sure yet. She is your patient, Doctor. What do you want to do?')}”</p></div>
    <div class="sh-plans">${mixIdx(Object.keys(SH_PLANS)).map(([k])=>opt(k)).join('')}</div>
    <div class="byte-note">${byteBox({...S.byte,mood:'think'})}<p>${esc(say)}</p></div>
    <button class="btn wide" id="sh-go" ${st.plan?'':'disabled'}>Write it down</button></div>`);
  if(!st.planSaid){st.planSaid=1;save();setTimeout(()=>playLine('byte',say),300)}
  $$('.sh-plan').forEach(b=>b.onclick=()=>{st.plan=b.dataset.p;save();$$('.sh-plan').forEach(x=>x.classList.toggle('on',x===b));$('#sh-go').disabled=false});
  $('#sh-go').onclick=()=>nextStep()}

function shSign(){const st=shSt(),p=SH_PLANS[st.plan]||SH_PLANS.treat;
  zhSign({scene:'shanghai',place:'Riverside’s Bund Clinic',title:'A note to Ellie’s mom',plan:`<b>Plan:</b> ${esc(p.t)}.`,
    starters:['We recommend ','because ','Shanghai’s doctors noticed ','We are about ','We will check '],placeholder:'We recommend starting the drip tonight because…',
    partner:{who:'wenjh',name:'Dr. Wen Jiahui',zh:'温佳慧'},signAs:'Dr. {0}',done:'Signed by both doctors. Dr. Reyes will read it to Ms. Gao tonight.'})}

function shNews(){const st=shSt(),k=st.plan||'treat';
  const t={treat:'Her fever broke at three in the morning. She just asked for pancakes! Dr. Reyes says her heart scan looks normal.',
    scan:'The heart scan last night looked normal, so they waited. The fever came back this morning, and Dr. Reyes started the drip at noon. Her heart still looks fine.',
    wait:'The fever kept coming back for two more days, so Dr. Reyes started the drip on day seven. Her heart is fine, but they want to check it again in six weeks.'}[k];
  zhLine({scene:'shanghai',place:'Video call · Saturday morning',who:'gaoying',mood:k==='treat'?'happy':k==='scan'?'smile':'worried',text:t,btn:'See how you did'})}

function shDebrief(){const st=shSt(),s=st.sent,f=shForecast(st)||0,know=f>=70;
  const ask=!!(s.scar&&s.born),decision=know?st.plan==='treat':st.plan!=='wait',memo=String(S.memo||'').length>=12,heart=!st.leak&&memo;
  zhDebrief({scene:'shanghai',place:'Debrief · The Bund',stars:{ask,decision,heart},
    items:[{star:'ask',ok:ask,text:ask?'You sent the scar and the baby shots across, so both AIs saw the whole picture.':'Halo never learned about Ellie’s pink BCG scar, the one clue Shanghai’s doctors know best.'},
      {star:'decision',ok:decision,text:decision?'Your plan fit what both hospitals knew together.':'With what you knew together, another plan would have protected Ellie’s heart sooner.'},
      {star:'heart',ok:heart,text:st.leak?'You tried to send something Ms. Gao asked you to keep private. Dr. Wen caught it this time.':'You kept Ellie’s name and home private, the way her mom asked, and wrote to her plainly.'}],
    byte:'You helped two hospitals see one whole picture, and you kept Ellie’s name where her mom wanted it.'})}
