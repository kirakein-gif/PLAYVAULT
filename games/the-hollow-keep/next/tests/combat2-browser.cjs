'use strict';
// Recorded real inputs; observations never change the production world.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const area=require('../areas/area1.json'),walk=require('../areas/area1.walkthrough.json');
const url=process.env.HK_URL||'http://127.0.0.1:8766/games/the-hollow-keep/next/';
const out=process.env.HK_SHOT_DIR||path.join(__dirname,'../assets/combat2-review/actual');
const codes={left:'ArrowLeft',right:'ArrowRight',up:'ArrowUp',down:'ArrowDown',jump:'Space',attack:'KeyJ',swap:'KeyQ',interact:'KeyE'};
(async()=>{
 fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 const errors=[];let checks=0;
 try{
  const page=await browser.newPage({viewport:{width:1280,height:900}});page.on('pageerror',e=>errors.push(String(e)));
  await page.clock.install({time:new Date('2026-11-03T03:00:00Z')});await page.clock.pauseAt(new Date('2026-11-03T03:00:01Z'));
  await page.addInitScript(()=>{
   window.__events=[];window.__pending=[];window.__shots={};
   Object.defineProperty(window,'HKSim',{configurable:true,set(sim){const step=sim.step;sim.step=(w,input)=>{
    const events=step(w,input);for(const event of events){window.__events.push({...event,tick:w.tick});if(['blocked','kill','hurt','rest','heal','down'].includes(event.type))window.__pending.push(event.type+'-'+(event.id||event.hero||''));}
    for(const e of sim.getEnemies(w))if(e.stagger)window.__pending.push('stagger-'+e.id);
    return events;};Object.defineProperty(window,'HKSim',{value:sim,writable:true,configurable:true});}});
   const raf=requestAnimationFrame;window.requestAnimationFrame=cb=>raf.call(window,t=>{cb(t);for(const name of window.__pending)if(!window.__shots[name])window.__shots[name]=document.querySelector('canvas').toDataURL();window.__pending=[];});
  });
  await page.goto(url);await page.waitForFunction(()=>window.HKPlaytest);await page.evaluate(()=>HKPixel.ready);await page.locator('canvas').focus();
  const snapshot=()=>page.evaluate(()=>HKPlaytest.snapshot());
  async function ticks(n){
   const target=(await snapshot()).tick+n;
   let previous=-1,stalled=0;
   for(let tries=0;(await snapshot()).tick<target;tries++){
    const current=(await snapshot()).tick;
    stalled=current===previous?stalled+1:0;
    if(stalled>10||tries>100)throw Error('clock stalled '+JSON.stringify(await page.evaluate(()=>({tick:HKPlaytest.snapshot().tick,focus:document.hasFocus(),hidden:document.hidden,map:!document.querySelector('#area-map').hidden}))));
    previous=current;await page.clock.runFor(Math.max(16,(target-current)*16));
   }
  }
  await ticks(1);await page.screenshot({path:path.join(out,'gate-shelter-hud.png')});
  await page.keyboard.press('KeyM');assert.equal(await page.locator('.map-room').count(),1);
  const tick=(await snapshot()).tick;await page.clock.runFor(200);assert.equal((await snapshot()).tick,tick);await page.keyboard.press('KeyM');await page.locator('canvas').focus();
  checks++;console.log('PASS initial map reveals only gate and pauses simulation');
  // Fresh world then exact per-tick recording, including both specific enemies.
  await page.locator('#reset').click();await page.locator('canvas').focus();let held=[];
  for(const part of walk.inputs){const next=part.keys.split(',').filter(Boolean);for(const key of held)if(!next.includes(key))await page.keyboard.up(codes[key]);for(const key of next)if(!held.includes(key))await page.keyboard.down(codes[key]);await ticks(part.ticks);held=next;}
  for(const key of held)await page.keyboard.up(codes[key]);
  const result=await page.evaluate(()=>({world:HKPlaytest.snapshot(),map:HKPlaytest.map(),flags:HKPlaytest.flags(),events:window.__events}));
  assert.equal(result.world.roomId,area.start.room);assert.equal(result.map.rooms.filter(r=>r.visited).length,Object.keys(area.rooms).length);
  const specific=new Set(Object.values(area.rooms).flatMap(r=>r.objects).flatMap(o=>o.open?.cleared||[]));
  for(const room of Object.values(area.rooms))for(const o of room.objects){
   if(o.type==='shelter')continue;
   if(o.type==='enemy'){if(specific.has(o.id)){assert.equal(result.flags.cleared[o.id],true,o.id);assert.ok(result.events.some(e=>e.type==='kill'&&e.id===o.id),o.id+' actual kill');}continue;}
   if(o.type==='entrance'){assert.ok(result.flags.entered[o.id]||result.flags.entered[o.to],o.id);if(o.lock)assert.equal(result.flags.unlocked[o.id],true,o.id);continue;}
   const bucket={switch:'switches',door:'doors',breakable:'broken',key:'picked',target:'cleared'}[o.type];assert.equal(result.flags[bucket][o.id],true,o.id);
  }
  assert.ok(!result.events.some(e=>e.type==='defeat'));assert.equal(result.world.tick,walk.inputs.reduce((n,s)=>n+s.ticks,0));
  assert.match(await page.locator('#notice').textContent(),/모든 방과 장치/);checks++;console.log('PASS exact real keyboard circuit: eight rooms, all mechanisms, two specific kills, zero defeats, completion UI');
  await page.keyboard.press('KeyM');assert.equal(await page.locator('.map-room').count(),8);await page.screenshot({path:path.join(out,'complete-map.png')});await page.keyboard.press('KeyM');
  const shots=await page.evaluate(()=>window.__shots);for(const [name,data]of Object.entries(shots))fs.writeFileSync(path.join(out,name+'.png'),Buffer.from(data.split(',')[1],'base64'));
  fs.writeFileSync(path.join(out,'events.json'),JSON.stringify(result,null,2));
  await page.keyboard.press('F2');for(const key of ['공통.hurtInvulnTicks','공통.downSwapInvulnTicks','피격 밀림.vy','ETHAN.maxHp','SHIELD 적.staggerTicks'])assert.equal(await page.locator('input[data-key="'+key+'"]').count(),1);
  await page.locator('input[data-key="피격 밀림.vy"]').fill('-5');await page.locator('input[data-key="피격 밀림.vy"]').dispatchEvent('change');assert.equal(await page.evaluate(()=>HKSim.CONFIG.knockback.vy),-5);await page.locator('#default-config').click();assert.equal(await page.evaluate(()=>HKSim.CONFIG.knockback.vy),-4);
  checks++;console.log('PASS F2 health/invulnerability/knockback/enemy fields accept negative vertical knockback and restore defaults');
  const mobile=await browser.newPage({viewport:{width:780,height:330},deviceScaleFactor:2,isMobile:true,hasTouch:true});mobile.on('pageerror',e=>errors.push(String(e)));await mobile.goto(url);await mobile.evaluate(()=>HKPixel.ready);await mobile.locator('canvas').focus();await mobile.screenshot({path:path.join(out,'mobile-780x330.png')});
  assert.equal(await mobile.locator('[data-action=attack]').isVisible(),true);assert.deepEqual(errors,[]);checks++;console.log('PASS mobile 780x330 loads new HUD and sprites without browser errors');
 }finally{await browser.close();}
 console.log(`${checks}/${checks} combat2 browser checks passed`);
})().catch(e=>{console.error(e);process.exitCode=1;});
