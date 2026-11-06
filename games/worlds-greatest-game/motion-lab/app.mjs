import * as T from './vendor/three.module.min.js';
import { C, DURATIONS, REFERENCE } from './config.mjs';
import { V, vec, buildRig, spring, violations, clamp, rad, ease } from './kinematics.mjs';
import { idle, motionFrame, stages } from './motion.mjs';
import { Match, Strike, Equip } from './rules.mjs';
import { createScene } from './scene.mjs';
const $=id=>document.getElementById(id),canvas=$('scene');
const scene=createScene(canvas),[player,enemy]=scene.actors;
const m=new Match();
const sim={time:0,mode:'game',demo:'small',demoTime:0,playing:false,slow:false,debug:false,violationCount:0,pointer:null,attached:false,impact:-Infinity,hitstop:0};
const hand=idle()[0],velocity=new V(),target=hand.clone();
const raycaster=new T.Raycaster(),pointerNDC=new T.Vector2();
let lastTime=performance.now(),lastTip=null,enemyTip=null,enemyStrike=new Strike(),resolvedSeen=null;
const frameTimes=[];let sampleStart=lastTime;
const showEnd=C.timing.pump*2+C.timing.reveal,enemyEquip=new Equip();
function setTimeline(kind){$('timeline').replaceChildren(...stages(kind).map(([s,a,b])=>{const el=document.createElement('span');el.textContent=s;el.style.flex=b-a;el.title=`${a.toFixed(3)}–${b.toFixed(3)} s`;el.dataset.start=a;el.dataset.end=b;return el;}));$('time').max=stages(kind).at(-1)[2];}
setTimeline('small');
$('reference').innerHTML=REFERENCE.map(([n,a,b,v])=>`<tr><td>${n}</td><td>${a.toFixed(2)}–${b.toFixed(2)}</td><td>${v.toFixed(3)}</td></tr>`).join('');
function choose(n){if(m.phase==='count'||m.phase==='idle'||m.phase==='result'){m.selection=n;document.querySelectorAll('[data-hand]').forEach(b=>b.classList.toggle('selected',+b.dataset.hand===n));}}
document.querySelectorAll('[data-hand]').forEach(b=>b.onclick=()=>choose(+b.dataset.hand));
window.addEventListener('keydown',e=>{if(e.target.matches('input,select'))return;if('123'.includes(e.key))choose(+e.key-1);if(e.key==='Escape')release(true);});
function clearTools(){release(true);enemyEquip.reset();Object.values(scene.tools).forEach(t=>t.reset());Object.values(scene.enemyTools).forEach(t=>t.g.visible=false);enemyTip=null;lastTip=null;enemyStrike=new Strike();hand.copy(idle()[0]);target.copy(hand);velocity.set(0,0,0);}
function start(){sim.mode='game';sim.playing=false;clearTools();m.start(sim.time);resolvedSeen=null;sim.frozenPlayer=null;sim.frozenEnemy=null;sim.frozenKind=null;sim.frozenEnemyKind=null;$('mode').textContent='직접 조작';$('start').textContent='다시 시작 ↗';}
$('start').onclick=start;
$('camera').onchange=()=>{scene.cameraMode(+$('camera').value);$('camera-name').textContent=['오른쪽 어깨 너머','측면','상대 시점'][scene.cam];release(true);};
$('bones').onchange=()=>sim.debug=$('bones').checked;
$('slow').onchange=()=>sim.slow=$('slow').checked;
function demo(kind){sim.mode='demo';clearTools();m.phase='idle';sim.demo=kind;sim.demoTime=0;sim.playing=true;setTimeline(kind);$('mode').textContent='상대 동작 · 단독 재생';}
$('play').onclick=()=>demo($('motion').value);
$('motion').onchange=()=>demo($('motion').value);
$('pause').onclick=()=>{sim.playing=!sim.playing;$('pause').textContent=sim.playing?'일시정지':'계속 재생';};
$('time').oninput=()=>{if(sim.mode!=='demo')demo($('motion').value);sim.playing=false;sim.demoTime=+$('time').value;};
function release(cancel=false){
  const id=sim.pointer;sim.pointer=null;
  if(id!==null&&canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);
  m.now=sim.time;m.release(cancel);sim.attached=false;lastTip=null;scene.aim.visible=false;
}
function ray(x,y){const r=canvas.getBoundingClientRect();pointerNDC.set((x-r.left)/r.width*2-1,1-(y-r.top)/r.height*2);raycaster.setFromCamera(pointerNDC,scene.camera);return raycaster.ray;}
function onMove(event){
  if(event.pointerId!==sim.pointer||!m.held)return;
  const events=event.getCoalescedEvents?.()||[];
  for(const e of events.length?events:[event]){
    sim.cursor={x:e.clientX,y:e.clientY};
    const r=ray(e.clientX,e.clientY);
    // Explicit 3D manipulation surfaces: table, enemy crown plane, own crown plane.
    const crown=(m.held==='hammer'?enemy:player).world((m.held==='hammer'?enemy:player).rig.crown);
    const crownScreen=scene.screen(crown), homeScreen=scene.screen(scene.tools[m.held].home);
    const p=new V();
    const high=e.clientY < homeScreen.y-25;
    const plane=high?new T.Plane(new V(0,0,1),-crown.z):new T.Plane(new V(0,1,0),-C.tableY-.07);
    if(!r.intersectPlane(plane,p))continue;
    if(m.held==='hammer'){
      const progress=high?clamp((homeScreen.y-e.clientY-25)/Math.max(30,homeScreen.y-crownScreen.y-25),0,1):0;
      // Wrist snap is velocity driven below. Baseline pitch follows spatial reach.
      sim.pitch=progress*62;
      const offset=new V(0,Math.cos(rad(sim.pitch))*C.hammerLength,-Math.sin(rad(sim.pitch))*C.hammerLength);
      if(high)p.sub(offset);
    }else if(high){p.sub(new V(-.19,.035,.18));sim.pitch=0;}
    sim.requested=player.local(p);scene.aim.position.copy(p);scene.aim.visible=sim.debug;
  }
}
canvas.addEventListener('pointerdown',e=>{
  if(e.button!==0||sim.mode!=='game'||sim.pointer!==null)return;
  let chosen=null,best=30;
  for(const [kind,t] of Object.entries(scene.tools)){const p=scene.screen(t.home),d=Math.hypot(e.clientX-p.x,e.clientY-p.y);if(d<best){best=d;chosen=kind;}}
  if(!chosen)return;
  if(!m.grab(chosen,sim.time))return;
  sim.pointer=e.pointerId;canvas.setPointerCapture(e.pointerId);sim.attached=false;sim.pitch=0;sim.pickupAt=sim.time;
  sim.home=player.local(scene.tools[chosen].home);sim.requested=sim.home.clone();target.copy(sim.home);e.preventDefault();
});
canvas.addEventListener('pointermove',onMove);
canvas.addEventListener('pointerup',e=>{if(e.pointerId===sim.pointer)release(false);});
canvas.addEventListener('pointercancel',()=>release(true));
canvas.addEventListener('lostpointercapture',()=>{if(sim.pointer!==null)release(true);});
canvas.addEventListener('pointerleave',()=>{if(sim.pointer!==null&&!canvas.hasPointerCapture(sim.pointer))release(true);});
window.addEventListener('blur',()=>release(true));
document.addEventListener('visibilitychange',()=>{if(document.hidden)release(true);});
window.addEventListener('resize',()=>{release(true);scene.resize();});
scene.resize();clearTools();
function posture(frame){return buildRig(frame.targets,frame);}
function animate(dt){
  sim.time+=dt;
  const heldAtStart=m.held;
  if(sim.mode==='game')m.tick(sim.time);
  let pf={targets:idle(),reveal:0},ef={targets:idle(),reveal:0},kind=null,approachKind=null,et=0;
  if(sim.mode==='demo'){
    if(sim.playing)sim.demoTime=Math.min(sim.demoTime+dt,+$('time').max);
    ef=motionFrame(sim.demo,sim.demoTime,0,enemy.local(scene.enemyTools[sim.demo==='hammer'?'hammer':'pot'].home));
    kind=ef.tool;et=sim.demoTime;
  } else if(m.phase==='count'){
    pf=motionFrame('small',sim.time-m.at,m.selection);ef=motionFrame($('enemy-rps').value,sim.time-m.at,m.enemy);
  } else if(m.phase==='react'){
    const age=sim.time-m.reactAt;
    pf=motionFrame('small',showEnd+age,m.selection);
    ef=motionFrame($('enemy-rps').value,showEnd+age,m.enemy);
    if(m.rule==='lose'&&age>=C.timing.enemyStart){et=age-C.timing.enemyStart;ef=motionFrame('hammer',et,1,enemy.local(scene.enemyTools.hammer.home));kind='hammer';}
    const guardStart=C.timing.enemyGuard-C.equip.seconds-DURATIONS[$('enemy-pot').value];
    if(m.rule==='win'&&age>=guardStart){et=age-guardStart;ef=motionFrame($('enemy-pot').value,et,1,enemy.local(scene.enemyTools.pot.home));kind='pot';}
    if(kind&&$('enemy-rps').value==='large'){
      const from=motionFrame('large',showEnd+(kind==='hammer'?C.timing.enemyStart:guardStart),m.enemy),p=ease(et/C.timing.return);
      ef.targets[1]=from.targets[1].clone().lerp(idle()[1],p);
      ef.lean=from.lean+(ef.lean-from.lean)*p;ef.twist=from.twist*(1-p);
    }
    const grabAt=m.rule==='lose'?C.timing.enemyStart:guardStart;
    if(m.rule!=='tie'&&age>=grabAt-C.timing.enemyReach&&age<grabAt){
      approachKind=m.rule==='lose'?'hammer':'pot';
      const from=motionFrame($('enemy-rps').value,showEnd+grabAt-C.timing.enemyReach,m.enemy);
      const progress=ease((age-(grabAt-C.timing.enemyReach))/C.timing.enemyReach);
      ef={...from,targets:from.targets.map(p=>p.clone()),poles:[],stage:'잡으러'};
      ef.targets[0].lerp(enemy.local(scene.enemyTools[approachKind].home),progress);
      ef.grips=[0,0];
    }
  } else if(m.phase==='result'){
    const p=ease((sim.time-m.resolvedAt)/.28);
    if(sim.frozenPlayer)pf={...sim.frozenPlayer,targets:sim.frozenPlayer.targets.map((v,i)=>v.clone().lerp(idle()[i],p)),grips:[1-p,0]};
    if(sim.frozenEnemy)ef={...sim.frozenEnemy,targets:sim.frozenEnemy.targets.map((v,i)=>v.clone().lerp(idle()[i],p))};
    if(p<1)kind=sim.frozenEnemyKind;
    if(p===1){Object.values(scene.tools).forEach(t=>t.reset());}
  }
  if(m.held){
    target.copy(sim.attached?sim.requested:sim.home);
    spring(hand,velocity,target,dt);
    if(!sim.attached&&hand.distanceTo(sim.home)<.065){sim.attached=true;sim.attachedAt=sim.time;}
    pf={targets:[hand.clone(),idle()[1]],lean:clamp((hand.z-.27)*44,0,16),
      grips:[sim.attached?ease((sim.time-sim.attachedAt)/C.gripSeconds):0,0],reveal:1,
      neck:m.held==='pot'&&hand.y>1.43?18:0};
    const snap=m.held==='hammer'?clamp(-velocity.y*5,-8,8):0;
    sim.actualPitch=clamp((sim.pitch||0)+snap,-10,70);
  } else if(m.phase==='count'){hand.copy(pf.targets[0]);velocity.set(0,0,0);}
  const impactAge=sim.time-sim.impact;
  if(impactAge>=0&&impactAge<.45){const bounce=Math.sin(Math.PI*clamp(impactAge/.45,0,1))*20;if(sim.impactSide==='player')pf.neck=bounce;else ef.neck=bounce;}
  player.update(posture(pf),sim.debug);enemy.update(posture(ef),sim.debug);
  Object.values(scene.enemyTools).forEach(t=>t.g.visible=false);
  if(approachKind){const t=scene.enemyTools[approachKind];t.reset();t.g.scale.x=-1;t.g.visible=true;if(approachKind==='hammer'){t.pitch=90;t.g.quaternion.setFromEuler(new T.Euler(rad(90),0,0));}}
  if(kind){const t=scene.enemyTools[kind];t.g.visible=true;t.attach(enemy,0,ef.toolPitch||0,dt);if(kind==='pot')enemyEquip.step(t.tip(),t.normal(),enemy.world(enemy.rig.crown),sim.time);}
  if(m.phase==='result'&&sim.frozenKind&&sim.time-m.resolvedAt<.28)scene.tools[sim.frozenKind].attach(player,0,sim.actualPitch||0,dt);
  if(m.held&&sim.attached){
    const tool=scene.tools[m.held];tool.attach(player,0,sim.actualPitch,dt);
    const tip=tool.tip();
    if(m.held==='pot')m.equip.step(tip,tool.normal(),player.world(player.rig.crown),sim.time);
    else if(lastTip&&m.strike.step(lastTip,tip,dt,enemy.world(enemy.rig.crown)))m.resolve(enemyEquip.ready?'guarded':'hit',sim.time);
    lastTip=tip;
  }
  if(sim.mode==='game'&&m.phase==='react'&&kind==='hammer'){
    const tip=scene.enemyTools.hammer.tip();
    if(enemyTip&&enemyStrike.step(enemyTip,tip,dt,player.world(player.rig.crown)))m.resolve(m.equip.ready?'block':'hurt',sim.time);
    enemyTip=tip;
  }
  if(m.phase==='result'&&resolvedSeen!==m.resolvedAt){
    resolvedSeen=m.resolvedAt;sim.frozenPlayer=pf;sim.frozenEnemy=ef;sim.frozenKind=heldAtStart;sim.frozenEnemyKind=kind;sim.impact=sim.time;sim.impactSide=m.result==='hit'?'enemy':'player';
    if(['hit','hurt','block'].includes(m.result))sim.hitstop=C.timing.hitstop;
    release(true);
  }
  sim.violationCount+=violations(player.rig)+violations(enemy.rig);
  sim.pf=pf;sim.ef=ef;sim.stage=ef.stage||'대기';
}
function ui(){
  $('round').textContent=`ROUND ${String(m.round||1).padStart(2,'0')}`;
  const result={hit:'정수리 명중',hurt:'피격',block:'방어 성공',guarded:'상대 방어',foul:'파울',tie:'무승부',miss:'빗나감'};
  $('cue').className='cue'+(m.phase==='count'?' count':m.phase==='result'?' result':'');
  $('cue').textContent=sim.mode==='demo'?`${sim.stage} · ${sim.demoTime.toFixed(2)} s`:m.phase==='count'?(sim.time-m.at<C.timing.pump?'3':sim.time-m.at<C.timing.pump*2?'2':'1'):m.phase==='react'?'':m.phase==='result'?result[m.result]:'준비되면 한 판 시작';
  $('cue').hidden=m.phase==='react'&&sim.mode==='game';
  $('grab-status').textContent=m.equip.ready?'냄비 착용 · 유지 중':m.held?`${m.held==='hammer'?'망치':'냄비'} · ${sim.attached?'잡음 · 드래그 중':'손 뻗는 중'}`:'마우스 누름 = 잡기 · 놓음 = 해제';
  $('violations').textContent=`범위 위반 ${sim.violationCount}`;
  $('angles').innerHTML=[player,enemy].flatMap(a=>a.rig.arms.map((r,i)=>`<tr><td>${a===player?'나':'상대'} ${i===0?'기본 손':'반대 손'}</td><td>${r.inner.toFixed(1)}° / ${r.flex.toFixed(1)}°</td><td>${r.lift.toFixed(1)}°</td><td>${r.wristFlex.toFixed(1)}° · ${r.wristSide.toFixed(1)}°</td><td>${a.rig.neck.toFixed(1)}°</td></tr>`)).join('');
  for(const [kind,t] of Object.entries(scene.tools)){const el=$(kind+'-label'),p=scene.screen(t.home);el.style.left=`${p.x-canvas.getBoundingClientRect().left}px`;el.style.top=`${p.y-canvas.getBoundingClientRect().top}px`;el.hidden=!!m.held||sim.mode==='demo';}
  const hp=scene.screen(player.world(player.rig.crown));$('head-label').style.left=`${hp.x-canvas.getBoundingClientRect().left}px`;$('head-label').style.top=`${hp.y-canvas.getBoundingClientRect().top}px`;
  if(sim.mode==='demo'){$('time').value=sim.demoTime;$('time-label').textContent=`${sim.demoTime.toFixed(2)} s`;document.querySelectorAll('#timeline span').forEach(el=>el.classList.toggle('active',sim.demoTime>=+el.dataset.start&&sim.demoTime<=+el.dataset.end));$('phase').textContent=`${sim.stage} · 전체 ${Number($('time').max).toFixed(3)} s`;}
}
let uiAt=0;
function frame(now){
  const frameMs=now-lastTime,realDt=Math.min(frameMs/1000,.04);lastTime=now;
  frameTimes.push(frameMs);if(frameTimes.length>600)frameTimes.shift();
  let dt=realDt*(sim.slow?.25:1);
  if(sim.hitstop>0){sim.hitstop-=realDt;dt=0;}
  // Substeps avoid tunnelling and preserve springs at 30/60/144Hz.
  if(dt>0){const n=Math.ceil(dt/.008);for(let i=0;i<n;i++)animate(dt/n);}
  if(now-uiAt>70){ui();uiAt=now;}
  if(now-sampleStart>1000){const avg=frameTimes.reduce((a,b)=>a+b,0)/frameTimes.length;$('fps').textContent=`${Math.round(1000/avg)} FPS · ${avg.toFixed(1)} ms`;sampleStart=now;}
  scene.render();requestAnimationFrame(frame);
}
animate(.001);ui();requestAnimationFrame(frame);
// Read-only inspection/projection support. No API sets round outcomes or tool positions.
window.motionLab={state:()=>({phase:m.phase,result:m.result,held:m.held,attached:sim.attached,equipped:m.equip.ready,rule:m.rule,enemy:m.enemy,selection:m.selection,time:sim.time,reactAt:m.reactAt,violations:sim.violationCount,camera:scene.cam,stage:sim.stage,tip:m.held?scene.tools[m.held].tip().toArray():null,playerCrown:player.world(player.rig.crown).toArray(),enemyCrown:enemy.world(enemy.rig.crown).toArray(),fps:frameTimes.length/(frameTimes.reduce((a,b)=>a+b,0)/1000)}),
  project:p=>scene.screen(vec(p)),targets:()=>({hammer:scene.screen(scene.tools.hammer.home),pot:scene.screen(scene.tools.pot.home),enemy:scene.screen(enemy.world(enemy.rig.crown)),player:scene.screen(player.world(player.rig.crown))})};
