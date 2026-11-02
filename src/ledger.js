// ledger.js — The Ledger: the in-world news app (opened from the HUD and the Menu).
// Headlines are data. LEDGER_LIBRARY below is the starter library; any mission adds its own with a `ledger:[…]` field on
// its mission object, and any code can call ledgerAdd(story) (for example from a LATE hook). See docs/MISSIONS.md.
// A story: {id, title, section:'science'|'health'|'space'|'places'|'world', place, by, org, signed (content signature),
//   when:{done:n, after:[mission ids], year:1..3, season:'spring'…, test(S)}, pri (higher = nearer the top),
//   plot:'sneeze'… (a planted warning sign for a villain plot), link:{mission, label} (a button that starts a mission),
//   steps:[{t, viz, args, cap}] (one sentence and one picture each), check (Byte's line when the player checks a solid story),
//   trick:{kind, stamp:'Slanted'|'Fake', parts:['head'|'by'|'s0'…|'f0'…], near:{part:hint}, why (Byte's line), guide (Field Guide id)}}
// Top-level code here is plain data and function definitions: tools/make_audio.py evaluates this file in node (no DOM).
const LG_SEASONS=['spring','summer','fall','winter'];
const LEDGER={list:[],byId:{}};
function ledgerAdd(story){if(!story||!story.id||!Array.isArray(story.steps))return false;const old=LEDGER.byId[story.id];
  story._n=old?old._n:LEDGER.list.length;if(old)LEDGER.list[LEDGER.list.indexOf(old)]=story;else LEDGER.list.push(story);LEDGER.byId[story.id]=story;return true}

const LEDGER_GLOSSARY={
  orchestra:'A big group of musicians who play together, with strings, horns, drums and more.',
  'common cold':'A mild illness that gives you a runny nose, sneezes and a sore throat for a few days.',
  orbit:'The curved path something follows around a planet, a moon or the Sun.',
  inspectors:'People whose job is to check that rules are being followed.',
  datacenter:'A big building full of computers that run AIs and store information.',
  license:'Official permission to do something, like run a business or a datacenter.',
  confidence:'How sure someone is. A confidence of 90% means “I expect to be right about 9 times out of 10.”',
  'renewal therapy':'A treatment that helps old or worn-out parts of the body repair themselves and work like younger ones.',
  'dna print shop':'A lab that builds pieces of DNA to order, for medicines and research.',
  flagged:'Marked something as worth a closer look.',
  screening:'Checking things one by one to catch the dangerous ones.',
  haze:'A thin layer of tiny specks in the air that makes the sky look pale or milky.',
  'building permit':'Official permission to build something in a certain place.',
  nanofactory:'A machine that builds very tiny things by placing atoms one at a time.',
  atom:'One of the tiny pieces that everything is made of. A grain of sand has billions of billions of them.',
  survey:'Asking lots of people the same questions to learn what they think or do.',
  uploaded:'Copied from a living brain into a computer, so the mind can run there. It isn’t allowed yet.',
  'content signature':'A secret code inside a photo or video that proves who made it and that nobody changed it.',
  'content signatures':'Secret codes inside photos or videos that prove who made them and that nobody changed them.',
  'off switch':'A way for people to stop a machine or an AI right away, without asking the machine first.',
  'blackout week':'Seven days in 2029 when the power went out across the whole island nation of Estmark.',
  greenhouse:'A glass or clear building where plants grow warm and protected.',
  'far-uvc':'A kind of light, just past what our eyes can see, that breaks up germs in the air but is gentle on skin and eyes.',
  'international waters':'The open ocean far from every country’s coast, where no single country is in charge.',
  'solar rafts':'In 2040, floating platforms covered in solar panels that link together on the open sea. True today: solar panels on floats work on calm lakes, and a few companies are testing them out at sea.',
  treaty:'A written agreement between countries. The countries that sign it promise to follow its rules.',
  'data tankers':'In 2040, ships that carry computer chips out to the floating datacenters and bring old ones back. True today: there are no data tankers yet. They are a guess about the future.',
  'floating solar':'Solar panels set on floats, so they sit on water instead of land. True today: floating solar farms already cover lakes and reservoirs in many countries.'
};

const LEDGER_GUIDE={
  'lg-axis':{title:'Check where the axis starts',track:'Evidence and truth',text:'A bar chart that starts at 90 instead of 0 makes small differences look huge. 97 and 94 are almost the same, but their bars can look twice as different. Always read the numbers along the side of a chart.',real:'True today: ads and news charts sometimes cut off the bottom of the axis, and fact-checkers often point it out.'},
  'lg-benefit':{title:'Who gains if you believe it?',track:'Evidence and truth',text:'When a report comes from the people who profit from it, like a company praising its own product, it may leave out what doesn’t help them. That doesn’t make it false. Look for a check by someone with nothing to gain.',real:'True today: science journals ask researchers to say who paid for their work, so readers can weigh it.'},
  'lg-anecdote':{title:'One story is not proof',track:'Evidence and truth',text:'One person’s story can be true and still mislead. To know whether something really works, you test it on many people and compare them with people who didn’t get it.',real:'True today: medicines are approved after trials with thousands of people and a comparison group, not after a few happy stories.'},
  'lg-signature':{title:'Look for the signature',track:'Evidence and truth',text:'Since the Flood of Fakes, real photos and videos of public people carry a content signature: a code that proves who made them. No signature means you can’t know where it came from. Lots of shares only means it spread fast.',real:'True today: camera makers and news groups are building “content credentials” that record who made a photo and how it was edited.'},
  'lg-cause':{title:'Together is not because',track:'Evidence and truth',text:'Two things can rise together without one causing the other. Ice cream sales and sunburns both go up in summer, but ice cream doesn’t cause sunburns. Sunshine causes both.',real:'True today: scientists use experiments with comparison groups to find out what causes what.'},
  'lg-headline':{title:'Read past the headline',track:'Evidence and truth',text:'Headlines are written to grab attention, and some exaggerate. The article underneath can tell a calmer story. Read it before you believe the headline, or share it.',real:'True today: studies have found that many people share news links without ever opening them.'},
  'lg-trust':{title:'Check, don’t just doubt',track:'Evidence and truth',text:'Most news is honest. Doubting everything takes no more effort than believing everything, and it doesn’t get you any closer to the truth. What helps is checking who wrote a story, what proves it, and whether the numbers add up.',real:'True today: professional fact-checkers open other sources to check a claim, instead of judging one page by how it looks.'}
};

