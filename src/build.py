# Inline every module into one self-contained page: python3 src/build.py dist/pathmakers.html
import os,sys
here=os.path.dirname(os.path.abspath(__file__))
rd=lambda f:open(os.path.join(here,f)).read() if os.path.exists(os.path.join(here,f)) else ''
t=rd('game.html')
for marker,f in [('/*@@CSS@@*/','style.css'),('//@@AUDIO@@','audio.js'),('//@@ART@@','art.js'),('//@@CHARS@@','characters.js'),('//@@PAINT@@','paint_boston.js'),('//@@INFOG@@','infog.js'),('//@@CONTENT@@','content_boston.js'),('//@@GAME@@','game.js')]:
    t=t.replace(marker,rd(f))
open(sys.argv[1] if len(sys.argv)>1 else os.path.join(here,'..','dist','pathmakers.html'),'w').write(t)
