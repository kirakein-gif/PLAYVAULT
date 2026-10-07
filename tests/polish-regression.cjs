const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=require('node:path').join(__dirname,'../games/abyssfall-eclipse');
function harness(mobile=false,dpr=1){
 let now=10000,raf,created=0;const timers=[],draws=[],elements=new Map(),listeners={};
 const gradient={addColorStop(){}};
 const ctx=new Proxy({drawImage(...a){draws.push(a)},createLinearGradient(){return gradient},createRadialGradient(){return gradient}}, {get(t,k){return k in t?t[k]:()=>{}}});
 function el(id){if(!elements.has(id)){
  const classes=new Set(),e={style:{setProperty(){}},dataset:{},children:[],classList:{add(x){classes.add(x)},remove(x){classes.delete(x)},contains(x){return classes.has(x)},toggle(){}},addEventListener(){},setAttribute(){},appendChild(c){this.children.push(c)},getBoundingClientRect(){return {left:0,top:0,width:112,height:112}},getContext(){return ctx},toDataURL(){return 'data:image/png;base64,'},querySelector(s){return el(id+s)},querySelectorAll(){return []},closest(){return null},textContent:'',innerHTML:''};elements.set(id,e);
 }return elements.get(id)}
 class Image{constructor(){this.complete=true;this.naturalWidth=1536;this.width=1536;this.height=1024}set src(x){this._src=x;if(x.includes('room-')&&x.includes('-v5')){this.width=916;this.height=1717}else if(x.includes('relics-v5')){this.width=1448;this.height=1086}this.onload?.()}}
 const env={console,Image,performance:{now:()=>now},innerWidth:mobile?390:1440,innerHeight:mobile?844:960,devicePixelRatio:dpr,matchMedia:()=>({matches:mobile}),localStorage:{getItem(){return null},setItem(){}},document:{getElementById:el,querySelectorAll(){return []},documentElement:el('root'),createElement:()=>el('made'+created++)},addEventListener(type,fn){(listeners[type]??=[]).push(fn)},setTimeout(fn,ms){timers.push({fn,at:now+ms});return timers.length},clearTimeout(){},requestAnimationFrame(fn){raf=fn},fetch:async()=>({ok:false,status:404})};env.window=env;vm.createContext(env);
 for(const file of ['art.js','core.js','render.js'])vm.runInContext(fs.readFileSync(root+'/'+file,'utf8'),env,{filename:file});
 const A=env.AF;
 function advance(ms){now+=ms;for(let i=timers.length-1;i>=0;i--)if(timers[i].at<=now){const {fn}=timers.splice(i,1)[0];fn()}if(A.started&&!A.dead&&!A.paused)A.update(1)}
 return {env,A,draws,frame(){raf(now)},advance,elements,key(code,key,repeat=false,target={}){const event={code,key,repeat,target,preventDefault(){this.prevented=true}};for(const fn of listeners.keydown||[])fn(event);return event}};
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
 const frame=h.draws.find(d=>d[0]===h.env.AF_ART.images.heroes);assert.ok(frame);assert.equal(frame[2],278,'moving basic attack keeps run row');
 A.player.specialPose=24;A.player.attackAt=10000;h.draws.length=0;h.frame();
 assert.ok(h.draws.some(d=>d[0]===h.env.AF_ART.images.actions),'moving special still has attack animation');
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
 for(let zone=0;zone<4;zone++)for(const clear of [false,true]){
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
 p.hero=A.heroes.dawn;p.inv=9999;p.basic=0;target.x=p.x+110;target.y=p.y;A.update(1);
 const shot=A.projectiles.find(q=>q.kind==='light');assert.ok(shot&&shot.visualDistance);const hp=target.hp;p.basic=9999;
 for(let i=0;i<30&&A.projectiles.includes(shot);i++)A.update(1);
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
for(const mobile of [false,true])for(const dpr of [1,2,3]){
 const h=harness(mobile,dpr),{A}=h;A.newRun();
 assert.equal(A.W,mobile?720:960);assert.equal(A.H,mobile?900:640);
 assert.equal(A.renderScaleX,A.canvas.width/A.W);assert.ok(A.canvas.width<=Math.round((mobile?390:1440)*2));
 assert.equal(A.ctx.imageSmoothingEnabled,false);
 for(let floor=1;floor<=12;floor++){
  assert.equal(A.floor,floor);assert.equal(A.isBossFloor(),floor%3===0);
  const rooms=Object.values(A.rooms);assert.equal(rooms.length,A.roomTarget());
  if(floor%3===0){
   assert.equal(rooms.filter(r=>r.sealAltar).length,{3:2,6:3,9:3,12:4}[floor]);
   const boss=rooms.find(r=>r.type==='boss');assert.ok(boss);
   A.current=`${boss.x},${boss.y}`;A.bossUnlocked=true;A.player.x=A.W/2;A.player.y=A.arena.y+A.arena.h-80;A.player.inv=9999;A.update(1);
   const e=boss.enemies.find(e=>e.type==='boss');assert.ok(e);e.intro=0;
   for(let hit=0;hit<12&&e.alive;hit++)A.damage(e,e.max);
   assert.equal(e.alive,false);assert.equal(boss.bossDefeated,true);assert.equal(A.paused,false);assert.equal(A.transitioning,false);
   A.player.x=A.W/2;A.player.y=A.arena.y+A.arena.h/2;
   h.advance(730);assert.equal(A.transitioning,true,'stairs trigger after unlock');h.advance(1000);
   if(floor===12){assert.equal(A.cleared,true);assert.equal(A.paused,true)}else assert.equal(A.floor,floor+1);
  }else A.nextFloor();
 }
 A.newRun();A.player.inv=9999;
 const combat=Object.values(A.rooms).find(r=>r.type==='combat');A.current=`${combat.x},${combat.y}`;A.update(1);
 for(let i=0;i<120;i++){h.advance(17);h.frame()}
 assert.ok(h.draws.length>0);assert.ok(Number.isFinite(A.player.x));
 for(const hero of ['dawn','night'])for(const [anim,count] of [['idle',4],['run',6],['attack',4],['hurt',2],['death',4]])for(let i=0;i<count;i++){
  const f=h.env.AF_ART.hero(hero,anim,i),width=f.image==='actions'?1254:1536,height=f.image==='actions'?1254:1024;assert.ok(f.x>=0&&f.y>=0&&f.x+f.w<=width&&f.y+f.h<=height);assert.ok(f.foot<=f.h);
 }
 console.log(`PASS ${mobile?'mobile':'desktop'} DPR ${dpr}: 12 floors, seals, boss defeat, stairs, clear, combat rendering, frame bounds`);
}
