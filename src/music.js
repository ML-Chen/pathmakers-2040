// music.js — original background music, synthesized live with Web Audio (no files).
// MUSIC.play(trackName) switches tracks with a crossfade; MUSIC.duck(on) lowers music under voices.
const MUSIC=(()=>{
  let ac=null,out=null,rev=null,bus=null,cur=null,curName=null,timer=0,muted=false,duckOn=false,want=null;
  const VOL=.16;
  const m2f=m=>440*Math.pow(2,(m-69)/12);
  function rngS(seed){let s=seed>>>0||7;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
  function ensure(){
    if(ac)return ac;const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;ac=new C();
    out=ac.createGain();out.gain.value=0;const comp=ac.createDynamicsCompressor();comp.threshold.value=-18;comp.ratio.value=3;out.connect(comp).connect(ac.destination);
    rev=ac.createConvolver();const len=ac.sampleRate*2.6,ir=ac.createBuffer(2,len,ac.sampleRate);
    for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6)}
    rev.buffer=ir;const rg=ac.createGain();rg.gain.value=.38;rev.connect(rg).connect(out);return ac}
  function voiceGain(t,a,peak,d,dest,sendRev=.6){const g=ac.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+d);g.connect(dest);if(sendRev){const s=ac.createGain();s.gain.value=sendRev;g.connect(s).connect(rev)}return g}
  // instruments
  function pad(fs,t,dur,dest,bright=900){for(const f of fs)for(const det of[-7,7]){const o=ac.createOscillator();o.type='sawtooth';o.frequency.value=f;o.detune.value=det;
      const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=bright;lp.Q.value=.4;const g=ac.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.022,t+Math.min(1.4,dur*.4));g.gain.setValueAtTime(.022,t+dur-.3);g.gain.linearRampToValueAtTime(0,t+dur+1.2);
      o.connect(lp).connect(g);g.connect(dest);const s=ac.createGain();s.gain.value=.8;g.connect(s).connect(rev);o.start(t);o.stop(t+dur+1.3)}}
  function pluck(f,t,dest,vel=1,decay=.7){const g=voiceGain(t,.006,.11*vel,decay,dest,.5);const o=ac.createOscillator();o.type='triangle';o.frequency.value=f;const o2=ac.createOscillator();o2.type='sine';o2.frequency.value=f*2;const g2=ac.createGain();g2.gain.value=.25;
    const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(3600,t);lp.frequency.exponentialRampToValueAtTime(900,t+decay);o.connect(lp);o2.connect(g2).connect(lp);lp.connect(g);o.start(t);o2.start(t);o.stop(t+decay+.1);o2.stop(t+decay+.1)}
  function bell(f,t,dest,vel=1){const g=voiceGain(t,.004,.07*vel,2.2,dest,.9);const c=ac.createOscillator();c.frequency.value=f;const m=ac.createOscillator();m.frequency.value=f*3.5;const mg=ac.createGain();mg.gain.setValueAtTime(f*1.6,t);mg.gain.exponentialRampToValueAtTime(1,t+1.8);m.connect(mg).connect(c.frequency);c.connect(g);c.start(t);m.start(t);c.stop(t+2.4);m.stop(t+2.4)}
  function bass(f,t,dur,dest){const g=voiceGain(t,.02,.16,dur,dest,0);const o=ac.createOscillator();o.type='sine';o.frequency.value=f;const o2=ac.createOscillator();o2.type='triangle';o2.frequency.value=f*2;const g2=ac.createGain();g2.gain.value=.12;o.connect(g);o2.connect(g2).connect(g);o.start(t);o2.start(t);o.stop(t+dur+.1);o2.stop(t+dur+.1)}
  let noiseBuf=null;function hat(t,dest,vel=1){if(!noiseBuf){noiseBuf=ac.createBuffer(1,ac.sampleRate*.2,ac.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
    const s=ac.createBufferSource();s.buffer=noiseBuf;const hp=ac.createBiquadFilter();hp.type='highpass';hp.frequency.value=7500;const g=voiceGain(t,.002,.035*vel,.05,dest,0);s.connect(hp).connect(g);s.start(t);s.stop(t+.1)}
  function kick(t,dest,vel=1){const o=ac.createOscillator();o.frequency.setValueAtTime(110,t);o.frequency.exponentialRampToValueAtTime(45,t+.18);const g=voiceGain(t,.003,.32*vel,.26,dest,0);o.connect(g);o.start(t);o.stop(t+.3)}
  // tracks: chords are scale-degree triads (0-based) in the key; one chord per bar of 16 steps
  const MAJ=[0,2,4,5,7,9,11],MIN=[0,2,3,5,7,8,10];
  const TRACKS={
    title:{bpm:96,root:60,scale:MAJ,prog:[0,4,5,3],lead:'pluck',dens:.55,kick:true,hats:true,seed:11,bright:1100},
    morning:{bpm:86,root:55,scale:MAJ,prog:[0,2,3,4],lead:'pluck',dens:.42,hats:true,seed:23,bright:900},
    hospital:{bpm:74,root:65,scale:MAJ,prog:[3,0,4,5],lead:'bell',dens:.22,seed:31,bright:800},
    work:{bpm:80,root:62,scale:MAJ,prog:[1,4,0,5],lead:'pluck',dens:.22,seed:41,bright:700,quiet:.75},
    table:{bpm:104,root:57,scale:MIN,prog:[0,5,2,6],lead:'arp',dens:.9,kick:true,hats:true,seed:53,bright:1300},
    night:{bpm:66,root:50,scale:MIN,prog:[0,3,5,4],lead:'bell',dens:.2,seed:67,bright:600},
    win:{bpm:100,root:62,scale:MAJ,prog:[0,4,5,3],lead:'pluck',dens:.6,kick:true,hats:true,seed:71,bright:1200}
  };
  function chordNotes(tr,deg,oct=0){const sc=tr.scale;const n=i=>tr.root+12*oct+sc[(deg+i)%7]+12*Math.floor((deg+i)/7);return [n(0),n(2),n(4)]}
  function makeMelody(tr){const r=rngS(tr.seed);const bars=tr.prog.length;const mel=[];
    for(let b=0;b<bars;b++){const ch=chordNotes(tr,tr.prog[b],1);for(let s=0;s<16;s++){let note=null;
      if(tr.lead==='arp'){note=ch[[0,1,2,1][s%4]]+(s%8>=4?12:0)}
      else if(s%2===0&&r()<tr.dens*(s%4===0?1.3:.8)){const pool=r()<.7?ch:ch.map(x=>x+2);note=pool[Math.floor(r()*pool.length)]+(r()<.2?12:0)}
      mel.push(note)}}
    // second half of each 4-bar phrase answers the first: repeat bars with small changes
    return mel}
  function start(name){const tr=TRACKS[name];if(!tr||!ensure())return;stopCur(1.2);
    bus=ac.createGain();bus.gain.value=0;bus.connect(out);bus.gain.linearRampToValueAtTime(tr.quiet||1,ac.currentTime+1.5);
    const mel=makeMelody(tr);const spb=60/tr.bpm/4;let step=0,t=ac.currentTime+.08;const myBus=bus;
    cur={name,bus:myBus};curName=name;
    clearInterval(timer);timer=setInterval(()=>{if(cur.bus!==myBus)return;while(t<ac.currentTime+.25){const bar=Math.floor(step/16)%tr.prog.length,s=step%16;const deg=tr.prog[bar];
        if(s===0){pad(chordNotes(tr,deg,0),t,spb*16,myBus,tr.bright);bass(m2f(tr.root-12+tr.scale[deg%7]),t,spb*6,myBus)}
        if(s===8)bass(m2f(tr.root-12+tr.scale[deg%7]),t,spb*5,myBus);
        if(tr.kick&&(s===0||s===8))kick(t,myBus,.8);
        if(tr.hats&&s%2===0)hat(t,myBus,s%4===2?1:.5);
        const n=mel[step%mel.length];if(n!=null){const f=m2f(n);if(tr.lead==='bell')bell(f,t,myBus,.8);else pluck(f,t,myBus,tr.lead==='arp'?.55:.9,tr.lead==='arp'?.35:.8)}
        step++;t+=spb}},60)}
  function stopCur(fade=1){if(cur&&cur.bus){const b=cur.bus;try{b.gain.cancelScheduledValues(ac.currentTime);b.gain.setValueAtTime(b.gain.value,ac.currentTime);b.gain.linearRampToValueAtTime(0,ac.currentTime+fade)}catch(e){}setTimeout(()=>{try{b.disconnect()}catch(e){}},fade*1000+2500)}cur=null}
  function level(){if(!ac)return;const v=muted?0:VOL*(duckOn?.35:1);out.gain.cancelScheduledValues(ac.currentTime);out.gain.setTargetAtTime(v,ac.currentTime,.25)}
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
    play(name){want=name;if(!ac||ac.state!=='running')return;if(curName===name&&cur)return;start(name);level()},
    unlock(){if(!ensure())return;const go=()=>{if(want&&curName!==want)start(want);level()};if(ac.state!=='running')ac.resume().then(go).catch(()=>{});else go()},
    mute(on){muted=on;level()},
    duck(on){duckOn=on;level()},
    get name(){return curName}
  };
})();
