(() => {
'use strict';
const A=window.HK_ART={images:{},outlines:{},loaded:{ethan:false,noah:false},ready:null};
const spec={ethan:{dir:'dawn-seeker',parts:4},noah:{dir:'night-veil',parts:3}};
const rows={idle:0,run:1,attack:2,hurt:3,death:4},counts={idle:4,run:6,attack:4,hurt:2,death:4};

async function loadHero(key){
  try{
    const cfg=spec[key],pieces=[];
    for(let i=0;i<cfg.parts;i++){
      const res=await fetch('../../assets/characters/'+cfg.dir+'/atlas/'+i+'.b64?v=8',{cache:'force-cache'});
      if(!res.ok)throw new Error(key+' atlas '+i+': '+res.status);
      pieces.push((await res.text()).trim());
    }
    const img=new Image();
    await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error(key+' atlas decode failed'));img.src='data:image/webp;base64,'+pieces.join('')});
    // Keep a solid copy of the atlas for a small, pixel-crisp separation outline.
    // It is generated from the same frames, so the animation data never changes.
    const outline=document.createElement('canvas');outline.width=img.naturalWidth;outline.height=img.naturalHeight;
    const oc=outline.getContext('2d');oc.imageSmoothingEnabled=false;oc.drawImage(img,0,0);
    oc.globalCompositeOperation='source-in';oc.fillStyle='#07090e';oc.fillRect(0,0,outline.width,outline.height);
    A.images[key]=img;A.outlines[key]=outline;A.loaded[key]=true;return true;
  }catch(err){console.warn('[HOLLOW KEEP] hero atlas fallback',key,err);A.loaded[key]=false;return false}
}
A.ready=Promise.all([loadHero('ethan'),loadHero('noah')]);
A.has=key=>!!(A.loaded[key]&&A.images[key]);

A.frame=(key,anim,index,combo=0)=>{
  if(rows[anim]===undefined)anim='idle';
  const count=counts[anim]||4,safe=((index%count)+count)%count;
  let col=safe;
  if(anim==='attack'&&key==='noah'&&combo===2)col=[3,2,1,0][safe];
  return{x:col*64,y:rows[anim]*52,w:64,h:52};
};

A.drawHero=(ctx,key,opts={})=>{
  if(!A.has(key))return false;
  const f=A.frame(key,opts.anim||'idle',opts.frame||0,opts.combo||0);
  // The source cells are 64×52. A fixed 2× draw avoids WebP atlas shimmer
  // from fractional 2.18×/2.24× scaling and keeps both heroes on one foot line.
  const scale=2,dw=128,dh=104,dx=-64,dy=-96;
  const x=Math.round((opts.x||0)+(opts.offsetX||0)),y=Math.round((opts.y||0)+(opts.offsetY||0));
  ctx.save();ctx.translate(x,y);
  if((opts.face||1)<0)ctx.scale(-1,1);
  ctx.globalAlpha*=(opts.alpha==null?1:opts.alpha)*(opts.ghost?.24:1);
  ctx.imageSmoothingEnabled=false;
  // Two game pixels make a clean one-source-pixel outline without blur.
  for(const [ox,oy] of [[-2,0],[2,0],[0,-2],[0,2]])ctx.drawImage(A.outlines[key],f.x,f.y,f.w,f.h,dx+ox,dy+oy,dw,dh);
  ctx.drawImage(A.images[key],f.x,f.y,f.w,f.h,dx,dy,dw,dh);
  ctx.restore();return true;
};

A.drawBackdrop=(ctx,r,p,W,H)=>{
  const ground=r.ground,zone=r.zone,g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,p.sky);g.addColorStop(.72,'#0a0b10');g.addColorStop(1,'#050609');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);

  // Large architectural planes read cleanly on a small portrait screen.
  // The previous tiled masonry and hairline scratches produced visual noise.
  ctx.fillStyle=p.wall;ctx.fillRect(0,96,W,ground-96);
  ctx.fillStyle='#101218';ctx.fillRect(0,96,W,10);
  for(let x=-70;x<W+120;x+=240){
    ctx.fillStyle='#1a1b22';ctx.fillRect(x+38,88,38,ground-88);
    ctx.fillStyle=p.accent;ctx.globalAlpha=.25;ctx.fillRect(x+73,96,3,ground-96);
    ctx.globalAlpha=1;ctx.fillStyle='#11131a';ctx.fillRect(x+27,88,60,10);
  }

  const winColor=zone==='chapel'?'#8a6b45':zone==='library'?'#455569':zone==='crypt'?'#33464a':zone==='boss'?'#5d3742':'#4b5060';
  for(let x=112;x<W-40;x+=240){
    ctx.fillStyle='#0d0f15';ctx.fillRect(x,206,72,130);ctx.beginPath();ctx.arc(x+36,206,36,Math.PI,0);ctx.fill();
    ctx.globalAlpha=.52;ctx.fillStyle=winColor;ctx.fillRect(x+12,228,48,82);ctx.globalAlpha=1;
    ctx.strokeStyle='#71695f';ctx.lineWidth=3;ctx.strokeRect(x+11,227,50,84);
    ctx.beginPath();ctx.moveTo(x+36,228);ctx.lineTo(x+36,311);ctx.moveTo(x+12,269);ctx.lineTo(x+60,269);ctx.stroke();
  }

  if(zone==='library'){
    ctx.fillStyle='#171c23';for(let x=42;x<W-40;x+=180){ctx.fillRect(x,322,110,116);ctx.fillStyle='#525c67';for(let y=336;y<425;y+=24)ctx.fillRect(x+8,y,94,3);ctx.fillStyle='#171c23'}
  }else if(zone==='chapel'){
    for(let x=65;x<W;x+=132){ctx.fillStyle='#8e7148';ctx.fillRect(x,ground-78,3,48);ctx.fillStyle='#e9c96b';ctx.beginPath();ctx.arc(x+1.5,ground-82,5,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.14;ctx.fillStyle='#f2d98b';ctx.beginPath();ctx.arc(x+1.5,ground-82,22,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}
  }else if(zone==='crypt'||zone==='boss'){
    ctx.fillStyle='#15191d';for(let x=70;x<W;x+=170){ctx.fillRect(x,ground-82,66,82);ctx.fillRect(x+21,ground-104,24,24)}
  }

  ctx.fillStyle=p.floor;ctx.fillRect(0,ground,W,H-ground);
  ctx.fillStyle='#17181d';ctx.fillRect(0,ground+19,W,5);
  ctx.globalAlpha=.22;ctx.strokeStyle='#a99e8b';ctx.lineWidth=2;
  for(let x=0;x<W;x+=160){ctx.beginPath();ctx.moveTo(x,ground);ctx.lineTo(x+44,H);ctx.stroke()}
  ctx.globalAlpha=1;
};
})();
