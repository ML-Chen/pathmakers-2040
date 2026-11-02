# Prerecorded voices (`src/audio.js`)

`src/audio.js` defines `const AUDIO={"<voice>|<text>":"data:audio/ogg;base64,..."}`
(also exposed as `window.AUDIO`, which `game.js` checks). `playLine()` looks up
`AUDIO[voice+'|'+text]` and falls back to the device voice when a key is missing.
The file is generated. Don't edit it by hand.

## Regenerate

```
pip install "sherpa-onnx==1.13.8" numpy --break-system-packages   # not 2.x, see below
mkdir -p ../tts-models && cd ../tts-models
curl -LO https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/kokoro-multi-lang-v1_0.tar.bz2
tar xjf kokoro-multi-lang-v1_0.tar.bz2 && cd -
python3 tools/make_audio.py            # add --force to re-synthesize everything
python3 src/build.py dist/pathmakers.html
```

- The line list comes from `spokenLines()` in `src/content_boston.js`, run through node.
  Byte lines appear once per `BYTE_VOICES` entry. Run the script after any dialogue change:
  it synthesizes only new or changed lines, and it drops clips for lines that no longer exist.
- Cache: `../tts-cache/<sha1(voice|text)>.ogg` plus a `.json` sidecar. A clip is rebuilt when
  its speaker, speed, pitch, TTS text, model or bitrate changes. Override the location with
  `TTS_CACHE_DIR`.
- Model location: `../tts-models/kokoro-multi-lang-v1_0`. Override it with `TTS_MODEL_DIR`.
- Needs `node`, plus `ffmpeg` with libopus and the `rubberband` filter (used for Maya's and
  Byte's pitch). Without rubberband, the script falls back to plain resampling and prints a warning.
- Output: Ogg Opus, mono, 24 kHz, 24 kbps (`-application voip`). Silence is trimmed and
  loudness is levelled to about -20 dBFS RMS.
- Pin sherpa-onnx to 1.13.x. sherpa-onnx 2.x removed the espeak-ng front end for Kokoro.
  In 1.13.8, British voices use `lexicon-gb-en.txt` with `lang="en"`, because `"en-gb"`
  returns no audio. Other voices use `lexicon-us-en.txt` with `lang="en-us"`.
- Pronunciation fixes are in `PRONOUNCE` in `make_audio.py`, for example BoneMend → "Bone Mend",
  HX-2 → "H X 2" and 2040 → "twenty forty". They change only the text sent to the model.
  The keys always use the exact game text, including curly apostrophes.

## Voices

The voice names the game uses (`VOICES` / `BYTE_VOICES` in content_boston.js) are only
role keys. `ROLES` in `make_audio.py` maps each one to the Kokoro v1.0 speaker that actually
reads it, so you can recast a voice there without changing the game.

| Game key     | Character        | Kokoro speaker | Speed | Pitch / formant |
|--------------|------------------|----------------|-------|-----------------|
| `af_bella`   | Byte (female)    | `af_sarah`     | 1.12  | 1.10 / 1.04     |
| `am_adam`    | Byte (male)      | `am_fenrir`    | 1.12  | 1.08 / 1.03     |
| `bf_emma`    | Dr. Reyes        | `af_kore`      | 1.03  | none            |
| `af_sky`     | Maya, 11         | `af_heart`     | 1.10  | 1.20 / 1.14 (chosen by ear; af_jessica sounded affected) |
| `am_michael` | Wei Lin, her dad | `am_liam`      | 1.02  | none            |
| `bm_george`  | Narrator         | `bm_fable`     | 1.05  | none            |
| `af_sarah`   | Passer-by        | `af_aoede`     | 1.02  | none (the `af_sarah` speaker is Byte's voice) |
| `af_nicole`  | Passer-by        | `af_alloy`     | 1.02  | none (`af_nicole` is a near-whisper) |
| any other    | e.g. `bm_lewis`, `bf_isabella` | same-named speaker | 1.02 | none |

The script stops if a voice key is neither in `ROLES` nor a Kokoro speaker name. Keys
shared by two characters sound identical. For example, a passer-by on `am_michael` sounds
like Wei Lin. To separate them, give the passer-by another speaker name, such as `am_eric`
or `am_echo`.

Pitch and formant work as follows. The formant factor shifts timbre: the clip is resampled
by that factor, and Kokoro synthesizes it slower so the pace stays at `speed`. Then a
formant-preserving rubberband shift brings the pitch up to the full pitch factor. For Maya
this gives a child's pitch, about 255–265 Hz, and slightly higher formants, without the
chipmunk sound of a plain ×1.2 speed-up. Kokoro has no child voices.

### How the cast was chosen

Every candidate voice read real lines for each role. Each clip was scored on three things.
The main liveliness proxy was pitch variation: the standard deviation of F0 in semitones
over voiced frames. Speaking rate was also measured. Intelligibility was checked by
transcribing the clip with Whisper base.en (sherpa-onnx) and comparing the result with the
script.

The previous cast was among the flattest in each role:

| Role      | Old voice, pitch SD   | New voice, pitch SD      |
|-----------|-----------------------|--------------------------|
| Byte      | af_bella, 2.3 st      | af_sarah, 4.0 st         |
| Doctor    | bf_emma, 2.1 st       | af_kore, 4.2 st          |
| Dad       | am_michael, 2.6 st    | am_liam, 4.6 st          |
| Narrator  | bm_george, 3.1 st     | bm_fable, 3.9 st         |
| Byte male | am_puck (suggested), 2.9 st | am_fenrir, 4.1 st  |

All picks transcribed at 0.94–1.0 similarity. Runners-up, if a voice doesn't land when you
listen: af_heart for Byte (the highest-quality Kokoro voice, but calmer at 3.1 st), af_sky
for Maya, am_echo for the dad, and bm_george for the narrator.

## License

- Model: the archive's `LICENSE` is the Apache License 2.0. Its README points to the official
  Kokoro-82M voices, and the model metadata gives
  `model_url = https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files` and
  `see_also = https://huggingface.co/spaces/hexgrad/Kokoro-TTS`. The Hugging Face pages
  weren't reachable from the build machine, so the license here comes from the archive's
  `LICENSE` file.
- sherpa-onnx is Apache-2.0.
- `espeak-ng-data`, the lexicons and `dict/` are used only while generating. espeak-ng
  upstream is GPL-3.0-or-later, and the archive has no separate license file for that data.
  None of it is shipped with the game. The game ships only the generated audio clips.
