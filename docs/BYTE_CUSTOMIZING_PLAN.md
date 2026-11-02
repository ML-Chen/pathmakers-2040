# Byte customizing: plan (paused before any code was written)

Goal (docs/SPEC.md, "The robot dog partner" and "The dog rig"): the player picks Byte's tail and eye style as well as name, color, voice and ears, and accessories unlock with progress: a space helmet, a snorkel, a reflective vest and a judge's collar.

## What exists on main
- `byteSVG(o)` / `byteBox(o,cls)` in `src/characters.js` draw Byte from `{color, ears:'floppy'|'pointy'|'round', mood:'happy'|'neutral'|'think'|'alert'}`. Every call in `game.js` passes `{...S.byte, mood}`, so new fields on `S.byte` reach the art without touching the call sites.
- Animations in `src/style.css`: `.byte-tail` rotates around (108,116) in user coordinates (no fill-box, so tail shape does not matter); `.byte-head` uses fill-box with origin 50% 90%, so anything added inside the head group shifts the head-bob pivot; `.byte-eyes` scales around the center of its fill-box, so each eye style must stay symmetric around y=57; `.byte-ears` perks with fill-box 50% 100%.
- Setup screen: `STEPS.setup` in `src/game.js` (colors, voice, ears, names). Menu: `openMenu()` in `src/game.js`.

## Planned design
- New save fields (no change to `NEW()`; byteSVG falls back to defaults): `S.byte.tail` ('fluffy' default, 'curly', 'stubby'), `S.byte.eyes` ('sparkly' default, 'button', 'glow'), `S.byte.acc` ('' or a gear id), `S.byte.gearSeen` (ids already announced).
- Tails, all based at (108,116): fluffy (current plume); curly (shiba-style curl drawn as an outlined thick stroke looping around about (121,94)); stubby (a small fur pom at about (118,112)).
- Eyes: sparkly (current); button (solid dark ovals with two white highlights, white ring when alert); glow (teal gradient iris inside the dark eye with a soft mint halo, like the collar tag).
- Gear, one item at a time, stable ids:
  - `vest`: lime reflective vest with silver stripes on the chest, in `.byte-body` just before the collar band, unlocks after finishing 1 day.
  - `snorkel`: mask pushed up on the forehead with a strap and a tube on the left side, inside `.byte-head` after the floppy ears; hides the left twinkle star. Unlocks at 3 hearts (sum of `S.hearts`).
  - `judge`: white scalloped lace collar over the shoulders, after the collar band and before the hex tag so the tag stays on top. Unlocks at 3 stars on one day (`S.completed[id].stars`).
  - `helmet`: glass dome (arc from (36,96) to (124,96), radii 64x60) plus a metal neck ring, in its own group after `.byte-head` so the head bobs inside a still helmet and the head pivot does not move. Floppy ears flare less (8 degrees instead of 26) when alert under the helmet. Unlocks after finishing 2 days.
- UI in a new file `src/byte_closet.js` (added after `characters.js` in the `//@@CHARS@@` marker of `src/build.py`) and `src/css/byte_closet.css`:
  - `BYTE_COLORS`, `BYTE_LOOK`, `BYTE_GEAR` data, `byteLookHTML()` and `bindByteLook()`.
  - Setup screen: the Ears row becomes one "Look" row of three buttons (Ears, Tail, Eyes); each tap cycles to the next option, so the screen does not get taller. Swatches shrink to 36px so 7 colors fit on one row.
  - Menu gets a "Dress up Byte" button that opens a sheet with color, look and gear tiles (each tile shows Byte wearing the item; locked tiles are grey with a lock and tapping one toasts the hint).
  - `byteBox` adds `data-mood` and `data-cls` so the sheet can redraw every visible Byte after a change without re-rendering the screen.
  - `byteGearNews()` called from `STEPS.hub` toasts "New for Byte: ..." once per newly unlocked item.
- game.js edits stay to a few lines: setup colors and look row, one Menu button, one hub call.
- Checks: extend `tools/char_preview.js` with tails x eyes x moods, each gear item with every ear style, and wag/blink/perk/yap states; extend `tools/shots.js` with the new setup row and the Dress up sheet; take before/after screenshots at 390x844.
