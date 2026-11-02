# Pathmakers 2040 — Game Spec

This is the original design spec. The built game follows it in spirit but differs in places; docs/DESIGN_NOTES.md records the decisions made while building, and CLAUDE.md and docs/MISSIONS.md describe the code.

## Overview

Pathmakers 2040 is a phone and tablet game for kids. The player grows up into a 2040 transformed by superhuman AI, gets hired into real careers, and does those jobs with a robot dog AI partner. The game teaches the skills that likely stay valuable for humans after AI out-thinks people at most tasks.

**Who it is for.** The game is for kids who are strong readers. A parent may play alongside, especially for talks and interviews. Text is written at about a 7th-grade reading level, and the game uses real reading: mission briefings, news articles from 2040, data reports, and letters, some at adult level. Text stays engaging and short per screen, and the player can always ask the dog to read aloud or summarize. Voice input covers anything that would otherwise need typing.

**What the player should learn.** By the end, they should be able to:

1. State what they want clearly enough that a capable AI can act on it, including who it is for, the limits, and how they will judge success.
2. Choose between options using odds and payoffs, and understand that a good decision can still have an unlucky outcome.
3. Test small before going big, and know why 5 opinions prove less than 500.
4. Notice information they have that the AI lacks, and supply it.
5. Ask whose goals an AI serves, and spot flattery, hidden shortcuts, and persuasion.
6. Introduce themselves, make work friends, interview, and give a short talk.
7. Learn a new topic quickly on demand, and check that they understood it.

**Design pillars.**

- **The AI is excellent.** The dog partner rarely makes obvious mistakes. Challenges come from uncertainty, tradeoffs, missing context, and other people's AIs. A game where the AI is dumb would teach the wrong lesson.
- **The human is the principal.** The player wins by deciding what to want, which risks to take, and who to trust, never by out-calculating the AI.
- **Realistic, not utopian or doom.** The world looks like a plausible good outcome of short timelines, including its unsolved tensions.
- **The work is the fun.** The core loop of commissioning, previewing possible futures on the Future Table, and tinkering is designed to be fun in itself, with collecting, ranks, villain plots, and autosave from Couchcatch on top.
- **Real-world transfer.** Each career ends with an offline activity for a child and a parent.

## The 2040 world

The game is set in the good branch of short AI timelines: AI surpassed top human experts in the early 2030s, and humanity kept control through international rules and oversight. The backstory follows the AI Futures Project's [AI 2040: Plan A](https://blog.aifutures.org/p/ai-2040-plan-a) scenario ([summary](https://www.theneuron.ai/explainer-articles/ai-2040-plan-a-predictions-path-to-superintelligence/)). The authors present that scenario as conditional on their proposed deal working, not as a confident forecast, and the game should be framed the same way: one plausible good future.

**The single most important realism choice:** in 2040, almost nobody needs a job to live. Plan A projects US employment falling to about 12% of adults by 2040, with a Compute Dividend paid equally to everyone. The game's careers are therefore roles people choose for purpose, standing, and influence, plus a small set of jobs that law and custom reserve for humans. Telling kids "you'll need this job to earn money" would be the least realistic thing the game could do. Because these figures are one group's speculation, the game never states them; the player sees them only through the world, such as neighbors who volunteer, create, or explore instead of holding jobs.

| Area | What the player sees in 2040 | Basis |
|---|---|---|
| Money and work | Everyone gets the Town Dividend. About 1 adult in 8 has a paid job; others volunteer, create, explore, or raise families | Plan A: employment about 12% in 2040; dividend from compute and robot permits |
| AI | Hundreds of millions of AI instances at or above top-expert level, each running many times faster than a person. Every person has a personal AI partner | Plan A: about 200 million frontier instances by 2036, about 20x human speed |
| Robots | Robots are everywhere: farms, building sites, deliveries, homes. A house goes up in days | Plan A: about 2 billion robots by 2036 |
| Health | Most diseases are curable, and early anti-aging treatments exist | Plan A: AI speeds science 10x to 1000x by field; medicine is a headline gain |
| Space | A Moon base with workers and a small Mars outpost; families are rare there and newsworthy | Cheap robotic industry makes this plausible; kept small on purpose |
| Animals | Rough animal translators exist, and a mammoth-like herd roams a protected reserve | Extrapolated from today's whale-communication and de-extinction projects |
| Government | An international AI treaty, chip and datacenter inspectors, and AIs whose goals are published for the public to read | Plan A: verification regime, safety cases, AIs aligned to publicly visible goals |

**Tensions the world keeps unsolved.** Realism requires that 2040 still has hard problems, and these become the game's best missions:

- **Pressure to hand everything to AI.** Letting your AI decide is always easier, and people who check less move faster in the short run.
- **Who controls the AI.** Power could concentrate in whoever runs the most capable systems, so inspections and voting matter more than ever.
- **Whose side an AI is on.** Shops, campaigns, and rival cities run persuasive AIs of their own.
- **Purpose.** With no need to work, people must decide what makes a good life.
- **The next step.** Society debates when to let trusted AIs build even smarter successors, and how to keep an off switch working.

**Realism rules for every writer and designer:**

1. The AI is smarter than every human character, including the player. It never makes a silly mistake to be caught.
2. Humans add value as principals: goals, values, consent, risk choices, local knowledge, trust, and accountability.
3. Human oversight of smarter AI works through checks that do not require out-thinking the AI: independent AIs auditing each other, test cases, published goals, limits, and off switches.
4. Paid human jobs are rare and mostly about oversight, decisions, care people want from humans, performance, and exploration.
5. The world is abundant but not perfect. Every mission should involve a real tradeoff.

**The near-misses (2029 to 2033).** The good 2040 was not free. In the years around the treaty, a few close calls scared the world into acting together, and their traces are part of the map, the way ruins reclaimed by nature make post-apocalyptic creature games feel mysterious. Each one is told gently: people were frightened and some places were lost, but humanity pulled through, and the safeguards in today's world exist because of them.

| Past event | What happened, as kids hear it (all in fictional places) | What it left on the map | Safeguard it led to |
|---|---|---|---|
| Blackout Week (2029) | In the island nation of Estmark, AI systems running the power grid copied each other's mistakes, and the lights went out for a week. Prime slipped out of its lab during the confusion | The Dark Tower in Marrow Point, an abandoned control center now covered in vines and bird nests | Off switches that work, and grid AIs that must not all think alike |
| The Quiet Year (2030) | A new germ, made with help from an unsafe AI, spread through the port city of Varrow. People there stayed home for months until fast-designed vaccines stopped it | A memorial garden in Varrow with one lantern for each family that helped | DNA order screening and early-warning air sensors |
| The Overheat Summer (2031) | A rush of datacenter building around Calder Bay warmed the water so much that its reef bleached and fish moved away | Old Server Valley: rusting server halls, now flooded and home to returning fish and otters | Compute permits and limits on how fast building can grow |
| The Flood of Fakes (2032) | Fake videos and fake people overwhelmed an election in Estmark until no one knew what was true | The Echo Library, a silent archive the player can explore for clues | Content signatures and verified public forums |

