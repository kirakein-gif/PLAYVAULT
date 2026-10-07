(() => {
'use strict';

const $=id=>document.getElementById(id);
const canvas=$('game'),ctx=canvas.getContext('2d'),W=960,H=540;
const mapCanvas=$('mapCanvas'),mctx=mapCanvas.getContext('2d');
const ui={
  start:$('start'),startBtn:$('startBtn'),gameOver:$('gameOver'),retryBtn:$('retryBtn'),
  chapterClear:$('chapterClear'),clearAgain:$('clearAgain'),clearStats:$('clearStats'),
  roomTitle:$('roomTitle'),roomHint:$('roomHint'),heroHint:$('heroHint'),
  ethanHud:$('ethanHud'),noahHud:$('noahHud'),ethanHp:$('ethanHp'),noahHp:$('noahHp'),
  ethanHpText:$('ethanHpText'),noahHpText:$('noahHpText'),toast:$('toast'),
  mapPanel:$('mapPanel'),mapBtn:$('mapBtn'),soundBtn:$('soundBtn'),
  jumpBtn:$('jumpBtn'),attackBtn:$('attackBtn'),swapBtn:$('swapBtn'),useBtn:$('useBtn')
};

function fit(){
  const s=Math.min(innerWidth/W,innerHeight/H);
  canvas.style.width=Math.floor(W*s)+'px';
  canvas.style.height=Math.floor(H*s)+'px';
}
fit();addEventListener('resize',fit);

const HEROES={
  ethan:{key:'ethan',name:'Ethan',ko:'에단',maxHp:120,speed:2.95,jump:10.9,w:42,h:68,attackCd:24,gravity:.70,maxFall:13.5,accelGround:.42,accelAir:.22,friction:.82,coyote:6,jumpBuffer:7,color:'#e2d7b9',accent:'#e7c66f',detail:'#74d8ef'},
  noah:{key:'noah',name:'Noah',ko:'노아',maxHp:95,speed:3.85,jump:13.1,w:39,h:64,attackCd:18,gravity:.57,maxFall:13.8,accelGround:.68,accelAir:.40,friction:.60,coyote:8,jumpBuffer:8,color:'#252943',accent:'#72dcef',detail:'#8f70c7'}
};

const state={
  started:false,paused:true,current:'gate',active:'ethan',visited:new Set(),kills:0,startTime:0,
  elevatorOn:false,cellarOpen:false,bossDead:false,bellRung:false,chapterClear:false,
  checkpoint:{room:'gate',x:120},mapOpen:false,sound:true,swapLock:0,
  roomState:{},projectiles:[],enemyShots:[],fx:[],keys:{},lastError:0
};
const heroes={
  ethan:{hp:120,alive:true,x:120,y:0,vx:0,vy:0,onGround:false,face:1,attack:0,inv:0,anim:0,coyote:0,jumpBuffer:0,land:0,w:HEROES.ethan.w,h:HEROES.ethan.h},
  noah:{hp:95,alive:true,x:120,y:0,vx:0,vy:0,onGround:false,face:1,attack:0,inv:0,anim:0,coyote:0,jumpBuffer:0,land:0,w:HEROES.noah.w,h:HEROES.noah.h}
};
function syncHeroBody(k){
  const h=heroes[k],d=HEROES[k];
  h.w=d.w;h.h=d.h;
  if(!Number.isFinite(h.x))h.x=120;
  if(!Number.isFinite(h.y))h.y=(ROOMS?.[state?.current]?.ground||470)-d.h;
  return h;
}

const room=(id,name,mx,my,zone,opts={})=>({id,name,mx,my,zone,ground:opts.ground??470,platforms:opts.platforms||[],L:opts.L||null,R:opts.R||null,objects:opts.objects||[],enemy:opts.enemy||[],trace:opts.trace||'',secret:opts.secret||null,boss:!!opts.boss});
const ROOMS={
  gate:room('gate','성문 앞',0,3,'gate',{R:'outer',enemy:[]}),
  outer:room('outer','무너진 바깥 회랑',0,2,'gate',{L:'gate',R:'stair',enemy:['crawler','crawler'],secret:{x:174,to:'secret1',side:'wall'}}),
  stair:room('stair','끊어진 계단',0,1,'gate',{L:'outer',R:'central',platforms:[[300,405,120,16],[510,335,125,16],[710,285,100,16]],enemy:['bat','crawler'],trace:'벽의 흠집은 위쪽으로 이어져 있다.'}),
  central:room('central','중앙홀',0,0,'hall',{L:'west1',R:'east1',platforms:[[410,390,140,14]],objects:[
    {type:'elevator',x:480,y:390},{type:'cellar',x:230,y:470},{type:'north',x:755,y:470},{type:'rest',x:105,y:470}
  ],enemy:[],trace:'멈춘 시계의 초침이 12시를 가리키고 있다.'}),

  west1:room('west1','서쪽 회랑',-1,0,'chapel',{L:'west2',R:'central',enemy:['guard','crawler']}),
  west2:room('west2','회랑의 갈림길',-2,0,'chapel',{L:'west3',R:'west1',platforms:[[220,365,150,14],[590,330,140,14]],enemy:['bat','guard']}),
  west3:room('west3','부서진 회랑',-3,0,'chapel',{L:'chapel1',R:'west2',enemy:['crawler','crawler','priest']}),
  chapel1:room('chapel1','작은 예배당',-4,0,'chapel',{L:'chapel2',R:'west3',objects:[{type:'rest',x:135,y:470}],enemy:['guard','bat'],trace:'첫 번째 종은 울리지 않았다.'}),
  chapel2:room('chapel2','성유물 회랑',-5,0,'chapel',{L:'device',R:'chapel1',platforms:[[335,365,120,14],[610,315,140,14]],enemy:['priest','guard']}),
  device:room('device','빛이 죽은 제단',-6,0,'chapel',{R:'chapel2',objects:[{type:'device',x:710,y:470}],enemy:['guard','guard'],trace:'빛이 끊긴 뒤에도 문은 안에서 잠겼다.'}),

  east1:room('east1','동쪽 회랑',1,0,'library',{L:'central',R:'east2',enemy:['crawler','bat']}),
  east2:room('east2','서고 입구',2,0,'library',{L:'east1',R:'archive',platforms:[[260,370,130,14],[560,320,150,14]],enemy:['priest','bat']}),
  archive:room('archive','무너진 서고',3,0,'library',{L:'east2',enemy:['guard','priest','crawler'],secret:{x:790,to:'secret2',side:'wall'},trace:'같은 이름이 세 번 지워져 있다.'}),
  upper1:room('upper1','상층 서고',1,-1,'library',{R:'upper2',objects:[{type:'elevatorBack',x:110,y:470}],platforms:[[230,390,130,14],[480,330,130,14],[715,275,110,14]],enemy:['bat','bat','priest']}),
  upper2:room('upper2','끊어진 발코니',2,-1,'library',{L:'upper1',R:'bellwork',platforms:[[170,390,120,14],[370,330,105,14],[585,270,120,14],[760,215,90,14]],enemy:['bat','guard']}),
  bellwork:room('bellwork','낡은 권양실',3,-1,'library',{L:'upper2',platforms:[[180,400,120,14],[420,340,120,14],[655,270,125,14]],objects:[{type:'lever',x:720,y:270}],enemy:['priest','bat'],trace:'아래쪽 돌문에는 손잡이가 없다.'}),

  cellar:room('cellar','지하 계단',0,1,'crypt',{R:'drain',objects:[{type:'cellarBack',x:100,y:470}],enemy:['crawler','crawler']}),
  drain:room('drain','마른 수로',1,1,'crypt',{L:'cellar',R:'ossuary',platforms:[[280,390,120,14],[620,385,130,14]],enemy:['crawler','bat','crawler']}),
  ossuary:room('ossuary','납골당',2,1,'crypt',{L:'drain',R:'prison',enemy:['guard','guard','bat'],secret:{x:180,to:'secret3',side:'wall'},trace:'이름을 적지 마라.'}),
  prison:room('prison','빈 감옥',3,1,'crypt',{L:'ossuary',R:'tomb1',platforms:[[220,360,110,14],[480,310,110,14],[725,360,100,14]],enemy:['priest','crawler','guard']}),
  tomb1:room('tomb1','묘실 앞 회랑',4,1,'crypt',{L:'prison',R:'hiddenchapel',enemy:['guard','guard','priest']}),
  hiddenchapel:room('hiddenchapel','검은 예배실',5,1,'crypt',{L:'tomb1',R:'cryptj',objects:[{type:'rest',x:120,y:470}],enemy:['bat','priest'],trace:'둘을 함께 들여보내지 마라.'}),
  cryptj:room('cryptj','지하 갈림길',6,1,'crypt',{L:'hiddenchapel',R:'ante',enemy:['crawler','guard','bat']}),
  ante:room('ante','문지기의 전실',7,1,'crypt',{L:'cryptj',R:'gatehall',enemy:['guard','priest','guard'],trace:'문은 바깥을 막기 위해 세운 것이 아니다.'}),
  gatehall:room('gatehall','검은 철문',8,1,'boss',{L:'ante',R:'boss',enemy:[]}),
  boss:room('boss','문지기의 방',9,1,'boss',{L:'gatehall',R:'after',boss:true,enemy:[]}),
  after:room('after','종 아래의 방',10,1,'boss',{L:'boss',objects:[{type:'shortcut',x:770,y:470}],enemy:[],trace:'종줄은 끊겨 있는데 종은 흔들리고 있다.'}),

  secret1:room('secret1','벽 뒤의 작은 방',-1,2,'secret',{objects:[{type:'secretBack',x:790,y:470,to:'outer'}],enemy:[],trace:'여기에도 문이 있었다.'}),
  secret2:room('secret2','찢긴 기록실',3,-2,'secret',{objects:[{type:'secretBack',x:155,y:470,to:'archive'}],enemy:[],trace:'기록은 마지막 장에서 거꾸로 시작한다.'}),
  secret3:room('secret3','봉해진 묘실',2,2,'secret',{objects:[{type:'secretBack',x:790,y:470,to:'ossuary'}],enemy:[],trace:'세 번째 관에는 아무것도 없었다.'})
};

const zonePalette={
  gate:{sky:'#0e1019',wall:'#282a31',floor:'#37353a',accent:'#827563'},
  hall:{sky:'#111018',wall:'#332f34',floor:'#3d393a',accent:'#9c8867'},
  chapel:{sky:'#111018',wall:'#342f34',floor:'#403a3b',accent:'#b08b5a'},
  library:{sky:'#0d1118',wall:'#2b3038',floor:'#363b41',accent:'#6b7890'},
  crypt:{sky:'#090d10',wall:'#22292d',floor:'#2d3335',accent:'#64716b'},
  boss:{sky:'#0c090e',wall:'#2d242d',floor:'#362f34',accent:'#805d67'},
  secret:{sky:'#08090d',wall:'#25252b',floor:'#303035',accent:'#756d7d'}
};

function roomState(id){
  if(!state.roomState[id]) state.roomState[id]={spawned:false,enemies:[],secretHp:3,secretOpen:false,traceSeen:false};
  return state.roomState[id];
}
function hero(){return syncHeroBody(state.active)}
function otherKey(){return state.active==='ethan'?'noah':'ethan'}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function activeRoom(){return ROOMS[state.current]}

const audio={
  ctx:null,master:null,amb:null,muted:false,nodes:[],
  init(){
    if(this.ctx)return;
    const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
    this.ctx=new C();this.master=this.ctx.createGain();this.master.gain.value=.72;this.master.connect(this.ctx.destination);
  },
  unlock(){this.init();if(this.ctx?.state==='suspended')this.ctx.resume();if(!this.nodes.length)this.ambient()},
  tone(freq,dur=.12,vol=.06,type='sine',slide=0,when=0){
    if(!state.sound)return;this.init();if(!this.ctx)return;
    const t=this.ctx.currentTime+when,o=this.ctx.createOscillator(),g=this.ctx.createGain();
    o.type=type;o.frequency.setValueAtTime(freq,t);if(slide)o.frequency.linearRampToValueAtTime(Math.max(35,freq+slide),t+dur);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.001,vol),t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g);g.connect(this.master);o.start(t);o.stop(t+dur+.03);
  },
  noise(dur=.08,vol=.035,cut=900,when=0){
    if(!state.sound)return;this.init();if(!this.ctx)return;
    const n=Math.floor(this.ctx.sampleRate*dur),b=this.ctx.createBuffer(1,n,this.ctx.sampleRate),d=b.getChannelData(0);
    for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
    const s=this.ctx.createBufferSource(),f=this.ctx.createBiquadFilter(),g=this.ctx.createGain();
    f.type='lowpass';f.frequency.value=cut;g.gain.value=vol;s.buffer=b;s.connect(f);f.connect(g);g.connect(this.master);s.start(this.ctx.currentTime+when);
  },
  ambient(){
    if(!this.ctx)return;
    for(const [f,v,t] of [[73.4,.012,'sine'],[110,.008,'triangle']]){
      const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.frequency.value=f;o.type=t;g.gain.value=v;o.connect(g);g.connect(this.master);o.start();this.nodes.push(o,g);
    }
  },
  sfx(n){
    if(n==='jump'){this.tone(240,.08,.045,'triangle',65)}
    else if(n==='land'){this.noise(.055,.028,520);this.tone(90,.055,.018,'triangle',-18)}
    else if(n==='ethan'){this.tone(520,.07,.038,'sine',95)}
    else if(n==='noah'){this.tone(330,.08,.048,'triangle',-110);this.noise(.05,.025,1500)}
    else if(n==='switch'){this.tone(392,.12,.045,'sine',110)}
    else if(n==='hit'){this.noise(.05,.04,1200);this.tone(120,.05,.025,'triangle',-25)}
    else if(n==='hurt'){this.noise(.10,.07,800);this.tone(100,.12,.055,'sawtooth',-35)}
    else if(n==='clunk'){this.tone(92,.16,.09,'square',-22);this.noise(.12,.07,500)}
    else if(n==='chain'){this.noise(.28,.07,700);this.tone(128,.30,.055,'triangle',-35,.05)}
    else if(n==='stone'){this.noise(.34,.085,460);this.tone(80,.36,.065,'sine',-25)}
    else if(n==='bell'){this.tone(196,.9,.10,'sine',-18);this.tone(392,1.1,.055,'sine',-35,.04)}
    else if(n==='secret'){this.noise(.14,.07,620);this.tone(150,.12,.035,'triangle',-60)}
    else if(n==='rest'){this.tone(330,.18,.04,'sine');this.tone(440,.28,.035,'sine',0,.08)}
  }
};

