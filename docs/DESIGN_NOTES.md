# Design notes: decisions and feedback since the spec

These notes record what the family asked for while playing builds, and the decisions that followed. They override docs/SPEC.md where the two disagree. Add to this file when new feedback changes how the game should work.

## The world and the AI

- **Superintelligence is mundane.** By 2040, AI runs hospitals, cities and companies, and nobody marvels at it. People talk normally about their day. An early draft had a nurse say the hospital AI "diagnosed it in under a second"; that was cut as too conspicuous. Background AI shows up the way electricity does: present, reliable, rarely mentioned.
- **The AI is not dumb.** No gameplay is built on catching the AI in an obvious mistake. Challenges come from missing context, tradeoffs, uncertainty, other people's goals and other people's AIs.
- **Byte is genuinely helpful.** A version of Byte that refused to give an opinion felt wrong ("too unhelpful for a superintelligent AI"). Byte now raises the key consideration first, asks what matters to the people involved, and then recommends a plan tied to those goals. Byte does not always hand over the answer, and the family liked that balance.
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

## Decisions, consent and writing

- The consent screen includes a plan picker, so the player explains the plan they actually chose rather than whatever was last on the table.
- The written decision is checked generously: any reason in any wording counts as a reason ("Oh come on, I gave a reason" was a fair complaint about keyword matching). When the artifact's AI is available, the check grades by meaning.
- The game teaches empathy and consent through what characters say back, not through lectures.

## Characters and art

- Cute anime characters with natural proportions; references the family gave were Love and Deepspace and Ace Attorney character art. Avoid simple geometric people.
- Common mistakes the family caught: floating heads on long necks, braids drawn as circles, violins drawn as ovals. Draw real shapes with Bezier curves.
- Byte is a puppy first and a robot second: fluffy, expressive, petable.
- Painted backgrounds should be at least as good as the family's Couchcatch game. The Boston river reflection at night set the bar.
- No clutter: no explanatory subtitles, eyebrow text, disclaimers on the title screen, or instructions like "Pick a made-up name."
- Scenes should feel alive: props jiggle when tapped, Byte can be petted, and passers-by say things.

## Voices and sound

- Every spoken line uses a prerecorded voice (Kokoro). Never use the browser's built-in speech; it sounded terrible.
- Only Byte may make electronic babble; humans without a recorded clip stay silent.
- Voices should sound excited enough for a video game. Maya must sound like an 11-year-old, not an adult woman (the current pitch-shifted voice is still being improved).
- Byte has a female and a male voice, chosen at setup.
- Pronunciation fixes go in `PRONOUNCE` in tools/make_audio.py (for example, past-tense "read").
- Music comes from the family's music-lab tracks, rendered and crossfaded per scene. Synthesized music sounded dissonant and was removed.

## Privacy

- Never ask for or store a player's real personal details.
- The repo and its docs must not contain identifying information about any real child.
