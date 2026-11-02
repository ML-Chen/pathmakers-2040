# Inline every module into one self-contained page: python3 src/build.py dist/pathmakers.html
# Extra content is picked up automatically: src/scenes/*.js (painted scenes), src/viz/*.js (infographics, vignettes),
# src/missions/*.js (missions), loaded in alphabetical order after the core files. src/ledger.js (the news app) loads right after missions.js.
# Languages: src/i18n.js, then every src/i18n/<lang>/*.js translation file and src/i18n/<lang>_pinyin/*.js generated pinyin.
import glob,os,sys
here=os.path.dirname(os.path.abspath(__file__))
rd=lambda f:open(os.path.join(here,f)).read() if os.path.exists(os.path.join(here,f)) else ''
many=lambda d,ext='js':'\n'.join(open(p).read() for p in sorted(glob.glob(os.path.join(here,d,'*.'+ext))))
t=rd('game.html')
# Fonts are bundled (SIL Open Font License, src/fonts/LICENSE-OFL.txt) so text never depends on a network font service.
import base64
def font(name,file,weight):
    b=base64.b64encode(open(os.path.join(here,'fonts',file),'rb').read()).decode()
    return "@font-face{font-family:'%s';font-style:normal;font-weight:%s;font-display:swap;src:url(data:font/woff2;base64,%s) format('woff2')}"%(name,weight,b)
FONTS='\n'.join([font('Fredoka','fredoka.woff2','300 700'),font('Nunito','nunito.woff2','200 1000'),font('Caveat','caveat.woff2','400 700')])
I18N=rd('i18n.js')+'\n'+'\n'.join(open(p).read() for p in sorted(glob.glob(os.path.join(here,'i18n','*','*.js'))))
ico=lambda f:base64.b64encode(open(os.path.join(here,'icons',f),'rb').read()).decode() if os.path.exists(os.path.join(here,'icons',f)) else ''
ICONS=('<link rel="icon" type="image/png" href="data:image/png;base64,%s">\n<link rel="apple-touch-icon" href="data:image/png;base64,%s">\n<meta name="theme-color" content="#2b2f66">'%(ico('favicon-72.png'),ico('apple-touch-192.png'))) if ico('favicon-72.png') else ''
t=t.replace('<!--@@ICONS@@-->',ICONS)
# PM_VOICES=hired,grandrounds keeps only those missions' recorded voices (the core voices always stay). The Claude artifact
# has a 16 MB limit, so it is built with a few; the web page, the APK and the playtest keep every voice.
_keep=os.environ.get('PM_VOICES')
if _keep is not None:
    _ok=set(x.strip() for x in _keep.split(',') if x.strip())
    many_audio=lambda:'\n'.join(open(p).read() for p in sorted(glob.glob(os.path.join(here,'audio','*.js'))) if os.path.basename(p)[:-3] in _ok)
else: many_audio=lambda:many('audio')
for marker,val in [('/*@@FONTS@@*/',FONTS),('//@@I18N@@',I18N),('/*@@CSS@@*/',rd('style.css')+'\n'+rd('parent.css')+'\n'+many('css','css')),('//@@AUDIO@@',rd('audio.js')+'\n'+many_audio()),('//@@ART@@',rd('art.js')),('//@@CHARS@@',rd('characters.js')+'\n'+rd('byte_custom.js')),
  ('//@@PAINT@@',rd('paint_boston.js')+'\n'+many('scenes')),('//@@CONTENT@@',rd('content_boston.js')),('//@@MISSIONS@@',rd('missions.js')+'\n'+rd('ledger.js')+'\n'+many('missions')),
  ('//@@INFOG@@',rd('infog.js')+'\n'+many('viz')),('//@@TRACKS@@',rd('music_tracks.js')),('//@@MUSIC@@',rd('music.js')),('//@@PROPS@@',rd('props.js')),('//@@PARENT@@',rd('parent.js')),('//@@CAMPAIGN@@',rd('campaign.js')+'\n'+rd('career.js')+'\n'+rd('worldmap.js')),('//@@MODES@@',rd('modes.js')),('//@@GAME@@',rd('game.js'))]:
    t=t.replace(marker,val)
open(sys.argv[1] if len(sys.argv)>1 else os.path.join(here,'..','dist','pathmakers.html'),'w').write(t)
