'use strict';
// Extra geometry cases for the corrected automatic swap; acceptance tests stay unchanged.
const assert=require('node:assert/strict'),S=require('../sim.js');
function world({x=30,y=446,ceiling=false,corner=false,breakable=false,contact=true}={}){
 const grid=Array.from({length:18},(_,r)=>(r===0||r===17?'#'.repeat(32):'#'+'.'.repeat(30)+'#').split(''));
 if(ceiling)for(let c=3;c<=21;c++){grid[10][c]='#';grid[14][c]='#';}
 if(corner)for(let r=11;r<=13;r++)grid[r][20]='#';
 const objects=contact?[{type:'enemy',id:'contact',kind:'crawler',x:ceiling?corner?19:6:breakable?16:3,y:ceiling?13:16,face:breakable?1:-1}]:[];
 if(breakable)objects.push({type:'breakable',id:'wall',x:20,y:14,h:3});
 return S.createWorld({area:{version:1,cols:32,rows:18,tile:30,start:{room:'a',hero:'noah',x,y},rooms:{a:{pos:[0,0],grid:grid.map(r=>r.join('')),objects}}},hp:{ethan:6,noah:1}});
}
let passed=0;
function automatic(name,opts,check){
 const w=world(opts);let event,before;
 for(let i=0;i<600;i++){before={...S.getPlayer(w)};const events=S.step(w,{});event=events.find(e=>e.type==='swap'&&e.reason==='down');if(event)break;}
 assert.ok(event,name+' must down-swap');const p=S.getPlayer(w);
 assert.equal(w.active,'ethan');assert.equal(p.invuln,90);check(p,before);
 for(let i=0;i<30;i++){
  assert.ok(!w.room.solids.some(s=>p.x<s.x+s.w-1e-8&&p.x+p.w>s.x+1e-8&&p.y<s.y+s.h-1e-8&&p.y+p.h>s.y+1e-8),name+' overlaps a solid at '+i);
  S.step(w,{});
 }
 console.log('PASS '+name);passed++;
}
automatic('left wall: smallest 1.5-unit inward correction',{x:30},p=>assert.equal(p.x,30));
automatic('unbroken masonry is solid during the swap',{x:561,breakable:true},p=>assert.equal(p.x+p.w,600));
automatic('ceiling: lower immediately without changing horizontal center',{x:175.5,y:330,ceiling:true},p=>{assert.equal(p.y,330);assert.equal(p.x,174);});
automatic('ceiling and wall corner: both axes clear in the same tick',{x:561,y:330,ceiling:true,corner:true},p=>{assert.equal(p.y,330);assert.equal(p.x+p.w,600);});
const manual=world({x:175.5,y:330,ceiling:true,contact:false});
assert.ok(S.step(manual,{swap:true}).some(e=>e.type==='swapBlocked'));
assert.equal(manual.active,'noah');console.log('PASS manual swap under a ceiling stays blocked');passed++;
console.log(`${passed}/${passed} down-swap edge checks passed`);
