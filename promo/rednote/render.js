// Renders the RedNote concept video: node promo/rednote/render.js dist/pathmakers.html OUT [vo_dir]
// Each shot in shots.js is played live in the game at 405x540 CSS px (3:4) with deviceScaleFactor 8/3, so frames are
// 1080x1440. Frames come from Chrome's screencast with timestamps and are assembled with ffmpeg at 30 fps.
// With vo_dir (made by vo.py: <id>.wav and durations.json) each shot lasts as long as its line plus a pause, and the
// narration and music are mixed in; without it, shots use estimated lengths and only the music plays (a preview).
// Writes OUT/rednote.mp4, OUT/stills/<n>-<id>.png (one still per shot) and OUT/contact.jpg.
const {chromium} = require('playwright'); const fs = require('fs'), path = require('path'), {execFileSync} = require('child_process');
const [html, out = '/tmp/pm-promo', voDir] = process.argv.slice(2);
const SHOTS = require('./shots.js'); const ROOT = path.resolve(__dirname, '..', '..');
for (const d of ['frames', 'segs', 'stills']) fs.mkdirSync(path.join(out, d), {recursive: true});
const ff = (...a) => execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...a]);
const VO = voDir && fs.existsSync(path.join(voDir, 'durations.json')) ? JSON.parse(fs.readFileSync(path.join(voDir, 'durations.json'))) : null;
const LEAD = 0.35, PAUSE = 0.55;                                      // silence before and after each line
const est = s => [...s.vo].filter(ch => /[一-鿿]/.test(ch)).length / 4.6 + (s.vo.match(/[A-Za-z]+/g) || []).length * 0.35;
const dur = s => Math.max(s.min || 3, LEAD + (VO && VO[s.id] ? VO[s.id] : est(s)) + PAUSE) + (s.tail || 0);

