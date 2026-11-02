// viz/bill.js — pictures for "The Robot Safety Bill" (Washington, DC): Byte's per-sentence infographics (VIZ kinds),
// the Future Table vignettes (bill_vig), the live whip board on the table (bill_whipBoard) and the cast's clothes (bill_dress).
const BV={ink:'#1f2340',soft:'#8a90b0',line:'#dfe3f3',navy:'#26346a',gold:'#e0b04a',marble:'#f4f1ea',cherry:'#f4a6c0',oak:'#8a5a3a',teal:'#16b3a6',coral:'#ff7a6b',red:'#e5484d',green:'#1fa774',violet:'#6c5ce7',paper:'#fffdf6'};
// placeholder until each picture is drawn
function bill_ph(t){return igFrame(300,110,`<rect x="6" y="6" width="288" height="98" rx="14" fill="#eef1fb"/>${igT(150,60,t,{s:12,c:BV.soft})}`,t)}
['hcNight','fakeOrder','doorsOpen','clock40','menuMaze','nineDays','crewNoBoss','sigCheck','whoSent','billCover','enactClause','defCrew','shallMay','legalSide','versions',
 'seats21','tieScale','chipCost','voteDial','pauseCrew','rumorWave','splitReport','passGauge','twoBills','reflectPool','cherry','flipVote',
 'billHopper','billCommittee','billMarkup','billFloor','billChambers','billSign'].forEach(k=>{VIZ[k]=a=>bill_ph(k+(a&&a.sec?' '+a.sec:''))});

// ---------- Future Table vignettes (120x90) ----------
let BILL_VN=0;
function bill_vig(kind){const id='bvg'+(++BILL_VN);let art=`<rect width="120" height="90" fill="#26346a"/><text x="60" y="48" text-anchor="middle" font-size="12" fill="#fff" font-family="Nunito">${kind}</text>`;
  return `<svg viewBox="0 0 120 90" class="vig"><clipPath id="${id}"><rect width="120" height="90" rx="10"/></clipPath><g clip-path="url(#${id})">${art}</g></svg>`}

// ---------- the whip board under the futures ----------
function bill_whipBoard(c){const k=M().knows(),v=bill_votes(c,k),p=bill_pct(bill_pass(c,k));
  return `<div class="bill-board"><div class="bb-row">${BILL_WHO.map(id=>{const n=bill_pct(v[id]);return `<div class="bb-m"><div class="bb-face">${bill_face(id,n>=70?'smile':n>=40?'think':'worried')}</div>
    <div class="bb-name">${esc(CAST[id].name.replace('Rep. ',''))}</div><div class="bb-bar"><i style="width:${n}%"></i></div><b>${n}% yes</b></div>`}).join('')}</div>
    <div class="bb-sum"><span><b>9</b> sure yes + 2 of these 3 = <b>11</b></span><em>Passes about ${p} in 100</em></div></div>`}

// ---------- clothes over the anime bust: blazers, a farmer's barn coat, a fire chief's dress uniform, the member pin ----------
function bill_dress(o,mood){return personSVG({...o,mood})}
