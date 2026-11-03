// grandrounds.js — the Care Doctor's big talk and promotion to Pro (spec: Core loop → Career journey, steps 7 and 8).
// Grand Rounds is the hospital's weekly talk where one doctor presents one real case to everyone. The player builds a
// three-part talk with Byte about a case from their Portfolio Book (Maya's wrist, Ari's ankle, or any later Care Doctor
// case), gives it to a crowd, and answers one tough question from Dr. Owen Hale, a colleague who trusts his AI without
// checking. Then Dr. Reyes promotes the player to Pro. The screens are the generic ones in src/career.js (talkprep,
// bigtalk, promotion). It unlocks after every Trainee workday of the Care Doctor career (src/campaign.js, bigTalkNeeds).
// Stars: Ask for a clear story and decision, Decision for the answer to the tough question, Heart for thanking the people who helped.

const GR_B=t=>({who:'byte',text:t}),GR_T=t=>({who:'owen',text:t}),GR_I=t=>({who:'imani',text:t});
MISSIONS.grandrounds={id:'grandrounds',title:'Grand Rounds',career:'doctor',day:9,dayLabel:'Big talk',kind:'bigtalk',promotes:'pro',rank:'trainee',district:'boston',year:1,
  blurb:'Tell the whole hospital about one of your cases, and answer one tough question.',after:['hired'],place:'Boston Harbor Hospital',
  flow:[{name:'g-prep',k:'talkprep',music:'work'},{name:'g-stage',k:'bigtalk',music:'hospital'},{name:'g-promo',k:'promotion',music:'win'}],
  cast:{owen:{name:'Dr. Owen Hale',role:'Care Doctor, Boston Harbor Hospital',nose:'button',eyeShape:'round',face:'oval',skin:SKIN[1],hair:'#6b4428',hairStyle:'pixie',shirt:'#5b9bf0',coat:true,masc:true}},
  voices:{owen:'am_eric'},
  glossary:{'grand rounds':'A meeting where a doctor tells other doctors about a real case, so everyone learns from it.',
    accountable:'Responsible for a decision, so you have to explain it and answer for how it turns out.'},
  guide:{'accountability':{title:'Who answers for it?',track:'Government, law, and power',
    text:'An expert AI can know the facts better than anyone. A person still signs, because someone has to explain the choice to the family and answer for it if it goes wrong. That person is accountable.',
    real:'True today: doctors, engineers and judges sign their names to decisions, and they can be asked to explain them later.'}},
  bigtalk:{guide:'accountability',
    prep:{scene:['workbench','hospital'],place:'Backstage · Grand Rounds',
      intro:GR_B('[[Grand rounds]] starts in ten minutes! It’s a meeting where people from the whole hospital come to hear one doctor talk about one real case, and today you are that doctor.'),
      pick:GR_B('Which case from your Portfolio Book will you tell them about?'),
      retry:GR_B('Do you want to try that part of your talk a different way?'),
      ready:GR_B('Your talk is ready: three slides that tell the story of one case. Take a deep breath, smile, and talk to the audience the way you would talk to friends. You can do this!')},
    stage:{scene:'hospital',place:'Grand Rounds · Boston Harbor Hospital',title:'Grand Rounds',
      intro:GR_I('Good morning, everyone. Our newest Care Doctor, who is still a trainee, will present a case today. Please give them a warm welcome!')},
    beats:[
      {key:'story',label:'The story',ask:GR_B('How will you start your talk? Audiences remember a story about a person better than a list of numbers.'),
        opts:[{t:c=>c.story,good:true,tip:GR_B('Great start! You introduced a real patient in one sentence, so the audience will want to hear what happened to them.')},
          {t:'Today I’ll show you forty slides of numbers about bones and healing times. Please hold all your questions until the very end.',tip:GR_B('Forty slides of numbers would put the audience to sleep. Start by telling them about your patient instead.')},
          {t:'I’d like to start by telling you how hard I worked on this case and how well I did.',tip:GR_B('Hmm. The audience came to learn about a patient’s case, not about how hard you worked. Start with your patient.')}]},
      {key:'decision',label:'The decision',ask:GR_B('Next comes the decision. What will you say about the plan you chose?'),
        opts:[{t:c=>c.memo?`We chose ${c.plan||'a plan together'}. Here’s what I signed: “${c.memo}”`:`We chose ${c.plan||'a plan together'}, and I said how sure I was.`,good:true,
            tip:GR_B('Reading out the decision you signed takes courage, and it shows the audience your reasons and how sure you were.')},
          {t:'We picked the best option for the family. You can trust me on that, because I checked everything carefully.',tip:GR_B('If you just ask people to trust you, they can’t learn anything from your case. Tell them what you chose and why.')},
          {t:c=>`${c.byte} told me which plan was best, so I went with that. It knows far more than I do.`,tip:GR_B('That’s not what happened! I gave you forecasts, and you made the decision yourself. Tell them why you chose that plan.')}]},
      {key:'thanks',label:'What I learned',ask:GR_B('For the last part, say what you learned from the case and who helped you.'),
        opts:[{t:c=>`${c.lesson} ${c.thanks}`,good:true,tip:GR_B('That was honest and kind. When you thank the people who helped you, they are glad to help again next time.')},
          {t:'Honestly, everything went perfectly from start to finish, so there isn’t much I would change.',tip:GR_B('Even a case that goes well teaches you something. When you say what you learned, the other doctors can learn it too.')},
          {t:'Halo did most of the work on this case, so if anything went wrong, that was really Halo’s part.',tip:GR_B('Careful. You signed the decision, so you are responsible for it, not Halo. Say what you learned and thank the people who helped.')}]}],
    question:{q:GR_T('Halo can read every chart in this hospital in a second. Why does a human doctor need to sign at all?'),
      judge:'You are Dr. Owen Hale, a friendly Care Doctor at Boston Harbor Hospital in a kids’ game set in 2040. You trust the hospital AI a lot. You asked a young doctor at Grand Rounds why a human doctor needs to sign at all.',
      check:'explains that the choice belongs to the family, that someone must be accountable for it, or that people notice things the AI was never told',
      heur:/family|choice|consent|sign|responsib|accountab|answer for|listen|clue|rash|hides|told me|ask|explain|trust|check/,
      opts:[{t:c=>`Halo knows the facts better than I do. But I only learned about ${c.clue} by talking with the family, and the choice belongs to them. Someone has to sit with them, explain the odds honestly, and then answer for the decision. That’s why a doctor signs.`,good:true,
          reply:GR_T('Huh. I trust Halo a lot, maybe too much. I’ll think about what you said the next time I sign a decision.')},
        {t:'Because people are still smarter than AIs, and a computer could make a mistake that a human doctor would never make.',reply:GR_T('Are people really smarter? Halo beats me at chess and at reading charts, so there has to be a better reason.')},
        {t:'You’re right, honestly. Halo knows more than any of us, so maybe it should just sign the decisions itself.',reply:GR_T('Hmm. But if Halo signs, who explains the choice to the family and answers to them when something goes wrong?')}],
      free:[GR_T('Huh. That’s a good answer. I’ll think about it the next time I sign a decision.'),GR_T('Maybe. But I still think Halo could sign decisions by itself. If it did, who would answer to the family when something went wrong?')]},
    applause:[{if:'strong',who:'imani',text:'Thank you, Doctor. You told a real case honestly and thanked the people who helped, and that is exactly what Grand Rounds is for.'},
      GR_I('Thank you, Doctor. We can all learn something from a real case like yours.')],
    cases:{
      maya:{title:'Maya’s wrist',who:'maya',story:'Maya is 11. She broke her wrist nine days before her violin recital.',clue:'Maya’s old rash',
        lesson:'What I learned: records can miss things, so I always ask families about past reactions.',thanks:'Thank you to Maya and her dad, who told me about the rash.'},
      hired:{title:'Ari’s ankle',who:'ari',story:'Ari is 10, and he’s the best goalkeeper on his team. He sprained his ankle four days before a game.',clue:'the fact that Ari hides his pain',
        lesson:'What I learned: Ari hides pain, so a plan where he stops playing when it hurts would not have kept him safe.',thanks:'Thank you to Ari’s grandma, who told me he hides pain.'}},
    fallback:{title:'A case',story:'This is a real case from my first season.',clue:'the most important clue',
      lesson:'What I learned: asking what matters to people before looking at the options changes which plan is best.',thanks:'Thank you to the family, who trusted me with their choice.'}},
  promotion:{career:'doctor',to:'pro',scene:'hospital',place:'Boston Harbor Hospital',bonus:50,badge:{org:'Boston Harbor Hospital',title:'Care Doctor'},
    line:GR_I('I’ve watched you listen to families, explain the choices, and sign your decisions with care. Congratulations, Doctor. You’ve been promoted to Pro.'),
    byte:GR_B('A Pro! I’m doing my happy spin. Can you tell?'),
    unlocks:['Harder cases, with more people to listen to','Bigger hospital systems to watch over','Trips to sister hospitals, like Shanghai']},
  brief(){return 'Right now the player is preparing and giving Grand Rounds, the hospital’s weekly talk where one doctor presents one real case. The talk has three parts: the patient’s story in one sentence, the decision with the reasons and how sure they were, and what they learned with thanks to the people who helped. Then Dr. Owen Hale, a colleague who trusts the hospital AI a lot, asks why a human doctor needs to sign at all. Good answers: the choice belongs to the family; someone must be accountable and answer for it; people notice things the AI was never told. Help them prepare, but do not write the talk for them.'},
  canned(q){if(/talk|grand rounds|present|nervous|scared/.test(q))return 'Your talk has three parts. Start with the patient, then say what you chose and why, and then say what you learned and who helped. You can do it!';
    if(/owen|hale|sign|why human|accountab/.test(q))return 'A doctor signs because the family’s choice needs a person who explains it to them and answers for it if it goes wrong. People also notice things the AI was never told, like a rash that happened in another country.';return null}
};
