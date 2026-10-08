(() => {
'use strict';
const A=window.HK_ART={images:{},loaded:{ethan:false,noah:false},tiles:{},ready:null};
const spec={ethan:{dir:'dawn-seeker',parts:4,scale:2.18},noah:{dir:'night-veil',parts:3,scale:2.24}};
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
    A.images[key]=img;A.loaded[key]=true;return true;
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
  const scale=spec[key].scale*(opts.scale||1);
  ctx.save();ctx.translate((opts.x||0)+(opts.offsetX||0),(opts.y||0)+(opts.offsetY||0));
  if((opts.face||1)<0)ctx.scale(-1,1);
  ctx.globalAlpha*=(opts.alpha==null?1:opts.alpha)*(opts.ghost?.24:1);
  if(opts.finisher)ctx.scale(1.055,1.055);
  ctx.imageSmoothingEnabled=false;
  ctx.drawImage(A.images[key],f.x,f.y,f.w,f.h,-32*scale,-48.8*scale,64*scale,52*scale);
  ctx.restore();return true;
};

function tileFor(zone,p){
  const key=zone+':'+p.wall+':'+p.accent;if(A.tiles[key])return A.tiles[key];
  const c=document.createElement('canvas'),cc=c.getContext('2d');c.width=192;c.height=128;
  cc.fillStyle=p.wall;cc.fillRect(0,0,192,128);
  cc.globalAlpha=.28;cc.strokeStyle=p.accent;cc.lineWidth=1;
  for(let y=0;y<128;y+=24){const off=(Math.floor(y/24)%2)*18;for(let x=-off;x<192;x+=48)cc.strokeRect(x,y,46,22)}
  cc.globalAlpha=.16;cc.strokeStyle='#d8c9ae';
  for(let i=0;i<8;i++){const x=(i*37+19)%188,y=(i*29+11)%120;cc.beginPath();cc.moveTo(x,y);cc.lineTo(x+7,y+10);cc.lineTo(x+3,y+18);cc.stroke()}
  cc.globalAlpha=1;A.tiles[key]=c;return c;
}

A.drawBackdrop=(ctx,r,p,W,H)=>{
  const ground=r.ground,zone=r.zone,g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,p.sky);g.addColorStop(.72,'#0a0b10');g.addColorStop(1,'#050609');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);

  ctx.save();ctx.globalAlpha=.34;ctx.fillStyle='#12151c';
  for(let x=-40;x<W+80;x+=150){ctx.fillRect(x+28,96,20,ground-96);ctx.beginPath();ctx.moveTo(x,ground);ctx.lineTo(x+38,172);ctx.lineTo(x+76,ground);ctx.closePath();ctx.fill()}
  ctx.restore();

  const tile=tileFor(zone,p);ctx.globalAlpha=.88;
  for(let x=0;x<W;x+=192)for(let y=112;y<ground;y+=128)ctx.drawImage(tile,x,y);
  ctx.globalAlpha=1;

  const winColor=zone==='chapel'?'#8a6b45':zone==='library'?'#455569':zone==='crypt'?'#33464a':zone==='boss'?'#5d3742':'#4b5060';
  for(let x=80;x<W-40;x+=210){
    ctx.fillStyle='#111218';ctx.beginPath();ctx.moveTo(x,335);ctx.lineTo(x,205);ctx.arc(x+36,205,36,Math.PI,0);ctx.lineTo(x+72,335);ctx.closePath();ctx.fill();
    ctx.globalAlpha=.42;ctx.fillStyle=winColor;ctx.fillRect(x+12,228,48,80);ctx.globalAlpha=1;
    ctx.strokeStyle='#655f5b';ctx.lineWidth=3;ctx.strokeRect(x+11,227,50,82);
    ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x+36,228);ctx.lineTo(x+36,309);ctx.moveTo(x+12,268);ctx.lineTo(x+60,268);ctx.stroke();
  }

  if(zone==='library'){
    ctx.fillStyle='#171c23';for(let x=42;x<W-40;x+=180){ctx.fillRect(x,322,110,116);ctx.fillStyle='#525c67';for(let y=336;y<425;y+=24)ctx.fillRect(x+8,y,94,3);ctx.fillStyle='#171c23'}
  }else if(zone==='chapel'){
    for(let x=65;x<W;x+=132){ctx.fillStyle='#8e7148';ctx.fillRect(x,ground-78,3,48);ctx.fillStyle='#e9c96b';ctx.beginPath();ctx.arc(x+1.5,ground-82,5,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.14;ctx.fillStyle='#f2d98b';ctx.beginPath();ctx.arc(x+1.5,ground-82,22,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}
  }else if(zone==='crypt'||zone==='boss'){
    ctx.fillStyle='#15191d';for(let x=70;x<W;x+=170){ctx.fillRect(x,ground-82,66,82);ctx.fillRect(x+21,ground-104,24,24)}
  }

  ctx.fillStyle=p.floor;ctx.fillRect(0,ground,W,H-ground);
  ctx.fillStyle='#15161a';for(let x=0;x<W;x+=64)ctx.fillRect(x,ground+18,44,3);
  ctx.globalAlpha=.22;ctx.strokeStyle='#a99e8b';for(let x=0;x<W;x+=96){ctx.beginPath();ctx.moveTo(x,ground);ctx.lineTo(x+38,H);ctx.stroke()}ctx.globalAlpha=1;
};
})();