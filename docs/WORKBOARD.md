# Workboard

Several Claude sessions build this game at the same time. Before starting a piece of work, read docs/CAMPAIGN.md and this file on `main`, pick something unclaimed (or add a new row), and push the claim to `main` so other sessions see it. Work on your own branch, in your own files (see docs/MISSIONS.md), and say in your hand-off which shared files you touched.

| Work | Branch | Owner | Status |
|---|---|---|---|
| Grown-ups' progress page | `claude/project-thread-obst9q` | another session | merged into main |
| PR checks and the all-mission screenshot tool | `claude/project-thread-niuo7p` | another session | merged into main |
| Bezier bone diagrams, crate label, reveal leak fix | `claude/project-thread-s7we06` | another session | merged into main |
| Redraw Maya's forearm and hand (child proportions, real fingers) | `main` | coordinating session (Nov 2) | merged into main Nov 2 (finishing touches still open, see below) |
| Quiet Year memorial (finish and port to the current engine) | `quiet-year-memorial` | coordinating session's agent | merged into main Nov 2 (finishing touches still open, see below) |
| Care Doctor Day 2: the home-care AI case (reworks "The App That Agreed" per family feedback) | `claude/project-thread-eju8ow` | coordinating session's agent | merged into main Nov 2 (finishing touches still open, see below) |
| The Sneeze Recipe (Health Harbor villain plot), finish | `claude/project-thread-mmpiwt` | coordinating session's agent | merged into main Nov 2 (finishing touches still open, see below) |
| Nome Wildlife Vet, "The Calf Who Stopped Eating" | `content/nome-vet` | coordinating session's agent | merged into main Nov 2 (finishing touches still open, see below) |
| Phoenix Community Architect, "The Flood Lot" | `content/phoenix-architect` | coordinating session's agent | merged into main Nov 2 (finishing touches still open, see below) |
| Vienna AI Auditor, "The Helpful Shopping AI" | `content/vienna-auditor` | coordinating session's agent | merged into main Nov 2 (finishing touches still open, see below) |
| DC Lawmaker, "The Robot Safety Bill" | `content/dc-lawmaker` | coordinating session's agent | merged into main Nov 2 (finishing touches still open, see below) |
| Boston Elder Companion, "Dancing at 104" | `content/boston-companion` | coordinating session's agent | merged into main Nov 2 (finishing touches still open, see below) |
| Campaign engine: calendar, world map, career journeys (finishing Getting Hired), ranks, Hearts, Coins, Days, star types | `engine/campaign` | coordinating session's agent | merged into main Nov 2 (finishing touches still open, see below) |
| Characters: new hair styles, outfits, full-body posed figures | `engine/characters` | coordinating session's agent | merged into main Nov 2 (finishing touches still open, see below) |
| The Ledger news app and the first ruin (the Dark Tower in Marrow Point) | `content/ledger-ruins` | coordinating session's agent | merged into main Nov 2 (finishing touches still open, see below) |
| Byte customizing and accessories that unlock | `claude/project-thread-izhx21` | coordinating session's agent | merged into main Nov 2 (finishing touches still open, see below) |
| Challenge levels (Kid, Teen, Grown-up) and Chinese mode | `engine/modes`, `engine/i18n` | coordinating session | merged into main Nov 2; content for Teen/Grown-up and zh translations still partial |
| Android app (APK built by GitHub Actions) | `main` | coordinating session (Nov 2) | in progress |
| Landscape layout | none | unclaimed | briefs ready in docs/BRIEFS.md |
| Promo videos (RedNote and Twitter) | `promo/` on main | unclaimed | paused until more of the game is built; storyboard and Mandarin TTS/ASR tools in promo/ |

Ideas not yet claimed (from docs/SPEC.md): Nome Ranger; Phoenix Robot Crew Lead; Moon Founder and Dividend Investor; Bay Area Science Director; Mars Explorer; New York Performer and Coach; DC Judge; Vienna Treaty Inspector; the career-journey steps (explore, meet people, interview, first day, big talk, promotion); a world map to travel between places; the Unbound and Prime villain plots for each place; Byte customization unlocks; the Android app.


Open finishing touches after the Nov 2 merge: Advocate courtroom (`content/boston-advocate` never pushed its court engine; restart it), the Dark Tower mission (`darktower`, only its scenes exist), agreed's permissions panel layout, bill's tooltips over controls, shop's meter labels and repetitive futures.

## Hand-off, Nov 2 2026 ~08:45 UTC (coordinating session)
Merged into main tonight: every content and engine branch, the Android app (`.github/workflows/android.yml`, release "Android (latest)"), the playtest workflow (flow + resume tests, screenshots, playthrough video, release "Playtest (latest)"), voice recording in CI (`voices.yml`, ElevenLabs when the `ELEVENLABS_API_KEY` secret exists, otherwise Kokoro), the writing pass (`writing/plain-voice`), the Quiet Year doubling exhibit, the DC bill's remote-orders redesign, autosave resume, and many playtest fixes (see git log).
Still on branches, not merged yet (agents were working when the session ended; merge one at a time, build, run tests/flow_test.js and tests/resume_test.js):
- `art/quietyear-viz`: redrawn Quiet Year story pictures (src/viz/quietyear.js, src/css/quietyear.css).
- `art/phoenix-scenes`: painted phx_lot, phx_studio, phx_dusk (the Flood Lot currently falls back to the hospital).
- `content/darktower`: the Dark Tower ruin day (correlated failure, off switches).
Open items: Chinese translations don't exist yet (src/i18n.js is the engine only; no src/i18n/zh files); sneeze.js still needs the plain-writing pass; the courtroom career must restart; the owner must add the Android signing secrets before going public.
Owner feedback still to act on (Nov 2, late): the Nome mammoths look goofy (mother and calf need a full redraw with real woolly-mammoth anatomy: high domed head, shoulder hump, sloping back, long curved tusks, small ears, shaggy layered coat; the calf cute but believable), and the calf_observe icon buttons are cryptic (label them or use clearer pictures); the DC bill's Section 3 options still don't read as good policy and need another pass; Grand Rounds and other screens need the plain-writing pass where text is still punchy.

