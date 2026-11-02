// music.js — background music (pre-rendered tracks from music-lab), sound effects and character babble.
// MUSIC.play(trackName) switches tracks with a crossfade; MUSIC.duck(on) lowers music under voices.
const MUSIC=(()=>{
  let ac=null,out=null,rev=null,muted=false,duckOn=false,want=null;
  const VOL=.5;
  function ensure(){
    if(ac)return ac;const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;ac=new C();
    out=ac.createGain();out.gain.value=0;const comp=ac.createDynamicsCompressor();comp.threshold.value=-18;comp.ratio.value=3;out.connect(comp).connect(ac.destination);
    rev=ac.createConvolver();const len=ac.sampleRate*2.6,ir=ac.createBuffer(2,len,ac.sampleRate);
    for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6)}
    rev.buffer=ir;const rg=ac.createGain();rg.gain.value=.38;rev.connect(rg).connect(out);return ac}
  function voiceGain(t,a,peak,d,dest,sendRev=.6){const g=ac.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+d);g.connect(dest);if(sendRev){const s=ac.createGain();s.gain.value=sendRev;g.connect(s).connect(rev)}return g}
  let noiseBuf=null;
  // ---- background music: pre-rendered tracks (MUSIC_TRACKS from music_tracks.js), crossfaded through Web Audio gains ----
  const els={};let curName=null,unlocked=false;
  function trackNode(name){if(els[name])return els[name];const src=window.MUSIC_TRACKS&&MUSIC_TRACKS[name];if(!src||!ensure())return null;
    const el=new Audio(src);el.loop=true;el.preload='auto';const g=ac.createGain();g.gain.value=0;try{ac.createMediaElementSource(el).connect(g)}catch(e){}g.connect(out);return els[name]={el,g}}
  function fadeTo(node,v,secs){const p=node.g.gain,now=ac.currentTime;p.cancelScheduledValues(now);p.setValueAtTime(p.value,now);p.linearRampToValueAtTime(v,now+secs)}
  function startTrack(name){if(curName===name&&els[name]&&!els[name].el.paused)return;const old=curName&&els[curName];const n=trackNode(name);if(!n)return;
    if(old&&old!==n){fadeTo(old,0,1.4);setTimeout(()=>{if(curName!==Object.keys(els).find(k=>els[k]===old))old.el.pause()},1600)}
    curName=name;n.el.currentTime=0;n.el.play().then(()=>fadeTo(n,1,1.6)).catch(()=>{})}
  function level(){if(!ac)return;const v=muted?0:VOL*(duckOn?.32:1);out.gain.cancelScheduledValues(ac.currentTime);out.gain.setTargetAtTime(v,ac.currentTime,.25)}
  // sound effects for taps and petting
  function sfx(name){if(!ensure()||muted)return;if(ac.state!=='running')ac.resume();const t=ac.currentTime+.01,d=ac.destination;const g=ac.createGain();g.gain.value=.5;g.connect(d);
    const tone=(f,dt,dur,type='sine',v=.25,f2)=>{const o=ac.createOscillator();o.type=type;o.frequency.setValueAtTime(f,t+dt);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dt+dur);const e=ac.createGain();e.gain.setValueAtTime(0,t+dt);e.gain.linearRampToValueAtTime(v,t+dt+.01);e.gain.exponentialRampToValueAtTime(.0001,t+dt+dur);o.connect(e).connect(g);o.start(t+dt);o.stop(t+dt+dur+.05)};
    const noise=(dt,dur,freq,v=.2,type='bandpass')=>{if(!noiseBuf){noiseBuf=ac.createBuffer(1,ac.sampleRate*.2,ac.sampleRate);const dd=noiseBuf.getChannelData(0);for(let i=0;i<dd.length;i++)dd[i]=Math.random()*2-1}const s=ac.createBufferSource();s.buffer=noiseBuf;s.loop=true;const f=ac.createBiquadFilter();f.type=type;f.frequency.value=freq;const e=ac.createGain();e.gain.setValueAtTime(v,t+dt);e.gain.exponentialRampToValueAtTime(.0001,t+dt+dur);s.connect(f).connect(e).connect(g);s.start(t+dt);s.stop(t+dt+dur+.05)};
    ({ring:()=>{for(let i=0;i<10;i++){tone(1760,i*.05,.05,'square',.06);tone(2093,i*.05+.025,.05,'square',.05)}},
      clink:()=>{tone(2600,0,.25,'sine',.18);tone(3900,0,.18,'sine',.08);tone(2600,.09,.2,'sine',.1)},
      blip:()=>{tone(660,0,.08,'square',.08);tone(990,.08,.1,'square',.08);tone(1320,.18,.12,'square',.07)},
      rustle:()=>{noise(0,.35,3200,.18);noise(.12,.3,2400,.12)},
      beep:()=>{tone(880,0,.09,'square',.08);tone(660,.12,.09,'square',.08);tone(1046,.24,.14,'square',.08)},
      click:()=>{noise(0,.03,4000,.3,'highpass');tone(1200,0,.04,'square',.05)},
      flap:()=>{for(let i=0;i<5;i++)noise(i*.07,.06,900,.22)},
      chime:()=>{[1047,1319,1568,2093].forEach((f,i)=>tone(f,i*.07,.9,'sine',.12))},
      arf:()=>{tone(520,0,.12,'sawtooth',.12,780);tone(700,.13,.14,'sawtooth',.1,960);noise(0,.08,1400,.08)},
      pop:()=>tone(500,0,.12,'sine',.2,900),
      whoosh:()=>noise(0,.4,800,.2,'lowpass')}[name]||(()=>{}))()}
  // Animal-Crossing-style babble for lines without a recorded clip; returns duration in seconds
  function babble(text,who){if(!ensure()||muted)return 0;if(ac.state!=='running')ac.resume();const base={byte:620,maya:560,imani:330,dad:240,narrator:280,halo:440,person:400}[who]||420;
    const t0=ac.currentTime+.02,g=ac.createGain();g.gain.value=.22;g.connect(ac.destination);const words=String(text).replace(/\[\[|\]\]/g,'').split(/\s+/).slice(0,40);let t=t0;
    for(const w of words){const syl=Math.max(1,Math.min(3,Math.round(w.length/3.2)));for(let i=0;i<syl;i++){const o=ac.createOscillator();o.type=who==='byte'?'triangle':'square';
        const f=base*Math.pow(2,((w.charCodeAt(i)||97)%7-3)/12);o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*(/[?!]$/.test(w)&&i===syl-1?1.25:.92),t+.07);
        const e=ac.createGain();e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(who==='byte'?.5:.22,t+.01);e.gain.exponentialRampToValueAtTime(.0001,t+.075);
        const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2600;o.connect(lp).connect(e).connect(g);o.start(t);o.stop(t+.09);t+=.085}t+=/[,.!?]$/.test(w)?.16:.05}
    return t-t0}
  return{
    sfx,babble,
    play(name){want=name;if(!unlocked||!ac)return;startTrack(name);level()},
    unlock(){if(!ensure())return;const go=()=>{unlocked=true;if(want)startTrack(want);level()};if(ac.state!=='running')ac.resume().then(go).catch(()=>{});else go()},
    mute(on){muted=on;level()},
    duck(on){duckOn=on;level()},
    get name(){return curName}
  };
})();
