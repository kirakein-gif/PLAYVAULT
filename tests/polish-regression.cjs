const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=require('node:path').join(__dirname,'../games/abyssfall-eclipse');
function harness(mobile=false,dpr=1,delayImages=false){
 const pendingImages=[];
 let now=10000,raf,created=0;const timers=[],draws=[],elements=new Map(),listeners={};
 const gradient={addColorStop(){}};
 const ctx=new Proxy({drawImage(...a){draws.push(a)},createLinearGradient(){return gradient},createRadialGradient(){return gradient}}, {get(t,k){return k in t?t[k]:()=>{}}});
 function el(id){if(!elements.has(id)){
  const classes=new Set(),e={style:{setProperty(){}},dataset:{},children:[],classList:{add(x){classes.add(x)},remove(x){classes.delete(x)},contains(x){return classes.has(x)},toggle(){}},addEventListener(){},setAttribute(){},appendChild(c){this.children.push(c)},getBoundingClientRect(){return {left:0,top:0,width:112,height:112}},getContext(){return ctx},toDataURL(){return 'data:image/png;base64,'},querySelector(s){return el(id+s)},querySelectorAll(){return []},closest(){return null},textContent:'',innerHTML:''};elements.set(id,e);
 }return elements.get(id)}
 class Image{constructor(){this.complete=true;this.naturalWidth=1536;this.width=1536;this.height=1024}set src(x){this._src=x;if(x.includes('room-')&&x.includes('-v5')){this.width=916;this.height=1717}else if(x.includes('relics-v5')){this.width=1448;this.height=1086}if(delayImages){this.complete=false;pendingImages.push(this)}else this.onload?.()}}
 const env={console,AF_ATLAS:{frames:{idle:[[0,0]]},images:{},loaded:{}},Image,location:{hostname:'127.0.0.1'},performance:{now:()=>now},innerWidth:mobile?390:1440,innerHeight:mobile?844:960,devicePixelRatio:dpr,matchMedia:()=>({matches:mobile}),localStorage:{getItem(){return null},setItem(){}},document:{getElementById:el,querySelectorAll(){return []},documentElement:el('root'),createElement:()=>el('made'+created++)},addEventListener(type,fn){(listeners[type]??=[]).push(fn)},setTimeout(fn,ms){timers.push({fn,at:now+ms});return timers.length},clearTimeout(){},requestAnimationFrame(fn){raf=fn},fetch:async()=>({ok:false,status:404})};env.window=env;vm.createContext(env);
 for(const file of ['art.js','core.js','render.js'])vm.runInContext(fs.readFileSync(root+'/'+file,'utf8'),env,{filename:file});
 const A=env.AF;
 function advance(ms){now+=ms;for(let i=timers.length-1;i>=0;i--)if(timers[i].at<=now){const {fn}=timers.splice(i,1)[0];fn()}if(A.started&&!A.dead&&!A.paused)A.update(1)}
 return {env,A,ctx,draws,completeImages(failCombat=false){for(const im of pendingImages){im.complete=true;if(failCombat&&im._src.includes('ethan-combat'))im.onerror?.();else im.onload?.()}},frame(){raf(now)},advance,elements,key(code,key,repeat=false,target={}){const event={code,key,repeat,target,preventDefault(){this.prevented=true}};for(const fn of listeners.keydown||[])fn(event);return event}};
}

