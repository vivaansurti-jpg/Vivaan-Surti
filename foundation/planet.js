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
