// Small easter eggs. Each one picks from a few lines at random, so they
// don't say the same thing every time.
(() => {
 const pick=list=>list[Math.floor(Math.random()*list.length)];

 // A quiet note at the bottom of the screen, for eggs with nowhere else to speak.
 let note=null,noteTimer=0;
 function toast(text,ms=2800){
  if(!note){note=document.createElement('div');note.className='egg-toast';note.setAttribute('role','status');document.body.append(note);}
  note.textContent=text;note.classList.add('is-on');
  clearTimeout(noteTimer);noteTimer=setTimeout(()=>note.classList.remove('is-on'),ms);
 }
 // Speak through the headline when it's on screen, otherwise as a note.
 function speak(text){
  const headline=window.siteHeadline;
  if(headline&&headline.inView())headline.say(text).then(ok=>{if(!ok)toast(text);});
  else toast(text);
 }

 // Leave the tab and its title calls you back.
 const away=['come back :(','hey, still there?','psst… over here','don’t be a stranger','viv misses you','👀'];
 const back=['welcome back!','oh hi again','there you are'];
 let title=document.title,backTimer=0;
 document.addEventListener('visibilitychange',()=>{
  clearTimeout(backTimer);
  if(document.hidden){
   if(!away.includes(document.title)&&!back.includes(document.title))title=document.title;
   document.title=pick(away);
  }else if(Math.random()<.5){
   document.title=pick(back);backTimer=setTimeout(()=>{document.title=title;},1800);
  }else document.title=title;
 });

 // Type "objection" anywhere for a ruling.
 const rulings=['sustained.','overruled.','on what grounds?','objection noted.','sustained. carry on.'];
 let typedSoFar='';
 addEventListener('keydown',e=>{
  if(e.ctrlKey||e.metaKey||e.altKey||e.target.closest?.('input,textarea,select,[contenteditable]'))return;
  if(!/^[a-z]$/i.test(e.key)){if(e.key!=='Shift')typedSoFar='';return;}
  typedSoFar=(typedSoFar+e.key.toLowerCase()).slice(-9);
  if(typedSoFar==='objection'){typedSoFar='';speak(pick(rulings));}
 });

 // Click the theme switch six times in a row and the lights go out: only a
 // small circle around the cursor (or finger) stays lit. The switch, or Esc,
 // turns them back on.
 const themeButton=document.querySelector('#theme');
 if(!themeButton)return;
 let clicks=[],dark=null,raf=0,lx=innerWidth/2,ly=innerHeight/2;
 themeButton.addEventListener('click',e=>{
  if(dark){e.stopImmediatePropagation();lightsOn();return;}   // this click only turns the lights back on
  const now=performance.now();
  clicks=clicks.filter(t=>now-t<2500);clicks.push(now);
  if(clicks.length>=6){clicks=[];lightsOut();}
 },true);
 function place(){raf=0;if(dark){dark.style.setProperty('--lx',lx+'px');dark.style.setProperty('--ly',ly+'px');}}
 function follow(e){lx=e.clientX;ly=e.clientY;if(!raf)raf=requestAnimationFrame(place);}
 function onEscape(e){if(e.key==='Escape')lightsOn();}
 function lightsOut(){
  const r=themeButton.getBoundingClientRect();lx=r.left+r.width/2;ly=r.top+r.height/2;
  dark=document.createElement('div');dark.className='lights-out';dark.setAttribute('aria-hidden','true');
  document.body.append(dark);place();
  requestAnimationFrame(()=>dark&&dark.classList.add('is-on'));
  addEventListener('pointermove',follow,{passive:true});
  addEventListener('pointerdown',follow,{passive:true});
  addEventListener('keydown',onEscape);
  toast(pick(['lights out.','who turned off the lights?','it’s dark in here.','oops.'])+' find the switch to turn them back on.',4200);
 }
 function lightsOn(){
  if(!dark)return;
  const layer=dark;dark=null;
  removeEventListener('pointermove',follow);removeEventListener('pointerdown',follow);removeEventListener('keydown',onEscape);
  layer.classList.remove('is-on');setTimeout(()=>layer.remove(),400);
  toast(pick(['lights on.','ah, much better.','and we’re back.']),1800);
 }
})();
