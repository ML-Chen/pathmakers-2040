#!/usr/bin/env python3
"""Mandarin narration for the RedNote video: python3 promo/rednote/vo.py OUT_DIR [speaker] [speed]
Reads the lines from promo/rednote/shots.js, voices each line, trims silence, levels loudness, and writes
OUT_DIR/<shot id>.wav plus OUT_DIR/durations.json. Also writes OUT_DIR/audition_<voice>.wav (the first line in several
voices) so the family can pick a narrator by ear.
Engine: ElevenLabs (eleven_multilingual_v2) when ELEVENLABS_API_KEY is set; then [speaker] is an ElevenLabs voice name
from tools/make_audio.py's list or a voice id (default Sarah). Otherwise Kokoro (promo/tools/zh_tts.py), where
[speaker] is a Kokoro Mandarin voice (default zf_xiaoxiao)."""
import json, os, subprocess, sys, time, urllib.request, urllib.error
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'tools'))
EL_KEY = os.environ.get('ELEVENLABS_API_KEY', '').strip()
zh_tts = None
if not EL_KEY:
    import zh_tts
EL = {'Sarah': 'EXAVITQu4vr4xnSDxMaL', 'Laura': 'FGY2WhTYpPnrIDTdsKH5', 'Jessica': 'cgSgspJ2msm6clMCkdW9', 'Matilda': 'XrExE9yKIg1WjnnlVkGX',
      'Aria': '9BWtsMINqrJLrRacOk9x', 'Lily': 'pFZP5JQG7iQjIQuC4Bku', 'Charlotte': 'XB0fDUnXU5powFXDhCwa', 'Brian': 'nPczCjzI2devNBz1zQrb',
      'Eric': 'cjVigY5qzO86Huf0OWal', 'Chris': 'iP95p4xoKVk53GoZ742B', 'Liam': 'TX3LPaxmHKxFdv7VOQHJ', 'Daniel': 'onwK4e9ZLuTAKqWW03F9'}

def el_api(method, path, body=None):
    req = urllib.request.Request('https://api.elevenlabs.io' + path, method=method, data=json.dumps(body).encode() if body is not None else None,
                                 headers={'xi-api-key': EL_KEY, 'content-type': 'application/json', 'accept': 'application/json'})
    with urllib.request.urlopen(req, timeout=60) as r: return json.loads(r.read() or b'{}')

def mandarin_voices(n=8):
    """The most-used native Mandarin narration voices in the ElevenLabs voice library, added to this account.
    Returns [(name, voice_id)]. The built-in voices are English speakers and read Chinese with an English accent."""
    found, seen = [], set()
    for q in ['language=zh&use_cases=narrative_story', 'language=zh&use_cases=informative_educational', 'language=zh&use_cases=social_media', 'language=zh']:
        try: vs = el_api('GET', f'/v1/shared-voices?page_size=30&sort=usage_character_count_1y&{q}').get('voices', [])
        except Exception as e: print('voice search failed:', str(e)[:120]); vs = []
        for v in vs:
            acc = (v.get('accent') or '').lower(); lang = (v.get('language') or '').lower()
            if v['voice_id'] in seen or lang not in ('zh', 'cmn', 'chinese') or any(a in acc for a in ('cantonese', 'taiwan', 'english', 'american', 'british')): continue
            seen.add(v['voice_id']); found.append(v)
        if len(found) >= n: break
    mine = {}
    try: mine = {v['name']: v['voice_id'] for v in el_api('GET', '/v1/voices').get('voices', [])}
    except Exception: pass
    out = []
    for v in found[:n]:
        nm = 'PM zh ' + (v.get('name') or v['voice_id'])[:30]
        vid = mine.get(nm)
        if not vid:
            try: vid = el_api('POST', f"/v1/voices/add/{v['public_owner_id']}/{v['voice_id']}", {'new_name': nm}).get('voice_id')
            except Exception as e: print('could not add', nm, str(e)[:120]); continue
        out.append((nm[6:], vid)); print('Mandarin voice:', nm[6:], v.get('gender'), v.get('age'), v.get('accent'), v.get('use_case'), flush=True)
    return out

def eleven(voice, text, speed, dst):
    vid = EL.get(voice, voice)
    body = json.dumps({'text': text, 'model_id': os.environ.get('ELEVENLABS_MODEL', 'eleven_multilingual_v2'),
                       'voice_settings': {'stability': 0.5, 'similarity_boost': 0.8, 'style': 0.25, 'use_speaker_boost': True, 'speed': speed}}).encode()
    req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{vid}?output_format=mp3_44100_128', data=body, method='POST',
                                 headers={'xi-api-key': EL_KEY, 'content-type': 'application/json', 'accept': 'audio/mpeg'})
    for attempt in range(6):
        try:
            with urllib.request.urlopen(req, timeout=120) as r: mp3 = r.read()
            break
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503) and attempt < 5: time.sleep(3 * (attempt + 1)); continue
            raise RuntimeError(f'ElevenLabs HTTP {e.code}: {e.read()[:300]!r}')
    tmp = dst + '.mp3'; open(tmp, 'wb').write(mp3)
    subprocess.run(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-i', tmp, dst], check=True); os.remove(tmp)

def synth(voice, text, speed, dst):
    """ElevenLabs when the key works; if it fails (for example out of credits), switch to Kokoro for the rest of the run."""
    global EL_KEY, zh_tts, speaker
    if EL_KEY and voice not in EL and not (len(voice) > 15 and voice.isalnum()):
        print('no native Mandarin ElevenLabs voice; using Kokoro', flush=True); EL_KEY = ''
        import zh_tts as _z; zh_tts = _z; speaker = 'zf_xiaoxiao'; voice = speaker
    if EL_KEY:
        try: return eleven(voice, text, speed, dst)
        except Exception as e:
            print('ElevenLabs failed, using Kokoro instead:', str(e)[:200], flush=True); EL_KEY = ''
            import zh_tts as _z; zh_tts = _z; speaker = 'zf_xiaoxiao'; voice = speaker
    if voice in EL or not voice.startswith(('zf_', 'zm_')): voice = 'zf_xiaoxiao'
    return zh_tts.synth(voice, text, speed, dst)

ZH = []
if EL_KEY:
    try: ZH = mandarin_voices()
    except Exception as e: print('Mandarin voice lookup failed:', str(e)[:200])
    for nm, vid in ZH: EL[nm] = vid
out = sys.argv[1]; speaker = sys.argv[2] if len(sys.argv) > 2 and sys.argv[2] else ((ZH[0][0] if ZH else 'zf_xiaoxiao') if EL_KEY else 'zf_xiaoxiao'); speed = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0
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
    synth(speaker, s['vo'], speed, raw)
    dur[s['id']] = clean(raw, os.path.join(out, s['id'] + '.wav')); os.remove(raw)
    print(f"{s['id']}: {dur[s['id']]:.2f}s  {s['vo']}", flush=True)
json.dump(dur, open(os.path.join(out, 'durations.json'), 'w'), ensure_ascii=False, indent=1)

text = shots[0]['vo']
voices = [nm for nm, _ in ZH] if EL_KEY else [n for n in zh_tts.NAMES if n[:3] in ('zf_', 'zm_')]
for sp in voices:
    raw = os.path.join(out, 'a.raw.wav'); synth(sp, text, speed, raw); clean(raw, os.path.join(out, f'audition_{sp}.wav')); os.remove(raw)
print('engine', 'ElevenLabs' if EL_KEY else 'Kokoro', 'voice', speaker)
print('total narration', round(sum(dur.values()), 1), 's')
