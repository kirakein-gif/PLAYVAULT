'use strict';
const assert=require('node:assert/strict');
const api=require('../engine.js'),{Match,C,dist,reach,ik,segmentCircle}=api;
globalThis.WGG=api;require('../render.js');
const {armPose,enemyPose,playerPose}=api;
let count=0;
function test(name,fn){fn();count++;console.log(`PASS ${name}`);}
function round(a=0,b=2){const m=new Match(()=>b/3);m.choose(a);return m;}
const hitWrist={x:C.enemyHead.x,y:C.enemyHead.y+C.hammerLength};
const potWrist={x:C.playerHead.x+C.potOffset,y:C.playerHead.y-C.playerHead.r+7};
function holdPot(m){assert(m.grab(C.potHome,1,10));m.move(potWrist,1,160);m.tick(240);}
function bones(p){assert(Math.abs(dist(p.shoulder,p.elbow)-p.a)<.01);assert(Math.abs(dist(p.elbow,p.wrist)-p.b)<.01);}
test('all nine pairs expose hands and accept action immediately',()=>{
  const expected=[['tie','lose','win'],['win','tie','lose'],['lose','win','tie']];
  for(let a=0;a<3;a++)for(let b=0;b<3;b++){const m=round(a,b);assert.equal(m.rule,expected[a][b]);assert.equal(m.phase,'react');assert.equal(m.reactAt,m.phaseAt);assert.equal(m.player,a);assert.equal(m.enemy,b);}
  const m=round();assert(m.grab(C.hammerHome,1,0));assert.equal(m.result,null);
});
test('fast swept hit scores exactly once',()=>{const m=round();m.grab(C.hammerHome,1,10);m.move(hitWrist,1,160);assert.equal(m.result,'hit');for(let i=0;i<10;i++)m.move(hitWrist,1,170+i);assert.equal(m.score.player,1);});
test('tiny movements, click and slow movement cannot auto-hit',()=>{const m=round();m.grab(C.hammerHome,1,10);m.move({x:C.hammerHome.x+2,y:C.hammerHome.y-1},1,30);assert.equal(m.result,null);m.move(hitWrist,1,950);assert.equal(m.result,null);m.release(1);assert.equal(m.result,'miss');});
test('pointer ownership and safe cancellation',()=>{const m=round();m.grab(C.hammerHome,5,10);m.move(hitWrist,9,160);assert.equal(m.tool.x,C.hammerHome.x);assert(!m.release(9));m.release(5,true);assert.equal(m.held,null);assert.equal(m.result,null);});
test('pot alignment then held defense',()=>{const m=round(0,1);holdPot(m);assert(m.equipped);m.tick(C.enemyStrikeMs);assert.equal(m.result,'block');assert.equal(m.score.enemy,0);});
test('pot release or leaving head removes defense',()=>{for(const release of [true,false]){const m=round(0,1);holdPot(m);if(release)m.release(1);else m.move(C.potHome,1,300);assert(!m.equipped);m.tick(C.enemyStrikeMs);assert.equal(m.result,'hurt');}});
test('late pot cannot retroactively defend',()=>{const m=round(0,1);m.grab(C.potHome,1,10);m.move(potWrist,1,C.enemyStrikeMs);assert.equal(m.result,'hurt');});
test('wrong tool, tie and early grabs foul only once',()=>{for(const [b,home]of [[2,C.potHome],[1,C.hammerHome],[0,C.hammerHome]]){const m=round(0,b);m.grab(home,1,10);assert.equal(m.result,'foul');m.grab(home,1,20);assert.equal(m.score.enemy,1);}const m=new Match();m.grab(C.hammerHome,1,0);assert.equal(m.reason,'조기 출발');});
test('opponent pot blocks a late valid swing',()=>{const m=round();m.grab(C.hammerHome,1,C.enemyGuardMs+10);m.move(hitWrist,1,C.enemyGuardMs+160);assert.equal(m.result,'guarded');});
test('timeout, tie and short recovery gate',()=>{let m=round();m.tick(C.reactMs);assert.equal(m.result,'miss');assert(!m.next());m.tick(C.reactMs+C.recoverMs);assert(m.next());assert.equal(m.phase,'select');m=round(0,0);m.tick(C.tieMs);assert.equal(m.result,'tie');assert(C.recoverMs<=300);});
test('three-point ending and reset',()=>{const m=new Match();for(let i=0;i<3;i++){m.grab(C.hammerHome,1,m.time);m.tick(m.time+C.recoverMs);if(i<2)assert(m.next());}assert.equal(m.phase,'end');m.reset();assert.equal(m.phase,'select');assert.equal(m.score.enemy,0);});
test('bounded player arm includes near, far and zero-distance targets',()=>{assert(C.upperArm<=180&&C.forearm<=180);for(const target of [C.hammerHome,C.potHome,potWrist,hitWrist,C.shoulder,{x:-1000,y:2000}]){const wrist=reach(target);bones({shoulder:C.shoulder,elbow:ik(C.shoulder,wrist),wrist,a:C.upperArm,b:C.forearm});}assert(segmentCircle({x:250,y:230},{x:700,y:230},C.enemyHead,C.enemyHead.r));});
test('AI arms never stretch during attack, guard or recovery',()=>{for(const rule of ['win','lose'])for(let t=0;t<=C.reactMs;t+=10){const m={phase:'react',rule,time:t,reactAt:0};bones(enemyPose(m));}for(const result of ['hurt','block','guarded'])for(let t=0;t<=500;t+=10)bones(enemyPose({phase:'resolve',result,time:t,resolvedAt:0}));
  const strike=enemyPose({phase:'react',rule:'lose',time:C.enemyStrikeMs,reactAt:0});assert(Math.abs(strike.wrist.x-C.playerHead.x)<.01);assert(Math.abs(strike.wrist.y-C.hammerLength-C.playerHead.y)<.01);
  const block=enemyPose({phase:'react',rule:'lose',time:C.enemyStrikeMs,reactAt:0,equipped:true});assert(Math.abs(block.wrist.y-C.hammerLength-potWrist.y)<.01);
});
test('idle has no exposed hands, one arm switches from RPS to tool then withdraws',()=>{
  const m=new Match(()=>2/3);assert(!playerPose(m).visible);assert(!enemyPose(m).visible);
  m.choose(0);assert.equal(playerPose(m).mode,'rps');assert.equal(enemyPose(m).mode,'rps');
  assert.equal(playerPose(m).value,0);assert.equal(enemyPose(m).value,2);
  m.grab(C.hammerHome,1,10);assert.equal(playerPose(m).mode,'tool');assert.equal(playerPose(m).value,null);
  m.move(hitWrist,1,160);assert.equal(playerPose(m).mode,'recover');assert(!enemyPose(m).visible);
  m.tick(460);assert(!playerPose(m).visible);assert(!enemyPose(m).visible);
});
test('same shoulder and fixed bones serve RPS, carrying and recovery',()=>{for(const b of [1,2]){const m=round(0,b);for(let t=0;t<1000;t+=10){m.tick(t);const p=playerPose(m),e=enemyPose(m);bones(p);bones(e);assert.deepEqual(p.shoulder,C.shoulder);assert.deepEqual(e.shoulder,C.enemyShoulder);}}});
test('AI reaches the shared tabletop before taking either prop',()=>{
  let m=round(0,1);m.tick(449);assert.equal(enemyPose(m).mode,'reach');assert.equal(enemyPose(m).kind,null);
  m.tick(450);let p=enemyPose(m);assert.equal(p.kind,'hammer');assert(dist(p.wrist,C.hammerHome)<.01);
  m=round();m.tick(C.enemyGuardMs-370);p=enemyPose(m);assert.equal(p.kind,'pot');assert(dist(p.wrist,C.potHome)<.01);
});
test('sparse and dense input produce the same valid swing',()=>{for(const steps of [1,4,8,16]){const m=round();m.grab(C.hammerHome,1,10);for(let i=1;i<=steps;i++)m.move({x:C.hammerHome.x+(hitWrist.x-C.hammerHome.x)*i/steps,y:C.hammerHome.y+(hitWrist.y-C.hammerHome.y)*i/steps},1,10+180*i/steps);assert.equal(m.result,'hit',`samples=${steps}`);}});
console.log(`${count} scenarios passed`);
