
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
function renderTheme(){const dark=root.dataset.theme==='dark';if(!button.firstElementChild)button.innerHTML='<span class="theme-track" aria-hidden="true"><span class="theme-thumb"></span></span>';button.setAttribute('role','switch');button.setAttribute('aria-checked',String(dark));button.setAttribute('aria-label','Dark mode');button.title='Switch to '+(dark?'light':'dark')+' mode';}
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
function enableLite(){
 if(root.classList.contains('lite'))return;
 root.classList.add('lite');stopLights();
 document.dispatchEvent(new Event('site:lite'));
}
// If the page still can't hold ~40fps a couple of seconds after load,
// switch to the lighter mode for the rest of the visit.
function watchFrames(){
 if(root.classList.contains('lite')||reducedAmbient.matches)return;
 const times=[];let last=0,slowWindows=0;
 function sample(t){
  if(document.hidden)return;
  if(last&&t-last<250)times.push(t-last);last=t;
  if(times.length<90){requestAnimationFrame(sample);return;}
  times.sort((a,b)=>a-b);
  slowWindows=times[45]>25?slowWindows+1:0;
  if(slowWindows>=2){enableLite();return;}
  // Require sustained slow frames; ignore isolated load or tab-switch stalls.
  if(slowWindows){times.length=0;last=0;requestAnimationFrame(sample);}
 }
 requestAnimationFrame(sample);
}
addEventListener('load',()=>setTimeout(watchFrames,2000));