let toastTimer;
function toast(t,ms=1300){ui.toast.textContent=t;ui.toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>ui.toast.classList.remove('show'),ms)}

function spawnRoom(id){
  const r=ROOMS[id],rs=roomState(id);if(rs.spawned)return;rs.spawned=true;
  if(r.boss&&!state.bossDead){
    rs.enemies=[makeEnemy('gatekeeper',700,r.ground-92)];
    return;
  }
  rs.enemies=r.enemy.map((type,i)=>makeEnemy(type,260+i*145+(Math.random()*55|0),r.ground-(type==='bat'?145:enemyDef(type).h)));
}
function enemyDef(type){
  return {
    crawler:{w:30,h:27,hp:30,s:1.15,d:8},
    guard:{w:35,h:55,hp:58,s:.72,d:12},
    bat:{w:32,h:24,hp:24,s:1.15,d:7},
    priest:{w:31,h:52,hp:44,s:.62,d:9},
    gatekeeper:{w:70,h:92,hp:460,s:.55,d:18}
  }[type];
}
function makeEnemy(type,x,y){
  const d=enemyDef(type);
  return {type,x,y,w:d.w,h:d.h,hp:d.hp,maxHp:d.hp,s:d.s,d:d.d,alive:true,face:-1,cd:45+Math.random()*60,shot:50+Math.random()*70,phase:Math.random()*6.28,wind:0,inv:0,deadAt:0};
}

