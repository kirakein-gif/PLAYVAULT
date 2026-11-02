'use strict';
const assert=require('node:assert/strict'),HK=require('../sim.js');
const I=(o={})=>({attack:false,swap:false,...o}),run=(w,n,input=I())=>{const ev=[];for(let i=0;i<n;i++)ev.push(...HK.step(w,input));return ev;};
function flat(hero='ethan',solids=[]){const c=HK.CONFIG.heroes[hero];return HK.createWorld({hero,spawn:{x:300,y:500-c.height},room:{width:960,height:540,solids:[{x:0,y:500,w:960,h:40},...solids],dummies:[]}});}
let count=0;function test(name,fn){fn();console.log('PASS '+name);count++;}
test('cooldown press does not start charging or fire on its later release',()=>{const w=flat();HK.step(w,I({attack:true}));HK.step(w,I());const ev=run(w,90,I({attack:true}));assert.equal(w.player.charge.level,0);assert.equal(ev.filter(e=>e.type==='attack').length,0);assert.ok(!HK.step(w,I()).some(e=>e.type==='attack'));});
test('left-facing finisher moves exactly10 horizontally and respects a solid',()=>{for(const wall of [false,true]){const w=flat('noah',wall?[{x:250,y:0,w:48,h:500}]:[]);w.player.face=-1;for(let k=0;k<2;k++){HK.step(w,I({attack:true}));run(w,17);}const x=w.player.x;HK.step(w,I({attack:true}));run(w,12);assert.ok(wall?w.player.x>=298:Math.abs(w.player.x-(x-10))<1e-6);}});
test('charge3 burst on a target damages another through masonry without breaking it',()=>{
 const g=Array.from({length:18},(_,r)=>r===17?'#'.repeat(32):'.'.repeat(32));
 const w=HK.createWorld({area:{version:1,tile:30,cols:32,rows:18,start:{room:'a',x:300,y:442},rooms:{a:{pos:[0,0],name:'edge',grid:g,objects:[{id:'direct',type:'target',x:15,y:15,hp:1000},{id:'puzzle',type:'breakable',x:16,y:15}]}}}});
 w.dummies.push({id:'splash',x:485,y:465,w:20,h:30,hp:1000});
 const ev=run(w,82,I({attack:true}));ev.push(...HK.step(w,I()),...run(w,40));
 assert.equal(w.dummies.find(d=>d.id==='direct').hp,912);assert.equal(w.dummies.find(d=>d.id==='splash').hp,967);assert.ok(!w.flags.broken.puzzle);assert.equal(ev.filter(e=>e.type==='burst').length,1);
});
test('third-level left shot stops at the target right face and excludes the direct target',()=>{const w=flat();w.player.face=-1;w.dummies.push({id:'direct',x:150,y:440,w:30,h:60,hp:1000},{id:'splash',x:110,y:440,w:30,h:60,hp:1000});let ev=run(w,82,I({attack:true}));ev.push(...HK.step(w,I()),...run(w,40));const burst=ev.find(e=>e.type==='burst');assert.equal(burst.x,180);assert.equal(w.dummies[0].hp,912);assert.equal(w.dummies[1].hp,967);});
test('airborne and attached attacks allow a three-step combo without detaching',()=>{
 const air=flat('noah'),aerial=[];for(let i=0;i<52;i++){for(const e of HK.step(air,I({jump:true,attack:i===0||i===4||i===22})))if(e.type==='attack'){assert.ok(!air.player.onGround);aerial.push(e.step);}}assert.deepEqual(aerial,[1,2,3]);
 const area={version:1,tile:30,cols:32,rows:18,start:{room:'a',x:444,y:446},rooms:{a:{pos:[0,0],name:'ladder',grid:Array.from({length:18},(_,r)=>r===17?'#'.repeat(32):'.'.repeat(15)+'H'+'.'.repeat(16)),objects:[]}}};
 const w=HK.createWorld({area,hero:'noah'});run(w,30,I({up:true}));assert.ok(w.player.climbing);const steps=[],x0=w.player.x;let maxX=x0;
 for(let i=0;i<52;i++){steps.push(...HK.step(w,I({attack:i===0||i===4||i===22})).filter(e=>e.type==='attack').map(e=>e.step));assert.ok(w.player.climbing);maxX=Math.max(maxX,w.player.x);}
 assert.deepEqual(steps,[1,2,3]);assert.ok(Math.abs(maxX-x0-10)<1e-6,'attached finisher performs the full10-unit step');assert.equal(w.player.x,x0,'recenter after the swing');
});
test('a finisher crossing a room boundary is cancelled before damaging the new room',()=>{
 const grid=Array.from({length:18},(_,r)=>r===17?'#'.repeat(32):'.'.repeat(32));
 const w=HK.createWorld({hero:'noah',area:{version:1,tile:30,cols:32,rows:18,start:{room:'a',x:940,y:446},rooms:{a:{pos:[0,0],name:'a',grid,objects:[]},b:{pos:[1,0],name:'b',grid,objects:[{id:'other-room',type:'target',x:0,y:15,hp:1000}]}}}});
 for(let i=0;i<2;i++){HK.step(w,I({attack:true}));run(w,17);}
 HK.step(w,I({attack:true}));assert.equal(w.roomId,'b');assert.equal(w.dummies[0].hp,1000);assert.equal(w.attacks.length,0);
});
console.log(`${count}/${count} supplemental weapon checks passed`);
