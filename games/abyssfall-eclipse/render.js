(() => {
  'use strict'; const A=window.AF,{ctx,W,H,arena,imgs}=A;
  function rr(x,y,w,h,r){ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,w,h,r):ctx.rect(x,y,w,h)}
  function backdrop(){const g=ctx.createRadialGradient(W/2,H/2,70,W/2,H/2,Math.max(W,H)*.78);g.addColorStop(0,'#242039');g.addColorStop(1,'#080912');ctx.fillStyle=g;ctx.fillRect(0,0,W,H)}
  function arenaDraw(){const r=A.cur(),g=ctx.createLinearGradient(arena.x,arena.y,arena.x+arena.w,arena.y+arena.h);g.addColorStop(0,'#171a2a');g.addColorStop(1,'#0e101c');ctx.fillStyle=g;ctx.fillRect(arena.x,arena.y,arena.w,arena.h);ctx.strokeStyle='rgba(255,255,255,.035)';ctx.lineWidth=1;for(let y=arena.y;y<arena.y+arena.h;y+=44){ctx.beginPath();ctx.moveTo(arena.x,y);ctx.lineTo(arena.x+arena.w,y);ctx.stroke()}for(let x=arena.x;x<arena.x+arena.w;x+=44){ctx.beginPath();ctx.moveTo(x,arena.y);ctx.lineTo(x,arena.y+arena.h);ctx.stroke()}const wc='#7b7270',dc=r.clear?'#5fe0b1':'#ff5971',gap=58,mx=W/2,my=arena.y+arena.h/2,seg=(x1,y1,x2,y2,c)=>{ctx.strokeStyle=c;ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()};for(const d of ['N','S']){const y=d==='N'?arena.y:arena.y+arena.h;r.doors[d]?(seg(arena.x,y,mx-gap,y,wc),seg(mx+gap,y,arena.x+arena.w,y,wc),seg(mx-gap,y,mx+gap,y,dc)):seg(arena.x,y,arena.x+arena.w,y,wc)}for(const d of ['W','E']){const x=d==='W'?arena.x:arena.x+arena.w;r.doors[d]?(seg(x,arena.y,x,my-gap,wc),seg(x,my+gap,x,arena.y+arena.h,wc),seg(x,my-gap,x,my+gap,dc)):seg(x,arena.y,x,arena.y+arena.h,wc)}}
  function player(){
    const p=A.player,h=p.hero,atlas=window.AF_ATLAS,now=performance.now();
    const atlasImg=atlas?.loaded?.[h.key]?atlas.images[h.key]:null;
    let bob=p.moving&&!A.dead?Math.sin(p.step*1.8)*2.5:Math.sin(now/420)*1.2;
    ctx.save();
    ctx.translate(p.x,p.y+bob);
    if(p.faceX<0)ctx.scale(-1,1);
    if(!A.dead&&p.inv>0&&Math.floor(p.inv/4)%2===0)ctx.globalAlpha=.5;

    if(atlasImg?.complete){
      let anim='idle',idx=0;
      if(A.dead&&p.deathAt){
        anim='death';
        idx=Math.min(3,Math.floor((now-p.deathAt)/190));
        bob=0;
      }else if(p.hurtPose>0){
        anim='hurt';
        idx=Math.min(1,Math.floor((18-p.hurtPose)/5)%2);
      }else if(p.attackPose>0){
        anim='attack';
        idx=Math.min(3,Math.floor((now-(p.attackAt||now))/58));
      }else if(p.moving){
        anim='run';
        idx=Math.floor(p.step*1.75)%6;
      }else{
        anim='idle';
        idx=Math.floor(now/220)%4;
      }
      const frame=atlas.frames[anim][idx]||atlas.frames.idle[0];
      const sx=frame[0]*atlas.cellW,sy=frame[1]*atlas.cellH;
      const base=h.drawW*(A.mobile?1.34:1.28)*(anim==='attack'?1.08:1);
      const dh=base*(atlas.cellH/atlas.cellW);
      ctx.drawImage(atlasImg,sx,sy,atlas.cellW,atlas.cellH,-base*.5,-dh*.76,base,dh);
    }else{
      const k=p.attackPose>0?h.attack:(p.moving?h.run:h.idle),im=imgs[k];
      if(im?.complete){
        const base=h.drawW*(p.attackPose>0?1.06:1),ratio=im.height/im.width;
        ctx.drawImage(im,-base*.5,-base*ratio*.72,base,base*ratio);
      }
    }
    ctx.restore();
    if(p.shield>0&&!A.dead){ctx.strokeStyle='rgba(116,226,255,.55)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,32,0,Math.PI*2);ctx.stroke()}
  }
  function attackArt(fx){
    const t=Math.max(0,fx.l/fx.max),a=fx.a||0;
    ctx.save();ctx.translate(fx.x,fx.y);ctx.rotate(a);ctx.globalAlpha=Math.min(1,t*1.35);
    if(fx.kind==='dawn'){
      const r=(1-t)*38+82;
      ctx.strokeStyle='rgba(255,218,102,.95)';ctx.lineWidth=8*t+2;ctx.beginPath();ctx.arc(0,0,r,-.95,.95);ctx.stroke();
      ctx.strokeStyle='rgba(105,225,255,.8)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,r+14,-.78,.78);ctx.stroke();
      ctx.fillStyle='rgba(255,244,180,.9)';for(let i=0;i<5;i++){const x=38+i*18,y=(i-2)*13;ctx.save();ctx.translate(x,y);ctx.rotate(Math.PI/4);ctx.fillRect(-4,-4,8,8);ctx.restore()}
    }else{
      const r=(1-t)*42+92;
      ctx.strokeStyle='rgba(95,226,255,.96)';ctx.lineWidth=9*t+3;ctx.beginPath();ctx.arc(0,0,r,-1.05,1.05);ctx.stroke();
      ctx.strokeStyle='rgba(145,109,255,.86)';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,r+15,-.88,.88);ctx.stroke();
      ctx.fillStyle='rgba(102,225,255,.85)';for(let i=0;i<5;i++){ctx.save();ctx.translate(42+i*20,(i-2)*15);ctx.rotate(Math.PI/4);ctx.fillRect(-4,-4,8,8);ctx.restore()}
    }
    ctx.restore()
  }
  function slash(fx){if(fx.art)return attackArt(fx);const t=fx.l/fx.max;ctx.save();ctx.globalAlpha=t;ctx.strokeStyle=fx.color||A.player.hero.accent;ctx.lineWidth=5;ctx.beginPath();ctx.arc(fx.x,fx.y,fx.r,fx.a-.8,fx.a+.8);ctx.stroke();ctx.restore()}
  function enemy(e){
    const im=A.enemyImgs?.[e.type],now=performance.now(),boss=e.type==='boss';
    const fw=boss?160:128,fh=fw;
    let frame=0;
    if(!e.alive&&e.deadAt)frame=boss?5:4;
    else if(e.hurtPose>0)frame=boss?4:3;
    else if(e.attackPose>0)frame=boss?((Math.floor((24-e.attackPose)/5)&1)?3:2):2;
    else if(e.moving)frame=1;

    const sizes={
      crawler:A.mobile?106:92,
      shooter:A.mobile?108:94,
      brute:A.mobile?126:108,
      boss:A.mobile?192:166
    };
    const size=sizes[e.type]||96;
    const bob=e.alive?Math.sin(now/210+e.phase)*1.6:0;

    ctx.save();
    ctx.translate(e.x,e.y+bob);
    ctx.beginPath();ctx.ellipse(0,boss?23:14,boss?42:e.r*1.15,boss?10:6,0,0,Math.PI*2);ctx.fillStyle='#0008';ctx.fill();
    if(e.faceX<0&&!boss)ctx.scale(-1,1);
    if(!e.alive&&e.deadAt)ctx.globalAlpha=Math.max(.18,1-(now-e.deadAt)/520);
    else if(e.flash>0&&Math.floor(e.flash/2)%2===0)ctx.globalAlpha=.55;

    if(im?.complete&&im.naturalWidth){
      ctx.drawImage(im,frame*fw,0,fw,fh,-size*.5,-size*.70,size,size);
    }else{
      ctx.fillStyle=boss?'#4d2765':e.type==='shooter'?'#d6d0c9':e.type==='brute'?'#40384f':'#332b46';
      ctx.beginPath();ctx.arc(0,0,boss?34:e.r,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#ff496f';ctx.fillRect(boss?5:3,-5,boss?8:5,4);
    }
    ctx.restore();

    if(e.alive&&(boss||e.type!=='crawler'||e.hp<e.max)){
      const w=boss?120:e.r*2.5,barY=e.y-(boss?78:43);
      ctx.fillStyle='#000b';ctx.fillRect(e.x-w/2,barY,w,5);
      ctx.fillStyle=boss?'#e04f79':e.type==='shooter'?'#ff6b78':'#ff6176';
      ctx.fillRect(e.x-w/2,barY,w*Math.max(0,e.hp/e.max),5);
    }
  }
  function projectile(q){ctx.save();ctx.translate(q.x,q.y);if(q.kind==='crescent'){ctx.rotate(Math.atan2(q.vy,q.vx));ctx.strokeStyle='#9b82ff';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,10,-1.05,1.05);ctx.stroke()}else{ctx.fillStyle=q.color;ctx.shadowColor=q.color;ctx.shadowBlur=12;ctx.beginPath();ctx.arc(0,0,q.r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0}ctx.restore()}
  function pickup(q){ctx.save();ctx.translate(q.x,q.y);ctx.rotate(performance.now()/600);ctx.fillStyle=A.player?.hero?.color||'#fff';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=9;ctx.fillRect(-4,-4,8,8);ctx.restore()}
  function minimap(){const vals=Object.values(A.rooms),minX=Math.min(...vals.map(r=>r.x)),maxX=Math.max(...vals.map(r=>r.x)),minY=Math.min(...vals.map(r=>r.y)),maxY=Math.max(...vals.map(r=>r.y)),bw=A.mobile?112:132,bh=A.mobile?84:96,bx=W-bw-18,by=A.mobile?54:15,s=A.mobile?11:13,cx=bx+bw/2,cy=by+bh/2+6;ctx.save();ctx.fillStyle='rgba(7,9,19,.76)';ctx.strokeStyle='#ffffff1a';rr(bx,by,bw,bh,12);ctx.fill();ctx.stroke();ctx.fillStyle=A.player.hero.color;ctx.font='700 10px sans-serif';ctx.fillText('MAP',bx+10,by+14);for(const k in A.rooms){const r=A.rooms[k],adj=Object.values(A.rooms).some(v=>v.seen&&Math.abs(v.x-r.x)+Math.abs(v.y-r.y)===1);if(!r.seen&&!adj)continue;const x=cx+(r.x-(minX+maxX)/2)*s,y=cy+(r.y-(minY+maxY)/2)*s;ctx.fillStyle=k===A.current?'#fff7b7':r.seen?(r.boss?'#c36cff':'#7388ad'):'#ffffff1a';ctx.fillRect(x-4,y-4,8,8)}ctx.restore()}
  function bossbar(){const b=A.cur().enemies.find(e=>e.alive&&e.type==='boss');if(!b)return;const w=Math.min(380,W-180),x=(W-w)/2,y=A.mobile?72:28;ctx.fillStyle='#05060dbf';rr(x-2,y-2,w+4,20,9);ctx.fill();ctx.fillStyle='#2a1234';ctx.fillRect(x,y,w,16);ctx.fillStyle='#c665e6';ctx.fillRect(x,y,w*Math.max(0,b.hp/b.max),16);ctx.fillStyle='#f4dcff';ctx.font='700 10px sans-serif';ctx.textAlign='center';ctx.fillText('THE ABYSSAL WATCHER · 심연의 감시자',W/2,y-5);ctx.textAlign='left'}
  function draw(){ctx.clearRect(0,0,W,H);backdrop();if(!A.started||!A.player||!A.rooms[A.current])return;arenaDraw();A.pickups.forEach(pickup);A.cur().enemies.filter(e=>e.alive||(e.deadAt&&performance.now()-e.deadAt<520)).forEach(enemy);A.projectiles.forEach(projectile);A.shockwaves.forEach(s=>{ctx.save();ctx.globalAlpha=Math.max(0,s.l/28);ctx.strokeStyle=s.color;ctx.lineWidth=5;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.stroke();ctx.restore()});A.slashes.forEach(slash);player();A.particles.forEach(p=>{ctx.save();ctx.globalAlpha=Math.max(0,p.l/22);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,3,3);ctx.restore()});minimap();bossbar()}
  let last=performance.now();function frame(t){const dt=Math.min(2.2,(t-last)/16.67);last=t;if(A.started&&!A.paused&&!A.dead)A.update(dt);draw();requestAnimationFrame(frame)}requestAnimationFrame(frame);
})();