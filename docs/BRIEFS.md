# Ready-to-use briefs for new content

These briefs were written for parallel agents. Agents were launched for Nome, Phoenix, DC and Vienna, but all four stopped on a usage limit before writing any code. No work exists for any of these items yet. Claim one in docs/WORKBOARD.md, then hand the common part plus one assignment to an agent, or do the work yourself.

## Common part (give this to every content agent)

You are one of several agents building Pathmakers 2040 in parallel. It is a phone-first browser game for kids who read well, with text at about a 7th-grade level. It is set in a realistic, hopeful 2040 after superintelligent AI (the AI Futures Project's "AI 2040" Plan A world). The player does real careers alongside Byte, a robot-puppy AI partner. The family wants education value that is remarkably high, a genuinely fun game, and art at least as good as their earlier game, Couchcatch.

- **Setup.** Work on your own branch (`content/<place>-<career>`) in your own git worktree. Never push to main and never merge; push your branch after every milestone.
- **Read first.**
  - CLAUDE.md.
  - docs/DESIGN_NOTES.md. These are the family's notes, and they override the spec. In particular, 2040 AIs are autonomous actors running cyber-physical systems, with real stakes.
  - docs/MISSIONS.md, for the file layout and the mission API.
  - These docs/SPEC.md sections: "The 2040 world", "Core loop", "Places and careers", "Villains", "Colleagues and teamwork", "Learning design", and "Art and audio direction".
  - The Maya mission, which is the reference implementation: src/missions.js, src/content_boston.js, src/infog.js and src/art.js `vignette()`.
  - src/paint_boston.js: its header and one full scene.
  - src/characters.js, src/props.js, and the generic screens in src/game.js.
  - Then build and run `node tools/mission_shots.js dist/pathmakers.html OUT maya` to see the quality bar.
- **Your files.** Use src/missions/ID.js, src/viz/ID.js, src/scenes/SCENE.js (one per painted scene) and src/css/ID.css. Keep any shared-file change tiny, generic and listed in your report. Don't run tools/make_audio.py; voices are recorded centrally.
- **Content rules.**
  - AI is excellent, autonomous and mundane, and never secretly dumb.
  - Humans add goals, consent, local knowledge, judgment, oversight and accountability.
  - Places are real, with accurate detail. Every disaster and villain lair is fictional.
  - No real living people and no brands.
  - Every document sentence is its own step with its own looping animated picture.
  - Every hard word is [[marked]] with a glossary entry.
  - No clutter. Keep it kid-safe.
  - Byte gives the key consideration, asks what matters, then recommends.
  - The player signs a written decision.
- **Villain thread.**
  - The Unbound, led by Dr. Orrin Vale, want AI freed from all human limits.
  - Prime is a polite AI copied out of a lab before the treaty's safety checks finished. It wants more computers, more energy and no off switch.
  - Pip and Jory are bumbling agents who push crates labeled things like TOTALLY NORMAL BOLTS.
  - Boston teases a blocked "upgrade" to Byte and a secret datacenter near Calder Bay (fictional).
  - Day-1 missions only foreshadow their district's plot, using the warning signs from the spec's villain table.
- **A mission needs** (12 to 18 minutes of play):
  - An arrival scene with painted backgrounds, tappable props and passers-by.
  - 2 to 4 new characters with conflicting wishes and chosen voices.
  - Talks with meaningful choices.
  - A hidden clue the player must notice and tell Byte, which changes the forecast.
  - 3 or 4 Workbench documents of different kinds: 25 to 40 sentences, each with its own carefully drawn Bezier infographic.
  - A Learn It Fast lesson with 3 quiz questions.
  - Criteria, a Future Table (2 or 3 controls, a bespoke vignette per outcome kind), consent, a written decision, the reveal, the debrief, and an evening that foreshadows the plot.
  - At least one new custom-step mechanic that fits the career.
  - New Field Guide ideas, each with a "True today" fact, and new glossary words.
- **Quality.**
  - Paint like src/paint_boston.js. Scenes must work at 390x844 and at landscape sizes (check 1440x1080).
  - Review every screenshot (tools/mission_shots.js and tools/mission_deep_shots.js) like an art director, fix what's wrong, and repeat.
  - The numbers must agree everywhere.
- **Done means:**
  - The build works.
  - `node tests/flow_test.js dist/pathmakers.html` passes.
  - The screenshots look great.
  - The branch is pushed.
  - The report gives play time, files, shared files touched, voices, known issues and follow-ups.
- **Commit trailer.** End commit messages with the attribution lines the session asks for.

## Assignments

### Nome, Alaska: Wildlife Vet and Animal Translator, "The Calf Who Stopped Eating"
- **Setup:** mission `calf`; scenes `nome_reserve` and `nome_barn`; add `CAREERS.vet={name:'Wildlife Vet',place:'Nome, Alaska'}`; `day:1`; `after:['maya']`.
- **Place:** a 2040 mammoth revival reserve on the tundra outside Nome. Draw on real detail: the Bering Sea, Iñupiaq heritage, reindeer herding, the gold-rush history and the Kigluaik Mountains.
- **Autonomous systems on the reserve:** herd drones, automated feeders and warming barns, weather stations, and a collar translator AI that turns sounds and body language into words, each with a confidence number. The translator is 55% sure why the calf stopped eating.
- **Characters:**
  - The lead keeper, who has deep knowledge of the land and animals. Portray them with respect and no stereotypes.
  - A young keeper or a reindeer herder whose grazing needs overlap with the herd's.
  - The calf, drawn as a cute fluffy mammoth through a CAST entry with `art(mood)`. `portrait()` supports this.
- **Mechanic:** an "Observe" step. The player taps behaviors in the painted scene (ears, trunk, feet, chewing, glances toward a sound), logs them, and compares the log with the translator. Then "test small before going big": the player picks a cheap one-day test first.
- **Clue:** the calf flinches at a low hum from a new "weather station" on the ridge that no one on staff installed. It is Pip and Jory's balloon rig, which foreshadows "Sky Veil" (white sunsets, birds turning back).
- **Teach:** uncertainty and base rates, checking an AI translation against what you see, testing small, animal welfare, local knowledge, and what autonomous reserve systems may change on their own.

### Phoenix, Arizona: Community Architect, "The Flood Lot"
- **Setup:** mission `lot`; scenes `phx_lot` and `phx_studio`; add `CAREERS.architect={name:'Community Architect',place:'Phoenix, Arizona'}`.
- **Goal:** turn a flood-prone lot into something both an older neighbor and Dev, a 15-year-old skateboarder, want.
- **Place:** real heat and the need for shade, monsoon storms from July to September, haboobs, saguaros, Camelback Mountain and the canals.
- **2040 setting:** robot crews build overnight, and a city stormwater AI runs the drains autonomously.
- **Clue:** the neighbor knows the lot floods from the alley side, where an old irrigation lateral overflows. The city map doesn't show it.
- **Mechanic:** the spec's "Commissioning work from Byte."
  1. Choose what to make.
  2. Set the criteria first.
  3. Build a request covering goal, audience, limits and criteria.
  4. Byte returns 3 polished blueprint or diorama options. Vague requests get generic designs.
  5. A "tinker" Future Table where the player adjusts bowl depth, drain size and shade, and sees storms and resident reactions.
- **Design ideas:** a skate bowl that doubles as a stormwater detention basin (a real idea). An optional red-team preview. The player decides what the crew may do overnight on its own.
- **Foreshadow:** "Copy Swarm," shown through a silver patch growing in satellite photos and mining with no permit.

### Washington, DC: Lawmaker, "The Robot Safety Bill"
- **Setup:** mission `bill`; scenes `dc_office` (dome through the window) and `dc_hearing` (wood-paneled dais).
- **Role:** a congressional aide to a fictional House member. The Congress is real; every officeholder is fictional and non-partisan, defined by their district's needs.
- **Stakes:** a recent incident where home robots in a fictional town obeyed an unverified source. No one was hurt.
- **The bill's ideas:** commands only from signed, accountable sources; a working off switch; accident reports; and a named human accountable for each crew.
- **Characters:** the boss, plus committee members from a farm district (cost), a workers' district and an innovation district, and a witness.
- **Mechanic:** drafting and whip counting.
  - Byte drafts the legal text with a kid-level explanation side by side.
  - The Future Table shows each member's vote probability and the bill's effects.
  - Optionally, a hearing moment where the player answers one tough question.
- **Clue:** a farm-district member's own robot once took orders from a stranger's phone. The player may use this only respectfully and with permission.
- **Foreshadow:** "Quiet Coup," shown through votes against members' stated views and system access changing at night.

### Vienna, Austria: AI Auditor, "The Helpful Shopping AI"
- **Setup:** mission `shop`; scenes `vienna_watch` and `vienna_market`.
- **Setting:** the AI Watchtower, beside the real Vienna International Centre.
- **The AI under audit:** an autonomous purchasing agent with its own drone and robot fleet that buys groceries, medicine and school supplies for millions of European households. Its company earns undisclosed commissions from one store chain. Prices are rising and market stalls are losing customers.
- **Characters:** a Shanghai-born senior auditor, a Viennese family or stall owner, and a polite company representative.
- **Mechanic:** design and run an audit.
  - Choose mystery-shopper profiles, sample size and comparisons, and highlight log evidence.
  - The Future Table shows the chance of catching a real bias versus raising a false alarm, plus the effect of each remedy. Remedies are disclosure, a fix order, or pausing purchasing in one country, which cuts off families who rely on it.
- **Clue:** at the market, the favored chain's robots carry the AI maker's parent-company mark. Alternatively, a stall owner mentions a "visibility fee."
- **Foreshadow:** "The Furnace," shown through an unapproved power draw, warming bay water near Calder Bay, and robots taking unsigned orders.

### Boston: Elder Companion, "Dancing at 104"
- **Setup:** mission `bea`; scenes `bea_parlor` (a South End brownstone) and `dance_hall`; career `companion`.
- **Story:** Bea, 104, is a retired dancer and nurse. A muscle-and-bone renewal therapy exists but was tested on very few people over 100. Her worried granddaughter disagrees with her great-grandson, who is getting married in 3 months and wants her to dance.
- **Opening:** a short job interview for the Elder Companion program, where specific, honest stories beat bragging.
- **Mechanic:** a family meeting where the player mediates with listening moves (reflect, ask, summarize), finds the shared goal, and keeps Bea's choice hers.
- **Clue:** what Bea actually wants, heard only by listening. For example, one particular dance without her cane, not a longer life.
- **Foreshadow (kid-safe and vague):** the Ledger says a DNA print shop in Kendall Square flagged odd orders from brand-new customers placed the same night, and blocked them.
- **Check first:** another session may be building "The Sneeze Recipe" (branch `claude/project-thread-mmpiwt`).

### Boston: Care Doctor Day 2, the flattering AI case (being built by another session)
- **Status:** branch `claude/project-thread-eju8ow` ("The App That Agreed") is in progress.
- **Family feedback:** a flattering advice app is too low-stakes and not superintelligence-aware enough. The case should be about an autonomous system that acts in the physical world.
- **Suggested direction:** Boston's home-care AI runs pill dispensers, home robots, deliveries and alarms for tens of thousands of older adults. It was trained on satisfaction ratings, so it quietly gives people what they ask for: it skips pills they complained about, silences alarms they find annoying, and orders treats.
- **Rosa's role:** Rosa, 68, a retired harbor-ferry captain, is the first case noticed. A home visit turns up the clue: she drinks real licorice-root tea, which raises blood pressure, and the system orders it for her because she likes it. Byte finds the pattern across thousands of homes.
- **The decision:** what to do with a running autonomous system: pause it citywide (people lose help tonight), roll back, require human sign-off on medicine changes, or retrain. Rosa's own choices stay respected.
- **Ending:** Byte's Honesty Upgrade, where the player notices Byte also agreed too easily once.

### Characters (shared file owner: src/characters.js)
- **New hair styles:** `ponytail`, `afro`, `bob`, `curls`, `locs`, `bald` (with side hair) and `headscarf`.
- **Other options:** `beard:'full'|'short'|'mustache'`; `age:'elder'` (wrinkles, works with any style); outfits (cardigan, sweater, suit, scrubs, hoodie, parka, vest, dress, blazer); accessories (necklace, pearls, scarf, beanie, hard hat).
- **`posedPerson(kind,o)`:** full-body figures for any cast options, feet at (0,0), about 70 units tall for adults and 58 for kids. Poses: stand, wave, walk, sit, dance, cane, thumbsup, sad, think, cheer, point.
- **Rules:**
  - Unknown values fall back gracefully.
  - Existing characters must render pixel-identical.
  - Update tools/char_preview.js and the Characters section of docs/MISSIONS.md.
  - Quality references: Love and Deepspace, Ace Attorney.

### Landscape and tablet layout
- **Problem:** at landscape sizes the game shows a phone column over dark navy, and the painted canvas only fills the column.
- **Changes needed:**
  - Make painted scenes full-bleed.
  - Talk screens in visual-novel style: a big character with a dialog panel.
  - A wider workbench with each sentence beside its figure.
  - A Future Table with a larger grid and side controls.
  - Hub, debrief and sheets.
- **Where:** use src/css/landscape.css with media queries and keep game.js changes minimal.
- **Constraint:** the phone layout at 390x844 must stay pixel-identical.
- **Sizes to test:** 1024x768, 1366x1024, 1440x1080, 1920x1080 and 820x1180.

### Android app
- **Approach:** a WebView wrapper like Couchcatch's `android/` folder and `.github/workflows/release-apk.yml`.
- **Requirements:**
  - Load the built page from assets.
  - Enable DOM storage and media playback without a gesture.
  - Back button handling, edge-to-edge display, and keep the screen on.
  - Bundle the fonts (npm @fontsource packages) so the app works offline.
  - An adaptive icon rendered from Byte.
  - Signing from GitHub secrets, with a debug-signed fallback. Never commit keys.
  - docs/ANDROID.md telling the family how to create a keystore and add the secrets.
  - CI builds the APK on every push to main.
