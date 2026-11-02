# Inline every module into one self-contained page: python3 src/build.py dist/pathmakers.html
# Extra content is picked up automatically: src/scenes/*.js (painted scenes), src/viz/*.js (infographics, vignettes),
# src/missions/*.js (missions), loaded in alphabetical order after the core files.
import glob,os,sys
here=os.path.dirname(os.path.abspath(__file__))
rd=lambda f:open(os.path.join(here,f)).read() if os.path.exists(os.path.join(here,f)) else ''
many=lambda d:'\n'.join(open(p).read() for p in sorted(glob.glob(os.path.join(here,d,'*.js'))))
t=rd('game.html')
for marker,val in [('/*@@CSS@@*/',rd('style.css')),('//@@AUDIO@@',rd('audio.js')),('//@@ART@@',rd('art.js')),('//@@CHARS@@',rd('characters.js')),
  ('//@@PAINT@@',rd('paint_boston.js')+'\n'+many('scenes')),('//@@CONTENT@@',rd('content_boston.js')),('//@@MISSIONS@@',rd('missions.js')+'\n'+many('missions')),
  ('//@@INFOG@@',rd('infog.js')+'\n'+many('viz')),('//@@TRACKS@@',rd('music_tracks.js')),('//@@MUSIC@@',rd('music.js')),('//@@PROPS@@',rd('props.js')),('//@@GAME@@',rd('game.js'))]:
    t=t.replace(marker,val)
open(sys.argv[1] if len(sys.argv)>1 else os.path.join(here,'..','dist','pathmakers.html'),'w').write(t)
