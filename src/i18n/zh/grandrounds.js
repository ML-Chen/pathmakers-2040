// Simplified Chinese for Grand Rounds (src/missions/grandrounds.js): the Care Doctor's big talk and promotion.
// Grand Rounds is called 病例分享会 in Chinese, since the event is a talk about one case for the whole hospital. Keys are the exact English text; see src/i18n.js.
I18N.add('zh','grandrounds',{strings:{
  'Grand Rounds':'病例分享会','Big talk':'演讲','Tell the whole hospital about one of your cases, and answer one tough question.':'给全院的人讲讲你的一个病例，再回答一个难题。',
  'Dr. Owen Hale':'欧文·黑尔医生','Care Doctor, Boston Harbor Hospital':'波士顿港医院照护医生',
  'Who answers for it?':'出了问题，谁来负责？','Government, law, and power':'政府、法律与权力',
  'An expert AI can know the facts better than anyone. A person still signs, because someone has to explain the choice to the family and answer for it if it goes wrong. That person is accountable.':
    '专家级的AI可能比谁都更了解事实。可签字的仍然是人，因为总得有人把这个选择给家人讲清楚，万一出了问题，也得有人站出来负责。签字的这个人就要承担责任。',
  'True today: doctors, engineers and judges sign their names to decisions, and they can be asked to explain them later.':'现实中也是这样：医生、工程师和法官都会在决定上签自己的名字，以后也可能被要求解释这些决定。',

  // ----- backstage: building the talk with Byte -----
  'Backstage · Grand Rounds':'后台 · 病例分享会',
  '[[Grand rounds]] starts in ten minutes! It’s a meeting where people from the whole hospital come to hear one doctor talk about one real case, and today you are that doctor.':
    '[[病例分享会]]还有十分钟就开始了！全院的人都会来听一位医生讲一个真实的病例，今天讲的人就是你。',
  'Which case from your Portfolio Book will you tell them about?':'你要讲作品集里的哪个病例？',
  'Maya’s wrist':'玛雅的手腕','Ari’s ankle':'阿里的脚踝','A case':'一个病例',
  'The story':'故事','The decision':'决定','What I learned':'我学到了什么',
  'How will you start your talk? Audiences remember a story about a person better than a list of numbers.':'你打算怎么开场？比起一串数字，听众更容易记住一个人的故事。',
  'Maya is 11. She broke her wrist nine days before her violin recital.':'玛雅11岁。离她的小提琴演出还有九天时，她摔断了手腕。',
  'Ari is 10, and he’s the best goalkeeper on his team. He sprained his ankle four days before a game.':'阿里10岁，是队里最好的守门员。离比赛还有四天时，他扭伤了脚踝。',
  'This is a real case from my first season.':'这是我上岗第一个季度遇到的一个真实病例。',
  'Great start! You introduced a real patient in one sentence, so the audience will want to hear what happened to them.':'开场真不错！你用一句话介绍了一个真实的病人，听众就会想知道后来发生了什么。',
  'Today I’ll show you forty slides of numbers about bones and healing times. Please hold all your questions until the very end.':'今天我要给大家看四十张幻灯片，全是关于骨头和愈合时间的数字。请把所有问题都留到最后再问。',
  'Forty slides of numbers would put the audience to sleep. Start by telling them about your patient instead.':'四十张全是数字的幻灯片，会让听众睡着的。还是先讲讲你的病人吧。',
  'I’d like to start by telling you how hard I worked on this case and how well I did.':'我想先讲讲我在这个病例上有多努力、做得有多好。',
  'Hmm. The audience came to learn about a patient’s case, not about how hard you worked. Start with your patient.':'嗯。听众是来了解病人的病例的，不是来听你有多努力的。先讲你的病人吧。',
  'Next comes the decision. What will you say about the plan you chose?':'接下来讲决定。关于你选的方案，你打算怎么说？',
  'We chose {plan}. Here’s what I signed: “{memo}”':'我们选了{plan}。这是我签了字的那段话：“{memo}”','We chose {plan}, and I said how sure I was.':'我们选了{plan}，我也说了自己有多大把握。',
  'a plan together':'一个大家一起商量的方案',
  'Reading out the decision you signed takes courage, and it shows the audience your reasons and how sure you were.':'把你签过字的决定念出来需要勇气，这也让听众看到了你的理由，还有你当时有多大把握。',
  'We picked the best option for the family. You can trust me on that, because I checked everything carefully.':'我们为这家人选了最好的方案。这一点大家可以相信我，因为我什么都仔细检查过了。',
  'If you just ask people to trust you, they can’t learn anything from your case. Tell them what you chose and why.':'如果你只是让大家相信你，他们就没法从你的病例里学到东西。告诉他们你选了什么、为什么。',
  '{0} told me which plan was best, so I went with that. It knows far more than I do.':'{0}告诉我哪个方案最好，我就照着做了。它懂的比我多得多。',
  'That’s not what happened! I gave you forecasts, and you made the decision yourself. Tell them why you chose that plan.':'事情不是这样的！我给了你预测，决定是你自己做的。告诉他们你为什么选那个方案。',
  'For the last part, say what you learned from the case and who helped you.':'最后一部分，说说你从这个病例里学到了什么，还有谁帮了你。',
  '{lesson} {thanks}':'{lesson}{thanks}',
  'What I learned: records can miss things, so I always ask families about past reactions.':'我学到的是：病历也会漏掉东西，所以我总会问问家人，以前有没有过什么不良反应。',
  'Thank you to Maya and her dad, who told me about the rash.':'谢谢玛雅和她爸爸，是他们告诉了我起疹子的事。',
  'What I learned: Ari hides pain, so a plan where he stops playing when it hurts would not have kept him safe.':'我学到的是：阿里会忍着疼，所以“疼了就停”的方案保护不了他。',
  'Thank you to Ari’s grandma, who told me he hides pain.':'谢谢阿里的奶奶，是她告诉我阿里会忍着疼。',
  'What I learned: asking what matters to people before looking at the options changes which plan is best.':'我学到的是：先问清楚大家在乎什么，再去看各个方案，最好的方案可能就不一样了。',
  'Thank you to the family, who trusted me with their choice.':'谢谢这家人，他们放心地让我帮着做选择。',
  'That was honest and kind. When you thank the people who helped you, they are glad to help again next time.':'这话诚实又暖心。你谢谢帮过你的人，下次他们也会乐意再帮你。',
  'Honestly, everything went perfectly from start to finish, so there isn’t much I would change.':'说实话，从头到尾都很完美，所以没什么要改的。',
  'Even a case that goes well teaches you something. When you say what you learned, the other doctors can learn it too.':'就算病例很顺利，也能让你学到东西。你说出学到了什么，其他医生也能跟着学到。',
  'Halo did most of the work on this case, so if anything went wrong, that was really Halo’s part.':'这个病例大部分工作是Halo做的，所以要是哪里出了错，其实是Halo那部分的问题。',
  'Careful. You signed the decision, so you are responsible for it, not Halo. Say what you learned and thank the people who helped.':'小心。决定是你签的字，所以要由你负责，不是Halo。说说你学到了什么，再谢谢帮过你的人。',
  'Do you want to try that part of your talk a different way?':'这一部分要不要换个讲法再试试？',
  'Your talk is ready: three slides that tell the story of one case. Take a deep breath, smile, and talk to the audience the way you would talk to friends. You can do this!':
    '你的演讲准备好了：三张幻灯片，讲一个病例的故事。深吸一口气，笑一笑，像跟朋友聊天那样跟听众说话。你一定行！',

  // ----- on stage -----
  'Grand Rounds · Boston Harbor Hospital':'病例分享会 · 波士顿港医院',
  'Good morning, everyone. Our newest Care Doctor, who is still a trainee, will present a case today. Please give them a warm welcome!':'大家早上好。今天由我们最新来的照护医生给大家讲一个病例，这位医生还在见习期。请大家热烈欢迎！',
  'Halo can read every chart in this hospital in a second. Why does a human doctor need to sign at all?':'Halo一秒钟就能读完这家医院所有的病历。那为什么还非得要人类医生来签字呢？',
  'Maya’s old rash':'玛雅以前起过的疹子','the fact that Ari hides his pain':'阿里会忍着疼这件事','the most important clue':'最重要的那条线索',
  'Halo knows the facts better than I do. But I only learned about {0} by talking with the family, and the choice belongs to them. Someone has to sit with them, explain the odds honestly, and then answer for the decision. That’s why a doctor signs.':
    'Halo比我更了解事实。可是{0}，我是和家人聊天才知道的，而且这个选择是他们自己的。总得有人坐下来陪着他们，诚实地讲清楚可能性，然后为这个决定负责。所以要由医生来签字。',
  'Huh. I trust Halo a lot, maybe too much. I’ll think about what you said the next time I sign a decision.':'嗯。我很信任Halo，也许太信任了。下次签字的时候，我会想想你说的话。',
  'Because people are still smarter than AIs, and a computer could make a mistake that a human doctor would never make.':'因为人还是比AI聪明，电脑可能会犯人类医生永远不会犯的错。',
  'Are people really smarter? Halo beats me at chess and at reading charts, so there has to be a better reason.':'人真的更聪明吗？下棋和看病历，Halo都比我强。肯定还有更好的理由。',
  'You’re right, honestly. Halo knows more than any of us, so maybe it should just sign the decisions itself.':'说实话，你说得对。Halo比我们谁懂得都多，也许就该让它自己来签字。',
  'Hmm. But if Halo signs, who explains the choice to the family and answers to them when something goes wrong?':'嗯。可是如果让Halo签字，谁来给家人讲清楚这个选择？出了问题，谁去给家人一个交代？',
  'Huh. That’s a good answer. I’ll think about it the next time I sign a decision.':'嗯，这个回答很好。下次签字的时候，我会好好想想。',
  'Maybe. But I still think Halo could sign decisions by itself. If it did, who would answer to the family when something went wrong?':'也许吧。不过我还是觉得Halo可以自己签字。可要是那样，出了问题，谁去给家人一个交代呢？',
  'Thank you, Doctor. You told a real case honestly and thanked the people who helped, and that is exactly what Grand Rounds is for.':'谢谢你，医生。你诚实地讲了一个真实的病例，还感谢了帮过你的人。病例分享会就是为这个开的。',
  'Thank you, Doctor. We can all learn something from a real case like yours.':'谢谢你，医生。像你这样的真实病例，能让我们每个人都学到东西。',

  // ----- the promotion -----
  'I’ve watched you listen to families, explain the choices, and sign your decisions with care. Congratulations, Doctor. You’ve been promoted to Pro.':
    '我看着你认真听家人说话，把选择讲清楚，用心地在每个决定上签字。恭喜你，医生，你升为专业级了。',
  'A Pro! I’m doing my happy spin. Can you tell?':'专业级！我在开心地转圈圈呢，你看出来了吗？',
  'Harder cases, with more people to listen to':'更难的病例，要听更多人的意见','Bigger hospital systems to watch over':'要照看更大的医院系统','Trips to sister hospitals, like Shanghai':'去姐妹医院出差，比如上海',
  '{0}!':'{0}级！','Back to the map':'回到地图',

  // ----- chat fallback replies -----
  'Your talk has three parts. Start with the patient, then say what you chose and why, and then say what you learned and who helped. You can do it!':'你的演讲有三部分。先讲病人，再讲你选了什么、为什么，最后讲你学到了什么、谁帮了你。你一定行！',
  'A doctor signs because the family’s choice needs a person who explains it to them and answers for it if it goes wrong. People also notice things the AI was never told, like a rash that happened in another country.':
    '医生要签字，是因为家人的选择需要有一个人来给他们讲清楚，万一出了问题，也要有人负责。而且人能注意到AI从没被告知的事，比如在另一个国家起过的疹子。'
},
glossary:{
  'grand rounds':{w:'病例分享会',d:'医生给其他医生讲一个真实病例的会，让大家都能从中学到东西。'}
},
regex:{
  'family|choice|consent|sign|responsib|accountab|answer for|listen|clue|rash|hides|told me|ask|explain|trust|check':'家人|家属|选择|同意|签|负责|担责|责任|交代|听|线索|疹|忍|告诉|问|解释|信任|核查|检查',
  'talk|grand rounds|present|nervous|scared':'演讲|讲|分享会|紧张|害怕',
  'owen|hale|sign|why human|accountab':'欧文|黑尔|签字|签|为什么要人|负责'
}});
