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
  cast:{owen:{name:'Dr. Owen Hale',role:'Care Doctor, Boston Harbor Hospital',skin:SKIN[1],hair:'#1a1416',hairStyle:'short',shirt:'#5b9bf0',coat:true,masc:true}},
  voices:{owen:'am_eric'},
  glossary:{'grand rounds':'A meeting where a doctor tells other doctors about a real case, so everyone learns from it.',
    accountable:'Responsible for a decision, so you have to explain it and answer for how it turns out.'},
  guide:{'accountability':{title:'Who answers for it?',track:'Government, law, and power',
    text:'An expert AI can know the facts better than anyone. A person still signs, because someone has to explain the choice to the family and answer for it if it goes wrong. That person is accountable.',
    real:'True today: doctors, engineers and judges sign their names to decisions, and they can be asked to explain them later.'}},
  bigtalk:{guide:'accountability',
    prep:{scene:['workbench','hospital'],place:'Backstage · Grand Rounds',
      intro:GR_B('[[Grand rounds]] starts in ten minutes! The whole hospital comes to hear one doctor talk about one real case. Today, that’s you.'),
      pick:GR_B('Which case from your Portfolio Book will you tell them about?'),
      retry:GR_B('Want to try that part another way?'),
      ready:GR_B('Three slides, one story. Breathe in, smile, and talk to them like friends. You’ve got this!')},
    stage:{scene:'hospital',place:'Grand Rounds · Boston Harbor Hospital',title:'Grand Rounds',
      intro:GR_I('Good morning, everyone. Our newest Care Doctor will present a case. Please welcome our Trainee!')},
    beats:[
      {key:'story',label:'The story',ask:GR_B('How will you start? People remember a person better than a number.'),
        opts:[{t:c=>c.story,good:true,tip:GR_B('Great opener! A real person in one sentence, and everyone wants to know what happens next.')},
          {t:'Today I’ll show you forty slides of numbers. Please hold your questions.',tip:GR_B('Forty slides? I can hear the yawns already. Start with the person instead.')},
          {t:'I want to start by telling you how good I was.',tip:GR_B('Hmm. A talk about yourself is hard to love. Start with your patient.')}]},
      {key:'decision',label:'The decision',ask:GR_B('Now the choice. What will you say about what you decided?'),
        opts:[{t:c=>c.memo?`We chose ${c.plan||'a plan together'}. Here’s what I signed: “${c.memo}”`:`We chose ${c.plan||'a plan together'}, and I said how sure I was.`,good:true,
            tip:GR_B('Reading what you signed is brave. It shows your reasons and how sure you were.')},
          {t:'We picked the best option. Trust me on that.',tip:GR_B('“Trust me” doesn’t teach anyone anything. Say what you chose and why.')},
          {t:c=>`${c.byte} told me what to do, so I did it.`,tip:GR_B('That’s not even true! I gave you forecasts. You made the call. Say why you made it.')}]},
      {key:'thanks',label:'What I learned',ask:GR_B('Last part: what did you learn, and who helped?'),
        opts:[{t:c=>`${c.lesson} ${c.thanks}`,good:true,tip:GR_B('Honest and kind. Thanking the people who helped is how teams stay strong.')},
          {t:'Everything went perfectly. I wouldn’t change a thing.',tip:GR_B('Every case teaches something. Saying what you learned makes your talk useful to everyone.')},
          {t:'Halo did most of the work, so any mistakes are Halo’s.',tip:GR_B('Careful. You signed it, so it’s yours. Say what you learned and thank the people who helped.')}]}],
    question:{q:GR_T('Halo can read every chart in this hospital in a second. Why does a human doctor need to sign at all?'),
      judge:'You are Dr. Owen Hale, a friendly Care Doctor at Boston Harbor Hospital in a kids’ game set in 2040. You trust the hospital AI a lot. You asked a young doctor at Grand Rounds why a human doctor needs to sign at all.',
      check:'explains that the choice belongs to the family, that someone must be accountable for it, or that people notice things the AI was never told',
      heur:/family|choice|consent|sign|responsib|accountab|answer for|listen|clue|rash|hides|told me|ask|explain|trust|check/,
      opts:[{t:c=>`Halo is great with facts. But ${c.clue} came from talking with the family, and the choice is theirs. A person listens, explains the odds honestly, and signs, so someone answers for it.`,good:true,
          reply:GR_T('Huh. I trust Halo a lot. Maybe too much. I’ll think about that next time I sign something.')},
        {t:'Because humans are smarter than AIs.',reply:GR_T('Are we? Halo beats me at chess and at reading charts. There has to be a better reason.')},
        {t:'Good point. Maybe we should let Halo sign.',reply:GR_T('Hmm. Then who answers to the family when something goes wrong?')}],
      free:[GR_T('Huh. That’s a good answer. I’ll think about it next time I sign something.'),GR_T('Maybe. But I still think Halo could just do it. Who answers to the family, though?')]},
    applause:[{if:'strong',who:'imani',text:'That’s what Grand Rounds is for: a real case, told honestly, with credit to the people who helped. Thank you, Doctor.'},
      GR_I('Thank you, Doctor. Every case teaches us something, and you brought us a real one.')],
    cases:{
      maya:{title:'Maya’s wrist',who:'maya',story:'Maya is 11. She broke her wrist nine days before her violin recital.',clue:'Maya’s old rash',
        lesson:'What I learned: records can miss things, so I always ask families about past reactions.',thanks:'Thank you to Maya and her dad, who told me about the rash.'},
      hired:{title:'Ari’s ankle',who:'ari',story:'Ari is 10, and he’s the best goalkeeper on his team. He sprained his ankle four days before a game.',clue:'the fact that Ari hides his pain',
        lesson:'What I learned: Ari hides pain, so a plan where he stops playing when it hurts would not have kept him safe.',thanks:'Thank you to Ari’s grandma, who told me he hides pain.'}},
    fallback:{title:'A case',story:'This is a real case from my first season.',clue:'the most important clue',
      lesson:'What I learned: asking what matters to people before looking at the options changes which plan is best.',thanks:'Thank you to the family, who trusted me with their choice.'}},
  promotion:{career:'doctor',to:'pro',scene:'hospital',place:'Boston Harbor Hospital',bonus:50,badge:{org:'Boston Harbor Hospital',title:'Care Doctor'},
    line:GR_I('I’ve watched you listen, explain and sign with care. Congratulations, Doctor. You’re a Pro now.'),
    byte:GR_B('A Pro! I’m doing my happy spin. Can you tell?'),
    unlocks:['Harder cases, with more people to listen to','Bigger hospital systems to oversee','Trips to sister hospitals, like Shanghai']},
  brief(){return 'Right now the player is preparing and giving Grand Rounds, the hospital’s weekly talk where one doctor presents one real case. The talk has three parts: the patient’s story in one sentence, the decision with the reasons and how sure they were, and what they learned with thanks to the people who helped. Then Dr. Owen Hale, a colleague who trusts the hospital AI a lot, asks why a human doctor needs to sign at all. Good answers: the choice belongs to the family; someone must be accountable and answer for it; people notice things the AI was never told. Help them prepare, but do not write the talk for them.'},
  canned(q){if(/talk|grand rounds|present|nervous|scared/.test(q))return 'Start with the person, then say what you chose and why, then what you learned and who helped. Three parts. You can do it!';
    if(/owen|hale|sign|why human|accountab/.test(q))return 'The family decides, and someone has to answer for the choice. People also notice things the AI was never told. That’s why a doctor signs.';return null}
};
