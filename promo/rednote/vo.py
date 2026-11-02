#!/usr/bin/env python3
"""Mandarin narration for the RedNote video: python3 promo/rednote/vo.py OUT_DIR [speaker] [speed]
Reads the lines from promo/rednote/shots.js, voices each with Kokoro (promo/tools/zh_tts.py), trims silence, levels
loudness, and writes OUT_DIR/<shot id>.wav plus OUT_DIR/durations.json. Also writes OUT_DIR/audition_<speaker>.wav,
the first two lines in every Mandarin voice, so the family can pick a narrator by ear."""
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'tools'))
import zh_tts

out = sys.argv[1]; speaker = sys.argv[2] if len(sys.argv) > 2 else 'zf_xiaoxiao'; speed = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0
os.makedirs(out, exist_ok=True)
shots = json.loads(subprocess.run(['node', '-e', "process.stdout.write(JSON.stringify(require(process.argv[1]).map(s=>({id:s.id,vo:s.vo}))))",
                                   os.path.join(HERE, 'shots.js')], capture_output=True, text=True, check=True).stdout)

def clean(raw, dst):
    """Trim leading/trailing silence and level to about -16 LUFS, 44.1 kHz mono."""
    subprocess.run(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-i', raw, '-af',
                    'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,'
                    'loudnorm=I=-16:TP=-1.5:LRA=7,aresample=44100', '-ac', '1', dst], check=True)
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', dst],
                                capture_output=True, text=True).stdout)

dur = {}
for s in shots:
    raw = os.path.join(out, s['id'] + '.raw.wav')
    zh_tts.synth(speaker, s['vo'], speed, raw)
    dur[s['id']] = clean(raw, os.path.join(out, s['id'] + '.wav')); os.remove(raw)
    print(f"{s['id']}: {dur[s['id']]:.2f}s  {s['vo']}", flush=True)
json.dump(dur, open(os.path.join(out, 'durations.json'), 'w'), ensure_ascii=False, indent=1)

text = shots[0]['vo'] + shots[1]['vo']
for sp in [n for n in zh_tts.NAMES if n[:3] in ('zf_', 'zm_')]:
    raw = os.path.join(out, 'a.raw.wav'); zh_tts.synth(sp, text, speed, raw); clean(raw, os.path.join(out, f'audition_{sp}.wav')); os.remove(raw)
print('total narration', round(sum(dur.values()), 1), 's')
