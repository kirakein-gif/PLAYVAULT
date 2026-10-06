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

  function perspectiveFloor(t){
    const g=ctx.createLinearGradient(arena.x,arena.y,arena.x,arena.y+arena.h);
    g.addColorStop(0,t.floor0);g.addColorStop(1,t.floor1);ctx.fillStyle=g;ctx.fillRect(arena.x,arena.y,arena.w,arena.h);
    const vpX=W/2,vpY=arena.y-62;
    ctx.strokeStyle=t.grid;ctx.lineWidth=1;
    for(let i=0;i<=12;i++){
      const bx=arena.x+i*arena.w/12,tx=vpX+(bx-vpX)*.56;
      ctx.beginPath();ctx.moveTo(tx,arena.y);ctx.lineTo(bx,arena.y+arena.h);ctx.stroke();
    }
    for(let i=0;i<=10;i++){
      const q=i/10,y=arena.y+arena.h*Math.pow(q,1.52),inset=(1-q)*arena.w*.075;
      ctx.beginPath();ctx.moveTo(arena.x+inset,y);ctx.lineTo(arena.x+arena.w-inset,y);ctx.stroke();
    }
    const shade=ctx.createLinearGradient(arena.x,0,arena.x+arena.w,0);
    shade.addColorStop(0,'rgba(0,0,0,.18)');shade.addColorStop(.14,'rgba(0,0,0,0)');shade.addColorStop(.86,'rgba(0,0,0,0)');shade.addColorStop(1,'rgba(0,0,0,.18)');
    ctx.fillStyle=shade;ctx.fillRect(arena.x,arena.y,arena.w,arena.h);
  }

  function archPath(cx,base,w,h){
    ctx.beginPath();ctx.moveTo(cx-w/2,base);ctx.lineTo(cx-w/2,base-h*.55);ctx.arc(cx,base-h*.55,w/2,Math.PI,0);ctx.lineTo(cx+w/2,base);ctx.closePath();
  }

  function drawCathedral(){
    const seed=roomSeed(),r=A.cur(),cx=W/2,top=arena.y-58;
    ctx.save();
    ctx.fillStyle='#302a31';ctx.fillRect(arena.x,top,arena.w,58);
    ctx.globalAlpha=.45;ctx.strokeStyle='#8c7b69';ctx.lineWidth=2;
    for(let x=arena.x+24;x<arena.x+arena.w;x+=58){ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x,arena.y);ctx.stroke()}
    for(let y=top+18;y<arena.y;y+=18){ctx.beginPath();ctx.moveTo(arena.x,y);ctx.lineTo(arena.x+arena.w,y);ctx.stroke()}
    archPath(cx,arena.y,112,66);ctx.fillStyle=r.doors.N?'#09080c':'#242027';ctx.fill();ctx.strokeStyle=r.doors.N?(r.clear?'#77e5bd':'#d8aa62'):'#635950';ctx.lineWidth=4;ctx.stroke();
    if(r.doors.N){ctx.fillStyle='rgba(255,215,139,.11)';ctx.beginPath();ctx.moveTo(cx-48,arena.y);ctx.lineTo(cx+48,arena.y);ctx.lineTo(cx+85,arena.y+116);ctx.lineTo(cx-85,arena.y+116);ctx.closePath();ctx.fill()}
    ctx.fillStyle='#51463f';for(const x of [arena.x+58,arena.x+arena.w-76]){ctx.fillRect(x,arena.y+24,18,arena.h-56);ctx.fillStyle='#766759';ctx.fillRect(x-4,arena.y+20,26,10);ctx.fillStyle='#51463f'}
    ctx.globalAlpha=.75;
    for(let i=0;i<6;i++){const side=i%2,x=side?arena.x+arena.w-92:arena.x+84,y=arena.y+92+Math.floor(i/2)*120;ctx.fillStyle='#d99e44';ctx.fillRect(x,y,3,15);ctx.fillStyle='#ffe07a';ctx.beginPath();ctx.arc(x+1.5,y-4,4+hash(seed+i)*2,0,Math.PI*2);ctx.fill()}
    ctx.restore();
  }

  function drawGraveyard(){
    const seed=roomSeed(),r=A.cur(),cx=W/2,top=arena.y-52;
    ctx.save();ctx.fillStyle='#2a333b';ctx.fillRect(arena.x,top,arena.w,52);
    ctx.fillStyle='#4b555e';for(let x=arena.x;x<arena.x+arena.w;x+=52)ctx.fillRect(x,top+30,44,22);
    const gateW=112;ctx.fillStyle=r.doors.N?'#081016':'#202830';ctx.fillRect(cx-gateW/2,top+6,gateW,46);
    ctx.strokeStyle=r.doors.N?(r.clear?'#67dec4':'#72bfc0'):'#68727a';ctx.lineWidth=3;ctx.strokeRect(cx-gateW/2,top+6,gateW,46);
    ctx.globalAlpha=.8;for(let i=-4;i<=4;i++){ctx.beginPath();ctx.moveTo(cx+i*11,top+8);ctx.lineTo(cx+i*11,arena.y);ctx.stroke()}
    ctx.globalAlpha=.38;
    for(let i=0;i<10;i++){const side=i%2,x=side?arena.x+arena.w-74-hash(seed+i)*34:arena.x+42+hash(seed+i)*34,y=arena.y+70+Math.floor(i/2)*82;ctx.fillStyle=i%3?'#59636c':'#707b84';ctx.fillRect(x,y,22,30);ctx.fillRect(x+7,y-8,8,9);if(i%3===0)ctx.fillRect(x+4,y+8,14,4)}
    ctx.restore();
  }

  function drawTower(){
    const seed=roomSeed(),r=A.cur(),cx=W/2,top=arena.y-58;
    ctx.save();ctx.fillStyle='#292a3c';ctx.fillRect(arena.x,top,arena.w,58);
    ctx.fillStyle='#11131e';ctx.beginPath();ctx.moveTo(arena.x+70,arena.y);ctx.lineTo(arena.x+105,top+10);ctx.lineTo(arena.x+160,arena.y);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(arena.x+arena.w-170,arena.y);ctx.lineTo(arena.x+arena.w-115,top+2);ctx.lineTo(arena.x+arena.w-64,arena.y);ctx.closePath();ctx.fill();
    archPath(cx,arena.y,104,62);ctx.fillStyle=r.doors.N?'#070a12':'#232436';ctx.fill();ctx.strokeStyle=r.doors.N?(r.clear?'#75d9ff':'#7997ce'):'#5d5c75';ctx.lineWidth=4;ctx.stroke();
    ctx.globalAlpha=.28;ctx.strokeStyle='#a3a0d0';ctx.lineWidth=2;
    for(let i=0;i<12;i++){let x=arena.x+30+hash(seed+i)*arena.w,y=arena.y+35+hash(seed+i+40)*arena.h*.8;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+14,y+8);ctx.lineTo(x+5,y+22);ctx.stroke()}
    ctx.globalAlpha=.25;ctx.fillStyle='#93cfff';
    for(let i=0;i<7;i++){const x=arena.x+60+hash(seed+i+70)*(arena.w-120),y=arena.y+60+hash(seed+i+90)*(arena.h-120);ctx.save();ctx.translate(x,y);ctx.rotate(hash(seed+i+100)*3);ctx.fillRect(-11,-2,22,4);ctx.restore()}
    ctx.restore();
  }

  function drawAltar(){
    const seed=roomSeed(),r=A.cur(),cx=W/2,top=arena.y-60,cy=arena.y+arena.h/2;
    ctx.save();ctx.fillStyle='#29151c';ctx.fillRect(arena.x,top,arena.w,60);
    ctx.fillStyle='#13090d';ctx.fillRect(cx-90,top+4,180,56);
    ctx.strokeStyle=r.doors.N?(r.clear?'#74deb4':'#c53c5a'):'#6a3846';ctx.lineWidth=4;ctx.strokeRect(cx-90,top+4,180,56);
    if(r.doors.N){const glow=ctx.createRadialGradient(cx,arena.y-18,3,cx,arena.y-18,78);glow.addColorStop(0,'rgba(255,70,104,.32)');glow.addColorStop(1,'rgba(255,70,104,0)');ctx.fillStyle=glow;ctx.fillRect(cx-90,top,cx?180:180,70)}
    ctx.globalAlpha=.32;ctx.strokeStyle='#c92e4d';ctx.lineWidth=2;
    for(let rad=48;rad<=150;rad+=34){ctx.beginPath();ctx.arc(cx,cy,rad,0,Math.PI*2);ctx.stroke()}
    for(let i=0;i<10;i++){let x=arena.x+hash(seed+i)*arena.w,y=arena.y+70+hash(seed+i+20)*(arena.h-110);ctx.beginPath();ctx.moveTo(x,y);for(let j=0;j<3;j++){x+=(hash(seed+i*9+j)-.5)*30;y+=10+hash(seed+i*7+j)*14;ctx.lineTo(x,y)}ctx.stroke()}
    ctx.restore();
  }

  function roomMood(r){
    if(!r)return;const cx=W/2,cy=arena.y+arena.h/2,now=performance.now();
    ctx.save();
    if(r.type==='treasure'){
      ctx.globalAlpha=.20;ctx.fillStyle='#f1b64d';for(const x of [arena.x+110,arena.x+arena.w-110]){ctx.beginPath();ctx.arc(x,arena.y+95,32,0,Math.PI*2);ctx.fill()}
    }else if(r.type==='recovery'){
      ctx.globalAlpha=.25;ctx.fillStyle='#62dfb5';for(const [x,y] of [[arena.x+95,arena.y+100],[arena.x+arena.w-95,arena.y+100],[arena.x+95,arena.y+arena.h-90],[arena.x+arena.w-95,arena.y+arena.h-90]]){ctx.beginPath();ctx.arc(x,y,9+3*Math.sin(now/260),0,Math.PI*2);ctx.fill()}
    }else if(r.type==='elite'){
      ctx.globalAlpha=.22;ctx.strokeStyle='#ff536d';ctx.lineWidth=3;for(const [x,y] of [[arena.x,arena.y],[arena.x+arena.w,arena.y],[arena.x,arena.y+arena.h],[arena.x+arena.w,arena.y+arena.h]]){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(cx,cy);ctx.stroke()}
    }else if(r.type==='boss'){
      ctx.globalAlpha=.23;ctx.fillStyle='#3b203f';ctx.fillRect(arena.x+54,arena.y+30,32,arena.h-60);ctx.fillRect(arena.x+arena.w-86,arena.y+30,32,arena.h-60);
    }
    ctx.restore();
  }

  function stageDecor(){
    const idx=(A.floor-1)%4;
    if(idx===0)drawCathedral();else if(idx===1)drawGraveyard();else if(idx===2)drawTower();else drawAltar();
    roomMood(A.cur());
  }

  function stageGimmick(r){
    if(!r||r.clear)return;const idx=(A.floor-1)%4,now=performance.now();
    ctx.save();
    if(idx===0&&A.stageZone){
      const z=A.stageZone(r,'holy'),pulse=.5+.5*Math.sin(now/330),g=ctx.createRadialGradient(z.x,z.y,8,z.x,z.y,z.r);
      g.addColorStop(0,`rgba(255,236,164,${.10+.08*pulse})`);g.addColorStop(1,'rgba(255,236,164,0)');ctx.fillStyle=g;ctx.fillRect(z.x-z.r,z.y-z.r,z.r*2,z.r*2);
      ctx.strokeStyle=`rgba(255,226,139,${.25+.20*pulse})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(z.x,z.y,z.r*.72,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(z.x,z.y,z.r*.46,0,Math.PI*2);ctx.stroke();
    }else if(idx===1&&A.stageZone){
      for(let i=0;i<2;i++){const z=A.stageZone(r,'fog',i),g=ctx.createRadialGradient(z.x,z.y,10,z.x,z.y,z.r);g.addColorStop(0,'rgba(165,208,226,.18)');g.addColorStop(.55,'rgba(105,151,174,.10)');g.addColorStop(1,'rgba(75,102,121,0)');ctx.fillStyle=g;ctx.fillRect(z.x-z.r,z.y-z.r,z.r*2,z.r*2)}
    }else if(idx===2&&(r.windWarn>0||r.windActive>0)){
      const dir=r.windDir||1,alpha=r.windActive>0?.38:.22;ctx.strokeStyle=`rgba(130,211,255,${alpha})`;ctx.lineWidth=r.windActive>0?3:2;
      for(let i=0;i<10;i++){const y=arena.y+45+i*(arena.h-90)/9,phase=(now/8+i*53)%(arena.w+120),x=dir>0?arena.x-60+phase:arena.x+arena.w+60-phase;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+dir*(r.windActive>0?90:50),y-8);ctx.stroke()}
      if(r.windWarn>0){ctx.fillStyle='rgba(255,235,155,.75)';ctx.font='800 12px sans-serif';ctx.textAlign='center';ctx.fillText(dir>0?'강풍 ▶':'◀ 강풍',W/2,arena.y+42)}
    }else if(idx===3&&r.hazards){
      for(const h of r.hazards){
        if(!h.hit){const p=Math.max(0,h.t/(h.max||1));ctx.strokeStyle=`rgba(255,72,103,${.35+.35*(1-p)})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(h.x,h.y,28+34*p,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='rgba(255,120,137,.35)';ctx.beginPath();ctx.moveTo(h.x-24,h.y);ctx.lineTo(h.x+24,h.y);ctx.moveTo(h.x,h.y-24);ctx.lineTo(h.x,h.y+24);ctx.stroke()}else{ctx.globalAlpha=Math.max(0,h.life/24)*.45;ctx.strokeStyle='#ff405f';ctx.lineWidth=4;for(let i=0;i<6;i++){const a=i*Math.PI/3;ctx.beginPath();ctx.moveTo(h.x+Math.cos(a)*8,h.y+Math.sin(a)*8);ctx.lineTo(h.x+Math.cos(a)*62,h.y+Math.sin(a)*62);ctx.stroke()}}
      }
    }
    ctx.restore();ctx.textAlign='left';
  }

  function arenaDraw(){
    const r=A.cur(),t=theme();perspectiveFloor(t);stageDecor();stageGimmick(r);
    const wc=t.wall,dc=r.clear?'#5fe0b1':t.door,gap=58,mx=W/2,my=arena.y+arena.h/2,seg=(x1,y1,x2,y2,c,w=7)=>{ctx.strokeStyle=c;ctx.lineWidth=w;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()};
    if(r.doors.N){seg(mx-gap,arena.y,mx+gap,arena.y,dc,6)}else seg(arena.x,arena.y,arena.x+arena.w,arena.y,wc,4);
    if(r.doors.S){seg(arena.x,arena.y+arena.h,mx-gap,arena.y+arena.h,wc);seg(mx+gap,arena.y+arena.h,arena.x+arena.w,arena.y+arena.h,wc);seg(mx-gap,arena.y+arena.h,mx+gap,arena.y+arena.h,dc)}else seg(arena.x,arena.y+arena.h,arena.x+arena.w,arena.y+arena.h,wc);
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
  function bossEntrance(e){
    if(e.type!=='boss'||e.intro<=0)return;
    const max=e.introMax||1,progress=1-e.intro/max,now=performance.now();
    ctx.save();
    const haze=ctx.createRadialGradient(e.x,e.y,10,e.x,e.y,105);
    haze.addColorStop(0,`rgba(90,42,118,${.18+.18*(1-progress)})`);
    haze.addColorStop(1,'rgba(20,10,30,0)');
    ctx.fillStyle=haze;ctx.fillRect(e.x-120,e.y-120,240,240);
    for(let i=0;i<10;i++){
      const phase=i*.83+now/540;
      const rise=(progress*55+i*7)%78;
      const x=e.x+Math.sin(phase*1.7)*(34+i%3*8);
      const y=e.y+36-rise;
      const r=18+(i%4)*6;
      const g=ctx.createRadialGradient(x,y,2,x,y,r);
      g.addColorStop(0,`rgba(126,86,154,${.19+.14*(1-progress)})`);
      g.addColorStop(1,'rgba(45,29,62,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
    }
    ctx.strokeStyle=`rgba(196,111,255,${.18+.34*Math.sin(now/120)**2})`;ctx.lineWidth=3;
    ctx.beginPath();ctx.arc(e.x,e.y+8,48+progress*24,0,Math.PI*2);ctx.stroke();
    ctx.restore();
  }

  function bossTelegraph(e){
    if(e.type!=='boss'||e.bossTelegraph<=0)return;
    const max=e.bossTelegraphMax||1,progress=1-e.bossTelegraph/max,pulse=.45+.35*Math.sin(performance.now()/85);
    ctx.save();
    if(e.bossPattern===0){
      const len=Math.max(W,H)*1.2,a=e.bossAim;
      ctx.translate(e.x,e.y);ctx.rotate(a);
      ctx.strokeStyle=`rgba(255,60,92,${.18+.38*progress})`;ctx.lineWidth=18-8*progress;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(len,0);ctx.stroke();
      ctx.strokeStyle=`rgba(255,190,200,${.35+.45*pulse})`;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(len,0);ctx.stroke();
    }else if(e.bossPattern===1){
      ctx.translate(e.x,e.y);
      for(let i=0;i<3;i++){const r=38+i*34+progress*20;ctx.strokeStyle=`rgba(218,86,255,${.18+.30*progress})`;ctx.lineWidth=4-i;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke()}
      for(let i=0;i<8;i++){const a=i*Math.PI/4+performance.now()/900;ctx.fillStyle=`rgba(255,92,122,${.28+.24*pulse})`;ctx.beginPath();ctx.arc(Math.cos(a)*105,Math.sin(a)*105,4,0,Math.PI*2);ctx.fill()}
    }else if(e.bossPattern===2){
      const n=2+(e.bossPhase||0),r=82;
      for(let i=0;i<n;i++){const a=i*Math.PI*2/n+.25;const x=e.x+Math.cos(a)*r,y=e.y+Math.sin(a)*r;ctx.strokeStyle=`rgba(195,101,255,${.30+.30*pulse})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,20+7*progress,0,Math.PI*2);ctx.stroke();ctx.fillStyle='rgba(118,62,170,.12)';ctx.fill()}
    }
    ctx.restore();
  }

  function enemyTelegraph(e){
    if(!e.alive||e.type==='boss'||e.aiWindup<=0)return;
    const pulse=.45+.35*Math.sin(performance.now()/90);
    ctx.save();
    if(e.type==='crawler'){
      const a=Math.atan2(e.aimY||0,e.aimX||1);ctx.translate(e.x,e.y);ctx.rotate(a);
      ctx.strokeStyle=`rgba(255,95,111,${.30+.28*pulse})`;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(72,-22);ctx.lineTo(72,22);ctx.closePath();ctx.stroke();
      ctx.fillStyle='rgba(255,74,96,.08)';ctx.fill();
    }else if(e.type==='shooter'){
      const a=e.shotAngle||0,len=430;ctx.translate(e.x,e.y);ctx.rotate(a);
      ctx.strokeStyle=`rgba(255,118,154,${.26+.36*pulse})`;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(8,0);ctx.lineTo(len,0);ctx.stroke();
      ctx.fillStyle=`rgba(231,106,255,${.28+.28*pulse})`;ctx.beginPath();ctx.arc(0,0,14+4*pulse,0,Math.PI*2);ctx.fill();
    }else if(e.type==='brute'){
      const a=Math.atan2(e.aimY||0,e.aimX||1);ctx.translate(e.x,e.y);ctx.rotate(a);
      ctx.strokeStyle=`rgba(255,164,90,${.28+.36*pulse})`;ctx.lineWidth=4;ctx.strokeRect(10,-24,185,48);
      ctx.fillStyle='rgba(255,92,67,.075)';ctx.fillRect(10,-24,185,48);
    }
    ctx.restore();
  }

  function enemy(e){
    const im=A.enemyImgs?.[e.type],now=performance.now(),boss=e.type==='boss';
    if(boss){bossEntrance(e);if(e.intro<=0)bossTelegraph(e)}else enemyTelegraph(e);
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
    if(e.stun>0&&e.alive){ctx.globalAlpha=.7;ctx.strokeStyle='#ffd27a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-size*.42,10+3*Math.sin(now/80),0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1}
    if(e.summoned&&e.alive){
      const pulse=.35+.25*Math.sin(now/150+e.phase);ctx.globalAlpha=.5;ctx.strokeStyle=`rgba(196,103,255,${pulse})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,size*.34,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;
    }
    if(e.elite&&e.alive){
      const pulse=.45+.35*Math.sin(now/180+e.phase);
      ctx.globalAlpha=.55;ctx.strokeStyle=`rgba(255,86,111,${pulse})`;ctx.lineWidth=3;
      ctx.beginPath();ctx.arc(0,0,size*.40,0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha=1;
    }
    ctx.beginPath();ctx.ellipse(0,boss?23:14,boss?42:e.r*1.15,boss?10:6,0,0,Math.PI*2);ctx.fillStyle='#0008';ctx.fill();
    if(e.faceX<0&&!boss)ctx.scale(-1,1);
    if(!e.alive&&e.deadAt)ctx.globalAlpha=Math.max(.18,1-(now-e.deadAt)/900);
    else if(boss&&e.intro>0)ctx.globalAlpha=.18+.72*(1-e.intro/(e.introMax||1));
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
  function projectile(q){
    ctx.save();ctx.translate(q.x,q.y);
    if(q.kind==='crescent'){
      ctx.rotate(Math.atan2(q.vy,q.vx));ctx.strokeStyle='#9b82ff';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,10,-1.05,1.05);ctx.stroke();
    }else if(q.kind==='relicBlade'){
      ctx.rotate(Math.atan2(q.vy,q.vx));ctx.shadowColor='#ffd36b';ctx.shadowBlur=10;ctx.strokeStyle='#ffe39a';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,9,-.9,.9);ctx.stroke();ctx.shadowBlur=0;
    }else if(q.kind==='crystal'){
      ctx.rotate(Math.atan2(q.vy,q.vx)+Math.PI/4);ctx.shadowColor=q.color;ctx.shadowBlur=12;ctx.fillStyle='#bdf6ff';ctx.fillRect(-5,-5,10,10);ctx.strokeStyle='#6fdfff';ctx.lineWidth=2;ctx.strokeRect(-5,-5,10,10);ctx.shadowBlur=0;
    }else if(q.kind==='priestBolt'){
      ctx.rotate(Math.atan2(q.vy,q.vx));ctx.shadowColor=q.color;ctx.shadowBlur=13;ctx.fillStyle='#ffd0ea';ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(-5,-4);ctx.lineTo(-2,0);ctx.lineTo(-5,4);ctx.closePath();ctx.fill();ctx.strokeStyle=q.color;ctx.lineWidth=2;ctx.stroke();ctx.shadowBlur=0;
    }else if(q.kind==='bossLance'){
      ctx.rotate(Math.atan2(q.vy,q.vx));ctx.shadowColor='#ff365f';ctx.shadowBlur=14;ctx.fillStyle='#ffb2bf';ctx.beginPath();ctx.moveTo(13,0);ctx.lineTo(-7,-5);ctx.lineTo(-3,0);ctx.lineTo(-7,5);ctx.closePath();ctx.fill();ctx.strokeStyle='#ff365f';ctx.lineWidth=2;ctx.stroke();ctx.shadowBlur=0;
    }else if(q.kind==='bossOrb'){
      ctx.shadowColor='#d858ff';ctx.shadowBlur=15;ctx.fillStyle='#6d174f';ctx.beginPath();ctx.arc(0,0,q.r+2,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#ff7ab5';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,q.r+4,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;
    }else if(q.kind==='moonFang'){
      ctx.rotate(Math.atan2(q.vy,q.vx));ctx.shadowColor='#9b7cff';ctx.shadowBlur=13;ctx.strokeStyle='#c7b7ff';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,11,-1.1,1.1);ctx.stroke();ctx.shadowBlur=0;
    }else if(q.kind==='reflected'){
      ctx.rotate(Math.atan2(q.vy,q.vx));ctx.shadowColor='#9fdcff';ctx.shadowBlur=14;ctx.strokeStyle='#d7f6ff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-8,-5);ctx.lineTo(10,0);ctx.lineTo(-8,5);ctx.closePath();ctx.stroke();ctx.shadowBlur=0;
    }else{
      ctx.fillStyle=q.color;ctx.shadowColor=q.color;ctx.shadowBlur=12;ctx.beginPath();ctx.arc(0,0,q.r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0
    }
    ctx.restore()
  }
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
  function bossbar(){
    const b=A.cur().enemies.find(e=>e.alive&&e.type==='boss');if(!b)return;
    const w=Math.min(410,W-170),x=(W-w)/2,y=A.mobile?72:28,phase=(b.bossPhase||0)+1;
    ctx.fillStyle='#05060de6';rr(x-2,y-2,w+4,22,9);ctx.fill();
    ctx.fillStyle='#2a1234';ctx.fillRect(x,y,w,16);
    ctx.fillStyle=phase===3?'#ff3f62':phase===2?'#d75ad8':'#c665e6';ctx.fillRect(x,y,w*Math.max(0,b.hp/b.max),16);
    ctx.fillStyle='#f4dcff';ctx.font='700 10px sans-serif';ctx.textAlign='center';
    ctx.fillText(`THE ABYSSAL WATCHER · PHASE ${phase} · ${b.bossAction||'추적 중'}`,W/2,y-5);
    ctx.textAlign='left'
  }
  function bossVictory(){
    const left=(A.bossClearUntil||0)-performance.now();if(left<=0)return;
    const t=Math.min(1,left/2300),fade=Math.min(1,(2300-left)/260, left/420);
    ctx.save();ctx.globalAlpha=Math.max(.15,fade);
    ctx.fillStyle='rgba(5,6,12,.36)';ctx.fillRect(arena.x,arena.y,arena.w,arena.h);
    ctx.textAlign='center';
    ctx.fillStyle='#ffe5a6';ctx.font=`900 ${A.mobile?24:28}px sans-serif`;ctx.fillText('BOSS DEFEATED',W/2,arena.y+arena.h*.46);
    ctx.fillStyle='#e9d6ff';ctx.font=`700 ${A.mobile?14:16}px sans-serif`;ctx.fillText('심연의 감시자를 물리쳤습니다',W/2,arena.y+arena.h*.46+30);
    ctx.fillStyle='rgba(255,255,255,.62)';ctx.font='600 11px sans-serif';ctx.fillText(A.floor===4&&!A.endless?'첫 순환 클리어 결과를 정리합니다':'잠시 후 다음 층으로 이동합니다',W/2,arena.y+arena.h*.46+52);
    ctx.textAlign='left';ctx.restore();
  }

  function draw(){ctx.clearRect(0,0,W,H);backdrop();if(!A.started||!A.player||!A.rooms[A.current])return;arenaDraw();roomFeature(A.cur());A.pickups.forEach(pickup);A.cur().enemies.filter(e=>e.alive||(e.deadAt&&performance.now()-e.deadAt<950)).forEach(enemy);A.projectiles.forEach(projectile);A.shockwaves.forEach(s=>{ctx.save();ctx.globalAlpha=Math.max(0,s.l/28);ctx.strokeStyle=s.color;ctx.lineWidth=5;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.stroke();ctx.restore()});A.slashes.forEach(slash);player();A.particles.forEach(p=>{ctx.save();ctx.globalAlpha=Math.max(0,p.l/22);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,3,3);ctx.restore()});minimap();bossbar();bossVictory()}
  let last=performance.now();function frame(t){const dt=Math.min(2.2,(t-last)/16.67);last=t;if(A.started&&!A.paused&&!A.dead)A.update(dt);draw();requestAnimationFrame(frame)}requestAnimationFrame(frame);
})();