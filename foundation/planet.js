// Space decoration, drawn once on load in text characters: a ringed planet and
// a small asteroid beside the intro, and a moon and a satellite beside the
// closed Work capsule.
// Decorative ASCII ringed planet beside the intro, drawn once on load.
// Light comes from the upper left; the ring is tilted so it runs low on the
// left and high on the right, seen from slightly above.
(() => {
 const W=104,H=48,A=.6;                 // characters across and down; A = cell width / height
 const R=14.5;                          // planet radius (in rows)
 const tilt=-22*Math.PI/180;            // ring angle: negative = left end lower
 const ringA=2.0*R,ringB=.58*R;         // ring radii; ringB sets how open the ring looks
 const L=(v=>{const n=Math.hypot(...v);return v.map(x=>x/n);})([-.75,-.4,.55]);
 const ramp=' .:-=+*#';
 const level=v=>v<.16?1:v<.28?2:v<.42?3:v<.56?4:v<.7?5:v<.84?6:7;
 function draw(){
  const cx=W*A/2,cy=H/2,rows=[];
  for(let r=0;r<H;r++){
   const row=[];
   for(let c=0;c<W;c++){
    const x=c*A-cx,y=r-cy;
    const dx=x/R,dy=y/R,d=dx*dx+dy*dy,inPlanet=d<1;
    // Point in the ring's own frame (rotated by the tilt).
    const qx=x*Math.cos(tilt)+y*Math.sin(tilt),qy=-x*Math.sin(tilt)+y*Math.cos(tilt);
    const e=Math.hypot(qx/ringA,qy/ringB);
    const onRing=e>.56&&e<1&&!(e>.74&&e<.8);            // two bands with a gap
    const ringInFront=onRing&&(!inPlanet||qy>0);         // the near half crosses the planet
    let v=-1,faint=false;
    if(ringInFront){
     v=(e<.74?.62:.4)*(qx<0?1:.72);
     if(qx>0&&Math.abs(qy)<R*.55&&qx<R*1.7)v*=.3;         // planet's shadow on the far side
    }else if(inPlanet){
     const nz=Math.sqrt(1-d);
     v=Math.max(0,dx*L[0]+dy*L[1]+nz*L[2])**.9*(.88+.12*Math.sin(dy*8));
     faint=v<.08;
    }
    row.push(v<0?' ':faint?'~':ramp[level(v)]);
   }
   rows.push(row.join('').replace(/\s+$/,''));
  }
  while(rows.length&&!rows[0].trim())rows.shift();
  while(rows.length&&!rows[rows.length-1].trim())rows.pop();
  return rows;
 }
 const host=document.querySelector('.intro');if(!host)return;
 // Group runs of the same tone into spans: bright, mid, dim, and the faint night side.
 const tone=ch=>ch==='#'||ch==='*'?'b':ch==='+'||ch==='='?'m':ch==='~'?'f':'';
 const html=draw().map(line=>{let out='',cur=null,buf='';
  const flush=()=>{if(!buf)return;out+=cur?`<span class="pl-${cur}">${cur==='f'?buf.replace(/~/g,'.'):buf}</span>`:buf;buf='';};
  for(const ch of line){const t=ch===' '?null:tone(ch)||null;if(t!==cur){flush();cur=t;}buf+=ch;}
  flush();return out;}).join('\n');
 const pre=document.createElement('pre');pre.className='planet';pre.setAttribute('aria-hidden','true');pre.innerHTML=html;
 host.prepend(pre);
})();