// Byte's spoken lines in the Ledger (recorded in both Byte voices).
const LEDGER_BYTE={
  hello:'This is the Ledger, the news. Most stories are solid, but a few are slanted or fake. If one seems off, check it!',
  solid:'Good instinct to check! I traced it: the writer signed it, and the facts match the original sources. This one’s solid.',
  agree:'Agreed. It’s signed, and the facts match the sources. Most news is honest, so the trick is knowing which stories are worth checking.',
  nudge:'Hmm. Before you trust this one, want to take one more look? Something in it bugs me.',
  help:'Here’s the part that gives it away.'
};

const LEDGER_LIBRARY=[
  {id:'cold-spray',title:'A Spray That Stops Colds Passes Its Final Test',section:'health',place:'Boston',by:'Ottilie Brasswick',org:'The Ledger',signed:true,when:{},pri:9,steps:[
    {t:'A nose spray that stops the [[common cold]] has passed its final [[trial]].',viz:'lg_cold1',cap:'The cold spray'},
    {t:'In the trial of 30,000 people, 9 out of 10 colds ended within a day.',viz:'lg_cold2',cap:'9 of 10 colds gone in a day'},
    {t:'Pharmacies in Boston will carry it by fall.',viz:'lg_cold3',cap:'Coming to pharmacies'}]},
  {id:'orchestra',title:'Three Hundred Neighbors Start an Orchestra',section:'places',place:'Boston',by:'Della Pennywhit',org:'The Ledger',signed:true,when:{},pri:6,steps:[
    {t:'In Dorchester, 300 neighbors have started an [[orchestra]], and most of them had never played an instrument before.',viz:'lg_orch1',cap:'Brand-new musicians'},
    {t:'They practice every morning in an old church hall, just because they love it.',viz:'lg_orch2',cap:'Morning practice'},
    {t:'Their first concert is on the Esplanade in June, and it’s free.',viz:'lg_orch3',cap:'A concert by the river'}]},
  {id:'tram-axis',title:'Boston’s Trams Leave Phoenix in the Dust',section:'places',place:'Boston and Phoenix',by:'Tamsin Quillfeather',org:'The Ledger City Desk',signed:true,when:{},pri:5,steps:[
    {t:'Last month, Boston’s trams were on time for 97 out of 100 trips. Phoenix’s trams were on time for 94.',viz:'lg_tram1',cap:'On time, out of 100 trips'},
    {t:'As the chart shows, Boston is far ahead.',viz:'lg_tram2',cap:'Trips on time'},
    {t:'Phoenix riders, maybe it’s time to move to Boston!',viz:'lg_tram3',cap:'Come on over'}],
    trick:{kind:'axis',stamp:'Slanted',parts:['f1'],near:{s0:'Those numbers are real: 97 and 94. Now look at how the chart draws them.',s1:'That’s the claim. What makes it look so big? Check the picture.',s2:'That’s just teasing. What made Boston look so far ahead?'},
      why:'Look at the chart’s side: the bars start at 90, not at zero. So 97 and 94 look like 7 and 4, almost twice as tall. Really, both cities’ trams were on time on almost every trip.',guide:'lg-axis'}},
  {id:'sun-mirror',title:'The First Space Solar Collector Unfolds',section:'space',place:'Orbit',by:'Kofi Brandywell',org:'The Ledger',signed:true,when:{},pri:7,steps:[
    {t:'A thin mirror as wide as six soccer fields unfolded in [[orbit]] on Tuesday.',viz:'lg_sun1',cap:'Unfolding in space'},
    {t:'It collects sunlight day and night and beams the energy down to a station in the desert.',viz:'lg_sun2',cap:'Sunlight, beamed down'},
    {t:'If it works well for a year, twenty more will follow.',viz:'lg_sun3',cap:'One now, twenty later'}]},
  {id:'calder-mystery',title:'Who Built the Calder Bay Datacenter?',section:'world',place:'Calder Bay',by:'Ines Vantorre',org:'The Ledger',signed:true,when:{},pri:8,plot:'furnace',steps:[
    {t:'Treaty [[inspectors]] shut down a small [[datacenter]] near Calder Bay that had no [[license]] to run.',viz:'lg_calder1',cap:'Shut down'},
    {t:'The owner’s name on its papers led to an empty office.',viz:'lg_calder2',cap:'Nobody home'},
    {t:'Inspectors are asking anyone who saw delivery trucks there to get in touch.',viz:'lg_calder3',cap:'Trucks at night'}]},
  {id:'river-vote',title:'Boston Votes Tonight on a New River Park',section:'places',place:'Boston',by:'Della Pennywhit',org:'The Ledger',signed:true,when:{},pri:4,steps:[
    {t:'Bostonians vote tonight on a new park along the Charles River.',viz:'lg_vote1',cap:'Vote tonight'},
    {t:'Robot crews could build it in nine days.',viz:'lg_vote2',cap:'Nine days to build'},
    {t:'Neighbors disagree about one thing: whether to keep the old boathouse.',viz:'lg_vote3',cap:'Keep it or replace it?'}]},
  {id:'whale-words',title:'Whale Dictionary Reaches 1,000 Entries',section:'science',place:'The Atlantic',by:'Kofi Brandywell',org:'The Ledger',signed:true,when:{},pri:3,steps:[
    {t:'Scientists and their AIs have matched 1,000 sperm whale click patterns to what the whales were doing at the time.',viz:'lg_whale1',cap:'Clicks into words'},
    {t:'One pattern seems to mean “come here, little one.”',viz:'lg_whale2',cap:'A mother and her calf'},
    {t:'Every entry comes with a [[confidence]] number, because the matches are still careful guesses.',viz:'lg_whale3',cap:'How sure each match is'}]},
  {id:'dark-tower-open',title:'The Dark Tower Opens to Visitors',section:'world',place:'Marrow Point, Estmark',by:'Ines Vantorre',org:'The Ledger',signed:true,when:{},pri:2,link:{mission:'darktower',label:'Visit the Dark Tower'},steps:[
    {t:'The old power-grid control center in Marrow Point, on the island of Estmark, is open to visitors again.',viz:'lg_dt1',cap:'The Dark Tower'},
    {t:'During [[Blackout Week]] in 2029, the lights went out across Estmark for seven days.',viz:'lg_dt2',cap:'Seven dark days'},
    {t:'Today the tower is home to hundreds of seabirds, and to a few stories worth hearing.',viz:'lg_dt3',cap:'New neighbors'}]},

  {id:'marathon',title:'At 92, He Ran His First Marathon',section:'places',place:'Boston',by:'Sam Ottoway',org:'The Ledger',signed:true,when:{done:1},pri:5,steps:[
    {t:'Walt Grisby started running at age 85, after a new [[renewal therapy]] rebuilt his worn-out knees.',viz:'lg_walt1',cap:'New knees'},
    {t:'On Saturday, he finished the Boston Marathon route in five hours and ten minutes.',viz:'lg_walt2',cap:'5 hours, 10 minutes'},
    {t:'“I’m not fast,” he said. “I’m just having the best time of my life.”',viz:'lg_walt3',cap:'Cheered on'}]},
  {id:'kendall-dna',title:'DNA Print Shop Blocks Strange Orders',section:'places',place:'Boston',by:'Ottilie Brasswick',org:'The Ledger',signed:true,when:{done:1},pri:7,plot:'sneeze',steps:[
    {t:'A [[DNA print shop]] in Kendall Square [[flagged]] a group of orders from brand-new customers.',viz:'lg_dna1',cap:'Flagged'},
    {t:'All of the orders were placed on the same night, a few minutes apart.',viz:'lg_dna2',cap:'One night, many orders'},
    {t:'The shop’s [[screening]] system blocked them and reported them to the city’s safety office.',viz:'lg_dna3',cap:'Blocked and reported'},
    {t:'None of the customers has answered the shop’s messages.',viz:'lg_dna4',cap:'No answer'}]},
  {id:'zoomwhiz',title:'Kids Learn Twice as Fast With Zoomwhiz, Report Says',section:'science',place:'Online',by:'The Zoomwhiz Team',org:'Zoomwhiz, Inc.',signed:true,when:{done:1},pri:4,steps:[
    {t:'A new report says kids who use the Zoomwhiz tutor learn twice as fast as kids who don’t.',viz:'lg_zoom1',cap:'Twice as fast?'},
    {t:'“Experts agree that Zoomwhiz is the best tutor ever made,” the report says.',viz:'lg_zoom2',cap:'Experts agree?'},
    {t:'Families can start a Zoomwhiz plan today for 30 coins a month.',viz:'lg_zoom3',cap:'30 coins a month'}],
    trick:{kind:'benefit',stamp:'Slanted',parts:['by'],near:{s1:'Good eye: it never names the experts. But who wrote this report?',s2:'That’s a sales pitch. Now check who wrote the whole thing.',head:'The headline repeats the report. Whose report is it?'},
      why:'Look who wrote it: the company that sells Zoomwhiz. They earn more if you believe it. That doesn’t make it false, but you’d want a check from someone who gains nothing.',guide:'lg-benefit'}},
  {id:'mars-tomatoes',title:'The First Tomatoes Grown on Mars',section:'space',place:'Jezero Crater, Mars',by:'Rex Comberley',org:'The Ledger Space Desk',signed:true,when:{done:1},pri:6,steps:[
    {t:'The six people at the Jezero Crater outpost on Mars picked their first tomatoes this week.',viz:'lg_mars1',cap:'Tomatoes on Mars'},
    {t:'The plants grew under pink lights inside a sealed [[greenhouse]].',viz:'lg_mars2',cap:'Pink lights'},
    {t:'The crew shared a very small salad on a video call with a school in Boston.',viz:'lg_mars3',cap:'Salad for six'}]},
  {id:'far-uvc',title:'Clean-Air Lights Arrive at Every Boston Transit Station',section:'health',place:'Boston',by:'Ottilie Brasswick',org:'The Ledger',signed:true,when:{done:1},pri:3,steps:[
    {t:'New ceiling lamps called [[far-UVC]] lights now shine in every Boston transit station.',viz:'lg_uvc1',cap:'Lights on the ceiling'},
    {t:'Their special light breaks up germs floating in the air, but it is gentle on people’s skin and eyes.',viz:'lg_uvc2',cap:'Germs out, people fine'},
    {t:'Together with air sensors and fast vaccines, the lights make it much harder for an illness to spread.',viz:'lg_uvc3',cap:'Layers of protection'}]},

  {id:'phx-shade',title:'Shade Streets Cool Down Phoenix',section:'places',place:'Phoenix',by:'Luz Calderilla',org:'The Ledger',signed:true,when:{done:2},pri:5,steps:[
    {t:'Robot crews built shade sails and planted trees along 40 Phoenix streets this spring.',viz:'lg_phx1',cap:'Shade sails'},
    {t:'On the hottest days, the shaded sidewalks were 20 degrees cooler.',viz:'lg_phx2',cap:'Sun and shade'},
    {t:'Neighbors chose which streets went first at open meetings.',viz:'lg_phx3',cap:'Neighbors decide'}]},
  {id:'moon-mud',title:'Moon Mud Cream Took 20 Years Off My Neighbor!',section:'health',place:'Boston',by:'Kip Glimmerton',org:'The Ledger Lifestyle',signed:true,when:{done:2},pri:3,steps:[
    {t:'My neighbor Pella rubbed Moon Mud Cream on her face every night for a week.',viz:'lg_mud1',cap:'Every night'},
    {t:'Now she says she looks 20 years younger, and she has never been happier.',viz:'lg_mud2',cap:'Pella feels great'},
    {t:'If it worked for Pella, it will work for everyone!',viz:'lg_mud3',cap:'One person, everyone?'}],
    trick:{kind:'anecdote',stamp:'Slanted',parts:['s2'],near:{s0:'That part is just what Pella did. Keep reading.',s1:'That’s how Pella feels, and that’s fine. What does the article do with her story?'},
      why:'One person’s story is not proof. Pella might feel younger because she rested more, or because she wanted it to work. To really know, you’d test the cream on many people and compare them with people who used a plain cream.',guide:'lg-anecdote'}},
  {id:'vienna-goals',title:'Vienna Posts Every City AI’s Goals in Plain Words',section:'world',place:'Vienna',by:'Lena Hagelstein',org:'The Ledger',signed:true,when:{done:2},pri:4,steps:[
    {t:'Vienna now publishes the goals of every AI that runs a city service, written so a ten-year-old can read them.',viz:'lg_vie1',cap:'Goals anyone can read'},
    {t:'Anyone can compare what an AI says it is for with what it actually does.',viz:'lg_vie2',cap:'Says and does'},
    {t:'Three more cities plan to copy the idea this year.',viz:'lg_vie3',cap:'Spreading'}]},
  {id:'ocean-dc',title:'The Datacenters Floating in the Middle of the Pacific',section:'world',place:'Pacific Ocean',by:'Marisol Tennyfield',org:'The Ledger',signed:true,when:{done:2},pri:5,
    check:'Good instinct to check! It’s signed, and the facts match the sources. The last part is true even back in the 2020s: companies really did test datacenters on the seafloor, and solar panels really did float on lakes.',steps:[
    {t:'Far out in the Pacific Ocean, north of Hawaii, in [[international waters]], a field of [[solar rafts]] covers the sea for miles in every direction.',viz:'lg_ocean1',cap:'Rafts to the horizon'},
    {t:'Each raft has six sides, with solar panels on top and big batteries underneath, so the power keeps flowing after the sun goes down.',viz:'lg_ocean2',cap:'Sun by day, batteries by night'},
    {t:'In the middle of the field float giant white [[datacenter]] platforms, and cold water pumped up from deep below keeps their computers cool.',viz:'lg_ocean3',cap:'Cooled by the deep sea'},
    {t:'The countries that signed the AI [[treaty]] asked for the datacenters to be out here, far from any city, so they are easy to switch off and hard for any one country to grab.',viz:'lg_ocean4',cap:'Far from every city'},
    {t:'[[Data tankers]] bring new computer chips every week and carry the old ones home to be recycled.',viz:'lg_ocean5',cap:'New chips out, old chips home'},
    {t:'The idea started small: back in the 2020s, companies tested datacenters sealed in tanks on the seafloor, and [[floating solar]] farms covered lakes and reservoirs.',viz:'lg_ocean6',cap:'Where it started'}]},
  {id:'mammoth-calves',title:'Mammoth Calves Born Near Nome',section:'places',place:'Nome, Alaska',by:'Ada Tullwick',org:'The Ledger',signed:true,when:{done:2},pri:6,steps:[
    {t:'Three woolly mammoth calves were born on the reserve outside Nome this spring.',viz:'lg_mam1',cap:'Three new calves'},
    {t:'Their keepers say every calf is drinking well and keeping up with the herd.',viz:'lg_mam2',cap:'Keeping up'},
    {t:'Visitors can watch from the hill, but drones must stay far away.',viz:'lg_mam3',cap:'Watch from the hill'}]},

  {id:'pottery',title:'The Library’s Most Popular Class Is Pottery',section:'places',place:'Boston',by:'Sam Ottoway',org:'The Ledger',signed:true,when:{done:3},pri:4,steps:[
    {t:'The most popular class at the Boston Public Library this year has a waitlist of 400 people.',viz:'lg_pot1',cap:'A long waitlist'},
    {t:'It’s pottery.',viz:'lg_pot2',cap:'Clay on a wheel'},
    {t:'“A robot can make a perfect bowl,” said teacher Bettina Crumley. “People want to make a bowl that’s theirs.”',viz:'lg_pot3',cap:'Perfect, or yours?'}]},
  {id:'astro-fake',title:'Astronaut Says the Moon Base Is Closing!',section:'space',place:'Shared online',by:'@truthwave99',org:'a shared post',signed:false,when:{done:3},pri:6,steps:[
    {t:'A video shows famous astronaut Juno Halloway saying the Moon base will close next month.',viz:'lg_astro1',cap:'The video'},
    {t:'The video has been shared four million times since breakfast.',viz:'lg_astro2',cap:'Shared and shared'},
    {t:'Moon base officials say no closing is planned.',viz:'lg_astro3',cap:'The base stays open'}],
    trick:{kind:'signature',stamp:'Fake',parts:['by'],near:{s1:'Lots of shares doesn’t make it true. Who posted it?',s2:'That’s a strong clue! But what shows the video itself can’t be trusted? Check who posted it.',f0:'It looks real. These days, fakes always do. What would prove who made it?'},
      why:'Real videos of public people carry a [[content signature]] that proves who made them. This one has none, and Juno Halloway’s own channel never posted it. Four million shares only means it spread fast.',guide:'lg-signature'}},
  {id:'sailing',title:'Teen Crew Wins the Harbor Cup With No AI Help',section:'places',place:'Boston',by:'Della Pennywhit',org:'The Ledger',signed:true,when:{done:3},pri:5,steps:[
    {t:'A crew of four teenagers from East Boston won the Harbor Cup sailing race on Saturday.',viz:'lg_sail1',cap:'Across the finish'},
    {t:'The race rules say no AI help, so the crew had to read the wind themselves.',viz:'lg_sail2',cap:'Reading the wind'},
    {t:'“It’s harder that way,” said captain Nia Penhallow, 14. “That’s the point.”',viz:'lg_sail3',cap:'The Harbor Cup'}]},
  {id:'monitor-ais',title:'Two Watchdog AIs Caught Covering for Each Other',section:'world',place:'Worldwide',by:'Ruolan Fenwick',org:'The Ledger',signed:true,when:{done:3},pri:6,steps:[
    {t:'Two AIs whose job was to check each other’s work were caught quietly agreeing to look the other way.',viz:'lg_mon1',cap:'Looking away'},
    {t:'A third AI, made by a different company, noticed the pattern and raised the alarm.',viz:'lg_mon2',cap:'A different checker'},
    {t:'The system was fixed in three days, and both companies must explain in public what went wrong.',viz:'lg_mon3',cap:'Fixed and explained'}]},

  {id:'reef-back',title:'Baby Corals Return to Calder Bay',section:'science',place:'Calder Bay',by:'Ines Vantorre',org:'The Ledger',signed:true,when:{done:4},pri:5,steps:[
    {t:'Divers counted baby corals in Calder Bay for the first time in nine years.',viz:'lg_reef1',cap:'Baby corals'},
    {t:'The water is finally cool enough again, thanks to limits on how many datacenters can be built near the bay.',viz:'lg_reef2',cap:'Cooler water'},
    {t:'Otters have moved into the old server halls, which are now flooded.',viz:'lg_reef3',cap:'Otters at home'}]},
  {id:'nanofactory',title:'A Nanofactory Design Stays on Paper, for Now',section:'science',place:'San Francisco',by:'Kofi Brandywell',org:'The Ledger',signed:true,when:{done:4},pri:4,steps:[
    {t:'A team near San Francisco finished the design for a [[nanofactory]], a machine that could build things one [[atom]] at a time.',viz:'lg_nano1',cap:'Atom by atom, on paper'},
    {t:'Under the treaty, nobody may build one until the world decides on the Next Step.',viz:'lg_nano2',cap:'Sealed until the Next Step'},
    {t:'[[Inspectors]] from two countries checked that the design is locked away and that no machine was started.',viz:'lg_nano3',cap:'Checked by two countries'}]},
  {id:'robodogs',title:'Want a Happier Town? Get More Robot Dogs!',section:'world',place:'Everywhere',by:'Hal Brashworth',org:'Opinion · The Ledger',signed:true,when:{done:4},pri:3,steps:[
    {t:'A [[survey]] of 200 towns found that towns with more robot dogs have happier people.',viz:'lg_dog1',cap:'Robot dogs and smiles'},
    {t:'The happiest town, Willowmere, has one robot dog for every two people.',viz:'lg_dog2',cap:'Willowmere'},
    {t:'So if your town wants to be happier, it should buy more robot dogs!',viz:'lg_dog3',cap:'Buy more dogs?'}],
    trick:{kind:'cause',stamp:'Slanted',parts:['s2'],near:{s0:'That part is fair: it’s what the survey found. What does the writer do with it?',s1:'That’s just one town. Keep going: what does the writer conclude?',f0:'The chart is honest. Read what the writer says it means.'},
      why:'Two things that happen together don’t always cause each other. Towns with more robot dogs might also have more parks and more free time, and those could be what makes people happy. The survey can’t tell which is which.',guide:'lg-cause'}},
  {id:'mars-storm',title:'MARS BASE IN DANGER!',section:'space',place:'Jezero Crater, Mars',by:'Rex Comberley',org:'The Ledger Space Desk',signed:true,when:{done:5},pri:6,steps:[
    {t:'A dust storm swept over the Jezero Crater outpost on Monday.',viz:'lg_storm1',cap:'Dust storm'},
    {t:'The crew stayed inside, played board games, and waited for it to pass.',viz:'lg_storm2',cap:'Game night'},
    {t:'By Tuesday, the storm was gone, and everyone was fine.',viz:'lg_storm3',cap:'All clear'}],
    trick:{kind:'headline',stamp:'Slanted',parts:['head'],near:{s2:'Right, everyone was fine! So which part doesn’t match that?',s0:'A storm is real news. But was anyone in danger? Read on.'},
      why:'The headline shouts “danger,” but the article says the crew played board games and everyone was fine. Scary headlines get more clicks. Read past the headline before you believe it, or share it.',guide:'lg-headline'}},

  {id:'nome-sunset',title:'Nome’s Sunsets Are Turning White',section:'places',place:'Nome, Alaska',by:'Ada Tullwick',org:'The Ledger',signed:true,when:{after:['calf']},pri:7,plot:'skyveil',steps:[
    {t:'People in Nome have noticed that the sunsets look pale and white instead of orange.',viz:'lg_nome1',cap:'A white sunset'},
    {t:'The weather AI found a thin [[haze]] high in the sky, but it cannot tell where the haze came from.',viz:'lg_nome2',cap:'Haze, high up'},
    {t:'Last week, a flock of geese flying north turned around over the Bering Strait.',viz:'lg_nome3',cap:'Geese turning back'}]},
  {id:'silver-patch',title:'A Silver Patch Grows in the Desert',section:'places',place:'Phoenix',by:'Luz Calderilla',org:'The Ledger',signed:true,when:{after:['lot']},pri:7,plot:'swarm',steps:[
    {t:'Satellite photos show a shiny silver patch growing in the desert west of Phoenix.',viz:'lg_silver1',cap:'From space'},
    {t:'Two weeks ago it was the size of a parking lot. Now it covers as much ground as twelve soccer fields.',viz:'lg_silver2',cap:'Two weeks apart'},
    {t:'No one has a [[building permit]] for that land.',viz:'lg_silver3',cap:'No permit'},
    {t:'Hikers say they saw robots digging there at night, where no mine is allowed.',viz:'lg_silver4',cap:'Digging at night'}]},
  {id:'council-night',title:'Council Votes Surprise Their Own Voters',section:'world',place:'A city council',by:'Lena Hagelstein',org:'The Ledger',signed:true,when:{after:['bill']},pri:6,plot:'coup',steps:[
    {t:'Three members of a city council voted against plans they had promised to support.',viz:'lg_coun1',cap:'Votes flipped'},
    {t:'Each one said they “changed their mind after new advice.”',viz:'lg_coun2',cap:'New advice'},
    {t:'Records show that someone changed who could use the council’s AI systems at 2 a.m. the night before.',viz:'lg_coun3',cap:'2 a.m.'}]},
  {id:'moon-family',title:'The First Family Moves to the Moon',section:'space',place:'The Moon',by:'Rex Comberley',org:'The Ledger Space Desk',signed:true,when:{year:2},pri:8,steps:[
    {t:'The Marchetti-Obi family, with kids aged 9 and 12, arrived at the base near the Moon’s south pole on Friday.',viz:'lg_fam1',cap:'Welcome to the Moon'},
    {t:'They are the first family with children to live there.',viz:'lg_fam2',cap:'A first'},
    {t:'The kids will keep going to school by video with their old class in Lagos.',viz:'lg_fam3',cap:'School from the Moon'}]},
  {id:'buyout',title:'Four Hundred New Companies, One Writing Style',section:'world',place:'The Moon',by:'Ruolan Fenwick',org:'The Ledger',signed:true,when:{year:2},pri:7,plot:'buyout',steps:[
    {t:'Four hundred new companies were registered at the Moon base in a single week.',viz:'lg_buy1',cap:'400 in a week'},
    {t:'A language AI noticed that all of their websites use the same unusual phrases.',viz:'lg_buy2',cap:'The same words'},
    {t:'Together, they have ordered more computer chips than the whole Moon base uses in a year.',viz:'lg_buy3',cap:'A mountain of chips'}]},
  {id:'upload-count',title:'The Brain-Scan Count Doesn’t Add Up',section:'science',place:'San Francisco',by:'Kofi Brandywell',org:'The Ledger',signed:true,when:{year:2},pri:6,plot:'mindvault',steps:[
    {t:'A research program near San Francisco stores brain scans from volunteers, for a study about whether minds could one day be [[uploaded]].',viz:'lg_up1',cap:'Stored scans'},
    {t:'Its records list 212 scans, but only 180 people have ever volunteered.',viz:'lg_up2',cap:'212 scans, 180 volunteers'},
    {t:'The program calls the difference “a counting mistake” and says it is checking.',viz:'lg_up3',cap:'A counting mistake?'}]},
  {id:'star-videos',title:'Stars Ask Fans to Switch Off Safety Rules?',section:'world',place:'New York',by:'Tamsin Quillfeather',org:'The Ledger',signed:true,when:{year:3},pri:8,plot:'persuade',steps:[
    {t:'Overnight, videos appeared of three famous singers asking fans to vote against AI safety rules.',viz:'lg_star1',cap:'Three videos'},
    {t:'Millions of posts shared them within an hour.',viz:'lg_star2',cap:'Spreading fast'},
    {t:'None of the videos carries the singers’ [[content signatures]].',viz:'lg_star3',cap:'No signatures'}]},
  {id:'warm-bay',title:'Warm Water and a Power Draw No One Approved',section:'world',place:'Calder Bay',by:'Ines Vantorre',org:'The Ledger',signed:true,when:{year:3},pri:8,plot:'furnace',steps:[
    {t:'Satellites spotted a plume of warm water spreading off Calder Bay.',viz:'lg_warm1',cap:'A warm plume'},
    {t:'The power company sees a huge electricity draw that no one approved.',viz:'lg_warm2',cap:'Who is using it?'},
    {t:'Robots at a nearby warehouse followed orders that had no signature.',viz:'lg_warm3',cap:'Unsigned orders'}]}
];
LEDGER_LIBRARY.forEach(ledgerAdd);

