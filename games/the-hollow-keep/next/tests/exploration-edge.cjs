'use strict';
const assert=require('node:assert/strict'),HK=require('../sim.js'),base=require('../areas/area1.json');
const copy=o=>JSON.parse(JSON.stringify(o));let passed=0;
function test(name,fn){fn();passed++;console.log('PASS '+name);}
function run(w,held,n){for(let i=0;i<n;i++)HK.step(w,held);}
function until(w,held,pred,max=800){for(let i=0;i<max;i++){HK.step(w,held);if(pred())return;}assert.fail('route failed '+w.roomId);}
test('actual high lever: floor-launched Ethan cannot reach it; Noah can',()=>{
 for(const hero of ['ethan','noah']){const a=copy(base),c=HK.CONFIG.heroes[hero];a.start={room:'belfry',x:465-c.width/2,y:510-c.height};const w=HK.createWorld({area:a,hero});
  run(w,{},5);for(let i=0;i<100;i++)HK.step(w,{jump:true,interact:i%2===0});
  assert.equal(!!HK.getFlags(w).switches['high-lever'],hero==='noah');
 }
});
test('actual bronze gate cannot be jumped over by either hero without its key',()=>{
 for(const hero of ['ethan','noah']){const a=copy(base),c=HK.CONFIG.heroes[hero];a.start={room:'nave',x:base.rooms.nave.objects.find(o=>o.id==='bronze-door').x*30-90,y:510-c.height};const w=HK.createWorld({area:a,hero});run(w,{},5);run(w,{right:true,jump:true},130);assert.equal(w.roomId,'nave');assert.ok(w.player.x+w.player.w<=base.rooms.nave.objects.find(o=>o.id==='bronze-door').x*30+.01);assert.equal(!!HK.getFlags(w).doors['bronze-door'],false);}
});
test('the bell barrier fills its lower corridor and cannot be jumped through',()=>{
 const a=copy(base);a.start={room:'belfry',x:330,y:510-HK.CONFIG.heroes.noah.height};const w=HK.createWorld({area:a,hero:'noah'});run(w,{},5);run(w,{left:true,jump:true},130);assert.equal(w.roomId,'belfry');assert.ok(w.player.x>=(base.rooms.belfry.objects.find(o=>o.id==='bell-door').x+1)*30-.01);assert.equal(!!HK.getFlags(w).doors['bell-door'],false);
});
test('the upper gallery remains traversable with the bronze barrier still closed',()=>{
 const a=copy(base);a.start={room:'nave',x:300,y:150-68};const w=HK.createWorld({area:a});run(w,{right:true},130);assert.ok(w.player.x>660);assert.equal(w.player.onGround,true);assert.equal(w.player.y+w.player.h,360);assert.equal(!!HK.getFlags(w).doors['bronze-door'],false);
});
test('the sealed lower vault holds both keys until its cracked masonry is broken',()=>{
 const a=copy(base);a.start={room:'vault',x:530,y:442};const w=HK.createWorld({area:a});run(w,{right:true,jump:true},130);assert.ok(w.player.x+w.player.w<=600+.01);assert.deepEqual(HK.getFlags(w).keys,{});HK.step(w,{attack:true});run(w,{},20);assert.equal(HK.getFlags(w).broken['cracked-screen'],true);run(w,{right:true},100);assert.equal(HK.getFlags(w).picked['bronze-key'],true);assert.equal(HK.getFlags(w).picked['sigil-key'],true);
});
test('nonlethal target HP survives a round trip between rooms',()=>{
 const a=copy(base);a.start={room:'reliquary',x:180,y:442};a.rooms.reliquary.objects.find(o=>o.id==='oath-west').hp=44;const w=HK.createWorld({area:a});run(w,{},5);HK.step(w,{attack:true});run(w,{},50);assert.equal(w.dummies.find(d=>d.id==='oath-west').hp,22);
 until(w,{left:true},()=>w.roomId==='nave');until(w,{right:true},()=>w.roomId==='reliquary');assert.equal(w.dummies.find(d=>d.id==='oath-west').hp,22);
});
test('closed doors absorb projectiles before a target behind them',()=>{
 const a=copy(base);a.start={room:'nave',x:base.rooms.nave.objects.find(o=>o.id==='bronze-door').x*30-100,y:442};a.rooms.nave.objects.push({type:'target',id:'protected',x:28,y:15,hp:44});const w=HK.createWorld({area:a});HK.step(w,{attack:true});run(w,{},50);assert.equal(w.dummies.find(d=>d.id==='protected').hp,44);assert.ok(w.attacks.every(shot=>shot.life===0));
});
test('a closed door at a ladder boundary still blocks the portal',()=>{
 const a=copy(base);a.start={room:'gate',x:174,y:200};const seal=a.rooms.gate.objects.find(o=>o.id==='return-seal');seal.y=0;seal.h=1;const w=HK.createWorld({area:a});run(w,{up:true},300);assert.equal(w.roomId,'gate');assert.ok(w.player.y>=30);
});
test('flag/map snapshots and input area cannot mutate world progress',()=>{
 const a=copy(base),w=HK.createWorld({area:a}),f=HK.getFlags(w),m=HK.getMap(w);f.switches['sun-prism']=true;m.rooms[0].visited=false;a.rooms.gate.grid[17]='.'.repeat(32);assert.deepEqual(HK.getFlags(w).switches,{});assert.equal(HK.getMap(w).rooms[0].visited,true);run(w,{},20);assert.equal(w.player.onGround,true);
});
test('swap while on a ladder preserves attachment and releases safely with jump',()=>{
 const a=copy(base);a.start={room:'crypt',x:774,y:300};const w=HK.createWorld({area:a});HK.step(w,{up:true});assert.equal(w.player.climbing,true);HK.step(w,{swap:true});assert.equal(w.active,'noah');assert.equal(w.player.climbing,true);const y=w.player.y;run(w,{},10);assert.equal(w.player.y,y);const ev=HK.step(w,{jump:true,left:true});assert.ok(ev.some(e=>e.type==='jump'));assert.equal(w.player.climbing,false);assert.ok(w.player.vy<0);
});
test('down-jump at a ladder/solid-floor seam never nudges the body into masonry',()=>{
 const a=copy(base);a.start={room:'gate',x:809.6,y:142};const w=HK.createWorld({area:a});assert.equal(w.player.onGround,true);HK.step(w,{down:true,jump:true});
 for(let i=0;i<30;i++){HK.step(w,{});const p=w.player;assert.ok(!w.room.solids.some(s=>p.x<s.x+s.w-1e-6&&p.x+p.w>s.x+1e-6&&p.y<s.y+s.h-1e-6&&p.y+p.h>s.y+1e-6));}
});
for(const hero of ['ethan','noah'])test(`actual loft ladder cannot cross the unopened gate seal [${hero}], then passes after the lever`,()=>{
 const a=copy(base);a.start={room:'loft',x:195-HK.CONFIG.heroes[hero].width/2,y:400};const w=HK.createWorld({area:a,hero});
 run(w,{down:true},300);const blockedY=w.player.y;for(let i=0;i<30;i++){HK.step(w,{down:true});assert.equal(w.player.y,blockedY);assert.equal(w.player.vy,0);}assert.equal(w.roomId,'loft');assert.equal(!!HK.getFlags(w).doors['return-seal'],false);assert.equal(HK.getMap(w).rooms.find(r=>r.id==='gate').visited,false);
 HK.step(w,{jump:true,right:true});run(w,{jump:true,right:true},40);run(w,{},60);
 until(w,{right:true},()=>Math.abs(w.player.x+w.player.w/2-495)<4);run(w,{},12);HK.step(w,{interact:true});run(w,{},2);assert.equal(HK.getFlags(w).doors['return-seal'],true);
 until(w,{left:true},()=>Math.abs(w.player.x+w.player.w/2-195)<4);run(w,{},12);until(w,{down:true},()=>w.roomId==='gate',400);
});
console.log(`${passed}/${passed} exploration edge checks passed`);
