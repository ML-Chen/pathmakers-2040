// Every screen of every mission, with layout checks: node tools/deep_all.js dist/pathmakers.html OUT [jobs]
// Runs tools/mission_deep_shots.js for each mission (PM_JOBS at a time, default 4) at the size in PM_VW x PM_VH and
// language PM_LANG, then writes OUT/sheets/<mission>.jpg (labeled contact sheets), OUT/issues.txt (every layout
// problem, by mission and shot) and OUT/errors.txt (page errors). Exit 1 when there are page errors.
const {chromium} = require('playwright'); const {spawn} = require('child_process'); const fs = require('fs'), path = require('path');
const [html, out = '/tmp/pm-deep', jobsArg] = process.argv.slice(2); const JOBS = +(jobsArg || process.env.PM_JOBS || 4);
fs.mkdirSync(path.join(out, 'sheets'), {recursive: true});
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://' + path.resolve(html)); await p.waitForTimeout(500);
  const ids = (process.env.PM_ONLY ? process.env.PM_ONLY.split(',') : await p.evaluate(() => Object.keys(MISSIONS)));
  await b.close();
  const queue = [...ids]; const run = id => new Promise(res => {
    const c = spawn('node', [path.join(__dirname, 'mission_deep_shots.js'), html, path.join(out, id), id], {stdio: ['ignore', 'pipe', 'pipe']});
    let log = ''; c.stdout.on('data', d => log += d); c.stderr.on('data', d => log += d);
    const t = setTimeout(() => c.kill('SIGKILL'), 20 * 60 * 1000);
    c.on('close', code => { clearTimeout(t); console.log(id + ': ' + (log.trim().split('\n').pop() || 'exit ' + code).slice(0, 160)); res() }) });
  if (!process.env.PM_SHEETS_ONLY) await Promise.all([...Array(JOBS)].map(async () => { while (queue.length) await run(queue.shift()) }));
  // contact sheets: 6 columns of labeled thumbnails per mission (full-page shots are cropped to the first screen)
  const sb = await chromium.launch(); const sp = await sb.newPage({viewport: {width: 1320, height: 800}});
  const issues = [], errors = [];
  if (process.env.PM_SHEETS_ONLY) {}
  for (const id of ids) {
    const dir = path.join(out, id); if (!fs.existsSync(dir)) continue;
    const pngs = fs.readdirSync(dir).filter(f => f.endsWith('.png')).sort();
    const iss = fs.existsSync(path.join(dir, 'issues.txt')) ? fs.readFileSync(path.join(dir, 'issues.txt'), 'utf8').split('\n').filter(Boolean) : [];
    const err = fs.existsSync(path.join(dir, 'errors.txt')) ? fs.readFileSync(path.join(dir, 'errors.txt'), 'utf8').split('\n').filter(Boolean) : [];
    iss.forEach(x => issues.push(id + '  ·  ' + x)); err.forEach(x => errors.push(id + '  ·  ' + x));
    const bad = new Set(iss.map(x => x.split('  ·  ')[0]));
    for (let k = 0; k < pngs.length; k += 36) {
      const part = pngs.slice(k, k + 36);
      const sheetHtml = path.join(out, 'sheets', '_sheet.html');
      fs.writeFileSync(sheetHtml, `<body style="margin:0;background:#1b1f3a;font:12px sans-serif;color:#fff"><div style="display:grid;grid-template-columns:repeat(6,210px);gap:8px;padding:10px">${part.map(f => `<div><div style="height:380px;overflow:hidden;border-radius:8px;outline:${bad.has(f.replace('.png', '')) ? '3px solid #ff5a5a' : 'none'}"><img src="file://${path.resolve(dir, f)}" style="width:210px;display:block"></div><div style="padding:3px 2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${f.replace('.png', '')}</div></div>`).join('')}</div></body>`);
      await sp.goto('file://' + path.resolve(sheetHtml)); await sp.waitForTimeout(500);
      await sp.screenshot({path: path.join(out, 'sheets', `${id}${pngs.length > 36 ? '-' + (k / 36 + 1) : ''}.jpg`), fullPage: true, type: 'jpeg', quality: 80});
    }
  }
  await sb.close();
  fs.writeFileSync(path.join(out, 'issues.txt'), issues.join('\n') + '\n'); fs.writeFileSync(path.join(out, 'errors.txt'), errors.join('\n') + '\n');
  console.log(`${ids.length} missions; ${issues.length} layout issues (red outlines on the sheets); ${errors.length} page errors`);
  process.exit(errors.length ? 1 : 0);
})();
