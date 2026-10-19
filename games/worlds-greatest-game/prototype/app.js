(() => {
  'use strict';
  const { Match, C, render } = WGG;
  const match = new Match(), canvas = document.querySelector('#arena'), ctx = canvas.getContext('2d');
  const $ = s => document.querySelector(s);
  const options = { reduced: matchMedia('(prefers-reduced-motion: reduce)').matches };
  $('#motion').checked=options.reduced;
  $('#motion').onchange=e=>{options.reduced=e.target.checked;};
  document.querySelectorAll('[data-hand]').forEach(b=>b.onclick=()=>match.choose(Number(b.dataset.hand)));
  $('#reset').onclick=()=>match.reset();
  function resize(){const d=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(canvas.clientWidth*d);canvas.height=Math.round(canvas.clientWidth*C.height/C.width*d);}
  new ResizeObserver(resize).observe(canvas);resize();
  window.addEventListener('keydown',e=>{if(e.repeat||/INPUT|BUTTON|SUMMARY/.test(e.target.tagName))return;if(['1','2','3'].includes(e.key))match.choose(Number(e.key)-1);});
  function frame(now){
    match.tick(now);
    ctx.setTransform(canvas.width/C.width,0,0,canvas.height/C.height,0,0);render(ctx,match,options);
    document.querySelectorAll('[data-hand]').forEach(b=>b.disabled=match.phase!=='select');
    $('#status').textContent=match.phase==='select'?'가위 · 바위 · 보를 선택하세요.':match.phase==='reveal'?'양쪽 손을 보세요.':'손을 보고 직접 판단하세요. 손잡이를 누른 채 움직이세요.';
    $('#round').textContent=`연수 경기 · ROUND ${String(match.round).padStart(2,'0')}`;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
