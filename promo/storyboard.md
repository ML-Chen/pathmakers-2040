# Pathmakers 2040 promo: storyboard (PAUSED, draft v0)

Two ~60 s trailers in the style of a Pokémon reveal trailer: cinematic shots of the world, narrator lines, quick cuts on the beat, big title moments, logo at the end.

| | RedNote / Xiaohongshu | Twitter / X |
|---|---|---|
| Frame | 1080x1440 portrait (3:4), 30 fps | 1440x1080 landscape (4:3), 30 fps |
| Text | Simplified Chinese only | English |
| Voice | AI Mandarin narrator (Kokoro v1.0), with matching Chinese subtitles | None. Big animated title cards and narrator-style lines carry the story |
| Encode | libx264 `-preset veryfast -crf 20 -pix_fmt yuv420p -movflags +faststart`, AAC | same |

## Status when paused

| Part | Status |
|---|---|
| Research: README, MISSIONS.md, CLAUDE.md, game content, screen tour | Done. 29 phone screenshots in `shots/`, contact sheets in `work/contact_*.jpg` |
| Painted scenes at video sizes | Tested. All 6 scenes (home, street, hospital, night, table, workbench) paint cleanly full-bleed at 1080x1440 and 1440x1080 in about 0.1 to 0.3 s each (`work/paint/`) |
| Music choice and edit plan | Done (below). Not cut yet |
| Fonts | Installed in `node_modules/@fontsource/` (fredoka, nunito, caveat, zcool-kuaile, zcool-qingke-huangyou, noto-sans-sc). Noto Sans CJK SC Black is installed system-wide |
| Mandarin TTS pipeline | Working: `tools/zh_tts.py` (Kokoro multi-lang v1.0 through sherpa-onnx, mixed Chinese/English). One test line in `vo/test.wav` |
| Mandarin check pipeline | Working: `tools/zh_asr.py` (paraformer-zh-small, downloaded to `dl/asr/`) |
| Shot list, English cards, Chinese text and VO draft | Draft v0 (below) |
| Styleframes (`frames/`) | Not started |
| VO audition (`vo_audition_*.mp3`) | Not started |
| Twitter thread stills (`stills/twitter_1..6.png`, 1600x1200) | Not started (brief below) |
| Full renders | Not started |

Nothing in the game repo was changed. The game was built into `game/pathmakers.html`.

## Music

**Paper Lanterns** (music-lab, `demos/edm/future-bass/paper_lanterns_v4.mp3`, copied to `audio/`): original future bass in F major, 150 BPM half-time. It's bright and cute, a good match for anime art, and its shape fits a trailer: a soft intro, a groove, a quiet break with a build, then a big drop.

Bars are exactly 1.6 s from t = 0 (checked by measuring loudness per beat). The chords loop every 4 bars (Bbmaj9, Cadd9, Am7, Dm9), so any cut at a multiple of 4 bars is clean.

| Track bars | Track time | Section | Loudness |
|---|---|---|---|
| 1-8 | 0.0-12.8 | intro, soft | about -19 dB |
| 9-16 | 12.8-25.6 | verse: kick and clap come in | about -10 dB |
| 17-24 | 25.6-38.4 | break, then a build (snare roll, riser) | -20 rising to -10 dB |
| 25-40 | 38.4-64.0 | drop (two identical 8-bar halves) | about -6 dB |
| 41-44 + tail | 64.0-74.4 | outro, chords ring out | -15 dB fading |

**Edit (about 61.6 s):** track 6.4 to 51.2 s (bars 5-32), then track 57.6 to 74.4 s (bars 37 to the end). This skips 4 intro bars and 4 drop bars, both at loop boundaries. Add a 0.3 s fade-in, and fade out under the end card.

Video section marks: **0.0** soft hook · **6.4** the beat kicks in · **19.2** quiet break · **32.0** DROP · **51.2** outro rings out · about **61.6** end.

RedNote: duck the music about 8 to 10 dB under the voice (sidechain or volume keyframes), and lift it back for the title hit, the drop and the end card.

