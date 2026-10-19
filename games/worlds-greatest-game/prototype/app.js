(() => {
  'use strict';
  const { Match, C, render } = WGG;
  const match = new Match(), canvas = document.querySelector('#arena'), ctx = canvas.getContext('2d');
  const sound = new WGG.Sound();
  const $ = s => document.querySelector(s);
  const options = { reduced: matchMedia('(prefers-reduced-motion: reduce)').matches };
  const flow=new WGG.RoundFlow(match);let flowStarted=false;
  function restart(){options.preview=null;cancelGrab();match.reset();match.tick(performance.now());flow.reset(match.time);flowStarted=true;}
  function choose(hand){
    if(options.preview)restart();
    sound.unlock();match.tick(performance.now());flow.choose(hand);
  }
  $('#motion').checked=options.reduced;
  $('#motion').onchange=e=>{options.reduced=e.target.checked;};
  document.querySelectorAll('[data-hand]').forEach(b=>b.onclick=()=>choose(Number(b.dataset.hand)));
  document.querySelectorAll('[data-pose]').forEach(b=>b.onclick=()=>{cancelGrab();match.reset();flowStarted=false;options.preview={near:$('#poseActor').value==='player',state:b.dataset.pose};});
  $('#poseActor').onchange=()=>{if(options.preview)options.preview.near=$('#poseActor').value==='player';};
  $('#poseExit').onclick=restart;
  function cancelGrab(){const id=match.pointerId;match.release(id,true);if(id!==null&&canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);canvas.style.cursor='grab';}
  $('#reset').onclick=restart;
  $('#mute').onclick=()=>{sound.mute(!sound.muted);$('#mute').textContent=sound.muted?'소리 꺼짐':'소리 켜짐';$('#mute').setAttribute('aria-pressed',String(sound.muted));if(!sound.muted)sound.unlock();};
  function point(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*C.width/r.width,y:(e.clientY-r.top)*C.height/r.height};}
  canvas.addEventListener('pointerdown',e=>{
    if(e.button!==0)return;
    if(options.preview)return;
    sound.unlock();
    if(match.grab(point(e),e.pointerId,performance.now())){canvas.setPointerCapture(e.pointerId);canvas.style.cursor='grabbing';}
  });
  canvas.addEventListener('pointermove',e=>{
    const p=point(e);
    if(match.held&&(p.x<0||p.y<0||p.x>C.width||p.y>C.height)){cancelGrab();return;}
    const samples=e.getCoalescedEvents?.()||[];
    for(const sample of samples.length?samples:[e])match.move(point(sample),e.pointerId,sample.timeStamp);
  });
  function release(e){match.release(e.pointerId,e.type!=='pointerup');if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);canvas.style.cursor='grab';}
  canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',release);
  canvas.addEventListener('pointerleave',e=>{match.hover(null,e.timeStamp);if(match.held)release(e);});
  window.addEventListener('blur',cancelGrab);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelGrab();});
  function resize(){const d=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(canvas.clientWidth*d);canvas.height=Math.round(canvas.clientWidth*C.height/C.width*d);}
  new ResizeObserver(resize).observe(canvas);resize();
  window.addEventListener('keydown',e=>{if(e.key==='Escape')cancelGrab();if(e.repeat||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.target.isContentEditable)return;if(['1','2','3'].includes(e.key))choose(Number(e.key)-1);});
  function frame(now){
    match.tick(now);
    if(!options.preview&&WGG.art.ready){if(!flowStarted){flow.reset(now);flowStarted=true;}flow.update();}
    options.countdown=!options.preview&&flowStarted&&match.phase==='select'?flow.count:0;
    for(const event of match.drainEvents())sound.play(event);
    const visual=Object.create(match);
    if(match.phase==='resolve'&&['hit','hurt','block','guarded'].includes(match.result))visual.time=Math.max(match.resolvedAt,match.time-C.hitstopMs);
    ctx.setTransform(canvas.width/C.width,0,0,canvas.height/C.height,0,0);render(ctx,visual,options);
    document.querySelectorAll('[data-hand]').forEach(b=>{b.disabled=!WGG.art.ready||match.phase!=='select';b.setAttribute('aria-pressed',String(!options.preview&&flow.queued===Number(b.dataset.hand)));});
    const resultCopy={hit:'뿅! · 명중',block:'깡! · 방어',guarded:'깡! · 상대가 막았습니다',hurt:'뿅! · 피격',miss:'휙 · 빗나감 / 공격 기회 종료',tie:'동시에 손을 거두었습니다',foul:`삐익! · 파울: ${match.reason}`};
    $('#status').textContent=match.phase==='end'?(match.energy.enemy===0?'연수 경기 종료 · 도전자 승리':'연수 경기 종료 · 최주임 승리'):match.phase==='resolve'?resultCopy[match.result]:match.phase==='select'?'가위 · 바위 · 보를 선택하세요.':match.phase==='reveal'?'양쪽 손을 보세요.':'손을 보고 직접 판단하세요. 손잡이를 누른 채 움직이세요.';
    if(options.preview)$('#status').textContent='정지 포즈 · '+(options.preview.near?'주인공':'최주임')+' · '+({'hammer-pickup':'망치 잡기','hammer-lift':'망치 들기','hammer-strike':'망치 내려치기','pot-pickup':'냄비 잡기','pot-wear':'냄비 착용'})[options.preview.state];
    else if(options.countdown)$('#status').textContent=options.countdown+' · '+(flow.queued===null?'가위 · 바위 · 보를 고르세요.':['가위','바위','보'][flow.queued]+' 준비 · 카운트가 끝나면 공개합니다.');
    else if(match.phase==='resolve')$('#status').textContent+=' · 곧 다음 판';
    $('#playerScore').textContent=match.energy.player;$('#enemyScore').textContent=match.energy.enemy;
    $('#round').textContent=`연수 경기 · ROUND ${String(match.round).padStart(2,'0')}`;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
