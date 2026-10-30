// Site motion, implemented without a framework runtime.
(() => {
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const hoverDevice=matchMedia('(hover:hover) and (pointer:fine)');
 const running=new Set(),states=[];
 let raf=0,last=0;
 function step(time){
  raf=0;
  if(document.hidden||reduce.matches){last=0;return;}
  const dt=Math.min((time-(last||time))/1000,1/30);last=time;
  running.forEach(s=>{
   const count=Math.max(1,Math.ceil(dt*120)),h=dt/count;
   for(let i=0;i<count;i++)for(const key of ['y','scale']){
    const v=key+'Velocity';
    s[v]+=(-400*(s[key]-s.target[key])-17*s[v])*h;
    s[key]+=s[v]*h;
   }
   const settled=Math.abs(s.y-s.target.y)<.005&&Math.abs(s.yVelocity)<.02&&Math.abs(s.scale-s.target.scale)<.0001&&Math.abs(s.scaleVelocity)<.001;
   if(settled){s.y=s.target.y;s.scale=s.target.scale;running.delete(s);}
   if(settled&&s.target.y===0&&s.target.scale===1){
    // Return resting text to normal rasterization after the hover settles.
    s.el.style.removeProperty('translate');s.el.style.removeProperty('scale');
   }else{
    s.el.style.translate=`0 ${s.y.toFixed(3)}px`;
    s.el.style.scale=s.scale.toFixed(5);
   }
  });
  if(running.size)raf=requestAnimationFrame(step);else last=0;
 }
 function wake(){if(!raf&&!document.hidden&&!reduce.matches)raf=requestAnimationFrame(step);}
 function bind(el,{lift=-2,scale=1.05,press=.95}={}){
  const s={el,y:0,scale:1,yVelocity:0,scaleVelocity:0,target:{y:0,scale:1},hover:false,focus:false,pressed:false};states.push(s);
  function update(){
   el.classList.toggle('motion-pressed',s.pressed);
   if(reduce.matches)return;
   s.target={y:s.pressed?0:s.hover||s.focus?lift:0,scale:s.pressed?press:s.hover||s.focus?scale:1};
   running.add(s);wake();
  }
  el.addEventListener('pointerenter',()=>{if(hoverDevice.matches){s.hover=true;update();}});
  el.addEventListener('pointerleave',()=>{s.hover=false;s.pressed=false;update();});
  el.addEventListener('focus',()=>{s.focus=el.matches(':focus-visible');update();});
  el.addEventListener('blur',()=>{s.focus=false;s.pressed=false;update();});
  el.addEventListener('pointerdown',()=>{s.pressed=true;update();});
  for(const event of ['pointerup','pointercancel'])window.addEventListener(event,()=>{if(s.pressed){s.pressed=false;update();}},{passive:true});
  el.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){s.pressed=true;update();}});
  el.addEventListener('keyup',()=>{s.pressed=false;update();});
 }
 document.querySelectorAll('.intro-link,.socials a,.site-footer a').forEach(el=>bind(el));
 bind(document.querySelector('#theme'),{lift:0,scale:1.05,press:.95});
 document.querySelectorAll('.work-card-surface').forEach(el=>bind(el,{lift:-4,scale:1.02,press:.98}));

 const expo='cubic-bezier(.19,1,.22,1)',quart='cubic-bezier(.25,1,.5,1)';
 const animations=new Set();
 function reveal(el,{y=20,scale=1,duration=600,delay=0,easing=quart}={}){
  if(reduce.matches||!el)return;
  el.classList.remove('motion-reveal-pending');
  const animation=el.animate([{opacity:0,transform:`translateY(${y}px) scale(${scale})`},{opacity:1,transform:'translateY(0) scale(1)'}],{duration,delay,easing,fill:'backwards'});
  animations.add(animation);animation.finished.finally(()=>animations.delete(animation)).catch(()=>{});
 }
 // Intro enters as one block while its contents ripple in ~70ms apart inside it,
 // starting straight away (no dead gap).
 const intro=document.querySelector('.intro');
 reveal(intro,{y:30,scale:.95,duration:1000,easing:expo});
 intro.querySelectorAll('.avatar,#theme,h1,.tagline,.socials a,.timeline li,.intro-link').forEach((el,i)=>reveal(el,{y:20,scale:.95,duration:600,delay:80+i*70,easing:expo}));
 document.querySelectorAll('.site-nav a,.site-nav button').forEach((el,i)=>reveal(el,{y:30,scale:.95,duration:600,delay:i*70,easing:expo}));
 // The animations above now hold the hidden state, so release the first-paint guard.
 document.documentElement.classList.remove('motion-intro');
 // Writing rows lift slightly on hover.
 document.querySelectorAll('.post-row').forEach(el=>bind(el,{lift:-2,scale:1.01,press:.99}));
 // Timeline bullets wiggle 0→10→-10→0deg over 2s, then rest 4s + .5s per row.
 if(!reduce.matches)document.querySelectorAll('.timeline .bullet').forEach((el,i)=>{
  const cycle=6000+500*i,w=2000/cycle,e='ease-in-out';
  animations.add(el.animate([{transform:'rotate(0deg)',offset:0,easing:e},{transform:'rotate(10deg)',offset:w/3,easing:e},{transform:'rotate(-10deg)',offset:2*w/3,easing:e},{transform:'rotate(0deg)',offset:w},{transform:'rotate(0deg)',offset:1}],{duration:cycle,iterations:Infinity}));
 });
 const grid=document.querySelector('.grid svg');
 if(!reduce.matches){const fade=grid.animate([{opacity:0},{opacity:getComputedStyle(grid).opacity}],{duration:2000});animations.add(fade);fade.finished.finally(()=>animations.delete(fade)).catch(()=>{});}
 // One-time reveals, leaving the scroll-driven Work scene under its own clock.
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(!entry.isIntersecting)return;
  const el=entry.target;
  reveal(el,{y:20,scale:el.matches('h2')?1:.95,duration:el.matches('h2')?600:500});
  observer.unobserve(el);
 }),{rootMargin:'0px 0px -50px 0px'});
 document.querySelectorAll('[data-reveal]').forEach(el=>{if(!reduce.matches)el.classList.add('motion-reveal-pending');observer.observe(el);});
 function reset(){running.clear();states.forEach(s=>{s.el.classList.remove('motion-pressed');s.el.style.removeProperty('translate');s.el.style.removeProperty('scale');s.y=0;s.scale=1;s.yVelocity=s.scaleVelocity=0;s.hover=s.focus=s.pressed=false;s.target={y:0,scale:1};});}
 reduce.addEventListener('change',()=>{if(reduce.matches){reset();animations.forEach(a=>a.cancel());document.querySelectorAll('.motion-reveal-pending').forEach(el=>el.classList.remove('motion-reveal-pending'));}});
 document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden)reset();else wake();});
})();