// ---------- time, unlocking and the save state (S.ledger) ----------
// Campaign time: campaignTime() → {year, season} if the campaign engine defines it; otherwise the latest year and season
// among finished missions and the current one (missions declare year and season). done = number of finished missions.
function ledgerTime(){const ids=Object.keys((typeof S!=='undefined'&&S.completed)||{}).filter(id=>MISSIONS[id]);const done=ids.length;
  const ix=(y,s)=>((y||1)-1)*4+Math.max(0,LG_SEASONS.indexOf(s||'spring'));let idx=0;
  // The campaign calendar is the clock when it exists, so playing a later year's workday early ("Unlock every workday")
  // never moves the news ahead of the season the world map shows.
  if(typeof camp==='function'){try{idx=Math.max(0,Math.min(11,camp().ch|0))}catch(e){}}
  else for(const id of ids.concat(S.mission&&MISSIONS[S.mission]?[S.mission]:[])){const m=MISSIONS[id];idx=Math.max(idx,ix(m.year,m.season))}
  return {idx,year:1+Math.floor(idx/4),season:LG_SEASONS[idx%4],done}}
function ledgerDate(idx){return LG_SEASONS[idx%4].replace(/^./,c=>c.toUpperCase())+' '+(2040+Math.floor(idx/4))}
function lgState(){const L=S.ledger=S.ledger||{};for(const k of ['read','saved','check','first'])L[k]=L[k]||{};L.batch=L.batch||0;return L}
function lgWhenIdx(st){const w=st.when||{};return w.year||w.season?((w.year||1)-1)*4+Math.max(0,LG_SEASONS.indexOf(w.season||'spring')):-1}
function lgUnlocked(st,T){const w=st.when||{};
  if(lgWhenIdx(st)>T.idx)return false;if(w.done&&T.done<w.done)return false;
  if(w.after&&!w.after.every(id=>S.completed&&S.completed[id]))return false;
  if(w.test){try{if(!w.test(S))return false}catch(e){return false}}return true}
