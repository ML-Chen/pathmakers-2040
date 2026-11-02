# Pathmakers 2040 — notes for working on this repo

A phone-first browser game for kids who are strong readers (text is written at about a 7th-grade level), set in a hopeful 2040 where superintelligent AI runs big institutions. The player does real careers with Byte, a robot-puppy AI partner.

Read these first: docs/SPEC.md (the full design spec), docs/DESIGN_NOTES.md (decisions and feedback since the spec, which override it), docs/MISSIONS.md (how to add missions, scenes and infographics in parallel) and docs/WORKBOARD.md (who is building what right now; claim your work there before starting).

## Build and check
- `python3 src/build.py dist/pathmakers.html` inlines every module into one self-contained page.
- `node tools/shots.js dist/pathmakers.html /tmp/pm-shots` plays through every screen of the Maya mission at 390x844 and saves screenshots plus errors.txt. Look at them after every change. `tools/mission_shots.js` and `tools/mission_deep_shots.js` cover every mission (see docs/MISSIONS.md).
- `node tools/paint_preview.js OUT [scene]`, `node tools/char_preview.js OUT` and `node tools/viz_preview.js OUT` render the core painted scenes, the cast and the core infographics. They read only the core files, not `src/scenes/`, `src/missions/` or `src/viz/`.
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
| game.js | State, saving (browser storage, plus the viewer's private artifact database and `PM1-` save codes), chat with Byte (the artifact `sample` capability, with scripted replies as a fallback), screens and the mission flow |
| props.js | Tappable props and passers-by for each scene key |
| music.js, music_tracks.js | Pre-rendered music tracks per scene, synthesized sound effects and Byte's babble |
| parent.js, parent.css | Grown-ups' progress page (Menu → For grown-ups) and the records it reads: S.history, wordLog, ideaLog, chatLog, chatOff |

## Rules the family asked for
- Realistic superintelligence-era 2040 (AI 2040: Plan A world). The AI is excellent; humans add goals, consent, local knowledge, judgment, accountability.
- Real places by default; every catastrophe and villain lair is fictional. No real living people.
- Every document sentence gets its own picture or looping animation; every hard word or phrase gets a tap definition.
- Cute anime-style characters; Byte is a puppy first, robot second. Art at least as good as Couchcatch.
- No clutter: no explanatory subtitles, eyebrow text or long instructions.
- Never ask for or store the child's real personal details.
