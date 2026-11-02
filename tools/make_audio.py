#!/usr/bin/env python3
"""Prerecord every spoken line of the game and write src/audio.js.

Usage (from anywhere):  python3 tools/make_audio.py [--force]

  * Gets the line list from src/art.js + src/content_boston.js (spokenLines()) via node.
  * Synthesizes, with Kokoro (sherpa-onnx), only the lines missing from the on-disk cache.
  * Encodes each clip as Ogg Opus (mono, 24 kHz, ~24 kbps) and writes src/audio.js:
        const AUDIO={"<voice>|<text>":"data:audio/ogg;base64,...", ...};
    containing exactly the current lines (stale entries are dropped).

The game's voice names (VOICES / BYTE_VOICES in content_boston.js) are only role keys:
ROLES below maps each one to the Kokoro speaker, pace and pitch actually used, so voices
can be recast here without touching the game.

Environment:
  TTS_MODEL_DIR  Kokoro model folder (default: ../tts-models/kokoro-multi-lang-v1_0 next to the repo)
  TTS_CACHE_DIR  clip cache folder   (default: ../tts-cache next to the repo)
  TTS_THREADS    onnxruntime threads (default: number of CPUs)

Needs: node, ffmpeg with libopus (+ rubberband filter for pitch-shifted roles), numpy and
sherpa-onnx 1.13.x (`pip install sherpa-onnx==1.13.8`). sherpa-onnx 2.x dropped the
espeak-ng front end for Kokoro. See tools/AUDIO.md.
"""
import argparse
import base64
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PARENT = os.path.dirname(REPO)
MODEL_DIR = os.environ.get("TTS_MODEL_DIR") or os.path.join(PARENT, "tts-models", "kokoro-multi-lang-v1_0")
CACHE_DIR = os.environ.get("TTS_CACHE_DIR") or os.path.join(PARENT, "tts-cache")
OUT_JS = os.path.join(REPO, "src", "audio.js")

BITRATE = "24k"
# Game voice key -> rendering. speaker: Kokoro v1.0 speaker. speed: final pace.
# pitch: final F0 factor. formant: vocal-tract (timbre) factor, applied by resampling;
# the remaining pitch/formant is a formant-preserving rubberband shift.
# Cast picked by audition (tools/AUDIO.md): widest intonation range per role, Whisper-checked.
ROLES = {
    "af_bella":   dict(speaker="af_sarah", speed=1.12, pitch=1.10, formant=1.04),    # Byte (female): bright puppy
    "am_adam":    dict(speaker="am_fenrir", speed=1.12, pitch=1.08, formant=1.03),   # Byte (male): young, upbeat
    "bf_emma":    dict(speaker="af_kore", speed=1.03, pitch=1.0, formant=1.0),       # Dr. Reyes
    "af_sky":     dict(speaker="af_jessica", speed=1.12, pitch=1.22, formant=1.10),  # Maya, 11: child pitch/timbre
    "am_michael": dict(speaker="am_liam", speed=1.02, pitch=1.0, formant=1.0),       # Wei Lin, her dad
    "bm_george":  dict(speaker="bm_fable", speed=1.05, pitch=1.0, formant=1.0),      # narrator: storyteller
    # Passers-by (CHATTER). Any other key that is a Kokoro speaker name is read by that speaker
    # at DEFAULT_SPEED; these two are recast: af_sarah is Byte's speaker, af_nicole is a near-whisper.
    "af_sarah":   dict(speaker="af_aoede", speed=1.02, pitch=1.0, formant=1.0),
    "af_nicole":  dict(speaker="af_alloy", speed=1.02, pitch=1.0, formant=1.0),
}
DEFAULT_SPEED = 1.02

