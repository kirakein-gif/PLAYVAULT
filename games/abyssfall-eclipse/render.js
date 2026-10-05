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
        idx=Math.floor(now/62)%4;
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
  function attackArt(fx){const im=imgs[`${fx.kind}_attack`];if(!im?.complete)return;const w=fx.kind==='dawn'?(A.mobile?270:250):(A.mobile?260:242),h=w*im.height/im.width,t=fx.l/fx.max;ctx.save();ctx.globalAlpha=Math.min(1,t*1.4);ctx.translate(fx.x,fx.y);if(Math.cos(fx.a)<0)ctx.scale(-1,1);ctx.drawImage(im,-w*.45,-h*.48,w,h);ctx.restore()}
  function slash(fx){if(fx.art)return attackArt(fx);const t=fx.l/fx.max;ctx.save();ctx.globalAlpha=t;ctx.strokeStyle=fx.color||A.player.hero.accent;ctx.lineWidth=5;ctx.beginPath();ctx.arc(fx.x,fx.y,fx.r,fx.a-.8,fx.a+.8);ctx.stroke();ctx.restore()}
  function enemy(e){ctx.save();ctx.translate(e.x,e.y);ctx.beginPath();ctx.ellipse(0,e.r*.65,e.r,e.r*.42,0,0,Math.PI*2);ctx.fillStyle='#0006';ctx.fill();const f=e.flash>0;if(e.type==='crawler'){ctx.fillStyle=f?'#fff':'#762e43';ctx.beginPath();ctx.moveTo(-e.r,8);ctx.quadraticCurveTo(0,-e.r*1.2,e.r,8);ctx.quadraticCurveTo(0,e.r,-e.r,8);ctx.fill();ctx.fillStyle='#ffb0bd';ctx.fillRect(-6,-3,3,3);ctx.fillRect(3,-3,3,3);ctx.strokeStyle='#d68b98';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-8,-9);ctx.lineTo(-14,-17);ctx.moveTo(8,-9);ctx.lineTo(14,-17);ctx.stroke()}else if(e.type==='shooter'){ctx.fillStyle=f?'#fff':'#294c6a';ctx.beginPath();ctx.moveTo(-e.r,10);ctx.quadraticCurveTo(0,-e.r*1.25,e.r,10);ctx.quadraticCurveTo(0,e.r*.8,-e.r,10);ctx.fill();ctx.fillStyle='#7fdcff';ctx.beginPath();ctx.arc(0,-2,5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#132135';ctx.beginPath();ctx.arc(0,-2,2,0,Math.PI*2);ctx.fill()}else if(e.type==='brute'){ctx.fillStyle=f?'#fff':'#60594c';ctx.beginPath();for(let i=0;i<6;i++){const a=i*Math.PI/3-Math.PI/6,x=Math.cos(a)*e.r,y=Math.sin(a)*e.r;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath();ctx.fill();ctx.fillStyle='#ff6a55';ctx.beginPath();ctx.arc(0,0,5,0,Math.PI*2);ctx.fill()}else{ctx.fillStyle=f?'#fff':'#4d2765';ctx.beginPath();ctx.moveTo(-34,22);ctx.quadraticCurveTo(0,-50,34,22);ctx.quadraticCurveTo(0,42,-34,22);ctx.fill();ctx.strokeStyle='#dd9dff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-18,-13);ctx.lineTo(-29,-28);ctx.moveTo(18,-13);ctx.lineTo(29,-28);ctx.stroke();ctx.fillStyle='#f6c8ff';ctx.fillRect(-12,-5,6,4);ctx.fillRect(6,-5,6,4)}ctx.restore();if(e.type!=='crawler'||e.hp<e.max){const w=e.r*2.2;ctx.fillStyle='#0009';ctx.fillRect(e.x-w/2,e.y-e.r-13,w,5);ctx.fillStyle=e.type==='boss'?'#d86fff':'#ff6176';ctx.fillRect(e.x-w/2,e.y-e.r-13,w*Math.max(0,e.hp/e.max),5)}}
  function projectile(q){ctx.save();ctx.translate(q.x,q.y);if(q.kind==='crescent'){ctx.rotate(Math.atan2(q.vy,q.vx));ctx.strokeStyle='#9b82ff';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,10,-1.05,1.05);ctx.stroke()}else{ctx.fillStyle=q.color;ctx.shadowColor=q.color;ctx.shadowBlur=12;ctx.beginPath();ctx.arc(0,0,q.r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0}ctx.restore()}
  function pickup(q){ctx.save();ctx.translate(q.x,q.y);ctx.rotate(performance.now()/600);ctx.fillStyle=A.player?.hero?.color||'#fff';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=9;ctx.fillRect(-4,-4,8,8);ctx.restore()}
  function minimap(){const vals=Object.values(A.rooms),minX=Math.min(...vals.map(r=>r.x)),maxX=Math.max(...vals.map(r=>r.x)),minY=Math.min(...vals.map(r=>r.y)),maxY=Math.max(...vals.map(r=>r.y)),bw=A.mobile?112:132,bh=A.mobile?84:96,bx=W-bw-18,by=A.mobile?54:15,s=A.mobile?11:13,cx=bx+bw/2,cy=by+bh/2+6;ctx.save();ctx.fillStyle='rgba(7,9,19,.76)';ctx.strokeStyle='#ffffff1a';rr(bx,by,bw,bh,12);ctx.fill();ctx.stroke();ctx.fillStyle=A.player.hero.color;ctx.font='700 10px sans-serif';ctx.fillText('MAP',bx+10,by+14);for(const k in A.rooms){const r=A.rooms[k],adj=Object.values(A.rooms).some(v=>v.seen&&Math.abs(v.x-r.x)+Math.abs(v.y-r.y)===1);if(!r.seen&&!adj)continue;const x=cx+(r.x-(minX+maxX)/2)*s,y=cy+(r.y-(minY+maxY)/2)*s;ctx.fillStyle=k===A.current?'#fff7b7':r.seen?(r.boss?'#c36cff':'#7388ad'):'#ffffff1a';ctx.fillRect(x-4,y-4,8,8)}ctx.restore()}
  function bossbar(){const b=A.cur().enemies.find(e=>e.alive&&e.type==='boss');if(!b)return;const w=Math.min(380,W-180),x=(W-w)/2,y=A.mobile?72:28;ctx.fillStyle='#05060dbf';rr(x-2,y-2,w+4,20,9);ctx.fill();ctx.fillStyle='#2a1234';ctx.fillRect(x,y,w,16);ctx.fillStyle='#c665e6';ctx.fillRect(x,y,w*Math.max(0,b.hp/b.max),16);ctx.fillStyle='#f4dcff';ctx.font='700 10px sans-serif';ctx.textAlign='center';ctx.fillText('RELIC WARDEN',W/2,y-5);ctx.textAlign='left'}
  function draw(){ctx.clearRect(0,0,W,H);backdrop();if(!A.started||!A.player||!A.rooms[A.current])return;arenaDraw();A.pickups.forEach(pickup);A.cur().enemies.filter(e=>e.alive).forEach(enemy);A.projectiles.forEach(projectile);A.shockwaves.forEach(s=>{ctx.save();ctx.globalAlpha=Math.max(0,s.l/28);ctx.strokeStyle=s.color;ctx.lineWidth=5;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.stroke();ctx.restore()});A.slashes.forEach(slash);player();A.particles.forEach(p=>{ctx.save();ctx.globalAlpha=Math.max(0,p.l/22);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,3,3);ctx.restore()});minimap();bossbar()}
  let last=performance.now();function frame(t){const dt=Math.min(2.2,(t-last)/16.67);last=t;if(A.started&&!A.paused&&!A.dead)A.update(dt);draw();requestAnimationFrame(frame)}requestAnimationFrame(frame);
})();