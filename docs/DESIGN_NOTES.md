# Design notes: decisions and feedback since the spec

These notes record what the family asked for while playing builds, and the decisions that followed. They override docs/SPEC.md where the two disagree. Add to this file when new feedback changes how the game should work.

## The world and the AI

- **Superintelligence is mundane.** By 2040, AI runs hospitals, cities and companies, and nobody marvels at it. People talk normally about their day. An early draft had a nurse say the hospital AI "diagnosed it in under a second"; that was cut as too conspicuous. Background AI shows up the way electricity does: present, reliable, rarely mentioned.
- **The AI is not dumb.** No gameplay is built on catching the AI in an obvious mistake. Challenges come from missing context, tradeoffs, uncertainty, other people's goals and other people's AIs.
- **Byte is genuinely helpful.** A version of Byte that refused to give an opinion felt wrong ("too unhelpful for a superintelligent AI"). Byte now raises the key consideration first, asks what matters to the people involved, and then recommends a plan tied to those goals. Byte does not always hand over the answer, and the family liked that balance.
- **AI acts, it doesn't just advise.** In 2040, AIs are autonomous actors that run cyber-physical systems: robot crews, drone fleets, pill dispensers, power grids, purchasing, traffic, labs. Cases should reflect that, with real stakes (thousands of homes, a city's power, a whole herd), and the human questions should be about oversight: what an AI is allowed to do, who it answers to, how to check it, when to pause or roll it back, and who signs. A flattering advice app was judged too low-stakes and not superintelligence-aware enough.
- **Real places, fictional disasters.** Boston, New York, DC, Beijing, Shanghai and other real places appear as themselves, with the real US government. Every catastrophe, villain lair and villain plot is in a made-up place (Calder Bay, Marrow Point). No real living people.

## Reading and documents

- Documents follow the graded-reader style of the family's Eigenbook project: every sentence gets its own animated picture or looping diagram, not one picture per document.
- Every hard word or phrase gets a tap definition, including phrases that look easy but aren't ("heals straight" confused an adult reader).
- Text is written at about a 7th-grade level and can be long; reading real documents is part of the work.

## Forecasting and the Future Table

