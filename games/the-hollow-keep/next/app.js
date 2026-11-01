(async function () {
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
  const isTest=new URLSearchParams(location.search).get('room')==='test';
  let area=null,mapOpen=false,completed=false;
  if(!isTest){
    try{const response=await fetch('areas/area1.json');if(!response.ok)throw Error('area');area=await response.json();}
    catch{notice.textContent='구역을 불러오지 못했습니다. 새로고침해 주세요.';return;}
  }
  function map(value){
    mapOpen=value;document.getElementById('area-map').hidden=!value;document.getElementById('map-toggle').setAttribute('aria-expanded',String(value));input.clear();accumulator=0;last=null;
    if(value){
      const m=S.getMap(world),box=document.getElementById('map-rooms');box.replaceChildren();
      const visited=m.rooms.filter(r=>r.visited);
      if(visited.length){const minX=Math.min(...visited.map(r=>r.pos[0])),minY=Math.min(...visited.map(r=>r.pos[1]));
        for(const r of visited){const cell=document.createElement('div');cell.className='map-room'+(r.id===m.current?' current':'');cell.style.gridColumn=r.pos[0]-minX+1;cell.style.gridRow=r.pos[1]-minY+1;cell.textContent=area.rooms[r.id].name+(r.id===m.current?' · 현재':'');
          const links=document.createElement('small'),grid=area.rooms[r.id].grid;
          const directions=[['←',[-1,0],grid.some(row=>row[0]!=='#')],['→',[1,0],grid.some(row=>row[31]!=='#')],['↑',[0,-1],/[^#]/.test(grid[0])],['↓',[0,1],/[^#]/.test(grid[17])]];
          links.textContent=directions.filter(([,d,open])=>open&&visited.some(other=>other.pos[0]===r.pos[0]+d[0]&&other.pos[1]===r.pos[1]+d[1])).map(([arrow])=>arrow).join(' ');cell.append(links);box.append(cell);}}
      document.getElementById('map-progress').textContent=completed?'모든 방과 장치를 확인하고 성문으로 돌아왔습니다.':area?`방문 ${visited.length}/${m.rooms.length} · 열쇠 ${Object.values(S.getFlags(world).keys).reduce((a,b)=>a+b,0)} · 시작 방으로 돌아오는 길을 찾아보세요.`:'시험 방 · 지도 없음';
      document.getElementById('map-close').focus();
    }else canvas.focus();
  }
  document.getElementById('map-toggle').addEventListener('click',()=>map(!mapOpen));
  document.getElementById('map-close').addEventListener('click',()=>map(false));
  window.addEventListener('keydown',e=>{if(e.code==='KeyM'&&!e.repeat&&!e.target.closest('input,textarea,select')){e.preventDefault();map(!mapOpen);}else if(e.code==='Escape'&&mapOpen)map(false);});
  function reset(hero = world ? world.active : 'ethan') {
    world = S.createWorld(area?{area,hero}:{room,spawn:{x:35,y:490-S.CONFIG.heroes[hero].height},hero});
    completed=false;mapOpen=false;document.getElementById('area-map').hidden=true;document.getElementById('map-toggle').setAttribute('aria-expanded','false');
    document.getElementById('reset').textContent=area?'구역 초기화':'방 초기화';
    notice.textContent=area?world.room.hint||area.rooms[world.roomId].hint:'점프 높이와 두 무기의 거리를 비교해 보세요.';
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
  document.getElementById('reset').addEventListener('click',()=>{reset();canvas.focus();notice.textContent=area?'구역과 장치를 처음 상태로 되돌렸습니다.':'방과 표적을 초기화했습니다.';});
  function fields() {
    const container=document.getElementById('config-fields');container.replaceChildren();
    const groups = [['공통', S.CONFIG, ['swapCooldownTicks']], ...Object.entries(S.CONFIG.heroes).map(([hero,c]) => [hero.toUpperCase(),c,
      ['climbSpeed','runSpeed','airControlSpeed','stopTicks','jumpHeight','minJumpHeight','variableJump','gravity','maxFall','coyoteTicks','jumpBufferTicks','accelerationGround','accelerationAir','friction']]),
      ...Object.entries(S.CONFIG.heroes).map(([hero,c])=>[hero.toUpperCase()+' 무기',c.weapon,['damage','range','cooldownTicks','activeTicks',...(c.weapon.kind==='projectile'?['speed']:[])]])];
    const labels={climbSpeed:'사다리 속도',swapCooldownTicks:'교대 대기(틱)',runSpeed:'최고 속도',airControlSpeed:'공중 조작 속도',stopTicks:'정지 상한(틱)',jumpHeight:'점프 높이',minJumpHeight:'짧은 점프 높이',variableJump:'짧은 점프 사용',gravity:'중력',maxFall:'최대 낙하',coyoteTicks:'코요테(틱)',jumpBufferTicks:'버퍼(틱)',accelerationGround:'지상 가속 비율',accelerationAir:'공중 가속 비율',friction:'마찰 배율',damage:'피해',range:'사거리',cooldownTicks:'공격 간격(틱)',activeTicks:'판정 수명(틱)',speed:'탄속'};
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
    if(!mapOpen && !document.hidden && !portrait.matches && document.hasFocus()){
      accumulator=Math.min(accumulator+elapsed,S.TICK*MAX_TICKS);
      let processed=0;
      while(accumulator>=S.TICK && processed<MAX_TICKS){
        for(const event of S.step(world,input.sample())){
          draw.event(event,world);
          if(event.type==='swap'){name.textContent=world.active==='ethan'?'ETHAN · 빛 / 룬탄':'NOAH · 그림자 / 참격';notice.textContent='교대 · '+world.active.toUpperCase();}
          if(event.type==='swapBlocked')notice.textContent='공간이 좁아 교대할 수 없습니다.';
          if(event.type==='hit'){const d=world.dummies.find(d=>d.id===event.target);if(d)effects.push({x:d.x,y:d.y,damage:event.damage,life:40});notice.textContent=area?`시험 표적 · 피해 ${event.damage}`:`${event.target==='near'?'가까운':'먼'} 표적 · 피해 ${event.damage}`;}
          if(event.type==='room'){effects=[];notice.textContent=area.rooms[world.roomId].hint;}
          if(event.type==='roomBlocked')notice.textContent='건너편 통로가 막혀 있습니다. 연결된 장치를 찾아보세요.';
          if(event.type==='switch')notice.textContent='장치가 켜졌습니다. 연결된 봉쇄물이 열립니다.';
          if(event.type==='denied'){const object=world.room.objects.find(o=>o.id===event.id);notice.textContent=object?.type==='entrance'?'잠긴 출입문입니다. 인장 열쇠가 필요합니다.':'이 장치는 다른 주인공의 능력이 필요합니다.';}
          if(event.type==='pickup')notice.textContent=event.name==='sigil'?'출입문에 쓰는 인장 열쇠를 얻었습니다.':'봉쇄물에 쓰는 청동 열쇠를 얻었습니다.';
          if(event.type==='unlock')notice.textContent='인장 열쇠로 출입문의 잠금을 풀었습니다.';
          if(event.type==='enter')notice.textContent=world.room.name+' · 출입문을 통과했습니다.';
          if(event.type==='door')notice.textContent='봉쇄물이 걷혀 통로가 열렸습니다.';
          if(event.type==='break')notice.textContent='금 간 벽이 무너져 숨은 길이 드러났습니다.';
        }
        if(area&&!completed&&world.roomId===area.start.room&&Object.keys(world.visited).length===Object.keys(area.rooms).length){
          const f=S.getFlags(world),buckets={switch:'switches',door:'doors',breakable:'broken',key:'picked',target:'cleared'};
          completed=Object.values(area.rooms).every(r=>(r.objects||[]).every(o=>o.type==='entrance'?(f.entered[o.id]||f.entered[o.to])&&(!o.lock||f.unlocked[o.id]):f[buckets[o.type]][o.id]));
          if(completed)notice.textContent='모든 방과 장치를 확인하고 성문으로 돌아왔습니다. M으로 지도를 확인하세요.';
        }
        effects=effects.filter(e=>--e.life>0);accumulator-=S.TICK;processed++;
        if(!area && S.getPlayer(world).y>room.height+80){reset();notice.textContent='구덩이 · 시험 방을 다시 시작합니다.';break;}
      }
    }else accumulator=0;
    draw(world,debug,effects);
    if(debug){const p=S.getPlayer(world);telemetry.textContent=`${world.active} | vx ${p.vx.toFixed(2)} vy ${p.vy.toFixed(2)} | onGround ${p.onGround} | coyote ${p.coyote} buffer ${p.jumpBuffer} | ${p.jumpKind || 'ground'} takeoff ${p.takeoffVx.toFixed(2)} | tick ${world.tick}`;}
    requestAnimationFrame(frame);
  }
  reset();fields();setDebug(debug);requestAnimationFrame(frame);
  // Read-only copy for browser diagnostics and recorded-input review.
  window.HKPlaytest={snapshot:()=>S.snapshot(world),artStatus:()=>HKPixel.status(),map:()=>S.getMap(world),flags:()=>S.getFlags(world)};
})();