Fallbacks if the creator dislikes the track: Neon Causeway (synthwave, the game's Future Table music), Highline (trance), or The Gate Opens (orchestral, but D minor and only 51 s).

## Shot list (draft v0)

Times are video seconds, aligned to 1.6 s bars. The beats are slots, so bigger-game content can replace or extend them without changing the music edit (see "Slotting in new content").

| # | Time | Slot | Visual | Twitter card (EN) | RedNote narrator line = subtitle (ZH) |
|---|---|---|---|---|---|
| 1 | 0.0-6.4 | HOOK | Painted night skyline (`PAINT.night`), slow push-in, cool grade, twinkling overlay | "By 2040, AI could do almost any job." → "So what should kids learn?" | 到2040年，AI可能什么工作都能做。/ 那孩子们，到底该学什么？ |
| 2 | 6.4-9.6 | WHY | Cut to the home at sunrise (`PAINT.home`), warm light, slow pan. The beat drops in on the cut | "I made a game for a kid in my family." | 所以，我给家里的孩子做了一款游戏。 |
| 3 | 9.6-12.8 | TITLE | Flash; the **Pathmakers 2040** logo (game style: white Fredoka, yellow 2040 pill) slams in; golden Byte pops up with a bounce and sparkles | (logo only) | (logo, no voice; music hit). Optional tagline 未来职业冒险 |
| 4 | 12.8-19.2 | WORLD | Street pan (`PAINT.street`: tram, robots), then the hospital (`PAINT.hospital`) with Halo, the glowing operations-AI orb | "In 2040, superintelligent AI runs the city." → "And the hospital. It's… normal now." | 2040年，超级智能管理着城市和医院，/ 大家早就习以为常。 |
| 5 | 19.2-22.4 | PARTNER | Big Byte switching color and ears on each beat, beside the real setup screen in a phone frame | "Meet Byte, your AI partner." | 这是Byte，你的AI小狗搭档。 |
| 6 | 22.4-25.6 | THE JOB | Hospital room, Maya's anime portrait slides in (worried), violin pin | "Your patient: Maya. Broken wrist. Recital in 9 days." | 你的病人玛雅摔断了手腕，九天后要上台拉小提琴。 |
| 7 | 25.6-28.8 | AI IS BRILLIANT | Workbench phone: a memo sentence, its looping diagram, and the "radius" definition popping open | "Byte researches, forecasts and explains." | Byte帮你查资料、算概率，把每个难词讲明白。 |
| 8 | 28.8-35.2 | ONLY YOU KNOW | Build: Wei Lin (dad) portrait with his real line ("Last summer she got a bad rash from one of those cooling patches…"). **Drop at 32.0:** Byte's forecast card slams in and the skin-reaction risk ticks **5% → 60%** | "But only her dad knows about the rash." → "Tell Byte. The forecast changes." | 但有件事，病历上没有，只有她爸爸知道。/ 告诉Byte，预测马上改变。 |
| 9 | 35.2-38.4 | FUTURE TABLE | Holographic table (`PAINT.table`); 10 future cards (the game's `vignette()` art) flip from BoneMend + keep Friday (many "Skin reaction") to cast + therapy + move the recital (mostly "Played at the moved recital!"); meters slide | "Change the plan. Watch 10 futures shift." | 换一个方案，看十种未来怎么变。 |
| 10 | 38.4-41.6 | CONSENT + SIGN | Maya and her dad smiling (1 bar), then a handwritten signature writes itself: "Signed. You are accountable for this decision." (1 bar) | "Explain it honestly." → "Sign it. You're accountable." | 跟玛雅和爸爸把话说清楚，/ 然后签字，为决定负责。 |
| 11 | 41.6-44.8 | LUCK | Debrief cards: Decision ★★★ beside Luck "As expected"; the calibration line pops in ("Byte's forecast 70%. You said about 75%. Nicely calibrated!") | "A good decision isn't the same as a good outcome." | 好的决定，不等于好的结果。 |
| 12 | 44.8-51.2 | THESIS | Byte and the Future Table glow. Five words stamp in, one per beat, then hold | "The AI is brilliant. You bring:" GOALS · CONSENT · LOCAL KNOWLEDGE · JUDGMENT · ACCOUNTABILITY | AI再聪明，这些仍然要靠人：目标 · 同意 · 第一手信息 · 判断 · 责任 |
| 13 | 51.2-56.0 | TEASER | Outro rings out, dark grade. Two bumbling agents push the TOTALLY NORMAL BOLTS crate down the street (the game's `mini()` pip and jory sprites, large); cut to Byte at night with "!" | "Someone tried to 'upgrade' Byte…" → "Who built the secret datacenter at Calder Bay?" | 不过……有人想偷偷给Byte"升级"？/ 卡尔德湾的秘密数据中心，又是谁建的？ |
| 14 | 56.0-61.6 | END CARD | Logo, Byte, home at sunrise. The question fades in; "Made with Claude" in small type; music fades | "How do we prepare kids for a world with superintelligent AI?" | 超级智能时代，我们该怎么帮孩子做好准备？ (small: 用Claude制作) |

Every claim above matches the game as it is today:
- Maya is 11, and her recital is 9 days away.
- The rash came from a cooling patch in Taipei and isn't in her record.
- BoneMend's skin-reaction forecast goes from 5% to 60%.
- The Future Table shows 10 typical futures. The 10 cards and meters in shot 9 are the game's own for those two plans: gel + keep Friday gives 9/3/4 of 10, and cast + therapy + moved gives 9/8/10 of 10.
- Consent, signing and the debrief (decision vs luck, calibration) are real steps.
- The "upgrade" and the datacenter near Calder Bay come from the evening scene, and the crate from the street scene.

The child is never named or described; the creator chooses the exact wording when posting.

### Draft Mandarin voiceover (about 230 characters; the budget is about 190)

Measured pace is about 4.5 characters per second at speed 1.0, so these lines need to be trimmed or slightly sped up (1.05 to 1.1) once each line is timed. Pauses are left for the title hit (shot 3), the drop (shot 8) and the five words (shot 12).

1. 到2040年，AI可能什么工作都能做。那孩子们，到底该学什么？
2. 所以，我给家里的孩子做了一款游戏。
3. （音乐 / music: Pathmakers 2040）
4. 2040年，超级智能管理着城市和医院，大家早就习以为常。
5. 这是Byte，你的AI小狗搭档。
6. 你的病人玛雅摔断了手腕，九天后要上台拉小提琴。
7. Byte帮你查资料、算概率，把每个难词讲明白。
8. 但有件事，病历上没有，只有她爸爸知道。告诉Byte，预测马上改变。
9. 换一个方案，看十种未来怎么变。
10. 跟玛雅和爸爸把话说清楚，然后签字，为决定负责。
11. 好的决定，不等于好的结果。
12. AI再聪明，目标、同意、第一手信息、判断和责任，仍然要靠人。
13. 不过……有人想偷偷给Byte"升级"？
14. 超级智能时代，我们该怎么帮孩子做好准备？

Narrators to audition: zm_yunxi, zm_yunyang and zf_xiaoyi (energetic). Check each with `tools/zh_asr.py`.

## Visual approach (planned, not built yet)

- **Backgrounds:** paint each scene once at about 1.25x the frame size into an offscreen canvas. Every frame, draw it with a slow pan or zoom, then run `PAINT[key].overlay(ctx,w,h,t)` with t in seconds, so tram, light and stars keep moving.
- **Characters:** `portrait({...CAST.maya,mood})`, `byteBox({...S.byte,mood},'big')`, `vignette(kind)` for the future cards, and `mini(x,y,{who:'pip'|'jory',pose:'push'})` for the villains. All are SVG, so they render sharp at any size.
- **Real UI:** capture the game at 390x844 with deviceScaleFactor 3, inside a clean phone frame. Fonts come from a localhost static server (route fonts.googleapis.com to local @fontsource CSS); without that, captures fall back to system fonts.
- **Rendering:** one `trailer.html?v=rednote|twitter` with a deterministic `setT(t)`. Each shot is `{start, dur, build(), update(tLocal)}`. Capture JPEG q92 frames per shot, encode one mp4 per shot with crossfades inside the file, join them with the concat demuxer (`-c copy`), then mux the audio (`-c:v copy`).
- **Text:**
  - Twitter: big white Fredoka 600 for title moments, Nunito 800 for narrator lines, soft shadow, safe margins of at least 6%.
  - RedNote: Noto Sans CJK SC Black for subtitles, ZCOOL KuaiLe for big title moments.
  - One idea per card. No eyebrow text.

## Slotting in new content (for the bigger game)

The music edit fixes the sections. The content inside each slot is free.

- **WORLD (shot 4, 6.4 s):** a montage of places. With more painted scenes (`PAINT.<key>`), cut to one place per bar (1.6 s), up to 4 places, each with its overlay animation. The narrator line stays generic ("AI runs the cities, the hospitals, the …").
- **THE JOB (shots 6-11):** the core gameplay loop. Keep one hero mission for the story (the clue, then the forecast change, then the Future Table, consent and signing). Add a 1-bar "career flash" before it ("Doctor. Engineer. Judge. …"), with one portrait or vignette per half-bar. A career can only be named once it really exists in the game.
- **THESIS (shot 12):** if a new mission shows a different human skill better, swap the matching word's background.
- **TEASER (shot 13):** swap in any new villain beat. Lairs and disasters must stay in made-up places.
- **Longer cut:** for more content, use the full 16-bar drop (+6.4 s, about 68 s total) instead of adding bars elsewhere.

## Extra deliverable requested (not started): Twitter thread stills

There are 6 stills at 1600x1200. Each one shows the painted scene full-bleed (via `PAINT[key].paint` at 1600x1200), the real phone UI (390x844 at DSF 3) large in a minimal phone frame, and the matching portrait or Byte beside it. Use one short label at most.

1. Workbench: a memo sentence, its diagram, and an open tap definition
2. The dad's rash clue with the "Write this in my notebook" prompt
3. Future Table with cast + therapy + moved recital: 10 futures and the meters
4. Consent with Maya and her dad, the honest option highlighted
5. Debrief: decision stars vs luck, plus the calibration line
6. The TOTALLY NORMAL BOLTS crate on the street, or the evening Calder Bay teaser

## Concerns to raise with the creator

- **The logo in Chinese.** The game only has an English name. Should the RedNote logo stay "Pathmakers 2040" with a Chinese tagline, or get a Chinese name? Possible names: 开路人2040, 职业开路者. Avoid 探路者, which is an existing brand.
- **Language.** The game is in English. Should the RedNote post caption say so?
- **How "AI" sounds.** In the Mandarin voice, "AI" is read as English letters (ēi-ài), which is normal in Chinese speech. The zh-only checker can't verify English words (it heard 呀), so a native speaker should listen once. Another option is 人工智能.
- **The hook line.** It's hedged on purpose ("could"), because the audience is the forecasting crowd. Use "can" if the creator wants a punchier line.
- **Shot count.** There are 14 shots, slightly over the suggested 10-14 once the split cards are counted. Shots 4 and 10 each have two cards.

## How to resume

1. Rebuild the game into `game/`: `python3 /home/claude/pathmakers-2040/src/build.py /home/claude/promo/game/pathmakers.html`. Re-run the screen tour into `shots/` with `tools/shots.js` from the repo.
2. Update the shot list above with the new places and careers, keeping the bar grid.
3. Build `trailer.html` and the frame capture script. Render styleframes at peak moments (shots 3, 4, 8 after the drop, 9, 12, 14 for each version) and review them.
4. Run the VO audition with `tools/zh_tts.py` (3 voices × 2 lines, then pick 2), check each with `tools/zh_asr.py`, and encode `vo_audition_*.mp3`.
5. Make the Twitter thread stills, then the full renders: one heavy job at a time, with `nice -n 10`.