function newGame(){
  state.started=true;state.paused=false;state.current='gate';state.active='ethan';state.visited=new Set(['gate']);state.kills=0;state.startTime=performance.now();
  state.elevatorOn=false;state.cellarOpen=false;state.bossDead=false;state.bellRung=false;state.chapterClear=false;state.swapLock=0;state.checkpoint={room:'gate',x:120};state.roomState={};state.projectiles=[];state.enemyShots=[];state.fx=[];
  for(const k of Object.keys(heroes)){const d=HEROES[k];Object.assign(heroes[k],{hp:d.maxHp,alive:true,x:120,y:ROOMS.gate.ground-d.h,vx:0,vy:0,onGround:true,face:1,attack:0,inv:0,anim:0,coyote:d.coyote,jumpBuffer:0,land:0,w:d.w,h:d.h})}
  spawnRoom('gate');ui.start.classList.remove('show');ui.gameOver.classList.remove('show');ui.chapterClear.classList.remove('show');audio.unlock();toast('성의 문이 다시 열렸다.',1700);updateHud();
}
function retry(){
  state.paused=false;state.current=state.checkpoint.room;state.active='ethan';state.projectiles=[];state.enemyShots=[];state.fx=[];
  for(const k of Object.keys(heroes)){const h=heroes[k],d=HEROES[k];Object.assign(h,{hp:d.maxHp,alive:true,x:state.checkpoint.x,y:activeRoom().ground-d.h,vx:0,vy:0,onGround:true,inv:80,coyote:d.coyote,jumpBuffer:0,land:0,w:d.w,h:d.h})}
  ui.gameOver.classList.remove('show');state.visited.add(state.current);spawnRoom(state.current);toast('불이 아직 꺼지지 않았다.');updateHud();
}
function switchHero(){
  if(state.paused||state.swapLock>0)return;
  const next=otherKey();if(!heroes[next].alive){toast('대답이 없다.');return}
  const a=hero(),b=syncHeroBody(next),cx=a.x+a.w/2,cy=a.y+a.h*.55;
  b.x=a.x;b.y=a.y+a.h-b.h;b.vx=a.vx*.82;b.vy=a.vy;b.face=a.face;b.inv=Math.max(b.inv,18);
  b.coyote=Math.max(b.coyote||0,a.coyote||0);b.jumpBuffer=0;state.swapLock=11;state.active=next;
  state.fx.push({type:'swap',x:cx,y:cy,life:18,max:18,color:HEROES[next].accent});
  audio.sfx('switch');updateHud();
}
function changeRoom(id,spawnX=null){
  if(!ROOMS[id])return;
  const from=state.current;state.current=id;state.visited.add(id);state.projectiles=[];state.enemyShots=[];spawnRoom(id);
  const h=hero(),r=ROOMS[id],d=HEROES[state.active];
  h.x=spawnX??(ROOMS[from]?.R===id?44:ROOMS[from]?.L===id?W-d.w-44:110);
  h.y=r.ground-d.h;h.vx=0;h.vy=0;h.onGround=true;h.inv=Math.max(h.inv,35);
  {const ok=otherKey(),o=syncHeroBody(ok);o.x=clamp(h.x-h.face*48,8,W-o.w-8);o.y=h.y+h.h-o.h;}
  toast(r.name,700);updateHud();
}
function killHero(){
  const h=hero();h.alive=false;h.hp=0;
  const next=otherKey();
  if(heroes[next].alive){setTimeout(()=>{if(state.started&&!state.paused){state.active=next;heroes[next].x=h.x;heroes[next].y=h.y;heroes[next].inv=90;toast((h===heroes.ethan?'에단':'노아')+'의 발소리가 멎었다.');updateHud()}},250)}
  else{state.paused=true;setTimeout(()=>ui.gameOver.classList.add('show'),450)}
}
function hurt(n,dir){
  const h=hero();if(h.inv>0||!h.alive)return;h.hp=Math.max(0,h.hp-Math.round(n));h.inv=50;h.vx+=dir*4.5;h.vy=-3.5;audio.sfx('hurt');if(h.hp<=0)killHero();updateHud();
}

