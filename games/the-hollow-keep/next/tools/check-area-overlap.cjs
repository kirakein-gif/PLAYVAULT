// Deterministic inputs from valid standing points on every room's tiers.
'use strict';
const H=require('../sim.js'),area=require('../areas/area1.json'),assert=require('node:assert/strict');
const hit=(p,s)=>p.x<s.x+s.w-1e-6&&p.x+p.w>s.x+1e-6&&p.y<s.y+s.h-1e-6&&p.y+p.h>s.y+1e-6;
let starts=0,ticks=0;
for(const hero of ['ethan','noah'])for(const [id,room]of Object.entries(area.rooms)){
 const candidates=[],c=H.CONFIG.heroes[hero];
 for(let y=1;y<18;y++)for(let x=1;x<31;x++)if('#-'.includes(room.grid[y][x])||room.grid[y][x]==='H'&&room.grid[y-1][x]!=='H'){
  const start={room:id,x:x*30+15-c.width/2,y:y*30-c.height};if(start.y<0)continue;
  const data={...area,start},w=H.createWorld({area:data,hero});if(w.player.onGround&&!w.room.solids.some(s=>hit(w.player,s)))candidates.push(start);
 }
 assert.ok(candidates.length,id+' has no valid standing starts');
 for(let j=0;j<Math.min(12,candidates.length);j++){
  const start=candidates[Math.floor(j*candidates.length/Math.min(12,candidates.length))],w=H.createWorld({area:{...area,start},hero});let seed=++starts,input={};
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<900;i++){
   if(i%17===0)input=Object.fromEntries(['left','right','up','down','jump','attack','swap','interact'].map(k=>[k,random()<(k==='swap'?.12:.36)]));
   H.step(w,input);assert.ok(!w.room.solids.some(s=>hit(w.player,s)),`${hero} ${id} start${JSON.stringify(start)} tick${i} room${w.roomId} body${JSON.stringify(w.player)}`);ticks++;
  }
 }
}
console.log(`PASS ${starts} standing starts, ${ticks} seeded-input ticks: no wall/closed-barrier overlap`);
