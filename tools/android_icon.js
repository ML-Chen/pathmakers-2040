// Renders the Android launcher icon from Byte: node tools/android_icon.js
// Writes android/app/src/main/res/drawable-nodpi/ic_fg.png (adaptive foreground, 432x432, Byte inside the 66% safe zone)
// and mipmap-*/ic_launcher.png (round legacy icons for Android 7).
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),src=f=>fs.readFileSync(path.join(root,'src',f),'utf8');
const res=path.join(root,'android/app/src/main/res');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:432,height:432}});
  const html=`<!doctype html><meta charset=utf-8><style>html,body{margin:0;background:transparent}
  #c{width:432px;height:432px;display:flex;align-items:center;justify-content:center;border-radius:var(--r,0);background:var(--bg,transparent)}
  #c .byteart,#c svg{width:var(--w,250px);height:auto;display:block;overflow:visible}</style><div id=c></div>
  <script>${src('art.js')}\n${src('content_boston.js')}\n${src('characters.js')}\n</script>
  <script>document.getElementById('c').innerHTML=byteBox({name:'Byte',color:'#f0b35a',ears:'floppy',mood:'happy'});</script>`;
  await p.setContent(html);await p.waitForTimeout(500);
  fs.mkdirSync(path.join(res,'drawable-nodpi'),{recursive:true});
  await p.locator('#c').screenshot({path:path.join(res,'drawable-nodpi/ic_fg.png'),omitBackground:true});
  for(const [d,px] of [['mdpi',48],['hdpi',72],['xhdpi',96],['xxhdpi',144],['xxxhdpi',192]]){
    await p.setViewportSize({width:px,height:px});
    await p.evaluate(px=>{const c=document.getElementById('c');c.style.cssText=`width:${px}px;height:${px}px;--r:50%;--bg:#bfe6ff;--w:${Math.round(px*.78)}px`},px);
    fs.mkdirSync(path.join(res,'mipmap-'+d),{recursive:true});
    await p.locator('#c').screenshot({path:path.join(res,'mipmap-'+d,'ic_launcher.png'),omitBackground:true})}
  fs.mkdirSync(path.join(root,"src/icons"),{recursive:true});fs.copyFileSync(path.join(res,"mipmap-hdpi/ic_launcher.png"),path.join(root,"src/icons/favicon-72.png"));fs.copyFileSync(path.join(res,"mipmap-xxxhdpi/ic_launcher.png"),path.join(root,"src/icons/apple-touch-192.png"));
  await b.close();console.log("icons written")})();
