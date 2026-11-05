// Scroll-driven capsule, repeating letter rows, and staggered shallow-3D cards.
// All geometry is viewport-relative. Cards come from window.PROJECTS (projects.js).
const section=document.querySelector('#work');
const stage=section.querySelector('.work-stage');
const scene=section.querySelector('.work-scene');
const mask=section.querySelector('.work-mask');
const outline=section.querySelector('.mask-line');
const counter=section.querySelector('.work-counter');
const desktopNav=document.querySelector('.page-nav');
const desktopLinks=Array.from(desktopNav.querySelectorAll('a'));
let navGeometry=[];
function measureNavigation(){
 desktopLinks.forEach(link=>link.style.removeProperty('transform'));
 if(innerWidth<768){desktopNav.style.removeProperty('--nav-inactive-opacity');navGeometry=[];return;}
 const gap=44,total=desktopLinks.reduce((sum,link)=>sum+link.offsetWidth,0)+gap*(desktopLinks.length-1);
 let x=(innerWidth-total)/2;
 navGeometry=desktopLinks.map(link=>{const box=link.getBoundingClientRect();const point={x:x-box.left,y:14-box.top};x+=box.width+gap;return point;});
}
function paintNavigation(progress){
 if(innerWidth<768||desktopNav.querySelector('.nav-toggle')||progress===previousNavigation)return;
 previousNavigation=progress;
 // Lift first, then fan outward; both curves reverse with the capsule.
 const lift=smooth(progress/.85),fan=smooth((progress-.15)/.85);
 desktopNav.style.setProperty('--nav-inactive-opacity',(1-progress*.18).toFixed(3));
 desktopLinks.forEach((link,i)=>{const point=navGeometry[i];if(point)link.style.transform=`translate3d(${(point.x*fan).toFixed(2)}px,${(point.y*lift).toFixed(2)}px,0)`;});
}
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=v=>{v=clamp(v);return v*v*(3-2*v)};
const letters=[];const cards=[];
const copies=7;
let previousSpread=-1,previousCounter='',previousNavigation=-1,closingSpread=null;
function writeTransform(el,value){if(el.style.transform!==value)el.style.transform=value;}
const blank='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1082" height="636"%3E%3Cpath fill="black" d="M0 0h1082v636H0z"/%3E%3C/svg%3E';
for(let row=0;row<4;row++)for(let copy=0;copy<copies;copy++){
 const el=document.createElement('span');el.className='work-letter';el.textContent='WORK'[row];el.dataset.letter='WORK'[row];el.setAttribute('aria-hidden','true');el.style.zIndex=(row===0||row===3)&&copy%3===0?'3':'1';scene.append(el);letters.push({el,row,copy,visible:null});
}
const projects=window.PROJECTS||[];
const total=String(projects.length).padStart(2,'0');
projects.forEach((project,i)=>{
 const num=String(i+1).padStart(2,'0');
 // Each card opens that project's own page.
 const el=document.createElement('a');el.className='work-card';el.href=window.projectHref(project.slug);el.setAttribute('aria-label',project.name+' — open project page');
 const img=document.createElement('img');img.className='work-image';img.src=project.image?new URL(project.image,window.siteRoot).href:blank;img.alt='';img.loading='lazy';img.decoding='async';img.width=1082;img.height=636;img.draggable=false;
 const caption=document.createElement('span');caption.className='work-caption';caption.innerHTML='<span></span><span>'+num+' / '+total+'</span>';caption.firstChild.textContent=project.name;
 const surface=document.createElement('div');surface.className='work-card-surface';
 const imageWindow=document.createElement('div');imageWindow.className='work-image-window';imageWindow.append(img);surface.append(imageWindow,caption);el.append(surface);scene.append(el);cards.push({el,size:.5+((i*37)%50)/100,y:(.55+((i*23)%43)/100)*(i%2?-1:1)});
});
let width=innerWidth,height=innerHeight,start=0,range=1,target=0,current=0,frame=0,lastTime=0,active=true;
function measure(){
 width=stage.clientWidth;height=stage.clientHeight;start=section.getBoundingClientRect().top+scrollY;range=Math.max(1,section.offsetHeight-height);
 // Read dimensions together, only at initialization, font load, and resize.
 cards.forEach(card=>{card.width=card.el.offsetWidth;card.height=card.el.offsetHeight});
 measureNavigation();previousNavigation=-1;
 mask.setAttribute('viewBox',`0 0 ${width} ${height}`);previousSpread=-1;
 target=clamp((scrollY-start)/range);current=target;lastTime=0;paint();wake();
}
function updateTarget(){
 target=clamp((scrollY-start)/range);
 // Settle naturally while pinned. Once the stage has left the viewport,
 // finish immediately so a fast scroll cannot leave a stale gallery behind.
 if(scrollY<start-height||scrollY>start+range+height){
  if(frame){cancelAnimationFrame(frame);frame=0;}
  current=target;lastTime=0;paint();moving(false);return;
 }
 wake();
}
function capsule(cx,cy,w,h){const r=w/2;return `M ${cx-r} ${cy-h/2+r} A ${r} ${r} 0 0 1 ${cx+r} ${cy-h/2+r} L ${cx+r} ${cy+h/2-r} A ${r} ${r} 0 0 1 ${cx-r} ${cy+h/2-r} Z`;}
function paint(){
 if(reduced.matches){paintNavigation(0);scene.style.clipPath='none';cards.forEach(({el})=>el.removeAttribute('aria-hidden'));counter.textContent=projects.length+' projects';return;}
 const lite=document.documentElement.classList.contains('lite');
 const enter=smooth(current/.10),exit=smooth((current-.90)/.10),spread=closingSpread===null?enter*(1-exit):closingSpread;
 paintNavigation(spread);
 if(spread!==previousSpread){
 mask.style.visibility=spread===1?'hidden':'visible';
 const compactWidth=width<=576?width*.50:width<=987?width/3:Math.min(width/6,314);
 const expanded=Math.hypot(width,height)*1.7;
 const cw=compactWidth+(expanded-compactWidth)*spread,ch=height*.80+(expanded-height*.80)*spread;
 const outer=capsule(width/2,height/2,cw,ch),inner=capsule(width/2,height/2,Math.max(1,cw-24),Math.max(1,ch-24));
 const iw=Math.max(1,cw-24),ih=Math.max(1,ch-24),radius=Math.min(iw,ih)/2;
 const dx=Math.max(0,width/2-(iw/2-radius)),dy=Math.max(0,height/2-(ih/2-radius));
 const covered=dx*dx+dy*dy<=radius*radius;
 mask.style.visibility=covered?'hidden':'visible';
 if(!covered)outline.setAttribute('d',outer+' '+inner);
 const clip=covered?'none':`inset(${(height-ih)/2}px ${(width-iw)/2}px round ${radius}px)`;
 if(scene.style.clipPath!==clip)scene.style.clipPath=clip;
 scene.style.setProperty('--spread',spread.toFixed(3));
 previousSpread=spread;
 }
 const travel=clamp((current-.09)/.82);
 const letterSize=Math.min(height*.175,width<768?height*.175:190);
 const phone=width<=767;
 // Tall phone screens keep large letters, so viewport width alone is not
 // enough separation. Leave breathing room relative to the glyph size.
 const spacing=phone
  ? Math.max(width*.38,letterSize*1.15)
  : width*((.52/2.2+.145)/2);
 const letterScale=phone?1:1+spread*.15;
 letters.forEach(letter=>{
  const {el,row,copy}=letter;
  const cycle=travel*5*(1+row*.13);
  let slot=copy-Math.floor(copies/2)+cycle;
  slot=((slot+copies/2)%copies+copies)%copies-copies/2;
  const head=slot*spacing/(width*.52);
  const x=slot*spacing*spread;
  const visible=spread<.002?copy===Math.floor(copies/2):Math.abs(x)<width*.5+letterSize;
  if(visible!==letter.visible){el.style.visibility=visible?'visible':'hidden';letter.visible=visible;}
  if(!visible)return;
  const rowY=(row-1.5)*letterSize*(phone?1.05:1.05+spread*.09);
  const y=rowY+(row-1.5)*head*head*letterSize*.12*spread;
  writeTransform(el,`translate(-50%,-50%) translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) rotateY(${(lite?0:-head*10*spread).toFixed(2)}deg) scale(${(phone ? .76 : .76+spread*.06)*letterScale},${letterScale})`);
 });
 let visibleIndex=0;
 cards.forEach((card,i)=>{
  const center=.15+i*(.70/(cards.length-1));
  // Each project is on screen for a little over its own slot (0.57 of the
 // previous overlap), so they pass one at a time with a short pause between.
 const halfWindow=.57*.70/(cards.length-1);
  const t=clamp((current-center+halfWindow)/(2*halfWindow));
  // A slow-motion profile: a steady middle
  // with quartic entry/exit shoulders. Scroll supplies the clock.
  const linear=.3+.4*t;
  const eased=t<.425?linear*(1-(1-t/.425)**4):t>.575?linear+(t-linear)*((t-.575)/.425)**4:linear;
  const p=1-2*eased;
  const visible=Math.abs(p)<1&&spread>.6;
  if(visible!==card.visible){card.el.classList.toggle('is-visible',visible);card.el.setAttribute('aria-hidden',String(!visible));card.el.tabIndex=visible?0:-1;card.visible=visible;}
  if(!visible)return;
  if(Math.abs(p)<.55)visibleIndex=i+1;
  const cardW=card.width,cardH=card.height;
  const size=width>987?card.size:1;
  const smallScreen=width<=576||(width<=767&&width>height);
  const y=card.y*cardH*(smallScreen?1:.5)-cardH/2;
  // Transform order: local rotation, translation, scale.
  // Cards naturally enter and leave through the scene's side edges.
  writeTransform(card.el,`rotateY(${lite?0:-p*20}deg) translate3d(${p*(width*.5+cardW)-cardW/2}px,${y}px,${lite?0:p*p*-80}px) scale(${size})`);
 });
 const label=visibleIndex?String(visibleIndex).padStart(2,'0')+' / '+total:'';
 if(label!==previousCounter){counter.textContent=label;previousCounter=label;}

}
function tick(time){frame=0;if(!active||document.hidden||reduced.matches){lastTime=0;moving(false);return;}const dt=Math.min(64,time-(lastTime||time-1000/60));lastTime=time;current=document.documentElement.classList.contains('lite')?target:current+(target-current)*(1-Math.exp(-dt/80));if(Math.abs(target-current)<.00001)current=target;paint();if(current!==target)frame=requestAnimationFrame(tick);else{lastTime=0;moving(false);}}
function wake(){if(!frame&&active&&!document.hidden&&!reduced.matches){frame=requestAnimationFrame(tick);moving(true);}}
// While the gallery is moving, the slow background dots pause (no one notices
// during a scroll) so weaker machines spend every frame on the gallery itself.
let movingTimer=0;
function moving(on){clearTimeout(movingTimer);if(on)document.documentElement.classList.add('work-moving');else movingTimer=setTimeout(()=>document.documentElement.classList.remove('work-moving'),250);}
document.addEventListener('visibilitychange',()=>{if(!document.hidden){lastTime=0;updateTarget()}});
addEventListener('scroll',updateTarget,{passive:true});addEventListener('resize',measure);reduced.addEventListener('change',()=>{current=target;measure()});
new IntersectionObserver(entries=>{active=entries[0].isIntersecting;stage.classList.toggle('is-active',active);if(active){lastTime=0;updateTarget();wake();}else{if(frame){cancelAnimationFrame(frame);frame=0;}current=target;lastTime=0;paint();moving(false);}},{rootMargin:'100px'}).observe(section);
// Navbar travel excludes the pinned gallery's extra scroll distance.
let navigationFrame=0;
function cancelNavigation(){
 cancelAnimationFrame(navigationFrame);navigationFrame=0;
 if(closingSpread!==null){closingSpread=null;previousSpread=-1;updateTarget();}
}
addEventListener('wheel',cancelNavigation,{passive:true});
addEventListener('touchstart',cancelNavigation,{passive:true});
addEventListener('keydown',event=>{if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key))cancelNavigation();});
function navigateTo(top){
 cancelNavigation();
 const from=scrollY,to=Math.min(top,document.documentElement.scrollHeight-innerHeight);
 const forward=to>=from;
 // Collapse only the part of the gallery lying between the current and target positions.
 const low=Math.max(Math.min(from,to),start),high=Math.min(Math.max(from,to),start+range);
 const skipped=Math.max(0,high-low),distance=Math.abs(to-from)-skipped;
 const began=performance.now(),duration=650;
 // Close in place before the existing shortened navigation begins. Keep
 // gallery progress fixed so closing never scrubs through project cards.
 const inside=from>=start&&from<=start+range;
 const initialSpread=smooth(current/.10)*(1-smooth((current-.90)/.10));
 const closeDuration=inside&&initialSpread>0?320:0;
 if(closeDuration){
  if(frame){cancelAnimationFrame(frame);frame=0;}
  closingSpread=initialSpread;moving(true);
 }
 function step(now){
  const elapsed=now-began;
  if(elapsed<closeDuration){
   closingSpread=initialSpread*(1-smooth(elapsed/closeDuration));paint();
   navigationFrame=requestAnimationFrame(step);return;
  }
  if(closeDuration)closingSpread=0;
  const t=Math.min(1,(elapsed-closeDuration)/duration),ease=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  const travel=distance*ease;
  let position=from+(forward?travel:-travel);
  if(skipped&& (forward?position>=low:position<=high))position+=forward?skipped:-skipped;
  window.scrollTo({top:t===1?to:position,behavior:'instant'});
  // Avoid leaving an eased gallery frame behind after the skipped interval.
  target=clamp((scrollY-start)/range);current=target;paint();
  navigationFrame=t<1?requestAnimationFrame(step):0;
  if(t===1){closingSpread=null;previousSpread=-1;paint();moving(false);}
 }
 navigationFrame=requestAnimationFrame(step);
}
document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',event=>{
 if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||!link.hash)return;
 const dest=document.getElementById(decodeURIComponent(link.hash.slice(1)));if(!dest)return;event.preventDefault();history.pushState(null,'',link.hash);
 const top=dest.getBoundingClientRect().top+scrollY;
 // Landing exactly at the section start presents the closed capsule first.
 const smoothNavigation=Boolean(link.closest('.page-nav'))&&!reduced.matches;
 cancelNavigation();
 if(smoothNavigation)navigateTo(top);else window.scrollTo({top,behavior:'instant'});
 // During smooth navigation, scroll events drive the gallery at its actual position.
 if(!smoothNavigation){current=target=dest===section?0:clamp((top-start)/range);paint();}
}));
document.addEventListener('site:lite',()=>{previousSpread=-1;current=target;paint();});
measure();current=target;paint();document.fonts.ready.then(measure);