// Player cadence and auto-targeting must not override a moving character's gait.
{
 const h=harness(),{A}=h;A.newRun();A.player.inv=9999;
 const x=A.player.x;A.keys.d=true;
 for(let i=0;i<60;i++)h.advance(17);
 assert.ok(A.player.step>=7&&A.player.step<=9,'about eight run frames per second');
 assert.ok(Math.abs(A.player.x-x-60*A.player.speed)<.01,'animation changes do not alter movement speed');
 A.keys.d=false;A.player.faceX=-1;A.keys.w=true;h.advance(17);assert.equal(A.player.faceX,-1,'vertical movement preserves facing');A.keys.w=false;
 const room=Object.values(A.rooms).find(r=>r.type==='combat');A.current=`${room.x},${room.y}`;A.update(1);A.player.basic=0;
 room.enemies.forEach(e=>{e.x=A.player.x-60;e.y=A.player.y;e.s=0;e.aiCd=9999});A.keys.d=true;h.advance(17);
 assert.ok(A.player.faceX>0,'automatic fire behind player preserves movement direction');
 A.player.attackPose=14;A.player.hurtPose=0;A.player.inv=0;A.player.specialPose=0;h.draws.length=0;h.frame();
 const frame=h.draws.find(d=>d[0]===h.env.AF_ART.images.ethanCombat);assert.ok(frame,'Ethan visibly swings his sword while moving');
 A.player.specialPose=24;A.player.attackAt=10000;h.draws.length=0;h.frame();
 assert.ok(h.draws.some(d=>d[0]===h.env.AF_ART.images.ethanCombat),'moving special still has attack animation');
 console.log('PASS movement: grounded cadence, unchanged speed, stable facing, moving basic and special poses');
}
// Use genuine XP pickup flow, then choose the displayed option by its actual key.
for(const code of ['Digit1','Digit2','Digit3','Numpad1','Numpad2','Numpad3']){
 const h=harness(),{A}=h;A.newRun();const p=A.player;
 A.pickups.push({x:p.x,y:p.y,val:p.nextXp});h.advance(17);
 assert.equal(A.paused,true);assert.equal(A.rewardChoices.length,3);
 const index=Number(code.slice(-1))-1,chosen=A.rewardChoices[index],before={...p},expected={...p};chosen.f(expected);
 h.key(code,String(index+1),true);assert.equal(A.rewardChoices.length,3,'held keys do not auto-select');
 h.key(code,String(index+1),false,{tagName:'INPUT'});assert.equal(A.rewardChoices.length,3,'editable fields keep their keys');
 assert.equal(h.key(code,String(index+1)).prevented,true);
 assert.equal(A.paused,false);assert.equal(A.rewardChoices.length,0);
 for(const stat of ['atk','rate','range','specialBoost','maxHp','hp'])assert.equal(p[stat],expected[stat],chosen.n+': '+stat);
 h.key(code,String(index+1));for(const stat of ['atk','rate','range','specialBoost','maxHp','hp'])assert.equal(p[stat],expected[stat],'selection applies only once');
 assert.equal(h.elements.get('levelUp').classList.contains('show'),false);
 assert.ok(Object.keys(before).length);
}
console.log('PASS rewards: 1/2/3 and numpad match displayed choices, no repeat/double apply or input-field hijack');
// The art's side passages and actual crossings use the same ground position.
for(const mobile of [false,true])for(const d of ['N','S','W','E']){
 const h=harness(mobile),{A}=h;A.newRun();const [x,y,opp]={N:[0,-1,'S'],S:[0,1,'N'],W:[-1,0,'E'],E:[1,0,'W']}[d],target=`${x},${y}`;
 const start=A.cur();start.doors={[d]:true};start.clear=true;
 A.rooms[target]={x,y,type:'empty',doors:{[opp]:true},clear:true,enemies:[],seen:false};
 A.player.x=d==='W'?A.arena.x+A.player.r:d==='E'?A.arena.x+A.arena.w-A.player.r:A.W/2;
 A.player.y=d==='N'?A.arena.y+A.player.r:d==='S'?A.arena.y+A.arena.h-A.player.r:A.sideDoorY();
 A.update(1);assert.equal(A.current,target,'cross '+d);
 if(d==='W'||d==='E')assert.equal(A.player.y,A.sideDoorY(),'arrival follows physical side passage');
}
{
 const h=harness(),art=h.env.AF_ART;assert.equal(Object.keys(art.relicIcons).length,12);
 for(const [id,[x,y,w,height]] of Object.entries(art.relicFrames)){assert.ok(x>=0&&y>=0&&x+w<=1448&&y+height<=1086,id+' stays in atlas');assert.ok(Math.max(w,height)>=350,id+' retains native detail')}
 for(let zone=0;zone<8;zone++)for(const clear of [false,true]){
  const room={doors:{N:true,S:true,W:true,E:true},clear},scene=art.room(zone,room,()=>clear);
  assert.equal(scene.width,916);assert.equal(scene.height,572);assert.equal(art.room(zone,room,()=>clear),scene,'reuse composed scene');
  assert.notEqual(art.room(zone,room,()=>!clear),scene,'door state has distinct scene');
 }
}
console.log('PASS integrated art: four actual crossings on desktop/mobile, all relic bounds, all zones and cached door states');
// Elevated drawing must preserve floor-plane travel, damage and collision radius.
for(const mobile of [false,true])for(const faceX of [-1,1]){
 const h=harness(mobile),{A}=h;A.newRun();const p=A.player;p.faceX=faceX;
 for(const type of ['crawler','shooter','brute','boss'])for(const [vx,vy] of [[7,0],[-7,0],[0,7],[0,-7],[5,5]]){
  const target={type,x:p.x+vx*20,y:p.y+vy*20},q={x:p.x,y:p.y,vx,vy,r:5,dmg:21},before={...q};
  A.presentProjectile(q,p,target);for(const k of Object.keys(before))assert.equal(q[k],before[k],k+' stays on collision plane');
  const launch=A.projectileScreen(q);assert.ok(launch.y<p.y-25);assert.equal(Math.sign(launch.x-p.x),faceX);
  q.visualAge=20;q.x=target.x;q.y=target.y;
  const hit=A.projectileScreen(q);assert.ok(Math.abs(hit.x-target.x)<1e-8);assert.ok(hit.y<target.y);assert.ok(Number.isFinite(hit.angle));
 }
 const room=Object.values(A.rooms).find(r=>r.type==='combat');A.current=`${room.x},${room.y}`;A.update(0);
 const target=room.enemies[0];room.enemies.forEach(e=>e.alive=false);target.alive=true;target.type='crawler';target.s=0;target.stun=9999;target.hp=target.max=1000;
 p.hero=A.heroes.night;p.inv=9999;p.basic=0;target.x=p.x+110;target.y=p.y;A.update(1);
 const shot=A.projectiles.find(q=>q.kind==='crescent');assert.ok(shot&&shot.visualDistance);const hp=target.hp;p.basic=9999;
 for(let i=0;i<100&&A.projectiles.includes(shot);i++)A.update(1);
 assert.equal(target.hp,hp-p.hero.damage-p.atk,'original projectile damage');assert.ok(!A.projectiles.includes(shot),'original collision removes spent projectile');
 target.type='shooter';target.aiWindup=1;target.shotAngle=0;target.stun=0;target.faceX=1;p.basic=9999;
 A.update(1);const bolt=A.projectiles.find(q=>q.kind==='priestBolt');assert.ok(bolt&&bolt.launchHeight>50,'real priest casts from staff height');
}
console.log('PASS hand launch: both facings, all target heights and directions, real player/priest firing, unchanged damage and collision');
{
 const h=harness(),{A}=h;A.newRun();
 const pool=Object.values(A.rooms).find(r=>r.type==='recovery');A.current=`${pool.x},${pool.y}`;
 A.player.x=A.W/2+160;A.player.y=A.arena.y+A.arena.h*.72;pool.used=false;h.draws.length=0;h.frame();
 const before=h.draws.find(d=>d[0]===h.env.AF_ART.images.props);assert.ok(before);
 pool.used=true;h.draws.length=0;h.frame();const after=h.draws.find(d=>d[0]===h.env.AF_ART.images.props);
 assert.deepEqual(after.slice(1),before.slice(1),'used well keeps identical sampling, position, width and height');
 A.newRun();const p=A.player,startXp=p.xp;
 A.pickups.push({x:p.x+75,y:p.y,vx:0,vy:0,val:3});h.advance(17);assert.equal(A.pickups[0].attracted,true);
 for(let i=0;i<30&&A.pickups.length;i++)h.advance(17);
 assert.equal(A.pickups.length,0);assert.equal(p.xp,startXp+3);assert.ok(A.soulBursts.length>0,'absorbed soul rises toward torso');
 for(let i=0;i<24;i++)h.advance(17);assert.equal(A.soulBursts.length,0,'short absorption tails expire');
 console.log('PASS well and souls: exact fixed basin geometry, same XP gain, attraction, absorption and cleanup');
}
{
 const h=harness(),{A}=h;A.newRun();
 const room=Object.values(A.rooms).find(r=>r.type==='combat');A.current=`${room.x},${room.y}`;A.update(1);
 for(const d of Object.keys(room.doors))assert.equal(A.isDoorOpen(d),false,'combat closes actual doors');
 A.player.inv=9999;room.enemies.forEach(e=>A.damage(e,e.max));h.advance(17);assert.equal(room.clear,true);
 for(const d of Object.keys(room.doors).filter(d=>room.doors[d]))assert.equal(A.isDoorOpen(d),true,'cleared combat opens doors');
 A.nextFloor();A.nextFloor();
 const boss=Object.values(A.rooms).find(r=>r.type==='boss'),neighbor=Object.values(A.rooms).find(r=>Math.abs(r.x-boss.x)+Math.abs(r.y-boss.y)===1&&r.doors[Object.keys(A.dirs).find(d=>r.x+A.dirs[d][0]===boss.x&&r.y+A.dirs[d][1]===boss.y)]);
 assert.ok(neighbor);neighbor.clear=true;A.current=`${neighbor.x},${neighbor.y}`;
 const dir=Object.keys(A.dirs).find(d=>neighbor.x+A.dirs[d][0]===boss.x&&neighbor.y+A.dirs[d][1]===boss.y);
 assert.equal(A.isDoorOpen(dir),false,'boss seal keeps door closed after combat');A.bossUnlocked=true;assert.equal(A.isDoorOpen(dir),true);
 console.log('PASS doors: combat closure, clear opening, sealed boss remains locked');
}
// Every boss entrance orientation shares the seal lock; breaking the object leaves the table intact.
{
 const h=harness(),{A}=h;A.newRun();const room=A.cur();room.clear=true;
 for(const [d,v] of Object.entries(A.dirs)){
  room.doors[d]=true;A.rooms[`${room.x+v[0]},${room.y+v[1]}`]={x:room.x+v[0],y:room.y+v[1],type:'boss',doors:{},enemies:[]};
  A.bossUnlocked=false;assert.equal(A.isDoorOpen(d),false);A.bossUnlocked=true;assert.equal(A.isDoorOpen(d),true);
 }
 room.sealAltar=true;room.sealBroken=false;A.player.x=A.W/2+130;A.player.y=A.arena.y+A.arena.h/2;
 h.draws.length=0;h.frame();const before=h.draws.find(d=>d[0]===h.env.AF_ART.images.props);
 A.player.x=A.W/2;A.bossUnlocked=false;A.update(1);assert.equal(room.sealBroken,true);assert.equal(A.bossUnlocked,true);
 h.draws.length=0;h.frame();const after=h.draws.find(d=>d[0]===h.env.AF_ART.images.props);
 assert.deepEqual(before.slice(1),after.slice(1),'seal object breaks without changing the altar image or position');
 console.log('PASS seal object: intact table before/after, final seal unlock, four boss door directions');
}
for(const mobile of [false,true])for(const dpr of [1,2,3]){
 const h=harness(mobile,dpr),{A}=h;A.newRun();
 assert.equal(A.W,mobile?720:960);assert.equal(A.H,mobile?900:640);
 assert.equal(A.renderScaleX,A.canvas.width/A.W);assert.ok(A.canvas.width<=Math.round((mobile?390:1440)*2));
 assert.equal(A.ctx.imageSmoothingEnabled,false);
 for(let floor=1;floor<=24;floor++){
  assert.equal(A.floor,floor);assert.equal(A.isBossFloor(),floor%3===0);
  const rooms=Object.values(A.rooms);assert.equal(rooms.length,A.roomTarget());
  if(floor%3===0){
   assert.equal(rooms.filter(r=>r.sealAltar).length,{3:2,6:3,9:3,12:4,15:4,18:4,21:5,24:5}[floor]);
   const boss=rooms.find(r=>r.type==='boss');assert.ok(boss);
   A.current=`${boss.x},${boss.y}`;A.bossUnlocked=true;A.player.x=A.W/2;A.player.y=A.arena.y+A.arena.h-80;A.player.inv=9999;A.update(1);
   const e=boss.enemies.find(e=>e.type==='boss');assert.ok(e);e.intro=0;
   for(let hit=0;hit<12&&e.alive;hit++)A.damage(e,e.max);
   assert.equal(e.alive,false);assert.equal(boss.bossDefeated,true);assert.equal(A.paused,false);assert.equal(A.transitioning,false);
   A.player.x=A.W/2;A.player.y=A.arena.y+A.arena.h/2;
   h.advance(730);assert.equal(A.transitioning,true,'stairs trigger after unlock');h.advance(1000);
   if(floor===24){assert.equal(A.cleared,true);assert.equal(A.paused,true)}else assert.equal(A.floor,floor+1);
  }else A.nextFloor();
 }
 A.newRun();A.player.inv=9999;
 const combat=Object.values(A.rooms).find(r=>r.type==='combat');A.current=`${combat.x},${combat.y}`;A.update(1);
 for(let i=0;i<120;i++){h.advance(17);h.frame()}
 assert.ok(h.draws.length>0);assert.ok(Number.isFinite(A.player.x));
 for(const hero of ['dawn','night'])for(const [anim,count] of [['idle',4],['run',6],['attack',4],['hurt',2],['death',4]])for(let i=0;i<count;i++){
  const f=h.env.AF_ART.hero(hero,anim,i),width=f.image==='actions'?1254:1536,height=f.image==='actions'?1254:1024;assert.ok(f.x>=0&&f.y>=0&&f.x+f.w<=width&&f.y+f.h<=height);assert.ok(f.foot<=f.h);
 }
 console.log(`PASS ${mobile?'mobile':'desktop'} DPR ${dpr}: 24 floors, seals, boss defeat, stairs, clear, combat rendering, frame bounds`);
}