# Rewrites applied ONLY to the text fed to the TTS model; AUDIO keys keep the exact text.
PRONOUNCE = [
    (r"[\u2019\u2018]", "'"),
    (r"[\u201c\u201d]", '"'),
    (r"\u2026", "..."),
    (r"\bBoneMend\b", "Bone Mend"),
    (r"\bHX-2\b", "H X 2"),
    (r"\b2040\b", "twenty forty"),
    (r"\bdatacenter\b", "data center"),
    (r"\btradeoff\b", "trade-off"),
    (r"\bNǐ hǎo\b", "Nee how"),
    (r"\b([A-Z]{5,})\b", lambda m: m.group(1).lower()),  # shouted words ("NINETY"), not acronyms
]
# Bump when the audio post-processing below changes, so cached clips are rebuilt.
PIPELINE_VERSION = 2

NODE_CMD = ("const fs=require('fs'),vm=require('vm');const c={module:{exports:{}}};vm.createContext(c);"
            "vm.runInContext(fs.readFileSync('src/art.js','utf8')+'\\n'+fs.readFileSync('src/content_boston.js','utf8')"
            "+'\\n;this.L=spokenLines();',c);process.stdout.write(JSON.stringify(c.L))")


def load_lines():
    out = subprocess.run(["node", "-e", NODE_CMD], cwd=REPO, check=True, capture_output=True, text=True).stdout
    seen, lines = set(), []
    for item in json.loads(out):
        key = item["voice"] + "|" + item["text"]
        if key not in seen:
            seen.add(key)
            lines.append((item["voice"], item["text"]))
    return lines


def tts_text(text):
    for pat, rep in PRONOUNCE:
        text = re.sub(pat, rep, text)
    return text


def accent(speaker):
    """Kokoro speakers starting with 'b' are British English, the rest here American."""
    return "gb" if speaker.startswith("b") else "us"


def speaker_names(model_path):
    """Read the comma-separated speaker_names entry from the ONNX metadata (stored at the file's end)."""
    try:
        size = os.path.getsize(model_path)
        with open(model_path, "rb") as f:
            f.seek(max(0, size - (1 << 20)))
            tail = f.read()
        key = b"speaker_names"
        i = tail.rfind(b"\n" + bytes([len(key)]) + key)
        j = i + 2 + len(key)
        if i < 0 or tail[j] != 0x12:
            return None
        j += 1
        n = shift = 0
        while True:
            b = tail[j]
            j += 1
            n |= (b & 0x7F) << shift
            shift += 7
            if b < 0x80:
                break
        return tail[j:j + n].decode("utf-8").split(",")
    except (OSError, IndexError, UnicodeDecodeError):
        return None


def ffmpeg_exe():
    exe = shutil.which("ffmpeg")
    if exe:
        return exe
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        sys.exit("ffmpeg not found: install it (apt install ffmpeg) or pip install imageio-ffmpeg")


