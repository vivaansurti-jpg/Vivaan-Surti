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

 // Click the theme switch six times in a row and the lights go out: a soft,
 // warm torch follows the cursor (or finger) with a little lag. It stays out
 // across pages for the rest of the visit, and only the switch turns it off.
 const themeButton=document.querySelector('#theme');
 const root=document.documentElement;
 const store={
  get(){try{return JSON.parse(sessionStorage.getItem('lights-out'));}catch{return null;}},
  set(v){try{v?sessionStorage.setItem('lights-out',JSON.stringify(v)):sessionStorage.removeItem('lights-out');}catch{}}
 };
 if(!themeButton){root.classList.remove('lights-out-pending');return;}
 let clicks=[],dark=null,raf=0,last=0,tx=innerWidth/2,ty=innerHeight/2,lx=tx,ly=ty;
 themeButton.addEventListener('click',e=>{
  if(dark){e.stopImmediatePropagation();lightsOn();return;}   // this click only turns the lights back on
  const now=performance.now();
  clicks=clicks.filter(t=>now-t<2500);clicks.push(now);
  if(clicks.length>=6){clicks=[];lightsOut();}
 },true);
 function place(){if(dark){dark.style.setProperty('--lx',lx.toFixed(1)+'px');dark.style.setProperty('--ly',ly.toFixed(1)+'px');}}
 // The beam eases toward the pointer like a hand-held torch (instant in lite mode).
 function step(t){
  raf=0;if(!dark)return;
  const dt=Math.min(50,t-(last||t));last=t;
  const k=root.classList.contains('lite')?1:1-Math.exp(-dt/70);
  lx+=(tx-lx)*k;ly+=(ty-ly)*k;place();
  if(Math.abs(tx-lx)>.4||Math.abs(ty-ly)>.4)raf=requestAnimationFrame(step);else last=0;
 }
 function follow(e){tx=e.clientX;ty=e.clientY;if(!raf)raf=requestAnimationFrame(step);}
 function remember(){if(dark)store.set({x:lx/innerWidth,y:ly/innerHeight});}
 function lightsOut(restored){
  if(restored){lx=tx=restored.x*innerWidth;ly=ty=restored.y*innerHeight;}
  else{const r=themeButton.getBoundingClientRect();lx=tx=r.left+r.width/2;ly=ty=r.top+r.height/2;}
  dark=document.createElement('div');dark.className='lights-out';dark.setAttribute('aria-hidden','true');
  if(restored)dark.classList.add('is-on','no-fade');
  document.body.append(dark);place();
  if(!restored)requestAnimationFrame(()=>dark&&dark.classList.add('is-on'));
  root.classList.remove('lights-out-pending');
  addEventListener('pointermove',follow,{passive:true});
  addEventListener('pointerdown',follow,{passive:true});
  addEventListener('pagehide',remember);
  remember();
  if(!restored)toast(pick(['lights out.','who turned off the lights?','it’s dark in here.','oops.'])+' find the switch to turn them back on.',4200);
 }
 function lightsOn(){
  if(!dark)return;
  const layer=dark;dark=null;store.set(null);
  removeEventListener('pointermove',follow);removeEventListener('pointerdown',follow);removeEventListener('pagehide',remember);
  layer.classList.remove('no-fade','is-on');setTimeout(()=>layer.remove(),400);
  toast(pick(['lights on.','ah, much better.','and we’re back.']),1800);
 }
 // Still dark from the previous page? Pick up where the torch was.
 const saved=store.get();
 if(saved)lightsOut(saved);else root.classList.remove('lights-out-pending');
})();
