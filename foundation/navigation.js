// Track the current section without interrupting the Work scroll animation.
(() => {
 const nav=document.querySelector('.page-nav'),toggle=nav.querySelector('.nav-toggle');
 function close(){nav.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open navigation');}
 toggle.addEventListener('click',()=>{const open=nav.classList.toggle('is-open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');});
 nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',close));
 document.addEventListener('click',event=>{if(!nav.contains(event.target))close();});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav.classList.contains('is-open')){close();toggle.focus();}});
 matchMedia('(min-width:768px)').addEventListener('change',close);
 const links=Array.from(document.querySelectorAll('.page-nav a'));
 const sections=links.map(link=>document.querySelector(link.hash));
 let pending=false,lastTitle='';
 function update(){
  pending=false;
  let current=0;
  sections.forEach((section,i)=>{if(section&&section.getBoundingClientRect().top<=innerHeight*.35)current=i;});
  if(scrollY>0&&scrollY+innerHeight>=document.documentElement.scrollHeight-4)current=links.length-1;
  links.forEach((link,i)=>{if(i===current)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
  const title=current===0?'Vivaan Surti':links[current].textContent.trim()+' — Vivaan Surti';
  if(title!==lastTitle){lastTitle=title;document.dispatchEvent(new CustomEvent('site:title',{detail:title}));}

 }
 addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(update);}},{passive:true});
 addEventListener('resize',update,{passive:true});
 update();
})();
