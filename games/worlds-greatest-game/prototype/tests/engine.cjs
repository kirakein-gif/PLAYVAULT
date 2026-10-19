'use strict';
const assert=require('node:assert/strict');
const {Match,C,outcome,segmentCircle,ik,dist}=require('../engine.js');
let count=0;
function test(name,fn){fn();count++;console.log(`PASS ${name}`);}
function round(a=0,b=2){const m=new Match(()=>b/3);m.choose(a);m.tick(C.revealMs);return m;}
function holdPot(m){m.grab(C.potHome,1,700);m.move({x:335,y:355},1,900);m.tick(1040);}
test('all nine RPS combinations and simultaneous gate',()=>{for(let a=0;a<3;a++)for(let b=0;b<3;b++){let m=new Match(()=>b/3);m.choose(a);assert.equal(m.rule,outcome(a,b));m.tick(C.revealMs-1);assert.equal(m.phase,'reveal');m.tick(C.revealMs);assert.equal(m.phase,'react');}});
test('fast swept contact scores exactly once',()=>{let m=round();m.grab(C.hammerHome,1,700);m.move({x:795,y:310},1,850);assert.equal(m.result,'hit');for(let i=0;i<10;i++)m.move({x:795,y:310},1,860+i);assert.equal(m.score.player,1);});
test('click, tiny movement, slow drag do not hit',()=>{let m=round();m.grab(C.hammerHome,1,700);m.move({x:522,y:569},1,720);assert.equal(m.result,null);m.move({x:795,y:310},1,2200);assert.equal(m.result,null);m.release(1);assert.equal(m.result,'miss');});
test('wrong pointer cannot move or release grip',()=>{let m=round();m.grab(C.hammerHome,5,700);m.move({x:795,y:310},9,850);assert.equal(m.tool.x,520);assert.equal(m.release(9),false);assert.equal(m.held,'hammer');});
test('pot must align then remain held through strike',()=>{let m=round(0,1);holdPot(m);assert(m.equipped);m.tick(650+C.enemyStrikeMs);assert.equal(m.result,'block');assert.equal(m.score.enemy,0);});
test('pot release and leaving head remove defense',()=>{for(const release of [true,false]){let m=round(0,1);holdPot(m);if(release)m.release(1);else m.move({x:700,y:500},1,1100);assert(!m.equipped);m.tick(650+C.enemyStrikeMs);assert.equal(m.result,'hurt');}});
test('pot on target at attack deadline is too late',()=>{let m=round(0,1);m.grab(C.potHome,1,700);m.move({x:335,y:355},1,650+C.enemyStrikeMs);assert.equal(m.result,'hurt');});
test('wrong tool, tie and early grabs foul once',()=>{for(const [a,b,home]of [[0,2,C.potHome],[0,1,C.hammerHome],[0,0,C.hammerHome]]){let m=round(a,b);m.grab(home,1,700);assert.equal(m.result,'foul');m.grab(home,1,710);assert.equal(m.score.enemy,1);}let m=new Match();m.grab(C.hammerHome,1,0);assert.equal(m.reason,'조기 출발');});
test('late valid swing meets opponent pot',()=>{let m=round();m.grab(C.hammerHome,1,700);m.move({x:795,y:310},1,650+C.enemyGuardMs+100);assert.equal(m.result,null);m.move({x:795,y:445},1,3030);m.move({x:795,y:310},1,3120);assert.equal(m.result,'guarded');});
test('timeout, tie, cancellation and recovery',()=>{let m=round();m.grab(C.hammerHome,1,700);m.release(1,true);assert.equal(m.held,null);m.tick(650+C.reactMs);assert.equal(m.result,'miss');assert(!m.next());m.tick(m.resolvedAt+C.recoverMs);assert(m.next());assert.equal(m.phase,'select');m=round(0,0);m.tick(650+C.tieMs);assert.equal(m.result,'tie');});
test('three-point match terminates, reset clears stale tools',()=>{let m=new Match();for(let i=0;i<3;i++){m.grab(C.hammerHome,1,m.time);m.tick(m.time+C.recoverMs);if(i<2)assert(m.next());}assert.equal(m.phase,'end');m.reset();assert.equal(m.phase,'select');assert.equal(m.score.enemy,0);assert.equal(m.held,null);});
test('continuous segment catches skipped target and IK lengths hold',()=>{assert(segmentCircle({x:600,y:215},{x:1000,y:215},C.enemyHead,56));for(const wrist of [C.hammerHome,{x:795,y:310},{x:335,y:355}]){const e=ik(C.shoulder,wrist);assert(Math.abs(dist(e,C.shoulder)-C.upperArm)<.01);assert(Math.abs(dist(e,wrist)-C.forearm)<.01);}});
console.log(`${count} scenarios passed`);
