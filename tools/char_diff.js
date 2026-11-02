// Regression check for the character art: node tools/char_diff.js [ref=origin/main] [outDir=/tmp/char-diff]
// Renders the same list of existing characters with <ref>'s src/art.js + content_boston.js + characters.js and with the
// working tree's copies, then compares (1) the SVG markup and (2) the rasterized pixels of every case.
// Cases: Imani, Maya and Wei in every mood; every hair style, build and option that existed before (long, elder, short,
// bun, braids, glasses, earring, coat, kid); the mini() crowd, villains and poses; posedGirl in every pose; the art.js
// Future Table vignettes; Byte in every ear style and mood. Writes old|new|diff strips for any case that changed to
// outDir and exits 1 if any pixel differs.
const {chromium}=require('playwright');const fs=require('fs'),path=require('path'),{execSync}=require('child_process');
const root=path.resolve(__dirname,'..'),ref=process.argv[2]||'origin/main',out=process.argv[3]||'/tmp/char-diff';
fs.mkdirSync(out,{recursive:true});
const files=['art.js','content_boston.js','characters.js'];
const oldSrc=files.map(f=>execSync(`git show ${ref}:src/${f}`,{cwd:root,maxBuffer:1<<26}).toString()).join('\n');
const newSrc=files.map(f=>fs.readFileSync(path.join(root,'src',f),'utf8')).join('\n');

// The case list runs in the page after the sources load. Each case resets the id counter so ids match across versions.
const cases=String.raw`
const C=[],add=(name,w,h,fn)=>{CH_N=0;let svg=fn();if(!/^<svg/.test(svg))svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+(window.__vb||('0 0 '+w+' '+h))+'">'+svg+'</svg>';
  svg=svg.replace(/^<svg/,'<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'"').replace(/xmlns="http:\/\/www.w3.org\/2000\/svg" (width="\d+" height="\d+") xmlns="http:\/\/www.w3.org\/2000\/svg"/,'xmlns="http://www.w3.org/2000/svg" $1');
  C.push({name,w,h,svg})};
const moods=['smile','happy','neutral','worried','sad','surprised','stern','think'];
for(const who of ['imani','maya','dad'])for(const m of moods)add(who+'-'+m,300,360,()=>portrait({...CAST[who],mood:m}));
const extra={long:{skin:SKIN[0],hair:'#c9772d',hairStyle:'long',eye:'#3d7a5a',shirt:'#6c5ce7'},elder:{skin:SKIN[3],hair:'#d9d6e2',hairStyle:'elder',shirt:'#f5b82e',glasses:true},
  kidShort:{skin:SKIN[5],hair:'#1b1410',hairStyle:'short',age:'kid',shirt:'#38b07f'},shortF:{skin:SKIN[2],hair:'#3a2a20',hairStyle:'short',masc:false,shirt:'#e05a7a'},
  bunM:{skin:SKIN[0],hair:'#8a5a3a',hairStyle:'bun',masc:true,shirt:'#38b07f',coat:true},braidsAdult:{skin:SKIN[3],hair:'#2a1a14',hairStyle:'braids',shirt:'#5b7bd5',accessory:'earring'},
  longKid:{skin:SKIN[1],hair:'#e8c26a',hairStyle:'long',age:'kid',shirt:'#ff9bb0',glasses:true,frame:'#2a5a8a'},elderM:{skin:SKIN[1],hair:'#cfcfd8',hairStyle:'elder',masc:true,shirt:'#3d3d55'},
  buzz:{skin:SKIN[4],hair:'#111111',hairStyle:'buzz',shirt:'#fbfdff',coat:true,glasses:true},bare:{}};
for(const k in extra)for(const m of ['smile','sad','think'])add('style-'+k+'-'+m,300,360,()=>portrait({...extra[k],mood:m}));
add('maya-pin-none',300,360,()=>portrait({...CAST.maya,pin:null}));
const sk=SKIN,crowd=[[sk[0],'#6c5ce7','#c9772d',''],[sk[1],'#ff7a6b','#2b1a10','happy'],[sk[2],'#16b3a6','#1b1410','sad'],[sk[3],'#f5b82e','#3a2a20',''],[sk[4],'#fbfdff','#111111','happy'],[sk[5],'#5b7bd5','#1b1410',''],[sk[2],'#3d3d55','#b3541e',''],[sk[0],'#38b07f','#e8c26a','sad'],[sk[1],'#ff9bb0','#5a3a2a','happy'],[sk[4],'#6c5ce7','#1b1410',''],[sk[3],'#e05a7a','#2a1a14',''],[sk[0],'#5b7bd5','#8a5a3a','']];
for(const sc of [1,2,3])add('mini-crowd-s'+sc,crowd.length*30*sc+40,64*sc,()=>crowd.map(([s,sh,h,f],i)=>mini(20+i*30*sc,(64-36)*sc,{skin:s,shirt:sh,hair:h,face:f||undefined,s:sc,pose:i%3===1?'walk':'stand'})).join(''));
add('mini-villains',1000,150,()=>{window.__vb='0 0 500 75';const s=mini(30,30,{who:'pip',s:1})+mini(60,24,{who:'jory',s:1})+mini(100,30,{who:'pip',face:'happy'})+mini(130,24,{who:'jory',pose:'walk'})+mini(170,30,{who:'pip',pose:'push'})+mini(240,30,{who:'jory',pose:'push',flip:true});return s});
add('mini-styles',1000,150,()=>{window.__vb='0 0 500 75';return mini(290,30,{skin:SKIN[2],shirt:'#fbfdff',hair:'#3a2a20',pose:'walk'})+mini(320,30,{skin:SKIN[4],shirt:'#ff7a6b',hair:'#1b1410',pose:'walk',flip:true})+mini(350,30,{skin:SKIN[1],shirt:'#ff7a6b',hair:'#2b1a10',age:'kid',face:'happy'})+mini(380,30,{skin:SKIN[0],shirt:'#38b07f',hair:'#c9772d',style:'long',outfit:'hoodie'})+mini(410,30,{skin:SKIN[5],shirt:'#f5b82e',hair:'#1b1410',style:'curly',outfit:'jacket'})+mini(440,30,{skin:SKIN[3],shirt:'#6c5ce7',hair:'#d9d6e2',style:'bun',skirt:true})+mini(470,30,{skin:SKIN[1],shirt:'#5b7bd5',hair:'#2a211c',style:'short',outfit:'tee'})});
add('mini-all-styles',900,120,()=>{window.__vb='0 0 450 60';return ['short','bob','tails','pony','bun','long','curly','messy','beanie'].map((st,i)=>mini(25+i*48,22,{skin:SKIN[i%6],shirt:['#6c5ce7','#ff7a6b','#16b3a6','#f5b82e'][i%4],hair:'#3a2a20',style:st,outfit:['tee','hoodie','jacket','coat'][i%4],face:['','happy','sad'][i%3]})+mini(48+i*48,22,{skin:SKIN[(i+3)%6],shirt:'#5b7bd5',hair:'#c9772d',style:st,age:'kid',pose:'walk',skirt:i%2===0})).join('')});
window.__vb=null;
add('mini-props-person',96,184,()=>{window.__vb='-24 -50 48 92';return mini(0,34,{skin:SKIN[2],shirt:'#ff7a6b',hair:'#1b1410',s:1.25,pose:'stand'})});window.__vb=null;
for(const k of ['violin','thumbsup','sad','itchy','waiting','stand'])add('posedGirl-'+k,300,225,()=>{window.__vb='0 0 120 90';return '<g transform="translate(52 86) scale(1.08)">'+posedGirl(k)+'</g>'});
window.__vb=null;
for(const k of ['recital','healed','crooked','rash','waiting','moved'])add('vignette-'+k,320,240,()=>{const v=vignette(k);return /<svg/.test(v)?v.replace(/<svg([^>]*)>/,(m,a)=>'<svg'+a.replace(/ (width|height)="[^"]*"/g,'')+'>'):v});
for(const e of ['floppy','pointy','round'])for(const m of ['happy','neutral','think','alert'])add('byte-'+e+'-'+m,272,300,()=>byteBox({color:'#f0b35a',ears:e,mood:m}));
window.__cases=C;`;

