// Track the current section without interrupting the Work scroll animation.
(() => {
 const links=Array.from(document.querySelectorAll('.page-nav a'));
 const sections=links.map(link=>document.querySelector(link.hash));
 const sectionTitles={home:'Vivaan Surti',work:'Projects | Vivaan Surti',writing:'Writing & Research | Vivaan Surti',contact:'Get in Touch | Vivaan Surti'};
 let pending=false,lastTitle='';
 function update(){
  pending=false;
  let current=0;
  sections.forEach((section,i)=>{if(section&&section.getBoundingClientRect().top<=innerHeight*.35)current=i;});
  if(scrollY>0&&scrollY+innerHeight>=document.documentElement.scrollHeight-4)current=links.length-1;
  links.forEach((link,i)=>{if(i===current)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
  const title=sectionTitles[links[current].hash.slice(1)]||'Vivaan Surti';
  if(title!==lastTitle){lastTitle=title;document.dispatchEvent(new CustomEvent('site:title',{detail:title}));}

 }
 addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(update);}},{passive:true});
 addEventListener('resize',update,{passive:true});
 update();
})();
