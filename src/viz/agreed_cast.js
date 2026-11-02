// viz/agreed_cast.js — portrait art for the cast of "The Helper That Said Yes".
// agRosaArt(mood): Rosa Morales drawn by personSVG (the shared anime bust), wearing her old harbor-ferry captain's cap.
// The cap is drawn inside the head group (.p-head), so it sways with her head. If personSVG's markup ever changes so the
// head group can't be found, Rosa is drawn without the cap.
function agRosaBase(){const c=(typeof CAST!=='undefined'&&CAST.rosa)||{};const o={};for(const k in c)if(k!=='art')o[k]=c[k];return o}
function agCapSVG(){const navy='#2a4476',navyD='#0f1424',navyL='#4d68a3',gold='#e9b949',goldD='#b9862a',white='#fbfcff',whiteS='#d9dfee',ink='#141a2c';
  // front view of a peaked captain's cap, centred on x=150; the band sits across the top of the head at y~52
  const crown='M84 44 C84 22 112 12 150 12 C188 12 216 22 216 44 C216 52 206 56 196 57 L104 57 C94 56 84 52 84 44Z';
  const band='M100 48 C116 52 184 52 200 48 L202 64 C184 69 116 69 98 64Z';
  const visor='M98 63 C116 69 184 69 202 63 C206 70 200 80 184 83 C166 86 134 86 116 83 C100 80 94 70 98 63Z';
  return `<g class="ag-cap">
    <path d="${crown}" fill="${white}" stroke="${ink}" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M90 44 C92 28 114 19 150 19 C186 19 208 28 210 44 C206 50 196 52 186 52 L114 52 C104 52 94 50 90 44Z" fill="${whiteS}" opacity=".55"/>
    <path d="M104 26 C120 18 140 16 158 17" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none" opacity=".9"/>
    <path d="${band}" fill="${navy}" stroke="${ink}" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M102 52 C118 56 182 56 198 52" stroke="${navyL}" stroke-width="2" fill="none" opacity=".8"/>
    <path d="M100 60 C118 64.5 182 64.5 200 60" stroke="${gold}" stroke-width="2.6" fill="none" stroke-dasharray="4 2.2"/>
    <path d="${visor}" fill="${navyD}" stroke="${ink}" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M110 74 C130 80 170 80 190 74" stroke="#5d6f9c" stroke-width="2.6" stroke-linecap="round" fill="none" opacity=".85"/><path d="M98 63 C116 69 184 69 202 63" stroke="${gold}" stroke-width="1.6" fill="none"/>
    <g transform="translate(150 52) scale(.82)">
      <path d="M-15 4 C-10 -4 -6 -7 0 -8 C6 -7 10 -4 15 4" stroke="${gold}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <path d="M-15 4 l-3 -4 M-15 4 l4 -1 M15 4 l3 -4 M15 4 l-4 -1" stroke="${gold}" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="0" cy="-12" r="3" fill="none" stroke="${gold}" stroke-width="1.8"/>
      <path d="M0 -9 V7 M-5 -6 H5 M-7 3 C-6 7 -3 8 0 8 C3 8 6 7 7 3" stroke="${gold}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M0 -9 V7" stroke="${goldD}" stroke-width=".8" fill="none" transform="translate(.9 0)"/>
    </g></g>`}
function agRosaArt(mood){const s=personSVG({...agRosaBase(),mood:mood||'smile'});
  return s.replace(/<\/g><\/g><\/g>\s*$/,m=>agCapSVG()+m)}
