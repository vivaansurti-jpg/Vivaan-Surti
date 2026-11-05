// Track the current section without interrupting the Work scroll animation.
(() => {
 const nav=document.querySelector('.page-nav'),toggle=nav.querySelector('.nav-toggle');
 const panel=nav.querySelector('.nav-links-panel');
 const mobile=matchMedia('(max-width:767px)');
 const backdrop=document.createElement('div');backdrop.className='nav-backdrop';backdrop.setAttribute('aria-hidden','true');nav.prepend(backdrop);
 toggle.querySelector('svg').innerHTML='<path class="nav-line" d="M4 6h16"/><path class="nav-line" d="M4 12h16"/><path class="nav-line" d="M4 18h16"/>';
 function setOpen(open){
  nav.classList.toggle('is-open',open);
  toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');
  panel.inert=!open;
 }
 function close(){setOpen(false);}
 toggle.addEventListener('click',()=>setOpen(!nav.classList.contains('is-open')));
 nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{if(mobile.matches){toggle.focus({preventScroll:true});close();}}));
 backdrop.addEventListener('click',close);
 document.addEventListener('click',event=>{if(mobile.matches&&!nav.contains(event.target))close();});
 document.addEventListener('keydown',event=>{
  if(!mobile.matches||!nav.classList.contains('is-open'))return;
  if(event.key==='Escape'){close();toggle.focus();}
  if(event.key==='Tab'){
   const items=[toggle,...panel.querySelectorAll('a')],first=items[0],last=items[items.length-1];
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  }
 });
 function alignMenu(){
  if(mobile.matches)return;
  const avatar=document.querySelector('.avatar');
  if(avatar){const box=avatar.getBoundingClientRect();nav.style.setProperty('--desktop-menu-top',`${Math.max(16,Math.min(innerHeight-320,box.top+scrollY+box.height/2-22))}px`);}
 }
 addEventListener('resize',alignMenu);document.fonts.ready.then(alignMenu);alignMenu();
 mobile.addEventListener('change',close);
 close();
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