function doJump(){
  if(state.paused)return;const h=hero(),d=HEROES[state.active];h.jumpBuffer=d.jumpBuffer;
}
function releaseJump(){
  if(state.paused)return;const h=hero();if(h.vy<-3.2)h.vy*=.58;
}
function consumeBufferedJump(h,d){
  if((h.jumpBuffer||0)<=0||!(h.onGround||(h.coyote||0)>0))return false;
  h.jumpBuffer=0;h.coyote=0;h.onGround=false;h.vy=-d.jump;
  state.fx.push({type:'jumpDust',x:h.x+h.w/2,y:h.y+h.h,life:12,max:12,color:d.accent});
  audio.sfx('jump');return true;
}
function doAttack(){
  if(state.paused)return;const h=hero(),d=HEROES[state.active];if(h.attack>0||!h.alive)return;
  h.attack=d.attackCd;
  if(state.active==='ethan'){
    const px=h.x+h.w/2+h.face*27,py=h.y+h.h*.42;
    state.projectiles.push({x:px,y:py,vx:h.face*9.8,vy:0,r:5,dmg:19,life:100,color:'#e7c66f'});
    state.fx.push({type:'muzzle',x:px,y:py,face:h.face,life:8,max:8,color:'#e7c66f'});
    h.vx-=h.face*(h.onGround?.38:.18);audio.sfx('ethan');
  }else{
    h.vx=clamp(h.vx+h.face*(h.onGround?3.2:1.6),-6.2,6.2);
    const hit={x:h.face>0?h.x+h.w-2:h.x-68,y:h.y+5,w:70,h:46,dmg:25,life:9,face:h.face};
    state.fx.push({type:'slash',...hit,max:9,color:'#72dcef'});hitEnemiesBox(hit);audio.sfx('noah');
  }
  hitSecretWall();
}
function hitSecretWall(){
  const r=activeRoom(),rs=roomState(r.id);if(!r.secret||rs.secretOpen)return;
  const h=hero(),sx=r.secret.x;if(Math.abs((h.x+h.w/2)-sx)<90){
    rs.secretHp--;audio.sfx('secret');state.fx.push({type:'dust',x:sx,y:r.ground-70,life:18});
    if(rs.secretHp<=0){rs.secretOpen=true;toast('벽 뒤에서 차가운 공기가 새어 나온다.');}
  }
}
function hitEnemiesBox(box){
  for(const e of roomState(state.current).enemies){if(!e.alive||e.inv>0)continue;if(rects(box,e)){damageEnemy(e,box.dmg)}}
}
function damageEnemy(e,n){
  if(!e.alive||e.inv>0)return;e.hp-=n;e.inv=5;audio.sfx('hit');state.fx.push({type:'spark',x:e.x+e.w/2,y:e.y+e.h/2,life:12,color:HEROES[state.active].accent});
  if(e.hp<=0){e.hp=0;e.alive=false;e.deadAt=performance.now();state.kills++;if(e.type==='gatekeeper')bossDefeated()}
}
function bossDefeated(){
  state.bossDead=true;state.bellRung=true;audio.sfx('bell');toast('어딘가에서 종이 한 번 울렸다.',2200);
  state.fx.push({type:'quake',life:70});
}

function nearestObject(){
  const r=activeRoom(),h=hero(),cx=h.x+h.w/2,cy=h.y+h.h;
  let best=null,bd=9999;
  for(const o of r.objects){
    const oy=o.y??r.ground,dist=Math.hypot(cx-o.x,cy-oy);
    if(dist<bd){bd=dist;best=o}
  }
  if(r.secret&&roomState(r.id).secretOpen){const o={type:'secret',x:r.secret.x,y:r.ground,to:r.secret.to};const d=Math.abs(cx-o.x);if(d<bd){bd=d;best=o}}
  return bd<92?best:null;
}
function interact(){
  if(state.paused)return;const r=activeRoom(),o=nearestObject();
  if(o){
    if(o.type==='device'){
      if(state.elevatorOn){toast('장치는 이미 빛을 잃었다.');return}
      if(state.active!=='ethan'){audio.sfx('clunk');toast('문양이 잠깐 흔들리다 사라진다.');return}
      state.elevatorOn=true;audio.sfx('chain');toast('멀리서 쇠사슬이 움직이는 소리가 난다.',1700);return;
    }
    if(o.type==='elevator'){
      if(!state.elevatorOn){audio.sfx('clunk');toast('낡은 승강기는 움직이지 않는다.');return}
      audio.sfx('chain');changeRoom('upper1',130);return;
    }
    if(o.type==='elevatorBack'){audio.sfx('chain');changeRoom('central',475);return}
    if(o.type==='lever'){
      if(state.cellarOpen){toast('레버는 아래쪽에 고정되어 있다.');return}
      if(state.active!=='noah'){audio.sfx('clunk');toast('손이 닿지만 움직이지 않는다.');return}
      state.cellarOpen=true;audio.sfx('stone');toast('아래에서 돌이 긁히는 소리가 났다.',1700);return;
    }
    if(o.type==='cellar'){
      if(!state.cellarOpen){audio.sfx('clunk');toast('돌문은 꿈쩍도 하지 않는다.');return}
      audio.sfx('stone');changeRoom('cellar',120);return;
    }
    if(o.type==='cellarBack'){audio.sfx('stone');changeRoom('central',250);return}
    if(o.type==='north'){
      if(!state.bellRung){audio.sfx('clunk');toast('문 너머는 조용하다.');return}
      finishChapter();return;
    }
    if(o.type==='rest'){
      state.checkpoint={room:r.id,x:o.x+45};
      for(const k of Object.keys(heroes)){heroes[k].alive=true;heroes[k].hp=HEROES[k].maxHp}
      audio.sfx('rest');toast('불이 아직 꺼지지 않았다.');updateHud();return;
    }
    if(o.type==='shortcut'){
      if(!state.bossDead){audio.sfx('clunk');return}
      audio.sfx('chain');changeRoom('central',760);toast('오래된 승강기가 위로 움직인다.');return;
    }
    if(o.type==='secret'||o.type==='secretBack'){audio.sfx('stone');changeRoom(o.to, o.x<400?W-110:110);return}
  }
  if(r.trace&&!roomState(r.id).traceSeen){const h=hero();if(Math.abs((h.x+h.w/2)-(W-88))<92){roomState(r.id).traceSeen=true;toast(r.trace,1900);return}}
}
function finishChapter(){
  if(state.chapterClear)return;state.chapterClear=true;state.paused=true;
  const sec=Math.floor((performance.now()-state.startTime)/1000),m=Math.floor(sec/60),s=String(sec%60).padStart(2,'0');
  ui.clearStats.innerHTML='<span>시간 <b>'+m+':'+s+'</b></span><span>방문 <b>'+state.visited.size+'/30</b></span><span>처치 <b>'+state.kills+'</b></span>';
  ui.chapterClear.classList.add('show');
}