// Actual movement simulation: inertia on ice, braking on stone and room resets.
for(const mobile of [false,true]){
 const h=harness(mobile),{A}=h;A.newRun();while(A.floor<13)A.nextFloor();
 const r=Object.values(A.rooms).find(r=>r.type==='combat');A.current=`${r.x},${r.y}`;A.update(0);r.enemies.forEach(e=>{e.s=0;e.stun=999999;e.x=A.arena.x+30;e.y=A.arena.y+30});
 const ice=A.fieldPatches(r)[0],p=A.player;p.basic=9999;p.x=ice.x-35;p.y=ice.y;p.inv=9999;
 A.keys.d=true;for(let i=0;i<12;i++)A.update(1);A.keys.d=false;const before=p.x;
 A.update(1);assert.ok(p.x>before+1,'released movement retains ice momentum');
 const speed=p.slideX;A.keys.a=true;A.update(1);assert.ok(p.slideX<speed,'counter-steering brakes');A.keys.a=false;
 p.x=A.W/2;p.y=A.arena.y+20;p.slideX=2;A.update(1);assert.ok(p.slideX>1,'whole ice room retains inertia outside old patches');r.clear=true;A.update(1);assert.ok(p.slideX>1,'cleared ice remains slippery');
 p.slideX=3;A.nextFloor();assert.equal(p.slideX,0,'floor transfer resets velocity');
}
console.log('PASS ice: real inertia, counter-steering, whole-room/cleared ice and floor reset on desktop/touch layouts');
// Shared contact geometry, warning periods, pulse cooldown and repeated damage.
for(const floor of [16,19,22])for(const mobile of [false,true]){
 const h=harness(mobile),{A}=h;A.newRun();while(A.floor<floor)A.nextFloor();
 const room=Object.values(A.rooms).find(r=>r.type==='combat');A.current=`${room.x},${room.y}`;A.update(0);room.enemies.forEach(e=>{e.s=0;e.stun=999999;e.x=A.arena.x+30;e.y=A.arena.y+30});
 const hazard=A.fieldPatches(room).find(x=>x.kind==='lava'||x.kind==='poison'),p=A.player;
 p.basic=9999;p.hp=p.maxHp=1000;p.inv=0;p.x=hazard.x;p.y=hazard.y;
 assert.equal(A.fieldState(room,hazard),'warning');const hp=p.hp;A.update(1);assert.equal(p.hp,hp,'initial warning never damages');
 room.fieldAge=hazard.kind==='lava'?260-hazard.phase:100;A.update(1);assert.ok(p.hp<hp,'standing on active terrain damages');
 const once=p.hp;for(let i=0;i<10;i++)A.update(1);assert.equal(p.hp,once,'invulnerability prevents frame-rate multiplied damage');
 room.fieldAge=hazard.kind==='lava'?260-hazard.phase:100;p.inv=0;A.update(1);assert.ok(p.hp<once,'continued contact causes another tick');
 room.clear=true;p.inv=0;const cleared=p.hp;A.update(1);assert.equal(p.hp,cleared,'cleared room is safe');
 room.clear=false;p.x=A.W/2;p.y=A.arena.y+20;p.inv=0;const outside=p.hp;A.update(1);assert.equal(p.hp,outside,'door corridor is safe');
 h.frame();assert.ok(h.draws.length>0,'new regional terrain renders');
}
console.log('PASS fields: visible terrain contact, entry warning, damage ticks, cleared-room and passage safety for all new danger zones');
// Inspect actual spawned populations and live shooter cycles at fixed randomness.
const samples=[];
for(const floor of [12,15,18,21,24]){
 const h=harness(),{A}=h;A.newRun();while(A.floor<floor)A.nextFloor();vm.runInContext('Math.random=()=>.1',h.env);
 const r=Object.values(A.rooms).find(r=>r.type==='combat');A.current=`${r.x},${r.y}`;A.player.inv=99999;A.player.basic=99999;A.update(1);
 const e=r.enemies.find(e=>e.type==='shooter');assert.ok(e);e.x=A.W/2+190;e.y=A.player.y;e.aiWindup=1;e.shotAngle=0;A.update(1);
 samples.push({floor,hp:Math.round(e.max),damage:+e.d.toFixed(1),speed:+e.s.toFixed(2),cooldown:+e.fire.toFixed(1),count:r.enemies.length,bolts:A.projectiles.filter(p=>p.team==='e').length});
}
for(let i=1;i<samples.length;i++){const a=samples[i-1],b=samples[i];assert.ok(b.hp>a.hp&&b.damage>a.damage&&b.speed>a.speed&&b.cooldown<a.cooldown&&b.count>a.count,'deeper rooms are tougher across several independent axes')}
assert.equal(samples.at(-1).bolts,5,'deep priest spread expands');console.table(samples);
{
 const h=harness(),{A}=h;A.newRun();while(A.floor<24)A.nextFloor();A.endless=true;A.nextFloor('endless');assert.equal(A.floor,25);assert.equal(A.cleared,false);assert.equal(A.zoneIndex(),0);
}
console.log('PASS depth: stronger, faster, more frequent and more numerous enemies; expanded spread; endless starts at 25');
for(const mobile of [false,true])for(const d of ['N','S','E','W']){
 const h=harness(mobile),{A}=h;A.newRun();while(A.floor<24)A.nextFloor();
 const [dx,dy]=A.dirs[d],target=`${dx},${dy}`,r=A.cur();r.clear=true;r.doors={[d]:true};
 A.rooms[target]={x:dx,y:dy,type:'combat',doors:{},clear:false,spawned:false,enemies:[],hazards:[],gimmickTimer:999};
 A.player.x=d==='W'?A.arena.x+A.player.r:d==='E'?A.arena.x+A.arena.w-A.player.r:A.W/2;
 A.player.y=d==='N'?A.arena.y+A.player.r:d==='S'?A.arena.y+A.arena.h-A.player.r:A.sideDoorY();
 A.player.inv=9999;A.update(0);assert.equal(A.current,target);assert.ok(A.cur().enemies.length>=10);
 assert.ok(A.cur().enemies.every(e=>Math.hypot(e.x-A.player.x,e.y-A.player.y)>=150),'deep crowds spawn away from the actual doorway arrival');
}
console.log('PASS deep arrivals: full-size enemy groups remain outside entry safety distance on all four sides and both layouts');

