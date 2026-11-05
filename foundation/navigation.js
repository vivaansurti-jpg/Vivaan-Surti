// Track the current section without interrupting the Work scroll animation.
(() => {
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