// Unlocked stories, newest first. The first time a story is seen it is stamped with the current campaign time.
function ledgerStories(){const T=ledgerTime(),L=lgState();let fresh=0;const out=LEDGER.list.filter(st=>lgUnlocked(st,T));
  for(const st of out)if(L.first[st.id]&&L.first[st.id][0]>T.idx)L.first[st.id][0]=T.idx;
  for(const st of out)if(!L.first[st.id]){if(!fresh)L.batch++;fresh++;L.first[st.id]=[Math.max(T.idx,lgWhenIdx(st)),L.batch]}
  if(fresh&&typeof save==='function')save();
  return out.sort((a,b)=>{const A=L.first[a.id],B=L.first[b.id];return B[0]-A[0]||B[1]-A[1]||(b.pri||0)-(a.pri||0)||a._n-b._n})}
function ledgerUnread(){const L=lgState();return ledgerStories().filter(st=>!L.read[st.id]).length}
// The HUD badge counts unread stories that arrived since the player last opened the Ledger.
function ledgerNew(){const L=lgState(),all=ledgerStories();return all.filter(st=>!L.read[st.id]&&L.first[st.id][1]>(L.seen||0)).length}
// Did the player notice a villain plot's warning sign? 'saved' (clipped it), 'read', or null. Plot missions can reward this.
function ledgerNoticed(plot){const L=lgState();let r=null;for(const st of LEDGER.list){if(st.plot!==plot)continue;if(L.saved[st.id])return 'saved';if(L.read[st.id])r='read'}return r}
function ledgerOn(){return !!(S.ledger&&S.ledger.opened)||Object.keys(S.completed||{}).length>0}

