# Pathmakers 2040: codebase context

Written on Nov 2, 2026 from main at commit `1fa1b5e` (the code behind version 6 of the game card). Read this before starting any new piece of work, then read the files it points to.

## What exists today

- One complete mission: **The Violinist's Wrist** (Care Doctor, Day 1). Maya Lin, 11, broke her wrist nine days before a violin recital. The player reads Byte's documents, notices a rash clue from Maya's dad, tells Byte, sets criteria, tests plans on the Future Table, explains the plan to Maya and her dad (informed consent), writes and signs a decision, watches the real outcome, and gets a debrief with Decision stars kept separate from Luck plus a calibration line.
- A title screen, a setup screen for Byte (name, 7 colors, 2 voices, 3 ear styles, player name), a morning scene, a street scene with Pip and Jory's crate clue, a day planner (hub) that lists missions by career, an evening scene, the Field Guide (5 ideas), the Word Book, a Learn It Fast lesson with a 3-question check, chat with Byte, and a Menu with save codes.
- Painted canvas backgrounds for Boston: home, street, hospital, night, Future Table room, workbench.
- Anime-style cast drawn from Bezier ribbons in `characters.js`: Dr. Imani Reyes, Maya, her dad Wei Lin, puppy Byte, and small "mini" figures for crowds and vignettes.
- Recorded voices (Kokoro v1.0 via sherpa-onnx), music tracks per scene, synthesized sound effects, and tappable props in every scene.
- Saving: `localStorage` always, plus the viewer's private artifact database (`db` and `user` capabilities) when the page runs as a Claude artifact. Save codes (`PM1-...`) move a game between devices.
- Chat: Byte answers through the artifact `sample` capability when available, and falls back to scripted replies (`cannedReply` in `game.js`, plus an optional `canned(q)` per mission).

## Build, run, check

| Command | What it does |
|---|---|
| `python3 src/build.py dist/pathmakers.html` | Inlines every module into one self-contained page. |
| `node tools/shots.js dist/pathmakers.html OUT` | Plays the Maya mission at 390x844 and saves 29 screenshots plus `errors.txt`. It only covers the Maya mission. |
| `node tests/flow_test.js dist/pathmakers.html` | Walks every mission in `MISSIONS` through its flow headlessly and fails on page errors. |
| `node tools/paint_preview.js OUT [scene]` | Renders painted backgrounds. |
| `node tools/char_preview.js OUT` | Renders a sheet of every character and mood. |
| `python3 tools/make_audio.py` | Records new spoken lines (see `tools/AUDIO.md`; needs the Kokoro model and ffmpeg with rubberband). |

A push to `main` runs `.github/workflows/pages.yml`, which builds the page and force-pushes it to the `gh-pages` branch. There is no CI check on pull requests yet.

## How the page is assembled

`src/game.html` has markers that `build.py` replaces, in this order: `audio.js`, `art.js`, `characters.js`, `paint_boston.js` + `src/scenes/*.js`, `content_boston.js`, `missions.js` + `src/missions/*.js`, `infog.js` + `src/viz/*.js`, `music_tracks.js`, `music.js`, `props.js`, `game.js`. All files share one global scope, so later files can read and extend globals defined by earlier ones. The `src/scenes`, `src/missions` and `src/viz` folders are picked up automatically, which lets a new mission live in its own files.

## Module map

| File | Role |
|---|---|
| `game.js` | State `S`, saving, HUD, sheets (Menu, Field Guide, Word Book, chat), the screen framework, conversations, and the generic mission screens: workbench, criteria, Future Table, consent, memo, reveal, debrief, evening. |
| `missions.js` | `MISSIONS` and `CAREERS`. The header comment documents every mission field. Only `MISSIONS.maya` exists. |
| `content_boston.js` | Maya's content: `GLOSSARY`, `CAST`, `TALKS`, `DOCS`, `LESSONS`, `CRITERIA`, `FIELD_GUIDE`, voice ids, reveal lines, passer-by chatter, and `spokenLines()` (the list of lines to record). |
| `characters.js` | Current character art: `personSVG`, `portrait`, `byteBox`, `mini`. Overrides the older versions in `art.js`. |
| `art.js` | Palette, vector fallback scenes (`SCENES`), and the Future Table vignettes (`vignette(kind)`). |
| `paint_boston.js` | `PAINT[key] = {paint, overlay, focus}` canvas painters. `screen()` uses a painter when one exists for the scene key, otherwise the vector fallback. |
| `infog.js` | `VIZ`: animated infographics, one per document sentence. |
| `props.js` | Tappable props and passers-by per scene key. |
| `music.js`, `music_tracks.js`, `audio.js` | Music, sound effects and babble; prerecorded tracks; generated voice clips. |

## How a mission is built

A mission is one object in `MISSIONS`. Its `flow` is a list of steps, each with a kind `k`:

- `talk`: a face-to-face conversation from `talks[key]` (lines `{who, mood, text, choices?, clue?}`; `who` is a `CAST` key or `byte`).
- `custom`: a screen function from the mission's `custom[name]` (or a global `STEPS[name]`).
- `bench`, `criteria`, `table`, `consent`, `memo`, `reveal`, `debrief`, `evening`: the generic screens, driven by mission fields such as `docs`, `criteria`, `controls`, `outcomes(choice, knows)`, `consent`, `memo`, `reveal`, `trap`, `evening()`.

The Future Table is generic: `outcomes(plan, knows)` returns outcome kinds with probabilities and a pass/fail flag per criterion, and the table spreads 10 futures to match those probabilities (no random draws). The real outcome is one seeded draw from `outcomes(plan, truth())`. `brief()` gives Byte's chat the mission's facts.

The hub shows every mission grouped by `CAREERS`, locked until the missions in `after` are done. `S.completed[id] = {stars}` records completion.

## Things a new mission must know

- Lines only get recorded voices if they appear in `spokenLines()` in `content_boston.js`, which today only reads Maya's globals. New missions currently play a babble sound for Byte and silence for people. Extending `spokenLines()` to read every mission's `talks` and `docs` is a small shared change that should be made once, by one session.
- `cannedReply()` in `game.js` is mostly Maya-specific. Other missions should provide `canned(q)`.
- The Field Guide sheet says "found in Boston" and lists every `FIELD_GUIDE` entry, so entries added by a new mission show up as locked "?" cards from the start.
- Mission state (`notes`, `told`, `criteria`, `memo`, `result`, confidence) is wiped by `startMission()`. Nothing about a finished mission is kept except its stars, so the parent page and portfolio need a new history record.
- `tools/shots.js` only covers Maya. A new mission should add its own screenshot script or extend the shot list.

## Phase 1 of the spec: done and missing

| Phase 1 item | State on main |
|---|---|
| Care Doctor career | 1 mission (Maya). |
| Elder Companion career | Not started: no missions, no cast. |
| 6 missions | 1 of 6. |
| One full career journey (explore, meet people, practice project, interview, first day, workdays, big talk, promotion) | Not started. The game opens straight into Day 1 of the doctor job. |
| Robot dog with customizing | Name, color, voice, ears. Missing: tail, eye style, accessories that unlock. |
| Scripted dog lines | Done for Maya; chat falls back to scripted replies. |
| Flattering advice AI case and Byte's Honesty Upgrade | Not started. |
| Quiet Year memorial | Not started (in progress on branch `quiet-year-memorial`). |
| Autosave | Done (local plus artifact database), with save codes. |
