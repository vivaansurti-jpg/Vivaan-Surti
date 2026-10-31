(() => {
 const mark=document.querySelector('.avatar');
 if(!mark)return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const fine=matchMedia('(hover: hover) and (pointer: fine)');
 const particles=[];
 mark.querySelectorAll('pre').forEach(pre=>{
  const rows=pre.textContent.split('\n');
  pre.textContent='';
  rows.forEach((row,y)=>Array.from(row).forEach((char,x)=>{
   const span=document.createElement('span');
   span.textContent=char;
   span.style.left=`${x*100/48}%`;
   span.style.top=`${y*100/24}%`;
   pre.appendChild(span);
   particles.push({el:span,x,y,dx:0,dy:0,vx:0,vy:0});
  }));
 });
 let frame=0,last=0,pointer=null;
 function tick(time){
  frame=0;
  const dt=Math.min((time-(last||time))/1000,.032);last=time;
  const box=mark.getBoundingClientRect();
  let moving=false;
  particles.forEach(p=>{
   let tx=0,ty=0;
   if(pointer&&fine.matches){
    const dx=box.left+(p.x+.5)*box.width/48-pointer.x;
    const dy=box.top+(p.y+.5)*box.height/24-pointer.y;
    const distance=Math.hypot(dx,dy),radius=28;
    if(distance<radius){const force=(1-distance/radius)*4;tx=dx/(distance||1)*force;ty=dy/(distance||1)*force;}
   }
   p.vx+=((tx-p.dx)*150-p.vx*19)*dt;
   p.vy+=((ty-p.dy)*150-p.vy*19)*dt;
   p.dx+=p.vx*dt;p.dy+=p.vy*dt;
   if(Math.abs(p.dx-tx)+Math.abs(p.dy-ty)+Math.abs(p.vx)+Math.abs(p.vy)>.03)moving=true;
   p.el.style.transform=`translate(${p.dx.toFixed(2)}px,${p.dy.toFixed(2)}px)`;
  });
  if(moving)frame=requestAnimationFrame(tick);else last=0;
 }
 function wake(){if(!frame&&!reduce.matches)frame=requestAnimationFrame(tick);}
 if(!reduce.matches)particles.forEach(p=>{
  p.dx=(Math.random()-.5)*90;p.dy=(Math.random()-.5)*90;
  p.el.animate([{opacity:0},{opacity:1}],{duration:550,delay:Math.random()*250,fill:'backwards'});
 });
 wake();
 window.addEventListener('pointermove',event=>{pointer={x:event.clientX,y:event.clientY};wake();},{passive:true});
 document.documentElement.addEventListener('pointerleave',()=>{pointer=null;wake();});
 window.addEventListener('blur',()=>{pointer=null;wake();});
 reduce.addEventListener('change',()=>{
  if(reduce.matches){cancelAnimationFrame(frame);frame=0;last=0;particles.forEach(p=>{p.dx=p.dy=p.vx=p.vy=0;p.el.style.transform='none';p.el.getAnimations().forEach(a=>a.cancel());});}
 });
})();
