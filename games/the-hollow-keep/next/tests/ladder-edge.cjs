'use strict';
// Supplemental boundary cases; acceptance test originals are unchanged.
const assert=require('node:assert/strict'),HK=require('../sim.js');
function fixture(platform=false,ceiling=false){
 const g=Array.from({length:18},(_,r)=>Array.from({length:32},(_,c)=>r===17||r===0||c===0||c===31?'#':'.'));
 for(let r=3;r<17;r++)g[r][15]='H';
 for(let c=17;c<22;c++)g[10][c]=platform?'-':'#';
 if(ceiling)for(let c=17;c<22;c++)g[8][c]='#';
 return HK.createWorld({area:{version:1,tile:30,cols:32,rows:18,start:{room:'a',x:444,y:442},rooms:{a:{pos:[0,0],name:'boundary',grid:g.map(r=>r.join('')),objects:[]}}}});
}
function hang(w,feet){for(let i=0;i<200;i++){const p=HK.getPlayer(w);if(p.climbing&&p.y+p.h<=feet){HK.step(w,{});return;}HK.step(w,{up:true});}assert.fail('fixture failed to attach');}
let count=0;
function test(name,fn){fn();console.log('PASS '+name);count++;}
test('down+jump leaves an attached ladder, including one-way support at feet',()=>{
 const w=fixture(true);hang(w,300);const p=w.player;p.y=300-p.h; // boundary fixture only
 w.room.platforms.push({x:450,y:300,w:30,h:1,oneway:true});
 const ev=HK.step(w,{down:true,jump:true});assert.ok(ev.some(e=>e.type==='jump'));assert.ok(!w.player.climbing&&w.player.vy<0);
 for(let i=0;i<16;i++){HK.step(w,{down:true,jump:true});assert.ok(!w.player.climbing);}
});
test('occupied body above an adjacent surface keeps the hero attached',()=>{const w=fixture(false,true);hang(w,300);HK.step(w,{right:true});assert.ok(w.player.climbing);assert.equal(w.player.face,1);});
test('surface outside the eight-unit foot tolerance does not dismount',()=>{const w=fixture();hang(w,320);HK.step(w,{right:true});assert.ok(w.player.climbing);});
test('climb distance stays fixed while hanging and survives a swap',()=>{const w=fixture();hang(w,420);const distance=w.player.climbDistance;for(let i=0;i<30;i++)HK.step(w,{});assert.equal(w.player.climbDistance,distance);HK.step(w,{swap:true});assert.equal(w.active,'noah');assert.ok(w.player.climbing);assert.equal(w.player.climbDistance,distance);});
console.log(`${count}/${count} supplemental ladder checks passed`);
