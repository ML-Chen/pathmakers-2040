# Prerecorded voices (`src/audio.js`)

`src/audio.js` defines `const AUDIO={"<voice>|<text>":"data:audio/ogg;base64,..."}`
(also exposed as `window.AUDIO`, which `game.js` checks). `playLine()` looks up
`AUDIO[voice+'|'+text]` and falls back to the device voice when a key is missing.
The file is generated. Don't edit it by hand.

## Regenerate

```
pip install "sherpa-onnx==1.13.8" numpy --break-system-packages   # not 2.x, see below
mkdir -p ../tts-models && cd ../tts-models
curl -LO https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/kokoro-en-v0_19.tar.bz2
tar xjf kokoro-en-v0_19.tar.bz2 && cd -
python3 tools/make_audio.py            # add --force to re-synthesize everything
python3 src/build.py                   # re-inline into dist/pathmakers.html
```

- The line list comes from `spokenLines()` in `src/content_boston.js`, run through node.
  Run the script after any dialogue change: it synthesizes only new or changed lines,
  and it drops clips for lines that no longer exist.
- Cache: `../tts-cache/<sha1(voice|text)>.ogg` plus a `.json` sidecar. A clip is rebuilt
  when its speed, TTS text, model or bitrate changes. Override the location with `TTS_CACHE_DIR`.
- Model location: `../tts-models/kokoro-en-v0_19`. Override it with `TTS_MODEL_DIR`.
- Needs `node` and `ffmpeg` with libopus. If ffmpeg is missing, `pip install imageio-ffmpeg` also works.
- Output: Ogg Opus, mono, 24 kHz, 24 kbps (`-application voip`). Silence is trimmed and
  loudness is levelled to about -20 dBFS RMS.
- Pin sherpa-onnx to 1.13.x. sherpa-onnx 2.x removed the espeak-ng front end for Kokoro,
  so with that model it fails with "No lexicon available" and produces no audio.
- Pronunciation fixes are in `PRONOUNCE` in `make_audio.py`, for example BoneMend → "Bone Mend",
  HX-2 → "H X 2" and 2040 → "twenty forty". They change only the text sent to the model.
  The keys always use the exact game text, including curly apostrophes.

## Model and voices

Kokoro-82M v0.19 (`kokoro-en-v0_19.tar.bz2`), from the k2-fsa/sherpa-onnx GitHub
release `tts-models`, runs through sherpa-onnx. It has 11 speakers. Their IDs come from the
model's `speaker_names` metadata: 0 af, 1 af_bella, 2 af_nicole, 3 af_sarah, 4 af_sky,
5 am_adam, 6 am_michael, 7 bf_emma, 8 bf_isabella, 9 bm_george, 10 bm_lewis.

| Voice key    | Character                              | Speed |
|--------------|----------------------------------------|-------|
| `af_bella`   | Byte, the robot dog                    | 1.0   |
| `bf_emma`    | Dr. Imani                              | 1.0   |
| `af_sky`     | Maya, age 11                           | 1.05  |
| `am_michael` | Maya's dad                             | 1.0   |
| `bm_george`  | Narrator (documents, glossary)         | 0.95  |

## License

- Model: the archive's `LICENSE` is the Apache License 2.0. Its README points to
  https://huggingface.co/hexgrad/Kokoro-82M, and the model metadata gives
  `model_url = https://huggingface.co/hexgrad/kLegacy/`. The Hugging Face pages weren't
  reachable from the build machine, so the license here comes from the archive's `LICENSE` file.
- sherpa-onnx is Apache-2.0.
- `espeak-ng-data` (phonemizer data, included in the model archive with no license file;
  upstream espeak-ng is GPL-3.0-or-later) is used only while generating. It isn't shipped
  with the game. The game ships only the generated audio clips.
