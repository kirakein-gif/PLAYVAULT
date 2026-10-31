'use strict';
const assert = require('node:assert/strict');
const S = require('../sim.js');
const actualRoom = require('../room.js');
// Test the actual room with a running approach on the floor after the first
// platform. Hold right and jump through landing; no swap or config changes.
function cross(hero, room, jumpAt) {
  const w=S.createWorld({room,hero,spawn:{x:320,y:490-S.CONFIG.heroes[hero].height}});
  let launched=null,landed=null;
  for(let i=0;i<180;i++) {
    const before={...w.player},events=S.step(w,{right:true,jump:w.player.x>=jumpAt});
    if(events.some(e=>e.type==='jump'))launched=before.x;
    if(launched!==null&&events.some(e=>e.type==='land')&&w.player.x+w.player.w>room.pit.right)landed=w.player.x;
    if(landed!==null&&w.player.onGround&&w.player.x>=room.pit.right)return {launched,landed};
    if(w.player.y>room.height)break;
  }
  return null;
}
assert.equal(actualRoom.pit.right-actualRoom.pit.left,85);
assert.ok(actualRoom.labels.some(l=>l.text==='85px 구덩이'));
const left=actualRoom.solids.find(s=>s.x===0&&s.y===490);
const right=actualRoom.solids.find(s=>s.x===actualRoom.pit.right&&s.y===490);
assert.equal(left.x+left.w,actualRoom.pit.left);assert.equal(right.x,actualRoom.pit.right);
let count=0;
for(const hero of ['ethan','noah']) {
  const result=cross(hero,actualRoom,450);
  assert.ok(result,hero+' must cross the actual 85px pit');
  console.log(`PASS ${hero} crosses actual 85px pit: jump x=${result.launched.toFixed(2)}, land x=${result.landed.toFixed(2)}`);count++;
}
const wide=structuredClone(actualRoom);
wide.pit.right=wide.pit.left+145;
const floor=wide.solids.find(s=>s.x===actualRoom.pit.right&&s.y===490);
floor.x=wide.pit.right;floor.w=wide.width-floor.x;
for(const hero of ['ethan','noah']) {
  const winning=[];
  for(let jumpAt=390;jumpAt<=500;jumpAt++)if(cross(hero,wide,jumpAt))winning.push(jumpAt);
  assert.equal(winning.length>0,hero==='noah');
  console.log(`PASS ${hero} old 145px comparison: ${winning.length}/111 crossing thresholds`);count++;
}
console.log(`${count}/${count} room traversal checks passed`);
