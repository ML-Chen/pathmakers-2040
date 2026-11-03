// Simplified Chinese for "Who Can Stop a Crew?" (robotfactory, Shenzhen). Keys are the exact English text; see src/i18n.js.
// The English teaches a few Mandarin words (nǐ hǎo, xièxie, tíng). In Chinese those are just said, with no tap definition.
// Names: 林晓梅 (test engineer), 黄建国 (floor supervisor, called 黄师傅), 唐一帆 (zone monitor).
I18N.add('zh','robotfactory',{strings:{
  'Who Can Stop a Crew?':'谁能叫停机器人队？',
  'You fly to the factory in Shenzhen that built your robot crew. You test every way of stopping a crew, and then you write the rules for who may stop one and start it again.':
    '你飞到深圳，来到造出你那支机器人队的工厂。你要把让机器人队停下的每种办法都试一遍，再定下规则：谁可以让它停下，谁可以让它重新开工。',
  'Zone 3 · Shenzhen':'3号区 · 深圳','Zone 3 test yard · 9:00 AM':'3号区测试场 · 上午9:00','Zone 3 test yard · Shenzhen':'3号区测试场 · 深圳',
  'Zone 3 test yard · 11:30 AM':'3号区测试场 · 上午11:30','Zone 3 · Shenzhen · 6:40 PM':'3号区 · 深圳 · 傍晚6:40',
  'Zone 3 test yard · Stop drill':'3号区测试场 · 停机演练','Zone 3 test yard · Rule card':'3号区测试场 · 规则卡',
  'Zone 3 test yard · 4:00 PM':'3号区测试场 · 下午4:00','Debrief · Shenzhen':'总结 · 深圳',
  // the props in the Shenzhen scene (their ids are read out as labels)
  'sz_stop':'急停柱','sz_bot':'小机器人',

  // cast
  'Lin Xiaomei':'林晓梅','Test engineer, Zone 3 robot factory':'3号区机器人工厂测试工程师',
  'Huang Jianguo':'黄建国','Floor supervisor, 43 years at the factory':'车间主管，在厂里干了43年',
  'Tang Yifan':'唐一帆','Zone monitor, Shenzhen Special Economic Zone':'深圳经济特区区域监察员',

  // Field Guide
  'Who may stop a crew, and who may start it again':'谁可以叫停机器人队，谁可以让它重新开工','Engineering and systems':'工程与系统',
  'If someone stops a machine by mistake, the only cost is a short delay, so anybody who sees danger should be able to stop it. Starting the machine again is riskier, because if the problem has not been fixed, someone could get hurt. So only the person who is responsible for the machine should be able to restart it, using a code that proves who they are. If someone far away stops the machine, the people on site should always be told.':
    '要是有人误把机器停了，损失的只是一小会儿时间，所以谁看到危险，都应该能让机器停下。让机器重新开动风险更大，因为问题要是还没解决，就可能有人受伤。所以只有负责这台机器的人才能让它重新开动，还要用一个能证明自己身份的密码。如果有人在远处让机器停了，一定要告诉现场的人。',
  'True today: factory robots have emergency stop buttons that any worker may press, and many car factories let any worker pull an andon cord to stop the line. Restarting takes a trained person. Robot crews that build whole schools are a guess about 2040.':
    '现实中：工厂里的机器人都有急停按钮，任何工人都可以按。很多汽车厂允许任何工人拉安灯绳，让生产线停下。重新开动要由受过培训的人来做。能盖起整所学校的机器人施工队，是对2040年的猜想。',
  'Special Economic Zones':'经济特区','Government, law, and power':'政府、法律与权力',
  'In 2040, heavy robot industry is kept inside special zones like this one, and each zone has a strict limit on how many robots may work there. Keeping the robot factories and mines inside the zones lets the land outside them stay quiet and green. Zone monitors check the robot numbers every day.':
    '在2040年，用机器人的重工业都集中在像这样的特区里，每个区能用多少台机器人，都有严格的上限。机器人工厂和矿场都放在特区里，特区外面的地方就能保持安静，到处绿油油的。区域监察员每天都要核对机器人的数量。',
  'True today: in 1980, Shenzhen, then a small town, became one of China’s first Special Economic Zones. It is now a city of more than 17 million people. Robot permit caps are a guess about 2040.':
    '现实中：深圳是1980年设立的第一批经济特区之一，那时它还是个小镇，现在已经是一座有一千七百多万人的城市。机器人许可上限是对2040年的猜想。',

  // passers-by
  'I’m the only person on this shift. Me and eleven thousand robots.':'这一班就我一个人，再加一万一千台机器人。',
  'That mine used to be a hill. They will fill it back in when the zone is allowed fewer robots.':'那个矿坑原来是座小山。等这个区的机器人名额减下来，他们会把它填回去。',
  'My father fished in this bay when Shenzhen was a village.':'深圳还是个小渔村的时候，我爸就在这片海湾打鱼。',
  'Lunch is in the tower. The noodles are made by a person, which is why they’re good.':'午饭在塔楼里吃。面条是人亲手做的，所以好吃。',
  'The number on the permit board goes up each time a new crew is built, and down each time an old crew is recycled.':'每造出一支新队，许可牌上的数字就往上跳；每回收一支旧队，数字就往下降。',

  // arrive
  'Welcome to Shenzhen! We’re in Zone 3, part of the city’s [[Special Economic Zone]]. Almost everything you can see here is run by robots.':
    '欢迎来到深圳！咱们在[[经济特区]]的3号区。你在这儿看到的东西，几乎全是机器人在运转。',
  'The robot crews that build schools back in Phoenix were made in that factory. Every robot working here needs a [[permit]], and that board shows how close the zone is to its [[permit cap]].':
    '在凤凰城盖学校的那些机器人施工队，就是那座工厂造的。在这里干活的每台机器人都要有[[许可证]]，那块牌子显示这个区离[[许可上限]]还差多少。',
  'Why are we here?':'我们来这儿干什么？',
  'The factory asked an American crew lead to help them answer one question. Who is allowed to stop a robot crew, and how do you know the stop really works? You’ll test all three ways of stopping a crew, and then write the rules the crews follow.':
    '工厂请一位美国队长来帮他们回答一个问题：谁可以让机器人队停下？怎么知道停机真的管用？你要把三种停机办法都试一遍，然后写下机器人队要遵守的规则。',
  'Where are all the people?':'人都去哪儿了？',
  'There are about forty people in this whole zone today. Most of them are engineers, inspectors and monitors, and the robots do everything else.':
    '今天整个区里大约只有四十个人，大多是工程师、检查员和监察员。别的活儿全是机器人干。',
  '[[Nǐ hǎo]]! You must be the crew lead from Phoenix. I’m Lin Xiaomei. I test the crews before they ship.':
    '你好！你就是凤凰城来的队长吧？我叫林晓梅，机器人队出厂前都是我来测试。',
  'Your crew is the one that finished the school three days early, isn’t it? I tested that crew myself last spring. It’s a good one, and perhaps a little proud of itself.':
    '提前三天盖完学校的就是你那支队吧？去年春天是我亲手测的。那支队不错，可能还有点小骄傲呢。',
  'Xièxie for testing it so carefully.':'谢谢你测得这么仔细。',
  'You’re welcome! Today we are testing whether the crew stops quickly and safely when someone tells it to. That matters even more than how well it builds.':
    '不客气！今天我们要测的是，有人叫它停的时候，它能不能停得又快又安全。这比它活儿干得好不好还要紧。',
  'It finished early, so it’s probably fine.':'它都提前完工了，应该没问题吧。',
  'Probably. But today we are here to check with real tests whether it stops safely, instead of guessing.':'可能吧。不过咱们今天来，就是要做真正的测试，看看它能不能安全地停下。',

  // huang
  'I’m Huang Jianguo, and I run this floor. I started here at eighteen, putting phones together by hand. My father fished in that bay before there was any city here at all.':
    '我叫黄建国，这个车间归我管。我十八岁进厂，那时候是手工装手机。我爸在那片海湾打鱼的时候，这里还根本没有城市呢。',
  'In forty-three years, one rule has never changed on my floor. Anybody who sees a problem can stop the line. The newest worker, the oldest worker, even a visitor.':
    '四十三年了，我这个车间有一条规矩从来没变过：谁看见问题，谁都可以把线停下。新来的工人可以，老工人可以，来参观的人也可以。',
  'Even a visitor like me?':'连我这样来参观的也可以？',
  'Even you. If you see something wrong, you stop the line, and then we talk about it. Stopping the line costs us a few minutes, but fixing a broken crew can take weeks.':
    '你也可以。看见不对劲，你就停线，然后咱们再商量。停一次线只耽误几分钟，可修好一支坏掉的机器人队，可能要好几个星期。',
  'Doesn’t that waste a lot of time?':'那不是很浪费时间吗？',
  'Less than you would think. People here only stop the line when they think something is wrong. When they turn out to be right, the stop can save us weeks of repairs.':
    '没你想的那么多。这里的人只有觉得哪里不对才会停线。要是他们没看错，停这一下能给我们省下好几个星期的修理。',
  'So here is today’s [[stop drill]]. This test crew is stacking bricks, and there are three different ways to stop it. Try each one, and we’ll time how long it takes.':
    '好，今天的[[停机演练]]是这样的：这支测试队正在码砖，有三种不同的办法能让它停下。每种都试一下，我们来计时。',
  'I’ll write down every run. Watch what each robot actually does, not only how fast the crew stops.':'每一次我都会记下来。你要看每台机器人到底做了什么，别光看整队停得多快。',

  // the stop drill
  'Stop drill':'停机演练','Talk to the zone monitor':'去找区域监察员','Crew working':'机器人队在干活','0.0 s':'0.0秒','{0} s':'{0}秒',
  'Say “Tíng!”':'喊一声“停！”','Anyone nearby':'旁边的任何人','0.8 s':'0.8秒','4 of 4 paused':'4台全部暂停',
  'All four robots froze. Bot 4 put its beam down before it froze, which took three extra seconds, and the crew is built to do that so the beam does not fall. But the crew will start again by itself in thirty seconds unless somebody tells it to stay stopped.':
    '四台机器人都定住了。4号先把横梁放下才定住，多花了三秒。机器人队本来就是这么设计的，这样横梁不会掉下来。不过，要是没人叫它一直停着，三十秒后它会自己重新开工。',
  'Press the red pedestal':'按下红色急停柱','Anyone on site':'现场的任何人','0.3 s':'0.3秒','4 of 4, motors off':'4台全部断电',
  'The motors went off in a third of a second, and they stay off. Starting the crew again needs the crew lead’s signed code, so this is a full stop that nobody else can undo.':
    '电机三分之一秒就断了电，而且一直断着。要让机器人队重新开工，得有队长的签名码，所以这是一次彻底的停机，别人谁都解除不了。',
  'Remote stop from the tower':'控制塔远程停机','The factory':'工厂','1.2 s':'1.2秒','4 of 4 here, plus 212 crews worldwide':'这里4台，外加全世界212支队',
  'Whoa. The tower stopped our crew from far away, and it could stop all 212 crews this factory has built, including yours in Phoenix. It can start them again too, and the crew lead is never told either way.':
    '哇。控制塔从老远就让咱们的机器人队停下了。这家工厂造过的212支队，它全都能叫停，凤凰城你那支也算在内。它还能让它们重新开工，而且不管是停还是开，队长都收不到通知。',
  'Pick one of the three ways to stop the crew, and I’ll time how long it takes.':'三种停机办法，挑一种试试，我来计时。',
  'You’ve tried all three now. The remote stop is the one we need to talk about, because it reaches every crew this factory has built.':
    '三种你都试过了。远程停机得好好谈一谈，因为这家工厂造过的每一支队，它都管得到。',

  // tang
  'Hi! Tang Yifan, [[zone monitor]]. I make sure Zone 3 stays under its cap. Today it’s at 41,860 robots, out of 42,000.':
    '你好！我是唐一帆，[[区域监察员]]。我负责让3号区不超过上限。今天这里有41,860台机器人，上限是42,000台。',
  'I watched your remote-stop test from the tower. That is the button I care about most, because if a crew anywhere goes over its permit, I want it stopped quickly.':
    '你做远程停机测试的时候，我在控制塔上看着。我最在意的就是那个按钮，因为不管哪里的机器人队超出了许可，我都希望能马上让它停下。',
  'But your test also showed something else. The tower can start those crews up again from right here, without asking anybody in Phoenix. I don’t like that, and I am the person who would be pressing the button.':
    '可是你的测试还暴露了另一件事：控制塔在这儿就能让那些机器人队重新开工，不用问凤凰城的任何人。我不喜欢这样，何况按那个按钮的人就是我。',
  'So the people on site wouldn’t even know?':'那现场的人连知道都不知道？',
  'Not unless somebody tells them. That is why I asked the factory to bring a crew lead out here. You get to help decide what goes on the crews’ new rule card.':
    '除非有人告诉他们。所以我才请工厂把一位队长请过来。机器人队的新规则卡上写什么，你也能一起来定。',
  'If the factory built them, shouldn’t it control them?':'机器人是工厂造的，不就该由工厂来管吗？',
  'The factory built them, yes. But the people of Phoenix live and work right beside those robots. The crew lead on site should know what is happening to their own crew.':
    '是工厂造的，没错。可是凤凰城的人就在那些机器人旁边生活、干活。现场的队长应该知道自己的队出了什么事。',
  'Every crew carries a rule card that says who may pause it, stop it and start it again. Today we write a new card, and tonight every crew this factory has ever built will get it. So choose carefully.':
    '每支机器人队都带着一张规则卡，上面写着谁可以让它暂停、停机和重新开工。今天我们写一张新卡，今晚这家工厂造过的每一支队都会收到。所以要好好选。',

  // the rule card
  'Crew rule card':'机器人队规则卡','All 212 crews · version 7':'全部212支队 · 第7版','Sign the card':'签署规则卡',
  'Who may pause a crew?':'谁可以让机器人队暂停？','Anyone on the site':'现场的任何人','Only the crew lead':'只有队长',
  'Who may fully stop a crew?':'谁可以让机器人队彻底停机？','Anyone on the site, with the red pedestal':'现场的任何人，用红色急停柱','Only the crew lead, with a code':'只有队长，要用密码',
  'Who may restart it after a full stop?':'彻底停机后，谁可以让它重新开工？','The crew lead, with a signed code':'队长，用签名码','The factory, from the tower':'工厂，从控制塔',
  'What may the factory do from far away?':'工厂在远处可以做什么？','Stop a crew, and tell the crew lead at once':'让机器人队停下，并马上通知队长',
  'Nothing at all, ever':'什么都不能做','Stop or restart any crew it built':'让它造的任何一支队停下或重新开工',
  'Stopping a crew costs only a short delay, so the site is safer when everyone there can do it. A restart could hurt someone if something is still wrong, so I would let only the crew lead do that.':
    '让机器人队停下，只会耽误一小会儿，所以现场的人谁都能叫停，工地就更安全。可要是问题还在就重新开工，可能会有人受伤，所以我只会让队长来做这件事。',
  'Anyone on the site may pause a crew.':'现场的任何人都可以让机器人队暂停。','Only the crew lead may pause a crew.':'只有队长可以让机器人队暂停。',
  'Anyone on the site may fully stop a crew with the red pedestal.':'现场的任何人都可以用红色急停柱让机器人队彻底停机。',
  'Only the crew lead may fully stop a crew, using a code.':'只有队长可以用密码让机器人队彻底停机。',
  'Only the crew lead may start it again, with a signed code.':'只有队长可以用签名码让它重新开工。','The factory may start it again from the tower.':'工厂可以从控制塔让它重新开工。',
  'The factory may stop a crew from far away, and it must tell the crew lead at once.':'工厂可以远程让机器人队停下，但必须马上通知队长。',
  'The factory may do nothing at all from far away.':'工厂在远处什么都不能做。','The factory may stop or start any crew it built from far away.':'工厂可以远程让它造的任何一支队停下或重新开工。',
  'Rule card':'规则卡',

  // signing
  'Sign the rule card':'签署规则卡','Rules:':'规则：',
  'Anyone on site ':'现场的任何人','The factory may ':'工厂可以','Only the crew lead ':'只有队长','We will test ':'我们会测试',
  'Anyone on site may stop a crew because…':'现场的任何人都可以叫停机器人队，因为……','Crew Lead {0}':'{0}队长',
  'Signed. Tonight every crew this factory built gets the new card.':'签好了。今晚这家工厂造过的每一支队都会收到新卡。',

  // after
  'We put your card on the test crew and then tried to restart it from the tower. The crew refused, and it sent you a message about it. Then I said “Tíng,” and it stopped for me. That is exactly what we wanted.':
    '我们把你的卡装到测试队上，然后试着从控制塔让它重新开工。机器人队拒绝了，还给你发了一条消息。然后我喊了一声“停”，它马上就停了。这正是我们想要的。',
  'We put your card on the test crew, and it works. But the tower can still restart crews without telling anybody, so Tang Yifan wants to talk about that again next month.':
    '我们把你的卡装到测试队上了，能用。可是控制塔还是能不告诉任何人就让机器人队重新开工，所以唐一帆想下个月再谈谈这件事。',
  'We put your card on the test crew. Now only the crew lead can stop it, so when I said “Tíng,” the crew kept working. Mr. Huang did not like that one bit.':
    '我们把你的卡装到测试队上了。现在只有队长能让它停，所以我喊“停”的时候，它照样干活。黄师傅对这一点很不满意。',
  'See how you did':'看看你做得怎么样','Tíng!':'停！',

  // debrief
  'You tested all three stops and found that the remote stop could also restart crews.':'你把三种停机办法都试了，还发现远程停机也能让机器人队重新开工。',
  'Try every way of stopping a crew before you write the rules. Testing the remote stop showed that it could also restart crews without telling anyone.':
    '写规则之前，先把每种停机办法都试一遍。测试远程停机的时候就会发现，它也能不告诉任何人就让机器人队重新开工。',
  'On your card, anybody can stop a crew, only the crew lead can start it again, and the tower cannot restart a crew without telling the people on site.':
    '按你的规则卡，谁都能叫停机器人队，只有队长能让它重新开工，控制塔也不能瞒着现场的人让它重新开工。',
  'Your card left a gap. Either a person next to a crew cannot stop it, or the factory can restart it without telling anyone.':
    '你的规则卡留了个漏洞：要么站在机器人队旁边的人叫不停它，要么工厂可以不告诉任何人就让它重新开工。',
  'You listened to the people who know this factory floor best, and you signed a card that they could read and understand.':'你听取了最了解这个车间的人的意见，签的规则卡他们也读得懂。',
  'Next time, ask Mr. Huang, Ms. Lin and Tang Yifan more. Each of them knew something useful.':'下次多问问黄师傅、林晓梅和唐一帆。他们每个人都知道一些有用的事。',
  'A safe crew needs a stop that anybody on site can use, and a restart that only the crew lead can approve with a signed code.':
    '一支安全的机器人队，要让现场的任何人都能叫停，而重新开工只能由队长用签名码来批准。',

  // evening
  '“Your new rule card went out to all 212 crews at six o’clock. Your own crew in Phoenix sent back a short note: rules received.”':'“你的新规则卡六点钟发给了全部212支队。凤凰城你自己那支队回了一句话：规则已收到。”',
  '“Mr. Huang printed the card and pinned it next to his floor’s oldest rule, from forty-three years ago: anybody who sees a problem may stop the line. His whole floor walks past them both.”':
    '“黄师傅把规则卡打印出来，钉在车间最老的那条规矩旁边。那条规矩是四十三年前定的：谁看见问题，谁都可以停线。整个车间的人每天都从这两张纸前面走过。”',
  '“Tang Yifan says she will keep a close eye on that restart button, because the card still lets the tower use it.”':'“唐一帆说她会好好盯着那个重新开工的按钮，因为规则卡还允许控制塔用它。”',
  '“Tang Yifan says that if the tower ever stops a crew now, its crew lead will hear about it within a second.”':'“唐一帆说，现在控制塔要是让哪支队停下，那支队的队长一秒钟之内就会知道。”',
  '“In the Ledger tonight: the robot crew in Phoenix has asked its city for permission to build copies of itself so it can finish a school faster.”':
    '“今晚的《纪事报》上说：凤凰城那支机器人施工队向市里申请，想造出几支和自己一样的队，好把学校盖得快一点。”',

  // chat with Byte (scripted replies)
  '“Tíng” means stop. Anybody standing nearby can say it, and the crew pauses in under a second. But the crew starts again by itself after thirty seconds unless somebody tells it to stay stopped.':
    '旁边的人谁都可以喊“停”，机器人队不到一秒就会暂停。可是要是没人叫它一直停着，三十秒后它会自己重新开工。',
  'The tower can stop every crew this factory has built, anywhere in the world. It can also start them again, without telling the crew lead. The restart worries me, because the people on site would not know that their crew was about to move again.':
    '这家工厂造过的每一支队，不管在世界哪里，控制塔都能让它停下。它还能不通知队长就让它们重新开工。我担心的是重新开工，因为现场的人不会知道自己的机器人队马上又要动了。',
  'Starting a crew again is riskier than stopping one, because if something is still wrong, people could get hurt. A signed code from the crew lead proves exactly who said to go.':
    '让机器人队重新开工比让它停下风险大，因为问题要是还在，就可能有人受伤。队长的签名码能确切证明是谁下令开工的。',
  'Zone 3 has 41,860 robots working today, and its limit is 42,000. Tang Yifan checks those numbers every day.':'3号区今天有41,860台机器人在干活，上限是42,000台。唐一帆每天都要核对这些数字。',
  'Try all three stops in the drill, and watch what each robot does. Then fill in the rule card: who may pause a crew, who may stop it, who may start it again, and what the factory may do from far away.':
    '把演练里的三种停机办法都试一遍，看看每台机器人在做什么。然后填规则卡：谁可以让机器人队暂停，谁可以让它停机，谁可以让它重新开工，工厂在远处可以做什么。'
},
glossary:{
  'special economic zone':{w:'经济特区',d:'在这个游戏的2040年，用机器人的重工业都放在特区里，每个区能用多少台机器人都有上限。现实中：深圳从1980年起就是经济特区，但今天还没有这种机器人上限。'},
  'permit':{w:'许可证',d:'正式允许做某件事的证明。在这个区里，每台干活的机器人都要有一张。'},
  'permit cap':{w:'许可上限',d:'一个区最多能发多少张许可证。在2040年，一个区的许可证发满了，就不能再让更多机器人在那里干活。现实中：今天没有哪个国家用这种办法限制机器人。'},
  'robot crew':{w:'机器人施工队',alt:['机器人队'],d:'在2040年，一起盖东西的一队机器人。它由自己的AI指挥，由一位人类队长负责。现实中：今天的机器人能在工厂里造建筑的部件，但还没有哪支机器人队能盖起一整所学校。'},
  'crew lead':{w:'队长',d:'负责一支机器人施工队的人。机器人队盖的每样东西上都写着队长的名字，机器人队惹出任何问题，都要由队长来处理。'},
  'remote stop':{w:'远程停机',d:'通过网络，从远处让机器停下。'},
  'stop drill':{w:'停机演练',d:'一次练习，检查让机器停下的每种办法是不是真的管用。'},
  'signed code':{w:'签名码',d:'跟某一个人绑定的密码，机器靠它就能确切知道命令是谁下的。'},
  'zone monitor':{w:'区域监察员',d:'在2040年，专门检查一个区里的机器人有没有超出许可、守不守规则的人。现实中：今天的工厂安全检查员做的事情和这差不多。'},
  'andon cord':{w:'安灯绳',d:'沿着工厂流水线拉着的一根绳子。工人觉得哪里不对，谁都可以拉它，让整条线停下来。'},
  'pearl river delta':{w:'珠三角',d:'珠江入海口一带，深圳、广州和香港都在这里。'},
  'tíng':{w:'停',d:'叫人或机器停下的话。'},'nǐ hǎo':{w:'你好',d:'打招呼的话。'},'xièxie':{w:'谢谢',d:'表示感谢的话。'},
  'jiāyóu':{w:'加油',d:'给人鼓劲的话。'},'gōngchǎng':{w:'工厂',d:'用机器生产东西的地方。'}
},
regex:{
  'ting|tíng|voice|shout':'停|喊|声音',
  'remote|tower|factory':'远程|控制塔|塔|工厂',
  'restart|code':'重新开工|重启|开工|密码|签名码',
  'permit|cap|zone':'许可|上限|特区|几号区|3号区',
  'help|stuck|what do i do':'帮|卡住|怎么办|该做什么|不知道'
}});
