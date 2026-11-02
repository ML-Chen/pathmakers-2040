#!/usr/bin/env python3
"""Mandarin TTS with Kokoro multi-lang v1.0 via sherpa-onnx. Loading code adapted from pathmakers tools/make_audio.py.
usage: zh_tts.py speaker speed out.wav "text"   (or --list)"""
import os, sys, wave
import numpy as np
MODEL_DIR = os.environ.get('TTS_MODEL_DIR') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'tts-models', 'kokoro-multi-lang-v1_0')

def speaker_names(model_path):
    size = os.path.getsize(model_path)
    with open(model_path, "rb") as f:
        f.seek(max(0, size - (1 << 20))); tail = f.read()
    key = b"speaker_names"
    i = tail.rfind(b"\n" + bytes([len(key)]) + key); j = i + 2 + len(key)
    j += 1; n = shift = 0
    while True:
        b = tail[j]; j += 1; n |= (b & 0x7F) << shift; shift += 7
        if b < 0x80: break
    return tail[j:j + n].decode("utf-8").split(",")

NAMES = speaker_names(os.path.join(MODEL_DIR, 'model.onnx'))
_tts = None
def engine():
    global _tts
    if _tts is None:
        import sherpa_onnx
        M = lambda f: os.path.join(MODEL_DIR, f)
        cfg = sherpa_onnx.OfflineTtsConfig(
            model=sherpa_onnx.OfflineTtsModelConfig(
                kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(
                    model=M('model.onnx'), voices=M('voices.bin'), tokens=M('tokens.txt'),
                    data_dir=M('espeak-ng-data'), dict_dir=M('dict'),
                    lexicon=M('lexicon-us-en.txt') + ',' + M('lexicon-zh.txt'),
                    lang=os.environ.get('KLANG','')),
                num_threads=int(os.environ.get('TTS_THREADS', '2'))),
            rule_fsts=M('phone-zh.fst') + ',' + M('date-zh.fst') + ',' + M('number-zh.fst'),
            max_num_sentences=1)
        _tts = sherpa_onnx.OfflineTts(cfg)
    return _tts

def synth(speaker, text, speed, out):
    a = engine().generate(text, sid=NAMES.index(speaker), speed=speed)
    x = np.clip(np.array(a.samples, dtype=np.float32), -1, 1)
    with wave.open(out, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(a.sample_rate)
        w.writeframes((x * 32767).astype(np.int16).tobytes())
    return len(x) / a.sample_rate

if __name__ == '__main__':
    if sys.argv[1] == '--list':
        print(len(NAMES), NAMES); sys.exit()
    sp, speed, out, text = sys.argv[1], float(sys.argv[2]), sys.argv[3], sys.argv[4]
    print(f'{out}: {synth(sp, text, speed, out):.2f}s')
