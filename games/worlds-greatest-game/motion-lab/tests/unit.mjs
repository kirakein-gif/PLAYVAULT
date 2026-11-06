import assert from 'node:assert/strict';
import { C, DURATIONS, REFERENCE } from '../config.mjs';
import { V, buildRig, solveArm, fingers, violations, spring } from '../kinematics.mjs';
import { motionFrame, stages } from '../motion.mjs';
import { Strike, Equip, Match, outcome } from '../rules.mjs';
import { Scene } from '../vendor/three.module.min.js';
import { Actor, Tool } from '../scene.mjs';
import { toolFrame } from '../poses.mjs';
import { DirectInput } from '../input.mjs';
let passed=0;
function test(name,fn){fn();console.log(`PASS ${name}`);passed++;}
let seed=20261106;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};
test('10,000 seeded 3D goals: fixed bones, elbow hemisphere, limits, finite values',()=>{
  for(let i=0;i<10000;i++){
    const goals=[0,1].map(()=>new V((random()-.5)*6,(random()-.2)*4,(random()-.5)*6));
    const rig=buildRig(goals,{lean:random()*30,twist:(random()-.5)*80,neck:random()*40,wrists:{0:{flex:(random()-.5)*500,side:(random()-.5)*500}}});
    assert.equal(violations(rig),0,`sample ${i}`);
    assert.ok(Math.abs(rig.pelvis.distanceTo(rig.lower)-.27)<1e-6);
    assert.ok(Math.abs(rig.lower.distanceTo(rig.chest)-.29)<1e-6);
    for(const a of rig.arms)assert.ok(a.hand.toArray().every(Number.isFinite));
    const s=new V(-.18,1.2,0),p=new V(-.7,.7,.1),a=solveArm(s,goals[0],p);
    const dir=a.hand.clone().sub(s).normalize(),bend=p.clone().sub(s);bend.addScaledVector(dir,-bend.dot(dir));
    // Pole fixes the bend side; exclude shoulder-limited cases from this assertion.
    if(a.lift<149.9)assert.ok(a.elbow.clone().sub(s).dot(bend)>=-1e-8);
  }
});
test('10,000 dense script frames: no bone scaling or range violations',()=>{
  for(const kind of ['small','large','hammer','one','two'])for(let i=0;i<2000;i++){
    const t=i/1999*stages(kind).at(-1)[2],f=motionFrame(kind,t);
    assert.equal(violations(buildRig(f.targets,f)),0,`${kind} ${t}`);
  }
});
test('scissors = thumb + index; rock curled; paper has five extended fingers',()=>{
  assert.deepEqual(fingers(0).map(f=>f.open),[true,true,false,false,false]);
  assert.ok(fingers(1).every(f=>f.curl===85));assert.ok(fingers(2).every(f=>f.open));
  assert.ok(fingers(0)[0].spread>0);assert.ok(fingers(2)[1].spread>fingers(2)[4].spread);
});
test('no hand leak before last 0.1 seconds of reveal, including opposite hand',()=>{
  for(const k of ['small','large'])for(const shape of [0,2]){
    for(let t=0;t<1.02;t+=.005){const f=motionFrame(k,t,shape);assert.equal(f.reveal,0);}
    assert.equal(motionFrame(k,1.12,shape).reveal,1);
    if(k==='large')assert.equal(motionFrame(k,1.12,0).shapes[1],0);
  }
});
test('all default motion timings inside reference ±0.05s',()=>{
  for(const [name,a,b,n] of REFERENCE)assert.ok(n>=a-.05&&n<=b+.05,name);
  assert.ok(DURATIONS.hammer>=.65&&DURATIONS.hammer<=.8);
  assert.ok(Math.abs(C.timing.enemyStart+DURATIONS.hammer-1.05)<1e-9);
});
test('authored keyframes reconstruct measured inner angles and upper-arm lift',()=>{
  for(const [k,t,inner,lift] of [['small',0,50,62.5],['small',.225,75,62.5],['small',1.12,80,62.5],['large',1.12,130,55],['hammer',.4,77,92],['hammer',.55,165,108],['hammer',.73,165,95],['one',.285,55,75],['two',.365,65,100]]){
    const f=motionFrame(k,t),r=buildRig(f.targets,f),a=r.arms[k==='large'?1:0];
    assert.ok(Math.abs(a.inner-inner)<1e-6,`${k} elbow`);assert.ok(Math.abs(a.lift-lift)<1e-6,`${k} upper`);
  }
});
test('actual rendered lagged wrist stays bounded and tool socket stays on hand',()=>{
  const scene=new Scene(),actor=new Actor(scene,0,0,'test'),tool=new Tool(scene,'hammer',new V());
  for(let i=0;i<1000;i++){
    const r=buildRig([new V((random()-.5)*2,random()*2,random()),new V(.2,1,.2)]);
    actor.update(r);tool.attach(actor,0,(random()-.5)*300,1/120);
    assert.equal(violations(r),0);assert.ok(tool.g.position.distanceTo(actor.world(r.arms[0].hand))<1e-9);
  }
});
test('mirrored opponent one/two-hand pot sockets cover its real crown',()=>{
  for(const kind of ['one','two']){
    const scene=new Scene(),actor=new Actor(scene,-C.seatZ,0,'enemy');actor.group.scale.x=-1;actor.group.updateMatrixWorld(true);
    const tool=new Tool(scene,'pot',new V());
    const f=motionFrame(kind,DURATIONS[kind]);actor.update(buildRig(f.targets,f));
    for(let i=0;i<30;i++)tool.attach(actor,0,0,1/120);
    assert.ok(tool.tip().distanceTo(actor.world(actor.rig.crown))<C.equip.radius,kind);
    assert.ok(tool.normal().y>Math.cos(C.equip.maxTilt*Math.PI/180));
  }
});
test('critical spring reaches 90% within 80ms at 30, 60 and 144Hz',()=>{
  for(const hz of [30,60,144]){const p=new V(),v=new V(),target=new V(1,0,0);let t=0;
    while(t<.08){const dt=Math.min(1/hz,.08-t);spring(p,v,target,dt);t+=dt;}
    assert.ok(p.x>=.9&&p.x<=1);}
});
test('crown sweep hit, once only; reject face, low speed, upward and short path',()=>{
  const crown=new V(0,1.6,0),from=new V(0,2,0),to=new V(0,1.6,0);
  const strike=new Strike();assert.ok(strike.step(from,to,.15,crown));assert.equal(strike.step(from,to,.15,crown),false);
  assert.equal(new Strike().step(new V(0,1.40,.4),new V(0,1.3,0),.1,crown),false);
  assert.equal(new Strike().step(from,to,1,crown),false);
  assert.equal(new Strike().step(new V(0,1.3,0),crown,.1,crown),false);
  assert.equal(new Strike().step(new V(0,1.7,0),crown,.05,crown),false);
});
test('pot needs 3D location, normal and dwell; leaving or releasing clears defense',()=>{
  const e=new Equip(),p=new V(0,1.6,0),n=new V(0,1,0);
  assert.equal(e.step(p,n,p,0),false);assert.equal(e.step(p,n,p,.071),true);
  assert.equal(e.step(new V(.3,1.6,0),n,p,.1),false);
  assert.equal(e.step(p,new V(1,0,0),p,.3),false);
});
test('RPS cyclic rule; wrong tool, tie tool and early grab are fouls',()=>{
  assert.equal(outcome(0,2),'win');assert.equal(outcome(1,0),'win');assert.equal(outcome(2,1),'win');
  for(const [selection,tool] of [[2,'pot'],[0,'hammer'],[1,'pot']]){const m=new Match(()=>.5);m.start(0);m.choose(selection,.1);m.tick(1.13);assert.equal(m.grab(tool,1.14),false);assert.equal(m.result,'foul');assert.notEqual(m.reason,'늦은 손');}
  const m=new Match();m.start(0);m.grab('hammer',.1);assert.equal(m.result,'foul');assert.equal(m.resolve('hit',.2),false);
});
test('2-1-0 deadline: just-before, at/after-zero foul, last choice, no carry',()=>{
  for(const beat of [.25,.45,.9]){
    const saved=C.timing.pump;C.timing.pump=beat;
    const m=new Match(()=>.5);m.start(0);assert.equal(m.selection,null);assert.ok(m.choose(0,beat*2-.001));m.tick(beat*2);assert.equal(m.phase,'reveal');
    m.tick(beat*2+C.timing.reveal);assert.equal(m.phase,'react');
    m.start(10);assert.equal(m.selection,null);m.tick(10+beat*2);assert.equal(m.result,'foul');assert.equal(m.reason,'늦은 손');
    m.start(20);m.choose(0,20+.01);m.choose(2,20+beat*2-.001);m.tick(20+beat*2+.23);assert.equal(m.selection,2);assert.equal(m.rule,'win');
    m.start(30);assert.equal(m.choose(1,30+beat*2+.001),false);assert.equal(m.result,'foul');
    for(const k of ['small','large'])for(let t=0;t<beat*2-.1;t+=.001)assert.equal(motionFrame(k,t,2).reveal,0);
    C.timing.pump=saved;
  }
});
test('pot joint interpolation never folds past 55 degrees, including 0.15s',()=>{
  for(let i=0;i<=1000;i++){const f=motionFrame('one',i/1000*C.timing.potOne),a=buildRig(f.targets,f).arms[0];assert.ok(a.inner>=55-1e-6);}
});
test('direct poses have a head-side load, short arc and fixed lengths; no vertical arm',()=>{
  const home=new V(-.31,.91,.26);
  for(let i=0;i<=1000;i++){const f=toolFrame('hammer',i/1000,home),r=buildRig(f.targets,f);assert.equal(violations(r),0);assert.ok(r.arms[0].lift<112);}
  for(const [p,inner,lift] of [[C.input.loadProgress,77,92],[C.input.peakProgress,165,108],[1,165,95]]){
    const f=toolFrame('hammer',p,home),a=buildRig(f.targets,f).arms[0];assert.ok(Math.abs(a.inner-inner)<1e-6);assert.ok(Math.abs(a.lift-lift)<1e-6);
    if(p===C.input.loadProgress){assert.ok(a.hand.y>a.shoulder.y);assert.ok(a.hand.z<.4);}
  }
});
test('10,000 one-pixel moves plus arbitrary jumps: requested hand Lipschitz bound',()=>{
  for(const kind of ['hammer','pot']){
    const points=kind==='hammer'?[{p:0,x:600,y:600},{p:.46,x:720,y:270},{p:.78,x:440,y:180},{p:1,x:340,y:290}]:[{p:0,x:400,y:600},{p:1,x:720,y:280}];
    const c=new DirectInput(kind,new V(-.31,.91,.26),points,points[0]);
    for(let i=0;i<5000;i++){const old=c.frame().targets[0].clone(),oldCursor={...c.cursor};const angle=random()*Math.PI*2;c.move(c.cursor.x+Math.cos(angle),c.cursor.y+Math.sin(angle),true);assert.ok(c.frame().targets[0].distanceTo(old)<=C.input.maxTargetMetersPerPixel+1e-9);}
    c.move(0,0,true);c.move(2000,1000,true);assert.equal(c.violations,0);assert.ok(c.maxRatio<=C.input.maxTargetMetersPerPixel+1e-9);
  }
});
test('load corner latch advances only with fresh cursor input, then reverses',()=>{
  const points=[{p:0,x:400,y:700},{p:.46,x:620,y:220},{p:.78,x:450,y:330},{p:1,x:400,y:500}];
  const c=new DirectInput('hammer',new V(-.31,.91,.52),points,points[0]);
  c.move(points[1].x,points[1].y,false);assert.ok(c.progress<=.46);const stopped=c.progress;
  c.frame();c.frame();assert.equal(c.progress,stopped);
  c.move(points[2].x,points[2].y,true);assert.ok(c.progress>.75);
  c.move(points[3].x,points[3].y,true);assert.ok(c.progress>.98);
  c.move(points[2].x,points[2].y,true);assert.ok(c.progress<.9);assert.equal(c.violations,0);
});
console.log(`${passed}/${passed} unit groups passed.`);
