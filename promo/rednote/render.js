// Renders the RedNote concept video: node promo/rednote/render.js dist/pathmakers.html OUT [vo_dir]
// Each shot in shots.js is played live in the game at 405x540 CSS px (3:4) with deviceScaleFactor 8/3, so frames are
// 1080x1920. The page runs on a virtual clock stepped one 30 fps frame at a time while full-size screenshots are taken, and the
// frames are assembled at page time with ffmpeg at 30 fps, so motion is smooth.
// With vo_dir (made by vo.py: <id>.wav and durations.json) each shot lasts as long as its line plus a pause, and the
// narration and music are mixed in; without it, shots use estimated lengths and only the music plays (a preview).
// Writes OUT/rednote.mp4, OUT/stills/<n>-<id>.png (one still per shot) and OUT/contact.jpg.
const {chromium} = require('playwright'); const fs = require('fs'), path = require('path'), {execFileSync} = require('child_process');
const [html, out = '/tmp/pm-promo', voDir] = process.argv.slice(2);
const SHOTS = require('./shots.js').filter(s => !process.env.PROMO_ONLY || process.env.PROMO_ONLY.split(',').includes(s.id)); const ROOT = path.resolve(__dirname, '..', '..');  // PROMO_ONLY=hook,bench renders just those shots
for (const d of ['frames', 'segs', 'stills', 'clean']) fs.mkdirSync(path.join(out, d), {recursive: true});
const ff = (...a) => execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...a]);
const VO = voDir && fs.existsSync(path.join(voDir, 'durations.json')) ? JSON.parse(fs.readFileSync(path.join(voDir, 'durations.json'))) : null;
const LEAD = 0.35, PAUSE = 0.55;
const W = 405, H = 540, OW = 1440, OH = 1920;                    // 3:4 portrait, rendered sharp at 1440x1920
// a slow camera move on every shot (the captions stay still): push in, pull out, drift left or right, rise
const CAMS = [{o: '50% 40%', a: 'scale(1.0)', b: 'scale(1.13)'}, {o: '50% 50%', a: 'scale(1.16) translateX(-3%)', b: 'scale(1.04) translateX(2%)'},
  {o: '30% 60%', a: 'scale(1.06)', b: 'scale(1.18) translateY(-2%)'}, {o: '70% 40%', a: 'scale(1.15) translateX(3%)', b: 'scale(1.03) translateX(-2%)'},
  {o: '50% 70%', a: 'scale(1.12) translateY(3%)', b: 'scale(1.02) translateY(-1%)'}];                                      // silence before and after each line
const est = s => [...s.vo].filter(ch => /[一-鿿]/.test(ch)).length / 4.6 + (s.vo.match(/[A-Za-z]+/g) || []).length * 0.35;
const dur = s => Math.max(s.min || 3, LEAD + (VO && VO[s.id] ? VO[s.id] : est(s)) + PAUSE) + (s.tail || 0);