// A small lumpy asteroid in the same text style, lit from the upper left.
// Hidden on phones (see sections.css); they drift very slightly.
(() => {
 const A=.6,ramp=' .:-=+*#';
 const level=v=>v<.16?1:v<.28?2:v<.42?3:v<.56?4:v<.7?5:v<.84?6:7;
 const L=(v=>{const n=Math.hypot(...v);return v.map(x=>x/n);})([-.75,-.45,.5]);
 // Lumpy outline: radius wobbles with angle; a few craters darken the surface.
 function rock({R,lumps,craters,stretch}){
  const W=Math.ceil(R*2.6/A),H=Math.ceil(R*2.2),cx=W*A/2,cy=H/2,rows=[];
  for(let r=0;r<H;r++){let line='';
   for(let c=0;c<W;c++){
    const x=(c*A-cx)/stretch,y=r-cy,th=Math.atan2(y,x),dist=Math.hypot(x,y);
    const edge=R*(1+lumps.reduce((s,[k,a,p])=>s+a*Math.sin(k*th+p),0));
    if(dist>=edge){line+=' ';continue;}
    const dx=x/edge,dy=y/edge,nz=Math.sqrt(Math.max(0,1-dx*dx-dy*dy));
    let v=Math.max(0,dx*L[0]+dy*L[1]+nz*L[2]);
    for(const [ux,uy,cr] of craters){const d=Math.hypot(dx-ux,dy-uy);if(d<cr)v*=.45;else if(d<cr*1.3)v=Math.min(1,v*1.15);}
    line+=v<.06?'.':ramp[level(v)];
   }
   rows.push(line.replace(/\s+$/,''));
  }
  while(rows.length&&!rows[0].trim())rows.shift();
  while(rows.length&&!rows[rows.length-1].trim())rows.pop();
  return rows;
 }
 const shapes=[
  rock({R:6.5,stretch:1.25,lumps:[[2,.12,.4],[3,.1,1.7],[5,.06,.2]],craters:[[-.25,-.2,.22],[.3,.25,.18],[-.05,.45,.12]]})
 ];
 const host=document.querySelector('.intro');if(!host)return;
 const tone=ch=>ch==='#'||ch==='*'?'b':ch==='+'||ch==='='?'m':'';
 shapes.forEach((rows,i)=>{
  const html=rows.map(line=>{let out='',cur=null,buf='';
   const flush=()=>{if(!buf)return;out+=cur?`<span class="pl-${cur}">${buf}</span>`:buf;buf='';};
   for(const ch of line){const t=ch===' '?null:tone(ch)||null;if(t!==cur){flush();cur=t;}buf+=ch;}
   flush();return out;}).join('\n');
  const pre=document.createElement('pre');pre.className='asteroid asteroid-'+(i+1);pre.setAttribute('aria-hidden','true');pre.innerHTML=html;
  host.append(pre);
 });
 // Keep the asteroid level with the fourth timeline row ("Chaired …"), whatever
 // the text above it. offsetTop ignores the intro's entrance animation.
 const stone=host.querySelector('.asteroid-1'),row=host.querySelector('.timeline li:nth-child(4)');
 if(stone&&row){
  const place=()=>{stone.style.top=Math.round(row.offsetTop+row.offsetHeight/2-stone.offsetHeight/2)+'px';stone.style.bottom='auto';};
  place();addEventListener('resize',place,{passive:true});document.fonts?.ready.then(place);
 }
})();

