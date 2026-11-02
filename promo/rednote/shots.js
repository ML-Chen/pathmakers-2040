// RedNote (Xiaohongshu) concept video, 1080x1440 portrait. One entry per shot; promo/rednote/render.js plays each
// shot's game state at phone size, overlays the Chinese caption, and cuts it to the length of its voice line.
// vo: the narrator line, also the subtitle. place: the small location chip. setup(): runs inside the game page.
// big: optional HTML for a large on-screen card. hide: extra CSS selectors to hide (English UI text).
// every(ms, fn): optional, runs fn every ms while the shot records (to change plans on the Future Table, etc.).
module.exports = [
  // 1. The question, over quick cuts across very different places.
  {id: 'hook', place: '', min: 6.2, hook: true,
    vo: '很多AI研究者认为，十几年内AI可能会超过所有人类专家。那孩子现在该学什么？',
    big: `<div class="pr-hook"><b>AI 超过人类专家之后</b><b class="q">孩子该学什么？</b></div>`,
    cycle: [900, `screen('promo', scene('moon'))`, `screen('promo', scene('shenzhen'))`, `startMission('calf','calf_tundra')`, `screen('promo', scene('ocean_dc'))`,
      `screen('promo', scene('mars_storm'))`, `screen('promo', scene('shanghai'))`, `screen('promo', scene('vienna_market'))`, `screen('promo', scene('beijing'))`,
      `screen('promo', scene('mars_dusk'))`, `startMission('maya','arrive')`],
    hide: ['.caption-card', '.wm-next', '.wm-news', '.cm-hud', '.wm-pop', '.ft-head p', '.fut figcaption', '.ft-foot', '.calf-pj', '#pj']},
  // 2. Who wrote the scenario, over the world map.
  {id: 'source', place: 'AI 2040: Plan A', min: 8,
    vo: 'AI Futures Project 是一个做AI预测的研究团队。他们设想过一个比较好的2040年：各国约定先把AI停在专家水平，确认安全了再继续。',
    big: `<div class="pr-src"><b>AI 2040: Plan A</b><span>AI Futures Project 的设想</span></div>`,
    setup: `S.playAll=true;go('hub')`, hide: ['.wm-next', '.wm-news', '.cm-hud', '.wm-pop']},
  // 3. AI does the work (Byte's memo scrolls past), people sign.
  {id: 'bench', place: '工作台 · AI写的备忘录', min: 5,
    vo: '在那个世界里，AI做大部分工作，但重要的决定还是由人来签字。',
    setup: `startMission('maya','workbench')`,
    taps: [[250, `prFlick(560, 650)`], [1500, `prFlick(700, 760)`], [2900, `prFlick(520, 600)`], [3900, `prFlick(760, 800)`]], hide: ['.tabs', '.doc-tools', '.bench-foot', '#next', '.companion']},
  // 4. The game.
  {id: 'game', place: '用 Claude 连夜做的小游戏', min: 4.5,
    vo: '于是我用 Claude 连夜做了个小游戏，让孩子提前练练怎么做决定、签字负责。',
    setup: `screen('title-promo', scene('home')+'<div class="pr-byte">'+byteBox({...S.byte,mood:'happy'},'dance')+'</div>')`},
  // 5. The places.
  {id: 'places', place: '', min: 5.5,
    vo: '孩子和AI小狗搭档，去2040年的医院、阿拉斯加保护区、深圳工厂和月球上班。',
    setup: `screen('promo', scene('hospital'))`,
    cycle: [1000, `screen('promo', scene('hospital'))`, `screen('promo', scene('nome_reserve'))`, `screen('promo', scene('shenzhen'))`, `screen('promo', scene('moon'))`,
      `screen('promo', scene('shanghai'))`, `screen('promo', scene('mars_dusk'))`]},
  // 6. The family allergy the AI didn't know.
  {id: 'local', place: '病房 · AI不知道的事', min: 5.5,
    vo: '当医生那天，孩子发现了AI不知道的家族过敏史，风险从5%变成60%。',
    big: `<div class="pr-num"><span>过敏风险</span><b class="pr-from">5%</b><i>→</i><b class="pr-to">60%</b></div>`,
    setup: `startMission('maya','maya')`},
  // 7. Other days, four quick action shots.
  {id: 'build', place: '凤凰城 · 机器人工地', min: 3.2,
    vo: '别的日子里，要给机器人定规则，',
    setup: `startMission('lot','build')`, hide: ['.lot-tl-h', '.lot-tl-log', '.lot-tl p', '.btn', '.ft-foot', '.mini-btn']},
  {id: 'audit', place: '维也纳 · 审计购物AI', min: 3,
    vo: '查购物AI有没有偷偷帮商家，',
    setup: `startMission('shop','market')`},
  {id: 'listen', place: '华盛顿 · 国会', min: 2.8,
    vo: '去国会争取投票，',
    setup: `startMission('bill','hearing')`},
  {id: 'risk', place: '瓦罗市 · 每三天翻一倍', min: 4.2,
    vo: '看病毒每三天翻倍会多快失控。',
    setup: `startMission('quietyear','qy_double');qyState().dbl={day:0,guess:null,phase:'guess'};qyDouble()`,
    taps: [[500, `prTap('.qyd-opts .choice','1,000')`]],
    every: [300, `const r=document.querySelector('#qyd-day');if(r&&+r.value<30){r.value=+r.value+3;r.oninput()}`],
    hide: ['.ft-head p', '#qyd-next', '.qyd-ticks']},
  // 8. Consent and signing.
  {id: 'consent', place: '讲清楚 · 征得同意 · 签名', min: 4.5,
    vo: '每天最后，都要跟当事人讲清楚，征得同意，再签名。',
    setup: `startMission('maya','consent')`, hide: ['.choices', '.planpick', '.tiny']},
  // 9. The vote, over the end card.
  {id: 'end', place: '', min: 7, tail: 1.6,
    vo: '按那份设想，2040年前后全世界要投票决定AI要不要继续变强。到时候投票的，就是今天的孩子。',
    big: `<div class="pr-end"><h1>Pathmakers <span>2040</span></h1></div>`,
    setup: `screen('title-promo', scene('home')+'<div class="pr-byte low">'+byteBox({...S.byte,mood:'happy'},'dance')+'</div>')`}
];
