(() => {
  'use strict'; const A=window.AF,{ctx,W,H,arena,imgs}=A;
  function rr(x,y,w,h,r){ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,w,h,r):ctx.rect(x,y,w,h)}
  const THEMES=[
    {name:'버려진 성당',outer0:'#221a32',outer1:'#080910',floor0:'#201c2b',floor1:'#11131d',wall:'#80756d',door:'#f0bc67',accent:'#ffd17d',grid:'rgba(255,235,205,.040)'},
    {name:'침묵의 묘지',outer0:'#17263a',outer1:'#070b12',floor0:'#182332',floor1:'#0d141d',wall:'#66717a',door:'#74d7c8',accent:'#8ec8ff',grid:'rgba(190,220,255,.035)'},
    {name:'무너진 탑',outer0:'#1d2240',outer1:'#070812',floor0:'#1a1d31',floor1:'#0d0f19',wall:'#6b657e',door:'#79c7ff',accent:'#a58aff',grid:'rgba(180,180,255,.038)'},
    {name:'심연의 제단',outer0:'#31151d',outer1:'#080609',floor0:'#241218',floor1:'#10090d',wall:'#765960',door:'#e2556f',accent:'#ff536d',grid:'rgba(255,120,140,.035)'}
  ];
  const theme=()=>THEMES[(A.floor-1)%THEMES.length];
  function hash(n){const x=Math.sin(n*12.9898+78.233)*43758.5453;return x-Math.floor(x)}
  function roomSeed(){const r=A.cur();return (r?.x||0)*97+(r?.y||0)*193+A.floor*389}

  function backdrop(){
    const t=theme(),g=ctx.createRadialGradient(W/2,H/2,70,W/2,H/2,Math.max(W,H)*.78);
    g.addColorStop(0,t.outer0);g.addColorStop(1,t.outer1);
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  }

  function drawCathedral(){
    const seed=roomSeed(),cx=W/2;
    ctx.save();
    ctx.globalAlpha=.26;
    ctx.fillStyle='#c99a52';
    for(let i=0;i<6;i++){const x=arena.x+65+i*(arena.w-130)/5;ctx.fillRect(x,arena.y+18,5,arena.h-36)}
    ctx.globalAlpha=.20;ctx.fillStyle='#ffe3a5';
    ctx.beginPath();ctx.ellipse(cx,arena.y+72,70,118,0,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=.42;ctx.strokeStyle='#f4d394';ctx.lineWidth=3;
    ctx.beginPath();ctx.arc(cx,arena.y+70,42,Math.PI,0);ctx.lineTo(cx+42,arena.y+132);ctx.lineTo(cx-42,arena.y+132);ctx.closePath();ctx.stroke();
    for(let i=0;i<8;i++){const x=arena.x+38+(i%4)*(arena.w-76)/3,y=i<4?arena.y+42:arena.y+arena.h-48;ctx.fillStyle='#f1bd55';ctx.globalAlpha=.55+.2*hash(seed+i);ctx.fillRect(x,y,3,12)}
    ctx.restore();
  }

  function drawGraveyard(){
    const seed=roomSeed();
    ctx.save();ctx.globalAlpha=.34;
    for(let i=0;i<12;i++){
      const side=i%2,x=side?arena.x+arena.w-52:arena.x+24+(i%3)*18,y=arena.y+44+Math.floor(i/2)*68;
      ctx.fillStyle=i%3===0?'#727d8a':'#59636f';
      ctx.fillRect(x,y,20,28);ctx.fillRect(x+7,y-8,6,10);
      if(i%3===0){ctx.fillRect(x+4,y+8,12,4)}
    }
    ctx.globalAlpha=.12;ctx.fillStyle='#a8d4ff';
    ctx.beginPath();ctx.ellipse(W*.62,arena.y+arena.h*.44,180,95,-.25,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=.20;ctx.strokeStyle='#92a9bf';ctx.lineWidth=2;
    for(let i=0;i<9;i++){const x=arena.x+30+hash(seed+i)*arena.w,y=arena.y+40+hash(seed+i+30)*arena.h;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+12,y-6);ctx.lineTo(x+20,y+5);ctx.stroke()}
    ctx.restore();
  }

  function drawTower(){
    const seed=roomSeed();
    ctx.save();ctx.globalAlpha=.22;ctx.strokeStyle='#8b88b4';ctx.lineWidth=3;
    for(let i=0;i<12;i++){const x=arena.x+hash(seed+i)*arena.w,y=arena.y+hash(seed+i+50)*arena.h;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+18,y+10);ctx.lineTo(x+7,y+24);ctx.stroke()}
    ctx.globalAlpha=.16;ctx.fillStyle='#89caff';
    for(let i=0;i<7;i++){const x=arena.x+50+hash(seed+i+80)*(arena.w-100),y=arena.y+50+hash(seed+i+90)*(arena.h-100);ctx.save();ctx.translate(x,y);ctx.rotate(hash(seed+i+120)*Math.PI);ctx.fillRect(-12,-3,24,6);ctx.restore()}
    ctx.globalAlpha=.18;ctx.strokeStyle='#9ac5ff';ctx.lineWidth=2;
    for(let i=0;i<5;i++){const y=arena.y+90+i*88;ctx.beginPath();ctx.moveTo(arena.x+70,y);ctx.quadraticCurveTo(W/2,y-35,arena.x+arena.w-70,y);ctx.stroke()}
    ctx.restore();
  }

  function drawAltar(){
    const seed=roomSeed(),cx=W/2,cy=arena.y+arena.h/2;
    ctx.save();
    ctx.globalAlpha=.30;ctx.strokeStyle='#b92b49';ctx.lineWidth=3;
    for(let r=42;r<=165;r+=38){ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke()}
    for(let i=0;i<8;i++){const a=i*Math.PI/4;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*30,cy+Math.sin(a)*30);ctx.lineTo(cx+Math.cos(a)*180,cy+Math.sin(a)*180);ctx.stroke()}
    ctx.globalAlpha=.24;ctx.strokeStyle='#ff496b';ctx.lineWidth=2;
    for(let i=0;i<14;i++){let x=arena.x+hash(seed+i)*arena.w,y=arena.y+hash(seed+i+20)*arena.h;ctx.beginPath();ctx.moveTo(x,y);for(let j=0;j<3;j++){x+=(hash(seed+i*9+j)-.5)*34;y+=12+hash(seed+i*7+j)*16;ctx.lineTo(x,y)}ctx.stroke()}
    ctx.globalAlpha=.18;ctx.fillStyle='#ff304f';ctx.beginPath();ctx.arc(W*.73,arena.y+88,74,0,Math.PI*2);ctx.fill();ctx.fillStyle='#08070b';ctx.beginPath();ctx.arc(W*.75,arena.y+78,62,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }

  function stageDecor(){
    const idx=(A.floor-1)%4;
    if(idx===0)drawCathedral();else if(idx===1)drawGraveyard();else if(idx===2)drawTower();else drawAltar();
  }

  function arenaDraw(){
    const r=A.cur(),t=theme(),g=ctx.createLinearGradient(arena.x,arena.y,arena.x+arena.w,arena.y+arena.h);
    g.addColorStop(0,t.floor0);g.addColorStop(1,t.floor1);ctx.fillStyle=g;ctx.fillRect(arena.x,arena.y,arena.w,arena.h);

    ctx.strokeStyle=t.grid;ctx.lineWidth=1;
    const tile=(A.floor-1)%4===1?52:44;
    for(let y=arena.y;y<arena.y+arena.h;y+=tile){ctx.beginPath();ctx.moveTo(arena.x,y);ctx.lineTo(arena.x+arena.w,y);ctx.stroke()}
    for(let x=arena.x;x<arena.x+arena.w;x+=tile){ctx.beginPath();ctx.moveTo(x,arena.y);ctx.lineTo(x,arena.y+arena.h);ctx.stroke()}
    stageDecor();

    const wc=t.wall,dc=r.clear?'#5fe0b1':t.door,gap=58,mx=W/2,my=arena.y+arena.h/2,seg=(x1,y1,x2,y2,c)=>{ctx.strokeStyle=c;ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()};
    for(const d of ['N','S']){const y=d==='N'?arena.y:arena.y+arena.h;r.doors[d]?(seg(arena.x,y,mx-gap,y,wc),seg(mx+gap,y,arena.x+arena.w,y,wc),seg(mx-gap,y,mx+gap,y,dc)):seg(arena.x,y,arena.x+arena.w,y,wc)}
    for(const d of ['W','E']){const x=d==='W'?arena.x:arena.x+arena.w;r.doors[d]?(seg(x,arena.y,x,my-gap,wc),seg(x,my+gap,x,arena.y+arena.h,wc),seg(x,my-gap,x,my+gap,dc)):seg(x,arena.y,x,arena.y+arena.h,wc)}
  }
  function roomFeature(r){
    if(!r)return;
    const cx=W/2,cy=arena.y+arena.h/2,now=performance.now();
    ctx.save();

    if(r.type==='treasure'){
      const pulse=.5+.5*Math.sin(now/280);
      ctx.globalAlpha=r.used?.38:.68;
      const glow=ctx.createRadialGradient(cx,cy,5,cx,cy,72);
      glow.addColorStop(0,`rgba(255,211,91,${.24+.12*pulse})`);glow.addColorStop(1,'rgba(255,211,91,0)');
      ctx.fillStyle=glow;ctx.fillRect(cx-80,cy-80,160,160);
      ctx.fillStyle=r.used?'#5b5142':'#b97927';ctx.strokeStyle=r.used?'#887964':'#ffd36b';ctx.lineWidth=3;
      ctx.fillRect(cx-28,cy-12,56,30);ctx.strokeRect(cx-28,cy-12,56,30);
      ctx.fillStyle=r.used?'#40392f':'#80501c';ctx.fillRect(cx-28,cy-23,56,13);ctx.strokeRect(cx-28,cy-23,56,13);
      ctx.fillStyle='#ffe5a0';ctx.fillRect(cx-4,cy-7,8,10);
      if(!r.used){ctx.fillStyle='#ffe7a2';ctx.font='700 11px sans-serif';ctx.textAlign='center';ctx.fillText('보물상자',cx,cy-40)}
    }else if(r.type==='recovery'){
      const pulse=.5+.5*Math.sin(now/330);
      ctx.globalAlpha=r.used?.28:.72;
      const glow=ctx.createRadialGradient(cx,cy,5,cx,cy,78);
      glow.addColorStop(0,`rgba(93,233,183,${.22+.13*pulse})`);glow.addColorStop(1,'rgba(93,233,183,0)');
      ctx.fillStyle=glow;ctx.fillRect(cx-85,cy-85,170,170);
      ctx.strokeStyle=r.used?'#52645e':'#70e6ba';ctx.lineWidth=3;
      ctx.beginPath();ctx.ellipse(cx,cy+12,40,18,0,0,Math.PI*2);ctx.stroke();
      ctx.beginPath();ctx.moveTo(cx,cy-40);ctx.lineTo(cx+16,cy-2);ctx.lineTo(cx,cy+10);ctx.lineTo(cx-16,cy-2);ctx.closePath();ctx.stroke();
      ctx.fillStyle=r.used?'#53615d':'#8ff3d0';ctx.globalAlpha=r.used?.25:.55+.2*pulse;ctx.fill();
      if(!r.used){ctx.globalAlpha=.9;ctx.fillStyle='#aef6dc';ctx.font='700 11px sans-serif';ctx.textAlign='center';ctx.fillText('회복의 샘',cx,cy-54)}
    }else if(r.type==='elite'){
      ctx.globalAlpha=.18;ctx.strokeStyle='#ff5f79';ctx.lineWidth=3;
      for(let k=0;k<2;k++){ctx.save();ctx.translate(cx,cy);ctx.rotate(now/2200*(k?1:-1));ctx.beginPath();for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2,x=Math.cos(a)*(72+k*25),y=Math.sin(a)*(72+k*25);i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath();ctx.stroke();ctx.restore()}
      ctx.globalAlpha=.65;ctx.fillStyle='#ff8091';ctx.font='800 11px sans-serif';ctx.textAlign='center';ctx.fillText('ELITE',cx,cy-112);
    }else if(r.type==='boss'){
      ctx.globalAlpha=.16;ctx.strokeStyle='#c96dff';ctx.lineWidth=3;
      ctx.beginPath();ctx.arc(cx,cy,105,0,Math.PI*2);ctx.stroke();
      ctx.beginPath();ctx.arc(cx,cy,72,0,Math.PI*2);ctx.stroke();
    }

    ctx.restore();ctx.textAlign='left';
  }

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
    if(e.elite&&e.alive){
      const pulse=.45+.35*Math.sin(now/180+e.phase);
      ctx.globalAlpha=.55;ctx.strokeStyle=`rgba(255,86,111,${pulse})`;ctx.lineWidth=3;
      ctx.beginPath();ctx.arc(0,0,size*.40,0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha=1;
    }
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
  function minimap(){
    const vals=Object.values(A.rooms),minX=Math.min(...vals.map(r=>r.x)),maxX=Math.max(...vals.map(r=>r.x)),minY=Math.min(...vals.map(r=>r.y)),maxY=Math.max(...vals.map(r=>r.y));
    const bw=A.mobile?92:132,bh=A.mobile?68:96,bx=A.mobile?(arena.x+arena.w-bw-10):(W-bw-18),by=A.mobile?(arena.y+10):15,s=A.mobile?9:13,cx=bx+bw/2,cy=by+bh/2+6;
    const colors={start:'#8b9ab9',combat:'#6f83a8',treasure:'#e8b64f',recovery:'#55d8a5',elite:'#ef637a',boss:'#bd6eff'};
    ctx.save();ctx.fillStyle='rgba(7,9,19,.76)';ctx.strokeStyle='#ffffff1a';rr(bx,by,bw,bh,12);ctx.fill();ctx.stroke();
    ctx.fillStyle=A.player.hero.color;ctx.font='700 10px sans-serif';ctx.fillText('MAP',bx+10,by+14);
    for(const k in A.rooms){
      const r=A.rooms[k],adj=Object.values(A.rooms).some(v=>v.seen&&Math.abs(v.x-r.x)+Math.abs(v.y-r.y)===1);
      if(!r.seen&&!adj)continue;
      const x=cx+(r.x-(minX+maxX)/2)*s,y=cy+(r.y-(minY+maxY)/2)*s;
      ctx.fillStyle=r.seen?(colors[r.type]||colors.combat):'rgba(255,255,255,.10)';
      ctx.fillRect(x-4,y-4,8,8);
      if(k===A.current){ctx.strokeStyle='#fff7b7';ctx.lineWidth=2;ctx.strokeRect(x-6,y-6,12,12)}
      if(r.seen&&(r.type==='treasure'||r.type==='recovery')&&r.used){ctx.fillStyle='rgba(5,7,12,.55)';ctx.fillRect(x-2,y-2,4,4)}
    }
    ctx.restore();
  }
  function bossbar(){const b=A.cur().enemies.find(e=>e.alive&&e.type==='boss');if(!b)return;const w=Math.min(380,W-180),x=(W-w)/2,y=A.mobile?72:28;ctx.fillStyle='#05060dbf';rr(x-2,y-2,w+4,20,9);ctx.fill();ctx.fillStyle='#2a1234';ctx.fillRect(x,y,w,16);ctx.fillStyle='#c665e6';ctx.fillRect(x,y,w*Math.max(0,b.hp/b.max),16);ctx.fillStyle='#f4dcff';ctx.font='700 10px sans-serif';ctx.textAlign='center';ctx.fillText('THE ABYSSAL WATCHER · 심연의 감시자',W/2,y-5);ctx.textAlign='left'}
  function draw(){ctx.clearRect(0,0,W,H);backdrop();if(!A.started||!A.player||!A.rooms[A.current])return;arenaDraw();roomFeature(A.cur());A.pickups.forEach(pickup);A.cur().enemies.filter(e=>e.alive||(e.deadAt&&performance.now()-e.deadAt<520)).forEach(enemy);A.projectiles.forEach(projectile);A.shockwaves.forEach(s=>{ctx.save();ctx.globalAlpha=Math.max(0,s.l/28);ctx.strokeStyle=s.color;ctx.lineWidth=5;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.stroke();ctx.restore()});A.slashes.forEach(slash);player();A.particles.forEach(p=>{ctx.save();ctx.globalAlpha=Math.max(0,p.l/22);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,3,3);ctx.restore()});minimap();bossbar()}
  let last=performance.now();function frame(t){const dt=Math.min(2.2,(t-last)/16.67);last=t;if(A.started&&!A.paused&&!A.dead)A.update(dt);draw();requestAnimationFrame(frame)}requestAnimationFrame(frame);
})();