// Two space objects in the background of the Work section, either side of the
// closed capsule: a cratered moon (left) and a satellite (right), in the same
// text characters and colours as the ringed planet. The capsule covers
// them as it opens. Hidden on phones.
(() => {
 const A=.6,ramp=' .:-=+*#';
 const level=v=>v<.16?1:v<.28?2:v<.42?3:v<.56?4:v<.7?5:v<.84?6:7;
 const unit=v=>{const n=Math.hypot(...v);return v.map(x=>x/n);};
 const L=unit([-.62,-.48,.62]);                       // light from the upper left, as on the ringed planet
 const smooth=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
 const hash=(x,y)=>{const s=Math.sin(x*127.1+y*311.7)*43758.5453;return s-Math.floor(s);};
 const noise=(x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
  const a=hash(xi,yi),b=hash(xi+1,yi),c=hash(xi,yi+1),d=hash(xi+1,yi+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;};
 const fbm=(x,y)=>noise(x,y)*.6+noise(x*2.1,y*2.1)*.3+noise(x*4.3,y*4.3)*.1;
 const light=(nx,ny,nz)=>smooth(-.12,.55,nx*L[0]+ny*L[1]+nz*L[2])*(.55+.45*nz);   // soft day/night edge, darker limbs
 let seed=11;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
 const craters=[];for(let i=0;i<12;i++){const r=i<5?.11+rnd()*.07:.06+rnd()*.05,a=rnd()*Math.PI*2,m=Math.sqrt(rnd())*.78;craters.push([Math.cos(a)*m,Math.sin(a)*m,r]);}
 function moon(nx,ny,nz){
  let v=light(nx,ny,nz)*(.8+.3*smooth(.38,.7,fbm(nx*2.2+3,ny*2.2+1)));    // darker "seas"
  for(const [cx,cy,r] of craters){const dx=nx-cx,dy=ny-cy,d=Math.hypot(dx,dy);if(d>r*1.35)continue;
   const f=d?(dx*L[0]+dy*L[1])/(d*Math.hypot(L[0],L[1])):0;
   if(d<r){const depth=smooth(r,r*.45,d);v*=1-.1*depth-.4*depth*Math.max(0,f)+.2*depth*Math.max(0,-f);}
   else{const rim=smooth(r*1.35,r,d);v*=1+.18*rim*Math.max(0,-f);}}
  return v;
 }
 function body(R,shade,squash=1){
  const W=Math.ceil(2*R/A)+2,H=Math.ceil(2*R*squash)+2,cx=W*A/2,cy=H/2,rows=[];
  for(let r=0;r<H;r++){let line='';
   for(let c=0;c<W;c++){const nx=(c*A-cx)/R,ny=(r-cy)/(R*squash),d=nx*nx+ny*ny;
    if(d>=1){line+=' ';continue;}
    const v=shade(nx,ny,Math.sqrt(1-d));line+=v<.08?'~':ramp[level(v)];}
   rows.push(line.replace(/\s+$/,''));}
  while(rows.length&&!rows[0].trim())rows.shift();
  while(rows.length&&!rows[rows.length-1].trim())rows.pop();
  return rows;
 }
 // A basic satellite: lit body with an antenna and dish, truss arms and two
 // gridded solar panels (the left one catching the light).
 const satellite=["                         .", "                         :", "                       .-=-.", "                      =*###*=", "                       :=*=:", "                         :", " ############           =*#*=           ++++++++++++", " #=#=#=#=#=#=          *#####*          +-+-+-+-+-+-", " ############==========*#####*==========++++++++++++", " #=#=#=#=#=#=          *####**          +-+-+-+-+-+-", " ############          *###***          ++++++++++++", " #=#=#=#=#=#=          =**+++=          +-+-+-+-+-+-", " ############           =+++=           ++++++++++++", "                         :.:", "                        .   ."];
 const shapes=[['work-moon',body(14,moon)],['work-satellite',satellite]];
 const stage=document.querySelector('.work-stage'),scene=stage&&stage.querySelector('.work-scene');if(!scene)return;
 const tone=ch=>ch==='#'||ch==='*'?'b':ch==='+'||ch==='='?'m':ch==='~'?'f':'';
 shapes.forEach(([name,rows])=>{
  const html=rows.map(line=>{let out='',cur=null,buf='';
   const flush=()=>{if(!buf)return;out+=cur?`<span class="pl-${cur}">${cur==='f'?buf.replace(/~/g,'.'):buf}</span>`:buf;buf='';};
   for(const ch of line){const t=ch===' '?null:tone(ch)||null;if(t!==cur){flush();cur=t;}buf+=ch;}
   flush();return out;}).join('\n');
  const pre=document.createElement('pre');pre.className='work-deco '+name;pre.setAttribute('aria-hidden','true');pre.innerHTML=html;
  stage.insertBefore(pre,scene);                    // painted before (behind) the capsule
 });
})();
