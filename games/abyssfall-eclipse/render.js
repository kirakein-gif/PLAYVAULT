(() => {
  'use strict'; const A=window.AF,{ctx,W,H,arena,imgs}=A;
  function rr(x,y,w,h,r){ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,w,h,r):ctx.rect(x,y,w,h)}
  const THEMES=[
    {name:'버려진 성당',outer0:'#221a32',outer1:'#080910',floor0:'#201c2b',floor1:'#11131d',wall:'#80756d',door:'#f0bc67',accent:'#ffd17d',grid:'rgba(255,235,205,.040)'},
    {name:'침묵의 묘지',outer0:'#17263a',outer1:'#070b12',floor0:'#182332',floor1:'#0d141d',wall:'#66717a',door:'#74d7c8',accent:'#8ec8ff',grid:'rgba(190,220,255,.035)'},
    {name:'무너진 탑',outer0:'#1d2240',outer1:'#070812',floor0:'#1a1d31',floor1:'#0d0f19',wall:'#6b657e',door:'#79c7ff',accent:'#a58aff',grid:'rgba(180,180,255,.038)'},
    {name:'심연의 제단',outer0:'#31151d',outer1:'#080609',floor0:'#241218',floor1:'#10090d',wall:'#765960',door:'#e2556f',accent:'#ff536d',grid:'rgba(255,120,140,.035)'}
  ];
  const zoneIndex=()=>Math.floor((A.floor-1)/3)%THEMES.length;
  const theme=()=>THEMES[zoneIndex()];
  function hash(n){const x=Math.sin(n*12.9898+78.233)*43758.5453;return x-Math.floor(x)}
  function roomSeed(){const r=A.cur();return (r?.x||0)*97+(r?.y||0)*193+A.floor*389}

  function backdrop(){
    const t=theme(),g=ctx.createRadialGradient(W/2,H/2,70,W/2,H/2,Math.max(W,H)*.78);
    g.addColorStop(0,t.outer0);g.addColorStop(1,t.outer1);
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  }

  function sceneSlices(scene,foreground=false){
    const top=A.mobile?130:0,foot=arena.y+arena.h,edges=[0,.28,.82,1],dy=[top,arena.y,foot,H];
    ctx.imageSmoothingEnabled=true;
    for(let i=0;i<3;i++){
      const begin=foreground?Math.max(edges[i],.80):edges[i];if(begin>=edges[i+1])continue;
      const y=dy[i]+(begin-edges[i])/(edges[i+1]-edges[i])*(dy[i+1]-dy[i]);
      ctx.drawImage(scene,0,begin*scene.height,scene.width,(edges[i+1]-begin)*scene.height,0,y,W,dy[i+1]-y);
    }
    ctx.imageSmoothingEnabled=false;
  }
  let currentScene=null;
  function perspectiveFloor(t){
    currentScene=window.AF_ART?.room(zoneIndex(),A.cur(),A.isDoorOpen);
    if(currentScene){sceneSlices(currentScene);return}
    ctx.fillStyle=t.floor0;ctx.fillRect(arena.x,arena.y,arena.w,arena.h);
  }
  function foregroundWall(){if(currentScene)sceneSlices(currentScene,true)}

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
    if(r.type==='elite'){
      ctx.globalAlpha=.22;ctx.strokeStyle='#ff536d';ctx.lineWidth=3;for(const [x,y] of [[arena.x,arena.y],[arena.x+arena.w,arena.y],[arena.x,arena.y+arena.h],[arena.x+arena.w,arena.y+arena.h]]){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(cx,cy);ctx.stroke()}
    }else if(r.type==='boss'){
      ctx.globalAlpha=.23;ctx.fillStyle='#3b203f';ctx.fillRect(arena.x+54,arena.y+30,32,arena.h-60);ctx.fillRect(arena.x+arena.w-86,arena.y+30,32,arena.h-60);
    }
    ctx.restore();
  }

  function stageDecor(){
    if(!currentScene){
      const idx=zoneIndex();
      if(idx===0)drawCathedral();else if(idx===1)drawGraveyard();else if(idx===2)drawTower();else drawAltar();
    }
    roomMood(A.cur());
  }

  function stageGimmick(r){
    if(!r||r.clear)return;const idx=zoneIndex(),now=performance.now();
    ctx.save();
    if(idx===0&&A.stageZone){
      const z=A.stageZone(r,'holy'),pulse=.5+.5*Math.sin(now/330),g=ctx.createRadialGradient(z.x,z.y,8,z.x,z.y,z.r);
      g.addColorStop(0,`rgba(255,236,164,${.10+.08*pulse})`);g.addColorStop(1,'rgba(255,236,164,0)');ctx.fillStyle=g;ctx.fillRect(z.x-z.r,z.y-z.r,z.r*2,z.r*2);
      ctx.strokeStyle=`rgba(255,226,139,${.25+.20*pulse})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(z.x,z.y,z.r*.72,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(z.x,z.y,z.r*.46,0,Math.PI*2);ctx.stroke();
    }else if(idx===1&&A.stageZone){
      const count=A.fogCount?A.fogCount(r):2;
      for(let i=0;i<count;i++){
        const z=A.stageZone(r,'fog',i),density=.12+(i%3)*.025,g=ctx.createRadialGradient(z.x,z.y,8,z.x,z.y,z.r);
        g.addColorStop(0,`rgba(175,216,232,${density+.08})`);
        g.addColorStop(.52,`rgba(112,158,180,${density})`);
        g.addColorStop(1,'rgba(73,98,116,0)');
        ctx.fillStyle=g;ctx.fillRect(z.x-z.r,z.y-z.r,z.r*2,z.r*2);
        ctx.globalAlpha=.20;ctx.strokeStyle='rgba(205,230,238,.24)';ctx.lineWidth=1.5;
        for(let k=0;k<3;k++){
          const a=now/3800+i*.9+k*2.1,cx=z.x+Math.cos(a)*z.r*.18,cy=z.y+Math.sin(a)*z.r*.12;
          const mist=ctx.createRadialGradient(cx,cy,3,cx,cy,z.r*.65);
          mist.addColorStop(0,'rgba(205,225,228,.24)');mist.addColorStop(1,'rgba(110,150,167,0)');
          ctx.fillStyle=mist;ctx.beginPath();ctx.ellipse(cx,cy,z.r*.65,z.r*.34,a*.08,0,Math.PI*2);ctx.fill();
        }
        ctx.globalAlpha=1;
      }
    }else if(idx===2&&(r.windWarn>0||r.windActive>0)){
      const vx=r.windX||1,vy=r.windY||0,mag=Math.hypot(vx,vy)||1,dx=vx/mag,dy=vy/mag;
      const strength=r.windStrength||1.2,active=r.windActive>0;
      const alpha=active?Math.min(.25,.09+strength*.055):.045;
      const perpX=-dy,perpY=dx,span=Math.max(arena.w,arena.h)*1.4;
      ctx.save();ctx.beginPath();ctx.rect(arena.x,arena.y,arena.w,arena.h);ctx.clip();
      for(let i=0;i<28;i++){
        const seed=hash(i+roomSeed()),off=(seed-.5)*span,phase=((now*(active?.16+strength*.08:.07)+i*83)%(span+220))-110;
        const cx=W/2+perpX*off-dx*span/2+dx*phase,cy=arena.y+arena.h/2+perpY*off-dy*span/2+dy*phase;
        const len=(active?55:24)+seed*95,drift=Math.sin(now/700+i)*12;
        const g=ctx.createLinearGradient(cx,cy,cx+dx*len,cy+dy*len);
        g.addColorStop(0,'rgba(183,177,159,0)');g.addColorStop(.6,`rgba(183,177,159,${alpha})`);g.addColorStop(1,'rgba(211,205,185,0)');
        ctx.strokeStyle=g;ctx.lineWidth=seed>.75?4:1;
        ctx.beginPath();ctx.moveTo(cx,cy);ctx.quadraticCurveTo(cx+dx*len*.5+perpX*drift,cy+dy*len*.5+perpY*drift,cx+dx*len,cy+dy*len);ctx.stroke();
        if(active&&i%2===0){ctx.save();ctx.translate(cx+dx*len*.75,cy+dy*len*.75);ctx.rotate(now/950+i);ctx.fillStyle=`rgba(139,129,107,${.25+seed*.25})`;ctx.beginPath();ctx.moveTo(-3,-1);ctx.lineTo(2,-2);ctx.lineTo(3,1);ctx.lineTo(-1,2);ctx.closePath();ctx.fill();ctx.restore()}
      }
      ctx.restore();
    }else if(idx===3&&r.hazards){
      for(const h of r.hazards){
        const rad=h.r||68;
        if(!h.hit){
          const p=Math.max(0,h.t/(h.max||1)),rr=rad*(.55+.45*p);
          ctx.strokeStyle=`rgba(255,72,103,${.28+.42*(1-p)})`;ctx.lineWidth=2.5+Math.min(2,rad/60);
          ctx.beginPath();ctx.arc(h.x,h.y,rr,0,Math.PI*2);ctx.stroke();
          ctx.strokeStyle='rgba(255,120,137,.30)';
          ctx.beginPath();ctx.moveTo(h.x-rad*.34,h.y);ctx.lineTo(h.x+rad*.34,h.y);ctx.moveTo(h.x,h.y-rad*.34);ctx.lineTo(h.x,h.y+rad*.34);ctx.stroke();
        }else{
          ctx.globalAlpha=Math.max(0,h.life/34)*.48;ctx.strokeStyle='#ff405f';ctx.lineWidth=4;
          for(let i=0;i<7;i++){const a=i*Math.PI*2/7;ctx.beginPath();ctx.moveTo(h.x+Math.cos(a)*8,h.y+Math.sin(a)*8);ctx.lineTo(h.x+Math.cos(a)*rad,h.y+Math.sin(a)*rad);ctx.stroke()}
          ctx.globalAlpha=1;
        }
      }
    }
    ctx.restore();ctx.textAlign='left';
  }

  // Authored alpha bounds, including the taller open lids and side-wall doors.
  const PROP_FRAMES={
    northClosed:[29,5,274,298],northOpen:[334,6,273,301],
    westClosed:[678,10,216,312],westOpen:[995,10,232,312],
    eastClosed:[25,328,244,316],eastOpen:[354,328,237,316],
    southClosed:[643,348,287,276],southOpen:[952,348,288,281],
    chestClosed:[42,701,243,210],chestOpen:[349,658,240,262],
    poolFull:[642,691,279,225],poolEmpty:[963,691,268,226],
    altar:[24,958,283,243],altarBroken:[335,973,283,239],
    stairsClosed:[642,992,276,211],stairsOpen:[949,943,289,263]
  };
  function prop(name,x,foot,width,height){
    const art=window.AF_ART;if(!art?.loaded.props)return false;
    // Keep one physical basin in both states: only its water changes.
    const pool=name==='poolFull'||name==='poolEmpty';
    const [sx,sy,sw,sh]=PROP_FRAMES[pool?'poolFull':name],h=height||width*sh/sw;
    ctx.imageSmoothingEnabled=false;
    ctx.drawImage(art.images.props,sx,sy,sw,sh,x-width/2,foot-h,width,h);
    if(name==='poolEmpty'){
      ctx.save();ctx.fillStyle='rgba(7,15,19,.68)';
      ctx.beginPath();ctx.ellipse(x,foot-h+h*.33,width*.32,h*.12,0,0,Math.PI*2);ctx.fill();ctx.restore();
    }
    return true;
  }
  function door(d,r){
    const open=A.isDoorOpen(d,r),name={N:'north',W:'west',E:'east',S:'south'}[d]+(open?'Open':'Closed');
    const side=d==='W'||d==='E',x=d==='W'?arena.x+4:d==='E'?arena.x+arena.w-4:W/2;
    const foot=d==='N'?arena.y+38:d==='S'?arena.y+arena.h+24:arena.y+arena.h/2+60;
    const width=side?42:118,height=side?128:d==='N'?110:104;
    if(side&&window.AF_ART?.loaded.sideDoors){
      const sx=open?600:198,sy=d==='W'?38:793;
      ctx.imageSmoothingEnabled=false;
      ctx.drawImage(window.AF_ART.images.sideDoors,sx,sy,228,688,x-width/2,foot-height,width,height);return;
    }
    if(!side&&prop(name,x,foot,width,height))return;
    // Physical wood/stone fallback remains usable if the atlas cannot load.
    ctx.fillStyle='#59524b';ctx.fillRect(x-width/2,foot-height,width,height);
    ctx.fillStyle='#08090c';ctx.fillRect(x-width/2+8,foot-height+8,width-16,height-10);
    ctx.fillStyle='#332a24';
    const leaf=open?12:(width-18)/2;
    for(const edge of [-1,1]){
      const lx=edge<0?x-width/2+9:x+width/2-9-leaf;
      ctx.fillRect(lx,foot-height+12,leaf,height-16);
      ctx.fillStyle='#77736b';ctx.fillRect(lx,foot-height*.65,leaf,3);ctx.fillStyle='#332a24';
    }
  }
  function arenaDraw(){
    const r=A.cur(),t=theme();perspectiveFloor(t);stageDecor();stageGimmick(r);
    if(!currentScene)for(const d of ['N','W','E','S'])if(r.doors[d])door(d,r);
  }
  function roomFeature(r){
    if(!r)return;
    const cx=W/2,cy=arena.y+arena.h/2,now=performance.now();
    ctx.save();
    if(r.traceText&&A.tracePoint){
      const t=A.tracePoint(r);ctx.globalAlpha=r.traceSeen?.14:(r.clear?.3:.12);
      ctx.strokeStyle='#bbb0b8';ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(t.x-12,t.y);ctx.lineTo(t.x+12,t.y);ctx.moveTo(t.x,t.y-8);ctx.lineTo(t.x,t.y+8);ctx.stroke();ctx.globalAlpha=1;
    }
    let name,label,width=112;
    if(r.sealAltar){name='altar';label=r.sealBroken?'':r.clear?'봉인석 · 다가가서 깨뜨리기':'';width=112}
    else if(r.type==='treasure'){name=r.used?'chestOpen':'chestClosed';label=r.used?'':'보물상자';width=96}
    else if(r.type==='recovery'){name=r.used?'poolEmpty':'poolFull';label=r.used?'':'회복의 샘';width=124}
    else if(r.type==='exit'){name=r.clear?'stairsOpen':'stairsClosed';label=r.clear?'아래로 이어지는 계단':'';width=130}
    else if(r.type==='boss'&&r.bossDefeated){
      const unlocked=now>=(r.portalUnlockAt||0);name=unlocked?'stairsOpen':'stairsClosed';label=unlocked?'아래로 이어지는 계단':'바닥이 움직이고 있다';width=130;
    }
    if(name){
      const foot=cy+36;
      if(!prop(name,cx,foot,width)){
        ctx.fillStyle='#4f4b47';ctx.fillRect(cx-width/2,cy-28,width,64);
        ctx.fillStyle=name.includes('Open')?'#0b0c10':'#302b27';ctx.fillRect(cx-width/2+8,cy-20,width-16,46);
        ctx.strokeStyle='#77716a';ctx.lineWidth=2;
        if(name==='stairsOpen')for(let i=0;i<5;i++){const y=cy-12+i*9;ctx.beginPath();ctx.moveTo(cx-width/2+10,y);ctx.lineTo(cx+width/2-10,y);ctx.stroke()}
      }
      if(r.sealAltar)sealStone(cx,cy-39,r);
      if(label){ctx.font='600 11px sans-serif';ctx.textAlign='center';ctx.fillStyle='#cec5b6';ctx.fillText(label,cx,cy+55)}
    }else if(r.type==='elite'){
      ctx.globalAlpha=.3;ctx.fillStyle='#d69b9b';ctx.font='700 11px sans-serif';ctx.textAlign='center';ctx.fillText('ELITE',cx,cy-112);
    }
    ctx.restore();ctx.textAlign='left';
  }

  function sealStone(x,y,r){
    ctx.save();ctx.translate(x,y);const art=window.AF_ART,texture=art?.loaded.relics?art.images.relics:null;
    if(r.sealBroken){
      for(let i=0;i<5;i++){ctx.save();ctx.translate((i-2)*7,-5+Math.abs(i-2)*2);ctx.rotate(i*.8);if(texture)ctx.drawImage(texture,1250+i*7,80,65,115,-4,-5,8,11);else{ctx.fillStyle=i%2?'#373244':'#51495e';ctx.beginPath();ctx.moveTo(-4,1);ctx.lineTo(-2,-4);ctx.lineTo(4,-2);ctx.lineTo(3,3);ctx.closePath();ctx.fill()}ctx.restore()}
    }else{
      const pulse=.75+.15*Math.sin(performance.now()/750),g=ctx.createRadialGradient(0,-20,2,0,-20,31);
      g.addColorStop(0,`rgba(153,94,192,${.24*pulse})`);g.addColorStop(1,'rgba(153,94,192,0)');ctx.fillStyle=g;ctx.fillRect(-32,-51,64,64);
      if(texture){ctx.imageSmoothingEnabled=true;ctx.drawImage(texture,1140,0,308,352,-19,-46,38,44);ctx.restore();return}
      ctx.fillStyle='#211d2c';ctx.strokeStyle='#81718c';ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(0,-43);ctx.lineTo(13,-22);ctx.lineTo(8,-5);ctx.lineTo(-9,-5);ctx.lineTo(-14,-23);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.fillStyle='#4b3b5d';ctx.beginPath();ctx.moveTo(0,-43);ctx.lineTo(2,-18);ctx.lineTo(-9,-5);ctx.lineTo(-14,-23);ctx.closePath();ctx.fill();
      ctx.strokeStyle=`rgba(211,167,235,${pulse})`;ctx.beginPath();ctx.moveTo(0,-35);ctx.lineTo(-3,-23);ctx.lineTo(5,-19);ctx.lineTo(0,-10);ctx.stroke();
    }
    ctx.restore();
  }
  function player(){
    const p=A.player,h=p.hero,atlas=window.AF_ATLAS,now=performance.now();
    const atlasImg=atlas?.loaded?.[h.key]?atlas.images[h.key]:null;
    ctx.save();
    ctx.translate(A.snapX(p.x),A.snapY(p.y));
    if(p.faceX<0)ctx.scale(-1,1);
    if(!A.dead&&p.inv>0&&Math.floor(p.inv/4)%2===0)ctx.globalAlpha=.5;

    if(window.AF_ART?.loaded.heroes||atlasImg?.complete){
      let anim='idle',idx=0;
      if(A.dead&&p.deathAt){
        anim='death';
        idx=Math.min(3,Math.floor((now-p.deathAt)/190));
      }else if(p.hurtPose>0){
        anim='hurt';
        idx=Math.min(1,Math.floor((18-p.hurtPose)/5)%2);
      }else if(p.attackPose>0&&(!p.moving||p.specialPose>0)){
        anim='attack';
        idx=Math.min(3,Math.floor((now-(p.attackAt||now))/58));
      }else if(p.moving){
        anim='run';
        idx=Math.floor(p.step)%6;
      }else{
        anim='idle';
        idx=Math.floor(now/650)%2;
      }
      const frame=atlas?.frames[anim][idx]||atlas?.frames.idle[0]||[0,0];
      if(window.AF_ART?.loaded.heroes){
        const art=window.AF_ART;
        const f=art.hero(h.key,anim,idx);
        art.draw(ctx,f.image,f,(A.mobile?.57:.46)*f.scale,14);
      }else{
      const sx=frame[0]*atlas.cellW,sy=frame[1]*atlas.cellH;
      const base=h.drawW*(A.mobile?1.52:1.36);
      const dh=base*(atlas.cellH/atlas.cellW);
      // Fixed torso pivot and foot baseline, including attack and death frames.
      const baseline=h.key==='night'?(anim==='attack'&&idx<2?47:anim==='hurt'&&idx===1?45:anim==='death'&&idx===1?45:50):50;
      ctx.drawImage(atlasImg,sx,sy,atlas.cellW,atlas.cellH,-base*.5,-baseline*base/atlas.cellW+14,base,dh);
      }
    }else{
      const k=p.attackPose>0&&(!p.moving||p.specialPose>0)?h.attack:(p.moving?h.run:h.idle),im=imgs[k];
      if(im?.complete){
        const base=h.drawW,ratio=im.height/im.width;
        ctx.drawImage(im,-base*.5,-base*ratio*.72,base,base*ratio);
      }
    }
    ctx.restore();
  }
  function attackArt(fx){
    const t=Math.max(0,fx.l/fx.max),a=fx.a||0,progress=1-t;
    if(fx.kind==='night'&&Number.isFinite(fx.sx)&&window.AF_ART?.loaded.heroes){
      const art=window.AF_ART,f=art.hero('night','run',2);
      for(let i=0;i<4;i++){const u=(i+1)/5;ctx.save();ctx.globalAlpha=t*.10*(i+1)/4;ctx.translate(fx.sx+(fx.ex-fx.sx)*u,fx.sy+(fx.ey-fx.sy)*u);if(Math.cos(a)<0)ctx.scale(-1,1);art.draw(ctx,f.image,f,(A.mobile?.57:.46)*f.scale,14);ctx.restore()}
    }
    ctx.save();ctx.translate(fx.x,fx.y-30);ctx.rotate(a);ctx.globalAlpha=Math.sin(Math.PI*Math.min(.99,progress))*.9;
    if(fx.kind==='dawn'){
      const r=62+progress*62,g=ctx.createRadialGradient(0,0,r*.55,0,0,r+14);
      g.addColorStop(0,'rgba(187,115,40,0)');g.addColorStop(.75,'rgba(237,180,79,.30)');g.addColorStop(1,'rgba(255,239,197,0)');
      ctx.strokeStyle=g;ctx.lineWidth=18;ctx.beginPath();ctx.arc(0,0,r,-1.2+progress*.3,.95+progress*.3);ctx.stroke();
      ctx.strokeStyle='#f9e6b5';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r,-1.0+progress*.3,.85+progress*.3);ctx.stroke();
      for(let i=0;i<12;i++){const angle=-1.05+i*.17+progress*.3,rr=r+hash(i)*21;ctx.fillStyle=i%3?'#be924e':'#ffeed0';ctx.fillRect(Math.cos(angle)*rr,Math.sin(angle)*rr,1+i%2,2)}
    }else{
      const reach=Math.max(70,Math.hypot((fx.ex||fx.x)-(fx.sx||fx.x),(fx.ey||fx.y)-(fx.sy||fx.y))/2+35);
      const g=ctx.createLinearGradient(-reach,0,reach,0);g.addColorStop(0,'rgba(106,71,140,0)');g.addColorStop(.55,'rgba(137,110,194,.45)');g.addColorStop(1,'rgba(189,231,234,.90)');
      for(let i=0;i<3;i++){const bend=12+i*10;ctx.strokeStyle=g;ctx.lineWidth=i===0?9:2;ctx.beginPath();ctx.moveTo(-reach,8);ctx.bezierCurveTo(-reach*.25,-bend,reach*.45,-bend,reach,0);ctx.stroke()}
      ctx.strokeStyle='#d9f0ed';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-reach*.35,-7);ctx.quadraticCurveTo(reach*.45,-18,reach,0);ctx.stroke();
    }
    ctx.restore()
  }
  function shockwave(s){
    ctx.save();const t=Math.max(0,s.l/(s.duration||28));
    if(s.kind==='sunSeal'){
      ctx.translate(s.x,s.y+9);ctx.scale(1,.44);const radius=Math.max(12,s.r),g=ctx.createRadialGradient(0,0,radius*.7,0,0,radius+15);
      g.addColorStop(0,'rgba(203,151,72,0)');g.addColorStop(.8,`rgba(231,184,99,${t*.32})`);g.addColorStop(1,'rgba(255,223,155,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,radius+15,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle=`rgba(242,209,145,${t*.62})`;ctx.lineWidth=1.5;
      for(let i=0;i<8;i++){const a=i*Math.PI/4;ctx.beginPath();ctx.arc(0,0,radius,a+.04,a+.58);ctx.stroke();ctx.beginPath();ctx.moveTo(Math.cos(a)*radius*.84,Math.sin(a)*radius*.84);ctx.lineTo(Math.cos(a)*radius*1.04,Math.sin(a)*radius*1.04);ctx.stroke()}
    }else{ctx.globalAlpha=t;ctx.strokeStyle=s.color;ctx.lineWidth=3;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.stroke()}
    ctx.restore();
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
      ctx.strokeStyle=`rgba(225,115,112,${.36+.22*pulse})`;ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(16,0);ctx.lineTo(72,0);ctx.moveTo(61,-7);ctx.lineTo(72,0);ctx.lineTo(61,7);ctx.stroke();
      ctx.fillStyle='rgba(168,141,123,.24)';for(let i=0;i<4;i++){ctx.beginPath();ctx.ellipse(-9-i*5,(i%2?1:-1)*8,6,3,0,0,Math.PI*2);ctx.fill()}
    }else if(e.type==='shooter'){
      const a=e.shotAngle||0,len=430;ctx.translate(e.x,e.y);ctx.rotate(a);
      ctx.strokeStyle=`rgba(255,118,154,${.26+.36*pulse})`;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(8,0);ctx.lineTo(len,0);ctx.stroke();
      ctx.fillStyle=`rgba(231,106,255,${.28+.28*pulse})`;ctx.beginPath();ctx.arc(0,0,14+4*pulse,0,Math.PI*2);ctx.fill();
    }else if(e.type==='brute'){
      const a=Math.atan2(e.aimY||0,e.aimX||1);ctx.translate(e.x,e.y);ctx.rotate(a);
      const g=ctx.createLinearGradient(10,0,195,0);g.addColorStop(0,'rgba(166,77,63,.24)');g.addColorStop(1,'rgba(166,77,63,.04)');
      ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(10,-24);ctx.lineTo(195,-16);ctx.lineTo(195,16);ctx.lineTo(10,24);ctx.closePath();ctx.fill();
      ctx.strokeStyle=`rgba(216,149,105,${.36+.25*pulse})`;ctx.lineWidth=2;
      for(let i=0;i<3;i++){const x=45+i*53;ctx.beginPath();ctx.moveTo(x,-13);ctx.lineTo(x+12,0);ctx.lineTo(x,13);ctx.stroke()}
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

    ctx.save();
    ctx.translate(A.snapX(e.x),A.snapY(e.y));
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

    if(window.AF_ART?.loaded.enemies){
      const art=window.AF_ART;
      let col=!e.alive?5:e.hurtPose>0?4:e.aiWindup>0||e.bossTelegraph>0?2:e.attackPose>0?3:e.moving?1:0;
      const scale={crawler:A.mobile?.67:.58,shooter:A.mobile?.56:.48,brute:A.mobile?.74:.64,boss:A.mobile?.68:.58}[e.type];
      art.draw(ctx,'enemies',art.enemy(e.type,col),scale,boss?23:14);
    }else if(im?.complete&&im.naturalWidth){
      ctx.drawImage(im,frame*fw,0,fw,fh,-size*.5,-size*.70,size,size);
    }else{
      ctx.fillStyle=boss?'#4d2765':e.type==='shooter'?'#d6d0c9':e.type==='brute'?'#40384f':'#332b46';
      ctx.beginPath();ctx.arc(0,0,boss?34:e.r,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#ff496f';ctx.fillRect(boss?5:3,-5,boss?8:5,4);
    }
    ctx.restore();

    if(e.alive&&!boss&&(e.type!=='crawler'||e.hp<e.max)){
      const w=e.r*2.5,barY=e.y-({crawler:70,shooter:104,brute:94}[e.type]||70)*(A.mobile?1.15:1);
      ctx.fillStyle='#000b';ctx.fillRect(e.x-w/2,barY,w,5);
      ctx.fillStyle=boss?'#e04f79':e.type==='shooter'?'#ff6b78':'#ff6176';
      ctx.fillRect(e.x-w/2,barY,w*Math.max(0,e.hp/e.max),5);
    }
  }
  function projectile(q){
    const screen=A.projectileScreen(q);
    ctx.save();ctx.translate(A.snapX(screen.x),A.snapY(screen.y));ctx.rotate(screen.angle);
    const hostile=['priestBolt','bossLance','bossOrb'].includes(q.kind);
    const moon=['crescent','moonFang'].includes(q.kind);
    const body=hostile?'#50303e':moon?'#515476':q.kind==='crystal'?'#45626e':'#786950';
    const edge=hostile?'#dc8b99':moon?'#b4b4d3':q.kind==='crystal'?'#a4c9d2':'#dbccaa';
    const length=q.kind==='bossLance'?22:q.kind==='bossOrb'?17:q.kind==='moonFang'?17:14;
    const thick=q.kind==='bossOrb'?7:moon?5:3;
    ctx.globalAlpha=.25;ctx.strokeStyle=edge;ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(-length-14,0);ctx.lineTo(-length/2,0);ctx.stroke();ctx.globalAlpha=1;
    ctx.fillStyle=body;ctx.strokeStyle=edge;ctx.lineWidth=1;
    ctx.beginPath();
    if(moon){
      // A chipped crescent blade, not a luminous ring or ball.
      ctx.moveTo(length,0);ctx.lineTo(-7,-thick-5);ctx.lineTo(-2,-thick);ctx.lineTo(-5,0);ctx.lineTo(-2,thick);ctx.lineTo(-7,thick+5);
    }else{
      ctx.moveTo(length,0);ctx.lineTo(-length*.45,-thick);ctx.lineTo(-length*.85,-thick*.6);ctx.lineTo(-length*.65,0);ctx.lineTo(-length*.85,thick*.6);ctx.lineTo(-length*.45,thick);
    }
    ctx.closePath();ctx.fill();ctx.stroke();
    ctx.strokeStyle=hostile?'#f2bec0':'#e0e0d3';ctx.beginPath();ctx.moveTo(-3,-1);ctx.lineTo(length-3,0);ctx.stroke();
    if(q.kind==='bossOrb'){
      ctx.fillStyle='#946072';ctx.fillRect(-8,-9,4,2);ctx.fillRect(-12,7,3,2);
    }
    ctx.restore();
  }
  function soulShape(x,y,phase,alpha=1,size=1){
    const now=performance.now(),sway=Math.sin(now/580+phase)*3;
    ctx.save();ctx.translate(x,y);ctx.scale(size,size);ctx.globalAlpha=alpha;
    // A narrow translucent spirit with a tapering smoke tail, no rotating gem.
    ctx.fillStyle='rgba(108,152,168,.18)';ctx.beginPath();ctx.moveTo(sway,-19);
    ctx.bezierCurveTo(-9,-11,-8,3,0,6);ctx.bezierCurveTo(9,2,7,-8,sway,-19);ctx.fill();
    ctx.fillStyle='rgba(154,193,204,.64)';ctx.beginPath();ctx.moveTo(sway*.5,-13);
    ctx.bezierCurveTo(-4,-5,-4,2,0,3);ctx.bezierCurveTo(5,1,4,-4,sway*.5,-13);ctx.fill();
    ctx.fillStyle='#d8e5e2';ctx.beginPath();ctx.ellipse(0,-1,1.5,3.2,0,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  function pickup(q){
    const phase=q.phase??q.x*.017+q.y*.023,bob=Math.sin(performance.now()/620+phase)*2;
    if(q.attracted){
      const a=Math.atan2(A.player.y-q.y,A.player.x-q.x);
      for(let i=3;i>=1;i--)soulShape(q.x-Math.cos(a)*i*5,q.y-8-Math.sin(a)*i*5,phase,.10*(4-i),.6);
    }
    soulShape(q.x,q.y-8+bob,phase);
  }
  function absorbedSoul(q){
    const t=1-q.life/q.max,p=A.player,u=t*t*(3-2*t);
    const x=q.x+(p.x-q.x)*u+Math.sin(t*Math.PI*2+q.phase)*Math.sin(t*Math.PI)*8;
    const y=q.y+(p.y-34-q.y)*u;
    soulShape(x,y,q.phase,(1-t)*.8,1-t*.55);
  }
  function minimap(){
    const vals=Object.values(A.rooms),minX=Math.min(...vals.map(r=>r.x)),maxX=Math.max(...vals.map(r=>r.x)),minY=Math.min(...vals.map(r=>r.y)),maxY=Math.max(...vals.map(r=>r.y));
    const bw=A.mobile?96:136,bh=A.mobile?72:100,bx=A.mobile?(arena.x+arena.w-bw-10):(W-bw-18),by=A.mobile?(arena.y+10):15;
    const spanX=Math.max(1,maxX-minX),spanY=Math.max(1,maxY-minY),base=A.mobile?9:13,s=Math.max(4.5,Math.min(base,(bw-24)/spanX,(bh-28)/spanY)),cx=bx+bw/2,cy=by+bh/2+7;
    const colors={start:'#8b9ab9',combat:'#6f83a8',treasure:'#e8b64f',recovery:'#55d8a5',elite:'#ef637a',exit:'#9b8b73',boss:'#bd6eff'};
    ctx.save();ctx.fillStyle='rgba(7,9,19,.76)';ctx.strokeStyle='#ffffff1a';rr(bx,by,bw,bh,12);ctx.fill();ctx.stroke();
    ctx.fillStyle=A.player.hero.color;ctx.font='700 10px sans-serif';ctx.fillText('MAP',bx+10,by+14);
    for(const k in A.rooms){
      const r=A.rooms[k],adj=Object.values(A.rooms).some(v=>v.seen&&Math.abs(v.x-r.x)+Math.abs(v.y-r.y)===1);
      if(!r.seen&&!adj)continue;
      const x=cx+(r.x-(minX+maxX)/2)*s,y=cy+(r.y-(minY+maxY)/2)*s;
      ctx.fillStyle=r.seen?(r.bossDefeated?'#9b8b73':(r.type==='boss'&&!A.bossUnlocked?'#4d4359':(colors[r.type]||colors.combat))):'rgba(255,255,255,.10)';
      const dot=s<7?6:8,half=dot/2;ctx.fillRect(x-half,y-half,dot,dot);
      if(k===A.current){ctx.strokeStyle='#fff7b7';ctx.lineWidth=2;ctx.strokeRect(x-half-2,y-half-2,dot+4,dot+4)}
      if(r.seen&&(r.type==='treasure'||r.type==='recovery')&&r.used){ctx.fillStyle='rgba(5,7,12,.55)';ctx.fillRect(x-2,y-2,4,4)}
    }
    ctx.restore();
  }
  function bossbar(){
    const b=A.cur().enemies.find(e=>e.alive&&e.type==='boss');if(!b)return;
    const canvasRect=A.canvas.getBoundingClientRect?.(),hudRect=document.getElementById('hud')?.getBoundingClientRect?.();
    const mapped=canvasRect?.width>0&&hudRect?.width>0&&Number.isFinite(hudRect.right)&&Number.isFinite(hudRect.bottom);
    const hudRight=mapped?(hudRect.right-canvasRect.left)*W/canvasRect.width:370;
    const hudBottom=mapped?(hudRect.bottom-canvasRect.top)*H/canvasRect.height:130;
    const left=A.mobile?70:Math.max(24,hudRight+16),right=A.mobile?W-70:W-166;
    const w=Math.min(A.mobile?480:340,right-left),x=left+(right-left-w)/2;
    const y=A.mobile?Math.min(arena.y-32,Math.max(150,hudBottom+22)):30,phase=(b.bossPhase||0)+1;
    ctx.fillStyle='#05060de6';rr(x-2,y-2,w+4,22,9);ctx.fill();
    ctx.fillStyle='#2a1234';ctx.fillRect(x,y,w,16);
    ctx.fillStyle=phase===3?'#ff3f62':phase===2?'#d75ad8':'#c665e6';ctx.fillRect(x,y,w*Math.max(0,b.hp/b.max),16);
    ctx.fillStyle='#f4dcff';ctx.font='700 10px sans-serif';ctx.textAlign='center';
    ctx.fillText(`심연의 감시자 · ${phase}단계 · ${b.bossAction||'추적 중'}`,x+w/2,y-5,w);
    ctx.textAlign='left'
  }
  function bossVictory(){
    const left=(A.bossClearUntil||0)-performance.now();if(left<=0)return;
    const total=720,fade=Math.min(1,(total-left)/140,left/180);
    ctx.save();ctx.globalAlpha=Math.max(.15,fade);
    ctx.fillStyle='rgba(5,6,12,.32)';ctx.fillRect(arena.x,arena.y,arena.w,arena.h);
    ctx.textAlign='center';
    ctx.fillStyle='#ffe5a6';ctx.font=`900 ${A.mobile?24:28}px sans-serif`;ctx.fillText('BOSS DEFEATED',W/2,arena.y+arena.h*.45);
    ctx.fillStyle='#e9d6ff';ctx.font=`700 ${A.mobile?14:16}px sans-serif`;ctx.fillText('심연의 감시자를 물리쳤습니다',W/2,arena.y+arena.h*.45+30);
    ctx.fillStyle='rgba(255,255,255,.68)';ctx.font='600 11px sans-serif';
    ctx.fillText('바닥 아래에서 돌이 움직이는 소리가 난다',W/2,arena.y+arena.h*.45+52);
    ctx.textAlign='left';ctx.restore();
  }

  function draw(){ctx.clearRect(0,0,W,H);backdrop();if(!A.started||!A.player||!A.rooms[A.current])return;arenaDraw();roomFeature(A.cur());A.pickups.forEach(pickup);A.cur().enemies.filter(e=>e.alive||(e.deadAt&&performance.now()-e.deadAt<950)).forEach(enemy);A.shockwaves.forEach(shockwave);A.slashes.forEach(slash);player();A.projectiles.forEach(projectile);A.soulBursts.forEach(absorbedSoul);A.particles.forEach(p=>{ctx.save();ctx.globalAlpha=Math.max(0,p.l/22);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,3,3);ctx.restore()});foregroundWall();minimap();bossbar();bossVictory()}
  let last=performance.now(),lastFrameError=0;
  function frame(t){
    const dt=Math.min(2.2,(t-last)/16.67);last=t;
    try{
      if(A.started&&!A.paused&&!A.dead)A.update(dt);
      draw();
    }catch(err){
      console.error('ABYSSFALL frame recovered:',err);
      const now=performance.now();
      if(now-lastFrameError>1200){
        lastFrameError=now;
        if(A.cur?.()?.bossDefeated){A.paused=false;A.transitioning=false}
        A.toast?.('화면 오류를 복구했습니다');
      }
    }finally{
      requestAnimationFrame(frame);
    }
  }
  requestAnimationFrame(frame);
})();
