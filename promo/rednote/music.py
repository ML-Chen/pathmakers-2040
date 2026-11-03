#!/usr/bin/env python3
"""Original background music for the RedNote video from ElevenLabs Music: python3 promo/rednote/music.py OUT.mp3 [seconds]
Needs ELEVENLABS_API_KEY. Exits 1 (and writes nothing) if the key is missing or the request fails, so the render falls
back to the game's own track."""
import json, os, sys, urllib.request, urllib.error
out = sys.argv[1]; secs = float(sys.argv[2]) if len(sys.argv) > 2 else 95
key = os.environ.get('ELEVENLABS_API_KEY', '').strip()
if not key: print('no ElevenLabs key; using the game track'); sys.exit(1)
prompt = os.environ.get('PROMO_MUSIC_PROMPT') or (
    'Instrumental background music for a short, hopeful video about kids and the future of AI. Warm soft piano and '
    'gentle synth pads, light plucked marimba and soft glassy bells, a slow steady pulse around 90 BPM, a gradual lift '
    'in the middle and a calm, uplifting ending. Wonder and curiosity, a little cinematic, clean and modern. No vocals, '
    'no drums drops, nothing dramatic; it sits quietly under a narrator.')
body = json.dumps({'prompt': prompt, 'music_length_ms': int(secs * 1000), 'model_id': 'music_v1'}).encode()
req = urllib.request.Request('https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128', data=body, method='POST',
                             headers={'xi-api-key': key, 'content-type': 'application/json', 'accept': 'audio/mpeg'})
try:
    with urllib.request.urlopen(req, timeout=600) as r: data = r.read()
except urllib.error.HTTPError as e:
    print('ElevenLabs music failed:', e.code, e.read()[:300]); sys.exit(1)
except Exception as e:
    print('ElevenLabs music failed:', str(e)[:300]); sys.exit(1)
if len(data) < 100000: print('ElevenLabs music returned too little audio'); sys.exit(1)
open(out, 'wb').write(data); print('music:', out, len(data), 'bytes')