// Reproduce the frozen reward screen: stairs scheduled first, then an XP choice.
{
 const h=harness(),{A}=h;A.newRun();while(A.floor<13)A.nextFloor();
 const r=Object.values(A.rooms).find(r=>r.type==='exit');A.current=`${r.x},${r.y}`;r.clear=true;r.spawned=true;r.enemies=[];
 A.player.x=A.W/2;A.player.y=A.arena.y+A.arena.h/2;A.pickups.push({x:A.player.x,y:A.player.y,val:A.player.nextXp});A.update(1);
 assert.equal(A.paused,true);assert.equal(A.rewardChoices.length,3);h.advance(1000);
 assert.equal(A.floor,13,'stairs wait while a choice is open');assert.equal(A.paused,true);
 h.key('Digit1','1');assert.equal(A.floor,14);assert.equal(A.paused,false);assert.equal(A.rewardChoices.length,0);assert.equal(h.elements.get('levelUp').classList.contains('show'),false);
}
// Multiple XP thresholds are presented in order rather than replacing a choice.
{
 const h=harness(),{A}=h;A.newRun();const p=A.player;p.nextXp=18;
 A.pickups.push({x:p.x,y:p.y,val:80});A.update(1);const level=p.level;
 A.nextFloor();assert.equal(A.floor,1);let picks=0;
 while(A.rewardChoices.length){h.key('Digit1','1');picks++;assert.ok(picks<10)}
 assert.equal(p.level-level,picks-1);assert.equal(A.floor,2);assert.equal(A.paused,false);
}
// Local-only temporary key: no held-key repeats, editable-field interception or stale dialog.
{
 const h=harness(),{A}=h;h.key('Backquote','`');assert.equal(A.floor,1);A.newRun();
 A.pickups.push({x:A.player.x,y:A.player.y,val:18});A.update(1);h.key('Backquote','`',true);assert.equal(A.floor,1);
 h.key('Backquote','`',false,{tagName:'INPUT'});assert.equal(A.floor,1);
 h.key('Backquote','`');assert.equal(A.floor,2);assert.equal(A.rewardChoices.length,0);assert.equal(A.paused,false);assert.equal(A.testRun,true);
 h.env.location.hostname='kirakein-gif.github.io';h.key('Backquote','`');assert.equal(A.floor,2,'test key is disabled on public site');
 assert.match(h.elements.get('floorText').textContent,/지하 2층/);
}
{
 const h=harness(),{A}=h;A.newRun();while(A.floor<4)A.nextFloor();const r=A.cur();r.clear=true;
 const z=A.stageZone(r,'fog',0);A.player.x=z.x;A.player.y=z.y;A.keys.d=true;const x=A.player.x;A.update(1);
 assert.ok(A.player.x-x<A.player.speed,'fog slows movement after combat');assert.ok(A.fogCount(r)>=7);h.frame();
}
console.log('PASS v40: reward/descent race, queued upgrades, local cheat guards, underground labels and persistent dense fog');
{
 const h=harness(),{A}=h;A.newRun();h.advance(1000);
 assert.equal(A.ui.toast.classList.contains('show'),false,'no opening prose on floor one');
 for(let floor=2;floor<=24;floor++){
  A.nextFloor();const arrival=A.ui.toast.textContent;h.advance(1000);
  assert.equal(A.ui.toast.textContent,(floor-1)%3===0?A.stageTip():arrival,'prose only at biome boundaries: floor '+floor);
 }
}
console.log('PASS v44: no floor-one prose; atmosphere only on floors 4, 7, 10, 13, 16, 19 and 22');
{
 const h=harness(),{A}=h;A.newRun();let previousHp=0,previousArmor=0;const names=new Set();
 for(let zone=0;zone<8;zone++){
  while(A.floor<(zone+1)*3)A.nextFloor();const r=Object.values(A.rooms).find(r=>r.type==='boss');A.current=`${r.x},${r.y}`;A.player.inv=99999;A.update(1);const b=r.enemies[0];
  names.add(b.bossName);assert.ok(b.max>previousHp&&b.armor>previousArmor);previousHp=b.max;previousArmor=b.armor;b.intro=0;
  for(const phase of [0,1,2])for(const pattern of b.profile.patterns){
   b.hp=b.max*(phase===0?.9:phase===1?.5:.2);b.bossPattern=pattern;b.bossPhase=phase;b.bossAim=0;b.bossTelegraph=1;b.bossRush=0;A.update(1);h.frame();
   assert.equal(b.bossPattern,-1);assert.ok(Number.isFinite(b.x)&&Number.isFinite(b.y));
   if(pattern===4){assert.ok(b.bossRush>0);for(let i=0;i<30;i++)A.update(1);assert.ok(A.slashes.some(f=>f.bossWeapon),'rush ends with real melee swing')}
   if([3,5,6].includes(pattern))assert.ok(A.slashes.some(f=>f.bossWeapon));
  }
 }
 assert.equal(names.size,8);assert.equal(A.enemyVariant(4,'crawler'),'frostWolf');assert.equal(A.enemyVariant(4,'brute'),'frostKnight');assert.equal(A.enemyVariant(7,'shooter'),'voidKnight');
}
console.log('PASS v46: eight boss identities, increasing HP/armor, all phase attacks, rush finish and regional roster');
// Walking comes from real distance; repeated drawing and stopped AI cannot animate feet.
for(const floor of [1,4,7,10,13,16,19,22]){
 const h=harness(),{A}=h;A.newRun();while(A.floor<floor)A.nextFloor();
 const r=Object.values(A.rooms).find(r=>r.type==='combat');A.current=`${r.x},${r.y}`;A.player.inv=99999;A.player.basic=99999;vm.runInContext('Math.random=()=>.9',h.env);A.update(1);
 const e=r.enemies.find(e=>e.type==='crawler');r.enemies=[e];e.aiCd=99999;e.aiWindup=0;e.attackPose=0;e.x=A.W/2-250;e.y=A.arena.y+A.arena.h*.5;A.player.x=A.W/2+250;A.player.y=e.y;
 const seen=new Set(),start=e.x;for(let i=0;i<100;i++){A.update(1);const f=h.env.AF_ART.enemyWalk(e);assert.ok(f,'walking sprite on floor '+floor);seen.add(f.x);h.frame()}
 assert.equal(seen.size,6,'all six foot poses appear through genuine AI movement');assert.ok(Math.abs(e.x-start-100*e.s)<.001,'walking does not change chase speed');
 const phase=e.walkCycle;for(let i=0;i<12;i++)h.frame();assert.equal(e.walkCycle,phase,'rendering never advances footsteps');
 e.s=0;A.update(1);assert.equal(e.walkCycle,phase);assert.equal(h.env.AF_ART.enemyWalk(e),null,'stopped enemy uses stationary art');
 e.moving=true;e.aiWindup=12;assert.equal(h.env.AF_ART.enemyWalk(e),null,'attack windup has priority over walk');
}
console.log('PASS v47: six distinct walking poses per region, distance cadence, unchanged speed, stopped feet and attack priority');
for(const mobile of [false,true]){
 const h=harness(mobile),{A}=h;A.newRun();const room=Object.values(A.rooms).find(r=>r.type==='combat');A.current=`${room.x},${room.y}`;A.update(0);const p=A.player;
 const template=room.enemies[0],enemy=(x)=>({...template,type:'crawler',x,y:p.y,r:18,hp:1000,max:1000,armor:0,s:0,stun:99999,aiCd:99999,aiWindup:0,dash:0,alive:true});
 p.inv=9999;p.basic=0;const front=enemy(p.x+60),behind=enemy(p.x-80),far=enemy(p.x+270);room.enemies=[front,behind,far];A.update(1);
 assert.equal(front.hp,1000,'sword windup has no premature damage');for(let i=0;i<6;i++)A.update(1);assert.equal(front.hp,976,'damage occurs with the sword swing');assert.equal(behind.hp,1000,'sword has a directional arc');assert.equal(far.hp,1000,'sword cannot hit ranged enemies');assert.equal(A.projectiles.filter(q=>q.team==='p').length,0,'Ethan does not shoot');
 room.enemies=[far];p.basic=0;A.update(1);assert.equal(far.hp,1000,'out-of-range auto attack deals no damage');
 const target=enemy(p.x+120);room.enemies=[target];p.basic=9999;p.special=0;const startX=p.x;A.useSpecial();const protectedHp=p.hp;p.shield=0;p.inv=0;A.projectiles.push({team:'e',x:p.x+9,y:p.y,vx:0,vy:0,r:15,dmg:100,life:30});A.update(1);assert.equal(p.hp,protectedHp,'Ethan body charge is invulnerable');assert.ok(p.x>startX&&p.x<startX+20,'charge travels over time');
 for(let i=0;i<11;i++){A.update(1);h.frame()}
 assert.equal(p.mobility,null);assert.equal(target.hp,938,'charge hits each enemy once');assert.ok(target.x>startX+120,'charge pushes its target');assert.ok(p.x>=startX+100&&p.x<=startX+120,'short body charge covers about half the original distance');assert.ok(A.slashes.some(f=>f.kind==='chargeImpact'),'collision has a dedicated body impact');assert.ok(!A.slashes.some(f=>f.kind==='ethanSword'),'charge never swings a sword');assert.equal(A.heroes.dawn.maxHp,175);assert.ok(A.heroes.dawn.speed<A.heroes.night.speed);
 A.selected='night';A.newRun();const nr=Object.values(A.rooms).find(r=>r.type==='combat');A.current=`${nr.x},${nr.y}`;A.update(0);const n=A.player;nr.enemies=[{...template,type:'crawler',x:n.x+260,y:n.y,r:18,hp:1000,max:1000,armor:0,s:0,stun:99999,alive:true}];n.inv=9999;n.basic=0;A.update(1);assert.ok(A.projectiles.some(q=>q.team==='p'&&q.kind==='crescent'),'Noah shoots from range');
 n.basic=9999;n.inv=0;n.special=0;A.keys.d=true;const x=n.x,hp=n.hp,enemyHp=nr.enemies[0].hp;A.projectiles=[];nr.enemies[0].x=n.x+9;A.useSpecial();assert.equal(n.x,x,'roll travels over time');A.update(1);assert.equal(n.hp,hp,'roll prevents contact damage');assert.equal(nr.enemies[0].hp,enemyHp,'roll is an evasion skill without base damage');h.frame();for(let i=0;i<16;i++)A.update(1);assert.equal(n.mobility,null);assert.ok(n.x>x+120);
 A.keys.d=false;n.inv=0;nr.enemies[0].x=n.x;nr.enemies[0].y=n.y;A.update(1);assert.ok(n.hp<hp,'invulnerability ends after rolling');
 n.special=0;A.useSpecial();A.nextFloor();assert.equal(n.mobility,null,'movement cannot carry into another floor');
}
console.log('PASS v49: Ethan directional melee and one-hit knockback charge; Noah ranged fire and timed invulnerable roll on desktop/mobile');
// Calibrate anatomy, not the sheet cell or the sword's extended silhouette.
for(const mobile of [false,true]){
 const h=harness(mobile),art=h.env.AF_ART,uy=art.images.ethanCombat.height/887,reference=236*art.hero('dawn','idle',0).scale;
 for(const anim of ['attack','charge'])for(let frame=0;frame<4;frame++)assert.ok(Math.abs(342*uy*art.hero('dawn',anim,frame).scale-reference)<.00001,'one anatomical scale through every combat pose');
 const optionsE=h.A.relicOptions('dawn'),optionsN=h.A.relicOptions('night');assert.equal(optionsE.length,11);assert.equal(optionsN.length,11);
 for(const o of optionsE.filter(o=>o.id!=='solar-shard'))assert.notEqual(o.d,optionsN.find(n=>n.id===o.id).d,'role-specific description: '+o.id);
 assert.ok(optionsE.some(o=>o.id==='solar-shard')&&!optionsE.some(o=>o.id==='eclipse-fang'));assert.ok(optionsN.some(o=>o.id==='eclipse-fang')&&!optionsN.some(o=>o.id==='solar-shard'));
}
for(const key of ['dawn','night']){
 const h=harness(),{A}=h;A.selected=key;A.newRun();const options=A.relicOptions(),pick=id=>{const o=options.find(o=>o.id===id);o.f(A.player);A.addRelic(o)};
 const p=A.player,room=Object.values(A.rooms).find(r=>r.type==='combat');A.current=`${room.x},${room.y}`;p.inv=9999;p.basic=9999;A.update(0);
 const target=room.enemies[0];room.enemies=[target];target.hp=target.max=1000;target.armor=0;target.s=0;target.stun=99999;target.x=p.x+60;target.y=p.y;
 pick('condensed-crystal');p.crystalTimer=0;A.update(1);
 if(key==='dawn'){assert.ok(target.hp<1000,'Ethan crystal strikes close enemies');assert.ok(!A.projectiles.some(q=>q.kind==='crystal'),'Ethan crystal never becomes ranged fire')}
 else assert.equal(A.projectiles.filter(q=>q.kind==='crystal').length,3,'Noah crystal is ranged fan fire');
 pick('dash-sigil');A.projectiles=[];p.basic=9999;p.special=0;A.keys.d=true;A.useSpecial();for(let i=0;i<18;i++)A.update(1);
 if(key==='night'){assert.equal(p.rollBoost,.25,'Noah sigil primes boosted ranged shot after rolling');target.x=p.x+180;target.y=p.y;p.basic=0;A.update(1);assert.ok(A.projectiles.some(q=>q.kind==='crescent'&&q.dmg>(p.hero.damage+p.atk)));assert.equal(p.rollBoost,0,'enhanced shot is consumed once')}
 else assert.ok(p.specialBoost>=18,'Ethan sigil improves charge cooldown');
 pick('time-gear');p.special=0;A.keys.d=false;A.useSpecial();if(key==='night')assert.ok(Math.abs(p.special-Math.max(90,p.hero.specialCd-p.specialBoost)*.65)<.001,'Noah gear guarantees cooldown reduction');
}
console.log('PASS v51: consistent Ethan body scale, distinct relic cards and exclusive pools, melee/ranged crystal effects, one-use roll shot and Noah gear');
for(const key of ['dawn','night']){
 const h=harness(),{A}=h;A.selected=key;A.newRun();const r=Object.values(A.rooms).find(r=>r.type==='combat');A.current=`${r.x},${r.y}`;A.player.basic=9999;A.update(0);const p=A.player,e=r.enemies[0];A.floor=4;r.enemies=[e];Object.assign(e,{hp:1000,max:1000,armor:0,s:0,stun:99999,x:p.x+60,y:p.y});
 const take=id=>{const o=A.relicOptions().find(o=>o.id===id);o.f(p);A.addRelic(o)};
 take('twin-grail');p.hp=p.maxHp;const before=e.hp;A.damage(e,10);const full=before-e.hp;p.hp=p.maxHp/2;const halfBefore=e.hp;A.damage(e,10);const half=halfBefore-e.hp;
 assert.ok(key==='dawn'?half>full:full>half,'grail rewards the selected role health curve');
 A.relics={};take('abyss-mirror');p.hp=p.maxHp;p.inv=0;p.special=100;vm.runInContext('Math.random=()=>0',h.env);A.projectiles=[{team:'e',kind:'priestBolt',x:p.x-1,y:p.y,vx:1,vy:0,r:7,dmg:20,life:100}];const hp=p.hp;A.update(1);assert.equal(p.hp,hp);
 if(key==='dawn')assert.ok(A.projectiles.some(q=>q.team==='p'&&q.kind==='reflected'),'Ethan mirror reflects');else{assert.equal(A.projectiles.length,0,'Noah mirror nullifies');assert.equal(p.special,75,'Noah mirror also refunds roll cooldown')}
 A.relics={};A.projectiles=[];take('guardian-seal');p.inv=0;p.special=200;p.guardianCd=0;e.x=p.x;e.y=p.y;const enemyHp=e.hp;A.update(1);assert.ok(p.shield>0);
 if(key==='dawn')assert.ok(e.hp<enemyHp,'Ethan guardian retaliates');else{assert.equal(e.hp,enemyHp,'Noah guardian avoids melee retaliation');assert.equal(p.special,154,'Noah guardian accelerates roll recovery')}
 A.relics={};take('pilgrim-lantern');p.hp=p.maxHp-20;p.special=100;p.inv=9999;A.damage(e,e.max);A.update(1);assert.ok(p.hp>p.maxHp-20);assert.equal(p.special,key==='night'?9:99,'lantern cooldown differs by role');
}
console.log('PASS v51 relic triggers: opposite grail curves, reflection versus avoidance, counterattack versus cooldown, and role-specific room recovery');
{
 const h=harness();let cleaned=0;
 h.ctx.getImageData=(x,y,w,height)=>{
  const data=new Uint8ClampedArray(w*height*4);
  for(let yy=30;yy<Math.min(130,height);yy++)for(let xx=50;xx<140;xx++)data[(yy*w+xx)*4+3]=255;
  for(let yy=40;yy<50;yy++)for(let xx=190;xx<200;xx++)data[(yy*w+xx)*4+3]=255;
  data[(35*w+49)*4+3]=40;
  return {data,width:w,height};
 };
 h.ctx.putImageData=p=>{
  assert.equal(p.data[(50*p.width+80)*4+3],255,'main silhouette remains intact');
  assert.equal(p.data[(45*p.width+195)*4+3],0,'foreign weapon fragment is fully transparent');
  assert.equal(p.data[(35*p.width+49)*4+3],40,'soft actor edge remains intact');cleaned++;
 };
 h.env.AF_ART.prepared.then(()=>{assert.equal(cleaned,210,'all walk, stationary, windup, attack, hurt and death frames isolated');const art=h.env.AF_ART;for(let tier=0;tier<8;tier++)for(let col=0;col<4;col++){const f=art.regionalEnemy({type:'boss',tier},col);assert.ok(f.surface);assert.equal(art.regionalEnemy({type:'boss',tier},col),f,'renderer reuses the cleaned frame')}for(const type of ['crawler','shooter','brute','boss'])for(let col=0;col<6;col++)assert.ok(art.enemy(type,col).surface);console.log('PASS v53: all 210 actor frames isolated, cached and used by renderer; body and soft edges retained')}).catch(err=>{console.error(err);process.exitCode=1});
}

