# Pathmakers 2040

A phone-first career game for kids, set in a hopeful 2040 where superintelligent AI quietly runs hospitals, cities and companies, and people still decide what matters. The player works real jobs alongside Byte, a robot-puppy AI partner: reading Byte's animated briefings, finding out what the people involved care about, testing plans on the Future Table, explaining choices honestly, and signing decisions they are accountable for.

## Play

- **On the web:** https://ml-chen.github.io/pathmakers-2040/ (published from the `gh-pages` branch on every push to `main`; it goes live once GitHub Pages is turned on for this repo under Settings → Pages → "Deploy from a branch" → `gh-pages`).
- **In Claude:** https://claude.ai/artifact/C9LTpQFgkd7Q5eQgypoQcS (the same game with cloud saves and Byte's live chat; opens for the owner and anyone the owner shares it with).
- **Offline:** download `index.html` from the [`gh-pages` branch](../../tree/gh-pages) and open it in any browser. The whole game, including voices and music, is one self-contained file.

Best on a phone or in a narrow browser window. Progress saves automatically, and the Menu gives a save code you can copy to another device.

## Screenshots

| | | | |
|---|---|---|---|
| ![Title screen with Byte the puppy](docs/screenshots/title.jpg) | ![Walking to work down Commonwealth Avenue](docs/screenshots/street.jpg) | ![Talking with Maya, the patient](docs/screenshots/maya.jpg) | ![Byte's memo on the Workbench, one animated picture per sentence](docs/screenshots/workbench.jpg) |
| Title | The walk to work | Meeting the patient | Byte's memo |
| ![The Future Table showing 10 typical futures for a plan](docs/screenshots/future-table.jpg) | ![Explaining the plan to Maya and her dad](docs/screenshots/consent.jpg) | ![The real outcome, 30 days later](docs/screenshots/reveal.jpg) | ![Evening at home with a mystery](docs/screenshots/evening.jpg) |
| The Future Table | Getting consent | What really happened | Evening cliffhanger |

## What's in a day

1. **Morning and the walk to work:** tap things in each painted scene, pet Byte, and listen to passers-by. Some details are clues.
2. **Meet the people:** face-to-face conversations with recorded voices. Listening closely turns up information that no record has.
3. **Workbench:** graded-reader documents at about a 7th-grade level, where every sentence has its own animated picture and every hard word has a tap definition (saved to the Word Book).
4. **Set the bar:** choose what a good decision means before looking at options.
5. **Future Table:** change the plan and watch 10 typical futures shift, built from Byte's forecast so the futures match the odds.
6. **Consent, then the written decision:** explain the plan honestly, write 2 or 3 sentences, and sign. Byte reviews the writing like a kind editor.
7. **What really happened and the debrief:** the real outcome is rolled from the true odds, and the debrief scores the decision separately from luck and checks how well-calibrated the player's confidence was.

## Build and test

```sh
python3 src/build.py dist/pathmakers.html          # inline every module into one page
node tests/flow_test.js dist/pathmakers.html       # play every mission headlessly and report errors
node tools/shots.js dist/pathmakers.html /tmp/pm-shots   # phone-size screenshots of every screen
python3 tools/make_audio.py                        # record new spoken lines (see tools/AUDIO.md)
```

`CLAUDE.md` has the module map and the rules the game follows. New missions, painted scenes and infographics go in their own files under `src/missions/`, `src/scenes/` and `src/viz/`, and the build picks them up automatically.

## Credits

Voices are recorded with Kokoro (Apache-2.0) through sherpa-onnx. The world is inspired by the AI Futures Project's scenario "AI 2040"; the game is not affiliated with it. Every person in the game is fictional, and every disaster and villain hideout is in a made-up place.
