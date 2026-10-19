(() => {
  'use strict';
  const { Match, C, render } = WGG;
  const match = new Match(), canvas = document.querySelector('#arena'), ctx = canvas.getContext('2d');
  const sound = new WGG.Sound();
  const $ = s => document.querySelector(s);
  const options = { reduced: matchMedia('(prefers-reduced-motion: reduce)').matches };
  $('#motion').checked=options.reduced;
  $('#motion').onchange=e=>{options.reduced=e.target.checked;};
  document.querySelectorAll('[data-hand]').forEach(b=>b.onclick=()=>{sound.unlock();match.choose(Number(b.dataset.hand));});
  function cancelGrab(){const id=match.pointerId;match.release(id,true);if(id!==null&&canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);canvas.style.cursor='grab';}
  $('#reset').onclick=()=>{cancelGrab();match.reset();};
  $('#mute').onclick=()=>{sound.mute(!sound.muted);$('#mute').textContent=sound.muted?'소리 꺼짐':'소리 켜짐';$('#mute').setAttribute('aria-pressed',String(sound.muted));if(!sound.muted)sound.unlock();};
  function point(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*C.width/r.width,y:(e.clientY-r.top)*C.height/r.height};}
  canvas.addEventListener('pointerdown',e=>{
    if(e.button!==0)return;
    sound.unlock();
    if(match.grab(point(e),e.pointerId,performance.now())){canvas.setPointerCapture(e.pointerId);canvas.style.cursor='grabbing';}
  });
  canvas.addEventListener('pointermove',e=>{
    const p=point(e);
    match.hover(p,e.timeStamp);
    if(match.held&&(p.x<0||p.y<0||p.x>C.width||p.y>C.height)){cancelGrab();return;}
    const samples=e.getCoalescedEvents?.()||[];
    for(const sample of samples.length?samples:[e])match.move(point(sample),e.pointerId,sample.timeStamp);
  });
  function release(e){match.release(e.pointerId,e.type!=='pointerup');if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);canvas.style.cursor='grab';}
  canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',release);
  canvas.addEventListener('pointerleave',e=>{match.hover(null,e.timeStamp);if(match.held)release(e);});
  window.addEventListener('blur',cancelGrab);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelGrab();});
  $('#next').onclick=()=>match.next();
  function resize(){const d=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(canvas.clientWidth*d);canvas.height=Math.round(canvas.clientWidth*C.height/C.width*d);}
  new ResizeObserver(resize).observe(canvas);resize();
  window.addEventListener('keydown',e=>{if(e.key==='Escape')cancelGrab();if(e.repeat||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.target.isContentEditable)return;if(['1','2','3'].includes(e.key)){sound.unlock();match.choose(Number(e.key)-1);}});
  function frame(now){
    match.tick(now);
    for(const event of match.drainEvents())sound.play(event);
    const visual=Object.create(match);
    if(match.phase==='resolve'&&['hit','hurt','block','guarded'].includes(match.result))visual.time=Math.max(match.resolvedAt,match.time-C.hitstopMs);
    ctx.setTransform(canvas.width/C.width,0,0,canvas.height/C.height,0,0);render(ctx,visual,options);
    document.querySelectorAll('[data-hand]').forEach(b=>b.disabled=match.phase!=='select');
    const resultCopy={hit:'뿅! · 명중',block:'깡! · 방어',guarded:'깡! · 상대가 막았습니다',hurt:'뿅! · 피격',miss:'휙 · 빗나감 / 공격 기회 종료',tie:'동시에 손을 거두었습니다',foul:`삐익! · 파울: ${match.reason}`};
    $('#status').textContent=match.phase==='end'?(match.score.player>=C.targetScore?'연수 경기 종료 · 도전자 3점':'연수 경기 종료 · 최주임 3점'):match.phase==='resolve'?resultCopy[match.result]:match.phase==='select'?'가위 · 바위 · 보를 선택하세요.':match.phase==='reveal'?'양쪽 손을 보세요.':'손을 보고 직접 판단하세요. 손잡이를 누른 채 움직이세요.';
    $('#next').hidden=match.phase!=='resolve'||match.time-match.resolvedAt<C.recoverMs;
    $('#playerScore').textContent=match.score.player;$('#enemyScore').textContent=match.score.enemy;
    $('#round').textContent=`연수 경기 · ROUND ${String(match.round).padStart(2,'0')}`;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