(async()=>{const b=await chromium.launch();
  const run=async src=>{const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
    await p.setContent('<!doctype html><meta charset="utf-8"><body><script>'+src.replace(/<\/script/g,'<\\/script')+'\n'+cases+'<\/script>');
    const C=await p.evaluate(()=>window.__cases||[]);await p.close();if(errs.length)console.log('page errors:',errs.join('; '));return C};
  const A=await run(oldSrc),B=await run(newSrc);
  if(A.length!==B.length||!A.length){console.log('case count differs or zero',A.length,B.length);process.exit(2)}
  const p=await b.newPage({viewport:{width:1200,height:900}});await p.setContent('<!doctype html><body style="margin:0;background:#fff"><canvas id="c"></canvas></body>');
  let sameStr=0,samePix=0;const bad=[];
  for(let i=0;i<A.length;i++){const a=A[i],n=B[i];if(a.svg===n.svg)sameStr++;
    const r=await p.evaluate(async([sa,sb,w,h])=>{const load=s=>new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=()=>rej(new Error('svg failed to load'));im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s)});
      const S=2,ras=im=>{const c=document.createElement('canvas');c.width=w*S;c.height=h*S;const x=c.getContext('2d',{willReadFrequently:true});x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,w*S,h*S);return x.getImageData(0,0,w*S,h*S)};
      const ia=await load(sa),da=ras(ia),ib=await load(sb),db=ras(ib);
      const cv=document.getElementById('c');cv.width=w*S*3;cv.height=h*S;const g=cv.getContext('2d',{willReadFrequently:true});g.putImageData(da,0,0);g.putImageData(db,w*S,0);const dd=g.createImageData(w*S,h*S);let diff=0;
      for(let k=0;k<da.data.length;k+=4){const d=Math.abs(da.data[k]-db.data[k])+Math.abs(da.data[k+1]-db.data[k+1])+Math.abs(da.data[k+2]-db.data[k+2])+Math.abs(da.data[k+3]-db.data[k+3]);
        if(d>0){diff++;dd.data[k]=255;dd.data[k+1]=0;dd.data[k+2]=80;dd.data[k+3]=255}else{const v=(da.data[k]+da.data[k+1]+da.data[k+2])/3;dd.data[k]=dd.data[k+1]=dd.data[k+2]=200+v*.2;dd.data[k+3]=255}}
      g.putImageData(dd,w*S*2,0);return {diff,png:diff?cv.toDataURL('image/png'):null}},[a.svg,n.svg,a.w,a.h]);
    if(!r.diff)samePix++;else{bad.push(a.name+' ('+r.diff+' px)');fs.writeFileSync(path.join(out,a.name+'.png'),Buffer.from(r.png.split(',')[1],'base64'))}}
  console.log(`${A.length} cases vs ${ref}: ${sameStr} identical markup, ${samePix} identical pixels`);
  if(bad.length)console.log('CHANGED:\n  '+bad.join('\n  ')+'\nold|new|diff strips in '+out);
  await b.close();process.exit(bad.length?1:0)})();