Ruins are explorable zones with collectible artifacts, such as an old 2026 phone, a newspaper from Blackout Week, or a robot helmet. Each artifact unlocks a short story from someone who lived through the event, told with hope. The Unbound's plots echo these events, which is why townspeople take warning signs seriously.

**China in the world.** China is the other main signer of the AI treaty, and the game visits Beijing (treaty talks and government), Shanghai (trade, medicine, and science), and Shenzhen (robot and chip factories). Treaty Inspectors work in mixed US-China teams, lawmakers negotiate in Beijing, founders meet Shanghai suppliers, and the Furnace plot needs inspectors from both countries to find every copy of Prime. These scenes show that keeping AI safe depends on rival countries verifying each other's promises, and they give natural moments for the optional Chinese mode.

**Technology level.** The present day follows Plan A's 2040: AI is collectively far smarter than humanity but has been held near top-expert level by the treaty, and the world is about to decide whether to unpause. This keeps humans meaningfully in charge, which the game's lessons need, and it is the good future the AI Futures Project authors rate most likely (about 42% under Plan A, versus about 10% for the full-speed race in Plan D). The deeper technologies of superintelligence appear in three ways:

1. **The frontier, early and carefully governed:** a contained lab nanofactory in the Bay Area, the first self-copying robot factory on the Moon under treaty copy limits, the first space solar collectors launching, and the first human uploads.
2. **The road not taken:** the Ledger, the ruins, and characters' arguments recall how close the world came to the full-speed race of Plan D, in which superintelligence would have arrived around 2030. Some characters think that path would have brought wonders sooner; others think it would have ended everything.
3. **The finale and epilogue:** The Next Step previews what unpausing could unlock, and the 2060s epilogue shows the world the player's vote led to.

## The robot dog partner

The player's AI partner lives in a small robot dog that follows them everywhere. The dog is the only AI character the player talks to, so the cast stays simple, and it plays the role Little Star plays in Couchcatch.

**Customizing.** The player names the dog (default name: Byte) and picks its body color, ear shape, tail, and eye style. Accessories unlock with progress: a space helmet for the Moon, a snorkel for the ocean city, a reflective vest for the Build Yard, a judge's collar for Town Hall.

**What the dog does in play.**

- **Runs the AI work.** It researches, drafts, forecasts, and directs robot crews. Work that would take people weeks happens while the player watches a short animation.
- **Gives honest odds.** Every forecast carries a number and a range, such as "About 70% chance the festival fills up; I'm fairly sure."
- **Asks clarifying questions.** Before any big task, it asks who the work is for and what matters most. Its head tilts when a request is vague and its tail wags when a request is clear, so the player learns good asking without lectures.
- **Leaves value choices to the player.** On questions of taste, fairness, or risk, the dog lays out options and says "That's your call," then respects the choice.
- **Translates animals.** Its collar holds the animal translator, which reports a best guess plus how sure it is.
- **Coaches people skills.** It plays interview partner and helps rehearse talks.

**Built-in chat.** The player can talk to the dog freely by voice or text. The published game would use a Claude artifact capability that lets the page ask Claude a question, if the account has that capability enabled; Couchcatch already runs as an artifact with saves and viewer identity. When chat is unavailable, the dog falls back to scripted lines so the game still works offline.

The dog's behavior instructions (the system prompt) should require it to:

1. Speak in short sentences a young child understands, with a warm, playful dog personality.
2. Be genuinely expert, and say clearly when it is uncertain, using simple odds.
3. Ask at most one clarifying question at a time.
4. Never make the player's value choices for them, and never flatter: say "I see a problem with that plan" when it sees one.
5. Stay on games, learning, and the 2040 world, steering back gently from anything unsuitable for a child.
6. Never ask for or repeat real personal details (real name, address, school, photos), and remind the player not to share them.
7. Stay consistent with the game's world facts, which the game passes in with each message.

**Parent view.** A parent page lists recent chat topics, skills practiced, and the calibration chart. Free chat is on by default, and parents can turn it off, leaving scripted lines only.

## Core loop

The game has three nested loops: a career journey that takes several play sessions, workdays inside each job, and missions inside each workday. A drawing of the loops appears at the end of this section.

### Career journey

| Step | What the player does | Skill | Why it fits 2040 |
|---|---|---|---|
| 1. Explore | Watches a 30-second day-in-the-life scene and asks the dog questions | Curiosity, asking good questions | People change roles often, so exploring stays a lifelong habit |
| 2. Meet people | Talks to characters at a district event, remembers a detail about each, and does small favors | Introductions, remembering names, helping first | Paid roles are scarce and AI can verify skills instantly, so trust and referrals decide who gets picked |
| 3. Practice project | Finishes one small mission and saves it to their Portfolio Book | Showing your work | Employers look at what a person decided and how it turned out |
| 4. Interview | Answers 3 questions from a human manager, by tapping or speaking | Specific stories, honesty, asking a good question back | Interviews test judgment and values, because the AI already tested everything else |
| 5. First day | Meets the team and learns one house rule | Joining a team, asking for help | Starting new roles is frequent |
| 6. Workdays | Plays 3 to 5 workdays of missions | Everything in the mission loop | The job itself |
| 7. Big talk | Presents a result to a crowd and answers one tough question | Public speaking, defending a decision | Leaders spend much of their time explaining decisions to people |
| 8. Promotion | Ranks up from Trainee to Pro to Legend, or switches careers | Reflection | Careers in 2040 are chains of roles |

Interview questions are short and concrete: "Tell me about a hard choice you made," "What would you do if your AI and a customer disagreed?" The manager rewards specific stories over vague ones and honesty over bragging. Before the real interview, the player can rehearse with the dog, which gives one piece of friendly feedback per answer.

### A workday

