(function () {
  'use strict';
  const S = window.HKSim, canvas = document.getElementById('game');
  const input = HKInput(canvas), draw = HKRender(canvas), defaults = JSON.parse(JSON.stringify(S.CONFIG));
  const panel = document.getElementById('debug'), toggle = document.getElementById('debug-toggle');
  const telemetry = document.getElementById('telemetry'), notice = document.getElementById('notice');
  const name = document.getElementById('hero-name');
  const portrait = matchMedia('(orientation:portrait) and (pointer:coarse)');
  const MAX_TICKS = 8;
  let debug = new URLSearchParams(location.search).get('debug') === '1';
  let world, effects = [], accumulator = 0, last = null;
  const room = window.HKRoom;
  function reset(hero = world ? world.active : 'ethan') {
    world = S.createWorld({room,spawn:{x:35,y:490-S.CONFIG.heroes[hero].height},hero});
    effects = []; input.clear(); accumulator = 0; last = null;
    name.textContent = world.active === 'ethan' ? 'ETHAN · 빛 / 룬탄' : 'NOAH · 그림자 / 참격';
  }
  function setDebug(value) {
    debug=value; panel.hidden=!value;toggle.setAttribute('aria-expanded',String(value));
  }
  toggle.addEventListener('click',()=>setDebug(!debug));
  window.addEventListener('keydown',e=>{
    if ((e.code === 'F2' || e.code === 'Backquote') && !e.target.closest('input,textarea,select')) {
      e.preventDefault(); if (!e.repeat) setDebug(!debug);
    }
  });
  document.getElementById('reset').addEventListener('click',()=>{reset();canvas.focus();notice.textContent='방과 표적을 초기화했습니다.';});
  function fields() {
    const container=document.getElementById('config-fields');container.replaceChildren();
    const groups = [['공통', S.CONFIG, ['swapCooldownTicks']], ...Object.entries(S.CONFIG.heroes).map(([hero,c]) => [hero.toUpperCase(),c,
      ['runSpeed','airControlSpeed','stopTicks','jumpHeight','minJumpHeight','variableJump','gravity','maxFall','coyoteTicks','jumpBufferTicks','accelerationGround','accelerationAir','friction']]),
      ...Object.entries(S.CONFIG.heroes).map(([hero,c])=>[hero.toUpperCase()+' 무기',c.weapon,['damage','range','cooldownTicks','activeTicks',...(c.weapon.kind==='projectile'?['speed']:[])]])];
    const labels={swapCooldownTicks:'교대 대기(틱)',runSpeed:'최고 속도',airControlSpeed:'공중 조작 속도',stopTicks:'정지 상한(틱)',jumpHeight:'점프 높이',minJumpHeight:'짧은 점프 높이',variableJump:'짧은 점프 사용',gravity:'중력',maxFall:'최대 낙하',coyoteTicks:'코요테(틱)',jumpBufferTicks:'버퍼(틱)',accelerationGround:'지상 가속 비율',accelerationAir:'공중 가속 비율',friction:'마찰 배율',damage:'피해',range:'사거리',cooldownTicks:'공격 간격(틱)',activeTicks:'판정 수명(틱)',speed:'탄속'};
    for(const [title,obj,keys] of groups){
      const group=document.createElement('fieldset'),legend=document.createElement('legend');legend.textContent=title;group.append(legend);
      for(const key of keys){
        const label=document.createElement('label'),control=document.createElement('input');
        label.append(document.createTextNode(labels[key]));control.dataset.key=title+'.'+key;
        const boolean=typeof obj[key]==='boolean';control.type=boolean?'checkbox':'number';
        if(boolean)control.checked=obj[key];else{
          control.value=obj[key];control.min=key==='runSpeed'?'.02':['coyoteTicks','jumpBufferTicks'].includes(key)?'0':key.includes('Ticks')?'1':'.01';
          control.max=['accelerationGround','accelerationAir','friction'].includes(key)?'1':key.includes('Ticks')?'240':key==='range'?'2000':'500';
          control.step=key.includes('Ticks')?'1':'.01';
          if (key==='airControlSpeed') control.max=(obj.runSpeed-.01).toFixed(2);
        }
        control.addEventListener('change',()=>{
          if(!boolean && (!control.checkValidity() || !Number.isFinite(control.valueAsNumber))){control.value=obj[key];return;}
          obj[key]=boolean?control.checked:control.valueAsNumber;
          const hero=Object.values(S.CONFIG.heroes).find(c=>c===obj);
          if(hero){
            if(hero.minJumpHeight>hero.jumpHeight)hero.minJumpHeight=hero.jumpHeight;
            if(hero.airControlSpeed>=hero.runSpeed)hero.airControlSpeed=Math.max(.01,Number((hero.runSpeed*.45).toFixed(2)));
            fields();
          }
          reset();document.getElementById('config-message').textContent='수치를 적용하고 방을 초기화했습니다.';
        });
        label.append(control);group.append(label);
      }
      container.append(group);
    }
  }
  document.getElementById('default-config').addEventListener('click',()=>{Object.assign(S.CONFIG,JSON.parse(JSON.stringify(defaults)));fields();reset();});
  document.getElementById('copy-config').addEventListener('click',async()=>{
    const value=JSON.stringify(S.CONFIG,null,2),out=document.getElementById('config-export'),message=document.getElementById('config-message');
    out.value=value;out.hidden=false;
    try{await navigator.clipboard.writeText(value);message.textContent='현재 CONFIG를 복사했습니다.';}
    catch{out.focus();out.select();message.textContent='아래 선택된 JSON을 직접 복사해 주세요.';}
  });
  function suspend(){input.clear();accumulator=0;last=null;}
  window.addEventListener('blur',suspend);document.addEventListener('visibilitychange',suspend);portrait.addEventListener('change',suspend);
  function reflow(){accumulator=0;last=null;input.relayout();}
  window.addEventListener('resize',reflow);document.addEventListener('fullscreenchange',reflow);
  function frame(time){
    if(last===null)last=time;
    const elapsed=Math.max(0,(time-last)/1000);last=time;
    if(!document.hidden && !portrait.matches && document.hasFocus()){
      accumulator=Math.min(accumulator+elapsed,S.TICK*MAX_TICKS);
      let processed=0;
      while(accumulator>=S.TICK && processed<MAX_TICKS){
        for(const event of S.step(world,input.sample())){
          draw.event(event,world);
          if(event.type==='swap'){name.textContent=world.active==='ethan'?'ETHAN · 빛 / 룬탄':'NOAH · 그림자 / 참격';notice.textContent='교대 · '+world.active.toUpperCase();}
          if(event.type==='swapBlocked')notice.textContent='공간이 좁아 교대할 수 없습니다.';
          if(event.type==='hit'){const d=world.dummies.find(d=>d.id===event.target);effects.push({x:d.x,y:d.y,damage:event.damage,life:40});notice.textContent=`${event.target==='near'?'가까운':'먼'} 표적 · 피해 ${event.damage}`;}
        }
        effects=effects.filter(e=>--e.life>0);accumulator-=S.TICK;processed++;
        if(S.getPlayer(world).y>room.height+80){reset();notice.textContent='구덩이 · 시험 방을 다시 시작합니다.';break;}
      }
    }else accumulator=0;
    draw(world,debug,effects);
    if(debug){const p=S.getPlayer(world);telemetry.textContent=`${world.active} | vx ${p.vx.toFixed(2)} vy ${p.vy.toFixed(2)} | onGround ${p.onGround} | coyote ${p.coyote} buffer ${p.jumpBuffer} | ${p.jumpKind || 'ground'} takeoff ${p.takeoffVx.toFixed(2)} | tick ${world.tick}`;}
    requestAnimationFrame(frame);
  }
  reset();fields();setDebug(debug);requestAnimationFrame(frame);
  // Read-only copy for browser diagnostics and recorded-input review.
  window.HKPlaytest={snapshot:()=>S.snapshot(world),artStatus:()=>HKPixel.status()};
})();
