const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=require('node:path').join(__dirname,'../games/abyssfall-eclipse');
function harness(mobile=false,dpr=1){
 let now=10000,raf;const timers=[],draws=[],elements=new Map();
 const gradient={addColorStop(){}};
 const ctx=new Proxy({drawImage(...a){draws.push(a)},createLinearGradient(){return gradient},createRadialGradient(){return gradient}}, {get(t,k){return k in t?t[k]:()=>{}}});
 function el(id){if(!elements.has(id))elements.set(id,{style:{setProperty(){}},dataset:{},classList:{add(){},remove(){},toggle(){}},addEventListener(){},setAttribute(){},appendChild(){},getBoundingClientRect(){return {left:0,top:0,width:112,height:112}},getContext(){return ctx},querySelectorAll(){return []},closest(){return null},textContent:'',innerHTML:''});return elements.get(id)}
 class Image{constructor(){this.complete=true;this.naturalWidth=1536;this.width=1536;this.height=1024}set src(x){this._src=x;this.onload?.()}}
 const env={console,Image,performance:{now:()=>now},innerWidth:mobile?390:1440,innerHeight:mobile?844:960,devicePixelRatio:dpr,matchMedia:()=>({matches:mobile}),localStorage:{getItem(){return null},setItem(){}},document:{getElementById:el,querySelectorAll(){return []},documentElement:el('root'),createElement:()=>el('made')},addEventListener(){},setTimeout(fn,ms){timers.push({fn,at:now+ms});return timers.length},clearTimeout(){},requestAnimationFrame(fn){raf=fn},fetch:async()=>({ok:false,status:404})};env.window=env;vm.createContext(env);
 for(const file of ['art.js','core.js','render.js'])vm.runInContext(fs.readFileSync(root+'/'+file,'utf8'),env,{filename:file});
 const A=env.AF;
 function advance(ms){now+=ms;for(let i=timers.length-1;i>=0;i--)if(timers[i].at<=now){const {fn}=timers.splice(i,1)[0];fn()}if(A.started&&!A.dead&&!A.paused)A.update(1)}
 return {env,A,draws,frame(){raf(now)},advance,elements};
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