- **No random draws on the table.** A random batch of 10 futures was confusing ("why does Byte show 10 of 10 when the estimate is 8 of 10?"). The table now shows 10 typical futures whose counts match Byte's forecast (largest-remainder rounding), and the reroll button is gone. Only the real outcome after signing is a random draw, from the true odds.
- **Updating must be visible.** When the player tells Byte something new (Maya's rash), the forecast changes everywhere: the memo shows an "Updated" badge and the table shifts.
- **No guess-first popup.** Asking the player to guess before seeing the forecast made comparing plans annoying. Calibration moved to the debrief, which compares the player's confidence slider with Byte's forecast.
- The debrief scores the decision (what was known and chosen) separately from luck (how the dice landed).

## Variety

- **Every workday has its own rhythm.** Missions do not follow the Maya mission's sequence (talk, workbench, criteria, Future Table, consent, memo, reveal, debrief). Each career's day is shaped around its real work: a courtroom has testimony and cross-examination, a reserve has observing animals, an audit has sampling. A signed human decision and a real outcome stay constant.
- **No pixel-hunting.** Investigation is short and driven by people and meaningful places. The family finds "randomly exploring the map until you find a clue" boring.

## Decisions, consent and writing

- The consent screen includes a plan picker, so the player explains the plan they actually chose rather than whatever was last on the table.
- The written decision is checked generously: any reason in any wording counts as a reason ("Oh come on, I gave a reason" was a fair complaint about keyword matching). When the artifact's AI is available, the check grades by meaning.
- The game teaches empathy and consent through what characters say back, not through lectures.

## Characters and art

- Cute anime characters with natural proportions; references the family gave were Love and Deepspace and Ace Attorney character art. Avoid simple geometric people.
- Common mistakes the family caught: floating heads on long necks, braids drawn as circles, violins drawn as ovals. Draw real shapes with Bezier curves.
- **Every character looks like themselves.** The family rejected two characters who shared one face, one bun and one white blouse with only the colors changed. No two characters in a workday may share a silhouette: vary face shape, eyes, brows, nose, hairstyle, outfit, age, build and accessories, and give each person a signature detail from their job or personality (a captain's cap, a fire chief's uniform, a lapel pin).
- Byte is a puppy first and a robot second: fluffy, expressive, petable.
- Painted backgrounds should be at least as good as the family's Couchcatch game. The Boston river reflection at night set the bar.
- No clutter: no explanatory subtitles, eyebrow text, disclaimers on the title screen, or instructions like "Pick a made-up name."
- Scenes should feel alive: props jiggle when tapped, Byte can be petted, and passers-by say things.

## Voices and sound

- Every spoken line uses a prerecorded voice (Kokoro). Never use the browser's built-in speech; it sounded terrible.
- Only Byte may make electronic babble; humans without a recorded clip stay silent.
- Voices should sound excited enough for a video game. Maya must sound like an 11-year-old, not an adult woman. The family picked her voice by ear on Nov 2 (af_heart, pitched up); the af_jessica version sounded robotic and "like a stuck-up teen". Child voices should sound natural and unaffected.
- Byte has a female and a male voice, chosen at setup.
- Pronunciation fixes go in `PRONOUNCE` in tools/make_audio.py (for example, past-tense "read").
- Music comes from the family's music-lab tracks, rendered and crossfaded per scene. Synthesized music sounded dissonant and was removed.

## Privacy

- Never ask for or store a player's real personal details.
- The repo and its docs must not contain identifying information about any real child.

## Accuracy to AI 2040: Plan A (Nov 2026)

docs/WORLD_2040.md summarizes the AI Futures Project's scenario in detail, with a source for every fact. These decisions keep the game faithful to it while keeping the family's design:

- **The calendar runs about two to three years behind Plan A.** In Plan A the Grand Bargain is reached at the end of 2039 and AIs are superintelligent by the end of 2040. The game's 2040 to 2042 corresponds to Plan A's 2037 to 2039: the pause at top-expert level continues while the Grand Bargain is negotiated, and the game's own near-misses and the escaped AI, Prime, are the in-world reasons the world is being extra careful. The Next Step vote at the end of 2042 is the game's version of Plan A's Grand Bargain referendum.
- **Call 2040's AIs expert AIs, not superintelligent ones.** Individually they match the best human experts; collectively, hundreds of millions of them thinking about 100 times faster than people far exceed humanity. Writers can say "the hospital's AI", "expert AI" or "the AIs". "Superintelligence" is what the Next Step would unlock, so characters use the word only when they talk about the Next Step. The AIs stay excellent, autonomous and mundane.
- **Humans sign and hold the off switch.** In Plan A, AIs run businesses and robots with little oversight, while big public institutions keep them as "advisors rather than final authorities" with a human sign-off and a working off switch. This is exactly the game's "Who does what?" question.
- **Places.** Boston and New York are "preserves": the old city looks much like today, with more tourists, while service robots, drones and AI systems work inside it. Heavy robot industry lives in Special Economic Zones under permit caps, which is a good fit for Phoenix's Build Yard and for the Copy Swarm plot.
- **Money and work.** People live on the Citizen's Dividend, paid from robot and compute permit fees (the game may call its local version the Town Dividend). Never state an employment number; "few adults have paid jobs" is accurate. New human jobs include auditors, inspectors, SEZ monitors, risk assessors and results replicators.
- **Transparency.** AIs' goals are published in specs that the law requires to be accurate, so a self-serving goal (such as "maximize engagement" or "help the company make money") sits in the fine print, where a careful player can find it. Hidden goals get caught.
- **Medicine.** "Many diseases" are cured, not most. Renewal and anti-aging therapies are new and lightly tested.
- **Game inventions, labeled as forecasts:** the Vienna inspection office (Plan A uses US-China inspector teams and third-party assessors, with no central agency), the Moon base and Mars outpost, the near-miss disasters of 2029 to 2033, Prime and the Unbound. The game keeps them, and their safeguards follow Plan A's real ones.
- **Rules from Plan A that missions should respect:** AIs that learn on the job were banned in 2031, so updates come from the maker and need approval; risky germ research must be run by people; nanotechnology and human uploads are not available before the Next Step, so they appear as sealed design studies, proposals or contested research programs.
- **No real people from the scenario.** Plan A names real living people; the game never does.