class Synth:
    def __init__(self):
        for f in ("model.onnx", "voices.bin", "tokens.txt", "espeak-ng-data"):
            if not os.path.exists(os.path.join(MODEL_DIR, f)):
                sys.exit(f"Kokoro model file missing: {os.path.join(MODEL_DIR, f)} (set TTS_MODEL_DIR)")
        names = speaker_names(os.path.join(MODEL_DIR, "model.onnx"))
        if not names:
            sys.exit("could not read speaker_names from model.onnx metadata")
        self.sid = {n: i for i, n in enumerate(names)}
        missing = sorted({r["speaker"] for r in ROLES.values()} - set(self.sid))
        if missing:
            sys.exit(f"model has no speaker(s) {missing}; available: {names}")
        self.engines = {}
        self.ffmpeg = ffmpeg_exe()
        filters = subprocess.run([self.ffmpeg, "-hide_banner", "-filters"], capture_output=True, text=True).stdout
        self.rubberband = " rubberband " in filters
        if not self.rubberband:
            print("WARNING: ffmpeg has no rubberband filter; pitch shifts fall back to plain resampling", flush=True)

    def engine(self, acc):
        """One sherpa-onnx engine per accent (v1.0 ships separate US / GB lexicons)."""
        if acc not in self.engines:
            import sherpa_onnx
            lex = os.path.join(MODEL_DIR, f"lexicon-{acc}-en.txt")
            has_lex = os.path.exists(lex)
            cfg = sherpa_onnx.OfflineTtsConfig(
                model=sherpa_onnx.OfflineTtsModelConfig(
                    kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(
                        model=os.path.join(MODEL_DIR, "model.onnx"),
                        voices=os.path.join(MODEL_DIR, "voices.bin"),
                        tokens=os.path.join(MODEL_DIR, "tokens.txt"),
                        data_dir=os.path.join(MODEL_DIR, "espeak-ng-data"),
                        lexicon=lex if has_lex else "",
                        # espeak-ng fallback voice for words not in the lexicon ("en" is British;
                        # sherpa-onnx 1.13.8 returns no audio for "en-gb").
                        lang=("en" if acc == "gb" else "en-us") if has_lex else "",
                    ),
                    num_threads=int(os.environ.get("TTS_THREADS") or os.cpu_count() or 2),
                ),
                max_num_sentences=1,
            )
            tts = sherpa_onnx.OfflineTts(cfg)
            if tts.num_speakers != len(self.sid):
                sys.exit(f"speaker list ({len(self.sid)}) does not match model ({tts.num_speakers})")
            self.engines[acc] = tts
        return self.engines[acc]

    def clip(self, voice, text):
        """Return (ogg_bytes, seconds)."""
        import numpy as np
        r = ROLES[voice]
        formant, pitch = r["formant"], r["pitch"]
        # Resampling by `formant` also speeds speech up by that factor, so synthesize slower.
        audio = self.engine(accent(r["speaker"])).generate(
            tts_text(text), sid=self.sid[r["speaker"]], speed=r["speed"] / formant)
        sr = audio.sample_rate
        x = np.asarray(audio.samples, dtype=np.float32)
        if x.size == 0:
            raise RuntimeError("TTS returned no audio (sherpa-onnx 2.x? use sherpa-onnx==1.13.8)")
        # Trim leading/trailing silence (10 ms frames below -45 dBFS), keep a little padding.
        frame = sr // 100
        n = x.size // frame
        rms = np.sqrt(np.mean(x[: n * frame].reshape(n, frame) ** 2, axis=1) + 1e-12)
        loud = np.nonzero(rms > 10 ** (-45 / 20))[0]
        if loud.size:
            start = max(0, loud[0] * frame - int(0.05 * sr))
            end = min(x.size, (loud[-1] + 1) * frame + int(0.12 * sr))
            x = x[start:end]
        # Even out loudness between voices: speech RMS to about -20 dBFS, peak at most 0.9.
        active = rms[rms > 10 ** (-40 / 20)]
        level = float(np.sqrt(np.mean(active ** 2))) if active.size else float(np.sqrt(np.mean(x ** 2)))
        gain = min(10 ** (-20 / 20) / max(level, 1e-6), 0.9 / max(float(np.abs(x).max()), 1e-6))
        pcm = (np.clip(x * gain, -1, 1) * 32767).astype("<i2").tobytes()
        af = []
        if self.rubberband:
            if formant != 1:
                af += [f"asetrate={sr * formant:.0f}", f"aresample={sr}"]
            if pitch != formant:
                af.append(f"rubberband=pitch={pitch / formant:.4f}:formant=preserved")
        elif pitch != 1:  # fallback: shift pitch and timbre together, keep the pace
            af += [f"asetrate={sr * pitch:.0f}", f"aresample={sr}", f"atempo={formant / pitch:.4f}"]
        ogg = subprocess.run(
            [self.ffmpeg, "-hide_banner", "-loglevel", "error", "-f", "s16le", "-ar", str(sr), "-ac", "1",
             "-i", "pipe:0"] + (["-af", ",".join(af)] if af else []) +
            ["-c:a", "libopus", "-b:a", BITRATE, "-application", "voip", "-ar", str(sr),
             "-map_metadata", "-1", "-fflags", "+bitexact", "-flags:a", "+bitexact", "-f", "ogg", "pipe:1"],
            input=pcm, capture_output=True, check=True).stdout
        return ogg, x.size / sr / formant


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--force", action="store_true", help="ignore the cache and re-synthesize every line")
    args = ap.parse_args()

    lines = load_lines()
    speakers = set(speaker_names(os.path.join(MODEL_DIR, "model.onnx")) or [])
    for v in sorted({v for v, _ in lines} - set(ROLES)):
        if v not in speakers:
            sys.exit(f"unknown voice {v!r}: add it to ROLES in tools/make_audio.py")
        ROLES[v] = dict(speaker=v, speed=DEFAULT_SPEED, pitch=1.0, formant=1.0)
    os.makedirs(CACHE_DIR, exist_ok=True)
    model_id = os.path.basename(os.path.normpath(MODEL_DIR))

    synth, made, failed, total_sec = None, 0, [], 0.0
    entries = []
    for idx, (voice, text) in enumerate(lines, 1):
        h = hashlib.sha1(f"{voice}|{text}".encode("utf-8")).hexdigest()
        ogg_path, meta_path = os.path.join(CACHE_DIR, h + ".ogg"), os.path.join(CACHE_DIR, h + ".json")
        meta = dict(ROLES[voice], voice=voice, text=text, tts_text=tts_text(text), model=model_id,
                    bitrate=BITRATE, pipeline=PIPELINE_VERSION)
        cached = None
        if not args.force and os.path.exists(ogg_path) and os.path.exists(meta_path):
            with open(meta_path, encoding="utf-8") as f:
                old = json.load(f)
            if {k: old.get(k) for k in meta} == meta:
                with open(ogg_path, "rb") as f:
                    cached = f.read()
                total_sec += old.get("seconds", 0)
        if cached is None:
            if synth is None:
                print(f"Loading Kokoro from {MODEL_DIR} ...", flush=True)
                synth = Synth()
            try:
                cached, sec = synth.clip(voice, text)
            except Exception as e:  # keep going; report at the end
                print(f"  FAILED [{voice}] {text!r}: {e}", flush=True)
                failed.append((voice, text))
                continue
            with open(ogg_path, "wb") as f:
                f.write(cached)
            with open(meta_path, "w", encoding="utf-8") as f:
                json.dump(dict(meta, seconds=round(sec, 3)), f, ensure_ascii=False)
            total_sec += sec
            made += 1
            print(f"  [{idx}/{len(lines)}] {voice}->{ROLES[voice]['speaker']} {sec:5.1f}s "
                  f"{len(cached) / 1024:5.1f} KB  {text[:60]}", flush=True)
        entries.append((voice + "|" + text, cached))

    body = ",\n".join(f"{json.dumps(k)}:\"data:audio/ogg;base64,{base64.b64encode(v).decode('ascii')}\""
                      for k, v in entries)
    cast = ", ".join(f"{k}={r['speaker']}" for k, r in ROLES.items())
    js = ("// Generated by tools/make_audio.py; do not edit by hand (see tools/AUDIO.md).\n"
          f"// {len(entries)} clips, Kokoro {model_id} (Apache-2.0) via sherpa-onnx, Ogg Opus {BITRATE} mono.\n"
          f"// Voice key -> Kokoro speaker: {cast}\n"
          "const AUDIO={\n" + body + "\n};\n"
          # game.js checks window.AUDIO; a top-level const is not a window property, so expose it.
          "if(typeof window!=='undefined')window.AUDIO=AUDIO;\n")
    tmp = OUT_JS + ".tmp"
    with open(tmp, "w", encoding="ascii") as f:
        f.write(js)
    os.replace(tmp, OUT_JS)

    raw_kb = sum(len(v) for _, v in entries) / 1024
    print(f"\nWrote {os.path.relpath(OUT_JS, REPO)}: {len(entries)} clips "
          f"({made} new, {len(entries) - made} cached), {total_sec / 60:.1f} min audio, "
          f"{raw_kb:.0f} KB opus, {len(js) / 1024:.0f} KB file.")
    if failed:
        print(f"{len(failed)} line(s) FAILED and are missing from audio.js:")
        for v, t in failed:
            print(f"  {v}|{t}")
        sys.exit(1)


if __name__ == "__main__":
    main()