const CSS = `
.hud,.toast,#hint,.sheet{display:none!important}
.subtitle{display:none!important}
#pr{position:fixed;inset:0;pointer-events:none;z-index:9999;font-family:"Noto Sans CJK SC","Noto Sans SC",sans-serif}
#pr .chip{position:absolute;left:14px;top:14px;background:rgba(18,20,52,.72);color:#fff;font-weight:700;font-size:13px;letter-spacing:.06em;padding:5px 11px;border-radius:999px;backdrop-filter:blur(6px)}
#pr .shade{position:absolute;left:0;right:0;bottom:0;height:42%;background:linear-gradient(180deg,rgba(10,12,36,0),rgba(10,12,36,.78) 55%,rgba(10,12,36,.9))}
#pr .cap{position:absolute;left:18px;right:18px;bottom:26px;color:#fff;font-weight:900;font-size:22px;line-height:1.42;text-align:center;text-shadow:0 2px 10px rgba(0,0,0,.6);animation:prin .5s ease-out both}
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
.pr-byte{position:fixed;left:50%;top:33%;width:190px;transform:translateX(-50%);z-index:5}.pr-byte.low{top:9%;width:170px}
#pr.shot-end .big{top:61%}
#pr.shot-game .big{top:16%}
.pr-byte .byteart{width:100%}
`;

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({viewport: {width: 405, height: 540}, deviceScaleFactor: 8 / 3});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__noaudio = 1; try { localStorage.clear() } catch (e) {} });
  await p.goto('file://' + path.resolve(html)); await p.waitForTimeout(800);
  await p.addStyleTag({content: CSS});
  await p.evaluate(() => { S.mute = true; S.player = 'Juniper'; S.lang = 'zh'; save() });
  const cdp = await ctx.newCDPSession(p);
  const segs = []; let total = 0;
  for (const [n, s] of SHOTS.entries()) {
    const D = dur(s);
    await p.evaluate(({setup, hide}) => {
      document.querySelectorAll('#pr,#pr-hide').forEach(e => e.remove());
      try { (0, eval)(setup) } catch (e) { console.error(e) }
      const st = document.createElement('style'); st.id = 'pr-hide'; st.textContent = (hide || []).join(',') + (hide && hide.length ? '{display:none!important}' : ''); document.head.appendChild(st);
    }, {setup: s.setup, hide: s.hide});
    await p.waitForTimeout(900);                                      // let the scene paint and the entrance finish
    await p.evaluate(({place, vo, big, id}) => {
      const d = document.createElement('div'); d.id = 'pr'; d.className = 'shot-' + id;
      d.innerHTML = `${place ? `<div class="chip">${place}</div>` : ''}<div class="shade"></div>${big ? `<div class="big">${big}</div>` : ''}<div class="cap">${vo}</div>`;
      document.body.appendChild(d);
    }, s);
    let timer = null;
    if (s.every) timer = setInterval(() => p.evaluate(s.every[1]).catch(() => {}), s.every[0]);
    const dir = path.join(out, 'frames', String(n).padStart(2, '0')); fs.rmSync(dir, {recursive: true, force: true}); fs.mkdirSync(dir);
    const frames = []; let t0 = null;
    const onFrame = async f => {
      const ts = f.metadata.timestamp; if (t0 === null) t0 = ts;
      const file = path.join(dir, String(frames.length).padStart(5, '0') + '.jpg');
      fs.writeFileSync(file, Buffer.from(f.data, 'base64')); frames.push([file, ts - t0]);
      cdp.send('Page.screencastFrameAck', {sessionId: f.sessionId}).catch(() => {});
    };
    cdp.on('Page.screencastFrame', onFrame);
    await cdp.send('Page.startScreencast', {format: 'jpeg', quality: 88, maxWidth: 1080, maxHeight: 1440, everyNthFrame: 1});
    await p.waitForTimeout(Math.round(D * 1000 * 0.45));
    await p.screenshot({path: path.join(out, 'stills', `${String(n + 1).padStart(2, '0')}-${s.id}.png`)});
    await p.waitForTimeout(Math.round(D * 1000 * 0.55) + 150);
    await cdp.send('Page.stopScreencast'); cdp.off('Page.screencastFrame', onFrame); if (timer) clearInterval(timer);
    if (!frames.length) { errs.push(s.id + ': no frames'); continue }
    // concat list with real frame durations, then a constant 30 fps segment of exactly D seconds
    const list = frames.map(([f, t], i) => `file '${f}'\nduration ${Math.max(0.001, ((frames[i + 1] ? frames[i + 1][1] : D) - t)).toFixed(4)}`).join('\n') + `\nfile '${frames[frames.length - 1][0]}'\n`;
    fs.writeFileSync(path.join(dir, 'list.txt'), list);
    const seg = path.join(out, 'segs', `${String(n).padStart(2, '0')}.mp4`);
    ff('-f', 'concat', '-safe', '0', '-i', path.join(dir, 'list.txt'), '-vf', 'scale=1080:1440:flags=lanczos,fps=30,format=yuv420p,setsar=1', '-t', D.toFixed(3),
       '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-an', seg);
    segs.push({seg, D, s, at: total}); total += D;
    console.log(`${s.id}: ${D.toFixed(1)}s, ${frames.length} frames`);
  }
  await b.close();
  // join the shots with short crossfades
  const X = 0.3; let inputs = [], filt = [], last = '[0:v]', off = 0;
  segs.forEach(({seg}, i) => inputs.push('-i', seg));
  for (let i = 1; i < segs.length; i++) { off += segs[i - 1].D - X; const o = `[v${i}]`; filt.push(`${last}[${i}:v]xfade=transition=fade:duration=${X}:offset=${off.toFixed(3)}${o}`); last = o; segs[i].at = off }
  const vlen = off + segs[segs.length - 1].D;
  const video = path.join(out, 'video.mp4');
  ff(...inputs, '-filter_complex', filt.join(';'), '-map', last, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', video);
  // audio: music bed (the game's Future Table track), ducked under the narration
  const music = path.join(out, 'music.ogg');
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
  const st = fs.readdirSync(path.join(out, 'stills')).filter(f => f.endsWith('.png')).sort().map(f => path.join(out, 'stills', f));
  ff(...st.flatMap(f => ['-i', f]), '-filter_complex', st.map((_, i) => `[${i}:v]scale=270:360[s${i}]`).join(';') + ';' + st.map((_, i) => `[s${i}]`).join('') + `xstack=inputs=${st.length}:layout=${st.map((_, i) => `${(i % 7) * 270}_${Math.floor(i / 7) * 360}`).join('|')}:fill=black`, '-frames:v', '1', path.join(out, 'contact.jpg'));
  fs.writeFileSync(path.join(out, 'errors.txt'), errs.join('\n'));
  console.log(`${final}: ${vlen.toFixed(1)}s, ${VO ? 'with narration' : 'music only (no vo_dir)'}; errors: ${errs.join('; ') || 'none'}`);
})();