function rects(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function platformPhysics(h,d,r,dt){
  const prevY=h.y,wasGround=h.onGround,fallSpeed=h.vy;
  h.vy+=d.gravity*dt;h.vy=Math.min(h.vy,d.maxFall);
  h.x+=h.vx*dt;h.y+=h.vy*dt;
  h.onGround=false;
  if(h.y+h.h>=r.ground){h.y=r.ground-h.h;h.vy=0;h.onGround=true}
  for(const p of r.platforms){
    const [px,py,pw,ph]=p;
    const wasBottom=prevY+h.h,nowBottom=h.y+h.h;
    if(h.vy>=0&&h.x+h.w>px&&h.x<px+pw&&wasBottom<=py+3&&nowBottom>=py){h.y=py-h.h;h.vy=0;h.onGround=true}
  }
  if(!wasGround&&h.onGround&&fallSpeed>3.8){
    h.land=Math.min(9,3+fallSpeed*.42);
    state.fx.push({type:'landDust',x:h.x+h.w/2,y:h.y+h.h,life:14,max:14,color:d.accent});
    if(fallSpeed>6)audio.sfx('land');
  }
  h.x=clamp(h.x,-28,W-h.w+28);
}

function updatePlayer(dt){
  const h=hero(),d=HEROES[state.active],k=state.keys;
  if(state.swapLock>0)state.swapLock-=dt;if(h.attack>0)h.attack-=dt;if(h.inv>0)h.inv-=dt;if(h.land>0)h.land-=dt;
  if(h.onGround)h.coyote=d.coyote;else h.coyote=Math.max(0,(h.coyote||0)-dt);
  if(h.jumpBuffer>0)h.jumpBuffer-=dt;
  consumeBufferedJump(h,d);
  let dir=(k.left?-1:0)+(k.right?1:0);
  const accel=h.onGround?d.accelGround:d.accelAir,target=dir*d.speed,blend=Math.min(1,accel*dt);
  h.vx+=(target-h.vx)*blend;
  if(!dir)h.vx*=Math.pow(d.friction,dt);else h.face=dir>0?1:-1;
  platformPhysics(h,d,activeRoom(),dt);
  h.anim+=Math.abs(h.vx)*dt*(state.active==='noah'?.22:.17);

  if(h.x<-18){
    const to=activeRoom().L;if(to)changeRoom(to,W-d.w-48);else h.x=-18;
  }else if(h.x+h.w>W+18){
    const r=activeRoom(),to=r.R;
    if(r.id==='boss'&&to==='after'&&!state.bossDead){h.x=W-h.w-18;audio.sfx('clunk')}
    else if(to)changeRoom(to,44);else h.x=W-h.w+18;
  }
  {const ok=otherKey(),o=syncHeroBody(ok),tx=clamp(h.x-h.face*50,8,W-o.w-8),ty=h.y+h.h-o.h;
   const follow=Math.min(1,.18*dt);o.x+=(tx-o.x)*follow;o.y+=(ty-o.y)*Math.min(1,.24*dt);o.face=h.face;}
}
function updateProjectiles(dt){
  for(const q of state.projectiles){q.x+=q.vx*dt;q.y+=q.vy*dt;q.life-=dt;
    for(const e of roomState(state.current).enemies){if(e.alive&&q.life>0&&circleRect(q,e)){damageEnemy(e,q.dmg);q.life=0;break}}
  }
  state.projectiles=state.projectiles.filter(q=>q.life>0&&q.x>-30&&q.x<W+30);
  for(const q of state.enemyShots){q.x+=q.vx*dt;q.y+=q.vy*dt;q.life-=dt;const h=hero();if(q.life>0&&circleRect(q,h)){q.life=0;hurt(q.dmg,q.vx>0?1:-1)}}
  state.enemyShots=state.enemyShots.filter(q=>q.life>0&&q.x>-40&&q.x<W+40);
}
function circleRect(c,r){const x=clamp(c.x,r.x,r.x+r.w),y=clamp(c.y,r.y,r.y+r.h);return Math.hypot(c.x-x,c.y-y)<(c.r||5)}

function updateEnemies(dt){
  const h=hero(),r=activeRoom(),rs=roomState(r.id);
  for(const e of rs.enemies){
    if(!e.alive)continue;if(e.inv>0)e.inv-=dt;
    const dx=(h.x+h.w/2)-(e.x+e.w/2),dy=(h.y+h.h/2)-(e.y+e.h/2),dist=Math.hypot(dx,dy)||1;e.face=dx>=0?1:-1;
    if(e.type==='bat'){
      e.phase+=dt*.055;e.x+=Math.sign(dx)*e.s*.55*dt;e.y+=Math.sin(e.phase)*.75*dt;
      if(dist<40&&h.inv<=0)hurt(e.d,e.face);
    }else if(e.type==='priest'){
      e.shot-=dt;if(Math.abs(dx)>190)e.x+=Math.sign(dx)*e.s*dt;else if(Math.abs(dx)<120)e.x-=Math.sign(dx)*e.s*.7*dt;
      if(e.shot<=0&&Math.abs(dx)<500){e.shot=95+Math.random()*45;const a=Math.atan2(dy,dx);state.enemyShots.push({x:e.x+e.w/2,y:e.y+18,vx:Math.cos(a)*4.2,vy:Math.sin(a)*4.2,r:6,dmg:e.d,life:190,color:'#9d82c7'})}
    }else if(e.type==='gatekeeper'){
      e.cd-=dt;
      if(e.wind>0){e.wind-=dt;if(e.wind<=0){
        if(Math.abs(dx)<135&&Math.abs(dy)<90)hurt(e.d*1.15,e.face);
        state.fx.push({type:'bossArc',x:e.x+e.w/2,y:e.y+55,face:e.face,life:16});
        e.cd=70+Math.random()*45;
      }}else if(e.cd<=0){e.wind=30;toast('철이 바닥을 긁는다.',500)}
      else if(Math.abs(dx)>105)e.x+=Math.sign(dx)*e.s*dt;
      if(dist<58&&h.inv<=0&&e.wind<=0)hurt(e.d*.65,e.face);
    }else{
      e.x+=Math.sign(dx)*e.s*dt;
      if(Math.abs(dx)<e.w*.8+h.w*.5&&Math.abs(dy)<55&&h.inv<=0)hurt(e.d,e.face);
    }
    if(e.type!=='bat'&&e.type!=='gatekeeper')e.y=r.ground-e.h;
    e.x=clamp(e.x,26,W-e.w-26);
  }
}
function updateFx(dt){
  for(const f of state.fx)f.life-=dt;state.fx=state.fx.filter(f=>f.life>0);
}
function update(dt){
  if(!state.started||state.paused)return;
  updatePlayer(dt);updateProjectiles(dt);updateEnemies(dt);updateFx(dt);
  updateHud();
}

function drawBackground(r){
  const p=zonePalette[r.zone]||zonePalette.hall;
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,p.sky);g.addColorStop(1,'#07080c');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.fillStyle=p.wall;ctx.fillRect(0,82,W,r.ground-82);
  ctx.globalAlpha=.26;ctx.strokeStyle=p.accent;ctx.lineWidth=2;
  for(let x=60;x<W;x+=145){ctx.beginPath();ctx.moveTo(x,118);ctx.lineTo(x,390);ctx.stroke();ctx.beginPath();ctx.arc(x+55,190,44,Math.PI,0);ctx.stroke()}
  ctx.globalAlpha=1;
  if(r.zone==='library'){ctx.fillStyle='#1c222a';for(let x=65;x<W-60;x+=130){ctx.fillRect(x,150,82,210);ctx.fillStyle='#44505a';for(let y=165;y<340;y+=26)ctx.fillRect(x+8,y,65,3);ctx.fillStyle='#1c222a'}}
  if(r.zone==='crypt'||r.zone==='boss'){ctx.fillStyle='#151a1d';for(let x=80;x<W;x+=180){ctx.fillRect(x,355,62,62);ctx.fillRect(x+20,336,22,20)}}
  if(r.zone==='chapel'){ctx.fillStyle='#c59b5a';for(let i=0;i<7;i++){const x=80+i*135;ctx.fillRect(x,385,3,25);ctx.fillStyle='#f0d37d';ctx.beginPath();ctx.arc(x+1.5,380,4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#c59b5a'}}
  ctx.fillStyle=p.floor;ctx.fillRect(0,r.ground,W,H-r.ground);
  ctx.fillStyle='#17171c';for(let x=0;x<W;x+=64)ctx.fillRect(x,r.ground+18,42,3);
  ctx.globalAlpha=.18;ctx.strokeStyle='#b8aa8b';for(let x=0;x<W;x+=96){ctx.beginPath();ctx.moveTo(x,r.ground);ctx.lineTo(x+38,H);ctx.stroke()}ctx.globalAlpha=1;
  for(const [x,y,w,h] of r.platforms){ctx.fillStyle='#4a4748';ctx.fillRect(x,y,w,h);ctx.fillStyle='#736b62';ctx.fillRect(x,y,w,3)}
}
function drawDoors(r){
  ctx.save();
  const arch=(x,open,side)=>{
    ctx.fillStyle=open?'#090a0d':'#28272b';ctx.strokeStyle='#70685d';ctx.lineWidth=3;
    if(side==='L'){ctx.fillRect(0,r.ground-112,30,112);ctx.strokeRect(0,r.ground-112,30,112)}
    else{ctx.fillRect(W-30,r.ground-112,30,112);ctx.strokeRect(W-30,r.ground-112,30,112)}
  };
  arch(0,!!r.L,'L');arch(W,!!r.R,'R');
  ctx.restore();
}
function drawObjects(r){
  for(const o of r.objects){
    if(o.type==='rest'){ctx.fillStyle='#58505c';ctx.fillRect(o.x-13,r.ground-43,26,43);ctx.fillStyle='#e6c86f';ctx.beginPath();ctx.arc(o.x,r.ground-50,7,0,Math.PI*2);ctx.fill()}
    else if(o.type==='device'){ctx.strokeStyle=state.elevatorOn?'#8c826b':'#d5bd72';ctx.lineWidth=3;ctx.beginPath();ctx.arc(o.x,r.ground-35,30,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(o.x-18,r.ground-35);ctx.lineTo(o.x,r.ground-55);ctx.lineTo(o.x+18,r.ground-35);ctx.lineTo(o.x,r.ground-15);ctx.closePath();ctx.stroke()}
    else if(o.type==='elevator'||o.type==='elevatorBack'){ctx.fillStyle='#1b1c21';ctx.fillRect(o.x-56,r.ground-16,112,16);ctx.strokeStyle=state.elevatorOn?'#b0945f':'#4b4b50';ctx.strokeRect(o.x-56,r.ground-16,112,16);ctx.beginPath();ctx.moveTo(o.x-48,110);ctx.lineTo(o.x-48,r.ground-16);ctx.moveTo(o.x+48,110);ctx.lineTo(o.x+48,r.ground-16);ctx.stroke()}
    else if(o.type==='lever'){ctx.strokeStyle=state.cellarOpen?'#6a6b6d':'#a8a0a7';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(o.x,o.y);ctx.lineTo(o.x+(state.cellarOpen?18:-15),o.y-42);ctx.stroke();ctx.fillStyle='#7b667f';ctx.beginPath();ctx.arc(o.x+(state.cellarOpen?18:-15),o.y-45,7,0,Math.PI*2);ctx.fill()}
    else if(o.type==='cellar'||o.type==='north'){ctx.fillStyle=o.type==='north'&&state.bellRung?'#0b0b0d':'#242326';ctx.strokeStyle=o.type==='north'&&state.bellRung?'#a68d61':'#555158';ctx.lineWidth=4;ctx.fillRect(o.x-42,r.ground-108,84,108);ctx.strokeRect(o.x-42,r.ground-108,84,108)}
    else if(o.type==='shortcut'){ctx.fillStyle='#17181d';ctx.fillRect(o.x-46,r.ground-16,92,16);ctx.strokeStyle='#756b5d';ctx.strokeRect(o.x-46,r.ground-16,92,16)}
    else if(o.type==='secretBack'){ctx.strokeStyle='#5f5965';ctx.strokeRect(o.x-24,r.ground-72,48,72)}
  }
  const rs=roomState(r.id);
  if(r.secret){
    ctx.fillStyle=rs.secretOpen?'#08090b':'#343238';ctx.fillRect(r.secret.x-18,r.ground-102,36,102);
    ctx.strokeStyle=rs.secretOpen?'#6e6871':'#47444b';ctx.strokeRect(r.secret.x-18,r.ground-102,36,102);
    if(!rs.secretOpen){ctx.globalAlpha=.35;ctx.strokeStyle='#918697';ctx.beginPath();ctx.moveTo(r.secret.x-8,r.ground-70);ctx.lineTo(r.secret.x+6,r.ground-45);ctx.lineTo(r.secret.x-4,r.ground-20);ctx.stroke();ctx.globalAlpha=1}
  }
  if(r.trace&&!rs.traceSeen){ctx.globalAlpha=.28;ctx.strokeStyle='#aca1b7';ctx.lineWidth=2;ctx.beginPath();ctx.arc(W-88,170,16,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(W-107,170);ctx.lineTo(W-69,170);ctx.stroke();ctx.globalAlpha=1}
}
function drawHero(k,ghost=false){
  const h=syncHeroBody(k),d=HEROES[k];if(!h.alive)return;
  const moving=Math.abs(h.vx)>.35,bob=moving?Math.sin(h.anim)*1.4:0;
  const drawX=Math.round(h.x+h.w/2),drawY=Math.round(h.y+h.h+bob);
  if(!Number.isFinite(drawX)||!Number.isFinite(drawY))return;
  const land=Math.max(0,h.land||0),attackT=Math.max(0,h.attack||0)/(d.attackCd||1);
  ctx.save();ctx.translate(drawX,drawY);
  if(!ghost&&land>0)ctx.scale(1+land*.006,1-land*.004);
  if(!ghost&&attackT>0)ctx.rotate((k==='noah'?-.055:-.025)*(h.face||1)*(1-attackT*.35));
  if(h.face<0)ctx.scale(-1,1);if(ghost)ctx.globalAlpha=.24;if(h.inv>0&&Math.floor(h.inv/5)%2===0)ctx.globalAlpha*=.5;
  ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(0,1,d.w*.65,5,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=d.color;ctx.beginPath();ctx.arc(0,-d.h+14,11,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=d.key==='ethan'?'#d8cfb7':'#2b3150';ctx.beginPath();ctx.moveTo(-13,-d.h+25);ctx.lineTo(13,-d.h+25);ctx.lineTo(18,-5);ctx.lineTo(-15,-5);ctx.closePath();ctx.fill();
  ctx.fillStyle=d.accent;ctx.fillRect(d.key==='ethan'?8:11,-d.h+31,4,27);
  if(d.key==='ethan'){ctx.strokeStyle='#88dbed';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(9,-32);ctx.lineTo(25,-25);ctx.stroke();ctx.fillStyle='#e7c66f';ctx.beginPath();ctx.arc(27,-24,4,0,Math.PI*2);ctx.fill()}
  else{ctx.strokeStyle='#72dcef';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(8,-32);ctx.lineTo(29,-18);ctx.stroke()}
  ctx.restore();
}
function drawEnemy(e){
  if(!e.alive&&performance.now()-e.deadAt>450)return;
  ctx.save();ctx.translate(Math.round(e.x+e.w/2),Math.round(e.y+e.h));if(e.face<0)ctx.scale(-1,1);
  if(!e.alive)ctx.globalAlpha=Math.max(0,1-(performance.now()-e.deadAt)/450);
  if(e.type==='crawler'){ctx.fillStyle='#4c4057';ctx.beginPath();ctx.ellipse(0,-12,18,12,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#c27787';ctx.fillRect(7,-16,4,3)}
  else if(e.type==='bat'){ctx.fillStyle='#4e4861';ctx.beginPath();ctx.moveTo(0,-12);ctx.lineTo(-20,-26);ctx.lineTo(-13,-6);ctx.lineTo(0,-16);ctx.lineTo(13,-6);ctx.lineTo(20,-26);ctx.closePath();ctx.fill();ctx.fillStyle='#a477c2';ctx.fillRect(4,-16,3,3)}
  else if(e.type==='priest'){ctx.fillStyle='#403c4b';ctx.fillRect(-12,-48,24,45);ctx.fillStyle='#746989';ctx.beginPath();ctx.arc(0,-48,10,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#9b82c0';ctx.beginPath();ctx.moveTo(10,-35);ctx.lineTo(22,-8);ctx.stroke()}
  else if(e.type==='gatekeeper'){ctx.fillStyle='#26282d';ctx.fillRect(-28,-84,56,78);ctx.fillStyle='#55565c';ctx.beginPath();ctx.arc(0,-84,28,Math.PI,0);ctx.fill();ctx.fillStyle='#111218';ctx.fillRect(-17,-78,34,9);ctx.strokeStyle='#8a7b69';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(24,-58);ctx.lineTo(45,-6);ctx.stroke();if(e.wind>0){ctx.strokeStyle='#d1b16d';ctx.lineWidth=3;ctx.globalAlpha=.45+.35*(e.wind/30);ctx.beginPath();ctx.arc(10,-40,66,-1.2,.9);ctx.stroke()}}
  else{ctx.fillStyle='#3b3b41';ctx.fillRect(-14,-50,28,47);ctx.fillStyle='#55535b';ctx.beginPath();ctx.arc(0,-50,12,0,Math.PI*2);ctx.fill();if(e.type==='guard'){ctx.fillStyle='#7c6c60';ctx.fillRect(13,-38,5,35)}}
  ctx.restore();
}
function drawProjectiles(){
  for(const q of state.projectiles){ctx.fillStyle=q.color;ctx.shadowColor=q.color;ctx.shadowBlur=8;ctx.beginPath();ctx.arc(q.x,q.y,q.r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0}
  for(const q of state.enemyShots){ctx.fillStyle=q.color;ctx.beginPath();ctx.arc(q.x,q.y,q.r,0,Math.PI*2);ctx.fill()}
}
function drawFx(){
  for(const f of state.fx){
    const a=Math.max(0,Math.min(1,f.life/16));ctx.save();ctx.globalAlpha=a;
    if(f.type==='slash'){ctx.strokeStyle=f.color;ctx.lineWidth=5;ctx.beginPath();const cx=f.x+(f.face>0?0:f.w);ctx.arc(cx,f.y+22,52,f.face>0?-1.0:2.1,f.face>0?.8:4.0);ctx.stroke()}
    else if(f.type==='muzzle'){ctx.strokeStyle=f.color;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(f.x-f.face*3,f.y);ctx.lineTo(f.x+f.face*(16+(f.max-f.life)*2),f.y);ctx.stroke();ctx.fillStyle=f.color;ctx.beginPath();ctx.arc(f.x,f.y,3+f.life*.22,0,Math.PI*2);ctx.fill()}
    else if(f.type==='swap'){const p=1-f.life/(f.max||18);ctx.strokeStyle=f.color;ctx.lineWidth=2;ctx.beginPath();ctx.arc(f.x,f.y,14+p*34,0,Math.PI*2);ctx.stroke();ctx.globalAlpha*=.35;ctx.beginPath();ctx.arc(f.x,f.y,7+p*22,0,Math.PI*2);ctx.stroke()}
    else if(f.type==='jumpDust'||f.type==='landDust'){ctx.fillStyle=f.color;const spread=f.type==='landDust'?24:16;for(let i=0;i<6;i++){const t=i/5-.5;ctx.globalAlpha=a*(.35+Math.abs(t)*.3);ctx.fillRect(f.x+t*spread-(f.max-f.life)*t*1.5,f.y-2-Math.abs(t)*4,3,2)}}
    else if(f.type==='spark'){ctx.fillStyle=f.color;for(let i=0;i<5;i++){const an=i*1.25+f.life;ctx.fillRect(f.x+Math.cos(an)*12,f.y+Math.sin(an)*12,3,3)}}
    else if(f.type==='dust'){ctx.fillStyle='#a09388';for(let i=0;i<7;i++)ctx.fillRect(f.x+(i-3)*5,f.y-(18-f.life)*2+(i%3)*4,4,4)}
    else if(f.type==='bossArc'){ctx.strokeStyle='#cdb27a';ctx.lineWidth=7;ctx.beginPath();ctx.arc(f.x,f.y,95,f.face>0?-1.2:2.0,f.face>0?.7:4.1);ctx.stroke()}
    ctx.restore();
  }
}
function drawBossHp(){
  const e=roomState('boss').enemies.find(x=>x.type==='gatekeeper'&&x.alive);if(state.current!=='boss'||!e)return;
  const w=420,x=(W-w)/2,y=36;ctx.fillStyle='#090a0ee8';ctx.fillRect(x-2,y-2,w+4,18);ctx.fillStyle='#392f31';ctx.fillRect(x,y,w,14);ctx.fillStyle='#b99a61';ctx.fillRect(x,y,w*(e.hp/e.maxHp),14);ctx.fillStyle='#ded4bd';ctx.font='700 11px sans-serif';ctx.textAlign='center';ctx.fillText('THE GATE KEEPER',W/2,y-7);ctx.textAlign='left';
}
function drawMap(){
  mctx.clearRect(0,0,mapCanvas.width,mapCanvas.height);mctx.fillStyle='#090a0f';mctx.fillRect(0,0,mapCanvas.width,mapCanvas.height);
  const vals=Object.values(ROOMS).filter(r=>state.visited.has(r.id));
  if(!vals.length)return;
  const minX=Math.min(...vals.map(r=>r.mx)),maxX=Math.max(...vals.map(r=>r.mx)),minY=Math.min(...vals.map(r=>r.my)),maxY=Math.max(...vals.map(r=>r.my));
  const scale=Math.min(34,(mapCanvas.width-50)/Math.max(1,maxX-minX+1),(mapCanvas.height-45)/Math.max(1,maxY-minY+1));
  const ox=mapCanvas.width/2-(minX+maxX)*scale/2,oy=mapCanvas.height/2-(minY+maxY)*scale/2;
  for(const r of vals){
    const x=ox+r.mx*scale,y=oy+r.my*scale;mctx.fillStyle=r.id===state.current?'#e3c873':'#454a57';mctx.fillRect(x-10,y-7,20,14);
    if(r.id===state.current){mctx.strokeStyle='#fff0b5';mctx.strokeRect(x-13,y-10,26,20)}
  }
}
function draw(){
  ctx.clearRect(0,0,W,H);const r=activeRoom();drawBackground(r);drawDoors(r);drawObjects(r);
  drawHero(otherKey(),true);for(const e of roomState(r.id).enemies)drawEnemy(e);drawProjectiles();drawHero(state.active,false);drawFx();drawBossHp();
  if(state.bellRung&&r.id==='central'){ctx.globalAlpha=.16;ctx.fillStyle='#d5b66a';ctx.beginPath();ctx.arc(755,250,110,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}
  if(state.mapOpen)drawMap();
}
function updateHud(){
  const e=heroes.ethan,n=heroes.noah;ui.ethanHp.style.width=(e.hp/HEROES.ethan.maxHp*100)+'%';ui.noahHp.style.width=(n.hp/HEROES.noah.maxHp*100)+'%';ui.ethanHpText.textContent=Math.round(e.hp);ui.noahHpText.textContent=Math.round(n.hp);
  ui.ethanHud.classList.toggle('active',state.active==='ethan');ui.noahHud.classList.toggle('active',state.active==='noah');
  ui.roomTitle.textContent=activeRoom().name;ui.heroHint.textContent=state.active==='ethan'?'에단 · 룬탄 / 장치':'노아 · 참격 / 기동';ui.roomHint.textContent='방문 '+state.visited.size;
}

function toggleMap(){state.mapOpen=!state.mapOpen;ui.mapPanel.classList.toggle('show',state.mapOpen);ui.mapPanel.setAttribute('aria-hidden',state.mapOpen?'false':'true');if(state.mapOpen)drawMap()}
function setKey(name,v){state.keys[name]=v}
addEventListener('keydown',e=>{
  const k=e.key.toLowerCase();if([' ','arrowleft','arrowright','tab'].includes(k)||e.code==='Space')e.preventDefault();
  if(k==='a'||k==='arrowleft')setKey('left',true);
  if(k==='d'||k==='arrowright')setKey('right',true);
  if((e.code==='Space'||k==='k'||k==='z')&&!e.repeat)doJump();
  if((k==='j'||k==='x')&&!e.repeat)doAttack();
  if((k==='q'||k==='tab')&&!e.repeat)switchHero();
  if(k==='e'&&!e.repeat)interact();
  if(k==='m'&&!e.repeat)toggleMap();
});
addEventListener('keyup',e=>{const k=e.key.toLowerCase();if(k==='a'||k==='arrowleft')setKey('left',false);if(k==='d'||k==='arrowright')setKey('right',false);if(e.code==='Space'||k==='k'||k==='z')releaseJump()});
addEventListener('blur',()=>{state.keys.left=state.keys.right=false});

document.querySelectorAll('[data-hold]').forEach(b=>{
  const key=b.dataset.hold;b.addEventListener('pointerdown',e=>{e.preventDefault();setKey(key,true);b.setPointerCapture?.(e.pointerId)});
  b.addEventListener('pointerup',e=>{e.preventDefault();setKey(key,false)});b.addEventListener('pointercancel',()=>setKey(key,false));b.addEventListener('pointerleave',()=>setKey(key,false));
});
ui.jumpBtn.addEventListener('pointerdown',e=>{e.preventDefault();doJump();ui.jumpBtn.setPointerCapture?.(e.pointerId)});
ui.jumpBtn.addEventListener('pointerup',e=>{e.preventDefault();releaseJump()});
ui.jumpBtn.addEventListener('pointercancel',releaseJump);
ui.attackBtn.addEventListener('pointerdown',e=>{e.preventDefault();doAttack()});
ui.swapBtn.addEventListener('pointerdown',e=>{e.preventDefault();switchHero()});
ui.useBtn.addEventListener('pointerdown',e=>{e.preventDefault();interact()});
ui.mapBtn.addEventListener('click',toggleMap);
ui.soundBtn.addEventListener('click',()=>{state.sound=!state.sound;ui.soundBtn.textContent=state.sound?'🔊':'🔇';if(audio.master&&audio.ctx)audio.master.gain.setTargetAtTime(state.sound?.72:0,audio.ctx.currentTime,.03)});
ui.startBtn.addEventListener('click',newGame);ui.retryBtn.addEventListener('click',retry);ui.clearAgain.addEventListener('click',newGame);

let last=performance.now();
function frame(t){
  const dt=Math.min(2.2,(t-last)/16.67);last=t;
  try{update(dt);draw()}catch(err){console.error('HOLLOW KEEP frame recovered',err);if(t-state.lastError>1200){state.lastError=t;toast('화면을 복구했습니다.',700)}}
  requestAnimationFrame(frame);
}
spawnRoom('gate');updateHud();requestAnimationFrame(frame);
})();