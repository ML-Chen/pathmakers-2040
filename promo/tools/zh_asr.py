#!/usr/bin/env python3
"""Transcribe wav files with sherpa-onnx paraformer zh small. usage: zh_asr.py a.wav [b.wav ...]"""
import sys, wave, numpy as np, sherpa_onnx
D = '/home/claude/promo/dl/asr/sherpa-onnx-paraformer-zh-small-2024-03-09'
rec = sherpa_onnx.OfflineRecognizer.from_paraformer(paraformer=D + '/model.int8.onnx', tokens=D + '/tokens.txt', num_threads=2, decoding_method='greedy_search')
for f in sys.argv[1:]:
    with wave.open(f) as w:
        sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
        if w.getnchannels() == 2: x = x.reshape(-1, 2).mean(1)
    s = rec.create_stream(); s.accept_waveform(sr, x); rec.decode_stream(s)
    print(f, '->', s.result.text)