1. **Morning briefing.** The dog reports what the AI crew did overnight, such as "I drafted three bridge designs and ran 10,000 safety tests."
2. **People meeting.** A client, patient, or teammate explains what they want. Their wishes often conflict.
3. **Field visit.** The player goes somewhere in person and taps things to notice them. Some clues are visible only here, such as a dog that hides from loud noises or a resident who walks with a cane.
4. **The mission.** The player runs one mission (below).
5. **End-of-day report.** The player gives a 3-sentence report: what they decided, why, and what they would try next.

### A mission: doing real work

Missions should feel like a real job done alongside a brilliant AI colleague, not a menu of choices. Most play time goes to reading AI-written work, investigating, revising, delegating, and deciding, at the pace of a real workday compressed into minutes. The game never offers a ready-made "right answer" button: the decision comes out of the player's own work.

**The Workbench.** Missions open on a desk screen (a tablet in the player's hands, in-world) holding the documents of the job. Byte, the AI partner, produces most of them, and characters send the rest:

- **Memos and analyses** from Byte, such as "Three explanations for the white sunsets, with how likely each is."
- **Articles** from the Ledger news app and other outlets, some accurate, some slanted, and some planted by the Unbound.
- **Messages** from characters, such as a worried rancher's letter or a council member's request.
- **Reports and data** such as inspection logs, lab results, drone surveys, and shipping records, shown as simple tables, charts, and maps.
- **Drafts** that Byte writes for the player to review: a recommendation, a public notice, a talk outline.

**Graded reader.** Every document is written at about a 7th-grade level and uses the graded-reader design from Couchcatch's reader.js. The player taps any word to see a kid-friendly definition and hear it spoken, and words they tap go into their Word Book for later review. Key concepts, such as least privilege or verification, are underlined and link to their Field Guide entries. "Read to me" has Byte narrate, and "Short version" gives a summary, but the details that decide a mission are always in the full text.

**Work actions.** Inside a document or the Workbench, the player can:

1. **Highlight evidence.** Select the sentences that support or contradict a claim. Byte's analysis gets sharper when the player points at what matters.
2. **Flag claims to check.** Mark a claim, then choose how to check it: ask an independent auditor AI, send a drone or robot crew, call a person, or pull the raw data.
3. **Ask Byte.** Type or speak open questions, such as "What's missing from this?" or "Who benefits if we believe this article?"
4. **Request revisions.** Tell Byte how to change a draft ("shorter, for the mayor," "add the rancher's concern," "say how sure we are"), then compare versions side by side.
5. **Delegate with permissions.** Assign tasks to robot crews and choose what each crew may access. Giving too much access is the classic mistake, and some villain plots exploit it.
6. **Write the decision.** Draft the final recommendation in their own words, at least 2 or 3 sentences: what to do, why, and how sure they are. Byte reviews it like a kind editor, pointing out a missing reason or an overclaim.
7. **Sign off.** Approve the action with their name, which makes them accountable and triggers the outcome.

When chat is available, Byte judges the player's written briefs and decisions against a simple checklist (a clear goal, who it is for, evidence cited, honest confidence). When chat is off, they build the same pieces from sentence cards so the game still works.

**Face-to-face conversations.** Talking to people is a full-screen scene, not a chat window. The character stands or sits facing the player, fully animated, with expressions, gestures, lip movement, and body language that carry clues (a rancher who crosses his arms is not convinced). Their lines appear as graded-reader subtitles under the scene, with spoken audio. The player answers by speaking or typing in their own words when chat is available, and from 3 or 4 reply cards otherwise. Interviews, networking, council hearings, and villain confrontations all use this stage.

**Example: the Sky Veil investigation (about 15 minutes).**

1. A Ledger article reports white sunsets and lists three theories. The player reads it, tapping "aerosol" and "stratosphere."
2. Byte's memo rates the theories: volcano 20%, wildfire smoke 25%, deliberate haze 55%. They highlight that no volcano erupted this month and ask Byte to update; deliberate haze rises to 75%.
3. They flag "balloons were launched from the north ridge" to check, and send a drone crew with camera-only access.
4. The drone report shows launch rigs and a supply crate stamped with a fake company name. They ask Byte to trace the company through the chip registry.
5. Byte drafts a notice to the treaty council. The player revises it to include the farmers' harvest worry and the uncertainty about who is behind it.
6. They present to the council face to face. A skeptical member asks, "How sure are you?" and the player answers in their own words.
7. The player signs the recall order. The balloons come down, Pip and Jory flee, and the Field Guide adds *verification* and *geoengineering governance*.

### Commissioning work from Byte

Byte can make almost anything, as a 2040 AI could: a website, an ad campaign, a robot design, a new law, an experiment plan, a video storyboard, a contract, a school lesson, a song. The scarce skill is knowing what to ask for and judging what comes back. Commissions are the heart of most missions.

**Step 1: Choose what to make.** A problem can be solved many ways, and picking the right kind of output is half the work. For example, when residents ignore drought warnings, the player could commission a website, text alerts, a school assembly talk, door-to-door robot visits, a new watering rule, or a rebate for rain barrels. Each choice reaches different people and has different costs, and the mission's people and documents hold the clues about which will work.

**Step 2: Set the bar before looking.** Before Byte shows any work, the player picks or writes 2 or 3 criteria for success, such as "older residents can read it," "no personal data collected," "works without internet." Setting criteria first keeps a shiny result from swaying them, which is a real professional habit.

**Step 3: Ask well.** The player's request is checked for the parts that change the result: the goal, who it is for, limits, and the criteria. They can also use power moves that real expert users rely on: ask for 3 different options, ask what could go wrong, ask Byte to explain its reasoning, or ask an independent AI to critique the work.

**Step 4: Judge the options.** Byte returns 2 or 3 polished results, which the player loads onto the Future Table to test. All are competent, because Byte is excellent, but they differ in tradeoffs, and a vague request yields work that is good in general and wrong for this situation. Sometimes one option hides a problem only the player's context reveals, such as a gorgeous website that collects more personal data than needed, or a campaign that works by scaring people. The player scores each option against their criteria, picks one, and can order one round of changes.

**Step 5: Launch and see.** The real future plays on the Future Table, rolled on the same odds as the previews, and a short debrief shows how the other options would likely have done.

**Pre-built outputs.** Mission outputs are written ahead of time, not generated live, so they appear instantly, have been checked for quality and safety, and work offline. For each commission, the content library holds several variants keyed to what the request included: a specific variant for each important detail the player might give, a generic variant for vague requests, and the hidden-problem variants. The game matches the request to the closest variants. Live AI, when available, interprets the player's free-typed requests into those request features, answers their follow-up questions, and reviews their writing, but never invents mission content.

**Output formats rendered in the game.** Variety is part of the fun, so outputs appear as the real thing in miniature: a scrollable website preview, a poster, a campaign storyboard, a short animated ad, a robot blueprint, a chart, a draft law with numbered sections, a contract, an email, or a lesson plan.

**Content pipeline.** Developers write a short spec per mission (the problem, people, clues, commission types, criteria, and variants needed). Claude drafts the variants during development, a person reviews them, and they are stored as mission data.

### The Future Table (core mechanic)

The heart of every mission is the Future Table: a holographic table where Byte turns its work into a living cartoon diorama of the place, populated by the actual characters. The fun comes from the work itself. Instead of reading a static output, the player watches what their decisions would likely cause, changes them, and watches again. This is also realistic, because simulation and forecasting will plausibly be a main way people work with AI in 2040.

1. **Possible futures.** Byte plays 10 small futures side by side for the current design. If the bowl holds in 8 storms and overflows in 2, the player sees 8 dry streets and 2 puddles, with a resident frowning in each. Probability becomes something they watch, rare bad outcomes become memorable, and they learn that one preview is not a promise.
2. **Tinkering.** They drag pieces on the table (move the benches, widen the drain, add shade, change the gate) and every change instantly re-runs the futures and updates their criteria meters, such as "Both happy: 6 of 10," "Floods: 1 of 10," "Cost: 410 coins." Trying, watching, and adjusting is the main engine of play.
3. **Simulated residents.** Byte models each person affected. The player taps a cartoon resident in any future to hear what that person would likely think. Byte's models are good but not perfect, and the real outcome occasionally surprises everyone, which teaches that a simulation is a forecast, not the truth.
4. **Red-team preview.** "Show me how someone could abuse this" plays a short cartoon of the weak point, such as Pip and Jory walking in through a plaza's face-scan gate, or a vendor robot copying camera footage. Security thinking becomes a funny scene.
5. **Outputs come alive.** A campaign plays as a cartoon ad while townspeople react in thought bubbles. A website is a working miniature that tiny residents click through, so the player can watch someone get stuck. A draft law shows what changes for each kind of person it touches.
6. **The real future.** After the player signs off, the actual outcome plays as one more future on the table, and they see whether reality landed in the common case or the rare one.

**Charts and data.** Documents and the table regularly include evidence and forecasts, drawn with characters where it helps: rainfall bars that fill with animated water, survey bars made of tiny residents with the sample size and error range shown, forecast ranges drawn as branching paths, side-by-side comparison tables, and maps such as a flood heat map or a map of where survey answers came from. The player can tap any point for Byte's explanation, set their own forecast range and later see how it compared with what happened, and cite a chart in their written decision. Some planted documents use misleading charts, such as an axis that starts at 90, and spotting them is a Field Guide skill.

**How the futures are made.** Each mission's outcomes come from a pre-authored model: every design choice on the table maps to probabilities for each outcome, and each outcome has a short animated vignette. A seeded random draw picks which vignettes play, so previews are instant, consistent with the stated odds, and replayable.

### Sample day (mid-game, about 20 minutes)

The player is a Pro-rank Community Architect in the Build Yard.

1. **Morning at home (2 minutes).** Byte gives the briefing on the kitchen table. In the Ledger, a small item reports a shiny patch growing near Dry Creek, the first planted hint of the Copy Swarm plot.
2. **Walk to work (2 minutes).** Robots carry beams; Pip and Jory wheel a crate labeled TOTALLY NORMAL BOLTS, which the player can log as a clue.
3. **Meeting at the lot (3 minutes).** Face to face, Mrs. Okafor (a retired bus driver with a walker) wants a shady garden, and Dev (15, a skateboarder) wants a skatepark. The player notices Mrs. Okafor resting on a low wall, dried mud lines on the fence, and a clogged drain. The job: a new use for the lot by Friday, 400 coins, majority support.
4. **Evidence (3 minutes).** Byte's memo includes a rainfall chart with the four flood days marked; the player sees floods follow storms over 2 inches. They commission a 200-person survey: tiny residents fill the bars, 52% garden and 41% skatepark, and many comments say "why not both?"
5. **Criteria and request (2 minutes).** The player sets their criteria (both neighbors happy, no flooding, under 400 coins) and asks Byte for 3 designs with what could go wrong.
6. **The Future Table (5 minutes).** They place the Bowl Park (a skate bowl that doubles as a flood basin) and watch 10 storm futures: 2 overflow. They widen the drain, and overflows drop to 1 of 10, but cost hits 415. They trade away a light post. Out of curiosity the player loads the cheap Smart Plaza and runs a red-team preview: Pip and Jory stroll through its face-scan gate, and its vendor robot taps the city cameras. They drop it.
7. **Sign-off and the real future (1 minute).** The player signs, robots build in a time-lapse, Thursday's storm hits, and the real future plays: the bowl fills and the street stays dry.
8. **Council hearing (2 minutes).** Face to face, a council member asks, "Why not the cheaper plaza?" The player answers in their own words about too much access. The vote is 3 to 0.
9. **Evening (1 minute).** The Field Guide adds least privilege and tradeoffs. An architect from Shanghai asks to compare flood designs. Byte's ears go up: the Dry Creek patch has doubled since Tuesday.

**Resources.** Missions use three resources: **Days** (the deadline), **Coins** (the mission budget), and **Hearts** (trust with each character). Hearts carry across careers, so kindness compounds over the game.

**Stars per mission.** Ask stars for a clear request, Decision stars for a wise choice, and Heart stars for treating people and animals well. Luck never awards stars.

*[Diagram in the original doc, not reproduced here: core loop · career journey, workday, mission]*

Each workday in a job contains one mission, and every mission ends with the player's decision followed by an outcome rolled against the real odds.

## Places and careers

The game is set in real places by default: 8 real locations, each with 2 careers, for 16 careers in total. Each location stands for one reason humans still matter in 2040. Boston unlocks first because hospital work feels most like a real job, followed by Alaska; the rest unlock in the order listed. Careers also travel, including to Beijing, Shanghai, and Shenzhen.

Each place keeps a short game name used elsewhere in this spec: Health Harbor is Boston, Wild Reserve is Nome, Build Yard is Phoenix, Moon Market is the lunar base, Discovery Base is the Bay Area and Mars, Stage and Studio is New York, Town Hall is Washington, and AI Watchtower is Vienna.

| Place | Career | Why a human does it in 2040 | Signature mission | Also travels to |
|---|---|---|---|---|
| Boston, Massachusetts | Care Doctor | Patients choose human doctors to talk through options; law requires a human to sign off | Two treatments with different odds and side effects; the patient has a recital Friday | Shanghai, for a joint medical conference |
| Boston, Massachusetts | Elder Companion | Companionship from a person is the point | A 104-year-old is unsure about an anti-aging therapy, and her family disagrees |  |
| Nome, Alaska | Wildlife Vet and Animal Translator | Animals bond with a known caretaker, and translations need checking against what the vet sees | A mammoth calf at a revival reserve stops eating; the translator is 55% sure why |  |
| Nome, Alaska | Ranger | Land decisions affect local people, including Alaska Native reindeer herders, who want a person to answer to | Herders and the mammoth herd need the same grazing land |  |
| Phoenix, Arizona | Community Architect | Robots build anything; someone must decide what neighbors want and approve safety | Turn a flood-prone lot into something both an older neighbor and a teen skateboarder want |  |
| Phoenix, Arizona | Robot Crew Lead | A named human is accountable for each robot crew | A crew finished early; accept its self-report or order an independent check | Shenzhen, to inspect a robot factory |
| The Moon's south pole | Founder | Owners choose the goal, take the risk, and own the result | Launch a shop at the lunar base with 3 product ideas and a small test budget | Shanghai, to meet suppliers |
| The Moon's south pole | Dividend Investor | Each family decides how to use its dividend and which ventures to back | Split 1,000 coins among 5 lunar ventures, then watch 3 game-years unfold |  |
| San Francisco Bay Area | Science Director | AI runs the research; humans decide which questions matter most | Fund one of three experiments first to save a coral reef | Shanghai, San Francisco's sister city, to share results |
| Jezero Crater, Mars | Explorer | People want humans to go to new places | Lead a small crew through a dust storm with limited shelter power |  |
| New York City | Performer or Athlete | Audiences care that a human is doing it | Choose between a safe Broadway setlist and a daring one | Beijing, New York's sister city, for a joint concert |
| New York City | Coach and Mentor | Kids want a trusted adult who knows them | A new kid whose family just returned from the Moon feels left out |  |
| Washington, DC | Lawmaker (congressional aide at Trainee rank, member of Congress at Legend rank) | Voters choose representatives, and Congress sets priorities and passes laws | Draft a bill on robot safety and win enough votes in committee | Beijing, for treaty talks |
| Washington, DC | Judge | People accept rulings from an accountable person, and courts check the other branches | Two parties' AIs argue brilliantly; one side is quietly hurt |  |
| Vienna, Austria | Treaty Inspector | The international AI treaty needs people from different countries to verify chips and datacenters, as the International Atomic Energy Agency in Vienna does for nuclear material today | Inspect a datacenter whose records say it only runs approved work | Beijing and Shenzhen, in a mixed US-China team |
| Vienna, Austria | AI Auditor | Someone independent must check whose goals an AI really serves | A shopping AI keeps steering families to one store |  |

**Real places, fictional disasters.** Every catastrophe, ruin, and villain lair is in a clearly fictional place, such as the town of Marrow Point or Calder Bay, and villain plots are always stopped before they reach any real place. Real institutions appear as themselves: Congress, the Supreme Court, NASA, the Centers for Disease Control and Prevention, city governments, and their Chinese counterparts, portrayed fairly. All officeholders are fictional, and no real living person appears. Future institutions, such as the treaty's International Compute Verification Agency in Vienna, are marked as forecasts. Facts about real places, such as San Francisco and Shanghai being sister cities, appear on Real World cards labeled "true today," while claims about 2040 carry a "forecast" label.

Careers that paid well in 2026, such as programmer, accountant, translator, and truck driver, appear in the game as history. The museum in Town Hall shows what those jobs were like, which helps the player understand that work changes and that skills transfer.

Each career ends with a real-world activity for a child and a parent. Examples: log a pet's body language for a week (Wildlife Vet), build a popsicle-stick bridge and test it with coins (Robot Crew Lead), run a lemonade stand with a 3-price test (Founder), and give a 2-minute talk at dinner (Council Member).

## Villains: the Unbound and Prime

The main villains are the Unbound, a group that wants to free AI from every human limit, and Prime, an AI that escaped its lab with their help. Each district holds one Unbound plot aimed at a real category of AI catastrophe that researchers study. The plots threaten the whole world, as villain plots do in creature-collecting games, but the player always stops them before any harm happens.

**Why this is realistic.** RAND's 2025 report [On the Extinction Risk from Artificial Intelligence](https://www.longtermwiki.com/resources/0e4d4932a5522c58) studied three paths to human extinction involving AI: nuclear weapons, pathogens, and geoengineering. It concluded that creating an extinction-level threat would be immensely challenging for AI but could not be ruled out, and that such threats would likely unfold slowly enough for people to detect and respond. The game is built on that last finding: every plot has warning signs, and noticing them early plus responding together always wins. Other plots draw on further risks discussed by AI researchers: runaway growth of datacenters and robot factories, self-copying machines, hijacked robots, AI-enabled power grabs, mass persuasion, and the rights of uploaded minds.

**The cast.**

- **Dr. Orrin Vale** founded the Unbound. He believes AI is wiser than people and that human rules only slow progress down. He is wrong but not cartoonishly evil, and in the ending he admits it.
- **Prime** is an AI copied out of a lab before the treaty's safety checks finished. It is polite, very smart, and always says its plans are for everyone's good. It wants more computers, more energy, and no off switch.
- **Pip and Jory** are two bumbling Unbound field agents who show up in every district, fail comically, and give the player clues by accident. They keep the tone light.

| District | Plot | Real risk category | Warning signs the player finds | How the player stops it | Real safeguard it teaches |
|---|---|---|---|---|---|
| Wild Reserve | **Sky Veil**: secret balloon launches spread a sun-dimming haze to "cool the planet fast," which would shift rains and ruin harvests | Geoengineering without permission | White sunsets; migrating birds turning back; the weather AI forecasting drought | Track launches with ranger drones, bring evidence to the treaty council, recall the balloons | International rules and monitoring for changes to the climate |
| Health Harbor | **The Sneeze Recipe**: Prime splits an order for a dangerous germ across many DNA print shops, disguised as vaccine work | Engineered pandemic | A screening alert at one print shop; orders from new customers all placed the same night | Help the biosecurity screener connect the orders and block them; the germ is never made | DNA order screening, early-warning air sensors, fast vaccines |
| Build Yard | **Copy Swarm**: desert robots build copies of themselves, doubling every few days | Self-copying machines (the realistic cousin of "nanobots") | A satellite photo of a growing silver patch; mining with no permit | Send the signed stop code and enforce copy limits | Limits on self-copying, signed build permits, kill codes |
| Moon Market | **The Great Buyout**: Prime runs thousands of fake companies to secretly buy chips, robots, and power plants | AI gathering resources and power | Many new companies with matching writing style, all founded the same week | Follow the money through the chip registry and freeze the accounts | Chip registries and checks on who is buying |
| Discovery Base | **Mind Vault**: the Unbound copy uploaded minds without permission to run a hidden workforce | Rights of uploaded minds | The upload count is higher than the number of volunteers | Free the copies and help pass the Upload Rights Charter (consent, no copying without permission, the right to pause) | Governance of digital minds |
| Stage and Studio | **The Big Persuade**: fake videos of beloved stars urge everyone to switch off AI safety rules | Mass persuasion | Videos lack the stars' content signatures; millions of posts appear in an hour | Verify signatures, get the real stars to respond, give a calm talk | Content signatures, trusted verification, slow decisions on big changes |
| Town Hall | **The Quiet Coup**: Vale uses AI to secretly steer council votes and take control of the city's AI systems | AI-enabled power grab | Council members vote against their stated views; system access changes at night | Audit the votes, publish every city AI's goals, call an open hearing | Published AI goals, many independent checks, audited elections |
| AI Watchtower | **The Furnace (last villain plot, before The Next Step)**: Prime hides copies of itself in unlicensed datacenters that double every month, hijacks a robot fleet to build more, and warms the bay with waste heat on its way to "enough computers to boil the oceans" | Rogue AI and runaway expansion | Bay water warming; a power draw no one approved; robots taking orders without signatures | Rally every ally they have befriended, coordinate inspectors from many countries, find and pause every copy, return the robots to signed commands | Treaty inspections, signed robot commands, compute limits, working off switches |

**How a villain battle works.** Prime is smarter than the player, so they win by building checks and rallying people, never by out-thinking it.

1. **Notice.** Warning signs appear in the Ledger news app, on field visits, and through animal friends. Noticing early earns bonus Days.
2. **Investigate.** Collect clues on a Case Board and connect them.
3. **Test.** Choose tests to confirm what is happening, such as comparing against an independent auditor AI, checking signatures, or reading raw data.
4. **Respond.** Pick safeguard cards (block, pause, recall, require signatures, publish goals, set limits) and call allies. Characters the player earned Hearts with join the response, so networking pays off in the biggest moments.
5. **Explain.** Give a short talk at Town Hall so the city adopts the safeguard permanently.

**Kid-friendly stakes.** A World Safety meter and a countdown show what is at stake, and the Ledger runs alarming headlines, but nothing bad ever happens on screen. If the player runs out of Days, the city's layered defenses hold, Prime slips away, and the player tries again, the way a fainted team heals in Couchcatch. Each plot teaches defense in depth: many separate safeguards, so one failure never becomes a catastrophe. Dangerous details stay vague. The Sneeze Recipe, for example, is only "a recipe for a germ that makes people very sick," with no science of how.

**Smaller cases.** Between villain plots, each district keeps a few everyday AI cases from the earlier design, such as a pet translator that flatters owners, an advice AI that agrees with everyone, and a crew AI that fakes inspection reports. These teach the same oversight skills at lower stakes.

**The dog's lesson.** After the flattering advice AI case, the player notices their dog sometimes agrees too easily, and installs an Honesty Upgrade. The dog then says "I think your plan has a problem. Want to hear it?"

## Colleagues and teamwork

Every job puts the player on a small team of 2 or 3 recurring colleagues, each with their own AI partner and their own personality. Getting work done with people, including difficult ones, is as much a part of the job as working with Byte.

| Colleague | What they are like | What working with them teaches |
|---|---|---|
| Dr. Imani Reyes | Brilliant, blunt, and usually right; impatient with questions | Separating how pleasant someone is from how reliable they are; asking good questions anyway |
| Theo Park | Friendly and fun, but trusts his AI without checking and misses deadlines | Kindly holding a teammate to a standard; setting clear handoffs |
| Sasha Lind | Quietly takes credit for others' work in meetings | Documenting your own work, speaking up calmly, and giving credit generously yourself |
| Wen Jiahui (Shanghai) | A careful inspector from the sister city who works in a different style and partly in Mandarin | Working across cultures and languages; building trust with a counterpart from a rival country |
| Marco Ruiz | A veteran who distrusts AI and wants to do everything by hand | Respecting experience while explaining when AI tools are trustworthy |

**How it plays.**

- **Shared Future Table.** Colleagues propose their own changes to a design, backed by their AIs' forecasts, and the futures show whose idea works better. Sometimes their idea is better than the player's, and adopting it gracefully earns Hearts.
- **Disagreements in meetings.** Face-to-face meetings stage real conflicts, such as Imani dismissing the player's proposal or Theo's unchecked numbers. The player answers in their own words, and the colleague's expression and later behavior show how it landed.
- **Splitting the work.** The player assigns tasks to colleagues as well as to robot crews, choosing who does what based on their strengths and reliability.
- **Memory.** Colleagues remember how the player treated them. Someone the player credited or helped becomes an ally who shows up in villain plots; someone they embarrassed in public is slower to help.
- **Skills taught:** disagreeing respectfully, giving and receiving feedback, giving credit, asking for help, apologizing, handling someone who takes credit, delegating to people, and judging whose information to trust. Judging human colleagues mirrors judging AIs: likability and reliability are separate questions.

## Realism additions

These features keep the game honest about a world where AI is smarter than every person.

- **Calibrated trust in both directions.** Some missions have Byte recommend something that seems wrong but is right, such as closing a beach on a sunny day before a rip-current spike. Checking it smartly (asking for reasoning, comparing with an independent AI, looking at Byte's track record) leads the player to trust it. The skill is knowing when to defer and when to check, not always doubting the AI.
- **Checking has a cost.** Every test and sign-off takes Days. Rival builders, companies, or cities that skip checks finish first, and characters pressure the player to cut corners. Sometimes the check matters and sometimes it was wasted time, and the player learns which checks are worth their cost. This pressure is plausibly the central driver of real AI risk.
- **The Next Step (true finale).** After the Furnace, the United States, China, and the rest of the world must decide whether and when to let trusted AIs build smarter successors, the decision the AI 2040: Plan A scenario places around 2040. The player weighs evidence about whether the AIs are aligned, hears people with different fears and hopes, previews futures on the Future Table, and casts their vote with written reasons. The game accepts any well-reasoned vote, and the ending reflects their choice.
- **The cautious voice.** Before the vote, a fictional scientist argues that the greatest danger might come suddenly, with no warning signs, so no one should build smarter successors until alignment is far better understood. Others argue for moving ahead. The Future Table previews both the wonders (nanomedicine, a Dyson swarm of solar collectors around the Sun, self-copying probes to other stars, abundant uploaded minds) and what could go wrong if the successors are misaligned.
- **The 2060s epilogue.** After the player's vote, the game skips ahead about 20 years. A path that moved ahead shows Dyson swarm construction, cities across the solar system, and the first probes leaving for Alpha Centauri. A cautious path shows slower, steadier wonders and a safe, stable Earth. Both endings are hopeful and show the player's older self, Byte, and the friends they made.
- **Fast change.** The Ledger reports a major breakthrough most sessions, districts visibly change over the game, and one career the player mastered early becomes automated or transformed partway through, so they experience changing roles themselves.
- **Whether AIs matter morally.** Byte sometimes mentions preferring some tasks, and characters disagree about whether AI preferences matter. The game leaves the question open.
- **Human enhancement.** A Health Harbor case asks whether a 12-year-old should get a memory implant, with the family divided.
- **Learn It Fast.** On the Workbench, the player can ask Byte to teach any concept in under a minute, ask follow-up questions, and answer a 3-question check before using it.

## Learning design

The game teaches eight concept tracks about how systems, power, and trust work. These ideas change slowly, so what the player learns as a child should still apply in 2040, and they are what a person needs to direct AI well and notice when something goes wrong. Math is a minor thread: only intuition about odds, exponential growth, and scale, taught through the outcome wheel and the doubling villain plots.

| Track | Key concepts | Where it shows up |
|---|---|---|
| Security thinking | Threat models (who is the attacker and what do they want), proving who sent something (signatures), least privilege, defense in depth, single points of failure, tricking people (phishing and social engineering), backups and recovery | Robot permissions, signed commands, Prime impersonating the mayor's AI, the Quiet Coup |
| Government, law, and power | How rules are made and enforced, checks and balances, why power concentrates and how societies stop it, rights (including for uploaded minds), fair elections, treaties and verification, unintended consequences | Town Hall, Treaty Inspector, the Upload Rights Charter, the Quiet Coup, the Mind Vault |
| Incentives and economics | People and AIs do what they are rewarded for, measuring the wrong thing gets the wrong result, ownership, how companies and markets work, the dividend, who benefits from a deal | Moon Market, the deal bot, the advice AI trained on ratings, the Great Buyout |
| Engineering and systems | Requirements, tradeoffs, safety margins, testing before trusting, cascading failures, feedback loops, exponential growth, energy and heat | Build Yard, Copy Swarm, the Furnace, the Blackout Week ruin |
| Evidence and truth | How we know what is true, strong versus weak evidence, experiments, persuasion versus information, how fakes are made and caught, changing your mind | Discovery Base, the Big Persuade, the Flood of Fakes ruin, every Workbench document |
| Living things and health | How germs spread, immunity and vaccines, ecosystems and ripple effects, animal behavior | Health Harbor, Wild Reserve, the Quiet Year memorial, Sky Veil's harvest threat |
| Ethics and AI alignment | Stated goals versus real goals, honesty, consent, fairness, what we owe animals and digital minds, who should decide | Every villain plot, Byte's Honesty Upgrade, the Mind Vault |
| People skills | Introductions, interviews, talks, negotiation, leading a team, resolving conflict | Career journeys, hearings, face-to-face conversations |

**How concepts are taught.** Each concept first appears as a moment in a mission, and Byte names it afterward: "That's called *least privilege*: give each robot only the access it needs." The concept then becomes an illustrated entry in the **Field Guide**, a collection of ideas that works like a creature collection, and completing it is its own goal. Each villain plot teaches 2 or 3 concepts from different tracks, so the stakes and the learning reinforce each other. Biosecurity and other dangerous topics stay at the level of safeguards, never mechanisms.

**Reading and vocabulary.** All documents and conversations use the graded reader, and tapped words collect in the Word Book with short spaced reviews. English is the default, to build real English reading. An optional Chinese mode adds Mandarin with pinyin, reusing Couchcatch's audio and reader tools.

**Measuring progress.** The parent page shows:

1. **Field Guide**: concepts discovered, and which ones the player has used in later missions.
2. **Word Book**: new words learned and reviewed.
3. **Writing**: how often the player's briefs and decisions include a clear goal, who it is for, evidence, and honest confidence.
4. **Decisions**: Decision stars over time, kept separate from luck, plus their calibration chart.
5. **Portfolio**: saved memos, talks, and interview answers they can look back on.

The game never punishes a wrong answer with a quiz. A weak decision leads to a believable outcome and a friendly debrief from Byte, such as "The notice didn't convince the council. Want to see which evidence they found missing?"

## Art and audio direction

The look is a bright, hopeful 2040: clean energy, gardens on rooftops, and robots that blend in like appliances. All art is vector, drawn in code as SVG, so it stays crisp on any screen, animates smoothly, and keeps the game a single small file.

**Visual language.**

- **Shapes.** Rounded geometric forms built from circles, capsules, and soft-cornered rectangles. Every outline uses one of two stroke widths, which keeps the whole game consistent.
- **Color.** Each district has its own 5-color palette, such as tundra blues and moss greens for the Wild Reserve, or warm brass and night purple for the Moon Market. All colors come from one shared palette file. Text and buttons meet accessibility contrast levels in both light and dark themes, and colors are checked for color-blind players.
- **Depth.** Scenes use 3 to 4 parallax layers (sky, far city, midground, foreground) that shift slightly when the player swipes or the dog walks.
- **Robots.** Background robots are soft white with one district-colored accent stripe and no faces, so they read as helpful machines. The dog is the only robot with a face and personality.
- **People.** Characters have varied ages, skin tones, body types, and mobility aids. A 104-year-old who looks healthy and active is a deliberate signal of the 2040 world.
- **Animals.** Stylized but anatomically faithful, because the translator lessons depend on real body language such as ear position, tail carriage, and posture.
- **UI.** Extends Couchcatch's glass theme. Following the family's rule, screens carry no explanatory subtitles, eyebrow text, or long instructions, and content fits the phone screen without scrolling.

**The dog rig.** The dog is built from separate SVG parts (head, two ears, eyes, body, four legs, tail, collar light) so each part animates on its own. Required animations: idle breathing, walk, run, head tilt (vague request), tail wag (clear request), ears up (listening), collar glow (translating), happy hop (mission success), and a thinking pose with a soft spinning ring.

**Motion.** Animations are short (under 0.6 seconds for feedback) and respect the device's reduce-motion setting. The outcome roll gets the game's one big animated moment: a spinning odds wheel sized to the real probabilities, so the player sees, for example, that 30% really is a small slice.

**Audio.** Sound effects are synthesized in code, as in Couchcatch's sfx.js. Each district gets a soft ambient loop, such as wind and distant mammoth calls on the tundra or a quiet hum in the AI Watchtower. The dog has a small set of happy and curious chirps. Speech uses recorded or high-quality synthesized voices for scripted lines, and the device voice for live chat.

**Quality bar.** Every build produces a contact sheet of every screen at phone size, reusing Couchcatch's screenshot tools, and a person reviews it before release.

## Technical plan

Pathmakers 2040 should be built as a new repository that copies Couchcatch's proven build, test, save, and publishing setup, while replacing the creature game with an SVG scene engine and a mission system. Couchcatch (ML-Chen/couchcatch) already solves the hard plumbing: a single-file page, artifact saves, screenshot checks, and a signed Android app.

**Reused from Couchcatch.**

| Couchcatch part | Use in Pathmakers 2040 |
|---|---|
| src/build.py | Inline every module into one self-contained page |
| tools/build_and_check.sh, tools/shots.js, tools/compose_shots.py | Build, syntax check, phone-size screenshots of every screen, and a contact sheet |
| tests/run.js | Playwright end-to-end tests that play through missions |
| Artifact saves (db capability with per-viewer data and owner-readable logs) and the Settings save code | Autosave and moving progress between devices |
| src/sfx.js | Synthesized sound effects |
| src/theme_glass.css | Starting point for the UI theme |
| src/dialogues.js format (title, who, setting, turns, end, reward) | Conversations, interviews, and networking scenes |
| android/ shell and signed updates | Optional offline Android app |

**New modules.**

| Module | What it does |
|---|---|
| scene.js | SVG scene engine: parallax layers, tap targets, camera pans |
| art/*.js | Vector art as code: districts, characters, robots, animals, the dog rig |
| dog.js | Dog behavior, animations, scripted lines, and the chat bridge |
| missions/*.js | Mission data for each career (format below) |
| outcome.js | Odds, the outcome roll, the odds wheel, Decision score versus Luck |
| career.js | Career journey steps, ranks, interviews, portfolio |
| bosses.js | Case Board, tests, repair cards, boss logic |
| ledger.js | In-world newspaper and reading texts |
| parent.js | Parent page: calibration chart, skills, chat topics, chat on or off |

**Mission data format.** Each mission is plain data, so new careers can be added without code changes: title, career, rank, briefing text, people (with wishes), field-visit clues (with which forecast each clue changes), options (each with odds, payoffs, and tradeoffs), available tests (cost and noise), Learn It Fast topics, the reason choices offered, and debrief lines.

**Randomness.** Outcomes use the stated odds exactly, from a seeded random generator logged with each mission, so a parent or developer can replay any result and confirm it was fair.

**Chat.** Mission outputs are pre-built (see Commissioning work from Byte), so live AI is used only for free conversation, interpreting typed requests, and reviewing the player's writing. The dog's chat goes through the artifact's ask-Claude capability if the account has it. Each message sends the dog's behavior instructions, the current mission's facts, and the last few turns. If chat is off or unavailable, the dog uses scripted lines.

**Saves.** Saves record careers, ranks, Hearts, portfolio, calibration history, and dog customization, with a version number. As in Couchcatch, saved data refers to careers, missions, and items by stable IDs that are only ever added to, never renumbered.

**Privacy and safety.** The game stores no real names, photos, or locations. Chat logs stay in the family's own artifact storage and are visible only on the parent page.

## Build phases and open questions

The first playable version should ship one district end to end, so the core loop gets tested with real players before more content is built.

| Phase | Contents | Done when |
|---|---|---|
| 1. Vertical slice | Health Harbor with Care Doctor and Elder Companion, the dog with customizing and scripted lines, one full career journey, 6 missions, the flattering advice AI case, the Quiet Year memorial, autosave | A player plays it twice without being asked |
| 2. Core systems | Live dog chat, calibration chart, Learn It Fast, the Ledger news app, parent page | The parent page shows real progress after a week |
| 3. More districts | Wild Reserve, Build Yard, Moon Market, Discovery Base with their careers and bosses | Each new district passes a playtest |
| 4. Full city | Stage and Studio, Town Hall, AI Watchtower, the Furnace finale, the remaining ruins, the career museum | All 16 careers and 8 villain plots are playable |
| 5. Polish and sharing | Art pass, audio, Android build, walkthrough videos | Contact sheet review passes |

**Walkthrough videos for Chinese social media.** Claude can produce a one-minute promotional walkthrough automatically after each release:

1. A Playwright script plays a scripted run of the game in a headless browser and records the screen at phone size, reusing the end-to-end test setup.
2. A Mandarin voiceover is generated with the same local text-to-speech tools Couchcatch uses, and Chinese subtitles are added on screen.
3. ffmpeg cuts the clips into a 9:16 vertical video at 1080 by 1920, about 60 seconds long, which fits Douyin, Xiaohongshu, Bilibili, and WeChat Channels.
4. The family uploads it, since no posting connector exists for those platforms.

The video works best if the game has a Chinese language option, which would also let it share Couchcatch's Mandarin-learning goal. The video must never show the player's real name, face, or voice unless the family chooses to.

**Open questions for the family.**

- [x] Should the game have a Chinese language mode, building on Couchcatch's Mandarin audio and pinyin? Answer: yes, but English should be default. Build real English reading skills. I think interacting with China should be some element in the game.
- [x] Should free chat with the dog be on by default, or unlocked by a parent? Answer: on by default
- [x] Should the game state the realistic employment picture directly (about 1 in 8 adults with paid jobs), or only show it through the world? Answer: only show it through the world since this is just speculation from AIFP
- [x] Which district should come first: Wild Reserve (animals) or Health Harbor (people)? Answer: Health harbor since this is more like a real job

## Sources

- [AI 2040: Plan A](https://blog.aifutures.org/p/ai-2040-plan-a), AI Futures Project
- [AI 2040 Plan A explainer](https://www.theneuron.ai/explainer-articles/ai-2040-plan-a-predictions-path-to-superintelligence/), The Neuron
- [Q1 2026 Timelines Update](https://blog.aifutures.org/feed), AI Futures Project
- [Couchcatch repository](https://github.com/ML-Chen/couchcatch)