// Shoulder control is brief and bounded, and never moves or interrupts a boss.
for(const boss of [false,true]){
 const h=harness(),{A}=h;A.newRun();A.floor=4;const r=Object.values(A.rooms).find(r=>r.type==='combat');A.current=`${r.x},${r.y}`;A.update(0);const p=A.player,e=r.enemies[0];
 Object.assign(e,{type:boss?'boss':'crawler',x:p.x+60,y:p.y,s:0,hp:1000,max:1000,armor:0,stun:0,intro:0,aiCd:9999,bossCd:9999,bossTelegraph:0});r.enemies=[e];p.basic=9999;const x=e.x;A.useSpecial();A.update(3);
 assert.ok(e.hp<1000);assert.ok(boss?e.x===x:e.x>x&&e.x<=x+32,'bounded non-boss knockback');assert.ok(boss?e.stun===0:e.stun>15&&e.stun<=24,'idle shoulder stagger remains brief; boss is immune');
}
{
 const h=harness(),{A}=h;A.selected='night';A.newRun();A.floor=4;const r=Object.values(A.rooms).find(r=>r.type==='combat');A.current=`${r.x},${r.y}`;A.update(0);const p=A.player;p.basic=9999;p.inv=99999;A.relics['resonance-core']={count:1};A.useSpecial();for(let i=0;i<18;i++)A.update(1);assert.ok(p.rollBoost>0);h.frame();
 const e=r.enemies[0];r.enemies=[e];Object.assign(e,{x:p.x+200,y:p.y,s:0,stun:99999});p.basic=0;A.update(1);assert.equal(p.rollBoost,0,'ready glow clears with the boosted shot');h.frame();
}
// Render every material throughout its lifetime without changing effect or hit coordinates.
for(const mobile of [false,true]){
 const h=harness(mobile),{A}=h;A.newRun();A.paused=true;
 for(const life of [1,.75,.3,.01]){
  A.slashes=[{}, {kind:'sigilPulse'}, {art:true,kind:'ethanSword'}, {bossWeapon:true,wide:true}, {bossCast:true}, {bossWeapon:true,slam:true}].map(f=>({...f,x:A.player.x,y:A.player.y,r:100,a:.6,color:'#bd9e73',max:30,l:30*life}));
  A.shockwaves=[{x:A.player.x,y:A.player.y,r:80,max:130,l:28*life,color:'#c7a7ee'}];
  A.projectiles=['crescent','priestBolt','bossLance','bossOrb','crystal'].map(kind=>({kind,x:A.player.x,y:A.player.y,vx:4,vy:1,visualAge:8}));const before=JSON.stringify([A.slashes,A.shockwaves,A.projectiles]);h.frame();assert.equal(JSON.stringify([A.slashes,A.shockwaves,A.projectiles]),before);
 }
}
console.log('PASS v52: bounded shoulder knockback and idle stagger, boss immunity, consumed violet shot readiness, all layered FX stages on desktop/mobile');

