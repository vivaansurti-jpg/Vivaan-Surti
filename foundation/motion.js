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
  const animation=el.animate([{opacity:0,transform:`translateY(${y}px) scale(${el.matches('.avatar')?.8:scale}) rotate(${el.matches('.avatar')?-10:0}deg)`},{opacity:1,transform:'translateY(0) scale(1)'}],{duration,delay,easing,fill:'backwards'});
  animations.add(animation);animation.finished.finally(()=>animations.delete(animation)).catch(()=>{});
 }
 // Intro enters as one block while its contents ripple in ~70ms apart inside it,
 // starting straight away (no dead gap).
 const intro=document.querySelector('.intro');
 reveal(intro,{y:30,scale:.95,duration:1000,easing:expo});
 intro.querySelectorAll('.avatar,#theme,h1,.tagline,.socials a,.timeline li,.intro-link').forEach((el,i)=>reveal(el,{y:20,scale:.95,duration:600,delay:80+i*70,easing:expo}));
 document.querySelectorAll('.site-nav a,.site-nav button').forEach((el,i)=>reveal(el,{y:30,scale:.95,duration:600,delay:i*70,easing:expo}));
 // Headline: types itself out once the intro has settled (~0.6s), 55–80ms per
 // letter with a short pause after commas. Screen readers get the current
 // line from the hidden copy, and reduced motion shows every line already typed.
 const typed=document.querySelector('.intro .typed-text');
 if(typed){
  const heading=typed.closest('h1'),srCopy=heading.querySelector('.sr-only');
  const still=reduce.matches;
  typed.dir='auto';   // right-to-left replies (Arabic, Hebrew, Persian) lay out correctly
  const pick=list=>list[Math.floor(Math.random()*list.length)];
  // Waits also hold while the tab is hidden, so typing never plays unseen.
  const whenVisible=()=>document.hidden?new Promise(resolve=>document.addEventListener('visibilitychange',function shown(){if(!document.hidden){document.removeEventListener('visibilitychange',shown);resolve();}})):null;
  const wait=ms=>still?Promise.resolve():new Promise(resolve=>setTimeout(resolve,ms)).then(whenVisible);
  const letter=c=>{const s=document.createElement('span');s.className='ch';s.textContent=c;s.hidden=!still;return s;};
  const chars=[];
  (function split(node){[...node.childNodes].forEach(n=>{
   if(n.nodeType===3){const frag=document.createDocumentFragment();
    [...n.textContent].forEach(c=>{const s=letter(c);frag.append(s);chars.push(s);});n.replaceWith(frag);}
   else split(n);});})(typed);
  if(!still)typed.querySelectorAll('.surname').forEach(g=>g.hidden=true);
  const caret=document.createElement('span');caret.className='caret';caret.setAttribute('aria-hidden','true');
  if(!still)heading.append(caret);
  // A highlight block shows only while one of its letters is visible.
  const syncGroup=ch=>{const g=ch.closest('.surname');if(g)g.hidden=![...g.querySelectorAll('.ch')].some(c=>!c.hidden);};
  const shownChars=()=>[...typed.querySelectorAll('.ch')].filter(c=>!c.hidden);
  async function typeOut(list){
   heading.classList.add('is-typing');
   for(const ch of list){ch.hidden=false;syncGroup(ch);await wait(55+Math.random()*25+(ch.textContent===','?260:0));}
   heading.classList.remove('is-typing');
  }
  async function erase(list){
   heading.classList.add('is-typing');
   for(const ch of [...list].reverse()){ch.hidden=true;syncGroup(ch);await wait(28);}
  }
  // The caret stays and blinks for as long as the page is open.
  let armed=false;

  // say(): change the headline to a new line, keeping whatever beginning the
  // two lines share and retyping only the rest. The caret stays and blinks.
  // Lines queue up, so one that arrives mid-typing plays right after.
  let queue=Promise.resolve();
  function say(line){const run=queue.then(()=>sayNow(line));queue=run.catch(()=>{});return run;}
  async function sayNow(line){
   const shown=shownChars(),current=shown.map(c=>c.textContent).join('');
   let keep=0;while(keep<current.length&&keep<line.length&&current[keep]===line[keep])keep++;
   const gone=shown.slice(keep);
   await wait(200);
   await erase(gone);
   typed.querySelectorAll('.ch').forEach(c=>{if(c.hidden)c.remove();});
   typed.querySelectorAll('.surname').forEach(g=>{if(!g.querySelector('.ch'))g.remove();});
   const added=[...line.slice(keep)].map(letter);typed.append(...added);
   srCopy.textContent=line;
   await wait(180);
   await typeOut(added);
   return true;
  }
  window.siteHeadline={say,inView(){const r=heading.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight;}};

  // Easter egg: greet back while the headline is on screen, as many times as
  // you like; each greeting gets a different line. Greetings and
  // replies live in greetings.js; each reply is in the greeting's own
  // language and picked at random. Matching ignores capitals, accents and
  // stretched endings, and works for one- or two-word greetings.
  const fold=s=>s.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/[-'’]/g,'').replace(/\s+/g,' ').trim().replace(/(\p{L})\1+$/u,'$1');
  const greetingTable=new Map();
  (window.siteGreetings||[]).forEach(([words,lines])=>words.forEach(w=>greetingTable.set(fold(w),lines)));
  const replyFor=text=>{
   const words=fold(text).split(' ');
   for(const n of [words.length,3,2,1]){                  // whole input first, then its last few words
    const lines=n>0&&n<=words.length&&greetingTable.get(words.slice(-n).join(' '));
    if(lines){const fresh=lines.filter(l=>l!==srCopy.textContent);return pick(fresh.length?fresh:lines);}   // never repeat the line already showing
   }
   return null;
  };
  let buffer='',pauseTimer=0;
  function onKey(e){
   if(!armed||e.metaKey||(e.ctrlKey&&!e.altKey)||e.target.closest?.('input,textarea,select,[contenteditable]'))return;
   if(!window.siteHeadline.inView()){buffer='';return;}   // only answer when they can see the headline
   clearTimeout(pauseTimer);
   const k=e.key;
   if([...k].length===1&&/[\p{L}\p{M}]/u.test(k)){
    buffer=(buffer+k).slice(-30);
    pauseTimer=setTimeout(check,700);
   }else if(k===' '){
    if(buffer.trim())e.preventDefault();             // mid-greeting: the space is part of it, not a page scroll
    if(!check(true)){if(buffer&&!buffer.endsWith(' '))buffer+=' ';pauseTimer=setTimeout(check,700);}
   }else if(k==='Enter'||k==='!'||k===','||k==='.'||k==='?'){
    check();
   }else if(k==='-'||k==='\''||k==='’'||k==='Dead'||k==='Shift'||k==='Alt'||k==='AltGraph'||k==='CapsLock'){
    // part of typing a word (hyphens, apostrophes, accents): keep going
   }else buffer='';
  }
  function check(keepOnMiss){
   const line=armed&&buffer.trim()?replyFor(buffer):null;
   if(line||!keepOnMiss)buffer='';
   if(line){lateCancelled=true;say(line);}   // every greeting gets a reply; the caret keeps blinking
   return !!line;
  }

  // Easter egg: between midnight and 5am (the visitor's time) the greeting
  // is replaced by a short late-night line, picked at random.
  const lateNight=['still up?','can’t sleep?','up late too?','night owl?'];
  let lateCancelled=false;
  (async()=>{
   await wait(600);
   await typeOut(chars);
   if(!still){armed=true;addEventListener('keydown',onKey);}
   if(new Date().getHours()<5){
    await wait(1300);
    if(lateCancelled)return;                  // they already greeted back
    await say(pick(lateNight));
   }
  })();
 }
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