const CSS = `
.hud,.toast,#hint,.sheet{display:none!important}
.subtitle{display:none!important}
#pr{position:fixed;inset:0;pointer-events:none;z-index:9999;font-family:"Noto Sans CJK SC","Noto Sans SC",sans-serif}
#pr .chip{position:absolute;left:14px;top:14px;background:rgba(18,20,52,.72);color:#fff;font-weight:700;font-size:13px;letter-spacing:.06em;padding:5px 11px;border-radius:999px;backdrop-filter:blur(6px)}
#pr .shade{position:absolute;left:0;right:0;bottom:0;height:42%;background:linear-gradient(180deg,rgba(10,12,36,0),rgba(10,12,36,.78) 55%,rgba(10,12,36,.9))}
#pr .cap{position:absolute;left:18px;right:18px;bottom:26px;color:#fff;font-weight:900;font-size:22px;line-height:1.42;text-align:center;text-shadow:0 2px 10px rgba(0,0,0,.6)}
#prf{position:fixed;left:0;top:0;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.55);border:3px solid #fff;box-shadow:0 4px 16px rgba(0,0,0,.35);z-index:10000;opacity:0;pointer-events:none;transition:transform .35s cubic-bezier(.3,.7,.3,1),opacity .2s}
#prf.tap{animation:prtap .45s ease-out}
@keyframes prtap{0%{box-shadow:0 0 0 0 rgba(255,255,255,.8)}40%{transform:var(--t) scale(.8)}100%{box-shadow:0 0 0 26px rgba(255,255,255,0)}}
/* characters act: they talk, bob and breathe; Byte bounces */
.speaker{animation:prbob 1.6s ease-in-out infinite alternate;transform-origin:50% 100%}
.speaker .p-mouth{transform-box:fill-box;transform-origin:center top;animation:talk .17s ease-in-out infinite alternate}
.speaker .p-mouth[data-m=happy],.speaker .p-mouth[data-m=o]{animation-name:talkbig}
@keyframes prbob{from{transform:translateY(0) rotate(-.6deg)}to{transform:translateY(-6px) rotate(.6deg)}}
.byteart{animation:hop 1.1s ease-in-out infinite}
#pr .cap{animation:none}
@keyframes prcam{from{transform:var(--c0)}to{transform:var(--c1)}}
#pr.shot-hook .big{top:40%;animation:none}#pr.shot-hook .cap{animation:none}
.pr-hook{display:flex;flex-direction:column;align-items:center;gap:6px}
.pr-hook b{background:rgba(255,255,255,.96);color:#1f2350;font-size:30px;font-weight:900;padding:4px 16px;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.45)}
.pr-hook b.q{background:#ffd45c;font-size:40px;padding:6px 20px}
#pr .big{position:absolute;left:0;right:0;top:36%;transform:translateY(-50%);display:flex;justify-content:center;animation:prpop .55s cubic-bezier(.2,1.4,.4,1) .25s both}
@keyframes prin{from{opacity:0;transform:translateY(10px)}}
@keyframes prpop{from{opacity:0;transform:translateY(-50%) scale(.8)}}
.pr-src{background:rgba(255,255,255,.94);border-radius:18px;padding:14px 20px;text-align:center;box-shadow:0 14px 40px rgba(0,0,0,.35)}
.pr-src b{display:block;font-family:Fredoka,sans-serif;font-size:30px;color:#2a2f66}.pr-src span{font-weight:700;color:#5a608a;font-size:14px}
.pr-num{background:rgba(255,255,255,.95);border-radius:20px;padding:12px 22px;display:flex;align-items:center;gap:12px;box-shadow:0 14px 40px rgba(0,0,0,.35)}
.pr-num span{font-weight:900;color:#2a2f66;font-size:17px}.pr-num b{font-family:Fredoka,sans-serif;font-size:34px}.pr-num .pr-from{color:#16a37a}.pr-num .pr-to{color:#e8566c;animation:prto 1.2s 1.4s both}.pr-num i{font-style:normal;font-size:26px;color:#8a90b0}
@keyframes prto{from{opacity:0;transform:scale(1.6)}}
.pr-words{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.pr-words b{background:rgba(255,255,255,.95);color:#2a2f66;font-size:30px;font-weight:900;border-radius:16px;padding:10px 22px;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,.35);animation:prpop2 .5s cubic-bezier(.2,1.4,.4,1) both}
.pr-words b:nth-child(2){animation-delay:.5s}.pr-words b:nth-child(3){animation-delay:1s}.pr-words b:nth-child(4){animation-delay:1.5s}
@keyframes prpop2{from{opacity:0;transform:scale(.6)}}
.pr-logo,.pr-end{position:fixed;left:0;right:0;top:15%;text-align:center;z-index:5}
.pr-logo h1,.pr-end h1{font-family:Fredoka,sans-serif;font-size:38px;white-space:nowrap;color:#fff;margin:0;text-shadow:0 4px 18px rgba(30,20,80,.55)}
.pr-logo h1 span,.pr-end h1 span{display:inline-block;background:#ffd45c;color:#2a2140;border-radius:14px;padding:0 10px;margin-left:4px;text-shadow:none}
.pr-end{top:auto;position:static}.pr-end p{color:#fff;font-weight:700;font-size:12px;margin:10px 18px 0;text-shadow:0 2px 8px rgba(0,0,0,.6)}
.pr-byte{position:fixed;left:50%;top:42%;width:190px;transform:translateX(-50%);z-index:5}.pr-byte.low{top:9%;width:170px}
#pr.shot-end .big{top:61%}
#pr.shot-game .big{top:5%}
#pr.shot-game ~ .pr-byte,.pr-byte{top:46%}
.pr-byte .byteart{width:100%}
`;

