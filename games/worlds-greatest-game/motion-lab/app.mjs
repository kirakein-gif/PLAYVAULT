import * as T from './vendor/three.module.min.js';
import { C, DURATIONS, REFERENCE } from './config.mjs';
import { V, vec, buildRig, spring, violations, clamp, rad, ease } from './kinematics.mjs';
import { idle, motionFrame, stages } from './motion.mjs';
import { Match, Strike, Equip } from './rules.mjs';
import { createScene } from './scene.mjs';
import { DirectInput } from './input.mjs';
import { toolPoses, poseFrame } from './poses.mjs';
const $=id=>document.getElementById(id),canvas=$('scene');
const scene=createScene(canvas),[player,enemy]=scene.actors,m=new Match();
const sim={time:0,mode:'game',demo:'small',demoTime:0,playing:false,slow:false,debug:false,violationCount:0,
  pointer:null,attached:false,impact:-Infinity,hitstop:0,controller:null,loaded:false,peakSeen:false,inputViolations:0,maxRatio:0};
const hand=idle()[0],velocity=new V(),progress=new V(),progressVelocity=new V();
let lastTime=performance.now(),lastTip=null,enemyTip=null,enemyStrike=new Strike(),resolvedSeen=null;
const frameTimes=[],enemyEquip=new Equip();let sampleStart=lastTime,uiAt=0;
const liveTime=()=>sim.time+(sim.hitstop>0?0:Math.max(0,performance.now()-lastTime)/1000*(sim.slow?.25:1));
const showEnd=()=>C.timing.pump*2+C.timing.reveal;
function setTimeline(kind){
  $('timeline').replaceChildren(...stages(kind).map(([s,a,b])=>{const el=document.createElement('span');el.textContent=s;el.style.flex=b-a;el.title=`${a.toFixed(3)}–${b.toFixed(3)} s`;el.dataset.start=a;el.dataset.end=b;return el;}));
  $('time').max=stages(kind).at(-1)[2];
}
function settings(){
  C.timing.pump=clamp(Number($('beat').value)||.45,.25,.9);C.input.snapMax=clamp(Number($('snap').value)||0,0,35);
  $('beat').value=C.timing.pump;$('snap').value=C.input.snapMax;
  setTimeline(sim.demo);
  $('reference').innerHTML=REFERENCE.map(([n,a,b,v],i)=>`<tr><td>${n}</td><td>${a.toFixed(2)}–${b.toFixed(2)}</td><td>${(i===0?C.timing.pump:v).toFixed(3)}</td></tr>`).join('');
}
$('beat').onchange=settings;$('snap').oninput=settings;settings();
function selectionUI(){document.querySelectorAll('[data-hand]').forEach(b=>b.classList.toggle('selected',m.selection===+b.dataset.hand));}
function choose(n){m.choose(n,liveTime());selectionUI();ui();}
document.querySelectorAll('[data-hand]').forEach(b=>b.onclick=()=>choose(+b.dataset.hand));
window.addEventListener('keydown',e=>{if(e.target.matches('input,select'))return;if('123'.includes(e.key))choose(+e.key-1);if(e.key==='Escape')release(true);});
function release(cancel=false){
  const id=sim.pointer;sim.pointer=null;
  if(id!==null&&canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);
  m.now=sim.time;m.release(cancel);sim.attached=false;lastTip=null;scene.aim.visible=false;
}
function clearTools(){
  release(true);enemyEquip.reset();Object.values(scene.tools).forEach(t=>t.reset());Object.values(scene.enemyTools).forEach(t=>t.g.visible=false);
  enemyTip=null;lastTip=null;enemyStrike=new Strike();hand.copy(idle()[0]);velocity.set(0,0,0);progress.set(0,0,0);progressVelocity.set(0,0,0);
  sim.controller=null;sim.loaded=false;sim.peakSeen=false;sim.loadPose=null;sim.contactPose=null;
  sim.hitstop=0;sim.impact=-Infinity;
}
function start(){
  sim.mode='game';sim.playing=false;clearTools();m.start(liveTime());resolvedSeen=null;
  sim.frozenPlayer=null;sim.frozenEnemy=null;sim.frozenKind=null;sim.frozenEnemyKind=null;
  $('mode').textContent='직접 조작';$('start').textContent='다시 시작 ↗';selectionUI();ui();
}
$('start').onclick=start;
$('camera').onchange=()=>{scene.cameraMode(+$('camera').value);$('camera-name').textContent=['오른쪽 어깨 바로 뒤','측면','상대 시점'][scene.cam];release(true);};
$('bones').onchange=()=>sim.debug=$('bones').checked;
$('slow').onchange=()=>sim.slow=$('slow').checked;
function demo(kind){sim.mode='demo';clearTools();m.phase='idle';sim.demo=kind;sim.demoTime=0;sim.playing=true;setTimeline(kind);$('mode').textContent='상대 동작 · 단독 재생';}
$('play').onclick=()=>demo($('motion').value);$('motion').onchange=()=>demo($('motion').value);
$('pause').onclick=()=>{sim.playing=!sim.playing;$('pause').textContent=sim.playing?'일시정지':'계속 재생';};
$('time').oninput=()=>{if(sim.mode!=='demo')demo($('motion').value);sim.playing=false;sim.demoTime=+$('time').value;};
function guide(kind){
  const home=player.local(scene.tools[kind].home),r=canvas.getBoundingClientRect();
  const points=toolPoses(kind,home).map(([p,pose],i)=>{
    const f=poseFrame(pose),offset=kind==='hammer'?new V(0,C.hammerLength*Math.cos(rad(pose.pitch)),C.hammerLength*Math.sin(rad(pose.pitch))):new V(.19,.035,-.18);
    const screen=scene.screen(i===0?scene.tools[kind].home:player.world(f.targets[0].clone().add(offset)));
    return {p,x:clamp(screen.x,r.left+30,r.right-30),y:clamp(screen.y,r.top+45,r.bottom-30),label:i===0?'잡기':kind==='pot'?'머리 위':i===1?'장전':i===2?'펴기':'정수리'};
  });
  if(kind==='hammer'){
    const a=points[1],b=points[2],d=Math.hypot(b.x-a.x,b.y-a.y),min=C.input.minGuideSegmentPixels;
    if(d>1e-6&&d<min){b.x=clamp(a.x+(b.x-a.x)*min/d,r.left+30,r.right-30);b.y=clamp(a.y+(b.y-a.y)*min/d,r.top+45,r.bottom-30);}
  }
  return points;
}
function onMove(event){
  if(event.pointerId!==sim.pointer||!m.held||!sim.controller)return;
  const events=event.getCoalescedEvents?.()||[];
  for(const e of events.length?events:[event]){
    const previousViolations=sim.controller.violations;sim.controller.move(e.clientX,e.clientY,sim.loaded);
    sim.maxRatio=Math.max(sim.maxRatio,sim.controller.maxRatio);
    sim.inputViolations+=sim.controller.violations-previousViolations;
  }
}
canvas.addEventListener('pointerdown',e=>{
  if(e.button!==0||sim.mode!=='game'||sim.pointer!==null)return;
  let chosen=null,best=30;
  for(const [kind,t] of Object.entries(scene.tools)){const p=scene.screen(t.home),d=Math.hypot(e.clientX-p.x,e.clientY-p.y);if(d<best){best=d;chosen=kind;}}
  if(!chosen)return;
  m.tick(liveTime());if(!m.grab(chosen,liveTime()))return;
  sim.pointer=e.pointerId;canvas.setPointerCapture(e.pointerId);sim.attached=false;sim.loaded=false;sim.peakSeen=false;
  sim.home=player.local(scene.tools[chosen].home);sim.controller=new DirectInput(chosen,sim.home,guide(chosen),{x:e.clientX,y:e.clientY});
  progress.set(0,0,0);progressVelocity.set(0,0,0);e.preventDefault();
});
canvas.addEventListener('pointermove',onMove);
canvas.addEventListener('pointerup',e=>{if(e.pointerId===sim.pointer)release(false);});
canvas.addEventListener('pointercancel',()=>release(true));
canvas.addEventListener('lostpointercapture',()=>{if(sim.pointer!==null)release(true);});
canvas.addEventListener('pointerleave',()=>{if(sim.pointer!==null&&!canvas.hasPointerCapture(sim.pointer))release(true);});
window.addEventListener('blur',()=>release(true));document.addEventListener('visibilitychange',()=>{if(document.hidden)release(true);});
window.addEventListener('resize',()=>{release(true);scene.resize();});scene.resize();clearTools();
function animate(dt){
  sim.time+=dt;const heldAtStart=m.held;
  if(sim.mode==='game')m.tick(sim.time);
  let pf={targets:idle(),reveal:0},ef={targets:idle(),reveal:0},kind=null,approachKind=null,et=0;
  if(sim.mode==='demo'){
    if(sim.playing)sim.demoTime=Math.min(sim.demoTime+dt,+$('time').max);
    ef=motionFrame(sim.demo,sim.demoTime,0,enemy.local(scene.enemyTools[sim.demo==='hammer'?'hammer':'pot'].home));kind=ef.tool;
  }else if(m.phase==='count'||m.phase==='reveal'){
    pf=motionFrame('small',sim.time-m.at,m.selection??1);ef=motionFrame($('enemy-rps').value,sim.time-m.at,m.enemy);
  }else if(m.phase==='react'){
    const age=sim.time-m.reactAt;
    pf=motionFrame('small',showEnd()+age,m.selection);ef=motionFrame($('enemy-rps').value,showEnd()+age,m.enemy);
    if(m.rule==='lose'&&age>=C.timing.enemyStart){et=age-C.timing.enemyStart;ef=motionFrame('hammer',et,1,enemy.local(scene.enemyTools.hammer.home));kind='hammer';}
    const guardStart=C.timing.enemyGuard-C.equip.seconds-DURATIONS[$('enemy-pot').value];
    if(m.rule==='win'&&age>=guardStart){et=age-guardStart;ef=motionFrame($('enemy-pot').value,et,1,enemy.local(scene.enemyTools.pot.home));kind='pot';}
    if(kind&&$('enemy-rps').value==='large'){
      const from=motionFrame('large',showEnd()+(kind==='hammer'?C.timing.enemyStart:guardStart),m.enemy),p=ease(et/C.timing.return);
      ef.targets[1]=from.targets[1].clone().lerp(idle()[1],p);ef.lean=from.lean+(ef.lean-from.lean)*p;ef.twist=from.twist*(1-p);
    }
    const grabAt=m.rule==='lose'?C.timing.enemyStart:guardStart;
    if(m.rule!=='tie'&&age>=grabAt-C.timing.enemyReach&&age<grabAt){
      approachKind=m.rule==='lose'?'hammer':'pot';const from=motionFrame($('enemy-rps').value,showEnd()+grabAt-C.timing.enemyReach,m.enemy);
      ef={...from,targets:from.targets.map(p=>p.clone()),poles:[],stage:'잡으러'};
      ef.targets[0].lerp(enemy.local(scene.enemyTools[approachKind].home),ease((age-grabAt+C.timing.enemyReach)/C.timing.enemyReach));ef.grips=[0,0];
    }
  }else if(m.phase==='result'){
    const p=ease((sim.time-m.resolvedAt)/.28);
    if(sim.frozenPlayer)pf={...sim.frozenPlayer,targets:sim.frozenPlayer.targets.map((v,i)=>v.clone().lerp(idle()[i],p)),grips:[1-p,0]};
    if(sim.frozenEnemy)ef={...sim.frozenEnemy,targets:sim.frozenEnemy.targets.map((v,i)=>v.clone().lerp(idle()[i],p))};
    if(p<1)kind=sim.frozenEnemyKind;else Object.values(scene.tools).forEach(t=>t.reset());
  }
  if(m.held){
    if(!sim.attached){
      spring(hand,velocity,sim.home,dt);pf={targets:[hand.clone(),idle()[1]],grips:[0,0]};
      if(hand.distanceTo(sim.home)<.012){sim.attached=true;sim.attachedAt=sim.time;}
    }else{
      spring(progress,progressVelocity,new V(sim.controller.progress,sim.controller.steer,0),dt);
      progress.x=clamp(progress.x,0,m.held==='hammer'&&!sim.loaded?C.input.loadProgress:1);
      pf=sim.controller.frame(progress.x,clamp(progress.y,-C.input.maxSteerDegrees,C.input.maxSteerDegrees));pf.grips=[ease((sim.time-sim.attachedAt)/C.gripSeconds),0];
      velocity.copy(pf.targets[0]).sub(hand).divideScalar(Math.max(dt,1e-6));hand.copy(pf.targets[0]);
      scene.aim.position.copy(player.world(sim.controller.frame().targets[0]));scene.aim.visible=sim.debug;
    }
    sim.actualPitch=(pf.toolPitch||0)+(m.held==='hammer'?clamp(-velocity.y*C.input.snapGain,-C.input.snapMax,C.input.snapMax):0);
  }else if(m.phase==='count'||m.phase==='reveal'){hand.copy(pf.targets[0]);velocity.set(0,0,0);}
  const impactAge=sim.time-sim.impact;
  if(impactAge>=0&&impactAge<.45){const bounce=Math.sin(Math.PI*clamp(impactAge/.45,0,1))*20;if(sim.impactSide==='player')pf.neck=bounce;else ef.neck=bounce;}
  player.update(buildRig(pf.targets,pf),sim.debug);enemy.update(buildRig(ef.targets,ef),sim.debug);
  if(m.held==='hammer'&&sim.attached){
    const a=player.rig.arms[0];
    if(progress.x>=C.input.loadProgress-C.input.loadTolerance&&a.inner>=70&&a.inner<=85&&a.hand.y>a.shoulder.y){sim.loaded=true;if(!sim.loadPose||Math.abs(a.inner-77)<Math.abs(sim.loadPose.inner-77))sim.loadPose={inner:a.inner,lift:a.lift,hand:a.hand.toArray(),shoulder:a.shoulder.toArray()};}
    if(sim.loaded&&a.inner>=155&&a.lift>=100)sim.peakSeen=true;
  }
  Object.values(scene.enemyTools).forEach(t=>t.g.visible=false);
  if(approachKind){const t=scene.enemyTools[approachKind];t.reset();t.g.scale.x=-1;t.g.visible=true;if(approachKind==='hammer'){t.pitch=90;t.g.quaternion.setFromEuler(new T.Euler(rad(90),0,0));}}
  if(kind){const t=scene.enemyTools[kind];t.g.visible=true;t.attach(enemy,0,ef.toolPitch||0,dt);if(kind==='pot')enemyEquip.step(t.tip(),t.normal(),enemy.world(enemy.rig.crown),sim.time);}
  if(m.phase==='result'&&sim.frozenKind&&sim.time-m.resolvedAt<.28)scene.tools[sim.frozenKind].attach(player,0,sim.actualPitch||0,dt);
  if(m.held&&sim.attached){
    const tool=scene.tools[m.held];tool.attach(player,0,sim.actualPitch,dt);const tip=tool.tip();
    if(m.held==='pot')m.equip.step(tip,tool.normal(),player.world(player.rig.crown),sim.time);
    else if(lastTip&&m.strike.step(lastTip,tip,dt,enemy.world(enemy.rig.crown)))m.resolve(enemyEquip.ready?'guarded':'hit',sim.time);
    lastTip=tip;
  }
  if(sim.mode==='game'&&m.phase==='react'&&kind==='hammer'){
    const tip=scene.enemyTools.hammer.tip();if(enemyTip&&enemyStrike.step(enemyTip,tip,dt,player.world(player.rig.crown)))m.resolve(m.equip.ready?'block':'hurt',sim.time);enemyTip=tip;
  }
  if(m.phase==='result'&&resolvedSeen!==m.resolvedAt){
    const a=player.rig.arms[0];sim.contactPose={inner:a.inner,lift:a.lift,elapsed:sim.time-m.reactAt,hand:a.hand.toArray(),tip:heldAtStart?scene.tools[heldAtStart].tip().toArray():null};
    resolvedSeen=m.resolvedAt;sim.frozenPlayer=pf;sim.frozenEnemy=ef;sim.frozenKind=heldAtStart;sim.frozenEnemyKind=kind;sim.impact=sim.time;sim.impactSide=m.result==='hit'?'enemy':'player';
    if(['hit','hurt','block'].includes(m.result))sim.hitstop=C.timing.hitstop;release(true);
  }
  sim.violationCount+=violations(player.rig)+violations(enemy.rig);sim.pf=pf;sim.ef=ef;sim.stage=ef.stage||'대기';
}
function cue(){
  const result={hit:'정수리 명중',hurt:'피격',block:'방어 성공',guarded:'상대 방어',foul:`파울: ${m.reason}`,tie:'무승부',miss:'빗나감'};
  const counting=m.phase==='count'||m.phase==='reveal';
  $('cue').className='cue'+(counting?' count':m.phase==='result'?' result':'');
  const count=m.phase==='reveal'?['0','보']:sim.time-m.at<C.timing.pump?['2','가위']:['1','바위'];
  $('cue').textContent=sim.mode==='demo'?`${sim.stage} · ${sim.demoTime.toFixed(2)} s`:counting?`${count[0]} ${count[1]}`:m.phase==='react'?'':m.phase==='result'?result[m.result]:'준비되면 한 판 시작';
  $('cue').hidden=m.phase==='react'&&sim.mode==='game';
  $('beat').disabled=['count','reveal','react'].includes(m.phase);
}
function ui(){
  cue();$('round').textContent=`ROUND ${String(m.round||1).padStart(2,'0')}`;
  $('grab-status').textContent=m.equip.ready?'냄비 착용 · 유지 중':m.held?`${m.held==='hammer'?'망치':'냄비'} · ${sim.attached?(sim.loaded?'장전 통과 · 펴기 → 정수리':'안내선을 따라 드래그'):'손 뻗는 중'}`:m.selection===null?'매 판 0 전까지 새로 선택하세요':'마우스 누름 = 잡기 · 놓음 = 해제';
  $('violations').textContent=`관절 ${sim.violationCount} · 입력 ${sim.inputViolations} 위반`;
  $('angles').innerHTML=[player,enemy].flatMap(a=>a.rig.arms.map((r,i)=>`<tr><td>${a===player?'나':'상대'} ${i===0?'기본 손':'반대 손'}</td><td>${r.inner.toFixed(1)}° / ${r.flex.toFixed(1)}°</td><td>${r.lift.toFixed(1)}°</td><td>${r.wristFlex.toFixed(1)}° · ${r.wristSide.toFixed(1)}°</td><td>${a.rig.neck.toFixed(1)}°</td></tr>`)).join('');
  const r=canvas.getBoundingClientRect();
  for(const [kind,t] of Object.entries(scene.tools)){const el=$(kind+'-label'),p=scene.screen(t.home);el.style.left=`${p.x-r.left}px`;el.style.top=`${p.y-r.top}px`;el.hidden=!!m.held||sim.mode==='demo';}
  const hp=scene.screen(player.world(player.rig.crown));$('head-label').style.left=`${hp.x-r.left}px`;$('head-label').style.top=`${hp.y-r.top}px`;
  const g=$('guides');g.setAttribute('viewBox',`0 0 ${r.width} ${r.height}`);g.toggleAttribute('hidden',!m.held||!sim.controller);
  if(m.held&&sim.controller){const pts=sim.controller.points;g.innerHTML=`<polyline points="${pts.map(p=>`${p.x-r.left},${p.y-r.top}`).join(' ')}"/>`+pts.slice(1).map(p=>`<circle cx="${p.x-r.left}" cy="${p.y-r.top}" r="7"/><text x="${p.x-r.left+11}" y="${p.y-r.top+4}">${p.label}</text>`).join('');}
  if(sim.mode==='demo'){$('time').value=sim.demoTime;$('time-label').textContent=`${sim.demoTime.toFixed(2)} s`;document.querySelectorAll('#timeline span').forEach(el=>el.classList.toggle('active',sim.demoTime>=+el.dataset.start&&sim.demoTime<=+el.dataset.end));$('phase').textContent=`${sim.stage} · 전체 ${Number($('time').max).toFixed(3)} s`;}
}
function frame(now){
  const frameMs=now-lastTime,realDt=Math.min(frameMs/1000,.1);lastTime=now;frameTimes.push(frameMs);if(frameTimes.length>600)frameTimes.shift();
  let dt=realDt*(sim.slow?.25:1);if(sim.hitstop>0){sim.hitstop-=realDt;dt=0;}
  if(dt>0){const n=Math.ceil(dt/.008);for(let i=0;i<n;i++)animate(dt/n);}
  cue();if(now-uiAt>40){ui();uiAt=now;}
  if(now-sampleStart>1000){const avg=frameTimes.reduce((a,b)=>a+b,0)/frameTimes.length;$('fps').textContent=`${Math.round(1000/avg)} FPS · ${avg.toFixed(1)} ms`;sampleStart=now;}
  scene.render();requestAnimationFrame(frame);
}
animate(.001);ui();requestAnimationFrame(frame);
window.motionLab={
  state:()=>({phase:m.phase,result:m.result,reason:m.reason,held:m.held,attached:sim.attached,equipped:m.equip.ready,rule:m.rule,enemy:m.enemy,selection:m.selection,time:sim.time,eventTime:liveTime(),at:m.at,zeroAt:m.zeroAt,reactAt:m.reactAt,
    violations:sim.violationCount,inputViolations:sim.inputViolations,maxTargetRatio:sim.maxRatio,maxAllowedRatio:C.input.maxTargetMetersPerPixel,camera:scene.cam,stage:sim.stage,
    loaded:sim.loaded,loadPose:sim.loadPose,contactPose:sim.contactPose,peakSeen:sim.peakSeen,progress:progress.x,requestedProgress:sim.controller?.progress,
    playerArm:{inner:player.rig.arms[0].inner,lift:player.rig.arms[0].lift,neck:player.rig.neck,hand:player.rig.arms[0].hand.toArray()},handReveal:sim.pf?.reveal||0,
    requestedHand:sim.controller?.frame().targets[0].toArray(),tip:m.held?scene.tools[m.held].tip().toArray():null,
    playerCrown:player.world(player.rig.crown).toArray(),enemyCrown:enemy.world(enemy.rig.crown).toArray(),
    fps:frameTimes.length/(frameTimes.reduce((a,b)=>a+b,0)/1000)}),
  project:p=>scene.screen(vec(p)),guide:kind=>guide(kind),visibility:()=>({head:scene.visibility(enemy.world(enemy.rig.head)),hand:scene.visibility(enemy.world(enemy.rig.arms[0].hand))}),
  targets:()=>({hammer:scene.screen(scene.tools.hammer.home),pot:scene.screen(scene.tools.pot.home),enemy:scene.screen(enemy.world(enemy.rig.crown)),player:scene.screen(player.world(player.rig.crown))})
};