{
 const h=harness(),{A}=h;A.newRun();A.floor=4;const r=Object.values(A.rooms).find(r=>r.type==='combat');A.current=`${r.x},${r.y}`;A.update(0);const p=A.player,e=r.enemies[0];r.enemies=[e];Object.assign(e,{x:p.x+135,y:p.y,hp:1000,max:1000,armor:0,s:0,stun:99999});p.basic=0;p.inv=9999;A.update(1);for(let i=0;i<6;i++)A.update(1);assert.equal(e.hp,976,'extended sword reaches a target outside old reach');
 const take=id=>{const o=A.relicOptions().find(o=>o.id===id);o.f(p);A.relics[id]={count:(A.relics[id]?.count||0)+1}};
 for(let i=0;i<8;i++)take('guardian-seal');assert.equal(p.maxHp,175+8*36);assert.equal(p.armorBonus,.15);p.shield=0;p.guardianCd=9999;p.hp=p.maxHp;p.inv=0;e.x=p.x;e.y=p.y;e.d=100;A.update(1);assert.equal(p.maxHp-p.hp,60,'stacked guardian reduction caps at 40 percent');
 e.x=p.x+65;e.y=p.y;p.inv=9999;take('relic-blade');p.bladeShots=2;p.basic=0;p.hp=p.maxHp-10;A.update(1);for(let i=0;i<6;i++)A.update(1);assert.equal(p.hp,p.maxHp-7,'third connected blade swing restores once');
 e.x=p.x+65;e.y=p.y;e.type='boss';e.intro=99;p.bladeShots=2;p.basic=0;const before=p.hp;A.update(1);for(let i=0;i<6;i++)A.update(1);assert.equal(p.hp,before,'invulnerable boss intro cannot grant hit recovery');
}
console.log('PASS v52 growth: greater real melee reach, stacking HP/armor cap, and hit-confirmed blade recovery');

