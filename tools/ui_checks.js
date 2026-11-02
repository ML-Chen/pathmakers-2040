// Layout checks run inside the page on whatever screen is showing. Used by mission_deep_shots.js on every shot.
// Returns a list of short problem strings:
//  hscroll   the page scrolls sideways
//  offscreen a text label runs past the left or right edge of the window
//  overlap   two text labels cover each other (HTML text and SVG text)
//  covered   a button you can see but can't tap: a see-through layer (an SVG stage, an empty box) sits on its middle
//  faint     text whose color is nearly the same as the card behind it
module.exports = function uiChecks() {
  const out = [], W = innerWidth, H = innerHeight;
  const vis = el => { const s = getComputedStyle(el); if (s.visibility === 'hidden' || s.display === 'none' || +s.opacity === 0) return false;
    for (let n = el; n && n !== document.body; n = n.parentElement) { const t = getComputedStyle(n); if (+t.opacity < .05 || t.display === 'none') return false } return true };
  // a see-through layer: no background of its own (an SVG stage, an empty wrapper), so what is under it still shows
  const clear = el => { for (let n = el; n && n !== document.body; n = n.parentElement) { const s = getComputedStyle(n); const m = s.backgroundColor.match(/[\d.]+/g);
      if (s.backgroundImage !== 'none' || (m && (m[3] === undefined || +m[3] > .3))) return false; if (n.tagName === 'MAIN') break } return true };
  // is this element actually on top at its own middle (not hidden under a card)?
  const onTop = (el, r) => { const x = r.left + r.width / 2, y = r.top + r.height / 2; if (x < 0 || y < 0 || x >= W || y >= H) return true;
    const hit = document.elementFromPoint(x, y); if (!hit) return true; if (el.contains(hit) || hit.contains(el)) return true;
    if (el.closest('svg') && hit.closest('svg') === el.closest('svg')) return true; return getComputedStyle(hit).pointerEvents === 'none' || clear(hit) };
  const name = el => (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40);
  if (document.documentElement.scrollWidth > W + 2) out.push('hscroll ' + document.documentElement.scrollWidth + 'px');
  {
    const leaf = [...document.querySelectorAll('body *')].filter(el => {
      if (/^(SCRIPT|STYLE|svg|SVG|PATH|CANVAS|IMG)$/.test(el.tagName)) return false;
      if (el.closest('svg') && el.tagName !== 'text') return false;
      for (const c of el.childNodes) if (c.nodeType === 3 && c.textContent.trim()) return true; return false });
    const boxes = [];
    for (const el of leaf) { if (!vis(el)) continue; let r;
      if (el.tagName === 'text') r = el.getBoundingClientRect();
      else { const rg = document.createRange(); const tn = [...el.childNodes].find(c => c.nodeType === 3 && c.textContent.trim()); rg.selectNodeContents(tn); r = rg.getBoundingClientRect() }
      if (!r.width || !r.height || r.bottom < 0 || r.top > H) continue;
      // text inside a scrolling or clipping box is fine if the box clips it
      let clip = null; for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) { const s = getComputedStyle(n); if (/(auto|scroll|hidden)/.test(s.overflowX + s.overflowY)) { clip = n.getBoundingClientRect(); break } }
      if (clip && (r.right < clip.left || r.left > clip.right || r.bottom < clip.top || r.top > clip.bottom)) continue;
      if (!clip && (r.left < -2 || r.right > W + 2)) out.push('offscreen "' + name(el) + '"');
      if (!onTop(el, r)) continue;
      boxes.push({el, r, t: name(el)});
      // faint text: compare with the first solid background behind it
      if (el.tagName !== 'text') { const c = getComputedStyle(el).color; let bg = null;
        for (let n = el; n; n = n.parentElement) { const b = getComputedStyle(n); if (b.backgroundImage !== 'none') break; const m = b.backgroundColor.match(/[\d.]+/g); if (m && (m[3] === undefined || +m[3] > .9)) { bg = m.slice(0, 3).map(Number); break } }
        const cm = c.match(/[\d.]+/g).map(Number);
        if (bg && (cm[3] === undefined || cm[3] > .5)) { const L = v => { v = v.map(x => { x /= 255; return x <= .03928 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4 }); return .2126 * v[0] + .7152 * v[1] + .0722 * v[2] };
          const a = L(cm.slice(0, 3)), b = L(bg); const ratio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05); if (ratio < 1.9) out.push('faint "' + name(el) + '" ' + ratio.toFixed(1)) } } }
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const A = boxes[i], B = boxes[j]; if (A.el.contains(B.el) || B.el.contains(A.el)) continue;
      const w = Math.min(A.r.right, B.r.right) - Math.max(A.r.left, B.r.left), h = Math.min(A.r.bottom, B.r.bottom) - Math.max(A.r.top, B.r.top);
      if (w > 4 && h > Math.min(A.r.height, B.r.height) * .4 && A.t !== B.t) out.push('overlap "' + A.t + '" / "' + B.t + '"') }
    for (const b of document.querySelectorAll('button,.choice,[data-part],a[href]')) { if (!vis(b) || b.disabled) continue; if (b.classList.contains('prop') && document.querySelector('.speaker,.subtitle')) continue;  // scene props sit behind a talk portrait on purpose const r = b.getBoundingClientRect();
      if (r.width < 8 || r.height < 8 || r.bottom < 0 || r.top > H || r.right < 0 || r.left > W) continue;
      const x = Math.min(W - 1, Math.max(0, r.left + r.width / 2)), y = Math.min(H - 1, Math.max(0, r.top + r.height / 2)); const hit = document.elementFromPoint(x, y);
      if (hit && !b.contains(hit) && !hit.contains(b) && getComputedStyle(hit).pointerEvents !== 'none' && clear(hit)) out.push('covered "' + (name(b) || b.className || b.tagName) + '" under ' + (hit.className && hit.className.baseVal === undefined ? hit.className : hit.tagName).toString().slice(0, 30)) }
  }
  return [...new Set(out)];
};