(async () => {
  // Frame-stepped capture: the page runs on a virtual clock that only moves when we say so. JS clocks, timers and
  // animation frames use it, and every CSS animation and transition is paused and moved forward by hand. Each frame is
  // exactly 1/30 s of page time, however long the full-resolution screenshot takes, so the video plays at a true 30 fps.
  const FPS = 30, DT = 1000 / FPS;
  const b = await chromium.launch();
  const ctx = await b.newContext({viewport: {width: W, height: H}, deviceScaleFactor: OW / W});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => {
    window.__noaudio = 1; window.__pmDpr = 5; try { localStorage.clear() } catch (e) {}  // paint backgrounds at full video resolution, with room for camera zoom
    const base = performance.now(), d0 = Date.now(); let vt = 0, seq = 0; const timers = new Map(); let rafs = [];
    performance.now = () => base + vt; Date.now = () => Math.round(d0 + vt);
    window.setTimeout = (f, ms, ...a) => { const id = ++seq; timers.set(id, {due: vt + Math.max(0, +ms || 0), f, a}); return id };
    window.setInterval = (f, ms, ...a) => { const id = ++seq; const every = Math.max(1, +ms || 0); timers.set(id, {due: vt + every, f, a, every}); return id };
    window.clearTimeout = window.clearInterval = id => timers.delete(id);
    window.requestAnimationFrame = cb => { const id = ++seq; rafs.push([id, cb]); return id };
    window.cancelAnimationFrame = id => { rafs = rafs.filter(r => r[0] !== id) };
    const css = dt => { for (const an of document.getAnimations()) { try { if (an.playState !== 'paused') an.pause(); an.currentTime = (an.currentTime || 0) + dt } catch (e) {} } };
    // move page time forward by ms: run due timers in order, then one animation frame, then the CSS animations
    window.__adv = ms => { const end = vt + ms;
      for (let guard = 0; guard < 5000; guard++) { let nx = null; for (const [id, t] of timers) if (t.due <= end && (!nx || t.due < nx[1].due)) nx = [id, t]; if (!nx) break;
        const [id, t] = nx; vt = Math.max(vt, t.due); if (t.every) t.due += t.every; else timers.delete(id); try { typeof t.f === 'function' ? t.f(...t.a) : (0, eval)(t.f) } catch (e) { console.error(e) } }
      const dt = end - vt; vt = end; const q = rafs; rafs = []; for (const [, cb] of q) try { cb(base + vt) } catch (e) { console.error(e) }
      css(ms) };
    window.__run = ms => { for (let t = 0; t < ms; t += 1000 / 30) window.__adv(Math.min(1000 / 30, ms - t)) };
    window.__pt = () => performance.now();
  });
  await p.goto('file://' + path.resolve(html)); await p.waitForTimeout(300); await p.evaluate(() => __run(800));
  await p.addStyleTag({content: CSS});
  // a finger that taps buttons on screen: prTap(selector, text?) moves to the element, shows a ripple, then clicks it
  await p.evaluate(() => {
    const f = document.createElement('div'); f.id = 'prf'; document.body.appendChild(f);
    window.prTap = (sel, text) => { const els = [...document.querySelectorAll(sel)].filter(e => !text || e.textContent.includes(text)); const el = els[0]; if (!el) return;
      const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2; f.style.opacity = 1; f.style.transform = `translate(${x - 22}px,${y - 22}px)`;
      setTimeout(() => { f.classList.remove('tap'); void f.offsetWidth; f.classList.add('tap'); el.click(); setTimeout(() => { const n = document.getElementById('prf'); if (n !== f) document.body.appendChild(f) }, 50) }, 380) };
    // prFlick(dy, ms): a finger flick: the page jumps fast, then slows to a stop (ease-out), with the finger swiping up
    window.prFlick = (dy, ms) => { ms = ms || 700; const x = innerWidth * .62, y0 = innerHeight * .72; f.style.opacity = 1; f.style.transition = 'none'; f.style.transform = `translate(${x - 22}px,${y0 - 22}px)`;
      const st = performance.now(), from = scrollY, sc = document.scrollingElement; requestAnimationFrame(function step() { const k = Math.min(1, (performance.now() - st) / ms), e = 1 - Math.pow(1 - k, 3);
        window.scrollTo(0, from + dy * e); f.style.transform = `translate(${x - 22}px,${y0 - 22 - Math.min(1, k * 3) * 140}px)`; f.style.opacity = k < .4 ? 1 : Math.max(0, 1 - (k - .4) * 2.5);
        if (k < 1) requestAnimationFrame(step); else f.style.transition = '' }) };
  });
  await p.evaluate(() => { S.mute = true; S.player = 'Juniper'; S.lang = 'zh'; save() });
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Animation.enable'); await cdp.send('Animation.setPlaybackRate', {playbackRate: 0});  // only our clock moves animations
  const wait = ms => p.evaluate(ms => __run(ms), ms);                   // wait in page time
  const segs = []; let total = 0;
  for (const [n, s] of SHOTS.entries()) {
    const D = dur(s);
    // every line is split at punctuation into captions of at most two lines (about 15 Chinese characters per line)
    if (!s.caps) { const parts = s.vo.match(/[^，。？！：；、]+[，。？！：；、]?/g) || [s.vo]; const w = t => [...t].reduce((a, ch) => a + (/[\u4e00-\u9fff，。？！：；、《》]/.test(ch) ? 1 : .55), 0);
      s.caps = []; let cur = ''; for (const q of parts) { if (cur && w(cur + q) > 29) { s.caps.push(cur); cur = q } else cur += q } if (cur) s.caps.push(cur) }
    await p.evaluate(({setup, hide}) => {
      document.querySelectorAll('#pr,#pr-hide').forEach(e => e.remove()); const pf = document.getElementById('prf'); if (pf) { pf.style.opacity = 0; document.body.appendChild(pf) }
      try { (0, eval)(setup) } catch (e) { console.error(e) }
      document.getElementById('app').style.animation = 'none';
      const st = document.createElement('style'); st.id = 'pr-hide'; st.textContent = (hide || []).join(',') + (hide && hide.length ? '{display:none!important}' : ''); document.head.appendChild(st);
    }, {setup: s.setup || (s.cycle && s.cycle[1]), hide: s.hide});
    await wait(s.hook ? 300 : 900);                                    // let the scene paint and the entrance finish
    if (!s.hook) await p.screenshot({path: path.join(out, 'clean', `${s.id}.png`)});
    const cam = CAMS[n % CAMS.length];
    await p.evaluate(({place, vo, big, id, D, cam, caps}) => {
      const app = document.getElementById('app'); app.style.transformOrigin = cam.o; app.style.animation = `prcam ${D}s cubic-bezier(.3,.1,.3,1) both`;
      document.documentElement.style.setProperty('--c0', cam.a); document.documentElement.style.setProperty('--c1', cam.b);
      const d = document.createElement('div'); d.id = 'pr'; d.className = 'shot-' + id;
      d.innerHTML = `${place ? `<div class="chip">${place}</div>` : ''}<div class="shade"></div>${big ? `<div class="big">${big}</div>` : ''}<div class="cap">${(caps && caps[0]) || vo}</div>`;  // caps is filled below for later chunks
      document.body.appendChild(d);
    }, {...s, D, cam});
    // timed changes inside a shot run in page time too
    const events = [];
    for (const [t, code] of (s.taps || [])) events.push([t, code, false]);
    // a long line shows as several captions (s.caps), each up to three lines, switched in proportion to their length
    if (s.caps && s.caps.length > 1) { const tot = s.caps.join('').length, voLen = (VO && VO[s.id]) || est(s); let acc = 0;
      s.caps.forEach((c, i) => { if (i) events.push([Math.max(0, LEAD + voLen * acc / tot - 0.25) * 1000, `(()=>{const e=document.querySelector('#pr .cap');if(e){e.style.animation='none';e.textContent=${JSON.stringify(c)}}})()`, false]); acc += c.length }) }
    if (s.every) for (let t = s.every[0]; t < D * 1000; t += s.every[0]) events.push([t, s.every[1], false]);
    if (s.cycle) { const [ms, ...setups] = s.cycle; for (let k = 1, t = ms; t < D * 1000 && k < setups.length; k++, t += ms) events.push([t, setups[k], true]) }  // each place once; the last one holds
    events.sort((a, b) => a[0] - b[0]);
    const dir = path.join(out, 'frames', String(n).padStart(2, '0')); fs.rmSync(dir, {recursive: true, force: true}); fs.mkdirSync(dir);
    const frames = []; let still = false; const N = Math.round(D * FPS);
    for (let f = 0; f < N; f++) {
      const t = f * DT;
      while (events.length && events[0][0] <= t) { const [, code, keep] = events.shift();
        await p.evaluate(({code, keep}) => { const pr = document.getElementById('pr'); try { (0, eval)(code) } catch (e) {} if (keep && pr) { pr.querySelectorAll('*').forEach(e => e.style.animation = 'none'); document.body.appendChild(pr) } }, {code, keep}).catch(() => {}) }
      const file = path.join(dir, String(frames.length).padStart(5, '0') + '.jpg');
      const shot = await cdp.send('Page.captureScreenshot', {format: 'jpeg', quality: 94, optimizeForSpeed: true}); fs.writeFileSync(file, Buffer.from(shot.data, 'base64')); frames.push([file, t / 1000]);
      if (!still && f >= N * .45) { fs.copyFileSync(file, path.join(out, 'stills', `${String(n + 1).padStart(2, '0')}-${s.id}.jpg`)); still = true }
      await p.evaluate(dt => __adv(dt), DT);
    }
    if (!frames.length) { errs.push(s.id + ': no frames'); continue }
    // concat list with real frame durations, then a constant 30 fps segment of exactly D seconds

    const seg = path.join(out, 'segs', `${String(n).padStart(2, '0')}.mp4`);
    ff('-framerate', String(FPS), '-i', path.join(dir, '%05d.jpg'), '-vf', `scale=${OW}:${OH}:flags=lanczos,format=yuv420p,setsar=1`, '-t', D.toFixed(3),
       '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '17', '-an', seg);
    segs.push({seg, D, s, at: total}); total += D;
    console.log(`${s.id}: ${D.toFixed(1)}s, ${frames.length} frames`);
  }
  await b.close();
  // join the shots with short crossfades
  const X = 0.28, TR = ['slideleft', 'smoothup', 'circleopen', 'slideright', 'wipeleft', 'smoothleft', 'fade']; let inputs = [], filt = [], last = '[0:v]', off = 0;
  segs.forEach(({seg}, i) => inputs.push('-i', seg));
  for (let i = 1; i < segs.length; i++) { off += segs[i - 1].D - X; const o = `[v${i}]`; filt.push(`${last}[${i}:v]xfade=transition=${i === 1 ? 'fade' : TR[i % TR.length]}:duration=${X}:offset=${off.toFixed(3)}${o}`); last = o; segs[i].at = off }
  const vlen = off + segs[segs.length - 1].D;
  const video = path.join(out, 'video.mp4');
  ff(...inputs, ...(filt.length ? ['-filter_complex', filt.join(';')] : []), '-map', filt.length ? last : '0:v', '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-tune', 'animation', '-pix_fmt', 'yuv420p', video);
  // audio: music bed (the game's Future Table track), ducked under the narration
  // PROMO_MUSIC=file (mp3, wav, ogg) uses that track instead, for example one made with Suno; promo/rednote/music.* is used if present
  const own = process.env.PROMO_MUSIC || ['mp3', 'wav', 'ogg', 'm4a'].map(e => path.join(__dirname, 'music.' + e)).find(f => fs.existsSync(f));
  const music = own || path.join(out, 'music.ogg');
  if (!fs.existsSync(music)) { const t = fs.readFileSync(path.join(ROOT, 'src', 'music_tracks.js'), 'utf8'); const m = JSON.parse(t.match(/const MUSIC_TRACKS=(\{.*\})/s)[1].replace(/;\s*$/, '')); fs.writeFileSync(music, Buffer.from(m.table.split(',')[1], 'base64')) }
  const final = path.join(out, 'rednote.mp4'); const aIn = ['-i', video, '-stream_loop', '-1', '-i', music]; let af;
  if (VO) {
    const vo = segs.map(({s}) => path.join(voDir, s.id + '.wav')).filter(f => fs.existsSync(f));
    segs.forEach(({s}) => aIn.push('-i', path.join(voDir, s.id + '.wav')));
    const delays = segs.map(({at}, i) => `[${i + 2}:a]adelay=${Math.round((at + LEAD) * 1000)}|${Math.round((at + LEAD) * 1000)},aresample=44100[n${i}]`);
    af = `${delays.join(';')};${segs.map((_, i) => `[n${i}]`).join('')}amix=inputs=${segs.length}:normalize=0,volume=1.6,aformat=channel_layouts=stereo,asplit=2[vo][sc];` +
      `[1:a]aresample=44100,aformat=channel_layouts=stereo,volume=0.55,afade=t=in:d=0.6,afade=t=out:st=${(vlen - 2).toFixed(2)}:d=2[mu];[mu][sc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=400[duck];[duck][vo]amix=inputs=2:normalize=0[a]`;
  } else af = `[1:a]aresample=44100,volume=0.6,afade=t=in:d=0.6,afade=t=out:st=${(vlen - 2).toFixed(2)}:d=2[a]`;
  ff(...aIn, '-filter_complex', af, '-map', '0:v', '-map', '[a]', '-t', vlen.toFixed(3), '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', final);
  // contact sheet of the stills
  const st = fs.readdirSync(path.join(out, 'stills')).filter(f => /\.(png|jpg)$/.test(f)).sort().map(f => path.join(out, 'stills', f));
  ff(...st.flatMap(f => ['-i', f]), '-filter_complex', st.map((_, i) => `[${i}:v]scale=270:480[s${i}]`).join(';') + ';' + st.map((_, i) => `[s${i}]`).join('') + `xstack=inputs=${st.length}:layout=${st.map((_, i) => `${(i % 8) * 270}_${Math.floor(i / 8) * 480}`).join('|')}:fill=black`, '-frames:v', '1', path.join(out, 'contact.jpg'));
  fs.writeFileSync(path.join(out, 'errors.txt'), errs.join('\n'));
  console.log(`${final}: ${vlen.toFixed(1)}s, ${VO ? 'with narration' : 'music only (no vo_dir)'}; errors: ${errs.join('; ') || 'none'}`);
})();