for(const [hero,expected] of [['dawn',96],['night',50]]){
 const h=harness(),{A}=h;A.selected=hero;A.newRun();vm.runInContext('Math.random=()=>.5',h.env);const p=A.player;p.basic=99999;
 for(let i=0;i<9;i++){A.pickups.push({x:p.x,y:p.y,val:p.nextXp});A.update(1);const index=A.rewardChoices.findIndex(o=>o.n==='성물 증폭');assert.ok(index>=0);assert.ok(A.rewardChoices[index].d.includes(hero==='dawn'?'+8':'+4'));A.chooseReward(index)}
 assert.equal(p.level,10);assert.equal(p.hero.damage+p.atk,expected,'role-specific attack growth through actual XP and choices');
}
console.log('PASS v52 role growth: nine real attack upgrades produce Ethan 96 / Noah 50 at level 10');

for(const [hero,haste] of [['dawn',2],['night',4]]){
 const h=harness(),{A}=h;A.selected=hero;A.newRun();vm.runInContext('Math.random=()=>.5',h.env);const p=A.player;A.pickups.push({x:p.x,y:p.y,val:p.nextXp});A.update(1);A.chooseReward(A.rewardChoices.findIndex(o=>o.n==='공명 가속'));assert.equal(p.rate,haste);
}
console.log('PASS v52 haste growth: Ethan 2 / Noah 4 frames per selected upgrade');

(async()=>{
 for(const fail of [false,true]){
  const h=harness(false,1,true);assert.equal(h.elements.get('startBtn').disabled,true);assert.equal(h.A.started,false);assert.equal(h.A.assetsReady,false);
  h.completeImages(fail);await h.env.AF_ART.prepared;await Promise.resolve();await Promise.resolve();await Promise.resolve();
  assert.equal(h.A.assetsReady,!fail);assert.equal(h.elements.get('startBtn').disabled,false);assert.equal(h.elements.get('startBtn').textContent,fail?'이미지 불러오기 실패 · 다시 불러오기':'입장하기');assert.equal(h.A.started,false);
 }
 console.log('PASS v52 loading: pending images prevent entry; prepared assets unlock; failed combat image offers reload without starting old art');
})().catch(e=>{console.error(e);process.exitCode=1});

// Real boss summon pattern: one second of floor warning, emergence, brief settle, then AI.
for(const mobile of [false,true]){
 const h=harness(mobile),{A}=h;A.newRun();while(A.floor<6)A.nextFloor();const r=Object.values(A.rooms).find(r=>r.type==='boss');A.current=`${r.x},${r.y}`;A.update(0);const p=A.player,b=r.enemies[0];p.basic=99999;p.inv=99999;b.hp=b.max*.5;Object.assign(b,{intro:0,bossPattern:2,bossPhase:1,bossTelegraph:1,bossRush:0});A.update(1);
 const summons=r.enemies.filter(e=>e.summoned);assert.equal(summons.length,3);b.bossCd=99999;const e=summons[0],x=e.x,y=e.y,hp=e.hp;
 assert.ok(e.summonTime>100);A.damage(e,99999);assert.equal(e.hp,hp,'summon cannot be hit before appearing');
 const states=[];for(let i=0;i<114;i++){A.update(1);if([20,65,95,112].includes(i)){states.push(e.summonTime);h.frame()}if(e.summonTime>0){assert.equal(e.x,x);assert.equal(e.y,y);assert.equal(e.attackPose,0);assert.equal(e.moving,false)}}
 assert.ok(states[0]>54&&states[1]<54&&states[1]>18&&states[2]<=18);assert.equal(e.summonTime,0);A.update(1);assert.ok(e.x!==x||e.y!==y||e.aiWindup>0,'active AI begins after reveal');A.damage(e,10);assert.ok(e.hp<hp);
 // Contact and ranged attacks are both blocked while the summon is materializing.
 Object.assign(e,{alive:true,hp:999,x:p.x,y:p.y,summonTime:40,type:'shooter',fire:0});p.inv=0;p.shield=0;const health=p.hp;A.projectiles=[];r.enemies=[e];A.update(1);assert.equal(p.hp,health);assert.equal(A.projectiles.length,0);
 // Defeating the summoner cancels pending bodies without a death sprite or XP rewards.
 r.enemies=[b,e];b.hp=1;b.alive=true;A.damage(b,b.max);assert.equal(e.alive,false);assert.equal(e.deadAt,0);assert.equal(e.summonTime,0);
}
for(const mobile of [false,true]){
 const h=harness(mobile),art=h.env.AF_ART,e={alive:true,moving:true,type:'boss',tier:2,walkCycle:.17/6,x:100,y:100};
 const before=JSON.stringify(e),blend=art.enemyWalkTransition(e);assert.ok(blend&&blend.from!==blend.to&&blend.mix>0&&blend.mix<1);assert.equal(JSON.stringify(e),before,'visual transition never changes position or gait clock');
 e.walkCycle=.6/6;assert.equal(art.enemyWalkTransition(e),null,'one image outside the short blend window');
 for(const flag of ['attackPose','hurtPose','aiWindup','bossTelegraph','intro']){e[flag]=1;assert.equal(art.enemyWalkTransition(e),null,'no smoothing of attack or hurt timing');e[flag]=0}
}
console.log('PASS v54: delayed summon phases, safe emergence, activation, boss-death cancellation and timing-neutral walk transitions on desktop/mobile');

