
const root=document.documentElement,button=document.querySelector('#theme');
// Evenly distributed positions with repeating 2–5px sizes.
// Lighter mode for low-core / low-memory / data-saver devices.
if((navigator.hardwareConcurrency||8)<=4||(navigator.deviceMemory||8)<=4||navigator.connection?.saveData)root.classList.add('lite');
const particles=document.querySelector('.particles');
const particleCount=root.classList.contains('lite')?20:innerWidth<768?28:50;
for(let i=0;i<particleCount;i++){
 const dot=document.createElement('span');dot.className='particle';
 const size=2+i%4;
 dot.style.cssText=`width:${size}px;height:${size}px;left:${(i*7.5)%100}%;top:${(i*13.7)%100}%;--duration:8s;--delay:-${(1+(i*.73)%7).toFixed(2)}s`;
 particles.append(dot);
}
const sun='<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2m-7.07-17.07 1.41 1.41m11.32 11.32 1.41 1.41M2 12h2M20 12h2m-13.66 5.66-1.41 1.41m14.14-14.14-1.41 1.41"/>';
const moon='<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>';
function renderTheme(){const dark=root.dataset.theme==='dark';button.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(dark?sun:moon)+'</svg>';button.setAttribute('aria-label','Switch to '+(dark?'light':'dark')+' mode')}
try{root.dataset.theme=localStorage.getItem('portfolio-theme')||'dark'}catch{}renderTheme();
function applyTheme(theme){root.dataset.theme=theme;try{localStorage.setItem('portfolio-theme',theme)}catch{}renderTheme();}
// Instant switch: colour transitions are suppressed, the new styles are
// flushed in one go (a few ms), then transitions are restored.
button.addEventListener('click',()=>{
 root.classList.add('theme-switching');
 applyTheme(root.dataset.theme==='dark'?'light':'dark');
 document.body.offsetHeight;
 root.classList.remove('theme-switching');
});
const glow=document.querySelector('.glow');
const dotNodes=Array.from(particles.children);
const dotAnchors=dotNodes.map((el,i)=>({el,x:0,y:0,light:0,duration:8000,delay:-(1+(i*.73)%7)*1000}));
function measureDots(){dotAnchors.forEach((dot,i)=>{dot.x=((i*7.5)%100)/100*innerWidth;dot.y=((i*13.7)%100)/100*innerHeight;});}
measureDots();addEventListener('resize',measureDots,{passive:true});
let pending=false,x=0,y=0,pointerActive=false,lightTimer=0;
const dotEpoch=performance.now();
function updateLights(){
 if(document.hidden||!pointerActive)return;
 const now=performance.now()-dotEpoch;
 dotAnchors.forEach(dot=>{
  // A drift approximation avoids reading 50 animated bounding boxes.
  // Dots rise 100px and return within each 8s cycle.
  const phase=(((now-dot.delay)%dot.duration)+dot.duration)%dot.duration/dot.duration;
  const lift=reducedAmbient.matches ? 50 : (1-Math.abs(2*phase-1))*100;
  const proximity=Math.max(0,1-Math.hypot(dot.x-x,dot.y-lift-y)/240);
  const light=proximity*proximity;
  if(Math.abs(dot.light-light)>.025){dot.light=light;dot.el.style.setProperty('--light',light.toFixed(2));}
 });
}
function stopLights(){pointerActive=false;clearInterval(lightTimer);lightTimer=0;dotAnchors.forEach(dot=>{if(dot.light){dot.light=0;dot.el.style.setProperty('--light','0');}});}
const reducedAmbient=matchMedia('(prefers-reduced-motion: reduce)');
window.addEventListener('pointermove',event=>{
 if(event.pointerType==='touch')return;
 x=event.clientX;y=event.clientY;
 // Lite mode keeps the glow but skips the per-dot lighting.
 if(!root.classList.contains('lite')){pointerActive=true;if(!lightTimer)lightTimer=setInterval(updateLights,100);}
 if(!pending){pending=true;requestAnimationFrame(()=>{glow.style.transform=`translate3d(${x-240}px,${y-240}px,0)`;pending=false;});}
},{passive:true});
document.documentElement.addEventListener('pointerleave',stopLights);
window.addEventListener('blur',stopLights);
document.addEventListener('visibilitychange',()=>{root.classList.toggle('ambient-paused',document.hidden);if(document.hidden)stopLights();});
// If the page still can't hold ~40fps a couple of seconds after load,
// switch to the lighter mode for the rest of the visit.
function watchFrames(){
 if(root.classList.contains('lite')||reducedAmbient.matches)return;
 const times=[];let last=0;
 function sample(t){
  if(document.hidden)return;
  if(last)times.push(t-last);last=t;
  if(times.length<90){requestAnimationFrame(sample);return;}
  times.sort((a,b)=>a-b);
  if(times[45]>25){root.classList.add('lite');stopLights();}
 }
 requestAnimationFrame(sample);
}
addEventListener('load',()=>setTimeout(watchFrames,2000));

// Now and then (every 7–18s at random) a shooting star crosses the sky from
// one edge to the other, behind the content. It is one small element moved
// by the compositor and removed afterwards; it skips hidden tabs and
// reduced motion.
(()=>{
 const reduceStars=matchMedia('(prefers-reduced-motion: reduce)');
 const sky=document.createElement('div');sky.className='background stars';sky.setAttribute('aria-hidden','true');
 document.body.prepend(sky);
 function shoot(){
  if(document.hidden||reduceStars.matches||root.classList.contains('lite'))return;
  const w=innerWidth,h=innerHeight,ltr=Math.random()<.5;
  const slope=(10+Math.random()*16)*Math.PI/180;      // gentle downward angle
  const len=100+Math.random()*90;                        // tail length
  const x0=ltr?-20:w+20,y0=Math.random()*h*.45;
  const run=w+40+len,x1=x0+(ltr?run:-run),y1=y0+run*Math.tan(slope);
  const angle=(ltr?slope:Math.PI-slope)*180/Math.PI;
  const star=document.createElement('span');star.className='shooting-star';star.style.width=len+'px';
  sky.append(star);
  const at=(x,y)=>`translate(${(x-len).toFixed(1)}px,${y.toFixed(1)}px) rotate(${angle.toFixed(1)}deg)`;
  const flight=star.animate([
   {transform:at(x0,y0),opacity:0},
   {opacity:1,offset:.12},
   {opacity:1,offset:.75},
   {transform:at(x1,y1),opacity:0}
  ],{duration:2800+Math.random()*1200,easing:'cubic-bezier(.35,0,.65,1)'});   // slow, unhurried crossing
  flight.finished.then(()=>star.remove(),()=>star.remove());
 }
 (function next(){setTimeout(()=>{shoot();next();},7000+Math.random()*11000);})();
})();
