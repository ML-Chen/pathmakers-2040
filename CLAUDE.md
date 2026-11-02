# Pathmakers 2040 — notes for working on this repo

A phone-first browser game for kids who are strong readers (about 7th-grade level) set in a hopeful 2040 where superintelligent AI runs big institutions. The player does real careers with Byte, a robot-puppy AI partner. The full design spec is the "Pathmakers 2040 — Game Spec" Claude Doc.

## Build and check
- `python3 src/build.py dist/pathmakers.html` inlines every module into one self-contained page.
- `node tools/shots.js dist/pathmakers.html /tmp/pm-shots` plays through every screen at 390x844 and saves screenshots plus errors.txt. Look at them after every change.
- `node tools/parent_shots.js dist/pathmakers.html /tmp/pm-parent` screenshots the progress page empty, after one real mission, and with a longer sample history.
- `python3 tools/make_audio.py` records any new spoken line (see tools/AUDIO.md).

## Module map (src/)
| File | What it does |
|---|---|
| game.html | Page template with inline markers |
| style.css | All styles and animations |
| art.js | Vector helpers, fallback scenes, mini people, Future Table vignettes |
| characters.js | Anime portraits, Byte the puppy, mini people (overrides art.js) |
| paint_boston.js | Painted canvas backgrounds (PAINT[key].paint/overlay) |
| content_boston.js | Glossary, cast, conversations, documents (one picture per sentence), Future Table model, Field Guide |
| infog.js | Byte's animated infographics (VIZ kinds used by documents) |
| audio.js | Prerecorded voice clips keyed by "voice|text" (generated) |
| game.js | State, saving, screens and the mission flow |
| parent.js, parent.css | Grown-ups' progress page (Menu → For grown-ups) and the records it reads: S.history, wordLog, ideaLog, chatLog, chatOff |

## Rules the family asked for
- Realistic superintelligence-era 2040 (AI 2040: Plan A world). The AI is excellent; humans add goals, consent, local knowledge, judgment, accountability.
- Real places by default; every catastrophe and villain lair is fictional. No real living people.
- Every document sentence gets its own picture or looping animation; every hard word or phrase gets a tap definition.
- Cute anime-style characters; Byte is a puppy first, robot second. Art at least as good as Couchcatch.
- No clutter: no explanatory subtitles, eyebrow text or long instructions.
- Never ask for or store the child's real personal details.
