'use strict';
const assert=require('node:assert/strict'),{Match,C}=require('../engine.js'),RoundFlow=require('../round-flow.js');
let count=0;
function test(name,fn){fn();count++;console.log('PASS '+name);}
function start(){const m=new Match(()=>2/3);return {m,f:new RoundFlow(m)};}
test('3 2 1 preserves hidden hands and reveals the latest queued choice exactly at zero',()=>{
  const {m,f}=start();assert.equal(f.count,3);f.choose(1);m.tick(1000);f.update();assert.equal(f.count,2);assert.equal(m.enemy,null);f.choose(0);m.tick(2000);f.update();assert.equal(f.count,1);assert.equal(m.player,null);m.tick(2999);f.update();assert.equal(m.phase,'select');m.tick(3000);f.update();assert.equal(m.phase,'react');assert.equal(m.player,0);assert.equal(m.reactAt,3000);
});
test('no choice waits; late choice begins reaction at the current time',()=>{
  const {m,f}=start();m.tick(5000);f.update();assert.equal(m.phase,'select');assert.equal(f.count,0);f.choose(2);assert.equal(m.phase,'react');assert.equal(m.reactAt,5000);
});
test('result automatically starts one new countdown and keeps energy',()=>{
  const {m,f}=start();f.choose(0);m.tick(3000);f.update();m.grab(C.potHome,1,3010);assert.equal(m.energy.player,75);m.tick(3010+C.autoNextMs-1);f.update();assert.equal(m.phase,'resolve');m.tick(3010+C.autoNextMs);f.update();assert.equal(m.phase,'select');assert.equal(m.round,2);assert.equal(m.energy.player,75);assert.equal(f.count,3);assert.equal(f.queued,null);
});
test('depleted energy stops the loop and queued selections cannot change live hands',()=>{
  const {m,f}=start();f.choose(0);m.tick(3000);f.update();assert(!f.choose(1));assert.equal(m.player,0);m.score.enemy=C.targetScore-1;m.grab(C.potHome,1,3010);m.tick(10000);f.update();assert.equal(m.phase,'end');assert.equal(m.energy.player,0);assert.equal(m.round,1);
});
test('restarting discards the previous queued hand and restores a full countdown',()=>{
  const {m,f}=start();f.choose(1);m.reset();m.tick(500);f.reset(m.time);assert.equal(f.queued,null);assert.equal(f.count,3);m.tick(3500);f.update();assert.equal(m.phase,'select');
});
console.log(count+' flow scenarios passed');
