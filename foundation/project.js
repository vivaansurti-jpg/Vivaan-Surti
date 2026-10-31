// Builds a project page from window.PROJECTS: a centred landing with the
// project's cards scattered around it, feature blocks, a story note, and
// links to the previous and next projects.
(() => {
 const list=window.PROJECTS||[],slug=document.body.dataset.project;
 const index=list.findIndex(p=>p.slug===slug),p=list[index];
 const page=document.getElementById('page');
 if(!p||!page)return;
 const pad=n=>String(n).padStart(2,'0'),num=pad(index+1),total=pad(list.length);
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const blank='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1082" height="636"%3E%3Cpath fill="black" d="M0 0h1082v636H0z"/%3E%3C/svg%3E';
 const src=path=>path?new URL(path,window.siteRoot).href:blank;
 const AR={wide:'1082 / 636',tall:'3 / 4',square:'1 / 1'};
 const card=(image,ar='wide')=>`<div class="shot"><div class="shot-window" style="--ar:${AR[ar]}"><img src="${esc(src(image))}" alt="" draggable="false"></div><div class="shot-cap"><span>${esc(p.name)}</span><span>${num} / ${total}</span></div></div>`;
 const shotAt=i=>p.shots.length?p.shots[i%p.shots.length]:p.image;
 // Scattered cards around the title (laptop widths only).
 const SCATTER=[
  {x:'3%', y:70, w:150,ar:'tall',  tilt:-3},
  {x:'15%',y:28, w:210,ar:'wide',  tilt:2},
  {x:'4%', y:330,w:220,ar:'wide',  tilt:1.5},
  {x:'17%',y:250,w:120,ar:'square',tilt:-4},
  {x:'4%', y:560,w:140,ar:'tall',  tilt:3},
  {x:'71%',y:40, w:220,ar:'wide',  tilt:-2},
  {x:'88%',y:120,w:140,ar:'tall',  tilt:3},
  {x:'78%',y:300,w:130,ar:'square',tilt:4},
  {x:'86%',y:470,w:160,ar:'tall',  tilt:-2.5},
 ];
 const home=window.siteHref('');
 const prev=list[(index-1+list.length)%list.length],next=list[(index+1)%list.length];
 const links=p.links.filter(l=>l.href);
 document.title=p.name+' — Vivaan Surti';

 page.innerHTML=`
<header class="pj-bar">
 <nav aria-label="Site"><a class="home" href="${esc(home)}">Vivaan Surti</a><a href="${esc(home+'#work')}">Work</a><a href="#features">Features</a><a href="#story">Story</a></nav>
 <span class="pj-mark" aria-hidden="true"></span>
 <div class="end"><button id="theme" aria-label="Switch to light mode"></button></div>
</header>
<main class="pj">
 <section class="pj-hero">
  <div class="pj-scatter" aria-hidden="true">${SCATTER.map((s,i)=>`<div class="pj-float" style="--x:${s.x};--y:${s.y}px;--w:${s.w}px;--tilt:${s.tilt}deg">${card(shotAt(i),s.ar)}</div>`).join('')}</div>
  <div class="pj-meta" data-intro>${num} / ${total} · ${esc(p.year)} · ${esc(p.type)}</div>
  <h1 data-intro>${esc(p.name)}</h1>
  <p class="pj-tagline" data-intro>${esc(p.tagline)}</p>
  ${links.length?`<div class="pj-actions" data-intro>${links.map((l,i)=>`<a class="pj-btn${i?'':' primary'}" href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join('')}</div>`:''}
  <div class="pj-main" data-intro>${card(p.image)}</div>
 </section>
 <section id="features" class="pj-features" aria-label="Features">
  ${p.features.map((f,i)=>`<article class="pj-feature${i%2?' flip':''}">
   <div class="pj-feature-media" data-reveal>${card(shotAt(i+1))}</div>
   <div class="pj-feature-text" data-reveal><span class="pj-bubble">${esc(f.bubble)}</span><h2>${esc(f.title)}</h2><p>${esc(f.text)}</p></div>
  </article>`).join('')}
 </section>
 <section id="story" class="pj-story">
  <div class="pj-pill" data-reveal>The story</div>
  <div class="pj-note" data-reveal><div class="pj-paper">
   ${p.story.map(t=>`<p>${t}</p>`).join('')}
   <div class="pj-sign"><span class="who"><span class="pj-avatar">VS</span><span>Vivaan Surti<br><small>Builder</small></span></span><span class="sig">${esc(p.name)}</span></div>
  </div><div class="shot-cap"><span>The story</span><span>${num} / ${total}</span></div></div>
 </section>
 <nav class="pj-next" aria-label="More projects">
  <a href="${esc(window.projectHref(prev.slug))}" data-reveal><small>← Previous project</small><span>${esc(prev.name)}</span></a>
  <a href="${esc(window.projectHref(next.slug))}" data-reveal><small>Next project →</small><span>${esc(next.name)}</span></a>
 </nav>
 <footer class="pj-footer"><span>© 2026 Vivaan Surti</span><a href="${esc(home+'#work')}">All work ↑</a></footer>
</main>`;

 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const expo='cubic-bezier(.19,1,.22,1)',spring='cubic-bezier(.34,1.56,.64,1)';
 if(!reduce){
  page.querySelectorAll('[data-intro]').forEach((el,i)=>el.animate([{opacity:0,transform:'translateY(20px)'},{opacity:1,transform:'none'}],{duration:800,delay:100+i*90,easing:expo,fill:'backwards'}));
  page.querySelectorAll('.pj-float').forEach((el,i)=>el.animate([{opacity:0,transform:'scale(.6) rotate(-8deg)'},{opacity:1,transform:'none'}],{duration:650,delay:500+i*80,easing:spring,fill:'backwards'}));
  const io=new IntersectionObserver(entries=>entries.forEach(e=>{
   if(!e.isIntersecting)return;
   e.target.classList.remove('motion-reveal-pending');
   e.target.animate([{opacity:0,transform:'translateY(24px)'},{opacity:1,transform:'none'}],{duration:700,easing:expo});
   io.unobserve(e.target);
  }),{rootMargin:'0px 0px -60px 0px'});
  page.querySelectorAll('[data-reveal]').forEach(el=>{el.classList.add('motion-reveal-pending');io.observe(el);});
 }

 // Scattered cards can be dragged around and come to the front.
 let z=10;
 page.querySelectorAll('.pj-float').forEach(el=>{
  let id=null,sx=0,sy=0,ox=0,oy=0,dx=0,dy=0;
  el.addEventListener('pointerdown',e=>{if(e.button!==0)return;id=e.pointerId;el.setPointerCapture(id);sx=e.clientX;sy=e.clientY;dx=dy=0;el.style.zIndex=++z;el.classList.add('is-dragging');});
  el.addEventListener('pointermove',e=>{if(e.pointerId!==id)return;dx=e.clientX-sx;dy=e.clientY-sy;el.style.translate=`${ox+dx}px ${oy+dy}px`;});
  const end=e=>{if(e.pointerId!==id)return;id=null;ox+=dx;oy+=dy;el.classList.remove('is-dragging');};
  el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
 });
})();
