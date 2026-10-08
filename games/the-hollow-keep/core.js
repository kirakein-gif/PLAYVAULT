(() => {
'use strict';

const $=id=>document.getElementById(id);
const canvas=$('game'),ctx=canvas.getContext('2d'),W=960,H=540;
const mapCanvas=$('mapCanvas'),mctx=mapCanvas.getContext('2d');
ctx.imageSmoothingEnabled=false;
ctx.imageSmoothingQuality='low';
mctx.imageSmoothingEnabled=false;
const ui={
  start:$('start'),startBtn:$('startBtn'),gameOver:$('gameOver'),retryBtn:$('retryBtn'),
  chapterClear:$('chapterClear'),clearAgain:$('clearAgain'),clearStats:$('clearStats'),
  roomTitle:$('roomTitle'),roomHint:$('roomHint'),heroHint:$('heroHint'),
  ethanHud:$('ethanHud'),noahHud:$('noahHud'),ethanHp:$('ethanHp'),noahHp:$('noahHp'),
  ethanHpText:$('ethanHpText'),noahHpText:$('noahHpText'),toast:$('toast'),
  mapPanel:$('mapPanel'),mapBtn:$('mapBtn'),soundBtn:$('soundBtn'),
  rotateNotice:$('rotateNotice'),landscapeBtn:$('landscapeBtn'),
  jumpBtn:$('jumpBtn'),attackBtn:$('attackBtn'),swapBtn:$('swapBtn'),useBtn:$('useBtn')
};

function fit(){
  const s=Math.min(innerWidth/W,innerHeight/H);
  canvas.style.width=Math.round(W*s)+'px';
  canvas.style.height=Math.round(H*s)+'px';
}
fit();addEventListener('resize',fit);
addEventListener('orientationchange',()=>setTimeout(fit,120));

const isCoarseMobile=()=>matchMedia('(pointer:coarse)').matches;
async function requestLandscapeMode(){
  if(!isCoarseMobile())return;
  try{
    const target=document.documentElement;
    if(!document.fullscreenElement&&target.requestFullscreen)await target.requestFullscreen({navigationUI:'hide'});
  }catch(err){console.debug('[HOLLOW KEEP] fullscreen unavailable',err)}
  try{
    if(screen.orientation?.lock)await screen.orientation.lock('landscape');
  }catch(err){console.debug('[HOLLOW KEEP] orientation lock unavailable',err)}
  setTimeout(fit,120);
}

const HEROES={
  ethan:{key:'ethan',name:'Ethan',ko:'에단',maxHp:120,speed:2.95,jump:10.9,w:42,h:68,attackCd:29,gravity:.70,maxFall:13.5,accelGround:.42,accelAir:.22,friction:.82,coyote:6,jumpBuffer:7,color:'#e2d7b9',accent:'#e7c66f',detail:'#74d8ef'},
  noah:{key:'noah',name:'Noah',ko:'노아',maxHp:95,speed:3.85,jump:13.1,w:39,h:64,attackCd:18,gravity:.57,maxFall:13.8,accelGround:.68,accelAir:.40,friction:.60,coyote:8,jumpBuffer:8,color:'#252943',accent:'#72dcef',detail:'#8f70c7'}
};

const state={
  started:false,paused:true,current:'gate',active:'ethan',visited:new Set(),kills:0,startTime:0,
  elevatorOn:false,cellarOpen:false,westLatch:false,bossDead:false,bellRung:false,chapterClear:false,
  checkpoint:{room:'gate',x:120},mapOpen:false,sound:true,swapLock:0,hitStop:0,shake:0,shakeAmp:0,
  roomState:{},projectiles:[],enemyShots:[],fx:[],keys:{},lastError:0
};
const heroes={
  ethan:{hp:120,alive:true,x:120,y:0,vx:0,vy:0,onGround:false,face:1,attack:0,inv:0,anim:0,coyote:0,jumpBuffer:0,land:0,combo:0,comboWindow:0,finisherLock:0,finisherMax:0,w:HEROES.ethan.w,h:HEROES.ethan.h},
  noah:{hp:95,alive:true,x:120,y:0,vx:0,vy:0,onGround:false,face:1,attack:0,inv:0,anim:0,coyote:0,jumpBuffer:0,land:0,combo:0,comboWindow:0,finisherLock:0,finisherMax:0,w:HEROES.noah.w,h:HEROES.noah.h}
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
  west2:room('west2','회랑의 갈림길',-2,0,'chapel',{L:'west3',R:'west1',platforms:[[205,372,130,14],[390,336,120,14],[590,300,140,14]],objects:[{type:'latch',x:655,y:300}],enemy:['bat','guard'],trace:'위쪽 벽에 끊어진 쇠사슬이 매달려 있다.'}),
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
function livingEnemies(id=state.current){return roomState(id).enemies.filter(e=>e.alive)}
function exitBlocked(r,side){
  if(r.id==='outer'&&side==='R'&&livingEnemies(r.id).length)return true;
  if(r.id==='central'&&side==='R'&&!state.elevatorOn)return true;
  if(r.id==='west1'&&side==='L'&&livingEnemies(r.id).length)return true;
  if(r.id==='west2'&&side==='L'&&!state.westLatch)return true;
  return false;
}
function bumpBlockedExit(r,side){
  const rs=roomState(r.id),key='bump'+side;
  audio.sfx('clunk');
  if(!rs[key]){
    rs[key]=true;
    if(r.id==='central'&&side==='R')toast('쇠문 너머는 어둡다.',900);
    else if(r.id==='west2')toast('위쪽에서 쇠사슬이 이어져 있다.',1000);
    else toast('철창이 내려와 있다.',800);
  }
}

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
    else if(n==='hit'){this.noise(.05,.032,1200);this.tone(125,.05,.020,'triangle',-18)}
    else if(n==='hit2'){this.noise(.065,.045,1100);this.tone(108,.07,.033,'triangle',-24)}
    else if(n==='finisher'){this.noise(.09,.072,850);this.tone(82,.11,.060,'square',-26);this.tone(168,.07,.028,'triangle',-40,.02)}
    else if(n==='runeHit'){this.noise(.045,.028,1450);this.tone(245,.09,.040,'sine',70);this.tone(118,.06,.022,'triangle',-18)}
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
  return {type,x,y,w:d.w,h:d.h,hp:d.hp,maxHp:d.hp,s:d.s,d:d.d,alive:true,face:-1,cd:45+Math.random()*60,shot:50+Math.random()*70,phase:Math.random()*6.28,wind:0,inv:0,deadAt:0,stun:0,kbx:0,hitFlash:0,recoilDir:0,attackWind:0,attackRecover:0,dash:0,aimX:0,aimY:0,attackKind:'',didHit:false};
}

function newGame(){
  state.started=true;state.paused=false;state.current='gate';state.active='ethan';state.visited=new Set(['gate']);state.kills=0;state.startTime=performance.now();
  state.elevatorOn=false;state.cellarOpen=false;state.westLatch=false;state.bossDead=false;state.bellRung=false;state.chapterClear=false;state.swapLock=0;state.hitStop=0;state.shake=0;state.shakeAmp=0;state.checkpoint={room:'gate',x:120};state.roomState={};state.projectiles=[];state.enemyShots=[];state.fx=[];
  for(const k of Object.keys(heroes)){const d=HEROES[k];Object.assign(heroes[k],{hp:d.maxHp,alive:true,x:120,y:ROOMS.gate.ground-d.h,vx:0,vy:0,onGround:true,face:1,attack:0,inv:0,anim:0,coyote:d.coyote,jumpBuffer:0,land:0,combo:0,comboWindow:0,finisherLock:0,finisherMax:0,w:d.w,h:d.h})}
  spawnRoom('gate');ui.start.classList.remove('show');ui.gameOver.classList.remove('show');ui.chapterClear.classList.remove('show');audio.unlock();toast('성의 문이 다시 열렸다.',1700);updateHud();
}
function retry(){
  state.paused=false;state.current=state.checkpoint.room;state.active='ethan';state.projectiles=[];state.enemyShots=[];state.fx=[];
  for(const k of Object.keys(heroes)){const h=heroes[k],d=HEROES[k];Object.assign(h,{hp:d.maxHp,alive:true,x:state.checkpoint.x,y:activeRoom().ground-d.h,vx:0,vy:0,onGround:true,inv:80,coyote:d.coyote,jumpBuffer:0,land:0,combo:0,comboWindow:0,finisherLock:0,finisherMax:0,w:d.w,h:d.h})}
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
  if(state.paused)return;const h=hero(),d=HEROES[state.active];if(!h.alive)return;

  if(state.active==='ethan'){
    if(h.attack>0)return;
    h.attack=d.attackCd;h.attackMax=d.attackCd;h.combo=0;h.comboWindow=0;
    const px=h.x+h.w/2+h.face*27,py=h.y+h.h*.42;
    state.projectiles.push({x:px,y:py,vx:h.face*10.6,vy:0,r:6,dmg:22,life:96,color:'#e7c66f',knock:3.5,stun:13,hitStop:2.0,shake:1.15,impact:'rune',trail:[]});
    state.fx.push({type:'muzzle',x:px,y:py,face:h.face,life:10,max:10,color:'#e7c66f'});
    state.fx.push({type:'runePulse',x:px-h.face*3,y:py,face:h.face,life:12,max:12,color:'#e7c66f'});
    h.vx-=h.face*(h.onGround?.56:.24);state.shake=Math.max(state.shake,4);state.shakeAmp=Math.max(state.shakeAmp,.28);audio.sfx('ethan');
  }else{
    if(h.attack>0||h.finisherLock>0)return;
    h.combo=(h.comboWindow>0&&h.combo<3)?h.combo+1:1;
    const step=h.combo,damages=[22,25,32],reach=[66,72,82],locks=[14,15,21],lunges=[2.5,3.3,4.4];
    h.comboWindow=step===3?0:28;
    h.attack=locks[step-1];h.attackMax=locks[step-1];
    if(step===3){h.finisherLock=46;h.finisherMax=46;}
    h.vx=clamp(h.vx+h.face*(h.onGround?lunges[step-1]:lunges[step-1]*.55),-6.8,6.8);
    const hitStops=[.35,.85,4.2],shakes=[.18,.45,2.4],knocks=[1.8,2.9,6.0],stuns=[7,11,20];
    const w=reach[step-1],hit={x:h.face>0?h.x+h.w-2:h.x-w+2,y:h.y+(step===3?1:5),w,h:step===3?52:46,dmg:damages[step-1],life:9,face:h.face,combo:step,knock:knocks[step-1],stun:stuns[step-1]};
    state.fx.push({type:'slash',...hit,max:9,color:step===3?'#baf6ff':'#72dcef'});
    hitEnemiesBox(hit,{knock:hit.knock,stun:hit.stun,dir:h.face,hitStop:hitStops[step-1],shake:shakes[step-1],impact:'slash'+step});
    audio.sfx('noah');
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
function hitEnemiesBox(box,opts={}){
  for(const e of roomState(state.current).enemies){if(!e.alive||e.inv>0)continue;if(rects(box,e)){damageEnemy(e,box.dmg,{...opts,dir:opts.dir??box.face})}}
}
function damageEnemy(e,n,opts={}){
  if(!e.alive||e.inv>0)return;
  e.hp-=n;e.inv=4;e.hitFlash=7;
  if(e.type!=='gatekeeper'){
    e.stun=Math.max(e.stun||0,opts.stun||6);
    e.recoilDir=opts.dir||hero().face;
    e.kbx+=e.recoilDir*(opts.knock||1.5);
  }
  const impact=opts.impact||'hit';
  if(impact==='slash3')audio.sfx('finisher');
  else if(impact==='slash2')audio.sfx('hit2');
  else if(impact==='rune')audio.sfx('runeHit');
  else audio.sfx('hit');
  state.hitStop=Math.max(state.hitStop,opts.hitStop||0);
  if((opts.shake||0)>0){state.shake=Math.max(state.shake,8+(opts.shake||0)*3);state.shakeAmp=Math.max(state.shakeAmp,opts.shake||0)}
  const accent=impact==='rune'?'#f1d983':impact==='slash3'?'#c7f7ff':HEROES[state.active].accent;
  state.fx.push({type:'spark',x:e.x+e.w/2,y:e.y+e.h/2,life:impact==='slash3'?16:12,max:impact==='slash3'?16:12,color:accent});
  state.fx.push({type:'hitRing',x:e.x+e.w/2,y:e.y+e.h*.48,life:impact==='slash3'?11:8,max:impact==='slash3'?11:8,color:accent});
  if(e.hp<=0){
    e.hp=0;e.alive=false;e.deadAt=performance.now();state.kills++;
    state.fx.push({type:'enemyBurst',x:e.x+e.w/2,y:e.y+e.h/2,life:16,max:16,color:'#a69cab'});
    if(e.type==='gatekeeper')bossDefeated();
    else{
      const r=activeRoom(),rs=roomState(r.id);
      if((r.id==='outer'||r.id==='west1')&&livingEnemies(r.id).length===0&&!rs.clearGateSound){
        rs.clearGateSound=true;audio.sfx('chain');toast('철이 위로 긁히는 소리가 난다.',950);
        state.fx.push({type:'gateDust',x:r.id==='outer'?W-30:30,y:r.ground-65,life:20,max:20,color:'#9d927f'});
      }
    }
  }
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
    if(o.type==='latch'){
      if(state.westLatch){toast('걸쇠는 이미 내려가 있다.');return}
      state.westLatch=true;audio.sfx('chain');
      state.fx.push({type:'gateDust',x:30,y:r.ground-64,life:18,max:18,color:'#9d927f'});
      toast('아래에서 쇠사슬이 풀리는 소리가 난다.',1200);return;
    }
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
  if(state.swapLock>0)state.swapLock-=dt;
  if(h.attack>0)h.attack-=dt;if(h.inv>0)h.inv-=dt;if(h.land>0)h.land-=dt;
  if(h.comboWindow>0)h.comboWindow-=dt;
  if(h.finisherLock>0)h.finisherLock-=dt;
  if(h.comboWindow<=0&&h.finisherLock<=0&&h.attack<=0)h.combo=0;
  if(h.onGround)h.coyote=d.coyote;else h.coyote=Math.max(0,(h.coyote||0)-dt);
  if(h.jumpBuffer>0)h.jumpBuffer-=dt;
  consumeBufferedJump(h,d);
  let dir=(k.left?-1:0)+(k.right?1:0);
  const accel=h.onGround?d.accelGround:d.accelAir;
  const recovering=state.active==='noah'&&h.finisherLock>0&&h.attack<=0;
  const target=dir*d.speed*(recovering?.48:1),blend=Math.min(1,accel*dt);
  h.vx+=(target-h.vx)*blend;
  if(!dir)h.vx*=Math.pow(d.friction,dt);else h.face=dir>0?1:-1;
  if(recovering)h.vx*=Math.pow(.92,dt);
  platformPhysics(h,d,activeRoom(),dt);
  h.anim+=Math.abs(h.vx)*dt*(state.active==='noah'?.22:.17);

  if(h.x<-18){
    const r=activeRoom(),to=r.L;
    if(to&&exitBlocked(r,'L')){h.x=-16;h.vx=Math.max(0,h.vx);bumpBlockedExit(r,'L')}
    else if(to)changeRoom(to,W-d.w-48);else h.x=-18;
  }else if(h.x+h.w>W+18){
    const r=activeRoom(),to=r.R;
    if(to&&exitBlocked(r,'R')){h.x=W-h.w+16;h.vx=Math.min(0,h.vx);bumpBlockedExit(r,'R')}
    else if(r.id==='boss'&&to==='after'&&!state.bossDead){h.x=W-h.w-18;audio.sfx('clunk')}
    else if(to)changeRoom(to,44);else h.x=W-h.w+18;
  }
  {const ok=otherKey(),o=syncHeroBody(ok),tx=clamp(h.x-h.face*50,8,W-o.w-8),ty=h.y+h.h-o.h;
   const follow=Math.min(1,.18*dt);o.x+=(tx-o.x)*follow;o.y+=(ty-o.y)*Math.min(1,.24*dt);o.face=h.face;}
}
function updateProjectiles(dt){
  for(const q of state.projectiles){
    if(q.impact==='rune'&&q.trail){q.trail.push({x:q.x,y:q.y,life:8});if(q.trail.length>7)q.trail.shift();for(const p of q.trail)p.life-=dt}
    q.x+=q.vx*dt;q.y+=q.vy*dt;q.life-=dt;
    for(const e of roomState(state.current).enemies){if(e.alive&&q.life>0&&circleRect(q,e)){damageEnemy(e,q.dmg,{knock:q.knock||1.5,stun:q.stun||6,dir:Math.sign(q.vx)||1,hitStop:q.hitStop||0,shake:q.shake||0,impact:q.impact||'hit'});q.life=0;break}}
  }
  state.projectiles=state.projectiles.filter(q=>q.life>0&&q.x>-30&&q.x<W+30);
  for(const q of state.enemyShots){q.x+=q.vx*dt;q.y+=q.vy*dt;q.life-=dt;const h=hero();if(q.life>0&&circleRect(q,h)){q.life=0;hurt(q.dmg,q.vx>0?1:-1)}}
  state.enemyShots=state.enemyShots.filter(q=>q.life>0&&q.x>-40&&q.x<W+40);
}
function circleRect(c,r){const x=clamp(c.x,r.x,r.x+r.w),y=clamp(c.y,r.y,r.y+r.h);return Math.hypot(c.x-x,c.y-y)<(c.r||5)}

function updateEnemies(dt){
  const h=hero(),r=activeRoom(),rs=roomState(r.id);
  for(const e of rs.enemies){
    if(!e.alive)continue;
    if(e.inv>0)e.inv-=dt;if(e.hitFlash>0)e.hitFlash-=dt;
    const dx=(h.x+h.w/2)-(e.x+e.w/2),dy=(h.y+h.h/2)-(e.y+e.h/2),dist=Math.hypot(dx,dy)||1;
    e.face=dx>=0?1:-1;

    if(Math.abs(e.kbx||0)>.04){
      e.x+=e.kbx*dt;e.kbx*=Math.pow(.72,dt);
    }else e.kbx=0;

    if(e.stun>0){
      e.stun-=dt;e.attackWind=0;e.dash=0;
      if(e.type!=='bat'&&e.type!=='gatekeeper')e.y=r.ground-e.h;
      e.x=clamp(e.x,26,W-e.w-26);
      continue;
    }

    if(e.type==='crawler'){
      if(e.attackRecover>0)e.attackRecover-=dt;
      else if(e.dash>0){
        e.x+=e.aimX*5.6*dt;e.dash-=dt;
        if(!e.didHit&&Math.abs(dx)<42&&Math.abs(dy)<42){e.didHit=true;hurt(e.d,e.aimX)}
        if(e.dash<=0){e.dash=0;e.attackRecover=24}
      }else if(e.attackWind>0){
        e.attackWind-=dt;
        if(e.attackWind<=0){e.attackWind=0;e.dash=11;e.didHit=false}
      }else{
        e.cd-=dt;
        if(Math.abs(dx)<125&&e.cd<=0){e.attackWind=17;e.aimX=Math.sign(dx)||1;e.cd=72}
        else if(Math.abs(dx)>70)e.x+=Math.sign(dx)*e.s*dt;
      }
    }else if(e.type==='guard'){
      if(e.attackRecover>0)e.attackRecover-=dt;
      else if(e.attackWind>0){
        e.attackWind-=dt;
        if(e.attackWind<=0){
          e.attackWind=0;
          state.fx.push({type:'enemySlash',x:e.x+e.w/2,y:e.y+22,face:e.aimX||e.face,life:12,max:12,color:'#b59a80'});
          if(Math.abs(dx)<102&&Math.abs(dy)<68)hurt(e.d,e.aimX||e.face);
          e.attackRecover=34;e.cd=62+Math.random()*25;
        }
      }else{
        e.cd-=dt;
        if(Math.abs(dx)<92&&e.cd<=0){e.attackWind=23;e.aimX=Math.sign(dx)||1}
        else if(Math.abs(dx)>78)e.x+=Math.sign(dx)*e.s*dt;
      }
    }else if(e.type==='bat'){
      e.phase+=dt*.055;
      if(e.attackRecover>0){e.attackRecover-=dt;e.y+=Math.sin(e.phase)*.35*dt}
      else if(e.dash>0){
        e.x+=e.aimX*5.0*dt;e.y+=e.aimY*5.0*dt;e.dash-=dt;
        if(!e.didHit&&dist<38){e.didHit=true;hurt(e.d,e.aimX>=0?1:-1)}
        if(e.dash<=0){e.dash=0;e.attackRecover=32;e.cd=75+Math.random()*35}
      }else if(e.attackWind>0){
        e.attackWind-=dt;
        if(e.attackWind<=0){
          const l=Math.hypot(dx,dy)||1;e.aimX=dx/l;e.aimY=dy/l;e.dash=16;e.didHit=false;
        }
      }else{
        e.cd-=dt;
        e.x+=Math.sign(dx)*e.s*.35*dt;e.y+=Math.sin(e.phase)*.7*dt;
        if(dist<170&&e.cd<=0)e.attackWind=14;
      }
    }else if(e.type==='priest'){
      if(e.attackRecover>0)e.attackRecover-=dt;
      else if(e.attackWind>0){
        e.attackWind-=dt;
        if(e.attackWind<=0){
          e.attackWind=0;
          state.enemyShots.push({x:e.x+e.w/2,y:e.y+18,vx:e.aimX*4.35,vy:e.aimY*4.35,r:6,dmg:e.d,life:190,color:'#9d82c7'});
          state.fx.push({type:'castFlash',x:e.x+e.w/2,y:e.y+18,life:10,max:10,color:'#9d82c7'});
          e.attackRecover=31;e.shot=92+Math.random()*48;
        }
      }else{
        e.shot-=dt;
        if(Math.abs(dx)>205)e.x+=Math.sign(dx)*e.s*dt;
        else if(Math.abs(dx)<125)e.x-=Math.sign(dx)*e.s*.75*dt;
        if(e.shot<=0&&Math.abs(dx)<520){
          const l=Math.hypot(dx,dy)||1;e.aimX=dx/l;e.aimY=dy/l;e.attackWind=28;
        }
      }
    }else if(e.type==='gatekeeper'){
      e.cd-=dt;
      if(e.wind>0){e.wind-=dt;if(e.wind<=0){
        if(Math.abs(dx)<135&&Math.abs(dy)<90)hurt(e.d*1.15,e.face);
        state.fx.push({type:'bossArc',x:e.x+e.w/2,y:e.y+55,face:e.face,life:16,max:16});
        e.cd=70+Math.random()*45;
      }}else if(e.cd<=0){e.wind=30;toast('철이 바닥을 긁는다.',500)}
      else if(Math.abs(dx)>105)e.x+=Math.sign(dx)*e.s*dt;
      if(dist<58&&h.inv<=0&&e.wind<=0)hurt(e.d*.65,e.face);
    }

    if(e.type!=='bat'&&e.type!=='gatekeeper')e.y=r.ground-e.h;
    e.x=clamp(e.x,26,W-e.w-26);
    if(e.type==='bat')e.y=clamp(e.y,145,r.ground-55);
  }
}
function updateFx(dt){
  for(const f of state.fx)f.life-=dt;state.fx=state.fx.filter(f=>f.life>0);
}
function update(dt){
  if(!state.started||state.paused)return;
  if(state.hitStop>0){state.hitStop=Math.max(0,state.hitStop-dt);return}
  if(state.shake>0){state.shake=Math.max(0,state.shake-dt);if(state.shake<=0)state.shakeAmp=0}
  updatePlayer(dt);updateProjectiles(dt);updateEnemies(dt);updateFx(dt);
  updateHud();
}

function drawBackground(r){
  const p=zonePalette[r.zone]||zonePalette.hall;
  if(window.HK_ART&&HK_ART.drawBackdrop)HK_ART.drawBackdrop(ctx,r,p,W,H);
  else{
    const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,p.sky);g.addColorStop(1,'#07080c');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    ctx.fillStyle=p.wall;ctx.fillRect(0,82,W,r.ground-82);ctx.fillStyle=p.floor;ctx.fillRect(0,r.ground,W,H-r.ground);
  }
  for(const [x,y,w,h] of r.platforms){ctx.fillStyle='#3e4147';ctx.fillRect(x,y,w,h);ctx.fillStyle='#81786c';ctx.fillRect(x,y,w,3);ctx.fillStyle='rgba(0,0,0,.30)';ctx.fillRect(x,y+h-3,w,3)}
}
function drawDoors(r){
  ctx.save();
  const arch=(side,hasExit)=>{
    const blocked=hasExit&&exitBlocked(r,side),x=side==='L'?0:W-30;
    ctx.fillStyle=hasExit?'#090a0d':'#28272b';ctx.strokeStyle='#70685d';ctx.lineWidth=3;
    ctx.fillRect(x,r.ground-112,30,112);ctx.strokeRect(x,r.ground-112,30,112);
    if(blocked){
      ctx.fillStyle='#3c3b3d';ctx.globalAlpha=.92;
      for(let i=4;i<30;i+=8)ctx.fillRect(x+i,r.ground-108,3,108);
      ctx.fillRect(x,r.ground-76,30,5);ctx.globalAlpha=1;
      ctx.fillStyle='#8f816c';ctx.fillRect(side==='L'?22:W-30,r.ground-80,8,8);
    }
  };
  arch('L',!!r.L);arch('R',!!r.R);
  ctx.restore();
}
function drawObjects(r){
  for(const o of r.objects){
    if(o.type==='rest'){ctx.fillStyle='#58505c';ctx.fillRect(o.x-13,r.ground-43,26,43);ctx.fillStyle='#e6c86f';ctx.beginPath();ctx.arc(o.x,r.ground-50,7,0,Math.PI*2);ctx.fill()}
    else if(o.type==='device'){ctx.strokeStyle=state.elevatorOn?'#8c826b':'#d5bd72';ctx.lineWidth=3;ctx.beginPath();ctx.arc(o.x,r.ground-35,30,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(o.x-18,r.ground-35);ctx.lineTo(o.x,r.ground-55);ctx.lineTo(o.x+18,r.ground-35);ctx.lineTo(o.x,r.ground-15);ctx.closePath();ctx.stroke()}
    else if(o.type==='elevator'||o.type==='elevatorBack'){ctx.fillStyle='#1b1c21';ctx.fillRect(o.x-56,r.ground-16,112,16);ctx.strokeStyle=state.elevatorOn?'#b0945f':'#4b4b50';ctx.strokeRect(o.x-56,r.ground-16,112,16);ctx.beginPath();ctx.moveTo(o.x-48,110);ctx.lineTo(o.x-48,r.ground-16);ctx.moveTo(o.x+48,110);ctx.lineTo(o.x+48,r.ground-16);ctx.stroke()}
    else if(o.type==='latch'){ctx.strokeStyle=state.westLatch?'#5f625f':'#9c927f';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(o.x,o.y-8);ctx.lineTo(o.x,o.y-52);ctx.stroke();ctx.fillStyle=state.westLatch?'#545754':'#a08d69';ctx.fillRect(o.x-13,o.y-57,26,12);ctx.strokeStyle='#756b5c';ctx.lineWidth=2;for(let yy=o.y-78;yy<o.y-58;yy+=7){ctx.beginPath();ctx.arc(o.x,yy,4,0,Math.PI*2);ctx.stroke()}}
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
  const moving=Math.abs(h.vx)>.35,bob=moving?Math.round(Math.sin(h.anim)*1.4):0;
  const drawX=Math.round(h.x+h.w/2),drawY=Math.round(h.y+h.h+bob);
  if(!Number.isFinite(drawX)||!Number.isFinite(drawY))return;

  const attacking=!ghost&&h.attack>0;
  const recovering=!ghost&&k==='noah'&&h.finisherLock>0&&h.attack<=0&&h.combo===3;
  const attackMax=Math.max(1,h.attackMax||d.attackCd);
  const ap=attacking?Math.max(0,Math.min(1,1-h.attack/attackMax)):0;
  const ease=t=>t*t*(3-2*t);
  const swing=ease(ap);
  const land=Math.max(0,h.land||0);

  if(window.HK_ART&&HK_ART.has&&HK_ART.has(k)){
    let anim='idle',frame=0,scale=1,offsetX=0,offsetY=0;
    if(attacking){
      anim='attack';frame=Math.min(3,Math.floor(ap*4));
      if(k==='noah'&&h.combo===3){offsetX=Math.round(5*Math.sin(ap*Math.PI))}
    }else if(recovering){
      anim='attack';frame=3;offsetY=3;
    }else if(!h.onGround){
      anim='run';frame=h.vy<0?2:4;
    }else if(moving){
      anim='run';frame=Math.floor(h.anim)%6;
    }else{
      anim='idle';frame=Math.floor(performance.now()/180+(k==='noah'?1:0))%4;
    }
    const alpha=(h.inv>0&&Math.floor(h.inv/5)%2===0)?.5:1;
    if(HK_ART.drawHero(ctx,k,{anim,frame,combo:h.combo||0,x:drawX,y:drawY,face:h.face,ghost,alpha,scale,offsetX,offsetY,finisher:k==='noah'&&h.combo===3&&attacking}))return;
  }

  ctx.save();ctx.translate(drawX,drawY);
  if(!ghost&&land>0)ctx.scale(1+land*.006,1-land*.004);
  if(h.face<0)ctx.scale(-1,1);
  if(ghost)ctx.globalAlpha=.24;
  if(h.inv>0&&Math.floor(h.inv/5)%2===0)ctx.globalAlpha*=.5;

  // Ground shadow.
  ctx.fillStyle='rgba(0,0,0,.30)';ctx.beginPath();ctx.ellipse(0,1,d.w*.68,5,0,0,Math.PI*2);ctx.fill();

  let bodyLean=0,bodyDrop=0,headX=0,headY=0;
  let handX=10,handY=-34,weaponX=29,weaponY=-20,weaponW=4;

  if(k==='ethan'&&attacking){
    // Raise the casting arm, fire, then recoil the torso before recovering.
    const recoil=Math.sin(Math.min(1,ap)*Math.PI);
    bodyLean=-recoil*4.2;headX=-recoil*2.4;
    handX=10-recoil*2;handY=-37-recoil*2;
    weaponX=28+recoil*5;weaponY=-27-recoil*2;
  }

  if(k==='noah'&&recovering){
    const rp=1-Math.max(0,h.finisherLock)/(h.finisherMax||46);
    bodyDrop=5*(1-rp*.55);bodyLean=5*(1-rp*.5);headX=1.5;headY=1.2;
    handX=11;handY=-25+rp*2;weaponX=31+rp*2;weaponY=-2-rp*5;weaponW=5.5;
  }else if(k==='noah'&&attacking){
    const step=Math.max(1,Math.min(3,h.combo||1));
    if(step===1){
      // Fast horizontal cut: low wind-up -> broad forward sweep.
      const a0=-1.05,a1=.28,ang=a0+(a1-a0)*swing,len=44;
      bodyLean=3.5*Math.sin(ap*Math.PI);bodyDrop=1.5*Math.sin(ap*Math.PI);
      handX=8+bodyLean*.4;handY=-31;
      weaponX=handX+Math.cos(ang)*len;weaponY=handY+Math.sin(ang)*len;
      weaponW=4.5;
    }else if(step===2){
      // Reverse diagonal: begins low/front and cuts upward across the body.
      const a0=.72,a1=-.82,ang=a0+(a1-a0)*swing,len=47;
      bodyLean=5*Math.sin(ap*Math.PI);headX=bodyLean*.28;
      handX=9;handY=-29-bodyLean*.18;
      weaponX=handX+Math.cos(ang)*len;weaponY=handY+Math.sin(ang)*len;
      weaponW=5;
    }else{
      // Heavy third strike: obvious overhead wind-up followed by a descending cut.
      const wind=Math.min(1,ap/.34),cut=Math.max(0,(ap-.34)/.66);
      const ang=ap<.34?(.05+(-1.55-.05)*ease(wind)):(-1.55+(1.02+1.55)*ease(cut));
      const len=53;
      bodyDrop=ap<.34?3*wind:7*Math.sin(cut*Math.PI);
      bodyLean=ap<.34?-4*wind:7*Math.sin(cut*Math.PI);
      headX=bodyLean*.32;headY=bodyDrop*.22;
      handX=8+bodyLean*.18;handY=-34-bodyDrop*.1;
      weaponX=handX+Math.cos(ang)*len;weaponY=handY+Math.sin(ang)*len;
      weaponW=6;
    }
  }

  // Legs give the attack poses a readable stance.
  ctx.strokeStyle=k==='ethan'?'#7c715d':'#171b31';ctx.lineWidth=6;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(-7,-13+bodyDrop);ctx.lineTo(-10,-1);ctx.moveTo(7,-13+bodyDrop);ctx.lineTo(11,-1);ctx.stroke();

  // Cloak / torso.
  ctx.save();ctx.translate(bodyLean,bodyDrop);
  ctx.fillStyle=k==='ethan'?'#d8cfb7':'#2b3150';
  ctx.beginPath();ctx.moveTo(-13,-d.h+25);ctx.lineTo(13,-d.h+25);ctx.lineTo(18,-5);ctx.lineTo(-15,-5);ctx.closePath();ctx.fill();

  // Shoulder/chest accent.
  ctx.fillStyle=k==='ethan'?'#a58b56':'#514274';
  ctx.fillRect(-9,-d.h+27,18,5);
  ctx.restore();

  // Head follows the body slightly but stays readable.
  ctx.fillStyle=d.color;ctx.beginPath();ctx.arc(headX,-d.h+14+headY,11,0,Math.PI*2);ctx.fill();

  // Back arm / attacking arm.
  ctx.strokeStyle=k==='ethan'?'#c6b98f':'#465076';ctx.lineWidth=5;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(3+bodyLean*.3,-d.h+31+bodyDrop*.25);ctx.lineTo(handX,handY);ctx.stroke();

  if(k==='ethan'){
    // Rune focus / short staff.
    ctx.strokeStyle='#88dbed';ctx.lineWidth=3.5;ctx.beginPath();ctx.moveTo(handX,handY);ctx.lineTo(weaponX,weaponY);ctx.stroke();
    ctx.fillStyle='#e7c66f';ctx.shadowColor='#e7c66f';ctx.shadowBlur=attacking?10:4;ctx.beginPath();ctx.arc(weaponX+2,weaponY,attacking?5:4,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    if(attacking&&ap>.18&&ap<.55){
      ctx.globalAlpha*=.55;ctx.strokeStyle='#f7df8f';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(weaponX+4,weaponY);ctx.lineTo(weaponX+20,weaponY);ctx.stroke();
    }
  }else{
    // Noah's actual blade moves differently for each combo step.
    ctx.strokeStyle='#72dcef';ctx.shadowColor='#72dcef';ctx.shadowBlur=attacking?8:2;ctx.lineWidth=weaponW;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(handX,handY);ctx.lineTo(weaponX,weaponY);ctx.stroke();ctx.shadowBlur=0;
    ctx.fillStyle='#c8f6ff';ctx.beginPath();ctx.arc(handX,handY,2.5,0,Math.PI*2);ctx.fill();
  }

  ctx.restore();
}
function drawEnemy(e){
  if(!e.alive&&performance.now()-e.deadAt>450)return;
  ctx.save();ctx.translate(Math.round(e.x+e.w/2),Math.round(e.y+e.h));
  const hit=Math.max(0,e.hitFlash||0),recoil=hit>0?Math.min(6,hit*.75)*(e.recoilDir||0):0;
  if(recoil)ctx.translate(-recoil,0);
  if(e.face<0)ctx.scale(-1,1);
  if(!e.alive)ctx.globalAlpha=Math.max(0,1-(performance.now()-e.deadAt)/450);

  const wind=Math.max(0,e.attackWind||0),recover=Math.max(0,e.attackRecover||0),flash=hit>0;
  if(recover>0&&e.alive)ctx.globalAlpha*=.82;
  if(e.type==='crawler'){
    const crouch=wind>0?5:0;
    ctx.fillStyle=wind>0?'#66506e':'#4c4057';ctx.beginPath();ctx.ellipse(0,-12+crouch,wind>0?20:18,wind>0?9:12,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=wind>0?'#ffb1b1':'#c27787';ctx.fillRect(7,-16+crouch,wind>0?6:4,wind>0?4:3);
    if(wind>0){ctx.globalAlpha*=.50;ctx.strokeStyle='#b98b7d';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-18,-2);ctx.lineTo(-34,2);ctx.moveTo(18,-2);ctx.lineTo(34,2);ctx.stroke();ctx.globalAlpha*=.55;ctx.beginPath();ctx.moveTo(22,-1);ctx.lineTo(50,-1);ctx.stroke()}
  }else if(e.type==='bat'){
    const fold=wind>0?9:0;
    ctx.fillStyle=wind>0?'#6a5979':'#4e4861';ctx.beginPath();ctx.moveTo(0,-12);ctx.lineTo(-20+fold,-26);ctx.lineTo(-13+fold*.5,-6);ctx.lineTo(0,-16);ctx.lineTo(13-fold*.5,-6);ctx.lineTo(20-fold,-26);ctx.closePath();ctx.fill();
    ctx.fillStyle=wind>0?'#df8cff':'#a477c2';ctx.fillRect(4,-16,wind>0?5:3,wind>0?4:3);
  }else if(e.type==='priest'){
    ctx.fillStyle='#403c4b';ctx.fillRect(-12,-48,24,45);ctx.fillStyle='#746989';ctx.beginPath();ctx.arc(0,-48,10,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=wind>0?'#c6a6ec':'#9b82c0';ctx.lineWidth=wind>0?3:1.5;ctx.beginPath();ctx.moveTo(10,-35);ctx.lineTo(22,-8);ctx.stroke();
    if(wind>0){
      const pulse=.45+.3*Math.sin(performance.now()/70);ctx.globalAlpha*=.75;ctx.fillStyle=`rgba(190,150,240,${pulse})`;ctx.beginPath();ctx.arc(21,-34,5+Math.max(0,28-wind)*.10,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha*=.32;ctx.strokeStyle='#c3a8e6';ctx.beginPath();ctx.moveTo(21,-34);ctx.lineTo(72,-34);ctx.stroke();
    }
  }else if(e.type==='gatekeeper'){
    ctx.fillStyle='#26282d';ctx.fillRect(-28,-84,56,78);ctx.fillStyle='#55565c';ctx.beginPath();ctx.arc(0,-84,28,Math.PI,0);ctx.fill();ctx.fillStyle='#111218';ctx.fillRect(-17,-78,34,9);
    ctx.strokeStyle='#8a7b69';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(24,-58);ctx.lineTo(45,-6);ctx.stroke();
    if(e.wind>0){ctx.strokeStyle='#d1b16d';ctx.lineWidth=3;ctx.globalAlpha=.45+.35*(e.wind/30);ctx.beginPath();ctx.arc(10,-40,66,-1.2,.9);ctx.stroke()}
  }else{
    ctx.fillStyle=wind>0?'#4d494f':'#3b3b41';ctx.fillRect(-14,-50,28,47);ctx.fillStyle='#55535b';ctx.beginPath();ctx.arc(0,-50,12,0,Math.PI*2);ctx.fill();
    if(e.type==='guard'){
      ctx.strokeStyle=wind>0?'#d1b18d':'#7c6c60';ctx.lineWidth=5;ctx.beginPath();
      if(wind>0){ctx.moveTo(9,-37);ctx.lineTo(25,-63)}else{ctx.moveTo(13,-38);ctx.lineTo(16,-3)}ctx.stroke();
      if(wind>0){ctx.fillStyle='#d9bb8f';ctx.beginPath();ctx.arc(25,-64,3,0,Math.PI*2);ctx.fill();ctx.globalAlpha*=.45;ctx.strokeStyle='#b89a78';ctx.lineWidth=2;ctx.beginPath();ctx.arc(11,-33,38,-1.0,.55);ctx.stroke()}
    }
  }

  if(recover>0&&e.alive){
    ctx.globalCompositeOperation='source-over';ctx.globalAlpha*=.42;ctx.strokeStyle='#a59d92';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-10,-2);ctx.lineTo(10,-2);ctx.stroke();
  }
  if(flash&&e.alive){
    ctx.globalCompositeOperation='screen';ctx.globalAlpha=.34;ctx.fillStyle='#ffffff';ctx.fillRect(-e.w*.48,-e.h,e.w*.96,e.h);
  }
  ctx.restore();
}
function drawProjectiles(){
  for(const q of state.projectiles){
    if(q.impact==='rune'&&q.trail){
      for(let i=0;i<q.trail.length;i++){const p=q.trail[i],a=Math.max(0,(p.life||0)/8);ctx.globalAlpha=.08+.22*a;ctx.fillStyle=q.color;ctx.beginPath();ctx.arc(p.x,p.y,2.2+i*.18,0,Math.PI*2);ctx.fill()}
      ctx.globalAlpha=1;
    }
    ctx.fillStyle=q.color;ctx.shadowColor=q.color;ctx.shadowBlur=q.impact==='rune'?13:8;ctx.beginPath();ctx.arc(q.x,q.y,q.r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    if(q.impact==='rune'){ctx.strokeStyle='#fff0a8';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(q.x,q.y,q.r+3,0,Math.PI*2);ctx.stroke()}
  }
  for(const q of state.enemyShots){ctx.fillStyle=q.color;ctx.beginPath();ctx.arc(q.x,q.y,q.r,0,Math.PI*2);ctx.fill()}
}
function drawFx(){
  for(const f of state.fx){
    const max=f.max||16,a=Math.max(0,Math.min(1,f.life/max));ctx.save();ctx.globalAlpha=a;
    if(f.type==='slash'){
      ctx.strokeStyle=f.color;ctx.lineWidth=f.combo===3?7:5;ctx.beginPath();const cx=f.x+(f.face>0?0:f.w),rad=f.combo===3?62:52;
      ctx.arc(cx,f.y+22,rad,f.face>0?-1.0:2.1,f.face>0?.8:4.0);ctx.stroke();
      if(f.combo===3){ctx.globalAlpha*=.32;ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,f.y+22,rad+10,f.face>0?-1.05:2.05,f.face>0?.86:4.07);ctx.stroke()}
    }else if(f.type==='muzzle'){
      ctx.strokeStyle=f.color;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(f.x-f.face*3,f.y);ctx.lineTo(f.x+f.face*(16+(max-f.life)*2),f.y);ctx.stroke();ctx.fillStyle=f.color;ctx.beginPath();ctx.arc(f.x,f.y,3+f.life*.22,0,Math.PI*2);ctx.fill();
    }else if(f.type==='runePulse'){
      const p=1-f.life/max;ctx.strokeStyle=f.color;ctx.lineWidth=2*(1-p)+.5;ctx.beginPath();ctx.arc(f.x,f.y,4+p*16,0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha*=.35;ctx.fillStyle=f.color;ctx.beginPath();ctx.arc(f.x,f.y,3+(1-p)*3,0,Math.PI*2);ctx.fill();
    }else if(f.type==='swap'){
      const p=1-f.life/max;ctx.strokeStyle=f.color;ctx.lineWidth=2;ctx.beginPath();ctx.arc(f.x,f.y,14+p*34,0,Math.PI*2);ctx.stroke();ctx.globalAlpha*=.35;ctx.beginPath();ctx.arc(f.x,f.y,7+p*22,0,Math.PI*2);ctx.stroke();
    }else if(f.type==='gateDust'){
      ctx.fillStyle=f.color;const p=1-f.life/max;for(let i=0;i<8;i++){const dx=(i-3.5)*5,dy=-p*(10+(i%3)*4);ctx.globalAlpha=a*(.2+.06*i);ctx.fillRect(f.x+dx,f.y+dy,4,3)}
    }else if(f.type==='jumpDust'||f.type==='landDust'){
      ctx.fillStyle=f.color;const spread=f.type==='landDust'?24:16;for(let i=0;i<6;i++){const t=i/5-.5;ctx.globalAlpha=a*(.35+Math.abs(t)*.3);ctx.fillRect(f.x+t*spread-(max-f.life)*t*1.5,f.y-2-Math.abs(t)*4,3,2)}
    }else if(f.type==='spark'){
      ctx.fillStyle=f.color;for(let i=0;i<6;i++){const an=i*1.05+f.life;const rr=(max-f.life)*1.4+5;ctx.fillRect(f.x+Math.cos(an)*rr,f.y+Math.sin(an)*rr,3,3)}
    }else if(f.type==='hitRing'){
      const p=1-f.life/max;ctx.strokeStyle=f.color;ctx.lineWidth=2.5*(1-p)+.6;ctx.beginPath();ctx.arc(f.x,f.y,5+p*20,0,Math.PI*2);ctx.stroke();
    }else if(f.type==='enemyBurst'){
      ctx.fillStyle=f.color;const p=1-f.life/max;for(let i=0;i<8;i++){const an=i*Math.PI/4+.3,rr=7+p*24;ctx.fillRect(f.x+Math.cos(an)*rr,f.y+Math.sin(an)*rr,3,3)}
    }else if(f.type==='enemySlash'){
      ctx.strokeStyle=f.color;ctx.lineWidth=5;ctx.beginPath();ctx.arc(f.x,f.y,52,f.face>0?-1.15:2.0,f.face>0?.72:4.0);ctx.stroke();
    }else if(f.type==='castFlash'){
      const p=1-f.life/max;ctx.strokeStyle=f.color;ctx.lineWidth=2;ctx.beginPath();ctx.arc(f.x,f.y,5+p*19,0,Math.PI*2);ctx.stroke();ctx.globalAlpha*=.35;ctx.fillStyle=f.color;ctx.beginPath();ctx.arc(f.x,f.y,4+p*7,0,Math.PI*2);ctx.fill();
    }else if(f.type==='dust'){
      ctx.fillStyle='#a09388';for(let i=0;i<7;i++)ctx.fillRect(f.x+(i-3)*5,f.y-(18-f.life)*2+(i%3)*4,4,4);
    }else if(f.type==='bossArc'){
      ctx.strokeStyle='#cdb27a';ctx.lineWidth=7;ctx.beginPath();ctx.arc(f.x,f.y,95,f.face>0?-1.2:2.0,f.face>0?.7:4.1);ctx.stroke();
    }
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
  ctx.clearRect(0,0,W,H);const r=activeRoom();
  ctx.save();
  if(state.shake>0&&state.shakeAmp>0){
    const t=performance.now()*.045,fade=Math.min(1,state.shake/8),amp=state.shakeAmp*fade;
    ctx.translate(Math.round(Math.sin(t)*amp),Math.round(Math.cos(t*1.37)*amp*.62));
  }
  drawBackground(r);drawDoors(r);drawObjects(r);
  drawHero(otherKey(),true);for(const e of roomState(r.id).enemies)drawEnemy(e);drawProjectiles();drawHero(state.active,false);drawFx();drawBossHp();
  if(state.bellRung&&r.id==='central'){ctx.globalAlpha=.16;ctx.fillStyle='#d5b66a';ctx.beginPath();ctx.arc(755,250,110,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}
  ctx.restore();
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
ui.startBtn.addEventListener('click',()=>{requestLandscapeMode();newGame()});
ui.landscapeBtn?.addEventListener('click',()=>{requestLandscapeMode();if(!state.started)newGame()});
ui.retryBtn.addEventListener('click',retry);ui.clearAgain.addEventListener('click',newGame);

let last=performance.now();
function frame(t){
  const dt=Math.min(2.2,(t-last)/16.67);last=t;
  try{update(dt);draw()}catch(err){console.error('HOLLOW KEEP frame recovered',err);if(t-state.lastError>1200){state.lastError=t;toast('화면을 복구했습니다.',700)}}
  requestAnimationFrame(frame);
}
spawnRoom('gate');updateHud();requestAnimationFrame(frame);
})();