for(const [hero,base,haste] of [['dawn',8,2],['night',4,4]]){
 const h=harness(),{A}=h;A.selected=hero;A.newRun();const p=A.player;
 for(const [roll,mult] of [[.5,1],[.099,2],[.1,1]]){
  vm.runInContext('Math.random=()=>'+roll,h.env);const opts=A.levelOptions(),attack=opts.find(o=>o.id==='level-attack'),speed=opts.find(o=>o.id==='level-haste'),health=opts.find(o=>o.id==='level-health');
  assert.equal(attack.empowered,mult===2);assert.equal(attack.amount,base*mult);assert.ok(attack.d.includes(p.hero.ko)&&attack.d.includes('+'+base*mult));const before=p.atk;attack.f(p);assert.equal(p.atk-before,base*mult);
  assert.equal(speed.amount,haste*mult);assert.ok(!speed.d.includes('0.0'),'haste uses integer stat points');const copy={...p,hp:10};health.f(copy);assert.equal(copy.maxHp,p.maxHp+20*mult);assert.equal(copy.hp,10+28*mult);
 }
 p.rate=p.hero.rate-11;p.specialBoost=p.hero.specialCd-(hero==='dawn'?150:90);assert.equal(A.levelOptions().some(o=>o.id==='level-haste'||o.id==='level-special'),false,'capped upgrades are not offered');
 p.rate=p.hero.rate-12;vm.runInContext('Math.random=()=>.05',h.env);const edge=A.levelOptions().find(o=>o.id==='level-haste');assert.equal(edge.amount,1);assert.equal(edge.empowered,false,'near-cap partial gain cannot claim double effect');
}
{
 const h=harness(),{A}=h;let previous=0;
 for(let f=1;f<=24;f++){const xp=A.enemyXp({type:'crawler'},f);assert.ok(xp>=previous);previous=xp;assert.ok(A.enemyXp({type:'crawler',elite:true},f)>xp);assert.ok(A.enemyXp({type:'boss'},f)>A.enemyXp({type:'brute'},f));}
 assert.equal(A.enemyXp({type:'crawler'},1),3);assert.equal(A.enemyXp({type:'crawler'},24),12);assert.equal(A.enemyXp({type:'boss'},24),175);assert.equal(A.eliteClearXp(24),84);
 // Every displayed card rolls once, then survives rendering and held-key repeats unchanged.
 A.newRun();vm.runInContext('Math.random=()=>.05',h.env);const p=A.player;A.pickups.push({x:p.x,y:p.y,val:p.nextXp});A.update(1);assert.ok(A.rewardChoices.every(o=>o.empowered));const copy=A.rewardChoices.map(o=>o.amount);h.frame();assert.deepEqual(A.rewardChoices.map(o=>o.amount),copy);h.key('Digit1','1');const selected=p.atk;h.key('Digit1','1');assert.equal(p.atk,selected);
 // Seeded frequency check across actual normal options, before any stat caps.
 vm.runInContext('let testBonusSeed=42;Math.random=()=>{testBonusSeed=(Math.imul(testBonusSeed,1664525)+1013904223)>>>0;return testBonusSeed/4294967296}',h.env);let rare=0,total=0;for(let i=0;i<4000;i++)for(const o of A.levelOptions()){rare+=o.empowered?1:0;total++}assert.ok(rare/total>.09&&rare/total<.11,'approximately ten percent of cards are doubled');
}
console.log('PASS v55: role-labelled normal/double growth, exact probability boundary, one-time choice application, honest cap handling, and rising enemy/elite/boss XP');

for(const mobile of [false,true]){
 const h=harness(mobile),{A}=h;A.newRun();const r=A.cur();
 // Adjacent rectangles are never mistaken for a door, and unknown branches stay hidden.
 A.rooms={'0,0':r,'1,0':{x:1,y:0,seen:false,type:'combat',clear:false,doors:{W:true,E:true}},'2,0':{x:2,y:0,seen:false,type:'combat',doors:{W:true}},'0,1':{x:0,y:1,seen:false,type:'combat',doors:{}}};r.doors={E:true};r.clear=true;
 let map=A.minimapData();assert.deepEqual(Array.from(map.nodes).sort(),['0,0','1,0']);assert.equal(map.links.length,1);assert.equal(map.links[0].state,'open');
 r.clear=false;assert.equal(A.minimapData().links[0].state,'closed');r.clear=true;A.rooms['1,0'].type='boss';A.bossUnlocked=false;assert.equal(A.minimapData().links[0].state,'sealed');A.bossUnlocked=true;assert.equal(A.minimapData().links[0].state,'open');
 A.rooms['1,0'].seen=true;map=A.minimapData();assert.equal(map.links.length,2,'seeing a room reveals its genuine next passage');assert.ok(map.nodes.includes('2,0'));A.rooms['1,0'].doors.W=false;assert.equal(A.minimapData().links.length,1,'broken reciprocal door never draws a phantom passage');h.frame();
 A.newRun();while(A.floor<16)A.nextFloor();const room=Object.values(A.rooms).find(r=>r.type==='combat');A.current=`${room.x},${room.y}`;A.update(0);const lava=A.fieldPatches(room);for(const e of room.enemies){e.s=0;e.stun=99999;e.x=A.arena.x+25;e.y=A.arena.y+25}const hazard=lava[0],p=A.player;for(const h of lava)h.phase=0;p.basic=99999;p.hp=p.maxHp=1000;p.x=hazard.x;p.y=hazard.y;
 for(const [age,state,damage] of [[120,'warning',false],[150,'active',true],[294,'active',true],[295,'cool',false],[389,'cool',false],[390,'warning',false]]){
  room.fieldAge=age;p.inv=0;const hp=p.hp;assert.equal(A.fieldState(room,hazard),state);A.update(0);assert.equal(p.hp<hp,damage,'damage matches visible phase at exact boundary '+age);h.frame();
 }
 room.fieldAge=296;const early=A.fieldPhase(room,hazard).progress;room.fieldAge=388;assert.ok(A.fieldPhase(room,hazard).progress>early,'cooling fades forward while remaining safe');room.clear=true;assert.equal(A.fieldState(room,hazard),'inactive');
}
console.log('PASS v56: real reciprocal minimap corridors, combat/seal door states, hidden branches, and exact safe/hot/cooling lava boundaries on desktop/mobile');

// Player hits displace survivors without cancelling windups or active charges.
for(const special of [false,true])for(const type of ['crawler','shooter','brute']){
 const {A}=harness();A.newRun();A.floor=4;const r=Object.values(A.rooms).find(r=>r.type==='combat');A.current=`${r.x},${r.y}`;A.update(0);const p=A.player,e=r.enemies[0];
 r.enemies=[e];Object.assign(e,{type,x:p.x+60,y:p.y,r:18,s:0,hp:10000,max:10000,armor:0,stun:0,aiWindup:20,attackPose:18,dash:0,charge:0,shotAngle:0,aimX:1,aimY:0});p.inv=9999;p.basic=special?9999:0;const x=e.x;
 if(special){A.useSpecial();A.update(3)}else {A.update(1);for(let i=0;i<6;i++)A.update(1)}
 assert.ok(e.hp<10000);assert.ok(e.x>x,'surviving enemy is still pushed');assert.equal(e.stun,0);assert.ok(e.aiWindup>0&&e.aiWindup<20,'windup keeps advancing');assert.equal(e.hurtPose,0,'hit pose does not cover an attack');
 p.basic=9999;p.mobility=null;for(let i=0;i<22;i++)A.update(1);
 assert.ok(type==='shooter'?A.projectiles.some(q=>q.team==='e'):e.attackPose>0,'interrupted target completes its attack');
}
for(const type of ['crawler','brute']){
 const {A}=harness();A.newRun();A.floor=4;const r=Object.values(A.rooms).find(r=>r.type==='combat');A.current=`${r.x},${r.y}`;A.update(0);const p=A.player,e=r.enemies[0];r.enemies=[e];
 Object.assign(e,{type,x:p.x+60,y:p.y,r:18,s:0,hp:10000,max:10000,armor:0,stun:0,aiWindup:0,dash:type==='crawler'?10:0,charge:type==='brute'?18:0,aimX:1,aimY:0});p.inv=9999;p.basic=0;for(let i=0;i<7;i++)A.update(1);
 assert.ok(e.hp<10000);assert.equal(e.stun,0);assert.equal(type==='crawler'?e.dash:e.charge,type==='crawler'?3:11,'active attack keeps its timer');
}
console.log('PASS v57: sword and shoulder hits preserve enemy windups, projectiles and active charges');