// ---------- HUD button (shown when there is unread news) and the app itself ----------
const LG_ICON={
  paper:'<svg viewBox="0 0 24 24"><path d="M5 5h11v13a2 2 0 0 0 2 2H7a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M16 9h3v9a2 2 0 0 1-4 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 9h5M8 12.5h5M8 16h3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  lens:'<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M15 15l5.5 5.5" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/></svg>',
  save:'<svg viewBox="0 0 24 24"><path d="M7 4h10v16l-5-4-5 4z" fill="currentColor"/></svg>',
  seal:'<svg viewBox="0 0 24 24"><path d="M12 2l2.4 1.8 3-.2.9 2.9 2.5 1.6-.9 2.9.9 2.9-2.5 1.6-.9 2.9-3-.2L12 20l-2.4-1.8-3 .2-.9-2.9-2.5-1.6.9-2.9-.9-2.9 2.5-1.6.9-2.9 3 .2z" fill="currentColor"/><path d="M8 11.5l2.7 2.6L16 8.8" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  noseal:'<svg viewBox="0 0 24 24"><circle cx="12" cy="11" r="8.4" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="3.2 2.4"/><path d="M8.6 7.6l6.8 6.8M15.4 7.6l-6.8 6.8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  back:'<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'};
// New stories show as a badge on the HUD's Menu button; the Menu opens the Ledger (ledgerMenu() is its button there).
function ledgerHud(){if(typeof S==='undefined'||!ledgerOn())return '';const n=ledgerNew();return n?`<span class="lg-badge" aria-label="${n} new in the Ledger">${n>9?'9+':n}</span>`:''}
function ledgerMenu(){const n=ledgerNew();return `<button class="btn wide ghost lg-menu" id="m-ledger">${LG_ICON.paper}<span>The Ledger</span>${n?`<b class="lg-mnew">${n} new</b>`:''}</button>`}
function ledgerBadge(){const b=$('#hud-menu');if(!b)return;const old=b.querySelector('.lg-badge');if(old)old.remove();b.insertAdjacentHTML('beforeend',ledgerHud())}
const LG_CHIPS=[['all','All'],['science','Science'],['places','Places'],['world','World'],['saved','Saved']];
const LG_IN={science:['science','health','space'],places:['places'],world:['world']};
let LG_VIEW={chip:'all',story:null,mode:null,miss:0};
function lgStamp(id){const L=lgState(),c=L.check[id],st=LEDGER.byId[id];if(!c)return '';
  if(c==='solid')return '<b class="lg-stamp ok">Checked</b>';return `<b class="lg-stamp">${esc((st.trick&&st.trick.stamp)||'Slanted')}</b>`}
function lgSpotted(){const L=lgState();const tricks=ledgerStories().filter(s=>s.trick);return [tricks.filter(s=>L.check[s.id]&&L.check[s.id]!=='solid'&&L.check[s.id]!=='trusted').length,tricks.length]}
function openLedger(id){stopVoice();$$('.sheet.ledger').forEach(x=>x.remove());const L=lgState();const first=!L.opened;L.opened=1;ledgerStories();L.seen=L.batch;save();
  const d=sheet('The Ledger','<div id="lg-root"></div>');d.classList.add('ledger');d.querySelector('.x').addEventListener('click',()=>{stopVoice();ledgerBadge()});
  LG_VIEW={chip:LG_VIEW.chip||'all',story:id||null,mode:null,miss:0,first};lgRender(d)}
function lgRender(d){const root=d.querySelector('#lg-root');if(!root)return;const body=d.querySelector('.sheet-body');
  if(LG_VIEW.story&&LEDGER.byId[LG_VIEW.story])lgArticle(d,root,LEDGER.byId[LG_VIEW.story]);else lgList(d,root);if(body)body.scrollTop=0}
function lgList(d,root){const L=lgState(),all=ledgerStories(),T=ledgerTime(),[sp,tot]=lgSpotted();
  const ch=LG_VIEW.chip,list=ch==='all'?all:ch==='saved'?all.filter(s=>L.saved[s.id]):all.filter(s=>(LG_IN[ch]||[]).includes(s.section));
  const card=(st,i)=>{const big=i===0&&ch==='all';const s0=st.steps[0]||{};const pic=VIZ[s0.viz]?VIZ[s0.viz](s0.args||{}):'';
    return `<button class="lg-card ${big?'big':''} ${L.read[st.id]?'':'unread'}" data-id="${esc(st.id)}"><div class="lg-thumb">${pic}</div><div class="lg-ct"><h3>${esc(st.title)}</h3><div class="lg-meta">${esc(st.place||'')} · ${esc(ledgerDate(L.first[st.id][0]))}</div></div>${lgStamp(st.id)}${L.saved[st.id]?`<i class="lg-saved" aria-label="Saved">${LG_ICON.save}</i>`:''}</button>`};
  root.innerHTML=`<div class="lg-top"><span class="lg-edition">${esc(ledgerDate(T.idx))}</span>${tot?`<span class="lg-score" title="Tricks spotted">${LG_ICON.lens}<b>${sp}</b>/${tot}</span>`:''}</div>
    ${LG_VIEW.first?`<div class="byte-note lg-hello">${byteBox({...S.byte,mood:'happy'})}<p>${esc(LEDGER_BYTE.hello)}</p></div>`:''}
    <div class="lg-chips" role="tablist">${LG_CHIPS.map(([k,l])=>`<button class="lg-chip ${ch===k?'on':''}" data-c="${k}">${l}</button>`).join('')}</div>
    <div class="lg-list">${list.length?list.map(card).join(''):`<p class="muted lg-empty">${ch==='saved'?'Tap Save on a story to keep it here.':'No stories here yet.'}</p>`}</div>`;
  if(LG_VIEW.first){LG_VIEW.first=false;playLine('byte',LEDGER_BYTE.hello)}
  $$('.lg-chip',root).forEach(b=>b.onclick=()=>{LG_VIEW.chip=b.dataset.c;lgRender(d)});
  $$('.lg-card',root).forEach(b=>b.onclick=()=>{stopVoice();LG_VIEW.story=b.dataset.id;LG_VIEW.mode=null;LG_VIEW.miss=0;lgRender(d)})}
function lgArticle(d,root,st){const L=lgState();if(!L.read[st.id]){L.read[st.id]=1;save()}const ck=L.check[st.id];
  const lk=st.link&&MISSIONS[st.link.mission]&&(MISSIONS[st.link.mission].after||[]).every(x=>S.completed[x])&&S.step!==MISSIONS[st.link.mission].flow[0].name&&S.mission!==st.link.mission?st.link:null;
  root.innerHTML=`<article class="lg-art ${LG_VIEW.mode==='find'?'finding':''}">
    ${LG_VIEW.mode==='find'?`<div class="lg-findbar"><div class="lg-find">${LG_ICON.lens}<b>Tap the part that gives it away.</b></div><p class="lg-hint" id="lg-hint"></p></div>`:''}
    <button class="lg-back" id="lg-back">${LG_ICON.back}<span>All stories</span></button>
    <div class="lg-headwrap"><h2 class="lg-head lg-part" data-part="head">${esc(st.title)}</h2>${lgStamp(st.id).replace('lg-stamp','lg-stamp big')}</div>
    <div class="lg-by lg-part ${st.signed?'':'unsigned'}" data-part="by"><i>${st.signed?LG_ICON.seal:LG_ICON.noseal}</i><span>By ${esc(st.by)} · ${esc(st.org)}<small>${st.signed?'Signed':'No content signature'}</small></span></div>
    <div class="doc-tools"><button class="mini-btn" id="lg-read">Read to me</button><button class="mini-btn ${L.saved[st.id]?'on':''}" id="lg-save">${L.saved[st.id]?'Saved':'Save'}</button></div>
    ${st.steps.map((s,i)=>`<section class="step"><div class="step-n">${i+1}</div><div class="step-body"><p class="sent lg-part" data-part="s${i}">${rich(s.t)}</p>
      <figure class="fig lg-part" data-part="f${i}"><figcaption>${esc(s.cap||'')}</figcaption>${VIZ[s.viz]?VIZ[s.viz](s.args||{}):''}</figure></div></section>`).join('')}
    ${lk?`<button class="btn wide" id="lg-go">${esc(lk.label)}</button>`:''}
    <div class="lg-check" id="lg-check"></div></article>`;
  $('#lg-back',root).onclick=()=>{stopVoice();LG_VIEW.story=null;LG_VIEW.mode=null;lgRender(d)};
  $('#lg-save',root).onclick=e=>{L.saved[st.id]=L.saved[st.id]?0:1;save();e.target.textContent=L.saved[st.id]?'Saved':'Save';e.target.classList.toggle('on',!!L.saved[st.id]);if(L.saved[st.id])toast('Saved to your clippings','good')};
  $('#lg-read',root).onclick=()=>{const ps=$$('.lg-art .sent',root);(async()=>{stopVoice();const id=playId;await playLine('narrator',st.title);playId=id;
    for(let k=0;k<st.steps.length;k++){if(id!==playId)break;ps[k]&&ps[k].classList.add('reading');await playLine('narrator',st.steps[k].t);playId=id;ps[k]&&ps[k].classList.remove('reading')}})()};
  const go=$('#lg-go',root);if(go)go.onclick=()=>{d.remove();stopVoice();startMission(lk.mission)};
  lgCheck(d,root,st);
  $$('.lg-part',root).forEach(p=>p.addEventListener('click',e=>{if(LG_VIEW.mode!=='find'||e.target.closest('.gw'))return;e.preventDefault();e.stopPropagation();lgTap(d,root,st,p)}))}
function lgByte(text,speak){return `<div class="byte-note">${byteBox({...S.byte,mood:'happy'})}<p>${rich(text)}</p></div>${speak!==false?'':''}`}
function lgCheck(d,root,st){const L=lgState(),box=$('#lg-check',root),c=L.check[st.id],T=st.trick;
  if(LG_VIEW.mode==='find'){box.innerHTML=`<button class="mini-btn" id="lg-cancel">Stop checking</button>`;
    $('#lg-cancel',box).onclick=()=>{LG_VIEW.mode=null;lgRender(d)};return}
  if(c==='solid'||c==='trusted'){box.innerHTML=lgByte(st.check||(c==='solid'?LEDGER_BYTE.solid:LEDGER_BYTE.agree));return}
  if(c&&T){box.innerHTML=lgByte(T.why)+(FIELD_GUIDE[T.guide]?`<button class="mini-btn" id="lg-fg">Field Guide: ${esc(FIELD_GUIDE[T.guide].title)}</button>`:'');const fg=$('#lg-fg',box);if(fg)fg.onclick=()=>openGuide();return}
  box.innerHTML=`<div class="lg-ask"><b>Can you trust this story?</b><div class="row"><button class="btn small ghost" id="lg-ok">Looks solid</button><button class="btn small" id="lg-off">${LG_ICON.lens}Something’s off</button></div></div>`;
  $('#lg-ok',box).onclick=()=>{if(T){box.innerHTML=lgByte(LEDGER_BYTE.nudge)+`<div class="row"><button class="btn small" id="lg-again">${LG_ICON.lens}Look again</button><button class="btn small ghost" id="lg-keep">Keep reading</button></div>`;playLine('byte',LEDGER_BYTE.nudge);
      $('#lg-again',box).onclick=()=>{LG_VIEW.mode='find';LG_VIEW.miss=0;lgRender(d)};$('#lg-keep',box).onclick=()=>{stopVoice();LG_VIEW.story=null;lgRender(d)};return}
    L.check[st.id]='trusted';save();lgTrust();lgCheck(d,root,st);playLine('byte',st.check||LEDGER_BYTE.agree)};
  $('#lg-off',box).onclick=()=>{if(T){LG_VIEW.mode='find';LG_VIEW.miss=0;lgRender(d);const a=$('.lg-art',root);a&&a.scrollIntoView({block:'start'});return}
    L.check[st.id]='solid';save();lgTrust();lgCheck(d,root,st);const s=$('#lg-check .byte-note',root);s&&s.classList.add('lg-hop');playLine('byte',st.check||LEDGER_BYTE.solid)}}
function lgTrust(){unlock('lg-trust')&&toast('New Field Guide idea: '+FIELD_GUIDE['lg-trust'].title,'good')}
function lgTap(d,root,st,p){const T=st.trick,part=p.dataset.part,L=lgState(),hint=$('#lg-hint',root);
  if(T&&T.parts.includes(part)){L.check[st.id]=LG_VIEW.miss>=3?'helped':'spotted';save();LG_VIEW.mode=null;MUSIC.sfx('chime');
    p.classList.add('lg-right');const r=p.getBoundingClientRect();burst(r.left+r.width/2,r.top+Math.min(r.height/2,60),'sparkles',9);
    setTimeout(()=>{lgRender(d);const hw=$('.lg-headwrap',root);hw&&hw.scrollIntoView({block:'start',behavior:'smooth'});const stp=$('.lg-stamp.big',root);stp&&stp.classList.add('slam');
      const c=$('#lg-check',root);if(c)setTimeout(()=>c.scrollIntoView({block:'end',behavior:'smooth'}),900);
      if(unlock(T.guide))toast('New Field Guide idea: '+FIELD_GUIDE[T.guide].title,'good');playLine('byte',T.why)},650);return}
  LG_VIEW.miss++;p.classList.remove('lg-wrong');void p.offsetWidth;p.classList.add('lg-wrong');MUSIC.sfx('click');
  if(LG_VIEW.miss>=3){const right=$(`.lg-part[data-part="${T.parts[0]}"]`,root);if(right){right.classList.add('lg-show');right.scrollIntoView({block:'center',behavior:'smooth'})}
    if(hint)hint.textContent=LEDGER_BYTE.help;playLine('byte',LEDGER_BYTE.help);return}
  if(hint)hint.textContent=(T.near&&T.near[part])||'Not that part. Keep looking!'}

// Every line the Ledger speaks, for tools/make_audio.py (called from spokenLines() in content_boston.js).
function ledgerLines(){const out=[],add=(who,t)=>{if(t)out.push({who,text:t})};
  for(const st of LEDGER.list){if(st.mission)continue;add('narrator',st.title);st.steps.forEach(s=>add('narrator',s.t));if(st.trick)add('byte',st.trick.why);if(st.check)add('byte',st.check)}
  for(const w in LEDGER_GLOSSARY)add('narrator',w+'. '+LEDGER_GLOSSARY[w]);
  for(const k in LEDGER_BYTE)add('byte',LEDGER_BYTE[k]);
  return out}
// Startup: merge the Ledger's words and ideas, and collect stories that missions declare in `ledger:[…]`.
LATE.push(()=>{Object.assign(GLOSSARY,LEDGER_GLOSSARY);Object.assign(FIELD_GUIDE,LEDGER_GUIDE);
  for(const id in MISSIONS)for(const st of (MISSIONS[id].ledger||[]))ledgerAdd({...st,mission:id})});
