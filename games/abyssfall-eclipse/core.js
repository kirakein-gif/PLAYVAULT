(() => {
  'use strict';
  const AF = window.AF = {};
  const $ = id => document.getElementById(id);
  const canvas = $('game'), ctx = canvas.getContext('2d');
  const mobile = matchMedia('(max-width:700px), (pointer:coarse)').matches && innerHeight > innerWidth;
  const W = mobile ? 720 : 960, H = mobile ? 900 : 640;
  canvas.width=W; canvas.height=H; ctx.imageSmoothingEnabled=false;
  const arena = mobile ? {x:36,y:150,w:W-72,h:H-205} : {x:42,y:76,w:876,h:520};
  Object.assign(AF,{canvas,ctx,W,H,mobile,arena});

  const ui=AF.ui={start:$('start'),startBtn:$('startBtn'),levelUp:$('levelUp'),upgradeCards:$('upgradeCards'),gameOver:$('gameOver'),retryBtn:$('retryBtn'),heroName:$('heroName'),floorText:$('floorText'),roomText:$('roomText'),killText:$('killText'),hpText:$('hpText'),levelText:$('levelText'),enemyText:$('enemyText'),hpFill:$('hpFill'),xpFill:$('xpFill'),basicName:$('basicName'),basicIcon:$('basicIcon'),specialName:$('specialName'),specialIcon:$('specialIcon'),specialCdText:$('specialCdText'),specialBtn:$('specialBtn'),specialBtnIcon:$('specialBtnIcon'),resultText:$('resultText'),toast:$('toast')};
  const SPR={dawn_idle:'assets/heroes/dawn_idle.webp',dawn_run:'assets/heroes/dawn_run.webp',dawn_attack:'assets/heroes/dawn_attack.webp',night_idle:'assets/heroes/night_idle.webp',night_run:'assets/heroes/night_run.webp',night_attack:'assets/heroes/night_attack.webp'};
  const imgs=AF.imgs={}; Object.entries(SPR).forEach(([k,s])=>{const im=new Image();im.src=s;imgs[k]=im});
  const ENEMY_SPR={
    crawler:'../../assets/enemies/abyss-grunt.webp?v=1',
    shooter:'../../assets/enemies/fallen-priest.webp?v=1',
    brute:'../../assets/enemies/shadow-beast.webp?v=1',
    boss:'../../assets/enemies/abyss-watcher.webp?v=1'
  };
  const enemyImgs=AF.enemyImgs={}; Object.entries(ENEMY_SPR).forEach(([k,src])=>{const im=new Image();im.src=src;enemyImgs[k]=im});
  $('dawnPortrait').src=SPR.dawn_idle; $('nightPortrait').src=SPR.night_idle;

  AF.heroes={
    dawn:{key:'dawn',name:'Dawn Seeker',ko:'여명의 추적자',color:'#ffd46f',accent:'#66d9ff',maxHp:120,speed:3.15,basicName:'추적 룬탄',basicIcon:'✦',rate:34,damage:17,proj:8.1,specialName:'태양낙인',specialIcon:'☀',specialCd:430,idle:'dawn_idle',run:'dawn_run',attack:'dawn_attack',drawW:mobile?112:98},
    night:{key:'night',name:'Night Veil',ko:'밤의 장막',color:'#7bdfff',accent:'#9273ff',maxHp:96,speed:3.75,basicName:'월광 칼날',basicIcon:'☾',rate:26,damage:13,proj:9.2,specialName:'월영 질주',specialIcon:'◒',specialCd:360,idle:'night_idle',run:'night_run',attack:'night_attack',drawW:mobile?106:94}
  };
  AF.selected='dawn'; AF.floor=1; AF.kills=0; AF.rooms={}; AF.current='0,0'; AF.started=false; AF.paused=true; AF.dead=false; AF.player=null; AF.projectiles=[]; AF.particles=[]; AF.shockwaves=[]; AF.pickups=[]; AF.slashes=[];
  AF.keys={}; AF.joy={x:0,y:0,active:false,id:null};
  const dirs={N:[0,-1],S:[0,1],E:[1,0],W:[-1,0]}, opp={N:'S',S:'N',E:'W',W:'E'}, key=(x,y)=>`${x},${y}`;
  AF.dirs=dirs;

  function fit(){const s=Math.min(innerWidth/W,innerHeight/H);canvas.style.width=`${Math.floor(W*s)}px`;canvas.style.height=`${Math.floor(H*s)}px`} fit();addEventListener('resize',fit);
  document.querySelectorAll('.heroCard').forEach(b=>b.addEventListener('click',()=>{AF.selected=b.dataset.hero;document.querySelectorAll('.heroCard').forEach(x=>x.classList.toggle('selected',x===b))}));
  addEventListener('keydown',e=>{AF.keys[e.key.toLowerCase()]=true;if(e.code==='Space'){e.preventDefault();AF.useSpecial()}}); addEventListener('keyup',e=>AF.keys[e.key.toLowerCase()]=false);
  const joyBase=$('joyBase'),joyKnob=$('joyKnob');
  function resetJoy(){Object.assign(AF.joy,{x:0,y:0,active:false,id:null});joyKnob.style.transform='translate(0,0)'}
  function moveJoy(e){const r=joyBase.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=e.clientX-cx,dy=e.clientY-cy,d=Math.hypot(dx,dy)||1,m=32;if(d>m){dx=dx/d*m;dy=dy/d*m}AF.joy.x=dx/m;AF.joy.y=dy/m;joyKnob.style.transform=`translate(${dx}px,${dy}px)`}
  joyBase.addEventListener('pointerdown',e=>{e.preventDefault();AF.joy.active=true;AF.joy.id=e.pointerId;joyBase.setPointerCapture?.(e.pointerId);moveJoy(e)});joyBase.addEventListener('pointermove',e=>{if(AF.joy.active&&e.pointerId===AF.joy.id){e.preventDefault();moveJoy(e)}});joyBase.addEventListener('pointerup',resetJoy);joyBase.addEventListener('pointercancel',resetJoy);addEventListener('blur',()=>{resetJoy();AF.keys={}});ui.specialBtn.addEventListener('pointerdown',e=>{e.preventDefault();AF.useSpecial()});

  function makeDungeon(n){const R={[key(0,0)]:{x:0,y:0}};let x=0,y=0,a=0;while(Object.keys(R).length<n&&a++<500){const ds=Object.keys(dirs),d=ds[Math.random()*4|0],v=dirs[d];x+=v[0];y+=v[1];R[key(x,y)]??={x,y}}for(const k in R){const r=R[k];r.doors={};for(const [d,v] of Object.entries(dirs))r.doors[d]=!!R[key(r.x+v[0],r.y+v[1])];Object.assign(r,{seen:false,clear:false,spawned:false,enemies:[]})}R['0,0'].seen=R['0,0'].clear=true;return R}
  function markBoss(){const D={[AF.current]:0},q=[AF.current];while(q.length){const k=q.shift(),r=AF.rooms[k];for(const [d,v] of Object.entries(dirs)){if(!r.doors[d])continue;const nk=key(r.x+v[0],r.y+v[1]);if(D[nk]==null){D[nk]=D[k]+1;q.push(nk)}}}let best=AF.current;for(const k in D)if(D[k]>D[best])best=k;AF.rooms[best].boss=true}
  AF.cur=()=>AF.rooms[AF.current];
  function enemy(x,y,type){const sc=1+(AF.floor-1)*.24,defs={crawler:{r:17,hp:38,s:1.25,d:9},shooter:{r:16,hp:30,s:.88,d:8},brute:{r:24,hp:82,s:.64,d:15},boss:{r:39,hp:320,s:.78,d:19}},q=defs[type];return{x,y,type,r:q.r,hp:q.hp*sc,max:q.hp*sc,s:q.s,d:q.d*sc,fire:40+Math.random()*80,alive:true,flash:0,phase:Math.random()*6.28,attackPose:0,hurtPose:0,deadAt:0,moving:false,faceX:-1}}
  function spawnRoom(r){if(r.spawned||r.clear)return;r.spawned=true;if(r.boss){r.enemies=[enemy(W/2,arena.y+125,'boss')];return}const n=3+(Math.random()*3|0)+Math.min(3,(AF.floor-1)/2|0);for(let i=0;i<n;i++){const z=Math.random(),type=z<.18?'shooter':z<.34?'brute':'crawler';let x=arena.x+80+Math.random()*(arena.w-160),y=arena.y+75+Math.random()*(arena.h-150);if(Math.hypot(x-AF.player.x,y-AF.player.y)<150){x=arena.x+80;y=arena.y+80}r.enemies.push(enemy(x,y,type))}}
  function heroUI(){const h=AF.player.hero;ui.heroName.textContent=`${h.name} · ${h.ko}`;ui.basicName.textContent=h.basicName;ui.basicIcon.textContent=h.basicIcon;ui.specialName.textContent=h.specialName;ui.specialIcon.textContent=h.specialIcon;ui.specialBtnIcon.textContent=h.specialIcon}
  AF.newRun=()=>{const h=AF.heroes[AF.selected];AF.floor=1;AF.kills=0;AF.rooms=makeDungeon(8);AF.current='0,0';markBoss();AF.player={x:W/2,y:arena.y+arena.h/2,r:17,hp:h.maxHp,maxHp:h.maxHp,speed:h.speed,hero:h,level:1,xp:0,nextXp:18,inv:0,faceX:1,faceY:0,moving:false,step:0,basic:16,special:0,atk:0,rate:0,range:0,specialBoost:0,shield:0,attackPose:0,attackAt:0,hurtPose:0,deathAt:0};AF.projectiles=[];AF.particles=[];AF.shockwaves=[];AF.pickups=[];AF.slashes=[];AF.dead=false;AF.paused=false;AF.started=true;ui.start.classList.remove('show');ui.gameOver.classList.remove('show');ui.levelUp.classList.remove('show');heroUI();AF.hud();AF.toast(`${h.ko} · ${h.name}`)};
  ui.startBtn.addEventListener('click',AF.newRun);ui.retryBtn.addEventListener('click',()=>{AF.selected=AF.player?.hero?.key||AF.selected;AF.newRun()});

  function nearest(){const a=AF.cur().enemies.filter(e=>e.alive);return a.length?a.reduce((x,y)=>Math.hypot(x.x-AF.player.x,x.y-AF.player.y)<Math.hypot(y.x-AF.player.x,y.y-AF.player.y)?x:y):null}
  function damage(e,n){if(!e.alive)return;e.hp-=n;e.flash=7;e.hurtPose=11;for(let i=0;i<6;i++)AF.particles.push({x:e.x,y:e.y,vx:(Math.random()-.5)*3.5,vy:(Math.random()-.5)*3.5,l:18,color:AF.player.hero.color});if(e.hp<=0){e.hp=0;e.alive=false;e.deadAt=performance.now();AF.kills++;AF.pickups.push({x:e.x,y:e.y,vx:(Math.random()-.5)*1.8,vy:(Math.random()-.5)*1.8,val:e.type==='boss'?20:e.type==='brute'?5:3});if(e.type==='boss')setTimeout(AF.nextFloor,500)}}
  AF.damage=damage;
  function fireBasic(){const p=AF.player,h=p.hero,e=nearest();if(!e)return;const a=Math.atan2(e.y-p.y,e.x-p.x);p.faceX=Math.cos(a);p.faceY=Math.sin(a);p.attackPose=14;p.attackAt=performance.now();if(h.key==='dawn'){const n=p.level>=7?2:1;for(let i=0;i<n;i++){const o=(i-(n-1)/2)*.12;AF.projectiles.push({team:'p',kind:'light',x:p.x,y:p.y,vx:Math.cos(a+o)*h.proj,vy:Math.sin(a+o)*h.proj,r:5,dmg:h.damage+p.atk,pierce:0,life:100,color:'#7deaff'})}}else{AF.projectiles.push({team:'p',kind:'crescent',x:p.x,y:p.y,vx:Math.cos(a)*h.proj,vy:Math.sin(a)*h.proj,r:9,dmg:h.damage+p.atk,pierce:1+(p.level/6|0),life:85,color:'#9c7cff'});AF.slashes.push({x:p.x,y:p.y,a,l:14,max:14,r:36})}}
  AF.useSpecial=()=>{const p=AF.player;if(!AF.started||AF.paused||AF.dead||!p||p.special>0)return;const h=p.hero;p.special=Math.max(150,h.specialCd-p.specialBoost);p.attackPose=24;p.attackAt=performance.now();if(h.key==='dawn'){const rad=155+p.range;AF.shockwaves.push({x:p.x,y:p.y,r:10,max:rad,l:28,color:'#ffd86a'});AF.cur().enemies.forEach(e=>{if(e.alive&&Math.hypot(e.x-p.x,e.y-p.y)<rad)damage(e,42+p.atk*1.8)});p.shield=Math.min(40,p.shield+16);p.inv=Math.max(p.inv,20);AF.slashes.push({art:true,kind:'dawn',x:p.x,y:p.y,a:Math.atan2(p.faceY,p.faceX),l:18,max:18});AF.toast('태양낙인 · 성광 폭발')}else{let dx=p.faceX,dy=p.faceY,l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;const sx=p.x,sy=p.y;p.x+=dx*(120+p.range*.4);p.y+=dy*(120+p.range*.4);clamp();p.inv=34;AF.slashes.push({x:(sx+p.x)/2,y:(sy+p.y)/2,a:Math.atan2(dy,dx),l:24,max:24,r:125,color:'#7ce8ff',art:true,kind:'night'});AF.cur().enemies.forEach(e=>{if(e.alive&&seg(sx,sy,p.x,p.y,e.x,e.y,e.r+45))damage(e,50+p.atk*1.8)});AF.toast('월영 질주 · 그림자 참격')}};
  const seg=(x1,y1,x2,y2,cx,cy,r)=>{const dx=x2-x1,dy=y2-y1,l=dx*dx+dy*dy;if(!l)return Math.hypot(cx-x1,cy-y1)<r;let t=((cx-x1)*dx+(cy-y1)*dy)/l;t=Math.max(0,Math.min(1,t));return Math.hypot(cx-(x1+t*dx),cy-(y1+t*dy))<r};

  function gainXp(n){const p=AF.player;p.xp+=n;if(p.xp>=p.nextXp){p.xp-=p.nextXp;p.level++;p.nextXp=Math.floor(p.nextXp*1.32);upgrade()}}
  function upgrade(){AF.paused=true;const opts=[{i:'✦',n:'성물 증폭',d:'기본 공격 피해 +5',f:p=>p.atk+=5},{i:'⟲',n:'공명 가속',d:'자동 공격 간격 감소',f:p=>p.rate+=3},{i:'◎',n:'공간 확장',d:'특수기 범위·이동거리 증가',f:p=>p.range+=16},{i:'✹',n:'특수 공명',d:'특수기 재사용 대기시간 감소',f:p=>p.specialBoost+=28},{i:'♥',n:'생명 각인',d:'최대 체력 +20, 즉시 회복',f:p=>{p.maxHp+=20;p.hp=Math.min(p.maxHp,p.hp+28)}}].sort(()=>Math.random()-.5).slice(0,3);ui.upgradeCards.innerHTML='';opts.forEach(o=>{const b=document.createElement('button');b.className='upgrade';b.innerHTML=`<span class="uicon">${o.i}</span><b>${o.n}</b><p>${o.d}</p>`;b.onclick=()=>{o.f(AF.player);ui.levelUp.classList.remove('show');AF.paused=false;AF.hud()};ui.upgradeCards.appendChild(b)});ui.levelUp.classList.add('show')}
  AF.nextFloor=()=>{AF.floor++;AF.rooms=makeDungeon(Math.min(13,8+AF.floor));AF.current='0,0';markBoss();AF.player.x=W/2;AF.player.y=arena.y+arena.h/2;AF.player.hp=AF.player.maxHp;AF.player.inv=30;AF.projectiles=[];AF.pickups=[];AF.slashes=[];AF.toast(`FLOOR ${AF.floor}`);AF.hud()};
  function hurt(n,nx,ny){const p=AF.player;if(p.shield>0){const b=Math.min(p.shield,n);p.shield-=b;n-=b;if(n<=0){p.inv=18;return}}p.hp-=Math.round(n);p.inv=48;p.hurtPose=18;p.x+=nx*18;p.y+=ny*18;for(let i=0;i<10;i++)AF.particles.push({x:p.x,y:p.y,vx:(Math.random()-.5)*4,vy:(Math.random()-.5)*4,l:22,color:'#ff6478'});if(p.hp<=0&&!AF.dead){p.hp=0;AF.dead=true;AF.paused=true;p.deathAt=performance.now();ui.resultText.textContent=`${p.hero.ko} · FLOOR ${AF.floor} · Lv ${p.level} · 처치 ${AF.kills}`;setTimeout(()=>{if(AF.dead)ui.gameOver.classList.add('show')},900)}}
  function clamp(){const p=AF.player;p.x=Math.max(arena.x+p.r,Math.min(arena.x+arena.w-p.r,p.x));p.y=Math.max(arena.y+p.r,Math.min(arena.y+arena.h-p.r,p.y))}
  function enter(nk,from){AF.current=nk;const r=AF.cur();r.seen=true;AF.projectiles=[];AF.slashes=[];if(!r.clear)spawnRoom(r);const p=AF.player;if(from==='W'){p.x=arena.x+35;p.y=arena.y+arena.h/2}else if(from==='E'){p.x=arena.x+arena.w-35;p.y=arena.y+arena.h/2}else if(from==='N'){p.x=W/2;p.y=arena.y+35}else if(from==='S'){p.x=W/2;p.y=arena.y+arena.h-35}p.inv=35;AF.toast(r.boss?'보스의 기척이 느껴집니다':'새 방 발견')}
  function doors(){const p=AF.player,r=AF.cur(),g=58,mx=W/2,my=arena.y+arena.h/2;let d=null;if(p.x<=arena.x+p.r+1&&r.clear&&r.doors.W&&Math.abs(p.y-my)<g)d='W';else if(p.x>=arena.x+arena.w-p.r-1&&r.clear&&r.doors.E&&Math.abs(p.y-my)<g)d='E';else if(p.y<=arena.y+p.r+1&&r.clear&&r.doors.N&&Math.abs(p.x-mx)<g)d='N';else if(p.y>=arena.y+arena.h-p.r-1&&r.clear&&r.doors.S&&Math.abs(p.x-mx)<g)d='S';if(d){const v=dirs[d],rr=AF.cur(),nk=key(rr.x+v[0],rr.y+v[1]);if(AF.rooms[nk])enter(nk,opp[d])}}

  AF.update=dt=>{const p=AF.player;if(p.special>0)p.special-=dt;if(p.inv>0)p.inv-=dt;if(p.attackPose>0)p.attackPose-=dt;if(p.hurtPose>0)p.hurtPose-=dt;let vx=(AF.keys.a||AF.keys.arrowleft?-1:0)+(AF.keys.d||AF.keys.arrowright?1:0),vy=(AF.keys.w||AF.keys.arrowup?-1:0)+(AF.keys.s||AF.keys.arrowdown?1:0);if(AF.joy.active&&Math.hypot(AF.joy.x,AF.joy.y)>.08){vx=AF.joy.x;vy=AF.joy.y}let m=Math.hypot(vx,vy);p.moving=m>.04;if(m){vx/=m;vy/=m;p.x+=vx*p.speed*dt;p.y+=vy*p.speed*dt;p.faceX=vx;p.faceY=vy;p.step+=dt*.42}clamp();doors();const r=AF.cur();if(!r.clear)spawnRoom(r);p.basic-=dt;if(p.basic<=0){p.basic=Math.max(11,p.hero.rate-p.rate);fireBasic()}
    for(const e of r.enemies){
      if(!e.alive)continue;
      if(e.flash>0)e.flash-=dt;if(e.attackPose>0)e.attackPose-=dt;if(e.hurtPose>0)e.hurtPose-=dt;
      const ox=e.x,oy=e.y,dx=p.x-e.x,dy=p.y-e.y,dist=Math.hypot(dx,dy)||1;e.faceX=dx;
      if(e.type==='shooter'){
        if(dist>210){e.x+=dx/dist*e.s*dt;e.y+=dy/dist*e.s*dt}else if(dist<150){e.x-=dx/dist*e.s*dt;e.y-=dy/dist*e.s*dt}
        e.fire-=dt;
        if(e.fire<=0&&dist<360){e.fire=95;e.attackPose=18;const a=Math.atan2(dy,dx);AF.projectiles.push({team:'e',kind:'orb',x:e.x,y:e.y,vx:Math.cos(a)*3.9,vy:Math.sin(a)*3.9,r:6,dmg:e.d,life:150,color:'#ff4c78'})}
      }else{e.x+=dx/dist*e.s*dt;e.y+=dy/dist*e.s*dt}
      e.x=Math.max(arena.x+e.r,Math.min(arena.x+arena.w-e.r,e.x));e.y=Math.max(arena.y+e.r,Math.min(arena.y+arena.h-e.r,e.y));
      e.moving=Math.hypot(e.x-ox,e.y-oy)>.08;
      if(dist<p.r+e.r&&p.inv<=0){e.attackPose=e.type==='boss'?22:14;hurt(e.d,dx/dist,dy/dist)}
    }
    for(let i=AF.projectiles.length-1;i>=0;i--){const q=AF.projectiles[i];q.x+=q.vx*dt;q.y+=q.vy*dt;q.life-=dt;if(q.life<=0||q.x<arena.x-20||q.x>arena.x+arena.w+20||q.y<arena.y-20||q.y>arena.y+arena.h+20){AF.projectiles.splice(i,1);continue}if(q.team==='p'){const e=r.enemies.find(e=>e.alive&&Math.hypot(e.x-q.x,e.y-q.y)<e.r+q.r);if(e){damage(e,q.dmg);if(q.pierce>0)q.pierce--;else AF.projectiles.splice(i,1)}}else if(p.inv<=0&&Math.hypot(p.x-q.x,p.y-q.y)<p.r+q.r){hurt(q.dmg,q.vx/4,q.vy/4);AF.projectiles.splice(i,1)}}
    for(let i=AF.pickups.length-1;i>=0;i--){const q=AF.pickups[i],dx=p.x-q.x,dy=p.y-q.y,d=Math.hypot(dx,dy)||1;q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=Math.pow(.9,dt);q.vy*=Math.pow(.9,dt);if(d<130){q.x+=dx/d*4.8*dt;q.y+=dy/d*4.8*dt}if(d<p.r+12){gainXp(q.val);AF.pickups.splice(i,1)}}
    AF.particles.forEach(q=>{q.x+=q.vx*dt;q.y+=q.vy*dt;q.l-=dt});AF.particles=AF.particles.filter(q=>q.l>0);AF.shockwaves.forEach(q=>{q.r+=(q.max-q.r)*.18*dt;q.l-=dt});AF.shockwaves=AF.shockwaves.filter(q=>q.l>0);AF.slashes.forEach(q=>q.l-=dt);AF.slashes=AF.slashes.filter(q=>q.l>0);if(r.spawned&&!r.boss&&!r.enemies.some(e=>e.alive))r.clear=true;AF.hud()};

  AF.hud=()=>{const p=AF.player;if(!p)return;const r=AF.cur();ui.floorText.textContent=`FLOOR ${AF.floor}`;ui.roomText.textContent=`ROOM ${AF.current}`;ui.killText.textContent=AF.kills;ui.hpText.textContent=Math.max(0,Math.round(p.hp));ui.levelText.textContent=p.level;ui.enemyText.textContent=r.enemies.filter(e=>e.alive).length;ui.hpFill.style.width=`${Math.max(0,p.hp/p.maxHp*100)}%`;ui.xpFill.style.width=`${Math.max(0,p.xp/p.nextXp*100)}%`;const cd=Math.max(0,Math.ceil(p.special/60));ui.specialCdText.textContent=cd?`${cd}s`:'READY';ui.specialBtn.classList.toggle('cooling',cd>0)};
  let toastTimer;AF.toast=t=>{ui.toast.textContent=t;ui.toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>ui.toast.classList.remove('show'),1100)};
})();