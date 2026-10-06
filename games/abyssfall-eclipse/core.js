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
  const sound=()=>window.PV_AUDIO;

  const ui=AF.ui={start:$('start'),startBtn:$('startBtn'),levelUp:$('levelUp'),upgradeCards:$('upgradeCards'),gameOver:$('gameOver'),retryBtn:$('retryBtn'),heroName:$('heroName'),floorText:$('floorText'),roomText:$('roomText'),killText:$('killText'),hpText:$('hpText'),levelText:$('levelText'),enemyText:$('enemyText'),hpFill:$('hpFill'),xpFill:$('xpFill'),basicName:$('basicName'),basicIcon:$('basicIcon'),specialName:$('specialName'),specialIcon:$('specialIcon'),specialCdText:$('specialCdText'),specialBtn:$('specialBtn'),specialBtnIcon:$('specialBtnIcon'),specialBtnTimer:$('specialBtnTimer'),resultText:$('resultText'),toast:$('toast'),relicList:$('relicList'),relicButton:$('relicButton'),relicCount:$('relicCount'),relicPanel:$('relicPanel'),relicClose:$('relicClose'),relicFlash:$('relicFlash'),relicFlashIcon:$('relicFlashIcon'),relicFlashName:$('relicFlashName'),clearScreen:$('clearScreen'),clearStats:$('clearStats'),clearRelics:$('clearRelics'),clearRecord:$('clearRecord'),endlessBtn:$('endlessBtn'),clearRestart:$('clearRestart'),clearLobby:$('clearLobby')};
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
  AF.selected='dawn'; AF.floor=1; AF.kills=0; AF.relics={}; AF.rooms={}; AF.runStart=0; AF.endless=false; AF.cleared=false; AF.transitioning=false; AF.current='0,0'; AF.started=false; AF.paused=true; AF.dead=false; AF.player=null; AF.projectiles=[]; AF.particles=[]; AF.shockwaves=[]; AF.pickups=[]; AF.slashes=[];
  AF.keys={}; AF.joy={x:0,y:0,active:false,id:null};
  const dirs={N:[0,-1],S:[0,1],E:[1,0],W:[-1,0]}, opp={N:'S',S:'N',E:'W',W:'E'}, key=(x,y)=>`${x},${y}`;
  AF.dirs=dirs;
  AF.stageNames=['버려진 성당','침묵의 묘지','무너진 탑','심연의 제단'];
  AF.zoneIndex=(floor=AF.floor)=>Math.floor((floor-1)/3)%AF.stageNames.length;
  AF.stageName=()=>AF.stageNames[AF.zoneIndex()];
  AF.isBossFloor=(floor=AF.floor)=>floor%3===0;
  AF.roomTarget=(floor=AF.floor)=>{const plan=[8,9,10,11,12,13,14,15,16,17,18,20];return floor<=12?plan[floor-1]:Math.min(28,20+Math.ceil((floor-12)/2))};
  AF.roomLabels={start:'입구',combat:'일반전투',treasure:'보물방',recovery:'회복방',elite:'엘리트방',exit:'하층 계단',boss:'보스방'};
  AF.roomLabel=r=>AF.roomLabels[r?.type]||'일반전투';
  AF.tracePools=[
    ['해가 검어지던 날, 첫 번째 종은 울리지 않았다.','빛이 끊긴 뒤에도 문은 안에서 잠겼다.','…아래를 보지 마라.'],
    ['이름을 적지 마라.','세 번째 관에는 아무것도 없었다.','돌아온 자의 얼굴을 보지 마라.'],
    ['우리는 닫은 것이 아니다.','기계는 멈췄는데, 바늘은 아직 내려간다.','아래에서 오는 신호를 끊을 수 없다.'],
    ['여기까지 온 것은 처음이 아니다.','문은 바깥을 막기 위해 세운 것이 아니다.','…그것은 아직 위를 보고 있다.']
  ];

  function fit(){const s=Math.min(innerWidth/W,innerHeight/H);canvas.style.width=`${Math.floor(W*s)}px`;canvas.style.height=`${Math.floor(H*s)}px`} fit();addEventListener('resize',fit);
  document.querySelectorAll('.heroCard').forEach(b=>b.addEventListener('click',()=>{AF.selected=b.dataset.hero;document.querySelectorAll('.heroCard').forEach(x=>x.classList.toggle('selected',x===b))}));
  addEventListener('keydown',e=>{AF.keys[e.key.toLowerCase()]=true;if(e.code==='Space'){e.preventDefault();AF.useSpecial()}}); addEventListener('keyup',e=>AF.keys[e.key.toLowerCase()]=false);
  const joyBase=$('joyBase'),joyKnob=$('joyKnob');
  function resetJoy(){Object.assign(AF.joy,{x:0,y:0,active:false,id:null});joyKnob.style.transform='translate(0,0)'}
  function moveJoy(e){const r=joyBase.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=e.clientX-cx,dy=e.clientY-cy,d=Math.hypot(dx,dy)||1,m=32;if(d>m){dx=dx/d*m;dy=dy/d*m}AF.joy.x=dx/m;AF.joy.y=dy/m;joyKnob.style.transform=`translate(${dx}px,${dy}px)`}
  joyBase.addEventListener('pointerdown',e=>{e.preventDefault();AF.joy.active=true;AF.joy.id=e.pointerId;joyBase.setPointerCapture?.(e.pointerId);moveJoy(e)});joyBase.addEventListener('pointermove',e=>{if(AF.joy.active&&e.pointerId===AF.joy.id){e.preventDefault();moveJoy(e)}});joyBase.addEventListener('pointerup',resetJoy);joyBase.addEventListener('pointercancel',resetJoy);addEventListener('blur',()=>{resetJoy();AF.keys={}});ui.specialBtn.addEventListener('pointerdown',e=>{e.preventDefault();AF.useSpecial()});
  if(ui.relicButton){const closeRelics=()=>{ui.relicPanel.classList.remove('show');ui.relicPanel.setAttribute('aria-hidden','true')};ui.relicButton.addEventListener('click',()=>{const open=!ui.relicPanel.classList.contains('show');ui.relicPanel.classList.toggle('show',open);ui.relicPanel.setAttribute('aria-hidden',open?'false':'true')});ui.relicClose&&ui.relicClose.addEventListener('click',closeRelics);}

  function makeDungeon(n){
    const R={[key(0,0)]:{x:0,y:0}},path=['0,0'];
    let x=0,y=0,attempt=0;
    const backbone=Math.min(n-1,Math.max(4,Math.round(n*.48)));
    while(path.length<=backbone&&attempt++<700){
      const options=Object.values(dirs).map(v=>[x+v[0],y+v[1]]).filter(([nx,ny])=>!R[key(nx,ny)]);
      if(!options.length){
        const back=R[path[Math.max(0,path.length-2)]];x=back.x;y=back.y;continue;
      }
      const [nx,ny]=options[Math.random()*options.length|0];x=nx;y=ny;R[key(x,y)]={x,y};path.push(key(x,y));
    }
    attempt=0;
    while(Object.keys(R).length<n&&attempt++<1600){
      const keys=Object.keys(R),base=R[keys[Math.random()*keys.length|0]];
      const shuffled=Object.values(dirs).slice().sort(()=>Math.random()-.5);
      let added=false;
      for(const v of shuffled){
        const nx=base.x+v[0],ny=base.y+v[1],nk=key(nx,ny);
        if(R[nk])continue;
        const near=Object.values(dirs).reduce((c,d)=>c+(R[key(nx+d[0],ny+d[1])]?1:0),0);
        if(near>2&&Math.random()<.72)continue;
        R[nk]={x:nx,y:ny};added=true;break;
      }
      if(!added&&attempt%80===0){
        const base2=R[keys[keys.length-1]],v=shuffled[0],nx=base2.x+v[0],ny=base2.y+v[1];R[key(nx,ny)]??={x:nx,y:ny};
      }
    }
    for(const k in R){
      const r=R[k];r.doors={};
      for(const [d,v] of Object.entries(dirs))r.doors[d]=!!R[key(r.x+v[0],r.y+v[1])];
      Object.assign(r,{seen:false,clear:false,spawned:false,enemies:[],type:'combat',used:false,eliteRewarded:false,boss:false,exit:false,sealAltar:false,sealBroken:false,traceText:'',traceSeen:false,traceSide:'',gimmickTimer:80+Math.random()*150,windWarn:0,windActive:0,windDir:1,windX:1,windY:0,windStrength:1.2,windDuration:70,fogCount:1+Math.floor(Math.random()*4),hazards:[]});
    }
    R['0,0'].seen=R['0,0'].clear=true;R['0,0'].type='start';R['0,0'].spawned=true;
    return R
  }
  function floorDistances(){
    const D={[AF.current]:0},q=[AF.current];
    while(q.length){
      const k=q.shift(),r=AF.rooms[k];
      for(const [d,v] of Object.entries(dirs)){
        if(!r.doors[d])continue;
        const nk=key(r.x+v[0],r.y+v[1]);
        if(D[nk]==null){D[nk]=D[k]+1;q.push(nk)}
      }
    }
    return D
  }
  function assignRoomTypes(targetKey){
    const entries=Object.entries(AF.rooms).filter(([k])=>k!=='0,0'&&k!==targetKey);
    for(const [,r] of entries){r.type='combat';r.used=false;r.eliteRewarded=false;r.clear=false;r.spawned=false;r.boss=false;r.exit=false;r.sealAltar=false;r.sealBroken=false;r.traceText='';r.traceSeen=false;r.traceSide=''}
    entries.sort(()=>Math.random()-.5);
    let pos=0;
    const treasureCount=AF.floor>=8?2:1,recoveryCount=AF.floor>=10?2:1;
    for(let i=0;i<treasureCount&&entries[pos];i++,pos++){const r=entries[pos][1];r.type='treasure';r.clear=true;r.spawned=true}
    for(let i=0;i<recoveryCount&&entries[pos];i++,pos++){const r=entries[pos][1];r.type='recovery';r.clear=true;r.spawned=true}
    const eliteGoal=AF.floor<=3?1:AF.floor<=6?2:AF.floor<=9?3:4;
    const eliteCount=Math.min(eliteGoal,Math.max(0,entries.length-pos));
    for(let i=0;i<eliteCount;i++,pos++){const r=entries[pos]?.[1];if(r)r.type='elite'}
  }
  function setupFloorObjective(){
    const D=floorDistances();let best='0,0';
    for(const k in D)if(D[k]>D[best])best=k;
    assignRoomTypes(best);
    const target=AF.rooms[best],boss=AF.isBossFloor();
    target.boss=boss;target.exit=!boss;target.type=boss?'boss':'exit';target.clear=false;target.spawned=false;target.used=false;
    AF.objectiveRoom=best;AF.objectiveDistance=D[best]||0;AF.bossUnlocked=!boss;AF.lockedDoorAt=0;

    if(boss){
      const need=AF.floor===3?2:AF.floor===6?3:AF.floor===9?3:4;
      const candidates=Object.entries(AF.rooms)
        .filter(([k,r])=>k!=='0,0'&&k!==best&&(r.type==='combat'||r.type==='elite'))
        .sort((a,b)=>(D[b[0]]||0)-(D[a[0]]||0));
      const chosen=[];
      // Prefer distant rooms, but avoid stacking all altars next to one another.
      for(const item of candidates){
        if(chosen.length>=need)break;
        const r=item[1];
        if(chosen.some(x=>Math.abs(x.x-r.x)+Math.abs(x.y-r.y)<=1)&&candidates.length>need+2)continue;
        chosen.push(r);
      }
      for(const item of candidates){if(chosen.length>=need)break;if(!chosen.includes(item[1]))chosen.push(item[1])}
      chosen.forEach(r=>{r.sealAltar=true;r.sealBroken=false});
      AF.sealNeed=chosen.length;
    }else AF.sealNeed=0;

    // Sparse, non-essential traces: never a checklist, never required for progression.
    const traceCount=AF.isBossFloor()?2:1;
    const traceCandidates=Object.entries(AF.rooms)
      .filter(([k,r])=>k!=='0,0'&&k!==best&&!r.sealAltar&&(r.type==='combat'||r.type==='elite'))
      .sort(()=>Math.random()-.5);
    const pool=AF.tracePools[AF.zoneIndex()]||AF.tracePools[0];
    for(let i=0;i<Math.min(traceCount,traceCandidates.length);i++){
      const r=traceCandidates[i][1];
      r.traceText=pool[(AF.floor+i+r.x*3+r.y*5+pool.length*20)%pool.length];
      r.traceSide=((Math.abs(r.x*7+r.y*11+AF.floor+i)%2)===0)?'left':'right';
    }
  }
  AF.cur=()=>AF.rooms[AF.current];
  function roomRand(r,n){const v=Math.sin((r.x*97+r.y*193+AF.floor*389+n*71.17))*43758.5453;return v-Math.floor(v)}
  AF.tracePoint=r=>{
    const left=r?.traceSide!=='right';
    return{x:left?arena.x+58:arena.x+arena.w-58,y:arena.y+arena.h*.56};
  };
  function updateTrace(r){
    if(!r?.traceText||r.traceSeen||!r.clear)return;
    const p=AF.player,t=AF.tracePoint(r);
    if(Math.hypot(p.x-t.x,p.y-t.y)>62)return;
    r.traceSeen=true;
    AF.toast(r.traceText);
  }
  AF.stageZone=(r,kind,i=0)=>{
    if(!r)return{x:W/2,y:arena.y+arena.h/2,r:70};
    if(kind==='holy')return{x:arena.x+arena.w*(.30+.40*roomRand(r,11)),y:arena.y+arena.h*(.42+.34*roomRand(r,12)),r:74};
    if(kind==='fog'){
      const x=arena.x+55+roomRand(r,20+i)*(arena.w-110);
      const y=arena.y+55+roomRand(r,40+i)*(arena.h-110);
      const rad=58+roomRand(r,60+i)*62;
      return{x,y,r:rad};
    }
    return{x:W/2,y:arena.y+arena.h/2,r:70};
  };
  AF.fogCount=r=>Math.max(1,Math.min(4,r?.fogCount||2));
  const activeStageRoom=r=>r&&!r.clear&&!(AF.bossClearUntil&&performance.now()<AF.bossClearUntil)&&(r.type==='combat'||r.type==='elite'||r.type==='exit'||r.type==='boss');
  function stageMoveScale(r,p){
    if(!activeStageRoom(r)||AF.zoneIndex()!==1)return 1;
    let scale=1;
    for(let i=0;i<AF.fogCount(r);i++){
      const z=AF.stageZone(r,'fog',i);
      if(Math.hypot(p.x-z.x,p.y-z.y)<z.r)scale=Math.min(scale,.72+roomRand(r,90+i)*.14);
    }
    return scale;
  }
  function updateStageGimmick(r,dt){
    if(!r)return;
    const idx=AF.zoneIndex(),p=AF.player;
    if(!activeStageRoom(r)){r.windWarn=0;r.windActive=0;return}
    if(idx===0){
      const z=AF.stageZone(r,'holy');
      if(Math.hypot(p.x-z.x,p.y-z.y)<z.r){
        p.special=Math.max(0,p.special-dt*.48);
        p.holyTick=(p.holyTick||0)+dt;
        if(p.holyTick>18){p.holyTick=0;AF.particles.push({x:p.x+(Math.random()-.5)*28,y:p.y+12,vx:(Math.random()-.5)*.4,vy:-1-Math.random()*.7,l:22,color:'#ffe7a0'})}
      }
    }else if(idx===2){
      if(r.windWarn>0){
        r.windWarn-=dt;
        if(r.windWarn<=0){r.windWarn=0;r.windActive=r.windDuration||70}
      }else if(r.windActive>0){
        r.windActive-=dt;
        const push=(r.windStrength||1.2)*dt;
        p.x+=(r.windX||0)*push;p.y+=(r.windY||0)*push;
        r.enemies.forEach(e=>{if(e.alive&&e.type!=='boss'){e.x+=(r.windX||0)*push*.38;e.y+=(r.windY||0)*push*.38}});
      }else{
        r.gimmickTimer-=dt;
        if(r.gimmickTimer<=0){
          const a=Math.random()*Math.PI*2;
          r.windX=Math.cos(a);r.windY=Math.sin(a);r.windDir=r.windX>=0?1:-1;
          r.windStrength=.75+Math.random()*1.65+(r.type==='boss'?.25:0);
          r.windDuration=34+Math.random()*82+(r.type==='boss'?24:0);
          r.windWarn=20+Math.random()*38;
          r.gimmickTimer=85+Math.random()*210-(r.type==='boss'?25:0);
        }
      }
    }else if(idx===3){
      r.gimmickTimer-=dt;
      if(r.gimmickTimer<=0){
        const count=1+(Math.random()<(r.type==='boss'?.78:.42)?1:0)+(r.type==='boss'&&Math.random()<.42?1:0);
        for(let i=0;i<count;i++){
          const nearPlayer=i===0&&Math.random()<.62;
          const x=nearPlayer?Math.max(arena.x+50,Math.min(arena.x+arena.w-50,p.x+(Math.random()-.5)*190)):arena.x+55+Math.random()*(arena.w-110);
          const y=nearPlayer?Math.max(arena.y+50,Math.min(arena.y+arena.h-50,p.y+(Math.random()-.5)*160)):arena.y+55+Math.random()*(arena.h-110);
          const rad=44+Math.random()*52,warn=28+Math.random()*46;
          r.hazards.push({x,y,r:rad,t:warn,max:warn,hit:false,life:0});
        }
        r.gimmickTimer=(r.type==='boss'?58:82)+Math.random()*(r.type==='boss'?105:170);
      }
      for(const h of r.hazards){
        if(!h.hit){
          h.t-=dt;
          if(h.t<=0){
            h.hit=true;h.life=22+Math.random()*12;AF.shockwaves.push({x:h.x,y:h.y,r:10,max:h.r,l:22,color:'#ff4867'});
            const d=Math.hypot(p.x-h.x,p.y-h.y);
            if(d<h.r&&p.inv<=0)hurt((8+AF.floor*1.15)*(0.82+h.r/130),(p.x-h.x)/(d||1),(p.y-h.y)/(d||1));
          }
        }else h.life-=dt;
      }
      r.hazards=r.hazards.filter(h=>!h.hit||h.life>0);
    }
  }
  AF.stageTip=()=>{
    const tips=['바닥 어딘가에 희미한 빛이 남아 있다.','안개가 짙다.','바람 소리가 가까워졌다.','바닥 아래에서 불길한 진동이 느껴진다.'];
    return tips[AF.zoneIndex()];
  };
  function enemy(x,y,type){
    const f=Math.max(0,AF.floor-1);
    const normalHp=1+f*.32+f*f*.018,normalDmg=1+f*.12+f*f*.005;
    const bossHp=1+f*.35+f*f*.020,bossDmg=1+f*.10+f*f*.006;
    const defs={crawler:{r:17,hp:42,s:1.25,d:9},shooter:{r:16,hp:36,s:.88,d:8},brute:{r:24,hp:92,s:.64,d:15},boss:{r:39,hp:1100,s:.78,d:18}},q=defs[type];
    const hpScale=type==='boss'?bossHp:normalHp,dmgScale=type==='boss'?bossDmg:normalDmg;
    return{x,y,type,r:q.r,hp:q.hp*hpScale,max:q.hp*hpScale,s:q.s,d:q.d*dmgScale,fire:40+Math.random()*80,alive:true,flash:0,phase:Math.random()*6.28,attackPose:0,hurtPose:0,deadAt:0,moving:false,faceX:-1,aiCd:45+Math.random()*55,aiWindup:0,dash:0,charge:0,stun:0,aimX:0,aimY:0,shotAngle:0,bossCd:85,bossTelegraph:0,bossTelegraphMax:0,bossPattern:-1,bossAim:0,bossPhase:0,phaseAnnounced:0,bossAction:'추적 중',intro:0,introMax:0}
  }
  function spawnRoom(r){
    if(r.spawned||r.clear)return;
    r.spawned=true;
    if(r.type==='boss'||r.boss){const b=enemy(W/2,arena.y+155,'boss');b.intro=b.introMax=118;b.bossCd=48;b.bossAction='출현 중';r.enemies=[b];return}
    const elite=r.type==='elite';
    const n=(elite?3:3+(Math.random()*3|0))+Math.min(elite?2:3,(AF.floor-1)/2|0);
    for(let i=0;i<n;i++){
      const z=Math.random(),type=elite?(z<.28?'shooter':z<.68?'brute':'crawler'):(z<.18?'shooter':z<.34?'brute':'crawler');
      let x=arena.x+80+Math.random()*(arena.w-160),y=arena.y+75+Math.random()*(arena.h-150);
      if(Math.hypot(x-AF.player.x,y-AF.player.y)<150){x=arena.x+80;y=arena.y+80}
      const e=enemy(x,y,type);
      if(elite){e.elite=true;const z=2.0+Math.min(.48,AF.floor*.04);e.hp*=z;e.max=e.hp;e.d*=1.42+Math.min(.20,AF.floor*.015);e.s*=1.08;e.r*=1.10}
      r.enemies.push(e);
    }
  }
  function heroUI(){const h=AF.player.hero;ui.heroName.textContent=`${h.name} · ${h.ko}`;ui.basicName.textContent=h.basicName;ui.basicIcon.textContent=h.basicIcon;ui.specialName.textContent=h.specialName;ui.specialIcon.textContent=h.specialIcon;ui.specialBtnIcon.textContent=h.specialIcon}
  AF.newRun=()=>{sound()?.unlock().then(()=>{sound()?.startExplore();sound()?.sfx('start')});const h=AF.heroes[AF.selected];AF.floor=1;AF.kills=0;AF.relics={};AF.runStart=performance.now();AF.endless=false;AF.cleared=false;AF.transitioning=false;AF.bossClearUntil=0;AF.rooms=makeDungeon(AF.roomTarget());AF.current='0,0';setupFloorObjective();AF.player={x:W/2,y:arena.y+arena.h/2,r:17,hp:h.maxHp,maxHp:h.maxHp,speed:h.speed,hero:h,level:1,xp:0,nextXp:18,inv:0,faceX:1,faceY:0,moving:false,step:0,basic:16,special:0,atk:0,rate:0,range:0,specialBoost:0,shield:0,attackPose:0,attackAt:0,hurtPose:0,deathAt:0,bladeShots:0,sigilCharge:0,guardianCd:0,crystalTimer:80,echoTimer:0};AF.projectiles=[];AF.particles=[];AF.shockwaves=[];AF.pickups=[];AF.slashes=[];AF.dead=false;AF.paused=false;AF.started=true;ui.start.classList.remove('show');ui.gameOver.classList.remove('show');ui.levelUp.classList.remove('show');ui.clearScreen?.classList.remove('show');heroUI();AF.drawRelics();AF.hud();AF.toast(`${h.ko} · ${h.name} · ${Object.keys(AF.rooms).length} ROOMS`);setTimeout(()=>{if(AF.started&&!AF.dead&&AF.floor===1)AF.toast(AF.stageTip())},950)};
  ui.startBtn.addEventListener('click',AF.newRun);ui.retryBtn.addEventListener('click',()=>{AF.selected=AF.player?.hero?.key||AF.selected;AF.newRun()});
  ui.clearRestart?.addEventListener('click',()=>{AF.selected=AF.player?.hero?.key||AF.selected;AF.newRun()});
  ui.clearLobby?.addEventListener('click',()=>{sound()?.stopMusic();AF.clearScreen?.classList.remove('show');AF.started=false;AF.paused=true;ui.start.classList.add('show')});
  ui.endlessBtn?.addEventListener('click',()=>{AF.endless=true;AF.cleared=true;AF.clearScreen?.classList.remove('show');AF.paused=false;AF.nextFloor('endless')});

  function nearest(){const a=AF.cur().enemies.filter(e=>e.alive);return a.length?a.reduce((x,y)=>Math.hypot(x.x-AF.player.x,x.y-AF.player.y)<Math.hypot(y.x-AF.player.x,y.y-AF.player.y)?x:y):null}
  const relicCount=id=>AF.relics[id]?.count||0;
  function triggerRelicEcho(){
    const p=AF.player,count=relicCount('resonance-core');if(!count||AF.dead)return;
    const power=.42+.10*count;
    if(p.hero.key==='dawn'){
      const rad=130+p.range*.75+count*8;
      AF.shockwaves.push({x:p.x,y:p.y,r:16,max:rad,l:24,color:'#d8a9ff'});
      AF.cur().enemies.forEach(e=>{if(e.alive&&Math.hypot(e.x-p.x,e.y-p.y)<rad)damage(e,(42+p.atk*1.8)*power)});
      AF.toast('공명 핵 · 잔향 폭발');
    }else{
      let dx=p.faceX,dy=p.faceY,l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;
      const sx=p.x-dx*22,sy=p.y-dy*22,ex=p.x+dx*(135+p.range*.35+count*8),ey=p.y+dy*(135+p.range*.35+count*8);
      AF.slashes.push({x:(sx+ex)/2,y:(sy+ey)/2,a:Math.atan2(dy,dx),l:19,max:19,r:112+count*7,color:'#c084ff',art:false});
      AF.cur().enemies.forEach(e=>{if(e.alive&&seg(sx,sy,ex,ey,e.x,e.y,e.r+42))damage(e,(50+p.atk*1.8)*power)});
      AF.toast('공명 핵 · 월영 잔향');
    }
  }
  function damage(e,n){
    if(!e.alive)return;
    if(e.type==='boss'&&e.intro>0)return;
    const p=AF.player,grail=relicCount('twin-grail');
    if(grail){const missing=1-Math.max(0,p.hp)/p.maxHp;n*=1+missing*(.55+.18*(grail-1))}
    if(e.type==='boss')n=Math.min(n,e.max*.10);
    e.hp-=n;e.flash=7;e.hurtPose=11;sound()?.sfx('hit');
    for(let i=0;i<6;i++)AF.particles.push({x:e.x,y:e.y,vx:(Math.random()-.5)*3.5,vy:(Math.random()-.5)*3.5,l:18,color:p.hero.color});
    if(e.hp<=0){
      e.hp=0;e.alive=false;e.deadAt=performance.now();AF.kills++;sound()?.sfx(e.type==='boss'?'bossDefeat':'enemyDeath');
      AF.pickups.push({x:e.x,y:e.y,vx:(Math.random()-.5)*1.8,vy:(Math.random()-.5)*1.8,val:e.type==='boss'?20:e.type==='brute'?5:3});
      const fang=p.hero.key==='night'?relicCount('eclipse-fang'):0;
      if(fang){
        const targets=AF.cur().enemies.filter(x=>x.alive&&x!==e).sort((a,b)=>Math.hypot(a.x-e.x,a.y-e.y)-Math.hypot(b.x-e.x,b.y-e.y));
        const count=Math.min(3,1+Math.floor((fang-1)/2)),base=(p.hero.damage+p.atk)*(.46+.07*fang);
        for(let i=0;i<Math.min(count,targets.length);i++){const t=targets[i],a=Math.atan2(t.y-e.y,t.x-e.x);AF.projectiles.push({team:'p',kind:'moonFang',x:e.x,y:e.y,vx:Math.cos(a)*8.6,vy:Math.sin(a)*8.6,r:7,dmg:base,pierce:0,life:92,color:'#9b7cff'})}
      }
      if(e.type==='boss'){
        const now=performance.now(),room=AF.cur();
        AF.paused=false;AF.transitioning=false;
        AF.projectiles=AF.projectiles.filter(q=>q.team==='p');
        room.enemies.forEach(x=>{if(x!==e&&x.alive){x.alive=false;x.hp=0;x.deadAt=now}});
        room.clear=true;room.bossDefeated=true;room.portalUnlockAt=now+720;room.used=false;
        p.inv=Math.max(p.inv,150);p.basic=Math.max(p.basic,28);
        AF.bossClearUntil=now+720;e.bossAction='격파';
        sound()?.stopMusic();setTimeout(()=>{sound()?.sfx('stairsOpen');sound()?.startExplore()},430);
        AF.toast('심연의 감시자를 물리쳤습니다')
      }
    }
  }
  AF.damage=damage;
  function fireBasic(){
    const p=AF.player,h=p.hero,e=nearest();if(!e)return;sound()?.sfx('basic',h.key);
    const a=Math.atan2(e.y-p.y,e.x-p.x),blade=relicCount('relic-blade'),solar=h.key==='dawn'?relicCount('solar-shard'):0;
    p.faceX=Math.cos(a);p.faceY=Math.sin(a);p.attackPose=14;p.attackAt=performance.now();p.bladeShots=(p.bladeShots||0)+1;
    const burst=blade>0&&p.bladeShots%3===0;
    if(h.key==='dawn'){
      const n=p.level>=7?2:1;
      for(let i=0;i<n;i++){const o=(i-(n-1)/2)*.12;AF.projectiles.push({team:'p',kind:'light',x:p.x,y:p.y,vx:Math.cos(a+o)*h.proj,vy:Math.sin(a+o)*h.proj,r:5,dmg:h.damage+p.atk,pierce:blade+solar,life:100,color:solar?'#ffe58a':'#7deaff'})}
    }else{
      AF.projectiles.push({team:'p',kind:'crescent',x:p.x,y:p.y,vx:Math.cos(a)*h.proj,vy:Math.sin(a)*h.proj,r:9,dmg:h.damage+p.atk,pierce:1+(p.level/6|0)+blade,life:85,color:'#9c7cff'});
      AF.slashes.push({x:p.x,y:p.y,a,l:14,max:14,r:36});
    }
    if(burst){
      for(const o of [-.20,.20])AF.projectiles.push({team:'p',kind:'relicBlade',x:p.x,y:p.y,vx:Math.cos(a+o)*(h.proj*.92),vy:Math.sin(a+o)*(h.proj*.92),r:6,dmg:(h.damage+p.atk)*(.48+.08*blade),pierce:0,life:82,color:'#ffd36b'});
    }
  }
  AF.useSpecial=()=>{
    const p=AF.player;if(!AF.started||AF.paused||AF.dead||!p||p.special>0)return;
    const h=p.hero;sound()?.sfx('special',h.key);
    p.special=Math.max(150,h.specialCd-p.specialBoost);p.attackPose=24;p.attackAt=performance.now();
    if(relicCount('resonance-core'))p.echoTimer=18;
    if(h.key==='dawn'){
      const rad=155+p.range;
      AF.shockwaves.push({x:p.x,y:p.y,r:10,max:rad,l:28,color:'#ffd86a'});
      AF.cur().enemies.forEach(e=>{if(e.alive&&Math.hypot(e.x-p.x,e.y-p.y)<rad)damage(e,42+p.atk*1.8)});
      p.shield=Math.min(40,p.shield+16);p.inv=Math.max(p.inv,20);
      AF.slashes.push({art:true,kind:'dawn',x:p.x,y:p.y,a:Math.atan2(p.faceY,p.faceX),l:18,max:18});
      AF.toast('태양낙인 · 성광 폭발');
    }else{
      let dx=p.faceX,dy=p.faceY,l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;
      const sx=p.x,sy=p.y;p.x+=dx*(120+p.range*.4);p.y+=dy*(120+p.range*.4);clamp();p.inv=34;
      AF.slashes.push({x:(sx+p.x)/2,y:(sy+p.y)/2,a:Math.atan2(dy,dx),l:24,max:24,r:125,color:'#7ce8ff',art:true,kind:'night'});
      AF.cur().enemies.forEach(e=>{if(e.alive&&seg(sx,sy,p.x,p.y,e.x,e.y,e.r+45))damage(e,50+p.atk*1.8)});
      AF.toast('월영 질주 · 그림자 참격');
    }
    const gear=relicCount('time-gear');
    if(gear&&Math.random()<Math.min(.62,.22+.10*(gear-1))){
      p.special=0;
      for(let i=0;i<10;i++)AF.particles.push({x:p.x,y:p.y,vx:(Math.random()-.5)*3,vy:(Math.random()-.5)*3,l:22,color:'#6adfff'});
      setTimeout(()=>AF.toast('시간의 톱니 · 특수기 재충전'),90);
    }
  };
  const seg=(x1,y1,x2,y2,cx,cy,r)=>{const dx=x2-x1,dy=y2-y1,l=dx*dx+dy*dy;if(!l)return Math.hypot(cx-x1,cy-y1)<r;let t=((cx-x1)*dx+(cy-y1)*dy)/l;t=Math.max(0,Math.min(1,t));return Math.hypot(cx-(x1+t*dx),cy-(y1+t*dy))<r};

  function gainXp(n){const p=AF.player;p.xp+=n;if(p.xp>=p.nextXp){p.xp-=p.nextXp;p.level++;p.nextXp=Math.floor(p.nextXp*1.32);upgrade()}}
  function chooseReward(opts,title,lead){
    AF.paused=true;
    const titleEl=ui.levelUp.querySelector('h2'),leadEl=ui.levelUp.querySelector('.lead');
    titleEl.textContent=title;leadEl.textContent=lead;
    ui.upgradeCards.innerHTML='';
    opts.sort(()=>Math.random()-.5).slice(0,3).forEach(o=>{
      const b=document.createElement('button');b.className='upgrade'+(o.img?' relicChoice':'');
      b.innerHTML=(o.img?'<img class="rewardImg" src="'+o.img+'" alt=""><span class="rarity rarity-'+(o.rarity||'rare')+'">'+(o.rarity==='legendary'?'LEGENDARY':o.rarity==='epic'?'EPIC':'RARE')+' RELIC</span>':'<span class="uicon">'+o.i+'</span>')+'<b>'+o.n+'</b><p>'+o.d+'</p>';
      b.onclick=()=>{o.f(AF.player);if(o.relic)AF.addRelic(o);ui.levelUp.classList.remove('show');AF.paused=false;AF.hud()};
      ui.upgradeCards.appendChild(b);
    });
    ui.levelUp.classList.add('show');
  }
  function upgrade(){
    chooseReward([
      {i:'✦',n:'성물 증폭',d:'기본 공격 피해 +5',f:p=>p.atk+=5},
      {i:'⟲',n:'공명 가속',d:'자동 공격 간격 감소',f:p=>p.rate+=3},
      {i:'◎',n:'공간 확장',d:'특수기 범위·이동거리 증가',f:p=>p.range+=16},
      {i:'✹',n:'특수 공명',d:'특수기 재사용 대기시간 감소',f:p=>p.specialBoost+=28},
      {i:'♥',n:'생명 각인',d:'최대 체력 +20, 즉시 회복',f:p=>{p.maxHp+=20;p.hp=Math.min(p.maxHp,p.hp+28)}}
    ],'성물 공명','하나의 힘을 선택하세요.');
  }
  function treasureReward(){
    const opts=[
      {id:'relic-blade',i:'⚔',img:'../../assets/relics/relic-blade.webp?v=2',n:'유물의 칼날',d:'공격 +8 · 기본 공격 관통 +1 · 3회마다 공명 참격',rarity:'rare',relic:true,f:p=>p.atk+=8},
      {id:'dash-sigil',i:'✧',img:'../../assets/relics/dash-sigil.webp?v=2',n:'질주의 문장',d:'이속 +0.22 · 공격 가속 · 이동 중 주기적으로 질주 충격파',rarity:'rare',relic:true,f:p=>{p.speed+=.22;p.rate+=2}},
      {id:'guardian-seal',i:'◈',img:'../../assets/relics/guardian-seal.webp?v=2',n:'수호자의 인장',d:'최대 HP +28 · 피격 시 보호막과 근접 반격 충격파',rarity:'rare',relic:true,f:p=>{p.maxHp+=28;p.hp=Math.min(p.maxHp,p.hp+35)}},
      {id:'resonance-core',i:'✹',img:'../../assets/relics/resonance-core.webp?v=2',n:'공명 핵',d:'특수기 쿨 감소 · 범위 증가 · 사용 후 잔향 추가 발동',rarity:'rare',relic:true,f:p=>{p.specialBoost+=42;p.range+=10}},
      {id:'condensed-crystal',i:'◆',img:'../../assets/relics/condensed-crystal.webp?v=2',n:'응축 수정',d:'공격 +4 · 최대 HP +14 · 일정 시간마다 수정 탄막 자동 발사',rarity:'rare',relic:true,f:p=>{p.atk+=4;p.maxHp+=14;p.hp=Math.min(p.maxHp,p.hp+14)}},
      {id:'twin-grail',i:'♜',img:'../../assets/relics/twin-grail.webp?v=4',n:'쌍둥이 성배',d:'체력이 낮을수록 모든 피해 증가',rarity:'epic',relic:true,f:p=>{p.hp=Math.min(p.maxHp,p.hp+8)}},
      {id:'abyss-mirror',i:'◇',img:'../../assets/relics/abyss-mirror.webp?v=4',n:'심연의 거울',d:'적 투사체를 일정 확률로 반사해 되돌려 보냄',rarity:'epic',relic:true,f:p=>{}},
      {id:'pilgrim-lantern',i:'✦',img:'../../assets/relics/pilgrim-lantern.webp?v=4',n:'순례자의 등불',d:'일반전투·엘리트방 클리어 시 소량 회복',rarity:'rare',relic:true,f:p=>{}},
      {id:'red-vow',i:'✕',img:'../../assets/relics/red-vow.webp?v=4',n:'붉은 서약',d:'최대 HP 15% 감소 · 공격력 +14',rarity:'epic',relic:true,f:p=>{p.maxHp=Math.max(45,Math.round(p.maxHp*.85));p.hp=Math.min(p.hp,p.maxHp);p.atk+=14}},
      {id:'time-gear',i:'⌁',img:'../../assets/relics/time-gear.webp?v=4',n:'시간의 톱니',d:'특수기 사용 시 일정 확률로 쿨타임 즉시 초기화',rarity:'legendary',relic:true,f:p=>{}}
    ];
    if(AF.player.hero.key==='dawn')opts.push({id:'solar-shard',i:'☀',img:'../../assets/relics/solar-shard.webp?v=4',n:'태양의 파편',d:'Dawn 전용 · 추적 룬탄 관통 +1',rarity:'epic',relic:true,f:p=>{}});
    else opts.push({id:'eclipse-fang',i:'☾',img:'../../assets/relics/eclipse-fang.webp?v=4',n:'월식의 송곳니',d:'Night 전용 · 적 처치 시 추가 월광 칼날 발생',rarity:'epic',relic:true,f:p=>{}});
    chooseReward(opts,'보물 발견','상자에서 유물 하나를 선택하세요.');
  }
  function roomFeature(r){
    if(!r||r.used)return;
    const p=AF.player,cx=W/2,cy=arena.y+arena.h/2,d=Math.hypot(p.x-cx,p.y-cy);
    if(d>58)return;
    if(r.sealAltar&&r.clear&&!r.sealBroken){
      r.sealBroken=true;sound()?.sfx('sealBreak');
      for(let i=0;i<18;i++)AF.particles.push({x:cx+(Math.random()-.5)*54,y:cy+(Math.random()-.5)*42,vx:(Math.random()-.5)*2.1,vy:-.7-Math.random()*1.6,l:28,color:'#b69cff'});
      AF.toast('낡은 제단의 문양이 꺼졌다.');
      const remain=Object.values(AF.rooms).filter(x=>x.sealAltar&&!x.sealBroken).length;
      if(remain===0&&!AF.bossUnlocked){
        AF.bossUnlocked=true;
        const bossRoom=AF.rooms[AF.objectiveRoom];if(bossRoom)bossRoom.bossLocked=false;
        setTimeout(()=>{sound()?.sfx('gateOpen');AF.toast('어딘가에서 무거운 문이 열리는 소리가 났다.')},520);
      }
      return;
    }
    if(r.type==='treasure'){
      r.used=true;sound()?.sfx('chest');AF.toast('보물상자를 열었습니다');treasureReward();
    }else if(r.type==='recovery'){
      r.used=true;sound()?.sfx('heal');const heal=Math.max(30,Math.round(p.maxHp*.45));p.hp=Math.min(p.maxHp,p.hp+heal);p.shield=Math.min(40,p.shield+10);
      for(let i=0;i<18;i++)AF.particles.push({x:cx+(Math.random()-.5)*50,y:cy+(Math.random()-.5)*50,vx:(Math.random()-.5)*1.4,vy:-1-Math.random()*1.4,l:30,color:'#69e5b6'});
      AF.toast(`회복의 샘 · HP +${heal}`);
    }else if(r.type==='exit'&&r.clear&&!AF.transitioning){
      r.used=true;AF.transitioning=true;p.inv=Math.max(p.inv,90);sound()?.sfx('stairsDown');
      AF.toast('아래층으로 내려간다...');
      setTimeout(()=>{
        if(AF.started&&!AF.dead&&AF.cur()===r)AF.nextFloor('exit');
        AF.transitioning=false;
      },760);
    }else if(r.type==='boss'&&r.bossDefeated&&performance.now()>=(r.portalUnlockAt||0)&&!AF.transitioning){
      r.used=true;AF.transitioning=true;p.inv=Math.max(p.inv,110);sound()?.sfx('stairsDown');
      AF.toast('아래로 이어지는 계단을 내려간다...');
      if(AF.floor===12&&!AF.endless){
        setTimeout(()=>{
          if(AF.started&&!AF.dead&&AF.cur()===r)AF.finishRun();
          AF.transitioning=false;
        },820);
      }else{
        setTimeout(()=>{
          if(AF.started&&!AF.dead&&AF.cur()===r)AF.nextFloor('boss');
          AF.transitioning=false;
        },760);
      }
    }
  }
  function formatRunTime(ms){
    const sec=Math.max(0,Math.floor(ms/1000)),m=Math.floor(sec/60),s=sec%60;
    return m+':'+String(s).padStart(2,'0');
  }
  function saveClearRecord(timeMs){
    const key='abyssfallRecordsV2',hero=AF.player.hero.key;
    let all={};try{all=JSON.parse(localStorage.getItem(key)||'{}')||{}}catch(_){}
    const prev=all[hero]||{clears:0,bestTime:0,maxKills:0,bestLevel:0};
    const rec={
      clears:(prev.clears||0)+1,
      bestTime:!prev.bestTime?timeMs:Math.min(prev.bestTime,timeMs),
      maxKills:Math.max(prev.maxKills||0,AF.kills),
      bestLevel:Math.max(prev.bestLevel||0,AF.player.level)
    };
    all[hero]=rec;try{localStorage.setItem(key,JSON.stringify(all))}catch(_){}
    return rec;
  }
  AF.finishRun=()=>{
    if(AF.cleared)return;AF.cleared=true;AF.transitioning=false;AF.paused=true;AF.bossClearUntil=0;sound()?.stopMusic();sound()?.sfx('clear');
    const elapsed=performance.now()-AF.runStart,rec=saveClearRecord(elapsed),p=AF.player;
    if(ui.clearStats)ui.clearStats.innerHTML=[
      ['캐릭터',p.hero.ko],['플레이 시간',formatRunTime(elapsed)],['총 처치',AF.kills+''],['최종 레벨','Lv '+p.level]
    ].map(([a,b])=>'<div class="clearStat"><small>'+a+'</small><b>'+b+'</b></div>').join('');
    if(ui.clearRelics){
      const relics=Object.values(AF.relics);
      ui.clearRelics.innerHTML=relics.length?relics.map(r=>'<div class="clearRelic">'+(r.img?'<img src="'+r.img+'" alt="">':'')+'<span>'+r.name+'</span>'+(r.count>1?'<b>×'+r.count+'</b>':'')+'</div>').join(''):'<span class="relicEmpty">획득한 유물이 없습니다.</span>';
    }
    if(ui.clearRecord)ui.clearRecord.textContent=p.hero.ko+' 클리어 '+rec.clears+'회 · 최고 처치 '+rec.maxKills+' · 최고 Lv '+rec.bestLevel+' · 최고 기록 '+formatRunTime(rec.bestTime);
    ui.clearScreen?.classList.add('show');
  };
  AF.nextFloor=(source='exit')=>{
    AF.paused=false;sound()?.startExplore();AF.transitioning=false;AF.bossClearUntil=0;AF.floor++;
    AF.rooms=makeDungeon(AF.roomTarget());AF.current='0,0';setupFloorObjective();
    const healRate=source==='boss'?.30:source==='endless'?.38:.16;
    AF.player.x=W/2;AF.player.y=arena.y+arena.h/2;
    AF.player.hp=Math.min(AF.player.maxHp,AF.player.hp+Math.max(10,Math.round(AF.player.maxHp*healRate)));
    AF.player.inv=45;AF.projectiles=[];AF.pickups=[];AF.slashes=[];
    AF.toast(`FLOOR ${AF.floor} · ${AF.stageName()} · ${Object.keys(AF.rooms).length} ROOMS`);
    AF.hud();if((AF.floor-1)%3===0)setTimeout(()=>{if(AF.started&&!AF.dead)AF.toast(AF.stageTip())},950)
  };
  function hurt(n,nx,ny){const p=AF.player;if(p.shield>0){const b=Math.min(p.shield,n);p.shield-=b;n-=b;if(n<=0){p.inv=18;return}}p.hp-=Math.round(n);sound()?.sfx('hurt');p.inv=48;p.hurtPose=18;p.x+=nx*18;p.y+=ny*18;
    const seal=relicCount('guardian-seal');
    if(seal&&n>0&&(p.guardianCd||0)<=0){
      p.guardianCd=Math.max(170,310-(seal-1)*30);
      p.shield=Math.min(60,p.shield+8+seal*6);
      const rad=88+seal*10;
      AF.shockwaves.push({x:p.x,y:p.y,r:12,max:rad,l:24,color:'#6fe6c4'});
      AF.cur().enemies.forEach(e=>{if(e.alive&&Math.hypot(e.x-p.x,e.y-p.y)<rad)damage(e,13+seal*7+p.atk*.15)});
      AF.toast('수호자의 인장 · 반격 보호막');
    }for(let i=0;i<10;i++)AF.particles.push({x:p.x,y:p.y,vx:(Math.random()-.5)*4,vy:(Math.random()-.5)*4,l:22,color:'#ff6478'});if(p.hp<=0&&!AF.dead){p.hp=0;AF.dead=true;AF.paused=true;sound()?.stopMusic();sound()?.sfx('gameOver');p.deathAt=performance.now();ui.resultText.textContent=`${p.hero.ko} · FLOOR ${AF.floor} · Lv ${p.level} · 처치 ${AF.kills}`;setTimeout(()=>{if(AF.dead)ui.gameOver.classList.add('show')},900)}}
  function clamp(){const p=AF.player;p.x=Math.max(arena.x+p.r,Math.min(arena.x+arena.w-p.r,p.x));p.y=Math.max(arena.y+p.r,Math.min(arena.y+arena.h-p.r,p.y))}
  function enter(nk,from){
    AF.current=nk;const r=AF.cur();r.seen=true;AF.projectiles=[];AF.slashes=[];if(!r.clear)spawnRoom(r);
    const p=AF.player;if(from==='W'){p.x=arena.x+35;p.y=arena.y+arena.h/2}else if(from==='E'){p.x=arena.x+arena.w-35;p.y=arena.y+arena.h/2}else if(from==='N'){p.x=W/2;p.y=arena.y+35}else if(from==='S'){p.x=W/2;p.y=arena.y+arena.h-35}
    p.inv=r.type==='boss'?120:35;
    const msg={treasure:'보물방 · 중앙의 상자를 찾아보세요',recovery:'회복방 · 중앙의 샘에 다가가세요',elite:'엘리트방 · 강적이 문을 봉쇄했습니다',exit:'아래로 내려가는 길이 이 방 어딘가에 있다',boss:'거대한 문 너머에서 인기척이 느껴진다',combat:'일반전투방'}[r.type]||'새 방 발견';
    if(r.type==='boss'){sound()?.startBoss();sound()?.sfx('bossIntro')}
    AF.toast(msg);
  }
  function doors(){
    const p=AF.player,r=AF.cur(),g=58,mx=W/2,my=arena.y+arena.h/2;let d=null;
    if(p.x<=arena.x+p.r+1&&r.clear&&r.doors.W&&Math.abs(p.y-my)<g)d='W';
    else if(p.x>=arena.x+arena.w-p.r-1&&r.clear&&r.doors.E&&Math.abs(p.y-my)<g)d='E';
    else if(p.y<=arena.y+p.r+1&&r.clear&&r.doors.N&&Math.abs(p.x-mx)<g)d='N';
    else if(p.y>=arena.y+arena.h-p.r-1&&r.clear&&r.doors.S&&Math.abs(p.x-mx)<g)d='S';
    if(!d)return;
    const v=dirs[d],rr=AF.cur(),nk=key(rr.x+v[0],rr.y+v[1]),target=AF.rooms[nk];if(!target)return;
    if(target.type==='boss'&&!AF.bossUnlocked){
      target.seen=true;const now=performance.now();
      if(now-(AF.lockedDoorAt||0)>900){AF.lockedDoorAt=now;sound()?.sfx('gateLocked');AF.toast('문은 꿈쩍도 하지 않는다.')}
      if(d==='W')p.x+=22;else if(d==='E')p.x-=22;else if(d==='N')p.y+=22;else p.y-=22;
      return;
    }
    enter(nk,opp[d]);
  }

  const bossPhase=e=>e.hp/e.max<.34?2:e.hp/e.max<.67?1:0;
  function startBossPattern(e,p){
    const phase=bossPhase(e),alive=AF.cur().enemies.filter(x=>x.alive&&x!==e).length;
    let pool=phase===0?[0,1]:phase===1?[0,1,2]:[0,0,1,2];
    if(alive>5)pool=pool.filter(v=>v!==2);
    const pattern=pool[Math.random()*pool.length|0];
    e.bossPhase=phase;e.bossPattern=pattern;e.bossAim=Math.atan2(p.y-e.y,p.x-e.x);e.attackPose=28;
    const tele=pattern===0?46:pattern===1?58:52;
    e.bossTelegraph=e.bossTelegraphMax=tele;
    e.bossAction=pattern===0?'핏빛 창':pattern===1?'심연의 고리':'그림자 소환';sound()?.sfx('bossWarn');
  }
  function resolveBossPattern(e){
    if(!e.alive)return;sound()?.sfx('bossCast');
    const phase=e.bossPhase||0,pattern=e.bossPattern;
    if(pattern===0){
      const shots=3+phase*2,spread=.13,speed=5.2+phase*.45,dmg=e.d*(.56+phase*.06);
      for(let i=0;i<shots;i++){
        const o=(i-(shots-1)/2)*spread,a=e.bossAim+o;
        AF.projectiles.push({team:'e',kind:'bossLance',x:e.x,y:e.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r:7,dmg,life:155,color:'#ff365f'});
      }
    }else if(pattern===1){
      const n=10+phase*4,speed=3.2+phase*.32,dmg=e.d*(.48+phase*.05),off=Math.random()*Math.PI;
      for(let i=0;i<n;i++){
        const a=off+i*Math.PI*2/n;
        AF.projectiles.push({team:'e',kind:'bossOrb',x:e.x,y:e.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r:7,dmg,life:190,color:'#d858ff'});
      }
    }else{
      const n=2+phase;
      for(let i=0;i<n;i++){
        const a=i*Math.PI*2/n+Math.random()*.5,rad=78+Math.random()*30,type=phase>=2&&i===0?'brute':(Math.random()<.42?'shooter':'crawler');
        const m=enemy(e.x+Math.cos(a)*rad,e.y+Math.sin(a)*rad,type);
        m.summoned=true;m.hp*=.82+phase*.10;m.max=m.hp;m.d*=.88+phase*.08;
        AF.cur().enemies.push(m);
      }
    }
    e.bossPattern=-1;e.bossTelegraph=0;e.bossAction='추적 중';
    e.bossCd=Math.max(54,118-phase*16-Math.min(18,(AF.floor-1)*2));
  }

  AF.update=dt=>{const p=AF.player;if(p.special>0)p.special-=dt;if(p.inv>0)p.inv-=dt;if(p.attackPose>0)p.attackPose-=dt;if(p.hurtPose>0)p.hurtPose-=dt;if(p.guardianCd>0)p.guardianCd-=dt;if(p.echoTimer>0){p.echoTimer-=dt;if(p.echoTimer<=0)triggerRelicEcho()}let vx=(AF.keys.a||AF.keys.arrowleft?-1:0)+(AF.keys.d||AF.keys.arrowright?1:0),vy=(AF.keys.w||AF.keys.arrowup?-1:0)+(AF.keys.s||AF.keys.arrowdown?1:0);if(AF.joy.active&&Math.hypot(AF.joy.x,AF.joy.y)>.08){vx=AF.joy.x;vy=AF.joy.y}const moveScale=stageMoveScale(AF.cur(),p);let m=Math.hypot(vx,vy);p.moving=m>.04;if(m){vx/=m;vy/=m;p.x+=vx*p.speed*moveScale*dt;p.y+=vy*p.speed*moveScale*dt;p.faceX=vx;p.faceY=vy;p.step+=dt*.42}
    const sigil=relicCount('dash-sigil');
    if(m&&sigil){
      p.sigilCharge=(p.sigilCharge||0)+dt;
      const threshold=Math.max(38,72-(sigil-1)*7);
      if(p.sigilCharge>=threshold){
        p.sigilCharge=0;
        const rad=62+sigil*8,dmg=9+sigil*4+p.atk*.14;
        AF.slashes.push({x:p.x,y:p.y,a:Math.atan2(p.faceY,p.faceX),l:16,max:16,r:rad,color:'#ffd46f'});
        AF.cur().enemies.forEach(e=>{if(e.alive&&Math.hypot(e.x-p.x,e.y-p.y)<rad)damage(e,dmg)});
      }
    }else p.sigilCharge=Math.max(0,(p.sigilCharge||0)-dt*1.4);
    clamp();doors();const r=AF.cur();roomFeature(r);updateTrace(r);if(!r.clear)spawnRoom(r);updateStageGimmick(r,dt);clamp();
    const crystal=relicCount('condensed-crystal');
    if(crystal){
      p.crystalTimer=(p.crystalTimer??80)-dt;
      if(p.crystalTimer<=0){
        p.crystalTimer=Math.max(72,150-(crystal-1)*14);
        const target=nearest();
        if(target){
          const a=Math.atan2(target.y-p.y,target.x-p.x),dmg=8+crystal*4+p.atk*.16;
          for(const o of [-.16,0,.16])AF.projectiles.push({team:'p',kind:'crystal',x:p.x,y:p.y,vx:Math.cos(a+o)*7.4,vy:Math.sin(a+o)*7.4,r:6,dmg,pierce:0,life:105,color:'#8cecff'});
        }
      }
    }
    p.basic-=dt;if(p.basic<=0){p.basic=Math.max(11,p.hero.rate-p.rate);fireBasic()}
    for(const e of r.enemies){
      if(!e.alive)continue;
      if(e.flash>0)e.flash-=dt;if(e.attackPose>0)e.attackPose-=dt;if(e.hurtPose>0)e.hurtPose-=dt;
      const ox=e.x,oy=e.y,dx=p.x-e.x,dy=p.y-e.y,dist=Math.hypot(dx,dy)||1;e.faceX=dx;
      if(e.type==='boss'){
        const phase=bossPhase(e);
        e.bossPhase=phase;
        if(e.intro>0){
          e.intro-=dt;e.moving=false;e.bossAction='출현 중';
          if(e.intro<=0){e.intro=0;e.bossAction='추적 중';e.bossCd=48;AF.toast('심연의 감시자 · 전투 시작')}
        }else{
          if(phase>e.phaseAnnounced){e.phaseAnnounced=phase;AF.toast(phase===1?'심연의 감시자 · PHASE II':'심연의 감시자 · PHASE III')}
          if(e.bossTelegraph>0){
            e.bossTelegraph-=dt;e.moving=false;
            if(e.bossTelegraph<=0)resolveBossPattern(e);
          }else{
            e.bossCd-=dt;
            if(e.bossCd<=0)startBossPattern(e,p);
            else{
              const pace=phase===2?.72:.56;e.x+=dx/dist*e.s*pace*dt;e.y+=dy/dist*e.s*pace*dt;
            }
          }
        }
      }else if(e.type==='crawler'){
        if(e.stun>0){e.stun-=dt}
        else if(e.dash>0){
          e.x+=e.aimX*e.s*4.4*dt;e.y+=e.aimY*e.s*4.4*dt;e.dash-=dt;e.attackPose=10;
          if(e.dash<=0){e.dash=0;e.stun=10}
        }else if(e.aiWindup>0){
          e.aiWindup-=dt;e.moving=false;
          if(e.aiWindup<=0){e.aiWindup=0;e.dash=11;e.attackPose=18}
        }else{
          e.aiCd-=dt;
          if(e.aiCd<=0&&dist<225){e.aimX=dx/dist;e.aimY=dy/dist;e.aiWindup=17;e.aiCd=82+Math.random()*34}
          else{e.x+=dx/dist*e.s*dt;e.y+=dy/dist*e.s*dt}
        }
      }else if(e.type==='shooter'){
        if(e.stun>0){e.stun-=dt}
        else if(e.aiWindup>0){
          e.aiWindup-=dt;e.moving=false;
          if(e.aiWindup<=0){
            e.aiWindup=0;e.attackPose=18;
            const a=e.shotAngle,speed=4.15+Math.min(.75,(AF.floor-1)*.08);
            AF.projectiles.push({team:'e',kind:'priestBolt',x:e.x,y:e.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r:6,dmg:e.d,life:155,color:'#ff6285'});
            if(AF.floor>=3){for(const o of [-.13,.13])AF.projectiles.push({team:'e',kind:'priestBolt',x:e.x,y:e.y,vx:Math.cos(a+o)*(speed*.93),vy:Math.sin(a+o)*(speed*.93),r:5,dmg:e.d*.72,life:150,color:'#e86bff'})}
            e.fire=88+Math.random()*34;
          }
        }else{
          if(dist>225){e.x+=dx/dist*e.s*dt;e.y+=dy/dist*e.s*dt}else if(dist<155){e.x-=dx/dist*e.s*dt;e.y-=dy/dist*e.s*dt}
          e.fire-=dt;
          if(e.fire<=0&&dist<390){e.shotAngle=Math.atan2(dy,dx);e.aiWindup=28;e.fire=999;e.attackPose=12}
        }
      }else if(e.type==='brute'){
        if(e.stun>0){e.stun-=dt}
        else if(e.charge>0){
          e.x+=e.aimX*e.s*5.8*dt;e.y+=e.aimY*e.s*5.8*dt;e.charge-=dt;e.attackPose=18;
          if(e.charge<=0){e.charge=0;e.stun=26}
        }else if(e.aiWindup>0){
          e.aiWindup-=dt;e.moving=false;
          if(e.aiWindup<=0){e.aiWindup=0;e.charge=19;e.attackPose=22}
        }else{
          e.aiCd-=dt;
          if(e.aiCd<=0&&dist<345&&dist>72){e.aimX=dx/dist;e.aimY=dy/dist;e.aiWindup=35;e.aiCd=128+Math.random()*46}
          else{e.x+=dx/dist*e.s*.88*dt;e.y+=dy/dist*e.s*.88*dt}
        }
      }
      const hitWall=e.x<arena.x+e.r||e.x>arena.x+arena.w-e.r||e.y<arena.y+e.r||e.y>arena.y+arena.h-e.r;if(hitWall&&e.type==='brute'&&e.charge>0){e.charge=0;e.stun=30;AF.shockwaves.push({x:e.x,y:e.y,r:8,max:64,l:18,color:'#ff9b63'})}e.x=Math.max(arena.x+e.r,Math.min(arena.x+arena.w-e.r,e.x));e.y=Math.max(arena.y+e.r,Math.min(arena.y+arena.h-e.r,e.y));
      if(e.type!=='boss'||e.bossTelegraph<=0)e.moving=Math.hypot(e.x-ox,e.y-oy)>.08;
      const cdx=p.x-e.x,cdy=p.y-e.y,cdist=Math.hypot(cdx,cdy)||1;if(cdist<p.r+e.r&&p.inv<=0&&!(e.type==='boss'&&e.intro>0)){e.attackPose=e.type==='boss'?22:14;const mult=e.type==='brute'&&e.charge>0?1.45:e.type==='crawler'&&e.dash>0?1.18:1;hurt(e.d*mult,cdx/cdist,cdy/cdist);if(e.type==='brute'&&e.charge>0){e.charge=0;e.stun=24;AF.shockwaves.push({x:e.x,y:e.y,r:8,max:58,l:18,color:'#ff9b63'})}}
    }
    for(let i=AF.projectiles.length-1;i>=0;i--){
      const q=AF.projectiles[i];q.x+=q.vx*dt;q.y+=q.vy*dt;q.life-=dt;
      if(q.life<=0||q.x<arena.x-20||q.x>arena.x+arena.w+20||q.y<arena.y-20||q.y>arena.y+arena.h+20){AF.projectiles.splice(i,1);continue}
      if(q.team==='p'){
        const e=r.enemies.find(e=>e.alive&&Math.hypot(e.x-q.x,e.y-q.y)<e.r+q.r);
        if(e){damage(e,q.dmg);if(q.pierce>0)q.pierce--;else AF.projectiles.splice(i,1)}
      }else if(p.inv<=0&&Math.hypot(p.x-q.x,p.y-q.y)<p.r+q.r){
        const mirror=relicCount('abyss-mirror'),chance=Math.min(.55,.18+.07*Math.max(0,mirror-1));
        if(mirror&&Math.random()<chance){
          q.team='p';q.kind='reflected';q.vx*=-1.22;q.vy*=-1.22;q.dmg=q.dmg*1.25+p.atk*.22;q.pierce=0;q.life=Math.min(q.life,92);
          q.x=p.x+q.vx*2;q.y=p.y+q.vy*2;p.inv=7;
          for(let k=0;k<7;k++)AF.particles.push({x:p.x,y:p.y,vx:(Math.random()-.5)*3.4,vy:(Math.random()-.5)*3.4,l:18,color:'#9fdcff'});
        }else{hurt(q.dmg,q.vx/4,q.vy/4);AF.projectiles.splice(i,1)}
      }
    }
    for(let i=AF.pickups.length-1;i>=0;i--){const q=AF.pickups[i],dx=p.x-q.x,dy=p.y-q.y,d=Math.hypot(dx,dy)||1;q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=Math.pow(.9,dt);q.vy*=Math.pow(.9,dt);if(d<130){q.x+=dx/d*4.8*dt;q.y+=dy/d*4.8*dt}if(d<p.r+12){gainXp(q.val);AF.pickups.splice(i,1)}}
    AF.particles.forEach(q=>{q.x+=q.vx*dt;q.y+=q.vy*dt;q.l-=dt});AF.particles=AF.particles.filter(q=>q.l>0);AF.shockwaves.forEach(q=>{q.r+=(q.max-q.r)*.18*dt;q.l-=dt});AF.shockwaves=AF.shockwaves.filter(q=>q.l>0);AF.slashes.forEach(q=>q.l-=dt);AF.slashes=AF.slashes.filter(q=>q.l>0);if(r.spawned&&!r.boss&&!r.enemies.some(e=>e.alive)){
      const wasClear=r.clear;r.clear=true;if(!wasClear&&r.type==='exit')sound()?.sfx('stairsOpen');
      if(!wasClear){
        const lantern=relicCount('pilgrim-lantern');
        if(lantern&&(r.type==='combat'||r.type==='elite')){
          const before=p.hp,heal=Math.max(4,Math.round(p.maxHp*(.045+.02*(lantern-1))));
          p.hp=Math.min(p.maxHp,p.hp+heal);
          if(p.hp>before)AF.toast('순례자의 등불 · HP +'+Math.round(p.hp-before));
        }
      }
      if(!wasClear&&r.type==='elite'&&!r.eliteRewarded){
        r.eliteRewarded=true;
        const bonus=8+AF.floor*2;gainXp(bonus);
        for(let i=0;i<4;i++)AF.pickups.push({x:W/2+(i-1.5)*22,y:arena.y+arena.h/2,vx:(Math.random()-.5)*1.4,vy:(Math.random()-.5)*1.4,val:2});
        AF.toast(`엘리트 격파 · 공명 +${bonus}`);
      }
    }AF.hud()};

  AF.addRelic=o=>{
    const id=o.id||o.n,prev=AF.relics[id];
    AF.relics[id]={id:id,name:o.n,icon:o.i,img:o.img||prev?.img||'',effect:o.d||prev?.effect||'',count:(prev?.count||0)+1};
    if(ui.relicFlash){
      if(ui.relicFlashIcon){ui.relicFlashIcon.src=o.img||'';ui.relicFlashIcon.alt=o.n;}
      ui.relicFlashName.textContent=(prev?'유물 강화 · ':'유물 획득 · ')+o.n+(prev?' ×'+(prev.count+1):'');
      ui.relicFlash.classList.add('show');
      clearTimeout(AF._relicFlashTimer);
      AF._relicFlashTimer=setTimeout(()=>ui.relicFlash.classList.remove('show'),1600);
    }
    AF.drawRelics();sound()?.sfx('relic');
    AF.toast((prev?'유물 강화 · ':'유물 획득 · ')+o.n);
  };
  AF.drawRelics=()=>{
    const relics=Object.values(AF.relics),total=relics.reduce((n,r)=>n+r.count,0);
    if(ui.relicCount)ui.relicCount.textContent=total;
    if(!ui.relicList)return;
    ui.relicList.innerHTML='';
    if(!relics.length){const empty=document.createElement('span');empty.className='relicEmpty';empty.textContent='아직 획득한 유물이 없습니다.';ui.relicList.appendChild(empty);return}
    relics.forEach(r=>{const chip=document.createElement('div');chip.className='relicChip';chip.title=r.name+' · '+(r.effect||'');chip.innerHTML=(r.img?'<img class="relicImage" src="'+r.img+'" alt="">':'<span class="relicIcon">'+r.icon+'</span>')+'<span class="relicInfo"><span class="relicName">'+r.name+'</span><small>'+(r.effect||'')+'</small></span>'+(r.count>1?'<b>×'+r.count+'</b>':'');ui.relicList.appendChild(chip)});
  };

  AF.hud=()=>{const p=AF.player;if(!p)return;const r=AF.cur();ui.floorText.textContent=`${AF.floor}F · ${AF.stageName()}`;ui.roomText.textContent=`ROOM ${AF.current} · ${AF.roomLabel(r)}`;ui.killText.textContent=AF.kills;ui.hpText.textContent=Math.max(0,Math.round(p.hp));ui.levelText.textContent=p.level;ui.enemyText.textContent=r.enemies.filter(e=>e.alive).length;ui.hpFill.style.width=`${Math.max(0,p.hp/p.maxHp*100)}%`;ui.xpFill.style.width=`${Math.max(0,p.xp/p.nextXp*100)}%`;
    const total=Math.max(150,p.hero.specialCd-p.specialBoost),remain=Math.max(0,p.special),seconds=remain/60,ready=remain<=0,progress=ready?1:Math.max(0,Math.min(1,1-remain/total));
    ui.specialCdText.textContent=ready?'READY':seconds<10?seconds.toFixed(1)+'s':Math.ceil(seconds)+'s';
    ui.specialBtn.classList.toggle('cooling',!ready);ui.specialBtn.classList.toggle('ready',ready);
    ui.specialBtn.style.setProperty('--cd',(progress*100).toFixed(1)+'%');
    if(ui.specialBtnTimer)ui.specialBtnTimer.textContent=ready?'READY':seconds.toFixed(seconds<10?1:0);
    const ability=ui.specialCdText.closest('.ability');if(ability){ability.classList.toggle('skillReady',ready);ability.classList.toggle('skillCooling',!ready)}
  };
  let toastTimer;AF.toast=t=>{ui.toast.textContent=t;ui.toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>ui.toast.classList.remove('show'),1100)};
})();