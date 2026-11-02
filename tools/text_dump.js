// Every line a player can read in a mission, in one file, so a person can review the writing start to finish:
// node tools/text_dump.js dist/pathmakers.html OUT [missionId,...]   -> OUT/<id>.md
// Walks the mission object (talk lines, choices, replies, documents, criteria, controls, consent answers, memo text,
// evening, Field Guide ideas and glossary entries it adds) and prints each string with where it lives. Skips Byte's
// hidden chat brief and code.
const {chromium} = require('playwright'); const fs = require('fs'), path = require('path');
const [html, out = '/tmp/pm-text', only] = process.argv.slice(2); fs.mkdirSync(out, {recursive: true});
(async () => {
  const b = await chromium.launch(); const p = await b.newPage(); await p.goto('file://' + path.resolve(html)); await p.waitForTimeout(500);
  const res = await p.evaluate(only => {
    try { S.mute = true } catch (e) {}
    const SKIP = /^(brief|canned|chatExtra|outcomes|shots|look|skin|hair|voice|mood|id|k|name|kind|viz|args|key|who|after|scene|scenes|place|track|clip|style|outfit|cls|data|icon|color|col)$/;
    const ids = only ? only.split(',') : Object.keys(MISSIONS); const outp = {};
    for (const id of ids) { const M0 = MISSIONS[id]; if (!M0) continue; const lines = []; const seen = new Set();
      const add = (where, s) => { s = String(s).replace(/<[^>]+>/g, '').replace(/\[\[([^\]|]+)(\|[^\]]+)?\]\]/g, '$1').replace(/\s+/g, ' ').trim();
        if (s.length < 3 || /^#[0-9a-f]{3,8}$/i.test(s) || !/[a-zA-Z一-鿿]{2}/.test(s) || /^[a-z_]+$/.test(s) || seen.has(s)) return; seen.add(s); lines.push([where, s]) };
      const walk = (v, where, depth) => { if (depth > 9 || v == null) return;
        if (typeof v === 'string') return add(where, v);
        if (Array.isArray(v)) return v.forEach((x, i) => walk(x, where, depth + 1));
        if (typeof v === 'object') for (const [k, x] of Object.entries(v)) { if (SKIP.test(k) && typeof x !== 'object') { if (/^(name)$/.test(k) && typeof x === 'string' && x.includes(' ')) add(where + '.' + k, x); continue }
          if (typeof x === 'function') continue; walk(x, where ? where + '.' + k : k, depth + 1) } };
      try { S.choice = {...(M0.start || {})}; startMission(id) } catch (e) {}
      walk(M0, '', 0);
      for (const fn of ['evening', 'intro', 'blurb']) if (typeof M0[fn] === 'function') { try { walk(M0[fn](), fn + '()', 0) } catch (e) {} }
      if (M0.consent && typeof M0.consent.opts === 'function') { try { walk(M0.consent.opts(S.choice, M0), 'consent.opts()', 0) } catch (e) {} }
      outp[id] = {title: M0.title || id, lines} }
    return outp }, only);
  await b.close();
  for (const [id, {title, lines}] of Object.entries(res)) {
    const md = `# ${title} (${id})\n\n${lines.length} lines. Read it the way a 12-year-old will: does every sentence make sense on its own?\n\n` +
      lines.map(([w, s]) => `- **${w || 'top'}**: ${s}`).join('\n') + '\n';
    fs.writeFileSync(path.join(out, id + '.md'), md); console.log(id + ': ' + lines.length + ' lines');
  }
})();
